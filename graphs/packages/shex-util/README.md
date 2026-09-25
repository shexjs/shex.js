# @shexjs/util

[![npm version](https://img.shields.io/npm/v/@shexjs/util)](https://www.npmjs.com/package/@shexjs/util)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

Utility functions to work with [ShExJ](https://shex.io/shex-semantics/#shexj) schemas

## Install

``` shell
npm install @shexjs/util
```

## Invocation
Using `partition(<schema>, [<URL>s])` as an example, an illustrative way to invoke it from the command line uses `@shexjs/parser` and `@shexjs/writer`:
``` sh
node -e 'const base = "http://a.example/"
  const schema = require("@shexjs/parser")
    .construct(base, {v: "http://a.example/vocab#"})
    .parse("<S1> { <p1> .; <p2> @<S2>? } <S2> { <p3> @<S3> } <S3> { <p4> @<S1> } <S4> { <p5> . }")
  const partition = require("@shexjs/util").partition(schema, [base + "S2"])
  new (require("@shexjs/writer"))({ base, simplifyParentheses: true })
    .writeSchema(partition,
      (error, text, prefixes) => {
        if (error)
          throw error;
        console.log(text);
      })'
```
The result is the partition serialized as ShExC:
``` shex
BASE <http://a.example/>
<S2> {
  <p3> @<S3>
}
<S3> {
  <p4> @<S1>
}
<S1> {
    <p1> . ;
    <p2> @<S2>?
}
```
Note that `<S2>` in the input schema has no references to `<S1>`:
``` shex
<S1> {
  <p1> .;
  <p2> @<S2>?
}
<S2> {
  <p3> @<S3>
}
<S3> {
  <p4> @<S1>
}
<S4> {
  <p5> .
}
```

## ShExJtoAS(schema)
Parse a ShExJ schema and add `._prefixes` and `._index` for efficient processing within shexj.js

## AStoShExJ(schema)
Remove `._prefixes` and `._index` from internal schema structure and add `schema["@context"] || "http://www.w3.org/ns/shex.jsonld"`

## ShExRtoShExJ(schema-like-object)
Internal function for parsing ShExR (the `ShExRVisitor` it uses is not exported)

## canonicalize(schema, trimIRI)
Normalize ShExJ by moving all tripleExpression references to their first expression.

## BiDiClosure
construct an object with this api:

* **needs**: {} - mapping from needer to needie
* **neededBy**: {} - reverse mapping of `needs`
* add(needer, needie, negated) - record that needer referenced needied, possibly in a negation

## nestShapes(schema, options = {})
See which shape declarations have no coreferences and can be nested inside their sole referrer.

### options
 *   **no**: don't do anything; just report nestable shapes
 *   **transform**: function to change shape labels

## getPredicateUsage(schema, untyped = {})
Return which predicates appear in which shapes, what their common type is, and whether they are polymorphic.

## getDependencies(schema, ret)
Find which shapes depend on other shapes by inheritance or inclusion.

## partition(<schema>, [<URL>s])
Create subset of a schema with only desired shapes and their dependencies.

## absolutizeResults(res, base)
In validation results with some relative URLs in it, re-evaluate all [`shape`, `reference`, `node`, `subject`, `predicate`, `object`] property values against `base`.

## getProofGraph(res, db, dataFactory)
Parse a validation result and call `db.addQuad()` with each triple involved in validation.

**Note**, this may call `db.addQuad()` multiple times with the same triple if that triple appears more than once in the validation results.

## isWellDefined(schema)
Verify that schema has all necessary referents and conforms to ShEx's stratified negation rules.

## valuesToSchema(values)
Convert the results of validating an instance of ShExR against ShExR.shex into a ShExJ schema.

## errsToSimple(val, prefixes?, opts?)
Render a validation failure as indented, human-readable lines. `opts.explain` picks what to include: the failure's `"errors"`, its `"repairs"` (the cheapest edits that would have made the node conform), or `"both"`; `opts.lex` and `opts.base` control how terms are written.

## executeQuery(query, endpoint, dataFactory)
Synchronously execute a SPARQL query against an endpoint.

## executeQueryPromise(query, endpoint, dataFactory)
Asynchronously execute a SPARQL query against an endpoint.

## parseSparqlJsonResults (jsonObject)
Parse JSON results to internal RDF term representations.

---

`@shexjs/util` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
