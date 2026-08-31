# @shexjs/parser

[![npm version](https://img.shields.io/npm/v/@shexjs/parser)](https://www.npmjs.com/package/@shexjs/parser)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

Parse [ShExC](https://shex.io/shex-semantics/#shexc), return [ShExJ](https://shex.io/shex-semantics/#shexj)

## Install

``` shell
npm install @shexjs/parser
```

## Quick start
Invoke from the command line:
``` sh
node -e 'console.log(
  JSON.stringify(require("@shexjs/parser")
    .construct()
    .parse("<http://a.example/S1> { <http://a.example/p1> [1 2] }"), null, 2)
)'
```
The result is a ShExJ expression of the input schema:
``` json
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
}
```

## Base IRI
Providing a Base IRI (see [MDN docs for URL](https://developer.mozilla.org/en-US/docs/Web/API/URL)) allows you to parse schemas with relative URLs for e.g. shape and property names:
``` sh
node -e 'console.log(
  JSON.stringify(require("@shexjs/parser")
    .construct("http://a.example/")
    .parse("<S1> { <p1> [1 2] }"), null, 2)
)'
```
``` json
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
}
```

## Pre-loaded prefixes
A second parameter to `construct` is a map for prefixes that are not defined in the schema:
``` sh
node -e 'console.log(
  JSON.stringify(require("@shexjs/parser")
    .construct("http://a.example/path/path2/", {v: "http://a.example/vocab#"})
    .parse("BASE <../path3>\nPREFIX : <#>\n<S1> { :p1 [v:v1 v:v2] }"), null, 2)
)'
```
``` json
{
  "type": "Schema",
  "shapes": [
    {
      "id": "http://a.example/path/S1",
      "type": "ShapeDecl",
      "shapeExpr": {
        "type": "Shape",
        "expression": {
          "type": "TripleConstraint",
          "predicate": "http://a.example/path/path3#p1",
          "valueExpr": {
            "type": "NodeConstraint",
            "values": [
              "http://a.example/vocab#v1",
              "http://a.example/vocab#v2"
            ]
          }
        }
      }
    }
  ]
}
```

## Index option
The third `construct` parameter is for passing parsing options. One handy one is `index`, which returns the final base (`._base`) and prefix mapping (`._prefixes`) encountered during parsing, indexes the labeled shape declarations and triple expressions (`._index`), and records where each declaration was parsed (`._locations`) — what editor tooling wants:
``` sh
node -e 'console.log(
  JSON.stringify(require("@shexjs/parser")
    .construct("http://a.example/path/path2/", {v: "http://a.example/vocab#"}, {index:true})
    .parse("BASE <../path3>\nPREFIX : <#>\n<S1> { :p1 [v:v1 v:v2] }"), null, 2)
)'
```
``` json
{
  "type": "Schema",
  "shapes": [ … as above … ],
  "_base": "http://a.example/path/path3",
  "_prefixes": {
    "": "http://a.example/path/path3#"
  },
  "_index": {
    "shapeExprs": {
      "http://a.example/path/S1": { … the ShapeDecl above … }
    },
    "tripleExprs": {}
  },
  "_sourceMap": null,
  "_locations": {
    "http://a.example/path/S1": {
      "filename": "http://a.example/path/path2/",
      "first_line": 3,
      "first_column": 0,
      "last_line": 3,
      "last_column": 24
    }
  },
  "_exprLocations": {}
}
```

---

`@shexjs/parser` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
