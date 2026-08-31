# @shexjs/eval-validator-api

[![npm version](https://img.shields.io/npm/v/@shexjs/eval-validator-api)](https://www.npmjs.com/package/@shexjs/eval-validator-api)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

The interface between [`@shexjs/validator`](../shex-validator#readme) and its pluggable matching engines: types for compiling a shape's triple expression and matching a node's triples against it, plus what the engine hands back (solutions, errors) and the hooks it calls along the way (semantic-action dispatch, EXTENDS/RESTRICTS handling, no-triple-constraint checks).

The validator walks shape *expressions* (AND/OR/NOT, node constraints, references); when it reaches a `Shape`, it asks an engine implementing this API to match the triple expression inside. Two implementations ship with the suite:

* [`@shexjs/eval-threaded-nerr`](../eval-threaded-nerr#readme) (default) — enumerates every way the data fails to match;
* [`@shexjs/eval-simple-1err`](../eval-simple-1err#readme) — stops at the first error.

An engine exports a `RegexpModule` (a `ValidatorRegexModule`): `compile(schema, shape, index)` returns the `ValidatorRegexEngine` that matches one shape's expression. Select an engine with the validator's `regexModule` option:

``` js
new ShExValidator(schema, db, {
  regexModule: require("@shexjs/eval-simple-1err").RegexpModule
});
```

There is nothing to call directly in this package unless you are writing an engine; depend on it for the types and the contract.

## Install

``` shell
npm install @shexjs/eval-validator-api
```

---

`@shexjs/eval-validator-api` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
