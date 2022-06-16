ShExWebApp = (function () {
  let shapeMap = require("shape-map")
  return Object.assign({}, {
    ShExTerm:             require('@shexjs/term'),
    Util:                 require('@shexjs/util'),
    Validator:            require('@shexjs/validator'),
    Writer:               require('@shexjs/writer'),
    Api:                  require("@shexjs/api"),
    Parser:               require("@shexjs/parser"),
    "eval-simple-1err":   require("@shexjs/eval-simple-1err"),
    "eval-threaded-nerr": require("@shexjs/eval-threaded-nerr"),
    ShapeMap:             shapeMap,
    ShapeMapParser:       shapeMap.Parser,
    DcTap:                require("dctap").DcTap,
  })
})()

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExWebApp;
