# @shexjs/extension-eval

A semantic-action extension that evaluates JavaScript written in a schema's
semantic actions, registering as `http://shex.io/extensions/Eval/`.  Load
it into `shex-validate` with `--extension @shexjs/extension-eval`, or into a
validator you construct with `require("@shexjs/extension-eval").register(validator, ShEx)`.

```sh
npm install @shexjs/extension-eval
```

It runs code from the schema you validate with: use it on schemas you trust.
