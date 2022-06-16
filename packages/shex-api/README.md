@shexjs/api
===========

Introduction
------------
This module provides HTTP access functions for @shexjs library. For `file:` access or dynamic loading of ShEx extensions, use `@shexjs/node`.

Installation
------------

### Node.js + npm

```
npm install @shexjs/api
```

```js
const ShExIo = require('@shexjs/api');
```

### Used with @shexjs suite:

#### core functions
* [@shexjs/api](../api) - HTTP access functions for @shexjs library
* [@shexjs/node](../node) - extend @shexjs/api with file: access
* [@shexjs/term](../term) - RDF terms, relative URL resolution, JSON-LD terms
* [@shexjs/visitor](../visitor) - Walk a ShExJ object

#### parse and write ShExC
* [@shexjs/parser](../parser) - parse ShExC into (indexed) ShExJ
* [@shexjs/writer](../writer) - convert ShExJ as ShExC

* [@shexjs/util](../util) - misc utility functions

#### exectuables

* [@shexjs/cli](../cli) - command line interface for validation and format conversion
* [@shexjs/webapp](../webapp) - webpacks and the shex-simple interface

#### validation

* [shape-map](../map) - pairs of node/shape implementing ShapeMap

* [@shexjs/validator](../validator) - validate a fixed ShapeMap
* [@shexjs/eval-simple-1err](../eval-simple-1err) - fast regular expression engine stops on first error
* [@shexjs/eval-threaded-nerr](../eval-threaded-nerr) - thorough regular expression engine accumulates all errors

#### validation

* [extension-test](../extension-test) - eval test suite extensions ([spec](http://shex.io/extensions/Test/))
* [extension-eval](../extension-eval) - eval javascript extensions ([spec](http://shex.io/extensions/Eval/))
* [extension-map](../extension-map) - implement [ShapeMap](http://shex.io/extensions/Map/)

#### ShapePath
* [@shexjs/shape-path-query](../shape-path-query) - ShapePath query interface for ShEx.js


### Methods

#### load(shExC, shExJ, turtle, jsonld, schemaOptions = {}, dataOptions = {})

return promise of loaded schema URLs (ShExC and ShExJ), data files (turle, and jsonld)

#### loadExtensions function(globs[])

prototype of loadExtensions. does nothing

#### GET function(url, mediaType)

return promise of {contents, url}

Examples
--------

Use `@shexjs/api` directly:
```js
const ShExIo = require("@shexjs/api")({
  rdfjs: N3,
  fetch: require('node-fetch')
});
```

Extend `@shexjs/api` with jsonld and a non-standard jsonld document loader:
```js
const ShExIo = require("@shexjs/api")({
  rdfjs: N3,
  fetch: require('node-fetch'),
  jsonld: require('jsonld'),
  jsonLdOptions: { documentLoader }
});

async function documentLoader (url, options) {
  # see https://github.com/digitalbazaar/jsonld.js#custom-document-loader
}
```
