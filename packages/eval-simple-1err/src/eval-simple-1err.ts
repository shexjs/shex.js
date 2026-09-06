import * as ShExJ from 'shexj';
import {rdfJsTerm2Ld, SchemaIndex} from "@shexjs/term";
import type {Quad as RdfJsQuad, Term as RdfJsTerm} from '@rdfjs/types';
import {
  ConstraintToTripleResults,
  RegexDebugHooks,
  SemActDispatcher,
  ValidatorRegexEngine,
  ValidatorRegexModule
} from "@shexjs/eval-validator-api";
import {
  EachOfSolution,
  EachOfSolutions,
  ExcessTripleViolation,
  groupSolution,
  groupSolutions,
  MissingProperty,
  OneOfSolution,
  OneOfSolutions,
  Recursion,
  SemActFailure,
  shapeExprTest,
  TestedTriple,
  TripleConstraintSolutions,
  tripleExprSolutions
} from "@shexjs/term/shexv";

export {};

type ConstraintToTriples = Map<ShExJ.TripleConstraint, RdfJsQuad[]>;

/**
 * A thread's remaining triples, cloned.
 *
 * Threads take their triples by splicing them out of these arrays, so
 * sharing the arrays means what one thread takes another goes without.  The
 * comments here used to say reuse was "safe... but I've not thought about
 * it": it isn't, once a constraint is visited more than once.  A repeated
 * group's second iteration found the pool drained by a *sibling* thread's
 * first iteration and reported the property missing.
 */
function ownPool (avail: ConstraintToTriples): ConstraintToTriples {
  const mine: ConstraintToTriples = new Map();
  avail.forEach((triples, constraint) => mine.set(constraint, triples.slice()));
  return mine;
} // TODO: prefer MapArray<>?

enum ControlType {
  Split, Rept, Match
}

class StackEntry {
  public i: number | null;
  constructor(
      public c: ShExJ.EachOf | ShExJ.OneOf,
      public e: number,
  ) { this.i = null; }
}

class RegExpState {
  protected constructor(
      public outs: number[],
  ) {}
}
class TripleConstraintState extends RegExpState {
  c: ShExJ.TripleConstraint;
  expr: ShExJ.EachOf | ShExJ.OneOf | undefined;
  stack: StackEntry[];
  constructor(
      c: ShExJ.TripleConstraint,
      outs: number[],
      stack: StackEntry[],
  ) {
    super(outs);
    this.c = c;
    this.stack = stack;
  }
}

class ControlState extends RegExpState {}
class SplitState extends ControlState {
  constructor(
      public c: ControlType.Split,
      outs: number[],
      public expr: ShExJ.EachOf | ShExJ.OneOf,
  ) {
    super(outs);
  }
}
class ReptState extends ControlState {
  // cache min/max in normalized form for simplicity of comparison.
  public min: number;
  public max: number;
  constructor(
      public c: ControlType.Rept,
      outs: number[],
      public expr: ShExJ.EachOf | ShExJ.OneOf,
  ) {
    super(outs);
    this.min = expr.min === undefined ? 1 : expr.min;
    this.max = expr.max === undefined
        ? 1
        : expr.max === UNBOUNDED
            ? Infinity
            : expr.max;
  }
}
class MatchState extends ControlState {
  constructor(
      public c: ControlType.Match
  ) {
    super([]);
  }
}

class RegExpPair {
  constructor(
      public start: number,
      public tail: number[],
  ) {}
}

const UNBOUNDED = -1;

export const RegexpModule: ValidatorRegexModule = {
  name: "eval-simple-1err",
  description: "simple regular expression engine with n out states",

  /* compile - compile regular expression and index triple constraints
   */
  compile: (_schema: ShExJ.Schema, shape: ShExJ.Shape, index: SchemaIndex, debugHooks?: RegexDebugHooks): ValidatorRegexEngine => {
    const expression = shape.expression;
    return NFA();

    function NFA() {
      // wrapper for states, startNo and matchstate
      const states: RegExpState[] = [];
      const matchstate = addState(new MatchState(ControlType.Match));
      let startNo = matchstate;
      let pair;
      if (expression) {
        const pair = walkExpr(expression, []);
        patch(pair.tail, matchstate);
        startNo = pair.start;
      }
      return new EvalSimple1ErrRegexEngine(shape, index, states, startNo, matchstate, debugHooks);

      function maybeAddRept(expr: ShExJ.EachOf | ShExJ.OneOf, start: number, tail: number[]): RegExpPair {
        if ((expr.min == undefined || expr.min === 1) &&
            (expr.max == undefined || expr.max === 1))
          return new RegExpPair(start, tail)
        const s = addState(new ReptState(ControlType.Rept, [start], expr));
        patch(tail, s);
        return new RegExpPair(s, [s])
      }

      function walkExpr(expr: ShExJ.tripleExprOrRef, stack: StackEntry[]): RegExpPair {
        let s: number, starts: number[];
        let lastTail: number[];

        if (typeof expr === "string") { // Inclusion
          const included = index.tripleExprs[expr];
          return walkExpr(included, stack);
        } else {
          switch (expr.type) {
            case "TripleConstraint":
              s = addState(new TripleConstraintState(expr, [], stack));
              return new RegExpPair(s, [s]);
            case "OneOf":
              lastTail = [];
              starts = [];
              expr.expressions.forEach(function (nested, ord) {
                pair = walkExpr(nested, stack.concat([new StackEntry(expr, ord)]));
                starts.push(pair.start);
                lastTail = lastTail.concat(pair.tail);
              });
              s = addState(new SplitState(ControlType.Split, starts, expr));
              return maybeAddRept(expr, s, lastTail);
            case "EachOf":
              expr.expressions.forEach(function (nested, ord) {
                pair = walkExpr(nested, stack.concat([new StackEntry(expr, ord)]));
                if (ord === 0)
                  s = pair.start;
                else
                  patch(lastTail, pair.start);
                lastTail = pair.tail;
              });
              return maybeAddRept(expr, s!, lastTail!); // ShExJ says that EachOf has at least two expressions
          }
        }
      }

      function addState(state: RegExpState): number {
        const ret = states.length;
        states.push(state);
        return ret;
      }

      function patch(l: number[], target: number) {
        l.forEach(elt => {
          states[elt].outs.push(target);
        });
      }
    }
  }
}

/**
 * debugging tool; lots of ts-ignores
 */
class NfaToString {
  public known: {
    OneOf: ShExJ.tripleExpr[],
    EachOf: ShExJ.tripleExpr[]
  } = {OneOf: [], EachOf: []};

  dumpTripleConstraint (tc: ShExJ.TripleConstraint) {
    return "<" + tc.predicate + ">";
  }

  card (obj: RegExpState) {
    let x = "";
    if ("min" in obj)
        // @ts-ignore
      x += obj.min;
    if ("max" in obj)
        // @ts-ignore
      x += "," + obj.max;
    return x ? "{" + x + "}" : "";
  }

  junct (j: string | ShExJ.tripleExpr) { // string.type is undefined so this works in js
    // @ts-ignore
    let id = known[j.type].indexOf(j);
    if (id === -1) { // @ts-ignore
      id = known[j.type].push(j) - 1;
    }
    // @ts-ignore
    return j.type + id; // + card(j);
  }

  public dumpStackElt (elt: StackEntry) {
    return this.junct(elt.c) + "." + elt.e + ("i" in elt ? "[" + elt.i + "]" : "");
  }

  public dumpStack (stack: StackEntry[]) {
    return stack.map(elt => {
      return this.dumpStackElt(elt);
    }).join("/");
  }

  public dumpNFA (states: RegExpState[], startNo: number) {
    return states.map((s, i) => {
      return (i === startNo
                  ? s instanceof MatchState
                      ? "."
                      : "S"
                  : s instanceof MatchState
                      ? "E"
                      : " "
          )
          + i + " " + (
              s instanceof SplitState
                  ? ("Split-" + this.junct(s.expr))
                  : s instanceof ReptState
                      ? ("Rept-" + this.junct(s.expr))
                      : s instanceof MatchState
                          ? "Match"
                          : this.dumpTripleConstraint((s as TripleConstraintState).c as ShExJ.TripleConstraint)
          )
          + this.card(s) + "→" + s.outs!.join(" | ") + (
              "stack" in s
                  ? this.dumpStack((s as TripleConstraintState).stack)
                  : ""
          );
    }).join("\n");
  }

  public dumpMatched (matched: TriplesMatch[]) {
    return matched.map(m => {
      return this.dumpTripleConstraint(m.c) + "[" + m.triples.join(",") + "]" + this.dumpStack(m.stack);
    }).join(",");
  }

  public dumpThread (thread: RegExpThread) {
    return "S" + thread.state + ":" + Object.keys(thread.repeats).map(k => {
      return k + "×" + thread.repeats[k];
    }).join(",") + " " + this.dumpMatched(thread.matched);
  }

  public dumpThreadList(list: RegExpThread[]) {
    return "[[" + list.map(thread => {
      return this.dumpThread(thread);
    }).join("\n  ") + "]]";
  }
}

interface Repeats {
  [key: string]: number;
}

/** the inspectable snapshot of a regex thread shipped in debugger events:
 * where it is in the state machine, its repetition counters, and the
 * partition of matched triples it has committed to so far. */
export interface MatchThreadView {
  stateNo: number;
  at: string; // the constraint's predicate, "match", or "control"
  tc?: ShExJ.TripleConstraint;
  repeats: Repeats;
  /** the partition so far: each constraint's triples, spelled out and as
   * quads (for a pane to point at) */
  matched: {predicate: string, triples: string[], quads: RdfJsQuad[]}[];
  errors: number;
  next?: boolean; // true: already stepped into the coming generation
}

export type MatchDebugEvent =
    {type: "constraint", tc: ShExJ.TripleConstraint, generation: number, thread: MatchThreadView}
  | {type: "fail", tc: ShExJ.TripleConstraint, generation: number, thread: MatchThreadView}
  | {type: "accept", generation: number, thread: MatchThreadView};

class RegExpThread {
  constructor(
      public state: number = -1,
      public repeats: Repeats = {},
      public avail: ConstraintToTriples = new Map(),
      public stack = [],
      public matched: TriplesMatch[] = [],
      public errors = [],
      /** for each repeat this thread is inside, the triple count when its
       * current iteration began -- so an iteration that returns to the Rept
       * with the count unchanged can be recognised as an empty match (#16). */
      public reptStarts: Repeats = {},
  ) { }
}

interface TriplesMatch {
  c: ShExJ.TripleConstraint;
  triples: RdfJsQuad[];
  stack: StackEntry[];
}

/**
 * The semantic actions written anywhere in here, by name.
 *
 * Without any, ShEx asks only how many triples a constraint took, so two
 * ways of matching the same bag are the same answer and the frontier can
 * keep one of them.  An action is handed the triples it fired on and does
 * something opaque with them, so where one is watching the specific
 * assignment is part of the answer and the merge has to be off.
 *
 * Names rather than a flag, because an action nobody handles is never
 * dispatched (SemActDispatcher.dispatchAll skips it) and so cannot observe
 * anything.  Which handlers are registered isn't known until match().
 */
function semActNamesIn (exprOrRef: ShExJ.tripleExprOrRef, index: SchemaIndex,
                        seen: Set<string>, into: Set<string>,
                        nodes: Set<object>): Set<string> {
  if (typeof exprOrRef === "string") {
    if (seen.has(exprOrRef))
      return into;                         // an Inclusion cycle
    seen.add(exprOrRef);
    const included = index.tripleExprs[exprOrRef];
    return included === undefined ? into : semActNamesIn(included, index, seen, into, nodes);
  }
  nodes.add(exprOrRef as object);
  (exprOrRef.semActs || []).forEach(sa => into.add(sa.name));
  switch (exprOrRef.type) {
  case "EachOf":
  case "OneOf":
    exprOrRef.expressions.forEach(nested => semActNamesIn(nested, index, seen, into, nodes));
  }
  return into;
}

/**
 * The actions on a schema element: its own, plus any an overlay indexed
 * against it rather than writing into it.  The dispatcher answers, since it
 * is the one holding the index; a dispatcher that predates the question
 * keeps its elements' own.
 */
function semActsOn (semActHandler: SemActDispatcher, node: any): ShExJ.SemAct[] | undefined {
  return semActHandler.semActsFor === undefined
    ? node.semActs
    : semActHandler.semActsFor(node);
}

/** May the frontier be deduplicated, given who is listening? */
function merging (names: Set<string>, nodes: Set<object>,
                  semActHandler: SemActDispatcher): boolean {
  if (semActHandler.semActsFor !== undefined) {
    // an overlay may have indexed actions against these elements rather
    // than writing them in, and the dispatcher is the one who knows
    names = new Set(names);
    nodes.forEach(node =>
      (semActHandler.semActsFor!(node) || []).forEach(sa => names.add(sa.name)));
  }
  if (names.size === 0)
    return true;
  if (semActHandler.isRegistered === undefined)
    return false;                          // can't ask: assume it is live
  for (const name of names)
    if (semActHandler.isRegistered(name))
      return false;
  return true;                             // written, but nobody is handling them
}

class EvalSimple1ErrRegexEngine implements ValidatorRegexEngine {
  static algorithm = "rbenx"; // rename at will; only used for debugging
  private end: number;
  private readonly states: RegExpState[];
  private readonly start: number;
  private readonly shape: ShExJ.Shape;
  /** semantic actions anywhere in this shape, by name: see merging() */
  private readonly semActNames: Set<string>;
  /** ...and the elements they could be on, for actions an overlay indexed */
  private readonly semActNodes: Set<object>;
  private readonly debugHooks?: RegexDebugHooks;
  private _live: (() => {clist: RegExpThread[], nlist: RegExpThread[]}) | null = null;

  constructor(shape: ShExJ.Shape, public index: SchemaIndex, states: RegExpState[], startNo: number, matchstate: number, debugHooks?: RegexDebugHooks) {
    this.shape = shape;
    this.semActNames = new Set((shape.semActs || []).map(sa => sa.name));
    this.semActNodes = new Set([shape as object]);
    if (shape.expression !== undefined)
      semActNamesIn(shape.expression, index, new Set(), this.semActNames, this.semActNodes);
    this.end = matchstate;
    this.states = states;
    this.start = startNo;
    this.debugHooks = debugHooks;
  }

  match(node: RdfJsTerm, constraintToTripleMapping: ConstraintToTripleResults, semActHandler: SemActDispatcher, trace: object[] | null): shapeExprTest {
    // drain the step generator; debuggers drive runMatch() themselves
    const it = this.runMatch(node, constraintToTripleMapping, semActHandler, trace);
    let step = it.next();
    while (!step.done)
      step = it.next();
    return step.value;
  }

  /** runMatch - the NFA simulation as a generator of debugger step events
   * (c.f. ThreadedMaterializer.run; doc/debugger-design.md).  Yields
   * {type: "constraint", tc, generation, thread}  a thread about to consume
   *                                               triples for a constraint
   * {type: "fail", tc, generation, thread}        ...and it spawned nothing
   * {type: "accept", generation, thread}          a thread reached the end
   *                                               state with all triples
   *                                               accounted for
   * and returns the shapeExprTest.  liveThreads() snapshots the worklist
   * between events.
   */
  * runMatch(node: RdfJsTerm, constraintToTripleMapping: ConstraintToTripleResults, semActHandler: SemActDispatcher, trace: object[] | null): Generator<MatchDebugEvent, shapeExprTest> {
    const thisEvalSimple1ErrRegexEngine = this;
    const mayMerge = merging(this.semActNames, this.semActNodes, semActHandler);
    let clist: RegExpThread[] = [], nlist: RegExpThread[] = []; // list of {state:state number, repeats:stateNo->repetitionCount}
    let generation = 0;
    this._live = () => ({clist, nlist}); // closes over the swapped lists
    const allTriples = constraintToTripleMapping.reduce<Set<RdfJsQuad>>((allTriples, _tripleConstraint, tripleResult) => {
      tripleResult.forEach(res => allTriples.add(res.triple));
      return allTriples;
    }, new Set())
    if (thisEvalSimple1ErrRegexEngine.states.length === 1)
      return this.matchedToResult([], constraintToTripleMapping, semActHandler);

    let chosen = null;
    // console.log(new NfaToString().dumpNFA(this.states, this.start));
    this.addstate(clist, this.start, new RegExpThread());
    // The start's closure may already reach the end -- a group taken zero
    // times -- and that is the match where there is nothing to match.
    // The generations below look for the end only among the threads they
    // make, so the first generation has to be looked at here.
    if (allTriples.size === 0) {
      const emptyAccept = clist.find(elt => elt.state === thisEvalSimple1ErrRegexEngine.end);
      if (emptyAccept) {
        chosen = emptyAccept;
        yield {type: "accept", generation, thread: this.threadView(emptyAccept)};
      }
    }
    while (clist.length) {
      nlist = [];
      if (trace)
        trace.push({threads: []});
      for (let threadno = 0; threadno < clist.length; ++threadno) {
        const thread = clist[threadno];
        if (thread.state === thisEvalSimple1ErrRegexEngine.end)
          continue;
        const state = thisEvalSimple1ErrRegexEngine.states[thread.state];
        const nlistlen = nlist.length;
        // may be an Accept state
        if (state instanceof TripleConstraintState) {
          const tripleConstraint = state.c;
          yield {type: "constraint", tc: tripleConstraint, generation,
                 thread: this.threadView(thread)};
          if (this.debugHooks && this.debugHooks.onConstraint)
            this.debugHooks.onConstraint(tripleConstraint, {
              node,
              triples: constraintToTripleMapping.get(tripleConstraint)!.map(pair => pair.triple),
              thread: this.constraintThreadView(thread),
            });
          let min = state.c.min !== undefined ? state.c.min : 1;
          let max = state.c.max !== undefined ? state.c.max === UNBOUNDED ? Infinity : state.c.max : 1;
          if (!thread.avail.has(tripleConstraint))
            thread.avail.set(tripleConstraint, constraintToTripleMapping.get(tripleConstraint)!.map(pair => pair.triple));
          const pool = thread.avail.get(tripleConstraint)!;
          // Start at the minimum and offer each larger take as its own
          // thread.  Starting at the maximum -- as this did -- left nothing
          // for the loop below to add, so a constraint under a repeated
          // group ate every triple on its first iteration and the second
          // went without.
          const taken = pool.splice(0, min);
          if (taken.length >= min) {
            const matched0 = thread.matched;
            do {
              // `taken` and `matched` are both read by reference downstream:
              // addStates keeps the array as a match's `triples` and appends
              // to `thread.matched`.  Each turn of this loop is a separate
              // thread, so each needs its own of both.
              thread.matched = matched0;
              this.addStates(nlist, thread, taken.slice());
            } while ((function () {
              if (pool.length > 0 && taken.length < max) {
                taken.push(pool.shift()!);
                return true; // stay in loop to take more.
              } else {
                return false; // no more to take or we're already at max
              }
            })());
            thread.matched = matched0;
          }
          // the actions run at the end here (matchedToResult), so what was
          // taken is what passed; a thread that spawned nothing died
          if (this.debugHooks && this.debugHooks.onConstraintResult)
            this.debugHooks.onConstraintResult(tripleConstraint, {
              node, taken: taken.slice(), passed: taken.length >= min ? taken.slice() : [], failed: [],
              spawned: nlist.length - nlistlen, thread: this.constraintThreadView(thread),
            });
          if (nlist.length === nlistlen)
            yield {type: "fail", tc: tripleConstraint, generation,
                   thread: this.threadView(thread)};
        }
        if (trace)
          // @ts-ignore
          trace[trace.length - 1].threads.push({
            state: clist[threadno].state,
            to: nlist.slice(nlistlen).map(x => {
              return this.stateString(x.state, x.repeats);
            })
          });
      }

      if (nlist.length === 0 && chosen === null)
        return reportError(localExpect(clist, thisEvalSimple1ErrRegexEngine.states));
      const t = clist;
      // One thread per distinct future rather than per distinct past: two
      // threads in the same state, the same way through the repeats, with
      // the same triples left, will match the rest of the expression the
      // same way.  They differ only in which iteration took which triple --
      // the witness -- so the frontier needs one of each, and the ways to
      // split N triples across iterations collapse to the counts they can
      // leave behind.  Sound because the validator has already given each
      // triple to exactly one TripleConstraint (t2tc), so the triples in a
      // pool are interchangeable and wanted nowhere else.  `avail` is
      // filled in lazily, so a thread that hasn't reached a constraint
      // still has all of its triples.
      const seenFrontier = new Set<string>();
      clist = !mayMerge ? nlist : nlist.filter(thread => {
        const counts: number[] = [];
        constraintToTripleMapping.data.forEach((pairs, constraint) => counts.push(
          thread.avail.has(constraint) ? thread.avail.get(constraint)!.length : pairs.length));
        const key = thread.state + "|" + JSON.stringify(thread.repeats)
              + "|" + thread.errors.length + "|" + counts.join(",");
        if (seenFrontier.has(key))
          return false;
        seenFrontier.add(key);
        return true;
      });
      nlist = t;
      ++generation;
      const longerChosen = clist.reduce<RegExpThread | null>((ret, elt) => {
        const matchedAll =
            elt.matched.reduce<number>((ret, m) => {
              return ret + m.triples.length; // count matched triples
            }, 0) === allTriples.size;
        return ret !== null ? ret : (elt.state === thisEvalSimple1ErrRegexEngine.end && matchedAll) ? elt : null;
      }, null)
      if (longerChosen) {
        chosen = longerChosen;
        yield {type: "accept", generation, thread: this.threadView(longerChosen)};
      }
    }
    if (chosen === null)
      return reportError([]);

    function reportError(_x: shapeExprTest[]) {
      return {
        type: "Failure",
        node: node,
        errors: localExpect(clist, thisEvalSimple1ErrRegexEngine.states)
      }
    }

    function localExpect(clist: RegExpThread[], states: RegExpState[]): shapeExprTest[] {
      const lastState = states[states.length - 1] as TripleConstraintState;
      return clist.reduce<shapeExprTest[]>((acc, elt) => {
        const c = (thisEvalSimple1ErrRegexEngine.states[elt.state] as TripleConstraintState).c; // Always fails on a TCState
        // if (c === ControlType.Match)
        //   return { type: "EndState999" };
        let valueExpr: ShExJ.shapeExprOrRef | null = null;
        if (typeof c.valueExpr === "string") { // ShapeRef
          valueExpr = c.valueExpr;
        } else if (c.valueExpr) {
          valueExpr = c.valueExpr;
        }
        if (elt.state !== thisEvalSimple1ErrRegexEngine.end) {
          const error: MissingProperty = {
            type: "MissingProperty",
            property: lastState.c.predicate,
          };
          if (valueExpr)
            error.valueExpr = valueExpr;
          // @ts-ignore -- Type 'MissingProperty' is not assignable to type 'shapeExprTest'?
          return acc.concat([error]);
        } else {
          const unmatchedTriples: Map<RdfJsQuad, ShExJ.TripleConstraint> = new Map();
          const threadMatches = elt.matched.reduce<Set<RdfJsQuad>>((threadMatches, eltMatched) => {
            eltMatched.triples.forEach(triple => threadMatches.add(triple))
            return threadMatches;
          }, new Set());
          const errors = Array.from(allTriples).reduce<ExcessTripleViolation[]>((errors, triple) => { // can reduce to ShExV.error
            if (!threadMatches.has(triple)) {
              const error: ExcessTripleViolation = {
                type: "ExcessTripleViolation",
                property: lastState.c.predicate, // TODO: needed?
                triple: triple,
              };
              if (valueExpr)
                error.valueExpr = valueExpr;
              errors.push(error);
            }
            return errors;
          }, [])
          return acc.concat(errors);
        }
      }, []);
    }

    // console.log("chosen:", dump.thread(chosen));
    return "errors" in chosen.matched ?
        chosen.matched :
        this.matchedToResult(chosen.matched, constraintToTripleMapping, semActHandler);
  }

  /** the inspectable snapshot of one regex thread */
  threadView (thread: RegExpThread): MatchThreadView {
    const state = this.states[thread.state];
    const term = (t: RdfJsTerm) => t.termType === "Literal" ? JSON.stringify(t.value)
          : t.termType === "BlankNode" ? "_:" + t.value : t.value;
    return {
      stateNo: thread.state,
      at: state instanceof TripleConstraintState ? state.c.predicate
        : state instanceof MatchState ? "match" : "control",
      tc: state instanceof TripleConstraintState ? state.c : undefined,
      repeats: Object.assign({}, thread.repeats),
      matched: thread.matched.map(m => ({
        predicate: m.c.predicate,
        triples: m.triples.map(t => term(t.subject) + " " + term(t.predicate) + " " + term(t.object)),
        quads: m.triples.slice(),
      })),
      errors: thread.errors.length,
    };
  }

  /** the part of a thread every engine reports to a debug hook */
  constraintThreadView (thread: RegExpThread) {
    return {
      matched: thread.matched.map(m => ({predicate: m.c.predicate, triples: m.triples.slice()})),
      errors: thread.errors.length,
      repeats: Object.assign({}, thread.repeats),
      state: thread.state,
    };
  }

  /** snapshot of the worklist for debugger UIs: this generation's threads,
   * then (flagged next: true) the ones already advanced into the coming
   * generation.  Empty before the first runMatch(); after completion it
   * shows the final generation. */
  liveThreads (): MatchThreadView[] {
    if (!this._live)
      return [];
    const {clist, nlist} = this._live();
    return clist.map(th => this.threadView(th))
      .concat(nlist.map(th => Object.assign(this.threadView(th), {next: true})));
  }

  addStates (nlist: RegExpThread[], thread: RegExpThread, taken: RdfJsQuad[]) {
      const state = this.states[thread.state] as TripleConstraintState;
      // find the exprs that require repetition
      const exprs = this.states.map(x => { return x instanceof ReptState ? x.expr : null; });
      const newStack = state.stack.map(e => {
        let i = thread.repeats[exprs.indexOf(e.c)];
        if (i === undefined)
          i = 0; // expr has no repeats
        else
          i = i-1;
        return { c:e.c, e:e.e, i:i };
      });
      const withIndexes: TriplesMatch = {
        c: state.c,
        triples: taken,
        stack: newStack
      };
      thread.matched = thread.matched.concat([withIndexes]);
      state.outs.forEach(o => { // single out if NFA includes epsilons
        this.addstate(nlist, o, thread);
      });
    }

    addstate (list: RegExpThread[], stateNo: number, thread: RegExpThread, seen: string[] = []): number[] {
      const seenkey = this.stateString(stateNo, thread.repeats);
      if (seen.indexOf(seenkey) !== -1)
        return [];
      seen.push(seenkey);

      const s = this.states[stateNo];
      if (s instanceof SplitState) {
        return s.outs!.reduce<number[]>((ret, o) => {
          return ret.concat(this.addstate(list, o, thread, seen));
        }, []);
        // } else if (s.c.type === "OneOf" || s.c.type === "EachOf") { // don't need Rept
      } else if (s instanceof ReptState) {
        const ret: number[] = [];
        // matched = [matched].concat("Rept" + s.expr);
        if (!(stateNo in thread.repeats))
          thread.repeats[stateNo] = 0;
        const repetitions = thread.repeats[stateNo];
        // Triples consumed so far.  An iteration of a nullable body can come
        // back to this Rept without having grown that count -- it matched
        // empty -- and re-entering the body would match empty again forever
        // (issue #16): the outer `*`/`+` over such a body spun off a thread
        // with an ever-larger repeat counter each generation and never
        // drained the worklist.  So the back-edge is barred once an iteration
        // consumes nothing; the empty match can still pad any minimum, so the
        // exit is offered even below min.
        const consumedNow = thread.matched.reduce((n, m) => n + m.triples.length, 0);
        const iterStart = thread.reptStarts[stateNo];
        const emptyIteration = iterStart !== undefined && iterStart === consumedNow;
        // add(r < s.min ? outs[0] : r >= s.min && < s.max ? outs[0], outs[1] : outs[1])
        if (repetitions < s.max! && !emptyIteration) {
          const entered = this.incrmRepeat(thread, stateNo);   // outs[0] to repeat
          entered.reptStarts[stateNo] = consumedNow;           // this iteration starts here
          Array.prototype.push.apply(ret, this.addstate(list, s.outs[0], entered, seen));
        }
        if ((repetitions >= s.min || emptyIteration) && repetitions <= s.max)
          Array.prototype.push.apply(ret, this.addstate(list, s.outs[1], this.resetRepeat(thread, stateNo), seen)); // outs[1] when done
        return ret;
      } else {
        // if (stateNo !== rbenx.end || !thread.avail.reduce((r2, avail) => { faster if we trim early??
        //   return r2 || avail.length > 0;
        // }, false))
        return [list.push(new RegExpThread( // return [new list element index]
            stateNo,
            thread.repeats,
            ownPool(thread.avail), // a thread spends its own triples: see ownPool
            thread.stack,
            thread.matched,
            thread.errors,
            thread.reptStarts
        )) - 1];
      }
    }

    resetRepeat (thread: RegExpThread, repeatedState: number): RegExpThread {
      const trimmedRepeats = Object.keys(thread.repeats).reduce<Repeats>((r, k) => {
        if (parseInt(k) !== repeatedState) // ugh, hash keys are strings
          r[k] = thread.repeats[k];
        return r;
      }, {});
      // leaving the repeat forgets where its iteration began, so a later
      // re-entry (an enclosing repeat) starts its empty-match test afresh.
      const trimmedStarts = Object.keys(thread.reptStarts).reduce<Repeats>((r, k) => {
        if (parseInt(k) !== repeatedState)
          r[k] = thread.reptStarts[k];
        return r;
      }, {});
      return new RegExpThread(
          thread.state/*???*/,
          trimmedRepeats,
          ownPool(thread.avail),
          thread.stack,
          thread.matched,
          [],
          trimmedStarts
      );
    }

    incrmRepeat (thread: RegExpThread, repeatedState: number): RegExpThread {
      const incrmedRepeats = Object.keys(thread.repeats).reduce<Repeats>((r, k) => {
        r[k] = parseInt(k) == repeatedState ? thread.repeats[k] + 1 : thread.repeats[k];
        return r;
      }, {});
      return new RegExpThread(
        thread.state/*???*/,
        incrmedRepeats,
        ownPool(thread.avail),
        thread.stack,
        thread.matched,
        [],
        Object.assign({}, thread.reptStarts) // own copy: the caller stamps this iteration's start
      );
    }

    stateString (state: number, repeats: Repeats): string {
      const rs = Object.keys(repeats).map(rpt => {
        return rpt+":"+repeats[rpt];
      }).join(",");
      return rs.length ? state + "-" + rs : ""+state;
    }

    /** the solution of an expression matched zero times: no solutions,
     * with the cardinality that let it be zero */
    emptySolution (expr: ShExJ.tripleExprOrRef): tripleExprSolutions {
      const resolved: ShExJ.tripleExpr = typeof expr === "string" ? this.index.tripleExprs[expr] : expr;
      const attrs: {[key: string]: any} = {};
      if (resolved.min !== undefined && resolved.min !== 1 || resolved.max !== undefined && resolved.max !== 1) {
        attrs.min = resolved.min;
        attrs.max = resolved.max;
      }
      if (resolved.semActs !== undefined)
        attrs.semActs = resolved.semActs;
      if (resolved.annotations !== undefined)
        attrs.annotations = resolved.annotations;
      switch (resolved.type) {
      case "TripleConstraint":
        return Object.assign({type: "TripleConstraintSolutions", predicate: resolved.predicate},
                             resolved.valueExpr !== undefined ? {valueExpr: resolved.valueExpr} : {},
                             attrs, {solutions: []}) as unknown as tripleExprSolutions;
      case "OneOf":
        return Object.assign({type: "OneOfSolutions", solutions: []}, attrs) as unknown as tripleExprSolutions;
      default:
        return Object.assign({type: "EachOfSolutions", solutions: []}, attrs) as unknown as tripleExprSolutions;
      }
    }

    matchedToResult(matched: TriplesMatch[], constraintToTripleMapping: ConstraintToTripleResults, semActHandler: SemActDispatcher): tripleExprSolutions | SemActFailure {
      // nothing matched: a group taken zero times, which is a solution too
      if (matched.length === 0)
        return this.emptySolution(this.shape.expression!);
      let last: StackEntry[] = [];
      const errors: SemActFailure[] = [];
      const skips: ((tripleExprSolutions | null)[])[] = [];
      const ret = matched.reduce<tripleExprSolutions>((out, m) => {

        let mis = 0;
        let ptr = out;
        while (mis < last.length &&
               m.stack[mis].c === last[mis].c && // constraint
               m.stack[mis].i === last[mis].i && // iteration number
               m.stack[mis].e === last[mis].e) { // (dis|con)junction number
          ptr = (ptr.solutions[last[mis].i!] as (EachOfSolution | OneOfSolution)).expressions[last[mis].e];
          ++mis;
        }
        while (mis < m.stack.length) {
          if (mis >= last.length) {
            last.push({} as StackEntry); // to be filled in below
          }
          let xOfSolns: groupSolution[];
          if (m.stack[mis].c !== last[mis].c) {
            const t: groupSolution[] = [];
            ptr.type = m.stack[mis].c.type === "EachOf" ? "EachOfSolutions" : "OneOfSolutions";
            (ptr as EachOfSolutions).solutions = t as EachOfSolution[]; // arbitrary down cast
            if ("min" in m.stack[mis].c)
              ptr.min = m.stack[mis].c.min;
            if ("max" in m.stack[mis].c)
              ptr.max = m.stack[mis].c.max;
            if ("annotations" in m.stack[mis].c)
              ptr.annotations = m.stack[mis].c.annotations;
            if ("semActs" in m.stack[mis].c)
              ptr.semActs = m.stack[mis].c.semActs;
            xOfSolns = t;
            last[mis].i = null;
            // !!! on the way out to call after valueExpr test
            const groupSemActs = semActsOn(semActHandler, m.stack[mis].c);
            if (groupSemActs !== undefined && groupSemActs.length > 0) {
              const ctx = {
                triples: constraintToTripleMapping.get(m.c)!
                  .map(m => m.triple),
                tripleExpr: m.c
              };
              const errors = semActHandler.dispatchAll(groupSemActs, ctx, ptr);
              if (errors.length)
                throw errors;
            }
            // if (ret && "semActs" in expr) { ret.semActs = expr.semActs; }
          } else {
            xOfSolns = ptr.solutions as groupSolution[];
          }
          let texprSolns: tripleExprSolutions[];
          if (m.stack[mis].i !== last[mis].i) {
            const t: tripleExprSolutions[] = [];
            xOfSolns[m.stack[mis].i!] = {
              type: m.stack[mis].c.type === "EachOf" ? "EachOfSolution" : "OneOfSolution",
              expressions: t as groupSolutions[]
            };
            texprSolns = t;
            last[mis].e = -1; // trigger m.stack[mis].e !== last[mis].e below
          } else {
            texprSolns = (xOfSolns[last[mis].i!] as EachOfSolution).expressions;
          }
          if (m.stack[mis].e !== last[mis].e) {
            const t = {} as TripleConstraintSolutions;
            texprSolns[m.stack[mis].e] = t;
            if (m.stack[mis].e > 0 && texprSolns[m.stack[mis].e - 1] === undefined && skips.indexOf(texprSolns) === -1)
              skips.push(texprSolns);
            ptr = t;
            last.length = mis + 1; // chop off last so we create everything underneath
          } else {
            throw "how'd we get here?"
            // ptr = texprSolns[last[mis].e];
          }
          ++mis;
        }
        const tcSolns = ptr as TripleConstraintSolutions;
        tcSolns.type = "TripleConstraintSolutions";
        if ("min" in m.c)
          tcSolns.min = m.c.min;
        if ("max" in m.c)
          tcSolns.max = m.c.max;
        tcSolns.predicate = m.c.predicate;
        if ("valueExpr" in m.c)
          tcSolns.valueExpr = m.c.valueExpr;
        if ("id" in m.c)
          tcSolns.productionLabel = m.c.id;
        tcSolns.solutions = m.triples.reduce<TestedTriple[]>((acc, triple) => {

          const ret = {
            type: "TestedTriple",
            subject: rdfJsTerm2Ld(triple.subject),
            predicate: rdfJsTerm2Ld(triple.predicate),
            object: rdfJsTerm2Ld(triple.object)
          } as TestedTriple;

          const hit = constraintToTripleMapping.get(m.c)!.find(x => x.triple === triple);
          if (hit!.res && Object.keys(hit!.res).length > 0)
            ret.referenced = hit!.res as shapeExprTest | Recursion;
          const constraintSemActs = semActsOn(semActHandler, m.c);
          if (errors.length === 0 && constraintSemActs !== undefined && constraintSemActs.length > 0) {
            Array.prototype.push.apply(errors, semActHandler.dispatchAll(constraintSemActs, {triples:[triple], tripleExpr: m.c}, ret));
          }
          return acc.concat(ret);
        }, [])
        if ("annotations" in m.c)
          tcSolns.annotations = m.c.annotations;
        if ("semActs" in m.c)
          tcSolns.semActs = m.c.semActs;
        last = m.stack.slice();
        return out;
      }, {} as tripleExprSolutions);

      if (errors.length)
        return {
          type: "SemActFailure",
          errors: errors
        };

      // Clear out the nulls for the expressions with min:0 and no matches.
      // <S> { (:p .; :q .)?; :r . } \ { <s> :r 1 } -> i:0, e:1 resulting in null at e=0
      // Maybe we want these nulls in expressions[] to make it clear that there are holes?
      skips.forEach(skip => {
        for (let exprNo = 0; exprNo < skip.length; ++exprNo)
          if (skip[exprNo] === null || skip[exprNo] === undefined)
            skip.splice(exprNo--, 1);
      });

      if ("semActs" in this.shape)
        ret.semActs = this.shape.semActs;
      return ret;
    }
  }

/** MatchDebugger - step-through control over one shape's NFA simulation
 * (c.f. MaterializerDebugger in @shexjs/extension-map).  Drives
 * runMatch() one event at a time; entirely synchronous.
 *
 *   const engine = RegexpModule.compile(schema, shape, index);
 *   const dbg = new MatchDebugger(engine, node, tc2t, semActHandler);
 *   dbg.addBreakpoint({predicate: "http://a.example/p"});
 *   let at = dbg.continue();   // to the breakpoint (or completion)
 *   at = dbg.stepInto();       // next event
 *   at = dbg.stepOver();       // next generation (all threads stepped once)
 *   dbg.threads();             // worklist snapshot: state-machine position,
 *                              // repeats, matched-triples partition
 *   ... dbg.done, dbg.result, dbg.error
 */
export class MatchDebugger {
  private readonly engine: EvalSimple1ErrRegexEngine;
  private readonly generator: Generator<MatchDebugEvent, shapeExprTest>;
  public breakpoints = {tcs: new Set<ShExJ.TripleConstraint>(), predicates: new Set<string>()};
  public current: MatchDebugEvent | {type: "done", result: shapeExprTest} | {type: "error", error: Error} | null = null;
  public done = false;
  public result: shapeExprTest | null = null;
  public error: Error | null = null;

  constructor (engine: ValidatorRegexEngine, node: RdfJsTerm,
               constraintToTripleMapping: ConstraintToTripleResults,
               semActHandler: SemActDispatcher) {
    this.engine = engine as EvalSimple1ErrRegexEngine;
    if (typeof this.engine.runMatch !== "function")
      throw Error("MatchDebugger needs " + RegexpModule.name + "'s steppable engine");
    this.generator = this.engine.runMatch(node, constraintToTripleMapping, semActHandler, null);
  }

  addBreakpoint ({tc, predicate}: {tc?: ShExJ.TripleConstraint, predicate?: string}) {
    if (tc) this.breakpoints.tcs.add(tc);
    if (predicate) this.breakpoints.predicates.add(predicate);
    return this;
  }

  protected _hitsBreakpoint (event: MatchDebugEvent) {
    return event.type === "constraint" &&
      (this.breakpoints.tcs.has(event.tc) || this.breakpoints.predicates.has(event.tc.predicate));
  }

  protected _advance (stopWhen: (ev: MatchDebugEvent) => boolean) {
    if (this.done)
      return this.current;
    while (true) {
      let step;
      try {
        step = this.generator.next();
      } catch (e) {
        this.done = true;
        this.error = e as Error;
        return this.current = {type: "error", error: this.error};
      }
      if (step.done) {
        this.done = true;
        this.result = step.value;
        return this.current = {type: "done", result: step.value};
      }
      if (stopWhen(step.value) || this._hitsBreakpoint(step.value))
        return this.current = step.value;
    }
  }

  /** pause at the very next event */
  stepInto () { return this._advance(() => true); }

  /** run the rest of this generation; pause in the next one */
  stepOver () {
    const generation = this.current && "generation" in this.current ? this.current.generation : -1;
    return this._advance(event => event.generation > generation);
  }

  /** run to the next breakpoint, or to completion */
  continue () { return this._advance(() => false); }

  /** worklist snapshot (see liveThreads) */
  threads () { return this.engine.liveThreads(); }
}
