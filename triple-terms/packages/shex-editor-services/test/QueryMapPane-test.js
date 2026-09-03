/** The query map as a managed editor (plan.md D1) and what a hover region
 * can say about itself (D2), under jsdom. */
"use strict";

const expect = require("chai").expect;
let jsdom;

describe("EditorPanes: the query map, and tooltips", function () {
  let dom, saved, makePane, shapeMapStreamParser, completionSource;
  const base = "http://a.example/";

  before(function () {
    try {
      jsdom = require("jsdom");
    } catch (e) {
      this.skip(); // Node too old for jsdom
    }
    dom = new jsdom.JSDOM("<body><div></div></body>", {
      url: "http://localhost/",
      pretendToBeVisual: true,
      virtualConsole: new jsdom.VirtualConsole(),
    });
    saved = {};
    for (const key of ["window", "document", "navigator", "Event", "KeyboardEvent", "MutationObserver", "requestAnimationFrame", "cancelAnimationFrame"]) {
      saved[key] = Object.getOwnPropertyDescriptor(global, key);
      try {
        Object.defineProperty(global, key, {configurable: true, value: dom.window[key === "window" ? "window" : key] || dom.window[key]});
      } catch (e) { /* navigator may be read-only; jsdom's is compatible */ }
    }
    ({makePane, shapeMapStreamParser, completionSource} = require("../lib/editor-panes"));
  });

  after(function () {
    if (!saved)
      return;
    for (const [key, desc] of Object.entries(saved)) {
      if (desc === undefined)
        delete global[key];
      else
        Object.defineProperty(global, key, desc);
    }
  });

  /** a pane over a fresh textarea, torn down after `body` */
  async function withPane (text, opts, body) {
    const textarea = dom.window.document.createElement("textarea");
    textarea.value = text;
    dom.window.document.body.appendChild(textarea);
    const pane = makePane(textarea, opts);
    try {
      await body(pane, textarea);
    } finally {
      pane.destroy();
      textarea.remove();
    }
  }

  it("should tokenize a shape map approximately", function () {
    const {StringStream} = require("@codemirror/language");
    const kinds = [];
    const state = shapeMapStreamParser.startState();
    const stream = new StringStream('<x>@!:S, {FOCUS ex:p _}@START / "why" # cmt', 2, 2);
    while (!stream.eol()) {
      stream.start = stream.pos;
      const kind = shapeMapStreamParser.token(stream, state);
      if (kind)
        kinds.push(kind);
      if (stream.pos === stream.start)
        stream.next();
    }
    expect(kinds).to.include("link");         // <x>
    expect(kinds).to.include("operator");     // @ and !
    expect(kinds).to.include("variableName"); // :S, ex:p
    expect(kinds).to.include("keyword");      // FOCUS
    expect(kinds).to.include("typeName");     // @START
    expect(kinds).to.include("string");
    expect(kinds).to.include("comment");
  });

  it("should lint the map with the shape-map parser, against the metas it is given", async function () {
    const {forEachDiagnostic, forceLinting} = require("@codemirror/lint");
    await withPane("<x>@<S>, <y>", {
      language: "shapemap",
      shapeMap: () => ({base, schemaMeta: {base, prefixes: {}}, dataMeta: {base, prefixes: {}}}),
    }, async pane => {
      forceLinting(pane.view);
      await new Promise(res => setTimeout(res, 700)); // linter delay
      const found = [];
      forEachDiagnostic(pane.view.state, (d, from, to) => found.push({message: d.message, from, to}));
      expect(found.length).to.equal(1);
      expect(found[0].message).to.match(/^Expecting/);
      expect(found[0].from, "at the end, where the shape was due").to.equal("<x>@<S>, <y>".length);
    });
  });

  it("should complete shape labels and the data's nodes", function () {
    const {EditorState} = require("@codemirror/state");
    const {CompletionContext} = require("@codemirror/autocomplete");
    const source = completionSource(() => ({
      prefixes: {"": base},
      shapeLabels: [base + "S"],
      nodes: [base + "x", "_:b1"],
    }));
    const state = EditorState.create({doc: ":"});
    const result = source(new CompletionContext(state, 1, true));
    const labels = result.options.map(o => o.label);
    expect(labels).to.include("@:S");
    expect(labels).to.include(":x");
    expect(labels).to.include("_:b1");
    expect(result.options.find(o => o.label === ":x").detail).to.equal("node");
  });

  it("should show what a region has to say while the mouse is in it, and take it back", async function () {
    await withPane("<x>@<S>\n", {language: "shapemap", lint: false}, async pane => {
      const view = pane.view;
      view.coordsAtPos = () => null;       // nothing measured: over text, says onText
      let at = 1;
      view.posAtCoords = () => at;
      let asked = 0;
      pane.setHoverRegions([
        {from: 0, to: 3, enter: () => {}, title: () => { ++asked; return "the node"; }},
        {from: 3, to: 7, enter: () => {}, title: "<S> { :p . }"},
      ]);
      const move = () => view.contentDOM.dispatchEvent(
        new dom.window.MouseEvent("mousemove", {clientX: 10, clientY: 5, bubbles: true}));
      const tooltip = () => view.dom.querySelector(".shexjs-tooltip");

      move();
      expect(tooltip(), "shown on entering").to.exist;
      expect(tooltip().textContent).to.equal("the node");
      expect(asked, "asked once, on arrival").to.equal(1);
      move();
      expect(asked, "not asked again while staying").to.equal(1);

      at = 5;
      move();
      expect(tooltip().textContent, "the next region's").to.equal("<S> { :p . }");

      at = 7;                              // the newline: past every region
      move();
      expect(tooltip(), "withdrawn on leaving").to.not.exist;

      at = 5;
      move();
      expect(tooltip()).to.exist;
      view.contentDOM.dispatchEvent(new dom.window.MouseEvent("mouseleave", {bubbles: false}));
      expect(tooltip(), "withdrawn with the mouse").to.not.exist;
    });
  });

  it("should say nothing for a region with no title, or one whose title throws", async function () {
    await withPane("<x>@<S>\n", {language: "shapemap", lint: false}, async pane => {
      const view = pane.view;
      view.coordsAtPos = () => null;
      let at = 1;
      view.posAtCoords = () => at;
      const entered = [];
      pane.setHoverRegions([
        {from: 0, to: 3, enter: () => entered.push("silent")},
        {from: 3, to: 7, enter: () => entered.push("broken"), title: () => { throw Error("no"); }},
      ]);
      const move = () => view.contentDOM.dispatchEvent(
        new dom.window.MouseEvent("mousemove", {clientX: 10, clientY: 5, bubbles: true}));
      move();
      expect(view.dom.querySelector(".shexjs-tooltip")).to.not.exist;
      at = 5;
      move();
      expect(view.dom.querySelector(".shexjs-tooltip")).to.not.exist;
      expect(entered, "hovering still works").to.deep.equal(["silent", "broken"]);
    });
  });
});
