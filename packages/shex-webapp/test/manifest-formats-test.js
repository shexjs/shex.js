/** The YAML-LD examples manifest (doc/tests-manifest-ld.yaml: its @context
 * binds each vocabulary's `<prefix>:parms` scope, and an entry's plugin is
 * written inside that scope as pluginURL) and its Turtle rendering
 * (doc/tests-manifest-ld.ttl) on the app page: the entries list, picking a
 * ShExMap entry loads the plugin its scope names and fills the plugin's
 * panes from the scoped attributes, and the entry validates.  The manifest
 * pane keeps the text it was given.  A manifest that is JSON-LD but not
 * framed is read as JSON-LD, the processor fetched only for that.
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

      it("should keep the manifest's own text and media type", function () {
        const source = shared.Caches.manifest.source;
        const file = Path.join(__dirname, "../doc", manifest);
        expect(source.text).to.equal(require("fs").readFileSync(file, "utf8"));
        expect(source.format).to.equal(format === "Turtle" ? "turtle" : "yaml");
        expect(source.url).to.match(/doc\/tests-manifest-ld\.(yaml|ttl)$/);
      });

      it("should not have fetched a JSON-LD processor", function () {
        expect(dom.window.jsonld).to.equal(undefined);
      });
    }));

  /* A manifest whose schema (as ShExR) and data are its own graph: the entry
   * names its schema with a fragment of the document, its data with the
   * document, and its focus and shape as shex:node and shex:shape. */
  describe("shex.html with a manifest that is also its schema and its data", function () {
    this.timeout(20000);
    let dom, $, shared;
    const manifest = "../examples/manifest-clinObs-allRdf.ttl";

    before(async function () {
      ({dom, $, shared} = await Harness.boot(PAGE, "?editors=1&manifestURL=" + encodeURIComponent(manifest)));
    });
    after(function () { if (dom) dom.window.close(); });

    it("should fill the schema pane with the document and read it as ShExR", async function () {
      const schemaLi = $("#inputSchema .manifest li").filter((i, li) => $(li).text() === "clinical observation").first();
      expect(schemaLi.length, "the entry").to.equal(1);
      schemaLi.trigger("click");
      await shared.promise;
      expect($("#inputSchema textarea").val()).to.include("<#schema> a shex:Schema");
      expect(shared.Caches.inputSchema.language).to.equal("ShExR");
      const shapes = await shared.Caches.inputSchema.getItems();
      expect(shapes.some(s => /ObservationShape>$/.test(s)), "the shapes: " + shapes.join(" ")).to.equal(true);
    });

    it("should fill the data pane with the document and the query map from shex:node and shex:shape", async function () {
      const dataLi = $("#inputData .passes li").first();
      expect(dataLi.text()).to.equal("the same measurement, in two documents");
      dataLi.trigger("click");
      await shared.promise;
      expect($("#inputData textarea").val()).to.include("<http://hl7.example/Obs1>");
      // the node as the data pane writes it: scheme-relative here, where the
      // test server's http: base shares the IRI's scheme; absolute under
      // https: or file:.  The shape relative to the schema, as the manifest wrote it.
      expect($("#queryMap").val()).to.match(/^<(http:)?\/\/hl7\.example\/Obs1>@<ObservationShape>$/);
    });

    it("should validate the entry", async function () {
      $("#validate").trigger("click");
      await shared.promise;
      expect($("#fixedMap .pair a").first().text(), "the pair's mark").to.equal("✓");
    });
  });

  describe("shex.html with a manifest that is JSON-LD but not framed", function () {
    this.timeout(20000);
    let dom, $, shared;

    before(async function () {
      ({dom, $, shared} = await Harness.boot(
        PAGE, "?editors=1&manifestURL=" + encodeURIComponent("../test/manifest-not-framed.jsonld")));
    });
    after(function () { if (dom) dom.window.close(); });

    it("should fetch the processor and read the entries through it", function () {
      expect(typeof dom.window.jsonld.toRDF, "jsonld.js, loaded on demand").to.equal("function");
      const labels = $("#inputSchema .manifest li").map((i, li) => $(li).text()).get();
      expect(labels).to.deep.equal(["clinical observation"]);
    });

    it("should validate the entry it read", async function () {
      $("#inputSchema .manifest li").first().trigger("click");
      await shared.promise;
      $("#inputData .passes li").first().trigger("click");
      await shared.promise;
      expect($("#inputSchema textarea").val(), "the schema, by reference").to.include("ObservationShape");
      expect($("#inputData textarea").val(), "the data, inline").to.include("<Obs1> :subject <Patient2>");
      $("#validate").trigger("click");
      await shared.promise;
      expect($("#fixedMap .pair a").first().text(), "the pair's mark").to.equal("✓");
    });
  });
}
