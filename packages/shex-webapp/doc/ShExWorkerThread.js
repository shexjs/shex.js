importScripts("../../shex-webapp/doc/webpacks/n3js.js");
importScripts("./webpacks/shex-webapp.js");
importScripts("./WorkerMarshalling.js");
// importScripts('promise-worker/register.js');

const START_SHAPE_INDEX_ENTRY = "- start -"; // specificially not a JSON-LD @id form.
let validator = null;

/**
 * The worker half of an extension (doc/extension-ui-plan.md §3).
 *
 * A classic worker can importScripts any URL that permits it, which is what
 * "load an extension by URL" means on this side.  The app names its
 * extensions' worker scripts on every request; each is imported once, and
 * what it registers here is a handler for the validator and handlers for
 * the requests it adds.  ShExMap's `materialize` is the first.
 */
const WorkerPlugins = [];
const importedPlugins = new Set();

function registerWorkerPlugin (extension) {
  WorkerPlugins.push(extension);
}

/** the base a just-imported extension resolves its own files against: a
 * worker resolves importScripts against *its* URL, not the imported one */
let pluginBase = null;

function importPlugins (urls) {
  (urls || []).forEach(url => {
    if (importedPlugins.has(url))
      return;
    importedPlugins.add(url);
    pluginBase = new URL(".", url).href;
    importScripts(url);
    pluginBase = null;
  });
}

self.onmessage = async function (msg) {
let errorText = undefined;
let time;
// await wait(1000); // play with delays in response
try {
  errorText = "loading extensions";
  importPlugins(msg.data.extensions);
  switch (msg.data.request) {
  case "create":
    errorText = "creating validator";
    // An endpoint is a network away, and a worker blocked on a synchronous
    // request is a worker that can't answer anything else -- including being
    // told to stop.  Ask with fetch() and let the validation stop at the
    // fetch instead (see validateShapeMapAsync below).
    const inputData = "endpoint" in msg.data
          ? ShExWebApp.SparqlDbAsync(
            ShExWebApp.SparqlDb(msg.data.endpoint, msg.data.slurp ? queryTracker() : null))
          : ShExWebApp.RdfJsDb(makeStaticDB(msg.data.data.map(t => WorkerMarshalling.jsonTripleToRdfjsTriple(t, N3js.DataFactory))));

    let createOpts = msg.data.options;
    // an unknown (or absent) name leaves it to the validator's own default
    createOpts.regexModule = ShExWebApp[createOpts.regexModule];
    // Object.assign, not Object.create: the second argument of Object.create
    // is a map of property *descriptors*, so every option arrived undefined
    // -- the chosen regex engine among them -- and a plain `true` threw.
    createOpts = Object.assign({ results: "api" }, createOpts); // default to API results
    validator = new ShExWebApp.Validator(
      msg.data.schema,
      inputData,
      createOpts
    );
    WorkerPlugins.forEach(ext => {
      if (typeof ext.register === "function")
        ext.register(validator, ShExWebApp);
    });
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
      // ...Async: right for either db -- given one that doesn't fetch it is
      // a single traversal and a single await
      const newResults = await validator.validateShapeMapAsync(singletonMap, options.track ? makeRelayTracker() : undefined); // undefined to trigger default parameter assignment
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

  default: {
    // a request an extension added: ShExMap's "materialize" is one
    const handler = WorkerPlugins
          .map(ext => (ext.requests || {})[msg.data.request])
          .find(fn => typeof fn === "function");
    if (!handler)
      throw "unknown request: " + JSON.stringify(msg.data);
    errorText = msg.data.request;
    await handler(msg, ShExWebApp);
    break;
  }
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
      self.postMessage ({ response: "startQuery", isOut: isOut, term: WorkerMarshalling.rdfjsTermToJsonTerm(term), shapeLabel: shapeLabel });
    },
    end: function (quads, time) {
      self.postMessage({ response: "finishQuery", quads: quads.map(t => WorkerMarshalling.rdfjsTripleToJsonTriple(t)), time: time });
    }
  }
}
