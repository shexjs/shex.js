// Test shex.js command line scripts.

"use strict";
var SLOW = "SLOW" in process.env; // Only run these tests if SLOW is set. SLOW=4000 to set per-test timeout to 4s.
var TIME = "TIME" in process.env;
var TESTS = "TESTS" in process.env ?
    process.env.TESTS.split(/,/) :
    null;
var HTTPTEST = "HTTPTEST" in process.env ?
    process.env.HTTPTEST :
    "http://raw.githubusercontent.com/shexSpec/shex.js/master/test/"

var ShExLoader = require("../lib/ShExLoader");
var child_process = require('child_process');
var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var should = chai.should;
var fs = require("fs");

var manifestFile = "cli/manifest.json";

var AllTests = {
  "validate": [
    // pleas for help
    { name: "help" , args: ["--help"], resultMatch: "example", status: 1 },
    { name: "help-simple" , args: ["--help", "-x", "cli/1dotOr2dot.shex", "-s", "http://a.example/S1", "-d", "cli/p1.ttl", "-n", "x"], resultMatch: "example", status: 1 },
    { name: "help-simple-json" , args: ["--help", "--json-manifest", "cli/manifest-simple.json"], resultMatch: "example", status: 1 },
    { name: "help-simple-jsonld" , args: ["--help", "--json-manifest", "cli/manifest-simple.jsonld"], resultMatch: "example", status: 1 },
    { name: "help-simple-as-jsonld" , args: ["--help", "--jsonld-manifest", "cli/manifest-simple.jsonld"], resultMatch: "example", status: 1 },
    { name: "help-simple-as-turtle" , args: ["--help", "--turtle-manifest", "cli/manifest-simple.ttl"], resultMatch: "example", status: 1 },
    { name: "help-results", args: ["--help", "--json-manifest", "cli/manifest-results.json"], resultMatch: "example", status: 1 },

    // bogus command line
    { name: "garbage" , args: ["--garbage"], resultMatch: "(Invalid|Unknown) option", status: 1 },
    { name: "garbage-simple" , args: ["--garbage", "-x", "cli/1dotOr2dot.shex", "-s", "http://a.example/S1", "-d", "cli/p1.ttl", "-n", "x"], resultMatch: "(Invalid|Unknown) option", status: 1 },
    { name: "garbage-simple-json" , args: ["--garbage", "--json-manifest", "cli/manifest-simple.json"], resultMatch: "(Invalid|Unknown) option", status: 1 },
    { name: "garbage-simple-jsonld" , args: ["--garbage", "--json-manifest", "cli/manifest-simple.jsonld"], resultMatch: "(Invalid|Unknown) option", status: 1 },
    { name: "garbage-simple-as-jsonld" , args: ["--garbage", "--jsonld-manifest", "cli/manifest-simple.jsonld"], resultMatch: "(Invalid|Unknown) option", status: 1 },
    { name: "garbage-simple-as-turtle" , args: ["--garbage", "--turtle-manifest", "cli/manifest-simple.ttl"], resultMatch: "(Invalid|Unknown) option", status: 1 },
    { name: "garbage-results", args: ["--garbage", "--json-manifest", "cli/manifest-results.json"], resultMatch: "(Invalid|Unknown) option", status: 1 },

    // missing file resources
    { name: "simple-bad-shex-file" , args: ["-x", "cli/1dotOr2dot.shex999", "-s", "http://a.example/S1", "-d", "cli/p1.ttl", "-n", "x"], resultMatch: "ENOENT", status: 1 },
    { name: "simple-bad-data-file" , args: ["-x", "cli/1dotOr2dot.shex", "-s", "http://a.example/S1", "-d", "cli/p1.ttl999", "-n", "x"], resultMatch: "ENOENT", status: 1 },
    { name: "simple-bad-json-file" , args: ["--json-manifest", "cli/manifest-simple.json999"], resultMatch: "ENOENT", status: 1 },
    { name: "results-missing-file", args: ["--json-manifest", "cli/manifest-results-missing.json"], resultMatch: "ENOENT", status: 1 },
    //  --dry-run
    { name: "simple-bad-shex-file" , args: ["-x", "cli/1dotOr2dot.shex999", "-s", "http://a.example/S1", "-d", "cli/p1.ttl", "-n", "x", "--dry-run"], resultMatch: "ENOENT", status: 1 },
    { name: "results-missing-file-dry", args: ["--json-manifest", "cli/manifest-results-missing.json", "--dry-run"], resultMatch: "ENOENT", status: 1 },

    // missing web resources
    { name: "simple-bad-shex-http" , args: ["-x", HTTPTEST + "cli/1dotOr2dot.shex999", "-s", "http://a.example/S1", "-d", HTTPTEST + "cli/p1.ttl", "-n", "x"], resultMatch: "Not Found", status: 1 },
    { name: "simple-bad-data-http" , args: ["-x", HTTPTEST + "cli/1dotOr2dot.shex", "-s", "http://a.example/S1", "-d", HTTPTEST + "cli/p1.ttl999", "-n", "x"], resultMatch: "Not Found", status: 1 },
    { name: "simple-bad-json-http" , args: ["--json-manifest", HTTPTEST + "cli/manifest-simple.json999"], resultMatch: "Not Found", status: 1 },
    { name: "simple-bad-shex-mixed", args: ["-x", HTTPTEST + "cli/1dotOr2dot.shex999", "-s", "http://a.example/S1", "-d", "cli/p1.ttl", "-n", "x"], resultMatch: "Not Found", status: 1 },
    { name: "simple-bad-data-missed", args: ["-x", "cli/1dotOr2dot.shex", "-s", "http://a.example/S1", "-d", HTTPTEST + "cli/p1.ttl999", "-n", "x"], resultMatch: "Not Found", status: 1 },
    { name: "results-missing-http", args: ["--json-manifest", HTTPTEST + "cli/manifest-results-missing.json"], resultMatch: "Not Found", status: 1 },
    //  --dry-run
    { name: "simple-bad-shex-http" , args: ["-x", HTTPTEST + "cli/1dotOr2dot.shex999", "-s", "http://a.example/S1", "-d", HTTPTEST + "cli/p1.ttl", "-n", "x", "--dry-run"], resultMatch: "Not Found", status: 1 },
    { name: "results-missing-http-dry", args: ["--json-manifest", HTTPTEST + "cli/manifest-results-missing.json", "--dry-run"], resultMatch: "Not Found", status: 1 },

    // local file access
    { name: "simple" , args: ["-x", "cli/1dotOr2dot.shex", "-s", "http://a.example/S1", "-d", "cli/p1.ttl", "-n", "x"], result: "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-json" , args: ["--json-manifest", "cli/manifest-simple.json"], result: "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-jsonld" , args: ["--json-manifest", "cli/manifest-simple.jsonld"], result: "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-as-jsonld" , args: ["--jsonld-manifest", "cli/manifest-simple.jsonld"], result: "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-as-turtle" , args: ["--turtle-manifest", "cli/manifest-simple.ttl"], result: "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "results", args: ["--json-manifest", "cli/manifest-results.json"], resultText: "true\ntrue\ntrue\ntrue\ntrue\ntrue\ntrue\n", status: 0 },
    //  --dry-run
    { name: "simple-dry" , args: ["-x", "cli/1dotOr2dot.shex", "-s", "http://a.example/S1", "-d", "cli/p1.ttl", "-n", "x", "--dry-run"], resultText: "", status: 0 },
    { name: "simple-as-jsonld-dry" , args: ["--jsonld-manifest", "cli/manifest-simple.jsonld", "--dry-run"], resultText: "", status: 0 },
    { name: "simple-as-jsonld-dry-inv" , args: ["--jsonld-manifest", "cli/manifest-simple.jsonld", "--dry-run", "--invocation"], resultMatch: "../bin/validate", status: 0 },

    // HTTP access via raw.githubusercontent.com
    { name: "simple-http" , args: ["-x", HTTPTEST + "cli/1dotOr2dot.shex", "-s", "http://a.example/S1", "-d", HTTPTEST + "cli/p1.ttl", "-n", "x"], result: HTTPTEST + "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-json-http" , args: ["--json-manifest", HTTPTEST + "cli/manifest-simple.json"], result: HTTPTEST + "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-jsonld-http" , args: ["--json-manifest", HTTPTEST + "cli/manifest-simple.jsonld"], result: HTTPTEST + "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-as-jsonld-http" , args: ["--jsonld-manifest", HTTPTEST + "cli/manifest-simple.jsonld"], result: HTTPTEST + "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-as-turtle-http" , args: ["--turtle-manifest", HTTPTEST + "cli/manifest-simple.ttl"], result: HTTPTEST + "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "results-http", args: ["--json-manifest", HTTPTEST + "cli/manifest-results.json"], resultText: "true\ntrue\ntrue\ntrue\ntrue\ntrue\ntrue\n", status: 0 }
  ],

  "shex-to-json": [
    { name: "help" , args: ["--help"], resultMatch: "example", status: 1 },
    { name: "garbage" , args: ["--garbage"], resultMatch: "(Invalid|Unknown) option", status: 1 },
    { name: "simple" , args: ["cli/1dotOr2dot.shex"], result: "cli/1dotOr2dot.json", status: 0 },
    { name: "simple-http" , args: [HTTPTEST + "cli/1dotOr2dot.shex"], result: "cli/1dotOr2dot.json", status: 0 },
    { name: "simple-bad-file" , args: ["cli/1dotOr2dot.shex999"], resultMatch: "ENOENT", status: 1 },
    { name: "simple-bad-http" , args: [HTTPTEST + "cli/1dotOr2dot.shex999"], resultMatch: "Not Found", status: 1 },
  ],

  "json-to-shex": [
    { name: "help" , args: ["--help"], resultMatch: "example", status: 1 },
    { name: "garbage" , args: ["--garbage"], resultMatch: "(Invalid|Unknown) option", status: 1 },
    { name: "simple" , args: ["cli/1dotOr2dot.json"], resultNoSpace: "cli/1dotOr2dot.shex", status: 0 },
    { name: "simple-http" , args: [HTTPTEST + "cli/1dotOr2dot.json"], resultNoSpace: "cli/1dotOr2dot.shex", status: 0 },
    { name: "simple-bad-file" , args: ["cli/1dotOr2dot.json999"], resultMatch: "ENOENT", status: 1 },
    { name: "simple-bad-http" , args: [HTTPTEST + "cli/1dotOr2dot.json999"], resultMatch: "Not Found", status: 1 },
  ]
};

if (SLOW) {

var last = new Date();
var stamp = TIME ? function (s) {
  var t = new Date();
  var delta = t - last;
  last = t;
  console.warn(delta, s);
} : function () {};

/* set up IO promises
 */
Object.keys(AllTests).forEach(function (script) {
  var tests = AllTests[script];

  if (TESTS)
    tests = tests.filter(function (t) {
      return TESTS.indexOf(t.name) !== -1;
    });

  tests.forEach(function (test) {
    try {
      test.ref =
        "resultText" in test ? { resultText: test.resultText } :
      "resultNoSpace" in test ? ShExLoader.GET(test.resultNoSpace).then(function (loaded) { return { resultNoSpace: loaded }; }) :
      "resultMatch" in test ? { resultMatch: RegExp(test.resultMatch) } :
      ShExLoader.GET(test.result).then(function (loaded) { return { result: loaded }; });

      test.exec = new Promise(function (resolve, reject) {
        process.chdir(__dirname); // the above paths are relative to this directory

        var program = child_process.spawn("../bin/" + script, test.args);
        var stdout = "", stderr = ""

        program.stdout.on("data", function(data) { stdout += data; });
        program.stderr.on("data", function(data) { stderr += data; });
        program.on("exit", function(exitCode) { resolve({stdout:stdout, stderr:stderr, exitCode:exitCode}); });
        program.on("error", function(err) { reject(err); });
      });
    } catch (e) {
      var throwMe = new Error("Error setting up test " + test.name + " " + e);
      throwMe.stack = "Error setting up test " + test.name + " " + e.stack;
      throw throwMe;
    }
  });
});
stamp("setup");

/* test results
 */
Object.keys(AllTests).forEach(function (script) {
  var tests = AllTests[script];

  describe("The " + script + " script", function () {
    "use strict";

    var setSlow = parseInt(process.env.SLOW); // SLOW=4000 will run tests with timout of 4s
    this.timeout(setSlow && setSlow !== 1 ? setSlow : 6000);
    if (TESTS)
      tests = tests.filter(function (t) {
        return TESTS.indexOf(t.name) !== -1;
      });

    tests.forEach(function (test) {
      it("should execute $(" + test.args.join(" ") + ")"+
         ( "resultMatch" in test ?
           (" and match /" + test.resultMatch) + "/" :
           (" and get " +
            ("resultText" in test ? JSON.stringify(test.resultText) :
             "resultNoSpace" in test ? JSON.stringify(test.resultNoSpace) : test.result))
         ) +
         " in test '" + test.name + "'.",
         function (done) {
           stamp(script+"/"+test.name);
           Promise.all([test.ref, test.exec]).then(function (both) {
             var ref = both[0];
             var exec = both[1];
             var testText = "";

             if (test.status === 0) {      // Keep this test before exitCode in order to
               expect(exec.stderr).to.be.empty; // print errors from spawn.
               testText = exec.stdout;
             } else {
               testText = exec.stderr;
             }

             if ("resultMatch" in ref)
               expect(testText).to.match(ref.resultMatch);
             else if ("resultText" in ref)
               expect(testText).to.equal(ref.resultText);
             else if ("resultNoSpace" in ref)
               expect(testText.replace(/[ \n]/g, "")).to.equal(ref.resultNoSpace.text.replace(/[ \n]/g, ""));
             else if ("result" in ref)
               expect(JSON.parse(testText)).to.deep.equal(
                 ShExUtil.absolutizeResults(
                   JSON.parse(ref.result.text), ref.result.url));
             else
               throw Error("unknown test criteria in " + JSON.stringify(ref));

             expect(exec.exitCode).to.equal(test.status);
             done();
           }).catch(function (e) { done(e); });
         });
    });
  });
});

}

