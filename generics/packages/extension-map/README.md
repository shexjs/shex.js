# @shexjs/extension-map

[![npm version](https://img.shields.io/npm/v/@shexjs/extension-map)](https://www.npmjs.com/package/@shexjs/extension-map)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

ShExMap: a semantic-action extension that binds values as a node validates
(`%Map:{ :name %}` on a triple constraint captures what the triple's object
was) and materializes a graph of another schema from those bindings.  The
extension registers as `http://shex.io/extensions/Map/#`.

```sh
npm install @shexjs/extension-map
```

- `shexmap-materialize -t target.shex [-j vars.json] [-r root]` reads the
  bindings `shex-validate --extension @shexjs/extension-map` printed and
  builds the target graph (`doc/threaded-materializer.md` says how: a
  threaded search over the target schema, alternatives offered where the
  bindings could fit more than one way).
- `shexmap-debug` steps that materialization from a terminal.
- In the web app, `shex-simple.html?plugin=…/doc/ShExMapPlugin.js` (or
  `shexmap-simple.html`) adds the bindings, output-schema and materialization
  panes; the plugin is built from `src/plugin/ShExMapPlugin.ts` by
  `npm run build`, which also compiles the library into `lib/`.

The library (`require("@shexjs/extension-map")`) is a factory taking the
ShEx modules it works with and answering the extension -- `register(validator, {ShExTerm})`,
the `ThreadedMaterializer` and its debugger; see the repository for the
ShExMap specification and `examples/` for worked pairs.

---

`@shexjs/extension-map` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
