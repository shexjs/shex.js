class Canceleable {
  constructor (stopElement, clickAction, abortText, startMessage, handler) {
    this.restoreText = stopElement.text();
    this.stopElement = stopElement;
    this.clackAction = clickAction;
    this.abortText = abortText;
    this.startMessage = startMessage;
    this.handler = handler;
  }

  ready () {
    return new Promise((resolve, reject) => {
      this.reject = reject;
      this.stopElement.addClass("stoppable").text("abort (ctl-enter)");
      this.stopElement.off("click", this.clickAction);
      this.stopElement.on("click", evt => this.cancel(evt));
      ShExWorker.onmessage = (msg) => {
        return this.handler(msg, () => this.workerUICleanup(), resolve, reject)
      },
      ShExWorker.postMessage(this.startMessage);
    });
  }

  cancel (evt) {
    ShExWorker.terminate();
    ShExWorker = new Worker("shexmap-simple-worker.js");
    if (evt !== null)
      $("#results .status").text(this.abortText).show();
    this.workerUICleanup();
    this.reject(Error(`Interrupted by user click`))
  }

  workerUICleanup () {
    this.stopElement.removeClass("stoppable").text(this.restoreText);
    this.stopElement.off("click", evt => this.cancel(evt));
    this.stopElement.on("click", this.clickAction);
  }
}

const USE_INCREMENTAL_RESULTS = true;
class RemoteShExValidator {
  constructor (loaded, schemaURL, inputData, renderer) {
    this.renderer = renderer;
    this.created = new Canceleable(
      $("#validate"),
      App.disableResultsAndValidate,
      "validator creation aborted",
      Object.assign(
        {
          request: "create",
          schema: loaded.schema,
          schemaURL: schemaURL,
          slurp: $("#slurp").is(":checked"),
          options: {regexModule: $("#regexpEngine").val()},
        },
        "endpoint" in App.Caches.inputData ?
          {endpoint: App.Caches.inputData.endpoint} :
        {data: inputData.getQuads().map(t => WorkerMarshalling.rdfjsTripleToJsonTriple(t))}
      ),
      RemoteShExValidator.handleCreate
    ).ready();
  }
  static factory (loaded, schemaURL, inputData, renderer) {
    return new RemoteShExValidator(loaded, schemaURL, inputData, renderer);
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
      App.disableResultsAndValidate,
      "validation aborted",
      {
        request: "validate",
        queryMap: transportMap,
        options: {includeDoneResults: !USE_INCREMENTAL_RESULTS, track: LOG_PROGRESS},
      },
      this.parseUpdatesAndResults.bind(this, time, validationTracker, done, currentAction)
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
      reject(Error(`expected ${expect}, got ${JSON.stringify(msg.data)}`));
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

    default:
      console.log("<span class=\"error\">unknown response: " + JSON.stringify(msg.data) + "</span>");
    }
  }
}

