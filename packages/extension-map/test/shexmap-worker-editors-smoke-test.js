/** Smoke test for shexmap-worker.html?editors=1: the worker flavour must
 * boot with editor panes over the ShExMap caches, round-trip a validation
 * through the (stubbed same-thread) ShExMapWorkerThread and anchor the
 * marshalled diagnostics in the panes.  jsdom has no Worker; fakeWorker.js
 * runs the thread script unmodified in a vm context.
 */
"use strict";

const TEST_browser = "TEST_browser" in process.env ? JSON.parse(process.env["TEST_browser"]) : false;

const Fs = require("fs");
const Path = require("path");
const expect = require("chai").expect;
const node_fetch = require("node-fetch");
const {makeWorkerClass} = require("../../shex-webapp/test/fakeWorker");
// jsdom's engines outpace the packages' own; required lazily under
// TEST_browser (c.f. browser-test.js)
let JSDOM;

const [[GitRootServer]] = require("../../../tools/testServer")
      .startServer(
        [ { url: "http://localhost:9999/shex.js/",
            fromDir: Path.join(__dirname, "../../..") }
        ]
      );

if (!TEST_browser) {
  console.warn("Skipping shexmap-worker-editors-smoke-tests; to activate these tests, set environment variable TEST_browser=true");
} else {
  const jsdom = require("jsdom");
  ({JSDOM} = jsdom);
  describe("shexmap-worker with ?editors=1", function () {
    this.timeout(20000);
    // ShExMap is a plugin of this page now; shexmap-worker.html is a
    // redirect that opens it with exactly these parameters (§5 phase 2)
    const page = "packages/shex-webapp/doc/shex-worker.html";
    const asShExMap = "&plugin=" + encodeURIComponent("../../extension-map/doc/ShExMapPlugin.js")
          + "&manifestURL=" + encodeURIComponent("../../extension-map/examples/manifest.json");

    let dom, $, shared;
    before(async function () {
      const base = Path.join(__dirname, "../../..", page);
      // forward page console traffic except console.debug, the app's channel
      // for reporting user-input errors (e.g. mid-edit parse failures)
      const virtualConsole = new jsdom.VirtualConsole().forwardTo(console);
      virtualConsole.removeAllListeners("debug");
      dom = new JSDOM(Fs.readFileSync(base, "utf8"), {
        url: GitRootServer.urlFor(page + "?editors=1" + asShExMap),
        runScripts: "dangerously",
        resources: "usable",
        pretendToBeVisual: true, // CodeMirror needs rAF etc.
        virtualConsole,
        beforeParse (window) {
          // the page's head script runs new Worker("ShExWorkerThread.js")
          window.Worker = makeWorkerClass(Path.dirname(base), {}, [
            // the app names its plugins' worker halves by URL
            {prefix: GitRootServer.urlFor(""), dir: Path.join(__dirname, "../../..")},
          ]);
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


    /* Inventory rows 15 and 16.  This page's worker is the plain one; what
     * makes it a ShExMap worker is the extension's own worker half, named
     * by URL on every request and imported once -- which is why
     * ShExMapWorkerThread.js is no longer a copy of ShExWorkerThread.js
     * with materialize bolted on, and why the copy's staleness (a
     * synchronous SPARQL db, unmarshalled query-tracker terms) went with
     * it. */
    it("should validate in the plain worker, with ShExMap named as a plugin", function () {
      expect(shared.app.remote, "this app validates over there").to.equal(true);
      const ext = dom.window.ShExPlugins.byId("http://shex.io/extensions/Map/#");
      expect(ext.worker, "and says where its worker half is, relative to itself")
        .to.equal("./ShExMapWorkerThread.js");
      expect(new dom.window.URL(ext.worker, ext.baseUrl).href)
        .to.equal(GitRootServer.urlFor("packages/extension-map/doc/ShExMapWorkerThread.js"));
    });

    it("should boot with editor panes on the ShExMap caches", function () {
      expect($("#results .error").length, $("#results .error").text()).to.equal(0);
      ["#inputSchema", "#inputData", "#outputSchema", "#bindings1", "#staticVars"].forEach(sel => {
        expect($(sel + " .shexjs-editor-pane").length, sel + " pane").to.equal(1);
      });
    });

    it("should anchor worker validation errors in both panes", async function () {
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

      expect($("#results .fails").length, "nonconformant result; results: " + $("#results").text().substring(0, 200)).to.be.above(0);

      const mapped = shared.Caches.editorSupport.lastMapped;
      expect(mapped, "validation errors were mapped").to.exist;
      const schemaText = $("#inputSchema textarea").first().val();
      const dataText = $("#inputData textarea").first().val();
      expect(mapped.schema.map(d => schemaText.substring(d.from, d.to)))
        .to.include(":p xsd:integer");
      expect(mapped.data.map(d => dataText.substring(d.from, d.to)))
        .to.include('"not a number"');
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

    // the materialization runs in the worker, so its provenance crosses a
    // structured clone: constraints travel as indexes into the schema both
    // sides hold (ShExMapWorkerThread's "materialize"), and must come back
    // as this thread's own TripleConstraint objects
    it("should tie worker-materialized triples to constraints and bindings", async function () {
      const outputSchemaText = [
        "PREFIX : <http://a.example/>",
        "PREFIX Map: <http://shex.io/extensions/Map/#>",
        "start = @:S",
        ":S {",
        "  :p . %Map:{ :v1 %} ;",
        "  :q . %Map:{ :v2 %}",
        "}",
      ].join("\n");
      const set = (selector, value) => {
        const elt = $(selector).first();
        elt.val(value);
        elt.trigger("change");
      };
      set("#outputSchema textarea", outputSchemaText);
      set("#bindings1 textarea", JSON.stringify({
        "http://a.example/v1": {value: "one"},
        "http://a.example/v2": {value: "two"},
      }));
      set("#staticVars textarea", "{}");
      $("#outputShapeMap").val("<tag:root>@<http://a.example/S>");
      $("#materialize").trigger("click");
      await shared.promise;

      const paneDom = $("#results .shexjs-turtle-pane");
      expect(paneDom.length, "materialization renders in a Turtle pane").to.equal(1);
      // no height of its own: the page is divided for this now -- panes
      // above, results below -- and the results tab is what scrolls
      expect(paneDom[0].style.height, "no height measured against the window")
        .to.equal("");
      expect($("#resultsTabs > div[id]").first().css("overflow"),
             "the tab it is in is what scrolls").to.equal("auto");

      const [{pairs, text: resultText}] = shared.Caches.editorSupport.lastMaterialized;
      expect(pairs.length, "one pair per generated triple").to.equal(2);
      const at = (text, range) => text.substring(range.from, range.to);

      const one = pairs.find(p => p.variables.indexOf("http://a.example/v1") !== -1);
      expect(one, "the triple carrying :v1's binding").to.exist;
      // the constraint came back as a schema object this thread can locate
      expect(at(outputSchemaText, one.schema)).to.include(":p .");
      expect(at(outputSchemaText, one.schema)).to.include("Map:{ :v1 %}");
      expect(at(resultText, one.anchors.object)).to.equal('"one"');

      const two = pairs.find(p => p.variables.indexOf("http://a.example/v2") !== -1);
      expect(at(outputSchemaText, two.schema)).to.include(":q .");
      expect(at(resultText, two.anchors.object)).to.equal('"two"');
    });

    // the same end-to-end check the main-thread app gets: validate the
    // manifest's deepest entry, materialize, and confirm every repeated
    // reading anchors inside its own blank node
    it("should anchor repeated identical structures in their own subtrees", async function () {
      const pick = async (selector, label) => {
        const li = $(selector).filter((_, elt) => $(elt).text() === label);
        expect(li.length, label + " in " + selector).to.equal(1);
        li.trigger("click");
        await shared.promise;
      };
      await pick("#inputSchema .manifest li", "BPPatient 2 levels");
      await pick("#inputData .passes li", "simple");
      $("#validate").trigger("click");
      await shared.promise; // bindings come from the worker's validation
      expect($("#bindings1 textarea").first().val(), "validation populated the bindings")
        .to.include("BPDAM-sysVal");

      $("#materialize").trigger("click");
      await shared.promise;
      const [{pairs, text: resultText}] = shared.Caches.editorSupport.lastMaterialized;
      ["100", "60", "101", "61", "110", "70", "111", "71"].forEach(v =>
        expect(resultText, "rendered " + v).to.include('"' + v + '"'));

      const unanchored = pairs.filter(p => !p.anchors.object);
      expect(unanchored.map(p => p.quad.predicate.value), "all anchored").to.deep.equal([]);
      pairs.forEach(p => {
        if (p.quad.object.termType === "Literal")
          expect(resultText.substring(p.anchors.object.from, p.anchors.object.to),
                 p.quad.predicate.value + " anchor").to.include(p.quad.object.value);
      });
      const spots = pairs.map(p => p.anchors.object.from);
      expect(new Set(spots).size, "distinct anchors").to.equal(spots.length);

      // each reading's :units sits with its own :value, and both name the
      // same generated blank node
      const fhir = "http://hl7.org/fhir-rdf/";
      const byPos = (a, b) => a.anchors.object.from - b.anchors.object.from;
      const values = pairs.filter(p => p.quad.predicate.value === fhir + "value").sort(byPos);
      const units = pairs.filter(p => p.quad.predicate.value === fhir + "units").sort(byPos);
      expect(values.length).to.equal(8);
      expect(units.length).to.equal(8);
      values.forEach((value, i) => {
        expect(units[i].anchors.object.from, "units " + i + " follows its value")
          .to.be.above(value.anchors.object.to);
        if (values[i + 1])
          expect(units[i].anchors.object.to, "units " + i + " precedes the next value")
            .to.be.below(values[i + 1].anchors.object.from);
        expect(units[i].quad.subject.value, "units " + i + "'s subject")
          .to.equal(value.quad.subject.value);
      });
    });

    /* The × on the screen tab, on the page that has a worker: the worker
     * imported ShExMap's half and cannot un-import it, so the page gets a
     * fresh one -- otherwise the handler over there would still answer a
     * schema that named it after the plugin had gone.  Last, since nothing
     * of ShExMap is left afterwards. */
    it("should give the page a worker that never heard of it, on unload", async function () {
      const set = (selector, value) => {
        const elt = $(selector).first();
        elt.val(value);
        elt.trigger("change");
      };
      const before = dom.window.ShExWorker;

      $("#screenTabs .unloadPlugin").first().trigger("click");

      expect(dom.window.ShExPlugins.all(), "out of the register").to.deep.equal([]);
      expect($("#screens > .screen").length, "and off the page").to.equal(0);
      expect(dom.window.ShExWorker, "a worker of its own").to.not.equal(before);

      // ...and the page still validates over there, which is the thing a
      // fresh worker has to still be able to do
      set("#inputSchema textarea", [
        "PREFIX : <http://a.example/>",
        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
        ":S { :p xsd:integer }",
      ].join("\n"));
      set("#inputData textarea", "PREFIX : <http://a.example/>\n:x :p 1 .");
      set("#queryMap", "<http://a.example/x>@<http://a.example/S>");
      await shared.promise;
      $("#validate").trigger("click");
      await shared.promise;
      expect($("#results .error").text(), "no complaint").to.equal("");
      expect($("#results .passes").length, "it validated in the new worker").to.be.above(0);
    });
  });
}
