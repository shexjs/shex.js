/** Smoke test for shexmap-simple.html?editors=1: boot, editor panes over the
 * ShExMap-specific caches, and the step-through materialization debugger
 * (doc/debugger-design.md phase 3) driven programmatically.
 */
"use strict";

const TEST_browser = "TEST_browser" in process.env ? JSON.parse(process.env["TEST_browser"]) : false;

const Fs = require("fs");
const Path = require("path");
const expect = require("chai").expect;
const node_fetch = require("node-fetch");
// jsdom's engines outpace the packages' own; required lazily under
// TEST_browser (c.f. browser-test.js)
let Harness, nock;

const [[GitRootServer]] = require("../../../tools/testServer")
      .startServer(
        [ { url: "http://localhost:9999/shex.js/",
            fromDir: Path.join(__dirname, "../../..") }
        ]
      );

// prefixed labels: relative IRIs would resolve against the page URL
const outputSchemaText = [
  "PREFIX : <http://a.example/>",
  "PREFIX Map: <http://shex.io/extensions/Map/#>",
  "start = @:S",
  ":S {",
  "  :p . %Map:{ :v1 %} ;",
  "  :q . %Map:{ :v2 %}",
  "}",
].join("\n");
const bindingsJson = JSON.stringify({
  "http://a.example/v1": {value: "one"},
  "http://a.example/v2": {value: "two"},
});

if (!TEST_browser) {
  console.warn("Skipping shexmap-editors-smoke-tests; to activate these tests, set environment variable TEST_browser=true");
} else {
  Harness = require("../../shex-webapp/test/harness");
  nock = require("nock");
  describe("shexmap-simple with ?editors=1", function () {
    this.timeout(20000);
    // ShExMap is a plugin of this page now; shexmap-simple.html is a
    // redirect that opens it with exactly these parameters (§5 phase 2)
    const page = "packages/shex-webapp/doc/shex-simple.html";
    const asShExMap = "&plugin=" + encodeURIComponent("../../extension-map/doc/ShExMapPlugin.js")
          + "&manifestURL=" + encodeURIComponent("../../extension-map/examples/manifest.json");

    let dom, $, shared, app;
    before(async function () {
      ({dom, $, shared} = await Harness.boot(page, "?editors=1" + asShExMap));
    });

    after(function () {
      if (dom)
        dom.window.close();
    });

    it("should boot with editor panes on the ShExMap caches", function () {
      expect($("#results .error").length, $("#results .error").text()).to.equal(0);
      // the schema's own box: #inputSchema also holds the query map's pane
      ["#schemaDocument", "#inputData", "#outputSchema", "#bindings1", "#staticVars"].forEach(sel => {
        expect($(sel + " .shexjs-editor-pane").length, sel + " pane").to.equal(1);
      });
    });

    /* Inventory row 6, and the first contribution to move: the bindings
     * pane's colours were three rules in each map page's <style>, and are
     * now one descriptor the page registers (doc/plugins.md). */
    it("should take its pane colours from the plugin, not from the page", function () {
      const sheet = $("head style[data-plugin]");
      expect(sheet.length, "the register put a sheet on the page").to.equal(1);
      expect(sheet.attr("data-plugin"), "whose").to.equal("http://shex.io/extensions/Map/#");
      expect($("#bindings1 textarea").first().css("background-color"),
             "and the bindings pane wears its colour").to.equal("rgb(255, 255, 244)");
      expect($("#inputarea").css("overflow-x"),
             "a map app's inputs scroll where a validator's overflow").to.equal("auto");
      expect(dom.window.ShExPlugins.all().map(e => e.label)).to.deep.equal(["ShExMap"]);
    });

    /* Inventory rows 1-3, and the second contribution to move: bindings,
     * static variables and the output schema were markup in each map page
     * plus caches and parameter entries in ShExMapBaseApp, and are now three
     * pane declarations.  The page supplies the slot; the plugin says
     * what goes in it and the base app makes all four parts agree. */
    it("should build its panes from the plugin, not from the page", function () {
      const screen = $("#screens > .screen[data-plugin]");
      expect(screen.length, "one screen for the one plugin").to.equal(1);
      expect(screen.attr("data-plugin")).to.equal("http://shex.io/extensions/Map/#");
      expect(screen.find(".panel > div[id]").map((_, elt) => elt.id).get(), "in declared order")
        .to.deep.equal(["bindings1", "staticVars", "outputSchema"]);
      // two columns, the layout the map page had: bindings and statics
      // share one, the output schema declared a `panel` of its own
      expect(screen.children(".screenColumns").children(".panel").length, "two columns")
        .to.equal(2);
      /* A screen is stretched to what holds it rather than asking for its
       * height, so what is under its panes -- the toolbar, the statusbar --
       * lands on the foot of the screen rather than under the panes. */
      expect($("#screens").css("display"), "the screens are a column").to.equal("flex");
      expect($("#inputarea > #screens").css("flex"), "taking the middle")
        .to.include("1 1");
      expect(screen.css("flex"), "and the screen showing takes that")
        .to.include("1 1");
      expect(screen.children().last().hasClass("pluginToolbar")
             || screen.children().last().hasClass("pluginStatusbar"),
             "with the controls at the foot of it").to.equal(true);

      /* ...and they fill the screen the way the validator's columns fill
       * the page: the column shares its height among its panes, and each
       * pane's document takes what its pane has left. */
      const columns = screen.children(".screenColumns");
      expect(columns.css("flex"), "the row takes what the controls leave")
        .to.include("1 1");
      expect(columns.children(".panel").first().css("display"), "a column of panes")
        .to.equal("flex");
      // ...and they share it in the proportion they asked for: the bindings
      // pane declared 19 rows and the statics 5, so the column is 19:5
      expect($("#bindings1").css("flex-grow"), "the bindings pane's share")
        .to.equal("19");
      expect($("#staticVars").css("flex-grow"), "and the statics'").to.equal("5");
      expect($("#bindings1").css("flex-basis"), "shares, not content sizes")
        .to.equal("0px");
      expect($("#outputSchema").css("flex-grow"), "alone in its column, and still asking")
        .to.equal("25");
      expect($("#bindings1 textarea, #bindings1 .shexjs-editor-pane").first().css("flex"),
             "and the document taking the pane").to.include("1 1");
      expect($("#outputSchema").closest(".panel").attr("data-panel"),
             "the output schema in its own").to.equal("output");
      expect($("#bindings1 textarea").first().attr("rows"), "as tall as it asked")
        .to.equal("19");
      expect($("#staticVars textarea").first().hasClass("vars"),
             "wearing the class it asked for").to.be.true;
      // a declaration makes four things that have to agree: the cache, the
      // pane over it, the query parameter and the manifest key that fill it
      expect(Object.keys(shared.Caches))
        .to.include.members(["bindings", "statics", "outputSchema"]);
      const parms = shared.app.QueryParams.filter(
        p => ["bindings", "statics", "outSchema"].includes(p.queryStringParm));
      expect(parms.map(p => p.queryStringParm))
        .to.deep.equal(["bindings", "statics", "outSchema"]);
      expect(parms.map(p => p.manifest && p.manifest.key), "bindings are a product")
        .to.deep.equal([undefined, "staticVars", "outputSchema"]);
    });

    /* §4: a plugin's panes are a screen of their own, and the switch
     * between screens stands where the page title stood.  Every other test
     * in this file runs with the map's screen *hidden* -- the panes still
     * fill from the manifest, the bindings still fill from a validation,
     * ctl-\ still materializes -- which is the rule that hiding is display
     * and nothing else. */
    it("should stand a screen switch where the title stood", function () {
      const tabs = $("#screenTabs");
      expect(tabs.length, "the tabs are in the title bar").to.equal(1);
      expect(tabs.css("display"), "and showing").to.not.equal("none");
      // it stands in for the part of the title that named what is showing;
      // the rest of the heading stays, and says what the page is
      expect($("#title h1").css("display"), "the heading stays").to.not.equal("none");
      expect($("#title h1").text(), "with its name in it").to.include("ShEx");
      expect($("#title h1 .screenName").css("display"), "and the switch in the rest's place")
        .to.equal("none");
      expect(tabs.find("button").first().text(), "which is what the first tab says")
        .to.equal("Validator"); // and no ×: the validator is the page, not a guest
      expect(tabs.find("button").map((i, b) => $(b).attr("data-screen")).get())
        .to.deep.equal(["", "http://shex.io/extensions/Map/#"]);
      expect(tabs.find("button").last().find(".screenTabLabel").text()).to.equal("ShExMap");
      expect(tabs.find("button").last().find(".unloadPlugin").length,
             "and an × to unload it by").to.equal(1);
      expect(tabs.find("button[aria-selected='true']").attr("data-screen"),
             "the validator's is the one pressed").to.equal("");
      expect($("#screens > .screen").css("display"), "and the map's is away").to.equal("none");
    });

    it("should switch screens without unloading the one that hides", function () {
      $("#screenTabs button[data-screen='http://shex.io/extensions/Map/#']").trigger("click");
      expect($("#inputSchema").css("display"), "the schema panel went away").to.equal("none");
      expect($("#screens > .screen").css("display"), "the map's screen is up")
        .to.not.equal("none");
      $("#screenTabs button[data-screen='']").trigger("click");
      expect($("#inputSchema").css("display"), "and back").to.not.equal("none");
      expect($("#screens > .screen").css("display")).to.equal("none");
    });

    /* Screens are what you are working on; the results are what came of
     * it, and they belong to the app rather than to any one screen -- a
     * materialization's tab sits beside a validation's whichever screen is
     * showing, in the same place at the bottom of the page. */
    /* The tab is called "materialization"; a line over the results saying
     * "materialization results" said it twice.  What ShExMap has to say
     * about a particular materialization -- which alternative, that it was
     * stepped through -- it says inside that tab. */
    it("should say what it has to say inside its own tab", async function () {
      $("#screenTabs button[data-screen='']").trigger("click");
      $("#validate").trigger("click");
      await shared.promise;
      $("#materialize").trigger("click");
      await shared.promise;

      expect($("#results > .status").css("display"), "nothing over the results")
        .to.equal("none");
      expect($("#materializationResults > .status").length,
             "the tab has a line of its own to use").to.equal(1);
      expect($("#materializationResults > .status").text(),
             "and says nothing the tab label says").to.not.include("materialization results");
    });

    it("should keep the results below, across screens", async function () {
      $("#screenTabs button[data-screen='']").trigger("click");
      $("#validate").trigger("click");
      await shared.promise;
      $("#materialize").trigger("click");
      await shared.promise;
      const tabs = () => $("#resultsTabs > ul > li > a").map((i, a) => $(a).text()).get();
      expect(tabs(), "both kinds of result").to.deep.equal(["validation", "materialization"]);

      $("#screenTabs button[data-screen='http://shex.io/extensions/Map/#']").trigger("click");
      expect($("#results").css("display"), "still showing").to.not.equal("none");
      expect($("#results").prev().attr("id"), "still under the inputs, past the handle")
        .to.equal("resultsGrip");
      expect($("#resultsGrip").prev().attr("id")).to.equal("inputarea");
      expect($("#results").closest("#screens, .screen").length, "and in no screen").to.equal(0);
      expect(tabs(), "with both tabs still in it").to.deep.equal(["validation", "materialization"]);
      $("#screenTabs button[data-screen='']").trigger("click");
      expect(tabs(), "and back").to.deep.equal(["validation", "materialization"]);
    });

    it("should carry the screen in the permalink", async function () {
      $("#screenTabs button[data-screen='http://shex.io/extensions/Map/#']").trigger("click");
      const parms = (await shared.app.getPermalink()).split(/[?&]/);
      expect(parms).to.include(
        "screen=" + encodeURIComponent("http://shex.io/extensions/Map/#"));
      $("#screenTabs button[data-screen='']").trigger("click");
      const back = (await shared.app.getPermalink()).split(/[?&]/);
      expect(back.filter(p => p.startsWith("screen=")), "the default rides free")
        .to.deep.equal([]);
    });

    it("should load a picked manifest entry's materialization inputs", async function () {
      // the default ../examples/manifest.json painted the schema list at boot
      const schemaLi = $("#inputSchema .manifest li").filter((_, elt) => $(elt).text() === "BP");
      expect(schemaLi.length, "BP manifest entry").to.equal(1);
      schemaLi.trigger("click");
      await shared.promise; // pickSchema paints the data list
      const dataLi = $("#inputData .passes li").filter((_, elt) => $(elt).text() === "simple");
      expect(dataLi.length, "BP simple data entry").to.equal(1);
      dataLi.trigger("click");
      await shared.promise; // pickData -> queryMapLoaded + loadExtraInputs

      expect($("#outputSchema textarea").first().val(), "fetched via relative outputSchemaURL")
        .to.include("<BPunitsDAM>");
      expect(JSON.parse($("#staticVars textarea").first().val()))
        .to.deep.equal({"http://abc.example/someConstant": "\"123-456\""});
      expect($("#outputShapeMap").val()).to.equal("<tag:b0>@<BPunitsDAM>");
    });

    /* Two kinds of results, a tab each: materializing doesn't overwrite (or
     * pile onto) the validation whose bindings it consumed, and validating
     * again takes the materialization away, since it was about bindings
     * that no longer exist. */
    it("should keep validation and materialization results in their own tabs", async function () {
      this.timeout(60000);
      if (!$("#queryMap").val().trim()) {   // a preceding test may have deselected
        $("#inputSchema .manifest li").filter((_, e) => $(e).text() === "BP").trigger("click");
        await shared.promise;
        $("#inputData .passes li").filter((_, e) => $(e).text() === "simple").trigger("click");
        await shared.promise;
      }
      const tabs = () => $("#resultsTabs > ul > li > a").map((i, a) => $(a).text()).get();
      const panes = sel => ({json: $(sel + " .shexjs-json-pane").length,
                             turtle: $(sel + " .shexjs-turtle-pane").length});

      $("#interface").val("appinfo").trigger("change");
      $("#validate").trigger("click");
      await shared.promise;
      expect(tabs(), "nothing has been materialized yet").to.deep.equal(["validation"]);
      expect(panes("#validationResults").json, "the validation's JSON").to.equal(1);

      $("#materialize").trigger("click");
      await shared.promise;
      expect(tabs(), "and now there is one").to.deep.equal(["validation", "materialization"]);
      // the materialized graph is its own tab's business...
      expect(panes("#materializationResults")).to.deep.equal({json: 0, turtle: 1});
      // ...and the validation is still there, rendered once, not twice
      expect(panes("#validationResults")).to.deep.equal({json: 1, turtle: 0});
      expect($("#materializationResults").css("display"), "showing what was just made")
        .to.not.equal("none");

      // a materialized graph is data, so it wears the data colour
      const holder = $("#materializationResults div.data");
      expect(holder.length, "the graph sits in a data-coloured holder").to.be.above(0);
      expect(holder.css("background-color"), "the data green, not the results tint")
        .to.equal("rgb(244, 255, 244)");

      $("#validate").trigger("click");
      await shared.promise;
      expect(tabs(), "the bindings it came from are gone, so it goes").to.deep.equal(["validation"]);
      expect(panes("#materializationResults"), "and takes its pane with it")
        .to.deep.equal({json: 0, turtle: 0});
      expect(panes("#validationResults").json, "the new validation").to.equal(1);
    });

    it("should step through a materialization with a gutter breakpoint", async function () {
      const set = (selector, value) => {
        const elt = $(selector).first();
        elt.val(value);
        elt.trigger("change");
      };
      set("#outputSchema textarea", outputSchemaText);
      set("#bindings1 textarea", bindingsJson);
      $("#outputShapeMap").val("<tag:root>@<http://a.example/S>");

      // a gutter breakpoint on the :q constraint's line
      const pane = shared.Caches.editorSupport.panes.outputSchema;
      pane.toggleBreakpoint(outputSchemaText.indexOf(":q ."));

      $("#debugMaterialize").trigger("click");
      const session = await shared.promise;
      expect(session, "debug session started: " + $("#results").text().substring(0, 120)).to.exist;
      expect($("#debugPanel").css("display")).not.to.equal("none");
      // laid out like the validator's: steps beside the button that started
      // them, status on its own row, and 🐞 stands down meanwhile
      expect($("#dbgStatusRow").css("display"), "the status row").to.not.equal("none");
      expect($("#debugMaterialize").css("display"), "the bug button").to.equal("none");
      expect($("#dbgContinue").closest("#dbgStatusRow").length, "steps are not in the status row").to.equal(0);
      expect($("#dbgStatus").closest("#dbgStatusRow").length, "the status is").to.equal(1);

      // step into: pauses at :p (the first constraint)
      $("#dbgInto").trigger("click");
      expect($("#dbgStatus").text()).to.include("at <http://a.example/p>");

      // continue: runs to the :q breakpoint
      $("#dbgContinue").trigger("click");
      expect($("#dbgStatus").text()).to.include("at <http://a.example/q>");
      expect($("#dbgStatus").text()).to.include("consumed:1"); // :v1 already bound

      // continue to completion: the session ends, the floating panel is put
      // away, and the finished graph -- a materialization's real answer --
      // renders in the results
      $("#dbgContinue").trigger("click");
      expect(shared.app.debugSession, "the session ran to the end").to.not.exist;
      expect($("#debugPanel").css("display"), "the panel is put away on completion").to.equal("none");
      expect($("#debugMaterialize").css("display"), "and 🐞 is offered again").to.not.equal("none");
      expect($("#results").text()).to.include('"one"');
      expect($("#results").text()).to.include('"two"');
    });

    /* #outactions floats right so the buttons sit at the panel's edge, and
     * its wrapper held nothing else -- so the wrapper collapsed to no height,
     * the float escaped it, and the next thing in the page laid out over the
     * buttons.  jsdom does no layout, so what is checkable here is the shape
     * that avoids it: the float has a container that establishes a block
     * formatting context. */
    /* Inventory rows 4 and 5, the third contribution to move: the row of
     * controls was markup in both map pages and click handlers in
     * ShExMapBaseApp.prepareControls, and is now `toolbar` in the
     * descriptor.  It builds into the plugin's own screen, under the panes
     * it consumes. */
    it("should keep the materialize buttons inside a box that contains them", function () {
      const row = $("#screens .screen[data-plugin] > .pluginToolbar");
      expect(row.length, "the toolbar has a wrapper").to.equal(1);
      expect(row.find(".pluginToolbarInner").length, "which holds it").to.equal(1);
      expect(row.css("display"), "a block formatting context contains its floats")
        .to.equal("flow-root");
      // and the float is styled from the sheet, not from an inline style
      // that only this page would carry
      expect(row.find(".pluginToolbarInner").attr("style") || "", "no inline float")
        .to.not.include("float");
      expect(row.find(".pluginToolbarInner").css("float")).to.equal("right");
      ["#materialize", "#debugMaterialize", "#outputShapeMap"].forEach(sel => {
        expect($(sel).length, sel).to.equal(1);
        expect($(sel).closest(".pluginToolbarInner").length, sel + " is in the row").to.equal(1);
      });
      // the step controls, status and threads are the app's *shared* debug
      // strip (core, shared with the validation debugger -- one panel, one
      // engine at a time), not generated here: they live outside the plugin
      // toolbar and wait hidden until a session starts
      expect($("#debugPanel").css("display"), "the shared controls wait hidden").to.equal("none");
      expect($("#debugControls").closest(".pluginToolbarInner").length,
             "the strip is the app's own, not in the plugin toolbar").to.equal(0);
      expect($("#dbgStatus").closest("#debugControls").length, "the status is its own row").to.equal(0);
    });

    /* Two of ShExMap's verbs are only a keystroke, so nothing else on the
     * page notices when they stop working: ctl-\\ is the materialize button,
     * and ctl-[ / ctl-] swap the bindings pane for a table of the same
     * bindings and back.  The table is the only reader those bindings have
     * that isn't the pane itself. */
    it("should reach materialize on ctl-\\ and the bindings table on ctl-[ / ctl-]", async function () {
      this.timeout(60000);
      const key = k => dom.window.document.body.dispatchEvent(
        new dom.window.KeyboardEvent("keydown", {key: k, ctrlKey: true, bubbles: true}));

      if (!$("#queryMap").val().trim()) {   // a preceding test may have deselected
        $("#inputSchema .manifest li").filter((_, e) => $(e).text() === "BP").trigger("click");
        await shared.promise;
        $("#inputData .passes li").filter((_, e) => $(e).text() === "simple").trigger("click");
        await shared.promise;
      }
      $("#validate").trigger("click");
      await shared.promise;

      // the key runs the verb rather than pressing the button, so this
      // counts the verb: one declaration, and both ways in reach it
      const app = shared.app, real = app.materialize.bind(app);
      let ran = 0;
      app.materialize = () => { ++ran; return real(); };
      try {
        key("\\");
        await shared.promise;
        expect(ran, "ctl-\\ runs materialize").to.equal(1);
        expect($("#resultsTabs > ul > li > a").map((i, a) => $(a).text()).get(),
               "and materializing shows in the tabs").to.deep.equal(["validation", "materialization"]);
        $("#materialize").trigger("click");
        await shared.promise;
        expect(ran, "and so does the button").to.equal(2);
      } finally {
        app.materialize = real;
      }

      // the table is built from whatever the pane holds
      const pane = $("#bindings1 textarea").first();
      pane.val(bindingsJson);
      key("[");
      expect($("#bindings1 table thead th").map((i, th) => $(th).text()).get(),
             "a column per variable").to.include("http://a.example/v1");
      expect($("#bindings1 table tbody tr").length, "a row per binding").to.be.above(0);
      // jsdom lays nothing out, so :visible is no help; hide() writes the
      // inline style this reads
      expect(pane.css("display"), "the textarea steps aside").to.equal("none");

      key("]");
      expect($("#bindings1 table").length, "and comes back").to.equal(0);
      expect(pane.css("display"), "with the textarea in front again").to.not.equal("none");
    });

    it("should stop a session on demand", async function () {
      $("#debugMaterialize").trigger("click");
      await shared.promise;
      $("#dbgInto").trigger("click");
      $("#dbgStop").trigger("click");
      expect($("#debugPanel").css("display")).to.equal("none");
      expect(shared.Caches.editorSupport.panes.outputSchema, "pane survives").to.exist;
    });

    // both OneOf disjuncts viable -> two accepting threads -> the
    // materialization is ambiguous and the app offers the alternatives
    const ambiguousSchemaText = [
      "PREFIX : <http://a.example/>",
      "PREFIX Map: <http://shex.io/extensions/Map/#>",
      "start = @:Card",
      ":Card {",
      "  :fullName . %Map:{ :name %} ;",
      "  ( :phone . %Map:{ :tel %} |",
      "    :mbox . %Map:{ :email %} )",
      "}",
    ].join("\n");
    const ambiguousBindings = JSON.stringify({
      "http://a.example/name": {value: "Bob"},
      "http://a.example/tel": {value: "+1"},
      "http://a.example/email": {value: "bob@x"},
    });

    it("should list threads while stepping and offer viable alternatives at completion", async function () {
      const set = (selector, value) => {
        const elt = $(selector).first();
        elt.val(value);
        elt.trigger("change");
      };
      set("#outputSchema textarea", ambiguousSchemaText);
      set("#bindings1 textarea", ambiguousBindings);
      $("#outputShapeMap").val("<tag:card>@<http://a.example/Card>");

      $("#debugMaterialize").trigger("click");
      await shared.promise;
      $("#dbgInto").trigger("click"); // at :fullName
      $("#dbgInto").trigger("click"); // at :phone; the mbox disjunct is pending
      expect($("#dbgThreads button").length, "pending threads listed").to.be.above(0);
      // the list lives in its own row of the shared debug strip, not in the
      // right-floating controls: a thread appearing or dying there changed
      // the width of the block the step buttons sit in and moved them out
      // from under the mouse (the strip is core now, shared with the
      // validation debugger, so this row is #dbgThreadsRow rather than the
      // plugin statusbar it used to generate)
      expect($("#dbgThreads").closest("#debugControls").length, "not in the controls").to.equal(0);
      expect($("#dbgThreads").closest("#dbgThreadsRow").length, "on a row of its own").to.equal(1);
      $("#dbgThreads button").first().trigger("mouseenter"); // partial preview
      // ...and that preview is written the way the finished graph is.  A
      // thread paused halfway cannot be validated against the output schema
      // -- not satisfying it yet is what "partial" means -- but the nesting
      // needs none of that, and this used to be a flat N3.Writer dump.
      const partial = $("#results .data").last().data("rawText");
      expect(partial, "the partial graph rendered").to.be.a("string");
      expect(partial, "the nested writer's prefixes, not N3's @prefix")
        .to.match(/^PREFIX /m);
      expect(partial).to.not.include("@prefix");
      expect($("#results").text()).to.include("thread");
      // ... including the thread's private view of the binding tree
      expect($("#results").text()).to.include("binding tree");
      expect($("#results").text()).to.match(/frame 0:.*:name ✓/);

      $("#dbgContinue").trigger("click"); // to completion
      // the panel is put away on completion; the "viable" tally is the
      // rendered result's now (the last word is the graph, not a status line)
      expect($("#debugPanel").css("display")).to.equal("none");
      expect($("#results").text()).to.include("2 viable materializations");
      expect($("#results").text()).to.include('"+1"'); // chosen: first disjunct

      // pick the other accepted thread
      // at the right-hand end of the tab strip, out of the flow: it is
      // about the results, and putting it in with them pushed them down
      const aside = $(".resultsTabsAside");
      expect(aside.find(".dbgAlternatives").length, "in the strip's own corner")
        .to.equal(1);
      expect(aside.closest("#resultsTabs").length).to.equal(1);
      expect(aside.css("position"), "out of the flow").to.equal("absolute");
      expect(aside.css("right"), "at the right-hand end").to.not.equal("auto");
      // ...and as wide as what it says: #results' own rule makes every div
      // in there 99% wide, and a 99%-wide box anchored right puts its text
      // at the left, over the tabs it is supposed to sit beside
      expect(aside.css("width"), "not the width of the strip").to.not.equal("99%");
      expect($(".dbgAlternatives").closest("#materializationResults").length,
             "and not among the results it is about").to.equal(0);
      $("#results .dbgAlternatives button").last().trigger("click");
      expect($("#results").text()).to.include('"bob@x"');
      expect($("#results").text()).to.include("2 viable materializations"); // chooser re-rendered
    });

    it("should offer the alternatives after a plain materialize too", async function () {
      $("#materialize").trigger("click");
      await shared.promise;
      expect($("#results").text()).to.include("2 viable materializations");
      expect($("#results").text()).to.include('"+1"');
    });

    it("should record the shexmap inputs (but not bindings) in a created gist", async function () {
      dom.window.localStorage.setItem("githubGistToken", "test-token");
      dom.window.prompt = () => "shexmap gist";
      let postedBody;
      nock("https://api.github.com")
        .post("/gists", body => { postedBody = body; return true })
        .reply(201, {id: "abc123", url: "https://api.github.com/gists/abc123",
                     html_url: "https://gist.github.com/tester/abc123", owner: {login: "tester"}})
        .patch("/gists/abc123", () => true)
        .reply(200, {history: [{version: "sha-2"}]});
      try {
        $("#createGist").trigger("click");
        const search = await shared.promise;
        expect(search, "createGist's post-create reload target").to.include("manifestURL=");
      } finally {
        nock.cleanAll();
      }
      const manifest = postedBody.files[".manifest.yaml"].content;
      expect(manifest).to.include("- schemaLabel: schema\n");
      expect(manifest).to.include("  queryMap: ");
      // ... plus the shexmap-specific inputs, still holding the ambiguous
      // example from the preceding tests
      expect(manifest).to.include("  outputSchema: |\n    PREFIX : <http://a.example/>\n");
      expect(manifest).to.include('  outputShapeMap: "<tag:card>@<http://a.example/Card>"\n');
      // the BP statics picked from the examples manifest, recorded back out
      expect(manifest).to.include('  staticVars:\n    "http://abc.example/someConstant": "\\"123-456\\""\n');
      expect(manifest).to.include("  status: ");
      // bindings are a validation product (a manifest's expectedBindings
      // records them for testing), not a gist input
      expect(manifest).not.to.match(/bindings/i);
    });

    it("should render the materialized graph in a Turtle pane sized to the window", async function () {
      const set = (selector, value) => {
        const elt = $(selector).first();
        elt.val(value);
        elt.trigger("change");
      };
      set("#outputSchema textarea", outputSchemaText);
      set("#bindings1 textarea", bindingsJson);
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
      expect($("#results").text()).to.include('"one"');
    });

    it("should tie each materialized triple to its constraint and binding", async function () {
      // the rendering comes with the mapping: #results is live DOM that a
      // debounced pane edit can clear (copyQueryMapToEditMap), and these
      // ranges only mean anything against the text they were mapped onto
      const [{pairs, text: resultText}] = shared.Caches.editorSupport.lastMaterialized;
      expect(pairs.length, "one pair per generated triple").to.equal(2);

      const schemaText = $("#outputSchema textarea").first().val();
      const bindingsText = $("#bindings1 textarea").first().val();
      const at = (text, range) => text.substring(range.from, range.to);

      const one = pairs.find(p => p.variables.indexOf("http://a.example/v1") !== -1);
      expect(one, "the triple carrying :v1's binding").to.exist;
      // ... anchored on the constraint that synthesized it ...
      expect(at(schemaText, one.schema)).to.include(":p .");
      expect(at(schemaText, one.schema)).to.include("Map:{ :v1 %}");
      // ... on its object in the rendered Turtle ...
      expect(at(resultText, one.anchors.object)).to.equal('"one"');
      // ... and on the binding it read
      expect(one.statics).to.equal(false);
      expect(bindingsText.substring(
        bindingsText.indexOf('"http://a.example/v1"'))).to.include('"one"');

      const two = pairs.find(p => p.variables.indexOf("http://a.example/v2") !== -1);
      expect(at(schemaText, two.schema)).to.include(":q .");
      expect(at(resultText, two.anchors.object)).to.equal('"two"');
    });

    // End to end on the examples manifest's deepest entry: validate to get
    // bindings, materialize, and check every anchor.  The app renders the
    // PROOF graph, whose triple order is the validator's rather than the
    // materializer's, so pairing blank nodes by first fit bound a reading to
    // a sibling's -- undetectably, since every reading repeats :units "mmHg",
    // while its distinct :value simply stopped highlighting.
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
      await shared.promise; // bindings come from the validation
      expect($("#bindings1 textarea").first().val(), "validation populated the bindings")
        .to.include("BPDAM-sysVal");

      $("#materialize").trigger("click");
      await shared.promise;
      const [{pairs, text: resultText}] = shared.Caches.editorSupport.lastMaterialized;
      // Nested, which is the whole point of rendering it this way: a blank
      // node's arc has to reach the writer before the triples hanging off
      // it, and both render paths used to pass the quads through an
      // N3.Store, whose getQuads() answers in index order.  What came out
      // was `fhir:subject []` with the subject's triples stranded below.
      expect(resultText, "the subject nests under the report").to.match(/fhir:subject \[\n/);
      expect(resultText, "no empty stand-ins").to.not.include("[]");
      expect(resultText, "and nothing stranded at the top level").to.not.match(/^_:/m);
      // four readings, all shaped alike, with distinct values
      ["100", "60", "101", "61", "110", "70", "111", "71"].forEach(v =>
        expect(resultText, "rendered " + v).to.include('"' + v + '"'));

      // every anchor lands on its own triple's object ...
      const unanchored = pairs.filter(p => !p.anchors.object);
      expect(unanchored.map(p => p.quad.predicate.value), "all anchored").to.deep.equal([]);
      pairs.forEach(p => {
        if (p.quad.object.termType !== "Literal")
          return;
        const got = resultText.substring(p.anchors.object.from, p.anchors.object.to);
        expect(got, p.quad.predicate.value + " anchor")
          .to.include(p.quad.object.value);
      });
      // ... and no two triples claim the same span
      const spots = pairs.map(p => p.anchors.object.from);
      expect(new Set(spots).size, "distinct anchors").to.equal(spots.length);

      // the tell-tale: each reading's :units must sit in the same blank node
      // as its own :value, i.e. between that value and the next one
      const fhir = "http://hl7.org/fhir-rdf/";
      const values = pairs.filter(p => p.quad.predicate.value === fhir + "value")
            .sort((a, b) => a.anchors.object.from - b.anchors.object.from);
      const units = pairs.filter(p => p.quad.predicate.value === fhir + "units")
            .sort((a, b) => a.anchors.object.from - b.anchors.object.from);
      expect(values.length).to.equal(8);
      expect(units.length).to.equal(8);
      values.forEach((value, i) => {
        // the i'th :units follows the i'th :value and precedes the next
        expect(units[i].anchors.object.from, "units " + i + " follows its value")
          .to.be.above(value.anchors.object.to);
        if (values[i + 1])
          expect(units[i].anchors.object.to, "units " + i + " precedes the next value")
            .to.be.below(values[i + 1].anchors.object.from);
        // and both belong to the same generated blank node
        expect(units[i].quad.subject.value, "units " + i + "'s subject")
          .to.equal(value.quad.subject.value);
      });
    });
    /* Which binding a triple came from, said exactly.
     *
     * The materializer flattens the binding tree into frames, and the two do
     * not line up: a binding written once beside a list of repeated groups
     * is distributed into every frame those groups produce.  So counting
     * occurrences of a variable in the text and calling the nth one "frame
     * n" is wrong wherever it matters -- which is exactly the tree this
     * entry has, one bp:name over four readings. */
    it("should point at the binding a triple actually read, not the nth one", async function () {
      this.timeout(60000);
      // its own setup: this asserts about a materialization, and depending on
      // the one a previous test left behind makes it fail when run alone
      // ...idempotently: clicking a schema that is already chosen unpicks it
      const pick = async (selector, label) => {
        const li = $(selector).filter((_, elt) => $(elt).text() === label);
        expect(li.length, label + " in " + selector).to.equal(1);
        if (li.hasClass("selected"))
          return;
        li.trigger("click");
        await shared.promise;
      };
      await pick("#inputSchema .manifest li", "BPPatient 2 levels");
      await pick("#inputData .passes li", "simple");
      $("#validate").trigger("click");
      await shared.promise;
      $("#materialize").trigger("click");
      await shared.promise;

      const app = shared.app;
      const bindingsText = $("#bindings1 textarea").first().val();
      const at = range => bindingsText.substring(range.from, range.to);

      expect(app.bindingOrigins, "the materializer said where each binding was written")
        .to.be.an("array");
      const frames = app.bindingOrigins.length;
      expect(frames, "several frames").to.be.above(1);

      // a variable in every frame, written once: the distributed case
      const distributed = Object.keys(app.bindingOrigins[0]).find(v =>
        app.bindingOrigins.every(o => o && o[v]) &&
        new Set(app.bindingOrigins.map(o => o[v].join(" "))).size === 1);
      expect(distributed, "a binding shared by every frame").to.exist;

      // it is one place in the text, whichever frame asks
      const perFrame = app.bindingOrigins.map((_, f) =>
        app.bindingRanges(bindingsText, distributed, f).map(at).join("|"));
      expect(new Set(perFrame).size, "one written binding, one answer").to.equal(1);
      expect(perFrame[0], "the variable and the value under it")
        .to.include(distributed.replace(/^.*[/#]/, ""));
      expect(app.bindingRanges(bindingsText, distributed, 0).length,
             "the name and the value, not just the key").to.equal(2);

      // The case that makes this more than tidying: a binding written fewer
      // times than there are frames, but more than once -- bp:reports here,
      // one per report, read by the systolic frame and the diastolic frame
      // alike.  Counting occurrences sends frame 1 to the *second* report.
      const shared_ = Object.keys(app.bindingOrigins[0]).find(v => {
        const places = new Set();
        app.bindingOrigins.forEach(o => { if (o && o[v]) places.add(o[v].join(" ")); });
        return places.size > 1 && places.size < frames;
      });
      expect(shared_, "a binding read by more frames than it is written").to.exist;

      const exact0 = app.bindingRanges(bindingsText, shared_, 0).map(r => r.from);
      const exact1 = app.bindingRanges(bindingsText, shared_, 1).map(r => r.from);
      expect(exact1, "frames 0 and 1 read the same written binding").to.deep.equal(exact0);

      const guess1 = app.variableRanges(bindingsText, shared_, 1).map(r => r.from);
      expect(guess1, "which counting occurrences got wrong").to.not.deep.equal(exact1);
      // ...and the exact one is really where that binding is written
      expect(at(app.bindingRanges(bindingsText, shared_, 1)[0]))
        .to.equal(JSON.stringify(shared_));

      // and a variable that really is written once per frame gets a
      // different place for each
      const perFrameVar = Object.keys(app.bindingOrigins[0]).find(v =>
        app.bindingOrigins.every(o => o && o[v]) &&
        new Set(app.bindingOrigins.map(o => o[v].join(" "))).size === frames);
      if (perFrameVar) {
        const spots = app.bindingOrigins.map((_, f) =>
          app.bindingRanges(bindingsText, perFrameVar, f).map(r => r.from).join(","));
        expect(new Set(spots).size, perFrameVar + " is written once per frame")
          .to.equal(frames);
      }
    });

    /* Triples exist from the moment each is emitted -- the arc into a nested
     * shape before the shape is entered -- so stepping should show them as
     * they appear.  Nothing drew them until the session ended or the reader
     * hovered a thread button, so stepping through a shape showed no output
     * until the shape was finished. */
    it("should show the graph as it is built, not only when the shape closes", async function () {
      this.timeout(60000);
      // a nested schema, so "before the shape closes" is a real interval:
      // the little :p/:q one in this describe finishes in two steps
      const pick = async (selector, label) => {
        const li = $(selector).filter((_, elt) => $(elt).text() === label);
        expect(li.length, label + " in " + selector).to.equal(1);
        if (li.hasClass("selected"))
          return;
        li.trigger("click");
        await shared.promise;
      };
      await pick("#inputSchema .manifest li", "BPPatient 2 levels");
      await pick("#inputData .passes li", "simple");
      $("#validate").trigger("click");
      await shared.promise;

      $("#debugMaterialize").trigger("click");
      await shared.promise;
      const app = shared.app;
      try {
        const rendered = () => {
          const panes = app.materializationPanes || [];
          return panes.length ? panes[panes.length - 1].text : "";
        };
        // a few steps in, while the session is very much still going
        for (let i = 0; i < 4 && app.debugSession; ++i)
          $("#dbgInto").trigger("click");
        expect(app.debugSession, "the session is still going").to.exist;
        // the thread being stepped is off the worklist while it is stepped,
        // so a debugger paused inside it used to find no thread at all --
        // which is why nothing was drawn and no button appeared for the one
        // thread the reader was watching
        const [current] = app.debugSession.dbg.threads();
        expect(current, "the thread this step was about").to.exist;
        expect(current.current, "and it says so").to.equal(true);
        expect(current.emitted, "with the triples it has emitted so far").to.be.above(0);
        expect($("#dbgThreads button").length, "listed, so it can be re-rendered").to.be.above(0);

        const early = rendered();
        expect(early, "the graph is on the page already").to.include("PREFIX");
        expect((app.materializationPanes || []).length, "in a pane of its own").to.be.above(0);
        const shown = (early.match(/\n/g) || []).length;

        // ...and it keeps up as the thread goes on, rather than waiting for
        // the shape to close
        for (let i = 0; i < 8 && app.debugSession; ++i)
          $("#dbgInto").trigger("click");
        expect((rendered().match(/\n/g) || []).length, "still showing the graph")
          .to.be.at.least(shown);
      } finally {
        if (app.debugSession)
          $("#dbgStop").trigger("click");
      }
    });

    /* One materialization, one rendering.  Stepping draws the thread's graph
     * as it grows, so the finished graph has to replace that rather than land
     * beside it -- otherwise running a session to the end left two identical
     * copies in the output data pane, where #materialize leaves one. */
    it("should end with one copy of the graph, not the stepped one plus the finished one", async function () {
      this.timeout(60000);
      const pick = async (selector, label) => {
        const li = $(selector).filter((_, elt) => $(elt).text() === label);
        expect(li.length, label + " in " + selector).to.equal(1);
        if (li.hasClass("selected"))
          return;
        li.trigger("click");
        await shared.promise;
      };
      await pick("#inputSchema .manifest li", "BPPatient 2 levels");
      await pick("#inputData .passes li", "simple");
      $("#validate").trigger("click");
      await shared.promise;

      // what #materialize leaves, for comparison
      $("#materialize").trigger("click");
      await shared.promise;
      const app = shared.app;
      const plain = (app.materializationPanes || []).length;
      expect(plain, "#materialize renders the graph once").to.equal(1);

      // ...and the same session run to the end through the debugger
      $("#debugMaterialize").trigger("click");
      await shared.promise;
      for (let i = 0; i < 400 && app.debugSession; ++i)
        $("#dbgContinue").trigger("click");
      expect(app.debugSession, "the session ran to the end").to.equal(null);
      expect((app.materializationPanes || []).length,
             "one graph, not the stepped one plus the finished one").to.equal(plain);
      // (addResult marks two things `.data`: the shape-map label, which is a
      // span, and the div holding the pane)
      expect($("#results div.data").length, "and one pane holding it").to.equal(plain);
    });

    /* Stepping is watching a graph grow, so the triple just added leads:
     * highlighted and scrolled into view in the output data, with the
     * constraint that made it and the binding it read.  It is a *default* --
     * the mouse overrides it and leaving comes back to it. */
    it("should lead with the triple just added, until the mouse says otherwise", async function () {
      this.timeout(60000);
      const pick = async (selector, label) => {
        const li = $(selector).filter((_, elt) => $(elt).text() === label);
        expect(li.length, label + " in " + selector).to.equal(1);
        if (li.hasClass("selected"))
          return;
        li.trigger("click");
        await shared.promise;
      };
      await pick("#inputSchema .manifest li", "BPPatient 2 levels");
      await pick("#inputData .passes li", "simple");
      $("#validate").trigger("click");
      await shared.promise;

      $("#debugMaterialize").trigger("click");
      await shared.promise;
      const app = shared.app;
      const panes = shared.Caches.editorSupport.panes;
      const painted = {};
      const undo = [];
      try {
        for (let i = 0; i < 6 && app.debugSession; ++i)
          $("#dbgInto").trigger("click");
        expect(app.debugSession, "still stepping").to.exist;

        const watch = (pane, name) => {
          const was = pane.highlight;
          undo.push(() => { pane.highlight = was; });
          pane.highlight = (ranges, cls, opts) => {
            painted[name] = {ranges: (ranges || []).slice(), opts: opts || {}};
            return was.call(pane, ranges, cls, opts);
          };
        };
        watch(panes.outputSchema, "schema");
        watch(panes.bindings, "bindings");
        const resultPanes = shared.Caches.editorSupport.lastMaterialized;
        expect(resultPanes.length, "a rendered graph").to.be.above(0);
        resultPanes.forEach(({pane}, i) => watch(pane, "data" + i));

        // re-arm to catch what it paints by default
        const th0 = app.debugSession.dbg.threads()[0];
        const last = th0.quads.slice(-1)[0];
        // every emitted triple has an anchor: provenance entries name their
        // quad, without which mapMaterialization skips them and a stepping
        // thread's graph links to nothing at all
        expect(resultPanes[0].pairs.length, "a pair per emitted triple")
          .to.equal(th0.quads.length);
        app.setMaterializationHovers(resultPanes, last);

        expect(painted.data0, "the data pane was painted").to.exist;
        expect(painted.data0.ranges.length, "with the triple's ranges").to.be.above(0);
        expect(painted.data0.opts.scroll, "and scrolled to it").to.not.equal(false);
        expect(painted.schema, "the constraint that made it").to.exist;
        expect(painted.schema.ranges.length).to.be.above(0);

        // it is the *last* triple: its object is in the rendered text
        const {text} = resultPanes[0];
        const lastQuad = last;
        const shown = painted.data0.ranges.map(r => text.substring(r.from, r.to)).join(" ");
        if (lastQuad.object.termType === "Literal")
          expect(shown, "the newest triple's object").to.include(lastQuad.object.value);

        // a hover elsewhere overrides it ...
        const before = JSON.stringify(painted.data0.ranges);
        let regions = [];
        const wasSet = panes.outputSchema.setHoverRegions;
        panes.outputSchema.setHoverRegions = (rs, leave) => {
          regions = (rs || []).slice();
          return wasSet.call(panes.outputSchema, rs, leave);
        };
        try {
          app.setMaterializationHovers(resultPanes, lastQuad);
          const other = regions.find(r => {
            painted.data0 = null;
            r.enter();
            return painted.data0 && JSON.stringify(painted.data0.ranges) !== before;
          });
          expect(other, "a constraint whose triples are not the newest one").to.exist;
        } finally {
          panes.outputSchema.setHoverRegions = wasSet;
        }
      } finally {
        undo.forEach(f => f());
        if (app.debugSession)
          $("#dbgStop").trigger("click");
      }
    });

    describe("the highlight switch", function () {
      const mode = () => shared.HighlightMode;
      const key = (type, props) => $(dom.window.document).trigger(
        $.Event(type, Object.assign({key: "Shift"}, props || {})));

      /* ...and that the switch actually governs the paint, and a pin
       * actually freezes it.  The map app's materialization hovers are the
       * richest case: schema, bindings and the rendered graph all at once. */
      it("should paint by the switch, and stop when frozen", async function () {
        this.timeout(60000);
        const pick = async (selector, label) => {
          const li = $(selector).filter((_, elt) => $(elt).text() === label);
          expect(li.length, label + " in " + selector).to.equal(1);
          if (li.hasClass("selected"))
            return;
          li.trigger("click");
          await shared.promise;
        };
        await pick("#inputSchema .manifest li", "BPPatient 2 levels");
        await pick("#inputData .passes li", "simple");
        $("#validate").trigger("click");
        await shared.promise;
        $("#materialize").trigger("click");
        await shared.promise;

        const app = shared.app;
        const panes = shared.Caches.editorSupport.panes;
        const painted = [];
        const was = panes.outputSchema.highlight;
        panes.outputSchema.highlight = (ranges, cls, opts) => {
          painted.push((ranges || []).length);
          return was.call(panes.outputSchema, ranges, cls, opts);
        };
        let regions = [];
        const wasSet = panes.bindings.setHoverRegions;
        panes.bindings.setHoverRegions = (rs, leave) => {
          regions = (rs || []).slice();
          return wasSet.call(panes.bindings, rs, leave);
        };
        try {
          app.setMaterializationHovers(shared.Caches.editorSupport.lastMaterialized);
          expect(regions.length, "bindings to hover").to.be.above(1);

          // off: the mouse paints nothing
          mode().set("off");
          painted.length = 0;
          regions[0].enter();
          expect(painted, "off paints nothing").to.deep.equal([]);

          // on: it paints
          mode().set("on");
          painted.length = 0;
          regions[0].enter();
          expect(painted.length, "on paints").to.be.above(0);

          // held while on: suspended
          painted.length = 0;
          key("keydown");
          regions[1].enter();
          expect(painted, "held suspends the mouse").to.deep.equal([]);
          key("keyup");

          // frozen: a click pins it, and hovering elsewhere leaves it alone
          // the gesture is cmd on a Mac and ctrl elsewhere, and jsdom is
          // neither -- so ask the app which it is rather than guessing
          const evt = {metaKey: shared.PIN_WITH_META, ctrlKey: !shared.PIN_WITH_META};
          expect(shared.isPinGesture(evt), "a pin gesture").to.equal(true);
          expect(shared.isPinGesture({}), "and a bare click is not").to.equal(false);
          expect(regions[0].click, "a binding can be frozen").to.be.a("function");
          // an unmodified click is *not* consumed, so the editor keeps its
          // ordinary caret placement; a pin gesture is, which is what stops
          // the click extending the selection across the pane
          expect(regions[0].click({}), "an ordinary click passes through").to.equal(false);
          expect(regions[0].click(evt), "a pin consumes the event").to.equal(true);
          expect(mode().frozen(), "frozen by the click").to.equal(true);
          painted.length = 0;
          regions[1].enter();
          expect(painted, "and the mouse no longer changes it").to.deep.equal([]);

          // clicking it again releases
          regions[0].click(evt);
          expect(mode().frozen(), "released").to.equal(false);
        } finally {
          panes.outputSchema.highlight = was;
          panes.bindings.setHoverRegions = wasSet;
          mode().unpin();
          mode().setHeld(false);
          mode().set("on");
        }
      });
    });

    /* What #dbgBindingState says, written on the bindings themselves.  The
     * text block says it by frame, which is how the materializer thinks; a
     * reader is looking at the tree they wrote, where one binding can be
     * read by several frames and a frame is not a thing you can point at. */
    it("should mark the bindings a stepping thread has consumed", async function () {
      this.timeout(60000);
      const pick = async (selector, label) => {
        const li = $(selector).filter((_, elt) => $(elt).text() === label);
        expect(li.length, label + " in " + selector).to.equal(1);
        if (li.hasClass("selected"))
          return;
        li.trigger("click");
        await shared.promise;
      };
      await pick("#inputSchema .manifest li", "BPPatient 2 levels");
      await pick("#inputData .passes li", "simple");
      $("#validate").trigger("click");
      await shared.promise;
      // a materialization first, so the origins are known
      $("#materialize").trigger("click");
      await shared.promise;

      const app = shared.app;
      const pane = shared.Caches.editorSupport.panes.bindings;
      expect(pane, "a bindings pane to annotate").to.exist;

      const drawn = [];
      const was = pane.annotate;
      pane.annotate = marks => { drawn.push(marks); return was.call(pane, marks); };
      try {
        $("#debugMaterialize").trigger("click");
        await shared.promise;
        // step until a thread has consumed something
        // the marks and the text block are two renderings of one hover, so
        // take them together or they describe different threads
        const consumedIn = ms => (ms || []).filter(m => m.cls === "shexjs-binding-consumed");
        let marks = null, said = "";
        for (let i = 0; i < 60 && !consumedIn(marks).length; ++i) {
          $("#dbgInto").trigger("click");
          const buttons = $("#dbgThreads button").get();
          for (const b of buttons) {
            drawn.length = 0;
            $(b).trigger("mouseenter");
            const got = drawn.length ? drawn[drawn.length - 1] : null;
            if (consumedIn(got).length || !marks) {
              marks = got;
              said = $(".dbgBindingState").text();
            }
            if (consumedIn(marks).length)
              break;
          }
        }
        expect(marks, "the thread's state was drawn on the bindings").to.be.an("array");
        expect(marks.length, "something marked").to.be.above(0);

        const bindingsText = $("#bindings1 textarea").first().val();
        const consumed = marks.filter(m => m.cls === "shexjs-binding-consumed");
        expect(consumed.length, "at least one binding consumed").to.be.above(0);
        consumed.forEach(m => {
          expect(m.to, "inside the document").to.be.at.most(bindingsText.length);
          expect(m.title, "says which frame consumed it").to.include("frame");
        });
        // the marks land on bindings, not on arbitrary text
        const names = marks.map(m => bindingsText.substring(m.from, m.to));
        expect(names.some(s => s.indexOf("BPDAM-") !== -1), "a variable name is marked")
          .to.equal(true);

        // ...saying what the text block says.  It spells variables as the
        // output schema does (bp:name) and these are the JSON keys they were
        // written as, so the two are compared by what they claim rather than
        // by how they spell it: a tick there, a consumed mark here.
        expect(said, "the text block is still there").to.include("binding tree");
        const ticks = (said.match(/✓/g) || []).length;
        expect(ticks, "the text ticks what the marks mark").to.be.above(0);
        // a binding is marked twice (its name and its value), and a binding
        // consumed in several frames is ticked once per frame, so the two
        // counts are not equal -- what must hold is that neither is empty
        // while the other isn't
        expect(consumed.length, "marks where the text has ticks").to.be.above(0);

        // stopping takes them down
        drawn.length = 0;
        $("#dbgStop").trigger("click");
        expect(drawn[drawn.length - 1], "withdrawn with the session").to.equal(null);
      } finally {
        pane.annotate = was;
      }
    });

    /* Hovering a binding lights up the schema that claimed it and the data
     * it landed in -- the use case this is all for.  A binding read by
     * several frames stands for all of their triples. */
    it("should light up the schema and the data from a hover in the bindings", async function () {
      this.timeout(60000);
      const pick = async (selector, label) => {
        const li = $(selector).filter((_, elt) => $(elt).text() === label);
        expect(li.length, label + " in " + selector).to.equal(1);
        if (li.hasClass("selected"))
          return;
        li.trigger("click");
        await shared.promise;
      };
      await pick("#inputSchema .manifest li", "BPPatient 2 levels");
      await pick("#inputData .passes li", "simple");
      $("#validate").trigger("click");
      await shared.promise;
      $("#materialize").trigger("click");
      await shared.promise;

      const app = shared.app;
      const panes = shared.Caches.editorSupport.panes;
      expect(panes.bindings, "a bindings pane to hover in").to.exist;

      const painted = {schema: null, bindings: null, results: []};
      const spies = [];
      const spy = (pane, where) => {
        const was = pane.highlight;
        spies.push(() => { pane.highlight = was; });
        pane.highlight = (ranges, cls, opts) => {
          if (where === "results") painted.results.push((ranges || []).length);
          else painted[where] = (ranges || []).slice();
          return was.call(pane, ranges, cls, opts);
        };
      };
      spy(panes.outputSchema, "schema");
      spy(panes.bindings, "bindings");
      shared.Caches.editorSupport.lastMaterialized.forEach(({pane}) => spy(pane, "results"));

      const regions = [];
      const wasSet = panes.bindings.setHoverRegions;
      panes.bindings.setHoverRegions = (rs, leave) => {
        regions.length = 0; regions.push(...(rs || []));
        return wasSet.call(panes.bindings, rs, leave);
      };
      try {
        app.setMaterializationHovers(shared.Caches.editorSupport.lastMaterialized);
        expect(regions.length, "the bindings are hoverable").to.be.above(0);
        regions[0].enter();
        expect(painted.schema, "the constraint that claimed it").to.be.an("array");
        expect(painted.schema.length, "schema ranges").to.be.above(0);
        expect(painted.results.some(n => n > 0), "where it landed in the data").to.equal(true);
        expect(painted.bindings.length, "and the binding itself").to.be.above(0);
      } finally {
        panes.bindings.setHoverRegions = wasSet;
        spies.forEach(undo => undo());
      }
    });

  });

  /* E11 (doc/debugger-design.md): worker-app materializer debugging.  The
   * app validates in a worker (app.remote), but the step-through session
   * runs an in-page MaterializerDebugger over the bindings the pane holds --
   * deterministic re-materialization from (outputSchema, bindings,
   * shapeMap), all of which are in-page -- so stepping, breakpoints and the
   * accepted graph work without the debugger state crossing postMessage. */
  describe("shexmap-worker with ?editors=1 (materializer debugging in the worker app)", function () {
    this.timeout(20000);
    const page = "packages/shex-webapp/doc/shex-simple.html";
    const asShExMap = "&plugin=" + encodeURIComponent("../../extension-map/doc/ShExMapPlugin.js")
          + "&manifestURL=" + encodeURIComponent("../../extension-map/examples/manifest.json");
    let dom, $, shared;
    before(async function () {
      ({dom, $, shared} = await Harness.boot(page, "?editors=1&worker=1" + asShExMap, {worker: true}));
    });
    after(function () { if (dom) dom.window.close(); });

    it("should step through a materialization while the app validates in a worker", async function () {
      expect(shared.app.remote, "the app is in worker mode").to.equal(true);
      const set = (selector, value) => { const e = $(selector).first(); e.val(value); e.trigger("change"); };
      set("#outputSchema textarea", outputSchemaText);
      set("#bindings1 textarea", bindingsJson);
      $("#outputShapeMap").val("<tag:root>@<http://a.example/S>");

      const pane = shared.Caches.editorSupport.panes.outputSchema;
      pane.toggleBreakpoint(outputSchemaText.indexOf(":q ."));

      $("#debugMaterialize").trigger("click");
      const session = await shared.promise;
      expect(session, "debug session started in worker mode: " + $("#results").text().substring(0, 120)).to.exist;

      $("#dbgInto").trigger("click");
      expect($("#dbgStatus").text(), "steps into the first constraint").to.include("at <http://a.example/p>");
      $("#dbgContinue").trigger("click");
      expect($("#dbgStatus").text(), "the gutter breakpoint on :q holds").to.include("at <http://a.example/q>");
      expect($("#dbgStatus").text()).to.include("consumed:1");
      $("#dbgContinue").trigger("click");
      // runs to an accept: the session ends, the floating panel is put away,
      // and the materialized graph -- the answer -- renders
      expect($("#debugPanel").css("display"), "the panel is put away").to.equal("none");
      expect($("#results").text(), "and the materialized graph renders").to.include('"one"');
      expect($("#results").text()).to.include('"two"');
    });
  });
}
