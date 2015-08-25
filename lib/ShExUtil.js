// **ShExUtil** provides ShEx utility functions

var ShExUtil = {
  version: function () {
    return "0.1.0";
  },

  BiDiClosure: function () {
    return {
      needs: {},
      neededBy: {},
      inCycle: [],
      test: function () {
        function expect (l, r) { var ls = JSON.stringify(l), rs = JSON.stringify(r); if (ls !== rs) throw Error(ls+" !== "+rs); }
        // this.add(1, 2); expect(this.needs, { 1:[2]                     }); expect(this.neededBy, { 2:[1]                     });
        // this.add(3, 4); expect(this.needs, { 1:[2], 3:[4]              }); expect(this.neededBy, { 2:[1], 4:[3]              });
        // this.add(2, 3); expect(this.needs, { 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 2:[1], 3:[2,1], 4:[3,2,1] });

        this.add(2, 3); expect(this.needs, { 2:[3]                     }); expect(this.neededBy, { 3:[2]                     });
        this.add(1, 2); expect(this.needs, { 1:[2,3], 2:[3]            }); expect(this.neededBy, { 3:[2,1], 2:[1]            });
        this.add(1, 3); expect(this.needs, { 1:[2,3], 2:[3]            }); expect(this.neededBy, { 3:[2,1], 2:[1]            });
        this.add(3, 4); expect(this.needs, { 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 3:[2,1], 2:[1], 4:[3,2,1] });
        this.add(6, 7); expect(this.needs, { 6:[7]                    , 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 7:[6]                    , 3:[2,1], 2:[1], 4:[3,2,1] });
        this.add(5, 6); expect(this.needs, { 5:[6,7], 6:[7]           , 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 7:[6,5], 6:[5]           , 3:[2,1], 2:[1], 4:[3,2,1] });
        this.add(5, 7); expect(this.needs, { 5:[6,7], 6:[7]           , 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 7:[6,5], 6:[5]           , 3:[2,1], 2:[1], 4:[3,2,1] });
        this.add(7, 8); expect(this.needs, { 5:[6,7,8], 6:[7,8], 7:[8], 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 7:[6,5], 6:[5], 8:[7,6,5], 3:[2,1], 2:[1], 4:[3,2,1] });
        this.add(4, 5);
        expect(this.needs,    { 1:[2,3,4,5,6,7,8], 2:[3,4,5,6,7,8], 3:[4,5,6,7,8], 4:[5,6,7,8], 5:[6,7,8], 6:[7,8], 7:[8] });
        expect(this.neededBy, { 2:[1], 3:[2,1], 4:[3,2,1], 5:[4,3,2,1], 6:[5,4,3,2,1], 7:[6,5,4,3,2,1], 8:[7,6,5,4,3,2,1] });
      },
      add: function (needer, needie, negated) {
        var r = this;
        if (!(needer in r.needs))
          r.needs[needer] = [];
        if (!(needie in r.neededBy))
          r.neededBy[needie] = [];

        // // [].concat.apply(r.needs[needer], [needie], r.needs[needie]). emitted only last element
        r.needs[needer] = r.needs[needer].concat([needie], r.needs[needie]).
          filter(function (el, ord, l) { return el !== undefined && l.indexOf(el) === ord; });
        // // [].concat.apply(r.neededBy[needie], [needer], r.neededBy[needer]). emitted only last element
        r.neededBy[needie] = r.neededBy[needie].concat([needer], r.neededBy[needer]).
          filter(function (el, ord, l) { return el !== undefined && l.indexOf(el) === ord; });

        if (needer in this.neededBy) this.neededBy[needer].forEach(function (e) {
          r.needs[e] = r.needs[e].concat([needie], r.needs[needie]).
            filter(function (el, ord, l) { return el !== undefined && l.indexOf(el) === ord; });
        });

        if (needie in this.needs) this.needs[needie].forEach(function (e) {
          r.neededBy[e] = r.neededBy[e].concat([needer], r.neededBy[needer]).
            filter(function (el, ord, l) { return el !== undefined && l.indexOf(el) === ord; })
        });
        // this.neededBy[needie].push(needer);

        if (r.needs[needer].indexOf(needer) !== -1)
          r.inCycle = r.inCycle.concat(r.needs[needer]);
      },
      trim: function () {
        function _trim (a) {
          // filter(function (el, ord, l) { return l.indexOf(el) === ord; })
          for (var i = a.length-1; i > -1; --i)
            if (a.indexOf(a[i]) < i)
              a.splice(i, i+1);
        }
        for (k in this.needs)
          _trim(this.needs[k]);
        for (k in this.neededBy)
          _trim(this.neededBy[k]);
      }
    }
  },

  getDependencies: function (schema, ret) {
    // Expect property p with value v in object o
    function expect (o, p, v) {
      if (!(p in o))
        throw Error("expected "+JSON.stringify(o)+" to have a "+p+".");
      if (arguments.length > 2 && o[p] !== v)
        throw Error("expected "+o[p]+" to equal "+v+".");
    }

    ret = ret || this.BiDiClosure();
    Object.keys(schema.shapes).forEach(function (label) {
      var shape = schema.shapes[label];
      expect(shape, 'type', 'shape');
      if (shape.inherit && shape.inherit.length > 0)
        shape.inherit.forEach(function (i) {
          ret.add(label, i);
        });

      function _walkExpression (expr, indent, precedent) {
        function _exprGroup (exprs) {
          exprs.forEach(function (nested) {
            _walkExpression(nested)
          });
        }

        if (expr.type === 'tripleConstraint') {
          var v = 'valueClassRef' in expr ? schema.valueClasses[expr.valueClassRef] : expr.value;
          expect(v, 'type', 'valueClass');
          if (v.reference) {
            if (typeof(v.reference) === "object") {
              v.reference.disjuncts.forEach(function (c) {
                ret.add(label, c);
              });
            } else {
              ret.add(label, v.reference);
            }
            if (expr.negated && ret.inCycle.indexOf(label) !== -1)
              throw Error("Structural error: " + label + " appears in negated cycle");
          }
        }

        else if (expr.type === 'someOf') {
          _exprGroup(expr.expressions, "\n"+indent+"|| ");
        }

        else if (expr.type === 'group') {
          _exprGroup(expr.expressions, ",\n"+indent);
        }

        else if (expr.type === 'include') {
          ret.add(label, expr.include);
        }

        else throw Error("unexpected expr type: " + expr.type);
      }

      if (shape.expression)
        _walkExpression(shape.expression, "  ", 4);
    });
    return ret;
  },

  compile: function (schema) {
    // Expect property p with value v in object o
    function expect (o, p, v) {
      if (!(p in o))
        throw Error("expected "+JSON.stringify(o)+" to have a "+p+".");
      if (arguments.length > 2 && o[p] !== v)
        throw Error("expected "+o[p]+" to equal "+v+".");
    }

    function Epsilon () {
      this.type = 'Epsilon';
    }

    function TripleConstraint (predicate, inverse, negated, value) {
      this.type = 'TripleConstraint';
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

    function Repeat (expression, min, max) {
      this.type = 'Repeat';
      this.expression = expression;
      this.min = min;
      this.max = max;
    }

    var _ShExUtil = this;
    debugger;
    var shapes = Object.keys(schema.shapes).reduce(function (ret, label) {
      var shape = schema.shapes[label];
      expect(shape, 'type', 'shape');
      // shape.inherit Map[label, expression]

      function _compileExpression (expr) {
        function _exprGroup (exprs) {
          exprs.forEach(function (nested) {
            _compileExpression(nested)
          });
        }

        if (expr.type === 'tripleConstraint') {
          // predicate, inverse, negated, value, annotations, semAct, min, max
          var tp = new TripleConstraint(expr.predicate, expr.inverse, expr.negated, "valueClassRef" in expr ? schema.valueClasses[expr.valueClassRef] : expr.value);
          var repeat = ("min" in expr && expr.min !== 1 ||
                        "max" in expr && expr.max !== 1) ?
            new Repeat(tp, expr.min, "max" in expr ? expr.max : -1) : tp;
          return expr.semAct ? new SemActs(tp, expr.semAct) : tp;
        }

        else if (expr.type === 'someOf') {
          return new Choice(expr.expressions.map(function (e) {
            return _compileExpression(e);
          }));
        }

        else if (expr.type === 'group') {
          var group = new Group(expr.expressions.map(function (e) {
            return _compileExpression(e);
          }));
          var repeat = ("min" in expr && expr.min !== 1 ||
                        "max" in expr && expr.max !== 1) ?
            new Repeat(group, expr.min, "max" in expr ? expr.max : -1) : group;
          return expr.semAct ? new SemActs(group, expr.semAct) : group;
        }

        else if (expr.type === 'include') {
          return _compileExpression(expr.include)
        }

        else throw Error("unexpected expr type: " + expr.type);
      }

      ret[label] = {
        type: "ASTshape",
        expression: shape.expression ? _compileExpression(shape.expression) : new Epsilon()
      };
      return ret;
    }, {});
    return {
      type: "AST",
      shapes: shapes
    };
  },

  /** partion: create subset of a schema with only desired shapes and
   * their dependencies.
   *
   * @schema: input schema
   * @partition: shape name or array of desired shape names
   * @deps: (optional) dependency tree from getDependencies.
   */
  partition: function (schema, includes, deps, cantFind) {
    includes = includes instanceof Array ? includes : [includes];
    deps = deps || this.getDependencies(schema);
    cantFind = cantFind || function (what, why) {
      throw new Error("Error: can't find shape "+
                      (why ?
                       why + " dependency " + what :
                       what));
    };
    var partition = {};
    for (var k in schema)
      partition[k] = k === 'shapes' ? {} : schema[k];
    includes.forEach(function (i) {
      if (i in schema.shapes) {
        partition.shapes[i] = schema.shapes[i];
        if (i in deps.needs)
          deps.needs[i].forEach(function (n) {
            if (n in schema.shapes)
              partition.shapes[n] = schema.shapes[n];
            else
              cantFind(n, i);
          });
      } else {
        cantFind(i);
      }
    });
    return partition;
  },



  /** isWellDefined: assert that schema is well-defined.
   *
   * @schema: input schema
   */
  isWellDefined: function (schema) {
    var deps = this.getDependencies(schema);
    return schema;
  },
};

// Add the ShExUtil functions to the given object or its prototype
function AddShExUtil(parent, toPrototype) {
  for (var name in ShExUtil)
    if (!toPrototype)
      parent[name] = ShExUtil[name];
    else
      parent.prototype[name] = ApplyToThis(ShExUtil[name]);

  return parent;
}

// Returns a function that applies `f` to the `this` object
function ApplyToThis(f) {
  return function (a) { return f(this, a); };
}

// Expose ShExUtil, attaching all functions to it
if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = AddShExUtil(AddShExUtil); // node environment
else
  ShExUtil = AddShExUtil(AddShExUtil);
