# ThreadedMaterializer — NFA-thread materialization for ShExMap

Prototype: [`lib/ThreadedMaterializer.js`](../lib/ThreadedMaterializer.js),
tests: [`test/ThreadedMaterializer-test.js`](../test/ThreadedMaterializer-test.js).

## The problem with the single-cursor materializer

`binder()` in `shex-extension-map.js` keeps **one** mutable pointer (`stack`)
into the binding tree, marks bindings used by `delete`ing them, and sets
`stack = null` when it runs off the end. `trivialMaterializer` /
`ShExMaterializer` walk the target schema depth-first against that shared
state. When a required constraint deep in a subtree can't be satisfied, the
subtree is eliminated — but the bindings it consumed stay consumed and the
pointer stays advanced. Whether materialization succeeds therefore depends on
the order in which the DFS happened to touch variables.

The regex engine used for materialization (`eval-simple-1err-materializer.js`,
`rbenx`) is *already* a Thompson-style thread simulation over the schema's
triple expression — but its threads all share the one binder, so a doomed
thread poisons its siblings. The missing piece is not the NFA; it's making the
**binding-tree cursor part of the per-thread state**.

A minimal demonstration (also a regression test in
`ThreadedMaterializer-test.js`): with bindings `{v1: "x"}` against

```shexc
<S> {
  (:a . %Map:{ :v1 %}; :b . %Map:{ :v2 %})?;   # v2 is unbound
  :c . %Map:{ :v1 %}                           # required
}
```

the optional group consumes `v1` at `:a`, dies at `:b`, and the required `:c`
should then get `v1` back. The current implementation instead:

* fed the bare bindings object (as `Map-test.js` does), `getter`'s miss on
  `v2` sets `stack = null`, permanently poisoning the binder — `:c` is
  silently dropped and materialize returns an **empty graph**;
* fed an array-wrapped tree `[{v1: "x"}]` (as `bin/materialize` builds it),
  `_simplify` unwraps the single-element array to a bare object and `getter`'s
  miss on `v2` **infinite-loops**: `while (!Array.isArray(next)) { last =
  nextStack.pop(); next = getObj(nextStack); }` never exits because
  `getObj([])` returns the non-array root over and over (V8 profile: 95% of
  ticks in `getter`, shex-extension-map.js:323).

The threaded materializer returns `_:root :c "x"`.

## Design

### Input tape: normalized binding frames

`normalizeBindingTree()` reproduces the `_mults`/`_cross` preprocessing that
`binder()` applies: a binding whose variable occurs exactly once beneath an
array level (e.g. `bp:name` next to the list of repeated BP groups) is
distributed into every frame produced by the sibling arrays, and the tree
flattens to a **sequence of frames** — each frame one association of variable
bindings (e.g. `{sysVal: 110, sysUnits: mmHg, diaVal: 70, …, name: Sue}`).
This turns the binding tree into a linear input tape, which is what makes the
regex analogy exact.

The cursor is `{idx, used}`: stay on the current frame if it has an unused
binding for the requested variable, else scan forward; never move backward
(same association-preserving discipline as `binder().get`). Both lookups and
"used" marks are **functional** — `cursorGet` returns a new cursor and never
mutates the old one, so forked threads are fully independent.

### Machine: NFA + call stack + counters

Each target `Shape`'s triple expression compiles (once, cached) to an NFA:

| state   | meaning |
|---------|---------|
| `TC`    | synthesize exactly **one** instance of a triple constraint |
| `Split` | `OneOf` — ordered outs encode disjunct priority |
| `Rept`  | counted repetition (`?`, `*`, `+`, `{m,n}`): `outs[0]` = loop body, `outs[1]` = exit |
| `Match` | end of this shape's expression |

Cardinality lives entirely in `Rept` states, so a `TC` visit is a single
consume/emit step — uniform for variables, constants and subshapes.

Shape references (`fhir:component @<sysBP>`, inline shapes) make this a
*recursive* transition network: a shape-valued `TC` invents a bnode, emits the
linking triple, pushes a return frame `{nfa, outs, subject, repeats}` and
enters the subshape's NFA. `Match` with a non-empty call stack pops back into
the caller. (Formally the machine is a pushdown transducer; see the DFA
section for what that costs us.)

Shape *expressions* compose at the NFA level: `ShapeAnd` concatenates its
conjuncts' NFAs against the same subject (`NodeConstraint` conjuncts restrict
the focus node, not its arcs, so they contribute no emissions and are
skipped — this handles targets like the vpr-FHIR
`start=@<Condition> AND {fhir:nodeRole [fhir:treeRoot]}`), and `ShapeOr`
compiles to a prioritized `Split` over its disjuncts. `ShapeNot` synthesis is
rejected with a clear error.

A **thread** is one immutable configuration:

```
{ nfa, stateNo,            — where in which shape's NFA
  callStack,               — persistent list of return frames
  subject,                 — node whose arcs we're emitting
  repeats,                 — {reptState: count} for this shape instance
  cursor: {idx, used},     — THE private binding-tree pointer
  quads,                   — persistent list of emitted triples
  bnode }                  — bnode allocator
```

A `TC` step that finds its variable unbound simply pushes nothing: the thread
dies, taking its cursor marks *and its emitted triples* with it. The sibling
thread that took one fewer repetition / skipped the optional / chose the other
disjunct proceeds from an uncorrupted cursor. Rollback is not implemented —
it's free, because nothing was ever shared.

### Scheduling and acceptance

The worklist is a stack with greedy priority — prefer another repetition,
prefer the emitting arm of an optional, prefer the first `OneOf` disjunct —
with one demotion: a `TC` whose variable lookup has to **advance the frame
cursor** is a choice point, not a fait accompli.  Its continuation is parked
on a deferred queue (resumed oldest-first, so the greedy leader stays in
front) while every alternative that can still consume from the current frame
explores first.  Without this, `( card:phone %{ :tel } | card:mbox
%{ :email } )+` over frames `[{use,email},{use,email},{use,tel}]` pairs
frame 0's `:use` with frame 2's `:tel` and, being first, that mix would win
(the `splits` example in ../examples/manifest.json demonstrates exactly
this with both disjunct orderings).

Acceptance is no longer first-past-the-post.  Every accepting thread is
recorded — deduplicated on *which bindings it consumed*, so variants that
differ only in constant emissions collapse onto the most-emitting one — and
`materialize()` returns the accept that consumed the most bindings (ties:
fewest bindings forfeited by cursor advances, then most quads emitted, then
discovery order).  The full list is exposed as `materializer.accepts`
(`{quads, consumed, skipped, thread}`), `materializer.chosen` marks the
winner, and `lastReport.alternatives` counts them, so UIs can hand the
choice to the user when the materialization is ambiguous (the `ambiguous`
example; shexmap-simple renders the alternatives as buttons, and
`shexmap-debug`'s `t` command lists them).

This DFS scheduling makes the prototype equivalent to a backtracking regex
engine. Nothing in the thread structure depends on that choice: stepping all
threads in lockstep (PikeVM style, as `rbenx` does) works identically and
needs a dedup key of `(stateNo, callStack, cursor)` — which would also
subsume the exploration budget below.

Guards: unbounded cardinalities clamp at `maxRepeat` (50, like
`MAX_MAX_CARD`), cyclic shape references die at `maxCallDepth`, a global
`maxSteps` bounds pathological fan-out, and once one thread has accepted,
`exploreSteps` (default 10000) bounds how long the search keeps hunting for
better/alternative materializations before settling for the best so far
(`lastReport.explorationTruncated` says whether it settled); `maxAccepts`
caps the alternatives list.  Optional constraints that are *always*
synthesizable (constants, staticVar-only Map codes) compile without a skip
arm — skipping them gains nothing and their variants would multiply the
search space.  Dead ends are recorded and reported in `MaterializationError`
when no thread accepts.

### Semantic differences from the current materializer

* A **required** `TC` whose Map variable is unbound kills its thread (and so
  eliminates the containing node, propagating outward until an optional /
  starred ancestor absorbs the failure). The old `visitTripleConstraint`
  silently skipped the triple, leaving a partially-populated node behind.
* `staticVars` are exposed as globals — always readable, never consumed —
  rather than `bin/materialize`'s trick of unshifting them as an extra
  binding-tree entry (which made each static var single-use and lost to any
  binding that moved the cursor past frame 0; the vpr-FHIR fixture's
  `PARAM-status` now survives into the output).
* **Progress guard**: a `Rept` may only take a repetition beyond the first if
  the previous iteration consumed at least one *frame* binding (globals and
  constants keep a subexpression satisfiable forever, so an unguarded starred
  constant-only subshape would loop to `maxRepeat`). One binding-free
  iteration is allowed, matching the old `maxAdd = 1` behavior for
  unrecursed repetition.
* **Vacuous-descend rule**: greedily entering an *optional* shape-valued `TC`
  whose subshape then emits nothing and consumes nothing would leave a
  dangling `<parent> <p> _:empty` link; that thread is dropped in favor of
  the already-queued skip arm. Required constraints keep their empty islands,
  as the old materializer's output did.

## Could this be a DFA?

Short answer: yes for the *recognition* half, with three standard tricks; the
*emission* half then needs tagged transitions. Whether it's worth it depends
on reuse of the compiled schema.

What stands between the thread machine and a textbook DFA:

1. **The alphabet looks infinite.** Transitions test "does the current frame
   have an unused binding for variable *v*?" — the frame's *values* flow into
   the output but never influence control. So the effective input symbol is
   the frame's **signature**: the subset of schema variables it binds. The
   alphabet is `2^V` for the finite set `V` of variables mentioned in the
   target schema — finite, and in practice tiny (each schema touches few
   variables, and only the signatures that actually occur matter). This is
   the same abstraction that makes lexer DFAs practical over Unicode:
   transition on character *classes*, not characters.

2. **Recursion makes it a pushdown machine.** Subset construction doesn't
   apply to PDAs in general. But materialization recursion is bounded: if the
   target schema's reference graph is acyclic (all the ShExMap examples are),
   every shape call can be **inlined** to a finite NFA; if it is cyclic, the
   existing `maxCallDepth` already imposes a finite unrolling, so the same
   inlining applies up to that depth. After inlining there is no stack.

3. **Counters.** `{m,n}` repetitions either unroll into the NFA (standard,
   size `O(n)` per repeat) or stay as counters in a *counting-DFA* (as used
   by RE2-style engines for bounded repeats). `*`/`?` need nothing special.

After those three, determinize: a DFA state is a **set of NFA configurations**
(the classic subset construction), and the input tape is the frame-signature
sequence. One wrinkle is that a single frame can satisfy several `TC`s (the
cursor stays on a frame until it's exhausted), so the natural formulation
consumes one *(frame, variable)* pair per transition, or equivalently
pre-splits each frame into the sub-signature sequence the schema can consume.
"Used" marks then don't need to be part of the DFA state at all — they are
exactly the position on the tape, which is the one thing a DFA gets for free.

That determinizes *acceptance*: a single left-to-right pass over the frames
answers "is there a materialization, and where does each repetition stop?"
with no backtracking, in `O(frames)` — the powerset construction has already
merged what the thread list discovers dynamically. (A **lazy DFA** à la RE2 —
memoize `threadSet × signature → threadSet` as this prototype runs — gets the
same speedup without the exponential up-front construction, and degrades
gracefully to NFA simulation when the memo table blows a size budget. That
would be the pragmatic next step: the thread sets this prototype builds *are*
the DFA states.)

Emission is where a plain DFA stops being enough: a DFA state that merges two
NFA paths no longer knows *which* triples to emit — the machine is really a
finite-state **transducer**, and nondeterministic transducers are not
determinizable in general precisely because merged paths carry different
outputs. The standard escape is the one submatch-extraction engines use
(Laurikari's tagged automata, re2c/RE2's TDFA): annotate NFA transitions with
**tags** (here: "emit triple pattern *t* with the values consumed at this
step", "allocate bnode *b*"), determinize the recognizer, and have the DFA
maintain tag *registers* plus per-state disambiguation (our greedy priority is
exactly a POSIX-leftmost-longest-style disambiguation policy, which TDFA
handles). At accept, the winning register set replays into the output graph.
Equivalently and more simply: run the DFA once to decide repetition counts and
disjunct choices, then make a second, now fully deterministic, pass to emit —
a two-pass bidirectional-transducer factoring.

Cost/benefit: per binding tree, deduped NFA simulation is already
`O(frames × states)`; a DFA only shaves the `states` factor and pays for it
with subset-construction size (worst-case exponential in the schema, mitigated
by laziness). It wins when one compiled target schema materializes many
binding trees — the ShExMap batch-translation case — and the frame-signature
alphabet keeps it small. For one-shot use, the thread machine in this
prototype is the right tool; its immutable-thread structure is also exactly
the shape a TDFA compiler would consume, so nothing here is thrown away on the
way to a DFA.

## Where it's wired in

* **`bin/materialize`** builds a `ThreadedMaterializer` from the target schema
  with `--jsonvars` as `staticVars` (CLI tests: `test/Map-cli-test.js`,
  including a `validate --extension | materialize` round trip over the
  BPDAMFHIR pair).
* **shexmap-simple.html** (`doc/ShExMapInMainApp.js`): `DirectShExMaterializer`
  materializes with `MapModule.ThreadedMaterializer` and adds the returned
  quads to the result graph directly.
* **shexmap-worker.html** (`doc/ShExMapInWorkerApp.js` /
  `doc/ShExMapWorkerThread.js`): the worker materializes with
  `MapModule.ThreadedMaterializer` and posts `WorkerMarshalling`-encoded quads
  back to the page (the old protocol shipped a validation-result structure).
  Statics travel in the `materialize` request as `staticVars`.
* The module exposes it as `Map(...).ThreadedMaterializer` (and
  `MaterializationError`), in node and in the webpacked `ShExWebApp` bundle
  alike.

## Trying it

```sh
./node_modules/.bin/mocha packages/extension-map/test/ThreadedMaterializer-test.js
TEST_cli=true ./node_modules/.bin/mocha packages/extension-map/test/Map-cli-test.js
```

```js
const {ThreadedMaterializer} = require("@shexjs/extension-map/lib/ThreadedMaterializer");
const materializer = new ThreadedMaterializer(targetSchema, {staticVars: {...}});
const quads = materializer.materialize(bindingTree, "tag:myRoot"); // RdfJs quads
```

The tests drive all five `examples/manifest.yaml` entries straight from their
stored bindings JSON (including `symmetric`, which the validation-driven
`Map-test.js` skips), plus regression cases where a failing branch must not
corrupt the surviving branch's cursor — the scenarios that motivated this
design.
