/** Loading a plugin by URL (doc/plugins.md).
 *
 * shex-simple.html has no ShExMap in it.  Told where one is -- in the query
 * string, or by the manifest entry that needs it -- it fetches the module,
 * registers what the module says it adds, and puts it on the page: the
 * panes appear, the manifest keys they declare get read, and the permalink
 * brings the whole thing back.
 *
 * The other half is the half ?plugin= was built for: a module that
 * registers a semantic-action extension, which is what the schema's
 * %Ext:{...%} dispatches on.  One module may do either or both.
 */
"use strict";

const TEST_browser = "TEST_browser" in process.env ? JSON.parse(process.env["TEST_browser"]) : false;

const Fs = require("fs");
const Path = require("path");
const expect = require("chai").expect;
const node_fetch = require("node-fetch");
let JSDOM, VirtualConsole;

const [[GitRootServer]] = require("../../../tools/testServer")
      .startServer(
        [ { url: "http://localhost:9999/shex.js/",
            fromDir: Path.join(__dirname, "../../..") }
        ]
      );

const PAGE = "packages/shex-webapp/doc/shex-simple.html";
const MAP_PLUGIN = "../../extension-map/doc/ShExMapPlugin.js";
const MAP_MANIFEST = "../../extension-map/examples/manifest.yaml";
// the package's build output, which needs no bundler: no requires, and
// module.exports is the module.  (The browserify bundle that used to sit
// in browser/ was built from a file the package no longer has, from
// before SemActFailure, and is deleted.)
const TEST_EXTENSION = "../../extension-test/lib/shex-extension-test.js";
const MAP_ID = "http://shex.io/extensions/Map/#";
const REDUCE_ID = "http://shex.io/extensions/Reduce/";
// every example in the repository, as one suite (tools/aggregate-manifests.js)
const ALL_MANIFEST = "../../../doc/tests-manifest.yaml";

if (!TEST_browser) {
  console.warn("Skipping plugin-loading-smoke-tests; to activate these tests, set environment variable TEST_browser=true");
} else {
  ({JSDOM, VirtualConsole} = require("jsdom"));

  /** shex-simple.html, booted with this query string */
  async function boot (search) {
    const virtualConsole = new VirtualConsole().forwardTo(console, {jsdomErrors: "none"});
    const dom = new JSDOM(Fs.readFileSync(Path.join(__dirname, "../../..", PAGE), "utf8"), {
      url: GitRootServer.urlFor(PAGE + search),
      runScripts: "dangerously",
      resources: "usable",
      pretendToBeVisual: true,
      virtualConsole,
    });
    dom.window.fetch = node_fetch;
    if (!dom.window.CSS)
      dom.window.CSS = { escape: s => String(s).replace(/[^a-zA-Z0-9_ -￿-]/g, c => `\\${c}`) };
    dom.window.Range.prototype.getClientRects = function () { return []; };
    dom.window.Range.prototype.getBoundingClientRect =
      function () { return {x: 0, y: 0, top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0}; };
    const shared = await new Promise((resolve, reject) => {
      dom.window._testCallback = parm => parm instanceof Error ? reject(parm) : resolve(parm);
    });
    await shared.promise;
    return {dom, $: dom.window.$, shared};
  }

  /** what the three ShExMap panes hold, or null where there is no such pane */
  const paneTexts = $ => ["#bindings1", "#staticVars", "#outputSchema"].map(
    sel => $(sel + " textarea").length ? $(sel + " textarea").first().val() : null);

  describe("shex-simple, told in the query string where a plugin is", function () {
    this.timeout(20000);
    let dom, $, shared;

    before(async function () {
      ({dom, $, shared} = await boot("?editors=1&plugin=" + encodeURIComponent(MAP_PLUGIN)));
    });
    after(function () { if (dom) dom.window.close(); });

    it("should fetch the module and register what it says it adds", function () {
      expect(dom.window.ShExPlugins.all().map(e => e.label)).to.deep.equal(["ShExMap"]);
      expect($("head style[data-plugin]").attr("data-plugin")).to.equal(MAP_ID);
    });

    it("should build its panes on a page that has no markup for them", function () {
      const screen = $("#screens > .screen[data-plugin]");
      expect(screen.length, "one screen").to.equal(1);
      expect(screen.find(".panel > div[id]").map((i, e) => e.id).get())
        .to.deep.equal(["bindings1", "staticVars", "outputSchema"]);
      expect(Object.keys(shared.Caches)).to.include.members(["bindings", "statics", "outputSchema"]);
      // ?editors=1: the panes it declared are editors like the page's own
      expect(Object.keys(shared.Caches.editorSupport.panes))
        .to.include.members(["bindings", "statics", "outputSchema"]);
    });

    /* A validator has one kind of result and writes it into #results.  An
     * plugin with a second kind gets a tab, and this page -- which has
     * never heard of materialization -- grows one on being told where
     * ShExMap is. */
    it("should give the plugin's results a tab beside its own", function () {
      expect($("#resultsTabs > ul > li > a").map((i, a) => $(a).text()).get()[0])
        .to.equal("validation");
      expect($("#resultsTabs > #validationResults > div").length,
             "this app's results, where they always were").to.equal(1);
      expect($("#resultsTabs > #materializationResults").length,
             "and a tab for the plugin's").to.equal(1);
      expect(shared.app.resultsTarget).to.equal("#validationResults > div");
    });

    /* The whole of it, on a page that has never heard of ShExMap: the
     * controls, and the module the verbs run on, which the descriptor names
     * and the app fetches.  Pressing materialize gets ShExMap's own answer
     * -- there are no bindings yet -- rather than a missing-module error. */
    it("should build its toolbar, and bring the module its verbs run on", async function () {
      const toolbar = $("#screens .screen[data-plugin] > .pluginToolbar");
      expect(toolbar.length, "one toolbar").to.equal(1);
      expect(toolbar.find("button").map((i, b) => b.id).get()).to.deep.equal(
        ["materialize", "debugMaterialize",
         "dbgContinue", "dbgInto", "dbgOver", "dbgOut", "dbgStop"]);
      expect($("#outputShapeMap").length, "and the input that is not a pane").to.equal(1);
      expect($("#debugControls").css("display"), "the step buttons wait").to.equal("none");
      expect(typeof dom.window.ShExWebApp.Map, "the module it fetched").to.equal("function");

      $("#materialize").trigger("click");
      await shared.promise;
      expect($("#results .error").text(), "and the verb ran")
        .to.include("You must validate data against a ShExMap schema");
    });

    it("should declare the query parameters and manifest keys that fill them", function () {
      const parms = shared.app.QueryParams.filter(
        p => ["bindings", "statics", "outSchema", "output-map"].includes(p.queryStringParm));
      expect(parms.map(p => p.queryStringParm))
        .to.deep.equal(["bindings", "statics", "outSchema", "output-map"]);
      expect(parms.map(p => p.manifest && p.manifest.key))
        .to.deep.equal([undefined, "staticVars", "outputSchema", "outputShapeMap"]);
      // the toolbar's input is a parameter like a pane, without being a cache
      expect(parms[3].location.attr("id")).to.equal("outputShapeMap");
    });

    /* Otherwise the link reproduces a page that can't read half of what the
     * link says: a plugin is part of the session, not a side effect. */
    it("should carry it in the permalink", async function () {
      const parms = (await shared.app.getPermalink()).split(/[?&]/);
      expect(parms.filter(p => p.startsWith("plugin") || p.startsWith("extension")),
             "under the new name, however it was loaded").to.deep.equal([
        "pluginURL=" + encodeURIComponent(GitRootServer.urlFor(
          "packages/extension-map/doc/ShExMapPlugin.js")),
      ]);
    });
  });

  describe("shex-simple, given a manifest whose entries name a plugin", function () {
    this.timeout(20000);
    let dom, $, shared;

    before(async function () {
      ({dom, $, shared} = await boot(
        "?editors=1&interface=appinfo&manifestURL=" + encodeURIComponent(MAP_MANIFEST)));
    });
    after(function () { if (dom) dom.window.close(); });

    /* The manifest is a list of entries; a plugin is what an entry is
     * read *by*, so nothing loads until an entry is picked. */
    it("should load nothing until an entry asks for it", function () {
      expect(dom.window.ShExPlugins.all()).to.deep.equal([]);
      expect(paneTexts($), "no panes").to.deep.equal([null, null, null]);
      expect($("#inputSchema .manifest li").length, "but the entries are there").to.be.above(0);
    });

    /* ...and then everything the entry says is read, including the keys
     * that only exist because the plugin declared them.  Before this,
     * outputSchemaURL and staticVars were dropped in silence. */
    it("should load it when an entry is picked, and read the entry into it", async function () {
      $("#inputSchema .manifest li").filter((i, li) => $(li).text() === "BP").trigger("click");
      await shared.promise;
      $("#inputData .passes li").filter((i, li) => $(li).text() === "simple").trigger("click");
      await shared.promise;

      expect(dom.window.ShExPlugins.all().map(e => e.label)).to.deep.equal(["ShExMap"]);
      const [bindings, statics, outputSchema] = paneTexts($);
      expect(bindings, "a validation product, not an input").to.equal("");
      expect(JSON.parse(statics))
        .to.deep.equal({"http://abc.example/someConstant": "\"123-456\""});
      expect(outputSchema, "fetched via the entry's outputSchemaURL").to.include("<BPunitsDAM>");
      // a pane built after the editors were switched on is still an editor
      expect(Object.keys(shared.Caches.editorSupport.panes))
        .to.include.members(["bindings", "statics", "outputSchema"]);
    });

    it("should load it once, however many entries name it", async function () {
      $("#inputSchema .manifest li").filter((i, li) => $(li).text() === "BP back").trigger("click");
      await shared.promise;
      expect(dom.window.ShExPlugins.all().length, "the same plugin, not a second one")
        .to.equal(1);
      expect($("#screens > .screen[data-plugin]").length, "and one screen").to.equal(1);
    });
  });

  describe("shex-simple, told to open on a plugin's screen", function () {
    this.timeout(20000);
    let dom, $, shared;

    before(async function () {
      // plugins load before ?screen= is read, so a permalink may name a
      // screen the same link brings
      ({dom, $, shared} = await boot("?editors=1&plugin=" + encodeURIComponent(MAP_PLUGIN)
                                     + "&screen=" + encodeURIComponent(MAP_ID)));
    });
    after(function () { if (dom) dom.window.close(); });

    it("should open with that screen up and the validator's away", function () {
      expect($("#screen").val()).to.equal(MAP_ID);
      expect($("#screens > .screen").css("display"), "the map's screen is up")
        .to.not.equal("none");
      expect($("#inputSchema").css("display"), "the schema panel is away").to.equal("none");
    });
  });

  /* doc/tests-manifest.yaml is every example in the repository as one
   * suite.  Its entries were written to be read from three different
   * directories, so what this asks is whether they still find what they
   * name from doc/ -- the documents, and the plugins the entries that need
   * one name themselves by. */
  describe("shex-simple, given the manifest that aggregates them all", function () {
    this.timeout(20000);
    let dom, $, shared;

    /** pick a schema, then one of its documents */
    async function open (schemaLabel, dataLabel) {
      $("#inputSchema .manifest li").filter((i, li) => $(li).text() === schemaLabel)
        .first().trigger("click");
      await shared.promise;
      $("#inputData .passes li, #inputData .fails li")
        .filter((i, li) => $(li).text() === dataLabel).first().trigger("click");
      await shared.promise;
    }

    before(async function () {
      ({dom, $, shared} = await boot("?manifestURL=" + encodeURIComponent(ALL_MANIFEST)));
    });
    after(function () { if (dom) dom.window.close(); });

    it("should offer every package's examples in one picklist", function () {
      const labels = $("#inputSchema .manifest li").map((i, li) => $(li).text()).get();
      expect(labels, "the validator's").to.include("clinical observation");
      expect(labels, "ShExMap's").to.include("BP");
      expect(labels, "and ShExReduce's").to.include("calc, actions guide");
      expect(dom.window.ShExPlugins.all(), "and nothing loaded until asked")
        .to.deep.equal([]);
    });

    it("should find a plain entry's documents from where it now sits", async function () {
      await open("clinical observation", "the least an Observation can be");
      expect($("#inputSchema textarea").first().val(), "schemaURL fetched")
        .to.include("<ObservationShape>");
      $("#validate").trigger("click");
      await shared.promise;
      expect($("#results .passes").length, "and it validates").to.be.above(0);
    });

    it("should load the plugin an entry names, and read the entry into it",
       async function () {
         await open("BP", "simple");
         expect(dom.window.ShExPlugins.all().map(e => e.id)).to.deep.equal([MAP_ID]);
         expect($("#outputSchema textarea").first().val(), "outputSchemaURL fetched")
           .to.include("<BPunitsDAM>");
         expect(JSON.parse($("#staticVars textarea").first().val()))
           .to.deep.equal({"http://abc.example/someConstant": "\"123-456\""});
       });

    it("should load a second plugin, beside the first", async function () {
      await open("calc, actions in an overlay", "(1 + 2) * 3");
      expect(dom.window.ShExPlugins.all().map(e => e.id), "both, in the order asked for")
        .to.deep.equal([MAP_ID, REDUCE_ID]);
      expect($("#reduceOverlay textarea").first().val(), "overlayURL fetched")
        .to.include("sa:Overlay");
      expect($("#screens > .screen").length, "a screen each").to.equal(2);
      expect($("#screenTabs button").map((i, b) => $(b).attr("data-screen")).get())
        .to.deep.equal(["", MAP_ID, REDUCE_ID]);
      expect($("#screenTabs .unloadPlugin").length, "an × each, and none on the page's")
        .to.equal(2);
    });

    /* ...and one of two plugins unloads without taking the other with it. */
    it("should unload one of them and leave the other standing", function () {
      $("#screenTabs button").filter((i, b) => $(b).attr("data-screen") === MAP_ID)
        .find(".unloadPlugin").trigger("click");
      expect(dom.window.ShExPlugins.all().map(e => e.id)).to.deep.equal([REDUCE_ID]);
      expect($("#screens > .screen").length, "one screen left").to.equal(1);
      expect($("#screenTabs button").length, "and the page's tab beside it").to.equal(2);
      expect($("#bindings1, #outputSchema, #outputShapeMap").length, "the map is gone")
        .to.equal(0);
      expect($("#reduceOverlay").length, "the fold is not").to.equal(1);
      // the results are still tabs, because ShExReduce's tab is still one
      expect($("#resultsTabs > ul > li > a").map((i, a) => $(a).attr("href")).get())
        .to.deep.equal(["#validationResults", "#reduceAstResults"]);
    });
  });

  /* A plugin came from a URL, and the × on its screen tab is the way back
   * out: the page it leaves is the page it arrived at. */
  describe("shex-simple, told to unload the plugin it loaded", function () {
    this.timeout(20000);
    let dom, $, shared, descriptor;
    const set = (selector, value) => {
      const elt = $(selector).first();
      elt.val(value);
      elt.trigger("change");
    };

    before(async function () {
      ({dom, $, shared} = await boot("?editors=1&plugin=" + encodeURIComponent(MAP_PLUGIN)));
      descriptor = dom.window.ShExPlugins.byId(MAP_ID);
    });
    after(function () { if (dom) dom.window.close(); });

    it("should offer an × on the plugin's tab and none on the validator's", function () {
      expect($("#screenTabs button[data-screen=''] .unloadPlugin").length,
             "the validator is the page, not a guest").to.equal(0);
      const mine = $("#screenTabs button").filter(
        (i, b) => $(b).attr("data-screen") === MAP_ID);
      expect(mine.find(".unloadPlugin").length, "and the plugin has a door").to.equal(1);
      expect(mine.find(".unloadPlugin").attr("title")).to.equal("unload ShExMap");
    });

    it("should take the whole of it off the page when the × is pressed", function () {
      expect(typeof shared.app.materialize, "a verb it mixed in").to.equal("function");
      $("#screenTabs .unloadPlugin").first().trigger("click");

      expect(dom.window.ShExPlugins.all(), "out of the register").to.deep.equal([]);
      expect($("#screens > .screen").length, "screen gone").to.equal(0);
      expect($("head style[data-plugin]").length, "sheet gone").to.equal(0);
      expect($("#outputShapeMap").length, "and the controls with it").to.equal(0);
      expect(Object.keys(shared.Caches).sort(), "the caches it declared, gone")
        .to.deep.equal(["inputData", "inputSchema", "manifest", "plugin", "shapeMap"]);
      expect(Object.keys(shared.Caches.editorSupport.panes).sort(),
             "and the editors over them").to.deep.equal(["inputData", "inputSchema"]);
      expect(shared.app.QueryParams.filter(
        p => ["bindings", "statics", "outSchema", "output-map"].includes(p.queryStringParm)),
             "nothing left to fill them from").to.deep.equal([]);
      expect(shared.app.Getables.filter(
        g => ["bindings", "statics", "outSchema"].includes(g.queryStringParm)),
             "nor to fetch them by URL").to.deep.equal([]);
      expect(typeof shared.app.materialize, "the verb went back too").to.equal("undefined");
    });

    it("should give the page its title and its results back", function () {
      expect($("#screenTabs").css("display"), "nothing left to switch between")
        .to.equal("none");
      expect($("#title h1 .screenName").css("display"), "so the title says it all")
        .to.not.equal("none");
      expect($("#screen").val(), "and the validator is what is showing").to.equal("");
      expect($("#inputSchema").css("display")).to.not.equal("none");
      // ...and the results are one panel again, which is the shape a page
      // that never loaded a plugin has them in
      expect($("#resultsTabs").length, "the tabs are gone").to.equal(0);
      expect($("#results > div").length, "and this app's results are back").to.equal(1);
      expect(shared.app.resultsTarget).to.equal("#results > div");
    });

    it("should stop naming it in the permalink", async function () {
      const parms = (await shared.app.getPermalink()).split(/[?&]/);
      expect(parms.filter(p => p.startsWith("plugin") || p.startsWith("extension")),
             "a reload comes back without it").to.deep.equal([]);
    });

    it("should validate as a page that never loaded one", async function () {
      set("#inputSchema textarea",
          "PREFIX : <http://a.example/>\nPREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n:S { :p xsd:integer }");
      set("#inputData textarea", "PREFIX : <http://a.example/>\n:x :p 1 .");
      set("#queryMap", "<http://a.example/x>@<http://a.example/S>");
      $("#validate").trigger("click");
      await shared.promise;
      expect($("#results .passes").length, "it still validates").to.be.above(0);
    });

    /* The module is still on the page -- a classic script cannot be un-run
     * -- so registering again is the cheap thing to do, and has to work:
     * everything the descriptor's bookkeeping said was already built was
     * unsaid on the way out. */
    it("should build the whole of it again if the same plugin registers", function () {
      dom.window.ShExPlugins.register(descriptor);
      expect(dom.window.ShExPlugins.all().map(e => e.label)).to.deep.equal(["ShExMap"]);
      expect($("#screens > .screen[data-plugin]").length, "one screen, built afresh").to.equal(1);
      expect($("#screens > .screen .panel > div[id]").map((i, e) => e.id).get())
        .to.deep.equal(["bindings1", "staticVars", "outputSchema"]);
      expect(Object.keys(shared.Caches)).to.include.members(["bindings", "statics", "outputSchema"]);
      expect(typeof shared.app.materialize, "and its verbs are back").to.equal("function");
      expect($("#screenTabs button").length, "so is its tab").to.equal(2);
      expect($("#resultsTabs > #materializationResults").length, "and its results tab")
        .to.equal(1);
    });
  });

  describe("shex-simple, given a semantic-action extension module", function () {
    this.timeout(20000);
    let dom, $, shared;
    const set = (selector, value) => {
      const elt = $(selector).first();
      elt.val(value);
      elt.trigger("change");
    };

    before(async function () {
      ({dom, $, shared} = await boot("?plugin=" + encodeURIComponent(TEST_EXTENSION)));
      set("#inputSchema textarea", [
        "PREFIX : <http://a.example/>",
        "PREFIX Test: <http://shex.io/extensions/Test/>",
        ':S { :p . %Test:{ fail("no") %} }',
      ].join("\n"));
      set("#inputData textarea", "PREFIX : <http://a.example/>\n:x :p 1 .");
      set("#queryMap", "<http://a.example/x>@<http://a.example/S>");
      await shared.promise;
    });
    after(function () { if (dom) dom.window.close(); });

    it("should offer it in the menu, with no panes and no styles", function () {
      const control = $(".pluginControl");
      expect(control.length, "one control").to.equal(1);
      expect(control.attr("data-name")).to.equal("Test");
      expect(control.is(":checked"), "on when loaded").to.equal(true);
      expect(dom.window.ShExPlugins.all(), "it adds nothing to the page").to.deep.equal([]);
    });

    /* The handler decides the match: shexTest's Test extension fails a
     * node whose action says fail().  Unregistered, the same action is
     * skipped -- so this says the loaded code reached the validator, which
     * is what `$(".pluginControl:checked")` is for. */
    it("should hand its handler to the validator", async function () {
      $("#validate").trigger("click");
      await shared.promise;
      expect($("#results .fails").length, "the action failed the node").to.be.above(0);
    });

    it("should leave the action to nobody when it is switched off", async function () {
      $(".pluginControl").prop("checked", false);
      $("#validate").trigger("click");
      await shared.promise;
      expect($("#results .passes").length, "an unhandled action is skipped").to.be.above(0);
    });
  });
}
