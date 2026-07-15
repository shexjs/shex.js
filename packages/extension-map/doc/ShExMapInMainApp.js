class DirectShExMaterializer {
  constructor (schema, shapeMap, resultBindings, staticVars, mapModule) {
    this.schema = schema;
    this.shapeMap = shapeMap;
    this.resultBindings = resultBindings;
    this.staticVars = staticVars;
    this.mapModule = mapModule;
  }
  async invoke (fixedMap, validationTracker, time, _done, _currentAction) {
    const generatedGraph = new RdfJs.Store();
    // NFA-thread materializer: each thread carries its own binding-tree
    // cursor, so a failed subtree can't corrupt the surviving alternatives.
    // See ../doc/threaded-materializer.md.  A MaterializationError thrown
    // here propagates to the app's materialization error report.
    const materializer = new this.mapModule.ThreadedMaterializer(this.schema, {staticVars: this.staticVars});
    this.shapeMap.forEach(pair => {
      const shape = !pair.shape || pair.shape === ShExWebApp.Validator.Start ? undefined : pair.shape;
      generatedGraph.addQuads(materializer.materialize(this.resultBindings, pair.node, shape));
    });
    this.lastReport = materializer.lastReport; // unbound-variable / unused-static warnings
    this.accepts = materializer.accepts;       // all viable materializations
    this.chosen = materializer.chosen;         // ... and the one returned
    time = new Date() - time;
    $("#shapeMap-tabs").attr("title", "last materialization: " + time + " ms");
    $("#results .status").text("rendering results...").show();

    return generatedGraph;
  }
}

class ShExMapInMainApp extends ShExMapBaseApp {
  getValidator (loaded, _base, inputData) {
    const validator = new DirectShExValidator(loaded, inputData, this.makeRenderer());
    this.Mapper = this.MapModule.register(validator.validator, ShExWebApp);
    return validator;
  }

  getMaterializer (schema, shapeMap, resultBindings, staticVars) {
    return new DirectShExMaterializer(schema, shapeMap, resultBindings, staticVars, this.MapModule);
  }
}

