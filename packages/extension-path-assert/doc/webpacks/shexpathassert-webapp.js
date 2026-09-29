/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 532
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
exports.TermSet = exports.EvalError = void 0;
exports.isThenable = isThenable;
exports.then = then;
__webpack_unused_export__ = all;
__webpack_unused_export__ = union;
exports.evaluate = evaluate;
exports.explain = explain;
const parser_1 = __webpack_require__(490);
const functions_1 = __webpack_require__(224);
const terms_1 = __webpack_require__(662);
function isThenable(x) {
    return x !== null && typeof x === "object" && typeof x.then === "function";
}
function then(x, f) {
    return isThenable(x) ? x.then(f) : f(x);
}
function all(xs) {
    return xs.some(isThenable) ? Promise.all(xs) : xs;
}
/** what went wrong with the expression rather than with the data: an
 * unbound variable, a step with nothing to step from, a bad arity */
class EvalError extends Error {
    constructor(message) { super(message); this.name = "EvalError"; }
}
exports.EvalError = EvalError;
class TermSet {
    constructor() {
        this.items = [];
        this.keys = new Set();
    }
    static of(...terms) {
        const s = new TermSet();
        terms.forEach(t => s.add(t));
        return s;
    }
    add(t) {
        const k = (0, terms_1.termKey)(t);
        if (!this.keys.has(k)) {
            this.keys.add(k);
            this.items.push(t);
        }
        return this;
    }
    has(t) { return this.keys.has((0, terms_1.termKey)(t)); }
    get size() { return this.items.length; }
    /** effective boolean value: some item's is true */
    get ebv() { return this.items.some(terms_1.ebvOf); }
}
exports.TermSet = TermSet;
function union(sets) {
    const out = new TermSet();
    sets.forEach(s => s.items.forEach(t => out.add(t)));
    return out;
}
const withItem = (env, item) => ({ item, vars: env.vars });
const bind = (env, name, value) => {
    const vars = new Map(env.vars);
    vars.set(name, value);
    return { item: env.item, vars };
};
// ── data access ─────────────────────────────────────────────────────────────
/** the terms one step away along `predicate`: the objects of the arcs out
 * of `term`, or the subjects of the arcs into it for an inverse step */
function arcs(ctx, term, predicate, inverse) {
    if (!inverse && term.termType === "Literal")
        return []; // a literal is the end of the road
    const key = (0, terms_1.termKey)(term) + (inverse ? "|^" : "|") + predicate;
    const have = ctx.memo.get(key);
    if (have !== undefined)
        return have;
    // Told as a shape, so a source that fetches selectively (neighborhood-sparql
    // asks for a shape's predicates) fetches just this step.
    const shape = { type: "Shape", expression: Object.assign({ type: "TripleConstraint", predicate }, inverse ? { inverse: true } : {}) };
    const got = then(ctx.db.getNeighborhood(term, ctx.shapeLabel, shape), nb => inverse
        ? nb.incoming.filter(q => q.predicate.value === predicate).map(q => q.subject)
        : nb.outgoing.filter(q => q.predicate.value === predicate).map(q => q.object));
    if (isThenable(got)) {
        const settled = got.then(v => { ctx.memo.set(key, v); return v; });
        ctx.memo.set(key, settled);
        return settled;
    }
    ctx.memo.set(key, got);
    return got;
}
// ── evaluation ──────────────────────────────────────────────────────────────
const Comparisons = {
    "<": c => c < 0, "<=": c => c <= 0, ">": c => c > 0, ">=": c => c >= 0,
};
/** every combination of one item from each set */
function product(sets) {
    return sets.reduce((acc, s) => {
        const out = [];
        acc.forEach(row => s.items.forEach(t => out.push(row.concat([t]))));
        return out;
    }, [[]]);
}
function numeric(t) {
    if (t.termType !== "Literal")
        return undefined;
    const v = (0, terms_1.valueOf)(t);
    return v.kind === "number" ? { n: v.n, kind: v.numeric } : undefined;
}
function arithmetic(op, l, r) {
    const out = new TermSet();
    for (const [a, b] of product([l, r])) {
        const x = numeric(a), y = numeric(b);
        if (x === undefined || y === undefined)
            continue;
        let kind = (0, terms_1.widerKind)(x.kind, y.kind);
        let n;
        switch (op) {
            case "+":
                n = x.n + y.n;
                break;
            case "-":
                n = x.n - y.n;
                break;
            case "*":
                n = x.n * y.n;
                break;
            case "div":
                if (y.n === 0 && kind !== "double")
                    continue; // SPARQL: an error, so nothing
                n = x.n / y.n;
                if (kind === "integer")
                    kind = "decimal";
                break;
            default: // mod
                if (y.n === 0)
                    continue;
                n = x.n % y.n;
        }
        out.add((0, terms_1.number)(n, kind));
    }
    return out;
}
function compare(op, l, r) {
    // general comparison: true if some pair compares so (XPath), pairs
    // without an order counting as not (SPARQL's type error)
    for (const [a, b] of product([l, r])) {
        if (op === "=") {
            if ((0, terms_1.equalTerms)(a, b))
                return TermSet.of((0, terms_1.bool)(true));
            continue;
        }
        if (op === "!=") {
            if (!(0, terms_1.equalTerms)(a, b))
                return TermSet.of((0, terms_1.bool)(true));
            continue;
        }
        const c = (0, terms_1.compareTerms)(a, b);
        if (c !== undefined && Comparisons[op](c))
            return TermSet.of((0, terms_1.bool)(true));
    }
    return TermSet.of((0, terms_1.bool)(false));
}
function evaluate(node, env, ctx) {
    switch (node.type) {
        case "Context":
            if (env.item === undefined)
                throw noContext(node, ctx);
            return TermSet.of(env.item);
        case "Var": {
            const v = env.vars.get(node.name);
            if (v === undefined)
                throw new EvalError(`$${node.name} is not bound`);
            return v;
        }
        case "Literal":
            return TermSet.of(node.term);
        case "NodeRef":
            return TermSet.of((0, terms_1.namedNode)(node.iri));
        case "Step":
            if (env.item === undefined)
                throw noContext(node, ctx);
            return then(arcs(ctx, env.item, node.iri, node.inverse), ts => TermSet.of(...ts));
        case "Closure":
            return closure(node, env, ctx);
        case "Filter":
            return then(evaluate(node.expr, env, ctx), set => then(all(set.items.map(item => evaluate(node.predicate, withItem(env, item), ctx))), tests => {
                const out = new TermSet();
                set.items.forEach((item, i) => { if (tests[i].ebv)
                    out.add(item); });
                return out;
            }));
        case "Path":
            return node.steps.slice(1).reduce((acc, step) => then(acc, set => then(all(set.items.map(item => evaluate(step, withItem(env, item), ctx))), union)), evaluate(node.steps[0], env, ctx));
        case "Sequence":
            return then(all(node.items.map(item => evaluate(item, env, ctx))), union);
        case "Negate":
            return then(evaluate(node.expr, env, ctx), set => {
                const out = new TermSet();
                set.items.forEach(t => { const v = numeric(t); if (v !== undefined)
                    out.add((0, terms_1.number)(-v.n, v.kind)); });
                return out;
            });
        case "Not":
            return then(evaluate(node.expr, env, ctx), set => TermSet.of((0, terms_1.bool)(!set.ebv)));
        case "Binary":
            switch (node.op) {
                case "or":
                    return then(evaluate(node.left, env, ctx), l => l.ebv ? TermSet.of((0, terms_1.bool)(true))
                        : then(evaluate(node.right, env, ctx), r => TermSet.of((0, terms_1.bool)(r.ebv))));
                case "and":
                    return then(evaluate(node.left, env, ctx), l => !l.ebv ? TermSet.of((0, terms_1.bool)(false))
                        : then(evaluate(node.right, env, ctx), r => TermSet.of((0, terms_1.bool)(r.ebv))));
                case "implies":
                    return then(evaluate(node.left, env, ctx), l => !l.ebv ? TermSet.of((0, terms_1.bool)(true))
                        : then(evaluate(node.right, env, ctx), r => TermSet.of((0, terms_1.bool)(r.ebv))));
                default:
                    return then(all([evaluate(node.left, env, ctx), evaluate(node.right, env, ctx)]), ([l, r]) => {
                        switch (node.op) {
                            case "union": return union([l, r]);
                            case "intersect": {
                                const out = new TermSet();
                                l.items.forEach(t => { if (r.has(t))
                                    out.add(t); });
                                return out;
                            }
                            case "except": {
                                const out = new TermSet();
                                l.items.forEach(t => { if (!r.has(t))
                                    out.add(t); });
                                return out;
                            }
                            case "+":
                            case "-":
                            case "*":
                            case "div":
                            case "mod": return arithmetic(node.op, l, r);
                            default: return compare(node.op, l, r);
                        }
                    });
            }
        case "Call": {
            const fn = (0, functions_1.lookupFunction)(node.name);
            if (fn === undefined)
                throw new EvalError(`unknown function ${node.name}()`);
            if (node.args.length < fn.min || node.args.length > fn.max)
                throw new EvalError(`${node.name}() takes ${fn.min === fn.max ? fn.min : fn.max === Infinity ? `at least ${fn.min}` : `${fn.min} to ${fn.max}`} argument${fn.max === 1 ? "" : "s"}, not ${node.args.length}`);
            return then(all(node.args.map(arg => evaluate(arg, env, ctx))), sets => {
                if (fn.kind === "agg")
                    return TermSet.of(...fn.agg(sets));
                const out = new TermSet();
                for (const row of product(sets)) {
                    const t = fn.map(row);
                    if (t !== undefined)
                        out.add(t);
                }
                return out;
            });
        }
        case "Let":
            return then(evaluate(node.value, env, ctx), v => evaluate(node.body, bind(env, node.name, v), ctx));
        case "If":
            return then(evaluate(node.test, env, ctx), t => evaluate(t.ebv ? node.then : node.else, env, ctx));
        case "Quantified":
            return then(evaluate(node.domain, env, ctx), domain => then(all(domain.items.map(item => evaluate(node.body, bind(env, node.name, TermSet.of(item)), ctx))), results => TermSet.of((0, terms_1.bool)(node.kind === "some" ? results.some(r => r.ebv) : results.every(r => r.ebv)))));
    }
}
function noContext(node, ctx) {
    return new EvalError(`"${(0, parser_1.textOf)(ctx.code, node)}" has nothing to start from: there is no context item here `
        + `(a start action has none); begin at $this, a variable, or a node (@<iri>)`);
}
/** the nodes reachable from the context item by 0+ (*), 1+ (+) or 0..1 (?)
 * applications of the expression, each application from the node before */
function closure(node, env, ctx) {
    if (env.item === undefined)
        throw noContext(node, ctx);
    const start = env.item;
    const result = new TermSet();
    if (node.kind !== "+")
        result.add(start);
    // what has been stepped from (or is about to be): the start is, so a
    // cycle back to it counts it as reached (for `+`) but doesn't loop
    const expanded = new Set([(0, terms_1.termKey)(start)]);
    let frontier = [start];
    const round = () => {
        if (frontier.length === 0)
            return result;
        return then(all(frontier.map(m => evaluate(node.expr, withItem(env, m), ctx))), sets => {
            const next = [];
            for (const s of sets)
                for (const t of s.items) {
                    result.add(t);
                    const k = (0, terms_1.termKey)(t);
                    if (!expanded.has(k)) {
                        expanded.add(k);
                        next.push(t);
                    }
                }
            frontier = next;
            return node.kind === "?" ? result : round();
        });
    };
    return round();
}
// ── explaining a failure ────────────────────────────────────────────────────
/** an expression whose value doesn't depend on the data */
function isConstant(n) {
    switch (n.type) {
        case "Literal":
        case "NodeRef": return true;
        case "Sequence": return n.items.every(isConstant);
        case "Negate": return isConstant(n.expr);
        case "Binary": return (n.op === "+" || n.op === "-" || n.op === "*" || n.op === "div" || n.op === "mod" || n.op === "union")
            && isConstant(n.left) && isConstant(n.right);
        case "Call": return n.args.every(isConstant);
        default: return false;
    }
}
/** The sub-expressions whose values say why the assertion failed: the
 * operands of its comparisons, the paths its boolean functions look at.
 * Bound-variable scopes are left alone (their values aren't the top
 * context's), and so are constants. */
function collect(n, out) {
    const push = (m) => { if (!isConstant(m))
        out.push(m); };
    switch (n.type) {
        case "Binary":
            if (n.op === "or" || n.op === "and" || n.op === "implies") {
                collect(n.left, out);
                collect(n.right, out);
            }
            else {
                push(n.left);
                push(n.right);
            }
            return;
        case "Not":
        case "Negate":
            collect(n.expr, out);
            return;
        case "If":
            collect(n.test, out);
            return;
        case "Call": {
            const fn = (0, functions_1.lookupFunction)(n.name);
            const name = n.name.toLowerCase();
            if (name === "not" || name === "exists" || name === "empty" || name === "boolean") {
                n.args.forEach(a => collect(a, out));
                return;
            }
            if (fn !== undefined && fn.kind === "agg") {
                push(n);
                return;
            }
            n.args.forEach(push);
            return;
        }
        case "Step":
        case "Path":
        case "Filter":
        case "Closure":
        case "Context":
        case "Var":
            push(n);
            return;
        default: return;
    }
}
const SHOWN = 6;
function explain(ast, env, ctx, serialize) {
    const nodes = [];
    collect(ast, nodes);
    const seen = new Set();
    const wanted = nodes.filter(n => {
        const text = (0, parser_1.textOf)(ctx.code, n);
        if (seen.has(text))
            return false;
        seen.add(text);
        return true;
    });
    const lines = wanted.map(n => {
        const text = (0, parser_1.textOf)(ctx.code, n);
        let value;
        try {
            value = evaluate(n, env, ctx);
        }
        catch (_e) {
            return undefined;
        }
        const show = (set) => {
            const items = set.items.slice(0, SHOWN).map(serialize);
            if (set.items.length > SHOWN)
                items.push(`… (${set.items.length - SHOWN} more)`);
            return `${text} = ${items.length === 0 ? "(empty)" : items.join(", ")}`;
        };
        return isThenable(value) ? value.then(show, () => undefined) : show(value);
    });
    return then(all(lines), ls => ls.filter((l) => l !== undefined));
}
//# sourceMappingURL=evaluator.js.map

/***/ },

/***/ 224
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
exports.ah = exports.AssertFailed = void 0;
__webpack_unused_export__ = langMatches;
exports.lookupFunction = lookupFunction;
const terms_1 = __webpack_require__(662);
class AssertFailed extends Error {
    constructor(message) { super(message); this.name = "AssertFailed"; }
}
exports.AssertFailed = AssertFailed;
// ── helpers ─────────────────────────────────────────────────────────────────
const isLiteral = (t) => t.termType === "Literal";
/** a string-valued literal's text: xsd:string, rdf:langString, or (leniently) any literal */
function text(t) {
    return isLiteral(t) ? t.value : undefined;
}
/** a literal's language, "" for none; undefined for a non-literal */
function language(t) {
    return isLiteral(t) ? (t.language || "") : undefined;
}
/** a string result keeps the language of the string it came from (SPARQL §17.4.3) */
function like(source, value) {
    const lang = language(source);
    return lang ? (0, terms_1.langLiteral)(value, lang) : (0, terms_1.literal)(value);
}
function num(t) {
    if (!isLiteral(t))
        return undefined;
    const v = (0, terms_1.valueOf)(t);
    return v.kind === "number" ? { n: v.n, kind: v.numeric } : undefined;
}
function date(t) {
    if (!isLiteral(t))
        return undefined;
    const v = (0, terms_1.valueOf)(t);
    return v.kind === "date" ? new Date(v.ms) : undefined;
}
function regexFlags(flags) {
    // SPARQL's s m i x q; JS has i m s (x and q are not offered)
    return (flags || "").split("").filter(f => "ims".indexOf(f) !== -1).join("");
}
/** RFC 4647 basic filtering, as SPARQL's langMatches */
function langMatches(tag, range) {
    if (tag === "")
        return false;
    if (range === "*")
        return true;
    const t = tag.toLowerCase(), r = range.toLowerCase();
    return t === r || t.startsWith(r + "-");
}
const str1 = (f) => ([a]) => { const s = text(a); return s === undefined ? undefined : f(s, a); };
const str2 = (f) => ([a, b]) => { const s = text(a), u = text(b); return s === undefined || u === undefined ? undefined : f(s, u, a); };
const num1 = (f) => ([a]) => { const v = num(a); return v === undefined ? undefined : (0, terms_1.number)(f(v.n, v.kind), v.kind); };
const date1 = (f) => ([a]) => { const d = date(a); return d === undefined ? undefined : (0, terms_1.number)(f(d), "integer"); };
// ── the library ─────────────────────────────────────────────────────────────
const map = (min, max, fn) => ({ kind: "map", min, max, map: fn });
const agg = (min, max, fn) => ({ kind: "agg", min, max, agg: fn });
exports.ah = {
    // terms
    str: map(1, 1, ([a]) => a.termType === "Literal" || a.termType === "NamedNode" ? (0, terms_1.literal)(a.value) : undefined),
    lang: map(1, 1, ([a]) => { const l = language(a); return l === undefined ? undefined : (0, terms_1.literal)(l); }),
    datatype: map(1, 1, ([a]) => isLiteral(a) ? (0, terms_1.namedNode)(a.language ? terms_1.RDF_LANGSTRING : a.datatype ? a.datatype.value : terms_1.XSD_STRING) : undefined),
    iri: map(1, 1, ([a]) => a.termType === "NamedNode" ? a : isLiteral(a) ? (0, terms_1.namedNode)(a.value) : undefined),
    isiri: map(1, 1, ([a]) => (0, terms_1.bool)(a.termType === "NamedNode")),
    isblank: map(1, 1, ([a]) => (0, terms_1.bool)(a.termType === "BlankNode")),
    isliteral: map(1, 1, ([a]) => (0, terms_1.bool)(a.termType === "Literal")),
    isnumeric: map(1, 1, ([a]) => (0, terms_1.bool)(num(a) !== undefined)),
    strdt: map(2, 2, ([a, dt]) => { const s = text(a); return s === undefined || dt.termType !== "NamedNode" ? undefined : (0, terms_1.literal)(s, dt.value); }),
    strlang: map(2, 2, ([a, l]) => { const s = text(a), lang = text(l); return s === undefined || !lang ? undefined : (0, terms_1.langLiteral)(s, lang); }),
    sameterm: map(2, 2, ([a, b]) => (0, terms_1.bool)((0, terms_1.termKey)(a) === (0, terms_1.termKey)(b))),
    langmatches: map(2, 2, ([a, b]) => { const t = text(a), r = text(b); return t === undefined || r === undefined ? undefined : (0, terms_1.bool)(langMatches(t, r)); }),
    // strings
    strlen: map(1, 1, str1(s => (0, terms_1.number)([...s].length, "integer"))),
    substr: map(2, 3, ([a, start, len]) => {
        const s = text(a), b = num(start), l = len === undefined ? undefined : num(len);
        if (s === undefined || b === undefined || (len !== undefined && l === undefined))
            return undefined;
        const chars = [...s];
        const from = Math.round(b.n) - 1; // SPARQL and XPath count from 1
        const to = l === undefined ? chars.length : from + Math.round(l.n);
        return like(a, chars.slice(Math.max(0, from), Math.max(0, to)).join(""));
    }),
    ucase: map(1, 1, str1((s, t) => like(t, s.toUpperCase()))),
    lcase: map(1, 1, str1((s, t) => like(t, s.toLowerCase()))),
    strstarts: map(2, 2, str2((a, b) => (0, terms_1.bool)(a.startsWith(b)))),
    strends: map(2, 2, str2((a, b) => (0, terms_1.bool)(a.endsWith(b)))),
    contains: map(2, 2, str2((a, b) => (0, terms_1.bool)(a.indexOf(b) !== -1))),
    strbefore: map(2, 2, str2((a, b, t) => { const i = a.indexOf(b); return like(t, i === -1 ? "" : a.substring(0, i)); })),
    strafter: map(2, 2, str2((a, b, t) => { const i = a.indexOf(b); return like(t, i === -1 ? "" : a.substring(i + b.length)); })),
    concat: map(0, Infinity, args => {
        const parts = args.map(text);
        if (parts.some(p => p === undefined))
            return undefined;
        const langs = new Set(args.map(language));
        const value = parts.join("");
        return langs.size === 1 && args.length > 0 && args[0].termType === "Literal" && args[0].language
            ? (0, terms_1.langLiteral)(value, args[0].language) : (0, terms_1.literal)(value);
    }),
    replace: map(3, 4, ([a, pat, rep, flags]) => {
        const s = text(a), p = text(pat), r = text(rep), f = flags === undefined ? "" : text(flags);
        if (s === undefined || p === undefined || r === undefined || f === undefined)
            return undefined;
        try {
            return like(a, s.replace(new RegExp(p, "g" + regexFlags(f)), r));
        }
        catch (_e) {
            return undefined;
        }
    }),
    regex: map(2, 3, ([a, pat, flags]) => {
        const s = text(a), p = text(pat), f = flags === undefined ? "" : text(flags);
        if (s === undefined || p === undefined || f === undefined)
            return undefined;
        try {
            return (0, terms_1.bool)(new RegExp(p, regexFlags(f)).test(s));
        }
        catch (_e) {
            return undefined;
        }
    }),
    // numbers
    abs: map(1, 1, num1(n => Math.abs(n))),
    round: map(1, 1, num1(n => Math.round(n))),
    ceil: map(1, 1, num1(n => Math.ceil(n))),
    floor: map(1, 1, num1(n => Math.floor(n))),
    // dates and times
    now: map(0, 0, () => (0, terms_1.literal)(new Date().toISOString(), terms_1.XSD_DATETIME)),
    year: map(1, 1, date1(d => d.getUTCFullYear())),
    month: map(1, 1, date1(d => d.getUTCMonth() + 1)),
    day: map(1, 1, date1(d => d.getUTCDate())),
    hours: map(1, 1, date1(d => d.getUTCHours())),
    minutes: map(1, 1, date1(d => d.getUTCMinutes())),
    seconds: map(1, 1, date1(d => d.getUTCSeconds())),
    // sets
    count: agg(1, 1, ([a]) => [(0, terms_1.number)(a.items.length, "integer")]),
    exists: agg(1, 1, ([a]) => [(0, terms_1.bool)(a.items.length > 0)]),
    empty: agg(1, 1, ([a]) => [(0, terms_1.bool)(a.items.length === 0)]),
    not: agg(1, 1, ([a]) => [(0, terms_1.bool)(!a.items.some(terms_1.ebvOf))]),
    boolean: agg(1, 1, ([a]) => [(0, terms_1.bool)(a.items.some(terms_1.ebvOf))]),
    distinct: agg(1, 1, ([a]) => a.items), // sets are already distinct
    sum: agg(1, 1, ([a]) => {
        const ns = a.items.map(num).filter((v) => v !== undefined);
        return [(0, terms_1.number)(ns.reduce((s, v) => s + v.n, 0), ns.reduce((k, v) => (0, terms_1.widerKind)(k, v.kind), "integer"))];
    }),
    avg: agg(1, 1, ([a]) => {
        const ns = a.items.map(num).filter((v) => v !== undefined);
        if (ns.length === 0)
            return [];
        return [(0, terms_1.number)(ns.reduce((s, v) => s + v.n, 0) / ns.length, (0, terms_1.widerKind)("decimal", ns.reduce((k, v) => (0, terms_1.widerKind)(k, v.kind), "integer")))];
    }),
    min: agg(1, 1, ([a]) => extreme(a.items, -1)),
    max: agg(1, 1, ([a]) => extreme(a.items, 1)),
    // the verdict
    fail: agg(0, 1, ([a]) => {
        const msg = a === undefined ? "fail()" : a.items.map(text).filter(s => s !== undefined).join(" ") || "fail()";
        throw new AssertFailed(msg);
    }),
};
/** the least (-1) or greatest (1) of the items that order with each other */
function extreme(items, sign) {
    let best = null;
    for (const item of items) {
        if (best === null) {
            best = item;
            continue;
        }
        const c = (0, terms_1.compareTerms)(item, best);
        if (c !== undefined && c * sign > 0)
            best = item;
    }
    return best === null ? [] : [best];
}
/** XPath's names for the SPARQL functions that came from XPath */
const Aliases = {
    "string-length": "strlen", "upper-case": "ucase", "lower-case": "lcase",
    "starts-with": "strstarts", "ends-with": "strends", "substring": "substr",
    "substring-before": "strbefore", "substring-after": "strafter", "matches": "regex",
    "ceiling": "ceil", "distinct-values": "distinct", "error": "fail", "uri": "iri", "isuri": "isiri",
    "string": "str",
};
function lookupFunction(name) {
    const key = name.toLowerCase();
    return exports.ah[key] || exports.ah[Aliases[key]];
}
//# sourceMappingURL=functions.js.map

/***/ },

/***/ 490
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
exports.AssertSyntaxError = void 0;
exports.parse = parse;
exports.textOf = textOf;
const terms_1 = __webpack_require__(662);
class AssertSyntaxError extends Error {
    constructor(message, pos, code) {
        super(message + "\n" + code + "\n" + " ".repeat(Math.max(0, pos)) + "^");
        this.pos = pos;
        this.name = "AssertSyntaxError";
    }
}
exports.AssertSyntaxError = AssertSyntaxError;
const NAME_START = /[A-Za-z_À-￿]/;
const NAME_CHAR = /[A-Za-z0-9_.\-À-￿]/;
const LOCAL_CHAR = /[A-Za-z0-9_.\-%\\À-￿]/;
const PUNCT2 = [":=", "!=", "<=", ">=", "&&", "||"];
const PUNCT1 = "()[],/^|=<>+-*?.!";
function lex(code, opts) {
    const tokens = [];
    const prefixes = opts.prefixes || {};
    let i = 0;
    let ws = false;
    const fail = (msg, at) => { throw new AssertSyntaxError(msg, at, code); };
    const resolveIri = (iri) => {
        if (!opts.base || /^[a-z][a-z0-9+.-]*:/i.test(iri))
            return iri;
        try {
            return new URL(iri, opts.base).href;
        }
        catch (_e) {
            return iri;
        }
    };
    const expandPname = (pname, at) => {
        const colon = pname.indexOf(":");
        const prefix = pname.substring(0, colon), local = pname.substring(colon + 1);
        if (!(prefix in prefixes))
            fail(`unknown prefix "${prefix}:" (the schema's PREFIX declarations are in scope)`, at);
        return prefixes[prefix] + local.replace(/\\(.)/g, "$1");
    };
    /** an IRIREF or a prefixed name at i, or null */
    const iriAt = () => {
        if (code[i] === "<") {
            const m = /^<([^<>"{}|^`\\\s]*)>/.exec(code.substring(i));
            return m ? { iri: resolveIri(m[1]), end: i + m[0].length } : null;
        }
        let j = i;
        while (j < code.length && NAME_CHAR.test(code[j]))
            j++;
        if (code[j] !== ":")
            return null;
        j++;
        while (j < code.length && LOCAL_CHAR.test(code[j])) {
            if (code[j] === "\\")
                j++; // an escaped local char
            j++;
        }
        while (code[j - 1] === "." && j > i)
            j--; // a trailing dot ends the sentence, not the name
        return { iri: expandPname(code.substring(i, j), i), end: j };
    };
    while (i < code.length) {
        const c = code[i];
        if (/\s/.test(c)) {
            i++;
            ws = true;
            continue;
        }
        if (c === "#") {
            while (i < code.length && code[i] !== "\n")
                i++;
            ws = true;
            continue;
        }
        const pos = i;
        const push = (t, v, end, extra = {}) => {
            tokens.push(Object.assign({ t, v, pos, end, ws }, extra));
            i = end;
            ws = false;
        };
        if (c === '"' || c === "'") { // a string literal
            let j = i + 1, s = "";
            while (j < code.length && code[j] !== c) {
                if (code[j] === "\\") {
                    const e = code[j + 1];
                    const simple = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", '"': '"', "'": "'", "\\": "\\" };
                    if (e in simple) {
                        s += simple[e];
                        j += 2;
                    }
                    else if (e === "u" || e === "U") {
                        const len = e === "u" ? 4 : 8;
                        const hex = code.substring(j + 2, j + 2 + len);
                        if (!/^[0-9A-Fa-f]+$/.test(hex) || hex.length !== len)
                            fail("bad \\" + e + " escape", j);
                        s += String.fromCodePoint(parseInt(hex, 16));
                        j += 2 + len;
                    }
                    else
                        fail("unknown escape \\" + e, j);
                }
                else {
                    s += code[j];
                    j++;
                }
            }
            if (j >= code.length)
                fail("unterminated string", i);
            j++;
            const extra = {};
            const langMatch = /^@([A-Za-z]+(?:-[A-Za-z0-9]+)*)/.exec(code.substring(j));
            if (langMatch) {
                extra.lang = langMatch[1];
                j += langMatch[0].length;
            }
            else if (code.startsWith("^^", j)) {
                i = j + 2;
                const dt = iriAt();
                if (dt === null)
                    fail("expected a datatype IRI after ^^", j);
                extra.dt = dt.iri;
                j = dt.end;
            }
            i = pos;
            push("str", s, j, extra);
            continue;
        }
        if (/[0-9]/.test(c)) { // a number
            const m = /^[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?/.exec(code.substring(i));
            const kind = m[2] ? "double" : m[1] ? "decimal" : "integer";
            push("num", m[0], i + m[0].length, { kind });
            continue;
        }
        if (c === "@") { // a node
            i++;
            const iri = iriAt();
            if (iri === null)
                fail("expected an IRI or prefixed name after @", pos);
            i = pos;
            push("noderef", iri.iri, iri.end);
            continue;
        }
        if ((c === "$" || c === "?") && i + 1 < code.length && NAME_START.test(code[i + 1])) {
            let j = i + 1;
            while (j < code.length && /[A-Za-z0-9_À-￿]/.test(code[j]))
                j++;
            push("var", code.substring(i + 1, j), j);
            continue;
        }
        if (c === "<" && !code.startsWith("<=", i)) {
            const iri = iriAt();
            if (iri !== null) {
                push("iri", iri.iri, iri.end);
                continue;
            }
        }
        if (code.startsWith(":=", i)) {
            push("punct", ":=", i + 2);
            continue;
        } // before a prefixed name's ":"
        if (c === ":" || NAME_START.test(c)) { // a prefixed name, a keyword or a function name
            const iri = iriAt();
            if (iri !== null) {
                push("iri", iri.iri, iri.end);
                continue;
            }
            let j = i;
            while (j < code.length && NAME_CHAR.test(code[j]))
                j++;
            while (code[j - 1] === "." && j > i)
                j--;
            if (j === i)
                fail(`unexpected "${c}"`, i);
            push("name", code.substring(i, j), j);
            continue;
        }
        const two = code.substring(i, i + 2);
        if (PUNCT2.indexOf(two) !== -1) {
            push("punct", two, i + 2);
            continue;
        }
        if (PUNCT1.indexOf(c) !== -1) {
            push("punct", c, i + 1);
            continue;
        }
        fail(`unexpected "${c}"`, i);
    }
    tokens.push({ t: "eof", v: "", pos: code.length, end: code.length, ws });
    return tokens;
}
// ── parser ──────────────────────────────────────────────────────────────────
const KEYWORDS = new Set(["let", "return", "if", "then", "else", "some", "every", "in", "satisfies",
    "implies", "or", "and", "union", "intersect", "except", "div", "mod",
    "true", "false", "a"]);
/** what a closure can apply to: something that navigates from its context */
function isPathLike(n) {
    switch (n.type) {
        case "Step":
        case "Closure":
        case "Filter":
        case "Path": return true;
        case "Binary": return (n.op === "union" || n.op === "intersect" || n.op === "except") && isPathLike(n.left) && isPathLike(n.right);
        case "Sequence": return n.items.every(isPathLike);
        default: return false;
    }
}
function parse(code, opts = {}) {
    const tokens = lex(code, opts);
    let k = 0;
    const peek = () => tokens[k];
    const next = () => tokens[k++];
    const fail = (msg, tok = peek()) => {
        throw new AssertSyntaxError(msg + (tok.t === "eof" ? " at the end" : ` at "${code.substring(tok.pos, tok.end)}"`), tok.pos, code);
    };
    const isPunct = (v, tok = peek()) => tok.t === "punct" && tok.v === v;
    const isName = (v, tok = peek()) => tok.t === "name" && tok.v === v;
    const expectPunct = (v) => isPunct(v) ? next() : fail(`expected "${v}"`);
    const expectName = (v) => isName(v) ? next() : fail(`expected "${v}"`);
    const expectVar = () => peek().t === "var" ? next().v : fail("expected a $variable");
    const span = (start) => ({ start, end: tokens[k - 1].end });
    function parseExpr() {
        const start = peek().pos;
        const items = [parseExprSingle()];
        while (isPunct(",")) {
            next();
            items.push(parseExprSingle());
        }
        return items.length === 1 ? items[0] : { type: "Sequence", items, ...span(start) };
    }
    function parseExprSingle() {
        const start = peek().pos;
        if (isName("let")) {
            next();
            const name = expectVar();
            expectPunct(":=");
            const value = parseExprSingle();
            expectName("return");
            const body = parseExprSingle();
            return { type: "Let", name, value, body, ...span(start) };
        }
        if (isName("if")) {
            next();
            expectPunct("(");
            const test = parseExpr();
            expectPunct(")");
            expectName("then");
            const then = parseExprSingle();
            expectName("else");
            const otherwise = parseExprSingle();
            return { type: "If", test, then, else: otherwise, ...span(start) };
        }
        if (isName("some") || isName("every")) {
            const kind = next().v;
            const name = expectVar();
            expectName("in");
            const domain = parseExprSingle();
            expectName("satisfies");
            const body = parseExprSingle();
            return { type: "Quantified", kind, name, domain, body, ...span(start) };
        }
        const left = parseOr();
        if (isName("implies")) {
            next();
            const right = parseExprSingle();
            return { type: "Binary", op: "implies", left, right, ...span(start) };
        }
        return left;
    }
    function binaryLevel(ops, below, names) {
        const start = peek().pos;
        let left = below();
        for (;;) {
            const tok = peek();
            const key = (names && tok.t === "name") || tok.t === "punct" ? tok.v : "";
            if (!(key in ops))
                return left;
            next();
            const right = below();
            left = { type: "Binary", op: ops[key], left, right, ...span(start) };
        }
    }
    const parseOr = () => binaryLevel({ or: "or", "||": "or" }, parseAnd, true);
    const parseAnd = () => binaryLevel({ and: "and", "&&": "and" }, parseComparison, true);
    function parseComparison() {
        const start = peek().pos;
        const left = parseAdditive();
        const tok = peek();
        if (tok.t === "punct" && ["=", "!=", "<", "<=", ">", ">="].indexOf(tok.v) !== -1) {
            next();
            const right = parseAdditive();
            if (peek().t === "punct" && ["=", "!=", "<", "<=", ">", ">="].indexOf(peek().v) !== -1)
                fail("comparisons don't chain: use `and`");
            return { type: "Binary", op: tok.v, left, right, ...span(start) };
        }
        return left;
    }
    const parseAdditive = () => binaryLevel({ "+": "+", "-": "-" }, parseMultiplicative, false);
    const parseMultiplicative = () => binaryLevel({ "*": "*", div: "div", mod: "mod" }, parseUnion, true);
    const parseUnion = () => binaryLevel({ "|": "union", union: "union" }, parseIntersect, true);
    const parseIntersect = () => binaryLevel({ intersect: "intersect", except: "except" }, parseUnary, true);
    function parseUnary() {
        const start = peek().pos;
        if (isPunct("-")) {
            next();
            return { type: "Negate", expr: parseUnary(), ...span(start) };
        }
        if (isPunct("!")) {
            next();
            return { type: "Not", expr: parseUnary(), ...span(start) };
        }
        return parsePath();
    }
    function parsePath() {
        const start = peek().pos;
        const steps = [parseStep()];
        while (isPunct("/")) {
            next();
            steps.push(parseStep());
        }
        return steps.length === 1 ? steps[0] : { type: "Path", steps, ...span(start) };
    }
    function parseStep() {
        const start = peek().pos;
        let node = parsePrimary();
        const tok = peek();
        if (tok.t === "punct" && (tok.v === "*" || tok.v === "+" || tok.v === "?") && !tok.ws) {
            if (!isPathLike(node))
                fail(`"${tok.v}" right after this is a closure, and closures apply to path steps; put a space before it for arithmetic`, tok);
            next();
            node = { type: "Closure", kind: tok.v, expr: node, ...span(start) };
        }
        while (isPunct("[")) {
            next();
            const predicate = parseExpr();
            expectPunct("]");
            node = { type: "Filter", expr: node, predicate, ...span(start) };
        }
        return node;
    }
    function parsePrimary() {
        const tok = peek();
        const start = tok.pos;
        switch (tok.t) {
            case "punct":
                if (tok.v === ".") {
                    next();
                    return { type: "Context", ...span(start) };
                }
                if (tok.v === "(") {
                    next();
                    if (isPunct(")")) {
                        next();
                        return { type: "Sequence", items: [], ...span(start) };
                    }
                    const inner = parseExpr();
                    expectPunct(")");
                    return inner;
                }
                if (tok.v === "^") {
                    next();
                    const target = peek();
                    if (target.t === "iri") {
                        next();
                        return { type: "Step", iri: target.v, inverse: true, ...span(start) };
                    }
                    if (isName("a")) {
                        next();
                        return { type: "Step", iri: terms_1.RDF_TYPE, inverse: true, ...span(start) };
                    }
                    return fail("expected a property after ^");
                }
                return fail("unexpected");
            case "iri":
                next();
                return { type: "Step", iri: tok.v, inverse: false, ...span(start) };
            case "noderef":
                next();
                return { type: "NodeRef", iri: tok.v, ...span(start) };
            case "var":
                next();
                return { type: "Var", name: tok.v, ...span(start) };
            case "str": {
                next();
                const term = tok.lang ? (0, terms_1.langLiteral)(tok.v, tok.lang) : (0, terms_1.literal)(tok.v, tok.dt);
                return { type: "Literal", term, ...span(start) };
            }
            case "num": {
                next();
                return { type: "Literal", term: (0, terms_1.number)(Number(tok.v), tok.kind), ...span(start) };
            }
            case "name": {
                if (tok.v === "true" || tok.v === "false") {
                    next();
                    return { type: "Literal", term: (0, terms_1.bool)(tok.v === "true"), ...span(start) };
                }
                if (tok.v === "a") {
                    next();
                    return { type: "Step", iri: terms_1.RDF_TYPE, inverse: false, ...span(start) };
                }
                if (isPunct("(", tokens[k + 1]) && !KEYWORDS.has(tok.v)) {
                    next();
                    next();
                    const args = [];
                    if (!isPunct(")")) {
                        args.push(parseExprSingle());
                        while (isPunct(",")) {
                            next();
                            args.push(parseExprSingle());
                        }
                    }
                    expectPunct(")");
                    return { type: "Call", name: tok.v, args, ...span(start) };
                }
                if (KEYWORDS.has(tok.v))
                    return fail(`unexpected keyword`);
                return fail(`"${tok.v}" is not a function call, a keyword or a prefixed name`);
            }
            case "eof": return fail("expected an expression");
        }
    }
    const ast = parseExpr();
    if (peek().t !== "eof")
        fail("unexpected");
    return ast;
}
/** the source text of a node, for messages */
function textOf(code, n) {
    return code.substring(n.start, n.end).replace(/\s+/g, " ").trim();
}
//# sourceMappingURL=parser.js.map

/***/ },

/***/ 746
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

const parser_1 = __webpack_require__(490);
const evaluator_1 = __webpack_require__(532);
const functions_1 = __webpack_require__(224);
const terms_1 = __webpack_require__(662);
const AssertExt = "http://shex.io/extensions/PathAssert/";
function preBound(ctx) {
    if (ctx === null || ctx === undefined)
        return {}; // a start action
    if (ctx.node !== undefined && typeof ctx.node === "object" && "termType" in ctx.node)
        return { this: ctx.node, item: ctx.node }; // a shape or a node constraint
    const triples = Array.isArray(ctx.triples) ? ctx.triples : [];
    if (ctx.tripleExpr && ctx.tripleExpr.type === "TripleConstraint" && triples.length === 1) {
        const [t] = triples;
        return ctx.tripleExpr.inverse
            ? { this: t.object, value: t.subject, item: t.subject }
            : { this: t.subject, value: t.object, item: t.object };
    }
    // a group: the node all of its triples are about
    const shared = (terms) => terms.length > 0 && terms.every(t => (0, terms_1.termKey)(t) === (0, terms_1.termKey)(terms[0])) ? terms[0] : undefined;
    const focus = shared(triples.map(t => t.subject)) || shared(triples.map(t => t.object));
    return focus === undefined ? {} : { this: focus, item: focus };
}
function register(validator, api) {
    if (api === undefined || !('ShExTerm' in api))
        throw Error('SemAct extensions must be called with register(validator, {ShExTerm, ...)');
    const schema = validator.schema || {};
    const meta = { base: schema._base || undefined, prefixes: schema._prefixes || {} };
    const serialize = (t) => (0, terms_1.termToTurtle)(t, meta);
    const parsed = new Map();
    /** what each question was answered, for the dispatch that comes back for it */
    const verdicts = new Map();
    /** questions asked of an asynchronous source and not yet answered */
    const pending = new Map();
    validator.semActHandler.register(AssertExt, {
        dispatch(code, ctx, _extensionStorage) {
            if (code === null)
                throw Error(`Invocation error: ${AssertExt} needs an expression`);
            let ast = parsed.get(code);
            if (ast === undefined) {
                try {
                    ast = (0, parser_1.parse)(code, { prefixes: meta.prefixes, base: meta.base });
                }
                catch (e) {
                    if (e instanceof parser_1.AssertSyntaxError)
                        throw Error(`Invocation error: ${AssertExt} code didn't parse: ${e.message}`);
                    throw e;
                }
                parsed.set(code, ast);
            }
            const bound = preBound(ctx);
            const key = [code, bound.this, bound.value, bound.item].map(x => typeof x === "string" ? x : x ? (0, terms_1.termKey)(x) : "").join("\u0000");
            const answer = verdicts.get(key);
            if (answer !== undefined)
                return answer;
            const waiting = pending.get(key);
            if (waiting !== undefined)
                return waiting;
            const db = validator.db;
            if (!db || typeof db.getNeighborhood !== "function")
                throw Error(`Invocation error: ${AssertExt} needs the validator's data source (validator.db)`);
            const ectx = { db, shapeLabel: AssertExt, code, memo: new Map() };
            const vars = new Map();
            if (bound.this)
                vars.set("this", evaluator_1.TermSet.of(bound.this));
            if (bound.value)
                vars.set("value", evaluator_1.TermSet.of(bound.value));
            const env = { item: bound.item, vars };
            const result = run(ast, env, ectx, serialize);
            if ((0, evaluator_1.isThenable)(result)) {
                const settled = result.then(v => { verdicts.set(key, v); pending.delete(key); }, e => { pending.delete(key); throw e; });
                pending.set(key, settled);
                return settled;
            }
            verdicts.set(key, result);
            return result;
        }
    });
}
/** the verdict: [] to pass, a failure that explains itself otherwise */
function run(ast, env, ctx, serialize) {
    const assertion = (0, parser_1.textOf)(ctx.code, ast);
    const failure = (errors, explanation) => [Object.assign({ type: "SemActFailure", errors, assertion }, explanation ? { explanation } : {})];
    const onError = (e) => {
        if (e instanceof functions_1.AssertFailed)
            return failure([e.message]);
        if (e instanceof evaluator_1.EvalError)
            throw Error(`Invocation error: ${AssertExt}: ${e.message}`);
        throw e;
    };
    try {
        const verdict = (0, evaluator_1.then)((0, evaluator_1.evaluate)(ast, env, ctx), set => {
            if (set.ebv)
                return [];
            return (0, evaluator_1.then)((0, evaluator_1.explain)(ast, env, ctx, serialize), lines => failure(["assertion failed: " + assertion], lines));
        });
        return (0, evaluator_1.isThenable)(verdict) ? verdict.then(v => v, onError) : verdict;
    }
    catch (e) {
        return onError(e);
    }
}
function done(_validator) {
}
module.exports = {
    name: "PathAssert",
    description: `Assertions: XPath-style path expressions over the focus node, passing when true and explaining themselves when not
url: ${AssertExt}`,
    register,
    done,
    url: AssertExt,
    /** the language's parser, for tools that want the AST */
    parse: parser_1.parse,
};
//# sourceMappingURL=shex-extension-path-assert.js.map

/***/ },

/***/ 662
(__unused_webpack_module, exports) {

"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
exports.fy = exports.XSD_DATETIME = exports.xM = exports.NK = exports.u2 = exports.kx = exports.tY = exports.NP = exports.XSD_STRING = exports.RDF_LANGSTRING = exports.RDF_TYPE = exports.Xc = exports.YH = void 0;
__webpack_unused_export__ = numericKind;
exports.widerKind = widerKind;
exports.namedNode = namedNode;
exports.literal = literal;
exports.langLiteral = langLiteral;
exports.bool = bool;
exports.number = number;
exports.termKey = termKey;
__webpack_unused_export__ = sameTerm;
exports.valueOf = valueOf;
exports.equalTerms = equalTerms;
exports.compareTerms = compareTerms;
exports.ebvOf = ebvOf;
__webpack_unused_export__ = iriToTurtle;
exports.termToTurtle = termToTurtle;
exports.YH = "http://www.w3.org/2001/XMLSchema#";
exports.Xc = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
exports.RDF_TYPE = exports.Xc + "type";
exports.RDF_LANGSTRING = exports.Xc + "langString";
exports.XSD_STRING = exports.YH + "string";
exports.NP = exports.YH + "boolean";
exports.tY = exports.YH + "integer";
exports.kx = exports.YH + "decimal";
exports.u2 = exports.YH + "double";
exports.NK = exports.YH + "float";
exports.xM = exports.YH + "date";
exports.XSD_DATETIME = exports.YH + "dateTime";
exports.fy = exports.YH + "dateTimeStamp";
/** xsd:integer and the types derived from it (XSD Part 2 §3.4) */
const IntegerTypes = new Set(["integer", "long", "int", "short", "byte",
    "nonNegativeInteger", "positiveInteger", "unsignedLong", "unsignedInt", "unsignedShort", "unsignedByte",
    "nonPositiveInteger", "negativeInteger"].map(n => exports.YH + n));
function numericKind(datatype) {
    if (IntegerTypes.has(datatype))
        return "integer";
    if (datatype === exports.kx)
        return "decimal";
    if (datatype === exports.u2 || datatype === exports.NK)
        return "double";
    return null;
}
/** the result kind of arithmetic on two kinds: the wider one (SPARQL §17.3) */
function widerKind(a, b) {
    return a === "double" || b === "double" ? "double"
        : a === "decimal" || b === "decimal" ? "decimal"
            : "integer";
}
// ── construction ────────────────────────────────────────────────────────────
function namedNode(value) {
    return { termType: "NamedNode", value, equals: (o) => !!o && o.termType === "NamedNode" && o.value === value };
}
function literal(value, datatype = exports.XSD_STRING) {
    const t = { termType: "Literal", value, language: "", datatype: namedNode(datatype),
        equals: (o) => termKey(o) === termKey(t) };
    return t;
}
function langLiteral(value, language) {
    const t = { termType: "Literal", value, language, datatype: namedNode(exports.RDF_LANGSTRING),
        equals: (o) => termKey(o) === termKey(t) };
    return t;
}
function bool(b) {
    return literal(b ? "true" : "false", exports.NP);
}
function number(n, kind) {
    const dt = kind === "integer" ? exports.tY : kind === "decimal" ? exports.kx : exports.u2;
    let lexical;
    if (kind === "integer")
        lexical = String(Math.trunc(n));
    else if (Number.isInteger(n) && Math.abs(n) < 1e21)
        lexical = kind === "decimal" ? String(n) + ".0" : String(n) + ".0E0";
    else
        lexical = String(n);
    return literal(lexical, dt);
}
// ── identity ────────────────────────────────────────────────────────────────
/** one string per distinct term: what a set is keyed by (sameTerm) */
function termKey(t) {
    switch (t.termType) {
        case "NamedNode": return "<" + t.value + ">";
        case "BlankNode": return "_:" + t.value;
        case "Literal": return JSON.stringify(t.value) + "@" + (t.language || "") + "^^" + (t.datatype ? t.datatype.value : exports.XSD_STRING);
        case "DefaultGraph": return "DEFAULT";
        case "Variable": return "?" + t.value;
        default: return t.termType + ":" + String(t.value);
    }
}
function sameTerm(a, b) {
    return termKey(a) === termKey(b);
}
/** a literal's value under its datatype; "other" where the datatype is
 * unknown here or the lexical form doesn't parse */
function valueOf(t) {
    const dt = t.datatype ? t.datatype.value : exports.XSD_STRING;
    if (dt === exports.XSD_STRING || dt === exports.RDF_LANGSTRING || (t.language && t.language !== ""))
        return { kind: "string", s: t.value, lang: (t.language || "").toLowerCase() };
    const numeric = numericKind(dt);
    if (numeric !== null) {
        const n = Number(t.value.trim());
        if (!Number.isNaN(n) && t.value.trim() !== "" || /^[+-]?(INF|NaN)$/.test(t.value.trim()))
            return { kind: "number", n: /^[+-]?INF$/.test(t.value.trim()) ? (t.value.trim().startsWith("-") ? -Infinity : Infinity) : n, numeric };
        return { kind: "other", datatype: dt, lexical: t.value };
    }
    if (dt === exports.NP) {
        const v = t.value.trim();
        if (v === "true" || v === "1")
            return { kind: "boolean", b: true };
        if (v === "false" || v === "0")
            return { kind: "boolean", b: false };
        return { kind: "other", datatype: dt, lexical: t.value };
    }
    if (dt === exports.xM || dt === exports.XSD_DATETIME || dt === exports.fy) {
        const ms = Date.parse(t.value.trim());
        return Number.isNaN(ms) ? { kind: "other", datatype: dt, lexical: t.value } : { kind: "date", ms };
    }
    return { kind: "other", datatype: dt, lexical: t.value };
}
/** RDFterm-equal, near enough: numbers by value, strings by value and
 * language, dates by instant, anything else by term */
function equalTerms(a, b) {
    if (a.termType !== b.termType)
        return false;
    if (a.termType !== "Literal")
        return a.value === b.value;
    const va = valueOf(a), vb = valueOf(b);
    if (va.kind !== vb.kind)
        return false;
    switch (va.kind) {
        case "number": return va.n === vb.n;
        case "boolean": return va.b === vb.b;
        case "string": return va.s === vb.s && va.lang === vb.lang;
        case "date": return va.ms === vb.ms;
        default: return sameTerm(a, b);
    }
}
/** ordering for < <= > >=: numbers, booleans, plain strings and dates;
 * undefined where the pair has no order (SPARQL: a type error) */
function compareTerms(a, b) {
    if (a.termType !== "Literal" || b.termType !== "Literal")
        return undefined;
    const va = valueOf(a), vb = valueOf(b);
    if (va.kind !== vb.kind)
        return undefined;
    switch (va.kind) {
        case "number": {
            const n = vb.n;
            return va.n < n ? -1 : va.n > n ? 1 : va.n === n ? 0 : undefined; // NaN: no order
        }
        case "boolean": return (va.b ? 1 : 0) - (vb.b ? 1 : 0);
        case "string": {
            const w = vb;
            if (va.lang !== w.lang)
                return undefined;
            return va.s < w.s ? -1 : va.s > w.s ? 1 : 0;
        }
        case "date": return va.ms - vb.ms;
        default: return undefined;
    }
}
/** SPARQL's effective boolean value of one term; IRIs and blank nodes
 * count as true (they are "something") */
function ebvOf(t) {
    if (t.termType !== "Literal")
        return true;
    const v = valueOf(t);
    switch (v.kind) {
        case "boolean": return v.b;
        case "number": return !Number.isNaN(v.n) && v.n !== 0;
        case "string": return v.s.length > 0;
        case "date": return true;
        default: return v.lexical.length > 0;
    }
}
/** an IRI as a prefixed name where the schema's prefixes allow, else <…> */
function iriToTurtle(iri, meta) {
    const prefixes = meta && meta.prefixes ? meta.prefixes : {};
    let best = null;
    for (const prefix of Object.keys(prefixes)) {
        const ns = prefixes[prefix];
        if (iri.startsWith(ns) && (best === null || ns.length > best.ns.length)) {
            const local = iri.substring(ns.length);
            if (/^[^/#?\s<>"{}|^`\\]*$/.test(local) && !local.startsWith("."))
                best = { prefix, ns };
        }
    }
    return best === null ? "<" + iri + ">" : best.prefix + ":" + iri.substring(best.ns.length);
}
function termToTurtle(t, meta) {
    switch (t.termType) {
        case "NamedNode": return iriToTurtle(t.value, meta);
        case "BlankNode": return "_:" + t.value;
        case "Literal": {
            const quoted = JSON.stringify(t.value);
            const dt = t.datatype ? t.datatype.value : exports.XSD_STRING;
            if (t.language)
                return quoted + "@" + t.language;
            if (dt === exports.XSD_STRING)
                return quoted;
            if (numericKind(dt) === "integer" && dt === exports.tY && /^[+-]?\d+$/.test(t.value))
                return t.value;
            if (dt === exports.kx && /^[+-]?\d*\.\d+$/.test(t.value))
                return t.value;
            if (dt === exports.NP && (t.value === "true" || t.value === "false"))
                return t.value;
            return quoted + "^^" + iriToTurtle(dt, meta);
        }
        default: return termKey(t);
    }
}
//# sourceMappingURL=terms.js.map

/***/ },

/***/ 90
(module, __unused_webpack_exports, __webpack_require__) {

/* Assert webapp bundle entry: extends the ShExWebApp global created by
 * ../shex-webapp/doc/webpacks/shex-webapp.js with the Assert extension.
 *
 * In HTML (and worker importScripts), load n3js.js and shex-webapp.js
 * before this bundle: webpack `externals` (see webpack.config.js) resolve
 * ShExWebApp at runtime rather than bundling a second copy.
 *
 * Under node, require() resolves normally, so this exports the same
 * superset object.
 */
ShExWebApp = Object.assign(__webpack_require__(568), {
  PathAssert: __webpack_require__(746),
})

if (true)
  module.exports = ShExWebApp;


/***/ },

/***/ 568
(module) {

"use strict";
module.exports = ShExWebApp;

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	let __webpack_exports__ = __webpack_require__(90);
/******/ 	
/******/ })()
;