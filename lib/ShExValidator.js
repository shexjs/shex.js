var VERBOSE = "VERBOSE" in process.env;
// **ShExValidator** provides ShEx utility functions

var ShExResults = require('./ShExResults');
var N3Util = require('n3').Util;

var XSD = 'http://www.w3.org/2001/XMLSchema#';
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
numericParsers[XSD + "integer"] = function (label) {
  if (!(label.matches(/^[0-9]+$/))) {
    validationError("illegal integer value '" + label + "'");
  }
  return parseInt(label);
};
numericParsers[XSD + "decimal"] = function (label) {
  if (!(label.matches(/^[0-9]*\.[0-9]+$/))) {
    validationError("illegal integer value '" + label + "'");
  }
  return parseFloat(label);
};
numericParsers[XSD + "float"  ] = function (label) {
  if (!(label.matches(/^[0-9]*\.[0-9]+$/))) {
    validationError("illegal integer value '" + label + "'");
  }
  return parseFloat(label);
};
numericParsers[XSD + "double" ] = function (label) {
  if (!(label.matches(/[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/))) {
    validationError("illegal integer value '" + label + "'");
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
  totaldigits   : function (n, d) { return n.length == m; }
};

var decimalLexicalTests = {
  totaldigits   : function (v, d) { return v.match(/[0-9]/g).length === d; },
  fractiondigits: function (v, d) { return v.match(/\.[0-9]+/)[0].length - 1 === d; }
};

var ε = {
  toString: function () { return "ε" } // !! needed for open?
};

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

// ## Constructor
function ShExValidator(schema, options) {
  if (!(this instanceof ShExValidator))
    return new ShExValidator(schema, options);
  options = options || {};
  var handlers = options.handlers || {};
  _ShExValidator = this;
  this.schema = schema;
  this._expect = options.lax ? noop : expect;
  this._optimize = {};
  this.reset = function () {  }; // included in case we need it later.

  /* _triplesMatchingPattern - return the triples matching the value
   * class without checking shape references.
   */
  function _triplesMatchingPattern (triples, tripleConstraint) {
    var misses = [];
    var hits = [];
    triples.forEach(function (t) {
      var errors = [];
      function validationError () {
        var errorStr = Array.prototype.join.call(arguments, '');
        errors.push("Error validating " + t + " as " + tripleConstraint + ": " + errorStr);
      }
      var value = tripleConstraint.inverse ? t.subject : t.object;

      // if (tripleConstraint.negated) ;
      var v = tripleConstraint.value;
      expect(v, 'type', 'valueClass');
      if (!v.reference && !v.nodeKind && !v.values && !v.datatype) {
        ; // wildcard -- ignore
      } else {
        if ("nodeKind" in v && !options.lax) {
          if (['iri', 'bnode', 'literal', 'nonliteral'].indexOf(v.nodeKind) === -1) {
            validationError("unknown node kind '" + v.nodeKind + "'")
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
        };

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
            ; // trivial match
          } else {
            if (!(v.values.some(function (t, ord) {
              if (typeof t === "object") {
                expect(t, 'type', 'stemRange');
                if (typeof t.stem === "object") {
                  expect(t.stem, 'type', 'wildcard');
                  ; // match whatever but check exclusions below
                } else {
                  if (!(t.object.startsWith(t.stem))) {
                    return false;
                  }
                }
                if (t.exclusions) {
                  return !t.exclusions.some(function (c) {
                    pieces.push(" - ");
                    if (typeof c === "object") {
                      expect(c, 'type', 'stem');
                      return t.object.startsWith(c.stem);
                    } else {
                      return t.object === c;
                    }
                  });
                }
              } else {
                ; // ignore -- would have caught it above
              }
            }))) {
              validationError("value " + t.object + " not found in set " + v.values);
            }
          }
        }
      }

      if ('pattern' in v) {
        if (!(t.object.match(new RegExp(v.pattern)))) {
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
            if (!numericValueTests[test](numericParsers[numeric](label), v[test])) {
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

  function _triplesMatchingDependentShape (db, triples, tripleConstraint, depth) {
    var ret = [];
    triples.forEach(function (t) {
      var errors = [];
      var value = tripleConstraint.inverse ? t.subject : t.object;

      // if (tripleConstraint.negated) ;
      var v = tripleConstraint.value;
      expect(v, 'type', 'valueClass');
      if (!v.reference && !v.nodeKind && !v.values && !v.datatype) {
        ; // wildcard -- ignore
      } else {
        if (v.reference) {
          if (typeof(v.reference) === "object") {
            throw new Error("not implented");// someOfShapes(v.reference.disjuncts, ret);
          } else {
            if (_ShExValidator.validate(db, t.object, v.reference, depth + 1) === null)
              errors.push("@@@ validate(db, "+t.object+", "+v.reference+") failed");
          }
        }
      }
      if (errors.length === 0)
        ret.push(t);
    });
    return ret;
  }

  /* Return a list of n ""s.
   *
   * Note that Array(n) on its own returns a "sparse array" so Array(n).map(f)
   * never calls f.
   */
  function _seq (n) {
    return n === 0 ?
      [] :
      Array(n).join(' ').split(/ /); // hahaha, javascript, you suck.
  }

  this.getAST = function () {
    function compileShapeToAST (expression, tripleConstraints) {

      function Epsilon () {
        this.type = 'Epsilon';
      }

      function TripleConstraint (ordinal, predicate, inverse, negated, value) {
        this.type = 'TripleConstraint';
        // this.ordinal = ordinal; @@ does 1card25
        this.inverse = !!inverse;
        this.negated = !!negated;
        this.predicate = predicate;
        this.value = value;
      }

      function Choice (disjuncts) {
        this.type = 'Choice';
        this.disjuncts = disjuncts;
      }

      function Group (conjuncts) {
        this.type = 'Group';
        this.conjuncts = conjuncts;
      }

      function SemActs (expression, semActs) {
        this.type = 'SemActs';
        this.expression = expression;
        this.semActs = semActs;
      }

      function KleeneStar (expression) {
        this.type = 'KleeneStar';
        this.expression = expression;
      }

      function _compileExpression (expr) {
        function _exprGroup (exprs) {
          exprs.forEach(function (nested) {
            _compileExpression(nested)
          });
        }

        /* _repeat: map expr with a min and max cardinality to a corresponding AST with Groups and Stars.
           expr 1 1 => expr
           expr 0 1 => Choice(expr, Eps)
           expr 0 3 => Choice(Group(expr, Choice(Group(expr, Choice(expr, EPS)), Eps)), Eps)
           expr 2 5 => Group(expr, expr, Choice(Group(expr, Choice(Group(expr, Choice(expr, EPS)), Eps)), Eps))
           expr 0 * => KleeneStar(expr)
           expr 1 * => Group(expr, KleeneStar(expr))
           expr 2 * => Group(expr, expr, KleeneStar(expr))

           @@TODO: favor Plus over Star if Epsilon not in expr.
        */
        function _repeat (expr, min, max) {
          if (min === undefined) { min = 1; }
          if (max === undefined) { max = 1; };

          if (min === 1 && max === 1) { return expr; }

          var opts = max === "*" ?
            new KleeneStar(expr) :
            _seq(max - min).reduce(function (ret, elt, ord) {
              return ord === 0 ?
                new Choice([expr, new Epsilon]) :
                new Choice([new Group([expr, ret]), new Epsilon]);
            }, undefined);

          var reqd = min !== 0 ?
            new Group(_seq(min).map(function (ret) {
              return expr;
            }).concat(opts)) : opts;
          return reqd;
        }

        if (expr.type === 'tripleConstraint') {
          // predicate, inverse, negated, value, annotations, semAct, min, max
          var value = "valueClassRef" in expr ?
            schema.valueClasses[expr.valueClassRef] :
            expr.value;
          var ordinal = tripleConstraints.push(expr)-1;
          var tp = new TripleConstraint(ordinal, expr.predicate, expr.inverse, expr.negated, value);
          var repeated = _repeat(tp, expr.min, expr.max);
          return expr.semAct ? new SemActs(repeated, expr.semAct) : repeated;
        }

        else if (expr.type === 'someOf') {
          var container = new Choice(expr.expressions.map(function (e) {
            return _compileExpression(e);
          }));
          var repeated = _repeat(container, expr.min, expr.max);
          return expr.semAct ? new SemActs(repeated, expr.semAct) : repeated;
        }

        else if (expr.type === 'group') {
          var container = new Group(expr.expressions.map(function (e) {
            return _compileExpression(e);
          }));
          var repeated = _repeat(container, expr.min, expr.max);
          return expr.semAct ? new SemActs(repeated, expr.semAct) : repeated;
        }

        else if (expr.type === 'wrapper') {
          var container = _compileExpression(expr.expression);
          var repeated = _repeat(container, expr.min, expr.max);
          return expr.semAct ? new SemActs(repeated, expr.semAct) : repeated;
        }

        else if (expr.type === 'include') {
          return _compileExpression(expr.include)
        }

        else throw Error("unexpected expr type: " + expr.type);
      }

      return expression ? _compileExpression(expression) : new Epsilon();
    }

    return {
      type: "AST",
      shapes: Object.keys(this._shapeCompilationByLabel).reduce(function (ret, label) {
        ret[label] = {
          type: "ASTshape",
          expression: compileShapeToAST(schema.shapes[label].expression, [])
        };
        return ret;
      }, {})
    };
  };

  this.compileShape = function (shape) {
    var optimize = {};
    var tripleConstraints = [];
    var predicateToTripleConstraints = [];

    this._expect(shape, 'type', 'shape');

    // if (shape.virtual) ;
    // if (shape.closed) ;
    // if (shape.inherit && shape.inherit.length > 0) ;
    // if (shape.extra && shape.extra.length > 0)

    function _compileRegexp (expr) {
      var regexp = "";

      function someOf (exprs) {
        var ret = "";
        exprs.forEach(function (nested, ord) {
          if (ord)
            ret += "|"
          ret += _compileRegexp(nested)
        });
        return ret;
      }
      function someOfShapes (shapes) {
        shapes.forEach(function (shape) {
          _ShExValidator.validate(store, t.object, reference, depth + 1);
        });
      }
      function group (exprs) {
        var ret = "";
        exprs.forEach(function (nested, ord) {
          ret += _compileRegexp(nested)
        });
        return ret;
      }

      function _writeCardinality (min, max) {
        if      (min === 0 && max === 1)            return "?";
        if (min === 0 && max === "*")         return "*";
        if (min === undefined && max === undefined) return "";
        if (min === 1 && max === "*")         return "+";
        return "{" + min + "," + (max === "*" ? "" : max) + "}";
      }
      if (expr.type === 'tripleConstraint') {
        var ordinal = tripleConstraints.push(expr)-1;
        if (!(expr.predicate in predicateToTripleConstraints))
          predicateToTripleConstraints[expr.predicate] = [];
        predicateToTripleConstraints[expr.predicate].push(expr);
        regexp += "((?:"+ordinal + " )" + _writeCardinality(expr.min, expr.max) + ")";
        // inverse, predicate, min, max, semAct
      }

      else if (expr.type === 'someOf') {
        regexp += "(?:" + someOf(expr.expressions) + ")";
        if ("min" in expr && expr.min !== 1 ||
            "max" in expr && expr.max !== 1) {
          optimize.hasRepeatedGroups = true;
        }
      }

      else if (expr.type === 'group') {
        regexp += "(" + group(expr.expressions) + ")"
          + _writeCardinality(expr.min, expr.max);
        if ("min" in expr && expr.min !== 1 ||
            "max" in expr && expr.max !== 1) {
          optimize.hasRepeatedGroups = true;
        }
      }

      else if (expr.type === 'wrapper') {
        regexp += _compileRegexp(expr.expressions);
        if ("min" in expr && expr.min !== 1 ||
            "max" in expr && expr.max !== 1) {
          optimize.hasRepeatedGroups = true;
        }
      }

      else if (expr.type === 'include') {
      }

      else runtimeError("unexpected expr type: " + expr.type);
      return regexp;
    }

    return {
      regexp: shape.expression ? _compileRegexp(shape.expression) : "()",
      tripleConstraints: tripleConstraints,
      optimize: optimize
      //ast: compileShapeToAST(shape.expression, []) // @@ make sure this ends up the same as _ShExValidator._shapeCompilationByLabel[label].tripleConstraints
    };
  };

  this._shapeCompilationByLabel = {};
  Object.keys(schema.shapes).forEach(function (label) {
    _ShExValidator._shapeCompilationByLabel[label] =
      _ShExValidator.compileShape(schema.shapes[label]);
  });

  if (VERBOSE) console.log(this._shapeCompilationByLabel);

  // triple sorters
  function bySubject (t1, t2) {
    // if (t1.predicate !== t2.predicate) // sort predicate first for easier scanning of results
    //   return t1.predicate > t2.predicate;
    var l = t1.subject, r = t2.subject;
    var lprec = N3Util.isBlank(l) ? 1 : N3Util.isLiteral(l) ? 2 : 3;
    var rprec = N3Util.isBlank(r) ? 1 : N3Util.isLiteral(r) ? 2 : 3;
    return lprec === rprec ? l > r : lprec > rprec;
  }
  function byObject (t1, t2) {
    // if (t1.predicate !== t2.predicate) // sort predicate first for easier scanning of results
    //   return t1.predicate > t2.predicate;
    var l = t1.object, r = t2.object;
    var lprec = N3Util.isBlank(l) ? 1 : N3Util.isLiteral(l) ? 2 : 3;
    var rprec = N3Util.isBlank(r) ? 1 : N3Util.isLiteral(r) ? 2 : 3;
    return lprec === rprec ? l > r : lprec > rprec;
  }

  // http://cwestblog.com/2011/05/02/cartesian-product-of-multiple-arrays/
  // cartesianProductOf - build cartesian product column by column
  /* Requires full instantiation. crossProduct below is lazy. */ function cartesianProductOf (list) {
    return Array.prototype.reduce.call(list, function (soFar, newColumn) {
      var ret = [];
      soFar.forEach(function (soFar) {
        newColumn.forEach(function (newColumn) {
          ret.push(soFar.concat([newColumn]));
        });
      });
      return ret;
    }, [[]]);
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
    }
  }

  this.validate = function (db, point, shapeLabel, depth) {
    shapeLabel = shapeLabel || schema.start;
    var compiledShape = this._shapeCompilationByLabel[shapeLabel];
    if (compiledShape === undefined)
      runtimeError("shape " + shapeLabel + " not defined");
    var constraintList = compiledShape.tripleConstraints;
    if (depth === undefined)
      depth = 0;
    var padding = (new Array(depth + 1)).join("  "); // "  ".repeat(depth);
   function _log () {
      if (!VERBOSE)
        return;
      console.log(padding + Array.prototype.join.call(arguments, ''));
    }
    _log("validating <" + point + "> as <" + shapeLabel + ">");
    if (!shapeLabel)
      runtimeError("start production not defined");

    function indexNeighborhood (triples) {

      /* byPredicate - mapping from predicate to triples containing that
       * predicate.
       */
      var byPredicate =
        triples.reduce(function (ret, t) {
          var p = t.predicate;
          if (!(p in ret))
            ret[p] = [];
          ret[p].push(t);

          // If in VERBOSE mode, add a nice toString to N3.js's triple objects.
          if (VERBOSE)
            t.toString = N3jsTripleToString;

          return ret;
        }, {});

      /* candidates: mapping from triple to the triple constraints it matches.
       * It is initialized to []. Mappings that remain an empty set indicate
       * a triple which didn't matching anything in the shape.
      */
      var candidates = _seq(triples.length).map(function () {
        return [];
      });
      return {
        triples: triples,
        byPredicate: byPredicate,
        candidates: candidates,
        misses: []
      };
    }

    var outgoing = indexNeighborhood(db.findByIRI(point, null, null, null).sort(byObject));
    var incoming = indexNeighborhood(db.findByIRI(null, null, point, null).sort(bySubject));
    var neighborhood = outgoing.triples.concat(incoming.triples); // make fancy array holder.

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

    _log("constraints by triple: ", JSON.stringify(tripleList.constraintList))

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
    var r = new RegExp("^"+compiledShape.regexp+"$"); // ((0 )*(1 )+|(2 )(3 ))
    var xp = crossProduct(tripleList.constraintList);
    while (misses.length === 0 && xp.next() && ret === null) {
      // caution: early continues
      var usedTriples = [];
      var constraintMatchCount = _seq(neighborhood.length).map(function () { return 0; }); /* Map[Triple, Int] */
      var tripleToConstraintMapping = xp.get();
      if (schema.shapes[shapeLabel].closed) {
        var firstSkippedTriple = tripleToConstraintMapping.indexOf(undefined);
        if (firstSkippedTriple !== -1 && firstSkippedTriple < outgoing.triples.length) {
          continue; // closed shape violation.
        }
      }
      tripleToConstraintMapping.forEach(function (tpNumber, i) {
        if (tpNumber !== undefined) {
          if (tpNumber !== ε) {
            usedTriples.push(neighborhood[i]);
          }
          ++constraintMatchCount[tpNumber];
        }
      });

      function _constraintToTriples () {
        var cll = constraintList.length;
        return tripleToConstraintMapping.slice().
          reduce(function (ret, c, ord) {
            if (c !== undefined)
              ret[c].push(ord);
            return ret;
          }, _seq(cll).map(function () { return []; }));
      }

      /* Walk an expression, representing each triple matching a constraint by
       * its constraint number.
       */
      function _compileFootprint (expr, constraintToTriples) { // consumes constraintToTriples
        var regexp = "";

        if (expr.type === 'tripleConstraint') {
          var constraintNo = constraintList.indexOf(expr);
          var take = expr.max === undefined ? 1 : expr.max;
          while (constraintToTriples[constraintNo].length && (take === "*" || take--)) {
            var tripleNo = constraintToTriples[constraintNo].shift();
            regexp += constraintNo + " ";
          }
          // inverse, predicate, min, max, semAct
        }

        else if (expr.type === 'someOf' || expr.type === 'group') {
          var added = "";
          do {
            expr.expressions.forEach(function (nested, ord) {
              regexp += added = _compileFootprint(nested, constraintToTriples)
            });
          } while (added !== "");
        }

        else if (expr.type === 'wrapper') {
          var added = "";
          do {
            expr.expressions.forEach(function (nested, ord) {
              regexp += added = _compileFootprint(nested, constraintToTriples)
            });
          } while (added !== "");
        }

        else if (expr.type === 'include') {
          throw new Error ("@@ not implemented");
        }

        else runtimeError("unexpected expr type: " + expr.type);
        return regexp;
      }
      var byConstraint =
        compiledShape.optimize.hasRepeatedGroups ?
        _compileFootprint(schema.shapes[shapeLabel].expression,
                          _constraintToTriples()) : // walk schema
      tripleToConstraintMapping.slice().sort().filter(function (i) { // sort constraint numbers
        return i !== undefined && i !== ε;
      }).map(function (n) { return n + " "; }).join(""); // e.g. 0 0 1 3 

      _log("trying " + tripleToConstraintMapping.slice().join(" ")+" |" + byConstraint + " (" + shapeLabel + ") with " + usedTriples.join(' '));
      if (!byConstraint.match(r))
        continue;
      _log("post-regexp " + usedTriples.join(' '));

      /* Walk an expression, representing each expression and its solutions.
       * return:
       *   { solutions: [] } -- indicates no possible mappings
       *   null -- indicates failed reference constraint
       */
      function _toVal (expr, constraintToTriples) { // consumes constraintToTriples
        if (expr.type === 'tripleConstraint') {
          var constraintNo = constraintList.indexOf(expr);
          var take = expr.max === undefined ? 1 : expr.max;
          var ret = {
            type: "tripleConstraintSolutions",
            predicate: expr.predicate, value: expr.value,
            solutions: []
          }
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
            }
            if ("reference" in expr.value) {debugger;
              var sub =_ShExValidator.validate(db, expr.inverse ? triple.subject : triple.object,
                                               expr.value.reference, depth + 1);
              if (sub === null)
                return null;
              testedTriple.referenced = sub;
            }
            ret.solutions.push(testedTriple);
          }
          if (ret && "min" in expr) { ret.min = expr.min; }
          if (ret && "max" in expr) { ret.max = expr.max; }
          if (ret && "annotations" in expr) { ret.annotations = expr.annotations; }
          if (ret && "semAct" in expr) { ret.semAct = expr.semAct; }
          return ret;
          // inverse, predicate, min, max, semAct
        }

        else if (expr.type === 'someOf' || expr.type === 'group') {
          var solutions = [];
          var done = false;
          do {
            var added = [];
            var nulls = 0;
            for (var ord = 0; ord < expr.expressions.length; ++ord) {
              var nested = expr.expressions[ord];
              var addMe = _toVal(nested, constraintToTriples);
              if (addMe === null) {
                if (expr.type === 'group')
                  return null;
                else
                  ++nulls;
              } else if (addMe.solutions.length !== 0)
                added.push(addMe);
            };
            if (nulls === expr.expressions.length)
              return null;
            if (added.length !== 0) {
              solutions.push({
                type: expr.type === 'someOf' ? "someOfSolution" : "groupSolution",
                expressions: added
              });
            } else {
              done = true;
            }
          } while (!done);
          var ret = {
            type: expr.type === 'someOf' ? "someOfSolutions" : "groupSolutions", // note the 's'
            solutions: solutions
          };
          if (ret && "min" in expr) { ret.min = expr.min; }
          if (ret && "max" in expr) { ret.max = expr.max; }
          if (ret && "annotations" in expr) { ret.annotations = expr.annotations; }
          if (ret && "semAct" in expr) { ret.semAct = expr.semAct; }
          return ret;
        }

        else if (expr.type === 'wrapper') {
          var added = "";
          do {
            expr.expressions.forEach(function (nested, ord) {
              regexp += added = _toVal(nested, constraintToTriples)
              if (added === null)
                return null;
            });
          } while (added !== "");
        }

        else if (expr.type === 'include') {
          throw new Error ("@@ not implemented");
        }

        else runtimeError("unexpected expr type: " + expr.type);
        return null;
      }

      var subVal = schema.shapes[shapeLabel].expression ?
        _toVal(schema.shapes[shapeLabel].expression, _constraintToTriples()) :
        {};
      if (subVal === null)
        continue;
      _log("final " + usedTriples.join(' '));
      ret = { type: "test", node: point, shape: shapeLabel, solution: subVal }; // expression: schema.shapes[shapeLabel].expression, triples: usedTriples
      // alts.push(tripleToConstraintMapping);
    }
    _log("</" + shapeLabel + ">");
    if (VERBOSE) { // remove N3jsTripleToString
      neighborhood.forEach(function (t) {
        delete t.toString;
      });
    }
    return ret;

    var alts = []; // cartesianProductOf(tripleList.constraintList)
    alts.filter(function (tripleToConstraintMapping) {
      // var l = tripleToConstraintMapping.map(function (i) { return i+1; }).join(" ");
      var byConstraint = tripleToConstraintMapping.slice().sort().join(" ")+" "; // 0 0 1 3
      // console.log(l + " " + (byConstraint.match(r) ? "O" : "X"));
      return byConstraint.match(r);
    }).forEach(function (tripleToConstraintMapping) {
      var l = tripleToConstraintMapping.map(function (i) { return i+1; }).join(" ")
      console.log(l);
    });
  };
}

function runtimeError () {
  var errorStr = Array.prototype.join.call(arguments, '');
  throw new Error("Runtime error: " + errorStr);
}

// Expect property p with value v in object o
function expect (o, p, v) {
  if (!(p in o))
    runtimeError("expected "+JSON.stringify(o)+" to have a '"+p+"' attribute.");
  if (arguments.length > 2 && o[p] !== v)
    runtimeError("expected "+p+" attribute '"+o[p]+"' to equal '"+v+"'.");
}

// ## Exports

// Export the `ShExValidator` class as a whole.
if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExValidator; // node environment
else
  ShExValidator = ShExValidator;
