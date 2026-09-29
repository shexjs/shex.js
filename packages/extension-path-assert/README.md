# @shexjs/extension-path-assert

[![npm version](https://img.shields.io/npm/v/@shexjs/extension-path-assert)](https://www.npmjs.com/package/@shexjs/extension-path-assert)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

Path assertions as ShEx semantic actions, `http://shex.io/extensions/PathAssert/`.
An action's code is an XPath-style expression over the graph; the action
passes when it is true, and a failure says what each part evaluated to.

``` shell
npm install @shexjs/extension-path-assert
```

```
PREFIX : <http://a.example/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX assert: <http://shex.io/extensions/PathAssert/>

:Event {
  :start xsd:date ;
  :end xsd:date ;
  :part @:Event *
} %assert:{ :end >= :start %}
```

Validating an event whose keynote ends before it starts fails with

```
assertion failed: :end >= :start
  :end = "2026-10-04"^^xsd:date
  :start = "2026-10-05"^^xsd:date
```

## The language

Every expression is a set of RDF terms.  Reading it is mostly XPath:

| | | |
| --- | --- | --- |
| `:p` | the values of `:p` from the context item | `:end >= :start` |
| `^:p` | the nodes with the context item as their `:p` | `empty(^:isbn except $this)` |
| `a` | `rdf:type` | `a = @:Person` |
| `@:x`, `@<iri>` | a node (a bare IRI is a property) | `@:Person/^a` is the instances of `:Person` |
| `.` | the context item | `lang(.) = "de"` |
| `$this`, `$value` | what the action's place binds (below) | |
| `e1/e2` | `e2` from each item of `e1` | `:organism/rdfs:label` |
| `e[c]` | the items of `e` for which `c` holds, `.` being the item | `:label[lang(.) = "en"]` |
| `p*`, `p+`, `p?` | closures, written against the step like SPARQL's | `rdfs:subClassOf* = @:Bacteria` |
| `=` `!=` `<` `<=` `>` `>=` | true if some pair of items compares so, by value (numbers, dates, strings) | `:length = strlen(:sequence)` |
| `and` `or` `not()` `implies` | on effective boolean values: a set is true when some item is | `:a = 1 implies :b = 2` |
| `some`/`every $x in e satisfies c` | quantifiers | `every $p in @:Person/^a satisfies not($p/:parent+ = $p)` |
| `let $x := e return f`, `if (c) then a else b` | as in XPath | |
| `(a, b)`, `a \| b`, `intersect`, `except` | set construction and algebra | `:type = (@:A, @:B)` |
| `+ - * div mod` | arithmetic on numeric literals (a space before `*`/`+` tells them from a closure) | `:price * :qty` |
| `count() exists() empty() sum() min() max() avg()` | over a set | `count(:label[lang(.) = "en"]) = 1` |
| SPARQL's functions | `str lang langMatches datatype iri isIRI isBlank isLiteral isNumeric strlen substr ucase lcase strstarts strends contains strbefore strafter concat replace regex abs round ceil floor now year month day hours minutes seconds sameTerm strdt strlang` (XPath's names work too: `starts-with`, `string-length`, `matches`, …) | |
| `fail("message")` | fails with your message | `:a = :b or fail("a and b differ")` |

Literals are Turtle's (`1`, `1.5`, `"x"@en`, `"2026-10-05"^^xsd:date`), the
schema's `PREFIX`es are in scope, and `#` starts a comment.  Comparisons
are existential, as in XPath and SHACL: `:a = 1` means some value of `:a`
is 1.  For "all of them", quantify: `every $v in :a satisfies $v = 1`.

## What the action's place binds

| the action is on | `.` and `$this` | `$value` |
| --- | --- | --- |
| a shape, or a node constraint | the node being validated | — |
| a triple constraint | `$this` is the node being validated; `.` and `$value` are the other end of the matched triple | the same |
| a group (`(…;…)`, `(…\|…)`) | the node its triples share | — |
| the start actions | nothing: start a path at a node, `@:Class/^a` | — |

On a triple constraint the assertion takes part in matching: a triple it
refuses is one that constraint doesn't match, so two constraints on one
predicate can be told apart by their assertions, and a refused triple
fails a `CLOSED` shape.

## Where the data comes from

Steps are answered by the validator's data source, one neighborhood at a
time — the same `getNeighborhood` call the validator makes — so an
assertion runs unchanged over an RDF/JS store, a SPARQL endpoint
(`@shexjs/neighborhood-sparql`, blank nodes included) or a wikibase
(`@shexjs/neighborhood-wikibase`, which fetches the pages a path reaches).
No query engine is involved.  A source that answers with promises makes
the action answer with one: validate with `validateShapeMapAsync` then,
as the WebApp and its worker do; over a local store everything is
synchronous, and the step-through debugger can run assertions too.

What that model doesn't give you is a join between unrelated nodes or a
query over every triple with some predicate; for those, use
[`@shexjs/extension-shacl-sparql`](../extension-shacl-sparql#readme).
The two compose: a schema can carry both kinds of action.

## Using it

``` js
const Assert = require("@shexjs/extension-path-assert");
const validator = new ShExValidator(schema, RdfJsDb(store));
Assert.register(validator, {ShExTerm});
const results = validator.validateShapeMap(shapeMap);
```

Parse the schema with `{index: true}` (the CLI and the WebApp do) for its
prefixes to be in scope.  A failure is reported as a `SemActFailure` whose
`errors[0]` is `assertion failed: <expression>`, with the expression as
`assertion` and the lines above as `explanation`, which the human-readable
error writer prints under it.  An expression that can't be evaluated — a
syntax error, an unknown function or prefix, a step with no context item
to step from — is an invocation error and throws.

From the command line:

``` shell
validate -x events.shex -d events.ttl -m '<http://a.example/conf>@<http://a.example/Event>' \
  --extension @shexjs/extension-path-assert
```

It is bundled in [`shex`](../shex#readme) as `ShEx.Extensions.PathAssert`.

### In the WebApp

`doc/ShExPathAssertPlugin.js` is the plugin, and
[`examples/manifest.yaml`](examples/manifest.yaml) loads it:

```
packages/shex-webapp/doc/shex-simple.html?manifestURL=../../extension-path-assert/examples/manifest.yaml
```

The bundle (`doc/webpacks/shexpathassert-webapp.min.js`, built with
`npm run webpack`) is the parser and evaluator, a few tens of kilobytes.
