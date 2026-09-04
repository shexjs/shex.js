importScripts("../../shex-webapp/doc/webpacks/n3js.js");
importScripts("./webpacks/shex-webapp.js");
importScripts("./WorkerMarshalling.js");
// importScripts('promise-worker/register.js');

let validator = null;
/** the db this validator asks, and what of it has been sent back: a source
 * that reads documents to answer with has them over here, and a slurp is on
 * the other side (postSlurpedPages) */
let inputDb = null;
let slurping = false;
const postedPages = new Set();

/**
 * The worker half of a plugin (doc/plugins.md, In the worker).
 *
 * A classic worker can importScripts any URL it can fetch, which is what
 * "load a plugin by URL" means on this side.  The app names its plugins'
 * worker scripts on every request; each is imported once, and what it
 * registers here is a handler for the validator and handlers for the
 * requests it adds.  ShExMap's `materialize` is the first.
 *
 * A plugin with something to await -- a wasm toolchain to load, a module
 * to fetch -- says so with `ready`, a promise this thread awaits before
 * serving any request: the page side has `init` riding `applied` for the
 * same reason, and a validation must not outrun either.
 */
const WorkerPlugins = [];
const importedPlugins = new Set();

function registerWorkerPlugin (plugin) {
  WorkerPlugins.push(plugin);
}

/** the base a just-imported plugin resolves its own files against: a
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
  errorText = "loading plugins";
  importPlugins(msg.data.plugins);
  await Promise.all(WorkerPlugins.map(p => p.ready).filter(Boolean));
  switch (msg.data.request) {
  case "create":
    errorText = "creating validator";
    // A source that fetches its answers is built here rather than sent:
    // a db that goes to the network is not a thing that crosses a
    // postMessage, so the app says which module and what it takes
    // (fromParams, the same constructor it uses itself) and this end builds
    // it.  A source that is handed its data sends the data.
    //
    // Asked with fetch(), where the module offers that: a worker blocked on
    // a synchronous request is a worker that can't answer anything else --
    // including being told to stop -- so the validation waits at the fetch
    // instead (see validateShapeMapAsync below).
    const inputData = msg.data.neighborhood
          ? asyncFace(neighborhoodModule(msg.data.neighborhood), msg.data.params,
                      msg.data.slurp ? queryTracker() : null)
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
    inputDb = inputData;
    slurping = !!msg.data.slurp;
    postedPages.clear();
    self.postMessage({ response: "created", results: {timestamp: new Date()} });
    break;

  case "validate":
    const queryMap = msg.data.queryMap;
    const currentEntry = 0, options = msg.data.options || {};
    const results = WorkerMarshalling.createResults();
    for (let currentEntry = 0; currentEntry < queryMap.length; ) {
      const singletonMap = [queryMap[currentEntry++]]; // ShapeMap with single entry.
      errorText = "validating " + JSON.stringify(singletonMap[0], null, 2);
      // the page's Start arrives as a clone; this thread's own goes in its place
      if (ShExWebApp.ShExTerm.isStart(singletonMap[0].shape))
        singletonMap[0].shape = ShExWebApp.Validator.Start;
      time = new Date();
      // ...Async: right for either db -- given one that doesn't fetch it is
      // a single traversal and a single await
      const newResults = await validator.validateShapeMapAsync(singletonMap, options.track ? makeRelayTracker() : undefined); // undefined to trigger default parameter assignment
      time = new Date() - time;
      newResults.forEach(function (res) {
      });
      // Merge into results.
      results.merge(newResults);

      // Notify caller.
      self.postMessage({ response: "update", results: newResults });
      postSlurpedPages();

      // Skip entries that were already processed.
      while (currentEntry < queryMap.length &&
             results.has(queryMap[currentEntry]))
        ++currentEntry;
    }
    postSlurpedPages();
    // Done -- show results and restore interface.
    if (options.includeDoneResults)
      self.postMessage({ response: "done", results: results.getShapeMap() });
    else
      self.postMessage({ response: "done" });
    break;

  case "debugValidate": {
    // Live whole-validation stepping (doc/debugger-design.md §4).  The
    // recursive validator can't yield mid-flight, so it runs synchronously
    // here and a WorkerGate blocks this thread between events, on the SAB
    // the page shares; the page drives it over that buffer (Atomics), never
    // by postMessage -- a worker blocked in Atomics.wait can't read one.
    // This is the browser twin of eval-validator-api/test/worker-gate-worker.js.
    errorText = "starting the validation debugger";
    const dbgDb = ShExWebApp.RdfJsDb(makeStaticDB(
      (msg.data.data || []).map(t => WorkerMarshalling.jsonTripleToRdfjsTriple(t, N3js.DataFactory))));
    const dbgOptions = Object.assign({ results: "api", noCache: true }, msg.data.options);
    dbgOptions.regexModule = ShExWebApp[dbgOptions.regexModule]; // name -> module (undefined keeps the default)
    const gate = new ShExWebApp.WorkerGate(
      msg.data.sab,
      m => self.postMessage({ response: "paused", event: m.event }),
      ShExWebApp.schemaTripleConstraints(msg.data.schema));
    // shape-level events from the tracker (a cached answer is no place to
    // pause), constraint-level from the engine's debugHook -- the shex-debug
    // wiring, but gate.gate blocks the thread instead of reading stdin
    const dbgTracker = ShExWebApp.eventTracker(event => {
      if (event.type !== "known")
        gate.gate(event);
    });
    dbgOptions.debugHooks = {
      onConstraint: (tc, ctx) => gate.gate({
        type: "constraint", tc, node: ctx.node, triples: ctx.triples,
        depth: dbgTracker.depth + 1 }),
    };
    const dbgValidator = new ShExWebApp.Validator(msg.data.schema, dbgDb, dbgOptions);
    WorkerPlugins.forEach(ext => {
      if (typeof ext.register === "function")
        ext.register(dbgValidator, ShExWebApp);
    });
    const dbgMap = (msg.data.queryMap || []).map(m =>
      ShExWebApp.ShExTerm.isStart(m.shape) ? Object.assign({}, m, { shape: ShExWebApp.Validator.Start }) : m);
    try {
      const dbgResults = dbgValidator.validateShapeMap(dbgMap, dbgTracker);
      self.postMessage({ response: "done", conformant: dbgResults.every(r => r && r.status === "conformant") });
    } catch (e) {
      if (e && e.isDebugAbort)
        self.postMessage({ response: "aborted" });
      else
        throw e;
    }
    break;
  }

  default: {
    // a request a plugin added: ShExMap's "materialize" is one
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
// the name too: it is how the far side tells one kind of failure from
// another -- a plugin's action threw, rather than the schema was bad --
// and it is the only part of an Error that survives being a message
self.postMessage({ response: "error", name: e.name, message: e.message,
                   stack: e.stack, text: errorText });
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

/** The tracker over there, reporting to the app over here.
 *
 * The token is what pairs an answer with its question across the two
 * threads: a walk has several requests in flight, so which one finished is
 * not "the last one that started".
 */
let nextQuery = 0;
/**
 * The pages a translating source read, as they turn up.
 *
 * A slurp leaves the reader the entity pages a walk visited, to edit and
 * validate again -- and this walk happened over here, so they have to be
 * carried across.  Only the ones this worker has not sent: a walk revisits
 * pages, and a validation asks about several nodes.
 */
function postSlurpedPages () {
  if (!slurping || inputDb === null || typeof inputDb.loadedPages !== "function")
    return;
  const fresh = inputDb.loadedPages().filter(page => !postedPages.has(page.id));
  if (fresh.length === 0)
    return;
  fresh.forEach(page => postedPages.add(page.id));
  self.postMessage({ response: "slurpedPages", pages: fresh });
}

/** the neighborhood module the app named, by the id both ends know it by */
function neighborhoodModule (id) {
  const {moduleId} = ShExWebApp.NeighborhoodApi;
  // the bundle's own, and any a plugin's worker half brought
  const modules = (ShExWebApp.NeighborhoodModules || [])
        .concat(WorkerPlugins.flatMap(ext => ext.neighborhoods || []));
  const found = modules.find(m => moduleId(m) === id);
  if (found === undefined)
    throw Error(`no neighborhood module ${JSON.stringify(id)} in this worker;`
                + ` there are ${modules.map(moduleId).join(", ")}`);
  return found;
}

/** ...built, and asked with fetch() where it offers that */
function asyncFace (module, params, tracker) {
  const db = module.fromParams(params || {}, tracker);
  return module.asAsyncDb && typeof db.getNeighborhoodAsync === "function"
    ? module.asAsyncDb(db)
    : db;
}

function queryTracker () {
  return {
    start: function (isOut, term, shapeLabel) {
      const token = ++nextQuery;
      self.postMessage ({ response: "startQuery", token: token, isOut: isOut, term: WorkerMarshalling.rdfjsTermToJsonTerm(term), shapeLabel: shapeLabel });
      return token;
    },
    end: function (quads, time, token) {
      self.postMessage({ response: "finishQuery", token: token, quads: quads.map(t => WorkerMarshalling.rdfjsTripleToJsonTriple(t)), time: time });
    },
    fail: function (error, time, token) {
      self.postMessage({ response: "failedQuery", token: token, message: String((error && error.message) || error), time: time });
    }
  }
}
