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
importScripts("../../shex-loader/shex-loader.js"               ); modules["@shexjs/loader"               ] = module.exports;
importScripts("../../eval-threaded-nerr/eval-threaded-nerr.js" ); modules["@shexjs/eval-threaded-nerr"] = module.exports;
importScripts("../../eval-simple-1err/eval-simple-1err.js"     ); modules["@shexjs/eval-simple-1err"  ] = module.exports;
importScripts("../../shex-validator/shex-validator.js"         ); modules["@shexjs/validator"         ] = module.exports;
importScripts("../../shex-writer/shex-writer.js"               ); modules["@shexjs/writer"            ] = module.exports;
module.exports = exports;
importScripts("../../shex-parser/lib/ShExJison.js"             ); modules["./lib/ShExJison"           ] = module.exports;
importScripts("../../shex-parser/shex-parser.js"               ); modules["@shexjs/parser"            ] = module.exports;

importScripts("../shex-webapp.js");
}
importScripts("./Util.js");
// importScripts('promise-worker/register.js');

const ShEx = ShExWebApp; // @@ rename globally
const START_SHAPE_INDEX_ENTRY = "- start -"; // specificially not a JSON-LD @id form.
let validator = null;
self.onmessage = async function (msg) {
let errorText = undefined;
let time;
// await wait(1000); // play with delays in response
try {
  switch (msg.data.request) {
  case "create":
    errorText = "creating validator";
    const inputData = "endpoint" in msg.data
          ? ShEx.SparqlDb(msg.data.endpoint, msg.data.slurp ? queryTracker() : null)
          : ShEx.RdfJsDb(makeStaticDB(msg.data.data.map(t => Util.jsonTripleToRdfjsTriple(t, N3js.DataFactory))));

    let createOpts = msg.data.options;
    createOpts.regexModule = ShExWebApp[createOpts.regexModule || "nfax-val-1err"];
    createOpts = Object.create({ results: "api" }, createOpts); // default to API results
    validator = new ShEx.Validator(
      msg.data.schema,
      inputData,
      createOpts
    );
    // extensions.each(ext => ext.register(validator, ShEx);
    self.postMessage({ response: "created", results: {} });
    break;

  case "validate":
    const queryMap = msg.data.queryMap;
    const currentEntry = 0, options = msg.data.options || {};
    const results = Util.createResults();
    for (let currentEntry = 0; currentEntry < queryMap.length; ) {
      const singletonMap = [queryMap[currentEntry++]]; // ShapeMap with single entry.
      errorText = "validating " + JSON.stringify(singletonMap[0], null, 2);
      if (singletonMap[0].shape === START_SHAPE_INDEX_ENTRY)
        singletonMap[0].shape = ShEx.Validator.Start;
      time = new Date();
      const newResults = validator.validateShapeMap(singletonMap, options.track ? makeRelayTracker() : undefined); // undefined to trigger default parameter assignment
      time = new Date() - time;
      newResults.forEach(function (res) {
        if (res.shape === ShEx.Validator.Start)
          res.shape = START_SHAPE_INDEX_ENTRY;
      });
      // Merge into results.
      results.merge(newResults);

      // Notify caller.
      self.postMessage({ response: "update", results: newResults });

      // Skip entries that were already processed.
      while (currentEntry < queryMap.length &&
             results.has(queryMap[currentEntry]))
        ++currentEntry;
    }
    // Done -- show results and restore interface.
    if (options.includeDoneResults)
      self.postMessage({ response: "done", results: results.getShapeMap() });
    else
      self.postMessage({ response: "done" });
    break;

  default:
    throw "unknown request: " + JSON.stringify(msg.data);
  }
} catch (e) {
self.postMessage({ response: "error", message: e.message, stack: e.stack, text: errorText });
}
}

async function wait (ms) {
  await new Promise((resolve, reject) => {
    setTimeout(() => resolve(ms), ms)
  })
}

function makeStaticDB (quads) {
  const ret = new N3js.Store();
  ret.addQuads(quads);
  return ret;
}

  function makeRelayTracker () {
    const logger = {
      recurse: x => { self.postMessage({ response: "recurse", x: x }); return x; },
      known: x => { self.postMessage({ response: "known", x: x }); return x; },
      enter: (point, label) => { self.postMessage({ response: "enter", point: point, label: label }); },
      exit: (point, label, ret) => { self.postMessage({ response: "exit", point: point, label: label, ret: null }); }, /* don't ship big ret structures */
    };
    return logger;
  }

function queryTracker () {
  return {
    start: function (isOut, term, shapeLabel) {
      self.postMessage ({ response: "startQuery", isOut: isOut, term: term, shape: shapeLabel });
    },
    end: function (quads, time) {
      self.postMessage({ response: "finishQuery", quads: quads, time: time });
    }
  }
}
