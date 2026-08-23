"use strict";
/**
 * The JavaScript evaluator for `@shexjs/extension-reduce`.
 *
 * `extension-reduce` folds one action per production over a validation
 * result and hands each action a scope of plain data -- which production
 * reduced, and what its arcs reduced to, by predicate.  It has no opinion
 * about what an action is written in.  This is the half that does: it puts
 * that scope in scope as JavaScript names and runs the code.
 *
 *     const Reduce = require('@shexjs/extension-reduce');
 *     const evaluate = require('@shexjs/extension-reduce-js');
 *     Reduce.reduce(result, {evaluate, prefixes: {'': 'http://a.example/calc#'}});
 *
 * An action is an expression if it parses as one and a function body if it
 * doesn't, so `{op: 'num', value: num(one(':value'))}` and
 * `const v = one(':value'); return v > 0 ? v : -v` both work.
 *
 * `extension-reduce` has already rewritten `$1` and `$sx:nodeKind` to names
 * by the time the code arrives; putting `scope.bindings` in scope is all
 * this has to do about them.  `$` is the one that needs saying twice: it is
 * a name the action assigns to, so when `scope.ret` names it, the action's
 * value is what that name ended up holding.
 *
 * Running code that arrived with a document is a decision the caller makes
 * by passing this evaluator at all; another one can run something safer.
 */
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const RDF_type = RDF + 'type';
const XSD = 'http://www.w3.org/2001/XMLSchema#';
/** run one action, with the scope's data in scope as names */
function evaluate(code, scope) {
    const names = namesFor(scope);
    const value = compile(code)(names);
    // `with` writes an assignment through to the object when the name is one
    // of its own, so `$ = ...` lands on the binding extension-reduce made
    return scope.ret === undefined ? value : names[scope.ret];
}
/**
 * What an action can say.  The arcs arrive keyed by full predicate IRI, so
 * the accessors expand a prefixed name before looking one up; `a` is always
 * rdf:type.
 */
function namesFor(scope) {
    const expand = prefixExpander(scope.prefixes || {});
    const arcs = scope.arcs || {};
    const at = (p) => arcs[expand(p)] || [];
    return Object.assign({}, scope.api, {
        // what reduced
        kind: scope.kind,
        node: scope.node,
        shape: scope.shape,
        subject: scope.subject,
        predicate: scope.predicate,
        object: scope.object,
        value: scope.value,
        arcs,
        state: scope.state,
        // reaching the arcs
        all: at,
        has: (p) => at(p).length > 0,
        opt: (p) => {
            const found = at(p);
            if (found.length > 1)
                throw Error(`opt(${JSON.stringify(p)}) found ${found.length} values`);
            return found[0];
        },
        one: (p) => {
            const found = at(p);
            if (found.length !== 1)
                throw Error(`one(${JSON.stringify(p)}) found ${found.length} values`
                    + (Object.keys(arcs).length
                        ? `; ${scope.where} matched ` + Object.keys(arcs).join(', ')
                        : ''));
            return found[0];
        },
        // reading a term
        str, num, iri, local, lang, datatype, isBnode, key,
        expand, RDF, XSD, nil: RDF + 'nil',
    }, scope.bindings);
}
// ## terms, as an action wants to see them
/** the lexical form of a literal, or the IRI of an IRI */
function str(term) {
    return term === null || term === undefined ? term
        : typeof term === 'string' ? term : term.value;
}
/** a literal read as a JavaScript number */
function num(term) {
    return Number(str(term));
}
/** an IRI, refusing a literal */
function iri(term) {
    if (typeof term !== 'string')
        throw Error(`expected an IRI, got the literal ${JSON.stringify(term)}`);
    return term;
}
/** the part of an IRI after the last / or # -- what a type usually reads as */
function local(term) {
    return str(term).replace(/^.*[/#]/, '');
}
/**
 * A string that tells this term from every other one, for an action that
 * keeps something per node.
 *
 * An IRI and a blank node arrive as strings and can be used as keys as they
 * are; a literal arrives as `{value, type?, language?}`, and an object used
 * as a key is the string "[object Object]" -- every literal the same one.
 * So: the term as N-Triples writes it, near enough that no two terms share
 * a key.
 */
function key(term) {
    if (term === null || term === undefined)
        return String(term);
    if (typeof term === 'string')
        return term;
    return '"' + term.value + '"'
        + (term.language ? '@' + term.language : term.type ? '^^' + term.type : '');
}
/** whether a term is a blank node, which ShExJ writes as a _: name */
function isBnode(term) {
    return typeof term === 'string' && term.substr(0, 2) === '_:';
}
function lang(term) {
    return typeof term === 'string' ? undefined : term.language;
}
function datatype(term) {
    return typeof term === 'string' ? undefined : term.type;
}
// ## compiling an action
const compiled = new Map();
/**
 * An action is an expression if it parses as one, and a function body if it
 * doesn't -- so `{op: 'num'}` and `const x = 1; return x` both work, and
 * neither needs a keyword the writer has to remember.  (An object literal at
 * the head of a statement is a block in JavaScript, which is why the
 * expression reading has to be tried first.)
 */
function compile(code) {
    const already = compiled.get(code);
    if (already !== undefined)
        return already;
    let fn;
    try {
        fn = build('return (' + code + '\n)');
    }
    catch (e) {
        if (!(e instanceof SyntaxError))
            throw e;
        fn = build(code);
    }
    compiled.set(code, fn);
    return fn;
}
function build(body) {
    // `with` is the cheapest way to put an open-ended set of names in scope,
    // and this is already arbitrary text being run as code.
    // eslint-disable-next-line no-new-func
    const f = new Function('__names', 'with (__names) { ' + body + '\n}');
    return (names) => f(names);
}
function prefixExpander(prefixes) {
    return function expand(name) {
        if (name === 'a')
            return RDF_type;
        const at = name.indexOf(':');
        if (at === -1)
            return name;
        const prefix = name.substr(0, at);
        if (/^[a-z][a-z0-9+.-]*$/i.test(prefix) && !(prefix in prefixes)
            && (name.substr(at + 1, 2) === '//' || prefix === 'urn' || prefix === 'mailto'))
            return name; // already an IRI
        if (!(prefix in prefixes))
            throw Error(`no prefix "${prefix}:" (the reduce options declare `
                + (Object.keys(prefixes).length
                    ? Object.keys(prefixes).map(p => p + ':').join(', ') : 'none') + ')');
        return prefixes[prefix] + name.substr(at + 1);
    };
}
module.exports = evaluate;
module.exports.evaluate = evaluate;
module.exports.namesFor = namesFor;
module.exports.str = str;
module.exports.num = num;
module.exports.iri = iri;
module.exports.local = local;
module.exports.lang = lang;
module.exports.datatype = datatype;
module.exports.isBnode = isBnode;
module.exports.key = key;
//# sourceMappingURL=shex-extension-reduce-js.js.map