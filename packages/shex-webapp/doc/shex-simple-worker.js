if (false) {
importScripts("../browser/shex-browserify.js");
} else {
importScripts("../doc/require.js"      );

importScripts("../node_modules/n3/lib/IRIs.js"         ); modules["./IRIs"]          = module.exports;
importScripts("../node_modules/n3/lib/N3DataFactory.js"); modules["./N3DataFactory"] = module.exports;
importScripts("../node_modules/n3/lib/N3Util.js"       ); modules["./N3Util"]        = module.exports;
importScripts("../node_modules/n3/lib/N3Lexer.js"      ); modules["n3"]["Lexer"] = modules["./N3Lexer"] = module.exports;
importScripts("../node_modules/n3/lib/N3Parser.js"     ); modules["n3"]["Parser"]    = module.exports;
importScripts("../node_modules/n3/lib/N3Store.js"      ); modules["n3"]["Store"]     = module.exports;

importScripts("../node_modules/@shexjs/util/node_modules/hierarchy-closure/hierarchy-closure.js"); modules["hierarchy-closure"] = module.exports;

importScripts("../node_modules/shape-map/lib/ShapeMapSymbols.js"    ); modules["./lib/ShapeMapSymbols"] = modules["./ShapeMapSymbols"] = module.exports;
module.exports = exports; importScripts("../node_modules/shape-map/lib/ShapeMapJison.js"    ); modules["./ShapeMapJison"] = module.exports;
importScripts("../node_modules/shape-map/lib/ShapeMapParser.js"   ); modules["../node_modules/shape-map/lib/ShapeMapParser"] = modules["./lib/ShapeMapParser"] = module.exports;
importScripts("../node_modules/shape-map/shape-map.js"   ); modules["../node_modules/shape-map/shape-map"] = modules["shape-map"] = module.exports;

importScripts("../node_modules/@shexjs/shex-term/shex-term.js"     ); modules["./ShExTerm"] = modules["../ShExTerm"] = modules["./lib/ShExTerm"] = ShExTerm;
importScripts("../node_modules/@!shexjs/util/lib/ShExUtil.js"     ); modules["./ShExUtil"] = modules["../node_modules/@shexjs/util/lib/ShExUtil"] = modules["./lib/ShExUtil"] = modules[".././node_modules/@shexjs/util/lib/ShExUtil"] = ShExUtil;
importScripts("../node_modules/@shexjs/threaded-val-nerr/threaded-val-nerr.js"); modules["@shexjs/threaded-val-nerr"] = module.exports;
importScripts("../node_modules/@shexjs/eval-simple-1err/eval-simple-1err.js"); modules["@shexjs/eval-simple-1err"] = module.exports;
importScripts("../node_modules/@!shexjs/util/lib/ShExValidator.js"); modules["/lib/ShExValidator"] = modules["./ShExValidator"] = modules["./lib/ShExValidator"] = ShExValidator = module.exports;
importScripts("../node_modules/@!shexjs/util/lib/ShExWriter.js"   ); modules["./lib/ShExWriter"] = modules["../node_modules/@shexjs/util/lib/ShExWriter"] = module.exports;
importScripts("../node_modules/@!shexjs/util/shex-util.js"     ); modules["@shexjs/util"] = ShExCore;

module.exports = exports; importScripts("../node_modules/@shexjs/parser/lib/ShExJison.js"    ); modules["./lib/ShExJison"] = module.exports;
importScripts("../node_modules/@shexjs/parser/shex-parser.js"   ); modules["../node_modules/@shexjs/parser/shex-parser"] = modules["./shex-parser"] = modules["@shexjs/parser"] = module.exports;

importScripts("../node_modules/@shexjs/node/shex-node.js"); modules["shex-node"] = modules["./lib/shex-node"] = modules["@shexjs/node"] = module.exports;
importScripts("../shex-webapp.js"); 
}
importScripts("Util.js");

const ShEx = ShExWebApp; // @@ rename globally
const START_SHAPE_INDEX_ENTRY = "- start -"; // specificially not a JSON-LD @id form.
var validator = null;
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
    ShEx.Node.load([alreadLoaded], [], [], []).then(loaded => {
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

