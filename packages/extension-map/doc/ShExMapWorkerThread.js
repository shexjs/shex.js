/**
 * ShExMap in the worker: the handler a %Map:{...%} dispatches on, and the
 * `materialize` request the app sends when it has bindings to build from
 * (doc/extension-ui-plan.md inventory rows 15 and 16).
 *
 * Imported by ShExWorkerThread on the app's say-so, which is why this is
 * not a worker script of its own any more -- it used to be a copy of that
 * file with these two things added, and the copy went stale: the base one
 * has since learned to ask an endpoint asynchronously and to marshal the
 * terms a query tracker reports.
 */
importScripts(pluginBase + "webpacks/shexmap-webapp.js");

const MapModule = ShExWebApp.Map({rdfjs: N3js, Validator: ShExWebApp.Validator});

registerWorkerPlugin({
  /** row 9's worker half: what the schema's %Map:{...%} dispatches on */
  register (validator, api) {
    MapModule.register(validator, api);
  },

  requests: {
    /** rows 15 and 16: materialize the bindings into quads, and post them
     * back with the provenance the app's editor panes hang hovers on.
     * staticVars travel with the request. */
    materialize (msg) {
      const materializeMap = msg.data.queryMap;
      const outputSchema = ShExWebApp.Util.ShExJtoAS(msg.data.outputSchema);
      // NFA-thread materializer (see extension-map/doc/threaded-materializer.md):
      // needs no registered validator/Mapper state -- each materialization
      // thread carries its own binding-tree cursor.  Emitted quads are
      // marshalled back to the app, which rebuilds them with its DataFactory.
      const materializer = new MapModule.ThreadedMaterializer(outputSchema, {staticVars: msg.data.staticVars || {}});
      // per-quad provenance travels as constraint INDEXES: structured clone
      // breaks object identity, but the app walks its own copy of this schema
      // the same way to recover its own TripleConstraints
      const ordinalOf = new Map(MapModule.tripleConstraints(outputSchema).map((tc, i) => [tc, i]));
      materializeMap.forEach(pair => {
        try {
          // a structured-cloned Start marker arrives as a plain object; labels are strings
          const shape = !pair.shape || typeof pair.shape === "object" ? undefined : pair.shape;
          const quads = materializer.materialize(msg.data.resultBindings, pair.node, shape);
          const provenance = (materializer.provenance || []).map(p => ({
            tcOrdinal: p.tc !== undefined && ordinalOf.has(p.tc) ? ordinalOf.get(p.tc) : null,
            predicate: p.predicate,
            src: p.src,
          }));
          self.postMessage({ response: "update", provenance,
                             quads: quads.map(q => WorkerMarshalling.rdfjsTripleToJsonTriple(q)) });
        } catch (e) {
          console.dir(e);
          self.postMessage({ response: "error", exception: `Exception when materializing ${pair.node}@${pair.shape}: ${typeof e === 'object' && e instanceof Error ? e.message : e}` });
        }
      });
      self.postMessage({ response: "done" });
    },
  },
});
