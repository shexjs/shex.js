if (true) {
importScripts("../browser/shex-browserify.js");
} else {
importScripts("../doc/require.js"      );
importScripts("https://rawgit.com/RubenVerborgh/N3.js/master/lib/N3Util.js"); modules["n3"]["Util"] = modules["./N3Util"] = N3Util = module.exports;
importScripts("https://rawgit.com/RubenVerborgh/N3.js/master/lib/N3Lexer.js"); modules["n3"]["Lexer"] = modules["./N3Lexer"] = N3Lexer = module.exports;
importScripts("https://rawgit.com/RubenVerborgh/N3.js/master/lib/N3Parser.js"); modules["n3"]["Parser"] = N3Parser = module.exports;
importScripts("https://rawgit.com/RubenVerborgh/N3.js/master/lib/N3Store.js"); modules["n3"]["Store"] = N3Store = module.exports;
importScripts("https://rawgit.com/RubenVerborgh/N3.js/master/lib/N3Writer.js"); modules["n3"]["Writer"] = N3Writer = module.exports;
importScripts("../lib/ShExUtil.js"     ); modules["./ShExUtil"] = modules["../lib/ShExUtil"] = modules["./lib/ShExUtil"] = modules["../../lib/ShExUtil"] = ShExUtil;
module.exports = exports;importScripts("../lib/ShExJison.js");
modules["./ShExJison"] = module.exports;importScripts("../lib/ShExParser.js"   ); modules["../lib/ShExParser"] = modules["./lib/ShExParser"] = module.exports;
importScripts("../lib/ShExWriter.js"   ); modules["./lib/ShExWriter"] = module.exports;
importScripts("../lib/regex/threaded-val-nerr.js"); modules["../lib/regex/threaded-val-nerr"] = modules["./lib/regex/threaded-val-nerr"] =module.exports;
importScripts("../lib/regex/nfax-val-1err.js"); modules["./lib/regex/nfax-val-1err"] = module.exports;
importScripts("../lib/ShExValidator.js"); modules["/lib/ShExValidator"] = modules["./lib/ShExValidator"] =ShExValidator = module.exports;
importScripts("../lib/ShExLoader.js"); modules["/lib/ShExLoader"] = modules["./lib/ShExLoader"] = module.exports;
importScripts("../shex.js");
}
importScripts("Util.js");

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
    ShEx.Loader.load([alreadLoaded], [], [], []).then(loaded => {
      validator = ShEx.Validator.construct(loaded.schema, options);
      postMessage({ response: "created" });
    });
    break;

  case "validate":
    var db = ShEx.N3.Store();
    db.addTriples(msg.data.data);
    var queryMap = msg.data.queryMap;
    var currentEntry = 0, options = msg.data.options || {};
    var results = Util.createResults();

    for (var currentEntry = 0; currentEntry < queryMap.length; ) {
      var singletonMap = [queryMap[currentEntry++]]; // ShapeMap with single entry.
      if (singletonMap[0].shapeLabel === START_SHAPE_INDEX_ENTRY)
        singletonMap[0].shapeLabel = ShEx.Validator.start;
      var newResults = validator.validate(db, singletonMap);
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
    break;

  default:
    throw "unknown request: " + JSON.stringify(msg.data);
  }

}

