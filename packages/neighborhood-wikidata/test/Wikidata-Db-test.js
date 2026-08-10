"use strict";
/**
 * Behavior of the wikidata NeighborhoodDb: which page a focus node fetches,
 * what the two cache layers save, and a validation that walks entity ->
 * statement -> value node -> neighboring entity over fixture pages alone.
 *
 * The default run touches no network: a fixture transport serves the pages
 * captured in ./fixtures and counts what a real transport would have
 * fetched.  TEST_wikidata=true adds a live smoke test against wikidata.org.
 */

const fs = require("fs");
const os = require("os");
const path = require("path");
const chai = require("chai");
const assert = chai.assert;
const expect = chai.expect;
const N3 = require("n3");

const {wikidataDB, EntityResolutionError} = require("../lib/neighborhood-wikidata");
const ShExParser = require("@shexjs/parser");
const {ShExValidator} = require("@shexjs/validator");

const fixtures = path.join(__dirname, "fixtures");

const WD = "http://www.wikidata.org/entity/";
const WDT = "http://www.wikidata.org/prop/direct/";
const P = "http://www.wikidata.org/prop/";
const WDV = "http://www.wikidata.org/value/";
const nn = v => N3.DataFactory.namedNode(v);

/** Serve fixture pages; remember what was asked for. */
function fixtureTransport () {
  const log = [];
  return {
    log,
    fetchDoc: url => {
      log.push(url);
      if (url.indexOf("sitematrix") !== -1)
        return fs.readFileSync(path.join(fixtures, "sitematrix.json"), "utf8");
      const m = url.match(/EntityData\/([QPL]\d+)\.json$/);
      if (m && fs.existsSync(path.join(fixtures, m[1] + ".json")))
        return fs.readFileSync(path.join(fixtures, m[1] + ".json"), "utf8");
      throw Error(`no fixture for ${url}`);
    },
  };
}

const anyShape = {type: "Shape"};

describe("neighborhood-wikidata", () => {

  it("should serve an entity's neighborhood from its JSON page", () => {
    const {log, fetchDoc} = fixtureTransport();
    const db = wikidataDB(null, {fetchDoc});
    const {outgoing, incoming} = db.getNeighborhood(nn(WD + "Q42"), "-start-", anyShape);
    assert.isTrue(outgoing.some(q => q.predicate.value === WDT + "P31" && q.object.value === WD + "Q5"),
                  "wdt:P31 wd:Q5 should be among Q42's outgoing arcs");
    // the page also names Q42 in its own statements and sitelinks
    assert.isTrue(incoming.some(q => q.predicate.value === "http://schema.org/about"));
    assert.deepEqual(log.filter(u => u.indexOf("EntityData") !== -1).length, 1);
  });

  it("should fetch each page and the sitematrix once, however many neighborhoods ask", () => {
    const {log, fetchDoc} = fixtureTransport();
    const db = wikidataDB(null, {fetchDoc});
    db.getNeighborhood(nn(WD + "Q42"), "-start-", anyShape);
    db.getNeighborhood(nn(WD + "Q42"), "-start-", anyShape);
    const statement = db.getQuads(nn(WD + "Q42"), nn(P + "P569"), null, null)[0].object;
    db.getNeighborhood(statement, "-start-", anyShape);
    assert.equal(log.length, 2, "one entity page + one sitematrix: " + log.join(", "));
  });

  it("should resolve a statement node to its entity's page", () => {
    const {log, fetchDoc} = fixtureTransport();
    const db = wikidataDB(null, {fetchDoc});
    // "q42$D8404CDA-..." is a pre-2015 statement id: lowercase entity prefix
    const stmt = nn("http://www.wikidata.org/entity/statement/q42-D8404CDA-25E4-4334-AF13-A3290BCD9C0F");
    const {outgoing} = db.getNeighborhood(stmt, "-start-", anyShape);
    assert.isTrue(outgoing.some(q => q.predicate.value === "http://www.wikidata.org/prop/statement/P569"));
    assert.isTrue(log.some(u => u.indexOf("Q42.json") !== -1));
  });

  it("should serve value and reference nodes reached through their statements", () => {
    const db = wikidataDB(null, fixtureTransport());
    db.getNeighborhood(nn(WD + "Q42"), "-start-", anyShape);
    const psv = db.getQuads(null, nn(P + "statement/value/P569"), null, null);
    assert.isAbove(psv.length, 0);
    const {outgoing} = db.getNeighborhood(psv[0].object, "-start-", anyShape);
    assert.isTrue(outgoing.some(q => q.predicate.value === "http://wikiba.se/ontology#timeValue"));
  });

  it("should refuse a value node it has never seen rather than call it empty", () => {
    const db = wikidataDB(null, fixtureTransport());
    expect(() => db.getNeighborhood(nn(WDV + "deadbeef00000000000000000000dead"), "-start-", anyShape))
      .to.throw(EntityResolutionError, /walk in through/);
  });

  it("should refuse a blank node it did not mint", () => {
    const db = wikidataDB(null, fixtureTransport());
    expect(() => db.getNeighborhood(N3.DataFactory.blankNode("b0"), "-start-", anyShape))
      .to.throw(EntityResolutionError);
  });

  it("should keep pages on disk when given a cacheDir", () => {
    const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), "wikidata-cache-"));
    try {
      const first = fixtureTransport();
      wikidataDB(null, {fetchDoc: first.fetchDoc, cacheDir})
        .getNeighborhood(nn(WD + "Q42"), "-start-", anyShape);
      assert.equal(first.log.length, 2);
      assert.isTrue(fs.existsSync(path.join(cacheDir, "Q42.json")));

      const second = fixtureTransport();
      wikidataDB(null, {fetchDoc: second.fetchDoc, cacheDir})
        .getNeighborhood(nn(WD + "Q42"), "-start-", anyShape);
      assert.deepEqual(second.log, [], "everything should have come from the disk cache");
    } finally {
      fs.rmSync(cacheDir, {recursive: true, force: true});
    }
  });

  describe("validation", () => {
    // entity -> statement -> value node, plus a hop to a second entity's
    // page (Q5), all synthesized from JSON
    const schemaText = `
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX p: <http://www.wikidata.org/prop/>
PREFIX ps: <http://www.wikidata.org/prop/statement/>
PREFIX psv: <http://www.wikidata.org/prop/statement/value/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<#human> {
  wdt:P31 [wd:Q5] AND @<#class> ;
  wdt:P569 xsd:dateTime ;
  p:P569 @<#birthStatement>+ ;
}

<#class> {
  wdt:P279 IRI+ ;
}

<#birthStatement> {
  a [wikibase:Statement wikibase:BestRank]{1,2} ;
  wikibase:rank [wikibase:NormalRank wikibase:PreferredRank] ;
  ps:P569 xsd:dateTime ;
  psv:P569 @<#timeValue> ;
}

<#timeValue> {
  a [wikibase:TimeValue] ;
  wikibase:timeValue xsd:dateTime ;
  wikibase:timePrecision xsd:integer ;
  wikibase:timeTimezone xsd:integer ;
  wikibase:timeCalendarModel IRI ;
}`;
    const base = "https://example.org/wikidata-test";
    const schema = ShExParser.construct(base).parse(schemaText);

    it("should validate Q42 as a human across four fixture pages", () => {
      const {log, fetchDoc} = fixtureTransport();
      const db = wikidataDB(null, {fetchDoc});
      const validator = new ShExValidator(schema, db, {});
      const results = validator.validateShapeMap([{node: WD + "Q42", shape: base + "#human"}]);
      assert.equal(results[0].status, "conformant",
                   JSON.stringify(results[0].appinfo, null, 2));
      const pages = log.filter(u => u.indexOf("EntityData") !== -1);
      assert.sameMembers(pages.map(u => u.match(/([QPL]\d+)\.json$/)[1]), ["Q42", "Q5"],
                         "the walk should have pulled exactly Q42's and Q5's pages");
    });

    it("should report a nonconformant node with the mismatch, not an error", () => {
      const db = wikidataDB(null, fixtureTransport());
      const validator = new ShExValidator(schema, db, {});
      // an item is not a time value node
      const results = validator.validateShapeMap([{node: WD + "Q5", shape: base + "#timeValue"}]);
      assert.equal(results[0].status, "nonconformant");
    });
  });

  describe("live wikidata.org", () => {
    if (!("TEST_wikidata" in process.env)) {
      it("needs TEST_wikidata=true (and a network)");
      return;
    }
    const {syncRequest, closeSyncFetch} = require("@shexjs/neighborhood-sparql/sync-fetch");
    after(() => closeSyncFetch());

    it("should fetch and convert a live entity page", function () {
      this.timeout(60000);
      const db = wikidataDB(null, {
        fetchDoc: url => {
          const res = syncRequest("GET", url, {
            Accept: "application/json",
            // wikimedia 403s requests that don't identify themselves
            "User-Agent": "@shexjs/neighborhood-wikidata test suite",
          });
          if (res.status >= 400) throw Error(`GET <${url}> returned ${res.status}`);
          return res.body;
        },
      });
      const {outgoing} = db.getNeighborhood(nn(WD + "Q42"), "-start-", anyShape);
      assert.isTrue(outgoing.some(q => q.predicate.value === WDT + "P31" && q.object.value === WD + "Q5"));
    });
  });
});
