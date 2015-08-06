
var TESTSDIR = "TESTSDIR" in process.env ? process.env["TESTSDIR"] : "../../shexTest";
var fs = require('fs');

module.exports = function (path) {
  var fromPath = __dirname + '/'+TESTSDIR+'/' + path + '/';
  if (fs.existsSync(fromPath))
    return fromPath;
  try {
    var fromPackage = require('ShExTest')[path];
    if (fromPackage !== undefined)
      return fromPackage;
  } catch (e) {
    console.warn(fromPath + " not found and ShExTest not installed. Either 'npm install ShExTest' or '(cd .. && git clone git@github.com:shexSpec/shexTest.git)' .");
    process.exit(-1);
  }
  console.warn(fromPath + " not found and " + path + " not in ShExTest repo.");
  process.exit(-1);
}

