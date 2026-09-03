/** The one copy of ShExR.shex, and the text compiled from it. */
"use strict";

const {expect} = require("chai");
const Fs = require("fs");
const Path = require("path");
const ShExUtil = require("..");
const findPath = require("./findPath.js");

const SHEXR = Path.join(__dirname, "..", "ShExR.shex");

describe("ShExR.shex", function () {
  it("should be what ShExUtil.ShExRSchema was generated from", function () {
    expect(ShExUtil.ShExRSchema, "out of date: node tools/gen-shexr-schema.js && npx tsc")
      .to.equal(Fs.readFileSync(SHEXR, "utf8"));
  });

  it("should be the ShExR.shex the spec has", function () {
    let spec;
    try { spec = findPath("doc") + "ShExR.shex"; } catch (e) { this.skip(); }
    expect(Fs.readFileSync(SHEXR, "utf8"), "out of date: cp " + spec + " " + SHEXR)
      .to.equal(Fs.readFileSync(spec, "utf8"));
  });
});
