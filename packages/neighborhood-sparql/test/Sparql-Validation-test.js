"use strict";
/**
 * Runs the shexTest validation suite over a SPARQL endpoint.
 *
 * Every test is validated twice -- once against an in-memory store through
 * @shexjs/neighborhood-rdfjs, once against a SPARQL endpoint through
 * @shexjs/neighborhood-sparql -- and the two results must agree, modulo blank
 * node labels (which are the one thing SPARQL is entitled to change).  The
 * rdfjs run is the oracle, so this covers the whole suite without maintaining a
 * second set of expected results.
 *
 * Three things make it a real test rather than a formality:
 *
 *   - the endpoint scrambles blank node labels in every result set, the way
 *     QLever does, so a remembered label is never valid twice;
 *   - it rejects any query that so much as mentions a blank node label;
 *   - the DECEPTICON graph is loaded next to every test's data: hundreds of
 *     decoy triples wearing the suite's own predicates, literals and bnode
 *     topologies.  They're unreachable from any focus node, so they must not
 *     change a single result -- but a neighborhood query that leans on
 *     structure instead of on an anchored path will drag them in and blow its
 *     cardinality constraints.
 *
 * Gated on TEST_sparql, since it needs a SPARQL engine.  Set SPARQL_ENDPOINT to
 * run against a real store instead of the bundled one.
 *
 *   TEST_sparql=true npx mocha packages/neighborhood-sparql/test/Sparql-Validation-test.js
 *   TEST_sparql=true TESTS=manualList npx mocha ...      # just some of them
 */

const TESTS = "TESTS" in process.env ? process.env.TESTS : null;
const VERBOSE = "VERBOSE" in process.env;
const NO_DECEPTICON = "NO_DECEPTICON" in process.env;

const fs = require("fs");
const path = require("path");
const chai = require("chai");
const assert = chai.assert;
const N3 = require("n3");

const ShExParser = require("@shexjs/parser");
const {ShExIndexVisitor} = require("@shexjs/visitor");
const {ShExValidator} = require("@shexjs/validator");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ctor: SparqlDb} = require("..");
const ShExNode = require("@shexjs/node")({rdfjs: N3});

const findPath = require("../../shex-validator/test/findPath.js");
const {launchEndpoint} = require("./sparql-endpoint");
const Decepticon = require("./decepticon");
const {opaqueBnodes, canonicalize} = require("./compare");

const schemasPath = findPath("schemas");
const validationPath = findPath("validation");
const manifestFile = validationPath + "manifest.jsonld";

/** Two manifest traits mark the tests SPARQL can't be asked:
 *
 *   ToldBNode    -- the focus is a blank node, and naming a blank node is
 *                   exactly what a SPARQL endpoint can't let you do;
 *   LexicalBNode -- the schema tests the lexical form of a blank node in the
 *                   data, and labels don't survive the trip through SPARQL.
 *
 * The traits were audited against those definitions (instrumented facet
 * tracking plus label-perturbation runs) in shexTest#trait-fixes, so they are
 * trusted as the exact boundary: a new label-sensitive test arriving untagged
 * will fail here loudly rather than be quietly over-skipped.  A meta-test
 * below keeps the ToldBNode/focus coupling honest. */

const ENABLED = "TEST_sparql" in process.env;

describe("A ShEx validator over SPARQL", function () {
  // One pending test rather than a thousand when the gate is off.
  if (!ENABLED) { it("needs TEST_sparql=true (and a SPARQL engine)"); return; }
  this.timeout(20000);

  const shexParser = ShExParser.construct();
  let tests = JSON.parse(fs.readFileSync(manifestFile, "utf8"))["@graph"][0]["entries"];
  if (TESTS)
    tests = tests.filter(t => t["@id"].match(TESTS) || t["@id"].substr(1).match(TESTS) ||
                         t.action.schema.match(TESTS) || t.action.data.match(TESTS));

  let endpoint = null;
  const schemaCache = new Map();

  before(async function () {
    this.timeout(60000);
    endpoint = await launchEndpoint({scramble: true});
    endpoint.setFixture(NO_DECEPTICON ? () => {} : ep => Decepticon.loadInto(ep, validationPath));
    if (endpoint.rejected.length)
      console.warn(`    endpoint refused ${endpoint.rejected.length} DECEPTICON triple(s): ` +
                   endpoint.rejected.map(r => r.error).join("; "));
  });

  after(async () => { if (endpoint) await endpoint.close(); });

  /* `ToldBNode` means exactly "the focus is a blank node", so the tagging and
   * the manifest have to agree in both directions or the filter below is
   * guessing.  A test can be `LexicalBNode` as well, where the verdict
   * measures the label too -- 1focusMaxLength-dot's bnode cases are both,
   * with focus `_:abcd` and a question about how long that label is -- but
   * the more specific tag doesn't excuse the general one, and shexTest
   * 8d56ad9 tags them accordingly.
   *
   * The boundary the suite actually needs is "no blank node focus reaches
   * the endpoint", which this implies and the third assertion states. */
  it(`should mark all tests whose focus is a told blank node with the ToldBNode trait`, () => {
    const marked = new Set(tests.filter(t => (t.trait || []).includes("ToldBNode")).map(t => t["@id"]));
    const founds = new Set(tests.filter(t => typeof t.action.focus === "string" && t.action.focus.startsWith("_:")).map(t => t["@id"]));
    // (Set.prototype.difference needs Node >= 22; CI's oldest lane runs 20)
    const missedTraits = [...founds].filter(id => !marked.has(id));
    const extraTraits = [...marked].filter(id => !founds.has(id));
    const declines = trait => trait === "ToldBNode" || trait === "LexicalBNode";
    const wouldRun = [...founds].filter(id =>
      !tests.find(t => t["@id"] === id && (t.trait || []).some(declines)));
    assert.deepEqual(missedTraits, [], `${missedTraits.length} test(s): [${missedTraits.join(', ')}] should have a "ToldBNode" trait`);
    assert.deepEqual(extraTraits, [], `${extraTraits.length} test(s): [${extraTraits.join(', ')}] should NOT have a "ToldBNode" trait`);
    assert.deepEqual(wouldRun, [], `${wouldRun.length} test(s): [${wouldRun.join(', ')}] would reach the endpoint with a blank node focus`);
  });

  tests.filter(test =>
    !(["ToldBNode", "LexicalBNode"])
      .find(trait => (test.trait || []).find(tt => tt === trait))
  ).forEach(function (test) {

    const schemaFile = path.resolve(schemasPath, test.action.schema);
    const schemaURL = "file://" + schemaFile;
    const dataFile = path.resolve(validationPath, test.action.data);
    const dataURL = "file://" + dataFile;

    it(`should agree with the rdfjs neighborhood on '${test["@id"]}'`, async function () {
      if (!schemaCache.has(schemaFile))
        schemaCache.set(schemaFile, await ShExNode.load(
          {shexc: [schemaFile]}, null,
          {parser: shexParser, iriTransform: i => i + ".shex"}, {}));
      const schema = schemaCache.get(schemaFile).schema;

      const semActsFile = "semActs" in test.action ? path.resolve(schemasPath, test.action.semActs) : null;
      const shapeExternsFile = "shapeExterns" in test.action
            ? path.resolve(schemasPath, test.action.shapeExterns) : null;

      const quads = opaqueBnodes(new N3.Parser({
        baseIRI: dataURL, format: "text/turtle", factory: N3.DataFactory,
      }).parse(fs.readFileSync(dataFile, "utf8")));
      const store = new N3.Store();
      store.addQuads(quads);

      endpoint.clear();
      if (endpoint.loadQuads(store.getQuads(null, null, null, null)) > 0) {
        // The store wouldn't take part of this test's data, so there is nothing
        // here to compare; see Endpoint#rejected.
        console.warn(`    ${test["@id"]}: endpoint refused part of the data`);
        return this.skip();
      }
      if (endpoint.external) {
        const rewrote = endpoint.literalsMissing(quads);
        if (rewrote.length) {
          // The store normalized some literal (e.g. "5"^^xsd:byte -> xsd:int),
          // so the graph under test isn't the test's graph any more.
          console.warn(`    ${test["@id"]}: store rewrote ${rewrote.length} literal(s): ${rewrote[0]}`);
          return this.skip();
        }
      }

      const map = shapeMapOf(test, dataURL, schemaURL);
      const options = validatorOptions(test, semActsFile, shapeExternsFile);

      const expected = validate(schema, RdfJsDb(store), map, options);
      const got = validate(schema, withSchema(SparqlDb(endpoint.url, null, {}), schema), map, options);

      if (VERBOSE && canonicalize(expected) !== canonicalize(got))
        console.log("rdfjs :", canonicalize(expected), "\nsparql:", canonicalize(got));
      assert.equal(canonicalize(got), canonicalize(expected),
                   `SPARQL and rdfjs neighborhoods disagree on ${test["@id"]}`);
    });
  });

  function withSchema (db, schema) {
    db.setSchema(schema);
    return db;
  }

  function validate (schema, db, map, mkOptions) {
    let validator = null;
    validator = new ShExValidator(schema, db, mkOptions(() => validator));
    try {
      return validator.validateShapeMap(map);
    } catch (e) {
      // A thrown error is a result too -- both sides have to throw the same way.
      return {threw: e.constructor.name, message: String(e.message).split("\n")[0]};
    }
  }

  function validatorOptions (test, semActsFile, shapeExternsFile) {
    const shapeExterns = shapeExternsFile
          ? ShExIndexVisitor.index(shexParser.parse(
            fs.readFileSync(shapeExternsFile, "utf8"), "file://" + shapeExternsFile, {}, shapeExternsFile)).shapeExprs
          : null;
    const semActs = semActsFile
          ? shexParser.parse(fs.readFileSync(semActsFile, "utf8"), "file://" + semActsFile, {}, semActsFile)
          .startActs.reduce((ret, a) => { ret[a.name] = a.code; return ret; }, {})
          : undefined;
    return getValidator => ({
      diagnose: true,
      results: "api",
      or: "trait" in test && test.trait.indexOf("OneOf") !== -1 ? "oneOf" : "someOf",
      partition: "trait" in test && test.trait.indexOf("Exhaustive") !== -1 ? "exhaustive" : "greedy",
      semActs,
      validateExtern: (point, shapeLabel, ctx) =>
        getValidator().validateShapeDecl(point, shapeExterns[shapeLabel], ctx),
    });
  }

  function shapeMapOf (test, dataURL, schemaURL) {
    const term = (base, s) =>
          s === undefined ? null
          : typeof s === "object" ? {value: s["@value"], type: s["@type"], language: s["@language"]}
          : s.substr(0, 2) === "_:" ? s
          : new URL(s, base).href;
    if (test.action.map) {
      const mapFile = term("file://" + manifestFile, test.action.map);
      return JSON.parse(fs.readFileSync(mapFile.substr("file://".length), "utf8"));
    }
    return [{
      node: term(dataURL, test.action.focus),
      shape: term(schemaURL, test.action.shape) || ShExValidator.Start,
    }];
  }
});
