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
const {JSDOM} = require("jsdom");

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
  describe("shexmap-simple with ?editors=1", function () {
    this.timeout(20000);
    const page = "packages/extension-map/doc/shexmap-simple.html";

    let dom, $, shared, app;
    before(async function () {
      const base = Path.join(__dirname, "../../..", page);
      dom = new JSDOM(Fs.readFileSync(base, "utf8"), {
        url: GitRootServer.urlFor(page + "?editors=1"),
        runScripts: "dangerously",
        resources: "usable",
        pretendToBeVisual: true,
      });
      dom.window.fetch = node_fetch;
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

    it("should step through a materialization with a gutter breakpoint", async function () {
      const set = (selector, value) => {
        const elt = $(selector).first();
        elt.val(value);
        elt.trigger("change");
      };
      set("#outputSchema textarea", outputSchemaText);
      set("#bindings1 textarea", bindingsJson);
      $("#createRoot").val("<tag:root>");
      $("#outputShape").val("<http://a.example/S>");

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
  });
}
