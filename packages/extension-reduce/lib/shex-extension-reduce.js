"use strict";
/**
 * ShEx as a parser generator.
 *
 * A ShEx schema recognizes a subgraph the way a grammar recognizes a string,
 * and a validation result is the parse tree it recognized it by.  This
 * extension is the other half a parser generator has: an action per
 * production, run bottom-up over that tree, each one reducing what its
 * children produced into one value.  What comes out is an AST.
 *
 *     <#Num>   { a [:Num] ; :value xsd:integer }   ->  {op: 'num', value: num(one(':value'))}
 *     <#BinOp> { a [:Add :Mul] ;
 *                :left @<#Expr> ; :right @<#Expr> } ->  {op: local(one('a')),
 *                                                        l: one(':left'), r: one(':right')}
 *
 * Actions run *after* the match, not during it, which is the whole reason
 * this is separate from the validator: the matcher backtracks, and an action
 * that fired on a partition that was later abandoned would have built part of
 * an AST for a parse that never happened.  Dispatch here only records that an
 * action applies at a place in the result; `reduce()` then folds the result
 * that survived.  So an action can't reject a match -- that is the schema's
 * job -- and it is free to be as effectful as it likes.
 *
 * An action names what its sub-productions reduced to the way yacc does:
 * `$sx:nodeKind` is what the arc on that predicate reduced to, `$1` is the
 * first value the body matched, and `$` is the value of this production.
 *
 * This module has no action language: `reduce()` takes an `evaluate(code,
 * scope)` and hands it plain data.  Running code that arrived with a document
 * is a decision the caller makes by passing an evaluator at all.
 */
const ReduceExt = 'http://shex.io/extensions/Reduce/';
// ## the SemAct extension half: record, don't run
function register(validator, api) {
    if (validator === undefined || validator.semActHandler === undefined)
        throw Error('register(validator, ...) wants a ShExValidator');
    validator.semActHandler.results[ReduceExt] = [];
    return validator.semActHandler.register(ReduceExt, {
        /**
         * Note that this action applies here, and say nothing about the match.
         * `reduce()` reads these back out of whichever result survived.
         */
        dispatch: function (code, _ctx, extensionStorage) {
            extensionStorage.code = code;
            return [];
        },
        api,
    });
}
function done(validator) {
    if (validator.semActHandler.results[ReduceExt].length === 0)
        delete validator.semActHandler.results[ReduceExt];
}
// ## the fold
/** where an action was, when it goes wrong */
class ReduceError extends Error {
    constructor(where, code, cause) {
        super(`reducing ${where}:\n  ${code}\n${indent(String(cause && cause.message || cause))}`);
        this.name = 'ReduceError';
    }
}
/**
 * The value the actions reduce a validation result to.
 *
 * `result` is what `validateShapeMap`/`validateNodeShapePair` returned.  A
 * result with more than one node/shape pair reduces to an array, one value
 * per pair, in the order they were asked for.
 */
function reduce(result, options = {}) {
    const url = options.url || ReduceExt;
    const evaluate = options.evaluate;
    if (typeof evaluate !== 'function')
        throw Error('reduce() needs an `evaluate` option -- (code, scope) => value. '
            + 'For actions written in JavaScript that is @shexjs/extension-reduce-js.');
    const prefixes = options.prefixes || {};
    const api = options.api || {};
    const seen = new Map();
    const bounds = new Map();
    return reduceResult(result);
    function reduceResult(res) {
        // a results ShapeMap: [{node, shape, status, appinfo}, ...]
        if (Array.isArray(res))
            return res.map(entry => 'appinfo' in entry ? reduceResult(entry.appinfo) : reduceNode(entry));
        return reduceNode(res);
    }
    function reduceNode(node) {
        if (node === null || node === undefined)
            return node;
        switch (node.type) {
            case 'SolutionList':
                return node.solutions.map(reduceNode);
            /* An AND is several constraints on one node, so it reduces to one value:
             * whichever conjunct said something.  A conjunct with no action reduces
             * to its own node, and saying "this node is this node" is not an answer
             * anyone wrote an action for, so those drop out.  `IRI /pattern/` and
             * `BNODE CLOSED {...}` are the everyday shapes of this. */
            case 'ShapeAndResults': {
                const values = node.solutions.map(reduceNode);
                const spoke = values.filter((v, i) => v !== nodeOf(node.solutions[i]));
                return spoke.length === 1 ? spoke[0]
                    : spoke.length === 0 ? nodeOf(node.solutions[0])
                        : values;
            }
            case 'ShapeOrResults':
            case 'ShapeNotResults':
                return reduceNode(node.solution);
            case 'ShapeTest': {
                const key = keyOf(node.node, node.shape);
                const { arcs, values } = arcsOf(node.solution);
                const value = run(node, { kind: 'shape', node: node.node, shape: node.shape, arcs }, values, () => node.node);
                seen.set(key, value);
                return value;
            }
            case 'NodeConstraintTest':
                return run(node, { kind: 'shape', node: node.node, shape: node.shape, arcs: {} }, [], () => node.node);
            case 'Recursion': {
                // The matcher found this pair on the way down, so its value is still
                // being computed; if it happens to be finished, use it.
                const key = keyOf(node.node, node.shape);
                if (seen.has(key))
                    return seen.get(key);
                switch (options.onRecursion || 'node') {
                    case 'marker': return { type: 'Recursion', node: node.node, shape: node.shape };
                    case 'throw': throw Error(`${key} is still being reduced: the data has a cycle`);
                    default: return node.node;
                }
            }
            default:
                // an unlabelled shape (`{ :p . }` with no ShapeDecl) reports no wrapper
                if ('solution' in node)
                    return reduceNode(node.solution);
                if ('solutions' in node)
                    return node.solutions.map(reduceNode);
                return node;
        }
    }
    /**
     * What a shape's body matched, twice over: by predicate, which is how an
     * action names a sub-production, and in match order, which is how `$1`
     * reaches one whose name it shares with another.
     */
    function arcsOf(solution) {
        const arcs = {};
        const values = [];
        collect(solution);
        return { arcs, values };
        function collect(s) {
            if (s === null || s === undefined)
                return;
            if (Array.isArray(s))
                return s.forEach(collect);
            switch (s.type) {
                case 'EachOfSolutions':
                case 'OneOfSolutions':
                    return s.solutions.forEach(collect);
                case 'EachOfSolution':
                case 'OneOfSolution':
                    return s.expressions.forEach(collect);
                case 'TripleConstraintSolutions': {
                    // an action on a triple constraint is recorded per matched triple,
                    // so a repeated arc gets one run of the action per occurrence
                    (s.solutions || []).forEach((tested) => {
                        const bare = tested.referenced === undefined
                            ? tested.object
                            : reduceNode(tested.referenced);
                        const code = actionOn(tested);
                        // the object is this production's one sub-production, so it is $1
                        const value = code === undefined ? bare
                            : runCode(code, s, { kind: 'tripleConstraint', subject: tested.subject,
                                predicate: tested.predicate, object: tested.object,
                                value: bare, arcs: {} }, [bare]);
                        (arcs[s.predicate] = arcs[s.predicate] || []).push(value);
                        values.push(value);
                    });
                    return;
                }
                default:
                    if ('solutions' in s)
                        return collect(s.solutions);
                    if ('solution' in s)
                        return collect(s.solution);
            }
        }
    }
    /**
     * Only what dispatch recorded counts.  A result node also carries the
     * schema's `semActs`, but not always its own -- a shape's actions turn up
     * on the solution beneath it too -- and `extensions` is written by the
     * dispatch for exactly one artifact, so it is the one that can be trusted.
     */
    function actionOn(node) {
        const ext = node && node.extensions && node.extensions[url];
        return ext && typeof ext.code === 'string' ? ext.code : undefined;
    }
    function run(node, scope, values, fallback) {
        const code = actionOn(node);
        return code === undefined ? fallback() : runCode(code, node, scope, values);
    }
    function runCode(code, node, scope, values) {
        const where = describe(node);
        try {
            const bound = bindRefs(code, prefixes, bounds);
            const bindings = {};
            bound.refs.forEach(({ id, ref }) => {
                bindings[id] = ref.kind === 'ret' ? undefined
                    : ref.kind === 'pos' ? values[ref.at - 1]
                        : (scope.arcs || {})[ref.iri];
            });
            return evaluate(bound.code, Object.assign({ where, prefixes, api }, scope, bound.ret === undefined ? { bindings } : { bindings, ret: bound.ret }));
        }
        catch (e) {
            throw new ReduceError(where, code, e);
        }
    }
}
/**
 * `$$` or `$`, `$1`, `$<iri>`, `$prefix:local`, `$:local` -- and `$name`,
 * which is deliberately none of them: `$` starts an identifier in several
 * action languages, and a name with no prefix is not a predicate.
 *
 * The last alternative is the bare `$`, which is not read as a reference
 * before `{`, `/` or a quote -- much more likely a template literal, the end
 * of a regular expression, or a dollar sign in a string than a reference.
 */
const REF = /\$(\$|\d+|<[^\s<>"{}|^`\\]*>|[A-Za-z_][\w-]*:[\w-]*|:[\w-]*|[A-Za-z_][\w-]*)|\$(?![{/'"`])/g;
/**
 * The action as the evaluator should see it: every reference rewritten to a
 * name, and a list of what those names stand for.
 *
 * yacc splices `$1` into the C it emits, because it knows what C is.  This
 * doesn't know what the actions are written in, so it can only substitute
 * text -- which is why the names it substitutes are plain ASCII identifiers
 * (legal in any action language anyone is likely to bring) and why a `$1`
 * inside a string literal is a reference too.
 */
function bindRefs(code, prefixes, cache) {
    const already = cache.get(code);
    if (already !== undefined)
        return already;
    const refs = [];
    const seen = new Map();
    let ret;
    const rewritten = code.replace(REF, (whole, text) => {
        if (text !== undefined && /^[A-Za-z_]/.test(text) && text.indexOf(':') === -1)
            return whole; // `$name`: an identifier, not a reference
        const key = text === undefined || text === '$' ? '' : text;
        const before = seen.get(key);
        if (before !== undefined)
            return before;
        const ref = parseRef(key, prefixes);
        const id = idFor(ref, code, refs);
        seen.set(key, id);
        refs.push({ id, ref });
        if (ref.kind === 'ret')
            ret = id;
        return id;
    });
    const bound = { code: rewritten, refs, ret };
    cache.set(code, bound);
    return bound;
}
function parseRef(text, prefixes) {
    if (text === '')
        return { kind: 'ret' };
    if (/^\d+$/.test(text)) {
        const at = Number(text);
        if (at === 0)
            throw Error("$0: a production's values are numbered from $1, as in yacc");
        return { kind: 'pos', at };
    }
    return { kind: 'arc', iri: text[0] === '<' ? text.slice(1, -1) : expandName(text, prefixes) };
}
function expandName(name, prefixes) {
    const prefix = name.substr(0, name.indexOf(':'));
    if (!(prefix in prefixes))
        throw Error(`$${name}: no prefix "${prefix}:" (reduce() was given `
            + (Object.keys(prefixes).length
                ? Object.keys(prefixes).map(p => p + ':').join(', ') : 'none') + ')');
    return prefixes[prefix] + name.substr(name.indexOf(':') + 1);
}
/**
 * A name for a reference that reads like what it stands for -- `_nodeKind`,
 * `_1`, `_ret` -- and that the action isn't already using for something of
 * its own.
 */
function idFor(ref, code, refs) {
    const base = '_' + (ref.kind === 'ret' ? 'ret'
        : ref.kind === 'pos' ? ref.at
            : localOf(ref.iri).replace(/[^A-Za-z0-9_]/g, '_') || 'arc');
    let id = base;
    for (let n = 1; refs.some(r => r.id === id) || mentions(code, id); ++n)
        id = base + '_' + (n + 1);
    return id;
}
/** the part of an IRI after the last delimiter, which is what it is called */
function localOf(iri) {
    return iri.replace(/^.*[/#:]/, '');
}
function mentions(code, id) {
    return new RegExp('\\b' + id + '\\b').test(code);
}
// ## reporting
function describe(node) {
    if (node === null || node === undefined)
        return String(node);
    switch (node.type) {
        case 'ShapeTest':
        case 'NodeConstraintTest':
            return `<${node.shape}> at ${short(node.node)}`;
        case 'TripleConstraintSolutions':
            return `the constraint on <${node.predicate}>`;
        default:
            return node.type || 'the result';
    }
}
function short(term) {
    return typeof term === 'string' ? `<${term}>` : JSON.stringify(term);
}
function indent(s) {
    return s.split('\n').map(l => '    ' + l).join('\n');
}
/** the focus term a result node is about, however deep it is wrapped */
function nodeOf(res) {
    if (res === null || res === undefined)
        return undefined;
    if ('node' in res)
        return res.node;
    if ('solution' in res)
        return nodeOf(res.solution);
    if ('solutions' in res && res.solutions.length)
        return nodeOf(res.solutions[0]);
    return undefined;
}
function keyOf(node, shape) {
    return short(node) + '@' + shape;
}
module.exports = {
    name: 'Reduce',
    description: `ShEx as a parser generator: the schema recognizes, the actions reduce.

The schema is the grammar and a validation result is the parse tree it
recognized by; this folds one action per production over that tree, bottom
up, and what comes out is an AST.  Actions run after the match, not during
it, so a partition the matcher abandoned leaves nothing behind and an action
cannot reject a match -- that is the schema's job.

This module has no action language.  reduce() takes an \`evaluate(code, scope)\`
and hands it plain data:
  kind                 'shape' or 'tripleConstraint'
  node, shape, arcs    the focus term, the label it matched, and what each
                       arc reduced to, by full predicate IRI
  subject, predicate,  for a constraint: the triple, and what its object
  object, value        reduced to
  bindings, ret        what each $... in the code was rewritten to, and the
                       name the action assigns its value to, if it used $
  prefixes, api, where the caller's prefixes and extras, and where this is
No functions cross that line, so the same fold ports to an implementation in
another language.  @shexjs/extension-reduce-js is the JavaScript evaluator.

url: ${ReduceExt}`,
    register,
    done,
    url: ReduceExt,
    reduce,
};
//# sourceMappingURL=shex-extension-reduce.js.map