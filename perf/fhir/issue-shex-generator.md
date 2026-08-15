## `fhir.shex` does not parse, and once it does it accepts everything

Validating the published TTL examples against the published `fhir.shex` with
[ShEx.js](https://github.com/shexjs/shex.js) turned up four problems in the
generated schema. The first stops the schema from parsing at all; the third
means that once it does parse, it accepts any document you give it.

Source: `http://build.fhir.org/fhir.shex`, fetched 2026-08-15 (1439 shapes).
Line numbers are from that file.

Each fixup below is applied mechanically in
[`perf/fhir/bench.js`](https://github.com/shexjs/shex.js/blob/main/perf/fhir/bench.js)
(`schemaFixups`), so the list is executable and the count reports itself —
the goal is "fixups applied: 0".

---

### 1. `<Resource>` is declared twice, for two different jobs

The parser rejects the schema outright: `http://hl7.org/fhir/Resource already defined`.

```diff
 # ~line 4246
-<Resource> CLOSED {
-}# Potential outcomes for a subject with likelihood
+# (see #2 below for what belongs here)

 # ~line 13184
-<Resource>  @<Account> OR
-	@<ActivityDefinition> OR
-	... 194 alternatives ...
-	@<Uuid>
+# deleted: see rationale
```

The second is the "any resource" union — 194 alternatives, the same 194
shapes `<All>` enumerates. It reads like a pre-`EXTENDS` idiom: a hand-rolled
way to say "anything derived from Resource". With `EXTENDS` it is redundant,
and worse than redundant — it is illegal. `<Account> EXTENDS <DomainResource>`,
`<DomainResource> EXTENDS <Resource>`, and the union names `<Account>`, so the
extension hierarchy has a cycle. The spec's [Acyclic Extension
Requirement](https://shex.io/shex-semantics/#acyclic-extension-requirement)
says that graph **MUST** be acyclic. (ShEx.js followed the cycle until the
stack gave out; that's our bug and it's fixed, but the schema is still
ill-formed.)

Deleting it loses nothing **provided `<Resource>` is `ABSTRACT`** — see #2. A
value-position `@<Resource>` against an abstract shape already means "any
non-abstract shape extending Resource", which is exactly what the union was
for, and it is what the 52 `@<Resource>` references should resolve to. The
enumeration should simply be removed rather than renamed.

### 2. `<Resource>` is emitted with no elements and no `ABSTRACT`

Per [its own StructureDefinition](http://build.fhir.org/resource.profile.json),
`Resource` is `abstract=true`, based on `Base`, with four elements:

```
Resource.id             System.String  [0..1]
Resource.meta           Meta           [0..1]
Resource.implicitRules  uri            [0..1]
Resource.language       code           [0..1]
```

None of them are in the schema — `implicitRules` does not appear anywhere in
the file. What is emitted also lacks the `a [fhir:Resource]?; fhir:nodeRole
[fhir:treeRoot]?;` preamble that every other shape carries, including
`<Base>` (whose emptiness is correct, since `Base` genuinely has no
elements). That asymmetry suggests an emission failure rather than a
deliberate stub.

```diff
-<Resource> CLOSED {
-}
+ABSTRACT <Resource> EXTENDS @<Base> CLOSED {
+    a [fhir:Resource]?;fhir:nodeRole [fhir:treeRoot]?;
+
+    fhir:id @<Id>?;
+    fhir:meta @<Meta>?;
+    fhir:implicitRules @<Uri>?;
+    fhir:language @<Code>?;
+}
```

The consequence today: every resource carrying a `fhir:id` fails against the
`CLOSED` shapes that extend `<Resource>`, because nothing in the chain
declares `fhir:id`.

### 3. `<All>` joins its per-type guards with `OR`; they need `AND`

**This is the one that matters most.** As published, the schema accepts
anything at all.

```diff
 <All> (NOT { fhir:nodeRole [fhir:treeRoot] ; a [fhir:Account] } OR @<Account>) OR
-	(NOT { fhir:nodeRole [fhir:treeRoot] ; a [fhir:ActivityDefinition] } OR @<ActivityDefinition>) OR
-	... 193 more, joined with OR ...
+	(NOT { fhir:nodeRole [fhir:treeRoot] ; a [fhir:ActivityDefinition] } OR @<ActivityDefinition>) AND
+	... 193 more, joined with AND ...
```

Each term is correct on its own: "either this node isn't a T tree-root, or it
conforms to `<T>`". But joined with `OR`, satisfying any single term satisfies
the whole. A node is at most one type, so ~193 of the 194 terms hold
vacuously through their `NOT` branch and `<All>` passes regardless of content.

Demonstrated: with the schema as published, `account-example.ttl` validates as
conformant *and so does the same file with an invented property
(`fhir:NOT_A_REAL_PROPERTY`) added and its `fhir:status` changed to
`"NOT_A_STATUS"`*. With `AND`, all three outcomes come out right.

### 4. `<Uri>` has no `fhir:l`, though every URI-valued node carries one

FHIR RDF gives a URI-valued node both spellings — the lexical form as
`fhir:v` and the IRI as `fhir:l`:

```turtle
fhir:system [ fhir:v "urn:oid:0.1.2.3.4.5.6.7"^^xsd:anyURI ;
              fhir:l <urn:oid:0.1.2.3.4.5.6.7> ]
```

`<Reference>` is the only shape in the file that declares `fhir:l`, so every
other such node fails its `CLOSED` shape with `unexpected fhir:l`.

```diff
 <Uri> EXTENDS @<PrimitiveType> CLOSED {
     a [fhir:Uri]?;
+    fhir:l IRI?;

     fhir:v xsd:anyURI?;
 }
```

On `<Uri>` it reaches `Url`, `Canonical`, `Oid` and `Uuid` through `EXTENDS`.
This alone takes the first 60 examples from 3 conformant to 29 — the largest
single gap after #3.

### 5. `<Xhtml>` is referenced but never declared

```diff
 # line 3292
     fhir:div @<Xhtml>;

+# nothing anywhere declares <Xhtml>
```

One reference, no declaration, so every document with a Narrative fails with
`shape http://hl7.org/fhir/Xhtml not found`. Either declare it or point
`fhir:div` at an existing shape.

### 6. (minor) `ABSTRACT` is never emitted

`grep -c '^ABSTRACT' fhir.shex` → `0`, though `Base`, `Resource`,
`DomainResource` and `Element` are all `abstract=true` upstream. Worth an
audit beyond `<Resource>`: without it, an abstract type can be matched
directly, and value-position references to it don't dispatch to descendants.

### 7. (cosmetic) a comment is glued to a closing brace

```diff
-}# Potential outcomes for a subject with likelihood
+}
+# Potential outcomes for a subject with likelihood
```

Harmless to parsers, but it's at exactly the site of #1/#2 and may be the same
emission slip.

---

With 1–5 applied the schema parses and validates, and 66 of the first 300
examples conform (against 4 before #4, and 0 before any of this, when the
schema did not parse).

The other 227 I can't yet attribute, and I'd rather say so than guess. What
is known:

* About 28% of them are **reference scope**, not schema errors. The schema
  requires a referenced resource to be present *and conformant in the same
  graph* — `fhir:coverage @<Reference> AND {fhir:l @<Coverage>?}` — and a
  single example document doesn't contain the resources it points at.
  Relaxing reference targets to plain IRIs moves 39/118 to 61/118. Loading
  all 2165 example documents into one store instead makes references resolve
  but is *stricter*, since the referents then get validated too.
* The rest is still open. Clustering the failures is confounded by ShEx
  reporting every failed branch of a large disjunction, so the common leaves
  (`ShapeNotFailure`, `ValueSetMismatch` against `[rdf:nil]`) are artifacts of
  `<All>`'s guards and of `rdf:rest [rdf:nil] OR @<OneOrMore_X>`, not causes.

Happy to dig further on any of these if it's useful.
