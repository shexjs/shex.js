"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapArray = void 0;
exports.capturingRegexModule = capturingRegexModule;
exports.recordingSemActHandler = recordingSemActHandler;
exports.replayingSemActHandler = replayingSemActHandler;
exports.eventTracker = eventTracker;
// import {NeighborhoodDb} from "@shexjs/neighborhood-api";
const term_1 = require("@shexjs/term");
class MapArray {
    constructor() {
        this.data = new Map(); // public 'cause I don't know how to fix reduce to use this.data
        this.reduce = (f, acc) => {
            const keys = [...this.data.keys()];
            for (const key of keys)
                acc = f(acc, key, this.data.get(key));
            return acc;
        };
    }
    add(a, t) {
        if (!this.data.has(a)) {
            this.data.set(a, []);
        }
        if (this.data.get(a).indexOf(t) !== -1) {
            throw Error(`Error adding [${a}] ${t}; already included`);
        }
        this.data.get(a).push(t);
    }
    get length() { return this.data.size; }
    get keys() { return this.data.keys(); }
    get(key) { return this.data.get(key); }
    empty(key) {
        this.data.set(key, []);
    }
}
exports.MapArray = MapArray;
/** capturingRegexModule - wrap a regex module so every match() run during a
 * validation is recorded with its inputs; a debugger can then replay any of
 * them step by step (doc/debugger-design.md).  The semantic actions run
 * once, here: their answers go into the capture's log, and a replay reads
 * them back rather than dispatching again. */
function capturingRegexModule(inner) {
    const captures = [];
    const module = {
        name: inner.name + "-capturing",
        description: inner.description + " (recording match invocations)",
        compile: (schema, shape, index, debugHooks) => {
            const engine = inner.compile(schema, shape, index, debugHooks);
            return {
                match: (node, constraintToTripleMapping, semActHandler, trace) => {
                    const recorder = recordingSemActHandler(semActHandler);
                    const result = engine.match(node, constraintToTripleMapping, recorder.handler, trace);
                    captures.push({ shape, node, constraintToTripleMapping, semActHandler, engine, result,
                        regexModule: inner.name, semActLog: recorder.log });
                    return result;
                }
            };
        }
    };
    return { module, captures };
}
function termKey(t) {
    return t && t.termType
        ? t.termType + ":" + t.value + (t.datatype ? "^^" + t.datatype.value : "") + (t.language ? "@" + t.language : "")
        : String(t);
}
function quadKey(q) {
    return q ? [q.subject, q.predicate, q.object].map(termKey).join(" ") : "";
}
/** The key a dispatch is recorded and replayed under: the actions, by name
 * and code, and the triples they ran over -- not the order they ran in.
 * A replay by another engine dispatches the same actions over the same
 * triples in an order of its own, and still finds each answer. */
function semActDispatchKey(semActs, ctx) {
    const acts = (semActs || []).map(a => a.name + "\u0001" + (a.code === undefined || a.code === null ? "" : a.code));
    const triples = ctx && Array.isArray(ctx.triples) ? ctx.triples.map(quadKey) : [];
    const node = ctx && ctx.node ? termKey(ctx.node) : "";
    return JSON.stringify([acts, node, triples]);
}
/** recordingSemActHandler - a dispatcher that answers as `inner` does and
 * keeps what it answered, for replayingSemActHandler. */
function recordingSemActHandler(inner) {
    const log = [];
    const handler = Object.create(inner);
    handler.dispatchAll = (semActs, ctx, resultsArtifact) => {
        const failures = inner.dispatchAll(semActs, ctx, resultsArtifact);
        log.push({ key: semActDispatchKey(semActs, ctx), failures });
        return failures;
    };
    return { handler, log };
}
/** replayingSemActHandler - a dispatcher that answers from a log and runs
 * nothing: a side-effect-free replay.  What it is asked that the log
 * doesn't hold (a replay that took another path) it answers "no failures",
 * and lists in `unrecorded`.  Everything but dispatching -- which actions
 * apply, which are registered -- is still `inner`'s to answer. */
function replayingSemActHandler(log, inner) {
    const queues = new Map();
    log.forEach(({ key, failures }) => {
        if (!queues.has(key))
            queues.set(key, []);
        queues.get(key).push(failures);
    });
    const handler = Object.create(inner);
    handler.unrecorded = [];
    handler.register = () => { };
    handler.dispatchAll = (semActs, ctx, _resultsArtifact) => {
        const queue = queues.get(semActDispatchKey(semActs, ctx));
        if (queue && queue.length)
            return queue.shift();
        if (semActs && semActs.length)
            handler.unrecorded.push(semActDispatchKey(semActs, ctx));
        return [];
    };
    return handler;
}
/** eventTracker - the tracker ShExValidator takes, as a stream of
 * ShapeDebugEvents to `onEvent`.  `depth` is readable between events, for
 * a constraint-level hook that nests under the current shape. */
function eventTracker(onEvent) {
    const tracker = {
        depth: 0,
        enter(node, shape) {
            ++tracker.depth;
            onEvent({ type: "enter", node, shape, depth: tracker.depth });
        },
        exit(node, shape, result) {
            onEvent({ type: "exit", node, shape, result, depth: tracker.depth });
            --tracker.depth;
        },
        recurse(rec) {
            onEvent({ type: "recurse", node: (0, term_1.ld2RdfJsTerm)(rec.node), shape: rec.shape,
                depth: tracker.depth + 1 });
        },
        known(result) {
            onEvent({ type: "known", result, depth: tracker.depth + 1 });
        },
    };
    return tracker;
}
