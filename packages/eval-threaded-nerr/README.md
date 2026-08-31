# @shexjs/eval-threaded-nerr

[![npm version](https://img.shields.io/npm/v/@shexjs/eval-threaded-nerr)](https://www.npmjs.com/package/@shexjs/eval-threaded-nerr)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

The thorough matching engine for [`@shexjs/validator`](../shex-validator#readme): an implementation of [`@shexjs/eval-validator-api`](../eval-validator-api#readme) which exhaustively enumerates the combinations of ways a node's triples can (fail to) satisfy a shape's triple expression.

A shape's triple expression is essentially a regular expression over the node's arcs. This engine follows every thread of that match, so a failure reports *each* way the data missed — the error lists the WebApp and [`@shexjs/util`](../shex-util#readme)'s `errsToSimple` render. It is [`@shexjs/validator`](../shex-validator#readme)'s default; you only name it to be explicit:

``` js
const {ShExValidator} = require("@shexjs/validator");
new ShExValidator(schema, db, {
  regexModule: require("@shexjs/eval-threaded-nerr").RegexpModule
});
```

From [`@shexjs/cli`](../shex-cli#readme), the same choice is `--regex-module @shexjs/eval-threaded-nerr`. When you want speed over diagnosis — the first error is enough — use [`@shexjs/eval-simple-1err`](../eval-simple-1err#readme) instead.

## Install

``` shell
npm install @shexjs/eval-threaded-nerr
```

---

`@shexjs/eval-threaded-nerr` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
