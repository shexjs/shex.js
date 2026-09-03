/** The threaded engine's thread economy.
 *
 * The validator hands the engine an assignment: each triple in the
 * neighborhood belongs to exactly one TripleConstraint, and a triple the
 * expression doesn't consume is an ExcessTripleViolation.  So a constraint
 * the expression reaches once can take everything assigned to it in one
 * thread -- trying every prefix length instead multiplies out, one thread
 * per combination of prefix lengths across the repeated constraints.
 *
 * Where a constraint is reached more than once -- the same TripleConstraint
 * under two Inclusions, or one under a repeated group -- what one visit
 * takes is what another goes without, so those still enumerate.
 */
"use strict";

const expect = require("chai").expect;
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("@shexjs/validator");
const regexModule = require("..").RegexpModule;

const base = "http://a.example/";

function validate (schemaText, dataText, node = base + "x", shape = ShExValidator.Start) {
  const schema = ShExParser.construct(base, {}, {index: true}).parse(schemaText);
  const graph = new N3.Store();
  graph.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"}).parse(dataText));
  return new ShExValidator(schema, RdfJsDb(graph), {regexModule})
    .validateShapeMap([{node, shape}])[0];
}

describe("eval-threaded-nerr", function () {

  /* Eight repeated constraints over a neighborhood this size used to be one
   * thread per combination of prefix lengths -- 21 * 11^7 of them, all
   * passing, all but one discarded.  If this ever goes back to enumerating,
   * it will not finish inside the timeout rather than fail an assertion
   * about a stopwatch. */
  it("should not enumerate a thread per combination of cardinalities", function () {
    this.timeout(5000);
    const properties = ["p1", "p2", "p3", "p4", "p5", "p6", "p7"];
    const schemaText = [
      "PREFIX : <http://a.example/>",
      "start = @<S>",
      "<S> {",
      "  :label . + ;",
      properties.map(p => `  :${p} . *`).join(" ;\n"),
      "}",
    ].join("\n");
    const dataText = [
      "PREFIX : <http://a.example/>",
      ":x",
      "  :label " + Array.from({length: 20}, (_, i) => `"l${i}"`).join(" , ") + " ;",
      properties.map(p => `  :${p} ` + Array.from({length: 10}, (_, i) => `"${p}-${i}"`).join(" , "))
        .join(" ;\n"),
      "."
    ].join("\n");

    const result = validate(schemaText, dataText);
    expect(result.status, JSON.stringify(result.appinfo)).to.equal("conformant");
  });

  /* Which constraints may take everything at once, asked of the engine
   * directly.  The doubly-included case cannot be reached through the
   * validator today -- it refuses a constraint that appears twice in one
   * shape ("already included", MapArray.add) -- so the guard is stated
   * here, where it can be checked, rather than left to a schema nobody can
   * validate. */
  it("should exempt a constraint reached more than once", function () {
    const schema = ShExParser.construct(base, {}, {index: true}).parse([
      "PREFIX : <http://a.example/>",
      "<Plain>    { :a . * ; :b . + }",             // reached once each
      // a group with more than one constraint in it stays a group; the
      // parser folds `( :c . + ){2}` into one constraint {2,2} instead
      "<Repeated> { ( :c . + ; :c2 . ){2} }",       // once per iteration
      "<Twice>    { &<onePlus> ; &<onePlus> }",     // one pool, two takers
      "<Defines>  { $<onePlus> ( :d . + ) }",
    ].join("\n"));
    const index = schema._index;
    const greedyPredicates = label => {
      const shape = schema.shapes.find(s => s.id === base + label).shapeExpr;
      const engine = regexModule.compile(schema, shape, index);
      return [...engine.greedy].map(tc => tc.predicate.replace(base, "")).sort();
    };
    expect(greedyPredicates("Plain"), "nothing else can want their triples")
      .to.deep.equal(["a", "b"]);
    expect(greedyPredicates("Repeated"), "each iteration leaves some for the next")
      .to.deep.equal([]);
    expect(greedyPredicates("Twice"), "two occurrences share one pool")
      .to.deep.equal([]);
  });

  /* Two iterations of a group, each needing one :p and one :q: the four
   * triples match only as 1+1 and 1+1.
   *
   * Two things stood in the way, and both were about threads sharing what
   * they should own.  The pool a constraint's triples come from was shared
   * between forked threads, so what one spent another went without; and an
   * iteration gave up on the first thread that couldn't take another turn,
   * discarding the ones that could.  eval-simple-1err needed a third fix,
   * of its own kind: see the test below. */
  it("should split for a constraint under a repeated group", function () {
    const schemaText = [
      "PREFIX : <http://a.example/>",
      "start = @<S>",
      "<S> { ( :p . + ; :q . ){2} }",
    ].join("\n");
    const result = validate(schemaText,
      'PREFIX : <http://a.example/>\n:x :p 1 , 2 ; :q 3 , 4 .');
    expect(result.status, JSON.stringify(result.appinfo)).to.equal("conformant");
  });

  /* What the enumeration used to report for `.{2,5}` over six triples was
   * every way of reading it: "take 2 and four are excess", "take 3 and
   * three are excess", ... four alternative explanations of one mistake.
   * Taking as many as the cardinality allows leaves the one repair that
   * makes the data conform. */
  it("should report the excess that remains, not every way of counting it", function () {
    const result = validate(
      "PREFIX : <http://a.example/>\nstart = @<S>\n<S> { :p . {2,5} }",
      'PREFIX : <http://a.example/>\n:x :p "a" , "b" , "c" , "d" , "e" , "f" .');
    expect(result.status).to.equal("nonconformant");
    const errors = result.appinfo.errors;
    expect(errors.map(e => e.type)).to.deep.equal(["ExcessTripleViolation"]);
    expect(errors.length, "one triple too many, one error").to.equal(1);
  });

  /* The same schema through the other engine, which failed it for a
   * different reason: eval-simple-1err took as many triples as a
   * constraint's maximum allowed and never gave any back, so the first
   * iteration ate both :p's.  Its loop was already written to offer each
   * larger take as its own thread -- it just started at the maximum, so the
   * loop never went round twice. */
  it("should let eval-simple-1err do the same", function () {
    const schema = ShExParser.construct(base, {}, {index: true}).parse([
      "PREFIX : <http://a.example/>",
      "start = @<S>",
      "<S> { ( :p . + ; :q . ){2} }",
    ].join("\n"));
    const graph = new N3.Store();
    graph.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"})
      .parse('PREFIX : <http://a.example/>\n:x :p 1 , 2 ; :q 3 , 4 .'));
    const result = new ShExValidator(schema, RdfJsDb(graph),
                                     {regexModule: require("@shexjs/eval-simple-1err").RegexpModule})
          .validateShapeMap([{node: base + "x", shape: ShExValidator.Start}])[0];
    expect(result.status, JSON.stringify(result.appinfo)).to.equal("conformant");
  });

  it("should still report a missing property as missing", function () {
    const result = validate(
      "PREFIX : <http://a.example/>\nstart = @<S>\n<S> { :p . ; :q . }",
      'PREFIX : <http://a.example/>\n:x :p 1 .');
    expect(result.status).to.equal("nonconformant");
    expect(JSON.stringify(result.appinfo)).to.include("MissingProperty");
  });
});
