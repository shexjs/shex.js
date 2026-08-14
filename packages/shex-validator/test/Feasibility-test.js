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
  return {status: result.status, errors: [...new Set(seen)]};
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

  it("should leave a conforming node alone", function () {
    const {status} = report("<S> { :a . ; ( :b . ; :c . )? }", ":x :a 1 ; :b 2 ; :c 3 .");
    expect(status).to.equal("conformant");
  });
});
