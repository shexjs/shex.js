/** Smoke test for the editors (EditorSupport / CodeMirror panes), which are
 * what the app is unless ?editors=textarea says otherwise -- this suite boots
 * the legacy spelling of asking for them, ?editors=1, and the last describe
 * covers the two ends the switch now has.  The app
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
  console.warn("Skipping editors-smoke-tests; to activate these tests, set environment variable TEST_browser=true");
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
  describe("shex-simple with ?editors=1 (the legacy spelling of the default)", function () {
    this.timeout(20000);
    const page = "packages/shex-webapp/doc/shex-simple.html";

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

    /* The other half of doc/extension-ui-plan.md §5: a page that registers
     * no plugin gets nothing from one -- no sheet, and #inputarea keeps
     * what this page says about it. */
    it("should add nothing where no plugin is registered", function () {
      expect($("head style[data-plugin]").length, "no plugin sheets").to.equal(0);
      expect(dom.window.ShExPlugins.all(), "and nothing registered").to.deep.equal([]);
      expect($("#inputarea").css("overflow-x"), "a validator's inputs overflow")
        .to.equal("visible");
      expect($("#screens").length, "no screens are built").to.equal(0);
      expect($("#screenTabs").css("display"), "no tabs to switch by").to.equal("none");
      expect($("#title h1 .screenName").css("display"), "so the title says it all")
        .to.not.equal("none");
      expect($("#title h1").css("display"), "and the page keeps its title")
        .to.not.equal("none");
      expect(Object.keys(shared.Caches).sort(), "so these are the caches")
        .to.deep.equal(["inputData", "inputSchema", "manifest", "plugin", "shapeMap"]);
    });

    /* The page is the window: title, then as much of the middle as is
     * left, then the results at the bottom of it.  #results used to ride up
     * and down with whatever was above it -- the validator's screen has the
     * manifest and the shape map under the schema and a plugin's has
     * neither -- so where you looked for the results depended on which
     * screen you were on.  (jsdom lays nothing out; these are the rules
     * that would do the laying.) */
    it("should pin the results to the bottom and let the panes take the slack", function () {
      const body = $("body");
      expect(body.css("display")).to.equal("flex");
      expect(body.css("flex-direction")).to.equal("column");
      // height, not min-height: a floor lets the page grow, and a page that
      // can grow never makes anything give way -- which is how a document
      // taller than its pane ended up making the pane taller
      expect(body.css("height"), "the window is the budget").to.equal("100%");
      expect(body.css("overflow"), "and what does not fit scrolls where it is")
        .to.equal("hidden");
      expect(body.css("margin-top"), "so the gap round the page is inside it")
        .to.equal("0px");

      expect($("#inputarea").css("flex"), "the panes take the slack").to.include("1 1");
      expect($("#inputarea").css("overflow"), "and scroll if they run out").to.equal("auto");
      expect($("#results").css("flex"), "the results keep their place and their size")
        .to.include("0 0");
      expect($("#results").css("flex-direction"), "and are a column of their own")
        .to.equal("column");
      // whichever box holds them is the one that scrolls -- here, with no
      // plugin and so no tabs, #results' own div
      expect($("#results > div").css("overflow"), "the results scroll in their box")
        .to.equal("auto");
      expect($("#results > div").css("flex"), "which is the box, not the content")
        .to.include("1 1");
      // the middle is a row and the columns are its items, stretched to it
      expect($("#inputarea").css("display"), "the columns stay side by side")
        .to.equal("flex");
      expect($("#inputarea").css("align-items"), "each as tall as the middle")
        .to.equal("stretch");
      expect($("#inputSchema").css("flex"), "and side by side at their width")
        .to.include("48.5%");
      expect($("#inputSchema").css("display"), "each a column in itself")
        .to.equal("flex");
      // ...and in a column, the document is what grows
      expect($("#schemaDocument").css("flex"), "the schema takes the slack")
        .to.include("1 1");
      expect($("#inputSchema > div:not(#schemaDocument)").css("flex"),
             "the manifest under it is as tall as it is").to.include("0 0");

      /* ...so what is under the document is at the foot of the column,
       * which is the foot of the space above the results: the shape map on
       * one side and the validate row on the other touch it. */
      const foot = column => $(column).children().last();
      expect(foot("#inputSchema").find("#shapeMapArea").length,
             "the shape map is the last thing in the schema column").to.equal(1);
      expect(foot("#inputSchema").css("flex"), "and is as tall as it is")
        .to.include("0 0");
      expect(foot("#inputData").find("#validate").length,
             "the validate row is the last thing in the data column").to.equal(1);
      expect(foot("#inputData").css("flex")).to.include("0 0");
      expect($("#dataArea").css("flex"), "the data document takes the slack")
        .to.include("1 1");
      // ...and nothing remembers a height that would stop the column
      // shrinking when the reader drags the results up
      expect($("#dataArea").attr("style") || "", "no remembered height")
        .to.not.include("min-height");
    });

    /* A schema with a dozen examples has a taller list of them, and the
     * column is the same height either way: the list takes what it needs up
     * to a share of the column and scrolls past that, so the document above
     * it resizes and the validate row below it does not move.  Squeezing
     * the list instead left a sliver with half a button in it. */
    it("should give the example lists a share, and take the rest from the document",
       async function () {
      expect($("#dataExamples").css("flex"), "the lists take what they need")
        .to.include("0 0");
      expect($("#dataExamples").css("max-height"), "up to a share of the column")
        .to.equal("30%");
      expect($("#dataExamples").css("overflow"), "and scroll rather than push")
        .to.equal("auto");

      // the document is what the space is taken from, all the way down
      for (const sel of ["#dataArea", "#dataDocument"]) {
        expect($(sel).css("flex"), sel + " takes the slack").to.include("1 1");
        expect($(sel).css("flex-direction"), sel + " passes it on").to.equal("column");
      }
      const foot = $("#inputData").children().last();
      expect(foot.find("#validate").length, "and the validate row is still the foot")
        .to.equal(1);
      expect(foot.css("flex"), "which never gives way").to.include("0 0");
    });

    /* How the page is divided is the reader's: a long result wants more of
     * it than a long schema does. */
    it("should divide the page at a handle you can drag", function () {
      const grip = $("#resultsGrip");
      expect(grip.length, "the top edge of the results is one").to.equal(1);
      expect(grip.next().attr("id"), "between the panes and the results")
        .to.equal("results");
      expect(grip.prev().attr("id")).to.equal("inputarea");
      expect(grip.css("cursor")).to.equal("row-resize");
      expect(grip.css("flex"), "and is not itself the results").to.include("0 0");

      const drag = y => {
        grip.trigger($.Event("mousedown", {clientY: 400}));
        $(dom.window.document).trigger($.Event("mousemove", {clientY: y}));
        $(dom.window.document).trigger($.Event("mouseup"));
      };
      const page = dom.window.innerHeight;
      drag(page - 300);
      expect($("#results").css("flex"), "dragging up gives the results more")
        .to.equal("0 0 300px");
      drag(page - 120);
      expect($("#results").css("flex"), "and dragging down gives them less")
        .to.equal("0 0 120px");
      // ...within reason: the results keep enough to be worth showing
      drag(page + 500);
      expect($("#results").css("flex")).to.equal("0 0 48px");
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

    /* A validation over a synchronous data source holds the main thread
     * from the moment it starts, so the button has to say what is happening
     * *before* it does -- and the elapsed time can only be reported after,
     * there being no repaint in between to count up in. */
    it("should say on the button that it is validating, and for how long it did", async function () {
      const set = (selector, value) => {
        const elt = $(selector).first();
        elt.val(value);
        elt.trigger("change");
      };
      set("#inputSchema textarea", "PREFIX : <http://a.example/>\n:S { :p . }");
      set("#inputData textarea", "PREFIX : <http://a.example/>\n:x :p 1 .");
      set("#queryMap", "<http://a.example/x>@<http://a.example/S>");
      await shared.promise;

      const button = $("#validate");
      const said = [];
      // the click hands the browser a turn to paint before it blocks, and
      // what it would paint is what the button says at that moment
      const wasTimeout = dom.window.setTimeout;
      dom.window.setTimeout = (fn, ms) => {
        said.push({text: button.text(), running: button.hasClass("running"),
                   disabled: !!button.prop("disabled")});
        return wasTimeout(fn, ms);
      };
      try {
        button.trigger("click");
        await shared.promise;
      } finally {
        dom.window.setTimeout = wasTimeout;
      }

      expect(said[0], "what the button says while it runs").to.deep.equal(
        {text: "validating\u2026", running: true, disabled: true});
      expect(button.text(), "and afterwards").to.equal("validate (ctl-enter)");
      expect(button.hasClass("running")).to.equal(false);
      expect(button.prop("disabled")).to.equal(false);
      expect(button.attr("title"), "with how long it took").to.match(/last validation: \d+ ms/);
    });

    /* Resolving a Fixed Map pair is asynchronous -- a triple pattern or a
     * query map extension asks the data source what it selects -- so two
     * rebuilds can be in flight at once, which is what happens when
     * anything changes twice in quick succession.  Both used to empty the
     * table on the way in and append on the way out, leaving the map a
     * stale copy of every pair it had before. */
    it("should replace the Fixed Map rather than accumulate them", async function () {
      const set = (selector, value) => {
        const elt = $(selector).first();
        elt.val(value);
        elt.trigger("change");
      };
      const rows = () => $("#fixedMap tr.pair").map(
        (i, tr) => $(tr).attr("data-node") + "@" + $(tr).attr("data-shape")).get();
      try {
        set("#inputSchema textarea", "PREFIX : <http://a.example/>\n:S { :p . }");
        // changing the data starts a rebuild; changing the map starts another
        // before the first has resolved
        set("#inputData textarea", "PREFIX : <http://a.example/>\n:x :p 1 .\n:y :p 2 .");
        set("#queryMap", "<http://a.example/x>@<http://a.example/S>,\n" +
            "<http://a.example/y>@<http://a.example/S>");
        await shared.promise;

        expect(rows(), "one row per pair, and only the current pairs").to.deep.equal([
          "http://a.example/x@http://a.example/S",
          "http://a.example/y@http://a.example/S",
        ]);

        // and again, to a map with fewer pairs than the one before
        set("#queryMap", "<http://a.example/y>@<http://a.example/S>");
        await shared.promise;
        expect(rows(), "the pair that went away is gone").to.deep.equal([
          "http://a.example/y@http://a.example/S",
        ]);
      } finally {
        shared.Caches.shapeMap.removeEditMapPair(null);
        set("#queryMap", "<http://a.example/x>@<http://a.example/S>");
        await shared.promise;
      }
    });

    /* Results read as one array, because that is what they are.  They used
     * to be an editor each with the punctuation of an array written between
     * them -- by appending to every *descendant* of #results, which once a
     * result is an editor is every line and every gutter element of it, and
     * is where the commas in the gutter came from.  Now the array is the
     * document, and a Fixed Map check mark scrolls to its result inside it. */
    describe("the results", function () {
      const set = (selector, value) => {
        const elt = $(selector).first();
        elt.val(value);
        elt.trigger("change");
      };
      let wasInterface;

      beforeEach(async function () {
        wasInterface = $("#interface").val();
        $("#interface").val("appinfo").trigger("change");
        set("#inputSchema textarea", "PREFIX : <http://a.example/>\n:S { :p . }");
        set("#inputData textarea", "PREFIX : <http://a.example/>\n:x :p 1 .\n:y :p 2 .");
        shared.Caches.shapeMap.removeEditMapPair(null);
        set("#queryMap", "<http://a.example/x>@<http://a.example/S>,\n" +
            "<http://a.example/y>@<http://a.example/S>");
        await shared.promise;
      });

      afterEach(async function () {
        $("#interface").val(wasInterface).trigger("change");
        $("#editors").val("").trigger("change");
        // put back the one entry the other tests were left expecting
        shared.Caches.shapeMap.removeEditMapPair(null);
        set("#queryMap", "<http://a.example/x>@<http://a.example/S>");
        await shared.promise;
      });

      it("should put every result in one editor, as the array they are", async function () {
        $("#validate").trigger("click");
        await shared.promise;

        const panes = $("#results .cm-editor");
        expect(panes.length, "one editor for all of them").to.equal(1);
        // the editor renders only what is in view, so the document itself is
        // what the app kept beside it
        const text = panes.first().parent().data("rawText");
        expect(text.trimStart()[0], "one JSON array").to.equal("[");
        expect(text, "holding every result").to.include("http://a.example/x");
        expect(text).to.include("http://a.example/y");

        // nothing of ours written into the editor's own DOM
        const gutters = $("#results .cm-gutterElement");
        expect(gutters.length, "with a gutter").to.be.above(0);
        const punctuated = gutters.filter((i, e) => /[\[\],]/.test($(e).text()));
        expect(punctuated.length,
               "gutter elements holding punctuation: " +
               punctuated.map((i, e) => JSON.stringify($(e).text())).get().slice(0, 5).join(" "))
          .to.equal(0);
      });

      it("should scroll to the result a Fixed Map check mark names", async function () {
        $("#validate").trigger("click");
        await shared.promise;

        const links = $("#fixedMap a[href^='#']");
        expect(links.length, "a check mark per entry").to.be.at.least(2);
        // (a map may hold the same pair twice -- see the accumulation bug --
        // so this is about the distinct ones)
        const anchors = [...new Set(links.map((i, a) => $(a).attr("href").substring(1)).get())];
        expect(anchors.length, "two different results").to.be.at.least(2);
        const [{pane, offsets}] = shared.Caches.editorSupport
              ? shared.app.resultsWidget.resultPanes
              : [{}];
        // every check mark names a place in the shared document, and they
        // are different places, in the order the results were rendered
        const places = anchors.map(a => offsets[a]);
        expect(places.filter(p => p === undefined), anchors.join(" ")).to.deep.equal([]);
        expect(places[1], "the second result starts after the first").to.be.above(places[0]);

        let scrolled = null;
        const wasScrollTo = pane.scrollTo;
        pane.scrollTo = pos => { scrolled = pos; };
        try {
          links.filter((i, a) => $(a).attr("href") === "#" + anchors[1]).first().trigger("click");
        } finally {
          pane.scrollTo = wasScrollTo;
        }
        expect(scrolled, "the click scrolled to the second result").to.equal(places[1]);

        // ...and so does arriving at that location by any other route
        scrolled = null;
        pane.scrollTo = pos => { scrolled = pos; };
        try {
          dom.window.location.hash = "#" + anchors[0];
          $(dom.window).trigger("hashchange");
        } finally {
          pane.scrollTo = wasScrollTo;
        }
        expect(scrolled, "a location change scrolled to the first").to.equal(places[0]);
      });

      it("should render results as <pre> when the editors are off", async function () {
        $("#editors").val("textarea").trigger("change");
        $("#validate").trigger("click");
        await shared.promise;

        expect($("#results .cm-editor").length, "no editor anywhere").to.equal(0);
        const pres = $("#results pre");
        expect(pres.length, "a <pre> per result").to.be.at.least(2);
        // each is the element its check mark links to, so the browser can
        // scroll to it the way it always has
        const anchors = [...new Set($("#fixedMap a[href^='#']").map(
          (i, a) => $(a).attr("href").substring(1)).get())];
        for (const anchor of anchors)
          expect($("#results").find("[id='" + anchor.replace(/'/g, "") + "']").length,
                 "an element for " + anchor).to.be.at.least(1);
      });
    });

    /* Where the data comes from is picked from a list of the neighborhood
     * modules this app loaded, and what each one needs is drawn from that
     * module's own declarations: values to type become fields, documents to
     * edit become panes shown one at a time.  The app knows about data
     * sources in general and about none of them in particular. */
    describe("the data source picklist", function () {
      const source = () => shared.neighborhoods;
      /** the tab set's labels, settings pane first */
      const tabs = () => $("#dataPaneTabs > li > a").map((i, a) => $(a).text()).get();
      /** shown or hidden, read off the inline style jQuery's toggle writes
       * (jsdom lays nothing out, so :visible and computed display can't say) */
      const shown = selector => $(selector).prop("style").display !== "none";
      afterEach(function () {
        source().select("rdfjs");   // leave the app as the other tests expect
      });

      it("should offer every loaded source, defaulting to an RDF document", function () {
        expect($("#neighborhood option").map((i, o) => $(o).val()).get())
          .to.deep.equal(["rdfjs", "sparql", "wikibase"]);
        // named by what they read, the way "Turtle" is: the Wikibase source
        // reads the JSON entity pages a wiki is edited through
        expect($("#neighborhood option").map((i, o) => $(o).text()).get())
          .to.deep.equal(["Turtle", "SPARQL endpoint", "Wikibase JSON"]);
        expect($("#neighborhood").val()).to.equal("rdfjs");
        expect($("#neighborhood option:selected").text()).to.equal("Turtle");
        // settings on the left, one document tab beside it, and that
        // document is what shows (jsdom lays nothing out, so "showing" is
        // the display style)
        // an empty document has nothing to name itself after yet
        expect(tabs()).to.deep.equal(["settings", "Turtle 1"]);
        expect($("#neighborhoodFields .noSettings").text(), "nothing to configure")
          .to.equal("nothing to configure for Turtle");
        // one setting per line, so a source with several doesn't run off the side
        expect($("#neighborhoodFields label").css("display")).to.not.equal("inline-block");
        expect(source().paneParam.pane.label).to.equal("Turtle");
        expect(shown("#dataDocument")).to.equal(true);
        expect(shown("#addDataPane"), "a graph may be written as several documents").to.equal(true);
      });

      it("should draw a query service as fields, with no document at all", function () {
        source().select("sparql");
        const fields = $("#neighborhoodFields label > span").map((i, s) => $(s).text().trim()).get();
        expect(fields).to.include("endpoint");
        expect(fields).to.include("expectBnodes");
        // and the setting this app carries out itself, moved here from the
        // "load data" menu item it used to hide inside
        expect(fields).to.include("slurp");
        expect($("#nbhd-expectBnodes").attr("type"), "a boolean is a checkbox").to.equal("checkbox");
        expect($("#nbhd-bnodeDepth").attr("type"), "an integer is a number").to.equal("number");
        // nothing to edit, so no document tab and nothing to edit it in
        expect(source().paneParam).to.equal(null);
        expect(tabs()).to.deep.equal(["settings"]);
        expect(shown("#dataDocument"), "nothing to edit").to.equal(false);
        expect(source().onSettings, "so the settings pane is what shows").to.equal(true);
        // no document, so not even an editor: the fallback all the way down
        expect($("#inputData .shexjs-editor-pane").length).to.equal(0);
        expect(shown("#dataPaneControls"), "and nothing to add one with").to.equal(false);
      });

      it("should let a wikibase grow a pane per entity page", function () {
        source().select("wikibase");
        // an entity page is a document of its own and there are none until
        // you open one; which entities a validation visits is the query
        // map's to say, so there is no list of them to keep as well
        expect(tabs(), "settings, and nothing to edit yet").to.deep.equal(["settings"]);
        expect(shown("#addDataPane"), "but a way to open a page").to.equal(true);

        $("#addDataPane").trigger("click");
        expect(tabs().length).to.equal(2);
        // a fresh page starts from the module's template, and its tab is
        // named by the module reading the page's id back out of it
        expect($("#inputData textarea").first().val()).to.include('"entities"');
        expect(tabs()[1]).to.equal("Q0");

        // the panes not showing are still there to be validated with
        $("#inputData textarea").first().val('{"entities": {"Q42": {"id": "Q42"}}}');
        source().onSettings = true;
        source().render();                    // over to the settings tab
        expect(tabs()[1], "a tab is named by the page in it").to.equal("Q42");
        expect(source().params().pages).to.deep.equal(['{"entities": {"Q42": {"id": "Q42"}}}']);
      });

      it("should give each pane the language its source says it is in", function () {
        source().select("rdfjs");
        expect(source().paneEditor().language).to.equal("turtle");
        source().select("wikibase");
        source().addPane();               // an entity page, which is JSON
        expect(source().paneEditor().language).to.equal("json");
        source().select("sparql");
        expect(source().paneEditor(), "nothing to edit").to.equal(null);
      });

      /* A manifest entry says which source it is for with the same
       * `neighborhood` key a permalink uses, and hands that source its
       * documents under the `data` key one document has always used --
       * so a source that takes several gets an array. */
      it("should take a manifest entry's source and all of its documents", async function () {
        const pages = ['{"entities": {"Q1": {"id": "Q1"}}}',
                       '{"entities": {"Q2": {"id": "Q2"}}}'];
        await shared.Caches.manifest.set([{
          schemaLabel: "constellation", schema: "PREFIX : <http://a.example/>\n<#S> {}",
          dataLabel: "two entities", neighborhood: "wikibase", data: pages,
          queryMap: '<http://www.wikidata.org/entity/Q1>@<#S>',
        }], "http://localhost/manifest.json");

        $("#inputSchema .manifest li").last().trigger("click");
        await shared.promise;
        $("#inputData .indeterminant li").last().trigger("click");
        await shared.promise;

        expect($("#neighborhood").val(), "the entry named its source").to.equal("wikibase");
        // the source sorted them out: both are pages, named by what is in them
        expect(tabs()).to.deep.equal(["settings", "Q1", "Q2"]);
        expect(source().params().pages.length).to.equal(2);
      });

      /* `slurp` used to hide inside the "load data" menu item, appearing
       * only once the pane's text named an endpoint.  It is a setting of the
       * data source -- one this app carries out rather than the module -- so
       * it is drawn with the source's own settings, and what it records goes
       * to the local store's document: switch the picklist to Turtle
       * afterwards and the same data validates without the service. */
      /* Switching to a source with nothing to edit leaves no editor pane --
       * that is the textarea fallback doing its job -- and switching back
       * has to bring one; "is there a pane to rebuild" was the wrong
       * question to gate that on. */
      it("should get its editor back after a source that had none", function () {
        const editorPanes = () => $("#inputData .shexjs-editor-pane").length;
        source().select("rdfjs");
        $("#inputData textarea").first().val("PREFIX : <http://a.example/>\n:x :p 1 .\n");
        expect(editorPanes(), "Turtle is edited").to.equal(1);

        source().select("sparql");
        expect(editorPanes(), "a query service has no document").to.equal(0);

        source().select("rdfjs");
        expect(editorPanes(), "and Turtle is edited again").to.equal(1);
        expect($("#inputData textarea").first().val(), "with the document it had")
          .to.include(":x :p 1 .");
      });

      it("should record what a query service was asked into the Turtle document", function () {
        source().select("sparql");
        expect($("#nbhd-slurp").length, "offered for a source that fetches").to.equal(1);
        expect(source().slurping()).to.equal(false);
        $("#nbhd-slurp").prop("checked", true).trigger("change");
        expect(source().slurping()).to.equal(true);

        source().appendToLocalTurtle("# <x>@<S> 1 triples\n");
        source().select("rdfjs");
        expect($("#inputData textarea").first().val()).to.include("# <x>@<S> 1 triples");

        // every source that fetches has something to record -- a Wikibase
        // translates pages into RDF, so it does too -- and one that is
        // handed its data has nothing
        source().select("wikibase");
        expect($("#nbhd-slurp").length, "a translating source").to.equal(1);
        source().select("rdfjs");
        expect($("#nbhd-slurp").length, "but not a document you typed").to.equal(0);
      });

      /* The three "Wikidata person" entries in the examples manifest are the
       * same schema and the same focus node over three data sources.  Only
       * the third names a document; the first two *are* their source, which
       * a manifest says by naming the source and the settings it wants.
       * (Picking an entry configures; validating would go to the network,
       * which is what the CLI tests do.) */
      it("should configure each of the manifest's Wikidata entries", async function () {
        this.timeout(30000);
        // an earlier test replaced the manifest with one of its own
        await shared.Caches.manifest.asyncGet(
          new dom.window.URL("../examples/manifest.json", dom.window.location.href).href);
        const dataItems = () => $("#inputData .passes li");
        $("#inputSchema .manifest li").filter((i, li) => $(li).text() === "Wikidata person")
          .first().trigger("click");
        await shared.promise;
        expect(dataItems().map((i, li) => $(li).text()).get()).to.deep.equal(
          ["Q42 from the query service", "Q42 from the JSON API", "Q42 from a downloaded page"]);

        const pick = async n => {
          dataItems().eq(n).trigger("click");
          await shared.promise;
        };

        await pick(0);
        expect($("#neighborhood").val()).to.equal("sparql");
        expect($("#nbhd-endpoint").val()).to.equal("https://query.wikidata.org/sparql");
        expect(tabs(), "a query service has no document").to.deep.equal(["settings"]);

        await pick(1);
        expect($("#neighborhood").val()).to.equal("wikibase");
        expect($("#nbhd-base").val()).to.equal("https://www.wikidata.org/wiki/Special:EntityData/");
        // the entry hands this source no document: its query map says which
        // entities to walk (QENTITIES "42 76") and the pages are fetched
        expect(tabs(), "so there is nothing but the settings").to.deep.equal(["settings"]);
        // ...and the endpoint didn't follow it here
        expect($("#nbhd-endpoint").length).to.equal(0);

        await pick(2);
        expect($("#neighborhood").val()).to.equal("wikibase");
        expect(tabs()[1], "the downloaded page, named by the id in it").to.equal("Q42");
        expect(source().texts("pages")[0]).to.include('"lastrevid"');
      });

      /* A QueryMap may ask the source which nodes to validate.  Which
       * questions can be asked is the source's business: only a query
       * service can run SPARQL, only a Wikibase knows what Q42 means, and a
       * source that does not understand an extension says which one it is
       * and which source refused it. */
      it("should resolve a QueryMap extension through the selected source", async function () {
        source().select("wikibase");
        const data = shared.Caches.inputData;
        const qentities = "http://www.w3.org/ns/shex#Extensions-qentities";
        const nodes = await data.resolveQueryMapExtension(qentities, "42 76");
        expect(nodes.map(n => n.value)).to.deep.equal([
          "http://www.wikidata.org/entity/Q42",
          "http://www.wikidata.org/entity/Q76",
        ]);
        // and it is written back out by the name the source knows it as
        expect(data.writeQueryMapExtension(qentities, "42 76"))
          .to.equal("QENTITIES " + "'''" + "42 76" + "'''");

        for (const [id, extension] of [["sparql", "QENTITIES"], ["rdfjs", "SPARQL"]]) {
          source().select(id);
          let message = null;
          try {
            await data.resolveQueryMapExtension(
              "http://www.w3.org/ns/shex#Extensions-" + extension.toLowerCase(), "whatever");
          } catch (e) {
            message = e.message;
          }
          expect(message, id).to.equal(
            "the QueryMap extension " + extension +
            " is not supported by the neighborhood " + id);
        }
      });

      /* Inventory row 7 of doc/extension-ui-plan.md, which had no test.
       * A query map names its nodes by asking the source, so an edit map
       * over one has a cell nobody can point at.  Right-clicking it offers
       * the nodes the question answered with, and "- materialize -" at the
       * head of them means all of them: the map becomes the rows it stood
       * for, which is the only way to get at them one at a time. */
      it("should expand a query map into one edit-map row per node it names", async function () {
        // on this page, with nothing registered: "materialize" here is the
        // query's, not ShExMap's
        expect(dom.window.ShExPlugins.all()).to.deep.equal([]);
        source().select("wikibase");
        const shapeMap = shared.Caches.shapeMap;
        const qentities = "http://www.w3.org/ns/shex#Extensions-qentities";
        shapeMap.removeEditMapPair(null);
        shapeMap.addEditMapPairs(
          [{node: {type: "Extension", language: qentities, lexical: "42 76"},
            shape: "http://a.example/S"}], null);

        const focus = $("#editMap .pair:nth(0) .focus");
        expect(focus.val(), "the question, as the source writes it")
          .to.equal("QENTITIES \'\'\'42 76\'\'\'");

        // a real right-click: the plugin ignores a synthetic contextmenu
        // (its own "open" is one), and the app's handler builds the items
        focus[0].dispatchEvent(new dom.window.MouseEvent(
          "contextmenu", {bubbles: true, cancelable: true, button: 2}));
        for (let i = 0; i < 200 && $("ul.context-menu-list li").length === 0; ++i)
          await new Promise(res => setTimeout(res, 10));
        const items = $("ul.context-menu-list li");
        // spelled against the base the entries before this one named
        // (`dataBase`), which is what an entity IRI is written against
        expect(items.map((i, li) => $(li).text()).get(),
               "the answers, and the item that takes all of them").to.deep.equal([
          "- materialize -",
          "<Q42>",
          "<Q76>",
        ]);

        items.eq(0).trigger("mouseup");   // as the plugin activates an item
        const pairs = $("#editMap .pair").map((i, tr) => [[
          $(tr).find(".focus").val(), $(tr).find(".inputShape").val()
        ]]).get();
        expect(pairs, "a row per node, each with the shape the query had")
          .to.deep.equal([
            ["<Q42>", "<//a.example/S>"],
            ["<Q76>", "<//a.example/S>"],
          ]);
        shapeMap.removeEditMapPair(null);
      });

      /* A manifest entry's source settings arrive after its documents do --
       * the pick machinery sets the data, then loadExtraInputs delivers the
       * rest -- so the db built on the way through knows nothing of the
       * endpoint yet.  Whatever asks the source next has to see the
       * configured db, not that one: "Can't execute a SPARQL query with no
       * endpoint" was this, and it is why setting a source parameter
       * invalidates the db built from the old value. */
      it("should rebuild the source when a setting arrives after its data", async function () {
        const data = shared.Caches.inputData;
        const endpoint = shared.app.QueryParams.find(q => q.queryStringParm === "endpoint");
        // the order pickData uses: name the source, then deliver its settings
        source().select("sparql");
        endpoint.location.val("");    // as an entry that names none delivers it
        await data.refresh();
        expect(data.endpoint, "nothing configured yet").to.equal(undefined);

        // the way a manifest entry (or a permalink) delivers `endpoint=`
        endpoint.location.val("https://query.wikidata.org/sparql");
        const db = await data.refresh();
        expect(data.endpoint).to.equal("https://query.wikidata.org/sparql");
        expect(typeof db.executeSelect, "and it is a db a resolver can ask").to.equal("function");
        endpoint.location.val("");
      });

      /* Picking an entry builds its fixed map on the spot, and a query map
       * extension is resolved by asking the source -- so the source has to
       * be configured by then.  Its settings used to arrive afterwards,
       * which is what "Can't execute a SPARQL query with no endpoint"
       * was: an endpoint delivered one step too late. */
      it("should configure the source before the entry's query map asks it anything", async function () {
        this.timeout(30000);
        await shared.Caches.manifest.asyncGet(
          new dom.window.URL("../examples/manifest.json", dom.window.location.href).href);

        // stand in for the resolver, so this stays a test and not a query
        const sparql = dom.window.ShExWebApp.NeighborhoodModules
              .find(m => m.name === "neighborhood-sparql");
        const resolver = sparql.queryMapResolvers[0];
        const asked = [];
        const wasResolve = resolver.resolve;
        resolver.resolve = (lexical, db) => {
          asked.push({lexical, endpoint: shared.Caches.inputData.endpoint,
                      canQuery: typeof db.executeSelect === "function"});
          return [];
        };
        try {
          $("#inputSchema .manifest li").filter((i, li) => $(li).text() === "wikidata query")
            .first().trigger("click");
          await shared.promise;
          $("#inputData .passes li").first().trigger("click");
          await shared.promise;
        } finally {
          resolver.resolve = wasResolve;
        }

        expect(asked.length, "the entry's query map was resolved").to.be.above(0);
        expect(asked[0].lexical).to.match(/SELECT/);
        expect(asked[0].endpoint, "with the endpoint the entry named")
          .to.equal("https://query.wikidata.org/sparql");
        expect(asked[0].canQuery, "and a db that can run it").to.equal(true);
      });

      /* What made these entries slow was a source rebuilt -- and
       * re-fetched, and re-translated -- for every dirty bit, and an engine
       * that took twenty seconds over one entity's worth of labels.  This
       * validates a real entity page end to end and says how long that took.
       *
       * The page is handed over inline, with its sitelinks removed so that
       * nothing has to be fetched: jsdom serves this suite's HTTP from the
       * same event loop the app runs on, and a *synchronous* XHR into it
       * deadlocks (which is the whole reason neighborhood-sparql ships
       * sync-fetch).  In a browser the server is another process and the
       * shipped entry fetches its page and site table quite happily. */
      it("should validate a real entity page end to end, quickly", async function () {
        this.timeout(60000);
        const examples = Path.join(__dirname, "../examples");
        const page = JSON.parse(Fs.readFileSync(Path.join(examples, "wikidata-Q42.json"), "utf8"));
        delete page.entities.Q42.sitelinks;   // ...so no site table is wanted

        await shared.Caches.manifest.set([{
          schemaLabel: "person", schema: Fs.readFileSync(
            Path.join(examples, "wikidata-person.shex"), "utf8"),
          dataLabel: "Q42, handed over whole", neighborhood: "wikibase",
          data: JSON.stringify(page),
          regexpEngine: "eval-simple-1err",
          queryMap: 'QENTITIES "42"@START',
        }], "http://localhost/manifest.json");
        $("#inputSchema .manifest li").last().trigger("click");
        await shared.promise;
        $("#inputData .indeterminant li").last().trigger("click");
        await shared.promise;

        expect($("#neighborhood").val()).to.equal("wikibase");
        expect($("#regexpEngine").val(), "the entry asked for an engine").to.equal("eval-simple-1err");

        const began = Date.now();
        $("#validate").trigger("click");
        await shared.promise;
        const elapsed = Date.now() - began;

        expect($("#results .error").length, $("#results").text().substring(0, 300)).to.equal(0);
        // the human interface renders a pass as a check beside the pair
        expect($("#results").text(), "Q42 is a person").to.match(/\u2713|ShapeTest|conformant/);
        expect(elapsed, "and not in twenty seconds: " + elapsed + "ms").to.be.below(15000);
      });

      /* Slurp records what a validation fetched, as Turtle: the point is
       * that the same data can then be validated without the source, so
       * what it writes goes to the local store's document.
       *
       * It wrote nothing at all for two years.  The app built the tracker
       * that reports each fetch and then overwrote it with the return value
       * of the function that had just assigned it (undefined), so the db was
       * built without one and the slurp came out as a page of prefixes. */
      it("should record what a validation fetched when slurp is on", async function () {
        this.timeout(60000);
        const examples = Path.join(__dirname, "../examples");
        const page = JSON.parse(Fs.readFileSync(Path.join(examples, "wikidata-Q42.json"), "utf8"));
        delete page.entities.Q42.sitelinks;   // ...so no site table is wanted

        await shared.Caches.manifest.set([{
          schemaLabel: "person", schema: Fs.readFileSync(
            Path.join(examples, "wikidata-person.shex"), "utf8"),
          dataLabel: "Q42, and keep what it reads", neighborhood: "wikibase",
          data: JSON.stringify(page),
          regexpEngine: "eval-simple-1err",
          queryMap: 'QENTITIES "42"@START',
        }], "http://localhost/manifest.json");
        $("#inputSchema .manifest li").last().trigger("click");
        await shared.promise;
        $("#inputData .indeterminant li").last().trigger("click");
        await shared.promise;

        // the switch is a field of the source, since only a source that
        // fetches has anything to record
        expect($("#nbhd-slurp").length, "a source that fetches offers it").to.equal(1);
        $("#nbhd-slurp").prop("checked", true).trigger("change");
        expect(source().slurping()).to.equal(true);

        try {
          $("#validate").trigger("click");
          await shared.promise;
          let turtle = "";
          for (let i = 0; i < 100 && !/triples/.test(turtle); ++i) {
            await new Promise(resolve => setTimeout(resolve, 20));
            turtle = (source().panesFor("rdfjs").data || [""])[0] || "";
          }
          const lines = turtle.split("\n");

          // it opens with what the document is and what it is written with,
          // before anything has come back to write
          expect(lines[0], "what this is").to.equal("# slurped");
          expect(turtle, "the schema's prefixes, said once")
            .to.include("PREFIX wdt: <http://www.wikidata.org/prop/direct/>");
          expect(turtle.split("PREFIX wdt:").length - 1, "once").to.equal(1);

          // ...then one complete line per request, and under each of them
          // the triples that came back from it
          const walk = lines.filter(l => /^# [→←]/.test(l));
          expect(walk.length, "a line per request").to.be.above(0);
          for (const line of walk)
            expect(line, "said in full, after the answer")
              .to.match(/^# [→←] \S+@\S+ \d+ triples \(\d+ ms\)$/);
          const first = lines.indexOf(walk[0]);
          expect(lines[first + 1], "the triples under the line about them")
            .to.match(/^(<|_:|wd)/);
          expect(turtle, "and what it read").to.include("wd:Q42");
          expect(turtle).to.match(/wdt:P31|rdfs:label/);

          // ...which is a Turtle document, whatever the walk did: the lines
          // used to be opened by one request and closed by another's answer
          const parsed = new (require("n3").Parser)(
            {format: "text/turtle", baseIRI: "http://a.example/"}).parse(turtle);
          expect(parsed.length, "and it parses").to.be.above(0);
        } finally {
          $("#nbhd-slurp").prop("checked", false).trigger("change");
        }
      });

      /* A base the data is written against, which a source that answers
       * from a service has no URL to supply: an entity reads as <Q42>
       * rather than as forty characters of wikidata.org, in the walk and in
       * the Turtle under it, and the document says which base that is. */
      it("should write a slurp against the base the entry named", async function () {
        this.timeout(60000);
        const examples = Path.join(__dirname, "../examples");
        const page = JSON.parse(Fs.readFileSync(Path.join(examples, "wikidata-Q42.json"), "utf8"));
        delete page.entities.Q42.sitelinks;

        await shared.Caches.manifest.set([{
          schemaLabel: "person", schema: Fs.readFileSync(
            Path.join(examples, "wikidata-person.shex"), "utf8"),
          dataLabel: "Q42, against the entity base", neighborhood: "wikibase",
          dataBase: "http://www.wikidata.org/entity/",
          data: JSON.stringify(page),
          regexpEngine: "eval-simple-1err",
          queryMap: 'QENTITIES "42"@START',
        }], "http://localhost/manifest.json");
        $("#inputSchema .manifest li").last().trigger("click");
        await shared.promise;
        $("#inputData .indeterminant li").last().trigger("click");
        await shared.promise;
        expect(shared.Caches.inputData.meta.base, "the entry said what to write against")
          .to.equal("http://www.wikidata.org/entity/");

        $("#nbhd-slurp").prop("checked", true).trigger("change");
        try {
          $("#validate").trigger("click");
          await shared.promise;
          let turtle = "";
          for (let i = 0; i < 100 && !/triples/.test(turtle); ++i) {
            await new Promise(resolve => setTimeout(resolve, 20));
            turtle = (source().panesFor("rdfjs").data || [""])[0] || "";
          }
          expect(turtle.split("\n")[0], "declared at the top")
            .to.equal("BASE <http://www.wikidata.org/entity/>");
          expect(turtle, "the walk, written against it").to.match(/^# → <Q42>@\S+ \d+ triples/m);
          expect(turtle, "and the triples under it").to.match(/^<Q42> /m);
          expect(turtle, "which is what it means")
            .to.not.include("<http://www.wikidata.org/entity/Q42>");
        } finally {
          $("#nbhd-slurp").prop("checked", false).trigger("change");
        }
      });

      /* A request that got nothing back says so where it happened, rather
       * than leaving a line half-written and the reader wondering which of
       * a hundred requests never came home. */
      it("should say where a request got nothing back", async function () {
        this.timeout(60000);
        await shared.Caches.manifest.set([{
          schemaLabel: "person", schema: Fs.readFileSync(
            Path.join(__dirname, "../examples", "wikidata-person.shex"), "utf8"),
          dataLabel: "an entity that isn't there", neighborhood: "wikibase",
          base: dom.window.location.origin + "/no/such/directory/",
          queryMap: 'QENTITIES "42"@START',
        }], "http://localhost/manifest.json");
        $("#inputSchema .manifest li").last().trigger("click");
        await shared.promise;
        $("#inputData .indeterminant li").last().trigger("click");
        await shared.promise;

        $("#nbhd-slurp").prop("checked", true).trigger("change");
        try {
          $("#validate").trigger("click");
          await shared.promise;
          let turtle = "";
          for (let i = 0; i < 100 && !/nothing back/.test(turtle); ++i) {
            await new Promise(resolve => setTimeout(resolve, 20));
            turtle = (source().panesFor("rdfjs").data || [""])[0] || "";
          }
          expect(turtle, "the request, and what came of it")
            .to.match(/^# → \S+@\S+ nothing back after \d+ ms: .*404/m);
        } finally {
          $("#nbhd-slurp").prop("checked", false).trigger("change");
        }
      });

      /* ...and what a slurp collected has to be somewhere the reader can
       * see.  It goes to the local store's document, which is a pane of a
       * source they are not looking at: a query service has no document of
       * its own, so a slurp against one looked like nothing at all. */
      it("should show what a slurp collected when the source has no pane", function () {
        source().select("sparql");
        expect(tabs(), "a query service has nothing to show").to.deep.equal(["settings"]);
        source().setLocalTurtle("# slurped\n<http://a.example/x> <http://a.example/p> 1 .\n");

        source().showSlurped();

        expect($("#neighborhood").val(), "the source now holding it").to.equal("rdfjs");
        // named by its first line, the way every Turtle pane is
        expect(tabs()).to.deep.equal(["settings", "slurped"]);
        expect(shown("#dataDocument"), "and it is what shows").to.equal(true);
        expect($("#inputData textarea").first().val(), "the slurp, in the pane")
          .to.include("<http://a.example/p>");
      });

      /* A Wikibase keeps its own: the pages it read are the better artifact,
       * and they are already on screen. */
      it("should leave a source that has documents of its own showing them", function () {
        source().select("wikibase");
        source().addPane('{"entities": {"Q42": {"id": "Q42"}}}');
        source().setLocalTurtle("# Visited data:\n");
        source().showSlurped();
        expect($("#neighborhood").val(), "still the Wikibase").to.equal("wikibase");
        expect(tabs()[1]).to.equal("Q42");
      });

      /* The Fixed Map tab says what it is doing while it does it, and has
       * to stop saying it however that ends.  A query map the source cannot
       * answer -- a SPARQL SELECT asked of a local store, which is what a
       * slurp leaves you looking at -- threw past the line that put the
       * label back, and the tab read "resolving Fixed Map" for the rest of
       * the session. */
      it("should give the Fixed Map tab its label back when a pair won't resolve",
         async function () {
           source().select("rdfjs");
           const tab = $('#shapeMap-tabs [href="#fixedMap-tab"]');
           const label = tab.text();
           expect(label, "not already stuck").to.equal("Fixed Map");

           try {
             $("#queryMap").val("SPARQL '''SELECT ?s { ?s ?p ?o }'''@START");
             const errors = await shared.Caches.shapeMap.copyQueryMapToEditMap();
             expect(errors.length, "a local store cannot answer that").to.be.above(0);
             expect(String(errors[0]), "and says so")
               .to.match(/QueryMap extension SPARQL is not supported/);
             expect(tab.text(), "the tab is a tab again").to.equal(label);
             expect(tab.hasClass("running"), "and not still resolving").to.equal(false);
           } finally {
             // a map the next test can build on, rather than whatever the
             // last one left: this describe's tests share a page
             $("#queryMap").val("<http://a.example/x>@<http://a.example/S>");
             await shared.Caches.shapeMap.copyQueryMapToEditMap();
             // ...and out of the app's 100ms "see shape map errors above"
             // window, which is about a reader pressing validate on the
             // heels of a failure rather than about the next test
             await new Promise(resolve => setTimeout(resolve, 120));
           }
         });

      /* A source can have no document to edit at all -- a query service
       * answers from a store nobody typed -- and the schema and the results
       * are still there to point at each other.  Hovering used to be
       * skipped entirely when there was no data pane, so those sources got
       * no highlighting anywhere. */
      it("should hover schema and results where a source has no document", async function () {
        source().select("rdfjs");
        const set = (selector, value) => {
          const elt = $(selector).first();
          elt.val(value);
          elt.trigger("change");
        };
        // the query map first: whatever ran before may have left an
        // extension this source can't resolve (QENTITIES is a Wikibase's)
        set("#queryMap", "<http://a.example/x>@<http://a.example/S>");
        set("#inputSchema textarea", [
          "PREFIX : <http://a.example/>",
          "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
          ":S { :p xsd:integer }",
        ].join("\n"));
        set("#inputData textarea", "PREFIX : <http://a.example/>\n:x :p 1 .");
        await shared.promise;
        $("#validate").trigger("click");
        await shared.promise;

        const es = shared.Caches.editorSupport;
        const pairs = (es.lastMapped || {}).pairs || [];
        expect(pairs.length, "a validation to hover over").to.be.above(0);

        let regions = 0;
        const was = es.panes.inputSchema.setHoverRegions;
        es.panes.inputSchema.setHoverRegions = function (rs) {
          regions = rs.length;
          return was.apply(this, arguments);
        };
        try {
          source().select("sparql");        // fields, and nothing to edit
          shared.app.refreshDataPaneEditor();
          expect(es.panes.inputData, "so there is no data pane").to.not.exist;
          es.setPairHovers(pairs);
          expect(regions, "the constraints still light up with the results")
            .to.be.above(0);
        } finally {
          es.panes.inputSchema.setHoverRegions = was;
          source().select("rdfjs");         // and the pane the rest expects
          shared.app.refreshDataPaneEditor();
        }
      });

      /* CodeMirror measures when it is built and when its own observers
       * fire; a pane built detached, or sitting behind another tab, has
       * measured nothing -- and draws a gutter for a viewport that never
       * existed until it is told to look again.  jsdom lays nothing out, so
       * what can be checked here is that it is told. */
      it("should re-measure a pane when it is shown again", function () {
        source().select("rdfjs");
        const pane = shared.Caches.editorSupport.panes.inputData;
        let measured = 0;
        const wasRequestMeasure = pane.requestMeasure;
        pane.requestMeasure = function () { ++measured; return wasRequestMeasure.apply(this, arguments); };
        try {
          source().select("wikibase");
          source().show(0);            // a document tab, after the settings pane
          expect(measured, "hidden and shown again").to.be.above(0);
        } finally {
          pane.requestMeasure = wasRequestMeasure;
        }
      });

      /* Post-validation highlighting anchors to where the data was written,
       * which the data source says: over an entity page that means ranges in
       * the JSON.  The source locates its own document and reports a
       * quad-to-range table of the shape a Turtle parse has, the app asks it
       * instead of assuming Turtle, and the highlighting that follows can't
       * tell the two syntaxes apart. */
      it("should anchor validation results in an entity page, not just in Turtle", async function () {
        this.timeout(60000);
        const examples = Path.join(__dirname, "../examples");
        const page = JSON.parse(Fs.readFileSync(Path.join(examples, "wikidata-Q42.json"), "utf8"));
        delete page.entities.Q42.sitelinks;    // so nothing has to be fetched
        const text = JSON.stringify(page, null, 2);

        await shared.Caches.manifest.set([{
          schemaLabel: "person", schema: Fs.readFileSync(
            Path.join(examples, "wikidata-person.shex"), "utf8"),
          dataLabel: "Q42 as JSON", neighborhood: "wikibase", data: text,
          regexpEngine: "eval-simple-1err",
          queryMap: 'QENTITIES "42"@START',
        }], "http://localhost/manifest.json");
        $("#inputSchema .manifest li").last().trigger("click");
        await shared.promise;
        $("#inputData .indeterminant li").last().trigger("click");
        await shared.promise;

        // highlighting marks the document on screen, so look at the page
        // rather than at the list of ids the source shows first
        const pageTab = $("#dataPaneTabs > li > a").filter((i, a) => $(a).text() === "Q42");
        expect(pageTab.length, "a tab for the page").to.equal(1);
        pageTab.trigger("click");
        const shown = $("#inputData textarea").first().val();
        expect(shown.trimStart()[0], "the pane holds the entity page").to.equal("{");
        // ...in an editor: this source's pane is JSON, and moving between
        // panes of one source changes language as much as moving between
        // sources does
        expect(shared.app.editorSupport.panes.inputData,
               "an editor over the page, to highlight in").to.exist;

        $("#validate").trigger("click");
        await shared.promise;

        const db = shared.Caches.inputData.parsed;
        const located = db.locateDocument(shown);
        expect(located, "the source locates its own document").to.exist;
        expect(located.quads.length, "quads from the page").to.be.above(0);
        expect(located.provenance.size, "and where each was written").to.be.above(0);

        // every position is a range within the document on screen
        const [utterance] = located.provenance.get(
          located.quads.find(q => q.predicate.value.endsWith("/P569")));
        expect(utterance, "an utterance for the date of birth").to.exist;
        for (const position of ["subject", "predicate", "object"]) {
          const [range] = utterance[position];
          expect(range, position).to.exist;
          expect(range.end).to.be.at.most(shown.length);
          expect(range.end).to.be.above(range.start);
        }
        // and a claim is marked at its braces, as a Turtle bnode is at its
        // brackets -- what editor-services reads to highlight delimiters only
        const statement = located.provenance.get(
          located.quads.find(q => q.predicate.value === "http://www.wikidata.org/prop/P569"))[0];
        expect(shown[statement.object[0].start]).to.equal("{");
        expect(shown[statement.object[0].end - 1]).to.equal("}");

        // ...so the results the app mapped point into the page
        const mapped = shared.Caches.editorSupport.lastMapped;
        expect(mapped, "a validation was mapped").to.exist;
        const anchored = mapped.pairs.filter(pair => pair.anchors && pair.anchors.object);
        expect(anchored.length, "results anchored in the page").to.be.above(0);
        for (const {anchors} of anchored) {
          expect(anchors.object.to, "a range within the document").to.be.at.most(shown.length);
          expect(anchors.object.to).to.be.above(anchors.object.from);
        }
        // a claim highlights its braces and leaves the contents to the
        // triples inside it, the way a Turtle bnode highlights its brackets
        const nested = anchored.filter(pair => pair.anchors.objectParts);
        expect(nested.length, "a claim marked at its delimiters").to.be.above(0);
        const [open, close] = nested[0].anchors.objectParts;
        expect(shown.substring(open.from, open.to)).to.equal("{");
        expect(shown.substring(close.from, close.to)).to.equal("}");

        // (the squiggle's half of this is JsonPaneAnchors-test, which needs
        // a validation that fails and so a page small enough to say why)
      });

      /* A source can hold several documents -- an entity page each -- and a
       * result about one of them can't highlight in another, so hovering a
       * constraint whose match is in a page that isn't showing brings that
       * page forward first. */
      it("should switch to the document a result was about, and highlight there", async function () {
        this.timeout(60000);
        const examples = Path.join(__dirname, "../examples");
        const page = JSON.parse(Fs.readFileSync(Path.join(examples, "wikidata-Q42.json"), "utf8"));
        delete page.entities.Q42.sitelinks;
        const other = {entities: {Q5: {type: "item", id: "Q5", labels: {}, claims: {}}}};

        await shared.Caches.manifest.set([{
          schemaLabel: "person", schema: Fs.readFileSync(
            Path.join(examples, "wikidata-person.shex"), "utf8"),
          dataLabel: "two pages", neighborhood: "wikibase",
          data: JSON.stringify(page, null, 2),
          regexpEngine: "eval-simple-1err",
          queryMap: 'QENTITIES "42"@START',
        }], "http://localhost/manifest.json");
        $("#inputSchema .manifest li").last().trigger("click");
        await shared.promise;
        $("#inputData .indeterminant li").last().trigger("click");
        await shared.promise;

        const source = shared.neighborhoods;
        // a second page, the way slurping leaves one
        source.addPageDocument("Q5", JSON.stringify(other, null, 2));
        // pages only: the list of entity ids is a document too, and it has
        // no editor to highlight in
        const pages = source.documents()
              .map((d, at) => ({at, d, isQ42: d.text.indexOf('"Q42"') !== -1}))
              .filter(p => p.d.text.trimStart()[0] === "{");
        const q42 = pages.find(p => p.isQ42), otherDoc = pages.find(p => !p.isQ42);
        expect(q42, "a document per page").to.exist;
        expect(otherDoc, "and one that isn't Q42").to.exist;

        source.show(otherDoc.at);          // look away from the page under test
        $("#validate").trigger("click");
        await shared.promise;

        const mapped = shared.Caches.editorSupport.lastMapped;
        const elsewhere = mapped.pairs.find(p => p.doc === q42.at && p.anchors.object);
        expect(elsewhere, "a result anchored in the page that isn't showing").to.exist;
        expect(source.showing, "still looking away").to.equal(otherDoc.at);

        // hovering it brings that page forward and highlights in it
        const es = shared.Caches.editorSupport;
        const spy = {regions: []};
        const wasSetHoverRegions = es.panes.inputSchema.setHoverRegions;
        try {
          es.panes.inputSchema.setHoverRegions = regions => { spy.regions = regions; };
          es.setPairHovers([elsewhere]);
          expect(spy.regions.length, "a hover region for it").to.be.above(0);
          spy.regions[0].enter();
        } finally {
          es.panes.inputSchema.setHoverRegions = wasSetHoverRegions;
        }
        expect(source.showing, "switched to the page the result was about").to.equal(q42.at);
        const shown = $("#inputData textarea").first().val();
        expect(shown.indexOf('"Q42"'), "and that page is what the pane holds").to.be.above(-1);

        // leave no QENTITIES map behind: the next source can't read one
        $("#queryMap").val("").trigger("change");
        await shared.promise;
      });

      /* A graph is not a file: rdfjs holds as many Turtle documents as the
       * data was written in, parses them into one store, and names each tab
       * after what the document says it is.  A result about a triple in the
       * other document highlights there. */
      it("should validate across two Turtle documents and follow a result between them", async function () {
        this.timeout(60000);
        const examples = Path.join(__dirname, "../examples");
        const read = f => Fs.readFileSync(Path.join(examples, f), "utf8");

        await shared.Caches.manifest.set([{
          schemaLabel: "FHIR-ish", schema: read("ClinObs.shex"),
          dataLabel: "two documents", neighborhood: "rdfjs",
          data: [read("ClinObs-observation.ttl"), read("ClinObs-patient.ttl")],
          queryMap: "<http://hl7.example/Obs1>@<ObservationShape>",
        }], "http://localhost/manifest.json");
        $("#inputSchema .manifest li").last().trigger("click");
        await shared.promise;
        $("#inputData .indeterminant li").last().trigger("click");
        await shared.promise;

        const source = shared.neighborhoods;
        // each document is named by what it says it is
        expect($("#dataPaneTabs > li > a").map((i, a) => $(a).text()).get())
          .to.deep.equal(["settings", "Observation", "Patient"]);

        $("#validate").trigger("click");
        await shared.promise;
        expect($("#results .passes").length, "one graph, from two documents").to.be.above(0);

        // the patient's triples are in the second document
        const mapped = shared.Caches.editorSupport.lastMapped;
        const docs = source.documents();
        const patientAt = docs.findIndex(d => d.text.indexOf(":birthdate") !== -1);
        expect(patientAt, "a document with the patient in it").to.be.above(0);
        const there = mapped.pairs.find(
          p => p.doc === patientAt && p.anchors.object && p.message.indexOf("birthdate") !== -1);
        expect(there, "a result anchored in the patient document").to.exist;

        source.show(docs.findIndex(d => d.text.indexOf(":valueQuantity") !== -1));
        expect($("#inputData textarea").first().val()).to.include(":valueQuantity");

        const es = shared.Caches.editorSupport;
        const spy = {regions: []};
        const was = es.panes.inputSchema.setHoverRegions;
        try {
          es.panes.inputSchema.setHoverRegions = regions => { spy.regions = regions; };
          es.setPairHovers([there]);
          spy.regions[0].enter();
        } finally {
          es.panes.inputSchema.setHoverRegions = was;
        }
        expect(source.showing, "switched to the patient document").to.equal(patientAt);
        const shown = $("#inputData textarea").first().val();
        expect(shown, "which is what the pane holds").to.include(":birthdate");
        const {from, to} = there.anchors.object;
        expect(shown.substring(from, to), "and the range points into it")
          .to.equal('"1999-12-31"^^xsd:date');
      });

      it("should look like the panes it replaced", async function () {
        // the app paints the schema pane blue and the data pane green; the
        // editors standing in for those textareas say the same thing
        source().select("rdfjs");
        const set = (selector, value) => $(selector).first().val(value).trigger("change");
        set("#inputSchema textarea", "PREFIX : <http://a.example/>\n:S { :p . }\n");
        set("#inputData textarea", "PREFIX : <http://a.example/>\n:x :p 1 .\n");
        set("#queryMap", "<http://a.example/x>@<http://a.example/S>");
        $("#validate").trigger("click");
        await shared.promise;

        const es = shared.Caches.editorSupport;
        const painted = [];
        $("head style, style").each((i, s) => painted.push($(s).text()));
        const css = painted.join("\n");
        expect(es.panes.inputSchema, "a schema pane to look at").to.exist;
        expect(css, "the schema pane's blue").to.include("rgb(244, 244, 255)");
        expect(css, "the data pane's green").to.include("rgb(244, 255, 244)");
      });

      /* A range is an offset into the document it was located in.  The data
       * pane shows one document at a time, so results about another one have
       * no business lighting up text here -- and a hover in the data pane
       * must never switch documents, which would pull the page out from
       * under the mouse that is pointing at it. */
      /* Hovering a constraint scrolls the data pane, and where it scrolls to
       * is the first range handed over.  The object is what the reader came
       * to see: the subject and predicate are what they asked with, and in
       * an entity page they sit thousands of lines from the answer. */
      it("should offer the object first, so that is what the pane scrolls to", async function () {
        this.timeout(60000);
        const examples = Path.join(__dirname, "../examples");
        const read = f => Fs.readFileSync(Path.join(examples, f), "utf8");
        const entry = JSON.parse(Fs.readFileSync(Path.join(examples, "manifest.json"), "utf8"))
              .find(e => e.dataLabel === "two documents, and the mistake is in the second");

        await shared.Caches.manifest.set([{
          schemaLabel: "FHIR-ish", schema: read("ClinObs.shex"),
          dataLabel: "the mistake is in the second", neighborhood: "rdfjs",
          data: entry.data, queryMap: entry.queryMap,
        }], "http://localhost/manifest.json");
        $("#inputSchema .manifest li").last().trigger("click");
        await shared.promise;
        $("#inputData .indeterminant li, #inputData .fails li").last().trigger("click");
        await shared.promise;
        $("#validate").trigger("click");
        await shared.promise;

        const es = shared.Caches.editorSupport;
        // catch the schema-side hover regions, then hover one and watch what
        // the data pane is asked to highlight
        const regions = [];
        const schemaPane = es.panes.inputSchema, dataPane = es.panes.inputData;
        const wasSet = schemaPane.setHoverRegions;
        schemaPane.setHoverRegions = (rs, leave) => {
          regions.length = 0; regions.push(...(rs || []));
          return wasSet.call(schemaPane, rs, leave);
        };
        const asked = [];
        const wasHighlight = dataPane.highlight;
        dataPane.highlight = (ranges, cls, opts) => {
          asked.push({ranges: (ranges || []).slice(), opts});
          return wasHighlight.call(dataPane, ranges, cls, opts);
        };
        try {
          es.setPairHovers(es.lastMapped.pairs);
          expect(regions.length, "hoverable constraints").to.be.above(0);
          regions[0].enter();
          expect(asked.length, "the data pane was asked to highlight").to.be.above(0);

          const {ranges, opts} = asked[asked.length - 1];
          expect(ranges.length, "something to show").to.be.above(0);
          // a hover from the schema side scrolls the data pane
          expect(opts && opts.scroll, "the pane the mouse is not in scrolls").to.not.equal(false);

          // the first range is an object anchor of one of the pairs shown
          const pairs = es.lastMapped.pairs;
          const objectFirst = pairs.some(p => {
            const o = (p.anchors && (p.anchors.objectParts || (p.anchors.object ? [p.anchors.object] : []))) || [];
            return o.some(r => r.from === ranges[0].from && r.to === ranges[0].to);
          });
          expect(objectFirst, "the pane is pointed at an object, not a subject").to.equal(true);
        } finally {
          schemaPane.setHoverRegions = wasSet;
          dataPane.highlight = wasHighlight;
        }
      });

      it("should keep one document's hovers out of another's", async function () {
        this.timeout(60000);
        const examples = Path.join(__dirname, "../examples");
        const read = f => Fs.readFileSync(Path.join(examples, f), "utf8");

        await shared.Caches.manifest.set([{
          schemaLabel: "FHIR-ish", schema: read("ClinObs.shex"),
          dataLabel: "two documents", neighborhood: "rdfjs",
          data: [read("ClinObs-observation.ttl"), read("ClinObs-patient.ttl")],
          queryMap: "<http://hl7.example/Obs1>@<ObservationShape>",
        }], "http://localhost/manifest.json");
        $("#inputSchema .manifest li").last().trigger("click");
        await shared.promise;
        $("#inputData .indeterminant li").last().trigger("click");
        await shared.promise;
        $("#validate").trigger("click");
        await shared.promise;

        const source = shared.neighborhoods;
        const es = shared.Caches.editorSupport;
        const docs = source.documents();
        const observationAt = docs.findIndex(d => d.text.indexOf(":valueQuantity") !== -1);
        const patientAt = docs.findIndex(d => d.text.indexOf(":birthdate") !== -1);
        source.show(observationAt);

        const regions = [];
        const pane = es.panes.inputData;
        const wasSet = pane.setHoverRegions;
        pane.setHoverRegions = (rs, leave) => {
          regions.length = 0; regions.push(...(rs || []));
          return wasSet.call(pane, rs, leave);
        };
        try {
          es.setPairHovers(es.lastMapped.pairs);
          // exactly the ranges of the results about this document: an object
          // and a predicate each, and nothing from the document next door
          const here = es.lastMapped.pairs.filter(p => p.doc === observationAt);
          const there = es.lastMapped.pairs.filter(p => p.doc === patientAt);
          expect(there.length, "results about the other document exist").to.be.above(0);
          const ranges = pairs => pairs.reduce((n, p) => n
            + (p.anchors.objectParts || (p.anchors.object ? [p.anchors.object] : [])).length
            + (p.anchors.predicateParts || (p.anchors.predicate ? [p.anchors.predicate] : [])).length, 0);
          expect(regions.length, "one per range of the results shown here")
            .to.equal(ranges(here));

          // a region built while this document was showing, hovered after
          // another has come forward: it may not drag the reader back
          const stale = regions[0];
          expect(stale, "a region to hover").to.exist;
          source.show(patientAt);
          expect(source.showing, "moved by the tab, not by a hover").to.equal(patientAt);
          stale.enter();
          expect(source.showing, "a data hover leaves the document alone").to.equal(patientAt);
        } finally {
          pane.setHoverRegions = wasSet;
          source.show(observationAt);
        }
      });

      /* The failure the reader has to look at may be in a document that
       * wasn't showing when the validation ran: the observation names a
       * patient, the patient's gender is the bad one, and the diagnostic
       * belongs on the patient's line.  Diagnostics used to be computed for
       * the showing document alone and thrown away on moving off it, so
       * that line never got a mark. */
      it("should mark the document that has the bad triple, whichever is showing", async function () {
        this.timeout(60000);
        const examples = Path.join(__dirname, "../examples");
        const read = f => Fs.readFileSync(Path.join(examples, f), "utf8");
        const entry = JSON.parse(Fs.readFileSync(Path.join(examples, "manifest.json"), "utf8"))
              .find(e => e.dataLabel === "two documents, and the mistake is in the second");
        expect(entry, "the manifest's own two-document failure").to.exist;

        await shared.Caches.manifest.set([{
          schemaLabel: "FHIR-ish", schema: read("ClinObs.shex"),
          dataLabel: "the mistake is in the second", neighborhood: "rdfjs",
          data: entry.data, queryMap: entry.queryMap,
        }], "http://localhost/manifest.json");
        $("#inputSchema .manifest li").last().trigger("click");
        await shared.promise;
        $("#inputData .indeterminant li, #inputData .fails li").last().trigger("click");
        await shared.promise;
        $("#validate").trigger("click");
        await shared.promise;

        const source = shared.neighborhoods;
        const es = shared.Caches.editorSupport;
        const docs = source.documents();
        const observationAt = docs.findIndex(d => d.text.indexOf(":subject") !== -1);
        const patientAt = docs.findIndex(d => d.text.indexOf(":gender") !== -1);
        expect(observationAt, "an observation document").to.be.at.least(0);
        expect(patientAt, "a patient document").to.be.at.least(0);

        // what the pane is handed when a tab comes forward is what the
        // reader sees, so ask that rather than the mapping behind it
        const pane = es.panes.inputData;
        const wasSet = pane.setDiagnostics;
        const marks = at => {
          let given = null;
          pane.setDiagnostics = ds => { given = ds; return wasSet.call(pane, ds); };
          try { source.show(at); } finally { pane.setDiagnostics = wasSet; }
          return given || [];
        };

        const inPatient = marks(patientAt);
        expect(inPatient.length, "the patient's document gets a mark of its own").to.be.above(0);
        // and it is on the gender, which is the thing the schema refused
        const patientText = docs[patientAt].text;
        expect(patientText.slice(inPatient[0].from, inPatient[0].to)).to.include("M");
        expect(patientText.lastIndexOf(":gender", inPatient[0].from),
               "the mark sits in the :gender triple").to.be.at.least(0);

        // moving between the tabs re-aims rather than clears: each document
        // keeps its own, and coming back finds them again
        expect(marks(observationAt).length, "the observation is marked too").to.be.above(0);
        expect(marks(patientAt).length, "and the patient still is")
          .to.equal(inPatient.length);
      });

      /* The `spelling` control (doc/error-reporting.md F6): a term is written
       * the way the document the reader is being sent to writes it, or in
       * full.  The editors quote the range the term was written in; the
       * human report has only the prefixes and base to go on. */
      it("should spell terms as the documents do, or in full", async function () {
        this.timeout(60000);
        const examples = Path.join(__dirname, "../examples");
        const read = f => Fs.readFileSync(Path.join(examples, f), "utf8");
        const entry = JSON.parse(Fs.readFileSync(Path.join(examples, "manifest.json"), "utf8"))
              .find(e => e.dataLabel === "two documents, and the mistake is in the second");
        await shared.Caches.manifest.set([{
          schemaLabel: "FHIR-ish", schema: read("ClinObs.shex"),
          dataLabel: "the mistake is in the second", neighborhood: "rdfjs",
          data: entry.data, queryMap: entry.queryMap,
        }], "http://localhost/manifest.json");
        $("#inputSchema .manifest li").last().trigger("click");
        await shared.promise;
        $("#inputData .indeterminant li, #inputData .fails li").last().trigger("click");
        await shared.promise;

        const wasSpelling = $("#spelling").val(), wasInterface = $("#interface").val();
        const es = shared.Caches.editorSupport;
        const say = async mode => {
          $("#spelling").val(mode);
          $("#interface").val("human");
          $("#validate").trigger("click");
          await shared.promise;
          return {marks: [...es.lastMapped.dataByDoc.values()].flat().map(d => d.message).join(" "),
                  human: $("#results .human pre").text()};
        };
        try {
          const friendly = await say("document");
          // <http://hl7.example/Patient2> is what the result carries; the
          // document says <Patient2>, and so does the sentence about it
          expect(friendly.marks).to.include("<Patient2>");
          expect(friendly.marks).to.not.include("http://hl7.example/");
          expect(friendly.human).to.include("validating <Obs1> as <ObservationShape>");
          expect(friendly.human, "the repair names the arc as the schema does")
            .to.include("to conform: add 1 :subject");

          const explicit = await say("explicit");
          expect(explicit.marks).to.include("<http://hl7.example/Patient2>");
          expect(explicit.human).to.include("validating <http://hl7.example/Obs1>");
        } finally {
          $("#spelling").val(wasSpelling);
          $("#interface").val(wasInterface);
        }
      });

      /* The highlight switch (see HighlightMode).  Three resting positions and
     * a momentary key, which is AutoCAD's ortho and Raskin's quasimode: a
     * state your finger holds open is one you cannot forget you are in. */
    describe("the highlight switch", function () {
      const mode = () => shared.HighlightMode;
      const chip = () => $("#highlightMode");
      const key = (type, props) => {
        const evt = $.Event(type, Object.assign({key: "Shift"}, props || {}));
        $(dom.window.document).trigger(evt);
      };

      afterEach(function () {
        // leave the switch where the other tests expect it
        const m = mode();
        if (m) { m.unpin(); m.setHeld(false); m.set("on"); }
      });

      it("should offer a chip that says what the switch is set to", function () {
        expect(chip().length, "the chip").to.equal(1);
        // beside the controls button, sharing its line: #menuForm is a form
        // and so a block, which is why sitting after it put it underneath
        expect(chip().closest("#menuForm").length, "inside the menu form").to.equal(1);
        expect($("#highlightModeRow").prevAll("#menu-button").length,
               "on the controls button's line, after it").to.equal(1);
        expect(chip().closest("#menu-button").length, "beside the button, not inside it")
          .to.equal(0);
        expect(mode(), "the controller is reachable").to.exist;
        mode().set("on");
        expect(chip().attr("data-state")).to.equal("on");
        expect(chip().attr("data-live"), "on means the mouse paints").to.equal("yes");
        expect(chip().text()).to.include("highlight: on");
        expect(chip().attr("aria-pressed")).to.equal("true");
      });

      it("should cycle on click and on ctrl-alt-h", function () {
        mode().set("on");
        chip().trigger("click");
        expect(chip().attr("data-state"), "on -> hold").to.equal("hold");
        chip().trigger("click");
        expect(chip().attr("data-state"), "hold -> off").to.equal("off");
        chip().trigger("click");
        expect(chip().attr("data-state"), "and round").to.equal("on");

        key("keydown", {key: "h", ctrlKey: true, altKey: true});
        expect(chip().attr("data-state"), "the keystroke does the same").to.equal("hold");
      });

      it("should say off is off, and hold is only while held", function () {
        mode().set("off");
        expect(mode().live(), "off").to.equal(false);
        key("keydown");
        expect(mode().live(), "off stays off under the key").to.equal(false);
        key("keyup");

        mode().set("hold");
        expect(mode().live(), "hold, resting").to.equal(false);
        expect(chip().attr("data-live")).to.equal("no");
        key("keydown");
        expect(mode().live(), "hold, held").to.equal(true);
        expect(chip().attr("data-live"), "and the chip says so while it is held").to.equal("yes");
        key("keyup");
        expect(mode().live(), "and back").to.equal(false);
      });

      /* Holding while `on` suspends rather than repeats: that is the
       * inversion AutoCAD's Shift does to Ortho, and it is what lets a
       * reader cross the panes without the mouse repainting on the way. */
      it("should suspend rather than repeat when held in on", function () {
        mode().set("on");
        expect(mode().live()).to.equal(true);
        key("keydown");
        expect(mode().live(), "held suspends").to.equal(false);
        key("keyup");
        expect(mode().live()).to.equal(true);
      });

      it("should let go of the key if the window does", function () {
        mode().set("hold");
        key("keydown");
        expect(mode().live()).to.equal(true);
        $(dom.window).trigger("blur");
        expect(mode().live(), "a key released elsewhere never reaches us").to.equal(false);
      });

      it("should say when a highlight is frozen, and release on Escape", function () {
        mode().set("on");
        expect(mode().frozen()).to.equal(false);
        mode().pin([{}]);
        expect(mode().frozen(), "frozen").to.equal(true);
        expect(chip().attr("data-frozen")).to.equal("yes");
        expect(chip().text(), "and says so").to.include("frozen");
        key("keydown", {key: "Escape"});
        expect(mode().frozen(), "Escape releases it").to.equal(false);
        expect(chip().text()).to.not.include("frozen");
      });
    });

    it("should carry the source and its settings in the permalink", async function () {
        source().select("sparql");
        $("#nbhd-endpoint").val("http://ex.example/sparql").trigger("change");
        const permalink = await shared.app.getPermalink();
        expect(permalink).to.include("neighborhood=sparql");
        expect(permalink).to.include("endpoint=" + encodeURIComponent("http://ex.example/sparql"));

        // ...and a setting belongs to the source that asked for it
        source().select("rdfjs");
        expect(await shared.app.getPermalink()).not.to.include("endpoint=");
      });
    });

    /* "minimal" strips the page back to the schema, the data and the shape
     * map; the shape map area is what stays beside the schema, which is the
     * whole reason that div has a name. */
    it("should keep the shape map, and only that, beside the schema in minimal mode", function () {
      const was = $("#interface").val();
      const display = selector => $(selector).first()[0].style.display;
      try {
        $("#interface").val("minimal").trigger("change");
        expect(display("#shapeMapArea"), "the shape map stays").to.not.equal("none");
        expect(display("#manifestDrop"), "the manifest goes").to.equal("none");
        expect($("#shapeMapArea").siblings().length, "something to hide").to.be.above(0);

        $("#interface").val(was).trigger("change");
        expect(display("#manifestDrop"), "and comes back").to.not.equal("none");
      } finally {
        $("#interface").val(was).trigger("change");
      }
    });

    /* A failure comes with what would make the node conform, and each arc of
     * that is pinned on the constraint it is about -- "to conform: add 1"
     * beside the property the node hasn't got (doc/error-normalization.md
     * §4). */
    it("should pin what would make the node conform on the constraint it is about", async function () {
      const set = (selector, value) => {
        const elt = $(selector).first();
        elt.val(value);
        elt.trigger("change");
      };
      set("#inputSchema textarea", [
        "PREFIX : <http://a.example/>",
        ":S { :name . ; :mbox . }",
      ].join("\n"));
      set("#inputData textarea", [
        "PREFIX : <http://a.example/>",
        ':x :name "Bob" .',
      ].join("\n"));
      set("#queryMap", "<http://a.example/x>@<http://a.example/S>");
      await shared.promise;
      $("#validate").trigger("click");
      await shared.promise;

      const mapped = shared.Caches.editorSupport.lastMapped;
      const schemaText = $("#inputSchema textarea").first().val();
      const notes = mapped.schema.filter(d => d.message.indexOf("to conform") !== -1);
      expect(notes.length, "a note about conforming").to.be.above(0);
      expect(notes[0].message).to.equal("to conform: add 1");
      // ...on the constraint that wants it, not on the one the node has
      expect(schemaText.substring(notes[0].from, notes[0].to)).to.include(":mbox");
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
      set("#queryMap", "<http://a.example/x>@<http://a.example/S>");
      await shared.promise; // the #queryMap change handler's copyQueryMapToEditMap
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

    it("should leave the editors out of the permalink and name the textareas", async function () {
      expect($("#editors").val(), "the editors are what the app is").to.equal("");
      const on = await permalink();
      expect(on, "the default rides free: " + on).to.not.include("editors=");

      $("#editors").val("textarea").trigger("change");
      const off = await permalink();
      expect(off, "asking for the textareas is carried: " + off).to.include("editors=textarea");
      $("#editors").val("").trigger("change"); // put them back for the rest

      async function permalink () {
        $("#permalink a").removeAttr("href"); // built afresh when the menu opens
        $("#menu-button").trigger("click");
        let href;
        for (let i = 0; i < 100 && !(href = $("#permalink a").attr("href")); ++i)
          await new Promise(resolve => setTimeout(resolve, 20));
        $("#menu-button").trigger("click"); // close it again
        return href;
      }
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
      set("#queryMap", "<http://a.example/x>@!<http://a.example/S>"); // expected to fail
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

    it("should fit the appinfo results pane and hover TestedTriples back to schema and data", async function () {
      const set = (selector, value) => {
        const elt = $(selector).first();
        elt.val(value);
        elt.trigger("change");
      };
      set("#queryMap", "<http://a.example/x>@<http://a.example/S>"); // conformant again
      await shared.promise;
      const origInterface = $("#interface").val();
      $("#interface").val("appinfo");
      try {
        $("#validate").trigger("click");
        await shared.promise;

        const es = shared.Caches.editorSupport;
        const rw = es.app.resultsWidget;
        expect(rw.resultPanes.length, "appinfo pane created").to.be.above(0);
        // a results pane has no textarea to inherit from, so it takes the
        // colours of where the app put it
        expect($("#results .results").length, "the pane sits in a painted holder").to.be.above(0);
        const painted = [];
        $("style").each((i, s) => painted.push($(s).text()));
        expect(painted.join("\n"), "the results tint").to.include("rgb(255, 255, 244)");
        const {pane, ranges} = rw.resultPanes[0];
        expect(ranges.length, "TestedTriples mapped").to.be.above(0);
        // no height of its own: the results have a box now, and the tab
        // it is in is what scrolls
        expect(pane.dom.style.height, "left to the box it is in").to.equal("");

        // hovering a TestedTriple highlights its constraint and its triple:
        // swap in a spy pane and re-derive the hover regions
        const spy = {
          regions: null, highlights: [],
          setHoverRegions (regions, _leave) { this.regions = regions; },
          highlight (rs, cls, opts) { this.highlights.push({rs, cls, opts}); },
          clearHighlights () {},
        };
        rw.resultPanes[0] = {pane: spy, ranges};
        const calls = {schema: [], data: []};
        const origSchema = es.panes.inputSchema.highlight;
        const origData = es.panes.inputData.highlight;
        es.panes.inputSchema.highlight = (rs, cls, opts) => calls.schema.push({rs, cls, opts});
        es.panes.inputData.highlight = (rs, cls, opts) => calls.data.push({rs, cls, opts});
        try {
          es.setPairHovers(es.lastMapped.pairs);
          expect(spy.regions.length, "a hover region per TestedTriple").to.be.above(0);
          spy.regions[0].enter();
          const schemaText = $("#inputSchema textarea").first().val();
          expect(calls.schema.length, "schema highlighted").to.be.above(0);
          expect(calls.schema[0].rs.map(r => schemaText.substring(r.from, r.to)))
            .to.include(":p xsd:integer");
          const dataText = $("#inputData textarea").first().val();
          expect(calls.data.length, "data highlighted").to.be.above(0);
          const dataSlices = calls.data[0].rs.map(r => dataText.substring(r.from, r.to));
          expect(dataSlices).to.include("42");
          expect(dataSlices).to.include(":x");
          // the pane the mouse is in doesn't auto-scroll
          expect(spy.highlights.length, "hovered TestedTriple highlighted in place").to.be.above(0);
          expect(spy.highlights[0].opts.scroll).to.equal(false);
        } finally {
          es.panes.inputSchema.highlight = origSchema;
          es.panes.inputData.highlight = origData;
          rw.resultPanes[0] = {pane, ranges};
        }
      } finally {
        $("#interface").val(origInterface);
      }
    });

    /* A mark is a claim about a validation of one schema against one
     * document.  Editing either makes the claim stale in *both* panes, but
     * only the edited one noticed: its own linter re-runs and replaces what
     * is there, while the other pane, which nothing had happened to, kept
     * pointing at an error that was no longer being made. */
    it("should clear the marks in both panes when either is edited", async function () {
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
      set("#inputData textarea", 'PREFIX : <http://a.example/>\n:x :p "not a number" .');
      set("#queryMap", "<http://a.example/x>@<http://a.example/S>");
      await shared.promise;
      $("#validate").trigger("click");
      await shared.promise;

      const support = shared.Caches.editorSupport;
      expect(support.lastMapped.schema.length, "the schema is marked").to.be.above(0);
      expect(support.lastMapped.data.length, "and so is the data").to.be.above(0);

      const asked = [];
      const real = {};
      ["inputSchema", "inputData"].forEach(name => {
        const pane = support.panes[name];
        real[name] = pane.setDiagnostics.bind(pane);
        pane.setDiagnostics = ds => { asked.push([name, ds.length]); return real[name](ds); };
      });
      try {
        // one keystroke in the data, and the schema's marks go with it
        $("#inputData textarea").first().trigger($.Event("keyup", {keyCode: 65}));
        expect(asked.map(a => a[0]).sort(), "both panes were told")
          .to.deep.equal(["inputData", "inputSchema"]);
        expect(asked.every(a => a[1] === 0), "and told nothing is marked").to.equal(true);
        expect(support.lastMapped, "the mapping goes too").to.equal(null);
      } finally {
        ["inputSchema", "inputData"].forEach(
          name => { support.panes[name].setDiagnostics = real[name]; });
      }
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
        await shared.promise;           // dataInputHandler -> copyQueryMapToEditMap
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
      // jsdom has no layout, so the width falls back to what the textarea
      // asked for.  The height doesn't: a pane in a box that fills the page
      // (#schemaDocument is a flex column) takes the column's height rather
      // than the rows the textarea named, and says so by setting none.
      const paneStyle = $("#inputSchema .shexjs-editor-pane")[0].style;
      expect(paneStyle.width, "width set").to.not.equal("");
      expect(paneStyle.height, "the column gives the height").to.equal("");
    });

    it("should step through a triple-expression match with a thread list", async function () {
      const set = (selector, value) => {
        const elt = $(selector).first();
        elt.val(value);
        elt.trigger("change");
      };
      set("#inputSchema textarea", [
        "PREFIX : <http://a.example/>",
        ":S {",
        "  :p . ;",
        "  (:q . ;", // gutter breakpoints are line-granular: :q needs its own line
        "   :r .){1,2}",
        "}",
      ].join("\n"));
      set("#inputData textarea", [
        "PREFIX : <http://a.example/>",
        ":x :p 0 ; :q 1 ; :r 2 ; :q 3 ; :r 4 .",
      ].join("\n"));
      set("#queryMap", "<http://a.example/x>@<http://a.example/S>");
      await shared.promise;

      // a gutter breakpoint on the :q constraint's line
      const pane = shared.Caches.editorSupport.panes.inputSchema;
      const schemaText = $("#inputSchema textarea").first().val();
      pane.toggleBreakpoint(schemaText.indexOf(":q ."));

      $("#debugValidate").trigger("click");
      const session = await shared.promise;
      expect(session, "session started: " + $("#results").text().substring(0, 120)).to.exist;
      expect($("#valDebugControls").css("display")).not.to.equal("none");
      expect($("#valDbgMatches option").length, "one recorded match").to.equal(1);
      expect($("#valDbgMatches option").first().text()).to.include("x@");

      // three rows, and the button that started this stands down: pressing
      // it again would open a second session over the same results
      $("#valDbgMatchesRow, #valDbgStatusRow").each((i, e) =>
        expect($(e).css("display"), e.id).to.not.equal("none"));
      expect($("#debugValidate").css("display"), "the bug button").to.equal("none");
      // the step buttons sit beside #validate, not below it
      expect($("#valDbgContinue").closest("#valDbgMatchesRow, #valDbgStatusRow").length,
             "the step buttons are on the first row").to.equal(0);
      expect($("#valDbgMatches").closest("#valDbgMatchesRow").length, "matches row").to.equal(1);
      expect($("#valDbgStatus").closest("#valDbgStatusRow").length, "status row").to.equal(1);

      // step into: the first constraint event, with live threads listed
      $("#valDbgInto").trigger("click");
      expect($("#valDbgStatus").text()).to.include("at <http://a.example/p>");
      expect($("#valDbgThreads button").length, "threads listed").to.be.above(0);

      // continue runs to the :q gutter breakpoint
      expect(session.pane.listBreakpoints().length, "gutter breakpoint listed").to.equal(1);
      expect([...session.dbg.breakpoints.tcs][0].predicate, "breakpoint constraint")
        .to.equal("http://a.example/q");
      $("#valDbgContinue").trigger("click");
      expect($("#valDbgStatus").text()).to.include("at <http://a.example/q>");

      // a thread's aspects: state-machine position, repeats, matched partition
      $("#valDbgThreads button").first().trigger("mouseenter");
      expect($("#results").text()).to.include("matched partition");

      // run past the remaining breakpoint hits to the end of the match
      for (let i = 0; i < 10 && !$("#valDbgStatus").text().includes("match finished"); ++i)
        $("#valDbgContinue").trigger("click");
      expect($("#valDbgStatus").text()).to.include("match finished: matched");

      $("#valDbgStop").trigger("click");
      expect($("#valDebugControls").css("display")).to.equal("none");
      $("#valDbgMatchesRow, #valDbgStatusRow").each((i, e) =>
        expect($(e).css("display"), e.id).to.equal("none"));
      expect($("#debugValidate").css("display"), "the bug button is back").to.not.equal("none");
      pane.toggleBreakpoint(schemaText.indexOf(":q .")); // clean up the gutter
    });

    /* Validating again is not "continue, ignoring breakpoints" -- that is ▶.
     * It re-runs the whole validation and replaces the results the session's
     * recorded matches were taken from, so the session goes with them rather
     * than stepping through something that is no longer on screen. */
    it("should end a debug session when a new validation replaces its results", async function () {
      this.timeout(60000);
      const set = (selector, value) => {
        const elt = $(selector).first();
        elt.val(value);
        elt.trigger("change");
      };
      set("#inputSchema textarea", "PREFIX : <http://a.example/>\n:S { :p . }");
      set("#inputData textarea", "PREFIX : <http://a.example/>\n:x :p 1 .");
      set("#queryMap", "<http://a.example/x>@<http://a.example/S>");
      await shared.promise;

      $("#debugValidate").trigger("click");
      const session = await shared.promise;
      expect(session, "a session to interrupt").to.exist;
      expect(shared.app.valDebugSession, "live").to.exist;

      // validate refuses within 100ms of the last shape-map error ("...again
      // to continue"), and an earlier test in this file may have left one --
      // so wait that out, or this asserts about a validation that declined
      // to happen.  A session outliving *that* is right: nothing replaced it.
      await new Promise(res => dom.window.setTimeout(res, 150));
      const before = shared.promise;
      $("#validate").trigger("click");
      expect(shared.promise, "the validation actually started").to.not.equal(before);
      await shared.promise;
      expect(shared.app.valDebugSession, "the session went with its results").to.equal(null);
      expect($("#valDebugControls").css("display")).to.equal("none");
      expect($("#debugValidate").css("display"), "and 🐞 is offered again").to.not.equal("none");
    });

    it("should toggle editors off and on from the menu select", function () {
      const schemaTextarea = $("#inputSchema textarea").first();
      const before = schemaTextarea.val();

      $("#editors").val("textarea").trigger("change");
      expect($(".shexjs-editor-pane").length, "panes removed").to.equal(0);
      expect(schemaTextarea[0].style.display).not.to.equal("none");
      expect(schemaTextarea.val(), "textarea kept the edited text").to.equal(before);
      expect(shared.Caches.editorSupport, "stash removed").to.equal(undefined);

      $("#editors").val("").trigger("change");
      expect($("#inputSchema .shexjs-editor-pane").length, "schema pane back").to.equal(1);
      expect($("#inputSchema textarea").first().val(), "text survived the round trip").to.equal(before);
    });
  });
  /* The editors used to be the thing you asked for; now they are the app and
   * ?editors=textarea is the ask.  Both ends, from a cold boot. */
  describe("what a page boots with", function () {
    this.timeout(20000);
    const page = "packages/shex-webapp/doc/shex-simple.html";
    let dom;

    afterEach(function () {
      if (dom)
        dom.window.close();
      dom = null;
    });

    async function boot (search) {
      const base = Path.join(__dirname, "../../..", page);
      const virtualConsole = new jsdom.VirtualConsole().forwardTo(console);
      virtualConsole.removeAllListeners("debug");
      dom = new JSDOM(Fs.readFileSync(base, "utf8"), {
        url: GitRootServer.urlFor(page + search),
        runScripts: "dangerously",
        resources: StaticResourceConfig,
        pretendToBeVisual: true, // CodeMirror needs rAF etc.
        virtualConsole,
      });
      dom.window.fetch = node_fetch;
      if (!dom.window.CSS)
        dom.window.CSS = { escape: s => String(s).replace(/[^a-zA-Z0-9_\u00A0-\uFFFF-]/g, c => `\\${c}`) };
      dom.window.Range.prototype.getClientRects = function () { return []; };
      dom.window.Range.prototype.getBoundingClientRect =
        function () { return {x: 0, y: 0, top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0}; };
      const shared = await new Promise((resolve, reject) => {
        dom.window._testCallback = (parm) => parm instanceof Error ? reject(parm) : resolve(parm);
      });
      await shared.promise;
      return {$: dom.window.$, shared};
    }

    it("should open with the editors when nothing is asked for", async function () {
      const {$} = await boot("");
      expect($("#editors").val(), "the select agrees").to.equal("");
      expect($("#inputSchema .shexjs-editor-pane").length, "schema pane").to.equal(1);
      expect($("#inputData .shexjs-editor-pane").length, "data pane").to.equal(1);
      expect($("#inputSchema textarea").first()[0].style.display, "textarea stood down")
        .to.equal("none");
    });

    it("should open with textareas when ?editors=textarea asks for them", async function () {
      const {$} = await boot("?editors=textarea");
      expect($("#editors").val(), "the select agrees").to.equal("textarea");
      expect($(".shexjs-editor-pane").length, "no panes anywhere").to.equal(0);
      expect($("#inputSchema textarea").first()[0].style.display, "the textarea is the pane")
        .to.not.equal("none");
    });

    /* A link that carries a schema does not validate on arrival.  The code
     * said it did and threw a ReferenceError instead, for the two years
     * since these became methods of a class, so nothing had ever run it --
     * and opening a link is not asking for the walk behind it: a permalink
     * may name an endpoint, where validating costs a hundred requests to
     * somebody else's service. */
    it("should load what a link carries without validating it", async function () {
      const {$, shared} = await boot("?" + [
        "schema=" + encodeURIComponent("PREFIX : <http://a.example/>\n:S { :p . }"),
        "data=" + encodeURIComponent("PREFIX : <http://a.example/>\n:x :p 1 ."),
        "shape-map=" + encodeURIComponent("<http://a.example/x>@<http://a.example/S>"),
      ].join("&"));
      expect($("#inputSchema textarea").first().val(), "the schema arrived").to.include(":S {");
      expect($("#inputData textarea").first().val(), "and the data").to.include(":x :p 1");
      expect($("#fixedMap .pair").length, "and the map it says to validate").to.equal(1);
      expect($("#results .passes, #results .error").length,
             "but nothing has been validated").to.equal(0);
      expect(shared.app.valDebugSession, "and nothing is running").to.not.exist;
    });

    it("should read the words that used to turn them off as textareas", async function () {
      const {$} = await boot("?editors=false");
      expect($("#editors").val(), "?editors=false means the textareas").to.equal("textarea");
      expect($(".shexjs-editor-pane").length, "so no panes").to.equal(0);
    });
  });
}
