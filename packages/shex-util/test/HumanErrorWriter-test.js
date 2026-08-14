/** errsToSimple: what a failure reads like.
 *
 * Two errors under one Failure are two things wrong with the node at once,
 * where the alternatives a PossibleErrors carries are readings of one thing
 * -- any one of them, put right, would settle it.  The writer used to say
 * OR for the first and throw on the second.
 */
"use strict";

const expect = require("chai").expect;
const ShExUtil = require("@shexjs/util");

const P = "http://a.example/";
const missing = property => ({type: "MissingProperty", property: P + property});
const failure = errors => ({type: "Failure", node: P + "x", shape: P + "S", errors});

describe("errsToSimple", function () {

  it("should join a failure's errors as things all wrong at once", function () {
    const text = ShExUtil.errsToSimple(failure([missing("a"), missing("b")])).join("\n");
    expect(text).to.include("AND");
    expect(text).to.not.include("OR");
    expect(text).to.include("Missing property: " + P + "a");
    expect(text).to.include("Missing property: " + P + "b");
  });

  it("should join alternative readings with OR", function () {
    const text = ShExUtil.errsToSimple({
      type: "PossibleErrors",
      errors: [[missing("a")], [missing("b"), missing("c")]],
    }).join("\n");
    expect(text, "one alternative or the other").to.include("OR");
    // ...and within an alternative, both are wrong together
    expect(text.substring(text.indexOf("OR"))).to.include("AND");
  });

  /* Nested errors were concatenated onto a string where they weren't in an
   * array, which stringified them: "validating x:,Missing property: ...". */
  it("should not stringify a nested error into commas", function () {
    const text = ShExUtil.errsToSimple({
      type: "TypeMismatch",
      triple: {subject: P + "x", predicate: P + "p", object: P + "o"},
      errors: failure([missing("a")]),          // one error, not a list of them
    }).join("\n");
    expect(text).to.not.include(",");
    expect(text).to.include("Missing property: " + P + "a");
  });

  /* A triple the schema has nowhere to put: say what would settle it. */
  it("should offer the repairs a homeless triple has", function () {
    const violation = repairs => ({
      type: "FeasibilityViolation",
      triple: {subject: P + "x", predicate: P + "system", object: P + "o"},
      constraints: [],
      repairs,
    });
    const add = (...properties) => ({type: "AddArcs", arcs: properties.map(p => ({property: P + p}))});
    expect(ShExUtil.errsToSimple(violation([add("code")])).join(""))
      .to.include("either add " + P + "code, or remove it.");
    // three ways out, any one of them
    expect(ShExUtil.errsToSimple(violation([add("code"), add("unit"), add("system")])).join(""))
      .to.include("either add " + P + "code or " + P + "unit or " + P + "system, or remove it.");
    // one way out, and it takes two arcs
    expect(ShExUtil.errsToSimple(violation([add("code", "unit")])).join(""))
      .to.include("either add " + P + "code and " + P + "unit, or remove it.");
    // nothing would seat it: don't pretend there is a choice
    expect(ShExUtil.errsToSimple(violation([])).join("")).to.include("remove it.");
    expect(ShExUtil.errsToSimple(violation([])).join("")).to.not.include("either");
  });
});
