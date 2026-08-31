# @shexjs/neighborhood-api

[![npm version](https://img.shields.io/npm/v/@shexjs/neighborhood-api)](https://www.npmjs.com/package/@shexjs/neighborhood-api)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

API called by [`@shexjs/validator`](../shex-validator#readme) to get a neighborhood (arcs in and out of a node)

## Install

``` shell
npm install @shexjs/neighborhood-api
```

## declaring a DB's construction parameters (STRAWMAN)

Each neighborhood implementation needs different things to come to life — an
rdfjs store wants files (with media types), a SPARQL db wants an endpoint and
query-strategy flags, a Wikibase db wants the page base it appends entity ids
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
`--wikibase …`) and constructs whichever module's selector appears.

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
Wikibase module completes entity IRIs from the labels of the pages its db
has actually loaded.

**The fallback is the textarea.** A module that describes no language gets
`makePaneIfDescribed` → `null`, and the textarea stays exactly as the app
shows it with the editors switched off.

`supplied` is called *with* the text to describe, never left to read it
back: which language a pane is in can change with a keystroke, and a host
reading the text from its own cache would be describing the document as it
was before the edit — the pane's textarea proxy still reports the old text
while the transaction that changes it is being applied.

## query map extensions (STRAWMAN)

A shape map may pick its focus nodes by asking rather than by naming them:

```
SPARQL "SELECT ?item WHERE { ?item wdt:P31 wd:Q5 } LIMIT 10"@START
QENTITIES "42 76"@START
```

Which questions can be asked is not a property of the shape map language but
of **where the data comes from** — only a query service can run a SPARQL
query, only a Wikibase knows what an entity id means. So a module declares
`queryMapResolvers: QueryMapResolver[]`, each with the extension's `language`
IRI, the `name` a shape map writes, and `resolve(lexical, db)` returning the
focus nodes. `queryMapResolverFor(module, language)` finds one;
`extensionIri(name)`/`extensionName(iri)` convert between the two spellings
(the shape-map grammar reads any bare `NAME "…"` as
`http://www.w3.org/ns/shex#Extensions-<name lowercased>`, of which SPARQL's
long-standing IRI is an instance).

A host that finds no resolver can then say *which* source doesn't understand
the extension — "the QueryMap extension QENTITIES is not supported by the
neighborhood sparql" — rather than reporting a syntax error, or running the
question against something that was never configured. That last one was a
real bug: `SPARQL "…"` used to be resolved against an endpoint the app kept
beside the data pane, which by then might be nobody's endpoint at all.

Resolvers are synchronous, like the db they are handed.

## loading a neighborhood module into the WebApp (STRAWMAN)

The WebApp wants more from a db than `getNeighborhood`: focus-node
typeahead, display labels. `NeighborhoodWebAppDb` extends `NeighborhoodDb`
with only *optional* affordances (`suggestFocusNodes`, `labelOf`) — the app
feature-tests and falls back to its generic UI, and a plain
`NeighborhoodDb` loads fine. The shape-map's focus-node menu asks
`suggestFocusNodes` first, because a db knows what its nodes are where the
app can only guess from whatever triples are loaded (over the Wikibase
neighborhood, guessing offers statement and value nodes alongside the
entities anyone would actually validate). Construction is covered by
`dbParams`/`fromParams` above, rendered as a form rather than command line
options.

The WebApp puts these together: a **data source** picklist in the title bar
lists the modules it loaded, and `#inputData` shows a tab set — the source's
settings in the leftmost pane, one tab per document it takes to their right,
the same shape the shape map's tabs have. Where the data comes from is a
choice, not a guess read out of the pane's text.

A host may add settings of its own to that pane for things the module
declares no parameter for because the *host* carries them out. The WebApp
adds one: `slurp`, which records the triples a validation fetched into the
local store's Turtle document, so switching the picklist to Turtle
afterwards validates the same data without the service. It is offered only
for a source that fetches.

All names and shapes here are negotiable; this is a strawman to refine.
Known limits of this round: one data source at a time, and a permalink
carries only the document showing (`data=`) — a second `data` document
survives a manifest entry but not a permalink. A parameter's *name* is
shared by convention (`data`, `endpoint`), but its *value* belongs to the
source that asked for it: `data` is a graph to one source and an entity page
to another, and neither wants the other's document.

---

`@shexjs/neighborhood-api` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
