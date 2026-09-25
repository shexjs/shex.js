"use strict";
const expect = require("chai").expect;
const child_process = require("child_process");
const Path = require("path");
const {parseRange, portIn, Slots, EnvVar} = require("../../../tools/testPorts");

describe("testPorts", function () {
  it("keeps the default ports when unset or empty", function () {
    [undefined, "", "  "].forEach(v => expect(parseRange(v), JSON.stringify(v)).to.equal(null));
    Slots.forEach(({port}) => expect(portIn(null, port)).to.equal(port));
  });

  it("moves each port to its slot in a session's range", function () {
    const range = parseRange("20100");
    expect(range).to.include({from: 20100, to: 20100 + Slots.length - 1});
    expect(Slots.map(({port}) => portIn(range, port)))
      .to.deep.equal(Slots.map((_, i) => 20100 + i));
    expect(parseRange(" 20100 - 20199 ")).to.include({from: 20100, to: 20199});
  });

  it("refuses ports it doesn't know", function () {
    expect(() => portIn(null, 1234)).to.throw(/testPort\(1234\): not a known test port/);
  });

  it("throws on a malformed or unusable range", function () {
    expect(() => parseRange("twenty")).to.throw(/expected a first port/);
    expect(() => parseRange("80")).to.throw(/1024 <= first/);
    expect(() => parseRange("65534")).to.throw(/<= 65535/);
    expect(() => parseRange("20100-20099")).to.throw(/first <= last/);
    expect(() => parseRange("20100-20101")).to.throw(new RegExp(`need ${Slots.length} ports`));
  });

  it("reads the range from " + EnvVar, function () {
    const script = `console.log(require(${JSON.stringify(Path.join(__dirname, "../../../tools/testPorts"))}).testPort(9999))`;
    const run = value => child_process.execFileSync(process.execPath, ["-e", script], {
      env: Object.assign({}, process.env, {[EnvVar]: value}), encoding: "utf8"}).trim();
    expect(run("")).to.equal("9999");
    expect(run("20100")).to.equal("20100");
  });
});
