# The same failures, before and after

What a failing validation *carries* — the structure a consumer reads —
either side of the work in [error-reporting.md](error-reporting.md).
Regenerate with [error-reporting-comparison.js](error-reporting-comparison.js),
which runs against whatever checkout it is in.

"Before" is `main` at `e526b191`; "after" is the `error-repair` branch.
Both columns are generated with `{repairs: false}` so that F5's addition
doesn't obscure the change F3 and F4 made to the errors themselves; F5 is
shown on its own at the end.

## F4 — a choice, said as a choice

`<S> { :a . | :b . }` over `:x :c 1 .` — a node with neither.

**Before.** The disjunction is an array of arrays. Nothing in the structure
says the nesting means "or"; every consumer has to know, and the ones that
didn't flattened it into a conjunction — which is how the human writer came
to report *missing :a AND missing :b*, a choice read as a requirement to do
both.

```json
{
  "type": "Failure",
  "node": ":x",
  "shape": ":S",
  "errors": [
    [ { "type": "MissingProperty", "property": ":a" } ],
    [ { "type": "MissingProperty", "property": ":b" } ]
  ]
}
```

**After.** Both levels say what they are. `Alternatives` is "any one of
these"; each `AllOf` is "all of these together".

```json
{
  "type": "Failure",
  "node": ":x",
  "shape": ":S",
  "errors": [
    {
      "type": "Alternatives",
      "errors": [
        { "type": "AllOf", "errors": [ { "type": "MissingProperty", "property": ":a" } ] },
        { "type": "AllOf", "errors": [ { "type": "MissingProperty", "property": ":b" } ] }
      ]
    }
  ]
}
```

The field is still called `errors` on purpose: `"errors" in x` is how a
failure is recognised throughout the validator, and renaming it made the
validator stop recognising its own results. The *type* carries the meaning.

## F3 — why a node missed a constraint

`<S> { :age xsd:integer }` over `:x :age "old" .`, at the leaf of the
`NodeConstraintViolation` (the surrounding `TypeMismatch` is unchanged).

**Before.** A string, with the ShExJ it is about embedded in it. A consumer
wanting the expected type had to parse English, and the editors — which
showed `errors[0]` directly in a hover — showed the reader raw ShExJ.

```json
"errors": [
  "Error validating \"old\" as {\"type\":\"NodeConstraint\",\"datatype\":\"xsd:integer\"}: mismatched datatype: xsd:string !== xsd:integer"
]
```

**After.** The parts are fields. The old sentence stays as `message`, so a
consumer that hasn't learned the types still has something to print.

```json
"errors": [
  {
    "type": "DatatypeMismatch",
    "expected": "xsd:integer",
    "actual": "xsd:string",
    "message": "mismatched datatype: xsd:string !== xsd:integer"
  }
]
```

The same treatment covers `NodeKindMismatch`, `ValueSetMismatch`,
`PatternMismatch` and `FacetViolation`.

## F5 — what the default now adds

With repairs on (the default since `13c7fbfa`), the first case above also
carries this. It is the answer to a different question — not *what is
wrong* but *what would be right* — and unlike the errors it doesn't depend
on how the schema was factored:

```json
"repairs": [
  { "type": "NearestBag", "cost": 1, "arcs": [ { "property": ":a", "delta": 1 } ] },
  { "type": "NearestBag", "cost": 1, "arcs": [ { "property": ":b", "delta": 1 } ] }
]
```

## And the sentences, for what they're worth

The renderings follow from the structures above, so they are included only
to show that the structure carries through to something a person reads.

```
before                          after

Missing property: :a            validating :x as :S:
  AND                             to conform: add 1 :a, or add 1 :b
Missing property: :b                missing property <:a>
                                  OR
                                    missing property <:b>
```

A case with more in it — `( :name . | :givenName . ; :familyName . ) ;
:mbox . ; :age xsd:integer ?` over `:x :givenName "Bob" ; :age "old" .`:

```
validating :x as :S:
  to conform: add 1 :familyName and add 1 :mbox
    "old" doesn't satisfy <:age> xsd:integer?:
      has type xsd:string, not xsd:integer
  AND
    missing property <:mbox>
  AND
    triple <:givenName> "Bob" fits no triple constraint: either add :familyName, or remove it
```

The schema fragments in those sentences are ShExC, written by
`ShExCWriter.writeShapeExpr` in the schema's own prefixes, rather than the
ShExJ they are made of.
