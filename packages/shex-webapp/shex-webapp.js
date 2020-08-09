ShExWebApp = (function () {
  let shapeMap = require("shape-map")
  return Object.assign(require("@shexjs/core"), {
    Loader: require("@shexjs/loader"),
    Parser: require("@shexjs/parser"),
    ShapeMap: shapeMap,
    ShapeMapParser: shapeMap.Parser,
    N3: require("n3"),
    Extensions: {
      test: require("@shexjs/extension-test"),
      js: require("@shexjs/extension-js"),
    }
  })
})()

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExWebApp;
