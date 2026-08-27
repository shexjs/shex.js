/** calc, where the actions steer the parse.
 *
 * The schema does not say which number ends an expression -- <#MidNum> and
 * <#LastNum> have the same body -- so the OR would take the first branch
 * that fits and every number would be a <#MidNum>.  What decides is a fact
 * about the numbers already read: the one that equals their sum is the last
 * one.  A schema cannot say that; an action can, and `registerEager` lets
 * what it says fail a branch, which sends the OR on to the next.
 *
 * `Calc-semact-falsify` is the other half of the pair: there the schema
 * chooses and the actions only check.  Same data, same running sum.
 */
"use strict";

const {expect} = require("chai");
const Fs = require("fs");
const Path = require("path");
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("@shexjs/validator");
const Reduce = require("..");
const jsActions = require("@shexjs/extension-reduce-js");

const HERE = Path.join(__dirname, "..", "examples", "calc-semact");
const read = f => Fs.readFileSync(Path.join(HERE, f), "utf8");
const CALC = "http://a.example/calc#";
const BASE = "http://a.example/";
const PREFIXES = {"": CALC};
const E = n => "http://a.example/expr2#e" + n;

/**
 * Recognize `data` against guide.shex, which carries its actions inline.
 *
 * `eager` says which bargain: true runs the actions as the matcher matches
 * and lets them fail a branch, false records them and folds afterwards.
 */
function compile (data, {node = E(1), shape = CALC + "Expr", eager = true, ran = null,
                         schemaText = read("guide.shex")} = {}) {
  const schema = ShExParser.construct(BASE, null, {index: true})
        .parse(schemaText, BASE, undefined, "guide.shex");
  const graph = new N3.Store();
  graph.addQuads(new N3.Parser({baseIRI: BASE, format: "text/turtle"}).parse(read(data)));

  const validator = new ShExValidator(schema, RdfJsDb(graph), {});
  const evaluate = ran === null ? jsActions
    : (code, scope) => { ran.push(code); return jsActions(code, scope); };
  // the schema's own prefixes and the schema itself: what an action writes
  // (`:left`, `$rdf:type`) is in the schema's terms, and the schema is what
  // says whether an arc reference is a value or a list of them
  const options = {evaluate, prefixes: schema._prefixes || PREFIXES, schema};
  if (eager)
    Reduce.registerEager(validator, options);
  else
    Reduce.register(validator);
  const res = validator.validateShapeMap([{node, shape}]);
  return {
    status: res[0].status,
    errors: JSON.stringify(res[0].appinfo),
    // an eager run stored every value, so the fold needs no evaluator
    ast: res[0].status === "conformant"
      ? Reduce.reduce(res, eager ? {schema} : options)[0]
      : undefined,
  };
}

describe("calc, where the actions steer the parse", function () {

  it("should take <#LastNum> for the number that is the sum", function () {
    expect(compile("sums.ttl").ast).to.deep.equal({
      op: "Mul",
      left: {op: "num", value: 10},
      right: {
        op: "Sub",
        left: {op: "Mul", left: {op: "num", value: 5}, right: {op: "num", value: 45}},
        right: {op: "last", value: 60},          // 10 + 5 + 45
      },
    });
  });

  /* The sum is kept per node, so what a node is has to be something the
   * actions can tell apart: an IRI and a blank node both reach them as
   * strings, and key() is what makes a literal one too. */
  it("should read the same expression written with blank nodes", function () {
    expect(compile("sums-bnodes.ttl").ast).to.deep.equal(compile("sums.ttl").ast);
  });

  /* Nothing in doesnt-sum.ttl is the sum of what came before it, so no
   * branch is ever refused and every number stays a <#MidNum>.  The schema
   * is satisfied either way: what changes is the parse. */
  it("should keep every number a <#MidNum> when none of them is the sum", function () {
    const ast = compile("doesnt-sum.ttl").ast;
    expect(JSON.stringify(ast)).to.not.include("last");
    expect(ast.right.right).to.deep.equal({op: "num", value: 16});
  });

  /* Which is to say the rule is about the run and not about the number:
   * asked for <#e7> and nothing else, no numbers came before it, the sum of
   * them is 0, and 60 is an ordinary number again. */
  it("should read the same number as a <#MidNum> with nothing before it", function () {
    expect(compile("sums.ttl", {node: E(7)}).ast).to.deep.equal({op: "num", value: 60});
  });

  /* The sum is what the invocations before this one left behind, and the
   * schema's start action is where it lives: run once, before the match,
   * setting up what the rest of the actions share.  Without it they have
   * nowhere to keep it and nothing to read. */
  it("should have nowhere to keep the sum without the start action", function () {
    const withoutStart = read("guide.shex").replace(/%Reduce:\{[\s\S]*?%\}\n/, "");
    expect(withoutStart, "the shapes' own actions are still there").to.include("$ = num($1)");
    expect(() => compile("sums.ttl", {schemaText: withoutStart}))
      .to.throw(/state/);
  });

  /* The state is the bill for steering.  It is keyed by node rather than
   * added up, because an action runs inside an attempt that may be
   * abandoned and may run twice for one node -- here <#MidNum> is offered
   * every number including the one it refuses. */
  it("should offer <#MidNum> more numbers than it keeps", function () {
    const ran = [];
    const ast = compile("sums.ttl", {ran});
    const times = code => ran.filter(c => c.indexOf(code) !== -1).length;
    expect(JSON.stringify(ast).match(/"num"/g).length, "three of them are kept").to.equal(3);
    expect(times("so it ends the expression"), "and it was offered a fourth").to.be.above(3);
    expect(times("not the sum of the numbers before it"), "which <#LastNum> then took")
      .to.be.at.least(1);
  });

  /* Recording instead of running is the same schema and the same actions
   * with a different answer: nothing can fail a branch, so <#MidNum> takes
   * the sum too and the marker its action returned lands in the AST as if
   * it were a value. */
  it("should steer nothing when the actions only record", function () {
    const lazy = compile("sums.ttl", {eager: false});
    expect(lazy.status).to.equal("conformant");
    expect(lazy.ast.right.right).to.deep.equal({
      op: "num",
      value: {failure: "the sum of the numbers before it, so it ends the expression"},
    });
  });
});
