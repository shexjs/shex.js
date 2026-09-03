# ShEx over RDF datasets — a strawman

ShEx validates a graph; SPARQL and RDF 1.1 speak of *datasets* — a default
graph and any number of named graphs. Data that arrives as a dataset (a
TriG dump, a quad store, a constellation of fetched documents) either gets
flattened before validation or can't say the thing that matters: *which
graph a statement is in*. This strawman adds one modifier to the triple
constraint so schemas can say it:

```
tripleConstraint ::= senseFlags? predicate ("GRAPH" (iri | "TERM" | "FRAGMENT"))?
                     inlineShapeExpression cardinality? …
```

Everything below is implemented on this branch: the grammar
([ShExJison.jison](../packages/shex-parser/lib/ShExJison.jison)), the
validator ([shex-validator.ts](../packages/shex-validator/src/shex-validator.ts)),
writer and visitor, TriG at every data mouth (loader, CLI, WebApp — worker
flavour included), and six manifest examples the suite machine-checks
([Datasets-test.js](../packages/shex-validator/test/Datasets-test.js),
[examples-test](../packages/shex-webapp/test/examples-test.js)).

## 1. The three flavours

**`GRAPH <g>` — a fixed graph.** The constraint speaks entirely of `<g>`:
its arc is found there and its value's whole subtree validates there — the
ShEx rendering of SPARQL's `GRAPH <g> { … }` around the pattern. The
motivating case is a housekeeping graph describing the rest of the dataset:

``` shex
<#S1> {
  ^ex:manages GRAPH <CardCatalog> @<#catalogEntry> ;
  ex:foo xsd:string
}
<#catalogEntry> { ex:manages IRI ; ex:source xsd:string ; ex:refresh xsd:date }
```

**`GRAPH TERM` — the value names its graph.** The arc matches in the
current view; the value's subtree validates in the graph *named by the
value*. SPARQL's `?x ex:chromosome ?c . GRAPH ?c { … }` — the arc outside
the block, the description inside. The motivating case is one-record-per-
graph datasets (each chromosome, each UniProt reference in its own graph):

``` shex
<#human-gene> { gene:chromosome GRAPH TERM @<#chromosome>* }
```

**`GRAPH FRAGMENT` — the value's document names its graph.** As `TERM`,
but the graph is the value IRI with its fragment stripped: exactly the
WebID/Solid arrangement, where `<https://alice.example/card#me>` is
described in the graph `<https://alice.example/card>`:

``` shex
<#Person> {
  a [foaf:Person] ;
  foaf:name xsd:string ;
  foaf:knows GRAPH FRAGMENT @<#Person> *
}
```

`GRAPH TERM` on a literal, or `GRAPH FRAGMENT` on anything but an IRI, is a
value error (`GraphNameViolation`): those values name no graph.

## 2. Semantics: views

Validation carries a **graph view** — which graph(s) of the dataset it is
looking at:

* The view starts as the **union** of the dataset. That is deliberate
  backwards compatibility: it is what a graph-blind validator over a quad
  store has always effectively done, so schemas without `GRAPH` keep their
  behaviour to the quad. `ShExValidator`'s `startGraph` option starts a
  validation elsewhere (a named graph, or the default graph proper).
* `GRAPH <g>` evaluates its constraint in `{g}`; `GRAPH TERM`/`FRAGMENT`
  match their arc in the ambient view and validate the value's subtree in
  the graph the value names. Unmodified constraints inherit the ambient
  view, so a shape reached through a switch stays in that graph — the
  catalog entry's own `ex:source` must be *in* the catalog.
* **A same-predicate arc outside a constraint's view is unmatched, not
  mismatched** — the constraint simply isn't speaking of it, as a SPARQL
  `GRAPH` block isn't. An open shape ignores it; `CLOSED` refuses it,
  because:
* **`CLOSED` and `EXTRA` close over the view**: the shape's neighborhood
  under a view is the view's arcs, plus the graphs its own `GRAPH <g>`
  constraints reach into. Noise about the same node in *other* graphs is
  outside a closed shape's jurisdiction.
* One node may validate against one shape **under two views with two
  answers**; the memoization and recursion marks are per-(node, shape,
  view). Cycles across documents (Alice knows Bob knows Alice, each in
  their own card) terminate the way recursive shapes always have.

## 3. Representations

ShExJ: `TripleConstraint.graph`, absent today, is an `IRIREF` or
`{"type": "GraphTerm"}` / `{"type": "GraphFragment"}`. ShExC writer and
visitor round-trip it. (ShExR: an `sx:graph` on `sx:TripleConstraint`
taking an IRI or one of two marker classes — staged with the doc, not yet
in the ShExR files.)

The data side needs no representation work at all: RDF/JS quads already
carry `graph`, `getNeighborhood` already returns them, and TriG is a
superset of Turtle — so every data mouth in the toolchain now parses TriG
(`application/trig`) and plain Turtle documents land in the default graph
unchanged. The one genuine hole this exposed: the WebApp's worker
marshalling serialized triples as (s, p, o) and silently flattened
datasets; quads now cross the boundary whole.

## 4. Status and scope

| piece | state |
|---|---|
| parse / write / visit `GRAPH` | done, with tests |
| validator views (all three flavours, CLOSED/EXTRA, per-view memo) | done — [Datasets-test.js](../packages/shex-validator/test/Datasets-test.js) |
| TriG: loader, CLI `-d`, manifest runner, WebApp panes, worker | done |
| examples | six manifest entries (card catalog, genes by graph, WebID profiles), pass and fail each |
| SPARQL / Wikibase neighborhoods | **union view only** — a graph view over SPARQL maps directly onto `GRAPH` clauses and is the obvious next implementation; the Wikibase db has no graphs to offer |
| slurp under views | untouched: slurped triples currently lose their graph |

## 5. Open questions

1. **Naming the default graph.** `GRAPH <g>` can't say "the default graph
   proper". `GRAPH DEFAULT`? (RDF 1.1 gives it no IRI on purpose.)
2. **Shape-level modifiers.** `<#Person> GRAPH FRAGMENT { … }` would say
   "instances of this shape live in their document's graph" once, instead
   of on every `foaf:knows`. It composes with arc-level modifiers and reads
   well for the WebID case; it's a second place to look during validation.
3. **Shape-map start views.** `<node>@<shape> GRAPH <g>` in a shape map —
   today only the validator-wide `startGraph` option exists.
4. **Union vs default start.** SPARQL deployments split on whether the
   unnamed view is the union; this strawman starts at the union for
   compatibility. Right long-term?
5. **Inverse arcs under `TERM`.** `^ex:p GRAPH TERM` follows the matched
   *subject* (the value of an inverse constraint). Is that the useful
   reading, or should an inverse constraint be able to follow the focus?
6. **Graph name patterns.** `GRAPH ex:~` (a stem), or a value-set of graph
   names, for datasets whose graph naming is a convention rather than a
   single IRI.
7. **Slurp/provenance.** A slurped validation should write TriG, keeping
   what it learned about *where* each triple lived.

## 6. RDF 1.2 triple terms (asked directly)

The question was whether triple terms are "similar to named graphs", what
to make of the quoted/asserted identity question, and whether `REIFIED`
earns its keep.

**Similar, but complementary.** A named graph *partitions assertions*: its
triples are asserted, in a place. A triple term *mentions without
asserting*: `<< tim foaf:knows henry >>` contributes no `foaf:knows` arc
anywhere. So `GRAPH` modifiers (where asserted data lives) and triple-term
constraints (statements about statements) don't reduce to each other, and a
schema language wants both doors.

**Prefer the reifier model.** RDF 1.2's final shape is not quoted triples
in subject position but *reifiers*: `_:a rdf:reifies <<( s p o )>>`, with
the annotations hung on `_:a`. That flattens your nested example — Bob's
dispute targets *the assertion node*, an ordinary IRI/bnode, by an ordinary
reference:

``` shex
<#Assertion> {
  rdf:reifies << @<#Person> foaf:knows @<#Person> >> ;
  ex:assertedBy @<#Person>
}
<#Dispute> {
  ex:disputes @<#Assertion> ;
  ex:isDisputedBy @<#Person> ;
  ex:disputeReason xsd:string ;
  ex:disputedOn xsd:date ;
  ex:confidence xsd:decimal
}
```

No `REIFIED` keyword: the reification predicate is just `rdf:reifies`, and
the new construct is a **triple-term value atom** — `<< subjectExpr
predicateIri objectExpr >>` — constraining the term's three components
positionally, the way Turtle writes it. (It coexists with the templates
branch's `<<`: template argument lists follow only a shape label or
reference, and this atom stands where a value expression stands.) Second
and higher levels come free, since a dispute references an assertion node,
not a nested quotation.

**On quoted vs. asserted identity: connect nothing implicitly, and note
that nothing needs to be.** The IRIs inside a triple term are the *same
terms* as everywhere else, so a component constraint like `@<#Person>`
above walks that term's ordinary, asserted neighborhood — the connection is
made exactly where a schema author writes it, per component. Quotation
itself should assert nothing (that is RDF 1.2's own stance: the triple term
is opaque, referentially transparent only in its terms), so a validator
must not infer personhood from being mentioned; but an author who wants "a
knowing is between two Persons *as asserted elsewhere*" simply says so, and
an author who wants pure syntax says `<< IRI foaf:knows IRI >>`. Both
spellings are one schema apart, which is where that decision belongs.
