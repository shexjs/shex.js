# @shexjs/extension-test

The Test semantic-action extension, `http://shex.io/extensions/Test/`: it
records what each `%Test{ ... %}` action was handed -- the node, predicate
and object of the matched triple -- under `semActResults` in the validation
results, which is what the CLI's tests and its `--extension` example use.

```sh
npm install @shexjs/extension-test
shex-validate --extension @shexjs/extension-test -x schema.shex -d data.ttl -n <node> -s <shape>
```

`require("@shexjs/extension-test").register(validator, ShEx)` installs it on
a validator you construct yourself.
