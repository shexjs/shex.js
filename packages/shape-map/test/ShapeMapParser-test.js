/** The shape-map parser resolves relative IRIs itself (a port of N3's
 * resolver): dot segments, root- and scheme-relative forms, fragments and
 * query strings, each side against its own base. And a parse error carries
 * where it happened. */
"use strict";

const expect = require("chai").expect;
const ShapeMap = require("..");

const parser = ShapeMap.Parser.construct(
  "http://m.example/",
  {base: "http://s.example/x/y/", prefixes: {"": "http://s.example/"}},
  {base: "http://d.example/a/b/", prefixes: {ex: "http://d.example/"}});
const pair = text => { const [p] = parser.parse(text); return [p.node, p.shape]; };

describe("shape-map IRI resolution", function () {
  it("resolves dot segments against each side's base", function () {
    expect(pair("<../n>@<../../S>")).to.deep.equal(["http://d.example/a/n", "http://s.example/S"]);
    expect(pair("<./p/../q/./r>@<S>")).to.deep.equal(["http://d.example/a/b/q/r", "http://s.example/x/y/S"]);
    expect(pair("<../../../../deep>@<S>"), "cannot climb above the root").to.deep.equal(["http://d.example/deep", "http://s.example/x/y/S"]);
    expect(pair("<a/b/..>@<S>"), "a trailing ..").to.deep.equal(["http://d.example/a/b/a/", "http://s.example/x/y/S"]);
    expect(pair("<a/.>@<S>"), "a trailing .").to.deep.equal(["http://d.example/a/b/a/", "http://s.example/x/y/S"]);
    expect(pair("<../..>@<S>")).to.deep.equal(["http://d.example/", "http://s.example/x/y/S"]);
  });
  it("resolves root-, scheme-, fragment- and query-relative IRIs, and the empty one", function () {
    expect(pair("</root/../r>@<S>")).to.deep.equal(["http://d.example/r", "http://s.example/x/y/S"]);
    expect(pair("<//h.example/z/../w>@<S>")).to.deep.equal(["http://h.example/w", "http://s.example/x/y/S"]);
    expect(pair("<#f>@<#g>")).to.deep.equal(["http://d.example/a/b/#f", "http://s.example/x/y/#g"]);
    expect(pair("<?q=1>@<S>")).to.deep.equal(["http://d.example/a/b/?q=1", "http://s.example/x/y/S"]);
    expect(pair("<>@<S>")).to.deep.equal(["http://d.example/a/b/", "http://s.example/x/y/S"]);
    expect(pair("<http://abs.example/n>@<http://abs.example/S>"), "absolute IRIs stand").to.deep.equal(["http://abs.example/n", "http://abs.example/S"]);
  });
  it("says where a parse error is, and what it saw", function () {
    let caught = null;
    try { parser.parse("<n>@<S>,\n  nope:x@<S>"); } catch (e) { caught = e; }
    expect(caught.message).to.match(/^http:\/\/m.example\/\(\d+\): Parse error; unknown prefix "nope:"/);
  });
});
