import * as ShExJ from 'shexj';
import {rdfJsTerm2Ld, SchemaIndex} from "@shexjs/term";
import type {Quad as RdfJsQuad, Term as RdfJsTerm} from 'rdf-js';
import {NeighborhoodDb} from "@shexjs/neighborhood-api";
import {
  NoTripleConstraint,
  ValidatorRegexModule,
  ValidatorRegexEngine,
  Tc2t,
  T2TcPartition, SemActDispatcher, TcAssignment
} from "@shexjs/eval-validator-api";
import {
  MissingProperty,
  ExcessTripleViolation,
  shapeExprTest,
  SemActFailure,
  tripleExprSolutions,
  EachOfSolution,
  OneOfSolution,
  OneOfSolutions,
  EachOfSolutions,
  TripleConstraintSolutions,
  tripleExprSolution, TestedTriple, Recursion
} from "@shexjs/term/shexv";

export {};

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
  negated: boolean | undefined; // TODO: remove? needed in negation branch?
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
  compile: (_schema: ShExJ.Schema, shape: ShExJ.Shape, index: SchemaIndex): ValidatorRegexEngine => {
    const expression = shape.expression;
    return NFA();

    function NFA() {
      // wrapper for states, startNo and matchstate
      const states: RegExpState[] = [];
      const matchstate = addState(new MatchState(ControlType.Match));
      let startNo = matchstate;
      const stack = [];
      let pair;
      if (expression) {
        const pair = walkExpr(expression, []);
        patch(pair.tail, matchstate);
        startNo = pair.start;
      }
      return new EvalSimple1ErrRegexEngine(shape, states, startNo, matchstate);

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


    /**
     * debugging tool; lots of ts-ignores
     */
    function nfaToString() {
      const known: {
        OneOf: ShExJ.tripleExpr[],
        EachOf: ShExJ.tripleExpr[]
      } = {OneOf: [], EachOf: []};

      function dumpTripleConstraint(tc: ShExJ.TripleConstraint) {
        return "<" + tc.predicate + ">";
      }

      function card(obj: RegExpState) {
        let x = "";
        if ("min" in obj)
          // @ts-ignore
          x += obj.min;
        if ("max" in obj)
          // @ts-ignore
          x += "," + obj.max;
        return x ? "{" + x + "}" : "";
      }

      function junct(j: string | ShExJ.tripleExpr) { // string.type is undefined so this works in js
        // @ts-ignore
        let id = known[j.type].indexOf(j);
        if (id === -1) { // @ts-ignore
          id = known[j.type].push(j) - 1;
        }
        // @ts-ignore
        return j.type + id; // + card(j);
      }

      function dumpStackElt(elt: RegExpState) {
        // @ts-ignore
        return junct(elt.c) + "." + elt.e + ("i" in elt ? "[" + elt.i + "]" : "");
      }

      function dumpStack(stack: RegExpState[]) {
        return stack.map(elt => {
          return dumpStackElt(elt);
        }).join("/");
      }

      function dumpNFA(states: RegExpState[], startNo: number) {
        return states.map((s, i) => {
          // @ts-ignore
          return (i === startNo ? s instanceof MatchState ? "." : "S" : s instanceof MatchState ? "E" : " ") + i + " " + (
              s instanceof SplitState ? ("Split-" + junct(s.expr)) :
                  s instanceof ReptState ? ("Rept-" + junct(s.expr)) :
                      s instanceof MatchState ? "Match" :
                          // @ts-ignore
                          dumpTripleConstraint(s.c as ShExJ.TripleConstraint)
              // @ts-ignore
          ) + card(s) + "→" + s.outs!.join(" | ") + ("stack" in s ? dumpStack(s.stack) : "");
        }).join("\n");
      }

      function dumpMatched(matched: TriplesMatch[]) {
        return matched.map(m => {
          // @ts-ignore
          return dumpTripleConstraint(m.c) + "[" + m.triples.join(",") + "]" + dumpStack(m.stack);
        }).join(",");
      }

      function dumpThread(thread: RegExpThread) {
        return "S" + thread.state + ":" + Object.keys(thread.repeats).map(k => {
          // @ts-ignore
          return k + "×" + thread.repeats[k];
        }).join(",") + " " + dumpMatched(thread.matched);
      }

      function dumpThreadList(list: RegExpThread[]) {
        return "[[" + list.map(thread => {
          return dumpThread(thread);
        }).join("\n  ") + "]]";
      }

      return {
        nfa: dumpNFA,
        stack: dumpStack,
        stackElt: dumpStackElt,
        thread: dumpThread,
        threadList: dumpThreadList
      };
    }
  }
}


interface Repeats {
  [key: string]: number;
}

class RegExpThread {
  constructor(
      public state: number = -1,
      public repeats: Repeats = {},
      public avail: number[][] = [],
      public stack = [],
      public matched: TriplesMatch[] = [],
      public errors = [],
  ) { }
}

interface TriplesMatch {
  c: ShExJ.TripleConstraint;
  triples: number[];
  stack: StackEntry[];
}

class EvalSimple1ErrRegexEngine implements ValidatorRegexEngine {
  static algorithm = "rbenx"; // rename at will; only used for debugging
  private end: number;
  private states: RegExpState[];
  private start: number;
  private shape: ShExJ.Shape;

  constructor(shape: ShExJ.Shape, states: RegExpState[], startNo: number, matchstate: number) {
    this.shape = shape;
    this.end = matchstate;
    this.states = states;
    this.start = startNo;
  }

  match(_db: NeighborhoodDb, node: RdfJsTerm, constraintList: ShExJ.TripleConstraint[], constraintToTripleMapping: Tc2t[][], tripleToConstraintMapping: T2TcPartition, neighborhood: RdfJsQuad[], semActHandler: SemActDispatcher, trace: object[] | null): object {
    const rbenx = this;
    let clist: RegExpThread[] = [], nlist: RegExpThread[] = []; // list of {state:state number, repeats:stateNo->repetitionCount}

    if (rbenx.states.length === 1)
      return this.matchedToResult([], constraintList, constraintToTripleMapping, neighborhood, semActHandler);

    let chosen = null;
    // const dump = nfaToString();
    // console.log(dump.nfa(this.states, this.start));
    this.addstate(clist, this.start, new RegExpThread());
    while (clist.length) {
      nlist = [];
      if (trace)
        trace.push({threads: []});
      for (let threadno = 0; threadno < clist.length; ++threadno) {
        const thread = clist[threadno];
        if (thread.state === rbenx.end)
          continue;
        const state = rbenx.states[thread.state];
        const nlistlen = nlist.length;
        // may be Accept!
        if (state instanceof TripleConstraintState) {
          const constraintNo = constraintList.indexOf(state.c);
          let min = state.c.min !== undefined ? state.c.min : 1;
          let max = state.c.max !== undefined ? state.c.max === UNBOUNDED ? Infinity : state.c.max : 1;
          // if ("negated" in state.c && state.c.negated)
          //   min = max = 0;
          if (thread.avail[constraintNo] === undefined)
            thread.avail[constraintNo] = constraintToTripleMapping[constraintNo].map(pair => pair.tNo);
          const taken = thread.avail[constraintNo].splice(0, max);
          if (taken.length >= min) {
            do {
              this.addStates(nlist, thread, taken);
            } while ((function () {
              if (thread.avail[constraintNo].length > 0 && taken.length < max) {
                taken.push(thread.avail[constraintNo].shift()!);
                return true; // stay in look to take more.
              } else {
                return false; // no more to take or we're already at max
              }
            })());
          }
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
      // console.log(dump.threadList(nlist));
      if (nlist.length === 0 && chosen === null)
        return reportError(localExpect(clist, rbenx.states));
      const t = clist;
      clist = nlist;
      nlist = t;
      const longerChosen = clist.reduce<RegExpThread | null>((ret, elt) => {
        const matchedAll =
            elt.matched.reduce<number>((ret, m) => {
              return ret + m.triples.length; // count matched triples
            }, 0) === tripleToConstraintMapping.reduce<number>((ret, t) => {
              return t === NoTripleConstraint ? ret : ret + 1; // count expected
            }, 0);
        return ret !== null ? ret : (elt.state === rbenx.end && matchedAll) ? elt : null;
      }, null)
      if (longerChosen)
        chosen = longerChosen;
      // if (longerChosen !== null)
      //   console.log(JSON.stringify(this.matchedToResult(longerChosen.matched)));
    }
    if (chosen === null)
      return reportError([]);

    function reportError(_x: shapeExprTest[]) {
      return {
        type: "Failure",
        node: node,
        errors: localExpect(clist, rbenx.states)
      }
    }

    function localExpect(clist: RegExpThread[], states: RegExpState[]): shapeExprTest[] {
      const lastState = states[states.length - 1] as TripleConstraintState;
      return clist.reduce<shapeExprTest[]>((acc, elt) => {
        const c = (rbenx.states[elt.state] as TripleConstraintState).c; // Always fails on a TCState
        // if (c === ControlType.Match)
        //   return { type: "EndState999" };
        let valueExpr: ShExJ.shapeExprOrRef | null = null;
        if (typeof c.valueExpr === "string") { // ShapeRef
          valueExpr = c.valueExpr;
        } else if (c.valueExpr) {
          valueExpr = c.valueExpr;
        }
        if (elt.state !== rbenx.end) {
          const error: MissingProperty = {
            type: "MissingProperty",
            property: lastState.c.predicate,
          };
          if (valueExpr)
            error.valueExpr = valueExpr;
          // @ts-ignore -- Type 'MissingProperty' is not assignable to type 'shapeExprTest'?
          return acc.concat([error]);
        } else {
          const unmatchedTriples: {[key: number]: TcAssignment} = {};
          // Collect triples assigned to some constraint.
          for (const k in tripleToConstraintMapping) {
            if (tripleToConstraintMapping[k] !== NoTripleConstraint)
              unmatchedTriples[k] = tripleToConstraintMapping[k];
          }
          // Removed triples matched in this thread.
          elt.matched.forEach(m => {
            m.triples.forEach(t => {
              delete unmatchedTriples[t];
            });
          });

          const errors = Object.keys(unmatchedTriples).map(i => {
            const error: ExcessTripleViolation = {
              type: "ExcessTripleViolation",
              property: lastState.c.predicate,
              triple: neighborhood![unmatchedTriples[i as unknown as number] as number], // TODOL doesn't really get TcAssignment?
            };
            if (valueExpr)
              error.valueExpr = valueExpr;
            return error as unknown as shapeExprTest; // TODO: why?
          });
          return acc.concat(errors);
        }
      }, []);
    }

    // console.log("chosen:", dump.thread(chosen));
    return "errors" in chosen.matched ?
        chosen.matched :
        this.matchedToResult(chosen.matched, constraintList, constraintToTripleMapping, neighborhood, semActHandler);
  }

  addStates (nlist: RegExpThread[], thread: RegExpThread, taken: number[]) {
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
        // add(r < s.min ? outs[0] : r >= s.min && < s.max ? outs[0], outs[1] : outs[1])
        if (repetitions < s.max!)
          Array.prototype.push.apply(ret, this.addstate(list, s.outs[0], this.incrmRepeat(thread, stateNo), seen)); // outs[0] to repeat
        if (repetitions >= s.min && repetitions <= s.max)
          Array.prototype.push.apply(ret, this.addstate(list, s.outs[1], this.resetRepeat(thread, stateNo), seen)); // outs[1] when done
        return ret;
      } else {
        // if (stateNo !== rbenx.end || !thread.avail.reduce((r2, avail) => { faster if we trim early??
        //   return r2 || avail.length > 0;
        // }, false))
        return [list.push(new RegExpThread( // return [new list element index]
            stateNo,
            thread.repeats,
            thread.avail.map(a => { // copy parent thread's avail vector
              return a.slice();
            }),
            thread.stack,
            thread.matched,
            thread.errors
        )) - 1];
      }
    }

    resetRepeat (thread: RegExpThread, repeatedState: number): RegExpThread {
      const trimmedRepeats = Object.keys(thread.repeats).reduce<Repeats>((r, k) => {
        if (parseInt(k) !== repeatedState) // ugh, hash keys are strings
          r[k] = thread.repeats[k];
        return r;
      }, {});
      return new RegExpThread(
          thread.state/*???*/,
          trimmedRepeats,
          thread.avail.slice(),
          thread.stack,
          thread.matched,
          []
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
        thread.avail.slice(),
        thread.stack,
        thread.matched,
        []
      );
    }

    stateString (state: number, repeats: Repeats): string {
      const rs = Object.keys(repeats).map(rpt => {
        return rpt+":"+repeats[rpt];
      }).join(",");
      return rs.length ? state + "-" + rs : ""+state;
    }

    matchedToResult (matched: TriplesMatch[], constraintList: ShExJ.TripleConstraint[], constraintToTripleMapping: Tc2t[][], neighborhood: RdfJsQuad[], semActHandler: SemActDispatcher): tripleExprSolutions | SemActFailure {
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
          let xOfSolns: tripleExprSolution[];
          if (m.stack[mis].c !== last[mis].c) {
            const t: tripleExprSolution[] = []; // TODO: really just EachOfSolutions or OneOfSolution
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
            if ("semActs" in m.stack[mis].c) {
              const errors = semActHandler.dispatchAll(m.stack[mis].c.semActs, "???", ptr);
              if (errors.length)
                throw errors;
            }
            // if (ret && "semActs" in expr) { ret.semActs = expr.semActs; }
          } else {
            xOfSolns = ptr.solutions;
          }
          let texprSolns: tripleExprSolutions[];
          if (m.stack[mis].i !== last[mis].i) {
            const t: tripleExprSolutions[] = [];
            xOfSolns[m.stack[mis].i!] = {
              type:m.stack[mis].c.type === "EachOf" ? "EachOfSolution" : "OneOfSolution",
              expressions: t
            };
            texprSolns = t;
            // @ts-ignore
            last[mis].e = null;
          } else {
            texprSolns = (xOfSolns[last[mis].i!] as EachOfSolution).expressions;
          }
          if (m.stack[mis].e !== last[mis].e) {
            const t = {} as TripleConstraintSolutions;
            texprSolns[m.stack[mis].e] = t;
            if (m.stack[mis].e > 0 && texprSolns[m.stack[mis].e-1] === undefined && skips.indexOf(texprSolns) === -1)
              skips.push(texprSolns);
            ptr = t;
            last.length = mis + 1; // chop off last so we create everything underneath
          } else {
            throw "how'd we get here?"
            ptr = texprSolns[last[mis].e];
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
        tcSolns.solutions = m.triples.map(tNo => {
          const triple = neighborhood[tNo];
          const ret = {
            type: "TestedTriple",
            subject: rdfJsTerm2Ld(triple.subject),
            predicate: rdfJsTerm2Ld(triple.predicate),
            object: rdfJsTerm2Ld(triple.object)
          } as TestedTriple;

          const constraintNo = constraintList.indexOf(m.c);
                      const hit = constraintToTripleMapping[constraintNo].find(x => x.tNo === tNo);
                      if (hit!.res && Object.keys(hit!.res).length > 0)
                        ret.referenced = hit!.res as shapeExprTest|Recursion;
          if (errors.length === 0 && "semActs" in m.c)
            { // @ts-ignore
              [].push.apply(errors, semActHandler.dispatchAll(m.c.semActs, triple, ret));
            }
          return ret;
        })
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

function extend(base: object): object {
  if (!base) base = {};
  for (let i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
    for (let name in arg)
      { // @ts-ignore
        base[name] = arg[name];
      }
  return base;
}

