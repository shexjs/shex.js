"use strict";
const VERBOSE = "VERBOSE" in process.env;
const TERSE = VERBOSE;
const TESTS = "TESTS" in process.env ? process.env.TESTS : null;
const EARL = "EARL" in process.env;

const ShExUtil = require("@shexjs/util");
const ShExTerm = require("@shexjs/term");
const ShExParser = require("@shexjs/parser");
const { ctor: RdfJsDb } = require('@shexjs/neighborhood-rdfjs')
const {ShExValidator, resultMapToShapeExprTest} = require("..");
const TestExtension = require("@shexjs/extension-test")

const N3 = require("n3");
const ShExNode = require("@shexjs/node")({ rdfjs: N3 });
const fs = require("fs");
const path = require("path");
const chai = require("chai");
const expect = chai.expect;
const assert = chai.assert;
const findPath = require("./findPath.js");

const schemasPath = findPath("schemas");
const validationPath = findPath("validation");
const manifestFile = validationPath + "manifest.jsonld";
let regexModules = [
  require("@shexjs/eval-simple-1err"),
  require("@shexjs/eval-threaded-nerr")
];
if (EARL)
  regexModules = regexModules.slice(1);

const TODO = [
  // delightfully empty (for now)
];

describe("A ShEx validator", function () {
  "use strict";

  const shexParser = ShExParser.construct();
  let tests = parseJSONFile(manifestFile)["@graph"][0]["entries"];
  const resultMap = parseJSONFile(__dirname + "/val/test-result-map.json");

  if (TESTS) {
    tests = tests.filter(function (t) {
      return t["@id"].match(TESTS) ||
        t["@id"].substr(1).match(TESTS) ||
        t.action.schema.match(TESTS) ||
        t.action.data.match(TESTS);
    });
  }

  tests = tests.filter(test => {
    return TODO.indexOf(test.name) === -1;
  });

  regexModules.forEach(regexModule => {
    tests.forEach(function (test) {
      try {
        const schemaFile = path.resolve(schemasPath, test.action.schema);
        const schemaURL = "file://" + schemaFile;
        const semActsFile = "semActs" in test.action ? path.resolve(schemasPath, test.action.semActs) : null;
        const semActsURL = "file://" + semActsFile;
        const shapeExternsFile = "shapeExterns" in test.action ? path.resolve(schemasPath, test.action.shapeExterns) : null;
        const shapeExternsURL = "file://" + shapeExternsFile;
        const dataFile = path.resolve(validationPath, test.action.data);
        const dataURL = "file://" + dataFile;
        let valFile = resultMap[test["@id"]];
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
             const absoluteVal = valFile ? parseJSONFile(__dirname + "/" + valFile, function (k, obj) {
               // resolve relative URLs in results file
               if (["shape", "reference", "valueExprRef", "node", "focus", "subject", "predicate", "object"].indexOf(k) !== -1 &&
                   typeof obj[k] !== "object" &&
                   (typeof obj[k] === "string" && !obj[k].startsWith("_:"))) {
                 obj[k] = ShExTerm.resolveRelativeIRI(["shape", "reference", "valueExprRef"].indexOf(k) !== -1 ? schemaURL : dataURL, obj[k]);
               } else if (["values"].indexOf(k) !== -1) {
                 for (let i = 0; i < obj[k].length; ++i) {
                   if (typeof obj[k][i] !== "object") {
                     obj[k][i] = ShExTerm.resolveRelativeIRI(dataURL, obj[k][i]);
                   }
                 }
               }
             }) : valFile; // !! replace with ShExUtil.absolutizeResults(JSON.parse(fs.readFileSync(valFile, "utf8")))

             doIt(report, absoluteVal, {results: "val"});
           });

        if (!EARL && test.result) {
          const resultsFile = test.result ? path.resolve(validationPath, test.result) : null;
          it("should use " + regexModule.name + " to validate data '" + (TERSE ? test.action.data : dataFile) + // test title
             "' against schema '" + (TERSE ? test.action.schema : schemaFile) +
             "' and get '" + (TERSE ? test.result : resultsFile) + "'" +
             " in test '" + test["@id"] + "'.",
             function (report) {                                             // test action
               const res = JSON.parse(fs.readFileSync(resultsFile, "utf8"));
               doIt(report, res, {results: "api"});
             });
        }

        function doIt(report, referenceResult, params) {
          let semActs, shapeExterns;
          if (semActsFile) {
            semActs = shexParser.parse(fs.readFileSync(semActsFile, "utf8"), semActsURL, {}, semActsFile).
              startActs.reduce(function (ret, a) {
                ret[a.name] = a.code;
                return ret;
              }, {});
          }
          if (shapeExternsFile) {
            shapeExterns = ShExUtil.index(shexParser.parse(fs.readFileSync(shapeExternsFile, "utf8"), shapeExternsURL, {}, shapeExternsFile)).shapeExprs;
          }
          let validator;
          const schemaOptions = Object.assign({
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
            validateExtern: function (point, shapeLabel, ctx) {
              return validator.validateShapeDecl(point, shapeExterns[shapeLabel], ctx);
            }
          }, params);
          function pickShEx (i) {
            return i + ".shex";
          }
          ShExNode.load({shexc: [schemaFile]}, null, { parser: shexParser, iriTransform: pickShEx }, {}).
            then(function (loaded) {
              const schema = loaded.schema;

              assert(referenceResult !== undefined || test["@type"] === "sht:ValidationFailure", "test " + test["@id"] + " has no reference result");
              // const start = schema.start;
              // if (start === undefined && Object.keys(schema.action.shapes).length === 1)
              //   start = Object.keys(schema.action.shapes)[0];

              const store = new N3.Store();
              // Crappy hack 'cause N3Parser._resetBlankNodePrefix() isn't exported.
              const bnodeRenumberer = makeBNodeRenumberer().start(0);
              const turtleParser = new N3.Parser({baseIRI: dataURL, blankNodePrefix: "", format: "text/turtle", factory: N3.DataFactory});
              turtleParser.parse(
                fs.readFileSync(dataFile, "utf8"),
                function (error, triple, prefixes) {
                  if (error) {
                    report("error parsing " + dataFile + ": " + error);
                  } else if (triple) {
                    store.addQuad(triple);
                  } else {
                    bnodeRenumberer.restore();
                    try {
                      function maybeGetTerm (base, s) {
                        return s === undefined ? null :
                          typeof(s) === "object" ? {
                            value: s["@value"],
                            type: s["@type"],
                            language: s["@language"],
                          }:
                        s.substr(0, 2) === "_:" ? s :
                          ShExTerm.resolveRelativeIRI(base, s);
                      }
                      let map = maybeGetTerm(manifestFile, test.action.map);
                      if (map) {
                        map = JSON.parse(fs.readFileSync(map, "utf8"));
                        // map = Object.keys(map).reduce((r, k) => {
                        //   return r.concat({node: k, shape: map[k]});
                        // }, [])
                      } else {
                        const focus = maybeGetTerm(dataURL, test.action.focus);
                        const shape = maybeGetTerm(schemaURL, test.action.shape) || ShExValidator.Start;
                        map = [{node: focus, shape: shape}];
                      }
                      validator = new ShExValidator(schema, RdfJsDb(store), schemaOptions);
                      const testResults = TestExtension.register(validator, {ShExTerm});
                      const validationResult = schemaOptions.results === 'api'
                          ? validator.validateShapeMap(map)
                          : resultMapToShapeExprTest(validator.validateShapeMap(map));
                      expect(JSON.stringify(validationResult).match(/\[Object]/)).to.be.null;
                      if (VERBOSE) { console.log("result   :" + JSON.stringify(validationResult)); }
                      if (VERBOSE) { console.log("expected :" + JSON.stringify(referenceResult)); }
                      if (params.results !== "api") {
                        if (test["@type"] === "sht:ValidationFailure") {
                          assert(!validationResult || "errors" in validationResult, "test expected to fail");
                          if (referenceResult) {
                            // console.log(JSON.stringify(validationResult, null, 2)); // , "\n---\n", JSON.stringify(referenceResult, null, 2));
                            expect(canonicalizeJ(validationResult)).to.deep.equal(canonicalizeJ(referenceResult));
                          }
                          ShExUtil.errsToSimple(validationResult);
                        } else {
                          assert(validationResult && !("errors" in validationResult), "test expected to succeed; got " + JSON.stringify(validationResult));
                          if (referenceResult !== null) {
                            // console.log(JSON.stringify(validationResult, null, 2), "\n---\n", JSON.stringify(referenceResult, null, 2));
                            expect(canonicalizeJ(validationResult, {})).to.deep.equal(canonicalizeJ(referenceResult, {}));
                          }
                          ShExUtil.valToValues(validationResult);
                        }
                      }
                      const xr = test.extensionResults.filter(function (x) {
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
        const throwMe = new Error("in " + test["@id"] + " " + e); // why doesn't this change the error message?
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
    const string = fs.readFileSync(filename, "utf8");
    const object = JSON.parse(string);
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
    return /"\{undefined}"/.test(string) ? canonicalizeJ(object) : object;
  } catch (e) {
    throw new Error("error reading " + filename +
                    ": " + ("stack" in e ? e.stack : e));
  }
}

// Not sure this is needed when everything's working but I have hunch it makes
// error handling a little more graceful.
function canonicalizeJ (object, map) {
  "use strict";
  for (const key in object) {
    const item = object[key];
    if (typeof item === "object") {
      object[key] = item.type === "ShapeRef"
        ? item.reference
        : canonicalizeJ(item, map);
    } else if (map && (["node", "subject", "object"]).indexOf(key) !== -1 &&
               typeof item === "string" && item.startsWith("_:")) {
      if (!(item in map))
        map[item] = "_:b" + Object.keys(map).length;
      object[key] = map[item];
    }
  }
  if ("shape" in object && "shapeExpr" in object && "id" in object.shapeExpr)
    delete object.shapeExpr.id
  return object;
}

function makeBNodeRenumberer () {
  const known = {};
  let counter = 0;
  let old = null;
  return {
    start: function (ord = 0) {
      counter = ord;
      old = N3.DataFactory.blankNode;
      N3.DataFactory.blankNode = blankNode;
      return this;
    },
    restore: function () {
      N3.DataFactory.blankNode = old;
      return this;
    }
  };

  function blankNode (theirName) {
    let ret;
    if (theirName in known) {
      ret = known[theirName];
    } else {
      const myName = !theirName || theirName.startsWith('n3-') ? `n3-${counter++}` : theirName;
      ret = old(myName);
      if (theirName)
        known[theirName] = ret;
    }
    // console.warn(`BNode ${theirName} => ${ret.id}`);
    return ret;
  }
}
