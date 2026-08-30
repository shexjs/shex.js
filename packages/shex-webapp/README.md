# @shexjs/webapp

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
