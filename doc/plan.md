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
  Left `any`, honestly: what arrives through the bundles' globals
  (jQuery, ShExWebApp.*, RdfJs, the editor panes) -- typing
  `globals.d.ts` against the packages' own types is the next narrowing.
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
- **B3 (decision: `lib/`)** CI runs `npm ci` and the tests with no build
  step, so `lib/` stays committed unless CI (and `npm install` from git)
  learns to build; that is one line in `ci.yml` and a `prepare` script,
  and would take `lib/` out of every diff.  The `.map` files are untracked
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
`exprsStartingIn`); the two CLI debuggers share one REPL skeleton (E6,
`DebugRepl` in editor-services: I/O, located schema, prefixes,
breakpoint records, the command loop), their transcripts unchanged --
all 2026-08-29.

Short, high value:


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

The acceptance order is pluggable (F2, `options.prefer`: a caller weighs
forfeited bindings or coverage as it likes; the default order stands), a
cycle through And/Or references is refused by name rather than
overflowing the stack and ShapeNot stays a clean error (F3), and
`options.requireBindingsInSubshapes` drops the islands a static-only
optional subshape would emit unasked (F4) -- all 2026-08-29.

- **F1 (L)** PikeVM worklist dedup on (state, callStack, cursor); subsumes
  the post-accept `exploreSteps` budget that can settle for a suboptimal
  accept (`lastReport.explorationTruncated`).  The design note sketches it
  and the lazy-DFA beyond.

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
- **G3 (L)** Assignment when several constraints could take a triple
  (`EXTRA`, one predicate constrained twice): a min-cost bipartite
  assignment inside the repair DP.

## H. Data sources

- **H1 (upstream)** The SPARQL suite against a local QLever is blocked by a
  QLever query-planner blowup on `NOT EXISTS`; track upstream, keep the
  repro.

## I. Toolchain and repo hygiene

The Makefile is hand-maintained; the generator it grew out of
(`tools/makeMake.js`) had stopped running and is gone (I2, 2026-08-29).

- **I1 (decision)** `perf/fhir/corpus/examples`: 2,172 tracked files,
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
- **I4 (before publishing; 2026-08-30)** What a `publish-ordered` run
  needs first.  Never published: `lezer-shexc`, `@shexjs/editor-services`,
  `@shexjs/neighborhood-wikibase`, `@shexjs/extension-wasi`,
  `@shexjs/extension-wasi-test` (the order handles them; `extension-wasi`
  now has `publishConfig.access: public`, without which a scoped publish
  is refused, and `extension-wasi-test` no longer needs `wat2wasm` on the
  publishing machine).  `lezer-turtle` is a `github:` dependency of
  `editor-services` and `cli` -- publish it to npm and depend on a version,
  or every consumer needs git.  `npm pack` includes whatever `doc/webpacks/`
  holds on disk (the root `.gitignore` does not reach a workspace's
  tarball), so `prepublishOnly` in `webapp`, `extension-map` and
  `extension-reduce` builds the bundles first.  Then
  `node tools/bumpVersions.js 1.0.0-alpha.30`, `npm install`, the suite,
  tag, `node tools/publish-ordered.js`.
- **I5 (proposal, 2026-08-30) Two version lines.**  Packages with an
  audience outside shex.js -- `shape-map`, `lezer-shexc`, `lezer-turtle`
  (its own repository) -- should not rev with the suite: every
  `1.0.0-alpha.N` is a dependabot PR for nothing.  So: an *independent*
  tier on its own semver, and the *suite* on the fixed line.  The tier's
  shared base is `@shexjs/term` (terms as ShExJ, RDF/JS and Turtle spell
  them; third-party deps only, slow already: alpha.27 while the suite is
  at 29), made independent too.  Two moves make `shape-map` depend on
  nothing in the suite: `unescapeText` (its only use of `@shexjs/util`,
  fifteen lines) moves to term, util re-exporting it; and `Start` is
  defined once, in term, with `neighborhood-api` and `ShapeMapSymbols`
  importing it -- the `ShapeMap.Start = Validator.Start` assignment every
  consumer makes today (cli, the app, Map-test) becomes a no-op and goes.
  Tooling: `tools/bumpVersions.js` reads the tier from root package.json
  (`"shexjs": {"independent": [...]}`), skips those packages and leaves
  the `^` ranges pointing at them alone; `tools/publish-ordered.js` skips
  a package whose version the registry already has.  Rule: suite -> tier
  with `^`; tier -> tier; tier never -> suite.
- **I3 (on request)** Majors deliberately not taken: chai 5+, n3 2.x,
  eslint 10, jquery 4, node-fetch 3, koa 3, jsonld 9, glob 13, js-yaml 5,
  pre-commit→husky; and, of this repo's own, renaming `ShExWriter` (it
  writes ShExC) to `ShExCWriter`.  Remaining `npm audit` findings are in pre-commit's
  transitive chains.

## Decisions wanted

B3 (committed `lib/` -- stays, for now), I5 (two version lines).
