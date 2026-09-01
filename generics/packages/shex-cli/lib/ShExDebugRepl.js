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
 * The I/O, the located schema, the prefixes and the command loop are
 * DebugRepl's (@shexjs/editor-services), shared with shexmap-debug; what
 * is this REPL's own is the engine it drives and how: a gate in the
 * validator's callbacks that reads commands until one lets it go.
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

const {DebugRepl} = require("@shexjs/editor-services/lib/debug-repl");
const {ShExValidator} = require("@shexjs/validator");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {eventTracker} = require("@shexjs/eval-validator-api");

class DebugQuit extends Error {}

const noBreakpoints = () => ({shapes: new Set(), nodes: new Set(), constraints: new Set(), predicates: new Set()});

class ShExDebugRepl extends DebugRepl {
  constructor (schemaText, schema, graph, opts = {}) {
    super(schemaText, schema, opts);
    this.graph = graph;
    this.breakpoints = noBreakpoints();
    this.mode = {kind: "into"}; // pause at the first event
  }

  /** validate node (an absolute IRI or _:label) against shapeLabel (default:
   * the schema's start shape); returns 0 conformant, 1 nonconformant,
   * 2 aborted */
  run (node, shapeLabel) {
    this.write("shex-debug -- s(tep) n(ext) o(ut) c(ontinue) b LINE[:COL] bs SHAPE bp PRED bn NODE info l h q\n");
    // the shape-level events are the validator's tracker, typed
    // (validator-api's ShapeDebugEvent); an answer from the cache is not
    // a place to pause
    const tracker = eventTracker(event => {
      if (event.type !== "known")
        this.gate(event);
    });
    const validator = new ShExValidator(this.schema, RdfJsDb(this.graph), {
      noCache: true,
      debugHooks: {
        // one level below the shape whose evaluation ran the engine
        onConstraint: (tc, ctx) => this.gate({
          type: "constraint", tc, node: ctx.node, triples: ctx.triples,
          depth: tracker.depth + 1,
        }),
      },
    });
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

  /** an event the engine reports: pause here if the mode or a breakpoint
   * says so, and read commands until one resumes */
  gate (event) {
    this.current = event;
    if (!this.shouldPause(event))
      return;
    this.showEvent(event);
    this.commandLoop("(sxdb) ", {
      s: () => { this.mode = {kind: "into"}; return "return"; },
      n: () => { this.mode = {kind: "over", depth: event.depth}; return "return"; },
      o: () => { this.mode = {kind: "out", depth: event.depth}; return "return"; },
      c: () => { this.mode = {kind: "continue"}; return "return"; },
      b: args => this.setPositionBreakpoint(args[0]),
      bs: args => this.setShapeBreakpoint(args[0]),
      bp: args => this.setPredicateBreakpoint(args[0]),
      bn: args => this.setNodeBreakpoint(args[0]),
      info: () => this.showInfo(),
      l: () => this.showEvent(event, true),
      h: () => this.write("s=into n=over o=out c=continue b LINE[:COL] bs SHAPE bp PRED bn NODE info l q\n"),
      q: () => { throw new DebugQuit(); },
    }, () => { // EOF: run free
      this.mode = {kind: "continue"};
      this.breakpoints = noBreakpoints();
      return "return";
    });
  }

  shouldPause (event) {
    if (event.type === "enter" &&
        (this.breakpoints.shapes.has(event.shape) || this.matchesNodeBreakpoint(event.node)))
      return true;
    if (event.type === "constraint" &&
        (this.breakpoints.constraints.has(event.tc) ||
         this.breakpoints.predicates.has(event.tc.predicate) ||
         this.matchesNodeBreakpoint(event.node)))
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

  /** b LINE[:COL]: the constraint there, or, failing that, the shape */
  setPositionBreakpoint (arg) {
    const at = this.positionHit(arg);
    if (!at)
      return;
    if (at.hit) {
      this.breakpoints.constraints.add(at.hit.expr);
      const label = this.excerpt(at.hit.range).trim();
      return this.noteBreakpoint("b " + arg + " -> " + label, label);
    }
    const hit = this.located.locate.shapeAt(at.from);
    if (!hit)
      return this.write("no constraint or shape at " + arg + "\n");
    this.breakpoints.shapes.add(hit.label);
    this.noteBreakpoint("b " + arg + " -> " + this.lex(hit.label), "shape " + this.lex(hit.label));
  }

  setPredicateBreakpoint (arg) {
    if (!arg)
      return this.write("usage: bp PREDICATE\n");
    const iri = this.expand(arg);
    this.breakpoints.predicates.add(iri);
    this.noteBreakpoint("bp " + this.lex(iri), "predicate " + this.lex(iri));
  }

  setShapeBreakpoint (arg) {
    if (!arg)
      return this.write("usage: bs SHAPE\n");
    const iri = this.expand(arg);
    this.breakpoints.shapes.add(iri);
    this.noteBreakpoint("bs " + this.lex(iri), "shape " + this.lex(iri));
  }

  setNodeBreakpoint (arg) {
    if (!arg)
      return this.write("usage: bn NODE (lexical form: <IRI>, pname or _:label)\n");
    const lex = arg.startsWith("_:") ? arg : this.expand(arg);
    this.breakpoints.nodes.add(lex);
    this.noteBreakpoint("bn " + arg, "node " + arg);
  }

  showEvent (event, sourceOnly = false) {
    const where = event.type === "constraint" ? this.located.locate.expr(event.tc)
          : typeof event.shape === "string" ? this.located.locate.shape(event.shape) : null;
    if (!sourceOnly)
      switch (event.type) {
      case "constraint":
        this.write("at " + this.lex(event.tc.predicate) + " for " + this.termStr(event.node) +
                   " (" + event.triples.length + " candidate triple" + (event.triples.length === 1 ? "" : "s") + ")" +
                   "  [depth " + event.depth + "]\n");
        break;
      case "enter":
        this.write("enter " + this.termStr(event.node) + "@" + this.lex(event.shape) +
                   "  [depth " + event.depth + "]\n");
        break;
      case "exit":
        this.write("exit  " + this.termStr(event.node) + "@" + this.lex(event.shape) +
                   " -> " + (event.result && "errors" in event.result ? "fail" : "ok") +
                   "  [depth " + event.depth + "]\n");
        break;
      case "recurse":
        this.write("recurse into " + this.lex(event.shape) + "  [depth " + event.depth + "]\n");
        break;
      default:
        this.write(event.type + "\n");
      }
    if (where)
      this.write(this.excerpt(where));
  }

  showInfo () {
    if (this.current)
      this.write("at: " + (this.current.type || "?") + " " +
                 this.termStr(this.current.node) + "@" +
                 (this.current.type === "constraint"
                  ? this.lex(this.current.tc.predicate)
                  : this.lex(this.current.shape)) + "\n");
    this.showBreakpoints();
  }
}

module.exports = {ShExDebugRepl, DebugQuit};
