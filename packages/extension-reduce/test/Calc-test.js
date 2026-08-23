/** The ubiquitous calculator, compiled rather than evaluated.
 *
 * examples/calc/ has three files that never mention each other: a grammar
 * (calc.shex), a graph in that language (expr1.ttl), and a compiler
 * (calc-actions.ttl).  Recognizing the graph against the grammar produces a
 * parse; folding the actions over the parse produces an AST; and evaluating
 * the AST is somebody else's job entirely -- which is the point of compiling
 * rather than evaluating as you match.
 */
"use strict";

const {expect} = require("chai");
const Fs = require("fs");
const Path = require("path");
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("@shexjs/validator");
const {applyOverlay} = require("@shexjs/semact-overlay");
const Reduce = require("..");
const jsActions = require("@shexjs/extension-reduce-js");   // runs the actions
// ...not to be confused with `evaluate` below, which runs the AST they build

const HERE = Path.join(__dirname, "..", "examples", "calc");
const read = f => Fs.readFileSync(Path.join(HERE, f), "utf8");
const CALC = "http://a.example/calc#";
const PREFIXES = {"": CALC};

/** recognize `dataFile` against the calc grammar and reduce it to an AST */
function compile (dataFile, node) {
  const schema = ShExParser.construct("http://a.example/", null, {index: true})
        .parse(read("calc.shex"), "http://a.example/", undefined, "calc.shex");

  const overlay = new N3.Store();
  overlay.addQuads(new N3.Parser({baseIRI: "http://a.example/", format: "text/turtle"})
                   .parse(read("calc-actions.ttl")));
  const compiler = applyOverlay(schema, overlay);

  const graph = new N3.Store();
  graph.addQuads(new N3.Parser({baseIRI: "http://a.example/", format: "text/turtle"})
                 .parse(read(dataFile)));

  const validator = new ShExValidator(compiler, RdfJsDb(graph), {});
  Reduce.register(validator);
  const res = validator.validateShapeMap([{node, shape: CALC + "Expr"}]);
  expect(res[0].status, JSON.stringify(res[0].appinfo)).to.equal("conformant");
  return Reduce.reduce(res, {evaluate: jsActions, prefixes: PREFIXES})[0];
}

/** an evaluator for the AST -- deliberately knowing nothing about RDF */
function evaluate (ast) {
  if (ast.op === "num") return ast.value;
  const [l, r] = [evaluate(ast.left), evaluate(ast.right)];
  switch (ast.op) {
  case "Add": return l + r;
  case "Sub": return l - r;
  case "Mul": return l * r;
  case "Div": return l / r;
  default: throw Error("no such operator: " + ast.op);
  }
}

describe("calc, compiled", function () {

  it("should reduce an expression graph to an AST", function () {
    expect(compile("expr1.ttl", "http://a.example/expr1#e1")).to.deep.equal({
      op: "Mul",
      left: {op: "Add", left: {op: "num", value: 1}, right: {op: "num", value: 2}},
      right: {op: "num", value: 3},
    });
  });

  /* The AST is plain data with no RDF left in it, which is what "compiled,
   * not executed" buys: whoever evaluates it needn't have heard of ShEx. */
  it("should hand the AST to an evaluator that has never heard of RDF", function () {
    expect(evaluate(compile("expr1.ttl", "http://a.example/expr1#e1"))).to.equal(9);
  });

  it("should reduce a leaf on its own", function () {
    expect(compile("expr1.ttl", "http://a.example/expr1#e3"))
      .to.deep.equal({op: "num", value: 3});
  });

  /* The grammar is what refuses a bad graph; the actions never run. */
  it("should not recognize a graph the grammar rejects", function () {
    const schema = ShExParser.construct("http://a.example/", null, {index: true})
          .parse(read("calc.shex"), "http://a.example/", undefined, "calc.shex");
    const graph = new N3.Store();
    graph.addQuads(new N3.Parser({baseIRI: "http://a.example/", format: "text/turtle"}).parse(
      `PREFIX : <${CALC}>\n<http://a.example/x> a :Mul ; :left <http://a.example/y> .`));
    const validator = new ShExValidator(schema, RdfJsDb(graph), {});
    Reduce.register(validator);
    const res = validator.validateShapeMap(
      [{node: "http://a.example/x", shape: CALC + "Expr"}]);
    expect(res[0].status, "no :right").to.equal("nonconformant");
  });
});
