/** Smoke test for shex-worker.html?editors=1: the worker flavour of the app
 * must boot with the language-aware editors, round-trip a validation through
 * the (stubbed same-thread) worker, and anchor the marshalled results'
 * diagnostics in the schema and data panes just as shex-simple does.
 * jsdom has no Worker; fakeWorker.js runs ShExWorkerThread.js unmodified in
 * a vm context with structuredClone message hops.
 */
"use strict";

const TEST_browser = "TEST_browser" in process.env ? JSON.parse(process.env["TEST_browser"]) : false;

const Fs = require("fs");
const Path = require("path");
const expect = require("chai").expect;
const node_fetch = require("node-fetch");
const {makeWorkerClass} = require("./fakeWorker");
// jsdom's engines outpace the packages' own; required lazily under
// TEST_browser (c.f. browser-test.js)
let jsdom, JSDOM, StaticResourceConfig;

const [[GitRootServer]] = require("../../../tools/testServer")
      .startServer(
        [ { url: "http://localhost:9999/shex.js/",
            fromDir: Path.join(__dirname, "../../..") }
        ]
      );

// jsdom fetches <script src> subresources itself; serve the pinned cdnjs
// script from the local copy (c.f. browser-test.js)
const StaticResources = {
  "https://cdnjs.cloudflare.com/ajax/libs/jquery-csv/1.0.21/jquery.csv.js":
    Path.join(__dirname, "static/jquery.csv-1.0.21.js")
};
if (!TEST_browser) {
  console.warn("Skipping worker-editors-smoke-tests; to activate these tests, set environment variable TEST_browser=true");
} else {
  jsdom = require("jsdom");
  ({JSDOM} = jsdom);
  StaticResourceConfig = {
    interceptors: [
      jsdom.requestInterceptor((request, _context) => {
        if (request.url in StaticResources)
          return new Response(Fs.readFileSync(StaticResources[request.url], "utf8"), {
            headers: { "Content-Type": "text/javascript" }
          });
      })
    ]
  };
  describe("shex-worker with ?editors=1", function () {
    this.timeout(20000);
    const page = "packages/shex-webapp/doc/shex-worker.html";

    let dom, $, shared;
    before(async function () {
      const base = Path.join(__dirname, "../../..", page);
      // forward page console traffic except console.debug, the app's channel
      // for reporting user-input errors (e.g. mid-edit parse failures)
      const virtualConsole = new jsdom.VirtualConsole().forwardTo(console);
      virtualConsole.removeAllListeners("debug");
      dom = new JSDOM(Fs.readFileSync(base, "utf8"), {
        url: GitRootServer.urlFor(page + "?editors=1"),
        runScripts: "dangerously",
        resources: StaticResourceConfig,
        pretendToBeVisual: true, // CodeMirror needs rAF etc.
        virtualConsole,
        beforeParse (window) {
          // the page's head script runs new Worker("ShExWorkerThread.js")
          window.Worker = makeWorkerClass(Path.dirname(base));
        },
      });
      dom.window.fetch = node_fetch;
      // jsdom lacks the CSS namespace; jquery-ui ≥1.14 calls CSS.escape.
      if (!dom.window.CSS)
        dom.window.CSS = { escape: s => String(s).replace(/[^a-zA-Z0-9_\u00A0-\uFFFF-]/g, c => `\\${c}`) };
      // jsdom does no layout and omits these Range methods; CodeMirror's
      // measure loop calls them on every frame and handles empty results.
      dom.window.Range.prototype.getClientRects = function () { return []; };
      dom.window.Range.prototype.getBoundingClientRect =
        function () { return {x: 0, y: 0, top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0}; };
      shared = await new Promise((resolve, reject) => {
        dom.window._testCallback = (parm) => {
          if (parm instanceof Error)
            reject(parm);
          else
            resolve(parm);
        };
      });
      await shared.promise; // drag-and-drop init + search-parameter loads
      $ = dom.window.$;
    });

    after(function () {
      if (dom)
        dom.window.close();
    });

    it("should boot without errors in #results", function () {
      const errors = $("#results .error");
      expect(errors.length, errors.text()).to.equal(0);
    });

    it("should load the examples manifest", function () {
      const items = $("#manifestDrop li");
      expect(items.length).to.be.above(0);
      expect(items.first().text()).not.to.equal("no manifest loaded");
    });

    it("should replace the schema and data textareas with editor panes", function () {
      expect($("#inputSchema .shexjs-editor-pane").length, "schema pane").to.equal(1);
      expect($("#inputData .shexjs-editor-pane").length, "data pane").to.equal(1);
      // the textarea proxy: jQuery .val() writes reach the editor document
      $("#inputSchema textarea").first().val("PREFIX : <http://a.example/>");
      expect($("#inputSchema .cm-content").text()).to.include("http://a.example/");
    });

    it("should anchor worker validation errors in both panes", async function () {
      const warns = [];
      const origWarn = dom.window.console.warn;
      dom.window.console.warn = (...args) => { warns.push(args.join(" ")); origWarn.apply(dom.window.console, args); };
      const set = (selector, value) => {
        // .first(): "#inputData textarea" would also match the fixedMap
        // rows' node textareas
        const elt = $(selector).first();
        elt.val(value);
        elt.trigger("change");
      };
      // prefixed names: relative IRIs would resolve against the page URL
      set("#inputSchema textarea", [
        "PREFIX : <http://a.example/>",
        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
        ":S { :p xsd:integer }",
      ].join("\n"));
      set("#inputData textarea", [
        "PREFIX : <http://a.example/>",
        ':x :p "not a number" .',
      ].join("\n"));
      set("#queryMap", "<http://a.example/x>@<http://a.example/S>");
      await shared.promise; // the #queryMap change handler's copyQueryMapToEditMap
      $("#validate").trigger("click");
      await shared.promise; // the validation, round-tripped through the worker

      dom.window.console.warn = origWarn;
      expect(warns.filter(w => w.includes("editor diagnostics failed"))).to.deep.equal([]);
      expect($("#results .fails").length, "nonconformant result; results: " + $("#results").text().substring(0, 200)).to.be.above(0);

      const editorSupport = shared.Caches.editorSupport;
      expect(editorSupport, "editorSupport reachable but non-enumerable").to.exist;
      const mapped = editorSupport.lastMapped;
      expect(mapped, "validation errors were mapped").to.exist;
      const schemaText = $("#inputSchema textarea").first().val();
      const dataText = $("#inputData textarea").first().val();
      expect(mapped.schema.map(d => schemaText.substring(d.from, d.to)))
        .to.include(":p xsd:integer");
      expect(mapped.data.map(d => dataText.substring(d.from, d.to)))
        .to.include('"not a number"');
    });

    it("should carry editors=1 into the permalink", async function () {
      expect($("#editors").val(), "menu select set from ?editors=1").to.equal("1");
      $("#menu-button").trigger("click"); // permalink is built when the menu opens
      let href;
      for (let i = 0; i < 100 && !(href = $("#permalink a").attr("href")); ++i)
        await new Promise(resolve => setTimeout(resolve, 20));
      $("#menu-button").trigger("click"); // close it again
      expect(href, "permalink: " + href).to.include("editors=1");
    });
  });
}
