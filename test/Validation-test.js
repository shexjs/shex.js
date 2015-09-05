//  "use strict";
var VERBOSE = "VERBOSE" in process.env;
var TESTS = "TESTS" in process.env ? process.env.TESTS.split(/,/) : null;

var ShExParser = require("../lib/ShExParser").Parser;
var ShExValidator = require("../lib/ShExValidator");

var N3 = require("n3");
var turtleParser = N3.Parser();
var fs = require("fs");
var path = require("path");
var expect = require("chai").expect;
var assert = require("chai").assert;
var findPath = require("./findPath.js");

var schemasPath = findPath("schemas");
var validationsPath = findPath("validations");
var manifestFile = validationsPath+"manifest.jsonld";
var negSyntaxTestsPath = findPath("negativeSyntax");

describe("A ShEx validator", function () {
  // var b = function () {  };
  // it("is a toy", function () {
  //   expect({a:1, b: b}).to.deep.equal({a:1, b: b});
  // });

  var shexParser = new ShExParser();
  // Ensure the same blank node identifiers are used in every test
  beforeEach(function () {
    shexParser._resetBlanks();
  });

  var tests = parseJSONFile(manifestFile)["@graph"][0]["mf:entries"];

  if (TESTS)
    tests = tests.filter(function (t) {
      return TESTS.indexOf(t["@id"]) !== -1 ||
        TESTS.indexOf(t["@id"].substr(1)) !== -1 ||
        TESTS.indexOf(t.schema) !== -1 ||
        TESTS.indexOf(t.data) !== -1 ||
        TESTS.indexOf(t.result) !== -1;
    });

  tests.forEach(function (test) {
// try {
    var schemaFile = path.join(schemasPath, test.schema);
    var dataFile = path.join(validationsPath, test.data);
    var resultsFile = test.result ? path.join(validationsPath, test.result) : null;
    var schema = shexParser.parse(fs.readFileSync(schemaFile, "utf8"));
    var referenceResult = resultsFile ? parseJSONFile(resultsFile) : null;

    assert(referenceResult !== null || test["@type"] === "shext:ValidationFailure");
    // var start = schema.start;
    // if (start === undefined && Object.keys(schema.shapes).length === 1)
    //   start = Object.keys(schema.shapes)[0];

    it("should validate data '" + (VERBOSE ? dataFile : test.data) + // test title
       "' against schema '" + (VERBOSE ? schemaFile : test.schema) +
       "' and get '" + (VERBOSE ? resultsFile : test.result) + "'." ,
       function (report) {                                             // test action
         var store = N3.Store();
         var validator = ShExValidator(schema);  // @@ Why does a validator fail when constructed outside the call to it()?!
         turtleParser.parse(
           fs.readFileSync(dataFile, "utf8"),
           function (error, triple, prefixes) {
             if (triple)
               store.addTriple(triple)
             else {
               try {
                 var validationResult = validator.validate(store, test.focus, test.shape);
                 if (VERBOSE) console.log("result   :" + JSON.stringify(validationResult));
                 if (VERBOSE) console.log("expected :" + JSON.stringify(referenceResult));
                 expect(validationResult).to.deep.equal(referenceResult);
                 report();
               } catch (e) {
                 report(e);
               }
             }
           });
       });
// } catch (e) {
//   throw new Error("in "+test["@id"]+" "+e);
// }
  });
});

// Parses a JSON object, restoring `undefined` values
function parseJSONFile(filename) {
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
  for (var key in object) {
    var item = object[key];
    if (typeof item === "object")
      object[key] = restoreUndefined(item);
    else if (item === "{undefined}")
      object[key] = undefined;
  }
  return object;
}
