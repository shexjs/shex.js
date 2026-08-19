/** What an action sees, and what it may say.
 *
 * The two examples show the thing working; this is the contract underneath
 * it -- which names are in scope, what happens when an arc isn't there, and
 * what a cycle or a conjunction reduces to.
 */
"use strict";

const {expect} = require("chai");
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("@shexjs/validator");
const Reduce = require("..");

const B = "http://a.example/";
const PREFIXES = {"": B, xsd: "http://www.w3.org/2001/XMLSchema#"};
const EXT = Reduce.url;

/** parse ShExC, hang `actions` (label -> code) on the shapes, validate, reduce */
function run (shexc, turtle, actions, node = B + "x", shape = B + "S", options = {}) {
  const schema = ShExParser.construct(B, null, {index: true})
        .parse("PREFIX : <http://a.example/>\nPREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n"
               + shexc, B, undefined, "reduce-test");
  Object.keys(actions).forEach(label => {
    const at = schema._index.shapeExprs[B + label] || schema._index.tripleExprs[B + label];
    if (at === undefined) throw Error("no <" + B + label + "> in the test schema");
    let elt = at.type === "ShapeDecl" ? at.shapeExpr : at;
    // ShExJ has no semActs on a ShapeAnd/ShapeOr, so an action written for
    // `IRI AND { ... }` goes on the conjunct that has a body
    if (elt.type === "ShapeAnd" || elt.type === "ShapeOr")
      elt = elt.shapeExprs.find(e => e.type === "Shape") || elt.shapeExprs[0];
    elt.semActs = (elt.semActs || []).concat(
      [{type: "SemAct", name: EXT, code: actions[label]}]);
  });
  const graph = new N3.Store();
  graph.addQuads(new N3.Parser({baseIRI: B, format: "text/turtle"})
                 .parse("PREFIX : <http://a.example/>\n" + turtle));
  const validator = new ShExValidator(schema, RdfJsDb(graph), {});
  Reduce.register(validator);
  const res = validator.validateShapeMap([{node, shape}]);
  expect(res[0].status, JSON.stringify(res[0].appinfo)).to.equal("conformant");
  return Reduce.reduce(res, Object.assign({prefixes: PREFIXES}, options))[0];
}

const ONE_ARC = "<http://a.example/S> { :p1 . }";
const ONE_TRIPLE = ":x :p1 :o1 .";

describe("reduce", function () {

  describe("writing an action", function () {

    it("should take an expression", function () {
      expect(run(ONE_ARC, ONE_TRIPLE, {S: "{got: one(':p1')}"}))
        .to.deep.equal({got: B + "o1"});
    });

    it("should take a function body", function () {
      expect(run(ONE_ARC, ONE_TRIPLE, {S: "const v = one(':p1'); return {got: v};"}))
        .to.deep.equal({got: B + "o1"});
    });

    /* An object literal at the head of a statement is a block in JavaScript,
     * so the expression reading has to be tried first for `{a: 1}` to mean
     * what everybody writing an action means by it. */
    it("should read a leading brace as an object, not a block", function () {
      expect(run(ONE_ARC, ONE_TRIPLE, {S: "{}"})).to.deep.equal({});
    });

    it("should say where an action went wrong", function () {
      expect(() => run(ONE_ARC, ONE_TRIPLE, {S: "nope()"}))
        .to.throw(/reducing <http:\/\/a.example\/S> at <http:\/\/a.example\/x>/);
      expect(() => run(ONE_ARC, ONE_TRIPLE, {S: "nope()"}), "and what went wrong")
        .to.throw(/nope/);
    });

    it("should put the caller's api in scope", function () {
      expect(run(ONE_ARC, ONE_TRIPLE, {S: "helper(one(':p1'))"}, undefined, undefined,
                 {api: {helper: v => "saw " + v}}))
        .to.equal("saw " + B + "o1");
    });
  });

  describe("reaching the arcs", function () {
    const TWO = "<http://a.example/S> { :p1 . ; :p2 . * }";
    const DATA = ":x :p1 :o1 ; :p2 :o2 , :o3 .";

    it("should give one value for one(), all of them for all()", function () {
      expect(run(TWO, DATA, {S: "({one: one(':p1'), all: all(':p2').sort()})"}))
        .to.deep.equal({one: B + "o1", all: [B + "o2", B + "o3"]});
    });

    it("should complain when one() isn't one", function () {
      expect(() => run(TWO, DATA, {S: "one(':p2')"}))
        .to.throw(/one\(":p2"\) found 2 values/);
    });

    it("should let opt() be absent but not plural", function () {
      expect(run(TWO, ":x :p1 :o1 .", {S: "({p2: opt(':p2')})"})).to.deep.equal({p2: undefined});
      expect(() => run(TWO, DATA, {S: "opt(':p2')"})).to.throw(/opt\(":p2"\) found 2 values/);
    });

    it("should answer has() either way", function () {
      expect(run(TWO, ":x :p1 :o1 .", {S: "[has(':p1'), has(':p2')]"}))
        .to.deep.equal([true, false]);
    });

    it("should name the arcs it did see when one() finds none", function () {
      expect(() => run(TWO, DATA, {S: "one(':nope')"}))
        .to.throw(/one\(":nope"\) found 0 values/);
      expect(() => run(TWO, DATA, {S: "one(':nope')"}), "and what it did match")
        .to.throw(/p1/);
    });
  });

  describe("naming a predicate", function () {

    it("should expand a prefixed name", function () {
      expect(run(ONE_ARC, ONE_TRIPLE, {S: "one(':p1')"})).to.equal(B + "o1");
    });

    it("should take a full IRI", function () {
      expect(run(ONE_ARC, ONE_TRIPLE, {S: "one('http://a.example/p1')"})).to.equal(B + "o1");
    });

    it("should read `a` as rdf:type", function () {
      expect(run("<http://a.example/S> { a . }", ":x a :T .", {S: "local(one('a'))"}))
        .to.equal("T");
    });

    it("should say which prefixes it knows when one is missing", function () {
      expect(() => run(ONE_ARC, ONE_TRIPLE, {S: "one('nope:p1')"}))
        .to.throw(/no prefix "nope:"/);
      expect(() => run(ONE_ARC, ONE_TRIPLE, {S: "one('nope:p1')"}), "and which it does know")
        .to.throw(/xsd:/);
    });
  });

  describe("what a production reduces to", function () {

    it("should be the node, for a shape with no action", function () {
      expect(run("<http://a.example/S> { :p1 @<http://a.example/T> }\n"
                 + "<http://a.example/T> { :p2 . }",
                 ":x :p1 :y . :y :p2 :z .", {S: "one(':p1')"}))
        .to.equal(B + "y");
    });

    it("should be what the referenced shape's action said", function () {
      expect(run("<http://a.example/S> { :p1 @<http://a.example/T> }\n"
                 + "<http://a.example/T> { :p2 . }",
                 ":x :p1 :y . :y :p2 :z .",
                 {S: "one(':p1')", T: "{inner: one(':p2')}"}))
        .to.deep.equal({inner: B + "z"});
    });

    /* An AND is several constraints on one node; the conjunct with an action
     * is the one that has anything to say about it. */
    it("should be the conjunct that spoke, for an AND", function () {
      expect(run("<http://a.example/S> IRI AND { :p1 . }", ONE_TRIPLE, {S: "{spoke: true}"}))
        .to.deep.equal({spoke: true});
    });

    it("should be the node when no conjunct spoke", function () {
      expect(run("<http://a.example/S> IRI AND { :p1 . }", ONE_TRIPLE, {}))
        .to.equal(B + "x");
    });

    it("should be the branch that matched, for an OR", function () {
      expect(run("<http://a.example/S> @<http://a.example/T> OR @<http://a.example/U>\n"
                 + "<http://a.example/T> { :p9 . }\n<http://a.example/U> { :p1 . }",
                 ONE_TRIPLE, {U: "'took U'"}))
        .to.equal("took U");
    });
  });

  describe("an action on a triple constraint", function () {

    it("should stand in for the arc's value", function () {
      const schema = "<http://a.example/S> { $<http://a.example/S-p1> :p1 . }";
      expect(run(schema, ONE_TRIPLE, {S: "one(':p1')", "S-p1": "'seen ' + object"}))
        .to.equal("seen " + B + "o1");
    });

    it("should see what its object reduced to", function () {
      const schema = "<http://a.example/S> { $<http://a.example/S-p1> :p1 @<http://a.example/T> }\n"
            + "<http://a.example/T> { :p2 . }";
      expect(run(schema, ":x :p1 :y . :y :p2 :z .",
                 {S: "one(':p1')", T: "{inner: one(':p2')}", "S-p1": "({wrapped: value})"}))
        .to.deep.equal({wrapped: {inner: B + "z"}});
    });
  });

  describe("terms", function () {

    it("should read a literal as a string or a number", function () {
      expect(run("<http://a.example/S> { :p1 xsd:integer }", ':x :p1 42 .',
                 {S: "[str(one(':p1')), num(one(':p1')), datatype(one(':p1'))]"}))
        .to.deep.equal(["42", 42, "http://www.w3.org/2001/XMLSchema#integer"]);
    });

    it("should read a language tag", function () {
      expect(run("<http://a.example/S> { :p1 . }", ':x :p1 "bonjour"@fr .',
                 {S: "[str(one(':p1')), lang(one(':p1'))]"}))
        .to.deep.equal(["bonjour", "fr"]);
    });

    it("should know a blank node from an IRI", function () {
      expect(run("<http://a.example/S> { :p1 . }", ":x :p1 [ ] .",
                 {S: "isBnode(one(':p1'))"})).to.equal(true);
      expect(run(ONE_ARC, ONE_TRIPLE, {S: "isBnode(one(':p1'))"})).to.equal(false);
    });

    it("should refuse to read a literal as an IRI", function () {
      expect(() => run("<http://a.example/S> { :p1 . }", ':x :p1 "s" .',
                       {S: "iri(one(':p1'))"})).to.throw(/expected an IRI/);
    });
  });

  describe("a cycle in the data", function () {
    const CYCLE = "<http://a.example/S> { :p1 @<http://a.example/S> }";
    const LOOP = ":x :p1 :x .";

    it("should reduce to the node, so a reference stays a reference", function () {
      expect(run(CYCLE, LOOP, {S: "({at: node, next: one(':p1')})"}))
        .to.deep.equal({at: B + "x", next: B + "x"});
    });

    it("should say so with onRecursion: marker", function () {
      expect(run(CYCLE, LOOP, {S: "one(':p1')"}, undefined, undefined, {onRecursion: "marker"}))
        .to.deep.equal({type: "Recursion", node: B + "x", shape: B + "S"});
    });

    it("should refuse with onRecursion: throw", function () {
      expect(() => run(CYCLE, LOOP, {S: "one(':p1')"}, undefined, undefined,
                       {onRecursion: "throw"}))
        .to.throw(/the data has a cycle/);
    });
  });

  /* Dispatch only records that an action applies, so a partition the matcher
   * tries and abandons leaves nothing behind. */
  it("should not let an action decide a match", function () {
    expect(run("<http://a.example/S> { :p1 . ; :p1 . }", ":x :p1 :o1 , :o2 .",
               {S: "all(':p1').length"}))
      .to.equal(2);
  });

  it("should reduce every pair in a shape map", function () {
    const schema = ShExParser.construct(B, null, {index: true})
          .parse("PREFIX : <http://a.example/>\n<http://a.example/S> { :p1 . }",
                 B, undefined, "reduce-test");
    schema._index.shapeExprs[B + "S"].shapeExpr.semActs =
      [{type: "SemAct", name: EXT, code: "({at: node})"}];
    const graph = new N3.Store();
    graph.addQuads(new N3.Parser({baseIRI: B, format: "text/turtle"})
                   .parse("PREFIX : <http://a.example/>\n:x :p1 :o . :y :p1 :o ."));
    const validator = new ShExValidator(schema, RdfJsDb(graph), {});
    Reduce.register(validator);
    const res = validator.validateShapeMap(
      [{node: B + "x", shape: B + "S"}, {node: B + "y", shape: B + "S"}]);
    expect(Reduce.reduce(res, {prefixes: PREFIXES}))
      .to.deep.equal([{at: B + "x"}, {at: B + "y"}]);
  });

  it("should refuse a validator it can't register on", function () {
    expect(() => Reduce.register({})).to.throw(/wants a ShExValidator/);
  });
});
