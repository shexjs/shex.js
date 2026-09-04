# A ShEx / ShExMap debugger — design

Goal: step **into / over / out** of the validation or materialization of a
ShapeExpression or TripleExpression; set **breakpoints in validation and
materialization schemas** and **on the lexical representation of a graph
node**.

> **Status**: phases 1–4 are *implemented*.
> Materialization: `ThreadedMaterializer.run()` is a step-event generator
> and `MaterializerDebugger` (both in
> `packages/extension-map/lib/ThreadedMaterializer.js`) provides
> stepInto/stepOver/stepOut/continue with all three breakpoint kinds;
> `shexmap-debug` is the CLI REPL over it, and shexmap-simple's 🐞 button
> (with `?editors=1`) opens the web debug panel — breakpoint gutter in the
> output-schema pane, ▶⤵⏭⤴⏹ controls, current-constraint highlight, thread
> snapshot in the status line.
> Validation: `shex-debug` is a CLI REPL over the validator's `tracker`
> events (shape-level stepping; suspension is just blocking on stdin — no
> worker needed in a terminal), and `shex-serve --coi` sends the COOP/COEP
> headers browser-side suspension will need.
> Constraint-level validation events shipped too (phase 5): both regex
> engines take optional `debugHooks.onConstraint` (threaded through
> `ShExValidator`'s options), and `shex-debug` steps into them --
> `b LINE` prefers the constraint on the line, `bp PRED` breaks on a
> predicate.
> What remains — phase 6's live stepping, a unified panel, worker-app
> debugging and the polish items — is tracked in [plan.md](plan.md) §E.
> Browser validation debugging shipped as **capture + replay** (see §1):
> the validate-side 🐞 in shex-simple/shexmap-simple reruns the
> validation with `capturingRegexModule` recording every
> `regexEngine.match()` invocation, then replays any recorded
> node@shape match through eval-simple-1err's `runMatch()` generator /
> `MatchDebugger` -- schema-gutter breakpoints, ▶⤵⏭⏹ stepping (⏭ = next
> NFA generation), and a threads pane whose hover/click renders a
> thread's aspects: state-machine position (highlighted in the schema
> pane), repeat counts, and its matched-triples partition.  **Live**
> whole-validation stepping in the browser now ships too (phase 6, the
> worker gate + `Atomics`): the validate panel's 🐞▶ (shown when the page is
> cross-origin isolated) runs the validator in a dedicated worker that
> blocks between events, stepping the whole validation shape by shape and
> constraint by constraint beside the capture+replay 🐞.  All three
> debuggers -- validation capture+replay, validation live, and the ShExMap
> materializer -- now share **one** panel (control strip, status, threads),
> driven by whichever session is live (`activeDebugSession`); they never run
> at once (a validation finishes before its materialization starts).

## 1. The central problem: suspending an engine

A debugger must *pause* the engine mid-evaluation and hand control to the
user.  There are three ways to get suspension, and this design uses two of
them, matched to what we own:

| technique | applies to | why |
|---|---|---|
| **generator refactor** (engine yields step events; a driver decides when to call `next()`) | ThreadedMaterializer — done | we own the code and it was already a flat interpreter loop; the sync `materialize()` just drains the generator, so non-debug behavior is byte-identical |
| **worker + `Atomics.wait`** (engine runs synchronously in a Worker; each step event posts to the UI and blocks on a SharedArrayBuffer until the UI signals resume) | live whole-validation stepping in a browser | the recursive `ShExValidator` proper can't yield mid-flight on the main thread; blocking a worker is the standard trick, and the web apps already have the worker scaffolding (`ShExWorkerThread.js`, `WorkerMarshalling`) |
| **capture + generator replay** (`capturingRegexModule` records every `match()`'s inputs during a free-running validation; `eval-simple-1err.runMatch()` -- its PikeVM loop was already a flat worklist -- replays any of them as a steppable generator) | triple-expression matches in the browser — done | no suspension needed at all: the validation has already finished when stepping starts, so the main thread pauses simply by not calling `next()` |
| async/await rewrite | (rejected) | would fork the validator API and slow the hot path |

`Atomics.wait` requires `SharedArrayBuffer`, which requires cross-origin
isolation. **`shex-serve --coi` sends `Cross-Origin-Opener-Policy:
same-origin` and `Cross-Origin-Embedder-Policy: require-corp`** (opt-in,
since COEP constrains loading cross-origin resources — the cdnjs script is
already served locally, so the apps qualify).  Apache users, with
`mod_headers` enabled, can put the equivalent in an `.htaccess`:

```apache
Header set Cross-Origin-Opener-Policy "same-origin"
Header set Cross-Origin-Embedder-Policy "require-corp"
```

Node CLI debugging needs none of this: blocking on stdin suspends a
terminal REPL just fine (as `shex-debug` and `shexmap-debug` do).

## 2. The event protocol

One vocabulary for both engines (materializer emits the first three today):

```
{type: "tripleConstraint", tc, thread}   about to evaluate/synthesize a constraint
{type: "fail", failure, thread}          a branch/alternative died
{type: "advance", tc, thread, toFrame}   materialization: the constraint's lookup
                                         advanced the binding-frame cursor; the
                                         thread defers so in-frame alternatives
                                         explore first
{type: "return", thread}                 a subshape call completed (depth = caller's)
{type: "accept", thread, quads}          materialization: a thread accepted
                                         (exploration continues; all accepts are
                                         collected and the best is chosen)
{type: "enterShape", node, shape, thread}   validation: focus node enters a shape
{type: "exitShape", node, shape, result, thread}
{type: "done" | "error", ...}            done carries accepts[] for the UIs'
                                         alternatives choosers / thread lists
```

The validation side's shape-level events are its tracker, typed:
`ShapeDebugEvent` in `@shexjs/eval-validator-api` (`enter`, `exit` with the
result, `recurse`, `known`, each with its `depth`), and `eventTracker(onEvent)`
is the tracker `ShExValidator` takes, emitting them.  `shex-debug` rides it;
the browser's capture/replay steps below it, inside one match.

`thread` is the inspectable snapshot: for the materializer
`{subject, depth, frame, consumed, emitted}` — watching `frame`/`consumed`
move through the binding tree is the ShExMap "variables view".  For
validation it's `{node, shape, depth, triplesMatched}`.

**Stepping semantics are pure controller logic** over `thread.depth` (the
engines only report):

- *into*: pause at the very next event;
- *over*: next event with `depth <= current` (skips the interior of the
  call started at the current event);
- *out*: next event with `depth < current` — `return` events are stamped
  with the **caller's** depth so step-out lands on the completion of the
  current call (and backtracking that pops shallower also pauses, which is
  informative: it shows the branch being abandoned).

## 3. Breakpoints

Three kinds, all implemented for materialization and identical in design for
validation:

1. **Schema-element breakpoints**: the source-range infrastructure already
   maps both directions — `schema._exprLocations` (TC → range) and now
   `locate.exprAt(offset)` / `shapeAt(offset)` (editor position → object).
   A CodeMirror breakpoint gutter (a small `gutter()` extension beside the
   lint gutter) resolves clicks to constraint objects: a gutter click means
   the first constraint the line *begins* (`locate.exprsStartingIn`), not
   one continuing across it, and ctrl-alt-b sets one at the cursor
   (`toggleBreakpointAt`) for a line that holds several.  Identity holds
   in-process, and `{shapeLabel, predicate}` pairs are the clone-safe
   fallback for worker-side engines (the same dual strategy the
   error-anchoring uses).
2. **Node breakpoints**: a set of lexical term representations; the
   controller pauses any event whose focus/subject node matches.  In the
   data pane, a gutter click resolves via the millan dataset (position →
   quad → subject) to offer the node's lexical form.
3. **Predicate breakpoints** (free extra): break on every constraint for a
   property IRI.

The web validator debugger takes the last two in words, as `shex-debug`
does (`bp PREDICATE`, `bn NODE`); there a node breakpoint means which of
the recorded matches are on offer.

## 4. Validation-side engine work (the unimplemented half)

- ✅ **Shape-level events come almost free**: `ShExValidator` accepts a
  `tracker` (`{enter, exit, recurse, known}`); it is the debug event
  source, typed as `ShapeDebugEvent` and emitted by `eventTracker` (§2).
- ✅ **TripleConstraint-level events are one hook in the regex engines**:
  `debugHooks.onConstraint(tc, {node, triples, thread})` as the engine
  (re)considers a constraint -- `thread` is what the asking thread has
  matched so far (`ConstraintThreadView`) -- and
  `debugHooks.onConstraintResult(tc, {taken, passed, failed, spawned,
  thread})` for what came of it: the candidates taken, which passed and
  which a semantic action refused (eval-threaded-nerr runs them there;
  eval-simple-1err at the end), and how many threads it spawned.
- ✅ **Suspension**: in the worker, the tracker/hook callbacks call
  `WorkerGate.gate(event)` (`worker-gate.ts` in `@shexjs/eval-validator-api`),
  which `postMessage`s the serialized event and `Atomics.wait`s on the
  command cell; the controlling thread's `GateController` writes
  into/over/out/continue/abort into the SAB and `Atomics.notify`s.  Abort
  throws `DebugAbort` out of the engine.  Breakpoints are **frozen while the
  worker runs and editable only while paused**: a resume carries them as a
  JSON payload in the same buffer (constraints keyed by
  `schemaTripleConstraints` ordinal, the clone-safe name both ends derive),
  so the worker adopts the edited set as it wakes and never reads it
  mid-search.  Proven under `worker_threads` by `WorkerGate-test.js` (the
  in-page worker shim can't run `Atomics.wait`, so this is the mechanism's
  CI); the browser `debugValidate` handler and the panel over it are E10.
- The **main-thread app** can reuse the identical UI against the worker
  validator (`shex-worker.html` already validates there); for
  `shex-simple.html`'s in-thread validator, debugging redirects validation
  through a transient worker (schemas/data already marshal — that path
  exists).

## 5. UI (web apps)

- **One floating panel over all three debuggers** (validation capture+replay,
  validation live, ShExMap materialization), never more than one live at a
  time (a validation finishes before its materialization starts): ▶ continue,
  ⤵ into, ⏭ over, ⤴ out, ⏹ stop; a status line; the thread list (for ShExMap:
  the binding-frame index and consumed-count against a rendered frame table —
  the `bindingsToTable` widget already renders frames).  `#debugPanel` is
  `position:fixed` (a bottom-right card in `shex-app.css`), so its controls
  stay in reach whichever *screen* the stepped schema is on — the input
  schema for validation, the output schema (the plugin's own screen) for
  materialization.  The app's `activeDebugSession` is whichever session is
  live and the shared buttons route to it (`showDebugPanel(mode)` /
  `hideDebugPanel()` / `setDebugRunnable()` on the core app; the plugin's
  materializer registers as `activeDebugSession` while it runs).  The step
  verbs disable once a search is exhausted; picking a new schema/data ends a
  session standing over the old inputs.
- **Current-position highlighting** reuses `pane.highlight()`: the paused
  event's `tc` range in the schema pane (`locate.expr`), the focus/subject
  node's occurrence in the data pane (millan lookup), in a distinct
  "current line" color.
- Breakpoint gutter dots in schema/data panes; node breakpoints also
  settable by typing a lexical form in the panel.
- Validate/materialize buttons gain a "debug" modifier (e.g. shift-click or
  a checkbox) that routes through the debugger instead of running free.

## 6. CLI

`shex-debug` (in `@shexjs/cli`): loads schema/data/shape-map like
`shex-validate`, runs the engine in a `worker_threads` worker, REPL commands
`c`/`s`/`n`/`o`/`b <line|term>`/`bt`/`info bindings`/`q`.  The materializer
variant needs no worker at all (the generator is synchronous and
single-threaded) — `shexmap-debug` can ship first.

Both REPLs extend `DebugRepl` (`@shexjs/editor-services/lib/debug-repl`):
injected `write`/`prompt`, the located schema, `expand`/`lex`/`termStr`
over the schema's prefixes, `b LINE[:COL]` resolution (the constraint the
line begins, else what it is inside of), the breakpoint record and
`commandLoop` (a line read, split, dispatched to a table).  What each keeps
for itself is its engine and how it drives it: the materializer's is
pulled, the validator's gates in the engine's callbacks.  A third debugger
starts from the same base.

## 7. Phasing

1. ✅ Materializer: `run()` generator + `MaterializerDebugger` + offset
   lookups + tests.
2. ✅ `shexmap-debug` CLI (REPL over the debugger — no engine work).
3. ✅ Web-app ShExMap debug panel (gutter, controls, highlights) — no
   engine work beyond what's shipped.
4. ✅ Validator shape-level stepping (CLI): `shex-debug` REPL over the
   tracker (blocking stdin is the suspension — a terminal debugger needs
   no worker); `--coi` in shex-serve for the browser side to come.
5. ✅ Validator TC-level events: regex-engine `debugHooks.onConstraint`
   in both engines, a `debugHooks` validator option, and constraint
   stepping/breakpoints (`b LINE`, `bp PRED`) in `shex-debug`.
6. Browser validation debugging:
   - ✅ triple-expression matches via capture + replay
     (`capturingRegexModule` + `MatchDebugger`) with per-thread
     state-machine position / repeats / matched-partition views; the
     capture is by whichever engine is selected and the replay by
     eval-simple-1err's stepper (compiled afresh per match when they
     differ, and the status says so); the semantic actions run once, at
     capture, and a replay answers from the recording
     (`recordingSemActHandler` / `replayingSemActHandler`);
   - ✅ live whole-validation stepping's engine: the worker gate + SAB
     command protocol (`WorkerGate`/`GateController`, frozen-while-running
     breakpoints), CI-proven under `worker_threads`;
   - ✅ the browser wiring of that gate: `debugValidate` in
     `ShExWorkerThread.js` runs a gated validation in a dedicated worker, and
     the validate panel's 🐞▶ (shown only when cross-origin isolated) drives
     it beside the capture+replay 🐞, reusing the same controls, gutter and
     breakpoints (E10); the live stepping rides the `worker_threads` harness
     for the mechanism and a real isolated browser for the glue;
   - ✅ one unified panel over both engines: the validation debugger and the
     ShExMap materializer share a single control strip, status line and
     thread list (core, in `shex-simple.html`), dispatched to the app's
     `activeDebugSession` -- they never step at once (a validation finishes
     before its materialization starts), so the plugin keeps only its
     `#debugMaterialize` trigger and drives the shared strip.

## 8. Risks / notes

- COI/COEP changes how the served pages may load cross-origin resources
  (schemas/data fetched from other hosts need CORS/CORP); make `--coi`
  opt-in and document.
- Backtracking transparency: the DFS explores and abandons branches; the
  debugger deliberately shows `fail` events (that's half the pedagogical
  value) but "step over" can therefore surface at a *shallower* depth than
  expected when a branch dies — documented behavior, not a bug.
- Event volume: `run()` yields per constraint visit; a pathological schema
  yields many events, but the controller consumes them in a tight loop when
  not stepping — `materialize()` parity is covered by the existing suite.
- Worker identity: schema-object breakpoints degrade to
  `{shapeLabel, predicate}` across `postMessage`, same as error anchoring.
