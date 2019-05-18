var ShExParser = (function () {

// stolen as much as possible from SPARQL.js
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
  ShExJison = require('./lib/ShExJison').Parser; // node environment
} else {
  ShExJison = ShExJison.Parser; // browser environment
}

// Creates a ShEx parser with the given pre-defined prefixes
var prepareParser = function (baseIRI, prefixes, schemaOptions) {
  schemaOptions = schemaOptions || {};
  // Create a copy of the prefixes
  var prefixesCopy = {};
  for (var prefix in prefixes || {})
    prefixesCopy[prefix] = prefixes[prefix];

  // Create a new parser with the given prefixes
  // (Workaround for https://github.com/zaach/jison/issues/241)
  var parser = new ShExJison();

  function runParser () {
    // ShExJison.base = baseIRI || "";
    // ShExJison.basePath = ShExJison.base.replace(/[^\/]*$/, '');
    // ShExJison.baseRoot = ShExJison.base.match(/^(?:[a-z]+:\/*)?[^\/]*/)[0];
    ShExJison._prefixes = Object.create(prefixesCopy);
    ShExJison._imports = [];
    ShExJison._setBase(baseIRI);
    ShExJison._setFileName(baseIRI);
    ShExJison.options = schemaOptions;
    try {
      return ShExJison.prototype.parse.apply(parser, arguments);
    } catch (e) {
      // use the lexer's pretty-printing
      var lineNo = "lexer" in parser.yy ? parser.yy.lexer.yylineno + 1 : 1;
      var pos = "lexer" in parser.yy ? parser.yy.lexer.showPosition() : "";
      var t = Error(`${baseIRI}(${lineNo}): ${e.message}\n${pos}`);
      t.lineNo = lineNo;
      t.context = pos;
      if ("lexer" in parser.yy) {
        parser.yy.lexer.matched = parser.yy.lexer.matched || "";
        t.offset = parser.yy.lexer.matched.length;
        t.width = parser.yy.lexer.match.length
        t.lloc = parser.yy.lexer.yylloc;
      } else {
        // Failed before the Jison call to `yy.parser.yy = { lexer: yy.lexer}`
        t.offset = t.width = t.lloc = 0;
      }
      Error.captureStackTrace(t, runParser);
      parser.reset();
      throw t;
    }
  }
  parser.parse = runParser;
  parser._setBase = function (base) {
    ShExJison._setBase;
    baseIRI = base;
  }
  parser._setFileName = ShExJison._setFileName;
  parser._setOptions = function (opts) { ShExJison.options = opts; };
  parser._resetBlanks = ShExJison._resetBlanks;
  parser.reset = ShExJison.reset;
  ShExJison.options = schemaOptions;
  return parser;
}

return {
  construct: prepareParser
};
})();

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExParser;
