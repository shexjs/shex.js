const ShExPathCjsModule = function (schema, const_iriResolver) {
    const ShExUtil = require("@shexjs/util");
    const ShExTerm = require("@shexjs/term");

    const navigation = new Map()
    navigation.set(schema, []) // schema has no parents

    const parents = [schema]
    const visitor = ShExUtil.Visitor()

    const oldVisitExpression = visitor.visitExpression
    visitor.visitExpression = function (expr) {
      navigation.set(expr, parents.slice())
      parents.push(expr)
      let ret = oldVisitExpression.call(visitor, expr)
      parents.pop()
      return ret
    }

    const oldVisitShapeExpr = visitor.visitShapeExpr
    visitor.visitShapeExpr = function (expr, label) {
      navigation.set(expr, parents.slice())
      parents.push(expr)
      let ret = oldVisitShapeExpr.call(visitor, expr, label)
      parents.pop()
      return ret
    }

    visitor.visitSchema(schema)

    return {
      search: search
    }

    /**
     * invocation:
     *   .search("/my:path")
     *   .search("/my:path", schema.shapes[1])
     *   .search("/my:path", [schema.shapes[1]])
     */
    function search (path, context = [schema], iriResolver = const_iriResolver) {
      if (context.constructor !== Array) {
        context = [context]
      }
      if (path[0] === '/') {
        context = [schema]
        path = path.substr(1)
      }
      let m;
      let consumed = 0;
      const TESTS = "("
            + [ "ShapeOr", "ShapeAnd", "ShapeNot",
                "NodeConstraint", "Shape",
                "EachOf", "OneOf", "TripleConstraint" ].join("|")
            + ")";
      const INT = "([1-9][0-9]*)"
      const IRI = "<([^>]+)>"
      const ATTRS = "((?:\\.[a-zA-Z_][a-zA-Z_0-9]*)*)"
      const R = new RegExp(`^\\s*(@?)\\s*${TESTS}?\\s*(?:${INT}|${IRI}\\s*${INT}?)?\\s*${ATTRS}\\s*\\/?`)
      while(path && (m = path.match(R)) && m[0].length) {
        const len = m[0].length;
        path = path.substr(len);
        consumed += len;
        context = context.reduce(
          (newValue, I) => newValue.concat(attr(m[1], m[6].split(/\./).splice(1), skipAssumedAxes(I, m[2], m[3] ? parseInt(m[3]) : null, m[4], m[5]))), []
        )
      }
      if (path.length)
        throw Error("unable to parse at offset " + consumed + ": " + path)
      return context

      function skipAssumedAxes (I, axis, i, N, Ni) {
        if (i || N || axis) {
          if (I.type === "Shape" && axis !== "Shape" && "expression" in I) {
            return evaluateIndex(I.expression, axis, i, N, Ni)
          } else if (I.type === "TripleConstraint" && axis !== "TripleConstraint" && "valueExpr" in I) {
            return evaluateIndex(I.valueExpr, axis, i, N, Ni)
          }
        }
        return evaluateIndex(I, axis, i, N, Ni)
      }

      function evaluateIndex (I, axis, i, N, Ni) {
        if (axis && I.type !== axis)
          return []
        if (!i && !N)
          return [I]
        if (I.type === "Schema") {
          if (i) return [I.shapes[i-1]]
          else if ("shapes" in I && (!Ni || Ni === 1)) return [N]
        } else if (I.type === "ShapeOr" || I.type === "ShapeAnd") {
          if (i && i - 1 >= 0 && i - 1 < I.shapeExprs.length) return [I.shapeExprs[i - 1]]
        } else if (I.type === "ShapeNot") {
          if (i && i === 1) return [I.shapeExpr]
        } else if (I.type === "NodeConstraint") {
        } else if (I.type === "Shape") {
          // if ("expression" in I) return evaluateIndex(I.expression, axis, i, N, Ni)
          if (i && i === 1) return [I]
        } else if (I.type === "EachOf" || I.type === "OneOf") {
          if (i) return [I.expressions[i-1]]
          else {
            let TCs = findByPredicate(N, I)
            if (Ni) return [TCs[Ni-1]]
            else return TCs
          }
        } if (I.type === "TripleConstraint") {
          if (i && i === 1) return [I]
          else if (N === I.predicate && (!Ni || Ni === 1)) return [I]
        }
        return []
      }

      function attr (follow, As, elts) {
        const withAttrs = elts.map(
          elt => As.reduce(
            (acc, A) => typeof elt === "object" ? acc[A] : undefined, elt
          )
        ).filter(elt => elt)
        return follow ? withAttrs.map(
          elt => schema.shapes.find(se => se.id === ShExTerm.resolveRelativeIRI(iriResolver.base, elt)), []
        ).filter(elt => elt) : withAttrs
      }
    }

    // return set of triple constraints the shape expression I.expressions with a predicate of N.
    function findByPredicate (N, expression) {
      const visitor = ShExUtil.Visitor()
      let ret = []

      const oldVisitTripleConstraint = visitor.visitTripleConstraint
      visitor.visitTripleConstraint = function (expr) {
        if (expr.predicate === N)
          ret.push(expr)
        return oldVisitTripleConstraint.call(visitor, expr)
      }
      visitor.visitExpression(expression)
      return ret
    }
  }

if (typeof require !== "undefined" && typeof exports !== "undefined")
  module.exports = ShExPathCjsModule

