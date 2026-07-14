/** Smoke test for ?editors=1 (EditorSupport / CodeMirror panes): the app
 * must boot, auto-load the examples manifest, and report no errors -- the
 * editorSupport stash once leaked into the Caches iteration and broke
 * manifest loading with "Cannot read properties of undefined (reading
 * 'keyup')".
 */
"use strict";

const TEST_browser = "TEST_browser" in process.env ? JSON.parse(process.env["TEST_browser"]) : false;

const Fs = require("fs");
const Path = require("path");
const expect = require("chai").expect;
const node_fetch = require("node-fetch");
const jsdom = require("jsdom");
const {JSDOM} = jsdom;

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
const StaticResourceConfig = {
  interceptors: [
    jsdom.requestInterceptor((request, _context) => {
      if (request.url in StaticResources)
        return new Response(Fs.readFileSync(StaticResources[request.url], "utf8"), {
          headers: { "Content-Type": "text/javascript" }
        });
    })
  ]
};

if (!TEST_browser) {
  console.warn("Skipping editors-smoke-tests; to activate these tests, set environment variable TEST_browser=true");
} else {
  describe("shex-simple with ?editors=1", function () {
    this.timeout(20000);
    const page = "packages/shex-webapp/doc/shex-simple.html";

    let dom, $, shared;
    before(async function () {
      const base = Path.join(__dirname, "../../..", page);
      dom = new JSDOM(Fs.readFileSync(base, "utf8"), {
        url: GitRootServer.urlFor(page + "?editors=1"),
        runScripts: "dangerously",
        resources: StaticResourceConfig,
        pretendToBeVisual: true, // CodeMirror needs rAF etc.
      });
      dom.window.fetch = node_fetch;
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

    it("should anchor validation errors in both panes", async function () {
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
      set("#textMap", "<http://a.example/x>@<http://a.example/S>");
      await shared.promise; // the #textMap change handler's copyTextMapToEditMap
      $("#validate").trigger("click");
      await shared.promise; // the validation
      dom.window.console.warn = origWarn;

      expect(warns.filter(w => w.includes("editor diagnostics failed"))).to.deep.equal([]);
      expect($("#results .fails").length, "nonconformant result; results: " + $("#results").text().substring(0, 200)).to.be.above(0);

      const editorSupport = shared.Caches.editorSupport;
      expect(editorSupport, "editorSupport reachable but non-enumerable").to.exist;
      expect(Object.keys(shared.Caches)).not.to.include("editorSupport");
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

    it("should validate edited pane text (cache staleness regression)", async function () {
      // the previous validation was nonconformant; loosen the constraint
      // through the editor pane and revalidate -- a stale cache would still
      // see xsd:integer and fail again
      $("#inputSchema textarea").first().val([
        "PREFIX : <http://a.example/>",
        ":S { :p . }",
      ].join("\n"));
      $("#validate").trigger("click");
      await shared.promise;
      expect($("#results .fails").length, "fails: " + $("#results").text().substring(0, 120)).to.equal(0);
      expect($("#results .passes").length, "conformant result rendered").to.be.above(0);

      // conformant matches become cross-pane hover pairs
      const pairs = shared.Caches.editorSupport.lastMapped.pairs;
      const match = pairs.find(p => p.status === "conformant" && p.anchors.object);
      expect(match, "conformant hover pair").to.exist;
      const dataText = $("#inputData textarea").first().val();
      expect(dataText.substring(match.anchors.object.from, match.anchors.object.to))
        .to.equal('"not a number"');
      expect(dataText.substring(match.anchors.subject.from, match.anchors.subject.to))
        .to.equal(":x");
    });

    it("should not mark expected failures (node@!shape) as errors", async function () {
      const set = (selector, value) => {
        const elt = $(selector).first();
        elt.val(value);
        elt.trigger("change");
      };
      set("#inputSchema textarea", [
        "PREFIX : <http://a.example/>",
        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
        ":S { :p xsd:integer }",
      ].join("\n"));
      set("#inputData textarea", [
        "PREFIX : <http://a.example/>",
        ':x :p "not a number" .',
      ].join("\n"));
      set("#textMap", "<http://a.example/x>@!<http://a.example/S>"); // expected to fail
      await shared.promise;
      $("#validate").trigger("click");
      await shared.promise;

      expect($("#results .passes").length, "expected failure renders as a pass").to.be.above(0);
      const mapped = shared.Caches.editorSupport.lastMapped;
      expect(mapped.schema, "no error marks for an expected failure").to.deep.equal([]);
      expect(mapped.data).to.deep.equal([]);
      // ... but the failure pairs stay hoverable to show why it failed
      expect(mapped.pairs.some(p => p.status === "nonconformant")).to.equal(true);
    });

    it("should mark unexpected conformance of node@!shape as an error", async function () {
      const set = (selector, value) => {
        const elt = $(selector).first();
        elt.val(value);
        elt.trigger("change");
      };
      set("#inputData textarea", [
        "PREFIX : <http://a.example/>",
        ":x :p 42 .", // conforms, though the map still expects failure
      ].join("\n"));
      await shared.promise;
      $("#validate").trigger("click");
      await shared.promise;

      expect($("#results .fails").length, "unexpected conformance renders as a fail").to.be.above(0);
      const mapped = shared.Caches.editorSupport.lastMapped;
      expect(mapped.schema.length, "error mark on the shape declaration").to.be.above(0);
      expect(mapped.schema[0].message).to.include("expected nonconformance");
    });

    it("should keep mid-edit parse errors off console.error", async function () {
      const errors = [];
      const origError = dom.window.console.error;
      dom.window.console.error = (...args) => { errors.push(args.map(String).join(" ")); };
      try {
        // an unclosed quote mid-edit: the next line gets swallowed into the
        // string and the word after it becomes a syntax error
        const dataTextarea = $("#inputData textarea").first();
        dataTextarea.val([
          "PREFIX : <http://a.example/>",
          ':x :p "not yet closed',
          ":x :q :y .",
        ].join("\n"));
        dataTextarea.trigger("change"); // as the pane's debounced change would
        await shared.promise;           // dataInputHandler -> copyTextMapToEditMap
        await new Promise(resolve => setTimeout(resolve, 50));
      } finally {
        dom.window.console.error = origError;
      }
      // jsdom has no layout, so CodeMirror's measure loop logs
      // getClientRects noise there; it can't occur in a real browser
      const appErrors = errors.filter(e => !/getClientRects/.test(e));
      expect(appErrors, "console.error stays clean of input errors").to.deep.equal([]);
    });

    it("should size the panes like the textareas they replace", function () {
      // jsdom has no layout, so the rows-based fallback applies
      const paneStyle = $("#inputSchema .shexjs-editor-pane")[0].style;
      expect(paneStyle.height, "height set").to.not.equal("");
      expect(paneStyle.width, "width set").to.not.equal("");
    });

    it("should toggle editors off and on from the menu select", function () {
      const schemaTextarea = $("#inputSchema textarea").first();
      const before = schemaTextarea.val();

      $("#editors").val("").trigger("change");
      expect($(".shexjs-editor-pane").length, "panes removed").to.equal(0);
      expect(schemaTextarea[0].style.display).not.to.equal("none");
      expect(schemaTextarea.val(), "textarea kept the edited text").to.equal(before);
      expect(shared.Caches.editorSupport, "stash removed").to.equal(undefined);

      $("#editors").val("1").trigger("change");
      expect($("#inputSchema .shexjs-editor-pane").length, "schema pane back").to.equal(1);
      expect($("#inputSchema textarea").first().val(), "text survived the round trip").to.equal(before);
    });
  });
}
