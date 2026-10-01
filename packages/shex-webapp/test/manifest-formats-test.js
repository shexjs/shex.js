/** The YAML-LD examples manifest (doc/tests-manifest-ld.yaml: its @context
 * binds each vocabulary's `<prefix>:parms` scope, and an entry's plugin is
 * written inside that scope as pluginURL) and its Turtle rendering
 * (doc/tests-manifest-ld.ttl) on the app page: the entries list, picking a
 * ShExMap entry loads the plugin its scope names and fills the plugin's
 * panes from the scoped attributes, and the entry validates.
 */
"use strict";

const TEST_browser = require("../../shex-cli/test/testGate.js")("TEST_browser");

const Path = require("path");
const expect = require("chai").expect;
let Harness;

const {testPort} = require("../../../tools/testPorts");
const [[GitRootServer]] = require("../../../tools/testServer")
      .startServer(
        [ { url: `http://localhost:${testPort(9999)}/shex.js/`,
            fromDir: Path.join(__dirname, "../../..") }
        ]
      );

const PAGE = "packages/shex-webapp/doc/shex.html";

if (!TEST_browser) {
  console.warn("Skipping manifest-formats-tests; to activate these tests, set environment variable TEST_browser=true");
} else {
  Harness = require("./harness");

  [{format: "YAML-LD", manifest: "../../../doc/tests-manifest-ld.yaml"},
   {format: "Turtle", manifest: "../../../doc/tests-manifest-ld.ttl"},
  ].forEach(({format, manifest}) =>
    describe(`shex.html with the ${format} examples manifest`, function () {
      this.timeout(20000);
      let dom, $, shared;

      before(async function () {
        ({dom, $, shared} = await Harness.boot(
          PAGE, "?editors=1&manifestURL=" + encodeURIComponent(manifest)));
      });
      after(function () { if (dom) dom.window.close(); });

      /** click the schema entry, then the data entry under it -- unless it
       * is already picked: clicking a selected entry unselects it */
      async function pick (schemaLabel, list) {
        const schemaLi = $("#inputSchema .manifest li")
              .filter((i, li) => $(li).text() === schemaLabel).first();
        expect(schemaLi.length, `a "${schemaLabel}" entry`).to.equal(1);
        if (!schemaLi.hasClass("selected")) {
          schemaLi.trigger("click");
          await shared.promise;
        }
        const dataLi = $(`#inputData ${list} li`).first();
        if (!dataLi.hasClass("selected")) {
          dataLi.trigger("click");
          await shared.promise;
        }
      }

      it("should list every entry's schema", function () {
        const labels = $("#inputSchema .manifest li").map((i, li) => $(li).text()).get();
        expect(labels).to.include.members([
          "clinical observation", "Wikidata person", "BP", "splits",
          "calc, actions in an overlay", "Events end after they start"]);
      });

      it("should load the plugin a scope names and fill its panes from the scope", async function () {
        await pick("BP", ".passes");
        expect(dom.window.ShExPlugins.all().map(e => e.label)).to.include("ShExMap");
        expect($("#outputSchema textarea").val(), "outputSchemaURL, fetched into the output schema pane").to.include("BPunitsDAM");
        expect($("#outputShapeMap").val(), "outputShapeMap").to.equal("<tag:b0>@<BPunitsDAM>");
        expect($("#staticVars textarea").val(), "staticVars").to.include("http://abc.example/someConstant");
      });

      it("should validate the picked entry", async function () {
        await pick("BP", ".passes");
        $("#validate").trigger("click");
        await shared.promise;
        expect($("#fixedMap .pair a").first().text(), "the pair's mark").to.equal("✓");
      });

      it("should take an inline document as text", async function () {
        await pick("clinical observation", ".passes");
        expect($("#inputData textarea").val()).to.include("<Obs1> :subject <Patient2>");
        $("#validate").trigger("click");
        await shared.promise;
        expect($("#fixedMap .pair a").first().text(), "the pair's mark").to.equal("✓");
      });
    }));
}
