# Structured errors and how they read

A validation failure is a structure; what a reader sees is a rendering of
it. This note is about the structure and the renderings — what is wrong with
both today, and the order to fix them in.

It is a companion to [error-normalization.md](error-normalization.md), which
is about *what* to report (the nearest bag the schema accepts). This one is
about *how a report is shaped and said*.

F0–F5 are done; each section below says what landed.  F0 was a matcher
fix rather than a reporting one, so it sits on `main` with the
eval-simple-1err fix that followed it; F1–F5 are the `error-repair`
branch.  [error-reporting-comparison.md](error-reporting-comparison.md)
shows what the structures and the sentences look like either side of it.

## What was wrong

### The verdict is independent of the presentation; the structure is not fully

Validation decides conformance, and nothing about presentation can change
that: measured over the shexTest validation manifest, turning repairs on
moves **0 verdicts of 1176**. Renderers read the result and never re-run the
validator.

But "presentation is a pure function of the result" is only half true, and
the half that isn't is worth naming. What the validator *puts in* the result
depends on how it was asked: `results: "api"`, the regex engine (which
decides whether a failure carries one account or several), and now
`repairs: true`. So a renderer is a pure function of the structure it is
given — and how much structure it is given is a validation-time choice.

`repairs` has to be computed by the validator, not by a renderer: the
search needs the schema with its index, and the node's bag as it stood
before the matching search pruned it (§5 of the companion note). A
renderer holds neither. It is now **on unless refused** — a failure that
says only what is wrong leaves the reader to work out what would be right,
and that is the whole of what this answers. `{repairs: false}` and
`validate --no-repairs` decline it.

### Two renderers, disagreeing — fixed (F1)

There were two independent bodies of code turning errors into English:

| | `ShExHumanErrorWriter` (`@shexjs/util`) | `ErrorLeaves` (`@shexjs/editor-services`) |
| --- | --- | --- |
| feeds | `errsToSimple`, the CLI's `--human`, the apps' human interface | CodeMirror diagnostics: the red dots and their hovers |
| shape | an indented tree, nesting and connectives | one line per error, plus the anchors to place it |
| MissingProperty | `Missing property: <p>` | `missing expected property <p>` |
| TypeMismatch | `validating <o>:` then the nested cause | `<o> doesn't satisfy <constraint>` |
| NodeConstraint | reads `shapeExpr` **structurally** | takes the pre-stringified `errors[0]` |

They were written for different jobs, but the *sentences* were the same job
done twice, and they had drifted.  The leaf sentence is now
`describeError` in `@shexjs/util`, called by both; the tree writer keeps
composition, editor-services keeps anchoring.

### Strings where structure belongs — fixed (F2, F3)

A datatype mismatch used to carry this:

```json
{"type": "NodeConstraintViolation",
 "shapeExpr": {"type": "NodeConstraint", "datatype": "…#integer", "mininclusive": 3},
 "errors": ["Error validating \"bob\" as {\"type\":\"NodeConstraint\",\"datatype\":\"…#integer\",\"mininclusive\":3}: mismatched datatype: …"]}
```

The constraint *is* there as a structure — that part of the old complaint is
out of date. What is still true is that the leaf explanation is a **string
with a JSON blob embedded in it**, and that the two renderers disagree about
which to trust: the human writer uses the structure and reads tolerably, the
editors use the string, so a red dot's hover shows a reader raw ShExJ.

It now carries `{type: "DatatypeMismatch", expected, actual, message}`, and
the sentence is rendered from it — `has type xsd:string, not xsd:integer`.
Where a fragment of schema appears in a sentence it appears as ShExC, via
the writer's new public `writeShapeExpr`, in the schema's own prefixes.

### Two ways to say "or" — fixed (F4)

Alternatives were expressed twice over, in two idioms:

- **implicitly**, as `PossibleErrors.errors: error[][]` — an array of arrays,
  where the outer nesting *means* disjunction and nothing says so. Every
  consumer has to know. `errorList()` in the human writer flattens exactly
  this, which is why alternatives used to render as a conjunction.
- **explicitly**, as `repairs: Repair[]` (each a set of arcs to apply
  together) and `FeasibilityViolation.repairs` — added with the repair work,
  and self-describing.

One vocabulary should have one way, and now does: `{type: "Alternatives",
errors: [{type: "AllOf", errors: [...]}, ...]}`.  The field keeps the name
`errors` on purpose — `"errors" in x` is how a failure is recognised
throughout the validator — but both levels say what they are.

That fixed a bug hiding behind the ambiguity: the validator spread the
engine's alternatives into the failure's error list, so `:a . | :b .` over
a node with neither reported *missing :a AND missing :b* — a choice read as
a requirement to do both.

## The plan

Sized as in [sonnet-task-list.md](sonnet-task-list.md): **S** ≈ an hour,
**M** ≈ a day, **L** = needs design review first.

### F1. One renderer (S) — done

Move sentence construction into one place — `describeError(err, ctx)` in
`@shexjs/util` — returning the text *and* the anchors an editor needs
(`schemaObj`, `predicate`, `triple`, `node`). `ShExHumanErrorWriter` composes
those into its indented tree; `editor-services` uses the same text for
diagnostics and hovers, keeping only its *anchor* extraction, which is
genuinely its own job. Golden tests over one table of errors, asserted by
both callers, so the two can't drift again.

### F2. ShExC in sentences, not JSON (S) — done

Give `@shexjs/writer` a public fragment entry point (`writeShapeExpr(expr,
{prefixes})`, wrapping what `_writeShapeExpr` already does) and use it from
the single renderer, so a message reads `…doesn't satisfy xsd:integer
mininclusive 3`. Prefixes come from the schema's own, so the sentence uses
the reader's spelling.

### F3. Structured leaves for node-constraint failures (M) — done

Replace `NodeConstraintViolation.errors: string[]` with typed leaves —
`{type: "DatatypeMismatch", expected, actual}`, `{type: "FacetViolation",
facet, expected, actual}`, `{type: "ValueSetMismatch", …}`, `{type:
"NodeKindMismatch", …}` — so no consumer parses English, and F1's renderer
has something to render.  Landed with `PatternMismatch` too, each leaf
keeping its old English as `message` for consumers that haven't learned the
types.  The reference results this moved were regenerated, but only the 39
whose content actually changed: `REGEN=1` also rewrites 201 files whose diff
is key order alone, which deep-equal ignores and a reviewer shouldn't have
to read.

### F4. Say "or" once (S, with F3) — done

Give the disjunction a name, matching how `repairs` already reads.  Watch
that `errors` is load-bearing: it is the failure marker the validator tests
for, so the *type* carries the meaning and the field name stays.

### F5. Then the companion note's step 4 (M) — done

Where a failure carries repairs, the report **leads** with them and the
classic errors are the detail underneath.

```
validating :x as :S:
  to conform: add 1 foaf:mbox
    missing property <foaf:mbox>
```

And they are now the default, so every consumer gets them.  Turning it on
was expected to cost 36 fixtures; it cost **three**, because most of what
it would have written turned out to be output nobody wanted, and two rules
fell out of looking at it:

- **A repair of cost 0 is no repair.**  Cost 0 says the arcs this node has
  are already a bag the shape accepts, so it failed on something a bag
  can't speak to — a value, a semantic action — and "to conform: change
  nothing" is worse than silence.  A closed shape lands here too, and that
  one is a gap rather than a nuisance: the honest answer is "remove 1 :b",
  but the arcs a `ClosedShapeViolation` complains about belong to no
  triple constraint, so the bag search never sees them.
- **A satisfied `NOT` is not repaired.**  It succeeded *because* the shape
  inside it failed, and that failure is recorded as the reason.  Repairs
  there are instructions for breaking what just worked, so they are
  stripped from what a `ShapeNotResults` carries.  This alone accounted
  for 24 of the fixtures.

`validate --no-repairs` and `{repairs: false}` decline the search;
`--repairs` is still accepted, and now says what is already true.

**Answered on read.**  A failure carries `repairs` as a property computed
when something asks for it, not when the failure is made.  That matters
more than it sounds: a search that ultimately *succeeds* still fails
branches on the way, and every failed branch used to be asked what would
repair it.  Over shexTest's parser round-trip -- where all 2325 tests pass
and no failure reaches a caller at all -- that was 5485 repair searches,
and it took the file from 1.7s to 14.4s, most of the whole suite's
slowdown.  Now it is 0 searches and 1.3s.

It stays an ordinary enumerable property: it serializes, deep-equals and
enumerates as an eagerly-computed one would, and the first read replaces
the accessor with the value so nothing recomputes.  The one visible
difference is that a failure whose arcs were never the problem now *has*
the property and answers `undefined`, where before the key was absent --
`JSON.stringify` omits it either way, so only an in-memory `deep.equal`
against a hand-built object can tell.  Two things fell out of that:
`stripRepairs` reads by key rather than by entry (`Object.entries` would
run every accessor it is trying to avoid), and SemActs-test compares
through JSON, which is what its fixture is.

### F0. Before trusting any of it: the matcher (M/L) — done for the default engine

`( :p . + ; :q . ){2}` over two `:p` and two `:q` should conform and every
engine reported `MissingProperty :p`.  It wanted no new search after all:
two places where threads shared what they should own.

- The pool a constraint's triples come from was copied by reference when a
  thread forked — the Map cloned, the arrays inside it not — and threads
  take their triples by splicing them out.  The two prefix-length threads of
  the first iteration drained `:p` between them.  (`eval-simple-1err` had
  the same sharing, with a comment saying reuse was "safe… but I've not
  thought about it".)
- `matchRepeat` gave up on the first thread that couldn't take another
  iteration, discarding the ones that could.

eval-simple-1err failed the same case for a third reason, of its own kind,
and it also turned out to want no new search: its `do…while` was already
written to offer each larger take as its own thread, but it started at the
*maximum*, so the loop never went round twice and the first iteration ate
both `:p`s.  Starting at the minimum is the fix; `addStates` keeps `taken`
by reference and appends to `thread.matched` in place, so each turn needs
its own of both.

Both fixes are on `main` (`c018dc49`, `e526b191`) — they are matcher
corrections, useful whether or not any of the rest of this lands.

Neither fixed the cost, and the cost was the bigger problem.  The ways to
split N triples across iterations are the compositions of N, and both
engines searched them all.  On `( :p . + ; :q . )*` over N of each:

| N | 18 | 19 | 20 | 21 | 22 | 30 | 50 | 100 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| before | 7.3 s | 17.9 s | 69.5 s | 293 s | out of heap at 4 GB | | | |
| after | 4.9 ms | | 9.1 ms | | 7.5 ms | 18.3 ms | 111 ms | 1.56 s |

That is `c1ea5d18` on `main`, and it wanted no interval arithmetic after
all — only the observation that the search was enumerating *pasts* when
what it needed was *futures*.  Two threads at the same point in a repeated
group with the same triples left match the rest of the expression the same
way; they differ in which iteration took which triple, which is the
witness, and any one witness will do.  So the frontier keeps one thread
per distinct remaining count and the compositions of N collapse to the N+1
counts they can leave behind.

It is sound because of t2tc: the validator has already given each triple
to exactly one triple constraint, so the triples in a pool are
interchangeable and none is wanted anywhere else, and counts therefore
identify the future exactly.  If an engine were ever handed triples that
several constraints could claim, the key would have to say *which* triples
remain rather than how many.

This is the same insight the SORBE literature reaches by another road
(Staworko et al. ICDT 2015): counts compose, so nothing need ever ask
which `:p` belongs to which iteration.  What ShEx adds is that a report
names which triple matched which constraint, so the witness can't be
discarded outright — only deduplicated down to one.
