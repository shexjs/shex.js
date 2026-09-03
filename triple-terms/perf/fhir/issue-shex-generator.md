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

### 5. `<PositiveInt>` and `<UnsignedInt>` can never match their own values

`<Integer>` constrains `fhir:v` to `xsd:int`, and both extend it:

```
<Integer>     fhir:v xsd:int MININCLUSIVE -2147483648 MAXINCLUSIVE 2147483647?;
<PositiveInt> EXTENDS @<Integer> CLOSED { a [fhir:PositiveInt]?; }
<UnsignedInt> EXTENDS @<Integer> CLOSED { a [fhir:UnsignedInt]?; }
```

Since `EXTENDS` conjoins and a literal has exactly one datatype, neither can
narrow `xsd:int` to the type its own values actually carry. And the examples
never emit `xsd:int` at all — across the published corpus:

| datatype | occurrences |
| --- | --- |
| `xsd:nonNegativeInteger` | 2423 |
| `xsd:positiveInteger` | 295 |
| `xsd:long` | 39 |
| `xsd:int` | **0** |

So every `positiveInt` and `unsignedInt` value in every example fails. Two
ways out, and it's really a question for whoever owns the RDF writer too
(see w3c-cg/hcls-fhir-rdf#245): either the writer emits the datatype implied
by the FHIR *type* rather than the narrowest one that fits the *value*, or
these shapes stop extending `<Integer>` and declare their own —

```diff
-<PositiveInt> EXTENDS @<Integer> CLOSED {
+<PositiveInt> EXTENDS @<PrimitiveType> CLOSED {
     a [fhir:PositiveInt]?;
+    fhir:v xsd:positiveInteger?;
 }
```

Accepting the union of all four is worth 60 → 83 of the first 118 examples.

### 6. `fhir:l @<Target>` asks a single document to contain the world

```
fhir:securityContext @<Reference> AND {fhir:l @<Resource>?}?;
```

This requires the *referenced* resource to be present **and conformant in the
same graph**. An example document carries only a stub for what it points at —
`<DocumentReference/example> a fhir:DocumentReference` and nothing else — so
the referent can never conform, and with `<Resource>` abstract (#2) the
failure is reported once per resource type, which also makes the error output
enormous.

Loading all 2165 example documents into one store does make the references
resolve, but it is *stricter*, not looser: the referents then get validated
too, and any nonconformance propagates.

Worth 38 → 60 of the first 118 examples when reference targets are relaxed to
plain IRIs. I don't think "relax them" is the answer — it's a question of what
a resource's shape should assert about things it merely points at.

### 7. A repeating coded element binds its value set to the list, not the members

Single-valued, the generator gets this right — the `Code` node is what
carries `fhir:v`:

```
fhir:status @<Code> AND {fhir:v @fhirvs:account-status};
```

Repeating, the binding lands on the RDF **list**, which has `rdf:first` and
`rdf:rest` and no `fhir:v` at all, so the element can never match:

```diff
-    fhir:format @<OneOrMore_Code> AND
-    	{fhir:v @fhirvs:supplemented-mimetypes};
+    fhir:format @<OneOrMore_Code_supplemented-mimetypes>;
+
+# ...with the binding on the members:
+<OneOrMore_Code_supplemented-mimetypes> CLOSED {
+    rdf:first @<Code> AND {fhir:v @fhirvs:supplemented-mimetypes} ;
+    rdf:rest [rdf:nil] OR @<OneOrMore_Code_supplemented-mimetypes>
+}
```

30 occurrences, against 297 of the correct single-valued form. Dropping the
mis-scoped binding (so the structure is at least checkable) takes the first
197 examples from 113 conformant to 134.

### 8. Two shapes are referenced but never declared

Collecting every shape reference in the schema and subtracting the declared
labels gives a complete list — 2878 declared, 1398 distinct references, and
exactly two of them go nowhere:

| reference | uses |
| --- | --- |
| `@<SimpleQuantity>` | 11 |
| `@<Xhtml>` | 1 |

```diff
 # line 3292
     fhir:div @<Xhtml>;

 # e.g. line 6459
     fhir:value @<SimpleQuantity>  OR

+# nothing anywhere declares either one
```

An undeclared reference doesn't make a document fail, it makes validation
**abort**: `shape http://hl7.org/fhir/SimpleQuantity not found`, which takes
out 26 files corpus-wide, and `<Xhtml>` catches every document with a
Narrative.

`SimpleQuantity` is FHIR's `Quantity` with `comparator` prohibited, so
something like:

```
<SimpleQuantity> EXTENDS @<Quantity> CLOSED {
    a [fhir:SimpleQuantity]?;
}
```

though a faithful version also has to forbid `fhir:comparator`, which
`EXTENDS` makes awkward — `<Quantity>` already permits it and `EXTENDS`
conjoins. Worth deciding deliberately rather than by omission.

### 9. (minor) `ABSTRACT` is never emitted

`grep -c '^ABSTRACT' fhir.shex` → `0`, though `Base`, `Resource`,
`DomainResource` and `Element` are all `abstract=true` upstream. Worth an
audit beyond `<Resource>`: without it, an abstract type can be matched
directly, and value-position references to it don't dispatch to descendants.

### 10. (cosmetic) a comment is glued to a closing brace

```diff
-}# Potential outcomes for a subject with likelihood
+}
+# Potential outcomes for a subject with likelihood
```

Harmless to parsers, but it's at exactly the site of #1/#2 and may be the same
emission slip.

---

With the schema fixups above and the data ones raised as
w3c-cg/hcls-fhir-rdf#245, **232 of the first 247 examples conform** — against
0 at the start, when the schema did not parse at all.

The remainder is getting close to the floor. It now includes genuine example
errors rather than systematic mismatches: `clinicalusedefinition-example.ttl`
omits `fhir:subject`, which FHIR's own StructureDefinition puts at `1..*`.

Everything here is applied mechanically in
[`perf/fhir/bench.js`](https://github.com/shexjs/shex.js/blob/main/perf/fhir/bench.js),
and [`perf/fhir/why.js`](https://github.com/shexjs/shex.js/blob/main/perf/fhir/why.js)
explains any single example's failure against the same schema.
