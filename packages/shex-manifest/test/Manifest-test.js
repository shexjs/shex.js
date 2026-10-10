"use strict";
/**
 * @shexjs/manifest: the JSON step that brings a deployed manifest up to the
 * canonical form; the frame check that says when a document's plain reading
 * is its JSON-LD reading, with both readings run over every manifest in the
 * repository and required to agree; documents that are JSON-LD but not
 * framed, which only the JSON-LD reading gets right; the Turtle rendering
 * read back into the same entries; and the roll-up of known contexts
 * staying the repository's.
 */

const expect = require("chai").expect;
const Fs = require("fs");
const Path = require("path");
const Url = require("url");
const N3 = require("n3");
const Yaml = require("js-yaml");
const jsonld = require("jsonld");
const Manifest = require("..");

const ROOT = Path.join(__dirname, "..", "..", "..");
const DOC = Path.join(ROOT, "doc");
const YAML_FILE = Path.join(DOC, "tests-manifest-ld.yaml");
const TTL_FILE = Path.join(DOC, "tests-manifest-ld.ttl");
const MAP = "http://shex.io/extensions/Map/#";
const SPARQL = "http://shex.js.org/neighborhoods/Sparql/#";
const CORE = Manifest.CoreContextURLs;                 // the ShEx manifest vocabulary's, then shex.js's
const [SHARED_CONTEXT, SHEXJS_CONTEXT] = CORE;
const SUITE_CONTEXT = "https://www.w3.org/ns/shex-test.jsonld";          // the ShEx test vocabulary's
const SHEXJS = "https://shex.js.org/doc/manifest-context.jsonld#";
const SHEXMAN = "http://www.w3.org/ns/shex-manifest#";
const MAP_CONTEXT = "https://shexspec.github.io/extensions/Map/manifest-context.jsonld";
const REDUCE = "http://shex.io/extensions/Reduce/#";
const REDUCE_CONTEXT = "https://shexspec.github.io/extensions/Reduce/manifest-context.jsonld";
const TEST_CONTEXT = "https://shexspec.github.io/extensions/Test/manifest-context.jsonld";

/** "does this URL name a resource?" over the checkout */
const probe = async (url) => {
  try {
    return Fs.existsSync(Url.fileURLToPath(url));
  } catch (e) {
    return false;
  }
};

/** a context the roll-up lacks (none of ours; a test's own) */
const loadContext = async (url) => JSON.parse(Fs.readFileSync(Url.fileURLToPath(url), "utf8"));

const parseTurtle = (text, base) => {
  const store = new N3.Store();
  store.addQuads(new N3.Parser({baseIRI: base}).parse(text));
  return store;
};

const REFERENCES = /URL$|^plugins$|^sitematrix$|^endpoint$|^base$|^dataBase$|^pages$|^node$|^shape$/;

/** an entry made comparable across readings: every reference absolute
 * against `base` (the graph resolved them, the YAML wrote them relatively),
 * the keys no context defines left out (JSON-LD drops those), nulls left
 * out (JSON-LD has none), and the plugins as a set (a graph keeps no order
 * among one property's values) */
function comparable (entry, base, unknown = []) {
  const abs = (s) => typeof s === "string" ? new URL(s, base).href : s;
  const fix = (obj, where) => {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v === null || unknown.includes(where + k))
        continue;
      out[k] = REFERENCES.test(k) ? (Array.isArray(v) ? v.map(abs) : abs(v)) : v;
    }
    if (Array.isArray(out.plugins))
      out.plugins = out.plugins.slice().sort();
    if (Array.isArray(out.pluginURL))
      out.pluginURL = out.pluginURL.slice().sort();
    return out;
  };
  const out = fix(entry, "");
  if (entry.parms) {
    out.parms = {};
    for (const [ns, scope] of Object.entries(entry.parms)) {
      const prefix = (Manifest.KnownVocabularies.find(v => v.namespace === ns) || {prefix: "?"}).prefix;
      out.parms[ns] = fix(scope, prefix + ":parms/");
    }
  }
  return out;
}

/** every classic manifest the repository ships */
const CLASSIC = ["doc/tests-manifest.yaml"]
      .concat(Fs.readdirSync(Path.join(ROOT, "packages"))
              .flatMap(p => ["manifest.yaml", "manifest.json"].map(f => `packages/${p}/examples/${f}`))
              .filter(f => Fs.existsSync(Path.join(ROOT, f))));

describe("@shexjs/manifest", function () {
  describe("the JSON step (canonicalize, upgrade)", function () {
    it("wraps a bare list in entries and defaults the @context to the core: the shared vocabulary, then shex.js's terms", function () {
      expect(CORE).to.deep.equal(["https://www.w3.org/ns/shex-manifest.jsonld", "https://shex.js.org/doc/manifest-context.jsonld"]);
      const c = Manifest.canonicalize([{schemaLabel: "x", schemaURL: "x.shex"}]);
      expect(c).to.deep.equal({"@context": CORE, entries: [{schemaLabel: "x", schemaURL: "x.shex"}]});
    });

    it("takes one bare entry as a manifest of one", function () {
      expect(Manifest.canonicalize({schemaLabel: "x"}).entries).to.deep.equal([{schemaLabel: "x"}]);
    });

    it("nests a classic ShExMap entry's attributes in map:parms, binds the scope, and moves its plugin there", function () {
      const c = Manifest.canonicalize([{
        schemaLabel: "BP",
        plugins: ["../x/ShExMapPlugin.js"],
        schemaURL: "a.shex",
        outputSchemaURL: "b.shex",
        outputShapeMap: "<tag:b0>@<B>",
        staticVars: {"http://a.example/x": '"1"'},
        status: "conformant",
      }]);
      expect(c["@context"]).to.deep.equal([...CORE, {map: MAP, "map:parms": {"@context": MAP_CONTEXT}}]);
      expect(c.entries[0]).to.deep.equal({
        schemaLabel: "BP",
        schemaURL: "a.shex",
        "map:parms": {
          pluginURL: "../x/ShExMapPlugin.js",
          outputSchemaURL: "b.shex",
          outputShapeMap: "<tag:b0>@<B>",
          staticVars: {"http://a.example/x": '"1"'},
        },
        status: "conformant",
      });
      expect(Object.keys(c.entries[0]), "the scope sits where its first attribute was")
        .to.deep.equal(["schemaLabel", "schemaURL", "map:parms", "status"]);
    });

    it("nests a classic ShExReduce entry's overlay in rdc:parms with its plugin", function () {
      const c = Manifest.canonicalize([{
        schemaLabel: "calc",
        plugins: ["../doc/ShExReducePlugin.js"],
        schemaURL: "calc.shex",
        overlayURL: "calc-actions.ttl",
        status: "conformant",
      }]);
      expect(c["@context"]).to.deep.equal([...CORE, {rdc: REDUCE, "rdc:parms": {"@context": REDUCE_CONTEXT}}]);
      expect(c.entries[0]).to.deep.equal({
        schemaLabel: "calc",
        schemaURL: "calc.shex",
        "rdc:parms": {pluginURL: "../doc/ShExReducePlugin.js", overlayURL: "calc-actions.ttl"},
        status: "conformant",
      });
    });

    it("leaves a plugin that implements no known vocabulary at the entry", function () {
      const c = Manifest.canonicalize([{plugins: ["../x/ShExEvalPlugin.js", "../y/Other.js"], schemaLabel: "x"}]);
      expect(c.entries[0]).to.deep.equal({schemaLabel: "x", pluginURL: ["../x/ShExEvalPlugin.js", "../y/Other.js"]});
      expect(c["@context"]).to.deep.equal(CORE);
    });

    it("nests a neighborhood's attributes too, each vocabulary bound once", function () {
      const c = Manifest.canonicalize([
        {schemaLabel: "a", neighborhood: "sparql", endpoint: "https://q.example/sparql"},
        {schemaLabel: "b", neighborhood: "sparql", endpoint: "https://r.example/sparql"},
      ]);
      expect(c["@context"].length, "the core's two and one binding").to.equal(3);
      expect(c.entries.map(e => e["nsp:parms"].endpoint)).to.deep.equal(["https://q.example/sparql", "https://r.example/sparql"]);
      expect(c.entries[0].neighborhood, "a core attribute stays").to.equal("sparql");
    });

    it("reads a classic entry's title as its name, the shared vocabulary's", function () {
      expect(Manifest.canonicalize([{title: "layout in schema", schemaURL: "s.shex"}]).entries[0])
        .to.deep.equal({name: "layout in schema", schemaURL: "s.shex"});
      expect(Manifest.canonicalize([{title: "t", name: "n"}]).entries[0], "a name it has stays").to.deep.equal({title: "t", name: "n"});
      expect(Manifest.canonicalize({"@context": CORE, entries: [{title: "t"}]}).entries[0], "a document with an @context says what it means")
        .to.deep.equal({title: "t"});
    });

    it("renames a test manifest's shex to schema", function () {
      expect(Manifest.canonicalize([{shex: "x.shex", data: "x.ttl"}]).entries[0]).to.deep.equal({schema: "x.shex", data: "x.ttl"});
    });

    it("takes a document with an @context as it says", function () {
      const doc = {"@context": CORE, entries: [{schemaLabel: "x", outputSchemaURL: "flat.shex"}]};
      expect(Manifest.canonicalize(doc)).to.deep.equal(doc);
    });

    it("leaves a JSON-LD @graph document alone", function () {
      const doc = {"@context": "x", "@graph": [{"@id": "y"}]};
      expect(Manifest.canonicalize(doc)).to.equal(doc);
    });

    describe("x -> xURL", function () {
      const base = "http://a.example/dir/manifest.yaml";

      it("renames a reference the probe confirms, in place, and leaves text alone", async function () {
        const asked = [];
        const probe = async (url) => { asked.push(url); return url.endsWith(".shex"); };
        const {entries: [e]} = await Manifest.upgrade([{
          schemaLabel: "x",
          schema: "s.shex",
          data: "<x> <p> 1 .",
          queryMap: "x@START",            // probed, not a resource, so text
        }], {base, probe});
        expect(e).to.deep.equal({schemaLabel: "x", schemaURL: "s.shex", data: "<x> <p> 1 .", queryMap: "x@START"});
        expect(Object.keys(e)).to.deep.equal(["schemaLabel", "schemaURL", "data", "queryMap"]);
        expect(asked).to.deep.equal(["http://a.example/dir/s.shex", "http://a.example/dir/x@START"]);
      });

      it("asks for a schema without an extension in each of its representations, and keeps it as written", async function () {
        const asked = [];
        const probe = async (url) => { asked.push(url); return url.endsWith("/s.json"); };
        const {entries: [e, text]} = await Manifest.upgrade([{schema: "s"}, {schema: "t"}], {base, probe});
        expect(e.schemaURL, "negotiable, so written without the representation found").to.equal("s");
        expect(text.schema, "no representation of t").to.equal("t");
        expect(asked).to.deep.equal(["http://a.example/dir/s", "http://a.example/dir/s.shex", "http://a.example/dir/s.json",
                                     "http://a.example/dir/t", "http://a.example/dir/t.shex", "http://a.example/dir/t.json", "http://a.example/dir/t.ttl"]);
        expect(Manifest.representations("../schemas/1dot")).to.deep.equal(["../schemas/1dot", "../schemas/1dot.shex", "../schemas/1dot.json", "../schemas/1dot.ttl"]);
        expect(Manifest.representations("1dot.shex"), "an extension says which").to.deep.equal(["1dot.shex"]);
        expect(Manifest.representations("x@START"), "only a schema is negotiable: a query map probed once").to.have.lengthOf(4);
      });

      it("probes each of a data list and renames only when all are resources", async function () {
        const probe = async (url) => url.endsWith(".ttl");
        const {entries: [all, mixed]} = await Manifest.upgrade([
          {data: ["a.ttl", "b.ttl"]},
          {data: ["a.ttl", "not-there"]},
        ], {base, probe});
        expect(all.dataURL).to.deep.equal(["a.ttl", "b.ttl"]);
        expect(mixed.data).to.deep.equal(["a.ttl", "not-there"]);
      });

      it("falls back to the whitespace-or-bracket heuristic, for schema and data only", async function () {
        const {entries: [e]} = await Manifest.upgrade([{schema: "s.shex", data: "<x> <p> 1 .", queryMap: "x@START"}]);
        expect(e.schemaURL).to.equal("s.shex");
        expect(e.data).to.equal("<x> <p> 1 .");
        expect(e.queryMap, "queryMap is never guessed").to.equal("x@START");
      });

      it("never touches an attribute that already has its URL twin", async function () {
        const {entries: [e]} = await Manifest.upgrade([{schema: "text", schemaURL: "s.shex"}], {base, probe: async () => true});
        expect(e).to.deep.equal({schema: "text", schemaURL: "s.shex"});
      });

      it("settles a scope's own document pairs inside the scope, with a probe only", async function () {
        const classic = () => [
          {plugins: ["ShExReducePlugin.js"], overlay: "o.ttl"},
          {plugins: ["ShExReducePlugin.js"], overlay: "PREFIX sa: <http://shex.io/ns/semact#>\n"},
        ];
        const probe = async (url) => url.endsWith(".ttl");
        const {entries: [ref, text]} = await Manifest.upgrade(classic(), {base, probe});
        expect(ref["rdc:parms"]).to.deep.equal({pluginURL: "ShExReducePlugin.js", overlayURL: "o.ttl"});
        expect(text["rdc:parms"].overlay, "text stays text").to.match(/^PREFIX sa:/);
        const {entries: [unprobed]} = await Manifest.upgrade(classic());
        expect(unprobed["rdc:parms"].overlay, "never guessed").to.equal("o.ttl");
      });

      it("knows a context's document pairs", function () {
        expect(Manifest.documentPairs(Manifest.KnownContexts[REDUCE_CONTEXT])).to.deep.equal(["overlay"]);
        expect(Manifest.documentPairs(Manifest.KnownContexts[MAP_CONTEXT]))
          .to.deep.equal(["outputSchema", "outputShapeMap", "staticVars", "expectedBindings", "expectedOutputData"]);
        expect(Manifest.documentPairs(Manifest.KnownContexts[SHARED_CONTEXT])).to.have.members(["schema", "data", "queryMap"]);
      });

      it("settles a test manifest's shex after renaming it", async function () {
        const {entries: [e]} = await Manifest.upgrade([{shex: "s.shex"}], {base, probe: async () => true});
        expect(e).to.deep.equal({schemaURL: "s.shex"});
      });
    });
  });

  describe("the frame check", function () {
    const BINDING = CORE.length;                         // where framed()'s one binding sits
    const framed = () => ({
      "@context": [...CORE, {map: MAP, "map:parms": {"@context": MAP_CONTEXT}}],
      entries: [{schemaLabel: "BP", schemaURL: "a.shex",
                 "map:parms": {pluginURL: "p.js", outputSchemaURL: "b.shex", staticVars: {"http://a.example/x": '"1"'}},
                 status: "conformant"}],
    });
    const reasonsFor = (edit) => {
      const doc = framed();
      edit(doc);
      return Manifest.frameCheck(doc).reasons;
    };

    it("passes the canonical form", function () {
      expect(Manifest.frameCheck(framed())).to.deep.equal({faithful: true, reasons: [], unknown: []});
    });

    it("takes shex.js's context by any of its URLs: published, in a checkout, beside the manifest", function () {
      for (const [ref, base] of [[SHEXJS_CONTEXT], ["./manifest-context.jsonld", "file:///x/shex.js/doc/m.yaml"],
                                 ["http://localhost/checkouts/shexjs/shex.js/doc/manifest-context.jsonld"]]) {
        const doc = framed();
        doc["@context"][1] = ref;
        expect(Manifest.frameCheck(doc, {base}).faithful, ref).to.equal(true);
      }
      // ...but not by a name that says nothing of whose it is
      const doc = framed();
      doc["@context"][1] = "./manifest-context.jsonld";
      expect(Manifest.frameCheck(doc).reasons.join(), "no base to resolve it against").to.match(/does not know/);
    });

    it("passes a manifest of the shared vocabulary alone, and lists what it leaves undefined", function () {
      const doc = {"@context": SHARED_CONTEXT,
                   entries: [{name: "t1", schemaURL: "a.shex", dataURL: ["a.ttl", "b.ttl"], node: "http://a.example/n",
                              shape: "http://a.example/S", status: "conformant", comment: "c", pluginURL: "p.js"}]};
      expect(Manifest.frameCheck(doc)).to.deep.equal({faithful: true, reasons: [], unknown: ["pluginURL"]});
    });

    it("passes what describes the manifest itself beside the entries", function () {
      const doc = framed();
      Object.assign(doc, {"@id": "", "@type": "Manifest", comment: "some examples", mystery: 1});
      expect(Manifest.frameCheck(doc)).to.deep.equal({faithful: true, reasons: [], unknown: ["/mystery"]});
    });

    it("passes an entry named by an @id", function () {
      const doc = framed();
      doc.entries[0]["@id"] = "#bp";
      doc.entries.push({"@id": "#other", schemaLabel: "other"});
      expect(Manifest.frameCheck(doc, {base: "http://a.example/m.yaml"}).faithful).to.equal(true);
    });

    describe("over the ShEx test vocabulary's terms", function () {
      const suite = (entry) => ({"@context": [SHARED_CONTEXT, SUITE_CONTEXT], entries: [Object.assign({name: "t1"}, entry)]});

      it("passes a test's traits, which are plain names", function () {
        expect(Manifest.frameCheck(suite({trait: ["Empty", "Start"], approval: "Approved"}))).to.deep.equal({faithful: true, reasons: [], unknown: []});
      });

    });

    describe("inside the Test extension's scope, which the suite's validation manifest binds", function () {
      const TEST = "http://shex.io/extensions/Test/#";
      const probed = (parms) => ({"@context": [SHARED_CONTEXT, SUITE_CONTEXT, {tst: TEST, "tst:parms": {"@context": TEST_CONTEXT}}],
                                  entries: [{name: "t1", "tst:parms": parms}]});

      it("passes prints: lines, or nodes naming the action that printed them", function () {
        expect(Manifest.frameCheck(probed({prints: ["p1", {extension: TEST + "a", line: "p2"}]})))
          .to.deep.equal({faithful: true, reasons: [], unknown: []});
      });

      it("sends a nested node with a name no context defines to the JSON-LD reading", function () {
        const check = Manifest.frameCheck(probed({prints: [{extension: TEST + "a", mystery: 1}]}));
        expect(check.reasons.join()).to.match(/"mystery" at tst:parms\/prints is not an absolute IRI/);
      });
    });

    describe("a term whose values are names in a vocabulary (@type: @vocab)", function () {
      // no known context has one; a scope of this test's own, known for its duration
      const SCOPE = "https://x.example/kinds/manifest-context.jsonld";
      before(function () {
        Manifest.KnownContexts[SCOPE] = {"@context": {
          kind: {"@id": "http://x.example/kinds#kind", "@type": "@vocab", "@context": {"@vocab": "http://x.example/kinds#"}},
        }};
      });
      after(function () { delete Manifest.KnownContexts[SCOPE]; });
      const kinds = (kind) => ({
        "@context": [...CORE, {k: "http://x.example/kinds#", "k:parms": {"@context": SCOPE}}],
        entries: [{schemaLabel: "x", "k:parms": {kind}}],
      });

      it("passes plain names", function () {
        expect(Manifest.frameCheck(kinds(["Big", "Small"]))).to.deep.equal({faithful: true, reasons: [], unknown: []});
      });

      [["a term's name", "status"], ["a compact IRI", "k:Big"], ["an IRI", "http://a.example/T"], ["a keyword", "@type"]]
        .forEach(([what, name]) =>
          it(`sends ${what} where a name goes to the JSON-LD reading`, function () {
            expect(Manifest.frameCheck(kinds([name])).reasons.join()).to.match(/not a plain name in its vocabulary/);
          }));
    });

    it("lists the keys no context defines, without calling them a reason", function () {
      const doc = framed();
      doc.entries[0].options = {or: "someOf"};
      doc.entries[0]["map:parms"].mystery = 1;
      expect(Manifest.frameCheck(doc)).to.deep.equal({faithful: true, reasons: [], unknown: ["map:parms/mystery", "options"]});
    });

    [["a context the roll-up does not know", d => d["@context"].push("https://other.example/ctx.jsonld"), /does not know/],
     ["a scope stacked at the top level", d => d["@context"].push(MAP_CONTEXT), /stacked at the top level/],
     ["no context that defines entries", d => d["@context"].shift(), /no stacked context defines `entries`/],
     ["a term defined in the manifest's own @context", d => d["@context"].push({label: "http://other.example/label"}), /defines "label"/],
     ["a stacked term redefined as a prefix", d => d["@context"].push({schemaLabel: "http://other.example/"}), /redefines a term/],
     ["a stacked prefix rebound", d => d["@context"].push({shex: "http://other.example/shex#"}), /redefines a term/],
     ["@vocab", d => d["@context"].push({"@vocab": "http://other.example/"}), /@vocab/],
     ["a scope bound to an unknown context", d => { d["@context"][BINDING]["map:parms"]["@context"] = "https://other.example/scope.jsonld"; }, /scopes a context/],
     ["a scope bound to a top-level context", d => { d["@context"][BINDING]["map:parms"]["@context"] = SUITE_CONTEXT; }, /scopes a context/],
     ["an inline scope definition", d => { d["@context"][BINDING]["map:parms"]["@context"] = {zoom: "http://other.example/zoom"}; }, /scopes a context/],
     ["@type on an entry", d => { d.entries[0]["@type"] = "Entry"; }, /@type in entry 0/],
     ["a blank node's label as an entry's @id", d => { d.entries[0]["@id"] = "_:bp"; }, /@id of entry 0 is not an IRI reference/],
     ["two entries with one @id", d => { d.entries[0]["@id"] = "#bp"; d.entries.push({"@id": "#bp"}); }, /entry 1 has the @id of an earlier entry/],
     ["an embedded @context", d => { d.entries[0]["@context"] = {}; }, /@context in entry 0/],
     ["a full IRI as a key", d => { d.entries[0]["http://shex.io/extensions/Map/#parms"] = {}; }, /IRI-shaped key/],
     ["a compact IRI as a key", d => { d.entries[0]["map:outputSchemaURL"] = "x"; }, /IRI-shaped key/],
     ["a prefix used as a key", d => { d.entries[0].map = "x"; }, /prefix used as a key/],
     ["a value object", d => { d.entries[0].comment = {"@value": "hi", "@language": "en"}; }, /@value at comment/],
     ["a node object where a reference goes", d => { d.entries[0].schemaURL = {"@id": "a.shex"}; }, /@id at schemaURL/],
     ["a nested mapping with a non-IRI key", d => { d.entries[0]["map:parms"].staticVars = {x: 1}; }, /not an absolute IRI/],
     ["@graph beside the entries", d => { d["@graph"] = []; }, /@graph beside the entries/],
     ["an IRI-shaped key beside the entries", d => { d["shexMan:entries"] = []; }, /IRI-shaped key beside the entries/],
    ].forEach(([what, edit, pattern]) =>
      it(`sends ${what} to the JSON-LD reading`, function () {
        const reasons = reasonsFor(edit);
        expect(reasons.join("\n")).to.match(pattern);
      }));

    it("refuses to read plainly what it cannot, when no processor is at hand", async function () {
      const doc = framed();
      doc.entries[0]["@type"] = "Entry";
      let error;
      await Manifest.readJson(doc).catch(e => { error = e; });
      expect(error.message).to.include("JSON-LD").and.include("@type in entry 0");
    });
  });

  describe("the plain reading and the JSON-LD reading", function () {
    const readBoth = async (doc, base) => {
      const canonical = await Manifest.upgrade(doc, {base, probe});
      const check = Manifest.frameCheck(canonical, {base});
      const plain = Manifest.entriesFromJson(canonical);
      const viaJsonLd = await Manifest.entriesViaJsonLd(canonical, {jsonld, base, loadContext});
      return {check, plain, viaJsonLd};
    };

    it("agree on the YAML-LD sketch", async function () {
      const base = Url.pathToFileURL(YAML_FILE).href;
      const {check, plain, viaJsonLd} = await readBoth(Yaml.load(Fs.readFileSync(YAML_FILE, "utf8")), base);
      expect(check, "the sketch is framed").to.deep.equal({faithful: true, reasons: [], unknown: []});
      expect(viaJsonLd.map(e => comparable(e, base))).to.deep.equal(plain.map(e => comparable(e, base)));
    });

    CLASSIC.forEach(file =>
      it(`agree on ${file}, upgraded`, async function () {
        this.timeout(20000);
        const base = Url.pathToFileURL(Path.join(ROOT, file)).href;
        const {check, plain, viaJsonLd} = await readBoth(Yaml.load(Fs.readFileSync(Path.join(ROOT, file), "utf8")), base);
        expect(check.reasons, "every deployed manifest upgrades to a framed one").to.deep.equal([]);
        expect(plain.length).to.be.above(0);
        expect(viaJsonLd.map(e => comparable(e, base)))
          .to.deep.equal(plain.map(e => comparable(e, base, check.unknown)));
      }));

    it("recognize every key the repository's manifests use", async function () {
      const unknown = new Set();
      for (const file of CLASSIC) {
        const canonical = Manifest.canonicalize(Yaml.load(Fs.readFileSync(Path.join(ROOT, file), "utf8")));
        Manifest.frameCheck(canonical).unknown.forEach(k => unknown.add(k));
      }
      expect([...unknown]).to.deep.equal([]);
    });
  });

  describe("JSON-LD that is not framed", function () {
    const base = "https://m.example/doc/manifest.yaml";
    const canonical = {
      "@context": [...CORE, {map: MAP, "map:parms": {"@context": MAP_CONTEXT}}],
      entries: [
        {schemaLabel: "BP", schemaURL: "a.shex", dataLabel: "simple", data: "<x> <p> 1 .", queryMap: "<x>@START",
         "map:parms": {pluginURL: "p.js", outputSchemaURL: "b.shex", outputShapeMap: "<tag:b0>@<B>", staticVars: {"http://a.example/x": '"1"'}},
         status: "conformant"},
        {schemaLabel: "second", schemaURL: "c.shex", status: "nonconformant"},
      ],
    };
    const loader = Manifest.documentLoader();
    let expected;
    before(function () {
      expected = Manifest.entriesFromJson(canonical).map(e => comparable(e, base));
    });

    it("reads the same entries from the expanded form", async function () {
      const expanded = await jsonld.expand(canonical, {base, documentLoader: loader});
      expect(Manifest.frameCheck(expanded).faithful).to.equal(false);
      const entries = await Manifest.readJson(expanded, {jsonld, base});
      expect(entries.map(e => comparable(e, base))).to.deep.equal(expected);
    });

    it("reads the same entries from a document compacted with someone else's names", async function () {
      const theirs = {
        s: {"@id": SHEXMAN + "schema", "@type": "@id"},
        tests: {"@id": SHEXMAN + "entries", "@container": "@list"},
        m: MAP,
      };
      const expanded = await jsonld.expand(canonical, {base, documentLoader: loader});
      const compacted = await jsonld.compact(expanded, theirs, {base});
      expect(compacted.tests[0], "written their way").to.have.property("s");
      let check;
      const entries = await Manifest.readJson(compacted, {jsonld, base, onCheck: c => { check = c; }});
      expect(check.faithful).to.equal(false);
      expect(entries.map(e => comparable(e, base))).to.deep.equal(expected);
    });

    it("keeps the entries in order through the graph", async function () {
      const many = {"@context": CORE, entries: [...Array(40).keys()].map(i => ({schemaLabel: "entry " + i}))};
      const entries = await Manifest.entriesViaJsonLd(many, {jsonld, base});
      expect(entries.map(e => e.schemaLabel)).to.deep.equal(many.entries.map(e => e.schemaLabel));
    });

    it("gets right what a plain reading would get wrong: a context that changes what a name means", async function () {
      const doc = {
        "@context": [...CORE, {schemaLabel: {"@id": "http://other.example/label"}}],
        entries: [{schemaLabel: "not our label", schemaURL: "a.shex"}],
      };
      expect(Manifest.frameCheck(doc).reasons.join()).to.match(/defines "schemaLabel"/);
      const [entry] = await Manifest.readJson(doc, {jsonld, base});
      expect(entry).not.to.have.property("schemaLabel");
      expect(entry["http://other.example/label"]).to.equal("not our label");
      expect(Manifest.entriesFromJson(doc)[0].schemaLabel, "the plain reading, had it been trusted").to.equal("not our label");
    });

    it("loads the processor only when it is needed", async function () {
      let loaded = 0;
      const lazy = async () => { ++loaded; return jsonld; };
      await Manifest.readJson(canonical, {jsonld: lazy, base});
      expect(loaded, "a framed document never asks").to.equal(0);
      await Manifest.readJson(await jsonld.expand(canonical, {base, documentLoader: loader}), {jsonld: lazy, base});
      expect(loaded).to.equal(1);
    });
  });

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

    it("reads ShExReduce's overlay from its scope, and flat beside the core attributes", function () {
      const calc = entries.find(e => e.schemaLabel === "calc, actions in an overlay");
      expect(calc.parms[REDUCE]).to.deep.equal({
        pluginURL: "../packages/extension-reduce/doc/ShExReducePlugin.js",
        overlayURL: "../packages/extension-reduce/examples/calc/calc-actions.ttl"});
      expect(calc.overlayURL).to.equal("../packages/extension-reduce/examples/calc/calc-actions.ttl");
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
      const fromTtl = await Manifest.readManifest(Fs.readFileSync(TTL_FILE, "utf8"), {base: ttlBase, parseTurtle});
      expect(fromTtl.map(e => comparable(e, ttlBase))).to.deep.equal(fromYaml.map(e => comparable(e, yamlBase)));
    });

    it("needs a parser handed in", async function () {
      let error;
      await Manifest.readManifest("PREFIX : <http://a.example/>\n", {format: "turtle"}).catch(e => { error = e; });
      expect(error.message).to.include("parseTurtle");
    });
  });

  describe("scopes", function () {
    it("takes the manifest's prefix from its @context, however the prefix is declared", function () {
      const doc = {
        "@context": [
          "./core.jsonld",                                     // a remote context contributes nothing
          {m: MAP, "m:parms": {"@context": "https://x.example/scope.jsonld"}},
          {w: {"@id": "http://x.example/w#", "@prefix": true}},
        ],
        entries: [{"m:parms": {pluginURL: "m.js"}, "w:parms": {pluginURL: "w.js", zoom: 3}}],
      };
      const [e] = Manifest.entriesFromJson(doc);
      expect(e.plugins).to.deep.equal(["m.js", "w.js"]);
      expect(e.zoom).to.equal(3);
      expect(Object.keys(e.parms).sort()).to.deep.equal([MAP, "http://x.example/w#"].sort());
    });

    it("refuses a prefix the manifest never declared", function () {
      expect(() => Manifest.entriesFromJson({entries: [{"map:parms": {pluginURL: "p.js"}}]}))
        .to.throw(/"map:parms".*@context/);
    });

    it("refuses a name written in two scopes", function () {
      expect(() => Manifest.entriesFromJson({
        "@context": {a: "http://a.example/#", b: "http://b.example/#"},
        entries: [{"a:parms": {endpoint: "x"}, "b:parms": {endpoint: "y"}}],
      })).to.throw(/"endpoint".*twice/);
    });

    it("folds an old manifest's plugins list and an entry-level pluginURL into plugins", function () {
      const [e] = Manifest.entriesFromJson([{plugins: ["a.js"], pluginURL: "b.js", schemaLabel: "x"}]);
      expect(e.plugins).to.deep.equal(["a.js", "b.js"]);
      expect(e).not.to.have.property("pluginURL");
    });
  });

  describe("the roll-up of known contexts", function () {
    const TEST_network = require("../../shex-cli/test/testGate.js")("TEST_network");

    /** what the roll-up keeps of a context document */
    const contextOf = (file) => ({"@context": JSON.parse(Fs.readFileSync(file, "utf8"))["@context"]});

    it("carries the repository's own contexts (rerun tools/rollup-manifest-contexts.js otherwise)", function () {
      for (const file of ["doc/manifest-context.jsonld",
                          "packages/neighborhood-sparql/manifest-context.jsonld",
                          "packages/neighborhood-wikibase/manifest-context.jsonld"])
        expect(Manifest.KnownContexts["https://shex.js.org/" + file], file).to.deep.equal(contextOf(Path.join(ROOT, file)));
    });

    // the contexts w3c/ns publishes, wherever a checkout of it sits beside this one
    [[SHARED_CONTEXT, "the ShEx manifest vocabulary's", () => Path.join(ROOT, "..", "..", "w3c", "ns", "shex-manifest.jsonld"),
      "--ns <w3c/ns checkout>"],
     [SUITE_CONTEXT, "the ShEx test vocabulary's", () => Path.join(ROOT, "..", "..", "w3c", "ns", "shex-test.jsonld"),
      "--ns <w3c/ns checkout>"],
    ].forEach(([url, what, where, option]) => {
      let file = null;
      try {
        file = where();
      } catch (e) {
        // no corpus
      }
      (file !== null && Fs.existsSync(file) ? it : it.skip)(`carries ${what} (rerun the roll-up with ${option} otherwise)`, function () {
        expect(Manifest.KnownContexts[url]).to.deep.equal(contextOf(file));
      });
    });

    it("stacks the core, and every top-level context, into one", function () {
      expect(Manifest.TopContextURLs).to.deep.equal([...CORE, SUITE_CONTEXT]);
      const core = Manifest.CoreContext["@context"], top = Manifest.TopContext["@context"];
      expect(core.entries, "from the shared vocabulary").to.deep.equal(Manifest.KnownContexts[SHARED_CONTEXT]["@context"].entries);
      expect(core.pluginURL, "from shex.js's").to.deep.equal(Manifest.KnownContexts[SHEXJS_CONTEXT]["@context"].pluginURL);
      expect(core).not.to.have.property("trait");
      expect(top.trait, "from the test vocabulary's").to.deep.equal(Manifest.KnownContexts[SUITE_CONTEXT]["@context"].trait);
      // no context changes what another's name means: stacking order is immaterial
      for (const url of Manifest.TopContextURLs)
        for (const [term, def] of Object.entries(Manifest.KnownContexts[url]["@context"]))
          expect(top[term], `${term} of ${url}`).to.deep.equal(def);
    });

    it("gives shex.js's terms a namespace that resolves to their context", function () {
      expect(Manifest.KnownContexts[SHEXJS_CONTEXT]["@context"].shexjs).to.equal(SHEXJS_CONTEXT + "#");
    });

    it("names each vocabulary's prefix, namespace and scope", function () {
      expect(Manifest.KnownVocabularies.map(v => v.prefix)).to.deep.equal(["nsp", "nwb", "map", "rdc", "ssp", "tst"]);
      for (const v of Manifest.KnownVocabularies)
        expect(Manifest.KnownContexts, v.prefix).to.have.property(v.context);
    });

    it("knows a context by its published URL or, for the repository's own, by its path", function () {
      expect(Manifest.knownContextURL(MAP_CONTEXT)).to.equal(MAP_CONTEXT);
      expect(Manifest.knownContextURL("../packages/neighborhood-sparql/manifest-context.jsonld", "file:///x/shex.js/doc/m.yaml"))
        .to.equal("https://shex.js.org/packages/neighborhood-sparql/manifest-context.jsonld");
      expect(Manifest.knownContextURL("manifest-context.jsonld"), "ambiguous without a base").to.equal(null);
      expect(Manifest.knownContextURL("https://other.example/doc/other-context.jsonld")).to.equal(null);
    });

    it("answers a documentLoader without the network, and hands the rest on", async function () {
      const asked = [];
      const loader = Manifest.documentLoader(async url => { asked.push(url); return {contextUrl: null, documentUrl: url, document: {}}; });
      const map = await loader(MAP_CONTEXT);
      expect(map.document["@context"]).to.have.property("outputSchemaURL");
      const ours = await loader("file:///anywhere/shex.js/doc/manifest-context.jsonld");
      expect(ours.document).to.equal(Manifest.KnownContexts[SHEXJS_CONTEXT]);
      const shared = await loader(SHARED_CONTEXT);
      expect(shared.document["@context"]).to.have.property("entries");
      await loader("https://other.example/ctx.jsonld");
      expect(asked).to.deep.equal(["https://other.example/ctx.jsonld"]);
      let error;
      await Manifest.documentLoader()("https://other.example/ctx.jsonld").catch(e => { error = e; });
      expect(error.message).to.include("roll-up");
    });

    (TEST_network ? it : it.skip)("is what the web publishes", async function () {
      this.timeout(20000);
      // on their repositories' branches (w3c/ns manifest-refactor; the Test
      // extension's on shexSpec/extensions test-prints), not yet where they
      // will be published: nothing to compare with until they are
      const PENDING = [SHARED_CONTEXT, SUITE_CONTEXT, TEST_CONTEXT];
      for (const [url, doc] of Object.entries(Manifest.KnownContexts)) {
        if (url.startsWith("https://shex.js.org/"))
          continue; // published from main; this branch is ahead of it
        const resp = await fetch(url);
        if (resp.status === 404 && PENDING.includes(url))
          continue;
        expect(resp.ok, url).to.equal(true);
        expect((await resp.json())["@context"], url).to.deep.equal(doc["@context"]);
      }
    });

    it("maps a predicate to its text and URL spellings", function () {
      const vocab = Manifest.vocabularyOf(Manifest.CoreContext);
      expect(vocab.get(SHEXMAN + "schema")).to.deep.equal({text: "schema", url: "schemaURL"});
      expect(vocab.get(SHEXMAN + "data")).to.deep.equal({text: "data", url: "dataURL", container: "@set"});
      expect(vocab.get(SHEXMAN + "entries")).to.deep.equal({url: "entries", container: "@list"});
      expect(vocab.get("http://www.w3.org/ns/shex#status")).to.deep.equal({text: "status"});
      expect(vocab.get(SHEXJS + "plugin")).to.deep.equal({url: "pluginURL"});
    });

    it("maps a predicate whose values are names to the vocabulary they are names in", function () {
      const K = "http://x.example/kinds#";
      const ctx = {"@context": {kind: {"@id": K + "kind", "@type": "@vocab", "@context": {"@vocab": K}}}};
      expect(Manifest.vocabularyOf(ctx).get(K + "kind")).to.deep.equal({text: "kind", vocab: K});
      // the test vocabulary's traits are plain names
      expect(Manifest.vocabularyOf(Manifest.TopContext).get("http://www.w3.org/ns/shex-test#trait")).to.deep.equal({text: "trait"});
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
