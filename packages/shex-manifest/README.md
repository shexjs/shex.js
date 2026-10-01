# @shexjs/manifest

[![npm version](https://img.shields.io/npm/v/@shexjs/manifest)](https://www.npmjs.com/package/@shexjs/manifest)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

Read a shex.js **examples manifest** -- the format behind the web app's example picker, `validate --yaml-manifest` and the repository's `doc/tests-manifest.yaml` -- from YAML, JSON or an RDF graph into one list of entries. Every consumer gets the same shape whichever way the manifest was written, and however its vocabulary was scoped.

## Install

``` shell
npm install @shexjs/manifest
```

## The format

A manifest is a list of entries, or a mapping with an `@context` and an `entries` list (YAML-LD: a YAML text whose parse is JSON-LD). An entry's core attributes are bare -- `schema`/`schemaURL`, `data`/`dataURL`, `queryMap`/`queryMapURL`, `node`, `shape`, `status`, `schemaLabel`, `dataLabel`, `comment`, `neighborhood`, `dataBase`, `slurp`, `overlayURL`, `pluginURL` -- and an extension's or neighborhood's own attributes are lexically scoped under one `<prefix>:parms` mapping, bare inside it, with `pluginURL` naming the module that implements that vocabulary. The prefix is the manifest's own choice, bound in its `@context` beside the term whose scoped context is the vocabulary's file:

``` yaml
"@context":
  - https://shex.js.org/doc/webapp-manifest-context.jsonld
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

`x` holds a document's text, `xURL` says where to fetch it. An older manifest that wrote a URL under `x` is settled by a `probe`: a value that resolves (against the manifest's `base`) to a resource is renamed `xURL`, one that does not is the text.

## Methods

### readManifest(text, options)

The manifest's text -- YAML, JSON or Turtle, sniffed from the text and the base URL's extension unless `options.format` says -- as its entries. Turtle needs `options.parseTurtle(text, base)`, a function returning a store (this package carries no RDF parser).

``` js
const Manifest = require("@shexjs/manifest");
const Fs = require("fs");

const entries = await Manifest.readManifest(Fs.readFileSync("manifest.yaml", "utf8"), {
  base: "https://shex.js.org/doc/tests-manifest-ld.yaml",            // what references resolve against
  probe: async url => (await fetch(url, {method: "HEAD"})).ok,       // is this a resource? (x -> xURL)
});
console.log(entries[0].plugins);         // [ 'ShExMapPlugin.js' ]      -- collected from every scope's pluginURL
console.log(entries[0].outputSchemaURL); // 'BPdam-schema.shex'         -- the scope's attributes, flattened
console.log(Object.keys(entries[0].parms)); // [ 'http://shex.io/extensions/Map/#' ] -- and as written, by namespace
```

What comes back is the classic flat entry every consumer already reads -- the scoped attributes beside the core ones, the plugins under `plugins` -- plus `parms`, the scopes as written, keyed by namespace. A name written in two scopes of one entry is an error, as is a prefix the manifest's `@context` never declared.

### entriesFromJson(doc, options)

The parsed YAML or JSON (a list, a `{"@context", entries}` mapping, or one entry) as entries. `options.base` and `options.probe` as above.

### entriesFromGraph(store, options)

The entries an RDF graph of the manifest holds -- the members of its `mf:entries` list, each read back by predicate IRI through the core vocabulary. A vocabulary's parms arc is its namespace IRI plus `parms`; how the attributes inside are spelled (`outputSchemaURL` for an IRI object, `endpoint` for an IRI that is a value) is that vocabulary's context's to say, so the graph names each vocabulary's context (`<namespace> shexjs:manifestContext <url>`) and `options.loadContext(url)` fetches it, or `options.scopes[namespace]` supplies it. Failing both, an IRI object is spelled `<local>URL` and a literal `<local>`.

``` js
const N3 = require("n3");
const store = new N3.Store();
store.addQuads(new N3.Parser({baseIRI: base}).parse(turtle));
const entries = await Manifest.entriesFromGraph(store, {
  loadContext: async url => (await fetch(url)).json(),
});
```

### KnownContexts / documentLoader(fallback) / loadContext(url, fetchText)

`KnownContexts` is a static roll-up of every context a manifest is known to stack -- the core, the neighborhoods', the extensions' published beside their specs -- keyed by the URL a manifest names it by, so no reader needs the network for a known vocabulary. `documentLoader(fallback)` is a JSON-LD processor's document loader over it, handing unknown URLs to `fallback` (jsonld.js's own loader, a fetch); `loadContext(url, fetchText)` is the same for anyone who just wants the document. The graph reader consults the roll-up itself. shex.js refreshes the roll-up with `node tools/rollup-manifest-contexts.js` after a context changes or a vocabulary is added.

``` js
const jsonld = require("jsonld");
const quads = await jsonld.toRDF(doc, {base, documentLoader: Manifest.documentLoader(jsonld.documentLoaders.node())});
```

### detectFormat(text, url) / prefixesOf(context) / vocabularyOf(context)

The sniffer; the prefixes a context declares inline (JSON-LD's rule: a term whose IRI ends in a gen-delim, or marked `@prefix`); a context's terms as a map from predicate IRI to its text and URL spellings. `CoreContext` is the core vocabulary, the roll-up's copy of shex.js's `doc/webapp-manifest-context.jsonld`.

---

`@shexjs/manifest` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
