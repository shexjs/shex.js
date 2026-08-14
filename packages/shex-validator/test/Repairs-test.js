/** The nearest bag the schema accepts (doc/error-normalization.md §4).
 *
 * A failure said as the difference between the arcs a node has and the
 * closest set of arcs the shape would take: what to add, what to drop.  That
 * answer is about the language and the data, not about the syntax tree, so
 * two spellings of one language give one answer -- which is the point of it,
 * and most of what this file checks.
 */
"use strict";

const expect = require("chai").expect;
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("..");
const ShExUtil = require("@shexjs/util");

const base = "http://a.example/";
const FOAF = "http://xmlns.com/foaf/0.1/";
const PRE = "PREFIX foaf: <" + FOAF + ">\nPREFIX : <" + base + ">\n";

/** the repairs for a node, as "add 1 foaf:mbox" / "remove 1 :a" strings */
function repairs (shapeText, dataText) {
  const schema = ShExParser.construct(base, {}, {index: true})
        .parse(PRE + "start = @<S>\n" + shapeText);
  const graph = new N3.Store();
  graph.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"})
    .parse(PRE + dataText));
  const result = new ShExValidator(schema, RdfJsDb(graph), {repairs: true})
        .validateShapeMap([{node: base + "x", shape: ShExValidator.Start}])[0];
  const short = p => p.replace(FOAF, "foaf:").replace(base, ":");
  return {
    status: result.status,
    ways: (result.appinfo.repairs || []).map(repair => repair.arcs.map(
      arc => (arc.delta > 0 ? "add " : "remove ") + Math.abs(arc.delta) + " " + short(arc.property))
      .join(" and ")),
    cost: (result.appinfo.repairs || []).map(r => r.cost)[0],
  };
}

/* The two spellings this whole line of work started from: the same bags,
 * written two ways.  Everything below asks both and expects one answer. */
const spellings = {
  "one mbox after the choice":
    "<S> { ( foaf:name . | foaf:givenName . ; foaf:familyName . ) ; foaf:mbox . }",
  "an mbox inside each branch":
    "<S> { ( foaf:name . ; foaf:mbox . | foaf:givenName . ; foaf:familyName . ; foaf:mbox . ) }",
};

describe("nearest-bag repairs", function () {

  describe("say the same thing whichever way the schema is written", function () {
    const cases = [
      ["a name and nothing else", 'foaf:name "Bob"', ["add 1 foaf:mbox"]],
      ["nothing at all", "foaf:nick \"b\"", ["add 1 foaf:name and add 1 foaf:mbox"]],
      ["a given name and an mbox",
       'foaf:givenName "Bob" ; foaf:mbox <mailto:b@e.example>', ["add 1 foaf:familyName"]],
      ["all three names and an mbox",
       'foaf:name "B" ; foaf:givenName "Bob" ; foaf:mbox <mailto:b@e.example>',
       ["remove 1 foaf:givenName"]],
    ];
    cases.forEach(([what, triples, expected]) => {
      it("should agree about " + what, function () {
        for (const [label, shapeText] of Object.entries(spellings)) {
          const {status, ways} = repairs(shapeText, ":x " + triples + " .");
          expect(status, label).to.equal("nonconformant");
          expect(ways, label).to.deep.equal(expected);
        }
      });
    });
  });

  it("should count what a cardinality is short of, or over", function () {
    const shape = "<S> { :p . {2,5} }";
    expect(repairs(shape, ':x :q 0 .').ways).to.deep.equal(["add 2 :p"]);
    expect(repairs(shape, ':x :p 1 .').ways).to.deep.equal(["add 1 :p"]);
    expect(repairs(shape, ':x :p 1 , 2 , 3 , 4 , 5 , 6 .').ways).to.deep.equal(["remove 1 :p"]);
    expect(repairs(shape, ':x :p 1 , 2 , 3 , 4 , 5 , 6 , 7 , 8 , 9 .').ways)
      .to.deep.equal(["remove 4 :p"]);
    expect(repairs(shape, ':x :p 1 , 2 .').status).to.equal("conformant");
  });

  /* A choice in the language is a choice in the repair; a choice in the
   * syntax is not.  `:a . | :b .` over a node with neither really can be put
   * right two ways. */
  it("should offer a choice the language offers", function () {
    const {ways} = repairs("<S> { :a . | :b . }", ':x :c 1 .');
    expect(ways).to.have.members(["add 1 :a", "add 1 :b"]);
  });

  it("should offer a choice about which of two to drop", function () {
    const {ways} = repairs("<S> { :a . | :b . }", ':x :a 1 ; :b 2 .');
    expect(ways).to.have.members(["remove 1 :a", "remove 1 :b"]);
  });

  /* The Quantity from the examples: :value required, :system contingent on
   * :code.  Two complete recipes, each one a way to make it conform. */
  it("should say each whole way out of a contingent group", function () {
    const {ways} = repairs(
      "<S> { :value . ; :unit . ; ( :code . ; :system . ? )? }",
      ':x :unit "kg" ; :system <http://u.example/> .');
    expect(ways).to.have.members(["add 1 :value and remove 1 :system",
                                  "add 1 :value and add 1 :code"]);
  });

  it("should ask for nothing of a node that conforms", function () {
    const {status, ways} = repairs("<S> { :a . }", ':x :a 1 .');
    expect(status).to.equal("conformant");
    expect(ways).to.deep.equal([]);
  });

  it("should be asked for, not assumed", function () {
    const schema = ShExParser.construct(base, {}, {index: true})
          .parse(PRE + "start = @<S>\n<S> { :a . }");
    const graph = new N3.Store();
    graph.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"})
      .parse(PRE + ":x :b 1 ."));
    const off = new ShExValidator(schema, RdfJsDb(graph), {})
          .validateShapeMap([{node: base + "x", shape: ShExValidator.Start}])[0];
    expect(off.status).to.equal("nonconformant");
    expect(off.appinfo).to.not.have.property("repairs");
  });

  it("should read as a recipe", function () {
    const schema = ShExParser.construct(base, {}, {index: true})
          .parse(PRE + "start = @<S>\n<S> { foaf:name . ; foaf:mbox . }");
    const graph = new N3.Store();
    graph.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"})
      .parse(PRE + ':x foaf:name "Bob" .'));
    const result = new ShExValidator(schema, RdfJsDb(graph), {repairs: true})
          .validateShapeMap([{node: base + "x", shape: ShExValidator.Start}])[0];
    expect(ShExUtil.errsToSimple(result.appinfo).join("\n"))
      .to.include("to conform: add 1 " + FOAF + "mbox");
  });
});
