# Refinements backlog

Deferred improvements proposed along the way (editors, materializer,
toolchain).  Roughly grouped; items link to the docs that motivated them.

## Parsing / source ranges

- **tree-sitter-shexc (or a Lezer port of it) instead of the stream
  tokenizer** for exact, incremental ShExC highlighting in the editors —
  and potentially as an alternative range-bearing parser to
  `@shexjs/parser` for editor services (error-tolerant, incremental).
  The checkout at `../../ericprud/tree-sitter-shexc` is the starting
  asset; tree-sitter→Lezer grammar translation is mechanical-ish.
- `locate.constraint(shape, predicate)` returns the **first** constraint
  with that predicate — ambiguous for shapes with repeated predicates
  (e.g. `fhir:component` twice); could disambiguate by occurrence index or
  valueExpr comparison.
- ShExR and DCTAP schema inputs bypass ShExC source locations — editors
  degrade to label-level anchors; could synthesize locations from the
  generated ShExC.
- `memoLast` keys for `parseShExC`/`parseTurtle` ignore
  `prefixes`/`schemaOptions` (only text+base) — fine for current callers,
  documented sharp edge.
- jison's empty-production location wart is dodged per-production
  (senseFlags anchor in `tripleConstraint`); a general fix in ts-jison
  (skip empty productions when merging `@$`) would clean this up.

## millan (Eric's fork, `rdfjs-interface`)

- **Subject terms' `source` ranges include a trailing whitespace
  character** (object/predicate don't); editor-services trims defensively
  (`trimRange`) but the emitter fix belongs upstream.
- Publish plan for the fork (e.g. `@shexjs/millan`) vs the current
  `github:ericprud/millan#rdfjs-interface` dependency.
- `RdfJsDb(MillanDataset)` as the validation store (single parse, ranges
  everywhere): blocked on the apps' N3-specific API surface
  (`getQuads`/`removeQuad` in proof-graph, remainder and slurp flows) and
  on N3 internalization dropping term `source`s when quads are copied into
  an N3 Store.

## Editors / web apps

- Worker-app materialization: failures/reports cross `postMessage` without
  object identity — ship clone-safe anchors (ranges or
  `{shapeLabel, predicate}`) from the worker like validation does.
- Shape-map text (`#textMap`) as a third managed editor; the ShapeMap
  parser is ts-jison and can grow the same `_locations` treatment.
- Hover tooltips showing the constraint's text when hovering its data-side
  counterpart (currently only highlights).
- Autocomplete vocabulary reads `cache.parsed` — labels typed but not yet
  parsed (no validate/refresh) aren't offered; could fall back to the live
  linter's last parse.  Trigger eagerness (`activateOnTyping`, the
  `matchBefore` regex) may want tuning after real use.
- The raw-source (non-webpack) loader blocks in the html comments are
  stale (missing stringToRdfJs, rdf-data-factory, editor-services…) —
  either resurrect or remove them.
- `shex-serve` conneg is trivial substring matching on Accept (no
  q-values); fine for browsers, not spec-grade.
- Gutter breakpoints are line-granular: a click breaks on the *first*
  constraint whose range starts on that line; column-precise selection
  (or a per-line constraint picker) would matter for one-line shapes.
- Debug session UX: only the ShExMap output-schema pane takes breakpoints;
  node/predicate breakpoints (the CLIs' `bn`/`bp`) have no web UI yet, and
  the panel shows the thread snapshot as text — a rendered call
  stack/binding-frame table (bindingsToTable) is the designed endpoint.
- Debugging the *worker* variants (shexmap-simple-worker) is unsupported —
  MaterializerDebugger runs in-thread only; needs the clone-safe
  breakpoint anchors + a postMessage/Atomics gate.
- The smoke tests assert behavior but not console silence; a
  fail-on-unexpected-console-error harness option would have caught the
  NestedWriter fallback regression before CI did.

## Materializer (see also doc/threaded-materializer.md)

- PikeVM-style breadth-parallel stepping (dedupe on state+callStack+cursor)
  and the lazy-DFA/TDFA determinization sketched in the doc.
- `ShapeAnd`/`ShapeOr` compile support is prototype-grade: no cycle guard
  in `_compileShapeExprNFA` for And/Or reference cycles; `ShapeNot`
  synthesis unsupported.
- Static-only optional subshapes still emit one island per repetition
  window (the progress guard caps, not eliminates); a
  "must consume ≥1 frame binding" mode could tighten it.
- Debugger phases 5–6 (regex-engine `debugHooks` for TC-level validation
  events; browser validation debugging via worker + Atomics; a unified
  panel) per doc/debugger-design.md — phases 1–4 (MaterializerDebugger,
  `shexmap-debug`, the shexmap-simple 🐞 panel, `shex-debug`,
  `shex-serve --coi`) shipped.
- `ShExMapDebugRepl` and `ShExDebugRepl` share command grammar and
  prompt/IO plumbing by parallel construction; extract a common REPL
  skeleton before a third debugger appears.

## Validation engines

- `debugHooks.onConstraint` in `eval-threaded-nerr`/`eval-simple-1err` for
  constraint-level debug events (doc/debugger-design.md §4).
- Formalize the validator `tracker` as the shape-level debug event source.

## Toolchain / modernization leftovers

- Majors deliberately not taken: chai 5+/6 (ESM-only), n3 2.x (runtime
  API), lerna→changesets-style release automation (bumpVersions.js covers
  fixed-mode for now), eslint 10, jquery 4, node-fetch 3 (ESM-only),
  koa 3 / koa-body 8 / jsonld 9 / glob 13 / js-yaml 5 (package majors),
  pre-commit→husky.
- Remaining `npm audit` findings live in pre-commit's transitive chains.
- `npm publish --workspaces` doesn't order topologically (brief window of
  unsatisfiable ranges during publish); a small ordered-publish script
  would close it.
- `tools/makeMake.js` no longer generates the (hand-amended) Makefile;
  regenerate-ability could be restored by teaching it the parser and
  TypeScript targets.
- `bin/validate --extension` accepts only file-glob paths
  (`LoadExtensions`); accepting bare package names would read better in
  docs.
- Cli-test/browser-test infrastructure sharing (graphEquals is copied
  between test files; testServer's nock/real-server split could be a
  documented utility).
