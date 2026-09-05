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
  The compiled `lib/*.js` is **built, not committed** (B3): `npm run compile`
  (`make ALL`) builds every package in order, and the `prepare` script runs
  it on `npm install`/`npm ci`, so a source change is not also a `lib/`
  change to stage.  What stays tracked in `lib/` are the sources that live
  there: the `.jison` grammars, the `.wat`/`.wasm`, and shex-cli's three
  hand-written `.js` (no `src/` counterpart).
- The browser bundles in `packages/*/doc/webpacks/` are **gitignored and
  built on demand**: `npm run webpack` (all three) or `npm run webpacks-all`
  (n3js too).  Rebuild after changing any bundled package, or the browser
  tests run stale code.  The app's page scripts
  are TypeScript, `packages/shex-webapp/src/app/*.ts` compiled into `doc/`
  by `npm run build` there; served raw, not bundled.
- `doc/tests-manifest.yaml` is generated: `node tools/aggregate-manifests.js`
  after editing any of the three package manifests (a test checks it).
  `manifest.json` and `manifest.yaml` must stay deep-equal where both exist.
- jsdom smoke tests (`TEST_browser=true`) drive the real pages: prefixed
  names in fixtures (relative IRIs resolve against the page URL); drive a
  click, then `await shared.promise`; the app refuses a second validate
  within 100 ms of a failure ("see shape map errors above"); gutter
  breakpoints are line-granular; `Harness.expectClean(errors)` in an
  `after` fails on console errors the suite did not expect.
- ShExC gotcha: cardinality precedes semActs (`:p . ? %Map:{ :v %}`).
- CLIs: `--help`/usage exits 1; a status-0 run leaves stderr empty.
- HTTP test fixtures serve on literal `127.0.0.1`, never `localhost`.
- Commits end with a `Co-Authored-By:` trailer for the model.

## Design notes

| note | about | where it stands |
| --- | --- | --- |
| [plugins.md](plugins.md) | the plugin contract | normative; keep current |
| [editor-integration-plan.md](editor-integration-plan.md) | editors, source ranges, error anchoring | phases 0–4 done; leftovers in §D |
| [debugger-design.md](debugger-design.md) | stepping, breakpoints, capture + replay | phases 1–6 done (live worker-gate stepping + one unified panel); only E12 deferred |
| [error-reporting.md](error-reporting.md), [error-normalization.md](error-normalization.md), [error-reporting-comparison.md](error-reporting-comparison.md) | structured errors, repairs | F0–F6 done and merged; one decision left, §G |
| [../packages/extension-map/doc/threaded-materializer.md](../packages/extension-map/doc/threaded-materializer.md) | the NFA materializer | design; leftovers in §F |

## B. Web app

The split, the harness, the manifest runner, `app.settled()`, WorkerTask,
the one page, the dependency cleanup, plugin-borne data sources, the page
scripts' move to TypeScript and the untracked `.map`s are done (B1–B10,
2026-08-28).  What is left:

- **B1 (done 2026-08-29) The app's TypeScript, narrowed.**  Every class in
  `packages/shex-webapp/src/app/*.ts` declares its fields and takes typed
  parameters; the index signatures are gone (the few left are on
  interfaces for genuinely open records: a worker message's payload, a
  plugin descriptor's own keys); the mixin files declare what they add
  (`interface ShExBaseApp {…}` merged per file, `mixin()` typed with
  `ThisType`); `tsconfig.app.json` is `strict: true` with
  `useDefineForClassFields: false` (a declared field must not emit).
  `noImplicitThis` found three nested functions reading `this` as the
  app -- the drag-and-drop `inject`, the LOG_PROGRESS trace's `sm`, the
  shape-map menu's failure report -- each a TypeError waiting; fixed.
  Left `any`, honestly: what arrives through the bundles' globals.  `RdfJs`
  now types against `@rdfjs/types` (#453); the rest stay `any` -- jQuery,
  CodeMirror, marked, N3js and IRI are CDN-loaded with no `@types/*`, and
  `ShExWebApp` (the repo's own bundle) has no `types` entry -- narrowing them
  wants `@types/*` added and a `strict` cascade absorbed, deferred.
  `extension-wasi*` are TypeScript too (same day), and so is the CLI:
  `shex-cli/src/validate.ts` -> `lib/validate.js` behind a two-line
  `bin/validate` (`module: node16`, which keeps the script's native
  `import()`); `ShExUtil.warnDuplicates`, which did not exist, is
  `Merger.warnDuplicates` now, and `--invocation`/`--dry-run` have their
  help text back (`desc` was never read).  Nothing in the app or the CLI
  is JS by accident any more: the two worker threads and the vendored
  iri.js are, on purpose.
- **B2 (done 2026-08-29) Plugin packaging.**  `ShExMapPlugin.js` is
  built from `packages/extension-map/src/plugin/ShExMapPlugin.ts`
  (`tsconfig.plugin.json`, the app's page-script arrangement: classic
  script, declared fields, no index signatures; `npm run build` there
  compiles both the library and the plugin).  Not a webpack bundle, and
  not a package of its own -- decided (2026-08-29): the plugin has no
  dependencies to pack, `doc/webpacks/` is gitignored and CI-built so a
  bundled plugin would be missing from a fresh checkout, and a package
  move would change the `packages/extension-map/doc/` URLs the site and
  the permalinks use.  Revisit only if the plugin grows dependencies of
  its own.
- **B3 (done 2026-09-04) `lib/*.js` is built, not committed.**  A `prepare`
  script (`make ALL`) builds it on `npm install`/`npm ci`, and `ci.yml` runs
  `npm run compile` in the test, webpack and coverage jobs -- so a `src`
  change that stops compiling fails CI instead of passing on a stale
  committed `lib/`, and `lib/` is out of every diff.  It surfaced exactly
  that: a from-clean build caught neighborhood-wikibase no longer compiling
  under the `@rdfjs/types` 2 bump (fixed in the commit before).  `.gitignore`
  ignores `packages/*/lib/*.js` with three exceptions -- shex-cli's
  hand-written `ExitCode`/`ProgressLoadController`/`ShExDebugRepl` `.js`,
  which have no `src/`; the `.jison`, `.wat` and `.wasm` beside them are
  sources too and stay tracked.  Published tarballs are unaffected (`files`
  lists `lib`, and `prepare`/`prepublishOnly` build it before pack).  The
  `.map` files are untracked
  (`.gitignore`: `packages/*/lib/*.map`) and are not what debugging a
  minified bundle needs: that is the *bundle's* map, which webpack would
  write beside `doc/webpacks/*.min.js` (`devtool: "source-map"`, not set
  today) and chain back to the `.ts` through `source-map-loader` reading
  the `lib/*.js.map` tsc leaves on disk at bundle time -- present after
  `npm run build`, never committed.

## C. Plugins

The trust prompt for a plugin from another origin is in (C2, 2026-08-28;
plugins.md, "Trust"), and the two layout decisions are recorded there: a
link that names a plugin opens on the validator's screen unless it says
`screen=` (C3), and panes share a column unless `panel:` says otherwise
(C4).

- **C1 (closed 2026-09-04 — won't do)** Publishing the skeleton as a
  repository of its own buys nothing right now: it has no dependencies to
  pack, no consumer is waiting on an installable package (a plugin author
  copies `doc/plugin-skeleton/`, they don't `npm i` it), and a separate repo
  is standing overhead — a release to keep in step with the plugin contract
  in `plugins.md`.  `doc/plugin-skeleton/` stays in-tree as the worked
  reference (README + package.json, 2026-08-28); revisit only if someone
  actually needs to `npm create` a plugin.
- **C6 (done 2026-08-31) Eval and Test in the WebApp.**  Each has a
  plugin (`extension-eval/doc/ShExEvalPlugin.js`,
  `extension-test/doc/ShExTestPlugin.js`) -- one classic-script file with
  both faces: on the page it registers a descriptor whose `register`
  installs the handler, and, named as its own `worker`, the same file
  registers the same handler where a worker app's matcher is -- and an
  `examples/manifest.yaml` (pass and fail each), aggregated into
  doc/tests-manifest.yaml.  Loading either lib file directly as
  `?plugin=` still works (handler-only, no worker half).  Found on the
  way: the Eval extension's documented bool return was "unsupported
  response" against today's validator, untested since ever -- a bool is
  normalized now (lib and plugin), and extension-eval has tests.  The
  stale `@shexjs/util` dependencies (neither extension requires anything)
  are gone.
- **C7 (done 2026-08-31) WASI in the WebApp.**  A bundle
  (`extension-wasi/doc/webpacks/shexwasi-webapp.js`, wabt and both WASI
  extensions over the core bundle's global; `npm run webpack` builds it
  beside the others) and two dual-face plugins: `ShExWasiPlugin.js` (WAT
  semantic actions compiled by wabt in the page) and, in
  extension-wasi-test/doc, `ShExWasiTestPlugin.js` (the wasm Test module,
  its bytes fetched from lib/ and handed to `configure({wasm, stdout:
  false})` -- both options new: a browser has no file descriptors and no
  `__dirname`).  What it took: the prelude is a generated module
  (`tools/gen-prelude.js`, so no Fs in `prelude()`), the shim paths speak
  Uint8Array rather than Buffer, `WasmPath` is computed lazily (the
  bundle externalizes the node builtins to undefined, and a top-level
  `Path.join` was the whole bundle failing to evaluate), a plugin `init`
  may return a promise that rides `applied` (wabt and the wasm fetch
  finish before a manifest entry validates), and the repo test server
  read every file as utf8 -- a .wasm served as text is a CompileError.
  Each extension has a pass/fail manifest, aggregated (41 entries from 7
  manifests).  The worker race is closed too (same day): a worker plugin
  hands `registerWorkerPlugin` a `ready` promise -- wabt, the wasm fetch --
  and the worker thread awaits every plugin's `ready` before serving any
  request, as the page awaits `init` through `applied`.
- **C5 (note)** The worker is classic; an ESM worker (`type: "module"`)
  would need a different loader.  Not now.

## D. Editors

The query map is the third managed editor (D1: the shape-map grammar
records where each pair was written, `parseShapeMap` lints and locates it,
its pairs point at the schema and the data), hovers say what they point at
(D2, `HoverRegion.title`), completion reads the schema pane as it stands
(D3), the harness checks consoles (D4, `Harness.expectClean`), a ShExJ,
ShExR or DCTAP schema is located in the text it was written in (D5,
`synthesizeLocations`; `lintSchema` lints each in its own language), and
`parseShExC`/`parseTurtle` key their memo on every option (D9) -- all
2026-08-28.  millan (D6) had been superseded by lezer-turtle before this
list was written; the data pane's two parses (lezer for provenance, N3
for validation) are memoized and stay.

The schema pane parses ShExC with a Lezer grammar of its own (D7,
2026-08-29): `packages/lezer-shexc` ports the specification's grammar in
the LALR shape `ShExJison.jison` gives it, every schema in the ShEx test
suite parses without an error node, and a half-typed schema parses around
its error -- exact colours by role (a shape's label, a reference, a
predicate, a datatype), folding, bracket matching, incremental re-parse.
`@shexjs/parser` still makes the schema; the tree is the editor's.

ts-jison's empty-production location wart (D8) is fixed upstream and
published: `@ts-jison/parser` and `@ts-jison/common` 0.4.1-alpha.3
(ts-jison branch `empty-production-locations`, tag `v0.4.1-alpha.3`); the
parsers depend on it and `tripleConstraint` takes its merged `@$` as is
(2026-08-29).  Nothing is left in this section.

## E. Debugger

The capture is by the selected engine and the replay by eval-simple-1err's
stepper, the status saying so when they differ (E1), and a replay runs no
semantic action: they answer from what was recorded at capture (E3,
`recordingSemActHandler`/`replayingSemActHandler` in validator-api); the
validator's tracker is the typed shape-level event source (E8,
`ShapeDebugEvent`/`eventTracker`, which `shex-debug` rides); the regex
hooks say which thread asks and what came of each constraint (E7,
`ConstraintThreadView`, `onConstraintResult`); hovering a thread in the
web debugger lights its matched partition in the data pane (E2,
`quadRanges`); the web debugger takes `bp PREDICATE` and `bn NODE`
breakpoints as shex-debug does and shows a thread's state as a table
(E4); a gutter breakpoint is the constraint its line begins and
ctrl-alt-b sets one at the cursor (E5, `toggleBreakpointAt`,
`exprsStartingIn`); the two CLI debuggers share one REPL skeleton (E6,
`DebugRepl` in editor-services: I/O, located schema, prefixes,
breakpoint records, the command loop), their transcripts unchanged --
all 2026-08-29.

Short, high value:


Larger, design conversation first:

- **E9 (engine done 2026-09-04)** Live whole-validation stepping's
  suspension mechanism: `worker-gate.ts` in `@shexjs/eval-validator-api`.
  `WorkerGate.gate(event)` runs in the worker -- the validator's tracker and
  the regex engines' `debugHooks.onConstraint` call it (same wiring as
  `shex-debug`) -- and on a pause posts the (serialized) event and
  `Atomics.wait`s on a command cell in a SharedArrayBuffer; `GateController`
  in the controlling thread writes into/over/out/continue/abort and
  `Atomics.notify`s, abort throwing `DebugAbort` out of the engine.  The
  breakpoint model is **decided**: frozen while the worker runs, editable
  only while paused -- a resume carries the (possibly edited) breakpoints as
  a JSON payload in the same buffer (shapes/predicates/nodes by lexical
  string, constraints by `schemaTripleConstraints` ordinal, the clone-safe
  key both ends derive from their schema copy), so the worker adopts them the
  instant it wakes and never races the controller mid-search.  The CI harness
  the plan asked for is `WorkerGate-test.js`: it runs the real validator in a
  `worker_threads` worker and drives it from the test thread (into walks the
  event tree; continue runs free; a predicate or ordinal breakpoint *set
  during a pause* fires; over skips a shape's body; abort reports aborted).
  `shex-serve --coi` and clone-safe anchors were already in place.  What
  remains is browser-only and lands with E10 (see there).
- **E10 (browser live-stepping done 2026-09-04)** The browser end of E9's
  mechanism, wired into the existing validation debug panel.  The
  capture+replay 🐞 stays the default (no isolation needed); a new 🐞▶ beside
  it steps the *whole* live validation.  `ShExWorkerThread.js` gained a
  `debugValidate` request that builds a `WorkerGate` over a page-supplied SAB
  and runs a gated `validateShapeMap` (the browser twin of
  `worker-gate-worker.js`); `shex-webapp.js` re-exports the gate primitives
  onto the `ShExWebApp` global; `startValidationDebugSessionLive` runs a
  *dedicated* worker (so ⏹ terminating it never disturbs the app's own
  validator) and drives it through a `GateController`, reusing the panel's
  step controls, gutter/predicate/node breakpoints and status line and
  reading the breakpoints fresh at each step
  (`currentValWireBreakpoints`, the editable-while-paused half of the model;
  constraints cross by `schemaTripleConstraints` ordinal).  The 🐞▶ button
  shows only when `crossOriginIsolated` (`shex-serve --coi`).  CI covers the
  wiring (button present/titled/hidden-without-isolation) and the unchanged
  capture+replay path; the live stepping itself needs a truly-blocking worker
  thread the in-process shim can't provide, so it rides E9's `worker_threads`
  harness for the mechanism and a cross-origin-isolated browser for the glue.
  **Unified panel done (2026-09-04):** the validation debugger and the
  ShExMap materializer debugger now share one control strip, status line and
  thread list (core, in `shex-simple.html`/`shex-app.css`) -- they never step
  at once (a validation finishes before its materialization starts), so the
  app's `activeDebugSession` is whichever is live and the shared buttons
  route to it.  `ShExMapPlugin` stops generating its own strip and keeps only
  the `#debugMaterialize` trigger; every ShExMap page redirects to
  `shex-simple.html`, so the static strip is always present.
- **E11 (done 2026-09-04)** Worker-app materializer debugging.  The step
  session's `MaterializerDebugger` runs in the page even when the app
  validates in a worker (`app.remote`): its inputs -- output schema,
  bindings, shape map -- are all in-page panes (the worker's validation
  populates the bindings pane), so re-materialization is deterministic and
  its `accepts`/`lastReport`/breakpoints never need to cross `postMessage`.
  `shexmap-editors-smoke-test.js` pins it with a worker-mode stepping test
  (breakpoint, step, accept, rendered graph).  The clone-safe anchoring the
  design worried about is only the *whole*-materialize path's, which already
  names constraints by ordinal (`RemoteShExMaterializer`).
- **E12 (deferred)** A steppable eval-threaded-nerr is a rewrite (recursive
  matcher, hot-path generators); only when "why these N errors" becomes a
  debugging goal.

## F. Materializer (`ThreadedMaterializer`)

The acceptance order is pluggable (F2, `options.prefer`: a caller weighs
forfeited bindings or coverage as it likes; the default order stands), a
cycle through And/Or references is refused by name rather than
overflowing the stack and ShapeNot stays a clean error (F3), and
`options.requireBindingsInSubshapes` drops the islands a static-only
optional subshape would emit unasked (F4) -- all 2026-08-29.

- **F1 (worklist dedup done 2026-09-04; lazy-DFA deferred)** The PikeVM
  worklist dedups on (stateNo, callStack, cursor, repeats), pruning redundant
  threads at pop (`ThreadedMaterializer`'s `seen` set, reported as
  `lastReport.configsPruned`); it subsumes the post-accept `exploreSteps`
  budget that could settle for a suboptimal accept.  The lazy-DFA the design
  note sketches beyond it stays deferred -- a further optimization, not a
  correctness gap.

## G. Errors and validation

A closed shape's refusals are repairs (G2, 2026-08-29): "remove it",
added to every way the bag has, or alone where the bag was fine.  The
feasibility layer was checked where it looks away (G4,
`FeasibilityCoupling-test`): over every small bag of five coupled
expressions it never refutes one the language accepts; what the check
found wrong was elsewhere, and is fixed -- the parser copied a group's
cardinality onto a single constraint over the constraint's own
(`( :a . {2} ){1,3}` became `:a . {1,3}`; it is a one-element EachOf
now), and both engines mishandled a group taken zero times over a node
with none of its arcs (the threaded one answered nothing and the
validator fell over it; the stepper reported a missing property).  The
old notes are settled (G5): the EXTENDS-over-a-twice-constrained-
predicate question is a test (`ExtendsRepeatedPredicate-test`), the
ShEx-1-era CLI cases are gone already, and the writer rename is in §I3.

- **G1 (decided 2026-08-29)** Rather than replace the classic errors
  with the repairs outright, the reader chooses: `explain` = `both`
  (repairs, then the errors under them; the default), `repairs` or
  `errors` -- `errsToSimple`'s option, `validate --human --explain`, the
  app's "explain failures" menu item, `?explain=` and a manifest key.  A
  failure the validator put no repair to keeps its errors whatever was
  asked.  Replacing for good, and rewriting the failure fixtures once,
  waits on the repairs having been read in anger (error-normalization
  §4, step 4).
- **G3 (done 2026-09-04)** Assignment when several constraints could take a
  triple (a predicate constrained twice with different value expressions):
  the repair search now carries the satisfaction relation (which constraints
  each triple could satisfy, the validator's `t2tcs`) and assigns each triple
  to one it satisfies, pricing every resulting count-vector -- a min-cost
  bipartite assignment, capped at `DEALS`.  Same-value-expression duplicates
  fall out as the special case (every triple satisfies both), reproducing the
  old stars-and-bars deal.  `{ :p [a b c] ; :p [a b] }` over a, b, c now says
  "remove 1 :p", not "remove 2 :p and add 1 :p".  (`Repairs-test`;
  `NearestAcceptedBag.deals` in `repairs.ts`, fed from `shex-validator.ts`.)

## H. Data sources

- **H1 (not blocking; QLever optional)** The SPARQL suite does **not** need
  QLever: its default endpoint is in-process **Comunica**
  (`@comunica/query-sparql-rdfjs`, a devDependency) over an `N3.Store`
  (`neighborhood-sparql/test/sparql-test-server.js`, started in a Worker by
  `launchEndpoint`), and the "results re-writer" is already there --
  `termToJson` + the `{head,results}` envelope on the producing side,
  `ShExUtil.parseSparqlJsonResults` on the consuming side (SPARQL 1.1 JSON,
  round-trip proven by the suite passing).  The fixtures are tiny, so an
  in-JS engine suffices; large scale (Wikidata) is a *runtime* concern that
  points `neighborhood-sparql` at a remote HTTP endpoint, not the local test
  engine.  QLever stays an **optional** conformance target
  (`SPARQL_ENDPOINT=…`) -- a real third-party store exercises bnode
  relabeling, literal normalization and long-query POST that Comunica is too
  lenient to; the suite already passes on a native QLever build once
  `neighborhood-sparql` emits correlated `MINUS` rather than `NOT EXISTS`
  (which it does, at `neighborhood-sparql.ts:502`).  The `NOT EXISTS` planner
  blowup (draft PR ad-freiburg/qlever#3190) now matters only for emitting
  `NOT EXISTS` directly; keep the repro.

## I. Toolchain and repo hygiene

The Makefile is hand-maintained; the generator it grew out of
(`tools/makeMake.js`) had stopped running and is gone (I2, 2026-08-29).

- **I1 (done 2026-08-29)** `perf/fhir/corpus/examples`: 2,172 tracked files,
  33 MB of an 82 MB pack -- tracked from before `.gitignore` got
  `perf/*/corpus/` and `perf/fhir/fetch.sh` was written to fetch the
  published FHIR build, which is what `bench.js` means to run against.
  Recommendation (2026-08-29): `git rm -r --cached perf/fhir/corpus` and
  nothing else -- the fetch script is the corpus's source of truth; a
  fresh clone runs `perf/fhir/fetch.sh` once.  The 33 MB stays in history
  (the pack shrinks only with a history rewrite, which a public repository
  with forks should not do for 33 MB; `git clone --depth 1` is the cheap
  clone).  Not git-lfs: quota and bandwidth on GitHub, `git lfs install`
  for every contributor, and a corpus that is an upstream artifact anyway.
  Not a fixture repository: a submodule's friction buys nothing for files
  nobody hand-edits.
- **I4 (done -- published 2026-08-31, completed 2026-09-05)** What a `publish-ordered` run
  needs first.  Never published: `lezer-shexc`, `@shexjs/editor-services`,
  `@shexjs/neighborhood-wikibase`, `@shexjs/extension-wasi`,
  `@shexjs/extension-wasi-test` (the order handles them; `extension-wasi`
  now has `publishConfig.access: public`, without which a scoped publish
  is refused, and `extension-wasi-test` no longer needs `wat2wasm` on the
  publishing machine).  `lezer-turtle` is a `github:` dependency of
  `editor-services` and `cli` -- published 2026-08-30, and depended on
  as `^0.1.0`.  `npm pack` includes whatever `doc/webpacks/`
  holds on disk (the root `.gitignore` does not reach a workspace's
  tarball), so `prepublishOnly` in `webapp`, `extension-map` and
  `extension-reduce` builds the bundles first.  Then
  `node tools/bumpVersions.js 1.0.0-alpha.30`, `npm install`, the suite,
  tag, `node tools/publish-ordered.js --tag latest` (npm 11 refuses a
  prerelease with no dist-tag, and the alphas have always been `latest`;
  the tool insists on one up front).  A dry run on 2026-08-30 (`--dry-run
  --tag latest`, before the suite bump) published nine and skipped twenty
  whose versions the registry already had.  Published for real 2026-08-31
  (tag `v1.0.0-alpha.30`, fff21dfe); a partial run left seven behind
  (editor-services, extension-reduce{,-js}, extension-wasi{,-test},
  neighborhood-wikibase, semact-overlay), published from the tag 2026-09-05
  to complete 29/29.
- **I5 (done 2026-08-30) Two version lines.**  Packages with an audience
  outside shex.js -- `shape-map`, `lezer-shexc`, `lezer-turtle` (its own
  repository, on npm as of today) -- are on version lines of their own;
  their shared base is `@shexjs/term`, independent too.  `Start` is
  defined once, in term (`Start`, `isStart` for a copy that came through
  JSON or a worker), and `neighborhood-api`, the validator and the ShapeMap
  parser all read that object -- the `ShapeMap.Start = Validator.Start`
  assignments are gone.  `unescapeText` lives in term; util re-exports it;
  `shape-map` and `shex-parser` depend on term, not util.  Root
  package.json's `shexjs.independent` lists the tier: `bumpVersions.js`
  leaves those versions and the ranges pointing at them alone, and
  `publish-ordered.js` skips a package whose version the registry already
  has.  Rule: suite -> tier with `^`; tier -> tier; tier never -> suite.
  Their versions are theirs to move: `shape-map` published `1.0.0` with
  alpha.30 (no util); `1.1.0` is staged in-tree for the next release.
- **I6 (staged 2026-08-30) `lezer-shexc` is its own repository**,
  `shexjs/lezer-shexc` (the org, not a personal account: the rdfjs model,
  where the same maintainers hold the implementation and its grammars --
  as `rdfjs/N3.js` publishes `n3`, `shexjs/lezer-shexc` publishes unscoped
  `lezer-shexc`).  It had no `@shexjs/*` dependency, one consumer
  (`editor-services`, as `^0.1.0`, the way it already takes `lezer-turtle`),
  an ESM/lezer-generator toolchain foreign to this repo, and a Lezer
  contributor should need `npm i && npm test` on a grammar and a corpus,
  not this monorepo.  It tests against `shex-test` as its own
  `github:` devDependency (or `SHEX_TEST=../shexTest`), commits the
  generated parser with a `prepare` build and a CI check that they agree.
  Gone from `shexjs.independent`, the Makefile and the workspace;
  published as 0.1.0 and pushed the same day, and package-lock.json
  resolves editor-services' `^0.1.0` from the registry.  A wrinkle worth
  knowing: with the old lock still declaring a `packages/lezer-shexc`
  workspace, `npm install` was a no-op -- the range read as satisfied, and
  `npm ci` re-made a dangling link to the missing directory (`EditorPanes`
  then fails with "Cannot find module lezer-shexc") -- so the two
  `lezer-shexc` entries had to be deleted from the lock by hand before
  `npm install` would ask the registry.
  `semact-overlay` stays: it imports `@shexjs/visitor`, sits on the
  lockstep line and co-owns the validator's `semActIndex` contract with
  `extension-reduce`; a package leaves when its dependency on shex.js is
  on a released API rather than a co-developed one.
- **I3 (done 2026-09-05)** The dependency majors, taken.  The eight-safe batch
  landed in #444 (chai 6, eslint 10, glob 13, js-yaml 5, koa 3, n3 2, jquery 4;
  jsonld was already `^9`), green on the CI Node-20 lane.  The ESM-only pair
  went to built-ins rather than the bumps -- **node-fetch dropped for the
  global `fetch`** and **chalk for an inline TTY underline** (#445; both were
  ESM-only, breaking `require()` on Node 18-20.18).  `rdf-data-factory` 2
  (#446) and `webpack-cli` 7 (#447) followed; **`typescript` 7 stays out** --
  it is the native Go port ("tsgo"), whose main entry no longer exports the
  classic compiler API `ts-jison`/`ts-loader` need.  The dev-major tail
  `mocha` 12 + `sinon` 22 is in (#450), **pre-commit → husky** done (#451,
  clearing the `cross-spawn` audit finding), and the `ShExWriter` →
  `ShExCWriter` rename done (#452).  Remaining `npm audit` findings are in
  `@ts-jison`'s transitive chain.

## Decisions wanted

(none open -- `shape-map` published `1.0.0` with alpha.30; `1.1.0` is staged
for the next release.)
