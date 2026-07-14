[![NPM Version](https://badge.fury.io/js/shex.png)](https://npmjs.org/package/shex)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/shexjs/shex.js/badge.svg?branch=main)](https://coveralls.io/github/shexjs/shex.js?branch=main)
[![ShapeExpressions Gitter chat https://gitter.im/shapeExpressions/Lobby](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/shapeExpressions/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.1213693.svg)](https://doi.org/10.5281/zenodo.1213693)

# shex

`shex` is the meta-package for the [shex.js](https://github.com/shexjs/shex.js) javascript implementation of [Shape Expressions](http://shex.io/) ([try online](https://shex.io/webapps/packages/shex-webapp/doc/shex-simple.html)).
Installing it gives you the whole toolkit in one dependency: the parser/validator library, the command-line tools, the [ShExMap](http://shex.io/extensions/Map/) data-mapping extension and the web app.
If you only need one piece, each is published separately as an [`@shexjs/` package](#the-shexjs-packages).

## install

``` shell
npm install --save shex
```

## validation library

`require("shex")` exposes the main `@shexjs/` entry points:

```js
const ShEx = require("shex");

const shexc = "http://shex.io/examples/IssueSchema";  // schema location
const data = "http://shex.io/examples/Issue1";        // data location
const node = "http://shex.io/examples/Issue1#Issue1"; // node in that data

const N3 = require("n3");
const ShExLoader = ShEx.Loader({                      // initialize with:
  fetch: require("node-fetch"),                       //   fetch implementation
  rdfjs: N3,                                          //   RdfJs Turtle parser
});

ShExLoader.load({shexc: [shexc]}, {turtle: [data]})
  .then(function (loaded) {
    const db = ShEx.RdfJsDb(loaded.data);
    const validator = new ShEx.Validator.ShExValidator(loaded.schema, db, { results: "api" });
    const smap = [                                // array of node/shape pairs
      {node: node,                                //   JSON-LD @id for node
       shape: ShEx.Validator.ShExValidator.Start} //   schema's start shape
    ];
    const result = validator.validateShapeMap(smap); // conformant if no "errors"
    console.log(JSON.stringify(result, null, 2));
  });
```

The exposed properties are `Parser`, `Writer`, `Validator`, `RdfJsDb`, `Loader`, `NodeLoader` (adds `file:` URL support), `Term`, `Util`, `Visitor` and `ShapeMap`.

## command line tools

The executables come from [`@shexjs/cli`](https://github.com/shexjs/shex.js/tree/main/packages/shex-cli#readme) (pulled in by this package) and land in `node_modules/.bin/`, so `npx` finds them:

Validate something in HTTP-land:

```sh
npx shex-validate \
    -x http://shex.io/examples/Issue.shex \
    -d http://shex.io/examples/Issue1.ttl \
    -s http://shex.io/examples/IssueShape \
    -n http://shex.io/examples/Issue1
```

That validates node `http://shex.io/examples/Issue1` in `http://shex.io/examples/Issue1.ttl` against shape `http://shex.io/examples/IssueShape` in `http://shex.io/examples/Issue.shex`.
The result is a JSON structure which tells you exactly how the data matched the schema; a result with `"errors"` tells you the data was invalid with respect to the schema.
See the [ShExJ primer](http://shex.io/primer/) for a description of ShEx validation and the [ShExJ specification](http://shex.io/primer/ShExJ) for more details about the results format.

`shex-validate`'s `-n` and `-s` arguments are evaluated as IRIs relative to the (first) data and schema sources respectively, so the above can be written `-s IssueShape -n Issue1`.

Convert between the ShEx compact syntax (ShExC) and its JSON representation (ShExJ):

```sh
npx shex-to-json http://shex.io/examples/Issue.shex > Issue.json
npx json-to-shex Issue.json
```

Command line arguments which don't start with `http://` or `https://` are assumed to be file paths, so the JSON version works offline:

```sh
npx shex-validate \
    -j Issue.json \
    -d http://shex.io/examples/Issue1.ttl \
    -s http://shex.io/examples/IssueShape \
    -n http://shex.io/examples/Issue1
```

## materialize

`shexmap-materialize` (from [`@shexjs/extension-map`](https://github.com/shexjs/shex.js/tree/main/packages/extension-map#readme)) transforms data from a source schema to a target schema after validation:

```sh
shexmap-materialize -t <target schema> | -h  [-j <JSON Vars File>] [-r <RDF root IRI>]
```

It reads the output of `shex-validate --extension` from STDIN and maps it to the specified target schema (`--extension` takes a path to the extension module):

```sh
npx shex-validate -x source_schema.shex -d data.ttl -s ProblemShape -n prob1 \
    --extension node_modules/@shexjs/extension-map \
  | npx shexmap-materialize -t target_schema.shex -j vars.json
```

If supplied, a JSON vars file fills in constant values not bound from the source data, e.g.

```json
{
  "urn:local:Demographics:constSys": "System"
}
```

The RDF root IRI (`-r`, default `tag:eric@w3.org/2016/root`) names the node from which the materialized graph descends.

## the @shexjs/ packages

- [`@shexjs/parser`](https://github.com/shexjs/shex.js/tree/main/packages/shex-parser#readme) -- parse ShExC into ShExJ
- [`@shexjs/writer`](https://github.com/shexjs/shex.js/tree/main/packages/shex-writer#readme) -- serialize ShExJ as ShExC
- [`@shexjs/validator`](https://github.com/shexjs/shex.js/tree/main/packages/shex-validator#readme) -- validate nodes in an RDF graph against shapes in a schema
- [`@shexjs/loader`](https://github.com/shexjs/shex.js/tree/main/packages/shex-loader#readme) -- an API for loading and using ShEx schemas
- [`@shexjs/node`](https://github.com/shexjs/shex.js/tree/main/packages/shex-node#readme) -- additional API functionality for a node environment
- [`@shexjs/cli`](https://github.com/shexjs/shex.js/tree/main/packages/shex-cli#readme) -- command line tools for transforming and validating with schemas
- [`@shexjs/webapp`](https://github.com/shexjs/shex.js/tree/main/packages/shex-webapp#readme) -- the shex-simple web app
- [`@shexjs/extension-map`](https://github.com/shexjs/shex.js/tree/main/packages/extension-map#readme) -- transform data from one schema to another
- ... and more; see [the repository](https://github.com/shexjs/shex.js#npm-workspaces-monorepo) for the full list and development instructions.

Happy validating!
