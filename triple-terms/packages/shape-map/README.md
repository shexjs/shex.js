# shape-map

[![npm version](https://img.shields.io/npm/v/shape-map)](https://www.npmjs.com/package/shape-map)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

Parse [ShapeMap](https://shexspec.github.io/shape-map/)s — the language that says which nodes to validate against which shapes, e.g. `<#n>@<#S1>`.

## Install

``` shell
npm install shape-map
```

## Quick start

``` js
const ShapeMap = require("shape-map");
const shapeMapParser = ShapeMap.Parser.construct(
  "http://base.example/fallback/",
  { base: "http://my.example/url/", prefixes: {} },  // resolves shapes
  { base: "http://my.example/url/", prefixes: {} }   // resolves nodes
);
const smap = shapeMapParser.parse("<#n>@<#S1>");
console.log(smap);
```
```
[
  {
    node: 'http://my.example/url/#n',
    shape: 'http://my.example/url/#S1',
    status: 'conformant'
  }
]
```

The result is an array of node/shape associations, ready to hand to [`@shexjs/validator`](../shex-validator#readme)'s `validateShapeMap`. (`status` is the association's *asserted* status — `conformant` unless written with `!` for nonconformant or `?` for unknown.)

### Parser.construct(fallbackBase, schemaMeta, dataMeta)

Construct a ShapeMap parser with appropriate bases and prefixes for resolving shapes and nodes:

* **fallbackBase** — a URL string to use as a base if `schemaMeta`/`dataMeta` don't supply one
* **schemaMeta** — `{base, prefixes}` used to resolve the shape side (right of `@`)
* **dataMeta** — `{base, prefixes}` used to resolve the node side (left of `@`)

### Base URLs for schema and data

URLs in the node specifier (left of the `@` sign) are resolved against the dataMeta base and prefixes; the shape specifier uses the schemaMeta. Here the schema and data have different base URLs:

``` js
const shapeMapParser = ShapeMap.Parser.construct(
  "http://base.example/fallback/",
  { base: "http://my.example/schema/", prefixes: {} },
  { base: "http://my.example/data/", prefixes: {} }
);
const smap = shapeMapParser.parse("<#n>@<#S1>");
```
```
[
  {
    node: 'http://my.example/data/#n',
    shape: 'http://my.example/schema/#S1',
    status: 'conformant'
  }
]
```

### Prefixes for schema and data

Prefixes declared in the metas let the two sides of the map use each document's own names:

``` js
const shapeMapParser = ShapeMap.Parser.construct(
  "http://base.example/fallback/",
  { base: "http://my.example/schema/", prefixes: {shape: "http://my.example/shapes#"} },
  { base: "http://my.example/data/", prefixes: {"": "http://my.example/data#"} }
);
const smap = shapeMapParser.parse(":n@shape:S1");
```
```
[
  {
    node: 'http://my.example/data#n',
    shape: 'http://my.example/shapes#S1',
    status: 'conformant'
  }
]
```

### Use with the @shexjs loader and validator

The ShapeMap parser is typically used with [`@shexjs/loader`](../shex-loader#readme) (or [`@shexjs/node`](../shex-node#readme)), whose `load()` returns exactly the metadata `construct` wants. This example ShapeMap (`<#n>@s:S1`) uses the data's base URL and the schema's `s:` prefix:

``` js
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("@shexjs/validator");
const ShExLoader = require("@shexjs/loader")({
  rdfjs: require("n3"),  // no fetch needed with {url, text} arguments
});
const ShapeMap = require("shape-map");

main();
async function main () {
  const loaded = await ShExLoader.load(
    { shexc: [{url: "http://my.example/schema/", text: `PREFIX p: <http://my.example/ns#>
PREFIX s: <http://my.example/shapes#>
s:S1 { p:p1 [1 2]; p:p2 [3 4] }`}]},
    { turtle: [{url: "http://my.example/data", text: `PREFIX : <http://my.example/ns#>
<#n> :p1 1 ; :p2 3 .`}] }
  );
  const {schema, schemaMeta, data, dataMeta} = loaded;
  const shapeMapParser = ShapeMap.Parser.construct(
    "http://base.example/fallback/",
    schemaMeta[0],
    dataMeta[0]
  );
  const smap = shapeMapParser.parse("<#n>@s:S1");
  const validator = new ShExValidator(schema, RdfJsDb(data));
  const results = validator.validateShapeMap(smap);
  results.forEach(r => console.log(r.node, r.status));
}
```
```
http://my.example/data#n conformant
```

`validateShapeMap` returns the same associations with `status` set to what validation found and an `appinfo` saying why — see [`@shexjs/validator`](../shex-validator#readme).

---

`shape-map` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
