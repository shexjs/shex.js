"use strict";
/** @shexjs/editor-services - range-aware parsing and validation-error
 * mapping for language-sensitive editors (see doc/editor-integration-plan.md
 * at the repository root).
 *
 * The editor never talks to the parsers; this module runs them and returns
 * plain {from, to, severity, message} diagnostics (character offsets,
 * CodeMirror-ready) plus locate() functions for cross-pane highlights:
 *
 *   const s = EditorServices.parseShExC(schemaText, {base});
 *   const d = EditorServices.parseTurtle(dataText, {baseIRI: base});
 *   // ... run ShExValidator as usual on d.dataset or any RdfJs store ...
 *   const {schema, data, pairs} = EditorServices.mapValidationErrors(valResult, s, d);
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineOffsets = lineOffsets;
exports.yyllocToRange = yyllocToRange;
exports.millanSourceToRange = millanSourceToRange;
exports.parseShExC = parseShExC;
exports.locateInParsed = locateInParsed;
exports.parseTurtle = parseTurtle;
exports.mapValidationErrors = mapValidationErrors;
const ShExParser = __importStar(require("@shexjs/parser"));
const millan_1 = require("millan");
const XSD_STRING = "http://www.w3.org/2001/XMLSchema#string";
const RDF_LANGSTRING = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";
// ---------------------------------------------------------------------------
// offsets
/** lineOffsets - character offset of the start of each (1-based) line. */
function lineOffsets(text) {
    const starts = [0];
    for (let i = 0; i < text.length; ++i)
        if (text[i] === "\n")
            starts.push(i + 1);
    return starts;
}
/** yyllocToRange - jison yylloc to {from, to} character offsets. */
function yyllocToRange(loc, starts) {
    if (!loc || loc.first_line === undefined || loc.first_line - 1 >= starts.length)
        return null;
    return {
        from: starts[loc.first_line - 1] + loc.first_column,
        to: starts[Math.min(loc.last_line, starts.length) - 1] + loc.last_column,
    };
}
/** millanSourceToRange - millan SourceRange (inclusive endOffset) to
 * {from, to}. */
function millanSourceToRange(source) {
    return source && source.startOffset !== undefined
        ? { from: source.startOffset, to: source.endOffset + 1 }
        : null;
}
/** parseShExC - parse a ShExC document, returning the schema (when it
 * parses), diagnostics for parse errors, and range lookups for shapes,
 * expressions (e.g. TripleConstraints) and shape references.
 */
function parseShExC(text, opts = {}) {
    const starts = lineOffsets(text);
    const parser = ShExParser.construct(opts.base || "urn:editor:schema", opts.prefixes || {}, Object.assign({ index: true }, opts.schemaOptions));
    let schema = null;
    const diagnostics = [];
    try {
        schema = parser.parse(text);
    }
    catch (e) {
        (e.errors || [e]).forEach((err) => {
            const range = yyllocToRange(err.location, starts)
                || { from: text.length, to: text.length };
            diagnostics.push(Object.assign({
                severity: "error",
                message: firstLine(err.message),
            }, range));
        });
        schema = e.parsed || null; // whatever parsed before the error
    }
    return Object.assign({ diagnostics }, locateInParsed(text, schema));
}
/** locateInParsed - range lookups over an ALREADY-parsed schema (e.g. the
 * web apps' cache.parsed, whose expression objects are the ones validation
 * errors reference by identity -- @shexjs/loader's import-merging makes a
 * new top-level Schema but shares the inner objects).
 */
function locateInParsed(text, schema) {
    const starts = lineOffsets(text);
    return {
        text,
        schema,
        locate: {
            shape: (label) => schema && schema._locations
                ? yyllocToRange(schema._locations[label], starts)
                : null,
            expr: (obj) => schema && schema._exprLocations
                ? yyllocToRange(schema._exprLocations.get(obj), starts)
                : null,
            refs: (label) => schema && schema._sourceMap
                ? (schema._sourceMap.get(label) || [])
                    .map(loc => yyllocToRange(loc, starts))
                    .filter((r) => r !== null)
                : [],
            constraint: (shapeLabel, predicate) => {
                const tc = findTripleConstraint(schema, shapeLabel, predicate);
                return tc && schema && schema._exprLocations
                    ? yyllocToRange(schema._exprLocations.get(tc), starts)
                    : null;
            },
        },
    };
}
function firstLine(str) { return String(str).split("\n", 1)[0]; }
function findTripleConstraint(schema, shapeLabel, predicate) {
    const decl = schema && schema._index && schema._index.shapeExprs[shapeLabel];
    let found = null;
    (function walk(expr) {
        if (!expr || typeof expr !== "object" || found)
            return;
        if (expr.type === "TripleConstraint" && expr.predicate === predicate)
            found = expr;
        else if (expr.expressions)
            expr.expressions.forEach(walk);
        else if (expr.expression)
            walk(expr.expression);
        else if (expr.shapeExpr)
            walk(expr.shapeExpr);
        else if (expr.shapeExprs)
            expr.shapeExprs.forEach(walk);
    })(decl);
    return found;
}
function parseTurtle(text, opts = {}) {
    const { dataset, errors, semanticErrors, emitterErrors } = millan_1.rdfjs.parseTurtleToRdfjs(text, {
        baseIRI: opts.baseIRI || "urn:editor:data",
        sourceURL: opts.sourceURL,
    });
    const diagnostics = [];
    errors.concat(semanticErrors).forEach((err) => {
        const token = err.token && !isNaN(err.token.startOffset) ? err.token : null;
        diagnostics.push({
            severity: "error",
            message: firstLine(err.message),
            from: token ? token.startOffset : text.length,
            to: token ? token.endOffset + 1 : text.length,
        });
    });
    emitterErrors.forEach((err) => {
        const range = millanSourceToRange(err.source) || { from: 0, to: 0 };
        diagnostics.push(Object.assign({ severity: "error", message: firstLine(err.message) }, range));
    });
    return { text, dataset, diagnostics };
}
// ---------------------------------------------------------------------------
// validation-error mapping
/** ldTermToRdfJs - a ShExJson (LD) term as found in validation results to a
 * plain RDF/JS term structure that millan terms' equals() accepts. */
function ldTermToRdfJs(ld) {
    if (typeof ld === "object")
        return {
            termType: "Literal",
            value: ld.value,
            language: ld.language || "",
            datatype: {
                termType: "NamedNode",
                value: ld.type || (ld.language ? RDF_LANGSTRING : XSD_STRING),
            },
        };
    return ld.startsWith("_:")
        ? { termType: "BlankNode", value: ld.substr(2) }
        : { termType: "NamedNode", value: ld };
}
/** rangeOfTriple - locate a validation error's TestedTriple in the parsed
 * data; prefers the object term's own range (that's usually the offending
 * value), falling back to the quad's assertion site. */
function rangeOfTriple(dataset, triple) {
    const matches = [...dataset.match(ldTermToRdfJs(triple.subject), ldTermToRdfJs(triple.predicate), ldTermToRdfJs(triple.object))];
    if (matches.length === 0)
        return null;
    const quad = matches[0];
    return millanSourceToRange(quad.object && quad.object.source) ||
        millanSourceToRange(quad.source);
}
/** rangeOfNode - anchor for node-level errors (e.g. MissingProperty): the
 * first assertion where the node appears as subject. */
function rangeOfNode(dataset, node) {
    const matches = [...dataset.match(ldTermToRdfJs(node))];
    return matches.length
        ? millanSourceToRange(matches[0].subject.source) || millanSourceToRange(matches[0].source)
        : null;
}
// error types that anchor a diagnostic (as opposed to containers to recurse
// through); each entry renders a message and picks its anchors
const ErrorLeaves = {
    TypeMismatch: (err, _ctx) => ({
        message: `${termStr(err.triple.object)} doesn't satisfy ${err.constraint ? constraintStr(err.constraint) : "the constraint"}`,
        schemaObj: err.constraint,
        triple: err.triple,
    }),
    MissingProperty: (err, ctx) => ({
        message: `missing expected property ${termStr(err.property)}`,
        predicate: err.property,
        node: ctx.node,
    }),
    ExcessTripleViolation: (err, ctx) => ({
        message: `too many occurrences of ${termStr(err.property)}`,
        predicate: err.property,
        node: ctx.node,
    }),
    ClosedShapeViolation: (err, ctx) => ({
        message: `unexpected properties in closed shape: ${(err.unexpectedTriples || []).map((t) => termStr(t.predicate)).join(", ")}`,
        triples: err.unexpectedTriples,
        node: ctx.node,
    }),
    NodeConstraintViolation: (err, ctx) => ({
        message: firstLine((err.errors || [])[0] || "node constraint violation"),
        node: ctx.node,
    }),
    SemActFailure: (_err, ctx) => ({
        message: "semantic action failure",
        node: ctx.node,
    }),
};
function termStr(t) {
    return typeof t === "object" ? JSON.stringify(t.value) : "<" + t + ">";
}
function constraintStr(tc) {
    var _a, _b;
    const card = "min" in tc || "max" in tc ? ` {${(_a = tc.min) !== null && _a !== void 0 ? _a : 1},${(_b = tc.max) !== null && _b !== void 0 ? _b : 1}}` : "";
    const ve = tc.valueExpr === undefined ? "."
        : typeof tc.valueExpr === "string" ? "@<" + tc.valueExpr + ">"
            : tc.valueExpr.type === "NodeConstraint"
                ? (tc.valueExpr.datatype || (tc.valueExpr.values ? "[...]" : tc.valueExpr.nodeKind || "."))
                : tc.valueExpr.type;
    return `<${tc.predicate}> ${ve}${card}`;
}
/** mapValidationErrors - walk a validation result (single Failure, a
 * ShapeMap entry list, or anything ShExValidator returns) and resolve each
 * error to ranges in the schema and data documents.
 *
 * Returns {schema: [diagnostic], data: [diagnostic], pairs: [{id, message,
 * schema, data}]}; paired diagnostics share `pair` ids so an editor can
 * flash the counterpart range on hover.
 */
function mapValidationErrors(valResult, shexcParsed, turtleParsed) {
    const pairs = [];
    const seen = new Set();
    (function walk(node, ctx) {
        if (!node || typeof node !== "object" || seen.has(node))
            return;
        seen.add(node);
        if (Array.isArray(node))
            return node.forEach(n => walk(n, ctx));
        // track focus node / shape context on the way down
        if (node.node !== undefined || node.shape !== undefined)
            ctx = { node: node.node !== undefined ? node.node : ctx.node,
                shape: node.shape !== undefined ? node.shape : ctx.shape };
        if (node.type in ErrorLeaves)
            emit(ErrorLeaves[node.type](node, ctx), node, ctx);
        for (const key of ["errors", "appinfo", "solutions", "solution",
            "expressions", "referenced", "unexpectedTriples"])
            if (key in node)
                walk(node[key], ctx);
    })(valResult, {});
    function emit(leaf, err, ctx) {
        const schemaRange = (leaf.schemaObj && shexcParsed.locate.expr(leaf.schemaObj)) ||
            (leaf.predicate && ctx.shape && shexcParsed.locate.constraint(ctx.shape, leaf.predicate)) ||
            (ctx.shape && shexcParsed.locate.shape(ctx.shape)) ||
            null;
        let dataRange = null;
        if (turtleParsed && turtleParsed.dataset) {
            if (leaf.triple)
                dataRange = rangeOfTriple(turtleParsed.dataset, leaf.triple);
            else if (leaf.triples && leaf.triples.length)
                dataRange = rangeOfTriple(turtleParsed.dataset, leaf.triples[0]);
            if (!dataRange && leaf.node !== undefined && leaf.node !== null)
                dataRange = rangeOfNode(turtleParsed.dataset, leaf.node);
        }
        pairs.push({
            id: pairs.length,
            type: err.type,
            message: leaf.message,
            schema: schemaRange,
            data: dataRange,
        });
    }
    const toDiagnostics = (side) => pairs
        .filter(p => p[side])
        .map(p => ({ from: p[side].from, to: p[side].to, severity: "error",
        message: p.message, pair: p.id }));
    return { schema: toDiagnostics("schema"), data: toDiagnostics("data"), pairs };
}
//# sourceMappingURL=editor-services.js.map