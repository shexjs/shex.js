/** doc/plugins.md against the code it documents.
 *
 * The contract is what a plugin author reads; a hook the app grew and the
 * document didn't is how they find out it exists by accident.  This
 * checks the two lists are the same list, and that the skeleton the
 * document points at is a working descriptor.
 */
"use strict";

const Fs = require("fs");
const Path = require("path");
const vm = require("vm");
const expect = require("chai").expect;

const ROOT = Path.join(__dirname, "../../..");
const read = f => Fs.readFileSync(Path.join(ROOT, f), "utf8");

/** every field of a descriptor the apps read, and what reads it */
const CONTRACT = {
  id: "what names this plugin",
  label: "what to call it on screen",
  scripts: "what it runs on",
  css: "rules for what it adds",
  panes: "inputs and products",
  resultsTabs: "a second kind of result",
  toolbar: "controls",
  statusbar: "what it says under them",
  keys: "verbs with no button",
  methods: "verbs, mixed into the app",
  init: "what it does rather than declares",
  register: "the handler a schema dispatches",
  schema: "a turn at what is validated",
  results: "composing the renderer",
  onStartingValidation: "the last results are about to go",
  worker: "its half in the worker",
};
/** filled in by the register and the app, not written by an author */
const BOOKKEEPING = ["baseUrl", "applied", "initialized", "panesBuilt"];

describe("the plugin contract", () => {
  const doc = read("doc/plugins.md");

  it("should document every hook a plugin may declare", () => {
    for (const [field, what] of Object.entries(CONTRACT))
      // named in prose (`worker`) or shown in a descriptor (worker: "…")
      expect(doc, field + " (" + what + ") is undocumented")
        .to.match(RegExp("`" + field + "[`:( ]|^\\s*" + field + ":", "m"));
  });

  /* ...and the other direction: a hook the app reads and this list doesn't
   * know about fails here, which is where the document gets updated. */
  it("should read no descriptor field the contract does not name", () => {
    const known = new Set(Object.keys(CONTRACT).concat(BOOKKEEPING));
    const unknown = new Set();
    for (const file of ["packages/shex-webapp/doc/ShExBaseApp.js",
                        "packages/shex-webapp/doc/ShExPlugins.js"])
      for (const m of read(file).matchAll(/\b(?:ext|descriptor)\.([A-Za-z_$][\w$]*)/g))
        if (!known.has(m[1]))
          unknown.add(m[1]);
    expect([...unknown], "read by the app, missing from doc/plugins.md")
      .to.deep.equal([]);
  });

  it("should say what a host must send for a plugin somewhere else", () => {
    expect(doc).to.include("Access-Control-Allow-Origin");
  });

  /* The document tells an author to start from the skeleton, so the
   * skeleton has to be a descriptor: this runs it the way the app does. */
  it("should point at a skeleton that registers a working descriptor", () => {
    let registered = null;
    const sandbox = {ShExPlugins: {register: d => { registered = d; return d; }}};
    vm.createContext(sandbox);
    vm.runInContext(read("doc/plugin-skeleton/hello-plugin.js"), sandbox);

    expect(registered, "it registered").to.exist;
    expect(registered.id).to.equal("http://example.org/extensions/Hello/");
    expect(registered.panes.map(p => p.name)).to.deep.equal(["helloSaid"]);
    expect(registered.panes[0].kind, "a kind the app knows").to.be.oneOf(["json", "schema", "turtle"]);
    expect(registered.toolbar.map(c => c.id)).to.deep.equal(["hello"]);
    expect(registered.toolbar[0].kind).to.equal("button");
    expect(typeof registered.toolbar[0].run).to.equal("function");
    expect(typeof registered.register, "and a handler for the validator").to.equal("function");
    expect(Object.keys(registered.methods)).to.deep.equal(["hello"]);
    // every field it uses is in the contract
    for (const field of Object.keys(registered))
      expect(Object.keys(CONTRACT).concat(BOOKKEEPING, ["said"]),
             "the skeleton's " + field).to.include(field);
  });

  /* A handler that only looks says so by returning no failures. */
  it("should have a skeleton whose handler reports what it saw", () => {
    let registered = null;
    const sandbox = {ShExPlugins: {register: d => { registered = d; return d; }}};
    vm.createContext(sandbox);
    vm.runInContext(read("doc/plugin-skeleton/hello-plugin.js"), sandbox);

    let handler = null;
    registered.register({semActHandler: {register: (iri, h) => { handler = h; }}}, {});
    expect(handler, "registered on the validator").to.exist;
    expect(handler.dispatch(" said it ", {node: "http://a.example/x"}),
           "no failures: it only looked").to.deep.equal([]);
    expect(registered.said).to.deep.equal([{code: "said it", matched: "http://a.example/x"}]);
  });
});
