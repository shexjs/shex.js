importScripts("../../shex-webapp/doc/webpacks/n3js.js");
if (true) {
importScripts("./webpacks/shex-webapp.js");
} else {
importScripts("../doc/require.js"                              );
importScripts("../node_modules/hierarchy-closure/hierarchy-closure.js"
                                                               ); modules["hierarchy-closure"         ] = module.exports;
importScripts("../../shape-map/lib/ShapeMapSymbols.js"         ); modules["./lib/ShapeMapSymbols"     ] = modules["./ShapeMapSymbols"] = module.exports;
module.exports = exports;
importScripts("../../shape-map/lib/ShapeMapJison.js"           ); modules["./ShapeMapJison"           ] = module.exports;
importScripts("../../shape-map/lib/ShapeMapParser.js"          ); modules["./lib/ShapeMapParser"      ] = module.exports;
importScripts("../../shape-map/shape-map.js"                   ); modules["shape-map"                 ] = module.exports;
importScripts("../../shex-term/shex-term.js"                   ); modules["@shexjs/term"              ] = module.exports;
importScripts("../../shex-visitor/shex-visitor.js"             ); modules["@shexjs/visitor"           ] = module.exports;
importScripts("../../shex-util/shex-util.js"                   ); modules["@shexjs/util"              ] = module.exports;
importScripts("../../shex-api/shex-api.js"                     ); modules["@shexjs/api"               ] = module.exports;
importScripts("../../eval-threaded-nerr/eval-threaded-nerr.js" ); modules["@shexjs/eval-threaded-nerr"] = module.exports;
importScripts("../../eval-simple-1err/eval-simple-1err.js"     ); modules["@shexjs/eval-simple-1err"  ] = module.exports;
importScripts("../../shex-validator/shex-validator.js"         ); modules["@shexjs/validator"         ] = module.exports;
importScripts("../../shex-writer/shex-writer.js"               ); modules["@shexjs/writer"            ] = module.exports;
module.exports = exports;
importScripts("../../shex-parser/lib/ShExJison.js"             ); modules["./lib/ShExJison"           ] = module.exports;
importScripts("../../shex-parser/shex-parser.js"               ); modules["@shexjs/parser"            ] = module.exports;

importScripts("../shex-webapp.js");
}
importScripts("Util.js");

const ShEx = ShExWebApp; // @@ rename globally
const ShExApi = ShEx.Api({
  fetch, rdfjs: N3js, jsonld: null
})
const START_SHAPE_INDEX_ENTRY = "- start -"; // specificially not a JSON-LD @id form.
var validator = null;
var loadedSchema = null;
onmessage = function (msg) {
  switch (msg.data.request) {
  case "create":
    var options = msg.data.options || {};
    if ("regexModule" in options)
      options.regexModule = modules[options.regexModule];
    options = Object.create({ results: "api" }, options); // default to API results
    // var dataURL = "data:text/json," +
    //     JSON.stringify(
    //       ShEx.Util.AStoShExJ(
    //         ShEx.Util.canonicalize(
    //           msg.data.schema)));
    var alreadLoaded = {
      schema: msg.data.schema,
      url: msg.data.schemaURL
    };
    // shex-loader loads IMPORTs and tests the schema for structural faults.
    ShExApi.load([alreadLoaded], [], [], []).then(loaded => {
      loadedSchema = loaded.schema;
      validator = ShEx.Validator.construct(loaded.schema, options);
      // extensions.each(ext => ext.register(validator, ShEx);
      postMessage({ response: "created" });
    }).catch(e => {
      postMessage({ response: "error", message: e.message, stack: e.stack });
    });
    break;

  case "validate":
    var errorText = undefined;
    try {
    var db = "endpoint" in msg.data
      ? ShEx.Util.makeQueryDB(msg.data.endpoint, msg.data.slurp ? queryTracker() : null)
      : ShEx.Util.makeN3DB(makeStaticDB(msg.data.data));
      // Some DBs need to be able to inspect the schema to calculate the neighborhood.
      if ("setSchema" in db)
        db.setSchema(loadedSchema);

    var queryMap = msg.data.queryMap;
    var currentEntry = 0, options = msg.data.options || {};
    var results = Util.createResults();

    for (var currentEntry = 0; currentEntry < queryMap.length; ) {
      var singletonMap = [queryMap[currentEntry++]]; // ShapeMap with single entry.
      errorText = "validating " + JSON.stringify(singletonMap[0], null, 2);
      if (singletonMap[0].shape === START_SHAPE_INDEX_ENTRY)
        singletonMap[0].shape = ShEx.Validator.start;
      var newResults = validator.validate(db, singletonMap, options.track ? makeRelayTracker() : null);
      console.warn(newResults)
      newResults.forEach(function (res) {
        if (res.shape === ShEx.Validator.start)
          res.shape = START_SHAPE_INDEX_ENTRY;
      });
      // Merge into results.
      results.merge(newResults);

      // Notify caller.
      postMessage({ response: "update", results: newResults });

      // Skip entries that were already processed.
      while (currentEntry < queryMap.length &&
             results.has(queryMap[currentEntry]))
        ++currentEntry;
    }
    // Done -- show results and restore interface.
    if (options.includeDoneResults)
      postMessage({ response: "done", results: results.getShapeMap() });
    else
      postMessage({ response: "done" });
    } catch (e) {
    postMessage({ response: "error", message: e.message, stack: e.stack, text: errorText });
    }
    break;

  default:
    throw "unknown request: " + JSON.stringify(msg.data);
  }

}

function makeStaticDB (quads) {
  var ret = new N3js.Store();
  ret.addQuads(quads);
  return ret;
}

  function makeRelayTracker () {
    var logger = {
      recurse: x => { postMessage({ response: "recurse", x: x }); return x; },
      known: x => { postMessage({ response: "known", x: x }); return x; },
      enter: (point, label) => { postMessage({ response: "enter", point: point, label: label }); },
      exit: (point, label, ret) => { postMessage({ response: "exit", point: point, label: label, ret: null }); }, /* don't ship big ret structures */
    };
    return logger;
  }

function queryTracker () {
  return {
    start: function (isOut, term, shapeLabel) {
      postMessage ({ response: "startQuery", isOut: isOut, term: term, shape: shapeLabel });
    },
    end: function (quads, time) {
      postMessage({ response: "finishQuery", quads: quads, time: time });
    }
  }
}

