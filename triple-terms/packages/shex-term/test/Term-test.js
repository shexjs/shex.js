/** @shexjs/term: RDFJS <-> JSON-LD-style terms, and the Turtle each writes as. */
"use strict";

const expect = require("chai").expect;
const ShExTerm = require("..");
const {DataFactory: DF} = require("n3");

const XSD = "http://www.w3.org/2001/XMLSchema#";
const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const base = "http://a.example/";

describe("ShExTerm", function () {
  describe("rdfJsTerm2Turtle", function () {
    it("writes each kind of term", function () {
      expect(ShExTerm.rdfJsTerm2Turtle(DF.namedNode(base + "x"))).to.equal("<http://a.example/x>");
      expect(ShExTerm.rdfJsTerm2Turtle(DF.blankNode("b1"))).to.equal("_:b1");
      expect(ShExTerm.rdfJsTerm2Turtle(DF.literal("say \"hi\""))).to.equal("\"say \\\"hi\\\"\"");
      expect(ShExTerm.rdfJsTerm2Turtle(DF.literal("hi", "en"))).to.equal("\"hi\"@en");
      expect(ShExTerm.rdfJsTerm2Turtle(DF.literal("1", DF.namedNode(XSD + "integer")))).to.equal("\"1\"^^" + XSD + "integer");
      expect(() => ShExTerm.rdfJsTerm2Turtle(DF.variable("v"))).to.throw(/unknown RDFJS node type/);
    });
    it("shortens IRIs by prefix or base when that is shorter", function () {
      const meta = {base: "", prefixes: {ex: base, xsd: XSD}};
      expect(ShExTerm.rdfJsTerm2Turtle(DF.namedNode(base + "x"), meta)).to.equal("ex:x");
      expect(ShExTerm.rdfJsTerm2Turtle(DF.namedNode("http://b.example/z"), meta)).to.equal("<http://b.example/z>");
      const relative = {base: base + "dir/", prefixes: {}};
      expect(ShExTerm.rdfJsTerm2Turtle(DF.namedNode(base + "dir/deep/y"), relative), "relative to the base").to.equal("<deep/y>");
      expect(ShExTerm.rdfJsTerm2Turtle(DF.namedNode(base + "x"), {base: base + "dir/", prefixes: {ex: base}}), "a tie goes to the relative form").to.equal("</x>");
      expect(ShExTerm.rdfJsTerm2Turtle(DF.namedNode(base + "a.b."), {base: "", prefixes: {ex: base}}), "local-name escapes").to.equal("ex:a.b\\.");
    });
  });

  describe("shExJsTerm2Turtle", function () {
    it("writes IRIs, blank nodes and literals", function () {
      expect(ShExTerm.shExJsTerm2Turtle(base + "x")).to.equal("<http://a.example/x>");
      expect(ShExTerm.shExJsTerm2Turtle("_:b")).to.equal("_:b");
      expect(ShExTerm.shExJsTerm2Turtle(RDF + "type", {base: "", prefixes: {}}, true), "rdf:type as a").to.equal("a");
      expect(ShExTerm.shExJsTerm2Turtle({value: "plain"})).to.equal("\"plain\"");
      expect(ShExTerm.shExJsTerm2Turtle({value: "s", type: XSD + "string"}), "xsd:string is the default").to.equal("\"s\"");
      expect(ShExTerm.shExJsTerm2Turtle({value: "1", type: XSD + "integer"}, {base: "", prefixes: {xsd: XSD}})).to.equal("\"1\"^^xsd:integer");
      expect(ShExTerm.shExJsTerm2Turtle({value: "hi", language: "en"})).to.equal("\"hi\"@en");
      expect(() => ShExTerm.shExJsTerm2Turtle(42)).to.throw(/Unknown internal term type/);
    });
    it("escapes what Turtle can't hold bare", function () {
      expect(ShExTerm.shExJsTerm2Turtle({value: "q\"b\\s\tt\nn\rr\bb\ff"})).to.equal("\"q\\\"b\\\\s\\tt\\nn\\rr\\bb\\ff\"");
      expect(ShExTerm.shExJsTerm2Turtle({value: "c\u0001d"}), "a control character").to.equal("\"c\\u0001d\"");
      expect(ShExTerm.shExJsTerm2Turtle({value: "e\u{1F600}f"}), "a surrogate pair").to.equal("\"e\\U0001f600f\"");
    });
  });

  describe("ld2RdfJsTerm and rdfJsTerm2Ld", function () {
    it("converts both ways", function () {
      expect(ShExTerm.ld2RdfJsTerm(base + "x").equals(DF.namedNode(base + "x"))).to.equal(true);
      expect(ShExTerm.ld2RdfJsTerm("_:b").equals(DF.blankNode("b"))).to.equal(true);
      expect(ShExTerm.ld2RdfJsTerm({value: "p"}).equals(DF.literal("p"))).to.equal(true);
      expect(ShExTerm.ld2RdfJsTerm({value: "hi", language: "en"}).equals(DF.literal("hi", "en"))).to.equal(true);
      expect(ShExTerm.ld2RdfJsTerm({value: "1", type: XSD + "integer"}).equals(DF.literal("1", DF.namedNode(XSD + "integer")))).to.equal(true);
      expect(ShExTerm.rdfJsTerm2Ld(DF.namedNode(base + "x"))).to.equal(base + "x");
      expect(ShExTerm.rdfJsTerm2Ld(DF.blankNode("b"))).to.equal("_:b");
      expect(ShExTerm.rdfJsTerm2Ld(DF.literal("p"))).to.deep.equal({value: "p"});
      expect(ShExTerm.rdfJsTerm2Ld(DF.literal("hi", "en"))).to.deep.equal({value: "hi", language: "en"});
      expect(ShExTerm.rdfJsTerm2Ld(DF.literal("1", DF.namedNode(XSD + "integer")))).to.deep.equal({value: "1", type: XSD + "integer"});
    });
    it("refuses what it can't convert", function () {
      expect(() => ShExTerm.ld2RdfJsTerm({type: XSD + "integer"})).to.throw(/has no value/);
      expect(() => ShExTerm.ld2RdfJsTerm({value: "x", extra: 1})).to.throw(/Unrecognized attributes/);
      expect(() => ShExTerm.ld2RdfJsTerm(42)).to.throw(/Unrecognized JSON-LD-style term/);
      expect(() => ShExTerm.rdfJsTerm2Ld(DF.variable("v"))).to.throw(/Unrecognized termType Variable/);
    });
  });

  it("knows the start symbol, even a copy of it", function () {
    expect(ShExTerm.isStart(ShExTerm.Start)).to.equal(true);
    expect(ShExTerm.isStart(JSON.parse(JSON.stringify(ShExTerm.Start)))).to.equal(true);
    expect(ShExTerm.isStart("START")).to.equal(false);
    expect(ShExTerm.isStart(null)).to.equal(false);
    expect(ShExTerm.isStart(base + "S")).to.equal(false);
  });
});
