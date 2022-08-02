[![NPM Version](https://badge.fury.io/js/@shexjs%2Feval-threaded-nerr.png)](https://npmjs.org/package/shex)
[![ShapeExpressions Gitter chat https://gitter.im/shapeExpressions/Lobby](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/shapeExpressions/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.1213693.svg)](https://doi.org/10.5281/zenodo.1213693)

# @shexjs/cli

Command line tools for ShEx.

###  validation executable

Validate something in HTTP-land:

```sh
./node_modules/shex/bin/validate \
    -x http://shex.io/examples/Issue.shex \
    -d http://shex.io/examples/Issue1.ttl \
    -s http://shex.io/examples/IssueShape \
    -n http://shex.io/examples/Issue1
```

That validates node `http://shex.io/examples/Issue` in `http://shex.io/examples/Issue1.ttl` against shape `http://shex.io/examples/IssueShape` in `http://shex.io/examples/Issue.shex`.
The result is a JSON structure which tells you exactly how the data matched the schema.

```json
{
  "type": "test",
  "node": "http://shex.io/examples/Issue1",
  "shape": "http://shex.io/examples/IssueShape",
  "solution": {
...
  }
}
```

Had we gotten a `null`, we'd know that the document was invalid with respect to the schema.
See the [ShExJ primer](http://shex.io/primer/) for a description of ShEx validation and the [ShExJ specification](http://shex.io/primer/ShExJ) for more details about the results format.

## conversion

As with validation (above), you can convert by either executable or library.

###  conversion executable

ShEx can be represented in the compact syntax
```
PREFIX ex: <http://ex.example/#>
<IssueShape> {                       # An <IssueShape> has:
    ex:state (ex:unassigned            # state which is
              ex:assigned),            #   unassigned or assigned.
    ex:reportedBy @<UserShape>        # reported by a <UserShape>.
}
```
or in JSON:
```json
{ "type": "schema", "start": "http://shex.io/examples/IssueShape",
  "shapes": {
    "http://shex.io/examples/IssueShape": { "type": "shape",
      "expression": { "type": "eachOf",
        "expressions": [
          { "type": "tripleConstraint", "predicate": "http://ex.example/#state",
            "valueExpr": { "type": "valueClass", "values": [
                "http://ex.example/#unassigned", "http://ex.example/#assigned"
          ] } },
          { "type": "tripleConstraint", "predicate": "http://ex.example/#reportedBy",
            "valueExpr": { "type": "valueClass", "reference": "http://shex.io/examples/UserShape" }
          }
] } } } }
```

You can convert between them with shex-to-json:
```sh
./node_modules/shex/bin/shex-to-json http://shex.io/examples/Issue.shex
```
and, less elegantly, back with json-to-shex.

## local files

Command line arguments which don't start with http:// or https:// are assumed to be file paths.
We can create a local JSON version of the Issues schema:
```sh
./node_modules/shex/bin/shex-to-json http://shex.io/examples/Issue.shex > Issue.json
```
and use it to validate the Issue1.ttl as we did above:
```sh
./node_modules/shex/bin/validate \
    -j Issue.json \
    -d http://shex.io/examples/Issue1.ttl \
    -s http://shex.io/examples/IssueShape \
    -n http://shex.io/examples/Issue1
```

Of course the data file can be local as well.

Happy validating!

## materialize

Materialize is used to transform from a source schema to a target schema after validation is done.

The syntax is:
```sh
materialize `-t <target schema>`|-h [-j `<JSON Vars File>`] [-r `<RDF root IRI>`]
```
Materialize reads the output from the validate tool from STDIN and maps it to the specified target schema.

If supplied, a JSON vars file will be referenced to fill in constant values not specified from the source.
This is useful in assigning default fields to the target when there is no equivalent value in the source schema
and source data.

Here is an example of a simple JSON vars file:
```json
{
  "urn:local:Demographics:constSys": "System",
}
```
If this vars file content is used, then any time a variable in the target file with
value "urn:local:Demographics:constSys" is seen, the value "System will be substituted.

The RDF root IRI specifies the root node from which all nodes in the schema will descend.
The default root if none is specified is: ` tag:eric@w3.org/2016/root `

Here are some examples:
```sh
materialize -h
```
```sh
validate -x source_schema.shex -l data.jsonld -s ProblemShape | materialize -t target_schema.shex -j vars.json
```
```sh
cat problem.val | materialize -t target_schema.shex -j vars.json -r http://hl7.org/fhir/shape/problem
```

# Lerna Monorepo

This repo uses [lerna](https://github.com/lerna/lerna) to manage multiple NPM packages. These packages are located in `packages/*`:

- [`shape-map`](../shape-map#readme) -- a [ShapeMap](https://shexspec.github.io/shape-map/) parser
- [`@shexjs/parser`](../shex-parser#readme) -- parse ShExC into ShExJ
- [`@shexjs/writer`](../shex-writer#readme) -- serialize ShExK as ShExC
- [`@shexjs/term`](../shex-term#readme) -- RDF terms uses in ShEx
- [`@shexjs/util`](../shex-util#readme) -- some utilities for transforming schemas or validation output
- [`@shexjs/visitor`](../shex-visitor#readme) -- a [visitor](https://en.wikipedia.org/wiki/Visitor_pattern) for schemas
- [`@shexjs/validator`](../shex-validator#readme) -- validate nodes in an RDF graph against shapes in a schema
- [`@shexjs/eval-validator-api`](../eval-validator-api#readme) -- API called by [`@shexjs/validator`](../shex-validator#readme) for validating Shapes, with tripleExpressions and EXTENDS etc.
- [`@shexjs/eval-simple-1err`](../eval-simple-1err#readme) -- Implementation of [`@shexjs/eval-validator-api`](../eval-validator-api#readme) which reports only one error.
- [`@shexjs/eval-threaded-nerr`](../eval-threaded-nerr#readme) -- Implementation of [`@shexjs/eval-validator-api`](../eval-validator-api#readme) which exhaustively enumerate combinations of ways the data fails to satisfy a shape's expression.
- [`@shexjs/api`](../shex-api#readme) -- an API for loading and using ShEx schemas
- [`@shexjs/node`](../shex-node#readme) -- additional API functionality for a node environment
- [`@shexjs/cli`](../shex-cli#readme) -- a set of command line tools for transformaing and validating with schemas
- [`@shexjs/webapp`](../shex-webapp#readme) -- the shex-simple WEBApp
- [`@shexjs/shape-path-query`](../shex-shape-path-query#readme) -- traverse ShEx schemas with a path language
- [`@shexjs/extension-test`](../extension-test#readme) -- a small language for testing semantic actions in ShEx implementations ([more](http://shex.io/extensions/Test/))
- [`@shexjs/extension-map`](../extension-map#readme) -- an extension for transforming data from one schema to another ([more](http://shex.io/extensions/Map/))
- [`@shexjs/extension-eval`](../extension-eval#readme) -- simple extension which evaluates Javascript semantic action code ([more](http://shex.io/extensions/Eval/))

