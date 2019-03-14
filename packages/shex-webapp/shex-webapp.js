ShExWebApp = (function () {
  let shapeMap = require("shape-map")
  return Object.assign(require("@shex/core"), {
    Loader: require("@shex/loader"),
    Parser: require("@shex/parser"),
    ShapeMap: shapeMap,
    ShapeMapParser: shapeMap.Parser,
    N3: require("n3")
  })
})()

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExWebApp;
