// Test shex.js command line scripts.

"use strict";
const TEST_cli = "TEST_cli" in process.env ? JSON.parse(process.env["TEST_cli"]) : false;
var TIME = "TIME" in process.env;
var TESTS = "TESTS" in process.env ?
    process.env.TESTS.split(/,/) :
    null;
var HTTPTEST = "HTTPTEST" in process.env ?
    process.env.HTTPTEST :
    "http://raw.githubusercontent.com/shexSpec/shex.js/master/test/"

var ShExUtil = require("@shexjs/core").Util;
var ShExLoader = require("@shexjs/loader");
var child_process = require('child_process');
var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var should = chai.should;
var Queue = require("timeout-promise-queue").PromiseQueue(25);

var fs = require("fs");

var manifestFile = "cli/manifest.json";

var AllTests = {
  "shex-validate": [
    // pleas for help
    { name: "help" , args: ["--help"], errorMatch: "example", status: 1 },
    { name: "help-simple" , args: ["--help", "-x", "cli/1dotOr2dot.shex", "-s", "<http://a.example/S1>", "-d", "cli/p1.ttl", "-n", "<x>"], errorMatch: "example", status: 1 },
    { name: "help-simple-json" , args: ["--help", "--json-manifest", "cli/manifest-simple.json"], errorMatch: "example", status: 1 },
    { name: "help-simple-jsonld" , args: ["--help", "--json-manifest", "cli/manifest-simple.jsonld"], errorMatch: "example", status: 1 },
    { name: "help-simple-as-jsonld" , args: ["--help", "--jsonld-manifest", "cli/manifest-simple.jsonld"], errorMatch: "example", status: 1 },
    { name: "help-simple-as-turtle" , args: ["--help", "--turtle-manifest", "cli/manifest-simple.ttl"], errorMatch: "example", status: 1 },
    { name: "help-results", args: ["--help", "--json-manifest", "cli/manifest-results.json"], errorMatch: "example", status: 1 },

    // bogus command line
    { name: "garbage" , args: ["--garbage"], errorMatch: "(Invalid|Unknown) option", status: 1 },
    { name: "garbage-simple" , args: ["--garbage", "-x", "cli/1dotOr2dot.shex", "-s", "<http://a.example/S1>", "-d", "cli/p1.ttl", "-n", "<x>"], errorMatch: "(Invalid|Unknown) option", status: 1 },
    { name: "garbage-simple-json" , args: ["--garbage", "--json-manifest", "cli/manifest-simple.json"], errorMatch: "(Invalid|Unknown) option", status: 1 },
    { name: "garbage-simple-jsonld" , args: ["--garbage", "--json-manifest", "cli/manifest-simple.jsonld"], errorMatch: "(Invalid|Unknown) option", status: 1 },
    { name: "garbage-simple-as-jsonld" , args: ["--garbage", "--jsonld-manifest", "cli/manifest-simple.jsonld"], errorMatch: "(Invalid|Unknown) option", status: 1 },
    { name: "garbage-simple-as-turtle" , args: ["--garbage", "--turtle-manifest", "cli/manifest-simple.ttl"], errorMatch: "(Invalid|Unknown) option", status: 1 },
    { name: "garbage-results", args: ["--garbage", "--json-manifest", "cli/manifest-results.json"], errorMatch: "(Invalid|Unknown) option", status: 1 },

    // missing file resources
    { name: "simple-bad-shex-file" , args: ["-x", "cli/1dotOr2dot.shex999", "-s", "<http://a.example/S1>", "-d", "cli/p1.ttl", "-n", "<x>"], errorMatch: "ENOENT", status: 1 },
    { name: "simple-bad-data-file" , args: ["-x", "cli/1dotOr2dot.shex", "-s", "<http://a.example/S1>", "-d", "cli/p1.ttl999", "-n", "<x>"], errorMatch: "ENOENT", status: 1 },
    { name: "simple-bad-json-file" , args: ["--json-manifest", "cli/manifest-simple.json999"], errorMatch: "ENOENT", status: 1 },
    { name: "results-missing-file", args: ["--json-manifest", "cli/manifest-results-missing.json"], errorMatch: "ENOENT", status: 1 },
    //  --dry-run
    { name: "simple-bad-shex-file" , args: ["-x", "cli/1dotOr2dot.shex999", "-s", "<http://a.example/S1>", "-d", "cli/p1.ttl", "-n", "<x>", "--dry-run"], errorMatch: "ENOENT", status: 1 },
    { name: "results-missing-file-dry", args: ["--json-manifest", "cli/manifest-results-missing.json", "--dry-run"], errorMatch: "ENOENT", status: 1 },

    // missing web resources
    { name: "simple-bad-shex-http" , args: ["-x", HTTPTEST + "cli/1dotOr2dot.shex999", "-s", "<http://a.example/S1>", "-d", HTTPTEST + "cli/p1.ttl", "-n", "<x>"], errorMatch: "Not Found", status: 1 },
    { name: "simple-bad-data-http" , args: ["-x", HTTPTEST + "cli/1dotOr2dot.shex", "-s", "<http://a.example/S1>", "-d", HTTPTEST + "cli/p1.ttl999", "-n", "<x>"], errorMatch: "Not Found", status: 1 },
    { name: "simple-bad-json-http" , args: ["--json-manifest", HTTPTEST + "cli/manifest-simple.json999"], errorMatch: "Not Found", status: 1 },
    { name: "simple-bad-shex-mixed", args: ["-x", HTTPTEST + "cli/1dotOr2dot.shex999", "-s", "<http://a.example/S1>", "-d", "cli/p1.ttl", "-n", "<x>"], errorMatch: "Not Found", status: 1 },
    { name: "simple-bad-data-missed", args: ["-x", "cli/1dotOr2dot.shex", "-s", "<http://a.example/S1>", "-d", HTTPTEST + "cli/p1.ttl999", "-n", "<x>"], errorMatch: "Not Found", status: 1 },
    { name: "results-missing-http", args: ["--json-manifest", HTTPTEST + "cli/manifest-results-missing.json"], errorMatch: "Not Found", status: 1 },
    //  --dry-run
    { name: "simple-bad-shex-http" , args: ["-x", HTTPTEST + "cli/1dotOr2dot.shex999", "-s", "<http://a.example/S1>", "-d", HTTPTEST + "cli/p1.ttl", "-n", "<x>", "--dry-run"], errorMatch: "Not Found", status: 1 },
    { name: "results-missing-http-dry", args: ["--json-manifest", HTTPTEST + "cli/manifest-results-missing.json", "--dry-run"], errorMatch: "Not Found", status: 1 },

    // local file access
    { name: "simple-local" , args: ["-x", "cli/1dotOr2dot.shex", "-s", "<http://a.example/S1>", "-d", "cli/p1.ttl", "-n", "<x>"], result: "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "missing-node" , args: ["-x", "cli/1dotOr2dot.shex", "-s", "<http://a.example/S1>", "-d", "cli/p1.ttl", "-n", "<x999>"], result: "cli/1dotOr2dot_fail_p1_p2_p3.val", status: 2 },
    { name: "missing-shape" , args: ["-x", "cli/1dotOr2dot.shex", "-s", "<http://a.example/S1999>", "-d", "cli/p1.ttl", "-n", "<x>"], errorMatch: "example/S1\n", status: 1 },
    { name: "simple-json" , args: ["--json-manifest", "cli/manifest-simple.json"], result: "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-jsonld" , args: ["--json-manifest", "cli/manifest-simple.jsonld"], result: "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-as-jsonld" , args: ["--jsonld-manifest", "cli/manifest-simple.jsonld"], result: "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-as-turtle" , args: ["--turtle-manifest", "cli/manifest-simple.ttl"], result: "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "json-override" , args: ["--json-manifest", "cli/manifest-simple.json", "-n", "<x>", "-s", "<http://a.example/S1>"], result: "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "json-override-fail" , args: ["--json-manifest", "cli/manifest-simple.json", "-n", "<x999>", "-s", "<http://a.example/S1>"], result: "cli/1dotOr2dot_fail_p1_p2_p3.val", status: 2 },
    { name: "turtle-override" , args: ["--turtle-manifest", "cli/manifest-simple.ttl", "-n", "<x>", "-s", "<http://a.example/S1>"], result: "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "turtle-override-fail" , args: ["--turtle-manifest", "cli/manifest-simple.ttl", "-n", "<x999>", "-s", "<http://a.example/S1>"], result: "cli/1dotOr2dot_fail_p1_p2_p3.val", status: 2 },
    { name: "results", args: ["--json-manifest", "cli/manifest-results.json"], resultText: "true\ntrue\ntrue\ntrue\ntrue\ntrue\ntrue\n", status: 0 },
    { name: "test-name", args: ["--json-manifest", "cli/manifest-results.json", "--test-name", "1dotOr2dot-someOf_pass_p1-p2p3"], resultText: "true\n", status: 0 },
    { name: "shape-map", args: ["--json-manifest", "cli/manifest-results.json", "--map", '[{"node":"x", "shape":"http://a.example/S1"}]'], resultText: "true\ntrue\ntrue\ntrue\ntrue\ntrue\ntrue\n", status: 0 },
    { name: "shape-map-fail", args: ["--json-manifest", "cli/manifest-results.json", "--map", '[{"node":"y", "shape":"http://a.example/S1"}]'], resultMatch: "false", status: 3 },
    //  --dry-run
    { name: "simple-dry" , args: ["-x", "cli/1dotOr2dot.shex", "-s", "<http://a.example/S1>", "-d", "cli/p1.ttl", "-n", "<x>", "--dry-run"], resultText: "", status: 0 },
    { name: "simple-as-jsonld-dry" , args: ["--jsonld-manifest", "cli/manifest-simple.jsonld", "--dry-run"], resultText: "", status: 0 },
    { name: "simple-as-jsonld-dry-inv" , args: ["--jsonld-manifest", "cli/manifest-simple.jsonld", "--dry-run", "--invocation"], resultMatch: ".bin/shex-validate", status: 0 },

    // HTTP access via raw.githubusercontent.com
    { name: "simple-http" , args: ["-x", HTTPTEST + "cli/1dotOr2dot.shex", "-s", "<http://a.example/S1>", "-d", HTTPTEST + "cli/p1.ttl", "-n", "<x>"], result: HTTPTEST + "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-json-http" , args: ["--json-manifest", HTTPTEST + "cli/manifest-simple.json"], result: HTTPTEST + "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-jsonld-http" , args: ["--json-manifest", HTTPTEST + "cli/manifest-simple.jsonld"], result: HTTPTEST + "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-as-jsonld-http" , args: ["--jsonld-manifest", HTTPTEST + "cli/manifest-simple.jsonld"], result: HTTPTEST + "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-as-turtle-http" , args: ["--turtle-manifest", HTTPTEST + "cli/manifest-simple.ttl"], result: HTTPTEST + "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "results-http", args: ["--json-manifest", HTTPTEST + "cli/manifest-results.json"], resultText: "true\ntrue\ntrue\ntrue\ntrue\ntrue\ntrue\n", status: 0 },

    // backticks
    { name: "simple" ,
      args: ["-x", "cli/3backtick.shex", "-s", "http://a.example/S", "-d", "cli/backtick.ttl", "-n", "http://a.example/s", "--term-resolver", "cli/backtick.owl"],
      result: "cli/3backtick_pass.val",
      status: 0 },
    { name: "backtick-json" ,
      args: ["--json-manifest", "cli/manifest-backtick.json"],
      result: "cli/3backtick_pass.val",
      status: 0 },
    { name: "backtick-jsonld" ,
      args: ["--json-manifest", "cli/manifest-backtick.jsonld"],
      result: "cli/3backtick_pass.val",
      status: 0 },
    { name: "backtick-as-jsonld" ,
      args: ["--jsonld-manifest", "cli/manifest-backtick.jsonld"],
      result: "cli/3backtick_pass.val",
      status: 0 },
    { name: "backtick-as-turtle" ,
      args: ["--turtle-manifest", "cli/manifest-backtick.ttl"],
      result: "cli/3backtick_pass.val",
      status: 0 }
  ],

  "shex-to-json": [
    { name: "help" , args: ["--help"], errorMatch: "example", status: 1 },
    { name: "garbage" , args: ["--garbage"], errorMatch: "(Invalid|Unknown) option", status: 1 },
    { name: "simple" , args: ["-a", "cli/1dotOr2dot.shex"], result: "cli/1dotOr2dot.json", status: 0 },
    { name: "simple-http" , args: ["-a", HTTPTEST + "cli/1dotOr2dot.shex"], result: "cli/1dotOr2dot.json", status: 0 },
    { name: "simple-bad-file" , args: ["cli/1dotOr2dot.shex999"], errorMatch: "ENOENT", status: 1 },
    { name: "simple-bad-http" , args: [HTTPTEST + "cli/1dotOr2dot.shex999"], errorMatch: "Not Found", status: 1 },
  ],

  "json-to-shex": [
    { name: "help" , args: ["--help"], errorMatch: "example", status: 1 },
    { name: "garbage" , args: ["--garbage"], errorMatch: "(Invalid|Unknown) option", status: 1 },
    { name: "simple" , args: ["cli/1dotOr2dot.json", "--prefixes", '{ "": "http://a.example/" }'], resultNoSpace: "cli/1dotOr2dot.shex", status: 0 },
    { name: "simple-http" , args: [HTTPTEST + "cli/1dotOr2dot.json", "--prefixes", '{ "": "http://a.example/" }'], resultNoSpace: "cli/1dotOr2dot.shex", status: 0 },
    { name: "simple-bad-file" , args: ["cli/1dotOr2dot.json999"], errorMatch: "ENOENT", status: 1 },
    { name: "simple-bad-http" , args: [HTTPTEST + "cli/1dotOr2dot.json999"], errorMatch: "Not Found", status: 1 },
  ],

  "shexmap-materialize": [
    { name: "help", args: ["--help"], errorMatch: "Examples", status: 1 },
    { name: "garbage", args: ["--garbage"], errorMatch: "(Invalid|Unknown) option", status: 1 },
    { name: "no-target-file-specified", args: ["--jsonvars vars.json"], errorMatch: "No ShEx target schema file specified.", status: 1 },
    { name: "no-target-file", args: ["--target", "cli/1dotOr2dot.json999"], errorMatch: "ENOENT", status: 1 },
    { name: "no-jsonvars-file", args: ["--target", "Map/vpr-FHIR/FHIRConditionCompact.shex", "--jsonvars", "cli/1dotOr2dot.json999"], errorMatch: "ENOENT", status: 1 },
    { name: "target-file", args: ["--target", "Map/vpr-FHIR/FHIRConditionCompact.shex", "--jsonvars", "Map/vpr-FHIR/vars.json" ], stdin: "Map/vpr-FHIR/vprPatient-vprSchema.val", resultMatch: "b15", status: 0 },
    { name: "target-file", args: ["--target", "Map/vpr-FHIR/FHIRConditionCompact.shex", "--jsonvars", "Map/vpr-FHIR/vars.json", "--root", "http://hl7.org/fhir/shape/Problem"], stdin: "Map/vpr-FHIR/vprPatient-vprSchema.val", resultMatch: "Problem", status: 0 }
  ]
};

if (!TEST_cli) {
  console.warn("Skipping cli-tests; to activate these tests, set environment variable TEST_cli=true");

} else {

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
      "errorMatch" in test ? { errorMatch: RegExp(test.errorMatch) } :
      ShExLoader.GET(test.result).then(function (loaded) { return { result: loaded }; });

      test.exec = Queue.add(cancel => new Promise(function (resolve, reject) {
        process.chdir(__dirname); // the above paths are relative to this directory

        var program = child_process.spawn("../node_modules/.bin/" + script, test.args);

        if (typeof test.stdin !== "undefined") {  
          // redirecting stdin for this test
          fs.createReadStream(test.stdin).pipe(program.stdin)
        }

        var stdout = "", stderr = ""

        program.stdout.on("data", function(data) { stdout += data; });
        program.stderr.on("data", function(data) { stderr += data; });
        program.on("exit", function(exitCode) {
          setTimeout(
            () => resolve({stdout:stdout, stderr:stderr, exitCode:exitCode}), 0
          )
        });
        program.on("error", function(err) { reject(err); });
        cancel.on('timeout', err => {
          program.kill()
          reject()
        })
      }), 60 * 1000); // 1 minute
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

    var setSlow = process.env["CLI_TIMEOUT"]; // CLI_TIMEOUT=4000 will run tests with timout of 4s
    this.timeout(setSlow && setSlow !== "1" ? parseInt(setSlow) : 6000);
    if (TESTS)
      tests = tests.filter(function (t) {
        return TESTS.indexOf(t.name) !== -1;
      });

    tests.forEach(function (test) {
      it("should execute $(" + test.args.join(" ") + ")"+
         ("stdin" in test ?
          " with stdin from " + test.stdin :
          "") +
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

             if (test.status === 0) {      // Keep this test before exitCode in order to
               expect(exec.stderr).to.be.empty; // print errors from spawn.
             }

             if ("errorMatch" in ref)
               expect(exec.stderr).to.match(ref.errorMatch);
             if ("resultMatch" in ref)
               expect(exec.stdout).to.match(ref.resultMatch);
             else if ("resultText" in ref)
               expect(exec.stdout).to.equal(ref.resultText);
             else if ("resultNoSpace" in ref)
               expect(exec.stdout.replace(/[ \n]/g, "")).to.equal(ref.resultNoSpace.text.replace(/[ \n]/g, ""));
             else if ("result" in ref) {
               expect(JSON.parse(exec.stdout)).to.deep.equal(
                 ShExUtil.absolutizeResults(
                   JSON.parse(ref.result.text), ref.result.url));}
             else if (!("errorMatch" in ref))
               throw Error("unknown test criteria in " + JSON.stringify(ref));

             expect(exec.exitCode).to.equal(test.status);
             done();
           }).catch(function (e) { done(e); });
         }).timeout(2 * 60 * 1000); // 2 mins for the whole test suite
    });
  });
});

}

