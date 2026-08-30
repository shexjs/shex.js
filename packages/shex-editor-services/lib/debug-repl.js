"use strict";
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
exports.DebugRepl = void 0;
/**
 * DebugRepl - what shex-debug and shexmap-debug have in common
 * (doc/debugger-design.md §6): injected I/O -- a `write` and a `prompt`,
 * so a test drives a session with an array of lines and a bin adds a
 * blocking stdin reader -- the schema located for `b LINE[:COL]` and for
 * source excerpts, the prefixes an IRI is read and written with, a record
 * of the breakpoints set, and the command loop: one line read, split into
 * a command and its arguments, dispatched to a table.
 *
 * What differs is the engine underneath, and each REPL drives its own:
 * the materializer's is pulled (an event per step), the validator's pushes
 * (a gate in the engine's callbacks that reads commands until one lets it
 * go).  Both are the same loop over the same table.
 */
const EditorServices = __importStar(require("./editor-services"));
class DebugRepl {
    constructor(schemaText, schema, opts = {}) {
        this.breakpointDescriptions = [];
        this.write = opts.write || ((s) => process.stdout.write(s));
        this.prompt = opts.prompt || (() => null);
        this.schemaText = schemaText;
        this.schema = schema;
        this.located = EditorServices.locateInParsed(schemaText, schema);
        this.lineStarts = EditorServices.lineOffsets(schemaText);
        this.prefixes = (schema && schema._prefixes) || {};
    }
    /** `<IRI>` or a prefixed name to an IRI, a relative one resolved the way
     * the parser resolved the schema's */
    expand(lex) {
        if (!lex)
            return lex;
        if (lex.startsWith("<") && lex.endsWith(">")) {
            const iri = lex.slice(1, -1);
            try {
                return new URL(iri, (this.schema && this.schema._base) || undefined).href;
            }
            catch (e) {
                return iri;
            }
        }
        const m = lex.match(/^([A-Za-z_][\w.-]*)?:(.*)$/);
        return m && this.prefixes[m[1] || ""] !== undefined
            ? this.prefixes[m[1] || ""] + m[2]
            : lex;
    }
    /** an IRI as the schema's prefixes write it; the start shape has no IRI */
    lex(iri) {
        if (typeof iri !== "string")
            return "START";
        for (const [prefix, ns] of Object.entries(this.prefixes))
            if (ns.length && iri.startsWith(ns))
                return prefix + ":" + iri.substring(ns.length);
        return "<" + iri + ">";
    }
    /** an RDF/JS term as a reader writes it */
    termStr(term) {
        return !term ? "?"
            : term.termType === "BlankNode" ? "_:" + term.value
                : term.termType === "Literal" ? JSON.stringify(term.value)
                    : this.lex(term.value);
    }
    excerpt(range) {
        return EditorServices.sourceExcerpt(this.schemaText, range);
    }
    /**
     * `b LINE[:COL]` read: the constraint at that position -- a bare line
     * means the first constraint the line begins, else whatever the line is
     * inside of; a column means the innermost expression there.  Writes the
     * usage or "no line" and answers null where the argument is no position;
     * answers {from, to} with a null expr where the position holds nothing,
     * for a subclass with a fallback of its own.
     */
    positionHit(arg) {
        const m = (arg || "").match(/^(\d+)(?::(\d+))?$/);
        if (!m) {
            this.write("usage: b LINE[:COL] (1-based)\n");
            return null;
        }
        const lineNo = parseInt(m[1], 10);
        if (lineNo < 1 || lineNo > this.lineStarts.length) {
            this.write("no line " + lineNo + "\n");
            return null;
        }
        const from = this.lineStarts[lineNo - 1];
        const to = lineNo < this.lineStarts.length ? this.lineStarts[lineNo] : this.schemaText.length;
        let hit = null;
        if (m[2]) {
            hit = this.located.locate.exprAt(from + parseInt(m[2], 10) - 1);
        }
        else {
            hit = this.located.locate.exprsStartingIn(from, to)[0] || null;
            for (let offset = from; offset < to && !hit; ++offset)
                hit = this.located.locate.exprAt(offset);
        }
        return { hit, from, to };
    }
    /** remember a breakpoint, and say so */
    noteBreakpoint(description, said) {
        this.breakpointDescriptions.push(description);
        this.write("breakpoint on " + said + "\n");
    }
    /** the breakpoints, one a line, or that there are none */
    showBreakpoints() {
        this.write(this.breakpointDescriptions.length
            ? this.breakpointDescriptions.map(b => "  " + b).join("\n") + "\n"
            : "no breakpoints\n");
    }
    /**
     * Read commands until one answers "return", or EOF (`onEof` answering
     * "return" ends the loop too; by default EOF does).  An unknown command
     * is said so (`onUnknown`, by default "unknown command …; h for help")
     * and asked again; an empty line is nothing.
     */
    commandLoop(promptText, commands, onEof = () => "return", onUnknown = cmd => this.write("unknown command " + JSON.stringify(cmd) + "; h for help\n")) {
        for (;;) {
            const line = this.prompt(promptText);
            if (line === null) {
                if (onEof() === "return")
                    return;
                continue;
            }
            const [cmd, ...args] = line.trim().split(/\s+/);
            if (cmd === "")
                continue;
            const handler = commands[cmd];
            if (!handler) {
                onUnknown(cmd);
                continue;
            }
            if (handler(args) === "return")
                return;
        }
    }
}
exports.DebugRepl = DebugRepl;
//# sourceMappingURL=debug-repl.js.map