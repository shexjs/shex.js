# ShEx for RDF 1.2 triple terms — a strawman, prototyped

The companion to [datasets](datasets.md) (its §6 has the modeling
discussion): what ShExC *says* about triple terms. This branch implements
it — grammar, term layer, validator, writer, worker marshalling — with a
use-case manifest the suite machine-checks
([TripleTerms-test.js](../packages/shex-validator/test/TripleTerms-test.js),
[triple-terms.shex](../packages/shex-webapp/examples/triple-terms.shex)).

## 1. Two constructs, no `REIFIED`

**A node kind.** RDF 1.2 adds triple terms as a new kind of term, so
ShExC's node kinds grow one:

```
nonLiteralKind ::= "IRI" | "BNODE" | "NONLITERAL" | "TRIPLE"
```

`rdf:reifies TRIPLE` says "reifies *some* triple term" the way `foaf:knows
IRI` says "knows some IRI". `NONLITERAL` keeps meaning iri-or-bnode, as it
always has; every pre-1.2 kind refuses triple terms.

**A positional atom**, spelled the way RDF 1.2's own Turtle spells the
term — `<<( … )>>`, parens included:

```
shapeAtom      ::= … | tripleTermAtom
tripleTermAtom ::= "<<(" ttComponent (predicate | ".") ttComponent ")>>"
ttComponent    ::= inlineShapeExpression
```

The three positions constrain the term's subject, predicate and object;
`.` means unconstrained, so `<<( . . . )>>` ≡ `TRIPLE`. Components are
full shape expressions, and the atom nests through its object position
exactly as RDF 1.2 nests triple terms.

Why this replaces `REIFIED`: reification is not a *mode* a shape is in but
an ordinary arc — `rdf:reifies` — whose value is a triple term. Giving the
value a syntax keeps everything existing composable around it: cardinality,
`EXTRA rdf:reifies`, junctions, named declarations
(`<#KnowingTT> <<( @<#Person> foaf:knows @<#Person> )>>`).

## 2. The `<<` question (asked directly)

Does a triple-term atom conflict with the templates branch's `<<…>>`
argument lists? Three answers, one per level:

* **Parser: no.** Even a bare-`<<` atom would be LALR-unambiguous beside
  templates — an argument list only ever follows a shape label or
  reference, an atom stands where a value expression starts, and
  `@<#L> <<…>>` can only be an application (the only thing ShExC lets
  follow a reference is a non-literal node constraint). The two grammars
  already coexist mechanically.
* **Reader: yes**, and that collision is worth respecting — which is why
  this branch spells the atom `<<( … )>>`: it is RDF 1.2 Turtle's own
  triple-term spelling, so the schema pattern looks like the data it
  matches, and it is visually disjoint from template lists without
  spending a keyword.
* **The keyword-plus-braces alternative is not free.** `TRIPLE { … }`
  already parses today: a node kind followed by a shape is their
  conjunction (`IRI { … }` is a legal schema), so braces would need a new
  bracket pair anyway — at which point `<<( )>>` is the bracket pair RDF
  1.2 already assigned.

On the attractive-nuisance point: the reifier model is on your side. The
mission-critical data stays in ordinary asserted triples (people, names,
disputes — all plain nodes and arcs here); the quoted term appears in
exactly one place, as `rdf:reifies`' value, pinning *which* statement an
annotation is about. A schema can even enforce that discipline:
`rdf:reifies` constraints are where triple terms may appear, and nothing
else in the shape touches them.

## 3. Semantics

A term `T` satisfies `<<( Se pe Oe )>>` iff `T` is a triple term, `pe` is
`.` or `T`'s predicate is `pe`, and `T`'s subject and object satisfy `Se`
and `Oe`. Component checks are ordinary shape checks of the component
*term* against **asserted** data, under the ambient
[graph view](datasets.md). Quotation asserts nothing and the validator
infers nothing from being mentioned; but the terms inside a triple term are
the same terms as everywhere else, so `@<#Person>` on a component walks
that term's asserted neighborhood — the connection exists exactly where a
schema author writes it, and `<<( IRI foaf:knows IRI )>>` is the purely
syntactic reading.

A triple term is a term, so it can be a shape's *focus*: its neighborhood
is what is said about it, and its reifiers are one `^rdf:reifies` away —
see use case 3 below.

## 4. Use cases explored (asked directly)

The manifest group **triple terms** (six entries, pass and fail) walks
these; findings after each.

1. **Provenance** — `<#Assertion> { rdf:reifies <<( @<#Person> foaf:knows
   @<#Person> )>> ; ex:assertedBy @<#Person> }`. The model fits exactly;
   nothing strains.
2. **Dispute / second-order talk** — `<#Dispute> { ex:disputes
   @<#Assertion> ; … }`. The reifier model *flattens* what nested
   quotation would tangle: no second-order construct needed, because the
   assertion is a node. Finding: most "nested triple term" examples in the
   wild are this case wearing the wrong clothes.
3. **Property-graph edge properties** — `rdf:reifies ( <<( IRI foaf:knows
   IRI )>> AND { ^rdf:reifies { ex:weight xsd:decimal } } )`. Finding, and
   the pleasant surprise of the exploration: *the term-as-focus works*.
   A triple term has a neighborhood, so LPG-style "the edge and its
   properties" validates with no new machinery — the conjunction reads
   "shaped like a knowing, and every reifier of it carries a weight".
4. **Mention without description** — `<#Mention> { rdf:reifies <<( IRI
   foaf:knows IRI )>> }` accepts quoted strangers; the same data fails
   `<#Assertion>`. The opacity dial demonstrated in two entries.
5. **Meta-annotation of an unasserted statement** — the nested atom
   (`rdf:reifies <<( . ex:assertedBy <<( . foaf:knows . )>> )>>`) covers
   the genuinely-nested case; tested, works, rarely needed given (2).

**The one that suggests a different construct — underscored.** "Every
*asserted* `foaf:knows` arc must be annotated" is not expressible with any
node-focused shape: nothing in RDF connects an asserted triple to the term
quoting it, so no walk gets from the arc to its reifiers. That is a gap in
*shape-side* reach, not in the term model — the fix that suggests itself is
an **arc-level construct** on the triple constraint (in the spirit of the
datasets branch's `GRAPH`), e.g.

```
foaf:knows @<#Person> REIFIER { ex:weight xsd:decimal }
```

"for each matched arc, some reifier of its quotation matches the shape."
Left as the headline open question rather than implemented; it is the one
place your original `REIFIED` instinct — a modifier, not a value — was
pointing at something the value atom cannot do.

## 5. Representations and status

ShExJ (additive): `nodeKind` gains `"tripleterm"`;
`TripleTermConstraint {subject?, predicate?, object?}` joins `shapeExpr`;
result solutions carry `TripleTermTest`, and a triple term serializes into
results as `{type: "TripleTerm", subject, predicate, object}`.

| piece | state |
|---|---|
| parse / write / visit `<<( )>>` and `TRIPLE` | done, round-trips |
| term layer (Turtle, LD, both ways) + SPARQL ordering of Quads | done |
| validator: atom, kind, term-as-focus, nesting | done — [TripleTerms-test.js](../packages/shex-validator/test/TripleTerms-test.js) |
| data mouths: `application/trig*` (classic star syntax; N3 has no `<<( )>>`/annotation syntax yet) | done |
| worker marshalling of Quad terms | done |
| examples | six manifest entries, machine-checked |
| `REIFIER` arc modifier (§4), value sets of ground terms, predicate value-sets | open |
| editor anchoring of quoted triples (lezer-turtle utterances for star data) | open |
