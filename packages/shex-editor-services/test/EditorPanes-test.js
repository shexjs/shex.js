/** Tests for editor-panes: the textarea proxy contract (the web apps keep
 * talking to their textareas; the CodeMirror pane is transparent) and the
 * pane API surface, under jsdom.
 */
"use strict";

const expect = require("chai").expect;
// jsdom's engines outpace the packages' own (e.g. jsdom 30 wants Node ≥ 22
// while the libraries claim ≥ 18): required lazily so these DOM-hosted
// tests skip, rather than crash the whole run, where it can't load
let jsdom;

describe("EditorPanes", function () {
  let dom, saved, makePane, shexcStreamParser;

  before(function () {
    try {
      jsdom = require("jsdom");
    } catch (e) {
      this.skip(); // Node too old for jsdom
    }
    dom = new jsdom.JSDOM("<body><div><textarea id='t'>initial</textarea></div></body>", {
      url: "http://localhost/",
      pretendToBeVisual: true,
      virtualConsole: new jsdom.VirtualConsole(), // swallow layout noise
    });
    // CodeMirror touches these at construction time; restore after so other
    // tests' typeof-window browser detection is unaffected.
    saved = {};
    for (const key of ["window", "document", "navigator", "Event", "KeyboardEvent", "MutationObserver", "requestAnimationFrame", "cancelAnimationFrame"]) {
      saved[key] = Object.getOwnPropertyDescriptor(global, key);
      try {
        Object.defineProperty(global, key, {configurable: true, value: dom.window[key === "window" ? "window" : key] || dom.window[key]});
      } catch (e) { /* navigator may be read-only; jsdom's is compatible */ }
    }
    ({makePane, shexcStreamParser} = require("../lib/editor-panes"));
  });

  after(function () {
    if (!saved)
      return; // before() skipped: nothing to restore
    for (const [key, desc] of Object.entries(saved)) {
      if (desc === undefined)
        delete global[key];
      else
        Object.defineProperty(global, key, desc);
    }
  });

  it("should proxy the textarea value in both directions", async function () {
    const textarea = dom.window.document.getElementById("t");
    const {makePane: mk, CHANGE_DEBOUNCE_MS} = require("../lib/editor-panes");
    const pane = mk(textarea, {language: "shexc", lint: false});
    try {
      // reads see the editor document
      expect(textarea.value).to.equal("initial");
      // writes (e.g. jQuery .val(v) from the caches) reach the editor
      textarea.value = "PREFIX : <http://a.example/>";
      expect(pane.view.state.doc.toString()).to.equal("PREFIX : <http://a.example/>");
      // editor edits write back; keyup (dirty-tracking) fires immediately,
      // change (re-parse handlers) is debounced to typing pauses
      let keyups = 0, changes = 0;
      textarea.addEventListener("keyup", () => ++keyups);
      textarea.addEventListener("change", () => ++changes);
      pane.view.dispatch({changes: {from: 0, to: 0, insert: "# note\n"}});
      expect(textarea.value.split("\n")[0]).to.equal("# note");
      expect(keyups, "immediate keyup").to.equal(1);
      expect(changes, "change not yet fired").to.equal(0);
      await new Promise(resolve => setTimeout(resolve, CHANGE_DEBOUNCE_MS + 100));
      expect(changes, "debounced change").to.equal(1);

      // a write THROUGH the proxy still reports keyup -- the caches' dirty
      // tracking listens for it -- but raises no change: it isn't a typing
      // pause, and a change would tell handlers to discard work the
      // application did meanwhile (copyTextMapToEditMap clears #results)
      keyups = changes = 0;
      textarea.value = "PREFIX : <http://b.example/>";
      expect(pane.view.state.doc.toString()).to.equal("PREFIX : <http://b.example/>");
      expect(keyups, "keyup keeps the cache dirty-tracking honest").to.equal(1);
      await new Promise(resolve => setTimeout(resolve, CHANGE_DEBOUNCE_MS + 100));
      expect(changes, "no change for an application write").to.equal(0);

      // nor does an application write cancel a real edit's pending change
      changes = 0;
      pane.view.dispatch({changes: {from: 0, to: 0, insert: "# typed\n"}});
      textarea.value = "# set\n" + textarea.value;
      await new Promise(resolve => setTimeout(resolve, CHANGE_DEBOUNCE_MS + 100));
      expect(changes, "the user edit still reports").to.equal(1);

      // diagnostics and highlights accept editor-services ranges
      pane.setDiagnostics([{from: 0, to: 6, severity: "error", message: "test"}]);
      pane.highlight([{from: 0, to: 6}]);
      pane.clearHighlights();
    } finally {
      pane.view.destroy();
    }
  });

  it("should complete prefixes, shape labels and predicates", function () {
    const {completionSource, lexicalize} = require("../lib/editor-panes");
    const {EditorState} = require("@codemirror/state");
    const {CompletionContext} = require("@codemirror/autocomplete");

    expect(lexicalize("http://a.example/S", {"": "http://a.example/"})).to.equal(":S");
    expect(lexicalize("http://other.example/x", {"": "http://a.example/"})).to.equal("<http://other.example/x>");

    const source = completionSource(() => ({
      prefixes: {"": "http://a.example/", xsd: "http://www.w3.org/2001/XMLSchema#"},
      shapeLabels: ["http://a.example/S"],
      predicates: ["http://a.example/p"],
    }));
    const state = EditorState.create({doc: ":S { :p @"});
    const result = source(new CompletionContext(state, state.doc.length, true));
    expect(result, "completion result").to.exist;
    const labels = result.options.map(o => o.label);
    expect(labels).to.include("xsd:");   // prefix
    expect(labels).to.include(":S");     // shape label
    expect(labels).to.include("@:S");    // shape ref form
    expect(labels).to.include(":p");     // predicate
  });

  it("should tokenize ShExC approximately", function () {
    const {StringStream} = require("@codemirror/language");
    const kinds = [];
    const state = shexcStreamParser.startState();
    const stream = new StringStream("PREFIX ex: <http://a.example/> # cmt", 2, 2);
    while (!stream.eol()) {
      stream.start = stream.pos;
      const kind = shexcStreamParser.token(stream, state);
      if (kind)
        kinds.push(kind);
      if (stream.pos === stream.start)
        stream.next();
    }
    expect(kinds).to.include("keyword"); // PREFIX
    expect(kinds).to.include("link");    // the IRI
    expect(kinds).to.include("comment"); // # cmt
  });
});
