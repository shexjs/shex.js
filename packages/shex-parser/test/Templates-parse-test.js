"use strict";
// ShExC template strawman (doc/templates.md): parsing.
// A parameter list after a shape label declares a template; an argument
// list after a shape reference applies one.

const {expect} = require("chai");
const ShExParser = require("..");

const base = "http://a.example/";
const parse = text => ShExParser.construct(base, {ex: "http://ex.example/#"}).parse(text);

describe("ShExC templates: parsing", function () {
  it("should parse a recursive template declaration and its uses", function () {
    const schema = parse(`
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
<#List1Plus><<?T>> CLOSED {
  rdf:first ?T ;
  rdf:rest  [rdf:nil] OR @<#List1Plus><<?T>>
}
<#ShapeDecl> { <p1> . }
<#ShapeDeclList1Plus> @<#List1Plus><< @<#ShapeDecl> >>
`);
    expect(schema.templates).to.have.length(1);
    const tpl = schema.templates[0];
    expect(tpl.type).to.equal("TemplateDecl");
    expect(tpl.id).to.equal(base + "#List1Plus");
    expect(tpl.params).to.deep.equal([{name: "T"}]);
    const [first, rest] = tpl.shapeExpr.expression.expressions;
    expect(first.valueExpr).to.deep.equal({type: "ParamRef", name: "T"});
    expect(rest.valueExpr.shapeExprs[1]).to.deep.equal(
      {type: "TemplateApp", template: base + "#List1Plus", args: [{type: "ParamRef", name: "T"}]});
    // a declaration whose body is an application names that instantiation
    expect(schema.shapes[1].shapeExpr).to.deep.equal(
      {type: "TemplateApp", template: base + "#List1Plus", args: [base + "#ShapeDecl"]});
  });

  it("should parse parameter kinds and bounds", function () {
    const schema = parse(`
<#Qualified><<?P IRI, ?V EXTENDS <#Base>>> { ?P ?V ? }
`);
    expect(schema.templates[0].params).to.deep.equal([
      {name: "P", kind: "iri"},
      {name: "V", extends: base + "#Base"},
    ]);
    const tc = schema.templates[0].shapeExpr.expression;
    expect(tc.predicate).to.deep.equal({type: "ParamRef", name: "P"});
    expect(tc.valueExpr).to.deep.equal({type: "ParamRef", name: "V"});
    expect(tc.min).to.equal(0); // `?V ?` : a ParamRef then a cardinality
  });

  it("should parse argument forms: ref, node constraint, nested application, parameter", function () {
    const schema = parse(`
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
<#L><<?T>> { <p> ?T }
<#Pair><<?A, ?B>> { <l> ?A ; <r> @<#L><<?B>> }
<#D> { <q> . }
<#use> { <r> @<#Pair><< xsd:integer, @<#L><<@<#D>>> >> }
`);
    const app = schema.shapes[1].shapeExpr.expression.valueExpr;
    expect(app.args[0]).to.deep.equal({type: "NodeConstraint", datatype: "http://www.w3.org/2001/XMLSchema#integer"});
    expect(app.args[1]).to.deep.equal({type: "TemplateApp", template: base + "#L", args: [base + "#D"]});
  });

  it("should leave template-free schemas without a templates member", function () {
    const schema = parse("<#S> { <p1> . }");
    expect(schema).not.to.have.property("templates");
  });

  it("should refuse an ABSTRACT template", function () {
    expect(() => parse("ABSTRACT <#T><<?X>> { <p> ?X }")).to.throw(/may not be ABSTRACT/);
  });

  it("should refuse a template label already declared as a shape", function () {
    expect(() => parse("<#T> { <p> . }\n<#T><<?X>> { <p> ?X }")).to.throw(/is a shape expression/);
  });

  it("should keep `?` as a cardinality when not glued to a name", function () {
    const schema = parse("<#S> { <p1> . ? }");
    expect(schema.shapes[0].shapeExpr.expression.min).to.equal(0);
  });
});
