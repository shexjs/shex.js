//  "use strict";
var VERBOSE = "VERBOSE" in process.env;
var TERSE = VERBOSE;
var TESTS = "TESTS" in process.env ? process.env.TESTS.split(/,/) : null;

// var ShExUtil = require("../lib/ShExUtil");
var ShExParser = require("../lib/ShExParser").Parser;
var ShExValidator = require("../lib/ShExValidator");
var TestExtension = require("../extensions/shex:Test.js");

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

TODO = ["1dotOr2dot-someOf_pass_p1p2p3"]; // !!! make these work!

describe("A ShEx validator", function () {
  "use strict";

  var shexParser = new ShExParser();
  beforeEach(shexParser._resetBlanks);
  /*
    Note that the tests.forEach will run before any of the it() functions.
    shexParser._setBase() must execute before shexParser.parse().
   */

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

  tests = tests.filter(test => {
    return test.trait.indexOf("OneOf") === -1 &&
      TODO.indexOf(test.name) === -1;
  });

  tests.forEach(function (test) {
    try {
      var schemaFile = path.join(schemasPath, test.action.schema);
      var schemaURL = "file://" + schemaFile;
      var semActsFile = "semActs" in test.action ? path.join(schemasPath, test.action.semActs) : null;
      var semActsURL = "file://" + semActsFile;
      var dataFile = path.join(validationPath, test.action.data);
      var dataURL = "file://" + dataFile;
      var resultsFile = test.result ? path.join(validationPath, test.result) : null;
      it("should validate data '" + (TERSE ? test.action.data : dataFile) + // test title
         "' against schema '" + (TERSE ? test.action.schema : schemaFile) +
         "' and get '" + (TERSE ? test.result : resultsFile) + "'" +
         " in test '" + test["@id"] + "'.",
         function (report) {                                             // test action
           var semActs;
           if (semActsFile) {
             shexParser._setBase(semActsURL);
             semActs = shexParser.parse(fs.readFileSync(semActsFile, "utf8")).
               startActs.reduce(function (ret, a) {
                 ret[a.name] = a.code;
                 return ret;
               }, {});
           }
           shexParser._setBase(schemaURL);
           var schema = shexParser.parse(fs.readFileSync(schemaFile, "utf8"));
           var validator = ShExValidator.construct(schema, { diagnose: true,
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
                                                             semActs: semActs });
           var testResults = TestExtension.register(validator);

           var referenceResult = resultsFile ? parseJSONFile(resultsFile, function (k, obj) {
             // resolve relative URLs in results file
             if (["shape", "reference", "valueExprRef", "node", "subject", "predicate", "object"].indexOf(k) !== -1 &&
                 N3Util.isIRI(obj[k])) {
               obj[k] = resolveRelativeIRI(["shape", "reference", "valueExprRef"].indexOf(k) !== -1 ? schemaURL : dataURL, obj[k]);
             }}) : null; // !! replace with ShExUtil.absolutizeResults(JSON.parse(fs.readFileSync(resultsFile, "utf8")))

           assert(referenceResult !== null || test["@type"] === "sht:ValidationFailure", "test " + test["@id"] + " has no reference result");
           // var start = schema.start;
           // if (start === undefined && Object.keys(schema.action.shapes).length === 1)
           //   start = Object.keys(schema.action.shapes)[0];

           var store = new N3.Store();
           var turtleParser = new N3.Parser({documentIRI: dataURL, blankNodePrefix: ""});
           turtleParser.parse(
             fs.readFileSync(dataFile, "utf8"),
             function (error, triple, prefixes) {
               if (error) {
                 report("error parsing " + dataFile + ": " + error);
               } else if (triple) {
                 store.addTriple(triple);
               } else {
                 try {
                   function maybeGetTerm (base, s) {
                     return s === undefined ? null :
                       s.substr(0, 2) === "_:" ? s :
                       resolveRelativeIRI(base, s);
                   }
                   var focus = maybeGetTerm(dataURL, test.action.focus);
                   var shape = maybeGetTerm(schemaURL, test.action.shape);
                   var validationResult = validator.validate(store, focus, shape);
                   if (VERBOSE) { console.log("result   :" + JSON.stringify(validationResult)); }
                   if (VERBOSE) { console.log("expected :" + JSON.stringify(referenceResult)); }
                   if (test["@type"] === "sht:ValidationFailure") {
                     assert(!validationResult || "errors" in validationResult, "test expected to fail");
                     if (referenceResult)
                       expect(restoreUndefined(validationResult)).to.deep.equal(restoreUndefined(referenceResult));
                   } else {
                     assert(validationResult && !("errors" in validationResult), "test expected to succeed");
                     expect(restoreUndefined(validationResult)).to.deep.equal(restoreUndefined(referenceResult));
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
         });
    } catch (e) {
      var throwMe = new Error("in " + test["@id"] + " " + e); // why doesn't this change the error message?
      throwMe.stack = "in " + test["@id"] + " " + e.stack;
      throw throwMe;
    }
  });
});

/* Leverage n3.js's relative IRI parsing.
 * !! requires intimate (so intimate it makes me blush) knowledge of n3.
 */
function resolveRelativeIRI (baseIri, relativeIri) {
  var p = N3.Parser({ documentIRI: baseIri });
  p._readSubject({type: "IRI", value: relativeIri});
  return p._subject;
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
