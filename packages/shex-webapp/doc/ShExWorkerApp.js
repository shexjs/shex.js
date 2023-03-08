class ShExWorkerApp extends ShExSimpleApp {
  getValidator (loaded, base, inputData) {
    return new RemoteShExValidator(loaded, base, inputData, this.makeRenderer(), this.disableResultsAndValidate, "endpoint" in App.Caches.inputData ? App.Caches.inputData.endpoint : null)
  }
}
 
