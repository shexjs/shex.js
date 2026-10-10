#!/usr/bin/env node
/**
 * Refresh packages/shex-manifest/known-contexts.json: the static roll-up of
 * every JSON-LD context a manifest is known to stack, with what the reader
 * needs to know about each.  @shexjs/manifest's documentLoader, frame check
 * and graph reader consult it before the network, so reading a manifest
 * needs no fetch for any known vocabulary -- offline, in a test, in the
 * browser -- and its canonical-form writer knows which scope a flat
 * attribute belongs in.
 *
 * {
 *   core:         the contexts a manifest with no @context is read with,
 *                 and a generated manifest stacks: the shared ShEx manifest
 *                 vocabulary, then shex.js's own terms,
 *   tops:         every context that is stacked at a manifest's top level:
 *                 the core, and the ShEx test vocabulary, which the
 *                 conformance suite's manifests stack on the shared one,
 *   contexts:     {url: {"@context": ...}}, each document's @context and
 *                 nothing else of it,
 *   paths:        {path suffix: url}, for contexts a checkout or a mirror
 *                 serves at some other origin: a URL ending in the path is
 *                 the same context,
 *   vocabularies: [{prefix, namespace, context, plugin?}], one per scope:
 *                 the conventional prefix, the namespace its parms arc and
 *                 attributes live under, its scope context's URL, and the
 *                 file name of the web-app plugin that implements it
 * }
 *
 * Sources, each fetched from where it is published unless an option names a
 * checkout to read it from instead (offline, or ahead of a publish):
 * - https://www.w3.org/ns/shex-manifest.jsonld, the shared vocabulary, and
 *   https://www.w3.org/ns/shex-test.jsonld, the test vocabulary (--ns
 *   <dir>: a w3c/ns checkout; both are generated there from shexSpec/
 *   shexTest's vocab/*.csv);
 * - this repository's own contexts (shex.js's terms, the neighborhoods'
 *   scopes), always read from the working tree and keyed by where the site
 *   publishes them;
 * - the extensions' scopes, published beside their specs at
 *   https://shexspec.github.io/extensions/<X>/manifest-context.jsonld
 *   (--extensions <dir>, or --from <dir>: a shexSpec/extensions checkout).
 *
 * Run it after editing any of them, or adding an extension's or a
 * neighborhood's (a row in the tables below);
 * packages/shex-manifest/test/Manifest-test.js fails until the roll-up
 * agrees with the repository's files.
 *
 *   node tools/rollup-manifest-contexts.js
 *   node tools/rollup-manifest-contexts.js --ns ../../w3c/ns --extensions ../../shexSpec/extensions
 */
"use strict";

const Fs = require("fs");
const Path = require("path");

const ROOT = Path.join(__dirname, "..");
const OUT = Path.join(ROOT, "packages", "shex-manifest", "known-contexts.json");
const SITE = "https://shex.js.org/";

/** the contexts stacked at a manifest's top level, in stacking order */
const TOPS = [
  {url: "https://www.w3.org/ns/shex-manifest.jsonld", option: "--ns", file: "shex-manifest.jsonld", core: true},
  {url: SITE + "doc/manifest-context.jsonld", local: "doc/manifest-context.jsonld", core: true},
  {url: "https://www.w3.org/ns/shex-test.jsonld", option: "--ns", file: "shex-test.jsonld"},
];

/** the scopes: this repository's neighborhoods, then the extensions */
const SCOPES = [
  {url: SITE + "packages/neighborhood-sparql/manifest-context.jsonld", local: "packages/neighborhood-sparql/manifest-context.jsonld",
   prefix: "nsp", namespace: "http://shex.js.org/neighborhoods/Sparql/#"},
  {url: SITE + "packages/neighborhood-wikibase/manifest-context.jsonld", local: "packages/neighborhood-wikibase/manifest-context.jsonld",
   prefix: "nwb", namespace: "http://shex.js.org/neighborhoods/Wikibase/#"},
].concat([
  {name: "Map", prefix: "map", namespace: "http://shex.io/extensions/Map/#", plugin: "ShExMapPlugin.js"},
  // a hash namespace; the extension's semantic actions are dispatched on http://shex.io/extensions/Reduce/
  {name: "Reduce", prefix: "rdc", namespace: "http://shex.io/extensions/Reduce/#", plugin: "ShExReducePlugin.js"},
  {name: "SHACL-SPARQL", prefix: "ssp", namespace: "http://shex.io/extensions/SHACL-SPARQL/", plugin: "ShExShaclSparqlPlugin.js"},
  // the suite's probe: what its print(...) actions must emit, in the scope's prints
  {name: "Test", prefix: "tst", namespace: "http://shex.io/extensions/Test/#", plugin: "ShExTestPlugin.js"},
].map(ext => Object.assign(ext, {
  url: `https://shexspec.github.io/extensions/${ext.name}/manifest-context.jsonld`,
  option: "--extensions", file: `${ext.name}/manifest-context.jsonld`,
})));

async function main () {
  const args = process.argv.slice(2);
  const dirs = {};
  for (let i = 0; i < args.length; i += 2) {
    const option = args[i] === "--from" ? "--extensions" : args[i];
    if (!["--ns", "--extensions"].includes(option) || args[i + 1] === undefined) {
      console.error("usage: rollup-manifest-contexts.js [--ns <w3c/ns checkout>] [--extensions <shexSpec/extensions checkout>]");
      process.exit(1);
    }
    dirs[option] = args[i + 1];
  }
  const load = async (source) => {
    if (source.local)
      return Fs.readFileSync(Path.join(ROOT, source.local), "utf8");
    if (dirs[source.option])
      return Fs.readFileSync(Path.join(dirs[source.option], source.file), "utf8");
    const resp = await fetch(source.url);
    if (!resp.ok)
      throw new Error(`${source.url}: ${resp.status} ${resp.statusText} (not published yet? give ${source.option} <checkout>)`);
    return resp.text();
  };

  const rollup = {core: [], tops: [], contexts: {}, paths: {}, vocabularies: []};
  const definedBy = {};                     // term -> the top-level context that defined it
  for (const top of TOPS) {
    // a context is what the document's @context says: the W3C file also
    // carries the vocabulary's definition, the others a comment, and no
    // reader needs either
    const context = JSON.parse(await load(top))["@context"];
    // stacked contexts may repeat a definition (a prefix they both use) but
    // not change one: a bare name must mean one thing wherever it is read
    for (const [term, def] of Object.entries(context)) {
      if (term in definedBy && JSON.stringify(rollup.contexts[definedBy[term]]["@context"][term]) !== JSON.stringify(def))
        throw new Error(`${top.url} redefines "${term}", which ${definedBy[term]} defines differently`);
      if (!(term in definedBy))
        definedBy[term] = top.url;
    }
    rollup.contexts[top.url] = {"@context": context};
    rollup.tops.push(top.url);
    if (top.core)
      rollup.core.push(top.url);
    for (const path of (top.local ? [top.local] : []).concat(top.paths || []))
      rollup.paths[path] = top.url;
  }
  for (const scope of SCOPES) {
    rollup.contexts[scope.url] = {"@context": JSON.parse(await load(scope))["@context"]};
    if (scope.local)
      rollup.paths[scope.local] = scope.url;
    rollup.vocabularies.push(Object.assign({prefix: scope.prefix, namespace: scope.namespace, context: scope.url},
                                           scope.plugin ? {plugin: scope.plugin} : {}));
  }
  const text = JSON.stringify(rollup, null, 2) + "\n";
  const changed = !Fs.existsSync(OUT) || Fs.readFileSync(OUT, "utf8") !== text;
  Fs.writeFileSync(OUT, text);
  console.log(`${Path.relative(process.cwd(), OUT)}: ${rollup.tops.length} top-level contexts, ${rollup.vocabularies.length} scopes${changed ? " (updated)" : " (unchanged)"}`);
}

main().catch(e => {
  console.error(e.message || e);
  process.exit(1);
});
