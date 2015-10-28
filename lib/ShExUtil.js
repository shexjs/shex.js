// **ShExUtil** provides ShEx utility functions

var ShExUtil = {

  version: function () {
    return "0.5.0";
  },

  Visitor: function () {
    // function expect (l, r) { var ls = JSON.stringify(l), rs = JSON.stringify(r); if (ls !== rs) throw Error(ls+" !== "+rs); }
    var _ShExUtil = this;
    function visitMap (map, val) {
      var ret = {};
      Object.keys(map).forEach(function (item) {
        ret[item] = val(map[item]);
      });
      return ret;
    }
    var r = {
      visitSchema: function (schema) {
        var ret = { type: "schema" };
        _ShExUtil._expect(schema, 'type', 'schema');
        this._maybeSet(schema, ret,
                       ["prefixes", "valueClasses", "startActs", "start", "shapes"]);
        return ret;
      },

      visitPrefixes: function (prefixes) {
        return prefixes === undefined ?
          undefined :
          visitMap(prefixes, function (val) {
            return val;
          });
      },
      visitValueClasses: function (valueClasses) {
        return valueClasses === undefined ?
          undefined :
          visitMap(valueClasses, function (val) {
            return this.visitValue(val); });
      },

      visitStartActs: function (startActs) {
        var _Visitor = this;
        return startActs === undefined ?
          undefined :
          startActs.map(function (act) {
            return _Visitor.visitSemAct(act);
          });
      },
      visitSemActs: function (semActs) {
        var _Visitor = this;
        if (semActs === undefined)
          return undefined;
        ret = []
        Object.keys(semActs).forEach(function (label) {
          ret.push(_Visitor.visitSemAct(semActs[label], label));
        });
        return ret;
      },
      visitSemAct: function (semAct, label) {
        var ret = { type: "semAct" };
        _ShExUtil._expect(semAct, 'type', 'semAct');

        this._maybeSet(semAct, ret,
                       ["name", "code"]);
        return ret;
      },

      visitShapes: function (shapes) {
        var _Visitor = this;
        if (shapes === undefined)
          return undefined;
        var ret = {}
        Object.keys(shapes).forEach(function (label) {
          ret[label] = _Visitor.visitShape(shapes[label], label);
        });
        return ret;
      },

      // ### `visitShape` deep-copies the structure of a shape
      visitShape: function (shape, label) {
        var ret = { type: "shape" };
        _ShExUtil._expect(shape, 'type', 'shape');

        this._maybeSet(shape, ret,
                       ["virtual", "closed", "inherit", "extra", "expression", "semActs"]);
        return ret;
      },

      // _visitGrp: visit a grouping expression (someOf or eachOf)
      // TODO: rename to visitGroup when changing "group" to "eachOf".
      _visitGrp: function (expr, type) {
        var _Visitor = this;
        var r = { type: expr.type };
        r.expressions = expr.expressions.map(function (nested) {
          return _Visitor.visitExpression(nested);
        });
        return this._maybeSet(expr, r,
                              ["min", "max", "annotations", "semActs"]);
      },

      visitTripleConstraint: function (expr) {
        return this._maybeSet(expr, { type: "tripleConstraint" },
                              ["inverse", "negated", "predicate", "valueClassRef", "value",
                               "min", "max", "annotations", "semActs"])
      },

      visitExpression: function (expr) {
        var r = expr.type === 'tripleConstraint' ? this.visitTripleConstraint(expr) :
          expr.type === 'someOf' ? this.visitSomeOf(expr) :
          expr.type === 'group' ? this.visitEachOf(expr) :
          expr.type === 'inclusion' ? this.visitInclusion(expr) :
          null;
        if (r === null)
          throw Error("unexpected expression type: " + expr.type);
        else
          return r;
      },

      visitValue: function (valueClass) {
        return this._maybeSet(valueClass, { type: "valueClass" },
                              ["nodeKind", "datatype", "pattern", "length", "minlength", "maxlength",
                               "mininclusive", "minexclusive", "maxinclusive", "maxexclusive",
                               "totaldigits", "fractiondigits", "values"]);
      },

      visitValues: function (values) {debugger;
        var _Visitor = this;
        return values.map(function (t) {
          return typeof t === "object" ? _Visitor.visitStemRange(t) : t;
        });
      },

      visitStemRange: function (t) {
        var _Visitor = this;
        _ShExUtil._expect(t, 'type', 'stemRange');
        var stem;
        if (typeof t.stem === "object") {
          _ShExUtil._expect(t.stem, 'type', 'wildcard');
          stem = { type: "stemRange", stem: { type: "wildcard" } };
        } else {
          stem = { type: "stemRange", stem: t.stem };
        }
        if (t.exclusions) {
          stem.exclusions = t.exclusions.map(function (c) {
            return _Visitor.visitExclusion(c);
          });
        }
        return stem;
      },

      visitExclusion: function (c) {
        if (typeof c === "object") {
          _ShExUtil._expect(c, 'type', 'stem');
          return { type: "stem", stem: c.stem };
        } else {
          return c;
        }
      },

      _maybeSet: function (obj, ret, members) {
        var _Visitor = this;
        members.forEach(function (member) {
          var methodName = "visit" + member.charAt(0).toUpperCase() + member.slice(1);
          if (member in obj) {
            var t = _Visitor[methodName].call(_Visitor, obj[member]);
            if (t !== undefined) {
              ret[member] = t;
            }
          }
        });
        return ret;
      },
      _visitValue: function (v) {
        return v;
      },
      _visitList: function (l) {
        return l.slice();
      }
    };
    r.visitStart = r.visitVirtual = r.visitClosed = r._visitValue;
    r.visitInherit = r.visitExtra = r.annotations = r._visitList;
    r.visitInverse = r.visitNegated = r.visitPredicate = r.visitValueClassRef = r._visitValue;
    r.visitName = r.visitCode = r.visitMin = r.visitMax = r._visitValue;

    r.visitType = r.visitNodeKind = r.visitDatatype = r.visitPattern = r.visitLength = r.visitMinlength = r.visitMaxlength = r.visitMininclusive = r.visitMinexclusive = r.visitMaxinclusive = r.visitMaxexclusive = r.visitTotaldigits = r.visitFractiondigits = r._visitValue;
    r.visitSomeOf = r.visitEachOf = r._visitGrp;
    return r;
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
          var v = 'valueClassRef' in expr ? schema.valueClasses[expr.valueClassRef].value : expr.value;
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

        else if (expr.type === 'inclusion') {
          ret.add(label, expr.include);
        }

        else throw Error("unexpected expr type: " + expr.type);
      }

      if (shape.expression)
        _walkExpression(shape.expression, "  ", 4);
    });
    return ret;
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


  emptySchema: function () {
    return {
      type: "schema",
      prefixes: {  },
      shapes: {  }
    };
  },
  merge: function (left, right, overwrite) {
    var ret = this.emptySchema();

    // prefixes
    Object.keys(left.prefixes).forEach(function (key) {
      ret.prefixes[key] = left.prefixes[key];
    });
    Object.keys(right.prefixes).forEach(function (key) {
      if (!(key in left.prefixes) || overwrite)
        ret.prefixes[key] = right.prefixes[key];
    });

    // startAct
    if ("startAct" in left)
      ret.startAct = left.startAct;
    if ("startAct" in right)
      if (!("startAct" in left) || overwrite)
        ret.startAct = right.startAct;

    // start
    if ("start" in left)
      ret.start = left.start;
    if ("start" in right)
      if (!("start" in left) || overwrite)
        ret.start = right.start;

    // shapes
    Object.keys(left.shapes).forEach(function (key) {
      ret.shapes[key] = left.shapes[key];
    });
    Object.keys(right.shapes).forEach(function (key) {
      if (!(key in left.shapes) || overwrite)
        ret.shapes[key] = right.shapes[key];
    });

    return ret;
  },

  /** isWellDefined: assert that schema is well-defined.
   *
   * @schema: input schema
   * @@TODO
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
