/** What the validator does when it is asked something ShExC can't ask.
 *
 * The shexTest validation suite covers what schemas mean.  It cannot reach
 * the validator's answers to a caller who names a shape that isn't there, or
 * hands it ShExJ no parser would have produced -- and those are the answers
 * an embedding program sees when it gets something wrong.
 *
 * A few of these are here because ShExC can't spell them at all; where that's
 * so, the test says which line of ShExC would have, if it could.
 */
"use strict";

const {expect} = require("chai");
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator, ShapeExprValidationContext} = require("..");

const BASE = "http://a.example/";
const S1 = BASE + "S1", p1 = BASE + "p1", s1 = BASE + "s1", o1 = BASE + "o1";
const node = iri => N3.DataFactory.namedNode(iri);

const dbOf = turtle => {
  const store = new N3.Store();
  store.addQuads(new N3.Parser({baseIRI: BASE, format: "text/turtle"}).parse(turtle));
  return RdfJsDb(store);
};
const ONE_TRIPLE = `<s1> <p1> <o1> .`;

const validatorFor = (shexc, turtle = ONE_TRIPLE, options = {}) =>
  new ShExValidator(ShExParser.construct(BASE, null, {index: true}).parse(shexc, BASE, undefined, "edges"),
                    dbOf(turtle), options);

/** A validator over hand-built ShExJ, for shapes ShExC has no syntax for. */
const validatorForJson = (shapeExpr, turtle = ONE_TRIPLE, options = {}) =>
  new ShExValidator({type: "Schema", shapes: [{type: "ShapeDecl", id: S1, shapeExpr}]},
                    dbOf(turtle), options);


describe("validator edges", function () {

  describe("a shape it can't find", function () {

    it("should say which shapes it does have", function () {
      const validator = validatorFor(`<${S1}> { <${p1}> . }`);
      expect(() => validator.validateNodeShapePair(node(s1), BASE + "S9"))
        .to.throw(/S9 not found/);
      expect(() => validator.validateNodeShapePair(node(s1), BASE + "S9"))
        .to.throw(S1);            // ...and what it could have meant
    });

    it("should say so when the schema has no shapes at all", function () {
      const validator = new ShExValidator({type: "Schema"}, dbOf(ONE_TRIPLE), {});
      expect(() => validator.validateNodeShapePair(node(s1), S1))
        .to.throw(/no shapes in schema/);
    });

    it("should say so when there is no start production", function () {
      const validator = validatorFor(`<${S1}> { <${p1}> . }`);
      expect(() => validator.validateNodeShapePair(node(s1), ShExValidator.Start))
        .to.throw(/start production not defined/);
    });

    it("should refuse a shape label that isn't a label", function () {
      const validator = validatorFor(`<${S1}> { <${p1}> . }`);
      expect(() => validator.validateNodeShapePair(node(s1), {not: "a label"}))
        .to.throw(/unknown shape/);
    });
  });

  it("should refuse EXTERNAL with no validateExtern to call", function () {
    const validator = validatorFor(`<${S1}> EXTERNAL`);
    expect(() => validator.validateNodeShapePair(node(s1), S1))
      .to.throw(/requires a 'validateExtern' option/);
  });

  describe("ShExJ no parser would produce", function () {

    /* Asked directly: by the time a schema has been through the index
     * visitor, the visitor has already refused this. */
    it("should refuse a shape expression of an unknown type", function () {
      const validator = validatorFor(`<${S1}> { <${p1}> . }`);
      const ctx = new ShapeExprValidationContext(null, S1);
      expect(() => validator.validateShapeExpr(node(s1), {type: "Bogus"}, ctx))
        .to.throw(/expected one of Shape\{Ref,And,Or\} or NodeConstraint/);
    });

    it("should refuse a node kind ShExC has no word for", function () {
      const validator = validatorForJson({type: "NodeConstraint", nodeKind: "quad"});
      const res = validator.validateNodeShapePair(node(s1), S1);
      expect(res).to.have.property("errors");
      expect(JSON.stringify(res.errors)).to.include("unknown node kind 'quad'");
    });

    /* ShExC drops the datatype and the language tag from a literal in a value
     * set exclusion -- `["v"~ - "v1"^^<dt>]` parses to the bare string "v1" --
     * so the only way to a typed exclusion is to write the ShExJ. */
    it("should exclude a typed literal from a stem range", function () {
      const dt = BASE + "dt";
      const excludes = values => validatorForJson(
        {type: "Shape", expression: {type: "TripleConstraint", predicate: p1,
                                     valueExpr: {type: "NodeConstraint", values}}},
        `<s1> <p1> "v1"^^<${dt}> .`);
      const stemRange = exclusions =>
        [{type: "LiteralStemRange", stem: "v", exclusions}];

      const excluded = excludes(stemRange([{value: "v1", type: dt}]))
            .validateNodeShapePair(node(s1), S1);
      expect(excluded, "the excluded literal is not in the set").to.have.property("errors");

      const other = excludes(stemRange([{value: "v2", type: dt}]))
            .validateNodeShapePair(node(s1), S1);
      expect(other, "a different literal still is").to.not.have.property("errors");
    });

    /* Two more exclusion shapes the validator guards against are dead: an
     * exclusion of type "Language" and one of type "IriStemRange" are not
     * ShExJ (a LanguageStemRange excludes LANGTAGs and LanguageStems, and a
     * stem range can't nest), and ShExIndexVisitor refuses both before the
     * validator is ever asked. */

    it("should refuse a node constraint that is both a datatype and a value set", function () {
      const validator = validatorForJson(
        {type: "NodeConstraint", datatype: "http://www.w3.org/2001/XMLSchema#string",
         values: [BASE + "v1"]});
      const res = validator.validateNodeShapePair(node(s1), S1);
      expect(res).to.have.property("errors");
      expect(JSON.stringify(res.errors)).to.include("found both datatype and values");
    });
  });

  /* Naming the same parent twice leaves the same shape in the list of
   * candidates twice, and validating it twice is not the same answer as
   * validating it once. */
  it("should consider a doubly-extended shape once", function () {
    const validator = validatorFor(
      `<${BASE}B> { <${BASE}b> . }\n<${BASE}A> EXTENDS @<${BASE}B> EXTENDS @<${BASE}B> { <${p1}> . }`,
      `<s1> <b> <o1> ; <p1> <o1> .`);
    const res = validator.validateNodeShapePair(node(s1), BASE + "B");
    expect(res, "the node satisfies <A>, which is <B>'s only descendant")
      .to.not.have.property("errors");
    const solutions = JSON.stringify(res).match(/http:\/\/a\.example\/A/g) || [];
    expect(solutions.length, "counted once").to.equal(1);
  });

  describe("semantic actions", function () {
    const TestExt = "http://shex.io/extensions/Test/";
    const withHandler = (validator, dispatch) => {
      validator.semActHandler.register(TestExt, {dispatch});
      return validator;
    };

    it("should refuse a handler that answers with something other than a list", function () {
      const validator = withHandler(
        validatorFor(`<${S1}> { <${p1}> . %<${TestExt}>{ pass %} }`), () => true);
      expect(() => validator.validateNodeShapePair(node(s1), S1))
        .to.throw(/unsupported response from semantic action handler/);
    });

    it("should fail a shape whose action failed", function () {
      const validator = withHandler(
        validatorFor(`<${S1}> { <${p1}> . } %<${TestExt}>{ fail %}`),
        () => [{type: "SemActFailure", errors: ["nope"]}]);
      const res = validator.validateNodeShapePair(node(s1), S1);
      expect(res, "the action's word is final").to.have.property("errors");
      expect(JSON.stringify(res.errors)).to.include("nope");
    });

    it("should fail a node constraint whose action failed", function () {
      const validator = withHandler(
        validatorFor(`<${S1}> IRI %<${TestExt}>{ fail %}`),
        () => [{type: "SemActFailure", errors: ["nope"]}]);
      const res = validator.validateNodeShapePair(node(s1), S1);
      expect(res).to.have.property("errors");
      expect(JSON.stringify(res.errors)).to.include("nope");
    });

    /* An overlay may hang actions on a schema without writing them into it
     * (@shexjs/semact-overlay's indexOverlay), which only works if the
     * validator asks what applies to an element rather than reading its
     * .semActs.  These say it asks, at each place it dispatches. */
    describe("indexed rather than written into the schema", function () {
      const parse = shexc =>
        ShExParser.construct(BASE, null, {index: true}).parse(shexc, BASE, undefined, "edges");
      const act = code => [{type: "SemAct", name: TestExt, code}];

      /** validate with `index` in hand, collecting what the handler saw */
      const dispatched = (schema, index, turtle = ONE_TRIPLE) => {
        const saw = [];
        const validator = new ShExValidator(schema, dbOf(turtle), {semActIndex: index});
        validator.semActHandler.register(
          TestExt, {dispatch: code => { saw.push(code.trim()); return []; }});
        const res = validator.validateNodeShapePair(node(s1), S1);
        expect(res, JSON.stringify(res.errors)).to.not.have.property("errors");
        return saw;
      };

      it("should dispatch one indexed against a shape", function () {
        const schema = parse(`<${S1}> { <${p1}> . }`);
        const shape = schema._index.shapeExprs[S1].shapeExpr;
        expect(dispatched(schema, new Map([[shape, act("on the shape")]])))
          .to.deep.equal(["on the shape"]);
      });

      it("should dispatch one indexed against a triple constraint", function () {
        const schema = parse(`<${S1}> { <${p1}> . }`);
        const tc = schema._index.shapeExprs[S1].shapeExpr.expression;
        expect(dispatched(schema, new Map([[tc, act("on the constraint")]])))
          .to.deep.equal(["on the constraint"]);
      });

      it("should dispatch one indexed against a group", function () {
        const schema = parse(`<${S1}> { <${p1}> . ; <${BASE}p2> . }`);
        const eachOf = schema._index.shapeExprs[S1].shapeExpr.expression;
        expect(eachOf.type).to.equal("EachOf");
        expect(dispatched(schema, new Map([[eachOf, act("on the group")]]),
                          `<s1> <p1> <o1> ; <p2> <o1> .`))
          .to.deep.equal(["on the group"]);
      });

      it("should dispatch one indexed against the schema as a start action", function () {
        const schema = parse(`<${S1}> { <${p1}> . }`);
        expect(dispatched(schema, new Map([[schema, act("at the start")]])))
          .to.deep.equal(["at the start"]);
      });

      /* Indexed actions are dispatched as well as, not instead of, the
       * ones the schema carries. */
      it("should dispatch both the element's own and the indexed ones", function () {
        const schema = parse(`<${S1}> { <${p1}> . %<${TestExt}>{ written %} }`);
        const tc = schema._index.shapeExprs[S1].shapeExpr.expression;
        expect(dispatched(schema, new Map([[tc, act("indexed")]])))
          .to.deep.equal(["written", "indexed"]);
      });

      it("should leave a schema with no index dispatching what it carries", function () {
        const schema = parse(`<${S1}> { <${p1}> . %<${TestExt}>{ written %} }`);
        expect(dispatched(schema, undefined)).to.deep.equal(["written"]);
      });
    });
  });

  /* A satisfied NOT is reported with the failure that made it satisfied, and
   * that failure's repairs would be instructions for breaking it. */
  it("should not offer repairs for a shape that was supposed to fail", function () {
    const validator = validatorFor(`<${S1}> NOT { <${BASE}p9> . }`);
    const res = validator.validateNodeShapePair(node(s1), S1);
    expect(res, "the node has no p9, so NOT is satisfied").to.not.have.property("errors");
    expect(JSON.stringify(res), "and nothing tells the reader how to break it")
      .to.not.include('"repairs"');
  });

  /* The recursion loophole (#14).  <A> genuinely fails -- <a> has no :preda --
   * and <C> requires @<A>, so <D>'s `:test2 @<C>` must fail.  But <C> is first
   * reached through `:test @<A>*` while <A> is still on the stack: there <C>'s
   * `:subject @<A>` is *assumed* to hold (a Recursion), so <C> passed.  That
   * contingent pass used to be memoized and reused for `:test2 @<C>` after <A>
   * had failed, and <d> wrongly conformed on the fast engine.  A contingent
   * result must not outlive its assumption; both engines must fail <d>. */
  [["eval-simple-1err", require("@shexjs/eval-simple-1err").RegexpModule],
   ["eval-threaded-nerr", require("@shexjs/eval-threaded-nerr").RegexpModule],
  ].forEach(([engine, regexModule]) => {
    it(`does not reuse a recursion-contingent result (#14, ${engine})`, function () {
      const schema = [
        `PREFIX : <${BASE}>`,
        `PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>`,
        `:D { :predd xsd:string ; ( :test @:A* | :test @:E* ) ; :test2 @:C }`,
        `:E { :prede xsd:string }`,
        `:A { :subject @:C ; :preda xsd:string }`,
        `:C { :subject @:A ; :predc xsd:string }`,
      ].join("\n");
      const data = [
        `PREFIX : <${BASE}>`,
        `:d :predd "final" ; :test :a ; :test2 :c .`,
        `:a :subject :c ; :prede "final" .`,
        `:c :subject :a ; :predc "final" .`,
      ].join("\n");
      const result = validatorFor(schema, data, {regexModule})
        .validateShapeMap([{node: BASE + "d", shape: BASE + "D"}])[0];
      expect(result.status, JSON.stringify(result.appinfo || result))
        .to.equal("nonconformant");
    });
  });
});
