ShExWebApp = (function () {
  /* Registry of the modules bundled here, keyed by require id. Add-on bundles
   * (e.g. extension-map's shexmap-webapp.js) map these ids to
   * `ShExWebApp.Modules[id]` via webpack `externals` so they can share this
   * bundle instead of packing a second copy of every module.
   */
  const modules = {
    "@shexjs/term":                require('@shexjs/term'),
    "@shexjs/util":                require('@shexjs/util'),
    "@shexjs/visitor":             require('@shexjs/visitor'),
    "@shexjs/neighborhood-api":    require('@shexjs/neighborhood-api'),
    "@shexjs/neighborhood-rdfjs":  require('@shexjs/neighborhood-rdfjs'),
    "@shexjs/neighborhood-sparql": require('@shexjs/neighborhood-sparql'),
    "@shexjs/neighborhood-wikibase": require('@shexjs/neighborhood-wikibase'),
    "@shexjs/validator":           require('@shexjs/validator'),
    "@shexjs/writer":              require('@shexjs/writer'),
    "@shexjs/loader":              require("@shexjs/loader"),
    "@shexjs/parser":              require("@shexjs/parser"),
    "@shexjs/eval-simple-1err":    require("@shexjs/eval-simple-1err"),
    "@shexjs/eval-threaded-nerr":  require("@shexjs/eval-threaded-nerr"),
    "@shexjs/eval-validator-api":  require("@shexjs/eval-validator-api"),
    "@shexjs/editor-services":     require("@shexjs/editor-services"),
    "@shexjs/editor-services/lib/editor-panes": require("@shexjs/editor-services/lib/editor-panes"),
    "shape-map":                   require("shape-map"),
    "js-yaml":                     require("js-yaml"),
    "dctap":                       require("dctap"),
  }
  return Object.assign({}, {
    Modules:              modules,
    ShExTerm:             modules["@shexjs/term"],
    Util:                 modules["@shexjs/util"],
    RdfJsDb:              modules["@shexjs/neighborhood-rdfjs"].ctor,
    SparqlDb:             modules["@shexjs/neighborhood-sparql"].ctor,
    /* the asynchronous face of a SPARQL db, for a worker or a tab that
       shouldn't be blocked while the endpoint thinks */
    SparqlDbAsync:        modules["@shexjs/neighborhood-sparql"].asAsyncDb,
    NeighborhoodApi:      modules["@shexjs/neighborhood-api"],
    /* The data sources this app offers, in picklist order.  The first is
     * the default -- an RDF document, which is what a data pane has always
     * held.  What each one needs configured, and how its documents are
     * edited, comes from the module (dbParams, PaneSpec). */
    NeighborhoodModules: [
      modules["@shexjs/neighborhood-rdfjs"],
      modules["@shexjs/neighborhood-sparql"],
      modules["@shexjs/neighborhood-wikibase"],
    ],
    Validator:            modules["@shexjs/validator"].ShExValidator,
    Writer:               modules["@shexjs/writer"],
    Loader:               modules["@shexjs/loader"],
    Parser:               modules["@shexjs/parser"],
    "eval-simple-1err":   modules["@shexjs/eval-simple-1err"].RegexpModule,
    "eval-threaded-nerr": modules["@shexjs/eval-threaded-nerr"].RegexpModule,
    MatchDebugger:        modules["@shexjs/eval-simple-1err"].MatchDebugger,
    capturingRegexModule: modules["@shexjs/eval-validator-api"].capturingRegexModule,
    ShapeMap:             modules["shape-map"],
    ShapeMapParser:       modules["shape-map"].Parser,
    JsYaml:               modules["js-yaml"],
    DcTap:                modules["dctap"].DcTap,
    EditorServices:       modules["@shexjs/editor-services"],
    EditorPanes:          modules["@shexjs/editor-services/lib/editor-panes"],
  })
})()

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExWebApp;
