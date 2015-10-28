//  "use strict";
var VERBOSE = "VERBOSE" in process.env;
var TESTS = "TESTS" in process.env ? process.env.TESTS.split(/,/) : null;

var ShExParser = require("../lib/ShExParser").Parser;
var ShExWriter = require("../lib/ShExWriter");

var fs = require("fs");
var expect = require("chai").expect;
var findPath = require("./findPath.js");

var schemasPath = findPath("schemas");
var jsonSchemasPath = findPath("parsedSchemas");
var negSyntaxTestsPath = findPath("negativeSyntax");
var illDefinedTestsPath = findPath("illDefined");

describe("A ShEx parser", function () {
  // var b = function () {  };
  // it("is a toy", function () {
  //   expect({a:1, b: b}).to.deep.equal({a:1, b: b});
  // });

  var parser = new ShExParser();

  // Ensure the same blank node identifiers are used in every test
  beforeEach(function () { parser._resetBlanks(); });


  if (!TESTS)
    // make sure errors are reported
    it("should throw an error on an invalid schema", function () {
      var schema = "invalid", error = null;
      try { parser.parse(schema); }
      catch (e) { error = e; }

      expect(error).to.exist;
      expect(error).to.be.an.instanceof(Error);
      expect(error.message).to.include("Parse error on line 1");
    });


  // positive transformation tests
  var schemas = fs.readdirSync(schemasPath);
  schemas = schemas.map(function (s) { return s.replace(/\.shex$/, ""); });
  if (TESTS)
    schemas = schemas.filter(function (s) { return TESTS.indexOf(s) !== -1; });
  schemas.sort();

  schemas.forEach(function (schema) {

    var jsonSchemaFile = jsonSchemasPath + schema + ".json";
    if (!fs.existsSync(jsonSchemaFile)) return;
    var shexSchemaFile = schemasPath + schema + ".shex"
    var jsonSchema = parseJSON(fs.readFileSync(jsonSchemaFile, "utf8"));

    it("should correctly parse schema '" + shexSchemaFile +
       "' as '" + jsonSchemaFile + "'." , function () {

      if (VERBOSE) console.log(schema);
      schema = fs.readFileSync(shexSchemaFile, "utf8");
      try {
      parser._setFileName(shexSchemaFile);
      var parsedSchema = parser.parse(schema);
      if (VERBOSE) console.log("parsed   :" + JSON.stringify(parsedSchema));
      if (VERBOSE) console.log("expected :" + JSON.stringify(jsonSchema));
      expect(parsedSchema).to.deep.equal(jsonSchema);
      } catch (e) {
        parser.reset();
        throw(e);
      }
    });

    it("should write '" + jsonSchemaFile + "' and parse to the same strcuture.", function () {
      var w;
      new ShExWriter({simplifyParentheses: false }).
        writeSchema(jsonSchema, function (error, text, prefixes) {
          if (error) throw error;
          else w = text;
        });
      if (VERBOSE) console.log("written  :" + w);
      parser._setFileName(shexSchemaFile + " (generated)");
      try {
      var parsed2 = parser.parse(w);
      expect(parsed2).to.deep.equal(jsonSchema);
      } catch (e) {
        parser.reset();
        throw(e);
      }
    });

    it ("should write '" + jsonSchemaFile + "' with as few ()s as possible.", function () {
      var w;
      new ShExWriter({simplifyParentheses: true }).
        writeSchema(jsonSchema, function (error, text, prefixes) {
          if (error) throw error;
          else w = text;
        });
      if (VERBOSE) console.log("simple   :" + w);
      parser._setFileName(shexSchemaFile + " (simplified)");
      try {
      var parsed3 = parser.parse(w); // test that simplified also parses
      } catch (e) {
        parser.reset();
        throw(e);
      }
    });
  });


  // negative syntax tests
  var negSyntaxTests = fs.readdirSync(negSyntaxTestsPath);
  negSyntaxTests = negSyntaxTests.map(function (q) { return q.replace(/\.err$/, ""); });
  if (TESTS)
    negSyntaxTests = negSyntaxTests.filter(function (s) { return TESTS.indexOf(s) !== -1; });
  negSyntaxTests.sort();

  negSyntaxTests.forEach(function (schemaFile) {
    var path = negSyntaxTestsPath + schemaFile + ".err";
    it("should not parse schema '" + path + "'", function () {
      if (VERBOSE) console.log(schemaFile);
      var schemaText = fs.readFileSync(path, "utf8");
      var error = null, schema = null;
      try {
        schema = parser.parse(schemaText)
        // console.warn(JSON.stringify(schema));
      }
      catch (e) {
        error = e;
        // console.warn(e);
      }
      
      expect(error).to.exist;
      expect(error).to.be.an.instanceof(Error);
      expect(error.message).to.include("Parse error");
    });
  });


  // ill-defined tests
  var illDefinedTests = fs.readdirSync(illDefinedTestsPath);
  illDefinedTests = illDefinedTests.map(function (q) { return q.replace(/\.err$/, ""); });
  if (TESTS)
    illDefinedTests = illDefinedTests.filter(function (s) { return TESTS.indexOf(s) !== -1; });
  illDefinedTests.sort();

  illDefinedTests.forEach(function (schemaFile) {
    var path = illDefinedTestsPath + schemaFile + ".err";
    it("should not accept schema '" + path + "'", function () {
      if (VERBOSE) console.log(schemaFile);
      var schemaText = fs.readFileSync(path, "utf8");
      var error = null, schema = null;
      try {
        schema = parser.parse(schemaText)
        // console.warn(JSON.stringify(schema));
      }
      catch (e) {
        error = e;
        // console.warn(e);
      }

      expect(error).to.exist;
      expect(error).to.be.an.instanceof(Error);
      expect(error.message).to.include("Structural error");
    });
  });


  if (!TESTS || TESTS.indexOf("prefix") !== -1) {
    describe("with pre-defined prefixes", function () {
      var prefixes = { a: "abc#", b: "def#" };
      var parser = new ShExParser("http://a.example/", prefixes);

      it("should use those prefixes", function () {
        var schema = "a:a { b:b .+ }";
        expect(parser.parse(schema).shapes["http://a.example/abc#a"].expression.predicate)
          .to.deep.equal("http://a.example/def#b");
      });

      it("should allow temporarily overriding prefixes", function () {
        var schema = "PREFIX a: <xyz#> a:a { b:b .+ }";
        expect(parser.parse(schema).shapes["http://a.example/xyz#a"].expression.predicate)
          .to.deep.equal("http://a.example/def#b");
        expect(parser.parse("a:a { b:b .+ }").shapes["http://a.example/abc#a"].expression.predicate)
          .to.deep.equal("http://a.example/def#b");
      });

      it("should not change the original prefixes", function () {
        expect(prefixes).to.deep.equal({ a: "abc#", b: "def#" });
      });

      it("should not take over changes to the original prefixes", function () {
        prefixes.a = "xyz#";
        expect(parser.parse("a:a { b:b .+ }").shapes["http://a.example/abc#a"].expression.predicate)
          .to.deep.equal("http://a.example/def#b");
      });
    });

    describe("with pre-defined PNAME_NS prefixes", function () {
      var prefixes = { a: "abc#", b: "def#" };
      var parser = new ShExParser("http://a.example/", prefixes);

      it("should use those prefixes", function () {
        var schema = "a: { b: .+ }";
        expect(parser.parse(schema).shapes["http://a.example/abc#"].expression.predicate)
          .to.deep.equal("http://a.example/def#");
      });

      it("should allow temporarily overriding prefixes", function () {
        var schema = "PREFIX a: <xyz#> a: { b: .+ }";
        expect(parser.parse(schema).shapes["http://a.example/xyz#"].expression.predicate)
          .to.deep.equal("http://a.example/def#");
        expect(parser.parse("a: { b: .+ }").shapes["http://a.example/abc#"].expression.predicate)
          .to.deep.equal("http://a.example/def#");
      });

    });
  }
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
