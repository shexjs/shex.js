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
    SPARQL parser in the Jison parser generator format.
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


  var base = '', basePath = '', baseRoot = '';

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

  // Resolves an IRI against a base path
  function resolveIRI(iri) {
    // Strip off possible angular brackets
    if (iri[0] === '<')
      iri = iri.substring(1, iri.length - 1);
    switch (iri[0]) {
    // An empty relative IRI indicates the base IRI
    case undefined:
      return base;
    // Resolve relative fragment IRIs against the base IRI
    case '#':
      return base + iri;
    // Resolve relative query string IRIs by replacing the query string
    case '?':
      return base.replace(/(?:\?.*)?$/, iri);
    // Resolve root relative IRIs at the root of the base IRI
    case '/':
      return baseRoot + iri;
    // Resolve all other IRIs at the base IRI's path
    default:
      return /^[a-z]+:/.test(iri) ? iri : basePath + iri;
    }
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

  // Regular expression and replacement strings to escape strings
  var escapeSequence = /\\u([a-fA-F0-9]{4})|\\U([a-fA-F0-9]{8})|\\(.)/g,
      escapeReplacements = { '\\': '\\', "'": "'", '"': '"',
                             't': '\t', 'b': '\b', 'n': '\n', 'r': '\r', 'f': '\f' },
      fromCharCode = String.fromCharCode;

  // Translates escape codes in the string into their textual equivalent
  function unescapeString(string, trimLength) {
    string = string.substring(trimLength, string.length - trimLength);
    try {
      string = string.replace(escapeSequence, function (sequence, unicode4, unicode8, escapedChar) {
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
          var replacement = escapeReplacements[escapedChar];
          if (!replacement) throw new Error();
          return replacement;
        }
      });
    }
    catch (error) { return ''; }
    return '"' + string + '"';
  }

  // Return object with p1 key, p2 integer value
  function keyInt(key, val) {
    var ret = {};
    ret[key] = parseInt(val, 10);
    return ret;
  }

  // Return object with p1 key, p2 string value
  function keyString(key, val) {
    var ret = {};
    ret[key] = val;
    return ret;
  }
%}

/* lexical grammar */
%lex

IT_BASE			[Bb][Aa][Ss][Ee]
IT_PREFIX		[Pp][Rr][Ee][Ff][Ii][Xx]
IT_VIRTUAL		[Vv][Ii][Rr][Tt][Uu][Aa][Ll]
IT_CLOSED		[Cc][Ll][Oo][Ss][Ee][Dd]
IT_EXTRA		[Ee][Xx][Tt][Rr][Aa]
IT_LITERAL		[Ll][Ii][Tt][Ee][Rr][Aa][Ll]
IT_BNODE		[Bb][Nn][Oo][Dd][Ee]
IT_IRI			[Ii][Rr][Ii]
IT_NONLITERAL		[Nn][Oo][Nn][Ll][Ii][Tt][Ee][Rr][Aa][Ll]
IT_PATTERN		[Pp][Aa][Tt][Tt][Ee][Rr][Nn]
//IT_AND			[Aa][Nn][Dd]
IT_OR			[Oo][Rr]
IT_MININCLUSIVE		[Mm][Ii][Nn][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]
IT_MINEXCLUSIVE		[Mm][Ii][Nn][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]
IT_MAXINCLUSIVE		[Mm][Aa][Xx][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]
IT_MAXEXCLUSIVE		[Mm][Aa][Xx][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]
IT_LENGTH		[Ll][Ee][Nn][Gg][Tt][Hh]
IT_MINLENGTH		[Mm][Ii][Nn][Ll][Ee][Nn][Gg][Tt][Hh]
IT_MAXLENGTH		[Mm][Aa][Xx][Ll][Ee][Nn][Gg][Tt][Hh]
IT_TOTALDIGITS		[Tt][Oo][Tt][Aa][Ll][Dd][Ii][Gg][Ii][Tt][Ss]
IT_FRACTIONDIGITS	[Ff][Rr][Aa][Cc][Tt][Ii][Oo][Nn][Dd][Ii][Gg][Ii][Tt][Ss]
//CODE			"%" ([#+A-Z_a-z][#+0-9A-Z_a-z]*)? "{" ([^%] | '\\' '%')* "%" "}"
CODE			"{" ([^%] | '\\' '%')* "%}"
LANGTAG			"@"([A-Za-z])+(("-"([0-9A-Za-z])+))*
INTEGER			([+-])?([0-9])+
REPEAT_RANGE		"{"({INTEGER})((","(({INTEGER})|'*')?))?"}"
DECIMAL			([+-])?([0-9])*"."([0-9])+
EXPONENT		[Ee]([+-])?([0-9])+
DOUBLE			([+-])?((([0-9])+"."([0-9])*({EXPONENT}))|((".")?([0-9])+({EXPONENT})))
ECHAR			"\\"[\"\\bfnrt]
WS			(" ")|(("\t")|(("\r")|("\n")))
//ANON			"\["(({WS}))*"\]"
PN_CHARS_BASE           [A-Z] | [a-z] | [\u00c0-\u00d6] | [\u00d8-\u00f6] | [\u00f8-\u02ff] | [\u0370-\u037d] | [\u037f-\u1fff] | [\u200c-\u200d] | [\u2070-\u218f] | [\u2c00-\u2fef] | [\u3001-\ud7ff] | [\uf900-\ufdcf] | [\ufdf0-\ufffd] // | [\U00010000-\U000effff] /* !!! matches lower characters in jison lexer */
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
STRING_LITERAL1         "'" ([^\u0027\u005c\u000a\u000d] | {ECHAR} | {UCHAR})* "'" /* #x27=' #x5C=\ #xA=new line #xD=carriage return */
STRING_LITERAL2         '"' ([^\u0022\u005c\u000a\u000d] | {ECHAR} | {UCHAR})* '"' /* #x22=" #x5C=\ #xA=new line #xD=carriage return */
STRING_LITERAL_LONG1    "'''" (("'" | "''")? ([^\'\\] | {ECHAR} | {UCHAR}))* "'''"
STRING_LITERAL_LONG2    '"""' (('"' | '""')? ([^\"\\] | {ECHAR} | {UCHAR}))* '"""'
IRIREF			'<' ([^\u0000-\u0020<>\"{}|^`\\] | {UCHAR})* '>' /* #x00=NULL #01-#x1F=control codes #x20=space */
//ATIRIREF		'@<' ([^\u0000-\u0020<>\"{}|^`\\] | {UCHAR})* '>' /* #x00=NULL #01-#x1F=control codes #x20=space */
PN_LOCAL_ESC            '\\' ('_' | '~' | '.' | '-' | '!' | '$' | '&' | "'" | '(' | ')' | '*' | '+' | ',' | ';' | '=' | '/' | '?' | '#' | '@' | '%')
PLX                     {PERCENT} | {PN_LOCAL_ESC}
PN_LOCAL                ({PN_CHARS_U} | ':' | [0-9] | {PLX}) (({PN_CHARS} | '.' | ':' | {PLX})* ({PN_CHARS} | ':' | {PLX}))?
PNAME_LN                {PNAME_NS} {PN_LOCAL}
ATPNAME_LN              '@' {PNAME_NS} {PN_LOCAL}
COMMENT			('//'|'#') [^\u000a\u000d]*

%%

\s+|{COMMENT} /**/
{CODE}			return 'CODE';
{ATPNAME_LN}		return 'ATPNAME_LN';
// {ATIRIREF}		return 'ATIRIREF';
{ATPNAME_NS}		return 'ATPNAME_NS';
// {ATBLANK_NODE_LABEL}	return 'ATBLANK_NODE_LABEL';
{LANGTAG}		return 'LANGTAG';
"@"			return '@';
{PNAME_LN}		return 'PNAME_LN';
{REPEAT_RANGE}		return 'REPEAT_RANGE';
{DOUBLE}		return 'DOUBLE';
{DECIMAL}		return 'DECIMAL';
//{EXPONENT}		return 'EXPONENT';
{INTEGER}		return 'INTEGER';
//{ECHAR}		return 'ECHAR';
//{WS}			return 'WS';
{ANON}			return 'ANON';
{IRIREF}		return 'IRIREF';
{PNAME_NS}		return 'PNAME_NS';
"a"			return 'a';
//{PN_CHARS_BASE}	return 'PN_CHARS_BASE';
//{PN_CHARS_U}		return 'PN_CHARS_U';
//{PN_CHARS}		return 'PN_CHARS';
{BLANK_NODE_LABEL}	return 'BLANK_NODE_LABEL';
//{PN_PREFIX}		return 'PN_PREFIX';
//{HEX}			return 'HEX';
//{PERCENT}		return 'PERCENT';
//{UCHAR}		return 'UCHAR';
{STRING_LITERAL_LONG1}	return 'STRING_LITERAL_LONG1';
{STRING_LITERAL_LONG2}	return 'STRING_LITERAL_LONG2';
{STRING_LITERAL1}	return 'STRING_LITERAL1';
{STRING_LITERAL2}	return 'STRING_LITERAL2';
//{PN_LOCAL_ESC}	return 'PN_LOCAL_ESC';
//{PLX}			return 'PLX';
//{PN_LOCAL}		return 'PN_LOCAL';
{IT_BASE}		return 'IT_BASE';
{IT_PREFIX}		return 'IT_PREFIX';
"start"			return 'IT_start';
{IT_VIRTUAL}		return 'IT_VIRTUAL';
{IT_CLOSED}		return 'IT_CLOSED';
{IT_EXTRA}		return 'IT_EXTRA';
{IT_LITERAL}		return 'IT_LITERAL';
{IT_BNODE}		return 'IT_BNODE';
{IT_IRI}		return 'IT_IRI';
{IT_NONLITERAL}		return 'IT_NONLITERAL';
{IT_PATTERN}		return 'IT_PATTERN';
//{IT_AND}		return 'IT_AND';
{IT_OR}			return 'IT_OR';
{IT_MININCLUSIVE}	return 'IT_MININCLUSIVE';
{IT_MINEXCLUSIVE}	return 'IT_MINEXCLUSIVE';
{IT_MAXINCLUSIVE}	return 'IT_MAXINCLUSIVE';
{IT_MAXEXCLUSIVE}	return 'IT_MAXEXCLUSIVE';
{IT_LENGTH}		return 'IT_LENGTH';
{IT_MINLENGTH}		return 'IT_MINLENGTH';
{IT_MAXLENGTH}		return 'IT_MAXLENGTH';
{IT_TOTALDIGITS}	return 'IT_TOTALDIGITS';
{IT_FRACTIONDIGITS}	return 'IT_FRACTIONDIGITS';
"="			return '=';
"{"			return '{';
"}"			return '}';
"&"			return '&';
"||"			return '||';
"|"			return '|';
","			return ',';
"("			return '(';
")"			return ')';
"$"			return '$';
"!"			return '!';
"^^"			return '^^';
"^"			return '^';
"."			return '.';
"~"			return '~';
";"			return ';';
"*"			return '*';
"+"			return '+';
"?"			return '?';
"-"			return '-';
"%"			return '%';
"true"			return 'IT_true';
"false"			return 'IT_false';
<<EOF>>			return 'EOF'
.			return 'invalid character'

/lex

/* operator associations and precedence */

%start shexDoc

%% /* language grammar */

shexDoc:
      _Qdirective_E_Star _Q_O_Qstart_E_Or_Qshape_E_Or_QstartActions_E_S_Qstatement_E_Star_C_E_Opt EOF	{
        var startObj = Parser.start ? { start: Parser.start } : {};           // Build return object from
        var startAct = Parser.startAct ? { startAct: Parser.startAct } : {};
        var ret = extend({ type: 'schema', prefixes: Parser.prefixes || {} }, // components in parser state
                         startAct, startObj,                                  // maintaining intuitve order.
                         {shapes: Parser.shapes});
        Parser.prefixes = Parser.shapes = Parser.start = Parser.startAct = null; // Reset state.
        base = basePath = baseRoot = '';
        return ret;
      }
    ;

_Qdirective_E_Star:
      
    | _Qdirective_E_Star directive	
    ;

_O_Qstart_E_Or_Qshape_E_Or_QstartActions_E_C:
      start	
    | shape	
    | startActions	
    ;

_Qstatement_E_Star:
      
    | _Qstatement_E_Star statement	
    ;

_O_Qstart_E_Or_Qshape_E_Or_QstartActions_E_S_Qstatement_E_Star_C:
      _O_Qstart_E_Or_Qshape_E_Or_QstartActions_E_C _Qstatement_E_Star	// t: 1dot
    ;

_Q_O_Qstart_E_Or_Qshape_E_Or_QstartActions_E_S_Qstatement_E_Star_C_E_Opt:
      // t: @@
    | _O_Qstart_E_Or_Qshape_E_Or_QstartActions_E_S_Qstatement_E_Star_C	// t: 1dot
    ;

statement:
      directive	// t: open1dotclose
    | start	// t: startCode1startRef
    | shape	// t: 1iriRef1
    ;

directive:
      baseDecl	// t: @@
    | prefixDecl	// t: 1dotLNex
    ;

baseDecl:
      IT_BASE IRIREF	{ // t: @@
        base = resolveIRI($2)
        basePath = base.replace(/[^\/]*$/, '');
        baseRoot = base.match(/^(?:[a-z]+:\/*)?[^\/]*/)[0];
      }
    ;

prefixDecl:
      IT_PREFIX PNAME_NS IRIREF	{ // t: ShExParser-test.js/with pre-defined prefixes
        if (!Parser.prefixes) Parser.prefixes = {};
        $2 = $2.substr(0, $2.length - 1);
        $3 = resolveIRI($3);
        Parser.prefixes[$2] = $3;
      }
    ;

start:
      IT_start '=' _O_QshapeLabel_E_Or_QshapeDefinition_E_S_QsemanticActions_E_C	{
        Parser.start = $3; // t: startInline
      }
    ;

_O_QshapeLabel_E_Or_QshapeDefinition_E_S_QsemanticActions_E_C:
      shapeLabel	// t: startRef
    | shapeDefinition semanticActions	{ // t: startInline
        if (!Parser.shapes) Parser.shapes = {};
        $$ = blank();
        // $2: t: startInline
        Parser.shapes[$$] = extend($1, $2);
    }
    ;

shape:
    // _QIT_VIRTUAL_E_Opt 
      shapeLabel shapeDefinition semanticActions	{ // t: 1dot
        if (!Parser.shapes) Parser.shapes = {};
        // $3: t: 1dotShapeCode1
        Parser.shapes[$1] = extend($2, $3);
    }
    | IT_VIRTUAL shapeLabel shapeDefinition semanticActions	{ // t: 1dotVirtual
        if (!Parser.shapes) Parser.shapes = {};
        // $4: t: 1dotVirtualShapeCode1
        Parser.shapes[$2] = extend({type: null, virtual: true}, $3, $4); // sneak 'virtual' in after 'type'
                                                                         // Type will be overwritten.
    }
    ;

// _QIT_VIRTUAL_E_Opt:
//     
//     | IT_VIRTUAL	;

shapeDefinition:
      _Q_O_QincludeSet_E_Or_QinclPropertySet_E_Or_QIT_CLOSED_E_C_E_Star '{' _QoneOfShape_E_Opt '}'	{ // t: 1dotInherit3
	var exprObj = $3 ? { expression: $3 } : {}; // t: 0, 0Inherit1
        $$ = extend({ type: "shape"}, exprObj, $1);
      }
    ;

_O_QincludeSet_E_Or_QinclPropertySet_E_Or_QIT_CLOSED_E_C:
      includeSet	-> [ 'inherit', $1 ] // t: 1dotInherit1
    | inclPropertySet	-> [ 'extra', $1 ] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3
    | IT_CLOSED	-> [ 'closed', true ] // t: 1dotClosed
    ;

_Q_O_QincludeSet_E_Or_QinclPropertySet_E_Or_QIT_CLOSED_E_C_E_Star:
      -> {}
    | _Q_O_QincludeSet_E_Or_QinclPropertySet_E_Or_QIT_CLOSED_E_C_E_Star _O_QincludeSet_E_Or_QinclPropertySet_E_Or_QIT_CLOSED_E_C	{
      if ($2[0] === 'closed')
        $1['closed'] = true; // t: 1dotClosed
      else if ($2[0] in $1)
        $1[$2[0]] = unionAll($1[$2[0]], $2[1]); // t: 1dotInherit3, 3groupdot3Extra, 3groupdotExtra3
      else
        $1[$2[0]] = $2[1]; // t: 1dotInherit1
      $$ = $1;
    }
    ;

_QoneOfShape_E_Opt:
      	// t: 0
    | oneOfShape	// t: 1dot
    ;

includeSet:
      '&' _QshapeLabel_E_Plus	-> $2 // t: 1dotInherit1, 1dot3Inherit, 1dotInherit3
    ;

_QshapeLabel_E_Plus:
      shapeLabel	-> [$1] // t: 1dotInherit1, 1dot3Inherit, 1dotInherit3
    | _QshapeLabel_E_Plus shapeLabel	-> appendTo($1, $2) // t: 1dotInherit3
    ;

inclPropertySet:
      IT_EXTRA _Qpredicate_E_Plus	-> $2 // t: 1dotExtra1, 3groupdot3Extra
    ;

_Qpredicate_E_Plus:
      predicate	-> [$1] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3
    | _Qpredicate_E_Plus predicate	-> appendTo($1, $2) // t: 3groupdotExtra3
    ;

oneOfShape:
      someOfShape _Q_O_QGT_PIPE_E_S_QsomeOfShape_E_C_E_Star	-> $2.length ? { type: "oneOf", expressions: unionAll([$1], $2) } : $1 // t: 2oneOfdot
    ;

_O_QGT_PIPE_E_S_QsomeOfShape_E_C:
      '|' someOfShape	-> $2 // t: 2oneOfdot
    ;

_Q_O_QGT_PIPE_E_S_QsomeOfShape_E_C_E_Star:
      -> [] //  t: 2oneOfdot
    | _Q_O_QGT_PIPE_E_S_QsomeOfShape_E_C_E_Star _O_QGT_PIPE_E_S_QsomeOfShape_E_C	-> appendTo($1, $2) //  t: 2oneOfdot
    ;

someOfShape:
      groupShape _Q_O_QGT_OR_E_S_QgroupShape_E_C_E_Star	-> $2.length ? { type: "someOf", expressions: unionAll([$1], $2) } : $1 // t: 2someOfdot
    ;

_O_QGT_OR_E_S_QgroupShape_E_C:
      '||' groupShape	-> $2 // t: 2someOfdot
    ;

_Q_O_QGT_OR_E_S_QgroupShape_E_C_E_Star:
      -> [] // t: 2someOfdot
    | _Q_O_QGT_OR_E_S_QgroupShape_E_C_E_Star _O_QGT_OR_E_S_QgroupShape_E_C	-> appendTo($1, $2) // t: 2someOfdot
    ;

groupShape:
      unaryShape _Q_O_QGT_COMMA_E_S_QunaryShape_E_C_E_Star _QGT_COMMA_E_Opt	-> $2.length ? { type: "group", expressions: unionAll([$1], $2) } : $1 // t: 2groupOfdot
    ;

_O_QGT_COMMA_E_S_QunaryShape_E_C:
      ',' unaryShape	-> $2 // t: 2groupOfdot
    ;

_Q_O_QGT_COMMA_E_S_QunaryShape_E_C_E_Star:
      -> [] // t: 2groupOfdot
    | _Q_O_QGT_COMMA_E_S_QunaryShape_E_C_E_Star _O_QGT_COMMA_E_S_QunaryShape_E_C	-> appendTo($1, $2) // t: 2groupOfdot
    ;

_QGT_COMMA_E_Opt:
      	// t: 1dot
    | ','	// t: 1dotComma
    ;

unaryShape:
    // _Qid_E_Opt 
      unaryShape_right	// t: 1dot
    | id unaryShape_right	-> extend({ id: $1 }, $2) // t: 1iddot
    ;

// _Qid_E_Opt:
//     
//     | id	;

_Qcardinality_E_Opt:
      -> {} // t: 1dot
    | cardinality	// t: 1cardOpt
    ;

unaryShape_right:
      tripleConstraint	
    | include
    | '(' oneOfShape ')' _Qcardinality_E_Opt semanticActions	{
        var hasCard = Object.keys($4).length;
        if ($2.type === 'group') {
          if (hasCard && ('min' in $2 || 'max' in $2)
              || $5 && 'semAct' in $2) {
            $$ = extend({ type: "group" }, $4, { expressions: [$2] }, $5); // t: openopen1dotcloseCode1closeCode2
          } else {
            $$ = extend($2, $4, $5); // t: open3groupdotclose
          }
        } else if (hasCard || $5) {
          $$ = extend({ type: "group" }, $4, { expressions: [$2] }, $5); // t: open1dotcloseCode1
        } else {
          $$ = $2; // t: open1dotclose
        }
      }
    ;

include:
      '&' shapeLabel	-> { type: "include", "include": $2 } // t: 2groupInclude1
    ;

id:
      '$' shapeLabel	-> $2 // t: 1iddot
    ;

shapeLabel:
      iri	// t: 1dot
    | blankNode	// t: 1dotInline1
    ;

tripleConstraint:
    // _QsenseFlags_E_Opt 
      predicate valueClass _Qannotation_E_Star _Qcardinality_E_Opt semanticActions	{
        // $5: t: 1dotCode1
        $$ = extend({ type: "tripleConstraint", predicate: $1, value: $2 }, $4, $5); // t: 1dot
        if ($3.length)
          $$['annotations'] = $3; // t: 1dotAnnot3
      }
    | senseFlags predicate valueClass _Qannotation_E_Star _Qcardinality_E_Opt semanticActions	{
        // %6: t: 1inversedotCode1
        $$ = extend({ type: "tripleConstraint" }, $1, { predicate: $2, value: $3 }, $5, $6); // t: 1inversedot, 1negatedinversedot
        if ($4.length)
          $$['annotations'] = $4; // t: 1inversedotAnnot3
      }
    ;

// _QsenseFlags_E_Opt:
//     
//     | senseFlags	;

_Qannotation_E_Star:
      -> [] // t: 1dot, 1dotAnnot3
    | _Qannotation_E_Star annotation	-> appendTo($1, $2) // t: 1dotAnnot3
    ;

senseFlags:
      '^'	-> { inverse: true } // t: 1inversedot
    | '^' '!'	-> { inverse: true, negated: true } // t: 1negatedinversedot
    | '!'	-> { negated: true } // t: 1negateddot
    | '!' '^'	-> { inverse: true, negated: true } // t: 1inversenegateddot
    ;

predicate:
      iri	// t: 1dot
    ;

valueClass:
      IT_LITERAL _QxsFacet_E_Star	-> extend({ type: "valueClass", nodeKind: "literal" }, $2) // t: 1literalPattern
//    | _O_QIT_IRI_E_Or_QIT_BNODE_E_Or_QIT_NONLITERAL_E_C _QgroupShapeConstr_E_Opt _QstringFacet_E_Star	
    | _O_QIT_IRI_E_Or_QIT_BNODE_E_Or_QIT_NONLITERAL_E_C	-> { type: "valueClass", nodeKind: $1 } // t: 1iriPattern
    | _O_QIT_IRI_E_Or_QIT_BNODE_E_Or_QIT_NONLITERAL_E_C _QstringFacet_E_Plus	-> extend({ type: "valueClass", nodeKind: $1 }, $2) // t: 1iriPattern
    | _O_QIT_IRI_E_Or_QIT_BNODE_E_Or_QIT_NONLITERAL_E_C groupShapeConstr	-> { type: "valueClass", nodeKind: $1, reference: $2 } // t: 1iriRef1
    | _O_QIT_IRI_E_Or_QIT_BNODE_E_Or_QIT_NONLITERAL_E_C groupShapeConstr _QstringFacet_E_Plus	-> extend({ type: "valueClass", nodeKind: $1, reference: $2 }, $3) // t: 1iriRefLength1
    | iri	-> { type: "valueClass", datatype: $1 } // t: 1datatype
    | groupShapeConstr	-> { type: "valueClass", reference: $1 } // t: 1dotRef1
    | valueSet	-> { type: "valueClass", values: $1 } // t: 1val1IRIREF
    | '.'	-> { type: "valueClass" } // t: 1dot
    ;

_QxsFacet_E_Star:
      -> {} // t: 1literalPattern
    | _QxsFacet_E_Star xsFacet	-> extend($1, $2) // t: 1literalLength
    ;

_O_QIT_IRI_E_Or_QIT_BNODE_E_Or_QIT_NONLITERAL_E_C:
      IT_IRI	-> 'iri' // t: 1iriPattern
    | IT_BNODE	-> 'bnode' // t: 1bnodeLength
    | IT_NONLITERAL	-> 'nonliteral' // t: 1nonliteralLength
    ;

// _QgroupShapeConstr_E_Opt:
//     
//     | groupShapeConstr	;

//_Q_O_QIT_PATTERN_E_S_Qstring_E_C_E_Opt:
//      
//    | _O_QIT_PATTERN_E_S_Qstring_E_C	
//    ;

_QstringFacet_E_Plus:
      stringFacet // t: 1literalPattern
    | _QstringFacet_E_Plus stringFacet	-> extend($1, $2) // t: 1literalLength
    ;

groupShapeConstr:
      shapeOrRef _Q_O_QIT_OR_E_S_QshapeOrRef_E_C_E_Star	-> $2.length ? { type: "or", conjuncts: unionAll([$1], $2) } : $1 // t: 1dotRefOr3/1dotRef1
    ;

_O_QIT_OR_E_S_QshapeOrRef_E_C:
      IT_OR shapeOrRef	-> $2 // t: 1dotRefOr3
    ;

_Q_O_QIT_OR_E_S_QshapeOrRef_E_C_E_Star:
      -> [] // t: 1dotRefOr3
    | _Q_O_QIT_OR_E_S_QshapeOrRef_E_C_E_Star _O_QIT_OR_E_S_QshapeOrRef_E_C	-> appendTo($1, $2) // t: 1dotRefOr3
    ;

shapeOrRef:
      ATPNAME_LN	{ // t: 1dotRefLNex
        $1 = $1.substr(1, $1.length-1);
        var namePos = $1.indexOf(':'),
            prefix = $1.substr(0, namePos),
            expansion = Parser.prefixes[prefix];
        if (!expansion) throw new Error('Unknown prefix: ' + prefix);
        $$ = resolveIRI(expansion + $1.substr(namePos + 1));
      }
    | ATPNAME_NS	{ // t: 1dotRefNS1
        $1 = $1.substr(1, $1.length-1);
        $1 = $1.substr(0, $1.length - 1);
        if (!($1 in Parser.prefixes)) throw new Error('Unknown prefix: ' + $1);
        $$ = resolveIRI(Parser.prefixes[$1]);
      }
    | '@' shapeLabel	{ $$ = $2; } // t: 1dotRef1, 1dotRefSpaceLNex, 1dotRefSpaceNS1
    | shapeDefinition	{ // t: 1dotInline1
        if (!Parser.shapes) Parser.shapes = {};
        $$ = blank();
        Parser.shapes[$$] = $1;
      }
    ;

xsFacet:
      stringFacet	// t: 1literalLength
    | numericFacet	// t: 1literalTotaldigits
    ;

stringFacet:
      IT_PATTERN string	-> { pattern: $2.substr(1, $2.length-2) } // t: 1literalPattern
    | '~' string	-> { pattern: $2.substr(1, $2.length-2) } // t: 1literalPattern
    | stringLength INTEGER	-> keyInt($1, $2) // t: 1literalLength
    ;

stringLength:
      IT_LENGTH	  	-> "length" // t: 1literalLength
    | IT_MINLENGTH	-> "minlength" // t: 1literalMinlength
    | IT_MAXLENGTH	-> "maxlength" // t: 1literalMaxlength
    ;

numericFacet:
      numericRange INTEGER	-> keyInt($1, $2) // t: 1literalMininclusive
    | numericLength INTEGER	-> keyInt($1, $2) // t: 1literalTotaldigits
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

annotation:
    ';' iri _O_Qiri_E_Or_Qliteral_E_C	-> [$2, $3] // t: 1dotAnnotIRIREF
    ;

_O_Qiri_E_Or_Qliteral_E_C:
      iri	// t: 1dotAnnotIRIREF
    | literal	// t: 1dotAnnotSTRING_LITERAL1
    ;

cardinality:
      '*'	-> { min:0 } // t: 1cardStar
    | '+'	-> { min:1 } // t: 1cardPlus
    | '?'	-> { min:0, max:1 } // t: 1cardOpt
    | REPEAT_RANGE	{
        $1 = $1.substr(1, $1.length-2);
        var nums = $1.match(/(\d+)/g);
        $$ = { min: parseInt(nums[0], 10) }; // t: 1card2blank, 1card2Star
        if (nums.length === 2)
            $$["max"] = parseInt(nums[1], 10); // t: 1card23
        else if ($1.indexOf(',') === -1) // t: 1card2
            $$["max"] = parseInt(nums[0], 10);
      }
    ;

valueSet:
    '(' _Qvalue_E_Star ')'	-> $2 // t: 1val1IRIREF
    ;

_Qvalue_E_Star:
      -> [] // t: 1val1IRIREF
    | _Qvalue_E_Star value	-> appendTo($1, $2) // t: 1val1IRIREF
    ;

value:
      iriRange	// t: 1val1IRIREF
    | literal	// t: 1val1DECIMAL
    ;

iriRange:
      iri _Q_O_Q_TILDE_E_S_Qexclusion_E_Star_C_E_Opt	{
        if ($2) {
          $$ = {  // t: 1val1iriStem, 1val1iriStemMinusiri3
            type: "stemRange",
            stem: $1
          };
          if ($2.length)
            $$["exclusions"] = $2; // t: 1val1iriStemMinusiri3
        } else {
          $$ = $1; // t: 1val1IRIREF, 1AvalA
        }
      }
    | '.' _Qexclusion_E_Plus	-> { type: "stemRange", stem: { type: "wildcard" }, exclusions: $2 } // t:1val1dotMinusiri3, 1val1dotMinusiriStem3
    ;

_Qexclusion_E_Star:
      -> [] // t: 1val1iriStem, 1val1iriStemMinusiri3
    | _Qexclusion_E_Star exclusion	-> appendTo($1, $2) // t: 1val1iriStemMinusiri3
    ;

_O_Q_TILDE_E_S_Qexclusion_E_Star_C:
    '~' _Qexclusion_E_Star	-> $2 // t: 1val1iriStemMinusiri3
    ;

_Q_O_Q_TILDE_E_S_Qexclusion_E_Star_C_E_Opt:
      // t: 1val1IRIREF
    | _O_Q_TILDE_E_S_Qexclusion_E_Star_C	// t: 1val1iriStemMinusiri3
    ;

_Qexclusion_E_Plus:
      exclusion	-> [$1] // t:1val1dotMinusiri3, 1val1dotMinusiriStem3
    | _Qexclusion_E_Plus exclusion	-> appendTo($1, $2) // t:1val1dotMinusiri3, 1val1dotMinusiriStem3
    ;

exclusion:
      '-' iri	-> $2 // t: 1val1iriStemMinusiri3
    | '-' iri '~'	-> { type: "stem", stem: $2 } // t: 1val1iriStemMinusiriStem3
    ;

literal:
      string	// t: 1val1STRING_LITERAL1
    | string LANGTAG	-> $1 + lowercase($2) // t: 1val1LANGTAG
    | string '^^' iri	-> $1 + '^^' + $3 // t: 1val1Datatype
    | INTEGER	 -> createLiteral($1, XSD_INTEGER) // t: 1val1INTEGER
    | DECIMAL	-> createLiteral($1, XSD_DECIMAL) // t: 1val1DECIMAL
    | DOUBLE	-> createLiteral($1.toLowerCase(), XSD_DOUBLE) // t: 1val1DOUBLE
    | IT_true	-> XSD_TRUE // t: 1val1true
    | IT_false	-> XSD_FALSE // t: 1val1false
    ;

string:
      STRING_LITERAL1	-> unescapeString($1, 1) // t: 1val1STRING_LITERAL1
    | STRING_LITERAL2	-> unescapeString($1, 1) // t: 1val1STRING_LITERAL2
    | STRING_LITERAL_LONG1	 -> unescapeString($1, 3) // t: 1val1STRING_LITERAL_LONG1
    | STRING_LITERAL_LONG2	 -> unescapeString($1, 3) // t: 1val1STRING_LITERAL_LONG2
    ;

iri:
      IRIREF	-> resolveIRI($1) // t: 1dot
    | PNAME_LN	{ // t:1dotPNex, 1dotPNdefault, ShExParser-test.js/with pre-defined prefixes
        var namePos = $1.indexOf(':'),
            prefix = $1.substr(0, namePos),
            expansion = Parser.prefixes[prefix];
        if (!expansion) throw new Error('Unknown prefix: ' + prefix);
        $$ = resolveIRI(expansion + $1.substr(namePos + 1));
    }
    | PNAME_NS	{ // t: 1dotNS2, 1dotNSdefault, ShExParser-test.js/PNAME_NS with pre-defined prefixes
        $1 = $1.substr(0, $1.length - 1);
        if (!($1 in Parser.prefixes)) throw new Error('Unknown prefix: ' + $1);
        $$ = resolveIRI(Parser.prefixes[$1]);
    }
    | 'a'	-> RDF_TYPE // t: 1AvalA
    ;

blankNode:
      BLANK_NODE_LABEL	// t: 1dotInline1
    // | ANON	 -- not used
    ;

codeDecl:
      '%' CODE	-> keyString('', $2.substr(1, $2.length - 3)) // t: 1dotUnlabeledCode1
    | '%' iri CODE	-> keyString($2, $3.substr(1, $3.length - 3)) // t: 1dotCode1
    ;

startActions:
      _QcodeDecl_E_Plus	{
        Parser.startAct = $1; // t: startCode1
      }
    ;

_QcodeDecl_E_Plus:
      codeDecl	// t: startCode1
    | _QcodeDecl_E_Plus codeDecl	-> extend($1, $2) // t: startCode3
    ;

semanticActions:
      _QcodeDecl_E_Star	-> Object.keys($1).length ? { semAct: $1 } : null; // t: 1dotCode1/2oneOfDot

    ;

_QcodeDecl_E_Star:
      -> {} // t: 1dot, 1dotCode1
    | _QcodeDecl_E_Star codeDecl	-> extend($1, $2) // t: 1dotCode1
    ;

