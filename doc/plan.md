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
  in the same commit.  `packages/lezer-shexc/src/parser.js` is generated
  the same way (`npm run build` there, after editing `shexc.grammar`);
  `make ALL` covers both.
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
| [debugger-design.md](debugger-design.md) | stepping, breakpoints, capture + replay | phases 1–5 and half of 6 done; leftovers in §E |
| [error-reporting.md](error-reporting.md), [error-normalization.md](error-normalization.md), [error-reporting-comparison.md](error-reporting-comparison.md) | structured errors, repairs | F0–F6 done and merged; one decision left, §G |
| [../packages/extension-map/doc/threaded-materializer.md](../packages/extension-map/doc/threaded-materializer.md) | the NFA materializer | design; leftovers in §F |

## B. Web app

The split, the harness, the manifest runner, `app.settled()`, WorkerTask,
the one page, the dependency cleanup, plugin-borne data sources, the page
scripts' move to TypeScript and the untracked `.map`s are done (B1–B10,
2026-08-28).  What is left:

- **B1 (S each) Narrowing the app's TypeScript.**  All sixteen page
  scripts compile from `packages/shex-webapp/src/app/*.ts` into `doc/`
  (`tsconfig.app.json`, run by `npm run build`), with `strict` off, a
  `[key: string]: any` index signature on every class, and a
  `globals.d.ts` of `any`s for what the page provides.  Left is the
  narrowing, one class at a time, smallest first (`WorkerTask`,
  `ShExPlugins`, the caches): declare its fields, drop its index
  signature, type what it takes; then type `globals.d.ts` and turn
  `strict` on.  Still JS, and the same conversion to do:
  `shex-cli/bin/validate` (1,448 lines) and `extension-wasi*`.
- **B2 (M) Plugin packaging** (extension-ui-plan's phase 3 leftover):
  `ShExMapPlugin.js` (1,423 lines) as a built bundle, and the plugin file
  + bundle entry + webpack config as packages of their own.  The
  dependency graph no longer forces this — the library packages declare
  only what their `lib/` requires — so it is tidiness, to be done when
  something else touches those files.
- **B3 (decision) Committed `lib/` and `.map`.**  CI runs `npm ci` and the
  tests with no build step, so `lib/` must stay committed unless CI (and
  `npm install` from git) learns to build; that is one line in `ci.yml`
  and a `prepare` script, and would take `lib/` out of every diff (about five per cent of
  this branch's changed lines; more on a branch that works in the
  TypeScript packages).  The 48 `.map`
  files have no consumer in the repository and can stop being tracked
  today — a `.gitignore` line and `git rm --cached` — which is the
  recommendation either way.

## C. Plugins

The trust prompt for a plugin from another origin is in (C2, 2026-08-28;
plugins.md, "Trust"), and the two layout decisions are recorded there: a
link that names a plugin opens on the validator's screen unless it says
`screen=` (C3), and panes share a column unless `panel:` says otherwise
(C4).

- **C1 (S, external)** Publish the skeleton as a repository of its own.
  `doc/plugin-skeleton/` carries the README and package.json it needs
  (2026-08-28); the repository is yours to create, and its `repository`
  field to fill in.
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
`exprsStartingIn`) -- all 2026-08-29.

Short, high value:

- **E6 (M)** A common REPL skeleton for `ShExDebugRepl` (`shex-cli`) and
  `ShExMapDebugRepl` (`extension-map`) before a third debugger appears;
  both suites stay green unchanged.

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

B3 (committed `lib/`), G1 (repairs replace errors), I1 (the perf corpus).
