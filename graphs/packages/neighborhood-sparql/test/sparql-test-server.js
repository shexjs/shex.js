"use strict";
/**
 * A SPARQL 1.1 Query + Update endpoint used to test @shexjs/neighborhood-sparql.
 *
 * The interesting part is `scramble`: SPARQL has no "told bnodes", so the labels
 * an endpoint hands back in a result set carry no cross-request meaning.  Real
 * stores exploit that freedom -- QLever, for instance, mints fresh labels for
 * every result set.  With `scramble` on, this server does the most hostile legal
 * thing it can: every response draws its labels from a small rotating pool, so
 *
 *   - one node gets a different label in each response, and
 *   - one label denotes a different node in each response.
 *
 * A client that remembers `_:b3` from an earlier answer and replays it will
 * therefore be quietly wrong rather than loudly broken -- which is exactly the
 * failure mode the DECEPTICON graph is built to expose.  `forbidQueryBnodes`
 * (on by default when scrambling) turns "quietly" into "loudly" by rejecting any
 * query that mentions a bnode label at all.
 *
 * Usage as a library:
 *
 *   const {startSparqlTestServer} = require("./sparql-test-server");
 *   const server = await startSparqlTestServer({scramble: true});
 *   server.url;                    // http://127.0.0.1:<port>/sparql
 *   server.loadTurtle(text, base); // bypass SPARQL Update for bulk setup
 *   await server.close();
 *
 * Usage from a shell (handy for poking at the DECEPTICON with curl):
 *
 *   node sparql-test-server.js --port 8888 --scramble data.ttl decepticon.ttl
 */

const http = require("http");
const fs = require("fs");
const N3 = require("n3");
const {QueryEngine} = require("@comunica/query-sparql-rdfjs");

const DataFactory = N3.DataFactory;

/** Labels handed out by a scrambling response, in the order they're used.
 * Deliberately short and deliberately re-used across responses. */
const LABEL_POOL_SIZE = 64;
const LABEL_POOL = Array.from({length: LABEL_POOL_SIZE}, (_, i) => "b" + i);

/** Rewrites blank node labels in one result set.
 *
 * The k'th distinct bnode of response number `nth` is called
 * LABEL_POOL[(k + nth) % pool], which is unique within the response (k is
 * unique) and almost never agrees with what the same node was called last time
 * (nth changed).
 */
function makeScrambler (nth) {
  const seen = new Map();
  return function (label) {
    if (!seen.has(label)) {
      const k = seen.size;
      const idx = (k + nth) % LABEL_POOL.length;
      // Past the pool, keep going with unambiguous overflow labels.
      seen.set(label, k < LABEL_POOL.length ? LABEL_POOL[idx] : "b" + k + "_" + nth);
    }
    return seen.get(label);
  };
}

/** Strip out anything that could contain a `_:` which isn't a bnode label. */
function looksLikeItMentionsABnode (query) {
  const withoutLiterals = query
        .replace(/"""[\s\S]*?"""/g, '""')
        .replace(/'''[\s\S]*?'''/g, "''")
        .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
        .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
        .replace(/<[^<>"{}|^`\\\s]*>/g, "<>")
        .replace(/#[^\n]*/g, "");
  return /(^|[\s([,;.])_:/.test(withoutLiterals);
}

function termToJson (term) {
  switch (term.termType) {
  case "NamedNode": return {type: "uri", value: term.value};
  case "BlankNode": return {type: "bnode", value: term.value};
  case "Literal": {
    const out = {type: "literal", value: term.value};
    if (term.language)
      out["xml:lang"] = term.language;
    else if (term.datatype && term.datatype.value !== "http://www.w3.org/2001/XMLSchema#string")
      out.datatype = term.datatype.value;
    return out;
  }
  default: throw Error("can't serialize a " + term.termType + " in a result set");
  }
}

function parseIntoQuads (text, baseIRI, format) {
  const parser = new N3.Parser({baseIRI, format: format || "text/turtle", factory: DataFactory});
  return parser.parse(text); // synchronous when no callback is supplied
}

/**
 * @param {object} opts
 * @param {number} [opts.port] - 0 (the default) picks an unused port.
 * @param {boolean} [opts.scramble] - rename bnodes in every result set.
 * @param {boolean} [opts.forbidQueryBnodes] - 400 any query mentioning `_:`.
 *        Defaults to `scramble`: if labels are meaningless, using one is a bug.
 * @param {boolean} [opts.verbose] - log every query to stderr.
 */
async function startSparqlTestServer (opts = {}) {
  const scramble = !!opts.scramble;
  const forbidQueryBnodes = "forbidQueryBnodes" in opts ? !!opts.forbidQueryBnodes : scramble;
  const verbose = !!opts.verbose;

  const store = new N3.Store();
  const engine = new QueryEngine();
  let responseCount = 0;

  /** Every query this server has been asked, for post-hoc assertions. */
  const queryLog = [];

  function loadTurtle (text, baseIRI, graph) {
    const quads = parseIntoQuads(text, baseIRI);
    const g = graph ? DataFactory.namedNode(graph) : DataFactory.defaultGraph();
    for (const q of quads)
      store.addQuad(DataFactory.quad(q.subject, q.predicate, q.object, g));
    return quads.length;
  }

  /** Quads to keep across clear(), so a fixture loaded once (the DECEPTICON)
   * doesn't have to be re-parsed for every test. */
  let snapshot = [];

  function clear () {
    store.removeQuads(store.getQuads(null, null, null, null));
    for (const q of snapshot) store.addQuad(q);
  }

  async function execute (queryText, accept) {
    const t0 = Date.now();
    queryLog.push(queryText);
    if (verbose) process.stderr.write("\n── query ──\n" + queryText + "\n");

    const result = await engine.query(queryText, {
      sources: [store],
      destination: store,
    });

    const nth = ++responseCount;
    const rename = scramble ? makeScrambler(nth) : (label => label);

    if (result.resultType === "bindings") {
      const meta = await result.metadata();
      const vars = meta.variables.map(v => v.value);
      const bindings = [];
      for await (const binding of await result.execute())
        bindings.push(binding);
      const rows = bindings.map(binding => {
        const row = {};
        for (const v of vars) {
          const term = binding.get(v);
          if (term === undefined) continue;
          row[v] = termToJson(term);
          if (row[v].type === "bnode") row[v].value = rename(row[v].value);
        }
        return row;
      });
      if (verbose) process.stderr.write(`   ${rows.length} rows in ${Date.now() - t0}ms\n`);
      return {
        status: 200,
        type: "application/sparql-results+json",
        body: JSON.stringify({head: {vars}, results: {bindings: rows}}),
      };
    }

    if (result.resultType === "boolean") {
      const bool = await result.execute();
      return {
        status: 200,
        type: "application/sparql-results+json",
        body: JSON.stringify({head: {}, boolean: bool}),
      };
    }

    if (result.resultType === "quads") {
      const quads = [];
      for await (const quad of await result.execute())
        quads.push(quad);
      const writer = new N3.Writer({format: "application/n-quads"});
      for (const q of quads)
        writer.addQuad(scramble ? renameQuadBnodes(q, rename) : q);
      const body = await new Promise((res, rej) =>
        writer.end((e, r) => e ? rej(e) : res(r)));
      return {status: 200, type: "application/n-quads", body};
    }

    if (result.resultType === "void") {
      await result.execute();
      if (verbose) process.stderr.write(`   update ok, ${store.size} quads, ${Date.now() - t0}ms\n`);
      return {status: 204, type: "text/plain", body: ""};
    }

    return {status: 501, type: "text/plain", body: "unsupported result type " + result.resultType};
  }

  function renameQuadBnodes (q, rename) {
    const rw = t => t.termType === "BlankNode" ? DataFactory.blankNode(rename(t.value)) : t;
    return DataFactory.quad(rw(q.subject), q.predicate, rw(q.object), rw(q.graph));
  }

  const server = http.createServer({maxHeaderSize: 4 << 20}, (req, res) => {
    const chunks = [];
    req.on("data", c => chunks.push(c));
    req.on("end", async () => {
      const body = Buffer.concat(chunks).toString("utf8");
      const url = new URL(req.url, "http://localhost");
      let queryText = null;
      let isUpdate = false;

      // ── test-harness control channel (not part of any SPARQL protocol) ──
      if (url.pathname === "/queries") {
        if (req.method === "DELETE") { queryLog.length = 0; res.writeHead(204); return res.end(); }
        res.writeHead(200, {"Content-Type": "application/json"});
        return res.end(JSON.stringify(queryLog));
      }
      if (url.pathname === "/load" && req.method === "POST") {
        try {
          const n = loadTurtle(body, url.searchParams.get("base") || undefined,
                               url.searchParams.get("graph") || undefined);
          res.writeHead(200, {"Content-Type": "text/plain"});
          return res.end(n + "\n");
        } catch (e) {
          res.writeHead(400, {"Content-Type": "text/plain"});
          return res.end("parse error: " + e.message);
        }
      }
      if (url.pathname === "/clear") {
        clear();
        res.writeHead(204);
        return res.end();
      }
      if (url.pathname === "/snapshot") {
        snapshot = store.getQuads(null, null, null, null);
        res.writeHead(200, {"Content-Type": "text/plain"});
        return res.end(snapshot.length + "\n");
      }

      const contentType = (req.headers["content-type"] || "").split(";")[0].trim();
      if (req.method === "GET") {
        queryText = url.searchParams.get("query");
      } else if (req.method === "POST") {
        if (contentType === "application/sparql-query") {
          queryText = body;
        } else if (contentType === "application/sparql-update") {
          queryText = body; isUpdate = true;
        } else if (contentType === "application/x-www-form-urlencoded") {
          const params = new URLSearchParams(body);
          queryText = params.get("query");
          if (queryText === null) { queryText = params.get("update"); isUpdate = true; }
        } else if (contentType === "text/turtle") {
          // Convenience channel: bulk-load without round-tripping through Update.
          try {
            const n = loadTurtle(body, url.searchParams.get("base") || undefined,
                                 url.searchParams.get("graph") || undefined);
            res.writeHead(200, {"Content-Type": "text/plain"});
            return res.end(n + " triples loaded\n");
          } catch (e) {
            res.writeHead(400, {"Content-Type": "text/plain"});
            return res.end("parse error: " + e.message);
          }
        }
      }

      if (queryText === null) {
        res.writeHead(400, {"Content-Type": "text/plain"});
        return res.end("no query. GET ?query=, POST application/sparql-{query,update}, " +
                       "or POST text/turtle to bulk load.\n");
      }

      if (forbidQueryBnodes && !isUpdate && looksLikeItMentionsABnode(queryText)) {
        res.writeHead(400, {"Content-Type": "text/plain"});
        return res.end(
          "This endpoint scrambles bnode labels per result set, so a label from an\n" +
          "earlier answer means nothing here. Rejecting a query that mentions one:\n\n" +
          queryText + "\n");
      }

      try {
        const out = await execute(queryText, req.headers.accept || "");
        res.writeHead(out.status, out.body ? {"Content-Type": out.type + "; charset=utf-8"} : {});
        res.end(out.body);
      } catch (e) {
        if (verbose) process.stderr.write("   FAILED: " + e.message + "\n");
        res.writeHead(400, {"Content-Type": "text/plain"});
        res.end(String(e.stack || e.message));
      }
    });
  });

  await new Promise(resolve => server.listen(opts.port || 0, "127.0.0.1", resolve));
  const port = server.address().port;

  return {
    port,
    url: `http://127.0.0.1:${port}/sparql`,
    store,
    queryLog,
    loadTurtle,
    clear,
    scramble,
    close: () => new Promise(resolve => { server.closeAllConnections?.(); server.close(resolve); }),
  };
}

module.exports = {startSparqlTestServer, looksLikeItMentionsABnode, LABEL_POOL};

// ── worker-thread entry point ────────────────────────────────────────────────
// A synchronous client can't be served by a server sharing its event loop, so
// mocha runs this file as a Worker and talks to it over a socket.
const {isMainThread, parentPort, workerData} = require("worker_threads");
if (!isMainThread && workerData && workerData.sparqlTestServer) {
  startSparqlTestServer(workerData.sparqlTestServer).then(
    server => parentPort.postMessage({url: server.url, port: server.port}),
    e => parentPort.postMessage({error: e.stack || e.message})
  );
}

if (require.main === module && isMainThread) {
  const argv = process.argv.slice(2);
  const files = [];
  const opts = {verbose: true};
  for (let i = 0; i < argv.length; ++i) {
    switch (argv[i]) {
    case "--port": opts.port = parseInt(argv[++i], 10); break;
    case "--scramble": opts.scramble = true; break;
    case "--allow-query-bnodes": opts.forbidQueryBnodes = false; break;
    case "--quiet": opts.verbose = false; break;
    default: files.push(argv[i]);
    }
  }
  startSparqlTestServer(opts).then(server => {
    for (const f of files) {
      const n = server.loadTurtle(fs.readFileSync(f, "utf8"), "file://" + require("path").resolve(f));
      process.stderr.write(`loaded ${f}: ${n} triples\n`);
    }
    process.stderr.write(`listening on ${server.url}` +
                         (server.scramble ? " (scrambling bnode labels)" : "") + "\n");
  });
}
