ShExWebApp = (function () {
  let shapeMap = require("shape-map")
  return Object.assign(require("@shexjs/core"), {
    Loader: require("@shexjs/loader"),
    Parser: require("@shexjs/parser"),
    ShapeMap: shapeMap,
    ShapeMapParser: shapeMap.Parser,
    N3: require("n3")
  })
})()

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExWebApp;
