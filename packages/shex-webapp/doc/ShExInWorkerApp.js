/*
  Override ShExApp.getValidator with a RemoteShExValidator
 */
class ShExInWorkerApp extends ShExApp {
  /** an extension with a worker half has one thing to do here, another there */
  get remote () { return true; }

  getValidator (loaded, base, inputData) {
    // WorkerUrl: the page said it when it started the worker, and a cancel
    // starts another one from the same URL
    return new RemoteShExValidator(loaded, base, inputData, this.makeRenderer(), this.disableResultsAndValidate.bind(this), "endpoint" in this.Caches.inputData ? this.Caches.inputData.endpoint : null, WorkerUrl)
  }
}
 
