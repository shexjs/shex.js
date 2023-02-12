/* ShExValidator - javascript module to validate a graph with respect to Shape Expressions
 */

// interface constants
import * as ShExTerm from "@shexjs/term";
import {InternalSchema, Meta, rdfJsTerm2Ld, SchemaIndex, ShapeMap, ShapeMapEntry} from "@shexjs/term";
import {
  QueryTracker,
  SemActDispatcher,
  SemActHandler,
  T2TcPartition,
  ValidatorRegexEngine,
  ValidatorRegexModule,
  MapArray,
  ConstraintToTripleResults, TripleResult, ConstraintToTriples
} from "@shexjs/eval-validator-api";
import * as Hierarchy from 'hierarchy-closure';
import type {Quad, Term as RdfJsTerm} from 'rdf-js';
import {Neighborhood, NeighborhoodDb, Start as NeighborhoodStart} from "@shexjs/neighborhood-api";
import {
  error,
  Failure,
  FailureList, groupSolution,
  NestedFailure,
  NodeConstraintTest,
  NodeConstraintViolation,
  Recursion,
  SemActFailure,
  ShapeAndFailure,
  shapeExprTest,
  ShapeNotFailure,
  ShapeNotResults,
  ShapeTest,
  SolutionList, TestedTriple, tripleExprSolutions,
} from "@shexjs/term/shexv";
import * as ShExJ from "shexj";
import {
  EachOf,
  IRIREF,
  IriStem,
  IriStemRange,
  Language,
  LanguageStem,
  LanguageStemRange,
  LiteralStem,
  LiteralStemRange,
  NodeConstraint,
  ObjectLiteral,
  OneOf,
  Schema,
  Shape,
  ShapeAnd,
  ShapeDecl, shapeDeclLabel,
  shapeDeclRef,
  shapeExprOrRef,
  ShapeNot,
  ShapeOr,
  TripleConstraint,
  tripleExpr
} from "shexj";
import * as RdfJs from "@rdfjs/types/data-model";
import {Literal as RdfJsLiteral, Quad as RdfJsQuad} from "@rdfjs/types/data-model";
import {index as indexSchema, Visitor as ShExVisitor} from "@shexjs/visitor";
import {
  ShExValidator,
  ShapeExprValidationContext,
  EmptyTracker,
  LabelOrStart,
  SeenIndex,
  MatchTarget,
  ByPredicateResult,
  MapMap,
  TriplesMatching,
  TriplesMatchingMiss,
  TriplesMatchingHit,
  TriplesMatchingNoValueConstraint,
  ValidatorOptions
} from "@shexjs/validator";
import {Store, DataFactory} from 'n3';
import {
  EvalThreadedNErrRegexEngine,
  GroupAttrs,
  RegexpThread,
  TripleList,
  TripleTestedErrors
} from "@shexjs/eval-threaded-nerr";
import {ShapeMapParser} from "@shexjs/webapp";
const StringToRdfJs = require("../lib/stringToRdfJs");
import * as assert from "assert";
const extensions = require("../lib/extensions");

const MapExt = "http://shex.io/extensions/Map/#";
const pattern = /^ *(?:<([^>]*)>|([^:]*):([^ ]*)) *$/;
const UNBOUNDED = -1;
const MAX_MAX_CARD = 50;

export {};

export class MaterializerValidationContext extends ShapeExprValidationContext {
  private store: Store;
  public cursor: BindingCursor;
  public focus: RdfJsTerm | undefined;

  getStore (): Store {
    return this.store;
  }
  constructor(
      parent: ShapeExprValidationContext | null,
      label: LabelOrStart, // Can only be Start if it's the root of a context list.
      depth: number,
      tracker: QueryTracker,
      seen: SeenIndex,
      matchTarget: MatchTarget | null,
      subGraph: NeighborhoodDb | null,
      cursor: BindingCursor
  ) {
    super(parent, label, depth, tracker, seen, matchTarget, subGraph);
    this.store = parent === null ? new Store() : (parent as MaterializerValidationContext).store;
    this.cursor = cursor;
  }

  public checkShapeLabel (label: LabelOrStart): MaterializerValidationContext {
    return new MaterializerValidationContext(this, label, this.depth + 1, this.tracker, this.seen, this.matchTarget, this.subGraph, this.cursor);
  }

  public followTripleConstraint (): MaterializerValidationContext {
    return new MaterializerValidationContext(this, this.label, this.depth + 1, this.tracker, this.seen, this.matchTarget, null, this.cursor);
  }

  public checkExtendsPartition (subGraph: NeighborhoodDb): MaterializerValidationContext {
    return new MaterializerValidationContext(this, this.label, this.depth + 1, this.tracker, this.seen, this.matchTarget, subGraph, this.cursor);
  }

  public checkExtendingClass (label: LabelOrStart, matchTarget: MatchTarget | null): MaterializerValidationContext {
    return new MaterializerValidationContext(this, label, this.depth + 1, this.tracker, this.seen, matchTarget, this.subGraph, this.cursor);
  }

  setFocus (focus: RdfJsTerm) {
    this.focus = focus;
  }
  getFocus (): RdfJsTerm | undefined {
    return this.focus;
  }
}

export class ShExMaterializerValidator extends ShExValidator {
  public meta: Meta
  constructor(schema: InternalSchema, meta: Meta = {base: "", prefixes: {}}, db: NeighborhoodDb, options: ValidatorOptions = {}) {
    super(schema, db, options);
    this.meta = meta;
  }

  evaluateShapeOr (focus: RdfJsTerm, shapeOr: ShapeOr, ctx: MaterializerValidationContext) {
    const orErrors = [];
    for (let i = 0; i < shapeOr.shapeExprs.length; ++i) {
      const nested = shapeOr.shapeExprs[i];
      const sub = this.validateShapeExpr(focus, nested, ctx);
      if ("errors" in sub)
        orErrors.push(sub);
      else if (!ctx.matchTarget || ctx.matchTarget.count > 0)
        return {type: "ShapeOrResults", solution: sub};
    }
    return {type: "ShapeOrFailure", errors: orErrors} as any as shapeExprTest;
  }

  validateShape(focus: RdfJsTerm, shape: Shape, ctx: MaterializerValidationContext): shapeExprTest {
    // ctx.setFocus(focus);
    // const oldRegexModule = this.regexModule;
    // this.regexModule = {
    //   name: "asdf",
    //   description: "qwer",
    //   compile: (_schema: ShExJ.Schema, shape: ShExJ.Shape, _index: SchemaIndex): ValidatorRegexEngine => {
    //     return new MaterializerRegexEngine(shape, this);
    //   }
    //   // compile: (this.schema, shape, this.index)
    // };
    // const ret = super.validateShape(focus, shape, ctx);
    // this.regexModule = oldRegexModule;
    // // propagate triples to ctx.parent

    // from validateShape
    let ret: shapeExprTest | null = null;

    const missErrors: error[] = [];

    const partitionErrors: error[][] = [];
    const regexEngine = new MaterializerRegexEngine(shape, this.meta, this, ctx);

    // from tryPartition
    const tc2ts: ConstraintToTripleResults = new MapArray<TripleConstraint, TripleResult>(); // passed through exprs to matchTripleConstraint, and won't be used in the materializer

    const errors: error[] = [];

    let results: shapeExprTest | null = null; // TODO: this.testExtends(shape, focus, extendsToTriples, ctx);
    if (results === null || !("errors" in results)) {
      if (regexEngine !== null /* i.e. shape.expression !== undefined */) {
        const sub = regexEngine.match(focus, tc2ts, this.semActHandler, null);
        if (!("errors" in sub) && results) {
          results = {type: "ExtendedResults", extensions: results, local: sub};
        } else {
          results = sub;
        }
      } else if (results) { // constructs { ExtendedResults, extensions: { ExtensionResults ... } with no local: { ... } }
        results = {type: "ExtendedResults", extensions: results}; // TODO: keep that redundant nesting for consistency?
      }
    }
    // TODO: what if results is a TypedError (i.e. not a container of further errors)?
    if (results !== null && (results as NestedFailure).errors !== undefined)
      Array.prototype.push.apply(errors, (results as NestedFailure).errors);

    // from validateShape
    const possibleRet = { type: "ShapeTest", node: rdfJsTerm2Ld(focus), shape: ctx.label };
    if (errors.length === 0 && results !== null) // only include .solution for non-empty pattern
        // @ts-ignore TODO
      possibleRet.solution = results;
    if ("semActs" in shape) {
      const semActErrors = this.semActHandler.dispatchAll(shape.semActs, Object.assign({node: focus}, results), possibleRet)
      if (semActErrors.length)
          // some semAct aborted
        Array.prototype.push.apply(errors, semActErrors);
    }

    partitionErrors.push(errors)
    if (errors.length === 0)
      ret = possibleRet

    const lastErrors = partitionErrors[partitionErrors.length - 1];
    // let errors = missErrors.concat(lastErrors.length === 1 ? lastErrors[0] : lastErrors);
    if (errors.length > 0)
      ret = {
        type: "Failure",
        node: rdfJsTerm2Ld(focus),
        shape: ctx.label,
        errors: errors
      };

    return this.addShapeAttributes(shape, ret!);
  }

  /**
   * For each TripleConstraint TC, for each triple T | T.p === TC.p, get the result of testing the value constraint.
   * @param constraintList - list of TripleConstraint
   * @param neighborhood - list of Quad
   * @param ctx - evaluation context
   */
/*  protected matchByPredicate (constraintList: TripleConstraint[], neighborhood: Neighborhood, ctx: MaterializerValidationContext): ByPredicateResult {
    const _ShExValidator = this;
    const init: ByPredicateResult = { t2tcErrors: new Map(), tc2TResults: new MapMap(), t2tcs:new MapArray() };
    [neighborhood.outgoing, neighborhood.incoming].forEach(quads =>
        quads.forEach(triple =>
            init.t2tcs.data.set(triple, [])
        )
    );
    return constraintList.reduce<ByPredicateResult>(function (ret, constraint) {

      // get triples matching predicate
      const matchPredicate: Quad[] =
          []; // empty list when no triple matches that constraint

      // strip to triples matching value constraints (apart from @<someShape>)
      const matchConstraints = _ShExValidator.triplesMatchingShapeExpr(matchPredicate, constraint, ctx);

      matchConstraints.hits.forEach(function (evidence) {
        ret.t2tcs.add(evidence.triple, constraint);
        ret.tc2TResults.set(constraint, evidence.triple, evidence.sub);
      });
      matchConstraints.misses.forEach(function (evidence) {
        ret.t2tcErrors.set(evidence.triple, {constraint: constraint, errors: evidence.sub});
      });
      return ret;
    }, init);
  }

  triplesMatchingShapeExpr (triples: Quad[], constraint: TripleConstraint, ctx: MaterializerValidationContext): TriplesMatching {
    const _ShExValidator = this;
    const misses: TriplesMatchingMiss[] = [];
    const hits: TriplesMatchingHit[] = [];
    let valueExprOrString = constraint.valueExpr;
    while (typeof valueExprOrString === 'string')
      valueExprOrString = this.lookupShape(valueExprOrString).shapeExpr;
    if (valueExprOrString === undefined) throw Error(`how to deal with no constraint?`)

     switch (valueExprOrString.type) {
       case "NodeConstraint":
         // pull object from ctx
           if (constraint.semActs !== undefined) {
             const mapExt = constraint.semActs.find(semAct => semAct.name === 'http://shex.io.extensions/Map');
             if (mapExt) {
//               const value = ctx.getValue(mapExt.code.trim())
             }
           }
         break;
       default:
     }


    triples.forEach(function (triple) {
      const value = constraint.inverse ? triple.subject : triple.object;
      const oldBindings = JSON.parse(JSON.stringify(_ShExValidator.semActHandler.results));
      if (constraint.valueExpr === undefined)
        hits.push(new TriplesMatchingNoValueConstraint(triple));
      else {
        ctx = ctx.followTripleConstraint();
        const sub: shapeExprTest = _ShExValidator.validateShapeExpr(value, constraint.valueExpr, ctx);
        if ((sub as NestedFailure).errors === undefined) { // TODO: improve typing to cast isn't necessary
          hits.push(new TriplesMatchingHit(triple, sub));
        } else /* !! if (!hits.find(h => h.triple === triple)) *\/ {
          _ShExValidator.semActHandler.results = JSON.parse(JSON.stringify(oldBindings));
          misses.push(new TriplesMatchingMiss(triple, sub));
        }
      }
    });
    return new TriplesMatching(hits, misses);
  }*/
}

class EmptyDb implements NeighborhoodDb {
  getNeighborhood (_point: RdfJsTerm, _shapeLabel: LabelOrStart, _shape: ShExJ.Shape): Neighborhood {
    return {incoming: [], outgoing: []};
  }
  getObjects (): RdfJsTerm[] {return [];}
  getPredicates (): RdfJsTerm[] {return [];}
  getQuads (): Quad[] {return [];}
  getSubjects (): RdfJsTerm[] {return [];}
  get size (): number { return 0;}
}

class MaterializerRegexpThread extends RegexpThread {
  store: Store = new Store();
  constructor(
    public cursor: BindingCursor,
    avail: ConstraintToTriples = new Map(), errors: error[] = [], matched: TripleList[] = [], expression?: tripleExprSolutions
  ) {
    super(avail, errors, matched, expression);
  }

  override makeResultsThread (expr: ShExJ.TripleConstraint, tests: TripleTestedErrors[],
                     errors: error[], matched: TripleList[], minmax: GroupAttrs): RegexpThread {
    const ret = new MaterializerRegexpThread(
        this.cursor,
        new Map(this.avail), // copy parent thread's avail vector,
        errors,
        matched.concat({
          triples: tests.map(p => p.triple)
        }),
        Object.assign(
            { type: "TripleConstraintSolutions", predicate: expr.predicate },
            expr.valueExpr !== undefined ? {valueExpr: expr.valueExpr} : {},
            expr.id !== undefined ? {productionLabel: expr.id} : {},
            minmax,
            { solutions: tests.map(p => p.tested) }
        )
    );
    ret.store = new Store();
    return ret;
  }

  override makeMissingPropertyThread (expr: ShExJ.TripleConstraint, matched: TripleList[]) {
    const ret = super.makeMissingPropertyThread(expr, matched);
    return ret;
  }
}

class MaterializerRegexEngine extends EvalThreadedNErrRegexEngine {
  blankNodeCount = 0;
  focus: RdfJsTerm | null = null;

  constructor(
      shape: ShExJ.Shape,
      public meta: Meta,
      public validator: ShExMaterializerValidator, // TODO: reduce to ShExValidator if possible?
      public ctx: MaterializerValidationContext
  ) {
    super(shape, validator.index);
  }

  nextBNode () { return DataFactory.blankNode('b' + this.blankNodeCount++); }

  // Expands the prefixed name to a full IRI (also when it occurs as a literal's type)
  static expandPrefixedName (prefixedName: string, prefixes: { [key:string]: string }): string {
    const match = /(?:^|"\^\^)([^:\/#"'\^_]*):[^\/]*$/.exec(prefixedName);
    if (!match || prefixes[match[1]] === undefined)
      return prefixedName;
    const prefix = match[1];
    const base = prefixes[prefix];
    const index = match.index;

    // The match index is non-zero when expanding a literal's type
    return index === 0 ? base + prefixedName.substr(prefix.length + 1)
        : prefixedName.substr(0, index + 3) +
        base + prefixedName.substr(index + prefix.length + 4);
  }

  match (focus: RdfJsTerm, constraintToTripleMapping: ConstraintToTripleResults,
         semActHandler: SemActDispatcher, _trace: object[] | null): shapeExprTest {
    this.focus = focus;
    const startingThread = new MaterializerRegexpThread(this.ctx.cursor);
    const ret = this.matchTripleExpression(this.outerExpression, startingThread, constraintToTripleMapping, semActHandler);
    // note: don't return if ret.length === 1 because it might fail the unmatchedTriples test.
    const longerChosen =
        ret.reduce<RegexpThread | null>((ret, elt) => {
          if (elt.errors.length > 0)
            return ret;              // early return
          return ret !== null
              ? ret // keep first solution
              : elt;
        }, null);

    if (longerChosen !== null) {
      const taken = [...(longerChosen as MaterializerRegexpThread).store.match()];
      taken.forEach(t => this.ctx.getStore().add(t))
      let fromValidationPoint: tripleExprSolutions = longerChosen.expression!;
      if (this.shape.semActs !== undefined)
        fromValidationPoint.semActs = this.shape.semActs;
      return fromValidationPoint;
    } else {
      return ret.length > 1 ? {
        type: "PossibleErrors",
        errors: ret.reduce<error[]>((all, e) => {
          return all.concat([e.errors]);
        }, [])
      } : {
        type: "Failure",
        node: focus,
        errors: ret.length === 1 ? ret[0].errors : [/*'Eliminated thread'*/]
      };

    }
  }

  // Early return in case of insufficient matching triples
  override matchTripleConstraint (constraint: ShExJ.TripleConstraint, min: number, max: number,
                                  thread: RegexpThread, constraintToTripleMapping: ConstraintToTripleResults,
                                  semActHandler: SemActDispatcher) {

    // from super.matchTripleConstraint
    if (thread.avail.get(constraint) === undefined)
      thread.avail.set(constraint, this.synthesize(constraint, (thread as MaterializerRegexpThread), constraintToTripleMapping));
    const taken = thread.avail.get(constraint)!.splice(0, min);

    if (!(taken.length >= min)) // Early return
      return [/*thread.makeMissingPropertyThread(constraint, thread.matched)*/];

    const ret: RegexpThread[] = [];
    const minmax = {} as GroupAttrs;
    if (constraint.min !== undefined && constraint.min !== 1 || constraint.max !== undefined && constraint.max !== 1) {
      minmax.min = constraint.min;
      minmax.max = constraint.max;
    }
    if (constraint.semActs !== undefined)
      minmax.semActs = constraint.semActs;
    if (constraint.annotations !== undefined)
      minmax.annotations = constraint.annotations;
    do {
      const passFail = taken.reduce<{ pass: TripleTestedErrors[], fail: TripleTestedErrors[] }>((acc, triple) => {
        const tested = {
          type: "TestedTriple",
          subject: rdfJsTerm2Ld(triple.subject),
          predicate: rdfJsTerm2Ld(triple.predicate),
          object: rdfJsTerm2Ld(triple.object)
        } as TestedTriple
        const hit = constraintToTripleMapping.get(constraint)!.find(x => x.triple === triple)!;
        if (hit.res !== undefined)
          tested.referenced = hit.res;
        const semActErrors = thread.errors.concat(
            constraint.semActs !== undefined
                ? semActHandler.dispatchAll(constraint.semActs, triple, tested)
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
        const myThread = thread.makeResultsThread(constraint, passFail.pass, totalErrors, thread.matched, minmax);
        const store = (myThread as MaterializerRegexpThread).store;
        taken.forEach(t => store.add(t));
        ret.push(myThread);
      } else {
        passFail.fail.forEach(
            f => ret.push(thread.makeResultsThread(constraint, [f], f.semActErrors, thread.matched, minmax))
        )
      }
    } while ((() => {
      if (thread.avail.get(constraint)!.length > 0 && taken.length < max) {
        // build another thread.
        taken.push(thread.avail.get(constraint)!.shift()!);
        return true;
      } else {
        // no more threads
        return false;
      }
    })());

    return ret;
  }

  protected synthesize(expr: TripleConstraint, thread: MaterializerRegexpThread, constraintToTripleMapping: ConstraintToTripleResults): Quad[] {
    const bindings = thread.cursor;
    const target: Quad[] = [];// thread.store;
    const focus = this.focus!;
    const meta = this.meta;
    // from _synthesize
    const curSubjectx = {cs: focus};

    // from visitTripleConstraint

    // from visitTripleConstraint
    function P (pname: string): string { return MaterializerRegexEngine.expandPrefixedName(pname, meta.prefixes); }
    const B  = () => this.nextBNode();
    function add (s: RdfJsTerm, p: RdfJsTerm, o: RdfJsTerm, res: shapeExprTest): RdfJsTerm {
      // @ts-ignore -- unsure what s and p types to use (or propagate back into callers)
      const addme = DataFactory.quad(s, p, o);
      target.push(addme);
      constraintToTripleMapping.add(expr, {triple: addme, res});
      return s;
    }

  const mapExts = (expr.semActs || []).filter(function (ext) { return ext.name === MapExt; });
  if (mapExts.length) {
    const validator = this.validator;
    const ctx = this.ctx;
  mapExts.forEach(function (ext) {
    const code = ext.code!; // TODO: ShExMap w/o code?
    const m = code!.match(pattern);

    let tripleObject;
    if (m) {
      const arg = m[1] ? m[1] : P(m[2] + ":" + m[3]);
      const val = bindings.get(arg);
      if (val !== null) {
        tripleObject = n3ify(val);
      }
    }

    // Is the arg a function? Check if it has parentheses and ends with a closing one
    if (tripleObject === undefined) {
      if (/[ a-zA-Z0-9]+\(/.test(code))
        tripleObject = extensions.lower(code, bindings, meta.prefixes);
    }

    const res = expr.valueExpr === undefined
    ? null
      : validator.validateShapeExpr(curSubjectx.cs, expr.valueExpr, ctx);
    if (tripleObject === undefined) {
      ; // console.warn('Not in bindings: ',code);
    } else if (expr.inverse)
      add(tripleObject, DataFactory.namedNode(expr.predicate), curSubjectx.cs, res!);
    else
      add(curSubjectx.cs, DataFactory.namedNode(expr.predicate), tripleObject, res!); // TODO: what to do if no valueExpr?
  });

  } else if (typeof expr.valueExpr !== "string" && expr.valueExpr !== undefined && expr.valueExpr.type === "NodeConstraint" && expr.valueExpr.values !== undefined && expr.valueExpr.values.length === 1) {
    const res = this.validator.validateShapeExpr(curSubjectx.cs, expr.valueExpr, this.ctx);
  if (expr.inverse)
    // @ts-ignore TODO: n3ify?
    add(/*ShExTerm.ld2RdfJsTerm*/n3ify(expr.valueExpr.values[0]), DataFactory.namedNode(expr.predicate), curSubjectx.cs, res);
  else
    // @ts-ignore
    add(curSubjectx.cs, DataFactory.namedNode(expr.predicate), n3ify(expr.valueExpr.values[0]), res);

} else {
  const oldSubject = curSubjectx.cs;
  let maxAdd = expr.max !== undefined ? expr.max === UNBOUNDED ? Infinity : expr.max : 1;
  if (maxAdd > MAX_MAX_CARD)
    maxAdd = MAX_MAX_CARD;
  if (expr.valueExpr !== undefined)
    maxAdd = 1; // no grounds to know how much to repeat.
  for (let repetition = 0; repetition < maxAdd; ++repetition) {
    curSubjectx.cs = B();
    let res = null;
    if (expr.valueExpr !== undefined) {
      res = this.validator.validateShapeExpr(curSubjectx.cs, expr.valueExpr, this.ctx)
      if ("errors" in res)
        break;
    }
    if (expr.inverse)
      add(curSubjectx.cs, DataFactory.namedNode(expr.predicate), oldSubject, res!);
    else
      add(oldSubject, DataFactory.namedNode(expr.predicate), curSubjectx.cs, res!);
  }
  // visitor._maybeSet(expr, { type: "TripleConstraint" }, "TripleConstraint",
  //     ["inverse", "negated", "predicate", "valueExpr",
  //       "min", "max", "annotations", "semActs"])
  curSubjectx.cs = oldSubject;

  }
  return target;

    function n3ify (ldterm: ShExJ.objectValue): RdfJsTerm {
      if (typeof ldterm !== "object")
        return ldterm.startsWith("_:")
            ? DataFactory.blankNode(ldterm.substring(0, 2))
            : DataFactory.namedNode(ldterm);
      const ret = "\"" + ldterm.value + "\"";
      if (ldterm.language !== undefined)
        return DataFactory.literal(ret, ldterm.language);
      if (ldterm.type !== undefined)
        return DataFactory.literal(ret, DataFactory.namedNode(ldterm.type));
      return DataFactory.literal(ret);
    }
  }
}

// interface ValueBindings {[key: string]: string}
// type BindingTree = [ValueBindings, ...BindingTree]
export class BindingTree {
  constructor (
      public parentNOTUSED: BindingTree | null, // TODO: needed?
      public path: string, // useful for debugging
      public values: Map<string, ShExJ.objectValue> = new Map,
      public children: BindingTree[] = []
  ) {
    children.forEach(c => {
      c.parentNOTUSED = this;
    });
  }

  toString (meta: ShExTerm.Meta = {base: "", prefixes: {}}, terse: boolean = false, indent: string = ""): string {
    if (terse) {
      let ret = `${indent}${this.path}: ${this.values.size}, ${this.children.length}\n`;
      ret += this.children.map(c => c.toString(meta, terse, indent + '  ')).join('');
      return ret;
    } else {
      const entries = [...this.values.entries()];
      const assignmentsLines = entries.map(
          ([key, val]) =>
              `│ ${ShExTerm.shExJsTerm2Turtle(key, meta)} ≔ ${ShExTerm.shExJsTerm2Turtle(val, meta)}`
      )
      const lines = [`Node: ${this.path || '<root>'}`].concat(assignmentsLines);
      let ret = lines.map(l => `${indent}${l}\n`).join('');
      ret += this.children.map(c => c.toString(meta, terse, indent + '    ')).join('');
      return ret;
      // return JSON.stringify(this, (key, value) =>
      //     key === 'parentNOTUSED' ? undefined // strip out circular references
      //         : value instanceof Map ? Object.fromEntries(value)
      //         : value);
    }
  }

  toDot1 (meta: ShExTerm.Meta, nodeId: string): string[] {
    const entries = [...this.values.entries()];
    const labels = entries.map(
        ([key, val]) =>
            `${ShExTerm.shExJsTerm2Turtle(key, meta)} ≔ ${ShExTerm.shExJsTerm2Turtle(val, meta)}`
    );

    const markedLabels = labels.map(s => `${s.replace(/(["<>])/g, '\\$1')}\\l`);
    const labelsStr = `"{${this.path}${labels.length > 0 ? '|' + markedLabels.join('|') : '∅'}}"`;
    const recordStr = `${nodeId} [label=${labelsStr}];`;
    const childTxts = this.children.reduce<string[]>(
        (acc, c, ord) =>
            acc.concat(c.toDot1(meta, nodeId + ord)),
        []
    );
    const childArcs = this.children.map(
        (_c, ord) =>
            `${nodeId} -> ${nodeId + ord}`
    );
    return [recordStr].concat(childTxts).concat(childArcs);
  }

  toDot (meta: ShExTerm.Meta = {base: '', prefixes: {}}, nodeId = "n"): string {
    return `digraph structs {
    node [shape=record];
    ${this.toDot1(meta, nodeId).join('\n    ')}
}`
  }

  static fromObject (obj: Array<unknown>, path: string = "", parent: BindingTree | null = null) : BindingTree[] {
    if (typeof obj !== "object") throw Error(`fromObject: ${obj} is not an object`);
    if (!Array.isArray(obj)) obj = [obj];
    if (obj.length === 0) throw Error(`fromObject: ${obj} input has zero length`);
    const {objs, children} = obj.reduce<{objs: object[], children: BindingTree[]}>(
        (acc, c) => {
          return Array.isArray(c)
              ? {objs: acc.objs, children: acc.children.concat(BindingTree.fromObject(c, at(acc.children.length)))}
              : {objs: acc.objs.concat([c]), children: acc.children}
        },
        {objs: [], children: []}
    );

    if (children.length === 0)
      return objs.map((c, ord) =>
          new BindingTree(null, at(ord), new Map(Object.entries(c)), [])
      );
    if (objs.length === 0)
      return children; // [new BindingTree(parent, path, new Map(), children)];
    if (objs.length === 1)
      return [new BindingTree(parent, path, new Map(Object.entries(objs[0])), children)];
    return [new BindingTree(parent, path, new Map(), objs.map((c, ord) =>
            new BindingTree(null, at(ord), new Map(Object.entries(c)), [])
        ).concat(children)
    )];

    function at (ord: number) { return `${path}.${ord}`; }
  }
}

export class BindingPointer {
  constructor (
      public parent: BindingPointer | null,
      public node: BindingTree,
      public childNo = 0,
      public used: Set<string> = new Set()
  ) {}

  toString() {
    return `parent: ${this.parent} childNo: ${this.childNo} used: ${Array.from(this.used)}, ${this.node.path}`;
  }
}

export class BindingCursor {
  public end = false;
  constructor (
      public tree: BindingTree,
      public back: BindingPointer = new BindingPointer(null, tree),
      // public front: BindingPointer = new BindingPointer(tree)
  ) {}
  get (key: string): ShExJ.objectValue | null {
    if (this.end) return null;
    let ptr = this.back;
    let fromBelow = false;
    for (; !this.end; ) {
      if (ptr.node.values.has(key)) {
        // found key
        if (ptr.used.has(key) === false) {
          // mark used
          if (!fromBelow)
            this.back = ptr;
          ptr.used.add(key)
          return ptr.node.values.get(key)!;
        } else {
          // was used so crawl up and forward
          if (ptr.parent === null) {
            this.end = true;
            return null;
          }
          // look for first parent that can be advanced
          fromBelow = true;
          ptr = ptr.parent;
          ptr.childNo++;
          while (ptr.childNo >= ptr.node.children.length && ptr.parent !== null) {
            ptr = ptr.parent;
            ptr.childNo++;
          }
          if (ptr.parent === null && ptr.childNo >= ptr.node.children.length) {
            this.end = true;
            return null;
          }
          ptr = new BindingPointer(ptr, ptr.node.children[ptr.childNo]);
          // start search from advanced pointer
        }
      } else {
        if (ptr.childNo < ptr.node.children.length) {
          fromBelow = false;
          ptr = new BindingPointer(ptr, ptr.node.children[ptr.childNo]);
        } else { // TODO: dup; refactor
          // was used so crawl up and forward
          if (ptr.parent === null) {
            this.end = true;
            return null;
          }
          // look for first parent that can be advanced
          fromBelow = true;
          ptr = ptr.parent;
          while (ptr.childNo >= ptr.node.children.length && ptr.parent !== null) {
            ptr = ptr.parent;
          }
          ptr = new BindingPointer(ptr.parent, ptr.node.children[ptr.childNo]);
          // start search from advanced pointer
        }
      }
    }
    return null;
  }
  toString (): string {
    return `back: ${this.back.toString()} at end: ${this.end}`
  }
}

export class ShExMaterializer {
  validator: ShExMaterializerValidator;
  constructor (schema: ShExJ.Schema, meta: Meta) {
    this.validator = new ShExMaterializerValidator(schema, meta, new EmptyDb(), {});
  }
  materialize (focus: RdfJsTerm, labelOrStart: LabelOrStart, resultBindings: BindingTree, tracker: QueryTracker = new EmptyTracker(), seen: SeenIndex = {}): Store {
    const ctx = new MaterializerValidationContext(null, labelOrStart, 0, tracker, seen, null, null, new BindingCursor(resultBindings));
    const ret: shapeExprTest = this.validator.validateShapeLabel (focus, ctx);
    return ctx.getStore();
  }
}
