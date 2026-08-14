# Reporting failures as repairs

An investigation of the eval-threaded-nerr blowup, and a proposal for what
"report all the errors" should mean.  The first part is done and committed;
the second is a design, with a prototype beside this note
(`repair-normalization-prototype.js`) that produces the numbers quoted here.

## 1. The blowup was not about errors

`wikidata-person.shex` over Q42 took **20.5 s** under eval-threaded-nerr and
**60 ms** under eval-simple-1err, and both said *conformant*.  Instrumented,
the shape's `EachOf` returned **64,800 threads**, and the count factors:

```
75 x 2 x 2 x 2 x 9 x 2 x 3 x 2 = 64,800
labels │ │ │  │  │ │  │ p:P569 statements
       │ │ │  │  │ │  given names (3)
       │ │ │  │  │ countries (2)
       │ │ │  │  occupations (8)
       │ │ │  date of death
       │ │ date of birth
       │ sex or gender
       (one factor per repeated constraint: candidates + 1)
```

One thread per combination of *how many* of each repeated constraint to
consume.  Every one of them passed; all but one were discarded.  No error was
involved anywhere.

The enumeration was redundant because the validator has already decided:
`t2tc` maps each triple to exactly one TripleConstraint before the engine is
called, and a triple the expression doesn't consume becomes an
`ExcessTripleViolation`.  So a constraint the expression reaches **once** can
take everything assigned to it at once — there is nowhere else for those
triples to go.  Fixed in `3a34634f`: 20.5 s → **4 ms**.

Two shapes of expression still need the enumeration and keep it: a constraint
reached twice through Inclusions shares one pool between two takers, and a
constraint under a repeated group is visited once per iteration.

The fix was checked by running the whole shexTest validation manifest through
the committed engine and the changed one: **1173 identical, 3 differing**, all
three of them ValidationFailure tests whose verdict is unchanged.  What
changed in those three is the shape of the report, and it is the subject of
the rest of this note.  For `:p . {2,5}` over six triples the old engine said:

> take 2 and four are excess · take 3 and three are excess · take 4 and two
> are excess · take 5 and one is excess

Four readings of one mistake.  The engine now reports the last of them: one
triple too many.

### A bug found on the way, not fixed

`( :p . + ; :q . ){2}` over `:p 1, 2 ; :q 3, 4` should conform — two
iterations, one `:p` and one `:q` each.  **Both** engines report
`MissingProperty :p`, before this change and after it.  A repeated group with
an unbounded cardinality inside it needs a partition across iterations that
neither engine searches.  shexTest repeats groups only over *fixed* inner
cardinalities (`open3Eachdotclosecard23`), so nothing catches it.  Recorded as
a skipped test in `packages/eval-threaded-nerr/test/`.

## 2. What "all the errors" reports today

The same data, missing an `mbox`, against two spellings of one language:

```shex
<S> { ( foaf:name . | foaf:givenName . ; foaf:familyName . ) ; foaf:mbox . }
<S> { ( foaf:name . ; foaf:mbox . | foaf:givenName . ; foaf:familyName . ; foaf:mbox . ) }
```

```
data: :x foaf:name "Bob" .

first spelling  -> MissingProperty foaf:mbox
second spelling -> FeasibilityViolation on the foaf:name triple
```

The second blames the one triple the node actually got right.  Both are
"correct" in that the node doesn't conform; neither is an account of what is
wrong with it, and they disagree because they are about the *parse*, not
about the data.

## 3. The proposal: say what would fix it

A ShEx triple expression denotes a set of **bags** — multisets of triple
constraints — which is the RBE view ShEx was designed around (Staworko et
al., ICDT 2015).  A node's neighborhood, once each triple is assigned to a
constraint, is also a bag.  So:

> **The error is the nearest accepted bag.**  Report the difference between
> what the node has and the closest thing to it the schema accepts: which
> arcs to add, which to take away.

This is defined on the language and the data, not on the syntax tree, so
equivalent schemas give equal answers — the normalization asked for.  From
the prototype, both spellings above, in every case:

| the node has | repair (identical for both spellings) |
| --- | --- |
| a name | `+1 foaf:mbox` |
| nothing at all | `+1 foaf:name, +1 foaf:mbox` |
| a given name and an mbox | `+1 foaf:familyName` |
| name, given name and mbox | `-1 foaf:givenName` |

A real choice stays a choice.  For `{ :a . | :b . }` with nothing at all, the
answer is `+1 :a` **or** `+1 :b` — two repairs, because the language offers
two.  Alternatives survive exactly where they mean something, which is what
the "n errors" in the engine's name should have meant all along.

### The algorithm

Not the prototype's exhaustive search: a bottom-up dynamic program over the
expression, which is the repair version of the interval computation ShEx
tractability already rests on — and of `feasibility.ts`, which computes the
same intervals as a *refutation* today.

For a subexpression `E` and a number of iterations `r`, compute the minimum
cost of accounting for the observed counts in `E`'s slice of the constraints:

- **TripleConstraint** `p{m,M}` with `c` observed: the best count is `c`
  clamped to `[m, M]`, at cost `max(0, m - c) + max(0, c - M)`.
- **EachOf**: the children partition the constraints, so the cost is the sum
  of the children's.
- **OneOf**: the minimum over the branches — and the argmin set is where
  alternative repairs come from.
- **cardinality `{m,M}` on a group**: minimize over `r ∈ [m, M]`, with each
  child's total in `[r·m_child, r·M_child]`.

Costs are small integers and `r` is bounded by the observed counts, so this is
linear in the expression times a small factor — no threads, no backtracking,
and complete over the counts.  Recovering the witness bag by backtracking
gives the repair; keeping every argmin gives the alternatives.

### What it does not normalize, and shouldn't

- **Value-level failures** (`TypeMismatch`, a failed shape reference) are
  per-triple, already canonical, and orthogonal: they say a triple is wrong,
  where repairs say the *shape* of the neighborhood is wrong.  A node can
  need both reports.
- **The assignment** of triples to constraints when more than one could take
  a triple (`EXTRA`, a predicate constrained twice with different value
  expressions).  Counts and assignment then interact, and general RBE
  matching is NP-hard; ShEx's tractable class is deterministic SORBE, the
  same restriction that makes the DP above exact.  Outside it, the honest
  move is a min-cost bipartite assignment inside the DP.
- **Repeated groups with unbounded inner cardinalities** — the coupling
  `feasibility.ts` deliberately ignores, and the corner where §1 found both
  engines already wrong.  A repair story is only as good as the matcher
  underneath it.
- **Which repair to prefer** when several tie.  Report the set; picking one
  is a UI decision, not a semantic one.

### What adopting it would cost

The result shape already fits: `PossibleErrors` is a disjunction of error
lists, which is what a set of repairs is.  What changes is which errors
appear in them, so the failure tests that assert error *structure* would need
rewriting — the ones that assert conformance would not.  Worth doing in this
order:

1. Compute repairs alongside the current errors and expose them under a new
   key; nothing breaks, and the two can be compared over shexTest.
2. Move the WebApp's error rendering to repairs (this is where the payoff is
   visible: "add one `foaf:mbox`" beside the constraint it belongs to).
3. Replace the classic errors once the repairs have been read in anger for a
   while, and rewrite the failure tests then, once.

## Literature

The pieces exist and mostly predate the problem.

- **Staworko, Boneva, Labra Gayo, Hym, Prud'hommeaux, Solbrig,
  "Complexity and Expressiveness of ShEx for RDF", ICDT 2015**
  ([LIPIcs 31:195–211](https://drops.dagstuhl.de/storage/00lipics/lipics-vol031-icdt2015/LIPIcs.ICDT.2015.195/LIPIcs.ICDT.2015.195.pdf)).
  Neighborhoods as regular bag expressions; validation is intractable in
  general and tractable for deterministic schemas over *single-occurrence*
  RBEs.  The bag view and the tractable class this proposal lives in.
- **Ahmetaj, David, Ortiz, Polleres, Shehu, Šimkus, "Reasoning about
  Explanations for Non-validation in SHACL", KR 2021**, and **Ahmetaj,
  David, Polleres, Šimkus, "Repairing SHACL Constraint Violations Using
  Answer Set Programming", ISWC 2022**
  ([springer](https://link.springer.com/chapter/10.1007/978-3-031-19433-7_22)).
  The same move for SHACL: explain non-validation *as a repair* — additions
  and deletions that would make the data conform — with minimality by
  cardinality or by set inclusion, and the complexity of asking for them.
  The closest prior art, and the vocabulary to borrow.
- **Aho & Peterson, "A Minimum Distance Error-Correcting Parser for
  Context-Free Languages", SIAM J. Comput. 1(4):305–312, 1972**
  ([doi:10.1137/0201022](https://doi.org/10.1137/0201022)).  The original
  minimum-distance parse: report the fewest errors that would make the input
  parse.  The DP above is this idea over bags instead of strings.
- **Schulz & Mihov, "Fast String Correction with Levenshtein Automata",
  IJDAR 2002**, for the automaton form of the same thing, if the tree DP ever
  needs to become an automaton product.
- **Liffiton & Sakallah, "Algorithms for Computing Minimal Unsatisfiable
  Subsets of Constraints", JAR 2008**, for the MUS/MCS duality — the reason a
  set of minimal repairs and a set of minimal explanations are two views of
  one thing, worth knowing before designing the report format.
