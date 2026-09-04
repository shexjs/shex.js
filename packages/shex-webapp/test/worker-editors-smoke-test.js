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
const node_fetch = globalThis.fetch;
// jsdom's engines outpace the packages' own; required lazily under
// TEST_browser (c.f. browser-test.js)
let Harness;

const [[GitRootServer]] = require("../../../tools/testServer")
      .startServer(
        [ { url: "http://localhost:9999/shex.js/",
            fromDir: Path.join(__dirname, "../../..") }
        ]
      );

if (!TEST_browser) {
  console.warn("Skipping worker-editors-smoke-tests; to activate these tests, set environment variable TEST_browser=true");
} else {
  Harness = require("./harness");
  describe("shex-worker with ?editors=1", function () {
    this.timeout(20000);
    const page = "packages/shex-webapp/doc/shex-simple.html";

    let dom, $, shared, errors;
    before(async function () {
      ({dom, $, shared, errors} = await Harness.boot(page, "?editors=1&worker=1", {worker: true}));
    });

    after(function () {
      Harness.expectClean(errors);
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
      expect($("#schemaDocument .shexjs-editor-pane").length, "schema pane").to.equal(1);
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

    /* A data source that fetches its answers cannot cross a postMessage:
     * the worker has to build one of its own.  It used to be told only
     * "endpoint" or a list of triples, so a Wikibase source arrived over
     * there as whatever triples the app happened to have -- none, before a
     * walk -- and the validation failed with nothing fetched and nothing
     * said. */
    it("should validate over a source the worker builds for itself", async function () {
      this.timeout(60000);
      const fixtures = GitRootServer.urlFor(
        "packages/neighborhood-wikibase/test/fixtures/");
      await shared.Caches.manifest.set([{
        schemaLabel: "person", schema: Fs.readFileSync(
          Path.join(__dirname, "../examples/wikidata-person.shex"), "utf8"),
        dataLabel: "Q42, fetched over there", neighborhood: "wikibase",
        base: fixtures, sitematrix: fixtures + "sitematrix.json",
        dataBase: "http://www.wikidata.org/entity/",
        regexpEngine: "eval-simple-1err",
        queryMap: 'QENTITIES "42"@START',
      }], "http://localhost/manifest.json");
      $("#inputSchema .manifest li").last().trigger("click");
      await shared.promise;
      $("#inputData .indeterminant li").last().trigger("click");
      await shared.promise;
      expect($("#neighborhood").val(), "the entry named a source that fetches")
        .to.equal("wikibase");

      $("#validate").trigger("click");
      await shared.promise;

      expect($("#results .error").length, $("#results").text().substring(0, 300))
        .to.equal(0);
      expect($("#results").text(), "Q42 is a person")
        .to.match(/\u2713|ShapeTest|conformant/);
    });

    /* ...and what it fetched is what a slurp records, from over there: the
     * worker's tracker posts each answer back to this side, which is where
     * the document being written lives. */
    it("should record what the worker fetched when slurp is on", async function () {
      this.timeout(60000);
      expect($("#nbhd-slurp").length, "a source that fetches offers it").to.equal(1);
      $("#nbhd-slurp").prop("checked", true).trigger("change");
      try {
        $("#validate").trigger("click");
        await shared.promise;
        let turtle = "";
        for (let i = 0; i < 100 && !/triples/.test(turtle); ++i) {
          await new Promise(resolve => setTimeout(resolve, 20));
          turtle = (shared.neighborhoods.panesFor("rdfjs").data || [""])[0] || "";
        }
        expect(turtle, "the walk it made over there")
          .to.match(/^# [\u2192\u2190] \S+@\S+ \d+ triples \(\d+ ms\)$/m);
        // ...written against the base the entry named, which is why an
        // entity reads as <Q42> rather than as its whole URL
        expect(turtle.split("\n")[0]).to.equal("BASE <http://www.wikidata.org/entity/>");
        expect(turtle, "and what it read").to.match(/^<Q42> wdt:/m);

        // ...and the pages that walk read, which are over there: a slurp
        // leaves them here as panes to edit and validate again
        const pages = shared.neighborhoods.panesFor("wikibase").pages || [];
        expect(pages.length, "the pages the walk read, carried back").to.be.above(0);
        expect(pages.some(page => /"Q42"/.test(page)), "Q42 among them").to.equal(true);
        expect(pages[0], "an entity page, as JSON").to.include('"entities"');
        expect($("#dataPaneTabs > li > a").map((i, a) => $(a).text()).get(),
               "each one a pane of its own").to.include("Q42");
      } finally {
        $("#nbhd-slurp").prop("checked", false).trigger("change");
        // the slurp handed the reader the local store, whose query map is
        // the one the next test validates with
        $("#queryMap").val("<http://a.example/x>@<http://a.example/S>");
        await shared.Caches.shapeMap.copyQueryMapToEditMap();
      }
    });

    it("should leave the editors out of the permalink", async function () {
      expect($("#editors").val(), "the editors are what the app is").to.equal("");
      $("#permalink a").removeAttr("href"); // built afresh when the menu opens
      $("#menu-button").trigger("click");
      let href;
      for (let i = 0; i < 100 && !(href = $("#permalink a").attr("href")); ++i)
        await new Promise(resolve => setTimeout(resolve, 20));
      $("#menu-button").trigger("click"); // close it again
      expect(href, "permalink: " + href).to.not.include("editors=");
    });
  });
}
