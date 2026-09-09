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

  // The REPL (examples/lsp-repl.js) drives the same command from a piped script,
  // over its own server process -- so this also proves the documented recipe.
  it("the REPL loads manifest entries and validates them end to end", function (done) {
    this.timeout(15000);
    const repl = cp.spawn(process.execPath, [path.join(__dirname, "..", "examples", "lsp-repl.js")], { stdio: ["pipe", "pipe", "inherit"] });
    let out = "";
    repl.stdout.on("data", d => (out += d));
    repl.on("close", () => {
      try {
        expect(out, "conformant result").to.match(/"status":\s*"conformant"/);
        expect(out, "nonconformant result").to.match(/"status":\s*"nonconformant"/);
        done();
      } catch (e) { done(e); }
    });
    repl.stdin.end("manifest\npick 0\nSEND\npick 2\nSEND\nquit\n");
  });
});
