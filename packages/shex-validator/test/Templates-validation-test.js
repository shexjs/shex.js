"use strict";
// Templates (doc/templates.md) meet the validator: expansion produces plain
// ShExJ, so validation over an expanded schema needs nothing new — these
// tests keep that true for the two motivating patterns, the STL-ish list
// and the design-pattern template shared across a wide schema.

const {expect} = require("chai");
const {ShExValidator} = require("..");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const ShExParser = require("@shexjs/parser");
const ShExUtil = require("@shexjs/util");
const {Store, Parser: N3Parser} = require("n3");

const base = "http://a.example/";
function setup (shexc, turtle) {
  const schema = ShExUtil.expandTemplates(
    ShExParser.construct(base, {ex: "http://ex.example/#"}).parse(shexc));
  const graph = new Store(new N3Parser({baseIRI: base, format: "text/turtle"}).parse(turtle));
  return new ShExValidator(schema, RdfJsDb(graph));
}
const PREFIXES = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\nPREFIX ex: <http://ex.example/#>\n";

describe("ShExC templates: validation over the expanded schema", function () {
  const rosterShexC = PREFIXES + `
<#List1Plus><<?T>> CLOSED {
  rdf:first ?T ;
  rdf:rest  [rdf:nil] OR @<#List1Plus><<?T>>
}
<#Person> { ex:name . }
<#Team> { ex:members @<#List1Plus><< @<#Person> >> }
`;

  it("should walk a well-formed list through an instantiated shape", function () {
    const validator = setup(rosterShexC, PREFIXES + `
<t1> ex:members (<alice> <bob>) .
<alice> ex:name "Alice" .
<bob> ex:name "Bob" .
`);
    const [res] = validator.validateShapeMap([{node: base + "t1", shape: base + "#Team"}]);
    expect(res.status).to.equal("conformant");
  });

  it("should fail a broken list the way the hand-written shape would", function () {
    const validator = setup(rosterShexC, PREFIXES + `
<t1> ex:members <l1> .
<l1> rdf:first <alice> ; rdf:rest "oops" .
<alice> ex:name "Alice" .
`);
    const [res] = validator.validateShapeMap([{node: base + "t1", shape: base + "#Team"}]);
    expect(res.status).to.equal("nonconformant");
  });

  it("should validate a design-pattern template with an IRI parameter", function () {
    const validator = setup(PREFIXES + `
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
<#Qualified><<?P IRI, ?V>> { ?P ?V ; ex:certainty xsd:decimal ? }
<#Obs> { ex:height @<#Qualified><< ex:cm, xsd:integer >> }
`,
    PREFIXES + `
<o1> ex:height <m1> .
<m1> ex:cm 170 ; ex:certainty 0.9 .
`);
    const [res] = validator.validateShapeMap([{node: base + "o1", shape: base + "#Obs"}]);
    expect(res.status).to.equal("conformant");
  });
});
