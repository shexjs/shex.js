/** ShExMapDebugRepl - the interactive layer of shexmap-debug (see
 * doc/debugger-design.md at the repository root).
 *
 * I/O is injected (write/prompt callbacks), so tests drive it with string
 * arrays and bin/shexmap-debug supplies a synchronous stdin reader -- the
 * MaterializerDebugger underneath is a plain generator-driver, so blocking
 * on the prompt IS the suspension mechanism; no worker needed.
 *
 * The I/O, the located schema, the prefixes and the command loop are
 * DebugRepl's (@shexjs/editor-services), shared with shex-debug; what is
 * this REPL's own is the engine it drives and how: pulled, an event per
 * step, and a post-mortem over the accepted threads.
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
const { DebugRepl } = require("@shexjs/editor-services/lib/debug-repl");
const { ThreadedMaterializer, MaterializerDebugger } = require("./ThreadedMaterializer");
class ShExMapDebugRepl extends DebugRepl {
    constructor(schemaText, schema, bindingTree, createRoot, opts = {}) {
        super(schemaText, schema, opts);
        this.dbg = new MaterializerDebugger(new ThreadedMaterializer(schema, { staticVars: opts.staticVars }), bindingTree, createRoot, opts.shapeLabel);
    }
    /** run the command loop; returns 0 on completion, 1 on materialization
     * failure, 2 on quit-before-done */
    run() {
        this.write("shexmap-debug -- s(tep) n(ext) o(ut) c(ontinue) b LINE[:COL] bp PRED bn NODE t [N] info l h q\n");
        let quit = false;
        // a step that finishes the materialization ends the loop
        const step = (how) => {
            this.showEvent(this.dbg[how]());
            return this.dbg.done ? "return" : undefined;
        };
        if (!this.dbg.done)
            this.commandLoop("(smdb) ", {
                s: () => step("stepInto"),
                n: () => step("stepOver"),
                o: () => step("stepOut"),
                c: () => step("continue"),
                b: (args) => this.setPositionBreakpoint(args[0]),
                bp: (args) => this.setPredicateBreakpoint(args[0]),
                bn: (args) => this.setNodeBreakpoint(args[0]),
                t: (args) => this.showThreads(args[0]),
                info: () => this.showInfo(),
                l: () => this.showEvent(this.dbg.current, true),
                h: () => this.write("s=into n=over o=out c=continue b LINE[:COL] bp PRED bn NODE t [N] info l q\n"),
                q: () => { quit = true; return "return"; },
            }, () => {
                this.showEvent(this.dbg.continue());
                return "return";
            });
        if (quit)
            return 2;
        if (!this.dbg.error) // post-mortem: inspect the accepted threads
            this.commandLoop("(smdb) ", {
                q: () => "return",
                t: (args) => this.showThreads(args[0]),
                info: () => this.showInfo(),
            }, () => "return", () => this.write("materialization finished; t [N] info q\n"));
        return this.dbg.error ? 1 : 0;
    }
    setPositionBreakpoint(arg) {
        const at = this.positionHit(arg);
        if (!at)
            return;
        if (!at.hit)
            return this.write("no constraint at " + arg + "\n");
        this.dbg.addBreakpoint({ tc: at.hit.expr });
        const label = this.excerpt(at.hit.range).trim();
        this.noteBreakpoint("b " + arg + " -> " + label, label);
    }
    setPredicateBreakpoint(arg) {
        if (!arg)
            return this.write("usage: bp PREDICATE\n");
        const iri = this.expand(arg);
        this.dbg.addBreakpoint({ predicate: iri });
        this.noteBreakpoint("bp " + this.lex(iri), "predicate " + this.lex(iri));
    }
    setNodeBreakpoint(arg) {
        if (!arg)
            return this.write("usage: bn NODE (lexical form, e.g. _:tm0 or <http://...>)\n");
        const subject = arg.startsWith("<") && arg.endsWith(">") ? arg.slice(1, -1) : arg;
        this.dbg.addBreakpoint({ subject });
        this.noteBreakpoint("bn " + arg, "node " + arg);
    }
    showEvent(event, sourceOnly = false) {
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
                (report.unboundVariables || []).forEach((f) => this.write("warning: " + this.lex(f.variable) + " is bound nowhere\n"));
                (report.unusedStatics || []).forEach((k) => this.write("warning: static " + this.lex(k) + " never referenced\n"));
                break;
            }
            case "error":
                this.write("failed: " + event.error.message.split(";")[0] + "\n");
                break;
            default:
                this.write(event.type + "\n");
        }
    }
    threadStr(thread) {
        return "  [subject " + thread.subject + ", depth " + thread.depth +
            ", frame " + thread.frame + ", consumed " + thread.consumed +
            (thread.skipped ? ", skipped " + thread.skipped : "") +
            ", emitted " + thread.emitted + "]";
    }
    /** t [N] - the accepted threads then the pending ones, or thread N's
     * (partial) graph */
    showThreads(arg) {
        const accepts = this.dbg.accepts || this.dbg.materializer.accepts || [];
        const live = this.dbg.threads();
        const all = accepts.map((a) => ({
            label: "accepted: " + a.quads.length + " quads, consumed " + a.consumed +
                (a.skipped ? ", skipped " + a.skipped : "") +
                (a === this.dbg.materializer.chosen ? "  <- chosen" : ""),
            quads: a.quads,
        })).concat(live.map((t) => ({
            label: (t.deferred ? "deferred" : "pending") + ":" + this.threadStr(t).substring(1),
            quads: t.quads,
        })));
        if (all.length === 0)
            return this.write("no threads\n");
        if (arg) {
            const n = parseInt(arg, 10);
            if (!(n >= 1 && n <= all.length))
                return this.write("t N with N in 1.." + all.length + "\n");
            return this.write(all[n - 1].quads.map((q) => "  " + this.termStr(q.subject) + " " +
                this.termStr(q.predicate) + " " +
                this.termStr(q.object) + " .\n").join("")
                || "  (nothing emitted yet)\n");
        }
        all.forEach((t, i) => this.write("T" + (i + 1) + " " + t.label + "\n"));
    }
    showInfo() {
        if (this.dbg.current && this.dbg.current.thread)
            this.write("thread:" + this.threadStr(this.dbg.current.thread) + "\n");
        this.showBreakpoints();
    }
}
module.exports = { ShExMapDebugRepl };
//# sourceMappingURL=ShExMapDebugRepl.js.map