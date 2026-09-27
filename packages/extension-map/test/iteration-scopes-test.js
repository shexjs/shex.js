/** Tests for materialization by iteration scopes (doc/iteration-scopes.md), ported from
 * PyShEx's ShExMap suite: the cases the frame model could not do (a nested schema mapping
 * to itself, transposition, inherited reads), keyed node identity, value expressions, the
 * static checks, the round-trip laws and updating a graph in place.
 */
"use strict";

const expect = require("chai").expect;
const RdfJs = require("n3");
const ShExParser = require("@shexjs/parser");
const ShExTerm = require("@shexjs/term");
const ShExUtil = require("@shexjs/util");
const {ShExValidator, resultMapToShapeExprTest} = require("@shexjs/validator");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {graphEquals} = require("./graphEquals.js");
const Mapper = require("..")({rdfjs: RdfJs, Validator: ShExValidator});
const {ThreadedMaterializer, MaterializationError} = require("../lib/ThreadedMaterializer");
const {bindingTree, matchedTriples} = require("../lib/bindingTree");
const {analyse} = require("../lib/analysis");

const P = "PREFIX : <http://a.example/>\nPREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\nPREFIX v: <http://v.example/>\nPREFIX Map: <http://shex.io/extensions/Map/#>\n";
const A = "http://a.example/", V = "http://v.example/";
const OUT = A + "out";
const {namedNode, literal} = RdfJs.DataFactory;

const parse = text => ShExParser.construct("http://a.example/schema/", {}, {index: true}).parse(text);
function store (turtle) {
  const s = new RdfJs.Store();
  s.addQuads(new RdfJs.Parser({baseIRI: "http://a.example/", format: "text/turtle"}).parse("PREFIX : <http://a.example/>\n" + turtle));
  return s;
}
function validate (schema, s, focus, shape) {
  const validator = new ShExValidator(schema, RdfJsDb(s), {noCache: true});
  Mapper.register(validator, {ShExTerm, ShExUtil});
  return resultMapToShapeExprTest(validator.validateShapeMap([{node: focus, shape: shape || ShExValidator.Start}]));
}
function bind (schemaText, turtle, focus) {
  const res = validate(parse(schemaText), store(turtle), focus);
  expect(res.errors || [], "validation").to.deep.equal([]);
  return {bindings: bindingTree(res), matched: matchedTriples(res)};
}
function mat (schemaText, bindings, root = OUT, options = {}) {
  const m = new ThreadedMaterializer(parse(schemaText), options);
  return {m, quads: m.materialize(bindings, root)};
}
const objects = (quads, local) => quads.filter(q => q.predicate.value === A + local).map(q => q.object.value).sort();
const lit = v => ({value: v});

describe("materialization by iteration scopes", function () {

  const NESTED_IN = P + "start=@<P>\n<P> { :name . %Map:{ v:name %} ; :report { :no . %Map:{ v:no %} ; :result { :sys . %Map:{ v:sys %} }* }* }";
  const REPORTS = ':p :name "Sue" ; :report :r1, :r2 . :r1 :no "one" ; :result [ :sys 100 ], [ :sys 101 ] . :r2 :no "two" ; :result [ :sys 110 ], [ :sys 111 ] .';

  describe("the input's structure decides the output's", function () {
    it("regroups readings under their report", function () {
      const {bindings} = bind(NESTED_IN, REPORTS, A + "p");
      const {quads} = mat(P + "start=@<Out>\n<Out> { :group @<G>* }\n<G> { :label . %Map:{ v:no %} ; :reading . + %Map:{ v:sys %} }", bindings);
      expect(objects(quads, "group").length).to.equal(2);
      const byGroup = {};
      quads.filter(q => q.predicate.value === A + "reading").forEach(q => (byGroup[q.subject.value] = byGroup[q.subject.value] || []).push(q.object.value));
      expect(Object.values(byGroup).map(v => v.sort())).to.deep.equal([["100", "101"], ["110", "111"]]);
    });

    it("maps a nested schema to itself", function () {
      const {bindings} = bind(NESTED_IN, REPORTS, A + "p");
      const {quads} = mat(NESTED_IN, bindings, A + "p2");
      const reports = quads.filter(q => q.predicate.value === A + "report");
      expect(reports.length).to.equal(2);
      for (const r of reports) {
        const results = quads.filter(q => q.subject.equals(r.object) && q.predicate.value === A + "result");
        expect(results.length).to.equal(2);
      }
    });

    it("transposes sibling lists", function () {
      const tree = [{}, [{[V + "a"]: lit("a1"), [V + "b"]: lit("b1")}, {[V + "a"]: lit("a2"), [V + "b"]: lit("b2")}]];
      const {quads} = mat(P + "start=@<T>\n<T> { :allB . * %Map:{ v:b %} ; :allA . * %Map:{ v:a %} }", tree);
      expect(objects(quads, "allB")).to.deep.equal(["b1", "b2"]);
      expect(objects(quads, "allA")).to.deep.equal(["a1", "a2"]);
    });

    const PATIENT = [{[V + "name"]: lit("Sue")}, [{[V + "sys"]: lit("110"), [V + "dia"]: lit("70")}, {[V + "sys"]: lit("111"), [V + "dia"]: lit("71")}]];
    const readings = quads => quads.filter(q => q.predicate.value === A + "bp").map(q => [
      quads.find(x => x.subject.equals(q.object) && x.predicate.value === A + "sys").object.value,
      quads.find(x => x.subject.equals(q.object) && x.predicate.value === A + "dia").object.value]).sort();

    it("reads a parent's binding at the parent and in each item, and twice in one", function () {
      let {quads} = mat(P + "start=@<Out>\n<Out> { :who . %Map:{ v:name %} ; :bp { :sys . %Map:{ v:sys %} ; :who . %Map:{ v:name %} ; :dia . %Map:{ v:dia %} }* }", PATIENT);
      expect(readings(quads)).to.deep.equal([["110", "70"], ["111", "71"]]);
      expect(objects(quads, "who")).to.deep.equal(["Sue", "Sue", "Sue"]);
      ({quads} = mat(P + "start=@<Out>\n<Out> { :bp { :sys . %Map:{ v:sys %} ; :who . %Map:{ v:name %} ; :who2 . %Map:{ v:name %} ; :dia . %Map:{ v:dia %} }* }", PATIENT));
      expect(readings(quads)).to.deep.equal([["110", "70"], ["111", "71"]]);
    });

    it("refuses a body reading from unrelated lists", function () {
      const tree = [{}, [{[V + "a"]: lit("a1")}, {[V + "a"]: lit("a2")}], [{[V + "b"]: lit("b1")}, {[V + "b"]: lit("b2")}]];
      expect(() => mat(P + "start=@<Out>\n<Out> { :pair { :x . %Map:{ v:a %} ; :y . %Map:{ v:b %} }* }", tree))
        .to.throw(MaterializationError, /unrelated lists/);
    });

    it("fails a deeper read that has no repetition to iterate", function () {
      expect(() => mat(P + "start=@<Out>\n<Out> { :first . %Map:{ v:sys %} }", PATIENT)).to.throw(MaterializationError, /sys/);
    });

    it("flattens over a deeper list, reading labels from above", function () {
      const {bindings} = bind(NESTED_IN, REPORTS, A + "p");
      let {quads} = mat(P + "start=@<Out>\n<Out> { :all . * %Map:{ v:sys %} }", bindings);
      expect(objects(quads, "all")).to.deep.equal(["100", "101", "110", "111"]);
      ({quads} = mat(P + "start=@<Out>\n<Out> { :g { :label . %Map:{ v:no %} ; :reading . %Map:{ v:sys %} }* }", bindings));
      expect(objects(quads, "g").length).to.equal(4);
      expect(new Set(objects(quads, "label"))).to.deep.equal(new Set(["one", "two"]));
    });

    it("emits every value of a starred constraint, however many", function () {
      const tree = [{}, Array.from({length: 60}, (_, i) => ({[V + "t"]: lit("t" + i)}))];
      const {m, quads} = mat(P + "start=@<T>\n<T> { :label . * %Map:{ v:t %} }", tree);
      expect(quads.length).to.equal(60);
      expect(m.accepts.length).to.equal(1);
    });
  });

  describe("node identity", function () {
    const READINGS = [{}, [{[V + "date"]: lit("2026-09-01"), [V + "sys"]: lit("110")}, {[V + "date"]: lit("2026-09-01"), [V + "sys"]: lit("112")},
                           {[V + "date"]: lit("2026-09-02"), [V + "sys"]: lit("120")}]];

    it("merges equal keys into one node", function () {
      const {quads} = mat(P + "start=@<Out>\n<Out> { :day @<Day>* %Map:{ id(v:date) %} }\n<Day> { :date . %Map:{ v:date %} ; :reading . %Map:{ v:sys %} }", READINGS);
      expect(new Set(quads.filter(q => q.predicate.value === A + "day").map(q => q.object.value)).size).to.equal(2);
      expect(objects(quads, "date").length).to.equal(2);
      const first = quads.find(q => q.predicate.value === A + "date" && q.object.value === "2026-09-01").subject;
      expect(quads.filter(q => q.subject.equals(first) && q.predicate.value === A + "reading").map(q => q.object.value).sort()).to.deep.equal(["110", "112"]);
    });

    it("takes a key of one IRI as the node, and shares keyed nodes across constraints", function () {
      const tree = [{[V + "mrn"]: lit("42"), [V + "name"]: lit("Ann")}, [{[V + "when"]: lit("Mon")}, {[V + "when"]: lit("Tue")}]];
      const {quads} = mat(P + "start=@<Out>\n<Out> { :patient @<Pt> %Map:{ id(<http://a.example/person/{v:mrn}>) %} ; :visit @<Visit>* }\n" +
                          "<Pt> { :name . %Map:{ v:name %} }\n<Visit> { :when . %Map:{ v:when %} ; :of @<Pt> %Map:{ id(<http://a.example/person/{v:mrn}>) %} }", tree);
      expect(objects(quads, "patient")).to.deep.equal([A + "person/42"]);
      expect(new Set(objects(quads, "of"))).to.deep.equal(new Set([A + "person/42"]));
      expect(objects(quads, "name").length).to.equal(1);
    });

    it("percent-encodes template values", function () {
      const {quads} = mat(P + "start=@<Out>\n<Out> { :x @<X> %Map:{ id(<http://a.example/k/{v:k}/tail>) %} }\n<X> { :kind [:c] }", {[V + "k"]: lit("a b/c?d")});
      expect(objects(quads, "x")).to.deep.equal([A + "k/a%20b%2Fc%3Fd/tail"]);
    });

    it("maps a graph onto itself with id(@node)", function () {
      const S = P + "start=@<P>\n<P> { :report @<R>* %Map:{ id(@node) %} }\n<R> { :no . %Map:{ v:no %} ; :result @<Res>* %Map:{ id(@node) %} }\n<Res> { :sys . %Map:{ v:sys %} }";
      const data = ':p :report :r1, :r2 . :r1 :no "one" ; :result [ :sys 100 ], [ :sys 101 ] . :r2 :no "two" ; :result [ :sys 110 ] .';
      const {bindings} = bind(S, data, A + "p");                    // id() binds nothing on the way in
      const {quads} = mat(S, bindings, A + "p");
      const got = new RdfJs.Store(); got.addQuads(quads);
      expect(graphEquals(got, store(data))).to.equal(true);
      expect(got.countQuads(namedNode(A + "p"), namedNode(A + "report"), namedNode(A + "r1"), null)).to.equal(1);
    });

    it("mints reproducible, root-specific nodes", function () {
      const tree = [{[V + "name"]: lit("Sue")}, [{[V + "sys"]: lit("110")}, {[V + "sys"]: lit("111")}]];
      const schema = P + "start=@<Out>\n<Out> { :who . %Map:{ v:name %} ; :bp { :sys . %Map:{ v:sys %} }* }";
      const once = mat(schema, tree).quads, again = mat(schema, tree).quads;
      expect(once.map(q => q.object.value)).to.deep.equal(again.map(q => q.object.value));
      const other = mat(schema, tree, A + "elsewhere").quads;
      expect(objects(once, "bp").some(n => objects(other, "bp").includes(n))).to.equal(false);
    });

    it("fails a constraint whose key is unbound, and refuses id() misuse", function () {
      const {quads} = mat(P + "start=@<Out>\n<Out> { :who . %Map:{ v:name %} ; :home @<H>? %Map:{ id(v:city) %} }\n<H> { :kind [:home] }", {[V + "name"]: lit("Sue")});
      expect(objects(quads, "home")).to.deep.equal([]);
      expect(() => mat(P + "start=@<Out>\n<Out> { :n . %Map:{ id(v:k) %} }", {[V + "k"]: lit("x")})).to.throw(MaterializationError, /shape-valued/);
    });
  });

  describe("value expressions", function () {
    it("retypes a plain literal to the constraint's datatype, and fails a misfit", function () {
      const {quads} = mat(P + "start=@<Out>\n<Out> { :n xsd:integer %Map:{ v:t %} }", {[V + "t"]: lit("42")});
      expect(quads[0].object.datatype.value).to.equal("http://www.w3.org/2001/XMLSchema#integer");
      expect(() => mat(P + "start=@<Out>\n<Out> { :n xsd:integer %Map:{ v:t %} }", {[V + "t"]: lit("not a number")}))
        .to.throw(MaterializationError, /does not satisfy/);
    });

    it("lets an optional constraint drop out and a OneOf fall through", function () {
      let {quads} = mat(P + "start=@<Out>\n<Out> { :n xsd:integer ? %Map:{ v:t %} ; :s . %Map:{ v:t %} }", {[V + "t"]: lit("abc")});
      expect(objects(quads, "n")).to.deep.equal([]);
      expect(objects(quads, "s")).to.deep.equal(["abc"]);
      ({quads} = mat(P + "start=@<Out>\n<Out> { :n xsd:integer %Map:{ v:t %} | :s xsd:string %Map:{ v:t %} }", {[V + "t"]: lit("abc")}));
      expect(objects(quads, "s")).to.deep.equal(["abc"]);
    });

    it("checks value sets, node kinds and facets", function () {
      expect(objects(mat(P + "start=@<Out>\n<Out> { :k [:x :y] %Map:{ v:t %} }", {[V + "t"]: A + "x"}).quads, "k")).to.deep.equal([A + "x"]);
      expect(() => mat(P + "start=@<Out>\n<Out> { :k [:x :y] %Map:{ v:t %} }", {[V + "t"]: A + "z"})).to.throw(MaterializationError);
      expect(() => mat(P + "start=@<Out>\n<Out> { :k IRI %Map:{ v:t %} }", {[V + "t"]: lit("not an iri")})).to.throw(MaterializationError);
      expect(() => mat(P + "start=@<Out>\n<Out> { :s xsd:string MINLENGTH 3 %Map:{ v:t %} }", {[V + "t"]: lit("ab")})).to.throw(MaterializationError);
    });

    it("can be turned off", function () {
      const {quads} = mat(P + "start=@<Out>\n<Out> { :n xsd:integer %Map:{ v:t %} }", {[V + "t"]: lit("not a number")}, OUT, {checkValues: false});
      expect(quads[0].object.value).to.equal("not a number");
    });
  });

  describe("static checks", function () {
    const inputSchema = parse(NESTED_IN);
    const out = text => parse(P + "start=@<Out>\n" + text);

    it("passes a coherent pair, and a schema against itself", function () {
      expect(analyse(inputSchema, out("<Out> { :group @<G>* }\n<G> { :label . %Map:{ v:no %} ; :reading . + %Map:{ v:sys %} }")).errors).to.deep.equal([]);
      const self = analyse(inputSchema, parse(NESTED_IN));
      expect(self.errors).to.deep.equal([]);
      expect(self.warnings).to.deep.equal([]);
    });

    it("names 'which one?' reads and unrelated lists", function () {
      const which = analyse(inputSchema, out("<Out> { :first . %Map:{ v:sys %} }"));
      expect(which.errors.length).to.equal(1);
      expect(which.errors[0]).to.include("which one");
      expect(which.errors[0]).to.include("each :report / :result");
      const two = parse(P + "start=@<S>\n<S> { :a . * %Map:{ v:a %} ; :b { :v . %Map:{ v:b %} }* }");
      const zip = analyse(two, out("<Out> { :pair { :x . %Map:{ v:a %} ; :y . %Map:{ v:b %} }* }"));
      expect(zip.errors.length).to.equal(1);
      expect(zip.errors[0]).to.include("unrelated lists");
      expect(zip.errors[0]).to.include("v:a");
    });

    it("reports unbound and unused variables, and id() misuse", function () {
      const r = analyse(inputSchema, out("<Out> { :who . %Map:{ v:name %} ; :oops . %Map:{ v:typo %} }"));
      expect(r.errors.some(e => e.includes("never binds") && e.includes("typo"))).to.equal(true);
      expect(r.warnings.some(w => w.includes("v:sys") && w.includes("never reads"))).to.equal(true);
      expect(analyse(inputSchema, out("<Out> { :n . %Map:{ id(v:no) %} }")).errors.some(e => e.includes("shape-valued"))).to.equal(true);
      expect(analyse(inputSchema, out("<Out> { :g @<G> %Map:{ id(@node) %} }\n<G> { :k [:c] }")).errors.some(e => e.includes("@node"))).to.equal(true);
    });
  });

  describe("round trips", function () {
    it("binds back exactly what it wrote from", function () {
      const {bindings} = bind(NESTED_IN, REPORTS, A + "p");
      const T = P + "start=@<Out>\n<Out> { :group @<G>* }\n<G> { :label . %Map:{ v:no %} ; :reading . + %Map:{ v:sys %} }";
      const {m, quads} = mat(T, bindings);
      const read = new Set();
      m.provenance.forEach(p => p.src.reads.forEach(([path, v]) => {
        const scope = m.tree.scopes.find(s => s.path.join(".") === path);
        read.add(v + "=" + JSON.stringify(scope.own[v]));
      }));
      const s = new RdfJs.Store(); s.addQuads(quads);
      const again = bindingTree(validate(parse(T), s, OUT));
      const rebound = new Set();
      (function walk (node) {
        if (Array.isArray(node)) return node.forEach(walk);
        Object.keys(node).filter(k => !k.startsWith("@")).forEach(k => rebound.add(k + "=" + JSON.stringify(node[k])));
      })(again);
      expect(rebound).to.deep.equal(read);
    });
  });

  describe("updating a graph in place", function () {
    const OUTS = P + "start=@<Out>\n<Out> { :who . %Map:{ v:name %} ; :bp @<B>* }\n<B> { :sys . %Map:{ v:sys %} }";
    const rebind = (schema, s) => (root, shape) => {
      const rootTerm = root.startsWith("_:") ? RdfJs.DataFactory.blankNode(root.slice(2)) : namedNode(root);
      if (s.countQuads(rootTerm, namedNode(A + "who"), null, null) === 0 && s.countQuads(rootTerm, namedNode(A + "bp"), null, null) === 0)
        return null;
      return validate(schema, s, root, shape);
    };
    const sys = s => s.getQuads(null, namedNode(A + "sys"), null, null).map(q => q.object.value).sort();

    it("replaces what the schema holds at the root and keeps the rest", function () {
      const s = store(':out :unrelated "kept" . :elsewhere :who "someone else" .');
      const schema = parse(OUTS);
      const m = new ThreadedMaterializer(schema);
      let r = m.update(s, [{[V + "name"]: lit("Sue")}, [{[V + "sys"]: lit("110")}, {[V + "sys"]: lit("111")}]], OUT, undefined, rebind(schema, s));
      expect(r.removed).to.deep.equal([]);
      expect(sys(s)).to.deep.equal(["110", "111"]);
      r = m.update(s, [{[V + "name"]: lit("Susan")}, [{[V + "sys"]: lit("110")}, {[V + "sys"]: lit("112")}]], OUT, undefined, rebind(schema, s));
      expect(r.removed.map(q => q.object.value).sort()).to.deep.equal(["111", "Sue"]);
      expect(sys(s)).to.deep.equal(["110", "112"]);
      expect(s.countQuads(namedNode(OUT), namedNode(A + "who"), literal("Susan"), null)).to.equal(1);
      expect(s.countQuads(namedNode(OUT), namedNode(A + "unrelated"), null, null)).to.equal(1);
      expect(s.countQuads(namedNode(A + "elsewhere"), null, null, null)).to.equal(1);
      r = m.update(s, [{[V + "name"]: lit("Susan")}, [{[V + "sys"]: lit("110")}, {[V + "sys"]: lit("112")}]], OUT, undefined, rebind(schema, s));
      expect(r.added).to.deep.equal([]);
      expect(r.removed).to.deep.equal([]);
    });

    it("refuses a root that does not conform", function () {
      const s = store(':out :who "Sue", "Also Sue" .');
      const schema = parse(OUTS);
      expect(() => new ThreadedMaterializer(schema).update(s, [{[V + "name"]: lit("Sue")}, []], OUT, undefined, rebind(schema, s)))
        .to.throw(MaterializationError, /does not conform/);
    });
  });
});
