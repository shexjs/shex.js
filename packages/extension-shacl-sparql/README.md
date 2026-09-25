# @shexjs/extension-shacl-sparql

[![npm version](https://img.shields.io/npm/v/@shexjs/extension-shacl-sparql)](https://www.npmjs.com/package/@shexjs/extension-shacl-sparql)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

SHACL-SPARQL constraints as ShEx semantic actions,
`http://shex.io/extensions/SHACL-SPARQL/`.

A query is written the way [SHACL-SPARQL](https://www.w3.org/TR/shacl/#sparql-constraints)
writes it and means what it means there, so the queries you already have
for `sh:sparql` constraints and `sh:SPARQLAskValidator`s can be used as
they are.  What changes is what is around them: ShEx's recursion, its
closed shapes over triple expressions, and actions that take part in
matching rather than being reported after it.

``` shell
npm install @shexjs/extension-shacl-sparql
```

```
PREFIX : <http://a.example/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX shacl-sparql: <http://shex.io/extensions/SHACL-SPARQL/>

:Event {
  :start xsd:date ;
  :end xsd:date ;
  :part @:Event *
} %shacl-sparql:{
  SELECT $this ?start ?end ("the event ends before it starts" AS ?message)
  WHERE { $this :start ?start ; :end ?end . FILTER (?end < ?start) }
%}
```

## What a query means

| query | passes when | as in SHACL |
| --- | --- | --- |
| `SELECT` | it finds no rows; each row is a failure, and a row's `?message` says why | `sh:SPARQLConstraint` |
| `ASK` | it answers true | `sh:SPARQLAskValidator` |

Anything else (`CONSTRUCT`, `DESCRIBE`, a query that doesn't parse) is an
invocation error.

## What is pre-bound

| where the action is | `$this` | `$value` |
| --- | --- | --- |
| a shape, or a node constraint | the node being validated | |
| a triple constraint | the node being validated | the other end of the triple it matched |
| a group (`(… ; …)`, `(… \| …)`) | the node its triples share | |
| the start actions | | |

A start action has nothing pre-bound: it is a check over the whole of the
data, once per node/shape pair.

An action written after a triple constraint's value is the triple
constraint's (`:v xsd:integer %shacl-sparql:{…%}` binds `$this` to the subject);
to put one on the value itself, give the value a label
(`:v @:Positive` … `:Positive xsd:integer %shacl-sparql:{…%}`).

The schema's `PREFIX` declarations and base are in scope, so a query needs
no `PREFIX`es of its own (SHACL's `sh:prefixes`).

## What a query runs over

The validator's data source, as its `querySource()` describes it
(`@shexjs/neighborhood-api`):

- **an RDF/JS dataset** (`@shexjs/neighborhood-rdfjs`, the WebApp's data
  panes) is queried in place with [Comunica](https://comunica.dev/), its
  default graph the union of every graph in it;
- **a Wikibase** (`@shexjs/neighborhood-wikibase`) is queried the same way,
  over the entity pages loaded so far -- the validation's view of it, not
  the whole Wikibase;
- **a SPARQL endpoint** (`@shexjs/neighborhood-sparql`) is sent the query,
  through the data source's rate limiter, with the pre-bound terms written
  into it.  A blank node can't be written into a query, so asking an
  endpoint about a blank-node `$this` or `$value` is an error.

Each distinct question -- a query and what was pre-bound -- is asked once
per validator.

## Using it

Every query is answered asynchronously, so validate with
`validateShapeMapAsync`:

``` js
const SparqlExtension = require("@shexjs/extension-shacl-sparql");
const validator = new ShExValidator(schema, RdfJsDb(store));
SparqlExtension.register(validator, {ShExTerm});
const results = await validator.validateShapeMapAsync(shapeMap);
```

The synchronous `validateShapeMap` throws, saying so.  The schema has to be
parsed with `{index: true}` (as the CLI and the WebApp do) for its prefixes
to be in scope.

### From the command line

``` shell
validate -x events.shex -d events.ttl -m '<http://a.example/conf>@<http://a.example/Event>' \
  --extension @shexjs/extension-shacl-sparql
```

The module exports `asynchronous: true`, which is how `validate` knows to
wait for its answers.  With `--endpoint <url>` in place of `-d`, the
queries go to the endpoint.

### In the WebApp

`doc/ShExShaclSparqlPlugin.js` is the plugin, and
[`examples/manifest.yaml`](examples/manifest.yaml) loads it:

```
packages/shex-webapp/doc/shex-simple.html?manifestURL=../../extension-shacl-sparql/examples/manifest.yaml
```

The plugin's bundle (`doc/webpacks/shexshaclsparql-webapp.js`, built with
`npm run webpack`) carries Comunica, about 3 MB minified.  The step-through
debugger validates synchronously, so it can't run SPARQL actions.
