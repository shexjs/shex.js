"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vocab = exports.NS = void 0;
exports.applyOverlay = applyOverlay;
exports.evalShapePath = evalShapePath;
exports.extractOverlay = extractOverlay;
exports.overlayTurtle = overlayTurtle;
/**
 * Semantic actions, kept out of the schema.
 *
 * A ShExC schema with `%<ext>{ code %}` sprinkled through it is a schema
 * only one program can read comfortably: everyone else has to step over
 * somebody else's code to see the shapes.  An *overlay* says the same thing
 * from outside -- an RDF document naming schema elements and the actions to
 * hang on them -- so the schema stays the thing several tools can share.
 *
 *     PREFIX sa: <http://shex.io/ns/semact#>
 *     <#calc> a sa:Overlay ;
 *       sa:extension <http://shex.io/extensions/Reduce/> ;
 *       sa:action
 *         [ sa:ref  <http://a.example/calc#Num> ;
 *           sa:code "{op: 'num', value: one(':value')}" ],
 *         [ sa:path "@<http://a.example/calc#BinOp>" ;
 *           sa:code "{op: type, l: one(':left'), r: one(':right')}" ] .
 *
 * The idea, the vocabulary shape and the two ways of naming an element are
 * lifted from ericprud/shex-form, which does this for `ui:` annotations.
 * `sa:ref` names an element by its ShExJ id; `sa:path` selects one with a
 * ShapePath, which is how you reach the elements nobody labelled.
 */
const visitor_1 = require("@shexjs/visitor");
const ShapePath = require('shape-path-core');
exports.NS = 'http://shex.io/ns/semact#';
exports.Vocab = {
    Overlay: exports.NS + 'Overlay',
    action: exports.NS + 'action',
    ref: exports.NS + 'ref',
    path: exports.NS + 'path',
    code: exports.NS + 'code',
    extension: exports.NS + 'extension',
    order: exports.NS + 'order',
    start: exports.NS + 'start',
};
const RDF_type = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
/** ShExJ productions with a place to put a SemAct (ShExJ.jsg semActs:[SemAct+]?) */
const CAN_HOLD_SEMACTS = [
    'Shape', 'NodeConstraint', 'TripleConstraint', 'EachOf', 'OneOf',
];
/**
 * A copy of `schema` with the overlay's actions attached.
 *
 * The schema is copied, not written on: an overlay is a reading of a schema,
 * and the next reading should get the same schema to work from.
 */
function applyOverlay(schema, overlay, options = {}) {
    const copy = JSON.parse(JSON.stringify(schema));
    delete copy._index; // stale: it points into the original
    const index = visitor_1.ShExIndexVisitor.index(copy);
    const bindings = readOverlay(overlay, options)
        .map(spec => resolve(spec, copy, index, options));
    // Same element, more than one action: order by sa:order, then by the code
    // itself, so a document that doesn't say gets the same answer every run.
    bindings.sort((l, r) => l.order - r.order || cmp(l.semAct.code, r.semAct.code));
    const started = new Set();
    for (const b of bindings) {
        if (b.target === copy) { // sa:start -- the schema's own startActs
            if (options.replace && !started.has(copy)) {
                copy.startActs = [];
                started.add(copy);
            }
            copy.startActs = (copy.startActs || []).concat([b.semAct]);
            continue;
        }
        if (CAN_HOLD_SEMACTS.indexOf(b.target.type) === -1)
            throw Error(`${b.named} is a ${b.target.type}; ShExJ has semActs on `
                + CAN_HOLD_SEMACTS.join(', '));
        if (options.replace && !started.has(b.target)) {
            b.target.semActs = [];
            started.add(b.target);
        }
        b.target.semActs = (b.target.semActs || []).concat([b.semAct]);
    }
    return copy;
}
function readOverlay(overlay, options) {
    const overlays = overlay.getQuads(null, RDF_type, exports.Vocab.Overlay)
        .filter(q => options.only === undefined || q.subject.value === options.only);
    if (overlays.length === 0 && options.only !== undefined)
        throw Error(`no <${options.only}> a sa:Overlay in the overlay document`);
    return overlays.flatMap((root) => {
        const fallbackName = one(overlay, root.subject, exports.Vocab.extension);
        return overlay.getQuads(root.subject, exports.Vocab.action, null).map(q => {
            const a = q.object;
            const ref = one(overlay, a, exports.Vocab.ref);
            const path = one(overlay, a, exports.Vocab.path);
            const start = overlay.getQuads(a, exports.Vocab.start, null).length > 0;
            const named = [ref && `sa:ref <${ref}>`, path && `sa:path "${path}"`, start && 'sa:start']
                .filter(x => x);
            if (named.length !== 1)
                throw Error(`an sa:action wants exactly one of sa:ref, sa:path or sa:start; `
                    + (named.length ? `<${root.subject.value}> gave ${named.join(' and ')}`
                        : `<${root.subject.value}> gave none`));
            const name = one(overlay, a, exports.Vocab.extension) || fallbackName;
            if (!name)
                throw Error(`no sa:extension on ${named[0]} or on <${root.subject.value}>: `
                    + `an action has to say which extension runs it`);
            const order = one(overlay, a, exports.Vocab.order);
            return {
                ref, path, start,
                code: one(overlay, a, exports.Vocab.code),
                name,
                order: order === undefined ? 0 : parseInt(order, 10),
            };
        });
    });
}
function resolve(spec, schema, index, options) {
    const semAct = { type: 'SemAct', name: spec.name };
    if (spec.code !== undefined)
        semAct.code = spec.code;
    if (spec.start)
        return { target: schema, semAct, order: spec.order, named: 'sa:start' };
    if (spec.ref !== undefined) {
        let target = index.shapeExprs[spec.ref] || index.tripleExprs[spec.ref];
        if (target === undefined)
            throw Error(`sa:ref <${spec.ref}> is not a label in this schema; it has `
                + describeLabels(index));
        // A ShapeDecl is a label wrapped around a shape expression, and ShExJ
        // puts semActs on the expression rather than on the wrapper.
        if (target.type === 'ShapeDecl')
            target = target.shapeExpr;
        return { target, semAct, order: spec.order, named: `sa:ref <${spec.ref}>` };
    }
    const found = evalShapePath(spec.path, schema, options);
    if (found.length === 0)
        throw Error(`sa:path "${spec.path}" selected nothing in this schema`);
    if (found.length > 1)
        throw Error(`sa:path "${spec.path}" selected ${found.length} elements; `
            + `an action goes on one (narrow the path, or write one action each)`);
    return { target: found[0], semAct, order: spec.order, named: `sa:path "${spec.path}"` };
}
/** the ShapePath elements `pathStr` selects in `schema` */
function evalShapePath(pathStr, schema, options = {}) {
    const yy = {
        base: options.base === undefined ? undefined : new URL(options.base),
        prefixes: options.prefixes || {},
    };
    const expr = new ShapePath.Parser.ShapePathParser(yy).parse(pathStr);
    return expr.evalPathExpr([schema], new ShapePath.Ast.EvalContext(schema));
}
// ## reading RDF without depending on an RDF library
function one(source, subject, predicate) {
    const found = source.getQuads(subject, predicate, null);
    if (found.length === 0)
        return undefined;
    if (found.length > 1)
        throw Error(`${predicate} is given ${found.length} times on one sa:action`);
    return found[0].object.value;
}
function cmp(l, r) {
    return (l || '') < (r || '') ? -1 : (l || '') > (r || '') ? 1 : 0;
}
function describeLabels(index) {
    const shapes = Object.keys(index.shapeExprs || {});
    const tes = Object.keys(index.tripleExprs || {});
    return `${shapes.length} shape ${plural(shapes.length, 'label')}`
        + ` and ${tes.length} triple expression ${plural(tes.length, 'label')}`
        + (shapes.length + tes.length > 0
            ? `:\n  ` + shapes.concat(tes).map(l => '  ' + l).join('\n  ')
            : '');
}
function plural(n, word) {
    return n === 1 ? word : word + 's';
}
/**
 * A schema's actions, lifted out into overlay form.
 *
 * The way back for a schema that already has `%<ext>{...%}` through it: what
 * comes out is a schema anyone can read and a list of actions that puts them
 * back.  An element an overlay can't name -- no id, and no ShapePath this
 * knows how to write for it -- keeps its actions, and is listed in `left`.
 */
function extractOverlay(schema) {
    const copy = JSON.parse(JSON.stringify(schema));
    delete copy._index;
    const actions = [];
    const left = [];
    if (copy.startActs) {
        copy.startActs.forEach((a, i) => actions.push({ start: true, name: a.name, code: a.code, order: i }));
        delete copy.startActs;
    }
    (copy.shapes || []).forEach((decl) => {
        const label = typeof decl.id === 'string' && decl.id.substr(0, 2) !== '_:'
            ? decl.id : null;
        shapeExpr(decl.type === 'ShapeDecl' ? decl.shapeExpr : decl, label === null ? null : { ref: label }, label, `<${decl.id}>`);
    });
    return { schema: copy, actions, left };
    function shapeExpr(expr, naming, label, where) {
        if (expr === null || typeof expr !== 'object')
            return;
        take(expr, naming, where);
        switch (expr.type) {
            case 'ShapeAnd':
            case 'ShapeOr':
                // a conjunct has no id and no step this writes, so it names nothing
                return expr.shapeExprs.forEach((e, i) => shapeExpr(e, null, label, `${where}/shapeExprs[${i}]`));
            case 'ShapeNot':
                return shapeExpr(expr.shapeExpr, null, label, `${where}/shapeExpr`);
            case 'Shape':
                return tripleExpr(expr.expression, label, `${where}/expression`, countPredicates(expr.expression));
            default:
                return;
        }
    }
    function tripleExpr(expr, label, where, counts) {
        if (expr === null || typeof expr !== 'object')
            return;
        // A triple constraint with an id is named by it; without one, the
        // predicate shortcut reaches it, so long as the shape has a label and
        // only one constraint on that predicate.
        const naming = expr.id !== undefined && expr.id.substr(0, 2) !== '_:'
            ? { ref: expr.id }
            : expr.type === 'TripleConstraint' && label !== null && counts[expr.predicate] === 1
                ? { path: `@<${label}>~<${expr.predicate}>` }
                : null;
        take(expr, naming, where);
        if (expr.type === 'EachOf' || expr.type === 'OneOf')
            expr.expressions.forEach((e, i) => tripleExpr(e, label, `${where}/expressions[${i}]`, counts));
        if (expr.type === 'TripleConstraint')
            shapeExpr(expr.valueExpr, null, null, `${where}/valueExpr`);
    }
    function take(elt, naming, where) {
        const acts = elt.semActs;
        if (acts === undefined || acts.length === 0)
            return;
        if (naming === null) {
            left.push({ where, semActs: acts });
            return;
        }
        acts.forEach((a, i) => actions.push(Object.assign({}, naming, { name: a.name, code: a.code, order: i })));
        delete elt.semActs;
    }
    function countPredicates(expr) {
        const counts = {};
        walk(expr);
        return counts;
        function walk(e) {
            if (e === null || typeof e !== 'object')
                return;
            if (e.type === 'TripleConstraint')
                counts[e.predicate] = (counts[e.predicate] || 0) + 1;
            else if (e.type === 'EachOf' || e.type === 'OneOf')
                e.expressions.forEach(walk);
        }
    }
}
/** the Turtle for a list of extracted actions */
function overlayTurtle(actions, options = {}) {
    const subject = options.subject || '<#overlay>';
    const shared = options.extension
        || (actions.length && actions.every(a => a.name === actions[0].name)
            ? actions[0].name : undefined);
    const lines = actions.map(a => {
        const parts = [
            a.start ? 'sa:start true' : a.ref !== undefined ? `sa:ref <${a.ref}>`
                : `sa:path ${quote(a.path)}`,
            shared === undefined ? `sa:extension <${a.name}>` : null,
            a.code === undefined ? null : `sa:code ${quote(a.code)}`,
            a.order === 0 ? null : `sa:order ${a.order}`,
        ].filter(p => p !== null);
        return '  [ ' + parts.join(' ;\n    ') + ' ]';
    });
    return `PREFIX sa: <${exports.NS}>\n\n${subject} a sa:Overlay ;\n`
        + (shared === undefined ? '' : `  sa:extension <${shared}> ;\n`)
        + (lines.length ? '  sa:action\n' + lines.join(' ,\n') + '\n' : '')
        + '.\n';
}
function quote(s) {
    return s.indexOf('\n') === -1
        ? '"' + s.replace(/(["\\])/g, '\\$1') + '"'
        : '"""' + s.replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"') + '"""';
}
//# sourceMappingURL=semact-overlay.js.map