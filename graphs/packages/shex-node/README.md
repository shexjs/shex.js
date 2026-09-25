# @shexjs/node

[![npm version](https://img.shields.io/npm/v/@shexjs/node)](https://www.npmjs.com/package/@shexjs/node)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

[`@shexjs/loader`](../shex-loader#readme) for a node environment: the same `load()` API, extended with

* **file system access** — a source may be a plain file path or a `file:` URL;
* **stdin** — the source `-` reads standard input;
* **`loadExtensions(globsOrPackageNames)`** — dynamic loading of [semantic-action extensions](http://shex.io/extensions/), which is how [`@shexjs/cli`](../shex-cli#readme)'s `--extension` works.

It reaches for node's `fs`, so it's not for browsers — use [`@shexjs/loader`](../shex-loader#readme) there.

## Install

``` shell
npm install @shexjs/node
```

## load(schema, data, schemaOptions?, dataOptions?)

Load any mix of ShExC/ShExJ schema sources and Turtle/JSON-LD data sources into one schema and one graph, remembering where everything came from. A SOURCE may be:

* a file path or URL — where to load the item;
* `{text: string, url: string}` — an already-loaded resource;
* a ShExJ object (schema) or an RDF/JS store (data).

Given a local `1dotOr2dot.shex` (say `PREFIX : <http://a.example/> :S1 { :p1 . | :p2 .; :p3 . }`) and a local `p2p3.ttl` (`PREFIX : <http://a.example/> <x> :p2 "p2-0" ; :p3 "p3-0" .`):

``` js
const ShExLoader = require("@shexjs/node")({
  rdfjs: require("n3"),          // an RDF/JS implementation
  fetch: globalThis.fetch,  // for http(s): URLs
});

ShExLoader.load(
  { shexc: [ "./1dotOr2dot.shex" ] },  // a file path
  { turtle: [                          // graphs merge
    "https://shex.io/webapps/packages/shex-cli/test/cli/p1.ttl",
    "./p2p3.ttl",
  ] }
).then(({schema, schemaMeta, data, dataMeta}) => {
  console.log("shapes:  " + schema.shapes.map(s => s.id).join(" "));
  console.log("sources: " + dataMeta.map(m => m.url).join("\n         "));
  console.log("triples: " + data.getQuads().map(
    q => ["subject", "predicate", "object"].map(t => q[t].value).join(" "))
    .join("\n         "));
});
```
```
shapes:  http://a.example/S1
sources: https://shex.io/webapps/packages/shex-cli/test/cli/p1.ttl
         file:///…/p2p3.ttl
triples: https://shex.io/webapps/packages/shex-cli/test/cli/x http://a.example/p1 p1-0
         file:///…/x http://a.example/p2 p2-0
         file:///…/x http://a.example/p3 p3-0
```

Relative IRIs in each document resolve against that document's own location — which is the point of loading through this module rather than `Fs.readFile`: the `file:` and `https:` triples above landed in one graph with their provenance intact, and `schemaMeta`/`dataMeta` carry each source's `url`, `base` and `prefixes` (ready for [`shape-map`](../shape-map#readme)'s parser).

See [`@shexjs/loader`](../shex-loader#readme) for the returned structure, JSON-LD support (pass `jsonld: require("jsonld")`) and the other options; everything there works here.

---

`@shexjs/node` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
