// **ShExWriter** writes ShEx documents.
import * as ShExJ from 'shexj';

const RelativizeIri = require("relativize-url").relativize;
const UNBOUNDED = -1;

// rdf:type predicate (for 'a' abbreviation)
const RDF_PREFIX = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    RDF_TYPE   = RDF_PREFIX + 'type';

// Characters in literals that require escaping
const ESCAPE_1 = /["\\\t\n\r\b\f\u0000-\u0019\ud800-\udbff]/,
    ESCAPE_g = /["\\\t\n\r\b\f\u0000-\u0019]|[\ud800-\udbff][\udc00-\udfff]/g,
    ESCAPE_replacements: { [char: string]: string } = {
                            '\\': '\\\\', '"': '\\"', '/': '\\/', '\t': '\\t',
                            '\n': '\\n', '\r': '\\r', '\b': '\\b', '\f': '\\f' };

const nodeKinds: { [nodeKind: string]: string } = {
  'iri': "IRI",
  'bnode': "BNODE",
  'literal': "LITERAL",
  'nonliteral': "NONLITERAL"
};

/** stream (e.g. process.stdout) accepted by the ShExWriter constructor */
interface WritableStream {
  write (chunk: string, encoding?: string | ((error?: any, result?: any) => void), done?: (error?: any, result?: any) => void): any;
  end (done?: ((error?: any, result?: any) => void) | null): any;
}

type DoneCallback = (error?: any, result?: any) => void;

interface ShExWriterOptions {
  /** base IRI against which output IRIs are relativized */
  base?: string | null;
  /** prefixes to declare and use for prefixed names */
  prefixes?: { [prefix: string]: string };
  /** don't parenthesize unambiguous nested expressions */
  simplifyParentheses?: boolean;
  /** skip structural expect() tests while serializing */
  lax?: boolean;
  /** whether end() closes the underlying stream (default true) */
  end?: boolean;
  /** overridable error thrower */
  error?: (func: Function | string, str?: string) => never;
}

type Piece = string | number;

class ShExWriter {
  _outputStream: WritableStream;
  _endStream: boolean;
  _prefixIRIs: { [iri: string]: string };
  _baseIRI: string | null;
  _error: (func: Function | string, str?: string) => never;
  forceParens: boolean;
  _expect: (o: any, p: string, v?: any) => void;
  // ### `_prefixRegex` matches a prefixed name or IRI that begins with one of the added prefixes
  _prefixRegex: RegExp = /$0^/;

  constructor (outputStream?: WritableStream | ShExWriterOptions | null, options?: ShExWriterOptions) {
    // Shift arguments if the first argument is not a stream
    if (outputStream && typeof (outputStream as WritableStream).write !== 'function')
      options = outputStream as ShExWriterOptions, outputStream = null;
    options = options || {};

    // If no output stream given, send the output as string through the end callback
    if (!outputStream) {
      let output = '';
      this._outputStream = {
        write: function (chunk: string, _encoding?: any, done?: DoneCallback) { output += chunk; done && done(); },
        end:   function (done?: DoneCallback | null) { done && done(null, output); },
      };
      this._endStream = true;
    }
    else {
      this._outputStream = outputStream as WritableStream;
      this._endStream = options.end === undefined ? true : !!options.end;
    }

    // Initialize writer, depending on the format
    this._prefixIRIs = Object.create(null);
    this._baseIRI = options.base || null;
    options.prefixes && this.addPrefixes(options.prefixes);

    this._error = options.error || _throwError;
    this.forceParens = !options.simplifyParentheses; // default to false
    this._expect = options.lax ? noop : expect;
  }

  // ## Private methods

  // ### `_write` writes the argument to the output stream
  _write (string: string, callback?: DoneCallback) {
    this._outputStream.write(string, 'utf8', callback);
  }

  // ### `_writeSchema` writes the shape to the output stream
  _writeSchema (schema: ShExJ.Schema & { _prefixes?: any, _base?: string | null }, done?: DoneCallback) {
    const _ShExWriter = this;
    this._expect(schema, "type", "Schema");
    _ShExWriter.addPrefixes(schema._prefixes);
    if (schema._base)
      _ShExWriter._baseIRI = schema._base;

    if (_ShExWriter._baseIRI)
      _ShExWriter._write("BASE <" + _ShExWriter._baseIRI + ">\n"); // don't use _encodeIriOrBlankNode()

    if (schema.imports)
      schema.imports.forEach(function (imp) {
        _ShExWriter._write("IMPORT " + _ShExWriter._encodeIriOrBlankNode(imp) + "\n");
      });
    if (schema.startActs)
      schema.startActs.forEach(function (act) {
        _ShExWriter._expect(act, "type", "SemAct");
        _ShExWriter._write(" %"+
                           _ShExWriter._encodePredicate(act.name)+
                           ("code" in act ? "{"+escapeCode(act.code!)+"%"+"}" : "%"));
      });
    if (schema.start)
      _ShExWriter._write("START = " + _ShExWriter._writeShapeExpr(schema.start, done, true, 0).join('') + "\n")
    if ("shapes" in schema)
      schema.shapes!.forEach(function (shapeDecl) {
        _ShExWriter._write(
          _ShExWriter._writeShapeDecl(shapeDecl, done, true, 0).join("")+"\n",
          done
        );
      })
  }

  _writeShapeDecl (shapeDecl: ShExJ.ShapeDecl, done?: DoneCallback, _forceBraces?: boolean, _parentPrec?: number): Piece[] {
    const _ShExWriter = this;
    const pieces: Piece[] = [];
    if (shapeDecl.abstract)
      pieces.push("ABSTRACT ");
    pieces.push(_ShExWriter._encodeShapeName(shapeDecl.id, false), " ");
    return pieces.concat(_ShExWriter._writeShapeExpr(shapeDecl.shapeExpr, done, true, 0));
  }

  _writeShapeExpr (shapeExpr: ShExJ.shapeExprOrRef, done?: DoneCallback, forceBraces?: boolean, parentPrec: number = 0): Piece[] {
    const _ShExWriter = this;
    const pieces: Piece[] = [];
    if (typeof shapeExpr === "string") // ShapeRef
      pieces.push("@", _ShExWriter._encodeShapeName(shapeExpr));
    // !!! []s for precedence!
    else if (shapeExpr.type === "ShapeExternal")
      pieces.push("EXTERNAL");
    else if (shapeExpr.type === "ShapeAnd") {
      if (parentPrec >= 3)
        pieces.push("(");
      let lastAndElided = false;
      const andExprs = shapeExpr.shapeExprs;
      andExprs.forEach(function (expr, ord) {
        if (ord > 0) { // && !!! grammar rules too weird here
          /*
            shapeAtom:
                  nonLitNodeConstraint shapeOrRef?
                | shapeDecl nonLitNodeConstraint?

            nonLitInlineNodeConstraint:
                  nonLiteralKind stringFacet*
          */
          function nonLitNodeConstraint (idx: number): boolean {
            let c: any = andExprs[idx];
            return c.type !== "NodeConstraint"
              || ("nodeKind" in c && c.nodeKind === "literal")
              || "datatype" in c
              || "values" in c
              ? false
              : true;
          }

          function shapeOrRef (idx: number): boolean {
            let c: any = andExprs[idx];
            return c.type === "Shape" || c.type === "ShapeRef";
          }

          function shapeDecl (idx: number): boolean {
            let c: any = andExprs[idx];
            return c.type === "Shape";
          }

          let elideAnd = !lastAndElided
              && (nonLitNodeConstraint(ord-1) && shapeOrRef(ord)
                  || shapeDecl(ord-1) && nonLitNodeConstraint(ord))
          if (!elideAnd || true) { // !! temporary work-around for ShExC parser bug
            pieces.push(" AND ");
          }
          lastAndElided = elideAnd;
        }
        [].push.apply(pieces, _ShExWriter._writeShapeExpr(expr, done, false, 3) as never[]);
      });
      if (parentPrec >= 3)
        pieces.push(")");
    } else if (shapeExpr.type === "ShapeOr") {
      if (parentPrec >= 2)
        pieces.push("(");
      shapeExpr.shapeExprs.forEach(function (expr, ord) {
        if (ord > 0)
          pieces.push(" OR ");
        [].push.apply(pieces, _ShExWriter._writeShapeExpr(expr, done, forceBraces, 2) as never[]);
      });
      if (parentPrec >= 2)
        pieces.push(")");
    } else if (shapeExpr.type === "ShapeNot") {
      if (parentPrec >= 4)
        pieces.push("(");
      pieces.push("NOT ");
      [].push.apply(pieces, _ShExWriter._writeShapeExpr(shapeExpr.shapeExpr, done, forceBraces, 4) as never[]);
      if (parentPrec >= 4)
        pieces.push(")");
    } else if (shapeExpr.type === "Shape") {
      [].push.apply(pieces, _ShExWriter._writeShape(shapeExpr, done, forceBraces) as never[]);
    } else if (shapeExpr.type === "NodeConstraint") {
      [].push.apply(pieces, _ShExWriter._writeNodeConstraint(shapeExpr, done) as never[]);
    } else
      throw Error("expected Shape{,And,Or,Ref} or NodeConstraint in " + JSON.stringify(shapeExpr));
    return pieces;
  }

  // ### `_writeShape` writes the shape to the output stream
  _writeShape (shape: ShExJ.Shape, done?: DoneCallback, _forceBraces?: boolean): Piece[] | undefined {
    const _ShExWriter = this;
    try {
      const pieces: Piece[] = []; // guessing push/join is faster than concat
      this._expect(shape, "type", "Shape");

      if (shape.closed) pieces.push("CLOSED ");

      [{keyword: "extends", marker: "EXTENDS "}].forEach(pair => {
         // pieces = pieces.concat(_ShExWriter._writeShapeExpr(expr.valueExpr, done, true, 0));
         const exprs = (shape as any)[pair.keyword] as ShExJ.shapeExprOrRef[] | undefined;
         if (exprs && exprs.length > 0) {
           exprs.forEach(function (i, ord) {
             if (ord)
               pieces.push(" ")
             pieces.push(pair.marker);
             [].push.apply(pieces, _ShExWriter._writeShapeExpr(i, done, true, 0) as never[]);
           });
           pieces.push(" ");
         }
       });

      if (shape.extra && shape.extra.length > 0) {
        pieces.push("EXTRA ");
        shape.extra.forEach(function (i) {
          pieces.push(_ShExWriter._encodeShapeName(i, false)+" ");
        });
        pieces.push(" ");
      }
      pieces.push("{\n");

      function _writeShapeActions (semActs: ShExJ.SemAct[] | undefined) {
        if (!semActs)
          return;

        semActs.forEach(function (act) {
          _ShExWriter._expect(act, "type", "SemAct");
          pieces.push(" %",
                      _ShExWriter._encodePredicate(act.name),
                      ("code" in act ? "{"+escapeCode(act.code!)+"%"+"}" : "%"));
        });
      }

      function _writeCardinality (min: number | undefined, max: number | undefined) {
        if      (min === 0 && max === 1)         pieces.push("?");
        else if (min === 0 && max === UNBOUNDED) pieces.push("*");
        else if (min === undefined && max === undefined)                         { /* empty */ }
        else if (min === 1 && max === UNBOUNDED) pieces.push("+");
        else
          pieces.push("{", min!, ",", (max === UNBOUNDED ? "*" : max!), "}"); // by coincidence, both use the same character.
      }

      function _writeExpression (expr: ShExJ.tripleExprOrRef, indent: string, parentPrecedence: number) {
        function _writeExpressionActions (semActs: ShExJ.SemAct[] | undefined) {
          if (semActs) {

            semActs.forEach(function (act) {
              _ShExWriter._expect(act, "type", "SemAct");
              pieces.push("\n"+indent+"   %");
              pieces.push(_ShExWriter._encodeValue(act.name));
              if ("code" in act)
                pieces.push("{"+escapeCode(act.code!)+"%"+"}");
              else
                pieces.push("%");
            });
          }
        }

        function _exprGroup (exprs: ShExJ.tripleExprOrRef[], separator: string, precedence: number, forceParens: boolean) {
          const needsParens = precedence < parentPrecedence || forceParens;
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

        if (typeof expr === "string") {
          pieces.push("&");
          pieces.push(_ShExWriter._encodeShapeName(expr, false));
        } else {

        if ("id" in expr && expr.id !== undefined) {
          pieces.push("$");
          pieces.push(_ShExWriter._encodeIriOrBlankNode(expr.id, true));
        }

        if (expr.type === "TripleConstraint") {
          if (expr.inverse)
            pieces.push("^");
          if ((expr as any).negated)
            pieces.push("!");
          pieces.push(indent,
                      _ShExWriter._encodePredicate(expr.predicate),
                      " ");

          if ("valueExpr" in expr)
            [].push.apply(pieces, _ShExWriter._writeShapeExpr(expr.valueExpr!, done, true, 0) as never[]);
          else
            pieces.push(". ");

          _writeCardinality(expr.min, expr.max);
          _ShExWriter._annotations(pieces, expr.annotations, indent);
          _writeExpressionActions(expr.semActs);
        }

        else if (expr.type === "OneOf") {
          const needsParens = "id" in expr || "min" in expr || "max" in expr || "annotations" in expr || "semActs" in expr;
          _exprGroup(expr.expressions, "\n"+indent+"| ", 1, needsParens || _ShExWriter.forceParens);
          _writeCardinality(expr.min, expr.max); // t: open1dotclosecardOpt
          _ShExWriter._annotations(pieces, expr.annotations, indent);
          _writeExpressionActions(expr.semActs);
        }

        else if (expr.type === "EachOf") {
          const needsParens = "id" in expr || "min" in expr || "max" in expr || "annotations" in expr || "semActs" in expr;
          _exprGroup(expr.expressions, ";\n"+indent, 2, needsParens || _ShExWriter.forceParens);
          _writeCardinality(expr.min, expr.max); // t: open1dotclosecardOpt
          _ShExWriter._annotations(pieces, expr.annotations, indent);
          _writeExpressionActions(expr.semActs);
        }

        else throw Error("unexpected expr type: " + (expr as any).type);
        }
      }

      if (shape.expression) // t: 0, 0Extend1
        _writeExpression(shape.expression, "  ", 0);
      pieces.push("\n}");
      _writeShapeActions(shape.semActs);
      _ShExWriter._annotations(pieces, shape.annotations, "  ");

      return pieces;
    }
    catch (error) { done && done(error); return undefined; }
  }

  // ### `_writeNodeConstraint` writes the node constraint to the output stream
  _writeNodeConstraint (v: ShExJ.NodeConstraint, done?: DoneCallback): Piece[] | undefined {
    const _ShExWriter = this;
    try {
      _ShExWriter._expect(v, "type", "NodeConstraint");

      const pieces: Piece[] = [];
      if (v.nodeKind! in nodeKinds)      pieces.push(nodeKinds[v.nodeKind!], " ");
      else if (v.nodeKind !== undefined) _ShExWriter._error("unexpected nodeKind: " + v.nodeKind); // !!!!

      this._fillNodeConstraint(pieces, v, done);
      this._annotations(pieces, v.annotations, "  ");
      return pieces;
    }
    catch (error) { done && done(error); return undefined; }

  }

  _annotations (pieces: Piece[], annotations: ShExJ.Annotation[] | undefined, indent: string) {
    const _ShExWriter = this;
    if (annotations) {
      annotations.forEach(function (a) {
        _ShExWriter._expect(a, "type", "Annotation");
        pieces.push("//\n"+indent+"   ");
        pieces.push(_ShExWriter._encodeValue(a.predicate));
        pieces.push(" ");
        pieces.push(_ShExWriter._encodeValue(a.object as any));
      });
    }
  }

  _fillNodeConstraint (pieces: Piece[], v: ShExJ.NodeConstraint, _done?: DoneCallback): Piece[] {
    const _ShExWriter = this;
    if (v.datatype  && v.values  ) _ShExWriter._error("found both datatype and values in "   +JSON.stringify(v));
    if (v.datatype) {
      pieces.push(_ShExWriter._encodeShapeName(v.datatype));
    }

    if (v.values) {
      pieces.push("[");

      v.values.forEach(function (t: any, ord) {
        if (ord > 0)
          pieces.push(" ");

        if (!isTerm(t)) {
//          expect(t, "type", "IriStemRange");
              if (!("type" in t))
                _ShExWriter._error("expected "+JSON.stringify(t)+" to have a 'type' attribute.");
          const stemRangeTypes = ["Language", "IriStem", "LiteralStem", "LanguageStem", "IriStemRange", "LiteralStemRange", "LanguageStemRange"];
              if (stemRangeTypes.indexOf(t.type) === -1)
                _ShExWriter._error("expected type attribute '"+t.type+"' to be in '"+stemRangeTypes+"'.");
          if (t.type === "Language") {
            pieces.push("@" + t.languageTag);
          } else if (!isTerm(t.stem)) {
            _ShExWriter._expect(t.stem, "type", "Wildcard");
            pieces.push(".");
          } else {
            pieces.push(langOrLiteral(t, t.stem) + "~");
          }
          if (t.exclusions) {
            t.exclusions.forEach(function (c: any) {
              pieces.push(" - ");
              if (!isTerm(c)) {
//                expect(c, "type", "IriStem");
                    if (!("type" in c))
                      _ShExWriter._error("expected "+JSON.stringify(c)+" to have a 'type' attribute.");
                    const stemTypes = ["IriStem", "LiteralStem", "LanguageStem"];
                    if (stemTypes.indexOf(c.type) === -1)
                      _ShExWriter._error("expected type attribute '"+c.type+"' to be in '"+stemTypes+"'.");
                pieces.push(langOrLiteral(t, c.stem) + "~");
              } else {
                pieces.push(langOrLiteral(t, c));
              }
            });
          }
        } else {
          pieces.push(_ShExWriter._encodeValue(t));
        }

        function langOrLiteral (t: any, c: string): string {
          return ["LanguageStem", "LanguageStemRange"].indexOf(t.type) !== -1 ? "@" + c :
            ["LiteralStem", "LiteralStemRange"].indexOf(t.type) !== -1 ? '"' + c.replace(ESCAPE_g, characterReplacer) + '"' :
            _ShExWriter._encodeValue(c)
        }
      });

      pieces.push("]");
    }

    if ('pattern' in v && v.pattern !== undefined) {
      const pattern = v.pattern.
          replace(/\//g, "\\/");
      // if (ESCAPE_1.test(pattern))
      //   pattern = pattern.replace(ESCAPE_g, characterReplacer);
      const flags = 'flags' in v ? v.flags : "";
      pieces.push("/" + pattern + "/" + flags + " ");
    }
    (['length', 'minlength', 'maxlength',
      'mininclusive', 'minexclusive', 'maxinclusive', 'maxexclusive',
      'totaldigits', 'fractiondigits'
    ] as const).forEach(function (a) {
      if (v[a])
        pieces.push(" ", a, " ", v[a]!);
    });
    return pieces;

    function isTerm (t: any): boolean {
      return typeof t !== "object" || "value" in t && Object.keys(t).reduce((r: boolean, k) => {
        return r === false ? r : ["value", "type", "language"].indexOf(k) !== -1;
      }, true);
    }
  }

  // ### `_encodeIriOrBlankNode` represents an IRI or blank node
  _encodeIriOrBlankNode (iri: string, trailingSpace?: boolean): string {
    const trailer = trailingSpace ? ' ' : '';
    // A blank node is represented as-is
    if (iri[0] === '_' && iri[1] === ':') return iri;
    // Escape special characters
    if (ESCAPE_1.test(iri))
      iri = iri.replace(ESCAPE_g, characterReplacer);
    // Try to represent the IRI as prefixed name
    const prefixMatch = this._prefixRegex.exec(iri);
    return (!prefixMatch
      ? this._relateUrl(iri)
      : (!prefixMatch[1]
         ? iri
         : this._prefixIRIs[prefixMatch[1]] + prefixMatch[2]))
      + trailer;
  }

  // ### `_relateUrl` writes iri relative to base when they share a host
  _relateUrl (iri: string): string {
    const base = this._baseIRI;
    try {
      if (base && new URL(base).host === new URL(iri).host) // https://github.com/stevenvachon/relateurl/issues/28
        iri = RelativizeIri(iri, base);
    } catch (e) {
      // invalid URL for e.g. already relative IMPORTs
    }
    return '<' + iri + '>';
  }

  // ### `_encodeLiteral` represents a literal
  _encodeLiteral (value: string, type?: string, language?: string): string {
    // Escape special characters
    if (ESCAPE_1.test(value))
      value = value.replace(ESCAPE_g, characterReplacer);
    // Write the literal, possibly with type or language
    if (language) {
      return '"' + value + '"@' + language;
    } else if (type) { // && type !== "http://www.w3.org/2001/XMLSchema#integer" is implied by the parsing rules.
      if (type === "http://www.w3.org/2001/XMLSchema#integer" && value.match(/^[+-]?[0-9]+$/)) {
        return value;
      } else if (type === "http://www.w3.org/2001/XMLSchema#decimal" && value.match(/^[+-]?[0-9]*\.[0-9]+$/)) {
        return value;
      } else if (type === "http://www.w3.org/2001/XMLSchema#double" && value.match(/^[+-]?([0-9]+\.[0-9]*[eE][+-]?[0-9]+|\.?[0-9]+[eE][+-]?[0-9]+)$/)) {
        return value;
      } else {
        return '"' + value + '"^^' + this._encodeIriOrBlankNode(type);
      }
    } else {
      return '"' + value + '"';
    }
  }

  // ### `_encodeShapeName` represents a subject
  _encodeShapeName (subject: string, trailingSpace?: boolean): string {
    if (subject[0] === '"')
      throw new Error('A literal as subject is not allowed: ' + subject);
    return this._encodeIriOrBlankNode(subject, trailingSpace);
  }

  // ### `_encodePredicate` represents a predicate
  _encodePredicate (predicate: string): string {
    if (predicate[0] === '"')
      throw new Error('A literal as predicate is not allowed: ' + predicate);
    return predicate === RDF_TYPE ? 'a' : this._encodeIriOrBlankNode(predicate);
  }

  // ### `_encodeValue` represents an object
  _encodeValue (object: string | { value: string, type?: string, language?: string }): string {
    // Represent an IRI or blank node
    if (typeof object !== "object")
      return this._encodeIriOrBlankNode(object);
    // Represent a literal
    return this._encodeLiteral(object.value, object.type, object.language);
  }

  // ### `_blockedWrite` replaces `_write` after the writer has been closed
  _blockedWrite (): never {
    throw new Error('Cannot write because the writer has been closed.');
  }

  writeSchema (shape: ShExJ.Schema, done?: DoneCallback) {
    this._writeSchema(shape, done);
    this.end(done);
  }

  // ### `addShape` adds the shape to the output stream
  addShape (shape: ShExJ.shapeExprOrRef, name: string, done?: DoneCallback) {
    this._write(
      this._encodeShapeName(name, false) +
        " " +
        this._writeShapeExpr(shape, done, true, 0).join(""),
      done
    );
  }

  // ### `addShapes` adds the shapes to the output stream
  addShapes (shapes: { shape: ShExJ.shapeExprOrRef, name: string }[]) {
    for (let i = 0; i < shapes.length; i++)
      this.addShape(shapes[i].shape, shapes[i].name);
  }

  // ### `addPrefix` adds the prefix to the output stream
  addPrefix (prefix: string, iri: string, done?: DoneCallback) {
    const prefixes: { [prefix: string]: string } = {};
    prefixes[prefix] = iri;
    this.addPrefixes(prefixes, done);
  }

  // ### `addPrefixes` adds the prefixes to the output stream
  addPrefixes (prefixes: { [prefix: string]: string } | undefined, done?: DoneCallback) {
    // Add all useful prefixes
    const prefixIRIs = this._prefixIRIs;
    let hasPrefixes = false;
    for (let prefix in prefixes) {
      // Verify whether the prefix can be used and does not exist yet
      const iri = prefixes[prefix];
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
      let IRIlist = '', prefixList = '';
      for (let prefixIRI in prefixIRIs) {
        IRIlist += IRIlist ? '|' + prefixIRI : prefixIRI;
        prefixList += (prefixList ? '|' : '') + prefixIRIs[prefixIRI];
      }
      IRIlist = IRIlist.replace(/[\]\/\(\)\*\+\?\.\\\$]/g, '\\$&');
      this._prefixRegex = new RegExp('^(?:' + prefixList + ')[^\/]*$|' +
                                     '^(' + IRIlist + ')([a-zA-Z][\\-_a-zA-Z0-9]*)$');
    }
    // End a prefix block with a newline
    this._write(hasPrefixes ? '\n' : '', done);
  }

  // ### `end` signals the end of the output stream
  end (done?: DoneCallback) {
    // Disallow further writing
    this._write = this._blockedWrite;

    // Try to end the underlying stream, ensuring done is called exactly one time
    let singleDone: DoneCallback | null | undefined = done && function (error?: any, result?: any) { singleDone = null, done(error, result); };
    if (this._endStream) {
      try { return this._outputStream.end(singleDone); }
      catch (error) { /* error closing stream */ }
    }
    singleDone && singleDone();
  }
}

// Replaces a character by its escaped version
function characterReplacer (character: string): string {
  // Replace a single character by its escaped version
  let result = ESCAPE_replacements[character];
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

function escapeCode (code: string): string {
  return code.replace(/\\/g, "\\\\").replace(/%/g, "\\%")
}

/** _throwError: overridable function to throw Errors().
 *
 * @param func (optional): function at which to truncate stack trace
 * @param str: error message
 */
function _throwError (func: Function | string, str?: string): never {
  if (typeof func !== "function") {
    str = func;
    func = _throwError;
  }
  const e = new Error(str);
  Error.captureStackTrace(e, func as Function);
  throw e;
}

// Expect property p with value v in object o
function expect (this: ShExWriter, o: any, p: string, v?: any) {
  if (!(p in o))
    this._error(expect, "expected "+o+" to have a ."+p);
  if (arguments.length > 2 && o[p] !== v)
    this._error(expect, "expected "+o[p]+" to equal ."+v);
}

// The empty function
function noop () {}

/* The runtime export is the ShExWriter class itself (module.exports = ShExWriter)
 * for compatibility with `new (require('@shexjs/writer'))(...)` callers.
 */
export = ShExWriter;
