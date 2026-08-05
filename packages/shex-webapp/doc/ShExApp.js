/*
  ShExApp extends ShExBaseApp to load a ShEx manifest.
  ShExBaseApp.callValidator() defaults to using a DirectShExValidator.
 */
class ShExApp extends ShExBaseApp {
  constructor (base, validatorClass) {
    super(base);
    const manifestSelector = $("#manifestDrop");
    const manifestCache = new ManifestCache(manifestSelector, this.Caches, this.resultsWidget);
    this.Caches.manifest = manifestCache;
    const manifestParameter =
      {queryStringParm: "manifest", location: manifestSelector, cache: manifestCache, fail: e => $("#manifestDrop li").text(NO_MANIFEST_LOADED)}
    this.Getables.push(manifestParameter);
    this.QueryParams.push(manifestParameter);
    manifestCache.queryParams = this.QueryParams; // drives ManifestCache.loadExtraInputs
  };
  getValidator (loaded, _base, inputData) {
    return new DirectShExValidator(loaded, inputData, this.makeRenderer());
  }
}
 
