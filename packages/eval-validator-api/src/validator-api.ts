import * as ShExJ from 'shexj';
import * as RdfJs from '@rdfjs/types/data-model';
import {shapeExprTest, Recursion, SemActFailure} from "@shexjs/term/shexv";
// import {NeighborhoodDb} from "@shexjs/neighborhood-api";
import {SchemaIndex} from "@shexjs/term";
import {Quad as RdfJsQuad} from "@rdfjs/types";
import {TripleConstraint} from "shexj";

export {};

export class MapArray<A, T> {
  public data: Map<A, T[]> = new Map(); // public 'cause I don't know how to fix reduce to use this.data
  add (a:A, t:T): void {
    if (!this.data.has(a)) { this.data.set(a, []); }
    if (this.data.get(a)!.indexOf(t) !== -1) { throw Error(`Error adding [${a}] ${t}; already included`); }
    this.data.get(a)!.push(t);
  }

  get length () { return this.data.size; }

  get keys () { return this.data.keys(); }

  reduce: <U>(f: (acc: U, a: A, x: T[]) => U, acc: U) => U = (f, acc) => {
    const keys = [...this.data.keys()];
    for (const key of keys)
      acc = f(acc, key, this.data.get(key)!);
    return acc
  }

  get(key: A) { return this.data.get(key); }

  empty(key: A) {
    this.data.set(key, [])
  }
}

export type TripleResult = {
  triple: RdfJsQuad;
  res: shapeExprTest;
}
export type ConstraintToTripleResults = MapArray<TripleConstraint, TripleResult>;

export type T2TcPartition = Map<RdfJsQuad, TripleConstraint>;

/** RegexDebugHooks - optional callbacks a debugger hangs inside the match
 * loop (doc/debugger-design.md §4).  onConstraint fires each time the
 * engine (re)considers a TripleConstraint -- including re-visits while
 * backtracking -- with the candidate triples it matches against. */
export interface RegexDebugHooks {
  onConstraint?: (constraint: TripleConstraint,
                  ctx: {node: RdfJs.Term, triples: RdfJsQuad[]}) => void;
}

export interface ValidatorRegexModule {
  name: string;
  description: string;
  compile(schema: ShExJ.Schema, shape: ShExJ.Shape, index: SchemaIndex, debugHooks?: RegexDebugHooks): ValidatorRegexEngine
}

/** one recorded regexEngine.match() invocation, replayable by a debugger
 * (e.g. eval-simple-1err's MatchDebugger) */
export interface MatchCapture {
  shape: ShExJ.Shape;
  node: RdfJs.Term;
  constraintToTripleMapping: ConstraintToTripleResults;
  semActHandler: SemActDispatcher;
  engine: ValidatorRegexEngine;
  result: shapeExprTest;
  /** the module that ran the match: a debugger replaying with another
   * (only eval-simple-1err's engine steps) compiles that one afresh */
  regexModule: string;
  /** what the semantic actions answered as the match ran, for a replay
   * that must not run them again (replayingSemActHandler) */
  semActLog: SemActLog;
}

/** capturingRegexModule - wrap a regex module so every match() run during a
 * validation is recorded with its inputs; a debugger can then replay any of
 * them step by step (doc/debugger-design.md).  The semantic actions run
 * once, here: their answers go into the capture's log, and a replay reads
 * them back rather than dispatching again. */
export function capturingRegexModule (inner: ValidatorRegexModule): {module: ValidatorRegexModule, captures: MatchCapture[]} {
  const captures: MatchCapture[] = [];
  const module: ValidatorRegexModule = {
    name: inner.name + "-capturing",
    description: inner.description + " (recording match invocations)",
    compile: (schema, shape, index, debugHooks) => {
      const engine = inner.compile(schema, shape, index, debugHooks);
      return {
        match: (node, constraintToTripleMapping, semActHandler, trace) => {
          const recorder = recordingSemActHandler(semActHandler);
          const result = engine.match(node, constraintToTripleMapping, recorder.handler, trace);
          captures.push({shape, node, constraintToTripleMapping, semActHandler, engine, result,
                         regexModule: inner.name, semActLog: recorder.log});
          return result;
        }
      };
    }
  };
  return {module, captures};
}

/** one recorded dispatch: which actions over which triples, and what they answered */
export interface SemActDispatchRecord {
  key: string;
  failures: SemActFailure[];
}
export type SemActLog = SemActDispatchRecord[];

function termKey (t: any): string {
  return t && t.termType
    ? t.termType + ":" + t.value + (t.datatype ? "^^" + t.datatype.value : "") + (t.language ? "@" + t.language : "")
    : String(t);
}
function quadKey (q: any): string {
  return q ? [q.subject, q.predicate, q.object].map(termKey).join(" ") : "";
}

/** The key a dispatch is recorded and replayed under: the actions, by name
 * and code, and the triples they ran over -- not the order they ran in.
 * A replay by another engine dispatches the same actions over the same
 * triples in an order of its own, and still finds each answer. */
function semActDispatchKey (semActs: ShExJ.SemAct[] | undefined, ctx: any): string {
  const acts = (semActs || []).map(a => a.name + "\u0001" + (a.code === undefined || a.code === null ? "" : a.code));
  const triples = ctx && Array.isArray(ctx.triples) ? ctx.triples.map(quadKey) : [];
  const node = ctx && ctx.node ? termKey(ctx.node) : "";
  return JSON.stringify([acts, node, triples]);
}

/** recordingSemActHandler - a dispatcher that answers as `inner` does and
 * keeps what it answered, for replayingSemActHandler. */
export function recordingSemActHandler (inner: SemActDispatcher): {handler: SemActDispatcher, log: SemActLog} {
  const log: SemActLog = [];
  const handler: SemActDispatcher = Object.create(inner);
  handler.dispatchAll = (semActs, ctx, resultsArtifact) => {
    const failures = inner.dispatchAll(semActs, ctx, resultsArtifact);
    log.push({key: semActDispatchKey(semActs, ctx), failures});
    return failures;
  };
  return {handler, log};
}

/** replayingSemActHandler - a dispatcher that answers from a log and runs
 * nothing: a side-effect-free replay.  What it is asked that the log
 * doesn't hold (a replay that took another path) it answers "no failures",
 * and lists in `unrecorded`.  Everything but dispatching -- which actions
 * apply, which are registered -- is still `inner`'s to answer. */
export function replayingSemActHandler (log: SemActLog, inner: SemActDispatcher): SemActDispatcher & {unrecorded: string[]} {
  const queues = new Map<string, SemActFailure[][]>();
  log.forEach(({key, failures}) => {
    if (!queues.has(key))
      queues.set(key, []);
    queues.get(key)!.push(failures);
  });
  const handler = Object.create(inner) as SemActDispatcher & {unrecorded: string[]};
  handler.unrecorded = [];
  handler.register = () => { /* nothing runs here */ };
  handler.dispatchAll = (semActs, ctx, _resultsArtifact) => {
    const queue = queues.get(semActDispatchKey(semActs, ctx));
    if (queue && queue.length)
      return queue.shift()!;
    if (semActs && semActs.length)
      handler.unrecorded.push(semActDispatchKey(semActs, ctx));
    return [];
  };
  return handler;
}

export interface ValidatorRegexEngine {
  match(
    point: RdfJs.Term,
    tc2t: ConstraintToTripleResults,
    semActHandler: SemActDispatcher,
    trace: object[] | null
  ): shapeExprTest;
}

export interface QueryTracker {
  enter (term: RdfJs.Term, shapeLabel: string): void;
  exit (term: RdfJs.Term, shapeLabel: string, res: shapeExprTest): void;
  recurse (rec: Recursion): void;
  known (res: shapeExprTest): void;
}

export interface SemActDispatcher {
  register(name: string, handler: SemActHandler): void;
  /**
   * Is there a handler for this action?
   *
   * An action with none is never dispatched (see dispatchAll), so it cannot
   * observe anything and, for validation, may as well not be written.  An
   * engine that changes how it searches when actions are watching asks this
   * first.  Optional so an implementation that predates it still works: a
   * caller that finds it absent should assume the action is live.
   */
  isRegistered?(name: string): boolean;
  /**
   * The actions that apply to a schema element.
   *
   * An overlay may hang actions on an element without writing them into it
   * -- keeping the schema the thing several tools can share -- in which
   * case they are indexed by the element they apply to rather than found on
   * it.  This answers with both, so an engine asks here rather than reading
   * `.semActs` itself.  `own` says where the element keeps its own, for the
   * schema, whose are `startActs`.
   *
   * Optional so an implementation that predates it still works: a caller
   * that finds it absent reads `.semActs`.
   */
  semActsFor?(node: any, own?: ShExJ.SemAct[]): ShExJ.SemAct[] | undefined;
  dispatchAll(semActs: ShExJ.SemAct[] | undefined, ctx: any, resultsArtifact: any): SemActFailure[];
  results: { [id: string]: string | undefined }; // TODO: improve this trivial storage mechanism
}

export interface SemActHandler {
  /**
   * Run one action.
   *
   * `extensionStorage` is where the handler writes into the result;
   * `resultsArtifact` is the result it is being written into -- the
   * TestedTriple, ShapeTest or NodeConstraintTest this action applies to,
   * which is what an action that wants to know what its object matched has
   * to read.  Optional, since a handler that only records ignores it.
   */
  dispatch(code: string | null, ctx: any, extensionStorage: any,
           resultsArtifact?: any): SemActFailure[];
}
