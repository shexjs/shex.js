/** shex - meta-package aggregating the @shexjs/* packages.
 *
 * Everything here is also available as an individual package (e.g.
 * require("@shexjs/parser")); this index just saves node users from
 * managing a dozen dependencies:
 *
 *   const ShEx = require("shex");
 *   const schema = ShEx.Parser.construct(base).parse(shexc);
 *   const validator = new ShEx.Validator.ShExValidator(schema, ShEx.RdfJsDb(graph));
 */

export = {
  Parser: require("@shexjs/parser"),          // .construct(base, prefixes, opts).parse(shexc)
  Writer: require("@shexjs/writer"),          // serialize ShExJ as ShExC
  Validator: require("@shexjs/validator"),    // {ShExValidator, ...}
  RdfJsDb: require("@shexjs/neighborhood-rdfjs").ctor, // wrap an RDF/JS store for validation
  Loader: require("@shexjs/loader"),          // ({fetch, rdfjs}) => schema/data loader
  NodeLoader: require("@shexjs/node"),        // Loader plus file: URL support
  Term: require("@shexjs/term"),              // RDF term utilities
  Util: require("@shexjs/util"),              // schema/results transformations
  Visitor: require("@shexjs/visitor"),        // schema visitor pattern
  ShapeMap: require("shape-map"),             // ShapeMap parser

  // The rest of the suite, loaded when asked for: a script that only
  // parses should not pay for a SPARQL client or the editors.  Each is an
  // installed dependency of this package, so `npm install shex` is the
  // whole toolkit, and the @shexjs/* packages are there to require by name.
  get Engines () {                            // the regular-expression engines the validator chooses between
    return {
      Simple1Err: require("@shexjs/eval-simple-1err"),      // fast: the first error
      ThreadedNErr: require("@shexjs/eval-threaded-nerr"),  // thorough: every way a shape could match
    };
  },
  get ValidatorApi () { return require("@shexjs/eval-validator-api"); },   // what an engine, a tracker or a semAct handler implements
  get NeighborhoodApi () { return require("@shexjs/neighborhood-api"); },  // what a data source declares
  get Neighborhoods () {                      // the data sources: a store, a query service, a Wikibase
    return {
      RdfJs: require("@shexjs/neighborhood-rdfjs"),
      Sparql: require("@shexjs/neighborhood-sparql"),
      Wikibase: require("@shexjs/neighborhood-wikibase"),
    };
  },
  get Extensions () {                         // semantic-action extensions, for `validate --extension` and register(validator)
    return {
      // ShExMap: bind values, materialize another schema's graph.  Its
      // package exports a factory over an RDF/JS implementation and the
      // validator; this is it made, as the CLI and the web app make it.
      Map: require("@shexjs/extension-map")({rdfjs: require("n3"), Validator: require("@shexjs/validator").ShExValidator}),
      Eval: require("@shexjs/extension-eval"),        // evaluate JavaScript in %Eval{...%}
      Test: require("@shexjs/extension-test"),        // record what %Test{...%} was handed
      Reduce: require("@shexjs/extension-reduce"),    // fold a parse into a value
      ReduceJs: require("@shexjs/extension-reduce-js"),
      Wasi: require("@shexjs/extension-wasi"),        // WebAssembly semantic actions
      WasiTest: require("@shexjs/extension-wasi-test"),
    };
  },
  get EditorServices () { return require("@shexjs/editor-services"); },   // parse, locate, lint and anchor results in editors
  get SemActOverlay () { return require("@shexjs/semact-overlay"); },     // semantic actions declared beside a schema rather than in it
  get ShapePathQuery () { return require("@shexjs/shape-path-query"); }, // ShapePath over a schema
};
