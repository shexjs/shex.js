
var TESTSDIR = "TESTSDIR" in process.env ? process.env.TESTSDIR : "../../shexTest";
var fs = require("fs");
var path = require("path");
module.exports = function (dirName) {
  // var fromPath = __dirname + "/" + TESTSDIR + "/" + dirName + "/";
  var fromPath = path.join(__dirname, TESTSDIR, dirName) + "/";
  if (fs.existsSync(fromPath)) {
    return fromPath;
  }
  try {
    var fromPackage = require("shex-test")[dirName];
    if (fromPackage !== undefined) {
      return fromPackage;
    }
  } catch (e) {
    throw new Error(fromPath + " not found and shex-test not installed. Either 'npm install shex-test' or '(cd .. && git clone git@github.com:shexSpec/shex-test.git)' .");
  }
  throw new Error(fromPath + " not found and " + dirName + " not in shexTest repo.");
};

