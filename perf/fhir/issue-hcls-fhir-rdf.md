## Four published TTL examples are not valid Turtle

Parsing every file in `http://build.fhir.org/examples-ttl.zip` (fetched
2026-08-15, 2172 files) with [N3.js](https://github.com/rdfjs/N3.js), four are
rejected. All four fail the same way, and it looks like one bug in whatever
writes `fhir:l`.

The `fhir:l` object is being built by concatenating the `fhir:` prefix onto
the raw string value of the sibling `fhir:v`. When that string contains
characters a Turtle `PN_LOCAL` can't carry unescaped — `?`, `=`, `|`, `@`, or
a second `:` — the result isn't a legal prefixed name.

(The three ontology files — `fhir.ttl`, `rim.ttl`, `w5.ttl` — parse fine and
are excluded here; they're not examples and carry no `fhir:nodeRole
fhir:treeRoot`.)

---

### 1. `bundle-request-transaction-complex.ttl`, line 313

```turtle
      fhir:serviceProvider [
         fhir:l fhir:Organization?identifier=urn:ietf:rfc:3986|urn:oid:2.16.840.1.113883.19.5 ;
         fhir:reference [ fhir:v "Organization?identifier=urn:ietf:rfc:3986|urn:oid:2.16.840.1.113883.19.5" ] ;
```

```
Unexpected "fhir:Organization?identifier=urn:ietf:rfc:3986|urn:oid:2.16.840.1.113883.19.5" on line 313.
```

### 2. `bundle-transaction.ttl`, line 109

```turtle
           fhir:url [
             fhir:v "Patient?identifier=123456"^^xsd:anyURI ;
             fhir:l fhir:Patient?identifier=123456
           ]
```

```
Unexpected "fhir:Patient?identifier=123456" on line 109.
```

### 3. `endpoint-example-direct.ttl`, line 37

```turtle
      fhir:address [
         fhir:v "mailto:MARTIN.SMIETANKA@directnppes.com"^^xsd:anyURI ;
         fhir:l fhir:mailto:MARTIN.SMIETANKA@directnppes.com
      ] .
```

```
Unexpected "fhir:mailto:MARTIN.SMIETANKA@directnppes.com" on line 37.
```

### 4. `endpoint-examples-general-template.ttl`, line 267

```turtle
      fhir:address [
         fhir:v "mailto:subscriptions@example.org"^^xsd:anyURI ;
         fhir:l fhir:mailto:subscriptions@example.org
      ] .
```

```
Unexpected "fhir:mailto:subscriptions@example.org" on line 267.
```

---

### Suggested fix

Write `fhir:l` as an IRI reference rather than a prefixed name:

```diff
-             fhir:l fhir:Patient?identifier=123456
+             fhir:l <Patient?identifier=123456>
```

Cases 3 and 4 are doubly wrong: `mailto:` is already an absolute URI scheme,
so the `fhir:` prefix shouldn't be there at all —

```diff
-         fhir:l fhir:mailto:subscriptions@example.org
+         fhir:l <mailto:subscriptions@example.org>
```

A useful general rule for the writer: if the `fhir:v` string is already an
absolute URI, emit it as `<...>` unchanged; otherwise resolve it against the
base (or emit the relative form in angle brackets). Only emit a prefixed name
when the local part matches `PN_LOCAL`.


---

## Two more, found by validating the examples against `fhir.shex`

Not parse errors — these files are legal Turtle — but they don't match what
the schema says, and in both cases the writer looks inconsistent with itself.

### 5. `Bundle.entry.resource` is 0..1 but is written as an RDF list

`bundle-search-warning.ttl:29`:

```turtle
     fhir:resource ( <urn:uuid:2866af9c-137d-4458-a8a9-eeeec0ce5583> ) ;
```

`Bundle.entry.resource` has cardinality 0..1, and `fhir.shex` accordingly says
`fhir:resource @<Resource>?` — a resource, not a list of them. The list form
appears **1383 times across 102 files**, and the same predicate is *also*
written unwrapped elsewhere as `fhir:resource [ ... ]`, so this isn't a
convention, it's a split.

```diff
-     fhir:resource ( <urn:uuid:2866af9c-137d-4458-a8a9-eeeec0ce5583> ) ;
+     fhir:resource <urn:uuid:2866af9c-137d-4458-a8a9-eeeec0ce5583> ;
```

### 6. Numeric datatypes are chosen by value, not by FHIR type

Across the published examples:

| datatype | occurrences |
| --- | --- |
| `xsd:nonNegativeInteger` | 2423 |
| `xsd:decimal` | 1417 |
| `xsd:positiveInteger` | 295 |
| `xsd:long` | 39 |
| `xsd:int` | **0** |

`fhir.shex` constrains FHIR `integer` (and, through `EXTENDS`, `positiveInt`
and `unsignedInt`) to `xsd:int`. Nothing in the corpus is `xsd:int`, so every
one of those values fails. The pattern suggests the writer picks the narrowest
XSD type that fits the *value* — a `3` becomes `xsd:positiveInteger` — where a
consumer expects the type implied by the FHIR element's declared type.

Either side could move, and I've raised the schema half as
fhircat/org.hl7.fhir.core_shex-generator (also copied to
w3c-cg/hcls-fhir-rdf#246 §5). Flagging it here because if the writer is the
side that should change, this is where it changes:

```diff
-       fhir:v "1"^^xsd:positiveInteger
+       fhir:v "1"^^xsd:int
```

Accepting the union of all four in the schema takes the first 118 examples
from 60 to 83 conformant, so this is one of the larger single causes.


### 7. Elements written with no value at all

**1115 occurrences across 1115 files** — half the published corpus.

```turtle
  fhir:hierarchyMeaning [] ; #
```

| predicate | occurrences |
| --- | --- |
| `fhir:expansion []` | 682 |
| `fhir:hierarchyMeaning []` | 343 |
| `fhir:dosageInstruction []` | 68 |
| `fhir:handling []` | 11 |
| `fhir:dosage`, `fhir:meta`, `fhir:version`, `fhir:network`, `fhir:definition`, `fhir:biologicalSourceEvent`, `fhir:baseDefinition` | 1 each |

The Turtle asserts that the element is present and then gives it no value.
Nothing can match it: the object needs a `fhir:v` (or whatever that element's
shape wants), and if there is nothing to say, the element should be absent.

```diff
-  fhir:hierarchyMeaning [] ;
```

Repeating elements have the same thing one level in — a list whose only member
is valueless:

```diff
-  fhir:asNeededFor ( [] ) ;
```

Dropping these takes the first 247 examples from 134 conformant to 232, which
makes it the single largest cause of nonconformance in the corpus.

### 8. An example missing a required element

`clinicalusedefinition-example.ttl` has no `fhir:subject`, but
[`ClinicalUseDefinition.subject`](http://build.fhir.org/clinicalusedefinition.profile.json)
is `1..*`. Unlike everything above, this looks like an ordinary mistake in one
example rather than a systematic writer issue — noting it because it's the
kind of thing validation is *supposed* to find, and it only became visible
once the systematic problems were out of the way.
