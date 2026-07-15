# Task list (prepared for a fresh session / smaller model)

Accumulated deferred work, consolidated from
[refinements-backlog.md](refinements-backlog.md) (rationale lives there)
and the unfinished parts of [debugger-design.md](debugger-design.md).
Each task is self-contained: goal, where, approach, and done-when.
Sizes: **S** ≈ an hour, **M** ≈ a day, **L** = multi-day / needs design
review first.

## How to work in this repo (read first)

- Full check: `npm run test-all` (sets TEST_cli/TEST_browser/TEST_server)
  and `npm run lint`.  Both must be green before a commit; pre-commit
  hooks also run them.
- TypeScript packages (`eval-*`, `shex-validator`, `shex-webapp`'s
  shex-serve, `shex-editor-services`) compile per-package:
  `cd packages/<p> && ../../node_modules/.bin/tsc`.  The compiled `lib/`
  is committed.
- The webapp bundles in `packages/*/doc/webpacks/` are committed
  artifacts: after changing any `lib/` code reachable from
  `packages/shex-webapp/shex-webapp.js` or
  `packages/extension-map/shexmap-webapp.js`, run `npm run webpack` and
  commit the bundles.  `doc/*.js` app files (ShExBaseApp.js etc.) are
  served raw, NOT bundled.
- `packages/extension-map/examples/manifest.json` and `manifest.yaml`
  must stay deep-equal (Map-test asserts it).  Entries flagged
  `threadedOnly: true` skip the legacy-materializer half of Map-test.
- jsdom smoke tests (`TEST_browser=true`, `packages/*/test/*smoke-test*`)
  load the real pages: use PREFIXED names in fixtures (relative IRIs
  resolve against the page URL), and remember schema-gutter breakpoints
  are line-granular (put the target constraint on its own line).
- ShExC gotcha: cardinality precedes semActs (`:p . ? %Map:{ :v %}`).
- CLI family conventions: `--help`/usage exits 1; status-0 runs must
  leave stderr empty (common-test-infrastructure asserts it).
- Commits end with `Co-Authored-By:` for the model; push to
  `git@github.com:shexjs/shex.js` main and watch the run with
  `gh run list ... --json workflowName` filtered to `workflowName=="CI"`
  (pages-build-deployment also fires on push).
- HTTP test fixtures serve on literal `127.0.0.1` (never `localhost`:
  Happy Eyeballs + nock 14 races into `read EINVAL` on Linux CI).

## A. Debugger polish (short, high value)

1. **[M] Capture validation with the user's selected engine** —
   `startValidationDebugSession` (packages/shex-webapp/doc/ShExBaseApp.js)
   currently forces eval-simple-1err for the whole capture run, so a
   "thorough" (eval-threaded-nerr) user debugs a different diagnosis.
   `constraintToTripleMapping` is engine-independent, so: capture with
   `ShExWebApp[$("#regexpEngine").val()]`, and in `pickValidationMatch`
   compile a fresh eval-simple-1err engine for the captured shape
   (`RegexpModule.compile(schema, cap.shape, index)`) to replay against
   the captured inputs; note in #valDbgStatus when the replay engine
   differs.  Done when: the editors smoke test also passes with
   `#regexpEngine` set to eval-threaded-nerr before clicking 🐞.

2. **[M] Highlight a validation thread's matched partition in the data
   pane** — `previewValThread` (ShExBaseApp.js) renders the partition as
   text; also highlight the partition's triples in the inputData editor
   pane the way validation-error anchoring does (millan `sourcesOf`
   ranges via `Caches.editorSupport`; see `mapValidationErrors` in
   packages/shex-editor-services/src/editor-services.ts).  Done when: a
   smoke-test hover asserts data-pane decorations exist for a matched
   triple.

3. **[S] Side-effect-free replay** — replaying a captured match
   re-dispatches semActs.  Wrap `cap.semActHandler` in a recording shim
   (record dispatch results during capture; replay returns the recorded
   `SemActFailure[]` without re-dispatching).  Lives naturally next to
   `capturingRegexModule` in packages/eval-validator-api.  Done when: a
   MatchDebugger-test shows a counting semAct is dispatched once, not
   twice.

4. **[M] Web UI for node/predicate breakpoints + structured thread
   snapshot** — the CLIs' `bn`/`bp` have no web equivalent; add small
   inputs (or a context-menu on the panes) feeding
   `dbg.addBreakpoint({predicate}/{subject})`, and replace the
   text-only status snapshot with a rendered call-stack / binding-frame
   table (`bindingsToTable` in ShExMapBaseApp.js already renders
   frames).  Files: ShExMapBaseApp.js, ShExBaseApp.js, both
   *-simple.html.

5. **[M] Column-precise gutter breakpoints** — a gutter click resolves
   to the FIRST constraint whose range starts on that line
   (ShExMapBaseApp.startDebugSession, ShExBaseApp.pickValidationMatch,
   both REPLs' `b LINE[:COL]` already accept :COL).  For one-line shapes
   offer a per-line constraint picker (popup listing `exprAt` hits on
   the line) or breakpoint-on-selection.

6. **[M] Common REPL skeleton** — `ShExMapDebugRepl`
   (packages/extension-map/lib) and `ShExDebugRepl`
   (packages/shex-cli/lib) duplicate command parsing, prompt/EOF
   handling, breakpoint bookkeeping, excerpt printing.  Extract a shared
   base (natural home: @shexjs/util or a new small package both already
   depend on) before a third debugger appears.  Behavior must not
   change: both REPL test suites and the Debug/Map CLI integration
   tests stay green as-is.

## B. Debugger, larger pieces (design review with Eric first)

7. **[L] Live whole-validation stepping in the browser** — design doc
   phase 6: run the validator in a Worker, tracker/debugHooks callbacks
   post each event and `Atomics.wait` on a SharedArrayBuffer command
   cell; UI writes into/over/out/continue/abort.  Prereqs shipped:
   `shex-serve --coi` (COOP/COEP), clone-safe breakpoint anchors are
   `{shapeLabel, predicate}` pairs.  Decide: breakpoints frozen at
   session start (SAB is just ints) vs a side-channel.  jsdom has no
   Workers, so CI coverage needs a node `worker_threads` harness for the
   gate protocol; browser testing is manual.
8. **[L] Unified debug panel** — one panel over materialization +
   validation sessions (shared thread-list/controls code in the apps;
   today they are parallel implementations).
9. **[M-L] Worker-app debugging** (shexmap-simple-worker): accepts,
   lastReport and breakpoints don't cross postMessage; ship clone-safe
   anchors and the accepts list from the worker (validation already
   ships clone-safe error anchors — same pattern).
10. **[L, deferred] Steppable eval-threaded-nerr** — a rewrite, not an
    annotation (recursive matcher, reduces can't host yields, hot-path
    generator overhead ⇒ dual plain+steppable matchers); its threads
    are error-permutation carriers wanting a call-stack stepper, not a
    threads pane.  Only worth it when "why did thorough report these N
    errors" becomes a debugging goal.  See the backlog entry for the
    full cost/benefit.
11. **[S-M] Richer debugHooks** — `onConstraint` could carry the
    engine's thread/backtracking state and per-candidate pass/fail; add
    an `onConstraintResult` counterpart.  Types in
    packages/eval-validator-api/src/validator-api.ts; both engines; the
    ShExDebugRepl display.
12. **[S] Formalize the validator `tracker`** as the documented
    shape-level debug event source (today it's the LOG_PROGRESS
    interface pressed into service; give it payload types in
    validator-api and a doc section).

## C. ThreadedMaterializer (packages/extension-map/lib/ThreadedMaterializer.js)

13. **[L] PikeVM worklist dedup** — breadth-parallel stepping with a
    dedup key of (stateNo, callStack, cursor); subsumes the post-accept
    `exploreSteps` budget, which today can settle for a suboptimal
    accept on large inputs (`lastReport.explorationTruncated`).
    doc/threaded-materializer.md sketches it (also the lazy-DFA/TDFA
    determinization beyond).
14. **[S-M] Acceptance-heuristic refinement** — current ranking: most
    consumed, fewest skipped (bindings forfeited by cursor advances),
    most emitted, discovery order.  Could weigh WHICH bindings were
    forfeited or shape coverage.  Alternatives are already surfaced to
    the user (accepts chooser), so this is tuning, not correctness.
15. **[M] ShapeAnd/ShapeOr cycle guard; ShapeNot** —
    `_compileShapeExprNFA` has no cycle guard for And/Or reference
    cycles (stack overflow risk); ShapeNot synthesis is unsupported
    (clean error today).
16. **[S] Static-only optional subshapes** still emit one island per
    repetition window (progress guard caps, not eliminates); add a
    "must consume ≥1 frame binding" mode.

## D. Editors / web apps

17. **[L] tree-sitter-shexc (or Lezer port)** for exact incremental
    highlighting and error-tolerant range-bearing parsing; starting
    asset at ../../ericprud/tree-sitter-shexc.  Talk to Eric before
    starting — he maintains the grammar.
18. **[S] `locate.constraint(shape, predicate)` disambiguation** —
    returns the first constraint with that predicate; shapes with
    repeated predicates (fhir:component ×2) need occurrence index or
    valueExpr comparison.  packages/shex-editor-services.
19. **[M] ShExR/DCTAP source locations** — those inputs bypass ShExC
    locations (editors degrade to label anchors); synthesize locations
    from the generated ShExC.
20. **[M] #textMap as a third managed editor** — the ShapeMap parser is
    ts-jison and can grow the same `_locations` treatment.
21. **[S] Hover tooltips** showing the constraint's text when hovering
    its data-side counterpart (currently only highlights).
22. **[S] Autocomplete** — fall back to the live linter's last parse for
    labels not yet in `cache.parsed`; tune `activateOnTyping` /
    `matchBefore` after real use.
23. **[S] Raw-source loader blocks** in the html comments are stale —
    resurrect or remove.
24. **[S-M] Console-silence smoke harness** — smoke tests assert
    behavior but not console silence; a fail-on-unexpected-console-error
    option would have caught the NestedWriter fallback regression before
    CI did.  (Expect to whitelist the known jsdom/CM6
    `getClientRects` measure noise.)
25. **[varies] millan upstream** (Eric's fork, rdfjs-interface branch):
    subject `source` ranges include a trailing whitespace char (fix the
    emitter; editor-services' `trimRange` is the defensive workaround);
    publish plan (@shexjs/millan?) vs the github dependency;
    `RdfJsDb(MillanDataset)` as the validation store — blocked on
    N3-specific API surface and N3 internalization dropping `source`s.

## E. Toolchain

26. **[S] Ordered publish script** — `npm publish --workspaces` isn't
    topological; brief unsatisfiable-range window during publish.
27. **[S] `bin/validate --extension` bare package names** (today:
    file-glob paths only, LoadExtensions).
28. **[S] Test-infra sharing** — `graphEquals` is copied between test
    files; tools/testServer.js's nock/real-server split deserves a
    documented utility.
29. **[S] shex-serve conneg q-values** — Accept matching is substring
    only; fine for browsers, not spec-grade.
30. **[M] tools/makeMake.js** no longer generates the (hand-amended)
    Makefile; teach it the parser and TypeScript targets.
31. **Bookkeeping** — majors deliberately not taken (chai 5+, n3 2.x,
    eslint 10, jquery 4, node-fetch 3, koa 3, jsonld 9, glob 13,
    js-yaml 5, pre-commit→husky; lerna already removed); remaining
    `npm audit` findings live in pre-commit's transitive chains.
    Take these only on request.
