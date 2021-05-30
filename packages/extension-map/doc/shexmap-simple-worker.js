importScripts("../../shex-webapp/doc/webpacks/n3js.js");
if (true) {
importScripts("./webpacks/shexmap-webapp.js");
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

importScripts("../shexmap-webapp.js");
}
importScripts("../../shex-webapp/doc/Util.js");
// importScripts('promise-worker/register.js');

const ShEx = ShExWebApp; // @@ rename globally
const RdfJs = N3js;
const ShExApi = ShEx.Api({
  fetch, rdfjs: N3js, jsonld: null
})
const MapModule = ShEx.Map({rdfjs: RdfJs, Validator: ShEx.Validator});
const START_SHAPE_INDEX_ENTRY = "- start -"; // specificially not a JSON-LD @id form.
let validator = null;
let Mapper = null;
self.onmessage = async function (msg) {
let errorText = undefined;
let time;
// await wait(1000); // play with delays in response
try {
  switch (msg.data.request) {
  case "create":
    errorText = "creating validator";
    const inputData = "endpoint" in msg.data
      ? ShEx.Util.makeQueryDB(msg.data.endpoint, msg.data.slurp ? queryTracker() : null)
      : ShEx.Util.rdfjsDB(makeStaticDB(msg.data.data));

    // const dataURL = "data:text/json," +
    //     JSON.stringify(
    //       ShEx.Util.AStoShExJ(
    //         ShEx.Util.canonicalize(
    //           msg.data.schema)));
    const alreadLoaded = {
      schema: msg.data.schema,
      url: msg.data.schemaURL
    };
    // shex-loader loads IMPORTs and tests the schema for structural faults.
    const loaded = await ShExApi.load([alreadLoaded], [], [], [])
    let createOpts = msg.data.options || {};
    if ("regexModule" in createOpts)
      createOpts.regexModule = modules[createOpts.regexModule];
    createOpts = Object.create({ results: "api" }, createOpts); // default to API results
    validator = ShEx.Validator.construct(
      loaded.schema,
      inputData,
      createOpts
    );
    Mapper = MapModule.register(validator, ShEx);
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
        singletonMap[0].shape = ShEx.Validator.start;
      time = new Date();
      const newResults = validator.validate(singletonMap, options.track ? makeRelayTracker() : null);
      time = new Date() - time;
      newResults.forEach(function (res) {
        if (res.shape === ShEx.Validator.start)
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

  case "materialize":
    const materializeMap = msg.data.queryMap;
    const outputSchema = ShEx.Util.ShExJtoAS(msg.data.outputSchema);
    const materializer = MapModule.materializer.construct(outputSchema, Mapper, {});
    for (let currentEntry = 0; currentEntry < materializeMap.length; ) {
      const singletonMap = [materializeMap[currentEntry++]]; // ShapeMap with single entry.
      try {
        const binder = Mapper.binder(msg.data.resultBindings);
        const res = materializer.validate(binder, singletonMap[0].node, singletonMap[0].shape);
        if ("errors" in res) {
          self.postMessage(Object.assign({ response: "error", results: res }, singletonMap[0]));
        } else {
          self.postMessage({ response: "update", results: res });
        }
      } catch (e) {
        console.dir(e);
        self.postMessage({ response: "error", exception: `Exception when materializing ${singletonMap[0].node}@${singletonMap[0].shape}: ${typeof e === 'object' && e instanceof Error ? e.message : e}` });
      }
    }
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
