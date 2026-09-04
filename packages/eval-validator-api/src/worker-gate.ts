/** worker-gate - the suspension mechanism for live whole-validation
 * stepping in a browser (doc/debugger-design.md §1, §4).
 *
 * The recursive ShExValidator can't yield mid-flight the way the
 * materializer's generator does, so to step it we run it synchronously in a
 * Worker and block the worker thread between events.  Each time the
 * validator's tracker or a regex engine's debugHook reports an event, the
 * worker calls `WorkerGate.gate(event)`: if the current step mode or a
 * breakpoint says to pause, it postMessages the event to the controlling
 * thread and `Atomics.wait`s on a command cell in a SharedArrayBuffer until
 * that thread writes a command (into/over/out/continue/abort) and
 * `Atomics.notify`s.  Blocking the worker IS the suspension -- the CLI
 * `shex-debug` gets the same suspension by blocking on stdin instead.
 *
 * The breakpoint set is **frozen while the worker runs and editable only
 * while it is paused**: a resume carries the (possibly edited) breakpoints
 * as a JSON payload in the same buffer, so the worker adopts them at the
 * instant it wakes and never races the controller reading a set mid-search.
 *
 * The two ends:
 *   - `WorkerGate` runs in the worker (owns the mode + frozen breakpoints,
 *     blocks and reads commands);
 *   - `GateController` runs in the controlling thread (writes commands +
 *     breakpoints, notifies).
 * Both are dependency-free (only `Atomics`/`SharedArrayBuffer`, global in a
 * worker and in Node's worker_threads), so the wiring of an actual
 * ShExValidator into a gate lives with each worker (the browser's
 * ShExWorkerThread, a test's worker), not here -- keeping this below the
 * validator in the dependency graph.
 */

import * as RdfJs from '@rdfjs/types/data-model';
import {Quad as RdfJsQuad} from "@rdfjs/types";
import * as ShExJ from 'shexj';
import {TripleConstraint} from "shexj";
import {shapeExprTest} from "@shexjs/term/shexv";
import {ShapeDebugEvent} from "./validator-api";

// globals in a Worker and in Node's worker_threads, but not in this
// package's minimal tsconfig `lib`
declare const TextEncoder: {new (): {encode (s: string): Uint8Array}};
declare const TextDecoder: {new (): {decode (b: Uint8Array): string}};

/** The command a paused worker reads, written into CMD_INDEX by the
 * controller.  WAIT (0) is the armed/blocked state: the worker waits *while*
 * the cell holds it, and resets it to WAIT after adopting a command. */
export const Command = {
  WAIT: 0,
  INTO: 1,
  OVER: 2,
  OUT: 3,
  CONTINUE: 4,
  ABORT: 5,
} as const;
export type CommandName = "into" | "over" | "out" | "continue" | "abort";
const NAME_TO_CODE: {[k in CommandName]: number} = {
  into: Command.INTO, over: Command.OVER, out: Command.OUT,
  continue: Command.CONTINUE, abort: Command.ABORT,
};

/** SharedArrayBuffer layout: two Int32 control slots then a UTF-8 payload. */
const CMD_INDEX = 0;   // the command (Command.*)
const LEN_INDEX = 1;   // byte length of the resume payload
const HEADER_INTS = 2;
const HEADER_BYTES = HEADER_INTS * 4;
const DEFAULT_PAYLOAD_BYTES = 1 << 16; // 64 KiB of breakpoints is plenty

/** the buffer both ends share: header + room for a breakpoints payload */
export function createCommandBuffer (payloadBytes = DEFAULT_PAYLOAD_BYTES): SharedArrayBuffer {
  return new SharedArrayBuffer(HEADER_BYTES + payloadBytes);
}

/** schemaTripleConstraints - every TripleConstraint of a schema in a
 * deterministic order (shapes as declared, each expression tree depth-first,
 * into a constraint's inline valueExpr but never through a reference).  An
 * index into this ordering is the clone-safe name for a constraint that both
 * the worker and the controller derive from their own copy of the schema --
 * the same trick the materializer uses across postMessage. */
export function schemaTripleConstraints (schema: ShExJ.Schema): TripleConstraint[] {
  const found: TripleConstraint[] = [];
  const seen = new Set<object>();
  const shapeExpr = (expr: any): void => {
    if (!expr || typeof expr !== "object" || seen.has(expr))
      return; // a string is a reference: reached through its declaration
    seen.add(expr);
    switch (expr.type) {
    case "ShapeDecl": return shapeExpr(expr.shapeExpr);
    case "ShapeAnd": case "ShapeOr": return (expr.shapeExprs || []).forEach(shapeExpr);
    case "ShapeNot": return shapeExpr(expr.shapeExpr);
    case "Shape": return tripleExpr(expr.expression);
    }
  };
  const tripleExpr = (expr: any): void => {
    if (!expr || typeof expr !== "object" || seen.has(expr))
      return; // a string is an Inclusion
    seen.add(expr);
    switch (expr.type) {
    case "EachOf": case "OneOf": return (expr.expressions || []).forEach(tripleExpr);
    case "TripleConstraint":
      found.push(expr as TripleConstraint);
      return shapeExpr((expr as TripleConstraint).valueExpr);
    }
  };
  (schema.shapes || []).forEach(shapeExpr);
  return found;
}

/** thrown out of the engine when the controller commands abort; a
 * FlowControlError the worker's run wrapper catches to report "aborted"
 * (c.f. shex-debug's DebugQuit). */
export class DebugAbort extends Error {
  readonly isDebugAbort = true;
  constructor () { super("validation aborted by debugger"); this.name = "DebugAbort"; }
}

/** the clone-safe breakpoints a resume carries: shapes/predicates/nodes as
 * their lexical strings, constraints as ordinals into the schema's
 * tripleConstraints() ordering (object identity doesn't survive a clone, so
 * both ends name a constraint by the same index). */
export interface WireBreakpoints {
  shapes?: string[];
  predicates?: string[];
  nodes?: string[];      // "<IRI>"-less lexical form; a blank node as "_:label"
  constraints?: number[];
}

/** a term reduced to what crosses postMessage and drives the UI / a node
 * breakpoint (an N3 term's value/termType are prototype getters that a
 * structured clone would drop). */
export interface SerializedTerm { termType: string; value: string; datatype?: string; language?: string; }

/** a gate event as it reaches the controller */
export interface SerializedGateEvent {
  type: string;
  depth: number;
  node?: SerializedTerm;
  shape?: string;
  tcOrdinal?: number;
  predicate?: string;
  candidates?: number;   // constraint: how many candidate triples
  ok?: boolean;          // exit: did the shape pass
}

/** the constraint-level event a regex engine's debugHook reports (shaped as
 * shex-debug builds it), joined with the tracker's ShapeDebugEvents. */
export type ConstraintDebugEvent = {
  type: "constraint";
  tc: TripleConstraint;
  node: RdfJs.Term;
  triples: RdfJsQuad[];
  depth: number;
};
export type GateEvent = ShapeDebugEvent | ConstraintDebugEvent;

type Mode =
    {kind: "into"}
  | {kind: "over", depth: number}
  | {kind: "out", depth: number}
  | {kind: "continue"};

function termLex (term: RdfJs.Term | undefined): SerializedTerm | undefined {
  if (!term) return undefined;
  const t = term as any;
  const out: SerializedTerm = {termType: t.termType, value: t.value};
  if (t.datatype) out.datatype = t.datatype.value;
  if (t.language) out.language = t.language;
  return out;
}

/** the string a node breakpoint is keyed by: an IRI by its value, a blank
 * node as "_:label" (matching shex-debug's `bn`). */
function nodeKey (term: RdfJs.Term): string {
  return term.termType === "BlankNode" ? "_:" + term.value : term.value;
}

/** WorkerGate - runs in the worker; `gate(event)` is what the validator's
 * tracker and debugHooks call. */
export class WorkerGate {
  private ctrl: Int32Array;
  private bytes: Uint8Array;
  private post: (msg: {type: "paused", event: SerializedGateEvent}) => void;
  private ordinalOf: Map<TripleConstraint, number>;
  private decoder = new TextDecoder();
  private mode: Mode = {kind: "into"}; // pause at the first event
  private bp = {
    shapes: new Set<string>(), predicates: new Set<string>(),
    nodes: new Set<string>(), constraints: new Set<number>(),
  };

  /** @param sab the shared command buffer (from createCommandBuffer)
   *  @param post posts a message to the controlling thread
   *  @param tripleConstraints the schema's constraints in the shared
   *    ordering (extension-map's / a walk of the same shape), for ordinals */
  constructor (sab: SharedArrayBuffer,
               post: (msg: {type: "paused", event: SerializedGateEvent}) => void,
               tripleConstraints: TripleConstraint[]) {
    this.ctrl = new Int32Array(sab, 0, HEADER_INTS);
    this.bytes = new Uint8Array(sab, HEADER_BYTES);
    this.post = post;
    this.ordinalOf = new Map(tripleConstraints.map((tc, i) => [tc, i]));
  }

  /** the validator reports an event here; pause if the mode or a breakpoint
   * says so, blocking the worker until the controller resumes it. */
  gate (event: GateEvent): void {
    if (!this.shouldPause(event))
      return;
    // arm the cell *before* announcing the pause, so a controller that
    // resumes immediately makes Atomics.wait return "not-equal" (no missed
    // wakeup) rather than the notify racing ahead of the wait.
    Atomics.store(this.ctrl, CMD_INDEX, Command.WAIT);
    this.post({type: "paused", event: this.serialize(event)});
    Atomics.wait(this.ctrl, CMD_INDEX, Command.WAIT);
    const code = Atomics.load(this.ctrl, CMD_INDEX);
    const len = Atomics.load(this.ctrl, LEN_INDEX);
    if (len > 0)
      this.adoptBreakpoints(JSON.parse(this.decoder.decode(this.bytes.subarray(0, len))));
    Atomics.store(this.ctrl, CMD_INDEX, Command.WAIT); // disarm for the next gate
    this.applyCommand(code, event.depth);
  }

  private applyCommand (code: number, depth: number): void {
    switch (code) {
    case Command.INTO:     this.mode = {kind: "into"}; break;
    case Command.OVER:     this.mode = {kind: "over", depth}; break;
    case Command.OUT:      this.mode = {kind: "out", depth}; break;
    case Command.CONTINUE: this.mode = {kind: "continue"}; break;
    case Command.ABORT:    throw new DebugAbort();
    default:               this.mode = {kind: "continue"}; // unknown: don't wedge
    }
  }

  private adoptBreakpoints (bp: WireBreakpoints): void {
    this.bp = {
      shapes: new Set(bp.shapes || []),
      predicates: new Set(bp.predicates || []),
      nodes: new Set(bp.nodes || []),
      constraints: new Set(bp.constraints || []),
    };
  }

  /** the stepping semantics: pure logic over the mode and the frozen
   * breakpoints (identical to shex-debug's, constraints keyed by ordinal). */
  private shouldPause (event: GateEvent): boolean {
    if (event.type === "enter" &&
        (this.bp.shapes.has(event.shape) || this.matchesNode(event.node)))
      return true;
    if (event.type === "constraint" &&
        (this.bp.constraints.has(this.ordinalOf.get(event.tc) ?? -1) ||
         this.bp.predicates.has(event.tc.predicate) ||
         this.matchesNode(event.node)))
      return true;
    switch (this.mode.kind) {
    case "into": return true;
    case "over": return event.depth <= this.mode.depth;
    case "out":  return event.depth <  this.mode.depth;
    default:     return false; // continue
    }
  }

  private matchesNode (term: RdfJs.Term | undefined): boolean {
    if (!term || this.bp.nodes.size === 0)
      return false;
    return this.bp.nodes.has(nodeKey(term));
  }

  private serialize (event: GateEvent): SerializedGateEvent {
    const out: SerializedGateEvent = {type: event.type, depth: event.depth};
    if ("node" in event && event.node) out.node = termLex(event.node);
    if (event.type === "constraint") {
      out.tcOrdinal = this.ordinalOf.get(event.tc) ?? -1;
      out.predicate = event.tc.predicate;
      out.candidates = event.triples ? event.triples.length : 0;
    } else if ("shape" in event && typeof event.shape === "string") {
      out.shape = event.shape;
    }
    if (event.type === "exit")
      out.ok = !isFailure(event.result);
    return out;
  }
}

function isFailure (result: shapeExprTest | undefined): boolean {
  return !!result && typeof result === "object" && "errors" in (result as any);
}

/** GateController - runs in the controlling thread; writes a command (and
 * the possibly-edited breakpoints) into the shared buffer and wakes the
 * paused worker.  Message routing is the caller's -- the worker's "paused"
 * message is a normal postMessage the caller handles, then calls a
 * resume method here. */
export class GateController {
  private ctrl: Int32Array;
  private bytes: Uint8Array;
  private encoder = new TextEncoder();

  constructor (sab: SharedArrayBuffer) {
    this.ctrl = new Int32Array(sab, 0, HEADER_INTS);
    this.bytes = new Uint8Array(sab, HEADER_BYTES);
  }

  /** resume the worker with a step command, adopting `breakpoints` as the
   * new frozen set for the run until the next pause. */
  resume (command: CommandName, breakpoints: WireBreakpoints = {}): void {
    const json = this.encoder.encode(JSON.stringify(breakpoints));
    if (json.length > this.bytes.length)
      throw new Error(`breakpoint payload ${json.length}B exceeds buffer ${this.bytes.length}B`);
    this.bytes.set(json);
    Atomics.store(this.ctrl, LEN_INDEX, json.length);   // LEN before CMD: the
    Atomics.store(this.ctrl, CMD_INDEX, NAME_TO_CODE[command]); // atomic that
    Atomics.notify(this.ctrl, CMD_INDEX);               // releases the payload
  }

  into (bp?: WireBreakpoints)     { this.resume("into", bp); }
  over (bp?: WireBreakpoints)     { this.resume("over", bp); }
  out (bp?: WireBreakpoints)      { this.resume("out", bp); }
  continue (bp?: WireBreakpoints) { this.resume("continue", bp); }
  abort ()                        { this.resume("abort", {}); }
}
