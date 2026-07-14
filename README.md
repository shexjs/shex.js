[![NPM Version](https://badge.fury.io/js/shex.png)](https://npmjs.org/package/shex)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/shexjs/shex.js/badge.svg?branch=main)](https://coveralls.io/github/shexjs/shex.js?branch=main)
[![ShapeExpressions Gitter chat https://gitter.im/shapeExpressions/Lobby](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/shapeExpressions/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.1213693.svg)](https://doi.org/10.5281/zenodo.1213693)

# shex.js
shex.js javascript implementation of Shape Expressions ([try online](https://shex.io/webapps/packages/shex-webapp/doc/shex-simple.html))


## install

``` shell
npm install --save shex
```

## test

``` shell
npm ci
npm test
```

See [building](#building) and [testing](#testing) below for the full development story.

### branch-specific tests

The `shex.js` repo includes several branches for features that are in-flight in the ShEx Community Group. Each branch depends on the corresponding branch of the [shexTest](https://github.com/shexSpec/shexTest) test suite. The package.json file for each branch SHOULD have that corresponding shexTest branch à la:
``` json
  "shex-test": "github:shexSpec/shexTest#extends"
```
The [test harness](packages/shex-cli/test/findPath.js) prefers a `../shexTest` sibling checkout and otherwise uses the `shex-test` npm dependency. If you test from a sibling clone, keep its branch aligned with your shex.js branch; the pre-commit hook (`npm run check-branch-deps`) whines when `main` isn't testing against `shexTest#main`.

## validation

You can validate RDF data using the `shex-validate` executable or the validation library described below.

###  validation executable

Validate something in HTTP-land:

```sh
npx shex-validate \
    -x http://shex.io/examples/Issue.shex \
    -d http://shex.io/examples/Issue1.ttl \
    -s http://shex.io/examples/IssueShape \
    -n http://shex.io/examples/Issue1
```

That validates node `http://shex.io/examples/Issue1` in `http://shex.io/examples/Issue1.ttl` against shape `http://shex.io/examples/IssueShape` in `http://shex.io/examples/Issue.shex`.
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

A result with `"errors"` tells you the data was invalid with respect to the schema.
See the [ShExJ primer](http://shex.io/primer/) for a description of ShEx validation and the [ShExJ specification](http://shex.io/primer/ShExJ) for more details about the results format.

####  relative resolution

`shex-validate`'s -n and -s arguments are evaluated as IRIs relative to the (first) data and schema sources respectively.
The above invocation validates the node `<Issue1>` in `http://shex.io/examples/Issue1.ttl`.
This and the shape can be written as relative IRIs:

```sh
npx shex-validate \
    -x http://shex.io/examples/Issue.shex \
    -d http://shex.io/examples/Issue1.ttl \
    -s IssueShape \
    -n Issue1
```


### validation library

The ShExLoader fetches and parses the schema and data and wires them up for validation:
<a name="loader-script"/>
```js
const shexc = "http://shex.io/examples/IssueSchema";  // schema location
const data = "http://shex.io/examples/Issue1";        // data location
const node = "http://shex.io/examples/Issue1#Issue1"; // node in that data

const N3 = require("n3");
const ShExLoader = require("@shexjs/loader")({        // initialize with:
  fetch: require('node-fetch'),                       //   fetch implementation
  rdfjs: N3,                                          //   RdfJs Turtle parser
});
const { ctor: RdfJsDb } = require('@shexjs/neighborhood-rdfjs');
const {ShExValidator} = require("@shexjs/validator");

ShExLoader.load({shexc: [shexc]}, {turtle: [data]})
  .then(function (loaded) {
    var db = RdfJsDb(loaded.data);
    var validator = new ShExValidator(loaded.schema, db, { results: "api" });
    const smap = [                                // array of node/shape pairs
      {node: node,                                //   JSON-LD @id for node
       shape: ShExValidator.Start}                //   schemas's start shape
    ]
    var result = validator.validateShapeMap(smap);  // success if no "errors"
    console.log(JSON.stringify(result, null, 2));
  } );
```

Note that the shex loader takes an array of ShExC schemas, either file paths or URLs, and an array of JSON schemas (empty in this invocation) and an array of Turtle files.

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
npx shex-to-json http://shex.io/examples/Issue.shex
```
and, less elegantly, back with json-to-shex.

### conversion by library

As with validation, the ShExLoader wraps the fetching and parsing:

```js
const shexc = "http://shex.io/examples/Issue.shex";

const ShEx = require("shex");
const ShExLoader = ShEx.Loader({fetch: require("node-fetch"), rdfjs: require("n3")});
ShExLoader.load({shexc: [shexc]}, null).then(function (loaded) {
    console.log(JSON.stringify(loaded.schema, null, "  "));
});
```

There's no actual conversion; the JSON representation is just the stringification of the parsed schema.


## local files

Command line arguments which don't start with http:// or https:// are assumed to be file paths.
We can create a local JSON version of the Issues schema:
```sh
npx shex-to-json http://shex.io/examples/Issue.shex > Issue.json
```
and use it to validate the Issue1.ttl as we did above:
```sh
npx shex-validate \
    -j Issue.json \
    -d http://shex.io/examples/Issue1.ttl \
    -s http://shex.io/examples/IssueShape \
    -n http://shex.io/examples/Issue1
```

Of course the data file can be local as well.

Happy validating!

## materialize

`shexmap-materialize` (from [`@shexjs/extension-map`](packages/extension-map#readme)) transforms data from a source schema to a target schema after validation is done.

The syntax is:
```sh
shexmap-materialize `-t <target schema>`|-h [-j `<JSON Vars File>`] [-r `<RDF root IRI>`]
```
It reads the output of `shex-validate --extension` from STDIN and maps it to the specified target schema (`--extension` takes a path to the extension module).

If supplied, a JSON vars file will be referenced to fill in constant values not specified from the source.
This is useful in assigning default fields to the target when there is no equivalent value in the source schema
and source data.

Here is an example of a simple JSON vars file:
```json
{
  "urn:local:Demographics:constSys": "System"
}
```
If this vars file content is used, then any time a variable in the target file with
value "urn:local:Demographics:constSys" is seen, the value "System" will be substituted.

The RDF root IRI specifies the root node from which all nodes in the schema will descend.
The default root if none is specified is: ` tag:eric@w3.org/2016/root `

Here are some examples:
```sh
npx shexmap-materialize -h
```
```sh
npx shex-validate -x source_schema.shex -d data.ttl -s ProblemShape -n prob1 \
    --extension node_modules/@shexjs/extension-map \
  | npx shexmap-materialize -t target_schema.shex -j vars.json
```
```sh
cat problem.val | npx shexmap-materialize -t target_schema.shex -j vars.json -r http://hl7.org/fhir/shape/problem
```
See [`doc/threaded-materializer.md`](packages/extension-map/doc/threaded-materializer.md) for how materialization works.
# ShEx2 features

## ShEx IMPORT Demo (with relative IRIs):

1. open a browser window (we'll call **validator**) with https://shex.io/webapps/packages/shex-webapp/doc/shex-simple.html
2. open another browser window (we'll call **viewer**) with https://shex.io/shexTest/main/viewer?validation
3. wait 'till *viewer* loads and look for "3circRefS1-IS2-IS3-IS3" (near the bottom)
4. drag the "#3circRefS1-IS2-IS3-IS3" cell (or the ✓ to the left of it) to the right of the QueryMap area of *validator*
5. click on the long label under "Manifest:", then the long label under "Passing:" and validate.

It should validate, which involves the IMPORT of `3circRefS2-IS3` and `3circRefS3`.
`3circRefS2-IS3` also IMPORTs `3circRefS3` which shows that IMPORT is idempotent (has a side effect only the first time).

# npm workspaces monorepo

This repo uses [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces) to manage multiple NPM packages located in `packages/*`:

- [`shex`](packages/shex#readme) -- meta-package aggregating the packages below
- [`shape-map`](packages/shape-map#readme) -- a [ShapeMap](https://shexspec.github.io/shape-map/) parser
- [`@shexjs/parser`](packages/shex-parser#readme) -- parse ShExC into ShExJ
- [`@shexjs/writer`](packages/shex-writer#readme) -- serialize ShExJ as ShExC
- [`@shexjs/term`](packages/shex-term#readme) -- RDF terms used in ShEx
- [`@shexjs/util`](packages/shex-util#readme) -- some utilities for transforming schemas or validation output
- [`@shexjs/visitor`](packages/shex-visitor#readme) -- a [visitor](https://en.wikipedia.org/wiki/Visitor_pattern) for schemas
- [`@shexjs/validator`](packages/shex-validator#readme) -- validate nodes in an RDF graph against shapes in a schema
- [`@shexjs/eval-simple-1err`](packages/eval-simple-1err#readme) -- eval-simple-1err
- [`@shexjs/eval-threaded-nerr`](packages/eval-threaded-nerr#readme) -- eval-threaded-nerr
- [`@shexjs/loader`](packages/shex-loader#readme) -- an API for loading and using ShEx schemas
- [`@shexjs/node`](packages/shex-node#readme) -- additional API functionality for a node environment
- [`@shexjs/cli`](packages/shex-cli#readme) -- a set of command line tools for transforming and validating with schemas
- [`@shexjs/webapp`](packages/shex-webapp#readme) -- the shex-simple WEBApp
- [`@shexjs/shape-path-query`](packages/shex-shape-path-query#readme) -- traverse ShEx schemas with a path language
- [`@shexjs/extension-test`](packages/extension-test#readme) -- a small language for testing semantic actions in ShEx implementations ([more](http://shex.io/extensions/Test/))
- [`@shexjs/extension-map`](packages/extension-map#readme) -- an extension for transforming data from one schema to another ([more](http://shex.io/extensions/Map/))
- [`@shexjs/extension-eval`](packages/extension-eval#readme) -- simple extension which evaluates Javascript semantic action code ([more](http://shex.io/extensions/Eval/))

## building

``` shell
git clone git@github.com:shexjs/shex.js.git
cd shex.js
npm ci                  # install and cross-link all workspace packages
```

`npm ci` links every `packages/*` package into `node_modules`, so the packages resolve each other at their workspace versions and their executables land in `node_modules/.bin/`.

Generated artifacts are committed, so these are only needed after changing the corresponding sources:

``` shell
npm run parser-all      # regenerate the Jison parsers (ShExC and ShapeMap)
npm run compile         # make ALL: recompile the TypeScript packages' lib/ output
npm run webpack         # rebuild the browser bundles in packages/*/doc/webpacks/
```

To try the web apps locally, serve the repository root with any static web
server (the pages reference scripts across `packages/*` by relative path).
Apache pointed at the checkout works; so does the zero-dependency server that
ships in `@shexjs/webapp`:

``` shell
npm run serve           # prints the shex-simple / shexmap-simple URLs
                        # (npx shex-serve [--port N] [--root DIR] [--coi] outside the repo)
```

Add `?editors=1` to either app URL for the language-aware CodeMirror editors
(see [doc/editor-integration-plan.md](doc/editor-integration-plan.md)).
With the editors on, shexmap-simple's 🐞 button steps through a
materialization with breakpoints; `shexmap-debug` and `shex-debug` are the
command-line equivalents (see [doc/debugger-design.md](doc/debugger-design.md)).
`shex-serve --coi` sends the cross-origin-isolation headers that
browser-side validation debugging will need.

To add a dependency to one package, use npm's `--workspace` flag from the repo root, e.g. `npm install promise-worker --workspace=@shexjs/webapp`.
Development tooling (mocha, webpack, eslint...) lives in the root `devDependencies`.

## testing

``` shell
npm test                # quick suite, as run by the pre-commit hook
npm run test-all        # everything, including the cli, browser and server tests
TESTS='ThreadedMaterializer|Map' npm test  # filter by test name pattern
npm run lint
npm run coverage        # test-all under nyc; writes coverage/lcov.info
```

`npm run test-all` sets `TEST_cli`/`TEST_browser`/`TEST_server`; the same suite runs in [CI](.github/workflows/ci.yml) on every supported Node version.
The test suite validates against a checkout of [shexTest](https://github.com/shexSpec/shexTest); it uses the copy installed as the `shex-test` dependency, or a `../shexTest` sibling checkout if you have one.
On `main`, the `shex-test` dependency must track `shexTest#main` (enforced by `npm run check-branch-deps` in the pre-commit hook).

## publishing

The packages share one version line (formerly lerna's "fixed" mode; lerna is no longer used).
To release:

``` shell
npm run bump-versions -- 1.0.0-alpha.NN   # set every package version and cross-dependency range
                                          # (add --dry-run to preview)
npm install                               # sync package-lock.json
npm run test-all                          # the meta-package tests check version-range consistency
git commit -am 'chore(release): publish'
git tag v1.0.0-alpha.NN
git push --follow-tags
npm publish --workspaces                  # publish every packages/* package
```

`npm publish --workspaces` publishes each workspace package; per-package `publishConfig` already grants public access.
