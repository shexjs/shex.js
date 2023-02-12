/* ShExValidator - javascript module to validate a graph with respect to Shape Expressions
 */

// interface constants
import * as ShExTerm from "@shexjs/term";
import {InternalSchema, rdfJsTerm2Ld, SchemaIndex, ShapeMap, ShapeMapEntry} from "@shexjs/term";
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
import {Literal as RdfJsLiteral, DataFactory} from "@rdfjs/types/data-model";
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
  TriplesMatchingNoValueConstraint
} from "@shexjs/validator";
import {Store} from 'n3';
import {
  EvalThreadedNErrRegexEngine,
  GroupAttrs,
  RegexpThread,
  TripleList,
  TripleTestedErrors
} from "@shexjs/eval-threaded-nerr";
import {ShapeMapParser} from "@shexjs/webapp";
import * as assert from "assert";

export {};

export class MaterializerValidationContext extends ShapeExprValidationContext {
  private store: Store;
  protected resultBindings: BindingTree;
  protected focus: RdfJsTerm | undefined;

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
      resultBindings: BindingTree
  ) {
    super(parent, label, depth, tracker, seen, matchTarget, subGraph);
    this.store = new Store();
    this.resultBindings = resultBindings;
  }

  public checkShapeLabel (label: LabelOrStart): MaterializerValidationContext {
    return new MaterializerValidationContext(this, label, this.depth + 1, this.tracker, this.seen, this.matchTarget, this.subGraph, this.resultBindings);
  }

  public followTripleConstraint (): MaterializerValidationContext {
    return new MaterializerValidationContext(this, this.label, this.depth + 1, this.tracker, this.seen, this.matchTarget, null, this.resultBindings);
  }

  public checkExtendsPartition (subGraph: NeighborhoodDb): MaterializerValidationContext {
    return new MaterializerValidationContext(this, this.label, this.depth + 1, this.tracker, this.seen, this.matchTarget, subGraph, this.resultBindings);
  }

  public checkExtendingClass (label: LabelOrStart, matchTarget: MatchTarget | null): MaterializerValidationContext {
    return new MaterializerValidationContext(this, label, this.depth + 1, this.tracker, this.seen, matchTarget, this.subGraph, this.resultBindings);
  }

  setFocus (focus: RdfJsTerm) {
    this.focus = focus;
  }
  getFocus (): RdfJsTerm | undefined {
    return this.focus;
  }
}

export class ShExMaterializerValidator extends ShExValidator {
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
    ctx.setFocus(focus);
    const oldRegexModule = this.regexModule;
    this.regexModule = {
      name: "asdf",
      description: "qwer",
      compile: (_schema: ShExJ.Schema, shape: ShExJ.Shape, index: SchemaIndex): ValidatorRegexEngine => {
        return new MaterializerRegexEngine(shape, index, this);
      }
      // compile: (this.schema, shape, this.index)
    };
    const ret = super.validateShape(focus, shape, ctx);
    this.regexModule = oldRegexModule;
    // propagate triples to ctx.parent
    return ret;
  }

  /**
   * For each TripleConstraint TC, for each triple T | T.p === TC.p, get the result of testing the value constraint.
   * @param constraintList - list of TripleConstraint
   * @param neighborhood - list of Quad
   * @param ctx - evaluation context
   */
  protected matchByPredicate (constraintList: TripleConstraint[], neighborhood: Neighborhood, ctx: MaterializerValidationContext): ByPredicateResult {
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
        } else /* !! if (!hits.find(h => h.triple === triple)) */ {
          _ShExValidator.semActHandler.results = JSON.parse(JSON.stringify(oldBindings));
          misses.push(new TriplesMatchingMiss(triple, sub));
        }
      }
    });
    return new TriplesMatching(hits, misses);
  }
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
  constructor(avail: ConstraintToTriples = new Map(), errors: error[] = [], matched: TripleList[] = [], expression?: tripleExprSolutions) {
    super(avail, errors, matched, expression);
  }

  override makeResultsThread (expr: ShExJ.TripleConstraint, tests: TripleTestedErrors[],
                     errors: error[], matched: TripleList[], minmax: GroupAttrs): RegexpThread {
    const ret = super.makeResultsThread(expr, tests, errors, matched, minmax);
    return ret;
  }

  override makeMissingPropertyThread (expr: ShExJ.TripleConstraint, matched: TripleList[]) {
    const ret = super.makeMissingPropertyThread(expr, matched);
    return ret;
  }
}

class MaterializerRegexEngine extends EvalThreadedNErrRegexEngine {

  constructor(
      shape: ShExJ.Shape,
      index: SchemaIndex,
      public validator: ShExMaterializerValidator, // TODO: reduce to ShExValidator if possible?
  ) {
    super(shape, index);
  }
  // Early return in case of insufficient matching triples
  override matchTripleConstraint (constraint: ShExJ.TripleConstraint, min: number, max: number,
                                  thread: RegexpThread, constraintToTripleMapping: ConstraintToTripleResults,
                                  semActHandler: SemActDispatcher) {
    if (thread.avail.get(constraint) === undefined)
      thread.avail.set(constraint, constraintToTripleMapping.get(constraint)!.map(pair => pair.triple));
    const taken = thread.avail.get(constraint)!.splice(0, min);

    if (!(taken.length >= min)) // Early return
      return [thread.makeMissingPropertyThread(constraint, thread.matched)];

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
        const myThread = thread.makeResultsThread(constraint, passFail.pass, totalErrors, thread.matched, minmax)
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
    assert.equal(typeof obj, "object");
    console.assert(Array.isArray(obj));
    console.assert(obj.length > 0);
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
  constructor (schema: ShExJ.Schema) {
    this.validator = new ShExMaterializerValidator(schema, new EmptyDb(), {});
  }
  materialize (focus: RdfJsTerm, labelOrStart: LabelOrStart, resultBindings: BindingTree, tracker: QueryTracker = new EmptyTracker(), seen: SeenIndex = {}): Store {
    const ctx = new MaterializerValidationContext(null, labelOrStart, 0, tracker, seen, null, null, resultBindings);
    const ret: shapeExprTest = this.validator.validateShapeLabel (focus, ctx);
    return ctx.getStore();
  }
}
