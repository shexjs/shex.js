/** The JavaScript evaluator, on the road it is actually driven down.
 *
 * The scope an action sees is built by `@shexjs/extension-reduce` out of a
 * validation result, so these tests take the same route a caller does: an
 * overlay says which action goes on which element, the extension registers
 * itself as a SemAct handler, the validator dispatches to it as it matches,
 * and the fold afterwards asks this evaluator to run what was recorded.
 * Writing the scope out by hand instead would have tested this against a
 * transcription of the contract rather than against the contract.
 *
 * Everything here runs twice, once for each way an overlay can hang an
 * action on an element: `applyOverlay` writes the actions into the schema,
 * `indexOverlay` keys them by element and leaves the schema as it found it.
 * The evaluator should not be able to tell the difference, and that is the
 * point of running it both ways.
 */
"use strict";

const {expect} = require("chai");
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("@shexjs/validator");
const {applyOverlay, indexOverlay, NS} = require("@shexjs/semact-overlay");
const Reduce = require("@shexjs/extension-reduce");
const evaluate = require("..");

const B = "http://a.example/";
const XSD = "http://www.w3.org/2001/XMLSchema#";
const PREFIXES = {"": B, xsd: XSD};

/** an overlay document hanging each action on the element with that label */
function overlayOf (actions) {
  const store = new N3.Store();
  store.addQuads(new N3.Parser({baseIRI: B, format: "text/turtle"}).parse(
    `PREFIX sa: <${NS}>\n<#o> a sa:Overlay ; sa:extension <${Reduce.url}> ;\n  sa:action `
      + Object.keys(actions).map(label =>
        `[ sa:ref <${B}${label}> ; sa:code ${JSON.stringify(actions[label])} ]`).join(" ,\n  ")
      + " ."));
  return store;
}

function parse (shexc) {
  return ShExParser.construct(B, null, {index: true}).parse(
    `PREFIX : <${B}>\nPREFIX xsd: <${XSD}>\n` + shexc, B, undefined, "reduce-js-test");
}

function graph (turtle) {
  const store = new N3.Store();
  store.addQuads(new N3.Parser({baseIRI: B, format: "text/turtle"})
                 .parse(`PREFIX : <${B}>\n` + turtle));
  return store;
}

/**
 * Recognize `turtle` against `shexc` with `actions` hung on it, and reduce
 * the result -- the whole road, so that what the evaluator sees is what a
 * caller's actions would see.
 */
function reduce (mode, shexc, turtle, actions, options = {}) {
  const schema = parse(shexc);
  const overlay = overlayOf(actions);
  const validatorOptions = {};
  if (mode === "mutate")
    applyOverlay(schema, overlay);
  else
    validatorOptions.semActIndex = indexOverlay(schema, overlay);

  const validator = new ShExValidator(schema, RdfJsDb(graph(turtle)), validatorOptions);
  Reduce.register(validator, options.api);
  const res = validator.validateShapeMap(
    [{node: options.node || B + "x", shape: options.shape || B + "S"}]);
  expect(res[0].status, JSON.stringify(res[0].appinfo)).to.equal("conformant");
  return Reduce.reduce(res, Object.assign({evaluate, prefixes: PREFIXES}, options))[0];
}

const ONE_ARC = "<http://a.example/S> { :p1 . }";
const ONE_TRIPLE = ":x :p1 :o1 .";

describe("the JavaScript evaluator", function () {

  it("should be the module's default export", function () {
    expect(typeof evaluate).to.equal("function");
    expect(evaluate).to.equal(evaluate.evaluate);
  });

  ["mutate", "index"].forEach(mode => {
    const run = (...args) => reduce(mode, ...args);

    describe(`under an overlay that ${mode === "mutate" ? "writes on" : "indexes"} the schema`, function () {

      it("should run an expression", function () {
        expect(run(ONE_ARC, ONE_TRIPLE, {S: "({got: one(':p1')})"}))
          .to.deep.equal({got: B + "o1"});
      });

      it("should run a function body", function () {
        expect(run(ONE_ARC, ONE_TRIPLE, {S: "const v = one(':p1'); return v + '!';"}))
          .to.equal(B + "o1!");
      });

      it("should read a leading brace as an object, not a block", function () {
        expect(run(ONE_ARC, ONE_TRIPLE, {S: "{a: 1}"})).to.deep.equal({a: 1});
      });

      describe("the names it puts in scope", function () {

        it("should expand a prefixed name against the reduce options' prefixes", function () {
          expect(run(ONE_ARC, ONE_TRIPLE, {S: "one(':p1')"})).to.equal(B + "o1");
          expect(run(ONE_ARC, ONE_TRIPLE, {S: "one('http://a.example/p1')"})).to.equal(B + "o1");
        });

        it("should read `a` as rdf:type", function () {
          expect(run("<http://a.example/S> { a . }", ":x a :T .", {S: "local(one('a'))"}))
            .to.equal("T");
        });

        it("should count with one, opt, all and has", function () {
          const schema = "<http://a.example/S> { :p1 . ; :p2 . * }";
          const data = ":x :p1 :o1 ; :p2 :o2 , :o3 .";
          expect(run(schema, data,
                     {S: "[one(':p1'), opt(':nope'), all(':p2').sort(), has(':p2'), has(':nope')]"}))
            .to.deep.equal([B + "o1", undefined, [B + "o2", B + "o3"], true, false]);
          expect(() => run(schema, data, {S: "one(':p2')"})).to.throw(/found 2 values/);
          expect(() => run(schema, data, {S: "one(':nope')"}), "and says what it did see")
            .to.throw(/matched/);
        });

        it("should read terms", function () {
          const schema = "<http://a.example/S> { :p1 xsd:integer ; :p2 . ; :p3 . }";
          const data = ':x :p1 42 ; :p2 <http://a.example/some/where#frag> ; :p3 [ ] .';
          expect(run(schema, data, {S: "[str(one(':p1')), num(one(':p1')), datatype(one(':p1'))]"}))
            .to.deep.equal(["42", 42, XSD + "integer"]);
          expect(run(schema, data, {S: "[local(one(':p2')), isBnode(one(':p3')), isBnode(one(':p2'))]"}))
            .to.deep.equal(["frag", true, false]);
          expect(() => run(schema, data, {S: "iri(one(':p1'))"})).to.throw(/expected an IRI/);
        });

        it("should put the caller's api alongside them", function () {
          expect(run(ONE_ARC, ONE_TRIPLE, {S: "helper(node)"},
                     {api: {helper: n => "saw " + n}}))
            .to.equal("saw " + B + "x");
        });

        it("should name which prefixes it knows when one is missing", function () {
          expect(() => run(ONE_ARC, ONE_TRIPLE, {S: "one('nope:p1')"}))
            .to.throw(/no prefix "nope:"/);
          expect(() => run(ONE_ARC, ONE_TRIPLE, {S: "one('nope:p1')"})).to.throw(/xsd:/);
        });
      });

      describe("a triple constraint's action", function () {
        const LABELLED = "<http://a.example/S> { $<http://a.example/S-p1> :p1 . }";

        it("should see the triple and what its object reduced to", function () {
          expect(run(LABELLED, ONE_TRIPLE,
                     {S: "one(':p1')", "S-p1": "[subject, predicate, object, value]"}))
            .to.deep.equal([B + "x", B + "p1", B + "o1", B + "o1"]);
        });

        it("should still have the accessors, over no arcs", function () {
          expect(run(LABELLED, ONE_TRIPLE,
                     {S: "one(':p1')", "S-p1": "[has(':p1'), all(':p1')]"}))
            .to.deep.equal([false, []]);
        });
      });

      /* `$` is rewritten to a name before the code arrives, and answering
       * with what the action assigned to it is this module's half of that. */
      it("should answer with what the action assigned to $", function () {
        expect(run(ONE_ARC, ONE_TRIPLE, {S: "$ = {got: one(':p1')}; $.also = 1;"}))
          .to.deep.equal({got: B + "o1", also: 1});
      });

      it("should reduce a shape with no action to its node", function () {
        expect(run("<http://a.example/S> { :p1 @<http://a.example/T> }\n"
                   + "<http://a.example/T> { :p2 . }",
                   ":x :p1 :y . :y :p2 :z .", {S: "one(':p1')"}))
          .to.equal(B + "y");
      });
    });
  });

  /* The two modes differ in what they leave behind, and in nothing else. */
  describe("the two overlay modes", function () {
    const SCHEMA = "<http://a.example/S> { :p1 . }";
    const ACTIONS = {S: "({got: one(':p1')})"};

    it("should reduce to the same thing either way", function () {
      expect(reduce("mutate", SCHEMA, ONE_TRIPLE, ACTIONS))
        .to.deep.equal(reduce("index", SCHEMA, ONE_TRIPLE, ACTIONS));
    });

    it("should write the actions into the schema, or not", function () {
      const written = parse(SCHEMA);
      applyOverlay(written, overlayOf(ACTIONS));
      expect(written._index.shapeExprs[B + "S"].shapeExpr.semActs.length).to.equal(1);

      const indexed = parse(SCHEMA);
      const before = JSON.stringify(indexed);
      const index = indexOverlay(indexed, overlayOf(ACTIONS));
      expect(JSON.stringify(indexed), "the schema is as it was").to.equal(before);
      expect(index.get(indexed._index.shapeExprs[B + "S"].shapeExpr).length).to.equal(1);
    });

    /* An indexed action is dispatched because the validator asks the
     * dispatcher what applies to an element rather than reading .semActs,
     * so a schema that says nothing still runs the overlay's actions. */
    it("should dispatch an indexed action on a schema that carries none", function () {
      const schema = parse(SCHEMA);
      const validator = new ShExValidator(schema, RdfJsDb(graph(ONE_TRIPLE)),
                                          {semActIndex: indexOverlay(schema, overlayOf(ACTIONS))});
      Reduce.register(validator);
      const res = validator.validateShapeMap([{node: B + "x", shape: B + "S"}]);
      expect(res[0].appinfo.extensions[Reduce.url].code).to.equal(ACTIONS.S);
      expect(JSON.stringify(schema)).to.not.include("semActs");
    });
  });
});
