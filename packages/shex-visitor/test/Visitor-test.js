/** ShExVisitor's refusals and the helpers the schema walks lean on. */
"use strict";

const expect = require("chai").expect;
const {ShExVisitor} = require("..");

describe("ShExVisitor", function () {
  const savedWarn = console.warn;
  beforeEach(function () { console.warn = () => {}; });
  afterEach(function () { console.warn = savedWarn; });

  it("maps over an object's values", function () {
    expect(ShExVisitor.visitMap({a: 1, b: 2}, v => v * 10)).to.deep.equal({a: 10, b: 20});
    expect(new ShExVisitor().visitPrefixes(undefined)).to.equal(undefined);
    expect(new ShExVisitor().visitPrefixes({ex: "http://a.example/"})).to.deep.equal({ex: "http://a.example/"});
  });

  it("refuses expressions and references of the wrong kind", function () {
    const v = new ShExVisitor();
    expect(() => v.visitShapeExpr({type: "Bogus"})).to.throw(/unexpected shapeExpr type: Bogus/);
    expect(() => v.visitTripleExpr({type: "Bogus"})).to.throw(/unexpected expression type: Bogus/);
    expect(() => v.visitShapeRef(42)).to.throw(/visitShapeRef expected a string, not 42/);
    expect(() => v.visitInclusion({})).to.throw(/visitInclusion expected a string/);
    expect(() => v.runtimeError(Error("passed through"))).to.throw(/passed through/);
  });

  it("checks stems, stem ranges and exclusions", function () {
    const v = new ShExVisitor();
    expect(v.visitStemRange({type: "IriStemRange", stem: "http://a.example/", exclusions: ["http://a.example/x", {type: "IriStem", stem: "http://a.example/y"}]}))
      .to.deep.equal({type: "IriStemRange", stem: "http://a.example/", exclusions: ["http://a.example/x", {type: "IriStem", stem: "http://a.example/y"}]});
    expect(() => v.visitStemRange({stem: "x"})).to.throw(/to have a 'type' attribute/);
    expect(() => v.visitStemRange({type: "Bogus", stem: "x"})).to.throw(/to be in/);
    expect(() => v.visitExclusion({stem: "x"})).to.throw(/to have a 'type' attribute/);
    expect(() => v.visitExclusion({type: "Bogus", stem: "x"})).to.throw(/to be in/);
  });

  it("refuses a member it has no visitor for", function () {
    const v = new ShExVisitor();
    expect(() => v._maybeSet({nonesuch: 1}, {}, "Test", ["nonesuch"], null)).to.throw(/visitNonesuch not found in Visitor/);
    expect(() => v._expect({a: 1}, "b")).to.throw(/to have a \.b/);
    expect(() => v._expect({a: 1}, "a", 2)).to.throw(/expected 1 to equal 2/);
  });
});
