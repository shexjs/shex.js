# @shexjs/extension-test

[![npm version](https://img.shields.io/npm/v/@shexjs/extension-test)](https://www.npmjs.com/package/@shexjs/extension-test)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

The Test semantic-action extension, `http://shex.io/extensions/Test/`: each
`print(...)` action records the line it was handed -- built from the matched
triple's subject/predicate/object or the focus node -- in
`validator.semActHandler.results["http://shex.io/extensions/Test/"]`, and
`fail(...)` reports a `SemActFailure`.  It's the [shexTest](https://github.com/shexSpec/shexTest)
suite's probe for when actions fire; `shex-validate` attaches the collected
lines to a failure report as `semActResults`.

```sh
npm install @shexjs/extension-test
shex-validate --extension @shexjs/extension-test -x schema.shex -d data.ttl -n <node> -s <shape>
```

`require("@shexjs/extension-test").register(validator, {ShExTerm})` installs it on
a validator you construct yourself.

---

`@shexjs/extension-test` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
