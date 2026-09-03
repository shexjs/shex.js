/** The Eval extension end to end: an action that answers true passes, one
 * that answers false fails the constraint it is on (as a SemActFailure the
 * validator accepts -- `return true` was "unsupported response" until
 * this), and what it writes into extensionStorage rides the results.
 */
"use strict";

const expect = require("chai").expect;
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("@shexjs/validator");
const ShExTerm = require("@shexjs/term");
const EvalExtension = require("..");

const base = "http://a.example/";

function validated (code, dataObject) {
  const schema = ShExParser.construct(base, {}, {index: true}).parse(
    `PREFIX : <${base}>\nPREFIX Eval: <http://shex.io/extensions/Eval/>\n` +
    `start = @<S>\n<S> { :p . %Eval:{ ${code} %} }`);
  const graph = new N3.Store();
  graph.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"})
    .parse(`PREFIX : <${base}>\n:x :p ${dataObject} .`));
  const validator = new ShExValidator(schema, RdfJsDb(graph), {results: "api"});
  EvalExtension.register(validator, {ShExTerm});
  const result = validator.validateShapeMap([{node: base + "x", shape: ShExValidator.Start}])[0];
  EvalExtension.done(validator);
  return result;
}

describe("extension-eval", function () {
  it("should pass where the action answers true", function () {
    expect(validated("return true;", '"fine"').status).to.equal("conformant");
  });

  it("should fail the constraint where the action answers false", function () {
    const result = validated('return this.triples[0].object.value !== "999";', '"999"');
    expect(result.status).to.equal("nonconformant");
    expect(JSON.stringify(result.appinfo)).to.include("returned false");
  });

  it("should carry what the action wrote into the results", function () {
    const result = validated(
      "extensionStorage.object = this.triples[0].object.value; return true;", '"noted"');
    expect(result.status).to.equal("conformant");
    expect(JSON.stringify(result.appinfo), "extensionStorage rides the result")
      .to.include('"noted"');
  });
});
