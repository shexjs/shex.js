/** What the feasibility layer reports when it refutes a node.
 *
 * Two things can be wrong with a neighborhood at once: an arc it doesn't
 * have, and an arc it has that the schema has nowhere to put.  A missing
 * mandatory property is the better account of the second *when supplying it
 * would give that triple somewhere to go* -- and no account of it at all
 * when it wouldn't, which is when both belong in the report.
 */
"use strict";

const expect = require("chai").expect;
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("..");
const ShExUtil = require("@shexjs/util");

const base = "http://a.example/";

/** the kinds of error reported, deduplicated, as "Type :predicate" */
function report (shapeText, dataText) {
  const schema = ShExParser.construct(base, {}, {index: true})
        .parse("PREFIX : <http://a.example/>\nstart = @<S>\n" + shapeText);
  const graph = new N3.Store();
  graph.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"})
    .parse("PREFIX : <http://a.example/>\n" + dataText));
  const result = new ShExValidator(schema, RdfJsDb(graph), {})
        .validateShapeMap([{node: base + "x", shape: ShExValidator.Start}])[0];
  const seen = [];
  JSON.stringify(result.appinfo, (key, value) => {
    if (value && typeof value.type === "string" &&
        /MissingProperty|ExcessTripleViolation|FeasibilityViolation/.test(value.type))
      seen.push(value.type.replace("Violation", "") + " " +
                String(value.property ||
                       (value.triple && (value.triple.predicate.value || value.triple.predicate)) || "")
                .replace(base, ":"));
    return value;
  });
  return {status: result.status, errors: [...new Set(seen)], appinfo: result.appinfo,
          // errsToSimple writes errors; a conforming result has none to write
          human: result.status === "conformant" ? "" : ShExUtil.errsToSimple(result.appinfo).join("\n")};
}

/** the FeasibilityViolations in a result, innermost first */
function homeless (appinfo) {
  const found = [];
  JSON.stringify(appinfo, (key, value) => {
    if (value && value.type === "FeasibilityViolation")
      found.push(value);
    return value;
  });
  return found;
}

describe("feasibility refutations", function () {

  /* `( :b . ; :c . )?` is a group that must be taken whole: a :c with no :b
   * beside it has nowhere to go, whatever else is wrong with the node.  The
   * missing :a doesn't explain it -- supplying an :a leaves the :c just as
   * homeless -- so both are reported. */
  it("should report a homeless triple as well as a missing property", function () {
    const {status, errors} = report("<S> { :a . ; ( :b . ; :c . )? }", ":x :c 1 .");
    expect(status).to.equal("nonconformant");
    expect(errors).to.have.members(["MissingProperty :a", "Feasibility :c"]);
  });

  /* Where the missing property *is* the explanation -- :b has nowhere to go
   * only because the :a it shares a group with is absent -- saying both
   * would report one problem twice. */
  it("should not report a triple whose place the missing property would make", function () {
    const {status, errors} = report("<S> { ( :a . ; :b . ) }", ":x :b 1 .");
    expect(status).to.equal("nonconformant");
    expect(errors).to.deep.equal(["MissingProperty :a"]);
  });

  it("should still report a homeless triple on its own", function () {
    const {status, errors} = report("<S> { :a . ; ( :b . ; :c . )? }", ":x :a 1 ; :c 2 .");
    expect(status).to.equal("nonconformant");
    expect(errors).to.deep.equal(["Feasibility :c"]);
  });

  it("should still report a missing property on its own", function () {
    const {status, errors} = report("<S> { :a . ; :b . }", ":x :a 1 .");
    expect(status).to.equal("nonconformant");
    expect(errors).to.deep.equal(["MissingProperty :b"]);
  });

  /* "This triple fits nowhere" says what is wrong without saying what to do
   * about it.  Two things would settle a :c that wants a :b beside it, and
   * naming both is the whole of the advice. */
  it("should say what would seat a homeless triple", function () {
    const {appinfo, human} = report("<S> { :a . ; ( :b . ; :c . )? }", ":x :c 1 .");
    const [violation] = homeless(appinfo);
    expect(violation, "a homeless triple").to.exist;
    expect(violation.repairs.map(r => r.arcs.map(a => a.property.replace(base, ":")).join(" and ")))
      .to.deep.equal([":b"]);
    expect(human).to.include("either add " + base + "b, or remove it");
  });

  /* Where nothing would seat it -- a closed-off constraint with no room --
   * removal is the whole story, and the sentence says so without pretending
   * there is an alternative. */
  it("should not invent a repair where none would seat it", function () {
    const {appinfo, human} = report("<S> { :a . {0} ; :b . }", ":x :a 1 ; :b 2 .");
    const [violation] = homeless(appinfo);
    if (violation) {
      expect(violation.repairs).to.deep.equal([]);
      expect(human).to.include("remove it");
      expect(human).to.not.include("either add");
    }
  });

  /* Three branches offering the same arc a home: completing any of them
   * seats it, so all three are ways out -- the report used to name whichever
   * constraint happened to be pruned last. */
  it("should offer every constraint that could seat it", function () {
    const {appinfo, human} = report(
      "<S> { ( :a . ; :z . ) | ( :b . ; :z . ) | ( :c . ; :z . ) }", ":x :z 1 .");
    const [violation] = homeless(appinfo);
    expect(violation.repairs.map(r => r.arcs.map(a => a.property.replace(base, ":")).join(" and ")))
      .to.have.members([":a", ":b", ":c"]);
    expect(human).to.include("either add " + base + "a or " + base + "b or " + base + "c, or remove it");
  });

  /* Where no single arc seats it, the arcs that do so together. */
  it("should offer a repair that takes more than one arc", function () {
    const {appinfo, human} = report("<S> { ( :a . ; :b . ; :c . )? ; :keep . }",
                                    ":x :c 1 ; :keep 2 .");
    const [violation] = homeless(appinfo);
    expect(violation.repairs.length, "one way out, not none").to.equal(1);
    expect(violation.repairs[0].arcs.map(a => a.property.replace(base, ":")))
      .to.have.members([":a", ":b"]);
    expect(human).to.match(/either add http:\/\/a\.example\/[ab] and http:\/\/a\.example\/[ab], or remove it/);
  });

  /* Short of a constraint's minimum is as unsatisfiable as absent, and says
   * so as a missing property rather than as every triple in the neighborhood
   * complaining that it has nowhere to go. */
  it("should report a cardinality shortfall as the missing property", function () {
    const {errors} = report("<S> { :a . ; :d . {2} }", ":x :a 1 ; :d 2 .");
    expect(errors).to.deep.equal(["MissingProperty :d"]);
  });

  it("should report a shortfall and an absence together", function () {
    const {errors} = report("<S> { :a . ; :d . {2} }", ":x :d 2 .");
    expect(errors).to.have.members(["MissingProperty :a", "MissingProperty :d"]);
  });

  /* Three independent things wrong: an absence, a shortfall, and a triple
   * with nowhere to go. */
  it("should report three problems as three problems", function () {
    const {errors} = report("<S> { :a . ; ( :b . ; :c . )? ; :d . {2} }", ":x :c 1 ; :d 2 .");
    expect(errors).to.have.members(
      ["MissingProperty :a", "MissingProperty :d", "Feasibility :c"]);
  });

  it("should leave a conforming node alone", function () {
    const {status} = report("<S> { :a . ; ( :b . ; :c . )? }", ":x :a 1 ; :b 2 ; :c 3 .");
    expect(status).to.equal("conformant");
  });
});
