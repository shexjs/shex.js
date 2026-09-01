# Templates for ShEx — a strawman

ShEx schemas repeat structural patterns the language can't name. The
canonical case is [ShExR](../packages/shex-util/ShExR.shex), the schema for
ShEx schemas in RDF, which hand-writes the RDF-list shape nine times:

``` shex
<#ShapeDeclList1Plus> CLOSED {
  rdf:first @<#ShapeDecl> ;
  rdf:rest  [rdf:nil] OR @<#ShapeDeclList1Plus>
}
<#SemActList1Plus> CLOSED {
  rdf:first @<#SemAct> ;
  rdf:rest  [rdf:nil] OR @<#SemActList1Plus>
}
# …seven more…
```

This strawman adds parameterized shape declarations — **templates** — so the
pattern is written once and instantiated per element type:

``` shex
<#List1Plus><<?T>> CLOSED {
  rdf:first ?T ;
  rdf:rest  [rdf:nil] OR @<#List1Plus><<?T>>
}

<#ShapeDeclList1Plus> @<#List1Plus><< @<#ShapeDecl> >>
<#SemActList1Plus>    @<#List1Plus><< @<#SemAct> >>
```

The other motivating use is **design patterns applied consistently across a
wide schema with diverse contributors** — qualification, participation,
provenance — where today each contributor re-types (and drifts from) the
house pattern:

``` shex
<#Participation><<?PART, ?ROLE>> {
  ex:participant ?PART ;
  ex:role ?ROLE
}
<#Qualified><<?P IRI, ?V>> {       # a Wikidata-style qualified statement
  ?P ?V ;
  ex:certainty xsd:decimal ?
}

<#Procedure> {
  ex:surgeons @<#List1Plus><< @<#Participation><< @<#Surgeon>, @<#OrganSite> >> >> ;
  ex:height @<#Qualified><< ex:cm, xsd:integer >>
}
```

Everything below is implemented in shex.js behind this document:
[`ShExJison.jison`](../packages/shex-parser/lib/ShExJison.jison) parses it,
[`@shexjs/util/lib/templates`](../packages/shex-util/src/templates.ts)
expands it, the loader expands automatically, and
[`ShExR-templated.shex`](../packages/shex-util/ShExR-templated.shex) is
machine-checked to expand to exactly the hand-written ShExR
([`Templates-test.js`](../packages/shex-util/test/Templates-test.js)).
`shex-validate -x templated.shex …` just works.

## 1. The language

### Declaring

A parameter list after a shape label makes the declaration a template:

```
<#List1Plus><<?T>> CLOSED { rdf:first ?T ; rdf:rest [rdf:nil] OR @<#List1Plus><<?T>> }
```

* No `TEMPLATE` keyword: the parameter list is the marker, as in Cap'n
  Proto's `struct Map(Key, Value)`, Rust's `struct Point<T>`, Go's
  `type List[T any]`. (A keyword remains easy to add if scanning for
  declarations matters more than economy.)
* Parameters are SPARQL-style variables (`?T`), so uses inside the body read
  the way SPARQL and OTTR's stOTTR read, and no new lexical territory is
  claimed: a `?` glued to a name character is never valid cardinality, so
  old schemas can't contain the token.
* The body is any `shapeExpression` (or `EXTERNAL`): node constraints,
  junctions and `CLOSED { … }` shapes all template.
* A template may not be `ABSTRACT` and takes no `RESTRICTS` — it isn't a
  shape until instantiated.

### Parameter kinds and bounds

``` shex
<#Qualified><<?P IRI, ?V, ?W EXTENDS <#Participation>>> { … }
```

* Bare `?V` binds a **shape expression** (which includes references —
  `@<#X>` — and node constraints — `xsd:integer`, `IRI`, `[ex:a ex:b]`).
* `?P IRI` binds an **IRI**, usable in predicate position (`?P ?V`), in
  `EXTRA ?P`, and in annotation predicates. Undeclared kinds are inferred
  from use; a parameter used both ways is an error that asks for a
  declaration.
* `?W EXTENDS <#Base>` is a **nominal bound**: the argument must be a
  reference to a declaration that (transitively) `EXTENDS <#Base>` — Java's
  `<T extends Base>`, checked against ShEx's own inheritance relation.

### Applying

An argument list after a shape reference applies a template; arguments are
`inlineShapeExpression`s (or IRIs), comma-separated:

```
@<#List1Plus><< @<#ShapeDecl> >>          # a reference argument
@<#List1Plus><< IRI >>                    # a node-constraint argument
@<#List1Plus><< xsd:string OR @<#Stem> >> # any inline shape expression
@stl:List1Plus<< @<#SemAct> >>            # prefixed names apply too
```

Applications go anywhere a shape reference goes: value expressions,
`start = @<#L><<…>>`, other templates' bodies, and — importantly — as the
whole body of a declaration:

```
<#ShapeDeclList1Plus> @<#List1Plus><< @<#ShapeDecl> >>
```

A declaration whose body is an application **names that instantiation**:
the expanded shape carries the declaration's label, so everything referring
to `<#ShapeDeclList1Plus>` — spec prose, other schemas, shape maps —
continues to work. That is the migration path: ShExR-templated keeps every
label ShExR ever had. Two declarations naming the same instantiation leave
the later as an alias of the first.

### Expansion semantics

Templates are **monomorphized away** (C++/Rust-style, not Java erasure):
each distinct (template, argument-list) pair yields one plain `ShapeDecl`;
applications become references to it; the result is ShEx 2.1 with no new
validation semantics. What the argument means is fixed at the *application*
site (call-by-value over ASTs, not textual splicing), so DTD-parameter-
entity/C-preprocessor capture bugs can't arise — and hygiene is nearly free
anyway, since every name in play is an absolute IRI.

**Recursion terminates the way recursive shapes always have.** An
instantiation is registered under its label *before* its body expands, so
`@<#List1Plus><<?T>>` inside `<#List1Plus>` resolves to the label being
built — the equirecursive knot (μ-types; TAPL ch. 20–21). This is exactly
why ShEx can allow recursive templates where OTTR forbids template cycles
outright: labels + references already give the language `μ`. What must not
happen is recursion that *grows* its arguments (polymorphic recursion,
`<#Grow><<?T>>` applying `<#Grow><< { <deeper> ?T } >>`), which would mint
instances forever; the expander stops at `maxInstances` (default 100 per
template) with an instantiation trace. A decidable static check — the
*regular recursion* restriction from ML datatypes: on recursive paths,
arguments must be parameters or ground — is the planned upgrade.

**Deterministic labels.** An unnamed instantiation gets the label
`<templateIRI>(arg,…)` with each argument canonically serialized and
percent-encoded, so independent implementations mint identical labels and
schemas remain comparable. (Bikeshed freely; the property that matters is
*deterministic and injective*.) Idiomatic schemas name their instantiations
by declaration and never see these.

**Errors carry instantiation traces** — the C++-backtrace lesson, aimed at
Rust-quality reporting:

```
<#Grow> exceeded 8 instantiations — does its recursion grow its arguments?
  while instantiating
    <#Grow><<@<#w0>>>
    <#Grow><<{"type":"Shape",…}>>
    …
```

## 2. Representations

### ShExJ (JSON)

Three additive constructs; schemas without templates are byte-identical to
ShEx 2.1, and expansion removes all three, so interchange can always fall
back to expanded form (the way TypeScript ships JavaScript):

``` json
Schema           { …  templates:[TemplateDecl+] ?  shapes:[ShapeDecl+] ? }
TemplateDecl     { id:shapeDeclLabel  params:[Param+]  shapeExpr:shapeExpr }
Param            { name:STRING  kind:("iri") ?  extends:shapeDeclLabel ? }
TemplateApp      { template:shapeDeclLabel  args:[(shapeExprOrRef|ParamRef)+] }
ParamRef         { name:STRING }
```

with `shapeExprOrRef` widened to `… | TemplateApp | ParamRef` and
`TripleConstraint.predicate` (plus `extra` members and
`Annotation.predicate`) widened to `IRIREF | ParamRef` — inside template
bodies only, in practice, though the grammar states it globally the way
`shapeExprOrRef` already unions refs in.

### ShExR (RDF)

Two layers, separable:

1. **Nothing.** Expansion precedes serialization; a templated schema's
   *expanded* form is valid ShExR today. This is the interoperable floor,
   and it is why the templated ShExR demo isn't circular: it expands to the
   very schema that validates ShExR documents.
2. **Optionally**, represent unexpanded templates for tooling that wants
   source fidelity:

``` shex
<#TemplateDecl> CLOSED {
  a [sx:TemplateDecl] ;
  sx:params @<#ParamList1Plus> ;    # sx:Param: sx:name, sx:kind ?, sx:extends ?
  sx:shapeExpr @<#shapeExpr>
}
<#TemplateApp> CLOSED {
  a [sx:TemplateApp] ;
  sx:template IRI ;
  sx:args @<#shapeDeclOrExprList1Plus>
}
<#ParamRef> CLOSED { a [sx:ParamRef] ; sx:name xsd:string }
```

The prototype implements layer 1 (see the equivalence test); layer 2's
vocabulary is proposed here and staged in the spec repos as clearly-marked
strawman additions.

### Grammar (ShExC)

Deltas to [doc/bnf](bnf) (also staged as an issue-marked block in the spec's
grammar section):

```
[9]   shapeExprDecl   ::= "ABSTRACT"? shapeExprLabel templateParams? restrictions*
                          (shapeExpression | "EXTERNAL")
[9a]  templateParams  ::= "<<" templateParam (',' templateParam)* ">>"
[9b]  templateParam   ::= VAR ("IRI")? ("EXTENDS" shapeExprLabel)?
[23]  shapeRef        ::= (ATPNAME_LN | ATPNAME_NS | '@' shapeExprLabel) templateArgs?
[23a] templateArgs    ::= "<<" templateArg (',' templateArg)* ">>"
[23b] templateArg     ::= inlineShapeExpression
[18+] shapeAtom       ::= … | VAR
[56]  predicate       ::= iri | RDF_TYPE | VAR
[??]  VAR             ::= '?' (PN_CHARS_U | [0-9])
                              (PN_CHARS_U | [0-9] | #x00B7 | [#x0300-#x036F] | [#x203F-#x2040])*
```

**Why these tokens** — every alternative collides with existing syntax:

| candidate | collision |
|---|---|
| `<#L><T>` | `<T>` is a relative IRIREF: `<#L> <T>` already means "shape `<#L>` is datatype `<T>`" |
| `<#L>[T]` | `[…]` is a value set: `<#L> [ex:a]` is already a schema |
| `<#L>(T)` | `<#L> ( @<#A> OR @<#B> )` is already a parenthesized body |
| `<#L><<T>>` | **free**: `<<` is a lexical error in every position of ShExC today |
| `?T` | **free**: `?` glued to a name character can never follow a cardinality position legally |

One caveat on `<<`: RDF 1.2 uses `<<`/`>>` around reifying triple terms, and
a future "ShEx for RDF-star" might want them in *value* positions. Template
lists appear only immediately after a shape label or reference, so the two
can coexist by position — and RDF 1.2's final triple-term spelling is
`<<( … )>>`, which stays lexically distinct. Flagged, not resolved.

## 3. Precedents consulted

**Schema/data languages.**
*ASN.1 X.683* ("Parameterization of ASN.1 specifications") is the ISO-standard
proof that schema languages grow exactly this: `List{Type} ::= SEQUENCE OF
Type`, expansion-based, decades in production.
*OTTR* (Reasonable Ontology Templates, ottr.xyz) is the nearest RDF-world
relative: typed parameters, expansion semantics, `?x` variables in stOTTR —
but no recursive templates, which lists need; the μ-knot above is this
strawman's answer.
*Schematron abstract patterns* (`<pattern abstract="true">` + `is-a`/`param`)
are the closest XML-validation analog, textually substituted.
*DTD parameter entities* are the cautionary textual ancestor; *RELAX NG*
named patterns and *XSD* substitution groups show reuse-without-parameters
straining; *JSON Schema*'s `$dynamicRef`/`$dynamicAnchor` is a poor-man's
open recursion that a preprocessor usually replaces — evidence of the gap.
*Cap'n Proto* has real generics in an IDL (monomorphized at codegen);
Protobuf/Avro/Thrift's lack of them is a documented pain (well-known wrapper
types).
*SHACL* constraint components (`sh:parameter`, `$var` substitution into
SPARQL) are RDF-validation templates in production.
*Alloy*'s parameterized modules (`module util/ordering[elem]`) and
*Soufflé*'s generic components (`.comp Graph<T>`) show the pattern in
relational/logic modeling, both expansion-based.

**Programming languages.** C++ templates supply the memoized-monomorphization
model, the depth limit, and the error-backtrace lesson; C++20 concepts the
constraint question (below). Rust: bounds + the error-quality bar. Go: the
late-addition lesson — start with the minimal thing (they shipped without
variance, defaults, or HKT; so does this). Java/C#: `extends` bounds; also
the erasure contrast — an erased `List<T>` is today's untyped
`<#List1Plus>` workaround. ML's *regular datatypes* restriction is the
termination rule named above. TypeScript demonstrates both how natural
structural generics feel over data *and* the Turing-tarpit to avoid
(conditional types); this strawman deliberately has no type-level
computation.

**Theory.** Equirecursive μ-types (Pierce, TAPL ch. 20–21) justify the
knot-tying; regular vs. polymorphic recursion gives the termination
criterion; monomorphization finiteness is exactly "the set of reachable
instantiations is finite". For semantic bounds, note that ShEx schema
containment is intractable in general (see Staworko et al., *Complexity and
Expressiveness of ShEx*, ICDT 2015, and follow-on containment work) — which
is why the bound here is nominal, not structural.

## 4. Would traits/concepts help? (asked directly)

Yes — at the **concepts-lite** level, and it's in the prototype:

* **Kinds** (`?P IRI`, default shapeExpr) turn "substituted garbage deep in
  an instantiation" into "*?P of <#Qualified> wants an IRI; got
  {…Shape…}*" at the application site — precisely C++20's "no such
  function" → "trait X not implemented by Y" move.
* **Nominal bounds** (`?T EXTENDS <#Base>`) are Java-style bounded
  polymorphism riding ShEx's existing EXTENDS hierarchy — decidable, cheap,
  and meaningful to schema authors who already structure with ABSTRACT +
  EXTENDS.
* **Structural bounds** ("the argument must be subsumed by this
  expression") are the true concepts analog and the research-grade step:
  ShEx containment is intractable in general, so any such check would be a
  conservative approximation. Deferred, explicitly.
* Independent of constraints, the biggest ergonomic lever is the
  **instantiation trace** on every expansion error — cheap to implement,
  and it's what actually rescues C++ users daily.

## 5. Questions you should also be asking (asked directly)

1. **Termination policy.** Instance limit (shipped) vs. the regular-recursion
   static check (decidable, stricter, better errors) vs. both. Where do
   useful non-regular templates exist, if anywhere?
2. **Triple-expression templates.** `$<#label><<?T>>` parameterizing named
   triple expressions (the `facet_holder` idiom) — same machinery, second
   namespace. Worth the surface area?
3. **Variadics.** `<#Participation>` for *n* roles wants parameter packs or
   OTTR-style list expanders (`cross`, `zipMin`). Big step; real use cases
   first.
4. **Higher-kinded parameters** (a template as an argument — `<#Map><<?F,
   ?T>>` applying `?F<<?T>>`). Scala says possible, Go says don't start
   there. Deferred.
5. **Defaults** (`<<?T = IRI>>`) — cheap, C++/TS precedent, adds resolution
   rules. Probably yes, second round.
6. **Interchange stance.** Is templated ShExJ a *source* format with
   expansion mandatory before exchange (TypeScript model), or a first-class
   interchange form every consumer must expand? The prototype says: loaders
   expand; `templates` never reaches a validator.
7. **Stratification/negation checking** happens post-expansion — errors need
   the trace mapped back to template source. Same for the writer:
   serializing *unexpanded* schemas back to ShExC is unimplemented here.
8. **Shape maps and instances.** Can a shape map target `@<#List1Plus><<…>>`
   directly? (Today: no — name the instantiation with a declaration.)
9. **EXTENDS ?T** — a template *extending its parameter* is CRTP/mixins for
   shapes. Parses today via the widened grammar; semantics deliberately
   unexplored.
10. **The standard library.** `stl:` wants a home (`http://shex.io/lib/`?),
    versioning, and governance: List1Plus/List2Plus/ListOf, Qualified,
    Participation, LangMap… Who curates?
11. **Ecosystem.** lezer-shexc highlighting for `?T`/`<<`; ShExR layer 2;
    other implementations (shex-sparql, PyShEx); Wikidata EntitySchemas,
    where parameterized reuse is a long-standing wish.
12. **RDF-star.** Watch the `<<` neighborhood as ShEx grows triple-term
    support.

## 6. Status

| artifact | state |
|---|---|
| ShExC parsing | `@shexjs/parser` — [Templates-parse-test.js](../packages/shex-parser/test/Templates-parse-test.js) |
| Expansion | `ShExUtil.expandTemplates` / [`templates.ts`](../packages/shex-util/src/templates.ts) — [Templates-test.js](../packages/shex-util/test/Templates-test.js) |
| Loader/CLI/WebApp | the loader auto-expands after import merge; `shex-validate -x templated.shex` works, and both app flavours validate templated schemas through the same path ([templates-webapp-test.js](../packages/shex-webapp/test/templates-webapp-test.js), live at [shex.js.org/generics](https://shex.js.org/generics/)) |
| Validation | unchanged by design — [Templates-validation-test.js](../packages/shex-validator/test/Templates-validation-test.js) |
| ShExR demo | [ShExR-templated.shex](../packages/shex-util/ShExR-templated.shex) ≡ ShExR.shex, machine-checked |
| BNF | [doc/bnf](bnf) (marked strawman) |
| ShExJ.jsg / spec grammar | staged in shexSpec/shexTest and shexSpec/spec as marked strawman blocks |
| Writer, ShExR layer 2 | not yet |
