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

    /* Two kinds of results, a tab each: materializing doesn't overwrite (or
     * pile onto) the validation whose bindings it consumed, and validating
     * again takes the materialization away, since it was about bindings
     * that no longer exist. */
    it("should keep validation and materialization results in their own tabs", async function () {
      this.timeout(60000);
      if (!$("#queryMap").val().trim()) {   // a preceding test may have deselected
        $("#inputSchema .manifest li").filter((_, e) => $(e).text() === "BP").trigger("click");
        await shared.promise;
        $("#inputData .passes li").filter((_, e) => $(e).text() === "simple").trigger("click");
        await shared.promise;
      }
      const tabs = () => $("#resultsTabs > ul > li > a").map((i, a) => $(a).text()).get();
      const panes = sel => ({json: $(sel + " .shexjs-json-pane").length,
                             turtle: $(sel + " .shexjs-turtle-pane").length});

      $("#interface").val("appinfo").trigger("change");
      $("#validate").trigger("click");
      await shared.promise;
      expect(tabs(), "nothing has been materialized yet").to.deep.equal(["validation"]);
      expect(panes("#validationResults").json, "the validation's JSON").to.equal(1);

      $("#materialize").trigger("click");
      await shared.promise;
      expect(tabs(), "and now there is one").to.deep.equal(["validation", "materialization"]);
      // the materialized graph is its own tab's business...
      expect(panes("#materializationResults")).to.deep.equal({json: 0, turtle: 1});
      // ...and the validation is still there, rendered once, not twice
      expect(panes("#validationResults")).to.deep.equal({json: 1, turtle: 0});
      expect($("#materializationResults").css("display"), "showing what was just made")
        .to.not.equal("none");

      // a materialized graph is data, so it wears the data colour
      const holder = $("#materializationResults div.data");
      expect(holder.length, "the graph sits in a data-coloured holder").to.be.above(0);
      expect(holder.css("background-color"), "the data green, not the results tint")
        .to.equal("rgb(244, 255, 244)");

      $("#validate").trigger("click");
      await shared.promise;
      expect(tabs(), "the bindings it came from are gone, so it goes").to.deep.equal(["validation"]);
      expect(panes("#materializationResults"), "and takes its pane with it")
        .to.deep.equal({json: 0, turtle: 0});
      expect(panes("#validationResults").json, "the new validation").to.equal(1);
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

    it("should render the materialized graph in a Turtle pane sized to the window", async function () {
      const set = (selector, value) => {
        const elt = $(selector).first();
        elt.val(value);
        elt.trigger("change");
      };
      set("#outputSchema textarea", outputSchemaText);
      set("#bindings1 textarea", bindingsJson);
      set("#staticVars textarea", "{}");
      $("#outputShapeMap").val("<tag:root>@<http://a.example/S>");
      $("#materialize").trigger("click");
      await shared.promise;

      const paneDom = $("#results .shexjs-turtle-pane");
      expect(paneDom.length, "materialization renders in a Turtle pane").to.equal(1);
      expect(paneDom[0].style.height, "pane fills the remaining height").to.match(/^\d+px$/);
      expect($("#results").text()).to.include('"one"');
    });

    it("should tie each materialized triple to its constraint and binding", async function () {
      // the rendering comes with the mapping: #results is live DOM that a
      // debounced pane edit can clear (copyQueryMapToEditMap), and these
      // ranges only mean anything against the text they were mapped onto
      const [{pairs, text: resultText}] = shared.Caches.editorSupport.lastMaterialized;
      expect(pairs.length, "one pair per generated triple").to.equal(2);

      const schemaText = $("#outputSchema textarea").first().val();
      const bindingsText = $("#bindings1 textarea").first().val();
      const at = (text, range) => text.substring(range.from, range.to);

      const one = pairs.find(p => p.variables.indexOf("http://a.example/v1") !== -1);
      expect(one, "the triple carrying :v1's binding").to.exist;
      // ... anchored on the constraint that synthesized it ...
      expect(at(schemaText, one.schema)).to.include(":p .");
      expect(at(schemaText, one.schema)).to.include("Map:{ :v1 %}");
      // ... on its object in the rendered Turtle ...
      expect(at(resultText, one.anchors.object)).to.equal('"one"');
      // ... and on the binding it read
      expect(one.statics).to.equal(false);
      expect(bindingsText.substring(
        bindingsText.indexOf('"http://a.example/v1"'))).to.include('"one"');

      const two = pairs.find(p => p.variables.indexOf("http://a.example/v2") !== -1);
      expect(at(schemaText, two.schema)).to.include(":q .");
      expect(at(resultText, two.anchors.object)).to.equal('"two"');
    });

    // End to end on the examples manifest's deepest entry: validate to get
    // bindings, materialize, and check every anchor.  The app renders the
    // PROOF graph, whose triple order is the validator's rather than the
    // materializer's, so pairing blank nodes by first fit bound a reading to
    // a sibling's -- undetectably, since every reading repeats :units "mmHg",
    // while its distinct :value simply stopped highlighting.
    it("should anchor repeated identical structures in their own subtrees", async function () {
      const pick = async (selector, label) => {
        const li = $(selector).filter((_, elt) => $(elt).text() === label);
        expect(li.length, label + " in " + selector).to.equal(1);
        li.trigger("click");
        await shared.promise;
      };
      await pick("#inputSchema .manifest li", "BPPatient 2 levels");
      await pick("#inputData .passes li", "simple");
      $("#validate").trigger("click");
      await shared.promise; // bindings come from the validation
      expect($("#bindings1 textarea").first().val(), "validation populated the bindings")
        .to.include("BPDAM-sysVal");

      $("#materialize").trigger("click");
      await shared.promise;
      const [{pairs, text: resultText}] = shared.Caches.editorSupport.lastMaterialized;
      // four readings, all shaped alike, with distinct values
      ["100", "60", "101", "61", "110", "70", "111", "71"].forEach(v =>
        expect(resultText, "rendered " + v).to.include('"' + v + '"'));

      // every anchor lands on its own triple's object ...
      const unanchored = pairs.filter(p => !p.anchors.object);
      expect(unanchored.map(p => p.quad.predicate.value), "all anchored").to.deep.equal([]);
      pairs.forEach(p => {
        if (p.quad.object.termType !== "Literal")
          return;
        const got = resultText.substring(p.anchors.object.from, p.anchors.object.to);
        expect(got, p.quad.predicate.value + " anchor")
          .to.include(p.quad.object.value);
      });
      // ... and no two triples claim the same span
      const spots = pairs.map(p => p.anchors.object.from);
      expect(new Set(spots).size, "distinct anchors").to.equal(spots.length);

      // the tell-tale: each reading's :units must sit in the same blank node
      // as its own :value, i.e. between that value and the next one
      const fhir = "http://hl7.org/fhir-rdf/";
      const values = pairs.filter(p => p.quad.predicate.value === fhir + "value")
            .sort((a, b) => a.anchors.object.from - b.anchors.object.from);
      const units = pairs.filter(p => p.quad.predicate.value === fhir + "units")
            .sort((a, b) => a.anchors.object.from - b.anchors.object.from);
      expect(values.length).to.equal(8);
      expect(units.length).to.equal(8);
      values.forEach((value, i) => {
        // the i'th :units follows the i'th :value and precedes the next
        expect(units[i].anchors.object.from, "units " + i + " follows its value")
          .to.be.above(value.anchors.object.to);
        if (values[i + 1])
          expect(units[i].anchors.object.to, "units " + i + " precedes the next value")
            .to.be.below(values[i + 1].anchors.object.from);
        // and both belong to the same generated blank node
        expect(units[i].quad.subject.value, "units " + i + "'s subject")
          .to.equal(value.quad.subject.value);
      });
    });
  });
}
