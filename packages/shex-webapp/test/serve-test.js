/** Tests for shex-serve: static serving, trivial content negotiation
 * (extensionless URLs), and root confinement.
 */
"use strict";

const expect = require("chai").expect;
const Path = require("path");
const fetch = require("node-fetch");
const {makeServer} = require("../lib/shex-serve");

const repoRoot = Path.join(__dirname, "../../..");

describe("shex-serve", function () {
  let server, port;

  before(function (done) {
    server = makeServer(repoRoot);
    server.listen(0, () => { // ephemeral port
      port = server.address().port;
      done();
    });
  });

  after(function (done) {
    server.close(done);
  });

  const get = (path, accept) => fetch(`http://localhost:${port}${path}`,
                                      accept ? {headers: {accept}} : {});

  it("should serve files with content types", async function () {
    const resp = await get("/packages/shex-webapp/doc/shex-simple.html");
    expect(resp.status).to.equal(200);
    expect(resp.headers.get("content-type")).to.include("text/html");
  });

  it("should serve shex-simple without the .html", async function () {
    const resp = await get("/packages/shex-webapp/doc/shex-simple",
                           "text/html,application/xhtml+xml,*/*;q=0.8"); // browser-ish
    expect(resp.status).to.equal(200);
    expect(resp.headers.get("content-type")).to.include("text/html");
    expect(await resp.text()).to.include("<title>");
  });

  it("should negotiate among extension siblings by Accept", async function () {
    // cli/1dotOr2dot has both .shex and .json siblings
    const asShex = await get("/packages/shex-cli/test/cli/1dotOr2dot", "text/shex");
    expect(asShex.headers.get("content-type")).to.include("text/shex");
    const asJson = await get("/packages/shex-cli/test/cli/1dotOr2dot", "application/json");
    expect(asJson.headers.get("content-type")).to.include("application/json");
  });

  it("should 404 when nothing matches", async function () {
    expect((await get("/packages/shex-webapp/doc/no-such-page")).status).to.equal(404);
  });

  it("should refuse to escape the served root", async function () {
    expect((await get("/../../../../etc/passwd")).status).to.be.oneOf([403, 404]);
  });

  it("should list directories", async function () {
    const resp = await get("/packages/");
    expect(resp.status).to.equal(200);
    expect(await resp.text()).to.include("shex-webapp/");
  });
});
