"use strict";
/**
 * Launches (or attaches to) the SPARQL endpoint the neighborhood-sparql tests
 * run against, and exposes it through blocking calls so tests can stay
 * synchronous, like the NeighborhoodDb API they exercise.
 *
 * SPARQL_ENDPOINT=http://host/sparql runs against an external store instead
 * (QLever, Fuseki, ...).  Everything below the SPARQL protocol -- loading and
 * clearing -- then goes through SPARQL Update rather than the local
 * server's bulk-load shortcut, so any spec-compliant endpoint will do.
 */

const path = require("path");
const {Worker} = require("worker_threads");
const {syncRequest, closeSyncFetch, installXhrShim} = require("../sync-fetch");

const SERVER = path.join(__dirname, "sparql-test-server.js");

/** N-Triples for one quad, the lowest common denominator for INSERT DATA.
 *
 * ECHAR covers seven characters; every other control character has to go in as
 * \uXXXX, which QLever is right to insist on and comunica lets slide. */
const NT_ESCAPES = {"\\": "\\\\", '"': '\\"', "\n": "\\n", "\r": "\\r",
                    "\t": "\\t", "\b": "\\b", "\f": "\\f"};

function ntriplesEscape (s) {
  // eslint-disable-next-line no-control-regex
  return s.replace(/[\\"\u0000-\u001F\u007F]/g, c =>
    NT_ESCAPES[c] || "\\u" + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0"));
}

function ntTerm (t) {
  switch (t.termType) {
  case "NamedNode": return "<" + t.value + ">";
  case "BlankNode": return "_:" + t.value;
  case "Literal": return '"' + ntriplesEscape(t.value) + '"' + (
    t.language ? "@" + t.language
      : t.datatype && t.datatype.value !== "http://www.w3.org/2001/XMLSchema#string"
      ? "^^<" + t.datatype.value + ">"
      : "");
  default: throw Error("can't write a " + t.termType + " in N-Triples");
  }
}

function quadsToNTriples (quads) {
  return quads.map(q => `${ntTerm(q.subject)} ${ntTerm(q.predicate)} ${ntTerm(q.object)} .`).join("\n");
}

class Endpoint {
  constructor (url, {worker = null, external = false, scramble = false} = {}) {
    this.url = url;
    this.origin = new URL(url).origin;
    this._worker = worker;
    this.external = external;
    this.scramble = scramble;
    /** Triples the endpoint refused, with its reason. Not everything that is
     * legal RDF survives every store's SPARQL Update parser -- QLever, for one,
     * folds `\\u0061` (an escaped backslash followed by the text "u0061") back
     * into an invalid escape -- and a run against a store that dropped some of
     * its input should say so rather than quietly test less. */
    this.rejected = [];
  }

  /** Blocking SPARQL Update. */
  update (sparql) {
    const res = syncRequest("POST", this.url, {"Content-Type": "application/sparql-update"}, sparql);
    if (res.status >= 400)
      throw Error(`SPARQL Update failed (${res.status}):\n${sparql}\n${res.body}`);
    return res;
  }

  /** Blocking SPARQL SELECT, returned as sparql-results+json. */
  select (sparql) {
    const res = syncRequest("GET", this.url + "?query=" + encodeURIComponent(sparql),
                            {Accept: "application/sparql-results+json"});
    if (res.status >= 400)
      throw Error(`SPARQL query failed (${res.status}):\n${sparql}\n${res.body}`);
    return JSON.parse(res.body);
  }

  /** Empty every graph, then put the fixture back. */
  clear () {
    if (this.external) {
      this.update("CLEAR ALL");
      if (this._fixture) this._fixture(this);
      return;
    }
    const res = syncRequest("POST", this.origin + "/clear", {});
    if (res.status >= 400) throw Error("clear failed: " + res.body);
  }

  /** Install a fixture that survives clear().
   *
   * Blank nodes can't be named in a DELETE -- no told bnodes -- so the only way
   * to get back to a known graph is to rebuild it.  The local server keeps a
   * copy of the quads; an external endpoint gets the loader re-run. */
  setFixture (load) {
    this._fixture = load;
    load(this);
    if (!this.external) syncRequest("POST", this.origin + "/snapshot", {});
  }

  /** Load rdfjs quads into the default graph.
   *
   * Each load gets its own blank node scope -- SPARQL Update says so for
   * INSERT DATA, and the local server's parser mints a fresh prefix -- so
   * `_:b0` in the data and `_:b0` in the DECEPTICON stay two nodes. */
  loadQuads (quads) {
    if (quads.length === 0) return 0;
    if (this.external) return this._insertData(quads);
    const res = syncRequest("POST", this.origin + "/load", {"Content-Type": "text/turtle"},
                            quadsToNTriples(quads));
    if (res.status >= 400) throw Error("load failed: " + res.body);
    return 0;
  }

  /** INSERT DATA, bisecting on failure to find which triples the store won't
   * take.  Returns how many it refused; they land in `rejected`. */
  _insertData (quads) {
    try {
      this.update("INSERT DATA {\n" + quadsToNTriples(quads) + "\n}");
      return 0;
    } catch (e) {
      if (quads.length === 1) {
        this.rejected.push({quad: quads[0], error: String(e.message).split("\n").pop()});
        return 1;
      }
      const half = quads.length >> 1;
      return this._insertData(quads.slice(0, half)) + this._insertData(quads.slice(half));
    }
  }

  /** Load Turtle text. Local server parses it directly (fast path); an
   * external endpoint gets it as INSERT DATA. */
  loadTurtle (text, baseIRI) {
    if (this.external) {
      const N3 = require("n3");
      return this.loadQuads(new N3.Parser({baseIRI, factory: N3.DataFactory}).parse(text));
    }
    const url = this.origin + "/load" + (baseIRI ? "?base=" + encodeURIComponent(baseIRI) : "");
    const res = syncRequest("POST", url, {"Content-Type": "text/turtle"}, text);
    if (res.status >= 400) throw Error("load failed: " + res.body);
    return parseInt(res.body, 10);
  }

  /** Literals from `quads` that the store did not faithfully round-trip.
   *
   * Some stores normalize literals on ingest -- QLever stores numerics
   * natively and hands back `"5"^^xsd:int` for `"5"^^xsd:byte` -- which
   * changes literal identity and so changes validation.  A test whose data
   * the store rewrote can't be compared, only skipped, and this is how the
   * harness finds out. */
  literalsMissing (quads) {
    const want = new Map();
    const key = t => JSON.stringify([t.value, t.language || "",
                                     t.language ? "" : (t.datatype ? t.datatype.value : "")]);
    for (const q of quads)
      if (q.object.termType === "Literal")
        want.set(key(q.object), (want.get(key(q.object)) || 0) + 1);
    if (want.size === 0) return [];
    const have = new Map();
    for (const row of this.select("SELECT ?o WHERE { ?s ?p ?o FILTER isLiteral(?o) }").results.bindings) {
      const k = JSON.stringify([row.o.value, row.o["xml:lang"] || "",
                                row.o["xml:lang"] ? "" :
                                (row.o.datatype || "http://www.w3.org/2001/XMLSchema#string")]);
      have.set(k, (have.get(k) || 0) + 1);
    }
    const missing = [];
    for (const [k, n] of want)
      if ((have.get(k) || 0) < n) missing.push(JSON.parse(k).join(" "));
    return missing;
  }

  /** Every query the local server has seen (external endpoints report []). */
  queries () {
    if (this.external) return [];
    return JSON.parse(syncRequest("GET", this.origin + "/queries", {}).body);
  }

  forgetQueries () {
    if (!this.external) syncRequest("DELETE", this.origin + "/queries", {});
  }

  async close () {
    await closeSyncFetch();
    if (this._worker) await this._worker.terminate();
  }
}

/** Start the endpoint the tests should use. */
async function launchEndpoint (opts = {}) {
  installXhrShim();
  if (process.env.SPARQL_ENDPOINT)
    return new Endpoint(process.env.SPARQL_ENDPOINT, {external: true, scramble: true});

  const worker = new Worker(SERVER, {workerData: {sparqlTestServer: opts}});
  worker.unref();
  const {url, error} = await new Promise((resolve, reject) => {
    worker.once("message", resolve);
    worker.once("error", reject);
  });
  if (error) throw Error(error);
  return new Endpoint(url, {worker, scramble: !!opts.scramble});
}

module.exports = {launchEndpoint, Endpoint, quadsToNTriples, ntTerm};
