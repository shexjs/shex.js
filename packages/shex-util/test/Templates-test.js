"use strict";
// Template expansion (doc/templates.md): monomorphization, named
// instantiations, kinds, bounds, and the ShExR flagship — the templated
// ShExR expands to exactly the schema ShExR.shex hand-writes.

const Fs = require("fs");
const Path = require("path");
const {expect} = require("chai");
const ShExParser = require("@shexjs/parser");
const {expandTemplates, TemplateExpansionError} = require("@shexjs/util/lib/templates");

const base = "http://a.example/";
const parse = text => ShExParser.construct(base, {
  ex: "http://ex.example/#", xsd: "http://www.w3.org/2001/XMLSchema#"}).parse(text);
const expand = (text, opts) => expandTemplates(parse(text), opts);
const byId = schema => new Map(schema.shapes.map(d => [d.id, d]));

describe("ShExC templates: expansion", function () {

  it("should name an instantiation after the declaration that applies it", function () {
    const flat = expand(`
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
<#List1Plus><<?T>> CLOSED {
  rdf:first ?T ;
  rdf:rest  [rdf:nil] OR @<#List1Plus><<?T>>
}
<#Person> { ex:name . }
<#PersonList> @<#List1Plus><< @<#Person> >>
`);
    expect(flat).not.to.have.property("templates");
    const list = byId(flat).get(base + "#PersonList");
    const [first, rest] = list.shapeExpr.expression.expressions;
    expect(first.valueExpr).to.equal(base + "#Person");
    // the recursive reference resolves to the named instantiation itself
    expect(rest.valueExpr.shapeExprs[1]).to.equal(base + "#PersonList");
  });

  it("should give anonymous instantiations one deterministic label per argument list", function () {
    const flat = expand(`
<#L><<?T>> { <p> ?T ; <rest> @<#L><<?T>> ? }
<#a> { <q> @<#L><< IRI >> }
<#b> { <r> @<#L><< IRI >> ; <s> @<#L><< LITERAL >> }
`);
    const ids = [...byId(flat).keys()];
    const instances = ids.filter(id => id.includes("#L("));
    expect(instances).to.have.length(2); // IRI memoized across uses; LITERAL distinct
    const aRef = byId(flat).get(base + "#a").shapeExpr.expression.valueExpr;
    const bRef = byId(flat).get(base + "#b").shapeExpr.expression.expressions[0].valueExpr;
    expect(aRef).to.equal(bRef);
  });

  it("should substitute IRI-kind parameters in predicate position", function () {
    const flat = expand(`
<#Qualified><<?P IRI, ?V>> { ?P ?V ; ex:certainty xsd:decimal ? }
<#Obs> { ex:q @<#Qualified><< ex:height, xsd:integer >> }
`);
    const inst = [...byId(flat).values()].find(d => d.id.includes("#Qualified("));
    const [tc] = inst.shapeExpr.expression.expressions;
    expect(tc.predicate).to.equal("http://ex.example/#height");
    expect(tc.valueExpr).to.deep.equal({type: "NodeConstraint", datatype: "http://www.w3.org/2001/XMLSchema#integer"});
  });

  it("should pass parameters through nested applications, kinds intact", function () {
    const flat = expand(`
<#Inner><<?P IRI>> { ?P . }
<#Outer><<?Q>> { <wrap> @<#Inner><< ?Q >> }
<#use> { <u> @<#Outer><< ex:p1 >> }
`);
    const inner = [...byId(flat).values()].find(d => d.id.includes("#Inner("));
    expect(inner.shapeExpr.expression.predicate).to.equal("http://ex.example/#p1");
  });

  it("should enforce nominal EXTENDS bounds", function () {
    const good = `
<#Base> { <p> . }
<#Sub> EXTENDS @<#Base> { <q> . }
<#Holder><<?T EXTENDS <#Base>>> { <holds> ?T }
<#ok> { <h> @<#Holder><< @<#Sub> >> }
`;
    expect(() => expand(good)).not.to.throw();
    const bad = good.replace("<< @<#Sub> >>", "<< @<#Loner> >>") + "\n<#Loner> { <r> . }";
    expect(() => expand(bad)).to.throw(TemplateExpansionError, /does not EXTENDS/);
  });

  it("should refuse arity and kind mismatches with an instantiation trace", function () {
    expect(() => expand(`
<#Pair><<?A, ?B>> { <l> ?A ; <r> ?B }
<#x> { <p> @<#Pair><< IRI >> }
`)).to.throw(/takes 2 parameter\(s\)/);
    expect(() => expand(`
<#Pred><<?P IRI>> { ?P . }
<#x> { <p> @<#Pred><< { <inline> . } >> }
`)).to.throw(/wants an IRI/);
    expect(() => expand(`
<#Conflicted><<?X>> { ?X ?X }
<#x> { <p> @<#Conflicted><< IRI >> }
`)).to.throw(/both as an IRI and as a shape expression/);
  });

  it("should refuse an unbound parameter and an unknown template", function () {
    expect(() => expand("<#S><<?T>> { <p> ?T }\n<#loose> { <p> ?T }")).to.throw(/not a parameter here/);
    expect(() => expand("<#x> { <p> @<#Nope><< IRI >> }")).to.throw(/no template named/);
  });

  it("should stop argument-growing recursion at the instance limit, with a trace", function () {
    let caught = null;
    try {
      expand(`
<#Grow><<?T>> { <p> @<#Grow><< { <deeper> ?T } >> }
<#x> { <p> @<#Grow><< IRI >> }
`, {maxInstances: 8});
    } catch (e) { caught = e; }
    expect(caught).to.be.an.instanceof(TemplateExpansionError);
    expect(caught.message).to.match(/exceeded 8 instantiations/);
    expect(caught.message).to.match(/while instantiating/);
  });

  it("should expand the templated ShExR to exactly the hand-written ShExR", function () {
    const dir = Path.join(__dirname, "..");
    const load = f => ShExParser.construct("http://www.w3.org/ns/shex")
          .parse(Fs.readFileSync(Path.join(dir, f), "utf8"));
    const handWritten = load("ShExR.shex");
    const templated = expandTemplates(load("ShExR-templated.shex"));
    expect(templated.start).to.deep.equal(handWritten.start);
    const left = byId(templated), right = byId(handWritten);
    expect([...left.keys()].sort()).to.deep.equal([...right.keys()].sort());
    for (const [id, decl] of right)
      expect(left.get(id), id).to.deep.equal(decl);
  });
});
