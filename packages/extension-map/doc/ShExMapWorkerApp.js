class ShExMapWorkerApp extends ShExMapBaseApp {
  usingValidator (_validator) { }

  makeConsoleTracker () {
    function padding (depth) { return (new Array(depth + 1)).join("  "); } // AKA "  ".repeat(depth)
    function sm (node, shape) {
      if (typeof shape === "object" && "term" in shape && shape.term === ShExWebApp.Validator.Start.term) {
        shape = ShExWebApp.Validator.Start;
      }
      return `${App.Caches.inputData.meta.termToLex(node)}@${App.Caches.inputSchema.meta.termToLex(shape)}`;
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

  async materialize () {
    SharedForTests.promise = this.materializeAsync()
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

      // const trivialMaterializer = Mapper.trivialMaterializer(outputSchema);
      const outputShapeMap = fixedShapeMapToTerms([{
        node: App.Caches.inputData.meta.lexToTerm($("#createRoot").val()),
        shape: App.Caches.outputSchema.meta.lexToTerm($("#outputShape").val()) // resolve with App.Caches.outputSchema
      }]);

      await App.Caches.bindings.set(JSON.stringify(resultBindings, null, "  "));
      const generatedGraph = new RdfJs.Store();
      $("#results div").empty();
      $("#results .status").text("materializing data...").show();

      const resultGraphs = []
      const materialized = await new Canceleable(
        $("#materialize"),
        materialize,
        "materialization aborted, re-start from validation",
        {
          request: "materialize",
          queryMap: outputShapeMap,
          outputSchema: outputSchema,
          resultBindings: resultBindings,
          options: {track: LOG_PROGRESS},
        },
        parseUpdatesAndResults
      ).ready();

      function parseUpdatesAndResults (msg, workerUICleanup, resolve, reject) {
        switch (msg.data.response) {
        case "update":
          generatedGraph.addQuads(ShExWebApp.Util.valToN3js(msg.data.results, RdfJs.DataFactory));
          resultGraphs.push(msg.data.results);
          break;

        case "error":
          if ("exception" in msg.data) {
            results.replace("error materializing:\n" + msg.data.exception).
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
          resolve({ materializionResults: resultGraphs });
        }
      }
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
          nestedWriter.end(addResult);
        } catch (e) {
          console.error(`NestedWriter(${node}@${shape}) failure:`);
          console.error(e);
          const fallbackWriter = new RdfJs.Writer({ prefixes: App.Caches.outputSchema.parsed._prefixes });
          fallbackWriter.addQuads(generatedGraph.getQuads());
          fallbackWriter.end(addResult);
        }
      });
      results.finish();
      return { materializationResults: generatedGraph };
    } catch (e) {
      results.replace("error parsing " + parsing + ":\n" + e).
        removeClass("passes fails").addClass("error");
      // results.finish();
      return null;
    }
  }
}

