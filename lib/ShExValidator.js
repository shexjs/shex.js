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
  toString: function () { return "ε" }
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
  this.reset = function () {  }; // included in case we need it later.

  function _triplesMatchingPattern (triples, triplePattern) {
    var ret = [];
    triples.forEach(function (t) {
      var errors = [];
      function validationError () {
        var errorStr = Array.prototype.join.call(arguments, '');
        errors.push("Error validating " + t + " as " + triplePattern + ": " + errorStr);
      }
      var value = triplePattern.inverse ? t.subject : t.object;

      // if (triplePattern.negated) ;
      var v = triplePattern.value;
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

        if (v.reference && v.values  ) validationError("found both reference and values in "  +triplePattern);
        if (v.reference && v.datatype) validationError("found both reference and datatype in "+triplePattern);
        if (v.datatype  && v.values  ) validationError("found both datatype and values in "   +triplePattern);

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
      if (errors.length === 0)
        ret.push(t);
    });
    return ret;
  }

  function _triplesMatchingDependentShape (db, triples, triplePattern, depth) {
    var ret = [];
    triples.forEach(function (t) {
      var errors = [];
      function runtimeError (msg) {
        errors.push(msg);
      }
      var value = triplePattern.inverse ? t.subject : t.object;

      // if (triplePattern.negated) ;
      var v = triplePattern.value;
      expect(v, 'type', 'valueClass');
      if (!v.reference && !v.nodeKind && !v.values && !v.datatype) {
        ; // wildcard -- ignore
      } else {
        if (v.reference) {
          if (typeof(v.reference) === "object") {
            someOfShapes(v.reference.disjuncts, ret);
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

  this.compileShape = function (shape, triplePatterns, predicateToTriplePatterns) {

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
        var ordinal = triplePatterns.push(expr)-1;
        if (!(expr.predicate in predicateToTriplePatterns))
          predicateToTriplePatterns[expr.predicate] = [];
        predicateToTriplePatterns[expr.predicate].push(expr);
        regexp += "((?:"+ordinal + " )" + _writeCardinality(expr.min, expr.max) + ")";
        // inverse, predicate, min, max, semAct
      }

      else if (expr.type === 'someOf') { regexp += "(?:" + someOf(expr.expressions) + ")"; }

      else if (expr.type === 'group') {
        regexp += "(" + group(expr.expressions) + ")"
          + _writeCardinality(expr.min, expr.max);
      }

      else if (expr.type === 'include') {
      }

      else runtimeError("unexpected expr type: " + expr.type);
      return regexp;
    }

    return shape.expression ? _compileRegexp(shape.expression) : "()";
  };

  this._triplePatternsByLabel = {};
  this._predicateToTriplePatternsByLabel = {};
  this._regexpByLabel = {};
  Object.keys(schema.shapes).forEach(function (label) {
    _ShExValidator._regexpByLabel[label] =
      _ShExValidator.compileShape(schema.shapes[label],
                                  (_ShExValidator._triplePatternsByLabel           [label] = []),
                                  (_ShExValidator._predicateToTriplePatternsByLabel[label] = {}));
  });

  if (VERBOSE) console.log(this._triplePatternsByLabel)
  if (VERBOSE) console.log(this._predicateToTriplePatternsByLabel);
  if (VERBOSE) console.log(this._regexpByLabel);

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

  function index (l, i) {
    l.forEach(function (t) {
      if (VERBOSE)
        t.toString = function () { // for printf debugging
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
        return fmt(t.subject) + " " + fmt(t.predicate) + " " + fmt(t.object) + " .";
      };
      var p = t.predicate;
      if (!(p in i))
        i[p] = [];
      i[p].push(t);
    });
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
    var n = sets.length, carets = [], args = [];

    function init() {
      for (var i = 0; i < n; i++) {
        carets[i] = 0;
        args[i] = sets[i][0];
      }
    }

    function next() {
      if (!args.length) {
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
      do: function (block, _context) {
        return block.apply(_context, args);
      }
    }
  }

  this.validate = function (db, point, shapeLabel, depth) {
    shapeLabel = shapeLabel || schema.start;
    if (depth === undefined)
      depth = 0;
    var padding = (new Array(depth + 1)).join("  "); // "  ".repeat(depth);
   function _log () {
      if (!VERBOSE)
        return;
      console.log(padding + Array.prototype.join.call(arguments, ''));
    }
    _log("<" + shapeLabel + ">");
    if (!shapeLabel)
      runtimeError("start production not defined");

    var outgoing = db.findByIRI(point, null, null, null).sort(byObject);
    var outgoingByPredicate = {}; index(outgoing, outgoingByPredicate);
    var outgoingCandidates = outgoing.map(function () { return []; });
    var incoming = db.findByIRI(null, null, point, null).sort(bySubject);
    var incomingByPredicate = {}; index(incoming, incomingByPredicate);
    var incomingCandidates = incoming.map(function () { return []; });
    var r = new RegExp("^"+_ShExValidator._regexpByLabel[shapeLabel]+"$"); // ((0 )*(1 )+|(2 )(3 ))

    this._triplePatternsByLabel[shapeLabel].forEach(function (tp, tpIndex) {
      var searchSubject = tp.inverse ? null : point;
      var searchObject = tp.inverse ? point : null;
      var matchPredicate = outgoingByPredicate[tp.predicate] || [];
      var matchConstraints = _triplesMatchingPattern(matchPredicate, tp);
      matchConstraints.forEach(function (t) {
        outgoingCandidates[outgoing.indexOf(t)].push(tpIndex);
      });
      // var x = _triplesMatchingDependentShape(db, matchConstraints, tp, depth);
    });
    // console.log(outgoingCandidates);
    outgoingCandidates.forEach(function (candidate) { // limit to OPEN predicates
      candidate.push(ε);
    });

    var xp = crossProduct(outgoingCandidates);
    var ret = null;
    while (xp.next() && ret === null) xp.
      do(function () { // caution, early returns
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments#Description says to iterate.
        var tripleToConstraintMapping = [], usedTriples = []; // = Array.prototype.slice.call(arguments)
        for (var i = 0; i < arguments.length; ++i) {
          var tpNumber = arguments[i];
          tripleToConstraintMapping.push(tpNumber);
          if (tpNumber !== ε) {
            usedTriples.push(outgoing[i]);
          }
        }

        var byConstraint = tripleToConstraintMapping.slice().sort().filter(function (i) { return i !== ε; }).join(" ")+" "; // 0 0 1 3
        _log("trying " + tripleToConstraintMapping.slice().join(" ")+" |" + byConstraint + " (" + shapeLabel + ") with " + usedTriples.join(' '));
        var solution = byConstraint.match(r);
        if (!solution)
          return;
        _log("post-regexp " + usedTriples.join(' '));
        for (var i = 0; i < outgoing.length; ++i) {
          if (tripleToConstraintMapping[i] !== ε) {
            var triple = outgoing[i];
            var triplePattern = _ShExValidator._triplePatternsByLabel[shapeLabel][tripleToConstraintMapping[i]];
            // if (_triplesMatchingPattern([triple], triplePattern).length !== 1) // handled above
            //   return;
            if (_triplesMatchingDependentShape(db, [triple], triplePattern, depth).length === 0)
              return;
          }
        }
        _log("final " + usedTriples.join(' '));
        ret = { expression: schema.shapes[shapeLabel].expression, triples: usedTriples};
        // alts.push(tripleToConstraintMapping);
      }, console);
    _log("</" + shapeLabel + ">");
    if (VERBOSE) {
      outgoing.forEach(function (t) {
        delete t.toString;
      });
    }
    return ret;

    var alts = []; // cartesianProductOf(outgoingCandidates)
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
    runtimeError("expected "+o+" to have a '"+p+"' attribute.");
  if (arguments.length > 2 && o[p] !== v)
    runtimeError("expected "+p+" attribute '"+o[p]+"' to equal '"+v+"'.");
}

// ## Exports

// Export the `ShExValidator` class as a whole.
if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExValidator; // node environment
else
  ShExValidator = ShExValidator;
