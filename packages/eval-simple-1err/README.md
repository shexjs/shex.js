# @shexjs/eval-simple-1err

[![npm version](https://img.shields.io/npm/v/@shexjs/eval-simple-1err)](https://www.npmjs.com/package/@shexjs/eval-simple-1err)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

The fast matching engine for [`@shexjs/validator`](../shex-validator#readme): an implementation of [`@shexjs/eval-validator-api`](../eval-validator-api#readme) which stops at the first error.

A shape's triple expression is essentially a regular expression over the node's arcs. Where the default engine ([`@shexjs/eval-threaded-nerr`](../eval-threaded-nerr#readme)) enumerates every way a match could fail, this one reports the first miss and moves on — the right trade when conformance is the question and diagnosis isn't:

``` js
const {ShExValidator} = require("@shexjs/validator");
new ShExValidator(schema, db, {
  regexModule: require("@shexjs/eval-simple-1err").RegexpModule
});
```

From [`@shexjs/cli`](../shex-cli#readme), the same choice is `--regex-module @shexjs/eval-simple-1err`.

## Install

``` shell
npm install @shexjs/eval-simple-1err
```

---

`@shexjs/eval-simple-1err` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
