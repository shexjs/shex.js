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
 * The actions themselves are JavaScript, like `@shexjs/extension-eval`: an
 * expression if it parses as one, a function body otherwise.  Running code
 * that arrived with a document is a decision the caller makes by registering
 * this extension at all.
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
                const arcs = arcsOf(node.solution);
                const value = run(node, { kind: 'shape', node: node.node, shape: node.shape, arcs }, () => node.node);
                seen.set(key, value);
                return value;
            }
            case 'NodeConstraintTest':
                return run(node, { kind: 'shape', node: node.node, shape: node.shape, arcs: {} }, () => node.node);
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
    /** predicate -> [value, ...] for everything a shape's body matched */
    function arcsOf(solution) {
        const arcs = {};
        collect(solution);
        return arcs;
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
                        const value = code === undefined ? bare
                            : runCode(code, s, { kind: 'tripleConstraint', subject: tested.subject,
                                predicate: tested.predicate, object: tested.object,
                                value: bare, arcs: {} });
                        (arcs[s.predicate] = arcs[s.predicate] || []).push(value);
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
    function run(node, scope, fallback) {
        const code = actionOn(node);
        return code === undefined ? fallback() : runCode(code, node, scope);
    }
    function runCode(code, node, scope) {
        const where = describe(node);
        try {
            return evaluate(code, Object.assign({ where, prefixes, api }, scope));
        }
        catch (e) {
            throw new ReduceError(where, code, e);
        }
    }
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