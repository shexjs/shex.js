//  "use strict";
const TEST_ShExR = "TEST_ShExR" in process.env ? JSON.parse(process.env["TEST_ShExR"]) : true;
const TEST_Vestiges = true;
var VERBOSE = "VERBOSE" in process.env;
var TESTS = "TESTS" in process.env ? process.env.TESTS.split(/,/) : null;
var EARL = "EARL" in process.env; // We're generating an EARL report.
var BASE = "http://a.example/application/base/";

var ShExCore = require("@shexjs/core");
var ShExParser = require("@shexjs/parser");
var ShExLoader = require("@shexjs/loader");
var ShExWriter = ShExCore.Writer;
var ShExUtil = ShExCore.Util;
var ShExValidator = ShExCore.Validator;

var N3 = require("n3");

var fs = require("fs");
var {assert, expect} = require("chai");
var findPath = require("./findPath.js");

var schemasPath = findPath("schemas");
var jsonSchemasPath = findPath("parsedSchemas");
var manifestFile = schemasPath + "manifest.jsonld";
var ShExRSchemaFile = findPath("doc") + "ShExR.shex";
var negativeTests = [
  {path: findPath("negativeSyntax"), include: "Parse error"},
  {path: findPath("negativeStructure"), include: "Structural error"}
];
var illDefinedTestsPath = findPath("illDefined");

var parser = ShExParser.construct(BASE, null, {index: true});

if (TEST_ShExR) {
  var GraphSchema = parser.parse(fs.readFileSync(ShExRSchemaFile, "utf8"));
  var nsPath = "http://www.w3.org/ns/" // ShExUtil.SX._namespace has "shex#" at end
  var valueExpr_tripleCnstrnt = GraphSchema._index.shapeExprs[nsPath + "TripleConstraint"].
      expression.expressions.find(e => {
        return e.predicate === nsPath + "shex#valueExpr";
      });
  valueExpr_tripleCnstrnt.valueExpr = { type: "ShapeOr",
                                        shapeExprs:
                                        [ nsPath + "shapeExpr",
                                          { type: "Shape", closed: true } ] }
} else {
  console.warn("ShExR tests disabled");
}

// positive transformation tests
var schemas = parseJSONFile(manifestFile)["@graph"][0]["entries"];
if (TESTS)
  schemas = schemas.filter(function (t) { return TESTS.indexOf(t.name) !== -1; });

describe("A ShEx parser", function () {
  // var b = function () {  };
  // it("is a toy", function () {
  //   expect({a:1, b: b}).to.deep.equal({a:1, b: b});
  // });

  // Ensure the same blank node identifiers are used in every test
  beforeEach(function () { parser._resetBlanks(); });

  function expectError (f, match) {
    var error = null;
    try {
      f();
    } catch (e) {
      error = e;
    }
    assert(error, "should have thrown an Error");
    expect(error).to.be.an.instanceof(Error);
    expect(error.message).to.include(match);
  }

  if (!EARL && !TESTS) {
    // make sure errors are reported
    it("should throw an error on an invalid schema", function () {
      expectError(() => { parser.parse("this is an invalid ShEx schema"); },
                  "Parse error on line 1");
    });

    it("should throw an error on schema with \"nested\": in Shape", function () {
      expectError(() => {
        ShExUtil.Visitor().visitSchema({
          "type": "Schema",
          "shapes": [
            { "id": "http://ex.example/S",
              "type": "Shape",
              "nested": true
            }
          ]
        });
      }, "unknown property: \"nested\"");
    });

    it("should throw an error on schema with \"nested\": in ShapeNot", function () {
      expectError(() => {
        ShExUtil.Visitor().visitSchema({
          "type": "Schema",
          "shapes": [
            { "id": "http://ex.example/S",
              "type": "ShapeNot",
              "nested": true,
              "shapeExpr": {
                "type": "NodeConstraint",
                "nodeKind": "iri"
              }
            }
          ]
        });
      }, "unknown property: \"nested\"");
    });

    it("should throw an error on schema with \"nested\": in ShapeRef", function () {
      expectError(() => {
        ShExUtil.Visitor().visitSchema({
          "type": "Schema",
          "shapes": [
            { "id": "http://ex.example/S",
              "type": "ShapeNot",
              "shapeExpr": {
                "type": "NodeConstraint",
                "nested": true,
                "nodeKind": "iri"
              }
            }
          ]
        });
      }, "unknown property: \"nested\"");
    });

    it("should throw an error on schema with \"nested\": in ShapeAnd", function () {
      expectError(() => {
        ShExUtil.Visitor().visitSchema({
          "type": "Schema",
          "shapes": [
            { "id": "http://ex.example/S",
              "type": "ShapeAnd",
              "shapeExprs": [
                {
                  "type": "ShapeNot",
                  "shapeExpr": "http://ex.example/S",
                  "nested": true
                },
                "http://ex.example/S"
              ]
            }
          ]
        });
      }, "unknown property: \"nested\"");
    });
  }

  schemas.forEach(function (test) {
    var schema = test.name;

    var jsonSchemaFile = jsonSchemasPath + test.json;
    try {
      var abstractSyntax = JSON.parse(fs.readFileSync(jsonSchemaFile, "utf8"));
      var shexCFile = schemasPath + test.shex;
      var shexRFile = schemasPath + test.ttl;

      it(EARL
         ? 'schemas/manifest\#' + test.name
         : "should correctly parse ShExC schema '" + shexCFile +
         "' as '" + jsonSchemaFile + "'." , function () {

           if (VERBOSE) console.log(schema);
           var schema = fs.readFileSync(shexCFile, "utf8");
           try {
             parser._setFileName(shexCFile);
             parser._setBase(BASE);
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

    if (TEST_ShExR && !EARL) {
      it(EARL
         ? 'schemas/manifest\#' + test.name
         : "should correctly parse ShExR schema '" + shexRFile +
         "' as '" + jsonSchemaFile + "'." , function () {

           if (VERBOSE) console.log(schema);
           var schema = fs.readFileSync(shexRFile, "utf8");
           try {
             var schemaGraph = new N3.Store();
             schemaGraph.addQuads(new N3.Parser({baseIRI: BASE, blankNodePrefix: "", format: "text/turtle"}).parse(schema));
             // console.log(schemaGraph.getQuads());
             var schemaDriver = ShExUtil.makeN3DB(schemaGraph);
             var schemaRoot = schemaDriver.getQuads(null, ShExUtil.RDF.type, nsPath + "shex#Schema")[0].subject;
             parser._setFileName(ShExRSchemaFile);
             var graphParser = ShExValidator.construct(
               GraphSchema,
               {  } // regexModule: require("../lib/regex/nfax-val-1err") is no faster
             );
             var val = graphParser.validate(schemaDriver, schemaRoot, ShExValidator.start); // start shape
             var parsedSchema = ShExUtil.canonicalize(ShExUtil.ShExJtoAS(ShExUtil.ShExRtoShExJ(ShExUtil.valuesToSchema(ShExUtil.valToValues(val)))));
             var canonParsed = ShExUtil.canonicalize(parsedSchema, BASE);
             var canonAbstractSyntax = ShExUtil.canonicalize(abstractSyntax);
             if (VERBOSE) console.log("transformed:" + JSON.stringify(parsedSchema));
             if (VERBOSE) console.log("expected   :" + JSON.stringify(canonAbstractSyntax));
             // The order of nesting affects productions so don't look at them.
             delete canonParsed.productions;
             delete canonAbstractSyntax.productions;
             expect(canonParsed).to.deep.equal(canonAbstractSyntax);
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
            parser._setBase(BASE); // reset 'cause ShExR has a BASE directive.
            var parsed2 = parser.parse(w);
            var canonParsed2 = ShExUtil.canonicalize(parsed2, BASE);
            var canonAbstractSyntax = ShExUtil.canonicalize(abstractSyntax);
            expect(canonParsed2).to.deep.equal(canonAbstractSyntax);
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


  // negative syntax and structure tests
  negativeTests.forEach(testSet => {
    var manifest = testSet.path + "manifest.jsonld";
    var negSchemas = parseJSONFile(manifest)["@graph"][0]["entries"];
    if (TESTS)
      negSchemas = negSchemas.filter(function (t) { return TESTS.indexOf(t.name) !== -1; });

    negSchemas.forEach(function (test) {
      var path = testSet.path + test.shex;
      var dir = testSet.path.replace(/\/$/, '');
      dir = dir.substr(dir.lastIndexOf('/')+1);

      it(EARL
         ? dir + '/manifest#' + test.name
         : "should not parse schema '" + path + "'", function (report) {
        if (VERBOSE) console.log(test.name);
        ShExLoader.load([path], [], [], [], { parser: parser }, {}).
          then(function (loaded) {
            report(Error("Expected " + path + " to fail with " + testSet.include));
          }).
          catch(function (error) {
            try {
              expect(error).to.exist;
              expect(error).to.be.an.instanceof(Error);
              expect(error.message).to.include(testSet.include);
              if ("startRow" in test) {
                expect("location" in error).to.be.true;
                let x = " ../shexTest/negativeSyntax/" + test.shex;
                if (false && // for debugging and building tests
                    (!(error.location.first_line === test.startRow
                       ? error.location.first_column + 1 >= test.startColumn
                       : error.location.first_line > test.startRow) ||
                     !(error.location.last_line === test.endRow
                       ? error.location.last_column <= test.endColumn
                       : error.location.last_line < test.endRow)))
                  console.log(x, error.location, error.message)
                expect(error.location.first_line === test.startRow
                       ? error.location.first_column + 1 >= test.startColumn
                       : error.location.first_line > test.startRow).to.be.true;
                expect(error.location.last_line === test.endRow
                       ? error.location.last_column <= test.endColumn
                       : error.location.last_line < test.endRow).to.be.true;
              }
              report();
            } catch (e) {
              report(e);
            }
          });
      });
    });
  });


  if (!EARL && (!TESTS || TESTS.indexOf("prefix") !== -1)) {
    describe("with indexing", function () {
      var prefixes = { a: "http://a.example/abc#", b: "http://a.example/def#" };
      var parser = ShExParser.construct("http://a.example/", prefixes, {index: true});

      it("should use those prefixes", function () {
        var schema = "a:a { b:b .+ }";
        expect(parser.parse(schema)._index.shapeExprs["http://a.example/abc#a"].expression.predicate)
          .to.deep.equal("http://a.example/def#b");
      });

      ShExParser.construct(); // !!! horrible hack to reset no baseIRI
      // this is a serious bug affecting reentrancy -- need to figure out how to get _setBase into yy
    });
  }

  if (!EARL && (!TESTS || TESTS.indexOf("prefix") !== -1)) {
    describe("with pre-defined prefixes", function () {
      var prefixes = { a: "http://a.example/abc#", b: "http://a.example/def#" };
      var parser = ShExParser.construct("http://a.example/", prefixes, {index: true});

      it("should use those prefixes", function () {
        var schema = "a:a { b:b .+ }";
        expect(parser.parse(schema)._index.shapeExprs["http://a.example/abc#a"].expression.predicate)
          .to.deep.equal("http://a.example/def#b");
      });

      it("should allow temporarily overriding prefixes", function () {
        var schema = "PREFIX a: <http://a.example/xyz#> a:a { b:b .+ }";
        expect(parser.parse(schema)._index.shapeExprs["http://a.example/xyz#a"].expression.predicate)
          .to.deep.equal("http://a.example/def#b");
        expect(parser.parse("a:a { b:b .+ }")._index.shapeExprs["http://a.example/abc#a"].expression.predicate)
          .to.deep.equal("http://a.example/def#b");
      });

      it("should not change the original prefixes", function () {
        expect(prefixes).to.deep.equal({ a: "http://a.example/abc#", b: "http://a.example/def#" });
      });

      it("should not take over changes to the original prefixes", function () {
        prefixes.a = "http://a.example/xyz#";
        expect(parser.parse("a:a { b:b .+ }")._index.shapeExprs["http://a.example/abc#a"].expression.predicate)
          .to.deep.equal("http://a.example/def#b");
      });

      ShExParser.construct(); // !!! horrible hack to reset no baseIRI
      // this is a serious bug affecting reentrancy -- need to figure out how to get _setBase into yy
    });

    describe("with pre-defined PNAME_NS prefixes", function () {
      var prefixes = { a: "http://a.example/abc#", b: "http://a.example/def#" };
      var parser = ShExParser.construct("http://a.example/", prefixes, {index: true});

      it("should use those prefixes", function () {
        var schema = "a: { b: .+ }";
        expect(parser.parse(schema)._index.shapeExprs["http://a.example/abc#"].expression.predicate)
          .to.deep.equal("http://a.example/def#");
      });

      it("should allow temporarily overriding prefixes", function () {
        var schema = "PREFIX a: <http://a.example/xyz#> a: { b: .+ }";
        expect(parser.parse(schema)._index.shapeExprs["http://a.example/xyz#"].expression.predicate)
          .to.deep.equal("http://a.example/def#");
        expect(parser.parse("a: { b: .+ }")._index.shapeExprs["http://a.example/abc#"].expression.predicate)
          .to.deep.equal("http://a.example/def#");
      });

      ShExParser.construct(); // !!! horrible hack to reset no baseIRI
      // this is a serious bug affecting reentrancy -- need to figure out how to get _setBase into yy
    });
  }
});

if (!EARL && TEST_Vestiges) {
  /* Make sure loadShExImports_NotUsed doesn't rot before we decide whether we
   * want it in the API.
   */
  describe("loadShExImports_NotUsed", function () {
    schemas.filter(test => {
      return "trait" in test && test.trait.indexOf("Import") !== -1;
    }).filter(t => {
      return true;
    }).forEach(test => {
      var path = schemasPath + test.shex;
      it("should load the same imports as ShExLoader.load in '" + path + "'", function () {
        parser._setBase("file://"+path);
        return Promise.all([
          ShExLoader.load(["file://"+path], [], [], [], { parser: parser, iriTransform: pickShEx }, {}),
          ShExLoader.loadShExImports_NotUsed(path, parser, pickShEx)
        ]).then(function (loadedAndSchema) {
          expect(ShExUtil.canonicalize(loadedAndSchema[0].schema, BASE)).to.deep.equal(ShExUtil.canonicalize(loadedAndSchema[1], BASE));
        });
        function pickShEx (i) {
          return i + ".shex";
        }
      });
    });
  });
}

// Parses a JSON object, restoring `undefined` values
function parseJSONFile(filename, mapFunction) {
  "use strict";
  try {
    var string = fs.readFileSync(filename, "utf8");
    var object = JSON.parse(string);
    function resolveRelativeURLs (obj) {
      Object.keys(obj).forEach(function (k) {
        if (typeof obj[k] === "object") {
          resolveRelativeURLs(obj[k]);
        }
        if (mapFunction) {
          mapFunction(k, obj);
        }
      });
    }
    resolveRelativeURLs(object);
    return /"\{undefined\}"/.test(string) ? restoreUndefined(object) : object;
  } catch (e) {
    throw new Error("error reading " + filename +
                    ": " + ("stack" in e ? e.stack : e));
  }
}

// Not sure this is needed when everything's working but I have hunch it makes
// error handling a little more graceful.

// Stolen from Ruben Verborgh's SPARQL.js tests:
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

