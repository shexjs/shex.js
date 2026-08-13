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
  pick up an edit.

Pages are also remembered **per process**, not per DB: a host that offers a
configuration form rebuilds its db whenever a setting changes, and a
synchronous fetch is the most expensive thing here, so what was fetched
outlives the db that fetched it. `forgetPages()` empties that, for a host
that wants the site's current answer again.
- `fetchDoc(url)`: synchronous transport returning the response body. The
  default reads `file:` URLs from disk (a directory of captured pages is a
  fully offline "API") and fetches the rest with a synchronous
  `XMLHttpRequest`, which browsers provide; under node pass this option or
  install a shim (e.g.
  [neighborhood-sparql's sync-fetch](../neighborhood-sparql/sync-fetch.js):
  `require("@shexjs/neighborhood-sparql/sync-fetch").installXhrShim()`).
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

## from the command line

The module declares its construction parameters (see the STRAWMAN notes in
[`@shexjs/neighborhood-api`](../neighborhood-api#readme)), which
[`@shexjs/cli`](../shex-cli#readme)'s `validate` surfaces as options:

``` shell
validate -x human.shex -m '<http://www.wikidata.org/entity/Q42>@<#human>' \
  --wikidata https://www.wikidata.org/wiki/Special:EntityData/ \
  --wikidata-cache /tmp/wikidata-pages
```

`--wikidata` names the base that entity ids are appended to
(`<base><id>.json`); a `file:` directory of captured pages works offline.
`--wikidata-sitematrix` and `--wikidata-cache` cover the sitematrix source
and the on-disk page cache.

## validating an edit before making it

`pages` (the CLI's `--wikidata-page`, the WebApp's entity-JSON panes) are
entity pages to believe **instead of** what the site currently serves:

``` shell
validate -x human.shex -m '<http://www.wikidata.org/entity/Q42>@<#human>' \
  --wikidata https://www.wikidata.org/wiki/Special:EntityData/ \
  --wikidata-page ./Q42-with-my-edit.json
```

The walk reads that page where it would have fetched Q42 and fetches
everything else as usual, so a speculative constellation is checked in its
real surroundings. A page may be the full `{"entities": {…}}` document or
the bare entity, which is what hand-editing tends to leave you with.

## from the WebApp

Pick **Wikidata** from the data-source list. The module declares what it
needs, so the app draws it: a field for the entity-page base, a first pane
holding the entities in play as a whitespace-separated list of ids, and a
pane per entity page with a `+` to open another — each tab named by reading
the id back out of the page. Those pages are the `pages` above.

Turning on **slurp** records what a validation fetched: the triples go to
the local store's Turtle document, and every entity page the walk read comes
back as a pane of its own, readably indented, to edit and validate again.

Requests identify themselves with a `User-Agent` where that can be said —
Wikimedia's robot policy 403s clients that don't — which means under node,
whose synchronous-XHR shim has none of its own. A browser has one already
and refuses to let anyone set that header, so it isn't asked. Nor is any
*custom* header set (`Api-User-Agent`, which MediaWiki would also read):
asking for one turns a cross-origin request into a preflighted one, which a
synchronous XHR cannot do. The site table is fetched with `origin=*`, or a
browser has no permission to read the response.

Nothing here uses a node-only global — no `Buffer`, no `crypto` — because
all of it runs in a browser too. PHP's serialization counts *bytes*, so
`utf8Length` does that arithmetic itself; a test converts a fixture with
`Buffer` taken away to keep it that way.

What no host could offer, this module does: completing entity IRIs from the
labels of the pages the db has loaded, so typing `wd:Q4` offers
`http://www.wikidata.org/entity/Q42` — *Douglas Adams*. The same knowledge
backs the shape-map's focus-node menu through `suggestFocusNodes`. A pane's
first line may still say `# Wikidata: <base>`, which is how a permalink or a
dropped file names this source.

Label lookup falls through `mul`, Wikidata's language-neutral label: a name
that reads the same everywhere is now stored once rather than copied per
language, so an entity can carry 75 labels and no `en` one (Q42 is exactly
this).

This package computes md5 itself (`src/md5.ts`) rather than reaching for
node's `crypto`: the digests are Wikibase's naming scheme — value nodes,
somevalue blank nodes, novalue restrictions — and browsers have no
synchronous md5 to offer a synchronous API.

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
