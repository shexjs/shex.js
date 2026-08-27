class Canceleable {
  constructor (stopElement, clickAction, abortText, startMessage, handler, workerUrl) {
    this.restoreText = stopElement.text();
    this.stopElement = stopElement;
    this.clickAction = clickAction;
    this.abortText = abortText;
    this.startMessage = startMessage;
    this.handler = handler;
    this.workerUrl = workerUrl;
  }

  ready () {
    return new Promise((resolve, reject) => {
      this.reject = reject;
      this.stopElement.addClass("stoppable").text("abort (ctl-enter)");
      this.stopElement.off(); // ("click", this.clickAction) not disabled as advertised
      this.stopElement.on("click", evt => this.cancel(evt));
      ShExWorker.onmessage = (msg) => {
        return this.handler(msg, () => this.workerUICleanup(), resolve, reject)
      },
      // what the worker has to have loaded to answer this: said on every
      // request, since a materialization may reach a worker that has been
      // restarted since the validation that fed it
      ShExWorker.postMessage(
        Object.assign({plugins: pluginWorkerUrls()}, this.startMessage));
    });
  }

  cancel (evt) {
    ShExWorker.terminate();
    ShExWorker = new Worker(this.workerUrl);
    if (evt !== null)
      $("#results .status").text(this.abortText).show();
    this.workerUICleanup();
    this.reject(new FlowControlError("Interrupted by user click"))
  }

  workerUICleanup () {
    this.stopElement.removeClass("stoppable").text(this.restoreText);
    this.stopElement.off("click"); // , evt => this.cancel(evt));
    this.stopElement.on("click", this.clickAction);
  }
}

const USE_INCREMENTAL_RESULTS = true;
class RemoteShExValidator {
  constructor (loaded, schemaURL, inputData, renderer, onCancel, source, workerUrl) {
    this.renderer = renderer;
    this.onCancel = onCancel;
    this.workerUrl = workerUrl;
    this.created = new Canceleable(
      $("#validate"),
      this.onCancel,
      "validator creation aborted",
      Object.assign(
        {
          request: "create",
          schema: loaded.schema,
          schemaURL: schemaURL,
          slurp: this.renderer.caches.inputData.neighborhoods.slurping(),
          // repairs: as for the in-page validator, what would make a failing
          // node conform (doc/error-normalization.md §4)
          options: {regexModule: $("#regexpEngine").val(), repairs: true},
        },
        // a source that fetches is named and rebuilt over there; one that
        // is handed its data hands it over
        source
          ? source
          : { data: inputData.getQuads().map(
              t => WorkerMarshalling.rdfjsTripleToJsonTriple(t)
            ) }
      ),
      RemoteShExValidator.handleCreate,
      workerUrl
    ).ready();
  }
  async invoke (fixedMap, validationTracker, time, done, currentAction) {
    const response = await this.created;
    const transportMap = fixedMap.map(function (ent) {
      return {
        node: ent.node,
        shape: ent.shape === ShExWebApp.Validator.Start ?
          START_SHAPE_INDEX_ENTRY :
          ent.shape
      };
    });
    return new Canceleable(
      $("#validate"),
      this.onCancel,
      "validation aborted",
      {
        request: "validate",
        queryMap: transportMap,
        options: {includeDoneResults: !USE_INCREMENTAL_RESULTS, track: LOG_PROGRESS},
      },
      this.parseUpdatesAndResults.bind(this, time, validationTracker, done, currentAction),
      this.workerUrl
    ).ready();
  }

  static handleCreate (msg, workerUICleanup, resolve, reject) {
    switch (msg.data.response) {
    case "created":
      workerUICleanup();
      resolve(msg.data.results);
      break;
    case "error":
      const throwMe = Error(msg.data.message);
      throwMe.stack = msg.data.stack;
      throwMe.text = msg.data.errorText;
      reject(throwMe);
      break;
    default:
      reject(Error(`expected "created" or "error", got ${JSON.stringify(msg.data)}`));
    }
  }

  parseUpdatesAndResults (time, validationTracker, done, currentAction, msg, workerUICleanup, resolve, reject) {
    switch (msg.data.response) {
    case "update":
      if (USE_INCREMENTAL_RESULTS) {
        // Merge into results.
        [].push.apply(results, msg.data.results)
        msg.data.results.forEach(function (res) {
          if (res.shape === START_SHAPE_INDEX_ENTRY)
            res.shape = ShExWebApp.Validator.Start;
        });
        msg.data.results.forEach(entry => this.renderer.entry(entry));
        // resultsMap.merge(msg.data.results);
      } else {
        throw Error('fix this code path; probably results=msg.data.(all?)results')
      }
      break;

    case "recurse":
      validationTracker.recurse(msg.data.x);
      break;

    case "known":
      validationTracker.known(msg.data.x);
      break;

    case "enter":
      validationTracker.enter(msg.data.point, msg.data.label);
      break;

    case "exit":
      validationTracker.exit(msg.data.point, msg.data.label, msg.data.ret);
      break;

    case "done":
      ShExWorker.onmessage = false;
      $("#results .status").text("rendering results...").show();
      if (!USE_INCREMENTAL_RESULTS) {
        if ("solutions" in msg.data.results)
          msg.data.results.solutions.forEach(this.renderEntry);
        else
          this.renderEntry(msg.data.results);
      }
      time = new Date() - time;
      $("#shapeMap-tabs").attr("title", "last validation: " + time + " ms")
      this.renderer.finish();
      if (done) { done() }
      workerUICleanup();
      resolve({ validationResults: results});
      break;

    case "error":
      ShExWorker.onmessage = false;
      const e = Error(msg.data.message);
      e.stack = msg.data.stack;
      workerUICleanup();
      $("#results .status").text("validation errors:").show();
      this.renderer.failure(e, currentAction);
      console.error(e); // dump details to console.
      if (done) { done(e) }
      break;

      // A source that reads documents to answer with has them over there,
      // and the panes a slurp leaves are over here: these are the pages
      // that walk has read since the last lot.
    case "slurpedPages": {
      const neighborhoods = this.renderer.caches.inputData.neighborhoods;
      (msg.data.pages || []).forEach(
        ({id, text}) => neighborhoods.addPageDocument(id, text));
      if ((msg.data.pages || []).length)
        neighborhoods.render();
      break;
    }

      // Query tracking: the tracker takes what a db reports, which is
      // RDF/JS (DbQueryTracker) -- so the marshalling a postMessage needed
      // is undone here, at the boundary that needed it, rather than in a
      // tracker that a local db also calls.
    case "startQuery":
      if (this.renderer.caches.inputData.queryTrackerController.queryTracker)
        // the worker's token, not this tracker's: it is what the answer
        // will arrive carrying
        this.renderer.caches.inputData.queryTrackerController.queryTracker.start(
          msg.data.isOut,
          WorkerMarshalling.jsonTermToRdfjsTerm(msg.data.term, RdfJs.DataFactory),
          msg.data.shapeLabel,
          msg.data.token);
      break;

    case "finishQuery":
      if (this.renderer.caches.inputData.queryTrackerController.queryTracker)
        this.renderer.caches.inputData.queryTrackerController.queryTracker.end(
          msg.data.quads.map(t => WorkerMarshalling.jsonTripleToRdfjsTriple(t, RdfJs.DataFactory)),
          msg.data.time, msg.data.token);
      break;

    case "failedQuery":
      if (this.renderer.caches.inputData.queryTrackerController.queryTracker
          && this.renderer.caches.inputData.queryTrackerController.queryTracker.fail)
        this.renderer.caches.inputData.queryTrackerController.queryTracker.fail(
          Error(msg.data.message), msg.data.time, msg.data.token);
      break;

    default:
      reject(Error(`expected a validation worker response, got ${JSON.stringify(msg.data)}`));
    }
  }
}

