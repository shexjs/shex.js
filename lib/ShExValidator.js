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

// ## Constructor
function ShExValidator(schema, options) {
  if (!(this instanceof ShExValidator))
    return new ShExValidator(schema, options);
  options = options || {};
  var handlers = options.handlers || {};
  _ShExValidator = this;
  this.schema = schema;
  this.visited = {};
  this._expect = options.lax ? noop : expect;
  this.reset = function () {  }; // included in case we need it later.

  this.validate = function (db, point, shapeLabel) {
    function validationError () { // @@ add point and shapeLabel
      var errorStr = Array.prototype.join.call(arguments, '');
      throw new Error("Error validating " + point + " as " + shapeLabel + ": " + errorStr);
    }

    shapeLabel = shapeLabel || schema.start;
    if (!shapeLabel)
      runtimeError("start production not defined");
    var ret = ShExResults();
    var shape = schema.shapes[shapeLabel];

    this._expect(shape, 'type', 'shape');

    // if (shape.virtual) ;
    // if (shape.closed) ;
    // if (shape.inherit && shape.inherit.length > 0) ;
    // if (shape.extra && shape.extra.length > 0)

    function _evalExpression (expr) {
      function oneOf (exors, ret) {
        exprs.forEach(function (nested, ord) {
          _evalExpression(nested)
        });
      }
      function someOf (exprs, ret) {
        exprs.forEach(function (nested, ord) {
          _evalExpression(nested)
        });
      }
      function someOfShapes (shapes, ret) {
        shapes.forEach(function (shape) {
          _ShExValidator.validate(store, t.object, reference);
        });
      }
      function group (exprs, ret) {
        exprs.forEach(function (nested, ord) {
          _evalExpression(nested)
        });
      }

      function _semanticActions (semActs) {
        if (semActs)
          for (var lang in semActs)
            if (lang in handlers)
              handlers.lang.eval(semActs[lang]);
      }

      if (expr.type === 'tripleConstraint') {
        var searchSubject = expr.inverse ? null : point;
        var searchObject = expr.inverse ? point : null;
        var matching = db.findByIRI(searchSubject, expr.predicate, searchObject, null);
        ret.expression = expr;
        matching.forEach(function (t) {
          var value = expr.inverse ? t.subject : t.object;

          // if (expr.negated) ;
          var v = expr.value;
          expect(v, 'type', 'valueClass');
          if (!v.reference && !v.nodeKind && !v.values && !v.datatype) {
            ; // wildcard -- ignore
          } else {
            if ("nodeKind" in v && !options.lax) {
              if (['iri', 'bnode', 'literal', 'nonliteral'].indexOf(v.nodeKind) === -1) {
                runtimeError("unknown node kind '" + v.nodeKind + "'")
              }
              if (value.substr(0, 2) === "_:") {
                if (v.nodeKind === "iri" || v.nodeKind === "literal") {
                  runtimeError("blank node found when " + v.nodeKind + " expected");
                  }
              } else if (value.substr(0, 1) === "\"") {
                  if (v.nodeKind !== "literal") {
                    runtimeError("literal found when " + v.nodeKind + " expected");
                  }
              } else if (v.nodeKind === "bnode" || v.nodeKind === "literal") {
                runtimeError("iri found when " + v.nodeKind + " expected");
              }
            };

            if (v.reference && v.values  ) runtimeError("found both reference and values in "  +expr);
            if (v.reference && v.datatype) runtimeError("found both reference and datatype in "+expr);
            if (v.datatype  && v.values  ) runtimeError("found both datatype and values in "   +expr);

            if (v.reference) {
              if (typeof(v.reference) === "object") {
                someOfShapes(v.reference.disjuncts, ret);
              } else {
                _ShExValidator.validate(store, t.object, v.reference);
              }
            }

            if (v.datatype) {
              if (N3Util.getLiteralType(t.object) !== v.datatype) {
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
                  validationError("value " + N3Util.getLiteralType(t.object) + " not found in set " + v.values);
                }
              }
            }
          }

          if ('pattern' in v) {
            if (!(t.object.match(new RegExp(v.patter)))) {
              validationError("value " + N3Util.getLiteralType(t.object) + " did not match pattern " + v.pattern);
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

        });

        var min = "min" in expr ? expr.min : 1;
        var max = "max" in expr ? expr.max : 1;
        if (matching.length < min)
          validationError("expected at least " + min + " triples matching " + [searchSubject, expr.predicate, searchObject].join(" "));
        if (matching.length > max)
          validationError("expected no more than " + max + " triples matching " + [searchSubject, expr.predicate, searchObject].join(" "));

        // ignore expr.annotations

        _semanticActions(expr.semAct);
        ret.triples = matching;
        return ret;
      }

      else if (expr.type === 'oneOf') { oneOf(exprs, ret); }

      else if (expr.type === 'someOf') { someOf(exprs, ret); }

      else if (expr.type === 'group') { group(exprs, ret); }

      else if (expr.type === 'include') {
        ret = this.validate(db, expr.include);
      }

      else runtimeError("unexpected expr type: " + expr.type);
    }

    if (shape.expression)
      ret = _evalExpression(shape.expression);

    if (shape.semActs)
      Object.keys(shape.semActs).forEach(function (k) {
      });

    return ret;      
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
