/** The human error writer's less-travelled shapes: lists of errors, restriction
 * failures, strings, unknown types, and the node-constraint phrasing. */
"use strict";

const expect = require("chai").expect;
const ShExHumanErrorWriter = require("../lib/shex-human-error-writer");
const ShExUtil = require("..");

const base = "http://a.example/";
const XSD = "http://www.w3.org/2001/XMLSchema#";
const missing = p => ({type: "MissingProperty", property: base + p});

describe("ShExHumanErrorWriter (extra)", function () {
  const writer = () => new ShExHumanErrorWriter();

  it("joins a list of errors with AND", function () {
    const lines = writer().write([missing("p"), missing("q")], {"": base});
    expect(lines).to.deep.equal(["  missing property :p", "AND", "  missing property :q"]);
  });

  it("nests what a restriction refused", function () {
    const lines = writer().write({type: "RestrictionError", focus: base + "x", errors: [missing("p")]}, {"": base});
    expect(lines).to.deep.equal(["validating restrictions on <http://a.example/x>:", "  missing property :p"]);
  });

  it("passes a bare string through, and refuses what it doesn't know", function () {
    expect(writer().write("just words")).to.deep.equal(["just words"]);
    expect(() => writer().write({type: "Bogus"})).to.throw(/unknown shapeExpression type "Bogus"/);
    expect(() => writer().write(null)).to.throw(/unknown shapeExpression type/);
  });

  it("says what a node constraint asks for", function () {
    const nc = {nodeKind: "iri", datatype: XSD + "integer", length: 3, minlength: 1, maxlength: 5, pattern: "^a", flags: "i",
                mininclusive: 1, minexclusive: 0, maxinclusive: 9, maxexclusive: 10, totaldigits: 4, fractiondigits: 2,
                values: [base + "v", {value: "lit"}, {value: "1", type: XSD + "integer"}, {value: "s", type: XSD + "string"}, {value: "hi", language: "en"},
                         {type: "Language", languageTag: "fr"}, {type: "IriStem", stem: base}, {type: "LiteralStemRange", stem: {type: "Wildcard"}, exclusions: ["x", {type: "LiteralStem", stem: "y"}]},
                         {type: "LanguageStem", stem: "en"}]};
    const said = writer().nodeConstraintToSimple(nc);
    expect(said.slice(0, 13)).to.deep.equal([
      "be a IRI", "have datatype " + XSD + "integer", "have length 3", "have length at least 1", "have length at most 5",
      "match regex /^a/i", "have value at least 1", "have value more than 0", "have value at most 9", "have value less than 10",
      "have have 4 digits", "have have 2 digits after the decimal"].concat([said[12]]));
    expect(said[12], "a long value list is trimmed").to.match(/^have a value in \[<http:\/\/a.example\/v>, "lit", "1"\^\^<.*…\]$/);
    expect(writer().valuesToSimple(nc.values)).to.deep.equal([
      "<http://a.example/v>", "\"lit\"", "\"1\"^^<" + XSD + "integer>", "\"s\"", "\"hi\"@en", "literal with langauge tag fr",
      "iri starting with http://a.example/", "literal excluding x or anything starting with y", "language starting with en"]);
    expect(writer().nodeConstraintToSimple({pattern: "b"})).to.deep.equal(["match regex /b/"]);
    expect(writer().valuesToSimple([{type: "LiteralStemRange", stem: {type: "Wildcard"}, exclusions: ["x", {type: "LiteralStem", stem: "y"}]}, {type: "LanguageStem", stem: "en"}]))
      .to.deep.equal(["literal excluding x or anything starting with y", "language starting with en"]);
  });

  it("is what errsToSimple uses", function () {
    expect(ShExUtil.errsToSimple({type: "Failure", node: base + "x", shape: base + "S", errors: [missing("p")]}, {"": base}, {explain: "errors"}))
      .to.deep.equal(["validating <http://a.example/x> as :S:", "  missing property :p"]);
  });
});
