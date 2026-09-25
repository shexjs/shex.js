/**
 * The SHACL-SPARQL plugin: the SHACL-SPARQL semantic-action extension
 * (http://shex.io/extensions/SHACL-SPARQL/) on the app's validations -- an
 * action's code is a SHACL-SPARQL query, SELECT (each row a violation) or
 * ASK (true passes), with $this and $value pre-bound, run over the data
 * source's own view: the data panes' dataset through Comunica, in the page,
 * or the endpoint a SPARQL data source names.
 *
 * One file, both faces (doc/plugins.md): on the page it registers a
 * descriptor whose `scripts` bring the bundle (the extension, Comunica and
 * sparqljs, over the core bundle's global); named as its own `worker`, the
 * same file registers the same extension where a worker app's matcher is.
 */
(function () {
  const SPARQL_ID = "http://shex.io/extensions/SHACL-SPARQL/";
  const BUNDLE = "webpacks/shexshaclsparql-webapp.min.js";  // Comunica: ~3 MB minified, ~8 MB not

  if (typeof ShExPlugins !== "undefined")
    ShExPlugins.register({
      id: SPARQL_ID,
      label: "SHACL-SPARQL",
      scripts: ["./" + BUNDLE],
      worker: "./ShExShaclSparqlPlugin.js",   // this file again, where a worker app's matcher is
      register: function (validator, api) {
        return api.ShaclSparql.register(validator, api);
      },
    });

  if (typeof registerWorkerPlugin === "function") {
    importScripts(new URL(BUNDLE, pluginBase).href);
    registerWorkerPlugin({
      register: function (validator, api) {
        if (api.ShaclSparql)
          api.ShaclSparql.register(validator, api);
      },
    });
  }
})();
