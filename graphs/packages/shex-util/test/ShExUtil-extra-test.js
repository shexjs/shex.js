/** The corners of @shexjs/util that the corpus-driven suites never reach:
 * the AST compiler over every cardinality, dependency walking through
 * negation and inclusion, partitioning with missing referents, proof graphs
 * and walkVal over hand-built results, the CLI's node/shape argument parser,
 * and the SPARQL transport's POST form and its two error shapes. */
"use strict";

const expect = require("chai").expect;
const ShExUtil = require("..");
const ShExParser = require("@shexjs/parser");
const N3 = require("n3");
const {DataFactory: DF} = N3;

const base = "http://a.example/";
const P = n => base + n;
const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const XSD = "http://www.w3.org/2001/XMLSchema#";
const OWL_THING = "http://www.w3.org/2002/07/owl#Thing";
const parse = text => ShExParser.construct(base, {}, {index: true}).parse(`PREFIX : <${base}>\nPREFIX xsd: <${XSD}>\n` + text);

describe("ShExUtil (extra)", function () {

  it("has a version", function () {
    expect(ShExUtil.version()).to.match(/^\d+\.\d+/);
  });

  describe("BiDiClosure", function () {
    it("passes its own self-test", function () {
      ShExUtil.BiDiClosure().test();
    });
    it("trims repeated entries", function () {
      const c = ShExUtil.BiDiClosure();
      c.add(1, 2);
      c.needs[1] = [2, 2, 3, 3];
      c.neededBy[2] = [1, 1];
      c.trim();
      expect(c.needs[1]).to.deep.equal([2, 3]);
      expect(c.neededBy[2]).to.deep.equal([1]);
    });
  });

  describe("getAST", function () {
    it("compiles every cardinality, groups, actions and inclusions", function () {
      const schema = parse(`<T> { $<te> :i . }
<S> { (:a . | :b .+) ; :c .{0,2} ; :d .{2,5} ; :e .* ; :f .? ; :g .{2,} %<http://x.example/>{ act %} ; &<te> ; (:h . ; :j .){0,1} %<http://x.example/>{ grp %} }
<N> IRI`);
      const ast = ShExUtil.getAST(schema);
      expect(ast.type).to.equal("AST");
      const s = ast.shapes[P("S")].expression;
      expect(s.type).to.equal("EachOf");
      const kinds = s.conjuncts.map(c => c.type);
      expect(kinds).to.deep.equal(["Choice", "Choice", "EachOf", "KleeneStar", "Choice", "SemActs", "TripleConstraint", "SemActs"]);
      expect(s.conjuncts[6].predicate, "the inclusion compiles to what it names").to.equal(P("i"));
      expect(s.conjuncts[5].expression.type, "{2,} is two then a star").to.equal("EachOf");
      expect(ast.shapes[P("N")].expression.type, "a node constraint has no expression").to.equal("Epsilon");
    });
    it("refuses an expression of an unknown type", function () {
      const schema = parse("<S> { :a . }");
      schema.shapes[0].shapeExpr.expression = {type: "Bogus"};
      expect(() => ShExUtil.getAST(schema)).to.throw(/unexpected expr type: Bogus/);
    });
  });

  describe("getDependencies", function () {
    it("walks negation, inclusion, extension and restriction", function () {
      const schema = parse(`<S> { :p @<T> ; :q NOT @<N> }
<T> { $<te> :r @<U> }
<U> { &<te> } 
<N> IRI
<E> EXTERNAL
<A> EXTENDS @<S> { :x . }
<R> RESTRICTS @<S> { :y . }`);
      const deps = ShExUtil.getDependencies(schema);
      expect(deps.needs[P("S")]).to.include(P("T"));
      expect(deps.needs[P("S")]).to.include(P("N"));
      expect(deps.needs[P("U")], "an inclusion depends on the labelled expression").to.include(P("te"));
      expect(deps.foundIn[P("te")]).to.equal(P("T"));
      expect(deps.needs[P("A")]).to.include(P("S"));
      expect(deps.needs[P("R")]).to.include(P("S"));
    });
    it("refuses a negated reference cycle", function () {
      const schema = parse("<S> { :p @<T> }\n<T> NOT { :q @<S> }");
      expect(() => ShExUtil.getDependencies(schema)).to.throw(/appears in negated cycle/);
    });
    it("refuses expressions of unknown types", function () {
      const bogusShape = {type: "Schema", shapes: [{type: "ShapeDecl", id: P("S"), shapeExpr: {type: "Bogus"}}]};
      expect(() => ShExUtil.getDependencies(bogusShape)).to.throw(/expected Shape/);
      const bogusTE = {type: "Schema", shapes: [{type: "ShapeDecl", id: P("S"), shapeExpr: {type: "Shape", expression: {type: "Bogus"}}}]};
      expect(() => ShExUtil.getDependencies(bogusTE)).to.throw(/expected \{TripleConstraint,OneOf,EachOf,Inclusion\}/);
    });
  });

  describe("simpleTripleConstraints and getValueType", function () {
    it("lists a shape's constraints when they are flat", function () {
      expect(ShExUtil.simpleTripleConstraints({type: "Shape"})).to.deep.equal([]);
      const one = parse("<S> { :a . }").shapes[0].shapeExpr;
      expect(ShExUtil.simpleTripleConstraints(one).map(tc => tc.predicate)).to.deep.equal([P("a")]);
      const two = parse("<S> { :a . ; :b . }").shapes[0].shapeExpr;
      expect(ShExUtil.simpleTripleConstraints(two).map(tc => tc.predicate)).to.deep.equal([P("a"), P("b")]);
      const nested = parse("<S> { :a . ; (:b . | :c .) }").shapes[0].shapeExpr;
      expect(() => ShExUtil.simpleTripleConstraints(nested)).to.throw(/can't \(yet\) express/);
    });
    it("names a value expression's type", function () {
      expect(ShExUtil.getValueType(P("T"))).to.equal(P("T"));
      expect(ShExUtil.getValueType({reference: P("T")})).to.equal(P("T"));
      expect(ShExUtil.getValueType({nodeKind: "iri"})).to.equal(OWL_THING);
      expect(ShExUtil.getValueType({datatype: XSD + "integer"})).to.equal(XSD + "integer");
      const other = {type: "NodeConstraint", values: ["a"]};
      expect(ShExUtil.getValueType(other)).to.equal(other);
    });
  });

  describe("partition and flatten", function () {
    const schema = parse("<T> { $<te> :a . }\n<S> { :p @<T> ; &<te> }\n<U> { :r . }");
    it("keeps a shape with what it depends on", function () {
      expect(ShExUtil.partition(schema, "http://a.example/S").shapes.map(s => s.id)).to.deep.equal([P("S"), P("T")]);
      expect(ShExUtil.partition(schema, [P("U"), P("U")]).shapes.map(s => s.id), "asked twice, kept once").to.deep.equal([P("U")]);
    });
    it("complains about what it can't find, or tells a callback", function () {
      expect(() => ShExUtil.partition(schema, P("Nope"))).to.throw(/can't find shape supplied dependency http:\/\/a.example\/Nope/);
      const dangling = {type: "Schema", shapes: [{type: "ShapeDecl", id: P("S"), shapeExpr: {type: "Shape", expression: {type: "TripleConstraint", predicate: P("p"), valueExpr: P("Missing")}}}]};
      expect(() => ShExUtil.partition(dangling, P("S"))).to.throw(/can't find shape http:\/\/a.example\/S dependency http:\/\/a.example\/Missing/);
      const complaints = [];
      ShExUtil.partition(dangling, [P("S"), P("Nope")], undefined, (what, why) => complaints.push([what, why]));
      expect(complaints).to.deep.equal([[P("Missing"), P("S")], [P("Nope"), "supplied"]]);
    });
    it("flattens to a copy", function () {
      const copy = ShExUtil.flatten(schema);
      expect(copy.shapes.map(s => s.id)).to.deep.equal(schema.shapes.map(s => s.id));
    });
  });

  describe("getProofGraph", function () {
    const triple = (s, p, o, extra = {}) => Object.assign({type: "TestedTriple", subject: P(s), predicate: P(p), object: P(o)}, extra);
    const tcs = (p, solutions) => ({type: "TripleConstraintSolutions", predicate: P(p), solutions});
    const quads = res => ShExUtil.getProofGraph(res, new N3.Store(), DF).getQuads().map(q => `${q.subject.value} ${q.predicate.value} ${q.object.value}` + (q.graph.value ? " " + q.graph.value : ""));

    it("collects the triples of every result shape", function () {
      const inner = {type: "ShapeTest", solution: tcs("q", [triple("o1", "q", "o2")])};
      const res = {type: "SolutionList", solutions: [
        {type: "ShapeTest", solution: {type: "EachOfSolutions", solutions: [{type: "EachOfSolution", expressions: [
          tcs("p", [triple("s1", "p", "o1", {referenced: inner}), triple("s1", "p", "o3", {graph: P("g")})]),
          {type: "OneOfSolutions", solutions: [{type: "OneOfSolution", expressions: [tcs("r", [triple("s1", "r", "o4")])]}]}
        ]}]}},
        {type: "ShapeTest"}, // <S> {} has no solution
        {type: "NodeConstraintTest"},
        {type: "ShapeOrResults", solution: {type: "ShapeAndResults", solutions: [inner, {type: "ShapeNotResults"}]}},
        {type: "ShapeTest", solution: {type: "ExtendedResults", extensions: {type: "ExtensionResults", solutions: [inner]}, local: tcs("z", [triple("s1", "z", "o5")])}},
        {type: "Recursion"},
      ]};
      expect(quads(res).sort()).to.deep.equal([
        `${P("s1")} ${P("p")} ${P("o1")}`, `${P("o1")} ${P("q")} ${P("o2")}`, `${P("s1")} ${P("p")} ${P("o3")} ${P("g")}`,
        `${P("s1")} ${P("r")} ${P("o4")}`, `${P("s1")} ${P("z")} ${P("o5")}`,
      ].sort());
    });
    it("refuses what it doesn't know", function () {
      expect(() => quads({type: "Bogus"})).to.throw(/unexpected expr type Bogus/);
      expect(() => quads(tcs("p", [{type: "Bogus"}]))).to.throw(/unexpected result type: Bogus/);
    });
  });

  describe("walkVal", function () {
    const triple = (o, extra = {}) => Object.assign({type: "TestedTriple", subject: P("s"), predicate: P("p"), object: o}, extra);
    const tcs = (p, solutions) => ({type: "TripleConstraintSolutions", predicate: P(p), solutions});
    const cb = sln => sln && sln.object !== undefined && typeof sln.object === "object" ? {value: sln.object.value} : null;
    const walk = val => ShExUtil.walkVal(val, cb);

    it("gathers what the callback makes of each tested triple", function () {
      const inner = {type: "ShapeTest", solution: tcs("q", [triple({value: "inner"})])};
      const test = {type: "ShapeTest", solution: {type: "EachOfSolutions", solutions: [{type: "EachOfSolution", expressions: [
        tcs("p", [triple({value: "a"}, {referenced: inner}), triple(P("iri"))]),
      ]}]}};
      expect(walk(test)).to.deep.equal({[P("p")]: [{value: "a", nested: {[P("q")]: [{value: "inner"}]}}]});
      expect(walk({type: "SolutionList", solutions: [test, test]})[P("p")].length, "lists concatenate").to.equal(2);
      expect(walk({type: "ShapeOrResults", solution: test})).to.deep.equal(walk(test));
      expect(walk({type: "ShapeAndResults", solutions: [test]})).to.deep.equal(walk(test));
      expect(walk({type: "ExtensionResults", solutions: [test]})).to.deep.equal(walk(test));
      expect(walk({type: "OneOfSolutions", solutions: [{type: "OneOfSolution", expressions: [tcs("p", [triple({value: "b"})])]}]})).to.deep.equal({[P("p")]: [{value: "b"}]});
    });

    it("walks an rdf:List", function () {
      const cell = (member, rest) => ({type: "ShapeTest", solution: {type: "EachOfSolutions", solutions: [{type: "EachOfSolution", expressions: [
        {type: "TripleConstraintSolutions", predicate: RDF + "first", solutions: [Object.assign({type: "TestedTriple", subject: "_:c", predicate: RDF + "first"}, member)]},
        {type: "TripleConstraintSolutions", predicate: RDF + "rest", solutions: [Object.assign({type: "TestedTriple", subject: "_:c", predicate: RDF + "rest"}, rest)]},
      ]}]}});
      const last = cell({object: {value: "two"}}, {object: RDF + "nil"});
      const first = cell({object: {value: "one"}, referenced: {type: "ShapeTest", solution: tcs("q", [triple({value: "nested"})])}},
                         {object: "_:c2", referenced: {type: "ShapeOrResults", solution: last}});
      const list = {type: "ShapeTest", solution: tcs("list", [triple("_:c1", {referenced: first})])};
      expect(walk(list)).to.deep.equal({[P("list")]: [{value: "one", nested: {[P("q")]: [{value: "nested"}]}}, {value: "two"}]});
      const empty = {type: "ShapeTest", solution: tcs("list", [triple(RDF + "nil", {referenced: {type: "ShapeTest", node: RDF + "nil"}})])};
      expect(walk(empty), "an empty list binds nothing").to.equal(null);
    });

    it("answers null for what binds nothing, and refuses the unknown", function () {
      for (const val of [P("ref"), {type: "NodeConstraintTest", shapeExpr: {type: "NodeConstraint"}}, {type: "ShapeTest"}, {type: "Shape"},
                         {type: "ShapeNotTest", shapeExpr: {type: "NodeConstraint"}}, {type: "ShapeNotResults"}, {type: "Failure"},
                         {type: "ShapeNot", shapeExpr: {type: "Shape"}}, {type: "TripleConstraintSolutions", predicate: P("p")}, {type: "Recursion"}])
        expect(walk(val), JSON.stringify(val)).to.equal(null);
      for (const val of [{type: "ShapeOr", shapeExprs: [{type: "Shape"}]}, {type: "ShapeAnd", shapeExprs: [{type: "Shape"}]}, {type: "ExtendedResults"}])
        expect(walk(val), JSON.stringify(val)).to.deep.equal({});
      expect(() => walk({type: "Bogus"})).to.throw(/unknown shapeExpression type/);
    });
  });

  describe("shape maps and terms", function () {
    it("turns a node-to-shapes map into a shape map, and absolutizes one", function () {
      expect(ShExUtil.simpleToShapeMap({x: [P("S"), P("T")], y: [P("S")]})).to.deep.equal([
        {node: "x", shape: P("S")}, {node: "x", shape: P("T")}, {node: "y", shape: P("S")}]);
      expect(ShExUtil.absolutizeShapeMap([{node: "x", shape: "S"}], base)).to.deep.equal([{node: P("x"), shape: P("S")}]);
    });
    it("resolves prefixed names", function () {
      const prefixes = {ex: base};
      expect(ShExUtil.resolvePrefixedIRI("ex:x", prefixes)).to.equal(P("x"));
      expect(ShExUtil.resolvePrefixedIRI("nope:x", prefixes)).to.equal(null);
      expect(ShExUtil.resolvePrefixedIRI("nocolon", prefixes)).to.equal(null);
    });
    it("parses the node and shape arguments a CLI is given", function () {
      const meta = {base, prefixes: {ex: base, xsd: XSD}};
      const known = t => t === P("x") || t === P("S");
      const parsed = (v, d, k, u) => ShExUtil.parsePassedNode(v, meta, d, k, u);
      expect(parsed(undefined, () => "dflt", known)).to.equal("dflt");
      expect(parsed("", null, known)).to.equal(ShExUtil.NotSupplied);
      expect(parsed(undefined, null, t => t === base), "a base that is itself known").to.equal(base);
      expect(parsed("_:b")).to.equal("_:b");
      expect(parsed("\"lit\"")).to.equal("\"lit\"");
      expect(parsed("\"lit\"@en")).to.equal("\"lit\"@en");
      expect(parsed("\"1\"^^xsd:integer")).to.equal("\"1\"^^" + XSD + "integer");
      expect(parsed("\"1\"^^<dt>")).to.equal("\"1\"^^" + P("dt"));
      expect(() => parsed("\"1\"^^nope:dt")).to.throw(/no prefix for "nope"/);
      expect(() => parsed("\"unterminated")).to.throw(/malformed literal/);
      expect(parsed("<x>", null, known)).to.equal(P("x"));
      expect(parsed("x", null, known)).to.equal(P("x"));
      expect(parsed("ex:S", null, known), "a prefixed name").to.equal(P("S"));
      expect(parsed("nope", null, known)).to.equal(ShExUtil.UnknownIRI);
      expect(parsed("nope", null, known, t => "reported " + t)).to.equal("reported " + P("nope"));
      expect(ShExUtil.parsePassedNode("x", null, null, t => t === "x"), "with no meta the value stands as is").to.equal("x");
      expect(ShExUtil.parsePassedNode("y", null, null, t => t === "x")).to.equal(ShExUtil.UnknownIRI);
    });
  });

  describe("SPARQL transport", function () {
    const results = {head: {vars: ["s", "o"]}, results: {bindings: [
      {s: {type: "uri", value: P("s")}, o: {type: "literal", value: "plain"}},
      {s: {type: "bnode", value: "b0"}, o: {type: "literal", value: "hi", "xml:lang": "en"}},
      {s: {type: "uri", value: P("s")}, o: {type: "literal", value: "1", datatype: XSD + "integer"}},
      {s: {type: "uri", value: P("s")}, o: {type: "typed-literal", value: "2", datatype: XSD + "integer"}},
      {s: {type: "uri", value: P("s")}},
    ]}};
    it("reads every kind of result term", function () {
      const rows = ShExUtil.parseSparqlJsonResults(results, DF);
      expect(rows.map(r => r.map(t => t === null ? null : t.termType))).to.deep.equal([
        ["NamedNode", "Literal"], ["BlankNode", "Literal"], ["NamedNode", "Literal"], ["NamedNode", "Literal"], ["NamedNode", null]]);
      expect(rows[1][1].language).to.equal("en");
      expect(rows[2][1].datatype.value).to.equal(XSD + "integer");
      expect(rows[3][1].datatype.value).to.equal(XSD + "integer");
      expect(() => ShExUtil.parseSparqlJsonResults({head: {vars: ["x"]}, results: {bindings: [{x: {type: "bogus"}}]}}, DF)).to.throw(/unknown XML results type/);
    });

    describe("executeQueryPromise", function () {
      const savedFetch = globalThis.fetch;
      let calls;
      beforeEach(function () { calls = []; });
      afterEach(function () { globalThis.fetch = savedFetch; });
      const answering = (status, body, headers = {}) => (url, init) => {
        calls.push({url, init});
        return Promise.resolve({ok: status >= 200 && status < 300, status, statusText: "ST", headers: {get: h => headers[h]},
                                text: () => Promise.resolve(typeof body === "string" ? body : JSON.stringify(body)),
                                json: () => Promise.resolve(body)});
      };
      it("needs an endpoint", function () {
        expect(() => ShExUtil.executeQueryPromise("SELECT * {}", "", DF)).to.throw(/no endpoint/);
      });
      it("GETs a short query and POSTs a long one, saying who it is", async function () {
        globalThis.fetch = answering(200, results);
        const rows = await ShExUtil.executeQueryPromise("SELECT * {}", "http://sparql.example/", DF);
        expect(rows.length).to.equal(5);
        expect(calls[0].url).to.include("?query=SELECT");
        expect(calls[0].init.headers["User-Agent"]).to.include("shex.js");
        const long = "SELECT * { " + "?s ?p ?o . ".repeat(300) + "}";
        await ShExUtil.executeQueryPromise(long, "http://sparql.example/", DF);
        expect(calls[1].url).to.equal("http://sparql.example/");
        expect(calls[1].init.method).to.equal("POST");
        expect(calls[1].init.body).to.equal(long);
      });
      it("reports a refusal with what the service said and when to retry", async function () {
        globalThis.fetch = answering(429, "<html>slow down</html>", {"retry-after": "7"});
        let err = null;
        await ShExUtil.executeQueryPromise("SELECT * {}", "http://sparql.example/", DF).catch(e => { err = e; });
        expect(err.message).to.include("returned 429 ST:\n<html>slow down</html>");
        expect(err.status).to.equal(429);
        expect(err.retryAfter).to.equal("7");
      });
      it("says a timeout was a timeout, and passes other failures through", async function () {
        globalThis.fetch = () => Promise.reject(Object.assign(Error("aborted"), {name: "AbortError"}));
        let err = null;
        await ShExUtil.executeQueryPromise("SELECT * {}", "http://sparql.example/", DF).catch(e => { err = e; });
        expect(err.message).to.include("did not answer within");
        globalThis.fetch = () => Promise.reject(Error("ECONNREFUSED"));
        await ShExUtil.executeQueryPromise("SELECT * {}", "http://sparql.example/", DF).catch(e => { err = e; });
        expect(err.message).to.equal("ECONNREFUSED");
      });
    });

    describe("executeQuery (synchronous, over XMLHttpRequest)", function () {
      const savedXHR = globalThis.XMLHttpRequest;
      let requests, status = 200, responseText = "";
      class FakeXHR {
        open (method, url, async) { this.method = method; this.url = url; this.async = async; this.headers = {}; requests.push(this); }
        setRequestHeader (k, v) { this.headers[k] = v; }
        send (body) { this.body = body; this.status = status; this.statusText = "ST"; this.responseText = responseText; }
        getResponseHeader (h) { return h === "Retry-After" ? "3" : null; }
      }
      beforeEach(function () { requests = []; globalThis.XMLHttpRequest = FakeXHR; });
      afterEach(function () { globalThis.XMLHttpRequest = savedXHR; });
      it("needs an endpoint", function () {
        expect(() => ShExUtil.executeQuery("SELECT * {}", "", DF)).to.throw(/no endpoint/);
      });
      it("GETs a short query and POSTs a long one", function () {
        status = 200; responseText = JSON.stringify(results);
        expect(ShExUtil.executeQuery("SELECT * {}", "http://sparql.example/", DF).length).to.equal(5);
        expect(requests[0].method).to.equal("GET");
        expect(requests[0].async, "synchronous").to.equal(false);
        const long = "SELECT * { " + "?s ?p ?o . ".repeat(300) + "}";
        ShExUtil.executeQuery(long, "http://sparql.example/", DF);
        expect(requests[1].method).to.equal("POST");
        expect(requests[1].body).to.equal(long);
        expect(requests[1].headers["Content-Type"]).to.equal("application/sparql-query");
      });
      it("reports a refusal", function () {
        status = 503; responseText = "busy";
        expect(() => ShExUtil.executeQuery("SELECT * {}", "http://sparql.example/", DF)).to.throw(/returned 503 ST:\nbusy/);
      });
    });
  });

  describe("more corners", function () {
    const P = n => base + n;
    it("refuses to nest what isn't a Shape or NodeConstraint", function () {
      const orDecl = {type: "Schema", shapes: [{type: "ShapeDecl", id: P("S"), shapeExpr: {type: "ShapeOr", shapeExprs: [{type: "Shape"}, {type: "Shape"}]}}]};
      expect(() => ShExUtil.nestShapes(orDecl, {})).to.throw(/only supports Shapes and NodeConstraints/);
    });
    it("walks a ShapeOrResults reached through a reference, in getProofGraph", function () {
      const inner = {type: "ShapeTest", solution: {type: "TripleConstraintSolutions", predicate: P("q"), solutions: [{type: "TestedTriple", subject: P("o1"), predicate: P("q"), object: P("o2")}]}};
      const res = {type: "ShapeTest", solution: {type: "TripleConstraintSolutions", predicate: P("p"), solutions: [
        {type: "TestedTriple", subject: P("s"), predicate: P("p"), object: P("o1"), referenced: {type: "ShapeOrResults", solution: inner}}]}};
      expect(ShExUtil.getProofGraph(res, new N3.Store(), DF).getQuads().length).to.equal(2);
    });
    it("merges what alternatives and conjuncts bind, in walkVal", function () {
      const cb = sln => sln && typeof sln.object === "object" ? {value: sln.object.value} : null;
      const test = {type: "ShapeTest", solution: {type: "TripleConstraintSolutions", predicate: P("p"), solutions: [{type: "TestedTriple", subject: P("s"), predicate: P("p"), object: {value: "a"}}]}};
      for (const type of ["ShapeOr", "ShapeAnd"])
        expect(ShExUtil.walkVal({type, shapeExprs: [test, test]}, cb), type).to.deep.equal({[P("p")]: [{value: "a"}, {value: "a"}]});
      expect(ShExUtil.walkVal({type: "ExtensionResults", solutions: [test, test]}, cb)).to.deep.equal({[P("p")]: [{value: "a"}, {value: "a"}]});
    });
    it("hands out a structure validator", function () {
      const deps = ShExUtil.BiDiClosure();
      const visitor = ShExUtil.HierarchyVisitor(parse("<S> { :p . }"), {}, deps, deps);
      expect(visitor).to.respondTo("visitSchema");
    });
  });

  it("adds itself to a prototype", function () {
    function Host () {}
    ShExUtil(Host, true);
    expect(new Host().version()).to.equal(ShExUtil.version());
    const plain = {};
    ShExUtil(plain);
    expect(plain.version).to.equal(ShExUtil.version);
  });
});
