/** tools/publish-ordered.js: every package after what it depends on. */
"use strict";
const expect = require("chai").expect;
const {packages, order} = require("../../../tools/publish-ordered.js");

describe("the publish order", function () {
  const all = packages();
  const ordered = order(all);

  it("should list every workspace package once", function () {
    expect(ordered.map(p => p.name).sort()).to.deep.equal(all.map(p => p.name).sort());
  });

  it("should put each package after the workspace packages it depends on", function () {
    const at = new Map(ordered.map((p, i) => [p.name, i]));
    ordered.forEach(p => p.deps.forEach(d =>
      expect(at.get(d), `${p.name} wants ${d} published first`).to.be.below(at.get(p.name))));
  });

  it("should refuse a cycle rather than loop", function () {
    expect(() => order([{name: "a", deps: ["b"]}, {name: "b", deps: ["a"]}])).to.throw(/cycle/);
  });
});
