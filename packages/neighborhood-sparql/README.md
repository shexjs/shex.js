# @shexjs/neighborhood-sparql

[![npm version](https://img.shields.io/npm/v/@shexjs/neighborhood-sparql)](https://www.npmjs.com/package/@shexjs/neighborhood-sparql)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

Implementation of [`@shexjs/neighborhood-api`](../neighborhood-api#readme) which gets data from a [SPARQL endpoint](https://www.w3.org/TR/sparql11-protocol/).

This is called by [`@shexjs/validator`](../shex-validator#readme).

## Install

``` shell
npm install @shexjs/neighborhood-sparql
```

## ctor(endpoint: string, queryTracker: DbQueryTracker?, options: object?)
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
- `cacheQueries`: remember each query's rows for the DB's lifetime (default
  `true`) — a validation asks for the same neighborhood many times over
  (EXTENDS alone revisits nodes once per extended shape), and the graph does
  not change under a validation
- `executeQuery`: replace the SPARQL transport, e.g. to log queries
- `executeQueryAsync`: the async form of `executeQuery` (preferred — the DB awaits it)
- `expectBnodes`: expect blank nodes in every neighborhood rather than probing depth-0 first (default `false`)
- `rateLimit`: how fast to ask, and what to do when the service says not that
  fast — see below

## How fast to ask

A validation is a walk, and a walk over a query service is one request per
node it reaches. Public endpoints meter that: ask Wikidata for a few hundred
neighborhoods as fast as it will answer them and it starts returning **429
Too Many Requests**, which used to stop the validation on whichever query
happened to be in flight.

```js
sparqlDB(endpoint, tracker, {rateLimit: {rate: 2}})   // twice a second, at most
```

`rate` is in **requests per second**, because that is how a service states
its policy; `0` (the default) asks as fast as the walk can. It is a pace
rather than a bucket — the db awaits each answer before it knows what to ask
next, so spacing the requests is the whole of it.

Whatever the rate, a **429 is answered rather than reported**: the db waits
(`Retry-After` if the service named one, otherwise a second, doubling), drops
to a slower rate, and asks the same query again — `retries` times (default 4)
before it gives the refusal back to you.

Then it searches. The rate the service will bear is somewhere between the
fastest it has accepted and the slowest it has refused, and the only
measurements available are yes and no, so: halve on the first refusal (with
nothing known to work yet), double when nothing has been refused above the
current rate (there is no halfway to a bound that hasn't been found), and
otherwise take the geometric middle of the two bounds. Each probe replaces a
bound, the gap halves, and the search stops once they are within `tolerance`
(default 10%) of each other. After `relaxAfter` untroubled requests (default
64) it doubts the refused bound and looks again — a service that was busy an
hour ago may not be now.

The knobs, all optional: `rate`, `backoffRate` (where an unlimited db drops
to on its first refusal, default 1/s), `retries`, `tolerance`, `probeAfter`
(successes before a faster rate is tried, default 8), `relaxAfter`,
`cooldown`, `maxCooldown`. `db.rateLimit.state()` says what it has settled
on. From the CLI it is `--sparql-rate` and `--sparql-retries`; in the WebApp
they are fields of the SPARQL source.

Two dbs pointed at one service should share a limiter — pass a `RateLimiter`
as `rateLimit` — since it is the service being paced, not the db.

The synchronous face paces too, which means blocking without an `await`:
`Atomics.wait` where there is a `SharedArrayBuffer` (node always; a browser
only when the page is cross-origin isolated), and a spin where there isn't.
Prefer the asynchronous db, which is what the WebApp uses.

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
labels. Two families of tests are out of scope, marked by the manifest traits
`ToldBNode` (the focus is a blank node — unnameable over SPARQL) and
`LexicalBNode` (the verdict measures a blank node's *label* with `length` or
`pattern` — labels don't survive SPARQL). They are filtered out rather than
marked pending: a pending test reads as work to return to, and these can never
run. A meta-test audits the boundary in both directions: no blank node focus
may reach the endpoint (either trait keeps it out — a test whose focus is
`_:abcd` *and* whose verdict measures that label is tagged `LexicalBNode`, the
more specific of the two), and nothing carries `ToldBNode` without a blank node
focus. Every untagged facet-plus-bnode test demonstrably agrees across the two
neighborhoods, so the tags are trusted as the exact boundary.

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

---

`@shexjs/neighborhood-sparql` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
