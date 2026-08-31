# @shexjs/extension-eval

[![npm version](https://img.shields.io/npm/v/@shexjs/extension-eval)](https://www.npmjs.com/package/@shexjs/extension-eval)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

A semantic-action extension that evaluates JavaScript written in a schema's
semantic actions, registering as `http://shex.io/extensions/Eval/`.  Load
it into `shex-validate` with `--extension @shexjs/extension-eval`, or into a
validator you construct with `require("@shexjs/extension-eval").register(validator, ShEx)`.

```sh
npm install @shexjs/extension-eval
```

It runs code from the schema you validate with: use it on schemas you trust.

---

`@shexjs/extension-eval` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
