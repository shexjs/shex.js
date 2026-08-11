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

## fields and panes (STRAWMAN)

A user picks a **data source** — which is what a neighborhood is from
outside — and the host draws whatever that source needs from its own
declarations. A parameter is either

- a value to type, rendered as a **field**, or
- one or more documents to edit, rendered as **panes** shown one at a time,
  declared by adding a `pane: PaneSpec` to the parameter.

`PaneSpec` says what to call a document (`label`), what language it is in
(`editor`), how many there may be (`min`/`max`/`creatable`), what a new one
starts as (`template`), and how to name its tab from its content
(`titleOf`). `paneParams(specs)` and `fieldParams(specs)` split them; `ui:
{hidden: true}` keeps a parameter out of a form where it can't mean anything
(a cache directory, in a browser).

So a SPARQL endpoint is all fields and no documents; a local store is one
mandatory Turtle document; a Wikibase is a growable set of entity pages —
each one an edit to try before making it, since a page supplied here is
believed in place of what the site serves.

A pane parameter's value is *document content*. A host that is given
references instead — a command line's filenames, a manifest's `dataURL` —
resolves them first (see `bin/validate`'s `makeQueryDb`).

`moduleId(module)` is how a module is named where a name must be short and
stable: a manifest entry's `neighborhood`, a permalink parameter, a
picklist's option value. Parameters are keyed by *meaning* rather than by
module, so `neighborhood=sparql&endpoint=…` reads the same in a permalink
and in a manifest entry, and two sources that both take an `endpoint` agree
about the word.

## a module's own language-sensitive editor (STRAWMAN)

Which language a document is in is the module's business, not the host's.
Besides a pane's `editor`, a module may export:

- `claimPaneText(text)` — does this text *name* me, and with what
  parameters? Not how a host picks a source — the user does that — but how
  text arriving from elsewhere says which one it wants: a permalink, a
  dropped file, or a pane saved back when `# Endpoint: <url>` at the top of
  the data was how you reached a query service. `claimPane(modules, text)`
  walks the list and returns null when nothing claims it, leaving the host
  with whatever source it was going to use.
- `paneEditor: ParamEditor` — for a host with a single pane and no notion of
  which parameter it holds.

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

`supplied` is called *with* the text to describe, never left to read it
back: which language a pane is in can change with a keystroke, and a host
reading the text from its own cache would be describing the document as it
was before the edit — the pane's textarea proxy still reports the old text
while the transaction that changes it is being applied.

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

The WebApp puts these together: a **data source** picklist in the title bar
lists the modules it loaded, and `#inputData` shows that source's fields and
its documents' tabs. Where the data comes from is a choice, not a guess
read out of the pane's text.

All names and shapes here are negotiable; this is a strawman to refine.
Known limits of this round: one data source at a time, and a permalink
carries only the document showing (`data=`) — a second `data` document
survives a manifest entry but not a permalink.


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

