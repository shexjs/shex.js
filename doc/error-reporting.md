# Structured errors and how they read

A validation failure is a structure; what a reader sees is a rendering of
it. This note is about the structure and the renderings — what is wrong with
both today, and the order to fix them in.

It is a companion to [error-normalization.md](error-normalization.md), which
is about *what* to report (the nearest bag the schema accepts). This one is
about *how a report is shaped and said*.

All of F0–F4 is done on the `error-repair` branch, and F5 by halves; each
section below says what landed.  [error-reporting-comparison.md](error-reporting-comparison.md)
shows the same three failures as `main` and as this branch render them.

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

`repairs` is opt-in because the search needs what only the validator has:
the schema with its index, and the node's bag as it stood before the
matching search pruned it (§5 of the companion note). A renderer holds
neither, so it cannot compute repairs from a result alone. The alternative —
always computing them — would charge every caller for an answer most don't
want. Hence a flag: **off in the library, on in the apps and behind
`validate --repairs`.**

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

### F5. Then the companion note's step 4 (M) — half done

The presentation half is in: where a failure carries repairs, the report
**leads** with them and the classic errors are the detail underneath.

```
validating :x as :S:
  to conform: add 1 foaf:mbox
    missing property <foaf:mbox>
```

The other half — making them the *default*, so every consumer gets them —
is left for review.  Turning it on measured fine (13 ms at its worst over
shexTest, and no verdict moves) but it puts a `repairs` key in every failure
anyone has ever compared against a fixture: 36 tests here, and whatever else
downstream.  That is a decision for someone ready to rewrite those fixtures
in one go, which is what this step was always about.  `{repairs: true}`,
`validate --repairs`, and the apps ask for it today.

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

eval-threaded-nerr — the default — now handles it.  eval-simple-1err still
doesn't: it takes as many triples as a maximum allows and never gives any
back, so the first iteration eats both `:p`s.  Backtracking across
iterations there is a change to an NFA simulation rather than a bug fix, and
a test in `packages/eval-threaded-nerr/test/` records the difference rather
than leaving it to be rediscovered.
