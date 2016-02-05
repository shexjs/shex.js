//  "use strict";
var VERBOSE = "VERBOSE" in process.env;
var TESTS = "TESTS" in process.env ? process.env.TESTS.split(/,/) : null;

var ShExValidator = require('../lib/ShExValidator');

var fs = require("fs");
var expect = require("chai").expect;
var findPath = require("./findPath.js");

var schemasPath = findPath("parsedSchemas");
var jsonASTsPath = findPath("ASTs");
var negSyntaxTestsPath = findPath("negativeSyntax");
var illDefinedTestsPath = findPath("illDefined");

describe("A ShEx AST", function () {

  // positive transformation tests
  var schemas = fs.readdirSync(schemasPath);
  schemas = schemas.map(function (s) { return s.replace(/\.json$/, ""); });
  if (TESTS)
    schemas = schemas.filter(function (s) { return TESTS.indexOf(s) !== -1; });
  schemas.sort();
  schemas.forEach(function (schemaName) {

    var jsonASTFile = jsonASTsPath + schemaName + ".json";
    if (!fs.existsSync(jsonASTFile)) return;
    var jsonSchemaFile = schemasPath + schemaName + ".json"

    it("should translate JSON schema '" + jsonSchemaFile + "' to '" + jsonASTFile + "'." , function () {
      var jsonAST = parseJSON(fs.readFileSync(jsonASTFile, "utf8"));

      if (VERBOSE) console.log(schemaName);
      var schema = parseJSON(fs.readFileSync(jsonSchemaFile, "utf8"));
      var compiledAST = ShExValidator.construct(schema).getAST();
      if (VERBOSE) console.log("compiled :" + JSON.stringify(compiledAST));
      if (VERBOSE) console.log("expected :" + JSON.stringify(jsonAST));
      expect(compiledAST).to.deep.equal(jsonAST);
    });
  });
});

// Parses a JSON object, restoring `undefined` values
function parseJSON(string) {
  var object = JSON.parse(string);
  return /"\{undefined\}"/.test(string) ? restoreUndefined(object) : object;
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
