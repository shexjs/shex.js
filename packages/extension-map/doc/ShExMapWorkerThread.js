importScripts("../../shex-webapp/doc/webpacks/n3js.js");
importScripts("./webpacks/shexmap-webapp.js");
importScripts("../../shex-webapp/doc/WorkerMarshalling.js");

const ShExLoader = ShExWebApp.Loader({
  fetch, rdfjs: N3js, jsonld: null
})
const MapModule = ShExWebApp.Map({rdfjs: N3js, Validator: ShExWebApp.Validator});
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
          ? ShExWebApp.SparqlDb(msg.data.endpoint, msg.data.slurp ? queryTracker() : null)
          : ShExWebApp.RdfJsDb(makeStaticDB(msg.data.data.map(t => WorkerMarshalling.jsonTripleToRdfjsTriple(t, N3js.DataFactory))));

    let createOpts = msg.data.options;
    createOpts.regexModule = ShExWebApp[createOpts.regexModule || "nfax-val-1err"];
    createOpts = Object.create({ results: "api" }, createOpts); // default to API results
    validator = new ShExWebApp.Validator(
      msg.data.schema,
      inputData,
      createOpts
    );
    Mapper = MapModule.register(validator, ShExWebApp);
    // extensions.each(ext => ext.register(validator, ShExWebApp);
    self.postMessage({ response: "created", results: {timestamp: new Date()} });
    break;

  case "validate":
    const queryMap = msg.data.queryMap;
    const currentEntry = 0, options = msg.data.options || {};
    const results = WorkerMarshalling.createResults();
    for (let currentEntry = 0; currentEntry < queryMap.length; ) {
      const singletonMap = [queryMap[currentEntry++]]; // ShapeMap with single entry.
      errorText = "validating " + JSON.stringify(singletonMap[0], null, 2);
      if (singletonMap[0].shape === START_SHAPE_INDEX_ENTRY)
        singletonMap[0].shape = ShExWebApp.Validator.Start;
      time = new Date();
      const newResults = validator.validateShapeMap(singletonMap, options.track ? makeRelayTracker() : undefined); // undefined to trigger default parameter assignment
      time = new Date() - time;
      newResults.forEach(function (res) {
        if (res.shape === ShExWebApp.Validator.Start)
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
    const outputSchema = ShExWebApp.Util.ShExJtoAS(msg.data.outputSchema);
    // NFA-thread materializer (see extension-map/doc/threaded-materializer.md):
    // needs no registered validator/Mapper state -- each materialization
    // thread carries its own binding-tree cursor.  Emitted quads are
    // marshalled back to the app, which rebuilds them with its DataFactory.
    const materializer = new MapModule.ThreadedMaterializer(outputSchema, {staticVars: msg.data.staticVars || {}});
    materializeMap.forEach(pair => {
      try {
        // a structured-cloned Start marker arrives as a plain object; labels are strings
        const shape = !pair.shape || typeof pair.shape === "object" ? undefined : pair.shape;
        const quads = materializer.materialize(msg.data.resultBindings, pair.node, shape);
        self.postMessage({ response: "update", quads: quads.map(q => WorkerMarshalling.rdfjsTripleToJsonTriple(q)) });
      } catch (e) {
        console.dir(e);
        self.postMessage({ response: "error", exception: `Exception when materializing ${pair.node}@${pair.shape}: ${typeof e === 'object' && e instanceof Error ? e.message : e}` });
      }
    });
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
