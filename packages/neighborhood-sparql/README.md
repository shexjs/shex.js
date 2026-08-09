[![NPM Version](https://badge.fury.io/js/@shexjs%2Fneighborhood-sparql.png)](https://npmjs.org/package/shex)
[![ShapeExpressions Gitter chat https://gitter.im/shapeExpressions/Lobby](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/shapeExpressions/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.1213693.svg)](https://doi.org/10.5281/zenodo.1213693)

# @shexjs/neighborhood-sparql
Implementation of [`@shexjs/neighborhood-api`](../neighborhood-api#readme) which gets data from a [SPARQL endpoint](https://www.w3.org/TR/sparql11-protocol/).

This is called by [`@shexjs/validator`](../shex-validator#readme).


## install

``` shell
npm install --save @shexjs/neighborhood-sparql
```

## ctor(endpoint: string, queryTracker: QueryTracker?, options: object?)
Present a SPARQL endpoint through the Neighborhood API. Call `setSchema(schema)`
before validating: the schema says which predicates a neighborhood needs, which
is what keeps the queries narrow.


## options
- `allOutgoing`: fetch every outgoing arc rather than only those the shape needs
- `bnodeDepth`: how far to follow blank nodes when describing them (default 4,
  grown automatically when a description bottoms out)
- `maxBnodeDepth`: ceiling on that growth (default 64)
- `verifyBnodeDescriptions`: ask the endpoint to confirm each blank node
  description picks out the node it should (default `true`)
- `executeQuery`: replace the SPARQL transport, e.g. to log queries


## Blank nodes

SPARQL has no [told bnodes](https://www.w3.org/TR/sparql11-query/#BGPsparqlBNodes).
The labels in a result set mean nothing outside it — stores such as
[QLever](https://qlever.cs.uni-freiburg.de/) mint fresh ones for every response
— and a blank node label written into a query is a *variable*, matching
everything. So a validator that walks from a node to its blank object and back
to the endpoint cannot simply say "that one again".

Instead, the first time this module sees a blank node it writes down a
**description** (a *definite description*, in Russell's sense: "the node such
that…"): an anchored graph pattern that starts at the nearest IRI or literal,
follows the arcs that led to the node, and states exactly what hangs off it —
every predicate, every object, and a correlated `MINUS` clause for anything
else. Later queries re-identify the node from the description. Coming back to
a node already on the path re-uses its variable rather than recursing, so
cyclic data terminates and the cycle is recorded precisely.

Two sibling blank nodes with identical descriptions are genuinely
interchangeable — no anchored pattern separates them — so they get distinct
handles, keeping cardinality right, that share a single description. Where
siblings differ below the description depth, the description is re-derived
deeper rather than calling them interchangeable.

Every new description is checked against the endpoint before it is trusted: it
must match exactly as many nodes as the structure says it should. A description
that matches the wrong node would produce quietly wrong validation results, so a
mismatch raises `BNodeIdentityError` instead. Passing a blank node this module
did not itself hand out raises the same error: over SPARQL there is no way to
ask about it.


## Tests

Gated on `TEST_sparql`, since they need a SPARQL engine:

``` shell
npm run test-sparql            # from the repo root
SPARQL_ENDPOINT=http://localhost:7001 npm run test-sparql   # against a real store
```

`Sparql-Validation-test.js` runs the whole
[shexTest](https://github.com/shexSpec/shexTest) validation suite twice — once
through `@shexjs/neighborhood-rdfjs` over an in-memory store, once through this
module over a SPARQL endpoint — and requires the two to agree, modulo blank node
labels. Two families of tests are out of scope and skipped: those naming a
blank node as the focus (detected from the focus/map itself, since three of
them are missing the manifest's `ToldBNode` trait), and those the manifest tags
`LexicalBNode` whose data contains blank nodes — the tests that measure a blank
node's *label* with `length` or `pattern`. Both ask SPARQL for something it
does not have; every untagged facet-plus-bnode test demonstrably agrees across
the two neighborhoods, so the tag is trusted as the exact boundary.

The endpoint under test (`sparql-test-server.js`, comunica-backed) is as hostile
as the spec allows: it draws every response's blank node labels from a small
rotating pool, so one node is called something different each time and one name
denotes a different node each time, and it rejects outright any query that
mentions a blank node label.

Loaded next to every test's data is the **DECEPTICON** (`decepticon.ttl` plus a
mirror of every shexTest graph, see `decepticon.js`): hundreds of decoy triples
wearing the suite's own predicates, literals and blank node topologies —
self-loops, diamonds, lists whose cells are indistinguishable, siblings that
differ only six arcs down. None of it is reachable from any focus node, so it
must not change a single result; but a neighborhood query that identifies its
blank node by structure instead of by an anchored path collects the decoys too
and blows its cardinality constraints. `Sparql-Bnode-test.js` includes two tests
that delete the anchor from a description to show the decoys really do catch it.


## Portability

Running the suite against [QLever](https://github.com/ad-freiburg/qlever)
instead of the bundled endpoint turned up three things, all fixed here, that any
store is entitled to insist on:

- control characters in literals need `\uXXXX`. SPARQL's `ECHAR` covers seven
  of them; comunica accepted the rest raw, QLever did not.
- long queries have to go in a POST body. A generated description passes 8k
  easily and QLever drops the connection at about that point, so
  `ShExUtil.executeQuery` now POSTs anything over `ShExUtil.sparqlGetLimit`.
- `sameTerm` is not universal. "This is not that term" is written out instead as
  a guarded comparison of kind, lexical form, language and datatype — which also
  sidesteps `!=`, that being a *type error* between literals of unrelated
  datatypes, and an error inside `FILTER NOT EXISTS` silently drops the row that
  should have ruled the match out.

QLever itself does not get through the suite, for two reasons, neither of which
is what it first looked like:

- it rejects shexTest's deliberately ill-typed literals (`"2"^^xsd:boolean`,
  `"abc"^^xsd:integer`) in SPARQL Update with a clean 400 — no crash — while
  accepting ill-typed dateTimes and unknown datatypes. Ill-typed literals are
  valid RDF, so comunica takes them and the affected tests can't be loaded into
  QLever; `Endpoint#rejected` records exactly what a store refused so a partial
  run says what it couldn't test rather than quietly testing less.
- its query planner re-plans the argument of every `FILTER (NOT) EXISTS` once
  per candidate subplan it considers, so planning memory grows ~4× with each
  added clause: on an 8-triple store, 2 clauses ≈ 0.7 GB, 4+ is an OOM before
  execution starts (reproduced on master, located by stack sample in
  `QueryPlanner::fillDpTab` → `Filter` construction →
  `ExistsJoin::addExistsJoinsToSubtree`; memoization fix + repro upstream).
  The descriptions' exclusion clauses are therefore written as **correlated
  `MINUS`** — every variable the exclusion depends on is restated inside the
  group, which keeps `MINUS` equivalent to `NOT EXISTS` here while letting
  planners treat it as an ordinary binary join: flat at 68 MB with 9 clauses
  where `NOT EXISTS` OOMs at 4.
- it normalizes numeric literals on ingest (`"5"^^xsd:byte` comes back as
  `"5"^^xsd:int`), which changes literal identity and hence validation. After
  loading each test's data, the harness asks the store for its literals back
  and skips the test (with the rewritten literal named) when the graph under
  test is no longer the test's graph — see `Endpoint#literalsMissing`.

With the `MINUS` emitters and those two guards, the whole validation suite runs
against a native QLever build (`--persist-updates`, per-response blank node
relabeling and all): **713 passing, 0 failing**, 454 skipped with stated
reasons (the trait skips plus every test whose literals QLever refused or
rewrote).

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

