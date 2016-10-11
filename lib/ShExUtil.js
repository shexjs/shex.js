// **ShExUtil** provides ShEx utility functions

var N3 = null;
var util = require('util');

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
                       ["prefixes", "base", "startActs", "start", "shapes"]);
        return ret;
      },

      visitPrefixes: function (prefixes) {
        return prefixes === undefined ?
          undefined :
          visitMap(prefixes, function (val) {
            return val;
          });
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
            expr.type === "NodeConstraint" ? this.visitNodeConstraint(expr, label) :
            expr.type === "ShapeAnd" ? this.visitShapeAnd(expr, label) :
            expr.type === "ShapeOr" ? this.visitShapeOr(expr, label) :
            expr.type === "ShapeNot" ? this.visitShapeNot(expr, label) :
            expr.type === "ShapeRef" ? this.visitShapeRef(expr) :
            expr.type === "ShapeExternal" ? this.visitShapeExternal(expr) :
            null;// if (expr.type === "ShapeRef") r = 0; // console.warn("visitShapeExpr:", r);
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

      // _visitShapeNot: visit negated shape
      visitShapeNot: function (expr, label) {
        return { type: expr.type, shapeExpr: this.visitShapeExpr(expr.shapeExpr, label) };
      },

      // ### `visitNodeConstraint` deep-copies the structure of a shape
      visitShape: function (shape, label) {
        var ret = { type: "Shape" };
        _ShExUtil._expect(shape, "type", "Shape");

        this._maybeSet(shape, ret, "Shape",
                       [
                         // "virtual", "inherit", -- futureWork
                         "closed",
                         "expression", "extra", "semActs"]);
        return ret;
      },

      // ### `visitNodeConstraint` deep-copies the structure of a shape
      visitNodeConstraint: function (shape, label) {
        var ret = { type: "NodeConstraint" };
        _ShExUtil._expect(shape, "type", "NodeConstraint");

        this._maybeSet(shape, ret, "NodeConstraint",
                       [
                         // "virtual", "inherit", -- futureWork
                         "nodeKind", "datatype", "pattern", "length",
                         "reference", "minlength", "maxlength",
                         "mininclusive", "minexclusive", "maxinclusive", "maxexclusive",
                         "totaldigits", "fractiondigits", "values"]);
        return ret;
      },

      visitShapeRef: function (expr) {
        return { type: "ShapeRef", reference: expr.reference };
      },

      visitShapeExternal: function (expr) {
        return { type: "ShapeExternal" };
      },

      // _visitGroup: visit a grouping expression (someOf or eachOf)
      _visitGroup: function (expr, type) {
        var _Visitor = this;
        var r = { type: expr.type };
        r.expressions = expr.expressions.map(function (nested) {
          return _Visitor.visitExpression(nested);
        });
        return this._maybeSet(expr, r, "expr",
                              ["productionLabel", "min", "max", "annotations", "semActs"], ["expressions"]);
      },

      visitTripleConstraint: function (expr) {
        return this._maybeSet(expr, { type: "TripleConstraint" }, "TripleConstraint",
                              ["productionLabel", "inverse", "negated", "predicate", "valueExpr",
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

      visitInclusion: function (inclusion) {
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
          var e = Error("unknown propert" + (unknownMembers.length > 1 ? "ies" : "y") + ": " +
			unknownMembers.map(function (p) {
			  return "\"" + p + "\"";
			}).join(",") +
			" in " + context + ": " + JSON.stringify(obj));
	  Error.captureStackTrace(e, this._maybeSet);
	  throw e;
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
    r.visitInverse = r.visitNegated = r.visitPredicate = r._visitValue;
    r.visitName = r.visitProductionLabel = r.visitCode = r.visitMin = r.visitMax = r._visitValue;

    r.visitType = r.visitNodeKind = r.visitDatatype = r.visitPattern = r.visitLength = r.visitMinlength = r.visitMaxlength = r.visitMininclusive = r.visitMinexclusive = r.visitMaxinclusive = r.visitMaxexclusive = r.visitTotaldigits = r.visitFractiondigits = r._visitValue;
    r.visitSomeOf = r.visitEachOf = r._visitGroup;
    r.visitShapeAnd = r.visitShapeOr = r._visitShapeGroup;
    r.visitShapeRef = r.visitInclude = r._visitValue;
    r.visitValueExpr = r.visitShapeExpr;
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
    ret = ret || this.BiDiClosure();
    Object.keys(schema.shapes || []).forEach(function (label) {
      function _walkShapeExpression (shapeExpr, negated) {
        if (shapeExpr.type === "ShapeOr" || shapeExpr.type === "ShapeAnd") {
          shapeExpr.shapeExprs.forEach(function (expr) {
            _walkShapeExpression(expr, negated ^ !!expr.negated);
          });
        } else if (shapeExpr.type === "ShapeNot") {
          _walkShapeExpression(shapeExpr.shapeExpr, negated ^ 1); // !!! test negation
        } else if (shapeExpr.type === "Shape") {
          _walkShape(shapeExpr, negated ^ !!shapeExpr.negated);
        } else if (shapeExpr.type === "NodeConstraint") {
          // no impact on dependencies
        } else if (shapeExpr.type === "ShapeRef") {
          ret.add(label, shapeExpr.reference);
        } else if (shapeExpr.type === "ShapeExternal") {
        } else
          throw Error("expected Shape{And,Or,Ref,External} or NodeConstraint in " + util.inspect(shapeExpr));
      }
      
      function _walkShape (shape, negated) {
        function _walkTripleExpression (tripleExpr, negated) {
          function _exprGroup (exprs, negated) {
            exprs.forEach(function (nested) {
              _walkTripleExpression(nested, negated ^ !!nested.negated) // ?? negation allowed?
            });
          }

          function _walkTripleConstraint (tc, negated) {
            if (tc.valueExpr)
              _walkShapeExpression(tc.valueExpr, negated);
            if (negated && ret.inCycle.indexOf(label) !== -1) // illDefined/negatedRefCycle.err
              throw Error("Structural error: " + label + " appears in negated cycle");
          }

          if (tripleExpr.type === "TripleConstraint") {
            _walkTripleConstraint(tripleExpr, negated ^ !!tripleExpr.negated);
          } else if (tripleExpr.type === "SomeOf" || tripleExpr.type === "EachOf") {
            _exprGroup(tripleExpr.expressions);
          } else if (tripleExpr.type === "Inclusion") {
            ret.add(label, tripleExpr.include);
          } else
            throw Error("expected {TripleConstraint,SomeOf,EachOf,Inclusion} in " + tripleExpr);
        }

        if (shape.inherit && shape.inherit.length > 0)
          shape.inherit.forEach(function (i) {
            ret.add(label, i);
          });
        if (shape.expression)
          _walkTripleExpression(shape.expression, negated ^ !!shape.negated);
      }
      _walkShapeExpression(schema.shapes[label], 0); // 0 means false for bitwise XOR
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
      if (["shape", "reference", "node", "subject", "predicate", "object"].indexOf(k) !== -1 &&
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

  validateSchema: function (schema) { // obselete, but may need other validations in the future.
    var _ShExUtil = this;
    var visitor = this.Visitor();
    var currentShape = null;
    var inTE = false;
    var oldVisitTripleConstraint = visitor.visitTripleConstraint;
    visitor.visitTripleConstraint = function (expr) {
      inTE = true;
      var ret = oldVisitTripleConstraint.call(visitor, expr);
      inTE = false;
      return ret;
    };
    var oldVisitShapeRef = visitor.visitShapeRef;
    visitor.visitShapeRef = function (shapeRef) {
      if (!(shapeRef.reference in schema.shapes))
        throw Error("Structural error: reference to " + JSON.stringify(shapeRef) + " not resolvable.");
      if (!inTE && shapeRef.reference === currentShape) 
        throw Error("Structural error: circular reference to " + currentShape + ".");
      return oldVisitShapeRef.call(visitor, shapeRef.reference);
    }
    var oldVisitShapeExpr = visitor.visitShapeExpr;
    visitor.visitShapeExpr = function (expr, label) {
      currentShape = label;
      return oldVisitShapeExpr.call(visitor, expr, label);
    }
    var oldVisitInclusion = visitor.visitInclusion;
    visitor.visitInclusion = function (inclusion) {
      var refd = schema.shapes[inclusion.include];
      if (!refd)
	throw Error("Structural error: included shape " + inclusion.include + " not found.");
      if (refd.type !== "Shape")
	throw Error("Structural error: " + inclusion.include + " is not a simple shape.");
      return oldVisitInclusion.call(visitor, inclusion);
    };

    visitor.visitSchema(schema);
  },
  /** isWellDefined: assert that schema is well-defined.
   *
   * @schema: input schema
   * @@TODO
   */
  isWellDefined: function (schema) {
    this.validateSchema(schema);
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
