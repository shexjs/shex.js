/** Spelling terms the way the document the reader is being sent to spells them.
 *
 * A validation result carries IRIs, because that is what a validator decides
 * about.  A reader is looking at a document, where the same node is written
 * `<Patient2>` -- and told `<http://hl7.example/Patient2>` has to work out
 * that these are the same thing before the sentence means anything.
 *
 * Three spellings, best first: the range the term was written in, the
 * document's own PREFIX and BASE, and the full IRI.  See
 * doc/error-reporting.md (F6).
 */
"use strict";

const expect = require("chai").expect;
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ShExValidator} = require("@shexjs/validator");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const ES = require("..");

const SCHEMA_BASE = "http://schema.example/";
const DATA_BASE = "http://hl7.example/";

const SCHEMA = `PREFIX : <http://hl7.org/fhir/>
BASE <${SCHEMA_BASE}>
<ObservationShape> { :subject @<PatientShape> }
<PatientShape> { :gender ["male" "female"] }
`;
const OBSERVATION = `PREFIX : <http://hl7.org/fhir/>
BASE <${DATA_BASE}>
<Obs1> :subject <Patient2> .
`;
const PATIENT = `PREFIX : <http://hl7.org/fhir/>
BASE <${DATA_BASE}>
<Patient2> :gender "M" .
`;

/** the diagnostics each document gets, in each spelling */
function messages (docs, spelling, focus = "Obs1", shape = "ObservationShape") {
  const schema = ShExParser.construct(SCHEMA_BASE, {}, {index: true}).parse(SCHEMA);
  const graph = new N3.Store();
  docs.forEach(d => graph.addQuads(
    new N3.Parser({baseIRI: DATA_BASE, format: "text/turtle"}).parse(d)));
  const result = new ShExValidator(schema, RdfJsDb(graph), {results: "api"})
        .validateShapeMap([{node: DATA_BASE + focus, shape: SCHEMA_BASE + shape}])[0];
  const located = ES.locateInParsed(SCHEMA, schema);
  return docs.map(text => ES.mapValidationErrors(
    result.appinfo, located, ES.parseTurtle(text, {baseIRI: DATA_BASE}), {spelling})
                  .data.map(d => d.message));
}

describe("spelling terms for the reader's document", function () {

  it("should carry a document's own prefixes and base off the parse", function () {
    const parsed = ES.parseTurtle(PATIENT, {baseIRI: DATA_BASE});
    expect(parsed.prefixes).to.deep.equal({"": "http://hl7.org/fhir/"});
    expect(parsed.base).to.equal(DATA_BASE);
  });

  it("should write full IRIs when asked to be explicit", function () {
    const [observation] = messages([OBSERVATION, PATIENT], "explicit");
    expect(observation[0]).to.include("<http://hl7.example/Patient2>");
  });

  /* The point of the whole thing: line 3 says `<Patient2>`, so the sentence
   * about line 3 says `<Patient2>`. */
  it("should quote the term as the document wrote it", function () {
    const [observation] = messages([OBSERVATION, PATIENT], "document");
    expect(observation[0]).to.include("<Patient2>");
    expect(observation[0]).to.not.include("http://hl7.example/");
  });

  it("should spell the same failure differently in each document", function () {
    const [observation, patient] = messages([OBSERVATION, PATIENT], "document");
    // the observation's mark is on the subject it names...
    expect(observation.join(" ")).to.include("<Patient2>");
    // ...the patient's is on the gender it got wrong
    expect(patient.join(" ")).to.include(":gender");
  });

  it("should read a shape as the schema declares it", function () {
    const [observation] = messages([OBSERVATION, PATIENT], "document");
    // BASE <http://schema.example/> in the schema, so <PatientShape> there
    expect(observation[0]).to.include("@<PatientShape>");
  });

  /* A term the document doesn't contain has no range to quote, and the
   * document's prefix table is the next best thing: a missing property is
   * named the way this document names properties, since that is where the
   * reader is about to go looking for it. */
  it("should use the document's prefixes for a term it doesn't contain", function () {
    const [patient] = messages([`PREFIX : <http://hl7.org/fhir/>
BASE <${DATA_BASE}>
<Patient2> :name "Bob" .
`], "document", "Patient2", "PatientShape");
    expect(patient.join(" "), "the property it hasn't got, as it would write it")
      .to.include("missing property :gender");
  });

  /* With no prefix of its own, a document has nothing to say about how it
   * would write the property, and the fall-back for a term the *schema*
   * names is the schema's spelling -- a table this IRI was written against,
   * which is better than none. */
  it("should fall back to the schema's spelling, then to the full IRI", function () {
    const [bare] = messages([`BASE <${DATA_BASE}>
<Patient2> <http://hl7.org/fhir/name> "Bob" .
`], "document", "Patient2", "PatientShape");
    expect(bare.join(" "), "the schema still calls it :gender")
      .to.include("missing property :gender");

    // and where neither has a name for it, it is said in full
    const schema = ShExParser.construct(SCHEMA_BASE, {}, {index: true}).parse(
      `BASE <${SCHEMA_BASE}>\n<PatientShape> { <http://hl7.org/fhir/gender> ["male"] }\n`);
    const text = `BASE <${DATA_BASE}>\n<Patient2> <http://hl7.org/fhir/name> "Bob" .\n`;
    const graph = new N3.Store();
    graph.addQuads(new N3.Parser({baseIRI: DATA_BASE, format: "text/turtle"}).parse(text));
    const result = new ShExValidator(schema, RdfJsDb(graph), {results: "api"})
          .validateShapeMap([{node: DATA_BASE + "Patient2",
                              shape: SCHEMA_BASE + "PatientShape"}])[0];
    const said = ES.mapValidationErrors(
      result.appinfo,
      ES.locateInParsed(`BASE <${SCHEMA_BASE}>\n<PatientShape> { <http://hl7.org/fhir/gender> ["male"] }\n`, schema),
      ES.parseTurtle(text, {baseIRI: DATA_BASE}), {spelling: "document"})
          .data.map(d => d.message).join(" ");
    expect(said).to.include("missing property <http://hl7.org/fhir/gender>");
  });

  /* Turtle writes an anonymous blank node as a whole nested structure, and
   * quoting `[ :gender "M" ]` into the middle of a sentence says more than
   * the sentence is about.  Its label is shorter and points at one node. */
  it("should name a blank node rather than quoting the subgraph it was written as", function () {
    const schema = ShExParser.construct(SCHEMA_BASE, {}, {index: true}).parse(
      `PREFIX : <http://hl7.org/fhir/>\nBASE <${SCHEMA_BASE}>\n` +
      `<S> { :subject @<T> }\n<T> { :gender ["male"] }\n`);
    const text = `PREFIX : <http://hl7.org/fhir/>\nBASE <${DATA_BASE}>\n` +
          `<Obs1> :subject [ :gender "M" ] .\n`;
    const graph = new N3.Store();
    graph.addQuads(new N3.Parser({baseIRI: DATA_BASE, format: "text/turtle"}).parse(text));
    const result = new ShExValidator(schema, RdfJsDb(graph), {results: "api"})
          .validateShapeMap([{node: DATA_BASE + "Obs1", shape: SCHEMA_BASE + "S"}])[0];
    const said = ES.mapValidationErrors(
      result.appinfo, ES.locateInParsed(SCHEMA, schema),
      ES.parseTurtle(text, {baseIRI: DATA_BASE}), {spelling: "document"})
          .data.map(d => d.message).join(" ");
    expect(said, "not the [ ... ] it was written as").to.not.include("[ :gender");
    expect(said, "a label naming the one node").to.match(/_:/);
  });
});
