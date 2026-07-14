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

import {basicSetup} from "codemirror";
import {EditorView, Decoration, DecorationSet} from "@codemirror/view";
import {StateField, StateEffect, Extension} from "@codemirror/state";
import {StreamLanguage, StreamParser} from "@codemirror/language";
import {linter, setDiagnostics, lintGutter, LintSource} from "@codemirror/lint";
import {json, jsonParseLinter} from "@codemirror/lang-json";
import {turtle} from "@codemirror/legacy-modes/mode/turtle";
import * as EditorServices from "./editor-services";
import {Diagnostic, Range} from "./editor-services";

export type PaneLanguage = "shexc" | "turtle" | "json";

export interface MakePaneOptions {
  language?: PaneLanguage;
  /** base IRI supplier for the live parsers (e.g. () => cache.meta.base) */
  getBase?: () => string | undefined;
  /** false disables live parse diagnostics */
  lint?: boolean;
}

/** a document range that reacts to the mouse entering it */
export interface HoverRegion extends Range {
  enter (): void;
}

export interface Pane {
  view: EditorView;
  textarea: HTMLTextAreaElement;
  language?: PaneLanguage;
  /** diagnostics: editor-services format ({from, to, severity, message}) */
  setDiagnostics (diagnostics: Diagnostic[]): void;
  /** highlight ranges with an optional CSS class; scroll: bring the first
   * range into view (default true -- pass false when the user's mouse is in
   * this pane) */
  highlight (ranges: Range[], cls?: string, opts?: {scroll?: boolean}): void;
  clearHighlights (): void;
  /** replace the set of mouse-over-sensitive ranges; `leave` fires when the
   * mouse leaves them all */
  setHoverRegions (regions: HoverRegion[], leave?: () => void): void;
  /** remove the editor and restore the textarea (with the current text) */
  destroy (): void;
}

// ---------------------------------------------------------------------------
// ShExC stream tokenizer: approximate colors; semantic truth (diagnostics,
// shape/error ranges) comes from the real parser via editor-services.

interface ShExCState {
  inString: string | null;
}

const shexcKeywords = /^(?:PREFIX|BASE|IMPORT|START|EXTERNAL|ABSTRACT|CLOSED|EXTRA|NOT|AND|OR|IF|MININCLUSIVE|MAXINCLUSIVE|MINEXCLUSIVE|MAXEXCLUSIVE|LENGTH|MINLENGTH|MAXLENGTH|TOTALDIGITS|FRACTIONDIGITS|IRI|BNODE|NONLITERAL|LITERAL)\b/i;

export const shexcStreamParser: StreamParser<ShExCState> = {
  name: "shexc",
  startState: () => ({inString: null}),
  token (stream, state) {
    if (state.inString) {
      while (!stream.eol()) {
        if (stream.match(state.inString)) { state.inString = null; break; }
        if (stream.next() === "\\") stream.next();
      }
      return "string";
    }
    if (stream.eatSpace()) return null;
    if (stream.match(/^#.*/)) return "comment";
    if (stream.match(/^<[^<>"{}|^`\\ ]*>/)) return "link"; // IRIs
    if (stream.match(/^('''|""")/)) { state.inString = stream.current(); return "string"; }
    if (stream.match(/^"(?:[^"\\\n]|\\.)*"/) || stream.match(/^'(?:[^'\\\n]|\\.)*'/)) {
      stream.match(/^\^\^/) || stream.match(/^@[a-zA-Z-]+/);
      return "string";
    }
    if (stream.match(/^@[A-Za-z_][A-Za-z0-9_.-]*:?[^\s;|)}?*+]*/)) return "typeName"; // @<shapeRef>, @pname
    if (stream.match(/^@</)) { stream.match(/^[^>]*>/); return "typeName"; }
    if (stream.match(shexcKeywords)) return "keyword";
    if (stream.match(/^(?:true|false)\b/)) return "atom";
    if (stream.match(/^[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/)) return "number";
    if (stream.match(/^\{\s*\d+\s*(?:,\s*(?:\d+|\*)?\s*)?\}/)) return "number"; // {m,n}
    if (stream.match(/^%[^%]*/)) return "meta"; // semantic actions
    if (stream.match(/^[A-Za-z_][A-Za-z0-9_.-]*:[A-Za-z0-9_.:%\\-]*/)) return "variableName"; // pname
    if (stream.match(/^a\b/)) return "keyword";
    if (stream.match(/^[*+?]/)) return "number"; // cardinalities
    if (stream.match(/^[$&^]/)) return "operator";
    stream.next();
    return null;
  },
};

export const languages: {[lang in PaneLanguage]: () => Extension} = {
  shexc: () => StreamLanguage.define(shexcStreamParser),
  turtle: () => StreamLanguage.define(turtle),
  json: () => json(),
};

// ---------------------------------------------------------------------------
// range highlights (shape-map hover, error-pair flashes)

const setHighlightsEffect = StateEffect.define<DecorationSet>();
const highlightField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update (deco, tr) {
    deco = deco.map(tr.changes);
    for (const e of tr.effects)
      if (e.is(setHighlightsEffect))
        deco = e.value;
    return deco;
  },
  provide: f => EditorView.decorations.from(f),
});

const paneTheme = EditorView.baseTheme({
  ".shexjs-highlight": {backgroundColor: "#fff3b0"},
  ".shexjs-highlight-match": {backgroundColor: "#c8f0c8"},
  ".shexjs-highlight-fail": {backgroundColor: "#ffcdcd"},
  "&": {border: "1px solid #ddd", fontSize: "13px",
        resize: "vertical", overflow: "hidden"}, // user-resizable, like a textarea
  ".cm-scroller": {overflow: "auto"},
  "&.cm-focused": {outline: "none", borderColor: "#88f"},
});

// ---------------------------------------------------------------------------

function lintSourceFor (language: PaneLanguage | undefined, opts: MakePaneOptions): LintSource | null {
  switch (language) {
  case "shexc":
    return view => EditorServices.parseShExC(
      view.state.doc.toString(),
      {base: opts.getBase ? opts.getBase() : undefined}).diagnostics;
  case "turtle":
    return view => EditorServices.parseTurtle(
      view.state.doc.toString(),
      {baseIRI: opts.getBase ? opts.getBase() : undefined}).diagnostics;
  case "json":
    return jsonParseLinter();
  default:
    return null;
  }
}

/** makePane - replace `textarea` with a CodeMirror 6 editor. */
export const CHANGE_DEBOUNCE_MS = 350;

export function makePane (textarea: HTMLTextAreaElement, opts: MakePaneOptions = {}): Pane {
  const nativeValue =
        Object.getOwnPropertyDescriptor(Object.getPrototypeOf(textarea).constructor.prototype, "value")
        || Object.getOwnPropertyDescriptor(textarea, "value")!;
  let changeTimer: ReturnType<typeof setTimeout> | null = null;

  const extensions: Extension[] = [
    basicSetup,
    lintGutter(),
    highlightField,
    paneTheme,
    EditorView.updateListener.of(update => {
      if (update.docChanged) {
        nativeValue.set!.call(textarea, update.state.doc.toString());
        // "keyup" fires immediately: the apps' cache dirty-tracking listens
        // for typing (a stale cache means validate ignores the edit).
        const KeyboardEventCtor = typeof KeyboardEvent !== "undefined" ? KeyboardEvent : Event;
        textarea.dispatchEvent(new KeyboardEventCtor("keyup", {bubbles: true}));
        // "change" is debounced to typing pauses: a textarea fires it on
        // blur, and per-keystroke change handlers re-parse half-typed
        // documents (e.g. an unclosed quote swallowing following lines).
        if (changeTimer !== null)
          clearTimeout(changeTimer);
        changeTimer = setTimeout(() => {
          changeTimer = null;
          textarea.dispatchEvent(new Event("change", {bubbles: true}));
        }, CHANGE_DEBOUNCE_MS);
      }
    }),
  ];
  if (opts.language && languages[opts.language])
    extensions.push(languages[opts.language]());
  const lintSource = opts.lint === false ? null : lintSourceFor(opts.language, opts);
  if (lintSource)
    extensions.push(linter(lintSource, {delay: 500}));

  const view = new EditorView({doc: textarea.value, extensions});
  view.dom.classList.add("shexjs-editor-pane");
  // match the textarea's rendered size (measured before it's hidden); fall
  // back to its rows attribute where there's no layout (e.g. jsdom)
  view.dom.style.width = textarea.offsetWidth ? textarea.offsetWidth + "px"
    : (textarea.style.width || "100%");
  view.dom.style.height = textarea.offsetHeight ? textarea.offsetHeight + "px"
    : `calc(${textarea.rows || 20} * 1.4em)`;
  textarea.parentNode!.insertBefore(view.dom, textarea);
  textarea.style.display = "none";

  // hover regions (validation match/failure cross-highlighting)
  let hoverRegions: HoverRegion[] = [];
  let hoverLeave: (() => void) | undefined;
  let currentRegion: HoverRegion | null = null;
  const clearHover = () => {
    if (currentRegion) {
      currentRegion = null;
      if (hoverLeave)
        hoverLeave();
    }
  };
  view.contentDOM.addEventListener("mousemove", (e: MouseEvent) => {
    const pos = view.posAtCoords({x: e.clientX, y: e.clientY});
    const hit = pos === null ? null
          : hoverRegions.find(r => pos >= r.from && pos < r.to) || null;
    if (hit !== currentRegion) {
      currentRegion = hit;
      if (hit)
        hit.enter();
      else if (hoverLeave)
        hoverLeave();
    }
  });
  view.contentDOM.addEventListener("mouseleave", clearHover);

  // live proxy: application code keeps talking to the textarea
  Object.defineProperty(textarea, "value", {
    configurable: true,
    get: () => view.state.doc.toString(),
    set: (v: unknown) => {
      const text = String(v == null ? "" : v);
      nativeValue.set!.call(textarea, text);
      if (text !== view.state.doc.toString())
        view.dispatch({changes: {from: 0, to: view.state.doc.length, insert: text}});
    },
  });

  const clampRange = (r: Range | null): r is Range =>
        r !== null && r.to > r.from && r.to <= view.state.doc.length;
  return {
    view,
    textarea,
    language: opts.language,
    setDiagnostics (diagnostics: Diagnostic[]): void {
      view.dispatch(setDiagnostics(view.state, diagnostics.filter(
        d => d.to >= d.from && d.to <= view.state.doc.length)));
    },
    highlight (ranges: Range[], cls = "shexjs-highlight", opts: {scroll?: boolean} = {}): void {
      const inRange = (ranges || []).filter(clampRange).sort((a, b) => a.from - b.from);
      const decos = inRange.map(r => Decoration.mark({class: cls}).range(r.from, r.to));
      view.dispatch({effects: setHighlightsEffect.of(Decoration.set(decos, true))});
      if (inRange.length && opts.scroll !== false)
        view.dispatch({effects: EditorView.scrollIntoView(inRange[0].from)});
    },
    clearHighlights (): void {
      view.dispatch({effects: setHighlightsEffect.of(Decoration.none)});
    },
    setHoverRegions (regions: HoverRegion[], leave?: () => void): void {
      hoverRegions = regions || [];
      hoverLeave = leave;
      currentRegion = null;
    },
    destroy (): void {
      if (changeTimer !== null) {
        clearTimeout(changeTimer);
        changeTimer = null;
      }
      const text = view.state.doc.toString();
      delete (textarea as {value?: string}).value; // restore the prototype accessor
      textarea.value = text;
      textarea.style.display = "";
      view.destroy();
      view.dom.remove();
    },
  };
}
