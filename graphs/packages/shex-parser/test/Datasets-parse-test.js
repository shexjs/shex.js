"use strict";
// The datasets strawman (doc/datasets.md): parsing `GRAPH (iri | TERM |
// FRAGMENT)` between a triple constraint's predicate and value expression.

const {expect} = require("chai");
const ShExParser = require("..");

const base = "http://a.example/";
const parse = text => ShExParser.construct(base, {ex: "http://ex.example/#"}).parse(text);
const firstTC = schema => {
  const e = schema.shapes[0].shapeExpr.expression;
  return e.type === "TripleConstraint" ? e : e.expressions[0];
};

describe("ShExC datasets: parsing GRAPH", function () {
  it("should parse a fixed graph name, resolved against the base", function () {
    const tc = firstTC(parse("<#S1> { ^ex:manages GRAPH <CardCatalog> @<#entry> ; ex:foo LITERAL }"));
    expect(tc.inverse).to.equal(true);
    expect(tc.graph).to.equal(base + "CardCatalog");
  });

  it("should parse GRAPH TERM and GRAPH FRAGMENT, case-insensitively", function () {
    expect(firstTC(parse("<#G> { ex:chromosome GRAPH TERM @<#chr>* }")).graph)
      .to.deep.equal({type: "GraphTerm"});
    expect(firstTC(parse("<#P> { ex:knows graph fragment @<#P> * }")).graph)
      .to.deep.equal({type: "GraphFragment"});
  });

  it("should leave unmodified constraints without a graph member", function () {
    expect(firstTC(parse("<#S> { <p> . }"))).to.not.have.property("graph");
  });

  it("should keep GRAPH, TERM and FRAGMENT usable as prefixed-name parts", function () {
    const schema = parse("<#S> { ex:GRAPH ex:TERM ; ex:p ex:FRAGMENT }");
    const [a, b] = schema.shapes[0].shapeExpr.expression.expressions;
    expect(a.predicate).to.equal("http://ex.example/#GRAPH");
    expect(a.valueExpr.datatype).to.equal("http://ex.example/#TERM");
    expect(b.valueExpr.datatype).to.equal("http://ex.example/#FRAGMENT");
  });

  it("should round-trip through the writer", function (done) {
    const schema = parse(`
<#S1> { ^ex:manages GRAPH <CardCatalog> @<#entry> ; ex:c GRAPH TERM @<#chr> ; ex:k GRAPH FRAGMENT @<#P> ? }`);
    new (require("@shexjs/writer"))({base})
      .writeSchema(schema, (error, text) => {
        if (error) return done(error);
        expect(text).to.include("GRAPH <CardCatalog>");
        expect(text).to.include("GRAPH TERM");
        expect(text).to.include("GRAPH FRAGMENT");
        expect(parse(text.replace(/^/, "PREFIX ex: <http://ex.example/#>\n"))).to.exist;
        done();
      });
  });
});
