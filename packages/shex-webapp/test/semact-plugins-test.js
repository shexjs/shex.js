/** The Eval and Test extensions on the app page, loaded the way their
 * manifests load them (`plugins: ../doc/ShEx*Plugin.js`): the handler
 * registers, a passing action passes, a refusing one fails the pair, and
 * what Eval wrote into extensionStorage reads back from the appinfo.
 */
"use strict";

const TEST_browser = "TEST_browser" in process.env ? JSON.parse(process.env["TEST_browser"]) : false;

const Path = require("path");
const expect = require("chai").expect;
let Harness;

const [[GitRootServer]] = require("../../../tools/testServer")
      .startServer(
        [ { url: "http://localhost:9999/shex.js/",
            fromDir: Path.join(__dirname, "../../..") }
        ]
      );

const PAGE = "packages/shex-webapp/doc/shex-simple.html";

if (!TEST_browser) {
  console.warn("Skipping semact-plugins-tests; to activate these tests, set environment variable TEST_browser=true");
} else {
  Harness = require("./harness");

  [{ext: "eval", label: "Eval", plugin: "ShExEvalPlugin.js",
    passes: "Eval notes the match", fails: "Eval refuses a value",
    inAppinfo: ["http://shex.io/extensions/Eval/", "noted"]},
   {ext: "test", label: "Test", plugin: "ShExTestPlugin.js",
    passes: "Test prints the object", fails: "Test can fail a match",
    inAppinfo: []},
   {ext: "wasi", label: "Wasi", plugin: "ShExWasiPlugin.js",
    passes: "WASI prints the object", fails: "WASI can fail a match",
    inAppinfo: []},
   {ext: "wasi-test", label: "Test (wasm)", plugin: "ShExWasiTestPlugin.js",
    passes: "wasm Test prints the object", fails: "wasm Test can fail a match",
    inAppinfo: []},
  ].forEach(({ext, label, plugin, passes, fails, inAppinfo}) =>
   [{app: "shex-simple", search: "?editors=1", options: undefined},
    // the worker flavour: the handler registers over there, and the worker
    // thread awaits every plugin's `ready` before serving any request
    {app: "shex-worker", search: "?editors=1&worker=1", options: {worker: true}},
   ].forEach(({app, search, options}) =>
    describe(`${app} with the ${label} extension's manifest`, function () {
      this.timeout(20000);
      let dom, $, shared;

      before(async function () {
        ({dom, $, shared} = await Harness.boot(
          PAGE, search + "&manifestURL=" + encodeURIComponent(
            `../../extension-${ext}/examples/manifest.yaml`), options));
      });
      after(function () { if (dom) dom.window.close(); });

      /** click the schema entry, then the data entry under it -- unless it
       * is already picked: clicking a selected entry unselects it */
      async function pick (schemaLabel, list) {
        const schemaLi = $("#inputSchema .manifest li")
              .filter((i, li) => $(li).text() === schemaLabel).first();
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

      it("should load the plugin the entries name", async function () {
        await pick(passes, ".passes");
        expect(dom.window.ShExPlugins.all().map(e => e.label)).to.deep.equal([label]);
      });

      it("should let a passing action pass", async function () {
        await pick(passes, ".passes");
        $("#interface").val("appinfo").trigger("change");
        $("#validate").trigger("click");
        await shared.promise;
        expect($("#fixedMap .pair a").first().text(), "the pair's mark").to.equal("\u2713");
        const said = $("#results .results").data("rawText") || $("#results").text();
        inAppinfo.forEach(fragment =>
          expect(said, "what the action wrote, in the appinfo").to.include(fragment));
      });

      it("should let a refusing action fail the pair", async function () {
        await pick(fails, ".fails");
        $("#validate").trigger("click");
        await shared.promise;
        expect($("#fixedMap .pair a").first().text(), "the pair's mark").to.equal("\u2717");
      });
    })));

  /* The WASI manifest's other tiers: a library the schema declares once in
   * a start action (and its failing twin), an action with its own data
   * segment, and a standalone (module ...) that loads argv itself. */
  describe("the WASI manifest's other tiers", function () {
    this.timeout(20000);
    let dom, $, shared;

    before(async function () {
      ({dom, $, shared} = await Harness.boot(
        PAGE, "?editors=1&manifestURL=" + encodeURIComponent(
          "../../extension-wasi/examples/manifest.yaml")));
    });
    after(function () { if (dom) dom.window.close(); });

    [{schemaLabel: "WASI library in a start action", list: ".passes", mark: "\u2713"},
     {schemaLabel: "WASI library can fail a match", list: ".fails", mark: "\u2717"},
     {schemaLabel: "WASI writes its own data", list: ".passes", mark: "\u2713"},
     {schemaLabel: "WASI standalone module", list: ".passes", mark: "\u2713"},
    ].forEach(({schemaLabel, list, mark}) =>
      it(`should validate "${schemaLabel}"`, async function () {
        const schemaLi = $("#inputSchema .manifest li")
              .filter((i, li) => $(li).text() === schemaLabel).first();
        expect(schemaLi.length, "the entry is listed").to.equal(1);
        if (!schemaLi.hasClass("selected")) {
          schemaLi.trigger("click");
          await shared.promise;
        }
        const dataLi = $(`#inputData ${list} li`).first();
        if (!dataLi.hasClass("selected")) {
          dataLi.trigger("click");
          await shared.promise;
        }
        $("#validate").trigger("click");
        await shared.promise;
        expect($("#fixedMap .pair a").first().text(), "the pair's mark").to.equal(mark);
      }));
  });
}
