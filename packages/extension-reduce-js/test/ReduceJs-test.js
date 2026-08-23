/** The JavaScript evaluator, on its own.
 *
 * `@shexjs/extension-reduce`'s tests exercise this through the fold, which
 * is how it is used.  These call it directly with a scope written out by
 * hand, because that scope is the contract another implementation would
 * write against: whatever `extension-reduce` hands an evaluator, this is
 * what it looks like.
 */
"use strict";

const {expect} = require("chai");
const evaluate = require("..");

const B = "http://a.example/";

/** the scope extension-reduce builds for a shape that matched */
const shapeScope = (arcs, extra) => Object.assign({
  kind: "shape",
  where: `<${B}S> at <${B}x>`,
  prefixes: {"": B, xsd: "http://www.w3.org/2001/XMLSchema#"},
  api: {},
  node: B + "x",
  shape: B + "S",
  arcs,
}, extra);

describe("the JavaScript evaluator", function () {

  it("should be the module's default export", function () {
    expect(typeof evaluate).to.equal("function");
    expect(evaluate).to.equal(evaluate.evaluate);
  });

  it("should run an expression", function () {
    expect(evaluate("({got: one(':p1')})", shapeScope({[B + "p1"]: [B + "o1"]})))
      .to.deep.equal({got: B + "o1"});
  });

  it("should run a function body", function () {
    expect(evaluate("const v = one(':p1'); return v + '!';",
                    shapeScope({[B + "p1"]: ["x"]})))
      .to.equal("x!");
  });

  it("should read a leading brace as an object, not a block", function () {
    expect(evaluate("{a: 1}", shapeScope({}))).to.deep.equal({a: 1});
  });

  describe("the names it puts in scope", function () {

    it("should expand a prefixed name against the scope's prefixes", function () {
      expect(evaluate("one(':p1')", shapeScope({[B + "p1"]: [1]}))).to.equal(1);
      expect(evaluate("one('http://a.example/p1')", shapeScope({[B + "p1"]: [1]}))).to.equal(1);
    });

    it("should read `a` as rdf:type", function () {
      const rdfType = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
      expect(evaluate("local(one('a'))", shapeScope({[rdfType]: [B + "T"]}))).to.equal("T");
    });

    it("should count with one, opt, all and has", function () {
      const scope = shapeScope({[B + "p1"]: [1], [B + "p2"]: [2, 3]});
      expect(evaluate("[one(':p1'), opt(':nope'), all(':p2'), has(':p2'), has(':nope')]", scope))
        .to.deep.equal([1, undefined, [2, 3], true, false]);
      expect(() => evaluate("one(':p2')", scope)).to.throw(/found 2 values/);
      expect(() => evaluate("one(':nope')", scope), "and says what it did see")
        .to.throw(new RegExp(`<${B}S> at <${B}x> matched`));
    });

    it("should read terms", function () {
      const scope = shapeScope({[B + "p1"]: [{value: "42", type: B + "int"}],
                                [B + "p2"]: [B + "some/where#frag"],
                                [B + "p3"]: ["_:b0"]});
      expect(evaluate("[str(one(':p1')), num(one(':p1')), datatype(one(':p1'))]", scope))
        .to.deep.equal(["42", 42, B + "int"]);
      expect(evaluate("[local(one(':p2')), isBnode(one(':p3')), isBnode(one(':p2'))]", scope))
        .to.deep.equal(["frag", true, false]);
      expect(() => evaluate("iri(one(':p1'))", scope)).to.throw(/expected an IRI/);
    });

    it("should put the caller's api alongside them", function () {
      expect(evaluate("helper(node)", shapeScope({}, {api: {helper: n => "saw " + n}})))
        .to.equal("saw " + B + "x");
    });

    it("should name which prefixes it knows when one is missing", function () {
      expect(() => evaluate("one('nope:p1')", shapeScope({})))
        .to.throw(/no prefix "nope:"/);
      expect(() => evaluate("one('nope:p1')", shapeScope({})))
        .to.throw(/xsd:/);
    });
  });

  describe("a triple constraint's scope", function () {
    const tcScope = {
      kind: "tripleConstraint",
      where: `the constraint on <${B}p1>`,
      prefixes: {"": B}, api: {}, arcs: {},
      subject: B + "x", predicate: B + "p1", object: B + "o1", value: {reduced: true},
    };

    it("should offer the triple and what its object reduced to", function () {
      expect(evaluate("[subject, predicate, object, value]", tcScope))
        .to.deep.equal([B + "x", B + "p1", B + "o1", {reduced: true}]);
    });

    it("should still have the accessors, over no arcs", function () {
      expect(evaluate("[has(':p1'), all(':p1')]", tcScope)).to.deep.equal([false, []]);
    });
  });
});
