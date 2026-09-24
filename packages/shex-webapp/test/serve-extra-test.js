/** shex-serve's command line and the corners serve-test leaves: finding the
 * workspace root, a directory that has an index.html, and the usage text. */
"use strict";

const expect = require("chai").expect;
const Path = require("path");
const Fs = require("fs");
const Os = require("os");
const child_process = require("child_process");
const {makeServer, repoRoot} = require("../lib/shex-serve");

const ServeScript = Path.join(__dirname, "../bin/shex-serve");

describe("shex-serve (extra)", function () {
  this.timeout(20000);
  const tmp = Fs.mkdtempSync(Path.join(Os.tmpdir(), "shex-serve-"));
  Fs.mkdirSync(Path.join(tmp, "site"));
  Fs.writeFileSync(Path.join(tmp, "site", "index.html"), "<!DOCTYPE html><title>site index</title>\n");

  it("finds the enclosing workspace root, or settles for where it started", function () {
    expect(repoRoot(__dirname)).to.equal(Path.resolve(__dirname, "../../.."));
    expect(repoRoot(tmp), "nothing above a temp dir declares workspaces").to.equal(Path.resolve(tmp));
  });

  it("serves a directory's index.html", async function () {
    const server = makeServer(tmp);
    await new Promise(resolve => server.listen(0, resolve));
    try {
      const resp = await fetch(`http://localhost:${server.address().port}/site/`);
      expect(resp.status).to.equal(200);
      expect(await resp.text()).to.include("site index");
    } finally {
      await new Promise(resolve => server.close(resolve));
    }
  });

  function run (args, onStdout) {
    return new Promise((resolve, reject) => {
      const child = child_process.spawn(ServeScript, args, {cwd: tmp});
      let stdout = "", stderr = "";
      child.stdout.on("data", d => { stdout += d; if (onStdout && onStdout(stdout)) child.kill(); });
      child.stderr.on("data", d => { stderr += d; });
      child.on("close", (code, signal) => resolve({stdout, stderr, code, signal}));
      child.on("error", reject);
    });
  }

  it("prints its usage on --help, and on an option it doesn't know", async function () {
    const help = await run(["--help"]);
    expect(help.code).to.equal(0);
    expect(help.stderr).to.include("usage: shex-serve [--port N] [--root DIR] [--coi]");
    const bogus = await run(["--bogus"]);
    expect(bogus.code).to.equal(1);
    expect(bogus.stderr).to.include("usage: shex-serve");
  });

  it("announces what it serves and where", async function () {
    const port = 40000 + Math.floor(Math.random() * 10000); // (-p 0 would fall back to the default port)
    const {stdout, signal} = await run(["-p", String(port), "-r", tmp, "--coi"], out => out.includes("cross-origin isolated"));
    expect(stdout).to.include(`serving ${Path.resolve(tmp)} on http://localhost:${port}/ (cross-origin isolated)`);
    expect(signal, "stopped by the test once it had spoken").to.equal("SIGTERM");
  });
});
