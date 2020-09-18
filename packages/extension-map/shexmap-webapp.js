ShExWebApp = (function () {
  const shapeMap = require("shape-map")
  return Object.assign({}, {
    ShExTerm:       require('@shexjs/term'),
    Util:           require('@shexjs/util'),
    Validator:      require('@shexjs/validator'),
    Writer:         require('@shexjs/writer'),
    Api:            require("@shexjs/api"),
    Parser:         require("@shexjs/parser"),
    ShapeMap:       shapeMap,
    ShapeMapParser: shapeMap.Parser,

    Map:            require("@shexjs/extension-map"),
  })
})()

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExWebApp;
