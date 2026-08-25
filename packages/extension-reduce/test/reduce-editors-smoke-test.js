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
      // the schema and the overlay hung on it take turns in one column,
      // the way the data source's documents do in #dataPaneTabs
      expect(screen.find(".panel > div[id]").map((i, e) => e.id).get())
        .to.deep.equal(["schemaPaneTabs"]);
      expect($("#schemaPaneTabs > ul > li > a").map((i, a) => $(a).attr("href")).get())
        .to.deep.equal(["#inputSchemaTab", "#reduceOverlay"]);
      expect($("#schemaPaneTabs > ul > li > a").map((i, a) => $(a).text()).get())
        .to.deep.equal(["schema", "overlay"]);
      // two of its panes are the app's own, borrowed when this screen is up:
      // the schema an overlay names things in, and the data it is read against
      expect(screen.find("[data-borrow]").map((i, e) => $(e).attr("data-borrow")).get())
        .to.deep.equal(["inputSchema", "inputData"]);
      // ...and what the fold built is a product, so it reads with the other
      // results rather than on the screen you work on
      expect($("#reduceAst").closest("#resultsTabs").length, "the AST is a results tab")
        .to.equal(1);
      expect($("#resultsTabs > ul > li > a").map((i, a) => $(a).text()).get())
        .to.deep.equal(["validation", "AST"]);
      expect(screen.find(".pluginToolbar button").map((i, b) => b.id).get())
        .to.deep.equal(["reduce"]);
      expect($("#screenTabs button").map((i, b) => $(b).text()).get(),
             "and a tab to switch by").to.deep.equal(["Validator", "ShExReduce"]);
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
     * no parse, and the fold says so rather than folding nothing.  It says
     * it in the AST's own tab: the validation it is complaining about is in
     * the tab next door, and clearing that to report on it would throw away
     * what the reader is comparing against. */
    it("should say so when there is no parse to fold, without clearing the validation",
       async function () {
      await open("calc, actions falsify", "doesn't sum");
      const validation = $("#validationResults > div").text();
      expect(validation.length, "a validation to keep").to.be.above(0);

      $("#reduce").trigger("click");
      await shared.promise;
      expect($("#reduceAst .status").text()).to.include("validate conformant data");
      expect($("#reduceAst textarea").first().val()).to.equal("");
      expect($("#validationResults > div").text(), "and the validation still there")
        .to.equal(validation);
    });

    /* Having folded, it brings up what it folded into: the AST is a tab
     * beside the validation, and both are the same box, so switching
     * between them doesn't move the page underneath the reader. */
    it("should bring up the AST tab, and leave the validation in the other one",
       async function () {
      await open("calc, actions guide", "sums");
      const validation = $("#validationResults > div").text();
      $("#reduce").trigger("click");
      await shared.promise;

      expect($("#resultsTabs > ul > li[aria-selected='true'] > a").attr("href"),
             "the AST tab came up").to.equal("#reduceAstResults");
      expect($("#reduceAst .status").text()).to.include("reduced 1 parse");
      expect($("#validationResults > div").text(), "the validation kept its tab")
        .to.equal(validation);
      expect($("#reduceAstResults").css("height"), "in a box the size of the other")
        .to.equal($("#validationResults").css("height"));
      expect($("#reduceAst").hasClass("fillsColumn"), "which the AST fills").to.equal(true);
    });

    /* One pane, in whichever screen is looking at it -- not a copy, which
     * would be a second thing to keep in step. */
    it("should show the app's data pane on its screen, and give it back", function () {
      const home = () => $("#inputData").parent().attr("id");
      expect(home(), "at home to begin with").to.equal("inputarea");

      $("#screenTabs button[data-screen]").last().trigger("click");
      expect($("#inputData").closest("#screens > .screen").attr("data-plugin"),
             "on the reduce screen").to.equal(REDUCE_ID);
      // ...and the schema document with it, into its tab
      expect($("#schemaDocument").parent().attr("id"), "the schema in its tab")
        .to.equal("inputSchemaTab");
      expect($("#schemaDocument textarea").length, "the same editor, moved").to.equal(1);
      expect($("#inputData").css("display"), "and showing there").to.not.equal("none");
      expect($("#inputData textarea, #inputData .shexjs-editor-pane").length,
             "the same pane, still one of it").to.be.above(0);

      $("#screenTabs button[data-screen='']").trigger("click");
      expect(home(), "and back where the page put it").to.equal("inputarea");
      expect($("#schemaDocument").parent().attr("id"), "the schema back in its panel")
        .to.equal("inputSchema");
      expect($("#inputData").css("display"), "showing on the validator's screen")
        .to.not.equal("none");
    });

    /* The overlay stands where the schema stands on the validator's screen,
     * and a dozen rows of textarea beside a full-height data pane looked
     * like an afterthought.  It says `fill`, so it is the column: the
     * screen's columns stretch to the tallest and the pane takes what its
     * own has left once the status line has had its share.  (jsdom lays
     * nothing out, so this reads the rules that would do it.) */
    it("should give the overlay the height its column has", function () {
      $("#screenTabs button[data-screen]").last().trigger("click");
      const screen = $("#screens > .screen[data-plugin]");
      expect(screen.css("display"), "columns side by side").to.equal("flex");
      expect(screen.css("align-items"), "as tall as the tallest").to.equal("stretch");
      expect(screen.children(".pluginToolbar").css("flex"), "the toolbar on its own line")
        .to.include("100%");

      const pane = $("#reduceOverlay");
      expect(pane.hasClass("fillsColumn"), "the pane is the column").to.equal(true);
      expect(pane.css("height")).to.equal("100%");
      expect(pane.css("flex-direction")).to.equal("column");
      expect($("#reduceOverlay textarea").attr("rows"),
             "with a row count to fall back on").to.equal("25");
      $("#screenTabs button[data-screen='']").trigger("click");
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
