/**
 * Reference numbers, recorded before the NeighborhoodDb interface goes async.
 *
 * Making getNeighborhood() return a Promise costs something at every call
 * site, and the cost is not one number: it is worst where validations are
 * many and tiny (a promise per call, amortised over almost no work) and
 * least where a few large neighborhoods dominate.  So this measures three
 * shapes of the same question and records the call counts, not just the
 * clock -- a per-call regression is the thing to watch, and total time
 * hides it.
 *
 *   node perf/baseline.js                    # run all three, print
 *   node perf/baseline.js --save sync        # ...and write baseline-sync.json
 *   node perf/baseline.js --compare sync     # ...and diff against that file
 *   node perf/baseline.js --roots 200        # sample size for the store case
 *
 * The FHIR cases need the corpus: perf/fhir/fetch.sh
 */
"use strict";
const fs = require("fs"), Path = require("path");
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("@shexjs/validator");

const argv = process.argv.slice(2);
const opt = (name, dflt) => {
  const at = argv.indexOf("--" + name);
  return at === -1 ? dflt : (argv[at + 1] && !argv[at + 1].startsWith("--") ? argv[at + 1] : true);
};
const SAVE = opt("save", null), COMPARE = opt("compare", null);
const ROOTS = parseInt(opt("roots", "200"), 10);
const DOCS = parseInt(opt("docs", "300"), 10);
const ASYNC_DOCS = parseInt(opt("async-docs", "40"), 10);
const FHIR = "http://hl7.org/fhir/", RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const here = f => Path.join(__dirname, f);

/** wrap a db so every getNeighborhood is counted and timed */
function counted (db, tally) {
  const inner = db.getNeighborhood.bind(db);
  db.getNeighborhood = function (...args) {
    const t = process.hrtime.bigint();
    const got = inner(...args);
    tally.ns += Number(process.hrtime.bigint() - t);
    ++tally.calls;
    return got;
  };
  return db;
}

const stats = ms => {
  const s = ms.slice().sort((a, b) => a - b);
  const at = p => s.length === 0 ? 0 : s[Math.min(s.length - 1, Math.floor(s.length * p))];
  return {
    n: s.length,
    total: +s.reduce((a, b) => a + b, 0).toFixed(1),
    median: +at(.5).toFixed(3), p90: +at(.9).toFixed(3), max: +at(1).toFixed(3),
  };
};

/* ---- A. shexTest: many tiny graphs, the per-call overhead case ---------- */
function shexTestSuite () {
  const root = Path.join(__dirname, "..", "..", "shexTest");
  const manifest = Path.join(root, "validation", "manifest.jsonld");
  if (!fs.existsSync(manifest)) return {skipped: "no ../shexTest checkout"};
  const entries = JSON.parse(fs.readFileSync(manifest, "utf8"))["@graph"][0].entries
        .filter(t => t.action && t.action.schema && t.action.data && typeof t.action.focus === "string");
  const tally = {calls: 0, ns: 0};
  const each = [];
  let ran = 0, conformant = 0;
  for (const test of entries) {
    let schema, graph;
    try {
      schema = ShExParser.construct("http://a.example/", {}, {index: true})
        .parse(fs.readFileSync(Path.join(root, "schemas", Path.basename(test.action.schema)), "utf8"));
      graph = new N3.Store();
      graph.addQuads(new N3.Parser({baseIRI: "http://a.example/", format: "text/turtle"})
        .parse(fs.readFileSync(Path.join(root, "validation", Path.basename(test.action.data)), "utf8")));
    } catch (e) { continue; }
    const shape = test.action.shape === undefined || test.action.shape === "- start -"
          ? ShExValidator.Start : test.action.shape;
    const t = Date.now();
    try {
      const r = new ShExValidator(schema, counted(RdfJsDb(graph), tally), {})
            .validateShapeMap([{node: test.action.focus, shape}])[0];
      if (r.status === "conformant") ++conformant;
    } catch (e) { continue; }
    each.push(Date.now() - t);
    ++ran;
  }
  return {validations: ran, conformant, ms: stats(each),
          neighborhood: {calls: tally.calls, ms: +(tally.ns / 1e6).toFixed(1),
                         perValidation: +(tally.calls / Math.max(1, ran)).toFixed(2),
                         usPerCall: +(tally.ns / 1e3 / Math.max(1, tally.calls)).toFixed(2)}};
}

/** an async face on a local store: the fetch is free, so what this measures
 * is the re-running, not the network */
function asAsync (graph) {
  const inner = RdfJsDb(graph);
  return {
    getSubjects: () => inner.getSubjects(), getPredicates: () => inner.getPredicates(),
    getObjects: () => inner.getObjects(), getQuads: (...a) => inner.getQuads(...a),
    get size () { return inner.size; },
    getNeighborhood: async (p, l, s) => inner.getNeighborhood(p, l, s),
  };
}

/* ---- B and C. FHIR: medium graphs, and one store holding everything ----- */
function fhirSuites () {
  let bench;
  try { bench = require("./fhir/bench.js"); } catch (e) { return [{skipped: String(e).slice(0, 60)}, null]; }
  const dir = Path.join(bench.CORPUS, "examples");
  if (!fs.existsSync(dir)) return [{skipped: "no corpus; run perf/fhir/fetch.sh"}, null];
  const {schema, ms: schemaMs} = bench.loadSchema();
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".ttl")
    && bench.NOT_EXAMPLES.indexOf(f) === -1).sort();

  const load = f => {
    const g = new N3.Store();
    g.addQuads(new N3.Parser({baseIRI: FHIR, format: "text/turtle"})
      .parse(fs.readFileSync(Path.join(dir, f), "utf8")));
    bench.dataFixups.forEach(x => x.apply(g));
    return g;
  };
  const typeOf = (g, node) => g.getQuads(node, RDF + "type", null, null).map(q => q.object.value)[0];

  // B: document at a time
  const perDoc = {calls: 0, ns: 0};
  const docMs = [];
  let docs = 0, docConformant = 0;
  for (const f of files.slice(0, DOCS)) {
    let g; try { g = load(f); } catch (e) { continue; }
    for (const node of g.getQuads(null, FHIR + "nodeRole", FHIR + "treeRoot", null).map(q => q.subject)) {
      const type = typeOf(g, node); if (type === undefined) continue;
      const t = Date.now();
      try {
        const r = new ShExValidator(schema, counted(RdfJsDb(g), perDoc), {})
              .validateShapeMap([{node: node.value, shape: type}])[0];
        if (r.status === "conformant") ++docConformant;
      } catch (e) { continue; }
      docMs.push(Date.now() - t); ++docs;
    }
  }

  // C: one store holding the whole corpus -- validation over a local quad store
  const store = new N3.Store();
  const t0 = Date.now();
  files.forEach((f, i) => {
    try {
      store.addQuads(new N3.Parser({baseIRI: FHIR, format: "text/turtle", blankNodePrefix: "_:f" + i + "_"})
        .parse(fs.readFileSync(Path.join(dir, f), "utf8")));
    } catch (e) {}
  });
  bench.dataFixups.forEach(x => x.apply(store));
  const loadMs = Date.now() - t0;
  const roots = store.getQuads(null, FHIR + "nodeRole", FHIR + "treeRoot", null).map(q => q.subject);
  const perStore = {calls: 0, ns: 0};
  const storeMs = [];
  let storeConformant = 0;
  const db = counted(RdfJsDb(store), perStore);
  for (const node of roots.slice(0, ROOTS)) {
    const type = typeOf(store, node); if (type === undefined) continue;
    const t = Date.now();
    try {
      const r = new ShExValidator(schema, db, {}).validateShapeMap([{node: node.value, shape: type}])[0];
      if (r.status === "conformant") ++storeConformant;
    } catch (e) { continue; }
    storeMs.push(Date.now() - t);
  }

  const nb = (tally, n) => ({calls: tally.calls, ms: +(tally.ns / 1e6).toFixed(1),
    perValidation: +(tally.calls / Math.max(1, n)).toFixed(2),
    usPerCall: +(tally.ns / 1e3 / Math.max(1, tally.calls)).toFixed(2)});
  return [
    {schemaParseMs: schemaMs, validations: docs, conformant: docConformant,
     ms: stats(docMs), neighborhood: nb(perDoc, docs)},
    {quads: store.size, documents: files.length, loadMs, roots: roots.length,
     validations: storeMs.length, conformant: storeConformant,
     ms: stats(storeMs), neighborhood: nb(perStore, storeMs.length)},
  ];
}

function show (name, r) {
  if (!r) return;
  if (r.skipped) { console.log("\n## " + name + ": skipped -- " + r.skipped); return; }
  console.log("\n## " + name);
  if (r.quads !== undefined)
    console.log("   " + r.documents + " documents -> " + r.quads + " quads in one store, loaded in " + r.loadMs + "ms; " + r.roots + " roots");
  if (r.schemaParseMs !== undefined) console.log("   schema parsed in " + r.schemaParseMs + "ms");
  console.log("   validations " + r.validations + " (" + r.conformant + " conformant)"
              + "   total " + r.ms.total + "ms, median " + r.ms.median + "ms, p90 " + r.ms.p90 + "ms, max " + r.ms.max + "ms");
  const n = r.neighborhood;
  console.log("   getNeighborhood: " + n.calls + " calls, " + n.perValidation + " per validation, "
              + n.usPerCall + "us each, " + n.ms + "ms total");
}

/* ---- D. the async path, over the same local data -------------------------
 * The search is resumable, so this is one traversal driven by awaits, with
 * the fetch itself free -- what it measures is the machinery, not a network.
 * A real async source adds latency on top, and gets a level's fetches out
 * together where the schema forks. */
async function asyncSuite () {
  let bench;
  try { bench = require("./fhir/bench.js"); } catch (e) { return {skipped: "no bench"}; }
  const dir = Path.join(bench.CORPUS, "examples");
  if (!fs.existsSync(dir)) return {skipped: "no corpus; run perf/fhir/fetch.sh"};
  const {schema} = bench.loadSchema();
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".ttl")
    && bench.NOT_EXAMPLES.indexOf(f) === -1).sort().slice(0, ASYNC_DOCS);
  const syncMs = [], asyncMs = [], passes = [];
  let agree = 0, n = 0;
  for (const f of files) {
    let g;
    try {
      g = new N3.Store();
      g.addQuads(new N3.Parser({baseIRI: FHIR, format: "text/turtle"})
        .parse(fs.readFileSync(Path.join(dir, f), "utf8")));
      bench.dataFixups.forEach(x => x.apply(g));
    } catch (e) { continue; }
    const node = g.getQuads(null, FHIR + "nodeRole", FHIR + "treeRoot", null).map(q => q.subject)[0];
    const type = node && g.getQuads(node, RDF + "type", null, null).map(q => q.object.value)[0];
    if (!type) continue;
    let t = Date.now();
    const s = new ShExValidator(schema, RdfJsDb(g), {}).validateShapeMap([{node: node.value, shape: type}])[0];
    syncMs.push(Date.now() - t);
    const v = new ShExValidator(schema, asAsync(g), {});
    t = Date.now();
    let a;
    try { a = (await v.validateShapeMapAsync([{node: node.value, shape: type}]))[0]; }
    catch (e) { continue; }
    asyncMs.push(Date.now() - t);
    passes.push(v.asyncStats.fetched);
    if (a.status === s.status) ++agree;
    ++n;
  }
  const sum = a => a.reduce((x, y) => x + y, 0);
  return {documents: n, agree, sync: stats(syncMs), async: stats(asyncMs),
          slowdown: +(sum(asyncMs) / Math.max(1, sum(syncMs))).toFixed(2),
          fetches: stats(passes)};
}

const result = {when: new Date().toISOString(), node: process.version,
                git: require("child_process").execSync("git rev-parse --short HEAD").toString().trim()};
(async () => {
result.shexTest = shexTestSuite();
const [fhirDoc, fhirStore] = fhirSuites();
result.fhirPerDocument = fhirDoc;
result.fhirOneStore = fhirStore;

result.asyncOverLocal = await asyncSuite();

show("shexTest -- many tiny validations", result.shexTest);
show("FHIR -- a document at a time", result.fhirPerDocument);
show("FHIR -- one store, the local-quad-store case", result.fhirOneStore);
if (result.asyncOverLocal && !result.asyncOverLocal.skipped) {
  const a = result.asyncOverLocal;
  console.log("\n## the async path over the same local data (fetch free; re-running only)");
  console.log("   " + a.documents + " documents, " + a.agree + " agreeing with the sync verdict");
  console.log("   sync " + a.sync.total + "ms -> async " + a.async.total + "ms  (" + a.slowdown + "x)");
  console.log("   neighborhoods fetched per document: median " + a.fetches.median + ", max " + a.fetches.max);
}

if (COMPARE) {
  const was = JSON.parse(fs.readFileSync(here("baseline-" + COMPARE + ".json"), "utf8"));
  console.log("\n## against baseline-" + COMPARE + ".json");
  for (const suite of ["shexTest", "fhirPerDocument", "fhirOneStore"]) {
    const a = was[suite], b = result[suite];
    if (!a || !b || a.skipped || b.skipped) continue;
    const d = (x, y) => y === 0 ? "n/a" : ((x / y - 1) * 100).toFixed(1).padStart(6) + "%";
    console.log("   " + suite.padEnd(16)
                + " total " + d(b.ms.total, a.ms.total)
                + "   median " + d(b.ms.median, a.ms.median)
                + "   per-call " + d(b.neighborhood.usPerCall, a.neighborhood.usPerCall)
                + "   calls " + d(b.neighborhood.calls, a.neighborhood.calls));
  }
}
if (SAVE) {
  fs.writeFileSync(here("baseline-" + SAVE + ".json"), JSON.stringify(result, null, 1) + "\n");
  console.log("\nwrote perf/baseline-" + SAVE + ".json");
}
})();
