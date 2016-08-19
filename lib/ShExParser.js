// stolen as much as possible from SPARQL.js
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
  ShExJison = require('./ShExJison').Parser; // node environment
  ShExUtil = require('./ShExUtil'); // node environment
} else {
  ShExJison = ShExJison.Parser; // browser environment
}

// Creates a ShEx parser with the given pre-defined prefixes
var prepareParser = function (documentIRI, prefixes, schemaOptions) {
  // Create a copy of the prefixes
  var prefixesCopy = {};
  for (var prefix in prefixes || {})
    prefixesCopy[prefix] = prefixes[prefix];

  // Create a new parser with the given prefixes
  // (Workaround for https://github.com/zaach/jison/issues/241)
  var parser = new ShExJison();

  ShExJison._setBase(documentIRI);
  ShExJison._setFileName(documentIRI);
  function runParser () {
    // ShExJison.base = documentIRI || "";
    // ShExJison.basePath = ShExJison.base.replace(/[^\/]*$/, '');
    // ShExJison.baseRoot = ShExJison.base.match(/^(?:[a-z]+:\/*)?[^\/]*/)[0];
    ShExJison._prefixes = Object.create(prefixesCopy);
    var ret;
    try {
      ret = ShExJison.prototype.parse.apply(parser, arguments);
    } catch (e) {
      // use the lexer's pretty-printing
      var lineNo = "lexer" in parser.yy ? parser.yy.lexer.yylineno + 1 : 1;
      var pos = "lexer" in parser.yy ? parser.yy.lexer.showPosition() : "";
      var t = Error(`${documentIRI}(${lineNo}): ${e.message}\n${pos}`);
      Error.captureStackTrace(t, runParser);
      throw t;
    }
    return ShExUtil.isWellDefined(ret);
  }
  parser.parse = runParser;
  parser._setBase = ShExJison._setBase;
  parser._setFileName = ShExJison._setFileName;
  parser._resetBlanks = ShExJison._resetBlanks;
  parser.reset = ShExJison.reset;
  ShExJison.options = schemaOptions || {};
  return parser;
}

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = { Parser: prepareParser }; // node environment
else
  ShExParser = prepareParser;
