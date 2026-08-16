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

  /* A choice the schema offers reads as a choice.  `:a . | :b .` over a node
   * with neither used to come back as a nested array, which the writer
   * flattened into "you need both". */
  it("should read a OneOf failure as a choice, end to end", function () {
    const N3 = require("n3"), ShExParser = require("@shexjs/parser");
    const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
    const {ShExValidator} = require("@shexjs/validator");
    const base = "http://a.example/";
    const schema = ShExParser.construct(base, {}, {index: true})
          .parse("PREFIX : <http://a.example/>\nstart = @<S>\n<S> { :a . | :b . }");
    const graph = new N3.Store();
    graph.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"})
      .parse("PREFIX : <http://a.example/>\n:x :c 1 ."));
    const result = new ShExValidator(schema, RdfJsDb(graph), {})
          .validateShapeMap([{node: base + "x", shape: ShExValidator.Start}])[0];
    expect(result.appinfo.errors[0].type, "a named disjunction").to.equal("Alternatives");
    expect(result.appinfo.errors[0].errors.map(e => e.type)).to.deep.equal(["AllOf", "AllOf"]);
    const said = ShExUtil.errsToSimple(result.appinfo).join("\n");
    expect(said, "either one, not both").to.include("OR");
    expect(said).to.not.include("AND");
  });

  it("should join a failure's errors as things all wrong at once", function () {
    const text = ShExUtil.errsToSimple(failure([missing("a"), missing("b")])).join("\n");
    expect(text).to.include("AND");
    expect(text).to.not.include("OR");
    expect(text).to.include("missing property <" + P + "a>");
    expect(text).to.include("missing property <" + P + "b>");
  });

  it("should join alternative readings with OR", function () {
    const text = ShExUtil.errsToSimple({
      type: "Alternatives",
      errors: [{type: "AllOf", errors: [missing("a")]},
               {type: "AllOf", errors: [missing("b"), missing("c")]}],
    }).join("\n");
    expect(text, "one alternative or the other").to.include("OR");
    // ...and within an alternative, both are wrong together
    expect(text.substring(text.indexOf("OR"))).to.include("AND");
  });

  /* Nested errors were concatenated onto a string where they weren't in an
   * array, which stringified them: "validating x:,Missing property: ...". */
  /* The name is new; a result made by an older validator still reads. */
  it("should still understand the older spelling", function () {
    const text = ShExUtil.errsToSimple({
      type: "PossibleErrors",
      errors: [[missing("a")], [missing("b")]],
    }).join("\n");
    expect(text).to.include("OR");
    expect(text).to.include("missing property <" + P + "a>");
  });

  it("should not stringify a nested error into commas", function () {
    const text = ShExUtil.errsToSimple({
      type: "TypeMismatch",
      triple: {subject: P + "x", predicate: P + "p", object: P + "o"},
      errors: failure([missing("a")]),          // one error, not a list of them
    }).join("\n");
    expect(text).to.not.include(",");
    expect(text).to.include("missing property <" + P + "a>");
  });

  /* A failure the validator was asked to repair ends with the recipe. */
  it("should end a failure with what would make it conform", function () {
    const text = ShExUtil.errsToSimple(Object.assign(
      failure([missing("mbox")]),
      {repairs: [{type: "NearestBag", cost: 1, arcs: [{property: P + "mbox", delta: 1}]},
                 {type: "NearestBag", cost: 1, arcs: [{property: P + "name", delta: -1},
                                                      {property: P + "nick", delta: 1}]}]},
    )).join("\n");
    // the arcs read as IRIs like every other term in the report, and as
    // prefixed names where the caller supplied a table for them
    expect(text).to.include("to conform: add 1 <" + P + "mbox>, or remove 1 <" + P
                            + "name> and add 1 <" + P + "nick>");
    // a failure nobody asked to repair says nothing about conforming
    expect(ShExUtil.errsToSimple(failure([missing("mbox")])).join("\n"))
      .to.not.include("to conform");
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
      .to.include("either add " + P + "code, or remove it");
    // three ways out, any one of them
    expect(ShExUtil.errsToSimple(violation([add("code"), add("unit"), add("system")])).join(""))
      .to.include("either add " + P + "code or " + P + "unit or " + P + "system, or remove it");
    // one way out, and it takes two arcs
    expect(ShExUtil.errsToSimple(violation([add("code", "unit")])).join(""))
      .to.include("either add " + P + "code and " + P + "unit, or remove it");
    // nothing would seat it: don't pretend there is a choice
    expect(ShExUtil.errsToSimple(violation([])).join("")).to.include("remove it");
    expect(ShExUtil.errsToSimple(violation([])).join("")).to.not.include("either");
  });
});
