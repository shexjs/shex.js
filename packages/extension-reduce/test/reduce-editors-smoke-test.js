/** ShExReduce as an extension of the app page (doc/extension-ui-plan.md §5
 * phase 4): the second extension, and the one that says whether the contract
 * is a contract or just ShExMap's shape written out.
 *
 * shex-simple.html has never heard of folding actions over a parse.  Told
 * where ShExReduce is, it grows the panes, the verb and the handler -- and
 * one thing ShExMap never wanted: a say in the schema, for actions that
 * arrive in a document of their own.
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
const REDUCE_ID = "http://shex.io/extensions/Reduce/";

if (!TEST_browser) {
  console.warn("Skipping reduce-editors-smoke-tests; to activate these tests, set environment variable TEST_browser=true");
} else {
  ({JSDOM, VirtualConsole} = require("jsdom"));

  describe("shex-simple, told where ShExReduce is", function () {
    this.timeout(20000);
    let dom, $, shared;

    before(async function () {
      const base = Path.join(__dirname, "../../..", PAGE);
      const search = "?editors=1&plugin=" +
            encodeURIComponent("../../extension-reduce/doc/ShExReducePlugin.js") +
            "&manifestURL=" +
            encodeURIComponent("../../extension-reduce/examples/manifest.yaml");
      const virtualConsole = new VirtualConsole().forwardTo(console, {jsdomErrors: "none"});
      dom = new JSDOM(Fs.readFileSync(base, "utf8"), {
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
      shared = await new Promise((resolve, reject) => {
        dom.window._testCallback = parm => parm instanceof Error ? reject(parm) : resolve(parm);
      });
      await shared.promise;
      $ = dom.window.$;
    });

    after(function () { if (dom) dom.window.close(); });

    /** pick a schema and a data entry by their labels, then validate */
    async function open (schemaLabel, dataLabel) {
      $("#inputSchema .manifest li").filter((i, li) => $(li).text() === schemaLabel)
        .trigger("click");
      await shared.promise;
      $("#inputData .passes li, #inputData .fails li")
        .filter((i, li) => $(li).text() === dataLabel).trigger("click");
      await shared.promise;
      $("#validate").trigger("click");
      await shared.promise;
    }

    const ast = () => JSON.parse($("#reduceAst textarea").first().val());

    it("should build its panes and its verb, and fetch the module they need", function () {
      expect(dom.window.ShExPlugins.all().map(e => e.label)).to.deep.equal(["ShExReduce"]);
      const screen = $("#screens > .screen[data-plugin]");
      expect(screen.attr("data-plugin")).to.equal(REDUCE_ID);
      expect(screen.find(".panel > div[id]").map((i, e) => e.id).get())
        .to.deep.equal(["reduceOverlay", "reduceAst"]);
      expect(screen.children(".panel").length, "the input beside the product").to.equal(2);
      expect(screen.find(".pluginToolbar button").map((i, b) => b.id).get())
        .to.deep.equal(["reduce"]);
      expect($("#screen option").length, "and a screen to switch to").to.equal(2);
      expect(typeof dom.window.ShExWebApp.Reduce, "the fold it runs on").to.equal("object");
      expect(typeof dom.window.ShExWebApp.ReduceJs, "and the language its actions are in")
        .to.equal("function");
      // ?editors=1: its panes are editors like the page's own
      expect(Object.keys(shared.Caches.editorSupport.panes))
        .to.include.members(["overlay", "ast"]);
    });

    /* The pair the fold was written for: the last number of an expression is
     * the sum of the ones before it, which no schema can say.  Here the
     * actions decide which branch of the OR matches -- <#MidNum> refuses the
     * number that is the sum -- and the fold builds the AST they steered. */
    it("should fold the actions over the parse they steered", async function () {
      await open("calc, actions guide", "sums");
      expect($("#results .passes").length, "the actions found a parse").to.be.above(0);
      $("#reduce").trigger("click");
      await shared.promise;
      expect(ast()).to.deep.equal({
        op: "Mul",
        left: {op: "num", value: 10},
        right: {
          op: "Sub",
          left: {op: "Mul", left: {op: "num", value: 5}, right: {op: "num", value: 45}},
          right: {op: "last", value: 60},          // 10 + 5 + 45
        },
      });
    });

    /* ...and the other half of the pair: there the schema chooses the last
     * number structurally and the actions only check it. */
    it("should fold a schema whose actions only check", async function () {
      await open("calc, actions falsify", "sums");
      $("#reduce").trigger("click");
      await shared.promise;
      expect(ast().op).to.equal("Mul");
      expect(ast().right.right).to.deep.equal({op: "last", value: 60});
    });

    /* A number that isn't the sum: no branch of the OR is left, so there is
     * no parse, and the fold says so rather than folding nothing.  (The
     * manifest entry expects the failure, so the page reports it as one
     * that was expected -- a pass, in the results.) */
    it("should say so when there is no parse to fold", async function () {
      await open("calc, actions falsify", "doesn't sum");
      expect($("#results .passes, #results .fails").length, "it ran").to.be.above(0);
      $("#reduce").trigger("click");
      await shared.promise;
      expect($("#results .error").text()).to.include("Validate conformant data");
      expect($("#reduceAst textarea").first().val()).to.equal("");
    });

    /* The hook ShExMap never needed: actions written in a document of their
     * own, hung on a schema that says nothing about them.  The schema pane
     * holds calc.shex, which has no actions in it at all. */
    it("should hang an overlay's actions on a schema written without them", async function () {
      await open("calc, actions in an overlay", "(1 + 2) * 3");
      expect($("#inputSchema textarea").first().val(), "the schema says nothing of actions")
        .to.not.include("%Reduce:");
      expect($("#reduceOverlay textarea").first().val(), "the actions came with the entry")
        .to.include("sa:Overlay");
      // ...and steered the validation from a screen that was not showing:
      // ShExReduce's screen affects validation, so hiding must not unload
      expect($("#screens > .screen").css("display"), "the overlay's screen was away")
        .to.equal("none");
      $("#reduce").trigger("click");
      await shared.promise;
      expect(ast()).to.deep.equal({
        op: "Mul",
        left: {op: "Add", left: {op: "num", value: 1}, right: {op: "num", value: 2}},
        right: {op: "num", value: 3},
      });
    });

    /* Nothing of ShExReduce is in the page: it is the app page, told a URL. */
    it("should have added all of that to a page that says none of it", function () {
      const page = Fs.readFileSync(Path.join(__dirname, "../../..", PAGE), "utf8");
      for (const id of ["reduceOverlay", "reduceAst", "reduce"])
        expect(page, "the page leaves " + id + " to the extension")
          .to.not.include('id="' + id + '"');
      expect(page).to.not.include("Reduce");
    });
  });
}
