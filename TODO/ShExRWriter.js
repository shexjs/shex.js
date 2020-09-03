// **ShExRWriter** writes ShExR documents.

var ShExRWriter = (function () {
var util = require('util');
var URL = require('url');
var Path = require('path');
var UNBOUNDED = -1;
var TAB = '    ';
let SX = "http://www.w3.org/ns/shex#"
let XSD = "http://www.w3.org/2001/XMLSchema#"

// Matches a literal as represented in memory by the ShEx library
var ShExLiteralMatcher = /^"([^]*)"(?:\^\^(.+)|@([\-a-z]+))?$/i;

// rdf:type predicate (for 'a' abbreviation)
var RDF_PREFIX = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    RDF_TYPE   = RDF_PREFIX + 'type';

// Characters in literals that require escaping
var ESCAPE_1 = /["\\\t\n\r\b\f\u0000-\u0019\ud800-\udbff]/,
    ESCAPE_g = /["\\\t\n\r\b\f\u0000-\u0019]|[\ud800-\udbff][\udc00-\udfff]/g,
    ESCAPE_replacements = { '\\': '\\\\', '"': '\\"', '/': '\\/', '\t': '\\t',
                            '\n': '\\n', '\r': '\\r', '\b': '\\b', '\f': '\\f' };

var nodeKinds = {
  'iri': "IRI",
  'bnode': "BNODE",
  'literal': "LITERAL",
  'nonliteral': "NONLITERAL"
};
var nonLitNodeKinds = {
  'iri': "IRI",
  'bnode': "BNODE",
  'literal': "LITERAL",
  'nonliteral': "NONLITERAL"
};

// ## Constructor
function ShExRWriter (outputStream, options) {
  if (!(this instanceof ShExRWriter))
    return new ShExRWriter(outputStream, options);

  // Shift arguments if the first argument is not a stream
  if (outputStream && typeof outputStream.write !== 'function')
    options = outputStream, outputStream = null;
  options = options || {};
  if ("base" in options)
    this._base = options.base;
  if (!('prefixes' in options)) {
    options.prefixes = {
      "sx": "http://www.w3.org/ns/shex#",
      "xsd": "http://www.w3.org/2001/XMLSchema#"
    };
  }

  var reversePrefixes = Object.entries(options.prefixes).reduce((obj, keyval) => {
    let [key, val] = keyval
    obj[val] = key
    return obj
  }, {})

  // If no output stream given, send the output as string through the end callback
  if (!outputStream) {
    var output = '';
    this._outputStream = {
      write: function (chunk, encoding, done) { output += chunk; done && done(); },
      end:   function (done) { done && done(null, output); },
    };
    this._endStream = true;
  }
  else {
    this._outputStream = outputStream;
    this._endStream = options.end === undefined ? true : !!options.end;
  }

  // Initialize writer, depending on the format
  this._prefixIRIs = Object.create(null);
  options.prefixes && this.addPrefixes(options.prefixes);

  this._error = options.error || _throwError;
  this._expect = options.lax ? noop : expect;
  this._options = options
}

ShExRWriter.prototype = {
  // ## Private methods

  // ### `_write` writes the argument to the output stream
  _write: function (string, callback) {
    this._outputStream.write(string, 'utf8', callback);
  },

  // ### `_writeSchema` writes the shape to the output stream
  _writeSchema: function (schema, done) {
    var _ShExRWriter = this;
    this._expect(schema, "type", "Schema");
    _ShExRWriter.addPrefixes(schema.prefixes);
    if (schema.base)
      _ShExRWriter._write("BASE " + this._encodeIriOrBlankNode(schema.base) + "\n");

    _ShExRWriter._write("[] a " + this._encodeIriOrBlankNode(SX + "Schema"));
    let lead = '    ';

    if (schema.imports) {
      _ShExRWriter._write(" ;\n" + lead + _ShExRWriter._encodeIriOrBlankNode(SX + "imports") + " (" + 
                         schema.imports
                         .map(imp => _ShExRWriter._encodeIriOrBlankNode(imp))
                         .join(' ') + ")"
                        );
    }
    if (schema.startActs)
      schema.startActs.forEach(function (act) {
        _ShExRWriter._expect(act, "type", "SemAct");
        _ShExRWriter._write(" %"+
                           _ShExRWriter._encodePredicate(act.name)+
                           ("code" in act ? "{"+escapeCode(act.code)+"%"+"}" : "%"));
      });
    if (schema.start)
      _ShExRWriter._write("start = " + _ShExRWriter._writeShapeExpr(schema.start, done, '').join('') + "\n")
    if ("shapes" in schema) {
      _ShExRWriter._write(" ;\n" + lead + _ShExRWriter._encodeIriOrBlankNode(SX + "shapes") + " " + 
                         Object.keys(schema.shapes)
                         .map(label => _ShExRWriter._encodeIriOrBlankNode(label))
                         .join(', ')
                        );
      _ShExRWriter._write(" .\n");
      Object.keys(schema.shapes).forEach(function (label) {
        var shapeExpr = schema.shapes[label];
        _ShExRWriter._write("\n" + _ShExRWriter._encodeShapeName(label, false));
        var lead = "";
        _ShExRWriter._write(
          _ShExRWriter._writeShapeExpr(shapeExpr, done, lead + TAB).join(""),
          done
        );
        _ShExRWriter._write(" .\n");
      })
    }
  },

  _writeShapeExpr: function (shapeExpr, done, lead) {
    var _ShExRWriter = this;
    var pieces = [];
    if (shapeExpr.type === "ShapeRef")
      pieces.push("@", _ShExRWriter._encodeShapeName(shapeExpr.reference));
    // !!! []s for precedence!
    else if (shapeExpr.type === "ShapeExternal")
      pieces.push("EXTERNAL");
    else if (shapeExpr.type === "ShapeAnd") {
      pieces.push(" a " + _ShExRWriter._encodeIriOrBlankNode(SX + "ShapeAnd"));
      pieces.push(" ;\n" + lead + _ShExRWriter._encodeIriOrBlankNode(SX + "shapeExprs") + " (");
      shapeExpr.shapeExprs.forEach(function (expr, ord) {
        pieces.push("\n"+lead+TAB+"[ ");
        pieces = pieces.concat(_ShExRWriter._writeShapeExpr(expr, done, lead+TAB));
        pieces.push("\n"+lead+TAB+"]");
      });
      pieces.push("\n" + lead + ")");
    } else if (shapeExpr.type === "ShapeOr") {
      shapeExpr.shapeExprs.forEach(function (expr, ord) {
        if (ord > 0)
          pieces.push(" OR ");
        pieces = pieces.concat(_ShExRWriter._writeShapeExpr(expr, done, lead));
      });
    } else if (shapeExpr.type === "ShapeNot") {
      pieces.push("NOT ");
      pieces = pieces.concat(_ShExRWriter._writeShapeExpr(shapeExpr.shapeExpr, done, lead));
    } else if (shapeExpr.type === "Shape") {
      pieces = pieces.concat(_ShExRWriter._writeShape(shapeExpr, done, lead));
    } else if (shapeExpr.type === "NodeConstraint") {
      pieces = pieces.concat(_ShExRWriter._writeNodeConstraint(shapeExpr, done, lead));
    } else
      throw Error("expected Shape{,And,Or,Ref} or NodeConstraint in " + util.inspect(shapeExpr));
    return pieces;
  },

  // ### `_writeshape` writes the shape to the output stream
  _writeShape: function (shape, done, lead) {
    var _ShExRWriter = this;
    try {
      var pieces = []; // guessing push/join is faster than concat
      this._expect(shape, "type", "Shape");

      pieces.push("a " + _ShExRWriter._encodeIriOrBlankNode(SX + "Shape"));
      var origLead = lead;
      lead = lead + TAB;
      if (shape.closed) pieces.push("CLOSED ");

      if (shape.extra && shape.extra.length > 0) {
        pieces.push("EXTRA ");
        shape.extra.forEach(function (i, ord) {
          pieces.push(_ShExRWriter._encodeShapeName(i, false)+" ");
        });
        pieces.push(" ");
      }
      var empties = ["values", "length", "minlength", "maxlength", "pattern", "flags"];
      // pieces.push("");

      function _writeShapeActions (semActs) {
        if (!semActs)
          return;

        semActs.forEach(function (act) {
          _ShExRWriter._expect(act, "type", "SemAct");
          pieces.push(" %",
                      _ShExRWriter._encodePredicate(act.name),
                      ("code" in act ? "{"+escapeCode(act.code)+"%"+"}" : "%"));
        });
      }

      function _writeCardinality (min, max, lead) {
        if (min === 1 && max === 1)
          return;
        pieces.push(";\n" + lead + _ShExRWriter._encodeIriOrBlankNode(SX + "min") + " " + min)
        pieces.push(";\n" + lead + _ShExRWriter._encodeIriOrBlankNode(SX + "max") + " " + (
          max === UNBOUNDED ? "-1" : max
        ))
      }

      function _writeExpression (expr, lead) {
        function _writeScopedShapeExpression (scopedShapeExpr) {
          if (scopedShapeExpr) {
            pieces.push(" ON SHAPE EXPRESSION\n");
            pieces = pieces.concat(
              _ShExRWriter._writeShapeExpr(scopedShapeExpr, done, lead+TAB).map(
                line => lead + TAB + line
              )
            )
          }
        }

        function _writeExpressionActions (semActs) {
          if (semActs) {

            semActs.forEach(function (act) {
              _ShExRWriter._expect(act, "type", "SemAct");
              pieces.push("\n"+lead+"   %");
              pieces.push(_ShExRWriter._encodeValue(act.name));
              if ("code" in act)
                pieces.push("{"+escapeCode(act.code)+"%"+"}");
              else
                pieces.push("%");
            });
          }
        }

        function _exprGroup (exprs, separator, lead) {
          pieces.push(';\n' + lead + _ShExRWriter._encodeIriOrBlankNode(SX + "expressions") + " (");
          exprs.forEach(function (nested, ord) {
            _writeExpression(nested, lead+TAB)
            if (ord < exprs.length - 1)
              pieces.push(separator);
          });
          pieces.push(');\n');
        }

        if ("id" in expr) {
          pieces.push("$");
          pieces.push(_ShExRWriter._encodeIriOrBlankNode(expr.id, true));
        } else {
          pieces.push(' [')
        }

        if (expr.type === "TripleConstraint") {
          pieces.push(' a ' + _ShExRWriter._encodeIriOrBlankNode(SX + "TripleConstraint"));
          if (expr.inverse)
            pieces.push("^");
          if (expr.negated)
            pieces.push("!");
          pieces.push(" ;\n",
                      lead + TAB,
                      _ShExRWriter._encodeIriOrBlankNode(SX + "predicate"),
                      ' ',
                      _ShExRWriter._encodePredicate(expr.predicate),
                      " ");

          if ("valueExpr" in expr) {
            pieces.push(" ;\n",
                        lead + TAB,
                        _ShExRWriter._encodeIriOrBlankNode(SX + "valueExpr"),
                        ' [ ');
            pieces = pieces.concat(_ShExRWriter._writeShapeExpr(expr.valueExpr, done, lead+TAB));
          }
          pieces.push("\n" + lead + TAB + "]");

          _writeCardinality(expr.min, expr.max, lead+TAB);
          _writeScopedShapeExpression(expr.onShapeExpression);
          _ShExRWriter._annotations(pieces, expr.annotations, lead);
          _writeExpressionActions(expr.semActs);
        }

        else if (expr.type === "OneOf") {
          pieces.push(' a ' + _ShExRWriter._encodeIriOrBlankNode(SX + "OneOf"));
          _exprGroup(expr.expressions, "\n"+lead+"| ", lead+TAB);
          _writeCardinality(expr.min, expr.max, lead+TAB); // t: open1dotclosecardOpt
          _writeScopedShapeExpression(expr.onShapeExpression);
          _ShExRWriter._annotations(pieces, expr.annotations, lead);
          _writeExpressionActions(expr.semActs);
        }

        else if (expr.type === "EachOf") {
          pieces.push(' a ' + _ShExRWriter._encodeIriOrBlankNode(SX + "EachOf"));
          _exprGroup(expr.expressions, ";\n"+lead, lead+TAB);
          _writeCardinality(expr.min, expr.max, lead+TAB); // t: open1dotclosecardOpt
          _writeScopedShapeExpression(expr.onShapeExpression);
          _ShExRWriter._annotations(pieces, expr.annotations, lead);
          _writeExpressionActions(expr.semActs);
        }

        else if (expr.type === "Inclusion") {
          pieces.push("&");
          pieces.push(_ShExRWriter._encodeShapeName(expr.include, false));
        }

        else throw Error("unexpected expr type: " + expr.type);

        if ("id" in expr) {
          pieces.push("\n.");
        } else {
          pieces.push("\n" + lead + ']')
        }
        lead = origLead;

      }

      if (shape.expression) { // t: 0, 0Extend1
        pieces.push(" ;\n" + lead + _ShExRWriter._encodeIriOrBlankNode(SX + "expression"));
        _writeExpression(shape.expression, lead, 0);
      }
      _writeShapeActions(shape.semActs);
      _ShExRWriter._annotations(pieces, shape.annotations, "  ");

      return pieces;
    }
    catch (error) { done && done(error); }
  },

  // ### `_writeShape` writes the shape to the output stream
  _writeNodeConstraint: function (v, done, lead) {
    var _ShExRWriter = this;
    try {
      _ShExRWriter._expect(v, "type", "NodeConstraint");
      var pieces = [];

      pieces.push('a ' + _ShExRWriter._encodeIriOrBlankNode(SX + "NodeConstraint"));

      if (v.nodeKind in nodeKinds)       pieces.push(nodeKinds[v.nodeKind], " ");
      else if (v.nodeKind !== undefined) _ShExRWriter._error("unexpected nodeKind: " + v.nodeKind); // !!!!

      this._fillNodeConstraint(pieces, v, done, lead+TAB);
      this._annotations(pieces, v.annotations, "  ");
      return pieces;
    }
    catch (error) { done && done(error); }

  },

  _annotations: function (pieces, annotations, indent) {
    var _ShExRWriter = this;
    if (annotations) {
      annotations.forEach(function (a) {
        _ShExRWriter._expect(a, "type", "Annotation");
        pieces.push("//\n"+indent+"   ");
        pieces.push(_ShExRWriter._encodeValue(a.predicate));
        pieces.push(" ");
        pieces.push(_ShExRWriter._encodeValue(a.object));
      });
    }
  },

  _fillNodeConstraint: function (pieces, v, done, lead) {
    var _ShExRWriter = this;
    if (v.datatype  && v.values  ) _ShExRWriter._error("found both datatype and values in "   +expr);
    if (v.datatype) {
      pieces.push(_ShExRWriter._encodeShapeName(v.datatype));
    }

    if (v.values) {
      pieces.push(" ;\n" + lead + _ShExRWriter._encodeIriOrBlankNode(SX + "values") + " (");

      v.values.forEach(function (t, ord) {
        if (ord > 0)
          pieces.push(" ");

        if (!isTerm(t)) {
//          expect(t, "type", "IriStemRange");
              if (!("type" in t))
                runtimeError("expected "+JSON.stringify(t)+" to have a 'type' attribute.");
          var stemRangeTypes = ["Language", "IriStem", "LiteralStem", "LanguageStem", "IriStemRange", "LiteralStemRange", "LanguageStemRange"];
              if (stemRangeTypes.indexOf(t.type) === -1)
                runtimeError("expected type attribute '"+t.type+"' to be in '"+stemRangeTypes+"'.");
          if (t.type === "Language") {
            pieces.push("@" + t.languageTag);
          } else if (!isTerm(t.stem)) {
            expect(t.stem, "type", "Wildcard");
            pieces.push(".");
          } else {
            pieces.push(langOrLiteral(t, t.stem) + "~");
          }
          if (t.exclusions) {
            t.exclusions.forEach(function (c) {
              pieces.push(" - ");
              if (!isTerm(c)) {
//                expect(c, "type", "IriStem");
                    if (!("type" in c))
                      runtimeError("expected "+JSON.stringify(c)+" to have a 'type' attribute.");
                    var stemTypes = ["IriStem", "LiteralStem", "LanguageStem"];
                    if (stemTypes.indexOf(c.type) === -1)
                      runtimeError("expected type attribute '"+c.type+"' to be in '"+stemTypes+"'.");
                pieces.push(langOrLiteral(t, c.stem) + "~");
              } else {
                pieces.push(langOrLiteral(t, c));
              }
            });
          }
          function langOrLiteral (t, c) {
            return ["LanguageStem", "LanguageStemRange"].indexOf(t.type) !== -1 ? "@" + c :
              ["LiteralStem", "LiteralStemRange"].indexOf(t.type) !== -1 ? '"' + c.replace(ESCAPE_g, c) + '"' :
              _ShExRWriter._encodeValue(c)
          }
        } else {
          pieces.push(_ShExRWriter._encodeValue(t));
        }
      });

      pieces.push(")");
    }

    if ('pattern' in v) {
      var pattern = v.pattern
          .replace(ESCAPE_g, characterReplacer);
      pieces.push(" ;\n" + lead + _ShExRWriter._encodeIriOrBlankNode(SX + "pattern") + " \"" + pattern + "\"");
      if (v.flags) {
        pieces.push(" ;\n" + lead + _ShExRWriter._encodeIriOrBlankNode(SX + "flags") + " \"" + flags + "\"");
      }
    }
    ['length', 'minlength', 'maxlength',
     'mininclusive', 'minexclusive', 'maxinclusive', 'maxexclusive',
     'totaldigits', 'fractiondigits'
    ].forEach(function (a) {
      if (v[a])
        pieces.push(" ", a, " ", v[a]);
    });
    return pieces;

    function isTerm (t) {
      return typeof t !== "object" || "value" in t && Object.keys(t).reduce((r, k) => {
        return r === false ? r : ["value", "type", "language"].indexOf(k) !== -1;
      }, true);
    }
  },

  // ### `_encodeIriOrBlankNode` represents an IRI or blank node
  _encodeIriOrBlankNode: function (iri, trailingSpace) {
    trailingSpace = trailingSpace ? ' ' : '';
    // A blank node is represented as-is
    if (iri[0] === '_' && iri[1] === ':') return iri;
    // Escape special characters
    if (ESCAPE_1.test(iri))
      iri = iri.replace(ESCAPE_g, characterReplacer);
    // Try to represent the IRI as prefixed name
    if (this._base) {
      var i = URL.parse(iri);
      var b = URL.parse(this._base);
      if (!["protocol", "slashes", "auth", "host", "port", "hostname", "hash", "search", "query"]
          .find(key => i[key] !== b[key])) {
        var iSlash = b.path.lastIndexOf('/');
        var basePath = iSlash > 0 ? b.path.substr(0, iSlash+1) : '/';
        var rel = Path.relative(basePath, i.path);
        if (!rel.startsWith('/')) {
          return '<' + rel + '>';
        }
      }
    }
    var prefixMatch = this._prefixRegex.exec(iri);
    return !prefixMatch ? '<' + iri + '>' :
           (!prefixMatch[1] ? iri : this._prefixIRIs[prefixMatch[1]] + prefixMatch[2]) + trailingSpace;
  },

  // ### `_encodeLiteral` represents a literal
  _encodeLiteral: function (value, type, language) {
    // early returns for shorthand values
    if (type === "http://www.w3.org/2001/XMLSchema#integer") {
      return value;
    }

    // Escape special characters
    if (ESCAPE_1.test(value))
      value = value.replace(ESCAPE_g, characterReplacer);
    // Write the literal, possibly with type or language
    if (language)
      return '"' + value + '"@' + language;
    else if (type)
      return '"' + value + '"^^' + this._encodeIriOrBlankNode(type);
    else
      return '"' + value + '"';
  },

  // ### `_encodeShapeName` represents a subject
  _encodeShapeName: function (subject, trailingSpace) {
    if (subject[0] === '"')
      throw new Error('A literal as subject is not allowed: ' + subject);
    return this._encodeIriOrBlankNode(subject, trailingSpace);
  },

  // ### `_encodePredicate` represents a predicate
  _encodePredicate: function (predicate) {
    if (predicate[0] === '"')
      throw new Error('A literal as predicate is not allowed: ' + predicate);
    return predicate === RDF_TYPE ? 'a' : this._encodeIriOrBlankNode(predicate);
  },

  // ### `_encodeValue` represents an object
  _encodeValue: function (object) {
    // Represent an IRI or blank node
    if (typeof object !== "object")
      return this._encodeIriOrBlankNode(object);
    // Represent a literal
    return this._encodeLiteral(object.value, object.type, object.language);
  },

  // ### `_blockedWrite` replaces `_write` after the writer has been closed
  _blockedWrite: function () {
    throw new Error('Cannot write because the writer has been closed.');
  },

  writeSchema: function (shape, done) {
    this._writeSchema(shape, done);
    this.end(done);
  },

  // ### `addShape` adds the shape to the output stream
  addShape: function (shape, name, done) {
    this._write(
      _ShExRWriter._encodeShapeName(name, false) +
        " " +
        _ShExRWriter._writeShapeExpr(shape, done, lead+TAB).join(""),
      done
    );
  },

  // ### `addShapes` adds the shapes to the output stream
  addShapes: function (shapes) {
    for (var i = 0; i < shapes.length; i++)
      this.addShape(shapes[i]);
  },

  // ### `addPrefix` adds the prefix to the output stream
  addPrefix: function (prefix, iri, done) {
    var prefixes = {};
    prefixes[prefix] = iri;
    this.addPrefixes(prefixes, done);
  },

  // ### `addPrefixes` adds the prefixes to the output stream
  addPrefixes: function (prefixes, done) {
    // Add all useful prefixes
    var prefixIRIs = this._prefixIRIs, hasPrefixes = false;
    for (var prefix in prefixes) {
      // Verify whether the prefix can be used and does not exist yet
      var iri = prefixes[prefix];
      if (// @@ /[#\/]$/.test(iri) && !! what was that?
          prefixIRIs[iri] !== (prefix += ':')) {
        hasPrefixes = true;
        prefixIRIs[iri] = prefix;
        // Write prefix
        this._write('PREFIX ' + prefix + ' <' + iri + '>\n');
      }
    }
    // Recreate the prefix matcher
    if (hasPrefixes) {
      var IRIlist = '', prefixList = '';
      for (var prefixIRI in prefixIRIs) {
        IRIlist += IRIlist ? '|' + prefixIRI : prefixIRI;
        prefixList += (prefixList ? '|' : '') + prefixIRIs[prefixIRI];
      }
      IRIlist = IRIlist.replace(/[\]\/\(\)\*\+\?\.\\\$]/g, '\\$&');
      this._prefixRegex = new RegExp('^(?:' + prefixList + ')[^\/]*$|' +
                                     '^(' + IRIlist + ')([a-zA-Z][\\-_a-zA-Z0-9]*)$');
    }
    // End a prefix block with a newline
    this._write(hasPrefixes ? '\n' : '', done);
  },

  // ### `_prefixRegex` matches a prefixed name or IRI that begins with one of the added prefixes
  _prefixRegex: /$0^/,

  // ### `end` signals the end of the output stream
  end: function (done) {
    // Disallow further writing
    this._write = this._blockedWrite;

    // Try to end the underlying stream, ensuring done is called exactly one time
    var singleDone = done && function (error, result) { singleDone = null, done(error, result); };
    if (this._endStream) {
      try { return this._outputStream.end(singleDone); }
      catch (error) { /* error closing stream */ }
    }
    singleDone && singleDone();
  },
};

// Replaces a character by its escaped version
function characterReplacer(character) {
  // Replace a single character by its escaped version
  var result = ESCAPE_replacements[character];
  if (result === undefined) {
    // Replace a single character with its 4-bit unicode escape sequence
    if (character.length === 1) {
      result = character.charCodeAt(0).toString(16);
      result = '\\u0000'.substr(0, 6 - result.length) + result;
    }
    // Replace a surrogate pair with its 8-bit unicode escape sequence
    else {
      result = ((character.charCodeAt(0) - 0xD800) * 0x400 +
                 character.charCodeAt(1) + 0x2400).toString(16);
      result = '\\U00000000'.substr(0, 10 - result.length) + result;
    }
  }
  return result;
}

function escapeCode (code) {
  return code.replace(/\\/g, "\\\\").replace(/%/g, "\\%")
}

/** _throwError: overridable function to throw Errors().
 *
 * @param func (optional): function at which to truncate stack trace
 * @param str: error message
 */
function _throwError (func, str) {
  if (typeof func !== "function") {
    str = func;
    func = _throwError;
  }
  var e = new Error(str);
  Error.captureStackTrace(e, func);
  throw e;
}

// Expect property p with value v in object o
function expect (o, p, v) {
  if (!(p in o))
    this._error(expect, "expected "+o+" to have a ."+p);
  if (arguments.length > 2 && o[p] !== v)
    this._error(expect, "expected "+o[o]+" to equal ."+v);
}

// The empty function
function noop () {}

return ShExRWriter;
})();

// Export the `ShExRWriter` class as a whole.
if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExRWriter; // node environment
