
function ShExVisitor (...ctor_args) {
  this.ctor_args = ctor_args;

    function isTerm (t) {
      return typeof t !== "object" || "value" in t && Object.keys(t).reduce((r, k) => {
        return r === false ? r : ["value", "type", "language"].indexOf(k) !== -1;
      }, true);
    }

  function isShapeRef (expr) {
    return typeof expr === "string" // test for JSON-LD @ID
  }
  let isInclusion = isShapeRef;

  // function expect (l, r) { const ls = JSON.stringify(l), rs = JSON.stringify(r); if (ls !== rs) throw Error(ls+" !== "+rs); }
  const _ShExUtil = this;
  function visitMap (map, val) {
    const ret = {};
    Object.keys(map).forEach(function (item) {
      ret[item] = val(map[item]);
    });
    return ret;
  }
  const r = {
    runtimeError: function (e) {
      throw e;
    },

    visitSchema: function (schema, ...args) {
      const ret = { type: "Schema" };
      this._expect(schema, "type", "Schema");
      this._maybeSet(schema, ret, "Schema",
                     ["@context", "prefixes", "base", "imports", "startActs", "start", "shapes"],
                     ["_base", "_prefixes", "_index", "_sourceMap"],
                     ...args
                    );
      return ret;
    },

    visitPrefixes: function (prefixes, ...args) {
      return prefixes === undefined ?
        undefined :
        visitMap(prefixes, function (val) {
          return val;
        });
    },

    visitIRI: function (i, ...args) {
      return i;
    },

    visitImports: function (imports, ...args) {
      const _Visitor = this;
      return imports.map(function (imp) {
        return _Visitor.visitIRI(imp, args);
      });
    },

    visitStartActs: function (startActs, ...args) {
      const _Visitor = this;
      return startActs === undefined ?
        undefined :
        startActs.map(function (act) {
          return _Visitor.visitSemAct(act, ...args);
        });
    },
    visitSemActs: function (semActs, ...args) {
      const _Visitor = this;
      if (semActs === undefined)
        return undefined;
      const ret = []
      Object.keys(semActs).forEach(function (label) {
        ret.push(_Visitor.visitSemAct(semActs[label], label, ...args));
      });
      return ret;
    },
    visitSemAct: function (semAct, label, ...args) {
      const ret = { type: "SemAct" };
      this._expect(semAct, "type", "SemAct");

      this._maybeSet(semAct, ret, "SemAct",
                     ["name", "code"], null, ...args);
      return ret;
    },

    visitShapes: function (shapes, ...args) {
      const _Visitor = this;
      if (shapes === undefined)
        return undefined;
      return shapes.map(
        shapeExpr =>
          _Visitor.visitShapeDecl(shapeExpr, ...args)
      );
    },

    visitShapeDecl: function (decl, ...args) {
      return this._maybeSet(decl, { type: "ShapeDecl" }, "ShapeDecl",
                            ["id", "abstract", "restricts", "shapeExpr"], null, ...args);
    },

    visitShapeExpr: function (expr, ...args) {
      if (isShapeRef(expr))
        return this.visitShapeRef(expr, ...args)
      switch (expr.type) {
      case "Shape": return this.visitShape(expr, ...args);
      case "NodeConstraint": return this.visitNodeConstraint(expr, ...args);
      case "ShapeAnd": return this.visitShapeAnd(expr, ...args);
      case "ShapeOr": return this.visitShapeOr(expr, ...args);
      case "ShapeNot": return this.visitShapeNot(expr, ...args);
      case "ShapeExternal": return this.visitShapeExternal(expr, ...args);
      default:
        throw Error("unexpected shapeExpr type: " + expr.type);
      }
    },

    visitValueExpr: function (expr, ...args) {
      return this.visitShapeExpr(expr, ...args); // call potentially overloaded visitShapeExpr
    },

    // _visitShapeGroup: visit a grouping expression (shapeAnd, shapeOr)
    _visitShapeGroup: function (expr, ...args) {
      this._testUnknownAttributes(expr, ["id", "shapeExprs"], expr.type, this.visitShapeNot)
      const _Visitor = this;
      const r = { type: expr.type };
      if ("id" in expr)
        r.id = expr.id;
      r.shapeExprs = expr.shapeExprs.map(function (nested) {
        return _Visitor.visitShapeExpr(nested, ...args);
      });
      return r;
    },

    // _visitShapeNot: visit negated shape
    visitShapeNot: function (expr, ...args) {
      this._testUnknownAttributes(expr, ["id", "shapeExpr"], "ShapeNot", this.visitShapeNot)
      const r = { type: expr.type };
      if ("id" in expr)
        r.id = expr.id;
      r.shapeExpr = this.visitShapeExpr(expr.shapeExpr, ...args);
      return r;
    },

    // ### `visitNodeConstraint` deep-copies the structure of a shape
    visitShape: function (shape, ...args) {
      const ret = { type: "Shape" };
      this._expect(shape, "type", "Shape");

      this._maybeSet(shape, ret, "Shape",
                     [ "id",
                       "abstract", "extends",
                       "closed",
                       "expression", "extra", "semActs", "annotations"], null, ...args);
      return ret;
    },

    _visitShapeExprList: function (ext, ...args) {
      const _Visitor = this;
      return ext.map(function (t) {
        return _Visitor.visitShapeExpr(t, ...args);
      });
    },

    // ### `visitNodeConstraint` deep-copies the structure of a shape
    visitNodeConstraint: function (shape, ...args) {
      const ret = { type: "NodeConstraint" };
      this._expect(shape, "type", "NodeConstraint");

      this._maybeSet(shape, ret, "NodeConstraint",
                     [ "id",
                       "nodeKind", "datatype", "pattern", "flags", "length",
                       "reference", "minlength", "maxlength",
                       "mininclusive", "minexclusive", "maxinclusive", "maxexclusive",
                       "totaldigits", "fractiondigits", "values", "annotations", "semActs"], null, ...args);
      return ret;
    },

    visitShapeRef: function (reference, ...args) {
      if (typeof reference !== "string") {
        let ex = Exception("visitShapeRef expected a string, not " + JSON.stringify(reference));
        console.warn(ex);
        throw ex;
      }
      return reference;
    },

    visitShapeExternal: function (expr, ...args) {
      this._testUnknownAttributes(expr, ["id"], "ShapeExternal", this.visitShapeNot)
      return Object.assign("id" in expr ? { id: expr.id } : {}, { type: "ShapeExternal" });
    },

    // _visitGroup: visit a grouping expression (someOf or eachOf)
    _visitGroup: function (expr, type, ...args) {
      const _Visitor = this;
      const r = Object.assign(
        // pre-declare an id so it sorts to the top
        "id" in expr ? { id: null } : { },
        { type: expr.type }
      );
      r.expressions = expr.expressions.map(function (nested) {
        return _Visitor.visitExpression(nested, ...args);
      });
      return this._maybeSet(expr, r, "expr",
                            ["id", "min", "max", "annotations", "semActs"], ["expressions"], ...args);
    },

    visitTripleConstraint: function (expr, ...args) {
      return this._maybeSet(expr,
                            Object.assign(
                              // pre-declare an id so it sorts to the top
                              "id" in expr ? { id: null } : { },
                              { type: "TripleConstraint" }
                            ),
                            "TripleConstraint",
                            ["id", "inverse", "predicate", "valueExpr",
                             "min", "max", "annotations", "semActs"], null, ...args)
    },

    visitTripleExpr: function (expr, ...args) {
      if (typeof expr === "string")
        return this.visitInclusion(expr);
      switch (expr.type) {
      case "TripleConstraint": return this.visitTripleConstraint(expr, ...args);
      case "OneOf": return this.visitOneOf(expr, ...args);
      case "EachOf": return this.visitEachOf(expr, ...args);
      default:
        throw Error("unexpected expression type: " + expr.type);
      }
    },

    visitExpression: function (expr, ...args) {
      return this.visitTripleExpr(expr, ...args); // call potentially overloaded visitTripleExpr
    },

    visitValues: function (values, ...args) {
      const _Visitor = this;
      return values.map(function (t) {
        return isTerm(t) || t.type === "Language" ?
          t :
          _Visitor.visitStemRange(t, ...args);
      });
    },

    visitStemRange: function (t, ...args) {
      const _Visitor = this; // console.log(Error(t.type).stack);
      // this._expect(t, "type", "IriStemRange");
      if (!("type" in t))
        _Visitor.runtimeError(Error("expected "+JSON.stringify(t)+" to have a 'type' attribute."));
      const stemRangeTypes = ["IriStem", "LiteralStem", "LanguageStem", "IriStemRange", "LiteralStemRange", "LanguageStemRange"];
      if (stemRangeTypes.indexOf(t.type) === -1)
        _Visitor.runtimeError(Error("expected type attribute '"+t.type+"' to be in '"+stemRangeTypes+"'."));
      let stem;
      if (isTerm(t)) {
        this._expect(t.stem, "type", "Wildcard");
        stem = { type: t.type, stem: { type: "Wildcard" } };
      } else {
        stem = { type: t.type, stem: t.stem };
      }
      if (t.exclusions) {
        stem.exclusions = t.exclusions.map(function (c) {
          return _Visitor.visitExclusion(c, ...args);
        });
      }
      return stem;
    },

    visitExclusion: function (c, ...args) {
      if (!isTerm(c)) {
        // this._expect(c, "type", "IriStem");
        if (!("type" in c))
          _Visitor.runtimeError(Error("expected "+JSON.stringify(c)+" to have a 'type' attribute."));
        const stemTypes = ["IriStem", "LiteralStem", "LanguageStem"];
        if (stemTypes.indexOf(c.type) === -1)
          _Visitor.runtimeError(Error("expected type attribute '"+c.type+"' to be in '"+stemTypes+"'."));
        return { type: c.type, stem: c.stem };
      } else {
        return c;
      }
    },

    visitInclusion: function (inclusion, ...args) {
      if (typeof inclusion !== "string") {
        let ex = Exception("visitInclusion expected a string, not " + JSON.stringify(inclusion));
        console.warn(ex);
        throw ex;
      }
      return inclusion;
    },

    _maybeSet: function (obj, ret, context, members, ignore, ...args) {
      const _Visitor = this;
      this._testUnknownAttributes(obj, ignore ? members.concat(ignore) : members, context, this._maybeSet)
      members.forEach(function (member) {
        const methodName = "visit" + member.charAt(0).toUpperCase() + member.slice(1);
        if (member in obj) {
          const f = _Visitor[methodName];
          if (typeof f !== "function") {
            throw Error(methodName + " not found in Visitor");
          }
          const t = f.call(_Visitor, obj[member], ...args);
          if (t !== undefined) {
            ret[member] = t;
          }
        }
      });
      return ret;
    },
    _visitValue: function (v, ...args) {
      return v;
    },
    _visitList: function (l, ...args) {
      return l.slice();
    },
    _testUnknownAttributes: function (obj, expected, context, captureFrame) {
      const unknownMembers = Object.keys(obj).reduce(function (ret, k) {
        return k !== "type" && expected.indexOf(k) === -1 ? ret.concat(k) : ret;
      }, []);
      if (unknownMembers.length > 0) {
        const e = Error("unknown propert" + (unknownMembers.length > 1 ? "ies" : "y") + ": " +
                      unknownMembers.map(function (p) {
                        return "\"" + p + "\"";
                      }).join(",") +
                      " in " + context + ": " + JSON.stringify(obj));
        Error.captureStackTrace(e, captureFrame);
        throw e;
      }
    },
    _expect: function (o, p, v) {
      if (!(p in o))
        this.runtimeError(Error("expected "+JSON.stringify(o)+" to have a ."+p));
      if (arguments.length > 2 && o[p] !== v)
        this.runtimeError(Error("expected "+o[p]+" to equal "+v));
    },
  };

  r.visitBase = r.visitStart = r.visitClosed = r["visit@context"] = r._visitValue;
  r.visitRestricts = r.visitExtends = r._visitShapeExprList;
  r.visitExtra = r.visitAnnotations = r._visitList;
  r.visitAbstract = r.visitInverse = r.visitPredicate = r._visitValue;
  r.visitName = r.visitId = r.visitCode = r.visitMin = r.visitMax = r._visitValue;

  r.visitType = r.visitNodeKind = r.visitDatatype = r.visitPattern = r.visitFlags = r.visitLength = r.visitMinlength = r.visitMaxlength = r.visitMininclusive = r.visitMinexclusive = r.visitMaxinclusive = r.visitMaxexclusive = r.visitTotaldigits = r.visitFractiondigits = r._visitValue;
  r.visitOneOf = r.visitEachOf = r._visitGroup;
  r.visitShapeAnd = r.visitShapeOr = r._visitShapeGroup;
  r.visitInclude = r._visitValue;
  return r;

  // Expect property p with value v in object o
}

// The ShEx Vistor is here to minimize deps for ShExValidator.
/** create indexes for schema
 */
ShExVisitor.index = function (schema) {
  let index = {
    shapeExprs: {},
    tripleExprs: {}
  };
  let v = ShExVisitor();

  let oldVisitExpression = v.visitTripleExpr;
  v.visitTripleExpr = function (expression, ...args) {
    if (typeof expression === "object" && "id" in expression)
      index.tripleExprs[expression.id] = expression;
    return oldVisitExpression.call(v, expression, ...args);
  };

  let oldVisitShapeDecl = v.visitShapeDecl;
  v.visitShapeDecl = function (shapeExpr, ...args) {
    if (typeof shapeExpr === "object" && "id" in shapeExpr)
      index.shapeExprs[shapeExpr.id] = shapeExpr;
    return oldVisitShapeDecl.call(v, shapeExpr, ...args);
  };

  v.visitSchema(schema);
  return index;
}

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExVisitor;

