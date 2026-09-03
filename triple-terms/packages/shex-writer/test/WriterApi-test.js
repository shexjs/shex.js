/** The writer's edges: its stream API, and what it does when handed ShExJ
 *  that no parser would have produced.
 *
 * shexTest drives the writer from one end -- valid ShExJ in, ShExC out, parse
 * it back and compare -- which is the right test for everything a schema can
 * say.  It can't reach the writer's own API (a caller-supplied stream, shapes
 * added one at a time) or its structural complaints, both of which are what a
 * program embedding the writer actually meets first.
 */
"use strict";

const {expect} = require("chai");
const ShExWriter = require("@shexjs/writer");

const S1 = "http://a.example/S1", p1 = "http://a.example/p1";
const decl = (id, shapeExpr) => ({type: "Schema", shapes: [{type: "ShapeDecl", id, shapeExpr}]});
const tc = extra => Object.assign({type: "TripleConstraint", predicate: p1}, extra);
const shape = expression => ({type: "Shape", expression});
const ONE_DOT = decl(S1, shape(tc()));

/** Everything the writer sends, and whether it was told to close. */
function collector () {
  const chunks = [];
  return {
    chunks,
    ended: false,
    text: function () { return chunks.join(""); },
    write: function (chunk, _encoding, done) { chunks.push(chunk); done && done(); },
    end: function (done) { this.ended = true; done && done(null, chunks.join("")); },
  };
}

/** What the writer produced, or the error it reported to the callback. */
function write (schema, options) {
  let text = null, error = null;
  try {
    new ShExWriter(Object.assign({simplifyParentheses: true}, options))
      .writeSchema(schema, (e, t) => { if (e) error = e; else text = t; });
  } catch (e) { error = e; }
  return {text, error};
}

describe("writer API", function () {

  describe("output stream", function () {

    it("should write to a stream it was given", function () {
      const out = collector();
      new ShExWriter(out, {simplifyParentheses: true}).writeSchema(ONE_DOT);
      expect(out.text()).to.include("<" + S1 + ">");
      expect(out.text()).to.include("<" + p1 + ">");
      expect(out.ended, "and close it, by default").to.equal(true);
    });

    /* A caller writing several schemas into one file wants the file left
     * open. */
    it("should leave the stream open with end: false", function () {
      const out = collector();
      const writer = new ShExWriter(out, {simplifyParentheses: true, end: false});
      writer.writeSchema(ONE_DOT);
      expect(out.text()).to.include("<" + S1 + ">");
      expect(out.ended).to.equal(false);
    });

    it("should still report done when it doesn't close the stream", function () {
      const out = collector();
      let called = 0;
      new ShExWriter(out, {end: false}).end(() => ++called);
      expect(called, "exactly once").to.equal(1);
      expect(out.ended).to.equal(false);
    });

    it("should refuse to write after end()", function () {
      const writer = new ShExWriter({simplifyParentheses: true});
      writer.end();
      expect(() => writer.addShape(shape(tc()), S1))
        .to.throw(/Cannot write because the writer has been closed/);
    });
  });

  describe("piecemeal output", function () {

    /* addPrefix/addShape/addShapes are how a program that is generating a
     * schema uses the writer -- there is no ShExJ document to hand it. */
    it("should take prefixes and shapes one at a time", function () {
      const out = collector();
      const writer = new ShExWriter(out, {simplifyParentheses: true});
      writer.addPrefix("ex", "http://a.example/");
      writer.addShape(shape(tc()), S1);
      writer.end();
      expect(out.text()).to.include("PREFIX ex: <http://a.example/>");
      expect(out.text(), "and use the prefix it was given").to.include("ex:S1");
      expect(out.text()).to.include("ex:p1");
    });

    it("should take a list of shapes", function () {
      const out = collector();
      const writer = new ShExWriter(out, {simplifyParentheses: true});
      writer.addShapes([
        {shape: shape(tc()), name: S1},
        {shape: shape(tc({predicate: "http://a.example/p2"})), name: "http://a.example/S2"},
      ]);
      writer.end();
      expect(out.text()).to.include("<" + S1 + ">");
      expect(out.text()).to.include("<http://a.example/S2>");
      expect(out.text()).to.include("<http://a.example/p2>");
    });
  });

  /* A schema that came from the parser carries the base it was read with, so
   * writing it back says so without the caller having to pass base again. */
  it("should write the BASE a parsed schema remembers", function () {
    const parsed = Object.assign({_base: "http://a.example/dir/"}, ONE_DOT);
    const {text} = write(parsed);
    expect(text).to.match(/^BASE <http:\/\/a\.example\/dir\/>/);
  });

  /* An RDF IRI is compared by string, so an IRI a URL parser would rewrite --
   * anything outside ASCII, or with a backslash in the path -- has to be left
   * absolute rather than relativized into a different IRI. */
  it("should not relativize an IRI a URL parser would rewrite", function () {
    const astral = "http://a.example/p\u{1D400}";
    const {text} = write(decl(S1, shape(tc({predicate: astral}))),
                         {base: "http://a.example/dir/"});
    expect(text, "escaped, not percent-encoded").to.include("<http://a.example/p\\U0001d400>");
    expect(text).to.not.include("%F0");
    // ...while an IRI it wouldn't rewrite is still shortened
    const plain = write(decl(S1, shape(tc({predicate: "http://a.example/dir/p1"}))),
                        {base: "http://a.example/dir/"});
    expect(plain.text).to.include("<p1>");
  });

  /* One shape expression, returned rather than written: how an error message
   * quotes the constraint a node didn't satisfy. */
  it("should write a shape expression on its own", function () {
    const writer = new ShExWriter({simplifyParentheses: true, prefixes: {ex: "http://a.example/"}});
    expect(writer.writeShapeExpr({type: "NodeConstraint", datatype: "http://a.example/dt", mininclusive: 3}))
      .to.equal("ex:dt mininclusive 3");
    expect(writer.writeShapeExpr(shape(tc()), true)).to.include("ex:p1");
  });

  it("should mark a negated triple constraint", function () {
    const {text} = write(decl(S1, shape(tc({negated: true}))));
    expect(text).to.include("!");
  });

  describe("malformed ShExJ", function () {

    const complains = (what, schema, match) =>
      it("should complain about " + what, function () {
        const {error, text} = write(schema);
        expect(error, "wrote " + JSON.stringify(text) + " instead").to.exist;
        expect(error.message).to.match(match);
      });

    complains("a document that isn't a Schema", {type: "NotASchema", shapes: []},
              /expected NotASchema to equal .Schema/);
    complains("a document with no type", {shapes: []},
              /to have a \.type/);
    complains("a shape expression of an unknown type", decl(S1, {type: "Bogus"}),
              /expected Shape\{,And,Or,Ref\} or NodeConstraint/);
    complains("a triple expression of an unknown type", decl(S1, shape({type: "Bogus"})),
              /unexpected expr type: Bogus/);
    complains("a literal where a shape label goes", decl('"lit"', shape(tc())),
              /A literal as subject is not allowed/);
    complains("a literal where a predicate goes", decl(S1, shape(tc({predicate: '"lit"'}))),
              /A literal as predicate is not allowed/);

    const values = vs => decl(S1, shape(tc({valueExpr: {type: "NodeConstraint", values: vs}})));
    complains("a value set member with no type", values([{stem: "http://a.example/"}]),
              /to have a 'type' attribute/);
    complains("a value set member of an unknown type",
              values([{type: "Bogus", stem: "http://a.example/"}]),
              /expected type attribute 'Bogus' to be in 'Language,IriStem/);
    complains("an exclusion with no type",
              values([{type: "IriStemRange", stem: "http://a.example/",
                       exclusions: [{stem: "http://a.example/x"}]}]),
              /to have a 'type' attribute/);
    complains("an exclusion of an unknown type",
              values([{type: "IriStemRange", stem: "http://a.example/",
                       exclusions: [{type: "Bogus", stem: "http://a.example/x"}]}]),
              /expected type attribute 'Bogus' to be in 'IriStem,LiteralStem,LanguageStem'/);

    complains("a node kind no ShExC spells",
              decl(S1, shape(tc({valueExpr: {type: "NodeConstraint", nodeKind: "quad"}}))),
              /unexpected nodeKind: quad/);
    complains("a node constraint that is both a datatype and a value set",
              decl(S1, shape(tc({valueExpr: {type: "NodeConstraint",
                                             datatype: "http://www.w3.org/2001/XMLSchema#string",
                                             values: ["http://a.example/v1"]}}))),
              /found both datatype and values/);

    /* lax skips the structural expect()s, for a caller who knows their ShExJ
     * is odd and wants the output anyway. */
    it("should write anyway with lax", function () {
      const {text, error} = write(Object.assign({}, ONE_DOT, {type: "NotASchema"}), {lax: true});
      expect(error, "no complaint").to.equal(null);
      expect(text).to.include("<" + S1 + ">");
    });

    /* the error thrower is replaceable, e.g. to collect rather than throw */
    it("should use the error function it was given", function () {
      const said = [];
      const writer = new ShExWriter({
        simplifyParentheses: true,
        error: (func, str) => { said.push(typeof func === "function" ? str : func); },
      });
      writer.writeSchema({shapes: []}, () => {});
      expect(said.join("\n")).to.match(/to have a \.type/);
    });
  });
});
