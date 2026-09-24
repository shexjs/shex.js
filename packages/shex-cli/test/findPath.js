var fs = require("fs");
var path = require("path");

// Where to look for the shexTest corpus, in order: an explicit TESTSDIR
// override, then -- starting at this repo's root -- a sibling `../shexTest`
// (a clone or a symlink), `../../shexTest`, and the shexSpec-org layout
// `../../shexSpec/shexTest`; finally the `shex-test` devDependency in
// node_modules. Each base is probed both through its package.json `main`
// (which maps the standard dirs) and by a direct subdirectory (which also
// resolves the `*-contrib` dirs the module doesn't export).
var ROOT = path.resolve(__dirname, "../../..");
var CANDIDATES = ("TESTSDIR" in process.env ? [process.env.TESTSDIR] : []).concat([
  path.resolve(ROOT, "../shexTest"),
  path.resolve(ROOT, "../../shexTest"),
  path.resolve(ROOT, "../../shexSpec/shexTest"),
]);

module.exports = function (dirName) {
  for (var i = 0; i < CANDIDATES.length; ++i) {
    var base = path.resolve(CANDIDATES[i]); // TESTSDIR may be relative to the cwd

    // try the checkout's package.json `main` (maps the standard test dirs)
    var packageName = path.join(base, "package.json");
    if (fs.existsSync(packageName)) {
      try {
        var pkg = require(path.join(base, JSON.parse(fs.readFileSync(packageName, "utf8")).main))[dirName];
        if (pkg !== undefined) {
          return pkg;
        }
      } catch (e) {
        // fall through to the direct path
      }
    }

    // try the directory directly (also resolves validation-contrib/ etc.)
    var fromPath = path.join(base, dirName) + "/";
    if (fs.existsSync(fromPath)) {
      return fromPath;
    }
  }

  try {
    // finally, the npm-installed devDependency
    var fromPackage = require("shex-test")[dirName];
    if (fromPackage !== undefined) {
      return fromPackage;
    }
  } catch (e) {
    throw new Error(dirName + " not found in ../shexTest, ../../shexTest or ../../shexSpec/shexTest (from the repo root), and shex-test not installed. Either 'npm install shex-test' or '(cd .. && git clone git@github.com:shexSpec/shexTest.git)' .", {cause: e});
  }
  throw new Error(dirName + " not found in any shexTest checkout.");
};
