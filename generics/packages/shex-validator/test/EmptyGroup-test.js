/** A group taken zero times over a node with none of its arcs: `( :a . ;
 * :b . )*` or `?` must accept the empty neighborhood, and say so as an
 * empty solution.  Both engines got this wrong (the threaded one answered
 * nothing at all, and the validator fell over it; the stepper reported a
 * missing property), which no shexTest case covered. */
"use strict";

const expect = require("chai").expect;
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("..");
const {RegexpModule: Threaded} = require("@shexjs/eval-threaded-nerr");
const {RegexpModule: Simple} = require("@shexjs/eval-simple-1err");

const base = "http://a.example/";

function validate (exprText, dataArcs, engine) {
  const schema = ShExParser.construct(base, {}, {index: true}).parse(`PREFIX : <${base}>\n<S> { ${exprText} }\n`);
  const graph = new N3.Store();
  graph.addQuads(new N3.Parser({baseIRI: base}).parse(`PREFIX : <${base}>\n:x ${dataArcs || ":unrelated 0"} .`));
  return new ShExValidator(schema, RdfJsDb(graph), {regexModule: engine, noCache: true})
    .validateShapeMap([{node: base + "x", shape: base + "S"}])[0];
}

[Threaded, Simple].forEach(engine => describe("a group taken zero times, under " + engine.name, function () {
  [["( :a . ; :b . )*", "EachOfSolutions"],
   ["( :a . ; :b . )?", "EachOfSolutions"],
   ["( :a . ; :b . ){0,2}", "EachOfSolutions"],
   ["( :a . | :b . )*", "OneOfSolutions"],
   ["( :a . {2} )*", "EachOfSolutions"],
  ].forEach(([expr, type]) => {
    it("should accept a node with none of " + expr + "'s arcs, as an empty solution", function () {
      const result = validate(expr, null, engine);
      expect(result.status, JSON.stringify(result.appinfo).slice(0, 200)).to.equal("conformant");
      const solution = result.appinfo.solution;
      expect(solution.type).to.equal(type);
      expect(solution.solutions).to.deep.equal([]);
      expect(solution.min, "the cardinality that let it be zero").to.equal(0);
    });
  });

  it("should still take the arcs where they are", function () {
    expect(validate("( :a . ; :b . )*", ":a 1 ; :b 2", engine).status).to.equal("conformant");
    expect(validate("( :a . ; :b . )*", ":a 1", engine).status).to.equal("nonconformant");
  });

  it("should accept a trailing optional group with only the arcs before it", function () {
    const result = validate(":p . ; ( :a . ; :b . )?", ":p 1", engine);
    expect(result.status).to.equal("conformant");
    expect(result.appinfo.solution.type).to.equal("EachOfSolutions");
  });
}));
