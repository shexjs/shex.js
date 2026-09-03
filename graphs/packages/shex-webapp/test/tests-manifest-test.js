/** doc/tests-manifest.yaml against the manifests it was made from.
 *
 * It is every example in the repository as one suite, which is only useful
 * while it is still every example: an entry added to a package's manifest
 * and not to this one is an entry the big suite doesn't run.  The generator
 * checks itself (tools/aggregate-manifests.js), so this runs it and asks
 * whether what it would write is what is committed.
 */
"use strict";

const Fs = require("fs");
const Path = require("path");
const expect = require("chai").expect;

const ROOT = Path.join(__dirname, "../../..");
const {build} = require("../../../tools/aggregate-manifests.js");

describe("doc/tests-manifest.yaml", () => {
  it("should be what the three manifests say", () => {
    const {yaml, entries} = build(); // throws if a reference finds nothing
    expect(entries, "every example in the repository").to.be.above(25);
    expect(Fs.readFileSync(Path.join(ROOT, "doc/tests-manifest.yaml"), "utf8"),
           "out of date: run `node tools/aggregate-manifests.js`")
      .to.equal(yaml);
  });
});
