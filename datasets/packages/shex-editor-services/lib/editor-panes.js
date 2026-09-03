"use strict";
/** editor-panes - CodeMirror 6 glue for the ShEx web apps.
 *
 * makePane(textarea, opts) replaces a textarea with a language-aware editor
 * while keeping the textarea as a live proxy: reads and writes of
 * `textarea.value` (including jQuery's .val()) transparently hit the editor
 * document, and editor changes write back and fire a native "change" event.
 * The surrounding application (caches, permalinks, drag-and-drop, tests)
 * keeps its textarea-shaped view of the world.
 *
 * Diagnostics come from ./editor-services (the editor itself never parses
 * anything); each pane exposes setDiagnostics/highlight/clearHighlights for
 * validation-error and shape-map anchoring.
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
exports.CHANGE_DEBOUNCE_MS = exports.languages = exports.shapeMapStreamParser = void 0;
exports.lexicalize = lexicalize;
exports.completionSource = completionSource;
exports.makeResultPane = makeResultPane;
exports.makeJsonPane = makeJsonPane;
exports.makePaneIfDescribed = makePaneIfDescribed;
exports.makePane = makePane;
const codemirror_1 = require("codemirror");
const view_1 = require("@codemirror/view");
const state_1 = require("@codemirror/state");
const language_1 = require("@codemirror/language");
const lint_1 = require("@codemirror/lint");
const autocomplete_1 = require("@codemirror/autocomplete");
const lang_json_1 = require("@codemirror/lang-json");
const lezer_turtle_1 = require("lezer-turtle");
const lezer_shexc_1 = require("lezer-shexc");
const EditorServices = __importStar(require("./editor-services"));
/** lexicalize - shortest lexical form for an IRI under the given prefixes */
function lexicalize(iri, prefixes) {
    let best = null;
    for (const [prefix, ns] of Object.entries(prefixes || {}))
        if (ns.length > 0 && iri.startsWith(ns) && (!best || ns.length > best[1].length))
            best = [prefix, ns];
    if (best) {
        const local = iri.substring(best[1].length);
        if (/^[A-Za-z0-9_.-]*$/.test(local))
            return best[0] + ":" + local;
    }
    return "<" + iri + ">";
}
/** completionSource - a CodeMirror autocomplete source over the app-supplied
 * vocabulary: prefix declarations, shape labels (plain and @ref forms) and
 * predicates. */
function completionSource(getSets) {
    return (context) => {
        const word = context.matchBefore(/@?[<A-Za-z_:][^\s;,|(){}[\]]*/);
        if (!word && !context.explicit)
            return null;
        const sets = getSets() || {};
        const prefixes = sets.prefixes || {};
        const options = [];
        Object.keys(prefixes).forEach(prefix => options.push({ label: prefix + ":", type: "namespace", detail: prefixes[prefix] }));
        (sets.shapeLabels || []).forEach(iri => {
            const lex = lexicalize(iri, prefixes);
            options.push({ label: lex, type: "class", detail: "shape" });
            options.push({ label: "@" + lex, type: "class", detail: "shape ref" });
        });
        (sets.predicates || []).forEach(iri => options.push({ label: lexicalize(iri, prefixes), type: "property" }));
        (sets.nodes || []).forEach(term => options.push({ label: term.startsWith("_:") ? term : lexicalize(term, prefixes),
            type: "variable", detail: "node" }));
        return options.length
            ? { from: word ? word.from : context.pos, options, validFor: /^@?[<A-Za-z_:][^\s]*$/ }
            : null;
    };
}
// ---------------------------------------------------------------------------
// ShExC via lezer-shexc: the grammar the validator's parser has, in the
// editor's parser model -- exact colours, incremental, and tolerant of the
// half-typed (a schema with an error still parses around it).  The
// semantic truth (diagnostics, shape/error ranges) still comes from the
// real parser via editor-services.
const shexcLanguage = language_1.LRLanguage.define({
    parser: lezer_shexc_1.parser.configure({
        props: [
            language_1.foldNodeProp.add({
                InlineShapeDefinition: language_1.foldInside,
                ValueSet: language_1.foldInside,
                BracketedTripleExpr: language_1.foldInside,
            }),
            language_1.indentNodeProp.add({
                InlineShapeDefinition: (0, language_1.delimitedIndent)({ closing: "}" }),
                ValueSet: (0, language_1.delimitedIndent)({ closing: "]" }),
                BracketedTripleExpr: (0, language_1.delimitedIndent)({ closing: ")" }),
            }),
        ],
    }),
    languageData: { commentTokens: { line: "#", block: { open: "/*", close: "*/" } } },
});
/** Turtle via the incremental, error-recovering lezer-turtle grammar
 * (RDF 1.2; the same parse tree that powers provenance tracking). */
const turtleLanguage = language_1.LRLanguage.define({ parser: lezer_turtle_1.parser.configure({ dialect: "trig" }) }); // doc/datasets.md
/** Shape maps (the query map pane): nodes and shapes as ShExC and Turtle
 * write terms, `@` with a status between each pair's two sides, `{FOCUS
 * ...}` triple patterns, a reason and appinfo after.  Approximate, like the
 * ShExC tokenizer; the parser's diagnostics are the truth. */
exports.shapeMapStreamParser = {
    name: "shapemap",
    startState: () => ({ inString: null }),
    token(stream, state) {
        if (state.inString) {
            while (!stream.eol()) {
                if (stream.match(state.inString)) {
                    state.inString = null;
                    break;
                }
                if (stream.next() === "\\")
                    stream.next();
            }
            return "string";
        }
        if (stream.eatSpace())
            return null;
        if (stream.match(/^#.*/))
            return "comment";
        if (stream.match(/^<[^<>"{}|^`\\ ]*>/))
            return "link";
        if (stream.match(/^('''|""")/)) {
            state.inString = stream.current();
            return "string";
        }
        if (stream.match(/^"(?:[^"\\\n]|\\.)*"/) || stream.match(/^'(?:[^'\\\n]|\\.)*'/)) {
            stream.match(/^\^\^/) || stream.match(/^@[a-zA-Z-]+/);
            return "string";
        }
        // the shape side: @shape, @START, or a bare @ with a status to follow
        if (stream.match(/^@(?:START\b|<[^>]*>|[A-Za-z_][A-Za-z0-9_.-]*:[A-Za-z0-9_.:%\\-]*)/i))
            return "typeName";
        if (stream.match(/^@/))
            return "operator";
        if (stream.match(/^(?:START|FOCUS|SPARQL)\b/i))
            return "keyword";
        if (stream.match(/^\$\s*appinfo\s*:/i))
            return "meta";
        if (stream.match(/^_:[A-Za-z0-9_.-]+/))
            return "variableName"; // blank node
        if (stream.match(/^[A-Za-z_][A-Za-z0-9_.-]*:[A-Za-z0-9_.:%\\-]*/))
            return "variableName"; // pname
        if (stream.match(/^(?:true|false|null)\b/))
            return "atom";
        if (stream.match(/^[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/))
            return "number";
        if (stream.match(/^[!?]/))
            return "operator"; // status
        if (stream.match(/^[{}[\],/_]/))
            return "punctuation";
        stream.next();
        return null;
    },
};
exports.languages = {
    shexc: () => shexcLanguage,
    turtle: () => turtleLanguage,
    json: () => (0, lang_json_1.json)(),
    shapemap: () => language_1.StreamLanguage.define(exports.shapeMapStreamParser),
};
/** paintedLike - dress a pane in an element's colours, so an editor looks
 * like the thing it stands in for (or, for a result pane, like the place it
 * is put).  An element nobody painted contributes nothing rather than
 * painting a pane transparent. */
function paintedLike(elt) {
    const dressed = window.getComputedStyle(elt);
    const background = dressed.backgroundColor;
    const foreground = dressed.color;
    if (!background || /^(transparent|rgba\(0, 0, 0, 0\))$/.test(background))
        return [];
    return [view_1.EditorView.theme({
            "&": { backgroundColor: background, color: foreground },
            // the gutter reads as part of the pane, edged rather than shaded
            ".cm-gutters": { backgroundColor: background, color: foreground,
                border: "none", borderRight: "1px solid rgba(0, 0, 0, 0.1)" },
            ".cm-activeLineGutter": { backgroundColor: "rgba(0, 0, 0, 0.05)" },
            ".cm-activeLine": { backgroundColor: "rgba(0, 0, 0, 0.03)" },
        })];
}
/** makeResultPane - a read-only, syntax-highlighted view of a result
 * document (validation results as JSON, a materialized graph as Turtle)
 * sharing the highlight machinery of editor panes: highlight(ranges, cls,
 * {scroll}) marks and scrolls to result regions; setHoverRegions supports
 * results → schema/data cross-highlighting. */
function makeResultPane(text, language = "json", opts = {}) {
    // a result pane replaces no textarea, so it has no colours of its own to
    // inherit; the host says what it should look like by handing over an
    // element it has styled (and attached, or there is nothing to compute)
    const dressing = opts.colorsFrom ? paintedLike(opts.colorsFrom) : [];
    const view = new view_1.EditorView({ doc: text, extensions: [
            codemirror_1.basicSetup,
            exports.languages[language](),
            highlightField,
            annotationField,
            tooltipField,
            paneTheme,
            ...dressing,
            view_1.EditorView.editable.of(false),
            state_1.EditorState.readOnly.of(true),
        ] });
    view.dom.classList.add("shexjs-editor-pane", "shexjs-" + language + "-pane");
    const setHoverRegions = attachHoverRegions(view);
    const clampRange = (r) => !!r && r.from >= 0 && r.to <= view.state.doc.length && r.to > r.from;
    return {
        dom: view.dom,
        requestMeasure() { view.requestMeasure(); },
        scrollTo(pos) {
            const at = Math.max(0, Math.min(pos, view.state.doc.length));
            view.dispatch({ effects: view_1.EditorView.scrollIntoView(at, { y: "start" }) });
        },
        highlight(ranges, cls = "shexjs-highlight", opts = {}) {
            // kept in the order given: Decoration.set sorts what it needs sorted,
            // and the caller's order is what says where to scroll
            const inRange = (ranges || []).filter(clampRange);
            const decos = [].concat(...inRange.map(r => textRanges(view, r)))
                .map((r) => view_1.Decoration.mark({ class: cls }).range(r.from, r.to));
            view.dispatch({ effects: setHighlightsEffect.of(view_1.Decoration.set(decos, true)) });
            if (inRange.length && opts.scroll !== false)
                view.dispatch({ effects: view_1.EditorView.scrollIntoView(inRange[0].from, { y: "center" }) });
        },
        clearHighlights() {
            view.dispatch({ effects: setHighlightsEffect.of(view_1.Decoration.none) });
        },
        annotate(marks) { annotateOn(view, marks); },
        setHoverRegions,
    };
}
/** makeJsonPane - makeResultPane's original JSON-only spelling */
function makeJsonPane(text, opts = {}) {
    return makeResultPane(text, "json", opts);
}
/** onText - is this mouse position over text, or past the end of a line?
 *
 * posAtCoords answers with a document offset for anywhere in the content,
 * so a mouse in the comment column to the right of a short line reports
 * that line's end -- which sits *inside* any range that spans the line.
 * A range is about text, so a position with no text under it is a miss.
 */
function onText(view, x, y, pos) {
    const line = view.state.doc.lineAt(pos);
    const end = view.coordsAtPos(line.to);
    const start = view.coordsAtPos(line.from);
    if (!end || !start)
        return true; // nothing measured (jsdom): don't guess
    return x <= end.right && x >= start.left && y >= start.top && y <= end.bottom;
}
/** textRanges - a highlight, line by line, over the text it covers.
 *
 * A range that spans lines is one range, but painting it as one paints the
 * indentation of every line after the first -- and, where the pane is wider
 * than the text, everything to the right as well.  Splitting it per line and
 * dropping each line's leading whitespace marks what was written instead of
 * the rectangle it was written in.
 */
function textRanges(view, range) {
    const doc = view.state.doc;
    const first = doc.lineAt(range.from), last = doc.lineAt(range.to);
    if (first.number === last.number)
        return [range];
    const out = [];
    for (let n = first.number; n <= last.number; ++n) {
        const line = doc.line(n);
        const from = Math.max(range.from, line.from + (line.text.match(/^\s*/) || [""])[0].length);
        const to = Math.min(range.to, line.to);
        if (to > from)
            out.push({ from, to });
    }
    return out;
}
/** track mouse-over-sensitive ranges on a view; returns the function that
 * replaces the region set (the makePane/makeResultPane setHoverRegions API) */
function attachHoverRegions(view) {
    let hoverRegions = [];
    let hoverLeave;
    let currentRegion = null;
    const clearHover = () => {
        if (currentRegion) {
            currentRegion = null;
            regionTooltip(view, null);
            if (hoverLeave)
                hoverLeave();
        }
    };
    view.contentDOM.addEventListener("mousemove", (e) => {
        const pos = view.posAtCoords({ x: e.clientX, y: e.clientY });
        // smallest containing region wins: nested constructs (inline shapes,
        // bnode property lists) sit inside their parents' regions
        const hit = pos === null || !onText(view, e.clientX, e.clientY, pos) ? null
            : hoverRegions.reduce((best, r) => pos >= r.from && pos < r.to && (!best || r.to - r.from < best.to - best.from)
                ? r : best, null);
        if (hit !== currentRegion) {
            currentRegion = hit;
            regionTooltip(view, hit);
            if (hit)
                hit.enter();
            else if (hoverLeave)
                hoverLeave();
        }
    });
    view.contentDOM.addEventListener("mouseleave", clearHover);
    /* A click on a region is how a reader says "keep showing me this".
     *
     * In the *capture* phase, and stopped dead when the region claims it.  The
     * editor installs its own mousedown handler when the view is built, which
     * is before this one, so bubbling here would arrive after CodeMirror had
     * already moved the caret -- and a modified click moves it by *extending*
     * the selection, which is why pinning used to highlight everything between
     * the old cursor and the click.  preventDefault after the fact undoes none
     * of that; not letting the editor see it does.
     */
    const clickRegions = (e) => {
        if (e.button !== 0)
            return;
        const pos = view.posAtCoords({ x: e.clientX, y: e.clientY });
        if (pos === null || !onText(view, e.clientX, e.clientY, pos))
            return;
        const hit = hoverRegions.reduce((best, r) => r.click && pos >= r.from && pos < r.to && (!best || r.to - r.from < best.to - best.from)
            ? r : best, null);
        if (!hit || !hit.click)
            return;
        if (hit.click(e) === false)
            return; // not this gesture: an ordinary click
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    };
    view.contentDOM.addEventListener("mousedown", clickRegions, true);
    // ctrl-click raises a context menu on a Mac even when the mousedown was
    // swallowed, so the same gesture has to be refused here too
    view.contentDOM.addEventListener("contextmenu", (e) => {
        if (!(e.ctrlKey || e.metaKey))
            return;
        const pos = view.posAtCoords({ x: e.clientX, y: e.clientY });
        if (pos === null)
            return;
        if (hoverRegions.some(r => r.click && pos >= r.from && pos < r.to))
            e.preventDefault();
    }, true);
    return (regions, leave) => {
        // replacing the region set while one of its regions is hovered would
        // strand that region's highlights: with currentRegion nulled, the next
        // mousemove over empty space compares null === null and no leave fires
        clearHover();
        hoverRegions = regions || [];
        hoverLeave = leave;
        currentRegion = null;
    };
}
// ---------------------------------------------------------------------------
// range highlights (shape-map hover, error-pair flashes)
const setHighlightsEffect = state_1.StateEffect.define();
const highlightField = state_1.StateField.define({
    create: () => view_1.Decoration.none,
    update(deco, tr) {
        deco = deco.map(tr.changes);
        for (const e of tr.effects)
            if (e.is(setHighlightsEffect))
                deco = e.value;
        return deco;
    },
    provide: f => view_1.EditorView.decorations.from(f),
});
/** A second, independent decoration layer.
 *
 * Highlights belong to the mouse: every hover replaces the whole set and
 * leaving clears it.  An annotation is a statement about the document that
 * stays until it is withdrawn -- which bindings a materializer thread has
 * consumed, say, which a reader wants to keep seeing while they hover
 * around the panes comparing them.
 */
const setAnnotationsEffect = state_1.StateEffect.define();
const annotationField = state_1.StateField.define({
    create: () => view_1.Decoration.none,
    update(deco, tr) {
        deco = deco.map(tr.changes);
        for (const e of tr.effects)
            if (e.is(setAnnotationsEffect))
                deco = e.value;
        return deco;
    },
    provide: f => view_1.EditorView.decorations.from(f),
});
/** the shared body of Pane.annotate; see the interface */
function annotateOn(view, marks) {
    const end = view.state.doc.length;
    const decos = (marks || [])
        .filter(m => m && m.to > m.from && m.from >= 0 && m.to <= end)
        .sort((a, b) => a.from - b.from)
        .map(m => view_1.Decoration.mark({
        class: m.cls || "shexjs-annotation",
        attributes: m.title ? { title: m.title } : undefined,
    }).range(m.from, m.to));
    view.dispatch({ effects: setAnnotationsEffect.of(view_1.Decoration.set(decos, true)) });
}
/** The tooltip a hover region asked for (HoverRegion.title): one at a time,
 * shown while the mouse is in the region and withdrawn when it leaves.  An
 * edit withdraws it too -- it was about text that has moved. */
const setTooltipEffect = state_1.StateEffect.define();
const tooltipField = state_1.StateField.define({
    create: () => null,
    update(tip, tr) {
        if (tr.docChanged)
            tip = null;
        for (const e of tr.effects)
            if (e.is(setTooltipEffect))
                tip = e.value;
        return tip;
    },
    provide: f => view_1.showTooltip.from(f),
});
/** show what a region has to say, or (null) take it back */
function regionTooltip(view, region) {
    if (view.state.field(tooltipField, false) === undefined)
        return;
    let text = null;
    if (region && region.title) {
        try {
            text = typeof region.title === "function" ? region.title() : region.title;
        }
        catch (e) {
            text = null; // a host's bug must not break hovering
        }
    }
    if (!text && !view.state.field(tooltipField))
        return;
    view.dispatch({ effects: setTooltipEffect.of(!text ? null : {
            pos: region.from,
            end: region.to,
            above: true,
            create: () => {
                const dom = document.createElement("div");
                dom.className = "shexjs-tooltip";
                dom.textContent = text;
                return { dom };
            },
        }) });
}
const paneTheme = view_1.EditorView.baseTheme({
    // Transparent to the mouse: a tall tooltip (a multi-line schema
    // production) can be flipped below the hovered line, under the pointer --
    // hit-testing must pass through it, or contentDOM sees a mouseleave, the
    // hover clears the tooltip, the pointer is back on the text, and the
    // tooltip flickers in and out.  It is plain text shown only while the
    // mouse stays, so it was never clickable anyway.
    ".cm-tooltip.shexjs-tooltip": { whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "12px",
        padding: "2px 6px", maxWidth: "48em", backgroundColor: "#ffffe8",
        border: "1px solid #bbb", pointerEvents: "none" },
    ".shexjs-annotation": { borderBottom: "2px solid #7a86c8" },
    ".shexjs-binding-consumed": { backgroundColor: "#e6f0d8", borderBottom: "2px solid #6a9a3a" },
    ".shexjs-binding-cursor": { borderBottom: "2px dashed #a8620a" },
    ".shexjs-highlight": { backgroundColor: "#fff3b0" },
    ".shexjs-highlight-match": { backgroundColor: "#c8f0c8" },
    ".shexjs-highlight-fail": { backgroundColor: "#ffcdcd" },
    ".shexjs-debug-current": { backgroundColor: "#cfe3ff" },
    "&": { border: "1px solid #ddd", fontSize: "13px",
        resize: "vertical", overflow: "hidden" }, // user-resizable, like a textarea
    ".cm-scroller": { overflow: "auto" },
    "&.cm-focused": { outline: "none", borderColor: "#88f" },
    ".shexjs-breakpoint-gutter": { width: "1em", cursor: "pointer" },
    ".shexjs-breakpoint-gutter .cm-gutterElement": { color: "#c22", paddingLeft: "2px" },
});
// ---------------------------------------------------------------------------
// breakpoint gutter (debugger; see doc/debugger-design.md)
const breakpointEffect = state_1.StateEffect.define();
const breakpointMarker = new class extends view_1.GutterMarker {
    toDOM() { return document.createTextNode("●"); }
};
const breakpointField = state_1.StateField.define({
    create: () => state_1.RangeSet.empty,
    update(set, tr) {
        set = set.map(tr.changes);
        for (const e of tr.effects)
            if (e.is(breakpointEffect))
                set = e.value.on
                    ? set.update({ add: [breakpointMarker.range(e.value.pos)] })
                    : set.update({ filter: from => from !== e.value.pos });
        return set;
    },
});
function toggleBreakpoint(view, pos) {
    let on = false;
    view.state.field(breakpointField).between(pos, pos, () => { on = true; });
    view.dispatch({ effects: breakpointEffect.of({ pos, on: !on }) });
}
const breakpointExtension = [
    breakpointField,
    (0, view_1.gutter)({
        class: "shexjs-breakpoint-gutter",
        markers: view => view.state.field(breakpointField),
        initialSpacer: () => breakpointMarker,
        domEventHandlers: {
            mousedown(view, line) {
                toggleBreakpoint(view, line.from);
                return true;
            },
        },
    }),
];
// ---------------------------------------------------------------------------
function lintSourceFor(language, opts) {
    switch (language) {
        case "shexc":
            // the schema pane holds ShExC, or ShExJ, ShExR or a DCTAP table: each
            // is linted in its own language (see lintSchema)
            return view => EditorServices.lintSchema(view.state.doc.toString(), { base: opts.getBase ? opts.getBase() : undefined });
        case "shapemap":
            return view => EditorServices.parseShapeMap(view.state.doc.toString(), opts.shapeMap ? opts.shapeMap() : { base: opts.getBase ? opts.getBase() : undefined }).diagnostics;
        case "turtle":
            return view => EditorServices.parseTurtle(view.state.doc.toString(), { baseIRI: opts.getBase ? opts.getBase() : undefined }).diagnostics;
        case "json":
            return (0, lang_json_1.jsonParseLinter)();
        default:
            return null;
    }
}
// ---------------------------------------------------------------------------
// module-supplied languages
//
// A neighborhood module describes its text as plain functions over plain
// strings (tokens, lint, complete); these adapters are the only place that
// description meets an editor library.
/** Styles a supplied tokenizer can ask for.  The names are the ones
 * CodeMirror's own stream parsers use, so a module that grows into a real
 * StreamParser keeps its vocabulary. */
const suppliedTokenTheme = view_1.EditorView.baseTheme({
    ".shexjs-tok-keyword": { color: "#708" },
    ".shexjs-tok-link": { color: "#219", textDecoration: "underline" },
    ".shexjs-tok-string": { color: "#a11" },
    ".shexjs-tok-comment": { color: "#940", fontStyle: "italic" },
    ".shexjs-tok-number": { color: "#164" },
    ".shexjs-tok-variableName": { color: "#00c" },
    ".shexjs-tok-typeName": { color: "#085" },
    ".shexjs-tok-invalid": { color: "#f00", textDecoration: "underline wavy #f00" },
});
/** Recompute a supplied tokenizer's decorations whenever the document
 * changes.  Whole-document rather than incremental: what modules describe
 * are header lines, and their real body language (`language: "turtle"`) is
 * still parsed incrementally by the grammar underneath. */
function suppliedTokensExtension(getSupplied, getContext) {
    const compute = (doc) => {
        const supplied = getSupplied(doc);
        if (!supplied || !supplied.tokens)
            return view_1.Decoration.none;
        let tokens;
        try {
            tokens = supplied.tokens(doc, getContext()) || [];
        }
        catch (e) {
            return view_1.Decoration.none; // a module's bug must not break editing
        }
        const marks = tokens
            .filter(t => t.from >= 0 && t.to > t.from && t.to <= doc.length)
            .sort((l, r) => l.from - r.from)
            .map(t => view_1.Decoration.mark({ class: "shexjs-tok-" + t.style }).range(t.from, t.to));
        return view_1.Decoration.set(marks, true);
    };
    const field = state_1.StateField.define({
        create: state => compute(state.doc.toString()),
        update: (deco, tr) => tr.docChanged ? compute(tr.state.doc.toString()) : deco,
        provide: f => view_1.EditorView.decorations.from(f),
    });
    return [field, suppliedTokenTheme];
}
/** A CodeMirror completion source over a supplied editor's `complete`. */
function suppliedCompletionSource(getSupplied, getContext) {
    return (context) => {
        const text = context.state.doc.toString();
        const supplied = getSupplied(text);
        if (!supplied || !supplied.complete)
            return null;
        let result;
        try {
            result = supplied.complete(text, context.pos, getContext());
        }
        catch (e) {
            return null;
        }
        if (!result || result.options.length === 0)
            return null;
        return { from: result.from, to: result.to, options: result.options };
    };
}
/** Is there a language here to build an editor from?  A module that
 * describes none gets no pane -- see makePaneIfDescribed. */
function describesALanguage(opts, text) {
    if (opts.language)
        return true;
    const supplied = opts.supplied ? opts.supplied(text) : null;
    return !!supplied &&
        !!(supplied.language || supplied.tokens || supplied.lint || supplied.complete);
}
/** makePane, unless nothing describes the text's language -- then null, and
 * the textarea is left exactly as it is.
 *
 * This is the fallback for a host whose panes take their language from
 * whatever module claims their text: a module that describes no language
 * costs the user nothing but the plain textarea they would have had with
 * the editors switched off.  Implementing getNeighborhood stays the only
 * obligation; an editor is a thing a module may offer, not owe.
 */
function makePaneIfDescribed(textarea, opts = {}) {
    return describesALanguage(opts, textarea.value) ? makePane(textarea, opts) : null;
}
/** makePane - replace `textarea` with a CodeMirror 6 editor. */
exports.CHANGE_DEBOUNCE_MS = 350;
/** marks a document change made by the application (a write through the
 * textarea proxy) rather than by the user, so the pane doesn't report it as
 * a typing pause -- see the updateListener in makePane */
const appEdit = state_1.Annotation.define();
function makePane(textarea, opts = {}) {
    const nativeValue = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(textarea).constructor.prototype, "value")
        || Object.getOwnPropertyDescriptor(textarea, "value");
    let changeTimer = null;
    const extensions = [
        codemirror_1.basicSetup,
        (0, lint_1.lintGutter)(),
        breakpointExtension,
        highlightField,
        annotationField,
        tooltipField,
        paneTheme,
        view_1.EditorView.updateListener.of(update => {
            if (update.docChanged) {
                nativeValue.set.call(textarea, update.state.doc.toString());
                // "keyup" fires immediately, for writes through the proxy too: the
                // apps' cache dirty-tracking listens for it, and a stale cache means
                // validate ignores the new text (setTextAreaHandlers).
                const KeyboardEventCtor = typeof KeyboardEvent !== "undefined" ? KeyboardEvent : Event;
                textarea.dispatchEvent(new KeyboardEventCtor("keyup", { bubbles: true }));
                // "change" is debounced to typing pauses: a textarea fires it on
                // blur, and per-keystroke change handlers re-parse half-typed
                // documents (e.g. an unclosed quote swallowing following lines).
                // It says "the user stopped typing", so a write through the proxy
                // must not raise it -- assigning to a plain textarea's value fires
                // no change either, and handlers that react to one discard work the
                // application did meanwhile: dataInputHandler's copyQueryMapToEditMap
                // clears #results, wiping a materialization rendered since.  Any
                // pending change from a real edit still stands: the application
                // replacing the text does not mean the user's edit went unmade.
                if (update.transactions.every(tr => tr.annotation(appEdit)))
                    return;
                if (changeTimer !== null)
                    clearTimeout(changeTimer);
                changeTimer = setTimeout(() => {
                    changeTimer = null;
                    textarea.dispatchEvent(new Event("change", { bubbles: true }));
                }, exports.CHANGE_DEBOUNCE_MS);
            }
        }),
    ];
    // a module-supplied language names the grammar (when it's one of ours)
    // and overlays its own tokens, diagnostics and completions on it
    const getSupplied = opts.supplied || ((_text) => null);
    const getSuppliedContext = opts.suppliedContext || (() => undefined);
    const supplied = getSupplied(textarea.value);
    const language = opts.language
        || (supplied && exports.languages[supplied.language] ? supplied.language : undefined);
    if (language === "shexc" || language === "turtle" || language === "shapemap") {
        const lang = language === "shexc" ? shexcLanguage
            : language === "shapemap" ? language_1.StreamLanguage.define(exports.shapeMapStreamParser)
                : turtleLanguage;
        extensions.push(lang);
        const autocompletes = [];
        if (opts.completions) // basicSetup's autocompletion() reads languageData
            autocompletes.push(completionSource(opts.completions));
        if (opts.supplied)
            autocompletes.push(suppliedCompletionSource(getSupplied, getSuppliedContext));
        for (const autocomplete of autocompletes)
            extensions.push(lang.data.of({ autocomplete }));
    }
    else if (language && exports.languages[language]) {
        extensions.push(exports.languages[language]());
    }
    if (opts.supplied) {
        extensions.push(suppliedTokensExtension(getSupplied, getSuppliedContext));
        if (!language)
            // no grammar to hang languageData on
            extensions.push((0, autocomplete_1.autocompletion)({ override: [suppliedCompletionSource(getSupplied, getSuppliedContext)] }));
    }
    const langLintSource = opts.lint === false ? null : lintSourceFor(language, opts);
    const lintSource = opts.lint === false ? null : (view => {
        const fromLanguage = langLintSource ? langLintSource(view) : [];
        const text = view.state.doc.toString();
        const current = getSupplied(text);
        if (!current || !current.lint)
            return fromLanguage;
        let mine = [];
        try {
            mine = current.lint(text, getSuppliedContext()) || [];
        }
        catch (e) { /* a module's bug must not break editing */ }
        return Promise.resolve(fromLanguage).then(diagnostics => diagnostics.concat(mine.filter(d => d.from >= 0 && d.to >= d.from && d.to <= view.state.doc.length)));
    });
    if (lintSource && (langLintSource || opts.supplied))
        extensions.push((0, lint_1.linter)(lintSource, { delay: 500 }));
    // A pane stands where a textarea stood, and the application coloured that
    // textarea to say what it holds -- the schema pane blue, the data pane
    // green.  Take the colours with it rather than turning the pane white:
    // the editors are a nicer way to show the same thing, not a different
    // thing.  Read before hiding it, and only believe a real colour (jsdom
    // and an unstyled page report none).
    extensions.push(...paintedLike(textarea));
    const view = new view_1.EditorView({ doc: textarea.value, extensions });
    view.dom.classList.add("shexjs-editor-pane");
    // match the textarea's rendered size (measured before it's hidden); fall
    // back to its rows attribute where there's no layout (e.g. jsdom)
    view.dom.style.width = textarea.offsetWidth ? textarea.offsetWidth + "px"
        : (textarea.style.width || "100%");
    // ...and its height, unless the box it goes into says otherwise: a pane
    // in a column that fills the page takes the column's height, where a
    // pixel height measured from the textarea would hold it to the rows the
    // textarea asked for (shex-app.css: #schemaDocument, .fillsColumn)
    const box = textarea.parentNode;
    const styles = box && box.ownerDocument && box.ownerDocument.defaultView;
    const fills = !!(styles && styles.getComputedStyle
        && styles.getComputedStyle(box).flexDirection === "column");
    view.dom.style.height =
        fills ? ""
            : textarea.offsetHeight ? textarea.offsetHeight + "px"
                : `calc(${textarea.rows || 20} * 1.4em)`;
    textarea.parentNode.insertBefore(view.dom, textarea);
    textarea.style.display = "none";
    // hover regions (validation match/failure cross-highlighting)
    const setHoverRegions = attachHoverRegions(view);
    // live proxy: application code keeps talking to the textarea
    Object.defineProperty(textarea, "value", {
        configurable: true,
        get: () => view.state.doc.toString(),
        set: (v) => {
            const text = String(v == null ? "" : v);
            nativeValue.set.call(textarea, text);
            if (text !== view.state.doc.toString())
                view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text },
                    annotations: appEdit.of(true) });
        },
    });
    const clampRange = (r) => r !== null && r.to > r.from && r.to <= view.state.doc.length;
    return {
        view,
        textarea,
        language: opts.language,
        setDiagnostics(diagnostics) {
            view.dispatch((0, lint_1.setDiagnostics)(view.state, diagnostics.filter(d => d.to >= d.from && d.to <= view.state.doc.length)));
        },
        highlight(ranges, cls = "shexjs-highlight", opts = {}) {
            const inRange = (ranges || []).filter(clampRange); // caller's order: see highlight()
            const decos = [].concat(...inRange.map(r => textRanges(view, r)))
                .map((r) => view_1.Decoration.mark({ class: cls }).range(r.from, r.to));
            view.dispatch({ effects: setHighlightsEffect.of(view_1.Decoration.set(decos, true)) });
            if (inRange.length && opts.scroll !== false)
                view.dispatch({ effects: view_1.EditorView.scrollIntoView(inRange[0].from) });
        },
        clearHighlights() {
            view.dispatch({ effects: setHighlightsEffect.of(view_1.Decoration.none) });
        },
        annotate(marks) { annotateOn(view, marks); },
        setHoverRegions,
        requestMeasure() { view.requestMeasure(); },
        listBreakpoints() {
            const positions = [];
            view.state.field(breakpointField).between(0, view.state.doc.length, from => { positions.push(from); });
            return positions;
        },
        toggleBreakpoint(pos) {
            toggleBreakpoint(view, view.state.doc.lineAt(pos).from);
        },
        toggleBreakpointAt(pos) {
            toggleBreakpoint(view, Math.max(0, Math.min(pos, view.state.doc.length)));
        },
        destroy() {
            if (changeTimer !== null) {
                clearTimeout(changeTimer);
                changeTimer = null;
            }
            const text = view.state.doc.toString();
            delete textarea.value; // restore the prototype accessor
            textarea.value = text;
            textarea.style.display = "";
            view.destroy();
            view.dom.remove();
        },
    };
}
//# sourceMappingURL=editor-panes.js.map