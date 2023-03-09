class ShExWorkerApp extends ShExSimpleApp {
  getValidator (loaded, base, inputData) {
    return new RemoteShExValidator(loaded, base, inputData, this.makeRenderer(), this.disableResultsAndValidate, "endpoint" in this.Caches.inputData ? this.Caches.inputData.endpoint : null)
  }
}
 
