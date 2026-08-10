[![NPM Version](https://badge.fury.io/js/@shexjs%2Fneighborhood-wikidata.png)](https://npmjs.org/package/shex)
[![ShapeExpressions Gitter chat https://gitter.im/shapeExpressions/Lobby](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/shapeExpressions/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.1213693.svg)](https://doi.org/10.5281/zenodo.1213693)

# @shexjs/neighborhood-wikidata
Implementation of [`@shexjs/neighborhood-api`](../neighborhood-api#readme) which
synthesizes Wikidata's RDF on the fly from entity JSON pages.

Wikidata entities are edited and stored as JSON
([`Special:EntityData/Q42.json`](https://www.wikidata.org/wiki/Special:EntityData/Q42.json));
the RDF that the query service exposes
([`Q42.ttl?flavor=dump`](https://www.wikidata.org/wiki/Special:EntityData/Q42.ttl?flavor=dump))
is derived from those pages. Rather than validating across SPARQL (see
[`@shexjs/neighborhood-sparql`](../neighborhood-sparql#readme)), this DB
downloads the JSON page of each entity a validation walks into, re-derives the
RDF — entity, statement nodes, qualifiers, references, value nodes, sitelinks —
and answers neighborhood queries from the accumulated store.

The derivation is exact, verified quad-for-quad against dump output (see
Tests): value node names (`wdv:<hash>`) reproduce Wikibase's md5-of-legacy-PHP-serialization
hashes, somevalue blank nodes and property pages' novalue restrictions carry
Wikibase's stable labels, Julian dates convert to proleptic Gregorian the way
`JulianDateTimeValueCleaner` does, coordinate and precision floats render with
PHP's 14-significant-digit formatting, and sitelink URLs and languages go
through MediaWiki's title encoding and BCP 47 mappings (`simple` →
`en-simple`, `nds-nl` → `nds-NL`, `no` → `nb`, …).

## use

``` js
const {ctor: WikidataDb} = require("@shexjs/neighborhood-wikidata");

const db = wikidataDB(null, {
  cacheDir: "/some/cache/dir",     // strongly recommended
  fetchDoc: url => mySyncGet(url), // under node; browsers can omit it
});
const validator = new ShExValidator(schema, db, options);
validator.validateShapeMap([{node: "http://www.wikidata.org/entity/Q42", shape: myShape}]);
```

A focus node names its entity page most of the time — `wd:Q42` directly, a
statement node `wds:Q42-<guid>` by its prefix, the `data:Q42` page node by its
path — and the page is fetched on first touch. Value nodes (`wdv:`),
reference nodes (`wdref:`) and somevalue blank nodes carry no entity name, but
a walk only reaches them through a statement whose page is already loaded, so
they are answered from the store; asking about one this DB has never seen
raises `EntityResolutionError` rather than returning a quietly empty
neighborhood.

## ctor(queryTracker: QueryTracker?, options: object?)

- `cacheDir`: keep each fetched JSON page on disk, so re-validating costs no
  requests. Pages are cached forever — delete a file (or the directory) to
  pick up an edit. Without it, caching is in-memory only (still one fetch
  per entity per DB).
- `fetchDoc(url)`: synchronous transport returning the response body. The
  default uses a synchronous `XMLHttpRequest`, which browsers provide; under
  node pass this option or install a shim (e.g.
  [neighborhood-sparql's test sync-fetch](../neighborhood-sparql/test/sync-fetch.js)).
  Wikimedia's servers 403 anonymous clients, so a node transport should send
  a real `User-Agent`.
- `entityDataUrl(id)`, `siteMatrixUrl`, `conceptBase`, `dataBase`,
  `repositoryName`, `commonsMediaBase`, `commonsDataBase`, `license`: point
  at a different Wikibase instance (defaults are wikidata.org's).
- `siteInfo(siteId)`: resolve sitelink site ids yourself instead of fetching
  the sitematrix.

The JSON → RDF converter is usable on its own:

``` js
const {wikibaseRdfConverter} = require("@shexjs/neighborhood-wikidata/lib/wikibase-rdf");
const quads = wikibaseRdfConverter(N3.DataFactory, {siteInfo})
  .entityToQuads(JSON.parse(entityDataJson));
```

## what the store can and cannot answer

Every loaded page states *all* of its entity's outgoing arcs, so outgoing
neighborhoods (including `CLOSED` shapes) are complete. *Incoming* arcs only
reflect the pages the walk has loaded: validating `wd:Q5` against
`^wdt:P31 .` sees the humans walked in so far, not all nine million. Inverse
constraints over Wikidata-scale fan-in need a query service; this DB's answer
is honest but partial.

Known gaps, all annotations WDQS derives from data outside the entity's own
page (they are absent, never wrong):

- normalized values — `wdtn:`/`psn:`/`pqn:`/`prn:` triples and
  `wikibase:quantityNormalized` — need the property registry's formatter IRIs
  (P1921) and unit conversion tables. The property-page *declarations* of
  those predicates are static and are emitted.
- `math` values are emitted as their TeX source where WDQS renders MathML.
- lexemes (`wd:L…` pages) have a different page shape and are not yet
  handled; items and properties are.

## Tests

The default suite runs offline from fixture pages: five entities (Q42, Q692,
Q5, P31, P214) captured as JSON-page/dump-Turtle pairs at a single revision
each. The converter must synthesize each page's RDF **exactly** — same IRIs,
same literals, same hashes, same blank node labels — modulo only the
normalized-value triples above, which are filtered from the expected side and
asserted absent from the synthesized side. Between them the fixtures exercise
qualifiers, references, all three complex value kinds, somevalue, ranks and
BestRank, Julian dates (Q692), 132 sitelinks' worth of language mapping (Q42),
and both item-valued and external-id property pages (P31 with a truthy
novalue, P214 with normalized-predicate declarations).

`TEST_wikidata=true` adds a live smoke test against wikidata.org.

# Lerna Monorepo

This repo uses [lerna](https://github.com/lerna/lerna) to manage multiple NPM packages. These packages are located in `packages/*`:

- [`shape-map`](../shape-map#readme) -- a [ShapeMap](https://shexspec.github.io/shape-map/) parser
- [`@shexjs/parser`](../shex-parser#readme) -- parse ShExC into ShExJ
- [`@shexjs/writer`](../shex-writer#readme) -- serialize ShExK as ShExC
- [`@shexjs/term`](../shex-term#readme) -- RDF terms uses in ShEx
- [`@shexjs/util`](../shex-util#readme) -- some utilities for transforming schemas or validation output
- [`@shexjs/visitor`](../shex-visitor#readme) -- a [visitor](https://en.wikipedia.org/wiki/Visitor_pattern) for schemas
- [`@shexjs/validator`](../shex-validator#readme) -- validate nodes in an RDF graph against shapes in a schema
- [`@shexjs/eval-validator-api`](../eval-validator-api#readme) -- API called by [`@shexjs/validator`](../shex-validator#readme) for validating Shapes, with tripleExpressions and EXTENDS etc.
- [`@shexjs/eval-simple-1err`](../eval-simple-1err#readme) -- Implementation of [`@shexjs/eval-validator-api`](../eval-validator-api#readme) which reports only one error.
- [`@shexjs/eval-threaded-nerr`](../eval-threaded-nerr#readme) -- Implementation of [`@shexjs/eval-validator-api`](../eval-validator-api#readme) which exhaustively enumerate combinations of ways the data fails to satisfy a shape's expression.
- [`@shexjs/loader`](../shex-loader#readme) -- an API for loading and using ShEx schemas
- [`@shexjs/node`](../shex-node#readme) -- additional API functionality for a node environment
- [`@shexjs/cli`](../shex-cli#readme) -- a set of command line tools for transformaing and validating with schemas
- [`@shexjs/webapp`](../shex-webapp#readme) -- the shex-simple WEBApp
- [`@shexjs/shape-path-query`](../shex-shape-path-query#readme) -- traverse ShEx schemas with a path language
- [`@shexjs/extension-test`](../extension-test#readme) -- a small language for testing semantic actions in ShEx implementations ([more](http://shex.io/extensions/Test/))
- [`@shexjs/extension-map`](../extension-map#readme) -- an extension for transforming data from one schema to another ([more](http://shex.io/extensions/Map/))
- [`@shexjs/extension-eval`](../extension-eval#readme) -- simple extension which evaluates Javascript semantic action code ([more](http://shex.io/extensions/Eval/))
