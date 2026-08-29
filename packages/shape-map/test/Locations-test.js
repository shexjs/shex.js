/** Where each pair of a shape map was written: the parser records it
 * beside the pairs (non-enumerable `_locations`), and a parse error says
 * where it went wrong -- what an editor over the query map needs. */
"use strict";

const expect = require("chai").expect;
const ShapeMap = require("..");

const parser = ShapeMap.Parser.construct(
  "http://a.example/",
  {base: "http://s.example/", prefixes: {"": "http://s.example/"}},
  {base: "http://d.example/", prefixes: {ex: "http://d.example/"}});

/** the text a jison location covers */
function slice (text, loc) {
  const starts = [0];
  for (let i = 0; i < text.length; ++i)
    if (text[i] === "\n")
      starts.push(i + 1);
  return text.slice(starts[loc.first_line - 1] + loc.first_column,
                    starts[loc.last_line - 1] + loc.last_column);
}

describe("shape-map locations", function () {
  const text = '<x>@<S>,\n  ex:y @! :T / "why" $appinfo: {"a": 1},\n  {FOCUS ex:p _}@START';
  const sm = parser.parse(text);

  it("should still be the pairs, and only the pairs", function () {
    expect(sm).to.deep.equal([
      {node: "http://d.example/x", shape: "http://s.example/S", status: "conformant"},
      {node: "http://d.example/y", shape: "http://s.example/T", status: "nonconformant",
       reason: {"@value": "why"}, appinfo: {a: 1}},
      {node: {type: "TriplePattern", subject: ShapeMap.Focus, predicate: "http://d.example/p", object: null},
       shape: ShapeMap.Start},
    ]);
    expect(Object.keys(sm), "the locations are not a pair").to.deep.equal(["0", "1", "2"]);
    expect(JSON.parse(JSON.stringify(sm)).length).to.equal(3);
  });

  it("should say where each pair's node and shape side were written", function () {
    const said = sm._locations.map(l => ({
      node: slice(text, l.node), shape: slice(text, l.shape),
      reason: l.reason && slice(text, l.reason), appinfo: l.appinfo && slice(text, l.appinfo),
    }));
    expect(said).to.deep.equal([
      {node: "<x>", shape: "@<S>", reason: null, appinfo: null},
      {node: "ex:y", shape: "@! :T", reason: '/ "why"', appinfo: '$appinfo: {"a": 1}'},
      {node: "{FOCUS ex:p _}", shape: "@START", reason: null, appinfo: null},
    ]);
  });

  it("should locate nothing in an empty map", function () {
    const empty = parser.parse("");
    expect(empty).to.deep.equal([]);
    expect(empty._locations).to.deep.equal([]);
  });

  it("should say where a parse error is", function () {
    let caught = null;
    try { parser.parse("<x>@<S>, <y>"); } catch (e) { caught = e; }
    expect(caught, "thrown").to.exist;
    expect(caught.location, "where").to.include({first_line: 1, first_column: 12});
    expect(caught.message).to.match(/Expecting/);
  });
});
