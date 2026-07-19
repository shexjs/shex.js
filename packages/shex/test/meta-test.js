/** Tests for the `shex` meta-package: the aggregate API works end-to-end and
 * the dependency ranges stay consistent with the workspace, so publishing
 * the monorepo can't strand this package (as happened when it shipped with
 * no main at all).
 */
"use strict";

const expect = require("chai").expect;
const Fs = require("fs");
const Path = require("path");
const semver = require("semver"); // transitive of npm tooling, test-only

const packagesDir = Path.join(__dirname, "../..");

describe("shex meta-package", function () {

  it("should expose the aggregate API", function () {
    const ShEx = require("..");
    ["Parser", "Writer", "Validator", "RdfJsDb", "Loader", "NodeLoader",
     "Term", "Util", "Visitor", "ShapeMap"].forEach(key => {
       expect(ShEx, key).to.have.property(key);
     });
    expect(ShEx.Validator).to.have.property("ShExValidator");
  });

  it("should parse and validate through the aggregate API", function () {
    const ShEx = require("..");
    const N3 = require("n3");
    const schema = ShEx.Parser.construct("http://a.example/", {}, {index: true})
          .parse("PREFIX : <http://a.example/>\n<S> { :p . }");
    const graph = new N3.Store();
    graph.addQuad(N3.DataFactory.quad(
      N3.DataFactory.namedNode("http://a.example/x"),
      N3.DataFactory.namedNode("http://a.example/p"),
      N3.DataFactory.literal("1")));
    const validator = new ShEx.Validator.ShExValidator(schema, ShEx.RdfJsDb(graph));
    const results = validator.validateShapeMap(
      [{node: "http://a.example/x", shape: "http://a.example/S"}]);
    expect(results[0].status).to.equal("conformant");
  });

  it("should declare every package the index requires", function () {
    const deps = require("../package.json").dependencies;
    const indexSource = Fs.readFileSync(Path.join(__dirname, "../src/shex.ts"), "utf8");
    const required = [...indexSource.matchAll(/require\("([^"]+)"\)/g)].map(m => m[1])
          .filter(pkg => pkg !== require("../package.json").name); // doc-comment example
    required.forEach(pkg => {
      expect(deps, `dependency for require("${pkg}")`).to.have.property(pkg);
    });
  });

  it("should have dependency ranges satisfied by the workspace versions", function () {
    // guards the publish flow: every @shexjs/*, shape-map, ... range must
    // match the version that will be (or was) published from this repo
    const deps = require("../package.json").dependencies;
    const workspaceVersions = {};
    Fs.readdirSync(packagesDir).forEach(dir => {
      const manifestPath = Path.join(packagesDir, dir, "package.json");
      if (Fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(Fs.readFileSync(manifestPath, "utf8"));
        workspaceVersions[manifest.name] = manifest.version;
      }
    });
    Object.entries(deps).forEach(([name, range]) => {
      expect(workspaceVersions, `workspace package ${name}`).to.have.property(name);
      expect(semver.satisfies(workspaceVersions[name], range, {includePrerelease: true}),
             `${name}@${workspaceVersions[name]} should satisfy ${range}`).to.equal(true);
    });
  });
});
