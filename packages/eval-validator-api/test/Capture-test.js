/** A validation's matches, captured by one engine and replayed by the
 * stepper -- with the semantic actions answering from the recording rather
 * than running again (plan.md E1, E3). */
"use strict";

const expect = require("chai").expect;
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ShExValidator} = require("@shexjs/validator");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {RegexpModule: Stepper, MatchDebugger} = require("@shexjs/eval-simple-1err");
const {RegexpModule: Threaded} = require("@shexjs/eval-threaded-nerr");
const {capturingRegexModule, recordingSemActHandler, replayingSemActHandler} = require("..");

const base = "http://a.example/";
const ACT = "http://a.example/act";
const schemaText = `PREFIX : <${base}>
:S { :p . %<${ACT}>{ p %} ; :q . %<${ACT}>{ q %} }
`;
const dataText = `PREFIX : <${base}>
:x :p 1 ; :q "two" .
`;

/** a validation of :x@:S, capturing with `engine`; the action counts its runs */
function capture (engine) {
  const schema = ShExParser.construct(base, {}, {index: true}).parse(schemaText);
  const store = new N3.Store();
  store.addQuads(new N3.Parser({baseIRI: base}).parse(dataText));
  const {module, captures} = capturingRegexModule(engine);
  const ran = [];
  const validator = new ShExValidator(schema, RdfJsDb(store), {regexModule: module, noCache: true});
  validator.semActHandler.register(ACT, {
    dispatch (code, ctx) {
      ran.push(code.trim());
      return code.trim() === "q" ? [{type: "SemActFailure", errors: ["q said no"]}] : [];
    },
  });
  const result = validator.validateShapeMap([{node: base + "x", shape: base + "S"}]);
  return {schema, captures, ran, result};
}

describe("capturingRegexModule", function () {

  it("should say which engine ran each match, and keep what the actions answered", function () {
    const {captures, ran, result} = capture(Threaded);
    expect(result[0].status, "q's action fails the shape").to.equal("nonconformant");
    expect(captures.length).to.equal(1);
    expect(captures[0].regexModule).to.equal("eval-threaded-nerr");
    expect(ran).to.deep.equal(["p", "q"]);
    const keys = captures[0].semActLog.map(r => JSON.parse(r.key));
    expect(keys.length, "two dispatches recorded").to.equal(2);
    expect(keys[0][0][0], "the action, by name and code").to.include(ACT);
    expect(keys[0][2].join(" "), "over the triple it ran on").to.include(base + "p");
    expect(captures[0].semActLog.map(r => r.failures.length)).to.deep.equal([0, 1]);
  });

  it("should replay a match another engine ran, with the stepper, running no action", function () {
    const {schema, captures, ran} = capture(Threaded);
    const cap = captures[0];
    const engine = Stepper.compile(schema, cap.shape, schema._index);
    const handler = replayingSemActHandler(cap.semActLog, cap.semActHandler);
    const dbg = new MatchDebugger(engine, cap.node, cap.constraintToTripleMapping, handler);
    const events = [];
    for (let at = dbg.stepInto(); at && at.type !== "done" && at.type !== "error"; at = dbg.stepInto())
      events.push(at.type);
    expect(dbg.done).to.equal(true);
    expect(events).to.include("constraint");
    expect(ran, "the actions did not run again").to.deep.equal(["p", "q"]);
    expect(handler.unrecorded, "every dispatch found its answer").to.deep.equal([]);
    expect("errors" in dbg.result, "and q's recorded failure still fails the match").to.equal(true);
    expect(JSON.stringify(dbg.result)).to.include("q said no");
  });

  it("should replay the stepper's own capture on the engine that ran it", function () {
    const {captures, ran} = capture(Stepper);
    const cap = captures[0];
    expect(cap.regexModule).to.equal("eval-simple-1err");
    const dbg = new MatchDebugger(cap.engine, cap.node, cap.constraintToTripleMapping,
                                  replayingSemActHandler(cap.semActLog, cap.semActHandler));
    dbg.continue();
    expect(dbg.done).to.equal(true);
    expect(ran).to.deep.equal(["p", "q"]);
  });

  it("should answer nothing, and say so, for a dispatch the recording lacks", function () {
    const inner = {
      results: {},
      register () {},
      dispatchAll (semActs, ctx) { return [{type: "SemActFailure", errors: ["ran"]}]; },
    };
    const {handler, log} = recordingSemActHandler(inner);
    const acts = [{type: "SemAct", name: ACT, code: " p "}];
    expect(handler.dispatchAll(acts, {triples: []}, {}).length).to.equal(1);
    expect(log.length).to.equal(1);
    const replay = replayingSemActHandler(log, inner);
    expect(replay.dispatchAll(acts, {triples: []}, {}).length, "from the log").to.equal(1);
    expect(replay.dispatchAll(acts, {triples: []}, {}), "the log is spent").to.deep.equal([]);
    expect(replay.unrecorded.length).to.equal(1);
    expect(replay.dispatchAll(undefined, {}, {}), "no actions asks nothing").to.deep.equal([]);
    expect(replay.unrecorded.length, "and is not a gap").to.equal(1);
  });
});
