/** A property is either absent or present and wrong -- never both.
 *
 * A TripleConstraint whose value expression rejects the one arc a node has
 * used to report the arc's mismatch *and* the property as missing.  Both
 * sentences came from the same fact and only the first is true of the
 * document: the arc is there to read.  See dropContradictedMisses.
 *
 * What is left has to still be enough: the mismatch says why the arc was
 * refused, and `repairs` says the node is one short.  That is the second
 * half of every case here.
 */
"use strict";

const expect = require("chai").expect;
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("..");

const base = "http://a.example/";
const PRE = "PREFIX : <" + base + ">\nPREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n";

/** validate :x against <S>, and report the failure's own error list */
function failure (shapeText, dataText, node = "x") {
  const schema = ShExParser.construct(base, {}, {index: true})
        .parse(PRE + "start = @<S>\n" + shapeText);
  const graph = new N3.Store();
  graph.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"}).parse(PRE + dataText));
  const result = new ShExValidator(schema, RdfJsDb(graph), {results: "api"})
        .validateShapeMap([{node: base + node, shape: ShExValidator.Start}])[0];
  const short = p => String(p).replace(base, ":");
  const errs = (result.appinfo.errors || []).map(e => ({
    type: e.type,
    property: short(e.property || (e.constraint || {}).predicate || ""),
  }));
  return {
    status: result.status,
    raw: result.appinfo,
    errors: errs,
    said: errs.map(e => e.type + " " + e.property),
    repairs: (result.appinfo.repairs || []).map(r => r.arcs.map(
      a => (a.delta > 0 ? "add " : "remove ") + Math.abs(a.delta) + " " + short(a.property)).join(" and ")),
  };
}

describe("a property is absent or wrong, not both", function () {

  /* The reported case: the observation names a subject, the subject is not a
   * conforming Patient, and the report used to say -- one line apart -- that
   * the arc doesn't satisfy the shape and that the arc isn't there. */
  it("should not call a property missing when it rejected the arc on its value", function () {
    const got = failure(
      "<S> { :subject @<T> }\n<T> { :gender [\"male\" \"female\"] }",
      ":x :subject :y .\n:y :gender \"M\" .");
    expect(got.status).to.equal("nonconformant");
    expect(got.said, "the mismatch, and only the mismatch").to.deep.equal(["TypeMismatch :subject"]);
  });

  it("should still say what it would take to conform", function () {
    const got = failure(
      "<S> { :subject @<T> }\n<T> { :gender [\"male\" \"female\"] }",
      ":x :subject :y .\n:y :gender \"M\" .");
    // dropping the sentence mustn't drop the count it carried: the node is
    // one conforming :subject short, and this is where a reader reads that
    expect(got.repairs).to.deep.equal(["add 1 :subject"]);
  });

  /* The other half of the rule, and the reason it is a rule about a
   * *contradiction* rather than about MissingProperty: with no arc on that
   * predicate at all, "missing" is the whole and only story. */
  it("should keep it where the property really is absent", function () {
    const got = failure("<S> { :subject @<T> }\n<T> { :gender . }", ":x :other 1 .");
    expect(got.said).to.deep.equal(["MissingProperty :subject"]);
  });

  it("should judge each property on its own", function () {
    // :a is present and wrong, :b is not there at all; one sentence each
    const got = failure("<S> { :a xsd:integer ; :b . }", ':x :a "not a number" .');
    expect(got.said.sort()).to.deep.equal(["MissingProperty :b", "TypeMismatch :a"]);
  });

  /* The rule reads one shape's error list.  Two nodes can be wrong about the
   * same predicate in opposite ways -- :x has a :p that fails, :y has none --
   * and the inner list must not be silenced by what the outer one refuted. */
  it("should judge each shape's list on its own", function () {
    const got = failure(
      "<S> { :p xsd:integer ; :q @<T> }\n<T> { :p . }",
      ':x :p "text" ; :q :y .\n:y :other 1 .');
    expect(got.said.sort(), "the outer node: a :p it has, and a :q it has")
      .to.deep.equal(["TypeMismatch :p", "TypeMismatch :q"]);
    // ...and inside the :q mismatch, :y's own list, where :p really is absent
    const inner = got.raw.errors.find(e => e.type === "TypeMismatch"
                                      && e.constraint.predicate === base + "q").errors;
    expect(inner.node).to.equal(base + "y");
    expect(inner.errors.map(e => e.type + " " + String(e.property).replace(base, ":")))
      .to.deep.equal(["MissingProperty :p"]);
  });
});
