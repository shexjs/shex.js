if (true) {
importScripts("../browser/shex-webapp-webpack.js");
} else {
importScripts("../doc/require.js"      );

importScripts("../node_modules/n3/lib/IRIs.js"         ); modules["./IRIs"]          = module.exports;
importScripts("../node_modules/n3/lib/N3DataFactory.js"); modules["./N3DataFactory"] = module.exports;
importScripts("../node_modules/n3/lib/N3Util.js"       ); modules["./N3Util"]        = module.exports;
importScripts("../node_modules/n3/lib/N3Lexer.js"      ); modules["n3"]["Lexer"] = modules["./N3Lexer"] = module.exports;
importScripts("../node_modules/n3/lib/N3Parser.js"     ); modules["n3"]["Parser"]    = module.exports;
importScripts("../node_modules/n3/lib/N3Store.js"      ); modules["n3"]["Store"]     = module.exports;

importScripts("../node_modules/@shexjs/core/node_modules/hierarchy-closure/hierarchy-closure.js"); modules["hierarchy-closure"] = module.exports;

importScripts("../node_modules/shape-map/lib/ShapeMapSymbols.js"    ); modules["./lib/ShapeMapSymbols"] = modules["./ShapeMapSymbols"] = module.exports;
module.exports = exports; importScripts("../node_modules/shape-map/lib/ShapeMapJison.js"    ); modules["./ShapeMapJison"] = module.exports;
importScripts("../node_modules/shape-map/lib/ShapeMapParser.js"   ); modules["../node_modules/shape-map/lib/ShapeMapParser"] = modules["./lib/ShapeMapParser"] = module.exports;
importScripts("../node_modules/shape-map/shape-map.js"   ); modules["../node_modules/shape-map/shape-map"] = modules["shape-map"] = module.exports;

importScripts("../node_modules/@shexjs/core/lib/RdfTerm.js"     ); modules["./RdfTerm"] = modules["../RdfTerm"] = modules["./lib/RdfTerm"] = RdfTerm;
importScripts("../node_modules/@shexjs/core/lib/ShExUtil.js"     ); modules["./ShExUtil"] = modules["../node_modules/@shexjs/core/lib/ShExUtil"] = modules["./lib/ShExUtil"] = modules[".././node_modules/@shexjs/core/lib/ShExUtil"] = ShExUtil;
importScripts("../node_modules/@shexjs/core/lib/regex/threaded-val-nerr.js"); modules["../node_modules/@shexjs/core/lib/regex/threaded-val-nerr"] = modules["./lib/regex/threaded-val-nerr"] = modules["../lib/regex/threaded-val-nerr"] = module.exports;
importScripts("../node_modules/@shexjs/core/lib/regex/nfax-val-1err.js"); modules["./lib/regex/nfax-val-1err"] = module.exports;
importScripts("../node_modules/@shexjs/core/lib/ShExValidator.js"); modules["/lib/ShExValidator"] = modules["./ShExValidator"] = modules["./lib/ShExValidator"] = ShExValidator = module.exports;
importScripts("../node_modules/@shexjs/core/lib/ShExWriter.js"   ); modules["./lib/ShExWriter"] = modules["../node_modules/@shexjs/core/lib/ShExWriter"] = module.exports;
importScripts("../node_modules/@shexjs/core/shex-core.js"     ); modules["@shexjs/core"] = ShExCore;

module.exports = exports; importScripts("../node_modules/@shexjs/parser/lib/ShExJison.js"    ); modules["./lib/ShExJison"] = module.exports;
importScripts("../node_modules/@shexjs/parser/shex-parser.js"   ); modules["../node_modules/@shexjs/parser/shex-parser"] = modules["./shex-parser"] = modules["@shexjs/parser"] = module.exports;

importScripts("../node_modules/@shexjs/loader/shex-loader.js"); modules["shex-loader"] = modules["./lib/shex-loader"] = modules["@shexjs/loader"] = module.exports;
importScripts("../shex-webapp.js"); 
}
importScripts("Util.js");

const ShEx = ShExWebApp; // @@ rename globally
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
    ShEx.Loader.load([alreadLoaded], [], [], []).then(loaded => {
      loadedSchema = loaded.schema;
      validator = ShEx.Validator.construct(loaded.schema, options);
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
  var ret = new ShEx.N3.Store();
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

