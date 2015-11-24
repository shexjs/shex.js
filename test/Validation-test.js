//  "use strict";
var VERBOSE = "VERBOSE" in process.env;
var TERSE = VERBOSE;
var TESTS = "TESTS" in process.env ? process.env.TESTS.split(/\|/) : null;

var ShExParser = require("../lib/ShExParser").Parser;
var ShExValidator = require("../lib/ShExValidator");

var N3 = require("n3");
var turtleParser = new N3.Parser();
var fs = require("fs");
var path = require("path");
var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var findPath = require("./findPath.js");

var schemasPath = findPath("schemas");
var validationPath = findPath("validation");
var manifestFile = validationPath + "manifest.jsonld";

describe("A ShEx validator", function () {
  "use strict";

  var shexParser = new ShExParser();
  // Ensure the same blank node identifiers are used in every test
  // beforeEach(function () {
  //   shexParser._resetBlanks();
  // });

  var tests = parseJSONFile(manifestFile)["@graph"][0]["entries"];

  if (TESTS) {
    tests = tests.filter(function (t) {
      return TESTS.indexOf(t["@id"]) !== -1 ||
        TESTS.indexOf(t["@id"].substr(1)) !== -1 ||
        TESTS.indexOf(t.action.schema) !== -1 ||
        TESTS.indexOf(t.action.data) !== -1 ||
        TESTS.indexOf(t.result) !== -1;
    });
  }

  tests.forEach(function (test) {
    try {
      var schemaFile = path.join(schemasPath, test.action.schema);
      var dataFile = path.join(validationPath, test.action.data);
      var resultsFile = test.result ? path.join(validationPath, test.result) : null;
      var schema = shexParser.parse(fs.readFileSync(schemaFile, "utf8"));
      var referenceResult = resultsFile ? parseJSONFile(resultsFile) : null;

      assert(referenceResult !== null || test["@type"] === "sht:ValidationFailure");
      // var start = schema.start;
      // if (start === undefined && Object.keys(schema.action.shapes).length === 1)
      //   start = Object.keys(schema.action.shapes)[0];

      var validator = new ShExValidator(schema, { diagnose: true });
      it("should validate data '" + (TERSE ? test.action.data : dataFile) + // test title
         "' against schema '" + (TERSE ? test.action.schema : schemaFile) +
         "' and get '" + (TERSE ? test.result : resultsFile) + "'.",
         function (report) {                                             // test action
           var store = new N3.Store();
           turtleParser.parse(
             fs.readFileSync(dataFile, "utf8"),
             function (error, triple, prefixes) {
               if (error) {
                 report("error parsing " + dataFile + ": " + error);
               } else if (triple) {
                 store.addTriple(triple);
               } else {
                 try {
                   var validationResult = validator.validate(store, test.action.focus, test.action.shape);
                   if (VERBOSE) { console.log("result   :" + JSON.stringify(validationResult)); }
                   if (VERBOSE) { console.log("expected :" + JSON.stringify(referenceResult)); }
                   expect(restoreUndefined(validationResult)).to.deep.equal(restoreUndefined(referenceResult));
                   report();
                 } catch (e) {
                   report(e);
                 }
               }
             });
         });
    } catch (e) {
      var throwMe = new Error("in " + test["@id"] + " " + e);
      throwMe.stack = e.stack;
      throw throwMe;
    }
  });
});

// Parses a JSON object, restoring `undefined` values
function parseJSONFile(filename) {
  "use strict";
  try {
    var string = fs.readFileSync(filename, "utf8");
    var object = JSON.parse(string);
    return /"\{undefined\}"/.test(string) ? restoreUndefined(object) : object;
  } catch (e) {
    throw new Error("error reading " + filename + ": " + e);
  }
}

// Recursively replace values of "{undefined}" by `undefined`
function restoreUndefined(object) {
  "use strict";
  for (var key in object) {
    var item = object[key];
    if (typeof item === "object") {
      object[key] = restoreUndefined(item);
    } else if (item === "{undefined}") {
      object[key] = undefined;
    }
  }
  return object;
}
