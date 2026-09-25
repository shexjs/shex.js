# @shexjs/validator

[![npm version](https://img.shields.io/npm/v/@shexjs/validator)](https://www.npmjs.com/package/@shexjs/validator)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

Validate nodes in an RDF graph against shapes in a [ShEx](http://shex.io/) schema.

The validator takes a schema (parsed [ShExJ](https://shex.io/shex-semantics/#shexj)), a data interface (a [`@shexjs/neighborhood-api`](../neighborhood-api#readme) implementation over an RDF/JS store, a SPARQL endpoint, a Wikibase…) and a [shape map](https://shexspec.github.io/shape-map/) saying which nodes to test against which shapes.

## Install

``` shell
npm install @shexjs/validator
```

## Quick start

``` js
const {ShExValidator} = require("@shexjs/validator");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {Store, Parser} = require("n3");
const base = "http://a.example/";

const schema = require("@shexjs/parser").construct(base).parse(`
<S1> { <p1> . ; <p2> . }`);
const graph = new Store(new Parser({baseIRI: base}).parse(`
<n1> <p1> 1 ; <p2> 2 .
<n2> <p1> 3 ; <p3> 4 . # p3 where <S1> wants p2
`));

const validator = new ShExValidator(schema, RdfJsDb(graph));
const results = validator.validateShapeMap([
  {node: base + "n1", shape: base + "S1"},
  {node: base + "n2", shape: base + "S1"},
]);
results.forEach(r => console.log(r.node, r.status));
```
```
http://a.example/n1 conformant
http://a.example/n2 nonconformant
```

To validate against the schema's `start` shape, pass the `Start` sentinel from [`@shexjs/term`](../shex-term#readme) as the `shape`:

``` js
const {Start} = require("@shexjs/term");
validator.validateShapeMap([{node: base + "n1", shape: Start}]);
```

## The results

`validateShapeMap` returns the shape map with each association's `status` filled in and an `appinfo` saying why. For the nonconformant `n2` above:

``` json
{
  "node": "http://a.example/n2",
  "shape": "http://a.example/S1",
  "status": "nonconformant",
  "appinfo": {
    "type": "Failure",
    "node": "http://a.example/n2",
    "shape": "http://a.example/S1",
    "errors": [
      {
        "type": "MissingProperty",
        "property": "http://a.example/p2"
      }
    ],
    "repairs": [
      {
        "type": "NearestBag",
        "cost": 1,
        "arcs": [
          {
            "property": "http://a.example/p2",
            "delta": 1
          }
        ]
      }
    ]
  }
}
```

`errors` says what failed; `repairs` says the cheapest edits that would have made it pass (here: add one `<p2>` arc). [`@shexjs/util`](../shex-util#readme)'s `errsToSimple` renders either as sentences.

## Validation proof

A conformant association's `appinfo` is a proof: which triples matched which constraints. For `n1` above:

``` json
{
  "type": "ShapeTest",
  "node": "http://a.example/n1",
  "shape": "http://a.example/S1",
  "solution": {
    "type": "EachOfSolutions",
    "solutions": [
      {
        "type": "EachOfSolution",
        "expressions": [
          {
            "type": "TripleConstraintSolutions",
            "predicate": "http://a.example/p1",
            "solutions": [
              {
                "type": "TestedTriple",
                "subject": "http://a.example/n1",
                "predicate": "http://a.example/p1",
                "object": {
                  "value": "1",
                  "type": "http://www.w3.org/2001/XMLSchema#integer"
                }
              }
            ]
          },
          {
            "type": "TripleConstraintSolutions",
            "predicate": "http://a.example/p2",
            "solutions": [
              {
                "type": "TestedTriple",
                "subject": "http://a.example/n1",
                "predicate": "http://a.example/p2",
                "object": {
                  "value": "2",
                  "type": "http://www.w3.org/2001/XMLSchema#integer"
                }
              }
            ]
          }
        ]
      }
    ]
  }
}
```

See the [ShEx primer](http://shex.io/primer/) for validation semantics and [ShExV](https://shexspec.github.io/shexTest/doc/ShExV) for the results vocabulary.

## Choosing a matching engine

The triple expression in a Shape is essentially a fancy regular expression, and the engine that matches it is pluggable ([`@shexjs/eval-validator-api`](../eval-validator-api#readme)). shex.js ships two:

* [`@shexjs/eval-threaded-nerr`](../eval-threaded-nerr#readme) (default) — exhaustively enumerates the ways the data fails to satisfy a shape's expression;
* [`@shexjs/eval-simple-1err`](../eval-simple-1err#readme) — stops at the first error.

Select one with the options parameter to the constructor:

``` js
new ShExValidator(schema, RdfJsDb(graph), {
  regexModule: require("@shexjs/eval-simple-1err").RegexpModule
});
```

## External shapes

One form of ShEx extensibility is the declaration of external shapes:

``` shex
<S1> {
  <p1> @<S2>
}
<S2> EXTERNAL
```

The ShEx specification doesn't say how these are supplied; in shex.js, pass a `validateExtern` function in the options:

``` js
new ShExValidator(schema, RdfJsDb(g), {
  validateExtern: myValidator
});

// (RdfJs.Term, string, ShapeExprValidationContext) -> shapeExprTest
function myValidator (point, shapeLabel, ctx) {
  if (shapeLabel === "http://a.example/S2") {
    const p2z = g.getQuads(point, "http://a.example/p2", null);
    if (p2z.length === 1) {
      return {
        "type": "ShapeTest",
        "node": point.value,
        "shape": "http://a.example/S2",
        "solution": {
          "type": "TripleConstraintSolutions",
          "predicate": "http://a.example/p2",
          "solutions": [
            {
              "type": "TestedTriple",
              "subject": point.value,
              "predicate": "http://a.example/p2",
              "object": p2z[0].object.value
            }
          ]
        }
      };
    }
  }
}
```

Validating a schema with external shapes and no `validateExtern` raises:

```
Error: validating "http://a.example/n2" as EXTERNAL shapeExpr http://a.example/S2 requires a 'validateExtern' option
```

# Testing

Run this package's tests from `packages/`:
``` shell
cd .. && npx mocha -C shex-validator/test/Validation-test.js
```

## Selecting tests

Set `TESTS` to a regular expression matched against test ids, schema and data
file names to run a subset:
``` shell
TESTS='vitals-RESTRICTS' npx mocha -C shex-validator/test/Validation-test.js
```

## Regenerating reference results (`REGEN=1`)

`Validation-test.js` compares validation output against the reference results
in `test/val/` (as mapped by `test/val/test-result-map.json`). When an
intentional change to the validator alters the ShExResults structures, set
`REGEN=1` to rewrite the reference file of any test whose (canonicalized)
result no longer matches, instead of failing the assertion:
``` shell
TESTS='(ExtendsRepeatedP-pass|2dot_fail-empty-err)' REGEN=1 npx mocha -C shex-validator/test/Validation-test.js
```
The run reports the regenerated tests as passing; review the rewritten files
with `git diff` (or ediff) and commit the ones that reflect the intended
change. Always scope `REGEN` with `TESTS` to the tests you mean to regenerate —
an unscoped `REGEN=1` run will absorb *any* mismatch, including real
regressions. Tests without an entry in `test-result-map.json` only check
conformance status and are unaffected.

## Result names

When validating EXTENDS hierarchies, the first result for each extension/subgraph
pair carries a `"resultName"`; identical re-examinations in later partitions emit
`{"type": "ResultReference", "ref": <resultName>}` instead of repeating it. A
result name is the focus node followed by a
[ShExPath](https://github.com/shexSpec/ShapePath.js) expression addressing the
extension: a labeled extension by its shape-declaration selector,
```
<http://a.example/s>@<http://a.example/#B>
```
an inline extension by a step into the extending shape's EXTENDS list
(`…@<label>/extends/*[0]` — `extends` selects the list, which is an item of its
own in ShExPath, `/*` steps into it and `[0]` picks the first out).
Only when the same node and extension are validated against a *different*
subgraph is a disambiguating `#2`, `#3`, … appended.

---

`@shexjs/validator` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
