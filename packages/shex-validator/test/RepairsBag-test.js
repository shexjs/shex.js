/** NearestAcceptedBag asked with counts alone (no satisfaction relation): the
 * count-only caller's path, which deals indistinguishable constraints -- same
 * predicate, same value expression -- every way. */
"use strict";

const expect = require("chai").expect;
const ShExParser = require("@shexjs/parser");
const {NearestAcceptedBag} = require("../lib/repairs");

const base = "http://a.example/";
const parse = text => ShExParser.construct(base, {}, {index: true}).parse(`PREFIX : <${base}>\n` + text);
const said = repairs => repairs.map(r => r.arcs.map(a => (a.delta > 0 ? "add " : "remove ") + Math.abs(a.delta) + " " + a.property.replace(base, ":")).join(" and "));

describe("NearestAcceptedBag over counts alone", function () {
  const schema = parse("<S> { :p . ; :p . ; :q . }");
  const bag = () => new NearestAcceptedBag(schema.shapes[0].shapeExpr.expression, label => schema._index.tripleExprs[label]);

  it("finds the two :p constraints indistinguishable and pools their arcs", function () {
    const b = bag();
    const [p1, p2, q] = b.tripleConstraints;
    expect([p1.predicate, p2.predicate, q.predicate]).to.deep.equal([base + "p", base + "p", base + "q"]);
    expect(said(b.repairs(new Map([[p1, 1], [p2, 0], [q, 1]]))), "one :p short").to.deep.equal(["add 1 :p"]);
    expect(said(b.repairs(new Map([[p1, 3], [p2, 0], [q, 1]]))), "one :p over").to.deep.equal(["remove 1 :p"]);
    const accepted = b.repairs(new Map([[p1, 2], [p2, 0], [q, 1]]));
    expect(accepted.length, "a bag it accepts: one way, costing nothing").to.equal(1);
    expect(accepted[0].cost).to.equal(0);
    expect(accepted[0].arcs).to.deep.equal([]);
    expect(b.repairs(new Map([[p1, 1], [p2, 0], [q, 1]])), "the same question is answered from memory").to.equal(b.repairs(new Map([[p1, 1], [p2, 0], [q, 1]])));
  });

  it("refuses a triple expression that includes itself", function () {
    expect(() => new NearestAcceptedBag("http://a.example/te", () => "http://a.example/te")).to.throw(/recursive triple expression/);
  });
});
