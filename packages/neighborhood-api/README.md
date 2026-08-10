[![NPM Version](https://badge.fury.io/js/@shexjs%2Fneighborhood-api.png)](https://npmjs.org/package/shex)
[![ShapeExpressions Gitter chat https://gitter.im/shapeExpressions/Lobby](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/shapeExpressions/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.1213693.svg)](https://doi.org/10.5281/zenodo.1213693)

# @shexjs/neighborhood-api
API called by [`@shexjs/validator`](../shex-validator#readme) to get a neighborhood (arcs in and out of a node)

## install

``` shell
npm install --save @shexjs/neighborhood-api
```

## declaring a DB's construction parameters (STRAWMAN)

Each neighborhood implementation needs different things to come to life — an
rdfjs store wants files (with media types), a SPARQL db wants an endpoint and
query-strategy flags, a wikidata db wants the page base it appends entity ids
to. A host that offers several implementations (the CLI, the WebApp)
shouldn't hard-code each one's needs, so a module may *declare* them by
exporting, alongside the longstanding `{name, description, ctor}`:

- `dbParams: DbParamSpec[]` — the parameters, in the style of OpenAPI's
  Parameter/Schema Objects (`type`, `format`, `enum`, `default`, `items` with
  `contentMediaType`), plus a `cli` hint (`option`, `alias`) for surfacing
  them in a command line, and a `selector` flag marking the parameter whose
  presence picks the module;
- `fromParams(params, queryTracker?)` — a uniform constructor over values
  keyed by parameter name.

The declaration rides on the *module*, not on `NeighborhoodDb`: parameters
exist to construct the db, so by the time an instance exists they're spent.
And because it's a pair of optional exports rather than a required
interface, a module that ignores all of this still works everywhere it works
today — the "optional `NeighborhoodParmsDb`" choice, without a new interface
to implement.

`paramsToCommandLineArgs()` translates specs into
[`command-line-args`](https://www.npmjs.com/package/command-line-args)
option definitions, and doubles as the measurement the two vocabularies were
compared by. What survives the round trip: names, descriptions, the scalar
types, arrays, defaults, enums. OpenAPI says things `command-line-args`
can't (`format`, `items.contentMediaType` — how "filenames paired with media
types" is declared: one array-of-files parameter per media type — and
`required`, which the host must enforce); `command-line-args` says things
OpenAPI can't (`alias`, `defaultOption`, `lazyMultiple`, `group`), which is
why `DbParamSpec` carries a `cli` hint rather than pretending OpenAPI covers
a command line. `bin/validate` in [`@shexjs/cli`](../shex-cli#readme)
appends the declared options of its registered modules (`--endpoint …`,
`--wikidata …`) and constructs whichever module's selector appears.

## a module's own language-sensitive editor (STRAWMAN)

A host with editors shows the text that selects and configures a
neighborhood. In the WebApp that text is the data pane, where
`# Endpoint: <url>` has long meant "query this rather than parsing me".
Which language that text is in is the module's business, not the host's — so
a module may also export:

- `claimPaneText(text)` — do I serve this pane, and with what parameters?
  (returns a parameter bag, or `null` to pass). A host tries its modules in
  order and lists its catch-all — rdfjs, which parses the text as data —
  last. `claimPane(modules, text)` does the walk.
- `paneEditor: ParamEditor` — how that text should be edited.

**A `ParamEditor` describes a language; it does not implement one.** Whole
document `tokens(text)`, `lint(text)`, `complete(text, pos, ctx)` — plain
data over plain strings, no editor library, no DOM, nothing to import, and
unit-testable without either. That is what keeps `getNeighborhood` the only
obligation: a module never has to ship a javascript LSE.

The members compose. A module whose pane is mostly an RDF document with a
header line of its own says `language: "turtle"` for the body and describes
just the header; the host overlays the module's tokens and diagnostics on
the grammar it named. `complete` receives an `EditorContext` carrying the
live db, which is how a completion no host could compute gets made — the
wikidata module completes entity IRIs from the labels of the pages its db
has actually loaded.

**The fallback is the textarea.** A module that describes no language gets
`makePaneIfDescribed` → `null`, and the textarea stays exactly as the app
shows it with the editors switched off.

## loading a neighborhood module into the WebApp (STRAWMAN)

The WebApp wants more from a db than `getNeighborhood`: focus-node
typeahead, display labels. `NeighborhoodWebAppDb` extends `NeighborhoodDb`
with only *optional* affordances (`suggestFocusNodes`, `labelOf`) — the app
feature-tests and falls back to its generic UI, and a plain
`NeighborhoodDb` loads fine. The shape-map's focus-node menu asks
`suggestFocusNodes` first, because a db knows what its nodes are where the
app can only guess from whatever triples are loaded (over the wikidata
neighborhood, guessing offers statement and value nodes alongside the
entities anyone would actually validate). Construction is covered by
`dbParams`/`fromParams` above, rendered as a form rather than command line
options.

All names and shapes here are negotiable; this is a strawman to refine.


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
!- [`@shexjs/eval-simple-1err`](../eval-simple-1err#readme) -- Implementation of [`@shexjs/eval-validator-api`](../eval-validator-api#readme) which reports only one error.
- [`@shexjs/eval-threaded-nerr`](../eval-threaded-nerr#readme) -- Implementation of [`@shexjs/eval-validator-api`](../eval-validator-api#readme) which exhaustively enumerate combinations of ways the data fails to satisfy a shape's expression.
- [`@shexjs/loader`](../shex-loader#readme) -- an API for loading and using ShEx schemas
- [`@shexjs/node`](../shex-node#readme) -- additional API functionality for a node environment
- [`@shexjs/cli`](../shex-cli#readme) -- a set of command line tools for transformaing and validating with schemas
- [`@shexjs/webapp`](../shex-webapp#readme) -- the shex-simple WEBApp
- [`@shexjs/shape-path-query`](../shex-shape-path-query#readme) -- traverse ShEx schemas with a path language
- [`@shexjs/extension-test`](../extension-test#readme) -- a small language for testing semantic actions in ShEx implementations ([more](http://shex.io/extensions/Test/))
- [`@shexjs/extension-map`](../extension-map#readme) -- an extension for transforming data from one schema to another ([more](http://shex.io/extensions/Map/))
- [`@shexjs/extension-eval`](../extension-eval#readme) -- simple extension which evaluates Javascript semantic action code ([more](http://shex.io/extensions/Eval/))

