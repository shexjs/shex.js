/** Tests for editor-panes: the textarea proxy contract (the web apps keep
 * talking to their textareas; the CodeMirror pane is transparent) and the
 * pane API surface, under jsdom.
 */
"use strict";

const expect = require("chai").expect;
const {JSDOM} = require("jsdom");

describe("EditorPanes", function () {
  let dom, saved, makePane, shexcStreamParser;

  before(function () {
    dom = new JSDOM("<body><div><textarea id='t'>initial</textarea></div></body>", {
      url: "http://localhost/",
      pretendToBeVisual: true,
      virtualConsole: new (require("jsdom").VirtualConsole)(), // swallow layout noise
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

      // diagnostics and highlights accept editor-services ranges
      pane.setDiagnostics([{from: 0, to: 6, severity: "error", message: "test"}]);
      pane.highlight([{from: 0, to: 6}]);
      pane.clearHighlights();
    } finally {
      pane.view.destroy();
    }
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
