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
> Still designed-only: TC-level validation events (regex-engine
> `debugHooks`, §4/phase 5) and the browser validation panel over
> worker + Atomics (phase 6).

## 1. The central problem: suspending an engine

A debugger must *pause* the engine mid-evaluation and hand control to the
user.  There are three ways to get suspension, and this design uses two of
them, matched to what we own:

| technique | applies to | why |
|---|---|---|
| **generator refactor** (engine yields step events; a driver decides when to call `next()`) | ThreadedMaterializer — done | we own the code and it was already a flat interpreter loop; the sync `materialize()` just drains the generator, so non-debug behavior is byte-identical |
| **worker + `Atomics.wait`** (engine runs synchronously in a Worker; each step event posts to the UI and blocks on a SharedArrayBuffer until the UI signals resume) | ShExValidator | the validator and its regex engines are deeply recursive synchronous code; a generator refactor would be invasive. Blocking a worker is the standard trick for pausing sync code, and the web apps already have the worker scaffolding (`ShExWorkerThread.js`, `WorkerMarshalling`) |
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
{type: "return", thread}                 a subshape call completed (depth = caller's)
{type: "enterShape", node, shape, thread}   validation: focus node enters a shape
{type: "exitShape", node, shape, result, thread}
{type: "done" | "error", ...}
```

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
   lint gutter) resolves clicks to constraint objects; identity holds
   in-process, and `{shapeLabel, predicate}` pairs are the clone-safe
   fallback for worker-side engines (the same dual strategy the
   error-anchoring uses).
2. **Node breakpoints**: a set of lexical term representations; the
   controller pauses any event whose focus/subject node matches.  In the
   data pane, a gutter click resolves via the millan dataset (position →
   quad → subject) to offer the node's lexical form.
3. **Predicate breakpoints** (free extra): break on every constraint for a
   property IRI.

## 4. Validation-side engine work (the unimplemented half)

- **Shape-level events come almost free**: `ShExValidator` already accepts a
  `tracker` (`{enter, exit, recurse, known}` — used by `LOG_PROGRESS`).
  Formalize it as the debug event source (add `node`/`shape` payloads it
  already passes) — that alone gives shape-granularity stepping.
- **TripleConstraint-level events need one hook in the regex engines**:
  both `eval-threaded-nerr` and `eval-simple-1err` are ours and pluggable
  (`options.regexModule`).  Add an optional `debugHooks.onConstraint(tc,
  triples)` callback threaded into their match loops; the wrapper
  regexModule pattern (wrap the configured engine, forward + emit) keeps the
  engines clean if we prefer no core changes.
- **Suspension**: in the worker, the tracker/hook callbacks call
  `controller.gate(event)`, which `postMessage`s the event and
  `Atomics.wait`s on the command cell; the UI writes
  resume/into/over/out/abort into the SAB and `Atomics.notify`s.  Abort
  throws a `DebugAbort` FlowControlError out of the engine.
- The **main-thread app** can reuse the identical UI against the worker
  validator (`shex-worker.html` already validates there); for
  `shex-simple.html`'s in-thread validator, debugging redirects validation
  through a transient worker (schemas/data already marshal — that path
  exists).

## 5. UI (web apps)

- A debug panel (hidden until "debug" is toggled in the Menu, carried in
  permalinks like `editors=`): ▶ continue, ⤵ into, ⏭ over, ⤴ out, ⏹ stop;
  a call-stack list (shape frames); the thread snapshot (for ShExMap: the
  binding-frame index and consumed-count against a rendered frame table —
  the `bindingsToTable` widget already renders frames).
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

## 7. Phasing

1. ✅ Materializer: `run()` generator + `MaterializerDebugger` + offset
   lookups + tests.
2. ✅ `shexmap-debug` CLI (REPL over the debugger — no engine work).
3. ✅ Web-app ShExMap debug panel (gutter, controls, highlights) — no
   engine work beyond what's shipped.
4. ✅ Validator shape-level stepping (CLI): `shex-debug` REPL over the
   tracker (blocking stdin is the suspension — a terminal debugger needs
   no worker); `--coi` in shex-serve for the browser side to come.
5. Validator TC-level events: regex-engine `debugHooks`.
6. Browser validation debugging (worker gate + Atomics) and a unified
   panel over both engines.

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
