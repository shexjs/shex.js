/** What each neighborhood hands an extension that wants to query its data.
 *
 * A query runs over the db's own view (see QuerySource in
 * neighborhood-api): the dataset for a local store, the endpoint for a
 * SPARQL db, the pages loaded so far for a wikibase.  The wrappers a host
 * puts around a db -- ordered(), asAsyncDb() -- mustn't hide it.
 *
 * The implementations are required plainly rather than as devDependencies:
 * this package is upstream of them all (see PaneClaim-test.js).
 */
"use strict";

const expect = require("chai").expect;
const fs = require("fs");
const path = require("path");
const N3 = require("n3");
const {ordered} = require("..");
const Rdfjs = require("@shexjs/neighborhood-rdfjs");
const Sparql = require("@shexjs/neighborhood-sparql");
const Wikibase = require("@shexjs/neighborhood-wikibase");

const {namedNode, literal, quad} = N3.DataFactory;
const base = "http://a.example/";

describe("a neighborhood's query source", function () {

  it("should be the store itself, for rdfjs", function () {
    const store = new N3.Store();
    store.addQuad(quad(namedNode(base + "s"), namedNode(base + "p"), literal("o")));
    store.addQuad(quad(namedNode(base + "s"), namedNode(base + "p"), literal("in g"), namedNode(base + "g")));
    const source = Rdfjs.ctor(store).querySource();
    expect(source.kind).to.equal("rdfjs");
    expect(source.dataset).to.equal(store);        // the whole dataset, named graphs too
  });

  it("should survive ordered()", function () {
    const store = new N3.Store();
    expect(ordered(Rdfjs.ctor(store)).querySource().dataset).to.equal(store);
  });

  it("should send a query to the endpoint, for sparql, and answer SELECT and ASK", async function () {
    const asked = [];
    const db = Sparql.ctor("http://endpoint.example/sparql", undefined, {
      executeSparqlAsync: async (query, endpoint) => {
        asked.push({query, endpoint});
        return query.startsWith("ASK") ? {boolean: true}
          : {vars: ["x"], rows: [[namedNode(base + "x")]]};
      },
    });
    for (const face of [db, Sparql.asAsyncDb(db), ordered(Sparql.asAsyncDb(db))]) {
      const source = face.querySource();
      expect(source.kind).to.equal("endpoint");
      expect(source.endpoint).to.equal("http://endpoint.example/sparql");
    }
    const source = ordered(Sparql.asAsyncDb(db)).querySource();
    expect(await source.query("ASK {}")).to.deep.equal({boolean: true});
    const select = await source.query("SELECT ?x {}");
    expect(select.vars).to.deep.equal(["x"]);
    expect(select.rows[0][0].value).to.equal(base + "x");
    expect(asked.map(a => a.endpoint)).to.deep.equal(Array(2).fill("http://endpoint.example/sparql"));
  });

  it("should go through the endpoint's rate limiter", async function () {
    const db = Sparql.ctor("http://endpoint.example/sparql", undefined, {
      executeSparqlAsync: async () => ({boolean: true}),
    });
    let paced = 0;
    const run = db.rateLimit.run.bind(db.rateLimit);
    db.rateLimit.run = task => (++paced, run(task));
    await db.querySource().query("ASK {}");
    expect(paced).to.equal(1);
  });

  it("should be the pages loaded so far, for wikibase", function () {
    Wikibase.forgetPages();
    const fixtures = path.join(__dirname, "../../neighborhood-wikibase/test/fixtures");
    const fetchDoc = url => url.indexOf("sitematrix") !== -1
          ? fs.readFileSync(path.join(fixtures, "sitematrix.json"), "utf8")
          : fs.readFileSync(path.join(fixtures, url.match(/EntityData\/([QPL]\d+)\.json$/)[1] + ".json"), "utf8");
    const db = Wikibase.wikibaseDB(null, {fetchDoc});
    const source = db.querySource();
    expect(source.kind).to.equal("rdfjs");
    const Q42 = namedNode("http://www.wikidata.org/entity/Q42");
    expect(source.dataset.countQuads(Q42, null, null, null)).to.equal(0);
    db.getNeighborhood(Q42, "-start-", {type: "Shape"});
    // the same dataset, grown by the page that was loaded
    expect(source.dataset.countQuads(Q42, null, null, null)).to.be.above(0);
  });
});
