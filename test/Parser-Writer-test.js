//  "use strict";
var VERBOSE = "VERBOSE" in process.env;
var TESTS = "TESTS" in process.env ? process.env.TESTS.split(/,/) : null;
var EARL = "EARL" in process.env; // We're generation an EARL report.

var ShExParser = require("../lib/ShExParser");
var ShExWriter = require("../lib/ShExWriter");
var ShExUtil = require("../lib/ShExUtil");

var fs = require("fs");
var expect = require("chai").expect;
var findPath = require("./findPath.js");

var schemasPath = findPath("schemas");
var jsonSchemasPath = findPath("parsedSchemas");
var negativeTests = [
  {path: findPath("negativeSyntax"), include: "Parse error"},
  {path: findPath("negativeStructure"), include: "Structural error"}
];
var illDefinedTestsPath = findPath("illDefined");

describe("A ShEx parser", function () {
  // var b = function () {  };
  // it("is a toy", function () {
  //   expect({a:1, b: b}).to.deep.equal({a:1, b: b});
  // });

  var parser = ShExParser.construct();

  // Ensure the same blank node identifiers are used in every test
  beforeEach(function () { parser._resetBlanks(); });


  if (!EARL && !TESTS)
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
  var schemas = fs.
    readdirSync(schemasPath).
    filter(function (s) { return s.indexOf(".shex") !== -1; }).
    map(function (s) { return s.replace(/\.shex$/, ""); });
  if (TESTS)
    schemas = schemas.filter(function (s) { return TESTS.indexOf(s) !== -1; });
  schemas.sort();

  schemas.forEach(function (schema) {

    var jsonSchemaFile = jsonSchemasPath + schema + ".json";
    if (!fs.existsSync(jsonSchemaFile)) return;
    var shexSchemaFile = schemasPath + schema + ".shex";
    try {
      var jsonSchema = parseShExJ(fs.readFileSync(jsonSchemaFile, "utf8"));

      it("should correctly parse schema '" + shexSchemaFile +
         "' as '" + jsonSchemaFile + "'." , function () {

           if (VERBOSE) console.log(schema);
           schema = fs.readFileSync(shexSchemaFile, "utf8");
           try {
             parser._setFileName(shexSchemaFile);
             var parsedSchema = parser.parse(schema);
             var trimmedSchema = Object.assign({}, parsedSchema);
             delete trimmedSchema.prefixes;
             delete trimmedSchema.base;
             if (VERBOSE) console.log("parsed   :" + JSON.stringify(trimmedSchema));
             if (VERBOSE) console.log("expected :" + JSON.stringify(jsonSchema));
             expect(trimmedSchema).to.deep.equal(jsonSchema);
           } catch (e) {
             parser.reset();
             throw(e);
           }
         });

      if (!EARL) {
        it("should duplicate '" + jsonSchemaFile + "' and produce the same structure.", function () {
          expect(ShExUtil.Visitor().visitSchema(jsonSchema)).to.deep.equal(jsonSchema);
        });

        it("should write '" + jsonSchemaFile + "' and parse to the same structure.", function () {
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
      }
    } catch (e) {
      var e2 = Error("Error in (" + jsonSchemaFile + "): " + e.message);
      e2.stack = "Error in (" + jsonSchemaFile + "): " + e.stack;
      throw e2;
    }
  });


  negativeTests.forEach(testSet => {
    // negative syntax tests
    var negSyntaxTests = fs.readdirSync(testSet.path).
        filter(function (s) { return s.indexOf(".shex") !== -1; });
    if (TESTS)
      negSyntaxTests = negSyntaxTests.filter(function (s) {
        return TESTS.indexOf(s) !== -1 ||
          TESTS.indexOf(s.replace(/\.shex$/, "")) !== -1 ||
          TESTS.indexOf(s.replace(/\.json$/, "")) !== -1;
      });
    negSyntaxTests.sort();

    negSyntaxTests.forEach(function (schemaFile) {
      var path = testSet.path + schemaFile;
      it("should not parse schema '" + path + "'", function () {
        if (VERBOSE) console.log(schemaFile);
        var schemaText = fs.readFileSync(path, "utf8");
        var error = null, schema = null;
        try {debugger;
             schema =
             schemaFile.match(/\.shex$/) ? parser.parse(schemaText) :
             ShExUtil.validateSchema(JSON.parse(schemaText));
             // console.warn(JSON.stringify(schema));
            }
        catch (e) {
          error = e;
          // console.warn(e);
        }
        
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Error);
        expect(error.message).to.include(testSet.include);
      });
    });
  });


  if (!EARL && (!TESTS || TESTS.indexOf("prefix") !== -1)) {
    describe("with pre-defined prefixes", function () {
      var prefixes = { a: "http://a.example/abc#", b: "http://a.example/def#" };
      var parser = ShExParser.construct("http://a.example/", prefixes);

      it("should use those prefixes", function () {
        var schema = "a:a { b:b .+ }";
        expect(parser.parse(schema).shapes["http://a.example/abc#a"].expression.predicate)
          .to.deep.equal("http://a.example/def#b");
      });

      it("should allow temporarily overriding prefixes", function () {
        var schema = "PREFIX a: <http://a.example/xyz#> a:a { b:b .+ }";
        expect(parser.parse(schema).shapes["http://a.example/xyz#a"].expression.predicate)
          .to.deep.equal("http://a.example/def#b");
        expect(parser.parse("a:a { b:b .+ }").shapes["http://a.example/abc#a"].expression.predicate)
          .to.deep.equal("http://a.example/def#b");
      });

      it("should not change the original prefixes", function () {
        expect(prefixes).to.deep.equal({ a: "http://a.example/abc#", b: "http://a.example/def#" });
      });

      it("should not take over changes to the original prefixes", function () {
        prefixes.a = "http://a.example/xyz#";
        expect(parser.parse("a:a { b:b .+ }").shapes["http://a.example/abc#a"].expression.predicate)
          .to.deep.equal("http://a.example/def#b");
      });

      ShExParser.construct(); // !!! horrible hack to reset no documentIRI
      // this is a serious bug affecting reentrancy -- need to figure out how to get _setBase into yy
    });

    describe("with pre-defined PNAME_NS prefixes", function () {
      var prefixes = { a: "http://a.example/abc#", b: "http://a.example/def#" };
      var parser = ShExParser.construct("http://a.example/", prefixes);

      it("should use those prefixes", function () {
        var schema = "a: { b: .+ }";
        expect(parser.parse(schema).shapes["http://a.example/abc#"].expression.predicate)
          .to.deep.equal("http://a.example/def#");
      });

      it("should allow temporarily overriding prefixes", function () {
        var schema = "PREFIX a: <http://a.example/xyz#> a: { b: .+ }";
        expect(parser.parse(schema).shapes["http://a.example/xyz#"].expression.predicate)
          .to.deep.equal("http://a.example/def#");
        expect(parser.parse("a: { b: .+ }").shapes["http://a.example/abc#"].expression.predicate)
          .to.deep.equal("http://a.example/def#");
      });

      ShExParser.construct(); // !!! horrible hack to reset no documentIRI
      // this is a serious bug affecting reentrancy -- need to figure out how to get _setBase into yy
    });
  }
});

function parseShExJ (schemaText) {
  var schema = JSON.parse(schemaText);
  delete schema["@context"];
  if ("shapes" in schema) {
    var newShapes = {}
    schema.shapes.forEach(sh => {
      var label = sh.label;
      delete sh.label;
      newShapes[label] = sh;
    });
    schema.shapes = newShapes;
  }
  return schema;
}

