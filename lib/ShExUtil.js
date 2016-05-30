// **ShExUtil** provides ShEx utility functions

var N3 = null;

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
        var ret = { type: "Schema" };
        _ShExUtil._expect(schema, "type", "Schema");
        this._maybeSet(schema, ret, "Schema",
                       ["prefixes", "base", "startActs", "valueExprDefns", "start", "shapes"]);
        return ret;
      },

      visitPrefixes: function (prefixes) {
        return prefixes === undefined ?
          undefined :
          visitMap(prefixes, function (val) {
            return val;
          });
      },
      visitValueExprDefns: function (valueExprDefns) {
        var _Visitor = this;
        return valueExprDefns === undefined ?
          undefined :
          visitMap(valueExprDefns, function (val) {
            return _Visitor.visitValueExprDefn(val); });
      },
      visitValueExprDefn: function (valueExprDefn, label) {
        var ret = { type: "ValueExprDefn" };
        _ShExUtil._expect(valueExprDefn, "type", "ValueExprDefn");

        this._maybeSet(valueExprDefn, ret, "ValueExprDefn",
                       ["valueExpr"]);
        return ret;
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
        var ret = { type: "SemAct" };
        _ShExUtil._expect(semAct, "type", "SemAct");

        this._maybeSet(semAct, ret, "SemAct",
                       ["name", "code"]);
        return ret;
      },

      visitShapes: function (shapes) {
        var _Visitor = this;
        if (shapes === undefined)
          return undefined;
        var ret = {}
        Object.keys(shapes).forEach(function (label) {
          ret[label] = _Visitor.visitShapeExpr(shapes[label], label);
        });
        return ret;
      },

      visitShapeExpr: function (expr, label) {
        var r =
            expr.type === "Shape" ? this.visitShape(expr, label) :
            expr.type === "ShapeAnd" ? this.visitShapeAnd(expr, label) :
            // FutureWork expr.type === "ShapeOr" ? this.visitShapeOr(expr, label) :
            null;
        if (r === null)
          throw Error("unexpected shapeExpr type: " + expr.type);
        else
          return r;
      },

      // _visitShapeGroup: visit a grouping expression (shapeAnd, shapeOr)
      _visitShapeGroup: function (expr, label) {
        var _Visitor = this;
        var r = { type: expr.type };
        r.shapeExprs = expr.shapeExprs.map(function (nested) {
          return _Visitor.visitShapeExpr(nested, label);
        });
        return r;
      },

      // ### `visitShape` deep-copies the structure of a shape
      visitShape: function (shape, label) {
        var ret = { type: "Shape" };
        _ShExUtil._expect(shape, "type", "Shape");

        this._maybeSet(shape, ret, "Shape",
                       [
                         // "virtual", "inherit", -- futureWork
                         "closed", "nodeKind", "pattern", "length",
                         "minlength", "maxlength", "expression", "extra", "semActs"]);
        return ret;
      },

      // _visitGroup: visit a grouping expression (someOf or eachOf)
      _visitGroup: function (expr, type) {
        var _Visitor = this;
        var r = { type: expr.type };
        r.expressions = expr.expressions.map(function (nested) {
          return _Visitor.visitExpression(nested);
        });
        return this._maybeSet(expr, r, "expr",
                              ["min", "max", "annotations", "semActs"], ["expressions"]);
      },

      visitTripleConstraint: function (expr) {
        return this._maybeSet(expr, { type: "TripleConstraint" }, "TripleConstraint",
                              ["inverse", "negated", "predicate", "valueExprRef", "valueExpr",
                               "min", "max", "annotations", "semActs"])
      },

      visitExpression: function (expr) {
        var r = expr.type === "TripleConstraint" ? this.visitTripleConstraint(expr) :
          expr.type === "SomeOf" ? this.visitSomeOf(expr) :
          expr.type === "EachOf" ? this.visitEachOf(expr) :
          expr.type === "Inclusion" ? this.visitInclusion(expr) :
          null;
        if (r === null)
          throw Error("unexpected expression type: " + expr.type);
        else
          return r;
      },

      // _visitValueGroup: visit a grouping expression (valueAnd, valueOr)
      _visitValueGroup: function (expr) {
        var _Visitor = this;
        var r = { type: expr.type };
        r.valueExprs = expr.valueExprs.map(function (nested) {
          return _Visitor.visitValueExpr(nested);
        });
        return r;
      },

      visitValueExpr: function (expr) {
        var r = expr.type === "ValueClass" ? this.visitValueClass(expr) :
          expr.type === "ValueAnd" ? this.visitValueAnd(expr) :
          expr.type === "ValueOr" ? this.visitValueOr(expr) :
          expr.type === "ValueRef" ? this.visitValueRef(expr) :
          null;
        if (r === null)
          throw Error("unexpected valueExpr type: " + expr.type);
        else
          return r;
      },
      visitValueClass: function (valueClass) {
        return this._maybeSet(valueClass, { type: "ValueClass" }, "ValueClass",
                              ["nodeKind", "datatype", "reference", "pattern",
                               "length", "minlength", "maxlength",
                               "mininclusive", "minexclusive", "maxinclusive", "maxexclusive",
                               "totaldigits", "fractiondigits", "values"]);
      },

      visitValues: function (values) {
        var _Visitor = this;
        return values.map(function (t) {
          return typeof t === "object" ? _Visitor.visitStemRange(t) : t;
        });
      },

      visitStemRange: function (t) {
        var _Visitor = this;
        _ShExUtil._expect(t, "type", "StemRange");
        var stem;
        if (typeof t.stem === "object") {
          _ShExUtil._expect(t.stem, "type", "Wildcard");
          stem = { type: "StemRange", stem: { type: "Wildcard" } };
        } else {
          stem = { type: "StemRange", stem: t.stem };
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
          _ShExUtil._expect(c, "type", "Stem");
          return { type: "Stem", stem: c.stem };
        } else {
          return c;
        }
      },

      visitInclusion: function (inclusion, label) {
        var ret = { type: "Inclusion" };
        _ShExUtil._expect(inclusion, "type", "Inclusion");

        this._maybeSet(inclusion, ret, "Inclusion",
                       ["include"]);
        return ret;
      },

      _maybeSet: function (obj, ret, context, members, ignore) {
        var _Visitor = this;
        var unknownMembers = Object.keys(obj).reduce(function (ret, k) {
          return k !== "type" && members.indexOf(k) === -1 && (!ignore || ignore.indexOf(k) === -1) ? ret.concat(k) : ret;
        }, []);
        if (unknownMembers.length > 0) {
          throw Error("unknown propert"+(unknownMembers.length > 1 ? "ies" : "y")+": " + unknownMembers.map(function (p) { return "\"" + p + "\""; }).join(",") + " in " + context + ": " + JSON.stringify(obj));
        }
        members.forEach(function (member) {
          var methodName = "visit" + member.charAt(0).toUpperCase() + member.slice(1);
          if (member in obj) {
            var f = _Visitor[methodName];
            if (typeof f !== "function") {
              throw Error(methodName + " not found in Visitor");
            }
            var t = f.call(_Visitor, obj[member]);
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
    r.visitBase = r.visitStart = r.visitVirtual = r.visitClosed = r._visitValue;
    r.visitInherit = r.visitExtra = r.visitAnnotations = r._visitList;
    r.visitInverse = r.visitNegated = r.visitPredicate = r.visitValueExprRef = r._visitValue;
    r.visitName = r.visitCode = r.visitMin = r.visitMax = r._visitValue;

    r.visitType = r.visitNodeKind = r.visitDatatype = r.visitReference = r.visitPattern = r.visitLength = r.visitMinlength = r.visitMaxlength = r.visitMininclusive = r.visitMinexclusive = r.visitMaxinclusive = r.visitMaxexclusive = r.visitTotaldigits = r.visitFractiondigits = r._visitValue;
    r.visitSomeOf = r.visitEachOf = r._visitGroup;
    r.visitShapeAnd = r._visitShapeGroup;
    r.visitValueAnd = r.visitValueOr = r._visitValueGroup;
    r.visitValueRef = r.visitInclude = r._visitValue;
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

  /** getDependencies: find which shappes depend on other shapes by inheritance
   * or inclusion.
   * TODO: rewrite in terms of Visitor.
   */
  getDependencies: function (schema, ret) {
    // Expect property p with value v in object o
    function expect (o, p, v) {
      if (!(p in o))
        throw Error("expected "+JSON.stringify(o)+" to have a "+p+".");
      if (arguments.length > 2 && o[p] !== v)
        throw Error("expected "+o[p]+" to equal "+v+".");
    }

    ret = ret || this.BiDiClosure();
    Object.keys(schema.shapes || []).forEach(function (label) {
      var t = schema.shapes[label];
      var shapeAnd = t.type === "ShapeAnd" ? t.shapeExprs : [t];
      shapeAnd.forEach(shape => {
        expect(shape, "type", "Shape");
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

          if (expr.type === "TripleConstraint") {
            function _checkValueExpr (v) {
              if (v.type === "ValueClass") {
                expect(v, "type", "ValueClass");
                if (v.reference) {
                  if (typeof(v.reference) === "object") {
                    v.reference.disjuncts.forEach(function (c) {
                      ret.add(label, c);
                    });
                  } else {
                    ret.add(label, v.reference);
                  }
                  if (expr.negated && ret.inCycle.indexOf(label) !== -1) // !!! move to v.negated
                    throw Error("Structural error: " + label + " appears in negated cycle");
                }
              } else if (v.type === "ValueRef") {
                _checkValueExpr(schema.valueExprDefns[v.valueExprRef].valueExpr);
              } else if (v.type === "ValueOr") {
                v.valueExprs.forEach(function (expr) {
                  _checkValueExpr(expr);
                });
              } else {
                expect(v, "type", "ValueAnd");
                v.valueExprs.forEach(function (expr) {
                  _checkValueExpr(expr);
                });
              }
            }
            _checkValueExpr(expr.valueExpr);
          }

          else if (expr.type === "SomeOf") {
            _exprGroup(expr.expressions, "\n"+indent+"|| ");
          }

          else if (expr.type === "EachOf") {
            _exprGroup(expr.expressions, ",\n"+indent);
          }

          else if (expr.type === "Inclusion") {
            ret.add(label, expr.include);
          }

          else throw Error("unexpected expr type: " + expr.type);
        }

        if (shape.expression)
          _walkExpression(shape.expression, "  ", 4);
      });
    });
    return ret;
  },

  /** partition: create subset of a schema with only desired shapes and
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
      partition[k] = k === "shapes" ? {} : schema[k];
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


  /** flatten: return copy of input schema with all shape and value class
   * references substituted by a copy of their referent.
   *
   * @schema: input schema
   */
  flatten: function (schema, deps, cantFind) {
    var v = this.Visitor();
    return v.visitSchema(schema);
  },


  emptySchema: function () {
    return {
      type: "Schema"
    };
  },
  merge: function (left, right, overwrite, inPlace) {
    var ret = inPlace ? left : this.emptySchema();

    function copy (attr) {
      Object.keys(left[attr] || {}).forEach(function (key) {
        if (!(attr in ret))
          ret[attr] = {};
        ret[attr][key] = left[attr][key];
      });
      Object.keys(right[attr] || {}).forEach(function (key) {
        if (!(attr  in left) || !(key in left[attr]) || overwrite) {
          if (!(attr in ret))
            ret[attr] = {};
          ret[attr][key] = right[attr][key];
        }
      });
    }

    // base
    if ("base" in left)
      ret.base = left.base;
    if ("base" in right)
      if (!("base" in left) || overwrite)
        ret.base = right.base;

    copy("prefixes");

    // startActs
    if ("startActs" in left)
      ret.startActs = left.startActs;
    if ("startActs" in right)
      if (!("startActs" in left) || overwrite)
        ret.startActs = right.startActs;

    copy("valueExprDefns");

    // start
    if ("start" in left)
      ret.start = left.start;
    if ("start" in right)
      if (!("start" in left) || overwrite)
        ret.start = right.start;

    // shapes
    Object.keys(left.shapes || {}).forEach(function (key) {
      if (!("shapes" in ret))
        ret.shapes = {};
      ret.shapes[key] = left.shapes[key];
    });
    Object.keys(right.shapes || {}).forEach(function (key) {
      if (!("shapes"  in left) || !(key in left.shapes) || overwrite) {
        if (!("shapes" in ret))
          ret.shapes = {};
        ret.shapes[key] = right.shapes[key];
      }
    });

    return ret;
  },

  absolutizeResults: function (parsed, base) {
    if (N3 === null)
      N3 = require("n3");

    function resolveRelativeIRI (baseIri, relativeIri) {
      var p = N3.Parser({ documentIRI: baseIri });
      p._readSubject({type: "IRI", value: relativeIri});
      return p._subject;
    }

    // !! duplicate of Validation-test.js:84: var referenceResult = parseJSONFile(resultsFile...)
    function mapFunction (k, obj) {
      // resolve relative URLs in results file
      if (["shape", "reference", "valueExprRef", "node", "subject", "predicate", "object"].indexOf(k) !== -1 &&
          N3.Util.isIRI(obj[k])) {
        obj[k] = resolveRelativeIRI(base, obj[k]);
      }}

    function resolveRelativeURLs (obj) {
      Object.keys(obj).forEach(function (k) {
        if (typeof obj[k] === "object") {
          resolveRelativeURLs(obj[k]);
        }
        if (mapFunction) {
          mapFunction(k, obj);
        }
      });
    }
    resolveRelativeURLs(parsed);
    return parsed;
  },

  validateSchema: function (schema) {
    var _ShExUtil = this;
    var visitor = this.Visitor();
    var seenValueOr;
    var seenValueAnd;
    var oldVisitValueAnd = visitor.visitValueAnd;
    var oldVisitValueOr = visitor.visitValueOr;
    var oldVisitValueExprDefn = visitor.visitValueExprDefn;
    var oldVisitTripleConstraint = visitor.visitTripleConstraint;debugger;
    visitor.visitValueAnd = function (expr) {
      if (seenValueOr) {
        throw _ShExUtil._error("Parse error: value expressions must not mix ORs and ANDs.");
      }
      seenValueAnd = true;
      return oldVisitValueAnd.call(visitor, expr);
    }
    visitor.visitValueOr = function (expr) {
      if (seenValueAnd) {
        throw _ShExUtil._error("Parse error: value expressions must not mix ORs and ANDs.");
      }
      seenValueOr = true;
      return oldVisitValueOr.call(visitor, expr);
    }
    visitor.visitValueExprDefn = function (valueExprDefn, label) {
      seenValueAnd = seenValueOr = false;
      return oldVisitValueExprDefn.call(visitor, valueExprDefn, label);
    }
    visitor.visitTripleConstraint = function (expr) {
      this.seenValueAnd = this.seenValueOr = false;
      return oldVisitTripleConstraint.call(visitor, expr);
    }
    visitor.visitSchema(schema);
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

  // Expect property p with value v in object o
  _expect: function (o, p, v) {
    if (!(p in o))
      this._error("expected "+o+" to have a ."+p);
    if (arguments.length > 2 && o[p] !== v)
      this._error("expected "+o[o]+" to equal ."+v);
  },

  _error: function (str) {
    throw new Error(str);
  }
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
