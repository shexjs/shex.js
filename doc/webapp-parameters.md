# The validator's URL parameters

The validator is one page, `packages/shex-webapp/doc/shex.html`, and
its query string says how it runs, what it opens on, what it loads and
how it reports. Parameters combine, so one link can say all of it. A
permalink (the 🔗 in the app) is such a link, written by the app.

Relative URLs in a parameter are resolved against the page, so from the
published site `../../extension-map/examples/manifest.yaml` is that
package's manifest.

## How it runs

| parameter | values | meaning |
| --- | --- | --- |
| `worker=1` | | validate in a Web Worker rather than on the page's thread: the page stays responsive, and a validation can be interrupted |
| `editors=` | *(default)*, `textarea` | the language-aware editors, or plain textareas. `editors=1` in an old link means the default |
| `regexpEngine=` | `eval-threaded-nerr` *(default, thorough)*, `eval-simple-1err` *(fast)* | which matcher: every way a shape could match, or the first error |

Examples:
[`?worker=1`](https://shex.js.org/packages/shex-webapp/doc/shex.html?worker=1),
[`?editors=textarea`](https://shex.js.org/packages/shex-webapp/doc/shex.html?editors=textarea).

## What it opens on

| parameter | meaning |
| --- | --- |
| `manifestURL=<url>` | an examples manifest, YAML or JSON (`manifest=<text>` is the manifest itself). An entry that names a plugin loads it before the entry is used |
| `schemaURL=<url>`, `dataURL=<url>` | documents to open on; `schema=<text>` and `data=<text>` carry the text itself, which is what a permalink does |
| `shape-map=<text>` | the query map: which nodes to validate as which shapes, e.g. `<http://a.example/n>@<http://a.example/S>` or `{FOCUS :p _}@START` |
| `data-base=<iri>` | the base IRI the data is parsed against |

Example: [`?schemaURL=../examples/GO-CAM-schema.shex&dataURL=../examples/GO-CAM-instance.ttl&shape-map=…`](https://shex.js.org/packages/shex-webapp/doc/shex.html?schemaURL=..%2Fexamples%2FGO-CAM-schema.shex&dataURL=..%2Fexamples%2FGO-CAM-instance.ttl&shape-map=%3Chttp%3A%2F%2Fmodel.geneontology.org%2F5b528b1100001416%2F5b528b1100001522%3E%40%3C%23S1%3E),
[`?manifestURL=../../extension-eval/examples/manifest.yaml`](https://shex.js.org/packages/shex-webapp/doc/shex.html?manifestURL=..%2F..%2Fextension-eval%2Fexamples%2Fmanifest.yaml).

## What it loads

| parameter | meaning |
| --- | --- |
| `plugin=<url>` | load a plugin: a module that installs semantic-action extensions and may add a screen ([doc/plugins.md](plugins.md)). Repeatable; `pluginURL=` means the same and is what a permalink writes. A plugin from another site is put to you before it runs |
| `screen=<plugin id>` | open on that plugin's screen rather than the validator's |

Examples:
[`?plugin=../../../doc/plugin-skeleton/hello-plugin.js`](https://shex.js.org/packages/shex-webapp/doc/shex.html?plugin=..%2F..%2F..%2Fdoc%2Fplugin-skeleton%2Fhello-plugin.js),
[`?plugin=…ShExMapPlugin.js&manifestURL=…&screen=http://shex.io/extensions/Map/%23`](https://shex.js.org/packages/shex-webapp/doc/shex.html?plugin=..%2F..%2Fextension-map%2Fdoc%2FShExMapPlugin.js&manifestURL=..%2F..%2Fextension-map%2Fexamples%2Fmanifest.yaml&screen=http%3A%2F%2Fshex.io%2Fextensions%2FMap%2F%23).

## Where the data comes from

| parameter | meaning |
| --- | --- |
| `neighborhood=` | `rdfjs` *(default)*: the data pane's documents; `sparql`: a SPARQL endpoint; `wikibase`: a Wikibase's entity pages |
| `endpoint=<url>` | with `neighborhood=sparql`, the endpoint |
| `slurp-all=1` and the other source parameters | each source declares its own (`dbParams` in `@shexjs/neighborhood-api`); the settings tab shows them |

Example: [`?neighborhood=sparql&endpoint=https://query.wikidata.org/sparql`](https://shex.js.org/packages/shex-webapp/doc/shex.html?neighborhood=sparql&endpoint=https%3A%2F%2Fquery.wikidata.org%2Fsparql&manifestURL=..%2Fexamples%2Fmanifest.yaml).

## How results are shown

| parameter | values | meaning |
| --- | --- | --- |
| `interface=` | `human` *(default)*, `appinfo`, `minimal` | results as text, as the JSON the API returns, or the page without its title bar and screen tabs (for embedding) |
| `success=` | `proof` *(default)*, `query`, `remainder` | what a conformant result shows: the proof, the matched graph, or the remaining graph |
| `explain=` | `both` *(default)*, `repairs`, `errors` | what a failure's report leads with: what would make the node conform, why it doesn't, or both |
| `spelling=` | `document` *(default)*, `explicit` | terms as the documents write them, or as full IRIs |

Example: [`?interface=minimal`](https://shex.js.org/packages/shex-webapp/doc/shex.html?interface=minimal).

## Older pages

The page was `shex-simple.html` until 2026, and that URL still answers: it
redirects to `shex.html` with the same query string and hash.
`shex-worker.html` redirects to `shex.html?worker=1`, and
`packages/extension-map/doc/shexmap-simple.html` and `shexmap-worker.html`
to `shex.html` with the ShExMap plugin and its manifest, every parameter
they were given carried along.
