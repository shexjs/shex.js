# ShEx for RDF 1.2 triple terms — proposed syntax

The companion question to [datasets](datasets.md) (its §6 has the modeling
discussion): what should ShExC *say* about triple terms? This page is the
concrete answer — grammar, AST, semantics, worked examples. Proposed, not
yet prototyped; it is designed to drop into the same validator the datasets
branch extends.

## 1. Two constructs, no `REIFIED`

**A node kind.** RDF 1.2 adds triple terms as a fourth kind of term, so
ShExC's node kinds grow one:

```
nonLiteralKind ::= "IRI" | "BNODE" | "NONLITERAL" | "TRIPLE"
```

`rdf:reifies TRIPLE` says "reifies *some* triple term" the way `foaf:knows
IRI` says "knows some IRI" — no structure, just kind.

**A positional atom.** Where a shape expression can stand, a triple-term
pattern can stand, written the way Turtle writes the term:

```
shapeAtom      ::= … | tripleTermAtom
tripleTermAtom ::= "<<" ttComponent (predicate | ".") ttComponent ">>"
ttComponent    ::= inlineShapeExpression
```

The three positions constrain the term's subject, predicate and object.
`.` means unconstrained, as everywhere in ShExC, so `<< . . . >>` ≡
`TRIPLE`. Components are full shape expressions, so the atom nests through
its object position exactly as RDF 1.2 nests triple terms (a term's subject
cannot be a triple term; its object can).

Why this replaces `REIFIED`: reification in RDF 1.2 is not a *mode* a shape
is in but an ordinary arc — `rdf:reifies` — whose value is a triple term.
Giving the *value* a syntax (rather than the shape a modifier) keeps every
existing mechanism working around it: cardinality (`rdf:reifies << … >> +`),
`EXTRA rdf:reifies`, OR/AND/NOT over the atom, and a declaration can name
one (`<#KnowingTT> << @<#Person> foaf:knows @<#Person> >>`) to be
referenced like any other shape expression.

Lexical note: `<<`/`>>` are already free in ShExC (proved for the templates
strawman, whose argument lists only ever follow a shape label or reference;
this atom stands where a value expression stands, so the two coexist), and
`TRIPLE` joins `GRAPH`/`TERM`/`FRAGMENT` as a keyword that was never a
legal bare word.

## 2. Semantics

A term `T` satisfies `<< Se pe Oe >>` iff

1. `T` is a triple term;
2. `pe` is `.` or `T`'s predicate is `pe`;
3. `T`'s subject satisfies `Se` and `T`'s object satisfies `Oe`.

Component checks are ordinary shape-expression checks of the component
*term* against the dataset's **asserted** data, under the ambient
[graph view](datasets.md). That one sentence settles the quoted/asserted
question: quotation asserts nothing and the validator infers nothing from
being mentioned, but the terms inside a triple term are the same terms as
everywhere else, so `@<#Person>` on a component walks that term's asserted
neighborhood — the connection exists exactly where a schema author writes
it. `<< IRI foaf:knows IRI >>` is the purely syntactic reading; both
spellings are one edit apart, which is where that decision belongs.

## 3. Representations

ShExJ, additive:

``` json
NodeConstraint    { … nodeKind:("iri"|"bnode"|"nonliteral"|"literal"|"tripleterm") ? … }
TripleTermConstraint {
  subject:shapeExprOrRef ?     # absent = unconstrained
  predicate:IRIREF ?
  object:shapeExprOrRef ?
}
shapeExpr = … | TripleTermConstraint ;
```

ShExR: `sx:TripleTermConstraint` with `sx:ttSubject`, `sx:ttPredicate`,
`sx:ttObject`. Data side: RDF/JS already models quoted triples (termType
`"Quad"` in term position), N3.js parses `<<( … )>>` and lowers RDF 1.2's
reifying syntaxes to `rdf:reifies` — so, as with datasets, the data layer
is mostly already there.

## 4. The worked example

The scenario (from the datasets discussion): Alice asserts that Tim knows
Henry; Bob disputes Alice's assertion. In RDF 1.2 the annotations hang on
*reifiers* — ordinary nodes — which is what flattens the nesting:

``` turtle
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX ex:   <http://example.org/>
PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>

<tim>   a foaf:Person ; foaf:name "Tim Berners-Lee" .
<henry> a foaf:Person ; foaf:name "Henry Story" .
<alice> a foaf:Person ; foaf:name "Alice" .
<bob>   a foaf:Person ; foaf:name "Bob" .

# Alice's assertion: a reifier of the (unasserted) knowing
_:a rdf:reifies <<( <tim> foaf:knows <henry> )>> ;
    ex:assertedBy <alice> .

# Bob's dispute targets the assertion -- an ordinary node
_:d ex:disputes _:a ;
    ex:isDisputedBy <bob> ;
    ex:disputeReason "They have not been in contact for several years" ;
    ex:disputedOn "2024-01-16"^^xsd:date ;
    ex:confidence 0.30 .
```

``` shex
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX ex:   <http://example.org/>
PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>

# the triple term, named and referenced like any shape expression
<#KnowingTT> << @<#Person> foaf:knows @<#Person> >>

<#Person> {
  a [foaf:Person] ;
  foaf:name xsd:string ;
  foaf:knows @<#Person> *
}

<#Assertion> {
  rdf:reifies @<#KnowingTT> ;
  ex:assertedBy @<#Person>
}

<#Dispute> {
  ex:disputes @<#Assertion> ;      # a reference, not a quotation
  ex:isDisputedBy @<#Person> ;
  ex:disputeReason xsd:string ;
  ex:disputedOn xsd:date ;
  ex:confidence xsd:decimal
}
```

No second-order reification anywhere: `<#Dispute>` reaches the assertion by
reference, because the assertion *is a node*. The nested atom exists for
the case that genuinely needs it — disputing a statement nobody asserted:

``` shex
# Bob disputes the (unasserted) claim that the assertion was Alice's
<#MetaDispute> {
  rdf:reifies << @<#Assertion> ex:assertedBy @<#Person> >> ;
  ex:isDisputedBy @<#Person>
}
```

— one level of nesting per `rdf:reifies`, mirroring the data, never a
grammar special case.

And the kind alone, structure unconstrained:

``` shex
<#AnyAnnotation> { rdf:reifies TRIPLE ; ex:assertedBy IRI }
```

## 5. Open questions

1. **Value sets of triple terms**: `[ <<( <tim> foaf:knows <henry> )>> ]` —
   ground triple terms as valueSetValues. Natural, deferred.
2. **Predicate position**: a single IRI or `.` today; a value set of
   predicates (`<< . [foaf:knows foaf:met] . >>`) reads well and costs a
   grammar alternative.
3. **Classic quoted-subject data** (pre-1.2 RDF-star): the atom validates
   the *term*; data using quoted triples directly in subject position
   arrives from N3 as termType-Quad focus nodes and needs a decision about
   whether a bare quoted triple can be a focus at all.
4. **Facets**: none apply to triple terms; saying so in the spec text is
   the whole job.
