/** The nearest bag the schema accepts (doc/error-normalization.md §4).
 *
 * A failure said as the difference between the arcs a node has and the
 * closest set of arcs the shape would take: what to add, what to drop.  That
 * answer is about the language and the data, not about the syntax tree, so
 * two spellings of one language give one answer -- which is the point of it,
 * and most of what this file checks.
 */
"use strict";

const expect = require("chai").expect;
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("..");
const ShExUtil = require("@shexjs/util");

const base = "http://a.example/";
const FOAF = "http://xmlns.com/foaf/0.1/";
const PRE = "PREFIX foaf: <" + FOAF + ">\nPREFIX : <" + base + ">\n";

/** the repairs for a node, as "add 1 foaf:mbox" / "remove 1 :a" strings */
function repairs (shapeText, dataText) {
  const schema = ShExParser.construct(base, {}, {index: true})
        .parse(PRE + "start = @<S>\n" + shapeText);
  const graph = new N3.Store();
  graph.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"})
    .parse(PRE + dataText));
  const result = new ShExValidator(schema, RdfJsDb(graph), {repairs: true})
        .validateShapeMap([{node: base + "x", shape: ShExValidator.Start}])[0];
  const short = p => p.replace(FOAF, "foaf:").replace(base, ":");
  return {
    status: result.status,
    ways: (result.appinfo.repairs || []).map(repair => repair.arcs.map(
      arc => (arc.delta > 0 ? "add " : "remove ") + Math.abs(arc.delta) + " " + short(arc.property))
      .join(" and ")),
    cost: (result.appinfo.repairs || []).map(r => r.cost)[0],
  };
}

/* The two spellings this whole line of work started from: the same bags,
 * written two ways.  Everything below asks both and expects one answer. */
const spellings = {
  "one mbox after the choice":
    "<S> { ( foaf:name . | foaf:givenName . ; foaf:familyName . ) ; foaf:mbox . }",
  "an mbox inside each branch":
    "<S> { ( foaf:name . ; foaf:mbox . | foaf:givenName . ; foaf:familyName . ; foaf:mbox . ) }",
};

describe("nearest-bag repairs", function () {

  describe("say the same thing whichever way the schema is written", function () {
    const cases = [
      ["a name and nothing else", 'foaf:name "Bob"', ["add 1 foaf:mbox"]],
      ["nothing at all", "foaf:nick \"b\"", ["add 1 foaf:name and add 1 foaf:mbox"]],
      ["a given name and an mbox",
       'foaf:givenName "Bob" ; foaf:mbox <mailto:b@e.example>', ["add 1 foaf:familyName"]],
      ["all three names and an mbox",
       'foaf:name "B" ; foaf:givenName "Bob" ; foaf:mbox <mailto:b@e.example>',
       ["remove 1 foaf:givenName"]],
    ];
    cases.forEach(([what, triples, expected]) => {
      it("should agree about " + what, function () {
        for (const [label, shapeText] of Object.entries(spellings)) {
          const {status, ways} = repairs(shapeText, ":x " + triples + " .");
          expect(status, label).to.equal("nonconformant");
          expect(ways, label).to.deep.equal(expected);
        }
      });
    });
  });

  it("should count what a cardinality is short of, or over", function () {
    const shape = "<S> { :p . {2,5} }";
    expect(repairs(shape, ':x :q 0 .').ways).to.deep.equal(["add 2 :p"]);
    expect(repairs(shape, ':x :p 1 .').ways).to.deep.equal(["add 1 :p"]);
    expect(repairs(shape, ':x :p 1 , 2 , 3 , 4 , 5 , 6 .').ways).to.deep.equal(["remove 1 :p"]);
    expect(repairs(shape, ':x :p 1 , 2 , 3 , 4 , 5 , 6 , 7 , 8 , 9 .').ways)
      .to.deep.equal(["remove 4 :p"]);
    expect(repairs(shape, ':x :p 1 , 2 .').status).to.equal("conformant");
  });

  /* A choice in the language is a choice in the repair; a choice in the
   * syntax is not.  `:a . | :b .` over a node with neither really can be put
   * right two ways. */
  it("should offer a choice the language offers", function () {
    const {ways} = repairs("<S> { :a . | :b . }", ':x :c 1 .');
    expect(ways).to.have.members(["add 1 :a", "add 1 :b"]);
  });

  it("should offer a choice about which of two to drop", function () {
    const {ways} = repairs("<S> { :a . | :b . }", ':x :a 1 ; :b 2 .');
    expect(ways).to.have.members(["remove 1 :a", "remove 1 :b"]);
  });

  /* The Quantity from the examples: :value required, :system contingent on
   * :code.  Two complete recipes, each one a way to make it conform. */
  it("should say each whole way out of a contingent group", function () {
    const {ways} = repairs(
      "<S> { :value . ; :unit . ; ( :code . ; :system . ? )? }",
      ':x :unit "kg" ; :system <http://u.example/> .');
    expect(ways).to.have.members(["add 1 :value and remove 1 :system",
                                  "add 1 :value and add 1 :code"]);
  });

  it("should ask for nothing of a node that conforms", function () {
    const {status, ways} = repairs("<S> { :a . }", ':x :a 1 .');
    expect(status).to.equal("conformant");
    expect(ways).to.deep.equal([]);
  });

  it("should be given without asking, and refusable", function () {
    const schema = ShExParser.construct(base, {}, {index: true})
          .parse(PRE + "start = @<S>\n<S> { :a . }");
    const graph = new N3.Store();
    graph.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"})
      .parse(PRE + ":x :b 1 ."));
    const on = new ShExValidator(schema, RdfJsDb(graph), {})
          .validateShapeMap([{node: base + "x", shape: ShExValidator.Start}])[0];
    expect(on.status).to.equal("nonconformant");
    expect(on.appinfo, "by default").to.have.property("repairs");
    const off = new ShExValidator(schema, RdfJsDb(graph), {repairs: false})
          .validateShapeMap([{node: base + "x", shape: ShExValidator.Start}])[0];
    expect(off.appinfo, "unless refused").to.not.have.property("repairs");
  });

  /* A repair of cost 0 says "the arcs you have are already a bag this shape
   * accepts", so whatever it failed on isn't something a bag can speak to.
   * "To conform: change nothing" is worse than saying nothing at all.
   *
   * A closed shape is the case in hand, and it is also a gap: the honest
   * repair is "remove 1 :b", but the arcs a ClosedShapeViolation complains
   * about belong to no triple constraint, so the bag search never sees
   * them.  Saying nothing is the right answer until it can. */
  it("should say nothing where the arcs were never the problem", function () {
    // the bag is right for { :a . }; what fails is the NOT around { :b . }
    const schema = ShExParser.construct(base, {}, {index: true})
          .parse(PRE + "start = @<S>\n<S> { :a . } AND NOT { :b . }");
    const graph = new N3.Store();
    graph.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"})
      .parse(PRE + ":x :a 1 ; :b 2 ."));
    const result = new ShExValidator(schema, RdfJsDb(graph), {})
          .validateShapeMap([{node: base + "x", shape: ShExValidator.Start}])[0];
    expect(result.status).to.equal("nonconformant");
    expect(result.appinfo.repairs, "no bag to repair").to.equal(undefined);
    expect(JSON.stringify(result.appinfo)).to.not.include("repairs");
  });

  /* The search is the expensive part, and a failure that gets discarded
   * mid-search is never asked.  Reading is what costs. */
  it("should not go looking until someone asks", function () {
    const schema = ShExParser.construct(base, {}, {index: true})
          .parse(PRE + "start = @<S>\n<S> { :a . ; :b . }");
    const graph = new N3.Store();
    graph.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"})
      .parse(PRE + ":x :c 1 ."));
    const validator = new ShExValidator(schema, RdfJsDb(graph), {});
    let searches = 0;
    const wrapped = validator.nearestBagRepairs.bind(validator);
    validator.nearestBagRepairs = function (...args) { ++searches; return wrapped(...args); };
    const result = validator.validateShapeMap(
      [{node: base + "x", shape: ShExValidator.Start}])[0];
    expect(result.status).to.equal("nonconformant");
    expect(searches, "not until read").to.equal(0);
    expect(result.appinfo.repairs, "and then it answers").to.not.equal(undefined);
    expect(searches, "exactly once").to.equal(1);
    result.appinfo.repairs;                 // the accessor replaced itself
    expect(searches, "and not again").to.equal(1);
  });

  /* Where a value is wrong the bag *is* short -- the triple matched no
   * constraint, so nothing was counted for it -- and the repair carries the
   * value the missing arc would have to have. */
  it("should ask for the arc a bad value failed to supply", function () {
    const {ways} = repairs("<S> { :a <http://www.w3.org/2001/XMLSchema#integer> }",
                           ':x :a "not a number" .');
    expect(ways).to.deep.equal(["add 1 :a"]);
  });

  /* Inside a satisfied NOT the failure is the reason for success, so a
   * repair there is a recipe for breaking what just worked. */
  it("should not tell a satisfied NOT how to fail", function () {
    const schema = ShExParser.construct(base, {}, {index: true})
          .parse(PRE + "start = @<S>\n<S> NOT { :a . }");
    const graph = new N3.Store();
    graph.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"})
      .parse(PRE + ":x :b 1 ."));
    const result = new ShExValidator(schema, RdfJsDb(graph), {})
          .validateShapeMap([{node: base + "x", shape: ShExValidator.Start}])[0];
    expect(result.status).to.equal("conformant");
    expect(JSON.stringify(result.appinfo), "no repairs recorded under the NOT")
      .to.not.include("repairs");
  });

  it("should read as a recipe", function () {
    const schema = ShExParser.construct(base, {}, {index: true})
          .parse(PRE + "start = @<S>\n<S> { foaf:name . ; foaf:mbox . }");
    const graph = new N3.Store();
    graph.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"})
      .parse(PRE + ':x foaf:name "Bob" .'));
    const result = new ShExValidator(schema, RdfJsDb(graph), {repairs: true})
          .validateShapeMap([{node: base + "x", shape: ShExValidator.Start}])[0];
    expect(ShExUtil.errsToSimple(result.appinfo).join("\n"))
      .to.include("to conform: add 1 <" + FOAF + "mbox>");
    // ...and with the schema's prefixes, as the schema writes it
    expect(ShExUtil.errsToSimple(result.appinfo, {foaf: FOAF}).join("\n"))
      .to.include("to conform: add 1 foaf:mbox");
  });

  /* A closed shape refuses arcs the expression never mentions; those are
   * in no bag, so the search can't see them -- but "remove it" is their
   * repair, and it comes with every way the bag has. */
  describe("a closed shape's refusals", function () {
    it("should say to remove the arc, where the bag was fine", function () {
      const {status, ways, cost} = repairs("<S> CLOSED { foaf:name . }", ':x foaf:name "B" ; :other 1 .');
      expect(status).to.equal("nonconformant");
      expect(ways).to.deep.equal(["remove 1 :other"]);
      expect(cost).to.equal(1);
    });

    it("should count the refused arcs", function () {
      const {ways, cost} = repairs("<S> CLOSED { foaf:name . }", ':x foaf:name "B" ; :other 1, 2 ; :more 3 .');
      expect(ways[0].split(" and ").sort()).to.deep.equal(["remove 1 :more", "remove 2 :other"]);
      expect(cost).to.equal(3);
    });

    it("should add the removal to what the bag needs", function () {
      const {ways, cost} = repairs("<S> CLOSED { foaf:name . ; foaf:mbox . }", ':x foaf:name "B" ; :other 1 .');
      expect(ways).to.deep.equal(["add 1 foaf:mbox and remove 1 :other"]);
      expect(cost).to.equal(2);
    });

    it("should add it to every way the bag has", function () {
      const {ways} = repairs("<S> CLOSED { ( foaf:name . | foaf:mbox . ) }", ":x :other 1 .");
      expect(ways.sort()).to.deep.equal(["add 1 foaf:mbox and remove 1 :other", "add 1 foaf:name and remove 1 :other"]);
    });

    it("should repair a closed shape with no expression", function () {
      const {status, ways} = repairs("<S> CLOSED { }", ":x :other 1 .");
      expect(status).to.equal("nonconformant");
      expect(ways).to.deep.equal(["remove 1 :other"]);
    });

    it("should refuse what the node says, not what is said of it", function () {
      // a nested node always has its parent's arc coming in; CLOSED is about
      // outgoing arcs, so that one is neither a violation nor a repair
      const {status, ways, cost} = repairs("<S> CLOSED { foaf:name . }", ':y :parent :x . :x foaf:name "B" ; :other 1 .');
      expect(status).to.equal("nonconformant");
      expect(ways).to.deep.equal(["remove 1 :other"]);
      expect(cost).to.equal(1);
    });

    it("should leave an open shape's extra arcs alone", function () {
      const {status, ways} = repairs("<S> { foaf:name . }", ':x foaf:name "B" ; :other 1 .');
      expect(status).to.equal("conformant");
      expect(ways).to.deep.equal([]);
    });
  });

  /* G3: one predicate, constrained twice with DIFFERENT value expressions.
   * Which triple answers which constraint is an assignment, not the caller's
   * first-match count -- so the repair is the min-cost bipartite assignment of
   * the node's triples to the constraints they satisfy, not the difference
   * from whatever the first constraint happened to be counted. */
  describe("assign triples to same-predicate constraints by what they satisfy", function () {
    // c1 takes {a,b,c}, c2 takes {a,b}; the node has a, b and c.  Two of the
    // three can be seated (c must go to c1, then one of a/b to c2), so one arc
    // is too many: remove 1 :p, cost 1.  Counting all three against the first
    // constraint (c1) instead would answer "remove 2 :p and add 1 :p" (cost
    // 3) -- the arbitrary count the assignment corrects.
    it("removes the one arc too many, not two-and-add-one", function () {
      const {status, ways, cost} = repairs(
        '<S> { :p ["a" "b" "c"] ; :p ["a" "b"] }', ':x :p "a", "b", "c" .');
      expect(status).to.equal("nonconformant");
      expect(ways).to.deep.equal(["remove 1 :p"]);
      expect(cost).to.equal(1);
    });

    // c and a can be seated one each (c->c1, a->c2), so the node conforms --
    // the assignment the repair search would find is the one the validator
    // itself finds, and a conforming node has nothing to repair.
    it("says nothing when an assignment seats every arc", function () {
      const {status, ways} = repairs(
        '<S> { :p ["a" "b" "c"] ; :p ["a" "b"] }', ':x :p "c", "a" .');
      expect(status).to.equal("conformant");
      expect(ways).to.deep.equal([]);
    });

    // disjoint value sets: c takes only the first constraint, the second has
    // nothing it accepts -- add one of the second's values.
    it("fills a constraint no present triple satisfies", function () {
      const {status, ways, cost} = repairs(
        '<S> { :p ["a" "b" "c"] ; :p ["x" "y"] }', ':x :p "c" .');
      expect(status).to.equal("nonconformant");
      expect(ways).to.deep.equal(["add 1 :p"]);
      expect(cost).to.equal(1);
    });
  });
});
