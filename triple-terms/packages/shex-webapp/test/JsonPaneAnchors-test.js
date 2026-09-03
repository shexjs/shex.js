/** Where a failure lands in an entity page.
 *
 * The JSON pane goes through the same anchoring as the Turtle one: a term
 * written as a nested structure is marked where it opens, and the triples
 * inside it carry their own marks.  In an entity page that matters more than
 * anywhere else -- a single claim is a screenful of JSON, with its rank, its
 * id, its qualifiers and its references, none of which is what the schema
 * refused.
 *
 * The webapp's smoke test covers the hover anchors over a real Q42; this
 * covers the diagnostic, which needs a validation that actually fails and so
 * wants a page small enough to say exactly what is wrong with it.
 */
"use strict";

const expect = require("chai").expect;
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ShExValidator} = require("@shexjs/validator");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const EditorServices = require("@shexjs/editor-services");
const Wikibase = require("@shexjs/neighborhood-wikibase");

const WD = "http://www.wikidata.org/entity/";
const SCHEMA_BASE = "http://s.example/";

/** an entity with one P31 claim, indented the way the pane shows it */
const page = JSON.stringify({
  entities: {
    Q1: {
      type: "item", id: "Q1",
      labels: {en: {language: "en", value: "a thing"}},
      claims: {
        P31: [{
          mainsnak: {
            snaktype: "value", property: "P31", datatype: "wikibase-item",
            datavalue: {
              value: {"entity-type": "item", "numeric-id": 5, id: "Q5"},
              type: "wikibase-entityid",
            },
          },
          type: "statement", rank: "normal", id: "Q1$aaa-bbb",
        }],
      },
    },
  },
}, null, 2) + "\n";

/** validate the page against `shapes`, and report what got marked */
function marks (shapes, shape = "S") {
  const schemaText = `PREFIX p: <http://www.wikidata.org/prop/>
PREFIX ps: <http://www.wikidata.org/prop/statement/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
BASE <${SCHEMA_BASE}>
${shapes}
`;
  const schema = ShExParser.construct(SCHEMA_BASE, {}, {index: true}).parse(schemaText);
  const located = EditorServices.locateInParsed(schemaText, schema);
  // the source locates its own document; nothing here goes to the network
  const db = Wikibase.wikibaseDB(undefined, {
    fetchDoc: url => { throw Error("this test asks for no page: " + url); },
  });
  const parsed = db.locateDocument(page);
  const result = new ShExValidator(schema, RdfJsDb(new N3.Store(parsed.quads)), {results: "api"})
        .validateShapeMap([{node: WD + "Q1", shape: SCHEMA_BASE + shape}])[0];
  const mapped = EditorServices.mapValidationErrors(result.appinfo, located, parsed);
  return {
    status: result.status,
    said: mapped.data.map(d => ({text: page.slice(d.from, d.to), message: d.message})),
    pairs: mapped.pairs,
  };
}

describe("marking a failure in an entity page", function () {

  it("should read the page without going anywhere for it", function () {
    const got = marks("<S> { p:P31 @<T> }\n<T> { ps:P31 . }");
    expect(got.status).to.equal("conformant");
  });

  /* The claim is the object of p:P31, and it is written as an object: the
   * whole `{ "mainsnak": ..., "rank": ..., "id": ... }`.  Marking all of it
   * says everything in it is at fault. */
  it("should mark a claim where it opens, not across the whole claim", function () {
    const got = marks("<S> { p:P31 @<T> }\n<T> { ps:P31 . ; ps:P998 . }");
    expect(got.status).to.equal("nonconformant");
    expect(got.said.length, "something was marked").to.be.above(0);
    got.said.forEach(({text, message}) => {
      expect(text, message).to.not.include("\n");
      expect(text, message).to.not.include("rank");
    });
    expect(got.said.map(s => s.text)).to.include("{");
  });

  it("should mark the value itself where the value is what failed", function () {
    const got = marks("<S> { p:P31 @<T> }\n<T> { ps:P31 xsd:integer }");
    expect(got.status).to.equal("nonconformant");
    // "Q5" is a string in the page; the id it stands for is what didn't
    // satisfy xsd:integer, and the string is where a reader will look
    expect(got.said.map(s => s.text)).to.include('"Q5"');
  });

  it("should still offer both delimiters for a hover", function () {
    const got = marks("<S> { p:P31 @<T> }\n<T> { ps:P31 . ; ps:P998 . }");
    const nested = got.pairs.filter(p => p.anchors && p.anchors.objectParts);
    expect(nested.length, "a claim anchored at its delimiters").to.be.above(0);
    const [open, close] = nested[0].anchors.objectParts;
    expect(page.slice(open.from, open.to)).to.equal("{");
    expect(page.slice(close.from, close.to)).to.equal("}");
  });

  it("should keep every mark inside the document", function () {
    const got = marks("<S> { p:P31 @<T> }\n<T> { ps:P31 xsd:integer ; ps:P998 . }");
    got.said.forEach(({text}) => expect(text.length).to.be.above(0));
    got.pairs.forEach(p => {
      if (p.data) {
        expect(p.data.to).to.be.at.most(page.length);
        expect(p.data.to).to.be.above(p.data.from);
      }
    });
  });
});
