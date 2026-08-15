# Structured errors and how they read

A validation failure is a structure; what a reader sees is a rendering of
it. This note is about the structure and the renderings — what is wrong with
both today, and the order to fix them in.

It is a companion to [error-normalization.md](error-normalization.md), which
is about *what* to report (the nearest bag the schema accepts). This one is
about *how a report is shaped and said*.

## Where things stand

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

### Two renderers, disagreeing

There are two independent bodies of code turning errors into English:

| | `ShExHumanErrorWriter` (`@shexjs/util`) | `ErrorLeaves` (`@shexjs/editor-services`) |
| --- | --- | --- |
| feeds | `errsToSimple`, the CLI's `--human`, the apps' human interface | CodeMirror diagnostics: the red dots and their hovers |
| shape | an indented tree, nesting and connectives | one line per error, plus the anchors to place it |
| MissingProperty | `Missing property: <p>` | `missing expected property <p>` |
| TypeMismatch | `validating <o>:` then the nested cause | `<o> doesn't satisfy <constraint>` |
| NodeConstraint | reads `shapeExpr` **structurally** | takes the pre-stringified `errors[0]` |

They were written for different jobs, but the *sentences* are the same job
done twice, and they have drifted.

### Strings where structure belongs

A datatype mismatch carries this today:

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

Where a fragment of schema has to appear in a sentence, ShExC is the reader's
language, and the writer can already produce it for a fragment:
`_writeShapeExpr` renders that constraint as `xsd:integer mininclusive 3`.

### Two ways to say "or"

Alternatives are expressed twice over, in two idioms:

- **implicitly**, as `PossibleErrors.errors: error[][]` — an array of arrays,
  where the outer nesting *means* disjunction and nothing says so. Every
  consumer has to know. `errorList()` in the human writer flattens exactly
  this, which is why alternatives used to render as a conjunction.
- **explicitly**, as `repairs: Repair[]` (each a set of arcs to apply
  together) and `FeasibilityViolation.repairs` — added with the repair work,
  and self-describing.

One vocabulary should have one way.

## The plan

Sized as in [sonnet-task-list.md](sonnet-task-list.md): **S** ≈ an hour,
**M** ≈ a day, **L** = needs design review first.

### F1. One renderer (S)

Move sentence construction into one place — `describeError(err, ctx)` in
`@shexjs/util` — returning the text *and* the anchors an editor needs
(`schemaObj`, `predicate`, `triple`, `node`). `ShExHumanErrorWriter` composes
those into its indented tree; `editor-services` uses the same text for
diagnostics and hovers, keeping only its *anchor* extraction, which is
genuinely its own job. Golden tests over one table of errors, asserted by
both callers, so the two can't drift again.

### F2. ShExC in sentences, not JSON (S)

Give `@shexjs/writer` a public fragment entry point (`writeShapeExpr(expr,
{prefixes})`, wrapping what `_writeShapeExpr` already does) and use it from
the single renderer, so a message reads `…doesn't satisfy xsd:integer
mininclusive 3`. Prefixes come from the schema's own, so the sentence uses
the reader's spelling.

### F3. Structured leaves for node-constraint failures (M)

Replace `NodeConstraintViolation.errors: string[]` with typed leaves —
`{type: "DatatypeMismatch", expected, actual}`, `{type: "FacetViolation",
facet, expected, actual}`, `{type: "ValueSetMismatch", …}`, `{type:
"NodeKindMismatch", …}` — so no consumer parses English, and F1's renderer
has something to render. This changes the result structure, so it lands with
the one test rewrite (F5).

### F4. Say "or" once (S, with F3)

Give the disjunction a name: `{type: "Alternatives", of: [...]}` in place of
the bare `error[][]`, matching how `repairs` already reads. Then
`errorList()`'s flattening — which exists only to cope with the unnamed
nesting — goes away.

### F5. Then the companion note's step 4 (M)

With F1–F4 in place, repairs can become the primary account of a failure and
the classic errors its detail, and the failure tests that assert error
structure are rewritten **once**, for all of it, rather than once per step.

### F0. Before trusting any of it: the matcher (M/L)

`( :p . + ; :q . ){2}` over two `:p` and two `:q` should conform and every
engine reports `MissingProperty :p` — a repeated group with an unbounded
cardinality inside it needs a partition across its iterations, which neither
engine searches. shexTest repeats groups only over fixed inner cardinalities
(`open3Eachdotclosecard23`), so nothing catches it. A skipped test in
`packages/eval-threaded-nerr/test/EvalThreadedNErr-test.js` states the
expectation; un-skip it to work on this. A repair is only as good as the
matching it is computed from, so this gates F5 as much as F1–F4 do.
