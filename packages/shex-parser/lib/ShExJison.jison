/*
  jison Equivalent of accompanying bnf, developed in
  http://www.w3.org/2005/01/yacker/uploads/ShEx2

  Process:
    Started with yacker perl output.
    Made """{PNAME_LN} return 'PNAME_LN';""" lexer actions for refereneced terminals.
    Folded X_Opt back in to calling productions to eliminate conflicts.
      (X? didn't seem to accept null input during testing.)
    Stole as much as possible from sparql.jison
      https://github.com/RubenVerborgh/SPARQL.js
    including functions in the header. Some can be directly mapped to javascript
    functions:
      appendTo(A, B) === A.concat([B])
      unionAll(A, B) === A.concat(B)

  Mysteries:
    jison accepts X* but I wasn't able to eliminate eliminate X_Star because it
    wouldn't accept the next symbol.
*/

%{
  /*
    ShEx parser in the Jison parser generator format.
  */

  var UNBOUNDED = -1;

  var ShExUtil = require("@shexjs/core").Util;

  // Common namespaces and entities
  var RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      RDF_TYPE  = RDF + 'type',
      RDF_FIRST = RDF + 'first',
      RDF_REST  = RDF + 'rest',
      RDF_NIL   = RDF + 'nil',
      XSD = 'http://www.w3.org/2001/XMLSchema#',
      XSD_INTEGER  = XSD + 'integer',
      XSD_DECIMAL  = XSD + 'decimal',
      XSD_FLOAT   = XSD + 'float',
      XSD_DOUBLE   = XSD + 'double',
      XSD_BOOLEAN  = XSD + 'boolean',
      XSD_TRUE =  '"true"^^'  + XSD_BOOLEAN,
      XSD_FALSE = '"false"^^' + XSD_BOOLEAN,
      XSD_PATTERN        = XSD + 'pattern',
      XSD_MININCLUSIVE   = XSD + 'minInclusive',
      XSD_MINEXCLUSIVE   = XSD + 'minExclusive',
      XSD_MAXINCLUSIVE   = XSD + 'maxInclusive',
      XSD_MAXEXCLUSIVE   = XSD + 'maxExclusive',
      XSD_LENGTH         = XSD + 'length',
      XSD_MINLENGTH      = XSD + 'minLength',
      XSD_MAXLENGTH      = XSD + 'maxLength',
      XSD_TOTALDIGITS    = XSD + 'totalDigits',
      XSD_FRACTIONDIGITS = XSD + 'fractionDigits';

  var numericDatatypes = [
      XSD + "integer",
      XSD + "decimal",
      XSD + "float",
      XSD + "double",
      XSD + "string",
      XSD + "boolean",
      XSD + "dateTime",
      XSD + "nonPositiveInteger",
      XSD + "negativeInteger",
      XSD + "long",
      XSD + "int",
      XSD + "short",
      XSD + "byte",
      XSD + "nonNegativeInteger",
      XSD + "unsignedLong",
      XSD + "unsignedInt",
      XSD + "unsignedShort",
      XSD + "unsignedByte",
      XSD + "positiveInteger"
  ];

  var absoluteIRI = /^[a-z][a-z0-9+.-]*:/i,
    schemeAuthority = /^(?:([a-z][a-z0-9+.-]*:))?(?:\/\/[^\/]*)?/i,
    dotSegments = /(?:^|\/)\.\.?(?:$|[\/#?])/;

  var numericFacets = ["mininclusive", "minexclusive",
                       "maxinclusive", "maxexclusive"];

  // Returns a lowercase version of the given string
  function lowercase(string) {
    return string.toLowerCase();
  }

  // Appends the item to the array and returns the array
  function appendTo(array, item) {
    return array.push(item), array;
  }

  // Appends the items to the array and returns the array
  function appendAllTo(array, items) {
    return array.push.apply(array, items), array;
  }

  // Extends a base object with properties of other objects
  function extend(base) {
    if (!base) base = {};
    for (var i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
      for (var name in arg)
        base[name] = arg[name];
    return base;
  }

  // Creates an array that contains all items of the given arrays
  function unionAll() {
    var union = [];
    for (var i = 0, l = arguments.length; i < l; i++)
      union = union.concat.apply(union, arguments[i]);
    return union;
  }

  // N3.js:lib/N3Parser.js<0.4.5>:58 with
  //   s/this\./Parser./g
  // ### `_setBase` sets the base IRI to resolve relative IRIs.
  Parser._setBase = function (baseIRI) {
    if (!baseIRI)
      baseIRI = null;

    // baseIRI '#' check disabled to allow -x 'data:text/shex,...#'
    // else if (baseIRI.indexOf('#') >= 0)
    //   throw new Error('Invalid base IRI ' + baseIRI);

    // Set base IRI and its components
    if (Parser._base = baseIRI) {
      Parser._basePath   = baseIRI.replace(/[^\/?]*(?:\?.*)?$/, '');
      baseIRI = baseIRI.match(schemeAuthority);
      Parser._baseRoot   = baseIRI[0];
      Parser._baseScheme = baseIRI[1];
    }
  }

  // N3.js:lib/N3Parser.js<0.4.5>:576 with
  //   s/this\./Parser./g
  //   s/token/iri/
  // ### `_resolveIRI` resolves a relative IRI token against the base path,
  // assuming that a base path has been set and that the IRI is indeed relative.
  function _resolveIRI (iri) {
    switch (iri[0]) {
    // An empty relative IRI indicates the base IRI
    case undefined: return Parser._base;
    // Resolve relative fragment IRIs against the base IRI
    case '#': return Parser._base + iri;
    // Resolve relative query string IRIs by replacing the query string
    case '?': return Parser._base.replace(/(?:\?.*)?$/, iri);
    // Resolve root-relative IRIs at the root of the base IRI
    case '/':
      // Resolve scheme-relative IRIs to the scheme
      return (iri[1] === '/' ? Parser._baseScheme : Parser._baseRoot) + _removeDotSegments(iri);
    // Resolve all other IRIs at the base IRI's path
    default: {
      return _removeDotSegments(Parser._basePath + iri);
    }
    }
  }

  // ### `_removeDotSegments` resolves './' and '../' path segments in an IRI as per RFC3986.
  function _removeDotSegments (iri) {
    // Don't modify the IRI if it does not contain any dot segments
    if (!dotSegments.test(iri))
      return iri;

    // Start with an imaginary slash before the IRI in order to resolve trailing './' and '../'
    var result = '', length = iri.length, i = -1, pathStart = -1, segmentStart = 0, next = '/';

    while (i < length) {
      switch (next) {
      // The path starts with the first slash after the authority
      case ':':
        if (pathStart < 0) {
          // Skip two slashes before the authority
          if (iri[++i] === '/' && iri[++i] === '/')
            // Skip to slash after the authority
            while ((pathStart = i + 1) < length && iri[pathStart] !== '/')
              i = pathStart;
        }
        break;
      // Don't modify a query string or fragment
      case '?':
      case '#':
        i = length;
        break;
      // Handle '/.' or '/..' path segments
      case '/':
        if (iri[i + 1] === '.') {
          next = iri[++i + 1];
          switch (next) {
          // Remove a '/.' segment
          case '/':
            result += iri.substring(segmentStart, i - 1);
            segmentStart = i + 1;
            break;
          // Remove a trailing '/.' segment
          case undefined:
          case '?':
          case '#':
            return result + iri.substring(segmentStart, i) + iri.substr(i + 1);
          // Remove a '/..' segment
          case '.':
            next = iri[++i + 1];
            if (next === undefined || next === '/' || next === '?' || next === '#') {
              result += iri.substring(segmentStart, i - 2);
              // Try to remove the parent path from result
              if ((segmentStart = result.lastIndexOf('/')) >= pathStart)
                result = result.substr(0, segmentStart);
              // Remove a trailing '/..' segment
              if (next !== '/')
                return result + '/' + iri.substr(i + 1);
              segmentStart = i + 1;
            }
          }
        }
      }
      next = iri[++i];
    }
    return result + iri.substring(segmentStart);
  }

  // Creates an expression with the given type and attributes
  function expression(expr, attr) {
    var expression = { expression: expr };
    if (attr)
      for (var a in attr)
        expression[a] = attr[a];
    return expression;
  }

  // Creates a path with the given type and items
  function path(type, items) {
    return { type: 'path', pathType: type, items: items };
  }

  // Creates a literal with the given value and type
  function createLiteral(value, type) {
    return { value: value, type: type };
  }

  // Creates a new blank node identifier
  function blank() {
    return '_:b' + blankId++;
  };
  var blankId = 0;
  Parser._resetBlanks = function () { blankId = 0; }
  Parser.reset = function () {
    Parser._prefixes = Parser._imports = Parser.shapes = Parser.productions = Parser.start = Parser.startActs = null; // Reset state.
    Parser._base = Parser._baseIRI = Parser._baseIRIPath = Parser._baseIRIRoot = null;
  }
  var _fileName; // for debugging
  Parser._setFileName = function (fn) { _fileName = fn; }

  // Regular expression and replacement strings to escape strings
  var stringEscapeReplacements = { '\\': '\\', "'": "'", '"': '"',
                                   't': '\t', 'b': '\b', 'n': '\n', 'r': '\r', 'f': '\f' },
      semactEscapeReplacements = { '\\': '\\', '%': '%' },
      pnameEscapeReplacements = {
        '\\': '\\', "'": "'", '"': '"',
        'n': '\n', 'r': '\r', 't': '\t', 'f': '\f', 'b': '\b',
        '_': '_', '~': '~', '.': '.', '-': '-', '!': '!', '$': '$', '&': '&',
        '(': '(', ')': ')', '*': '*', '+': '+', ',': ',', ';': ';', '=': '=',
        '/': '/', '?': '?', '#': '#', '@': '@', '%': '%',
      };


  // Translates string escape codes in the string into their textual equivalent
  function unescapeString(string, trimLength) {
    string = string.substring(trimLength, string.length - trimLength);
    return { value: ShExUtil.unescapeText(string, stringEscapeReplacements) };
  }

  function unescapeLangString(string, trimLength) {
    var at = string.lastIndexOf("@");
    var lang = string.substr(at);
    string = string.substr(0, at);
    var u = unescapeString(string, trimLength);
    return extend(u, { language: lowercase(lang.substr(1)) });
  }

  // Translates regular expression escape codes in the string into their textual equivalent
  function unescapeRegexp (regexp) {
    var end = regexp.lastIndexOf("/");
    var s = regexp.substr(1, end-1);
    var regexpEscapeReplacements = {
      '.': "\\.", '\\': "\\\\", '?': "\\?", '*': "\\*", '+': "\\+",
      '{': "\\{", '}': "\\}", '(': "\\(", ')': "\\)", '|': "\\|",
      '^': "\\^", '$': "\\$", '[': "\\[", ']': "\\]", '/': "\\/",
      't': '\\t', 'n': '\\n', 'r': '\\r', '-': "\\-", '/': '/'
    };
    s = ShExUtil.unescapeText(s, regexpEscapeReplacements)
    var ret = {
      pattern: s
    };
    if (regexp.length > end+1)
      ret.flags = regexp.substr(end+1);
    return ret;
  }

  // Convenience function to return object with p1 key, value p2
  function keyValObject(key, val) {
    var ret = {};
    ret[key] = val;
    return ret;
  }

  // Return object with p1 key, p2 string value
  function unescapeSemanticAction(key, string) {
    string = string.substring(1, string.length - 2);
    return {
      type: "SemAct",
      name: key,
      code: ShExUtil.unescapeText(string, semactEscapeReplacements)
    };
  }

  function error (msg) {
    Parser.reset();
    throw new Error(msg);
  }

  // Expand declared prefix or throw Error
  function expandPrefix (prefix) {
    if (!(prefix in Parser._prefixes))
      error('Parse error; unknown prefix: ' + prefix);
    return Parser._prefixes[prefix];
  }

  // Add a shape to the map
  function addShape (label, shape) {
    if (Parser.productions && label in Parser.productions)
      error("Structural error: "+label+" is a shape");
    if (!Parser.shapes)
      Parser.shapes = new Map();
    if (label in Parser.shapes) {
      if (Parser.options.duplicateShape === "replace")
        Parser.shapes[label] = shape;
      else if (Parser.options.duplicateShape !== "ignore")
        error("Parse error: "+label+" already defined");
    } else {
      shape.id = label;
      Parser.shapes[label] = shape;
    }
  }

  // Add a production to the map
  function addProduction (label, production) {
    if (Parser.shapes && label in Parser.shapes)
      error("Structural error: "+label+" is a shape");
    if (!Parser.productions)
      Parser.productions = new Map();
    if (label in Parser.productions) {
      if (Parser.options.duplicateShape === "replace")
        Parser.productions[label] = production;
      else if (Parser.options.duplicateShape !== "ignore")
        error("Parse error: "+label+" already defined");
    } else
      Parser.productions[label] = production;
  }

  // shapeJunction judiciously takes a shapeAtom and an optional list of con/disjuncts.
  // No created Shape{And,Or,Not} will have a `nested` shapeExpr.
  // Don't nonest arguments to shapeJunction.
  // shapeAtom emits `nested` so nonest every argument that can be a shapeAtom, i.e.
  //   shapeAtom, inlineShapeAtom, shapeAtomNoRef
  //   {,inline}shape{And,Or,Not}
  //   this does NOT include shapeOrRef or nodeConstraint.
  function shapeJunction (type, shapeAtom, juncts) {
    if (juncts.length === 0) {
      return nonest(shapeAtom);
    } else if (shapeAtom.type === type && !shapeAtom.nested) {
      nonest(shapeAtom).shapeExprs = nonest(shapeAtom).shapeExprs.concat(juncts);
      return shapeAtom;
    } else {
      return { type: type, shapeExprs: [nonest(shapeAtom)].concat(juncts) };
    }
  }

  // strip out .nested attribute
  function nonest (shapeAtom) {
    delete shapeAtom.nested;
    return shapeAtom;
  }

  var EmptyObject = {  };
  var EmptyShape = { type: "Shape" };
%}

/* lexical grammar */
%lex

IT_BASE                 [Bb][Aa][Ss][Ee]
IT_PREFIX               [Pp][Rr][Ee][Ff][Ii][Xx]
IT_IMPORT               [iI][mM][pP][oO][rR][tT]
IT_START                [sS][tT][aA][rR][tT]
IT_EXTERNAL             [eE][xX][tT][eE][rR][nN][aA][lL]
IT_ABSTRACT             [Aa][Bb][Ss][Tt][Rr][Aa][Cc][Tt]
IT_RESTRICTS		[Rr][Ee][Ss][Tt][Rr][Ii][Cc][Tt][Ss]
IT_EXTENDS		[Ee][Xx][Tt][Ee][Nn][Dd][Ss]
IT_CLOSED               [Cc][Ll][Oo][Ss][Ee][Dd]
IT_EXTRA                [Ee][Xx][Tt][Rr][Aa]
IT_LITERAL              [Ll][Ii][Tt][Ee][Rr][Aa][Ll]
IT_BNODE                [Bb][Nn][Oo][Dd][Ee]
IT_IRI                  [Ii][Rr][Ii]
IT_NONLITERAL           [Nn][Oo][Nn][Ll][Ii][Tt][Ee][Rr][Aa][Ll]
IT_AND                  [Aa][Nn][Dd]
IT_OR                   [Oo][Rr]
IT_NOT                  [No][Oo][Tt]
IT_ON                   [Oo][Nn]
IT_SHAPE                [Ss][Hh][Aa][Pp][Ee]
IT_EXPRESSION           [Ee][Xx][Pp][Rr][Ee][Ss][Ss][Ii][Oo][Nn]
IT_MININCLUSIVE         [Mm][Ii][Nn][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]
IT_MINEXCLUSIVE         [Mm][Ii][Nn][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]
IT_MAXINCLUSIVE         [Mm][Aa][Xx][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]
IT_MAXEXCLUSIVE         [Mm][Aa][Xx][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]
IT_LENGTH               [Ll][Ee][Nn][Gg][Tt][Hh]
IT_MINLENGTH            [Mm][Ii][Nn][Ll][Ee][Nn][Gg][Tt][Hh]
IT_MAXLENGTH            [Mm][Aa][Xx][Ll][Ee][Nn][Gg][Tt][Hh]
IT_TOTALDIGITS          [Tt][Oo][Tt][Aa][Ll][Dd][Ii][Gg][Ii][Tt][Ss]
IT_FRACTIONDIGITS       [Ff][Rr][Aa][Cc][Tt][Ii][Oo][Nn][Dd][Ii][Gg][Ii][Tt][Ss]
LANGTAG                 "@"([A-Za-z])+(("-"([0-9A-Za-z])+))*
INTEGER                 ([+-])?([0-9])+
REPEAT_RANGE            "{"({INTEGER})((","(({INTEGER})|'*')?))?"}"
DECIMAL                 ([+-])?([0-9])*"."([0-9])+
EXPONENT                [Ee]([+-])?([0-9])+
DOUBLE                  ([+-])?((([0-9])+"."([0-9])*({EXPONENT}))|((".")?([0-9])+({EXPONENT})))
ECHAR                   "\\"[\"\'\\bfnrt]
WS                      (" ")|(("\t")|(("\r")|("\n")))
//ANON                  "\["(({WS}))*"\]"
PN_CHARS_BASE           [A-Z] | [a-z] | [\u00c0-\u00d6] | [\u00d8-\u00f6] | [\u00f8-\u02ff] | [\u0370-\u037d] | [\u037f-\u1fff] | [\u200c-\u200d] | [\u2070-\u218f] | [\u2c00-\u2fef] | [\u3001-\ud7ff] | [\uf900-\ufdcf] | [\ufdf0-\ufffd] | [\uD800-\uDB7F][\uDC00-\uDFFF] // UTF-16 surrogates for [\U00010000-\U000effff]
PN_CHARS_U              {PN_CHARS_BASE} | '_' | '_' /* !!! raise jison bug */
PN_CHARS                {PN_CHARS_U} | '-' | [0-9] | [\u00b7] | [\u0300-\u036f] | [\u203f-\u2040]
REGEXP                  '/' ([^\u002f\u005C\u000A\u000D] | '\\' [nrt\\|.?*+(){}$\u002D\u005B\u005D\u005E/] | {UCHAR})+ '/' [smix]*
BLANK_NODE_LABEL        '_:' ({PN_CHARS_U} | [0-9]) (({PN_CHARS} | '.')* {PN_CHARS})?
//ATBLANK_NODE_LABEL        '@_:' ({PN_CHARS_U} | [0-9]) (({PN_CHARS} | '.')* {PN_CHARS})?
PN_PREFIX               {PN_CHARS_BASE} (({PN_CHARS} | '.')* {PN_CHARS})?
PNAME_NS                {PN_PREFIX}? ':'
ATPNAME_NS              '@' {PNAME_NS}
HEX                     [0-9] | [A-F] | [a-f]
PERCENT                 '%' {HEX} {HEX}
UCHAR                   '\\u' {HEX} {HEX} {HEX} {HEX} | '\\U' {HEX} {HEX} {HEX} {HEX} {HEX} {HEX} {HEX} {HEX}
CODE                    "{" ([^%\\] | "\\"[%\\] | {UCHAR})* "%}"

STRING_LITERAL1         "'" ([^\u0027\u005c\u000a\u000d] | {ECHAR} | {UCHAR})* "'" /* #x27=' #x5C=\ #xA=new line #xD=carriage return */
STRING_LITERAL2         '"' ([^\u0022\u005c\u000a\u000d] | {ECHAR} | {UCHAR})* '"' /* #x22=" #x5C=\ #xA=new line #xD=carriage return */
STRING_LITERAL_LONG1    "'''" (("'" | "''")? ([^\'\\] | {ECHAR} | {UCHAR}))* "'''"
//NON_TERMINATED_STRING_LITERAL_LONG1    "'''"
STRING_LITERAL_LONG2    '"""' (('"' | '""')? ([^\"\\] | {ECHAR} | {UCHAR}))* '"""'
//NON_TERMINATED_STRING_LITERAL_LONG2    '"""'

LANG_STRING_LITERAL1         "'" ([^\u0027\u005c\u000a\u000d] | {ECHAR} | {UCHAR})* "'" {LANGTAG}
LANG_STRING_LITERAL2         '"' ([^\u0022\u005c\u000a\u000d] | {ECHAR} | {UCHAR})* '"' {LANGTAG}
LANG_STRING_LITERAL_LONG1    "'''" (("'" | "''")? ([^\'\\] | {ECHAR} | {UCHAR}))* "'''" {LANGTAG}
LANG_STRING_LITERAL_LONG2    '"""' (('"' | '""')? ([^\"\\] | {ECHAR} | {UCHAR}))* '"""' {LANGTAG}

IRIREF                  '<' ([^\u0000-\u0020<>\"{}|^`\\] | {UCHAR})* '>' /* #x00=NULL #01-#x1F=control codes #x20=space */
//ATIRIREF              '@<' ([^\u0000-\u0020<>\"{}|^`\\] | {UCHAR})* '>' /* #x00=NULL #01-#x1F=control codes #x20=space */
PN_LOCAL_ESC            '\\' ('_' | '~' | '.' | '-' | '!' | '$' | '&' | "'" | '(' | ')' | '*' | '+' | ',' | ';' | '=' | '/' | '?' | '#' | '@' | '%')
PLX                     {PERCENT} | {PN_LOCAL_ESC}
PN_LOCAL                ({PN_CHARS_U} | ':' | [0-9] | {PLX}) ({PN_CHARS} | '.' | ':' | {PLX})*
PNAME_LN                {PNAME_NS} {PN_LOCAL}
ATPNAME_LN              '@' {PNAME_LN}
COMMENT                 '#' [^\u000a\u000d]* | "/*" ([^*] | '*' ([^/] | '\\/'))* "*/"

%%

\s+|{COMMENT} /**/
{ATPNAME_LN}            return 'ATPNAME_LN';
// {ATIRIREF}           return 'ATIRIREF';
{ATPNAME_NS}            return 'ATPNAME_NS';
// {ATBLANK_NODE_LABEL} return 'ATBLANK_NODE_LABEL';
{LANGTAG}               { yytext = yytext.substr(1); return 'LANGTAG'; }
"@"                     return '@';
{PNAME_LN}              return 'PNAME_LN';
{REPEAT_RANGE}          return 'REPEAT_RANGE';
{DOUBLE}                return 'DOUBLE';
{DECIMAL}               return 'DECIMAL';
//{EXPONENT}            return 'EXPONENT';
{INTEGER}               return 'INTEGER';
//{ECHAR}               return 'ECHAR';
//{WS}                  return 'WS';
{ANON}                  return 'ANON';
{IRIREF}                return 'IRIREF';
{PNAME_NS}              return 'PNAME_NS';
"a"                     return 'a';
//{PN_CHARS_BASE}       return 'PN_CHARS_BASE';
//{PN_CHARS_U}          return 'PN_CHARS_U';
//{PN_CHARS}            return 'PN_CHARS';
{REGEXP}                return 'REGEXP';
{BLANK_NODE_LABEL}      return 'BLANK_NODE_LABEL';
//{PN_PREFIX}           return 'PN_PREFIX';
//{HEX}                 return 'HEX';
//{PERCENT}             return 'PERCENT';
//{UCHAR}               return 'UCHAR';
{CODE}                  return 'CODE';

{LANG_STRING_LITERAL_LONG1}  return 'LANG_STRING_LITERAL_LONG1';
{LANG_STRING_LITERAL_LONG2}  return 'LANG_STRING_LITERAL_LONG2';
{LANG_STRING_LITERAL1}       return 'LANG_STRING_LITERAL1';
{LANG_STRING_LITERAL2}       return 'LANG_STRING_LITERAL2';

{STRING_LITERAL_LONG1}  return 'STRING_LITERAL_LONG1';
//{NON_TERMINATED_STRING_LITERAL_LONG1}   return 'NON_TERMINATED_STRING_LITERAL_LONG2';
{STRING_LITERAL_LONG2}  return 'STRING_LITERAL_LONG2';
//{NON_TERMINATED_STRING_LITERAL_LONG2}   return 'NON_TERMINATED_STRING_LITERAL_LONG2';
{STRING_LITERAL1}       return 'STRING_LITERAL1';
{STRING_LITERAL2}       return 'STRING_LITERAL2';

//{PN_LOCAL_ESC}        return 'PN_LOCAL_ESC';
//{PLX}                 return 'PLX';
//{PN_LOCAL}            return 'PN_LOCAL';
{IT_BASE}               return 'IT_BASE';
{IT_PREFIX}             return 'IT_PREFIX';
{IT_IMPORT}             return 'IT_IMPORT';
{IT_START}              return 'IT_start';
{IT_EXTERNAL}           return 'IT_EXTERNAL';
{IT_ABSTRACT}           return 'IT_ABSTRACT';
{IT_RESTRICTS}		return 'IT_RESTRICTS';
{IT_EXTENDS}		return 'IT_EXTENDS';
{IT_CLOSED}             return 'IT_CLOSED';
{IT_EXTRA}              return 'IT_EXTRA';
{IT_LITERAL}            return 'IT_LITERAL';
{IT_BNODE}              return 'IT_BNODE';
{IT_IRI}                return 'IT_IRI';
{IT_NONLITERAL}         return 'IT_NONLITERAL';
{IT_AND}                return 'IT_AND';
{IT_OR}                 return 'IT_OR';
{IT_NOT}                return 'IT_NOT';
{IT_ON}                 return 'IT_ON';
{IT_SHAPE}              return 'IT_SHAPE';
{IT_EXPRESSION}         return 'IT_EXPRESSION';
{IT_MININCLUSIVE}       return 'IT_MININCLUSIVE';
{IT_MINEXCLUSIVE}       return 'IT_MINEXCLUSIVE';
{IT_MAXINCLUSIVE}       return 'IT_MAXINCLUSIVE';
{IT_MAXEXCLUSIVE}       return 'IT_MAXEXCLUSIVE';
{IT_LENGTH}             return 'IT_LENGTH';
{IT_MINLENGTH}          return 'IT_MINLENGTH';
{IT_MAXLENGTH}          return 'IT_MAXLENGTH';
{IT_TOTALDIGITS}        return 'IT_TOTALDIGITS';
{IT_FRACTIONDIGITS}     return 'IT_FRACTIONDIGITS';
"="                     return '=';
"//"                    return '//';
"{"                     return '{';
"}"                     return '}';
"&"                     return '&';
"||"                    return '||';
"|"                     return '|';
","                     return ',';
"("                     return '(';
")"                     return ')';
"["                     return '[';
"]"                     return ']';
"$"                     return '$';
"!"                     return '!';
"^^"                    return '^^';
"^"                     return '^';
"."                     return '.';
"~"                     return '~';
";"                     return ';';
"*"                     return '*';
"+"                     return '+';
"?"                     return '?';
"-"                     return '-';
"%"                     return '%';
"true"                  return 'IT_true';
"false"                 return 'IT_false';
<<EOF>>                 return 'EOF';
[a-zA-Z0-9_-]+          return 'unexpected word "'+yytext+'"';
.                       return 'invalid character '+yytext;

/lex

/* operator associations and precedence */

%start shexDoc

%% /* language grammar */

shexDoc:
      _initParser _Qdirective_E_Star _Q_O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C_E_Opt EOF	{
        let imports = Object.keys(Parser._imports).length ? { imports: Parser._imports } : {}
        var startObj = Parser.start ? { start: Parser.start } : {};
        var startActs = Parser.startActs ? { startActs: Parser.startActs } : {};
        let shapes = Parser.shapes ? { shapes: Object.values(Parser.shapes) } : {};
        var shexj = Object.assign(
          { type: "Schema" }, imports, startActs, startObj, shapes
        )
        if (Parser.options.index) {
          if (Parser._base !== null)
            shexj._base = Parser._base;
          shexj._prefixes = Parser._prefixes;
          shexj._index = {
            shapeExprs: Parser.shapes || new Map(),
            tripleExprs: Parser.productions || new Map()
          };
        }
        Parser.reset();
        return shexj;
      }
    ;

_initParser: // I don't know how else to get ahold of the lexer.
      	{ yy.parser.yy = { lexer: yy.lexer} ; } // parser.yy is user API space.
    ;

_Qdirective_E_Star:
      	
    | _Qdirective_E_Star directive	
    ;

_O_QnotStartAction_E_Or_QstartActions_E_C:
      notStartAction	
    | startActions	
    ;

_Qstatement_E_Star:
      	
    | _Qstatement_E_Star statement	
    ;

_O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C:
      _O_QnotStartAction_E_Or_QstartActions_E_C _Qstatement_E_Star	// t: 1dot
    ;

_Q_O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C_E_Opt:
      	// t: @@
    | _O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C	// t: 1dot
    ;

directive:
      baseDecl	// t: @@
    | prefixDecl	// t: 1dotLNex
    | importDecl	// t: @@
    ;

baseDecl:
      IT_BASE IRIREF	{ // t: @@
        Parser._setBase(Parser._base === null ||
                    absoluteIRI.test($2.slice(1, -1)) ? $2.slice(1, -1) : _resolveIRI($2.slice(1, -1)));
      }
    ;

prefixDecl:
      IT_PREFIX PNAME_NS iri	{ // t: ShExParser-test.js/with pre-defined prefixes
        Parser._prefixes[$2.slice(0, -1)] = $3;
      }
    ;

importDecl:
      IT_IMPORT iri	{ // t: @@
        Parser._imports.push($2);
      }
    ;

notStartAction:
      start	// t: startCode1startRef
    | shapeExprDecl	// t: 1iriRef1 1val1vsMinusiri3??
    ;

start:
      IT_start '=' shapeAnd _Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Star	{
        if (Parser.start)
          error("Parse error: start already defined");
        Parser.start = shapeJunction("ShapeOr", $3, $4); // t: startInline
      }
    ;

startActions:
      _QcodeDecl_E_Plus	{
        Parser.startActs = $1; // t: startCode1
      }
    ;

_QcodeDecl_E_Plus:
      codeDecl	-> [$1] // t: startCode1
    | _QcodeDecl_E_Plus codeDecl	-> appendTo($1, $2) // t: startCode3
    ;

statement:
      directive	// t: open1dotclose
    | notStartAction	// t: @@
    ;

shapeExprDecl:
      _QIT_ABSTRACT_E_Opt shapeExprLabel _Qrestriction_E_Star _O_QshapeExpression_E_Or_QIT_EXTERNAL_E_C	{ // t: 1dot 1val1vsMinusiri3??
        if ($1.abstract || $3.length) { // t: $1: 1dotAbstractShapeCode1  $2: @@
          addShape($2, Object.assign({type: "ShapeDecl"}, $1,
                                     $3.length > 0 ? { restricts: $3 } : { },
                                     {shapeExpr: $4})) // $5: t: @@
        } else {
          addShape($2,  $4);
        }
      }
    ;

_QIT_ABSTRACT_E_Opt:
      	-> {  }
    | IT_ABSTRACT	-> { abstract: true }
    ;

_Qrestriction_E_Star:
      	-> [] // t: 1dot, 1dotAnnot3
    | _Qrestriction_E_Star restriction	-> appendTo($1, $2) // t: 1dotAnnot3
    ;

_O_QshapeExpression_E_Or_QIT_EXTERNAL_E_C:
      // _QstringFacet_E_Star shapeExpression	{
      //   if (Object.keys($1).length === 0) { $$ = $2; }
      //   // else if ($2.type === "NodeConstraint") { $$ = extend($2, $2); } // delme
      //   else { $$ = { type: "ShapeAnd",
      //                 shapeExprs: [
      //                   extend({ type: "NodeConstraint" }, $1),
      //                   $2 ]
      //               };
      //        }
      // }
      shapeExpression	{
        $$ = nonest($1);
      }
    | IT_EXTERNAL	-> { type: "ShapeExternal" }
    ;

shapeExpression:
      _QIT_NOT_E_Opt shapeAtomNoRef _QshapeOr_E_Opt	{
        if ($1)
          $2 = { type: "ShapeNot", "shapeExpr": nonest($2) }; // t:@@
        if ($3) { // If there were disjuncts,
          //           shapeOr will have $3.set needsAtom.
          //           Prepend $3.needsAtom with $2.
          //           Note that $3 may be a ShapeOr or a ShapeAnd.
          $3.needsAtom.unshift(nonest($2));
          delete $3.needsAtom;
          $$ = $3;
        } else {
          $$ = $2;
        }
      }
    | IT_NOT shapeRef _QshapeOr_E_Opt	{
        $2 = { type: "ShapeNot", "shapeExpr": nonest($2) } // !!! opt
        if ($3) { // If there were disjuncts,
          //           shapeOr will have $3.set needsAtom.
          //           Prepend $3.needsAtom with $2.
          //           Note that $3 may be a ShapeOr or a ShapeAnd.
          $3.needsAtom.unshift(nonest($2));
          delete $3.needsAtom;
          $$ = $3;
        } else {
          $$ = $2;
        }
      }
    | shapeRef shapeOr	{
        $2.needsAtom.unshift(nonest($1));
        delete $2.needsAtom;
        $$ = $2; // { type: "ShapeOr", "shapeExprs": [$1].concat($2) };
      }
    ;

_QshapeOr_E_Opt:
      	-> null
    | shapeOr	-> $1
    ;

inlineShapeExpression:
      inlineShapeOr	
    ;

shapeOr: // Sets .needsAtom to tell shapeExpression where to place leading shapeAtom.
      _Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Plus	{ // returns a ShapeOr
        var disjuncts = $1.map(nonest);
        $$ = { type: "ShapeOr", shapeExprs: disjuncts, needsAtom: disjuncts }; // t: @@
      }
    | _Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Plus _Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Star	{ // returns a ShapeAnd
        // $1 could have implicit conjuncts and explicit nested ANDs (will have .nested: true)
        $1.filter(c => c.type === "ShapeAnd").length === $1.length
        var and = {
          type: "ShapeAnd",
          shapeExprs: $1.reduce(
            (acc, elt) =>
              acc.concat(elt.type === 'ShapeAnd' && !elt.nested ? elt.shapeExprs : nonest(elt)), []
          )
        };
        $$ = $2.length > 0 ? { type: "ShapeOr", shapeExprs: [and].concat($2.map(nonest)) } : and; // t: @@
        $$.needsAtom = and.shapeExprs;
      }
    ;

_O_QIT_OR_E_S_QshapeAnd_E_C:
      IT_OR shapeAnd	-> $2
    ;

_Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Plus:
      _O_QIT_OR_E_S_QshapeAnd_E_C	-> [$1]
    | _Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Plus _O_QIT_OR_E_S_QshapeAnd_E_C	-> $1.concat($2)
    ;

_O_QIT_AND_E_S_QshapeNot_E_C:
      IT_AND shapeNot	-> $2
    ;

_Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Plus:
      _O_QIT_AND_E_S_QshapeNot_E_C	-> [$1]
    | _Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Plus _O_QIT_AND_E_S_QshapeNot_E_C	-> $1.concat($2)
    ;

_Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Star:
      	-> []
    | _Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Star _O_QIT_OR_E_S_QshapeAnd_E_C	-> $1.concat($2)
    ;

inlineShapeOr:
      inlineShapeAnd _Q_O_QIT_OR_E_S_QinlineShapeAnd_E_C_E_Star	-> shapeJunction("ShapeOr", $1, $2)
    ;

_O_QIT_OR_E_S_QinlineShapeAnd_E_C:
      IT_OR inlineShapeAnd	-> $2
    ;

_Q_O_QIT_OR_E_S_QinlineShapeAnd_E_C_E_Star:
      	-> []
    | _Q_O_QIT_OR_E_S_QinlineShapeAnd_E_C_E_Star _O_QIT_OR_E_S_QinlineShapeAnd_E_C	-> $1.concat($2)
    ;

shapeAnd:
      shapeNot _Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Star	-> shapeJunction("ShapeAnd", $1, $2) // t: @@
    ;

_Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Star:
      	-> []
    | _Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Star _O_QIT_AND_E_S_QshapeNot_E_C	-> $1.concat($2)
    ;

inlineShapeAnd:
      inlineShapeNot _Q_O_QIT_AND_E_S_QinlineShapeNot_E_C_E_Star	-> shapeJunction("ShapeAnd", $1, $2) // t: @@
    ;

_O_QIT_AND_E_S_QinlineShapeNot_E_C:
      IT_AND inlineShapeNot	-> $2
    ;

_Q_O_QIT_AND_E_S_QinlineShapeNot_E_C_E_Star:
      	-> []
    | _Q_O_QIT_AND_E_S_QinlineShapeNot_E_C_E_Star _O_QIT_AND_E_S_QinlineShapeNot_E_C	-> $1.concat($2)
    ;

shapeNot:
      _QIT_NOT_E_Opt shapeAtom	-> $1 ? { type: "ShapeNot", "shapeExpr": nonest($2) } /* t:@@ */ : $2
    ;

_QIT_NOT_E_Opt:
      	-> false
    | IT_NOT	-> true
    ;

inlineShapeNot:
      _QIT_NOT_E_Opt inlineShapeAtom	-> $1 ? { type: "ShapeNot", "shapeExpr": nonest($2) } /* t: 1NOTNOTdot, 1NOTNOTIRI, 1NOTNOTvs */ : $2
    ;

shapeAtom:
      nonLitNodeConstraint _QshapeOrRef_E_Opt	
        -> $2 ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $1), $2 ] } : $1
    | litNodeConstraint	
    | shapeOrRef _QnonLitNodeConstraint_E_Opt	
        -> $2 ? shapeJunction("ShapeAnd", $1, [$2]) /* t: 1dotRef1 */ : $1 // t:@@
    | '(' shapeExpression ')'	-> Object.assign($2, {nested: true}) // t: 1val1vsMinusiri3
    | '.'	-> EmptyShape // t: 1dot
    ;

_QshapeOrRef_E_Opt:
      	
    | shapeOrRef	
    ;

_QnonLitNodeConstraint_E_Opt:
      	
    | nonLitNodeConstraint	
    ;

shapeAtomNoRef:
      nonLitNodeConstraint _QshapeOrRef_E_Opt	
        -> $2 ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $1), $2 ] } : $1
    | litNodeConstraint	
    | shapeDefinition _QnonLitNodeConstraint_E_Opt	
	-> $2 ? shapeJunction("ShapeAnd", $1, [$2]) /* t:@@ */ : $1	 // t: 1dotRef1 -- use _QnonLitNodeConstraint_E_Opt like below?
    | '(' shapeExpression ')'	-> Object.assign($2, {nested: true}) // t: 1val1vsMinusiri3
    | '.'	-> EmptyShape // t: 1dot
    ;

inlineShapeAtom:
      nonLitInlineNodeConstraint _QinlineShapeOrRef_E_Opt	
        -> $2 ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $1), $2 ] } : $1
    | litInlineNodeConstraint	
    | inlineShapeOrRef _QnonLitInlineNodeConstraint_E_Opt	
        -> $2 ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $1), $2 ] } : $1 // t: !! look to 1dotRef1
    | '(' shapeExpression ')'	-> Object.assign($2, {nested: true}) // t: 1val1vsMinusiri3
    | '.'	-> EmptyShape // t: 1dot
    ;

_QinlineShapeOrRef_E_Opt:
      	
    | inlineShapeOrRef	
    ;

_QnonLitInlineNodeConstraint_E_Opt:
      	
    | nonLitInlineNodeConstraint	
    ;

shapeOrRef:
      shapeDefinition	// t: 1dotInline1
    | shapeRef	
    ;

inlineShapeOrRef:
      inlineShapeDefinition	// t: 1dotInline1
    | shapeRef	
    ;

shapeRef:
      ATPNAME_LN	{ // t: 1dotRefLNex@@
        $1 = $1.substr(1, $1.length-1);
        var namePos = $1.indexOf(':');
        $$ = expandPrefix($1.substr(0, namePos)) + $1.substr(namePos + 1); // ShapeRef
      }
    | ATPNAME_NS	{ // t: 1dotRefNS1@@
        $1 = $1.substr(1, $1.length-1);
        $$ = expandPrefix($1.substr(0, $1.length - 1)); // ShapeRef
      }
    | '@' shapeExprLabel	-> $2 // ShapeRef // t: 1dotRef1, 1dotRefSpaceLNex, 1dotRefSpaceNS1
    ;

litNodeConstraint:
      litInlineNodeConstraint _Qannotation_E_Star semanticActions	{ // t: !!
        $$ = $1
        if ($2.length) { $$.annotations = $2; } // t: !!
        if ($3) { $$.semActs = $3.semActs; } // t: !!
      }
    ;

_Qannotation_E_Star:
      	-> [] // t: 1dot, 1dotAnnot3
    | _Qannotation_E_Star annotation	-> appendTo($1, $2) // t: 1dotAnnot3
    ;

nonLitNodeConstraint:
      nonLitInlineNodeConstraint _Qannotation_E_Star semanticActions	{ // t: !!
        $$ = $1
        if ($2.length) { $$.annotations = $2; } // t: !!
        if ($3) { $$.semActs = $3.semActs; } // t: !!
      }
    ;

litInlineNodeConstraint:
      IT_LITERAL _QxsFacet_E_Star	-> extend({ type: "NodeConstraint", nodeKind: "literal" }, $2) // t: 1literalPattern
    | datatype _QxsFacet_E_Star	{
        if (numericDatatypes.indexOf($1) === -1)
          numericFacets.forEach(function (facet) {
            if (facet in $2)
              error("Parse error: facet " + facet + " not allowed for unknown datatype " + $1);
          });
        $$ = extend({ type: "NodeConstraint", datatype: $1 }, $2) // t: 1datatype
      }
    | valueSet _QxsFacet_E_Star	-> { type: "NodeConstraint", values: $1 } // t: 1val1IRIREF
    | _QnumericFacet_E_Plus	-> extend({ type: "NodeConstraint"}, $1)
    ;

_QxsFacet_E_Star:
      	-> {} // t: 1literalPattern
    | _QxsFacet_E_Star xsFacet	{
        if (Object.keys($1).indexOf(Object.keys($2)[0]) !== -1) {
          error("Parse error: facet "+Object.keys($2)[0]+" defined multiple times");
        }
        $$ = extend($1, $2) // t: 1literalLength
      }
    ;

_QnumericFacet_E_Plus:
      numericFacet	// t: !! look to 1literalPattern
    | _QnumericFacet_E_Plus numericFacet	{
        if (Object.keys($1).indexOf(Object.keys($2)[0]) !== -1) {
          error("Parse error: facet "+Object.keys($2)[0]+" defined multiple times");
        }
        $$ = extend($1, $2) // t: !! look to 1literalLength
      }
    ;

nonLitInlineNodeConstraint:
      nonLiteralKind _QstringFacet_E_Star	
        -> extend({ type: "NodeConstraint" }, $1, $2 ? $2 : {}) // t: 1iriPattern
    | _QstringFacet_E_Plus	-> extend({ type: "NodeConstraint" }, $1) // t: @@
    ;

_QstringFacet_E_Star:
      	-> {}
    | _QstringFacet_E_Star stringFacet	{
        if (Object.keys($1).indexOf(Object.keys($2)[0]) !== -1) {
          error("Parse error: facet "+Object.keys($2)[0]+" defined multiple times");
        }
        $$ = extend($1, $2)
      }
    ;

_QstringFacet_E_Plus:
      stringFacet	// t: !! look to 1literalPattern
    | _QstringFacet_E_Plus stringFacet	{
        if (Object.keys($1).indexOf(Object.keys($2)[0]) !== -1) {
          error("Parse error: facet "+Object.keys($2)[0]+" defined multiple times");
        }
        $$ = extend($1, $2) // t: !! look to 1literalLength
      }
    ;

nonLiteralKind:
      IT_IRI	-> { nodeKind: "iri" } // t: 1iriPattern
    | IT_BNODE	-> { nodeKind: "bnode" } // t: 1bnodeLength
    | IT_NONLITERAL	-> { nodeKind: "nonliteral" } // t: 1nonliteralLength
    ;

xsFacet:
      stringFacet	// t: 1literalLength
    | numericFacet	// t: 1literalTotaldigits
    ;

stringFacet:
      stringLength INTEGER	-> keyValObject($1, parseInt($2, 10)) // t: 1literalLength
    | REGEXP	-> unescapeRegexp($1) // t: 1literalPattern
    ;

stringLength:
      IT_LENGTH	-> "length" // t: 1literalLength
    | IT_MINLENGTH	-> "minlength" // t: 1literalMinlength
    | IT_MAXLENGTH	-> "maxlength" // t: 1literalMaxlength
    ;

numericFacet:
      numericRange _rawNumeric	-> keyValObject($1, $2) // t: 1literalMininclusive
    | numericLength INTEGER	-> keyValObject($1, parseInt($2, 10)) // t: 1literalTotaldigits
    ;

_rawNumeric: // like numericLiteral but doesn't parse as RDF literal
      INTEGER	-> parseInt($1, 10);
    | DECIMAL	-> parseFloat($1);
    | DOUBLE	-> parseFloat($1);
    | string '^^' datatype	{ // ## deprecated
        if ($3 === XSD_DECIMAL || $3 === XSD_FLOAT || $3 === XSD_DOUBLE)
          $$ = parseFloat($1.value);
        else if (numericDatatypes.indexOf($3) !== -1)
          $$ = parseInt($1.value)
        else
          error("Parse error: numeric range facet expected numeric datatype instead of " + $3);
      }
    ;

numericRange:
      IT_MININCLUSIVE	-> "mininclusive" // t: 1literalMininclusive
    | IT_MINEXCLUSIVE	-> "minexclusive" // t: 1literalMinexclusive
    | IT_MAXINCLUSIVE	-> "maxinclusive" // t: 1literalMaxinclusive
    | IT_MAXEXCLUSIVE	-> "maxexclusive" // t: 1literalMaxexclusive
    ;

numericLength:
      IT_TOTALDIGITS	-> "totaldigits" // t: 1literalTotaldigits
    | IT_FRACTIONDIGITS	-> "fractiondigits" // t: 1literalFractiondigits
    ;

shapeDefinition:
      inlineShapeDefinition _Qannotation_E_Star semanticActions	{ // t: 1dotExtend3
        $$ = $1 === EmptyShape ? { type: "Shape" } : $1; // t: 0
        if ($2.length) { $$.annotations = $2; } // t: !! look to open3groupdotcloseAnnot3, open3groupdotclosecard23Annot3Code2
        if ($3) { $$.semActs = $3.semActs; } // t: !! look to open3groupdotcloseCode1, !open1dotOr1dot
      }
    ;

inlineShapeDefinition:
      _Q_O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C_E_Star '{' _QtripleExpression_E_Opt '}'	{ // t: 1dotExtend3
        var exprObj = $3 ? { expression: $3 } : EmptyObject; // t: 0, 0Extend1
        $$ = (exprObj === EmptyObject && $1 === EmptyObject) ?
	  EmptyShape :
	  extend({ type: "Shape" }, exprObj, $1);
      }
    ;

_O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C:
      extension	-> [ "extends", [$1] ] // t: 1dotExtend1
    | extraPropertySet	-> [ "extra", $1 ] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3
    | IT_CLOSED	-> [ "closed", true ] // t: 1dotClosed
    ;

_Q_O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C_E_Star:
      	-> EmptyObject
    | _Q_O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C_E_Star _O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C	{
        if ($1 === EmptyObject)
          $1 = {};
        if ($2[0] === "closed")
          $1["closed"] = true; // t: 1dotClosed
        else if ($2[0] in $1)
          $1[$2[0]] = unionAll($1[$2[0]], $2[1]); // t: 1dotExtend3, 3groupdot3Extra, 3groupdotExtra3
        else
          $1[$2[0]] = $2[1]; // t: 1dotExtend1
        $$ = $1;
      }
    ;

_QtripleExpression_E_Opt:
      	// t: 0
    | tripleExpression	// t: 1dot
    ;

extraPropertySet:
      IT_EXTRA _Qpredicate_E_Plus	-> $2 // t: 1dotExtra1, 3groupdot3Extra
    ;

_Qpredicate_E_Plus:
      predicate	-> [$1] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3
    | _Qpredicate_E_Plus predicate	-> appendTo($1, $2) // t: 3groupdotExtra3
    ;

tripleExpression:
      oneOfTripleExpr	
    ;

oneOfTripleExpr:
      groupTripleExpr	
    | multiElementOneOf	
    ;

multiElementOneOf:
      groupTripleExpr _Q_O_QGT_PIPE_E_S_QgroupTripleExpr_E_C_E_Plus	-> { type: "OneOf", expressions: unionAll([$1], $2) } // t: 2oneOfdot
    ;

_O_QGT_PIPE_E_S_QgroupTripleExpr_E_C:
      '|' groupTripleExpr	-> $2 // t: 2oneOfdot
    ;

_Q_O_QGT_PIPE_E_S_QgroupTripleExpr_E_C_E_Plus:
      _O_QGT_PIPE_E_S_QgroupTripleExpr_E_C	-> [$1] // t: 2oneOfdot
    | _Q_O_QGT_PIPE_E_S_QgroupTripleExpr_E_C_E_Plus _O_QGT_PIPE_E_S_QgroupTripleExpr_E_C	-> appendTo($1, $2) // t: 2oneOfdot
    ;

groupTripleExpr:
      singleElementGroup	// t: 1dot
    | multiElementGroup	// t: 2dot
    ;

singleElementGroup:
      unaryTripleExpr _QGT_SEMI_E_Opt	-> $1
    ;

_QGT_SEMI_E_Opt:
      	// t: 1dot
    | ','	// ## deprecated // t: 1dotComma
    | ';'	// t: 1dotComma
    ;

multiElementGroup:
      unaryTripleExpr _Q_O_QGT_SEMI_E_S_QunaryTripleExpr_E_C_E_Plus _QGT_SEMI_E_Opt	-> { type: "EachOf", expressions: unionAll([$1], $2) } // t: 2groupOfdot
    ;

_O_QGT_SEMI_E_S_QunaryTripleExpr_E_C:
      ',' unaryTripleExpr	-> $2 // ## deprecated // t: 2groupOfdot
    | ';' unaryTripleExpr	-> $2 // t: 2groupOfdot
    ;

_Q_O_QGT_SEMI_E_S_QunaryTripleExpr_E_C_E_Plus:
      _O_QGT_SEMI_E_S_QunaryTripleExpr_E_C	-> [$1] // t: 2groupOfdot
    | _Q_O_QGT_SEMI_E_S_QunaryTripleExpr_E_C_E_Plus _O_QGT_SEMI_E_S_QunaryTripleExpr_E_C	-> appendTo($1, $2) // t: 2groupOfdot
    ;

unaryTripleExpr:
      _Q_O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C_E_Opt _O_QtripleConstraint_E_Or_QbracketedTripleExpr_E_C	{
        if ($1) {
          $$ = extend({ id: $1 }, $2);
          addProduction($1,  $$);
        } else {
          $$ = $2
        }
      }
    | include	
    ;

_O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C:
      '$' tripleExprLabel	-> $2
    ;

_Q_O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C_E_Opt:
      	
    | _O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C	
    ;

_O_QtripleConstraint_E_Or_QbracketedTripleExpr_E_C:
      tripleConstraint	
    | bracketedTripleExpr	
    ;

bracketedTripleExpr:
      '(' tripleExpression ')' _Qcardinality_E_Opt _QonShapeExpression_E_Opt _Qannotation_E_Star semanticActions	{
        // t: open1dotOr1dot, !openopen1dotcloseCode1closeCode2
        $$ = $2;
        // Copy all of the new attributes into the encapsulated shape.
        if ("min" in $4) { $$.min = $4.min; } // t: open3groupdotclosecard23Annot3Code2
        if ("max" in $4) { $$.max = $4.max; } // t: open3groupdotclosecard23Annot3Code2
        if ($5) { $$.onShapeExpression = $5; } // t: !!
        if ($6.length) { $$.annotations = $6; } // t: open3groupdotcloseAnnot3, open3groupdotclosecard23Annot3Code2
        if ($7) { $$.semActs = "semActs" in $2 ? $2.semActs.concat($7.semActs) : $7.semActs; } // t: open3groupdotcloseCode1, !open1dotOr1dot
      }
    ;

_Qcardinality_E_Opt:
      	-> {} // t: 1dot
    | cardinality	// t: 1cardOpt
    ;

_QonShapeExpression_E_Opt:
      	-> null // t: 1dot
    | IT_ON _QIT_SHAPE_IT_EXPRESSION_E_Opt inlineShapeExpression -> $3	// t: !!
    ;

_QIT_SHAPE_IT_EXPRESSION_E_Opt:
      	
    | IT_SHAPE IT_EXPRESSION
    ;

tripleConstraint:
      _QsenseFlags_E_Opt predicate inlineShapeExpression _Qcardinality_E_Opt _QonShapeExpression_E_Opt _Qannotation_E_Star semanticActions	{
        // $7: t: 1dotCode1
	if ($3 !== EmptyShape && false) {
	  var t = blank();
	  addShape(t, $3);
	  $3 = t; // ShapeRef
	}
        // %7: t: 1inversedotCode1
        $$ = extend({ type: "TripleConstraint" }, $1, { predicate: $2 }, ($3 === EmptyShape ? {} : { valueExpr: $3 }), $4, $7); // t: 1dot, 1inversedot
        if ($5)
          $$.onShapeExpression = $5; // t: !!
        if ($6.length)
          $$["annotations"] = $6; // t: 1dotAnnot3, 1inversedotAnnot3
      }
    ;

_QsenseFlags_E_Opt:
      	
    | senseFlags
    ;

cardinality:
      '*'	-> { min:0, max:UNBOUNDED } // t: 1cardStar
    | '+'	-> { min:1, max:UNBOUNDED } // t: 1cardPlus
    | '?'	-> { min:0, max:1 } // t: 1cardOpt
    | REPEAT_RANGE	{
        $1 = $1.substr(1, $1.length-2);
        var nums = $1.match(/(\d+)/g);
        $$ = { min: parseInt(nums[0], 10) }; // t: 1card2blank, 1card2Star
        if (nums.length === 2)
            $$["max"] = parseInt(nums[1], 10); // t: 1card23
        else if ($1.indexOf(',') === -1) // t: 1card2
            $$["max"] = parseInt(nums[0], 10);
        else
            $$["max"] = UNBOUNDED;
      }
    ;

senseFlags:
      '^'	-> { inverse: true } // t: 1inversedot
    ;

valueSet:
      '[' _QvalueSetValue_E_Star ']'	-> $2 // t: 1val1IRIREF
    ;

_QvalueSetValue_E_Star:
      	-> [] // t: 1val1IRIREF
    | _QvalueSetValue_E_Star valueSetValue	-> appendTo($1, $2) // t: 1val1IRIREF
    ;

valueSetValue:
      iriRange	// t: 1val1IRIREF
    | literalRange	// t: 1val1literal
    | languageRange	// t: 1val1language
    | '.' _O_QiriExclusion_E_Plus_Or_QliteralExclusion_E_Plus_Or_QlanguageExclusion_E_Plus_C	-> $2
    ;

_QiriExclusion_E_Plus:
      iriExclusion	-> [$1] // t:1val1dotMinusiri3, 1val1dotMinusiriStem3
    | _QiriExclusion_E_Plus iriExclusion	-> appendTo($1, $2) // t:1val1dotMinusiri3, 1val1dotMinusiriStem3
    ;

_QliteralExclusion_E_Plus:
      literalExclusion	-> [$1] // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3
    | _QliteralExclusion_E_Plus literalExclusion	-> appendTo($1, $2) // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3
    ;

_QlanguageExclusion_E_Plus:
      languageExclusion	-> [$1] // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3
    | _QlanguageExclusion_E_Plus languageExclusion	-> appendTo($1, $2) // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3
    ;

_O_QiriExclusion_E_Plus_Or_QliteralExclusion_E_Plus_Or_QlanguageExclusion_E_Plus_C:
      _QiriExclusion_E_Plus	// t:1val1dotMinusiri3, 1val1dotMinusiriStem3
        -> { type: "IriStemRange", stem: { type: "Wildcard" }, exclusions: $1 }
    | _QliteralExclusion_E_Plus	// t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3
        -> { type: "LiteralStemRange", stem: { type: "Wildcard" }, exclusions: $1 }
    | _QlanguageExclusion_E_Plus	// t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3
        -> { type: "LanguageStemRange", stem: { type: "Wildcard" }, exclusions: $1 }
    ;

iriRange:
      iri _Q_O_QGT_TILDE_E_S_QiriExclusion_E_Star_C_E_Opt	{
        if ($2) {
          $$ = {  // t: 1val1iriStem, 1val1iriStemMinusiri3
            type: $2.length ? "IriStemRange" : "IriStem",
            stem: $1
          };
          if ($2.length)
            $$["exclusions"] = $2; // t: 1val1iriStemMinusiri3
        } else {
          $$ = $1; // t: 1val1IRIREF, 1AvalA
        }
      }
    ;

_QiriExclusion_E_Star:
      	-> [] // t: 1val1iriStem, 1val1iriStemMinusiri3
    | _QiriExclusion_E_Star iriExclusion	-> appendTo($1, $2) // t: 1val1iriStemMinusiri3
    ;

_O_QGT_TILDE_E_S_QiriExclusion_E_Star_C:
      '~' _QiriExclusion_E_Star	-> $2 // t: 1val1iriStemMinusiri3
    ;

_Q_O_QGT_TILDE_E_S_QiriExclusion_E_Star_C_E_Opt:
      	// t: 1val1IRIREF
    | _O_QGT_TILDE_E_S_QiriExclusion_E_Star_C	// t: 1val1iriStemMinusiri3
    ;

iriExclusion:
      '-' iri _QGT_TILDE_E_Opt	-> $3 ? { type: "IriStem", stem: $2 } /* t: 1val1iriStemMinusiriStem3 */ : $2 // t: 1val1iriStemMinusiri3
    ;

_QGT_TILDE_E_Opt:
      	
    | '~'	
    ;

literalRange:
      literal _Q_O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C_E_Opt	{
        if ($2) {
          $$ = {  // t: 1val1literalStemMinusliteralStem3, 1val1literalStem
            type: $2.length ? "LiteralStemRange" : "LiteralStem",
            stem: $1.value
          };
          if ($2.length)
            $$["exclusions"] = $2; // t: 1val1literalStemMinusliteral3
        } else {
          $$ = $1; // t: 1val1LITERAL
        }
      }
    ;

_QliteralExclusion_E_Star:
      	-> [] // t: 1val1literalStem, 1val1literalStemMinusliteral3
    | _QliteralExclusion_E_Star literalExclusion	-> appendTo($1, $2) // t: 1val1literalStemMinusliteral3
    ;

_O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C:
      '~' _QliteralExclusion_E_Star	-> $2 // t: 1val1literalStemMinusliteral3
    ;

_Q_O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C_E_Opt:
      	// t: 1val1LITERAL
    | _O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C	// t: 1val1LITERAL
    ;

literalExclusion:
      '-' literal _QGT_TILDE_E_Opt	-> $3 ? { type: "LiteralStem", stem: $2.value } /* t: 1val1literalStemMinusliteral3 */ : $2.value // t: 1val1literalStemMinusliteralStem3
    ;

languageRange:
      LANGTAG _Q_O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C_E_Opt	{
        if ($2) {
          $$ = {  // t: 1val1languageStemMinuslanguage3 1val1languageStemMinuslanguageStem3 : 1val1languageStem
            type: $2.length ? "LanguageStemRange" : "LanguageStem",
            stem: $1
          };
          if ($2.length)
            $$["exclusions"] = $2; // t: 1val1languageStemMinuslanguage3, 1val1languageStemMinuslanguageStem3
        } else {
          $$ = { type: "Language", languageTag: $1 }; // t: 1val1language
        }
      }
    | '@' _O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C	{
        $$ = {  // t: @@
          type: $2.length ? "LanguageStemRange" : "LanguageStem",
          stem: ""
        };
        if ($2.length)
          $$["exclusions"] = $2; // t: @@
      }
    ;

_QlanguageExclusion_E_Star:
      	-> [] // t: 1val1languageStem, 1val1languageStemMinuslanguage3
    | _QlanguageExclusion_E_Star languageExclusion	-> appendTo($1, $2) // t: 1val1languageStemMinuslanguage3
    ;

_O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C:
      '~' _QlanguageExclusion_E_Star	-> $2 // t: 1val1languageStemMinuslanguage3
    ;

_Q_O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C_E_Opt:
      	// t: 1val1LANGUAGE
    | _O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C	// t: 1val1languageStemMinuslanguage3
    ;

languageExclusion:
      '-' LANGTAG _QGT_TILDE_E_Opt	-> $3 ? { type: "LanguageStem", stem: $2 } /* t: 1val1languageStemMinuslanguageStem3 */ : $2 // t: 1val1languageStemMinuslanguage3
    ;

include:
      '&' tripleExprLabel	-> $2 // Inclusion // t: 2groupInclude1
    ;

annotation:
      "//" predicate _O_Qiri_E_Or_Qliteral_E_C	-> { type: "Annotation", predicate: $2, object: $3 } // t: 1dotAnnotIRIREF
    ;

_O_Qiri_E_Or_Qliteral_E_C:
      iri	// t: 1dotAnnotIRIREF
    | literal	// t: 1dotAnnotSTRING_LITERAL1
    ;

semanticActions:
      _QcodeDecl_E_Star	-> $1.length ? { semActs: $1 } : null; // t: 1dotCode1/2oneOfDot
    ;

_QcodeDecl_E_Star:
      	-> [] // t: 1dot, 1dotCode1
    | _QcodeDecl_E_Star codeDecl	-> appendTo($1, $2) // t: 1dotCode1
    ;

codeDecl:
     // XXX '%' CODE	-> unescapeSemanticAction("", $2) // t: 1dotUnlabeledCode1
      '%' iri _O_QCODE_E_Or_QGT_MODULO_E_C	
        -> $3 ? unescapeSemanticAction($2, $3) /* t: 1dotCode1 */ : { type: "SemAct", name: $2 } // t: 1dotNoCode1
    ;

_O_QCODE_E_Or_QGT_MODULO_E_C:
      CODE	
    | '%'	-> null
    ;

literal:
      rdfLiteral	
    | numericLiteral	
    | booleanLiteral	
    ;

predicate:
      iri	// t: 1dot
    | 'a'	-> RDF_TYPE // t: 1AvalA
    ;

datatype:
      iri	
    ;

shapeExprLabel:
      iri	// t: 1dot
    | blankNode	// t: 1dotInline1
    ;

tripleExprLabel:
      iri	// t: 1val1vcrefIRIREF
    | blankNode	// t: 1val1vcrefbnode
    ;

numericLiteral:
      INTEGER	-> createLiteral($1, XSD_INTEGER) // t: 1val1INTEGER
    | DECIMAL	-> createLiteral($1, XSD_DECIMAL) // t: 1val1DECIMAL
    | DOUBLE	-> createLiteral($1, XSD_DOUBLE) // t: 1val1DOUBLE
    ;

rdfLiteral:
      langString	// t: 1val1STRING_LITERAL1
    | string _Q_O_QGT_DTYPE_E_S_Qdatatype_E_C_E_Opt	-> $2 ? extend($1, { type: $2 }) : $1; // t: 1val1Datatype
    ;

_O_QGT_DTYPE_E_S_Qdatatype_E_C:
      "^^" datatype	-> $2
    ;

_Q_O_QGT_DTYPE_E_S_Qdatatype_E_C_E_Opt:
      	-> null
    | _O_QGT_DTYPE_E_S_Qdatatype_E_C	
    ;

booleanLiteral:
      IT_true	-> { value: "true", type: XSD_BOOLEAN } // t: 1val1true
    | IT_false	-> { value: "false", type: XSD_BOOLEAN } // t: 1val1false
    ;

string:
      STRING_LITERAL1	-> unescapeString($1, 1)	// t: 1val1STRING_LITERAL2
    | STRING_LITERAL_LONG1	-> unescapeString($1, 3)	// t: 1val1STRING_LITERAL1
    | STRING_LITERAL2	-> unescapeString($1, 1)	// t: 1val1STRING_LITERAL_LONG2
    | STRING_LITERAL_LONG2	-> unescapeString($1, 3)	// t: 1val1STRING_LITERAL_LONG1
    ;

langString:
      LANG_STRING_LITERAL1	-> unescapeLangString($1, 1)	// t: @@
    | LANG_STRING_LITERAL_LONG1	-> unescapeLangString($1, 3)	// t: @@
    | LANG_STRING_LITERAL2	-> unescapeLangString($1, 1)	// t: 1val1LANGTAG
    | LANG_STRING_LITERAL_LONG2	-> unescapeLangString($1, 3)	// t: 1val1STRING_LITERAL_LONG2_with_LANGTAG
    ;

iri:
      IRIREF	{ // t: 1dot
        var unesc = ShExUtil.unescapeText($1.slice(1,-1), {});
        $$ = Parser._base === null || absoluteIRI.test(unesc) ? unesc : _resolveIRI(unesc)
      }
    | prefixedName	
    ;

prefixedName:
      PNAME_LN	{ // t:1dotPNex, 1dotPNdefault, ShExParser-test.js/with pre-defined prefixes
        var namePos = $1.indexOf(':');
        $$ = expandPrefix($1.substr(0, namePos)) + ShExUtil.unescapeText($1.substr(namePos + 1), pnameEscapeReplacements);
      }
    | PNAME_NS	{ // t: 1dotNS2, 1dotNSdefault, ShExParser-test.js/PNAME_NS with pre-defined prefixes
        $$ = expandPrefix($1.substr(0, $1.length - 1));
      }
    ;

blankNode:
      BLANK_NODE_LABEL	// t: 1dotInline1
    ;

extension:
      _O_QIT_EXTENDS_E_Or_QGT_AMP_E_C shapeOrRef	-> $2 // t: 1dotInherit1, 1dot3Inherit, 1dotInherit3
    ;

_O_QIT_EXTENDS_E_Or_QGT_AMP_E_C:
      IT_EXTENDS	
    | '&'	
    ;

restriction:
      _O_QIT_RESTRICTS_E_Or_QGT_MINUS_E_C shapeOrRef	-> $2 // t: @@1dotSpecialize1, @@1dot3Specialize, @@1dotSpecialize3
    ;

_O_QIT_RESTRICTS_E_Or_QGT_MINUS_E_C:
      IT_RESTRICTS	
    | '-'	
    ;

