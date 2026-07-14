# Language-aware editors for the ShEx / ShExMap web apps — implementation plan

> **Status (2026-07-14): phases 0–3 implemented** behind `?editors=1`.
> - Parser: `tripleConstraint` productions record identity-keyed ranges in
>   `schema._exprLocations`; `_sourceMap` reference ranges now cover the whole
>   `@<ref>` (they used to point at the lookahead token).
> - `@shexjs/editor-services`: `parseShExC` / `locateInParsed` / `parseTurtle`
>   (millan `github:ericprud/millan#rdfjs-interface`) / `mapValidationErrors`,
>   plus `editor-panes` (CodeMirror 6 glue: textarea-proxy panes, stream-ShExC
>   mode, lint sources, highlight API). 11 tests, including the end-to-end
>   both-panes error-anchoring case.
> - Web apps: `EditorSupport` in ShExBaseApp (schema+data panes, live parse
>   diagnostics, validation-error mapping via the results renderer, shape
>   hover on `.inputShape`/`.shapeMap .schema`); ShExMapBaseApp adds
>   bindings/statics (JSON) and outputSchema (ShExC) panes. Bundles rebuilt
>   (~+0.9 MB unminified for CM6+chevrotain).
> - Not yet: worker-app error mapping (identity loss over postMessage),
>   `RdfJsDb(MillanDataset)` single-parse, Lezer/tree-sitter mode,
>   autocomplete, materialization-failure anchoring in the outputSchema pane
>   (phase 4 items below).
> - **Needs manual browser testing**: jsdom verifies the proxy contract and
>   services, but nobody has clicked `?editors=1` in a real browser yet.
>   `npm run serve` (the zero-dependency `shex-serve` in `@shexjs/webapp`)
>   serves the repo root and prints the `?editors=1` URLs.
> - `@shexjs/editor-services` is TypeScript (`src/*.ts` → committed `lib/`,
>   built by `npm run compile` / per-package `npm run build`), as is
>   `shex-serve`.
> - Editors are a Menu → "user interface" select (`editors=` in permalinks)
>   and toggle live: panes tear down back to the plain textareas with the
>   current text, for comparing behaviors. Panes dispatch synthetic `keyup`
>   (not just `change`) so the caches' typing-based dirty-tracking sees
>   editor edits -- without it, validate re-used the previously parsed text
>   while the live lint squiggles (which read the editor document directly)
>   stayed current.

Goal: replace the plain textareas (schema and data in shex-simple; bindings,
statics and output schema in shexmap-simple) with language-sensitive editors
that can

1. highlight the shape declaration corresponding to a shape-map node (and
   vice versa), and
2. highlight validation errors **in both panes with precise ranges** — e.g.
   "schema says `<p>` should be an `@<foo>`" anchors on that triple
   constraint in the schema editor *and* on the offending triple in the data
   editor.

## The core insight: the editor doesn't need to understand the languages

The instinct that deep parser↔editor integration might not be necessary is
right. Modern editors (CodeMirror 6 here) separate three concerns:

- **Syntax colors** come from a tokenizer — approximate is fine, it's
  cosmetic.
- **Diagnostics** (squiggles, gutter markers) are just `{from, to, severity,
  message}` ranges pushed from outside.
- **Decorations** (our shape/error highlights) are arbitrary ranges with CSS
  classes, also pushed from outside.

So millan and the ts-jison ShExC parser never talk to CodeMirror directly;
they run exactly as they do today (on the cache-refresh path), and a thin
adapter converts their ranges into diagnostics/decorations. No Lezer grammar,
no language server protocol, no editor plugins to write beyond ~200 lines of
glue.

## What prototyping established (2026-07-14)

### Schema side: the ShExC parser already half-does this

`packages/shex-parser` (ts-jison) **already exposes source locations** — no
ts-jison changes were needed to get:

```js
const schema = ShExParser.construct(base, {}, {index: true}).parse(text);
schema._locations
// { 'http://a.example/S': { filename, first_line: 4, first_column: 0,
//                           last_line: 7, last_column: 1 }, ... }
schema._sourceMap   // Map: shapeRef/tripleExprRef -> [yylloc, ...] per @<X> site
```

That is feature 1 (shape-map ↔ shape highlighting) essentially for free.

The machinery: the grammar brackets `shapeExprDecl` with a `mark` nonterminal
capturing `yy.lexer.yylloc`, and sprinkles `yy.addSourceMap(...)` on
reference productions. The ts-jison runtime also computes a merged location
(`yyval._$`) for *every* reduction, and its lexer supports a `ranges` option
(currently off) that adds character offsets alongside line/column.

**Interface work needed (the anticipated ts-jison/grammar tweaks):**

- Extend the `mark`/`addSourceMap` pattern to `tripleConstraint`,
  `shapeAtom`/node constraints and value sets, storing ranges in an
  identity-keyed `Map`/`WeakMap` (obj → range) exposed as
  `schema._exprLocations`. Pure grammar edits + `npm run parser-all`; the
  per-reduction `@$` locations mean no ts-jison core changes, unless we want
  character offsets natively — then it's one lexer `ranges` option (check
  whether the generated `ShExJison.js` honors it; if not, *that's* the
  ts-jison patch). Line/col→offset conversion is otherwise a trivial helper
  against the editor document.
- Surface parse errors structurally: ts-jison's `parseError(str, hash)`
  carries `{line, loc, expected, token}`; the wrapper currently throws a
  string-formatted Error. Attach `hash` to the thrown error so the editor
  gets a range instead of regexing the message.

**Why identity-keyed maps work end-to-end:** validation errors reference the
schema objects *by reference*. Verified in
`packages/shex-validator/lib/shex-validator.js`:

```js
{ type: "TypeMismatch",
  triple: { type: "TestedTriple", subject, predicate, object },  // LD terms
  constraint: misses.get(t).constraint,   // <-- the parser's own TC object
  errors: [...] }
```

`constraint` → `_exprLocations.get(constraint)` → schema range. Done.

### Data side: millan's `rdfjs-interface` branch is purpose-built

`../../ericprud/millan` (branch `rdfjs-interface`, commit b50f0be "Add RDF/JS
adapter with source-location provenance") provides:

```js
const {dataset, errors, semanticErrors, emitterErrors} =
  millan.rdfjs.parseTurtleToRdfjs(text, {baseIRI, sourceURL});
```

- RDF/JS Data-Model terms/quads whose `equals()` is spec-conformant while
  each instance carries `source: {startOffset, endOffset, startLine,
  startColumn, endLine, endColumn, sourceURL}`.
- **Error-tolerant**: a doc with a syntax error still yielded all 4 parseable
  quads in the prototype, plus a positioned recognition error — so
  diagnostics and validation stay live while the user types.
- Term-level ranges: a `TypeMismatch` on a literal's datatype can highlight
  just the object (`quad.object.source`), and a Literal's datatype NamedNode
  covers `^^`+IRI.
- `MillanDataset` is a DatasetCore-style multiset: `match(s, p, o)` finds the
  quad(s) for a validation error's `TestedTriple`, `occurrences(quad)` every
  assertion site.

Prototype output (`scratchpad/millan-proto.js`):

```
L4:8-L4:21 [85-98] http://a.example/x :p "not a number" (object @ [85-98])
...
=== parse errors (tolerant): 1
```

Branch polish list found while prototyping:
- `dataset.occurrences(quad)` returned locations with null offsets — small
  bug to fix upstream.
- `dist/` bundles predate the rdfjs module — rebuild (and export `rdfjs` from
  the browser bundle) before shex.js can consume it.
- Decide delivery: publish the fork (e.g. `@shexjs/millan`) vs vendor the
  compiled `rdfjs` module into shex.js until an upstream PR lands. Publishing
  the fork is cleaner; the fork already carries RDF 1.2 grammar updates.

### Editor: CodeMirror 6, delivered through the existing webpack bundles

- The webapps are jQuery pages loading committed webpack bundles — CM6 (ESM)
  slots into those bundles as a new `ShExEditors` global; no page
  restructuring.
- Language support: Turtle exists in `@codemirror/legacy-modes`; JSON (for
  the ShExMap bindings/statics panes) in `@codemirror/lang-json`; ShExC needs
  a hand-written `StreamLanguage` tokenizer (~150 lines — keywords, IRIs,
  prefixed names, strings, comments, cardinalities). Precision comes from
  parser-driven diagnostics, not the tokenizer.
  `../../ericprud/tree-sitter-shexc` is an asset for a later exact-grammar
  port (tree-sitter → Lezer is mechanical-ish), not a prerequisite.
- The apps' `InterfaceCache` touches its textarea through a tiny surface
  (`selection.val()`, `.val(v)`, change events — see
  `packages/shex-webapp/doc/ShExBaseApp.js:37`). An `EditorPane` adapter
  implementing that same surface over an `EditorView` swaps in per-pane,
  keeping every cache/manifest/permalink behavior; textareas stay as the
  no-JS/webdriver fallback behind a query flag while stabilizing.

## Architecture

```
             ┌────────────────────────────────────────────────────┐
             │ @shexjs/editor-services (new package, node+browser) │
             │                                                    │
 ShExC text ─┤ shexc.parse(text, base)                            │
             │   → {schema, diagnostics[], locate: {              │
             │       shape(label), expr(obj), ref(label)}}        │
 Turtle text ┤ turtle.parse(text, base)   [millan rdfjs]          │
             │   → {dataset, diagnostics[]}                       │
             │ mapErrors(valResult, schemaLocate, dataset)        │
             │   → {schemaDiagnostics[], dataDiagnostics[],       │
             │      pairs[]}   // paired ids for cross-pane flash │
             └────────────────────────────────────────────────────┘
                      ↑ ranges                      ↓ diagnostics/decorations
        ShExParser/_locations/_exprLocations   CodeMirror 6 EditorPanes
        millan quad/term .source               (schema, data, bindings, outSchema)
```

`mapErrors` walks the validation Failure structure (c.f.
`ShExUtil.errsToSimple` for the traversal patterns), resolving:
- `constraint`/shapeExpr objects → schema ranges (identity map),
- `TestedTriple` LD terms → `dataset.match(...)` → quad/term `source`,
- shape labels (`MissingProperty` etc. carry only IRIs) → `_locations` fallback,
- each schema/data pair shares an id so hovering one flashes the other.

## Phases

**Phase 0 — editors in, behavior unchanged** (spike)
CM6 `EditorPane` adapter behind `?editors=1` in shex-simple: schema + data
panes with Turtle/stream-ShExC modes, JSON panes in shexmap-simple. All
existing tests must stay green (browser tests drive the textarea path; add a
jsdom test for the adapter contract).

**Phase 1 — shape-map ↔ shape highlighting** (uses today's parser output)
Expose `_locations`/`_sourceMap` through `SchemaCache`; hover/select on a
fixed-shape-map entry decorates the shape's declaration range; clicking a
shape decoration filters/scrolls the shape map. No grammar changes.

**Phase 2 — live parse diagnostics**
Data pane parses with millan in parallel with N3 (validation path untouched);
millan + structural ShExC parse errors become linter diagnostics in both
panes. Debounced on-change parsing; millan's error tolerance keeps stale
highlights minimal.

**Phase 3 — validation-error mapping** (the headline)
Grammar work for `_exprLocations` (+ optional lexer `ranges`); implement
`mapErrors`; validate → paired squiggles: the failing `TripleConstraint` in
the schema pane, the offending triple/term in the data pane, hover text from
`errsToSimple`. ShExMap: `MaterializationError.failures` reference TCs by
identity too, so the output-schema pane gets the same treatment for
materialization failures.

**Phase 4 — consolidation & polish**
- `RdfJsDb(millanDataset)` directly (drop the double parse) once
  `@shexjs/neighborhood-rdfjs`'s needs (match/getQuads/size) are verified
  against `MillanDataset`.
- Worker-app wrinkle: structured clone breaks object identity, so `mapErrors`
  must run **worker-side** (ship ranges, not object refs) or match
  constraints structurally; main-thread app has no such problem — do it
  first.
- Autocomplete (prefixes, shape labels from `_index`, predicates from the
  data), hover tooltips, Lezer/tree-sitter ShExC mode, shape-map text as a
  third managed editor (its parser is ts-jison too and can grow the same
  `_locations`).

## Risks / open questions

- **Bundle size**: chevrotain+turtle ≈ 250 KB min, CM6 core+modes ≈ 400 KB
  min, against today's 1.27 MB shexmap bundle — acceptable, but import millan
  from source paths so webpack tree-shakes sparql/graphql/etc.
- **yylloc conventions**: jison lines are 1-based, columns 0-based; write the
  line/col→offset helper once, with tests.
- **Error-object identity audit**: TypeMismatch verified; sweep the other
  error constructors (ClosedShapeViolation, NodeConstraintViolation,
  SemActFailure...) for cloned-vs-referenced schema objects before relying on
  the WeakMap everywhere.
- **millan fork logistics**: publish name, rebuild cadence, and the
  `occurrences()` offsets bug.
- ShExR (schema-as-RDF) and DCTAP inputs bypass ShExC locations — degrade
  gracefully (label-level highlights only).

## Prototype artifacts

- `shex-locations-proto.js` — dumps `_locations`/`_sourceMap` from today's
  parser (run against the repo as-is).
- `millan-proto.js` — millan `rdfjs` parse with ranges, error tolerance, and
  quad lookup (build the branch with `tsc --module commonjs` until dist is
  refreshed).

Both currently live outside the repo (session scratchpad); re-run or promote
into `test/` fixtures during Phase 0.
