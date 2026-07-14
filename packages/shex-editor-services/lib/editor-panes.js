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
exports.languages = exports.shexcStreamParser = void 0;
exports.makePane = makePane;
const codemirror_1 = require("codemirror");
const view_1 = require("@codemirror/view");
const state_1 = require("@codemirror/state");
const language_1 = require("@codemirror/language");
const lint_1 = require("@codemirror/lint");
const lang_json_1 = require("@codemirror/lang-json");
const turtle_1 = require("@codemirror/legacy-modes/mode/turtle");
const EditorServices = __importStar(require("./editor-services"));
const shexcKeywords = /^(?:PREFIX|BASE|IMPORT|START|EXTERNAL|ABSTRACT|CLOSED|EXTRA|NOT|AND|OR|IF|MININCLUSIVE|MAXINCLUSIVE|MINEXCLUSIVE|MAXEXCLUSIVE|LENGTH|MINLENGTH|MAXLENGTH|TOTALDIGITS|FRACTIONDIGITS|IRI|BNODE|NONLITERAL|LITERAL)\b/i;
exports.shexcStreamParser = {
    name: "shexc",
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
            return "link"; // IRIs
        if (stream.match(/^('''|""")/)) {
            state.inString = stream.current();
            return "string";
        }
        if (stream.match(/^"(?:[^"\\\n]|\\.)*"/) || stream.match(/^'(?:[^'\\\n]|\\.)*'/)) {
            stream.match(/^\^\^/) || stream.match(/^@[a-zA-Z-]+/);
            return "string";
        }
        if (stream.match(/^@[A-Za-z_][A-Za-z0-9_.-]*:?[^\s;|)}?*+]*/))
            return "typeName"; // @<shapeRef>, @pname
        if (stream.match(/^@</)) {
            stream.match(/^[^>]*>/);
            return "typeName";
        }
        if (stream.match(shexcKeywords))
            return "keyword";
        if (stream.match(/^(?:true|false)\b/))
            return "atom";
        if (stream.match(/^[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/))
            return "number";
        if (stream.match(/^\{\s*\d+\s*(?:,\s*(?:\d+|\*)?\s*)?\}/))
            return "number"; // {m,n}
        if (stream.match(/^%[^%]*/))
            return "meta"; // semantic actions
        if (stream.match(/^[A-Za-z_][A-Za-z0-9_.-]*:[A-Za-z0-9_.:%\\-]*/))
            return "variableName"; // pname
        if (stream.match(/^a\b/))
            return "keyword";
        if (stream.match(/^[*+?]/))
            return "number"; // cardinalities
        if (stream.match(/^[$&^]/))
            return "operator";
        stream.next();
        return null;
    },
};
exports.languages = {
    shexc: () => language_1.StreamLanguage.define(exports.shexcStreamParser),
    turtle: () => language_1.StreamLanguage.define(turtle_1.turtle),
    json: () => (0, lang_json_1.json)(),
};
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
const paneTheme = view_1.EditorView.baseTheme({
    ".shexjs-highlight": { backgroundColor: "#fff3b0" },
    ".shexjs-highlight-pair": { backgroundColor: "#ffd6d6" },
    "&": { border: "1px solid #ddd", fontSize: "13px" },
    "&.cm-focused": { outline: "none", borderColor: "#88f" },
});
// ---------------------------------------------------------------------------
function lintSourceFor(language, opts) {
    switch (language) {
        case "shexc":
            return view => EditorServices.parseShExC(view.state.doc.toString(), { base: opts.getBase ? opts.getBase() : undefined }).diagnostics;
        case "turtle":
            return view => EditorServices.parseTurtle(view.state.doc.toString(), { baseIRI: opts.getBase ? opts.getBase() : undefined }).diagnostics;
        case "json":
            return (0, lang_json_1.jsonParseLinter)();
        default:
            return null;
    }
}
/** makePane - replace `textarea` with a CodeMirror 6 editor. */
function makePane(textarea, opts = {}) {
    const nativeValue = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(textarea).constructor.prototype, "value")
        || Object.getOwnPropertyDescriptor(textarea, "value");
    const extensions = [
        codemirror_1.basicSetup,
        (0, lint_1.lintGutter)(),
        highlightField,
        paneTheme,
        view_1.EditorView.updateListener.of(update => {
            if (update.docChanged) {
                nativeValue.set.call(textarea, update.state.doc.toString());
                // "change" for handlers that react to new content; "keyup" because
                // the apps' cache dirty-tracking listens for typing (a stale cache
                // means validate ignores the edit)
                textarea.dispatchEvent(new Event("change", { bubbles: true }));
                textarea.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
            }
        }),
    ];
    if (opts.language && exports.languages[opts.language])
        extensions.push(exports.languages[opts.language]());
    const lintSource = opts.lint === false ? null : lintSourceFor(opts.language, opts);
    if (lintSource)
        extensions.push((0, lint_1.linter)(lintSource, { delay: 500 }));
    const view = new view_1.EditorView({ doc: textarea.value, extensions });
    view.dom.classList.add("shexjs-editor-pane");
    textarea.parentNode.insertBefore(view.dom, textarea);
    textarea.style.display = "none";
    // live proxy: application code keeps talking to the textarea
    Object.defineProperty(textarea, "value", {
        configurable: true,
        get: () => view.state.doc.toString(),
        set: (v) => {
            const text = String(v == null ? "" : v);
            nativeValue.set.call(textarea, text);
            if (text !== view.state.doc.toString())
                view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text } });
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
        highlight(ranges, cls = "shexjs-highlight") {
            const inRange = (ranges || []).filter(clampRange).sort((a, b) => a.from - b.from);
            const decos = inRange.map(r => view_1.Decoration.mark({ class: cls }).range(r.from, r.to));
            view.dispatch({ effects: setHighlightsEffect.of(view_1.Decoration.set(decos, true)) });
            if (inRange.length)
                view.dispatch({ effects: view_1.EditorView.scrollIntoView(inRange[0].from) });
        },
        clearHighlights() {
            view.dispatch({ effects: setHighlightsEffect.of(view_1.Decoration.none) });
        },
        destroy() {
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