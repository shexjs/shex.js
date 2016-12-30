// stolen as much as possible from SPARQL.js
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
  ShExJison = require('./ShExJison').Parser; // node environment
  ShExUtil = require('./ShExUtil'); // node environment
} else {
  ShExJison = ShExJison.Parser; // browser environment
}

// Creates a ShEx parser with the given pre-defined prefixes
var prepareParser = function (documentIRI, prefixes, schemaOptions) {
  schemaOptions = schemaOptions || {};
  // Create a copy of the prefixes
  var prefixesCopy = {};
  for (var prefix in prefixes || {})
    prefixesCopy[prefix] = prefixes[prefix];

  // Create a copy of the labelResolvers
  var termResolver = "termResolver" in schemaOptions ?
      schemaOptions.termResolver :
      makeDisabledTermResolver();

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
    if (!ShExJison._termResolver)
      ShExJison._termResolver = termResolver;
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
  parser._setTermResolver = ShExJison._setTermResolver;
  parser._setOptions = function (opts) { ShExJison.options = opts; };
  parser._resetBlanks = ShExJison._resetBlanks;
  parser.reset = ShExJison.reset;
  ShExJison.options = schemaOptions;
  return parser;
}

var makeDBTermResolver = function (db) {
  var _db = db;
  var _lookFor = [];
  return {
    add: function (iri) {
      _lookFor.push(iri);
    },
    resolve: function (label) {
      for (var i = 0; i < _lookFor.length; ++i) {
        var found = _db.find(null, _lookFor[i], label);
        if (found.length)
          return found[0].subject;
      }
      throw Error("no term found for `" + label + "`");
    }
  };
}

var makeDisabledTermResolver = function () {
  return {
    add: function (iri) {
      throw Error("no term resolver to accept <" + iri + ">");
    },
    resolve: function (label) {
      throw Error("no term resolver to resolve `" + label + "`");
    }
  };
}

var iface = {
  construct: prepareParser,
  dbTermResolver: makeDBTermResolver,
  disabledTermResolver: makeDisabledTermResolver
};

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = iface;
else
  ShExParser = iface;
