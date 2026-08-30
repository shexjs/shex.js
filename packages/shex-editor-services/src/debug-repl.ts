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
import * as EditorServices from "./editor-services";

export interface DebugReplOptions {
  write?: (s: string) => void;
  /** a line, or null at EOF */
  prompt?: (promptText: string) => string | null;
}

/** what a command does with its arguments; "return" leaves the loop */
export type CommandHandler = (args: string[]) => void | "return";

/** a constraint (or, failing that, whatever is there) at a source position */
export interface PositionHit {
  expr: object;
  range: EditorServices.Range;
}

export class DebugRepl {
  write: (s: string) => void;
  prompt: (promptText: string) => string | null;
  schemaText: string;
  schema: any;
  located: EditorServices.LocatedSchema;
  lineStarts: number[];
  prefixes: {[prefix: string]: string};
  breakpointDescriptions: string[] = [];

  constructor (schemaText: string, schema: any, opts: DebugReplOptions = {}) {
    this.write = opts.write || ((s: string) => process.stdout.write(s));
    this.prompt = opts.prompt || (() => null);
    this.schemaText = schemaText;
    this.schema = schema;
    this.located = EditorServices.locateInParsed(schemaText, schema);
    this.lineStarts = EditorServices.lineOffsets(schemaText);
    this.prefixes = (schema && schema._prefixes) || {};
  }

  /** `<IRI>` or a prefixed name to an IRI, a relative one resolved the way
   * the parser resolved the schema's */
  expand (lex: string): string {
    if (!lex)
      return lex;
    if (lex.startsWith("<") && lex.endsWith(">")) {
      const iri = lex.slice(1, -1);
      try {
        return new URL(iri, (this.schema && this.schema._base) || undefined).href;
      } catch (e) {
        return iri;
      }
    }
    const m = lex.match(/^([A-Za-z_][\w.-]*)?:(.*)$/);
    return m && this.prefixes[m[1] || ""] !== undefined
      ? this.prefixes[m[1] || ""] + m[2]
      : lex;
  }

  /** an IRI as the schema's prefixes write it; the start shape has no IRI */
  lex (iri: any): string {
    if (typeof iri !== "string")
      return "START";
    for (const [prefix, ns] of Object.entries(this.prefixes))
      if (ns.length && iri.startsWith(ns))
        return prefix + ":" + iri.substring(ns.length);
    return "<" + iri + ">";
  }

  /** an RDF/JS term as a reader writes it */
  termStr (term: any): string {
    return !term ? "?"
      : term.termType === "BlankNode" ? "_:" + term.value
      : term.termType === "Literal" ? JSON.stringify(term.value)
      : this.lex(term.value);
  }

  excerpt (range: EditorServices.Range): string {
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
  positionHit (arg: string | undefined): {hit: PositionHit | null, from: number, to: number} | null {
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
    let hit: PositionHit | null = null;
    if (m[2]) {
      hit = this.located.locate.exprAt(from + parseInt(m[2], 10) - 1);
    } else {
      hit = this.located.locate.exprsStartingIn(from, to)[0] || null;
      for (let offset = from; offset < to && !hit; ++offset)
        hit = this.located.locate.exprAt(offset);
    }
    return {hit, from, to};
  }

  /** remember a breakpoint, and say so */
  noteBreakpoint (description: string, said: string): void {
    this.breakpointDescriptions.push(description);
    this.write("breakpoint on " + said + "\n");
  }

  /** the breakpoints, one a line, or that there are none */
  showBreakpoints (): void {
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
  commandLoop (promptText: string, commands: {[cmd: string]: CommandHandler},
               onEof: () => void | "return" = () => "return",
               onUnknown: (cmd: string) => void = cmd => this.write("unknown command " + JSON.stringify(cmd) + "; h for help\n")): void {
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
