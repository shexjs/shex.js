/** --diagnose reports import loading on the console. The redraw uses TTY-only
 * stdout methods, so the controller draws only on a terminal and otherwise
 * prints just the final count (it used to crash when stdout was a pipe). */
"use strict";

const expect = require("chai").expect;
const ShExNode = require("@shexjs/node")({rdfjs: require("n3")});
const ProgressLoadController = require("../lib/ProgressLoadController")(ShExNode);

describe("ProgressLoadController", function () {
  const saved = {};
  let written;
  beforeEach(function () {
    written = [];
    for (const k of ["isTTY", "clearLine", "cursorTo", "write"]) saved[k] = process.stdout[k];
    process.stdout.clearLine = () => { written.push("<clear>"); };
    process.stdout.cursorTo = (col) => { written.push("<cursorTo " + col + ">"); };
    process.stdout.write = (text) => { written.push(text); return true; };
  });
  afterEach(function () {
    for (const k of ["isTTY", "clearLine", "cursorTo", "write"]) process.stdout[k] = saved[k];
  });

  async function load (isTTY) {
    process.stdout.isTTY = isTTY;
    const controller = new ProgressLoadController(["http://a.example/a", "http://a.example/b"]);
    controller.add(Promise.resolve({url: "http://a.example/a"}));
    controller.add(Promise.resolve({url: "http://a.example/b"}));
    const results = await controller.allLoaded();
    return results;
  }

  it("redraws a progress line per import on a terminal", async function () {
    const results = await load(true);
    expect(results.map(r => r.url)).to.deep.equal(["http://a.example/a", "http://a.example/b"]);
    expect(written).to.include("Loaded 0 of 2 imports: http://a.example/a");
    expect(written).to.include("Loaded 1 of 2 imports: http://a.example/b");
    expect(written.filter(w => w === "<clear>").length, "one redraw per import and one for the summary").to.equal(3);
    expect(written[written.length - 1]).to.equal("Loaded 2 imports.\n");
  });

  it("prints only the final count when stdout is not a terminal", async function () {
    await load(false);
    expect(written).to.deep.equal(["Loaded 2 imports.\n"]);
  });
});
