// The shexTest manifest in `dir` (a path ending in "/", as findPath.js
// returns) as its list of tests, in the shape the suites read: the original
// manifest.jsonld's @graph[0].entries.
//
// shexTest (branch manifest-refactor) keeps two manifests in each suite
// directory: `manifest`, the original structure (manifest.ttl and
// manifest.jsonld, as on its main), and `manifest-ld`, the same tests in
// the ShEx manifest vocabulary (manifest-ld.yaml, .jsonld and .ttl).  The
// suites read manifest-ld where the corpus has it -- its JSON-LD
// representation, spelled the way manifest.jsonld spells its tests by the
// corpus's own bin/manifest-ld-to-legacy-jsonld.js -- and manifest.jsonld
// where it has not
// (shexTest main, which CI installs until the pair merges).
// The corpus's own bin/manifest-ld-legacy-check.js (in its npm test) checks that the
// two spellings are the same file byte for byte, so either way the suites
// run the same tests.  TEST_original_manifest=true reads
// manifest.jsonld regardless.
const Fs = require("fs");
const Path = require("path");
const TEST_original_manifest = require("./testGate.js")("TEST_original_manifest");

/** the file the suites read for `dir` */
function manifestFile (dir) {
  const ld = Path.join(dir, "manifest-ld.jsonld");
  return !TEST_original_manifest && Fs.existsSync(ld) && Fs.existsSync(projector(dir)) ? ld : Path.join(dir, "manifest.jsonld");
}

const projector = (dir) => Path.join(dir, "..", "bin", "manifest-ld-to-legacy-jsonld.js");

module.exports = function suiteManifest (dir) {
  const file = manifestFile(dir);
  const doc = JSON.parse(Fs.readFileSync(file, "utf8"));
  if (Path.basename(file) === "manifest-ld.jsonld")
    // the suite directory's name says where the manifest conventionally lives
    return require(projector(dir)).project(doc, Path.basename(Path.resolve(dir)))["@graph"][0].entries;
  return doc["@graph"][0].entries;
};
module.exports.manifestFile = manifestFile;
