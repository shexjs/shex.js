class ShExMapSimpleApp extends ShExMapBaseApp {
  usingValidator (validator) {
    this.Mapper = MapModule.register(validator.validator, ShExWebApp);
  }
  async materialize () {
    SharedForTests.promise = this.materializeAsync();
  }
  async materializeAsync () {
    if (App.Caches.bindings.get().trim().length === 0) {
      results.replace("You must validate data against a ShExMap schema to populate mappings bindings.").
        removeClass("passes fails").addClass("error");
      return null;
    }
    results.start();
    const parsing = "output schema";
    try {
      const outputSchemaText = App.Caches.outputSchema.selection.val();
      const outputSchemaIsJSON = outputSchemaText.match(/^\s*\{/);
      const outputSchema = await App.Caches.outputSchema.refresh();

      // const resultBindings = Object.assign(
      //   await App.Caches.statics.refresh(),
      //   await App.Caches.bindings.refresh()
      // );

      function _dup (obj) { return JSON.parse(JSON.stringify(obj)); }
      let resultBindings = _dup(await App.Caches.bindings.refresh());
      if (App.Caches.statics.get().trim().length === 0)
        await App.Caches.statics.set("{  }");
      const _t = await App.Caches.statics.refresh();
      if (_t && Object.keys(_t).length > 0) {
        if (!Array.isArray(resultBindings))
          resultBindings = [resultBindings];
        resultBindings.unshift(_t);
      }

      // const trivialMaterializer = this.Mapper.trivialMaterializer(outputSchema);
      const outputShapeMap = fixedShapeMapToTerms([{
        node: App.Caches.inputData.meta.lexToTerm($("#createRoot").val()),
        shape: App.Caches.outputSchema.meta.lexToTerm($("#outputShape").val()) // resolve with App.Caches.outputSchema
      }]);

      const binder = this.Mapper.binder(resultBindings);
      await App.Caches.bindings.set(JSON.stringify(resultBindings, null, "  "));
      // const outputGraph = trivialMaterializer.materialize(binder, lexToTerm($("#createRoot").val()), outputShape);
      // binder = this.Mapper.binder(resultBindings);
      const generatedGraph = new RdfJs.Store();
      $("#results div").empty();
      $("#results .status").text("materializing data...").show();
      outputShapeMap.forEach(pair => {
        try {
          const materializer = MapModule.materializer.construct(outputSchema, this.Mapper, {});
          const resM = materializer.validate(binder, ShExWebApp.StringToRdfJs.n3idTerm2RdfJs(pair.node), pair.shape);
          if ("errors" in resM) {
            renderEntry( {
              node: pair.node,
              shape: pair.shape,
              status: "errors" in resM ? "nonconformant" : "conformant",
              appinfo: resM,
              elapsed: -1
            })
            // $("#results .status").text("validation errors:").show();
            // $("#results .status").text("synthesis errors:").show();
            // failMessage(e, currentAction);
          } else {
            // console.log("g:", ShExWebApp.Util.valToTurtle(resM));
            generatedGraph.addQuads(ShExWebApp.Util.valToN3js(resM, RdfJs.DataFactory));
          }
        } catch (e) {
          console.dir(e);
        }
      });
      finishRendering();
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
            prefixes: App.Caches.outputSchema.parsed._prefixes,
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
          const fallbackWriter = new RdfJs.Writer({ prefixes: App.Caches.outputSchema.parsed._prefixes });
          fallbackWriter.addQuads(generatedGraph.getQuads());
          fallbackWriter.end((error, result) => this.addResult(error, result));
        }
      });
      results.finish();
      return { materializationResults: generatedGraph };
    } catch (e) {
      if (true) // don't print stack for parser errors
        console.log(e);
      results.replace("error parsing " + parsing + ":\n" + e).
        removeClass("passes fails").addClass("error");
      // results.finish();
      return null;
    }
  }

  addResult (error, result) {
    results.append(
      $("<div/>", {class: "passes"}).append(
        $("<span/>", {class: "shapeMap"}).append(
          "# ",
          $("<span/>", {class: "data"}).text($("#createRoot").val()),
          $("<span/>", {class: "valStatus"}).text("@"),
          $("<span/>", {class: "schema"}).text($("#outputShape").val()),
        ),
        $("<pre/>").text(result)
      )
    )
    // results.append($("<pre/>").text(result));
  }


}

