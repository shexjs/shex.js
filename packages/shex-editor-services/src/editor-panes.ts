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
import {EditorView, Decoration, DecorationSet, gutter, GutterMarker} from "@codemirror/view";
import {StateField, StateEffect, Extension, RangeSet, EditorState, Annotation} from "@codemirror/state";
import {StreamLanguage, StreamParser, LRLanguage} from "@codemirror/language";
import {linter, setDiagnostics, lintGutter, LintSource} from "@codemirror/lint";
import {autocompletion, CompletionContext, CompletionResult, Completion} from "@codemirror/autocomplete";
import {json, jsonParseLinter} from "@codemirror/lang-json";
import {parser as lezerTurtleParser} from "lezer-turtle";
import * as EditorServices from "./editor-services";
import {Diagnostic, Range} from "./editor-services";

export type PaneLanguage = "shexc" | "turtle" | "json";

/** A language described by something that isn't this package -- a
 * neighborhood module saying how the text that configures it should be
 * edited (see ParamEditor in @shexjs/neighborhood-api).  It arrives as
 * plain functions over plain strings, because a module that implements
 * getNeighborhood must not be obliged to depend on an editor library; the
 * adapters below are what turn that description into an editor.  Repeated
 * structurally rather than imported so this package keeps its one-way
 * dependency on nothing. */
export interface SuppliedEditor {
  language?: string;
  tokens? (text: string, ctx?: any): {from: number, to: number, style: string}[];
  lint? (text: string, ctx?: any): Diagnostic[];
  complete? (text: string, pos: number, ctx?: any):
    {from: number, to?: number, options: {label: string, detail?: string, type?: string}[]} | null;
}

/** completion vocabulary, supplied live by the application */
export interface CompletionSets {
  prefixes?: {[prefix: string]: string};
  shapeLabels?: string[];
  predicates?: string[];
}

export interface MakePaneOptions {
  language?: PaneLanguage;
  /** base IRI supplier for the live parsers (e.g. () => cache.meta.base) */
  getBase?: () => string | undefined;
  /** false disables live parse diagnostics */
  lint?: boolean;
  /** enables autocomplete of prefixes, shape labels and predicates */
  completions?: () => CompletionSets;
  /** a language described from outside this package (a neighborhood
   * module's).  Its `language`, if it names one of ours, supplies the
   * grammar; its tokens/lint/complete are overlaid on top, so a module
   * whose pane is an RDF document with a header line of its own describes
   * only the header.
   *
   * Called with the text to be described, never for the host to look the
   * text up itself: which module claims a pane can change with every
   * keystroke, and a host reading it back from the textarea would be
   * answering about the document as it was before the edit -- the pane's
   * proxy still reports the old text while the transaction that changes it
   * is being applied. */
  supplied?: (text: string) => SuppliedEditor | null;
  /** context handed to the supplied editor's functions, e.g. {db} */
  suppliedContext?: () => any;
}

/** lexicalize - shortest lexical form for an IRI under the given prefixes */
export function lexicalize (iri: string, prefixes: {[prefix: string]: string}): string {
  let best: [string, string] | null = null;
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
export function completionSource (getSets: () => CompletionSets) {
  return (context: CompletionContext): CompletionResult | null => {
    const word = context.matchBefore(/@?[<A-Za-z_:][^\s;,|(){}[\]]*/);
    if (!word && !context.explicit)
      return null;
    const sets = getSets() || {};
    const prefixes = sets.prefixes || {};
    const options: Completion[] = [];
    Object.keys(prefixes).forEach(prefix =>
      options.push({label: prefix + ":", type: "namespace", detail: prefixes[prefix]}));
    (sets.shapeLabels || []).forEach(iri => {
      const lex = lexicalize(iri, prefixes);
      options.push({label: lex, type: "class", detail: "shape"});
      options.push({label: "@" + lex, type: "class", detail: "shape ref"});
    });
    (sets.predicates || []).forEach(iri =>
      options.push({label: lexicalize(iri, prefixes), type: "property"}));
    return options.length
      ? {from: word ? word.from : context.pos, options, validFor: /^@?[<A-Za-z_:][^\s]*$/}
      : null;
  };
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
  /** character offsets of gutter breakpoints (line starts) */
  listBreakpoints (): number[];
  /** toggle a gutter breakpoint at a character offset's line */
  toggleBreakpoint (pos: number): void;
  /** Re-measure the editor.
   *
   * CodeMirror measures when it is created and when its own observers fire.
   * A view built while it is not in the document, or inside something
   * hidden -- a pane behind another tab, a result pane assembled before it
   * is appended -- has nothing to measure, and what it drew from that
   * survives: most visibly a gutter with more line numbers than there are
   * lines.  A host that attaches, shows or resizes a pane says so here. */
  requestMeasure (): void;
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

/** Turtle via the incremental, error-recovering lezer-turtle grammar
 * (RDF 1.2; the same parse tree that powers provenance tracking). */
const turtleLanguage = LRLanguage.define({parser: lezerTurtleParser});

export const languages: {[lang in PaneLanguage]: () => Extension} = {
  shexc: () => StreamLanguage.define(shexcStreamParser),
  turtle: () => turtleLanguage,
  json: () => json(),
};

export interface ResultPane {
  dom: HTMLElement;
  /** re-measure after the pane has been attached, shown or resized; see
   * Pane.requestMeasure */
  requestMeasure (): void;
  /** bring a character offset to the top of the pane -- what a fragment
   * link does for a document, for a document that is inside an editor */
  scrollTo (pos: number): void;
  highlight (ranges: Range[], cls?: string, opts?: {scroll?: boolean}): void;
  clearHighlights (): void;
  setHoverRegions (regions: HoverRegion[], leave?: () => void): void;
}

/** paintedLike - dress a pane in an element's colours, so an editor looks
 * like the thing it stands in for (or, for a result pane, like the place it
 * is put).  An element nobody painted contributes nothing rather than
 * painting a pane transparent. */
function paintedLike (elt: HTMLElement): Extension[] {
  const dressed = window.getComputedStyle(elt);
  const background = dressed.backgroundColor;
  const foreground = dressed.color;
  if (!background || /^(transparent|rgba\(0, 0, 0, 0\))$/.test(background))
    return [];
  return [EditorView.theme({
    "&": {backgroundColor: background, color: foreground},
    // the gutter reads as part of the pane, edged rather than shaded
    ".cm-gutters": {backgroundColor: background, color: foreground,
                    border: "none", borderRight: "1px solid rgba(0, 0, 0, 0.1)"},
    ".cm-activeLineGutter": {backgroundColor: "rgba(0, 0, 0, 0.05)"},
    ".cm-activeLine": {backgroundColor: "rgba(0, 0, 0, 0.03)"},
  })];
}

/** makeResultPane - a read-only, syntax-highlighted view of a result
 * document (validation results as JSON, a materialized graph as Turtle)
 * sharing the highlight machinery of editor panes: highlight(ranges, cls,
 * {scroll}) marks and scrolls to result regions; setHoverRegions supports
 * results → schema/data cross-highlighting. */
export function makeResultPane (text: string, language: PaneLanguage = "json",
                                opts: {colorsFrom?: HTMLElement} = {}): ResultPane {
  // a result pane replaces no textarea, so it has no colours of its own to
  // inherit; the host says what it should look like by handing over an
  // element it has styled (and attached, or there is nothing to compute)
  const dressing = opts.colorsFrom ? paintedLike(opts.colorsFrom) : [];
  const view = new EditorView({doc: text, extensions: [
    basicSetup,
    languages[language](),
    highlightField,
    paneTheme,
    ...dressing,
    EditorView.editable.of(false),
    EditorState.readOnly.of(true),
  ]});
  view.dom.classList.add("shexjs-editor-pane", "shexjs-" + language + "-pane");
  const setHoverRegions = attachHoverRegions(view);
  const clampRange = (r: Range | null): r is Range =>
    !!r && r.from >= 0 && r.to <= view.state.doc.length && r.to > r.from;
  return {
    dom: view.dom,
    requestMeasure (): void { view.requestMeasure(); },
    scrollTo (pos: number): void {
      const at = Math.max(0, Math.min(pos, view.state.doc.length));
      view.dispatch({effects: EditorView.scrollIntoView(at, {y: "start"})});
    },
    highlight (ranges: Range[], cls = "shexjs-highlight", opts: {scroll?: boolean} = {}): void {
      const inRange = (ranges || []).filter(clampRange).sort((a, b) => a.from - b.from);
      const decos = ([] as Range[]).concat(...inRange.map(r => textRanges(view, r)))
            .map((r: Range) => Decoration.mark({class: cls}).range(r.from, r.to));
      view.dispatch({effects: setHighlightsEffect.of(Decoration.set(decos, true))});
      if (inRange.length && opts.scroll !== false)
        view.dispatch({effects: EditorView.scrollIntoView(inRange[0].from, {y: "center"})});
    },
    clearHighlights (): void {
      view.dispatch({effects: setHighlightsEffect.of(Decoration.none)});
    },
    setHoverRegions,
  };
}

/** makeJsonPane - makeResultPane's original JSON-only spelling */
export function makeJsonPane (text: string, opts: {colorsFrom?: HTMLElement} = {}): ResultPane {
  return makeResultPane(text, "json", opts);
}

/** onText - is this mouse position over text, or past the end of a line?
 *
 * posAtCoords answers with a document offset for anywhere in the content,
 * so a mouse in the comment column to the right of a short line reports
 * that line's end -- which sits *inside* any range that spans the line.
 * A range is about text, so a position with no text under it is a miss.
 */
function onText (view: EditorView, x: number, y: number, pos: number): boolean {
  const line = view.state.doc.lineAt(pos);
  const end = view.coordsAtPos(line.to);
  const start = view.coordsAtPos(line.from);
  if (!end || !start)
    return true;                      // nothing measured (jsdom): don't guess
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
function textRanges (view: EditorView, range: Range): Range[] {
  const doc = view.state.doc;
  const first = doc.lineAt(range.from), last = doc.lineAt(range.to);
  if (first.number === last.number)
    return [range];
  const out: Range[] = [];
  for (let n = first.number; n <= last.number; ++n) {
    const line = doc.line(n);
    const from = Math.max(range.from, line.from + (line.text.match(/^\s*/) || [""])[0].length);
    const to = Math.min(range.to, line.to);
    if (to > from)
      out.push({from, to});
  }
  return out;
}

/** track mouse-over-sensitive ranges on a view; returns the function that
 * replaces the region set (the makePane/makeResultPane setHoverRegions API) */
function attachHoverRegions (view: EditorView): (regions: HoverRegion[], leave?: () => void) => void {
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
    // smallest containing region wins: nested constructs (inline shapes,
    // bnode property lists) sit inside their parents' regions
    const hit = pos === null || !onText(view, e.clientX, e.clientY, pos) ? null
          : hoverRegions.reduce((best: HoverRegion | null, r) =>
              pos >= r.from && pos < r.to && (!best || r.to - r.from < best.to - best.from)
                ? r : best, null);
    if (hit !== currentRegion) {
      currentRegion = hit;
      if (hit)
        hit.enter();
      else if (hoverLeave)
        hoverLeave();
    }
  });
  view.contentDOM.addEventListener("mouseleave", clearHover);
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
  ".shexjs-debug-current": {backgroundColor: "#cfe3ff"},
  "&": {border: "1px solid #ddd", fontSize: "13px",
        resize: "vertical", overflow: "hidden"}, // user-resizable, like a textarea
  ".cm-scroller": {overflow: "auto"},
  "&.cm-focused": {outline: "none", borderColor: "#88f"},
  ".shexjs-breakpoint-gutter": {width: "1em", cursor: "pointer"},
  ".shexjs-breakpoint-gutter .cm-gutterElement": {color: "#c22", paddingLeft: "2px"},
});

// ---------------------------------------------------------------------------
// breakpoint gutter (debugger; see doc/debugger-design.md)

const breakpointEffect = StateEffect.define<{pos: number, on: boolean}>();
const breakpointMarker = new class extends GutterMarker {
  toDOM () { return document.createTextNode("●"); }
};
const breakpointField = StateField.define<RangeSet<GutterMarker>>({
  create: () => RangeSet.empty,
  update (set, tr) {
    set = set.map(tr.changes);
    for (const e of tr.effects)
      if (e.is(breakpointEffect))
        set = e.value.on
          ? set.update({add: [breakpointMarker.range(e.value.pos)]})
          : set.update({filter: from => from !== e.value.pos});
    return set;
  },
});

function toggleBreakpoint (view: EditorView, pos: number): void {
  let on = false;
  view.state.field(breakpointField).between(pos, pos, () => { on = true; });
  view.dispatch({effects: breakpointEffect.of({pos, on: !on})});
}

const breakpointExtension: Extension = [
  breakpointField,
  gutter({
    class: "shexjs-breakpoint-gutter",
    markers: view => view.state.field(breakpointField),
    initialSpacer: () => breakpointMarker,
    domEventHandlers: {
      mousedown (view, line) {
        toggleBreakpoint(view, line.from);
        return true;
      },
    },
  }),
];

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

// ---------------------------------------------------------------------------
// module-supplied languages
//
// A neighborhood module describes its text as plain functions over plain
// strings (tokens, lint, complete); these adapters are the only place that
// description meets an editor library.

/** Styles a supplied tokenizer can ask for.  The names are the ones
 * CodeMirror's own stream parsers use, so a module that grows into a real
 * StreamParser keeps its vocabulary. */
const suppliedTokenTheme = EditorView.baseTheme({
  ".shexjs-tok-keyword": {color: "#708"},
  ".shexjs-tok-link": {color: "#219", textDecoration: "underline"},
  ".shexjs-tok-string": {color: "#a11"},
  ".shexjs-tok-comment": {color: "#940", fontStyle: "italic"},
  ".shexjs-tok-number": {color: "#164"},
  ".shexjs-tok-variableName": {color: "#00c"},
  ".shexjs-tok-typeName": {color: "#085"},
  ".shexjs-tok-invalid": {color: "#f00", textDecoration: "underline wavy #f00"},
});

/** Recompute a supplied tokenizer's decorations whenever the document
 * changes.  Whole-document rather than incremental: what modules describe
 * are header lines, and their real body language (`language: "turtle"`) is
 * still parsed incrementally by the grammar underneath. */
function suppliedTokensExtension (
  getSupplied: (text: string) => SuppliedEditor | null,
  getContext: () => any,
): Extension {
  const compute = (doc: string): DecorationSet => {
    const supplied = getSupplied(doc);
    if (!supplied || !supplied.tokens)
      return Decoration.none;
    let tokens;
    try {
      tokens = supplied.tokens(doc, getContext()) || [];
    } catch (e) {
      return Decoration.none;      // a module's bug must not break editing
    }
    const marks = tokens
          .filter(t => t.from >= 0 && t.to > t.from && t.to <= doc.length)
          .sort((l, r) => l.from - r.from)
          .map(t => Decoration.mark({class: "shexjs-tok-" + t.style}).range(t.from, t.to));
    return Decoration.set(marks, true);
  };
  const field = StateField.define<DecorationSet>({
    create: state => compute(state.doc.toString()),
    update: (deco, tr) => tr.docChanged ? compute(tr.state.doc.toString()) : deco,
    provide: f => EditorView.decorations.from(f),
  });
  return [field, suppliedTokenTheme];
}

/** A CodeMirror completion source over a supplied editor's `complete`. */
function suppliedCompletionSource (
  getSupplied: (text: string) => SuppliedEditor | null,
  getContext: () => any,
) {
  return (context: CompletionContext): CompletionResult | null => {
    const text = context.state.doc.toString();
    const supplied = getSupplied(text);
    if (!supplied || !supplied.complete)
      return null;
    let result;
    try {
      result = supplied.complete(text, context.pos, getContext());
    } catch (e) {
      return null;
    }
    if (!result || result.options.length === 0)
      return null;
    return {from: result.from, to: result.to, options: result.options};
  };
}

/** Is there a language here to build an editor from?  A module that
 * describes none gets no pane -- see makePaneIfDescribed. */
function describesALanguage (opts: MakePaneOptions, text: string): boolean {
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
export function makePaneIfDescribed (textarea: HTMLTextAreaElement, opts: MakePaneOptions = {}): Pane | null {
  return describesALanguage(opts, textarea.value) ? makePane(textarea, opts) : null;
}

/** makePane - replace `textarea` with a CodeMirror 6 editor. */
export const CHANGE_DEBOUNCE_MS = 350;

/** marks a document change made by the application (a write through the
 * textarea proxy) rather than by the user, so the pane doesn't report it as
 * a typing pause -- see the updateListener in makePane */
const appEdit = Annotation.define<boolean>();

export function makePane (textarea: HTMLTextAreaElement, opts: MakePaneOptions = {}): Pane {
  const nativeValue =
        Object.getOwnPropertyDescriptor(Object.getPrototypeOf(textarea).constructor.prototype, "value")
        || Object.getOwnPropertyDescriptor(textarea, "value")!;
  let changeTimer: ReturnType<typeof setTimeout> | null = null;

  const extensions: Extension[] = [
    basicSetup,
    lintGutter(),
    breakpointExtension,
    highlightField,
    paneTheme,
    EditorView.updateListener.of(update => {
      if (update.docChanged) {
        nativeValue.set!.call(textarea, update.state.doc.toString());
        // "keyup" fires immediately, for writes through the proxy too: the
        // apps' cache dirty-tracking listens for it, and a stale cache means
        // validate ignores the new text (setTextAreaHandlers).
        const KeyboardEventCtor = typeof KeyboardEvent !== "undefined" ? KeyboardEvent : Event;
        textarea.dispatchEvent(new KeyboardEventCtor("keyup", {bubbles: true}));
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
          textarea.dispatchEvent(new Event("change", {bubbles: true}));
        }, CHANGE_DEBOUNCE_MS);
      }
    }),
  ];
  // a module-supplied language names the grammar (when it's one of ours)
  // and overlays its own tokens, diagnostics and completions on it
  const getSupplied = opts.supplied || ((_text: string) => null);
  const getSuppliedContext = opts.suppliedContext || (() => undefined);
  const supplied = getSupplied(textarea.value);
  const language = opts.language
        || (supplied && languages[supplied.language as PaneLanguage] ? supplied.language as PaneLanguage : undefined);

  if (language === "shexc" || language === "turtle") {
    const lang = language === "shexc" ? StreamLanguage.define(shexcStreamParser) : turtleLanguage;
    extensions.push(lang);
    const autocompletes = [];
    if (opts.completions) // basicSetup's autocompletion() reads languageData
      autocompletes.push(completionSource(opts.completions));
    if (opts.supplied)
      autocompletes.push(suppliedCompletionSource(getSupplied, getSuppliedContext));
    for (const autocomplete of autocompletes)
      extensions.push(lang.data.of({autocomplete}));
  } else if (language && languages[language]) {
    extensions.push(languages[language]());
  }
  if (opts.supplied) {
    extensions.push(suppliedTokensExtension(getSupplied, getSuppliedContext));
    if (!language)
      // no grammar to hang languageData on
      extensions.push(autocompletion({override: [suppliedCompletionSource(getSupplied, getSuppliedContext)]}));
  }

  const langLintSource = opts.lint === false ? null : lintSourceFor(language, opts);
  const lintSource: LintSource | null = opts.lint === false ? null : (view => {
    const fromLanguage = langLintSource ? langLintSource(view) : [];
    const text = view.state.doc.toString();
    const current = getSupplied(text);
    if (!current || !current.lint)
      return fromLanguage;
    let mine: Diagnostic[] = [];
    try {
      mine = current.lint(text, getSuppliedContext()) || [];
    } catch (e) { /* a module's bug must not break editing */ }
    return Promise.resolve(fromLanguage).then(
      diagnostics => (diagnostics as Diagnostic[]).concat(
        mine.filter(d => d.from >= 0 && d.to >= d.from && d.to <= view.state.doc.length)));
  });
  if (lintSource && (langLintSource || opts.supplied))
    extensions.push(linter(lintSource, {delay: 500}));

  // A pane stands where a textarea stood, and the application coloured that
  // textarea to say what it holds -- the schema pane blue, the data pane
  // green.  Take the colours with it rather than turning the pane white:
  // the editors are a nicer way to show the same thing, not a different
  // thing.  Read before hiding it, and only believe a real colour (jsdom
  // and an unstyled page report none).
  extensions.push(...paintedLike(textarea));

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
  const setHoverRegions = attachHoverRegions(view);

  // live proxy: application code keeps talking to the textarea
  Object.defineProperty(textarea, "value", {
    configurable: true,
    get: () => view.state.doc.toString(),
    set: (v: unknown) => {
      const text = String(v == null ? "" : v);
      nativeValue.set!.call(textarea, text);
      if (text !== view.state.doc.toString())
        view.dispatch({changes: {from: 0, to: view.state.doc.length, insert: text},
                       annotations: appEdit.of(true)});
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
      const decos = ([] as Range[]).concat(...inRange.map(r => textRanges(view, r)))
            .map((r: Range) => Decoration.mark({class: cls}).range(r.from, r.to));
      view.dispatch({effects: setHighlightsEffect.of(Decoration.set(decos, true))});
      if (inRange.length && opts.scroll !== false)
        view.dispatch({effects: EditorView.scrollIntoView(inRange[0].from)});
    },
    clearHighlights (): void {
      view.dispatch({effects: setHighlightsEffect.of(Decoration.none)});
    },
    setHoverRegions,
    requestMeasure (): void { view.requestMeasure(); },
    listBreakpoints (): number[] {
      const positions: number[] = [];
      view.state.field(breakpointField).between(0, view.state.doc.length,
                                                from => { positions.push(from); });
      return positions;
    },
    toggleBreakpoint (pos: number): void {
      toggleBreakpoint(view, view.state.doc.lineAt(pos).from);
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
