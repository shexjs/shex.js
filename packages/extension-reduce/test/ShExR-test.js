/** ShExR, read by ShEx.
 *
 * `ShExUtil.valuesToSchema` is about 280 lines of hand-written walking that
 * turns a ShExR graph into ShExJ.  Everything it knows is already written
 * down in ShExR.shex, production by production -- so with one action per
 * production saying what that production means in ShExJ, the reader is a
 * reader ShEx generates.
 *
 * The corpus is shexTest's schemas/: every `.ttl` there is a ShExR graph
 * with a `.json` beside it saying what it means.  That is a lot of parses to
 * check a reader against, so this runs the whole directory and reports what
 * fraction the actions get right.
 */
"use strict";

const {expect} = require("chai");
const Fs = require("fs");
const Path = require("path");
const ShExUtil = require("@shexjs/util");
const {makeReader, read} = require("../examples/shexr/reader.js");
const findPath = require("./findPath.js");

const BASE = "http://a.example/application/base/";
const schemasPath = findPath("schemas");
const HERE = Path.join(__dirname, "..", "examples", "shexr");
// the repository's one copy of the spec's ShExR.shex (shex-util checks it)
const SHEXR = Path.join(__dirname, "..", "..", "shex-util", "ShExR.shex");
const ACTIONS = Path.join(HERE, "shexr-actions.ttl");

const reader = makeReader(Fs.readFileSync(SHEXR, "utf8"),
                          Fs.readFileSync(ACTIONS, "utf8"), BASE);

const readShExR = ttlPath => read(reader, Fs.readFileSync(ttlPath, "utf8"), BASE);

const canon = schema => ShExUtil.canonicalize(schema, BASE);
/** JSON with its keys in order, so two schemas compare by what they say */
const stable = o =>
      o === null || typeof o !== "object" ? JSON.stringify(o)
      : Array.isArray(o) ? "[" + o.map(stable).join(",") + "]"
      : "{" + Object.keys(o).sort().map(k => JSON.stringify(k) + ":" + stable(o[k])).join(",") + "}";

describe("ShExR, read by ShEx", function () {

  /* ...and what the manifest entry validates: a schema, written as RDF,
   * that reads as the ShExC in its own header. */
  it("should read the schema the example ships", function () {
    const got = readShExR(Path.join(HERE, "issue-schema.ttl"));
    expect(canon(got)).to.deep.equal(canon(ShExUtil.ShExJtoAS(
      require("@shexjs/parser").construct("http://a.example/", null, {index: true}).parse(`
PREFIX : <http://a.example/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
BASE <http://a.example/>
<#IssueShape> {
  :state      [:unassigned :assigned] ;
  :reportedBy @<#UserShape> ;
  :reportedOn xsd:dateTime ?
}
<#UserShape> {
  :name  xsd:string ;
  :email IRI *
}`, "http://a.example/"))));
  });

  it("should read a one-triple-constraint schema", function () {
    const got = readShExR(Path.join(schemasPath, "1dot.ttl"));
    expect(canon(got)).to.deep.equal(
      canon(ShExUtil.ShExJtoAS(JSON.parse(
        Fs.readFileSync(Path.join(schemasPath, "1dot.json"), "utf8")))));
  });

  /* Every .ttl in shexTest/schemas is a ShExR graph with a .json beside it.
   * The count is the honest measure of how much of ShExR these actions
   * cover; the list of what is left says what to write next. */
  describe("over the whole shexTest corpus", function () {
    this.timeout(600000);
    const ttls = Fs.readdirSync(schemasPath)
          .filter(f => /\.ttl$/.test(f) && f[0] !== "_")
          .filter(f => !/^(coverage|representationTests)\./.test(f))
          .filter(f => Fs.existsSync(Path.join(schemasPath, f.replace(/\.ttl$/, ".json"))));
    const outcome = {read: [], differed: [], threw: []};

    before(function () {
      ttls.forEach(f => {
        let got;
        try {
          got = readShExR(Path.join(schemasPath, f));
        } catch (e) {
          outcome.threw.push(f + ": " + String(e.message).split("\n")[0]);
          return;
        }
        let want;
        try {
          want = ShExUtil.ShExJtoAS(JSON.parse(
            Fs.readFileSync(Path.join(schemasPath, f.replace(/\.ttl$/, ".json")), "utf8")));
        } catch (e) {
          return;                 // not a schema: coverage.json and friends
        }
        if (got !== null && stable(canon(got)) === stable(canon(want)))
          outcome.read.push(f);
        else
          outcome.differed.push(f);
      });
      if (process.env.VERBOSE) {
        console.warn(`read ${outcome.read.length}/${ttls.length}`);
        console.warn("threw:\n  " + outcome.threw.slice(0, 40).join("\n  "));
        console.warn("differed:\n  " + outcome.differed.slice(0, 40).join("\n  "));
      }
    });

    it("should have a corpus to read", function () {
      expect(ttls.length).to.be.above(400);
    });

    it("should read all of it but the fixture shexTest itself has switched off", function () {
      const report = `read ${outcome.read.length} of ${ttls.length}; `
            + `differed: ${outcome.differed.join(" ") || "none"}; `
            + `threw: ${outcome.threw.join(" ") || "none"}`;
      expect(outcome.differed, report).to.deep.equal([]);
      // 3circRefS2-IS3 doesn't comply with ShExR.shex; its entry in
      // schemas/manifest.ttl is commented out for the same reason.
      expect(outcome.threw.map(t => t.split(":")[0]), report)
        .to.deep.equal(["3circRefS2-IS3.ttl"]);
      expect(outcome.read.length / ttls.length, report).to.be.above(0.99);
    });
  });
});
