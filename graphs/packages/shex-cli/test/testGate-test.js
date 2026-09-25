"use strict";
const expect = require("chai").expect;
const testGate = require("./testGate.js");

describe("testGate", function () {
  const NAME = "TEST_testGate_probe";
  afterEach(function () { delete process.env[NAME]; });

  function gate (value, dflt) {
    if (value === undefined) delete process.env[NAME]; else process.env[NAME] = value;
    return testGate(NAME, dflt);
  }

  it("uses the default when unset", function () {
    expect(gate(undefined)).to.equal(false);
    expect(gate(undefined, true)).to.equal(true);
  });
  it("reads true, 1, yes and on as true, in any case", function () {
    ["true", "1", "yes", "on", "TRUE", " Yes "].forEach(v => expect(gate(v), v).to.equal(true));
  });
  it("reads false, 0, no, off and empty as false, even over a true default", function () {
    ["false", "0", "no", "off", "", "False"].forEach(v => expect(gate(v, true), v).to.equal(false));
  });
  it("throws on anything else", function () {
    expect(() => gate("ture")).to.throw(/TEST_testGate_probe="ture"/);
  });
});
