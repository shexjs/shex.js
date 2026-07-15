/** MatchDebugger (doc/debugger-design.md): step through one shape's NFA
 * simulation in eval-simple-1err, replaying a match() recorded by
 * capturingRegexModule.  Thread views carry the aspects specific to a
 * validation thread: state-machine position, repeat counts, and the
 * matched-triples partition.
 */
"use strict";

const expect = require("chai").expect;
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("..");
const {capturingRegexModule} = require("@shexjs/eval-validator-api");
const {RegexpModule, MatchDebugger} = require("@shexjs/eval-simple-1err");

const base = "http://a.example/";
const schemaText = [
  "PREFIX : <http://a.example/>",
  "start = @<S>",
  "<S> { :p . ; (:q . ; :r .){1,2} }", // the group Rept carries a counter
].join("\n");
const dataText = [
  "PREFIX : <http://a.example/>",
  ":x :p 0 ; :q 1 ; :r 2 ; :q 3 ; :r 4 .",
].join("\n");

function capture () {
  const schema = ShExParser.construct(base, {}, {index: true}).parse(schemaText);
  const graph = new N3.Store();
  graph.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"}).parse(dataText));
  const {module, captures} = capturingRegexModule(RegexpModule);
  const validator = new ShExValidator(schema, RdfJsDb(graph), {regexModule: module});
  const res = validator.validateShapeMap([{node: base + "x", shape: ShExValidator.Start}])[0];
  expect(res.status).to.equal("conformant");
  expect(captures.length).to.equal(1);
  return captures[0];
}

function debuggerFor (cap) {
  return new MatchDebugger(cap.engine, cap.node, cap.constraintToTripleMapping, cap.semActHandler);
}

describe("MatchDebugger", function () {

  it("should step through constraint events with thread views", function () {
    const dbg = debuggerFor(capture());
    const first = dbg.stepInto();
    expect(first.type).to.equal("constraint");
    expect(first.tc.predicate).to.equal(base + "p");
    expect(first.generation).to.equal(0);
    expect(first.thread.at).to.equal(base + "p");
    expect(first.thread.matched).to.deep.equal([]); // nothing consumed yet
    expect(dbg.threads().length).to.be.above(0);

    // the next generation's thread has committed :p's triple to its partition
    const next = dbg.stepOver();
    expect(next.generation).to.equal(1);
    expect(next.thread.matched.length).to.equal(1);
    expect(next.thread.matched[0].predicate).to.equal(base + "p");
    expect(next.thread.matched[0].triples[0]).to.include(":x".replace(":", base));
  });

  it("should replay to the same result and expose it as done", function () {
    const cap = capture();
    const dbg = debuggerFor(cap);
    const done = dbg.continue();
    expect(done.type).to.equal("done");
    expect(dbg.done).to.equal(true);
    expect(JSON.parse(JSON.stringify(dbg.result)))
      .to.deep.equal(JSON.parse(JSON.stringify(cap.result)));
  });

  it("should pause at a predicate breakpoint", function () {
    const dbg = debuggerFor(capture());
    dbg.addBreakpoint({predicate: base + "q"});
    const at = dbg.continue();
    expect(at.type).to.equal("constraint");
    expect(at.tc.predicate).to.equal(base + "q");
  });

  it("should expose repeat counts in thread views", function () {
    const dbg = debuggerFor(capture());
    dbg.addBreakpoint({predicate: base + "q"});
    dbg.continue();
    // {1,3} compiles a Rept state; some live thread carries its counter
    const counted = dbg.threads().filter(t => Object.keys(t.repeats).length > 0);
    expect(counted.length).to.be.above(0);
  });

  it("should refuse an engine without runMatch", function () {
    const cap = capture();
    expect(() => new MatchDebugger({match: () => null}, cap.node,
                                   cap.constraintToTripleMapping, cap.semActHandler))
      .to.throw(/steppable/);
  });
});
