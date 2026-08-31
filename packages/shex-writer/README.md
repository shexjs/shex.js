# @shexjs/writer

[![npm version](https://img.shields.io/npm/v/@shexjs/writer)](https://www.npmjs.com/package/@shexjs/writer)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

Write [ShExJ](https://shex.io/shex-semantics/#shexj) as [ShExC](https://shex.io/shex-semantics/#shexc)

## Install

``` shell
npm install @shexjs/writer
```

## Quick start
Invoke from the command line:
``` sh
node -e 'new (require("@shexjs/writer"))()
  .writeSchema(
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
    },
    (error, text, prefixes) => {
      if (error)
        throw error;
      console.log(text);
    })'
```
The result is the ShExC serialization of the input schema:
``` shex
<http://a.example/S1> {
  <http://a.example/p1> [1 2]
}
```

## option: base - Base IRI for terse relative URLs
Providing a Base IRI (see [MDN docs for URL](https://developer.mozilla.org/en-US/docs/Web/API/URL)) allows you to parse schemas with relative URLs for e.g. shape and property names:
``` sh
node -e 'new (require("@shexjs/writer"))({
    base: "http://a.example/"
  })
  .writeSchema(
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
    },
    (error, text, prefixes) => {
      if (error)
        throw error;
      console.log(text);
    })'
```
``` shex
BASE <http://a.example/>
<S1> {
  <p1> [1 2]
}
```

## option: prefixes - Pre-loaded namespace prefixes
A second parameter to `construct` is a map for prefixes that are not defined in the schema:
``` sh
node -e 'new (require("@shexjs/writer"))({
    base: "http://a.example/",
    prefixes: {
      "": "http://a.example/path/path3#",
      v: "http://a.example/vocab#"
    }
  })
  .writeSchema(
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
    },
    (error, text, prefixes) => {
      if (error)
        throw error;
      console.log(text);
    })'
```
``` shex
PREFIX : <http://a.example/path/path3#>
PREFIX v: <http://a.example/vocab#>

BASE <http://a.example/>
<path/S1> {
  :p1 [v:v1 v:v2]
}
```

## option: simplifyParentheses
`simplifyParentheses: true` eliminates ()s to the degree possible using the ShExC parsing precedence rules. For example, a ()'d EachOf expression:

``` shex
<S1> {
(    <p1> . ;
     <p2> @<S2>?)
}
```
will be serialized without the ()s:
``` shex
<S1> {
    <p1> . ;
    <p2> @<S2>?
}
```

---

`@shexjs/writer` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
