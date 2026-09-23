/** The ShExMap materializer is a port of an early validator: validateShapeMap
 * walks a target schema and synthesizes triples from bindings.  Map-test runs
 * it end to end; these exercise the walk's branches one at a time -- shape
 * expression kinds, node-constraint checking, semantic actions, the cache --
 * with a stub regex engine where the real one would need a binder. */
"use strict";

const expect = require("chai").expect;
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const ShExTerm = require("@shexjs/term");
const ShExUtil = require("@shexjs/util");
const {ShExValidator} = require("@shexjs/validator");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const Mapper = require("..")({rdfjs: N3, Validator: ShExValidator});
const {DataFactory: DF} = N3;

const base = "http://a.example/";
const XSD = "http://www.w3.org/2001/XMLSchema#";
const EXT = "http://x.example/ext";

function parse (text) {
  return ShExParser.construct(base, {}, {index: true})
    .parse(`PREFIX : <${base}>\nPREFIX xsd: <${XSD}>\n` + text);
}
/** a materializer over `schemaText`; `options.regexModule` may stub the engine */
function materializerFor (schemaText, options = {}) {
  const schema = parse(schemaText);
  const validator = new ShExValidator(schema, RdfJsDb(new N3.Store()), {noCache: true});
  const registered = Mapper.register(validator, {ShExTerm, ShExUtil});
  return Mapper.materializer.construct(schema, registered, options);
}
/** an engine whose match() answers `result` (an object per call, or a function of the call) */
function stubEngine (result) {
  return {compile: () => ({match: (...args) => typeof result === "function" ? result(...args) : result})};
}
const iri = s => DF.namedNode(s);
const lit = (v, dt) => DF.literal(v, dt ? DF.namedNode(dt) : undefined);
const lang = (v, l) => DF.literal(v, l);
const bnode = () => DF.blankNode("b1");
const x = iri(base + "x");
const S = base + "S";
const db = null; // a stub engine never touches it

describe("ShExMap materializer (unit)", function () {

  describe("validate()", function () {
    it("falls back to the schema's start shape, and refuses when there is none", function () {
      const withStart = materializerFor("start = @<S>\n<S> { :p . }", {regexModule: stubEngine({})});
      const res = withStart.validate(db, x, undefined, 0, {});
      expect(res.type).to.equal("ShapeTest");
      expect(res.shape).to.equal(S);
      const noStart = materializerFor("<S> { :p . }", {regexModule: stubEngine({})});
      expect(() => noStart.validate(db, x, ShExValidator.Start, 0, {})).to.throw(/start production not defined/);
    });

    it("refuses a shape the schema doesn't define", function () {
      const m = materializerFor("<S> { :p . }", {regexModule: stubEngine({})});
      expect(() => m.validate(db, x, base + "nope", 0, {})).to.throw(/shape .* not defined/);
    });

    it("takes an inline shape expression as the target", function () {
      const m = materializerFor("<S> { :p . }", {regexModule: stubEngine({})});
      const res = m.validate(db, x, {type: "NodeConstraint", nodeKind: "iri"}, 0, {});
      expect(res.type).to.equal("NodeConstraintTest");
    });

    it("answers a node it is already validating with a Recursion marker", function () {
      const m = materializerFor("<S> { :p . }", {regexModule: stubEngine({})});
      const seen = {};
      seen[ShExTerm.rdfJsTerm2Turtle(x) + "@" + S] = {point: x, shapeLabel: S};
      const res = m.validate(db, x, S, 0, seen);
      expect(res).to.deep.equal({type: "Recursion", node: base + "x", shape: S});
    });

    it("maps a shape map, timing each entry", function () {
      const m = materializerFor("<S> { :p . }", {regexModule: stubEngine({})});
      const [row] = m.validateShapeMap(db, [{node: base + "x", shape: S}], 0, {});
      expect(row.status).to.equal("conformant");
      expect(row.appinfo.type).to.equal("ShapeTest");
      expect(row).to.have.property("elapsed");
    });
  });

  describe("shape expression kinds", function () {
    const stub = stubEngine({});
    it("ShapeRef, ShapeOr, ShapeNot and ShapeAnd", function () {
      const m = materializerFor("<S> { :p . }\n<T> { :q . }", {regexModule: stub});
      const pass = {type: "NodeConstraint", nodeKind: "iri"}, fail = {type: "NodeConstraint", nodeKind: "bnode"};
      expect(m._validateShapeExpr(db, x, S, S, 0, {}).type, "a reference").to.equal("ShapeTest");
      expect(m._validateShapeExpr(db, x, {type: "ShapeOr", shapeExprs: [fail, pass]}, S, 0, {}).type).to.equal("ShapeOrResults");
      const orFail = m._validateShapeExpr(db, x, {type: "ShapeOr", shapeExprs: [fail, fail]}, S, 0, {});
      expect(orFail.type).to.equal("ShapeOrFailure");
      expect(orFail.errors.length).to.equal(2);
      expect(m._validateShapeExpr(db, x, {type: "ShapeNot", shapeExpr: fail}, S, 0, {}).type).to.equal("ShapeNotResults");
      expect(m._validateShapeExpr(db, x, {type: "ShapeNot", shapeExpr: pass}, S, 0, {}).type).to.equal("ShapeNotFailure");
      expect(m._validateShapeExpr(db, x, {type: "ShapeAnd", shapeExprs: [pass, pass]}, S, 0, {}).type).to.equal("ShapeAndResults");
      expect(m._validateShapeExpr(db, x, {type: "ShapeAnd", shapeExprs: [pass, fail]}, S, 0, {}).type).to.equal("ShapeAndFailure");
    });

    it("a failing NodeConstraint reports a NodeConstraintViolation per error", function () {
      const m = materializerFor("<S> { :p . }", {regexModule: stub});
      const res = m._validateShapeExpr(db, x, {type: "NodeConstraint", nodeKind: "literal", datatype: XSD + "integer"}, S, 0, {});
      expect(res.type).to.equal("Failure");
      expect(res.errors.map(e => e.type)).to.deep.equal(["NodeConstraintViolation", "NodeConstraintViolation"]);
    });

    it("hands EXTERNAL to the validateExtern option", function () {
      const seenArgs = [];
      const m = materializerFor("<S> EXTERNAL", {regexModule: stub, validateExtern: (...a) => { seenArgs.push(a); return {type: "ExternTest"}; }});
      expect(m._validateShapeExpr(db, x, {type: "ShapeExternal"}, S, 3, {}).type).to.equal("ExternTest");
      expect(seenArgs[0].slice(1, 4)).to.deep.equal([x, S, 3]);
    });

    it("refuses an empty focus and an unknown expression type", function () {
      const m = materializerFor("<S> { :p . }", {regexModule: stub, noCache: true});
      expect(() => m._validateShapeExpr(db, "", {type: "NodeConstraint"}, S, 0, {})).to.throw(/valid focus node/);
      expect(() => m._validateShapeExpr(db, x, {type: "Bogus"}, S, 0, {})).to.throw(/expected one of Shape/);
    });

    it("remembers a result per focus and expression, and refuses to remember twice", function () {
      const m = materializerFor("<S> { :p . }", {regexModule: stub});
      const nc = {type: "NodeConstraint", nodeKind: "iri"};
      const first = m._validateShapeExpr(db, x, nc, S, 0, {});
      expect(m._validateShapeExpr(db, x, nc, S, 0, {}), "the cached object").to.equal(first);
      expect(m.known.cached(x, {type: "NodeConstraint"}), "a different expression").to.equal(undefined);
      expect(m.known.cached(iri(base + "y"), nc), "a different node").to.equal(undefined);
      expect(() => m.known.remember(x, nc, first)).to.throw(/duplicate key/);
      const fresh = iri(base + "fresh");
      m.known.remember(fresh, nc, "stored first");
      expect(m.known.cached(fresh, nc), "remembered before ever being looked up").to.equal("stored first");
      const uncached = materializerFor("<S> { :p . }", {regexModule: stub, noCache: true});
      expect(uncached).to.not.have.property("known");
      expect(uncached._validateShapeExpr(db, x, nc, S, 0, {}).type).to.equal("NodeConstraintTest");
    });
  });

  describe("shape matching around the engine", function () {
    const shape = "<S> { :p . }";
    it("passes the engine's solution through, or reports its errors", function () {
      const solved = materializerFor(shape, {regexModule: stubEngine({type: "EachOfSolutions", solutions: []})});
      expect(solved.validate(db, x, S, 0, {}).solution.type).to.equal("EachOfSolutions");
      const failed = materializerFor(shape, {regexModule: stubEngine({errors: [{type: "MissingProperty"}]})});
      const res = failed.validate(db, x, S, 0, {});
      expect(res.type).to.equal("Failure");
      expect(res.errors).to.deep.equal([{type: "MissingProperty"}]);
      const greedy = materializerFor(shape, {regexModule: stubEngine({errors: [{type: "MissingProperty"}]}), partition: "greedy"});
      expect(greedy.validate(db, x, S, 0, {}).type).to.equal("Failure");
    });

    it("lets a shape's semantic action veto the match", function () {
      for (const partition of ["exhaustive", "greedy"]) {
        const m = materializerFor(`<S> { :p . } %<${EXT}>{ veto %}`, {regexModule: stubEngine({}), partition});
        m.semActHandler.register(EXT, {dispatch: () => false});
        const res = m.validate(db, x, S, 0, {});
        expect(res.type).to.equal("Failure");
        expect(res.errors[0].type).to.equal("SemActFailure");
      }
    });

    it("stops at a vetoing start action, and reports start actions on a pass", function () {
      const text = `%<${EXT}>{ start %}\n<S> { :p . }`;
      const vetoed = materializerFor(text, {regexModule: stubEngine({})});
      vetoed.semActHandler.register(EXT, {dispatch: () => false});
      expect(vetoed.validate(db, x, S, 0, {})).to.equal(null);
      const allowed = materializerFor(text, {regexModule: stubEngine({})});
      allowed.semActHandler.register(EXT, {dispatch: () => true});
      expect(allowed.validate(db, x, S, 0, {}).startActs[0].name).to.equal(EXT);
    });

    it("gives the engine the shape's constraints, a synthesizer, and callbacks", function () {
      let seen = null;
      const m = materializerFor("<S> { :p . ; ( :q . | :r . ) }", {regexModule: stubEngine((...args) => { seen = args; return {}; })});
      m.validate(db, x, S, 0, {});
      const [, point, constraintList, synthesize, neighborhood, recurse, direct, semActHandler, testExpr] = seen;
      expect(point).to.equal(x);
      expect(constraintList.map(tc => tc.predicate)).to.deep.equal([base + "p", base + "q", base + "r"]);
      expect(neighborhood).to.deep.equal([]);
      expect(synthesize).to.be.a("function");
      expect(recurse(x, S).type, "recurse validates a label").to.equal("ShapeTest");
      expect(direct(x, {type: "NodeConstraint", nodeKind: "iri"}).type, "direct validates an expression").to.equal("NodeConstraintTest");
      expect(testExpr(x, {type: "NodeConstraint", nodeKind: "bnode"}, recurse, direct), "testExpr reports errors").to.have.property("errors");
      expect(semActHandler).to.equal(m.semActHandler);
    });
  });

  describe("indexTripleConstraints()", function () {
    it("flattens groups and follows an inclusion", function () {
      const m = materializerFor("<T> { $<te> :a . }\n<S> { :p . ; ( :q . | &<te> ) }");
      const S_expr = m.schema._index.shapeExprs[S].shapeExpr.expression;
      expect(m.indexTripleConstraints(S_expr).map(tc => tc.predicate)).to.deep.equal([base + "p", base + "q", base + "a"]);
      expect(m.indexTripleConstraints(undefined)).to.deep.equal([]);
    });
    it("refuses an expression of an unknown type", function () {
      const m = materializerFor("<S> { :p . }");
      expect(() => m.indexTripleConstraints({type: "Bogus"})).to.throw(/unexpected expr type/);
    });
  });

  describe("value matching", function () {
    let m;
    before(function () { m = materializerFor("<S> { :p . }\n<T> { :q . }", {regexModule: stubEngine({})}); });
    // the checker answers a NodeConstraintTest, or a NodeConstraintViolation carrying its errors
    const errorsOf = (value, valueExpr) => m._errorsMatchingNodeConstraint(value, valueExpr, null);
    const ok = (value, valueExpr, why) => expect(errorsOf(value, valueExpr).type, why || JSON.stringify(valueExpr)).to.equal("NodeConstraintTest");
    const bad = (value, valueExpr, pattern) => {
      const res = errorsOf(value, valueExpr);
      expect(res.type, "a violation for " + JSON.stringify(valueExpr)).to.equal("NodeConstraintViolation");
      if (pattern instanceof RegExp) expect(res.errors.join("\n")).to.match(pattern);
    };

    it("node kinds", function () {
      ok(x, {nodeKind: "iri"}); ok(x, {nodeKind: "nonliteral"}); ok(bnode(), {nodeKind: "bnode"}); ok(lit("a"), {nodeKind: "literal"});
      bad(x, {nodeKind: "bogus"}, /unknown node kind/);
      bad(bnode(), {nodeKind: "iri"}, /blank node found/);
      bad(lit("a"), {nodeKind: "iri"}, /literal found/);
      bad(x, {nodeKind: "bnode"}, /iri found/);
    });

    it("datatypes, their lexical forms and ranges", function () {
      bad(lit("1", XSD + "integer"), {datatype: XSD + "integer", values: ["1"]}, /both datatype and values/);
      bad(x, {datatype: XSD + "integer"}, /not a literal/);
      bad(lit("1", XSD + "string"), {datatype: XSD + "integer"}, /mismatched datatype/);
      ok(lit("42", XSD + "integer"), {datatype: XSD + "integer"});
      bad(lit("4.2", XSD + "integer"), {datatype: XSD + "integer"}, /illegal integer/);
      ok(lit("4.2", XSD + "decimal"), {datatype: XSD + "decimal"});
      bad(lit("x", XSD + "decimal"), {datatype: XSD + "decimal"}, /illegal/);
      ok(lit("4.2", XSD + "float"), {datatype: XSD + "float"});
      bad(lit("x", XSD + "float"), {datatype: XSD + "float"}, /illegal/);
      ok(lit("4.2e1", XSD + "double"), {datatype: XSD + "double"});
      bad(lit("", XSD + "double"), {datatype: XSD + "double"}, /illegal/);
      bad(lit("300", XSD + "byte"), {datatype: XSD + "byte"}, /greater than the max/);
      bad(lit("-300", XSD + "byte"), {datatype: XSD + "byte"}, /less than the min/);
      ok(lit("true", XSD + "boolean"), {datatype: XSD + "boolean"});
      bad(lit("yes", XSD + "boolean"), {datatype: XSD + "boolean"}, /illegal boolean/);
      ok(lit("2012-01-02T12:34:56.78Z", XSD + "dateTime"), {datatype: XSD + "dateTime"});
      bad(lit("2012-01-02", XSD + "dateTime"), {datatype: XSD + "dateTime"}, /illegal dateTime/);
      ok(lit("2012-01-02", XSD + "date"), {datatype: XSD + "date"}, "a datatype with no lexical check");
    });

    it("value sets of terms", function () {
      ok(lang("hi", "en"), {values: [{type: "Language", languageTag: "en"}]});
      bad(lang("hi", "fr"), {values: [{type: "Language", languageTag: "en"}]});
      ok(lit("a"), {values: [{value: "a"}]});
      ok(lit("1", XSD + "integer"), {values: [{value: "1", type: XSD + "integer"}]});
      bad(lit("1", XSD + "integer"), {values: [{value: "1", type: XSD + "decimal"}]});
      ok(lang("a", "en"), {values: [{value: "a", language: "en"}]});
      bad(lang("a", "en"), {values: [{value: "a", language: "fr"}]});
      ok(x, {values: [base + "x"]});
      bad(x, {values: [base + "y"]}, /not found in set/);
      bad(x, {values: [{value: "x"}]}, "a literal never matches an IRI");
    });

    it("stems and stem ranges", function () {
      ok(x, {values: [{type: "IriStem", stem: base}]});
      bad(x, {values: [{type: "IriStem", stem: "http://b.example/"}]});
      bad(lit("a"), {values: [{type: "IriStem", stem: base}]}, "a literal is no IRI");
      ok(lit("abc"), {values: [{type: "LiteralStem", stem: "ab"}]});
      bad(x, {values: [{type: "LiteralStem", stem: "ab"}]}, "an IRI is no literal");
      ok(lang("a", "en-us"), {values: [{type: "LanguageStem", stem: "en"}]}); // (N3 lowercases language tags)
      ok(lang("a", "en"), {values: [{type: "LanguageStem", stem: ""}]});
      bad(lang("a", "eng"), {values: [{type: "LanguageStem", stem: "en"}]});
      bad(lit("a"), {values: [{type: "LanguageStem", stem: "en"}]}, "no language tag at all");
      ok(x, {values: [{type: "IriStemRange", stem: {type: "Wildcard"}, exclusions: ["http://b.example/y"]}]});
      bad(x, {values: [{type: "IriStemRange", stem: {type: "Wildcard"}, exclusions: [base + "x"]}]});
      bad(x, {values: [{type: "IriStemRange", stem: base, exclusions: [{type: "IriStem", stem: base + "x"}]}]});
      ok(x, {values: [{type: "IriStemRange", stem: base, exclusions: [{type: "IriStem", stem: base + "z"}]}]});
      ok(lit("abc"), {values: [{type: "LiteralStemRange", stem: {type: "Wildcard"}, exclusions: [{type: "LiteralStem", stem: "z"}]}]});
      bad(lit("abc"), {values: [{type: "LiteralStemRange", stem: "ab", exclusions: ["abc"]}]});
      ok(lit("abd"), {values: [{type: "LiteralStemRange", stem: "ab", exclusions: ["abc"]}]});
      ok(lang("a", "fr-ch"), {values: [{type: "LanguageStemRange", stem: "fr", exclusions: [{type: "LanguageStem", stem: "fr-be"}]}]});
      bad(lang("a", "fr-be"), {values: [{type: "LanguageStemRange", stem: "fr", exclusions: [{type: "LanguageStem", stem: "fr-be"}]}]});
    });

    it("refuses malformed value-set members", function () {
      expect(() => errorsOf(x, {values: [{stem: base}]})).to.throw(/have a 'type' attribute/);
      expect(() => errorsOf(x, {values: [{type: "Bogus", stem: base}]})).to.throw(/to match/);
      expect(() => errorsOf(x, {values: [{type: "IriStemRange", stem: {}, exclusions: []}]})).to.throw(/to be a Wildcard/);
      expect(() => errorsOf(x, {values: [{type: "IriStemRange", stem: base, exclusions: [{stem: base}]}]})).to.throw(/have a 'type' attribute/);
      expect(() => errorsOf(x, {values: [{type: "IriStemRange", stem: base, exclusions: [{type: "Language", stem: base}]}]})).to.throw(/to be in/);
    });

    it("patterns and string facets", function () {
      ok(lit("abc"), {pattern: "^ab"}); bad(lit("xbc"), {pattern: "^ab"}, /did not match pattern/);
      ok(lit("ABC"), {pattern: "^ab", flags: "i"}); bad(lit("ABC"), {pattern: "^ab", flags: ""});
      ok(lit("abc"), {length: 3}); bad(lit("abc"), {length: 2}, /facet violation/);
      ok(lit("abc"), {minlength: 3}); bad(lit("abc"), {minlength: 4});
      ok(lit("abc"), {maxlength: 3}); bad(lit("abc"), {maxlength: 2});
    });

    it("numeric facets, on numbers and on what is not a number", function () {
      const int = v => lit(v, XSD + "integer");
      ok(int("5"), {mininclusive: 5}); bad(int("4"), {mininclusive: 5});
      ok(int("6"), {minexclusive: 5}); bad(int("5"), {minexclusive: 5});
      ok(int("5"), {maxinclusive: 5}); bad(int("6"), {maxinclusive: 5});
      ok(int("4"), {maxexclusive: 5}); bad(int("5"), {maxexclusive: 5});
      bad(lit("5"), {mininclusive: 5}, /can't apply/);
      ok(int("123"), {totaldigits: 3}); bad(int("1234"), {totaldigits: 3});
      ok(lit("1.25", XSD + "decimal"), {fractiondigits: 2}); bad(lit("1.255", XSD + "decimal"), {fractiondigits: 2});
      bad(lit("1.5", XSD + "float"), {totaldigits: 3}, /can't apply/);
      bad(lit("1.5", XSD + "double"), {fractiondigits: 3}, /can't apply/);
    });

    it("dispatches a value expression to the right checker", function () {
      const recurse = (v, label) => ({type: "Recursed", label}), direct = (v, expr) => ({type: "Directed", expr});
      expect(m._errorsMatchingShapeExpr(x, S, recurse, direct).type).to.equal("Recursed");
      expect(m._errorsMatchingShapeExpr(x, S, undefined, direct), "a reference with nothing to recurse into").to.not.have.property("errors");
      expect(m._errorsMatchingShapeExpr(x, {type: "Shape"}, recurse, direct).type).to.equal("Directed");
      expect(m._errorsMatchingShapeExpr(x, {type: "Shape"}, recurse, undefined)).to.not.have.property("errors");
      const fail = {type: "NodeConstraint", nodeKind: "bnode"}, pass = {type: "NodeConstraint", nodeKind: "iri"};
      expect(m._errorsMatchingShapeExpr(x, {type: "ShapeOr", shapeExprs: [fail, pass]}, recurse, direct).type).to.equal("ShapeOrResults");
      const orFail = m._errorsMatchingShapeExpr(x, {type: "ShapeOr", shapeExprs: [fail, fail]}, recurse, direct);
      expect(orFail.type).to.equal("ShapeOrFailure");
      expect(orFail.errors.length).to.equal(2);
      expect(m._errorsMatchingShapeExpr(x, {type: "ShapeAnd", shapeExprs: [pass, pass]}, recurse, direct).type).to.equal("ShapeAndResults");
      const andFail = m._errorsMatchingShapeExpr(x, {type: "ShapeAnd", shapeExprs: [pass, fail]}, recurse, direct);
      expect(andFail.type).to.equal("ShapeAndFailure");
      expect(andFail.errors.length).to.equal(1);
      expect(() => m._errorsMatchingShapeExpr(x, {type: "Bogus"}, recurse, direct)).to.throw(/unknown value expression type/);
    });
  });

  describe("semantic action dispatch", function () {
    it("runs registered handlers with their code, collecting what they write", function () {
      const m = materializerFor("<S> { :p . }", {semActs: {[EXT]: "from options"}});
      const calls = [];
      m.semActHandler.register(EXT, {dispatch: (code, ctx, storage) => { calls.push(code); storage.saw = ctx; return true; }});
      const artifact = {};
      const semActs = [{type: "SemAct", name: EXT, code: "written"}, {type: "SemAct", name: EXT}, {type: "SemAct", name: "http://x.example/unregistered"}];
      expect(m.semActHandler.dispatchAll(semActs, "ctx", artifact)).to.equal(true);
      expect(calls).to.deep.equal(["written", "from options"]);
      expect(artifact.extensions[EXT].saw).to.equal("ctx");
      const again = {extensions: {[EXT]: {}}};
      expect(m.semActHandler.dispatchAll(semActs.slice(0, 1), "ctx2", again), "an existing extension slot is reused").to.equal(true);
      expect(again.extensions[EXT].saw).to.equal("ctx2");
    });
    it("answers false as soon as a handler does", function () {
      const m = materializerFor("<S> { :p . }");
      let calls = 0;
      m.semActHandler.register(EXT, {dispatch: () => { ++calls; return false; }});
      expect(m.semActHandler.dispatchAll([{name: EXT, code: "a"}, {name: EXT, code: "b"}], null, {})).to.equal(false);
      expect(calls, "the second action is not dispatched").to.equal(1);
    });
  });
});
