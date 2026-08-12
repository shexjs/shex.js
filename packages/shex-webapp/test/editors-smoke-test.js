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
  describe("shex-simple with ?editors=1", function () {
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
      set("#textMap", "<http://a.example/x>@<http://a.example/S>");
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
          .to.deep.equal(["rdfjs", "sparql", "wikidata"]);
        expect($("#neighborhood").val()).to.equal("rdfjs");
        expect($("#neighborhood option:selected").text()).to.equal("Turtle");
        // settings on the left, one document tab beside it, and that
        // document is what shows (jsdom lays nothing out, so "showing" is
        // the display style)
        expect(tabs()).to.deep.equal(["settings", "Turtle data"]);
        expect($("#neighborhoodFields .noSettings").length, "nothing to configure").to.equal(1);
        expect(source().paneParam.pane.label).to.equal("Turtle data");
        expect(shown("#dataDocument")).to.equal(true);
        expect(shown("#addDataPane"), "one graph is one document").to.equal(false);
      });

      it("should draw a query service as fields, with no document at all", function () {
        source().select("sparql");
        const fields = $("#neighborhoodFields label").map((i, l) => $(l).text().trim()).get();
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
        source().select("wikidata");
        // which entities are in play is one list; their pages are documents
        // of their own, and there are none until you open one
        expect(tabs(), "one to start").to.deep.equal(["settings", "entity ids"]);
        expect(shown("#addDataPane"), "and a way to open another").to.equal(true);

        $("#addDataPane").trigger("click");
        expect(tabs().length).to.equal(3);
        // a fresh page starts from the module's template, and its tab is
        // named by the module reading the page's id back out of it
        expect($("#inputData textarea").first().val()).to.include('"entities"');
        expect(tabs()[2]).to.equal("Q0");

        // the panes not showing are still there to be validated with
        $("#inputData textarea").first().val('{"entities": {"Q42": {"id": "Q42"}}}');
        source().show(1);                     // back to the id list
        expect(tabs()[2], "a tab is named by the page in it").to.equal("Q42");
        expect(source().params().pages).to.deep.equal(['{"entities": {"Q42": {"id": "Q42"}}}']);
        // ...and a pane nobody has written in isn't a document
        expect(source().params().data).to.deep.equal([]);
        expect(tabs()[2], "a tab is named by the page in it").to.equal("Q42");
      });

      it("should give each pane the language its source says it is in", function () {
        source().select("rdfjs");
        expect(source().paneEditor().language).to.equal("turtle");
        source().select("wikidata");
        expect(source().paneEditor(), "a list of ids is not a language").to.equal(null);
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
          dataLabel: "two entities", neighborhood: "wikidata", data: pages,
          queryMap: '<http://www.wikidata.org/entity/Q1>@<#S>',
        }], "http://localhost/manifest.json");

        $("#inputSchema .manifest li").last().trigger("click");
        await shared.promise;
        $("#inputData .indeterminant li").last().trigger("click");
        await shared.promise;

        expect($("#neighborhood").val(), "the entry named its source").to.equal("wikidata");
        // the source sorted them out: two pages, and the ids they are about
        expect(tabs()).to.deep.equal(["settings", "entity ids", "Q1", "Q2"]);
        expect(source().texts("data")).to.deep.equal(["Q1 Q2"]);
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
        source().select("wikidata");
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
        expect($("#neighborhood").val()).to.equal("wikidata");
        expect($("#nbhd-base").val()).to.equal("https://www.wikidata.org/wiki/Special:EntityData/");
        expect(source().texts("data"), "the entry said which entity").to.deep.equal(["Q42"]);
        // ...and the endpoint didn't follow it here
        expect($("#nbhd-endpoint").length).to.equal(0);

        await pick(2);
        expect($("#neighborhood").val()).to.equal("wikidata");
        expect(tabs()[2], "the downloaded page, named by the id in it").to.equal("Q42");
        expect(source().texts("data"), "and the id it is about").to.deep.equal(["Q42"]);
        expect(source().texts("pages")[0]).to.include('"lastrevid"');
      });

      /* A QueryMap may ask the source which nodes to validate.  Which
       * questions can be asked is the source's business: only a query
       * service can run SPARQL, only a Wikibase knows what Q42 means, and a
       * source that does not understand an extension says which one it is
       * and which source refused it. */
      it("should resolve a QueryMap extension through the selected source", async function () {
        source().select("wikidata");
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
          dataLabel: "Q42, handed over whole", neighborhood: "wikidata",
          data: JSON.stringify(page),
          regexpEngine: "eval-simple-1err",
          queryMap: 'QENTITIES "42"@START',
        }], "http://localhost/manifest.json");
        $("#inputSchema .manifest li").last().trigger("click");
        await shared.promise;
        $("#inputData .indeterminant li").last().trigger("click");
        await shared.promise;

        expect($("#neighborhood").val()).to.equal("wikidata");
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
          source().select("wikidata");
          source().show(0);            // a document tab, after the settings pane
          expect(measured, "hidden and shown again").to.be.above(0);
        } finally {
          pane.requestMeasure = wasRequestMeasure;
        }
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

    it("should fit the appinfo results pane and hover TestedTriples back to schema and data", async function () {
      const set = (selector, value) => {
        const elt = $(selector).first();
        elt.val(value);
        elt.trigger("change");
      };
      set("#textMap", "<http://a.example/x>@<http://a.example/S>"); // conformant again
      await shared.promise;
      const origInterface = $("#interface").val();
      $("#interface").val("appinfo");
      try {
        $("#validate").trigger("click");
        await shared.promise;

        const es = shared.Caches.editorSupport;
        const rw = es.app.resultsWidget;
        expect(rw.resultPanes.length, "appinfo pane created").to.be.above(0);
        const {pane, ranges} = rw.resultPanes[0];
        expect(ranges.length, "TestedTriples mapped").to.be.above(0);
        // fitted to the bottom of the window; scrolls internally
        expect(pane.dom.style.height).to.match(/^\d+px$/);

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
      set("#textMap", "<http://a.example/x>@<http://a.example/S>");
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
      pane.toggleBreakpoint(schemaText.indexOf(":q .")); // clean up the gutter
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
