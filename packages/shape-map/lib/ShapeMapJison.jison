/*
  jison Equivalent of accompanying bnf, developed in
  http://www.w3.org/2005/01/yacker/uploads/ShapeMap
*/

%{
  /*
    ShapeMap parser in the Jison parser generator format.
  */

  const ShapeMap = require("./ShapeMapSymbols");

  // Common namespaces and entities
  const XSD = 'http://www.w3.org/2001/XMLSchema#',
      XSD_INTEGER  = XSD + 'integer',
      XSD_DECIMAL  = XSD + 'decimal',
      XSD_FLOAT   = XSD + 'float',
      XSD_DOUBLE   = XSD + 'double',
      XSD_BOOLEAN  = XSD + 'boolean';

  const numericDatatypes = [
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

  const absoluteIRI = /^[a-z][a-z0-9+.-]*:/i,
    schemeAuthority = /^(?:([a-z][a-z0-9+.-]*:))?(?:\/\/[^\/]*)?/i,
    dotSegments = /(?:^|\/)\.\.?(?:$|[\/#?])/;

  const numericFacets = ["mininclusive", "minexclusive",
                       "maxinclusive", "maxexclusive"];

  // Extends a base object with properties of other objects
  function extend (base) {
    if (!base) base = {};
    for (let i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
      for (let name in arg)
        base[name] = arg[name];
    return base;
  }

  // N3.js:lib/N3Parser.js<0.4.5>:58 with
  //   s/this\./ShapeMapJisonParser./g
  // ### `_setSchemaBase` sets the base IRI to resolve relative IRIs.
  ShapeMapJisonParser._setSchemaBase = function (baseIRI) {
    if (!baseIRI)
      baseIRI = null;

    // baseIRI '#' check disabled to allow -x 'data:text/shex,...#'
    // else if (baseIRI.indexOf('#') >= 0)
    //   throw new Error('Invalid base IRI ' + baseIRI);

    // Set base IRI and its components
    if (ShapeMapJisonParser._schemaBase = baseIRI) {
      ShapeMapJisonParser._schemaBasePath   = baseIRI.replace(/[^\/?]*(?:\?.*)?$/, '');
      baseIRI = baseIRI.match(schemeAuthority);
      ShapeMapJisonParser._schemaBaseRoot   = baseIRI[0];
      ShapeMapJisonParser._schemaBaseScheme = baseIRI[1];
    }
  }
  ShapeMapJisonParser._setDataBase = function (baseIRI) {
    if (!baseIRI)
      baseIRI = null;

    // baseIRI '#' check disabled to allow -x 'data:text/shex,...#'
    // else if (baseIRI.indexOf('#') >= 0)
    //   throw new Error('Invalid base IRI ' + baseIRI);

    // Set base IRI and its components
    if (ShapeMapJisonParser._dataBase = baseIRI) {
      ShapeMapJisonParser._dataBasePath   = baseIRI.replace(/[^\/?]*(?:\?.*)?$/, '');
      baseIRI = baseIRI.match(schemeAuthority);
      ShapeMapJisonParser._dataBaseRoot   = baseIRI[0];
      ShapeMapJisonParser._dataBaseScheme = baseIRI[1];
    }
  }

  // N3.js:lib/N3Parser.js<0.4.5>:576 with
  //   s/this\./ShapeMapJisonParser./g
  //   s/token/iri/
  // ### `_resolveSchemaIRI` resolves a relative IRI token against the base path,
  // assuming that a base path has been set and that the IRI is indeed relative.
  function _resolveSchemaIRI (iri) {
    switch (iri[0]) {
    // An empty relative IRI indicates the base IRI
    case undefined: return ShapeMapJisonParser._schemaBase;
    // Resolve relative fragment IRIs against the base IRI
    case '#': return ShapeMapJisonParser._schemaBase + iri;
    // Resolve relative query string IRIs by replacing the query string
    case '?': return ShapeMapJisonParser._schemaBase.replace(/(?:\?.*)?$/, iri);
    // Resolve root-relative IRIs at the root of the base IRI
    case '/':
      // Resolve scheme-relative IRIs to the scheme
      return (iri[1] === '/' ? ShapeMapJisonParser._schemaBaseScheme : ShapeMapJisonParser._schemaBaseRoot) + _removeDotSegments(iri);
    // Resolve all other IRIs at the base IRI's path
    default: {
      return _removeDotSegments(ShapeMapJisonParser._schemaBasePath + iri);
    }
    }
  }
  function _resolveDataIRI (iri) {
    switch (iri[0]) {
    // An empty relative IRI indicates the base IRI
    case undefined: return ShapeMapJisonParser._dataBase;
    // Resolve relative fragment IRIs against the base IRI
    case '#': return ShapeMapJisonParser._dataBase + iri;
    // Resolve relative query string IRIs by replacing the query string
    case '?': return ShapeMapJisonParser._dataBase.replace(/(?:\?.*)?$/, iri);
    // Resolve root-relative IRIs at the root of the base IRI
    case '/':
      // Resolve scheme-relative IRIs to the scheme
      return (iri[1] === '/' ? ShapeMapJisonParser._dataBaseScheme : ShapeMapJisonParser._dataBaseRoot) + _removeDotSegments(iri);
    // Resolve all other IRIs at the base IRI's path
    default: {
      return _removeDotSegments(ShapeMapJisonParser._dataBasePath + iri);
    }
    }
  }

  // ### `_removeDotSegments` resolves './' and '../' path segments in an IRI as per RFC3986.
  function _removeDotSegments (iri) {
    // Don't modify the IRI if it does not contain any dot segments
    if (!dotSegments.test(iri))
      return iri;

    // Start with an imaginary slash before the IRI in order to resolve trailing './' and '../'
    const result = '', length = iri.length, i = -1, pathStart = -1, segmentStart = 0, next = '/';

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

  function obj() {
    const ret = {  };
    for (let i = 0; i < arguments.length; i+= 2) {
      ret[arguments[i]] = arguments[i+1];
    }
    return ret;
  }

  // Creates a literal with the given value and type
  function createLiteral(value, type) {
    return obj("@value", value, "@type", type );
  }

  // Creates a new blank node identifier
  function blank() {
    return '_:b' + blankId++;
  };
  const blankId = 0;
  ShapeMapJisonParser._resetBlanks = function () { blankId = 0; }
  ShapeMapJisonParser.reset = function () {
    ShapeMapJisonParser._prefixes = ShapeMapJisonParser._imports = ShapeMapJisonParser.valueExprDefns = ShapeMapJisonParser.shapes = ShapeMapJisonParser.productions = ShapeMapJisonParser.start = ShapeMapJisonParser.startActs = null; // Reset state.
    ShapeMapJisonParser._schemaBase = ShapeMapJisonParser._schemaBasePath = ShapeMapJisonParser._schemaBaseRoot = ShapeMapJisonParser._schemaBaseIRIScheme = null;
  }
  let _fileName; // for debugging
  ShapeMapJisonParser._setFileName = function (fn) { _fileName = fn; }

  // Regular expression and replacement strings to escape strings
  const stringEscapeReplacements = { '\\': '\\', "'": "'", '"': '"',
                                   't': '\t', 'b': '\b', 'n': '\n', 'r': '\r', 'f': '\f' },
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
    return obj("@value", unescapeText(string, stringEscapeReplacements));
  }

  function unescapeLangString(string, trimLength) {
    const at = string.lastIndexOf("@");
    const lang = string.substr(at);
    string = string.substr(0, at);
    const u = unescapeString(string, trimLength);
    return extend(u, obj("@language", lang.substr(1).toLowerCase()));
  }

  function error (msg) {
    ShapeMapJisonParser.reset();
    throw new Error(msg);
  }

  // Parse a prefix out of a PName or throw Error
  function parsePName (pname, prefixes) {
    const namePos = pname.indexOf(':');
    return expandPrefix(prefixes, pname.substr(0, namePos)) + unescapeText(pname.substr(namePos + 1), pnameEscapeReplacements);
  }

  // Expand declared prefix or throw Error
  function expandPrefix (prefixes, prefix) {
    if (!(prefix in prefixes))
      error('Parse error; unknown prefix: ' + prefix);
    return prefixes[prefix];
  }

  // Add a shape to the map
  function addShape (label, shape) {
    if (ShapeMapJisonParser.productions && label in ShapeMapJisonParser.productions)
      error("Structural error: "+label+" is a shape");
    if (!ShapeMapJisonParser.shapes)
      ShapeMapJisonParser.shapes = {};
    if (label in ShapeMapJisonParser.shapes) {
      if (ShapeMapJisonParser.options.duplicateShape === "replace")
        ShapeMapJisonParser.shapes[label] = shape;
      else if (ShapeMapJisonParser.options.duplicateShape !== "ignore")
        error("Parse error: "+label+" already defined");
    } else
      ShapeMapJisonParser.shapes[label] = shape;
  }

  // Add a production to the map
  function addProduction (label, production) {
    if (ShapeMapJisonParser.shapes && label in ShapeMapJisonParser.shapes)
      error("Structural error: "+label+" is a shape");
    if (!ShapeMapJisonParser.productions)
      ShapeMapJisonParser.productions = {};
    if (label in ShapeMapJisonParser.productions) {
      if (ShapeMapJisonParser.options.duplicateShape === "replace")
        ShapeMapJisonParser.productions[label] = production;
      else if (ShapeMapJisonParser.options.duplicateShape !== "ignore")
        error("Parse error: "+label+" already defined");
    } else
      ShapeMapJisonParser.productions[label] = production;
  }

  function shapeJunction (type, container, elts) {
    if (elts.length === 0) {
      return container;
    } else if (container.type === type) {
      container.shapeExprs = container.shapeExprs.concat(elts);
      return container;
    } else {
      return { type: type, shapeExprs: [container].concat(elts) };
    }
  }

  const EmptyObject = {  };
  const EmptyShape = { type: "Shape" };

  // <?INCLUDE from ShExUtil. Factor into `rdf-token` module? ?>
  /**
   * unescape numerics and allowed single-character escapes.
   * throws: if there are any unallowed sequences
   */
  function unescapeText (string, replacements) {
    const regex = /\\u([a-fA-F0-9]{4})|\\U([a-fA-F0-9]{8})|\\(.)/g;
    try {
      string = string.replace(regex, function (sequence, unicode4, unicode8, escapedChar) {
        let charCode;
        if (unicode4) {
          charCode = parseInt(unicode4, 16);
          if (isNaN(charCode)) throw new Error(); // can never happen (regex), but helps performance
          return String.fromCharCode(charCode);
        }
        else if (unicode8) {
          charCode = parseInt(unicode8, 16);
          if (isNaN(charCode)) throw new Error(); // can never happen (regex), but helps performance
          if (charCode < 0xFFFF) return String.fromCharCode(charCode);
          return String.fromCharCode(0xD800 + ((charCode -= 0x10000) >> 10), 0xDC00 + (charCode & 0x3FF));
        }
        else {
          const replacement = replacements[escapedChar];
          if (!replacement) throw new Error("no replacement found for '" + escapedChar + "'");
          return replacement;
        }
      });
      return string;
    }
    catch (error) { console.warn(error); return ''; }
  }
%}

/* lexical grammar */
%lex

APPINFO_COLON           'appinfo:'
APPINFO_SPACE_COLON     'appinfo' [\u0020\u000A\u0009]+ ':'
STRING_LITERAL2_COLON   '"' ([^\u0022\u005C\u000A\u000D] | {ECHAR} | {UCHAR})* '"' [\u0020\u000A\u0009]* ':'

FOCUS                   [Ff][Oo][Cc][Uu][Ss]
START                   [Ss][Tt][Aa][Rr][Tt]
ATSTART                 "@"[Ss][Tt][Aa][Rr][Tt]
IT_SPARQL               [Ss][Pp][Aa][Rr][Qq][Ll]
LANGTAG                 "@"([A-Za-z])+(("-"([0-9A-Za-z])+))*
INTEGER                 ([+-])?([0-9])+
DECIMAL                 ([+-])?([0-9])*"."([0-9])+
EXPONENT                [Ee]([+-])?([0-9])+
DOUBLE                  ([+-])?((([0-9])+"."([0-9])*({EXPONENT}))|((".")?([0-9])+({EXPONENT})))
ECHAR                   "\\"[\"\'\\bfnrt]
PN_CHARS_BASE           [A-Z] | [a-z] | [\u00c0-\u00d6] | [\u00d8-\u00f6] | [\u00f8-\u02ff] | [\u0370-\u037d] | [\u037f-\u1fff] | [\u200c-\u200d] | [\u2070-\u218f] | [\u2c00-\u2fef] | [\u3001-\ud7ff] | [\uf900-\ufdcf] | [\ufdf0-\ufffd] | [\uD800-\uDB7F][\uDC00-\uDFFF] // UTF-16 surrogates for [\U00010000-\U000effff]
PN_CHARS_U              {PN_CHARS_BASE} | '_' | '_' /* !!! raise jison bug */
PN_CHARS                {PN_CHARS_U} | '-' | [0-9] | [\u00b7] | [\u0300-\u036f] | [\u203f-\u2040]
BLANK_NODE_LABEL        '_:' ({PN_CHARS_U} | [0-9]) (({PN_CHARS} | '.')* {PN_CHARS})?
PN_PREFIX               {PN_CHARS_BASE} (({PN_CHARS} | '.')* {PN_CHARS})?
PNAME_NS                {PN_PREFIX}? ':'
ATPNAME_NS              '@' {PNAME_NS}
HEX                     [0-9] | [A-F] | [a-f]
PERCENT                 '%' {HEX} {HEX}
UCHAR                   '\\u' {HEX} {HEX} {HEX} {HEX} | '\\U' {HEX} {HEX} {HEX} {HEX} {HEX} {HEX} {HEX} {HEX}

STRING_LITERAL1         "'" ([^\u0027\u005c\u000a\u000d] | {ECHAR} | {UCHAR})* "'" /* #x27=' #x5C=\ #xA=new line #xD=carriage return */
STRING_LITERAL2         '"' ([^\u0022\u005c\u000a\u000d] | {ECHAR} | {UCHAR})* '"' /* #x22=" #x5C=\ #xA=new line #xD=carriage return */
STRING_LITERAL_LONG1    "'''" (("'" | "''")? ([^\'\\] | {ECHAR} | {UCHAR}))* "'''"
//NON_TERMINATED_STRING_LITERAL_LONG1    "'''"
STRING_LITERAL_LONG2    '"""' (('"' | '""')? ([^\"\\] | {ECHAR} | {UCHAR}))* '"""'
//NON_TERMINATED_STRING_LITERAL_LONG2    '"""'

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
{APPINFO_SPACE_COLON}   return 'APPINFO_SPACE_COLON';
{STRING_LITERAL2_COLON} return 'STRING_LITERAL2_COLON';
{FOCUS}                 return 'IT_FOCUS';
{START}                 return 'START';
{ATSTART}               return 'ATSTART';
{IT_SPARQL}             return 'IT_SPARQL';

{ATPNAME_LN}            return 'ATPNAME_LN';
{ATPNAME_NS}            return 'ATPNAME_NS';
{LANGTAG}               return 'LANGTAG';
{PNAME_LN}              return 'PNAME_LN';
{APPINFO_COLON}         return 'APPINFO_COLON';
{PNAME_NS}              return 'PNAME_NS';
{DOUBLE}                return 'DOUBLE';
{DECIMAL}               return 'DECIMAL';
{INTEGER}               return 'INTEGER';
{IRIREF}                return 'IRIREF';
{BLANK_NODE_LABEL}      return 'BLANK_NODE_LABEL';

{STRING_LITERAL_LONG1}  return 'STRING_LITERAL_LONG1';
{STRING_LITERAL_LONG2}  return 'STRING_LITERAL_LONG2';
{STRING_LITERAL1}       return 'STRING_LITERAL1';
{STRING_LITERAL2}       return 'STRING_LITERAL2';

"a"                     return 'IT_a';
","                     return 'GT_COMMA';
"{"                     return 'GT_LCURLEY';
"}"                     return 'GT_RCURLEY';
"@"                     return 'GT_AT';
"!"                     return 'GT_NOT';
"?"                     return 'GT_OPT';
"/"                     return 'GT_DIVIDE';
"$"                     return 'GT_DOLLAR';
"["                     return 'GT_LBRACKET';
"]"                     return 'GT_RBRACKET';
"^^"                    return 'GT_DTYPE';
"_"                     return 'IT__';
"true"                  return 'IT_true';
"false"                 return 'IT_false';
"null"                  return 'IT_null';
<<EOF>>                 return 'EOF';
[a-zA-Z0-9_-]+          return 'unexpected word "'+yytext+'"';
.                       return 'invalid character '+yytext;

/lex

/* operator associations and precedence */

%start shapeMap

%% /* language grammar */

shapeMap:
      EOF	{
          return []
        }
    | pair _Q_O_QGT_COMMA_E_S_Qpair_E_C_E_Star _QGT_COMMA_E_Opt	EOF {
          return [$1].concat($2)
        }
    ;

_O_QGT_COMMA_E_S_Qpair_E_C:
      GT_COMMA pair	-> $2
    ;

_Q_O_QGT_COMMA_E_S_Qpair_E_C_E_Star:
      	-> [  ]
    | _Q_O_QGT_COMMA_E_S_Qpair_E_C_E_Star _O_QGT_COMMA_E_S_Qpair_E_C	-> $1.concat($2)
    ;

_QGT_COMMA_E_Opt:
      	
    | GT_COMMA	
    ;

pair:
      nodeSelector statusAndShape _Qreason_E_Opt _QjsonAttributes_E_Opt	-> extend({ node: $1 }, $2, $3, $4)
    ;

_Qreason_E_Opt:
      	-> {  }
    | reason	
    ;

_QjsonAttributes_E_Opt:
      	-> {  }
    | jsonAttributes	
    ;

statusAndShape:
      GT_AT _Qstatus_E_Opt shapeSelector	-> extend({ shape: $3 }, $2)
    | ATSTART	-> { shape: ShapeMap.start }
    | ATPNAME_NS	{
        $1 = $1.substr(1, $1.length-1);
        $$ = { shape: expandPrefix(ShapeMapJisonParser._schemaPrefixes, $1.substr(0, $1.length - 1)) };
      }
    | ATPNAME_LN	{
        $1 = $1.substr(1, $1.length-1);
        const namePos = $1.indexOf(':');
        $$ = { shape: expandPrefix(ShapeMapJisonParser._schemaPrefixes, $1.substr(0, namePos)) + $1.substr(namePos + 1) };
      }
    ;

_Qstatus_E_Opt:
      	-> { status: 'conformant' } // defaults to conformant
    | status	-> { status: $1 }
    ;

nodeSelector:
      objectTerm	
    | triplePattern	
//     | _O_QIT_SPARQL_E_Or_QnodeIri_E_C string	-> { type: "Extension", language: $1, lexical: $2["@value"] }
    | IT_SPARQL string	-> { type: "Extension", language: "http://www.w3.org/ns/shex#Extensions-sparql", lexical: $2["@value"] }
    | nodeIri string	-> { type: "Extension", language: $1, lexical: $2["@value"] }
    ;

// _O_QIT_SPARQL_E_Or_QnodeIri_E_C:
//       IT_SPARQL	-> "http://www.w3.org/ns/shex#Extensions-sparql"
//     | nodeIri	
//     ;

shapeSelector:
      shapeIri	
    | START	-> ShapeMap.start
    ;

subjectTerm:
      nodeIri	
    | BLANK_NODE_LABEL	
    ;

objectTerm:
      subjectTerm	
    | literal	
    ;

triplePattern:
      GT_LCURLEY IT_FOCUS nodePredicate _O_QobjectTerm_E_Or_QIT___E_C GT_RCURLEY	-> { type: "TriplePattern", subject: ShapeMap.focus, predicate: $3, object: $4 }
    | GT_LCURLEY _O_QsubjectTerm_E_Or_QIT___E_C nodePredicate IT_FOCUS GT_RCURLEY	-> { type: "TriplePattern", subject: $2, predicate: $3, object: ShapeMap.focus }
    ;

_O_QobjectTerm_E_Or_QIT___E_C:
      objectTerm	
    | IT__	-> null
    ;

_O_QsubjectTerm_E_Or_QIT___E_C:
      subjectTerm	
    | IT__	-> null
    ;

status:
      GT_NOT	-> 'nonconformant'
    | GT_OPT	-> 'unknown'
    ;

reason:
      GT_DIVIDE string	-> { reason: $2 }
    ;

jsonAttributes:
      GT_DOLLAR _O_QAPPINFO_COLON_E_Or_QAPPINFO_SPACE_COLON_E_C jsonValue	-> { appinfo: $3 }
    ;

_O_QAPPINFO_COLON_E_Or_QAPPINFO_SPACE_COLON_E_C:
      APPINFO_COLON	
    | APPINFO_SPACE_COLON	
    ;

jsonValue:
      IT_false	-> false
    | IT_null	-> null
    | IT_true	-> true
    | jsonObject	
    | jsonArray	
    | INTEGER	-> parseFloat($1)
    | DECIMAL	-> parseFloat($1)
    | DOUBLE	-> parseFloat($1)
    | STRING_LITERAL2	-> unescapeString($1, 1)["@value"]
    ;

jsonObject:
      GT_LCURLEY _Q_O_QjsonMember_E_S_QGT_COMMA_E_S_QjsonMember_E_Star_C_E_Opt GT_RCURLEY	-> $2
    ;

_O_QGT_COMMA_E_S_QjsonMember_E_C:
      GT_COMMA jsonMember	-> $2
    ;

_Q_O_QGT_COMMA_E_S_QjsonMember_E_C_E_Star:
      	-> {  }
    | _Q_O_QGT_COMMA_E_S_QjsonMember_E_C_E_Star _O_QGT_COMMA_E_S_QjsonMember_E_C	-> extend($1, $2)
    ;

_O_QjsonMember_E_S_QGT_COMMA_E_S_QjsonMember_E_Star_C:
      jsonMember _Q_O_QGT_COMMA_E_S_QjsonMember_E_C_E_Star	-> extend($1, $2)
    ;

_Q_O_QjsonMember_E_S_QGT_COMMA_E_S_QjsonMember_E_Star_C_E_Opt:
      	-> {  }
    | _O_QjsonMember_E_S_QGT_COMMA_E_S_QjsonMember_E_Star_C	
    ;

jsonMember:
      STRING_LITERAL2_COLON jsonValue	{
        $$ = {  };
        const t = $1.substr(0, $1.length - 1).trim(); // remove trailing ':' and spaces
        $$[unescapeString(t, 1)["@value"]] = $2;
      }
    ;

jsonArray:
      GT_LBRACKET _Q_O_QjsonValue_E_S_QGT_COMMA_E_S_QjsonValue_E_Star_C_E_Opt GT_RBRACKET	-> $2
    ;

_O_QGT_COMMA_E_S_QjsonValue_E_C:
      GT_COMMA jsonValue	-> $2
    ;

_Q_O_QGT_COMMA_E_S_QjsonValue_E_C_E_Star:
      	-> [  ]
    | _Q_O_QGT_COMMA_E_S_QjsonValue_E_C_E_Star _O_QGT_COMMA_E_S_QjsonValue_E_C	-> $1.concat($2)
    ;

_O_QjsonValue_E_S_QGT_COMMA_E_S_QjsonValue_E_Star_C:
      jsonValue _Q_O_QGT_COMMA_E_S_QjsonValue_E_C_E_Star	-> [$1].concat($2)
    ;

_Q_O_QjsonValue_E_S_QGT_COMMA_E_S_QjsonValue_E_Star_C_E_Opt:
      	-> [  ]
    | _O_QjsonValue_E_S_QGT_COMMA_E_S_QjsonValue_E_Star_C	
    ;

literal:
      rdfLiteral	
    | numericLiteral	
    | booleanLiteral	
    ;

numericLiteral:
      INTEGER	-> createLiteral($1, XSD_INTEGER)
    | DECIMAL	-> createLiteral($1, XSD_DECIMAL)
    | DOUBLE	-> createLiteral($1, XSD_DOUBLE)
    ;

rdfLiteral:
      string _Q_O_QLANGTAG_E_Or_QGT_DTYPE_E_S_QnodeIri_E_C_E_Opt	-> extend($1, $2)
    ;

_O_QLANGTAG_E_Or_QGT_DTYPE_E_S_QnodeIri_E_C:
      LANGTAG	-> obj("@language", $1.substr(1).toLowerCase())
    | GT_DTYPE nodeIri	-> obj("@type", $2)
    ;

_Q_O_QLANGTAG_E_Or_QGT_DTYPE_E_S_QnodeIri_E_C_E_Opt:
      	-> {  }
    | _O_QLANGTAG_E_Or_QGT_DTYPE_E_S_QnodeIri_E_C	
    ;

booleanLiteral:
      IT_true	-> createLiteral("true", XSD_BOOLEAN)
    | IT_false	-> createLiteral("false", XSD_BOOLEAN)
    ;

string:
      STRING_LITERAL1	-> unescapeString($1, 1)
    | STRING_LITERAL_LONG1	-> unescapeString($1, 3)
    | STRING_LITERAL2	-> unescapeString($1, 1)
    | STRING_LITERAL_LONG2	-> unescapeString($1, 3)
    ;

nodePredicate:
      nodeIri	
    | IT_a	-> "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
    ;

nodeIri:
      IRIREF	{
        const node = unescapeText($1.slice(1,-1), {});
        $$ = ShapeMapJisonParser._dataBase === null || absoluteIRI.test(node) ? node : _resolveDataIRI(node)
      }
    | PNAME_LN	-> parsePName($1, ShapeMapJisonParser._dataPrefixes)
    | APPINFO_COLON	-> parsePName($1, ShapeMapJisonParser._dataPrefixes)
    | PNAME_NS	-> expandPrefix(ShapeMapJisonParser._dataPrefixes, $1.substr(0, $1.length - 1));
    ;

shapeIri:
      IRIREF	{
        const shape = unescapeText($1.slice(1,-1), {});
        $$ = ShapeMapJisonParser._schemaBase === null || absoluteIRI.test(shape) ? shape : _resolveSchemaIRI(shape)
      }
    | PNAME_LN	-> parsePName($1, ShapeMapJisonParser._schemaPrefixes)
    | APPINFO_COLON	-> parsePName($1, ShapeMapJisonParser._schemaPrefixes)
    | PNAME_NS	-> expandPrefix(ShapeMapJisonParser._schemaPrefixes, $1.substr(0, $1.length - 1));
    ;

