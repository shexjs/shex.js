/** calc, where the actions can falsify the match.
 *
 * The schema chooses: <#LastExpr> is an operator whose right is another
 * <#LastExpr>, so the rightmost leaf -- and only it -- is a <#LastNum>.
 * The actions choose nothing.  They check what the schema chose, against
 * the running sum they keep between invocations, and a check that fails
 * fails the match rather than sending the OR anywhere.
 *
 * `Calc-semact-guide` is the other half of the pair: there the schema
 * leaves the choice open and the actions make it.  Same data, same rule.
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

/** Recognize `data` against falsify.shex, which carries its actions inline. */
function compile (data, {node = E(1), shape = CALC + "CalcExpr", eager = true, ran = null} = {}) {
  const schema = ShExParser.construct(BASE, null, {index: true})
        .parse(read("falsify.shex"), BASE, undefined, "falsify.shex");
  const graph = new N3.Store();
  graph.addQuads(new N3.Parser({baseIRI: BASE, format: "text/turtle"}).parse(read(data)));

  const validator = new ShExValidator(schema, RdfJsDb(graph), {});
  const evaluate = ran === null ? jsActions
    : (code, scope) => { ran.push(code); return jsActions(code, scope); };
  const options = {evaluate, prefixes: PREFIXES};
  if (eager)
    Reduce.registerEager(validator, options);
  else
    Reduce.register(validator);
  const res = validator.validateShapeMap([{node, shape}]);
  return {
    status: res[0].status,
    errors: JSON.stringify(res[0].appinfo),
    ast: res[0].status === "conformant"
      ? Reduce.reduce(res, eager ? {} : options)[0]
      : undefined,
  };
}

describe("calc, where the actions can falsify the match", function () {

  it("should match, and reduce to the same AST the steered parse gives", function () {
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

  /* The whole point: the schema is satisfied -- <#e7> is where a <#LastNum>
   * belongs and it is a number -- and the match fails anyway, because the
   * action that checked it said no. */
  it("should falsify a match the schema is happy with", function () {
    const wrong = compile("doesnt-sum.ttl");
    expect(wrong.status).to.equal("nonconformant");
    expect(wrong.errors).to.include("not the sum of the numbers before it");
  });

  /* And it is the schema that picked which number to check: <#MidNum> is
   * offered the other three and never <#e7>, where the guide schema offers
   * <#MidNum> every number and lets it refuse the one it can't keep. */
  it("should offer each number to the one production the schema chose", function () {
    const ran = [];
    compile("doesnt-sum.ttl", {ran});
    const times = code => ran.filter(c => c.indexOf(code) !== -1).length;
    expect(times("state.note(subject"), "<#MidNum>, on the three before it").to.equal(3);
    expect(times("not the sum of the numbers before it"), "<#LastNum>, once").to.equal(1);
  });

  it("should check the number the schema chose, wherever the value came from", function () {
    expect(compile("sums.ttl", {node: E(7), shape: CALC + "LastNum"}).status,
           "on its own, nothing came before it and the sum is 0")
      .to.equal("nonconformant");
  });

  /* Recording instead of running is the same schema and the same actions
   * with a different answer: nothing can fail a match, so the wrong sum
   * conforms and the marker the action returned lands in the AST as if it
   * were a value.  A check that cannot falsify is a comment. */
  it("should falsify nothing when the actions only record", function () {
    const lazy = compile("doesnt-sum.ttl", {eager: false});
    expect(lazy.status).to.equal("conformant");
    expect(lazy.ast.right.right).to.deep.equal({
      op: "last",
      value: {failure: "not the sum of the numbers before it"},
    });
  });
});
