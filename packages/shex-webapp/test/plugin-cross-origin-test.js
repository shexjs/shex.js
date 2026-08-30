/** An extension from somewhere else (doc/plugins.md, From another origin).
 *
 * The two extensions in this repository are served from the same host as
 * the page, which proves nothing about the case the contract is for: an
 * extension somebody else wrote, on somebody else's host.  This serves
 * doc/plugin-skeleton/ from a second origin and loads it from there.
 *
 * What a browser needs from that host, and this checks for, is
 * Access-Control-Allow-Origin on the module: the app fetches the module
 * before it runs it.  (The page tests use node-fetch, which does not
 * enforce CORS, so the header is asserted rather than relied on.)
 */
"use strict";

const TEST_browser = "TEST_browser" in process.env ? JSON.parse(process.env["TEST_browser"]) : false;

const Fs = require("fs");
const Path = require("path");
const expect = require("chai").expect;
const node_fetch = require("node-fetch");
let Harness;

const ROOT = Path.join(__dirname, "../../..");
const [[GitRootServer, ElsewhereServer, ElsewhereRepoServer]] = require("../../../tools/testServer")
      .startServer(
        [ { url: "http://localhost:9999/shex.js/", fromDir: ROOT },
          // somebody else's host, on somebody else's port
          { url: "http://localhost:9994/extensions/", fromDir: Path.join(ROOT, "doc/plugin-skeleton") },
          // ...and a host serving a whole plugin with a worker half
          { url: "http://localhost:9993/elsewhere/", fromDir: ROOT },
        ]
      );

const PAGE = "packages/shex-webapp/doc/shex-simple.html";
const HELLO_ID = "http://example.org/extensions/Hello/";
const ELSEWHERE = ElsewhereServer.urlFor("hello-plugin.js");
const ELSEWHERE_ORIGIN = new URL(ELSEWHERE).origin;

if (!TEST_browser) {
  console.warn("Skipping plugin-cross-origin-tests; to activate these tests, set environment variable TEST_browser=true");
} else {
  Harness = require("./harness");

  describe("a plugin from another origin", function () {
    this.timeout(20000);
    let dom, $, shared, errors;

    before(async function () {
      // trusted up front; the question itself is the last suite in this file
      ({dom, $, shared, errors} = await Harness.boot(PAGE, "?editors=1&plugin=" + encodeURIComponent(ELSEWHERE),
                                                    {trust: [ELSEWHERE_ORIGIN]}));
    });

    after(function () {
      if (dom) dom.window.close();
      Harness.expectClean(errors);
    });

    /* Two origins, or the rest of this proves nothing. */
    it("should have been fetched from a host that is not the page's", function () {
      expect(new dom.window.URL(ELSEWHERE).origin)
        .to.not.equal(new dom.window.URL(dom.window.location.href).origin);
    });

    it("should say where it came from, so it can name its own files", function () {
      const ext = dom.window.ShExPlugins.byId(HELLO_ID);
      expect(ext, "registered").to.exist;
      expect(ext.baseUrl, "stamped by whoever fetched it").to.equal(ELSEWHERE);
    });

    it("should build what it declared, on a page that has never seen it", function () {
      const screen = $("#screens > .screen[data-plugin]");
      expect(screen.attr("data-plugin")).to.equal(HELLO_ID);
      expect(screen.find(".panel > div[id]").map((i, e) => e.id).get()).to.deep.equal(["helloSaid"]);
      expect(screen.find(".pluginToolbar button").map((i, b) => b.id).get())
        .to.deep.equal(["hello"]);
      expect($("head style[data-plugin]").attr("data-plugin")).to.equal(HELLO_ID);
    });

    /* ...and its handler runs, which is the half that has to reach the
     * validator rather than the page. */
    it("should hand its handler to the validator", async function () {
      const set = (selector, value) => {
        const elt = $(selector).first();
        elt.val(value);
        elt.trigger("change");
      };
      set("#inputSchema textarea", [
        "PREFIX : <http://a.example/>",
        "PREFIX Hello: <" + HELLO_ID + ">",
        ':S { :p . %Hello:{ said it %} }',
      ].join("\n"));
      set("#inputData textarea", "PREFIX : <http://a.example/>\n:x :p 1 .");
      set("#queryMap", "<http://a.example/x>@<http://a.example/S>");
      await shared.promise;
      $("#validate").trigger("click");
      await shared.promise;
      expect($("#results .passes").length, "an action that only looks").to.be.above(0);

      $("#hello").trigger("click");
      await shared.promise;
      const said = JSON.parse($("#helloSaid textarea").first().val());
      expect(said.map(s => s.code)).to.deep.equal(["said it"]);
    });

    /* The header a browser insists on before it hands a cross-origin
     * response to the page that asked for it. */
    it("should be served by a host that permits the reader", async function () {
      const resp = await node_fetch(ELSEWHERE);
      expect(resp.ok).to.equal(true);
      expect(resp.headers.get("access-control-allow-origin"),
             "or no browser would let the app read it").to.equal("*");
    });
  });

  /* The worker half of the same story: the app names its plugins' worker
   * scripts absolutely, so a plugin from another origin has its half
   * importScripts'd across origins too.  Unlike the module -- which the
   * app fetch()es, so CORS gates it -- a classic worker's importScripts is
   * a no-cors fetch like a script tag; what it *is* held to is a
   * JavaScript MIME type.  The fake worker resolves URLs through an
   * explicit map that only knows the second origin, so a worker half named
   * on the wrong origin fails here rather than quietly loading a local
   * copy. */
  describe("a plugin whose worker half is on another origin", function () {
    this.timeout(20000);
    const page = "packages/shex-webapp/doc/shex-simple.html";
    const MAP_ELSEWHERE = ElsewhereRepoServer.urlFor("packages/extension-map/doc/ShExMapPlugin.js");
    let dom, $, shared;

    before(async function () {
      // the only served URLs this worker can resolve are the second
      // origin's, which is the point
      ({dom, $, shared} = await Harness.boot(page, "?editors=1&worker=1&plugin=" + encodeURIComponent(MAP_ELSEWHERE),
                                            {worker: [{prefix: ElsewhereRepoServer.urlFor(""), dir: ROOT}],
                                             trust: [new URL(MAP_ELSEWHERE).origin]}));
    });
    after(function () { if (dom) dom.window.close(); });

    it("should name the worker half on the origin the plugin came from", function () {
      const ext = dom.window.ShExPlugins.byId("http://shex.io/extensions/Map/#");
      expect(ext.baseUrl, "stamped with where it was fetched from").to.equal(MAP_ELSEWHERE);
      expect(new dom.window.URL(ext.worker, ext.baseUrl).origin)
        .to.not.equal(new dom.window.URL(dom.window.location.href).origin);
    });

    it("should materialize through a worker half imported from over there", async function () {
      const set = (selector, value) => {
        const elt = $(selector).first();
        elt.val(value);
        elt.trigger("change");
      };
      set("#outputSchema textarea", [
        "PREFIX : <http://a.example/>",
        "PREFIX Map: <http://shex.io/extensions/Map/#>",
        "start = @:S",
        ":S { :p . %Map:{ :v1 %} }",
      ].join("\n"));
      set("#bindings1 textarea", JSON.stringify({"http://a.example/v1": {value: "one"}}));
      set("#staticVars textarea", "{}");
      $("#outputShapeMap").val("<tag:root>@<http://a.example/S>");
      $("#materialize").trigger("click");
      await shared.promise;
      const [{text}] = shared.Caches.editorSupport.lastMaterialized;
      expect(text, "the graph the far half built").to.include('"one"');
    });

    /* What a host serving worker halves is actually held to: the MIME
     * type.  (The always-on CORS header is the test double being easy,
     * not a requirement -- see doc/plugins.md, "From another origin".) */
    it("should serve the worker half as JavaScript", async function () {
      const ext = dom.window.ShExPlugins.byId("http://shex.io/extensions/Map/#");
      const resp = await node_fetch(new URL(ext.worker, ext.baseUrl).href);
      expect(resp.ok).to.equal(true);
      expect(resp.headers.get("content-type")).to.equal("text/javascript");
    });
  });

  /* Before any of the above: a plugin from another origin is put to the
   * reader (doc/plugins.md, "Trust").  The suites above answered up front
   * by trusting the origin; this one answers at the dialog. */
  describe("the question a plugin from another origin raises", function () {
    this.timeout(20000);
    let dom, $, shared, app, errors;
    const asking = () => $("#trustForm").dialog("isOpen");
    // the question is asked a microtask after the load is asked for
    const tick = () => new Promise(resolve => dom.window.setTimeout(resolve, 0));

    before(async function () {
      ({dom, $, shared, app, errors} = await Harness.boot(PAGE, "?editors=1"));
    });
    after(function () {
      if (dom) dom.window.close();
      Harness.expectClean(errors);
    });

    it("should ask, naming the site, and not load when the reader declines", async function () {
      const loading = app.loadPlugins([ELSEWHERE]);
      await tick();
      expect(asking(), "asked").to.equal(true);
      expect($("#trustForm .origin").text()).to.equal(ELSEWHERE_ORIGIN);
      expect($("#trustForm .url").text()).to.equal(ELSEWHERE);
      $("#trustNot").trigger("click");
      await loading;
      expect(asking(), "answered").to.equal(false);
      expect(dom.window.ShExPlugins.byId(HELLO_ID), "not loaded").to.not.exist;
      expect($("#results .error").last().text()).to.include("declined");
    });

    it("should load when the reader says so, and ask again next time", async function () {
      let loading = app.loadPlugins([ELSEWHERE]);
      await tick();
      expect(asking()).to.equal(true);
      $("#trustOnce").trigger("click");
      await loading;
      expect(dom.window.ShExPlugins.byId(HELLO_ID), "loaded").to.exist;
      expect(dom.window.sessionStorage.getItem("shex-plugin-origins"), "not remembered").to.equal(null);

      loading = app.loadPlugins([ELSEWHERE + "?again"]);
      await tick();
      expect(asking(), "asked again").to.equal(true);
      $("#trustNot").trigger("click");
      await loading;
    });

    it("should remember a site the reader said may keep loading, for the tab", async function () {
      let loading = app.loadPlugins([ELSEWHERE + "?third"]);
      await tick();
      expect(asking()).to.equal(true);
      $("#trustOrigin").trigger("click");
      await loading;
      expect(JSON.parse(dom.window.sessionStorage.getItem("shex-plugin-origins")))
        .to.deep.equal([ELSEWHERE_ORIGIN]);

      loading = app.loadPlugins([ELSEWHERE + "?fourth"]);
      await tick();
      expect(asking(), "not asked").to.equal(false);
      await loading;
    });

    it("should not ask about the page's own origin", async function () {
      const loading = app.loadPlugins([GitRootServer.urlFor("doc/plugin-skeleton/hello-plugin.js")]);
      await tick();
      expect(asking()).to.equal(false);
      await loading;
    });
  });
}
