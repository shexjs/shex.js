/* ShExValidator - javascript module to validate a graph with respect to Shape Expressions
 */

// interface constants
import * as ShExTerm from "@shexjs/term";
import {InternalSchema, LdTerm, SchemaIndex, ShapeMap, ShapeMapEntry} from "@shexjs/term";
import {ShExVisitor, index as indexSchema} from "@shexjs/visitor";
import {
  NoTripleConstraint,
  QueryTracker,
  SemActDispatcher,
  SemActHandler,
  ValidatorRegexEngine
} from "@shexjs/eval-validator-api";
import * as Hierarchy from 'hierarchy-closure';
import type {Quad, Term as RdfJsTerm} from 'rdf-js';
import {Neighborhood, NeighborhoodDb} from "@shexjs/neighborhood-api";
import {
  BooleanSemActFailure, FailureList,
  Recursion,
  SemActFailure,
  shapeExprTest,
  ShapeTest,
  SolutionList,
  Failure, NodeConstraintViolation, NodeConstraintTest, ShapeAndFailure, ShapeNotResults, ShapeNotFailure,
} from "@shexjs/term/shexv";
import * as ShExJ from "shexj";
import {
  NodeConstraint,
  Schema,
  Shape, ShapeAnd,
  ShapeDecl,
  shapeDeclRef,
  shapeExpr,
  shapeExprOrRef, ShapeNot, ShapeOr,
  EachOf, OneOf,
  TripleConstraint,
} from "shexj";

export {};

interface Xdb extends NeighborhoodDb {
  getTriplesByIRI(s: RdfJsTerm, p: RdfJsTerm, o: RdfJsTerm, g?: RdfJsTerm): Quad[];
  addIncomingTriples(tz: Quad[]): void;
  addOutgoingTriples(tz: Quad[]): void;
}

export const Start = { term: "START" }
export const InterfaceOptions = {
  "coverage": {
    "firstError": "fail on first error (usually used with eval-simple-1err)",
    "exhaustive": "find as many errors as possible (usually used with eval-threaded-nerr)"
  }
};

const VERBOSE = false; // "VERBOSE" in process.env;
const EvalThreadedNErr = require("@shexjs/eval-threaded-nerr");

const XSD = "http://www.w3.org/2001/XMLSchema#";
const integerDatatypes = [
  XSD + "integer",
  XSD + "nonPositiveInteger",
  XSD + "negativeInteger",
  XSD + "long",
  XSD + "int",
  XSD + "short",
  XSD + "byte",
  XSD + "nonNegativeInteger",
  XSD + "unsignedLong",
  XSD + "unsignedInt",
  XSD + "unsignedShort",
  XSD + "unsignedByte",
  XSD + "positiveInteger"
];

const decimalDatatypes = [
  XSD + "decimal",
].concat(integerDatatypes);

const numericDatatypes = [
  XSD + "float",
  XSD + "double"
].concat(decimalDatatypes);

interface datatypeParser {
  (label: string, parseError: parseErrorHandler): number;
}

interface parseErrorHandler {
  (message: string, value?: number): void;
}

const numericParsers: {
  [id: string]: datatypeParser
} = {};

numericParsers[XSD + "integer"] = function (label, parseError): number {
  if (!(label.match(/^[+-]?[0-9]+$/))) {
    parseError("illegal integer value '" + label + "'");
  }
  return parseInt(label);
};
numericParsers[XSD + "decimal"] = function (label, parseError) {
  if (!(label.match(/^[+-]?(?:[0-9]*\.[0-9]+|[0-9]+)$/))) { // XSD has no pattern for decimal?
    parseError("illegal decimal value '" + label + "'");
  }
  return parseFloat(label);
};
const DECIMAL_REGEX = /^[+\-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+\-]?[0-9]+)?$/;
numericParsers[XSD + "float"  ] = function (label, parseError) {
  if (label === "NaN") return NaN;
  if (label === "INF") return Infinity;
  if (label === "-INF") return -Infinity;
  if (!(label.match(DECIMAL_REGEX))) { // XSD has no pattern for float?
    parseError("illegal float value '" + label + "'");
  }
  return parseFloat(label);
};
numericParsers[XSD + "double" ] = function (label, parseError) {
  if (label === "NaN") return NaN;
  if (label === "INF") return Infinity;
  if (label === "-INF") return -Infinity;
  if (!(label.match(DECIMAL_REGEX))) {
    parseError("illegal double value '" + label + "'");
  }
  return Number(label);
};

function testRange (value: number, datatype: string, parseError: parseErrorHandler) {
  const ranges: {
    [id: string]: {min: number, max: number}
  } = {
    //    integer            -1 0 1 +1 | "" -1.0 +1.0 1e0 NaN INF
    //    decimal            -1 0 1 +1 -1.0 +1.0 | "" 1e0 NaN INF
    //    float              -1 0 1 +1 -1.0 +1.0 1e0 1E0 NaN INF -INF | "" +INF
    //    double             -1 0 1 +1 -1.0 +1.0 1e0 1E0 NaN INF -INF | "" +INF
    //    nonPositiveInteger -1 0 +0 -0 | 1 +1 1a a1
    //    negativeInteger    -1 | 0 +0 -0 1
    //    long               -1 0 1 +1 |
    //    int                -1 0 1 +1 |
    //    short              -32768 0 32767 | -32769 32768
    //    byte               -128 0 127 | "" -129 128
    //    nonNegativeInteger 0 -0 +0 1 +1 | -1
    //    unsignedLong       0 1 | -1
    //    unsignedInt        0 1 | -1
    //    unsignedShort      0 65535 | -1 65536
    //    unsignedByte       0 255 | -1 256
    //    positiveInteger    1 | -1 0
    //    string             "" "a" "0"
    //    boolean            true false 0 1 | "" TRUE FALSE tRuE fAlSe -1 2 10 01
    //    dateTime           "2012-01-02T12:34:56.78Z" | "" "2012-01-02T" "2012-01-02"
    integer:            { min: -Infinity           , max: Infinity },
    decimal:            { min: -Infinity           , max: Infinity },
    float:              { min: -Infinity           , max: Infinity },
    double:             { min: -Infinity           , max: Infinity },
    nonPositiveInteger: { min: -Infinity           , max: 0        },
    negativeInteger:    { min: -Infinity           , max: -1       },
    long:               { min: -9223372036854775808, max: 9223372036854775807 },
    int:                { min: -2147483648         , max: 2147483647 },
    short:              { min: -32768              , max: 32767    },
    byte:               { min: -128                , max: 127      },
    nonNegativeInteger: { min: 0                   , max: Infinity },
    unsignedLong:       { min: 0                   , max: 18446744073709551615 },
    unsignedInt:        { min: 0                   , max: 4294967295 },
    unsignedShort:      { min: 0                   , max: 65535    },
    unsignedByte:       { min: 0                   , max: 255      },
    positiveInteger:    { min: 1                   , max: Infinity }
  }
  const parms = ranges[datatype.substr(XSD.length)];
  if (!parms) throw Error("unexpected datatype: " + datatype);
  if (value < parms.min) {
    parseError("\"" + value + "\"^^<" + datatype + "> is less than the min:", parms.min);
  } else if (value > parms.max) {
    parseError("\"" + value + "\"^^<" + datatype + "> is greater than the max:", parms.min);
  }
};

/*
function intSubType (spec, label, parseError) {
  const ret = numericParsers[XSD + "integer"](label, parseError);
  if ("min" in spec && ret < spec.min)
    parseError("illegal " + XSD + spec.type + " value '" + label + "' should not be < " + spec.min);
  if ("max" in spec && ret > spec.max)
    parseError("illegal " + XSD + spec.type + " value '" + label + "' should not be > " + spec.max);
  return ret;
}
[{type: "nonPositiveInteger", max: 0},
 {type: "negativeInteger", max: -1},
 {type: "long", min: -9223372036854775808, max: 9223372036854775807}, // beyond IEEE double
 {type: "int", min: -2147483648, max: 2147483647},
 {type: "short", min: -32768, max: 32767},
 {type: "byte", min: -128, max: 127},
 {type: "nonNegativeInteger", min: 0},
 {type: "unsignedLong", min: 0, max: 18446744073709551615},
 {type: "unsignedInt", min: 0, max: 4294967295},
 {type: "unsignedShort", min: 0, max: 65535},
 {type: "unsignedByte", min: 0, max: 255},
 {type: "positiveInteger", min: 1}].forEach(function (i) {
   numericParsers[XSD + i.type ] = function (label, parseError) {
     return intSubType(i, label, parseError);
   };
 });
*/

const stringTests: {
  [id: string]: (v: string, l: number) => boolean;
} = {
  length   : function (v, l) { return v.length === l; },
  minlength: function (v, l) { return v.length  >= l; },
  maxlength: function (v, l) { return v.length  <= l; }
};

const numericValueTests: {
  [id: string]: (got: number, expected: number) => boolean;
} = {
  mininclusive  : function (n, m) { return n >= m; },
  minexclusive  : function (n, m) { return n >  m; },
  maxinclusive  : function (n, m) { return n <= m; },
  maxexclusive  : function (n, m) { return n <  m; }
};

const decimalLexicalTests: {
  [id: string]: (v: string, l: number) => boolean;
} = {
  totaldigits   : function (v, d) {
    const m = v.match(/[0-9]/g);
    return !!m && m.length <= d;
  },
  fractiondigits: function (v, d) {
    const m = v.match(/^[+-]?[0-9]*\.?([0-9]*)$/);
    return !!m && m[1].length <= d;
  }
};

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

    function isTerm (t: LdTerm) {
      return typeof t !== "object" || "value" in t && Object.keys(t).reduce((r, k) => {
        return r === false ? r : ["value", "type", "language"].indexOf(k) !== -1;
      }, true);
    }

interface ValidatorOptions {
  regexModule?: ValidatorRegexEngine;
  coverage?: {
    exhaustive: string;
    firstError: string;
  };
  noCache?: boolean;
  semActs?: SemActCodeIndex;
  validateExtern?: (point: RdfJsTerm, shapeLabel: string | { term: string }, tracker: QueryTracker, seen: SeenIndex) => shapeExprTest;
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
   * @param {string} code - text of the semantic action.
   * @param {object} ctx - matched triple or results subset.
   * @param {object} extensionStorage - place where the extension writes into the result structure.
   * @return {bool} false if the extension failed or did not accept the ctx object.
   */
  register (name: string, handler: SemActHandler) {
    this.handlers[name] = handler;
  }
  /**
   * Calls all semantic actions, allowing each to write to resultsArtifact.
   *
   * @param {array} semActs - list of semantic actions to invoke.
   * @return {bool} false if any result was false.
   */
  dispatchAll (semActs: [ShExJ.SemAct], ctx: any, resultsArtifact: any): (SemActFailure | BooleanSemActFailure)[] {
    const strs: string[] = ["abc", "def"];
    const lens: number[] = strs.reduce((ret: number[], str: string) => {
      return ret.concat(str.length);
    }, []);

    return semActs.reduce((ret: (SemActFailure | BooleanSemActFailure)[], semAct) => {
      if (ret.length === 0 && semAct.name in this.handlers) {
        const code: string | null = ("code" in semAct ? semAct.code : this.externalCode[semAct.name]) || null;
        const existing = "extensions" in resultsArtifact && semAct.name in resultsArtifact.extensions;
        const extensionStorage = existing ? resultsArtifact.extensions[semAct.name] : {};
        const response = this.handlers[semAct.name].dispatch(code, ctx, extensionStorage);
        if (typeof response === 'boolean') {
          if (!response)
            ret.push({ type: "SemActFailure", errors: [{ type: "BooleanSemActFailure", code: code, ctx }] })
        } else if (typeof response === 'object' && Array.isArray(response)) {
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

class EmptyTracker implements QueryTracker {
  depth = 0;

  recurse(rec: Recursion) {}
  known(res: shapeExprTest) {}
  enter(term: RdfJsTerm, shapeLabel: string) { ++this.depth; }
  exit(term: RdfJsTerm, shapeLabel: string, res: shapeExprTest) { --this.depth; }
}

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

interface ResList {passes: shapeExprTest[], failures: shapeExprTest[]};

type TripleNo = number;
type ConsraintNo = number;


interface ValParms {
  db: NeighborhoodDb;
  shapeLabel: string | { term: string };
  depth: number;
  tracker: QueryTracker;
  seen: SeenIndex;
}

interface ReferenceToExtendedShapeDecl { type: "Ref", ref: string; }
type RefOrTc = ReferenceToExtendedShapeDecl | TripleConstraint;
type RefsAndTCsForOneExtension = RefOrTc[];
type RefsAndTCsForShapesExtensions = RefsAndTCsForOneExtension[];

/* ShExValidator_constructor - construct an object for validating a schema.
 *
 * schema: a structure produced by a ShEx parser or equivalent.
 * options: object with controls for
 *   lax(true): boolean: whine about missing types in schema.
 *   diagnose(false): boolean: makde validate return a structure with errors.
 */
export class ShExValidator {
  public type: string;
  public options: ValidatorOptions;
  public known: {
    [id: string]: shapeExprTest;
  }
  public schema: InternalSchema;
  public emptyTracker: QueryTracker;
  public semActHandler: SemActDispatcher;
  public index: SchemaIndex;
  private db: NeighborhoodDb;
  private regexModule: ValidatorRegexEngine;

  constructor(schema: InternalSchema, db: NeighborhoodDb, options: ValidatorOptions = {}) {
    // if (!(this instanceof ShExValidator_constructor))
    //   return new ShExValidator_constructor(schema, db, options);
    this.index = schema._index || indexSchema(schema)
    if (!("labelToTcs" in this.index)) // !! what is this?
      this.index.labelToTcs = {};
    this.type = "ShExValidator";
    options = options || {};
    this.options = options;
    this.known = {};

    const _ShExValidator = this;
    this.schema = schema;
    this.db = db;
    // const regexModule = this.options.regexModule || require("@shexjs/eval-simple-1err");
    this.regexModule = this.options.regexModule || EvalThreadedNErr;

    /* emptyTracker - a tracker that does nothing
     */
    this.emptyTracker = new EmptyTracker();
    this.semActHandler = new SemActDispatcherImpl(options.semActs);
  }

  validateApi (shapeMap: ShapeMap, tracker?: QueryTracker, seen?: SeenIndex): ShExJsResultMap {
    return shapeMap.map(pair => {
      let time = +new Date();
      const res = this.validateShapeLabel(ShExTerm.LdToRdfJsTerm(pair.node), pair.shape, tracker, seen); // really tracker and seen
      time = +new Date() - time;
      return {
        node: pair.node,
        shape: pair.shape,
        status: "errors" in res ? "nonconformant" : "conformant",
        appinfo: res,
        // elapsed: time
      };
    });
  }

  validateObj (shapeMap: ShapeMap, tracker?: QueryTracker, seen?: SeenIndex): shapeExprTest {
    const results = shapeMap.reduce<ResList>((ret, pair) => {
      const res = this.validateShapeLabel(ShExTerm.LdToRdfJsTerm(pair.node), pair.shape, tracker, seen); // really tracker and seen
      return "errors" in res
          ? { passes: ret.passes, failures: ret.failures.concat([res]) }
          : { passes: ret.passes.concat([res]), failures: ret.failures } ;
    }, {passes: [], failures: []});
    if (results.failures.length > 0) {
      return results.failures.length !== 1
          ? { type: "FailureList", errors: results.failures }
          : results.failures [0];
    } else {
      return results.passes.length !== 1
          ? { type: "SolutionList", solutions: results.passes }
          : results.passes [0];
    }
  }

  validatePair (point: RdfJsTerm, label: string, tracker?: QueryTracker, seen?: SeenIndex) {
    return this.validateShapeLabel (point, label, tracker, seen);
  }

  validateShapeLabel (point: RdfJsTerm, label: string | typeof Start, tracker?: QueryTracker, seen?: SeenIndex, matchTarget?: MatchTarget, subGraph?: NeighborhoodDb): shapeExprTest {
    const outside = tracker === undefined;
    // logging stuff
    if (!tracker)
      tracker = this.emptyTracker;

    if (seen === undefined)
      seen = {};

    if (typeof label !== "string") {
      if (label !== Start)
        runtimeError(`unknown shape label ${JSON.stringify(label)}`);
      if (!this.schema.start)
        runtimeError("start production not defined");
      return this._validateShapeExpr(point, this.schema.start, Start, 0, tracker, seen);
    }

    const shape = this._lookupShape(label);
    const seenKey = ShExTerm.rdfJsTermToTurtle(point) + "@" + label;
    if (!subGraph) { // Don't cache base shape validations as they aren't testing the full neighborhood.
      if (seenKey in seen)
        {
          let ret: Recursion = {
            type: "Recursion",
            node: ldify(point),
            shape: label
          };
          tracker.recurse(ret);
          return ret;
        }
      if ("known" in this && seenKey in this.known) {
        const ret = this.known[seenKey];
        tracker.known(ret);
        return ret;
      }
      seen[seenKey] = { node: point, shape: label };
      tracker.enter(point, label);
    }
    const ret = this._validateDescendants(point, label, 0, tracker, seen, matchTarget, subGraph, false);
    if (!subGraph) {
      tracker.exit(point, label, ret);
      delete seen[seenKey];
      if ("known" in this)
        this.known[seenKey] = ret;
    }
    if ("startActs" in this.schema && outside) {
      (ret as ShapeTest).startActs = this.schema.startActs; // TODO: figure out where startActs can appear in ShExJ
    }
    return ret;
  }

  _validateDescendants(point: RdfJsTerm, shapeLabel: string, depth: number, tracker: QueryTracker, seen: SeenIndex, matchTarget: MatchTarget | undefined, subGraph?: NeighborhoodDb, allowAbstract: boolean): shapeExprTest {
    const _ShExValidator = this;
    if (subGraph) { // !! matchTarget?
      // matchTarget indicates that shape substitution has already been applied.
      // Now we're testing a subgraph against the base shapes.
      const res = this._validateShapeDecl(point, this._lookupShape(shapeLabel), shapeLabel, 0, tracker, seen, matchTarget, subGraph);
      if (matchTarget && shapeLabel === matchTarget.label && !("errors" in res))
        matchTarget.count++;
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
      candidates = candidates.filter(l => this._lookupShape(l).abstract);

    // Aggregate results in a SolutionList or FailureList.
    const results = candidates.reduce<ResList>((ret, candidateShapeLabel) => {
      const shapeExpr = this._lookupShape(candidateShapeLabel);
      const matchTarget = candidateShapeLabel === shapeLabel ? undefined : { label: shapeLabel, count: 0 };
      const res = this._validateShapeDecl(point, shapeExpr, candidateShapeLabel, 0, tracker, seen, matchTarget, subGraph);
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

    // @TODO move to Vistior.index
    function indexExtensions (schema: Schema): ExtensionIndex {
      const abstractness: { [id:string]: boolean } = {};
      const extensions = Hierarchy.create();
      makeSchemaVisitor().visitSchema(schema);
      return extensions.children;

      function makeSchemaVisitor () {
        const schemaVisitor = new ShExVisitor();
        let curLabel: string;
        let curAbstract;
        const oldVisitShapeDecl = schemaVisitor.visitShapeDecl;

        schemaVisitor.visitShapeDecl = function (decl) {
          curLabel = decl.id;
          curAbstract = decl.abstract;
          abstractness[decl.id] = decl.abstract;
          return oldVisitShapeDecl.call(schemaVisitor, decl, decl.id);
        };

        schemaVisitor.visitShape = function (shape: ShExJ.Shape) {
          if (shape.extends !== undefined) {
            shape.extends.forEach(ext => {
              const extendsVisitor = new ShExVisitor();
              extendsVisitor.visitExpression = function (expr, ...args) { return "null"; }
              extendsVisitor.visitShapeRef = function (reference, ...args) {
                extensions.add(reference, curLabel);
                extendsVisitor.visitShapeDecl(_ShExValidator._lookupShape(reference))
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

  _validateShapeDecl(point: RdfJsTerm, shapeDecl: ShExJ.ShapeDecl, shapeLabel: string, depth: number, tracker: QueryTracker, seen: SeenIndex, matchTarget: MatchTarget | undefined, subGraph?: NeighborhoodDb): shapeExprTest {
    const conjuncts = (shapeDecl.restricts || []).concat([shapeDecl.shapeExpr])
    const expr = conjuncts.length === 1
          ? conjuncts[0]
          : { type: "ShapeAnd", shapeExprs: conjuncts } as ShExJ.ShapeAnd;
    return this._validateShapeExpr(point, expr, shapeLabel, depth, tracker, seen, matchTarget, subGraph);
  }

  _lookupShape(label: string): ShapeDecl {
    const shapes = this.schema.shapes;
    if (shapes !== undefined) {
      runtimeError("shape " + label + " not found; no shapes in schema");
    } else if (label in this.index.shapeExprs) {
      return this.index.shapeExprs[label]
    }
    runtimeError("shape " + label + " not found in:\n" + Object.keys(this.index.shapeExprs || []).map(s => "  " + s).join("\n"));
  }

  _validateShapeExpr(point: RdfJsTerm, shapeExpr: shapeExprOrRef, shapeLabel: string | typeof Start, depth: number, tracker: QueryTracker, seen: SeenIndex, matchTarget?: MatchTarget | undefined, subGraph?: NeighborhoodDb): shapeExprTest {
    if (typeof shapeExpr === "string") // ShapeRef
      return this._validateDescendants(point, shapeExpr, depth, tracker, seen, matchTarget, subGraph, true);

    switch (shapeExpr.type) {
      case "NodeConstraint":
        const ncErrors = this._errorsMatchingNodeConstraint(point, shapeExpr);
        const ncRet = Object.assign({}, {
          type: null,
          node: ldify(point)
        }, (shapeLabel ? {shape: shapeLabel} : {}), {shapeExpr});
        Object.assign(
            ncRet,
            ncErrors.length > 0
                ? {type: "NodeConstraintViolation", errors: ncErrors}
                : {type: "NodeConstraintTest",}
        );
        return this.evaluateShapeExprSemActs(ncRet as any as shapeExprTest, shapeExpr, point, shapeLabel);
        break;
      case "Shape":
        return this._validateShape(point, shapeExpr, shapeLabel, depth, tracker, seen, matchTarget, subGraph);
        break;
      case "ShapeExternal":
        if (typeof this.options.validateExtern !== "function")
          throw runtimeError(`validating ${ShExTerm.internalTermToTurtle(point)} as EXTERNAL shapeExpr ${shapeLabel} requires a 'validateExtern' option`)
        return this.options.validateExtern(point, shapeLabel, tracker, seen);
        break;
      case "ShapeOr":
        const orErrors = [];
        for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
          const nested = shapeExpr.shapeExprs[i];
          const sub = this._validateShapeExpr(point, nested, shapeLabel, depth, tracker, seen, matchTarget, subGraph);
          if ("errors" in sub)
            orErrors.push(sub);
          else if (!matchTarget || matchTarget.count > 0)
            return {type: "ShapeOrResults", solution: sub};
        }
        return {type: "ShapeOrFailure", errors: orErrors} as any as shapeExprTest;
        break;
      case "ShapeNot":
        const sub = this._validateShapeExpr(point, shapeExpr.shapeExpr, shapeLabel, depth, tracker, seen, matchTarget, subGraph);
        return ("errors" in sub)
          ? {type: "ShapeNotResults", solution: sub} as any as shapeExprTest
          : {type: "ShapeNotFailure", errors: sub} as any as shapeExprTest; // ugh
      case "ShapeAnd":
        const andPasses = [];
        const andErrors = [];
        for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
          const nested = shapeExpr.shapeExprs[i];
          const sub = this._validateShapeExpr(point, nested, shapeLabel, depth, tracker, seen, matchTarget, subGraph);
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

  private evaluateShapeExprSemActs(ret: shapeExprTest, shapeExpr: NodeConstraint, point: RdfJsTerm, shapeLabel: string | typeof Start) {
    if (!("errors" in ret) && shapeExpr.semActs !== undefined) {
      const semActErrors = this.semActHandler.dispatchAll((shapeExpr as any).semActs, Object.assign({node: point}, ret), ret)
      if (semActErrors.length)
          // some semAct aborted
        return {type: "Failure", node: ldify(point), shape: shapeLabel, errors: semActErrors} as Failure;
    }
    return ret;
  }

  _validateShape(point: RdfJsTerm, shape: Shape, shapeLabel: string | typeof  Start, depth: number, tracker: QueryTracker, seen: SeenIndex, matchTarget: MatchTarget | undefined, subGraph?: NeighborhoodDb): shapeExprTest {
    const valParms: ValParms = { db: this.db, shapeLabel, depth, tracker, seen };

    let ret = null;
    const startAcionStorage = {}; // !!! need test to see this write to results structure.
    if ("startActs" in this.schema) {
      const semActErrors = this.semActHandler.dispatchAll(this.schema.startActs, null, startAcionStorage)
      if (semActErrors.length)
        return {
          type: "Failure",
          node: ldify(point),
          shape: shapeLabel,
          errors: semActErrors
        }; // some semAct aborted !! return a better error
    }

    const fromDB  = (subGraph || this.db).getNeighborhood(point, shapeLabel, shape);
    const outgoingLength = fromDB.outgoing.length;
    const neighborhood = fromDB.outgoing.sort(
      (l, r) => l.predicate.value.localeCompare(r.predicate.value) || sparqlOrder(l.object, r.object)
    ).concat(fromDB.incoming.sort(
      (l, r) => l.predicate.value.localeCompare(r.predicate.value) || sparqlOrder(l.object, r.object)
    ));

    const { extendsTCs, tc2exts, localTCs } = this.TripleConstraintsVisitor(this.index.labelToTcs).getAllTripleConstraints(shape);
    const constraintList = extendsTCs.concat(localTCs);

    // neighborhood already integrates subGraph so don't pass to _errorsMatchingShapeExpr
    const tripleList = this.matchByPredicate(constraintList, neighborhood, outgoingLength, point, valParms, matchTarget);
    const {misses, extras} = this.whatsMissing(tripleList, neighborhood, outgoingLength, shape.extra || [])

    const allT2TCs = new TripleToTripleConstraints(tripleList.constraintList, extendsTCs.length, tc2exts);
    const partitionErrors = [];
    const regexEngine = this.regexModule.compile(this.schema, shape, this.index);

    for (let t2tc = allT2TCs.next(); t2tc !== null && ret === null; t2tc = allT2TCs.next()) {
      const localT2Tc = []; // subset of TCs assigned to shape.expression
      const unexpectedOrds = [];
      const extendsToTriples = _seq((shape.extends || []).length).map(() => []);
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

      const errors = []
      const usedTriples = []; // [{s1,p1,o1},{s2,p2,o2}] implicated triples -- used for messages
      const constraintMatchCount = // [2,1,0,1] how many triples matched a constraint
            _seq(neighborhood.length).map(function () { return 0; });

      // Triples not mapped to triple constraints are not allowed in closed shapes.
      if (shape.closed && unexpectedOrds.length > 0) {
        errors.push({
          type: "ClosedShapeViolation",
          unexpectedTriples: unexpectedOrds.map(tNo => {
            q = neighborhood[tNo];
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
      const tc2t = _constraintToTriples(localT2Tc, constraintList, tripleList); // e.g. [[t0, t2], [t1, t3]]

      let results = testExtends(shape, point, extendsToTriples, valParms, matchTarget);
      if (results === null || !("errors" in results)) {
        const sub = regexEngine.match(db, point, constraintList, tc2t, localT2Tc, neighborhood, this.semActHandler, null);
        if (!("errors" in sub) && results) {
          results = { type: "ExtendedResults", extensions: results };
          if (Object.keys(sub).length > 0) // no empty objects from {}s.
            results.local = sub;
        } else {
          results = sub;
        }
      }
      if ("errors" in results)
        [].push.apply(errors, results.errors);

      const possibleRet = { type: "ShapeTest", node: ldify(point), shape: shapeLabel };
      if (errors.length === 0 && Object.keys(results).length > 0) // only include .solution for non-empty pattern
        possibleRet.solution = results;
      if ("semActs" in shape) {
        const semActErrors = this.semActHandler.dispatchAll(shape.semActs, Object.assign({node: point}, results), possibleRet)
        if (semActErrors.length)
          // some semAct aborted
          [].push.apply(errors, semActErrors);
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
    let errors = missErrors.concat(lastErrors.length === 1 ? lastErrors[0] : lastErrors);
    if (errors.length > 0)
      ret = {
        type: "Failure",
        node: ldify(point),
        shape: shapeLabel,
        errors: errors
      };

    // remove N3jsTripleToString
    if (VERBOSE)
      neighborhood.forEach(function (t) {
        delete t.toString;
      });

    return addShapeAttributes(shape, ret);
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
  matchByPredicate (constraintList: TripleConstraint[], neighborhood: Quad[], outgoingLength: number, point: RdfJsTerm, valParms: ValParms, matchTarget: MatchTarget | undefined) {
    const outgoing = indexNeighborhood(neighborhood.slice(0, outgoingLength));
    const incoming = indexNeighborhood(neighborhood.slice(outgoingLength));
    return constraintList.reduce(function (ret, constraint, cNo) {

      // subject and object depend on direction of constraint.
      const searchSubject = constraint.inverse ? null : point;
      const searchObject = constraint.inverse ? point : null;
      const index = constraint.inverse ? incoming : outgoing;

      // get triples matching predciate
      const matchPredicate = index.byPredicate.get(constraint.predicate) ||
            []; // empty list when no triple matches that constraint

      // strip to triples matching value constraints (apart from @<someShape>)
      const matchConstraints = _ShExValidator._triplesMatchingShapeExpr(
        matchPredicate, constraint, valParms, matchTarget
      );

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
    }, { misses: {}, results: _alist(constraintList.length), constraintList:_alist(neighborhood.length) })
  }

  whatsMissing (tripleList, neighborhood: Quad[], outgoingLength: number, extras: string[]): {
    misses: {
      tripleNo: TripleNo;
      constraintNo: ConsraintNo;
      errors: shapeExprTest;
    };
    extras: TripleNo[];
  } {
    const matchedExtras = []; // triples accounted for by EXTRA
    const misses = tripleList.constraintList.reduce(function (ret, constraints, ord) {
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

  addShapeAttributes (shape, ret) {
    if ("annotations" in shape)
      ret.annotations = shape.annotations;
    return ret;
  }

  // Pivot to triples by constraint.
  _constraintToTriples (t2tc, constraintList, tripleList) {
    return t2tc.slice().
      reduce(function (ret, cNo, tNo) {
        if (cNo !== NoTripleConstraint)
          ret[cNo].push({tNo: tNo, res: tripleList.results[cNo][tNo]});
        return ret;
      }, _seq(constraintList.length).map(() => [])); // [length][]
  }

  testExtends (expr, point, extendsToTriples, valParms, matchTarget) {
    if (!("extends" in expr))
      return null;
    const passes = [];
    const errors = [];
    for (let eNo = 0; eNo < expr.extends.length; ++eNo) {
      const extend = expr.extends[eNo];
      const subgraph = this.makeTriplesDB(null); // These triples were tracked earlier.
      extendsToTriples[eNo].forEach(t => subgraph.addOutgoingTriples([t]));
      const sub = this._validateShapeExpr(point, extend, valParms.shapeLabel, valParms.depth, valParms.tracker, valParms.seen, matchTarget, subgraph);
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

  /** Directly construct a DB from triples.
   * TODO: should this be in @shexjs/neighborhood-something ?
   */
  makeTriplesDB (queryTracker: QueryTracker | null): Xdb {
    const incoming: Quad[] = [];
    const outgoing: Quad[] = [];

    function getTriplesByIRI(s: RdfJsTerm, p: RdfJsTerm, o: RdfJsTerm, g?: RdfJsTerm): Quad[] {
      return incoming.concat(outgoing).filter(
        t =>
          (!s || s === t.subject) &&
          (!p || p === t.predicate) &&
          (!s || s === t.object)
      );
    }

    function getNeighborhood (point: RdfJsTerm, shapeLabel: string | typeof Start, shape: Shape): Neighborhood {
      return {
        outgoing: outgoing,
        incoming: incoming
      };
    }

    return {
      getNeighborhood: getNeighborhood,
      getTriplesByIRI: getTriplesByIRI,
      getSubjects: function () { throw Error("!Triples DB can't index subjects"); },
      getPredicates: function () { throw Error("!Triples DB can't index predicates"); },
      getObjects: function () { throw Error("!Triples DB can't index objects"); },
      getQuads: function () { throw Error("!Triples DB doesn't have Quads"); },
      get size(): number { return incoming.length + outgoing.length; },
      addIncomingTriples: function (tz: Quad[]) { Array.prototype.push.apply(incoming, tz); },
      addOutgoingTriples: function (tz: Quad[]) { Array.prototype.push.apply(outgoing, tz); }
    };
  }

  /** TripleConstraintsVisitor - walk shape's extends to get all
   * referenced triple constraints.
   *
   * @param {} labelToTcs: Map<shapeLabel, TripleConstraint[]>
   * @returns { extendsTCs: [[TripleConstraint]], localTCs: [TripleConstraint] }
   */
  TripleConstraintsVisitor (labelToTcs: { [id: string]: ShExJ.TripleConstraint[] }) {
    const _ShExValidator = this;
    const visitor = new ShExVisitor(labelToTcs);

    function emptyShapeExpr () { return []; }

    visitor.visitShapeDecl = function (decl: ShapeDecl, min: number, max: number) {
      // if (labelToTcs.has(decl.id)) !! uncomment cache for production
      //   return labelToTcs[decl.id];
      const tcs = decl.shapeExpr
            ? visitor.visitShapeExpr(decl.shapeExpr, 1, 1)
            : emptyShapeExpr();
      labelToTcs[decl.id] = tcs;
      return [{ type: "Ref", ref: decl.id }];
    }
    visitor.visitShapeOr = function (shapeExpr: ShapeOr, min: number, max: number) {
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

    visitor.visitShapeNot = function (expr: ShapeNot, min: number, max: number) {
      throw 1;
    }

    visitor.visitShapeExternal = emptyShapeExpr

    visitor.visitNodeConstraint = emptyShapeExpr;

    // Override visitShapeRef to follow references.
    // tests: Extend3G-pass, vitals-RESTRICTS-pass_lie-Vital...
    visitor.visitShapeRef = function (shapeLabel: string, min: number, max: number) {
      return visitor.visitShapeDecl(_ShExValidator._lookupShape(shapeLabel), min, max);
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
      const localTCs = "expression" in shape
            ? visitor.visitExpression(shape.expression, min, max)
            : [];
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

    function n (l, expr) {
      if (!("min" in expr)) return l;
      return l * expr.min;
    }

    function x (l, expr) {
      if (!("max" in expr)) return l;
      if (l === -1 || expr.max === -1) return -1;
      return l * expr.max;
    }

    function and (tes) {
      return [].concat.apply([], tes);
    }

    // Any TC inside a OneOf implicitly has a min cardinality of 0.
    visitor.visitOneOf = function (expr: OneOf, outerMin: number, outerMax: number) {
      return and(expr.expressions.map(nested => visitor.visitTripleExpr(nested, 0, x(outerMax, expr))))
    }

    visitor.visitEachOf = function (expr: EachOf, outerMin: number, outerMax: number) {
      return and(expr.expressions.map(nested => visitor.visitTripleExpr(nested, n(outerMin, expr), x(outerMax, expr))))
    }

    visitor.visitInclusion = function (inclusion, outerMin: number, outerMax: number) {
      return visitor.visitTripleExpr(_ShExValidator.index.tripleExprs[inclusion], outerMin, outerMax);
    }

    // Synthesize a TripleConstraint with the implicit cardinality.
    visitor.visitTripleConstraint = function (expr, outerMin, outerMax) {
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

  _triplesMatchingShapeExpr(triples, constraint, valParms, matchTarget) {
    const misses = [];
    const hits = [];
    triples.forEach(function (triple) {
      const value = constraint.inverse ? triple.subject : triple.object;
      let sub;
      const oldBindings = JSON.parse(JSON.stringify(_ShExValidator.semActHandler.results));
      const errors = constraint.valueExpr === undefined ?
          undefined :
            (sub = _ShExValidator._validateShapeExpr(value, constraint.valueExpr, valParms.shapeLabel, valParms.depth, valParms.tracker, valParms.seen, matchTarget, null)).errors;
      if (!errors) {
        hits.push({triple: triple, sub: sub});
      } else if (hits.indexOf(triple) === -1) {
        _ShExValidator.semActHandler.results = JSON.parse(JSON.stringify(oldBindings));
        misses.push({triple: triple, errors: sub});
      }
    });
    return { hits: hits, misses: misses };
  }

  /* _errorsMatchingNodeConstraint - return whether the value matches the value
   * expression without checking shape references.
   */
  _errorsMatchingNodeConstraint(value: RdfJsTerm, valueExpr: NodeConstraint): string[] {
    const errors: string[] = [];
    const label = value.value;
    const dt = ShExTerm.isLiteral(value) ? ShExTerm.getLiteralType(value) : null;
    const numeric = integerDatatypes.indexOf(dt) !== -1 ? XSD + "integer" : numericDatatypes.indexOf(dt) !== -1 ? dt : undefined;

    function validationError (...s:string[]) {
      const errorStr = Array.prototype.join.call(s, "");
      errors.push("Error validating " + ShExTerm.rdfJsTermToTurtle(value) + " as " + JSON.stringify(valueExpr) + ": " + errorStr);
      return false;
    }
    // if (negated) ;
    if (false) {
      // wildcard -- ignore
    } else {
      if ("nodeKind" in valueExpr) {
        if (["iri", "bnode", "literal", "nonliteral"].indexOf(valueExpr.nodeKind) === -1) {
          validationError("unknown node kind '" + valueExpr.nodeKind + "'");
        }
        if (ShExTerm.isBlank(value)) {
          if (valueExpr.nodeKind === "iri" || valueExpr.nodeKind === "literal") {
            validationError("blank node found when " + valueExpr.nodeKind + " expected");
          }
        } else if (ShExTerm.isLiteral(value)) {
          if (valueExpr.nodeKind !== "literal") {
            validationError("literal found when " + valueExpr.nodeKind + " expected");
          }
        } else if (valueExpr.nodeKind === "bnode" || valueExpr.nodeKind === "literal") {
          validationError("iri found when " + valueExpr.nodeKind + " expected");
        }
      }

      if (valueExpr.datatype  && valueExpr.values) validationError("found both datatype and values in " + valueExpr);

      if (valueExpr.datatype) {
        if (!ShExTerm.isLiteral(value)) {
          validationError("mismatched datatype: " + JSON.stringify(ldify(value)) + " is not a literal with datatype " + valueExpr.datatype);
        }
        else if (ShExTerm.getLiteralType(value) !== valueExpr.datatype) {
          validationError("mismatched datatype: " + ShExTerm.getLiteralType(value) + " !== " + valueExpr.datatype);
        }
        else if (numeric) {
          testRange(numericParsers[numeric](label, validationError), valueExpr.datatype, validationError);
        }
        else if (valueExpr.datatype === XSD + "boolean") {
          if (label !== "true" && label !== "false" && label !== "1" && label !== "0")
            validationError("illegal boolean value: " + label);
        }
        else if (valueExpr.datatype === XSD + "dateTime") {
          if (!label.match(/^[+-]?\d{4}-[01]\d-[0-3]\dT[0-5]\d:[0-5]\d:[0-5]\d(\.\d+)?([+-][0-2]\d:[0-5]\d|Z)?$/))
            validationError("illegal dateTime value: " + label);
        }
      }

      if (valueExpr.values) {
        if (ShExTerm.isLiteral(value) && valueExpr.values.reduce((ret, v) => {
          if (ret) return true;
          const ld = ldify(value);
          if (v.type === "Language") {
            return v.languageTag === ld.language; // @@ use equals/normalizeTest
          }
          if (!(typeof v === "object" && "value" in v)) // don't check for equivalent term if not a simple literal
            return false;
          return v.value === label
            && (!("type" in v) || v.type === value.datatype.value)
            && (!("language" in v) || v.language === value.language);
        }, false)) {
          // literal match
        } else if (valueExpr.values.indexOf(label) !== -1) {
          // trivial match
        } else {
          if (!(valueExpr.values.some(function (valueConstraint) {
            if (typeof valueConstraint === "object" && !("value" in valueConstraint)) { // i.e. not a simple term
              if (!("type" in valueConstraint))
                runtimeError("expected "+JSON.stringify(valueConstraint)+" to have a 'type' attribute.");
              const ExpectedTypePattern = /(Iri|Literal|Language)(Stem)?(Range)?/;
              const matchType = valueConstraint.type.match(ExpectedTypePattern);
              if (!matchType)
                runtimeError("expected type attribute '" + valueConstraint.type + "' to match " + ExpectedTypePattern + ".");
              const [undefined, valType, isStem, isRange] = matchType;
              if (valType === 'Iri') {
                if (value.termType !== 'NamedNode')
                  return false;
              } else {
                if (value.termType !== 'Literal')
                  return false;
              }

              /* expect N3.js literals with {Literal,Language}StemRange
               *       or non-literals with IriStemRange
               */
              function normalizedTest (val, ref, func) {
                if (["Literal", "Language"].indexOf(valType) !== -1) { // ShExTerm.isLiteral(val)
                  if (["LiteralStem", "LiteralStemRange"].indexOf(valueConstraint.type) !== -1) {
                    return func(ShExTerm.getLiteralValue(val), ref);
                  } else if (["LanguageStem", "LanguageStemRange"].indexOf(valueConstraint.type) !== -1) {
                    return func(ShExTerm.getLiteralLanguage(val) || null, ref);
                  } else {
                    return validationError("literal " + JSON.stringify(val) + " not comparable with non-literal " + ref);
                  }
                } else {
                  if (["IriStem", "IriStemRange"].indexOf(valueConstraint.type) === -1) {
                    return validationError("nonliteral " + JSON.stringify(val) + " not comparable with literal " + JSON.stringify(ref));
                  } else {
                    return func(ShExTerm.getLiteralValue(val), ref);
                  }
                }
              }
              function startsWith (val, ref) {
                return normalizedTest(val, ref, (l, r) => {
                  return (valueConstraint.type === "LanguageStem" ||
                          valueConstraint.type === "LanguageStemRange") ?
                    // rfc4647 basic filtering
                    l !== null && (l === r || r === "" || l[r.length] === "-") :
                    // simple substring
                    l.startsWith(r);
                });
              }
              function equals (val, ref) {
                return normalizedTest(val, ref, (l, r) => { return l === r; });
              }

              if (!isTerm(valueConstraint.stem)) {
                expect(valueConstraint.stem, "type", "Wildcard");
                // match whatever but check exclusions below
              } else {
                if (!(startsWith(value, valueConstraint.stem))) {
                  return false;
                }
              }
              if (valueConstraint.exclusions) {
                return !valueConstraint.exclusions.some(function (c) {
                  if (!isTerm(c)) {
                    if (!("type" in c))
                      runtimeError("expected "+JSON.stringify(c)+" to have a 'type' attribute.");
                    const stemTypes = ["IriStem", "LiteralStem", "LanguageStem"];
                    if (stemTypes.indexOf(c.type) === -1)
                      runtimeError("expected type attribute '"+c.type+"' to be in '"+stemTypes+"'.");
                    return startsWith(value, c.stem);
                  } else {
                    return equals(value, c);
                  }
                });
              }
              return true;
            } else {
              // ignore -- would have caught it above
            }
          }))) {
            validationError("value " + label + " not found in set " + JSON.stringify(valueExpr.values));
          }
        }
      }
    }

    if ("pattern" in valueExpr) {
      const regexp = "flags" in valueExpr ?
	  new RegExp(valueExpr.pattern, valueExpr.flags) :
	  new RegExp(valueExpr.pattern);
      if (!(label.match(regexp)))
        validationError("value " + label + " did not match pattern " + valueExpr.pattern);
    }

    Object.keys(stringTests).forEach(function (test) {
      if (test in valueExpr && !stringTests[test](label, valueExpr[test])) {
        validationError("facet violation: expected " + test + " of " + valueExpr[test] + " but got " + label);
      }
    });

    Object.keys(numericValueTests).forEach(function (test) {
      if (test in valueExpr) {
        if (numeric) {
          if (!numericValueTests[test](numericParsers[numeric](label, validationError), valueExpr[test])) {
            validationError("facet violation: expected " + test + " of " + valueExpr[test] + " but got " + label);
          }
        } else {
          validationError("facet violation: numeric facet " + test + " can't apply to " + label);
        }
      }
    });

    Object.keys(decimalLexicalTests).forEach(function (test) {
      if (test in valueExpr) {
        if (numeric === XSD + "integer" || numeric === XSD + "decimal") {
          if (!decimalLexicalTests[test](""+numericParsers[numeric](label, validationError), valueExpr[test])) {
            validationError("facet violation: expected " + test + " of " + valueExpr[test] + " but got " + label);
          }
        } else {
          validationError("facet violation: numeric facet " + test + " can't apply to " + label);
        }
      }
    });
    return errors; // validateShapeExpr creates a ShExV result, but it could go down here.
  }
}

/** Explore permutations of mapping from Triples to TripleConstraints
 * documented using test ExtendsRepeatedP-pass
 */
class TripleToTripleConstraints {
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
  constructor (constraintList, extendsTCcount, tc2exts) {
    this.extendsTCcount = extendsTCcount; this.tc2exts = tc2exts;
    this.subgraphCache = new Map();
    this.crossProduct = CrossProduct(constraintList, NoTripleConstraint);
  }

  /**
   * Find next mapping of Triples to TripleConstraints.
   * Exclude any that differ only in an irrelevent order difference in assinment to EXTENDS.
   * @returns {number[] | null}
   */
  next () {
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

// http://stackoverflow.com/questions/9422386/lazy-cartesian-product-of-arrays-arbitrary-nested-loops
function CrossProduct(sets: number[][], emptyValue: any) {
  const n = sets.length, carets: number[] = [];
  let args: number[] | null = null;

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
 *     misses: list to recieve value constraint failures.
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

/* Expect property p with value v in object o
 */
function expect (o: object, p: string, v: string) {
  if (!(p in o))
    runtimeError("expected "+JSON.stringify(o)+" to have a '"+p+"' attribute.");
  // @ts-ignore
  if (arguments.length > 2 && (o[p] !== v))
    { // @ts-ignore
      runtimeError("expected "+p+" attribute '"+o[p]+"' to equal '"+v+"'.");
    }
}

function noop () {  }

function runtimeError (... args: string[]): never {
  const errorStr = args.join("");
  const e = new Error(errorStr);
  Error.captureStackTrace(e, runtimeError);
  throw e;
}

  function _alist (len: number): any[] {
    return _seq(len).map(() => [])
  }

  return {
    construct: ShExValidator_constructor,
    start: Start,
    options: InterfaceOptions
  };
}
