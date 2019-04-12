//  "use strict";
var VERBOSE = "VERBOSE" in process.env;
var TERSE = VERBOSE;
var TESTS = "TESTS" in process.env ? process.env.TESTS.split(/,/) : null;
var EARL = "EARL" in process.env;

var ShExCore = require("@shexjs/core");
var ShExParser = require("@shexjs/parser");
var ShExLoader = require("@shexjs/loader");
var ShExUtil = ShExCore.Util;
var ShExValidator = ShExCore.Validator;
var TestExtension = require("@shexjs/extension-test")

var N3 = require("n3");
var N3Util = N3.Util;
var fs = require("fs");
var path = require("path");
var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var findPath = require("./findPath.js");

var schemasPath = findPath("schemas");
var validationPath = findPath("validation");
var manifestFile = validationPath + "manifest.jsonld";
var regexModules = [
  ShExCore["nfax-val-1err"],
  ShExCore["threaded-val-nerr"]
];
if (EARL)
  regexModules = regexModules.slice(1);

TODO = [
  // delightfully empty (for now)
];

describe("A ShEx validator", function () {
  "use strict";

  var shexParser = ShExParser.construct();
  beforeEach(shexParser._resetBlanks);
  /*
    Note that the tests.forEach will run before any of the it() functions.
    shexParser._setBase() must execute before shexParser.parse().
   */

  var tests = parseJSONFile(manifestFile)["@graph"][0]["entries"];
  var resultMap = parseJSONFile(__dirname + "/val/test-result-map.json");

  if (TESTS) {
    tests = tests.filter(function (t) {
      return TESTS.indexOf(t["@id"]) !== -1 ||
        TESTS.indexOf(t["@id"].substr(1)) !== -1 ||
        TESTS.indexOf(t.action.schema) !== -1 ||
        TESTS.indexOf(t.action.data) !== -1 ||
        TESTS.indexOf(t.result) !== -1;
    });
  }

  tests = tests.filter(test => {
    return TODO.indexOf(test.name) === -1;
  });

  regexModules.forEach(regexModule => {
    tests.forEach(function (test) {
      try {
        var schemaFile = path.resolve(schemasPath, test.action.schema);
        var schemaURL = "file://" + schemaFile;
        var semActsFile = "semActs" in test.action ? path.resolve(schemasPath, test.action.semActs) : null;
        var semActsURL = "file://" + semActsFile;
        var shapeExternsFile = "shapeExterns" in test.action ? path.resolve(schemasPath, test.action.shapeExterns) : null;
        var shapeExternsURL = "file://" + shapeExternsFile;
        var dataFile = path.resolve(validationPath, test.action.data);
        var dataURL = "file://" + dataFile;
        var valFile = resultMap[test["@id"]];
        if (valFile) {
          valFile = "val/" + valFile;
        }
        it(EARL
           ? 'validation/manifest\#' + test.name
           : "should use " + regexModule.name + " to validate data '" + (TERSE ? test.action.data : dataFile) + // test title
           "' against schema '" + (TERSE ? test.action.schema : schemaFile) +
           "' and get 'test/" + valFile + "'" +
           " in test '" + test["@id"] + "'.",
           function (report) {                                             // test action
             var absoluteVal = valFile ? parseJSONFile(__dirname + "/" + valFile, function (k, obj) {
               // resolve relative URLs in results file
               if (["shape", "reference", "valueExprRef", "node", "subject", "predicate", "object"].indexOf(k) !== -1 &&
                   typeof obj[k] !== "object" &&
                   ShExCore.RdfTerm.isIRI(obj[k])) {
                 obj[k] = ShExCore.RdfTerm.resolveRelativeIRI(["shape", "reference", "valueExprRef"].indexOf(k) !== -1 ? schemaURL : dataURL, obj[k]);
               } else if (["values"].indexOf(k) !== -1) {
                 for (var i = 0; i < obj[k].length; ++i) {
                   if (typeof obj[k][i] !== "object" && ShExCore.RdfTerm.isIRI(obj[k][i])) {
                     obj[k][i] = ShExCore.RdfTerm.resolveRelativeIRI(dataURL, obj[k][i]);
                   }
                 };
               }
             }) : valFile; // !! replace with ShExUtil.absolutizeResults(JSON.parse(fs.readFileSync(valFile, "utf8")))

             doIt(report, absoluteVal, {results: "val"}, true);
           });

        if (!EARL && test.result) {
          var resultsFile = test.result ? path.resolve(validationPath, test.result) : null;
          it("should use " + regexModule.name + " to validate data '" + (TERSE ? test.action.data : dataFile) + // test title
             "' against schema '" + (TERSE ? test.action.schema : schemaFile) +
             "' and get '" + (TERSE ? test.result : resultsFile) + "'" +
             " in test '" + test["@id"] + "'.",
             function (report) {                                             // test action
               var res = JSON.parse(fs.readFileSync(resultsFile, "utf8"));
               doIt(report, res, {results: "api"}, true);
             });
        }

        function doIt (report, referenceResult, params, required) {
          var semActs, shapeExterns;
          if (semActsFile) {
            shexParser._setBase(semActsURL);
            semActs = shexParser.parse(fs.readFileSync(semActsFile, "utf8")).
              startActs.reduce(function (ret, a) {
                ret[a.name] = a.code;
                return ret;
              }, {});
          }
          if (shapeExternsFile) {
            shexParser._setBase(shapeExternsURL);
            shapeExterns = ShExUtil.index(shexParser.parse(fs.readFileSync(shapeExternsFile, "utf8"))).shapeExprs;
          }
          shexParser._setBase(schemaURL);
          var validator;
          var resolverOptions = ShExParser.disabledTermResolver();
          if ("termResolver" in test.action) {
            var resolverFile = path.resolve(validationPath, test.action.termResolver);
            var resolverURL = "file://" + resolverFile;

            var resolverStore = new N3.Store();
            var resolverText = fs.readFileSync(resolverFile, "utf8");
            resolverStore.addQuads(new N3.Parser({baseIRI: resolverURL, blankNodePrefix: ""}).parse(fs.readFileSync(resolverFile, "utf8")));
            resolverOptions = ShExParser.dbTermResolver(resolverStore);
          }
          var schemaOptions = Object.assign({
            regexModule: regexModule,
            diagnose: true,
            or:
            "trait" in test &&
              test.trait.indexOf("OneOf") !== -1 ?
              "oneOf" :
              "someOf",
            partition:
            "trait" in test &&
              test.trait.indexOf("Exhaustive") !== -1 ?
              "exhaustive" :
              "greedy",
            semActs: semActs,
            validateExtern: function (db, point, shapeLabel, depth, seen) {
              return validator._validateShapeExpr(db, point, shapeExterns[shapeLabel],
                                                  shapeLabel, depth, seen);
            }
          }, params, resolverOptions);
          shexParser._setTermResolver(resolverOptions);
          function pickShEx (i) {
            return i + ".shex";
          }
          ShExLoader.load([schemaFile], [], [], [], { parser: shexParser, iriTransform: pickShEx }, {}).
            then(function (loaded) {
              var schema = loaded.schema;
              validator = ShExValidator.construct(schema, schemaOptions);
              var testResults = TestExtension.register(validator);

              assert(referenceResult !== undefined || test["@type"] === "sht:ValidationFailure", "test " + test["@id"] + " has no reference result");
              // var start = schema.start;
              // if (start === undefined && Object.keys(schema.action.shapes).length === 1)
              //   start = Object.keys(schema.action.shapes)[0];

              var store = new N3.Store();
              var turtleParser = new N3.Parser({baseIRI: dataURL, blankNodePrefix: "", format: "text/turtle"});
              turtleParser.parse(
                fs.readFileSync(dataFile, "utf8"),
                function (error, triple, prefixes) {
                  if (error) {
                    report("error parsing " + dataFile + ": " + error);
                  } else if (triple) {
                    store.addQuad(triple);
                  } else {
                    try {
                      function maybeGetTerm (base, s) {
                        return s === undefined ? null :
                          typeof(s) === "object" ? "\""+s["@value"]+"\""+(
                            "@type" in s ? "^^"+s["@type"] :
                              "@language" in s ? "@"+s["@language"] :
                              ""
                          ):
                        s.substr(0, 2) === "_:" ? s :
                          ShExCore.RdfTerm.resolveRelativeIRI(base, s);
                      }
                      var map = maybeGetTerm(manifestFile, test.action.map);
                      if (map) {
                        map = JSON.parse(fs.readFileSync(map, "utf8"));
                        // map = Object.keys(map).reduce((r, k) => {
                        //   return r.concat({node: k, shape: map[k]});
                        // }, [])
                      } else {
                        var focus = maybeGetTerm(dataURL, test.action.focus);
                        var shape = maybeGetTerm(schemaURL, test.action.shape) || ShExValidator.start;
                        map = [{node: focus, shape: shape}];
                      }
                      var validationResult = validator.validate(ShExUtil.makeN3DB(store), map);
                      if (VERBOSE) { console.log("result   :" + JSON.stringify(validationResult)); }
                      if (VERBOSE) { console.log("expected :" + JSON.stringify(referenceResult)); }
                      if (params.results !== "api") {
                        if (test["@type"] === "sht:ValidationFailure") {
                          assert(!validationResult || "errors" in validationResult, "test expected to fail");
                          if (referenceResult)
                            expect(restoreUndefined(validationResult)).to.deep.equal(restoreUndefined(referenceResult));
                        } else {
                          assert(validationResult && !("errors" in validationResult), "test expected to succeed; got " + JSON.stringify(validationResult));
                          if (referenceResult !== null)
                            expect(restoreUndefined(validationResult)).to.deep.equal(restoreUndefined(referenceResult));
                        }
                      }
                      var xr = test.extensionResults.filter(function (x) {
                        return x.extension === TestExtension.url;
                      }).map(function (x) {
                        return x.prints;
                      });
                      if (xr.length) {
                        expect(testResults).to.deep.equal(xr);
                      }
                      report();
                    } catch (e) {
                      report(e);
                    }
                  }
                });
            }).
            catch(function (e) {
              report(e);
            });
        }
      } catch (e) {
        var throwMe = new Error("in " + test["@id"] + " " + e); // why doesn't this change the error message?
        throwMe.stack = "in " + test["@id"] + " " + e.stack;
        throw throwMe;
      }
    });
  });
});

// Parses a JSON object, restoring `undefined` values
function parseJSONFile(filename, mapFunction) {
  "use strict";
  try {
    var string = fs.readFileSync(filename, "utf8");
    var object = JSON.parse(string);
    function resolveRelativeURLs (obj) {
      Object.keys(obj).forEach(function (k) {
        if (typeof obj[k] === "object" && obj[k] !== null) {
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
      object[key] = item.type === "ShapeRef"
        ? item.reference
        : restoreUndefined(item);
    } else if (item === "{undefined}") {
      object[key] = undefined;
    }
  }
  if ("shape" in object && "shapeExpr" in object && "id" in object.shapeExpr)
    delete object.shapeExpr.id
  return object;
}
