/*
  Override ShExApp.getValidator with a RemoteShExValidator

  This is doc/ShExInWorkerApp.js's source (tsconfig.app.json compiles src/app/ into
  doc/); edit here and run `npm run build`.
 */
class ShExInWorkerApp extends ShExApp {
    /** a plugin with a worker half has one thing to do here, another there */
    get remote() { return true; }
    getValidator(loaded, base, inputData) {
        // What the worker needs to have the same data source over there.  A db
        // that fetches its answers cannot be marshalled, so it is named and
        // rebuilt: the module, and the values it takes.  A source that is
        // handed its data (the local store) sends the data instead, which is
        // what `source: null` means below.
        const { moduleId } = ShExWebApp.NeighborhoodApi;
        const module = this.neighborhoods.module;
        const source = (module.capabilities || []).length > 0
            ? { neighborhood: moduleId(module), params: this.neighborhoods.params() }
            : null;
        // WorkerUrl: the page said it when it started the worker, and a cancel
        // starts another one from the same URL
        return new RemoteShExValidator(loaded, base, inputData, this.makeRenderer(), this.disableResultsAndValidate.bind(this), source, WorkerUrl);
    }
}
