/** worker-gate-worker - the worker half of the WorkerGate harness
 * (doc/debugger-design.md §1, §4).  Runs a real ShExValidator synchronously
 * and gates every shape- and constraint-level event through a WorkerGate,
 * which blocks this thread on Atomics.wait until the test (the controlling
 * thread) resumes it.  This is exactly the shape of wiring the browser's
 * ShExWorkerThread will use; here it proves the mechanism under Node's
 * worker_threads, no browser needed.
 */
"use strict";

const {parentPort, workerData} = require("worker_threads");
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ShExValidator} = require("@shexjs/validator");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {eventTracker, WorkerGate, schemaTripleConstraints, DebugAbort} =
      require("@shexjs/eval-validator-api");

const {sab, schemaText, dataText, base, node, shape} = workerData;

const schema = ShExParser.construct(base, {}, {index: true}).parse(schemaText);
const store = new N3.Store();
store.addQuads(new N3.Parser({baseIRI: base}).parse(dataText));

const gate = new WorkerGate(
  sab,
  msg => parentPort.postMessage(msg),   // {type: "paused", event}
  schemaTripleConstraints(schema),
);

// the shape-level events are the validator's tracker (a cached answer is no
// place to pause); the constraint-level events are the regex engine's
// debugHook, one level below the shape that ran it -- same wiring as
// shex-debug, but the gate blocks the thread instead of reading stdin.
const tracker = eventTracker(event => {
  if (event.type !== "known")
    gate.gate(event);
});

const validator = new ShExValidator(schema, RdfJsDb(store), {
  noCache: true,
  debugHooks: {
    onConstraint: (tc, ctx) => gate.gate({
      type: "constraint", tc, node: ctx.node, triples: ctx.triples,
      depth: tracker.depth + 1,
    }),
  },
});

try {
  const results = validator.validateShapeMap(
    [{node, shape: shape || ShExValidator.Start}], tracker);
  parentPort.postMessage({type: "done", status: results[0].status});
} catch (e) {
  if (e instanceof DebugAbort)
    parentPort.postMessage({type: "aborted"});
  else
    parentPort.postMessage({type: "error", message: String((e && e.message) || e)});
}
