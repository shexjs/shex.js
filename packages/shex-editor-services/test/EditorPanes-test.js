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

  /* The application colours its textareas to say what they hold -- the
   * schema pane blue, the data pane green -- and a pane standing in for one
   * should look like the thing it replaced, not like a white box dropped
   * on the page. */
  it("should take the colours of the textarea it stands in for", function () {
    const textarea = dom.window.document.createElement("textarea");
    textarea.value = "<x> <p> 1 .\n";
    textarea.style.backgroundColor = "rgb(244, 255, 244)";   // #inputData's green
    textarea.style.color = "rgb(0, 0, 0)";
    dom.window.document.body.appendChild(textarea);
    const pane = makePane(textarea, {language: "turtle", lint: false});
    try {
      const styles = [];
      dom.window.document.querySelectorAll("style").forEach(s => styles.push(s.textContent));
      const css = styles.join("\n");
      expect(css, "the pane is painted the textarea's colour").to.include("rgb(244, 255, 244)");
      // and the gutter belongs to the pane rather than sitting in grey
      // (the base theme has a .cm-gutters rule too; ours is the one that
      // says the pane's colour)
      const gutterRules = css.split("}").filter(rule => rule.includes(".cm-gutters"));
      expect(gutterRules.some(rule => rule.includes("rgb(244, 255, 244)")),
             "a gutter rule in the pane's colour").to.equal(true);
    } finally {
      pane.destroy();
      textarea.remove();
    }
  });

  /* A result pane replaces nothing, so it has nothing to inherit; the host
   * says what it should look like by handing over an element it styled. */
  it("should dress a result pane like the place it is put", function () {
    const {makeResultPane} = require("../lib/editor-panes");
    const holder = dom.window.document.createElement("div");
    holder.style.backgroundColor = "rgb(255, 255, 244)";
    dom.window.document.body.appendChild(holder);
    const pane = makeResultPane('{"a": 1}', "json", {colorsFrom: holder});
    try {
      holder.appendChild(pane.dom);
      const styles = [];
      dom.window.document.querySelectorAll("style").forEach(s => styles.push(s.textContent));
      expect(styles.join("\n"), "the pane takes the holder's tint")
        .to.include("rgb(255, 255, 244)");
    } finally {
      holder.remove();       // a result pane is discarded with its holder
    }
  });

  it("should leave an unpainted textarea's pane alone", function () {
    const textarea = dom.window.document.createElement("textarea");
    textarea.value = "<x> <p> 1 .\n";
    dom.window.document.body.appendChild(textarea);
    const pane = makePane(textarea, {language: "turtle", lint: false});
    try {
      expect(pane.view.dom).to.exist;   // nothing to copy, nothing broken
    } finally {
      pane.destroy();
      textarea.remove();
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

  /* A neighborhood module describes its language as plain functions over
   * strings (see @shexjs/neighborhood-api's ParamEditor and its
   * PaneClaim-test); these are the adapters that make an editor of that
   * description, and the fallback when there is no description to adapt. */
  describe("a module-supplied language", function () {
    const ENDPOINT = "# Endpoint: http://ex.example/sparql\n";

    /** stands in for a neighborhood module's paneEditor */
    const supplied = {
      language: "turtle",
      tokens: text => text.startsWith("# Endpoint:")
        ? [{from: 0, to: 11, style: "keyword"}, {from: 12, to: text.indexOf("\n"), style: "link"}]
        : [],
      lint: text => text.startsWith("# Endpoint: http")
        ? []
        : [{from: 0, to: 11, severity: "error", message: "no endpoint"}],
      complete: (text, pos, ctx) => ctx && ctx.db
        ? {from: pos, to: pos, options: [{label: ctx.db.only, detail: "from the live db"}]}
        : null,
    };

    it("should color what the module describes, over the language it names", function () {
      const textarea = dom.window.document.createElement("textarea");
      textarea.value = ENDPOINT + "<x> <p> 1 .\n";
      dom.window.document.body.appendChild(textarea);
      const pane = makePane(textarea, {supplied: () => supplied, lint: false});
      try {
        // the module's own tokens...
        const classes = [];
        pane.view.dom.querySelectorAll("[class*='shexjs-tok-']").forEach(
          e => classes.push(e.className));
        expect(classes.join(" ")).to.match(/shexjs-tok-keyword/);
        expect(classes.join(" ")).to.match(/shexjs-tok-link/);
        // ...over the grammar it named for the body it didn't describe
        expect(pane.view.state.facet(require("@codemirror/language").language)).to.exist;
      } finally {
        pane.destroy();
        textarea.remove();
      }
    });

    it("should recolor when an edit changes which module would claim the text", function () {
      const textarea = dom.window.document.createElement("textarea");
      textarea.value = "<x> <p> 1 .\n";
      dom.window.document.body.appendChild(textarea);
      // a host picking the module the way the WebApp does: by the text.  It
      // is handed the text rather than reading it back, because mid-edit
      // the textarea proxy still reports the document as it was before.
      const claimed = [];
      const pane = makePane(textarea, {
        lint: false,
        supplied: text => {
          claimed.push(text);
          return text.startsWith("# Endpoint:") ? supplied : {language: "turtle"};
        },
      });
      try {
        const marked = () => pane.view.dom.querySelectorAll("[class*='shexjs-tok-']").length;
        expect(marked(), "Turtle: the claiming module describes nothing of its own").to.equal(0);

        textarea.value = ENDPOINT + "<x> <p> 1 .\n";  // now an endpoint pane
        expect(marked(), "the module that claims it colors its header").to.be.greaterThan(0);
        expect(claimed[claimed.length - 1], "asked about the text as edited")
          .to.equal(ENDPOINT + "<x> <p> 1 .\n");

        textarea.value = "<x> <p> 1 .\n";             // and back
        expect(marked()).to.equal(0);
      } finally {
        pane.destroy();
        textarea.remove();
      }
    });

    it("should ask the module for diagnostics and completions, with the host's context", async function () {
      const {EditorState} = require("@codemirror/state");
      const {CompletionContext} = require("@codemirror/autocomplete");
      const {forEachDiagnostic, forceLinting} = require("@codemirror/lint");

      const textarea = dom.window.document.createElement("textarea");
      textarea.value = "# Endpoint: \n";
      dom.window.document.body.appendChild(textarea);
      const pane = makePane(textarea, {
        supplied: () => supplied,
        suppliedContext: () => ({db: {only: "http://ex.example/Q42"}}),
      });
      try {
        forceLinting(pane.view);
        await new Promise(res => setTimeout(res, 700)); // linter delay
        const messages = [];
        forEachDiagnostic(pane.view.state, d => messages.push(d.message));
        expect(messages).to.include("no endpoint");

        // completions reach the module with whatever context the host gives
        const state = EditorState.create({doc: "wd:Q"});
        const source = pane.view.state.languageDataAt("autocomplete", 0).pop();
        const result = source(new CompletionContext(state, 4, true));
        expect(result.options.map(o => o.label)).to.deep.equal(["http://ex.example/Q42"]);
      } finally {
        pane.destroy();
        textarea.remove();
      }
    });

    it("should leave the textarea alone when a module describes no language", function () {
      // the fallback: the same plain textarea the apps show with editors off
      const {makePaneIfDescribed} = require("../lib/editor-panes");
      const textarea = dom.window.document.createElement("textarea");
      textarea.value = "<x> <p> 1 .\n";
      dom.window.document.body.appendChild(textarea);
      try {
        // a module that claims the text but describes nothing about it
        expect(makePaneIfDescribed(textarea, {supplied: () => ({})})).to.equal(null);
        // ...and no module at all
        expect(makePaneIfDescribed(textarea, {supplied: () => null})).to.equal(null);
        expect(textarea.style.display).to.equal("");   // never hidden
        expect(textarea.value).to.equal("<x> <p> 1 .\n");
        expect(textarea.parentNode.querySelector(".shexjs-editor-pane")).to.equal(null);

        // and one that does describe something gets its pane
        const pane = makePaneIfDescribed(textarea, {supplied: () => supplied, lint: false});
        expect(pane).to.not.equal(null);
        expect(textarea.style.display).to.equal("none");
        pane.destroy();
      } finally {
        textarea.remove();
      }
    });

    it("should survive a module whose language functions throw", function () {
      const textarea = dom.window.document.createElement("textarea");
      textarea.value = ENDPOINT;
      dom.window.document.body.appendChild(textarea);
      const broken = {tokens: () => { throw Error("module bug"); },
                      complete: () => { throw Error("module bug"); }};
      const pane = makePane(textarea, {supplied: () => broken, lint: false});
      try {
        expect(pane.view.state.doc.toString()).to.equal(ENDPOINT); // still editable
        expect(textarea.value).to.equal(ENDPOINT);
      } finally {
        pane.destroy();
        textarea.remove();
      }
    });
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
