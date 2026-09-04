/** ShExReduce as an extension of the app page (doc/plugins.md): the
 * second extension, and the one that says whether the contract
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
const node_fetch = globalThis.fetch;
let Harness;

const [[GitRootServer]] = require("../../../tools/testServer")
      .startServer(
        [ { url: "http://localhost:9999/shex.js/",
            fromDir: Path.join(__dirname, "../../..") }
        ]
      );

const PAGE = "packages/shex-webapp/doc/shex-simple.html";
const WORKER_PAGE = "packages/shex-webapp/doc/shex-simple.html";   // with ?worker=1
const PLUGIN = "../../extension-reduce/doc/ShExReducePlugin.js";
const MANIFEST = "../../extension-reduce/examples/manifest.yaml";
const REDUCE_ID = "http://shex.io/extensions/Reduce/";

if (!TEST_browser) {
  console.warn("Skipping reduce-editors-smoke-tests; to activate these tests, set environment variable TEST_browser=true");
} else {
  Harness = require("../../shex-webapp/test/harness");

  describe("shex-simple, told where ShExReduce is", function () {
    this.timeout(20000);
    let dom, $, shared;

    before(async function () {
      const search = "?editors=1&plugin=" + encodeURIComponent(PLUGIN) +
            "&manifestURL=" + encodeURIComponent(MANIFEST);
      ({dom, $, shared} = await Harness.boot(PAGE, search));
    });

    after(function () { if (dom) dom.window.close(); });

    /** pick a schema and a data entry by their labels, then validate.
     * Clicking a selected entry deselects it (the app's toggle: see
     * pickSchema/pickData), so one that is already picked is left alone. */
    async function open (schemaLabel, dataLabel) {
      const schemaLi = $("#inputSchema .manifest li").filter((i, li) => $(li).text() === schemaLabel);
      if (!schemaLi.hasClass("selected")) {
        schemaLi.trigger("click");
        await shared.promise;
      }
      const dataLi = $("#inputData .passes li, #inputData .fails li")
        .filter((i, li) => $(li).text() === dataLabel);
      if (!dataLi.hasClass("selected")) {
        dataLi.trigger("click");
        await shared.promise;
      }
      $("#validate").trigger("click");
      await shared.promise;
    }

    const ast = () => JSON.parse($("#reduceAst textarea").first().val());

    /** Past the app's guard against a second validate on the heels of a
     * failed one ("see shape map errors above"): a reader takes longer than
     * this to read the message, and a test doesn't. */
    const afterAFailure = () => new Promise(res => setTimeout(res, 150));

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
      expect($("#screenTabs button").map(
        (i, b) => $(b).find(".screenTabLabel").text() || $(b).text()).get(),
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

    /* An action that throws is a bug in the action, and it takes the
     * validation it was steering with it.  That goes where validation
     * errors go; it also goes in the pane the actions build, which is where
     * a reader who is working on the actions is looking. */
    it("should say in the AST pane when an action throws", async function () {
      await open("calc, actions guide", "sums");
      const good = shared.Caches.inputSchema.get();
      const base = shared.Caches.inputSchema.meta.base;
      try {
        await shared.Caches.inputSchema.set(
          good.replace("Object.assign($rdf:type, $:left, $:right)",
                       "Object.assign(nope($rdf:type), $:left)"), base);
        $("#validate").trigger("click");
        await shared.promise;

        const said = $("#reduceAst .status");
        expect(said.text(), "the action, and what it said about it")
          .to.match(/nope is not defined/);
        expect(said.text(), "and where it was").to.include("BinOp");
        expect(said.hasClass("threw")).to.equal(true);
        expect($("#reduceAst textarea").first().val(), "no AST: this is not one")
          .to.equal("");
        // ...and the validation says so where it says everything else
        expect($("#validationResults > div .error").text()).to.include("nope is not defined");
        // the app's status line is its own: it says what it always says,
        // and a plugin's tab keeps what the plugin put there
        expect($("#results > .status").text(), "not the plugin's news")
          .to.not.include("nope");
        // ...and the next validation clears it: it is about that parse
        await shared.Caches.inputSchema.set(good, base);
        await afterAFailure();
        $("#validate").trigger("click");
        await shared.promise;
        expect($("#reduceAst .status").hasClass("threw"), "a validation clears it")
          .to.equal(false);
      } finally {
        // leave the manifest as it was found: picking the picked entry
        // un-picks it, which is what the next test's open() expects
        $("#inputSchema .manifest li.selected").trigger("click");
        await shared.promise;
      }
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
      try {
        const screen = $("#screens > .screen[data-plugin]");
        expect(screen.css("display"), "the screen is the height it was given")
          .to.equal("flex");
        expect(screen.css("flex-direction"), "columns, then the controls under them")
          .to.equal("column");
        const columns = screen.children(".screenColumns");
        expect(columns.css("display"), "the columns side by side").to.equal("flex");
        expect(columns.css("align-items"), "each as tall as the tallest").to.equal("stretch");
        expect(columns.css("flex"), "and the row taking what the controls leave")
          .to.include("1 1");
        expect(screen.children(".pluginToolbar").css("flex"), "which is little")
          .to.include("0 0");

        const pane = $("#reduceOverlay");
        expect(pane.hasClass("fillsColumn"), "the pane is the column").to.equal(true);
        expect(pane.css("height")).to.equal("100%");
        expect(pane.css("flex-direction")).to.equal("column");
        expect($("#reduceOverlay textarea").attr("rows"),
               "with a row count to fall back on").to.equal("25");

        // ...and the column beside it, which is the app's own data pane on
        // loan: the slot it is lent to has to be the box it fills, or the
        // pane is as tall as what is in it and the column stops short of
        // the results
        const slot = columns.children("[data-borrow]");
        expect(slot.length, "the data pane is here on loan").to.equal(1);
        expect(slot.css("display"), "and the slot is a column").to.equal("flex");
        expect(slot.css("flex-direction")).to.equal("column");
        expect(slot.css("flex"), "taking its half of the row").to.include("1 1");
        expect($("#inputData").parent().is(slot), "with the pane in it").to.equal(true);
        expect($("#inputData").css("flex"), "and filling it").to.include("1 1");
      } finally {
        // whatever happened, the next test starts where it expects to
        $("#screenTabs button[data-screen='']").trigger("click");
      }
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

    /* The grammar nobody wrote for the occasion: ShExR is ShEx written as
     * RDF, so the data is a schema and the schema is the schema for
     * schemas.  Everything the entry needs is in the repository -- the
     * spec's ShExR.shex, the actions as an overlay -- and the query map
     * finds the schema node without naming it, which is as well: it is a
     * blank node whose label is whatever the parser called it. */
    it("should read a ShExR schema as the ShExJ it means", async function () {
      await open("ShExR, read by ShEx", "an issue schema");
      expect($("#validationResults > div .error").length,
             $("#validationResults > div").text().substring(0, 200)).to.equal(0);
      expect($("#reduceOverlay textarea").first().val(), "the actions came with the entry")
        .to.include("sa:start");

      $("#reduce").trigger("click");
      await shared.promise;
      const schema = ast();
      expect(schema.type).to.equal("Schema");
      expect(schema.shapes.map(d => d.id))
        .to.deep.equal(["http://a.example/#IssueShape", "http://a.example/#UserShape"]);
      const issue = schema.shapes[0].shapeExpr.expression.expressions;
      expect(issue.map(tc => tc.predicate)).to.deep.equal(
        ["http://a.example/state", "http://a.example/reportedBy", "http://a.example/reportedOn"]);
      expect(issue[0].valueExpr.values, "the value set it reduced")
        .to.deep.equal(["http://a.example/unassigned", "http://a.example/assigned"]);
      expect(issue[2].max, "and the cardinality").to.equal(1);
      // ...and every node of it points back at the production that made it
      expect(((shared.Caches.editorSupport.linkSets || {})[REDUCE_ID] || []).length,
             "a link per node").to.be.above(10);
    });

    /* What a fold built, back to what built it.
     *
     * The provenance the fold records says which action made each value and
     * what it ran over; the app knows where a triple of the validation is
     * written, having anchored them all; and this plugin knows where the
     * value ended up in the AST and where the action is in an overlay.  So
     * a node of the AST, the production, the triple and the action are one
     * thing the reader can point at from any of them. */
    it("should link each node of the AST to the schema and the data that made it",
       async function () {
         await open("calc, actions guide", "sums");
         $("#reduce").trigger("click");
         await shared.promise;

         const es = shared.Caches.editorSupport;
         const links = (es.linkSets || {})[REDUCE_ID] || [];
         expect(links.length, "a link per node of the AST").to.be.above(0);
         const astText = $("#reduceAst textarea").first().val();
         const schemaText = $("#inputSchema textarea").first().val();
         const dataText = $("#inputData textarea").first().val();

         // the range in the AST is a node of the AST, marked as its own
         // text: the braces it opens and closes with, and the members that
         // are its own -- one holding another node is that node's to mark
         // a shape's action, which is the one that made a whole node: an
         // arc's action made whatever its own arc contributed
         const whole = links.find(l => l.shape !== undefined);
         expect(whole, "a shape's action among them").to.exist;
         const at = whole.panes.ast[0];
         const node = JSON.parse(astText.substring(at.from, at.to));
         expect(node, "a node of the AST").to.have.property("op");
         const marks = (at.parts || []).map(p => astText.substring(p.from, p.to));
         expect(marks, "its braces").to.include.members(["{", "}"]);
         expect(marks.some(m => /^"\w+": /.test(m)), "and its own members: " + marks)
           .to.equal(true);
         // a member holding a node of its own is marked by its name and
         // that node's opening delimiter; what is inside is that node's
         expect(marks.filter(m => /^"\w+": [{[]/.test(m)).every(m => /[{[]$/.test(m)),
                "and nothing inside what it holds: " + marks).to.equal(true);

         // ...and it is about where its `$` was assigned: the shape's own
         // text, the action among it, and the node that was the focus
         const places = es.resolveLink(whole);
         const primary = places.find(l => !l.secondary);
         expect(schemaText.substring(primary.schema.from, primary.schema.to),
                "the shape it was assigned in").to.match(/^<#\w+>/);
         const said = primary.schemaParts.map(
           r => schemaText.substring(r.from, r.to).replace(/\s+/g, " "));
         expect(said[0], "what the shape says before its body").to.match(/^<#\w+> \{$/);
         expect(said[said.length - 1], "and after it, the action among it: " + said)
           .to.include("%Reduce:");
         expect(dataText.substring(primary.anchors.subject.from, primary.anchors.subject.to),
                "and the focus it had").to.match(/^<#e\d+>$/);

         // ...and the ways back in: hovering any constraint that shape
         // matched, or any triple, lights what the fold made of it
         expect(places.filter(l => l.secondary).length, "one per place")
           .to.be.above(0);
         const carrying = es.allPairs().filter(p => (p.panes || {}).ast && p.schema);
         expect(carrying.length, "pairs that light the AST").to.be.above(links.length);
       });


    /* An action written in a document of its own is written nowhere else,
     * so that document is the fourth place this points at. */
    it("should link a node of the AST to the action in the overlay", async function () {
      await open("calc, actions in an overlay", "(1 + 2) * 3");
      $("#reduce").trigger("click");
      await shared.promise;

      const es = shared.Caches.editorSupport;
      const links = (es.linkSets || {})[REDUCE_ID] || [];
      const overlayText = $("#reduceOverlay textarea").first().val();
      const inOverlay = links.filter(l => (l.panes.overlay || []).length);
      expect(inOverlay.length, "the actions are all in the overlay").to.be.above(0);
      const range = inOverlay[0].panes.overlay[0];
      expect(overlayText.substring(range.from, range.to), "the action itself")
        .to.match(/^\{op:/);
      // ...and the schema, which says nothing of actions, still says which
      // production this was
      const schemaText = $("#inputSchema textarea").first().val();
      const said = es.resolveLink(inOverlay[0]).filter(l => l.schema)
            .map(l => schemaText.substring(l.schema.from, l.schema.to));
      expect(said.some(s => /^<#\w+>/.test(s)), "which production: " + said).to.equal(true);
    });
    /* ...and from the data: hovering the node a statement opens lights the
     * productions its triples matched, the action among them, and the node
     * of the AST they made -- the same link, entered from the third side. */
    it("should light the schema and the AST from a data subject node", async function () {
      await open("calc, actions guide", "sums");
      $("#reduce").trigger("click");
      await shared.promise;

      const es = shared.Caches.editorSupport;
      const links = (es.linkSets || {})[REDUCE_ID] || [];
      const whole = links.find(l => l.shape !== undefined);
      const primary = es.resolveLink(whole).find(l => !l.secondary);
      const captured = {};
      const orig = es.panes.inputData.setHoverRegions;
      es.panes.inputData.setHoverRegions = function (rs) { captured.regions = rs; return orig.apply(this, arguments); };
      try { es.setPairHovers(es.linkSets.validation); } finally { es.panes.inputData.setHoverRegions = orig; }

      const dataText = $("#inputData textarea").first().val();
      const at = primary.anchors.subject;
      const region = (captured.regions || []).find(r => r.from === at.from && r.to === at.to);
      expect(region, "a hover region on the focus node " + dataText.substring(at.from, at.to)).to.exist;
      expect(region.title(), "the production, the action among it").to.include("%Reduce:");

      const painted = {schema: [], ast: []};
      const origSchema = es.panes.inputSchema.highlight, origAst = es.panes.ast.highlight;
      es.panes.inputSchema.highlight = (rs) => painted.schema.push(...rs);
      es.panes.ast.highlight = (rs) => painted.ast.push(...rs);
      try { region.enter(); } finally {
        es.panes.inputSchema.highlight = origSchema;
        es.panes.ast.highlight = origAst;
      }
      const schemaText = $("#inputSchema textarea").first().val();
      expect(painted.schema.map(r => schemaText.substring(r.from, r.to).replace(/\s+/g, " ")).join(" "),
             "the shape it was assigned in").to.include("%Reduce:");
      expect(painted.ast.length, "and the node of the AST it made").to.be.above(0);
    });

    /* The validation's own highlighting is wired from the same list, so a
     * plugin's links join it rather than replacing it -- and a constraint
     * lights both the triple that matched it and what the fold made of it. */
    it("should leave the validation's own highlighting alone", async function () {
      await open("calc, actions guide", "sums");
      const es = shared.Caches.editorSupport;
      const validation = (es.linkSets.validation || []).length;
      expect(validation, "a validation to hover over").to.be.above(0);

      let schemaRegions = 0;
      const was = es.panes.inputSchema.setHoverRegions;
      es.panes.inputSchema.setHoverRegions = function (rs) {
        schemaRegions = rs.length;
        return was.apply(this, arguments);
      };
      try {
        $("#reduce").trigger("click");
        await shared.promise;
      } finally {
        es.panes.inputSchema.setHoverRegions = was;
      }
      expect((es.linkSets.validation || []).length, "the validation's links are still there")
        .to.equal(validation);
      expect(es.allPairs().length, "and the fold's are beside them")
        .to.be.above(validation);
      expect(schemaRegions, "the schema pane was wired from both").to.be.above(0);
      // ...and a new validation takes the fold's links with it: they were
      // about the parse it is replacing
      $("#validate").trigger("click");
      await shared.promise;
      expect(((es.linkSets || {})[REDUCE_ID] || []).length, "gone with the parse")
        .to.equal(0);
    });

    /* A node's frame is what it marks: its own delimiters, its scalar
     * members whole, and for a member that holds something with delimiters
     * of its own, the member's name with that thing's opening delimiter and
     * its closing one.  What is inside those is left to what is inside. */
    it("should mark a node of the AST by its frame", async function () {
      await shared.Caches.manifest.set([{
        schemaLabel: "frames", schema: [
          "PREFIX : <http://a.example/>",
          "PREFIX Reduce: <http://shex.io/extensions/Reduce/>",
          "BASE <http://a.example/>",
          "<#S> { :p . } %Reduce:{ $ = {op: 'x', xs: [1, 2], sub: {y: 1}} %}",
        ].join("\n"),
        dataLabel: "one arc", data: "PREFIX : <http://a.example/>\nBASE <http://a.example/>\n<#n1> :p 1 .",
        queryMap: "<http://a.example/#n1>@<http://a.example/#S>",
      }], "http://localhost/manifest.json");
      $("#inputSchema .manifest li").last().trigger("click");
      await shared.promise;
      $("#inputData .indeterminant li").last().trigger("click");
      await shared.promise;
      $("#validate").trigger("click");
      await shared.promise;
      expect($("#results .error").length, $("#results").text().substring(0, 200)).to.equal(0);
      $("#reduce").trigger("click");
      await shared.promise;

      const es = shared.Caches.editorSupport;
      const links = (es.linkSets || {})[REDUCE_ID] || [];
      expect(links.length, "the node the action made").to.equal(1);
      const astText = $("#reduceAst textarea").first().val();
      const at = links[0].panes.ast[0];
      expect(JSON.parse(astText.substring(at.from, at.to)))
        .to.deep.equal({op: "x", xs: [1, 2], sub: {y: 1}});
      expect((at.parts || []).map(p => astText.substring(p.from, p.to)))
        .to.have.members(["{", "}", '"op": "x"', '"xs": [', "]", '"sub": {', "}"]);
    });

    /* ...and the × on its tab takes it back off, from the screen it is on:
     * the panes it borrowed are the app's own, and go home rather than out
     * with the screen that was holding them.  Last, since nothing of it is
     * left afterwards. */
    it("should hand the app's panes back when it is unloaded", function () {
      $("#screenTabs button[data-screen]").last().trigger("click");
      expect($("#inputData").closest("#screens > .screen").length, "on its screen")
        .to.equal(1);

      $("#screenTabs .unloadPlugin").first().trigger("click");

      expect(dom.window.ShExPlugins.all(), "out of the register").to.deep.equal([]);
      expect($("#inputData").parent().attr("id"), "the data pane went home")
        .to.equal("inputarea");
      expect($("#schemaDocument").parent().attr("id"), "and the schema document")
        .to.equal("inputSchema");
      expect($("#inputData textarea, #inputData .shexjs-editor-pane").length,
             "with what was in it").to.be.above(0);
      expect($("#screens > .screen").length, "the screen it lent them to is gone")
        .to.equal(0);
      expect($("#reduceOverlay, #reduceAst, #reduce").length, "and its own panes with it")
        .to.equal(0);
      expect(Object.keys(shared.Caches).sort(), "so are the caches under them")
        .to.deep.equal(["inputData", "inputSchema", "manifest", "plugin", "shapeMap"]);
      // its AST tab was the only reason the results were tabs at all
      expect($("#resultsTabs").length, "the results are one panel again").to.equal(0);
      expect($("#results > div").length).to.equal(1);
      expect($("#screenTabs").css("display"), "and the title is the whole title")
        .to.equal("none");
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

  /* The actions run *during* the match, so they run where the matcher is.
   * On this page that is the worker, which needs a half of this plugin over
   * there or a validation comes back with no actions in it -- and the fold
   * of a parse with no actions is the node it started from. */
  describe("shex-worker, told where ShExReduce is", function () {
    this.timeout(60000);
    let dom, $, shared;

    before(async function () {
      const search = "?worker=1&plugin=" + encodeURIComponent(PLUGIN) +
            "&manifestURL=" + encodeURIComponent(MANIFEST);
      ({dom, $, shared} = await Harness.boot(WORKER_PAGE, search, {worker: true}));
    });

    after(function () { if (dom) dom.window.close(); });

    it("should fold what the worker matched, actions and all", async function () {
      expect(shared.app.remote, "this app validates over there").to.equal(true);
      const ext = dom.window.ShExPlugins.byId(REDUCE_ID);
      expect(ext.worker, "and says where its half of it is").to.equal("./ShExReduceWorkerThread.js");

      $("#inputSchema .manifest li").filter((i, li) => $(li).text() === "calc, actions guide")
        .first().trigger("click");
      await shared.promise;
      $("#inputData .passes li").filter((i, li) => $(li).text() === "sums").first().trigger("click");
      await shared.promise;
      $("#validate").trigger("click");
      await shared.promise;
      expect($("#results .error").length, $("#results").text().substring(0, 300)).to.equal(0);

      $("#reduce").trigger("click");
      await shared.promise;
      // the tree the actions built, rather than the node a parse with no
      // actions in it reduces to
      const ast = JSON.parse($("#reduceAst textarea").first().val());
      expect(ast).to.deep.equal({
        op: "Mul",
        left: {op: "num", value: 10},
        right: {op: "Sub",
                left: {op: "Mul", left: {op: "num", value: 5}, right: {op: "num", value: 45}},
                right: {op: "last", value: 60}},
      });
      // ...and it points back at what made it, as it does on the other page
      const links = (shared.Caches.editorSupport.linkSets || {})[REDUCE_ID] || [];
      expect(links.length, "a link per node of it").to.be.above(0);
    });

    /* The action threw over there, so what comes back is a message rather
     * than an Error -- with its name on it, which is how this side knows
     * whose failure it is and puts it where the other page puts it. */
    it("should bring an action's exception home from the worker", async function () {
      const good = shared.Caches.inputSchema.get();
      const base = shared.Caches.inputSchema.meta.base;
      try {
        await shared.Caches.inputSchema.set(
          good.replace("Object.assign($rdf:type, $:left, $:right)",
                       "Object.assign(nope($rdf:type), $:left)"), base);
        $("#validate").trigger("click");
        await shared.promise;
        expect($("#reduceAst .status").text()).to.match(/nope is not defined/);
        expect($("#reduceAst .status").hasClass("threw")).to.equal(true);
      } finally {
        await shared.Caches.inputSchema.set(good, base);
      }
    });

    /* A cut is not an exception: it is this pair's answer, so it comes back
     * as a result like any other -- and the reader gets the one reason the
     * action gave rather than the pile of branches that were never tried. */
    it("should bring an action's cut home as the failure it is", async function () {
      $("#inputSchema .manifest li").filter((i, li) => $(li).text() === "calc, actions falsify")
        .first().trigger("click");
      await shared.promise;
      $("#inputData .fails li, #inputData .passes li")
        .filter((i, li) => $(li).text() === "doesn't sum").first().trigger("click");
      await shared.promise;
      $("#validate").trigger("click");
      await shared.promise;

      const said = $("#validationResults > div").text().replace(/\s+/g, " ");
      expect(said, "the reason the action gave").to.include("not the sum of the numbers before it");
      expect(said).to.include("cut the match");
      expect(said, "and not the branches it never tried").to.not.include("LastBinOp");
    });
  });
}
