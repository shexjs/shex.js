// Test shex.js command line scripts.

"use strict";
var SLOW = "SLOW" in process.env; // Only run these tests if SLOW is set.
var VERBOSE = "VERBOSE" in process.env;
var TERSE = VERBOSE;
var TESTS = "TESTS" in process.env ? process.env.TESTS.split(/,/) : null;

var ShExLoader = require("../lib/ShExLoader");
var child_process = require('child_process');
var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var should = chai.should;
var fs = require("fs");

var manifestFile = "cli/manifest.json";
var httpTest = "http://raw.githubusercontent.com/shexSpec/shex.js/master/test/";

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

    // missing web resources
    { name: "simple-bad-shex-http" , args: ["-x", httpTest + "cli/1dotOr2dot.shex999", "-s", "http://a.example/S1", "-d", httpTest + "cli/p1.ttl", "-n", "x"], resultMatch: "Not Found", status: 1 },
    { name: "simple-bad-data-http" , args: ["-x", httpTest + "cli/1dotOr2dot.shex", "-s", "http://a.example/S1", "-d", httpTest + "cli/p1.ttl999", "-n", "x"], resultMatch: "Not Found", status: 1 },
    { name: "simple-bad-json-http" , args: ["--json-manifest", httpTest + "cli/manifest-simple.json999"], resultMatch: "Not Found", status: 1 },
    { name: "simple-bad-shex-mixed", args: ["-x", httpTest + "cli/1dotOr2dot.shex999", "-s", "http://a.example/S1", "-d", "cli/p1.ttl", "-n", "x"], resultMatch: "Not Found", status: 1 },
    { name: "simple-bad-data-mised", args: ["-x", "cli/1dotOr2dot.shex", "-s", "http://a.example/S1", "-d", httpTest + "cli/p1.ttl999", "-n", "x"], resultMatch: "Not Found", status: 1 },

    // local file access
    { name: "simple" , args: ["-x", "cli/1dotOr2dot.shex", "-s", "http://a.example/S1", "-d", "cli/p1.ttl", "-n", "x"], result: "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-json" , args: ["--json-manifest", "cli/manifest-simple.json"], result: "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-jsonld" , args: ["--json-manifest", "cli/manifest-simple.jsonld"], result: "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-as-jsonld" , args: ["--jsonld-manifest", "cli/manifest-simple.jsonld"], result: "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-as-turtle" , args: ["--turtle-manifest", "cli/manifest-simple.ttl"], result: "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "results", args: ["--json-manifest", "cli/manifest-results.json"], resultText: "true\ntrue\ntrue\ntrue\ntrue\ntrue\n", status: 2 },

    // HTTP access via raw.githubusercontent.com
    { name: "simple-http" , args: ["-x", httpTest + "cli/1dotOr2dot.shex", "-s", "http://a.example/S1", "-d", httpTest + "cli/p1.ttl", "-n", "x"], result: httpTest + "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-json-http" , args: ["--json-manifest", httpTest + "cli/manifest-simple.json"], result: httpTest + "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-jsonld-http" , args: ["--json-manifest", httpTest + "cli/manifest-simple.jsonld"], result: httpTest + "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-as-jsonld-http" , args: ["--jsonld-manifest", httpTest + "cli/manifest-simple.jsonld"], result: httpTest + "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-as-turtle-http" , args: ["--turtle-manifest", httpTest + "cli/manifest-simple.ttl"], result: httpTest + "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "results-http", args: ["--json-manifest", httpTest + "cli/manifest-results.json"], resultText: "true\ntrue\ntrue\ntrue\n", status: 2 }
  ],

  "shex-to-json": [
    { name: "help" , args: ["--help"], resultMatch: "example", status: 1 },
    { name: "garbage" , args: ["--garbage"], resultMatch: "(Invalid|Unknown) option", status: 1 },
    { name: "simple" , args: ["cli/1dotOr2dot.shex"], result: "cli/1dotOr2dot.json", status: 0 },
    { name: "simple-http" , args: [httpTest + "cli/1dotOr2dot.shex"], result: "cli/1dotOr2dot.json", status: 0 },
    { name: "simple-bad-file" , args: ["cli/1dotOr2dot.shex999"], resultMatch: "ENOENT", status: 1 },
    { name: "simple-bad-http" , args: [httpTest + "cli/1dotOr2dot.shex999"], resultMatch: "Not Found", status: 1 },
  ],

  "json-to-shex": [
    { name: "help" , args: ["--help"], resultMatch: "example", status: 1 },
    { name: "garbage" , args: ["--garbage"], resultMatch: "(Invalid|Unknown) option", status: 1 },
    { name: "simple" , args: ["cli/1dotOr2dot.json"], resultNoSpace: "cli/1dotOr2dot.shex", status: 0 },
    { name: "simple-http" , args: [httpTest + "cli/1dotOr2dot.json"], resultNoSpace: "cli/1dotOr2dot.shex", status: 0 },
    { name: "simple-bad=file" , args: ["cli/1dotOr2dot.json999"], resultMatch: "ENOENT", status: 1 },
    { name: "simple-bad-http" , args: [httpTest + "cli/1dotOr2dot.json999"], resultMatch: "Not Found", status: 1 },
  ]
};

if (SLOW)
Object.keys(AllTests).forEach(function (script) {
  var tests = AllTests[script];

  describe("The " + script + " script", function () {
    "use strict";

    this.timeout(3000);
    if (TESTS)
      tests = tests.filter(function (t) {
        return TESTS.indexOf(t.name) !== -1;
      });

    tests.forEach(function (test) {
      try {
        it("should execute $(" + test.args.join(" ") + ")"+
           ( "resultMatch" in test ?
             (" and match /" + test.resultMatch) + "/" :
             (" and get " +
              ("resultText" in test ? JSON.stringify(test.resultText) :
               "resultNoSpace" in test ? JSON.stringify(test.resultNoSpace) : test.result))
           ) +
           " in test '" + test.name + "'.",
           function (done) {
             var ref = 
               "resultText" in test ? Promise.resolve({ resultText: test.resultText }) :
               "resultNoSpace" in test ? ShExLoader.GET(test.resultNoSpace).then(function (loaded) { return { resultNoSpace: loaded }; }) :
               "resultMatch" in test ? Promise.resolve({ resultMatch: RegExp(test.resultMatch) }) :
               ShExLoader.GET(test.result).then(function (loaded) { return { result: loaded }; });
             ref.then(function (loaded) {
               process.chdir(__dirname); // the above paths are relative to this directory

               var program = child_process.spawn("../bin/" + script, test.args);
               var stdout = "", stderr = "";
               
               program.stdout.on("data", function(data) { stdout += data; });
               program.stderr.on("data", function(data) { stderr += data; });

               program.on("exit", function(exitCode) {

                 if (test.status === 0)        // Keep this test before exitCode
                   expect(stderr).to.be.empty; // print errors from spawn.

                 expect(exitCode).to.equal(test.status);

                 if ("resultMatch" in loaded)
                   expect(stderr).to.match(loaded.resultMatch);
                 else if ("resultText" in loaded)
                   expect(stdout).to.equal(loaded.resultText);
                 else if ("resultNoSpace" in loaded)
                   expect(stdout.replace(/[ \n]/g, "")).to.equal(loaded.resultNoSpace.text.replace(/[ \n]/g, ""));
                 else if ("result" in loaded)
                   expect(JSON.parse(stdout)).to.deep.equal(
                     ShExUtil.absolutizeResults(
                       JSON.parse(loaded.result.text), loaded.result.url));
                 else
                   throw Error("unknown test criteria in " + JSON.stringify(loaded));
                 done();
               });

               program.on("error", function(err) {
                 done(err);
               });
             }).catch(function (e) { done(e); });
           });
      } catch (e) {
        var throwMe = new Error("Error setting up test " + test.name + " " + e);
        throwMe.stack = "Error setting up test " + test.name + " " + e.stack;
        throw throwMe;
      }
    });
  });
});

