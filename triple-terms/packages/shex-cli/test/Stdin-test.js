/** validate reads a schema or data from stdin when told "-", and warns about
 * an extension it can't load rather than stopping. */
"use strict";

const TEST_cli = require("./testGate.js")("TEST_cli");
const child_process = require("child_process");
const Path = require("path");
const Fs = require("fs");
const expect = require("chai").expect;

const ValidateScript = Path.join(__dirname, "../bin/validate");
const CliDir = Path.join(__dirname, "cli");

function validate (args, stdinText) {
  return new Promise((resolve, reject) => {
    const program = child_process.spawn(ValidateScript, args, {cwd: __dirname});
    let stdout = "", stderr = "";
    program.stdout.on("data", d => stdout += d);
    program.stderr.on("data", d => stderr += d);
    program.on("close", exitCode => resolve({stdout, stderr, exitCode}));
    program.on("error", reject);
    if (stdinText !== undefined) program.stdin.end(stdinText);
  });
}

if (!TEST_cli) {
  console.warn("Skipping stdin-tests; to activate these tests, set environment variable TEST_cli=true");
} else {
  describe("validate over stdin and extensions", function () {
    this.timeout(20000);
    it("reads the schema from stdin", async function () {
      const {stdout, stderr, exitCode} = await validate(["-x", "-", "-d", "cli/p2p3.ttl", "-n", "x", "-s", "http://a.example/S1"],
                                                       Fs.readFileSync(Path.join(CliDir, "1dotOr2dot.shex"), "utf8"));
      expect(stderr).to.equal("");
      expect(exitCode).to.equal(0);
      expect(JSON.parse(stdout).type).to.equal("ShapeTest");
    });
    it("warns about an extension it can't load and carries on", async function () {
      const {stdout, stderr, exitCode} = await validate(["-x", "cli/1dotOr2dot.shex", "-d", "cli/p2p3.ttl", "-n", "x", "-s", "http://a.example/S1", "--extension", "no-such-extension-package"]);
      expect(stderr).to.include("ShEx extension \"no-such-extension-package\" not loadable");
      expect(exitCode).to.equal(0);
      expect(JSON.parse(stdout).type).to.equal("ShapeTest");
    });
  });
}
