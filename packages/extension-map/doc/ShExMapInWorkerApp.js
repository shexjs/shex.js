class RemoteShExMaterializer {
  constructor (schema, shapeMap, resultBindings, staticVars, resultsWidget, onCancel, workerUrl) {
    this.generatedGraph = new RdfJs.Store();
    this.created = new Canceleable(
      $("#materialize"),
      onCancel,
      "materialization aborted, re-start from validation",
      {
        request: "materialize",
        queryMap: shapeMap,
        outputSchema: schema,
        resultBindings: resultBindings,
        staticVars: staticVars,
        options: {track: LOG_PROGRESS},
      },
      this.parseUpdatesAndResults.bind(this),
      workerUrl
    ).ready();
  }
  async invoke (fixedMap, validationTracker, time, done, currentAction) {
    const materialized = await this.created;
    return this.generatedGraph;
  }

  parseUpdatesAndResults (msg, workerUICleanup, resolve, reject) {
    switch (msg.data.response) {
    case "update":
      // the ThreadedMaterializer in the worker ships quads, not a val structure
      this.generatedGraph.addQuads(msg.data.quads.map(
        q => WorkerMarshalling.jsonTripleToRdfjsTriple(q, RdfJs.DataFactory)));
      break;

    case "error":
      if ("exception" in msg.data) {
        this.resultsWidget.replace("error materializing:\n" + msg.data.exception).
          removeClass("passes fails").addClass("error");
      } else {
        this.renderEntry({
          node: msg.data.node,
          shape: msg.data.shape,
          status: "errors" in msg.data.results ? "nonconformant" : "conformant",
          appinfo: msg.data.results,
          elapsed: -1
        });
      }
      break;

    case "done":
      workerUICleanup();
      resolve({ materializionResults: this.generatedGraph });
    }
  }
}

class ShExMapInWorkerApp extends ShExMapBaseApp {
  getValidator (loaded, base, inputData) { // same as ShExInWorkerApp
    return new RemoteShExValidator(loaded, base, inputData, this.makeRenderer(), this.disableResultsAndValidate.bind(this), "endpoint" in this.Caches.inputData ? this.Caches.inputData.endpoint : null, "ShExMapWorkerThread.js")
  }

  getMaterializer (schema, shapeMap, resultBindings, staticVars) {
    return new RemoteShExMaterializer(schema, shapeMap, resultBindings, staticVars, this.resultsWidget, this.materialize.bind(this), "ShExMapWorkerThread.js");
  }

  makeConsoleTracker () {
    function padding (depth) { return (new Array(depth + 1)).join("  "); } // AKA "  ".repeat(depth)
    function sm (node, shape) {
      if (typeof shape === "object" && "term" in shape && shape.term === ShExWebApp.Validator.Start.term) {
        shape = ShExWebApp.Validator.Start;
      }
      return `${this.Caches.inputData.meta.termToLex(node)}@${this.Caches.inputSchema.meta.termToLex(shape)}`;
    }
    const logger = {
      recurse: x => { console.log(`${padding(logger.depth)}↻ ${sm(x.node, x.shape)}`); return x; },
      known: x => { console.log(`${padding(logger.depth)}↵ ${sm(x.node, x.shape)}`); return x; },
      enter: (point, label) => { console.log(`${padding(logger.depth)}→ ${sm(point, label)}`); ++logger.depth; },
      exit: (point, label, ret) => { --logger.depth; console.log(`${padding(logger.depth)}← ${sm(point, label)}`); },
      depth: 0
    };
    return logger;
  }
}

