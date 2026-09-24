---
name: shexjs-neighborhoods
description: Develop or change a shex.js data source ("neighborhood") — the packages/neighborhood-* packages (api, rdfjs, sparql, wikibase) or a new one. Covers the NeighborhoodDb / AsyncNeighborhoodDb contract, how the validator and hosts call it, arc order and ordered() / --sort-quads, the module exports (dbParams, fromParams, claimPaneText, queryMapResolvers) that wire a backend into the CLI and the WebApp, and how each backend is tested. Use when touching getNeighborhood, adding a backend, or debugging results that differ between backends.
---

# Neighborhood backends

The validator never reads a graph directly. It asks a **NeighborhoodDb** for
the arcs into and out of one node at a time. Where those arcs come from is
up to the backend:

| package | data from | notes |
| --- | --- | --- |
| `@shexjs/neighborhood-api` | — | the interfaces, `ordered()`, module-declaration types and helpers |
| `@shexjs/neighborhood-rdfjs` | an RDF/JS store (`N3.Store`) | the default. Every test harness uses it as the oracle |
| `@shexjs/neighborhood-sparql` | a SPARQL endpoint | blank nodes re-derived from descriptions, rate limiting, sync and async faces |
| `@shexjs/neighborhood-wikibase` | Wikibase `Special:EntityData/<id>.json` pages | builds WDQS-dump-style RDF from the JSON into a growing store |

All of them are TypeScript: `src/*.ts` compiles to the gitignored `lib/*.js`
(see the shexjs-build-and-test skill). Tests `require` `lib`, so recompile
before trusting a run.

## The contract (`neighborhood-api/src/neighborhood-api.ts`)

```ts
getNeighborhood(point, shapeLabel /* string | Start */, shape): {outgoing: Quad[], incoming: Quad[]}
getSubjects(), getPredicates(), getObjects(), getQuads(), get size()
```

- `outgoing` holds the arcs whose subject is `point`. `incoming` holds the
  arcs whose object is `point`. Keep `quad.graph`: an experimental GRAPH
  feature (the `graphs` branch, not on main) filters on it, and it needs no
  interface change.
- The objects you return become later `point`s. A backend must accept its
  own blank nodes back. For rdfjs this is trivial. SPARQL can't replay result-set
  labels, so `neighborhood-sparql` mints its own labels and re-finds each
  node from an anchored description. Read that file's header comment before
  changing it.
- `shapeLabel`/`shape` let a backend fetch less. rdfjs ignores them. SPARQL
  uses the schema index to pick predicates, but it only gets that index if
  the **host** calls the optional `db.setSchema(schema)`. The validator
  never calls it. The CLI and the WebApp do.
- `getQuads(s, p, o)` with arguments also has to work. The interface
  doesn't say so, but the CLI answers shape-map triple patterns
  (`{FOCUS :p _}`) with it.
- A query backend can't enumerate everything. SPARQL's `size` and
  `getObjects()` are placeholders. Don't depend on them for query-backed dbs.
- `DbQueryTracker`: call `start(isIncoming, term, label)`, and pass the
  token it returns to `end(quads, ms, token)`, or to `fail(err, ms, token)`.
  Async dbs have several queries in flight, so arrival order doesn't match
  answers to questions.
- To fail, throw. `driveSync` throws the error back into the validation at
  the point that asked.

### Sync vs async

`validateShapeMap` is synchronous recursion. It needs a `NeighborhoodDb`.
`AsyncNeighborhoodDb` is a *separate* interface: its `getNeighborhood`
returns a Promise and is driven by `ShExValidator.validateShapeMapAsync`.
The search is resumable, not async. It forks, shares in-flight fetches, and
caches each neighborhood once per validation, keyed on node + shape label.
A network backend follows this convention:

- The db object is synchronous (a sync XHR, which the CLI shims with
  `@shexjs/neighborhood-sparql/sync-fetch`'s `installXhrShim()`). It also
  has `getNeighborhoodAsync` over `fetch()`.
- The module exports `asAsyncDb(db)`. It returns `Object.create(db, {getNeighborhood: …})`,
  so the query cache and other live members are shared.
- The WebApp takes the async face whenever the module has one.

## Arc order is cosmetic

rdfjs and sparql return arcs in **native order**. ShEx conformance never
depends on order: the validator enumerates partitions. Order changes only
how results print. When a caller needs deterministic output, it wraps the
db:

```js
const {ordered} = require("@shexjs/neighborhood-api");
new ShExValidator(schema, ordered(RdfJsDb(store)), opts);
```

`ordered()` sorts both lists by `sparqlQuadOrder` (object, then predicate,
then subject: a total order). It works over a sync or async db and passes
every other member through by delegation. Blank nodes sort by label, so two
backends agree on ground terms but not on how they name bnodes.

Who uses it: `shex-validator/test/Validation-test.js` and
`Sparql-Validation-test.js` (committed `.val` files assume it), the CLI
behind `validate --sort-quads` (off by default), and the WebApp's
`#sortQuads` checkbox (on by default, and always on when the control is
missing, e.g. the worker page). `neighborhood-wikibase` still sorts its own
arcs by object only. If a result differs only in the order of repeated
predicates, suspect an unwrapped db, or a stale `lib/`, before suspecting
the engine.

## Module exports: how a backend plugs in

A package's entry exports `name` (`"neighborhood-<id>"`; `moduleId()` strips
the prefix), `label`, `description` and `ctor`. These exports are optional
(the API marks them STRAWMAN):

- `capabilities: ("query"|"translate")[]`: "this fetches". The WebApp
  offers slurp for such a source. The worker **rebuilds** such a db from
  `{neighborhood: id, params}` instead of receiving quads.
- `dbParams: DbParamSpec[]` + `fromParams(params, tracker)`: an OpenAPI-ish
  parameter list. Use `selector: true` on the parameter(s) whose presence
  chooses this source, `cli: {option, alias, typeLabel}` for the flag, and
  `pane: PaneSpec` for a parameter whose value is *documents to edit*. A
  pane parameter's value is **content**; the host resolves filenames/URLs
  first. When a pane's `items.contentMediaType` is `text/turtle`, the
  WebApp parses it and passes `params.store`.
- `claimPaneText(text)`: returns params if this text asks for this source
  (sparql: a leading `# Endpoint: <url>`; wikibase: `# Wikibase:`), or null.
- `queryMapResolvers`: shape-map extensions this source can answer
  (sparql `SPARQL "SELECT…"`, wikibase `QENTITIES "42 Q76"`). Hosts ask the
  *selected* source, and report "not supported by the neighborhood X"
  otherwise. Core selectors (`FOCUS`, `_`, triple patterns) use `getQuads`.
- `paneEditor`, and on the db `suggestFocusNodes` / `labelOf` /
  `locateDocument` / `loadedPages` (`NeighborhoodWebAppDb`): optional
  WebApp affordances. The host feature-tests for each one.

### Wiring checklist for a new backend

1. `packages/neighborhood-<id>/` following the rdfjs layout (`src/`,
   `tsconfig.json`, `main: lib/…js`, `types: src/…ts`). Add its line to the
   Makefile's package table (`Makefile-test.js` fails until you do). `tools/publish-ordered.js` orders publishing from
   the dependencies, so no release list needs editing.
2. **CLI**: add it to `QueryDbModules` in `packages/shex-cli/src/validate.ts`.
   It must have `dbParams` + `fromParams`. Its options are appended from
   `paramsToCommandLineArgs`. A spec whose `cli.option` already exists
   shares that flag (sparql's `allOutgoing` uses `--slurp-all`).
3. **WebApp**: add it to `NeighborhoodModules` in
   `packages/shex-webapp/shex-webapp.js` (the first entry is the default),
   or ship it in a plugin descriptor's `neighborhoods: [module]` (see
   the repo-root `doc/plugins.md` and the shexjs-webapp skill). If it touches Node
   builtins, extend the webpack `resolve.fallback` the way wikibase did.
4. **`@shexjs/shex`**: add it to the `Neighborhoods` getter in
   `packages/shex/src/shex.ts`, and add it to that package's README.
5. `neighborhood-api/test/PaneClaim-test.js` exercises the real modules'
   declarations. Add yours there with a plain `require`, not as a
   devDependency: the api package is upstream of every implementation, and
   a devDependency would create a cycle.

## Testing

- **rdfjs**: has no suite of its own. The shexTest corpus run
  (`Validation-test.js`) covers it.
- **Oracle comparison** (the pattern for any new backend):
  `Sparql-Validation-test.js` validates every corpus test through rdfjs and
  through SPARQL, and the two must agree up to bnode labels (`compare.js`).
  It's gated on `TEST_sparql` (`npm run test-sparql`). It starts a bundled
  endpoint (`sparql-test-server.js`) that **scrambles** bnode labels on
  every response and rejects queries that mention one. It also loads the
  DECEPTICON decoy graph beside each test's data. `SPARQL_ENDPOINT=<url>`
  points it at a real store instead. `TESTS=`, `NO_DECEPTICON`.
- **Injected transports** keep unit tests offline and ungated: sparql's
  `executeQuery` / `executeQueryAsync` options (`Sparql-Async-test.js`,
  `RateLimit-test.js`), and wikibase's `fetchDoc` serving `test/fixtures`.
- **Wikibase fixtures** are revision-pinned pairs (`Q42.json` + `Q42.ttl`
  from `?flavor=dump`, captured at one revision). `Wikibase-Rdf-test.js`
  requires quad-for-quad equality, including bnode labels. The only
  exception is the normalized-value predicates (`wdtn:`, `psn:`, …), which
  can't be derived from one page. `TEST_wikidata=true` adds a live smoke
  test. Wikimedia returns 403 to clients without a User-Agent, so Node
  transports must send one.
- The corpus lives outside the repo. Tests find it through
  `packages/shex-cli/test/findPath.js` (see shextest-paired-branches).
