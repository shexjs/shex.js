class ShExSimpleApp extends ShExBaseApp {
  constructor (base, validatorClass) {
    super(base, validatorClass);
    const manifest = new ManifestCache($("#manifestDrop"));
    this.Caches.manifest = manifest;
    const shexSimpleParameter =
      {queryStringParm: "manifest", location: manifest.selection, cache: manifest, fail: e => $("#manifestDrop li").text(NO_MANIFEST_LOADED)}
    this.Getables.push(shexSimpleParameter);
    this.QueryParams.push(shexSimpleParameter);
  };
  usingValidator (_validator) { } // overriden for ShExMap
}
 
