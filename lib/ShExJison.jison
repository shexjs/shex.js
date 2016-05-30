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
    else if (baseIRI.indexOf('#') >= 0)
      throw new Error('Invalid base IRI ' + baseIRI);
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
    return '"' + value + '"^^' + type;
  }

  // Creates a new blank node identifier
  function blank() {
    return '_:b' + blankId++;
  };
  var blankId = 0;
  Parser._resetBlanks = function () { blankId = 0; }
  Parser.reset = function () {
    Parser._prefixes = Parser.valueExprDefns = Parser.shapes = Parser.start = Parser.startActs = null; // Reset state.
    Parser._base = Parser._baseIRI = Parser._baseIRIPath = Parser._baseIRIRoot = null;
  }
  var _fileName; // for debugging
  Parser._setFileName = function (fn) { _fileName = fn; }

  // Regular expression and replacement strings to escape strings
  var stringEscapeSequence = /\\u([a-fA-F0-9]{4})|\\U([a-fA-F0-9]{8})|\\(.)/g,
      irirefEscapeSequence = /\\u([a-fA-F0-9]{4})|\\U([a-fA-F0-9]{8})/g,
      stringEscapeReplacements = { '\\': '\\', "'": "'", '"': '"',
                             't': '\t', 'b': '\b', 'n': '\n', 'r': '\r', 'f': '\f' },
      semactEscapeReplacements = { '\\': '\\', '%': '%' },
      fromCharCode = String.fromCharCode;

  function unescape(string, regex, replacements) {
    try {
      string = string.replace(regex, function (sequence, unicode4, unicode8, escapedChar) {
        var charCode;
        if (unicode4) {
          charCode = parseInt(unicode4, 16);
          if (isNaN(charCode)) throw new Error(); // can never happen (regex), but helps performance
          return fromCharCode(charCode);
        }
        else if (unicode8) {
          charCode = parseInt(unicode8, 16);
          if (isNaN(charCode)) throw new Error(); // can never happen (regex), but helps performance
          if (charCode < 0xFFFF) return fromCharCode(charCode);
          return fromCharCode(0xD800 + ((charCode -= 0x10000) >> 10), 0xDC00 + (charCode & 0x3FF));
        }
        else {
          var replacement = replacements[escapedChar];
          if (!replacement) throw new Error();
          return replacement;
        }
      });
      return string;
    }
    catch (error) { return ''; }
  };

  // Translates string escape codes in the string into their textual equivalent
  function unescapeString(string, trimLength) {
    string = string.substring(trimLength, string.length - trimLength);
    return '"' + unescape(string, stringEscapeSequence, stringEscapeReplacements) + '"';
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
      code: unescape(string, stringEscapeSequence, semactEscapeReplacements)
    };
  }

  function error (msg) {
    Parser._prefixes = Parser.valueExprDefns = Parser.shapes = Parser.start = Parser.startActs = null; // Reset state.
    Parser._base = Parser._baseIRI = Parser._baseIRIPath = Parser._baseIRIRoot = '';
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
    if (!Parser.shapes)
      Parser.shapes = {};
    else if (label in Parser.shapes)
      error("Parse error: "+label+" alread defined");
    Parser.shapes[label] = shape;
  }
%}

/* lexical grammar */
%lex

IT_BASE                 [Bb][Aa][Ss][Ee]
IT_PREFIX               [Pp][Rr][Ee][Ff][Ii][Xx]
IT_START                [sS][tT][aA][rR][tT]
IT_VIRTUAL              [Vv][Ii][Rr][Tt][Uu][Aa][Ll]
IT_CLOSED               [Cc][Ll][Oo][Ss][Ee][Dd]
IT_EXTRA                [Ee][Xx][Tt][Rr][Aa]
IT_LITERAL              [Ll][Ii][Tt][Ee][Rr][Aa][Ll]
IT_BNODE                [Bb][Nn][Oo][Dd][Ee]
IT_IRI                  [Ii][Rr][Ii]
IT_NONLITERAL           [Nn][Oo][Nn][Ll][Ii][Tt][Ee][Rr][Aa][Ll]
IT_PATTERN              [Pp][Aa][Tt][Tt][Ee][Rr][Nn]
IT_AND                  [Aa][Nn][Dd]
IT_OR                   [Oo][Rr]
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
ECHAR                   "\\"[\"\\bfnrt]
WS                      (" ")|(("\t")|(("\r")|("\n")))
//ANON                  "\["(({WS}))*"\]"
PN_CHARS_BASE           [A-Z] | [a-z] | [\u00c0-\u00d6] | [\u00d8-\u00f6] | [\u00f8-\u02ff] | [\u0370-\u037d] | [\u037f-\u1fff] | [\u200c-\u200d] | [\u2070-\u218f] | [\u2c00-\u2fef] | [\u3001-\ud7ff] | [\uf900-\ufdcf] | [\ufdf0-\ufffd] | [\uD800-\uDB7F][\uDC00-\uDFFF] // UTF-16 surrogates for [\U00010000-\U000effff]
PN_CHARS_U              {PN_CHARS_BASE} | '_' | '_' /* !!! raise jison bug */
PN_CHARS                {PN_CHARS_U} | '-' | [0-9] | [\u00b7] | [\u0300-\u036f] | [\u203f-\u2040]
BLANK_NODE_LABEL        '_:' ({PN_CHARS_U} | [0-9]) (({PN_CHARS} | '.')* {PN_CHARS})?
//ATBLANK_NODE_LABEL        '@_:' ({PN_CHARS_U} | [0-9]) (({PN_CHARS} | '.')* {PN_CHARS})?
PN_PREFIX               {PN_CHARS_BASE} (({PN_CHARS} | '.')* {PN_CHARS})?
PNAME_NS                {PN_PREFIX}? ':'
ATPNAME_NS              '@' {PN_PREFIX}? ':'
HEX                     [0-9] | [A-F] | [a-f]
PERCENT                 '%' {HEX} {HEX}
UCHAR                   '\\u' {HEX} {HEX} {HEX} {HEX} | '\\U' {HEX} {HEX} {HEX} {HEX} {HEX} {HEX} {HEX} {HEX}
CODE                    "{" ([^%\\] | "\\"[%\\] | {UCHAR})* "%}"
STRING_LITERAL1         "'" ([^\u0027\u005c\u000a\u000d] | {ECHAR} | {UCHAR})* "'" /* #x27=' #x5C=\ #xA=new line #xD=carriage return */
STRING_LITERAL2         '"' ([^\u0022\u005c\u000a\u000d] | {ECHAR} | {UCHAR})* '"' /* #x22=" #x5C=\ #xA=new line #xD=carriage return */
STRING_LITERAL_LONG1    "'''" (("'" | "''")? ([^\'\\] | {ECHAR} | {UCHAR}))* "'''"
NON_TERMINATED_STRING_LITERAL_LONG1    "'''"
STRING_LITERAL_LONG2    '"""' (('"' | '""')? ([^\"\\] | {ECHAR} | {UCHAR}))* '"""'
NON_TERMINATED_STRING_LITERAL_LONG2    '"""'
IRIREF                  '<' ([^\u0000-\u0020<>\"{}|^`\\] | {UCHAR})* '>' /* #x00=NULL #01-#x1F=control codes #x20=space */
//ATIRIREF              '@<' ([^\u0000-\u0020<>\"{}|^`\\] | {UCHAR})* '>' /* #x00=NULL #01-#x1F=control codes #x20=space */
PN_LOCAL_ESC            '\\' ('_' | '~' | '.' | '-' | '!' | '$' | '&' | "'" | '(' | ')' | '*' | '+' | ',' | ';' | '=' | '/' | '?' | '#' | '@' | '%')
PLX                     {PERCENT} | {PN_LOCAL_ESC}
PN_LOCAL                ({PN_CHARS_U} | ':' | [0-9] | {PLX}) (({PN_CHARS} | '.' | ':' | {PLX})* ({PN_CHARS} | ':' | {PLX}))?
PNAME_LN                {PNAME_NS} {PN_LOCAL}
ATPNAME_LN              '@' {PNAME_NS} {PN_LOCAL}
COMMENT                 '#' [^\u000a\u000d]*

%%

\s+|{COMMENT} /**/
{ATPNAME_LN}            return 'ATPNAME_LN';
// {ATIRIREF}           return 'ATIRIREF';
{ATPNAME_NS}            return 'ATPNAME_NS';
// {ATBLANK_NODE_LABEL} return 'ATBLANK_NODE_LABEL';
{LANGTAG}               return 'LANGTAG';
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
{BLANK_NODE_LABEL}      return 'BLANK_NODE_LABEL';
//{PN_PREFIX}           return 'PN_PREFIX';
//{HEX}                 return 'HEX';
//{PERCENT}             return 'PERCENT';
//{UCHAR}               return 'UCHAR';
{CODE}                  return 'CODE';
{STRING_LITERAL_LONG1}  return 'STRING_LITERAL_LONG1';
{NON_TERMINATED_STRING_LITERAL_LONG1}   return 'NON_TERMINATED_STRING_LITERAL_LONG2';
{STRING_LITERAL_LONG2}  return 'STRING_LITERAL_LONG2';
{NON_TERMINATED_STRING_LITERAL_LONG2}   return 'NON_TERMINATED_STRING_LITERAL_LONG2';
{STRING_LITERAL1}       return 'STRING_LITERAL1';
{STRING_LITERAL2}       return 'STRING_LITERAL2';
//{PN_LOCAL_ESC}        return 'PN_LOCAL_ESC';
//{PLX}                 return 'PLX';
//{PN_LOCAL}            return 'PN_LOCAL';
{IT_BASE}               return 'IT_BASE';
{IT_PREFIX}             return 'IT_PREFIX';
{IT_START}              return 'IT_start';
{IT_VIRTUAL}            return 'IT_VIRTUAL';
{IT_CLOSED}             return 'IT_CLOSED';
{IT_EXTRA}              return 'IT_EXTRA';
{IT_LITERAL}            return 'IT_LITERAL';
{IT_BNODE}              return 'IT_BNODE';
{IT_IRI}                return 'IT_IRI';
{IT_NONLITERAL}         return 'IT_NONLITERAL';
{IT_PATTERN}            return 'IT_PATTERN';
{IT_AND}                return 'IT_AND';
{IT_OR}                 return 'IT_OR';
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
.                       return 'invalid character '+yytext;

/lex

/* operator associations and precedence */

%start shexDoc

%% /* language grammar */

shexDoc:
      _Qdirective_E_Star _Q_O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C_E_Opt EOF      {
        var valueExprDefns = Parser.valueExprDefns ? { valueExprDefns: Parser.valueExprDefns } : {};
        var startObj = Parser.start ? { start: Parser.start } : {};
        var startActs = Parser.startActs ? { startActs: Parser.startActs } : {};
        var ret = extend({ type: "Schema", prefixes: Parser._prefixes || {} }, // Build return object from
                         valueExprDefns, startActs, startObj,                    // components in parser state
                         {shapes: Parser.shapes});                            // maintaining intuitve order.
        if (Parser._base !== null)
          ret.base = Parser._base;
        Parser.reset();
        return ret;
      }
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
      _O_QnotStartAction_E_Or_QstartActions_E_C _Qstatement_E_Star      // t: 1dot
    ;

_Q_O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C_E_Opt:
      // t: @@
    | _O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C     // t: 1dot
    ;

statement:
      directive // t: open1dotclose
    | notStartAction    // t: @@
    ;

notStartAction:
      start     // t: startCode1startRef        
    | shape     // t: 1iriRef1  
    | valueExprDefinition       // t: 1val1vsMinusiri3
    ;

directive:
      baseDecl  // t: @@
    | prefixDecl        // t: 1dotLNex
    ;

valueExprDefinition:
      valueExprLabel '=' valueClassExpr _Qannotation_E_Star semanticActions     { // t: 1val1vsMinusiri3
        if (Parser.valueExprDefns === null || Parser.valueExprDefns === undefined)
          Parser.valueExprDefns = {  };
        Parser.valueExprDefns[$1] = { type: "ValueExprDefn", "valueExpr": $3 };
        if ($5)
          Parser.valueExprDefns[$1].semActs = $5.semActs;
        if ($4.length)
          Parser.valueExprDefns[$1].annotations = $4;
      }
    | valueExprLabel 'EXTERNAL' { // t: @@
        if (Parser.valueExprDefns === null || Parser.valueExprDefns === undefined)
          Parser.valueExprDefns = {  };
        Parser.valueExprDefns[$1] = null;
      }
    ;

valueClassExpr:
      valueClass _QvalueClassJuncts_E_Opt       -> $2 ? { type: $2[0], valueExprs: [$1].concat($2[1]) } : $1
    | "(" valueClass _QvalueClassJuncts_E_Opt ")"       -> $3 ? { type: $3[0], valueExprs: [$2].concat($3[1]) } : $2
    ;

_QvalueClassJuncts_E_Opt:
        -> undefined
    | valueClassJuncts  
    ;

valueClassJuncts:
      _Q_O_QIT_OR_E_S_QvalueClass_E_C_E_Plus    -> [ "ValueOr", $1 ]
    | _Q_O_QIT_AND_E_S_QvalueClass_E_C_E_Plus   -> [ "ValueAnd", $1 ];
    ;

_O_QIT_OR_E_S_QvalueClass_E_C:
      IT_OR valueClass  -> $2
    ;

_Q_O_QIT_OR_E_S_QvalueClass_E_C_E_Plus:
      _O_QIT_OR_E_S_QvalueClass_E_C     -> [$1]
    | _Q_O_QIT_OR_E_S_QvalueClass_E_C_E_Plus _O_QIT_OR_E_S_QvalueClass_E_C      -> $1.concat([$2])
    ;

_O_QIT_AND_E_S_QvalueClass_E_C:
      IT_AND valueClass -> $2
    ;

_Q_O_QIT_AND_E_S_QvalueClass_E_C_E_Plus:
      _O_QIT_AND_E_S_QvalueClass_E_C    -> [$1]
    | _Q_O_QIT_AND_E_S_QvalueClass_E_C_E_Plus _O_QIT_AND_E_S_QvalueClass_E_C    -> $1.concat([$2])
    ;

valueExprLabel:
      '$' iri   -> $2 // t: 1val1vcrefIRIREF
    | '$' blankNode     -> $2 // t: 1val1vcrefbnode
    ;

baseDecl:
      IT_BASE IRIREF    { // t: @@
        Parser._setBase(Parser._base === null ||
                    absoluteIRI.test($2.slice(1, -1)) ? $2.slice(1, -1) : _resolveIRI($2.slice(1, -1)));
      }
    ;

prefixDecl:
      IT_PREFIX PNAME_NS IRIREF { // t: ShExParser-test.js/with pre-defined prefixes
        var prefixIRI;
        if (this._base === null || absoluteIRI.test($3.slice(1, -1)))
          prefixIRI = $3.slice(1, -1);
        else
          prefixIRI = _resolveIRI($3.slice(1, -1));
        Parser._prefixes[$2.slice(0, -1)] = prefixIRI;
      }
    ;

start:
      IT_start '=' _O_QshapeLabel_E_Or_QshapeDefinition_E_S_QsemanticActions_E_C        {
        if (Parser.start)
          error("Parse error: start alread defined as " + Parser.start);
        Parser.start = $3; // t: startInline
      }
    ;

_O_QshapeLabel_E_Or_QshapeDefinition_E_S_QsemanticActions_E_C:
      shapeLabel        // t: startRef
    | shapeDefinition semanticActions   { // t: startInline / startInline
        addShape($$ = blank(), extend($1, $2));
    }
    ;

shape:
    shapeLabel _QnonLiteralKind_E_Opt _QstringFacet_E_Star shapeDefinition _Q_O_QIT_AND_E_S_QshapeDefinition_E_C_E_Star semanticActions
      { // t: 1dot
        addShape($1,  extend(extend(extend($2 ? {nodeKind: $2} : {}, $3),
                                    $5.length > 0 ?
                                    { type: "ShapeAnd", "shapeExprs": [$4].concat($5) } :
                                    $4), $6));
      }

    // // _QIT_VIRTUAL_E_Opt 
    // shapeLabel shapeDefinition semanticActions        { // t: 1dot
    //     addShape($1, extend($2, $3));
    // }
    // | IT_VIRTUAL shapeLabel shapeDefinition semanticActions     { // t: 1dotVirtual
    //     // sneak "virtual" in after "type"
    //     // Type will be overwritten.
    //     addShape($2, extend({type: null, virtual: true}, $3, $4)) // $4: t: 1dotVirtualShapeCode1
    // }
    ;

_QnonLiteralKind_E_Opt:
    
    | nonLiteralKind;

_QstringFacet_E_Star:
      -> {}
    | _QstringFacet_E_Star stringFacet {
        if (Object.keys($1).indexOf(Object.keys($2)[0]) !== -1) {
          error("Parse error: facet "+Object.keys($2)[0]+" defined multiple times");
        }
        $$ = extend($1, $2)
      }
    ;

// _QIT_VIRTUAL_E_Opt:
//     
//     | IT_VIRTUAL     ;

_O_QIT_AND_E_S_QshapeDefinition_E_C:
      IT_AND shapeDefinition	-> $2
    ;

_Q_O_QIT_AND_E_S_QshapeDefinition_E_C_E_Star:
      	-> []
    | _Q_O_QIT_AND_E_S_QshapeDefinition_E_C_E_Star _O_QIT_AND_E_S_QshapeDefinition_E_C    -> $1.concat([$2])
    ;

shapeDefinition:
      _Q_O_QincludeSet_E_Or_QinclPropertySet_E_Or_QIT_CLOSED_E_C_E_Star '{' _QsomeOfShape_E_Opt '}'     { // t: 1dotInherit3
        var exprObj = $3 ? { expression: $3 } : {}; // t: 0, 0Inherit1
        $$ = extend({ type: "Shape"}, exprObj, $1);
      }
    ;

_O_QincludeSet_E_Or_QinclPropertySet_E_Or_QIT_CLOSED_E_C:
      includeSet        -> [ "inherit", $1 ] // t: 1dotInherit1
    | inclPropertySet   -> [ "extra", $1 ] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3
    | IT_CLOSED -> [ "closed", true ] // t: 1dotClosed
    ;

_Q_O_QincludeSet_E_Or_QinclPropertySet_E_Or_QIT_CLOSED_E_C_E_Star:
      -> {}
    | _Q_O_QincludeSet_E_Or_QinclPropertySet_E_Or_QIT_CLOSED_E_C_E_Star _O_QincludeSet_E_Or_QinclPropertySet_E_Or_QIT_CLOSED_E_C        {
      if ($2[0] === "closed")
        $1["closed"] = true; // t: 1dotClosed
      else if ($2[0] in $1)
        $1[$2[0]] = unionAll($1[$2[0]], $2[1]); // t: 1dotInherit3, 3groupdot3Extra, 3groupdotExtra3
      else
        $1[$2[0]] = $2[1]; // t: 1dotInherit1
      $$ = $1;
    }
    ;

_QsomeOfShape_E_Opt:
      // t: 0
    | someOfShape       // t: 1dot
    ;

includeSet:
      '&' _QshapeLabel_E_Plus   -> $2 // t: 1dotInherit1, 1dot3Inherit, 1dotInherit3
    ;

_QshapeLabel_E_Plus:
      shapeLabel        -> [$1] // t: 1dotInherit1, 1dot3Inherit, 1dotInherit3
    | _QshapeLabel_E_Plus shapeLabel    -> appendTo($1, $2) // t: 1dotInherit3
    ;

inclPropertySet:
      IT_EXTRA _Qpredicate_E_Plus       -> $2 // t: 1dotExtra1, 3groupdot3Extra
    ;

_Qpredicate_E_Plus:
      predicate -> [$1] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3
    | _Qpredicate_E_Plus predicate      -> appendTo($1, $2) // t: 3groupdotExtra3
    ;

someOfShape:
      groupShape        
    | multiElementSomeOf        ;

multiElementSomeOf:
      groupShape _Q_O_QGT_PIPE_E_S_QgroupShape_E_C_E_Plus       -> { type: "SomeOf", expressions: unionAll([$1], $2) } // t: 2someOfdot
    ;

_O_QGT_PIPE_E_S_QgroupShape_E_C:
      '|' groupShape    -> $2 // t: 2someOfdot
    ;

_Q_O_QGT_PIPE_E_S_QgroupShape_E_C_E_Plus:
      _O_QGT_PIPE_E_S_QgroupShape_E_C   -> [$1] // t: 2someOfdot
    | _Q_O_QGT_PIPE_E_S_QgroupShape_E_C_E_Plus _O_QGT_PIPE_E_S_QgroupShape_E_C  -> appendTo($1, $2) // t: 2someOfdot
    ;

innerShape:
      multiElementGroup 
    | multiElementSomeOf        
    ;

groupShape:
      unaryShape groupShape_right       -> $2 ? { type: "EachOf", expressions: unionAll([$1], $2) } : $1 // t: 2groupOfdot
    ;

groupShape_right:
      -> null
    | ','       -> null
    | ';'       -> null
    | _Q_O_QGT_COMMA_E_S_QunaryShape_E_C_E_Plus _QGT_COMMA_E_Opt        -> $1
    ;

_QGT_COMMA_E_Opt:
        // t: 1dot
    | ','       // t: 1dotComma
    | ';'       // t: 1dotComma
    ;

multiElementGroup:
      unaryShape _Q_O_QGT_COMMA_E_S_QunaryShape_E_C_E_Plus _QGT_COMMA_E_Opt     -> { type: "EachOf", expressions: unionAll([$1], $2) } // t: 2groupOfdot
    ;

_O_QGT_COMMA_E_S_QunaryShape_E_C:
      ',' unaryShape    -> $2 // t: 2groupOfdot
    | ';' unaryShape    -> $2 // t: 2groupOfdot
    ;

_Q_O_QGT_COMMA_E_S_QunaryShape_E_C_E_Plus:
      _O_QGT_COMMA_E_S_QunaryShape_E_C  -> [$1] // t: 2groupOfdot
    | _Q_O_QGT_COMMA_E_S_QunaryShape_E_C_E_Plus _O_QGT_COMMA_E_S_QunaryShape_E_C        -> appendTo($1, $2) // t: 2groupOfdot
    ;

unaryShape:
      tripleConstraint  
    | include   
    | encapsulatedShape 
    ;

encapsulatedShape:
      '(' innerShape ')' _Qcardinality_E_Opt _Qannotation_E_Star semanticActions        {
        // t: open1dotOr1dot, !openopen1dotcloseCode1closeCode2
        $$ = $2;
        // Copy all of the new attributes into the encapsulated shape.
        if ("min" in $4) { $$.min = $4.min; } // t: open3groupdotclosecard23Annot3Code2
        if ("max" in $4) { $$.max = $4.max; } // t: open3groupdotclosecard23Annot3Code2
        if ($5.length) { $$.annotations = $5; } // t: open3groupdotcloseAnnot3, open3groupdotclosecard23Annot3Code2
        if ($6) { $$.semActs = "semActs" in $2 ? $2.semActs.concat($6.semActs) : $6.semActs; } // t: open3groupdotcloseCode1, !open1dotOr1dot
      }
    ;

_Qcardinality_E_Opt:
      -> {} // t: 1dot
    | cardinality       // t: 1cardOpt
    ;

_Qannotation_E_Star:
      -> [] // t: 1dot, 1dotAnnot3
    | _Qannotation_E_Star annotation    -> appendTo($1, $2) // t: 1dotAnnot3
    ;

include:
      '&' shapeLabel    -> { type: "Inclusion", "include": $2 } // t: 2groupInclude1
    ;

shapeLabel:
      iri       // t: 1dot
    | blankNode // t: 1dotInline1
    ;

tripleConstraint:
    // _QsenseFlags_E_Opt 
      predicate valueClassExpr _Qcardinality_E_Opt _Qannotation_E_Star semanticActions  {
        // $5: t: 1dotCode1
        $$ = extend({ type: "TripleConstraint", predicate: $1}, { valueExpr: $2 }, $3, $5); // t: 1dot
        if ($4.length)
          $$["annotations"] = $4; // t: 1dotAnnot3
      }
    | senseFlags predicate valueClassExpr _Qcardinality_E_Opt _Qannotation_E_Star semanticActions       {
        // %6: t: 1inversedotCode1
        $$ = extend({ type: "TripleConstraint" }, $1, { predicate: $2 }, { valueExpr: $3 }, $4, $6); // t: 1inversedot, 1negatedinversedot
        if ($5.length)
          $$["annotations"] = $5; // t: 1inversedotAnnot3
      }
    ;

// _QsenseFlags_E_Opt:
//     
//     | senseFlags     ;

senseFlags:
      '^'       -> { inverse: true } // t: 1inversedot
    | '^' '!'   -> { inverse: true, negated: true } // t: 1negatedinversedot
    | '!'       -> { negated: true } // t: 1negateddot
    | '!' '^'   -> { inverse: true, negated: true } // t: 1inversenegateddot
    ;

predicate:
      iri       // t: 1dot
    | 'a'       -> RDF_TYPE // t: 1AvalA
    ;

valueClass:
      negatableValueClass       
    | '!' negatableValueClass   -> extend({ negated: true}, $2)
    ;

negatableValueClass:
      valueClass1       // t: 1dot
    | valueExprLabel    -> { type: "ValueRef", valueExprRef: $1 } // t: 1val1vsMinusiri3
    ;

valueClass1:
      IT_LITERAL _QxsFacet_E_Star       -> extend({ type: "ValueClass", nodeKind: "literal" }, $2) // t: 1literalPattern
//    | nonLiteralKind _QshapeOrRef_E_Opt _QstringFacet_E_Star       
    | nonLiteralKind -> { type: "ValueClass", nodeKind: $1 } // t: 1iriPattern
    | nonLiteralKind _QstringFacet_E_Plus    -> extend({ type: "ValueClass", nodeKind: $1 }, $2) // t: 1iriPattern
    | nonLiteralKind shapeOrRef      -> { type: "ValueClass", nodeKind: $1, reference: $2 } // t: 1iriRef1
    | nonLiteralKind shapeOrRef _QstringFacet_E_Plus -> extend({ type: "ValueClass", nodeKind: $1, reference: $2 }, $3) // t: 1iriRefLength1
    | datatype _QxsFacet_E_Star {
        if (numericDatatypes.indexOf($1) === -1)
          numericFacets.forEach(function (facet) {
            if (facet in $2)
              error("Parse error: facet "+facet+" not allowed for unknown datatype " + $1);
          });
        $$ = extend({ type: "ValueClass", datatype: $1 }, $2) // t: 1datatype
      }
    | shapeOrRef        -> { type: "ValueClass", reference: $1 } // t: 1dotRef1
    | shapeOrRef _QstringFacet_E_Plus   -> extend({ type: "ValueClass", reference: $1 }, $2) // t: 1dotRef1
    | valueSet  -> { type: "ValueClass", values: $1 } // t: 1val1IRIREF
//    | '[' valueClassExpr ']'  -> $2 -- disabled for now due to algebraic complexity
    | '.'       -> { type: "ValueClass" } // t: 1dot
    ;

_QxsFacet_E_Star:
      -> {} // t: 1literalPattern
    | _QxsFacet_E_Star xsFacet  {
        if (Object.keys($1).indexOf(Object.keys($2)[0]) !== -1) {
          error("Parse error: facet "+Object.keys($2)[0]+" defined multiple times");
        }
        $$ = extend($1, $2) // t: 1literalLength
      }
    ;

nonLiteralKind:
      IT_IRI    -> "iri" // t: 1iriPattern
    | IT_BNODE  -> "bnode" // t: 1bnodeLength
    | IT_NONLITERAL     -> "nonliteral" // t: 1nonliteralLength
    ;

// _QshapeOrRef_E_Opt:
//     
//     | shapeOrRef     ;

//_Q_O_QIT_PATTERN_E_S_Qstring_E_C_E_Opt:
//      
//    | _O_QIT_PATTERN_E_S_Qstring_E_C  
//    ;

_QstringFacet_E_Plus:
      stringFacet // t: 1literalPattern
    | _QstringFacet_E_Plus stringFacet  {
        if (Object.keys($1).indexOf(Object.keys($2)[0]) !== -1) {
          error("Parse error: facet "+Object.keys($2)[0]+" defined multiple times");
        }
        $$ = extend($1, $2)
      }
    ;

shapeOrRef:
      ATPNAME_LN        { // t: 1dotRefLNex
        $1 = $1.substr(1, $1.length-1);
        var namePos = $1.indexOf(':');
        $$ = expandPrefix($1.substr(0, namePos)) + $1.substr(namePos + 1);
      }
    | ATPNAME_NS        { // t: 1dotRefNS1
        $1 = $1.substr(1, $1.length-1);
        $$ = expandPrefix($1.substr(0, $1.length - 1));
      }
    | '@' shapeLabel    { $$ = $2; } // t: 1dotRef1, 1dotRefSpaceLNex, 1dotRefSpaceNS1
    | shapeDefinition   { // t: 1dotInline1
        addShape($$ = blank(), $1);
      }
    ;

xsFacet:
      stringFacet       // t: 1literalLength
    | numericFacet      // t: 1literalTotaldigits
    ;

stringFacet:
      stringLength INTEGER      -> keyValObject($1, parseInt($2, 10)) // t: 1literalLength
    | IT_PATTERN string -> { pattern: $2.substr(1, $2.length-2) } // t: 1literalPattern
    | '~' string        -> { pattern: $2.substr(1, $2.length-2) } // t: 1literalPattern
    ;

stringLength:
      IT_LENGTH         -> "length" // t: 1literalLength
    | IT_MINLENGTH      -> "minlength" // t: 1literalMinlength
    | IT_MAXLENGTH      -> "maxlength" // t: 1literalMaxlength
    ;

numericFacet:
      numericRange _rawNumeric  -> keyValObject($1, $2) // t: 1literalMininclusive
    | numericLength INTEGER     -> keyValObject($1, parseInt($2, 10)) // t: 1literalTotaldigits
    ;

_rawNumeric: // like numericLiteral but doesn't parse as RDF literal
      INTEGER   -> parseInt($1, 10);
    | DECIMAL   -> parseFloat($1);
    | DOUBLE    -> parseFloat($1);
    | string '^^' datatype      {
        $1 = $1.substr(1, $1.length - 2);
        if ($3 === XSD_DECIMAL || $3 === XSD_FLOAT || $3 === XSD_DOUBLE)
          $$ = parseFloat($1);
        else if (numericDatatypes.indexOf($3) !== -1)
          $$ = parseInt($1)
        else
          error("Parse error: numeric range facet expected numeric datatype instead of " + $3);
      }
    ;

numericRange:
      IT_MININCLUSIVE   -> "mininclusive" // t: 1literalMininclusive
    | IT_MINEXCLUSIVE   -> "minexclusive" // t: 1literalMinexclusive
    | IT_MAXINCLUSIVE   -> "maxinclusive" // t: 1literalMaxinclusive
    | IT_MAXEXCLUSIVE   -> "maxexclusive" // t: 1literalMaxexclusive
    ;

numericLength:
      IT_TOTALDIGITS    -> "totaldigits" // t: 1literalTotaldigits
    | IT_FRACTIONDIGITS -> "fractiondigits" // t: 1literalFractiondigits
    ;

datatype:
      iri       ;

annotation:
      '//' predicate _O_Qiri_E_Or_Qliteral_E_C   -> { type: "Annotation", predicate: $2, object: $3 } // t: 1dotAnnotIRIREF
    ;

_O_Qiri_E_Or_Qliteral_E_C:
      iri       // t: 1dotAnnotIRIREF
    | literal   // t: 1dotAnnotSTRING_LITERAL1
    ;

cardinality:
      '*'       -> { min:0, max:"*" } // t: 1cardStar
    | '+'       -> { min:1, max:"*" } // t: 1cardPlus
    | '?'       -> { min:0, max:1 } // t: 1cardOpt
    | REPEAT_RANGE      {
        $1 = $1.substr(1, $1.length-2);
        var nums = $1.match(/(\d+)/g);
        $$ = { min: parseInt(nums[0], 10) }; // t: 1card2blank, 1card2Star
        if (nums.length === 2)
            $$["max"] = parseInt(nums[1], 10); // t: 1card23
        else if ($1.indexOf(',') === -1) // t: 1card2
            $$["max"] = parseInt(nums[0], 10);
        else
            $$["max"] = "*";
      }
    ;

valueSet:
      '[' _Qvalue_E_Star ']'    -> $2 // t: 1val1IRIREF
    ;

_Qvalue_E_Star:
      -> [] // t: 1val1IRIREF
    | _Qvalue_E_Star value      -> appendTo($1, $2) // t: 1val1IRIREF
    ;

value:
      iriRange  // t: 1val1IRIREF
    | literal   // t: 1val1DECIMAL
    ;

iriRange:
      iri _Q_O_Q_TILDE_E_S_Qexclusion_E_Star_C_E_Opt    {
        if ($2) {
          $$ = {  // t: 1val1iriStem, 1val1iriStemMinusiri3
            type: "StemRange",
            stem: $1
          };
          if ($2.length)
            $$["exclusions"] = $2; // t: 1val1iriStemMinusiri3
        } else {
          $$ = $1; // t: 1val1IRIREF, 1AvalA
        }
      }
    | '.' _Qexclusion_E_Plus    -> { type: "StemRange", stem: { type: "Wildcard" }, exclusions: $2 } // t:1val1dotMinusiri3, 1val1dotMinusiriStem3
    ;

_Qexclusion_E_Star:
      -> [] // t: 1val1iriStem, 1val1iriStemMinusiri3
    | _Qexclusion_E_Star exclusion      -> appendTo($1, $2) // t: 1val1iriStemMinusiri3
    ;

_O_Q_TILDE_E_S_Qexclusion_E_Star_C:
      '~' _Qexclusion_E_Star    -> $2 // t: 1val1iriStemMinusiri3
    ;

_Q_O_Q_TILDE_E_S_Qexclusion_E_Star_C_E_Opt:
      // t: 1val1IRIREF
    | _O_Q_TILDE_E_S_Qexclusion_E_Star_C        // t: 1val1iriStemMinusiri3
    ;

_Qexclusion_E_Plus:
      exclusion -> [$1] // t:1val1dotMinusiri3, 1val1dotMinusiriStem3
    | _Qexclusion_E_Plus exclusion      -> appendTo($1, $2) // t:1val1dotMinusiri3, 1val1dotMinusiriStem3
    ;

exclusion:
      '-' iri   -> $2 // t: 1val1iriStemMinusiri3
    | '-' iri '~'       -> { type: "Stem", stem: $2 } // t: 1val1iriStemMinusiriStem3
    ;

literal:
      string    // t: 1val1STRING_LITERAL1
    | string LANGTAG    -> $1 + lowercase($2) // t: 1val1LANGTAG
    | string '^^' datatype      -> $1 + '^^' + $3 // t: 1val1Datatype
    | numericLiteral
    | IT_true   -> XSD_TRUE // t: 1val1true
    | IT_false  -> XSD_FALSE // t: 1val1false
    ;

numericLiteral:
      INTEGER   -> createLiteral($1, XSD_INTEGER) // t: 1val1INTEGER
    | DECIMAL   -> createLiteral($1, XSD_DECIMAL) // t: 1val1DECIMAL
    | DOUBLE    -> createLiteral($1.toLowerCase(), XSD_DOUBLE) // t: 1val1DOUBLE
    ;

string:
      STRING_LITERAL1   -> unescapeString($1, 1) // t: 1val1STRING_LITERAL1
    | STRING_LITERAL2   -> unescapeString($1, 1) // t: 1val1STRING_LITERAL2
    | STRING_LITERAL_LONG1      -> unescapeString($1, 3) // t: 1val1STRING_LITERAL_LONG1
    | STRING_LITERAL_LONG2      -> unescapeString($1, 3) // t: 1val1STRING_LITERAL_LONG2
    ;

iri:
      IRIREF    -> this._base === null || absoluteIRI.test($1.slice(1, -1)) ? unescape($1.slice(1,-1), irirefEscapeSequence) : _resolveIRI(unescape($1.slice(1,-1), irirefEscapeSequence)) // t: 1dot
    | PNAME_LN  { // t:1dotPNex, 1dotPNdefault, ShExParser-test.js/with pre-defined prefixes
        var namePos = $1.indexOf(':');
        $$ = expandPrefix($1.substr(0, namePos)) + $1.substr(namePos + 1);
    }
    | PNAME_NS  { // t: 1dotNS2, 1dotNSdefault, ShExParser-test.js/PNAME_NS with pre-defined prefixes
        $$ = expandPrefix($1.substr(0, $1.length - 1));
    }
    ;

blankNode:
      BLANK_NODE_LABEL  // t: 1dotInline1
    // | ANON    -- not used
    ;

codeDecl:
     // XXX '%' CODE  -> unescapeSemanticAction("", $2) // t: 1dotUnlabeledCode1
      '%' iri CODE      -> unescapeSemanticAction($2, $3) // t: 1dotCode1
    | '%' iri '%'      -> { type: "SemAct", name: $2 } // t: @@
    ;

startActions:
      _QcodeDecl_E_Plus {
        Parser.startActs = $1; // t: startCode1
      }
    ;

_QcodeDecl_E_Plus:
      codeDecl  -> [$1] // t: startCode1
    | _QcodeDecl_E_Plus codeDecl        -> appendTo($1, $2) // t: startCode3
    ;

semanticActions:
      _QcodeDecl_E_Star -> $1.length ? { semActs: $1 } : null; // t: 1dotCode1/2oneOfDot

    ;

_QcodeDecl_E_Star:
      -> [] // t: 1dot, 1dotCode1
    | _QcodeDecl_E_Star codeDecl        -> appendTo($1, $2) // t: 1dotCode1
    ;

