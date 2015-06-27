/*
  jison Equivalent of accompanying bnf, developed in
  http://www.w3.org/2005/01/yacker/uploads/ShEx2

  Process:
    Start with yacker perl output.
    Make """{PNAME_LN} return 'PNAME_LN';""" lexer actions for refereneced terminals.
    Fold X_Opt back in to calling productions to eliminate conflicts.
      (X? didn't seem to accept null input during testing.)
    Stole as much as possible from sparql.jison
      https://github.com/RubenVerborgh/SPARQL.js

  Todo:
    Eliminate X_Star and X_Plus where possible as indicated by testing.
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
  function unionAll() { debugger;
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

  // If the item is a variable, ensures it starts with a question mark
  function toVar(variable) {
    if (variable) {
      var first = variable[0];
      if (first === '?') return variable;
      if (first === '$') return '?' + variable.substr(1);
    }
    return variable;
  }

  // Creates an operation with the given name and arguments
  function operation(operatorName, args) {
    return { type: 'operation', operator: operatorName, args: args || [] };
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

  // Transforms a list of operations types and arguments into a tree of operations
  function createOperationTree(initialExpression, operationList) {
    for (var i = 0, l = operationList.length, item; i < l && (item = operationList[i]); i++)
      initialExpression = operation(item[0], [initialExpression, item[1]]);
    return initialExpression;
  }

  // Group datasets by default and named
  function groupDatasets(fromClauses) {
    var defaults = [], named = [], l = fromClauses.length, fromClause;
    for (var i = 0; i < l && (fromClause = fromClauses[i]); i++)
      (fromClause.named ? named : defaults).push(fromClause.iri);
    return l ? { from: { default: defaults, named: named } } : null;
  }

  // Converts the number to a string
  function toInt(string) {
    return parseInt(string, 10);
  }

  // Transforms a possibly single group into its patterns
  function degroupSingle(group) {
    return group.type === 'group' && group.patterns.length === 1 ? group.patterns[0] : group;
  }

  // Creates a literal with the given value and type
  function createLiteral(value, type) {
    return '"' + value + '"^^' + type;
  }

  // Creates a triple with the given subject, predicate, and object
  function triple(subject, predicate, object) {
    var triple = {};
    if (subject   != null) triple.subject   = subject;
    if (predicate != null) triple.predicate = predicate;
    if (object    != null) triple.object    = object;
    return triple;
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

  // Creates a list, collecting its (possibly blank) items and triples associated with those items
  function createList(objects) {
    var list = blank(), head = list, listItems = [], listTriples, triples = [];
    objects.forEach(function (o) { listItems.push(o.entity); appendAllTo(triples, o.triples); });

    // Build an RDF list out of the items
    for (var i = 0, j = 0, l = listItems.length, listTriples = Array(l * 2); i < l;)
      listTriples[j++] = triple(head, RDF_FIRST, listItems[i]),
      listTriples[j++] = triple(head, RDF_REST,  head = ++i < l ? blank() : RDF_NIL);

    // Return the list's identifier, its triples, and the triples associated with its items
    return { entity: list, triples: appendAllTo(listTriples, triples) };
  }

  // Creates a blank node identifier, collecting triples with that blank node as subject
  function createAnonymousObject(propertyList) {
    var entity = blank();
    return {
      entity: entity,
      triples: propertyList.map(function (t) { return extend(triple(entity), t); })
    };
  }

  // Collects all (possibly blank) objects, and triples that have them as subject
  function objectListToTriples(predicate, objectList, otherTriples) {
    var objects = [], triples = [];
    objectList.forEach(function (l) {
      objects.push(triple(null, predicate, l.entity));
      appendAllTo(triples, l.triples);
    });
    return unionAll(objects, otherTriples || [], triples);
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
IT_AND			[Aa][Nn][Dd]
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
CODE			"%" ([#+A-Z_a-z][#+0-9A-Z_a-z]*)? "{" ([^%] | '\\' '%')* "%" "}"
LANGTAG			"@"([A-Za-z])+(("-"([0-9A-Za-z])+))*
INTEGER			([+-])?([0-9])+
REPEAT_RANGE		"{"({INTEGER})((","(({INTEGER})|'*')?))?"}"
DECIMAL			([+-])?([0-9])*"."([0-9])+
EXPONENT		[Ee]([+-])?([0-9])+
DOUBLE			([+-])?((([0-9])+"."([0-9])*({EXPONENT}))|((".")?([0-9])+({EXPONENT})))
ECHAR			"\\"[\"\\bfnrt]
WS			(" ")|(("\t")|(("\r")|("\n")))
ANON			"\["(({WS}))*"\]"
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
{ATPNAME_LN}		return 'ATPNAME_LN';
// {ATIRIREF}		return 'ATIRIREF';
{ATPNAME_NS}		return 'ATPNAME_NS';
// {ATBLANK_NODE_LABEL}	return 'ATBLANK_NODE_LABEL';
{LANGTAG}		return 'LANGTAG';
"@"			return '@';
{PNAME_LN}		return 'PNAME_LN';
{IT_BASE}		return 'IT_BASE';
{IT_PREFIX}		return 'IT_PREFIX';
"start"			return 'IT_start';
{IT_VIRTUAL}		return 'IT_VIRTUAL';
{REPEAT_RANGE}		return 'REPEAT_RANGE';
{IT_CLOSED}		return 'IT_CLOSED';
{IT_EXTRA}		return 'IT_EXTRA';
{IT_LITERAL}		return 'IT_LITERAL';
{IT_BNODE}		return 'IT_BNODE';
{IT_IRI}		return 'IT_IRI';
{IT_NONLITERAL}		return 'IT_NONLITERAL';
{IT_PATTERN}		return 'IT_PATTERN';
{IT_AND}		return 'IT_AND';
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
"true"			return 'IT_true';
"false"			return 'IT_false';
{CODE}			return 'CODE';
{INTEGER}		return 'INTEGER';
{DECIMAL}		return 'DECIMAL';
{EXPONENT}		return 'EXPONENT';
{DOUBLE}		return 'DOUBLE';
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
{STRING_LITERAL1}	return 'STRING_LITERAL1';
{STRING_LITERAL2}	return 'STRING_LITERAL2';
{STRING_LITERAL_LONG1}	return 'STRING_LITERAL_LONG1';
{STRING_LITERAL_LONG2}	return 'STRING_LITERAL_LONG2';
//{PN_LOCAL_ESC}	return 'PN_LOCAL_ESC';
//{PLX}			return 'PLX';
//{PN_LOCAL}		return 'PN_LOCAL';
<<EOF>>			return 'EOF'
.			return 'invalid character'

/lex

/* operator associations and precedence */

%start shexDoc

%% /* language grammar */

shexDoc:
    _Qdirective_E_Star _Q_O_Qshape_E_Or_Qstart_E_Or_QCODE_E_Plus_S_Qstatement_E_Star_C_E_Opt EOF	{
      var ret = extend({ type: 'schema', prefixes: Parser.prefixes || {} }, {shapes: Parser.shapes});
      Parser.prefixes = Parser.shapes = null;
      base = basePath = baseRoot = '';
      return ret;
    };

_Qdirective_E_Star:
      
    | _Qdirective_E_Star directive	
    ;

_QCODE_E_Plus:
      CODE	
    | _QCODE_E_Plus CODE	
    ;

_O_Qshape_E_Or_Qstart_E_Or_QCODE_E_Plus_C:
      shape	
    | start	
    | _QCODE_E_Plus	
    ;

_Qstatement_E_Star:
      
    | _Qstatement_E_Star statement	
    ;

_O_Qshape_E_Or_Qstart_E_Or_QCODE_E_Plus_S_Qstatement_E_Star_C:
    _O_Qshape_E_Or_Qstart_E_Or_QCODE_E_Plus_C _Qstatement_E_Star	;

_Q_O_Qshape_E_Or_Qstart_E_Or_QCODE_E_Plus_S_Qstatement_E_Star_C_E_Opt:
      
    | _O_Qshape_E_Or_Qstart_E_Or_QCODE_E_Plus_S_Qstatement_E_Star_C	
    ;



statement:
      directive	
    | start	
    | shape	
    ;

directive:
      baseDecl	
    | prefixDecl	
    ;

baseDecl:
    IT_BASE IRIREF	{ 
      base = resolveIRI($2)
      basePath = base.replace(/[^\/]*$/, '');
      baseRoot = base.match(/^(?:[a-z]+:\/*)?[^\/]*/)[0];
    }
    ;

prefixDecl:
    IT_PREFIX PNAME_NS IRIREF	{ // t: ShexParser-test.js/with pre-defined prefixes
      if (!Parser.prefixes) Parser.prefixes = {};
      $2 = $2.substr(0, $2.length - 1);
      $3 = resolveIRI($3);
      Parser.prefixes[$2] = $3;
    };

start:
    IT_start '=' _O_QshapeLabel_E_Or_QshapeDefinition_E_S_QCODE_E_Star_C	;

_QCODE_E_Star:
      
    | _QCODE_E_Star CODE	
    ;

_O_QshapeLabel_E_Or_QshapeDefinition_E_S_QCODE_E_Star_C:
      shapeLabel	
    | shapeDefinition _QCODE_E_Star	
    ;

shape:
    // _QIT_VIRTUAL_E_Opt 
      shapeLabel shapeDefinition _QCODE_E_Star	{ // t: 1dot
        if (!Parser.shapes) Parser.shapes = {};
        Parser.shapes[$1] = $2;
    }
    | IT_VIRTUAL shapeLabel shapeDefinition _QCODE_E_Star	
    ;

// _QIT_VIRTUAL_E_Opt:
//     
//     | IT_VIRTUAL	;

shapeDefinition:
    _Q_O_Qinclude_E_Or_QinclPropertySet_E_Or_QIT_CLOSED_E_C_E_Star '{' _QoneOfShape_E_Opt '}'	{ // t: 1dotInherit3
      $$ = extend($3, $1);
    };

_O_Qinclude_E_Or_QinclPropertySet_E_Or_QIT_CLOSED_E_C:
      include	-> [ 'inherit', $1 ] // t: 1dotInherit1
    | inclPropertySet	-> [ 'extra', $1 ] // t: 1dotExtra1
    | IT_CLOSED	-> [ 'closed', true ] // t: 1dotClosed
    ;

_Q_O_Qinclude_E_Or_QinclPropertySet_E_Or_QIT_CLOSED_E_C_E_Star:
      -> {}
    | _Q_O_Qinclude_E_Or_QinclPropertySet_E_Or_QIT_CLOSED_E_C_E_Star _O_Qinclude_E_Or_QinclPropertySet_E_Or_QIT_CLOSED_E_C	{
      if ($2[0] === 'closed') // t: 1dotClosed
        $1['closed'] = true;
      else if ($2[0] in $1)
        $1[$2[0]] = $1[$2[0]].concat([$2[1]]); // t: 1dotInherit3, 3groupdotExtra3
      else
        $1[$2[0]] = [$2[1]]; // t: 1dotInherit1
      $$ = $1;
    }
    ;

_QoneOfShape_E_Opt:
      
    | oneOfShape	
    ;

include:
    '&' shapeLabel	-> $2 // t:, 1dotInherit1
    ;

inclPropertySet:
    IT_EXTRA _Qpredicate_E_Plus	-> $2
    ;

_Qpredicate_E_Plus:
      predicate	
    | _Qpredicate_E_Plus predicate	;

oneOfShape:
    someOfShape _Q_O_Q_PIPE_E_S_QsomeOfShape_E_C_E_Star	-> $2.length ? { type: "oneOf", patterns: [$1].concat($2) } : $1 // t: 2oneOfdot
    ;

_O_Q_PIPE_E_S_QsomeOfShape_E_C:
    '|' someOfShape	-> $2 // t: 2oneOfdot
    ;

_Q_O_Q_PIPE_E_S_QsomeOfShape_E_C_E_Star:
      -> [] //  t: 2oneOfdot
    | _Q_O_Q_PIPE_E_S_QsomeOfShape_E_C_E_Star _O_Q_PIPE_E_S_QsomeOfShape_E_C	-> $1.concat($2) //  t: 2oneOfdot
    ;

someOfShape:
    groupShape _Q_O_Q_OR_E_S_QgroupShape_E_C_E_Star	-> $2.length ? { type: "someOf", patterns: [$1].concat($2) } : $1 // t: 2someOfdot
    ;

_O_Q_OR_E_S_QgroupShape_E_C:
    '||' groupShape	-> $2 // t: 2someOfdot
    ;

_Q_O_Q_OR_E_S_QgroupShape_E_C_E_Star:
      -> [] // t: 2someOfdot
    | _Q_O_Q_OR_E_S_QgroupShape_E_C_E_Star _O_Q_OR_E_S_QgroupShape_E_C	-> $1.concat($2) // t: 2someOfdot
    ;

groupShape:
    unaryShape _Q_O_Q_COMMA_E_S_QunaryShape_E_C_E_Star _Q_COMMA_E_Opt	-> $2.length ? { type: "group", patterns: [$1].concat($2) } : $1 // t: 2groupOfdot
    ;

_O_Q_COMMA_E_S_QunaryShape_E_C:
    ',' unaryShape	-> $2 // t: 2groupOfdot
    ;

_Q_O_Q_COMMA_E_S_QunaryShape_E_C_E_Star:
      -> [] // t: 2groupOfdot
    | _Q_O_Q_COMMA_E_S_QunaryShape_E_C_E_Star _O_Q_COMMA_E_S_QunaryShape_E_C	-> $1.concat($2) // t: 2groupOfdot
    ;

_Q_COMMA_E_Opt:
      
    | ','	
    ;

unaryShape:
    // _Qid_E_Opt 
      _O_QtripleConstraint_E_Or_Qinclude_E_Or_Q_LPAREN_E_S_QoneOfShape_E_S_Q_RPAREN_E_S_Qcardinality_E_Opt_S_QCODE_E_Star_C	
    | id _O_QtripleConstraint_E_Or_Qinclude_E_Or_Q_LPAREN_E_S_QoneOfShape_E_S_Q_RPAREN_E_S_Qcardinality_E_Opt_S_QCODE_E_Star_C	
    ;

// _Qid_E_Opt:
//     
//     | id	;

_Qcardinality_E_Opt:
      -> {} // t: 1dot
    | cardinality	
    ;

_O_QtripleConstraint_E_Or_Qinclude_E_Or_Q_LPAREN_E_S_QoneOfShape_E_S_Q_RPAREN_E_S_Qcardinality_E_Opt_S_QCODE_E_Star_C:
      tripleConstraint	
    | include	-> { type: "include", "include": $1 } // t: 2groupInclude1
    | '(' oneOfShape ')' _Qcardinality_E_Opt _QCODE_E_Star	
    ;

id:
    '$' shapeLabel	;

shapeLabel:
      iri	
    | blankNode	
    ;

tripleConstraint:
    // _QsenseFlags_E_Opt 
      predicate valueClass _Qannotation_E_Star _Qcardinality_E_Opt _QCODE_E_Star	{ // t: 1dot
        $$ = extend({ type: "tripleConstraint", predicate: $1, value: $2 }, $4);
    }
    | senseFlags predicate valueClass _Qannotation_E_Star _Qcardinality_E_Opt _QCODE_E_Star	
    ;

// _QsenseFlags_E_Opt:
//     
//     | senseFlags	;

_Qannotation_E_Star:
      
    | _Qannotation_E_Star annotation	
    ;

senseFlags:
      '!' _Q_CARROT_E_Opt	
    | '^' _Q_NOT_E_Opt	
    ;

_Q_CARROT_E_Opt:
      
    | '^'	
    ;

_Q_NOT_E_Opt:
      
    | '!'	
    ;

predicate:
      iri	
    | 'a'	-> RDF_TYPE // t:@@
    ;

valueClass:
      IT_LITERAL _QxsFacet_E_Star	
//    | _O_QIT_IRI_E_Or_QIT_NONLITERAL_E_C _QgroupShapeConstr_E_Opt _Q_O_QIT_PATTERN_E_S_Qstring_E_C_E_Opt	
    | _O_QIT_IRI_E_Or_QIT_NONLITERAL_E_C	
    | _O_QIT_IRI_E_Or_QIT_NONLITERAL_E_C _O_QIT_PATTERN_E_S_Qstring_E_C	
    | _O_QIT_IRI_E_Or_QIT_NONLITERAL_E_C groupShapeConstr	
    | _O_QIT_IRI_E_Or_QIT_NONLITERAL_E_C groupShapeConstr _O_QIT_PATTERN_E_S_Qstring_E_C	
//    | IT_BNODE _QgroupShapeConstr_E_Opt	
    | IT_BNODE	
    | IT_BNODE groupShapeConstr	
    | iri	// datatype
    | groupShapeConstr	-> { type: "reference", reference: $1 } // t: 1dotRef1
    | valueSet	
    | '.'	-> { type: "wildcard" } // t: 1dot
    ;

_QxsFacet_E_Star:
      
    | _QxsFacet_E_Star xsFacet	
    ;

_O_QIT_IRI_E_Or_QIT_NONLITERAL_E_C:
      IT_IRI	
    | IT_NONLITERAL	
    ;

// _QgroupShapeConstr_E_Opt:
//     
//     | groupShapeConstr	;

_O_QIT_PATTERN_E_S_Qstring_E_C:
    IT_PATTERN string	;

_Q_O_QIT_PATTERN_E_S_Qstring_E_C_E_Opt:
      
    | _O_QIT_PATTERN_E_S_Qstring_E_C	
    ;

groupShapeConstr:
    shapeOrRef _Q_O_QIT_AND_E_Or_QIT_OR_E_S_QshapeOrRef_E_C_E_Star	;

_O_QIT_AND_E_Or_QIT_OR_E_C:
      IT_AND	
    | IT_OR	
    ;

_O_QIT_AND_E_Or_QIT_OR_E_S_QshapeOrRef_E_C:
    _O_QIT_AND_E_Or_QIT_OR_E_C shapeOrRef	;

_Q_O_QIT_AND_E_Or_QIT_OR_E_S_QshapeOrRef_E_C_E_Star:
      
    | _Q_O_QIT_AND_E_Or_QIT_OR_E_S_QshapeOrRef_E_C_E_Star _O_QIT_AND_E_Or_QIT_OR_E_S_QshapeOrRef_E_C	
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
console.log($1);
        $1 = $1.substr(1, $1.length-1);
        $1 = $1.substr(0, $1.length - 1);
        if (!($1 in Parser.prefixes)) throw new Error('Unknown prefix: ' + $1);
        $$ = resolveIRI(Parser.prefixes[$1]);
    }
    | '@' shapeLabel	{ $$ = $2; } // t: 1dotRef1, 1dotRefSpaceLNex, 1dotRefSpaceNS1
    | shapeDefinition	
    ;

xsFacet:
    _O_QIT_PATTERN_E_Or_Q_KINDA_E_C string	
    | _O_QIT_MININCLUSIVE_E_Or_QIT_MINEXCLUSIVE_E_Or_QIT_MAXINCLUSIVE_E_Or_QIT_MAXEXCLUSIVE_E_C INTEGER	
    | _O_QIT_LENGTH_E_Or_QIT_MINLENGTH_E_Or_QIT_MAXLENGTH_E_C INTEGER	
    | _O_QIT_TOTALDIGITS_E_Or_QIT_FRACTIONDIGITS_E_C INTEGER	;

_O_QIT_PATTERN_E_Or_Q_KINDA_E_C:
      IT_PATTERN	
    | '~'	
    ;

_O_QIT_MININCLUSIVE_E_Or_QIT_MINEXCLUSIVE_E_Or_QIT_MAXINCLUSIVE_E_Or_QIT_MAXEXCLUSIVE_E_C:
      IT_MININCLUSIVE	
    | IT_MINEXCLUSIVE	
    | IT_MAXINCLUSIVE	
    | IT_MAXEXCLUSIVE	
    ;

_O_QIT_LENGTH_E_Or_QIT_MINLENGTH_E_Or_QIT_MAXLENGTH_E_C:
      IT_LENGTH	
    | IT_MINLENGTH	
    | IT_MAXLENGTH	
    ;

_O_QIT_TOTALDIGITS_E_Or_QIT_FRACTIONDIGITS_E_C:
      IT_TOTALDIGITS	
    | IT_FRACTIONDIGITS	
    ;

annotation:
    ';' iri _O_Qiri_E_Or_Qliteral_E_C	;

_O_Qiri_E_Or_Qliteral_E_C:
      iri	
    | literal	
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
    '(' _Qvalue_E_Star ')'	-> { type: "valueSet", values: $2 } // t: 1val
    ;

_Qvalue_E_Star:
      -> [] // t: 1val
    | _Qvalue_E_Star value	-> $1.concat([$2]) // t: 1val
    ;

value:
      iriRange	
    | literal	
    ;

iriRange:
      iri _Q_O_Q_KINDA_E_S_Qexclusion_E_Star_C_E_Opt	
    | '.' _Qexclusion_E_Plus	
    ;

_Qexclusion_E_Star:
      
    | _Qexclusion_E_Star exclusion	
    ;

_O_Q_KINDA_E_S_Qexclusion_E_Star_C:
    '~' _Qexclusion_E_Star	;

_Q_O_Q_KINDA_E_S_Qexclusion_E_Star_C_E_Opt:
      
    | _O_Q_KINDA_E_S_Qexclusion_E_Star_C	
    ;

_Qexclusion_E_Plus:
      exclusion	
    | _Qexclusion_E_Plus exclusion	
    ;

exclusion:
    '-' iri _Q_KINDA_E_Opt	;

_Q_KINDA_E_Opt:
        
    | '~'	
    ;

literal:
      string	
    | string LANGTAG	-> $1 + lowercase($2) // t:@@
    | string '^^' iri	-> $1 + '^^' + $3 // t:@@
    | INTEGER	 -> createLiteral($1.substr(1), XSD_INTEGER) // t:@@
    | DECIMAL	-> createLiteral($1.substr(1), XSD_DECIMAL) // t:@@
    | DOUBLE	createLiteral($1.substr(1).toLowerCase(), XSD_DOUBLE) // t:@@
    | IT_true	-> XSD_TRUE // t:@@
    | IT_false	-> XSD_FALSE // t:@@
    ;

string:
      STRING_LITERAL1	-> unescapeString($1, 1) // t:@@
    | STRING_LITERAL2	-> unescapeString($1, 1) // t:@@
    | STRING_LITERAL_LONG1	 -> unescapeString($1, 3) // t:@@
    | STRING_LITERAL_LONG2	 -> unescapeString($1, 3) // t:@@
    ;

iri:
      IRIREF	-> resolveIRI($1) // t: 1dot
    | PNAME_LN	{ // t:1dotPNex, 1dotPNdefault, ShexParser-test.js/with pre-defined prefixes
        var namePos = $1.indexOf(':'),
            prefix = $1.substr(0, namePos),
            expansion = Parser.prefixes[prefix];
        if (!expansion) throw new Error('Unknown prefix: ' + prefix);
        $$ = resolveIRI(expansion + $1.substr(namePos + 1));
    }
    | PNAME_NS	{ // t: 1dotNS2, 1dotNSdefault, ShexParser-test.js/PNAME_NS with pre-defined prefixes
        $1 = $1.substr(0, $1.length - 1);
        if (!($1 in Parser.prefixes)) throw new Error('Unknown prefix: ' + $1);
        $$ = resolveIRI(Parser.prefixes[$1]);
    }
    ;

blankNode:
      BLANK_NODE_LABEL	
    // | ANON	 -- not used
    ;

