# @shexjs/shape-path-query

[![npm version](https://img.shields.io/npm/v/@shexjs/shape-path-query)](https://www.npmjs.com/package/@shexjs/shape-path-query)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

Query RDF data by pointing at schema elements: a [ShapePath](https://github.com/shexSpec/ShapePath.js) expression selects constraints in a ShEx schema ([`shape-path-core`](https://www.npmjs.com/package/shape-path-core)), and `shapePathQuery` answers with the terms those constraints matched when the data validated — XPath for the schema, results from the graph.

## Install

``` shell
npm install @shexjs/shape-path-query
```

## Quick start

``` js
const Fs = require("fs");
const Path = require("path");
const {Store, Parser} = require("n3");
const Sp = require("shape-path-core");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {shapePathQuery} = require("@shexjs/shape-path-query");

// the Issue example that ships with shape-path-core
const schema = JSON.parse(Fs.readFileSync(Path.join(Sp.examples, "issue/Issue.json"), "utf8"));
const turtle = Fs.readFileSync(Path.join(Sp.examples, "issue/Issue2.ttl"), "utf8");

// 1. a ShapePath picks schema elements: the <p:href> constraint in <#DiscItem>
const yy = {base: new URL("http://project.example/schema"), prefixes: {}};
const pathExpr = new Sp.Parser.ShapePathParser(yy).parse(
  "@<http://project.example/schema#DiscItem>~<http://project.example/ns#href>"
);
const nodeSet = pathExpr.evalPathExpr([schema], new Sp.Ast.EvalContext(schema));

// 2. validate, and answer with what those elements matched in the data
const graph = new Store(new Parser({baseIRI: "http://project.example/"}).parse(turtle));
shapePathQuery(schema, nodeSet, RdfJsDb(graph),
  [{node: "http://instance.example/project1/Issue2",
    shape: "http://project.example/schema#Issue"}]
).then(terms => console.log(terms));
```
```
[ 'http://instance.example/project1/img1.jpg' ]
```

## shapePathQuery(schema, nodeSet, db, shapeMap) → Promise&lt;terms[]&gt;

* **schema** — a ShExJ schema (`@types/shexj` shaped);
* **nodeSet** — schema elements selected by `evalPathExpr` (they are annotated in place with [ShExMap](../extension-map#readme) variable bindings — that's the mechanism: the ShapePath aims the query, ShExMap captures the matches);
* **db** — a [`@shexjs/neighborhood-api`](../neighborhood-api#readme) implementation, e.g. [`@shexjs/neighborhood-rdfjs`](../neighborhood-rdfjs#readme) over your graph;
* **shapeMap** — which node/shape pairs to validate (a parsed [shape map](https://shexspec.github.io/shape-map/)).

Returns the data terms the selected schema elements matched, one entry per binding; throws if the shape map doesn't validate.

## From the command line

`spquery.js` takes a ShapePath (`,`-separated for a union), a schema, `-d` data and `-m` shape map:

``` shell
./bin/spquery.js \
  '@<http://project.example/schema#DiscItem>~<http://project.example/ns#href>,@<http://project.example/schema#Issue>~<http://project.example/ns#spec>/valueExpr/shapeExprs~<http://project.example/ns#href>' \
  node_modules/shape-path-core/examples/issue/Issue.json \
  -d node_modules/shape-path-core/examples/issue/Issue2.ttl \
  -m '<http://instance.example/project1/Issue2>@<http://project.example/schema#Issue>'
```
```
[
  "http://instance.example/project1/img1.jpg",
  "http://instance.example/project1/spec3"
]
```

(or `npm run toy` from this directory).

---

`@shexjs/shape-path-query` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
