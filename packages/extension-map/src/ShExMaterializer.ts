/* ShExMaterializer - javascript module to validate a graph with respect to Shape Expressions
 *
 * Status: 1/2 tested, no known bugs.
 *
 * TODO:
 *   constraint violation reporting.
 */

const {rdfJsTerm2Ld} = require("@shexjs/term");

const ShExMapMaterializerCjsModule = function (config: any) {

const Start = config.Validator.Start;

// interface constants
const InterfaceOptions = {
  "or": {
    "oneOf": "exactly one disjunct must pass",
    "someOf": "one or more disjuncts must pass",
    "firstOf": "disjunct evaluation stops after one passes"
  },
  "partition": {
    "greedy": "each triple constraint consumes all triples matching predicate and object",
    "exhaustive": "search all mappings of triples to triple constriant"
  }
};

// **ShExValidator** provides ShEx utility functions


const ShExTerm = require("@shexjs/term");

const UNBOUNDED = -1;

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

const numericParsers: any = {};
numericParsers[XSD + "integer"] = function (label: any, parseError: any) {
  if (!(label.match(/^[+-]?[0-9]+$/))) {
    parseError("illegal integer value '" + label + "'");
  }
  return parseInt(label);
};
numericParsers[XSD + "decimal"] = function (label: any, parseError: any) {
  if (!(label.match(/^[+-]?(?:[0-9]*\.[0-9]+|[0-9]+)$/))) { // XSD has no pattern for decimal?
    parseError("illegal integer value '" + label + "'");
  }
  return parseFloat(label);
};
numericParsers[XSD + "float"  ] = function (label: any, parseError: any) {
  if (!(label.match(/^[+-]?(?:[0-9]*\.[0-9]+|[0-9]+)$/))) { // XSD has no pattern for float?
    parseError("illegal integer value '" + label + "'");
  }
  return parseFloat(label);
};
numericParsers[XSD + "double" ] = function (label: any, parseError: any) {
  if (!(label.match(/[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/))) {
    parseError("illegal integer value '" + label + "'");
  }
  return Number(label);
};

function testRange (value: any, datatype: any, parseError: any) {
  const ranges: any = {
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
function intSubType (spec: any, label: any, parseError: any) {
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
 {type: "positiveInteger", min: 1}].forEach(function (i: any) {
   numericParsers[XSD + i.type ] = function (label: any, parseError: any) {
     return intSubType(i, label, parseError);
   };
 });
*/

const stringTests: any = {
  length   : function (v: any, l: any) { return v.length === l; },
  minlength: function (v: any, l: any) { return v.length  >= l; },
  maxlength: function (v: any, l: any) { return v.length  <= l; }
};

const numericValueTests: any = {
  mininclusive  : function (n: any, m: any) { return n >= m; },
  minexclusive  : function (n: any, m: any) { return n >  m; },
  maxinclusive  : function (n: any, m: any) { return n <= m; },
  maxexclusive  : function (n: any, m: any) { return n <  m; }
};

const decimalLexicalTests: any = {
  totaldigits   : function (v: any, d: any) {
    const m = v.match(/[0-9]/g);
    return m && m.length <= d;
  },
  fractiondigits: function (v: any, d: any) {
    const m = v.match(/^[+-]?[0-9]*\.?([0-9]*)$/);
    return m && m[1].length <= d;
  }
};

function makeCache () {
  const _keys: any = {}; // _keys[http://abcd] = [obj1, obj2]
  const _vals: any = {}; // _vals[http://abcd] = [res1, res2]
  return {
    cached: function (focus: any, shape: any) {
     const key = ShExTerm.rdfJsTerm2Turtle(focus);
      let cache = _keys[key];
      if (!cache) {
        _keys[key] = cache = [];
        _vals[key] = [];
        return undefined;
      }
      const idx = cache.indexOf(shape);
      return idx === -1 ? undefined : _vals[key][idx];
    },
    remember: function (focus: any, shape: any, res: any) {
     const key = ShExTerm.rdfJsTerm2Turtle(focus);
      const cache = _keys[key];
      if (!cache) {
        _keys[key] = [];
        _vals[key] = [];
      } else if (cache.indexOf(shape) !== -1) {
        // we're conservative in the use here.
        throw Error("not expecting duplicate key " + key);
      }
      _keys[key].push(shape);
      _vals[key].push(res);
    }
  };
}

/* ShExValidator - construct an object for validating a schema.
 *
 * schema: a structure produced by a ShEx parser or equivalent.
 * options: object with controls for
 *   lax(true): boolean: whine about missing types in schema.
 *   diagnose(false): boolean: makde validate return a structure with errors.
 */
function ShExMaterializer_constructor(this: any, schema: any, mapper: any, options: any) {
  if (!(this instanceof (ShExMaterializer_constructor as any)))
    return new (ShExMaterializer_constructor as any)(schema, mapper, options);
  this.type = "ShExValidator";
  options = options || {};
  this.options = options;
  this.options.or = this.options.or || "someOf";
  this.options.partition = this.options.partition || "exhaustive";
  if (!("noCache" in options && options.noCache))
    this.known = makeCache();

  const _ShExValidator = this;
  this.schema = schema;
  this._optimize = {}; // optimizations:
    // hasRepeatedGroups: whether there are patterns like (:p1 ., :p2 .)*
  this.reset = function (this: any) {  }; // included in case we need it later.
  // const regexModule = this.options.regexModule || require("@shexjs/eval-simple-1err");
  const regexModule = this.options.regexModule || require("./eval-simple-1err-materializer");

  let blankNodeCount = 0;
  const nextBNode = options.nextBNode || function () {
    return '_:b' + blankNodeCount++;
  };

  /* indexTripleConstraints - compile regular expression and index triple constraints
   */
  this.indexTripleConstraints = function (this: any, expression: any) {
    // list of triple constraints from (:p1 ., (:p2 . | :p3 .))
    const tripleConstraints: any[] = [];

    if (expression)
      indexTripleConstraints_dive(expression);
    return tripleConstraints;

    function indexTripleConstraints_dive (expr: any) {
      if (typeof expr === "string") // an inclusion: the labelled expression it names
        indexTripleConstraints_dive(schema._index.tripleExprs[expr]);

      else if (expr.type === "TripleConstraint")
        tripleConstraints.push(expr)-1;

      else if (expr.type === "OneOf" || expr.type === "EachOf")
        expr.expressions.forEach(function (nested: any) {
          indexTripleConstraints_dive(nested);
        });

      else
        runtimeError("unexpected expr type: " + expr.type);
    };
  };

  this.validateShapeMap = function (this: any, db: any, shapeMap: any, depth: any, seen: any) {
    return shapeMap.map((pair: any) => {
      let time: any = new Date();
      const res = this.validate(db, ShExTerm.ld2RdfJsTerm(pair.node), pair.shape, depth, seen); // really tracker and seen
      time = new Date().valueOf() - time.valueOf();
      return {
        node: pair.node,
        shape: pair.shape,
        status: "errors" in res ? "nonconformant" : "conformant",
        appinfo: res,
        elapsed: time
      };
    });
  }

  /* validate - test point in db against the schema for labelOrShape
   * depth: level of recurssion; for logging.
   */
  this.validate = function (this: any, db: any, point: any, labelOrShape: any, depth: any, seen: any) {
    // default to schema's start shape
    if (!labelOrShape || labelOrShape === config.Validator.Start) {
      if (!schema.start)
        runtimeError("start production not defined");
      labelOrShape = schema.start;
    }
    if (typeof labelOrShape !== "string")
      return this._validateShapeExpr(db, point, labelOrShape, "_: -start-", depth, seen);

    if (!(labelOrShape in this.schema._index.shapeExprs))
      runtimeError("shape " + labelOrShape + " not defined");

    const label = labelOrShape; // for clarity
    if (seen === undefined)
      seen = {};
    const seenKey = ShExTerm.rdfJsTerm2Turtle(point) + "@" + (label === Start ? "_: -start-" : label);
    if (seenKey in seen)
      return {
        type: "Recursion",
        node: rdfJsTerm2Ld(point),
        shape: label
      };
    seen[seenKey] = { point: point, shapeLabel: label };
    const ret = this._validateShapeDecl(db, point, schema._index.shapeExprs[label], label, depth, seen);
    delete seen[seenKey];
    return ret;
  }

  this._validateShapeDecl = function (this: any, db: any, point: any, shapeDecl: any, shapeLabel: any, depth: any, tracker: any, seen: any, subgraph: any) {
    return this._validateShapeExpr(db, point, shapeDecl.shapeExpr, shapeLabel, depth, tracker, seen, subgraph);
  }

  this._validateShapeExpr = function (this: any, db: any, point: any, shapeExpr: any, shapeLabel: any, depth: any, seen: any) {
    if ("known" in this && this.known.cached(point, shapeExpr))
      return this.known.cached(point, shapeExpr);
    let ret = null;
    if (point === "")
      throw Error("validation needs a valid focus node");
    if (typeof(shapeExpr) === "string") { // ShapeRef
      ret = this._validateShapeDecl(db, point, schema._index.shapeExprs[shapeExpr], shapeExpr, depth, seen);
    } else if (shapeExpr.type === "NodeConstraint") {
      const checked = this._errorsMatchingNodeConstraint(point, shapeExpr, null);
      ret = "errors" in checked ? {
        type: "Failure",
        node: rdfJsTerm2Ld(point),
        shape: shapeLabel,
        errors: checked.errors.map(function (_miss: any) {
          return {
            type: "NodeConstraintViolation",
            shapeExpr: shapeExpr
          };
        })
      } : {
        type: "NodeConstraintTest",
        node: rdfJsTerm2Ld(point),
        shape: shapeLabel,
        shapeExpr: shapeExpr
      };
    } else if (shapeExpr.type === "Shape") {
      ret = this._validateShape(db, point, regexModule.compile(schema, shapeExpr),
                                 shapeExpr, shapeLabel, depth, seen);
    } else if (shapeExpr.type === "ShapeExternal") {
      ret = this.options.validateExtern(db, point, shapeLabel, depth, seen);
    } else if (shapeExpr.type === "ShapeOr") {
      const errors: any[] = [];
      ret = { type: "ShapeOrFailure", errors: errors };
      for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        const nested = shapeExpr.shapeExprs[i];
        const sub = this._validateShapeExpr(db, point, nested, shapeLabel, depth, seen);
        if ("errors" in sub)
          errors.push(sub);
        else {
          ret = { type: "ShapeOrResults", solution: sub };
          break;
        }
      }
    } else if (shapeExpr.type === "ShapeNot") {
      const sub = this._validateShapeExpr(db, point, shapeExpr.shapeExpr, shapeLabel, depth, seen);
      if ("errors" in sub)
          ret = { type: "ShapeNotResults", solution: sub };
        else
          ret = { type: "ShapeNotFailure", errors: sub };
    } else if (shapeExpr.type === "ShapeAnd") {
      const passes: any[] = [];
      ret = { type: "ShapeAndResults", solutions: passes };
      for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        const nested = shapeExpr.shapeExprs[i];
        const sub = this._validateShapeExpr(db, point, nested, shapeLabel, depth, seen);
        if ("errors" in sub) {
          ret = { type: "ShapeAndFailure", errors: sub };
          break;
        } else
          passes.push(sub);
      }
    } else
      throw Error("expected one of Shape{Ref,And,Or} or NodeConstraint, got " + JSON.stringify(shapeExpr));
    if ("known" in this)
      this.known.remember(point, shapeExpr, ret);
    return ret;
  }

  this._validateShape = function (this: any, db: any, point: any, regexEngine: any, shape: any, shapeLabel: any, depth: any, seen: any) {
    const _ShExValidator = this;

    // logging stuff
    if (depth === undefined)
      depth = 0;

    let ret: any = null;
    const startAcionStorage = {}; // !!! need test to see this write to results structure.
    if ("startActs" in schema && !this.semActHandler.dispatchAll(schema.startActs, null, startAcionStorage))
      return null; // some semAct aborted !! return real error

    // const outgoing = indexNeighborhood(db.findByIRI(point, null, null, null).sort(byObject));
    // const incoming = indexNeighborhood(db.findByIRI(null, null, point, null).sort(bySubject));
    const neighborhood: any[] = []; // outgoing.triples.concat(incoming.triples); // @@ make fancy array holder.

    const constraintList = this.indexTripleConstraints(shape.expression);
    // const tripleList = triple2constraintList.reduce(function (ret: any, constraint: any, ord: any) {

    //   // subject and object depend on direction of constraint.
    //   const searchSubject = constraint.inverse ? null : point;
    //   const searchObject = constraint.inverse ? point : null;
    //   const index = constraint.inverse ? incoming : outgoing;

    //   // get triples matching predciate
    //   const matchPredicate = index.byPredicate[constraint.predicate] ||
    //     []; // empty list when no triple matches that constraint

    //   function _errorsByShapeLabel (focus: any, shapeLabel: any) {
    //     const sub = _ShExValidator.validate(db, focus, shapeLabel, depth + 1, seen);
    //     return "errors" in sub ? sub.errors : [];
    //   }
    //   function _errorsByShapeExpr (focus: any, shapeExpr: any) {
    //     const sub = _ShExValidator._validateShapeExpr(db, focus, shapeExpr, shapeLabel, depth, seen);
    //     return "errors" in sub ? sub.errors : [];
    //   }
    //   // strip to triples matching value constraints (apart from @<someShape>)
    //   const matchConstraints = _ShExValidator._triplesMatchingShapeExpr(
    //     matchPredicate,
    //     constraint.valueExpr,
    //     constraint.inverse,
    //     /* _ShExValidator.options.partition === "exhaustive" ? undefined : */ _errorsByShapeLabel,
    //     /* _ShExValidator.options.partition === "exhaustive" ? undefined : */ _errorsByShapeExpr
    //   );

    //   matchConstraints.hits.forEach(function (t: any) {
    //     ret.triple2constraintList[neighborhood.indexOf(t)].push(ord);
    //   });
    //   matchConstraints.misses.forEach(function (t: any) {
    //     ret.misses[neighborhood.indexOf(t.triple)] = {constraintNo: ord, errors: t.errors};
    //   });
    //   return ret;
    // }, { misses: {}, triple2constraintList:_seq(neighborhood.length).map(function () { return []; }) }); // start with [[],[]...]

    // _log("constraints by triple: ", JSON.stringify(tripleList.triple2constraintList));

    // const misses = tripleList.triple2constraintList.reduce(function (ret: any, constraints: any, ord: any) {
    //   if (constraints.length === 0 &&                       // matches no constraints
    //       ord < outgoing.triples.length &&                  // not an incoming triple
    //       ord in tripleList.misses &&                       // predicate matched some constraint(s)
    //       (shape.extra === undefined ||                     // not declared extra
    //        shape.extra.indexOf(neighborhood[ord].predicate) === -1)) {
    //     ret.push({tripleNo: ord, constraintNo: tripleList.misses[ord].constraintNo, errors: tripleList.misses[ord].errors});
    //   }
    //   return ret;
    // }, []);

    // const xp = crossProduct(tripleList.triple2constraintList);
    const partitionErrors = [];
    // while (misses.length === 0 && xp.next() && ret === null) {
    //   // caution: early continues
    for (let __once = 0; __once < 1; ++__once) {
      // const usedTriples = []; // [{s1,p1,o1},{s2,p2,o2}] implicated triples -- used for messages
      // const constraintMatchCount = // [2,1,0,1] how many triples matched a constraint
      //   _seq(neighborhood.length).map(function () { return 0; });
      // const tripleToConstraintMapping = xp.get(); // [0,1,0,3] mapping from triple to constraint

      // // Triples not mapped to triple constraints are not allowed in closed shapes.
      // if (shape.closed) {
      //   const firstSkippedTriple = tripleToConstraintMapping.indexOf(undefined);
      //   if (firstSkippedTriple !== -1 && firstSkippedTriple < outgoing.triples.length) {
      //     partitionErrors.push({
      //       errors: [
      //         {
      //           type: "ClosedShapeViolation",
      //           unexpectedTriples: tripleToConstraintMapping.reduce((ret: any, c: any, idx: any) => {
      //             if (idx < outgoing.triples.length && c === undefined)
      //               ret.push(outgoing.triples[idx]);
      //             return ret;
      //           }, [])
      //         }
      //       ]
      //     });
      //     continue; // closed shape violation.
      //   }
      // }

      // // Set usedTriples and constraintMatchCount.
      // tripleToConstraintMapping.forEach(function (tpNumber: any, ord: any) {
      //   if (tpNumber !== undefined) {
      //     usedTriples.push(neighborhood[ord]);
      //     ++constraintMatchCount[tpNumber];
      //   }
      // });

      // // Pivot to triples by constraint.
      // function _constraintToTriples () {
      //   const cll = triple2constraintList.length;
      //   return tripleToConstraintMapping.slice().
      //     reduce(function (ret: any, c: any, ord: any) {
      //       if (c !== undefined)
      //         ret[c].push(ord);
      //       return ret;
      //     }, _seq(cll).map(function () { return []; }));
      // }

      // tripleToConstraintMapping.slice().sort(function (a: any, b: any) { return a-b; }).filter(function (i: any) { // sort constraint numbers
      //   return i !== undefined;
      // }).map(function (n: any) { return n + " "; }).join(""); // e.g. 0 0 1 3 

      function _recurse (point: any, shapeLabel: any) {
        return _ShExValidator.validate(db, point, shapeLabel, depth+1, seen);
      }
      function _direct (point: any, shapeExpr: any) {
        return _ShExValidator._validateShapeExpr(db, point, shapeExpr, shapeLabel, depth, seen);
      }
      function _testExpr (term: any, valueExpr: any, recurse: any, direct: any) {
        return _ShExValidator._errorsMatchingShapeExpr(term, valueExpr, recurse, direct)
      }
      const results = regexEngine.match(db, point, constraintList, _synthesize, /*_constraintToTriples(), tripleToConstraintMapping, */ neighborhood, _recurse, _direct, this.semActHandler, _testExpr, null);
      function _synthesize (constraintNo: any, _min: any, _max: any, neighborhood: any) {
        // console.log({"constraintNo": constraintNo, "min": min, "max": max, "triple2constraintList": triple2constraintList, "db": db, "point": point, "regexEngine": regexEngine, "shape": shape, "shapeLabel": shapeLabel, "depth": depth, "seen": seen});
        const tc = constraintList[constraintNo];
        const curSubjectx = {cs: point};
        const target = new config.rdfjs.Store();
        mapper.visitTripleConstraint(tc, curSubjectx, nextBNode, target, { _maybeSet: () => {} }, _ShExValidator.schema, db, _recurse, _direct, _testExpr);
        const oldLen = neighborhood.length;
        const created = [... target.match()];
        neighborhood.push.apply(neighborhood, created);
        return Array.apply(null, {length: created.length} as any).map((_: any, idx: any)=>{ return idx+oldLen});
      }

      // {// testing parity between two engines
      //   const nfa = require("@shexjs/eval-simple-1err").compile(schema, shape);
      //   const fromNFA = nfa.match(db, point, triple2constraintList, _constraintToTriples(), tripleToConstraintMapping, neighborhood, _recurse, this.semActHandler, _testExpr, null);
      //   if ("errors" in fromNFA !== "errors" in results)
      //     { throw Error(JSON.stringify(results) + " vs " + JSON.stringify(fromNFA)); }
      // }
      if ("errors" in results) {
        partitionErrors.push({
          errors: results.errors
        });
        if (_ShExValidator.options.partition !== "exhaustive")
          break;
        else
          continue;
      }

      // _log("post-regexp " + usedTriples.join(" "));

      const possibleRet: any = { type: "ShapeTest", node: rdfJsTerm2Ld(point), shape: shapeLabel };
      if (Object.keys(results).length > 0) // only include .solution for non-empty pattern
        possibleRet.solution = results;
      if ("semActs" in shape &&
          !this.semActHandler.dispatchAll(shape.semActs, results, possibleRet)) {
        // some semAct aborted
        partitionErrors.push({
          errors: [ { type: "SemActFailure", errors: [{ type: "UntrackedSemActFailure" }] } ]
        });
        if (_ShExValidator.options.partition !== "exhaustive")
          break;
        else
          continue;
      }
      // _log("final " + usedTriples.join(" "));

      ret = possibleRet;
      // alts.push(tripleToConstraintMapping);
    }
    if (ret === null/* !! && this.options.diagnose */) {
      const missErrors: any[] = [];// misses.map(function (miss: any) {
      //   const t = neighborhood[miss.tripleNo];
      //   return {
      //     type: "TypeMismatch",
      //     triple: {subject: t.subject, predicate: t.predicate, object: rdfJsTerm2Ld(t.object)},
      //     constraint: triple2constraintList[miss.constraintNo],
      //     errors: miss.errors
      //   };
      // });
      ret = {
        type: "Failure",
        node: rdfJsTerm2Ld(point),
        shape: shapeLabel,
        errors: missErrors.concat(partitionErrors.length === 1 ? partitionErrors[0].errors : partitionErrors) 
      };
    }

    if ("startActs" in schema && depth === 0) {
      ret.startActs = schema.startActs;
    }
    return ret;
  };

  this._errorsMatchingShapeExpr = function (this: any, value: any, valueExpr: any, recurse: any, direct: any) {
    const _ShExValidator = this;
    if (typeof(valueExpr) === "string") { // ShapeRef
      return recurse ? recurse(value, valueExpr) : [];
    } else if (valueExpr.type === "NodeConstraint") {
      return this._errorsMatchingNodeConstraint(value, valueExpr, null);
    } else if (valueExpr.type === "Shape") {
      return direct === undefined ? [] : direct(value, valueExpr);
    } else if (valueExpr.type === "ShapeOr") {
      // Every checker answers a result object, with `errors` when it failed (the
      // engine tests `"errors" in`); these used to treat them as error lists.
      const errors: any[] = [];
      for (let i = 0; i < valueExpr.shapeExprs.length; ++i) {
        const nested = _ShExValidator._errorsMatchingShapeExpr(value, valueExpr.shapeExprs[i], recurse, direct);
        if (!("errors" in nested))
          return {type: "ShapeOrResults", solution: nested};
        errors.push(nested);
      }
      return {type: "ShapeOrFailure", errors};
    } else if (valueExpr.type === "ShapeAnd") {
      const solutions: any[] = [], errors: any[] = [];
      for (const nested of valueExpr.shapeExprs) {
        const sub = _ShExValidator._errorsMatchingShapeExpr(value, nested, recurse, direct);
        ("errors" in sub ? errors : solutions).push(sub);
      }
      return errors.length ? {type: "ShapeAndFailure", errors} : {type: "ShapeAndResults", solutions};
    } else {
      throw Error("unknown value expression type '" + valueExpr.type + "'");
    }
  };

  /* _errorsMatchingNodeConstraint - return whether the value matches the value
   * expression without checking shape references.
   */
  this._errorsMatchingNodeConstraint = function (this: any, value: any, valueExpr: any, _recurse: any) {
    const errors: any[] = [];
    const label = value.value;
    const dt = value.termType === "Literal" ? value.datatype.value : null;
    const numeric = integerDatatypes.indexOf(dt) !== -1 ? XSD + "integer" : numericDatatypes.indexOf(dt) !== -1 ? dt : undefined;

    function validationError (...args: any[]) {
      const errorStr = args.join("");
      errors.push("Error validating " + ShExTerm.rdfJsTerm2Turtle(value) + " as " + JSON.stringify(valueExpr) + ": " + errorStr);
      return false;
    }
    {
      if ("nodeKind" in valueExpr) {
        if (["iri", "bnode", "literal", "nonliteral"].indexOf(valueExpr.nodeKind) === -1) {
          validationError("unknown node kind '" + valueExpr.nodeKind + "'");
        }
        if (value.termType === "BlankNode") {
          if (valueExpr.nodeKind === "iri" || valueExpr.nodeKind === "literal") {
            validationError("blank node found when " + valueExpr.nodeKind + " expected");
          }
        } else if (value.termType === "Literal") {
          if (valueExpr.nodeKind !== "literal") {
            validationError("literal found when " + valueExpr.nodeKind + " expected");
          }
        } else if (valueExpr.nodeKind === "bnode" || valueExpr.nodeKind === "literal") {
          validationError("iri found when " + valueExpr.nodeKind + " expected");
        }
      }

      if (valueExpr.datatype  && valueExpr.values) validationError("found both datatype and values in " + valueExpr);

      if (valueExpr.datatype) {
        if (value.termType !== "Literal") {
          validationError("mismatched datatype: " + JSON.stringify(rdfJsTerm2Ld(value)) + " is not a literal with datatype " + valueExpr.datatype);
        }
        else if (value.datatype.value !== valueExpr.datatype) {
          validationError("mismatched datatype: " + value.datatype.value + " !== " + valueExpr.datatype);
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
        if (value.termType === "Literal" && valueExpr.values.reduce((ret: any, v: any) => {
          if (ret) return true;
          const ld = rdfJsTerm2Ld(value);
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
          if (!(valueExpr.values.some(function (valueConstraint: any) {
            if (typeof valueConstraint === "object" && !("value" in valueConstraint)) { // i.e. not a simple term
              if (!("type" in valueConstraint))
                runtimeError("expected "+JSON.stringify(valueConstraint)+" to have a 'type' attribute.");
              const ExpectedTypePattern = /(Iri|Literal|Language)(Stem)?(Range)?/;
              const matchType = valueConstraint.type.match(ExpectedTypePattern);
              if (!matchType)
                runtimeError("expected type attribute '" + valueConstraint.type + "' to match " + ExpectedTypePattern + ".");
              const [, valType] = matchType;
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
              function normalizedTest (val: any, ref: any, func: any) {
                if (["Literal", "Language"].indexOf(valType) !== -1) { // val.termType === "Literal"
                  if (["LiteralStem", "LiteralStemRange"].indexOf(valueConstraint.type) !== -1) {
                    return func(val.value, ref);
                  } else if (["LanguageStem", "LanguageStemRange"].indexOf(valueConstraint.type) !== -1) {
                    return func(val.language || null, ref);
                  } else {
                    return validationError("literal " + JSON.stringify(val) + " not comparable with non-literal " + ref);
                  }
                } else { // an Iri stem or range: the value is a NamedNode (tested above)
                  return func(val.value, ref);
                }
              }
              function startsWith (val: any, ref: any) {
                return normalizedTest(val, ref, (l: any, r: any) => {
                  return (valueConstraint.type === "LanguageStem" ||
                          valueConstraint.type === "LanguageStemRange") ?
                    // rfc4647 basic filtering
                    l !== null && (l === r || r === "" || l[r.length] === "-") :
                    // simple substring
                    l.startsWith(r);
                });
              }
              function equals (val: any, ref: any) {
                return normalizedTest(val, ref, (l: any, r: any) => { return l === r; });
              }

              if (!isTerm(valueConstraint.stem)) {
                if (valueConstraint.stem.type !== "Wildcard")
                  runtimeError("expected stem " + JSON.stringify(valueConstraint.stem) + " to be a Wildcard.");
                // match whatever but check exclusions below
              } else {
                if (!(startsWith(value, valueConstraint.stem))) {
                  return false;
                }
              }
              if (valueConstraint.exclusions) {
                return !valueConstraint.exclusions.some(function (c: any) {
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

    Object.keys(stringTests).forEach(function (test: any) {
      if (test in valueExpr && !stringTests[test](label, valueExpr[test])) {
        validationError("facet violation: expected " + test + " of " + valueExpr[test] + " but got " + label);
      }
    });

    Object.keys(numericValueTests).forEach(function (test: any) {
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

    Object.keys(decimalLexicalTests).forEach(function (test: any) {
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
    const ret: any = {
      type: null,
      focus: rdfJsTerm2Ld(value),
      shapeExpr: valueExpr
    };
    if (errors.length) {
      ret.type = "NodeConstraintViolation";
      ret.errors = errors;
    } else {
      ret.type = "NodeConstraintTest";
    }
    return ret;
  };

  this.semActHandler = {
    handlers: { },
    results: { },
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
    register: function (this: any, name: any, handler: any) {
      this.handlers[name] = handler;
    },
    /**
     * Calls all semantic actions, allowing each to write to resultsArtifact.
     *
     * @param {array} semActs - list of semantic actions to invoke.
     * @return {bool} false if any result was false.
     */
    dispatchAll: function (this: any, semActs: any, ctx: any, resultsArtifact: any) {
      const _semActHanlder = this;
      return semActs.reduce(function (ret: any, semAct: any) {
        if (ret && semAct.name in _semActHanlder.handlers) {
          const code = "code" in semAct ? semAct.code : _ShExValidator.options.semActs[semAct.name];
          const existing = "extensions" in resultsArtifact && semAct.name in resultsArtifact.extensions;
          const extensionStorage = existing ? resultsArtifact.extensions[semAct.name] : {};
          ret = ret && _semActHanlder.handlers[semAct.name].dispatch(code, ctx, extensionStorage);
          if (!existing && Object.keys(extensionStorage).length > 0) {
            if (!("extensions" in resultsArtifact))
              resultsArtifact.extensions = {};
            resultsArtifact.extensions[semAct.name] = extensionStorage;
          }
          return ret;
        }
        return ret;
      }, true);
    }
  };
}

function isTerm (t: any) {
  return typeof t !== "object" || "value" in t && Object.keys(t).reduce(function (r: any, k: any) {
    return r === false ? r : ["value", "type", "language"].indexOf(k) !== -1;
  }, true);
}


function runtimeError (...args: any[]) {
  const errorStr = args.join("");
  const e = new Error("Runtime error: " + errorStr);
  if ("captureStackTrace" in Error) Error.captureStackTrace(e, runtimeError);
  throw e;
}

  return { // node environment
    construct: ShExMaterializer_constructor,
    options: InterfaceOptions
  };
}


// ## Exports

// Export the `ShExMaterializer` class as a whole.
export = ShExMapMaterializerCjsModule;
