//  "use strict";
var SLOW = "SLOW" in process.env; // Only run these tests if SLOW is set. SLOW=4000 to set per-test timeout to 4s.
var VERBOSE = "VERBOSE" in process.env;
var TESTS = "TESTS" in process.env ? process.env.TESTS.split(/,/) : null;
var EARL = "EARL" in process.env; // We're generation an EARL report.
var BASE = "http://a.example/application/base/";

var ShExParser = require("../lib/ShExParser");
var ShExWriter = require("../lib/ShExWriter");
var ShExUtil = require("../lib/ShExUtil");
var ShExValidator = require("../lib/ShExValidator");

var N3 = require("n3");

var fs = require("fs");
var expect = require("chai").expect;
var findPath = require("./findPath.js");

var schemasPath = findPath("schemas");
var jsonSchemasPath = findPath("parsedSchemas");
var ShExRSchemaFile = findPath("doc") + "ShExR.shex";
var negativeTests = [
  {path: findPath("negativeSyntax"), include: "Parse error"},
  {path: findPath("negativeStructure"), include: "Structural error"}
];
var illDefinedTestsPath = findPath("illDefined");

if (!SLOW)
  console.warn("\nSkipping ShExR tests; to activate these tests, set environment variable SLOW=6000!");

describe("A ShEx parser", function () {
  // var b = function () {  };
  // it("is a toy", function () {
  //   expect({a:1, b: b}).to.deep.equal({a:1, b: b});
  // });

  var parser = ShExParser.construct(BASE);

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
    try {
      var abstractSyntax = ShExUtil.ShExJtoAS(JSON.parse(fs.readFileSync(jsonSchemaFile, "utf8")));
      var shexCFile = schemasPath + schema + ".shex";
      var shexRFile = schemasPath + schema + ".ttl";

      it("should correctly parse ShExC schema '" + shexCFile +
         "' as '" + jsonSchemaFile + "'." , function () {

           if (VERBOSE) console.log(schema);
           var schema = fs.readFileSync(shexCFile, "utf8");
           try {
             parser._setFileName(shexCFile);
             var parsedSchema = parser.parse(schema);
             var canonParsed = ShExUtil.canonicalize(parsedSchema, BASE);
             var canonAbstractSyntax = ShExUtil.canonicalize(abstractSyntax);
             if (VERBOSE) console.log("parsed   :" + JSON.stringify(canonParsed));
             if (VERBOSE) console.log("expected :" + JSON.stringify(canonAbstractSyntax));
             expect(canonParsed).to.deep.equal(canonAbstractSyntax);
           } catch (e) {
             parser.reset();
             throw(e);
           }
         });

    if (SLOW) {
      var graphSchema = parser.parse(fs.readFileSync(ShExRSchemaFile, "utf8"));
      var GraphParser = ShExValidator.construct(
        graphSchema,
        {  } // regexModule: require("../lib/regex/nfax-val-1err") is no faster
      );
      it("should correctly parse ShExR schema '" + shexRFile +
         "' as '" + jsonSchemaFile + "'." , function () {

           if (VERBOSE) console.log(schema);
           var schema = fs.readFileSync(shexRFile, "utf8");
           try {
             var schemaGraph = N3.Store();
             schemaGraph.addTriples(N3.Parser({documentIRI:shexRFile, blankNodePrefix: "", format: "text/turtle"}).parse(schema));
             // console.log(schemaGraph.getTriples());
             var schemaRoot = schemaGraph.getTriples(null, ShExUtil.RDF.type, "http://www.w3.org/ns/shex#Schema")[0].subject;
             parser._setFileName(ShExRSchemaFile);
             var val = GraphParser.validate(schemaGraph, schemaRoot); // start shape
             var parsedSchema = ShExUtil.canonicalize(ShExUtil.ShExJtoAS(ShExUtil.ShExRtoShExJ(ShExUtil.valuesToSchema(ShExUtil.valToValues(val)))));
             var canonAbstractSyntax = ShExUtil.canonicalize(abstractSyntax);
             if (VERBOSE) console.log("transformed:" + JSON.stringify(parsedSchema));
             if (VERBOSE) console.log("expected   :" + JSON.stringify(canonAbstractSyntax));
             expect(parsedSchema).to.deep.equal(canonAbstractSyntax);
           } catch (e) {
             parser.reset();
             throw(e);
           }
         });
    }

      if (!EARL) {
        it("should duplicate '" + jsonSchemaFile + "' and produce the same structure.", function () {
          expect(ShExUtil.Visitor().visitSchema(abstractSyntax)).to.deep.equal(abstractSyntax);
        });

        it("should write '" + jsonSchemaFile + "' and parse to the same structure.", function () {
          var w;
          new ShExWriter({simplifyParentheses: false }).
            writeSchema(abstractSyntax, function (error, text, prefixes) {
              if (error) throw error;
              else w = text;
            });
          if (VERBOSE) console.log("written  :" + w);
          parser._setFileName(shexCFile + " (generated)");
          try {
            var parsed2 = ShExUtil.canonicalize(parser.parse(w), BASE);
            var canonAbstractSyntax = ShExUtil.canonicalize(abstractSyntax);
            expect(parsed2).to.deep.equal(canonAbstractSyntax);
          } catch (e) {
            parser.reset();
            throw(e);
          }
        });

        it ("should write '" + jsonSchemaFile + "' with as few ()s as possible.", function () {
          var w;
          new ShExWriter({simplifyParentheses: true }).
            writeSchema(abstractSyntax, function (error, text, prefixes) {
              if (error) throw error;
              else w = text;
            });
          if (VERBOSE) console.log("simple   :" + w);
          parser._setFileName(shexCFile + " (simplified)");
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

