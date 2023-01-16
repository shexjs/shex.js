/* ShExValidator - javascript module to validate a graph with respect to Shape Expressions
 */

// interface constants
import * as ShExTerm from "@shexjs/term";
import {InternalSchema, SchemaIndex, ShapeMap, ShapeMapEntry} from "@shexjs/term";
import {
  NoTripleConstraint,
  QueryTracker,
  SemActDispatcher,
  SemActHandler,
  T2TcPartition,
  ValidatorRegexEngine,
  ValidatorRegexModule
} from "@shexjs/eval-validator-api";
import * as Hierarchy from 'hierarchy-closure';
import type {Quad, Term as RdfJsTerm} from 'rdf-js';
import {Neighborhood, NeighborhoodDb, Start as NeighborhoodStart} from "@shexjs/neighborhood-api";
import {
  error,
  Failure,
  FailureList,
  NodeConstraintTest,
  NodeConstraintViolation,
  Recursion,
  SemActFailure,
  ShapeAndFailure,
  shapeExprTest,
  ShapeNotFailure,
  ShapeNotResults,
  ShapeTest,
  SolutionList,
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
  ShapeDecl,
  shapeDeclRef,
  shapeExprOrRef,
  ShapeNot,
  ShapeOr,
  TripleConstraint,
  tripleExpr
} from "shexj";
import {getNumericDatatype, testFacets, testKnownTypes} from "./shex-xsd";
import {Literal as RdfJsLiteral} from "@rdfjs/types/data-model";
import * as RdfJs from "@rdfjs/types/data-model";
import {Visitor as ShExVisitor, index as indexSchema} from "@shexjs/visitor";

export {};

export const InterfaceOptions = {
  "coverage": {
    "firstError": "fail on first error (usually used with eval-simple-1err)",
    "exhaustive": "find as many errors as possible (usually used with eval-threaded-nerr)"
  }
};

const VERBOSE = false; // "VERBOSE" in process.env;
const EvalThreadedNErr = require("@shexjs/eval-threaded-nerr");

        function ldify (term: RdfJsTerm): ShExTerm.LdTerm {
          switch (term.termType) {
          case "NamedNode": return term.value;
          case "BlankNode": return "_:" + term.value;
          case "Literal":
            const ret: ShExTerm.ObjectLiteral = { value: term.value };
            const dt = term.datatype.value;
            const lang = term.language;
            if (dt &&
                dt !== "http://www.w3.org/2001/XMLSchema#string" &&
                dt !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString")
              ret.type = dt;
            if (lang)
              ret.language = lang;
            return ret;
          default:
            throw Error(`Unrecognized termType ${term.termType} in ${term}`);
          }
        }

interface ValidatorOptions {
  regexModule?: ValidatorRegexEngine;
  coverage?: {
    exhaustive: string;
    firstError: string;
  };
  noCache?: boolean;
  semActs?: SemActCodeIndex;
  validateExtern?: (point: RdfJsTerm, shapeLabel: LabelOrStart, ctx: ShapeExprValidationContext) => shapeExprTest;
}

export interface ShExJsResultMapEntry extends ShapeMapEntry {
  status: "conformant" | "nonconformant";
  appinfo: shapeExprTest;
}

export type ShExJsResultMap = ShExJsResultMapEntry[];

interface SemActCodeIndex {
  [id: string]: string;
}

interface NeighborhoodIndex {
  byPredicate: Map<string, Quad[]>;
  candidates: number[][];
  misses: any[];
}

class SemActDispatcherImpl implements SemActDispatcher {
  handlers: { [id: string]: SemActHandler; } = {};
  externalCode: SemActCodeIndex;
  public results: { [id: string]: string | undefined } = {};

  constructor(externalCode?: SemActCodeIndex) {
    this.externalCode = externalCode || {};
  }

  /**
   * Store a semantic action handler.
   *
   * @param {string} name - semantic action's URL.
   * @param {object} handler - handler function.
   *
   * The handler object has a dispatch function is invoked with:
   *   code: string - text of the semantic action.
   *   ctx: object - matched triple or results subset.
   *   extensionStorage: object - place where the extension writes into the result structure.
   *   return :bool - false if the extension failed or did not accept the ctx object.
   */
  register (name: string, handler: SemActHandler) {
    this.handlers[name] = handler;
  }

  /**
   * Calls all semantic actions, allowing each to write to resultsArtifact.
   *
   * @param {array} semActs - list of semantic actions to invoke.
   * @param {object} semActParm - evaluation context for SemAct.
   * @param {object} resultsArtifact - simple storage for SemAct.
   * @return {SemActFailure[]} false if any result was false.
   */
  dispatchAll (semActs: [ShExJ.SemAct], semActParm: any, resultsArtifact: any): SemActFailure[] {
    return semActs.reduce((ret: SemActFailure[], semAct) => {
      if (ret.length === 0 && semAct.name in this.handlers) {
        const code: string | null = ("code" in semAct ? semAct.code : this.externalCode[semAct.name]) || null;
        const existing = "extensions" in resultsArtifact && semAct.name in resultsArtifact.extensions;
        const extensionStorage = existing ? resultsArtifact.extensions[semAct.name] : {};
        const response = this.handlers[semAct.name].dispatch(code, semActParm, extensionStorage);
        if (typeof response === 'object' && Array.isArray(response)) {
          if (response.length > 0)
            ret.push({ type: "SemActFailure", errors: response })
        } else {
          throw Error("unsupported response from semantic action handler: " + JSON.stringify(response))
        }
        if (!existing && Object.keys(extensionStorage).length > 0) {
          if (!("extensions" in resultsArtifact))
            resultsArtifact.extensions = {};
          resultsArtifact.extensions[semAct.name] = extensionStorage;
        }
        return ret;
      }
      return ret;
    }, []);
  }
}

/**
 * A QueryTracker that's all no-ops.
 */
class EmptyTracker implements QueryTracker {
  depth = 0;

  recurse(_rec: Recursion) {}
  known(_res: shapeExprTest) {}
  enter(_term: RdfJsTerm, _shapeLabel: string) { ++this.depth; }
  exit(_term: RdfJsTerm, _shapeLabel: string, _res: shapeExprTest) { --this.depth; }
}

type LabelOrStart = string | typeof NeighborhoodStart;

interface SeenIndex {
  [id: string]: { node: RdfJsTerm, shape: string };
}

interface MatchTarget {
  label: string;
  count: number;
}

interface ExtensionIndex {
  [id:string]: shapeDeclRef[]
}

interface ResList {passes: shapeExprTest[], failures: shapeExprTest[]}

type TripleNo = number;
type ConstraintNo = number;

class ShapeExprValidationContext {
  constructor(
      public parent: ShapeExprValidationContext | null,
      public label: LabelOrStart, // Can only be Start if it's the root of a context list.
      public depth: number,
      public tracker: QueryTracker,
      public seen: SeenIndex,
      public matchTarget: MatchTarget | null,
      public subGraph: NeighborhoodDb | null) {
  }

  public checkShapeLabel(label: LabelOrStart): ShapeExprValidationContext {
    return new ShapeExprValidationContext(this, label, this.depth + 1, this.tracker, this.seen, this.matchTarget, this.subGraph);
  }

  public followTripleConstraint(): ShapeExprValidationContext {
    return new ShapeExprValidationContext(this, this.label, this.depth + 1, this.tracker, this.seen, this.matchTarget, null);
  }

  public checkExtendsPartition(subGraph: NeighborhoodDb): ShapeExprValidationContext {
    return new ShapeExprValidationContext(this, this.label, this.depth + 1, this.tracker, this.seen, this.matchTarget, subGraph);
  }

  public checkExtendingClass(label: LabelOrStart, matchTarget: MatchTarget | null): ShapeExprValidationContext {
    return new ShapeExprValidationContext(this, label, this.depth + 1, this.tracker, this.seen, matchTarget, this.subGraph);
  }
}

interface ReferenceToExtendedShapeDecl { type: "Ref", ref: string; }
type RefOrTc = ReferenceToExtendedShapeDecl | TripleConstraint;
type RefsAndTCsForOneExtension = RefOrTc[];
type RefsAndTCsForShapesExtensions = RefsAndTCsForOneExtension[];
type ByPredicateResult = {
  misses: T2TCErrors; // TODO: for each T, some failing constraint ??
  results: TC2TResult; // for each TC, for each passing T, what was the result
  constraintList: T2TCs; // for each T, which constraints does it match
};
type T2TCErrors = { [index: TripleNo]: { constraintNo: ConstraintNo, errors: shapeExprTest } };
type TC2TResult = (shapeExprTest | undefined)[][];
type T2TCs = number[][];
type TripleNoList = number[];

type TripleResult = {
  tNo: TripleNo;
  res: shapeExprTest;
}
type ConstraintToTriples = TripleResult[][];

type WhatsMissingResult = {
  misses: Missing[];
  extras: TripleNo[];
}

type Missing = {
  tripleNo: TripleNo;
  constraintNo: ConstraintNo;
  errors: shapeExprTest;
};

type TriplesMatching = {
  hits: Hit[];
  misses: Miss[];
};
type Hit = {
  triple: Quad;
  sub: shapeExprTest | undefined;
};
type Miss = {
  triple: Quad;
  errors: shapeExprTest;
};

/**
 * Convert a ResultMap to a shapeExprTest by examining each shape association.
 * TODO: migrate to ShExUtil when ShExUtil is TS-ified
 * @param resultsMap - SolutionList or FailureList depending on whether resultsMap had some errors.
 */
export function resultMapToShapeExprTest(resultsMap: ShExJsResultMapEntry[]): shapeExprTest {
  const passFails = resultsMap.reduce<ResList>((ret, pair) => {
    const res = pair.appinfo;
    return "errors" in res
        ? {passes: ret.passes, failures: ret.failures.concat([res])}
        : {passes: ret.passes.concat([res]), failures: ret.failures};
  }, {passes: [], failures: []});
  if (passFails.failures.length > 0) {
    return passFails.failures.length !== 1
        ? {type: "FailureList", errors: passFails.failures}
        : passFails.failures [0];
  } else {
    return passFails.passes.length !== 1
        ? {type: "SolutionList", solutions: passFails.passes}
        : passFails.passes [0];
  }
}

/** Directly construct a DB from triples.
 * TODO: should this be in @shexjs/neighborhood-something ?
 */
class TrivialNeighborhood implements NeighborhoodDb {
  incoming: Quad[] = [];
  outgoing: Quad[] = [];
  private queryTracker: QueryTracker | null;

  constructor(queryTracker: QueryTracker | null) {
    this.queryTracker = queryTracker;
  }

  getTriplesByIRI(s: RdfJsTerm, p: RdfJsTerm, o: RdfJsTerm, _g?: RdfJsTerm): Quad[] {
    return this.incoming.concat(this.outgoing).filter(
        t =>
            (!s || s === t.subject) &&
            (!p || p === t.predicate) &&
            (!o || o === t.object)
    );
  }

  getNeighborhood (_point: RdfJsTerm, _shapeLabel: LabelOrStart, _shape: Shape): Neighborhood {
    return {
      outgoing: this.outgoing,
      incoming: this.incoming
    };
  }

  getSubjects (): RdfJs.Term[] { throw Error("!Triples DB can't index subjects"); }
  getPredicates (): RdfJs.Term[] { throw Error("!Triples DB can't index predicates"); }
  getObjects (): RdfJs.Term[] { throw Error("!Triples DB can't index objects"); }
  getQuads (): RdfJs.Quad[] { throw Error("!Triples DB doesn't have Quads"); }
  get size(): number { return this.incoming.length + this.outgoing.length; }
  addIncomingTriples (tz: Quad[]) { Array.prototype.push.apply(this.incoming, tz); }
  addOutgoingTriples (tz: Quad[]) { Array.prototype.push.apply(this.outgoing, tz); }
}


export class ShExValidator {
  public static readonly Start = NeighborhoodStart;
  public static readonly InterfaceOptions = InterfaceOptions;
  public static readonly type = "ShExValidator";

  public readonly options: ValidatorOptions;
  public readonly known: {
    [id: string]: shapeExprTest;
  }
  public readonly schema: InternalSchema;
  public readonly semActHandler: SemActDispatcher;
  public readonly index: SchemaIndex;
  private readonly db: NeighborhoodDb;
  private regexModule: ValidatorRegexModule;

  /* ShExValidator - construct an object for validating a schema.
   *
   * schema: a structure produced by a ShEx parser or equivalent.
   * options: object with controls for
   *   lax(true): boolean: whine about missing types in schema.
   *   diagnose(false): boolean: make validate return a structure with errors.
   */
  constructor(schema: InternalSchema, db: NeighborhoodDb, options: ValidatorOptions = {}) {
    const index: SchemaIndex = schema._index || indexSchema(schema);
    if (index.labelToTcs === undefined) // make sure there's a labelToTcs in the index
      index.labelToTcs = {};
    this.index = index;

    options = options || {};
    this.options = options;
    this.known = {};

    this.schema = schema;
    this.db = db;
    // const regexModule = this.options.regexModule || require("@shexjs/eval-simple-1err");
    this.regexModule = this.options.regexModule || EvalThreadedNErr;
    this.semActHandler = new SemActDispatcherImpl(options.semActs);
  }

  /**
   * Validate each entry in a fixed ShapeMap, returning a results ShapeMap
   *
   * @param shapeMap - list of node/shape pairs to validate
   * @param tracker - optional implementation of QueryTracker to log validation
   * @param seen - optional (and discouraged) list of currently-visited node/shape associations -- may be useful for rare wizardry.
   */
  validateShapeMap (shapeMap: ShapeMap, tracker: QueryTracker = new EmptyTracker(), seen: SeenIndex = {}): ShExJsResultMap {
    return shapeMap.map(pair => {
      // let time = +new Date();
      const res = this.validateNodeShapePair(ShExTerm.LdToRdfJsTerm(pair.node), pair.shape, tracker, seen);
      // time = +new Date() - time;
      return {
        node: pair.node,
        shape: pair.shape,
        status: "errors" in res ? "nonconformant" : "conformant",
        appinfo: res,
        // elapsed: time
      };
    });
  }

  /**
   * Validate a single node as a labeled shape expression or as the Start shape
   *
   * @param node - RdfJs Term to validate
   * @param shapeExprLabel - shapeExprLabel of shape to validate node against. May be `ShExValidator.Start`.
   * @param tracker - optional implementation of QueryTracker to log validation
   * @param seen - optional (and discouraged) list of currently-visited node/shape associations -- may be useful for rare wizardry.
   */
  validateNodeShapePair (node: RdfJsTerm, shapeExprLabel: LabelOrStart, tracker: QueryTracker = new EmptyTracker(), seen: SeenIndex = {}): shapeExprTest {
    const ctx = new ShapeExprValidationContext(null, shapeExprLabel, 0, tracker, seen, null, null,)
    const ret: shapeExprTest = this.validateShapeLabel (node, ctx);
    if ("startActs" in this.schema) {
      (ret as ShapeTest).startActs = this.schema.startActs; // TODO: figure out where startActs can appear in ShExJ
    }
    return ret;
  }

  validateShapeLabel (point: RdfJsTerm, ctx: ShapeExprValidationContext): shapeExprTest {
    if (typeof ctx.label !== "string") {
      if (ctx.label !== ShExValidator.Start)
        runtimeError(`unknown shape ctx.label ${JSON.stringify(ctx.label)}`);
      if (!this.schema.start)
        runtimeError("start production not defined");
      return this.validateShapeExpr(point, this.schema.start, ctx);
    }

    const seenKey = ShExTerm.rdfJsTermToTurtle(point) + "@" + ctx.label;
    if (!ctx.subGraph) { // Don't cache base shape validations as they aren't testing the full neighborhood.
      if (seenKey in ctx.seen)
        {
          let ret: Recursion = {
            type: "Recursion",
            node: ldify(point),
            shape: ctx.label
          };
          ctx.tracker.recurse(ret);
          return ret;
        }
      if ("known" in this && seenKey in this.known) {
        const ret = this.known[seenKey];
        ctx.tracker.known(ret);
        return ret;
      }
      ctx.seen[seenKey] = { node: point, shape: ctx.label };
      ctx.tracker.enter(point, ctx.label);
    }
    const ret = this.validateDescendants(point, ctx.label, ctx, false);
    if (!ctx.subGraph) {
      ctx.tracker.exit(point, ctx.label, ret);
      delete ctx.seen[seenKey];
      if ("known" in this)
        this.known[seenKey] = ret;
    }
    return ret;
  }

  /**
   * Validate shapeLabel and shapeExprs which extend shapeLabel
   *
   * @param point - focus of validation
   * @param shapeLabel - same as ctx.label, but with stronger typing (can't be Start)
   * @param ctx - validation context
   * @param allowAbstract - if true, don't strip out abstract classes (needed for validating abstract base shapes)
   */
  validateDescendants(point: RdfJsTerm, shapeLabel: string, ctx: ShapeExprValidationContext, allowAbstract: boolean = false): shapeExprTest {
    const _ShExValidator = this;
    if (ctx.subGraph) { // !! matchTarget?
      // matchTarget indicates that shape substitution has already been applied.
      // Now we're testing a subgraph against the base shapes.
      const res = this.validateShapeDecl(point, this.lookupShape(shapeLabel), ctx);
      if (ctx.matchTarget && shapeLabel === ctx.matchTarget.label && !("errors" in res))
        ctx.matchTarget.count++;
      return res;
    }

    // Find all non-abstract shapeExprs extended with label. 
    let candidates:shapeDeclRef[] = [shapeLabel];
    candidates = candidates.concat(indexExtensions(this.schema)[shapeLabel] || []);
    // Uniquify list.
    for (let i = candidates.length - 1; i >= 0; --i) {
      if (candidates.indexOf(candidates[i]) < i)
        candidates.splice(i, 1);
    }
    // Filter out abstract shapes.
    if (!allowAbstract)
      candidates = candidates.filter(l => !this.lookupShape(l).abstract);

    // Aggregate results in a SolutionList or FailureList.
    const results = candidates.reduce<ResList>((ret, candidateShapeLabel) => {
      const shapeExpr = this.lookupShape(candidateShapeLabel);
      const matchTarget = candidateShapeLabel === shapeLabel ? null : { label: shapeLabel, count: 0 };
      ctx = ctx.checkExtendingClass(candidateShapeLabel, matchTarget);
      const res = this.validateShapeDecl(point, shapeExpr, ctx);
      return "errors" in res || matchTarget && matchTarget.count === 0 ?
        { passes: ret.passes, failures: ret.failures.concat(res) } :
        { passes: ret.passes.concat(res), failures: ret.failures } ;

    }, {passes: [], failures: []});
    let ret: shapeExprTest;
    if (results.passes.length > 0) {
      ret = results.passes.length !== 1 ?
        { type: "SolutionList", solutions: results.passes } :
      results.passes [0];
    } else if (results.failures.length > 0) {
      ret = results.failures.length !== 1 ?
        { type: "FailureList", errors: results.failures } :
      results.failures [0];
    } else {
      ret = {
        type: "AbstractShapeFailure",
        shape: shapeLabel,
        errors: [shapeLabel + " has no non-abstract children"]
      };
    }
    return ret;

    // @TODO move to Visitor.index
    function indexExtensions (schema: Schema): ExtensionIndex {
      const abstractness: { [id:string]: boolean } = {};
      const extensions = Hierarchy.create();
      makeSchemaVisitor().visitSchema(schema);
      return extensions.children;

      function makeSchemaVisitor () {
        const schemaVisitor = ShExVisitor();
        let curLabel: string;
        let curAbstract;
        const oldVisitShapeDecl = schemaVisitor.visitShapeDecl;

        schemaVisitor.visitShapeDecl = function (decl: ShapeDecl) {
          curLabel = decl.id;
          curAbstract = decl.abstract;
          abstractness[decl.id] = !!decl.abstract;
          return oldVisitShapeDecl.call(schemaVisitor, decl, decl.id);
        };

        schemaVisitor.visitShape = function (shape: ShExJ.Shape) {
          if (shape.extends !== undefined) {
            shape.extends.forEach(ext => {
              const extendsVisitor = ShExVisitor();
              extendsVisitor.visitExpression = function (_expr: tripleExpr, ..._args: never[]) { return "null"; }
              extendsVisitor.visitShapeRef = function (reference: string, ..._args: never[]) {
                extensions.add(reference, curLabel);
                extendsVisitor.visitShapeDecl(_ShExValidator.lookupShape(reference))
                // makeSchemaVisitor().visitSchema(schema);
                return "null";
              };
              extendsVisitor.visitShapeExpr(ext);
            })
          }
          return "null";
        };
        return schemaVisitor;
      }
    }
  }

  /**
   * Validate a ShapeDecl, including any shapes it restricts
   *
   * @param point - focus of validation
   * @param shapeDecl - ShExJ ShapeDecl object
   * @param ctx - validation context
   */
  validateShapeDecl(point: RdfJsTerm, shapeDecl: ShapeDecl, ctx: ShapeExprValidationContext): shapeExprTest {
    const conjuncts = (shapeDecl.restricts || []).concat([shapeDecl.shapeExpr])
    const expr = conjuncts.length === 1
          ? conjuncts[0]
          : { type: "ShapeAnd", shapeExprs: conjuncts } as ShExJ.ShapeAnd;
    return this.validateShapeExpr(point, expr, ctx);
  }

  lookupShape(label: string): ShapeDecl {
    const shapes = this.schema.shapes;
    if (shapes === undefined) {
      runtimeError("shape " + label + " not found; no shapes in schema");
    } else if (label in this.index.shapeExprs) {
      return this.index.shapeExprs[label]
    }
    runtimeError("shape " + label + " not found in:\n" + Object.keys(this.index.shapeExprs || []).map(s => "  " + s).join("\n"));
  }

  validateShapeExpr(point: RdfJsTerm, shapeExpr: shapeExprOrRef, ctx: ShapeExprValidationContext): shapeExprTest {
    if (typeof shapeExpr === "string") { // ShapeRef
      return this.validateShapeLabel(point, ctx.checkShapeLabel(shapeExpr));
    }

    switch (shapeExpr.type) {
      case "NodeConstraint":
        return this._validateNodeConstraint(point, shapeExpr, ctx);
      case "Shape":
        return this.validateShape(point, shapeExpr, ctx);
      case "ShapeExternal":
        if (typeof this.options.validateExtern !== "function")
          throw runtimeError(`validating ${ShExTerm.internalTermToTurtle(point)} as EXTERNAL shapeExpr ${ctx.label} requires a 'validateExtern' option`)
        return this.options.validateExtern(point, ctx.label, ctx.checkShapeLabel(ctx.label));
      case "ShapeOr":
        const orErrors = [];
        for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
          const nested = shapeExpr.shapeExprs[i];
          const sub = this.validateShapeExpr(point, nested, ctx);
          if ("errors" in sub)
            orErrors.push(sub);
          else if (!ctx.matchTarget || ctx.matchTarget.count > 0)
            return {type: "ShapeOrResults", solution: sub};
        }
        return {type: "ShapeOrFailure", errors: orErrors} as any as shapeExprTest;
      case "ShapeNot":
        const sub = this.validateShapeExpr(point, shapeExpr.shapeExpr, ctx);
        return ("errors" in sub)
          ? {type: "ShapeNotResults", solution: sub} as any as shapeExprTest
          : {type: "ShapeNotFailure", errors: sub} as any as shapeExprTest; // ugh
      case "ShapeAnd":
        const andPasses = [];
        const andErrors = [];
        for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
          const nested = shapeExpr.shapeExprs[i];
          const sub = this.validateShapeExpr(point, nested, ctx);
          if ("errors" in sub)
            andErrors.push(sub);
          else
            andPasses.push(sub);
        }
        return andErrors.length > 0
          ? {type: "ShapeAndFailure", errors: andErrors} as any as shapeExprTest
          : {type: "ShapeAndResults", solutions: andPasses};
      default:
        throw Error("expected one of Shape{Ref,And,Or} or NodeConstraint, got " + JSON.stringify(shapeExpr));
    }
  }

  private evaluateShapeExprSemActs(ret: shapeExprTest, shapeExpr: NodeConstraint, point: RdfJsTerm, shapeLabel: LabelOrStart) {
    if (!("errors" in ret) && shapeExpr.semActs !== undefined) {
      const semActErrors = this.semActHandler.dispatchAll((shapeExpr as any).semActs, Object.assign({node: point}, ret), ret)
      if (semActErrors.length)
          // some semAct aborted
        return {type: "Failure", node: ldify(point), shape: shapeLabel, errors: semActErrors} as Failure;
    }
    return ret;
  }

  validateShape(point: RdfJsTerm, shape: Shape, ctx: ShapeExprValidationContext): shapeExprTest {
    let ret = null;
    const startActionStorage = {}; // !!! need test to see this write to results structure.
    if ("startActs" in this.schema) {
      const semActErrors = this.semActHandler.dispatchAll(this.schema.startActs, null, startActionStorage)
      if (semActErrors.length)
        return {
          type: "Failure",
          node: ldify(point),
          shape: ctx.label,
          errors: semActErrors
        }; // some semAct aborted !! return a better error
    }

    const fromDB  = (ctx.subGraph || this.db).getNeighborhood(point, ctx.label, shape);
    const outgoingLength = fromDB.outgoing.length;
    const neighborhood = fromDB.outgoing.sort(
      (l, r) => l.predicate.value.localeCompare(r.predicate.value) || sparqlOrder(l.object, r.object)
    ).concat(fromDB.incoming.sort(
      (l, r) => l.predicate.value.localeCompare(r.predicate.value) || sparqlOrder(l.object, r.object)
    ));

    const { extendsTCs, tc2exts, localTCs } = this.TripleConstraintsVisitor(this.index.labelToTcs).getAllTripleConstraints(shape);
    const constraintList = extendsTCs.concat(localTCs);

    // neighborhood already integrates subGraph so don't pass to _errorsMatchingShapeExpr
    const tripleList = this.matchByPredicate(constraintList, neighborhood, outgoingLength, ctx);
    const {misses, extras} = this.whatsMissing(tripleList, neighborhood, outgoingLength, shape.extra || [])

    const allT2TCs = new TripleToTripleConstraints(tripleList.constraintList, extendsTCs.length, tc2exts);
    const partitionErrors = [];
    const regexEngine = this.regexModule.compile(this.schema, shape, this.index);

    for (let t2tc = allT2TCs.next(); t2tc !== null && ret === null; t2tc = allT2TCs.next()) {
      const localT2Tc: T2TcPartition = []; // subset of TCs assigned to shape.expression
      const unexpectedOrds: TripleNoList = [];
      const extendsToTriples: Quad[][] = _seq((shape.extends || []).length).map(() => []);
      t2tc.forEach((cNo, tNo) => {
        if (cNo !== NoTripleConstraint && cNo < extendsTCs.length) {
          // allocate to EXTENDS
          for (let extNo of tc2exts[cNo]) {
            // allocated to multiple extends if diamond inheritance
            extendsToTriples[extNo].push(neighborhood[tNo]);
            localT2Tc[tNo] = NoTripleConstraint;
          }
        } else {
          // allocate to local shape
          localT2Tc[tNo] = cNo;
          if (cNo === NoTripleConstraint // didn't match anything
              && tNo < outgoingLength // is an outgoing triple
              && extras.indexOf(tNo) === -1) // isn't in EXTRAs
            unexpectedOrds.push(tNo);
        }
      });

      const errors: error[] = []
      const usedTriples = []; // [{s1,p1,o1},{s2,p2,o2}] implicated triples -- used for messages
      const constraintMatchCount = // [2,1,0,1] how many triples matched a constraint
            _seq(neighborhood.length).map(function () { return 0; });

      // Triples not mapped to triple constraints are not allowed in closed shapes.
      if (shape.closed && unexpectedOrds.length > 0) {
        errors.push({
          type: "ClosedShapeViolation",
          unexpectedTriples: unexpectedOrds.map(tNo => {
            const q = neighborhood[tNo];
            return {
              subject: ldify(q.subject),
              predicate: ldify(q.predicate),
              object: ldify(q.object),
            }
          })
        });
      }

      // Set usedTriples and constraintMatchCount.
      localT2Tc.forEach(function (tpNumber, ord) {
        if (tpNumber !== NoTripleConstraint) {
          usedTriples.push(neighborhood[ord]);
          ++constraintMatchCount[tpNumber];
        }
      });
      const tc2t = this._constraintToTriples(localT2Tc, constraintList, tripleList); // e.g. [[t0, t2], [t1, t3]]

      let results = this.testExtends(shape, point, extendsToTriples, ctx);
      if (results === null || !("errors" in results)) {
        const sub = regexEngine.match(this.db, point, constraintList, tc2t, localT2Tc, neighborhood, this.semActHandler, null);
        if (!("errors" in sub) && results) {
          // @ts-ignore
          results = { type: "ExtendedResults", extensions: results };
          if (Object.keys(sub).length > 0) // no empty objects from {}s.
            { // @ts-ignore
              results.local = sub;
            }
        } else {
          // @ts-ignore
          results = sub;
        }
      }
      if (results !== null && results.errors !== undefined)
        { // @ts-ignore
          [].push.apply(errors, results.errors);
        }

      const possibleRet = { type: "ShapeTest", node: ldify(point), shape: ctx.label };
      // @ts-ignore
      if (errors.length === 0 && Object.keys(results).length > 0) // only include .solution for non-empty pattern
        { // @ts-ignore
          possibleRet.solution = results;
        }
      if ("semActs" in shape) {
        const semActErrors = this.semActHandler.dispatchAll(shape.semActs, Object.assign({node: point}, results), possibleRet)
        if (semActErrors.length)
          // some semAct aborted
          { // @ts-ignore
            [].push.apply(errors, semActErrors);
          }
      }

      partitionErrors.push(errors)
      if (errors.length === 0)
        ret = possibleRet
    }
    // end of while(xp.next())

    const missErrors = misses.map(function (miss) {
      const t = neighborhood[miss.tripleNo];
      return {
        type: "TypeMismatch",
        triple: {type: "TestedTriple", subject: ldify(t.subject), predicate: ldify(t.predicate), object: ldify(t.object)},
        constraint: constraintList[miss.constraintNo],
        errors: miss.errors
      };
    });

    // Report only last errors until we have a better idea.
    const lastErrors = partitionErrors[partitionErrors.length - 1];
    // @ts-ignore
    let errors = missErrors.concat(lastErrors.length === 1 ? lastErrors[0] : lastErrors);
    if (errors.length > 0)
      ret = {
        type: "Failure",
        node: ldify(point),
        shape: ctx.label,
        errors: errors
      };

    // remove N3jsTripleToString
    if (VERBOSE)
      neighborhood.forEach(function (t) {
        // @ts-ignore
        delete t.toString;
      });

    // @ts-ignore
    return this.addShapeAttributes(shape, ret);
  }
/*
  function DBG_matchValues (fromDB, constraintList) {
    const expectedValues = constraintList.map(
      tc => parseInt((tc.valueExpr?.values || [{value:999}])[0].value)
    );
    const tripleValues = fromDB.outgoing.map(
      t => parseInt(t.object.substr(1))
    );
    return tripleValues.map(
      i => expectedValues.indexOf(i)
    );
  }

  function DBG_gonnaMatch (t2tcForThisShapeAndExtends, fromDB, constraintList) {
    const solution = DBG_matchValues (fromDB, constraintList);
    return JSON.stringify(t2tcForThisShapeAndExtends) === JSON.stringify(solution);
  }
*/
  matchByPredicate(constraintList: TripleConstraint[], neighborhood: Quad[], outgoingLength: number, ctx: ShapeExprValidationContext): ByPredicateResult {
    const _ShExValidator = this;
    const outgoing = indexNeighborhood(neighborhood.slice(0, outgoingLength));
    const incoming = indexNeighborhood(neighborhood.slice(outgoingLength));
    const init: ByPredicateResult = { misses: {}, results: _alist(constraintList.length), constraintList:_alist(neighborhood.length) };
    return constraintList.reduce<ByPredicateResult>(function (ret, constraint, cNo) {

      // subject and object depend on direction of constraint.
      const index = constraint.inverse ? incoming : outgoing;

      // get triples matching predicate
      const matchPredicate = index.byPredicate.get(constraint.predicate) ||
            []; // empty list when no triple matches that constraint

      // strip to triples matching value constraints (apart from @<someShape>)
      const matchConstraints = _ShExValidator.triplesMatchingShapeExpr(matchPredicate, constraint, ctx);

      matchConstraints.hits.forEach(function (evidence) {
        const tNo = neighborhood.indexOf(evidence.triple);
        ret.constraintList[tNo].push(cNo);
        ret.results[cNo][tNo] = evidence.sub;
      });
      matchConstraints.misses.forEach(function (evidence) {
        const tNo = neighborhood.indexOf(evidence.triple);
        ret.misses[tNo] = {constraintNo: cNo, errors: evidence.errors};
      });
      return ret;
    }, init);
  }

  whatsMissing (tripleList: ByPredicateResult, neighborhood: Quad[], outgoingLength: number, extras: string[]): WhatsMissingResult {
    const matchedExtras: TripleNo[] = []; // triples accounted for by EXTRA
    const misses = tripleList.constraintList.reduce<Missing[]>(function (ret, constraints, ord) {
      if (constraints.length === 0 &&   // matches no constraints
          ord < outgoingLength &&       // not an incoming triple
          ord in tripleList.misses) {   // predicate matched some constraint(s)
        if (extras.indexOf(neighborhood[ord].predicate.value) !== -1) {
          matchedExtras.push(ord);
        } else {                        // not declared extra
          ret.push({                    // so it's a missed triple.
            tripleNo: ord,
            constraintNo: tripleList.misses[ord].constraintNo,
            errors: tripleList.misses[ord].errors
          });
        }
      }
      return ret;
    }, []);
    return {misses, extras: matchedExtras}
  }

  addShapeAttributes (shape: Shape, ret: shapeExprTest): shapeExprTest {
    if (shape.annotations !== undefined)
      { // @ts-ignore
        ret.annotations = shape.annotations;
      }
    return ret;
  }

  // Pivot to triples by constraint.
  _constraintToTriples (t2tc: T2TcPartition, constraintList: TripleConstraint[], tripleList: ByPredicateResult): ConstraintToTriples {
    return t2tc.slice().
      reduce<ConstraintToTriples>(function (ret, cNo, tNo) {
        if (cNo !== NoTripleConstraint)
          ret[cNo].push({tNo: tNo, res: tripleList.results[cNo][tNo] as shapeExprTest});
        return ret;
      }, _seq(constraintList.length).map(() => [])); // [length][]
  }

  testExtends(expr: Shape, point: RdfJsTerm, extendsToTriples: Quad[][], ctx: ShapeExprValidationContext) {
    if (expr.extends === undefined)
      return null;
    const passes = [];
    const errors = [];
    for (let eNo = 0; eNo < expr.extends.length; ++eNo) {
      const extend = expr.extends[eNo];
      const subgraph = new TrivialNeighborhood(null); // These triples were tracked earlier.
      extendsToTriples[eNo].forEach(t => subgraph.addOutgoingTriples([t]));
      ctx = ctx.checkExtendsPartition(subgraph);
      const sub = this.validateShapeExpr(point, extend, ctx);
      if ("errors" in sub)
        errors.push(sub);
      else
        passes.push(sub);
    }
    if (errors.length > 0) {
      return { type: "ExtensionFailure", errors: errors };
    }
    return { type: "ExtensionResults", solutions: passes };
  }

  /** TripleConstraintsVisitor - walk shape's extends to get all
   * referenced triple constraints.
   *
   * @param {} labelToTcs: Map<shapeLabel, TripleConstraint[]>
   * @returns { extendsTCs: [[TripleConstraint]], localTCs: [TripleConstraint] }
   */
  TripleConstraintsVisitor (labelToTcs: { [id: string]: ShExJ.TripleConstraint[] }) {
    const _ShExValidator = this;
    const visitor = ShExVisitor(labelToTcs);

    function emptyShapeExpr () { return []; }

    visitor.visitShapeDecl = function (decl: ShapeDecl, _min: number, _max: number) {
      // if (labelToTcs.has(decl.id)) !! uncomment cache for production
      //   return labelToTcs[decl.id];
      labelToTcs[decl.id] = decl.shapeExpr
          ? visitor.visitShapeExpr(decl.shapeExpr, 1, 1)
          : emptyShapeExpr();
      return [{ type: "Ref", ref: decl.id }];
    }
    visitor.visitShapeOr = function (shapeExpr: ShapeOr, _min: number, max: number) {
      return shapeExpr.shapeExprs.reduce(
        (acc, disjunct) => acc.concat(this.visitShapeExpr(disjunct, 0, max))
        , emptyShapeExpr()
      );
    }

    visitor.visitShapeAnd = function (shapeExpr: ShapeAnd, min: number, max: number) {
      const seen = new Set();
      return shapeExpr.shapeExprs.reduce<TripleConstraint[]>((acc, disjunct) => {
        this.visitShapeExpr(disjunct, min, max).forEach((tc: TripleConstraint) => {
          const key = `${tc.min} ${tc.max} ${tc.predicate}`;
          if (!seen.has(key)) {
            seen.add(key);
            acc.push(tc);
          }
        });

        // @@ TODO: calculate intersection with acc
        return acc;
      }, []);
    }

    visitor.visitShapeNot = function (expr: ShapeNot, _min: number, _max: number) {
      throw Error(`don't know what to do when extending ${JSON.stringify(expr)}`);
    }

    visitor.visitShapeExternal = emptyShapeExpr

    visitor.visitNodeConstraint = emptyShapeExpr;

    // Override visitShapeRef to follow references.
    // tests: Extend3G-pass, vitals-RESTRICTS-pass_lie-Vital...
    visitor.visitShapeRef = function (shapeLabel: string, min: number, max: number) {
      return visitor.visitShapeDecl(_ShExValidator.lookupShape(shapeLabel), min, max);
    };

    visitor.visitShape = function (shape: Shape, min: number, max: number) {
      const { extendsTCs, localTCs } = shapePieces(shape, min, max);
      return extendsTCs.flat().concat(localTCs);
    }
    // Visit shape's EXTENDS and expression.
    function shapePieces (shape: Shape, min: number, max: number): {
      extendsTCs: RefsAndTCsForShapesExtensions ;
      localTCs: TripleConstraint[];
    } {
      const extendsTCs = shape.extends !== undefined
            ? shape.extends.map(ext => visitor.visitShapeExpr(ext, min, max))
            : [];
      const localTCs = shape.expression === undefined
            ? []
            : visitor.visitExpression(shape.expression, min, max);
      return { extendsTCs, localTCs };
    }

    function getAllTripleConstraints (shape: Shape) {
      const { extendsTCs: extendsTcOrRefsz, localTCs } = shapePieces(shape, 1, 1);
      const tcs: TripleConstraint[] = [];
      const tc2exts: number[][] = [];
      extendsTcOrRefsz.map((tcOrRefs, ord) => flattenExtends(tcOrRefs, ord));
      return { extendsTCs: tcs, tc2exts, localTCs };

      function flattenExtends (tcOrRefs: RefsAndTCsForOneExtension, ord: number) {
        return tcOrRefs.forEach(tcOrRef => {
          if (tcOrRef.type === "TripleConstraint") {
            add(tcOrRef); // as TC
          } else {
            flattenExtends(labelToTcs[tcOrRef.ref], ord);
          }
        });
        function add (tc: TripleConstraint) {
          const idx = tcs.indexOf(tc);
          if (idx === -1) {
            // new TC
            tcs.push(tc);
            tc2exts.push([ord]);
          } else {
            // ref to TC already seen in this or earlier EXTENDS
            if (tc2exts[idx].indexOf(ord) === -1) {
              // not yet included in this EXTENDS
              tc2exts[idx].push(ord);
            }
          }
        }
      }
    }
    // tripleExprs return list of TripleConstraints

    function n (l: number, expr: OneOf | EachOf) {
      if (expr.min === undefined) return l;
      return l * expr.min;
    }

    function x (l: number, expr: OneOf | EachOf) {
      if (expr.max === undefined) return l;
      if (l === -1 || expr.max === -1) return -1;
      return l * expr.max;
    }

    function and<T> (tes: T[][]): T[] {
      // @ts-ignore
      return [].concat.apply([], tes);
    }

    // Any TC inside a OneOf implicitly has a min cardinality of 0.
    visitor.visitOneOf = function (expr: OneOf, _outerMin: number, outerMax: number) {
      return and(expr.expressions.map(nested => visitor.visitTripleExpr(nested, 0, x(outerMax, expr))))
    }

    visitor.visitEachOf = function (expr: EachOf, outerMin: number, outerMax: number) {
      return and(expr.expressions.map(nested => visitor.visitTripleExpr(nested, n(outerMin, expr), x(outerMax, expr))))
    }

    visitor.visitInclusion = function (inclusion: string, outerMin: number, outerMax: number) {
      return visitor.visitTripleExpr(_ShExValidator.index.tripleExprs[inclusion], outerMin, outerMax);
    }

    // Synthesize a TripleConstraint with the implicit cardinality.
    visitor.visitTripleConstraint = function (expr: TripleConstraint, _outerMin: number, _outerMax: number) {
      return [expr];
      /* eval-threaded-n-err counts on constraintList.indexOf(expr) so we can't optimize with:
         const ret = JSON.parse(JSON.stringify(expr));
         ret.min = n(outerMin, expr);
         ret.max = x(outerMax, expr);
         return [ret];
      */
    };

    return {getAllTripleConstraints};
  }

  triplesMatchingShapeExpr(triples: Quad[], constraint: TripleConstraint, ctx: ShapeExprValidationContext): TriplesMatching {
    const _ShExValidator = this;
    const misses: Miss[] = [];
    const hits: Hit[] = [];
    triples.forEach(function (triple) {
      const value = constraint.inverse ? triple.subject : triple.object;
      const oldBindings = JSON.parse(JSON.stringify(_ShExValidator.semActHandler.results));
      if (constraint.valueExpr === undefined)
        hits.push({triple, sub: undefined});
      else {
        ctx = ctx.followTripleConstraint();
        const sub = _ShExValidator.validateShapeExpr(value, constraint.valueExpr, ctx) as any;
        if (sub.errors === undefined) {
          hits.push({triple: triple, sub: sub});
        } else /* !! if (!hits.find(h => h.triple === triple)) */ {
          _ShExValidator.semActHandler.results = JSON.parse(JSON.stringify(oldBindings));
          misses.push({triple: triple, errors: sub});
        }
      }
    });
    return { hits: hits, misses: misses };
  }

  /* _validateNodeConstraint - return whether the value matches the value
   * expression without checking shape references.
   */
  _validateNodeConstraint(point: RdfJsTerm, shapeExpr: NodeConstraint, ctx: ShapeExprValidationContext): shapeExprTest {
    const errors: string[] = [];
    function validationError (...s:string[]): boolean {
      const errorStr = Array.prototype.join.call(s, "");
      errors.push("Error validating " + ShExTerm.rdfJsTermToTurtle(point) + " as " + JSON.stringify(shapeExpr) + ": " + errorStr);
      return false;
    }

    if (shapeExpr.nodeKind !== undefined) {
      if (["iri", "bnode", "literal", "nonliteral"].indexOf(shapeExpr.nodeKind) === -1) {
        validationError(`unknown node kind '${shapeExpr.nodeKind}'`);
      }
      if (ShExTerm.isBlank(point)) {
        if (shapeExpr.nodeKind === "iri" || shapeExpr.nodeKind === "literal") {
          validationError(`blank node found when ${shapeExpr.nodeKind} expected`);
        }
      } else if (ShExTerm.isLiteral(point)) {
        if (shapeExpr.nodeKind !== "literal") {
          validationError(`literal found when ${shapeExpr.nodeKind} expected`);
        }
      } else if (shapeExpr.nodeKind === "bnode" || shapeExpr.nodeKind === "literal") {
        validationError(`iri found when ${shapeExpr.nodeKind} expected`);
      }
    }

    if (shapeExpr.datatype  && shapeExpr.values) validationError("found both datatype and values in " + shapeExpr);

    if (shapeExpr.values !== undefined) {
      if (!shapeExpr.values.some(valueSetValue => testValueSetValue(valueSetValue, point))) {
        validationError(`value ${(point.value)} not found in set ${JSON.stringify(shapeExpr.values)}`);
      }
    }

    const numeric = getNumericDatatype(point);

    if (shapeExpr.datatype !== undefined) {
      testKnownTypes(point, validationError, ldify, shapeExpr.datatype, numeric, point.value);
    }

    testFacets(shapeExpr, point.value, validationError, numeric);

    const ncRet = Object.assign({}, {
      type: null,
      node: ldify(point)
    }, (ctx.label ? {shape: ctx.label} : {}), {shapeExpr});
    Object.assign(
      ncRet,
      errors.length > 0
        ? {type: "NodeConstraintViolation", errors: errors}
      : {type: "NodeConstraintTest",}
    );
    return this.evaluateShapeExprSemActs(ncRet as any as shapeExprTest, shapeExpr, point, ctx.label);
  }
}

function testLanguageStem(typedValue: string, stem: string) {
  const trail = typedValue.substring(stem.length);
  return (typedValue !== "" && typedValue.startsWith(stem) && (stem === "" || trail === "" || trail[0] === "-"));
}

function valueInExclusions(exclusions: Array<IRIREF | IriStem | ObjectLiteral | LiteralStem | Language | LanguageStem>, value: string): boolean {
  return exclusions.some(exclusion => {
    if (typeof exclusion === "string") { // Iri
      return (value === exclusion)
    } else if (typeof exclusion === "object" // Literal
        && exclusion.type !== undefined
        && !exclusion.type.match(/^(?:Iri|Literal|Language)(?:Stem(?:Range)?)?$/)) {
      return (value === (exclusion as ObjectLiteral).value)
    } else {
      const valueConstraint = exclusion as IriStem | LiteralStem | Language | LanguageStem;
      switch (valueConstraint.type) {
          // "Iri" covered above
        case "IriStem":
          return (value.startsWith(valueConstraint.stem));
          // "Literal" covered above
        case "LiteralStem":
          return (value.startsWith(valueConstraint.stem));
        case "Language":
          return (value === valueConstraint.languageTag);
        case "LanguageStem":
          return testLanguageStem(value, valueConstraint.stem);
      }
    }
    return false;
  })
}

function testValueSetValue(valueSetValueP: string | ObjectLiteral | IriStem | IriStemRange | LiteralStem | LiteralStemRange | Language | LanguageStem | LanguageStemRange, value: RdfJsTerm) {
  if (typeof valueSetValueP === "string") { // Iri
    return (value.termType === "NamedNode" && value.value === valueSetValueP);
  } else if (typeof valueSetValueP === "object" // Literal
      && (valueSetValueP.type === undefined
          || !valueSetValueP.type.match(/^(?:Iri|Literal|Language)(?:Stem(?:Range)?)?$/))) {
    if (value.termType !== "Literal") {
      return false;
    } else {
      const vsValueLiteral = valueSetValueP as ObjectLiteral;
      const valLiteral = value as RdfJsLiteral;
      return (value.value === vsValueLiteral.value
          && (vsValueLiteral.language === undefined || vsValueLiteral.language === valLiteral.language)
          && (vsValueLiteral.type === undefined || vsValueLiteral.type === valLiteral.datatype.value));
    }
  } else {
    // Do a little dance to rule out ObjectLiteral and IRIREF
    const valueSetValue = valueSetValueP as IriStem | IriStemRange | LiteralStem | LiteralStemRange | Language | LanguageStem | LanguageStemRange
    switch (valueSetValue.type) {
        // "Iri" covered above
      case "IriStem":
        if (value.termType !== "NamedNode") return false;
        return (value.value.startsWith(valueSetValue.stem));
      case "IriStemRange":
        if (value.termType !== "NamedNode") return false;
        if (typeof valueSetValue.stem === "string" && !value.value.startsWith(valueSetValue.stem))
          return false;
        return (!valueInExclusions(valueSetValue.exclusions, value.value));
        // "Literal" covered above
      case "LiteralStem":
        if (value.termType !== "Literal") return false;
        return (value.value.startsWith(valueSetValue.stem));
      case "LiteralStemRange":
        if (value.termType !== "Literal") return false;
        if (typeof valueSetValue.stem === "string" && !value.value.startsWith(valueSetValue.stem as string))
          return false;
        return (!valueInExclusions(valueSetValue.exclusions, value.value));
      case "Language":
        if (value.termType !== "Literal") return false;
        return (value.language === valueSetValue.languageTag);
      case "LanguageStem":
        if (value.termType !== "Literal") return false;
        return testLanguageStem(value.language, valueSetValue.stem);
      case "LanguageStemRange":
        if (value.termType !== "Literal") return false;
        if (typeof valueSetValue.stem === "string" && !testLanguageStem(value.language, valueSetValue.stem))
          return false;
        return (!valueInExclusions(valueSetValue.exclusions, value.language));
    }
  }
}

/** Explore permutations of mapping from Triples to TripleConstraints
 * documented using test ExtendsRepeatedP-pass
 */
class TripleToTripleConstraints {
  private extendsTCcount: number;
  private tc2exts: number[][];
  private subgraphCache: Map<string, boolean>;
  private crossProduct: { next: () => (boolean); get: () => (number | typeof NoTripleConstraint)[]; };
  /**
   *
   * @param constraintList mapping from Triple to possible TripleConstraints, e.g. [
   *      [0,2,4], # try T0 against TC0, TC2, TC4
   *      [0,2,4], # try T1 against same
   *      [0,2,4], # try T2 against same
   *      [1,3]    # try T3 against TC1, TC3
   *   ]
   * @param extendsTCcount how many TCs are in EXTENDS,
   *   e.g. 4 says that TCs 0-3 are assigned to some EXTENDS; only TC4 is "local".
   * @param tc2exts which TripleConstraints came from which EXTENDS, e.g. [
   *     [0], # TC0 is assignable to EXTENDS 0
   *     [0], # TC1 is assignable to EXTENDS 0
   *     [0], # TC2 is assignable to EXTENDS 0
   *     [0], # TC3 is assignable to EXTENDS 0
   *   ]
   */
  constructor (constraintList: T2TCs, extendsTCcount: number, tc2exts:number[][]) {
    this.extendsTCcount = extendsTCcount; this.tc2exts = tc2exts;
    this.subgraphCache = new Map();
    // @ts-ignore
    this.crossProduct = CrossProduct<typeof NoTripleConstraint>(constraintList, NoTripleConstraint);
  }

  /**
   * Find next mapping of Triples to TripleConstraints.
   * Exclude any that differ only in an irrelevant order difference in assignment to EXTENDS.
   * @returns {number[] | null}
   */
  next (): (ConstraintNo | typeof NoTripleConstraint)[] | null {
    while (this.crossProduct.next()) {
      /* t2tc - array mapping neighborhood index to TripleConstraint
       * CrossProduct counts through constraintList from the right:
       *   [ 0, 0, 0, 1 ] # first call
       *   [ 0, 0, 0, 3 ] # second call
       *   [ 0, 0, 2, 1 ] # third call
       *   [ 0, 0, 2, 3 ] # fourth call
       *   [ 0, 0, 4, 1 ] # fifth call
       *   [ 0, 2, 0, 1 ] # sixth call...
       */
      const t2tc = this.crossProduct.get(); // [0,1,0,3] mapping from triple to constraint
      // if (DBG_gonnaMatch (t2tc, fromDB, constraintList)) debugger;

      /* If this permutation repeats the same assignments to EXTENDS parents, continue to next permutation.
         Test extends-abstract-multi-empty_fail-Ref1ExtraP includes e.g. "_-L4-E0-E0-E0-_" from:
         t2tc: [ NoTripleConstraint, 4, 2, 1, 3, NoTripleConstraint ]
         tc2exts: [[0], [0], [0], [0]] (All four TCs assignable to first EXTENDS.)
      */
      const subgraphKey = t2tc.map(cNo =>
        cNo === NoTripleConstraint
          ? '_'
          : cNo < this.extendsTCcount
          ? '' + this.tc2exts[cNo].map(eNo => 'E' + eNo)
          : 'L' + cNo
      ).join('-')

      if (!this.subgraphCache.has(subgraphKey)) {
        this.subgraphCache.set(subgraphKey, true);
        return t2tc;
      }
    }
    return null;
  }
}

// { next: () => (boolean); get: () => number[] | null }
// http://stackoverflow.com/questions/9422386/lazy-cartesian-product-of-arrays-arbitrary-nested-loops
function CrossProduct<T>(sets: number[][], emptyValue: T) {
  const n = sets.length, carets: number[] = [];
  let args: (number | T)[] | null = null;

  function init() {
    args = [];
    for (let i = 0; i < n; i++) {
      carets[i] = 0;
      args[i] = sets[i].length > 0 ? sets[i][0] : emptyValue;
    }
  }

  function next() {

    // special case: crossProduct([]).next().next() returns false.
    if (args !== null && args.length === 0)
      return false;

    if (args === null) {
      init();
      return true;
    }
    let i = n - 1;
    carets[i]++;
    if (carets[i] < sets[i].length) {
      args[i] = sets[i][carets[i]];
      return true;
    }
    while (carets[i] >= sets[i].length) {
      if (i === 0) {
        return false;
      }
      carets[i] = 0;
      args[i] = sets[i].length > 0 ? sets[i][0] : emptyValue;
      carets[--i]++;
    }
    args[i] = sets[i][carets[i]];
    return true;
  }

  return {
    next: next,
    // do: function (block, _context) { // old API
    //   return block.apply(_context, args);
    // },
    // new API because
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments#Description
    // cautions about functions over arguments.
    get: function () { return args; }
  };
}

/* N3jsTripleToString - simple toString function to make N3.js's triples
 * printable.
 */
const N3jsTripleToString = function () {
  function fmt (n: RdfJsTerm) {
    return ShExTerm.isLiteral(n) ?
      [ "http://www.w3.org/2001/XMLSchema#integer",
        "http://www.w3.org/2001/XMLSchema#float",
        "http://www.w3.org/2001/XMLSchema#double"
      ].indexOf(ShExTerm.getLiteralType(n)) !== -1 ?
      parseInt(ShExTerm.getLiteralValue(n)) :
      n :
    ShExTerm.isBlank(n) ?
      n :
      "<" + n + ">";
  }
  // @ts-ignore
  return fmt(this.subject) + " " + fmt(this.predicate) + " " + fmt(this.object) + " .";
};

/* indexNeighborhood - index triples by predicate
 * returns: {
 *     byPredicate: Object: mapping from predicate to triples containing that
 *                  predicate.
 *
 *     candidates: [[1,3], [0,2]]: mapping from triple to the triple constraints
 *                 it matches.  It is initialized to []. Mappings that remain an
 *                 empty set indicate a triple which didn't matching anything in
 *                 the shape.
 *
 *     misses: list to receive value constraint failures.
 *   }
 */
function indexNeighborhood (triples: Quad[]): NeighborhoodIndex {
  return {
    byPredicate: triples.reduce(function (ret, t) {
      const p = t.predicate.value;
      if (!ret.has(p))
        ret.set(p, []);
      ret.get(p).push(t);

      // If in VERBOSE mode, add a nice toString to N3.js's triple objects.
      if (VERBOSE)
        t.toString = N3jsTripleToString;

      return ret;
    }, new Map()),
    candidates: _seq<number>(triples.length).map(function () {
      return [];
    }),
    misses: []
  };
}

/* sparqlOrder - sort triples by subject following SPARQL partial ordering.
 */
function sparqlOrder (l: RdfJsTerm, r: RdfJsTerm): number {
  const [lprec, rprec] = [l, r].map(
    x => ShExTerm.isBlank(x) ? 1 : ShExTerm.isLiteral(x) ? 2 : 3
  );
  return lprec === rprec ? l.value.localeCompare(r.value) : lprec - rprec;
}

/* Return a list of n `undefined`s.
 *
 * Note that Array(n) on its own returns a "sparse array" so Array(n).map(f)
 * never calls f.
 */
function _seq<T> (n: number): (T | undefined)[] {
  return Array.from(Array(n)); // hahaha, javascript, you suck.
}

function runtimeError (... args: string[]): never {
  const errorStr = args.join("");
  const e = new Error(errorStr);
  Error.captureStackTrace(e, runtimeError);
  throw e;
}

  function _alist (len: number): any[] {
    return _seq(len).map(() => [])
  }

