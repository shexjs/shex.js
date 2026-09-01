/** Reference results have to mean the same thing on somebody else's disk.
 *
 * A validation result names its focus node by resolving the data file's own
 * relative IRIs against that file -- so on a checkout at /home/runner it
 * says `file:///home/runner/...`, and on mine it says something else.  The
 * loader in Validation-test resolves a *relative* reference against the data
 * URL for exactly this reason, and 540 of these files carry no file: URL at
 * all because their nodes are http: IRIs from the data's own base.
 *
 * Six had absolute ones written into them, and CI failed on every run: 6
 * files x 2 regex engines = 12.  REGEN now relativizes before writing, and
 * this says so if that ever stops being true.
 */
"use strict";

const expect = require("chai").expect;
const fs = require("fs");
const path = require("path");

const valDir = path.join(__dirname, "val");

describe("reference results", function () {
  const files = fs.readdirSync(valDir).filter(f => /\.(val|err)$/.test(f));

  it("should have some to check", function () {
    expect(files.length).to.be.above(100);
  });

  /* Any absolute file: URL is a path on whoever's machine wrote it.  There
   * is no such thing as one that travels, which is why the fix is a relative
   * reference rather than a cleverer absolute one. */
  it("should name nothing by an absolute file: URL", function () {
    const offenders = [];
    for (const f of files) {
      const text = fs.readFileSync(path.join(valDir, f), "utf8");
      const found = text.match(/"file:\/\/[^"]*"/g);
      if (found)
        offenders.push(f + ": " + found[0]);
    }
    expect(offenders, "write these relative to the data, as the loader reads them")
      .to.deep.equal([]);
  });

  it("should be JSON", function () {
    files.forEach(f => {
      const at = path.join(valDir, f);
      expect(() => JSON.parse(fs.readFileSync(at, "utf8")), f).to.not.throw();
    });
  });
});
