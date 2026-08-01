/** ShExMapDebugRepl - the interactive layer of shexmap-debug (see
 * doc/debugger-design.md at the repository root).
 *
 * I/O is injected (write/prompt callbacks), so tests drive it with string
 * arrays and bin/shexmap-debug supplies a synchronous stdin reader -- the
 * MaterializerDebugger underneath is a plain generator-driver, so blocking
 * on the prompt IS the suspension mechanism; no worker needed.
 *
 * Commands:
 *   s              step into (next event, descending into subshape calls)
 *   n              step over (skip the interior of the current call)
 *   o              step out (run until the current call completes)
 *   c              continue (to next breakpoint or completion)
 *   b LINE[:COL]   break on the schema constraint at that source position
 *   bp PRED        break on a predicate (IRI, <IRI> or pname)
 *   bn NODE        break on the lexical (N3id) form of a synthesized node
 *   t [N]          list pending/accepted threads; t N shows thread N's
 *                  (partial) graph
 *   info           current thread snapshot and breakpoints
 *   l              show the current source position
 *   h              help
 *   q              quit
 */
"use strict";

const EditorServices = require("@shexjs/editor-services");
const {ThreadedMaterializer, MaterializerDebugger} = require("./ThreadedMaterializer");

class ShExMapDebugRepl {
  constructor (schemaText, schema, bindingTree, createRoot, opts = {}) {
    this.write = opts.write || (s => process.stdout.write(s));
    this.prompt = opts.prompt; // () => line or null on EOF
    this.schemaText = schemaText;
    this.located = EditorServices.locateInParsed(schemaText, schema);
    this.lineStarts = EditorServices.lineOffsets(schemaText);
    this.prefixes = schema._prefixes || {};
    this.dbg = new MaterializerDebugger(
      new ThreadedMaterializer(schema, {staticVars: opts.staticVars}),
      bindingTree, createRoot, opts.shapeLabel);
    this.breakpointDescriptions = [];
  }

  /** run the command loop; returns 0 on completion, 1 on materialization
   * failure, 2 on quit-before-done */
  run () {
    this.write("shexmap-debug -- s(tep) n(ext) o(ut) c(ontinue) b LINE[:COL] bp PRED bn NODE t [N] info l h q\n");
    while (!this.dbg.done) {
      const line = this.prompt("(smdb) ");
      if (line === null) { // EOF: run to completion
        this.showEvent(this.dbg.continue());
        break;
      }
      const [cmd, ...args] = line.trim().split(/\s+/);
      switch (cmd) {
      case "": break;
      case "s": this.showEvent(this.dbg.stepInto()); break;
      case "n": this.showEvent(this.dbg.stepOver()); break;
      case "o": this.showEvent(this.dbg.stepOut()); break;
      case "c": this.showEvent(this.dbg.continue()); break;
      case "b": this.setPositionBreakpoint(args[0]); break;
      case "bp": this.setPredicateBreakpoint(args[0]); break;
      case "bn": this.setNodeBreakpoint(args[0]); break;
      case "t": this.showThreads(args[0]); break;
      case "info": this.showInfo(); break;
      case "l": this.showEvent(this.dbg.current, true); break;
      case "h":
        this.write("s=into n=over o=out c=continue b LINE[:COL] bp PRED bn NODE t [N] info l q\n");
        break;
      case "q": return 2;
      default:
        this.write("unknown command " + JSON.stringify(cmd) + "; h for help\n");
      }
    }
    if (!this.dbg.error) { // post-mortem: inspect the accepted threads
      while (true) {
        const line = this.prompt("(smdb) ");
        if (line === null)
          break;
        const [cmd, ...args] = line.trim().split(/\s+/);
        if (cmd === "q")
          break;
        else if (cmd === "t")
          this.showThreads(args[0]);
        else if (cmd === "info")
          this.showInfo();
        else if (cmd !== "")
          this.write("materialization finished; t [N] info q\n");
      }
    }
    return this.dbg.error ? 1 : 0;
  }

  expand (lex) {
    if (!lex)
      return lex;
    if (lex.startsWith("<") && lex.endsWith(">")) {
      const iri = lex.slice(1, -1);
      try { // resolve relative IRIs the way the parser resolved the schema's
        return new URL(iri, this.located.schema._base || undefined).href;
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
    for (const [prefix, ns] of Object.entries(this.prefixes))
      if (ns.length && iri.startsWith(ns))
        return prefix + ":" + iri.substring(ns.length);
    return "<" + iri + ">";
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
    // a bare line number matches the first constraint on the line
    let hit = null;
    for (let offset = from; offset < to && !hit; ++offset)
      hit = this.located.locate.exprAt(offset);
    if (!hit)
      return this.write("no constraint at " + arg + "\n");
    this.dbg.addBreakpoint({tc: hit.expr});
    this.breakpointDescriptions.push("b " + arg + " -> " + this.excerpt(hit.range).trim());
    this.write("breakpoint on " + this.excerpt(hit.range).trim() + "\n");
  }

  setPredicateBreakpoint (arg) {
    if (!arg)
      return this.write("usage: bp PREDICATE\n");
    const iri = this.expand(arg);
    this.dbg.addBreakpoint({predicate: iri});
    this.breakpointDescriptions.push("bp " + this.lex(iri));
    this.write("breakpoint on predicate " + this.lex(iri) + "\n");
  }

  setNodeBreakpoint (arg) {
    if (!arg)
      return this.write("usage: bn NODE (lexical form, e.g. _:tm0 or <http://...>)\n");
    const subject = arg.startsWith("<") && arg.endsWith(">") ? arg.slice(1, -1) : arg;
    this.dbg.addBreakpoint({subject});
    this.breakpointDescriptions.push("bn " + arg);
    this.write("breakpoint on node " + arg + "\n");
  }

  excerpt (range) {
    return EditorServices.sourceExcerpt(this.schemaText, range);
  }

  showEvent (event, sourceOnly = false) {
    if (!event)
      return this.write("not started; s to step\n");
    switch (event.type) {
    case "tripleConstraint": {
      if (!sourceOnly)
        this.write("at " + this.lex(event.tc.predicate) + this.threadStr(event.thread) + "\n");
      const range = this.located.locate.expr(event.tc);
      if (range)
        this.write(this.excerpt(range));
      break;
    }
    case "fail":
      this.write("branch died" + (event.failure
        ? ": " + (event.failure.variable
          ? "no binding for " + this.lex(event.failure.variable)
          : event.failure.error || "")
        : "") + this.threadStr(event.thread) + "\n");
      break;
    case "return":
      this.write("returned to " + event.thread.subject + this.threadStr(event.thread) + "\n");
      break;
    case "advance":
      this.write("advance to frame " + event.toFrame + " for " + this.lex(event.tc.predicate) +
                 " -- thread deferred so in-frame alternatives go first" +
                 this.threadStr(event.thread) + "\n");
      break;
    case "accept":
      this.write("thread accepted: " + event.quads.length + " quads" +
                 this.threadStr(event.thread) + "\n");
      break;
    case "done": {
      const accepts = event.accepts || [];
      this.write("accepted: " + event.quads.length + " quads" +
                 (accepts.length > 1
                  ? " (chose " + (accepts.indexOf(this.dbg.materializer.chosen) + 1) +
                    " of " + accepts.length + " viable materializations; t to list)"
                  : "") + "\n");
      const report = this.dbg.materializer.lastReport || {};
      (report.unboundVariables || []).forEach(f =>
        this.write("warning: " + this.lex(f.variable) + " is bound nowhere\n"));
      (report.unusedStatics || []).forEach(k =>
        this.write("warning: static " + this.lex(k) + " never referenced\n"));
      break;
    }
    case "error":
      this.write("failed: " + event.error.message.split(";")[0] + "\n");
      break;
    default:
      this.write(event.type + "\n");
    }
  }

  threadStr (thread) {
    return "  [subject " + thread.subject + ", depth " + thread.depth +
      ", frame " + thread.frame + ", consumed " + thread.consumed +
      (thread.skipped ? ", skipped " + thread.skipped : "") +
      ", emitted " + thread.emitted + "]";
  }

  /** t [N] - the accepted threads then the pending ones, or thread N's
   * (partial) graph */
  showThreads (arg) {
    const accepts = this.dbg.accepts || this.dbg.materializer.accepts || [];
    const live = this.dbg.threads();
    const all = accepts.map(a => ({
      label: "accepted: " + a.quads.length + " quads, consumed " + a.consumed +
        (a.skipped ? ", skipped " + a.skipped : "") +
        (a === this.dbg.materializer.chosen ? "  <- chosen" : ""),
      quads: a.quads,
    })).concat(live.map(t => ({
      label: (t.deferred ? "deferred" : "pending") + ":" + this.threadStr(t).substring(1),
      quads: t.quads,
    })));
    if (all.length === 0)
      return this.write("no threads\n");
    if (arg) {
      const n = parseInt(arg, 10);
      if (!(n >= 1 && n <= all.length))
        return this.write("t N with N in 1.." + all.length + "\n");
      return this.write(all[n - 1].quads.map(q => "  " + this.termStr(q.subject) + " " +
                                             this.termStr(q.predicate) + " " +
                                             this.termStr(q.object) + " .\n").join("")
                        || "  (nothing emitted yet)\n");
    }
    all.forEach((t, i) => this.write("T" + (i + 1) + " " + t.label + "\n"));
  }

  termStr (term) {
    return term.termType === "NamedNode" ? this.lex(term.value)
      : term.termType === "BlankNode" ? "_:" + term.value
      : JSON.stringify(term.value);
  }

  showInfo () {
    if (this.dbg.current && this.dbg.current.thread)
      this.write("thread:" + this.threadStr(this.dbg.current.thread) + "\n");
    this.write(this.breakpointDescriptions.length
      ? this.breakpointDescriptions.map(b => "  " + b).join("\n") + "\n"
      : "no breakpoints\n");
  }
}

module.exports = {ShExMapDebugRepl};
