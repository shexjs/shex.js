/** ShExDebugRepl - the interactive layer of shex-debug (see
 * doc/debugger-design.md at the repository root).
 *
 * The validator runs synchronously with a tracker whose enter/exit
 * callbacks gate on the injected prompt -- blocking on stdin IS the
 * suspension mechanism, so validation debugging in the CLI needs no worker.
 * Shape-level events come from the tracker; constraint-level events come
 * from the regex engines' debugHooks (design doc §4) -- each time the
 * engine (re)considers a TripleConstraint, one level deeper than the
 * enclosing shape, so `s` descends into constraints and `n` skips them.
 *
 * Commands:
 *   s              step into (pause at the next enter/exit/constraint)
 *   n              step over (skip nested shape evaluations and constraints)
 *   o              step out (run until the current shape completes)
 *   c              continue (to next breakpoint or completion)
 *   b LINE[:COL]   break on the constraint (or, failing that, the shape)
 *                  at that schema position
 *   bs SHAPE       break on a shape label (IRI, <IRI> or pname)
 *   bp PREDICATE   break on every constraint with that predicate
 *   bn NODE        break on the lexical form of a focus node in the graph
 *   info           current position and breakpoints
 *   l              show the current source position
 *   h              help
 *   q              abort validation
 */
"use strict";

const EditorServices = require("@shexjs/editor-services");
const {ShExValidator} = require("@shexjs/validator");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");

class DebugQuit extends Error {}

class ShExDebugRepl {
  constructor (schemaText, schema, graph, opts = {}) {
    this.write = opts.write || (s => process.stdout.write(s));
    this.prompt = opts.prompt;
    this.schemaText = schemaText;
    this.schema = schema;
    this.graph = graph;
    this.located = EditorServices.locateInParsed(schemaText, schema);
    this.lineStarts = EditorServices.lineOffsets(schemaText);
    this.prefixes = schema._prefixes || {};
    this.breakpoints = {shapes: new Set(), nodes: new Set(), constraints: new Set(), predicates: new Set()};
    this.breakpointDescriptions = [];
    this.mode = {kind: "into"}; // pause at the first event
    this.depth = 0;
  }

  /** validate node (an absolute IRI or _:label) against shapeLabel (default:
   * the schema's start shape); returns 0 conformant, 1 nonconformant,
   * 2 aborted */
  run (node, shapeLabel) {
    this.write("shex-debug -- s(tep) n(ext) o(ut) c(ontinue) b LINE[:COL] bs SHAPE bp PRED bn NODE info l h q\n");
    const validator = new ShExValidator(this.schema, RdfJsDb(this.graph), {
      noCache: true,
      debugHooks: {
        // one level below the shape whose evaluation ran the engine
        onConstraint: (tc, ctx) => this.gate({
          type: "constraint", tc, point: ctx.node, triples: ctx.triples,
          depth: this.depth + 1,
        }),
      },
    });
    const tracker = {
      recurse: x => { this.gate({type: "recurse", node: x.node, shape: x.shape, depth: this.depth + 1}); return x; },
      known: x => x,
      enter: (point, label) => {
        ++this.depth;
        this.gate({type: "enter", point, label, depth: this.depth});
      },
      exit: (point, label, ret) => {
        this.gate({type: "exit", point, label, ret, depth: this.depth});
        --this.depth;
      },
    };
    let results;
    try {
      results = validator.validateShapeMap(
        [{node, shape: shapeLabel || ShExValidator.Start}], tracker);
    } catch (e) {
      if (e instanceof DebugQuit) {
        this.write("aborted\n");
        return 2;
      }
      throw e;
    }
    const status = results[0].status;
    this.write(status + "\n");
    return status === "conformant" ? 0 : 1;
  }

  gate (event) {
    this.current = event;
    if (!this.shouldPause(event))
      return;
    this.showEvent(event);
    while (true) {
      const line = this.prompt("(sxdb) ");
      if (line === null) { // EOF: run free
        this.mode = {kind: "continue"};
        this.breakpoints = {shapes: new Set(), nodes: new Set(), constraints: new Set(), predicates: new Set()};
        return;
      }
      const [cmd, ...args] = line.trim().split(/\s+/);
      switch (cmd) {
      case "": break;
      case "s": this.mode = {kind: "into"}; return;
      case "n": this.mode = {kind: "over", depth: event.depth}; return;
      case "o": this.mode = {kind: "out", depth: event.depth}; return;
      case "c": this.mode = {kind: "continue"}; return;
      case "b": this.setPositionBreakpoint(args[0]); break;
      case "bs": this.setShapeBreakpoint(args[0]); break;
      case "bp": this.setPredicateBreakpoint(args[0]); break;
      case "bn": this.setNodeBreakpoint(args[0]); break;
      case "info": this.showInfo(); break;
      case "l": this.showEvent(event, true); break;
      case "h":
        this.write("s=into n=over o=out c=continue b LINE[:COL] bs SHAPE bp PRED bn NODE info l q\n");
        break;
      case "q": throw new DebugQuit();
      default:
        this.write("unknown command " + JSON.stringify(cmd) + "; h for help\n");
      }
    }
  }

  shouldPause (event) {
    if (event.type === "enter" &&
        (this.breakpoints.shapes.has(event.label) || this.matchesNodeBreakpoint(event.point)))
      return true;
    if (event.type === "constraint" &&
        (this.breakpoints.constraints.has(event.tc) ||
         this.breakpoints.predicates.has(event.tc.predicate) ||
         this.matchesNodeBreakpoint(event.point)))
      return true;
    switch (this.mode.kind) {
    case "into": return true;
    case "over": return event.depth <= this.mode.depth;
    case "out": return event.depth < this.mode.depth;
    default: return false; // continue
    }
  }

  matchesNodeBreakpoint (point) {
    if (!point || this.breakpoints.nodes.size === 0)
      return false;
    const lex = point.termType === "BlankNode" ? "_:" + point.value : point.value;
    return this.breakpoints.nodes.has(lex);
  }

  expand (lex) {
    if (!lex)
      return lex;
    if (lex.startsWith("<") && lex.endsWith(">")) {
      const iri = lex.slice(1, -1);
      try { // resolve relative IRIs the way the parser resolved the schema's
        return new URL(iri, this.schema._base || undefined).href;
      } catch (e) {
        return iri;
      }
    }
    const m = lex.match(/^([A-Za-z_][\w.-]*)?:(.*)$/);
    return m && this.prefixes[m[1] || ""] !== undefined
      ? this.prefixes[m[1] || ""] + m[2]
      : lex;
  }

  lex (iri) {
    if (typeof iri !== "string")
      return "START";
    for (const [prefix, ns] of Object.entries(this.prefixes))
      if (ns.length && iri.startsWith(ns))
        return prefix + ":" + iri.substring(ns.length);
    return "<" + iri + ">";
  }

  pointStr (point) {
    return !point ? "?"
      : point.termType === "BlankNode" ? "_:" + point.value
      : point.termType === "Literal" ? JSON.stringify(point.value)
      : this.lex(point.value);
  }

  setPositionBreakpoint (arg) {
    const m = (arg || "").match(/^(\d+)(?::(\d+))?$/);
    if (!m)
      return this.write("usage: b LINE[:COL] (1-based)\n");
    const lineNo = parseInt(m[1], 10);
    if (lineNo < 1 || lineNo > this.lineStarts.length)
      return this.write("no line " + lineNo + "\n");
    const from = this.lineStarts[lineNo - 1] + (m[2] ? parseInt(m[2], 10) - 1 : 0);
    const to = lineNo < this.lineStarts.length ? this.lineStarts[lineNo] : this.schemaText.length;
    // a bare line number matches the first constraint on the line;
    // a line with no constraint falls back to its enclosing shape
    let tcHit = null;
    for (let offset = from; offset < to && !tcHit; ++offset)
      tcHit = this.located.locate.exprAt(offset);
    if (tcHit) {
      this.breakpoints.constraints.add(tcHit.expr);
      const label = EditorServices.sourceExcerpt(this.schemaText, tcHit.range).trim();
      this.breakpointDescriptions.push("b " + arg + " -> " + label);
      return this.write("breakpoint on " + label + "\n");
    }
    const hit = this.located.locate.shapeAt(from);
    if (!hit)
      return this.write("no constraint or shape at " + arg + "\n");
    this.breakpoints.shapes.add(hit.label);
    this.breakpointDescriptions.push("b " + arg + " -> " + this.lex(hit.label));
    this.write("breakpoint on shape " + this.lex(hit.label) + "\n");
  }

  setPredicateBreakpoint (arg) {
    if (!arg)
      return this.write("usage: bp PREDICATE\n");
    const iri = this.expand(arg);
    this.breakpoints.predicates.add(iri);
    this.breakpointDescriptions.push("bp " + this.lex(iri));
    this.write("breakpoint on predicate " + this.lex(iri) + "\n");
  }

  setShapeBreakpoint (arg) {
    if (!arg)
      return this.write("usage: bs SHAPE\n");
    const iri = this.expand(arg);
    this.breakpoints.shapes.add(iri);
    this.breakpointDescriptions.push("bs " + this.lex(iri));
    this.write("breakpoint on shape " + this.lex(iri) + "\n");
  }

  setNodeBreakpoint (arg) {
    if (!arg)
      return this.write("usage: bn NODE (lexical form: <IRI>, pname or _:label)\n");
    const lex = arg.startsWith("_:") ? arg : this.expand(arg);
    this.breakpoints.nodes.add(lex);
    this.breakpointDescriptions.push("bn " + arg);
    this.write("breakpoint on node " + arg + "\n");
  }

  showEvent (event, sourceOnly = false) {
    const where = event.type === "constraint" ? this.located.locate.expr(event.tc)
          : typeof event.label === "string" ? this.located.locate.shape(event.label) : null;
    if (!sourceOnly)
      switch (event.type) {
      case "constraint":
        this.write("at " + this.lex(event.tc.predicate) + " for " + this.pointStr(event.point) +
                   " (" + event.triples.length + " candidate triple" + (event.triples.length === 1 ? "" : "s") + ")" +
                   "  [depth " + event.depth + "]\n");
        break;
      case "enter":
        this.write("enter " + this.pointStr(event.point) + "@" + this.lex(event.label) +
                   "  [depth " + event.depth + "]\n");
        break;
      case "exit":
        this.write("exit  " + this.pointStr(event.point) + "@" + this.lex(event.label) +
                   " -> " + (event.ret && "errors" in event.ret ? "fail" : "ok") +
                   "  [depth " + event.depth + "]\n");
        break;
      case "recurse":
        this.write("recurse into " + this.lex(event.shape) + "  [depth " + event.depth + "]\n");
        break;
      default:
        this.write(event.type + "\n");
      }
    if (where)
      this.write(EditorServices.sourceExcerpt(this.schemaText, where));
  }

  showInfo () {
    if (this.current)
      this.write("at: " + (this.current.type || "?") + " " +
                 this.pointStr(this.current.point) + "@" +
                 (this.current.type === "constraint"
                  ? this.lex(this.current.tc.predicate)
                  : this.lex(this.current.label)) + "\n");
    this.write(this.breakpointDescriptions.length
      ? this.breakpointDescriptions.map(b => "  " + b).join("\n") + "\n"
      : "no breakpoints\n");
  }
}

module.exports = {ShExDebugRepl, DebugQuit};
