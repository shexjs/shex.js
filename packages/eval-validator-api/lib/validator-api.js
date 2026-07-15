"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapArray = void 0;
exports.capturingRegexModule = capturingRegexModule;
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
 * them step by step (doc/debugger-design.md).  Note that replay re-dispatches
 * the match's semantic actions. */
function capturingRegexModule(inner) {
    const captures = [];
    const module = {
        name: inner.name + "-capturing",
        description: inner.description + " (recording match invocations)",
        compile: (schema, shape, index, debugHooks) => {
            const engine = inner.compile(schema, shape, index, debugHooks);
            return {
                match: (node, constraintToTripleMapping, semActHandler, trace) => {
                    const result = engine.match(node, constraintToTripleMapping, semActHandler, trace);
                    captures.push({ shape, node, constraintToTripleMapping, semActHandler, engine, result });
                    return result;
                }
            };
        }
    };
    return { module, captures };
}
