ShExWebApp = (function () {
  let shapeMap = require("shape-map")
  return Object.assign({}, {
    RdfTerm:    require('@shexjs/term'),
    Util:         require('@shexjs/util'),
    Validator:    require('@shexjs/validator'),
    Writer:    require('@shexjs/writer'),
    Api: require("@shexjs/api"),
    Parser: require("@shexjs/parser"),
    ShapeMap: shapeMap,
    ShapeMapParser: shapeMap.Parser,
    N3: require("n3")
  })
})()

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExWebApp;
