// **ShExValidator** provides ShEx utility functions

var ShExResults = require('./ShExResults');

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
    debugger;
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
        var matching = db.findByIRI(expr.inverse ? null : point,
                                    expr.predicate,
                                    expr.inverse ? point : null,
                                    null);
        matching.forEach(function (t) {
          var value = expr.inverse ? t.s : t.o;

          // if (expr.negated) ;
          var v = expr.value;
          expect(v, 'type', 'valueClass');
          if (!v.reference && !v.nodeKind && !v.values && !v.datatype)
            ; // wildcard -- ignore
          else {
            if (v.nodeKind in nodeKinds && !options.lax) {
              if (['iri', 'bnode', 'literal', 'nonliteral'].indexOf(v.nodeKind) === -1) {
                runtimeError("unknown node kind '" + v.nodeKind + "'")
              }
              if (value.substr(2) === "_:") {
                if (v.nodeKind === "iri" || v.nodeKind === "literal")
                  runtimeError("blank node found when " + v.nodeKind + " expected");
              } else if (value.substr[0] === "\"") {
                  if (v.nodeKind !== "literal")
                    runtimeError("literal found when " + v.nodeKind + " expected");
              } else if (v.nodeKind === "bnode" || v.nodeKind === "literal")
                runtimeError("iri found when " + v.nodeKind + " expected");
            };

            if (v.reference && v.values  ) runtimeError("found both reference and values in "  +expr);
            if (v.reference && v.datatype) runtimeError("found both reference and datatype in "+expr);
            if (v.datatype  && v.values  ) runtimeError("found both datatype and values in "   +expr);

            if (v.reference) {
              if (typeof(v.reference) === "object") {
                someOf(v.reference.disjuncts, ret);
              } else {
                pieces.push("@"+_ShExWriter._encodeShapeName(v.reference));
              }
            }

            if (v.datatype) {
              pieces.push(_ShExWriter._encodeShapeName(v.datatype));
            }

            if (v.values) {
              pieces.push("(");

              v.values.forEach(function (t, ord) {
                if (ord > 1)
                  pieces.push(" ");

                if (typeof t === "object") {
                  expect(t, 'type', 'stemRange');
                  if (typeof t.stem === "object") {
                    expect(t.stem, 'type', 'wildcard');
                    pieces.push(".");
                  } else {
                    pieces.push(_ShExWriter._encodeValue(t.stem)+"~");
                  }
                  if (t.exclusions) {
                    t.exclusions.forEach(function (c) {
                      pieces.push(" - ");
                      if (typeof c === "object") {
                        expect(c, 'type', 'stem');
                        pieces.push(_ShExWriter._encodeValue(c.stem)+"~");
                      } else {
                        pieces.push(_ShExWriter._encodeValue(c));
                      }
                    });
                  }
                } else {
                  pieces.push(_ShExWriter._encodeValue(t));
                }
              });

              pieces.push(")");
            }
          }

          if ('pattern' in v)
            pieces.push("~", _ShExWriter._encodeValue("\""+v.pattern+"\""), " ");
          ['length', 'minlength', 'maxlength',
           'mininclusive', 'minexclusive', 'maxinclusive', 'maxexclusive',
           'totaldigits', 'fractiondigits'
          ].forEach(function (a) {
            if (v[a])
              pieces.push(" ", a, " ", v[a]);
          });
        });
        // if (expr.min === 0 && expr.max === undefined) ;

        // ignore expr.annotations

        _semanticActions(expr.semAct);
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

function validationError () {
  var errorStr = Array.prototype.join.call(arguments, '');
  throw new Error("Validation error: " + errorStr);
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
