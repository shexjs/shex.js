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
 * first value the body matched, and `$$` is the value of this production.
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
/**
 * ...or run them as the matcher matches, and let them reject.
 *
 * The other `register` records and `reduce()` folds afterwards, because the
 * matcher backtracks: an action that fired on a partition later abandoned
 * would have built part of an AST for a parse that never happened.  That is
 * the LR bargain -- defer the reduction until the parse is decided -- and
 * the price of it is that an action cannot say "not this way".
 *
 * PEG pays the other way: actions run inside the attempt, an attempt may be
 * abandoned, and an action may fail the attempt it is in.  This is that.
 * The action runs at dispatch, its value is stored on the result so the
 * fold takes it rather than running the code again, and a value the
 * `rejects` test recognizes fails the match -- which sends an OR to its next
 * branch, exactly as a node constraint that didn't hold would.
 *
 * So the author owns two things they did not before: an action may run on a
 * branch that is then thrown away (write it without side effects, or expect
 * them twice), and an action's value is now part of what "matched" means.
 */
function registerEager(validator, options = {}) {
    if (validator === undefined || validator.semActHandler === undefined)
        throw Error('registerEager(validator, ...) wants a ShExValidator');
    if (typeof options.evaluate !== 'function')
        throw Error('registerEager() needs an `evaluate` option -- (code, scope) => value. '
            + 'For actions written in JavaScript that is @shexjs/extension-reduce-js.');
    // the validator's schema, unless the caller brought one: it is what says
    // whether `$:left` is a value or a list of them (arityOf)
    const f = foldFor(Object.assign({ schema: validator.schema }, options), 'matching');
    const rejects = options.rejects || refused;
    validator.semActHandler.results[f.url] = [];
    return validator.semActHandler.register(f.url, {
        dispatch: function (code, ctx, storage, artifact) {
            // a group's action is not run in either mode: a shape's action already
            // sees everything its body matched, by predicate
            if (ctx && ctx.tripleExpr
                && (ctx.tripleExpr.type === 'EachOf' || ctx.tripleExpr.type === 'OneOf'))
                return [];
            const where = describe(artifact);
            const { scope, values } = eagerScope(f, ctx, artifact);
            const value = runAction(f, code, where, scope, values);
            storage.code = code;
            storage.value = value; // what the fold will take
            if (!rejects(value))
                return [];
            // ...and a refusal that says `cut` is the value spelling of cut():
            // an action language without exceptions can still say it
            if (value !== null && typeof value === 'object' && value.cut)
                throw new SemActCut(value, where);
            return [{ type: 'SemActFailure', errors: [rejection(value, where)] }];
        },
        api: options.api,
    });
}
/** the value an action returns to say "this match is no good" */
function refused(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        && 'failure' in value;
}
function rejection(value, where) {
    const said = value && value.failure;
    return `the action on ${where} rejected the match`
        + (said === undefined || said === '' ? '' : ': ' + String(said));
}
/**
 * What an eager action sees.  The same scope the fold builds, from the same
 * places -- the result artifact is the fold's own input, and the values
 * underneath it are stored there by the actions that already ran.
 */
function eagerScope(f, ctx, artifact) {
    if (ctx === null || ctx === undefined) // a start action: before any of it
        return { scope: { kind: 'start', arcs: {} }, values: [] };
    if (artifact && artifact.type === 'TestedTriple') {
        const bare = artifact.referenced === undefined
            ? artifact.object
            : reduceNode(f, artifact.referenced);
        return {
            scope: { kind: 'tripleConstraint', subject: artifact.subject,
                predicate: artifact.predicate, object: artifact.object,
                value: bare, arcs: {} },
            values: [bare],
        };
    }
    const { arcs, values } = arcsOf(f, artifact && artifact.solution !== undefined
        ? artifact.solution : ctx);
    return {
        scope: { kind: 'shape', node: artifact ? artifact.node : undefined,
            shape: artifact ? artifact.shape : undefined, arcs },
        values,
    };
}
function done(validator) {
    if (validator.semActHandler.results[ReduceExt].length === 0)
        delete validator.semActHandler.results[ReduceExt];
}
// ## the fold
/**
 * "Not this one, and not any of the others either": a cut.
 *
 * A rejection fails the shape the action was on and the match goes on to
 * whatever else that node could be.  Sometimes the action knows there is no
 * point -- the number is not the sum however you read the expression -- and
 * every alternative left is work whose only result is to bury the reason
 * this one failed under the last one's.  Thrown, this fails the node/shape
 * pair where the action stood: the validator reads `type` and `cut` (see
 * SemActFailure) and reports it as that pair's failure.
 */
class SemActCut extends Error {
    constructor(why, where) {
        const gave = refused(why) ? why.failure : why;
        const text = 'the action' + (where === undefined ? '' : ' on ' + where)
            + ' cut the match'
            + (gave === undefined || gave === '' ? '' : ': ' + String(gave));
        super(text);
        this.type = 'SemActFailure';
        this.cut = true;
        this.name = 'SemActCut';
        this.errors = [text];
    }
}
/** where an action was, when it goes wrong */
class ReduceError extends Error {
    constructor(verb, where, code, cause) {
        super(`${verb} ${where}:\n  ${code}\n${indent(String(cause && cause.message || cause))}`);
        this.name = 'ReduceError';
    }
}
function foldFor(options, verb = 'reducing') {
    return {
        runner: typeof options.evaluate === 'function'
            ? { evaluate: options.evaluate, prefixes: options.prefixes || {},
                api: options.api || {}, state: {}, bounds: new Map() }
            : null,
        url: options.url || ReduceExt,
        onRecursion: options.onRecursion || 'node',
        seen: new Map(),
        provenance: Array.isArray(options.provenance) ? options.provenance : null,
        many: arityOf(options.schema),
        verb,
        onError: typeof options.onError === 'function' ? options.onError : null,
    };
}
/**
 * The value the actions reduce a validation result to.
 *
 * `result` is what `validateShapeMap`/`validateNodeShapePair` returned.  A
 * result with more than one node/shape pair reduces to an array, one value
 * per pair, in the order they were asked for.
 */
function reduce(result, options = {}) {
    return reduceResult(foldFor(options), result);
}
/**
 * How many values a reference to an arc stands for.
 *
 * `$:left` is one value where the schema gives a shape at most one `:left`,
 * and the list of them where it may have several -- which is what lets an
 * action say `Object.assign($rdf:type, $:left, $:right)` rather than
 * counting its own arcs.  A constraint inside a repeated group can match
 * more than once however small its own cardinality, so what counts is the
 * whole path's; and two constraints on one predicate are two ways for it to
 * arrive, so that is a list too.  Anything this cannot read -- a tripleExpr
 * by reference, a shape it has never heard of -- is a list, which is what
 * every arc reference was before this.
 */
function arityOf(schema) {
    const decls = (schema && schema.shapes) || [];
    const shapeOf = (expr) => expr === null || typeof expr !== 'object' ? null
        : expr.type === 'ShapeDecl' ? shapeOf(expr.shapeExpr)
            : expr.type === 'Shape' ? expr
                : null;
    const once = new Map();
    (Array.isArray(decls) ? decls : Object.values(decls)).forEach((decl) => {
        const label = decl && (decl.id || decl.label);
        const shape = shapeOf(decl);
        if (typeof label !== 'string' || shape === null)
            return;
        const single = new Set();
        const seen = new Set();
        walk(shape.expression, true);
        once.set(label, single);
        function walk(expr, alone) {
            if (expr === null || typeof expr !== 'object')
                return; // a tripleExpr by reference: unknown
            const solo = alone && (expr.max === undefined || expr.max === 1);
            if (expr.type === 'TripleConstraint') {
                if (seen.has(expr.predicate)) // a second way for it to arrive
                    single.delete(expr.predicate);
                else if (solo)
                    single.add(expr.predicate);
                seen.add(expr.predicate);
                return;
            }
            (expr.expressions || []).forEach((e) => walk(e, solo));
        }
    });
    return (shape, predicate) => {
        const single = shape === undefined ? undefined : once.get(shape);
        return single === undefined || !single.has(predicate);
    };
}
function reduceResult(f, res) {
    // a results ShapeMap: [{node, shape, status, appinfo}, ...]
    if (Array.isArray(res))
        return res.map(entry => 'appinfo' in entry ? reduceResult(f, entry.appinfo) : reduceNode(f, entry));
    runStartActs(f, res);
    return reduceNode(f, res);
}
/**
 * The schema's start actions, before the walk.
 *
 * A start action runs before the match rather than at some place in it, so
 * `register` has nothing to record for one -- the validator hands its
 * dispatch a scratch object and then drops it -- and the fold is where a
 * recorded run gets to run them.  An eager run has already run them, and
 * folds with no evaluator, which is what tells the two apart here.
 */
function runStartActs(f, res) {
    if (f.runner === null) // nothing to run: an eager run
        return;
    ((res && res.startActs) || [])
        .filter((act) => act.name === f.url && typeof act.code === 'string')
        .forEach((act) => runAction(f, act.code, 'the start actions', { kind: 'start', arcs: {} }, []));
}
function reduceNode(f, node) {
    if (node === null || node === undefined)
        return node;
    switch (node.type) {
        case 'SolutionList':
            return node.solutions.map((s) => reduceNode(f, s));
        /* An AND is several constraints on one node, so it reduces to one value:
         * whichever conjunct said something.  A conjunct with no action reduces
         * to its own node, and saying "this node is this node" is not an answer
         * anyone wrote an action for, so those drop out.  `IRI /pattern/` and
         * `BNODE CLOSED {...}` are the everyday shapes of this. */
        case 'ShapeAndResults': {
            const values = node.solutions.map((s) => reduceNode(f, s));
            const spoke = values.filter((v, i) => v !== nodeOf(node.solutions[i]));
            return spoke.length === 1 ? spoke[0]
                : spoke.length === 0 ? nodeOf(node.solutions[0])
                    : values;
        }
        case 'ShapeOrResults':
        case 'ShapeNotResults':
            return reduceNode(f, node.solution);
        case 'ShapeTest': {
            const key = keyOf(node.node, node.shape);
            const { arcs, values } = arcsOf(f, node.solution, node.shape);
            const value = run(f, node, { kind: 'shape', node: node.node, shape: node.shape, arcs }, values, () => node.node);
            f.seen.set(key, value);
            return value;
        }
        case 'NodeConstraintTest':
            return run(f, node, { kind: 'shape', node: node.node, shape: node.shape, arcs: {} }, [], () => node.node);
        case 'Recursion': {
            // The matcher found this pair on the way down, so its value is still
            // being computed; if it happens to be finished, use it.
            const key = keyOf(node.node, node.shape);
            if (f.seen.has(key))
                return f.seen.get(key);
            switch (f.onRecursion) {
                case 'marker': return { type: 'Recursion', node: node.node, shape: node.shape };
                case 'throw': throw Error(`${key} is still being reduced: the data has a cycle`);
                default: return node.node;
            }
        }
        default:
            // an unlabelled shape (`{ :p . }` with no ShapeDecl) reports no wrapper
            if ('solution' in node)
                return reduceNode(f, node.solution);
            if ('solutions' in node)
                return node.solutions.map((s) => reduceNode(f, s));
            return node;
    }
}
/**
 * What a shape's body matched, twice over: by predicate, which is how an
 * action names a sub-production, and in match order, which is how `$1`
 * reaches one whose name it shares with another.
 */
function arcsOf(f, solution, inShape) {
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
                        : reduceNode(f, tested.referenced);
                    // the object is this production's one sub-production, so it is $1
                    // which of this predicate's constraints in this shape: with the
                    // shape, that is which constraint in the schema (provenance)
                    const occurrence = (arcs[s.predicate] || []).length;
                    const value = run(f, tested, { kind: 'tripleConstraint', subject: tested.subject,
                        predicate: tested.predicate, object: tested.object,
                        value: bare, arcs: {} }, [bare], () => bare, { inShape, occurrence });
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
 * Only what dispatch left counts.  A result node also carries the schema's
 * `semActs`, but not always its own -- a shape's actions turn up on the
 * solution beneath it too -- and `extensions` is written by the dispatch for
 * exactly one artifact, so it is the one that can be trusted.
 */
function extOn(f, node) {
    const ext = node && node.extensions && node.extensions[f.url];
    return ext && (typeof ext.code === 'string' || 'value' in ext) ? ext : undefined;
}
function run(f, node, scope, values, fallback, where) {
    const ext = extOn(f, node);
    if (ext === undefined)
        return fallback();
    const value = 'value' in ext
        ? ext.value // an eager action already ran here
        : runAction(f, ext.code, describe(node), scope, values);
    if (f.provenance !== null)
        f.provenance.push(Object.assign({ value, code: ext.code, kind: scope.kind, at: node }, scope.kind === 'shape'
            ? { node: scope.node, shape: scope.shape }
            : { subject: scope.subject, predicate: scope.predicate, object: scope.object }, where || {}));
    return value;
}
function runAction(f, code, where, scope, values) {
    const runner = f.runner;
    if (runner === null)
        throw Error('reduce() needs an `evaluate` option -- (code, scope) => value. '
            + 'For actions written in JavaScript that is @shexjs/extension-reduce-js.');
    try {
        const bound = bindRefs(code, runner.prefixes, runner.bounds);
        const bindings = {};
        bound.refs.forEach(({ id, ref }) => {
            bindings[id] = ref.kind === 'ret' ? undefined
                : ref.kind === 'pos' ? values[ref.at - 1]
                    : ref.kind === 'all' ? values.slice()
                        : arcRef(f, scope, ref.iri);
        });
        return runner.evaluate(bound.code, Object.assign({ where, prefixes: runner.prefixes, api: runner.api, state: runner.state }, scope, bound.ret === undefined ? { bindings } : { bindings, ret: bound.ret }));
    }
    catch (e) {
        const error = e instanceof ReduceError ? e : new ReduceError(f.verb, where, code, e);
        if (f.onError !== null)
            f.onError(error);
        throw error;
    }
}
/**
 * What `$<predicate>` stands for: the list of values the arc reduced to, or
 * the one value where the schema allows only one (arityOf).  An arc that
 * didn't match is undefined either way -- absent rather than empty.
 */
function arcRef(f, scope, iri) {
    const got = (scope.arcs || {})[iri];
    return f.many(scope.shape, iri) || got === undefined ? got : got[0];
}
/**
 * `$$` or `$`, `$1`, `$*`, `$<iri>`, `$prefix:local`, `$:local` -- and
 * `$name`, which is deliberately none of them: `$` starts an identifier in
 * several action languages, and a name with no prefix is not a predicate.
 *
 * The token, if there is one; `sigil` sorts out the `$`s with nothing after
 * them that this recognizes.
 */
const REF = /\$(\$|\*|\d+|<[^\s<>"{}|^`\\]*>|[A-Za-z_][\w-]*:[\w-]*|:[\w-]*|[A-Za-z_][\w-]*)?/g;
/**
 * What a `$` with nothing this recognizes after it is: the production's
 * value, a dollar sign that was never a reference, or a mistake.
 *
 * `${`, `$/` and a `$` before a quote are left alone -- far more likely a
 * template literal, the end of a regular expression or a dollar sign in a
 * string than a reference -- and a `$` that ends a value (`$ = ...`, `f($)`,
 * `$.length`) is the production's value.
 *
 * Everything else is refused rather than passed through, which is the whole
 * point of this function: a `$@` passed through means whatever the action
 * language makes of it now, and means a reference the day someone gives
 * `$@` a meaning here.  Perl learned this about `\q` in regular
 * expressions the slow way.  So the sigils a syntax might one day want --
 * `@ & ! ? # ^ ~ % |` and the rest -- are an error while they are free,
 * and `$$` is the spelling that cannot be reinterpreted.
 */
function sigil(code, at) {
    const next = code[at + 1];
    if (next === undefined || /[\s=;,.)\]}([]/.test(next))
        return 'ret'; // nothing binds to it: the value
    if (/[{/'"`\\]/.test(next))
        return 'text'; // a template, a regexp, a string
    throw Error(`$${next} is not a reference; write $$ for the production's `
        + `value (and a space, if what follows it is an operator)`);
}
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
    const rewritten = code.replace(REF, (whole, text, at) => {
        if (text !== undefined && /^[A-Za-z_]/.test(text) && text.indexOf(':') === -1)
            return whole; // `$name`: an identifier, not a reference
        if (text === undefined && sigil(code, at) === 'text')
            return whole; // a dollar sign that is not a reference
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
    if (text === '*')
        return { kind: 'all' };
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
            : ref.kind === 'all' ? 'all'
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
        case 'TestedTriple':
            return `the constraint on <${node.predicate}> at ${short(node.subject)}`;
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
                       name the action assigns its value to, if it used $$
  prefixes, api, where the caller's prefixes and extras, and where this is
An action refuses a match (registerEager) with a value: {failure: why} to say
this production is not it, {failure: why, cut: true} to say no other reading
of this node will do either.
No functions cross that line, so the same fold ports to an implementation in
another language.  @shexjs/extension-reduce-js is the JavaScript evaluator.

url: ${ReduceExt}`,
    register,
    registerEager,
    done,
    url: ReduceExt,
    reduce,
};
//# sourceMappingURL=shex-extension-reduce.js.map