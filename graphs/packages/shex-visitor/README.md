# @shexjs/visitor

[![npm version](https://img.shields.io/npm/v/@shexjs/visitor)](https://www.npmjs.com/package/@shexjs/visitor)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

Visitor pattern for traversing [ShExJ](https://shex.io/shex-semantics/#shexj) schemas

## Install

``` shell
npm install @shexjs/visitor
```

## Quick start
The default behavior is to return a copy of the passed schema:
``` sh
node -e 'console.log(JSON.stringify(new (require("@shexjs/visitor").ShExVisitor)()
  .visitSchema(
    {
      "type": "Schema",
      "shapes": [
        {
          "id": "http://a.example/S1",
          "type": "ShapeDecl",
          "shapeExpr": {
            "type": "Shape",
            "expression": {
              "type": "TripleConstraint",
              "predicate": "http://a.example/p1",
              "valueExpr": {
                "type": "NodeConstraint",
                "values": [
                  {
                    "value": "1",
                    "type": "http://www.w3.org/2001/XMLSchema#integer"
                  },
                  {
                    "value": "2",
                    "type": "http://www.w3.org/2001/XMLSchema#integer"
                  }
                ]
              }
            }
          }
        }
      ]
    }), null, 2))'
```
The result will look identical to the input schema.

## Strategy
The ShExJ format is defined in [JSG](http://shex.io/shex-semantics/index.html#shexj) or [Typescript](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/shexj/index.d.ts). The visitor API reflects both the names of the ShExJ attributes and their types. For example, by default, the `visitShapeAnd` calls `visitShapeExpr` on each of the conjuncts. Likewise, `visitTripleConstraint` calls `visitValueExpr` on the `.valueExpr` attribute, which in turn calls `visitShapeExpr` because that is the type of `.valueExpr`.

## Methods

* visitSchema(schema, ...args
* visitPrefixes(prefixes, ...args
* visitIRI(i, ...args
* visitImports(imports, ...args
* visitStartActs(startActs, ...args
* visitSemActs([semActs], ...args
* visitSemAct(semAct, label, ...args
* visitAnnotations([annotations], ...args
* TODO visitAnnotation(annotation, ...args
* visitShapes(shapes, ...args
* visitShapeDecl(decl, ...args
* visitShapeExpr(expr, ...args - calls one of the following
  * visitShapeOr(shapeExpr, ...args
  * visitShapeAnd(shapeExpr, ...args
  * visitShapeNot(expr, ...args
  * visitShapeRef(reference, ...args
  * visitShapeExternal(expr, ...args
  * visitNodeConstraint(shape, ...args
  * visitShape(shape, ...args
* visitExtra([extra], ...args
* visitExpression(expr, ...args - calls visitTripleExpr
* visitTripleExpr(expr, ...args - calls one of the following
  * visitOneOf(tripleExpr, ...args
  * visitEachOf(tripleExpr, ...args
  * visitTripleConstraint(expr, ...args
* visitValueExpr(shapeExpr, ...args
* visitValues(values, ...args
* visitValueExpr(shapeExpr, ...args
* visitStemRange(t, ...args
* visitExclusion(c, ...args
* visitInclusion(inclusion, ...args

### simple value visitors
* visitBase
* visitStart
* visitClosed
* "visit@context"
* visitInverse
* visitPredicate
* visitName
* visitId
* visitCode
* visitMin
* visitMax
* visitType
* visitNodeKind
* visitDatatype
* visitPattern
* visitFlags
* visitLength
* visitMinlength
* visitMaxlength
* visitMininclusive
* visitMinexclusive
* visitMaxinclusive
* visitMaxexclusive
* visitTotaldigits
* visitFractiondigits
* visitInclude

## index(schema)

`ShExIndexVisitor.index(schema)` creates a visitor and overrides `visitExpression` and `visitShapeExpr` to provide an index composed of two maps:
* **shapeExprs** - map from shape declaration name to definition in `schema`,
* **tripleExprs** - map from triple expression name to definition in `schema`.

---

`@shexjs/visitor` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
