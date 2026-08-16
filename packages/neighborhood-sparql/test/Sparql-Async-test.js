/** Asking the endpoint with fetch() rather than a blocking request.
 *
 * The db's work is one generator that yields queries; the synchronous face
 * answers them with the blocking transport and the asynchronous one awaits.
 * So what's worth pinning is that they ask for the *same* things and get the
 * same answers -- and that the asynchronous face never reaches for the
 * synchronous transport.
 */
"use strict";

const expect = require("chai").expect;
const N3 = require("n3");
const {sparqlDB, asAsyncDb} = require("..");

const base = "http://a.example/";
const DataFactory = N3.DataFactory;

/** a store, answered through a SPARQL-shaped transport that logs its queries.
 *
 * Not a SPARQL engine -- just enough to answer the two shapes of query this
 * db asks for a node with no blank nodes in sight: the arcs out of a term
 * (selected by predicate) and the arcs into it.  The real engine is exercised
 * by Sparql-Validation-test against a live endpoint; what's under test here
 * is which transport the db reaches for, and that both faces ask the same
 * things.
 */
function endpoint (turtle, log, {async: isAsync = false} = {}) {
  const store = new N3.Store();
  store.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"}).parse(turtle));
  const run = query => {
    log.push(query.replace(/\s+/g, " ").trim());
    const flat = query.replace(/\s+/g, " ");
    const inverse = /\?s \?p <([^>]*)>/.test(flat);
    const iri = (flat.match(/<(http:[^>]*)> \?p \?o/)
                 || flat.match(/\?s \?p <(http:[^>]*)>/) || [])[1];
    if (iri === undefined) return [];
    const term = DataFactory.namedNode(iri);
    const preds = [...flat.matchAll(/VALUES \?p \{([^}]*)\}/g)]
          .flatMap(m => [...m[1].matchAll(/<([^>]*)>/g)].map(p => p[1]));
    const quads = inverse
          ? store.getQuads(null, null, term, null)
          : store.getQuads(term, null, null, null)
            .filter(q => preds.length === 0 || preds.indexOf(q.predicate.value) !== -1);
    // the db selects ?lvl ?s ?p ?o for its blank-node walk; give it that shape
    return quads.map(q => [DataFactory.literal("0"), q.subject, q.predicate, q.object]);
  };
  return isAsync ? async q => run(q) : run;
}

const DATA = `PREFIX : <${base}>
:s :p1 :o1 ; :p2 "two" .
:other :p1 :s .`;

const SHAPE = {type: "Shape", expression: {
  type: "EachOf", expressions: [
    {type: "TripleConstraint", predicate: base + "p1"},
    {type: "TripleConstraint", predicate: base + "p2"},
  ]}};

describe("neighborhood-sparql over fetch()", function () {

  it("should reach the same neighborhood as the blocking transport", async function () {
    const syncLog = [], asyncLog = [];
    const sync = sparqlDB(base + "sparql", undefined,
                          {executeQuery: endpoint(DATA, syncLog)});
    const async = asAsyncDb(sparqlDB(base + "sparql", undefined,
                                     {executeQueryAsync: endpoint(DATA, asyncLog, {async: true})}));
    const point = DataFactory.namedNode(base + "s");
    const a = sync.getNeighborhood(point, "S", SHAPE);
    const b = await async.getNeighborhood(point, "S", SHAPE);
    expect(b.outgoing.map(q => q.predicate.value))
      .to.deep.equal(a.outgoing.map(q => q.predicate.value));
    expect(b.incoming.map(q => q.predicate.value))
      .to.deep.equal(a.incoming.map(q => q.predicate.value));
    // and it asked the endpoint the same things, in the same order
    expect(asyncLog).to.deep.equal(syncLog);
  });

  it("should not touch the blocking transport at all", async function () {
    const log = [];
    const db = asAsyncDb(sparqlDB(base + "sparql", undefined, {
      executeQueryAsync: endpoint(DATA, log, {async: true}),
      executeQuery: () => { throw Error("the async face used the blocking transport"); },
    }));
    const got = await db.getNeighborhood(
      DataFactory.namedNode(base + "s"), "S", SHAPE);
    expect(got.outgoing.length).to.be.above(0);
    expect(log.length, "it did ask").to.be.above(0);
  });

  it("should ask once for a query it has already run", async function () {
    const log = [];
    const db = asAsyncDb(sparqlDB(base + "sparql", undefined,
                                  {executeQueryAsync: endpoint(DATA, log, {async: true})}));
    const point = DataFactory.namedNode(base + "s");
    await db.getNeighborhood(point, "S", SHAPE);
    const first = log.length;
    await db.getNeighborhood(point, "S", SHAPE);
    expect(log.length, "the cache is the same cache").to.equal(first);
  });

  it("should still be the same db, live members and all", function () {
    const sync = sparqlDB(base + "sparql", undefined,
                          {executeQueryAsync: endpoint(DATA, [], {async: true})});
    const db = asAsyncDb(sync);
    expect(typeof db.setSchema, "same helpers").to.equal("function");
    expect(typeof db.executeSelect).to.equal("function");
  });
});
