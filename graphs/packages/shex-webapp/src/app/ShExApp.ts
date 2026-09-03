/*
  ShExApp extends ShExBaseApp to load a ShEx manifest.
  ShExBaseApp.callValidator() defaults to using a DirectShExValidator.

  This is doc/ShExApp.js's source (tsconfig.app.json compiles src/app/ into
  doc/); edit here and run `npm run build`.
 */
class ShExApp extends ShExBaseApp {
  constructor (base: string, validatorClass?: any) {
    super(base);
    const manifestSelector = $("#manifestDrop");
    const manifestCache = new ManifestCache(manifestSelector, this.Caches, this.resultsWidget);
    this.Caches.manifest = manifestCache;
    const manifestParameter =
      {queryStringParm: "manifest", location: manifestSelector, cache: manifestCache, fail: (e: any) => $("#manifestDrop li").text(NO_MANIFEST_LOADED)}
    this.Getables.push(manifestParameter);
    this.QueryParams.push(manifestParameter);
    manifestCache.queryParams = this.QueryParams; // drives ManifestCache.loadExtraInputs
  };
  getValidator (loaded: any, _base: string, inputData: any): DirectShExValidator | RemoteShExValidator {
    return new DirectShExValidator(loaded, inputData, this.makeRenderer());
  }
}
 
