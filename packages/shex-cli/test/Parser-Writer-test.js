//  "use strict";
const TEST_ShExR = "TEST_ShExR" in process.env ? JSON.parse(process.env["TEST_ShExR"]) : true;
const TEST_Vestiges = true;
const VERBOSE = "VERBOSE" in process.env;
const TESTS = "TESTS" in process.env ? process.env.TESTS.split(/,/) : null;
const EARL = "EARL" in process.env; // We're generating an EARL report.
const BASE = "http://a.example/application/base/";

const Fs = require("fs");
const ShExParser = require("@shexjs/parser");
const ShExUtil = require("@shexjs/util");
const ShExValidator = require("@shexjs/validator");
const ShExWriter = require("@shexjs/writer");
const N3 = require("n3");
const ShExNode = require("@shexjs/node")({
  rdfjs: N3,
});

const {assert, expect} = require("chai");
const findPath = require("./findPath.js");

const schemasPath = findPath("schemas");
const jsonSchemasPath = findPath("parsedSchemas");
const manifestFile = schemasPath + "manifest.jsonld";
const ShExRSchemaFile = findPath("doc") + "ShExR.shex";
const negativeTests = [
  {path: findPath("negativeSyntax"), include: "Parse error"},
  {path: findPath("negativeStructure"), include: "Structural error"}
];
const illDefinedTestsPath = findPath("illDefined");
const nsPath = "http://www.w3.org/ns/" // ShExUtil.SX._namespace has "shex#" at end

const parser = ShExParser.construct(BASE, null, {index: true});

const GraphSchema = loadGraphSchema();

// positive transformation tests
let schemas = parseJSONFile(manifestFile)["@graph"][0]["entries"];
if (TESTS)
  schemas = schemas.filter(function (t) { return TESTS.indexOf(t.name) !== -1; });

describe("A ShEx parser", function () {
  // const b = function () {  };
  // it("is a toy", function () {
  //   expect({a:1, b: b}).to.deep.equal({a:1, b: b});
  // });

  // Ensure the same blank node identifiers are used in every test
  beforeEach(function () { parser._resetBlanks(); });

  function expectError (f, match) {
    let error = null;
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
    const schema = test.name;
    const meta = {base: null, prefixes: null}

    const jsonSchemaFile = jsonSchemasPath + test.json;
    try {
      const abstractSyntax = JSON.parse(Fs.readFileSync(jsonSchemaFile, "utf8"));
      const shexCFile = schemasPath + test.shex;
      const shexRFile = schemasPath + test.ttl;

      it(EARL
         ? 'schemas/manifest\#' + test.name
         : "should correctly parse ShExC schema '" + shexCFile +
         "' as '" + jsonSchemaFile + "'." , function () {

           const schema = Fs.readFileSync(shexCFile, "utf8");
           if (VERBOSE) console.log("schema: [[\n" + schema + "\n]]");
           try {
             parser._setFileName(shexCFile);
             parser._setBase(BASE);
             const parsedSchema = parser.parse(schema);
             meta.base = parsedSchema._base;
             meta.prefixes = parsedSchema._prefixes;
             const canonParsed = ShExUtil.canonicalize(parsedSchema, BASE);
             const canonAbstractSyntax = ShExUtil.canonicalize(abstractSyntax);
             if (VERBOSE) console.log("parsed:" + JSON.stringify(canonParsed));
             if (VERBOSE) console.log("expected:" + JSON.stringify(canonAbstractSyntax));
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

           const shexR = Fs.readFileSync(shexRFile, "utf8");
           if (VERBOSE) console.log("\nShExR:", shexR);
           try {
             const schemaGraph = new N3.Store();
             schemaGraph.addQuads(new N3.Parser({baseIRI: BASE, blankNodePrefix: "", format: "text/turtle"}).parse(shexR));
             // console.log(schemaGraph.getQuads());
             const schemaDriver = ShExUtil.rdfjsDB(schemaGraph);
             const schemaRoot = schemaDriver.getQuads(null, ShExUtil.RDF.type, nsPath + "shex#Schema")[0].subject;
             parser._setFileName(ShExRSchemaFile);
             const graphParser = ShExValidator.construct(
               GraphSchema,
               schemaDriver,
               {  } // regexModule: require("@shexjs/eval-simple-1err") is no faster
             );
             const val = graphParser.validate(schemaRoot, ShExValidator.start); // start shape
             const parsedSchema = ShExUtil.canonicalize(ShExUtil.ShExJtoAS(ShExUtil.ShExRtoShExJ(ShExUtil.valuesToSchema(ShExUtil.valToValues(val)))));
             const canonParsed = ShExUtil.canonicalize(parsedSchema, BASE);
             const canonAbstractSyntax = ShExUtil.canonicalize(abstractSyntax);
             if (VERBOSE) console.log("transformed:" + JSON.stringify(parsedSchema));
             if (VERBOSE) console.log("expected:" + JSON.stringify(canonAbstractSyntax));
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
          let w;debugger
          new ShExWriter({simplifyParentheses: false, base: meta.base, prefixes: meta.prefixes}).
            writeSchema(abstractSyntax, function (error, text, prefixes) {
              if (error) throw error;
              else w = text;
            });
          if (VERBOSE) console.log("\nwritten: [[\n" + w + "\n]]");
          parser._setFileName(shexCFile + " (generated)");
          try {
            parser._setBase(BASE); // reset 'cause ShExR has a BASE directive.
            const parsed2 = parser.parse(w);
            if (VERBOSE) console.log("re-parsed:", JSON.stringify(parsed2));
            const canonParsed2 = ShExUtil.canonicalize(parsed2, BASE);
            const canonAbstractSyntax = ShExUtil.canonicalize(abstractSyntax);
            expect(canonParsed2).to.deep.equal(canonAbstractSyntax);
          } catch (e) {
            parser.reset();
            throw(e);
          }
        });

        it ("should write '" + jsonSchemaFile + "' with as few ()s as possible.", function () {
          let w;
          new ShExWriter({simplifyParentheses: true }).
            writeSchema(abstractSyntax, function (error, text, prefixes) {
              if (error) throw error;
              else w = text;
            });
          if (VERBOSE) console.log("\nsimple: [[\n" + w + "\n]]");
          parser._setFileName(shexCFile + " (simplified)");
          try {
            const parsed3 = parser.parse(w); // test that simplified also parses
          } catch (e) {
            parser.reset();
            throw(e);
          }
        });
      }
    } catch (e) {
      const e2 = Error("Error in (" + jsonSchemaFile + "): " + e.message);
      e2.stack = "Error in (" + jsonSchemaFile + "): " + e.stack;
      throw e2;
    }
  });


  // negative syntax and structure tests
  negativeTests.forEach(testSet => {
    const manifest = testSet.path + "manifest.jsonld";
    let negSchemas = parseJSONFile(manifest)["@graph"][0]["entries"];
    if (TESTS)
      negSchemas = negSchemas.filter(function (t) { return TESTS.indexOf(t.name) !== -1; });

    negSchemas.forEach(function (test) {
      const path = testSet.path + test.shex;
      let dir = testSet.path.replace(/\/$/, '');
      dir = dir.substr(dir.lastIndexOf('/')+1);

      it(EARL
         ? dir + '/manifest#' + test.name
         : "should not parse schema '" + path + "'", function (report) {
        if (VERBOSE) console.log(test.name);
        ShExNode.load([path], [], [], [], { parser: parser }, {}).
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
      const prefixes = { a: "http://a.example/abc#", b: "http://a.example/def#" };
      const parser = ShExParser.construct("http://a.example/", prefixes, {index: true});

      it("should use those prefixes", function () {
        const schema = "a:a { b:b .+ }";
        expect(parser.parse(schema)._index.shapeExprs["http://a.example/abc#a"].expression.predicate)
          .to.deep.equal("http://a.example/def#b");
      });

      ShExParser.construct(); // !!! horrible hack to reset no baseIRI
      // this is a serious bug affecting reentrancy -- need to figure out how to get _setBase into yy
    });
  }

  if (!EARL && (!TESTS || TESTS.indexOf("prefix") !== -1)) {
    describe("with pre-defined prefixes", function () {
      const prefixes = { a: "http://a.example/abc#", b: "http://a.example/def#" };
      const parser = ShExParser.construct("http://a.example/", prefixes, {index: true});

      it("should use those prefixes", function () {
        const schema = "a:a { b:b .+ }";
        expect(parser.parse(schema)._index.shapeExprs["http://a.example/abc#a"].expression.predicate)
          .to.deep.equal("http://a.example/def#b");
      });

      it("should allow temporarily overriding prefixes", function () {
        const schema = "PREFIX a: <http://a.example/xyz#> a:a { b:b .+ }";
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
      const prefixes = { a: "http://a.example/abc#", b: "http://a.example/def#" };
      const parser = ShExParser.construct("http://a.example/", prefixes, {index: true});

      it("should use those prefixes", function () {
        const schema = "a: { b: .+ }";
        expect(parser.parse(schema)._index.shapeExprs["http://a.example/abc#"].expression.predicate)
          .to.deep.equal("http://a.example/def#");
      });

      it("should allow temporarily overriding prefixes", function () {
        const schema = "PREFIX a: <http://a.example/xyz#> a: { b: .+ }";
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
      const path = schemasPath + test.shex;
      it("should load the same imports as ShExNode.load in '" + path + "'", function () {
        parser._setBase("file://"+path);
        return Promise.all([
          ShExNode.load(["file://"+path], [], [], [], { parser: parser, iriTransform: pickShEx }, {}),
          ShExNode.loadShExImports_NotUsed(path, parser, pickShEx)
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

function loadGraphSchema () {
  if (TEST_ShExR) {
    const ret = parser.parse(Fs.readFileSync(ShExRSchemaFile, "utf8"));

    // @@ What the heck is this for?
    const valueExpr_tripleCnstrnt = ret._index.shapeExprs[nsPath + "TripleConstraint"].
          expression.expressions.find(e => {
            return e.predicate === nsPath + "shex#valueExpr";
          });
    valueExpr_tripleCnstrnt.valueExpr = { type: "ShapeOr",
                                          shapeExprs:
                                          [ nsPath + "shapeExpr",
                                            { type: "Shape", closed: true } ] }

    return ret;
  } else {
    console.warn("ShExR tests disabled");
    return null;
  }
}

// Parses a JSON object, restoring `undefined` values
function parseJSONFile(filename, mapFunction) {
  "use strict";
  try {
    const string = Fs.readFileSync(filename, "utf8");
    const object = JSON.parse(string);
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
  for (const key in object) {
    const item = object[key];
    if (typeof item === "object") {
      object[key] = restoreUndefined(item);
    } else if (item === "{undefined}") {
      object[key] = undefined;
    }
  }
  return object;
}

