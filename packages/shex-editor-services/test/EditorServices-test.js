/** Tests for @shexjs/editor-services: range-aware parsing and mapping of
 * validation errors onto source text in both the schema and data documents.
 */
"use strict";

const expect = require("chai").expect;
const EditorServices = require("..");
const N3 = require("n3");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("@shexjs/validator");

const base = "http://a.example/";

const schemaText = `PREFIX : <http://a.example/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
<S> {
  :name xsd:string ;
  :ref @<T>
}
<T> { :val xsd:integer }
`;

const dataText = `PREFIX : <http://a.example/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
<x> :name "hi" ;
    :ref <y> .
<y> :val "not a number" .
`;

function slice (text, range) { return text.substring(range.from, range.to); }

function validate (schemaParsed, dataText) {
  const store = new N3.Store();
  store.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"}).parse(dataText));
  const validator = new ShExValidator(schemaParsed.schema, RdfJsDb(store), {noCache: true});
  return validator.validateShapeMap([{node: base + "x", shape: base + "S"}]);
}

describe("EditorServices", function () {

  describe("parseShExC", function () {
    const parsed = EditorServices.parseShExC(schemaText, {base});

    it("should parse without diagnostics", function () {
      expect(parsed.diagnostics).to.deep.equal([]);
      expect(parsed.schema.shapes.length).to.equal(2);
    });

    it("should locate shape declarations", function () {
      expect(slice(schemaText, parsed.locate.shape(base + "T")))
        .to.equal("<T> { :val xsd:integer }");
    });

    it("should locate triple constraints", function () {
      expect(slice(schemaText, parsed.locate.constraint(base + "S", base + "ref")))
        .to.equal(":ref @<T>");
      expect(slice(schemaText, parsed.locate.constraint(base + "T", base + "val")))
        .to.equal(":val xsd:integer");
    });

    it("should locate shape references", function () {
      const refs = parsed.locate.refs(base + "T");
      expect(refs.length).to.equal(1);
      expect(slice(schemaText, refs[0])).to.equal("@<T>");
    });

    it("should return positioned diagnostics for parse errors", function () {
      const broken = EditorServices.parseShExC("<S> { :p }", {base});
      expect(broken.diagnostics.length).to.be.above(0);
      expect(broken.diagnostics[0]).to.include.keys("from", "to", "message");
    });
  });

  describe("parseTurtle", function () {
    it("should attach source ranges to quads and terms", function () {
      const parsed = EditorServices.parseTurtle(dataText, {baseIRI: base});
      expect(parsed.diagnostics).to.deep.equal([]);
      const offending = [...parsed.dataset].find(
        q => q.object.termType === "Literal" && q.object.value === "not a number");
      expect(slice(dataText, EditorServices.millanSourceToRange(offending.object.source)))
        .to.equal('"not a number"');
    });

    it("should stay useful on syntax errors (error tolerance)", function () {
      const parsed = EditorServices.parseTurtle(
        "PREFIX : <http://a.example/>\n<x> :p 1 .\n<broken> :q\n", {baseIRI: base});
      expect(parsed.diagnostics.length).to.be.above(0);
      expect(parsed.dataset.size).to.be.above(0); // quads before the error survive
    });
  });

  describe("mapValidationErrors", function () {
    const schemaParsed = EditorServices.parseShExC(schemaText, {base});
    const dataParsed = EditorServices.parseTurtle(dataText, {baseIRI: base});

    it("should anchor a value error in both documents", function () {
      // <y> :val "not a number" fails <T>'s :val xsd:integer
      const results = validate(schemaParsed, dataText);
      expect(results[0].status).to.equal("nonconformant");
      const mapped = EditorServices.mapValidationErrors(results, schemaParsed, dataParsed);

      const schemaTexts = mapped.schema.map(d => slice(schemaText, d));
      expect(schemaTexts).to.include(":val xsd:integer");

      const dataTexts = mapped.data.map(d => slice(dataText, d));
      expect(dataTexts).to.include('"not a number"');

      // the two diagnostics describing the same error share a pair id
      const pair = mapped.pairs.find(p => p.schema && p.data &&
        slice(schemaText, p.schema) === ":val xsd:integer");
      expect(pair, "paired schema+data anchors").to.exist;
      expect(slice(dataText, pair.data)).to.equal('"not a number"');
    });

    it("should anchor a missing property on the constraint and the focus node", function () {
      const missingData = `PREFIX : <http://a.example/>\n<x> :name "hi" .\n`;
      const missingParsed = EditorServices.parseTurtle(missingData, {baseIRI: base});
      const results = validate(schemaParsed, missingData);
      expect(results[0].status).to.equal("nonconformant");
      const mapped = EditorServices.mapValidationErrors(results, schemaParsed, missingParsed);

      const schemaTexts = mapped.schema.map(d => slice(schemaText, d));
      expect(schemaTexts.some(t => t.startsWith(":ref @<T>") || t.startsWith("<S>")),
             "anchors :ref constraint or <S>: " + JSON.stringify(schemaTexts)).to.equal(true);
      expect(mapped.pairs.some(p => /missing expected property/.test(p.message))).to.equal(true);
    });
  });
});
