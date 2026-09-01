/** Validating over a db that has to go and fetch what it answers with.
 *
 * The search is resumable: it stops at a fetch and goes on from there, in one
 * traversal.  What this file pins is that the answer is the same as the
 * synchronous one, that each node is fetched exactly once, that independent
 * branches go out together, and that two branches wanting the same node share
 * one fetch rather than starting two.
 */
"use strict";

const expect = require("chai").expect;
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("..");

const base = "http://a.example/";
const PRE = "PREFIX : <" + base + ">\n";

/** an async db over an rdfjs store, counting what it is asked for */
function remote (graph, {latency = 0} = {}) {
  const inner = RdfJsDb(graph);
  const asked = [];
  return {
    asked,
    getSubjects: () => inner.getSubjects(),
    getPredicates: () => inner.getPredicates(),
    getObjects: () => inner.getObjects(),
    getQuads: (...a) => inner.getQuads(...a),
    get size () { return inner.size; },
    getNeighborhood: async (point, shapeLabel, shape) => {
      asked.push(point.value);
      if (latency) await new Promise(res => setTimeout(res, latency));
      return inner.getNeighborhood(point, shapeLabel, shape);
    },
  };
}

function parse (schemaText, dataText) {
  const schema = ShExParser.construct(base, {}, {index: true}).parse(PRE + schemaText);
  const graph = new N3.Store();
  graph.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"}).parse(PRE + dataText));
  return {schema, graph};
}

/* a chain: each node points at the next, so the shape has to walk down it */
const CHAIN = "<S> { :next @<S> ? ; :v . }";
const chain = depth => Array.from({length: depth}, (_, i) =>
  `:n${i} :v ${i}` + (i + 1 < depth ? ` ; :next :n${i + 1}` : "") + " .").join("\n");

describe("validating over an async db", function () {

  it("should reach the same verdict as the synchronous path", async function () {
    const {schema, graph} = parse(CHAIN, chain(4));
    const sync = new ShExValidator(schema, RdfJsDb(graph), {})
          .validateShapeMap([{node: base + "n0", shape: base + "S"}]);
    const async = await new ShExValidator(schema, remote(graph), {})
          .validateShapeMapAsync([{node: base + "n0", shape: base + "S"}]);
    expect(async.map(r => r.status)).to.deep.equal(sync.map(r => r.status));
    expect(JSON.stringify(async)).to.equal(JSON.stringify(sync));
  });

  it("should say a node is nonconformant, not merely unfetched", async function () {
    // :n1 has no :v, so the chain is genuinely bad -- and the answer must be
    // that, rather than the "nothing here" a pass sees before fetching
    const {schema, graph} = parse(CHAIN, ":n0 :v 0 ; :next :n1 .\n:n1 :other 1 .");
    const [result] = await new ShExValidator(schema, remote(graph), {})
          .validateShapeMapAsync([{node: base + "n0", shape: base + "S"}]);
    expect(result.status).to.equal("nonconformant");
    const sync = new ShExValidator(schema, RdfJsDb(graph), {})
          .validateShapeMap([{node: base + "n0", shape: base + "S"}])[0];
    expect(JSON.stringify(result)).to.equal(JSON.stringify(sync));
  });

  it("should fetch each node once, in one traversal", async function () {
    const {schema, graph} = parse(CHAIN, chain(6));
    const db = remote(graph);
    const v = new ShExValidator(schema, db, {});
    await v.validateShapeMapAsync([{node: base + "n0", shape: base + "S"}]);
    // the search stops and goes on rather than starting over, so nothing is
    // walked twice and nothing is fetched twice
    expect(v.asyncStats.fetched, "one fetch per node").to.equal(6);
    expect(db.asked.length, "and the db saw exactly those").to.equal(6);
  });

  it("should fetch a level's nodes together rather than one at a time", async function () {
    // a fan: one node pointing at four, each of which must be walked
    const {schema, graph} = parse(
      "<S> { :child @<Leaf> * }\n<Leaf> { :v . }",
      ":root :child :a , :b , :c , :d .\n" +
      [0, 1, 2, 3].map((n, i) => `:${"abcd"[i]} :v ${n} .`).join("\n"));
    const started = Date.now();
    const [result] = await new ShExValidator(schema, remote(graph, {latency: 25}), {})
          .validateShapeMapAsync([{node: base + "root", shape: base + "S"}]);
    expect(result.status).to.equal("conformant");
    // four leaves at 25ms each: in parallel that is one 25ms wait, not four
    expect(Date.now() - started, "the level went out together").to.be.below(25 * 4);
  });

  /* The pairs of a shape map are independent of each other, so they are a
   * fan like any other -- and over a db that fetches they are usually the
   * widest one there is.  A SPARQL query naming ten nodes used to walk them
   * strictly in turn, each starting only after the one before it had been
   * to the network and back for every node it reached. */
  it("should walk a shape map's pairs together rather than one at a time", async function () {
    const {schema, graph} = parse(
      "<S> { :st @<T> + }\n<T> { :v . }",
      [0, 1, 2, 3].map(n => `:q${n} :st :s${n} .\n:s${n} :v ${n} .`).join("\n"));
    const map = [0, 1, 2, 3].map(n => ({node: base + "q" + n, shape: base + "S"}));
    const db = remote(graph, {latency: 25});
    const started = Date.now();
    const results = await new ShExValidator(schema, db, {}).validateShapeMapAsync(map);
    expect(results.map(r => r.status)).to.deep.equal(Array(4).fill("conformant"));
    expect(db.asked.length, "two levels for each of four nodes").to.equal(8);
    // eight fetches, but only two waits deep: the four walks overlap
    expect(Date.now() - started, "the map went out together").to.be.below(25 * 8);
  });

  it("should reach the same verdicts as walking them in turn", async function () {
    const {schema, graph} = parse(
      "<S> { :v [1 2] }",
      ":a :v 1 .\n:b :v 9 .\n:c :v 2 .");
    const map = ["a", "b", "c"].map(n => ({node: base + n, shape: base + "S"}));
    const asyncRan = await new ShExValidator(schema, remote(graph), {})
          .validateShapeMapAsync(map);
    const syncRan = new ShExValidator(schema, RdfJsDb(graph), {}).validateShapeMap(map);
    expect(asyncRan.map(r => r.status)).to.deep.equal(syncRan.map(r => r.status));
    expect(asyncRan.map(r => r.status)).to.deep.equal(
      ["conformant", "nonconformant", "conformant"]);
    // and in the order they were asked for, which is what a result map is
    expect(asyncRan.map(r => r.node)).to.deep.equal(map.map(p => p.node));
  });

  /* The probe passes are wrong on purpose -- they run against neighborhoods
   * that haven't arrived -- so a semantic action must not see them.  An
   * action is handed the triples it fired on and does something opaque with
   * them; firing it once per level would be a different program. */
  it("should fire semantic actions once, not once per pass", async function () {
    const TEST = "http://shex.io/extensions/Test/";
    const schema = ShExParser.construct(base, {}, {index: true}).parse(
      PRE + "PREFIX Test: <" + TEST + ">\n<S> { :v . %Test:{ x %} ; :next @<S> ? }");
    const graph = new N3.Store();
    graph.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"})
      .parse(PRE + ":n0 :v 0 ; :next :n1 . :n1 :v 1 ; :next :n2 . :n2 :v 2 ; :next :n3 . :n3 :v 3 ."));
    const fired = subject => (code, ctx) =>
      (subject.push((ctx.triples || []).map(q => q.subject.value.replace(base, "")).join(",")), []);

    const asyncSaw = [];
    const v = new ShExValidator(schema, remote(graph), {});
    v.semActHandler.register(TEST, {dispatch: fired(asyncSaw)});
    await v.validateShapeMapAsync([{node: base + "n0", shape: base + "S"}]);

    const syncSaw = [];
    const v2 = new ShExValidator(schema, RdfJsDb(graph), {});
    v2.semActHandler.register(TEST, {dispatch: fired(syncSaw)});
    v2.validateShapeMap([{node: base + "n0", shape: base + "S"}]);

    expect(asyncSaw).to.deep.equal(syncSaw);
  });

  it("should accept an ordinary synchronous db too", async function () {
    const {schema, graph} = parse(CHAIN, chain(3));
    const [result] = await new ShExValidator(schema, RdfJsDb(graph), {})
          .validateShapeMapAsync([{node: base + "n0", shape: base + "S"}]);
    expect(result.status).to.equal("conformant");
  });

  /* Two branches wanting the same node is the case the batching exists for.
   * :x and :y are checked as one fork, so both are running when they reach
   * :z -- the second finds the fetch already in flight and waits on it
   * rather than starting a second one. */
  it("should share one fetch between branches that want the same node", async function () {
    const {schema, graph} = parse(
      "<S> { :child @<Mid> * }\n<Mid> { :next @<Leaf> }\n<Leaf> { :v . }",
      ":root :child :x , :y .\n:x :next :z .\n:y :next :z .\n:z :v 1 .");
    const db = remote(graph, {latency: 20});
    const v = new ShExValidator(schema, db, {});
    const [result] = await v.validateShapeMapAsync([{node: base + "root", shape: base + "S"}]);
    expect(result.status).to.equal("conformant");
    expect(v.asyncStats.forks, "the two children were forked").to.be.above(0);
    expect(v.asyncStats.shared, ":z was wanted by both, in flight").to.be.above(0);
    expect(db.asked.filter(u => u.endsWith("/z")).length, ":z fetched once").to.equal(1);
  });

});
