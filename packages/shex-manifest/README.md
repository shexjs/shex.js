# @shexjs/manifest

[![npm version](https://img.shields.io/npm/v/@shexjs/manifest)](https://www.npmjs.com/package/@shexjs/manifest)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

Read a **ShEx manifest** -- the format behind the shex.js web app's example picker, `validate --yaml-manifest`, the repository's `doc/tests-manifest.yaml` and (on its `manifest-refactor` branch) the [shexTest](https://github.com/shexSpec/shexTest) conformance suite's manifests -- from YAML, JSON or an RDF graph into one list of entries. Every consumer gets the same shape whichever way the manifest was written, and however its vocabulary was scoped.

## Install

``` shell
npm install @shexjs/manifest
```

## The format

A manifest is a list of entries, or a mapping with an `@context` and an `entries` list (YAML-LD: a YAML text whose parse is JSON-LD). Its `@context` stacks contexts:

* the **ShEx manifest vocabulary**'s, `https://www.w3.org/ns/shex-manifest.jsonld` -- what manifests of ShEx validations have in common, whoever writes them: `entries`, `name`, `schema`/`schemaURL`, `data`/`dataURL`, `queryMap`/`queryMapURL`, `schemaLabel`, `dataLabel`, `queryMapLabel`, `comment`, and `node`, `shape` and `status` from the ShEx vocabulary;
* on it, the author's own terms: shex.js's (`https://shex.js.org/doc/manifest-context.jsonld`: `pluginURL`, `neighborhood`, `dataBase`, `slurp`, ...) for its examples; the ShEx test vocabulary's (`https://www.w3.org/ns/shex-test.jsonld`: `trait`, `approval`, `resultURL`, ...) for the conformance suite's tests. The shared vocabulary and shex.js's terms are the *core*: what a manifest with no `@context` is read with, and what a generated one stacks.

An entry writes those attributes bare. An extension's or neighborhood's own attributes are lexically scoped under one `<prefix>:parms` mapping, bare inside it, with `pluginURL` naming the module that implements that vocabulary. The prefix is the manifest's own choice, bound in its `@context` beside the term whose scoped context is the vocabulary's file:

``` yaml
"@context":
  - https://www.w3.org/ns/shex-manifest.jsonld
  - https://shex.js.org/doc/manifest-context.jsonld
  - map: http://shex.io/extensions/Map/#
    map:parms: {"@context": https://shexspec.github.io/extensions/Map/manifest-context.jsonld}
entries:
- schemaLabel: BP
  schemaURL: BPfhir-schema.shex
  dataLabel: simple
  dataURL: BPfhir-instance.ttl
  queryMap: "<tag:BPfhir123>@START"
  map:parms:
    pluginURL: ShExMapPlugin.js
    outputSchemaURL: BPdam-schema.shex
    outputShapeMap: "<tag:b0>@<BPunitsDAM>"
  status: conformant
```

`x` holds a document's text, `xURL` says where to fetch it. A manifest with no `@context` is a classic one -- a bare list, its extensions' attributes flat, its plugins in a `plugins` list -- and is read as the canonical form it upgrades to.

A conformance test is the same kind of entry. Nothing types it: a validation test is an entry with a `status`.

``` yaml
"@context":
  - https://www.w3.org/ns/shex-manifest.jsonld
  - https://www.w3.org/ns/shex-test.jsonld
entries:
  - name: 1dot_fail-empty
    status: nonconformant
    trait: [TriplePattern]
    comment: "<S1> { <p1> . } on {  }"
    approval: Approved
    schemaURL: ../schemas/1dot.shex
    shape: http://a.example/S1
    dataURL: empty.ttl
    node: http://a.example/s1
```

## Methods

### readManifest(text, options)

The manifest's text -- YAML, JSON or Turtle, sniffed from the text and the base URL's extension unless `options.format` says -- as its entries. Turtle needs `options.parseTurtle(text, base)`, a function returning a store (this package carries no RDF parser).

``` js
const Manifest = require("@shexjs/manifest");
const Fs = require("fs");

const entries = await Manifest.readManifest(Fs.readFileSync("manifest.yaml", "utf8"), {
  base: "https://shex.js.org/doc/tests-manifest-ld.yaml",            // what references resolve against
  probe: async url => (await fetch(url, {method: "HEAD"})).ok,       // is this a resource? (x -> xURL)
  jsonld: async () => require("jsonld"),                             // only called for JSON-LD that is not framed
});
console.log(entries[0].plugins);         // [ 'ShExMapPlugin.js' ]      -- collected from every scope's pluginURL
console.log(entries[0].outputSchemaURL); // 'BPdam-schema.shex'         -- the scope's attributes, flattened
console.log(Object.keys(entries[0].parms)); // [ 'http://shex.io/extensions/Map/#' ] -- and as written, by namespace
```

What comes back is the classic flat entry every consumer already reads -- the scoped attributes beside the core ones, the plugins under `plugins` -- plus `parms`, the scopes as written, keyed by namespace.

### readJson(doc, options)

The parsed YAML or JSON as its entries, in three steps:

1. **`upgrade(doc, options)`**, the JSON step: whatever was deployed becomes the canonical form. `canonicalize(doc)` wraps a bare list (or one entry) in `entries`, which the shared vocabulary makes an ordered list. A document with no `@context` is a classic manifest and is brought up to date: the core contexts by default; each flat attribute a known vocabulary defines (ShExMap's `outputSchemaURL`, a neighborhood's `endpoint`) moved into that vocabulary's `<prefix>:parms`, the binding added to the `@context`; each of its `plugins` moved, as `pluginURL`, into the scope it implements; a test manifest's `shex` renamed `schema`. A document that has an `@context` is taken as it says. Then x/xURL is settled: with `options.probe`, an entry's `schema`, `data` or `queryMap`, or a document pair a known scope defines inside that scope (`documentPairs(context)`: ShExReduce's `overlay`, ShExMap's `outputSchema`, ...), whose value resolves against `options.base` to a resource is renamed `...URL`; without one, the whitespace-or-bracket heuristic, for schema and data only. A reference without an extension is asked for in each of its representations: `representations(ref)` lists them -- as written, for a server that negotiates, then `.shex`, `.json`, `.ttl` -- and `resolveRepresentation(ref, probe, base)` finds the first that is there. The conformance suite's validation tests name their schemas that way (`../schemas/1dot`); `tools/manifest-runner.js`, `validate` and the web app read such a reference in the first representation found.
2. **`frameCheck(canonical, options)`** answers `{faithful, reasons, unknown}`: is this a document whose plain reading is guaranteed to be its JSON-LD reading? It is when its `@context` holds only known top-level contexts (which must define `entries`) and bindings of known scopes, and its entries use no JSON-LD keyword but a string `@id`, no IRI-shaped key but a bound `<prefix>:parms`, and no value object; a nested node may be written with known terms (the suite's `extensionResults`), and a name under an `@type: @vocab` term must be a plain name in that term's vocabulary. `unknown` lists the keys no stacked context defines: JSON-LD would drop them, the plain reading keeps them.
3. **`entriesFromJson(canonical)`**, the plain reading, when the check passes. Otherwise **`entriesViaJsonLd(canonical, options)`**: `options.jsonld` (jsonld.js, or a function promising it, called only now) expands the document to RDF, with the known contexts answered from the roll-up, and `entriesFromGraph` reads the entries back. That is what any JSON-LD document of a manifest means -- expanded, flattened, compacted with other names or other contexts.

The package's tests run both readings over every manifest in the shex.js repository, and over the conformance suite's five, and demand the same entries; they differ only where RDF does: a graph keeps no order among one property's values and no repeats (so `plugins` compares as a set), and has no nulls.

### entriesFromGraph(store, options)

The entries an RDF graph of the manifest holds -- the members of its `shexMan:entries` list, each read back by predicate IRI through the known top-level contexts (or `options.context`). A vocabulary's parms arc is its namespace IRI plus `parms`; how the attributes inside are spelled (`outputSchemaURL` for an IRI object, `endpoint` for an IRI that is a value) is that vocabulary's context's to say, so the reader looks it up: in `options.scopes[namespace]`, by the graph's own `<namespace> shexjs:manifestContext <url>` triple (from the roll-up, else `options.loadContext(url)`), or by namespace among the known vocabularies. Failing all three, an IRI object is spelled `<local>URL` and a literal `<local>`.

``` js
const N3 = require("n3");
const store = new N3.Store();
store.addQuads(new N3.Parser({baseIRI: base}).parse(turtle));
const entries = await Manifest.entriesFromGraph(store);
```

### The roll-up: KnownContexts, CoreContextURLs, TopContextURLs, KnownVocabularies, documentLoader(fallback), loadContext(url, fetchText), knownContextURL(ref, base), vocabularyOfTerm(key)

`KnownContexts` is a static roll-up of every context a manifest is known to stack -- the shared vocabulary's, shex.js's, the ShEx test vocabulary's, the neighborhoods', the extensions' published beside their specs -- keyed by the URL a manifest names it by, so no reader needs the network for a known vocabulary. `CoreContextURLs` names the core (the shared vocabulary's context, then shex.js's) and `TopContextURLs` every context stacked at a manifest's top level (the core and the ShEx test vocabulary's); `CoreContext` and `TopContext` are those stacked into one context, as `stackedContext(urls)` does for any of them. `KnownVocabularies` says, for each scope, its conventional prefix, its namespace, its context's URL and the file name of the plugin that implements it; `vocabularyOfTerm(key)` is how a writer of the canonical form knows which `<prefix>:parms` an attribute belongs in. `knownContextURL` recognizes a known context by its published URL or, for a file of the shex.js repository, by any URL ending in its repository path (a checkout, a mirror). `documentLoader(fallback)` is a JSON-LD processor's document loader over the roll-up, handing unknown URLs to `fallback`; `loadContext(url, fetchText)` is the same for anyone who just wants the document. shex.js refreshes the roll-up with `node tools/rollup-manifest-contexts.js` after a context changes or a vocabulary is added.

``` js
const jsonld = require("jsonld");
const quads = await jsonld.toRDF(doc, {base, documentLoader: Manifest.documentLoader(jsonld.documentLoaders.node())});
```

### detectFormat(text, url) / prefixesOf(context) / vocabularyOf(context)

The sniffer; the prefixes a context declares inline (JSON-LD's rule: a term whose IRI ends in a gen-delim, or marked `@prefix`); a context's terms as a map from predicate IRI to its text and URL spellings (and, for a term whose values are names, the vocabulary they are names in).

---

`@shexjs/manifest` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
