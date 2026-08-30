/** An old note asked whether Extend3G-pass covers a base shape constraining
 * one predicate twice with an extension adding a third constraint on it.
 * It does not quite (Extend3G's levels each constrain <p> once); this
 * does, and is the answer (plan.md G5). */
"use strict";

const expect = require("chai").expect;
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("..");

const base = "http://a.example/";
const schemaText = `PREFIX : <${base}>
<#Base> { :p1 [1] ; :p1 [2] }
<#Leaf> EXTENDS @<#Base> { :p1 [3] }
`;

function validate (values) {
  const schema = ShExParser.construct(base, {}, {index: true}).parse(schemaText);
  const graph = new N3.Store();
  graph.addQuads(new N3.Parser({baseIRI: base}).parse(`PREFIX : <${base}>\n:x :p1 ${values.join(", ")} .`));
  return new ShExValidator(schema, RdfJsDb(graph), {}).validateShapeMap([{node: base + "x", shape: base + "#Leaf"}])[0];
}

describe("EXTENDS over a base that constrains one predicate twice", function () {
  it("should take one arc per constraint, base and extension together", function () {
    expect(validate([1, 2, 3]).status).to.equal("conformant");
  });

  it("should miss the base's second arc", function () {
    const result = validate([1, 3]);
    expect(result.status).to.equal("nonconformant");
    expect(JSON.stringify(result.appinfo)).to.include("MissingProperty");
  });

  it("should miss the extension's arc", function () {
    expect(validate([1, 2]).status).to.equal("nonconformant");
  });

  it("should not take a fourth", function () {
    expect(validate([1, 2, 3, 4]).status).to.equal("nonconformant");
  });
});
