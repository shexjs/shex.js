// **ShExWriter** writes ShEx documents.

// Matches a literal as represented in memory by the ShEx library
var ShExLiteralMatcher = /^"([^]*)"(?:\^\^(.+)|@([\-a-z]+))?$/i;

// rdf:type predicate (for 'a' abbreviation)
var RDF_PREFIX = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    RDF_TYPE   = RDF_PREFIX + 'type';

// Characters in literals that require escaping
var escape    = /["\\\t\n\r\b\f\u0000-\u0019\ud800-\udbff]/,
    escapeAll = /["\\\t\n\r\b\f\u0000-\u0019]|[\ud800-\udbff][\udc00-\udfff]/g,
    escapeReplacements = { '\\': '\\\\', '"': '\\"', '\t': '\\t',
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
function ShExWriter(outputStream, options) {
  if (!(this instanceof ShExWriter))
    return new ShExWriter(outputStream, options);

  // Shift arguments if the first argument is not a stream
  if (outputStream && typeof outputStream.write !== 'function')
    options = outputStream, outputStream = null;
  options = options || {};

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
  this.forceParens = !options.simplifyParentheses; // default to false
  this._expect = options.lax ? noop : expect;
}

function _dumpValueExpr (_ShExWriter, valueExpr) {
  var pieces = [];
  if (valueExpr.type === "ValueRef")
    pieces.push("$", _ShExWriter._encodeShapeName(valueExpr.valueExprRef));
  // !!! []s for precedence!
  else if (valueExpr.type === "ValueAnd") {
    valueExpr.valueExprs.forEach(function (expr, ord) {
      if (ord > 0)
        pieces.push(" AND ");
      pieces.push(_dumpValueExpr(_ShExWriter, expr));
    });
  } else if (valueExpr.type === "ValueOr") {
    valueExpr.valueExprs.forEach(function (expr, ord) {
      if (ord > 0)
        pieces.push(" OR ");
      pieces.push(_dumpValueExpr(_ShExWriter, expr));
    });
  } else
    pieces.push(dumpValueClass(_ShExWriter, valueExpr));
  return pieces.join('');
}

function dumpValueClass (_ShExWriter, v) {
  var pieces = [];
  _ShExWriter._expect(v, "type", "ValueClass");
  if (!v.reference && !v.nodeKind && !v.values && !v.datatype)
    pieces.push(". ");
  else {
    if (v.nodeKind in nonLitNodeKinds) pieces.push(nodeKinds[v.nodeKind], " ");
    else if (v.nodeKind !== undefined) _ShExWriter._error("unexpected nodeKind: " + v.nodeKind);

    if (v.reference && v.values  ) _ShExWriter._error("found both reference and values in "  +expr);
    if (v.reference && v.datatype) _ShExWriter._error("found both reference and datatype in "+expr);
    if (v.datatype  && v.values  ) _ShExWriter._error("found both datatype and values in "   +expr);

    if (v.reference) {
      if (typeof(v.reference) === "object") {
	pieces.push(v.reference.disjuncts.map(function (c) {
	  return "@"+_ShExWriter._encodeShapeName(c);
	}).join(" OR "));
      } else {
	pieces.push("@"+_ShExWriter._encodeShapeName(v.reference));
      }
    }

    if (v.datatype) {
      pieces.push(_ShExWriter._encodeShapeName(v.datatype));
    }

    if (v.values) {
      pieces.push("[");

      v.values.forEach(function (t, ord) {
	if (ord > 1)
	  pieces.push(" ");

	if (typeof t === "object") {
	  expect(t, "type", "StemRange");
          if (typeof t.stem === "object") {
	    expect(t.stem, "type", "Wildcard");
            pieces.push(".");
          } else {
	    pieces.push(_ShExWriter._encodeValue(t.stem)+"~");
          }
          if (t.exclusions) {
	    t.exclusions.forEach(function (c) {
              pieces.push(" - ");
              if (typeof c === "object") {
		expect(c, "type", "Stem");
		pieces.push(_ShExWriter._encodeValue(c.stem)+"~");
              } else {
		pieces.push(_ShExWriter._encodeValue(c));
              }
	    });
          }
	} else {
	  pieces.push(_ShExWriter._encodeValue(t));
	}
      });

      pieces.push("]");
    }
  }

  if ('pattern' in v)
    pieces.push("~", _ShExWriter._encodeValue("\""+v.pattern+"\""), " ");
  ['length', 'minlength', 'maxlength',
   'mininclusive', 'minexclusive', 'maxinclusive', 'maxexclusive',
   'totaldigits', 'fractiondigits'
  ].forEach(function (a) {
    if (v[a])
      pieces.push(" ", a, " ", v[a]);
  });
  return pieces.join('');
}

ShExWriter.prototype = {
  // ## Private methods

  // ### `_write` writes the argument to the output stream
  _write: function (string, callback) {
    this._outputStream.write(string, 'utf8', callback);
  },

  // ### `_writeSchema` writes the shape to the output stream
  _writeSchema: function (schema, done) {
    var _ShExWriter = this;
    this._expect(schema, "type", "Schema");
    _ShExWriter.addPrefixes(schema.prefixes);
    if (schema.base)
      _ShExWriter._write("BASE " + this._encodeIriOrBlankNode(schema.base));

    if (schema.startActs)
      schema.startActs.forEach(function (act) {
	_ShExWriter._expect(act, "type", "SemAct");
	_ShExWriter._write(" %"+
			   _ShExWriter._encodePredicate(act.name)+
			   ("code" in act ? "{"+escapeCode(act.code)+"%"+"}" : "%"));
      });
    if (schema.valueExprDefns) {
      Object.keys(schema.valueExprDefns).forEach(function (label) {
        _ShExWriter._write("$"+_ShExWriter._encodeShapeName(label)+" = "+_dumpValueExpr(_ShExWriter, schema.valueExprDefns[label].valueExpr)+"\n");
      });
    }
    if (schema.start)
      _ShExWriter._write("start = " + _ShExWriter._encodeShapeName(schema.start, false) + "\n")
    Object.keys(schema.shapes).forEach(function (label) {
      _ShExWriter._writeShapeExpr(schema.shapes[label], label, done);
    })
  },

  // ### `_writeShape` writes the shape to the output stream
  _writeShapeExpr: function (shapeExpr, label, done) {
    var _ShExWriter = this;
    try {
      var pieces = []; // guessing push/join is faster than concat
      // if (shape.virtual) pieces.push("VIRTUAL "); futureWork

      pieces.push(_ShExWriter._encodeShapeName(label, false)+" ");

      pieces.push((shapeExpr.type === "ShapeAnd" ? shapeExpr.shapeExprs : [shapeExpr]).
                  map(s => {
                    return _ShExWriter._writeShape(s, label, done);
                  }).join(" AND "));
      this._write(pieces.join(""), done)
    } catch (error) { done && done(error); }
  },

  // ### `_writeShape` writes the shape to the output stream
  _writeShape: function (shape, label, done) {
    var _ShExWriter = this;
    try {
      var pieces = []; // guessing push/join is faster than concat
      this._expect(shape, "type", "Shape");

      if (shape.nodeKind in nodeKinds)       pieces.push(nodeKinds[shape.nodeKind], " ");
      else if (shape.nodeKind !== undefined) _ShExWriter._error("unexpected nodeKind: " + shape.nodeKind);

      if ('pattern' in shape)
        pieces.push("~", _ShExWriter._encodeValue("\""+shape.pattern+"\""), " ");
      ['length', 'minlength', 'maxlength'
      ].forEach(function (a) {
        if (shape[a])
          pieces.push(" ", a, " ", shape[a]);
      });

      if (shape.closed) pieces.push("CLOSED ");

      // if (shape.inherit && shape.inherit.length > 0) { futureWork
      //   pieces.push("&");
      //   shape.inherit.forEach(function (i, ord) {
      //     if (ord)
      //       pieces.push(" ")
      //     pieces.push(_ShExWriter._encodeShapeName(i, ord > 0));
      //   });
      //   pieces.push(" ");
      // }

      if (shape.extra && shape.extra.length > 0) {
	pieces.push("EXTRA ");
	shape.extra.forEach(function (i, ord) {
	  pieces.push(_ShExWriter._encodeShapeName(i, false)+" ");
	});
	pieces.push(" ");
      }
      pieces.push("{\n");

      function _writeShapeActions (semActs) {
	if (!semActs)
	  return;

	semActs.forEach(function (act) {
	  _ShExWriter._expect(act, "type", "SemAct");
	  pieces.push(" %",
		      _ShExWriter._encodePredicate(act.name),
		      ("code" in act ? "{"+escapeCode(act.code)+"%"+"}" : "%"));
	});
      }

      function _writeCardinality (min, max) {
	if      (min === 0 && max === 1)         pieces.push("?");
	else if (min === 0 && max === "*") pieces.push("*");
	else if (min === undefined && max === undefined)                         ;
	else if (min === 1 && max === "*") pieces.push("+");
	else
	  pieces.push("{", min, ",", (max === "*" ? "*" : max), "}"); // by coincidence, both use the same character.
      }

      function _writeExpression (expr, indent, parentPrecedence) {
	function _writeExpressionActions (semActs) {
          if (semActs) {

	    semActs.forEach(function (act) {
	      _ShExWriter._expect(act, "type", "SemAct");
              pieces.push("\n"+indent+"   %");
	      pieces.push(_ShExWriter._encodeValue(act.name));
	      if ("code" in act)
		pieces.push("{"+escapeCode(act.code)+"%"+"}");
	      else
		pieces.push("%");
	    });
          }
        }

	function _exprGroup (exprs, separator, precedence, forceParens) {
          var needsParens = precedence < parentPrecedence || forceParens;
          if (needsParens) {
            pieces.push("(");
          }
	  exprs.forEach(function (nested, ord) {
	    _writeExpression(nested, indent+"  ", precedence)
	    if (ord < exprs.length - 1)
	      pieces.push(separator);
	  });
          if (needsParens) {
            pieces.push(")");
          }
	}

        function _annotations(annotations) {
          if (annotations) {
	    annotations.forEach(function (a) {
	      _ShExWriter._expect(a, "type", "Annotation");
              pieces.push("//\n"+indent+"   ");
	      pieces.push(_ShExWriter._encodeValue(a.predicate));
              pieces.push(" ");
	      pieces.push(_ShExWriter._encodeValue(a.object));
	    });
          }
        }

	if (expr.type === "TripleConstraint") {
	  if (expr.inverse)
	    pieces.push("^");
	  if (expr.negated)
	    pieces.push("!");
	  pieces.push(indent,
		      _ShExWriter._encodePredicate(expr.predicate),
		      " ");

          pieces.push(_dumpValueExpr(_ShExWriter, expr.valueExpr));

	  _writeCardinality(expr.min, expr.max);
          _annotations(expr.annotations);
	  _writeExpressionActions(expr.semActs);
	}

	else if (expr.type === "SomeOf") {
          var needsParens = "min" in expr || "max" in expr || "annotations" in expr || "semActs" in expr;
	  _exprGroup(expr.expressions, "\n"+indent+"| ", 1, needsParens || _ShExWriter.forceParens);
	  _writeCardinality(expr.min, expr.max); // t: open1dotclosecardOpt
          _annotations(expr.annotations);
	  _writeExpressionActions(expr.semActs);
	}

	else if (expr.type === "EachOf") {
          var needsParens = "min" in expr || "max" in expr || "annotations" in expr || "semActs" in expr;
	  _exprGroup(expr.expressions, ";\n"+indent, 2, needsParens || _ShExWriter.forceParens);
	  _writeCardinality(expr.min, expr.max); // t: open1dotclosecardOpt
          _annotations(expr.annotations);
	  _writeExpressionActions(expr.semActs);
	}

	else if (expr.type === "Inclusion") {
	  pieces.push("&");
	  pieces.push(_ShExWriter._encodeShapeName(expr.include, false));
	}

	else throw Error("unexpected expr type: " + expr.type);
      }

      if (shape.expression) // t: 0, 0Inherit1
	_writeExpression(shape.expression, "  ", 0);
      pieces.push("}");
      _writeShapeActions(shape.semActs);
      pieces.push("\n");

      return pieces.join('');
    }
    catch (error) { done && done(error); }
  },

  // ### `_encodeIriOrBlankNode` represents an IRI or blank node
  _encodeIriOrBlankNode: function (iri, trailingSpace) {
    trailingSpace = trailingSpace ? ' ' : '';
    // A blank node is represented as-is
    if (iri[0] === '_' && iri[1] === ':') return iri;
    // Escape special characters
    if (escape.test(iri))
      iri = iri.replace(escapeAll, characterReplacer);
    // Try to represent the IRI as prefixed name
    var prefixMatch = this._prefixRegex.exec(iri);
    return !prefixMatch ? '<' + iri + '>' :
           (!prefixMatch[1] ? iri : this._prefixIRIs[prefixMatch[1]] + prefixMatch[2]) + trailingSpace;
  },

  // ### `_encodeLiteral` represents a literal
  _encodeLiteral: function (value, type, language) {
    // Escape special characters
    if (escape.test(value))
      value = value.replace(escapeAll, characterReplacer);
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
    if (object[0] !== '"')
      return this._encodeIriOrBlankNode(object);
    // Represent a literal
    var match = ShExLiteralMatcher.exec(object);
    if (!match) throw new Error('Invalid literal: ' + object);
    return this._encodeLiteral(match[1], match[2], match[3]);
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
    this._writeShape(shape, name, done);
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
  var result = escapeReplacements[character];
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

function _throwError (str) {
  throw new Error(str);
}

// Expect property p with value v in object o
function expect (o, p, v) {
  if (!(p in o))
    this._error("expected "+o+" to have a ."+p);
  if (arguments.length > 2 && o[p] !== v)
    this._error("expected "+o[o]+" to equal ."+v);
}

// The empty function
function noop () {}

// ## Exports

// Export the `ShExWriter` class as a whole.
if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExWriter; // node environment
