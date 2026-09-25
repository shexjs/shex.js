/** End-to-end LSP smoke tests: spawn the server over stdio and drive it with a
 * tiny JSON-RPC client, exercising the handshake, diagnostics, and the schema
 * language features. */
"use strict";

const { expect } = require("chai");
const cp = require("child_process");
const path = require("path");

function lspClient () {
  const server = cp.spawn(process.execPath,
    [path.join(__dirname, "..", "lib", "server.js"), "--stdio"],
    { stdio: ["pipe", "pipe", "pipe"] });
  let buf = Buffer.alloc(0);
  const waiters = [];
  server.stdout.on("data", d => {
    buf = Buffer.concat([buf, d]);
    for (;;) {
      const headerEnd = buf.indexOf("\r\n\r\n");
      if (headerEnd < 0) break;
      const m = /Content-Length: (\d+)/i.exec(buf.slice(0, headerEnd).toString());
      const start = headerEnd + 4, len = m ? +m[1] : 0;
      if (buf.length < start + len) break;
      const msg = JSON.parse(buf.slice(start, start + len).toString());
      buf = buf.slice(start + len);
      for (let i = waiters.length - 1; i >= 0; --i)
        if (waiters[i].pred(msg)) waiters.splice(i, 1)[0].resolve(msg);
    }
  });
  let id = 0;
  const send = obj => {
    const s = JSON.stringify(obj);
    server.stdin.write("Content-Length: " + Buffer.byteLength(s) + "\r\n\r\n" + s);
  };
  const wait = (pred, ms = 5000) => new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error("timeout")), ms);
    waiters.push({ pred, resolve: msg => { clearTimeout(t); res(msg); } });
  });
  return {
    request: (method, params) => { const rid = ++id; const p = wait(m => m.id === rid); send({ jsonrpc: "2.0", id: rid, method, params }); return p; },
    notify: (method, params) => send({ jsonrpc: "2.0", method, params }),
    diagnostics: uri => wait(m => m.method === "textDocument/publishDiagnostics" && m.params.uri === uri),
    kill: () => server.kill(),
  };
}

const posAt = (text, offset) => {
  let line = 0, last = 0;
  for (let i = 0; i < offset; ++i) if (text[i] === "\n") { ++line; last = i + 1; }
  return { line, character: offset - last };
};

describe("shex language server", function () {
  this.timeout(15000);
  let c;

  before(async () => {
    c = lspClient();
    const init = await c.request("initialize", { processId: process.pid, rootUri: null, capabilities: {} });
    expect(init.result.capabilities.hoverProvider, "hover capability").to.equal(true);
    expect(init.result.capabilities.definitionProvider, "definition capability").to.equal(true);
    c.notify("initialized", {});
  });
  after(() => c && c.kill());

  it("flags a syntactically broken ShExC schema", async () => {
    const uri = "file:///broken.shex";
    const p = c.diagnostics(uri);
    c.notify("textDocument/didOpen", { textDocument: { uri, languageId: "shexc", version: 1, text: "PREFIX : <http://x/>\n:S { :p @" } });
    const d = await p;
    expect(d.params.diagnostics.length, JSON.stringify(d.params.diagnostics)).to.be.greaterThan(0);
  });

  it("passes a valid schema and answers definition, references, symbols", async () => {
    const uri = "file:///ok.shex";
    const text = "PREFIX : <http://x/>\n:Person { :name . ; :knows @:Person * }\n";
    const p = c.diagnostics(uri);
    c.notify("textDocument/didOpen", { textDocument: { uri, languageId: "shexc", version: 1, text } });
    const d = await p;
    expect(d.params.diagnostics.filter(x => x.severity === 1), "no errors").to.eql([]);

    // cursor on the @:Person reference resolves to the :Person declaration
    const def = await c.request("textDocument/definition", { textDocument: { uri }, position: posAt(text, text.indexOf("@:Person") + 2) });
    expect(def.result, "definition found").to.be.ok;

    // documentSymbol lists the shape (by its resolved IRI)
    const syms = await c.request("textDocument/documentSymbol", { textDocument: { uri } });
    expect((syms.result || []).map(s => s.name)).to.include("http://x/Person");

    // references from the declaration include the @:Person use site
    const refs = await c.request("textDocument/references", { textDocument: { uri }, position: posAt(text, text.indexOf(":Person {") + 1), context: { includeDeclaration: false } });
    expect((refs.result || []).length, "one reference").to.be.greaterThan(0);
  });

  it("schemaMouseover: highlight gives no ShExJ tooltip; shexj does", async () => {
    const uri = "file:///hovercfg.shex";
    const text = "PREFIX : <http://x/>\n:S {\n  :p .\n}\n";
    const pos = posAt(text, text.indexOf(":p") + 1);
    c.notify("textDocument/didOpen", { textDocument: { uri, languageId: "shexc", version: 1, text } });
    // default is "highlight": the client lights the data, so no tooltip here
    let hov = await c.request("textDocument/hover", { textDocument: { uri }, position: pos });
    expect(hov.result, "highlight mode: no constraint tooltip").to.equal(null);
    // switch to shexj: the constraint's ShExJ comes back
    c.notify("workspace/didChangeConfiguration", { settings: { shex: { schemaMouseover: "shexj" } } });
    hov = await c.request("textDocument/hover", { textDocument: { uri }, position: pos });
    expect(JSON.stringify(hov.result || {}), "shexj mode: JSON tooltip").to.include("TripleConstraint");
  });

  it("expands a prefixed name on hover in Turtle", async () => {
    const uri = "file:///d.ttl";
    const text = "PREFIX ex: <http://ex/>\nex:a ex:p ex:b .\n";
    const p = c.diagnostics(uri);
    c.notify("textDocument/didOpen", { textDocument: { uri, languageId: "turtle", version: 1, text } });
    await p;
    const hov = await c.request("textDocument/hover", { textDocument: { uri }, position: posAt(text, text.indexOf("ex:p") + 1) });
    expect(JSON.stringify(hov.result || {}), "expanded IRI").to.include("http://ex/p");
  });

  // The same examples the REPL and README use -- one shape carried across
  // ShExC / ShExJ / ShExR schemas and Turtle / TriG data (examples/examples.js).
  const validateCmd = (schema, data, map) =>
    c.request("workspace/executeCommand", { command: "shex.validate", arguments: [schema, data, map] });
  const status = res => (res.result && res.result.results && res.result.results[0] || {}).status || JSON.stringify(res.result);

  // One shape across the three schema languages and both data syntaxes.
  const TTL = "PREFIX : <http://x/>\n:n :p 1 .";
  const MAP = "<http://x/n>@<http://x/S>";
  const SHEXJ = JSON.stringify({ type: "Schema", shapes: [{ id: "http://x/S", type: "ShapeDecl", shapeExpr: { type: "Shape", expression: { type: "TripleConstraint", predicate: "http://x/p" } } }] });
  const SHEXR = "PREFIX sx: <http://www.w3.org/ns/shex#>\nPREFIX : <http://x/>\n[] a sx:Schema ; sx:shapes ( :S ) .\n:S a sx:ShapeDecl ; sx:shapeExpr [ a sx:Shape ; sx:expression [ a sx:TripleConstraint ; sx:predicate :p ] ] .";
  [
    ["ShExC schema + Turtle", "PREFIX : <http://x/>\n:S { :p . }", TTL, "conformant"],
    ["ShExJ schema + Turtle", SHEXJ, TTL, "conformant"],
    ["ShExR schema + Turtle", SHEXR, TTL, "conformant"],
    ["ShExC schema + TriG", "PREFIX : <http://x/>\n:S { :p . }", "PREFIX : <http://x/>\n:n :p 1 .\nGRAPH :g { :m :q 2 }", "conformant"],
    ["reports nonconformance", "PREFIX : <http://x/>\n:S { :p . }", "PREFIX : <http://x/>\n:n :q 1 .", "nonconformant"],
  ].forEach(([name, schema, data, want]) => {
    it(`validate: ${name} -> ${want}`, async () => {
      expect(status(await validateCmd(schema, data, MAP)), name).to.equal(want);
    });
  });

  // A relative shape in a shape map resolves against the *schema's* base (its
  // BASE directive), not the data's -- else `<PatientShape>` under
  // `BASE <http://schema.example/>` never matches the shape the schema declared.
  it("validate: resolves a relative shape against the schema BASE", async () => {
    const schema = 'BASE <http://schema.example/>\nPREFIX : <http://ex/>\n<PatientShape> {\n  :gender ["male" "female"]\n}';
    const data = 'PREFIX : <http://ex/>\n<Patient2> :gender "male" .';
    expect(status(await validateCmd(schema, data, "<Patient2>@<PatientShape>")), "relative shape").to.equal("conformant");
  });

  // shex.runManifestEntry returns the schema<->data correspondences the editor
  // clients cross-highlight on hover (from the *regular* validation results).
  it("run manifest entry returns schema<->data correspondences", async () => {
    const schema = "PREFIX : <http://x/>\n:S {\n  :p .\n}";
    const data = "PREFIX : <http://x/>\n:n :p 1 .";
    const res = await c.request("workspace/executeCommand", {
      command: "shex.runManifestEntry",
      arguments: [schema, data, "<http://x/n>@<http://x/S>", "conformant", "http://x/"],
    });
    const r = res.result || {};
    expect(r.pass, JSON.stringify(r)).to.equal(true);
    expect(r.correspondences, "correspondences").to.be.an("array").with.length.greaterThan(0);
    const c0 = r.correspondences[0];
    expect(c0.status, "conformant match").to.equal("conformant");
    // the :p constraint sits on schema line 2 (0-based); its triple is on data line 1
    expect(c0.schema[0], "schema range at the constraint").to.include({ startLine: 2 });
    expect(c0.data, "data term ranges").to.be.an("array").with.length.greaterThan(0);
    expect(c0.data.every(d => d.startLine === 1), "data triple on line 1").to.equal(true);
    // hover text: matched quad (data vocabulary) + shape path (schema vocabulary)
    expect(c0.quad, "matched quad names the data subject/predicate").to.match(/^:n :p /);
    expect(c0.path, "shape path (schema prefix)").to.equal("@:S/:p");
  });

  // The shape path uses the schema's own base/prefixes and descends nested
  // shapes (e.g. @<PatientShape>/:name/:family); the quad uses the data's.
  it("run manifest entry: hover quad uses data vocab, path uses schema vocab", async () => {
    const schema = "BASE <http://schema.example/>\nPREFIX : <http://ex/>\n<PatientShape> {\n  :name { :family . }\n}";
    const data = 'PREFIX : <http://ex/>\n<Patient2> :name [ :family "Doe" ] .';
    const res = await c.request("workspace/executeCommand", {
      command: "shex.runManifestEntry",
      arguments: [schema, data, "<Patient2>@<PatientShape>", "conformant", "http://a.example/"],
    });
    const corr = res.result.correspondences || [];
    // shape base-relative + nested predicate chain
    expect(corr.map(x => x.path), "descends the nested shape").to.include("@<PatientShape>/:name/:family");
    const fam = corr.find(x => x.path === "@<PatientShape>/:name/:family");
    expect(fam.quad, "quad is the bnode's :family triple, data vocab").to.match(/^_:\S+ :family "Doe"$/);
  });

  // The REPL (examples/lsp-repl.js) drives the same command from a piped script,
  // over its own server process -- so this also proves the documented recipe.
  // Kept independent of which manifest entries are (non)conformant -- the shared
  // examples/manifest.yaml is a user-editable file; nonconformance itself is
  // covered by the "reports nonconformance" test above.
  it("the REPL loads manifest entries and validates them end to end", function (done) {
    this.timeout(15000);
    const repl = cp.spawn(process.execPath, [path.join(__dirname, "..", "examples", "lsp-repl.js")], { stdio: ["pipe", "pipe", "inherit"] });
    let out = "";
    repl.stdout.on("data", d => (out += d));
    repl.on("close", () => {
      try {
        expect(out, "manifest loaded").to.match(/loaded .* from .*manifest/i);
        expect(out, "picked entry validated to a status").to.match(/"status":\s*"(conformant|nonconformant)"/);
        done();
      } catch (e) { done(e); }
    });
    repl.stdin.end("manifest\npick 0\nSEND\nquit\n");
  });
});
