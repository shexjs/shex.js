# @shexjs/cli

[![npm version](https://img.shields.io/npm/v/@shexjs/cli)](https://www.npmjs.com/package/@shexjs/cli)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

Command line tools for [ShEx](http://shex.io/): validate RDF data against schemas over HTTP, files or SPARQL, convert between schema formats, and run a validation server.

## Install

``` shell
npm install @shexjs/cli
```

installs five executables (`npx` finds them in `node_modules/.bin/`):

* **`shex-validate`** — validate nodes against shapes (plus the server and every option below)
* **`shex-to-json`** / **`json-to-shex`** — convert ShExC ↔ ShExJ
* **`shex-partition`** — extract the part of a schema some shapes depend on
* **`shex-debug`** — step a validation from a REPL

## Validate over HTTP

```sh
npx shex-validate \
    -x http://shex.io/examples/IssueSchema \
    -d http://shex.io/examples/Issue1 \
    -s http://shex.io/examples/IssueSchema#IssueShape \
    -n http://shex.io/examples/Issue1#Issue1
```

That validates node `…Issue1#Issue1` in the data `…Issue1` against shape `…IssueSchema#IssueShape` in the schema `…IssueSchema`.
The result is a JSON structure which tells you exactly how the data matched the schema:

```json
{
  "type": "ShapeTest",
  "node": "http://shex.io/examples/Issue1#Issue1",
  "shape": "http://shex.io/examples/IssueSchema#IssueShape",
  "solution": {
    …
  }
}
```

`-x` names a ShEx compact syntax (ShExC) schema; `-j` selects ShExJ and `-t` ShExR.

A `Failure` tells you the data was invalid with respect to the schema. Try the same command with `-n http://shex.io/examples/Issue1#User2` (a user, so it shouldn't conform to IssueShape):

``` json
{
  "type": "Failure",
  "node": "http://shex.io/examples/Issue1#User2",
  "shape": "http://shex.io/examples/IssueSchema#IssueShape",
  "errors": [
    {
      "type": "MissingProperty",
      "property": "http://ex.example/ns#state",
      "valueExpr": {
        "type": "NodeConstraint",
        "values": [
          "http://ex.example/ns#unassigned",
          "http://ex.example/ns#assigned"
        ]
      }
    },
    {
      "type": "MissingProperty",
      "property": "http://ex.example/ns#reportedBy",
      "valueExpr": "http://shex.io/examples/IssueSchema#UserShape"
    },
    {
      "type": "MissingProperty",
      "property": "http://ex.example/ns#reportedOn",
      "valueExpr": {
        "type": "NodeConstraint",
        "datatype": "http://www.w3.org/2001/XMLSchema#dateTime"
      }
    }
  ],
  "repairs": [
    …
  ]
}
```

`errors` says what failed; `repairs` says the cheapest edits that would have made it pass. See the [ShEx primer](http://shex.io/primer/) for validation semantics.

## Validate local files

Command line arguments which don't look like URLs are file paths:

```sh
curl -s -O http://shex.io/examples/IssueSchema -O http://shex.io/examples/Issue1.ttl
npx shex-validate -x IssueSchema -d Issue1.ttl -s '#IssueShape' -n '#Issue1'
```

`-s` (`--shape`) and `-n` (`--node`) are resolved against the schema and data locations respectively, so you don't have to construct the entire `file:` URL; the output has `file:` URLs in it:

``` json
{
  "type": "ShapeTest",
  "node": "file:///…/Issue1.ttl#Issue1",
  "shape": "file:///…/IssueSchema#IssueShape",
  "solution": {
    …
  }
}
```

Of course the schema can use `http:` and the data `file:`, or vice-versa. Data may also come from a SPARQL endpoint (`--endpoint`) or a Wikibase's entity pages (`--wikibase`) — each [neighborhood module](../neighborhood-api#readme) declares options `shex-validate` surfaces; see [`@shexjs/neighborhood-sparql`](../neighborhood-sparql#readme) and [`@shexjs/neighborhood-wikibase`](../neighborhood-wikibase#readme).

## Validation server

The `-S` switch specifies a URL at which to run a validation server:

```sh
npx shex-validate \
    -S http://localhost:1234/validate \
    -x IssueSchema \
    -d Issue1.ttl \
    -s '#IssueShape' \
    -n '#Issue1'
```

Because you supplied all necessary parameters in the invocation, by default this server validates `#Issue1` in `Issue1.ttl` against `#IssueShape` in `IssueSchema`. Override any parameter in the query string —
  `http://localhost:1234/validate?node=%23Issue2`
(note that the `#` must be encoded as `%23`) — and you'll see an error, because that node has no arcs out in that graph.

### POSTing with curl

`curl` offers a convenient way to construct POST requests. Suppose you wanted a validation server with no default schema or data:

```sh
npx shex-validate -S http://localhost:1234/validate
```

You could submit all the parameters as body parameters in a POST (a leading `@` in a `-F` value reads from the named file):

```
curl -i http://localhost:1234/validate \
  -F "schema=@IssueSchema" \
  -F "shape=#IssueShape" \
  -F "data=@Issue1.ttl" \
  -F "node=#Issue1"
```

and you can mix and match between URL search string and body parameters:

```
curl -i http://localhost:1234/validate?node=%23Issue1 \
  -F "schema=@IssueSchema" \
  -F "shape=#IssueShape" \
  -F "data=@Issue1.ttl"
```

(Don't forget to escape the `#` as `%23`.)

## Loading extensions

The `--extension` switch loads ShEx [semantic action extensions](http://shex.io/extensions/) into the validator. It takes a package name or a file glob:

```sh
npx shex-validate \
    -x bpfhir.shex -d bpfhir.ttl -n tag:BPfhir123 \
    --extension @shexjs/extension-map
```

Each module is loaded and registered with the validator, and its results are included in the validation output. For example, loading [`@shexjs/extension-map`](../extension-map#readme) as above adorns the results with an `http://shex.io/extensions/Map/` entry, which can be piped to [materialize](#materialize):

```sh
npx shex-validate \
    -x bpfhir.shex -d bpfhir.ttl -n tag:BPfhir123 \
    --extension @shexjs/extension-map \
  | npx shexmap-materialize -t bpdam.shex
```

Extensions needn't be implemented in Javascript: [`@shexjs/extension-wasi-test`](../extension-wasi-test#readme) implements the [Test extension](http://shex.io/extensions/Test/) in hand-written WebAssembly, printing through WASI's `fd_write`:

```sh
    --extension @shexjs/extension-wasi-test
```

The matching engine is also pluggable: `--regex-module @shexjs/eval-simple-1err` trades [the default](../eval-threaded-nerr#readme)'s exhaustive error enumeration for speed.

## Conversion

ShEx can be represented in the compact syntax:

```
PREFIX ex: <http://ex.example/ns#>
<#IssueShape> {                      # An <#IssueShape> has:
    ex:state [ex:unassigned           # state which is
              ex:assigned],           #   unassigned or assigned.
    ex:reportedBy @<#UserShape>       # reported by a <#UserShape>.
}
```

or in JSON (ShExJ):

```json
{
  "type": "Schema",
  "shapes": [
    {
      "id": "http://shex.io/examples/IssueSchema#IssueShape",
      "type": "ShapeDecl",
      "shapeExpr": {
        "type": "Shape",
        "expression": {
          "type": "EachOf",
          "expressions": [
            {
              "type": "TripleConstraint",
              "predicate": "http://ex.example/ns#state",
              "valueExpr": {
                "type": "NodeConstraint",
                "values": [
                  "http://ex.example/ns#unassigned",
                  "http://ex.example/ns#assigned"
                ]
              }
            },
            {
              "type": "TripleConstraint",
              "predicate": "http://ex.example/ns#reportedBy",
              "valueExpr": "http://shex.io/examples/IssueSchema#UserShape"
            }
          ]
        }
      }
    }
  ]
}
```

Convert with `shex-to-json`:

```sh
npx shex-to-json http://shex.io/examples/IssueSchema > IssueSchema.json
```

and back with `json-to-shex`.

## Materialize

`shexmap-materialize` (an executable of [`@shexjs/extension-map`](../extension-map#readme)) transforms data from a source schema to a target schema after validation:

```sh
npx shexmap-materialize -t <target schema> | -h  [-j <JSON Vars File>] [-r <RDF root IRI>]
```

It reads the output of `shex-validate --extension @shexjs/extension-map` from STDIN and maps the captured bindings to the target schema.

If supplied, a JSON vars file fills in constant values not bound from the source data — useful for assigning default fields the source schema has no equivalent for:

```json
{
  "urn:local:Demographics:constSys": "System"
}
```

Any variable in the target schema bound to `urn:local:Demographics:constSys` then materializes as `"System"`.

The RDF root IRI (`-r`) names the node from which the materialized graph descends (default `tag:eric@w3.org/2016/root`).

```sh
npx shex-validate -x source_schema.shex -d data.ttl -s ProblemShape -n prob1 \
    --extension @shexjs/extension-map \
  | npx shexmap-materialize -t target_schema.shex -j vars.json
```

---

`@shexjs/cli` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
