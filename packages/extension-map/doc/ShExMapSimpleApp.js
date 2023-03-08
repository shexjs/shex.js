class ShExMapSimpleApp extends ShExMapBaseApp {
  getValidator (loaded, _base, inputData) {
    const validator = new DirectShExValidator(loaded, inputData, this.makeRenderer());
    this.Mapper = this.MapModule.register(validator.validator, ShExWebApp);
    return validator;
  }

  async materializeAsync () {
    if (this.Caches.bindings.get().trim().length === 0) {
      this.resultsWidget.replace("You must validate data against a ShExMap schema to populate mappings bindings.").
        removeClass("passes fails").addClass("error");
      return null;
    }
    this.resultsWidget.start();
    const parsing = "output schema";
    try {
      const outputSchemaText = this.Caches.outputSchema.selection.val();
      const outputSchemaIsJSON = outputSchemaText.match(/^\s*\{/);
      const outputSchema = await this.Caches.outputSchema.refresh();

      // const resultBindings = Object.assign(
      //   await this.Caches.statics.refresh(),
      //   await this.Caches.bindings.refresh()
      // );

      function _dup (obj) { return JSON.parse(JSON.stringify(obj)); }
      let resultBindings = _dup(await this.Caches.bindings.refresh());
      if (this.Caches.statics.get().trim().length === 0)
        await this.Caches.statics.set("{  }");
      const _t = await this.Caches.statics.refresh();
      if (_t && Object.keys(_t).length > 0) {
        if (!Array.isArray(resultBindings))
          resultBindings = [resultBindings];
        resultBindings.unshift(_t);
      }

      // const trivialMaterializer = this.Mapper.trivialMaterializer(outputSchema);
      const outputShapeMap = this.fixedShapeMapToTerms([{
        node: this.Caches.inputData.meta.lexToTerm($("#createRoot").val()),
        shape: this.Caches.outputSchema.meta.lexToTerm($("#outputShape").val()) // resolve with this.Caches.outputSchema
      }]);

      const binder = this.Mapper.binder(resultBindings);
      await this.Caches.bindings.set(JSON.stringify(resultBindings, null, "  "));
      // const outputGraph = trivialMaterializer.materialize(binder, lexToTerm($("#createRoot").val()), outputShape);
      // binder = this.Mapper.binder(resultBindings);
      const generatedGraph = new RdfJs.Store();
      $("#results div").empty();
      $("#results .status").text("materializing data...").show();
      outputShapeMap.forEach(pair => {
        try {
          const materializer = this.MapModule.materializer.construct(outputSchema, this.Mapper, {});
          const resM = materializer.validate(binder, ShExWebApp.StringToRdfJs.n3idTerm2RdfJs(pair.node), pair.shape);
          if ("errors" in resM) {
            this.renderEntry( {
              node: pair.node,
              shape: pair.shape,
              status: "errors" in resM ? "nonconformant" : "conformant",
              appinfo: resM,
              elapsed: -1
            })
            // $("#results .status").text("validation errors:").show();
            // $("#results .status").text("synthesis errors:").show();
            // this.resultsWidget.failMessage(e, currentAction);
          } else {
            // console.log("g:", ShExWebApp.Util.valToTurtle(resM));
            generatedGraph.addQuads(ShExWebApp.Util.valToN3js(resM, RdfJs.DataFactory));
          }
        } catch (e) {
          console.dir(e);
        }
      });
      this.currentRenderer.finish();
      $("#results .status").text("materialization results").show();

      // Extract rdf:Collection heads.
      const lists = generatedGraph.extractLists({
        remove: true // Remove quads involved in lists (RDF Collections).
      });

      outputShapeMap.forEach(pair => {
        const {node, shape} = pair;
        try {
          const nestedWriter = new ShExWebApp.NestedTurtleWriter.Writer(null, {
            // lists: {}, -- lists will require some thinking
            format: 'text/turtle',
            // baseIRI: resource.base,
            prefixes: this.Caches.outputSchema.parsed._prefixes,
            lists,
            version: 1.1,
            indent: '    ',
            checkCorefs: n => false,
            // debug: true,
          });
          const db = ShExWebApp.RdfJsDb(generatedGraph, null); // no query tracker needed
          const validator = new ShExWebApp.Validator(outputSchema, db, {
            results: "api",
            regexModule: ShExWebApp["eval-simple-1err"],
          });
          const res = validator.validateShapeMap([{node, shape}])[0].appinfo;
          if (!("solution" in res))
            throw res;
          const matched = [];
          const seen = new RdfJs.Store(); // use N3Store to de-duplicate quads that were validated multiple ways.
          const matchedDb = {
            addQuad: function (q) {
              if (!seen.countQuads(q.subject, q.predicate, q.object, q.graph)) {
                seen.addQuad(q);
                matched.push(q);
              }
            }
          }
          ShExWebApp.Util.getProofGraph(res, matchedDb, RdfJs.DataFactory);
          const rest = new RdfJs.Store();
          rest.addQuads(generatedGraph.getQuads()); // the resource giveth
          matched.forEach(q => rest.removeQuad(q)); // the matched taketh away
          nestedWriter.addQuads(matched.filter(q => ([ShExWebApp.Util.RDF.first, ShExWebApp.Util.RDF.rest]).indexOf(q.predicate.value) === -1));
          if (rest.size > 0) {
            nestedWriter.comment("\n# Triples not in the schema:");
            nestedWriter.addQuads(rest.getQuads())
          }
          nestedWriter.end((error, result) => this.addResult(error, result));
        } catch (e) {
          console.error(`NestedWriter(${node}@${shape}) failure:`);
          console.error(e);
          const fallbackWriter = new RdfJs.Writer({ prefixes: this.Caches.outputSchema.parsed._prefixes });
          fallbackWriter.addQuads(generatedGraph.getQuads());
          fallbackWriter.end((error, result) => this.addResult(error, result));
        }
      });
      this.resultsWidget.finish();
      return { materializationResults: generatedGraph };
    } catch (e) {
      if (true) // don't print stack for parser errors
        console.log(e);
      this.resultsWidget.replace("error parsing " + parsing + ":\n" + e).
        removeClass("passes fails").addClass("error");
      // this.resultsWidget.finish();
      return null;
    }
  }
}

