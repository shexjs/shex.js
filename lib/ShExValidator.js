/* ShExValidator - javascript module to validate a graph with respect to Shape Expressions
 *
 * Status: 1/2 tested, no known bugs.
 *
 * TODO:
 *   constraint violation reporting.
 */

var VERBOSE = "VERBOSE" in process.env;
// **ShExValidator** provides ShEx utility functions

var N3Util = require("n3").Util;

function getLexicalValue (term) {
  return N3Util.isIRI(term) ? term :
    N3Util.isLiteral(term) ? N3Util.getLiteralValue(term) :
    term.substr(2); // bnodes start with "_:"
}


var XSD = "http://www.w3.org/2001/XMLSchema#";
var integerDatatypes = [
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

var numericDatatypes = [
  XSD + "decimal",
  XSD + "float",
  XSD + "double"
].concat(integerDatatypes);

var numericParsers = {};
numericParsers[XSD + "integer"] = function (label, parseError) {
  if (!(label.matches(/^[0-9]+$/))) {
    parseError("illegal integer value '" + label + "'");
  }
  return parseInt(label);
};
numericParsers[XSD + "decimal"] = function (label, parseError) {
  if (!(label.matches(/^[0-9]*\.[0-9]+$/))) {
    parseError("illegal integer value '" + label + "'");
  }
  return parseFloat(label);
};
numericParsers[XSD + "float"  ] = function (label, parseError) {
  if (!(label.matches(/^[0-9]*\.[0-9]+$/))) {
    parseError("illegal integer value '" + label + "'");
  }
  return parseFloat(label);
};
numericParsers[XSD + "double" ] = function (label, parseError) {
  if (!(label.matches(/[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/))) {
    parseError("illegal integer value '" + label + "'");
  }
  return Number(label);
};

var stringTests = {
  length   : function (v, l) { return v.length === l; },
  minlength: function (v, l) { return v.length  >= l; },
  maxlength: function (v, l) { return v.length  <= l; }
};

var numericValueTests = {
  mininclusive  : function (n, m) { return n.length >= m; },
  minexclusive  : function (n, m) { return n.length >  m; },
  maxinclusive  : function (n, m) { return n.length <= m; },
  maxexclusive  : function (n, m) { return n.length <  m; },
  totaldigits   : function (n, m) { return n.length == m; }
};

var decimalLexicalTests = {
  totaldigits   : function (v, d) { return v.match(/[0-9]/g).length === d; },
  fractiondigits: function (v, d) { return v.match(/\.[0-9]+/)[0].length - 1 === d; }
};

/* ShExValidator - construct an object for validating a schema.
 *
 * schema: a structure produced by a ShEx parser or equivalent.
 * options: object with controls for
 *   lax(true): boolean: whine about missing types in schema.
 *   diagnose(false): boolean: makde validate return a structure with errors.
 */
function ShExValidator(schema, options) {
  if (!(this instanceof ShExValidator))
    return new ShExValidator(schema, options);
  this.type = "ShExValidator";
  this.options = options || {};
  var handlers = this.options.handlers || {};
  var _ShExValidator = this;
  this.schema = schema;
  this._shapeCompilationByLabel = {}; // map from shape label to compilation structure.
  this._expect = this.options.lax ? noop : expect; // report errors on missing types.
  this._optimize = {}; // optimizations:
    // hasRepeatedGroups: whether there are patterns like (:p1 ., :p2 .)*
  this.reset = function () {  }; // included in case we need it later.

  /* getAST - compile a traditional regular expression abstract syntax tree.
   * Tested but not used at present.
   */
  this.getAST = function () {
    return {
      type: "AST",
      shapes: Object.keys(this._shapeCompilationByLabel).reduce(function (ret, label) {
        ret[label] = {
          type: "ASTshape",
          expression: _compileShapeToAST(_ShExValidator.schema.shapes[label].expression, [], _ShExValidator.schema)
        };
        return ret;
      }, {})
    };
  };

  /* compileShape - compile regular expression and index triple constraints
   */
  this.compileShape = function (shape) {
    var optimize = {};
    var tripleConstraints = []; // list of triple constraints from (:p1 ., (:p2 . | :p3 .))
    var predicateToTripleConstraints = []; // index tripleConstraints by predicate. {p1: 0, p2: 1, p3: 2}

    this._expect(shape, "type", "Shape");

    // @@TODO shape.virtual, shape.inherit

    return {
      regexp: shape.expression ? _compileRegexp(shape.expression, tripleConstraints,
                                                predicateToTripleConstraints, optimize) : "()",
      tripleConstraints: tripleConstraints,
      optimize: optimize
      //ast: _compileShapeToAST(shape.expression, [], this.schema) // @@ make sure this ends up the same as _ShExValidator._shapeCompilationByLabel[label].tripleConstraints
    };
  };

  /* Walk an expression, representing each expression and its solutions.
   * return:
   *   { solutions: [] } -- indicates no possible mappings
   *   null -- indicates failed reference constraint
   */
  this._toVal = function (expr, constraintToTriples, constraintList, neighborhood, db, validate, depth) { // consumes constraintToTriples
    var _validator = this;
    if (expr.type === "TripleConstraint") {
      var constraintNo = constraintList.indexOf(expr);
      var take = expr.max === undefined ? 1 : expr.max;
      var ret = {
        type: "tripleConstraintSolutions",
        predicate: expr.predicate, valueExpr: expr.valueExpr,
        solutions: []
      };
      if ("min" in expr) { ret.min = expr.min; }
      if ("max" in expr) { ret.max = expr.max; }
      while (constraintToTriples[constraintNo].length && (take === "*" || take--)) {
        var tripleNo = constraintToTriples[constraintNo].shift();
        var triple = neighborhood[tripleNo];
        var testedTriple = {
          type: "testedTriple",
          subject: triple.subject,
          predicate: triple.predicate,
          object: triple.object
        };
        if ("reference" in expr.valueExpr) {
          var sub = validate(db, expr.inverse ? triple.subject : triple.object,
                             expr.valueExpr.reference, depth + 1);
          if (sub === null)
            return null;
          testedTriple.referenced = sub;
        }
        _validator.semActHandler.dispatchAll(expr.semActs || [], testedTriple);
        ret.solutions.push(testedTriple);
      }
      if (ret && "min" in expr) { ret.min = expr.min; }
      if (ret && "max" in expr) { ret.max = expr.max; }
      if (ret && "annotations" in expr) { ret.annotations = expr.annotations; }
      if (ret && "semActs" in expr) { ret.semActs = expr.semActs; }
      return ret;
      // inverse, predicate, min, max, semActs
    }

    else if (expr.type === "SomeOf" || expr.type === "EachOf") {
      var solutions = [];
      var done = false;
      do {
        var added = [];
        var nulls = 0;
        for (var ord = 0; ord < expr.expressions.length; ++ord) {
          var nested = expr.expressions[ord];
          var addMe = this._toVal(nested, constraintToTriples, constraintList, neighborhood, db, validate, depth);
          if (addMe === null) {
            if (expr.type === "EachOf")
              return null;
            else
              ++nulls;
          } else if (addMe.solutions.length !== 0)
            added.push(addMe);
        }
        if (nulls === expr.expressions.length)
          return null;
        if (added.length !== 0) {
          solutions.push({
            type: expr.type === "SomeOf" ? "someOfSolution" : "groupSolution",
            expressions: added
          });
        } else {
          done = true;
        }
      } while (!done);
      ret = {
        type: expr.type === "SomeOf" ? "someOfSolutions" : "groupSolutions", // note the 's'
        solutions: solutions
      };
      if (ret && "min" in expr) { ret.min = expr.min; }
      if (ret && "max" in expr) { ret.max = expr.max; }
      if (ret && "annotations" in expr) { ret.annotations = expr.annotations; }
      if (ret && "semActs" in expr) { ret.semActs = expr.semActs; }
      return ret;
    }

    else if (expr.type === "Inclusion") {
      throw new Error ("@@ not implemented");
    }

    else runtimeError("unexpected expr type: " + expr.type);
    return null;
  }

  /* validate - test point in db against the schema for shapeLabel
   * depth: level of recurssion; for logging.
   */
  this.validate = function (db, point, shapeLabel, depth) {

    // default to schema's start shape
    shapeLabel = shapeLabel || schema.start;
    if (!shapeLabel)
      runtimeError("start production not defined");
    var compiledShape = this._shapeCompilationByLabel[shapeLabel];
    if (compiledShape === undefined)
      runtimeError("shape " + shapeLabel + " not defined");
    var constraintList = compiledShape.tripleConstraints;

    // logging stuff
    if (depth === undefined)
      depth = 0;
    var padding = (new Array(depth + 1)).join("  "); // AKA "  ".repeat(depth);
    function _log () {
      if (!VERBOSE) { return; }
      console.log(padding + Array.prototype.join.call(arguments, ""));
    }

    _log("validating <" + point + "> as <" + shapeLabel + ">");

    var outgoing = indexNeighborhood(db.findByIRI(point, null, null, null).sort(byObject));
    var incoming = indexNeighborhood(db.findByIRI(null, null, point, null).sort(bySubject));
    var neighborhood = outgoing.triples.concat(incoming.triples); // @@ make fancy array holder.

    var tripleList = constraintList.reduce(function (ret, constraint, ord) {

      // subject and object depend on direction of constraint.
      var searchSubject = constraint.inverse ? null : point;
      var searchObject = constraint.inverse ? point : null;
      var index = constraint.inverse ? incoming : outgoing;

      // get triples matching predciate
      var matchPredicate = index.byPredicate[constraint.predicate] ||
        []; // empty list when no triple matches that constraint

      // strip to triples matching value constraints (apart from @<someShape>)
      var matchConstraints = _triplesMatchingPattern(matchPredicate, constraint);

      matchConstraints.hits.forEach(function (t) {
        ret.constraintList[neighborhood.indexOf(t)].push(ord);
      });
      matchConstraints.misses.forEach(function (t) {
        ret.misses[neighborhood.indexOf(t)] = true;
      });
      return ret;
    }, { misses: {}, constraintList:_seq(neighborhood.length).map(function () { return []; }) }); // start with [[],[]...]

    _log("constraints by triple: ", JSON.stringify(tripleList.constraintList));

    var misses = tripleList.constraintList.reduce(function (ret, constraints, ord) {
      if (constraints.length === 0 &&                       // matches no constraints
          ord < outgoing.triples.length &&                  // not an incoming triple
          tripleList.misses[ord] &&                         // predicate matched some constraint(s)
          (schema.shapes[shapeLabel].extra === undefined || // not declared extra
           schema.shapes[shapeLabel].extra.indexOf(neighborhood[ord].predicate) === -1)) {
        ret.push(ord);
      }
      return ret;
    }, []);

    var ret = null;
    var expr = schema.shapes[shapeLabel].expression;
    var r = new RegExp("^"+compiledShape.regexp+"$"); // ((0 )*(1 )+|(2 )(3 ))
    var xp = crossProduct(tripleList.constraintList);
    while (misses.length === 0 && xp.next() && ret === null) {
      // caution: early continues

      var usedTriples = []; // [{s1,p1,o1},{s2,p2,o2}] implicated triples -- used for messages
      var constraintMatchCount = // [2,1,0,1] how many triples matched a constraint
        _seq(neighborhood.length).map(function () { return 0; });
      var tripleToConstraintMapping = xp.get(); // [0,1,0,3] mapping from triple to constraint

      // Triples not mapped to triple constraints are not allowed in closed shapes.
      if (schema.shapes[shapeLabel].closed) {
        var firstSkippedTriple = tripleToConstraintMapping.indexOf(undefined);
        if (firstSkippedTriple !== -1 && firstSkippedTriple < outgoing.triples.length) {
          continue; // closed shape violation.
        }
      }

      // Set usedTriples and constraintMatchCount.
      tripleToConstraintMapping.forEach(function (tpNumber, ord) {
        if (tpNumber !== undefined) {
          usedTriples.push(neighborhood[ord]);
          ++constraintMatchCount[tpNumber];
        }
      });

      // Pivot to triples by constraint.
      function _constraintToTriples () {
        var cll = constraintList.length;
        return tripleToConstraintMapping.slice().
          reduce(function (ret, c, ord) {
            if (c !== undefined)
              ret[c].push(ord);
            return ret;
          }, _seq(cll).map(function () { return []; }));
      }

      // Create string to match regexp.
      var byConstraint =
        compiledShape.optimize.hasRepeatedGroups ?
        _compileFootprint(expr,
                          _constraintToTriples(), constraintList) : // walk schema
      tripleToConstraintMapping.slice().sort().filter(function (i) { // sort constraint numbers
        return i !== undefined;
      }).map(function (n) { return n + " "; }).join(""); // e.g. 0 0 1 3 

      // Test if byConstraint matches the compiled regexp.
      _log("trying " + tripleToConstraintMapping.slice().join(" ")+" |" + byConstraint + " (" + shapeLabel + ") with " + usedTriples.join(" "));
      if (!byConstraint.match(r))
        continue;
      _log("post-regexp " + usedTriples.join(" "));

      // Find which triples matched which constraints, testing dependent shapes.
      function recurse (db, point, shapeLabel, depth) {
        return _ShExValidator.validate(db, point, shapeLabel, depth);
      }
      var subVal = expr ?
        _ShExValidator._toVal(expr, _constraintToTriples(), constraintList, neighborhood, db, recurse, depth) :
        {};
      if (subVal === null)
        continue;
      _log("final " + usedTriples.join(" "));

      ret = { type: "test", node: point, shape: shapeLabel, solution: subVal }; // expression: expr, triples: usedTriples
      // alts.push(tripleToConstraintMapping);
    }
    if (false && ret === null && this.options.diagnose) {
      ret = {
        type: "test",
        node: point,
        shape: shapeLabel,
        errors: _diagnose(db, point, expr)
      };
    }

    _log("</" + shapeLabel + ">");
    if (VERBOSE) { // remove N3jsTripleToString
      neighborhood.forEach(function (t) {
        delete t.toString;
      });
    }
    return ret;
  };

  this.semActHandler = {
    handlers: { },
    results: { },
    register: function (name, handler) {
      this.handlers[name] = handler;
    },
    dispatchAll: function (semActs, ctx) {
      var _semActHanlder = this;
      var r = semActs.reduce(function (ret, semAct) {
        if (ret && semAct.name in _semActHanlder.handlers) {
          return ret && _semActHanlder.handlers[semAct.name].dispatch(semAct.code, ctx);
        }
        return ret;
      }, true);
    }
  };

  // Compile each shape in the schema (could also be lazy about it).
  Object.keys(schema.shapes).forEach(function (label) {
    _ShExValidator._shapeCompilationByLabel[label] =
      _ShExValidator.compileShape(schema.shapes[label]);
  });

  if (VERBOSE) { console.log(this._shapeCompilationByLabel); }
}

/* _diagnose - aggregate errors for validating.
 */
function _diagnose (db, point, expr) { // , tripleConstraints, predicateToTripleConstraints
  var ret = [];

  function _writeCardinality (min, max) {
    if      (min === 0 && max === 1)            return "?";
    if (min === 0 && max === "*")         return "*";
    if (min === undefined && max === undefined) return "";
    if (min === 1 && max === "*")         return "+";
    return "{" + min + "," + (max === "*" ? "" : max) + "}";
  }

  if (expr.type === 'tripleConstraint') {
    ret.push({ type: "MissingProperty", property: expr.predicate, valueExpr: expr.valueExpr });
  }

  else if (expr.type === 'someOf') {
    var ret = "";
    expr.expressions.forEach(function (nested, ord) {
      if (ord)
        ret += "|"
      ret += _compileRegexp(nested, tripleConstraints, predicateToTripleConstraints, optimize)
    });
    regexp += "(?:" + ret + ")" + _writeCardinality(expr.min, expr.max);
  }

  else if (expr.type === 'eachOf') {
    var ret = "";
    expr.expressions.forEach(function (nested, ord) {
      ret += _compileRegexp(nested, tripleConstraints, predicateToTripleConstraints, optimize)
    });
    regexp += "(" + ret + ")" + _writeCardinality(expr.min, expr.max);
  }

  else if (expr.type === 'inclusion') {
  }

  else {
    runtimeError("unexpected expr type: " + expr.type);
  }

  if (['someOf', 'eachOf'].indexOf(expr.type) !== -1 &&
      ("min" in expr && expr.min !== 1 ||
       "max" in expr && expr.max !== 1)) {
    optimize.hasRepeatedGroups = true;
  }

  return ret;
}

/* _triplesMatchingPattern - return the triples matching the value
 * class without checking shape references.
 */
function _triplesMatchingPattern (triples, tripleConstraint) {
  var misses = [];
  var hits = [];
  triples.forEach(function (t) {
    var errors = [];
    function validationError () {
      var errorStr = Array.prototype.join.call(arguments, "");
      errors.push("Error validating " + t + " as " + tripleConstraint + ": " + errorStr);
    }
    var value = tripleConstraint.inverse ? t.subject : t.object;

    // if (tripleConstraint.negated) ;
    var v = tripleConstraint.valueExpr;
    expect(v, "type", "ValueClass");
    if (!v.reference && !v.nodeKind && !v.values && !v.datatype) {
      // wildcard -- ignore
    } else {
      if ("nodeKind" in v) {
        if (["iri", "bnode", "literal", "nonliteral"].indexOf(v.nodeKind) === -1) {
          validationError("unknown node kind '" + v.nodeKind + "'");
        }
        if (value.substr(0, 2) === "_:") {
          if (v.nodeKind === "iri" || v.nodeKind === "literal") {
            validationError("blank node found when " + v.nodeKind + " expected");
          }
        } else if (value.substr(0, 1) === "\"") {
          if (v.nodeKind !== "literal") {
            validationError("literal found when " + v.nodeKind + " expected");
          }
        } else if (v.nodeKind === "bnode" || v.nodeKind === "literal") {
          validationError("iri found when " + v.nodeKind + " expected");
        }
      }

      if (v.reference && v.values  ) validationError("found both reference and values in "  +tripleConstraint);
      if (v.reference && v.datatype) validationError("found both reference and datatype in "+tripleConstraint);
      if (v.datatype  && v.values  ) validationError("found both datatype and values in "   +tripleConstraint);

      if (v.reference) {
        // ignore; we test this later
      }

      if (v.datatype) {
        if (!N3Util.isLiteral(t.object)) {
          validationError("mismatched datatype: " + t.object + " is not a literal with datatype " + v.datatype);
        }
        else if (N3Util.getLiteralType(t.object) !== v.datatype) {
          validationError("mismatched datatype: " + N3Util.getLiteralType(t.object) + " !== " + v.datatype);
        }
      }

      if (v.values) {
        if (v.values.indexOf(t.object) !== -1) {
          // trivial match
        } else {
          if (!(v.values.some(function (t) {
            if (typeof t === "object") {
              expect(t, "type", "StemRange");
              if (typeof t.stem === "object") {
                expect(t.stem, "type", "Wildcard");
                // match whatever but check exclusions below
              } else {
                if (!(t.object.startsWith(t.stem))) {
                  return false;
                }
              }
              if (t.exclusions) {
                return !t.exclusions.some(function (c) {
                  if (typeof c === "object") {
                    expect(c, "type", "Stem");
                    return t.object.startsWith(c.stem);
                  } else {
                    return t.object === c;
                  }
                });
              }
            } else {
              // ignore -- would have caught it above
            }
          }))) {
            validationError("value " + t.object + " not found in set " + v.values);
          }
        }
      }
    }

    if ("pattern" in v) {
      if (!(getLexicalValue(t.object).match(new RegExp(v.pattern)))) {
        validationError("value " + t.object + " did not match pattern " + v.pattern);
      }
    }

    var label = N3Util.isLiteral(t.object) ? N3Util.getLiteralValue(t.object) :
      N3Util.isBlank(t.object) ? t.object.substring(2) :
      t.object;
    var dt = N3Util.isLiteral(t.object) ? N3Util.getLiteralType(t.object) : null;
    var numeric = dt in integerDatatypes ? XSD + "integer" : dt;

    Object.keys(stringTests).forEach(function (test) {
      if (test in v && !stringTests[test](label, v[test])) {
        validationError("facet violation: expected " + t + " of " + v[test] + " but got " + t.object);
      }
    });

    Object.keys(numericValueTests).forEach(function (test) {
      if (test in v) {
        if (numeric) {
          if (!numericValueTests[test](numericParsers[numeric](label, validationError), v[test])) {
            validationError("facet violation: expected " + t + " of " + v[test] + " but got " + t.object);
          }
        } else {
          validationError("facet violation: numeric facet " + t + " can't apply to " + t.object);
        }
      }
    });

    Object.keys(decimalLexicalTests).forEach(function (test) {
      if (test in v) {
        if (numeric === XSD + "integer" || numeric === XSD + "decimal") {
          if (!decimalLexicalTests[test](label, v[test])) {
            validationError("facet violation: expected " + test + " of " + v[test] + " but got " + t.object);
          }
        } else {
          validationError("facet violation: numeric facet " + t + " can't apply to " + t.object);
        }
      }
    });
    if (errors.length === 0) {
      hits.push(t);
    } else if (hits.indexOf(t) === -1) {
      misses.push(t);
    }
  });
  return { hits: hits, misses: misses };
}

/* _compileShapeToAST - compile a shape expression to an abstract syntax tree.
 *
 * currently tested but not used.
 */
function _compileShapeToAST (expression, tripleConstraints, schema) {

  function Epsilon () {
    this.type = "Epsilon";
  }

  function TripleConstraint (ordinal, predicate, inverse, negated, valueExpr) {
    this.type = "TripleConstraint";
    // this.ordinal = ordinal; @@ does 1card25
    this.inverse = !!inverse;
    this.negated = !!negated;
    this.predicate = predicate;
    this.valueExpr = valueExpr;
  }

  function Choice (disjuncts) {
    this.type = "Choice";
    this.disjuncts = disjuncts;
  }

  function EachOf (conjuncts) {
    this.type = "EachOf";
    this.conjuncts = conjuncts;
  }

  function SemActs (expression, semActs) {
    this.type = "SemActs";
    this.expression = expression;
    this.semActs = semActs;
  }

  function KleeneStar (expression) {
    this.type = "KleeneStar";
    this.expression = expression;
  }

  function _compileExpression (expr, schema) {
    var repeated, container;

    /* _repeat: map expr with a min and max cardinality to a corresponding AST with Groups and Stars.
       expr 1 1 => expr
       expr 0 1 => Choice(expr, Eps)
       expr 0 3 => Choice(EachOf(expr, Choice(EachOf(expr, Choice(expr, EPS)), Eps)), Eps)
       expr 2 5 => EachOf(expr, expr, Choice(EachOf(expr, Choice(EachOf(expr, Choice(expr, EPS)), Eps)), Eps))
       expr 0 * => KleeneStar(expr)
       expr 1 * => EachOf(expr, KleeneStar(expr))
       expr 2 * => EachOf(expr, expr, KleeneStar(expr))

       @@TODO: favor Plus over Star if Epsilon not in expr.
    */
    function _repeat (expr, min, max) {
      if (min === undefined) { min = 1; }
      if (max === undefined) { max = 1; }

      if (min === 1 && max === 1) { return expr; }

      var opts = max === "*" ?
        new KleeneStar(expr) :
        _seq(max - min).reduce(function (ret, elt, ord) {
          return ord === 0 ?
            new Choice([expr, new Epsilon]) :
            new Choice([new EachOf([expr, ret]), new Epsilon]);
        }, undefined);

      var reqd = min !== 0 ?
        new EachOf(_seq(min).map(function (ret) {
          return expr; // @@ something with ret
        }).concat(opts)) : opts;
      return reqd;
    }

    if (expr.type === "TripleConstraint") {
      // predicate, inverse, negated, valueExpr, annotations, semActs, min, max
      var valueExpr = "valueExprRef" in expr ?
        schema.valueExprDefns[expr.valueExprRef] :
        expr.valueExpr;
      var ordinal = tripleConstraints.push(expr)-1;
      var tp = new TripleConstraint(ordinal, expr.predicate, expr.inverse, expr.negated, valueExpr);
      repeated = _repeat(tp, expr.min, expr.max);
      return expr.semActs ? new SemActs(repeated, expr.semActs) : repeated;
    }

    else if (expr.type === "SomeOf") {
      container = new Choice(expr.expressions.map(function (e) {
        return _compileExpression(e, schema);
      }));
      repeated = _repeat(container, expr.min, expr.max);
      return expr.semActs ? new SemActs(repeated, expr.semActs) : repeated;
    }

    else if (expr.type === "EachOf") {
      container = new EachOf(expr.expressions.map(function (e) {
        return _compileExpression(e, schema);
      }));
      repeated = _repeat(container, expr.min, expr.max);
      return expr.semActs ? new SemActs(repeated, expr.semActs) : repeated;
    }

    else if (expr.type === "Inclusion") {
      return _compileExpression(expr.include, schema);
    }

    else throw Error("unexpected expr type: " + expr.type);
  }

  return expression ? _compileExpression(expression, schema) : new Epsilon();
}

/* _compileRegexp - compile shape expression to regular expression; builds list
 *   of triple constraints (tripleConstraints) and indexes them by predicate
 *   (predicateToTripleConstraints).
 */
function _compileRegexp (expr, tripleConstraints, predicateToTripleConstraints, optimize) {
  var regexp = "", ret;

  function _writeCardinality (min, max) {
    if      (min === 0 && max === 1)            return "?";
    if (min === 0 && max === "*")         return "*";
    if (min === undefined && max === undefined) return "";
    if (min === 1 && max === "*")         return "+";
    return "{" + min + "," + (max === "*" ? "" : max) + "}";
  }

  if (expr.type === "TripleConstraint") {
    var ordinal = tripleConstraints.push(expr)-1;
    if (!(expr.predicate in predicateToTripleConstraints))
      predicateToTripleConstraints[expr.predicate] = [];
    predicateToTripleConstraints[expr.predicate].push(expr);
    regexp += "((?:"+ordinal + " )" + _writeCardinality(expr.min, expr.max) + ")";
    // @@ inverse, predicate, min, max, semActs, AND
  }

  else if (expr.type === "SomeOf") {
    ret = "";
    expr.expressions.forEach(function (nested, ord) {
      if (ord)
        ret += "|";
      ret += _compileRegexp(nested, tripleConstraints, predicateToTripleConstraints, optimize);
    });
    regexp += "(?:" + ret + ")" + _writeCardinality(expr.min, expr.max);
  }

  else if (expr.type === "EachOf") {
    ret = "";
    expr.expressions.forEach(function (nested) {
      ret += _compileRegexp(nested, tripleConstraints, predicateToTripleConstraints, optimize);
    });
    regexp += "(" + ret + ")" + _writeCardinality(expr.min, expr.max);
  }

  else if (expr.type === "Inclusion") {
  }

  else {
    runtimeError("unexpected expr type: " + expr.type);
  }

  if (["SomeOf", "EachOf"].indexOf(expr.type) !== -1 &&
      ("min" in expr && expr.min !== 1 ||
       "max" in expr && expr.max !== 1)) {
    optimize.hasRepeatedGroups = true;
  }

  return regexp;
}

/* Walk an expression, representing each triple matching a constraint by
 * its constraint number.
 */
function _compileFootprint (expr, constraintToTriples, constraintList) { // consumes constraintToTriples
  var regexp = "", added;

  if (expr.type === "TripleConstraint") {
    var constraintNo = constraintList.indexOf(expr);
    var take = expr.max === undefined ? 1 : expr.max;
    while (constraintToTriples[constraintNo].length && (take === "*" || take--)) {
      constraintToTriples[constraintNo].shift();
      regexp += constraintNo + " ";
    }
    // inverse, predicate, min, max, semActs
  }

  else if (expr.type === "SomeOf" || expr.type === "EachOf") {
    added = "";
    do {
      expr.expressions.forEach(function (nested) {
        regexp += added = _compileFootprint(nested, constraintToTriples, constraintList);
      });
    } while (added !== "");
  }

  else if (expr.type === "Inclusion") {
    throw new Error ("@@ not implemented");
  }

  else runtimeError("unexpected expr type: " + expr.type);
  return regexp;
}

// http://stackoverflow.com/questions/9422386/lazy-cartesian-product-of-arrays-arbitrary-nested-loops
function crossProduct(sets) {
  var n = sets.length, carets = [], args = null;

  function init() {
    args = [];
    for (var i = 0; i < n; i++) {
      carets[i] = 0;
      args[i] = sets[i][0];
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
    var i = n - 1;
    carets[i]++;
    if (carets[i] < sets[i].length) {
      args[i] = sets[i][carets[i]];
      return true;
    }
    while (carets[i] >= sets[i].length) {
      if (i == 0) {
        return false;
      }
      carets[i] = 0;
      args[i] = sets[i][0];
      carets[--i]++;
    }
    args[i] = sets[i][carets[i]];
    return true;
  }

  return {
    next: next,
    do: function (block, _context) { // old API
      return block.apply(_context, args);
    },
    // new API because
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments#Description
    // cautions about functions over arguments.
    get: function () { return args; }
  };
}

/* N3jsTripleToString - simple toString function to make N3.js's triples
 * printable.
 */
var N3jsTripleToString = function () {
  function fmt (n) {
    return N3Util.isLiteral(n) ?
      [ "http://www.w3.org/2001/XMLSchema#integer",
        "http://www.w3.org/2001/XMLSchema#float",
        "http://www.w3.org/2001/XMLSchema#double"
      ].indexOf(N3Util.getLiteralType(n)) !== -1 ?
      parseInt(N3Util.getLiteralValue(n)) :
      n :
    N3Util.isBlank(n) ?
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
function indexNeighborhood (triples) {
  return {
    triples: triples,
    byPredicate: triples.reduce(function (ret, t) {
      var p = t.predicate;
      if (!(p in ret))
        ret[p] = [];
      ret[p].push(t);

      // If in VERBOSE mode, add a nice toString to N3.js's triple objects.
      if (VERBOSE)
        t.toString = N3jsTripleToString;

      return ret;
    }, {}),
    candidates: _seq(triples.length).map(function () {
      return [];
    }),
    misses: []
  };
}

/* bySubject - sort triples by subject following SPARQL partial ordering.
 */
function bySubject (t1, t2) {
  // if (t1.predicate !== t2.predicate) // sort predicate first for easier scanning of results
  //   return t1.predicate > t2.predicate;
  var l = t1.subject, r = t2.subject;
  var lprec = N3Util.isBlank(l) ? 1 : N3Util.isLiteral(l) ? 2 : 3;
  var rprec = N3Util.isBlank(r) ? 1 : N3Util.isLiteral(r) ? 2 : 3;
  return lprec === rprec ? l > r : lprec > rprec;
}

/* byObject - sort triples by object following SPARQL partial ordering.
 */
function byObject (t1, t2) {
  // if (t1.predicate !== t2.predicate) // sort predicate first for easier scanning of results
  //   return t1.predicate > t2.predicate;
  var l = t1.object, r = t2.object;
  var lprec = N3Util.isBlank(l) ? 1 : N3Util.isLiteral(l) ? 2 : 3;
  var rprec = N3Util.isBlank(r) ? 1 : N3Util.isLiteral(r) ? 2 : 3;
  return lprec === rprec ? l > r : lprec > rprec;
}

/* Return a list of n ""s.
 *
 * Note that Array(n) on its own returns a "sparse array" so Array(n).map(f)
 * never calls f.
 */
function _seq (n) {
  return n === 0 ?
    [] :
    Array(n).join(" ").split(/ /); // hahaha, javascript, you suck.
}

/* Expect property p with value v in object o
 */
function expect (o, p, v) {
  if (!(p in o))
    runtimeError("expected "+JSON.stringify(o)+" to have a '"+p+"' attribute.");
  if (arguments.length > 2 && o[p] !== v)
    runtimeError("expected "+p+" attribute '"+o[p]+"' to equal '"+v+"'.");
}

function noop () {  }

function runtimeError () {
  var errorStr = Array.prototype.join.call(arguments, "");
  throw new Error("Runtime error: " + errorStr);
}

// ## Exports

// Export the `ShExValidator` class as a whole.
if (typeof require !== "undefined" && typeof exports !== "undefined")
  module.exports = ShExValidator; // node environment
else
  ShExValidator = ShExValidator;
