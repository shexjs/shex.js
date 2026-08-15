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
