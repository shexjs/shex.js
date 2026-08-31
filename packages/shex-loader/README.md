# @shexjs/loader

[![npm version](https://img.shields.io/npm/v/@shexjs/loader)](https://www.npmjs.com/package/@shexjs/loader)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

Load ShEx schemas (ShExC, ShExJ) and RDF data (Turtle, JSON-LD) from any mix of URLs, in-memory text and parsed objects into one schema and one graph, remembering where everything came from. HTTP-only: for `file:` access or dynamic loading of ShEx extensions, use [`@shexjs/node`](../shex-node#readme).

## Install

``` shell
npm install @shexjs/loader
```

## Methods

### load(schema, data, schemaOptions = {}, dataOptions = {})

Load ShExC and ShExJ sources into a single ShEx schema, and Turtle/JSON-LD sources into one RDF graph.

SOURCE may be
* URL - where to load item.
* object: {text: string, url: string} - text and URL of already-loaded resource.
* (schema) ShExJ object
* (data) RdfJs data store

parameters:
* schema - { shexc: [ShExC SOURCE], json: [JSON SOURCE] }
* data - { turtle: [Turtle SOURCE], jsonld: [JSON-LD SOURCE] }
* schemaOptions
* dataOptions

returns: {Promise<{schema: any, dataMeta: *[], data: (*|null), schemaMeta: *[]}>}

example:
``` js
const N3 = require('n3'); // used for graph API example

// Initialize @shexjs/loader with implementations of APIs.
const ShExLoader = require("@shexjs/loader")({
  rdfjs: N3,                    // use N3 as an RdfJs implementation
  fetch: require('node-fetch'), // fetch implementation
  jsonld: require('jsonld')     // JSON-LD (if you need it)
});

// Schemas from URL, text and ShExJ:
const schemaFromUrl =
      "https://shex.io/webapps/packages/shex-cli/test/cli/1dotOr2dot.shex";

const schemaAsText = {          // ShExC schema and its location
  url: "http://a.example/schemaAsText",
  text: `
<#ShapeFromText> {
  <#p1> @<S1> # reference to Shape loaded from URL
}`
};

const schemaAsShExJ = {
  url: "http://a.example/ShExJ",
  schema: {
    type: "Schema",             // simple schema with single NodeConstraint
    shapes: [
      { "type": "ShapeDecl",
        "id": "http://a.example/S1", // same label as the schema from URL
        "shapeExpr": {
          "type": "NodeConstraint",
          "nodeKind": "iri",
          "pattern": "^https?:" } }
    ] }
};

// Data graphs from URL, text and graph API:
const graphFromUrl =
      "https://shex.io/webapps/packages/shex-cli/test/cli/p1.ttl";

const graphAsText = {          // RDF graph and its location
  url: "http://a.example/graphAsText",
  text: `
<#N2> <#p2> "o2" . # reference to Shape loaded from URL`
};

const { namedNode, literal, defaultGraph, quad } = N3.DataFactory;
const graphFromApi = {
  url: "http://a.example/graphFromApi",
  graph: new N3.Store()
}
graphFromApi.graph.add(quad(
  namedNode('http://a.example/graphFromApi#N3'),
  namedNode('http://a.example/p3'),
  literal('o3'),
  defaultGraph(),
));

// ShExLoader.load returns a promise to load and merge schema and data.
function collisionPolicy (type, left, right) {
  console.log(type, 'collision between', left, right);
  return false; // keep left assignment (i.e. no reassignment)
}

const schemaAndDataP = ShExLoader.load(
  { shexc: [ schemaFromUrl, schemaAsText, schemaAsShExJ ] },
  { turtle: [ graphFromUrl, graphAsText, graphFromApi ] },
  { // schemaOptions
    collisionPolicy // print collisions and keep earlier assignment
    // instead of a function, could be string: 'left', 'right' or 'throw'
  }
);

// Print out results to show off returned structure.
schemaAndDataP.then(({schema, schemaMeta, data, dataMeta}) => {
  console.log('schemaMeta:\n' + JSON.stringify(schemaMeta, null, 2));
  console.log('shapes:\n' + schema.shapes.map(s => '  ' + s.id + ' is a ' + s.shapeExpr.type).join('\n'));
  console.log('dataMeta:\n' + JSON.stringify(dataMeta, null, 2));
  console.log('triples:\n' + data.getQuads().map(
    q => '  ' +
      (['subject', 'predicate', 'object'])
      .map(t => q[t].value).join(' ')).join('\n'));
});
```
output:
```
shapeDecl collision between {
  id: 'http://a.example/S1',
  type: 'ShapeDecl',
  shapeExpr: {
    type: 'Shape',
    expression: { type: 'OneOf', expressions: [Array] }
  }
} {
  type: 'ShapeDecl',
  id: 'http://a.example/S1',
  shapeExpr: { type: 'NodeConstraint', nodeKind: 'iri', pattern: '^https?:' }
}
schemaMeta:
[ { "mediaType": "text/shex", "url": "https:…cli/1dotOr2dot.shex",
    "base": "https:…cli/1dotOr2dot.shex",
    "prefixes": { "": "http://a.example/" }, "importers": [] },
  { "mediaType": "text/shex", "url": "http://a.example/schemaAsText", … },
  { "mediaType": "text/shex", "url": "http://a.example/ShExJ", … }
]
shapes:
  http://a.example/S1 is a Shape
  http://a.example/schemaAsText#ShapeFromText is a Shape
dataMeta:
[ { "mediaType": "text/turtle", "url": "https:…cli/p1.ttl",
    "base": "https:…cli/p1.ttl",
    "prefixes": { "": "http://a.example/" }, "importers": [] },
  { "mediaType": "text/turtle", "url": "http://a.example/graphAsText", … },
  { "mediaType": "text/turtle", "url": "http://a.example/graphFromApi", … }
]
triples:
  https:…cli/x http://a.example/p1 p1-0
  http://a.example/graphAsText#N2 http://a.example/graphAsText#p2 o2
  http://a.example/graphFromApi#N3 http://a.example/p3 o3
```

### loadExtensions function(globs[])

A no-op here; [`@shexjs/node`](../shex-node#readme) overrides it to load [semantic-action extensions](http://shex.io/extensions/) dynamically, which is what [`@shexjs/cli`](../shex-cli#readme)'s `--extension` uses.

### GET function(url, mediaType)

return promise of {contents, url}

Examples
--------

Use `@shexjs/loader` directly:
```js
const ShExIo = require("@shexjs/loader")({
  rdfjs: N3,
  fetch: require('node-fetch')
});
```

Extend `@shexjs/loader` with jsonld and a non-standard jsonld document loader:
```js
const ShExIo = require("@shexjs/loader")({
  rdfjs: N3,
  fetch: require('node-fetch'),
  jsonld: require('jsonld'),
  jsonLdOptions: { documentLoader }
});

async function documentLoader (url, options) {
  // see https://github.com/digitalbazaar/jsonld.js#custom-document-loader
}
```

---

`@shexjs/loader` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
