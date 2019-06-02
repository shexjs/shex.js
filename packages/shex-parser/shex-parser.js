var ShExParser = (function () {

var RdfTerm = require("@shexjs/core").RdfTerm;
var ShExJison = require('./lib/ShExJison').Parser;

// Creates a ShEx parser with the given pre-defined prefixes
var prepareParser = function (baseIRI, prefixes, schemaOptions) {
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

  function runParser () {
    // ShExJison.base = baseIRI || "";
    // ShExJison.basePath = ShExJison.base.replace(/[^\/]*$/, '');
    // ShExJison.baseRoot = ShExJison.base.match(/^(?:[a-z]+:\/*)?[^\/]*/)[0];
    ShExJison._prefixes = Object.create(prefixesCopy);
    ShExJison._imports = [];
    ShExJison._setBase(baseIRI);
    ShExJison._setFileName(baseIRI);
    ShExJison.options = schemaOptions;
    if (!ShExJison._termResolver)
      ShExJison._termResolver = termResolver;
    let errors = [];
    ShExJison.recoverable = e =>
      errors.push(e);
    let ret = null;
    try {
      ret = ShExJison.prototype.parse.apply(parser, arguments);
    } catch (e) {
      errors.push(e);
    }
    ShExJison.reset();
    errors.forEach(e => {
      const hash = e.hash;
      const location = hash.loc;
      delete hash.loc;
      Object.assign(e, hash, {location: location});
    })
    if (errors.length == 1) {
      errors[0].parsed = ret;
      throw errors[0];
    } else if (errors.length) {
      const all = new Error("" + errors.length  + " parser errors:\n" + errors.map(
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
  parser._setTermResolver = ShExJison._setTermResolver;
  parser._setOptions = function (opts) { ShExJison.options = opts; };
  parser._resetBlanks = ShExJison._resetBlanks;
  parser.reset = ShExJison.reset;
  ShExJison.options = schemaOptions;
  return parser;

  function contextError (e, lexer) {
    // use the lexer's pretty-printing
    var line = e.location.first_line;
    var col  = e.location.first_column + 1;
    var posStr = "pos" in e.hash ? "\n" + e.hash.pos : ""
    return `${baseIRI}\n line: ${line}, column: ${col}: ${e.message}${posStr}`;
  }
}

var makeDBTermResolver = function (db) {
  var _db = db;
  var _lookFor = [];
  return {
    add: function (iri) {
      _lookFor.push(iri);
    },
    resolve: function (pair, prefixes) {
      var x = _lookFor.reduce((lfacc, lf) => {
        var found1 = _db.getQuads(null, lf, '"' + pair.label.value + '"');
        if (found1.length)
          return pair.prefix === null ?
          {prefix: null, length: null, term: RdfTerm.internalTerm(found1[0].subject)}:
          found1.reduce((tripacc, triple) => {
            var s = RdfTerm.internalTerm(triple.subject);
            return Object.keys(prefixes).reduce((prefacc, prefix) => {
              var ns = prefixes[prefix];
              var sw = s.startsWith(ns);
              if (sw && ns.length > prefacc.length && pair.prefix === prefix)
                return {prefix: prefix, length: prefacc.length, term: s};
              return prefacc;
            }, tripacc);
          }, lfacc);
        else
          return lfacc;
      }, {prefix: null, length: 0, term: null});
      if (x.term)
        return x.term;
      throw Error("no term found for `" + JSON.stringify(pair) + "`");
    }
  };
}

var makeDisabledTermResolver = function () {
  return {
    add: function (iri) {
      throw Error("no term resolver to accept <" + iri + ">");
    },
    resolve: function (label, prefixes) {
      throw Error("no term resolver to resolve `" + label + "`");
    }
  };
}

return {
  construct: prepareParser,
  dbTermResolver: makeDBTermResolver,
  disabledTermResolver: makeDisabledTermResolver
};
})();

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExParser;
