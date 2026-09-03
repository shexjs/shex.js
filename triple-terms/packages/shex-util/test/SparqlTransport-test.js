/** What a SPARQL endpoint's bad day looks like from here.
 *
 * A walk makes one request per node it reaches, so the request that goes
 * wrong is rarely the first and never the one the reader was looking at.  A
 * report that doesn't name the service, its answer and the query is a report
 * nobody can act on -- and a wait with no end is worse than either, because
 * nothing is said at all.
 */
"use strict";

const expect = require("chai").expect;
const N3 = require("n3");
const ShExUtil = require("..");

const endpoint = "http://endpoint.example/sparql";
const query = "SELECT ?s WHERE { ?s ?p ?o }";

/** run executeQueryPromise against a stubbed fetch, and give back the throw */
async function against (responder, {timeout} = {}) {
  const wasFetch = globalThis.fetch;
  const wasTimeout = ShExUtil.sparqlTimeout;
  if (timeout !== undefined)
    ShExUtil.sparqlTimeout = timeout;
  globalThis.fetch = responder;
  try {
    await ShExUtil.executeQueryPromise(query, endpoint, N3.DataFactory);
    return null;
  } catch (e) {
    return e;
  } finally {
    globalThis.fetch = wasFetch;
    ShExUtil.sparqlTimeout = wasTimeout;
  }
}

const ok = body => async () => ({
  ok: true, status: 200, statusText: "OK",
  json: async () => body, text: async () => JSON.stringify(body),
});

describe("asking a SPARQL endpoint", function () {

  it("should read a result set", async function () {
    const rows = await (async () => {
      const wasFetch = globalThis.fetch;
      globalThis.fetch = ok({head: {vars: ["s"]},
                             results: {bindings: [{s: {type: "uri", value: "http://a.example/x"}}]}});
      try { return await ShExUtil.executeQueryPromise(query, endpoint, N3.DataFactory); }
      finally { globalThis.fetch = wasFetch; }
    })();
    expect(rows.map(r => r[0].value)).to.deep.equal(["http://a.example/x"]);
  });

  /* Wikidata's query service answers 429 with an empty body when it is
   * throttling, and this used to be reported as "Unexpected end of JSON
   * input" -- true of the body, and no help at all about anything else. */
  it("should say when the service refused, and what it said", async function () {
    const e = await against(async () => ({
      ok: false, status: 429, statusText: "Too Many Requests",
      text: async () => "",
      json: async () => { throw new SyntaxError("Unexpected end of JSON input"); },
    }));
    expect(e, "it threw").to.exist;
    expect(e.message).to.include("429");
    expect(e.message, "which service").to.include(endpoint);
    expect(e.message, "which of a walk's many queries").to.include(query);
    expect(e.message).to.not.include("Unexpected end of JSON input");
  });

  it("should quote a body that explains itself", async function () {
    const e = await against(async () => ({
      ok: false, status: 500, statusText: "Internal Server Error",
      text: async () => "MalformedQueryException: unknown prefix wdt:",
      json: async () => { throw Error("not json"); },
    }));
    expect(e.message).to.include("MalformedQueryException: unknown prefix wdt:");
  });

  /* `fetch` waits forever by default, so a service that accepts the
   * connection and then says nothing stopped the validation for good. */
  it("should give up on a service that never answers", async function () {
    this.timeout(5000);
    const e = await against(
      (url, opts) => new Promise((res, rej) => {
        // what fetch does when the signal fires
        const signal = opts && opts.signal;
        if (signal)
          signal.addEventListener("abort", () => {
            const err = Error("aborted");
            err.name = "TimeoutError";
            rej(err);
          });
      }),
      {timeout: 150});
    expect(e, "it gave up").to.exist;
    expect(e.message).to.include("did not answer within 150ms");
    expect(e.message, "and on whose behalf").to.include(endpoint);
  });

  it("should wait forever when told to", async function () {
    // 0 is the escape hatch for an endpoint that really does take longer
    const was = ShExUtil.sparqlTimeout;
    ShExUtil.sparqlTimeout = 0;
    try {
      expect(ShExUtil.sparqlAbortSignal()).to.equal(undefined);
    } finally {
      ShExUtil.sparqlTimeout = was;
    }
  });
});
