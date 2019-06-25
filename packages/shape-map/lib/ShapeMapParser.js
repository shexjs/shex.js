var ShapeMapParser = (function () {

// stolen as much as possible from SPARQL.js
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
  ShapeMapJison = require('./ShapeMapJison').Parser; // node environment
} else {
  ShapeMapJison = ShapeMapJison.Parser; // browser environment
}

// Creates a ShEx parser with the given pre-defined prefixes
var prepareParser = function (baseIRI, schemaMeta, dataMeta) {
  // Create a copy of the prefixes
  var schemaBase = schemaMeta.base;
  var schemaPrefixesCopy = {};
  for (var prefix in schemaMeta.prefixes || {})
    schemaPrefixesCopy[prefix] = schemaMeta.prefixes[prefix];
  var dataBase = dataMeta.base;
  var dataPrefixesCopy = {};
  for (var prefix in dataMeta.prefixes || {})
    dataPrefixesCopy[prefix] = dataMeta.prefixes[prefix];

  // Create a new parser with the given prefixes
  // (Workaround for https://github.com/zaach/jison/issues/241)
  var parser = new ShapeMapJison();

  function runParser () {
    ShapeMapJison._schemaPrefixes = Object.create(schemaPrefixesCopy);
    ShapeMapJison._setSchemaBase(schemaBase);
    ShapeMapJison._dataPrefixes = Object.create(dataPrefixesCopy);
    ShapeMapJison._setDataBase(dataBase);
    ShapeMapJison._setFileName(baseIRI);
    try {
      return ShapeMapJison.prototype.parse.apply(parser, arguments);
    } catch (e) {
      // use the lexer's pretty-printing
      var lineNo = "lexer" in parser.yy ? parser.yy.lexer.yylineno + 1 : 1;
      var pos = "lexer" in parser.yy ? parser.yy.lexer.showPosition() : "";
      var t = Error(`${baseIRI}(${lineNo}): ${e.message}\n${pos}`);
      Error.captureStackTrace(t, runParser);
      parser.reset();
      throw t;
    }
  }
  parser.parse = runParser;
  parser._setSchemaBase = function (base) {
    ShapeMapJison._setSchemaBase;
    schemaBase = base;
  }
  parser._setDataBase = function (base) {
    ShapeMapJison._setDataBase;
    dataBase = base;
  }
  parser._setFileName = ShapeMapJison._setFileName;
  parser.reset = ShapeMapJison.reset;
  return parser;
}

return {
  construct: prepareParser
};
})();

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShapeMapParser;
