[![NPM Version](https://badge.fury.io/js/@shexjs%2Feval-threaded-nerr.png)](https://npmjs.org/package/shex)
[![ShapeExpressions Gitter chat https://gitter.im/shapeExpressions/Lobby](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/shapeExpressions/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.1213693.svg)](https://doi.org/10.5281/zenodo.1213693)

# @shexjs/api

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

# Lerna Monorepo

This repo uses [lerna](https://github.com/lerna/lerna) to manage multiple NPM packages. These packages are located in `packages/*`:

- [`shape-map`](../shape-map#readme) -- a [ShapeMap](https://shexspec.github.io/shape-map/) parser
- [`@shexjs/parser`](../shex-parser#readme) -- parse ShExC into ShExJ
- [`@shexjs/writer`](../shex-writer#readme) -- serialize ShExK as ShExC
- [`@shexjs/term`](../shex-term#readme) -- RDF terms uses in ShEx
- [`@shexjs/util`](../shex-util#readme) -- some utilities for transforming schemas or validation output
- [`@shexjs/visitor`](../shex-visitor#readme) -- a [visitor](https://en.wikipedia.org/wiki/Visitor_pattern) for schemas
- [`@shexjs/validator`](../shex-validator#readme) -- validate nodes in an RDF graph against shapes in a schema
- [`@shexjs/eval-simple-1err`](../eval-simple-1err#readme) -- eval-simple-1err
- [`@shexjs/eval-threaded-nerr`](../eval-threaded-nerr#readme) -- eval-threaded-nerr
- [`@shexjs/api`](../shex-api#readme) -- an API for loading and using ShEx schemas
- [`@shexjs/node`](../shex-node#readme) -- additional API functionality for a node environment
- [`@shexjs/cli`](../shex-cli#readme) -- a set of command line tools for transformaing and validating with schemas
- [`@shexjs/webapp`](../shex-webapp#readme) -- the shex-simple WEBApp
- [`@shexjs/shape-path-query`](../shex-shape-path-query#readme) -- traverse ShEx schemas with a path language
- [`@shexjs/extension-test`](../extension-test#readme) -- a small language for testing semantic actions in ShEx implementations ([more](http://shex.io/extensions/Test/))
- [`@shexjs/extension-map`](../extension-map#readme) -- an extension for transforming data from one schema to another ([more](http://shex.io/extensions/Map/))
- [`@shexjs/extension-eval`](../extension-eval#readme) -- simple extension which evaluates Javascript semantic action code ([more](http://shex.io/extensions/Eval/))

