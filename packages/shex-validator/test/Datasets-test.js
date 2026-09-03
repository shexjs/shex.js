"use strict";
// The datasets strawman (doc/datasets.md): validation over data spread
// across named graphs.  A GRAPH <g> constraint speaks of g's arcs and its
// value validates there; GRAPH TERM follows the graph the matched value
// names; GRAPH FRAGMENT follows the value's document (fragment stripped).
// Everything else sees the ambient view — the union, until narrowed.

const {expect} = require("chai");
const {ShExValidator} = require("..");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const ShExParser = require("@shexjs/parser");
const {Store, Parser: N3Parser} = require("n3");

const base = "http://a.example/";
const parse = text => ShExParser.construct(base, {ex: "http://ex.example/#"}).parse(text);
const dataset = trig => new Store(new N3Parser({baseIRI: base, format: "application/trig"}).parse(trig));
function status (schema, store, node, shape, options = {}) {
  const validator = new ShExValidator(schema, RdfJsDb(store), options);
  const n = node.startsWith("http") ? node : base + node;
  return validator.validateShapeMap([{node: n, shape: base + shape}])[0];
}

describe("ShExC datasets: GRAPH <g>", function () {
  const schema = parse(`
<#S1> { ^ex:manages GRAPH <CardCatalog> @<#catalogEntry> ; ex:foo LITERAL }
<#catalogEntry> { ex:manages IRI ; ex:source LITERAL }`);

  it("should find the catalog arc and entry in the named graph", function () {
    const store = dataset(`PREFIX ex: <http://ex.example/#>
<s1> ex:foo "bar" .
GRAPH <CardCatalog> { <entry1> ex:manages <s1> ; ex:source "the-void" . }`);
    expect(status(schema, store, "s1", "#S1").status).to.equal("conformant");
  });

  it("should refuse catalog data outside its graph", function () {
    const store = dataset(`PREFIX ex: <http://ex.example/#>
<s1> ex:foo "bar" .
<entry1> ex:manages <s1> ; ex:source "the-void" .`);
    expect(status(schema, store, "s1", "#S1").status).to.equal("nonconformant");
  });

  it("should keep the entry's own constraints inside the named graph", function () {
    // the arc is in the catalog but the entry's :source strayed to the default graph
    const store = dataset(`PREFIX ex: <http://ex.example/#>
<s1> ex:foo "bar" .
<entry1> ex:source "the-void" .
GRAPH <CardCatalog> { <entry1> ex:manages <s1> . }`);
    expect(status(schema, store, "s1", "#S1").status).to.equal("nonconformant");
  });
});

describe("ShExC datasets: GRAPH TERM", function () {
  const schema = parse(`
<#gene> { ex:chromosome GRAPH TERM @<#chromosome>* }
<#chromosome> { ex:assembly LITERAL+ }`);

  it("should validate the value in the graph it names", function () {
    const store = dataset(`PREFIX ex: <http://ex.example/#>
<BRCA1> ex:chromosome <chr17> .
GRAPH <chr17> { <chr17> ex:assembly "hg38" . }`);
    expect(status(schema, store, "BRCA1", "#gene").status).to.equal("conformant");
  });

  it("should refuse the value's data when it sits in the default graph", function () {
    const store = dataset(`PREFIX ex: <http://ex.example/#>
<BRCA1> ex:chromosome <chr17> .
<chr17> ex:assembly "hg38" .`);
    expect(status(schema, store, "BRCA1", "#gene").status).to.equal("nonconformant");
  });

  it("should refuse a literal value: a literal names no graph", function () {
    const schema2 = parse(`<#S> { ex:p GRAPH TERM LITERAL }`);
    const store = dataset(`PREFIX ex: <http://ex.example/#>\n<x> ex:p "lit" .`);
    const res = status(schema2, store, "x", "#S");
    expect(res.status).to.equal("nonconformant");
    expect(JSON.stringify(res.appinfo)).to.include("GraphNameViolation");
  });
});

describe("ShExC datasets: GRAPH FRAGMENT", function () {
  const schema = parse(`
<#Person> { ex:name LITERAL ; ex:knows GRAPH FRAGMENT @<#Person> * }`);

  it("should follow each person into their document's graph", function () {
    const store = dataset(`PREFIX ex: <http://ex.example/#>
GRAPH <http://alice.example/card> {
  <http://alice.example/card#me> ex:name "Alice" ; ex:knows <http://bob.example/card#me> .
}
GRAPH <http://bob.example/card> {
  <http://bob.example/card#me> ex:name "Bob" ; ex:knows <http://alice.example/card#me> .
}`);
    // mutual knows: the cycle terminates the way recursive shapes always have
    expect(status(schema, store, "http://alice.example/card#me", "#Person").status).to.equal("conformant");
  });

  it("should refuse an acquaintance with no document graph", function () {
    const store = dataset(`PREFIX ex: <http://ex.example/#>
GRAPH <http://bob.example/card> {
  <http://bob.example/card#me> ex:name "Bob" ; ex:knows <http://carol.example/card#me> .
}`);
    expect(status(schema, store, "http://bob.example/card#me", "#Person").status).to.equal("nonconformant");
  });
});

describe("ShExC datasets: views and the rest of the language", function () {
  it("should scope CLOSED to the view", function () {
    const schema = parse(`<#gene> { ex:chromosome GRAPH TERM @<#chromosome>* }
<#chromosome> CLOSED { ex:assembly LITERAL+ }`);
    // the chromosome graph holds only what <#chromosome> allows; noise in
    // the default graph about the same node is outside the view
    const store = dataset(`PREFIX ex: <http://ex.example/#>
<BRCA1> ex:chromosome <chr17> .
<chr17> ex:seenElsewhere "noise" .
GRAPH <chr17> { <chr17> ex:assembly "hg38" . }`);
    expect(status(schema, store, "BRCA1", "#gene").status).to.equal("conformant");
    const dirty = dataset(`PREFIX ex: <http://ex.example/#>
<BRCA1> ex:chromosome <chr17> .
GRAPH <chr17> { <chr17> ex:assembly "hg38" ; ex:extra "no" . }`);
    expect(status(schema, dirty, "BRCA1", "#gene").status).to.equal("nonconformant");
  });

  it("should judge one node separately under two views", function () {
    // the same <n> against the same <#Thing>, once per graph: <n> conforms
    // in <g1> and not in <g2>, in a single validation — the views keep
    // their own books (and their own recursion marks)
    const schema = parse(`<#Holder> { ex:a GRAPH <g1> @<#Thing> ; ex:b GRAPH <g2> @<#Thing> }
<#Thing> { ex:v LITERAL }`);
    const split = dataset(`PREFIX ex: <http://ex.example/#>
GRAPH <g1> { <h> ex:a <n> . <n> ex:v "1" . }
GRAPH <g2> { <h> ex:b <n> . }`);
    expect(status(schema, split, "h", "#Holder").status).to.equal("nonconformant");
    const whole = dataset(`PREFIX ex: <http://ex.example/#>
GRAPH <g1> { <h> ex:a <n> . <n> ex:v "1" . }
GRAPH <g2> { <h> ex:b <n> . <n> ex:v "2" . }`);
    expect(status(schema, whole, "h", "#Holder").status).to.equal("conformant");
  });

  it("should leave a same-predicate arc in another graph unmatched, not mismatched", function () {
    // GRAPH scoping works like SPARQL's: an ex:a arc outside <g1> is not
    // this constraint's business — an open shape ignores it, a CLOSED one
    // refuses it
    const schema = parse(`<#Holder> { ex:a GRAPH <g1> @<#Thing> }
<#Thing> { ex:v LITERAL }`);
    const store = dataset(`PREFIX ex: <http://ex.example/#>
<h> ex:a <stray> .
GRAPH <g1> { <h> ex:a <n> . <n> ex:v "1" . }`);
    expect(status(schema, store, "h", "#Holder").status).to.equal("conformant");
    const closed = parse(`<#Holder> CLOSED { ex:a GRAPH <g1> @<#Thing> }
<#Thing> { ex:v LITERAL }`);
    expect(status(closed, store, "h", "#Holder").status).to.equal("nonconformant");
  });

  it("should start where startGraph says", function () {
    const schema = parse(`<#S> { ex:p LITERAL }`);
    const store = dataset(`PREFIX ex: <http://ex.example/#>
GRAPH <g1> { <x> ex:p "in g1" . }`);
    expect(status(schema, store, "x", "#S").status, "union start sees g1").to.equal("conformant");
    expect(status(schema, store, "x", "#S", {startGraph: {termType: "NamedNode", value: base + "g1"}}).status,
           "explicit g1 start").to.equal("conformant");
    expect(status(schema, store, "x", "#S", {startGraph: {termType: "DefaultGraph", value: ""}}).status,
           "default-graph start sees nothing").to.equal("nonconformant");
  });

  it("should leave graph-free schemas over multi-graph data as they were: the union", function () {
    const schema = parse(`<#S> { ex:p LITERAL ; ex:q LITERAL }`);
    const store = dataset(`PREFIX ex: <http://ex.example/#>
<x> ex:p "default" .
GRAPH <g> { <x> ex:q "named" . }`);
    expect(status(schema, store, "x", "#S").status).to.equal("conformant");
  });
});
