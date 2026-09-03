/** Tests for the shex-debug REPL: shape-level (tracker) and
 * constraint-level (regex-engine debugHooks) validation stepping over
 * injectable I/O (the bin only adds a blocking stdin reader).
 */
"use strict";

const expect = require("chai").expect;
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ShExDebugRepl} = require("../lib/ShExDebugRepl");

const base = "http://a.example/";
const schemaText = [
  "PREFIX : <http://a.example/>",
  "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
  "start = @<S>",
  "<S> {",
  "  :name xsd:string ;",
  "  :ref @<T>",
  "}",
  "<T> { :val . }",
].join("\n");
const dataText = [
  "PREFIX : <http://a.example/>",
  ':x :name "hi" ;',
  "   :ref :y .",
  ":y :val 42 .",
].join("\n");

function session (commands, node = base + "x", opts = {}) {
  const output = [];
  const script = commands.slice();
  const schema = ShExParser.construct(base, {}, {index: true}).parse(opts.schemaText || schemaText);
  const graph = new N3.Store();
  graph.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"})
                 .parse(opts.dataText || dataText));
  const repl = new ShExDebugRepl(opts.schemaText || schemaText, schema, graph, {
    write: s => output.push(s),
    prompt: () => script.length ? script.shift() : null,
  });
  const code = repl.run(node, opts.shape);
  return {code, transcript: output.join("")};
}

describe("ShExDebugRepl", function () {

  it("should pause at shape entries and exits with source excerpts", function () {
    const {code, transcript} = session(["s", "s", "s", "s", "s", "s"]);
    expect(code).to.equal(0);
    expect(transcript).to.match(/enter :x@<[^>]*S>|enter :x@:S/);
    expect(transcript).to.match(/enter :y@/);      // the nested <T> evaluation
    expect(transcript).to.match(/exit {2}:x@.*-> ok/);
    expect(transcript).to.include("<S> {");         // declaration excerpt
    expect(transcript).to.include("conformant");
  });

  it("should step over the nested shape and its constraints", function () {
    // first pause is enter :x@<S>; stepping over must skip enter :y@<T>
    // (depth 2) and every constraint event, landing on exit :x (depth 1)
    const {transcript} = session(["n", "c"]);
    const untilExit = transcript.split(/exit/)[0];
    expect(untilExit).not.to.match(/enter :y@/);
    expect(untilExit).not.to.match(/^at :/m);
    expect(transcript).to.match(/exit {2}:x@.*-> ok/);
    expect(transcript).to.include("conformant");
  });

  it("should step into constraint events", function () {
    const {transcript} = session(["s", "s", "s", "s", "s", "s", "s", "s"]);
    expect(transcript).to.match(/at :name for :x \(1 candidate triple\)/);
    expect(transcript).to.match(/at :ref for :x/);
    expect(transcript).to.match(/at :val for :y/);
    expect(transcript).to.include(":name xsd:string ;"); // constraint excerpt
    expect(transcript).to.include("conformant");
  });

  it("should break on a predicate", function () {
    const {transcript} = session(["bp :val", "c", "c"]);
    expect(transcript).to.include("breakpoint on predicate :val");
    expect(transcript).to.match(/at :val for :y/);
    expect(transcript).to.include("conformant");
  });

  it("should break on a shape by label and on a constraint by position", function () {
    const tLine = schemaText.split("\n").findIndex(l => l.startsWith("<T>")) + 1;
    const byLabel = session(["bs <T>", "c", "c", "c"]);
    expect(byLabel.transcript).to.match(/breakpoint on shape .*T/);
    expect(byLabel.transcript).to.match(/enter :y@/);
    // a position breakpoint prefers the constraint on that line
    const byPosition = session(["b " + tLine, "c", "c", "c"]);
    expect(byPosition.transcript).to.match(/breakpoint on .*:val/);
    expect(byPosition.transcript).to.match(/at :val for :y/);
  });

  it("should break on the lexical form of a focus node", function () {
    const {transcript} = session(["bn :y", "c", "c", "c"]);
    expect(transcript).to.include("breakpoint on node :y");
    expect(transcript).to.match(/enter :y@/);
  });

  it("should abort on q", function () {
    const {code, transcript} = session(["q"]);
    expect(code).to.equal(2);
    expect(transcript).to.include("aborted");
    expect(transcript).not.to.include("conformant");
  });

  it("should report nonconformance", function () {
    const {code, transcript} = session([], base + "y", {shape: base + "S"});
    expect(code).to.equal(1);
    expect(transcript).to.include("nonconformant");
  });
});
