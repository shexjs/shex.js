class RemoteShExValidator {
  constructor (loaded, schemaURL, inputData) {
    this.created = Canceleable(
      $("#validate"),
      disableResultsAndValidate,
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
    )
  }
  static factory (loaded, schemaURL, inputData) {
    return new RemoteShExValidator(loaded, schemaURL, inputData);
  }
  async invoke (fixedMap, validationTracker, time, done, currentAction) {
    const response = await this.created;
    const transportMap = fixedMap.map(function (ent) {
      return {
        node: ent.node,
        shape: ent.shape === ShEx.Validator.Start ?
          START_SHAPE_INDEX_ENTRY :
          ent.shape
      };
    });
    return Canceleable(
      $("#validate"),
      disableResultsAndValidate,
      "validation aborted",
      {
        request: "validate",
        queryMap: transportMap,
        options: {includeDoneResults: !USE_INCREMENTAL_RESULTS, track: LOG_PROGRESS},
      },
      parseUpdatesAndResults.bind(undefined, time, validationTracker, done, currentAction)
    );
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
}

