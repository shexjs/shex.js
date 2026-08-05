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
let JSDOM, VirtualConsole, nock;

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
  ({JSDOM, VirtualConsole} = require("jsdom"));
  nock = require("nock");
  describe("shexmap-simple with ?editors=1", function () {
    this.timeout(20000);
    const page = "packages/extension-map/doc/shexmap-simple.html";

    let dom, $, shared, app;
    before(async function () {
      const base = Path.join(__dirname, "../../..", page);
      // forward page console traffic, muting only jsdom's "Not implemented:
      // navigation" from the gist test's post-create reload (c.f. browser-test.js)
      const virtualConsole = new VirtualConsole().forwardTo(console, {jsdomErrors: "none"});
      virtualConsole.on("jsdomError", e => {
        if (!String(e.message).includes("Not implemented: navigation"))
          console.error(e.type === "unhandled-exception" ? e.cause.stack : e.message);
      });
      dom = new JSDOM(Fs.readFileSync(base, "utf8"), {
        url: GitRootServer.urlFor(page + "?editors=1"),
        runScripts: "dangerously",
        resources: "usable",
        pretendToBeVisual: true,
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
      await shared.promise;
      $ = dom.window.$;
    });

    after(function () {
      if (dom)
        dom.window.close();
    });

    it("should boot with editor panes on the ShExMap caches", function () {
      expect($("#results .error").length, $("#results .error").text()).to.equal(0);
      ["#inputSchema", "#inputData", "#outputSchema", "#bindings1", "#staticVars"].forEach(sel => {
        expect($(sel + " .shexjs-editor-pane").length, sel + " pane").to.equal(1);
      });
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
      expect($("#debugControls").css("display")).not.to.equal("none");

      // step into: pauses at :p (the first constraint)
      $("#dbgInto").trigger("click");
      expect($("#dbgStatus").text()).to.include("at <http://a.example/p>");

      // continue: runs to the :q breakpoint
      $("#dbgContinue").trigger("click");
      expect($("#dbgStatus").text()).to.include("at <http://a.example/q>");
      expect($("#dbgStatus").text()).to.include("consumed:1"); // :v1 already bound

      // continue to completion: session ends, graph renders
      $("#dbgContinue").trigger("click");
      expect($("#dbgStatus").text()).to.include("accepted: 2 quads");
      expect($("#debugControls").css("display")).to.equal("none");
      expect($("#results").text()).to.include('"one"');
      expect($("#results").text()).to.include('"two"');
    });

    it("should stop a session on demand", async function () {
      $("#debugMaterialize").trigger("click");
      await shared.promise;
      $("#dbgInto").trigger("click");
      $("#dbgStop").trigger("click");
      expect($("#debugControls").css("display")).to.equal("none");
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
      $("#dbgThreads button").first().trigger("mouseenter"); // partial preview
      expect($("#results").text()).to.include("thread");
      // ... including the thread's private view of the binding tree
      expect($("#results").text()).to.include("binding tree");
      expect($("#results").text()).to.match(/frame 0:.*:name ✓/);

      $("#dbgContinue").trigger("click"); // to completion
      expect($("#dbgStatus").text()).to.include("viable");
      expect($("#debugControls").css("display")).to.equal("none");
      expect($("#results").text()).to.include("2 viable materializations");
      expect($("#results").text()).to.include('"+1"'); // chosen: first disjunct

      // pick the other accepted thread
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
  });
}
