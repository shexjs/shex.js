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

/** the grammar with the compiler hung on it, and a graph to read */
function setUp (dataFile) {
  const schema = ShExParser.construct("http://a.example/", null, {index: true})
        .parse(read("calc.shex"), "http://a.example/", undefined, "calc.shex");

  const overlay = new N3.Store();
  overlay.addQuads(new N3.Parser({baseIRI: "http://a.example/", format: "text/turtle"})
                   .parse(read("calc-actions.ttl")));
  const compiler = applyOverlay(schema, overlay);

  const graph = new N3.Store();
  graph.addQuads(new N3.Parser({baseIRI: "http://a.example/", format: "text/turtle"})
                 .parse(read(dataFile)));

  return {compiler, db: RdfJsDb(graph)};
}

/** recognize `dataFile` against the calc grammar and reduce it to an AST */
function compile (dataFile, node) {
  const {compiler, db} = setUp(dataFile);
  const validator = new ShExValidator(compiler, db, {});
  Reduce.register(validator);
  const res = validator.validateShapeMap([{node, shape: CALC + "Expr"}]);
  expect(res[0].status, JSON.stringify(res[0].appinfo)).to.equal("conformant");
  return Reduce.reduce(res, {evaluate: jsActions, prefixes: PREFIXES})[0];
}

/** ...and the same with the actions running as the matcher matches, where
 * what they say about the match is the match's to answer for */
function recognize (dataFile, node) {
  const {compiler, db} = setUp(dataFile);
  const validator = new ShExValidator(compiler, db, {});
  Reduce.registerEager(validator, {evaluate: jsActions, prefixes: PREFIXES});
  return validator.validateShapeMap([{node, shape: CALC + "Expr"}])[0];
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

  /* A fact about two of a production's parts at once -- this operator with
   * that operand -- is beyond a grammar and is what an action is for.  It
   * cuts rather than rejects: <#e1> was never going to be a <#Num> instead,
   * so the reader gets this reason rather than the last branch's. */
  it("should refuse an explicit division by zero", function () {
    const res = recognize("divide-by-zero.ttl", "http://a.example/expr3#e1");
    expect(res.status).to.equal("nonconformant");
    expect(JSON.stringify(res.appinfo)).to.include("division by zero");
    expect(JSON.stringify(res.appinfo), "and not the branch it never tried")
      .to.not.include("Num");
  });

  /* ...only while there is a match to refuse, though: folding a parse that
   * already happened, what the action said lands in the AST as a value.
   * `(1 + 2) / 0` is still an AST; it is just not one to evaluate. */
  it("should leave the same complaint in the AST when it folds afterwards", function () {
    expect(compile("divide-by-zero.ttl", "http://a.example/expr3#e1"))
      .to.deep.equal({failure: "division by zero", cut: true});
  });

  /* Where the line is: the action asks whether the right operand is the
   * number 0, which is a fact about the production it is reducing.  It does
   * not evaluate the expression -- that is what compiling rather than
   * evaluating means -- so `/ (5 - 5)` gets through both the grammar and
   * the actions, and divides by zero in the hands of whoever runs the AST. */
  it("should let a division by a zero it has to work out through", function () {
    const ast = compile("divide-by-computed-zero.ttl", "http://a.example/expr4#e1");
    expect(ast).to.deep.equal({
      op: "Div",
      left: {op: "Add", left: {op: "num", value: 1}, right: {op: "num", value: 2}},
      right: {op: "Sub", left: {op: "num", value: 5}, right: {op: "num", value: 5}},
    });
    expect(recognize("divide-by-computed-zero.ttl", "http://a.example/expr4#e1").status,
           "and the match it steers is happy too").to.equal("conformant");
    expect(evaluate(ast), "which leaves the zero for the evaluator to divide by")
      .to.equal(Infinity);
  });

  /* The examples are about the fold rather than about JavaScript, and this
   * is what that means: the same grammar file and the same data file, with
   * a second overlay whose actions are written in a language that is not
   * JavaScript at all -- a JSON template, whose evaluator is the six lines
   * below -- reduce to the same AST.
   *
   * The `$...` in the templates are extension-reduce's, not the template
   * language's: they are rewritten to ordinary names before any evaluator
   * sees them, which is what lets one syntax for naming a production's
   * parts serve every action language. */
  it("should compile the same graph with actions in another language", function () {
    const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
    const templates = `
      PREFIX sa: <http://shex.io/ns/semact#>
      <#template> a sa:Overlay ;
        sa:extension <http://shex.io/extensions/Reduce/> ;
        sa:action
        [ sa:ref <${CALC}Num> ;
          sa:code '{"op": "num", "value": "$:value"}' ] ,
        [ sa:ref <${CALC}BinOp> ;
          sa:code '{"op": "^$rdf:type", "left": "$:left", "right": "$:right"}' ] .`;

    // a literal arrives as {value: "3", type}, which is a lexical form and
    // a datatype; a language may say what it makes of that, and this one
    // unboxes it (a term, here, being an object whose value is a string --
    // what an action reduced to is anything at all)
    const unbox = v => v !== null && typeof v === "object" && typeof v.value === "string"
          ? (/integer|decimal|double/.test(v.type || "") ? Number(v.value) : v.value)
          : v;
    /** the whole of the language: a string that names a binding is that
     * binding's value, and `^` in front of one takes an IRI's local part */
    const template = (code, scope) => JSON.parse(code, (_key, v) => {
      if (typeof v !== "string")
        return v;
      const local = v[0] === "^";
      const name = local ? v.substr(1) : v;
      if (!(name in scope.bindings))
        return v;
      const got = unbox(scope.bindings[name]);
      return local ? String(got).replace(/^.*[#/]/, "") : got;
    });

    const schema = ShExParser.construct("http://a.example/", null, {index: true})
          .parse(read("calc.shex"), "http://a.example/", undefined, "calc.shex");
    const overlay = new N3.Store();
    overlay.addQuads(new N3.Parser({baseIRI: "http://a.example/", format: "text/turtle"})
                     .parse(templates));
    const compiler = applyOverlay(schema, overlay);
    const graph = new N3.Store();
    graph.addQuads(new N3.Parser({baseIRI: "http://a.example/", format: "text/turtle"})
                   .parse(read("expr1.ttl")));

    const validator = new ShExValidator(compiler, RdfJsDb(graph), {});
    Reduce.register(validator);
    const res = validator.validateShapeMap(
      [{node: "http://a.example/expr1#e1", shape: CALC + "Expr"}]);
    expect(Reduce.reduce(res, {evaluate: template, schema: compiler,
                               prefixes: {"": CALC, rdf: RDF}})[0])
      .to.deep.equal(compile("expr1.ttl", "http://a.example/expr1#e1"));
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
