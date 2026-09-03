# @shexjs/neighborhood-rdfjs

[![npm version](https://img.shields.io/npm/v/@shexjs/neighborhood-rdfjs)](https://www.npmjs.com/package/@shexjs/neighborhood-rdfjs)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

Implementation of [`@shexjs/neighborhood-api`](../neighborhood-api#readme) over an in-memory [RDF/JS](https://rdf.js.org/) store (e.g. [N3.js](https://www.npmjs.com/package/n3)'s `Store`) — the data interface [`@shexjs/validator`](../shex-validator#readme) walks when your graph is already loaded in memory.

## Install

``` shell
npm install @shexjs/neighborhood-rdfjs
```

## Quick start

``` js
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("@shexjs/validator");
const {Store, Parser} = require("n3");
const base = "http://a.example/";

const schema = require("@shexjs/parser").construct(base).parse(`
<S1> { <p1> [1 2] }`);
const graph = new Store(new Parser({baseIRI: base}).parse(`
<n1> <p1> 1 .`));

const validator = new ShExValidator(schema, RdfJsDb(graph));
const results = validator.validateShapeMap(
  [{node: base + "n1", shape: base + "S1"}]);
console.log(results[0].status);  // "conformant"
```

## ctor(store, queryTracker?)

Wraps the store for the Neighborhood API. The store must answer `getQuads(subject, predicate, object, graph)` with quads of RDF/JS terms — N3.js's `Store` does, as does anything implementing the RDF/JS [Store](https://rdf.js.org/stream-spec/#store-interface) match semantics synchronously.

A validation is a walk: for each node it reaches, the validator asks this db for the node's *neighborhood* — the arcs out of (and, for inverse constraints, into) the node — which is two `getQuads` calls. The optional `queryTracker` hears about each ask, which is how the WebApp paints what a validation touched.

Because the store is local and complete, every kind of constraint works here — `CLOSED` shapes, inverse arcs, blank-node focus nodes — which is why the [shexTest](https://github.com/shexSpec/shexTest) suite runs over this module, and other neighborhoods ([SPARQL](../neighborhood-sparql#readme), [Wikibase](../neighborhood-wikibase#readme)) measure themselves against it.

---

`@shexjs/neighborhood-rdfjs` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
