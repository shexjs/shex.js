/** ShExMerger's argument forms and collision policies. */
"use strict";

const expect = require("chai").expect;
const {Merger, StoreDuplicates, yyllocToString} = require("../lib/Merger");
const ShExParser = require("@shexjs/parser");

const base = "http://a.example/";
const parse = text => ShExParser.construct(base, {}, {index: true}).parse(`PREFIX : <${base}>\n` + text);
const decl = id => ({type: "ShapeDecl", id, shapeExpr: {type: "Shape"}});
const lloc = (filename, line) => ({filename, first_line: line, first_column: 0, last_line: line, last_column: 9});
const withMeta = (schema, url) => ({schema, schemaMeta: {url, base: url, prefixes: {}, importers: []}});

describe("ShExMerger", function () {
  const left = () => withMeta(parse("<S> { :p . }"), base + "left.shex");
  const right = () => withMeta(parse("<T> { :q . }"), base + "right.shex");

  it("takes its arguments in every documented form", function () {
    expect(new Merger(left()).merge(right()).shapes.map(s => s.id), "policy defaults").to.deep.equal([base + "S", base + "T"]);
    expect(new Merger(left(), "left").merge(right()).shapes.length, "a policy alone").to.equal(2);
    expect(new Merger(left(), "right", false).merge(right()).shapes.length, "policy and inPlace").to.equal(2);
    expect(new Merger(left(), right(), "left", false).merge().shapes.length, "right, policy, inPlace; merge with nothing").to.equal(2);
    expect(() => new Merger(left(), 1, 2, 3, 4)).to.throw(/Did not expect 4 arguments to Merger/);
  });

  it("takes both sides on merge(), or refuses to merge nothing", function () {
    expect(new Merger(left()).merge(left(), right()).shapes.length, "left and right on merge").to.equal(2);
    expect(() => new Merger(left()).merge()).to.throw(/expected right argument to merge/);
    expect(() => new Merger({schema: null, schemaMeta: {}}, right(), "left", false).merge()).to.throw(/expected left argument to merge/);
    expect(() => new Merger(left()).merge(1, 2, 3)).to.throw(/Did not expect 3 arguments to merge/);
  });

  it("gives an empty left schema a shapes list when the right brings some", function () {
    const merged = new Merger({schema: {type: "Schema"}, schemaMeta: {}}).merge(right());
    expect(merged.shapes.map(s => s.id)).to.deep.equal([base + "T"]);
  });

  describe("warnDuplicates", function () {
    let warned;
    const savedWarn = console.warn;
    beforeEach(function () { warned = []; console.warn = m => warned.push(m); });
    afterEach(function () { console.warn = savedWarn; });

    it("keeps the first prefix, refuses a conflict elsewhere", function () {
      expect(Merger.warnDuplicates("_prefixes", base, "http://b.example/")).to.equal(false);
      expect(() => Merger.warnDuplicates("start", base + "S", base + "T")).to.throw(/Unexpected start conflict/);
    });
    it("warns on an identical redefinition and keeps the first", function () {
      expect(Merger.warnDuplicates("shapeDecl", decl(base + "S"), decl(base + "S"), lloc("a.shex", 1), lloc("b.shex", 2))).to.equal(false);
      expect(warned[0]).to.include("Duplicate definitions for " + base + "S");
      expect(warned[0]).to.include("a.shex(1:0-1:9)");
      expect(warned[0]).to.include("b.shex(2:0-2:9)");
    });
    it("refuses a conflicting redefinition, saying where both were", function () {
      const other = Object.assign(decl(base + "S"), {shapeExpr: {type: "Shape", closed: true}});
      expect(() => Merger.warnDuplicates("shapeDecl", decl(base + "S"), other, lloc("a.shex", 1), lloc("b.shex", 2)))
        .to.throw(/Conflicing definitions for http:\/\/a.example\/S:\n  a.shex\(1:0-1:9\):\n/);
      expect(() => Merger.warnDuplicates("shapeDecl", decl(base + "S"), other), "with no locations").to.throw(/Conflicing definitions/);
    });
  });

  describe("StoreDuplicates", function () {
    it("records where each redefinition was, with what imported it", function () {
      const store = new StoreDuplicates();
      expect(store.overwrite("_prefixes", base, base)).to.equal(false);
      expect(() => store.overwrite("start", base + "S", base + "T")).to.throw(/Unexpected start conflict/);
      const meta = importers => ({importers});
      expect(store.overwrite("shapeDecl", decl(base + "S"), decl(base + "S"), lloc("a.shex", 1), lloc("b.shex", 2), meta([]), meta(["a.shex"]))).to.equal(false);
      store.overwrite("shapeDecl", decl(base + "S"), decl(base + "S"), lloc("a.shex", 1), lloc("c.shex", 3), meta([]), meta([]));
      expect(store.duplicates[base + "S"].map(l => l.filename)).to.deep.equal(["a.shex", "b.shex", "c.shex"]);
      expect(yyllocToString(store.duplicates[base + "S"][1])).to.equal("b.shex(2:0-2:9)\n      <= a.shex");
    });
  });
});
