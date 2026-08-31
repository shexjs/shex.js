# @shexjs/webapp

[![npm version](https://img.shields.io/npm/v/@shexjs/webapp)](https://www.npmjs.com/package/@shexjs/webapp)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

The shex-simple web app: a schema pane, a data pane over whichever data
source is picked (an RDF store, a SPARQL endpoint, a Wikibase), a shape map
and the validation results, with editors that lint as you type and point at
what a failure is about ([try it](https://shex.io/webapps/packages/shex-webapp/doc/shex-simple.html)).

```sh
npm install @shexjs/webapp
npx shex-serve            # serves doc/ locally
```

The pages are in `doc/`: `shex-simple.html` (validation on the page),
`shex-worker.html` (validation in a worker).  Their scripts compile from
`src/app/*.ts` (`npm run build`), and the bundles they load, in
`doc/webpacks/`, come from `npm run webpacks-all` at the repository root --
they are built before publishing, not committed.  Plugins add panes, verbs
and data sources: `?plugin=<url>` loads one, and `doc/plugins.md` at the
repository root is the contract (ShExMap is one, in `@shexjs/extension-map`).

---

`@shexjs/webapp` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
