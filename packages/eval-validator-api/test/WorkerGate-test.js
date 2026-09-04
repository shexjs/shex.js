/** WorkerGate (plan.md E9 / doc/debugger-design.md §1, §4): live
 * whole-validation stepping via a worker that blocks on Atomics.wait
 * between events.  These tests run the validator in a real worker_threads
 * worker and drive it from here (the controlling thread) -- the same
 * mechanism the browser uses, proven without a browser.  The controlling
 * thread stays responsive because it is the *worker* that blocks, not us.
 */
"use strict";

const expect = require("chai").expect;
const path = require("path");
const {Worker} = require("worker_threads");
const {createCommandBuffer, GateController} = require("@shexjs/eval-validator-api");

const base = "http://a.example/";
const schemaText = `PREFIX : <${base}>
:S { :p . ; :q . }
`;
const dataText = `PREFIX : <${base}>
:x :p 1 ; :q 2 .
`;

/** spawn the worker, drive each pause with `decide(event, index) ->
 * {command, breakpoints?}`, and resolve with the events seen and the
 * terminal message ("done"+status, "aborted", or "error"). */
function drive ({schema = schemaText, data = dataText, node = base + "x", shape = base + "S"} = {}, decide) {
  return new Promise((resolve, reject) => {
    const sab = createCommandBuffer();
    const controller = new GateController(sab);
    const worker = new Worker(path.join(__dirname, "worker-gate-worker.js"), {
      workerData: {sab, schemaText: schema, dataText: data, base, node, shape},
    });
    const events = [];
    worker.on("message", msg => {
      if (msg.type === "paused") {
        events.push(msg.event);
        let choice;
        try {
          choice = decide(msg.event, events.length - 1);
        } catch (e) { worker.terminate(); return reject(e); }
        controller.resume(choice.command, choice.breakpoints || {});
      } else {
        worker.terminate();
        resolve({events, terminal: msg});
      }
    });
    worker.on("error", err => { worker.terminate(); reject(err); });
  });
}

describe("WorkerGate (live validation stepping in a worker)", function () {
  this.timeout(15000);

  it("steps into every event of a two-constraint shape, in order", async function () {
    // walk the whole validation one event at a time
    const {events, terminal} = await drive({}, () => ({command: "into"}));
    expect(terminal).to.deep.equal({type: "done", status: "conformant"});

    // enter :x@:S, then each constraint, then exit ok -- depths nest
    const shape = base + "S";
    expect(events[0]).to.include({type: "enter", shape, depth: 1});
    expect(events[0].node).to.deep.include({termType: "NamedNode", value: base + "x"});

    const constraints = events.filter(e => e.type === "constraint");
    expect(constraints.map(e => e.predicate)).to.deep.equal([base + "p", base + "q"]);
    constraints.forEach(e => {
      expect(e.depth, "a constraint nests under its shape").to.equal(2);
      expect(e.candidates, "each predicate has one candidate triple").to.equal(1);
      expect(e.tcOrdinal).to.be.a("number").and.least(0);
    });

    const exit = events.find(e => e.type === "exit");
    expect(exit).to.include({type: "exit", shape, depth: 1, ok: true});
  });

  it("continue from the first pause runs to done with no further pause", async function () {
    const {events, terminal} = await drive({}, () => ({command: "continue"}));
    expect(events.length, "only the first event paused").to.equal(1);
    expect(events[0].type).to.equal("enter");
    expect(terminal).to.deep.equal({type: "done", status: "conformant"});
  });

  it("adopts a predicate breakpoint set while paused, then continues to it", async function () {
    // the frozen/editable model: no breakpoint when the run starts; at the
    // first pause the controller adds one on :q and continues -- the worker
    // adopts it as it wakes and stops at :q's constraint, never at :p's.
    const seen = [];
    const {events, terminal} = await drive({}, (event, i) => {
      seen.push(event);
      if (i === 0)
        return {command: "continue", breakpoints: {predicates: [base + "q"]}};
      return {command: "continue"};
    });
    const paused = events.filter(e => e.type === "constraint");
    expect(paused, "paused at exactly one constraint").to.have.length(1);
    expect(paused[0].predicate, "and it was the one the breakpoint named").to.equal(base + "q");
    expect(terminal).to.deep.equal({type: "done", status: "conformant"});
  });

  it("a constraint-ordinal breakpoint set while paused stops at that constraint", async function () {
    // ordinal 0 is :p (the shared tripleConstraints() ordering); prove the
    // clone-safe constraint key resolves the same on both sides.
    const {events} = await drive({}, (event, i) => {
      if (i === 0)
        return {command: "continue", breakpoints: {constraints: [0]}};
      return {command: "continue"};
    });
    const paused = events.filter(e => e.type === "constraint");
    expect(paused).to.have.length(1);
    expect(paused[0].tcOrdinal).to.equal(0);
    expect(paused[0].predicate).to.equal(base + "p");
  });

  it("abort throws out of the engine and reports aborted", async function () {
    const {events, terminal} = await drive({}, () => ({command: "abort"}));
    expect(events.length, "paused once, then aborted").to.equal(1);
    expect(terminal).to.deep.equal({type: "aborted"});
  });

  it("step over the shape's body skips its constraints", async function () {
    // "over" at the enter (depth 1) pauses only at events with depth <= 1,
    // so the depth-2 constraints are skipped and the next pause is the exit.
    const {events, terminal} = await drive({}, (event) => {
      if (event.type === "enter")
        return {command: "over"};
      return {command: "continue"};
    });
    expect(events.some(e => e.type === "constraint"), "no constraint paused").to.be.false;
    expect(events.map(e => e.type)).to.deep.equal(["enter", "exit"]);
    expect(terminal).to.deep.equal({type: "done", status: "conformant"});
  });
});
