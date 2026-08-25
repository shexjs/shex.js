/** An extension from somewhere else (doc/extension-ui-plan.md §5 phase 5).
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
let JSDOM, VirtualConsole;

const ROOT = Path.join(__dirname, "../../..");
const [[GitRootServer, ElsewhereServer]] = require("../../../tools/testServer")
      .startServer(
        [ { url: "http://localhost:9999/shex.js/", fromDir: ROOT },
          // somebody else's host, on somebody else's port
          { url: "http://localhost:9994/extensions/", fromDir: Path.join(ROOT, "doc/plugin-skeleton") },
        ]
      );

const PAGE = "packages/shex-webapp/doc/shex-simple.html";
const HELLO_ID = "http://example.org/extensions/Hello/";
const ELSEWHERE = ElsewhereServer.urlFor("hello-plugin.js");

if (!TEST_browser) {
  console.warn("Skipping plugin-cross-origin-tests; to activate these tests, set environment variable TEST_browser=true");
} else {
  ({JSDOM, VirtualConsole} = require("jsdom"));

  describe("a plugin from another origin", function () {
    this.timeout(20000);
    let dom, $, shared;

    before(async function () {
      const virtualConsole = new VirtualConsole().forwardTo(console, {jsdomErrors: "none"});
      dom = new JSDOM(Fs.readFileSync(Path.join(ROOT, PAGE), "utf8"), {
        url: GitRootServer.urlFor(PAGE + "?editors=1&plugin=" + encodeURIComponent(ELSEWHERE)),
        runScripts: "dangerously",
        resources: "usable",
        pretendToBeVisual: true,
        virtualConsole,
      });
      dom.window.fetch = node_fetch;
      if (!dom.window.CSS)
        dom.window.CSS = { escape: s => String(s).replace(/[^a-zA-Z0-9_ -￿-]/g, c => `\\${c}`) };
      dom.window.Range.prototype.getClientRects = function () { return []; };
      dom.window.Range.prototype.getBoundingClientRect =
        function () { return {x: 0, y: 0, top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0}; };
      shared = await new Promise((resolve, reject) => {
        dom.window._testCallback = parm => parm instanceof Error ? reject(parm) : resolve(parm);
      });
      await shared.promise;
      $ = dom.window.$;
    });

    after(function () { if (dom) dom.window.close(); });

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
      const card = $("#extensionPanes > [data-plugin]");
      expect(card.attr("data-plugin")).to.equal(HELLO_ID);
      expect(card.children("[id]").map((i, e) => e.id).get()).to.deep.equal(["helloSaid"]);
      expect(card.find(".pluginToolbar button").map((i, b) => b.id).get())
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
}
