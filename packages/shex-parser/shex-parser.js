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
    let errors = [];
    ShExJison.recoverable = e => errors.push(e);
    let ret = null;
    try {
      ret = ShExJison.prototype.parse.apply(parser, arguments);
    } catch (e) {
      throw contextError(e, parser.yy.lexer);
    }
    ShExJison.reset();
    if (errors.length == 1) {
      let e = contextError(errors[0], parser.yy.lexer);
      e.parsed = ret;
      throw e;
    } else if (errors.length) {
      const all = new Error("" + errors.length  + "parser errors:\n" + errors.map(
        e => contextError(e, parser.yy.lexer)
      ).join("\n"));
      all.errors = errors;
      all.parsed = ret;
      throw all;
    } else {
      return ret;
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

  function contextError (e, lexer) {
    // use the lexer's pretty-printing
    var lineNo = e.hash.loc.first_line + 1;
    var t = Error(`${baseIRI}(${lineNo}): ${e.message}\n${e.hash.pos}`);
    t.lineNo = lineNo;
    t.context = e.hash.pos;
    lexer.matched = lexer.matched || "";
    t.offset = lexer.matched.length;
    t.width = lexer.match.length;
    t.lloc = e.hash.loc;
    Error.captureStackTrace(t, runParser);
    parser.reset();
    return t;
  }
}

return {
  construct: prepareParser
};
})();

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExParser;
