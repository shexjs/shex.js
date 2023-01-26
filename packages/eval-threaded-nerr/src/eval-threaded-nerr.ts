import * as ShExJ from 'shexj';
import {rdfJsTerm2Ld, SchemaIndex} from "@shexjs/term";
import type {Quad as RdfJsQuad, Term as RdfJsTerm} from 'rdf-js';
import {NeighborhoodDb} from "@shexjs/neighborhood-api";
import {
  NoTripleConstraint,
  ValidatorRegexModule,
  ValidatorRegexEngine,
  T2TcPartition, SemActDispatcher, ConstraintToTripleResults
} from "@shexjs/eval-validator-api";
import {
  MissingProperty,
  ExcessTripleViolation,
  tripleExprSolutions,
  EachOfSolution,
  OneOfSolution,
  TripleConstraintSolutions,
  tripleExprSolution, TestedTriple, groupSolution, groupSolutions, error
} from "@shexjs/term/shexv";

export {};

const UNBOUNDED = -1;

type ConstraintToTriples = Map<ShExJ.TripleConstraint, RdfJsQuad[]>; // TODO: prefer MapArray<>?

interface PossibleErrors {
  type: "PossibleErrors"
  errors: error[][];
}

interface TripleList {
  triples: RdfJsQuad[];
}

interface RegexpThread {
  avail: ConstraintToTriples;
  errors: error[];
  matched: TripleList[];
  solution?: groupSolution
  expression?: tripleExprSolutions
}

export const RegexpModule: ValidatorRegexModule = {
  name: "eval-threaded-nerr",
  description: "emulation of regular expression engine with error permutations",

  /* compile - compile regular expression and index triple constraints
   */
  compile: (_schema: ShExJ.Schema, shape: ShExJ.Shape, index: SchemaIndex): ValidatorRegexEngine => {
    return new EvalThreadedNErrRegexEngine(shape, index); // not called if there's no expression
  }
}

interface GroupAttrs {
  min?: number,
  max?: number,
  semActs?: ShExJ.SemAct[];
  annotations?: ShExJ.Annotation[];
}

interface TripleTestedErrors {
  triple: RdfJsQuad;
  tested: TestedTriple;
  semActErrors: any;
}

class EvalThreadedNErrRegexEngine implements ValidatorRegexEngine {
  public outerExpression: ShExJ.tripleExprOrRef;
  constructor(
      public shape: ShExJ.Shape,
      public index: SchemaIndex,
  ) {
    this.outerExpression = shape.expression!;
  }

  match(_db: NeighborhoodDb, node: RdfJsTerm, constraintList: ShExJ.TripleConstraint[], constraintToTripleMapping: ConstraintToTripleResults, _tripleToConstraintMapping: T2TcPartition, neighborhood: RdfJsQuad[], semActHandler: SemActDispatcher, _trace: object[] | null): object {
    const allTriples = constraintToTripleMapping.reduce<Set<RdfJsQuad>>((allTriples, _tripleConstraint, tripleResult) => {
      tripleResult.forEach(res => allTriples.add(res.triple));
      return allTriples;
    }, new Set())
    const _EvalThreadedNErrRegexEngine = this;
    /*
     * returns: list of passing or failing threads (no heterogeneous lists)
     */
    function validateExpr(expr: ShExJ.tripleExprOrRef, thread: RegexpThread): RegexpThread[] {
      if (typeof expr === "string") { // Inclusion
        const included = _EvalThreadedNErrRegexEngine.index.tripleExprs[expr];
        return validateExpr(included, thread);
      }

      let min = expr.min !== undefined ? expr.min : 1;
      let max = expr.max !== undefined ? expr.max === UNBOUNDED ? Infinity : expr.max : 1;

      function validateRept(groupTE: ShExJ.EachOf | ShExJ.OneOf, type: "EachOfSolutions" | "OneOfSolutions", val: (th: RegexpThread) => (RegexpThread)[]) {
        let repeated = 0, errOut = false;
        let newThreads = [thread];
        const minmax = {} as GroupAttrs;
        if (groupTE.min !== undefined && groupTE.min !== 1 || groupTE.max !== undefined && groupTE.max !== 1) {
          minmax.min = groupTE.min;
          minmax.max = groupTE.max;
        }
        if (groupTE.semActs !== undefined)
          minmax.semActs = groupTE.semActs;
        if (groupTE.annotations !== undefined)
          minmax.annotations = groupTE.annotations;
        for (; repeated < max && !errOut; ++repeated) {
          let inner: RegexpThread[] = [];
          for (let t = 0; t < newThreads.length; ++t) {
            const newt = newThreads[t];
            const sub = val(newt);
            if (sub.length > 0 && sub[0].errors.length === 0) { // all subs pass or all fail
              sub.forEach(newThread => {
                const solutions: tripleExprSolution[] =
                    newt.expression !== undefined ? newt.expression.solutions.slice() : [];
                if (newThread.solution !== undefined)
                  solutions.push(newThread.solution);
                delete newThread.solution;
                newThread.expression = Object.assign({
                  type: type,
                  solutions: solutions
                }, minmax) as groupSolutions;
              });
            }
            if (sub.length === 0 /* min:0 */ || sub[0].errors.length > 0)
              return repeated < min ? sub : newThreads;
            else
              inner = inner.concat(sub);
            // newThreads.expressions.push(sub);
          }
          newThreads = inner;
        }
        if (newThreads.length > 0 && newThreads[0].errors.length === 0 && groupTE.semActs !== undefined) {
          const passes: RegexpThread[] = [];
          const failures: RegexpThread[] = [];
          newThreads.forEach(newThread => {
            const semActErrors = semActHandler.dispatchAll(groupTE.semActs, "???", newThread)
            if (semActErrors.length === 0) {
              passes.push(newThread)
            } else {
              Array.prototype.push.apply(newThread.errors, semActErrors);
              failures.push(newThread);
            }
          });
          newThreads = passes.length > 0 ? passes : failures;
        }
        return newThreads;
      }

      if (expr.type === "TripleConstraint") {
        const constraint = expr;
        if (thread.avail.get(constraint) === undefined)
          thread.avail.set(constraint, constraintToTripleMapping.get(constraint)!.map(pair => pair.triple));
        const minmax = {} as GroupAttrs;
        if (expr.min !== undefined && expr.min !== 1 || expr.max !== undefined && expr.max !== 1) {
          minmax.min = expr.min;
          minmax.max = expr.max;
        }
        if (expr.semActs !== undefined)
          minmax.semActs = expr.semActs;
        if (expr.annotations !== undefined)
          minmax.annotations = expr.annotations;
        const taken = thread.avail.get(constraint)!.splice(0, min);
        const passed = taken.length >= min;
        const ret: RegexpThread[] = [];
        const matched = thread.matched;
        if (passed) {
          do {
            const passFail = taken.reduce<{pass: TripleTestedErrors[], fail: TripleTestedErrors[]}>((acc, triple) => {
              const tested = {
                type: "TestedTriple",
                subject: rdfJsTerm2Ld(triple.subject),
                predicate: rdfJsTerm2Ld(triple.predicate),
                object: rdfJsTerm2Ld(triple.object)
              } as TestedTriple
              const hit = constraintToTripleMapping.get(constraint)!.find(x => x.triple === triple)!; // will definitely find one
              if (hit.res !== undefined)
                tested.referenced = hit.res;
              const semActErrors = thread.errors.concat(
                  expr.semActs !== undefined
                      ? semActHandler.dispatchAll(expr.semActs, triple, tested)
                      : []
              )
              if (semActErrors.length > 0)
                acc.fail.push(<TripleTestedErrors>{triple, tested, semActErrors})
              else
                acc.pass.push(<TripleTestedErrors>{triple, tested, semActErrors})
              return acc
            }, {pass: [], fail: []})


            // return an empty solution if min card was 0
            if (passFail.fail.length === 0) {
              // If we didn't take anything, fall back to old errors.
              // Could do something fancy here with a semAct registration for negative matches.
              const totalErrors = taken.length === 0 ? thread.errors.slice() : []
              const myThread = makeThread(expr, passFail.pass, totalErrors)
              ret.push(myThread);
            } else {
              passFail.fail.forEach(
                  f => ret.push(makeThread(expr, [f], f.semActErrors))
              )
            }

            function makeThread(expr: ShExJ.TripleConstraint, tests: TripleTestedErrors[], errors: error[]) {
              return {
                avail: new Map(thread.avail), // copy parent thread's avail vector,
                errors: errors,
                matched: matched.concat({
                  triples: tests.map(p => p.triple)
                }),
                expression: Object.assign(
                    {
                      type: "TripleConstraintSolutions",
                      predicate: expr.predicate
                    },
                    expr.valueExpr !== undefined ? {valueExpr: expr.valueExpr} : {},
                    expr.id !== undefined ? {productionLabel: expr.id} : {},
                    minmax,
                    {
                      solutions: tests.map(p => p.tested)
                    }
                )
              }
            }
          } while ((function () {
            if (thread.avail.get(constraint)!.length > 0 && taken.length < max) {
              // build another thread.
              taken.push(thread.avail.get(constraint)!.shift()!);
              return true;
            } else {
              // no more threads
              return false;
            }
          })());
        } else {
          ret.push({
            avail: thread.avail,
            errors: thread.errors.concat([
              Object.assign({
                type: "MissingProperty",
                property: expr.predicate
              }, expr.valueExpr ? { valueExpr: expr.valueExpr } : {})
            ]),
            matched: matched
          });
        }

        return ret;
      } else if (expr.type === "OneOf") {
        return validateRept(expr, "OneOfSolutions", (th) => {
          // const accept = null;
          const matched: RegexpThread[] = [];
          const failed: RegexpThread[] = [];
          expr.expressions.forEach(nested => {
            const thcopy = {
              avail: new Map(th.avail),
              errors: th.errors,
              matched: th.matched//.slice() ever needed??
            } as RegexpThread;
            const sub = validateExpr(nested, thcopy);
            if (sub[0].errors.length === 0) { // all subs pass or all fail
              Array.prototype.push.apply(matched, sub);
              sub.forEach(newThread => {
                const expressions =
                    thcopy.solution !== undefined ? thcopy.solution.expressions : [];
                if (newThread.expression !== undefined) // undefined for no matches on min card:0
                  expressions.push(newThread.expression as groupSolutions);
                delete newThread.expression;
                newThread.solution = {
                  type: "OneOfSolution",
                  expressions: expressions
                };
              });
            } else
              Array.prototype.push.apply(failed, sub);
          });
          return matched.length > 0 ? matched : failed;
        });
      } else if (expr.type === "EachOf") {
        return homogenize(validateRept(expr, "EachOfSolutions", (th) => {
          // Iterate through nested expressions, exprThreads starts as [th].
          return expr.expressions.reduce((exprThreads, nested) => {
            // Iterate through current thread list composing nextThreads.
            // Consider e.g.
            // <S1> { <p1> . | <p2> .; <p3> . } / { <x> <p2> 2; <p3> 3 } (should pass)
            // <S1> { <p1> .; <p2> . }          / { <s1> <p1> 1 }        (should fail)
            return homogenize(exprThreads.reduce<RegexpThread[]>((nextThreads, exprThread) => {
              const sub = validateExpr(nested, exprThread);
              // Move newThread.expression into a hierarchical solution structure.
              sub.forEach(newThread => {
                if (newThread.errors.length === 0) {
                  const expressions =
                      exprThread.solution !== undefined ? exprThread.solution.expressions.slice() : [];
                  if (newThread.expression !== undefined) // undefined for no matches on min card:0
                    expressions.push(newThread.expression as groupSolutions);
                  delete newThread.expression;
                  newThread.solution = {
                    type: "EachOfSolution",
                    expressions: expressions // exprThread.expression + newThread.expression
                  };
                }
              });
              return nextThreads.concat(sub);
            }, []));
          }, [th]);
        }));
      } else {
        // runtimeError("unexpected expr type: " + expr.type);
        throw Error("how'd we get here?")
      }

      function homogenize(list: RegexpThread[]): RegexpThread[] {
        return list.reduce<{errors: boolean, l: RegexpThread[]}>((acc, elt) => {
          if (elt.errors.length === 0) {
            if (acc.errors) {
              return {errors: false, l: [elt]};
            } else {
              return {errors: false, l: acc.l.concat(elt)};
            }
          } else {
            if (acc.errors) {
              return {errors: true, l: acc.l.concat(elt)};
            } else {
              return acc;
            }
          }
        }, {errors: true, l: []}).l;
      }
    }

    const startingThread = {
      avail: new Map(),   // triples remaining by constraint
      matched: [], // triples matched in this thread
      errors: []   // errors encounted
    } as RegexpThread;
    const ret = validateExpr(this.outerExpression, startingThread);
    // console.log(JSON.stringify(ret));
    // note: don't return if ret.length === 1 because it might fail the unmatchedTriples test.
    const longerChosen =
        ret.reduce<RegexpThread | null>((ret, elt) => {
          if (elt.errors.length > 0)
            return ret;              // early return
          const unmatchedTriples = new Set<RdfJsQuad>(allTriples);

          // Removed triples matched in this thread.
          elt.matched.forEach(m => {
            m.triples.forEach(t => {
              unmatchedTriples.delete(t);
            });
          });
          // Remaining triples are unaccounted for.
          unmatchedTriples.forEach(t => { // TODO: for in -ify
            elt.errors.push({
              type: "ExcessTripleViolation",
              triple: t,
            });
          });
          return ret !== null ? ret : // keep first solution
              // Accept thread with no unmatched triples.
              unmatchedTriples.size > 0 ? null : elt;
        }, null);

    return longerChosen !== null ?
        this.finish(longerChosen.expression!, constraintList,
            neighborhood, semActHandler) :
        ret.length > 1 ? {
          type: "PossibleErrors",
          errors: ret.reduce<error[]>((all, e) => {
            return all.concat([e.errors]);
          }, [])
        } : {
          type: "Failure",
          node: node,
          errors: ret[0].errors
        };
  }

  finish(fromValidatePoint: tripleExprSolutions, _constraintList: ShExJ.TripleConstraint[], _neighborhood: RdfJsQuad[], _semActHandler: SemActDispatcher): tripleExprSolutions {
    if (this.shape.semActs !== undefined)
      fromValidatePoint.semActs = this.shape.semActs;
    return fromValidatePoint;
  }
}
