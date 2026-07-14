// Test the shex-debug command line script.

"use strict";
const TEST_cli = "TEST_cli" in process.env ? JSON.parse(process.env["TEST_cli"]) : false;
const TIME = "TIME" in process.env;

const TestUtils = require("@shexjs/util/tools/common-test-infrastructure.js");

const AllTests = {
  "shex-debug": [
    { name: "help", args: ["--help"], errorMatch: "Synopsis", status: 1 },
    { name: "missing-args", args: ["-x", "cli/1dotOr2dot.shex"], errorMatch: "Synopsis", status: 1 },
    // stdin is the command channel: break on <S1>, continue to it, run out
    { name: "debug-simple", args: ["-x", "cli/1dotOr2dot.shex", "-d", "cli/p1.ttl", "-n", "<x>", "-s", "<http://a.example/S1>"], stdin: "cli/debug-commands.txt", resultMatch: "enter <[^>]*x>@:S1[\\s\\S]*breakpoint on shape :S1[\\s\\S]*conformant", status: 0 }
  ]
};

if (!TEST_cli) {
  console.warn("Skipping shex-debug tests; to activate these tests, set environment variable TEST_cli=true");
} else {
  TestUtils.runCliTests(AllTests, __dirname, TIME);
}
