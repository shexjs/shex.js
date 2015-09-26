if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
  ShExJison = require('./ShExJison').Parser; // node environment
  ShExUtil = require('./ShExUtil'); // node environment
} else {
  ShExJison = ShExJison.Parser; // browser environment
}

// Creates a ShEx parser with the given pre-defined prefixes
var prepareParser = function (documentIRI, prefixes) {
  // Create a copy of the prefixes
  var prefixesCopy = {};
  for (var prefix in prefixes || {})
    prefixesCopy[prefix] = prefixes[prefix];

  // Create a new parser with the given prefixes
  // (Workaround for https://github.com/zaach/jison/issues/241)
  var parser = new ShExJison();
  parser.parse = function () {
    ShExJison.base = documentIRI || "";
    ShExJison.basePath = ShExJison.base.replace(/[^\/]*$/, '');
    ShExJison.baseRoot = ShExJison.base.match(/^(?:[a-z]+:\/*)?[^\/]*/)[0];
    ShExJison.prefixes = Object.create(prefixesCopy);
    return ShExUtil.isWellDefined(ShExJison.prototype.parse.apply(parser, arguments));
  };
  parser._resetBlanks = ShExJison._resetBlanks;
  parser.reset = ShExJison.reset;
  return parser;
}

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = { Parser: prepareParser }; // node environment
else
  ShExParser = prepareParser;
