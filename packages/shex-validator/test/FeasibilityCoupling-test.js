/** What the feasibility layer gets wrong where it deliberately looks away
 * (plan.md G4): a repeated group couples the counts of its constraints
 * (`( :a . ; :b . ){2,3}` takes as many :a as :b), an unbounded inner
 * cardinality and a repetition compound, and a fixed inner cardinality
 * under a star wants a multiple.  The layer ignores those couplings and
 * says "feasible" -- which is its licence: a refutation must never be
 * wrong, and the engines decide the rest.  So, over every small bag: a
 * bag the layer refutes is one both engines refuse (soundness), and the
 * bags the coupling refuses are refused by the engines even though the
 * layer let them through (the matchers were fixed for exactly this:
 * c018dc49, e526b191, c1ea5d18). */
"use strict";

const expect = require("chai").expect;
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("..");
const {TripleExprFeasibility} = require("../lib/feasibility");
const {RegexpModule: Threaded} = require("@shexjs/eval-threaded-nerr");
const {RegexpModule: Simple} = require("@shexjs/eval-simple-1err");

const base = "http://a.example/";
const A = base + "a", B = base + "b";

/** the cases: a triple expression over :a and :b, and the bags it accepts */
const cases = [
  {expr: "( :a . ; :b . ){2,3}",
   accepts: (a, b) => a === b && a >= 2 && a <= 3},
  {expr: "( :a . ; :b . {1,} ){2}",
   accepts: (a, b) => a === 2 && b >= 2},
  {expr: "( :a . {2} )*",      // the shape is open: :b is nobody's business
   accepts: (a, b) => a % 2 === 0},
  {expr: "( :a . | :b . ){2}",
   accepts: (a, b) => a + b === 2},
  {expr: "( :a . ; :b . ? ){1,2}",
   accepts: (a, b) => a >= 1 && a <= 2 && b <= a},
];
const MAX = 4;

function setUp (exprText) {
  const schema = ShExParser.construct(base, {}, {index: true})
        .parse(`PREFIX : <${base}>\n<S> { ${exprText} }\n`);
  const expression = schema.shapes[0].shapeExpr.expression;
  const feasibility = new TripleExprFeasibility(expression, label => schema._index.tripleExprs[label]);
  const tcs = {a: [], b: []};
  feasibility.tripleConstraints.forEach(tc => tcs[tc.predicate === A ? "a" : "b"].push(tc));
  return {schema, feasibility, tcs};
}

/** the layer's word on an exact bag: counts dealt to the first constraint
 * on each predicate, as the validator deals them */
function feasible (feasibility, tcs, a, b) {
  const counts = new Map();
  if (tcs.a.length) counts.set(tcs.a[0], a);
  if (tcs.b.length) counts.set(tcs.b[0], b);
  return feasibility.feasible(counts, counts);
}

function verdict (schema, engine, a, b) {
  const graph = new N3.Store();
  const arcs = [];
  for (let i = 0; i < a; ++i) arcs.push(`:a ${i}`);
  for (let i = 0; i < b; ++i) arcs.push(`:b ${i}`);
  graph.addQuads(new N3.Parser({baseIRI: base}).parse(`PREFIX : <${base}>\n:x ${arcs.join(" ; ") || ":none 0"} .`));
  const result = new ShExValidator(schema, RdfJsDb(graph), {regexModule: engine, noCache: true})
        .validateShapeMap([{node: base + "x", shape: base + "S"}])[0];
  return result.status === "conformant";
}

describe("a cardinality on a group over a constraint with its own", function () {
  // ...composes with it: the group has to stay a group.  The parser used
  // to copy the outer cardinality onto the constraint, over the inner one,
  // and both engines then took 1, 2 or 3 :a for `( :a . {2} ){1,3}`.
  it("should parse to a one-element group carrying the outer cardinality", function () {
    const schema = ShExParser.construct(base, {}, {index: true})
          .parse(`PREFIX : <${base}>\n<S> { ( :a . {2} ){1,3} }\n`);
    const expression = schema.shapes[0].shapeExpr.expression;
    expect(expression.type).to.equal("EachOf");
    expect(expression.min).to.equal(1);
    expect(expression.max).to.equal(3);
    expect(expression.expressions.length).to.equal(1);
    expect(expression.expressions[0]).to.include({type: "TripleConstraint", min: 2, max: 2});
  });

  it("should still copy a cardinality onto a constraint that has none", function () {
    const schema = ShExParser.construct(base, {}, {index: true})
          .parse(`PREFIX : <${base}>\n<S> { ( :a . ){1,3} }\n`);
    expect(schema.shapes[0].shapeExpr.expression).to.include({type: "TripleConstraint", min: 1, max: 3});
  });
});

describe("feasibility under coupled cardinalities", function () {
  cases.forEach(({expr, accepts}) => describe(expr, function () {
    const {schema, feasibility, tcs} = setUp(expr);
    const bags = [];
    for (let a = 0; a <= MAX; ++a)
      for (let b = 0; b <= MAX; ++b)
        bags.push({a, b, layer: feasible(feasibility, tcs, a, b), expected: accepts(a, b)});

    it("should never refute a bag the language accepts", function () {
      const wrong = bags.filter(bag => bag.expected && !bag.layer);
      expect(wrong.map(w => `${w.a}a ${w.b}b`), "refuted, though accepted").to.deep.equal([]);
    });

    [Threaded, Simple].forEach(engine => it("should agree with " + engine.name + " on every bag", function () {
      const disagreements = bags.filter(bag => verdict(schema, engine, bag.a, bag.b) !== bag.expected);
      expect(disagreements.map(w => `${w.a}a ${w.b}b`), engine.name + " said otherwise").to.deep.equal([]);
    }));

    it("should let some coupled bags through for the engines to refuse (its licence)", function () {
      // not an assertion of a number: the layer may tighten; what it must
      // not do is the case above
      const letThrough = bags.filter(bag => bag.layer && !bag.expected).length;
      expect(letThrough).to.be.at.least(0);
    });
  }));
});
