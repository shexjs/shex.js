class DirectShExMaterializer {
  constructor (schema, resultBindings, renderer, shapeMap, mapModule, mapper) {
    // this.trivialMaterializer = this.Mapper.trivialMaterializer(schema);
    // this.outputGraph = trivialMaterializer.materialize(binder, lexToTerm($("#createRoot").val()), outputShape);
    this.schema = schema;
    this.shapeMap = shapeMap;
    this.resultBindings = resultBindings;
    this.renderer = renderer;
    this.mapModule = mapModule;
    this.mapper = mapper;
  }
  async invoke (fixedMap, validationTracker, time, _done, _currentAction) {
    const generatedGraph = new RdfJs.Store();
    const materializer = this.mapModule.materializer.construct(this.schema, this.mapper, {});
    this.shapeMap.forEach(pair => {
      try {
        const binder = this.mapper.binder(JSON.parse(JSON.stringify(this.resultBindings)));
        const resM = materializer.validate(binder, ShExWebApp.StringToRdfJs.n3idTerm2RdfJs(pair.node), pair.shape);
        if ("errors" in resM) {
          this.renderer.entry({
            node: pair.node,
            shape: pair.shape,
            status: "errors" in resM ? "nonconformant" : "conformant",
            appinfo: resM,
            elapsed: -1
          })
        } else {
          generatedGraph.addQuads(ShExWebApp.Util.valToN3js(resM, RdfJs.DataFactory));
        }
      } catch (e) {
        console.dir(e);
      }
    });
    time = new Date() - time;
    $("#shapeMap-tabs").attr("title", "last materialization: " + time + " ms");
    $("#results .status").text("rendering results...").show();

    return generatedGraph;
  }
}

class ShExMapInMainApp extends ShExMapBaseApp {
  getValidator (loaded, _base, inputData) {
    this.renderer = this.makeRenderer(); // keep a copy for the materializer
    const validator = new DirectShExValidator(loaded, inputData, this.renderer);
    this.Mapper = this.MapModule.register(validator.validator, ShExWebApp);
    return validator;
  }

  getMaterializer (schema, shapeMap, resultBindings) {
    return new DirectShExMaterializer(schema, resultBindings, this.renderer, shapeMap, this.MapModule, this.Mapper);
  }
}

