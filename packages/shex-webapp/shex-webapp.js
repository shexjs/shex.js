ShExWebApp = (function () {
  let shapeMap = require("shape-map")
  return Object.assign({}, {
    ShExTerm:       require('@shexjs/term'),
    Util:           require('@shexjs/util'),
    Validator:      require('@shexjs/validator'),
    Writer:         require('@shexjs/writer'),
    Api:            require("@shexjs/api"),
    Parser:         require("@shexjs/parser"),
    ShapeMap:       shapeMap,
    ShapeMapParser: shapeMap.Parser,
    DcTap:          require("dctap").DcTap,
  })
})()

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExWebApp;
