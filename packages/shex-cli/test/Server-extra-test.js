/** The validate server's other doors: the HTML page and template output,
 * boolean reports, multipart uploads, a data file that won't parse, an
 * unsupported method, and the banner it prints when not --terse.
 * Server-test.js drives the JSON validation endpoint; this covers the rest. */
"use strict";

const TEST_server = "TEST_server" in process.env ? JSON.parse(process.env["TEST_server"]) : false;
const child_process = require("child_process");
const Path = require("path");
const Fs = require("fs");
const expect = require("chai").expect;

const ValidateScript = Path.join(__dirname, "../bin/validate");
const CliDir = Path.join(__dirname, "cli");
const S1 = "http://a.example/S1";

if (!TEST_server) {
  console.warn("Skipping server-extra-tests; to activate these tests, set environment variable TEST_server=true");
} else {
  describe("The validate server, off the JSON path", function () {
    this.timeout(60000);
    const REQUESTS = 9; // --serve-n: the server closes after this many
    let server, baseUrl, rootUrl, stdout = "", stderr = "";

    before(async function () {
      // port 0 lets the OS pick; the (non --terse) banner says which one
      server = child_process.spawn(ValidateScript, ["-S", "http://localhost:0/validate", "--serve-n", String(REQUESTS)], {cwd: __dirname});
      server.stdout.on("data", d => { stdout += d; });
      server.stderr.on("data", d => { stderr += d; });
      await new Promise((resolve, reject) => {
        server.stdout.on("data", () => {
          // wait for the whole banner: its first line can arrive in a chunk of its own
          const m = stdout.match(/Web interface: <([^>]+)>/);
          if (m && stdout.includes("Press CTRL+C to stop")) { baseUrl = m[1]; resolve(); }
        });
        server.on("exit", code => reject(Error(`server exited with ${code}\n${stderr}`)));
      });
      rootUrl = new URL("/", baseUrl).href;
    });
    after(function () { if (server && server.exitCode === null) server.kill(); });

    const form = (fields, extra = {}) => fetch(baseUrl, Object.assign({
      method: "POST",
      headers: {"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"},
      body: new URLSearchParams(fields).toString(),
    }, extra));
    const schemaText = Fs.readFileSync(Path.join(CliDir, "1dotOr2dot.shex"), "utf8");
    const dataText = Fs.readFileSync(Path.join(CliDir, "p2p3.ttl"), "utf8");

    it("prints how to reach it", function () {
      expect(stdout).to.include("HTML interface: <" + rootUrl + ">");
      expect(stdout).to.include("Press CTRL+C to stop");
    });

    it("serves the HTML page at the root, from its cache the second time", async function () {
      for (const time of ["first", "again"]) {
        const resp = await fetch(rootUrl);
        expect(resp.status, time).to.equal(200);
        expect(resp.headers.get("content-type")).to.match(/text\/html/);
        expect(await resp.text()).to.match(/<html/i);
      }
    });

    it("says what it can't serve", async function () {
      const resp = await fetch(rootUrl + "nowhere");
      expect(resp.status).to.equal(404);
      expect(await resp.text()).to.equal("failed to GET /nowhere\n");
    });

    it("fills the HTML template when asked for html", async function () {
      const resp = await form({schema: schemaText, shape: S1, data: dataText, node: "x", output: "html"});
      expect(resp.status).to.equal(200);
      expect(resp.headers.get("content-type")).to.match(/text\/html/);
      const body = await resp.text();
      expect(body).to.include('"type": "ShapeTest"');
      expect(body, "the template's placeholders are filled").to.not.include("[result]");
    });

    it("answers a boolean report", async function () {
      const resp = await form({schema: schemaText, shape: S1, data: dataText, node: "x", report: "boolean"});
      expect(resp.status).to.equal(200);
      expect(await resp.json()).to.equal(true);
    });

    it("takes the schema and data as uploaded files", async function () {
      const fd = new FormData();
      fd.append("schema", new Blob([schemaText], {type: "text/shex"}), "1dotOr2dot.shex");
      fd.append("data", new Blob([dataText], {type: "text/turtle"}), "p2p3.ttl");
      fd.append("shape", S1);
      fd.append("node", "x");
      const resp = await fetch(baseUrl, {method: "POST", body: fd});
      expect(resp.status).to.equal(200);
      const result = await resp.json();
      expect(result.type).to.equal("ShapeTest");
      expect(result.node, "the node is resolved against the upload's URL").to.equal(new URL("x", baseUrl).href);
      expect(Fs.readdirSync(Path.join(__dirname, "../rest/uploads")).filter(f => !f.startsWith(".") && f !== "README.md"), "the uploads are removed").to.deep.equal([]);
    });

    it("reports data that won't parse, and suspects a filename", async function () {
      const resp = await form({schema: schemaText, shape: S1, data: "p2p3.ttl", node: "x"});
      expect(resp.status).to.equal(500);
      const body = await resp.json();
      expect(body.type).to.equal("ParsingError");
      expect(body.errors[0]).to.match(/^Error parsing data: /);
      expect(body.errors[0]).to.include("did you send a filename instead of a file?");
    });

    it("lets a request pick the regex module", async function () {
      const resp = await form({schema: schemaText, shape: S1, data: dataText, node: "x", "regex-module": "eval-simple-1err"});
      expect(resp.status).to.equal(200);
      expect((await resp.json()).type).to.equal("ShapeTest");
    });

    it("refuses a method it doesn't serve", async function () {
      const resp = await fetch(baseUrl, {method: "PUT", body: "x=y"});
      expect(resp.status).to.equal(500);
      expect(await resp.text(), "koa hides a 5xx message").to.equal("Internal Server Error");
    });

    it("logged every request it served", async function () {
      // the refused PUT threw before the log line; server.close() then stops
      // accepting but the process lingers while fetch's pooled connections
      // are open, so it is killed in after() rather than awaited here
      await new Promise(resolve => setTimeout(resolve, 200));
      expect(stdout.match(/: (GET|POST) /g).length, "one log line per served request").to.equal(REQUESTS - 1);
    });
  });
}
