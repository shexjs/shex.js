// Test shex.js command line scripts.

"use strict";
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

var AllTests = {
  "validator": [
    { name: "help" , args: ["--help"], resultMatch: "example", status: 1 },
    { name: "garbage" , args: ["--garbage"], resultMatch: "Invalid option", status: 1 },
    { name: "simple" , args: ["-x", "cli/1dotOr2dot.shex", "-s", "http://a.example/S1", "-d", "cli/p1.ttl", "-n", "x"], result: "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-json" , args: ["--json-manifest", "cli/manifest-simple.json"], result: "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-jsonld" , args: ["--json-manifest", "cli/manifest-simple.jsonld"], result: "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-as-jsonld" , args: ["--jsonld-manifest", "cli/manifest-simple.jsonld"], result: "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "simple-as-turtle" , args: ["--turtle-manifest", "cli/manifest-simple.ttl"], result: "cli/1dotOr2dot_pass_p1.val", status: 0 },
    { name: "results", args: ["--json-manifest", "cli/manifest-results.json"], resultText: "true\ntrue\ntrue\ntrue\n", status: 2 }
  ]
};

Object.keys(AllTests).forEach(function (script) {
  var tests = AllTests[script];

  describe("The " + script + " script", function () {
    "use strict";

    if (TESTS)
      tests = tests.filter(function (t) {
        return TESTS.indexOf(t.name) !== -1;
      });

    tests.forEach(function (test) {
      try {
        it("should execute $(" + test.args.join(" ") + ")"+
           ( "resultMatch" in test ?
             (" and match /" + test.resultMatch) + "/" :
             (" and get " + ("resultText" in test ? JSON.stringify(test.resultText) : test.result))
           ) +
           " in test '" + test.name + "'.",
           function (done) {
             var ref = 
               "resultText" in test ? Promise.resolve(test.resultText) :
               "resultMatch" in test ? Promise.resolve(RegExp(test.resultMatch)) :
               ShExLoader.GET(test.result);
             ref.then(function (loaded) {
               process.chdir(__dirname); // the above paths are relative to this directory

               var program = child_process.spawn("../bin/validate", test.args);
               var stdout = "", stderr = "";
               
               program.stdout.on("data", function(data) { stdout += data; });
               program.stderr.on("data", function(data) { stderr += data; });

               program.on("exit", function(exitCode) {

                 if (test.status === 0)        // Keep this test before exitCode
                   expect(stderr).to.be.empty; // print errors from spawn.

                 expect(exitCode).to.equal(test.status);

                 if (loaded instanceof RegExp)
                   expect(stderr).to.match(loaded);
                 else if (typeof(loaded) === "string")
                   expect(stdout).to.equal(loaded);
                 else
                   expect(JSON.parse(stdout)).to.deep.equal(
                     ShExUtil.absolutizeResults(
                       JSON.parse(loaded.text), loaded.url));

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

