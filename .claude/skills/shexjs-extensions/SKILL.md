---
name: shexjs-extensions
description: Write or maintain a shex.js semantic-action extension — the packages/extension-* packages (test, eval, map, reduce, reduce-js, wasi, wasi-test, shacl-sparql) and semact-overlay. Covers the register/dispatch/done contract, what a handler must return, how the CLI, the shex meta-package and the WebApp load extensions, the examples manifest, index.html box and tests every new extension gets, external (NoCode) action code, and how extension tests reach the shexTest corpus through findPath.js. Use when adding an extension, changing how %<IRI>{ … %} actions run, or debugging a SemAct test.
---

# Semantic-action extensions

An **extension** handles semantic actions. A schema names it by IRI and
calls it as `%<IRI>{ code %}` on a triple constraint, a shape, or the
schema's start actions. An action whose IRI has no registered handler is
skipped. A web-app **plugin** is a different thing: a module loaded by URL
that may install extensions. The repo-root `doc/plugins.md` (and the shexjs-webapp skill)
covers plugins. Keep the two words apart.

| package | IRI | what it does |
| --- | --- | --- |
| `extension-test` | `http://shex.io/extensions/Test/` | `print(…)`/`fail(…)`, used by shexTest's SemanticAction tests. No suite of its own: the corpus run exercises it |
| `extension-eval` | `http://shex.io/extensions/Eval/` | runs the code as a JS function body (`this` = ctx) |
| `extension-map` | `http://shex.io/extensions/Map/#` | ShExMap: binds values, then `materializer` builds the target graph. A **factory**: `require(…)({rdfjs, Validator})`. CLI bins `shexmap-materialize`, `shexmap-debug` |
| `extension-reduce` (+ `-reduce-js`) | `http://shex.io/extensions/Reduce/` | folds a validation result bottom-up into an AST. `reduce()` takes an `evaluate(code, scope)`; `-reduce-js` is the JS evaluator. `registerEager` runs during validation and can refuse a match |
| `extension-shacl-sparql` | `http://shex.io/extensions/SHACL-SPARQL/` | SHACL-SPARQL: a `SELECT` fails per row (`?message`), an `ASK` passes when true; `$this`/`$value` pre-bound. Runs over the db's `querySource()` (Comunica over a dataset, or the endpoint). Answers with promises (`asynchronous: true`). Not in `@shexjs/shex` (Comunica's weight) |
| `extension-wasi` | `http://shex.io/extensions/WASI/` | the action code is WAT for a WASI command, compiled with wabt |
| `extension-wasi-test` | Test's IRI | the Test extension written in hand-written WAT (`lib/*.wat` and `lib/*.wasm` are **tracked**). Register it *or* extension-test, not both |
| `semact-overlay` | — | attaches actions from a separate RDF document: `applyOverlay` rewrites the schema; `indexOverlay` → `new ShExValidator(schema, db, {semActIndex})` leaves it untouched |

## The contract

A module exports `{name, description, url, register, done}`
(`extension-test/src/shex-extension-test.ts` is the smallest example):

```ts
function register (validator, api /* must contain ShExTerm */) {
  validator.semActHandler.results[URL] = [];            // collected output, if any
  validator.semActHandler.register(URL, {
    dispatch (code, ctx, extensionStorage, resultsArtifact?) { … return []; }
  });
  return validator.semActHandler.results[URL];
}
function done (validator) { /* e.g. delete results[URL] if empty */ }
```

- `register` is per validator instance. Hosts pass
  `api = {ShExTerm}` (the CLI) or the whole `ShExWebApp` (the WebApp).
  Every stock extension throws if `api.ShExTerm` is missing.
- **`dispatch` must return an array.** `[]` means success. A non-empty
  array fails the constraint: `dispatchAll` wraps it as
  `{type: "SemActFailure", errors: <your array>}`. By convention the stock
  extensions return `[{type: "SemActFailure", errors: [msg]}]`. Any other
  return value (`true`, `undefined`) throws "unsupported response". (The
  ShExMap materializer has its own dispatcher, which treats results as
  booleans.) After the first failure in a list, the remaining actions are not dispatched.
  Throwing is for invocation errors (bad code syntax).
- **A handler that has to wait returns a promise** instead ("ask me again
  once this settles"). The dispatcher answers for it with a provisional
  failure and keeps the promise (`takePending()`). The dispatch site
  (`settleSemActs`, or the loop around `regexEngine.match` in
  `tryPartition`) yields `{settle: promises}`, then dispatches again. So
  the handler must answer the repeat call outright, usually from a cache
  the promise filled. Only `validateShapeMapAsync` waits. The sync
  `validateShapeMap` throws "use validateShapeMapAsync". A rerun
  re-dispatches the actions around the one that waited. `results` (in
  place) and the artifact's `extensions` are rolled back first; other side
  effects repeat. `shex-validator/test/AsyncSemAct-test.js` checks every
  site under both engines, and runs the corpus's Test-extension tests with
  every action deferred once.
- `ctx` depends on where the action is. On a triple constraint or an
  EachOf/OneOf it is `{triples, tripleExpr}`. On a shape it is
  `{node, triples, …}`, and on a node constraint it is the result plus
  `node`. For start actions it is `null`. Check the engine
  (`eval-threaded-nerr`, `eval-simple-1err`) before depending on anything
  else.
- `extensionStorage` is written to `result.extensions[URL]`, and only if
  you put a key in it. `resultsArtifact` is the TestedTriple/ShapeTest being
  built, for an action that needs to see what its object matched.
- `code` is `null` for a code-less action (`%<IRI>%`) unless the caller
  supplied external code: `new ShExValidator(schema, db, {semActs: {<name>: code}})`.
  Handlers are looked up by **exact name**. The corpus's NoCode tests name
  acts with fragments (`…/Test/#a`), so a harness must register the handler
  under each such name (see `extension-wasi/test/extension-wasi-test.js`).
- A handler slows validation: the validator's `canFork()` stops forking
  independent branches once any *registered* action appears in the schema.
  Leave actions unregistered when all you want is validation.
- A module can be a **factory** (a function). `ShExNode.loadExtensions`
  calls it with `{Validator: {}, …config}` and keys the result by `.url`.
- A module that has to initialize asynchronously exports `ready()`
  (`extension-wasi`: wabt). **Every host must await it before the first
  dispatch**: the WebApp plugin does, and so does `validate --extension`
  (`runValidator`). A new host that forgets gets "not initialized;
  `await extension.ready()`".

## How extensions get loaded

- **CLI**: `validate --extension <package-or-glob>` (repeatable).
  `runValidator` in `packages/shex-cli/src/validate.ts` awaits each module's
  `ready()` (if any), calls `register(validator, {ShExTerm})` before
  validating, and calls `done` after. A module whose handlers return
  promises exports **`asynchronous: true`**: the CLI then validates with
  `validateShapeMapAsync`. Without it, the CLI keeps the synchronous
  driver, and the first promise throws "use validateShapeMapAsync".
  `--exec` code gets `validator` for reading `semActHandler.results`
  afterwards.
- **`@shexjs/shex`**: `ShEx.Extensions` bundles Map/Eval/Test/Reduce/
  ReduceJs/Wasi/WasiTest for `register(validator)`.
- **Library/tests**: `require` the module and call `register`/`done` yourself.
- **WebApp**: through a plugin descriptor's `register`, or a
  `.pluginControl` checkbox. `extension-{map,reduce,wasi}/doc/*Plugin.js`
  are worked examples. Each has a webpack bundle (`npm run webpack` in the
  package; the root `npm run webpacks-all` builds them all), and the
  browser tests need those bundles.

## Adding an extension package

1. Copy extension-test's layout: `src/shex-extension-<x>.ts` →
   gitignored `lib/*.js`, `tsconfig.json`, `main: lib/…js`. Add its line to
   the Makefile's package table (`Makefile-test.js` fails until you do). Publish order comes from
   `tools/publish-ordered.js`.
2. Give it a **fresh IRI**. An IRI selects the handler, and two handlers
   registered under one IRI replace each other (last wins).
3. If it should ship with `@shexjs/shex`, add it to the `Extensions` getter
   in `packages/shex/src/shex.ts`, plus a README entry (see the README
   pattern the other packages follow).
4. **Give it examples, and point at them.** Every extension gets a demo
   manifest, and every demo manifest gets a way in from the site:
   - `examples/manifest.yaml`: a pass and a fail entry under each
     `schemaLabel`, each naming its plugin (`plugins:
     [../doc/ShEx<X>Plugin.js]`) so opening the manifest installs it. Use
     `schemaURL:` files rather than YAML anchors, because the aggregator
     copies text.
   - `doc/ShEx<X>Plugin.js`: one file with both faces, page and worker
     (copy `extension-wasi`'s, or `extension-eval`'s if there's no bundle).
     A bundle also needs `webpack.config.js`, a `.gitignore` line for
     `doc/webpacks/`, the root `webpack`/`webpacks-all` scripts, and the
     `git add -f` list in `.github/workflows/webapps-site.yml`.
   - **`/index.html`**: a link in the "Semantic-action extensions" box, or
     a box of its own for an extension worth showing off (see the
     SHACL-SPARQL one). Add its bundle to the STRIP-FOR-PUBLICATION
     local-dev notice too.
   - `tools/aggregate-manifests.js` `SOURCES`, then
     `node tools/aggregate-manifests.js`. `tests-manifest-test.js` fails
     until `doc/tests-manifest.yaml` is regenerated.
   - A row in `packages/shex-webapp/test/semact-plugins-test.js`
     (`TEST_browser`, page and worker), and a node test that validates
     every manifest entry and checks its `status` (see
     `extension-shacl-sparql/test/ShaclSparql-test.js`).

## Testing

- **Unit tests** build a tiny schema inline, register, validate one node,
  call `done`, and assert on results/`extensions`
  (`extension-eval/test/Eval-test.js`). Tests `require` `lib`, so run `npx
  tsc` in the package first (see shexjs-build-and-test).
- **Corpus access**: shexTest isn't in the repo. Resolve it with
  `require("../../shex-cli/test/findPath.js")("schemas")` (also
  `"validation"`, and the `*-contrib` dirs). It honours `TESTSDIR` and
  sibling checkouts, then falls back to the `shex-test` devDependency. See
  shextest-paired-branches for which corpus branch you get.
  `extension-wasi` and `extension-reduce/test/ShExR-test.js` use it.
  `shex-cli/test/SemActs-test.js` combines corpus schemas with its own
  `test/SemActs/Manifest.json` for extension-eval.
- **Parity suites**: `extension-wasi/tools/gen-tests.js` recodes every
  corpus test that uses Test actions as WAT and writes it into `test/wasi/`
  (regenerate with `npm run gen-tests` when the corpus changes). The suite
  runs each test under both extensions, and both must agree with each
  other and with the manifest's `extensionResults`.
  `shex-validator/test/Validation-test.js` registers extension-test for
  every corpus test but aliases no fragment names, so it does **not**
  compare `extensionResults`. Coverage of that lives in the wasi suite.
- Gates: `extension-map`'s CLI tests need `TEST_cli=true`. Its editor
  smoke tests need `TEST_browser=true` and fresh webpack bundles. `TESTS=`
  filters several suites (the separator differs by file; see its header).
