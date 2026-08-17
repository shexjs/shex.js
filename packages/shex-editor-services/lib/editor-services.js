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
exports.parseTurtle = exports.parseShExC = void 0;
exports.lineOffsets = lineOffsets;
exports.yyllocToRange = yyllocToRange;
exports.sourceExcerpt = sourceExcerpt;
exports.commentRanges = commentRanges;
exports.locateInParsed = locateInParsed;
exports.mapValidationErrors = mapValidationErrors;
exports.mapMaterialization = mapMaterialization;
exports.stringifyWithOffsets = stringifyWithOffsets;
const ShExParser = __importStar(require("@shexjs/parser"));
const emit_1 = require("lezer-turtle/emit");
const RdfJs = __importStar(require("n3"));
const { describeError, relativeIri } = require("@shexjs/util/lib/error-messages");
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
/** sourceExcerpt - a gutter-numbered source line with a caret underline for
 * `range` (clipped to the range's first line), e.g. for CLI debuggers:
 *
 *   7 |   :leaf . %Map:{ :v2 %}
 *     |   ^^^^^^^^^^^^^^^^^^^^^
 */
function sourceExcerpt(text, range) {
    const starts = lineOffsets(text);
    let lineNo = 0;
    while (lineNo + 1 < starts.length && starts[lineNo + 1] <= range.from)
        ++lineNo;
    const lineFrom = starts[lineNo];
    const lineTo = lineNo + 1 < starts.length ? starts[lineNo + 1] : text.length;
    const line = text.substring(lineFrom, lineTo).replace(/\n$/, "");
    const gutter = String(lineNo + 1);
    const caret = " ".repeat(range.from - lineFrom) +
        "^".repeat(Math.max(1, Math.min(range.to, lineTo) - range.from));
    return gutter + " | " + line + "\n" + " ".repeat(gutter.length) + " | " + caret + "\n";
}
/** memoLast - cache a parse function's most recent results (the live linter
 * and the validation mapper parse the same document text moments apart). */
function memoLast(fn, keyOf, size = 4) {
    const cache = new Map(); // insertion-ordered
    return (text, opts) => {
        const key = keyOf(opts) + "\u0000" + text;
        if (cache.has(key)) {
            const hit = cache.get(key);
            cache.delete(key); // refresh recency
            cache.set(key, hit);
            return hit;
        }
        const ret = fn(text, opts);
        cache.set(key, ret);
        if (cache.size > size)
            cache.delete(cache.keys().next().value);
        return ret;
    };
}
/** parseShExC - parse a ShExC document, returning the schema (when it
 * parses), diagnostics for parse errors, and range lookups for shapes,
 * expressions (e.g. TripleConstraints) and shape references.
 * Memoized on (text, base): repeated calls with unchanged text are free.
 */
exports.parseShExC = memoLast(parseShExCUncached, opts => (opts && opts.base) || "");
function parseShExCUncached(text, opts = {}) {
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
/**
 * The `#`-to-end-of-line comments in a ShExC document.
 *
 * A `#` only starts one where it isn't inside something that may contain it,
 * which in ShExC is most of the interesting text: an IRI
 * (`<...EntitySchemaText/E107#>` -- a fragment, not a comment), a string, or
 * a `\#` escape in a local name.  Scanning for those is cheaper than it
 * sounds and much cheaper than getting it wrong.
 */
function commentRanges(text) {
    const out = [];
    const n = text.length;
    let i = 0;
    while (i < n) {
        const c = text[i];
        if (c === "\\") {
            i += 2;
            continue;
        } // an escape hides what follows
        if (c === "<") {
            // an IRIREF holds no whitespace, so a `<` with no `>` before the line
            // ends is a less-than or a typo rather than the start of one
            const close = text.indexOf(">", i + 1);
            const nl = text.indexOf("\n", i + 1);
            i = close !== -1 && (nl === -1 || close < nl) ? close + 1 : i + 1;
            continue;
        }
        if (c === '"' || c === "'") {
            const q = text.substr(i, 3) === c + c + c ? c + c + c : c;
            let j = i + q.length;
            while (j < n) {
                if (text[j] === "\\") {
                    j += 2;
                    continue;
                }
                if (text.startsWith(q, j)) {
                    j += q.length;
                    break;
                }
                if (q.length === 1 && text[j] === "\n")
                    break; // unterminated: don't run away
                ++j;
            }
            i = j;
            continue;
        }
        if (c === "#") {
            const nl = text.indexOf("\n", i);
            const to = nl === -1 ? n : nl;
            out.push({ from: i, to });
            i = to;
            continue;
        }
        ++i;
    }
    return out;
}
/** locateInParsed - range lookups over an ALREADY-parsed schema (e.g. the
 * web apps' cache.parsed, whose expression objects are the ones validation
 * errors reference by identity -- @shexjs/loader's import-merging makes a
 * new top-level Schema but shares the inner objects).
 */
function locateInParsed(text, schema) {
    const starts = lineOffsets(text);
    // Whitespace and comments are both trivia: an anchor that keeps a
    // constraint's delimiters and drops its nested constraints has no more
    // business painting the note somebody left between them than the newline.
    const comments = commentRanges(text);
    const commentAt = (at) => comments.find(c => at >= c.from && at < c.to) || null;
    /** the first position at or after `at` that is neither space nor comment */
    const afterTrivia = (at, limit) => {
        let i = at;
        for (;;) {
            while (i < limit && /\s/.test(text[i]))
                ++i;
            const c = i < limit ? commentAt(i) : null;
            if (c === null || c.to > limit)
                return i;
            i = c.to;
        }
    };
    /** the first position at or before `at` with only trivia between them */
    const beforeTrivia = (at, limit) => {
        let i = at;
        for (;;) {
            while (i > limit && /\s/.test(text[i - 1]))
                --i;
            const c = i > limit ? commentAt(i - 1) : null;
            if (c === null || c.from < limit)
                return i;
            i = c.from;
        }
    };
    const tcRange = (tc) => schema && schema._exprLocations
        ? yyllocToRange(schema._exprLocations.get(tc), starts)
        : null;
    /** just the predicate side of a constraint: its range clipped before any
     * inline-shape body and stripped of trailing whitespace and brace */
    const predicateRange = (tc) => {
        const range = tcRange(tc);
        if (!range)
            return null;
        const nested = schema && schema._exprLocations
            ? nestedConstraintExtent(tc, schema._exprLocations, starts) : null;
        if (nested && nested.from > range.from && nested.from <= range.to) {
            let to = nested.from;
            for (;;) {
                const was = to;
                to = beforeTrivia(to, range.from);
                while (to > range.from && text[to - 1] === "{")
                    --to;
                if (to === was)
                    break;
            }
            if (to > range.from)
                return { from: range.from, to };
        }
        return range;
    };
    /** an expression's highlight extent: a constraint with an inline-shape
     * valueExpr lexically contains that shape's own constraints, so highlight
     * only its delimiters (":s {" and "}") and leave the nested constraints to
     * highlight on their own */
    const highlightParts = (tc, range) => {
        const nested = schema && schema._exprLocations
            ? nestedConstraintExtent(tc, schema._exprLocations, starts) : null;
        if (!nested || !(nested.from > range.from && nested.to <= range.to))
            return [range];
        const parts = [];
        const headTo = beforeTrivia(nested.from, range.from); // keep the opening brace
        parts.push(headTo > range.from ? { from: range.from, to: headTo } : range);
        const tailFrom = afterTrivia(nested.to, range.to);
        if (tailFrom < range.to)
            parts.push({ from: tailFrom, to: range.to });
        return parts;
    };
    return {
        text,
        schema,
        locate: {
            shape: (label) => schema && schema._locations
                ? yyllocToRange(schema._locations[label], starts)
                : null,
            shapeLabel: (label) => {
                const decl = schema && schema._locations
                    ? yyllocToRange(schema._locations[label], starts) : null;
                if (!decl)
                    return null;
                // the declaration starts with (ABSTRACT)? <label>; take the label token
                const lead = /^\s*(?:abstract\s+)?/i.exec(text.slice(decl.from))[0].length;
                const token = /^\S+/.exec(text.slice(decl.from + lead));
                return token
                    ? { from: decl.from + lead, to: decl.from + lead + token[0].length }
                    : decl;
            },
            expr: (obj) => schema && schema._exprLocations
                ? yyllocToRange(schema._exprLocations.get(obj), starts)
                : null,
            refs: (label) => schema && schema._sourceMap
                ? (schema._sourceMap.get(label) || [])
                    .map(loc => yyllocToRange(loc, starts))
                    .filter((r) => r !== null)
                : [],
            constraint: (shapeLabel, predicate, occurrence = 0, path) => {
                const paths = onConstraintPath(findConstraintPaths(schema, shapeLabel, predicate), path);
                const hit = paths[occurrence] || paths[0] || null;
                return hit ? predicateRange(hit.tc) : null;
            },
            constraintAnchors: (shapeLabel, predicate, occurrence = 0, viaPath) => {
                const paths = onConstraintPath(findConstraintPaths(schema, shapeLabel, predicate), viaPath);
                const hit = paths[occurrence] || paths[0] || null;
                const range = hit && tcRange(hit.tc);
                if (!range)
                    return null;
                const path = hit.ancestors
                    .map(predicateRange)
                    .filter((r) => r !== null);
                return { parts: highlightParts(hit.tc, range), path };
            },
            exprAnchors: (obj) => {
                const range = schema && schema._exprLocations
                    ? yyllocToRange(schema._exprLocations.get(obj), starts) : null;
                return range ? { parts: highlightParts(obj, range) } : null;
            },
            exprAt: (offset) => {
                if (!schema || !schema._exprLocations)
                    return null;
                let best = null;
                for (const [expr, loc] of schema._exprLocations) {
                    const range = yyllocToRange(loc, starts);
                    if (range && range.from <= offset && offset < range.to &&
                        (!best || range.to - range.from < best.range.to - best.range.from))
                        best = { expr, range };
                }
                return best;
            },
            shapeAt: (offset) => {
                if (!schema || !schema._locations)
                    return null;
                let best = null;
                for (const label of Object.keys(schema._locations)) {
                    const range = yyllocToRange(schema._locations[label], starts);
                    if (range && range.from <= offset && offset < range.to &&
                        (!best || range.to - range.from < best.range.to - best.range.from))
                        best = { label, range };
                }
                return best;
            },
        },
    };
}
function firstLine(str) { return String(str).split("\n", 1)[0]; }
/** every TripleConstraint on `predicate` under `shapeLabel` (including
 * ones nested in inline-shape valueExprs -- validation results reach them
 * under the enclosing labeled shape), each with the stack of constraints
 * enclosing it, outermost first */
/** the candidates whose chain of enclosing inline constraints matches
 * `path` (predicates outermost first) -- two structurally identical
 * constraints nested under different predicates (:systolic's :value vs
 * :diastolic's) differ only by that chain.  All candidates when no path is
 * given or none matches (the result tree reached the constraint some way
 * the schema walk can't see; better an approximate anchor than none). */
function onConstraintPath(paths, path) {
    if (!path)
        return paths;
    const filtered = paths.filter(p => p.ancestors.length === path.length &&
        p.ancestors.every((a, i) => a.predicate === path[i]));
    return filtered.length ? filtered : paths;
}
function findConstraintPaths(schema, shapeLabel, predicate) {
    const decl = schema && schema._index && schema._index.shapeExprs[shapeLabel];
    const found = [];
    const stack = [];
    (function walk(expr) {
        if (!expr || typeof expr !== "object")
            return;
        if (expr.type === "TripleConstraint") {
            if (expr.predicate === predicate)
                found.push({ tc: expr, ancestors: stack.slice() });
            if (expr.valueExpr && typeof expr.valueExpr === "object") {
                stack.push(expr);
                walk(expr.valueExpr);
                stack.pop();
            }
        }
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
/** lexical extent (min from, max to) of the constraints nested under a
 * TripleConstraint's inline-shape valueExpr (null when none) */
function nestedConstraintExtent(tc, locations, starts) {
    let min = null, max = null;
    (function walk(expr) {
        if (!expr || typeof expr !== "object")
            return;
        if (expr.type === "TripleConstraint") {
            const range = yyllocToRange(locations.get(expr), starts);
            if (range) {
                if (min === null || range.from < min)
                    min = range.from;
                if (max === null || range.to > max)
                    max = range.to;
            }
            if (expr.valueExpr && typeof expr.valueExpr === "object")
                walk(expr.valueExpr);
        }
        else if (expr.expressions)
            expr.expressions.forEach(walk);
        else if (expr.expression)
            walk(expr.expression);
        else if (expr.shapeExpr)
            walk(expr.shapeExpr);
        else if (expr.shapeExprs)
            expr.shapeExprs.forEach(walk);
    })(tc.valueExpr && typeof tc.valueExpr === "object" ? tc.valueExpr : null);
    return min === null ? null : { from: min, to: max };
}
/** Memoized on (text, baseIRI); see parseShExC. */
exports.parseTurtle = memoLast(parseTurtleUncached, opts => (opts && opts.baseIRI) || "");
function parseTurtleUncached(text, opts = {}) {
    const { quads, provenance, diagnostics: lezerDiagnostics, prefixes, base } = (0, emit_1.parseTurtle)(text, {
        factory: RdfJs.DataFactory,
        baseIRI: opts.baseIRI || "urn:editor:data",
    });
    const diagnostics = lezerDiagnostics.map((d) => ({
        severity: "error",
        message: firstLine(d.message),
        from: d.start,
        to: Math.max(d.end, d.start + 1),
    }));
    return { text, dataset: new RdfJs.Store(quads), quads, provenance, diagnostics,
        prefixes: prefixes || {}, base: base || opts.baseIRI };
}
// ---------------------------------------------------------------------------
// validation-error mapping
/** ldTermToRdfJs - a ShExJson (LD) term as found in validation results to
 * an RDF/JS term (for canonical-key provenance lookups and store matches). */
function ldTermToRdfJs(ld) {
    const F = RdfJs.DataFactory;
    if (typeof ld === "object")
        return F.literal(ld.value, ld.language || (ld.type ? F.namedNode(ld.type) : undefined));
    return ld.startsWith("_:")
        ? F.blankNode(ld.substr(2))
        : F.namedNode(ld);
}
function uttRange(spans) {
    return spans && spans.length ? { from: spans[0].start, to: spans[0].end } : null;
}
/** trimRange - drop trailing whitespace from a range (some term sources
 * include following trivia). */
function trimRange(range, text) {
    if (!range)
        return null;
    let to = range.to;
    while (to > range.from && /\s/.test(text[to - 1]))
        --to;
    return to === range.to ? range : { from: range.from, to };
}
/** alignQuad - find the parsed quad a validation-result triple denotes */
function alignQuad(parsed, s, p, o, bnodes) {
    const direct = RdfJs.DataFactory.quad(s, p, o);
    if (parsed.provenance.get(direct).length) // labels aligned (same parser fed the validator)
        return direct;
    const sB = s.termType === "BlankNode", oB = o.termType === "BlankNode";
    if (!sB && !oB)
        return null;
    const sBound = sB ? bnodes.toProv.get(s.value) : null;
    const oBound = oB ? bnodes.toProv.get(o.value) : null;
    const fits = (bound, actual) => bound ? actual.equals(bound)
        : actual.termType === "BlankNode" && !bnodes.used.has(actual.value);
    for (const q of parsed.quads) {
        if (!q.predicate.equals(p))
            continue;
        if (sB ? !fits(sBound, q.subject) : !q.subject.equals(s))
            continue;
        if (oB ? !fits(oBound, q.object) : !q.object.equals(o))
            continue;
        if (sB && !sBound) {
            bnodes.toProv.set(s.value, q.subject);
            bnodes.used.add(q.subject.value);
        }
        if (oB && !oBound) {
            bnodes.toProv.set(o.value, q.object);
            bnodes.used.add(q.object.value);
        }
        return q;
    }
    return null;
}
/** tripleAnchors - locate a validation result's TestedTriple in the parsed
 * data via the provenance index (utterance ranges per position). */
function tripleAnchors(parsed, triple, text, bnodes) {
    const quad = alignQuad(parsed, ldTermToRdfJs(triple.subject), ldTermToRdfJs(triple.predicate), ldTermToRdfJs(triple.object), bnodes);
    return quad ? quadAnchors(parsed, quad, text) : null;
}
/** quadAnchors - the term-level ranges of a quad already located in the
 * parsed document */
function quadAnchors(parsed, quad, text) {
    const [utt] = parsed.provenance.get(quad);
    if (!utt)
        return null;
    // A term whose source form is a nested structure -- a blank node's whole
    // [ property list ] in Turtle, an entity page's { ... } in JSON -- marks
    // just its delimiters, so the contents read as their own triples.
    const nested = (range) => !!range && range.to - range.from >= 2 &&
        ((text[range.from] === "[" && text[range.to - 1] === "]") ||
            (text[range.from] === "{" && text[range.to - 1] === "}"));
    const delims = (range, _term) => nested(range)
        ? [{ from: range.from, to: range.from + 1 }, { from: range.to - 1, to: range.to }]
        : undefined;
    const subject = trimRange(uttRange(utt.subject), text);
    const object = trimRange(uttRange(utt.object), text);
    return {
        subject,
        predicate: trimRange(uttRange(utt.predicate), text),
        object,
        subjectParts: delims(subject, quad.subject),
        objectParts: delims(object, quad.object),
    };
}
/** rangeOfNode - anchor for node-level errors (e.g. MissingProperty): the
 * first assertion where the node appears as subject. */
function rangeOfNode(parsed, node, bnodes) {
    let term = ldTermToRdfJs(node);
    if (term.termType === "BlankNode")
        term = bnodes.toProv.get(term.value) || term;
    for (const quad of parsed.quads)
        if (quad.subject.equals(term)) {
            const [utt] = parsed.provenance.get(quad);
            if (utt)
                return uttRange(utt.subject);
        }
    return null;
}
// error types that anchor a diagnostic (as opposed to containers to recurse
// through); each entry renders a message and picks its anchors
/**
 * What each error type says, and what to point at when saying it.
 *
 * The sentence comes from @shexjs/util's describeError, which the human
 * writer uses too -- these two used to write the same sentences differently
 * and drift.  What is this module's own is the *anchoring*: which schema
 * object and which triple a range can be found for.  See
 * doc/error-reporting.md (F1).
 */
const ErrorLeaves = {};
["TypeMismatch", "MissingProperty", "ExcessTripleViolation", "ClosedShapeViolation",
    "NodeConstraintViolation", "NegatedProperty", "AbstractShapeFailure", "SemActFailure",
    "SemActViolation", "FeasibilityViolation"].forEach(type => {
    ErrorLeaves[type] = (err, ctx) => {
        const said = describeError(err, {
            constraint: ctx.constraint,
            triple: ctx.triple,
            node: ctx.node,
            prefixes: schemaPrefixes,
            base: schemaBase,
            lex: documentLexer === null ? undefined : documentLexer(err.triple || ctx.triple),
        }) || { text: type };
        return {
            message: said.text,
            // object identity doesn't survive a structured clone (worker-app
            // results), so the (shape, predicate) lookup is the anchor that
            // always works
            schemaObj: said.schemaObj || ctx.constraint,
            predicate: said.predicate,
            triple: said.triple || ctx.triple,
            triples: said.triples,
            node: said.node !== undefined ? said.node : ctx.node,
        };
    };
});
/** the prefixes and base a quoted fragment is written with; set per run */
let schemaPrefixes = {};
let schemaBase = undefined;
/** how to spell terms for the document being mapped; set per mapping run,
 * null where the caller asked for explicit IRIs (see SpellingOption) */
let documentLexer = null;
/** an IRI as a prefix table writes it, or null where no prefix covers it */
function curie(iri, prefixes) {
    for (const [prefix, namespace] of Object.entries(prefixes || {}))
        if (typeof namespace === "string" && namespace.length > 0 && iri.startsWith(namespace)
            && iri.substring(namespace.length).match(/^[A-Za-z_][-\w.]*$/))
            return prefix + ":" + iri.substring(namespace.length);
    return null;
}
/**
 * Spell terms the way the document the reader is looking at spells them.
 *
 * Three answers, best first:
 *
 *  1. the source range the term was written in.  A validation result carries
 *     IRIs, and `<http://hl7.example/Patient2>` is a fact about the term, not
 *     about the document: line 8 says `<Patient2>`, and that is what the
 *     reader is looking for.  This is the only spelling that is *read* rather
 *     than reconstructed, so it is right even where the document does
 *     something no rule here anticipates.
 *  2. the document's own PREFIX table and BASE, for a term it doesn't
 *     contain -- a property that is missing is still best named the way this
 *     document names properties.
 *  3. nothing, and the caller says it in full.
 *
 * Two things are deliberately *not* taken from the source.  A term whose
 * written form is a nested structure -- Turtle's `[ :a 1 ]` for a blank node
 * -- would quote a whole subgraph into the middle of a sentence, and its
 * label reads better; and a literal is left to the caller, which already
 * quotes and marks it up in the one way every document writes it.
 */
function lexerFor(parsed, bnodes) {
    const text = parsed.text;
    const anchorCache = new Map();
    const anchorsOf = (triple) => {
        if (!triple)
            return null;
        if (!anchorCache.has(triple))
            anchorCache.set(triple, tripleAnchors(parsed, triple, text, bnodes));
        return anchorCache.get(triple);
    };
    const written = (range) => {
        if (!range || range.to <= range.from)
            return null;
        const said = text.slice(range.from, range.to);
        // a nested form stands for a subgraph, not a name
        return said[0] === "[" || said[0] === "{" ? null : said;
    };
    return (triple) => (term, role) => {
        if (term === undefined || term === null)
            return null;
        // a literal reads the same in any document; let the caller quote it
        if (typeof term === "object")
            return null;
        if (typeof term !== "string")
            return null;
        const anchors = anchorsOf(triple);
        if (anchors && (role === "subject" || role === "predicate" || role === "object")) {
            const at = triple && triple[role];
            // the term has to be the one standing in that position, not merely
            // equal to some other term of the same triple
            if (at !== undefined && termsEqual(at, term)) {
                const said = written(anchors[role]);
                if (said)
                    return said;
            }
        }
        if (role === "node" || role === "subject") {
            const said = written(rangeOfNode(parsed, term, bnodes));
            if (said)
                return said;
        }
        if (term.startsWith("_:"))
            return null; // its label, which the caller has
        return curie(term, parsed.prefixes) || relativeIri(term, parsed.base);
    };
}
/** are these the same term, as a validation result spells them? */
function termsEqual(a, b) {
    if (typeof a === "string" || typeof b === "string")
        return a === b;
    if (!a || !b)
        return false;
    return a.value === b.value && a.type === b.type && a.language === b.language;
}
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
/**
 * repairNotes - a failure's repairs, pinned on the constraints they are
 * about.
 *
 * The validator can report what would make a node conform: arcs to add,
 * arcs to take away (doc/error-normalization.md §4).  Each arc belongs to a
 * constraint the reader is looking at, so it belongs *there* -- "to conform:
 * add 1" beside the `foaf:mbox` the node hasn't got -- rather than only in
 * the results.  An arc whose constraint can't be located (a repair naming a
 * predicate the reader's schema spells elsewhere) is dropped rather than
 * pinned at a guess.
 */
function repairNotes(valResult, shexcParsed) {
    const notes = [];
    const seen = new Set();
    (function walk(node) {
        if (Array.isArray(node))
            return node.forEach(walk);
        if (node === null || typeof node !== "object")
            return;
        if (node.type === "Failure" && Array.isArray(node.repairs) && typeof node.shape === "string") {
            const ways = node.repairs.filter((repair) => (repair.arcs || []).length > 0);
            ways.forEach((repair, at) => repair.arcs.forEach((arc) => {
                const found = shexcParsed.locate.constraintAnchors(node.shape, arc.property, 0);
                const where = found && found.parts.length > 0 ? found.parts[0] : null;
                if (where === null)
                    return;
                const said = (arc.delta > 0 ? "add " : "remove ") + Math.abs(arc.delta);
                const message = (ways.length > 1 ? "to conform (way " + (at + 1) + " of "
                    + ways.length + "): " : "to conform: ") + said;
                const key = where.from + ":" + where.to + ":" + message;
                if (seen.has(key))
                    return;
                seen.add(key);
                notes.push({ from: where.from, to: where.to, severity: "info", message });
            }));
        }
        Object.values(node).forEach(walk);
    })(valResult);
    return notes;
}
/** mapValidationErrors - walk a validation result (single Failure, a
 * ShapeMap entry list, or anything ShExValidator returns) and resolve each
 * error to ranges in the schema and data documents.
 *
 * Returns {schema: [diagnostic], data: [diagnostic], pairs: [{id, message,
 * schema, data}]}; paired diagnostics share `pair` ids so an editor can
 * flash the counterpart range on hover.
 */
function mapValidationErrors(valResult, shexcParsed, turtleParsed, opts = {}) {
    const pairs = [];
    const seen = new Set();
    const bnodes = { toProv: new Map(), used: new Set() };
    // A sentence reads for one reader looking at one pair of documents, so
    // how to spell a term is settled here rather than passed down every call.
    const schemaMeta = (shexcParsed.schema || {});
    schemaPrefixes = schemaMeta._prefixes || {};
    schemaBase = schemaMeta._base;
    documentLexer = opts.spelling === "document" && turtleParsed && turtleParsed.quads
        ? lexerFor(turtleParsed, bnodes)
        : null;
    (function walk(node, ctx) {
        if (!node || typeof node !== "object" || seen.has(node))
            return;
        seen.add(node);
        if (Array.isArray(node))
            return node.forEach(n => walk(n, ctx));
        // track focus node / shape / enclosing-error context on the way down
        if (node.node !== undefined || node.shape !== undefined ||
            node.constraint !== undefined || node.triple !== undefined)
            ctx = { node: node.node !== undefined ? node.node : ctx.node,
                shape: node.shape !== undefined ? node.shape : ctx.shape,
                constraint: node.constraint !== undefined ? node.constraint : ctx.constraint,
                triple: node.triple !== undefined ? node.triple : ctx.triple,
                tcOrdinals: node.shape !== undefined ? new Map() : ctx.tcOrdinals,
                // a shape result boundary: an inline shape continues its
                // enclosing constraint chain, a referenced one starts fresh
                constraintPath: node.shape !== undefined ? (ctx.pendingInlinePath || []) : ctx.constraintPath,
                pendingInlinePath: node.shape !== undefined ? undefined : ctx.pendingInlinePath };
        if (node.type in ErrorLeaves)
            emit("nonconformant", ErrorLeaves[node.type](node, ctx), node, ctx);
        // successful matches: each TestedTriple under a TripleConstraintSolutions
        // pairs a schema constraint with a data triple
        if (node.type === "TripleConstraintSolutions" && Array.isArray(node.solutions)) {
            // one ordinal per constraint *node* (its several solutions share it)
            const ordinal = ctx.tcOrdinals ? (ctx.tcOrdinals.get(node.predicate) || 0) : 0;
            if (ctx.tcOrdinals)
                ctx.tcOrdinals.set(node.predicate, ordinal + 1);
            node.solutions.forEach((sol) => {
                if (sol && sol.type === "TestedTriple")
                    emit("conformant", {
                        message: `${termStr(sol.object)} matched <${node.predicate}>`,
                        predicate: node.predicate,
                        constraintOrdinal: ordinal,
                        constraintPath: ctx.constraintPath,
                        triple: sol,
                    }, node, ctx);
            });
            // an inline-shape valueExpr's referenced results anchor under this
            // constraint: extend the chain for the descent into the solutions
            if (node.valueExpr && typeof node.valueExpr === "object")
                ctx = Object.assign(Object.assign({}, ctx), { pendingInlinePath: (ctx.constraintPath || []).concat(node.predicate) });
        }
        for (const key of ["errors", "appinfo", "solutions", "solution",
            "expressions", "referenced", "unexpectedTriples"])
            if (key in node)
                walk(node[key], ctx);
    })(valResult, {});
    function emit(status, leaf, err, ctx) {
        const ca = leaf.predicate && ctx.shape
            ? shexcParsed.locate.constraintAnchors(ctx.shape, leaf.predicate, leaf.constraintOrdinal || 0, leaf.constraintPath)
            : null;
        const schemaRange = (leaf.schemaObj && shexcParsed.locate.expr(leaf.schemaObj)) ||
            (ca && ca.parts[0]) ||
            // last resort: just the shape's label token -- never the whole
            // declaration, which would paint innocent constraints red
            (ctx.shape && shexcParsed.locate.shapeLabel(ctx.shape)) ||
            null;
        // parts/path describe the constraint; only attach them when the
        // constraint anchor is what schemaRange resolved to
        const viaConstraint = ca && schemaRange === ca.parts[0] ? ca : null;
        const anchors = {
            shapeLabel: ctx.shape ? shexcParsed.locate.shapeLabel(ctx.shape) : null,
            subject: null, predicate: null, object: null,
        };
        let dataRange = null;
        // anchoring needs the quads and where they were written, not a store
        if (turtleParsed && turtleParsed.quads) {
            const triple = leaf.triple || (leaf.triples && leaf.triples[0]) || null;
            if (triple) {
                const termRanges = tripleAnchors(turtleParsed, triple, turtleParsed.text, bnodes);
                if (termRanges)
                    Object.assign(anchors, termRanges);
                dataRange = anchors.object;
            }
            if (!dataRange && leaf.node !== undefined && leaf.node !== null)
                dataRange = rangeOfNode(turtleParsed, leaf.node, bnodes);
        }
        pairs.push({
            id: pairs.length,
            type: err.type,
            status,
            message: leaf.message,
            schema: schemaRange,
            data: dataRange,
            anchors,
            schemaParts: viaConstraint ? viaConstraint.parts : undefined,
            schemaPath: viaConstraint ? viaConstraint.path : undefined,
            triple: leaf.triple || (leaf.triples && leaf.triples[0]) || null,
        });
    }
    // squiggles come from failures only; conformant pairs drive hover highlights
    const toDiagnostics = (side) => pairs
        .filter(p => p.status === "nonconformant" && p[side])
        .map(p => ({ from: p[side].from, to: p[side].to, severity: "error",
        message: p.message, pair: p.id }));
    return { schema: toDiagnostics("schema").concat(repairNotes(valResult, shexcParsed)),
        data: toDiagnostics("data"), pairs };
}
/** mapMaterialization - tie each generated triple to its constraint in the
 * output schema and its position in the rendered result Turtle.
 *
 * The rendered Turtle is a fresh serialization, so its blank-node labels are
 * not the materializer's: quads align structurally, exactly as validation
 * results align against the data pane (see alignQuad).
 *
 * @param provenance per-quad origins, e.g. ThreadedMaterializer's
 * @param outputParsed located output schema (locateInParsed)
 * @param resultParsed the rendered Turtle, parsed (parseTurtle)
 */
function mapMaterialization(provenance, outputParsed, resultParsed) {
    const generated = (provenance || []).map(p => p && p.quad).filter(q => q);
    const bnodes = resultParsed
        ? alignBnodesBySubtree(generated, resultParsed.quads)
        : new Map();
    const pairs = [];
    (provenance || []).forEach(prov => {
        const quad = prov && prov.quad;
        if (!quad)
            return;
        const rendered = resultParsed && substituteBnodes(quad, bnodes);
        const anchors = rendered
            ? quadAnchors(resultParsed, rendered, resultParsed.text)
            : null;
        const schema = prov.tc ? outputParsed.locate.expr(prov.tc) : null;
        const parts = prov.tc ? outputParsed.locate.exprAnchors(prov.tc) : null;
        const src = prov.src || {};
        pairs.push({
            id: pairs.length,
            schema,
            schemaParts: parts ? parts.parts : undefined,
            anchors: anchors || { subject: null, predicate: null, object: null },
            variables: src.variables || [],
            frame: src.frame === undefined ? null : src.frame,
            statics: src.statics === true,
            structural: src.structural === true,
            quad,
        });
    });
    return pairs;
}
/** substituteBnodes - a generated quad relabeled with the rendering's blank
 * nodes, or null when either end failed to align */
function substituteBnodes(quad, bnodes) {
    const map = (term) => term.termType === "BlankNode" ? bnodes.get(term.value) || null : term;
    const subject = map(quad.subject), object = map(quad.object);
    return subject && object
        ? RdfJs.DataFactory.quad(subject, quad.predicate, object)
        : null;
}
/** a graph indexed for alignment: arcs by subject, blank nodes, tree roots
 * (nodes no arc points at) and each blank node's canonical subtree
 * signature */
function indexForAlignment(quads) {
    const arcs = new Map();
    const bnodes = new Map();
    const isObject = new Set();
    for (const q of quads) {
        if (q.subject.termType === "BlankNode")
            bnodes.set(q.subject.value, q.subject);
        if (q.object.termType === "BlankNode") {
            bnodes.set(q.object.value, q.object);
            isObject.add(q.object.value);
        }
        if (!arcs.has(q.subject.value))
            arcs.set(q.subject.value, []);
        arcs.get(q.subject.value).push(q);
    }
    const memo = new Map();
    const signature = (term, seen = new Set()) => {
        if (term.termType !== "BlankNode")
            return term.termType + " " + term.value +
                (term.termType === "Literal"
                    ? " " + term.language + " " + (term.datatype ? term.datatype.value : "") : "");
        const key = term.value;
        const known = memo.get(key);
        if (known !== undefined)
            return known;
        if (seen.has(key))
            return "<cycle>"; // a materialized graph is a tree, but don't hang on one
        seen.add(key);
        const parts = (arcs.get(key) || [])
            .map(q => q.predicate.value + " " + signature(q.object, seen)).sort();
        seen.delete(key);
        const sig = "[" + parts.join("|") + "]";
        memo.set(key, sig);
        return sig;
    };
    const roots = [];
    bnodes.forEach((term, key) => {
        if (!isObject.has(key))
            roots.push(term);
    });
    return { arcs, bnodes, roots, signature };
}
/** groupBySignature - terms bucketed by subtree signature */
function groupBySignature(terms, signature) {
    const groups = new Map();
    terms.forEach(term => {
        const sig = signature(term);
        if (!groups.has(sig))
            groups.set(sig, []);
        groups.get(sig).push(term);
    });
    return groups;
}
/** alignBnodesBySubtree - pair a generated graph's blank nodes with the
 * rendering's.
 *
 * A rendering is a fresh serialization, so its labels are its own.  Pairing
 * them positionally (first unclaimed blank node that fits -- all validation
 * results can do, having one triple at a time to go on) mis-pairs whenever
 * the rendering's order differs from the generated graph's, and a mis-pair
 * is worse than no anchor: sibling structures that share a value (every
 * fhir:units "mmHg") still "match", so the wrong triple highlights.
 *
 * Here the whole graph is in hand, so walk it top-down from its roots,
 * pairing each blank node within its parent's context -- among the arcs
 * leaving the paired parent on the same predicate, take one whose object's
 * subtree signature (sorted, recursive) matches.  Structure disambiguates
 * identical siblings (four reports' `[ fhir:Patient.name "Sue" ]`), and the
 * signature disambiguates differing ones (systolic vs diastolic).  Blank
 * nodes that no root reaches fall back to signature groups alone, and
 * unmatched ones stay unpaired -- no anchor beats a wrong one.
 */
function alignBnodesBySubtree(generated, rendered) {
    const from = indexForAlignment(generated), to = indexForAlignment(rendered);
    const pairing = new Map();
    const claimed = new Set();
    const pair = (genTerm, renTerm) => {
        pairing.set(genTerm.value, renTerm);
        claimed.add(renTerm.value);
    };
    // tree roots have no parent to place them: pair them by signature alone
    groupBySignature(from.roots, from.signature).forEach((terms, sig) => {
        const counterparts = (groupBySignature(to.roots, to.signature).get(sig) || [])
            .filter(t => !claimed.has(t.value));
        terms.forEach((term, i) => {
            if (counterparts[i])
                pair(term, counterparts[i]);
        });
    });
    // ... then descend, resolving each blank node against its paired parent
    const resolve = (term) => term.termType === "BlankNode" ? pairing.get(term.value) : term;
    const stack = [...from.roots];
    for (const q of generated)
        if (q.subject.termType !== "BlankNode")
            stack.push(q.subject);
    const walked = new Set();
    while (stack.length) {
        const genSubject = stack.pop();
        if (walked.has(genSubject.value))
            continue;
        walked.add(genSubject.value);
        const renSubject = resolve(genSubject);
        if (!renSubject)
            continue;
        const renArcs = to.arcs.get(renSubject.value) || [];
        for (const arc of from.arcs.get(genSubject.value) || []) {
            if (arc.object.termType !== "BlankNode")
                continue;
            if (!pairing.has(arc.object.value)) {
                const want = from.signature(arc.object);
                const hit = renArcs.find(candidate => candidate.predicate.equals(arc.predicate) &&
                    candidate.object.termType === "BlankNode" &&
                    !claimed.has(candidate.object.value) &&
                    to.signature(candidate.object) === want);
                if (hit)
                    pair(arc.object, hit.object);
            }
            stack.push(arc.object);
        }
    }
    // anything the walk never reached: signature groups alone
    const strayFrom = [...from.bnodes.values()].filter(t => !pairing.has(t.value));
    if (strayFrom.length) {
        const strayTo = groupBySignature([...to.bnodes.values()].filter(t => !claimed.has(t.value)), to.signature);
        groupBySignature(strayFrom, from.signature).forEach((terms, sig) => {
            const counterparts = (strayTo.get(sig) || []).filter(t => !claimed.has(t.value));
            terms.forEach((term, i) => {
                if (counterparts[i])
                    pair(term, counterparts[i]);
            });
        });
    }
    return pairing;
}
const TERM_MEMBERS = ["subject", "predicate", "object"];
/** stringifyWithOffsets - JSON.stringify(value, null, indent)-identical
 * serialization that also records the {from, to} character range of every
 * object `isTarget` accepts (e.g. TestedTriples in validation results), so
 * a rendered results pane can highlight and scroll to them. */
function stringifyWithOffsets(value, isTarget, indent = 2) {
    const ranges = [];
    const pieces = [];
    let len = 0;
    const push = (str) => { pieces.push(str); len += str.length; };
    function ser(v, depth) {
        if (v === undefined || typeof v === "function")
            return false;
        if (v === null || typeof v !== "object") {
            push(JSON.stringify(v));
            return true;
        }
        const start = len;
        const pad = " ".repeat(indent * (depth + 1));
        const padEnd = " ".repeat(indent * depth);
        const fields = {};
        if (Array.isArray(v)) {
            if (v.length === 0)
                push("[]");
            else {
                push("[\n");
                v.forEach((item, i) => {
                    push(pad);
                    if (!ser(item, depth + 1))
                        push("null");
                    push(i < v.length - 1 ? ",\n" : "\n");
                });
                push(padEnd + "]");
            }
        }
        else {
            const keys = Object.keys(v).filter(k => v[k] !== undefined && typeof v[k] !== "function");
            if (keys.length === 0)
                push("{}");
            else {
                push("{\n");
                keys.forEach((k, i) => {
                    const kFrom = len + pad.length;
                    push(pad + JSON.stringify(k) + ": ");
                    ser(v[k], depth + 1);
                    if (TERM_MEMBERS.indexOf(k) !== -1)
                        fields[k] = { from: kFrom, to: len };
                    push(i < keys.length - 1 ? ",\n" : "\n");
                });
                push(padEnd + "}");
            }
        }
        if (isTarget(v))
            ranges.push(Object.keys(fields).length
                ? { target: v, from: start, to: len, fields }
                : { target: v, from: start, to: len });
        return true;
    }
    ser(value, 0);
    return { text: pieces.join(""), ranges };
}
//# sourceMappingURL=editor-services.js.map