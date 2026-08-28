# Plan

One list of what is still to do, organized to be picked up and executed.
Nothing here is done; done work is described in the design notes below,
which also hold the rationale each section links to.  Sizes: **S** ≈ an
hour, **M** ≈ a day, **L** = multi-day, or wants a design conversation
first.  Items are numbered so a commit or a conversation can name one.

## How to work in this repo (read first)

- Full check: `PATH="$PWD/node_modules/.bin:$PATH" TEST_browser=true
  TEST_cli=true TEST_server=true npx mocha packages/*/test/*test.js -C -R dot`
  (`npm run test-all` adds `TEST_sparql`/`TEST_wikidata`, which need the
  network).  The pre-commit hook runs the *ungated* suite; the gates hide
  their own fixtures, so a green ungated run says less than it looks.
- TypeScript packages compile per package: `cd packages/<p> && npx tsc`.
  The compiled `lib/` is committed, so a source change is a `lib/` change
  in the same commit.
- The browser bundles in `packages/*/doc/webpacks/` are **gitignored and
  built on demand**: `npm run webpack` (all three) or `npm run webpacks-all`
  (n3js too).  Rebuild after changing any bundled package, or the browser
  tests run stale code.  `doc/*.js` app files (ShExBaseApp.js and friends)
  are served raw, not bundled.
- `doc/tests-manifest.yaml` is generated: `node tools/aggregate-manifests.js`
  after editing any of the three package manifests (a test checks it).
  `manifest.json` and `manifest.yaml` must stay deep-equal where both exist.
- jsdom smoke tests (`TEST_browser=true`) drive the real pages: prefixed
  names in fixtures (relative IRIs resolve against the page URL); drive a
  click, then `await shared.promise`; the app refuses a second validate
  within 100 ms of a failure ("see shape map errors above"); gutter
  breakpoints are line-granular.
- ShExC gotcha: cardinality precedes semActs (`:p . ? %Map:{ :v %}`).
- CLIs: `--help`/usage exits 1; a status-0 run leaves stderr empty.
- HTTP test fixtures serve on literal `127.0.0.1`, never `localhost`.
- Commits end with a `Co-Authored-By:` trailer for the model.

## Design notes

| note | about | where it stands |
| --- | --- | --- |
| [plugins.md](plugins.md) | the plugin contract | normative; keep current |
| [extension-ui-plan.md](extension-ui-plan.md) | how ShExMap became a plugin; screens | history: every phase done; leftovers in §C |
| [editor-integration-plan.md](editor-integration-plan.md) | editors, source ranges, error anchoring | phases 0–4 done; leftovers in §D |
| [debugger-design.md](debugger-design.md) | stepping, breakpoints, capture + replay | phases 1–5 and half of 6 done; leftovers in §E |
| [error-reporting.md](error-reporting.md), [error-normalization.md](error-normalization.md), [error-reporting-comparison.md](error-reporting-comparison.md) | structured errors, repairs | F0–F6 done and merged; one decision left, §G |
| [../packages/extension-map/doc/threaded-materializer.md](../packages/extension-map/doc/threaded-materializer.md) | the NFA materializer | design; leftovers in §F |

## A. Start here: small and independent

Each is an hour or so and touches nothing another item depends on.

- **A1 (S)** Retire the raw-source loader path.  The `<!-- #else -->`
  blocks in `shex-simple.html` / `shex-worker.html` name per-package
  browserify bundles that no longer exist; with them go
  `packages/shex-webapp/doc/require.js`, `tools/browserify-all.js` and its
  npm script, the eleven per-package `"browser": "browserify …"` scripts,
  and the `browserify`/`uglify-js` devDependencies.  webpack is the bundler.
- **A2 (S)** One `graphEquals` (copied in `Map-test.js` and
  `ThreadedMaterializer-test.js`) and a documented `tools/testServer.js`
  nock/real-server split.
- **A3 (S)** `bin/validate --extension` takes bare package names
  (`LoadExtensions` takes file globs only).
- **A4 (S)** `shex-serve` content negotiation honours q-values (substring
  matching today).
- **A5 (S)** An ordered publish script: `npm publish --workspaces` is not
  topological, so there is a window of unsatisfiable ranges.
- **A6 (S)** One copy of ShExR.shex.  `packages/shex-webapp/doc/ShExRSchema.js`
  (a JS string), `packages/shex-cli/lib/ShExR.cjs.js` and
  `packages/extension-reduce/examples/shexr/ShExR.shex` are three copies of
  shexTest's `doc/ShExR.shex`; keep the `.shex` (a test already checks it
  against the spec's) and generate or load the other two from it.
- **A7 (decision)** The old spellings — `?extension=`, `?extensionURL=`,
  `extensions:` on a manifest entry, the `ShExExtensions` global — are
  five lines of alias kept for links written before the rename.  With no
  other users of the app yet, they can go (and plugins.md's paragraph with
  them).

## B. Web app: the factoring plan

`packages/shex-webapp/doc/ShExBaseApp.js` is 6,140 lines of classic-script
JavaScript: 16 classes, an 83-method `ShExBaseApp`, 223 `$("#…")`
selectors over 62 ids.  The plugin work exposed its seams; cut along them.

- **B1 (M) Split ShExBaseApp.js**, mechanically and without behaviour
  change, into files the pages load in order: the caches
  (`InterfaceCache` … `ShapeMapCache`, a model layer); `PluginHost`
  (`applyPlugin`/`unloadPlugin`, screens, results tabs, `linkPanes` — the
  code that implements plugins.md); permalink/manifest/gist (`Getables`,
  `QueryParams`); validation running (`callValidator`, `getValidator`,
  reporting) with `NeighborhoodConfig`; `EditorSupport` and layout.
  Done when no file is over ~1,500 lines and every suite is green unchanged.
- **B2 (M) One jsdom harness.**  Each of the eight browser suites boots the
  page with its own copy of the same ~40 lines (JSDOM options, `CSS.escape`
  shim, `Range` stubs, `_testCallback`), and the copies have drifted.
  `packages/shex-webapp/test/harness.js`: `boot(page, search, {worker})` →
  `{dom, $, shared, open(schemaLabel, dataLabel), validate()}`;
  `fakeWorker.js` is the precedent.  Pair with D4.
- **B3 (S–M) One manifest-entry runner** for node: `examples-test.js`,
  `extension-reduce/test/Examples-test.js`, `Map-test.js` and
  `tools/aggregate-manifests.js` each interpret entries their own way.
- **B4 (M) `app.settled()`** — replace the `SharedForTests.promise = …`
  assignments scattered through ~10 handlers with one promise registered at
  the dispatch level; a click a test author forgot to instrument then
  cannot hang a test.  Done when tests await it and the global is a thin
  alias or gone.
- **B5 (M–L) One worker task.**  `DirectShExValidator`/`RemoteShExValidator`
  (app) and `DirectShExMaterializer`/`RemoteShExMaterializer` (map plugin)
  are the same shape — run here or in the worker, relay progress, parse
  results — over `ShExWorkerThread.js` + `RemoteShExValidator.js` +
  `WorkerMarshalling.js`.  The plugin `requests:` hook already
  half-generalizes it.
- **B6 (S–M) One app page.**  `shex-worker.html` differs from
  `shex-simple.html` by 28 lines; make it `?worker=` or a redirect, as the
  ShExMap pages became.
- **B7 (M) Plugin packaging** (extension-ui-plan phase 3's leftover).
  `ShExMapPlugin.js` (1,423 lines) as a built bundle; plugin file + bundle
  entry + webpack config out of the library packages, so
  `extension-reduce` stops depending on `@shexjs/webapp` and
  `extension-reduce-js` at runtime for its bundle's sake, `extension-map`
  sheds the app-era dependencies it carries (14 packages), and
  `shex-shape-path-query` stops depending on `extension-map`.
- **B8 (M) Neighborhoods registered like plugins.**  They are already
  descriptor-shaped (`name/label/capabilities/dbParams/fromParams/…`) but
  hard-wired in `shex-webapp.js`.
- **B9 (L) TypeScript for the app** — after B1, one file at a time through
  `src/` and the existing webpack path (`shex-webapp/src` holds only
  `shex-serve` today).  Same for `shex-cli/bin/validate` (1,448 lines of
  JS) and `extension-wasi*`, the last JS-only packages.
- **B10 (decision)** Committed `lib/` + `.map`: every source change doubles
  its diff.  Build in CI/prepublish instead, or at least stop committing
  `.map`.

## C. Plugins: what the UI plan left open

- **C1 (S, external)** Publish the skeleton (`doc/plugin-skeleton/`) as a
  repository of its own.
- **C2 (decision)** A trust prompt for off-origin plugins — above all a
  manifest fetched by `?manifestURL=` whose entries name plugins.
  Recommendation in extension-ui-plan §7: ask once per session before the
  first plugin from another origin; same-origin stays silent.
- **C3 (decision)** Should the map redirects open on ShExMap's screen?
  Recommendation: no; a link can say `&screen=`.
- **C4 (decision)** Panes share a column unless `panel:` says otherwise.
  Recommendation: keep.
- **C5 (note)** The worker is classic; an ESM worker (`type: "module"`)
  would need a different loader.  Not now.

## D. Editors

- **D1 (M)** `#textMap` as a third managed editor (the ShapeMap parser is
  ts-jison and can grow `_locations`).
- **D2 (S)** Hover tooltips showing the constraint's text over its
  data-side counterpart (highlights only, today).
- **D3 (S)** Autocomplete: fall back to the live linter's last parse for
  labels not yet in `cache.parsed`; tune eagerness after real use.
- **D4 (S–M)** A fail-on-unexpected-console-error option in the smoke
  harness (whitelist jsdom/CM6 `getClientRects` noise).  Build into B2.
- **D5 (M)** ShExR and DCTAP inputs bypass ShExC locations; synthesize
  locations from the generated ShExC.
- **D6 (varies) millan upstream** (`github:ericprud/millan#rdfjs-interface`):
  subject `source` ranges include a trailing whitespace character
  (`trimRange` works around it); a publish plan (`@shexjs/millan`?);
  `RdfJsDb(MillanDataset)` as the validation store — blocked on the apps'
  N3-specific surface (`getQuads`/`removeQuad` in proof-graph, remainder
  and slurp) and on N3 dropping term `source`s when quads are copied in.
- **D7 (L)** tree-sitter-shexc (or a Lezer port) for exact incremental
  highlighting and error-tolerant parsing; `../../ericprud/tree-sitter-shexc`
  is the asset.  Talk to Eric first — he maintains the grammar.
- **D8 (S, upstream)** ts-jison's empty-production location wart is dodged
  per production (`senseFlags` anchor); skipping empty productions when
  merging `@$` would clean it up.
- **D9 (S)** `memoLast` keys for `parseShExC`/`parseTurtle` ignore
  `prefixes`/`schemaOptions` — fine for today's callers; key them or
  document the edge.

## E. Debugger

Short, high value:

- **E1 (M)** Capture with the user's selected engine.
  `startValidationDebugSession` forces `eval-simple-1err`
  (`ShExBaseApp.js`, `capturingRegexModule(ShExWebApp["eval-simple-1err"])`);
  capture with `ShExWebApp[$("#regexpEngine").val()]` and compile a fresh
  eval-simple-1err stepper per captured shape for replay, saying in
  `#valDbgStatus` when the replay engine differs.  Done when the smoke test
  passes with `#regexpEngine` on eval-threaded-nerr before clicking 🐞.
- **E2 (M)** Highlight a thread's matched partition in the data pane
  (`previewValThread` renders it as text; use the millan ranges the
  error anchoring uses).
- **E3 (S)** Side-effect-free replay: a recording `semActHandler` shim
  beside `capturingRegexModule` (`eval-validator-api`), so replay returns
  the recorded `SemActFailure[]` instead of re-dispatching.
- **E4 (M)** Web UI for node/predicate breakpoints (the CLIs' `bn`/`bp`) and
  a rendered call-stack/binding-frame snapshot (`bindingsToTable` renders
  frames) instead of the text status.
- **E5 (M)** Column-precise gutter breakpoints: a click resolves to the
  first constraint whose range starts on the line; offer a per-line picker
  or breakpoint-on-selection for one-line shapes.
- **E6 (M)** A common REPL skeleton for `ShExDebugRepl` (`shex-cli`) and
  `ShExMapDebugRepl` (`extension-map`) before a third debugger appears;
  both suites stay green unchanged.
- **E7 (S–M)** Richer `debugHooks`: thread/backtracking state and
  per-candidate pass/fail on `onConstraint`, plus an `onConstraintResult`.
- **E8 (S)** Formalize the validator `tracker` as the shape-level debug
  event source (payload types in `validator-api`, a doc section).

Larger, design conversation first:

- **E9 (L)** Live whole-validation stepping in the browser: validator in a
  Worker, events posted and `Atomics.wait` on a SharedArrayBuffer command
  cell (`shex-serve --coi` and clone-safe anchors are in place).  Decide
  breakpoints-frozen-at-start vs a side channel; CI needs a
  `worker_threads` harness.
- **E10 (L)** One debug panel over materialization and validation sessions.
- **E11 (M–L)** Worker-app debugging: `MaterializerDebugger` runs in-thread
  only; `accepts`, `lastReport` and breakpoints don't cross `postMessage`
  (ship clone-safe anchors and the accepts list, as validation does).
- **E12 (deferred)** A steppable eval-threaded-nerr is a rewrite (recursive
  matcher, hot-path generators); only when "why these N errors" becomes a
  debugging goal.

## F. Materializer (`ThreadedMaterializer`)

- **F1 (L)** PikeVM worklist dedup on (state, callStack, cursor); subsumes
  the post-accept `exploreSteps` budget that can settle for a suboptimal
  accept (`lastReport.explorationTruncated`).  The design note sketches it
  and the lazy-DFA beyond.
- **F2 (S–M)** Acceptance heuristic: weigh which bindings were forfeited,
  or shape coverage.  Alternatives are already offered to the user.
- **F3 (M)** Cycle guard in `_compileShapeExprNFA` for And/Or reference
  cycles; `ShapeNot` synthesis (clean error today).
- **F4 (S)** Static-only optional subshapes emit one island per repetition
  window; a "must consume ≥ 1 frame binding" mode.

## G. Errors and validation

- **G1 (decision)** Replace the classic errors with repairs once the
  repairs have been read in anger for a while, and rewrite the failure
  fixtures once (error-normalization §4, step 4).  Repairs are on by
  default everywhere now, so this is a question of use, not code.
- **G2 (S–M)** A closed-shape `ClosedShapeViolation` can carry a
  "remove it" repair — the arcs it complains about are in no bag, so the
  DP never sees them.
- **G3 (L)** Assignment when several constraints could take a triple
  (`EXTRA`, one predicate constrained twice): a min-cost bipartite
  assignment inside the repair DP.
- **G4 (verify)** `feasibility.ts` deliberately ignores the coupling of a
  repeated group with an unbounded inner cardinality; the matchers are
  fixed for it (`c018dc49`, `e526b191`, `c1ea5d18`) — check what the
  refutation layer still gets wrong there, if anything.
- **G5 (triage)** Old notes (formerly `TODO/notes`): is
  `<#Base> { <p1> [1]; <p1> [2] } <#Leaf> EXTENDS @<#Base> { <p1> [3] }`
  covered by `Extend3G-pass`?; two "should fail" CLI cases written in a
  ShEx-1-era `$:gn < $:fn` syntax, probably obsolete; "rename
  `ShEx{,C}Writer`" for a major.

## H. Data sources

- **H1 (upstream)** The SPARQL suite against a local QLever is blocked by a
  QLever query-planner blowup on `NOT EXISTS`; track upstream, keep the
  repro.

## I. Toolchain and repo hygiene

- **I1 (decision)** `perf/fhir/corpus/examples`: 2,172 tracked files,
  33 MB of an 82 MB pack.  git-lfs, a fetch script, or a fixture repo.
- **I2 (M)** `tools/makeMake.js` no longer generates the hand-amended
  `Makefile`; teach it the parser and TypeScript targets, or drop it.
- **I3 (on request)** Majors deliberately not taken: chai 5+, n3 2.x,
  eslint 10, jquery 4, node-fetch 3, koa 3, jsonld 9, glob 13, js-yaml 5,
  pre-commit→husky.  Remaining `npm audit` findings are in pre-commit's
  transitive chains.

## Decisions wanted

B10 (committed `lib/`), C2 (trust prompt), C3 (redirect screen), C4 (panel
default), G1 (repairs replace errors), I1 (the perf corpus).
