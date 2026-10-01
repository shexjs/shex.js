"use strict";
/**
 * @shexjs/manifest: the YAML-LD sketch (doc/tests-manifest-ld.yaml) and its
 * Turtle rendering (doc/tests-manifest-ld.ttl, from
 * tools/yamlld-to-nested-turtle.js) read into the same entries; the x ->
 * xURL settlement by probing and by heuristic; the errors a misbound scope
 * raises; the shipped core context staying the repository's.
 */

const expect = require("chai").expect;
const Fs = require("fs");
const Path = require("path");
const Url = require("url");
const N3 = require("n3");
const Manifest = require("..");

const ROOT = Path.join(__dirname, "..", "..", "..");
const DOC = Path.join(ROOT, "doc");
const YAML_FILE = Path.join(DOC, "tests-manifest-ld.yaml");
const TTL_FILE = Path.join(DOC, "tests-manifest-ld.ttl");
const MAP = "http://shex.io/extensions/Map/#";
const SPARQL = "http://shex.js.org/neighborhoods/Sparql/#";

/** "does this URL name a resource?" over the checkout */
const probe = async (url) => {
  try {
    return Fs.existsSync(Url.fileURLToPath(url));
  } catch (e) {
    return false;
  }
};

/** a vocabulary's context, from the checkout: the neighborhoods' by their
 * relative URLs, the extensions' (published beside their specs, not yet
 * there) from the sibling shexSpec/extensions checkout the way
 * tools/yamlld-to-nested-turtle.js reads them */
const EXTENSIONS = "https://shexspec.github.io/extensions/";
const loadContext = async (url) => {
  const file = url.startsWith(EXTENSIONS)
        ? Path.join(ROOT, "..", "..", "shexSpec", "extensions", url.slice(EXTENSIONS.length))
        : Url.fileURLToPath(url);
  return JSON.parse(Fs.readFileSync(file, "utf8"));
};

const parseTurtle = (text, base) => {
  const store = new N3.Store();
  store.addQuads(new N3.Parser({baseIRI: base}).parse(text));
  return store;
};

/** an entry with every document reference made absolute against `base`,
 * so what the YAML wrote relatively compares to what the graph resolved */
function absolutized (entry, base) {
  const out = {};
  for (const [k, v] of Object.entries(entry)) {
    if (k === "parms")
      continue; // compared through the flattened attributes
    const abs = (s) => typeof s === "string" ? new URL(s, base).href : s;
    out[k] = (k.endsWith("URL") || k === "plugins" || k === "sitematrix")
      ? (Array.isArray(v) ? v.map(abs) : abs(v))
      : v;
  }
  return out;
}

describe("@shexjs/manifest", function () {
  describe("the YAML-LD sketch", function () {
    let entries;
    before(async function () {
      entries = await Manifest.readManifest(Fs.readFileSync(YAML_FILE, "utf8"),
                                            {base: Url.pathToFileURL(YAML_FILE).href, probe});
    });

    it("reads every entry, in order", function () {
      expect(entries.map(e => e.schemaLabel)).to.deep.equal([
        "clinical observation", "Wikidata person", "Wikidata person", "BP", "splits",
        "calc, actions in an overlay", "Events end after they start"]);
    });

    it("flattens a scope's attributes beside the core ones and collects its plugin", function () {
      const bp = entries[3];
      expect(bp.plugins).to.deep.equal(["../packages/extension-map/doc/ShExMapPlugin.js"]);
      expect(bp.outputSchemaURL).to.equal("../packages/extension-map/examples/BPdam-schema.shex");
      expect(bp.outputShapeMap).to.equal("<tag:b0>@<BPunitsDAM>");
      expect(bp.staticVars).to.deep.equal({"http://abc.example/someConstant": '"123-456"'});
      expect(Object.keys(bp).filter(k => k.includes(":")), "no prefixed key survives").to.deep.equal([]);
    });

    it("keeps the scopes as written, by namespace, in parms", function () {
      expect(Object.keys(entries[3].parms)).to.deep.equal([MAP]);
      expect(entries[3].parms[MAP].pluginURL).to.equal("../packages/extension-map/doc/ShExMapPlugin.js");
      expect(entries[1].parms[SPARQL]).to.deep.equal({
        pluginURL: "../packages/neighborhood-sparql/lib/neighborhood-sparql.js",
        endpoint: "https://query.wikidata.org/sparql"});
      expect(entries[1].endpoint, "...and flattened").to.equal("https://query.wikidata.org/sparql");
      expect(entries[1].neighborhood).to.equal("sparql");
    });

    it("leaves inline documents as text", function () {
      expect(entries[0].data).to.match(/^PREFIX : <http:\/\/hl7.org\/fhir\/>/);
      expect(entries[0]).not.to.have.property("dataURL");
      expect(entries[0].queryMap).to.equal("<Obs1>@START\n");
    });

    it("lists no plugins for an entry that names none", function () {
      expect(entries[0]).not.to.have.property("plugins");
      expect(entries[0]).not.to.have.property("parms");
    });
  });

  describe("the same manifest as Turtle", function () {
    it("reads back into the entries the YAML gives", async function () {
      const yamlBase = Url.pathToFileURL(YAML_FILE).href;
      const ttlBase = Url.pathToFileURL(TTL_FILE).href;
      const fromYaml = await Manifest.readManifest(Fs.readFileSync(YAML_FILE, "utf8"), {base: yamlBase, probe});
      const fromTtl = Manifest.readManifest(Fs.readFileSync(TTL_FILE, "utf8"), {base: ttlBase, parseTurtle, loadContext});
      const graphEntries = await fromTtl;
      expect(graphEntries.length).to.equal(fromYaml.length);
      graphEntries.forEach((g, i) => {
        const y = absolutized(fromYaml[i], yamlBase);
        const gg = absolutized(g, ttlBase);
        // the graph has no key order; a @set-valued dataURL comes back single when single
        expect(gg, y.schemaLabel + "/" + y.dataLabel).to.deep.equal(y);
        expect(Object.keys(g.parms || {})).to.deep.equal(Object.keys(fromYaml[i].parms || {}));
      });
    });

    it("needs a parser handed in", async function () {
      let error;
      await Manifest.readManifest("PREFIX : <http://a.example/>\n", {format: "turtle"}).catch(e => { error = e; });
      expect(error.message).to.include("parseTurtle");
    });
  });

  describe("x -> xURL", function () {
    const base = "http://a.example/dir/manifest.yaml";

    it("renames a reference the probe confirms, and leaves text alone", async function () {
      const asked = [];
      const probe = async (url) => { asked.push(url); return url.endsWith(".shex"); };
      const [e] = await Manifest.entriesFromJson([{
        schema: "s.shex",
        data: "<x> <p> 1 .",
        queryMap: "x@START",            // probed, not a resource, so text
      }], {base, probe});
      expect(e.schemaURL).to.equal("s.shex");
      expect(e).not.to.have.property("schema");
      expect(e.data).to.equal("<x> <p> 1 .");
      expect(e.queryMap).to.equal("x@START");
      expect(asked).to.deep.equal(["http://a.example/dir/s.shex", "http://a.example/dir/x@START"]);
    });

    it("probes each of a data list and renames only when all are resources", async function () {
      const probe = async (url) => url.endsWith(".ttl");
      const [all, mixed] = await Manifest.entriesFromJson([
        {data: ["a.ttl", "b.ttl"]},
        {data: ["a.ttl", "not-there"]},
      ], {base, probe});
      expect(all.dataURL).to.deep.equal(["a.ttl", "b.ttl"]);
      expect(mixed.data).to.deep.equal(["a.ttl", "not-there"]);
    });

    it("falls back to the whitespace-or-bracket heuristic, for schema and data only", async function () {
      const [e] = await Manifest.entriesFromJson([{schema: "s.shex", data: "<x> <p> 1 .", queryMap: "x@START"}]);
      expect(e.schemaURL).to.equal("s.shex");
      expect(e.data).to.equal("<x> <p> 1 .");
      expect(e.queryMap, "queryMap is never guessed").to.equal("x@START");
    });

    it("never touches an attribute that already has its URL twin", async function () {
      const probe = async () => true;
      const [e] = await Manifest.entriesFromJson([{schema: "text", schemaURL: "s.shex"}], {base, probe});
      expect(e).to.deep.equal({schema: "text", schemaURL: "s.shex"});
    });
  });

  describe("scopes", function () {
    it("takes a full-IRI key as a scope too", async function () {
      const [e] = await Manifest.entriesFromJson({entries: [{[MAP + "parms"]: {pluginURL: "p.js", outputShapeMap: "<a>@<B>"}}]});
      expect(e.plugins).to.deep.equal(["p.js"]);
      expect(e.outputShapeMap).to.equal("<a>@<B>");
      expect(Object.keys(e.parms)).to.deep.equal([MAP]);
    });

    it("takes the manifest's prefix from its @context, however the prefix is declared", async function () {
      const doc = {
        "@context": [
          "./core.jsonld",                                     // a remote context contributes nothing
          {m: MAP, "m:parms": {"@context": "https://x.example/scope.jsonld"}},
          {w: {"@id": "http://x.example/w#", "@prefix": true}},
        ],
        entries: [{"m:parms": {pluginURL: "m.js"}, "w:parms": {pluginURL: "w.js", zoom: 3}}],
      };
      const [e] = await Manifest.entriesFromJson(doc);
      expect(e.plugins).to.deep.equal(["m.js", "w.js"]);
      expect(e.zoom).to.equal(3);
      expect(Object.keys(e.parms).sort()).to.deep.equal([MAP, "http://x.example/w#"].sort());
    });

    it("refuses a prefix the manifest never declared", async function () {
      let error;
      await Manifest.entriesFromJson({entries: [{"map:parms": {pluginURL: "p.js"}}]}).catch(e => { error = e; });
      expect(error.message).to.include('"map:parms"').and.include("@context");
    });

    it("refuses a name written in two scopes", async function () {
      let error;
      await Manifest.entriesFromJson({
        "@context": {a: "http://a.example/#", b: "http://b.example/#"},
        entries: [{"a:parms": {endpoint: "x"}, "b:parms": {endpoint: "y"}}],
      }).catch(e => { error = e; });
      expect(error.message).to.include('"endpoint"').and.include("twice");
    });

    it("folds an old manifest's plugins list and an entry-level pluginURL into plugins", async function () {
      const [e] = await Manifest.entriesFromJson([{plugins: ["a.js"], pluginURL: "b.js", schemaLabel: "x"}]);
      expect(e.plugins).to.deep.equal(["a.js", "b.js"]);
      expect(e).not.to.have.property("pluginURL");
    });
  });

  describe("the core context", function () {
    it("is the repository's doc/webapp-manifest-context.jsonld", function () {
      const shipped = Manifest.CoreContext["@context"];
      const repo = JSON.parse(Fs.readFileSync(Path.join(DOC, "webapp-manifest-context.jsonld"), "utf8"))["@context"];
      expect(shipped).to.deep.equal(repo);
    });

    it("maps a predicate to its text and URL spellings", function () {
      const vocab = Manifest.vocabularyOf(Manifest.CoreContext);
      expect(vocab.get("http://www.w3.org/ns/shex-manifest#schema")).to.deep.equal({text: "schema", url: "schemaURL"});
      expect(vocab.get("https://shex.io/ns/examples-manifest#plugin")).to.deep.equal({url: "pluginURL"});
    });
  });

  describe("detectFormat", function () {
    it("goes by the extension, then by what the text starts with", function () {
      expect(Manifest.detectFormat("anything", "m.ttl")).to.equal("turtle");
      expect(Manifest.detectFormat("anything", "http://x.example/m.yaml?x=1")).to.equal("yaml");
      expect(Manifest.detectFormat("# comment\n[{}]")).to.equal("json");
      expect(Manifest.detectFormat("# comment\nPREFIX : <x>\n")).to.equal("turtle");
      expect(Manifest.detectFormat("@prefix : <x> .\n")).to.equal("turtle");
      expect(Manifest.detectFormat("- schemaLabel: x\n")).to.equal("yaml");
      expect(Manifest.detectFormat('"@context":\n  - ./c.jsonld\n')).to.equal("yaml");
    });
  });
});
