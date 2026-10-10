"use strict";
/**
 * The shexTest conformance manifests, read as shex.js reads its own
 * examples.
 *
 * The shexTest branch `manifest-refactor` keeps two resources in each suite
 * directory.  `manifest` is the original structure, as on shexTest main:
 * manifest.ttl (the SPARQL WG's test-manifest format: every test typed
 * sht:..., its inputs in an mf:action node) and manifest.jsonld.
 * `manifest-ld` is the same tests in the ShEx manifest vocabulary:
 * manifest-ld.yaml, the text to edit, and its JSON (manifest-ld.jsonld) and
 * RDF (manifest-ld.ttl), written from it by the suite's bin/manifest-ld.js.
 * It stacks https://www.w3.org/ns/shex-manifest.jsonld, the context this
 * package's manifests stack too, plus the ShEx test vocabulary
 * (https://www.w3.org/ns/shex-test.jsonld) for what a test says beyond an
 * entry of the first, and binds the Test extension's scope for what a
 * test's actions print, as an example binds an extension's.  Nothing types
 * a test: a validation test is an entry with a `status`.
 *
 * That each manifest-ld.yaml says what its manifest.ttl says, and that the
 * legacy files are derivable from it, is the suite's own business, checked
 * there by bin/manifest-ld-legacy-check.js (in its npm test).  What is checked here
 * is what shex.js makes of them, for each of the five:
 *
 * - @shexjs/manifest reads the same entries from the three
 *   representations, read with the resource's URL as their base, and
 *   manifest-ld is what shex.js's suites read
 *   (packages/shex-cli/test/suiteManifest.js);
 * - as JSON-LD it is a graph in which nothing it says is dropped;
 *   @shexjs/manifest reads it as it reads any manifest, and its plain
 *   reading is its JSON-LD reading;
 * - tools/manifest-runner.js, which runs shex.js's examples and knows
 *   nothing of the suite, gets the status each validation entry states
 *   and, with the Test extension registered as an example's plugin would
 *   be, prints what the scope says.
 *
 * Skipped unless the corpus findPath.js resolves has the manifest-ld files.
 */

const expect = require("chai").expect;
const Fs = require("fs");
const Path = require("path");
const Url = require("url");
const Yaml = require("js-yaml");
const N3 = require("n3");
const jsonld = require("jsonld");
const Manifest = require("..");
const findPath = require("../../shex-cli/test/findPath.js");
const TestExtension = require("@shexjs/extension-test");   // the suite's probe: what print(...) emits
const ShExTerm = require("@shexjs/term");

const SUITES = ["validation", "schemas", "negativeSyntax", "negativeStructure", "validation-contrib"];
const VALIDATION = ["validation", "validation-contrib"];

function corpusDir (suite) {
  try {
    const dir = findPath(suite);
    return dir && Fs.existsSync(Path.join(dir, "manifest-ld.yaml")) ? dir : null;
  } catch (e) {
    return null;
  }
}

// --- comparing the two readings ---------------------------------------------------

const TERMS = Manifest.TopContext["@context"];
const isReference = (key) => key === "@id" || (TERMS[key] && TERMS[key]["@type"] === "@id");
const isList = (key) => TERMS[key] && TERMS[key]["@container"] === "@list";

/** a compact IRI the stacked contexts or the manifest's own @context have a
 * prefix for, in full: the plain reading keeps such a key as written, the
 * graph gives its IRI */
const expanded = (key, prefixes) => {
  const i = key.indexOf(":");
  const iri = i > 0 ? prefixes[key.slice(0, i)] || TERMS[key.slice(0, i)] : undefined;
  return typeof iri === "string" ? iri + key.slice(i + 1) : key;
};

/** a value made comparable across the readings: a reference absolute
 * against `base` (the graph resolved it, the YAML wrote it relatively), and
 * a property's several values as a set -- a graph keeps neither their order
 * nor a repeat -- unless the term says they are a list */
function comparable (value, key, base, prefixes = {}) {
  if (Array.isArray(value)) {
    const items = value.map(v => comparable(v, key, base, prefixes));
    if (isList(key))
      return items;
    const set = [...new Map(items.map(v => [JSON.stringify(v), v])).values()]
          .sort((l, r) => JSON.stringify(l) < JSON.stringify(r) ? -1 : 1);
    return set.length === 1 ? set[0] : set;
  }
  if (value !== null && typeof value === "object")
    return Object.fromEntries(Object.keys(value).map(k => [expanded(k, prefixes), comparable(value[k], k, base, prefixes)])
                              .sort(([l], [r]) => l < r ? -1 : 1));
  return typeof value === "string" && isReference(key) ? new URL(value, base).href : value;
}

/** an entry as written, in the shape the reader gives it: each
 * `<prefix>:parms` scope's attributes beside the core ones, and the scope
 * itself under `parms` by its namespace */
function flattened (entry, prefixes) {
  const out = {}, parms = {};
  for (const [key, value] of Object.entries(entry)) {
    const scope = /^([^:]+):parms$/.exec(key);
    if (scope && prefixes[scope[1]] !== undefined) {
      Object.assign(out, value);
      parms[prefixes[scope[1]]] = value;
    } else {
      out[key] = value;
    }
  }
  return Object.keys(parms).length ? Object.assign(out, {parms}) : out;
}

// --- running an entry as an example -----------------------------------------------

const traitsOf = (entry) => [].concat(entry.trait || []);

/** what an entry needs that shex.js's examples never do, so its examples
 * runner does not do it: importing another schema, semantic actions
 * supplied from outside the schema (semActsURL) or external shapes to
 * consult, a query map in a file, or -- in a query map written out -- a
 * literal to validate or a blank node for a shape.  null when it needs
 * none of them.  (A semantic action in the schema is what an example may
 * have: the runner registers the Test extension, the suite's probe, as it
 * would an example's plugin) */
function beyondExamples (entry) {
  const traits = traitsOf(entry);
  return traits.includes("Import") ? "an import"
    : "semActsURL" in entry ? "externally supplied semantic actions"
    : "shapeExternsURL" in entry ? "external shapes"
    : "queryMapURL" in entry ? "a query map in a file"
    : "queryMap" in entry && !/^(?:<[^>]*>|_:[^@\s]+)@(?:<[^>]*>|START)$/.test(entry.queryMap) ? "a literal focus or a blank-node shape"
    : null;
}

describe("the conformance suite's manifests, read as examples", function () {
  if (corpusDir("validation") === null) {
    it.skip("is skipped: the shexTest corpus has no manifest-ld.yaml (check out its manifest-refactor branch)");
    return;
  }

  SUITES.forEach(suite => {
    const dir = corpusDir(suite);
    if (dir === null)
      return;
    describe(suite, function () {
      this.timeout(120000);
      const file = Path.join(dir, "manifest-ld.yaml");
      const base = Url.pathToFileURL(file).href;
      let yamlText, doc;
      before(function () {
        yamlText = Fs.readFileSync(file, "utf8");
        doc = Yaml.load(yamlText);
      });

      describe("reads the same from manifest-ld's three representations", function () {
        // the resource's own URL: a reference like #1dotRefLNex1 means
        // manifest-ld#1dotRefLNex1, whichever representation said it
        const resource = Url.pathToFileURL(Path.join(dir, "manifest-ld")).href;
        const read = (name) => Fs.readFileSync(Path.join(dir, name), "utf8");

        it("reads into the same entries through @shexjs/manifest, whichever representation", async function () {
          const prefixes = Manifest.prefixesOf(doc["@context"]);
          const same = e => comparable(e, null, resource, prefixes);
          const parseTurtle = (text, base) => new Manifest.QuadList(new N3.Parser({baseIRI: base}).parse(text));
          const [fromYaml, fromJson, fromTurtle] = await Promise.all(["manifest-ld.yaml", "manifest-ld.jsonld", "manifest-ld.ttl"]
            .map(name => Manifest.readManifest(read(name), {base: resource, format: name.endsWith(".ttl") ? "turtle" : undefined,
                                                            jsonld, parseTurtle})));
          expect(fromYaml.length).to.equal(doc.entries.length);
          expect(fromJson.map(same)).to.deep.equal(fromYaml.map(same));
          expect(fromTurtle.map(same)).to.deep.equal(fromYaml.map(same));
        });

        it("is what shex.js's suites read", function () {
          const suiteManifest = require("../../shex-cli/test/suiteManifest.js");
          if (process.env.TEST_original_manifest === undefined)
            expect(Path.basename(suiteManifest.manifestFile(dir))).to.equal("manifest-ld.jsonld");
          expect(suiteManifest(dir)).to.deep.equal(JSON.parse(read("manifest.jsonld"))["@graph"][0].entries);
        });
      });

      describe("is the examples manifest format", function () {
        // negativeStructure carries seven mf:comment arcs across as they
        // were, as compact IRIs: JSON-LD, but not the frame
        const framed = suite !== "negativeStructure";

        it("is, as JSON-LD, a graph that drops nothing it says", async function () {
          // safe mode refuses a key or a value that would not reach the graph
          const quads = await jsonld.toRDF(doc, {base, documentLoader: Manifest.documentLoader(), safe: true});
          const store = new Manifest.QuadList(quads);
          const SHEXMAN = "http://www.w3.org/ns/shex-manifest#";
          expect(store.getQuads(null, SHEXMAN + "entries", null).length, "one manifest").to.equal(1);
          expect(store.getQuads(null, SHEXMAN + "name", null).length, "every entry").to.equal(doc.entries.length);
          expect(Manifest.frameCheck(doc, {base}).unknown, "no key without a term").to.deep.equal([]);
        });

        it(framed ? "passes the frame check: its plain reading is its JSON-LD reading"
           : "fails the frame check only for its mf:comment keys", function () {
          const check = Manifest.frameCheck(doc, {base});
          if (framed)
            expect(check).to.deep.equal({faithful: true, reasons: [], unknown: []});
          else
            expect(check.reasons.filter(r => !/^an IRI-shaped key in entry \d+: "mf:comment"$/.test(r))).to.deep.equal([]);
        });

        it("reads through @shexjs/manifest into the same entries either way", async function () {
          let check;
          const entries = await Manifest.readManifest(yamlText, {base, jsonld, onCheck: c => { check = c; }});
          expect(check.faithful, "read plainly").to.equal(framed);
          const plain = Manifest.entriesFromJson(doc);
          const viaJsonLd = await Manifest.entriesViaJsonLd(doc, {jsonld, base});
          expect(entries.length).to.equal(doc.entries.length);
          const prefixes = Manifest.prefixesOf(doc["@context"]);
          const same = e => comparable(e, null, base, prefixes);
          expect(viaJsonLd.map(same)).to.deep.equal(plain.map(same));
          // ...and what was read is what was written, the Test scope's prints
          // flattened beside the core attributes as the reader flattens them
          expect((framed ? entries : plain).map(same)).to.deep.equal(doc.entries.map(e => same(flattened(e, prefixes))));
        });

        if (VALIDATION.includes(suite))
          it("runs as examples do: tools/manifest-runner.js gets the status each entry states, and the Test extension prints what it says", async function () {
            const {validateEntry} = require("../../../tools/manifest-runner");
            const entries = await Manifest.readManifest(yamlText, {base, jsonld});
            const beyond = {};
            const surprises = [];
            let ran = 0;
            for (const entry of entries) {
              const needs = beyondExamples(entry);
              if (needs !== null) {
                beyond[needs] = (beyond[needs] || 0) + 1;
                continue;
              }
              // an example says which nodes and shapes in a query map; a test with one of each names them
              const example = "queryMap" in entry ? entry
                    : Object.assign({}, entry, {queryMap: `<${entry.node}>@` + ("shape" in entry ? `<${entry.shape}>` : "START")});
              const schemaURL = Url.pathToFileURL(Path.join(dir, entry.schemaURL)).href;
              // a semantic-action test has the Test extension, the suite's
              // probe, registered, as an example has the plugin it names;
              // what it printed is checked against the scope's prints
              let printed = null;
              const prepare = traitsOf(entry).includes("SemanticAction")
                    ? (validator) => { printed = TestExtension.register(validator, {ShExTerm}); }
                    : undefined;
              let verdict;
              try {
                verdict = validateEntry(example, dir, {base: schemaURL, prepare}).verdict;
              } catch (e) {
                verdict = "error: " + String(e.message).split("\n")[0];
              }
              ++ran;
              if (verdict !== entry.status)
                surprises.push(`${entry.name}: ${verdict}, not ${entry.status}`);
              if ("prints" in entry && JSON.stringify(printed) !== JSON.stringify(entry.prints))
                surprises.push(`${entry.name}: printed ${JSON.stringify(printed)}, not ${JSON.stringify(entry.prints)}`);
            }
            expect(surprises).to.deep.equal([]);
            const skipped = Object.values(beyond).reduce((sum, n) => sum + n, 0);
            expect(ran + skipped).to.equal(entries.length);
            expect(ran, `all but the ${skipped} that need what no example does: ${JSON.stringify(beyond)}`)
              .to.be.above(entries.length * 0.9);
          });
      });
    });
  });
});
