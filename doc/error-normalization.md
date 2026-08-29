# Reporting failures as repairs

An investigation of the eval-threaded-nerr blowup, and what "report all the
errors" should mean.  All of it is built.  §3 says what a triple with
nowhere to go would take to settle it, which is a repair asked at one place;
§4 asks it of the whole neighborhood at once, which is what makes the answer
independent of how the schema was written.  The prototype beside this note
(`repair-normalization-prototype.js`) is what §4 was designed against and
still runs; `packages/shex-validator/src/repairs.ts` is the real thing.

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

## 2. Where the reporting started

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

## 3. What the refutation layer says now

Some of §4 is built, at the place a refutation is raised rather than over
the expression as a whole.  A triple the schema has nowhere to put is
reported with what would settle it:

```shex
<QuantityShape> {
  :value xsd:decimal ; :unit xsd:string ;
  ( :code xsd:string ; :system IRI? )?     # a :system wants a :code beside it
}
```
```
data: [ :unit "kg" ; :system <http://unitsofmeasure.org> ]

Missing property: http://hl7.org/fhir/value
AND
Triple _:b http://hl7.org/fhir/system http://unitsofmeasure.org
  fits no triple constraint: either add http://hl7.org/fhir/code, or remove it.
```

Two independent faults, two reports, and the second says both ways out.
The error carries them as data too — `repairs: [{type: "AddArcs", arcs:
[...]}]` — one entry per alternative, each naming the arcs that go together.

Where it is exact, and where it is a heuristic:

- **A missing property explains a homeless triple only if supplying it
  would seat it.**  `( :a . ; :b . )` holding only a `:b` reports the
  missing `:a` alone — the `:b` is homeless *because* of it.  Supplying a
  `:value` leaves the `:system` above just as stranded, so both are said.
- **Every constraint that could have taken the triple is asked**, so a
  `:z` three branches offer a home to reports all three ways out rather
  than whichever constraint pruning removed last.
- **Where no single arc settles it, the arcs that settle it together**:
  `( :a . ; :b . ; :c . )?` holding only a `:c` says "either add `:a` and
  `:b`, or remove it".  One minimal set, found by granting everything and
  putting back what turns out not to be needed — not every minimal set,
  which is what §4 is for.
- **Short of a minimum counts as absent.**  One `:d` where the schema
  wants two is as unsatisfiable as none: it is granted before the question
  is asked (so nothing beside it is wrongly called homeless) and reported
  as a missing property.
- **Of the partitions tried, the one that found least wrong is reported.**
  The code said "report only last errors until we have a better idea", and
  the last one tried is an accident of enumeration order — it could name a
  constraint as missing because the partition being reported had left its
  triple unassigned.  Fewest-errors is a heuristic, not a semantics; §4's
  minimum-distance bag is the principled version.

Measured over the shexTest validation manifest: **1181 tests, 0 verdicts
changed, 7 reports changed**, three of them a cardinality shortfall that now
reads `Missing property` where it read "this triple fits nowhere" —
which is what eval-simple-1err has always said about it.

The two spellings in §2 now agree on the *advice* — both name `foaf:mbox`
as the thing to add — while still differing in form: one reports a missing
property, the other a triple with nowhere to go that a `foaf:mbox` would
seat.  Making the report itself identical is what remains.

## 4. Saying what would fix it

A ShEx triple expression denotes a set of **bags** — multisets of triple
constraints — which is the RBE view ShEx was designed around (Staworko et
al., ICDT 2015).  A node's neighborhood, once each triple is assigned to a
constraint, is also a bag.  So:

> **The error is the nearest accepted bag.**  Report the difference between
> what the node has and the closest thing to it the schema accepts: which
> arcs to add, which to take away.

This is defined on the language and the data, not on the syntax tree, so
equivalent schemas give equal answers — the normalization asked for.  Ask
the validator for them (`{repairs: true}`) and it attaches them to each
Failure; both spellings of §2, in every case:

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

The §3 Quantity, whose `:system` is contingent on a `:code`, now ends its
report with two whole recipes rather than one arc's worth of advice:

```
  to conform: add 1 :value and remove 1 :system, or add 1 :value and add 1 :code
```

### The algorithm

Not the prototype's exhaustive search: a bottom-up dynamic program over the
expression, which is the repair version of the interval computation ShEx
tractability already rests on — and of `feasibility.ts`, which computes the
same intervals as a *refutation*.

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
and complete over the counts.  The bags come back with the costs rather than
being recovered by backtracking, since they are small; keeping every argmin
gives the alternatives.

One thing the note didn't foresee: the counts arrive per *constraint*, and a
triple satisfying one of two indistinguishable constraints satisfies the
other, so which one it was counted against is an accident of the caller.
The triples of each arc are pooled and dealt out again every way they can be,
and the best deal is the answer.  Without that, the two spellings of §2
disagree about a node holding a given name and an mbox — the second spelling
constrains `foaf:mbox` twice, and the answer depended on which of the two got
the count.

Over the shexTest validation manifest with repairs on: **1176 tests, 0
verdicts moved**, 561 failures carrying a repair and 16 carrying none (see
below), the slowest 13 ms.  Q42 against the person schema is 38 ms with
repairs on, against 52 ms without — the search is not what costs.

### What it does not normalize, and shouldn't

- **Value-level failures** (`TypeMismatch`, a failed shape reference) are
  per-triple, already canonical, and orthogonal: they say a triple is wrong,
  where repairs say the *shape* of the neighborhood is wrong.  A node can
  need both reports.  Most of the 16 failures above that carry no repair are
  these: the bag is right, so there is nothing for a bag repair to say.
- **The assignment** of triples to constraints when more than one could take
  a triple (`EXTRA`, a predicate constrained twice with different value
  expressions).  Counts and assignment then interact, and general RBE
  matching is NP-hard; ShEx's tractable class is deterministic SORBE, the
  same restriction that makes the DP above exact.  Outside it, the honest
  move is a min-cost bipartite assignment inside the DP.
- **Repeated groups with unbounded inner cardinalities** — the coupling
  `feasibility.ts` deliberately ignores, and the corner where §1 found both
  engines already wrong.  A repair story is only as good as the matcher
  underneath it.  (`FeasibilityCoupling-test` now checks the layer never
  refutes a bag the engines accept, over every small bag of five such
  expressions; the engines' own wrongs it turned up -- a cardinality on a
  group overwriting the constraint's, a group taken zero times -- are
  fixed.)
- **Arcs the expression never mentions** are not the DP's to see: a
  triple whose predicate is nowhere in the shape is in no bag.  A closed
  shape's refusal of one is still a repair -- "remove it" -- and the
  validator adds it to every way the bag has (or reports it alone, where
  the bag was fine): the rest of those 16 carry one now.
- **Which repair to prefer** when several tie.  Report the set; picking one
  is a UI decision, not a semantic one.  The set is capped (8 bags carried
  through the DP, 64 deals of a repeated arc) because ties multiply; a schema
  that hits either cap gets some of its alternatives, not all.

### What adopting it would cost

The result shape already fits: `PossibleErrors` is a disjunction of error
lists, which is what a set of repairs is, and §3's errors already carry a
`repairs` field of the shape a bag repair would use.  What changes is which
errors appear, so the failure tests that assert error *structure* would need
rewriting — the ones that assert conformance would not.  §3 is step 1 of
this, done at the refutation layer:

1. ~~Compute repairs alongside the current errors and expose them under a
   new key~~ — done for homeless triples (`repairs` on
   FeasibilityViolation); the same for missing and excess arcs is the DP.
2. ~~Compute the whole-neighborhood repair and compare it with the classic
   errors over shexTest, behind a flag~~ — done: `{repairs: true}`, measured
   above, and `errsToSimple` ends a failure with "to conform: ...".
3. ~~Move the WebApp's error rendering to repairs~~ — done: the apps ask for
   repairs, the results say "to conform: ..." in words, and each arc is
   pinned on the constraint it is about, so "to conform: add 1" sits beside
   the `foaf:mbox` the node hasn't got.  The flag stays off by default in the
   library (a caller that doesn't want the search shouldn't pay for it) and
   on in the apps, which is where a reader is.
4. Replace the classic errors once the repairs have been read in anger for a
   while, and rewrite the failure tests then, once.  Two things gate it, and
   neither is code that could be written today: the repairs have to be *used*
   — `validate --repairs` (and `--human`) is how, which is why it exists —
   and the matcher underneath them has to be right, which it isn't for a
   repeated group with an unbounded cardinality inside it (§1's "a bug found
   on the way", filed as F0 in [error-reporting.md](error-reporting.md)).  A
   repair is only as good as the matcher it is computed from.

## 5. Implementation note: the pruned state is not the node

Every reporting feature in §3 and §4 was written wrong the first time, in
the same way, and it is worth saying why once.

`pruneInfeasibleCandidates` implements the arc-consistency pass the spec
describes ([algorithms.html §Bag-Directed Search with Partial-Bag
Refutation](https://shexspec.github.io/spec/algorithms.html)): for every
(triple, candidate constraint) pair, if committing that one triple is
already refutable, delete the pair.  It does that **by mutating `t2tcs`**.

The pruning is sound as a search filter — it only ever deletes pairs that
appear in no accepted matching, so the set of accepted matchings is
unchanged, which is exactly what the spec promises.  But the corollary is
easy to miss: *anything else* computed from that structure afterwards is
not unchanged.  When a node cannot conform for any reason, refutation
cascades and can empty every triple's candidate list — so the state after
pruning says "this node has nothing", whatever the node has.

Three features read it anyway, and each was wrong in a way that looked like
a different bug:

| asked after pruning | what it reported |
| --- | --- |
| does the missing property explain this homeless triple? | granting it never helped, because the node's other arcs had been deleted too |
| what would seat this homeless triple? | nothing would, so every report said "remove it" |
| what bag does this node have? | the empty bag, so every repair said "add everything" |

The rule, for anything that reports rather than searches: **count the node
before the search starts**.  `hi0` (candidate counts) and `observedBag`
(the bag) are both computed immediately after `matchByPredicate` and before
the first deletion, and the reporting code takes them as arguments rather
than re-reading `t2tcs`.  A comment at the mutation site says so, since
that is where the next person will be standing.

This is not peculiar to this codebase — any validator that prunes and then
reports has the same trap — which is why it may be worth a sentence in the
spec's pruning section: the invariant it states is about *accepted
matchings*, and readers should not extend it to the pre-matching itself.

## See also

[error-reporting.md](error-reporting.md) — the shape of an error and how it
reads: two renderers that have drifted, strings where structure belongs, and
the order to fix them in.  This note says *what* to report; that one says
*how a report is shaped and said*.

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
