/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 752:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JisonLexer = void 0;
var JisonLexer = /** @class */ (function () {
    function JisonLexer(yy) {
        if (yy === void 0) { yy = {}; }
        this.yy = yy;
        this.EOF = 1;
        this.options = {};
        this.yyleng = 0;
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
    }
    JisonLexer.prototype.parseError = function (str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        }
        else {
            throw new Error(str);
        }
    };
    // resets the lexer, sets new input
    JisonLexer.prototype.setInput = function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0, 0];
        }
        this.offset = 0;
        return this;
    };
    // consumes and returns one char from the input
    JisonLexer.prototype.input = function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        }
        else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }
        this._input = this._input.slice(1);
        return ch;
    };
    // unshifts one char (or a string) into the input
    JisonLexer.prototype.unput = function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);
        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);
        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;
        var yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                    + oldLines[oldLines.length - lines.length].length - lines[0].length :
                this.yylloc.first_column - len
        };
        this.yylloc = yylloc;
        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    };
    // When called from action, caches matched text and appends it on next action
    JisonLexer.prototype.more = function () {
        this._more = true;
        return this;
    };
    // When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
    JisonLexer.prototype.reject = function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        }
        else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
        return this;
    };
    // retain first n characters of the match
    JisonLexer.prototype.less = function (n) {
        this.unput(this.match.slice(n));
    };
    // displays already matched input, i.e. for error messages
    JisonLexer.prototype.pastInput = function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...' : '') + past.substr(-20).replace(/\n/g, "");
    };
    // displays upcoming input, i.e. for error messages
    JisonLexer.prototype.upcomingInput = function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20 - next.length);
        }
        return (next.substr(0, 20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    };
    // displays the character position where the lexing error occurred, i.e. for error messages
    JisonLexer.prototype.showPosition = function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    };
    // test the lexed token: return FALSE when not a match, otherwise return token
    JisonLexer.prototype.test_match = function (match, indexed_rule) {
        var token, lines, backup;
        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.yylloc.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = (this.yylloc.range.slice(0));
            }
        }
        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        }
        else if (this._backtrack) {
            // recover context
            for (var k in backup) { // what's the typescript-y way to copy fields across?
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    };
    // return next match in input
    JisonLexer.prototype.next = function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }
        var token, match = null, tempMatch, index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    }
                    else if (this._backtrack) {
                        match = null;
                        continue; // rule action called reject() implying a rule MISmatch.
                    }
                    else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                }
                else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        }
        else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    };
    // return next match that has a token
    JisonLexer.prototype.lex = function () {
        var r = this.next();
        if (r) {
            return r;
        }
        else {
            return this.lex();
        }
    };
    // activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
    JisonLexer.prototype.begin = function (condition) {
        this.conditionStack.push(condition);
    };
    // pop the previously active lexer condition state off the condition stack
    JisonLexer.prototype.popState = function () {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        }
        else {
            return this.conditionStack[0];
        }
    };
    // produce the lexer rule set which is active for the currently active lexer condition state
    JisonLexer.prototype._currentRules = function () {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        }
        else {
            return this.conditions["INITIAL"].rules;
        }
    };
    // return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
    JisonLexer.prototype.topState = function (n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        }
        else {
            return "INITIAL";
        }
    };
    // alias for begin(condition)
    JisonLexer.prototype.pushState = function (condition) {
        this.begin(condition);
    };
    // return the number of states currently on the stack
    JisonLexer.prototype.stateStackSize = function () {
        return this.conditionStack.length;
    };
    return JisonLexer;
}());
exports.JisonLexer = JisonLexer;
//# sourceMappingURL=lexer.js.map

/***/ }),

/***/ 41:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.o = exports.JisonParser = void 0;
var JisonParser = /** @class */ (function () {
    function JisonParser(yy, lexer) {
        if (yy === void 0) { yy = {}; }
        this.yy = yy;
        this.lexer = lexer;
    }
    JisonParser.prototype.trace = function (str) { };
    JisonParser.prototype.parseError = function (str, hash) {
        if (hash.recoverable) {
            this.trace(str);
        }
        else {
            var error = new Error(str);
            error.hash = hash;
            throw error;
        }
    };
    JisonParser.prototype.parse = function (input) {
        var self = this, stack = [0], tstack = [], // token stack
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
        var args = lstack.slice.call(arguments, 1);
        //this.reductionCount = this.shiftCount = 0;
        var lexer = Object.create(this.lexer);
        var typedYy = {};
        var sharedState = { yy: typedYy };
        // copy state
        for (var k in this.yy) {
            if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
                sharedState.yy[k] = this.yy[k];
            }
        }
        lexer.setInput(input, sharedState.yy);
        sharedState.yy.lexer = lexer;
        sharedState.yy.parser = this;
        if (typeof lexer.yylloc == 'undefined') {
            lexer.yylloc = {};
        }
        var yyloc = lexer.yylloc;
        lstack.push(yyloc);
        var ranges = lexer.options && lexer.options.ranges;
        if (typeof sharedState.yy.parseError === 'function') {
            this.parseError = sharedState.yy.parseError;
        }
        function popStack(n) {
            stack.length = stack.length - 2 * n;
            vstack.length = vstack.length - n;
            lstack.length = lstack.length - n;
        }
        var lex = function () {
            var token;
            // @ts-ignore
            token = (lexer.lex() || EOF);
            // if token isn't its numeric value, convert
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        };
        var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
        while (true) {
            // retreive state number from top of stack
            state = stack[stack.length - 1];
            // use default actions if available
            if (this.defaultActions[state]) {
                action = this.defaultActions[state];
            }
            else {
                if (symbol === null || typeof symbol == 'undefined') {
                    symbol = lex();
                }
                // read action for current state and first input
                action = table[state] && table[state][symbol];
            }
            _handle_error: 
            // handle parse error
            if (typeof action === 'undefined' || !action.length || !action[0]) {
                var error_rule_depth = null;
                var errStr = '';
                if (!recovering) {
                    // first see if there's any chance at hitting an error recovery rule:
                    error_rule_depth = locateNearestErrorRecoveryRule(state);
                    // Report error
                    expected = [];
                    for (var _p in table[state]) {
                        p = Number(_p);
                        if (this.terminals_[p] && p > TERROR) {
                            expected.push("'" + this.terminals_[p] + "'");
                        }
                    }
                    if (lexer.showPosition) {
                        errStr = 'Parse error on line ' + (yylineno + 1) + ":\n" + lexer.showPosition() + "\nExpecting " + expected.join(', ') + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                    }
                    else {
                        errStr = 'Parse error on line ' + (yylineno + 1) + ": Unexpected " +
                            (symbol == EOF ? "end of input" :
                                ("'" + (this.terminals_[symbol] || symbol) + "'"));
                    }
                    this.parseError(errStr, {
                        text: lexer.match,
                        token: this.terminals_[symbol] || symbol,
                        line: lexer.yylineno,
                        loc: lexer.yylloc,
                        expected: expected,
                        recoverable: (error_rule_depth !== null)
                    });
                }
                else if (preErrorSymbol !== EOF) {
                    error_rule_depth = locateNearestErrorRecoveryRule(state);
                }
                // just recovered from another error
                if (recovering == 3) {
                    if (symbol === EOF || preErrorSymbol === EOF) {
                        throw new Error(errStr || 'Parsing halted while starting to recover from another error.');
                    }
                    // discard current lookahead and grab another
                    yyleng = lexer.yyleng;
                    yytext = lexer.yytext;
                    yylineno = lexer.yylineno;
                    yyloc = lexer.yylloc;
                    symbol = lex();
                }
                // try to recover from error
                if (error_rule_depth === null) {
                    throw new Error(errStr || 'Parsing halted. No suitable error recovery rule available.');
                }
                popStack(error_rule_depth || 0);
                preErrorSymbol = (symbol == TERROR ? null : symbol); // save the lookahead token
                symbol = TERROR; // insert generic error symbol as new lookahead
                state = stack[stack.length - 1];
                action = table[state] && table[state][TERROR];
                recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
            }
            // this shouldn't happen, unless resolve defaults are off
            if (action[0] instanceof Array && action.length > 1) {
                throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
            }
            switch (action[0]) {
                case 1: // shift
                    //this.shiftCount++;
                    stack.push(symbol);
                    vstack.push(lexer.yytext);
                    lstack.push(lexer.yylloc);
                    stack.push(action[1]); // push state
                    symbol = null;
                    if (!preErrorSymbol) { // normal execution/no error
                        yyleng = lexer.yyleng;
                        yytext = lexer.yytext;
                        yylineno = lexer.yylineno;
                        yyloc = lexer.yylloc;
                        if (recovering > 0) {
                            recovering--;
                        }
                    }
                    else {
                        // error just occurred, resume old lookahead f/ before error
                        symbol = preErrorSymbol;
                        preErrorSymbol = null;
                    }
                    break;
                case 2:
                    // reduce
                    //this.reductionCount++;
                    len = this.productions_[action[1]][1];
                    // perform semantic action
                    yyval.$ = vstack[vstack.length - len]; // default to $$ = $1
                    // default location, uses first token for firsts, last for lasts
                    yyval._$ = {
                        first_line: lstack[lstack.length - (len || 1)].first_line,
                        last_line: lstack[lstack.length - 1].last_line,
                        first_column: lstack[lstack.length - (len || 1)].first_column,
                        last_column: lstack[lstack.length - 1].last_column
                    };
                    if (ranges) {
                        yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
                    }
                    // @ts-ignore
                    r = this.performAction.apply(yyval, [yytext, yyleng, yylineno, sharedState.yy, action[1], vstack, lstack].concat(args));
                    if (typeof r !== 'undefined') {
                        return r;
                    }
                    // pop off stack
                    if (len) {
                        stack = stack.slice(0, -1 * len * 2);
                        vstack = vstack.slice(0, -1 * len);
                        lstack = lstack.slice(0, -1 * len);
                    }
                    stack.push(this.productions_[action[1]][0]); // push nonterminal (reduce)
                    vstack.push(yyval.$);
                    lstack.push(yyval._$);
                    // goto new state = table[STATE][NONTERMINAL]
                    newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
                    stack.push(newState);
                    break;
                case 3:
                    // accept
                    return true;
            }
        }
        return true;
        // Return the rule stack depth where the nearest error rule can be found.
        // Return FALSE when no error recovery rule was found.
        function locateNearestErrorRecoveryRule(state) {
            var stack_probe = stack.length - 1;
            var depth = 0;
            // try to recover from error
            for (;;) {
                // check for error recovery rule in this state
                if ((TERROR.toString()) in table[state]) {
                    return depth;
                }
                if (state === 0 || stack_probe < 2) {
                    return null; // No suitable error recovery rule available.
                }
                stack_probe -= 2; // popStack(1): [symbol, action]
                state = stack[stack_probe];
                ++depth;
            }
        }
    };
    return JisonParser;
}());
exports.JisonParser = JisonParser;
/* Function that extends an object with the given value for all given keys
 * e.g., o([1, 3, 4], [6, 7], { x: 1, y: 2 }) = { 1: [6, 7]; 3: [6, 7], 4: [6, 7], x: 1, y: 2 }
 * This is used to docompress parser tables at module load time.
 */
function o(k, v, o) {
    var l = k.length;
    for (o = o || {}; l--; o[k[l]] = v)
        ;
    return o;
}
exports.o = o;
//# sourceMappingURL=parser.js.map

/***/ }),

/***/ 281:
/***/ ((module) => {

"use strict";


class DcTap {

  dontResolveIris = false
  prefixes = {}
  shapes = []
  curShape = null
  conjuncts = null
  headers = ["shapeID", "shapeLabel", "propertyID", "propertyLabel", "mandatory", "repeatable", "valueNodeType", "valueDataType", "valueConstraint", "valueConstraintType", "valueShape", "note"]

  constructor (opts = {}) {
    Object.assign(this, opts)
  }

  parseRows (rows, base) {
    rows.forEach((row) => {

      // Ignore headers.
      if (row[0].toLowerCase() === this.headers[0].toLowerCase()
          && row[1].toLowerCase() === this.headers[1].toLowerCase()
          && row[2].toLowerCase() === this.headers[2].toLowerCase()
          || row[0].toLowerCase() === "prefix"
          && row[1].toLowerCase() === "namespace")
        ;

      // Ignore blank lines.
      else if (row.length === 1)
        ;

      // Two columns means it's a prefix decl,
      else if (row.length === 2)
        this.prefixes[row[0]] = row[1]

      // otherwise, it's a regular row.
      else
        this.parseRow(row, base)
    })
    return this
  }

  parseRow (row, base) {

    // Interpret has object with usual keys.
    if (Array.isArray(row)) {
      row = this.headers.reduce((acc, header, idx) => {
        acc[header] = row[idx]
        return acc
      }, {})
    }

    // Ignore case on keywords.
    row.valueNodeType = row.valueNodeType.toLowerCase()
    row.valueConstraintType = row.valueConstraintType.toLowerCase()

    // If this row defines a shape,
    if (row.shapeID) {
      // set the current shape.
      this.curShape = {
        type: "Shape",
        shapeID: this.parseIri(row.shapeID, base),
        tripleConstraints: [],
      }
      this.shapes.push(this.curShape)
    } else if (!this.curShape) {
      throw new Error(`no current shape into which to add ${JSON.stringify(row)}`)
    }

    // Add TripleConstraints to current row
    this.curShape.tripleConstraints.push(this.toTripleConstraint(row, base))
    return this
  }

  toTripleConstraint (sc, base) {
    // Return minimal object which preserves semantics.
    return Object.assign(
      {
        propertyID: this.parseIri(sc.propertyID, base),
      },
      sc.mandatory ? { mandatory: true } : {},
      sc.repeatable ? { repeatable: true } : {},
      this.parseValueConstraint(sc, base),
      sc.valueShape ? { valueShape: this.parseIri(sc.valueShape, base) } : {},
    )
  }

  parseValueConstraint (sc, base) {
    switch (sc.valueConstraintType) {

    case "iristem":
    case "literalstem":
    case "picklist":
    case "languagetag":
      // These get split on whitespase and their values coersed according to the constraintType and the valueNodeType.
      const values = sc.valueConstraint.split(/\s+/)
      return {
        values: values.map(v => this.coerseValue(v, sc, base, sc.valueConstraintType.endsWith('stem')))
      }

    case "pattern":
      // Value is a regular expression (unanchored PCRE per XML Schema?)
      return {
        pattern: sc.valueConstraint
      }

    case "":
      // No constraintType means the value is a datatype.
      return sc.valueDataType
        ? { datatype: this.parseIri(sc.valueDataType, base) }
      : {} // no valueConstraint property
    default: throw Error(`Unknown valueConstraintType ${sc.valueConstraintType} in ${JSON.stringify(sc, null, 2)}?`)
    }
  }

  coerseValue (v, sc, base, isStem = false) {
    if (sc.valueConstraintType === "languagetag")
      return {
        type: "Language",
        languageTag: v
      }

    switch (sc.valueNodeType) {
    case "literal":
      const ret = isStem
        ? {
          type: "LiteralStem",
          stem: v
        }
      : {
        value: v
      }
      // if (sc.valueDataType && sc.valueDataType !== "xsd:string")
      //   ret.datatype = sc.valueDataType
      return ret
    case "iri":
      return isStem
        ? {
          type: "IriStem",
          stem: this.parseIri(v, base)
        }
      : this.parseIri(v, base)
    case "":
      return {
        value: v
      }
    default:
      throw Error(`Unknown valueNodeType ${sc.valueNodeType} in ${JSON.stringify(sc, null, 2)}?`)
    }
  }

  parseIri (lex, base) {
    // Grandfather in old form which kinda ignores IRI resolution.
    if (this.dontResolveIris)
      return lex // new URL(lex, base).href

    // Parse IRI forms according to Turtle rules.
    if (lex[0] === "<") {
      if (lex[lex.length - 1] !== ">")
        throw new Error(`Malformed URL: ${lex}`)
      return new URL(lex.substr(1, lex.length - 2), base).href
    } else {
      const at = lex.indexOf(":")
      if (at === -1)
        throw new Error(`Expected ':' in IRI ${lex}`)
      const prefix = lex.substr(0, at)
      if (!(prefix in this.prefixes))
        throw new Error(`Prefix ${prefix} not found in known prefixes: ${Object.keys(this.prefixes).join(" ,")}`)
      const lname = lex.substr(at + 1)
      return this.prefixes[prefix] + lname
    }
  }

  toJson () {
    return this.shapes
  }

  toShEx () {
    const schema = {
      type: "Schema",
      shapes: this.shapes.map(sh => ({
        type: "Shape",
        id: sh.shapeID,
        expression: maybeAnd(sh.tripleConstraints.map(tc => Object.assign(
          {
            type: "TripleConstraint",
            predicate: tc.propertyID,
          },
          tc.mandatory ? { min: 1 } : {},
          tc.repeatable ? { max: -1 } : {},
          shexValueExpr(tc),
        )), "EachOf", "expressions")
      }))
    }
    return schema
  }
}

function shexValueExpr (tc) {
  const valueExprs = []
  if (tc.values)
    valueExprs.push({
      type: "NodeConstraint",
      values: tc.values
    })
  if (tc.pattern)
    valueExprs.push({
      type: "NodeConstraint",
      pattern: tc.pattern
    })
  if (tc.datatype)
    valueExprs.push({
      type: "NodeConstraint",
      datatype: tc.datatype
    })
  if (tc.valueShape)
    valueExprs.push(tc.valueShape)
  const valueExpr = maybeAnd(valueExprs, "ShapeAnd", "shapeExprs")
  return valueExpr ? { valueExpr } : {}
}

function maybeAnd (conjuncts, type, property) {
  if (conjuncts.length === 0)
    return  undefined

  if (conjuncts.length === 1)
    return conjuncts[0]

  const ret = { type }
  ret[property] = conjuncts
  return ret
}

module.exports = { DcTap }


/***/ }),

/***/ 515:
/***/ ((module) => {

var HierarchyClosure = (function () {
  /** create a hierarchy object
   * This object keeps track of direct children and parents as well as transitive children and parents.
   */
  function makeHierarchy () {
    let roots = {}
    let parents = {}
    let children = {}
    let holders = {}
    return {
      add: function (parent, child) {
        if (// test if this is a novel entry.
          (parent in children && children[parent].indexOf(child) !== -1)) {
          return
        }
        let target = parent in holders
          ? getNode(parent)
          : (roots[parent] = getNode(parent)) // add new parents to roots.
        let value = getNode(child)

        target[child] = value
        delete roots[child]

        // // maintain hierarchy (direct and confusing)
        // children[parent] = children[parent].concat(child, children[child])
        // children[child].forEach(c => parents[c] = parents[c].concat(parent, parents[parent]))
        // parents[child] = parents[child].concat(parent, parents[parent])
        // parents[parent].forEach(p => children[p] = children[p].concat(child, children[child]))

        // maintain hierarchy (generic and confusing)
        updateClosure(children, parents, child, parent)
        updateClosure(parents, children, parent, child)
        function updateClosure (container, members, near, far) {
          container[far] = container[far].filter(
            e => /* e !== near && */ container[near].indexOf(e) === -1
          ).concat(container[near].indexOf(near) === -1 ? [near] : [], container[near])
          container[near].forEach(
            n => (members[n] = members[n].filter(
              e => e !== far && members[far].indexOf(e) === -1
            ).concat(members[far].indexOf(far) === -1 ? [far] : [], members[far]))
          )
        }

        function getNode (node) {
          if (!(node in holders)) {
            parents[node] = []
            children[node] = []
            holders[node] = {}
          }
          return holders[node]
        }
      },
      roots: roots,
      parents: parents,
      children: children
    }
  }

  function depthFirst (n, f, p) {
    return Object.keys(n).reduce((ret, k) => {
      return ret.concat(
        depthFirst(n[k], f, k),
        p ? f(k, p) : []) // outer invocation can have null parent
    }, [])
  }

  return { create: makeHierarchy, depthFirst }
})()

/* istanbul ignore next */
if (true) {
  module.exports = HierarchyClosure
}


/***/ }),

/***/ 808:
/***/ ((module) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (Array.isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};


/***/ }),

/***/ 368:
/***/ ((module) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return Object.keys(obj).map(function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (Array.isArray(obj[k])) {
        return obj[k].map(function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};


/***/ }),

/***/ 642:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


exports.decode = exports.parse = __webpack_require__(808);
exports.encode = exports.stringify = __webpack_require__(368);


/***/ }),

/***/ 362:
/***/ ((module) => {

"use strict";


module.exports =
{
	// Output
	ABSOLUTE:      "absolute",
	PATH_RELATIVE: "pathRelative",
	ROOT_RELATIVE: "rootRelative",
	SHORTEST:      "shortest"
};


/***/ }),

/***/ 779:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var constants = __webpack_require__(362);



function formatAuth(urlObj, options)
{
	if (urlObj.auth && !options.removeAuth && (urlObj.extra.relation.maximumHost || options.output===constants.ABSOLUTE))
	{
		return urlObj.auth + "@";
	}
	
	return "";
}



function formatHash(urlObj, options)
{
	return urlObj.hash ? urlObj.hash : "";
}



function formatHost(urlObj, options)
{
	if (urlObj.host.full && (urlObj.extra.relation.maximumAuth || options.output===constants.ABSOLUTE))
	{
		return urlObj.host.full;
	}
	
	return "";
}



function formatPath(urlObj, options)
{
	var str = "";
	
	var absolutePath = urlObj.path.absolute.string;
	var relativePath = urlObj.path.relative.string;
	var resource = showResource(urlObj, options);
	
	if (urlObj.extra.relation.maximumHost || options.output===constants.ABSOLUTE || options.output===constants.ROOT_RELATIVE)
	{
		str = absolutePath;
	}
	else if (relativePath.length<=absolutePath.length && options.output===constants.SHORTEST || options.output===constants.PATH_RELATIVE)
	{
		str = relativePath;
		
		if (str === "")
		{
			var query = showQuery(urlObj,options) && !!getQuery(urlObj,options);
			
			if (urlObj.extra.relation.maximumPath && !resource)
			{
				str = "./";
			}
			else if (urlObj.extra.relation.overridesQuery && !resource && !query)
			{
				str = "./";
			}
		}
	}
	else
	{
		str = absolutePath;
	}
	
	if ( str==="/" && !resource && options.removeRootTrailingSlash && (!urlObj.extra.relation.minimumPort || options.output===constants.ABSOLUTE) )
	{
		str = "";
	}
	
	return str;
}



function formatPort(urlObj, options)
{
	if (urlObj.port && !urlObj.extra.portIsDefault && urlObj.extra.relation.maximumHost)
	{
		return ":" + urlObj.port;
	}
	
	return "";
}



function formatQuery(urlObj, options)
{
	return showQuery(urlObj,options) ? getQuery(urlObj, options) : "";
}



function formatResource(urlObj, options)
{
	return showResource(urlObj,options) ? urlObj.resource : "";
}



function formatScheme(urlObj, options)
{
	var str = "";
	
	if (urlObj.extra.relation.maximumHost || options.output===constants.ABSOLUTE)
	{
		if (!urlObj.extra.relation.minimumScheme || !options.schemeRelative || options.output===constants.ABSOLUTE)
		{
			str += urlObj.scheme + "://";
		}
		else
		{
			str += "//";
		}
	}
	
	return str;
}



function formatUrl(urlObj, options)
{
	var url = "";
	
	url += formatScheme(urlObj, options);
	url += formatAuth(urlObj, options);
	url += formatHost(urlObj, options);
	url += formatPort(urlObj, options);
	url += formatPath(urlObj, options);
	url += formatResource(urlObj, options);
	url += formatQuery(urlObj, options);
	url += formatHash(urlObj, options);
	
	return url;
}



function getQuery(urlObj, options)
{
	var stripQuery = options.removeEmptyQueries && urlObj.extra.relation.minimumPort;
	
	return urlObj.query.string[ stripQuery ? "stripped" : "full" ];
}



function showQuery(urlObj, options)
{
	return !urlObj.extra.relation.minimumQuery || options.output===constants.ABSOLUTE || options.output===constants.ROOT_RELATIVE;
}



function showResource(urlObj, options)
{
	var removeIndex = options.removeDirectoryIndexes && urlObj.extra.resourceIsIndex;
	var removeMatchingResource = urlObj.extra.relation.minimumResource && options.output!==constants.ABSOLUTE && options.output!==constants.ROOT_RELATIVE;
	
	return !!urlObj.resource && !removeMatchingResource && !removeIndex;
}



module.exports = formatUrl;


/***/ }),

/***/ 755:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var constants  = __webpack_require__(362);
var formatUrl  = __webpack_require__(779);
var getOptions = __webpack_require__(141);
var objUtils   = __webpack_require__(609);
var parseUrl   = __webpack_require__(398);
var relateUrl  = __webpack_require__(258);



function RelateUrl(from, options)
{
	this.options = getOptions(options,
	{
		defaultPorts: {ftp:21, http:80, https:443},
		directoryIndexes: ["index.html"],
		ignore_www: false,
		output: RelateUrl.SHORTEST,
		rejectedSchemes: ["data","javascript","mailto"],
		removeAuth: false,
		removeDirectoryIndexes: true,
		removeEmptyQueries: false,
		removeRootTrailingSlash: true,
		schemeRelative: true,
		site: undefined,
		slashesDenoteHost: true
	});
	
	this.from = parseUrl.from(from, this.options, null);
}



/*
	Usage: instance=new RelateUrl(); instance.relate();
*/
RelateUrl.prototype.relate = function(from, to, options)
{
	// relate(to,options)
	if ( objUtils.isPlainObject(to) )
	{
		options = to;
		to = from;
		from = null;
	}
	// relate(to)
	else if (!to)
	{
		to = from;
		from = null;
	}
	
	options = getOptions(options, this.options);
	from = from || options.site;
	from = parseUrl.from(from, options, this.from);
	
	if (!from || !from.href)
	{
		throw new Error("from value not defined.");
	}
	else if (from.extra.hrefInfo.minimumPathOnly)
	{
		throw new Error("from value supplied is not absolute: "+from.href);
	}
	
	to = parseUrl.to(to, options);
	
	if (to.valid===false) return to.href;
	
	to = relateUrl(from, to, options);
	to = formatUrl(to, options);
	
	return to;
}



/*
	Usage: RelateUrl.relate();
*/
RelateUrl.relate = function(from, to, options)
{
	return new RelateUrl().relate(from, to, options);
}



// Make constants accessible from API
objUtils.shallowMerge(RelateUrl, constants);



module.exports = RelateUrl;


/***/ }),

/***/ 141:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var objUtils = __webpack_require__(609);



function getOptions(options, defaults)
{
	if ( objUtils.isPlainObject(options) )
	{
		var newOptions = {};
		
		for (var i in defaults)
		{
			if ( defaults.hasOwnProperty(i) )
			{
				if (options[i] !== undefined)
				{
					newOptions[i] = mergeOption(options[i], defaults[i]);
				}
				else
				{
					newOptions[i] = defaults[i];
				}
			}
		}
		
		return newOptions;
	}
	else
	{
		return defaults;
	}
}



function mergeOption(newValues, defaultValues)
{
	if (defaultValues instanceof Object && newValues instanceof Object)
	{
		if (defaultValues instanceof Array && newValues instanceof Array)
		{
			return defaultValues.concat(newValues);
		}
		else
		{
			return objUtils.shallowMerge(newValues, defaultValues);
		}
	}
	
	return newValues;
}



module.exports = getOptions;


/***/ }),

/***/ 420:
/***/ ((module) => {

"use strict";


function parseHost(urlObj, options)
{
	// TWEAK :: condition only for speed optimization
	if (options.ignore_www)
	{
		var host = urlObj.host.full;
		
		if (host)
		{
			var stripped = host;
			
			if (host.indexOf("www.") === 0)
			{
				stripped = host.substr(4);
			}
			
			urlObj.host.stripped = stripped;
		}
	}
}



module.exports = parseHost;


/***/ }),

/***/ 849:
/***/ ((module) => {

"use strict";


function hrefInfo(urlObj)
{
	var minimumPathOnly     = (!urlObj.scheme && !urlObj.auth && !urlObj.host.full && !urlObj.port);
	var minimumResourceOnly = (minimumPathOnly && !urlObj.path.absolute.string);
	var minimumQueryOnly    = (minimumResourceOnly && !urlObj.resource);
	var minimumHashOnly     = (minimumQueryOnly && !urlObj.query.string.full.length);
	var empty               = (minimumHashOnly && !urlObj.hash);
	
	urlObj.extra.hrefInfo.minimumPathOnly     = minimumPathOnly;
	urlObj.extra.hrefInfo.minimumResourceOnly = minimumResourceOnly;
	urlObj.extra.hrefInfo.minimumQueryOnly    = minimumQueryOnly;
	urlObj.extra.hrefInfo.minimumHashOnly     = minimumHashOnly;
	urlObj.extra.hrefInfo.empty = empty;
}



module.exports = hrefInfo;


/***/ }),

/***/ 398:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var hrefInfo   = __webpack_require__(849);
var parseHost  = __webpack_require__(420);
var parsePath  = __webpack_require__(965);
var parsePort  = __webpack_require__(22);
var parseQuery = __webpack_require__(150);
var parseUrlString = __webpack_require__(936);
var pathUtils      = __webpack_require__(831);



function parseFromUrl(url, options, fallback)
{
	if (url)
	{
		var urlObj = parseUrl(url, options);
		
		// Because the following occurs in the relate stage for "to" URLs,
		// such had to be mostly duplicated here
		
		var pathArray = pathUtils.resolveDotSegments(urlObj.path.absolute.array);
		
		urlObj.path.absolute.array  = pathArray;
		urlObj.path.absolute.string = "/" + pathUtils.join(pathArray);
		
		return urlObj;
	}
	else
	{
		return fallback;
	}
}



function parseUrl(url, options)
{
	var urlObj = parseUrlString(url, options);
	
	if (urlObj.valid===false) return urlObj;
	
	parseHost(urlObj, options);
	parsePort(urlObj, options);
	parsePath(urlObj, options);
	parseQuery(urlObj, options);
	hrefInfo(urlObj);
	
	return urlObj;
}



module.exports =
{
	from: parseFromUrl,
	to:   parseUrl
};


/***/ }),

/***/ 965:
/***/ ((module) => {

"use strict";


function isDirectoryIndex(resource, options)
{
	var verdict = false;
	
	options.directoryIndexes.every( function(index)
	{
		if (index === resource)
		{
			verdict = true;
			return false;
		}
		
		return true;
	});
	
	return verdict;
}



function parsePath(urlObj, options)
{
	var path = urlObj.path.absolute.string;
	
	if (path)
	{
		var lastSlash = path.lastIndexOf("/");
		
		if (lastSlash > -1)
		{
			if (++lastSlash < path.length)
			{
				var resource = path.substr(lastSlash);
				
				if (resource!=="." && resource!=="..")
				{
					urlObj.resource = resource;
					path = path.substr(0, lastSlash);
				}
				else
				{
					path += "/";
				}
			}
			
			urlObj.path.absolute.string = path;
			urlObj.path.absolute.array = splitPath(path);
		}
		else if (path==="." || path==="..")
		{
			// "..?var", "..#anchor", etc ... not "..index.html"
			path += "/";
			
			urlObj.path.absolute.string = path;
			urlObj.path.absolute.array = splitPath(path);
		}
		else
		{
			// Resource-only
			urlObj.resource = path;
			urlObj.path.absolute.string = null;
		}
		
		urlObj.extra.resourceIsIndex = isDirectoryIndex(urlObj.resource, options);
	}
	// Else: query/hash-only or empty
}



function splitPath(path)
{
	// TWEAK :: condition only for speed optimization
	if (path !== "/")
	{
		var cleaned = [];
		
		path.split("/").forEach( function(dir)
		{
			// Cleanup -- splitting "/dir/" becomes ["","dir",""]
			if (dir !== "")
			{
				cleaned.push(dir);
			}
		});
		
		return cleaned;
	}
	else
	{
		// Faster to skip the above block and just create an array
		return [];
	}
}



module.exports = parsePath;


/***/ }),

/***/ 22:
/***/ ((module) => {

"use strict";


function parsePort(urlObj, options)
{
	var defaultPort = -1;
	
	for (var i in options.defaultPorts)
	{
		if ( i===urlObj.scheme && options.defaultPorts.hasOwnProperty(i) )
		{
			defaultPort = options.defaultPorts[i];
			break;
		}
	}
	
	if (defaultPort > -1)
	{
		// Force same type as urlObj.port
		defaultPort = defaultPort.toString();
		
		if (urlObj.port === null)
		{
			urlObj.port = defaultPort;
		}
		
		urlObj.extra.portIsDefault = (urlObj.port === defaultPort);
	}
}



module.exports = parsePort;


/***/ }),

/***/ 150:
/***/ ((module) => {

"use strict";

var hasOwnProperty = Object.prototype.hasOwnProperty;



function parseQuery(urlObj, options)
{
	urlObj.query.string.full = stringify(urlObj.query.object, false);
	
	// TWEAK :: condition only for speed optimization
	if (options.removeEmptyQueries)
	{
		urlObj.query.string.stripped = stringify(urlObj.query.object, true);
	}
}



function stringify(queryObj, removeEmptyQueries)
{
	var count = 0;
	var str = "";
	
	for (var i in queryObj)
	{
		if ( i!=="" && hasOwnProperty.call(queryObj, i)===true )
		{
			var value = queryObj[i];
			
			if (value !== "" || !removeEmptyQueries)
			{
				str += (++count===1) ? "?" : "&";
				
				i = encodeURIComponent(i);
				
				if (value !== "")
				{
					str += i +"="+ encodeURIComponent(value).replace(/%20/g,"+");
				}
				else
				{
					str += i;
				}
			}
		}
	}
	
	return str;
}



module.exports = parseQuery;


/***/ }),

/***/ 936:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var _parseUrl = (__webpack_require__(883)/* .parse */ .Qc);



/*
	Customize the URL object that Node generates
	because:
	
	* necessary data for later
	* urlObj.host is useless
	* urlObj.hostname is too long
	* urlObj.path is useless
	* urlObj.pathname is too long
	* urlObj.protocol is inaccurate; should be called "scheme"
	* urlObj.search is mostly useless
*/
function clean(urlObj)
{
	var scheme = urlObj.protocol;
	
	if (scheme)
	{
		// Remove ":" suffix
		if (scheme.indexOf(":") === scheme.length-1)
		{
			scheme = scheme.substr(0, scheme.length-1);
		}
	}
	
	urlObj.host =
	{
		// TODO :: unescape(encodeURIComponent(s)) ? ... http://ecmanaut.blogspot.ca/2006/07/encoding-decoding-utf8-in-javascript.html
		full: urlObj.hostname,
		stripped: null
	};
	
	urlObj.path =
	{
		absolute:
		{
			array: null,
			string: urlObj.pathname
		},
		relative:
		{
			array: null,
			string: null
		}
	};
	
	urlObj.query =
	{
		object: urlObj.query,
		string:
		{
			full: null,
			stripped: null
		}
	};
	
	urlObj.extra =
	{
		hrefInfo:
		{
			minimumPathOnly: null,
			minimumResourceOnly: null,
			minimumQueryOnly: null,
			minimumHashOnly: null,
			empty: null,
			
			separatorOnlyQuery: urlObj.search==="?"
		},
		portIsDefault: null,
		relation:
		{
			maximumScheme: null,
			maximumAuth: null,
			maximumHost: null,
			maximumPort: null,
			maximumPath: null,
			maximumResource: null,
			maximumQuery: null,
			maximumHash: null,
			
			minimumScheme: null,
			minimumAuth: null,
			minimumHost: null,
			minimumPort: null,
			minimumPath: null,
			minimumResource: null,
			minimumQuery: null,
			minimumHash: null,
			
			overridesQuery: null
		},
		resourceIsIndex: null,
		slashes: urlObj.slashes
	};
	
	urlObj.resource = null;
	urlObj.scheme = scheme;
	delete urlObj.hostname;
	delete urlObj.pathname;
	delete urlObj.protocol;
	delete urlObj.search;
	delete urlObj.slashes;
	
	return urlObj;
}



function validScheme(url, options)
{
	var valid = true;
	
	options.rejectedSchemes.every( function(rejectedScheme)
	{
		valid = !(url.indexOf(rejectedScheme+":") === 0);
		
		// Break loop
		return valid;
	});
	
	return valid;
}



function parseUrlString(url, options)
{
	if ( validScheme(url,options) )
	{
		return clean( _parseUrl(url, true, options.slashesDenoteHost) );
	}
	else
	{
		return {href:url, valid:false};
	}
}



module.exports = parseUrlString;


/***/ }),

/***/ 799:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var findRelation = __webpack_require__(19);
var objUtils     = __webpack_require__(609);
var pathUtils    = __webpack_require__(831);



function absolutize(urlObj, siteUrlObj, options)
{
	findRelation.upToPath(urlObj, siteUrlObj, options);
	
	// Fill in relative URLs
	if (urlObj.extra.relation.minimumScheme) urlObj.scheme = siteUrlObj.scheme;
	if (urlObj.extra.relation.minimumAuth)   urlObj.auth   = siteUrlObj.auth;
	if (urlObj.extra.relation.minimumHost)   urlObj.host   = objUtils.clone(siteUrlObj.host);
	if (urlObj.extra.relation.minimumPort)   copyPort(urlObj, siteUrlObj);
	if (urlObj.extra.relation.minimumScheme) copyPath(urlObj, siteUrlObj);
	
	// Check remaining relativeness now that path has been copied and/or resolved
	findRelation.pathOn(urlObj, siteUrlObj, options);
	
	// Fill in relative URLs
	if (urlObj.extra.relation.minimumResource) copyResource(urlObj, siteUrlObj);
	if (urlObj.extra.relation.minimumQuery)    urlObj.query = objUtils.clone(siteUrlObj.query);
	if (urlObj.extra.relation.minimumHash)     urlObj.hash  = siteUrlObj.hash;
}



/*
	Get an absolute path that's relative to site url.
*/
function copyPath(urlObj, siteUrlObj)
{
	if (urlObj.extra.relation.maximumHost || !urlObj.extra.hrefInfo.minimumResourceOnly)
	{
		var pathArray = urlObj.path.absolute.array;
		var pathString = "/";
		
		// If not erroneous URL
		if (pathArray)
		{
			// If is relative path
			if (urlObj.extra.hrefInfo.minimumPathOnly && urlObj.path.absolute.string.indexOf("/")!==0)
			{
				// Append path to site path
				pathArray = siteUrlObj.path.absolute.array.concat(pathArray);
			}
			
			pathArray   = pathUtils.resolveDotSegments(pathArray);
			pathString += pathUtils.join(pathArray);
		}
		else
		{
			pathArray = [];
		}
		
		urlObj.path.absolute.array  = pathArray;
		urlObj.path.absolute.string = pathString;
	}
	else
	{
		// Resource-, query- or hash-only or empty
		urlObj.path = objUtils.clone(siteUrlObj.path);
	}
}



function copyPort(urlObj, siteUrlObj)
{
	urlObj.port = siteUrlObj.port;
	
	urlObj.extra.portIsDefault = siteUrlObj.extra.portIsDefault;
}



function copyResource(urlObj, siteUrlObj)
{
	urlObj.resource = siteUrlObj.resource;
	
	urlObj.extra.resourceIsIndex = siteUrlObj.extra.resourceIsIndex;
}



module.exports = absolutize;


/***/ }),

/***/ 19:
/***/ ((module) => {

"use strict";


function findRelation_upToPath(urlObj, siteUrlObj, options)
{
	// Path- or root-relative URL
	var pathOnly = urlObj.extra.hrefInfo.minimumPathOnly;
	
	// Matching scheme, scheme-relative or path-only
	var minimumScheme = (urlObj.scheme===siteUrlObj.scheme || !urlObj.scheme);
	
	// Matching auth, ignoring auth or path-only
	var minimumAuth = minimumScheme && (urlObj.auth===siteUrlObj.auth || options.removeAuth || pathOnly);
	
	// Matching host or path-only
	var www = options.ignore_www ? "stripped" : "full";
	var minimumHost = minimumAuth && (urlObj.host[www]===siteUrlObj.host[www] || pathOnly);
	
	// Matching port or path-only
	var minimumPort = minimumHost && (urlObj.port===siteUrlObj.port || pathOnly);
	
	urlObj.extra.relation.minimumScheme = minimumScheme;
	urlObj.extra.relation.minimumAuth   = minimumAuth;
	urlObj.extra.relation.minimumHost   = minimumHost;
	urlObj.extra.relation.minimumPort   = minimumPort;
	
	urlObj.extra.relation.maximumScheme = !minimumScheme || minimumScheme && !minimumAuth;
	urlObj.extra.relation.maximumAuth   = !minimumScheme || minimumScheme && !minimumHost;
	urlObj.extra.relation.maximumHost   = !minimumScheme || minimumScheme && !minimumPort;
}



function findRelation_pathOn(urlObj, siteUrlObj, options)
{
	var queryOnly = urlObj.extra.hrefInfo.minimumQueryOnly;
	var hashOnly  = urlObj.extra.hrefInfo.minimumHashOnly;
	var empty     = urlObj.extra.hrefInfo.empty;	// not required, but self-documenting
	
	// From upToPath()
	var minimumPort   = urlObj.extra.relation.minimumPort;
	var minimumScheme = urlObj.extra.relation.minimumScheme;
	
	// Matching port and path
	var minimumPath = minimumPort && urlObj.path.absolute.string===siteUrlObj.path.absolute.string;
	
	// Matching resource or query/hash-only or empty
	var matchingResource = (urlObj.resource===siteUrlObj.resource || !urlObj.resource && siteUrlObj.extra.resourceIsIndex) || (options.removeDirectoryIndexes && urlObj.extra.resourceIsIndex && !siteUrlObj.resource);
	var minimumResource = minimumPath && (matchingResource || queryOnly || hashOnly || empty);
	
	// Matching query or hash-only/empty
	var query = options.removeEmptyQueries ? "stripped" : "full";
	var urlQuery = urlObj.query.string[query];
	var siteUrlQuery = siteUrlObj.query.string[query];
	var minimumQuery = (minimumResource && !!urlQuery && urlQuery===siteUrlQuery) || ((hashOnly || empty) && !urlObj.extra.hrefInfo.separatorOnlyQuery);
	
	var minimumHash = minimumQuery && urlObj.hash===siteUrlObj.hash;
	
	urlObj.extra.relation.minimumPath     = minimumPath;
	urlObj.extra.relation.minimumResource = minimumResource;
	urlObj.extra.relation.minimumQuery    = minimumQuery;
	urlObj.extra.relation.minimumHash     = minimumHash;
	
	urlObj.extra.relation.maximumPort     = !minimumScheme || minimumScheme && !minimumPath;
	urlObj.extra.relation.maximumPath     = !minimumScheme || minimumScheme && !minimumResource;
	urlObj.extra.relation.maximumResource = !minimumScheme || minimumScheme && !minimumQuery;
	urlObj.extra.relation.maximumQuery    = !minimumScheme || minimumScheme && !minimumHash;
	urlObj.extra.relation.maximumHash     = !minimumScheme || minimumScheme && !minimumHash;	// there's nothing after hash, so it's the same as maximumQuery
	
	// Matching path and/or resource with existing but non-matching site query
	urlObj.extra.relation.overridesQuery  = minimumPath && urlObj.extra.relation.maximumResource && !minimumQuery && !!siteUrlQuery;
}



module.exports =
{
	pathOn:   findRelation_pathOn,
	upToPath: findRelation_upToPath
};


/***/ }),

/***/ 258:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var absolutize = __webpack_require__(799);
var relativize = __webpack_require__(255);



function relateUrl(siteUrlObj, urlObj, options)
{
	absolutize(urlObj, siteUrlObj, options);
	relativize(urlObj, siteUrlObj, options);
	
	return urlObj;
}



module.exports = relateUrl;


/***/ }),

/***/ 255:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var pathUtils = __webpack_require__(831);



/*
	Get a path relative to the site path.
*/
function relatePath(absolutePath, siteAbsolutePath)
{
	var relativePath = [];
	
	// At this point, it's related to the host/port
	var related = true;
	var parentIndex = -1;
	
	// Find parents
	siteAbsolutePath.forEach( function(siteAbsoluteDir, i)
	{
		if (related)
		{
			if (absolutePath[i] !== siteAbsoluteDir)
			{
				related = false;
			}
			else
			{
				parentIndex = i;
			}
		}
		
		if (!related)
		{
			// Up one level
			relativePath.push("..");
		}
	});
	
	// Form path
	absolutePath.forEach( function(dir, i)
	{
		if (i > parentIndex)
		{
			relativePath.push(dir);
		}
	});
	
	return relativePath;
}



function relativize(urlObj, siteUrlObj, options)
{
	if (urlObj.extra.relation.minimumScheme)
	{
		var pathArray = relatePath(urlObj.path.absolute.array, siteUrlObj.path.absolute.array);
		
		urlObj.path.relative.array  = pathArray;
		urlObj.path.relative.string = pathUtils.join(pathArray);
	}
}



module.exports = relativize;


/***/ }),

/***/ 609:
/***/ ((module) => {

"use strict";


/*
	Deep-clone an object.
*/
function clone(obj)
{
	if (obj instanceof Object)
	{
		var clonedObj = (obj instanceof Array) ? [] : {};
		
		for (var i in obj)
		{
			if ( obj.hasOwnProperty(i) )
			{
				clonedObj[i] = clone( obj[i] );
			}
		}
		
		return clonedObj;
	}
	
	return obj;
}



/*
	https://github.com/jonschlinkert/is-plain-object
*/
function isPlainObject(obj)
{
	return !!obj && typeof obj==="object" && obj.constructor===Object;
}



/*
	Shallow-merge two objects.
*/
function shallowMerge(target, source)
{
	if (target instanceof Object && source instanceof Object)
	{
		for (var i in source)
		{
			if ( source.hasOwnProperty(i) )
			{
				target[i] = source[i];
			}
		}
	}
	
	return target;
}



module.exports =
{
	clone: clone,
	isPlainObject: isPlainObject,
	shallowMerge: shallowMerge
};


/***/ }),

/***/ 831:
/***/ ((module) => {

"use strict";


function joinPath(pathArray)
{
	if (pathArray.length > 0)
	{
		return pathArray.join("/") + "/";
	}
	else
	{
		return "";
	}
}



function resolveDotSegments(pathArray)
{
	var pathAbsolute = [];
	
	pathArray.forEach( function(dir)
	{
		if (dir !== "..")
		{
			if (dir !== ".")
			{
				pathAbsolute.push(dir);
			}
		}
		else
		{
			// Remove parent
			if (pathAbsolute.length > 0)
			{
				pathAbsolute.splice(pathAbsolute.length-1, 1);
			}
		}
	});
	
	return pathAbsolute;
}



module.exports =
{
	join: joinPath,
	resolveDotSegments: resolveDotSegments
};


/***/ }),

/***/ 639:
/***/ (function(module, exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
var __WEBPACK_AMD_DEFINE_RESULT__;/*! https://mths.be/punycode v1.3.2 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports =  true && exports &&
		!exports.nodeType && exports;
	var freeModule =  true && module &&
		!module.nodeType && module;
	var freeGlobal = typeof __webpack_require__.g == 'object' && __webpack_require__.g;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.3.2',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		true
	) {
		!(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
			return punycode;
		}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}

}(this));


/***/ }),

/***/ 883:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
var __webpack_unused_export__;
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var punycode = __webpack_require__(639);
var util = __webpack_require__(225);

exports.Qc = urlParse;
__webpack_unused_export__ = urlResolve;
__webpack_unused_export__ = urlResolveObject;
__webpack_unused_export__ = urlFormat;

__webpack_unused_export__ = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = __webpack_require__(642);

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};


/***/ }),

/***/ 225:
/***/ ((module) => {

"use strict";


module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};


/***/ }),

/***/ 540:
/***/ ((module, exports, __webpack_require__) => {

const EvalSimple1ErrCjsModule = (function () {
  const ShExTerm = __webpack_require__(118);

  const Split = "<span class='keyword' title='Split'>|</span>";
  const Rept  = "<span class='keyword' title='Repeat'>×</span>";
  const Match = "<span class='keyword' title='Match'>␃</span>";
  /* compileNFA - compile regular expression and index triple constraints
   */
  const UNBOUNDED = -1;

  function compileNFA (schema, shape, index) {
    const expression = shape.expression;
    return NFA();

    function NFA () {
      // wrapper for states, startNo and matchstate
      const states = [];
      const matchstate = State_make(Match, []);
      let startNo = matchstate;
      const stack = [];
      let pair;
      if (expression) {
        const pair = walkExpr(expression, []);
        patch(pair.tail, matchstate);
        startNo = pair.start;
      }
      const ret = {
        algorithm: "rbenx",
        end: matchstate,
        states: states,
        start: startNo,
        match: rbenx_match
      }
      // matchstate = states = startNo = null;
      return ret;

      function walkExpr (expr, stack) {
        let s, starts;
        let lastTail;
        function maybeAddRept (start, tail) {
          if ((expr.min == undefined || expr.min === 1) &&
              (expr.max == undefined || expr.max === 1))
            return {start: start, tail: tail}
          s = State_make(Rept, [start]);
          states[s].expr = expr;
          // cache min/max in normalized form for simplicity of comparison.
          states[s].min = "min" in expr ? expr.min : 1;
          states[s].max = "max" in expr ? expr.max === UNBOUNDED ? Infinity : expr.max : 1;
          patch(tail, s);
          return {start: s, tail: [s]}
        }

        if (typeof expr === "string") { // Inclusion
          const included = index.tripleExprs[expr];
          return walkExpr(included, stack);
        }

        else if (expr.type === "TripleConstraint") {
          s = State_make(expr, []);
          states[s].stack = stack;
          return {start: s, tail: [s]};
        }

        else if (expr.type === "OneOf") {
          lastTail = [];
          starts = [];
          expr.expressions.forEach(function (nested, ord) {
            pair = walkExpr(nested, stack.concat({c:expr, e:ord}));
            starts.push(pair.start);
            lastTail = lastTail.concat(pair.tail);
          });
          s = State_make(Split, starts);
          states[s].expr = expr;
          return maybeAddRept(s, lastTail);
        }

        else if (expr.type === "EachOf") {
          expr.expressions.forEach(function (nested, ord) {
            pair = walkExpr(nested, stack.concat({c:expr, e:ord}));
            if (ord === 0)
              s = pair.start;
            else
              patch(lastTail, pair.start);
            lastTail = pair.tail;
          });
          return maybeAddRept(s, lastTail);
        }

        throw Error("unexpected expr type: " + expr.type);
      };

      function State_make (c, outs, negated) {
        const ret = states.length;
        states.push({c:c, outs:outs});
        if (negated)
          states[ret].negated = true; // only include if true for brevity
        return ret;
      }

      function patch (l, target) {
        l.forEach(elt => {
          states[elt].outs.push(target);
        });
      }
    }


    function nfaToString () {
      const known = {OneOf: [], EachOf: []};
      function dumpTripleConstraint (tc) {
        return "<" + tc.predicate + ">";
      }
      function card (obj) {
        const x = "";
        if ("min" in obj) x += obj.min;
        if ("max" in obj) x += "," + obj.max;
        return x ? "{" + x + "}" : "";
      }
      function junct (j) {
        const id = known[j.type].indexOf(j);
        if (id === -1)
          id = known[j.type].push(j)-1;
        return j.type + id; // + card(j);
      }
      function dumpStackElt (elt) {
        return junct(elt.c) + "." + elt.e + ("i" in elt ? "[" + elt.i + "]" : "");
      }
      function dumpStack (stack) {
        return stack.map(elt => { return dumpStackElt(elt); }).join("/");
      }
      function dumpNFA (states, startNo) {
        return states.map((s, i) => {
          return (i === startNo ? s.c === Match ? "." : "S" : s.c === Match ? "E" : " ") + i + " " + (
            s.c === Split ? ("Split-" + junct(s.expr)) :
              s.c === Rept ? ("Rept-" + junct(s.expr)) :
              s.c === Match ? "Match" :
              dumpTripleConstraint(s.c)
          ) + card(s) + "→" + s.outs.join(" | ") + ("stack" in s ? dumpStack(s.stack) : "");
        }).join("\n");
      }
      function dumpMatched (matched) {
        return matched.map(m => {
          return dumpTripleConstraint(m.c) + "[" + m.triples.join(",") + "]" + dumpStack(m.stack);
        }).join(",");
      }
      function dumpThread (thread) {
        return "S" + thread.state + ":" + Object.keys(thread.repeats).map(k => {
          return k + "×" + thread.repeats[k];
        }).join(",") + " " + dumpMatched(thread.matched);
      }
      function dumpThreadList (list) {
        return "[[" + list.map(thread => { return dumpThread(thread); }).join("\n  ") + "]]";
      }
      return {
        nfa: dumpNFA,
        stack: dumpStack,
        stackElt: dumpStackElt,
        thread: dumpThread,
        threadList: dumpThreadList
      };
    }

    function rbenx_match (graph, node, constraintList, constraintToTripleMapping, tripleToConstraintMapping, neighborhood, semActHandler, trace) {
      const rbenx = this;
      let clist = [], nlist = []; // list of {state:state number, repeats:stateNo->repetitionCount}

      if (rbenx.states.length === 1)
        return matchedToResult([], constraintList, constraintToTripleMapping, neighborhood, semActHandler);

      let chosen = null;
      // const dump = nfaToString();
      // console.log(dump.nfa(this.states, this.start));
      addstate(rbenx, clist, this.start, {repeats:{}, avail:[], matched:[], stack:[], errors:[]});
      while (clist.length) {
        nlist = [];
        if (trace)
          trace.push({threads:[]});
        for (let threadno = 0; threadno < clist.length; ++threadno) {
          const thread = clist[threadno];
          if (thread.state === rbenx.end)
            continue;
          const state = rbenx.states[thread.state];
          const nlistlen = nlist.length;
          // may be Accept!
          if (state.c.type === "TripleConstraint") {
            const constraintNo = constraintList.indexOf(state.c);
            const min = "min" in state.c ? state.c.min : 1;
            const max = "max" in state.c ? state.c.max === UNBOUNDED ? Infinity : state.c.max : 1;
            if ("negated" in state.c && state.c.negated)
              min = max = 0;
            if (thread.avail[constraintNo] === undefined)
              thread.avail[constraintNo] = constraintToTripleMapping[constraintNo].map(pair => pair.tNo);
            const taken = thread.avail[constraintNo].splice(0, max);
            if (taken.length >= min) {
              do {
                addStates(rbenx, nlist, thread, taken);
              } while ((function () {
                if (thread.avail[constraintNo].length > 0 && taken.length < max) {
                  taken.push(thread.avail[constraintNo].shift());
                  return true; // stay in look to take more.
                } else {
                  return false; // no more to take or we're already at max
                }
              })());
            }
          }
          if (trace)
            trace[trace.length-1].threads.push({
              state: clist[threadno].state,
              to:nlist.slice(nlistlen).map(x => {
                return stateString(x.state, x.repeats);
              })
            });
        }
        // console.log(dump.threadList(nlist));
        if (nlist.length === 0 && chosen === null)
          return reportError(localExpect(clist, rbenx.states));
        const t = clist;
        clist = nlist;
        nlist = t;
        const longerChosen = clist.reduce((ret, elt) => {
          const matchedAll =
              elt.matched.reduce((ret, m) => {
                return ret + m.triples.length; // count matched triples
              }, 0) === tripleToConstraintMapping.reduce((ret, t) => {
                return t === "NO_TRIPLE_CONSTRAINT" ? ret : ret + 1; // count expected
              }, 0);
          return ret !== null ? ret : (elt.state === rbenx.end && matchedAll) ? elt : null;
        }, null)
        if (longerChosen)
          chosen = longerChosen;
        // if (longerChosen !== null)
        //   console.log(JSON.stringify(matchedToResult(longerChosen.matched)));
      }
      if (chosen === null)
        return reportError();
      function reportError () { return {
        type: "Failure",
        node: node,
        errors: localExpect(clist, rbenx.states)
      } }
      function localExpect (clist, states) {
        const lastState = states[states.length - 1];
        return clist.reduce((acc, elt) => {
          const c = rbenx.states[elt.state].c;
          // if (c === Match)
          //   return { type: "EndState999" };
          let valueExpr = null;
          if (typeof c.valueExpr === "string") { // ShapeRef
            valueExpr = c.valueExpr;
            if (ShExTerm.isBlank(valueExpr))
              valueExpr = schema.shapes[valueExpr];
          } else if (c.valueExpr) {
            valueExpr = extend({}, c.valueExpr)
          }
          if (elt.state !== rbenx.end) {
            return acc.concat([extend({
              type: "MissingProperty",
              property: lastState.c.predicate,
            }, valueExpr ? { valueExpr: valueExpr } : {})])
          } else {
            const unmatchedTriples = {};
            // Collect triples assigned to some constraint.
            Object.keys(tripleToConstraintMapping).forEach(k => {
              if (tripleToConstraintMapping[k] !== "NO_TRIPLE_CONSTRAINT")
                unmatchedTriples[k] = tripleToConstraintMapping[k];
            });
            // Removed triples matched in this thread.
            elt.matched.forEach(m => {
              m.triples.forEach(t => {
                delete unmatchedTriples[t];
              });
            });

          return acc.concat(Object.keys(unmatchedTriples).map(i => extend({
            type: "ExcessTripleViolation",
            property: lastState.c.predicate,
            triple: neighborhood[unmatchedTriples[i]],
          }, valueExpr ? { valueExpr: valueExpr } : {})));
          }
        }, []);
      }
      // console.log("chosen:", dump.thread(chosen));
      return "errors" in chosen.matched ?
        chosen.matched :
        matchedToResult(chosen.matched, constraintList, constraintToTripleMapping, neighborhood, semActHandler);
    }

    function addStates (rbenx, nlist, thread, taken) {
      const state = rbenx.states[thread.state];
      // find the exprs that require repetition
      const exprs = rbenx.states.map(x => { return x.c === Rept ? x.expr : null; });
      const newStack = state.stack.map(e => {
        let i = thread.repeats[exprs.indexOf(e.c)];
        if (i === undefined)
          i = 0; // expr has no repeats
        else
          i = i-1;
        return { c:e.c, e:e.e, i:i };
      });
      const withIndexes = {
        c: state.c,
        triples: taken,
        stack: newStack
      };
      thread.matched = thread.matched.concat(withIndexes);
      state.outs.forEach(o => { // single out if NFA includes epsilons
        addstate(rbenx, nlist, o, thread);
      });
    }

    function addstate (rbenx, list, stateNo, thread, seen) {
      seen = seen || [];
      const seenkey = stateString(stateNo, thread.repeats);
      if (seen.indexOf(seenkey) !== -1)
        return;
      seen.push(seenkey);

      const s = rbenx.states[stateNo];
      if (s.c === Split) {
        return s.outs.reduce((ret, o, idx) => {
          return ret.concat(addstate(rbenx, list, o, thread, seen));
        }, []);
        // } else if (s.c.type === "OneOf" || s.c.type === "EachOf") { // don't need Rept
      } else if (s.c === Rept) {
        const ret = [];
        // matched = [matched].concat("Rept" + s.expr);
        if (!(stateNo in thread.repeats))
          thread.repeats[stateNo] = 0;
        const repetitions = thread.repeats[stateNo];
        // add(r < s.min ? outs[0] : r >= s.min && < s.max ? outs[0], outs[1] : outs[1])
        if (repetitions < s.max)
          [].push.apply(ret, addstate(rbenx, list, s.outs[0], incrmRepeat(thread, stateNo), seen)); // outs[0] to repeat
        if (repetitions >= s.min && repetitions <= s.max)
          [].push.apply(ret, addstate(rbenx, list, s.outs[1], resetRepeat(thread, stateNo), seen)); // outs[1] when done
        return ret;
      } else {
        // if (stateNo !== rbenx.end || !thread.avail.reduce((r2, avail) => { faster if we trim early??
        //   return r2 || avail.length > 0;
        // }, false))
        return [list.push({ // return [new list element index]
          state:stateNo,
          repeats:thread.repeats,
          avail:thread.avail.map(a => { // copy parent thread's avail vector
            return a.slice();
          }),
          stack:thread.stack,
          matched:thread.matched,
          errors: thread.errors
        }) - 1];
      }
    }

    function resetRepeat (thread, repeatedState) {
      const trimmedRepeats = Object.keys(thread.repeats).reduce((r, k) => {
        if (parseInt(k) !== repeatedState) // ugh, hash keys are strings
          r[k] = thread.repeats[k];
        return r;
      }, {});
      return {state:thread.state/*???*/, repeats:trimmedRepeats, matched:thread.matched, avail:thread.avail.slice(), stack:thread.stack};
    }

    function incrmRepeat (thread, repeatedState) {
      const incrmedRepeats = Object.keys(thread.repeats).reduce((r, k) => {
        r[k] = parseInt(k) == repeatedState ? thread.repeats[k] + 1 : thread.repeats[k];
        return r;
      }, {});
      return {state:thread.state/*???*/, repeats:incrmedRepeats, matched:thread.matched, avail:thread.avail.slice(), stack:thread.stack};
    }

    function stateString (state, repeats) {
      const rs = Object.keys(repeats).map(rpt => {
        return rpt+":"+repeats[rpt];
      }).join(",");
      return rs.length ? state + "-" + rs : ""+state;
    }

    function matchedToResult (matched, constraintList, constraintToTripleMapping, neighborhood, semActHandler) {
      let last = [];
      const errors = [];
      const skips = [];
      const ret = matched.reduce((out, m) => {
        let mis = 0;
        let ptr = out, t;
        while (mis < last.length &&
               m.stack[mis].c === last[mis].c && // constraint
               m.stack[mis].i === last[mis].i && // iteration number
               m.stack[mis].e === last[mis].e) { // (dis|con)junction number
            ptr = ptr.solutions[last[mis].i].expressions[last[mis].e];
          ++mis;
        }
        while (mis < m.stack.length) {
          if (mis >= last.length) {
            last.push({});
          }
          if (m.stack[mis].c !== last[mis].c) {
            t = [];
            ptr.type = m.stack[mis].c.type === "EachOf" ? "EachOfSolutions" : "OneOfSolutions", ptr.solutions = t;
            if ("min" in m.stack[mis].c)
              ptr.min = m.stack[mis].c.min;
            if ("max" in m.stack[mis].c)
              ptr.max = m.stack[mis].c.max;
            if ("annotations" in m.stack[mis].c)
              ptr.annotations = m.stack[mis].c.annotations;
            if ("semActs" in m.stack[mis].c)
              ptr.semActs = m.stack[mis].c.semActs;
            ptr = t;
            last[mis].i = null;
            // !!! on the way out to call after valueExpr test
            if ("semActs" in m.stack[mis].c) {
              const errors = semActHandler.dispatchAll(m.stack[mis].c.semActs, "???", ptr);
              if (errors.length)
                throw errors;
            }
            // if (ret && "semActs" in expr) { ret.semActs = expr.semActs; }
          } else {
            ptr = ptr.solutions;
          }
          if (m.stack[mis].i !== last[mis].i) {
            t = [];
            ptr[m.stack[mis].i] = {
              type:m.stack[mis].c.type === "EachOf" ? "EachOfSolution" : "OneOfSolution",
              expressions: t};
            ptr = t;
            last[mis].e = null;
          } else {
            ptr = ptr[last[mis].i].expressions;
          }
          if (m.stack[mis].e !== last[mis].e) {
            t = {};
            ptr[m.stack[mis].e] = t;
            if (m.stack[mis].e > 0 && ptr[m.stack[mis].e-1] === undefined && skips.indexOf(ptr) === -1)
              skips.push(ptr);
            ptr = t;
            last.length = mis + 1; // chop off last so we create everything underneath
          } else {
            throw "how'd we get here?"
            ptr = ptr[last[mis].e];
          }
          ++mis;
        }
        ptr.type = "TripleConstraintSolutions";
        if ("min" in m.c)
          ptr.min = m.c.min;
        if ("max" in m.c)
          ptr.max = m.c.max;
        ptr.predicate = m.c.predicate;
        if ("valueExpr" in m.c)
          ptr.valueExpr = m.c.valueExpr;
        if ("id" in m.c)
          ptr.productionLabel = m.c.id;
        ptr.solutions = m.triples.map(tNo => {
          const triple = neighborhood[tNo];
          const ret = {
            type: "TestedTriple",
            subject: triple.subject,
            predicate: triple.predicate,
            object: ldify(triple.object)
          };

        function ldify (term) {
          if (term[0] !== "\"")
            return term;
          const ret = { value: ShExTerm.getLiteralValue(term) };
          const dt = ShExTerm.getLiteralType(term);
          if (dt &&
              dt !== "http://www.w3.org/2001/XMLSchema#string" &&
              dt !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString")
            ret.type = dt;
          const lang = ShExTerm.getLiteralLanguage(term)
          if (lang)
            ret.language = lang;
          return ret;
        }
          const constraintNo = constraintList.indexOf(m.c);
                      const hit = constraintToTripleMapping[constraintNo].find(x => x.tNo === tNo);
                      if (hit.res && Object.keys(hit.res).length > 0)
                        ret.referenced = hit.res;
          if (errors.length === 0 && "semActs" in m.c)
            [].push.apply(errors, semActHandler.dispatchAll(m.c.semActs, triple, ret));
          return ret;
        })
        if ("annotations" in m.c)
          ptr.annotations = m.c.annotations;
        if ("semActs" in m.c)
          ptr.semActs = m.c.semActs;
        last = m.stack.slice();
        return out;
      }, {});

      if (errors.length)
        return {
          type: "SemActFailure",
          errors: errors
        };

      // Clear out the nulls for the expressions with min:0 and no matches.
      // <S> { (:p .; :q .)?; :r . } \ { <s> :r 1 } -> i:0, e:1 resulting in null at e=0
      // Maybe we want these nulls in expressions[] to make it clear that there are holes?
      skips.forEach(skip => {
        for (let exprNo = 0; exprNo < skip.length; ++exprNo)
          if (skip[exprNo] === null || skip[exprNo] === undefined)
            skip.splice(exprNo--, 1);
      });

      if ("semActs" in shape)
        ret.semActs = shape.semActs;
      return ret;
    }
  }

function extend(base) {
  if (!base) base = {};
  for (let i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
    for (let name in arg)
      base[name] = arg[name];
  return base;
}

// ## Exports

return exports = {
  name: "eval-simple-1err",
  description: "simple regular expression engine with n out states",
  compile: compileNFA
};

})();

if (true)
  module.exports = EvalSimple1ErrCjsModule;


/***/ }),

/***/ 237:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const EvalThreadedNErrCjsModule = (function () {
const ShExTerm = __webpack_require__(118);
const UNBOUNDED = -1;

function vpEngine (schema, shape, index) {
    const outerExpression = shape.expression;
    return {
      match:match
    };

    function match (graph, node, constraintList, constraintToTripleMapping, tripleToConstraintMapping, neighborhood, semActHandler, trace) {

      /*
       * returns: list of passing or failing threads (no heterogeneous lists)
       */
      function validateExpr (expr, thread) {
        if (typeof expr === "string") { // Inclusion
          const included = index.tripleExprs[expr];
          return validateExpr(included, thread);
        }

        const constraintNo = constraintList.indexOf(expr);
        let min = "min" in expr ? expr.min : 1;
        let max = "max" in expr ? expr.max === UNBOUNDED ? Infinity : expr.max : 1;

        function validateRept (type, val) {
          let repeated = 0, errOut = false;
          let newThreads = [thread];
          const minmax = {  };
          if ("min" in expr && expr.min !== 1 || "max" in expr && expr.max !== 1) {
            minmax.min = expr.min;
            minmax.max = expr.max;
          }
          if ("semActs" in expr)
            minmax.semActs = expr.semActs;
          if ("annotations" in expr)
            minmax.annotations = expr.annotations;
          for (; repeated < max && !errOut; ++repeated) {
            let inner = [];
            for (let t = 0; t < newThreads.length; ++t) {
              const newt = newThreads[t];
              const sub = val(newt);
              if (sub.length > 0 && sub[0].errors.length === 0) { // all subs pass or all fail
                sub.forEach(newThread => {
                  const solutions =
                      "expression" in newt ? newt.expression.solutions.slice() : [];
                  if ("solution" in newThread)
                    solutions.push(newThread.solution);
                  delete newThread.solution;
                  newThread.expression = extend({
                    type: type,
                    solutions: solutions
                  }, minmax);
                });
              }
              if (sub.length === 0 /* min:0 */ || sub[0].errors.length > 0)
                return repeated < min ? sub : newThreads;
              else
                inner = inner.concat(sub);
              // newThreads.expressions.push(sub);
            }
            newThreads = inner;
          }
          if (newThreads.length > 0 && newThreads[0].errors.length === 0 && "semActs" in expr) {
            const passes = [];
            const failures = [];
            newThreads.forEach(newThread => {
              const semActErrors = semActHandler.dispatchAll(expr.semActs, "???", newThread)
              if (semActErrors.length === 0) {
                passes.push(newThread)
              } else {
                [].push.apply(newThread.errors, semActErrors);
                failures.push(newThread);
              }
            });
            newThreads = passes.length > 0 ? passes : failures;
          }
          return newThreads;
        }

        if (expr.type === "TripleConstraint") {
          const negated = "negated" in expr && expr.negated || max === 0;
          if (negated)
            min = max = Infinity;
          if (thread.avail[constraintNo] === undefined)
            thread.avail[constraintNo] = constraintToTripleMapping[constraintNo].map(pair => pair.tNo);
          const minmax = {  };
          if ("min" in expr && expr.min !== 1 || "max" in expr && expr.max !== 1) {
            minmax.min = expr.min;
            minmax.max = expr.max;
          }
          if ("semActs" in expr)
            minmax.semActs = expr.semActs;
          if ("annotations" in expr)
            minmax.annotations = expr.annotations;
          const taken = thread.avail[constraintNo].splice(0, min);
          const passed = negated ? taken.length === 0 : taken.length >= min;
          const ret = [];
          const matched = thread.matched;
          if (passed) {
            do {
              const passFail = taken.reduce((acc, tripleNo) => {
                const t = neighborhood[tripleNo]
                const tested = {
                  type: "TestedTriple",
                  subject: t.subject,
                  predicate: t.predicate,
                  object: ldify(t.object)
                }
                const hit = constraintToTripleMapping[constraintNo].find(x => x.tNo === tripleNo);
                if (hit.res && Object.keys(hit.res).length > 0)
                  tested.referenced = hit.res;
                const semActErrors = thread.errors.concat(
                  "semActs" in expr
                    ? semActHandler.dispatchAll(expr.semActs, tested, tested)
                    : []
                )
                if (semActErrors.length > 0)
                  acc.fail.push({tripleNo, tested, semActErrors})
                else
                  acc.pass.push({tripleNo, tested, semActErrors})
                return acc
              }, {pass: [], fail: []})


              // return an empty solution if min card was 0
              if (passFail.fail.length === 0) {
                // If we didn't take anything, fall back to old errors.
                // Could do something fancy here with a semAct registration for negative matches.
                const totalErrors = taken.length === 0 ? thread.errors.slice() : []
                const myThread = makeThread(passFail.pass, totalErrors)
                ret.push(myThread);
              } else {
                passFail.fail.forEach(
                  f => ret.push(makeThread([f], f.semActErrors))
                )
              }

              function makeThread (tests, errors) {
                return {
                  avail: thread.avail.map(a => { // copy parent thread's avail vector
                    return a.slice();
                  }),
                  errors: errors,
                  matched: matched.concat({
                    tNos: tests.map(p => p.tripleNo)
                  }),
                  expression: extend(
                    {
                      type: "TripleConstraintSolutions",
                      predicate: expr.predicate
                    },
                    "valueExpr" in expr ? { valueExpr: expr.valueExpr } : {},
                    "id" in expr ? { productionLabel: expr.id } : {},
                    minmax,
                    {
                      solutions: tests.map(p => p.tested)
                    }
                  )
                }
              }
            } while ((function () {
              if (thread.avail[constraintNo].length > 0 && taken.length < max) {
                // build another thread.
                taken.push(thread.avail[constraintNo].shift());
                return true;
              } else {
                // no more threads
                return false;
              }
            })());
          } else {
            let valueExpr = null;
            if (typeof expr.valueExpr === "string") { // ShapeRef
              valueExpr = expr.valueExpr;
              if (ShExTerm.isBlank(valueExpr))
                valueExpr = index.shapeExprs[valueExpr];
            } else if (expr.valueExpr) {
              valueExpr = extend({}, expr.valueExpr)
            }
            ret.push({
              avail: thread.avail,
              errors: thread.errors.concat([
                extend({
                  type: negated ? "NegatedProperty" : "MissingProperty",
                  property: expr.predicate
                }, valueExpr ? { valueExpr: valueExpr } : {})
              ]),
              matched: matched
            });
          }

          return ret;
        }

        else if (expr.type === "OneOf") {
          return validateRept("OneOfSolutions", (th) => {
            // const accept = null;
            const matched = [];
            const failed = [];
            expr.expressions.forEach(nested => {
              const thcopy = {
                avail: th.avail.map(a => { return a.slice(); }),
                errors: th.errors,
                matched: th.matched//.slice() ever needed??
              };
              const sub = validateExpr(nested, thcopy);
              if (sub[0].errors.length === 0) { // all subs pass or all fail
                [].push.apply(matched, sub);
                sub.forEach(newThread => {
                  const expressions =
                      "solution" in thcopy ? thcopy.solution.expressions : [];
                  if ("expression" in newThread) // undefined for no matches on min card:0
                    expressions.push(newThread.expression);
                  delete newThread.expression;
                  newThread.solution = {
                    type: "OneOfSolution",
                    expressions: expressions
                  };
                });
              } else
                [].push.apply(failed, sub);
            });
            return matched.length > 0 ? matched : failed;
          });
        }

        else if (expr.type === "EachOf") {
          return homogenize(validateRept("EachOfSolutions", (th) => {
            // Iterate through nested expressions, exprThreads starts as [th].
            return expr.expressions.reduce((exprThreads, nested) => {
              // Iterate through current thread list composing nextThreads.
              // Consider e.g.
              // <S1> { <p1> . | <p2> .; <p3> . } / { <x> <p2> 2; <p3> 3 } (should pass)
              // <S1> { <p1> .; <p2> . }          / { <s1> <p1> 1 }        (should fail)
              return homogenize(exprThreads.reduce((nextThreads, exprThread) => {
                const sub = validateExpr(nested, exprThread);
                // Move newThread.expression into a hierarchical solution structure.
                sub.forEach(newThread => {
                  if (newThread.errors.length === 0) {
                    const expressions =
                        "solution" in exprThread ? exprThread.solution.expressions.slice() : [];
                    if ("expression" in newThread) // undefined for no matches on min card:0
                      expressions.push(newThread.expression);
                    delete newThread.expression;
                    newThread.solution = {
                      type: "EachOfSolution",
                      expressions: expressions // exprThread.expression + newThread.expression
                    };
                  }
                });
                return nextThreads.concat(sub);
              }, []));
            }, [th]);
          }));
        }

        runtimeError("unexpected expr type: " + expr.type);

        function homogenize (list) {
          return list.reduce((acc, elt) => {
            if (elt.errors.length === 0) {
              if (acc.errors) {
                return { errors: false, l: [elt] };
              } else {
                return { errors: false, l: acc.l.concat(elt) };
              }
            } else {
              if (acc.errors) {
                return { errors: true, l: acc.l.concat(elt) };
              } else {
                return acc; }
            }
          }, {errors: true, l: []}).l;
        }
      }

      const startingThread = {
        avail:[],   // triples remaining by constraint number
        matched:[], // triples matched in this thread
        errors:[]   // errors encounted
      };
      if (!outerExpression)
        return { }; // vapid match if no expression
      const ret = validateExpr(outerExpression, startingThread);
      // console.log(JSON.stringify(ret));
      // note: don't return if ret.length === 1 because it might fail the unmatchedTriples test.
      const longerChosen =
          ret.reduce((ret, elt) => {
            if (elt.errors.length > 0)
              return ret;              // early return
            const unmatchedTriples = {};
            // Collect triples assigned to some constraint.
            Object.keys(tripleToConstraintMapping).forEach(k => {
              if (tripleToConstraintMapping[k] !== "NO_TRIPLE_CONSTRAINT")
                unmatchedTriples[k] = tripleToConstraintMapping[k];
            });
            // Removed triples matched in this thread.
            elt.matched.forEach(m => {
              m.tNos.forEach(t => {
                delete unmatchedTriples[t];
              });
            });
            // Remaining triples are unaccounted for.
            Object.keys(unmatchedTriples).forEach(t => {
              elt.errors.push({
                type: "ExcessTripleViolation",
                triple: neighborhood[t],
                constraint: constraintList[unmatchedTriples[t]]
              });
            });
            return ret !== null ? ret : // keep first solution
            // Accept thread with no unmatched triples.
            Object.keys(unmatchedTriples).length > 0 ? null : elt;
          }, null);
      return longerChosen !== null ?
        finish(longerChosen.expression, constraintList,
               neighborhood, semActHandler) :
        ret.length > 1 ? {
          type: "PossibleErrors",
          errors: ret.reduce((all, e) => {
            return all.concat([e.errors]);
          }, [])
        } : ret[0];
    }

        function ldify (term) {
          if (term[0] !== "\"")
            return term;
          const ret = { value: ShExTerm.getLiteralValue(term) };
          const dt = ShExTerm.getLiteralType(term);
          if (dt &&
              dt !== "http://www.w3.org/2001/XMLSchema#string" &&
              dt !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString")
            ret.type = dt;
          const lang = ShExTerm.getLiteralLanguage(term)
          if (lang)
            ret.language = lang;
          return ret;
        }

    function finish (fromValidatePoint, constraintList, neighborhood, semActHandler) {
      function _dive (solns) {
        if (solns.type === "OneOfSolutions" ||
            solns.type === "EachOfSolutions") {
          solns.solutions.forEach(s => {
            s.expressions.forEach(e => {
              _dive(e);
            });
          });
        } else if (solns.type === "TripleConstraintSolutions") {
          solns.solutions = solns.solutions.map(x => {
            if (x.type === "TestedTriple") // already done
              return x; // c.f. validation/3circularRef1_pass-open
            const t = neighborhood[x.tripleNo];
            const expr = constraintList[x.constraintNo];
            const ret = {
              type: "TestedTriple", subject: t.subject, predicate: t.predicate, object: ldify(t.object)
            };
            function diver (focus, shapeLabel, dive) {
              const sub = dive(focus, shapeLabel);
              if ("errors" in sub) {
                // console.dir(sub);
                const err = {
                  type: "ReferenceError", focus: focus,
                  shape: shapeLabel
                };
                if (typeof shapeLabel === "string" && ShExTerm.isBlank(shapeLabel))
                  err.referencedShape = shape;
                err.errors = sub;
                return [err];
              }
              if (("solution" in sub || "solutions" in sub)&& Object.keys(sub.solution || sub.solutions).length !== 0 ||
                  sub.type === "Recursion")
                ret.referenced = sub; // !!! needs to aggregate errors and solutions
              return [];
            }
            function diveRecurse (focus, shapeLabel) {
              return diver(focus, shapeLabel, recurse);
            }
            function diveDirect (focus, shapeLabel) {
              return diver(focus, shapeLabel, direct);
            }
            const subErrors = "valueExpr" in expr ?
                checkValueExpr(expr.inverse ? t.subject : t.object, expr.valueExpr, diveRecurse, diveDirect) :
                [];
            if (subErrors.length === 0 && "semActs" in expr)
              [].push.apply(subErrors, semActHandler.dispatchAll(expr.semActs, ret, ret))
            if (subErrors.length > 0) {
              fromValidatePoint.errors = fromValidatePoint.errors || [];
              fromValidatePoint.errors = fromValidatePoint.errors.concat(subErrors);
            }
            return ret;
          });
        } else {
          throw Error("unexpected expr type in " + JSON.stringify(solns));
        }
      }
      if (Object.keys(fromValidatePoint).length > 0) // guard against {}
        _dive(fromValidatePoint);
      if ("semActs" in shape)
        fromValidatePoint.semActs = shape.semActs;
      return fromValidatePoint;
    }
  }

        function ldify (term) {
          if (term[0] !== "\"")
            return term;
          const ret = { value: N3Util.getLiteralValue(term) };
          const dt = N3Util.getLiteralType(term);
          if (dt &&
              dt !== "http://www.w3.org/2001/XMLSchema#string" &&
              dt !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString")
            ret.type = dt;
          const lang = N3Util.getLiteralLanguage(term)
          if (lang)
            ret.language = lang;
          return ret;
        }

function extend(base) {
  if (!base) base = {};
  for (let i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
    for (let name in arg)
      base[name] = arg[name];
  return base;
}

return {
  name: "eval-threaded-nerr",
  description: "emulation of regular expression engine with error permutations",
  compile: vpEngine
};
})();

if (true)
  module.exports = EvalThreadedNErrCjsModule;


/***/ }),

/***/ 839:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;
/* parser generated by jison 0.0.9 */
/**
 * Returns a Parser implementing JisonParserApi and a Lexer implementing JisonLexerApi.
 */

  /*
    ShapeMap parser in the Jison parser generator format.
  */

  const ShapeMap = __webpack_require__(14);

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

  const numericFacets = (/* unused pure expression or super */ null && (["mininclusive", "minexclusive",
                       "maxinclusive", "maxexclusive"]));

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

__webpack_unused_export__ = ({ value: true });
const { JisonParser, o } = __webpack_require__(41);
const { JisonLexer } = __webpack_require__(752);

function ShapeMapJisonParser (yy = {}, lexer = new ShapeMapJisonLexer(yy)) {

  const $V0=[1,7],$V1=[1,16],$V2=[1,11],$V3=[1,14],$V4=[1,25],$V5=[1,24],$V6=[1,21],$V7=[1,22],$V8=[1,23],$V9=[1,28],$Va=[1,26],$Vb=[1,27],$Vc=[1,29],$Vd=[1,12],$Ve=[1,13],$Vf=[1,15],$Vg=[4,9],$Vh=[16,19,20,21],$Vi=[2,25],$Vj=[16,19,20,21,37],$Vk=[16,19,20,21,31,34,37,39,46,48,50,53,54,55,56,76,77,78,79,80,81,82],$Vl=[4,9,16,19,20,21,37,43,74,75],$Vm=[4,9,43],$Vn=[29,46,80,81,82],$Vo=[4,9,42,43],$Vp=[1,59],$Vq=[46,79,80,81,82],$Vr=[31,34,39,46,48,50,53,54,55,56,76,77,78,80,81,82],$Vs=[1,94],$Vt=[1,85],$Vu=[1,86],$Vv=[1,87],$Vw=[1,90],$Vx=[1,91],$Vy=[1,92],$Vz=[1,93],$VA=[1,95],$VB=[33,48,49,50,53,54,55,56,63],$VC=[4,9,37,65],$VD=[1,99],$VE=[9,37],$VF=[9,65];




  JisonParser.call(this, yy, lexer);


  this.symbols_ = {"error":2,"shapeMap":3,"EOF":4,"pair":5,"Q_O_QGT_COMMA_E_S_Qpair_E_C_E_Star":6,"QGT_COMMA_E_Opt":7,"O_QGT_COMMA_E_S_Qpair_E_C":8,"GT_COMMA":9,"nodeSelector":10,"statusAndShape":11,"Qreason_E_Opt":12,"QjsonAttributes_E_Opt":13,"reason":14,"jsonAttributes":15,"GT_AT":16,"Qstatus_E_Opt":17,"shapeSelector":18,"ATSTART":19,"ATPNAME_NS":20,"ATPNAME_LN":21,"status":22,"objectTerm":23,"triplePattern":24,"IT_SPARQL":25,"string":26,"nodeIri":27,"shapeIri":28,"START":29,"subjectTerm":30,"BLANK_NODE_LABEL":31,"literal":32,"GT_LCURLEY":33,"IT_FOCUS":34,"nodePredicate":35,"O_QobjectTerm_E_Or_QIT___E_C":36,"GT_RCURLEY":37,"O_QsubjectTerm_E_Or_QIT___E_C":38,"IT__":39,"GT_NOT":40,"GT_OPT":41,"GT_DIVIDE":42,"GT_DOLLAR":43,"O_QAPPINFO_COLON_E_Or_QAPPINFO_SPACE_COLON_E_C":44,"jsonValue":45,"APPINFO_COLON":46,"APPINFO_SPACE_COLON":47,"IT_false":48,"IT_null":49,"IT_true":50,"jsonObject":51,"jsonArray":52,"INTEGER":53,"DECIMAL":54,"DOUBLE":55,"STRING_LITERAL2":56,"Q_O_QjsonMember_E_S_QGT_COMMA_E_S_QjsonMember_E_Star_C_E_Opt":57,"O_QGT_COMMA_E_S_QjsonMember_E_C":58,"jsonMember":59,"Q_O_QGT_COMMA_E_S_QjsonMember_E_C_E_Star":60,"O_QjsonMember_E_S_QGT_COMMA_E_S_QjsonMember_E_Star_C":61,"STRING_LITERAL2_COLON":62,"GT_LBRACKET":63,"Q_O_QjsonValue_E_S_QGT_COMMA_E_S_QjsonValue_E_Star_C_E_Opt":64,"GT_RBRACKET":65,"O_QGT_COMMA_E_S_QjsonValue_E_C":66,"Q_O_QGT_COMMA_E_S_QjsonValue_E_C_E_Star":67,"O_QjsonValue_E_S_QGT_COMMA_E_S_QjsonValue_E_Star_C":68,"rdfLiteral":69,"numericLiteral":70,"booleanLiteral":71,"Q_O_QLANGTAG_E_Or_QGT_DTYPE_E_S_QnodeIri_E_C_E_Opt":72,"O_QLANGTAG_E_Or_QGT_DTYPE_E_S_QnodeIri_E_C":73,"LANGTAG":74,"GT_DTYPE":75,"STRING_LITERAL1":76,"STRING_LITERAL_LONG1":77,"STRING_LITERAL_LONG2":78,"IT_a":79,"IRIREF":80,"PNAME_LN":81,"PNAME_NS":82,"$accept":0,"$end":1};
  this.terminals_ = {2:"error",4:"EOF",9:"GT_COMMA",16:"GT_AT",19:"ATSTART",20:"ATPNAME_NS",21:"ATPNAME_LN",25:"IT_SPARQL",29:"START",31:"BLANK_NODE_LABEL",33:"GT_LCURLEY",34:"IT_FOCUS",37:"GT_RCURLEY",39:"IT__",40:"GT_NOT",41:"GT_OPT",42:"GT_DIVIDE",43:"GT_DOLLAR",46:"APPINFO_COLON",47:"APPINFO_SPACE_COLON",48:"IT_false",49:"IT_null",50:"IT_true",53:"INTEGER",54:"DECIMAL",55:"DOUBLE",56:"STRING_LITERAL2",62:"STRING_LITERAL2_COLON",63:"GT_LBRACKET",65:"GT_RBRACKET",74:"LANGTAG",75:"GT_DTYPE",76:"STRING_LITERAL1",77:"STRING_LITERAL_LONG1",78:"STRING_LITERAL_LONG2",79:"IT_a",80:"IRIREF",81:"PNAME_LN",82:"PNAME_NS"};
  this.productions_ = [0,[3,1],[3,4],[8,2],[6,0],[6,2],[7,0],[7,1],[5,4],[12,0],[12,1],[13,0],[13,1],[11,3],[11,1],[11,1],[11,1],[17,0],[17,1],[10,1],[10,1],[10,2],[10,2],[18,1],[18,1],[30,1],[30,1],[23,1],[23,1],[24,5],[24,5],[36,1],[36,1],[38,1],[38,1],[22,1],[22,1],[14,2],[15,3],[44,1],[44,1],[45,1],[45,1],[45,1],[45,1],[45,1],[45,1],[45,1],[45,1],[45,1],[51,3],[58,2],[60,0],[60,2],[61,2],[57,0],[57,1],[59,2],[52,3],[66,2],[67,0],[67,2],[68,2],[64,0],[64,1],[32,1],[32,1],[32,1],[70,1],[70,1],[70,1],[69,2],[73,1],[73,2],[72,0],[72,1],[71,1],[71,1],[26,1],[26,1],[26,1],[26,1],[35,1],[35,1],[27,1],[27,1],[27,1],[27,1],[28,1],[28,1],[28,1],[28,1]];
  this.table = [{3:1,4:[1,2],5:3,10:4,23:5,24:6,25:$V0,26:20,27:8,30:9,31:$V1,32:10,33:$V2,46:$V3,48:$V4,50:$V5,53:$V6,54:$V7,55:$V8,56:$V9,69:17,70:18,71:19,76:$Va,77:$Vb,78:$Vc,80:$Vd,81:$Ve,82:$Vf},{1:[3]},{1:[2,1]},o($Vg,[2,4],{6:30}),{11:31,16:[1,32],19:[1,33],20:[1,34],21:[1,35]},o($Vh,[2,19]),o($Vh,[2,20]),{26:36,56:$V9,76:$Va,77:$Vb,78:$Vc},o($Vh,$Vi,{26:37,56:$V9,76:$Va,77:$Vb,78:$Vc}),o($Vj,[2,27]),o($Vj,[2,28]),{27:42,30:40,31:$V1,34:[1,38],38:39,39:[1,41],46:$V3,80:$Vd,81:$Ve,82:$Vf},o($Vk,[2,84]),o($Vk,[2,85]),o($Vk,[2,86]),o($Vk,[2,87]),o([16,19,20,21,37,46,79,80,81,82],[2,26]),o($Vj,[2,65]),o($Vj,[2,66]),o($Vj,[2,67]),o($Vj,[2,74],{72:43,73:44,74:[1,45],75:[1,46]}),o($Vj,[2,68]),o($Vj,[2,69]),o($Vj,[2,70]),o($Vj,[2,76]),o($Vj,[2,77]),o($Vl,[2,78]),o($Vl,[2,79]),o($Vl,[2,80]),o($Vl,[2,81]),{4:[2,6],7:47,8:48,9:[1,49]},o($Vm,[2,9],{12:50,14:51,42:[1,52]}),o($Vn,[2,17],{17:53,22:54,40:[1,55],41:[1,56]}),o($Vo,[2,14]),o($Vo,[2,15]),o($Vo,[2,16]),o($Vh,[2,21]),o($Vh,[2,22]),{27:58,35:57,46:$V3,79:$Vp,80:$Vd,81:$Ve,82:$Vf},{27:58,35:60,46:$V3,79:$Vp,80:$Vd,81:$Ve,82:$Vf},o($Vq,[2,33]),o($Vq,[2,34]),o([37,46,79,80,81,82],$Vi),o($Vj,[2,71]),o($Vj,[2,75]),o($Vj,[2,72]),{27:61,46:$V3,80:$Vd,81:$Ve,82:$Vf},{4:[1,62]},o($Vg,[2,5]),{4:[2,7],5:63,10:4,23:5,24:6,25:$V0,26:20,27:8,30:9,31:$V1,32:10,33:$V2,46:$V3,48:$V4,50:$V5,53:$V6,54:$V7,55:$V8,56:$V9,69:17,70:18,71:19,76:$Va,77:$Vb,78:$Vc,80:$Vd,81:$Ve,82:$Vf},o($Vg,[2,11],{13:64,15:65,43:[1,66]}),o($Vm,[2,10]),{26:67,56:$V9,76:$Va,77:$Vb,78:$Vc},{18:68,28:69,29:[1,70],46:[1,73],80:[1,71],81:[1,72],82:[1,74]},o($Vn,[2,18]),o($Vn,[2,35]),o($Vn,[2,36]),{23:76,26:20,27:42,30:9,31:$V1,32:10,36:75,39:[1,77],46:$V3,48:$V4,50:$V5,53:$V6,54:$V7,55:$V8,56:$V9,69:17,70:18,71:19,76:$Va,77:$Vb,78:$Vc,80:$Vd,81:$Ve,82:$Vf},o($Vr,[2,82]),o($Vr,[2,83]),{34:[1,78]},o($Vj,[2,73]),{1:[2,2]},o($Vg,[2,3]),o($Vg,[2,8]),o($Vg,[2,12]),{44:79,46:[1,80],47:[1,81]},o($Vm,[2,37]),o($Vo,[2,13]),o($Vo,[2,23]),o($Vo,[2,24]),o($Vo,[2,88]),o($Vo,[2,89]),o($Vo,[2,90]),o($Vo,[2,91]),{37:[1,82]},{37:[2,31]},{37:[2,32]},{37:[1,83]},{33:$Vs,45:84,48:$Vt,49:$Vu,50:$Vv,51:88,52:89,53:$Vw,54:$Vx,55:$Vy,56:$Vz,63:$VA},o($VB,[2,39]),o($VB,[2,40]),o($Vh,[2,29]),o($Vh,[2,30]),o($Vg,[2,38]),o($VC,[2,41]),o($VC,[2,42]),o($VC,[2,43]),o($VC,[2,44]),o($VC,[2,45]),o($VC,[2,46]),o($VC,[2,47]),o($VC,[2,48]),o($VC,[2,49]),{37:[2,55],57:96,59:98,61:97,62:$VD},{33:$Vs,45:102,48:$Vt,49:$Vu,50:$Vv,51:88,52:89,53:$Vw,54:$Vx,55:$Vy,56:$Vz,63:$VA,64:100,65:[2,63],68:101},{37:[1,103]},{37:[2,56]},o($VE,[2,52],{60:104}),{33:$Vs,45:105,48:$Vt,49:$Vu,50:$Vv,51:88,52:89,53:$Vw,54:$Vx,55:$Vy,56:$Vz,63:$VA},{65:[1,106]},{65:[2,64]},o($VF,[2,60],{67:107}),o($VC,[2,50]),{9:[1,109],37:[2,54],58:108},o($VE,[2,57]),o($VC,[2,58]),{9:[1,111],65:[2,62],66:110},o($VE,[2,53]),{59:112,62:$VD},o($VF,[2,61]),{33:$Vs,45:113,48:$Vt,49:$Vu,50:$Vv,51:88,52:89,53:$Vw,54:$Vx,55:$Vy,56:$Vz,63:$VA},o($VE,[2,51]),o($VF,[2,59])];
  this.defaultActions = {2:[2,1],62:[2,2],76:[2,31],77:[2,32],97:[2,56],101:[2,64]};

  this.performAction = function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */
    const $0 = $$.length - 1;
    switch (yystate) {
case 1:

          return []
        
break;
case 2:

          return [$$[$0-3]].concat($$[$0-2])
        
break;
case 3: case 51: case 59:
this.$ = $$[$0];
break;
case 4: case 60: case 63:
this.$ = [  ];
break;
case 5: case 61:
this.$ = $$[$0-1].concat($$[$0]);
break;
case 8:
this.$ = extend({ node: $$[$0-3] }, $$[$0-2], $$[$0-1], $$[$0]);
break;
case 9: case 11: case 52: case 55: case 74:
this.$ = {  };
break;
case 13:
this.$ = extend({ shape: $$[$0] }, $$[$0-1]);
break;
case 14:
this.$ = { shape: ShapeMap.start };
break;
case 15:

        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        this.$ = { shape: expandPrefix(ShapeMapJisonParser._schemaPrefixes, $$[$0].substr(0, $$[$0].length - 1)) };
      
break;
case 16:

        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        const namePos = $$[$0].indexOf(':');
        this.$ = { shape: expandPrefix(ShapeMapJisonParser._schemaPrefixes, $$[$0].substr(0, namePos)) + $$[$0].substr(namePos + 1) };
      
break;
case 17:
this.$ = { status: 'conformant' } // defaults to conformant;
break;
case 18:
this.$ = { status: $$[$0] };
break;
case 21:
this.$ = { type: "Extension", language: "http://www.w3.org/ns/shex#Extensions-sparql", lexical: $$[$0]["@value"] };
break;
case 22:
this.$ = { type: "Extension", language: $$[$0-1], lexical: $$[$0]["@value"] };
break;
case 24:
this.$ = ShapeMap.start;
break;
case 29:
this.$ = { type: "TriplePattern", subject: ShapeMap.focus, predicate: $$[$0-2], object: $$[$0-1] };
break;
case 30:
this.$ = { type: "TriplePattern", subject: $$[$0-3], predicate: $$[$0-2], object: ShapeMap.focus };
break;
case 32: case 34: case 42:
this.$ = null;
break;
case 35:
this.$ = 'nonconformant';
break;
case 36:
this.$ = 'unknown';
break;
case 37:
this.$ = { reason: $$[$0] };
break;
case 38:
this.$ = { appinfo: $$[$0] };
break;
case 41:
this.$ = false;
break;
case 43:
this.$ = true;
break;
case 46: case 47: case 48:
this.$ = parseFloat($$[$0]);
break;
case 49:
this.$ = unescapeString($$[$0], 1)["@value"];
break;
case 50: case 58:
this.$ = $$[$0-1];
break;
case 53: case 54: case 71:
this.$ = extend($$[$0-1], $$[$0]);
break;
case 57:

        this.$ = {  };
        const t = $$[$0-1].substr(0, $$[$0-1].length - 1).trim(); // remove trailing ':' and spaces
        this.$[unescapeString(t, 1)["@value"]] = $$[$0];
      
break;
case 62:
this.$ = [$$[$0-1]].concat($$[$0]);
break;
case 68:
this.$ = createLiteral($$[$0], XSD_INTEGER);
break;
case 69:
this.$ = createLiteral($$[$0], XSD_DECIMAL);
break;
case 70:
this.$ = createLiteral($$[$0], XSD_DOUBLE);
break;
case 72:
this.$ = obj("@language", $$[$0].substr(1).toLowerCase());
break;
case 73:
this.$ = obj("@type", $$[$0]);
break;
case 76:
this.$ = createLiteral("true", XSD_BOOLEAN);
break;
case 77:
this.$ = createLiteral("false", XSD_BOOLEAN);
break;
case 78: case 80:
this.$ = unescapeString($$[$0], 1);
break;
case 79: case 81:
this.$ = unescapeString($$[$0], 3);
break;
case 83:
this.$ = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
break;
case 84:

        const node = unescapeText($$[$0].slice(1,-1), {});
        this.$ = ShapeMapJisonParser._dataBase === null || absoluteIRI.test(node) ? node : _resolveDataIRI(node)
      
break;
case 85: case 86:
this.$ = parsePName($$[$0], ShapeMapJisonParser._dataPrefixes);
break;
case 87:
this.$ = expandPrefix(ShapeMapJisonParser._dataPrefixes, $$[$0].substr(0, $$[$0].length - 1));;
break;
case 88:

        const shape = unescapeText($$[$0].slice(1,-1), {});
        this.$ = ShapeMapJisonParser._schemaBase === null || absoluteIRI.test(shape) ? shape : _resolveSchemaIRI(shape)
      
break;
case 89: case 90:
this.$ = parsePName($$[$0], ShapeMapJisonParser._schemaPrefixes);
break;
case 91:
this.$ = expandPrefix(ShapeMapJisonParser._schemaPrefixes, $$[$0].substr(0, $$[$0].length - 1));;
break;
    }
  }
}
ShapeMapJisonParser.prototype = Object.create(JisonParser.prototype);
Object.defineProperty(ShapeMapJisonParser.prototype, 'constructor', {
  value: ShapeMapJisonParser,
  enumerable: false,
  writable: true
});

exports._b = ShapeMapJisonParser;

/* generated by ts-jison-lex 0.0.9 */
__webpack_unused_export__ = ({ value: true });
function ShapeMapJisonLexer (yy = {}) {
  this.options = {"moduleName":"ShapeMapJison"};

  JisonLexer.call(this, yy);


  this.rules = [/^(?:\s+|(#[^\u000a\u000d]*|\/\*([^*]|\*([^/]|\\\/))*\*\/))/,/^(?:(appinfo[\u0020\u000A\u0009]+:))/,/^(?:("([^\u0022\u005C\u000A\u000D]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"[\u0020\u000A\u0009]*:))/,/^(?:([Ff][Oo][Cc][Uu][Ss]))/,/^(?:([Ss][Tt][Aa][Rr][Tt]))/,/^(?:(@[Ss][Tt][Aa][Rr][Tt]))/,/^(?:([Ss][Pp][Aa][Rr][Qq][Ll]))/,/^(?:(@(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*))))/,/^(?:(@((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)))/,/^(?:(@([A-Za-z])+((-([0-9A-Za-z])+))*))/,/^(?:(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*)))/,/^(?:(appinfo:))/,/^(?:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:))/,/^(?:(([+-])?((([0-9])+\.([0-9])*(([Ee]([+-])?([0-9])+)))|((\.)?([0-9])+(([Ee]([+-])?([0-9])+))))))/,/^(?:(([+-])?([0-9])*\.([0-9])+))/,/^(?:(([+-])?([0-9])+))/,/^(?:(<([^\u0000-\u0020<>\"{}|^`\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*>))/,/^(?:(_:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|[0-9])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"))/,/^(?:a\b)/,/^(?:,)/,/^(?:\{)/,/^(?:\})/,/^(?:@)/,/^(?:!)/,/^(?:\?)/,/^(?:\/)/,/^(?:\$)/,/^(?:\[)/,/^(?:\])/,/^(?:\^\^)/,/^(?:_\b)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:null\b)/,/^(?:$)/,/^(?:[a-zA-Z0-9_-]+)/,/^(?:.)/];
  this.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40],"inclusive":true}};
  this.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
    const YYSTATE=YY_START;
    switch($avoiding_name_collisions) {
    case 0:/**/
      break;
    case 1:return 47;
      break;
    case 2:return 62;
      break;
    case 3:return 34;
      break;
    case 4:return 29;
      break;
    case 5:return 19;
      break;
    case 6:return 25;
      break;
    case 7:return 21;
      break;
    case 8:return 20;
      break;
    case 9:return 74;
      break;
    case 10:return 81;
      break;
    case 11:return 46;
      break;
    case 12:return 82;
      break;
    case 13:return 55;
      break;
    case 14:return 54;
      break;
    case 15:return 53;
      break;
    case 16:return 80;
      break;
    case 17:return 31;
      break;
    case 18:return 77;
      break;
    case 19:return 78;
      break;
    case 20:return 76;
      break;
    case 21:return 56;
      break;
    case 22:return 79;
      break;
    case 23:return 9;
      break;
    case 24:return 33;
      break;
    case 25:return 37;
      break;
    case 26:return 16;
      break;
    case 27:return 40;
      break;
    case 28:return 41;
      break;
    case 29:return 42;
      break;
    case 30:return 43;
      break;
    case 31:return 63;
      break;
    case 32:return 65;
      break;
    case 33:return 75;
      break;
    case 34:return 39;
      break;
    case 35:return 50;
      break;
    case 36:return 48;
      break;
    case 37:return 49;
      break;
    case 38:return 4;
      break;
    case 39:return 'unexpected word "'+yy_.yytext+'"';
      break;
    case 40:return 'invalid character '+yy_.yytext;
      break;
    }
  }
}
ShapeMapJisonLexer.prototype = Object.create(JisonLexer.prototype);
Object.defineProperty(ShapeMapJisonLexer.prototype, 'constructor', {
  value: ShapeMapJisonLexer,
  enumerable: false,
  writable: true
});

__webpack_unused_export__ = ShapeMapJisonLexer;


/***/ }),

/***/ 18:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const ShapeMapParser = (function () {

// stolen as much as possible from SPARQL.js
if (true) {
  ShapeMapJison = (__webpack_require__(839)/* .Parser */ ._b); // node environment
} else {}

// Creates a ShEx parser with the given pre-defined prefixes
const prepareParser = function (baseIRI, schemaMeta, dataMeta) {
  // Create a copy of the prefixes
  const schemaBase = schemaMeta.base;
  const schemaPrefixesCopy = {};
  for (const prefix in schemaMeta.prefixes || {})
    schemaPrefixesCopy[prefix] = schemaMeta.prefixes[prefix];
  const dataBase = dataMeta.base;
  const dataPrefixesCopy = {};
  for (const prefix in dataMeta.prefixes || {})
    dataPrefixesCopy[prefix] = dataMeta.prefixes[prefix];

  // Create a new parser with the given prefixes
  // (Workaround for https://github.com/zaach/jison/issues/241)
  const parser = new ShapeMapJison();

  function runParser () {
    ShapeMapJison._schemaPrefixes = Object.create(schemaPrefixesCopy);
    ShapeMapJison._setSchemaBase(schemaBase);
    ShapeMapJison._dataPrefixes = Object.create(dataPrefixesCopy);
    ShapeMapJison._setDataBase(dataBase);
    ShapeMapJison._setFileName(baseIRI);
    try {
      return ShapeMapJison.prototype.parse.apply(parser, arguments);
    } catch (e) {
      // use the lexer's pretty-printing
      const lineNo = "lexer" in parser.yy ? parser.yy.lexer.yylineno + 1 : 1;
      const pos = "lexer" in parser.yy ? parser.yy.lexer.showPosition() : "";
      const t = Error(`${baseIRI}(${lineNo}): ${e.message}\n${pos}`);
      Error.captureStackTrace(t, runParser);
      parser.reset();
      throw t;
    }
  }
  parser.parse = runParser;
  parser._setSchemaBase = function (base) {
    ShapeMapJison._setSchemaBase;
    schemaBase = base;
  }
  parser._setDataBase = function (base) {
    ShapeMapJison._setDataBase;
    dataBase = base;
  }
  parser._setFileName = ShapeMapJison._setFileName;
  parser.reset = ShapeMapJison.reset;
  return parser;
}

return {
  construct: prepareParser
};
})();

if (true)
  module.exports = ShapeMapParser;


/***/ }),

/***/ 14:
/***/ ((module) => {

/* ShapeMap - javascript module to associate RDF nodes with labeled shapes.
 *
 * Status: Early implementation
 *
 * TODO:
 *   testing.
 */

const ShapeMapSymbols = (function () {
  return {
    focus: { term: "FOCUS" },
    start: { term: "START" },
    wildcard: { term: "WILDCARD" },
  }
})();

// Export the `ShExValidator` class as a whole.
if (true)
  module.exports = ShapeMapSymbols;


/***/ }),

/***/ 261:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* ShapeMap - javascript module to associate RDF nodes with labeled shapes.
 *
 * See README for description.
 */

const ShapeMapCjsModule = (function () {
  const symbols = __webpack_require__(14)

  // Write the parser object directly into the symbols so the caller shares a
  // symbol space with ShapeMapJison for e.g. start and focus.
  symbols.Parser = __webpack_require__(18)
  return symbols
})();

// Export the `ShExValidator` class as a whole.
if (true)
  module.exports = ShapeMapCjsModule;


/***/ }),

/***/ 410:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// **ShExLoader** return promise to load ShExC, ShExJ and N3 (Turtle) files.

const ShExApiCjsModule = function (config = {}) {

  const ShExUtil = __webpack_require__(443);
  const ShExParser = __webpack_require__(931);

  const api = { load: LoadPromise, loadExtensions: LoadNoExtensions, GET: GET, loadShExImports_NotUsed: loadShExImports_NotUsed };
  return api
  
  async function GET (url, mediaType) {
    let m;
    return (m = url.match("^data:([^,]+),(.*)$"))
      ? Promise.resolve({text: m[2], url: m[0]}) // Read from data: URL
      : (url.match("^(blob:)?[a-z]+://."))
      ? myHttpRequest(url, mediaType) // whatever fetch handles
      : (() => { throw Error(`Don't know how to fetch ${url}`) })()

    async function myHttpRequest(url, mediaType) {
      if (typeof config.fetch !== "function")
        throw Error(`Unable to fetch ${url} with fetch=${config.fetch}`)
      let resp
      try {
        resp = await config.fetch(url, {
          headers: {
            'Accept': 'text/shex,text/turtle,*/*'
          }
        })
      } catch (e) {
        // DNS failure
        // no route to host
        // connection refused
        throw Error(`GET <${url}> network failure: ${e.message}`)
      }
      if (!resp.ok)
        throw Error(`GET <${url}> failed: ${resp.status} ${resp.statusText}`)
      const text = await resp.text()
      return {text, url}
    }
  }

  function loadList (src, metaList, mediaType, parserWrapper, target, options, loadImports) {
    return src.map(
      async p =>
        typeof p === "object" ? mergeSchema(p) : await loadParseMergeSchema(p)
    )

    async function mergeSchema (obj) {
      const meta = addMeta(obj.url, mediaType)
      try {
        ShExUtil.merge(target, obj.schema, true, true)
        meta._prefixes = target._prefixes || {}
        meta.base = target._base
        loadImports(obj.schema)
        return [mediaType, obj.url]
      } catch (e) {
        const e2 = Error("error merging schema object " + obj.schema + ": " + e)
        e2.stack = e.stack
        throw e2
      }
    }

    async function loadParseMergeSchema (p) {
      return api.GET(p, mediaType).then(function (loaded) {
        return parserWrapper(loaded.text, mediaType, loaded.url, target,
                             addMeta(loaded.url, mediaType), options, loadImports)
      })
    }

    function addMeta (url, mediaType) {
      const meta = {
        mediaType: mediaType,
        url: url,
        base: url,
        prefixes: {}
      }
      metaList.push(meta)
      return meta
    }
  }

  /* LoadPromise - load shex and json files into a single Schema and turtle into
   * a graph (Data).
   */
  async function LoadPromise (shex, json, turtle, jsonld, schemaOptions = {}, dataOptions = {}) {
    const returns = {
      schema: ShExUtil.emptySchema(),
      data: config.rdfjs ? new config.rdfjs.Store() : null,
      schemaMeta: [],
      dataMeta: []
    }
    const promises = []
    const schemasSeen = shex.concat(json).map(p => {
      // might be already loaded objects with a url property.
      return typeof p === "object" ? p.url : p
    })
    let transform = null
    if (schemaOptions && "iriTransform" in schemaOptions) {
      transform = schemaOptions.iriTransform
      delete schemaOptions.iriTransform
    }

    const allLoaded = DynamicPromise()
    function loadImports (schema) {
      if (!("imports" in schema))
        return schema
      if (schemaOptions.keepImports) {
        return schema
      }
      const ret = Object.assign({}, schema)
      const imports = ret.imports
      delete ret.imports
      schema.imports.map(function (i) {
        return transform ? transform(i) : i
      }).filter(function (i) {
        return schemasSeen.indexOf(i) === -1
      }).map(i => {
        schemasSeen.push(i)
        allLoaded.add(api.GET(i).then(function (loaded) {
          const meta = {
            // mediaType: mediaType,
            url: loaded.url,
            base: loaded.url,
            prefixes: {}
          }
          // metaList.push(meta)
          return parseShExC(loaded.text, "text/shex", loaded.url,
                            returns.schema, meta, schemaOptions, loadImports)
        })); // addAfter would be after invoking schema.
      })
      return ret
    }

    // gather all the potentially remote inputs
    [].push.apply(promises, [
      loadList(shex, returns.schemaMeta, "text/shex",
               parseShExC, returns.schema, schemaOptions, loadImports),
      loadList(json, returns.schemaMeta, "text/json",
               parseShExJ, returns.schema, schemaOptions, loadImports),
      loadList(turtle, returns.dataMeta, "text/turtle",
               parseTurtle, returns.data, dataOptions),
      loadList(jsonld, returns.dataMeta, "application/ld+json",
               parseJSONLD, returns.data, dataOptions)
    ].reduce((acc, l) => acc.concat(l), [])) // .flat() in node > 8.x
    return allLoaded.all(promises).then(function (resources) {
      if (returns.schemaMeta.length > 0)
        ShExUtil.isWellDefined(returns.schema)
      return returns
    })
  }

  function DynamicPromise () {
    const promises = []
    const results = []
    let completedPromises = 0
    let resolveSelf, rejectSelf
    const self = new Promise(function (resolve, reject) {
      resolveSelf = resolve; rejectSelf = reject
    })
    self.all = function (pz) {
      if (pz.length === 0)
        resolveSelf([]) // otherwise it returns a Promise which never .thens
      // (and oddly doesn't have a slot in nodes pending promises?)
      else
        pz.forEach(function (promise, index) {
          promises.push(promise)
          addThen(promise, index)
        })
      return self
    }
    self.add = function (promise) {
      promises.push(promise)
      addThen(promise, promises.length - 1)
      return self
    }
    return self

    function addThen (promise, index) {
      promise.then(function (value) {
        results[index] = value
        ++completedPromises
        if(completedPromises === promises.length) {
          resolveSelf(results)
        }
      }).catch(function (error) {
        rejectSelf(error)
      })
    }
  }

  function parseShExC (text, mediaType, url, schema, meta, schemaOptions, loadImports) {
    const parser = schemaOptions && "parser" in schemaOptions ?
        schemaOptions.parser :
        ShExParser.construct(url, {}, schemaOptions)
    try {
      const s = parser.parse(text)
      // !! horrible hack until I set a variable to know if there's a BASE.
      if (s.base === url) delete s.base
      meta.prefixes = s._prefixes || {}
      meta.base = s._base || meta.base
      ShExUtil.merge(schema, loadImports(s), false, true)
      return Promise.resolve([mediaType, url])
    } catch (e) {
      e.message = "error parsing ShEx " + url + ": " + e.message
      return Promise.reject(e)
    }
  }

  function loadShExImports_NotUsed (from, parser, transform) {
    const schemasSeen = [from]
    const ret = { type: "Schema" }
    return api.GET(from).then(load999Imports).then(function () {
      ShExUtil.isWellDefined(ret)
      return ret
    })
    function load999Imports (loaded) {
      const schema = parser.parse(loaded.text)
      const imports = schema.imports
      delete schema.imports
      ShExUtil.merge(ret, schema, false, true)
      if (imports) {
        const rest = imports
            .map(function (i) {
              return transform ? transform(i) : i
            }).
            filter(function (i) {
              return schemasSeen.indexOf(i) === -1
            })
        return Promise.all(rest.map(i => {
          schemasSeen.push(i)
          return api.GET(i).then(load999Imports)
        })).then(a => {
          return null
        })
      } else {
        return null
      }
    }
  }

  function parseShExJ (text, mediaType, url, schema, meta, schemaOptions, loadImports) {
    try {
      const s = ShExUtil.ShExJtoAS(JSON.parse(text))
      ShExUtil.merge(schema, s, true, true)
      meta.prefixes = schema._prefixes
      meta.base = schema.base
      loadImports(s)
      return Promise.resolve([mediaType, url])
    } catch (e) {
      const e2 = Error("error parsing JSON " + url + ": " + e)
      // e2.stack = e.stack
      return Promise.reject(e2)
    }
  }

  function parseTurtle (text, mediaType, url, data, meta, dataOptions) {
    return new Promise(function (resolve, reject) {
      new config.rdfjs.Parser({baseIRI: url, blankNodePrefix: "", format: "text/turtle"}).
        parse(text,
              function (error, triple, prefixes) {
                if (prefixes) {
                  meta.prefixes = prefixes
                  // data.addPrefixes(prefixes)
                }
                if (error) {
                  reject("error parsing " + url + ": " + error)
                } else if (triple) {
                  data.addQuad(triple)
                } else {
                  meta.base = this._base
                  resolve([mediaType, url])
                }
              })
    })
  }

  /* parseTurtle999 - a variant of parseTurtle with no callback.
   * so, which is "better"?
   */
  function parseTurtle999 (text, mediaType, url, data, meta, dataOptions) {
    try {
      const p = new config.rdfjs.Parser({baseIRI: url, blankNodePrefix: "", format: "text/turtle"})
      const triples = p.parse(text)
      meta.prefixes = p._prefixes
      meta.base = p._base
      data.addPrefixes(p._prefixes)
      data.addTriples(triples)
      return Promise.resolve([mediaType, url])
    } catch (e) {
      return Promise.reject(Error("error parsing " + url + ": " + e))
    }
  }

  async function parseJSONLD (text, mediaType, url, data, meta, dataOptions) {
    const struct = JSON.parse(text)
    try {
      const nquads = await config.jsonld.toRDF(struct, {format: "application/nquads", base: url});
      meta.prefixes = {}; // @@ take from @context?
      meta.base = url;    // @@ take from @context.base? (or vocab?)
      return parseTurtle(nquads, mediaType, url, data, meta);
    } catch (lderr) {
      throw Error("error parsing JSON-ld " + url + ": " + lderr);
    }
  }

  function LoadNoExtensions (globs) { return []; }
}

if (true)
  module.exports = ShExApiCjsModule


/***/ }),

/***/ 509:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;
/* parser generated by jison 0.0.9 */
/**
 * Returns a Parser implementing JisonParserApi and a Lexer implementing JisonLexerApi.
 */

  /*
    ShEx parser in the Jison parser generator format.
  */

  const UNBOUNDED = -1;

  const ShExUtil = __webpack_require__(443);

  // Common namespaces and entities
  const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
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
    for (let i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
      for (let name in arg)
        base[name] = arg[name];
    return base;
  }

  // Creates an array that contains all items of the given arrays
  function unionAll() {
    let union = [];
    for (let i = 0, l = arguments.length; i < l; i++)
      union = union.concat.apply(union, arguments[i]);
    return union;
  }

  // N3.js:lib/N3Parser.js<0.4.5>:58 with
  //   s/this\./ShExJisonParser./g
  // ### `_setBase` sets the base IRI to resolve relative IRIs.
  ShExJisonParser._setBase = function (baseIRI) {
    if (!baseIRI)
      baseIRI = null;

    // baseIRI '#' check disabled to allow -x 'data:text/shex,...#'
    // else if (baseIRI.indexOf('#') >= 0)
    //   throw new Error('Invalid base IRI ' + baseIRI);

    // Set base IRI and its components
    if (ShExJisonParser._base = baseIRI) {
      ShExJisonParser._basePath   = baseIRI.replace(/[^\/?]*(?:\?.*)?$/, '');
      baseIRI = baseIRI.match(schemeAuthority);
      ShExJisonParser._baseRoot   = baseIRI[0];
      ShExJisonParser._baseScheme = baseIRI[1];
    }
  }

  // N3.js:lib/N3Parser.js<0.4.5>:576 with
  //   s/this\./ShExJisonParser./g
  //   s/token/iri/
  // ### `_resolveIRI` resolves a relative IRI token against the base path,
  // assuming that a base path has been set and that the IRI is indeed relative.
  function _resolveIRI (iri) {
    switch (iri[0]) {
    // An empty relative IRI indicates the base IRI
    case undefined: return ShExJisonParser._base;
    // Resolve relative fragment IRIs against the base IRI
    case '#': return ShExJisonParser._base + iri;
    // Resolve relative query string IRIs by replacing the query string
    case '?': return ShExJisonParser._base.replace(/(?:\?.*)?$/, iri);
    // Resolve root-relative IRIs at the root of the base IRI
    case '/':
      // Resolve scheme-relative IRIs to the scheme
      return (iri[1] === '/' ? ShExJisonParser._baseScheme : ShExJisonParser._baseRoot) + _removeDotSegments(iri);
    // Resolve all other IRIs at the base IRI's path
    default: {
      return _removeDotSegments(ShExJisonParser._basePath + iri);
    }
    }
  }

  // ### `_removeDotSegments` resolves './' and '../' path segments in an IRI as per RFC3986.
  function _removeDotSegments (iri) {
    // Don't modify the IRI if it does not contain any dot segments
    if (!dotSegments.test(iri))
      return iri;

    // Start with an imaginary slash before the IRI in order to resolve trailing './' and '../'
    const length = iri.length;
    let result = '', i = -1, pathStart = -1, next = '/', segmentStart = 0;

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
    const expression = { expression: expr };
    if (attr)
      for (let a in attr)
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
  let blankId = 0;
  ShExJisonParser._resetBlanks = function () { blankId = 0; }
  ShExJisonParser.reset = function () {
    ShExJisonParser._prefixes = ShExJisonParser._imports = ShExJisonParser._sourceMap = ShExJisonParser.shapes = ShExJisonParser.productions = ShExJisonParser.start = ShExJisonParser.startActs = null; // Reset state.
    ShExJisonParser._base = ShExJisonParser._baseIRI = ShExJisonParser._baseIRIPath = ShExJisonParser._baseIRIRoot = null;
  }
  let _fileName; // for debugging
  ShExJisonParser._setFileName = function (fn) { _fileName = fn; }

  // Regular expression and replacement strings to escape strings
  const stringEscapeReplacements = { '\\': '\\', "'": "'", '"': '"',
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
    const at = string.lastIndexOf("@");
    const lang = string.substr(at);
    string = string.substr(0, at);
    const u = unescapeString(string, trimLength);
    return extend(u, { language: lowercase(lang.substr(1)) });
  }

  // Translates regular expression escape codes in the string into their textual equivalent
  function unescapeRegexp (regexp) {
    const end = regexp.lastIndexOf("/");
    let s = regexp.substr(1, end-1);
    const regexpEscapeReplacements = {
      '.': "\\.", '\\': "\\\\", '?': "\\?", '*': "\\*", '+': "\\+",
      '{': "\\{", '}': "\\}", '(': "\\(", ')': "\\)", '|': "\\|",
      '^': "\\^", '$': "\\$", '[': "\\[", ']': "\\]", '/': "\\/",
      't': '\\t', 'n': '\\n', 'r': '\\r', '-': "\\-", '/': '/'
    };
    s = ShExUtil.unescapeText(s, regexpEscapeReplacements)
    const ret = {
      pattern: s
    };
    if (regexp.length > end+1)
      ret.flags = regexp.substr(end+1);
    return ret;
  }

  // Convenience function to return object with p1 key, value p2
  function keyValObject(key, val) {
    const ret = {};
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

  function error (e, yy) {
    const hash = {
      text: yy.lexer.match,
      // token: this.terminals_[symbol] || symbol,
      line: yy.lexer.yylineno,
      loc: yy.lexer.yylloc,
      // expected: expected
      pos: yy.lexer.showPosition()
    }
    e.hash = hash;
    if (ShExJisonParser.recoverable) {
      ShExJisonParser.recoverable(e)
    } else {
      throw e;
      ShExJisonParser.reset();
    }
  }

  // Expand declared prefix or throw Error
  function expandPrefix (prefix, yy) {
    if (!(prefix in ShExJisonParser._prefixes))
      error(new Error('Parse error; unknown prefix "' + prefix + ':"'), yy);
    return ShExJisonParser._prefixes[prefix];
  }

  // Add a shape to the map
  function addShape (label, shape, yy) {
    if (shape === EmptyShape)
      shape = { type: "Shape" };
    if (ShExJisonParser.productions && label in ShExJisonParser.productions)
      error(new Error("Structural error: "+label+" is a triple expression"), yy);
    if (!ShExJisonParser.shapes)
      ShExJisonParser.shapes = {};
    if (label in ShExJisonParser.shapes) {
      if (ShExJisonParser.options.duplicateShape === "replace")
        ShExJisonParser.shapes[label] = shape;
      else if (ShExJisonParser.options.duplicateShape !== "ignore")
        error(new Error("Parse error: "+label+" already defined"), yy);
    } else {
      ShExJisonParser.shapes[label] = Object.assign({id: label}, shape);
    }
  }

  // Add a production to the map
  function addProduction (label, production, yy) {
    if (ShExJisonParser.shapes && label in ShExJisonParser.shapes)
      error(new Error("Structural error: "+label+" is a shape expression"), yy);
    if (!ShExJisonParser.productions)
      ShExJisonParser.productions = {};
    if (label in ShExJisonParser.productions) {
      if (ShExJisonParser.options.duplicateShape === "replace")
        ShExJisonParser.productions[label] = production;
      else if (ShExJisonParser.options.duplicateShape !== "ignore")
        error(new Error("Parse error: "+label+" already defined"), yy);
    } else
      ShExJisonParser.productions[label] = production;
  }

  function addSourceMap (obj, yy) {
    if (!ShExJisonParser._sourceMap)
      ShExJisonParser._sourceMap = new Map();
    let list = ShExJisonParser._sourceMap.get(obj)
    if (!list)
      ShExJisonParser._sourceMap.set(obj, list = []);
    list.push(yy.lexer.yylloc);
    return obj;
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
      return { type: type, shapeExprs: [nonest(shapeAtom)].concat(juncts.map(nonest)) };
    }
  }

  // strip out .nested attribute
  function nonest (shapeAtom) {
    delete shapeAtom.nested;
    return shapeAtom;
  }

  const EmptyObject = {  };
  const EmptyShape = { type: "Shape" };

__webpack_unused_export__ = ({ value: true });
const { JisonParser, o } = __webpack_require__(41);
const { JisonLexer } = __webpack_require__(752);

function ShExJisonParser (yy = {}, lexer = new ShExJisonLexer(yy)) {

  const $V0=[7,18,19,20,21,23,26,36,193,215,216],$V1=[19,21,215,216],$V2=[2,27],$V3=[1,22],$V4=[1,23],$V5=[2,12],$V6=[2,13],$V7=[2,14],$V8=[7,18,19,20,21,23,26,36,215,216],$V9=[1,29],$Va=[1,32],$Vb=[1,31],$Vc=[2,18],$Vd=[2,19],$Ve=[1,38],$Vf=[1,42],$Vg=[1,41],$Vh=[1,40],$Vi=[1,44],$Vj=[1,47],$Vk=[1,46],$Vl=[2,15],$Vm=[2,17],$Vn=[2,260],$Vo=[2,261],$Vp=[2,262],$Vq=[2,263],$Vr=[19,21,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,161,189,215,218],$Vs=[2,61],$Vt=[1,65],$Vu=[19,21,39,43,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,161,179,189,215,218,220],$Vv=[2,29],$Vw=[2,238],$Vx=[2,239],$Vy=[2,264],$Vz=[193,195],$VA=[1,73],$VB=[1,76],$VC=[1,75],$VD=[2,16],$VE=[7,18,19,20,21,23,26,36,51,215,216],$VF=[2,47],$VG=[7,18,19,20,21,23,26,36,51,53,215,216],$VH=[2,54],$VI=[119,125,127,189,218],$VJ=[2,139],$VK=[1,111],$VL=[1,119],$VM=[1,93],$VN=[1,101],$VO=[1,102],$VP=[1,103],$VQ=[1,110],$VR=[1,115],$VS=[1,116],$VT=[1,117],$VU=[1,120],$VV=[1,121],$VW=[1,122],$VX=[1,123],$VY=[1,124],$VZ=[1,125],$V_=[1,106],$V$=[1,118],$V01=[2,62],$V11=[19,21,69,71,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,161,189,215,218],$V21=[1,136],$V31=[1,137],$V41=[1,138],$V51=[1,135],$V61=[1,134],$V71=[2,229],$V81=[2,230],$V91=[2,231],$Va1=[2,20],$Vb1=[1,145],$Vc1=[2,53],$Vd1=[1,147],$Ve1=[2,60],$Vf1=[2,69],$Vg1=[1,153],$Vh1=[1,154],$Vi1=[1,155],$Vj1=[2,65],$Vk1=[2,71],$Vl1=[1,162],$Vm1=[1,163],$Vn1=[1,164],$Vo1=[1,167],$Vp1=[1,170],$Vq1=[2,68],$Vr1=[7,18,19,20,21,23,26,36,51,53,79,80,81,119,125,127,189,190,193,215,216,218],$Vs1=[2,95],$Vt1=[7,18,19,20,21,23,26,36,51,53,190,193,215,216],$Vu1=[7,18,19,20,21,23,26,36,51,53,96,97,98,101,102,103,104,215,216],$Vv1=[2,87],$Vw1=[2,88],$Vx1=[7,18,19,20,21,23,26,36,51,53,79,80,81,101,102,103,104,119,125,127,189,190,193,215,216,218],$Vy1=[2,108],$Vz1=[2,107],$VA1=[7,18,19,20,21,23,26,36,51,53,101,102,103,104,112,113,114,115,116,117,190,193,215,216],$VB1=[2,102],$VC1=[2,101],$VD1=[7,18,19,20,21,23,26,36,51,53,96,97,98,101,102,103,104,190,193,215,216],$VE1=[2,91],$VF1=[2,92],$VG1=[2,112],$VH1=[2,113],$VI1=[2,114],$VJ1=[2,110],$VK1=[2,237],$VL1=[19,21,71,81,100,108,109,163,185,204,205,206,207,208,209,210,211,212,213,215],$VM1=[2,183],$VN1=[7,18,19,20,21,23,26,36,51,53,112,113,114,115,116,117,190,193,215,216],$VO1=[2,104],$VP1=[1,194],$VQ1=[1,196],$VR1=[1,198],$VS1=[1,197],$VT1=[2,118],$VU1=[1,205],$VV1=[1,206],$VW1=[1,207],$VX1=[1,208],$VY1=[100,108,109,206,207,208,209],$VZ1=[2,26],$V_1=[2,31],$V$1=[2,32],$V02=[79,80,81,119,125,127,189,218],$V12=[51,53],$V22=[1,270],$V32=[1,275],$V42=[1,252],$V52=[1,260],$V62=[1,261],$V72=[1,262],$V82=[1,269],$V92=[1,265],$Va2=[1,274],$Vb2=[2,48],$Vc2=[2,55],$Vd2=[2,64],$Ve2=[2,70],$Vf2=[2,66],$Vg2=[2,72],$Vh2=[7,18,19,20,21,23,26,36,51,53,101,102,103,104,190,193,215,216],$Vi2=[1,326],$Vj2=[1,334],$Vk2=[1,335],$Vl2=[1,336],$Vm2=[1,342],$Vn2=[1,343],$Vo2=[7,18,19,20,21,23,26,36,51,53,79,80,81,119,125,127,189,193,215,216,218],$Vp2=[2,227],$Vq2=[7,18,19,20,21,23,26,36,51,53,193,215,216],$Vr2=[1,351],$Vs2=[2,106],$Vt2=[2,111],$Vu2=[2,98],$Vv2=[1,357],$Vw2=[2,99],$Vx2=[2,100],$Vy2=[2,105],$Vz2=[7,18,19,20,21,23,26,36,51,53,96,97,98,101,102,103,104,193,215,216],$VA2=[2,93],$VB2=[1,374],$VC2=[1,380],$VD2=[1,369],$VE2=[1,373],$VF2=[1,383],$VG2=[1,384],$VH2=[1,385],$VI2=[1,372],$VJ2=[1,386],$VK2=[1,387],$VL2=[1,392],$VM2=[1,393],$VN2=[1,394],$VO2=[1,395],$VP2=[1,388],$VQ2=[1,389],$VR2=[1,390],$VS2=[1,391],$VT2=[1,379],$VU2=[19,21,69,160,199,215],$VV2=[2,167],$VW2=[2,141],$VX2=[1,408],$VY2=[1,407],$VZ2=[1,421],$V_2=[1,424],$V$2=[1,420],$V03=[1,423],$V13=[2,117],$V23=[2,122],$V33=[2,124],$V43=[2,125],$V53=[2,126],$V63=[2,252],$V73=[2,253],$V83=[2,254],$V93=[2,255],$Va3=[2,123],$Vb3=[19,21,39,43,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,161,179,189,190,193,215,218,220],$Vc3=[2,36],$Vd3=[2,74],$Ve3=[2,77],$Vf3=[2,35],$Vg3=[2,39],$Vh3=[2,42],$Vi3=[2,45],$Vj3=[1,446],$Vk3=[1,448],$Vl3=[1,454],$Vm3=[1,455],$Vn3=[1,456],$Vo3=[1,463],$Vp3=[1,464],$Vq3=[1,465],$Vr3=[1,468],$Vs3=[2,41],$Vt3=[1,538],$Vu3=[2,44],$Vv3=[1,574],$Vw3=[2,67],$Vx3=[51,53,70],$Vy3=[1,603],$Vz3=[51,53,70,79,80,81,119,125,127,189,190,193,218],$VA3=[51,53,70,190,193],$VB3=[51,53,70,96,97,98,101,102,103,104,190,193],$VC3=[51,53,70,79,80,81,101,102,103,104,119,125,127,189,190,193,218],$VD3=[51,53,70,101,102,103,104,112,113,114,115,116,117,190,193],$VE3=[51,53,70,112,113,114,115,116,117,190,193],$VF3=[51,70],$VG3=[7,18,19,20,21,23,26,36,51,53,79,80,81,119,125,127,189,215,216,218],$VH3=[2,97],$VI3=[2,96],$VJ3=[2,226],$VK3=[1,645],$VL3=[1,648],$VM3=[1,644],$VN3=[1,647],$VO3=[2,94],$VP3=[2,109],$VQ3=[2,103],$VR3=[2,115],$VS3=[2,116],$VT3=[2,134],$VU3=[2,182],$VV3=[1,678],$VW3=[19,21,71,81,100,108,109,163,178,185,204,205,206,207,208,209,210,211,212,213,215],$VX3=[2,232],$VY3=[2,233],$VZ3=[2,234],$V_3=[2,245],$V$3=[2,248],$V04=[2,242],$V14=[2,243],$V24=[2,244],$V34=[2,250],$V44=[2,251],$V54=[2,256],$V64=[2,257],$V74=[2,258],$V84=[2,259],$V94=[19,21,71,81,100,108,109,111,163,178,185,204,205,206,207,208,209,210,211,212,213,215],$Va4=[2,146],$Vb4=[2,147],$Vc4=[1,686],$Vd4=[2,148],$Ve4=[121,135],$Vf4=[2,153],$Vg4=[2,154],$Vh4=[2,156],$Vi4=[1,689],$Vj4=[1,690],$Vk4=[19,21,199,215],$Vl4=[2,175],$Vm4=[1,698],$Vn4=[121,135,140,141],$Vo4=[2,165],$Vp4=[119,125,127,189,190,193,218],$Vq4=[19,21,119,125,127,189,199,215,218],$Vr4=[2,235],$Vs4=[2,236],$Vt4=[19,21,39,43,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,161,179,189,193,215,218,220],$Vu4=[2,33],$Vv4=[2,37],$Vw4=[2,73],$Vx4=[2,75],$Vy4=[2,34],$Vz4=[2,43],$VA4=[2,40],$VB4=[2,46],$VC4=[1,765],$VD4=[1,771],$VE4=[1,811],$VF4=[1,858],$VG4=[51,53,70,101,102,103,104,190,193],$VH4=[51,53,70,79,80,81,119,125,127,189,193,218],$VI4=[51,53,70,193],$VJ4=[1,901],$VK4=[51,53,70,96,97,98,101,102,103,104,193],$VL4=[1,911],$VM4=[1,948],$VN4=[1,984],$VO4=[2,228],$VP4=[1,995],$VQ4=[1,1001],$VR4=[1,1000],$VS4=[19,21,100,108,109,204,205,206,207,208,209,210,211,212,213,215],$VT4=[1,1021],$VU4=[1,1027],$VV4=[1,1026],$VW4=[1,1048],$VX4=[1,1054],$VY4=[1,1053],$VZ4=[1,1071],$V_4=[1,1073],$V$4=[1,1075],$V05=[19,21,71,81,100,108,109,163,179,185,204,205,206,207,208,209,210,211,212,213,215],$V15=[1,1079],$V25=[1,1085],$V35=[1,1088],$V45=[1,1089],$V55=[1,1090],$V65=[1,1078],$V75=[1,1091],$V85=[1,1092],$V95=[1,1097],$Va5=[1,1098],$Vb5=[1,1099],$Vc5=[1,1100],$Vd5=[1,1093],$Ve5=[1,1094],$Vf5=[1,1095],$Vg5=[1,1096],$Vh5=[1,1084],$Vi5=[2,246],$Vj5=[2,249],$Vk5=[2,135],$Vl5=[2,149],$Vm5=[2,151],$Vn5=[2,155],$Vo5=[2,157],$Vp5=[2,158],$Vq5=[2,162],$Vr5=[2,164],$Vs5=[2,169],$Vt5=[2,170],$Vu5=[1,1115],$Vv5=[1,1118],$Vw5=[1,1114],$Vx5=[1,1117],$Vy5=[1,1128],$Vz5=[2,222],$VA5=[2,240],$VB5=[2,241],$VC5=[119,125,127,189,193,218],$VD5=[2,127],$VE5=[2,76],$VF5=[1,1168],$VG5=[1,1204],$VH5=[1,1263],$VI5=[1,1269],$VJ5=[1,1301],$VK5=[1,1307],$VL5=[51,53,70,79,80,81,119,125,127,189,218],$VM5=[51,53,70,96,97,98,101,102,103,104],$VN5=[1,1365],$VO5=[1,1412],$VP5=[2,223],$VQ5=[2,224],$VR5=[2,225],$VS5=[7,18,19,20,21,23,26,36,51,53,79,80,81,111,119,125,127,189,190,193,215,216,218],$VT5=[7,18,19,20,21,23,26,36,51,53,111,190,193,215,216],$VU5=[7,18,19,20,21,23,26,36,51,53,96,97,98,101,102,103,104,111,190,193,215,216],$VV5=[2,205],$VW5=[1,1465],$VX5=[19,21,71,81,100,108,109,163,178,179,185,204,205,206,207,208,209,210,211,212,213,215],$VY5=[19,21,71,81,100,108,109,111,163,178,179,185,204,205,206,207,208,209,210,211,212,213,215],$VZ5=[2,247],$V_5=[2,152],$V$5=[2,150],$V06=[2,159],$V16=[2,163],$V26=[2,160],$V36=[2,161],$V46=[19,21,43,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,161,189,215,218],$V56=[1,1482],$V66=[70,135],$V76=[1,1485],$V86=[1,1486],$V96=[70,135,140,141],$Va6=[1,1509],$Vb6=[1,1515],$Vc6=[1,1514],$Vd6=[1,1552],$Ve6=[1,1599],$Vf6=[1,1632],$Vg6=[1,1638],$Vh6=[1,1637],$Vi6=[1,1658],$Vj6=[1,1664],$Vk6=[1,1663],$Vl6=[1,1685],$Vm6=[1,1691],$Vn6=[1,1690],$Vo6=[1,1736],$Vp6=[1,1802],$Vq6=[1,1808],$Vr6=[1,1807],$Vs6=[1,1828],$Vt6=[1,1834],$Vu6=[1,1833],$Vv6=[1,1854],$Vw6=[1,1860],$Vx6=[1,1859],$Vy6=[1,1901],$Vz6=[1,1907],$VA6=[1,1939],$VB6=[1,1945],$VC6=[121,135,140,141,190,193],$VD6=[2,172],$VE6=[1,1965],$VF6=[1,1966],$VG6=[1,1967],$VH6=[1,1968],$VI6=[121,135,140,141,156,157,158,159,190,193],$VJ6=[2,38],$VK6=[51,121,135,140,141,156,157,158,159,190,193],$VL6=[2,51],$VM6=[51,53,121,135,140,141,156,157,158,159,190,193],$VN6=[2,58],$VO6=[1,1997],$VP6=[1,2017],$VQ6=[1,2023],$VR6=[1,2022],$VS6=[19,21,39,43,69,71,79,80,81,85,96,97,98,101,102,103,104,111,112,113,114,115,116,117,119,125,127,161,179,189,190,193,215,218,220],$VT6=[1,2069],$VU6=[1,2075],$VV6=[1,2107],$VW6=[1,2113],$VX6=[1,2166],$VY6=[1,2199],$VZ6=[1,2205],$V_6=[1,2204],$V$6=[1,2225],$V07=[1,2231],$V17=[1,2230],$V27=[1,2252],$V37=[1,2258],$V47=[1,2257],$V57=[1,2279],$V67=[1,2285],$V77=[1,2284],$V87=[1,2305],$V97=[1,2311],$Va7=[1,2310],$Vb7=[1,2332],$Vc7=[1,2338],$Vd7=[1,2337],$Ve7=[51,53,70,79,80,81,111,119,125,127,189,190,193,218],$Vf7=[51,53,70,111,190,193],$Vg7=[51,53,70,96,97,98,101,102,103,104,111,190,193],$Vh7=[1,2407],$Vi7=[2,173],$Vj7=[2,177],$Vk7=[2,178],$Vl7=[2,179],$Vm7=[2,180],$Vn7=[2,49],$Vo7=[2,56],$Vp7=[2,63],$Vq7=[2,83],$Vr7=[2,79],$Vs7=[2,85],$Vt7=[1,2490],$Vu7=[2,82],$Vv7=[51,53,79,80,81,101,102,103,104,119,121,125,127,135,140,141,156,157,158,159,189,190,193,218],$Vw7=[51,53,79,80,81,119,121,125,127,135,140,141,156,157,158,159,189,190,193,218],$Vx7=[51,53,101,102,103,104,112,113,114,115,116,117,121,135,140,141,156,157,158,159,190,193],$Vy7=[51,53,96,97,98,101,102,103,104,121,135,140,141,156,157,158,159,190,193],$Vz7=[2,89],$VA7=[2,90],$VB7=[51,53,112,113,114,115,116,117,121,135,140,141,156,157,158,159,190,193],$VC7=[111,119,125,127,189,190,193,218],$VD7=[1,2559],$VE7=[1,2648],$VF7=[1,2654],$VG7=[1,2737],$VH7=[1,2770],$VI7=[1,2776],$VJ7=[1,2775],$VK7=[1,2796],$VL7=[1,2802],$VM7=[1,2801],$VN7=[1,2823],$VO7=[1,2829],$VP7=[1,2828],$VQ7=[1,2850],$VR7=[1,2856],$VS7=[1,2855],$VT7=[1,2876],$VU7=[1,2882],$VV7=[1,2881],$VW7=[1,2903],$VX7=[1,2909],$VY7=[1,2908],$VZ7=[121,135,140,141,193],$V_7=[1,2928],$V$7=[2,52],$V08=[2,59],$V18=[2,78],$V28=[2,84],$V38=[2,80],$V48=[2,86],$V58=[51,53,101,102,103,104,121,135,140,141,156,157,158,159,190,193],$V68=[1,2952],$V78=[70,135,140,141,190,193],$V88=[1,2961],$V98=[1,2962],$Va8=[1,2963],$Vb8=[1,2964],$Vc8=[70,135,140,141,156,157,158,159,190,193],$Vd8=[51,70,135,140,141,156,157,158,159,190,193],$Ve8=[51,53,70,135,140,141,156,157,158,159,190,193],$Vf8=[1,2993],$Vg8=[1,3022],$Vh8=[1,3055],$Vi8=[1,3061],$Vj8=[1,3060],$Vk8=[1,3081],$Vl8=[1,3087],$Vm8=[1,3086],$Vn8=[1,3108],$Vo8=[1,3114],$Vp8=[1,3113],$Vq8=[1,3135],$Vr8=[1,3141],$Vs8=[1,3140],$Vt8=[1,3161],$Vu8=[1,3167],$Vv8=[1,3166],$Vw8=[1,3188],$Vx8=[1,3194],$Vy8=[1,3193],$Vz8=[1,3271],$VA8=[1,3277],$VB8=[2,174],$VC8=[2,50],$VD8=[1,3365],$VE8=[2,57],$VF8=[1,3398],$VG8=[2,81],$VH8=[2,171],$VI8=[1,3443],$VJ8=[51,53,70,79,80,81,101,102,103,104,119,125,127,135,140,141,156,157,158,159,189,190,193,218],$VK8=[51,53,70,79,80,81,119,125,127,135,140,141,156,157,158,159,189,190,193,218],$VL8=[51,53,70,101,102,103,104,112,113,114,115,116,117,135,140,141,156,157,158,159,190,193],$VM8=[51,53,70,96,97,98,101,102,103,104,135,140,141,156,157,158,159,190,193],$VN8=[51,53,70,112,113,114,115,116,117,135,140,141,156,157,158,159,190,193],$VO8=[1,3491],$VP8=[1,3497],$VQ8=[1,3560],$VR8=[1,3566],$VS8=[1,3565],$VT8=[1,3586],$VU8=[1,3592],$VV8=[1,3591],$VW8=[1,3613],$VX8=[1,3619],$VY8=[1,3618],$VZ8=[1,3678],$V_8=[1,3684],$V$8=[1,3683],$V09=[1,3719],$V19=[1,3761],$V29=[70,135,140,141,193],$V39=[1,3791],$V49=[51,53,70,101,102,103,104,135,140,141,156,157,158,159,190,193],$V59=[1,3815],$V69=[1,3890],$V79=[1,3896],$V89=[1,3895],$V99=[1,3916],$Va9=[1,3922],$Vb9=[1,3921],$Vc9=[1,3943],$Vd9=[1,3949],$Ve9=[1,3948],$Vf9=[111,121,135,140,141,190,193],$Vg9=[1,3991],$Vh9=[1,4015],$Vi9=[1,4057],$Vj9=[1,4090],$Vk9=[1,4118],$Vl9=[1,4124],$Vm9=[1,4123],$Vn9=[1,4144],$Vo9=[1,4150],$Vp9=[1,4149],$Vq9=[1,4171],$Vr9=[1,4177],$Vs9=[1,4176],$Vt9=[1,4251],$Vu9=[1,4294],$Vv9=[1,4300],$Vw9=[1,4299],$Vx9=[1,4335],$Vy9=[1,4377],$Vz9=[1,4451],$VA9=[70,111,135,140,141,190,193],$VB9=[1,4506],$VC9=[1,4530],$VD9=[1,4566],$VE9=[1,4612],$VF9=[1,4684],$VG9=[1,4733];




  JisonParser.call(this, yy, lexer);


  this.symbols_ = {"error":2,"shexDoc":3,"initParser":4,"Qdirective_E_Star":5,"Q_O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C_E_Opt":6,"EOF":7,"directive":8,"O_QnotStartAction_E_Or_QstartActions_E_C":9,"notStartAction":10,"startActions":11,"Qstatement_E_Star":12,"statement":13,"O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C":14,"baseDecl":15,"prefixDecl":16,"importDecl":17,"IT_BASE":18,"IRIREF":19,"IT_PREFIX":20,"PNAME_NS":21,"iri":22,"IT_IMPORT":23,"start":24,"shapeExprDecl":25,"IT_start":26,"=":27,"shapeAnd":28,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Star":29,"QcodeDecl_E_Plus":30,"codeDecl":31,"QIT_ABSTRACT_E_Opt":32,"shapeExprLabel":33,"Qrestriction_E_Star":34,"O_QshapeExpression_E_Or_QIT_EXTERNAL_E_C":35,"IT_ABSTRACT":36,"restriction":37,"shapeExpression":38,"IT_EXTERNAL":39,"QIT_NOT_E_Opt":40,"shapeAtomNoRef":41,"QshapeOr_E_Opt":42,"IT_NOT":43,"shapeRef":44,"shapeOr":45,"inlineShapeExpression":46,"inlineShapeOr":47,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Plus":48,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Plus":49,"O_QIT_OR_E_S_QshapeAnd_E_C":50,"IT_OR":51,"O_QIT_AND_E_S_QshapeNot_E_C":52,"IT_AND":53,"shapeNot":54,"inlineShapeAnd":55,"Q_O_QIT_OR_E_S_QinlineShapeAnd_E_C_E_Star":56,"O_QIT_OR_E_S_QinlineShapeAnd_E_C":57,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Star":58,"inlineShapeNot":59,"Q_O_QIT_AND_E_S_QinlineShapeNot_E_C_E_Star":60,"O_QIT_AND_E_S_QinlineShapeNot_E_C":61,"shapeAtom":62,"inlineShapeAtom":63,"nonLitNodeConstraint":64,"QshapeOrRef_E_Opt":65,"litNodeConstraint":66,"shapeOrRef":67,"QnonLitNodeConstraint_E_Opt":68,"(":69,")":70,".":71,"shapeDefinition":72,"nonLitInlineNodeConstraint":73,"QinlineShapeOrRef_E_Opt":74,"litInlineNodeConstraint":75,"inlineShapeOrRef":76,"QnonLitInlineNodeConstraint_E_Opt":77,"inlineShapeDefinition":78,"ATPNAME_LN":79,"ATPNAME_NS":80,"@":81,"Qannotation_E_Star":82,"semanticActions":83,"annotation":84,"IT_LITERAL":85,"QxsFacet_E_Star":86,"datatype":87,"valueSet":88,"QnumericFacet_E_Plus":89,"xsFacet":90,"numericFacet":91,"nonLiteralKind":92,"QstringFacet_E_Star":93,"QstringFacet_E_Plus":94,"stringFacet":95,"IT_IRI":96,"IT_BNODE":97,"IT_NONLITERAL":98,"stringLength":99,"INTEGER":100,"REGEXP":101,"IT_LENGTH":102,"IT_MINLENGTH":103,"IT_MAXLENGTH":104,"numericRange":105,"rawNumeric":106,"numericLength":107,"DECIMAL":108,"DOUBLE":109,"string":110,"^^":111,"IT_MININCLUSIVE":112,"IT_MINEXCLUSIVE":113,"IT_MAXINCLUSIVE":114,"IT_MAXEXCLUSIVE":115,"IT_TOTALDIGITS":116,"IT_FRACTIONDIGITS":117,"Q_O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C_E_Star":118,"{":119,"QtripleExpression_E_Opt":120,"}":121,"O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C":122,"extension":123,"extraPropertySet":124,"IT_CLOSED":125,"tripleExpression":126,"IT_EXTRA":127,"Qpredicate_E_Plus":128,"predicate":129,"oneOfTripleExpr":130,"groupTripleExpr":131,"multiElementOneOf":132,"Q_O_QGT_PIPE_E_S_QgroupTripleExpr_E_C_E_Plus":133,"O_QGT_PIPE_E_S_QgroupTripleExpr_E_C":134,"|":135,"singleElementGroup":136,"multiElementGroup":137,"unaryTripleExpr":138,"QGT_SEMI_E_Opt":139,",":140,";":141,"Q_O_QGT_SEMI_E_S_QunaryTripleExpr_E_C_E_Plus":142,"O_QGT_SEMI_E_S_QunaryTripleExpr_E_C":143,"Q_O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C_E_Opt":144,"O_QtripleConstraint_E_Or_QbracketedTripleExpr_E_C":145,"include":146,"O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C":147,"$":148,"tripleExprLabel":149,"tripleConstraint":150,"bracketedTripleExpr":151,"Qcardinality_E_Opt":152,"cardinality":153,"QsenseFlags_E_Opt":154,"senseFlags":155,"*":156,"+":157,"?":158,"REPEAT_RANGE":159,"^":160,"[":161,"QvalueSetValue_E_Star":162,"]":163,"valueSetValue":164,"iriRange":165,"literalRange":166,"languageRange":167,"O_QiriExclusion_E_Plus_Or_QliteralExclusion_E_Plus_Or_QlanguageExclusion_E_Plus_C":168,"QiriExclusion_E_Plus":169,"iriExclusion":170,"QliteralExclusion_E_Plus":171,"literalExclusion":172,"QlanguageExclusion_E_Plus":173,"languageExclusion":174,"Q_O_QGT_TILDE_E_S_QiriExclusion_E_Star_C_E_Opt":175,"QiriExclusion_E_Star":176,"O_QGT_TILDE_E_S_QiriExclusion_E_Star_C":177,"~":178,"-":179,"QGT_TILDE_E_Opt":180,"literal":181,"Q_O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C_E_Opt":182,"QliteralExclusion_E_Star":183,"O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C":184,"LANGTAG":185,"Q_O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C_E_Opt":186,"O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C":187,"QlanguageExclusion_E_Star":188,"&":189,"//":190,"O_Qiri_E_Or_Qliteral_E_C":191,"QcodeDecl_E_Star":192,"%":193,"O_QCODE_E_Or_QGT_MODULO_E_C":194,"CODE":195,"rdfLiteral":196,"numericLiteral":197,"booleanLiteral":198,"a":199,"blankNode":200,"langString":201,"Q_O_QGT_DTYPE_E_S_Qdatatype_E_C_E_Opt":202,"O_QGT_DTYPE_E_S_Qdatatype_E_C":203,"IT_true":204,"IT_false":205,"STRING_LITERAL1":206,"STRING_LITERAL_LONG1":207,"STRING_LITERAL2":208,"STRING_LITERAL_LONG2":209,"LANG_STRING_LITERAL1":210,"LANG_STRING_LITERAL_LONG1":211,"LANG_STRING_LITERAL2":212,"LANG_STRING_LITERAL_LONG2":213,"prefixedName":214,"PNAME_LN":215,"BLANK_NODE_LABEL":216,"O_QIT_EXTENDS_E_Or_QGT_AMP_E_C":217,"IT_EXTENDS":218,"O_QIT_RESTRICTS_E_Or_QGT_MINUS_E_C":219,"IT_RESTRICTS":220,"$accept":0,"$end":1};
  this.terminals_ = {2:"error",7:"EOF",18:"IT_BASE",19:"IRIREF",20:"IT_PREFIX",21:"PNAME_NS",23:"IT_IMPORT",26:"IT_start",27:"=",36:"IT_ABSTRACT",39:"IT_EXTERNAL",43:"IT_NOT",51:"IT_OR",53:"IT_AND",69:"(",70:")",71:".",79:"ATPNAME_LN",80:"ATPNAME_NS",81:"@",85:"IT_LITERAL",96:"IT_IRI",97:"IT_BNODE",98:"IT_NONLITERAL",100:"INTEGER",101:"REGEXP",102:"IT_LENGTH",103:"IT_MINLENGTH",104:"IT_MAXLENGTH",108:"DECIMAL",109:"DOUBLE",111:"^^",112:"IT_MININCLUSIVE",113:"IT_MINEXCLUSIVE",114:"IT_MAXINCLUSIVE",115:"IT_MAXEXCLUSIVE",116:"IT_TOTALDIGITS",117:"IT_FRACTIONDIGITS",119:"{",121:"}",125:"IT_CLOSED",127:"IT_EXTRA",135:"|",140:",",141:";",148:"$",156:"*",157:"+",158:"?",159:"REPEAT_RANGE",160:"^",161:"[",163:"]",178:"~",179:"-",185:"LANGTAG",189:"&",190:"//",193:"%",195:"CODE",199:"a",204:"IT_true",205:"IT_false",206:"STRING_LITERAL1",207:"STRING_LITERAL_LONG1",208:"STRING_LITERAL2",209:"STRING_LITERAL_LONG2",210:"LANG_STRING_LITERAL1",211:"LANG_STRING_LITERAL_LONG1",212:"LANG_STRING_LITERAL2",213:"LANG_STRING_LITERAL_LONG2",215:"PNAME_LN",216:"BLANK_NODE_LABEL",218:"IT_EXTENDS",220:"IT_RESTRICTS"};
  this.productions_ = [0,[3,4],[4,0],[5,0],[5,2],[9,1],[9,1],[12,0],[12,2],[14,2],[6,0],[6,1],[8,1],[8,1],[8,1],[15,2],[16,3],[17,2],[10,1],[10,1],[24,4],[11,1],[30,1],[30,2],[13,1],[13,1],[25,4],[32,0],[32,1],[34,0],[34,2],[35,1],[35,1],[38,3],[38,3],[38,2],[42,0],[42,1],[46,1],[45,1],[45,2],[50,2],[48,1],[48,2],[52,2],[49,1],[49,2],[29,0],[29,2],[47,2],[57,2],[56,0],[56,2],[28,2],[58,0],[58,2],[55,2],[61,2],[60,0],[60,2],[54,2],[40,0],[40,1],[59,2],[62,2],[62,1],[62,2],[62,3],[62,1],[65,0],[65,1],[68,0],[68,1],[41,2],[41,1],[41,2],[41,3],[41,1],[63,2],[63,1],[63,2],[63,3],[63,1],[74,0],[74,1],[77,0],[77,1],[67,1],[67,1],[76,1],[76,1],[44,1],[44,1],[44,2],[66,3],[82,0],[82,2],[64,3],[75,2],[75,2],[75,2],[75,1],[86,0],[86,2],[89,1],[89,2],[73,2],[73,1],[93,0],[93,2],[94,1],[94,2],[92,1],[92,1],[92,1],[90,1],[90,1],[95,2],[95,1],[99,1],[99,1],[99,1],[91,2],[91,2],[106,1],[106,1],[106,1],[106,3],[105,1],[105,1],[105,1],[105,1],[107,1],[107,1],[72,3],[78,4],[122,1],[122,1],[122,1],[118,0],[118,2],[120,0],[120,1],[124,2],[128,1],[128,2],[126,1],[130,1],[130,1],[132,2],[134,2],[133,1],[133,2],[131,1],[131,1],[136,2],[139,0],[139,1],[139,1],[137,3],[143,2],[143,2],[142,1],[142,2],[138,2],[138,1],[147,2],[144,0],[144,1],[145,1],[145,1],[151,6],[152,0],[152,1],[150,6],[154,0],[154,1],[153,1],[153,1],[153,1],[153,1],[155,1],[88,3],[162,0],[162,2],[164,1],[164,1],[164,1],[164,2],[169,1],[169,2],[171,1],[171,2],[173,1],[173,2],[168,1],[168,1],[168,1],[165,2],[176,0],[176,2],[177,2],[175,0],[175,1],[170,3],[180,0],[180,1],[166,2],[183,0],[183,2],[184,2],[182,0],[182,1],[172,3],[167,2],[167,2],[188,0],[188,2],[187,2],[186,0],[186,1],[174,3],[146,2],[84,3],[191,1],[191,1],[83,1],[192,0],[192,2],[31,3],[194,1],[194,1],[181,1],[181,1],[181,1],[129,1],[129,1],[87,1],[33,1],[33,1],[149,1],[149,1],[197,1],[197,1],[197,1],[196,1],[196,2],[203,2],[202,0],[202,1],[198,1],[198,1],[110,1],[110,1],[110,1],[110,1],[201,1],[201,1],[201,1],[201,1],[22,1],[22,1],[214,1],[214,1],[200,1],[123,2],[217,1],[217,1],[37,2],[219,1],[219,1]];
  this.table = [o($V0,[2,2],{3:1,4:2}),{1:[3]},o($V0,[2,3],{5:3}),o($V1,$V2,{6:4,8:5,14:6,15:7,16:8,17:9,9:10,10:14,11:15,24:16,25:17,30:18,32:20,31:21,7:[2,10],18:[1,11],20:[1,12],23:[1,13],26:[1,19],36:$V3,193:$V4}),{7:[1,24]},o($V0,[2,4]),{7:[2,11]},o($V0,$V5),o($V0,$V6),o($V0,$V7),o($V8,[2,7],{12:25}),{19:[1,26]},{21:[1,27]},{19:$V9,21:$Va,22:28,214:30,215:$Vb},o($V8,[2,5]),o($V8,[2,6]),o($V8,$Vc),o($V8,$Vd),o($V8,[2,21],{31:33,193:$V4}),{27:[1,34]},{19:$Ve,21:$Vf,22:36,33:35,200:37,214:39,215:$Vg,216:$Vh},o($V0,[2,22]),o($V1,[2,28]),{19:$Vi,21:$Vj,22:43,214:45,215:$Vk},{1:[2,1]},o($V1,$V2,{13:48,8:49,10:50,15:51,16:52,17:53,24:54,25:55,32:60,7:[2,9],18:[1,56],20:[1,57],23:[1,58],26:[1,59],36:$V3}),o($V0,$Vl),{19:$V9,21:$Va,22:61,214:30,215:$Vb},o($V0,$Vm),o($V0,$Vn),o($V0,$Vo),o($V0,$Vp),o($V0,$Vq),o($V0,[2,23]),o($Vr,$Vs,{28:62,54:63,40:64,43:$Vt}),o($Vu,$Vv,{34:66}),o($Vu,$Vw),o($Vu,$Vx),o($Vu,$Vn),o($Vu,$Vo),o($Vu,$Vy),o($Vu,$Vp),o($Vu,$Vq),{193:[1,69],194:67,195:[1,68]},o($Vz,$Vn),o($Vz,$Vo),o($Vz,$Vp),o($Vz,$Vq),o($V8,[2,8]),o($V8,[2,24]),o($V8,[2,25]),o($V8,$V5),o($V8,$V6),o($V8,$V7),o($V8,$Vc),o($V8,$Vd),{19:[1,70]},{21:[1,71]},{19:$VA,21:$VB,22:72,214:74,215:$VC},{27:[1,77]},{19:$Ve,21:$Vf,22:36,33:78,200:37,214:39,215:$Vg,216:$Vh},o($V0,$VD),o($VE,$VF,{29:79}),o($VG,$VH,{58:80}),o($VI,$VJ,{62:81,64:82,66:83,67:84,73:87,75:88,72:89,44:90,92:91,94:92,87:94,88:95,89:96,78:97,95:104,22:105,91:107,118:108,99:109,214:112,105:113,107:114,19:$VK,21:$VL,69:[1,85],71:[1,86],79:[1,98],80:[1,99],81:[1,100],85:$VM,96:$VN,97:$VO,98:$VP,101:$VQ,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:$V_,215:$V$}),o($Vr,$V01),o($V11,$Vs,{35:126,37:127,38:128,219:130,40:131,44:133,39:[1,129],43:[1,132],79:$V21,80:$V31,81:$V41,179:$V51,220:$V61}),o($V0,$V71),o($V0,$V81),o($V0,$V91),o($V8,$Vl),{19:$VA,21:$VB,22:139,214:74,215:$VC},o($V8,$Vm),o($V8,$Vn),o($V8,$Vo),o($V8,$Vp),o($V8,$Vq),o($Vr,$Vs,{28:140,54:141,40:142,43:$Vt}),o($Vu,$Vv,{34:143}),o($V8,$Va1,{50:144,51:$Vb1}),o($VE,$Vc1,{52:146,53:$Vd1}),o($VG,$Ve1),o($VG,$Vf1,{65:148,67:149,72:150,44:151,78:152,118:156,79:$Vg1,80:$Vh1,81:$Vi1,119:$VJ,125:$VJ,127:$VJ,189:$VJ,218:$VJ}),o($VG,$Vj1),o($VG,$Vk1,{68:157,64:158,73:159,92:160,94:161,95:165,99:166,96:$Vl1,97:$Vm1,98:$Vn1,101:$Vo1,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{38:168,40:169,44:171,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VG,$Vq1),o($Vr1,$Vs1,{82:172}),o($Vt1,$Vs1,{82:173}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:174}),o($Vr1,$Vz1,{99:109,95:175,101:$VQ,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:176}),o($VA1,$VB1,{86:177}),o($VA1,$VB1,{86:178}),o($Vt1,$VC1,{105:113,107:114,91:179,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:180}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,184],21:[1,188],22:182,33:181,200:183,214:185,215:[1,187],216:[1,186]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:189}),o($VN1,$VO1),{119:[1,190],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},{100:[1,199]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,201],106:200,108:[1,202],109:[1,203],110:204,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,209]},{100:[2,119]},{100:[2,120]},{100:[2,121]},o($VA1,$Vp),o($VA1,$Vq),o($VY1,[2,128]),o($VY1,[2,129]),o($VY1,[2,130]),o($VY1,[2,131]),{100:[2,132]},{100:[2,133]},o($V8,$VZ1),o($Vu,[2,30]),o($V8,$V_1),o($V8,$V$1),o($VI,$VJ,{67:210,72:211,44:212,78:213,118:217,79:[1,214],80:[1,215],81:[1,216]}),o($VI,$VJ,{73:87,75:88,92:91,94:92,87:94,88:95,89:96,78:97,95:104,22:105,91:107,118:108,99:109,214:112,105:113,107:114,41:218,64:219,66:220,72:221,19:$VK,21:$VL,69:[1,222],71:[1,223],85:$VM,96:$VN,97:$VO,98:$VP,101:$VQ,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:$V_,215:$V$}),o($V11,$V01,{44:224,79:$Vg1,80:$Vh1,81:$Vi1}),{45:225,48:226,49:227,50:228,51:$Vb1,52:229,53:$Vd1},o($V02,[2,269]),o($V02,[2,270]),o($V12,$VE1),o($V12,$VF1),{19:[1,233],21:[1,237],22:231,33:230,200:232,214:234,215:[1,236],216:[1,235]},o($V8,$VD),o($VE,$VF,{29:238}),o($VG,$VH,{58:239}),o($VI,$VJ,{62:240,64:241,66:242,67:243,73:246,75:247,72:248,44:249,92:250,94:251,87:253,88:254,89:255,78:256,95:263,22:264,91:266,118:267,99:268,214:271,105:272,107:273,19:$V22,21:$V32,69:[1,244],71:[1,245],79:[1,257],80:[1,258],81:[1,259],85:$V42,96:$V52,97:$V62,98:$V72,101:$V82,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:$V92,215:$Va2}),o($V11,$Vs,{37:127,219:130,35:276,38:277,40:279,44:281,39:[1,278],43:[1,280],79:$V21,80:$V31,81:$V41,179:$V51,220:$V61}),o($VE,$Vb2),o($Vr,$Vs,{28:282,54:283,40:284,43:$Vt}),o($VG,$Vc2),o($Vr,$Vs,{54:285,40:286,43:$Vt}),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:287}),o($VG,$VE1),o($VG,$VF1),{19:[1,291],21:[1,295],22:289,33:288,200:290,214:292,215:[1,294],216:[1,293]},{119:[1,296],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:297}),o($Vh2,$Vy1,{93:298}),o($Vt1,$Vz1,{99:166,95:299,101:$Vo1,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,300]},o($Vh2,$VT1),{70:[1,301]},o($VI,$VJ,{41:302,64:303,66:304,72:305,73:308,75:309,78:310,92:311,94:312,87:314,88:315,89:316,118:317,95:321,22:322,91:324,99:325,214:328,105:329,107:330,19:[1,327],21:[1,332],69:[1,306],71:[1,307],85:[1,313],96:[1,318],97:[1,319],98:[1,320],101:$Vi2,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,323],215:[1,331]}),o($V11,$V01,{44:333,79:$Vj2,80:$Vk2,81:$Vl2}),{45:337,48:338,49:339,50:340,51:$Vm2,52:341,53:$Vn2},o($Vo2,$Vp2,{83:344,84:345,192:346,190:[1,347]}),o($Vq2,$Vp2,{83:348,84:349,192:350,190:$Vr2}),o($Vr1,$Vs2,{99:109,95:352,101:$VQ,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vt2),o($Vt1,$Vu2,{90:353,95:354,91:355,99:356,105:358,107:359,101:$Vv2,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vw2,{90:353,95:354,91:355,99:356,105:358,107:359,101:$Vv2,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:353,95:354,91:355,99:356,105:358,107:359,101:$Vv2,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vy2),o($Vz2,$Vp2,{83:360,84:361,192:362,190:[1,363]}),o($Vu1,$VA2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,364],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{120:396,126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,121:$VW2,148:$VX2,189:$VY2}),o($VI,[2,140]),o($VI,[2,136]),o($VI,[2,137]),o($VI,[2,138]),o($VI,$VJ,{67:409,72:410,44:411,78:412,118:416,79:[1,413],80:[1,414],81:[1,415]}),{19:$VZ2,21:$V_2,22:419,128:417,129:418,199:$V$2,214:422,215:$V03},o($V02,[2,266]),o($V02,[2,267]),o($Vx1,$V13),o($VN1,$V23),o($VN1,$V33),o($VN1,$V43),o($VN1,$V53),{111:[1,425]},{111:$V63},{111:$V73},{111:$V83},{111:$V93},o($VN1,$Va3),o($Vu,[2,268]),o($Vu,$Vv1),o($Vu,$Vw1),o($Vb3,$Vs1,{82:426}),o($Vu,$VE1),o($Vu,$VF1),{19:[1,430],21:[1,434],22:428,33:427,200:429,214:431,215:[1,433],216:[1,432]},{119:[1,435],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($V8,$Vc3,{48:226,49:227,50:228,52:229,42:436,45:437,51:$Vb1,53:$Vd1}),o($VG,$Vf1,{67:149,72:150,44:151,78:152,118:156,65:438,79:$Vg1,80:$Vh1,81:$Vi1,119:$VJ,125:$VJ,127:$VJ,189:$VJ,218:$VJ}),o($VG,$Vd3),o($VG,$Vk1,{64:158,73:159,92:160,94:161,95:165,99:166,68:439,96:$Vl1,97:$Vm1,98:$Vn1,101:$Vo1,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:440,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VG,$Ve3),o($V8,$Vc3,{48:226,49:227,50:228,52:229,45:437,42:441,51:$Vb1,53:$Vd1}),o($V8,$Vf3),o($V8,$Vg3,{50:442,51:$Vb1}),o($VE,$VF,{29:443,52:444,53:$Vd1}),o($VE,$Vh3),o($VG,$Vi3),o($V12,$VA2),o($V12,$Vw),o($V12,$Vx),o($V12,$Vn),o($V12,$Vo),o($V12,$Vy),o($V12,$Vp),o($V12,$Vq),o($V8,$Va1,{50:445,51:$Vj3}),o($VE,$Vc1,{52:447,53:$Vk3}),o($VG,$Ve1),o($VG,$Vf1,{65:449,67:450,72:451,44:452,78:453,118:457,79:$Vl3,80:$Vm3,81:$Vn3,119:$VJ,125:$VJ,127:$VJ,189:$VJ,218:$VJ}),o($VG,$Vj1),o($VG,$Vk1,{68:458,64:459,73:460,92:461,94:462,95:466,99:467,96:$Vo3,97:$Vp3,98:$Vq3,101:$Vr3,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:469,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VG,$Vq1),o($Vr1,$Vs1,{82:470}),o($Vt1,$Vs1,{82:471}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:472}),o($Vr1,$Vz1,{99:268,95:473,101:$V82,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:474}),o($VA1,$VB1,{86:475}),o($VA1,$VB1,{86:476}),o($Vt1,$VC1,{105:272,107:273,91:477,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:478}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,482],21:[1,486],22:480,33:479,200:481,214:483,215:[1,485],216:[1,484]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:487}),o($VN1,$VO1),{119:[1,488],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},{100:[1,489]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,491],106:490,108:[1,492],109:[1,493],110:494,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,495]},o($VA1,$Vp),o($VA1,$Vq),o($V8,$VZ1),o($V8,$V_1),o($V8,$V$1),o($VI,$VJ,{73:246,75:247,92:250,94:251,87:253,88:254,89:255,78:256,95:263,22:264,91:266,118:267,99:268,214:271,105:272,107:273,41:496,64:497,66:498,72:499,19:$V22,21:$V32,69:[1,500],71:[1,501],85:$V42,96:$V52,97:$V62,98:$V72,101:$V82,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:$V92,215:$Va2}),o($V11,$V01,{44:502,79:$Vl3,80:$Vm3,81:$Vn3}),{45:503,48:504,49:505,50:506,51:$Vj3,52:507,53:$Vk3},o($VE,$Vs3),o($VG,$VH,{58:508}),o($VI,$VJ,{62:509,64:510,66:511,67:512,73:515,75:516,72:517,44:518,92:519,94:520,87:522,88:523,89:524,78:525,95:532,22:533,91:535,118:536,99:537,214:540,105:541,107:542,19:[1,539],21:[1,544],69:[1,513],71:[1,514],79:[1,526],80:[1,527],81:[1,528],85:[1,521],96:[1,529],97:[1,530],98:[1,531],101:$Vt3,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,534],215:[1,543]}),o($VG,$Vu3),o($VI,$VJ,{62:545,64:546,66:547,67:548,73:551,75:552,72:553,44:554,92:555,94:556,87:558,88:559,89:560,78:561,95:568,22:569,91:571,118:572,99:573,214:576,105:577,107:578,19:[1,575],21:[1,580],69:[1,549],71:[1,550],79:[1,562],80:[1,563],81:[1,564],85:[1,557],96:[1,565],97:[1,566],98:[1,567],101:$Vv3,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,570],215:[1,579]}),o($Vq2,$Vp2,{84:349,192:350,83:581,190:$Vr2}),o($VG,$VA2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:582,121:$VW2,148:$VX2,189:$VY2}),o($Vq2,$Vp2,{84:349,192:350,83:583,190:$Vr2}),o($Vt1,$Vs2,{99:166,95:584,101:$Vo1,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vt2),o($Vh2,$V13),o($VG,$Vw3),{42:585,45:586,48:338,49:339,50:340,51:$Vm2,52:341,53:$Vn2,70:$Vc3},o($VI,$VJ,{65:587,67:588,72:589,44:590,78:591,118:592,51:$Vf1,53:$Vf1,70:$Vf1,79:$Vj2,80:$Vk2,81:$Vl2}),o($Vx3,$Vd3),o($Vx3,$Vk1,{68:593,64:594,73:595,92:596,94:597,95:601,99:602,96:[1,598],97:[1,599],98:[1,600],101:$Vy3,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:604,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($Vx3,$Ve3),o($Vz3,$Vs1,{82:605}),o($VA3,$Vs1,{82:606}),o($VB3,$Vs1,{82:607}),o($VC3,$Vy1,{93:608}),o($Vz3,$Vz1,{99:325,95:609,101:$Vi2,102:$VR,103:$VS,104:$VT}),o($VD3,$VB1,{86:610}),o($VD3,$VB1,{86:611}),o($VD3,$VB1,{86:612}),o($VA3,$VC1,{105:329,107:330,91:613,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),{119:[1,614],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($VC3,$VG1),o($VC3,$VH1),o($VC3,$VI1),o($VC3,$VJ1),o($VD3,$VK1),o($VL1,$VM1,{162:615}),o($VE3,$VO1),{100:[1,616]},o($VC3,$VT1),o($VD3,$Vn),o($VD3,$Vo),{100:[1,618],106:617,108:[1,619],109:[1,620],110:621,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,622]},o($VD3,$Vp),o($VD3,$Vq),{42:623,45:586,48:338,49:339,50:340,51:$Vm2,52:341,53:$Vn2,70:$Vc3},o($Vx3,$VE1),o($Vx3,$VF1),{19:[1,627],21:[1,631],22:625,33:624,200:626,214:628,215:[1,630],216:[1,629]},{70:$Vf3},{50:632,51:$Vm2,70:$Vg3},o($VF3,$VF,{29:633,52:634,53:$Vn2}),o($VF3,$Vh3),o($Vx3,$Vi3),o($Vr,$Vs,{28:635,54:636,40:637,43:$Vt}),o($Vr,$Vs,{54:638,40:639,43:$Vt}),o($VG3,$VH3),o($Vr1,$VI3),o($VG3,$VJ3,{31:640,193:[1,641]}),{19:$VK3,21:$VL3,22:643,129:642,199:$VM3,214:646,215:$VN3},o($VG,$VO3),o($Vt1,$VI3),o($VG,$VJ3,{31:649,193:[1,650]}),{19:$VK3,21:$VL3,22:643,129:651,199:$VM3,214:646,215:$VN3},o($Vx1,$VP3),o($VA1,$VQ3),o($VA1,$VR3),o($VA1,$VS3),{100:[1,652]},o($VA1,$VT1),{100:[1,654],106:653,108:[1,655],109:[1,656],110:657,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,658]},o($Vu1,$VT3),o($VD1,$VI3),o($Vu1,$VJ3,{31:659,193:[1,660]}),{19:$VK3,21:$VL3,22:643,129:661,199:$VM3,214:646,215:$VN3},o($VA1,$VU3),o($VL1,[2,184]),o($VL1,[2,185]),o($VL1,[2,186]),o($VL1,[2,187]),{168:662,169:663,170:666,171:664,172:667,173:665,174:668,179:[1,669]},o($VL1,[2,202],{175:670,177:671,178:[1,672]}),o($VL1,[2,211],{182:673,184:674,178:[1,675]}),o($VL1,[2,219],{186:676,187:677,178:$VV3}),{178:$VV3,187:679},o($VW3,$Vn),o($VW3,$Vo),o($VW3,$VX3),o($VW3,$VY3),o($VW3,$VZ3),o($VW3,$Vp),o($VW3,$Vq),o($VW3,$V_3),o($VW3,$V$3,{202:680,203:681,111:[1,682]}),o($VW3,$V04),o($VW3,$V14),o($VW3,$V24),o($VW3,$V34),o($VW3,$V44),o($VW3,$V54),o($VW3,$V64),o($VW3,$V74),o($VW3,$V84),o($V94,$V63),o($V94,$V73),o($V94,$V83),o($V94,$V93),{121:[1,683]},{121:[2,142]},{121:$Va4},{121:$Vb4,133:684,134:685,135:$Vc4},{121:$Vd4},o($Ve4,$Vf4),o($Ve4,$Vg4),o($Ve4,$Vh4,{139:687,142:688,143:691,140:$Vi4,141:$Vj4}),o($Vk4,$Vl4,{145:692,150:693,151:694,154:695,155:697,69:[1,696],160:$Vm4}),o($Vn4,$Vo4),o($VU2,[2,168]),{19:[1,702],21:[1,706],22:700,149:699,200:701,214:703,215:[1,705],216:[1,704]},{19:[1,710],21:[1,714],22:708,149:707,200:709,214:711,215:[1,713],216:[1,712]},o($VI,[2,265]),o($VI,$Vv1),o($VI,$Vw1),o($Vp4,$Vs1,{82:715}),o($VI,$VE1),o($VI,$VF1),{19:[1,719],21:[1,723],22:717,33:716,200:718,214:720,215:[1,722],216:[1,721]},{119:[1,724],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($VI,[2,143],{22:419,214:422,129:725,19:$VZ2,21:$V_2,199:$V$2,215:$V03}),o($Vq4,[2,144]),o($Vq4,$Vr4),o($Vq4,$Vs4),o($Vq4,$Vn),o($Vq4,$Vo),o($Vq4,$Vp),o($Vq4,$Vq),{19:[1,728],21:[1,731],22:727,87:726,214:729,215:[1,730]},o($Vt4,$Vp2,{83:732,84:733,192:734,190:[1,735]}),o($Vu,$VA2),o($Vu,$Vw),o($Vu,$Vx),o($Vu,$Vn),o($Vu,$Vo),o($Vu,$Vy),o($Vu,$Vp),o($Vu,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:736,121:$VW2,148:$VX2,189:$VY2}),o($V8,$Vu4),o($V8,$Vv4),o($VG,$Vw4),o($VG,$Vx4),{70:[1,737]},o($V8,$Vy4),o($VE,$Vz4),o($V8,$VA4,{50:144,51:$Vb1}),o($VG,$VB4),o($VE,$Vb2),o($Vr,$Vs,{28:738,54:739,40:740,43:$Vt}),o($VG,$Vc2),o($Vr,$Vs,{54:741,40:742,43:$Vt}),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:743}),o($VG,$VE1),o($VG,$VF1),{19:[1,747],21:[1,751],22:745,33:744,200:746,214:748,215:[1,750],216:[1,749]},{119:[1,752],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:753}),o($Vh2,$Vy1,{93:754}),o($Vt1,$Vz1,{99:467,95:755,101:$Vr3,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,756]},o($Vh2,$VT1),{70:[1,757]},o($Vo2,$Vp2,{83:758,84:759,192:760,190:[1,761]}),o($Vq2,$Vp2,{83:762,84:763,192:764,190:$VC4}),o($Vr1,$Vs2,{99:268,95:766,101:$V82,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vt2),o($Vt1,$Vu2,{90:767,95:768,91:769,99:770,105:772,107:773,101:$VD4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vw2,{90:767,95:768,91:769,99:770,105:772,107:773,101:$VD4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:767,95:768,91:769,99:770,105:772,107:773,101:$VD4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vy2),o($Vz2,$Vp2,{83:774,84:775,192:776,190:[1,777]}),o($Vu1,$VA2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,778],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:779,121:$VW2,148:$VX2,189:$VY2}),o($Vx1,$V13),o($VN1,$V23),o($VN1,$V33),o($VN1,$V43),o($VN1,$V53),{111:[1,780]},o($VN1,$Va3),o($V8,$Vc3,{48:504,49:505,50:506,52:507,42:781,45:782,51:$Vj3,53:$Vk3}),o($VG,$Vf1,{67:450,72:451,44:452,78:453,118:457,65:783,79:$Vl3,80:$Vm3,81:$Vn3,119:$VJ,125:$VJ,127:$VJ,189:$VJ,218:$VJ}),o($VG,$Vd3),o($VG,$Vk1,{64:459,73:460,92:461,94:462,95:466,99:467,68:784,96:$Vo3,97:$Vp3,98:$Vq3,101:$Vr3,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:785,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VG,$Ve3),o($V8,$Vc3,{48:504,49:505,50:506,52:507,45:782,42:786,51:$Vj3,53:$Vk3}),o($V8,$Vf3),o($V8,$Vg3,{50:787,51:$Vj3}),o($VE,$VF,{29:788,52:789,53:$Vk3}),o($VE,$Vh3),o($VG,$Vi3),o($VE,$Vc1,{52:790,53:[1,791]}),o($VG,$Ve1),o($VG,$Vf1,{65:792,67:793,72:794,44:795,78:796,118:800,79:[1,797],80:[1,798],81:[1,799],119:$VJ,125:$VJ,127:$VJ,189:$VJ,218:$VJ}),o($VG,$Vj1),o($VG,$Vk1,{68:801,64:802,73:803,92:804,94:805,95:809,99:810,96:[1,806],97:[1,807],98:[1,808],101:$VE4,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:812,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VG,$Vq1),o($Vr1,$Vs1,{82:813}),o($Vt1,$Vs1,{82:814}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:815}),o($Vr1,$Vz1,{99:537,95:816,101:$Vt3,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:817}),o($VA1,$VB1,{86:818}),o($VA1,$VB1,{86:819}),o($Vt1,$VC1,{105:541,107:542,91:820,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:821}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,825],21:[1,829],22:823,33:822,200:824,214:826,215:[1,828],216:[1,827]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:830}),o($VN1,$VO1),{119:[1,831],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},{100:[1,832]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,834],106:833,108:[1,835],109:[1,836],110:837,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,838]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$Ve1),o($VG,$Vf1,{65:839,67:840,72:841,44:842,78:843,118:847,79:[1,844],80:[1,845],81:[1,846],119:$VJ,125:$VJ,127:$VJ,189:$VJ,218:$VJ}),o($VG,$Vj1),o($VG,$Vk1,{68:848,64:849,73:850,92:851,94:852,95:856,99:857,96:[1,853],97:[1,854],98:[1,855],101:$VF4,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:859,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VG,$Vq1),o($Vr1,$Vs1,{82:860}),o($Vt1,$Vs1,{82:861}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:862}),o($Vr1,$Vz1,{99:573,95:863,101:$Vv3,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:864}),o($VA1,$VB1,{86:865}),o($VA1,$VB1,{86:866}),o($Vt1,$VC1,{105:577,107:578,91:867,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:868}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,872],21:[1,876],22:870,33:869,200:871,214:873,215:[1,875],216:[1,874]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:877}),o($VN1,$VO1),{119:[1,878],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},{100:[1,879]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,881],106:880,108:[1,882],109:[1,883],110:884,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,885]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$VT3),{121:[1,886]},o($VG,$VH3),o($Vh2,$VP3),{70:$Vu4},{70:$Vv4},o($Vx3,$Vw4),o($Vx3,$Ve2),o($Vx3,$Vv1),o($Vx3,$Vw1),o($VA3,$Vs1,{82:887}),{119:[1,888],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($Vx3,$Vx4),o($Vx3,$Vg2),o($VA3,$Vs1,{82:889}),o($VG4,$Vy1,{93:890}),o($VA3,$Vz1,{99:602,95:891,101:$Vy3,102:$VR,103:$VS,104:$VT}),o($VG4,$VG1),o($VG4,$VH1),o($VG4,$VI1),o($VG4,$VJ1),{100:[1,892]},o($VG4,$VT1),{70:[1,893]},o($VH4,$Vp2,{83:894,84:895,192:896,190:[1,897]}),o($VI4,$Vp2,{83:898,84:899,192:900,190:$VJ4}),o($VK4,$Vp2,{83:902,84:903,192:904,190:[1,905]}),o($Vz3,$Vs2,{99:325,95:906,101:$Vi2,102:$VR,103:$VS,104:$VT}),o($VC3,$Vt2),o($VA3,$Vu2,{90:907,95:908,91:909,99:910,105:912,107:913,101:$VL4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VA3,$Vw2,{90:907,95:908,91:909,99:910,105:912,107:913,101:$VL4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VA3,$Vx2,{90:907,95:908,91:909,99:910,105:912,107:913,101:$VL4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VE3,$Vy2),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:914,121:$VW2,148:$VX2,189:$VY2}),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,915],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VC3,$V13),o($VE3,$V23),o($VE3,$V33),o($VE3,$V43),o($VE3,$V53),{111:[1,916]},o($VE3,$Va3),{70:$Vy4},o($Vx3,$VA2),o($Vx3,$Vw),o($Vx3,$Vx),o($Vx3,$Vn),o($Vx3,$Vo),o($Vx3,$Vy),o($Vx3,$Vp),o($Vx3,$Vq),o($VF3,$Vz4),{50:917,51:$Vm2,70:$VA4},o($Vx3,$VB4),o($VF3,$Vs3),o($Vx3,$VH,{58:918}),o($VI,$VJ,{62:919,64:920,66:921,67:922,73:925,75:926,72:927,44:928,92:929,94:930,87:932,88:933,89:934,78:935,95:942,22:943,91:945,118:946,99:947,214:950,105:951,107:952,19:[1,949],21:[1,954],69:[1,923],71:[1,924],79:[1,936],80:[1,937],81:[1,938],85:[1,931],96:[1,939],97:[1,940],98:[1,941],101:$VM4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,944],215:[1,953]}),o($Vx3,$Vu3),o($VI,$VJ,{62:955,64:956,66:957,67:958,73:961,75:962,72:963,44:964,92:965,94:966,87:968,88:969,89:970,78:971,95:978,22:979,91:981,118:982,99:983,214:986,105:987,107:988,19:[1,985],21:[1,990],69:[1,959],71:[1,960],79:[1,972],80:[1,973],81:[1,974],85:[1,967],96:[1,975],97:[1,976],98:[1,977],101:$VN4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,980],215:[1,989]}),o($Vo2,$VO4),{19:$Vi,21:$Vj,22:991,214:45,215:$Vk},{19:$VP4,21:$VQ4,22:993,100:[1,1004],108:[1,1005],109:[1,1006],110:1003,181:994,191:992,196:997,197:998,198:999,201:1002,204:[1,1007],205:[1,1008],206:[1,1013],207:[1,1014],208:[1,1015],209:[1,1016],210:[1,1009],211:[1,1010],212:[1,1011],213:[1,1012],214:996,215:$VR4},o($VS4,$Vr4),o($VS4,$Vs4),o($VS4,$Vn),o($VS4,$Vo),o($VS4,$Vp),o($VS4,$Vq),o($Vq2,$VO4),{19:$Vi,21:$Vj,22:1017,214:45,215:$Vk},{19:$VT4,21:$VU4,22:1019,100:[1,1030],108:[1,1031],109:[1,1032],110:1029,181:1020,191:1018,196:1023,197:1024,198:1025,201:1028,204:[1,1033],205:[1,1034],206:[1,1039],207:[1,1040],208:[1,1041],209:[1,1042],210:[1,1035],211:[1,1036],212:[1,1037],213:[1,1038],214:1022,215:$VV4},o($VA1,$V13),o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),{111:[1,1043]},o($VA1,$Va3),o($Vz2,$VO4),{19:$Vi,21:$Vj,22:1044,214:45,215:$Vk},{19:$VW4,21:$VX4,22:1046,100:[1,1057],108:[1,1058],109:[1,1059],110:1056,181:1047,191:1045,196:1050,197:1051,198:1052,201:1055,204:[1,1060],205:[1,1061],206:[1,1066],207:[1,1067],208:[1,1068],209:[1,1069],210:[1,1062],211:[1,1063],212:[1,1064],213:[1,1065],214:1049,215:$VY4},o($VL1,[2,188]),o($VL1,[2,195],{170:1070,179:$VZ4}),o($VL1,[2,196],{172:1072,179:$V_4}),o($VL1,[2,197],{174:1074,179:$V$4}),o($V05,[2,189]),o($V05,[2,191]),o($V05,[2,193]),{19:$V15,21:$V25,22:1076,100:$V35,108:$V45,109:$V55,110:1087,181:1077,185:$V65,196:1081,197:1082,198:1083,201:1086,204:$V75,205:$V85,206:$V95,207:$Va5,208:$Vb5,209:$Vc5,210:$Vd5,211:$Ve5,212:$Vf5,213:$Vg5,214:1080,215:$Vh5},o($VL1,[2,198]),o($VL1,[2,203]),o($V05,[2,199],{176:1101}),o($VL1,[2,207]),o($VL1,[2,212]),o($V05,[2,208],{183:1102}),o($VL1,[2,214]),o($VL1,[2,220]),o($V05,[2,216],{188:1103}),o($VL1,[2,215]),o($VW3,$Vi5),o($VW3,$Vj5),{19:$VB2,21:$VC2,22:1105,87:1104,214:375,215:$VT2},o($VD1,$Vk5),{121:$Vl5,134:1106,135:$Vc4},o($Ve4,$Vm5),o($VU2,$VV2,{136:401,137:402,138:403,144:404,146:405,147:406,131:1107,148:$VX2,189:$VY2}),o($Ve4,$Vn5),o($Ve4,$Vh4,{139:1108,143:1109,140:$Vi4,141:$Vj4}),o($VU2,$VV2,{144:404,146:405,147:406,138:1110,121:$Vo5,135:$Vo5,148:$VX2,189:$VY2}),o($VU2,$VV2,{144:404,146:405,147:406,138:1111,121:$Vp5,135:$Vp5,148:$VX2,189:$VY2}),o($Vn4,$Vq5),o($Vn4,$Vr5),o($Vn4,$Vs5),o($Vn4,$Vt5),{19:$Vu5,21:$Vv5,22:1113,129:1112,199:$Vw5,214:1116,215:$Vx5},o($VU2,$VV2,{147:406,126:1119,130:1120,131:1121,132:1122,136:1123,137:1124,138:1125,144:1126,146:1127,148:$VX2,189:$Vy5}),o($Vk4,[2,176]),o($Vk4,[2,181]),o($Vn4,$Vz5),o($Vn4,$VA5),o($Vn4,$VB5),o($Vn4,$Vn),o($Vn4,$Vo),o($Vn4,$Vy),o($Vn4,$Vp),o($Vn4,$Vq),o($VU2,[2,166]),o($VU2,$VA5),o($VU2,$VB5),o($VU2,$Vn),o($VU2,$Vo),o($VU2,$Vy),o($VU2,$Vp),o($VU2,$Vq),o($VC5,$Vp2,{83:1129,84:1130,192:1131,190:[1,1132]}),o($VI,$VA2),o($VI,$Vw),o($VI,$Vx),o($VI,$Vn),o($VI,$Vo),o($VI,$Vy),o($VI,$Vp),o($VI,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:1133,121:$VW2,148:$VX2,189:$VY2}),o($Vq4,[2,145]),o($VN1,$VD5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($Vu,$VT3),o($Vb3,$VI3),o($Vu,$VJ3,{31:1134,193:[1,1135]}),{19:$VK3,21:$VL3,22:643,129:1136,199:$VM3,214:646,215:$VN3},{121:[1,1137]},o($VG,$VE5),o($VE,$Vs3),o($VG,$VH,{58:1138}),o($VI,$VJ,{62:1139,64:1140,66:1141,67:1142,73:1145,75:1146,72:1147,44:1148,92:1149,94:1150,87:1152,88:1153,89:1154,78:1155,95:1162,22:1163,91:1165,118:1166,99:1167,214:1170,105:1171,107:1172,19:[1,1169],21:[1,1174],69:[1,1143],71:[1,1144],79:[1,1156],80:[1,1157],81:[1,1158],85:[1,1151],96:[1,1159],97:[1,1160],98:[1,1161],101:$VF5,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,1164],215:[1,1173]}),o($VG,$Vu3),o($VI,$VJ,{62:1175,64:1176,66:1177,67:1178,73:1181,75:1182,72:1183,44:1184,92:1185,94:1186,87:1188,88:1189,89:1190,78:1191,95:1198,22:1199,91:1201,118:1202,99:1203,214:1206,105:1207,107:1208,19:[1,1205],21:[1,1210],69:[1,1179],71:[1,1180],79:[1,1192],80:[1,1193],81:[1,1194],85:[1,1187],96:[1,1195],97:[1,1196],98:[1,1197],101:$VG5,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,1200],215:[1,1209]}),o($Vq2,$Vp2,{84:763,192:764,83:1211,190:$VC4}),o($VG,$VA2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:1212,121:$VW2,148:$VX2,189:$VY2}),o($Vq2,$Vp2,{84:763,192:764,83:1213,190:$VC4}),o($Vt1,$Vs2,{99:467,95:1214,101:$Vr3,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vt2),o($Vh2,$V13),o($VG,$Vw3),o($VG3,$VH3),o($Vr1,$VI3),o($VG3,$VJ3,{31:1215,193:[1,1216]}),{19:$VK3,21:$VL3,22:643,129:1217,199:$VM3,214:646,215:$VN3},o($VG,$VO3),o($Vt1,$VI3),o($VG,$VJ3,{31:1218,193:[1,1219]}),{19:$VK3,21:$VL3,22:643,129:1220,199:$VM3,214:646,215:$VN3},o($Vx1,$VP3),o($VA1,$VQ3),o($VA1,$VR3),o($VA1,$VS3),{100:[1,1221]},o($VA1,$VT1),{100:[1,1223],106:1222,108:[1,1224],109:[1,1225],110:1226,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1227]},o($Vu1,$VT3),o($VD1,$VI3),o($Vu1,$VJ3,{31:1228,193:[1,1229]}),{19:$VK3,21:$VL3,22:643,129:1230,199:$VM3,214:646,215:$VN3},o($VA1,$VU3),{121:[1,1231]},{19:[1,1234],21:[1,1237],22:1233,87:1232,214:1235,215:[1,1236]},o($V8,$Vu4),o($V8,$Vv4),o($VG,$Vw4),o($VG,$Vx4),{70:[1,1238]},o($V8,$Vy4),o($VE,$Vz4),o($V8,$VA4,{50:445,51:$Vj3}),o($VG,$VB4),o($VG,$Vc2),o($Vr,$Vs,{54:1239,40:1240,43:$Vt}),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:1241}),o($VG,$VE1),o($VG,$VF1),{19:[1,1245],21:[1,1249],22:1243,33:1242,200:1244,214:1246,215:[1,1248],216:[1,1247]},{119:[1,1250],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:1251}),o($Vh2,$Vy1,{93:1252}),o($Vt1,$Vz1,{99:810,95:1253,101:$VE4,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,1254]},o($Vh2,$VT1),{70:[1,1255]},o($Vo2,$Vp2,{83:1256,84:1257,192:1258,190:[1,1259]}),o($Vq2,$Vp2,{83:1260,84:1261,192:1262,190:$VH5}),o($Vr1,$Vs2,{99:537,95:1264,101:$Vt3,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vt2),o($Vt1,$Vu2,{90:1265,95:1266,91:1267,99:1268,105:1270,107:1271,101:$VI5,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vw2,{90:1265,95:1266,91:1267,99:1268,105:1270,107:1271,101:$VI5,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:1265,95:1266,91:1267,99:1268,105:1270,107:1271,101:$VI5,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vy2),o($Vz2,$Vp2,{83:1272,84:1273,192:1274,190:[1,1275]}),o($Vu1,$VA2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,1276],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:1277,121:$VW2,148:$VX2,189:$VY2}),o($Vx1,$V13),o($VN1,$V23),o($VN1,$V33),o($VN1,$V43),o($VN1,$V53),{111:[1,1278]},o($VN1,$Va3),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:1279}),o($VG,$VE1),o($VG,$VF1),{19:[1,1283],21:[1,1287],22:1281,33:1280,200:1282,214:1284,215:[1,1286],216:[1,1285]},{119:[1,1288],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:1289}),o($Vh2,$Vy1,{93:1290}),o($Vt1,$Vz1,{99:857,95:1291,101:$VF4,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,1292]},o($Vh2,$VT1),{70:[1,1293]},o($Vo2,$Vp2,{83:1294,84:1295,192:1296,190:[1,1297]}),o($Vq2,$Vp2,{83:1298,84:1299,192:1300,190:$VJ5}),o($Vr1,$Vs2,{99:573,95:1302,101:$Vv3,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vt2),o($Vt1,$Vu2,{90:1303,95:1304,91:1305,99:1306,105:1308,107:1309,101:$VK5,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vw2,{90:1303,95:1304,91:1305,99:1306,105:1308,107:1309,101:$VK5,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:1303,95:1304,91:1305,99:1306,105:1308,107:1309,101:$VK5,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vy2),o($Vz2,$Vp2,{83:1310,84:1311,192:1312,190:[1,1313]}),o($Vu1,$VA2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,1314],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:1315,121:$VW2,148:$VX2,189:$VY2}),o($Vx1,$V13),o($VN1,$V23),o($VN1,$V33),o($VN1,$V43),o($VN1,$V53),{111:[1,1316]},o($VN1,$Va3),o($Vt1,$Vk5),o($VI4,$Vp2,{84:899,192:900,83:1317,190:$VJ4}),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:1318,121:$VW2,148:$VX2,189:$VY2}),o($VI4,$Vp2,{84:899,192:900,83:1319,190:$VJ4}),o($VA3,$Vs2,{99:602,95:1320,101:$Vy3,102:$VR,103:$VS,104:$VT}),o($VG4,$Vt2),o($VG4,$V13),o($Vx3,$VE5),o($VL5,$VH3),o($Vz3,$VI3),o($VL5,$VJ3,{31:1321,193:[1,1322]}),{19:$VK3,21:$VL3,22:643,129:1323,199:$VM3,214:646,215:$VN3},o($Vx3,$VO3),o($VA3,$VI3),o($Vx3,$VJ3,{31:1324,193:[1,1325]}),{19:$VK3,21:$VL3,22:643,129:1326,199:$VM3,214:646,215:$VN3},o($VM5,$VT3),o($VB3,$VI3),o($VM5,$VJ3,{31:1327,193:[1,1328]}),{19:$VK3,21:$VL3,22:643,129:1329,199:$VM3,214:646,215:$VN3},o($VC3,$VP3),o($VD3,$VQ3),o($VD3,$VR3),o($VD3,$VS3),{100:[1,1330]},o($VD3,$VT1),{100:[1,1332],106:1331,108:[1,1333],109:[1,1334],110:1335,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1336]},{121:[1,1337]},o($VD3,$VU3),{19:[1,1340],21:[1,1343],22:1339,87:1338,214:1341,215:[1,1342]},o($VF3,$Vb2),o($VF3,$Vc1,{52:1344,53:[1,1345]}),o($Vx3,$Ve1),o($VI,$VJ,{65:1346,67:1347,72:1348,44:1349,78:1350,118:1354,51:$Vf1,53:$Vf1,70:$Vf1,79:[1,1351],80:[1,1352],81:[1,1353]}),o($Vx3,$Vj1),o($Vx3,$Vk1,{68:1355,64:1356,73:1357,92:1358,94:1359,95:1363,99:1364,96:[1,1360],97:[1,1361],98:[1,1362],101:$VN5,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:1366,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($Vx3,$Vq1),o($Vz3,$Vs1,{82:1367}),o($VA3,$Vs1,{82:1368}),o($VM5,$Vv1),o($VM5,$Vw1),o($VC3,$Vy1,{93:1369}),o($Vz3,$Vz1,{99:947,95:1370,101:$VM4,102:$VR,103:$VS,104:$VT}),o($VD3,$VB1,{86:1371}),o($VD3,$VB1,{86:1372}),o($VD3,$VB1,{86:1373}),o($VA3,$VC1,{105:951,107:952,91:1374,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VB3,$Vs1,{82:1375}),o($VM5,$VE1),o($VM5,$VF1),{19:[1,1379],21:[1,1383],22:1377,33:1376,200:1378,214:1380,215:[1,1382],216:[1,1381]},o($VC3,$VG1),o($VC3,$VH1),o($VC3,$VI1),o($VC3,$VJ1),o($VD3,$VK1),o($VL1,$VM1,{162:1384}),o($VE3,$VO1),{119:[1,1385],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},{100:[1,1386]},o($VC3,$VT1),o($VD3,$Vn),o($VD3,$Vo),{100:[1,1388],106:1387,108:[1,1389],109:[1,1390],110:1391,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1392]},o($VD3,$Vp),o($VD3,$Vq),o($Vx3,$Ve1),o($VI,$VJ,{65:1393,67:1394,72:1395,44:1396,78:1397,118:1401,51:$Vf1,53:$Vf1,70:$Vf1,79:[1,1398],80:[1,1399],81:[1,1400]}),o($Vx3,$Vj1),o($Vx3,$Vk1,{68:1402,64:1403,73:1404,92:1405,94:1406,95:1410,99:1411,96:[1,1407],97:[1,1408],98:[1,1409],101:$VO5,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:1413,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($Vx3,$Vq1),o($Vz3,$Vs1,{82:1414}),o($VA3,$Vs1,{82:1415}),o($VM5,$Vv1),o($VM5,$Vw1),o($VC3,$Vy1,{93:1416}),o($Vz3,$Vz1,{99:983,95:1417,101:$VN4,102:$VR,103:$VS,104:$VT}),o($VD3,$VB1,{86:1418}),o($VD3,$VB1,{86:1419}),o($VD3,$VB1,{86:1420}),o($VA3,$VC1,{105:987,107:988,91:1421,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VB3,$Vs1,{82:1422}),o($VM5,$VE1),o($VM5,$VF1),{19:[1,1426],21:[1,1430],22:1424,33:1423,200:1425,214:1427,215:[1,1429],216:[1,1428]},o($VC3,$VG1),o($VC3,$VH1),o($VC3,$VI1),o($VC3,$VJ1),o($VD3,$VK1),o($VL1,$VM1,{162:1431}),o($VE3,$VO1),{119:[1,1432],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},{100:[1,1433]},o($VC3,$VT1),o($VD3,$Vn),o($VD3,$Vo),{100:[1,1435],106:1434,108:[1,1436],109:[1,1437],110:1438,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1439]},o($VD3,$Vp),o($VD3,$Vq),{193:[1,1442],194:1440,195:[1,1441]},o($Vr1,$VP5),o($Vr1,$VQ5),o($Vr1,$VR5),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VX3),o($Vr1,$VY3),o($Vr1,$VZ3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V_3),o($Vr1,$V$3,{202:1443,203:1444,111:[1,1445]}),o($Vr1,$V04),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($VS5,$V63),o($VS5,$V73),o($VS5,$V83),o($VS5,$V93),{193:[1,1448],194:1446,195:[1,1447]},o($Vt1,$VP5),o($Vt1,$VQ5),o($Vt1,$VR5),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VX3),o($Vt1,$VY3),o($Vt1,$VZ3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V_3),o($Vt1,$V$3,{202:1449,203:1450,111:[1,1451]}),o($Vt1,$V04),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($VT5,$V63),o($VT5,$V73),o($VT5,$V83),o($VT5,$V93),{19:[1,1454],21:[1,1457],22:1453,87:1452,214:1455,215:[1,1456]},{193:[1,1460],194:1458,195:[1,1459]},o($VD1,$VP5),o($VD1,$VQ5),o($VD1,$VR5),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VX3),o($VD1,$VY3),o($VD1,$VZ3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V_3),o($VD1,$V$3,{202:1461,203:1462,111:[1,1463]}),o($VD1,$V04),o($VD1,$V14),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VU5,$V63),o($VU5,$V73),o($VU5,$V83),o($VU5,$V93),o($V05,[2,190]),{19:$V15,21:$V25,22:1076,214:1080,215:$Vh5},o($V05,[2,192]),{100:$V35,108:$V45,109:$V55,110:1087,181:1077,196:1081,197:1082,198:1083,201:1086,204:$V75,205:$V85,206:$V95,207:$Va5,208:$Vb5,209:$Vc5,210:$Vd5,211:$Ve5,212:$Vf5,213:$Vg5},o($V05,[2,194]),{185:$V65},o($V05,$VV5,{180:1464,178:$VW5}),o($V05,$VV5,{180:1466,178:$VW5}),o($V05,$VV5,{180:1467,178:$VW5}),o($VX5,$Vn),o($VX5,$Vo),o($VX5,$VX3),o($VX5,$VY3),o($VX5,$VZ3),o($VX5,$Vp),o($VX5,$Vq),o($VX5,$V_3),o($VX5,$V$3,{202:1468,203:1469,111:[1,1470]}),o($VX5,$V04),o($VX5,$V14),o($VX5,$V24),o($VX5,$V34),o($VX5,$V44),o($VX5,$V54),o($VX5,$V64),o($VX5,$V74),o($VX5,$V84),o($VY5,$V63),o($VY5,$V73),o($VY5,$V83),o($VY5,$V93),o($VL1,[2,201],{170:1471,179:$VZ4}),o($VL1,[2,210],{172:1472,179:$V_4}),o($VL1,[2,218],{174:1473,179:$V$4}),o($VW3,$VZ5),o($VW3,$VK1),o($Ve4,$V_5),o($Ve4,$V$5),o($Ve4,$V06),o($Vn4,$V16),o($Vn4,$V26),o($Vn4,$V36),o($Vr,$Vs,{46:1474,47:1475,55:1476,59:1477,40:1478,43:$Vt}),o($V46,$Vr4),o($V46,$Vs4),o($V46,$Vn),o($V46,$Vo),o($V46,$Vp),o($V46,$Vq),{70:[1,1479]},{70:$Va4},{70:$Vb4,133:1480,134:1481,135:$V56},{70:$Vd4},o($V66,$Vf4),o($V66,$Vg4),o($V66,$Vh4,{139:1483,142:1484,143:1487,140:$V76,141:$V86}),o($Vk4,$Vl4,{155:697,145:1488,150:1489,151:1490,154:1491,69:[1,1492],160:$Vm4}),o($V96,$Vo4),{19:[1,1496],21:[1,1500],22:1494,149:1493,200:1495,214:1497,215:[1,1499],216:[1,1498]},o($VI,$VT3),o($Vp4,$VI3),o($VI,$VJ3,{31:1501,193:[1,1502]}),{19:$VK3,21:$VL3,22:643,129:1503,199:$VM3,214:646,215:$VN3},{121:[1,1504]},o($Vt4,$VO4),{19:$Vi,21:$Vj,22:1505,214:45,215:$Vk},{19:$Va6,21:$Vb6,22:1507,100:[1,1518],108:[1,1519],109:[1,1520],110:1517,181:1508,191:1506,196:1511,197:1512,198:1513,201:1516,204:[1,1521],205:[1,1522],206:[1,1527],207:[1,1528],208:[1,1529],209:[1,1530],210:[1,1523],211:[1,1524],212:[1,1525],213:[1,1526],214:1510,215:$Vc6},o($Vb3,$Vk5),o($VE,$Vc1,{52:1531,53:[1,1532]}),o($VG,$Ve1),o($VG,$Vf1,{65:1533,67:1534,72:1535,44:1536,78:1537,118:1541,79:[1,1538],80:[1,1539],81:[1,1540],119:$VJ,125:$VJ,127:$VJ,189:$VJ,218:$VJ}),o($VG,$Vj1),o($VG,$Vk1,{68:1542,64:1543,73:1544,92:1545,94:1546,95:1550,99:1551,96:[1,1547],97:[1,1548],98:[1,1549],101:$Vd6,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:1553,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VG,$Vq1),o($Vr1,$Vs1,{82:1554}),o($Vt1,$Vs1,{82:1555}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:1556}),o($Vr1,$Vz1,{99:1167,95:1557,101:$VF5,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:1558}),o($VA1,$VB1,{86:1559}),o($VA1,$VB1,{86:1560}),o($Vt1,$VC1,{105:1171,107:1172,91:1561,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:1562}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,1566],21:[1,1570],22:1564,33:1563,200:1565,214:1567,215:[1,1569],216:[1,1568]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:1571}),o($VN1,$VO1),{119:[1,1572],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},{100:[1,1573]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,1575],106:1574,108:[1,1576],109:[1,1577],110:1578,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1579]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$Ve1),o($VG,$Vf1,{65:1580,67:1581,72:1582,44:1583,78:1584,118:1588,79:[1,1585],80:[1,1586],81:[1,1587],119:$VJ,125:$VJ,127:$VJ,189:$VJ,218:$VJ}),o($VG,$Vj1),o($VG,$Vk1,{68:1589,64:1590,73:1591,92:1592,94:1593,95:1597,99:1598,96:[1,1594],97:[1,1595],98:[1,1596],101:$Ve6,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:1600,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VG,$Vq1),o($Vr1,$Vs1,{82:1601}),o($Vt1,$Vs1,{82:1602}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:1603}),o($Vr1,$Vz1,{99:1203,95:1604,101:$VG5,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:1605}),o($VA1,$VB1,{86:1606}),o($VA1,$VB1,{86:1607}),o($Vt1,$VC1,{105:1207,107:1208,91:1608,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:1609}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,1613],21:[1,1617],22:1611,33:1610,200:1612,214:1614,215:[1,1616],216:[1,1615]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:1618}),o($VN1,$VO1),{119:[1,1619],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},{100:[1,1620]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,1622],106:1621,108:[1,1623],109:[1,1624],110:1625,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1626]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$VT3),{121:[1,1627]},o($VG,$VH3),o($Vh2,$VP3),o($Vo2,$VO4),{19:$Vi,21:$Vj,22:1628,214:45,215:$Vk},{19:$Vf6,21:$Vg6,22:1630,100:[1,1641],108:[1,1642],109:[1,1643],110:1640,181:1631,191:1629,196:1634,197:1635,198:1636,201:1639,204:[1,1644],205:[1,1645],206:[1,1650],207:[1,1651],208:[1,1652],209:[1,1653],210:[1,1646],211:[1,1647],212:[1,1648],213:[1,1649],214:1633,215:$Vh6},o($Vq2,$VO4),{19:$Vi,21:$Vj,22:1654,214:45,215:$Vk},{19:$Vi6,21:$Vj6,22:1656,100:[1,1667],108:[1,1668],109:[1,1669],110:1666,181:1657,191:1655,196:1660,197:1661,198:1662,201:1665,204:[1,1670],205:[1,1671],206:[1,1676],207:[1,1677],208:[1,1678],209:[1,1679],210:[1,1672],211:[1,1673],212:[1,1674],213:[1,1675],214:1659,215:$Vk6},o($VA1,$V13),o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),{111:[1,1680]},o($VA1,$Va3),o($Vz2,$VO4),{19:$Vi,21:$Vj,22:1681,214:45,215:$Vk},{19:$Vl6,21:$Vm6,22:1683,100:[1,1694],108:[1,1695],109:[1,1696],110:1693,181:1684,191:1682,196:1687,197:1688,198:1689,201:1692,204:[1,1697],205:[1,1698],206:[1,1703],207:[1,1704],208:[1,1705],209:[1,1706],210:[1,1699],211:[1,1700],212:[1,1701],213:[1,1702],214:1686,215:$Vn6},o($VD1,$Vk5),o($VN1,$VD5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($VG,$VE5),o($VG,$Vu3),o($VI,$VJ,{62:1707,64:1708,66:1709,67:1710,73:1713,75:1714,72:1715,44:1716,92:1717,94:1718,87:1720,88:1721,89:1722,78:1723,95:1730,22:1731,91:1733,118:1734,99:1735,214:1738,105:1739,107:1740,19:[1,1737],21:[1,1742],69:[1,1711],71:[1,1712],79:[1,1724],80:[1,1725],81:[1,1726],85:[1,1719],96:[1,1727],97:[1,1728],98:[1,1729],101:$Vo6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,1732],215:[1,1741]}),o($Vq2,$Vp2,{84:1261,192:1262,83:1743,190:$VH5}),o($VG,$VA2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:1744,121:$VW2,148:$VX2,189:$VY2}),o($Vq2,$Vp2,{84:1261,192:1262,83:1745,190:$VH5}),o($Vt1,$Vs2,{99:810,95:1746,101:$VE4,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vt2),o($Vh2,$V13),o($VG,$Vw3),o($VG3,$VH3),o($Vr1,$VI3),o($VG3,$VJ3,{31:1747,193:[1,1748]}),{19:$VK3,21:$VL3,22:643,129:1749,199:$VM3,214:646,215:$VN3},o($VG,$VO3),o($Vt1,$VI3),o($VG,$VJ3,{31:1750,193:[1,1751]}),{19:$VK3,21:$VL3,22:643,129:1752,199:$VM3,214:646,215:$VN3},o($Vx1,$VP3),o($VA1,$VQ3),o($VA1,$VR3),o($VA1,$VS3),{100:[1,1753]},o($VA1,$VT1),{100:[1,1755],106:1754,108:[1,1756],109:[1,1757],110:1758,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1759]},o($Vu1,$VT3),o($VD1,$VI3),o($Vu1,$VJ3,{31:1760,193:[1,1761]}),{19:$VK3,21:$VL3,22:643,129:1762,199:$VM3,214:646,215:$VN3},o($VA1,$VU3),{121:[1,1763]},{19:[1,1766],21:[1,1769],22:1765,87:1764,214:1767,215:[1,1768]},o($Vq2,$Vp2,{84:1299,192:1300,83:1770,190:$VJ5}),o($VG,$VA2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:1771,121:$VW2,148:$VX2,189:$VY2}),o($Vq2,$Vp2,{84:1299,192:1300,83:1772,190:$VJ5}),o($Vt1,$Vs2,{99:857,95:1773,101:$VF4,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vt2),o($Vh2,$V13),o($VG,$Vw3),o($VG3,$VH3),o($Vr1,$VI3),o($VG3,$VJ3,{31:1774,193:[1,1775]}),{19:$VK3,21:$VL3,22:643,129:1776,199:$VM3,214:646,215:$VN3},o($VG,$VO3),o($Vt1,$VI3),o($VG,$VJ3,{31:1777,193:[1,1778]}),{19:$VK3,21:$VL3,22:643,129:1779,199:$VM3,214:646,215:$VN3},o($Vx1,$VP3),o($VA1,$VQ3),o($VA1,$VR3),o($VA1,$VS3),{100:[1,1780]},o($VA1,$VT1),{100:[1,1782],106:1781,108:[1,1783],109:[1,1784],110:1785,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1786]},o($Vu1,$VT3),o($VD1,$VI3),o($Vu1,$VJ3,{31:1787,193:[1,1788]}),{19:$VK3,21:$VL3,22:643,129:1789,199:$VM3,214:646,215:$VN3},o($VA1,$VU3),{121:[1,1790]},{19:[1,1793],21:[1,1796],22:1792,87:1791,214:1794,215:[1,1795]},o($Vx3,$VT3),{121:[1,1797]},o($Vx3,$VH3),o($VG4,$VP3),o($VH4,$VO4),{19:$Vi,21:$Vj,22:1798,214:45,215:$Vk},{19:$Vp6,21:$Vq6,22:1800,100:[1,1811],108:[1,1812],109:[1,1813],110:1810,181:1801,191:1799,196:1804,197:1805,198:1806,201:1809,204:[1,1814],205:[1,1815],206:[1,1820],207:[1,1821],208:[1,1822],209:[1,1823],210:[1,1816],211:[1,1817],212:[1,1818],213:[1,1819],214:1803,215:$Vr6},o($VI4,$VO4),{19:$Vi,21:$Vj,22:1824,214:45,215:$Vk},{19:$Vs6,21:$Vt6,22:1826,100:[1,1837],108:[1,1838],109:[1,1839],110:1836,181:1827,191:1825,196:1830,197:1831,198:1832,201:1835,204:[1,1840],205:[1,1841],206:[1,1846],207:[1,1847],208:[1,1848],209:[1,1849],210:[1,1842],211:[1,1843],212:[1,1844],213:[1,1845],214:1829,215:$Vu6},o($VK4,$VO4),{19:$Vi,21:$Vj,22:1850,214:45,215:$Vk},{19:$Vv6,21:$Vw6,22:1852,100:[1,1863],108:[1,1864],109:[1,1865],110:1862,181:1853,191:1851,196:1856,197:1857,198:1858,201:1861,204:[1,1866],205:[1,1867],206:[1,1872],207:[1,1873],208:[1,1874],209:[1,1875],210:[1,1868],211:[1,1869],212:[1,1870],213:[1,1871],214:1855,215:$Vx6},o($VD3,$V13),o($VD3,$V23),o($VD3,$V33),o($VD3,$V43),o($VD3,$V53),{111:[1,1876]},o($VD3,$Va3),o($VB3,$Vk5),o($VE3,$VD5),o($VE3,$VK1),o($VE3,$Vn),o($VE3,$Vo),o($VE3,$Vp),o($VE3,$Vq),o($Vx3,$Vc2),o($Vr,$Vs,{54:1877,40:1878,43:$Vt}),o($Vx3,$Vd2),o($Vx3,$Ve2),o($Vx3,$Vv1),o($Vx3,$Vw1),o($VA3,$Vs1,{82:1879}),o($Vx3,$VE1),o($Vx3,$VF1),{19:[1,1883],21:[1,1887],22:1881,33:1880,200:1882,214:1884,215:[1,1886],216:[1,1885]},{119:[1,1888],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($Vx3,$Vf2),o($Vx3,$Vg2),o($VA3,$Vs1,{82:1889}),o($VG4,$Vy1,{93:1890}),o($VA3,$Vz1,{99:1364,95:1891,101:$VN5,102:$VR,103:$VS,104:$VT}),o($VG4,$VG1),o($VG4,$VH1),o($VG4,$VI1),o($VG4,$VJ1),{100:[1,1892]},o($VG4,$VT1),{70:[1,1893]},o($VH4,$Vp2,{83:1894,84:1895,192:1896,190:[1,1897]}),o($VI4,$Vp2,{83:1898,84:1899,192:1900,190:$Vy6}),o($Vz3,$Vs2,{99:947,95:1902,101:$VM4,102:$VR,103:$VS,104:$VT}),o($VC3,$Vt2),o($VA3,$Vu2,{90:1903,95:1904,91:1905,99:1906,105:1908,107:1909,101:$Vz6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VA3,$Vw2,{90:1903,95:1904,91:1905,99:1906,105:1908,107:1909,101:$Vz6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VA3,$Vx2,{90:1903,95:1904,91:1905,99:1906,105:1908,107:1909,101:$Vz6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VE3,$Vy2),o($VK4,$Vp2,{83:1910,84:1911,192:1912,190:[1,1913]}),o($VM5,$VA2),o($VM5,$Vw),o($VM5,$Vx),o($VM5,$Vn),o($VM5,$Vo),o($VM5,$Vy),o($VM5,$Vp),o($VM5,$Vq),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,1914],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:1915,121:$VW2,148:$VX2,189:$VY2}),o($VC3,$V13),o($VE3,$V23),o($VE3,$V33),o($VE3,$V43),o($VE3,$V53),{111:[1,1916]},o($VE3,$Va3),o($Vx3,$Vd2),o($Vx3,$Ve2),o($Vx3,$Vv1),o($Vx3,$Vw1),o($VA3,$Vs1,{82:1917}),o($Vx3,$VE1),o($Vx3,$VF1),{19:[1,1921],21:[1,1925],22:1919,33:1918,200:1920,214:1922,215:[1,1924],216:[1,1923]},{119:[1,1926],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($Vx3,$Vf2),o($Vx3,$Vg2),o($VA3,$Vs1,{82:1927}),o($VG4,$Vy1,{93:1928}),o($VA3,$Vz1,{99:1411,95:1929,101:$VO5,102:$VR,103:$VS,104:$VT}),o($VG4,$VG1),o($VG4,$VH1),o($VG4,$VI1),o($VG4,$VJ1),{100:[1,1930]},o($VG4,$VT1),{70:[1,1931]},o($VH4,$Vp2,{83:1932,84:1933,192:1934,190:[1,1935]}),o($VI4,$Vp2,{83:1936,84:1937,192:1938,190:$VA6}),o($Vz3,$Vs2,{99:983,95:1940,101:$VN4,102:$VR,103:$VS,104:$VT}),o($VC3,$Vt2),o($VA3,$Vu2,{90:1941,95:1942,91:1943,99:1944,105:1946,107:1947,101:$VB6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VA3,$Vw2,{90:1941,95:1942,91:1943,99:1944,105:1946,107:1947,101:$VB6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VA3,$Vx2,{90:1941,95:1942,91:1943,99:1944,105:1946,107:1947,101:$VB6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VE3,$Vy2),o($VK4,$Vp2,{83:1948,84:1949,192:1950,190:[1,1951]}),o($VM5,$VA2),o($VM5,$Vw),o($VM5,$Vx),o($VM5,$Vn),o($VM5,$Vo),o($VM5,$Vy),o($VM5,$Vp),o($VM5,$Vq),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,1952],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:1953,121:$VW2,148:$VX2,189:$VY2}),o($VC3,$V13),o($VE3,$V23),o($VE3,$V33),o($VE3,$V43),o($VE3,$V53),{111:[1,1954]},o($VE3,$Va3),o($Vo2,$V71),o($Vo2,$V81),o($Vo2,$V91),o($Vr1,$Vi5),o($Vr1,$Vj5),{19:$VP4,21:$VQ4,22:1956,87:1955,214:996,215:$VR4},o($Vq2,$V71),o($Vq2,$V81),o($Vq2,$V91),o($Vt1,$Vi5),o($Vt1,$Vj5),{19:$VT4,21:$VU4,22:1958,87:1957,214:1022,215:$VV4},o($VA1,$VD5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($Vz2,$V71),o($Vz2,$V81),o($Vz2,$V91),o($VD1,$Vi5),o($VD1,$Vj5),{19:$VW4,21:$VX4,22:1960,87:1959,214:1049,215:$VY4},o($V05,[2,204]),o($V05,[2,206]),o($V05,[2,213]),o($V05,[2,221]),o($VX5,$Vi5),o($VX5,$Vj5),{19:$V15,21:$V25,22:1962,87:1961,214:1080,215:$Vh5},o($V05,[2,200]),o($V05,[2,209]),o($V05,[2,217]),o($VC6,$VD6,{152:1963,153:1964,156:$VE6,157:$VF6,158:$VG6,159:$VH6}),o($VI6,$VJ6),o($VK6,$VL6,{56:1969}),o($VM6,$VN6,{60:1970}),o($VI,$VJ,{63:1971,73:1972,75:1973,76:1974,92:1977,94:1978,87:1980,88:1981,89:1982,78:1983,44:1984,95:1988,22:1989,91:1991,118:1992,99:1996,214:1999,105:2000,107:2001,19:[1,1998],21:[1,2003],69:[1,1975],71:[1,1976],79:[1,1993],80:[1,1994],81:[1,1995],85:[1,1979],96:[1,1985],97:[1,1986],98:[1,1987],101:$VO6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,1990],215:[1,2002]}),o($VC6,$VD6,{153:1964,152:2004,156:$VE6,157:$VF6,158:$VG6,159:$VH6}),{70:$Vl5,134:2005,135:$V56},o($V66,$Vm5),o($VU2,$VV2,{147:406,136:1123,137:1124,138:1125,144:1126,146:1127,131:2006,148:$VX2,189:$Vy5}),o($V66,$Vn5),o($V66,$Vh4,{139:2007,143:2008,140:$V76,141:$V86}),o($VU2,$VV2,{147:406,144:1126,146:1127,138:2009,70:$Vo5,135:$Vo5,148:$VX2,189:$Vy5}),o($VU2,$VV2,{147:406,144:1126,146:1127,138:2010,70:$Vp5,135:$Vp5,148:$VX2,189:$Vy5}),o($V96,$Vq5),o($V96,$Vr5),o($V96,$Vs5),o($V96,$Vt5),{19:$Vu5,21:$Vv5,22:1113,129:2011,199:$Vw5,214:1116,215:$Vx5},o($VU2,$VV2,{147:406,130:1120,131:1121,132:1122,136:1123,137:1124,138:1125,144:1126,146:1127,126:2012,148:$VX2,189:$Vy5}),o($V96,$Vz5),o($V96,$VA5),o($V96,$VB5),o($V96,$Vn),o($V96,$Vo),o($V96,$Vy),o($V96,$Vp),o($V96,$Vq),o($VC5,$VO4),{19:$Vi,21:$Vj,22:2013,214:45,215:$Vk},{19:$VP6,21:$VQ6,22:2015,100:[1,2026],108:[1,2027],109:[1,2028],110:2025,181:2016,191:2014,196:2019,197:2020,198:2021,201:2024,204:[1,2029],205:[1,2030],206:[1,2035],207:[1,2036],208:[1,2037],209:[1,2038],210:[1,2031],211:[1,2032],212:[1,2033],213:[1,2034],214:2018,215:$VR6},o($Vp4,$Vk5),{193:[1,2041],194:2039,195:[1,2040]},o($Vb3,$VP5),o($Vb3,$VQ5),o($Vb3,$VR5),o($Vb3,$Vn),o($Vb3,$Vo),o($Vb3,$VX3),o($Vb3,$VY3),o($Vb3,$VZ3),o($Vb3,$Vp),o($Vb3,$Vq),o($Vb3,$V_3),o($Vb3,$V$3,{202:2042,203:2043,111:[1,2044]}),o($Vb3,$V04),o($Vb3,$V14),o($Vb3,$V24),o($Vb3,$V34),o($Vb3,$V44),o($Vb3,$V54),o($Vb3,$V64),o($Vb3,$V74),o($Vb3,$V84),o($VS6,$V63),o($VS6,$V73),o($VS6,$V83),o($VS6,$V93),o($VG,$Vc2),o($Vr,$Vs,{54:2045,40:2046,43:$Vt}),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:2047}),o($VG,$VE1),o($VG,$VF1),{19:[1,2051],21:[1,2055],22:2049,33:2048,200:2050,214:2052,215:[1,2054],216:[1,2053]},{119:[1,2056],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:2057}),o($Vh2,$Vy1,{93:2058}),o($Vt1,$Vz1,{99:1551,95:2059,101:$Vd6,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,2060]},o($Vh2,$VT1),{70:[1,2061]},o($Vo2,$Vp2,{83:2062,84:2063,192:2064,190:[1,2065]}),o($Vq2,$Vp2,{83:2066,84:2067,192:2068,190:$VT6}),o($Vr1,$Vs2,{99:1167,95:2070,101:$VF5,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vt2),o($Vt1,$Vu2,{90:2071,95:2072,91:2073,99:2074,105:2076,107:2077,101:$VU6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vw2,{90:2071,95:2072,91:2073,99:2074,105:2076,107:2077,101:$VU6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:2071,95:2072,91:2073,99:2074,105:2076,107:2077,101:$VU6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vy2),o($Vz2,$Vp2,{83:2078,84:2079,192:2080,190:[1,2081]}),o($Vu1,$VA2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,2082],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:2083,121:$VW2,148:$VX2,189:$VY2}),o($Vx1,$V13),o($VN1,$V23),o($VN1,$V33),o($VN1,$V43),o($VN1,$V53),{111:[1,2084]},o($VN1,$Va3),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:2085}),o($VG,$VE1),o($VG,$VF1),{19:[1,2089],21:[1,2093],22:2087,33:2086,200:2088,214:2090,215:[1,2092],216:[1,2091]},{119:[1,2094],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:2095}),o($Vh2,$Vy1,{93:2096}),o($Vt1,$Vz1,{99:1598,95:2097,101:$Ve6,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,2098]},o($Vh2,$VT1),{70:[1,2099]},o($Vo2,$Vp2,{83:2100,84:2101,192:2102,190:[1,2103]}),o($Vq2,$Vp2,{83:2104,84:2105,192:2106,190:$VV6}),o($Vr1,$Vs2,{99:1203,95:2108,101:$VG5,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vt2),o($Vt1,$Vu2,{90:2109,95:2110,91:2111,99:2112,105:2114,107:2115,101:$VW6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vw2,{90:2109,95:2110,91:2111,99:2112,105:2114,107:2115,101:$VW6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:2109,95:2110,91:2111,99:2112,105:2114,107:2115,101:$VW6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vy2),o($Vz2,$Vp2,{83:2116,84:2117,192:2118,190:[1,2119]}),o($Vu1,$VA2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,2120],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:2121,121:$VW2,148:$VX2,189:$VY2}),o($Vx1,$V13),o($VN1,$V23),o($VN1,$V33),o($VN1,$V43),o($VN1,$V53),{111:[1,2122]},o($VN1,$Va3),o($Vt1,$Vk5),{193:[1,2125],194:2123,195:[1,2124]},o($Vr1,$VP5),o($Vr1,$VQ5),o($Vr1,$VR5),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VX3),o($Vr1,$VY3),o($Vr1,$VZ3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V_3),o($Vr1,$V$3,{202:2126,203:2127,111:[1,2128]}),o($Vr1,$V04),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($VS5,$V63),o($VS5,$V73),o($VS5,$V83),o($VS5,$V93),{193:[1,2131],194:2129,195:[1,2130]},o($Vt1,$VP5),o($Vt1,$VQ5),o($Vt1,$VR5),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VX3),o($Vt1,$VY3),o($Vt1,$VZ3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V_3),o($Vt1,$V$3,{202:2132,203:2133,111:[1,2134]}),o($Vt1,$V04),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($VT5,$V63),o($VT5,$V73),o($VT5,$V83),o($VT5,$V93),{19:[1,2137],21:[1,2140],22:2136,87:2135,214:2138,215:[1,2139]},{193:[1,2143],194:2141,195:[1,2142]},o($VD1,$VP5),o($VD1,$VQ5),o($VD1,$VR5),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VX3),o($VD1,$VY3),o($VD1,$VZ3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V_3),o($VD1,$V$3,{202:2144,203:2145,111:[1,2146]}),o($VD1,$V04),o($VD1,$V14),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VU5,$V63),o($VU5,$V73),o($VU5,$V83),o($VU5,$V93),o($VG,$Ve1),o($VG,$Vf1,{65:2147,67:2148,72:2149,44:2150,78:2151,118:2155,79:[1,2152],80:[1,2153],81:[1,2154],119:$VJ,125:$VJ,127:$VJ,189:$VJ,218:$VJ}),o($VG,$Vj1),o($VG,$Vk1,{68:2156,64:2157,73:2158,92:2159,94:2160,95:2164,99:2165,96:[1,2161],97:[1,2162],98:[1,2163],101:$VX6,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:2167,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VG,$Vq1),o($Vr1,$Vs1,{82:2168}),o($Vt1,$Vs1,{82:2169}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:2170}),o($Vr1,$Vz1,{99:1735,95:2171,101:$Vo6,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:2172}),o($VA1,$VB1,{86:2173}),o($VA1,$VB1,{86:2174}),o($Vt1,$VC1,{105:1739,107:1740,91:2175,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:2176}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,2180],21:[1,2184],22:2178,33:2177,200:2179,214:2181,215:[1,2183],216:[1,2182]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:2185}),o($VN1,$VO1),{119:[1,2186],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},{100:[1,2187]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,2189],106:2188,108:[1,2190],109:[1,2191],110:2192,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2193]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$VT3),{121:[1,2194]},o($VG,$VH3),o($Vh2,$VP3),o($Vo2,$VO4),{19:$Vi,21:$Vj,22:2195,214:45,215:$Vk},{19:$VY6,21:$VZ6,22:2197,100:[1,2208],108:[1,2209],109:[1,2210],110:2207,181:2198,191:2196,196:2201,197:2202,198:2203,201:2206,204:[1,2211],205:[1,2212],206:[1,2217],207:[1,2218],208:[1,2219],209:[1,2220],210:[1,2213],211:[1,2214],212:[1,2215],213:[1,2216],214:2200,215:$V_6},o($Vq2,$VO4),{19:$Vi,21:$Vj,22:2221,214:45,215:$Vk},{19:$V$6,21:$V07,22:2223,100:[1,2234],108:[1,2235],109:[1,2236],110:2233,181:2224,191:2222,196:2227,197:2228,198:2229,201:2232,204:[1,2237],205:[1,2238],206:[1,2243],207:[1,2244],208:[1,2245],209:[1,2246],210:[1,2239],211:[1,2240],212:[1,2241],213:[1,2242],214:2226,215:$V17},o($VA1,$V13),o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),{111:[1,2247]},o($VA1,$Va3),o($Vz2,$VO4),{19:$Vi,21:$Vj,22:2248,214:45,215:$Vk},{19:$V27,21:$V37,22:2250,100:[1,2261],108:[1,2262],109:[1,2263],110:2260,181:2251,191:2249,196:2254,197:2255,198:2256,201:2259,204:[1,2264],205:[1,2265],206:[1,2270],207:[1,2271],208:[1,2272],209:[1,2273],210:[1,2266],211:[1,2267],212:[1,2268],213:[1,2269],214:2253,215:$V47},o($VD1,$Vk5),o($VN1,$VD5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($VG,$VT3),{121:[1,2274]},o($VG,$VH3),o($Vh2,$VP3),o($Vo2,$VO4),{19:$Vi,21:$Vj,22:2275,214:45,215:$Vk},{19:$V57,21:$V67,22:2277,100:[1,2288],108:[1,2289],109:[1,2290],110:2287,181:2278,191:2276,196:2281,197:2282,198:2283,201:2286,204:[1,2291],205:[1,2292],206:[1,2297],207:[1,2298],208:[1,2299],209:[1,2300],210:[1,2293],211:[1,2294],212:[1,2295],213:[1,2296],214:2280,215:$V77},o($Vq2,$VO4),{19:$Vi,21:$Vj,22:2301,214:45,215:$Vk},{19:$V87,21:$V97,22:2303,100:[1,2314],108:[1,2315],109:[1,2316],110:2313,181:2304,191:2302,196:2307,197:2308,198:2309,201:2312,204:[1,2317],205:[1,2318],206:[1,2323],207:[1,2324],208:[1,2325],209:[1,2326],210:[1,2319],211:[1,2320],212:[1,2321],213:[1,2322],214:2306,215:$Va7},o($VA1,$V13),o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),{111:[1,2327]},o($VA1,$Va3),o($Vz2,$VO4),{19:$Vi,21:$Vj,22:2328,214:45,215:$Vk},{19:$Vb7,21:$Vc7,22:2330,100:[1,2341],108:[1,2342],109:[1,2343],110:2340,181:2331,191:2329,196:2334,197:2335,198:2336,201:2339,204:[1,2344],205:[1,2345],206:[1,2350],207:[1,2351],208:[1,2352],209:[1,2353],210:[1,2346],211:[1,2347],212:[1,2348],213:[1,2349],214:2333,215:$Vd7},o($VD1,$Vk5),o($VN1,$VD5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($VA3,$Vk5),{193:[1,2356],194:2354,195:[1,2355]},o($Vz3,$VP5),o($Vz3,$VQ5),o($Vz3,$VR5),o($Vz3,$Vn),o($Vz3,$Vo),o($Vz3,$VX3),o($Vz3,$VY3),o($Vz3,$VZ3),o($Vz3,$Vp),o($Vz3,$Vq),o($Vz3,$V_3),o($Vz3,$V$3,{202:2357,203:2358,111:[1,2359]}),o($Vz3,$V04),o($Vz3,$V14),o($Vz3,$V24),o($Vz3,$V34),o($Vz3,$V44),o($Vz3,$V54),o($Vz3,$V64),o($Vz3,$V74),o($Vz3,$V84),o($Ve7,$V63),o($Ve7,$V73),o($Ve7,$V83),o($Ve7,$V93),{193:[1,2362],194:2360,195:[1,2361]},o($VA3,$VP5),o($VA3,$VQ5),o($VA3,$VR5),o($VA3,$Vn),o($VA3,$Vo),o($VA3,$VX3),o($VA3,$VY3),o($VA3,$VZ3),o($VA3,$Vp),o($VA3,$Vq),o($VA3,$V_3),o($VA3,$V$3,{202:2363,203:2364,111:[1,2365]}),o($VA3,$V04),o($VA3,$V14),o($VA3,$V24),o($VA3,$V34),o($VA3,$V44),o($VA3,$V54),o($VA3,$V64),o($VA3,$V74),o($VA3,$V84),o($Vf7,$V63),o($Vf7,$V73),o($Vf7,$V83),o($Vf7,$V93),{193:[1,2368],194:2366,195:[1,2367]},o($VB3,$VP5),o($VB3,$VQ5),o($VB3,$VR5),o($VB3,$Vn),o($VB3,$Vo),o($VB3,$VX3),o($VB3,$VY3),o($VB3,$VZ3),o($VB3,$Vp),o($VB3,$Vq),o($VB3,$V_3),o($VB3,$V$3,{202:2369,203:2370,111:[1,2371]}),o($VB3,$V04),o($VB3,$V14),o($VB3,$V24),o($VB3,$V34),o($VB3,$V44),o($VB3,$V54),o($VB3,$V64),o($VB3,$V74),o($VB3,$V84),o($Vg7,$V63),o($Vg7,$V73),o($Vg7,$V83),o($Vg7,$V93),{19:[1,2374],21:[1,2377],22:2373,87:2372,214:2375,215:[1,2376]},o($Vx3,$Vu3),o($VI,$VJ,{62:2378,64:2379,66:2380,67:2381,73:2384,75:2385,72:2386,44:2387,92:2388,94:2389,87:2391,88:2392,89:2393,78:2394,95:2401,22:2402,91:2404,118:2405,99:2406,214:2409,105:2410,107:2411,19:[1,2408],21:[1,2413],69:[1,2382],71:[1,2383],79:[1,2395],80:[1,2396],81:[1,2397],85:[1,2390],96:[1,2398],97:[1,2399],98:[1,2400],101:$Vh7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,2403],215:[1,2412]}),o($VI4,$Vp2,{84:1899,192:1900,83:2414,190:$Vy6}),o($Vx3,$VA2),o($Vx3,$Vw),o($Vx3,$Vx),o($Vx3,$Vn),o($Vx3,$Vo),o($Vx3,$Vy),o($Vx3,$Vp),o($Vx3,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:2415,121:$VW2,148:$VX2,189:$VY2}),o($VI4,$Vp2,{84:1899,192:1900,83:2416,190:$Vy6}),o($VA3,$Vs2,{99:1364,95:2417,101:$VN5,102:$VR,103:$VS,104:$VT}),o($VG4,$Vt2),o($VG4,$V13),o($Vx3,$Vw3),o($VL5,$VH3),o($Vz3,$VI3),o($VL5,$VJ3,{31:2418,193:[1,2419]}),{19:$VK3,21:$VL3,22:643,129:2420,199:$VM3,214:646,215:$VN3},o($Vx3,$VO3),o($VA3,$VI3),o($Vx3,$VJ3,{31:2421,193:[1,2422]}),{19:$VK3,21:$VL3,22:643,129:2423,199:$VM3,214:646,215:$VN3},o($VC3,$VP3),o($VD3,$VQ3),o($VD3,$VR3),o($VD3,$VS3),{100:[1,2424]},o($VD3,$VT1),{100:[1,2426],106:2425,108:[1,2427],109:[1,2428],110:2429,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2430]},o($VM5,$VT3),o($VB3,$VI3),o($VM5,$VJ3,{31:2431,193:[1,2432]}),{19:$VK3,21:$VL3,22:643,129:2433,199:$VM3,214:646,215:$VN3},o($VD3,$VU3),{121:[1,2434]},{19:[1,2437],21:[1,2440],22:2436,87:2435,214:2438,215:[1,2439]},o($VI4,$Vp2,{84:1937,192:1938,83:2441,190:$VA6}),o($Vx3,$VA2),o($Vx3,$Vw),o($Vx3,$Vx),o($Vx3,$Vn),o($Vx3,$Vo),o($Vx3,$Vy),o($Vx3,$Vp),o($Vx3,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:2442,121:$VW2,148:$VX2,189:$VY2}),o($VI4,$Vp2,{84:1937,192:1938,83:2443,190:$VA6}),o($VA3,$Vs2,{99:1411,95:2444,101:$VO5,102:$VR,103:$VS,104:$VT}),o($VG4,$Vt2),o($VG4,$V13),o($Vx3,$Vw3),o($VL5,$VH3),o($Vz3,$VI3),o($VL5,$VJ3,{31:2445,193:[1,2446]}),{19:$VK3,21:$VL3,22:643,129:2447,199:$VM3,214:646,215:$VN3},o($Vx3,$VO3),o($VA3,$VI3),o($Vx3,$VJ3,{31:2448,193:[1,2449]}),{19:$VK3,21:$VL3,22:643,129:2450,199:$VM3,214:646,215:$VN3},o($VC3,$VP3),o($VD3,$VQ3),o($VD3,$VR3),o($VD3,$VS3),{100:[1,2451]},o($VD3,$VT1),{100:[1,2453],106:2452,108:[1,2454],109:[1,2455],110:2456,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2457]},o($VM5,$VT3),o($VB3,$VI3),o($VM5,$VJ3,{31:2458,193:[1,2459]}),{19:$VK3,21:$VL3,22:643,129:2460,199:$VM3,214:646,215:$VN3},o($VD3,$VU3),{121:[1,2461]},{19:[1,2464],21:[1,2467],22:2463,87:2462,214:2465,215:[1,2466]},o($Vr1,$VZ5),o($Vr1,$VK1),o($Vt1,$VZ5),o($Vt1,$VK1),o($VD1,$VZ5),o($VD1,$VK1),o($VX5,$VZ5),o($VX5,$VK1),o($VC6,$Vs1,{82:2468}),o($VC6,$Vi7),o($VC6,$Vj7),o($VC6,$Vk7),o($VC6,$Vl7),o($VC6,$Vm7),o($VI6,$Vn7,{57:2469,51:[1,2470]}),o($VK6,$Vo7,{61:2471,53:[1,2472]}),o($VM6,$Vp7),o($VM6,$Vq7,{74:2473,76:2474,78:2475,44:2476,118:2477,79:[1,2478],80:[1,2479],81:[1,2480],119:$VJ,125:$VJ,127:$VJ,189:$VJ,218:$VJ}),o($VM6,$Vr7),o($VM6,$Vs7,{77:2481,73:2482,92:2483,94:2484,95:2488,99:2489,96:[1,2485],97:[1,2486],98:[1,2487],101:$Vt7,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:2491,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VM6,$Vu7),o($Vv7,$Vy1,{93:2492}),o($Vw7,$Vz1,{99:1996,95:2493,101:$VO6,102:$VR,103:$VS,104:$VT}),o($Vx7,$VB1,{86:2494}),o($Vx7,$VB1,{86:2495}),o($Vx7,$VB1,{86:2496}),o($VM6,$VC1,{105:2000,107:2001,91:2497,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vy7,$Vz7),o($Vy7,$VA7),o($Vv7,$VG1),o($Vv7,$VH1),o($Vv7,$VI1),o($Vv7,$VJ1),o($Vx7,$VK1),o($VL1,$VM1,{162:2498}),o($VB7,$VO1),{119:[1,2499],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($Vy7,$VE1),o($Vy7,$VF1),{19:[1,2503],21:[1,2507],22:2501,33:2500,200:2502,214:2504,215:[1,2506],216:[1,2505]},{100:[1,2508]},o($Vv7,$VT1),o($Vx7,$Vn),o($Vx7,$Vo),{100:[1,2510],106:2509,108:[1,2511],109:[1,2512],110:2513,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2514]},o($Vx7,$Vp),o($Vx7,$Vq),o($VC6,$Vs1,{82:2515}),o($V66,$V_5),o($V66,$V$5),o($V66,$V06),o($V96,$V16),o($V96,$V26),o($V96,$V36),o($Vr,$Vs,{46:2516,47:2517,55:2518,59:2519,40:2520,43:$Vt}),{70:[1,2521]},{193:[1,2524],194:2522,195:[1,2523]},o($Vp4,$VP5),o($Vp4,$VQ5),o($Vp4,$VR5),o($Vp4,$Vn),o($Vp4,$Vo),o($Vp4,$VX3),o($Vp4,$VY3),o($Vp4,$VZ3),o($Vp4,$Vp),o($Vp4,$Vq),o($Vp4,$V_3),o($Vp4,$V$3,{202:2525,203:2526,111:[1,2527]}),o($Vp4,$V04),o($Vp4,$V14),o($Vp4,$V24),o($Vp4,$V34),o($Vp4,$V44),o($Vp4,$V54),o($Vp4,$V64),o($Vp4,$V74),o($Vp4,$V84),o($VC7,$V63),o($VC7,$V73),o($VC7,$V83),o($VC7,$V93),o($Vt4,$V71),o($Vt4,$V81),o($Vt4,$V91),o($Vb3,$Vi5),o($Vb3,$Vj5),{19:$Va6,21:$Vb6,22:2529,87:2528,214:1510,215:$Vc6},o($VG,$Vu3),o($VI,$VJ,{62:2530,64:2531,66:2532,67:2533,73:2536,75:2537,72:2538,44:2539,92:2540,94:2541,87:2543,88:2544,89:2545,78:2546,95:2553,22:2554,91:2556,118:2557,99:2558,214:2561,105:2562,107:2563,19:[1,2560],21:[1,2565],69:[1,2534],71:[1,2535],79:[1,2547],80:[1,2548],81:[1,2549],85:[1,2542],96:[1,2550],97:[1,2551],98:[1,2552],101:$VD7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,2555],215:[1,2564]}),o($Vq2,$Vp2,{84:2067,192:2068,83:2566,190:$VT6}),o($VG,$VA2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:2567,121:$VW2,148:$VX2,189:$VY2}),o($Vq2,$Vp2,{84:2067,192:2068,83:2568,190:$VT6}),o($Vt1,$Vs2,{99:1551,95:2569,101:$Vd6,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vt2),o($Vh2,$V13),o($VG,$Vw3),o($VG3,$VH3),o($Vr1,$VI3),o($VG3,$VJ3,{31:2570,193:[1,2571]}),{19:$VK3,21:$VL3,22:643,129:2572,199:$VM3,214:646,215:$VN3},o($VG,$VO3),o($Vt1,$VI3),o($VG,$VJ3,{31:2573,193:[1,2574]}),{19:$VK3,21:$VL3,22:643,129:2575,199:$VM3,214:646,215:$VN3},o($Vx1,$VP3),o($VA1,$VQ3),o($VA1,$VR3),o($VA1,$VS3),{100:[1,2576]},o($VA1,$VT1),{100:[1,2578],106:2577,108:[1,2579],109:[1,2580],110:2581,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2582]},o($Vu1,$VT3),o($VD1,$VI3),o($Vu1,$VJ3,{31:2583,193:[1,2584]}),{19:$VK3,21:$VL3,22:643,129:2585,199:$VM3,214:646,215:$VN3},o($VA1,$VU3),{121:[1,2586]},{19:[1,2589],21:[1,2592],22:2588,87:2587,214:2590,215:[1,2591]},o($Vq2,$Vp2,{84:2105,192:2106,83:2593,190:$VV6}),o($VG,$VA2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:2594,121:$VW2,148:$VX2,189:$VY2}),o($Vq2,$Vp2,{84:2105,192:2106,83:2595,190:$VV6}),o($Vt1,$Vs2,{99:1598,95:2596,101:$Ve6,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vt2),o($Vh2,$V13),o($VG,$Vw3),o($VG3,$VH3),o($Vr1,$VI3),o($VG3,$VJ3,{31:2597,193:[1,2598]}),{19:$VK3,21:$VL3,22:643,129:2599,199:$VM3,214:646,215:$VN3},o($VG,$VO3),o($Vt1,$VI3),o($VG,$VJ3,{31:2600,193:[1,2601]}),{19:$VK3,21:$VL3,22:643,129:2602,199:$VM3,214:646,215:$VN3},o($Vx1,$VP3),o($VA1,$VQ3),o($VA1,$VR3),o($VA1,$VS3),{100:[1,2603]},o($VA1,$VT1),{100:[1,2605],106:2604,108:[1,2606],109:[1,2607],110:2608,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2609]},o($Vu1,$VT3),o($VD1,$VI3),o($Vu1,$VJ3,{31:2610,193:[1,2611]}),{19:$VK3,21:$VL3,22:643,129:2612,199:$VM3,214:646,215:$VN3},o($VA1,$VU3),{121:[1,2613]},{19:[1,2616],21:[1,2619],22:2615,87:2614,214:2617,215:[1,2618]},o($Vo2,$V71),o($Vo2,$V81),o($Vo2,$V91),o($Vr1,$Vi5),o($Vr1,$Vj5),{19:$Vf6,21:$Vg6,22:2621,87:2620,214:1633,215:$Vh6},o($Vq2,$V71),o($Vq2,$V81),o($Vq2,$V91),o($Vt1,$Vi5),o($Vt1,$Vj5),{19:$Vi6,21:$Vj6,22:2623,87:2622,214:1659,215:$Vk6},o($VA1,$VD5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($Vz2,$V71),o($Vz2,$V81),o($Vz2,$V91),o($VD1,$Vi5),o($VD1,$Vj5),{19:$Vl6,21:$Vm6,22:2625,87:2624,214:1686,215:$Vn6},o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:2626}),o($VG,$VE1),o($VG,$VF1),{19:[1,2630],21:[1,2634],22:2628,33:2627,200:2629,214:2631,215:[1,2633],216:[1,2632]},{119:[1,2635],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:2636}),o($Vh2,$Vy1,{93:2637}),o($Vt1,$Vz1,{99:2165,95:2638,101:$VX6,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,2639]},o($Vh2,$VT1),{70:[1,2640]},o($Vo2,$Vp2,{83:2641,84:2642,192:2643,190:[1,2644]}),o($Vq2,$Vp2,{83:2645,84:2646,192:2647,190:$VE7}),o($Vr1,$Vs2,{99:1735,95:2649,101:$Vo6,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vt2),o($Vt1,$Vu2,{90:2650,95:2651,91:2652,99:2653,105:2655,107:2656,101:$VF7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vw2,{90:2650,95:2651,91:2652,99:2653,105:2655,107:2656,101:$VF7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:2650,95:2651,91:2652,99:2653,105:2655,107:2656,101:$VF7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vy2),o($Vz2,$Vp2,{83:2657,84:2658,192:2659,190:[1,2660]}),o($Vu1,$VA2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,2661],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:2662,121:$VW2,148:$VX2,189:$VY2}),o($Vx1,$V13),o($VN1,$V23),o($VN1,$V33),o($VN1,$V43),o($VN1,$V53),{111:[1,2663]},o($VN1,$Va3),o($Vt1,$Vk5),{193:[1,2666],194:2664,195:[1,2665]},o($Vr1,$VP5),o($Vr1,$VQ5),o($Vr1,$VR5),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VX3),o($Vr1,$VY3),o($Vr1,$VZ3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V_3),o($Vr1,$V$3,{202:2667,203:2668,111:[1,2669]}),o($Vr1,$V04),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($VS5,$V63),o($VS5,$V73),o($VS5,$V83),o($VS5,$V93),{193:[1,2672],194:2670,195:[1,2671]},o($Vt1,$VP5),o($Vt1,$VQ5),o($Vt1,$VR5),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VX3),o($Vt1,$VY3),o($Vt1,$VZ3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V_3),o($Vt1,$V$3,{202:2673,203:2674,111:[1,2675]}),o($Vt1,$V04),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($VT5,$V63),o($VT5,$V73),o($VT5,$V83),o($VT5,$V93),{19:[1,2678],21:[1,2681],22:2677,87:2676,214:2679,215:[1,2680]},{193:[1,2684],194:2682,195:[1,2683]},o($VD1,$VP5),o($VD1,$VQ5),o($VD1,$VR5),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VX3),o($VD1,$VY3),o($VD1,$VZ3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V_3),o($VD1,$V$3,{202:2685,203:2686,111:[1,2687]}),o($VD1,$V04),o($VD1,$V14),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VU5,$V63),o($VU5,$V73),o($VU5,$V83),o($VU5,$V93),o($Vt1,$Vk5),{193:[1,2690],194:2688,195:[1,2689]},o($Vr1,$VP5),o($Vr1,$VQ5),o($Vr1,$VR5),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VX3),o($Vr1,$VY3),o($Vr1,$VZ3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V_3),o($Vr1,$V$3,{202:2691,203:2692,111:[1,2693]}),o($Vr1,$V04),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($VS5,$V63),o($VS5,$V73),o($VS5,$V83),o($VS5,$V93),{193:[1,2696],194:2694,195:[1,2695]},o($Vt1,$VP5),o($Vt1,$VQ5),o($Vt1,$VR5),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VX3),o($Vt1,$VY3),o($Vt1,$VZ3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V_3),o($Vt1,$V$3,{202:2697,203:2698,111:[1,2699]}),o($Vt1,$V04),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($VT5,$V63),o($VT5,$V73),o($VT5,$V83),o($VT5,$V93),{19:[1,2702],21:[1,2705],22:2701,87:2700,214:2703,215:[1,2704]},{193:[1,2708],194:2706,195:[1,2707]},o($VD1,$VP5),o($VD1,$VQ5),o($VD1,$VR5),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VX3),o($VD1,$VY3),o($VD1,$VZ3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V_3),o($VD1,$V$3,{202:2709,203:2710,111:[1,2711]}),o($VD1,$V04),o($VD1,$V14),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VU5,$V63),o($VU5,$V73),o($VU5,$V83),o($VU5,$V93),o($VH4,$V71),o($VH4,$V81),o($VH4,$V91),o($Vz3,$Vi5),o($Vz3,$Vj5),{19:$Vp6,21:$Vq6,22:2713,87:2712,214:1803,215:$Vr6},o($VI4,$V71),o($VI4,$V81),o($VI4,$V91),o($VA3,$Vi5),o($VA3,$Vj5),{19:$Vs6,21:$Vt6,22:2715,87:2714,214:1829,215:$Vu6},o($VK4,$V71),o($VK4,$V81),o($VK4,$V91),o($VB3,$Vi5),o($VB3,$Vj5),{19:$Vv6,21:$Vw6,22:2717,87:2716,214:1855,215:$Vx6},o($VD3,$VD5),o($VD3,$VK1),o($VD3,$Vn),o($VD3,$Vo),o($VD3,$Vp),o($VD3,$Vq),o($Vx3,$Ve1),o($VI,$VJ,{65:2718,67:2719,72:2720,44:2721,78:2722,118:2726,51:$Vf1,53:$Vf1,70:$Vf1,79:[1,2723],80:[1,2724],81:[1,2725]}),o($Vx3,$Vj1),o($Vx3,$Vk1,{68:2727,64:2728,73:2729,92:2730,94:2731,95:2735,99:2736,96:[1,2732],97:[1,2733],98:[1,2734],101:$VG7,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:2738,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($Vx3,$Vq1),o($Vz3,$Vs1,{82:2739}),o($VA3,$Vs1,{82:2740}),o($VM5,$Vv1),o($VM5,$Vw1),o($VC3,$Vy1,{93:2741}),o($Vz3,$Vz1,{99:2406,95:2742,101:$Vh7,102:$VR,103:$VS,104:$VT}),o($VD3,$VB1,{86:2743}),o($VD3,$VB1,{86:2744}),o($VD3,$VB1,{86:2745}),o($VA3,$VC1,{105:2410,107:2411,91:2746,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VB3,$Vs1,{82:2747}),o($VM5,$VE1),o($VM5,$VF1),{19:[1,2751],21:[1,2755],22:2749,33:2748,200:2750,214:2752,215:[1,2754],216:[1,2753]},o($VC3,$VG1),o($VC3,$VH1),o($VC3,$VI1),o($VC3,$VJ1),o($VD3,$VK1),o($VL1,$VM1,{162:2756}),o($VE3,$VO1),{119:[1,2757],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},{100:[1,2758]},o($VC3,$VT1),o($VD3,$Vn),o($VD3,$Vo),{100:[1,2760],106:2759,108:[1,2761],109:[1,2762],110:2763,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2764]},o($VD3,$Vp),o($VD3,$Vq),o($Vx3,$VT3),{121:[1,2765]},o($Vx3,$VH3),o($VG4,$VP3),o($VH4,$VO4),{19:$Vi,21:$Vj,22:2766,214:45,215:$Vk},{19:$VH7,21:$VI7,22:2768,100:[1,2779],108:[1,2780],109:[1,2781],110:2778,181:2769,191:2767,196:2772,197:2773,198:2774,201:2777,204:[1,2782],205:[1,2783],206:[1,2788],207:[1,2789],208:[1,2790],209:[1,2791],210:[1,2784],211:[1,2785],212:[1,2786],213:[1,2787],214:2771,215:$VJ7},o($VI4,$VO4),{19:$Vi,21:$Vj,22:2792,214:45,215:$Vk},{19:$VK7,21:$VL7,22:2794,100:[1,2805],108:[1,2806],109:[1,2807],110:2804,181:2795,191:2793,196:2798,197:2799,198:2800,201:2803,204:[1,2808],205:[1,2809],206:[1,2814],207:[1,2815],208:[1,2816],209:[1,2817],210:[1,2810],211:[1,2811],212:[1,2812],213:[1,2813],214:2797,215:$VM7},o($VD3,$V13),o($VD3,$V23),o($VD3,$V33),o($VD3,$V43),o($VD3,$V53),{111:[1,2818]},o($VD3,$Va3),o($VK4,$VO4),{19:$Vi,21:$Vj,22:2819,214:45,215:$Vk},{19:$VN7,21:$VO7,22:2821,100:[1,2832],108:[1,2833],109:[1,2834],110:2831,181:2822,191:2820,196:2825,197:2826,198:2827,201:2830,204:[1,2835],205:[1,2836],206:[1,2841],207:[1,2842],208:[1,2843],209:[1,2844],210:[1,2837],211:[1,2838],212:[1,2839],213:[1,2840],214:2824,215:$VP7},o($VB3,$Vk5),o($VE3,$VD5),o($VE3,$VK1),o($VE3,$Vn),o($VE3,$Vo),o($VE3,$Vp),o($VE3,$Vq),o($Vx3,$VT3),{121:[1,2845]},o($Vx3,$VH3),o($VG4,$VP3),o($VH4,$VO4),{19:$Vi,21:$Vj,22:2846,214:45,215:$Vk},{19:$VQ7,21:$VR7,22:2848,100:[1,2859],108:[1,2860],109:[1,2861],110:2858,181:2849,191:2847,196:2852,197:2853,198:2854,201:2857,204:[1,2862],205:[1,2863],206:[1,2868],207:[1,2869],208:[1,2870],209:[1,2871],210:[1,2864],211:[1,2865],212:[1,2866],213:[1,2867],214:2851,215:$VS7},o($VI4,$VO4),{19:$Vi,21:$Vj,22:2872,214:45,215:$Vk},{19:$VT7,21:$VU7,22:2874,100:[1,2885],108:[1,2886],109:[1,2887],110:2884,181:2875,191:2873,196:2878,197:2879,198:2880,201:2883,204:[1,2888],205:[1,2889],206:[1,2894],207:[1,2895],208:[1,2896],209:[1,2897],210:[1,2890],211:[1,2891],212:[1,2892],213:[1,2893],214:2877,215:$VV7},o($VD3,$V13),o($VD3,$V23),o($VD3,$V33),o($VD3,$V43),o($VD3,$V53),{111:[1,2898]},o($VD3,$Va3),o($VK4,$VO4),{19:$Vi,21:$Vj,22:2899,214:45,215:$Vk},{19:$VW7,21:$VX7,22:2901,100:[1,2912],108:[1,2913],109:[1,2914],110:2911,181:2902,191:2900,196:2905,197:2906,198:2907,201:2910,204:[1,2915],205:[1,2916],206:[1,2921],207:[1,2922],208:[1,2923],209:[1,2924],210:[1,2917],211:[1,2918],212:[1,2919],213:[1,2920],214:2904,215:$VY7},o($VB3,$Vk5),o($VE3,$VD5),o($VE3,$VK1),o($VE3,$Vn),o($VE3,$Vo),o($VE3,$Vp),o($VE3,$Vq),o($VZ7,$Vp2,{83:2925,84:2926,192:2927,190:$V_7}),o($VK6,$V$7),o($Vr,$Vs,{55:2929,59:2930,40:2931,43:$Vt}),o($VM6,$V08),o($Vr,$Vs,{59:2932,40:2933,43:$Vt}),o($VM6,$V18),o($VM6,$V28),o($VM6,$Vz7),o($VM6,$VA7),{119:[1,2934],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($VM6,$VE1),o($VM6,$VF1),{19:[1,2938],21:[1,2942],22:2936,33:2935,200:2937,214:2939,215:[1,2941],216:[1,2940]},o($VM6,$V38),o($VM6,$V48),o($V58,$Vy1,{93:2943}),o($VM6,$Vz1,{99:2489,95:2944,101:$Vt7,102:$VR,103:$VS,104:$VT}),o($V58,$VG1),o($V58,$VH1),o($V58,$VI1),o($V58,$VJ1),{100:[1,2945]},o($V58,$VT1),{70:[1,2946]},o($Vw7,$Vs2,{99:1996,95:2947,101:$VO6,102:$VR,103:$VS,104:$VT}),o($Vv7,$Vt2),o($VM6,$Vu2,{90:2948,95:2949,91:2950,99:2951,105:2953,107:2954,101:$V68,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VM6,$Vw2,{90:2948,95:2949,91:2950,99:2951,105:2953,107:2954,101:$V68,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VM6,$Vx2,{90:2948,95:2949,91:2950,99:2951,105:2953,107:2954,101:$V68,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VB7,$Vy2),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,2955],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:2956,121:$VW2,148:$VX2,189:$VY2}),o($Vy7,$VA2),o($Vy7,$Vw),o($Vy7,$Vx),o($Vy7,$Vn),o($Vy7,$Vo),o($Vy7,$Vy),o($Vy7,$Vp),o($Vy7,$Vq),o($Vv7,$V13),o($VB7,$V23),o($VB7,$V33),o($VB7,$V43),o($VB7,$V53),{111:[1,2957]},o($VB7,$Va3),o($VZ7,$Vp2,{84:2926,192:2927,83:2958,190:$V_7}),o($V78,$VD6,{152:2959,153:2960,156:$V88,157:$V98,158:$Va8,159:$Vb8}),o($Vc8,$VJ6),o($Vd8,$VL6,{56:2965}),o($Ve8,$VN6,{60:2966}),o($VI,$VJ,{63:2967,73:2968,75:2969,76:2970,92:2973,94:2974,87:2976,88:2977,89:2978,78:2979,44:2980,95:2984,22:2985,91:2987,118:2988,99:2992,214:2995,105:2996,107:2997,19:[1,2994],21:[1,2999],69:[1,2971],71:[1,2972],79:[1,2989],80:[1,2990],81:[1,2991],85:[1,2975],96:[1,2981],97:[1,2982],98:[1,2983],101:$Vf8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,2986],215:[1,2998]}),o($V78,$VD6,{153:2960,152:3000,156:$V88,157:$V98,158:$Va8,159:$Vb8}),o($VC5,$V71),o($VC5,$V81),o($VC5,$V91),o($Vp4,$Vi5),o($Vp4,$Vj5),{19:$VP6,21:$VQ6,22:3002,87:3001,214:2018,215:$VR6},o($Vb3,$VZ5),o($Vb3,$VK1),o($VG,$Ve1),o($VG,$Vf1,{65:3003,67:3004,72:3005,44:3006,78:3007,118:3011,79:[1,3008],80:[1,3009],81:[1,3010],119:$VJ,125:$VJ,127:$VJ,189:$VJ,218:$VJ}),o($VG,$Vj1),o($VG,$Vk1,{68:3012,64:3013,73:3014,92:3015,94:3016,95:3020,99:3021,96:[1,3017],97:[1,3018],98:[1,3019],101:$Vg8,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:3023,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VG,$Vq1),o($Vr1,$Vs1,{82:3024}),o($Vt1,$Vs1,{82:3025}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:3026}),o($Vr1,$Vz1,{99:2558,95:3027,101:$VD7,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:3028}),o($VA1,$VB1,{86:3029}),o($VA1,$VB1,{86:3030}),o($Vt1,$VC1,{105:2562,107:2563,91:3031,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:3032}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,3036],21:[1,3040],22:3034,33:3033,200:3035,214:3037,215:[1,3039],216:[1,3038]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:3041}),o($VN1,$VO1),{119:[1,3042],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},{100:[1,3043]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,3045],106:3044,108:[1,3046],109:[1,3047],110:3048,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,3049]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$VT3),{121:[1,3050]},o($VG,$VH3),o($Vh2,$VP3),o($Vo2,$VO4),{19:$Vi,21:$Vj,22:3051,214:45,215:$Vk},{19:$Vh8,21:$Vi8,22:3053,100:[1,3064],108:[1,3065],109:[1,3066],110:3063,181:3054,191:3052,196:3057,197:3058,198:3059,201:3062,204:[1,3067],205:[1,3068],206:[1,3073],207:[1,3074],208:[1,3075],209:[1,3076],210:[1,3069],211:[1,3070],212:[1,3071],213:[1,3072],214:3056,215:$Vj8},o($Vq2,$VO4),{19:$Vi,21:$Vj,22:3077,214:45,215:$Vk},{19:$Vk8,21:$Vl8,22:3079,100:[1,3090],108:[1,3091],109:[1,3092],110:3089,181:3080,191:3078,196:3083,197:3084,198:3085,201:3088,204:[1,3093],205:[1,3094],206:[1,3099],207:[1,3100],208:[1,3101],209:[1,3102],210:[1,3095],211:[1,3096],212:[1,3097],213:[1,3098],214:3082,215:$Vm8},o($VA1,$V13),o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),{111:[1,3103]},o($VA1,$Va3),o($Vz2,$VO4),{19:$Vi,21:$Vj,22:3104,214:45,215:$Vk},{19:$Vn8,21:$Vo8,22:3106,100:[1,3117],108:[1,3118],109:[1,3119],110:3116,181:3107,191:3105,196:3110,197:3111,198:3112,201:3115,204:[1,3120],205:[1,3121],206:[1,3126],207:[1,3127],208:[1,3128],209:[1,3129],210:[1,3122],211:[1,3123],212:[1,3124],213:[1,3125],214:3109,215:$Vp8},o($VD1,$Vk5),o($VN1,$VD5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($VG,$VT3),{121:[1,3130]},o($VG,$VH3),o($Vh2,$VP3),o($Vo2,$VO4),{19:$Vi,21:$Vj,22:3131,214:45,215:$Vk},{19:$Vq8,21:$Vr8,22:3133,100:[1,3144],108:[1,3145],109:[1,3146],110:3143,181:3134,191:3132,196:3137,197:3138,198:3139,201:3142,204:[1,3147],205:[1,3148],206:[1,3153],207:[1,3154],208:[1,3155],209:[1,3156],210:[1,3149],211:[1,3150],212:[1,3151],213:[1,3152],214:3136,215:$Vs8},o($Vq2,$VO4),{19:$Vi,21:$Vj,22:3157,214:45,215:$Vk},{19:$Vt8,21:$Vu8,22:3159,100:[1,3170],108:[1,3171],109:[1,3172],110:3169,181:3160,191:3158,196:3163,197:3164,198:3165,201:3168,204:[1,3173],205:[1,3174],206:[1,3179],207:[1,3180],208:[1,3181],209:[1,3182],210:[1,3175],211:[1,3176],212:[1,3177],213:[1,3178],214:3162,215:$Vv8},o($VA1,$V13),o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),{111:[1,3183]},o($VA1,$Va3),o($Vz2,$VO4),{19:$Vi,21:$Vj,22:3184,214:45,215:$Vk},{19:$Vw8,21:$Vx8,22:3186,100:[1,3197],108:[1,3198],109:[1,3199],110:3196,181:3187,191:3185,196:3190,197:3191,198:3192,201:3195,204:[1,3200],205:[1,3201],206:[1,3206],207:[1,3207],208:[1,3208],209:[1,3209],210:[1,3202],211:[1,3203],212:[1,3204],213:[1,3205],214:3189,215:$Vy8},o($VD1,$Vk5),o($VN1,$VD5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($Vr1,$VZ5),o($Vr1,$VK1),o($Vt1,$VZ5),o($Vt1,$VK1),o($VD1,$VZ5),o($VD1,$VK1),o($Vq2,$Vp2,{84:2646,192:2647,83:3210,190:$VE7}),o($VG,$VA2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:3211,121:$VW2,148:$VX2,189:$VY2}),o($Vq2,$Vp2,{84:2646,192:2647,83:3212,190:$VE7}),o($Vt1,$Vs2,{99:2165,95:3213,101:$VX6,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vt2),o($Vh2,$V13),o($VG,$Vw3),o($VG3,$VH3),o($Vr1,$VI3),o($VG3,$VJ3,{31:3214,193:[1,3215]}),{19:$VK3,21:$VL3,22:643,129:3216,199:$VM3,214:646,215:$VN3},o($VG,$VO3),o($Vt1,$VI3),o($VG,$VJ3,{31:3217,193:[1,3218]}),{19:$VK3,21:$VL3,22:643,129:3219,199:$VM3,214:646,215:$VN3},o($Vx1,$VP3),o($VA1,$VQ3),o($VA1,$VR3),o($VA1,$VS3),{100:[1,3220]},o($VA1,$VT1),{100:[1,3222],106:3221,108:[1,3223],109:[1,3224],110:3225,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,3226]},o($Vu1,$VT3),o($VD1,$VI3),o($Vu1,$VJ3,{31:3227,193:[1,3228]}),{19:$VK3,21:$VL3,22:643,129:3229,199:$VM3,214:646,215:$VN3},o($VA1,$VU3),{121:[1,3230]},{19:[1,3233],21:[1,3236],22:3232,87:3231,214:3234,215:[1,3235]},o($Vo2,$V71),o($Vo2,$V81),o($Vo2,$V91),o($Vr1,$Vi5),o($Vr1,$Vj5),{19:$VY6,21:$VZ6,22:3238,87:3237,214:2200,215:$V_6},o($Vq2,$V71),o($Vq2,$V81),o($Vq2,$V91),o($Vt1,$Vi5),o($Vt1,$Vj5),{19:$V$6,21:$V07,22:3240,87:3239,214:2226,215:$V17},o($VA1,$VD5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($Vz2,$V71),o($Vz2,$V81),o($Vz2,$V91),o($VD1,$Vi5),o($VD1,$Vj5),{19:$V27,21:$V37,22:3242,87:3241,214:2253,215:$V47},o($Vo2,$V71),o($Vo2,$V81),o($Vo2,$V91),o($Vr1,$Vi5),o($Vr1,$Vj5),{19:$V57,21:$V67,22:3244,87:3243,214:2280,215:$V77},o($Vq2,$V71),o($Vq2,$V81),o($Vq2,$V91),o($Vt1,$Vi5),o($Vt1,$Vj5),{19:$V87,21:$V97,22:3246,87:3245,214:2306,215:$Va7},o($VA1,$VD5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($Vz2,$V71),o($Vz2,$V81),o($Vz2,$V91),o($VD1,$Vi5),o($VD1,$Vj5),{19:$Vb7,21:$Vc7,22:3248,87:3247,214:2333,215:$Vd7},o($Vz3,$VZ5),o($Vz3,$VK1),o($VA3,$VZ5),o($VA3,$VK1),o($VB3,$VZ5),o($VB3,$VK1),o($Vx3,$Vd2),o($Vx3,$Ve2),o($Vx3,$Vv1),o($Vx3,$Vw1),o($VA3,$Vs1,{82:3249}),o($Vx3,$VE1),o($Vx3,$VF1),{19:[1,3253],21:[1,3257],22:3251,33:3250,200:3252,214:3254,215:[1,3256],216:[1,3255]},{119:[1,3258],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($Vx3,$Vf2),o($Vx3,$Vg2),o($VA3,$Vs1,{82:3259}),o($VG4,$Vy1,{93:3260}),o($VA3,$Vz1,{99:2736,95:3261,101:$VG7,102:$VR,103:$VS,104:$VT}),o($VG4,$VG1),o($VG4,$VH1),o($VG4,$VI1),o($VG4,$VJ1),{100:[1,3262]},o($VG4,$VT1),{70:[1,3263]},o($VH4,$Vp2,{83:3264,84:3265,192:3266,190:[1,3267]}),o($VI4,$Vp2,{83:3268,84:3269,192:3270,190:$Vz8}),o($Vz3,$Vs2,{99:2406,95:3272,101:$Vh7,102:$VR,103:$VS,104:$VT}),o($VC3,$Vt2),o($VA3,$Vu2,{90:3273,95:3274,91:3275,99:3276,105:3278,107:3279,101:$VA8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VA3,$Vw2,{90:3273,95:3274,91:3275,99:3276,105:3278,107:3279,101:$VA8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VA3,$Vx2,{90:3273,95:3274,91:3275,99:3276,105:3278,107:3279,101:$VA8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VE3,$Vy2),o($VK4,$Vp2,{83:3280,84:3281,192:3282,190:[1,3283]}),o($VM5,$VA2),o($VM5,$Vw),o($VM5,$Vx),o($VM5,$Vn),o($VM5,$Vo),o($VM5,$Vy),o($VM5,$Vp),o($VM5,$Vq),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,3284],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:3285,121:$VW2,148:$VX2,189:$VY2}),o($VC3,$V13),o($VE3,$V23),o($VE3,$V33),o($VE3,$V43),o($VE3,$V53),{111:[1,3286]},o($VE3,$Va3),o($VA3,$Vk5),{193:[1,3289],194:3287,195:[1,3288]},o($Vz3,$VP5),o($Vz3,$VQ5),o($Vz3,$VR5),o($Vz3,$Vn),o($Vz3,$Vo),o($Vz3,$VX3),o($Vz3,$VY3),o($Vz3,$VZ3),o($Vz3,$Vp),o($Vz3,$Vq),o($Vz3,$V_3),o($Vz3,$V$3,{202:3290,203:3291,111:[1,3292]}),o($Vz3,$V04),o($Vz3,$V14),o($Vz3,$V24),o($Vz3,$V34),o($Vz3,$V44),o($Vz3,$V54),o($Vz3,$V64),o($Vz3,$V74),o($Vz3,$V84),o($Ve7,$V63),o($Ve7,$V73),o($Ve7,$V83),o($Ve7,$V93),{193:[1,3295],194:3293,195:[1,3294]},o($VA3,$VP5),o($VA3,$VQ5),o($VA3,$VR5),o($VA3,$Vn),o($VA3,$Vo),o($VA3,$VX3),o($VA3,$VY3),o($VA3,$VZ3),o($VA3,$Vp),o($VA3,$Vq),o($VA3,$V_3),o($VA3,$V$3,{202:3296,203:3297,111:[1,3298]}),o($VA3,$V04),o($VA3,$V14),o($VA3,$V24),o($VA3,$V34),o($VA3,$V44),o($VA3,$V54),o($VA3,$V64),o($VA3,$V74),o($VA3,$V84),o($Vf7,$V63),o($Vf7,$V73),o($Vf7,$V83),o($Vf7,$V93),{19:[1,3301],21:[1,3304],22:3300,87:3299,214:3302,215:[1,3303]},{193:[1,3307],194:3305,195:[1,3306]},o($VB3,$VP5),o($VB3,$VQ5),o($VB3,$VR5),o($VB3,$Vn),o($VB3,$Vo),o($VB3,$VX3),o($VB3,$VY3),o($VB3,$VZ3),o($VB3,$Vp),o($VB3,$Vq),o($VB3,$V_3),o($VB3,$V$3,{202:3308,203:3309,111:[1,3310]}),o($VB3,$V04),o($VB3,$V14),o($VB3,$V24),o($VB3,$V34),o($VB3,$V44),o($VB3,$V54),o($VB3,$V64),o($VB3,$V74),o($VB3,$V84),o($Vg7,$V63),o($Vg7,$V73),o($Vg7,$V83),o($Vg7,$V93),o($VA3,$Vk5),{193:[1,3313],194:3311,195:[1,3312]},o($Vz3,$VP5),o($Vz3,$VQ5),o($Vz3,$VR5),o($Vz3,$Vn),o($Vz3,$Vo),o($Vz3,$VX3),o($Vz3,$VY3),o($Vz3,$VZ3),o($Vz3,$Vp),o($Vz3,$Vq),o($Vz3,$V_3),o($Vz3,$V$3,{202:3314,203:3315,111:[1,3316]}),o($Vz3,$V04),o($Vz3,$V14),o($Vz3,$V24),o($Vz3,$V34),o($Vz3,$V44),o($Vz3,$V54),o($Vz3,$V64),o($Vz3,$V74),o($Vz3,$V84),o($Ve7,$V63),o($Ve7,$V73),o($Ve7,$V83),o($Ve7,$V93),{193:[1,3319],194:3317,195:[1,3318]},o($VA3,$VP5),o($VA3,$VQ5),o($VA3,$VR5),o($VA3,$Vn),o($VA3,$Vo),o($VA3,$VX3),o($VA3,$VY3),o($VA3,$VZ3),o($VA3,$Vp),o($VA3,$Vq),o($VA3,$V_3),o($VA3,$V$3,{202:3320,203:3321,111:[1,3322]}),o($VA3,$V04),o($VA3,$V14),o($VA3,$V24),o($VA3,$V34),o($VA3,$V44),o($VA3,$V54),o($VA3,$V64),o($VA3,$V74),o($VA3,$V84),o($Vf7,$V63),o($Vf7,$V73),o($Vf7,$V83),o($Vf7,$V93),{19:[1,3325],21:[1,3328],22:3324,87:3323,214:3326,215:[1,3327]},{193:[1,3331],194:3329,195:[1,3330]},o($VB3,$VP5),o($VB3,$VQ5),o($VB3,$VR5),o($VB3,$Vn),o($VB3,$Vo),o($VB3,$VX3),o($VB3,$VY3),o($VB3,$VZ3),o($VB3,$Vp),o($VB3,$Vq),o($VB3,$V_3),o($VB3,$V$3,{202:3332,203:3333,111:[1,3334]}),o($VB3,$V04),o($VB3,$V14),o($VB3,$V24),o($VB3,$V34),o($VB3,$V44),o($VB3,$V54),o($VB3,$V64),o($VB3,$V74),o($VB3,$V84),o($Vg7,$V63),o($Vg7,$V73),o($Vg7,$V83),o($Vg7,$V93),o($Vn4,$VB8),o($VC6,$VI3),o($Vn4,$VJ3,{31:3335,193:[1,3336]}),{19:$VK3,21:$VL3,22:643,129:3337,199:$VM3,214:646,215:$VN3},o($VK6,$VC8),o($VM6,$VN6,{60:3338}),o($VI,$VJ,{63:3339,73:3340,75:3341,76:3342,92:3345,94:3346,87:3348,88:3349,89:3350,78:3351,44:3352,95:3356,22:3357,91:3359,118:3360,99:3364,214:3367,105:3368,107:3369,19:[1,3366],21:[1,3371],69:[1,3343],71:[1,3344],79:[1,3361],80:[1,3362],81:[1,3363],85:[1,3347],96:[1,3353],97:[1,3354],98:[1,3355],101:$VD8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,3358],215:[1,3370]}),o($VM6,$VE8),o($VI,$VJ,{63:3372,73:3373,75:3374,76:3375,92:3378,94:3379,87:3381,88:3382,89:3383,78:3384,44:3385,95:3389,22:3390,91:3392,118:3393,99:3397,214:3400,105:3401,107:3402,19:[1,3399],21:[1,3404],69:[1,3376],71:[1,3377],79:[1,3394],80:[1,3395],81:[1,3396],85:[1,3380],96:[1,3386],97:[1,3387],98:[1,3388],101:$VF8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,3391],215:[1,3403]}),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:3405,121:$VW2,148:$VX2,189:$VY2}),o($VM6,$VA2),o($VM6,$Vw),o($VM6,$Vx),o($VM6,$Vn),o($VM6,$Vo),o($VM6,$Vy),o($VM6,$Vp),o($VM6,$Vq),o($VM6,$Vs2,{99:2489,95:3406,101:$Vt7,102:$VR,103:$VS,104:$VT}),o($V58,$Vt2),o($V58,$V13),o($VM6,$VG8),o($Vv7,$VP3),o($Vx7,$VQ3),o($Vx7,$VR3),o($Vx7,$VS3),{100:[1,3407]},o($Vx7,$VT1),{100:[1,3409],106:3408,108:[1,3410],109:[1,3411],110:3412,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,3413]},o($Vx7,$VU3),{121:[1,3414]},{19:[1,3417],21:[1,3420],22:3416,87:3415,214:3418,215:[1,3419]},o($Vn4,$VH8),o($V78,$Vs1,{82:3421}),o($V78,$Vi7),o($V78,$Vj7),o($V78,$Vk7),o($V78,$Vl7),o($V78,$Vm7),o($Vc8,$Vn7,{57:3422,51:[1,3423]}),o($Vd8,$Vo7,{61:3424,53:[1,3425]}),o($Ve8,$Vp7),o($Ve8,$Vq7,{74:3426,76:3427,78:3428,44:3429,118:3430,79:[1,3431],80:[1,3432],81:[1,3433],119:$VJ,125:$VJ,127:$VJ,189:$VJ,218:$VJ}),o($Ve8,$Vr7),o($Ve8,$Vs7,{77:3434,73:3435,92:3436,94:3437,95:3441,99:3442,96:[1,3438],97:[1,3439],98:[1,3440],101:$VI8,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:3444,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($Ve8,$Vu7),o($VJ8,$Vy1,{93:3445}),o($VK8,$Vz1,{99:2992,95:3446,101:$Vf8,102:$VR,103:$VS,104:$VT}),o($VL8,$VB1,{86:3447}),o($VL8,$VB1,{86:3448}),o($VL8,$VB1,{86:3449}),o($Ve8,$VC1,{105:2996,107:2997,91:3450,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VM8,$Vz7),o($VM8,$VA7),o($VJ8,$VG1),o($VJ8,$VH1),o($VJ8,$VI1),o($VJ8,$VJ1),o($VL8,$VK1),o($VL1,$VM1,{162:3451}),o($VN8,$VO1),{119:[1,3452],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($VM8,$VE1),o($VM8,$VF1),{19:[1,3456],21:[1,3460],22:3454,33:3453,200:3455,214:3457,215:[1,3459],216:[1,3458]},{100:[1,3461]},o($VJ8,$VT1),o($VL8,$Vn),o($VL8,$Vo),{100:[1,3463],106:3462,108:[1,3464],109:[1,3465],110:3466,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,3467]},o($VL8,$Vp),o($VL8,$Vq),o($V78,$Vs1,{82:3468}),o($Vp4,$VZ5),o($Vp4,$VK1),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:3469}),o($VG,$VE1),o($VG,$VF1),{19:[1,3473],21:[1,3477],22:3471,33:3470,200:3472,214:3474,215:[1,3476],216:[1,3475]},{119:[1,3478],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:3479}),o($Vh2,$Vy1,{93:3480}),o($Vt1,$Vz1,{99:3021,95:3481,101:$Vg8,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,3482]},o($Vh2,$VT1),{70:[1,3483]},o($Vo2,$Vp2,{83:3484,84:3485,192:3486,190:[1,3487]}),o($Vq2,$Vp2,{83:3488,84:3489,192:3490,190:$VO8}),o($Vr1,$Vs2,{99:2558,95:3492,101:$VD7,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vt2),o($Vt1,$Vu2,{90:3493,95:3494,91:3495,99:3496,105:3498,107:3499,101:$VP8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vw2,{90:3493,95:3494,91:3495,99:3496,105:3498,107:3499,101:$VP8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:3493,95:3494,91:3495,99:3496,105:3498,107:3499,101:$VP8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vy2),o($Vz2,$Vp2,{83:3500,84:3501,192:3502,190:[1,3503]}),o($Vu1,$VA2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,3504],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:3505,121:$VW2,148:$VX2,189:$VY2}),o($Vx1,$V13),o($VN1,$V23),o($VN1,$V33),o($VN1,$V43),o($VN1,$V53),{111:[1,3506]},o($VN1,$Va3),o($Vt1,$Vk5),{193:[1,3509],194:3507,195:[1,3508]},o($Vr1,$VP5),o($Vr1,$VQ5),o($Vr1,$VR5),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VX3),o($Vr1,$VY3),o($Vr1,$VZ3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V_3),o($Vr1,$V$3,{202:3510,203:3511,111:[1,3512]}),o($Vr1,$V04),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($VS5,$V63),o($VS5,$V73),o($VS5,$V83),o($VS5,$V93),{193:[1,3515],194:3513,195:[1,3514]},o($Vt1,$VP5),o($Vt1,$VQ5),o($Vt1,$VR5),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VX3),o($Vt1,$VY3),o($Vt1,$VZ3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V_3),o($Vt1,$V$3,{202:3516,203:3517,111:[1,3518]}),o($Vt1,$V04),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($VT5,$V63),o($VT5,$V73),o($VT5,$V83),o($VT5,$V93),{19:[1,3521],21:[1,3524],22:3520,87:3519,214:3522,215:[1,3523]},{193:[1,3527],194:3525,195:[1,3526]},o($VD1,$VP5),o($VD1,$VQ5),o($VD1,$VR5),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VX3),o($VD1,$VY3),o($VD1,$VZ3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V_3),o($VD1,$V$3,{202:3528,203:3529,111:[1,3530]}),o($VD1,$V04),o($VD1,$V14),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VU5,$V63),o($VU5,$V73),o($VU5,$V83),o($VU5,$V93),o($Vt1,$Vk5),{193:[1,3533],194:3531,195:[1,3532]},o($Vr1,$VP5),o($Vr1,$VQ5),o($Vr1,$VR5),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VX3),o($Vr1,$VY3),o($Vr1,$VZ3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V_3),o($Vr1,$V$3,{202:3534,203:3535,111:[1,3536]}),o($Vr1,$V04),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($VS5,$V63),o($VS5,$V73),o($VS5,$V83),o($VS5,$V93),{193:[1,3539],194:3537,195:[1,3538]},o($Vt1,$VP5),o($Vt1,$VQ5),o($Vt1,$VR5),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VX3),o($Vt1,$VY3),o($Vt1,$VZ3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V_3),o($Vt1,$V$3,{202:3540,203:3541,111:[1,3542]}),o($Vt1,$V04),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($VT5,$V63),o($VT5,$V73),o($VT5,$V83),o($VT5,$V93),{19:[1,3545],21:[1,3548],22:3544,87:3543,214:3546,215:[1,3547]},{193:[1,3551],194:3549,195:[1,3550]},o($VD1,$VP5),o($VD1,$VQ5),o($VD1,$VR5),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VX3),o($VD1,$VY3),o($VD1,$VZ3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V_3),o($VD1,$V$3,{202:3552,203:3553,111:[1,3554]}),o($VD1,$V04),o($VD1,$V14),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VU5,$V63),o($VU5,$V73),o($VU5,$V83),o($VU5,$V93),o($VG,$VT3),{121:[1,3555]},o($VG,$VH3),o($Vh2,$VP3),o($Vo2,$VO4),{19:$Vi,21:$Vj,22:3556,214:45,215:$Vk},{19:$VQ8,21:$VR8,22:3558,100:[1,3569],108:[1,3570],109:[1,3571],110:3568,181:3559,191:3557,196:3562,197:3563,198:3564,201:3567,204:[1,3572],205:[1,3573],206:[1,3578],207:[1,3579],208:[1,3580],209:[1,3581],210:[1,3574],211:[1,3575],212:[1,3576],213:[1,3577],214:3561,215:$VS8},o($Vq2,$VO4),{19:$Vi,21:$Vj,22:3582,214:45,215:$Vk},{19:$VT8,21:$VU8,22:3584,100:[1,3595],108:[1,3596],109:[1,3597],110:3594,181:3585,191:3583,196:3588,197:3589,198:3590,201:3593,204:[1,3598],205:[1,3599],206:[1,3604],207:[1,3605],208:[1,3606],209:[1,3607],210:[1,3600],211:[1,3601],212:[1,3602],213:[1,3603],214:3587,215:$VV8},o($VA1,$V13),o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),{111:[1,3608]},o($VA1,$Va3),o($Vz2,$VO4),{19:$Vi,21:$Vj,22:3609,214:45,215:$Vk},{19:$VW8,21:$VX8,22:3611,100:[1,3622],108:[1,3623],109:[1,3624],110:3621,181:3612,191:3610,196:3615,197:3616,198:3617,201:3620,204:[1,3625],205:[1,3626],206:[1,3631],207:[1,3632],208:[1,3633],209:[1,3634],210:[1,3627],211:[1,3628],212:[1,3629],213:[1,3630],214:3614,215:$VY8},o($VD1,$Vk5),o($VN1,$VD5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($Vr1,$VZ5),o($Vr1,$VK1),o($Vt1,$VZ5),o($Vt1,$VK1),o($VD1,$VZ5),o($VD1,$VK1),o($Vr1,$VZ5),o($Vr1,$VK1),o($Vt1,$VZ5),o($Vt1,$VK1),o($VD1,$VZ5),o($VD1,$VK1),o($VI4,$Vp2,{84:3269,192:3270,83:3635,190:$Vz8}),o($Vx3,$VA2),o($Vx3,$Vw),o($Vx3,$Vx),o($Vx3,$Vn),o($Vx3,$Vo),o($Vx3,$Vy),o($Vx3,$Vp),o($Vx3,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:3636,121:$VW2,148:$VX2,189:$VY2}),o($VI4,$Vp2,{84:3269,192:3270,83:3637,190:$Vz8}),o($VA3,$Vs2,{99:2736,95:3638,101:$VG7,102:$VR,103:$VS,104:$VT}),o($VG4,$Vt2),o($VG4,$V13),o($Vx3,$Vw3),o($VL5,$VH3),o($Vz3,$VI3),o($VL5,$VJ3,{31:3639,193:[1,3640]}),{19:$VK3,21:$VL3,22:643,129:3641,199:$VM3,214:646,215:$VN3},o($Vx3,$VO3),o($VA3,$VI3),o($Vx3,$VJ3,{31:3642,193:[1,3643]}),{19:$VK3,21:$VL3,22:643,129:3644,199:$VM3,214:646,215:$VN3},o($VC3,$VP3),o($VD3,$VQ3),o($VD3,$VR3),o($VD3,$VS3),{100:[1,3645]},o($VD3,$VT1),{100:[1,3647],106:3646,108:[1,3648],109:[1,3649],110:3650,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,3651]},o($VM5,$VT3),o($VB3,$VI3),o($VM5,$VJ3,{31:3652,193:[1,3653]}),{19:$VK3,21:$VL3,22:643,129:3654,199:$VM3,214:646,215:$VN3},o($VD3,$VU3),{121:[1,3655]},{19:[1,3658],21:[1,3661],22:3657,87:3656,214:3659,215:[1,3660]},o($VH4,$V71),o($VH4,$V81),o($VH4,$V91),o($Vz3,$Vi5),o($Vz3,$Vj5),{19:$VH7,21:$VI7,22:3663,87:3662,214:2771,215:$VJ7},o($VI4,$V71),o($VI4,$V81),o($VI4,$V91),o($VA3,$Vi5),o($VA3,$Vj5),{19:$VK7,21:$VL7,22:3665,87:3664,214:2797,215:$VM7},o($VD3,$VD5),o($VD3,$VK1),o($VD3,$Vn),o($VD3,$Vo),o($VD3,$Vp),o($VD3,$Vq),o($VK4,$V71),o($VK4,$V81),o($VK4,$V91),o($VB3,$Vi5),o($VB3,$Vj5),{19:$VN7,21:$VO7,22:3667,87:3666,214:2824,215:$VP7},o($VH4,$V71),o($VH4,$V81),o($VH4,$V91),o($Vz3,$Vi5),o($Vz3,$Vj5),{19:$VQ7,21:$VR7,22:3669,87:3668,214:2851,215:$VS7},o($VI4,$V71),o($VI4,$V81),o($VI4,$V91),o($VA3,$Vi5),o($VA3,$Vj5),{19:$VT7,21:$VU7,22:3671,87:3670,214:2877,215:$VV7},o($VD3,$VD5),o($VD3,$VK1),o($VD3,$Vn),o($VD3,$Vo),o($VD3,$Vp),o($VD3,$Vq),o($VK4,$V71),o($VK4,$V81),o($VK4,$V91),o($VB3,$Vi5),o($VB3,$Vj5),{19:$VW7,21:$VX7,22:3673,87:3672,214:2904,215:$VY7},o($VZ7,$VO4),{19:$Vi,21:$Vj,22:3674,214:45,215:$Vk},{19:$VZ8,21:$V_8,22:3676,100:[1,3687],108:[1,3688],109:[1,3689],110:3686,181:3677,191:3675,196:3680,197:3681,198:3682,201:3685,204:[1,3690],205:[1,3691],206:[1,3696],207:[1,3697],208:[1,3698],209:[1,3699],210:[1,3692],211:[1,3693],212:[1,3694],213:[1,3695],214:3679,215:$V$8},o($VK6,$Vo7,{61:3700,53:[1,3701]}),o($VM6,$Vp7),o($VM6,$Vq7,{74:3702,76:3703,78:3704,44:3705,118:3706,79:[1,3707],80:[1,3708],81:[1,3709],119:$VJ,125:$VJ,127:$VJ,189:$VJ,218:$VJ}),o($VM6,$Vr7),o($VM6,$Vs7,{77:3710,73:3711,92:3712,94:3713,95:3717,99:3718,96:[1,3714],97:[1,3715],98:[1,3716],101:$V09,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:3720,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VM6,$Vu7),o($Vv7,$Vy1,{93:3721}),o($Vw7,$Vz1,{99:3364,95:3722,101:$VD8,102:$VR,103:$VS,104:$VT}),o($Vx7,$VB1,{86:3723}),o($Vx7,$VB1,{86:3724}),o($Vx7,$VB1,{86:3725}),o($VM6,$VC1,{105:3368,107:3369,91:3726,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vy7,$Vz7),o($Vy7,$VA7),o($Vv7,$VG1),o($Vv7,$VH1),o($Vv7,$VI1),o($Vv7,$VJ1),o($Vx7,$VK1),o($VL1,$VM1,{162:3727}),o($VB7,$VO1),{119:[1,3728],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($Vy7,$VE1),o($Vy7,$VF1),{19:[1,3732],21:[1,3736],22:3730,33:3729,200:3731,214:3733,215:[1,3735],216:[1,3734]},{100:[1,3737]},o($Vv7,$VT1),o($Vx7,$Vn),o($Vx7,$Vo),{100:[1,3739],106:3738,108:[1,3740],109:[1,3741],110:3742,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,3743]},o($Vx7,$Vp),o($Vx7,$Vq),o($VM6,$Vp7),o($VM6,$Vq7,{74:3744,76:3745,78:3746,44:3747,118:3748,79:[1,3749],80:[1,3750],81:[1,3751],119:$VJ,125:$VJ,127:$VJ,189:$VJ,218:$VJ}),o($VM6,$Vr7),o($VM6,$Vs7,{77:3752,73:3753,92:3754,94:3755,95:3759,99:3760,96:[1,3756],97:[1,3757],98:[1,3758],101:$V19,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:3762,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VM6,$Vu7),o($Vv7,$Vy1,{93:3763}),o($Vw7,$Vz1,{99:3397,95:3764,101:$VF8,102:$VR,103:$VS,104:$VT}),o($Vx7,$VB1,{86:3765}),o($Vx7,$VB1,{86:3766}),o($Vx7,$VB1,{86:3767}),o($VM6,$VC1,{105:3401,107:3402,91:3768,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vy7,$Vz7),o($Vy7,$VA7),o($Vv7,$VG1),o($Vv7,$VH1),o($Vv7,$VI1),o($Vv7,$VJ1),o($Vx7,$VK1),o($VL1,$VM1,{162:3769}),o($VB7,$VO1),{119:[1,3770],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($Vy7,$VE1),o($Vy7,$VF1),{19:[1,3774],21:[1,3778],22:3772,33:3771,200:3773,214:3775,215:[1,3777],216:[1,3776]},{100:[1,3779]},o($Vv7,$VT1),o($Vx7,$Vn),o($Vx7,$Vo),{100:[1,3781],106:3780,108:[1,3782],109:[1,3783],110:3784,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,3785]},o($Vx7,$Vp),o($Vx7,$Vq),{121:[1,3786]},o($V58,$VP3),o($Vx7,$V13),o($Vx7,$V23),o($Vx7,$V33),o($Vx7,$V43),o($Vx7,$V53),{111:[1,3787]},o($Vx7,$Va3),o($Vy7,$Vk5),o($VB7,$VD5),o($VB7,$VK1),o($VB7,$Vn),o($VB7,$Vo),o($VB7,$Vp),o($VB7,$Vq),o($V29,$Vp2,{83:3788,84:3789,192:3790,190:$V39}),o($Vd8,$V$7),o($Vr,$Vs,{55:3792,59:3793,40:3794,43:$Vt}),o($Ve8,$V08),o($Vr,$Vs,{59:3795,40:3796,43:$Vt}),o($Ve8,$V18),o($Ve8,$V28),o($Ve8,$Vz7),o($Ve8,$VA7),{119:[1,3797],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($Ve8,$VE1),o($Ve8,$VF1),{19:[1,3801],21:[1,3805],22:3799,33:3798,200:3800,214:3802,215:[1,3804],216:[1,3803]},o($Ve8,$V38),o($Ve8,$V48),o($V49,$Vy1,{93:3806}),o($Ve8,$Vz1,{99:3442,95:3807,101:$VI8,102:$VR,103:$VS,104:$VT}),o($V49,$VG1),o($V49,$VH1),o($V49,$VI1),o($V49,$VJ1),{100:[1,3808]},o($V49,$VT1),{70:[1,3809]},o($VK8,$Vs2,{99:2992,95:3810,101:$Vf8,102:$VR,103:$VS,104:$VT}),o($VJ8,$Vt2),o($Ve8,$Vu2,{90:3811,95:3812,91:3813,99:3814,105:3816,107:3817,101:$V59,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Ve8,$Vw2,{90:3811,95:3812,91:3813,99:3814,105:3816,107:3817,101:$V59,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Ve8,$Vx2,{90:3811,95:3812,91:3813,99:3814,105:3816,107:3817,101:$V59,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN8,$Vy2),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,3818],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:3819,121:$VW2,148:$VX2,189:$VY2}),o($VM8,$VA2),o($VM8,$Vw),o($VM8,$Vx),o($VM8,$Vn),o($VM8,$Vo),o($VM8,$Vy),o($VM8,$Vp),o($VM8,$Vq),o($VJ8,$V13),o($VN8,$V23),o($VN8,$V33),o($VN8,$V43),o($VN8,$V53),{111:[1,3820]},o($VN8,$Va3),o($V29,$Vp2,{84:3789,192:3790,83:3821,190:$V39}),o($Vq2,$Vp2,{84:3489,192:3490,83:3822,190:$VO8}),o($VG,$VA2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:3823,121:$VW2,148:$VX2,189:$VY2}),o($Vq2,$Vp2,{84:3489,192:3490,83:3824,190:$VO8}),o($Vt1,$Vs2,{99:3021,95:3825,101:$Vg8,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vt2),o($Vh2,$V13),o($VG,$Vw3),o($VG3,$VH3),o($Vr1,$VI3),o($VG3,$VJ3,{31:3826,193:[1,3827]}),{19:$VK3,21:$VL3,22:643,129:3828,199:$VM3,214:646,215:$VN3},o($VG,$VO3),o($Vt1,$VI3),o($VG,$VJ3,{31:3829,193:[1,3830]}),{19:$VK3,21:$VL3,22:643,129:3831,199:$VM3,214:646,215:$VN3},o($Vx1,$VP3),o($VA1,$VQ3),o($VA1,$VR3),o($VA1,$VS3),{100:[1,3832]},o($VA1,$VT1),{100:[1,3834],106:3833,108:[1,3835],109:[1,3836],110:3837,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,3838]},o($Vu1,$VT3),o($VD1,$VI3),o($Vu1,$VJ3,{31:3839,193:[1,3840]}),{19:$VK3,21:$VL3,22:643,129:3841,199:$VM3,214:646,215:$VN3},o($VA1,$VU3),{121:[1,3842]},{19:[1,3845],21:[1,3848],22:3844,87:3843,214:3846,215:[1,3847]},o($Vo2,$V71),o($Vo2,$V81),o($Vo2,$V91),o($Vr1,$Vi5),o($Vr1,$Vj5),{19:$Vh8,21:$Vi8,22:3850,87:3849,214:3056,215:$Vj8},o($Vq2,$V71),o($Vq2,$V81),o($Vq2,$V91),o($Vt1,$Vi5),o($Vt1,$Vj5),{19:$Vk8,21:$Vl8,22:3852,87:3851,214:3082,215:$Vm8},o($VA1,$VD5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($Vz2,$V71),o($Vz2,$V81),o($Vz2,$V91),o($VD1,$Vi5),o($VD1,$Vj5),{19:$Vn8,21:$Vo8,22:3854,87:3853,214:3109,215:$Vp8},o($Vo2,$V71),o($Vo2,$V81),o($Vo2,$V91),o($Vr1,$Vi5),o($Vr1,$Vj5),{19:$Vq8,21:$Vr8,22:3856,87:3855,214:3136,215:$Vs8},o($Vq2,$V71),o($Vq2,$V81),o($Vq2,$V91),o($Vt1,$Vi5),o($Vt1,$Vj5),{19:$Vt8,21:$Vu8,22:3858,87:3857,214:3162,215:$Vv8},o($VA1,$VD5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($Vz2,$V71),o($Vz2,$V81),o($Vz2,$V91),o($VD1,$Vi5),o($VD1,$Vj5),{19:$Vw8,21:$Vx8,22:3860,87:3859,214:3189,215:$Vy8},o($Vt1,$Vk5),{193:[1,3863],194:3861,195:[1,3862]},o($Vr1,$VP5),o($Vr1,$VQ5),o($Vr1,$VR5),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VX3),o($Vr1,$VY3),o($Vr1,$VZ3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V_3),o($Vr1,$V$3,{202:3864,203:3865,111:[1,3866]}),o($Vr1,$V04),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($VS5,$V63),o($VS5,$V73),o($VS5,$V83),o($VS5,$V93),{193:[1,3869],194:3867,195:[1,3868]},o($Vt1,$VP5),o($Vt1,$VQ5),o($Vt1,$VR5),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VX3),o($Vt1,$VY3),o($Vt1,$VZ3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V_3),o($Vt1,$V$3,{202:3870,203:3871,111:[1,3872]}),o($Vt1,$V04),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($VT5,$V63),o($VT5,$V73),o($VT5,$V83),o($VT5,$V93),{19:[1,3875],21:[1,3878],22:3874,87:3873,214:3876,215:[1,3877]},{193:[1,3881],194:3879,195:[1,3880]},o($VD1,$VP5),o($VD1,$VQ5),o($VD1,$VR5),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VX3),o($VD1,$VY3),o($VD1,$VZ3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V_3),o($VD1,$V$3,{202:3882,203:3883,111:[1,3884]}),o($VD1,$V04),o($VD1,$V14),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VU5,$V63),o($VU5,$V73),o($VU5,$V83),o($VU5,$V93),o($Vx3,$VT3),{121:[1,3885]},o($Vx3,$VH3),o($VG4,$VP3),o($VH4,$VO4),{19:$Vi,21:$Vj,22:3886,214:45,215:$Vk},{19:$V69,21:$V79,22:3888,100:[1,3899],108:[1,3900],109:[1,3901],110:3898,181:3889,191:3887,196:3892,197:3893,198:3894,201:3897,204:[1,3902],205:[1,3903],206:[1,3908],207:[1,3909],208:[1,3910],209:[1,3911],210:[1,3904],211:[1,3905],212:[1,3906],213:[1,3907],214:3891,215:$V89},o($VI4,$VO4),{19:$Vi,21:$Vj,22:3912,214:45,215:$Vk},{19:$V99,21:$Va9,22:3914,100:[1,3925],108:[1,3926],109:[1,3927],110:3924,181:3915,191:3913,196:3918,197:3919,198:3920,201:3923,204:[1,3928],205:[1,3929],206:[1,3934],207:[1,3935],208:[1,3936],209:[1,3937],210:[1,3930],211:[1,3931],212:[1,3932],213:[1,3933],214:3917,215:$Vb9},o($VD3,$V13),o($VD3,$V23),o($VD3,$V33),o($VD3,$V43),o($VD3,$V53),{111:[1,3938]},o($VD3,$Va3),o($VK4,$VO4),{19:$Vi,21:$Vj,22:3939,214:45,215:$Vk},{19:$Vc9,21:$Vd9,22:3941,100:[1,3952],108:[1,3953],109:[1,3954],110:3951,181:3942,191:3940,196:3945,197:3946,198:3947,201:3950,204:[1,3955],205:[1,3956],206:[1,3961],207:[1,3962],208:[1,3963],209:[1,3964],210:[1,3957],211:[1,3958],212:[1,3959],213:[1,3960],214:3944,215:$Ve9},o($VB3,$Vk5),o($VE3,$VD5),o($VE3,$VK1),o($VE3,$Vn),o($VE3,$Vo),o($VE3,$Vp),o($VE3,$Vq),o($Vz3,$VZ5),o($Vz3,$VK1),o($VA3,$VZ5),o($VA3,$VK1),o($VB3,$VZ5),o($VB3,$VK1),o($Vz3,$VZ5),o($Vz3,$VK1),o($VA3,$VZ5),o($VA3,$VK1),o($VB3,$VZ5),o($VB3,$VK1),{193:[1,3967],194:3965,195:[1,3966]},o($VC6,$VP5),o($VC6,$VQ5),o($VC6,$VR5),o($VC6,$Vn),o($VC6,$Vo),o($VC6,$VX3),o($VC6,$VY3),o($VC6,$VZ3),o($VC6,$Vp),o($VC6,$Vq),o($VC6,$V_3),o($VC6,$V$3,{202:3968,203:3969,111:[1,3970]}),o($VC6,$V04),o($VC6,$V14),o($VC6,$V24),o($VC6,$V34),o($VC6,$V44),o($VC6,$V54),o($VC6,$V64),o($VC6,$V74),o($VC6,$V84),o($Vf9,$V63),o($Vf9,$V73),o($Vf9,$V83),o($Vf9,$V93),o($VM6,$V08),o($Vr,$Vs,{59:3971,40:3972,43:$Vt}),o($VM6,$V18),o($VM6,$V28),o($VM6,$Vz7),o($VM6,$VA7),{119:[1,3973],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($VM6,$VE1),o($VM6,$VF1),{19:[1,3977],21:[1,3981],22:3975,33:3974,200:3976,214:3978,215:[1,3980],216:[1,3979]},o($VM6,$V38),o($VM6,$V48),o($V58,$Vy1,{93:3982}),o($VM6,$Vz1,{99:3718,95:3983,101:$V09,102:$VR,103:$VS,104:$VT}),o($V58,$VG1),o($V58,$VH1),o($V58,$VI1),o($V58,$VJ1),{100:[1,3984]},o($V58,$VT1),{70:[1,3985]},o($Vw7,$Vs2,{99:3364,95:3986,101:$VD8,102:$VR,103:$VS,104:$VT}),o($Vv7,$Vt2),o($VM6,$Vu2,{90:3987,95:3988,91:3989,99:3990,105:3992,107:3993,101:$Vg9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VM6,$Vw2,{90:3987,95:3988,91:3989,99:3990,105:3992,107:3993,101:$Vg9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VM6,$Vx2,{90:3987,95:3988,91:3989,99:3990,105:3992,107:3993,101:$Vg9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VB7,$Vy2),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,3994],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:3995,121:$VW2,148:$VX2,189:$VY2}),o($Vy7,$VA2),o($Vy7,$Vw),o($Vy7,$Vx),o($Vy7,$Vn),o($Vy7,$Vo),o($Vy7,$Vy),o($Vy7,$Vp),o($Vy7,$Vq),o($Vv7,$V13),o($VB7,$V23),o($VB7,$V33),o($VB7,$V43),o($VB7,$V53),{111:[1,3996]},o($VB7,$Va3),o($VM6,$V18),o($VM6,$V28),o($VM6,$Vz7),o($VM6,$VA7),{119:[1,3997],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($VM6,$VE1),o($VM6,$VF1),{19:[1,4001],21:[1,4005],22:3999,33:3998,200:4000,214:4002,215:[1,4004],216:[1,4003]},o($VM6,$V38),o($VM6,$V48),o($V58,$Vy1,{93:4006}),o($VM6,$Vz1,{99:3760,95:4007,101:$V19,102:$VR,103:$VS,104:$VT}),o($V58,$VG1),o($V58,$VH1),o($V58,$VI1),o($V58,$VJ1),{100:[1,4008]},o($V58,$VT1),{70:[1,4009]},o($Vw7,$Vs2,{99:3397,95:4010,101:$VF8,102:$VR,103:$VS,104:$VT}),o($Vv7,$Vt2),o($VM6,$Vu2,{90:4011,95:4012,91:4013,99:4014,105:4016,107:4017,101:$Vh9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VM6,$Vw2,{90:4011,95:4012,91:4013,99:4014,105:4016,107:4017,101:$Vh9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VM6,$Vx2,{90:4011,95:4012,91:4013,99:4014,105:4016,107:4017,101:$Vh9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VB7,$Vy2),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,4018],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4019,121:$VW2,148:$VX2,189:$VY2}),o($Vy7,$VA2),o($Vy7,$Vw),o($Vy7,$Vx),o($Vy7,$Vn),o($Vy7,$Vo),o($Vy7,$Vy),o($Vy7,$Vp),o($Vy7,$Vq),o($Vv7,$V13),o($VB7,$V23),o($VB7,$V33),o($VB7,$V43),o($VB7,$V53),{111:[1,4020]},o($VB7,$Va3),o($VM6,$Vk5),{19:[1,4023],21:[1,4026],22:4022,87:4021,214:4024,215:[1,4025]},o($V96,$VB8),o($V78,$VI3),o($V96,$VJ3,{31:4027,193:[1,4028]}),{19:$VK3,21:$VL3,22:643,129:4029,199:$VM3,214:646,215:$VN3},o($Vd8,$VC8),o($Ve8,$VN6,{60:4030}),o($VI,$VJ,{63:4031,73:4032,75:4033,76:4034,92:4037,94:4038,87:4040,88:4041,89:4042,78:4043,44:4044,95:4048,22:4049,91:4051,118:4052,99:4056,214:4059,105:4060,107:4061,19:[1,4058],21:[1,4063],69:[1,4035],71:[1,4036],79:[1,4053],80:[1,4054],81:[1,4055],85:[1,4039],96:[1,4045],97:[1,4046],98:[1,4047],101:$Vi9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,4050],215:[1,4062]}),o($Ve8,$VE8),o($VI,$VJ,{63:4064,73:4065,75:4066,76:4067,92:4070,94:4071,87:4073,88:4074,89:4075,78:4076,44:4077,95:4081,22:4082,91:4084,118:4085,99:4089,214:4092,105:4093,107:4094,19:[1,4091],21:[1,4096],69:[1,4068],71:[1,4069],79:[1,4086],80:[1,4087],81:[1,4088],85:[1,4072],96:[1,4078],97:[1,4079],98:[1,4080],101:$Vj9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,4083],215:[1,4095]}),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4097,121:$VW2,148:$VX2,189:$VY2}),o($Ve8,$VA2),o($Ve8,$Vw),o($Ve8,$Vx),o($Ve8,$Vn),o($Ve8,$Vo),o($Ve8,$Vy),o($Ve8,$Vp),o($Ve8,$Vq),o($Ve8,$Vs2,{99:3442,95:4098,101:$VI8,102:$VR,103:$VS,104:$VT}),o($V49,$Vt2),o($V49,$V13),o($Ve8,$VG8),o($VJ8,$VP3),o($VL8,$VQ3),o($VL8,$VR3),o($VL8,$VS3),{100:[1,4099]},o($VL8,$VT1),{100:[1,4101],106:4100,108:[1,4102],109:[1,4103],110:4104,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4105]},o($VL8,$VU3),{121:[1,4106]},{19:[1,4109],21:[1,4112],22:4108,87:4107,214:4110,215:[1,4111]},o($V96,$VH8),o($VG,$VT3),{121:[1,4113]},o($VG,$VH3),o($Vh2,$VP3),o($Vo2,$VO4),{19:$Vi,21:$Vj,22:4114,214:45,215:$Vk},{19:$Vk9,21:$Vl9,22:4116,100:[1,4127],108:[1,4128],109:[1,4129],110:4126,181:4117,191:4115,196:4120,197:4121,198:4122,201:4125,204:[1,4130],205:[1,4131],206:[1,4136],207:[1,4137],208:[1,4138],209:[1,4139],210:[1,4132],211:[1,4133],212:[1,4134],213:[1,4135],214:4119,215:$Vm9},o($Vq2,$VO4),{19:$Vi,21:$Vj,22:4140,214:45,215:$Vk},{19:$Vn9,21:$Vo9,22:4142,100:[1,4153],108:[1,4154],109:[1,4155],110:4152,181:4143,191:4141,196:4146,197:4147,198:4148,201:4151,204:[1,4156],205:[1,4157],206:[1,4162],207:[1,4163],208:[1,4164],209:[1,4165],210:[1,4158],211:[1,4159],212:[1,4160],213:[1,4161],214:4145,215:$Vp9},o($VA1,$V13),o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),{111:[1,4166]},o($VA1,$Va3),o($Vz2,$VO4),{19:$Vi,21:$Vj,22:4167,214:45,215:$Vk},{19:$Vq9,21:$Vr9,22:4169,100:[1,4180],108:[1,4181],109:[1,4182],110:4179,181:4170,191:4168,196:4173,197:4174,198:4175,201:4178,204:[1,4183],205:[1,4184],206:[1,4189],207:[1,4190],208:[1,4191],209:[1,4192],210:[1,4185],211:[1,4186],212:[1,4187],213:[1,4188],214:4172,215:$Vs9},o($VD1,$Vk5),o($VN1,$VD5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($Vr1,$VZ5),o($Vr1,$VK1),o($Vt1,$VZ5),o($Vt1,$VK1),o($VD1,$VZ5),o($VD1,$VK1),o($Vr1,$VZ5),o($Vr1,$VK1),o($Vt1,$VZ5),o($Vt1,$VK1),o($VD1,$VZ5),o($VD1,$VK1),o($Vo2,$V71),o($Vo2,$V81),o($Vo2,$V91),o($Vr1,$Vi5),o($Vr1,$Vj5),{19:$VQ8,21:$VR8,22:4194,87:4193,214:3561,215:$VS8},o($Vq2,$V71),o($Vq2,$V81),o($Vq2,$V91),o($Vt1,$Vi5),o($Vt1,$Vj5),{19:$VT8,21:$VU8,22:4196,87:4195,214:3587,215:$VV8},o($VA1,$VD5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($Vz2,$V71),o($Vz2,$V81),o($Vz2,$V91),o($VD1,$Vi5),o($VD1,$Vj5),{19:$VW8,21:$VX8,22:4198,87:4197,214:3614,215:$VY8},o($VA3,$Vk5),{193:[1,4201],194:4199,195:[1,4200]},o($Vz3,$VP5),o($Vz3,$VQ5),o($Vz3,$VR5),o($Vz3,$Vn),o($Vz3,$Vo),o($Vz3,$VX3),o($Vz3,$VY3),o($Vz3,$VZ3),o($Vz3,$Vp),o($Vz3,$Vq),o($Vz3,$V_3),o($Vz3,$V$3,{202:4202,203:4203,111:[1,4204]}),o($Vz3,$V04),o($Vz3,$V14),o($Vz3,$V24),o($Vz3,$V34),o($Vz3,$V44),o($Vz3,$V54),o($Vz3,$V64),o($Vz3,$V74),o($Vz3,$V84),o($Ve7,$V63),o($Ve7,$V73),o($Ve7,$V83),o($Ve7,$V93),{193:[1,4207],194:4205,195:[1,4206]},o($VA3,$VP5),o($VA3,$VQ5),o($VA3,$VR5),o($VA3,$Vn),o($VA3,$Vo),o($VA3,$VX3),o($VA3,$VY3),o($VA3,$VZ3),o($VA3,$Vp),o($VA3,$Vq),o($VA3,$V_3),o($VA3,$V$3,{202:4208,203:4209,111:[1,4210]}),o($VA3,$V04),o($VA3,$V14),o($VA3,$V24),o($VA3,$V34),o($VA3,$V44),o($VA3,$V54),o($VA3,$V64),o($VA3,$V74),o($VA3,$V84),o($Vf7,$V63),o($Vf7,$V73),o($Vf7,$V83),o($Vf7,$V93),{19:[1,4213],21:[1,4216],22:4212,87:4211,214:4214,215:[1,4215]},{193:[1,4219],194:4217,195:[1,4218]},o($VB3,$VP5),o($VB3,$VQ5),o($VB3,$VR5),o($VB3,$Vn),o($VB3,$Vo),o($VB3,$VX3),o($VB3,$VY3),o($VB3,$VZ3),o($VB3,$Vp),o($VB3,$Vq),o($VB3,$V_3),o($VB3,$V$3,{202:4220,203:4221,111:[1,4222]}),o($VB3,$V04),o($VB3,$V14),o($VB3,$V24),o($VB3,$V34),o($VB3,$V44),o($VB3,$V54),o($VB3,$V64),o($VB3,$V74),o($VB3,$V84),o($Vg7,$V63),o($Vg7,$V73),o($Vg7,$V83),o($Vg7,$V93),o($VZ7,$V71),o($VZ7,$V81),o($VZ7,$V91),o($VC6,$Vi5),o($VC6,$Vj5),{19:$VZ8,21:$V_8,22:4224,87:4223,214:3679,215:$V$8},o($VM6,$VE8),o($VI,$VJ,{63:4225,73:4226,75:4227,76:4228,92:4231,94:4232,87:4234,88:4235,89:4236,78:4237,44:4238,95:4242,22:4243,91:4245,118:4246,99:4250,214:4253,105:4254,107:4255,19:[1,4252],21:[1,4257],69:[1,4229],71:[1,4230],79:[1,4247],80:[1,4248],81:[1,4249],85:[1,4233],96:[1,4239],97:[1,4240],98:[1,4241],101:$Vt9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,4244],215:[1,4256]}),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4258,121:$VW2,148:$VX2,189:$VY2}),o($VM6,$VA2),o($VM6,$Vw),o($VM6,$Vx),o($VM6,$Vn),o($VM6,$Vo),o($VM6,$Vy),o($VM6,$Vp),o($VM6,$Vq),o($VM6,$Vs2,{99:3718,95:4259,101:$V09,102:$VR,103:$VS,104:$VT}),o($V58,$Vt2),o($V58,$V13),o($VM6,$VG8),o($Vv7,$VP3),o($Vx7,$VQ3),o($Vx7,$VR3),o($Vx7,$VS3),{100:[1,4260]},o($Vx7,$VT1),{100:[1,4262],106:4261,108:[1,4263],109:[1,4264],110:4265,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4266]},o($Vx7,$VU3),{121:[1,4267]},{19:[1,4270],21:[1,4273],22:4269,87:4268,214:4271,215:[1,4272]},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4274,121:$VW2,148:$VX2,189:$VY2}),o($VM6,$VA2),o($VM6,$Vw),o($VM6,$Vx),o($VM6,$Vn),o($VM6,$Vo),o($VM6,$Vy),o($VM6,$Vp),o($VM6,$Vq),o($VM6,$Vs2,{99:3760,95:4275,101:$V19,102:$VR,103:$VS,104:$VT}),o($V58,$Vt2),o($V58,$V13),o($VM6,$VG8),o($Vv7,$VP3),o($Vx7,$VQ3),o($Vx7,$VR3),o($Vx7,$VS3),{100:[1,4276]},o($Vx7,$VT1),{100:[1,4278],106:4277,108:[1,4279],109:[1,4280],110:4281,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4282]},o($Vx7,$VU3),{121:[1,4283]},{19:[1,4286],21:[1,4289],22:4285,87:4284,214:4287,215:[1,4288]},o($Vx7,$VD5),o($Vx7,$VK1),o($Vx7,$Vn),o($Vx7,$Vo),o($Vx7,$Vp),o($Vx7,$Vq),o($V29,$VO4),{19:$Vi,21:$Vj,22:4290,214:45,215:$Vk},{19:$Vu9,21:$Vv9,22:4292,100:[1,4303],108:[1,4304],109:[1,4305],110:4302,181:4293,191:4291,196:4296,197:4297,198:4298,201:4301,204:[1,4306],205:[1,4307],206:[1,4312],207:[1,4313],208:[1,4314],209:[1,4315],210:[1,4308],211:[1,4309],212:[1,4310],213:[1,4311],214:4295,215:$Vw9},o($Vd8,$Vo7,{61:4316,53:[1,4317]}),o($Ve8,$Vp7),o($Ve8,$Vq7,{74:4318,76:4319,78:4320,44:4321,118:4322,79:[1,4323],80:[1,4324],81:[1,4325],119:$VJ,125:$VJ,127:$VJ,189:$VJ,218:$VJ}),o($Ve8,$Vr7),o($Ve8,$Vs7,{77:4326,73:4327,92:4328,94:4329,95:4333,99:4334,96:[1,4330],97:[1,4331],98:[1,4332],101:$Vx9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:4336,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($Ve8,$Vu7),o($VJ8,$Vy1,{93:4337}),o($VK8,$Vz1,{99:4056,95:4338,101:$Vi9,102:$VR,103:$VS,104:$VT}),o($VL8,$VB1,{86:4339}),o($VL8,$VB1,{86:4340}),o($VL8,$VB1,{86:4341}),o($Ve8,$VC1,{105:4060,107:4061,91:4342,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VM8,$Vz7),o($VM8,$VA7),o($VJ8,$VG1),o($VJ8,$VH1),o($VJ8,$VI1),o($VJ8,$VJ1),o($VL8,$VK1),o($VL1,$VM1,{162:4343}),o($VN8,$VO1),{119:[1,4344],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($VM8,$VE1),o($VM8,$VF1),{19:[1,4348],21:[1,4352],22:4346,33:4345,200:4347,214:4349,215:[1,4351],216:[1,4350]},{100:[1,4353]},o($VJ8,$VT1),o($VL8,$Vn),o($VL8,$Vo),{100:[1,4355],106:4354,108:[1,4356],109:[1,4357],110:4358,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4359]},o($VL8,$Vp),o($VL8,$Vq),o($Ve8,$Vp7),o($Ve8,$Vq7,{74:4360,76:4361,78:4362,44:4363,118:4364,79:[1,4365],80:[1,4366],81:[1,4367],119:$VJ,125:$VJ,127:$VJ,189:$VJ,218:$VJ}),o($Ve8,$Vr7),o($Ve8,$Vs7,{77:4368,73:4369,92:4370,94:4371,95:4375,99:4376,96:[1,4372],97:[1,4373],98:[1,4374],101:$Vy9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:4378,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($Ve8,$Vu7),o($VJ8,$Vy1,{93:4379}),o($VK8,$Vz1,{99:4089,95:4380,101:$Vj9,102:$VR,103:$VS,104:$VT}),o($VL8,$VB1,{86:4381}),o($VL8,$VB1,{86:4382}),o($VL8,$VB1,{86:4383}),o($Ve8,$VC1,{105:4093,107:4094,91:4384,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VM8,$Vz7),o($VM8,$VA7),o($VJ8,$VG1),o($VJ8,$VH1),o($VJ8,$VI1),o($VJ8,$VJ1),o($VL8,$VK1),o($VL1,$VM1,{162:4385}),o($VN8,$VO1),{119:[1,4386],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($VM8,$VE1),o($VM8,$VF1),{19:[1,4390],21:[1,4394],22:4388,33:4387,200:4389,214:4391,215:[1,4393],216:[1,4392]},{100:[1,4395]},o($VJ8,$VT1),o($VL8,$Vn),o($VL8,$Vo),{100:[1,4397],106:4396,108:[1,4398],109:[1,4399],110:4400,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4401]},o($VL8,$Vp),o($VL8,$Vq),{121:[1,4402]},o($V49,$VP3),o($VL8,$V13),o($VL8,$V23),o($VL8,$V33),o($VL8,$V43),o($VL8,$V53),{111:[1,4403]},o($VL8,$Va3),o($VM8,$Vk5),o($VN8,$VD5),o($VN8,$VK1),o($VN8,$Vn),o($VN8,$Vo),o($VN8,$Vp),o($VN8,$Vq),o($Vt1,$Vk5),{193:[1,4406],194:4404,195:[1,4405]},o($Vr1,$VP5),o($Vr1,$VQ5),o($Vr1,$VR5),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VX3),o($Vr1,$VY3),o($Vr1,$VZ3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V_3),o($Vr1,$V$3,{202:4407,203:4408,111:[1,4409]}),o($Vr1,$V04),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($VS5,$V63),o($VS5,$V73),o($VS5,$V83),o($VS5,$V93),{193:[1,4412],194:4410,195:[1,4411]},o($Vt1,$VP5),o($Vt1,$VQ5),o($Vt1,$VR5),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VX3),o($Vt1,$VY3),o($Vt1,$VZ3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V_3),o($Vt1,$V$3,{202:4413,203:4414,111:[1,4415]}),o($Vt1,$V04),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($VT5,$V63),o($VT5,$V73),o($VT5,$V83),o($VT5,$V93),{19:[1,4418],21:[1,4421],22:4417,87:4416,214:4419,215:[1,4420]},{193:[1,4424],194:4422,195:[1,4423]},o($VD1,$VP5),o($VD1,$VQ5),o($VD1,$VR5),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VX3),o($VD1,$VY3),o($VD1,$VZ3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V_3),o($VD1,$V$3,{202:4425,203:4426,111:[1,4427]}),o($VD1,$V04),o($VD1,$V14),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VU5,$V63),o($VU5,$V73),o($VU5,$V83),o($VU5,$V93),o($Vr1,$VZ5),o($Vr1,$VK1),o($Vt1,$VZ5),o($Vt1,$VK1),o($VD1,$VZ5),o($VD1,$VK1),o($VH4,$V71),o($VH4,$V81),o($VH4,$V91),o($Vz3,$Vi5),o($Vz3,$Vj5),{19:$V69,21:$V79,22:4429,87:4428,214:3891,215:$V89},o($VI4,$V71),o($VI4,$V81),o($VI4,$V91),o($VA3,$Vi5),o($VA3,$Vj5),{19:$V99,21:$Va9,22:4431,87:4430,214:3917,215:$Vb9},o($VD3,$VD5),o($VD3,$VK1),o($VD3,$Vn),o($VD3,$Vo),o($VD3,$Vp),o($VD3,$Vq),o($VK4,$V71),o($VK4,$V81),o($VK4,$V91),o($VB3,$Vi5),o($VB3,$Vj5),{19:$Vc9,21:$Vd9,22:4433,87:4432,214:3944,215:$Ve9},o($VC6,$VZ5),o($VC6,$VK1),o($VM6,$Vp7),o($VM6,$Vq7,{74:4434,76:4435,78:4436,44:4437,118:4438,79:[1,4439],80:[1,4440],81:[1,4441],119:$VJ,125:$VJ,127:$VJ,189:$VJ,218:$VJ}),o($VM6,$Vr7),o($VM6,$Vs7,{77:4442,73:4443,92:4444,94:4445,95:4449,99:4450,96:[1,4446],97:[1,4447],98:[1,4448],101:$Vz9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:4452,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VM6,$Vu7),o($Vv7,$Vy1,{93:4453}),o($Vw7,$Vz1,{99:4250,95:4454,101:$Vt9,102:$VR,103:$VS,104:$VT}),o($Vx7,$VB1,{86:4455}),o($Vx7,$VB1,{86:4456}),o($Vx7,$VB1,{86:4457}),o($VM6,$VC1,{105:4254,107:4255,91:4458,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vy7,$Vz7),o($Vy7,$VA7),o($Vv7,$VG1),o($Vv7,$VH1),o($Vv7,$VI1),o($Vv7,$VJ1),o($Vx7,$VK1),o($VL1,$VM1,{162:4459}),o($VB7,$VO1),{119:[1,4460],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($Vy7,$VE1),o($Vy7,$VF1),{19:[1,4464],21:[1,4468],22:4462,33:4461,200:4463,214:4465,215:[1,4467],216:[1,4466]},{100:[1,4469]},o($Vv7,$VT1),o($Vx7,$Vn),o($Vx7,$Vo),{100:[1,4471],106:4470,108:[1,4472],109:[1,4473],110:4474,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4475]},o($Vx7,$Vp),o($Vx7,$Vq),{121:[1,4476]},o($V58,$VP3),o($Vx7,$V13),o($Vx7,$V23),o($Vx7,$V33),o($Vx7,$V43),o($Vx7,$V53),{111:[1,4477]},o($Vx7,$Va3),o($Vy7,$Vk5),o($VB7,$VD5),o($VB7,$VK1),o($VB7,$Vn),o($VB7,$Vo),o($VB7,$Vp),o($VB7,$Vq),{121:[1,4478]},o($V58,$VP3),o($Vx7,$V13),o($Vx7,$V23),o($Vx7,$V33),o($Vx7,$V43),o($Vx7,$V53),{111:[1,4479]},o($Vx7,$Va3),o($Vy7,$Vk5),o($VB7,$VD5),o($VB7,$VK1),o($VB7,$Vn),o($VB7,$Vo),o($VB7,$Vp),o($VB7,$Vq),{193:[1,4482],194:4480,195:[1,4481]},o($V78,$VP5),o($V78,$VQ5),o($V78,$VR5),o($V78,$Vn),o($V78,$Vo),o($V78,$VX3),o($V78,$VY3),o($V78,$VZ3),o($V78,$Vp),o($V78,$Vq),o($V78,$V_3),o($V78,$V$3,{202:4483,203:4484,111:[1,4485]}),o($V78,$V04),o($V78,$V14),o($V78,$V24),o($V78,$V34),o($V78,$V44),o($V78,$V54),o($V78,$V64),o($V78,$V74),o($V78,$V84),o($VA9,$V63),o($VA9,$V73),o($VA9,$V83),o($VA9,$V93),o($Ve8,$V08),o($Vr,$Vs,{59:4486,40:4487,43:$Vt}),o($Ve8,$V18),o($Ve8,$V28),o($Ve8,$Vz7),o($Ve8,$VA7),{119:[1,4488],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($Ve8,$VE1),o($Ve8,$VF1),{19:[1,4492],21:[1,4496],22:4490,33:4489,200:4491,214:4493,215:[1,4495],216:[1,4494]},o($Ve8,$V38),o($Ve8,$V48),o($V49,$Vy1,{93:4497}),o($Ve8,$Vz1,{99:4334,95:4498,101:$Vx9,102:$VR,103:$VS,104:$VT}),o($V49,$VG1),o($V49,$VH1),o($V49,$VI1),o($V49,$VJ1),{100:[1,4499]},o($V49,$VT1),{70:[1,4500]},o($VK8,$Vs2,{99:4056,95:4501,101:$Vi9,102:$VR,103:$VS,104:$VT}),o($VJ8,$Vt2),o($Ve8,$Vu2,{90:4502,95:4503,91:4504,99:4505,105:4507,107:4508,101:$VB9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Ve8,$Vw2,{90:4502,95:4503,91:4504,99:4505,105:4507,107:4508,101:$VB9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Ve8,$Vx2,{90:4502,95:4503,91:4504,99:4505,105:4507,107:4508,101:$VB9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN8,$Vy2),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,4509],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4510,121:$VW2,148:$VX2,189:$VY2}),o($VM8,$VA2),o($VM8,$Vw),o($VM8,$Vx),o($VM8,$Vn),o($VM8,$Vo),o($VM8,$Vy),o($VM8,$Vp),o($VM8,$Vq),o($VJ8,$V13),o($VN8,$V23),o($VN8,$V33),o($VN8,$V43),o($VN8,$V53),{111:[1,4511]},o($VN8,$Va3),o($Ve8,$V18),o($Ve8,$V28),o($Ve8,$Vz7),o($Ve8,$VA7),{119:[1,4512],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($Ve8,$VE1),o($Ve8,$VF1),{19:[1,4516],21:[1,4520],22:4514,33:4513,200:4515,214:4517,215:[1,4519],216:[1,4518]},o($Ve8,$V38),o($Ve8,$V48),o($V49,$Vy1,{93:4521}),o($Ve8,$Vz1,{99:4376,95:4522,101:$Vy9,102:$VR,103:$VS,104:$VT}),o($V49,$VG1),o($V49,$VH1),o($V49,$VI1),o($V49,$VJ1),{100:[1,4523]},o($V49,$VT1),{70:[1,4524]},o($VK8,$Vs2,{99:4089,95:4525,101:$Vj9,102:$VR,103:$VS,104:$VT}),o($VJ8,$Vt2),o($Ve8,$Vu2,{90:4526,95:4527,91:4528,99:4529,105:4531,107:4532,101:$VC9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Ve8,$Vw2,{90:4526,95:4527,91:4528,99:4529,105:4531,107:4532,101:$VC9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Ve8,$Vx2,{90:4526,95:4527,91:4528,99:4529,105:4531,107:4532,101:$VC9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN8,$Vy2),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,4533],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4534,121:$VW2,148:$VX2,189:$VY2}),o($VM8,$VA2),o($VM8,$Vw),o($VM8,$Vx),o($VM8,$Vn),o($VM8,$Vo),o($VM8,$Vy),o($VM8,$Vp),o($VM8,$Vq),o($VJ8,$V13),o($VN8,$V23),o($VN8,$V33),o($VN8,$V43),o($VN8,$V53),{111:[1,4535]},o($VN8,$Va3),o($Ve8,$Vk5),{19:[1,4538],21:[1,4541],22:4537,87:4536,214:4539,215:[1,4540]},o($Vo2,$V71),o($Vo2,$V81),o($Vo2,$V91),o($Vr1,$Vi5),o($Vr1,$Vj5),{19:$Vk9,21:$Vl9,22:4543,87:4542,214:4119,215:$Vm9},o($Vq2,$V71),o($Vq2,$V81),o($Vq2,$V91),o($Vt1,$Vi5),o($Vt1,$Vj5),{19:$Vn9,21:$Vo9,22:4545,87:4544,214:4145,215:$Vp9},o($VA1,$VD5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($Vz2,$V71),o($Vz2,$V81),o($Vz2,$V91),o($VD1,$Vi5),o($VD1,$Vj5),{19:$Vq9,21:$Vr9,22:4547,87:4546,214:4172,215:$Vs9},o($Vz3,$VZ5),o($Vz3,$VK1),o($VA3,$VZ5),o($VA3,$VK1),o($VB3,$VZ5),o($VB3,$VK1),o($VM6,$V18),o($VM6,$V28),o($VM6,$Vz7),o($VM6,$VA7),{119:[1,4548],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($VM6,$VE1),o($VM6,$VF1),{19:[1,4552],21:[1,4556],22:4550,33:4549,200:4551,214:4553,215:[1,4555],216:[1,4554]},o($VM6,$V38),o($VM6,$V48),o($V58,$Vy1,{93:4557}),o($VM6,$Vz1,{99:4450,95:4558,101:$Vz9,102:$VR,103:$VS,104:$VT}),o($V58,$VG1),o($V58,$VH1),o($V58,$VI1),o($V58,$VJ1),{100:[1,4559]},o($V58,$VT1),{70:[1,4560]},o($Vw7,$Vs2,{99:4250,95:4561,101:$Vt9,102:$VR,103:$VS,104:$VT}),o($Vv7,$Vt2),o($VM6,$Vu2,{90:4562,95:4563,91:4564,99:4565,105:4567,107:4568,101:$VD9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VM6,$Vw2,{90:4562,95:4563,91:4564,99:4565,105:4567,107:4568,101:$VD9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VM6,$Vx2,{90:4562,95:4563,91:4564,99:4565,105:4567,107:4568,101:$VD9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VB7,$Vy2),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,4569],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4570,121:$VW2,148:$VX2,189:$VY2}),o($Vy7,$VA2),o($Vy7,$Vw),o($Vy7,$Vx),o($Vy7,$Vn),o($Vy7,$Vo),o($Vy7,$Vy),o($Vy7,$Vp),o($Vy7,$Vq),o($Vv7,$V13),o($VB7,$V23),o($VB7,$V33),o($VB7,$V43),o($VB7,$V53),{111:[1,4571]},o($VB7,$Va3),o($VM6,$Vk5),{19:[1,4574],21:[1,4577],22:4573,87:4572,214:4575,215:[1,4576]},o($VM6,$Vk5),{19:[1,4580],21:[1,4583],22:4579,87:4578,214:4581,215:[1,4582]},o($V29,$V71),o($V29,$V81),o($V29,$V91),o($V78,$Vi5),o($V78,$Vj5),{19:$Vu9,21:$Vv9,22:4585,87:4584,214:4295,215:$Vw9},o($Ve8,$VE8),o($VI,$VJ,{63:4586,73:4587,75:4588,76:4589,92:4592,94:4593,87:4595,88:4596,89:4597,78:4598,44:4599,95:4603,22:4604,91:4606,118:4607,99:4611,214:4614,105:4615,107:4616,19:[1,4613],21:[1,4618],69:[1,4590],71:[1,4591],79:[1,4608],80:[1,4609],81:[1,4610],85:[1,4594],96:[1,4600],97:[1,4601],98:[1,4602],101:$VE9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,4605],215:[1,4617]}),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4619,121:$VW2,148:$VX2,189:$VY2}),o($Ve8,$VA2),o($Ve8,$Vw),o($Ve8,$Vx),o($Ve8,$Vn),o($Ve8,$Vo),o($Ve8,$Vy),o($Ve8,$Vp),o($Ve8,$Vq),o($Ve8,$Vs2,{99:4334,95:4620,101:$Vx9,102:$VR,103:$VS,104:$VT}),o($V49,$Vt2),o($V49,$V13),o($Ve8,$VG8),o($VJ8,$VP3),o($VL8,$VQ3),o($VL8,$VR3),o($VL8,$VS3),{100:[1,4621]},o($VL8,$VT1),{100:[1,4623],106:4622,108:[1,4624],109:[1,4625],110:4626,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4627]},o($VL8,$VU3),{121:[1,4628]},{19:[1,4631],21:[1,4634],22:4630,87:4629,214:4632,215:[1,4633]},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4635,121:$VW2,148:$VX2,189:$VY2}),o($Ve8,$VA2),o($Ve8,$Vw),o($Ve8,$Vx),o($Ve8,$Vn),o($Ve8,$Vo),o($Ve8,$Vy),o($Ve8,$Vp),o($Ve8,$Vq),o($Ve8,$Vs2,{99:4376,95:4636,101:$Vy9,102:$VR,103:$VS,104:$VT}),o($V49,$Vt2),o($V49,$V13),o($Ve8,$VG8),o($VJ8,$VP3),o($VL8,$VQ3),o($VL8,$VR3),o($VL8,$VS3),{100:[1,4637]},o($VL8,$VT1),{100:[1,4639],106:4638,108:[1,4640],109:[1,4641],110:4642,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4643]},o($VL8,$VU3),{121:[1,4644]},{19:[1,4647],21:[1,4650],22:4646,87:4645,214:4648,215:[1,4649]},o($VL8,$VD5),o($VL8,$VK1),o($VL8,$Vn),o($VL8,$Vo),o($VL8,$Vp),o($VL8,$Vq),o($Vr1,$VZ5),o($Vr1,$VK1),o($Vt1,$VZ5),o($Vt1,$VK1),o($VD1,$VZ5),o($VD1,$VK1),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4651,121:$VW2,148:$VX2,189:$VY2}),o($VM6,$VA2),o($VM6,$Vw),o($VM6,$Vx),o($VM6,$Vn),o($VM6,$Vo),o($VM6,$Vy),o($VM6,$Vp),o($VM6,$Vq),o($VM6,$Vs2,{99:4450,95:4652,101:$Vz9,102:$VR,103:$VS,104:$VT}),o($V58,$Vt2),o($V58,$V13),o($VM6,$VG8),o($Vv7,$VP3),o($Vx7,$VQ3),o($Vx7,$VR3),o($Vx7,$VS3),{100:[1,4653]},o($Vx7,$VT1),{100:[1,4655],106:4654,108:[1,4656],109:[1,4657],110:4658,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4659]},o($Vx7,$VU3),{121:[1,4660]},{19:[1,4663],21:[1,4666],22:4662,87:4661,214:4664,215:[1,4665]},o($Vx7,$VD5),o($Vx7,$VK1),o($Vx7,$Vn),o($Vx7,$Vo),o($Vx7,$Vp),o($Vx7,$Vq),o($Vx7,$VD5),o($Vx7,$VK1),o($Vx7,$Vn),o($Vx7,$Vo),o($Vx7,$Vp),o($Vx7,$Vq),o($V78,$VZ5),o($V78,$VK1),o($Ve8,$Vp7),o($Ve8,$Vq7,{74:4667,76:4668,78:4669,44:4670,118:4671,79:[1,4672],80:[1,4673],81:[1,4674],119:$VJ,125:$VJ,127:$VJ,189:$VJ,218:$VJ}),o($Ve8,$Vr7),o($Ve8,$Vs7,{77:4675,73:4676,92:4677,94:4678,95:4682,99:4683,96:[1,4679],97:[1,4680],98:[1,4681],101:$VF9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:4685,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($Ve8,$Vu7),o($VJ8,$Vy1,{93:4686}),o($VK8,$Vz1,{99:4611,95:4687,101:$VE9,102:$VR,103:$VS,104:$VT}),o($VL8,$VB1,{86:4688}),o($VL8,$VB1,{86:4689}),o($VL8,$VB1,{86:4690}),o($Ve8,$VC1,{105:4615,107:4616,91:4691,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VM8,$Vz7),o($VM8,$VA7),o($VJ8,$VG1),o($VJ8,$VH1),o($VJ8,$VI1),o($VJ8,$VJ1),o($VL8,$VK1),o($VL1,$VM1,{162:4692}),o($VN8,$VO1),{119:[1,4693],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($VM8,$VE1),o($VM8,$VF1),{19:[1,4697],21:[1,4701],22:4695,33:4694,200:4696,214:4698,215:[1,4700],216:[1,4699]},{100:[1,4702]},o($VJ8,$VT1),o($VL8,$Vn),o($VL8,$Vo),{100:[1,4704],106:4703,108:[1,4705],109:[1,4706],110:4707,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4708]},o($VL8,$Vp),o($VL8,$Vq),{121:[1,4709]},o($V49,$VP3),o($VL8,$V13),o($VL8,$V23),o($VL8,$V33),o($VL8,$V43),o($VL8,$V53),{111:[1,4710]},o($VL8,$Va3),o($VM8,$Vk5),o($VN8,$VD5),o($VN8,$VK1),o($VN8,$Vn),o($VN8,$Vo),o($VN8,$Vp),o($VN8,$Vq),{121:[1,4711]},o($V49,$VP3),o($VL8,$V13),o($VL8,$V23),o($VL8,$V33),o($VL8,$V43),o($VL8,$V53),{111:[1,4712]},o($VL8,$Va3),o($VM8,$Vk5),o($VN8,$VD5),o($VN8,$VK1),o($VN8,$Vn),o($VN8,$Vo),o($VN8,$Vp),o($VN8,$Vq),{121:[1,4713]},o($V58,$VP3),o($Vx7,$V13),o($Vx7,$V23),o($Vx7,$V33),o($Vx7,$V43),o($Vx7,$V53),{111:[1,4714]},o($Vx7,$Va3),o($Vy7,$Vk5),o($VB7,$VD5),o($VB7,$VK1),o($VB7,$Vn),o($VB7,$Vo),o($VB7,$Vp),o($VB7,$Vq),o($Ve8,$V18),o($Ve8,$V28),o($Ve8,$Vz7),o($Ve8,$VA7),{119:[1,4715],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,218:$VS1},o($Ve8,$VE1),o($Ve8,$VF1),{19:[1,4719],21:[1,4723],22:4717,33:4716,200:4718,214:4720,215:[1,4722],216:[1,4721]},o($Ve8,$V38),o($Ve8,$V48),o($V49,$Vy1,{93:4724}),o($Ve8,$Vz1,{99:4683,95:4725,101:$VF9,102:$VR,103:$VS,104:$VT}),o($V49,$VG1),o($V49,$VH1),o($V49,$VI1),o($V49,$VJ1),{100:[1,4726]},o($V49,$VT1),{70:[1,4727]},o($VK8,$Vs2,{99:4611,95:4728,101:$VE9,102:$VR,103:$VS,104:$VT}),o($VJ8,$Vt2),o($Ve8,$Vu2,{90:4729,95:4730,91:4731,99:4732,105:4734,107:4735,101:$VG9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Ve8,$Vw2,{90:4729,95:4730,91:4731,99:4732,105:4734,107:4735,101:$VG9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Ve8,$Vx2,{90:4729,95:4730,91:4731,99:4732,105:4734,107:4735,101:$VG9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN8,$Vy2),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,4736],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4737,121:$VW2,148:$VX2,189:$VY2}),o($VM8,$VA2),o($VM8,$Vw),o($VM8,$Vx),o($VM8,$Vn),o($VM8,$Vo),o($VM8,$Vy),o($VM8,$Vp),o($VM8,$Vq),o($VJ8,$V13),o($VN8,$V23),o($VN8,$V33),o($VN8,$V43),o($VN8,$V53),{111:[1,4738]},o($VN8,$Va3),o($Ve8,$Vk5),{19:[1,4741],21:[1,4744],22:4740,87:4739,214:4742,215:[1,4743]},o($Ve8,$Vk5),{19:[1,4747],21:[1,4750],22:4746,87:4745,214:4748,215:[1,4749]},o($VM6,$Vk5),{19:[1,4753],21:[1,4756],22:4752,87:4751,214:4754,215:[1,4755]},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4757,121:$VW2,148:$VX2,189:$VY2}),o($Ve8,$VA2),o($Ve8,$Vw),o($Ve8,$Vx),o($Ve8,$Vn),o($Ve8,$Vo),o($Ve8,$Vy),o($Ve8,$Vp),o($Ve8,$Vq),o($Ve8,$Vs2,{99:4683,95:4758,101:$VF9,102:$VR,103:$VS,104:$VT}),o($V49,$Vt2),o($V49,$V13),o($Ve8,$VG8),o($VJ8,$VP3),o($VL8,$VQ3),o($VL8,$VR3),o($VL8,$VS3),{100:[1,4759]},o($VL8,$VT1),{100:[1,4761],106:4760,108:[1,4762],109:[1,4763],110:4764,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4765]},o($VL8,$VU3),{121:[1,4766]},{19:[1,4769],21:[1,4772],22:4768,87:4767,214:4770,215:[1,4771]},o($VL8,$VD5),o($VL8,$VK1),o($VL8,$Vn),o($VL8,$Vo),o($VL8,$Vp),o($VL8,$Vq),o($VL8,$VD5),o($VL8,$VK1),o($VL8,$Vn),o($VL8,$Vo),o($VL8,$Vp),o($VL8,$Vq),o($Vx7,$VD5),o($Vx7,$VK1),o($Vx7,$Vn),o($Vx7,$Vo),o($Vx7,$Vp),o($Vx7,$Vq),{121:[1,4773]},o($V49,$VP3),o($VL8,$V13),o($VL8,$V23),o($VL8,$V33),o($VL8,$V43),o($VL8,$V53),{111:[1,4774]},o($VL8,$Va3),o($VM8,$Vk5),o($VN8,$VD5),o($VN8,$VK1),o($VN8,$Vn),o($VN8,$Vo),o($VN8,$Vp),o($VN8,$Vq),o($Ve8,$Vk5),{19:[1,4777],21:[1,4780],22:4776,87:4775,214:4778,215:[1,4779]},o($VL8,$VD5),o($VL8,$VK1),o($VL8,$Vn),o($VL8,$Vo),o($VL8,$Vp),o($VL8,$Vq)];
  this.defaultActions = {6:[2,11],24:[2,1],115:[2,119],116:[2,120],117:[2,121],124:[2,132],125:[2,133],205:[2,252],206:[2,253],207:[2,254],208:[2,255],337:[2,35],397:[2,142],398:[2,146],400:[2,148],585:[2,33],586:[2,37],623:[2,34],1120:[2,146],1122:[2,148]};

  this.performAction = function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */
    const $0 = $$.length - 1;
    switch (yystate) {
case 1:

        let imports = Object.keys(ShExJisonParser._imports).length ? { imports: ShExJisonParser._imports } : {}
        const startObj = ShExJisonParser.start ? { start: ShExJisonParser.start } : {};
        const startActs = ShExJisonParser.startActs ? { startActs: ShExJisonParser.startActs } : {};
        let shapes = ShExJisonParser.shapes ? { shapes: Object.values(ShExJisonParser.shapes) } : {};
        const shexj = Object.assign(
          { type: "Schema" }, imports, startActs, startObj, shapes
        )
        if (ShExJisonParser.options.index) {
          if (ShExJisonParser._base !== null)
            shexj._base = ShExJisonParser._base;
          shexj._prefixes = ShExJisonParser._prefixes;
          shexj._index = {
            shapeExprs: ShExJisonParser.shapes || {},
            tripleExprs: ShExJisonParser.productions || {}
          };
          shexj._sourceMap = ShExJisonParser._sourceMap;
        }
        return shexj;
      
break;
case 2:
 yy.parser.yy = { lexer: yy.lexer} ; 
break;
case 15:
 // t: @@
        ShExJisonParser._setBase(ShExJisonParser._base === null ||
                    absoluteIRI.test($$[$0].slice(1, -1)) ? $$[$0].slice(1, -1) : _resolveIRI($$[$0].slice(1, -1)));
      
break;
case 16:
 // t: ShExParser-test.js/with pre-defined prefixes
        ShExJisonParser._prefixes[$$[$0-1].slice(0, -1)] = $$[$0];
      
break;
case 17:
 // t: @@
        ShExJisonParser._imports.push($$[$0]);
      
break;
case 20:

        if (ShExJisonParser.start)
          error(new Error("Parse error: start already defined"), yy);
        ShExJisonParser.start = shapeJunction("ShapeOr", $$[$0-1], $$[$0]); // t: startInline
      
break;
case 21:

        ShExJisonParser.startActs = $$[$0]; // t: startCode1
      
break;
case 22:
this.$ = [$$[$0]] // t: startCode1;
break;
case 23:
this.$ = appendTo($$[$0-1], $$[$0]) // t: startCode3;
break;
case 26:
 // t: 1dot 1val1vsMinusiri3??
        if ($$[$0-3].abstract || $$[$0-1].length) { // t: $$[$0-3]: 1dotAbstractShapeCode1  $$[$0-2]: @@
          addShape($$[$0-2], Object.assign({type: "ShapeDecl"}, $$[$0-3],
                                     $$[$0-1].length > 0 ? { restricts: $$[$0-1] } : { },
                                     {shapeExpr: $$[$0]}), yy) // $$[$01]: t: @@
        } else {
          addShape($$[$0-2],  $$[$0], yy);
        }
      
break;
case 27:
this.$ = {  };
break;
case 28:
this.$ = { abstract: true };
break;
case 29: case 95:
this.$ = [] // t: 1dot, 1dotAnnot3;
break;
case 30: case 96:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotAnnot3;
break;
case 31:

        this.$ = nonest($$[$0]);
      
break;
case 32:
this.$ = { type: "ShapeExternal" };
break;
case 33:

        if ($$[$0-2])
          $$[$0-1] = { type: "ShapeNot", "shapeExpr": nonest($$[$0-1]) }; // t:@@
        if ($$[$0]) { // If there were disjuncts,
          //           shapeOr will have $$[$0].set needsAtom.
          //           Prepend $$[$0].needsAtom with $$[$0-1].
          //           Note that $$[$0] may be a ShapeOr or a ShapeAnd.
          $$[$0].needsAtom.unshift(nonest($$[$0-1]));
          delete $$[$0].needsAtom;
          this.$ = $$[$0];
        } else {
          this.$ = $$[$0-1];
        }
      
break;
case 34:

        $$[$0-1] = { type: "ShapeNot", "shapeExpr": nonest($$[$0-1]) } // !!! opt
        if ($$[$0]) { // If there were disjuncts,
          //           shapeOr will have $$[$0].set needsAtom.
          //           Prepend $$[$0].needsAtom with $$[$0-1].
          //           Note that $$[$0] may be a ShapeOr or a ShapeAnd.
          $$[$0].needsAtom.unshift(nonest($$[$0-1]));
          delete $$[$0].needsAtom;
          this.$ = $$[$0];
        } else {
          this.$ = $$[$0-1];
        }
      
break;
case 35:

        $$[$0].needsAtom.unshift(nonest($$[$0-1]));
        delete $$[$0].needsAtom;
        this.$ = $$[$0]; // { type: "ShapeOr", "shapeExprs": [$$[$0-1]].concat($$[$0]) };
      
break;
case 36: case 231: case 248:
this.$ = null;
break;
case 37: case 41: case 44: case 50: case 57: case 188: case 247:
this.$ = $$[$0];
break;
case 39:
 // returns a ShapeOr
        const disjuncts = $$[$0].map(nonest);
        this.$ = { type: "ShapeOr", shapeExprs: disjuncts, needsAtom: disjuncts }; // t: @@
      
break;
case 40:
 // returns a ShapeAnd
        // $$[$0-1] could have implicit conjuncts and explicit nested ANDs (will have .nested: true)
        $$[$0-1].filter(c => c.type === "ShapeAnd").length === $$[$0-1].length
        const and = {
          type: "ShapeAnd",
          shapeExprs: $$[$0-1].reduce(
            (acc, elt) =>
              acc.concat(elt.type === 'ShapeAnd' && !elt.nested ? elt.shapeExprs : nonest(elt)), []
          )
        };
        this.$ = $$[$0].length > 0 ? { type: "ShapeOr", shapeExprs: [and].concat($$[$0].map(nonest)) } : and; // t: @@
        this.$.needsAtom = and.shapeExprs;
      
break;
case 42: case 45:
this.$ = [$$[$0]];
break;
case 43: case 46: case 48: case 52: case 55: case 59:
this.$ = $$[$0-1].concat($$[$0]);
break;
case 47: case 51: case 54: case 58:
this.$ = [];
break;
case 49:
this.$ = shapeJunction("ShapeOr", $$[$0-1], $$[$0]);
break;
case 53: case 56:
this.$ = shapeJunction("ShapeAnd", $$[$0-1], $$[$0]) // t: @@;
break;
case 60:
this.$ = $$[$0-1] ? { type: "ShapeNot", "shapeExpr": nonest($$[$0]) } /* t:@@ */ : $$[$0];
break;
case 61:
this.$ = false;
break;
case 62:
this.$ = true;
break;
case 63:
this.$ = $$[$0-1] ? { type: "ShapeNot", "shapeExpr": nonest($$[$0]) } /* t: 1NOTNOTdot, 1NOTNOTIRI, 1NOTNOTvs */ : $$[$0];
break;
case 64: case 73: case 78:
this.$ = $$[$0] ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $$[$0-1]), $$[$0] ] } : $$[$0-1];
break;
case 66:
this.$ = $$[$0] ? shapeJunction("ShapeAnd", $$[$0-1], [$$[$0]]) /* t: 1dotRef1 */ : $$[$0-1] // t:@@;
break;
case 67: case 76: case 81:
this.$ = Object.assign($$[$0-1], {nested: true}) // t: 1val1vsMinusiri3;
break;
case 68: case 77: case 82:
this.$ = EmptyShape // t: 1dot;
break;
case 75:
this.$ = $$[$0] ? shapeJunction("ShapeAnd", $$[$0-1], [$$[$0]]) /* t:@@ */ : $$[$0-1]	 // t: 1dotRef1 -- use _QnonLitNodeConstraint_E_Opt like below?;
break;
case 80:
this.$ = $$[$0] ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $$[$0-1]), $$[$0] ] } : $$[$0-1] // t: !! look to 1dotRef1;
break;
case 91:
 // t: 1dotRefLNex@@
        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        const namePos = $$[$0].indexOf(':');
        this.$ = addSourceMap(expandPrefix($$[$0].substr(0, namePos), yy) + $$[$0].substr(namePos + 1), yy); // ShapeRef
      
break;
case 92:
 // t: 1dotRefNS1@@
        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        this.$ = addSourceMap(expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy), yy); // ShapeRef
      
break;
case 93:
this.$ = addSourceMap($$[$0], yy) // ShapeRef // t: 1dotRef1, 1dotRefSpaceLNex, 1dotRefSpaceNS1;
break;
case 94: case 97:
 // t: !!
        this.$ = $$[$0-2]
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: !!
        if ($$[$0]) { this.$.semActs = $$[$0].semActs; } // t: !!
      
break;
case 98:
this.$ = extend({ type: "NodeConstraint", nodeKind: "literal" }, $$[$0]) // t: 1literalPattern;
break;
case 99:

        if (numericDatatypes.indexOf($$[$0-1]) === -1)
          numericFacets.forEach(function (facet) {
            if (facet in $$[$0])
              error(new Error("Parse error: facet " + facet + " not allowed for unknown datatype " + $$[$0-1]), yy);
          });
        this.$ = extend({ type: "NodeConstraint", datatype: $$[$0-1] }, $$[$0]) // t: 1datatype
      
break;
case 100:
this.$ = { type: "NodeConstraint", values: $$[$0-1] } // t: 1val1IRIREF;
break;
case 101:
this.$ = extend({ type: "NodeConstraint"}, $$[$0]);
break;
case 102:
this.$ = {} // t: 1literalPattern;
break;
case 103:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"), yy);
        }
        this.$ = extend($$[$0-1], $$[$0]) // t: 1literalLength
      
break;
case 105: case 111:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"), yy);
        }
        this.$ = extend($$[$0-1], $$[$0]) // t: !! look to 1literalLength
      
break;
case 106:
this.$ = extend({ type: "NodeConstraint" }, $$[$0-1], $$[$0] ? $$[$0] : {}) // t: 1iriPattern;
break;
case 107:
this.$ = extend({ type: "NodeConstraint" }, $$[$0]) // t: @@;
break;
case 108:
this.$ = {};
break;
case 109:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"), yy);
        }
        this.$ = extend($$[$0-1], $$[$0])
      
break;
case 112:
this.$ = { nodeKind: "iri" } // t: 1iriPattern;
break;
case 113:
this.$ = { nodeKind: "bnode" } // t: 1bnodeLength;
break;
case 114:
this.$ = { nodeKind: "nonliteral" } // t: 1nonliteralLength;
break;
case 117:
this.$ = keyValObject($$[$0-1], parseInt($$[$0], 10)) // t: 1literalLength;
break;
case 118:
this.$ = unescapeRegexp($$[$0]) // t: 1literalPattern;
break;
case 119:
this.$ = "length" // t: 1literalLength;
break;
case 120:
this.$ = "minlength" // t: 1literalMinlength;
break;
case 121:
this.$ = "maxlength" // t: 1literalMaxlength;
break;
case 122:
this.$ = keyValObject($$[$0-1], $$[$0]) // t: 1literalMininclusive;
break;
case 123:
this.$ = keyValObject($$[$0-1], parseInt($$[$0], 10)) // t: 1literalTotaldigits;
break;
case 124:
this.$ = parseInt($$[$0], 10);
break;
case 125: case 126:
this.$ = parseFloat($$[$0]);
break;
case 127:
 // ## deprecated
        if ($$[$0] === XSD_DECIMAL || $$[$0] === XSD_FLOAT || $$[$0] === XSD_DOUBLE)
          this.$ = parseFloat($$[$0-2].value);
        else if (numericDatatypes.indexOf($$[$0]) !== -1)
          this.$ = parseInt($$[$0-2].value)
        else
          error(new Error("Parse error: numeric range facet expected numeric datatype instead of " + $$[$0]), yy);
      
break;
case 128:
this.$ = "mininclusive" // t: 1literalMininclusive;
break;
case 129:
this.$ = "minexclusive" // t: 1literalMinexclusive;
break;
case 130:
this.$ = "maxinclusive" // t: 1literalMaxinclusive;
break;
case 131:
this.$ = "maxexclusive" // t: 1literalMaxexclusive;
break;
case 132:
this.$ = "totaldigits" // t: 1literalTotaldigits;
break;
case 133:
this.$ = "fractiondigits" // t: 1literalFractiondigits;
break;
case 134:
 // t: 1dotExtend3
        this.$ = $$[$0-2] === EmptyShape ? { type: "Shape" } : $$[$0-2]; // t: 0
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: !! look to open3groupdotcloseAnnot3, open3groupdotclosecard23Annot3Code2
        if ($$[$0]) { this.$.semActs = $$[$0].semActs; } // t: !! look to open3groupdotcloseCode1, !open1dotOr1dot
      
break;
case 135:
 // t: 1dotExtend3
        const exprObj = $$[$0-1] ? { expression: $$[$0-1] } : EmptyObject; // t: 0, 0Extend1
        this.$ = (exprObj === EmptyObject && $$[$0-3] === EmptyObject) ?
	  EmptyShape :
	  extend({ type: "Shape" }, exprObj, $$[$0-3]);
      
break;
case 136:
this.$ = [ "extends", [$$[$0]] ] // t: 1dotExtend1;
break;
case 137:
this.$ = [ "extra", $$[$0] ] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3;
break;
case 138:
this.$ = [ "closed", true ] // t: 1dotClosed;
break;
case 139:
this.$ = EmptyObject;
break;
case 140:

        if ($$[$0-1] === EmptyObject)
          $$[$0-1] = {};
        if ($$[$0][0] === "closed")
          $$[$0-1]["closed"] = true; // t: 1dotClosed
        else if ($$[$0][0] in $$[$0-1])
          $$[$0-1][$$[$0][0]] = unionAll($$[$0-1][$$[$0][0]], $$[$0][1]); // t: 1dotExtend3, 3groupdot3Extra, 3groupdotExtra3
        else
          $$[$0-1][$$[$0][0]] = $$[$0][1]; // t: 1dotExtend1
        this.$ = $$[$0-1];
      
break;
case 143:
this.$ = $$[$0] // t: 1dotExtra1, 3groupdot3Extra;
break;
case 144:
this.$ = [$$[$0]] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3;
break;
case 145:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 3groupdotExtra3;
break;
case 149:
this.$ = { type: "OneOf", expressions: unionAll([$$[$0-1]], $$[$0]) } // t: 2oneOfdot;
break;
case 150:
this.$ = $$[$0] // t: 2oneOfdot;
break;
case 151:
this.$ = [$$[$0]] // t: 2oneOfdot;
break;
case 152:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 2oneOfdot;
break;
case 155:
this.$ = $$[$0-1];
break;
case 159:
this.$ = { type: "EachOf", expressions: unionAll([$$[$0-2]], $$[$0-1]) } // t: 2groupOfdot;
break;
case 160:
this.$ = $$[$0] // ## deprecated // t: 2groupOfdot;
break;
case 161:
this.$ = $$[$0] // t: 2groupOfdot;
break;
case 162:
this.$ = [$$[$0]] // t: 2groupOfdot;
break;
case 163:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 2groupOfdot;
break;
case 164:

        if ($$[$0-1]) {
          this.$ = extend({ id: $$[$0-1] }, $$[$0]);
          addProduction($$[$0-1],  this.$, yy);
        } else {
          this.$ = $$[$0]
        }
      
break;
case 166:
this.$ = addSourceMap($$[$0], yy);
break;
case 171:

        // t: open1dotOr1dot, !openopen1dotcloseCode1closeCode2
        this.$ = $$[$0-4];
        // Copy all of the new attributes into the encapsulated shape.
        if ("min" in $$[$0-2]) { this.$.min = $$[$0-2].min; } // t: open3groupdotclosecard23Annot3Code2
        if ("max" in $$[$0-2]) { this.$.max = $$[$0-2].max; } // t: open3groupdotclosecard23Annot3Code2
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: open3groupdotcloseAnnot3, open3groupdotclosecard23Annot3Code2
        if ($$[$0]) { this.$.semActs = "semActs" in $$[$0-4] ? $$[$0-4].semActs.concat($$[$0].semActs) : $$[$0].semActs; } // t: open3groupdotcloseCode1, !open1dotOr1dot
      
break;
case 172:
this.$ = {} // t: 1dot;
break;
case 174:

        // $$[$0]: t: 1dotCode1
	if ($$[$0-3] !== EmptyShape && false) {}
        // %7: t: 1inversedotCode1
        this.$ = extend({ type: "TripleConstraint" }, $$[$0-5], { predicate: $$[$0-4] }, ($$[$0-3] === EmptyShape ? {} : { valueExpr: $$[$0-3] }), $$[$0-2], $$[$0]); // t: 1dot, 1inversedot
        if ($$[$0-1].length)
          this.$["annotations"] = $$[$0-1]; // t: 1dotAnnot3, 1inversedotAnnot3
      
break;
case 177:
this.$ = { min:0, max:UNBOUNDED } // t: 1cardStar;
break;
case 178:
this.$ = { min:1, max:UNBOUNDED } // t: 1cardPlus;
break;
case 179:
this.$ = { min:0, max:1 } // t: 1cardOpt;
break;
case 180:

        $$[$0] = $$[$0].substr(1, $$[$0].length-2);
        const nums = $$[$0].match(/(\d+)/g);
        this.$ = { min: parseInt(nums[0], 10) }; // t: 1card2blank, 1card2Star
        if (nums.length === 2)
            this.$["max"] = parseInt(nums[1], 10); // t: 1card23
        else if ($$[$0].indexOf(',') === -1) // t: 1card2
            this.$["max"] = parseInt(nums[0], 10);
        else
            this.$["max"] = UNBOUNDED;
      
break;
case 181:
this.$ = { inverse: true } // t: 1inversedot;
break;
case 182:
this.$ = $$[$0-1] // t: 1val1IRIREF;
break;
case 183:
this.$ = [] // t: 1val1IRIREF;
break;
case 184:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1IRIREF;
break;
case 189:
this.$ = [$$[$0]] // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 190:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 191:
this.$ = [$$[$0]] // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 192:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 193:
this.$ = [$$[$0]] // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 194:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 195:
this.$ = { type: "IriStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 196:
this.$ = { type: "LiteralStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 197:
this.$ = { type: "LanguageStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 198:

        if ($$[$0]) {
          this.$ = {  // t: 1val1iriStem, 1val1iriStemMinusiri3
            type: $$[$0].length ? "IriStemRange" : "IriStem",
            stem: $$[$0-1]
          };
          if ($$[$0].length)
            this.$["exclusions"] = $$[$0]; // t: 1val1iriStemMinusiri3
        } else {
          this.$ = $$[$0-1]; // t: 1val1IRIREF, 1AvalA
        }
      
break;
case 199:
this.$ = [] // t: 1val1iriStem, 1val1iriStemMinusiri3;
break;
case 200:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1iriStemMinusiri3;
break;
case 201:
this.$ = $$[$0] // t: 1val1iriStemMinusiri3;
break;
case 204:
this.$ = $$[$0] ? { type: "IriStem", stem: $$[$0-1] } /* t: 1val1iriStemMinusiriStem3 */ : $$[$0-1] // t: 1val1iriStemMinusiri3;
break;
case 207:

        if ($$[$0]) {
          this.$ = {  // t: 1val1literalStemMinusliteralStem3, 1val1literalStem
            type: $$[$0].length ? "LiteralStemRange" : "LiteralStem",
            stem: $$[$0-1].value
          };
          if ($$[$0].length)
            this.$["exclusions"] = $$[$0]; // t: 1val1literalStemMinusliteral3
        } else {
          this.$ = $$[$0-1]; // t: 1val1LITERAL
        }
      
break;
case 208:
this.$ = [] // t: 1val1literalStem, 1val1literalStemMinusliteral3;
break;
case 209:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1literalStemMinusliteral3;
break;
case 210:
this.$ = $$[$0] // t: 1val1literalStemMinusliteral3;
break;
case 213:
this.$ = $$[$0] ? { type: "LiteralStem", stem: $$[$0-1].value } /* t: 1val1literalStemMinusliteral3 */ : $$[$0-1].value // t: 1val1literalStemMinusliteralStem3;
break;
case 214:

        if ($$[$0]) {
          this.$ = {  // t: 1val1languageStemMinuslanguage3 1val1languageStemMinuslanguageStem3 : 1val1languageStem
            type: $$[$0].length ? "LanguageStemRange" : "LanguageStem",
            stem: $$[$0-1]
          };
          if ($$[$0].length)
            this.$["exclusions"] = $$[$0]; // t: 1val1languageStemMinuslanguage3, 1val1languageStemMinuslanguageStem3
        } else {
          this.$ = { type: "Language", languageTag: $$[$0-1] }; // t: 1val1language
        }
      
break;
case 215:

        this.$ = {  // t: @@
          type: $$[$0].length ? "LanguageStemRange" : "LanguageStem",
          stem: ""
        };
        if ($$[$0].length)
          this.$["exclusions"] = $$[$0]; // t: @@
      
break;
case 216:
this.$ = [] // t: 1val1languageStem, 1val1languageStemMinuslanguage3;
break;
case 217:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1languageStemMinuslanguage3;
break;
case 218:
this.$ = $$[$0] // t: 1val1languageStemMinuslanguage3;
break;
case 221:
this.$ = $$[$0] ? { type: "LanguageStem", stem: $$[$0-1] } /* t: 1val1languageStemMinuslanguageStem3 */ : $$[$0-1] // t: 1val1languageStemMinuslanguage3;
break;
case 222:
this.$ = addSourceMap($$[$0], yy) // Inclusion // t: 2groupInclude1;
break;
case 223:
this.$ = { type: "Annotation", predicate: $$[$0-1], object: $$[$0] } // t: 1dotAnnotIRIREF;
break;
case 226:
this.$ = $$[$0].length ? { semActs: $$[$0] } : null // t: 1dotCode1/2oneOfDot;
break;
case 227:
this.$ = [] // t: 1dot, 1dotCode1;
break;
case 228:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotCode1;
break;
case 229:
this.$ = $$[$0] ? unescapeSemanticAction($$[$0-1], $$[$0]) /* t: 1dotCode1 */ : { type: "SemAct", name: $$[$0-1] } // t: 1dotNoCode1;
break;
case 236:
this.$ = RDF_TYPE // t: 1AvalA;
break;
case 242:
this.$ = createLiteral($$[$0], XSD_INTEGER) // t: 1val1INTEGER;
break;
case 243:
this.$ = createLiteral($$[$0], XSD_DECIMAL) // t: 1val1DECIMAL;
break;
case 244:
this.$ = createLiteral($$[$0], XSD_DOUBLE) // t: 1val1DOUBLE;
break;
case 246:
this.$ = $$[$0] ? extend($$[$0-1], { type: $$[$0] }) : $$[$0-1] // t: 1val1Datatype;
break;
case 250:
this.$ = { value: "true", type: XSD_BOOLEAN } // t: 1val1true;
break;
case 251:
this.$ = { value: "false", type: XSD_BOOLEAN } // t: 1val1false;
break;
case 252:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL2;
break;
case 253:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL1;
break;
case 254:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL_LONG2;
break;
case 255:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG1;
break;
case 256:
this.$ = unescapeLangString($$[$0], 1)	// t: @@;
break;
case 257:
this.$ = unescapeLangString($$[$0], 3)	// t: @@;
break;
case 258:
this.$ = unescapeLangString($$[$0], 1)	// t: 1val1LANGTAG;
break;
case 259:
this.$ = unescapeLangString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG2_with_LANGTAG;
break;
case 260:
 // t: 1dot
        const unesc = ShExUtil.unescapeText($$[$0].slice(1,-1), {});
        this.$ = ShExJisonParser._base === null || absoluteIRI.test(unesc) ? unesc : _resolveIRI(unesc)
      
break;
case 262:
 // t:1dotPNex, 1dotPNdefault, ShExParser-test.js/with pre-defined prefixes
        const namePos1 = $$[$0].indexOf(':');
        this.$ = expandPrefix($$[$0].substr(0, namePos1), yy) + ShExUtil.unescapeText($$[$0].substr(namePos1 + 1), pnameEscapeReplacements);
      
break;
case 263:
 // t: 1dotNS2, 1dotNSdefault, ShExParser-test.js/PNAME_NS with pre-defined prefixes
        this.$ = expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy);
      
break;
case 265:
this.$ = $$[$0] // t: 0Extends1, 1dotExtends1, 1dot3ExtendsLN;
break;
case 268:
this.$ = $$[$0] // t: @_$[$0-1]dotSpecialize1, @_$[$0-1]dot3Specialize, @_$[$0-1]dotSpecialize3;
break;
    }
  }
}
ShExJisonParser.prototype = Object.create(JisonParser.prototype);
Object.defineProperty(ShExJisonParser.prototype, 'constructor', {
  value: ShExJisonParser,
  enumerable: false,
  writable: true
});

exports._b = ShExJisonParser;

/* generated by ts-jison-lex 0.0.9 */
__webpack_unused_export__ = ({ value: true });
function ShExJisonLexer (yy = {}) {
  this.options = {"moduleName":"ShExJison"};

  JisonLexer.call(this, yy);


  this.rules = [/^(?:\s+|(#[^\u000a\u000d]*|\/\*([^*]|\*([^/]|\\\/))*\*\/))/,/^(?:(@(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*))))/,/^(?:(@((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)))/,/^(?:(@([A-Za-z])+((-([0-9A-Za-z])+))*))/,/^(?:@)/,/^(?:(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*)))/,/^(?:(\{((([+-])?([0-9])+))((,(((([+-])?([0-9])+))|\*)?))?\}))/,/^(?:(([+-])?((([0-9])+\.([0-9])*(([Ee]([+-])?([0-9])+)))|((\.)?([0-9])+(([Ee]([+-])?([0-9])+))))))/,/^(?:(([+-])?([0-9])*\.([0-9])+))/,/^(?:(([+-])?([0-9])+))/,/^(?:{ANON})/,/^(?:(<([^\u0000-\u0020<>\"{}|^`\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*>))/,/^(?:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:))/,/^(?:a\b)/,/^(?:(\/([^\u002f\u005C\u000A\u000D]|\\[nrt\\|.?*+(){}$\u002D\u005B\u005D\u005E/]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))+\/[smix]*))/,/^(?:(_:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|[0-9])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?))/,/^(?:(\{([^%\\]|\\[%\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*%\}))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"))/,/^(?:([Bb][Aa][Ss][Ee]))/,/^(?:([Pp][Rr][Ee][Ff][Ii][Xx]))/,/^(?:([iI][mM][pP][oO][rR][tT]))/,/^(?:([sS][tT][aA][rR][tT]))/,/^(?:([eE][xX][tT][eE][rR][nN][aA][lL]))/,/^(?:([Aa][Bb][Ss][Tt][Rr][Aa][Cc][Tt]))/,/^(?:([Rr][Ee][Ss][Tt][Rr][Ii][Cc][Tt][Ss]))/,/^(?:([Ee][Xx][Tt][Ee][Nn][Dd][Ss]))/,/^(?:([Cc][Ll][Oo][Ss][Ee][Dd]))/,/^(?:([Ee][Xx][Tt][Rr][Aa]))/,/^(?:([Ll][Ii][Tt][Ee][Rr][Aa][Ll]))/,/^(?:([Bb][Nn][Oo][Dd][Ee]))/,/^(?:([Ii][Rr][Ii]))/,/^(?:([Nn][Oo][Nn][Ll][Ii][Tt][Ee][Rr][Aa][Ll]))/,/^(?:([Aa][Nn][Dd]))/,/^(?:([Oo][Rr]))/,/^(?:([No][Oo][Tt]))/,/^(?:([Mm][Ii][Nn][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Ii][Nn][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Aa][Xx][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Aa][Xx][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Mm][Ii][Nn][Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Mm][Aa][Xx][Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Tt][Oo][Tt][Aa][Ll][Dd][Ii][Gg][Ii][Tt][Ss]))/,/^(?:([Ff][Rr][Aa][Cc][Tt][Ii][Oo][Nn][Dd][Ii][Gg][Ii][Tt][Ss]))/,/^(?:=)/,/^(?:\/\/)/,/^(?:\{)/,/^(?:\})/,/^(?:&)/,/^(?:\|\|)/,/^(?:\|)/,/^(?:,)/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?:\$)/,/^(?:!)/,/^(?:\^\^)/,/^(?:\^)/,/^(?:\.)/,/^(?:~)/,/^(?:;)/,/^(?:\*)/,/^(?:\+)/,/^(?:\?)/,/^(?:-)/,/^(?:%)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:$)/,/^(?:[a-zA-Z0-9_-]+)/,/^(?:.)/];
  this.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79],"inclusive":true}};
  this.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
    const YYSTATE=YY_START;
    switch($avoiding_name_collisions) {
    case 0:/**/
      break;
    case 1:return 79;
      break;
    case 2:return 80;
      break;
    case 3: yy_.yytext = yy_.yytext.substr(1); return 185; 
      break;
    case 4:return 81;
      break;
    case 5:return 215;
      break;
    case 6:return 159;
      break;
    case 7:return 109;
      break;
    case 8:return 108;
      break;
    case 9:return 100;
      break;
    case 10:return 'ANON';
      break;
    case 11:return 19;
      break;
    case 12:return 21;
      break;
    case 13:return 199;
      break;
    case 14:return 101;
      break;
    case 15:return 216;
      break;
    case 16:return 195;
      break;
    case 17:return 211;
      break;
    case 18:return 213;
      break;
    case 19:return 210;
      break;
    case 20:return 212;
      break;
    case 21:return 207;
      break;
    case 22:return 209;
      break;
    case 23:return 206;
      break;
    case 24:return 208;
      break;
    case 25:return 18;
      break;
    case 26:return 20;
      break;
    case 27:return 23;
      break;
    case 28:return 26;
      break;
    case 29:return 39;
      break;
    case 30:return 36;
      break;
    case 31:return 220;
      break;
    case 32:return 218;
      break;
    case 33:return 125;
      break;
    case 34:return 127;
      break;
    case 35:return 85;
      break;
    case 36:return 97;
      break;
    case 37:return 96;
      break;
    case 38:return 98;
      break;
    case 39:return 53;
      break;
    case 40:return 51;
      break;
    case 41:return 43;
      break;
    case 42:return 112;
      break;
    case 43:return 113;
      break;
    case 44:return 114;
      break;
    case 45:return 115;
      break;
    case 46:return 102;
      break;
    case 47:return 103;
      break;
    case 48:return 104;
      break;
    case 49:return 116;
      break;
    case 50:return 117;
      break;
    case 51:return 27;
      break;
    case 52:return 190;
      break;
    case 53:return 119;
      break;
    case 54:return 121;
      break;
    case 55:return 189;
      break;
    case 56:return '||';
      break;
    case 57:return 135;
      break;
    case 58:return 140;
      break;
    case 59:return 69;
      break;
    case 60:return 70;
      break;
    case 61:return 161;
      break;
    case 62:return 163;
      break;
    case 63:return 148;
      break;
    case 64:return '!';
      break;
    case 65:return 111;
      break;
    case 66:return 160;
      break;
    case 67:return 71;
      break;
    case 68:return 178;
      break;
    case 69:return 141;
      break;
    case 70:return 156;
      break;
    case 71:return 157;
      break;
    case 72:return 158;
      break;
    case 73:return 179;
      break;
    case 74:return 193;
      break;
    case 75:return 204;
      break;
    case 76:return 205;
      break;
    case 77:return 7;
      break;
    case 78:return 'unexpected word "'+yy_.yytext+'"';
      break;
    case 79:return 'invalid character '+yy_.yytext;
      break;
    }
  }
}
ShExJisonLexer.prototype = Object.create(JisonLexer.prototype);
Object.defineProperty(ShExJisonLexer.prototype, 'constructor', {
  value: ShExJisonLexer,
  enumerable: false,
  writable: true
});

__webpack_unused_export__ = ShExJisonLexer;


/***/ }),

/***/ 931:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const ShExParserCjsModule = (function () {

const ShExJison = (__webpack_require__(509)/* .Parser */ ._b);

// Creates a ShEx parser with the given pre-defined prefixes
const prepareParser = function (baseIRI, prefixes, schemaOptions) {
  schemaOptions = schemaOptions || {};
  // Create a copy of the prefixes
  const prefixesCopy = {};
  for (const prefix in prefixes || {})
    prefixesCopy[prefix] = prefixes[prefix];

  // Create a new parser with the given prefixes
  // (Workaround for https://github.com/zaach/jison/issues/241)
  const parser = new ShExJison();

  function runParser () {
    // ShExJison.base = baseIRI || "";
    // ShExJison.basePath = ShExJison.base.replace(/[^\/]*$/, '');
    // ShExJison.baseRoot = ShExJison.base.match(/^(?:[a-z]+:\/*)?[^\/]*/)[0];
    ShExJison._prefixes = Object.create(prefixesCopy);
    ShExJison._imports = [];
    ShExJison._setBase(baseIRI);
    ShExJison._setFileName(baseIRI);
    ShExJison.options = schemaOptions;
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
      if ("hash" in e) {
        const hash = e.hash;
        const location = hash.loc;
        delete hash.loc;
        Object.assign(e, hash, {location: location});
      }
      return e;
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
  parser._setOptions = function (opts) { ShExJison.options = opts; };
  parser._resetBlanks = ShExJison._resetBlanks;
  parser.reset = ShExJison.reset;
  ShExJison.options = schemaOptions;
  return parser;

  function contextError (e, lexer) {
    // use the lexer's pretty-printing
    const line = e.location.first_line;
    const col  = e.location.first_column + 1;
    const posStr = "pos" in e.hash ? "\n" + e.hash.pos : ""
    return `${baseIRI}\n line: ${line}, column: ${col}: ${e.message}${posStr}`;
  }
}

return {
  construct: prepareParser
};
})();

if (true)
  module.exports = ShExParserCjsModule;


/***/ }),

/***/ 118:
/***/ ((module) => {

/**
 *
 * isIRI, isBlank, getLiteralType, getLiteralValue
 */

const ShExTermCjsModule = (function () {

  const absoluteIRI = /^[a-z][a-z0-9+.-]*:/i,
    schemeAuthority = /^(?:([a-z][a-z0-9+.-]*:))?(?:\/\/[^\/]*)?/i,
    dotSegments = /(?:^|\/)\.\.?(?:$|[\/#?])/;

  const RdfLangString = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";
  const XsdString = "http://www.w3.org/2001/XMLSchema#string";

  // N3.js:lib/N3Parser.js<0.4.5>:576 with
  //   s/this\./Parser./g
  //   s/token/iri/
  // ### `_resolveIRI` resolves a relative IRI token against the base path,
  // assuming that a base path has been set and that the IRI is indeed relative.
  function resolveRelativeIRI (base, iri) {

    if (absoluteIRI.test(iri))
      return iri

    switch (iri[0]) {
    // An empty relative IRI indicates the base IRI
    case undefined: return base;
    // Resolve relative fragment IRIs against the base IRI
    case '#': return base + iri;
    // Resolve relative query string IRIs by replacing the query string
    case '?': return base.replace(/(?:\?.*)?$/, iri);
    // Resolve root-relative IRIs at the root of the base IRI
    case '/':
      let m = base.match(schemeAuthority);
      // Resolve scheme-relative IRIs to the scheme
      return (iri[1] === '/' ? m[1] : m[0]) + _removeDotSegments(iri);
    // Resolve all other IRIs at the base IRI's path
    default: {
      return _removeDotSegments(base.replace(/[^\/?]*(?:\?.*)?$/, '') + iri);
    }
    }
  }

  // ### `_removeDotSegments` resolves './' and '../' path segments in an IRI as per RFC3986.
  function _removeDotSegments (iri) {
    // Don't modify the IRI if it does not contain any dot segments
    if (!dotSegments.test(iri))
      return iri;

    // Start with an imaginary slash before the IRI in order to resolve trailing './' and '../'
    const length = iri.length;
    let result = '', i = -1, pathStart = -1, segmentStart = 0, next = '/';

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

  function internalTerm (node) { // !!rdfjsTermToInternal
    switch (node.termType) {
    case ("NamedNode"):
      return node.value;
    case ("BlankNode"):
      return "_:" + node.value;
    case ("Literal"):
      return "\"" + node.value.replace(/"/g, '\\"') + "\"" + (
        node.datatypeString === RdfLangString
          ? "@" + node.language
          : node.datatypeString === XsdString
          ? ""
          : "^^" + node.datatypeString
      );
    default: throw Error("unknown RDFJS node type: " + JSON.stringify(node))
    }
  }

  function internalTriple (triple) { // !!rdfjsTripleToInternal
    return {
      subject: internalTerm(triple.subject),
      predicate: internalTerm(triple.predicate),
      object: internalTerm(triple.object)
    };
  }

  function externalTerm (node, factory) { // !!internalTermToRdfjs
    if (isIRI(node)) {
      return factory.namedNode(node);
    } else if (isBlank(node)) {
      return factory.blankNode(node.substr(2));
    } else if (isLiteral(node)) {
      let dtOrLang = getLiteralLanguage(node) ||
          (getLiteralType(node) === XsdString
           ? null // seems to screw up N3.js
           : factory.namedNode(getLiteralType(node)))
      return factory.literal(getLiteralValue(node), dtOrLang)
    } else {
      throw Error("Unknown internal term type: " + JSON.stringify(node));
    }
  }

  function externalTriple (triple, factory) { // !!rename internalTripleToRdjs
    return factory.quad(
      externalTerm(triple.subject, factory),
      externalTerm(triple.predicate, factory),
      externalTerm(triple.object, factory)
    );
  }

  function internalTermToTurtle (node, base, prefixes) {
    if (isIRI(node)) {
      // if (node === RDF_TYPE) // only valid in Turtle predicates
      //   return "a";

      // Escape special characters
      if (escape.test(node))
        node = node.replace(escapeAll, characterReplacer);
      const pref = Object.keys(prefixes).find(pref => node.startsWith(prefixes[pref]));
      if (pref) {
        const rest = node.substr(prefixes[pref].length);
        if (rest.indexOf("\\") === -1) // could also say no more than n of these: [...]
          return pref + ":" + rest.replace(/([~!$&'()*+,;=/?#@%])/g, '\\' + "$1");
      }
      if (node.startsWith(base)) {
        return "<" + node.substr(base.length) + ">";
      } else {
        return "<" + node + ">";
      }
    } else if (isBlank(node)) {
      return node;
    } else if (isLiteral(node)) {
      let value = getLiteralValue(node);
      const type = getLiteralType(node);
      const language = getLiteralLanguage(node);
      // Escape special characters
      if (escape.test(value))
        value = value.replace(escapeAll, characterReplacer);
      // Write the literal, possibly with type or language
      if (language)
        return '"' + value + '"@' + language;
      else if (type && type !== "http://www.w3.org/2001/XMLSchema#string")
        return '"' + value + '"^^' + this.internalTermToTurtle(type, base, prefixes);
      else
        return '"' + value + '"';
    } else {
      throw Error("Unknown internal term type: " + JSON.stringify(node));
    }
  }

  // Tests whether the given entity (triple object) represents an IRI in the N3 library
  function isIRI (entity) {
    if (typeof entity !== 'string')
      return false;
    else if (entity.length === 0)
      return true;
    else {
      const firstChar = entity[0];
      return firstChar !== '"' && firstChar !== '_';
    }
  }

  // Tests whether the given entity (triple object) represents a literal in the N3 library
  function isLiteral (entity) {
    return typeof entity === 'string' && entity[0] === '"';
  }

  // Tests whether the given entity (triple object) represents a blank node in the N3 library
  function isBlank (entity) {
    return typeof entity === 'string' && entity.substr(0, 2) === '_:';
  }

  // Tests whether the given entity represents the default graph
  function isDefaultGraph (entity) {
    return !entity;
  }

  // Tests whether the given triple is in the default graph
  function inDefaultGraph (triple) {
    return !triple.graph;
  }

  // Gets the string value of a literal in the N3 library
  function getLiteralValue (literal) {
    const match = /^"([^]*)"/.exec(literal);
    if (!match)
      throw new Error(literal + ' is not a literal');
    return match[1].replace(/\\"/g, '"');
  }

  // Gets the type of a literal in the N3 library
  function getLiteralType (literal) {
    const match = /^"[^]*"(?:\^\^([^"]+)|(@)[^@"]+)?$/.exec(literal);
    if (!match)
      throw new Error(literal + ' is not a literal');
    return match[1] || (match[2] ? RdfLangString : XsdString);
  }

  // Gets the language of a literal in the N3 library
  function getLiteralLanguage (literal) {
    const match = /^"[^]*"(?:@([^@"]+)|\^\^[^"]+)?$/.exec(literal);
    if (!match)
      throw new Error(literal + ' is not a literal');
    return match[1] ? match[1].toLowerCase() : '';
  }

// Characters in literals that require escaping
const escape    = /["\\\t\n\r\b\f\u0000-\u0019\ud800-\udbff]/,
    escapeAll = /["\\\t\n\r\b\f\u0000-\u0019]|[\ud800-\udbff][\udc00-\udfff]/g,
    escapeReplacements = {
      '\\': '\\\\', '"': '\\"', '\t': '\\t',
      '\n': '\\n', '\r': '\\r', '\b': '\\b', '\f': '\\f',
    };

  // Replaces a character by its escaped version
  function characterReplacer (character) {
    // Replace a single character by its escaped version
    let result = escapeReplacements[character]; // @@ const should be let
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

  return {
    RdfLangString: RdfLangString,
    XsdString: XsdString,
    resolveRelativeIRI: resolveRelativeIRI,
    isIRI: isIRI,
    isLiteral: isLiteral,
    isBlank: isBlank,
    isDefaultGraph: isDefaultGraph,
    inDefaultGraph: inDefaultGraph,
    getLiteralValue: getLiteralValue,
    getLiteralType: getLiteralType,
    getLiteralLanguage: getLiteralLanguage,
    internalTerm: internalTerm,
    internalTriple: internalTriple,
    externalTerm: externalTerm,
    externalTriple: externalTriple,
    internalTermToTurtle: internalTermToTurtle,
  }
})();

if (true)
  module.exports = ShExTermCjsModule; // node environment


/***/ }),

/***/ 443:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// **ShExUtil** provides ShEx utility functions

const ShExUtilCjsModule = (function () {
const ShExTerm = __webpack_require__(118);
const Visitor = __webpack_require__(806)
const Hierarchy = __webpack_require__(515)

const SX = {};
SX._namespace = "http://www.w3.org/ns/shex#";
["Schema", "@context", "imports", "startActs", "start", "shapes",
 "ShapeDecl", "ShapeOr", "ShapeAnd", "shapeExprs", "nodeKind",
 "NodeConstraint", "iri", "bnode", "nonliteral", "literal", "datatype", "length", "minlength", "maxlength", "pattern", "flags", "mininclusive", "minexclusive", "maxinclusive", "maxexclusive", "totaldigits", "fractiondigits", "values",
 "ShapeNot", "shapeExpr",
 "Shape", "abstract", "closed", "extra", "expression", "extends", "restricts", "semActs",
 "ShapeRef", "reference", "ShapeExternal",
 "EachOf", "OneOf", "expressions", "min", "max", "annotation",
 "TripleConstraint", "inverse", "negated", "predicate", "valueExpr",
 "Inclusion", "include", "Language", "languageTag",
 "IriStem", "LiteralStem", "LanguageStem", "stem",
 "IriStemRange", "LiteralStemRange", "LanguageStemRange", "exclusion",
 "Wildcard", "SemAct", "name", "code",
 "Annotation", "object"].forEach(p => {
  SX[p] = SX._namespace+p;
});
const RDF = {};
RDF._namespace = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
["type", "first", "rest", "nil"].forEach(p => {
  RDF[p] = RDF._namespace+p;
});
const XSD = {}
XSD._namespace = "http://www.w3.org/2001/XMLSchema#";
["anyURI"].forEach(p => {
  XSD[p] = XSD._namespace+p;
});
const OWL = {}
OWL._namespace = "http://www.w3.org/2002/07/owl#";
["Thing"].forEach(p => {
  OWL[p] = OWL._namespace+p;
});

const Missed = {}; // singleton
const UNBOUNDED = -1;

function extend (base) {
  if (!base) base = {};
  for (let i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
    for (let name in arg)
      base[name] = arg[name];
  return base;
}

    function isTerm (t) {
      return typeof t !== "object" || "value" in t && Object.keys(t).reduce((r, k) => {
        return r === false ? r : ["value", "type", "language"].indexOf(k) !== -1;
      }, true);
    }

  function isShapeRef (expr) {
    return typeof expr === "string" // test for JSON-LD @ID
  }
  let isInclusion = isShapeRef;

        function ldify (term) {
          if (term[0] !== "\"")
            return term;
          const ret = { value: ShExTerm.getLiteralValue(term) };
          const dt = ShExTerm.getLiteralType(term);
          if (dt &&
              dt !== "http://www.w3.org/2001/XMLSchema#string" &&
              dt !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString")
            ret.type = dt;
          const lang = ShExTerm.getLiteralLanguage(term)
          if (lang)
            ret.language = lang;
          return ret;
        }
const ShExUtil = {

  SX: SX,
  RDF: RDF,
  version: function () {
    return "0.5.0";
  },

  Visitor: Visitor,
  index: Visitor.index,


  /* getAST - compile a traditional regular expression abstract syntax tree.
   * Tested but not used at present.
   */
  getAST: function (schema) {
    return {
      type: "AST",
      shapes: schema.shapes.reduce(function (ret, shape) {
        ret[shape.id] = {
          type: "ASTshape",
          expression: _compileShapeToAST(shape.expression, [], schema)
        };
        return ret;
      }, {})
    };

    /* _compileShapeToAST - compile a shape expression to an abstract syntax tree.
     *
     * currently tested but not used.
     */
    function _compileShapeToAST (expression, tripleConstraints, schema) {

      function Epsilon () {
        this.type = "Epsilon";
      }

      function TripleConstraint (ordinal, predicate, inverse, negated, valueExpr) {
        this.type = "TripleConstraint";
        // this.ordinal = ordinal; @@ does 1card25
        this.inverse = !!inverse;
        this.negated = !!negated;
        this.predicate = predicate;
        if (valueExpr !== undefined)
          this.valueExpr = valueExpr;
      }

      function Choice (disjuncts) {
        this.type = "Choice";
        this.disjuncts = disjuncts;
      }

      function EachOf (conjuncts) {
        this.type = "EachOf";
        this.conjuncts = conjuncts;
      }

      function SemActs (expression, semActs) {
        this.type = "SemActs";
        this.expression = expression;
        this.semActs = semActs;
      }

      function KleeneStar (expression) {
        this.type = "KleeneStar";
        this.expression = expression;
      }

      function _compileExpression (expr, schema) {
        let repeated, container;

        /* _repeat: map expr with a min and max cardinality to a corresponding AST with Groups and Stars.
           expr 1 1 => expr
           expr 0 1 => Choice(expr, Eps)
           expr 0 3 => Choice(EachOf(expr, Choice(EachOf(expr, Choice(expr, EPS)), Eps)), Eps)
           expr 2 5 => EachOf(expr, expr, Choice(EachOf(expr, Choice(EachOf(expr, Choice(expr, EPS)), Eps)), Eps))
           expr 0 * => KleeneStar(expr)
           expr 1 * => EachOf(expr, KleeneStar(expr))
           expr 2 * => EachOf(expr, expr, KleeneStar(expr))

           @@TODO: favor Plus over Star if Epsilon not in expr.
        */
        function _repeat (expr, min, max) {
          if (min === undefined) { min = 1; }
          if (max === undefined) { max = 1; }

          if (min === 1 && max === 1) { return expr; }

          const opts = max === UNBOUNDED ?
                new KleeneStar(expr) :
                Array.from(Array(max - min)).reduce(function (ret, elt, ord) {
                  return ord === 0 ?
                    new Choice([expr, new Epsilon]) :
                    new Choice([new EachOf([expr, ret]), new Epsilon]);
                }, undefined);

          const reqd = min !== 0 ?
                new EachOf(Array.from(Array(min)).map(function (ret) {
                  return expr; // @@ something with ret
                }).concat(opts)) : opts;
          return reqd;
        }

        if (typeof expr === "string") { // Inclusion
          const included = schema._index.tripleExprs[expr].expression;
          return _compileExpression(included, schema);
        }

        else if (expr.type === "TripleConstraint") {
          // predicate, inverse, negated, valueExpr, annotations, semActs, min, max
          const valueExpr = "valueExprRef" in expr ?
                schema.valueExprDefns[expr.valueExprRef] :
                expr.valueExpr;
          const ordinal = tripleConstraints.push(expr)-1;
          const tp = new TripleConstraint(ordinal, expr.predicate, expr.inverse, expr.negated, valueExpr);
          repeated = _repeat(tp, expr.min, expr.max);
          return expr.semActs ? new SemActs(repeated, expr.semActs) : repeated;
        }

        else if (expr.type === "OneOf") {
          container = new Choice(expr.expressions.map(function (e) {
            return _compileExpression(e, schema);
          }));
          repeated = _repeat(container, expr.min, expr.max);
          return expr.semActs ? new SemActs(repeated, expr.semActs) : repeated;
        }

        else if (expr.type === "EachOf") {
          container = new EachOf(expr.expressions.map(function (e) {
            return _compileExpression(e, schema);
          }));
          repeated = _repeat(container, expr.min, expr.max);
          return expr.semActs ? new SemActs(repeated, expr.semActs) : repeated;
        }

        else throw Error("unexpected expr type: " + expr.type);
      }

      return expression ? _compileExpression(expression, schema) : new Epsilon();
    }
  },

  // tests
  // console.warn("HERE:", ShExJtoAS({"type":"Schema","shapes":[{"id":"http://all.example/S1","type":"Shape","expression":
  //  { "id":"http://all.example/S1e", "type":"EachOf","expressions":[ ] },
  // // { "id":"http://all.example/S1e","type":"TripleConstraint","predicate":"http://all.example/p1"},
  // "extra":["http://all.example/p3","http://all.example/p1","http://all.example/p2"]
  // }]}).shapes['http://all.example/S1']);

  ShExJtoAS: function (schema) {
    const _ShExUtil = this;
    schema._prefixes = schema._prefixes || {  };
    schema._index = this.index(schema);
    return schema;
  },

  AStoShExJ: function (schema, abbreviate) {
    schema["@context"] = schema["@context"] || "http://www.w3.org/ns/shex.jsonld";
    delete schema["_index"];
    delete schema["_prefixes"];
    return schema;
  },

  ShExRVisitor: function (knownShapeExprs) {
    const v = ShExUtil.Visitor();
    const knownExpressions = {};
    const oldVisitShapeExpr = v.visitShapeExpr,
        oldVisitValueExpr = v.visitValueExpr,
        oldVisitExpression = v.visitExpression;
    v.keepShapeExpr = oldVisitShapeExpr;

    v.visitShapeExpr = v.visitValueExpr = function (expr, label) {
      if (typeof expr === "string")
        return expr;
      if ("id" in expr) {
        if (knownShapeExprs.indexOf(expr.id) !== -1 || Object.keys(expr).length === 1)
          return expr.id;
        delete expr.id;
      }
      return oldVisitShapeExpr.call(this, expr, label);
    };

    v.visitExpression = function (expr) {
      if (typeof expr === "string") // shortcut for recursive references e.g. 1Include1 and ../doc/TODO.md
        return expr;
      if ("id" in expr) {
        if (expr.id in knownExpressions) {
          knownExpressions[expr.id].refCount++;
          return expr.id;
        }
      }
      const ret = oldVisitExpression.call(this, expr);
      // Everything from RDF has an ID, usually a BNode.
      knownExpressions[expr.id] = { refCount: 1, expr: ret };
      return ret;
    }

    v.cleanIds = function () {
      for (let k in knownExpressions) {
        const known = knownExpressions[k];
        if (known.refCount === 1 && ShExTerm.isBlank(known.expr.id))
          delete known.expr.id;
      };
    }

    return v;
  },


  // tests
  // const shexr = ShExUtil.ShExRtoShExJ({ "type": "Schema", "shapes": [
  //   { "id": "http://a.example/S1", "type": "Shape",
  //     "expression": {
  //       "type": "TripleConstraint", "predicate": "http://a.example/p1",
  //       "valueExpr": {
  //         "type": "ShapeAnd", "shapeExprs": [
  //           { "type": "NodeConstraint", "nodeKind": "bnode" },
  //           { "id": "http://a.example/S2", "type": "Shape",
  //             "expression": {
  //               "type": "TripleConstraint", "predicate": "http://a.example/p2" } }
  //           //            "http://a.example/S2"
  //         ] } } },
  //   { "id": "http://a.example/S2", "type": "Shape",
  //     "expression": {
  //       "type": "TripleConstraint", "predicate": "http://a.example/p2" } }
  // ] });
  // console.warn("HERE:", shexr.shapes[0].expression.valueExpr);
  // ShExUtil.ShExJtoAS(shexr);
  // console.warn("THERE:", shexr.shapes["http://a.example/S1"].expression.valueExpr);


  ShExRtoShExJ: function (schema) {
    // compile a list of known shapeExprs
    const knownShapeExprs = [];
    if ("shapes" in schema)
      [].push.apply(knownShapeExprs, schema.shapes.map(sh => { return sh.id; }));

    // normalize references to those shapeExprs
    const v = this.ShExRVisitor(knownShapeExprs);
    if ("start" in schema)
      schema.start = v.visitShapeExpr(schema.start);
    if ("shapes" in schema)
      schema.shapes = schema.shapes.map(sh => {
        return sh.type === SX.ShapeDecl ?
          {
            type: "ShapeDecl",
            id: sh.id,
            abstract: sh.abstract,
            shapeExpr: v.visitShapeExpr(sh.shapeExpr)
          } :
          v.keepShapeExpr(sh);
      });

    // remove extraneous BNode IDs
    v.cleanIds();
    return schema;
  },

  valGrep: function (obj, type, f) {
    const _ShExUtil = this;
    const ret = [];
    for (let i in obj) {
      const o = obj[i];
      if (typeof o === "object") {
        if ("type" in o && o.type === type)
          ret.push(f(o));
        ret.push.apply(ret, _ShExUtil.valGrep(o, type, f));
      }
    }
    return ret;
  },

  n3jsToTurtle: function (res) {
    function termToLex (node) {
      return typeof node === "object" ? ("\"" + node.value + "\"" + (
        "type" in node ? "^^<" + node.type + ">" :
          "language" in node ? "@" + node.language :
          ""
      )) :
      ShExTerm.isIRI(node) ? "<" + node + ">" :
      ShExTerm.isBlank(node) ? node :
      "???";
    }
    return this.valGrep(res, "TestedTriple", function (t) {
      return ["subject", "predicate", "object"].map(k => {
        return termToLex(t[k]);
      }).join(" ")+" .";
    });
  },

  valToN3js: function (res, factory) {
    return this.valGrep(res, "TestedTriple", function (t) {
      const ret = JSON.parse(JSON.stringify(t));
      if (typeof t.object === "object")
        ret.object = ("\"" + t.object.value + "\"" + (
          "type" in t.object ? "^^" + t.object.type :
            "language" in t.object ? "@" + t.object.language :
            ""
        ));
      return ShExTerm.externalTriple(ret, factory);
    });
  },

  n3jsToTurtle: function (n3js) {
    function termToLex (node) {
      if (ShExTerm.isIRI(node))
        return "<" + node + ">";
      if (ShExTerm.isBlank(node))
        return node;
      const t = ShExTerm.getLiteralType(node);
      if (t && t !== "http://www.w3.org/2001/XMLSchema#string")
        return "\"" + ShExTerm.getLiteralValue(node) + "\"" +
        "^^<" + t + ">";
      return node;
    }
    return n3js.map(function (t) {
      return ["subject", "predicate", "object"].map(k => {
        return termToLex(t[k]);
      }).join(" ")+" .";
    });
  },

  /* canonicalize: move all tripleExpression references to their first expression.
   *
   */
  canonicalize: function (schema, trimIRI) {
    const ret = JSON.parse(JSON.stringify(schema));
    ret["@context"] = ret["@context"] || "http://www.w3.org/ns/shex.jsonld";
    delete ret._prefixes;
    delete ret._base;
    let index = ret._index || this.index(schema);
    delete ret._index;
    let sourceMap = ret._sourceMap;
    delete ret._sourceMap;
    // Don't delete ret.productions as it's part of the AS.
    const v = ShExUtil.Visitor();
    const knownExpressions = [];
    const oldVisitInclusion = v.visitInclusion, oldVisitExpression = v.visitExpression;
    v.visitInclusion = function (inclusion) {
      if (knownExpressions.indexOf(inclusion) === -1 &&
          inclusion in index.tripleExprs) {
        knownExpressions.push(inclusion)
        return oldVisitExpression.call(v, index.tripleExprs[inclusion]);
      }
      return oldVisitInclusion.call(v, inclusion);
    };
    v.visitExpression = function (expression) {
      if (typeof expression === "object" && "id" in expression) {
        if (knownExpressions.indexOf(expression.id) === -1) {
          knownExpressions.push(expression.id)
          return oldVisitExpression.call(v, index.tripleExprs[expression.id]);
        }
        return expression.id; // Inclusion
      }
      return oldVisitExpression.call(v, expression);
    };
    if (trimIRI) {
      v.visitIRI = function (i) {
        return i.replace(trimIRI, "");
      }
      if ("imports" in ret)
        ret.imports = v.visitImports(ret.imports);
    }
    if ("shapes" in ret) {
      ret.shapes = Object.keys(index.shapeExprs).sort().map(k => {
        if ("extra" in index.shapeExprs[k])
          index.shapeExprs[k].extra.sort();
        return v.visitShapeDecl(index.shapeExprs[k]);
      });
    }
    return ret;
  },

  BiDiClosure: function () {
    return {
      needs: {},
      neededBy: {},
      inCycle: [],
      test: function () {
        function expect (l, r) { const ls = JSON.stringify(l), rs = JSON.stringify(r); if (ls !== rs) throw Error(ls+" !== "+rs); }
        // this.add(1, 2); expect(this.needs, { 1:[2]                     }); expect(this.neededBy, { 2:[1]                     });
        // this.add(3, 4); expect(this.needs, { 1:[2], 3:[4]              }); expect(this.neededBy, { 2:[1], 4:[3]              });
        // this.add(2, 3); expect(this.needs, { 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 2:[1], 3:[2,1], 4:[3,2,1] });

        this.add(2, 3); expect(this.needs, { 2:[3]                     }); expect(this.neededBy, { 3:[2]                     });
        this.add(1, 2); expect(this.needs, { 1:[2,3], 2:[3]            }); expect(this.neededBy, { 3:[2,1], 2:[1]            });
        this.add(1, 3); expect(this.needs, { 1:[2,3], 2:[3]            }); expect(this.neededBy, { 3:[2,1], 2:[1]            });
        this.add(3, 4); expect(this.needs, { 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 3:[2,1], 2:[1], 4:[3,2,1] });
        this.add(6, 7); expect(this.needs, { 6:[7]                    , 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 7:[6]                    , 3:[2,1], 2:[1], 4:[3,2,1] });
        this.add(5, 6); expect(this.needs, { 5:[6,7], 6:[7]           , 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 7:[6,5], 6:[5]           , 3:[2,1], 2:[1], 4:[3,2,1] });
        this.add(5, 7); expect(this.needs, { 5:[6,7], 6:[7]           , 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 7:[6,5], 6:[5]           , 3:[2,1], 2:[1], 4:[3,2,1] });
        this.add(7, 8); expect(this.needs, { 5:[6,7,8], 6:[7,8], 7:[8], 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 7:[6,5], 6:[5], 8:[7,6,5], 3:[2,1], 2:[1], 4:[3,2,1] });
        this.add(4, 5);
        expect(this.needs,    { 1:[2,3,4,5,6,7,8], 2:[3,4,5,6,7,8], 3:[4,5,6,7,8], 4:[5,6,7,8], 5:[6,7,8], 6:[7,8], 7:[8] });
        expect(this.neededBy, { 2:[1], 3:[2,1], 4:[3,2,1], 5:[4,3,2,1], 6:[5,4,3,2,1], 7:[6,5,4,3,2,1], 8:[7,6,5,4,3,2,1] });
      },
      add: function (needer, needie, negated) {
        const r = this;
        if (!(needer in r.needs))
          r.needs[needer] = [];
        if (!(needie in r.neededBy))
          r.neededBy[needie] = [];

        // // [].concat.apply(r.needs[needer], [needie], r.needs[needie]). emitted only last element
        r.needs[needer] = r.needs[needer].concat([needie], r.needs[needie]).
          filter(function (el, ord, l) { return el !== undefined && l.indexOf(el) === ord; });
        // // [].concat.apply(r.neededBy[needie], [needer], r.neededBy[needer]). emitted only last element
        r.neededBy[needie] = r.neededBy[needie].concat([needer], r.neededBy[needer]).
          filter(function (el, ord, l) { return el !== undefined && l.indexOf(el) === ord; });

        if (needer in this.neededBy) this.neededBy[needer].forEach(function (e) {
          r.needs[e] = r.needs[e].concat([needie], r.needs[needie]).
            filter(function (el, ord, l) { return el !== undefined && l.indexOf(el) === ord; });
        });

        if (needie in this.needs) this.needs[needie].forEach(function (e) {
          r.neededBy[e] = r.neededBy[e].concat([needer], r.neededBy[needer]).
            filter(function (el, ord, l) { return el !== undefined && l.indexOf(el) === ord; })
        });
        // this.neededBy[needie].push(needer);

        if (r.needs[needer].indexOf(needer) !== -1)
          r.inCycle = r.inCycle.concat(r.needs[needer]);
      },
      trim: function () {
        function _trim (a) {
          // filter(function (el, ord, l) { return l.indexOf(el) === ord; })
          for (let i = a.length-1; i > -1; --i)
            if (a.indexOf(a[i]) < i)
              a.splice(i, i+1);
        }
        for (k in this.needs)
          _trim(this.needs[k]);
        for (k in this.neededBy)
          _trim(this.neededBy[k]);
      },
      foundIn: {},
      addIn: function (tripleExpr, shapeExpr) {
        this.foundIn[tripleExpr] = shapeExpr;
      }
    }
  },
  /** @@TODO tests
   * options:
   *   no: don't do anything; just report nestable shapes
   *   transform: function to change shape labels
   */
  nestShapes: function (schema, options = {}) {
    const _ShExUtil = this;
    const index = schema._index || this.index(schema);
    if (!('no' in options)) { options.no = false }

    let shapeLabels = Object.keys(index.shapeExprs || [])
    let shapeReferences = {}
    shapeLabels.forEach(label => {
      let shape = index.shapeExprs[label]
      noteReference(label, null) // just note the shape so we have a complete list at the end
      shape = _ShExUtil.skipDecl(shape)
      if (shape.type === 'Shape') {
        if ('extends' in shape) {
          shape.extends.forEach(
             // !!! assumes simple reference, not e.g. AND
            parent => noteReference(parent, shape)
          )
        }
        if ('expression' in shape) {
          (_ShExUtil.simpleTripleConstraints(shape) || []).forEach(tc => {
            let target = _ShExUtil.getValueType(tc.valueExpr, true)
            noteReference(target, {type: 'tc', shapeLabel: label, tc: tc})
          })
        }
      } else if (shape.type === 'NodeConstraint') {
        // can't have any refs to other shapes
      } else {
        throw Error('nestShapes currently only supports Shapes and NodeConstraints')
      }
    })
    let nestables = Object.keys(shapeReferences).filter(
      label => shapeReferences[label].length === 1
        && shapeReferences[label][0].type === 'tc' // no inheritance support yet
        && label in index.shapeExprs
        && _ShExUtil.skipDecl(index.shapeExprs[label]).type === 'Shape' // Don't nest e.g. valuesets for now. @@ needs an option
        && !index.shapeExprs[label].abstract // shouldn't have a ref to an unEXTENDed ABSTRACT shape anyways.
    ).filter(
      nestable => !('noNestPattern' in options)
        || !nestable.match(RegExp(options.noNestPattern))
    ).reduce((acc, label) => {
      acc[label] = {
        referrer: shapeReferences[label][0].shapeLabel,
        predicate: shapeReferences[label][0].tc.predicate
      }
      return acc
    }, {})
    if (!options.no) {
      let oldToNew = {}

      if (options.rename) {
        if (!('transform' in options)) {
          options.transform = (function () {
            let map = shapeLabels.reduce((acc, k, idx) => {
              acc[k] = '_:renamed' + idx
              return acc
            }, {})
            return function (id, shapeExpr) {
              return map[id]
            }
          })()
        }
        Object.keys(nestables).forEach(oldName => {
          let shapeExpr = index.shapeExprs[oldName]
          let newName = options.transform(oldName, shapeExpr)
          oldToNew[oldName] = shapeExpr.id = newName
          shapeLabels[shapeLabels.indexOf(oldName)] = newName
          nestables[newName] = nestables[oldName]
          nestables[newName].was = oldName
          delete nestables[oldName]

          // @@ maybe update index when done? 
          index.shapeExprs[newName] = index.shapeExprs[oldName]
          delete index.shapeExprs[oldName]

          if (shapeReferences[oldName].length !== 1) { throw Error('assertion: ' + oldName + ' doesn\'t have one reference: [' + shapeReferences[oldName] + ']') }
          let ref = shapeReferences[oldName][0]
          if (ref.type === 'tc') {
            if (typeof ref.tc.valueExpr === 'string') { // ShapeRef
              ref.tc.valueExpr = newName
            } else {
              throw Error('assertion: rename not implemented for TripleConstraint expr: ' + ref.tc.valueExpr)
              // _ShExUtil.setValueType(ref, newName)
            }
          } else if (ref.type === 'Shape') {
            throw Error('assertion: rename not implemented for Shape: ' + ref)
          } else {
            throw Error('assertion: ' + ref.type + ' not TripleConstraint or Shape')
          }
        })

        Object.keys(nestables).forEach(k => {
          let n = nestables[k]
          if (n.referrer in oldToNew) {
            n.newReferrer = oldToNew[n.referrer]
          }
        })

        // Restore old order for more concise diffs.
        let shapesCopy = {}
        shapeLabels.forEach(label => shapesCopy[label] = index.shapeExprs[label])
        index.shapeExprs = shapesCopy
      } else {
        const doomed = []
        const ids = schema.shapes.map(s => s.id)
        Object.keys(nestables).forEach(oldName => {
          const borged = index.shapeExprs[oldName]
          // In principle, the ShExJ shouldn't have a Decl if the above criteria are met,
          // but the ShExJ may be generated by something which emits Decls regardless.
          shapeReferences[oldName][0].tc.valueExpr = _ShExUtil.skipDecl(borged)
          const delme = ids.indexOf(oldName)
          if (schema.shapes[delme].id !== oldName)
            throw Error('assertion: found ' + schema.shapes[delme].id + ' instead of ' + oldName)
          doomed.push(delme)
          delete index.shapeExprs[oldName]
        })
        doomed.sort((l, r) => r - l).forEach(delme => {
          const id = schema.shapes[delme].id
          if (!nestables[id])
            throw Error('deleting unexpected shape ' + id)
          delete schema.shapes[delme].id
          schema.shapes.splice(delme, 1)
        })
      }
    }
    // console.dir(nestables)
    // console.dir(shapeReferences)
    return nestables

    function noteReference (id, reference) {
      if (!(id in shapeReferences)) {
        shapeReferences[id] = []
      }
      if (reference) {
        shapeReferences[id].push(reference)
      }
    }
  },

  /** @@TODO tests
   *
   */
  getPredicateUsage: function (schema, untyped = {}) {
    const _ShExUtil = this;

    // populate shapeHierarchy
    let shapeHierarchy = Hierarchy.create()
    Object.keys(schema.shapes).forEach(label => {
      let shapeExpr = _ShExUtil.skipDecl(schema.shapes[label])
      if (shapeExpr.type === 'Shape') {
        (shapeExpr.extends || []).forEach(
          superShape => shapeHierarchy.add(superShape.reference, label)
        )
      }
    })
    Object.keys(schema.shapes).forEach(label => {
      if (!(label in shapeHierarchy.parents))
        shapeHierarchy.parents[label] = []
    })

    let predicates = { } // IRI->{ uses: [shapeLabel], commonType: shapeExpr }
    Object.keys(schema.shapes).forEach(shapeLabel => {
      let shapeExpr = _ShExUtil.skipDecl(schema.shapes[shapeLabel])
      if (shapeExpr.type === 'Shape') {
        let tcs = _ShExUtil.simpleTripleConstraints(shapeExpr) || []
        tcs.forEach(tc => {
          let newType = _ShExUtil.getValueType(tc.valueExpr)
          if (!(tc.predicate in predicates)) {
            predicates[tc.predicate] = {
              uses: [shapeLabel],
              commonType: newType,
              polymorphic: false
            }
            if (typeof newType === 'object') {
              untyped[tc.predicate] = {
                shapeLabel,
                predicate: tc.predicate,
                newType,
                references: []
              }
            }
          } else {
            predicates[tc.predicate].uses.push(shapeLabel)
            let curType = predicates[tc.predicate].commonType
            if (typeof curType === 'object' || curType === null) {
              // another use of a predicate with no commonType
              // console.warn(`${shapeLabel} ${tc.predicate}:${newType} uses untypable predicate`)
              untyped[tc.predicate].references.push({ shapeLabel, newType })
            } else if (typeof newType === 'object') {
              // first use of a predicate with no detectable commonType
              predicates[tc.predicate].commonType = null
              untyped[tc.predicate] = {
                shapeLabel,
                predicate: tc.predicate,
                curType,
                newType,
                references: []
              }
            } else if (curType === newType) {
              ; // same type again
            } else if (shapeHierarchy.parents[curType] && shapeHierarchy.parents[curType].indexOf(newType) !== -1) {
              predicates[tc.predicate].polymorphic = true; // already covered by current commonType
            } else {
              let idx = shapeHierarchy.parents[newType] ? shapeHierarchy.parents[newType].indexOf(curType) : -1
              if (idx === -1) {
                let intersection = shapeHierarchy.parents[curType]
                    ? shapeHierarchy.parents[curType].filter(
                      lab => -1 !== shapeHierarchy.parents[newType].indexOf(lab)
                    )
                    : []
                if (intersection.length === 0) {
                  untyped[tc.predicate] = {
                    shapeLabel,
                    predicate: tc.predicate,
                    curType,
                    newType,
                    references: []
                  }
                  // console.warn(`${shapeLabel} ${tc.predicate} : ${newType} isn\'t related to ${curType}`)
                  predicates[tc.predicate].commonType = null
                } else {
                  predicates[tc.predicate].commonType = intersection[0]
                  predicates[tc.predicate].polymorphic = true
                }
              } else {
                predicates[tc.predicate].commonType = shapeHierarchy.parents[newType][idx]
                predicates[tc.predicate].polymorphic = true
              }
            }
          }
        })
      }
    })
    return predicates
  },

  /** @@TODO tests
   *
   */
  simpleTripleConstraints: function (shape) {
    if (!('expression' in shape)) {
      return []
    }
    if (shape.expression.type === 'TripleConstraint') {
      return [ shape.expression ]
    }
    if (shape.expression.type === 'EachOf' &&
        !(shape.expression.expressions.find(
          expr => expr.type !== 'TripleConstraint'
        ))) {
          return shape.expression.expressions
        }
    throw Error('can\'t (yet) express ' + JSON.stringify(shape))
  },

  skipDecl: function (shapeExpr) {
    return shapeExpr.type === 'ShapeDecl' ? shapeExpr.shapeExpr : shapeExpr
  },

  getValueType: function (valueExpr) {
    if (typeof valueExpr === 'string') { return valueExpr }
    if (valueExpr.reference) { return valueExpr.reference }
    if (valueExpr.nodeKind === 'iri') { return OWL.Thing } // !! push this test to callers
    if (valueExpr.datatype) { return valueExpr.datatype }
    // if (valueExpr.extends && valueExpr.extends.length === 1) { return valueExpr.extends[0] }
    return valueExpr // throw Error('no value type for ' + JSON.stringify(valueExpr))
  },

  /** getDependencies: find which shappes depend on other shapes by inheritance
   * or inclusion.
   * TODO: rewrite in terms of Visitor.
   */
  getDependencies: function (schema, ret) {
    ret = ret || this.BiDiClosure();
    (schema.shapes || []).forEach(function (shape) {
      function _walkShapeExpression (shapeExpr, negated) {
        if (typeof shapeExpr === "string") { // ShapeRef
          ret.add(shape.id, shapeExpr);
        } else if (shapeExpr.type === "ShapeOr" || shapeExpr.type === "ShapeAnd") {
          shapeExpr.shapeExprs.forEach(function (expr) {
            _walkShapeExpression(expr, negated);
          });
        } else if (shapeExpr.type === "ShapeNot") {
          _walkShapeExpression(shapeExpr.shapeExpr, negated ^ 1); // !!! test negation
        } else if (shapeExpr.type === "Shape") {
          _walkShape(shapeExpr, negated);
        } else if (shapeExpr.type === "NodeConstraint") {
          // no impact on dependencies
        } else if (shapeExpr.type === "ShapeExternal") {
        } else
          throw Error("expected Shape{And,Or,Ref,External} or NodeConstraint in " + JSON.stringify(shapeExpr));
      }
      
      function _walkShape (shape, negated) {
        function _walkTripleExpression (tripleExpr, negated) {
          function _exprGroup (exprs, negated) {
            exprs.forEach(function (nested) {
              _walkTripleExpression(nested, negated) // ?? negation allowed?
            });
          }

          function _walkTripleConstraint (tc, negated) {
            if (tc.valueExpr)
              _walkShapeExpression(tc.valueExpr, negated);
            if (negated && ret.inCycle.indexOf(shape.id) !== -1) // illDefined/negatedRefCycle.err
              throw Error("Structural error: " + shape.id + " appears in negated cycle");
          }

          if (typeof tripleExpr === "string") { // Inclusion
            ret.add(shape.id, tripleExpr);
          } else {
            if ("id" in tripleExpr)
              ret.addIn(tripleExpr.id, shape.id)
            if (tripleExpr.type === "TripleConstraint") {
              _walkTripleConstraint(tripleExpr, negated);
            } else if (tripleExpr.type === "OneOf" || tripleExpr.type === "EachOf") {
              _exprGroup(tripleExpr.expressions);
            } else {
              throw Error("expected {TripleConstraint,OneOf,EachOf,Inclusion} in " + tripleExpr);
            }
          }
        }

        (["extends", "restricts"]).forEach(attr => {
        if (shape[attr] && shape[attr].length > 0)
          shape[attr].forEach(function (i) {
            ret.add(shape.id, i);
          });
        })
        if (shape.expression)
          _walkTripleExpression(shape.expression, negated);
      }
      if (shape.type === "ShapeDecl")
        shape = shape.shapeExpr;
      _walkShapeExpression(shape, 0); // 0 means false for bitwise XOR
    });
    return ret;
  },

  /** partition: create subset of a schema with only desired shapes and
   * their dependencies.
   *
   * @schema: input schema
   * @partition: shape name or array of desired shape names
   * @deps: (optional) dependency tree from getDependencies.
   *        map(shapeLabel -> [shapeLabel])
   */
  partition: function (schema, includes, deps, cantFind) {
    const inputIndex = schema._index || this.index(schema)
    const outputIndex = { shapeExprs: new Map(), tripleExprs: new Map() };
    includes = includes instanceof Array ? includes : [includes];

    // build dependency tree if not passed one
    deps = deps || this.getDependencies(schema);
    cantFind = cantFind || function (what, why) {
      throw new Error("Error: can't find shape " +
                      (why ?
                       why + " dependency " + what :
                       what));
    };
    const partition = {};
    for (let k in schema)
      partition[k] = k === "shapes" ? [] : schema[k];
    includes.forEach(function (i) {
      if (i in outputIndex.shapeExprs) {
        // already got it.
      } else if (i in inputIndex.shapeExprs) {
        const adding = inputIndex.shapeExprs[i];
        partition.shapes.push(adding);
        outputIndex.shapeExprs[adding.id] = adding;
        if (i in deps.needs)
          deps.needs[i].forEach(function (n) {
            // Turn any needed TE into an SE.
            if (n in deps.foundIn)
              n = deps.foundIn[n];

            if (n in outputIndex.shapeExprs) {
            } else if (n in inputIndex.shapeExprs) {
              const needed = inputIndex.shapeExprs[n];
              partition.shapes.push(needed);
              outputIndex.shapeExprs[needed.id] = needed;
            } else
              cantFind(n, i);
          });
      } else {
        cantFind(i, "supplied");
      }
    });
    return partition;
  },


  /** @@TODO flatten: return copy of input schema with all shape and value class
   * references substituted by a copy of their referent.
   *
   * @schema: input schema
   */
  flatten: function (schema, deps, cantFind) {
    const v = this.Visitor();
    return v.visitSchema(schema);
  },

  // @@ put predicateUsage here

  emptySchema: function () {
    return {
      type: "Schema"
    };
  },
  merge: function (left, right, overwrite, inPlace) {
    const ret = inPlace ? left : this.emptySchema();

    function mergeArray (attr) {
      Object.keys(left[attr] || {}).forEach(function (key) {
        if (!(attr in ret))
          ret[attr] = {};
        ret[attr][key] = left[attr][key];
      });
      Object.keys(right[attr] || {}).forEach(function (key) {
        if (!(attr  in left) || !(key in left[attr]) || overwrite) {
          if (!(attr in ret))
            ret[attr] = {};
          ret[attr][key] = right[attr][key];
        }
      });
    }

    function mergeMap (attr) {
      (left[attr] || new Map()).forEach(function (value, key, map) {
        if (!(attr in ret))
          ret[attr] = new Map();
        ret[attr].set(key, left[attr].get(key));
      });
      (right[attr] || new Map()).forEach(function (value, key, map) {
        if (!(attr  in left) || !(left[attr].has(key)) || overwrite) {
          if (!(attr in ret))
            ret[attr] = new Map();
          ret[attr].set(key, right[attr].get(key));
        }
      });
    }

    // base
    if ("_base" in left)
      ret._base = left._base;
    if ("_base" in right)
      if (!("_base" in left) || overwrite)
        ret._base = right._base;

    mergeArray("_prefixes");

    mergeMap("_sourceMap");

    if ("imports" in right)
      if (!("imports" in left) || overwrite)
        ret.imports = right.imports;

    // startActs
    if ("startActs" in left)
      ret.startActs = left.startActs;
    if ("startActs" in right)
      if (!("startActs" in left) || overwrite)
        ret.startActs = right.startActs;

    // start
    if ("start" in left)
      ret.start = left.start;
    if ("start" in right)
      if (!("start" in left) || overwrite)
        ret.start = right.start;

    let lindex = left._index || this.index(left);

    // shapes
    if (!inPlace)
      (left.shapes || []).forEach(function (lshape) {
        if (!("shapes" in ret))
          ret.shapes = [];
        ret.shapes.push(lshape);
      });
    (right.shapes || []).forEach(function (rshape) {
      if (!("shapes"  in left) || !(rshape.id in lindex.shapeExprs) || overwrite) {
        if (!("shapes" in ret))
          ret.shapes = [];
        ret.shapes.push(rshape)
      }
    });

    if (left._index || right._index)
      ret._index = this.index(ret); // inefficient; could build above

    return ret;
  },

  absolutizeResults: function (parsed, base) {
    // !! duplicate of Validation-test.js:84: const referenceResult = parseJSONFile(resultsFile...)
    function mapFunction (k, obj) {
      // resolve relative URLs in results file
      if (["shape", "reference", "node", "subject", "predicate", "object"].indexOf(k) !== -1 &&
          ShExTerm.isIRI(obj[k])) {
        obj[k] = ShExTerm.resolveRelativeIRI(base, obj[k]);
      }}

    function resolveRelativeURLs (obj) {
      Object.keys(obj).forEach(function (k) {
        if (typeof obj[k] === "object") {
          resolveRelativeURLs(obj[k]);
        }
        if (mapFunction) {
          mapFunction(k, obj);
        }
      });
    }
    resolveRelativeURLs(parsed);
    return parsed;
  },

  getProofGraph: function (res, db, dataFactory) {
    function _dive1 (solns) {
      if (solns.type === "NodeConstraintTest") {
      } else if (solns.type === "SolutionList" ||
                 solns.type === "ShapeAndResults" ||
                 solns.type === "ExtensionResults") {
        solns.solutions.forEach(s => {
          if (s.solution) // no .solution for <S> {}
            _dive1(s.solution);
        });
      } else if (solns.type === "ShapeOrResults") {
        _dive1(solns.solution);
      } else if (solns.type === "ShapeTest") {
        if ("solution" in solns)
          _dive1(solns.solution);
      } else if (solns.type === "OneOfSolutions" ||
                 solns.type === "EachOfSolutions") {
        solns.solutions.forEach(s => {
          _dive1(s);
        });
      } else if (solns.type === "OneOfSolution" ||
                 solns.type === "EachOfSolution") {
        solns.expressions.forEach(s => {
          _dive1(s);
        });
      } else if (solns.type === "TripleConstraintSolutions") {
        solns.solutions.map(s => {
          if (s.type !== "TestedTriple")
            throw Error("unexpected result type: " + s.type);
          const s2 = s;
          if (typeof s2.object === "object")
            s2.object = "\"" + s2.object.value.replace(/"/g, "\\\"") + "\""
            + (s2.object.language ? ("@" + s2.object.language) : 
               s2.object.type ? ("^^" + s2.object.type) :
               "");
          db.addQuad(ShExTerm.externalTriple(s2, dataFactory))
          if ("referenced" in s) {
            _dive1(s.referenced);
          }
        });
      } else if (solns.type === "ExtendedResults") {
        _dive1(solns.extensions);
        if ("local" in solns)
          _dive1(solns.local);        
      } else if (solns.type === "Recursion") {        
      } else {
        throw Error("unexpected expr type "+solns.type+" in " + JSON.stringify(solns));
      }
    }
    _dive1(res);
    return db;
  },

  validateSchema: function (schema) { // obselete, but may need other validations in the future.
    const _ShExUtil = this;
    const visitor = this.Visitor();
    let currentLabel = currentExtra = null;
    let currentNegated = false;
    const dependsOn = { };
    let inTE = false;
    const oldVisitShape = visitor.visitShape;
    const negativeDeps = Hierarchy.create();
    const positiveDeps = Hierarchy.create();
    let index = schema.index || this.index(schema);

    visitor.visitShape = function (shape, label) {
      const lastExtra = currentExtra;
      currentExtra = shape.extra;
      const ret = oldVisitShape.call(visitor, shape, label);
      currentExtra = lastExtra;
      return ret;
    }

    const oldVisitShapeNot = visitor.visitShapeNot;
    visitor.visitShapeNot = function (shapeNot, label) {
      const lastNegated = currentNegated;
      currentNegated ^= true;
      const ret = oldVisitShapeNot.call(visitor, shapeNot, label);
      currentNegated = lastNegated;
      return ret;
    }

    const oldVisitTripleConstraint = visitor.visitTripleConstraint;
    visitor.visitTripleConstraint = function (expr) {
      const lastNegated = currentNegated;
      if (currentExtra && currentExtra.indexOf(expr.predicate) !== -1)
        currentNegated ^= true;
      inTE = true;
      const ret = oldVisitTripleConstraint.call(visitor, expr);
      inTE = false;
      currentNegated = lastNegated;
      return ret;
    };

    const oldVisitShapeRef = visitor.visitShapeRef;
    visitor.visitShapeRef = function (shapeRef) {
      if (!(shapeRef in index.shapeExprs))
        throw firstError(Error("Structural error: reference to " + JSON.stringify(shapeRef) + " not found in schema shape expressions:\n" + dumpKeys(index.shapeExprs) + "."), shapeRef);
      if (!inTE && shapeRef === currentLabel)
        throw firstError(Error("Structural error: circular reference to " + currentLabel + "."), shapeRef);
      (currentNegated ? negativeDeps : positiveDeps).add(currentLabel, shapeRef)
      return oldVisitShapeRef.call(visitor, shapeRef);
    }

    const oldVisitInclusion = visitor.visitInclusion;
    visitor.visitInclusion = function (inclusion) {
      let refd;
      if (!(refd = index.tripleExprs[inclusion]))
        throw firstError(Error("Structural error: included shape " + inclusion + " not found in schema triple expressions:\n" + dumpKeys(index.tripleExprs) + "."), inclusion);
      // if (refd.type !== "Shape")
      //   throw Error("Structural error: " + inclusion + " is not a simple shape.");
      return oldVisitInclusion.call(visitor, inclusion);
    };

    (schema.shapes || []).forEach(function (shape) {
      currentLabel = shape.id;
      visitor.visitShapeDecl(shape, shape.id);
    });
    let circs = Object.keys(negativeDeps.children).filter(
      k => negativeDeps.children[k].filter(
        k2 => k2 in negativeDeps.children && negativeDeps.children[k2].indexOf(k) !== -1
          || k2 in positiveDeps.children && positiveDeps.children[k2].indexOf(k) !== -1
      ).length > 0
    );
    if (circs.length)
      throw firstError(Error("Structural error: circular negative dependencies on " + circs.join(',') + "."), circs[0]);

    function dumpKeys (obj) {
      return obj ? Object.keys(obj).map(
        u => u.substr(0, 2) === '_:' ? u : '<' + u + '>'
      ).join("\n        ") : '- none defined -'
    }

    function firstError (e, obj) {
      if ("_sourceMap" in schema)
        e.location = (schema._sourceMap.get(obj) || [undefined])[0];
      return e;
    }
  },

  /** isWellDefined: assert that schema is well-defined.
   *
   * @schema: input schema
   * @@TODO
   */
  isWellDefined: function (schema) {
    this.validateSchema(schema);
    // const deps = this.getDependencies(schema);
    return schema;
  },

  walkVal: function (val, cb) {
    const _ShExUtil = this;
    if (typeof val === "string") { // ShapeRef
      return null; // 1NOTRefOR1dot_pass-inOR
    } else if (val.type === "SolutionList") { // dependent_shape
      return val.solutions.reduce((ret, exp) => {
        const n = _ShExUtil.walkVal(exp, cb);
        if (n)
          Object.keys(n).forEach(k => {
            if (k in ret)
              ret[k] = ret[k].concat(n[k]);
            else
              ret[k] = n[k];
          })
        return ret;
      }, {});
    } else if (val.type === "NodeConstraintTest") { // 1iri_pass-iri
      return _ShExUtil.walkVal(val.shapeExpr, cb);
    } else if (val.type === "NodeConstraint") { // 1iri_pass-iri
      return null;
    } else if (val.type === "ShapeTest") { // 0_empty
      const vals = [];
      visitSolution(val, vals); // A ShapeTest is a sort of Solution.
      const ret = vals.length
            ? {'http://shex.io/reflex': vals}
            : {};
      if ("solution" in val)
        Object.assign(ret, _ShExUtil.walkVal(val.solution, cb))
      return Object.keys(ret).length ? ret : null;
    } else if (val.type === "Shape") { // 1NOTNOTdot_passIv1
      return null;
    } else if (val.type === "ShapeNotTest") { // 1NOT_vsANDvs__passIv1
      return _ShExUtil.walkVal(val.shapeExpr, cb);
    } else if (val.type === "ShapeNotResults") { // NOT1dotOR2dot_pass-empty
      return _ShExUtil.walkVal(val.solution, cb);
    } else if (val.type === "Failure") { // NOT1dotOR2dot_pass-empty
      return null; // !!TODO
    } else if (val.type === "ShapeNot") { // 1NOTNOTIRI_passIo1,
      return _ShExUtil.walkVal(val.shapeExpr, cb);
    } else if (val.type === "ShapeOrResults") { // 1dotRefOR3_passShape1
      return _ShExUtil.walkVal(val.solution, cb);
    } else if (val.type === "ShapeOr") { // 1NOT_literalORvs__passIo1
      return val.shapeExprs.reduce((ret, exp) => {
        const n = _ShExUtil.walkVal(exp, cb);
        if (n)
          Object.keys(n).forEach(k => {
            if (k in ret)
              ret[k] = ret[k].concat(n[k]);
            else
              ret[k] = n[k];
          })
        return ret;
      }, {});
    } else if (val.type === "ShapeAndResults" || // 1iriRef1_pass-iri
               val.type === "ExtensionResults") { // extends-abstract-multi-empty_pass-missingOptRef1
      return val.solutions.reduce((ret, exp) => {
        const n = _ShExUtil.walkVal(exp, cb);
        if (n)
          Object.keys(n).forEach(k => {
            if (k in ret)
              ret[k] = ret[k].concat(n[k]);
            else
              ret[k] = n[k];
          })
        return ret;
      }, {});
    } else if (val.type === "ShapeAnd") { // 1NOT_literalANDvs__passIv1
      return val.shapeExprs.reduce((ret, exp) => {
        const n = _ShExUtil.walkVal(exp, cb);
        if (n)
          Object.keys(n).forEach(k => {
            if (k in ret)
              ret[k] = ret[k].concat(n[k]);
            else
              ret[k] = n[k];
          })
        return ret;
      }, {});
    } else if (val.type === "ExtendedResults") { // extends-abstract-multi-empty_pass-missingOptRef1
      return (["extensions", "local"]).reduce((ret, exp) => {
        const n = _ShExUtil.walkVal(exp, cb);
        if (n)
          Object.keys(n).forEach(k => {
            if (k in ret)
              ret[k] = ret[k].concat(n[k]);
            else
              ret[k] = n[k];
          })
        return ret;
      }, {});
    } else if (val.type === "EachOfSolutions" || val.type === "OneOfSolutions") {
      // 1dotOne2dot_pass_p1
      return val.solutions.reduce((ret, sln) => {
        sln.expressions.forEach(exp => {
          const n = _ShExUtil.walkVal(exp, cb);
          if (n)
            Object.keys(n).forEach(k => {
              if (k in ret)
                ret[k] = ret[k].concat(n[k]);
              else
                ret[k] = n[k];
            })
        });
        return ret;
      }, {});
    } else if (val.type === "TripleConstraintSolutions") { // 1dot_pass-noOthers
      if ("solutions" in val) {
        const ret = {};
        const vals = [];
        ret[val.predicate] = vals;
        val.solutions.forEach(sln => visitSolution(sln, vals));
        return vals.length ? ret : null;
      } else {
        return null;
      }
    } else if (val.type === "Recursion") { // 3circRefPlus1_pass-recursiveData
      return null;
    } else {
      // console.log(val);
      throw Error("unknown shapeExpression type in " + JSON.stringify(val));
    }
    return val;

        function visitSolution (sln, vals) {
          const toAdd = [];
          if (chaseList(sln.referenced, toAdd)) { // parse 1val1IRIREF.ttl
            [].push.apply(vals, toAdd);
          } else { // 1dot_pass-noOthers
            const newElt = cb(sln) || {};
            if ("referenced" in sln) {
              const t = _ShExUtil.walkVal(sln.referenced, cb);
              if (t)
                newElt.nested = t;
            }
            if (Object.keys(newElt).length > 0)
              vals.push(newElt);
          }
          function chaseList (li) {
            if (!li) return false;
            if (li.node === RDF.nil) return true;
            if ("solution" in li && "solutions" in li.solution &&
                li.solution.solutions.length === 1 &&
                "expressions" in li.solution.solutions[0] &&
                li.solution.solutions[0].expressions.length === 2 &&
                "predicate" in li.solution.solutions[0].expressions[0] &&
                li.solution.solutions[0].expressions[0].predicate === RDF.first &&
                li.solution.solutions[0].expressions[1].predicate === RDF.rest) {
              const expressions = li.solution.solutions[0].expressions;
              const ent = expressions[0];
              const rest = expressions[1].solutions[0];
              const member = ent.solutions[0];
              let newElt = cb(member);
              if ("referenced" in member) {
                const t = _ShExUtil.walkVal(member.referenced, cb);
                if (t) {
                  if (newElt)
                    newElt.nested = t;
                  else
                    newElt = t;
                }
              }
              if (newElt)
                vals.push(newElt);
              return rest.object === RDF.nil ?
                true :
                chaseList(rest.referenced.type === "ShapeOrResults" // heuristic for `nil OR @<list>` idiom
                          ? rest.referenced.solution
                          : rest.referenced);
            }
          }
        }
  },

  /**
   * Convert val results to a property tree.
   * @exports
   * @returns {@code {p1:[{p2: v2},{p3: v3}]}}
   */
  valToValues: function (val) {
    return this.walkVal (val, function (sln) {
      return "object" in sln ? { ldterm: sln.object } : null;
    });
  },

  valToExtension: function (val, lookfor) {
    const map = this.walkVal (val, function (sln) {
      return "extensions" in sln ? { extensions: sln.extensions } : null;
    });
    function extensions (obj) {
      const list = [];
      let crushed = {};
      function crush (elt) {
        if (crushed === null)
          return elt;
        if (Array.isArray(elt)) {
          crushed = null;
          return elt;
        }
        for (k in elt) {
          if (k in crushed) {
            crushed = null
            return elt;
          }
          crushed[k] = ldify(elt[k]);
        }
        return elt;
      }
      for (let k in obj) {
        if (k === "extensions") {
          if (obj[k])
            list.push(crush(ldify(obj[k][lookfor])));
        } else if (k === "nested") {
          const nested = extensions(obj[k]);
          if (Array.isArray(nested))
            nested.forEach(crush);
          else
            crush(nested);
          list.push(nested);
        } else {
          list.push(crush(extensions(obj[k])));
        }
      }
      return list.length === 1 ? list[0] :
        crushed ? crushed :
        list;
    }
    return extensions(map);
  },

  valuesToSchema: function (values) {
    // console.log(JSON.stringify(values, null, "  "));
    const v = values;
    const t = values[RDF.type][0].ldterm;
    if (t === SX.Schema) {
      /* Schema { "@context":"http://www.w3.org/ns/shex.jsonld"
       *           startActs:[SemAct+]? start:(shapeExpr|labeledShapeExpr)?
       *           shapes:[labeledShapeExpr+]? }
       */
      const ret = {
        "@context": "http://www.w3.org/ns/shex.jsonld",
        type: "Schema"
      }
      if (SX.startActs in v)
        ret.startActs = v[SX.startActs].map(e => {
          const ret = {
            type: "SemAct",
            name: e.nested[SX.name][0].ldterm
          };
          if (SX.code in e.nested)
            ret.code = e.nested[SX.code][0].ldterm.value;
          return ret;
        });
      if (SX.imports in v)
        ret.imports = v[SX.imports].map(e => {
          return e.ldterm;
        });
      if (values[SX.start])
        ret.start = extend({id: values[SX.start][0].ldterm}, shapeExpr(values[SX.start][0].nested));
      const shapes = values[SX.shapes];
      if (shapes) {
        ret.shapes = shapes.map(v => { // @@ console.log(v.nested);
          var t = v.nested[RDF.type][0].ldterm;
          var obj = t === SX.ShapeDecl ?
              {
                type: SX.ShapeDecl,
                abstract: !!v.nested[SX["abstract"]][0].ldterm.value,
                shapeExpr: shapeExpr(v.nested[SX.shapeExpr][0].nested)
              } :
              shapeExpr(v.nested);
          return extend({id: v.ldterm}, obj);
        });
      }
      // console.log(ret);
      return ret;
    } else {
      throw Error("unknown schema type in " + JSON.stringify(values));
    }
    function findType (v, elts, f) {
      const t = v[RDF.type][0].ldterm.substr(SX._namespace.length);
      const elt = elts[t];
      if (!elt)
        return Missed;
      if (elt.nary) {
        const ret = {
          type: t,
        };
        ret[elt.prop] = v[SX[elt.prop]].map(e => {
          return valueOf(e);
        });
        return ret;
      } else {
        const ret = {
          type: t
        };
        if (elt.prop) {
          ret[elt.prop] = valueOf(v[SX[elt.prop]][0]);
        }
        return ret;
      }

      function valueOf (x) {
        return elt.expr && "nested" in x ? extend({ id: x.ldterm, }, f(x.nested)) : x.ldterm;
      }
    }
    function shapeExpr (v) {
      // shapeExpr = ShapeOr | ShapeAnd | ShapeNot | NodeConstraint | Shape | ShapeRef | ShapeExternal;
      const elts = { "ShapeAnd"     : { nary: true , expr: true , prop: "shapeExprs" },
                   "ShapeOr"      : { nary: true , expr: true , prop: "shapeExprs" },
                   "ShapeNot"     : { nary: false, expr: true , prop: "shapeExpr"  },
                   "ShapeRef"     : { nary: false, expr: false, prop: "reference"  },
                   "ShapeExternal": { nary: false, expr: false, prop: null         } };
      let ret = findType(v, elts, shapeExpr);
      if (ret !== Missed)
        return ret;

      const t = v[RDF.type][0].ldterm;
      if (t === SX.ShapeDecl) {
        const ret = { type: "ShapeDecl" };
        ["abstract"].forEach(a => {
          if (SX[a] in v)
            ret[a] = !!v[SX[a]][0].ldterm.value;
        });
        if (SX.shapeExpr in v) {
          ret.shapeExpr =
            "nested" in v[SX.shapeExpr][0] ?
            extend({id: v[SX.shapeExpr][0].ldterm}, shapeExpr(v[SX.shapeExpr][0].nested)) :
            v[SX.shapeExpr][0].ldterm;
        }
        return ret;
      } else if (t === SX.Shape) {
        ret = { type: "Shape" };
        ["closed"].forEach(a => {
          if (SX[a] in v)
            ret[a] = !!v[SX[a]][0].ldterm.value;
        });
        ["extra", "extends", "restricts"].forEach(a => {
          if (SX[a] in v)
            ret[a] = v[SX[a]].map(e => { return e.ldterm; });
        });
        if (SX.expression in v) {
          ret.expression =
            "nested" in v[SX.expression][0] ?
            extend({id: v[SX.expression][0].ldterm}, tripleExpr(v[SX.expression][0].nested)) :
            v[SX.expression][0].ldterm;
        }
        if (SX.annotation in v)
          ret.annotations = v[SX.annotation].map(e => {
            return {
              type: "Annotation",
              predicate: e.nested[SX.predicate][0].ldterm,
              object: e.nested[SX.object][0].ldterm
            };
          });
        if (SX.semActs in v)
          ret.semActs = v[SX.semActs].map(e => {
            const ret = {
              type: "SemAct",
              name: e.nested[SX.name][0].ldterm
            };
            if (SX.code in e.nested)
              ret.code = e.nested[SX.code][0].ldterm.value;
            return ret;
          });
        return ret;
      } else if (t === SX.NodeConstraint) {
        const ret = { type: "NodeConstraint" };
        if (SX.values in v)
          ret.values = v[SX.values].map(v1 => { return objectValue(v1); });
        if (SX.nodeKind in v)
          ret.nodeKind = v[SX.nodeKind][0].ldterm.substr(SX._namespace.length);
        ["length", "minlength", "maxlength", "mininclusive", "maxinclusive", "minexclusive", "maxexclusive", "totaldigits", "fractiondigits"].forEach(a => {
          if (SX[a] in v)
            ret[a] = parseFloat(v[SX[a]][0].ldterm.value);
        });
        if (SX.pattern in v)
          ret.pattern = v[SX.pattern][0].ldterm.value;
        if (SX.flags in v)
          ret.flags = v[SX.flags][0].ldterm.value;
        if (SX.datatype in v)
          ret.datatype = v[SX.datatype][0].ldterm;
        return ret;
      } else {
        throw Error("unknown shapeExpr type in " + JSON.stringify(v));
      }

    }

    function objectValue (v, expectString) {
      if ("nested" in v) {
        const t = v.nested[RDF.type][0].ldterm;
        if ([SX.IriStem, SX.LiteralStem, SX.LanguageStem].indexOf(t) !== -1) {
          const ldterm = v.nested[SX.stem][0].ldterm.value;
          return {
            type: t.substr(SX._namespace.length),
            stem: ldterm
          };
        } else if ([SX.Language].indexOf(t) !== -1) {
          return {
            type: "Language",
            languageTag: v.nested[SX.languageTag][0].ldterm.value
          };
        } else if ([SX.IriStemRange, SX.LiteralStemRange, SX.LanguageStemRange].indexOf(t) !== -1) {
          const st = v.nested[SX.stem][0];
          let stem = st;
          if (typeof st === "object") {
            if (typeof st.ldterm === "object") {
              stem = st.ldterm;
            } else if (st.ldterm.startsWith("_:")) {
              stem = { type: "Wildcard" };
            }
          }
          const ret = {
            type: t.substr(SX._namespace.length),
            stem: stem.type !== "Wildcard" ? stem.value : stem
          };
          if (SX.exclusion in v.nested) {
            // IriStemRange:
            // * [{"ldterm":"http://a.example/v1"},{"ldterm":"http://a.example/v3"}] <-- no value
            // * [{"ldterm":"_:b836","nested":{a:[{"ldterm":sx:IriStem}],
            //                                 sx:stem:[{"ldterm":{"value":"http://a.example/v1"}}]}},
            //    {"ldterm":"_:b838","nested":{a:[{"ldterm":sx:IriStem}],
            //                                 sx:stem:[{"ldterm":{"value":"http://a.example/v3"}}]}}]

            // LiteralStemRange:
            // * [{"ldterm":{"value":"v1"}},{"ldterm":{"value":"v3"}}]
            // * [{"ldterm":"_:b866","nested":{a:[{"ldterm":sx:LiteralStem}],
            //                                 sx:stem:[{"ldterm":{"value":"v1"}}]}},
            //    {"ldterm":"_:b868","nested":{a:[{"ldterm":sx:LiteralStem}],
            //                                 sx:stem:[{"ldterm":{"value":"v3"}}]}}]

            // LanguageStemRange:
            // * [{"ldterm":{"value":"fr-be"}},{"ldterm":{"value":"fr-ch"}}]
            // * [{"ldterm":"_:b851","nested":{a:[{"ldterm":sx:LanguageStem}],
            //                                 sx:stem:[{"ldterm":{"value":"fr-be"}}]}},
            //    {"ldterm":"_:b853","nested":{a:[{"ldterm":sx:LanguageStem}],
            //                                 sx:stem:[{"ldterm":{"value":"fr-ch"}}]}}]
            ret.exclusions = v.nested[SX.exclusion].map(v1 => {
              return objectValue(v1, t !== SX.IriStemRange);
            });
          }
          return ret;
        } else {
          throw Error("unknown objectValue type in " + JSON.stringify(v));
        }
      } else {
        return expectString ? v.ldterm.value : v.ldterm;
      }
    }

    function tripleExpr (v) {
      // tripleExpr = EachOf | OneOf | TripleConstraint | Inclusion ;
      const elts = { "EachOf"   : { nary: true , expr: true , prop: "expressions" },
                   "OneOf"    : { nary: true , expr: true , prop: "expressions" },
                   "Inclusion": { nary: false, expr: false, prop: "include"     } };
      const ret = findType(v, elts, tripleExpr);
      if (ret !== Missed) {
        minMaxAnnotSemActs(v, ret);
        return ret;
      }

      const t = v[RDF.type][0].ldterm;
      if (t === SX.TripleConstraint) {
        const ret = {
          type: "TripleConstraint",
          predicate: v[SX.predicate][0].ldterm
        };
        ["inverse"].forEach(a => {
          if (SX[a] in v)
            ret[a] = !!v[SX[a]][0].ldterm.value;
        });
        if (SX.valueExpr in v)
          ret.valueExpr = extend({id: v[SX.valueExpr][0].ldterm}, "nested" in v[SX.valueExpr][0] ? shapeExpr(v[SX.valueExpr][0].nested) : {});
        minMaxAnnotSemActs(v, ret);
        return ret;
      } else {
        throw Error("unknown tripleExpr type in " + JSON.stringify(v));
      }
    }
    function minMaxAnnotSemActs (v, ret) {
      if (SX.min in v)
        ret.min = parseInt(v[SX.min][0].ldterm.value);
      if (SX.max in v) {
        ret.max = parseInt(v[SX.max][0].ldterm.value);
        if (isNaN(ret.max))
          ret.max = UNBOUNDED;
      }
      if (SX.annotation in v)
        ret.annotations = v[SX.annotation].map(e => {
          return {
            type: "Annotation",
            predicate: e.nested[SX.predicate][0].ldterm,
            object: e.nested[SX.object][0].ldterm
          };
        });
      if (SX.semActs in v)
        ret.semActs = v[SX.semActs].map(e => {
          const ret = {
            type: "SemAct",
            name: e.nested[SX.name][0].ldterm
          };
          if (SX.code in e.nested)
            ret.code = e.nested[SX.code][0].ldterm.value;
          return ret;
        });
      return ret;
    }
  },
/* -- deprecated
  valToSimple: function (val) {
    const _ShExUtil = this;
    function _join (list) {
      return list.reduce((ret, elt) => {
        Object.keys(elt).forEach(k => {
          if (k in ret) {
            ret[k] = Array.from(new Set(ret[k].concat(elt[k])));
          } else {
            ret[k] = elt[k];
          }
        });
        return ret;
      }, {});
    }
    if (typeof val === "string") {
      return val
    } else if (val.type === "TripleConstraintSolutions") {
      if ("solutions" in val) {
        return val.solutions.reduce((ret, sln) => {
          if (!("referenced" in sln))
            return {};
          const toAdd = {};
          if (chaseList(sln.referenced, toAdd)) {
            return _join(ret, toAdd);
          } else {
            return _join(ret, _ShExUtil.valToSimple(sln.referenced));
          }
          function chaseList (li) {
            if (!li) return false;
            if (li.node === RDF.nil) return true;
            if ("solution" in li && "solutions" in li.solution &&
                li.solution.solutions.length === 1 &&
                "expressions" in li.solution.solutions[0] &&
                li.solution.solutions[0].expressions.length === 2 &&
                "predicate" in li.solution.solutions[0].expressions[0] &&
                li.solution.solutions[0].expressions[0].predicate === RDF.first &&
                li.solution.solutions[0].expressions[1].predicate === RDF.rest) {
              const expressions = li.solution.solutions[0].expressions;
              const ent = expressions[0];
              const rest = expressions[1].solutions[0];
              const member = ent.solutions[0];
              const newElt = { ldterm: member.object };
              if ("referenced" in member) {
                const t = _ShExUtil.valToSimple(member.referenced);
                if (t)
                  newElt.nested = t;
              }
              toAdd = _join(toAdd, newElt);
              return rest.object === RDF.nil ?
                true :
                chaseList(rest.referenced.type === "ShapeOrResults" // heuristic for `nil  OR @<list>` idiom
                          ? rest.referenced.solution
                          : rest.referenced);
            }
          }
        }, []);
      } else {
        return [];
      }
    } else if (["TripleConstraintSolutions"].indexOf(val.type) !== -1) {
      return {  };
    } else if (val.type === "NodeConstraintTest") {
      return _ShExUtil.valToSimple(val.shapeExpr);
    } else if (val.type === "NodeConstraint") {
      const thisNode = {  };
      thisNode[n3ify(val.focus)] = [val.shape];
      return thisNode;
    } else if (val.type === "ShapeTest") {
      const thisNode = {  };
      thisNode[n3ify(val.node)] = [val.shape];
      return "solution" in val ? _join([thisNode].concat(_ShExUtil.valToSimple(val.solution))) : thisNode;
    } else if (val.type === "Shape") {
      const thisNode = {  };
      thisNode[n3ify(val.node)] = [val.shape];
      return thisNode;
    } else if (val.type === "ShapeNotTest") {
      const thisNode = {  };
      thisNode[n3ify(val.node)] = [val.shape];
      return _join(['NOT1'].concat(_ShExUtil.valToSimple(val.shapeExpr)));
    } else if (val.type === "ShapeNot") {
      const thisNode = {  };
      thisNode[n3ify(val.node)] = [val.shape];
      return _join(['NOT'].concat(_ShExUtil.valToSimple(val.shapeExpr)));
    } else if (val.type === "ShapeAnd") {
      return val.shapeExprs.map(shapeExpr => _ShExUtil.valToSimple(shapeExpr)).join ('AND');
    } else if (val.type === "ShapeOr") {
      return val.shapeExprs.map(shapeExpr => _ShExUtil.valToSimple(shapeExpr)).join ('OR');
    } else if (val.type === "Failure") {
      return _ShExUtil.errsToSimple(val);
    } else if (val.type === "Recursion") {
      return {  };
    } else if ("solutions" in val) {
      // ["SolutionList", "EachOfSolutions", "OneOfSolutions", "ShapeAndResults", "ShapeOrResults"].indexOf(val.type) !== -1
      return _join(val.solutions.map(sln => {
        return _ShExUtil.valToSimple(sln);
      }));
    } else if ("solution" in val) {
      // ["SolutionList", "EachOfSolutions", "OneOfSolutions", "ShapeAndResults", "ShapeOrResults"].indexOf(val.type) !== -1
      return _ShExUtil.valToSimple(val.solution);
    } else if ("expressions" in val) {
      return _join(val.expressions.map(sln => {
        return _ShExUtil.valToSimple(sln);
      }));
    } else {
      // console.log(val);
      throw Error("unknown shapeExpression type in " + JSON.stringify(val));
    }
    return val;
  },
*/
  simpleToShapeMap: function (x) {
    return Object.keys(x).reduce((ret, k) => {
      x[k].forEach(s => {
        ret.push({node: k, shape: s });
      });
      return ret;
    }, []);
  },

  absolutizeShapeMap: function (parsed, base) {
    return parsed.map(elt => {
      return Object.assign(elt, {
        node: ShExTerm.resolveRelativeIRI(base, elt.node),
        shape: ShExTerm.resolveRelativeIRI(base, elt.shape)
      });
    });
  },

  errsToSimple: function (val) {
    const _ShExUtil = this;
    if (val.type === "FailureList") {
      return val.errors.reduce((ret, e) => {
        return ret.concat(_ShExUtil.errsToSimple(e));
      }, []);
    } else if (val.type === "Failure") {
      return ["validating " + val.node + " as " + val.shape + ":"].concat(errorList(val.errors).reduce((ret, e) => {
        const nested = _ShExUtil.errsToSimple(e).map(s => "  " + s);
        return ret.length > 0 ? ret.concat(["  OR"]).concat(nested) : nested.map(s => "  " + s);
      }, []));
    } else if (val.type === "TypeMismatch") {
      const nested = Array.isArray(val.errors) ?
          val.errors.reduce((ret, e) => {
            return ret.concat((typeof e === "string" ? [e] : _ShExUtil.errsToSimple(e)).map(s => "  " + s));
          }, []) :
          "  " + (typeof e === "string" ? [val.errors] : _ShExUtil.errsToSimple(val.errors));
      return ["validating " + n3ify(val.triple.object) + ":"].concat(nested);
    } else if (val.type === "RestrictionError") {
      var nested = val.errors.constructor === Array ?
          val.errors.reduce((ret, e) => {
            return ret.concat((typeof e === "string" ? [e] : _ShExUtil.errsToSimple(e)).map(s => "  " + s));
          }, []) :
          "  " + (typeof e === "string" ? [val.errors] : _ShExUtil.errsToSimple(val.errors));
      return ["validating restrictions on " + n3ify(val.focus) + ":"].concat(nested);
    } else if (val.type === "ShapeAndFailure") {
      return Array.isArray(val.errors) ?
          val.errors.reduce((ret, e) => {
            return ret.concat((typeof e === "string" ? [e] : _ShExUtil.errsToSimple(e)).map(s => "  " + s));
          }, []) :
          "  " + (typeof e === "string" ? [val.errors] : _ShExUtil.errsToSimple(val.errors));
    } else if (val.type === "ShapeOrFailure") {
      return Array.isArray(val.errors) ?
          val.errors.reduce((ret, e) => {
            return ret.concat(" OR " + (typeof e === "string" ? [e] : _ShExUtil.errsToSimple(e)));
          }, []) :
          " OR " + (typeof e === "string" ? [val.errors] : _ShExUtil.errsToSimple(val.errors));
    } else if (val.type === "ShapeNotFailure") {
      return ["Node " + val.errors.node + " expected to NOT pass " + val.errors.shape];
    } else if (val.type === "ExcessTripleViolation") {
      return ["validating " + n3ify(val.triple.object) + ": exceeds cardinality"];
    } else if (val.type === "ClosedShapeViolation") {
      return ["Unexpected triple(s): {"].concat(
        val.unexpectedTriples.map(t => {
          return "  " + t.subject + " " + t.predicate + " " + n3ify(t.object) + " ."
        })
      ).concat(["}"]);
    } else if (val.type === "NodeConstraintViolation") {
      const w = __webpack_require__(95)();
      w._write(w._writeNodeConstraint(val.shapeExpr).join(""));
      let txt;
      w.end((err, res) => {
        txt = res;
      });
      return ["NodeConstraintError: expected to match " + txt];
    } else if (val.type === "MissingProperty") {
      return ["Missing property: " + val.property];
    } else if (val.type === "NegatedProperty") {
      return ["Unexpected property: " + val.property];
    } else if (val.type === "AbstractShapeFailure") {
      return ["Abstract Shape: " + val.shape];
    } else if (Array.isArray(val)) {
      return val.reduce((ret, e) => {
        const nested = _ShExUtil.errsToSimple(e).map(s => "  " + s);
        return ret.length ? ret.concat(["AND"]).concat(nested) : nested;
      }, []);
    } else if (val.type === "SemActFailure") {
      const nested = Array.isArray(val.errors) ?
          val.errors.reduce((ret, e) => {
            return ret.concat((typeof e === "string" ? [e] : _ShExUtil.errsToSimple(e)).map(s => "  " + s));
          }, []) :
          "  " + (typeof e === "string" ? [val.errors] : _ShExUtil.errsToSimple(val.errors));
      return ["rejected by semantic action:"].concat(nested);
    } else if (val.type === "SemActViolation") {
      return [val.message];
    } else if (val.type === "BooleanSemActFailure") {
      return ["Failed evaluating " + val.code + " on context " + JSON.stringify(val.ctx)];
    } else {
      debugger; // console.log(val);
      throw Error("unknown shapeExpression type \"" + val.type + "\" in " + JSON.stringify(val));
    }
    function errorList (errors) {
      return errors.reduce(function (acc, e) {
        const attrs = Object.keys(e);
        return acc.concat(
          (attrs.length === 1 && attrs[0] === "errors")
            ? errorList(e.errors)
            : e);
      }, []);
    }
  },

  resolveRelativeIRI: ShExTerm.resolveRelativeIRI,

  resolvePrefixedIRI: function (prefixedIri, prefixes) {
    const colon = prefixedIri.indexOf(":");
    if (colon === -1)
      return null;
    const prefix = prefixes[prefixedIri.substr(0, colon)];
    return prefix === undefined ? null : prefix + prefixedIri.substr(colon+1);
  },

  parsePassedNode: function (passedValue, meta, deflt, known, reportUnknown) {
    if (passedValue === undefined || passedValue.length === 0)
      return known && known(meta.base) ? meta.base : deflt ? deflt() : this.NotSupplied;
    if (passedValue[0] === "_" && passedValue[1] === ":")
      return passedValue;
    if (passedValue[0] === "\"") {
      const m = passedValue.match(/^"((?:[^"\\]|\\")*)"(?:@(.+)|\^\^(?:<(.*)>|([^:]*):(.*)))?$/);
      if (!m)
        throw Error("malformed literal: " + passedValue);
      const lex = m[1], lang = m[2], rel = m[3], pre = m[4], local = m[5];
      // Turn the literal into an N3.js atom.
      const quoted = "\""+lex+"\"";
      if (lang !== undefined)
        return quoted + "@" + lang;
      if (pre !== undefined) {
        if (!(pre in meta.prefixes))
          throw Error("error parsing node "+passedValue+" no prefix for \"" + pre + "\"");
        return quoted + "^^" + meta.prefixes[pre] + local;
      }
      if (rel !== undefined)
        return quoted + "^^" + ShExTerm.resolveRelativeIRI(meta.base, rel);
      return quoted;
    }
    if (!meta)
      return known(passedValue) ? passedValue : this.UnknownIRI;
    const relIRI = passedValue[0] === "<" && passedValue[passedValue.length-1] === ">";
    if (relIRI)
      passedValue = passedValue.substr(1, passedValue.length-2);
    const t = ShExTerm.resolveRelativeIRI(meta.base || "", passedValue); // fall back to base-less mode
    if (known(t))
      return t;
    if (!relIRI) {
      const t2 = this.resolvePrefixedIRI(passedValue, meta.prefixes);
      if (t2 !== null && known(t2))
        return t2;
    }
    return reportUnknown ? reportUnknown(t) : this.UnknownIRI;
  },

  executeQueryPromise: function (query, endpoint) {
    let rows;

    const queryURL = endpoint + "?query=" + encodeURIComponent(query);
    return fetch(queryURL, {
      headers: {
        'Accept': 'application/sparql-results+json'
      }}).then(resp => resp.json()).then(jsonObject => {
        return this.parseSparqlJsonResults(jsonObject);
      })// .then(x => new Promise(resolve => setTimeout(() => resolve(x), 1000)));
  },

  executeQuery: function (query, endpoint) {
    let rows;
    const queryURL = endpoint + "?query=" + encodeURIComponent(query);
    const xhr = new XMLHttpRequest();
    xhr.open("GET", queryURL, false);
    xhr.setRequestHeader('Accept', 'application/sparql-results+json');
    xhr.send();
    // const selectsBlock = query.match(/SELECT\s*(.*?)\s*{/)[1];
    // const selects = selectsBlock.match(/\?[^\s?]+/g);
    const jsonObject = JSON.parse(xhr.responseText);
    return this.parseSparqlJsonResults(jsonObject);
  },

  parseSparqlJsonResults: function (jsonObject) {
    const selects = jsonObject.head.vars;
    return jsonObject.results.bindings.map(row => {
      // spec: https://www.w3.org/TR/rdf-sparql-json-res/#variable-binding-results
      return selects.map(sel => {
        const elt = row[sel];
        switch (elt.type) {
        case "uri": return elt.value;
        case "bnode": return "_:" + elt.value;
        case "literal":
          return "\"" + elt.value.replace(/"/g, '\\""') + "\""
            + ("xml:lang" in elt ? "@" + elt["xml:lang"] : "")
            + ("datatype" in elt ? "^^" + elt.datatype : "");
        case "typed-literal": // encountered in wikidata query service
          return "\"" + elt.value.replace(/"/g, '\\""') + "\""
            + ("^^" + elt.datatype);
        default: throw "unknown XML results type: " + elt.type;
        }
      })
    });
  },

/* TO ADD? XML results format parsed with jquery:
  // parse..._dom(new window.DOMParser().parseFromString(str, "text/xml"));

  parseSparqlXmlResults_dom: function (doc) {
    Array.from(X.querySelectorAll('sparql > results > result')).map(row => {
      Array.from(row.querySelectorAll("binding")).map(elt => {
        const typed = Array.from(elt.children)[0];
        const text = typed.textContent;

        switch (elt.tagName) {
        case "uri": return text;
        case "bnode": return "_:" + text;
        case "literal":
          const datatype = typed.getAttribute("datatype");
          const lang = typed.getAttribute("xml:lang");
          return "\"" + text + "\"" + (
            datatype ? "^^" + datatype :
            lang ? "@" + lang :
              "");
        default: throw "unknown XML results type: " + elt.tagName;
        }
      })
    })
  },

  parseSparqlXmlResults_jquery: function (jqObj) {
    $(jqObj).find("sparql > results > result").
      each((_, row) => {
        rows.push($(row).find("binding > *:nth-child(1)").
          map((idx, elt) => {
            elt = $(elt);
            const text = elt.text();

            switch (elt.prop("tagName")) {
            case "uri": return text;
            case "bnode": return "_:" + text;
            case "literal":
              const datatype = elt.attr("datatype");
              const lang = elt.attr("xml:lang");
              return "\"" + text + "\"" + (
                datatype ? "^^" + datatype :
                lang ? "@" + lang :
                  "");
            default: throw "unknown XML results type: " + elt.prop("tagName");
            }
          }).get());
      });
  }
*/

  rdfjsDB: function (db /*:typeof N3Store*/, queryTracker /*:QueryTracker*/) {

    function getSubjects () { return db.getSubjects().map(ShExTerm.internalTerm); }
    function getPredicates () { return db.getPredicates().map(ShExTerm.internalTerm); }
    function getObjects () { return db.getObjects().map(ShExTerm.internalTerm); }
    function getQuads ()/*: Quad[]*/ { return db.getQuads.apply(db, arguments).map(ShExTerm.internalTriple); }

    function getNeighborhood (point/*: string*/, shapeLabel/*: string*//*, shape */) {
      // I'm guessing a local DB doesn't benefit from shape optimization.
      let startTime;
      if (queryTracker) {
        startTime = new Date();
        queryTracker.start(false, point, shapeLabel);
      }
      const outgoing/*: Quad[]*/ = db.getQuads(point, null, null, null).map(ShExTerm.internalTriple);
      if (queryTracker) {
        const time = new Date();
        queryTracker.end(outgoing, time.valueOf() - startTime.valueOf());
        startTime = time;
      }
      if (queryTracker) {
        queryTracker.start(true, point, shapeLabel);
      }
      const incoming/*: Quad[]*/ = db.getQuads(null, null, point, null).map(ShExTerm.internalTriple);
      if (queryTracker) {
        queryTracker.end(incoming, new Date().valueOf() - startTime.valueOf());
      }
      return {
        outgoing: outgoing,
        incoming: incoming
      };
    }

    return {
      // size: db.size,
      getNeighborhood: getNeighborhood,
      getSubjects: getSubjects,
      getPredicates: getPredicates,
      getObjects: getObjects,
      getQuads: getQuads,
      get size() { return db.size; },
      // getQuads: function (s, p, o, graph, shapeLabel) {
      //   // console.log(Error(s + p + o).stack)
      //   if (queryTracker)
      //     queryTracker.start(!!s, s ? s : o, shapeLabel);
      //   const quads = db.getQuads(s, p, o, graph)
      //   if (queryTracker)
      //     queryTracker.end(quads, new Date() - startTime);
      //   return quads;
      // }
    }
  },

  /** Directly construct a DB from triples.
   */
  makeTriplesDB: function (queryTracker) {
    var _ShExUtil = this;
    var incoming = [];
    var outgoing = [];

    function getTriplesByIRI(s, p, o, g) {
      return incoming.concat(outgoing).filter(
        t =>
          (!s || s === t.subject) &&
          (!p || p === t.predicate) &&
          (!s || s === t.object)
      );
    }

    function getNeighborhood (point, shapeLabel, shape) {
      return {
        outgoing: outgoing,
        incoming: incoming
      };
    }

    return {
      getNeighborhood: getNeighborhood,
      getTriplesByIRI: getTriplesByIRI,
      getSubjects: function () { return ["!Triples DB can't index subjects"] },
      getPredicates: function () { return ["!Triples DB can't index predicates"] },
      getObjects: function () { return ["!Triples DB can't index objects"] },
      get size() { return undefined; },
      addIncomingTriples: function (tz) { Array.prototype.push.apply(incoming, tz); },
      addOutgoingTriples: function (tz) { Array.prototype.push.apply(outgoing, tz); }
    };
  },

  NotSupplied: "-- not supplied --", UnknownIRI: "-- not found --",

  /**
   * unescape numerics and allowed single-character escapes.
   * throws: if there are any unallowed sequences
   */
  unescapeText: function (string, replacements) {
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
  },

};

function n3ify (ldterm) {
  if (typeof ldterm !== "object")
    return ldterm;
  const ret = "\"" + ldterm.value + "\"";
  if ("language" in ldterm)
    return ret + "@" + ldterm.language;
  if ("type" in ldterm)
    return ret + "^^" + ldterm.type;
  return ret;
}

// Add the ShExUtil functions to the given object or its prototype
function AddShExUtil(parent, toPrototype) {
  for (let name in ShExUtil)
    if (!toPrototype)
      parent[name] = ShExUtil[name];
    else
      parent.prototype[name] = ApplyToThis(ShExUtil[name]);

  return parent;
}

// Returns a function that applies `f` to the `this` object
function ApplyToThis(f) {
  return function (a) { return f(this, a); };
}

return AddShExUtil(AddShExUtil);
})();

if (true)
  module.exports = ShExUtilCjsModule; // node environment


/***/ }),

/***/ 457:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* ShExValidator - javascript module to validate a graph with respect to Shape Expressions
 *
 * Status: 1/2 tested, no known bugs.
 *
 * TODO:
 *   constraint violation reporting.
 */

const ShExValidatorCjsModule = (function () {
const UNBOUNDED = -1;

// interface constants
const Start = { term: "START" }
const InterfaceOptions = {
  "coverage": {
    "firstError": "fail on first error (usually used with eval-simple-1err)",
    "exhaustive": "find as many errors as possible (usually used with eval-threaded-nerr)"
  }
};

const VERBOSE = false; // "VERBOSE" in process.env;
// **ShExValidator** provides ShEx utility functions

const ProgramFlowError = { type: "ProgramFlowError", errors: [{ type: "UntrackedError" }] };

const ShExTerm = __webpack_require__(118);
let ShExVisitor = __webpack_require__(806);
let ShExUtil = __webpack_require__(443);
const Hierarchy = __webpack_require__(515)

function getLexicalValue (term) {
  return ShExTerm.isIRI(term) ? term :
    ShExTerm.isLiteral(term) ? ShExTerm.getLiteralValue(term) :
    term.substr(2); // bnodes start with "_:"
}


const XSD = "http://www.w3.org/2001/XMLSchema#";
const integerDatatypes = [
  XSD + "integer",
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

const decimalDatatypes = [
  XSD + "decimal",
].concat(integerDatatypes);

const numericDatatypes = [
  XSD + "float",
  XSD + "double"
].concat(decimalDatatypes);

const numericParsers = {};
numericParsers[XSD + "integer"] = function (label, parseError) {
  if (!(label.match(/^[+-]?[0-9]+$/))) {
    parseError("illegal integer value '" + label + "'");
  }
  return parseInt(label);
};
numericParsers[XSD + "decimal"] = function (label, parseError) {
  if (!(label.match(/^[+-]?(?:[0-9]*\.[0-9]+|[0-9]+)$/))) { // XSD has no pattern for decimal?
    parseError("illegal decimal value '" + label + "'");
  }
  return parseFloat(label);
};
const DECIMAL_REGEX = /^[+\-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+\-]?[0-9]+)?$/;
numericParsers[XSD + "float"  ] = function (label, parseError) {
  if (label === "NaN") return NaN;
  if (label === "INF") return Infinity;
  if (label === "-INF") return -Infinity;
  if (!(label.match(DECIMAL_REGEX))) { // XSD has no pattern for float?
    parseError("illegal float value '" + label + "'");
  }
  return parseFloat(label);
};
numericParsers[XSD + "double" ] = function (label, parseError) {
  if (label === "NaN") return NaN;
  if (label === "INF") return Infinity;
  if (label === "-INF") return -Infinity;
  if (!(label.match(DECIMAL_REGEX))) {
    parseError("illegal double value '" + label + "'");
  }
  return Number(label);
};

function testRange (value, datatype, parseError) {
  const ranges = {
    //    integer            -1 0 1 +1 | "" -1.0 +1.0 1e0 NaN INF
    //    decimal            -1 0 1 +1 -1.0 +1.0 | "" 1e0 NaN INF
    //    float              -1 0 1 +1 -1.0 +1.0 1e0 1E0 NaN INF -INF | "" +INF
    //    double             -1 0 1 +1 -1.0 +1.0 1e0 1E0 NaN INF -INF | "" +INF
    //    nonPositiveInteger -1 0 +0 -0 | 1 +1 1a a1
    //    negativeInteger    -1 | 0 +0 -0 1
    //    long               -1 0 1 +1 |
    //    int                -1 0 1 +1 |
    //    short              -32768 0 32767 | -32769 32768
    //    byte               -128 0 127 | "" -129 128
    //    nonNegativeInteger 0 -0 +0 1 +1 | -1
    //    unsignedLong       0 1 | -1
    //    unsignedInt        0 1 | -1
    //    unsignedShort      0 65535 | -1 65536
    //    unsignedByte       0 255 | -1 256
    //    positiveInteger    1 | -1 0
    //    string             "" "a" "0"
    //    boolean            true false 0 1 | "" TRUE FALSE tRuE fAlSe -1 2 10 01
    //    dateTime           "2012-01-02T12:34:56.78Z" | "" "2012-01-02T" "2012-01-02"
    integer:            { min: -Infinity           , max: Infinity },
    decimal:            { min: -Infinity           , max: Infinity },
    float:              { min: -Infinity           , max: Infinity },
    double:             { min: -Infinity           , max: Infinity },
    nonPositiveInteger: { min: -Infinity           , max: 0        },
    negativeInteger:    { min: -Infinity           , max: -1       },
    long:               { min: -9223372036854775808, max: 9223372036854775807 },
    int:                { min: -2147483648         , max: 2147483647 },
    short:              { min: -32768              , max: 32767    },
    byte:               { min: -128                , max: 127      },
    nonNegativeInteger: { min: 0                   , max: Infinity },
    unsignedLong:       { min: 0                   , max: 18446744073709551615 },
    unsignedInt:        { min: 0                   , max: 4294967295 },
    unsignedShort:      { min: 0                   , max: 65535    },
    unsignedByte:       { min: 0                   , max: 255      },
    positiveInteger:    { min: 1                   , max: Infinity }
  }
  const parms = ranges[datatype.substr(XSD.length)];
  if (!parms) throw Error("unexpected datatype: " + datatype);
  if (value < parms.min) {
    parseError("\"" + value + "\"^^<" + datatype + "> is less than the min:", parms.min);
  } else if (value > parms.max) {
    parseError("\"" + value + "\"^^<" + datatype + "> is greater than the max:", parms.min);
  }
};

/*
function intSubType (spec, label, parseError) {
  const ret = numericParsers[XSD + "integer"](label, parseError);
  if ("min" in spec && ret < spec.min)
    parseError("illegal " + XSD + spec.type + " value '" + label + "' should not be < " + spec.min);
  if ("max" in spec && ret > spec.max)
    parseError("illegal " + XSD + spec.type + " value '" + label + "' should not be > " + spec.max);
  return ret;
}
[{type: "nonPositiveInteger", max: 0},
 {type: "negativeInteger", max: -1},
 {type: "long", min: -9223372036854775808, max: 9223372036854775807}, // beyond IEEE double
 {type: "int", min: -2147483648, max: 2147483647},
 {type: "short", min: -32768, max: 32767},
 {type: "byte", min: -128, max: 127},
 {type: "nonNegativeInteger", min: 0},
 {type: "unsignedLong", min: 0, max: 18446744073709551615},
 {type: "unsignedInt", min: 0, max: 4294967295},
 {type: "unsignedShort", min: 0, max: 65535},
 {type: "unsignedByte", min: 0, max: 255},
 {type: "positiveInteger", min: 1}].forEach(function (i) {
   numericParsers[XSD + i.type ] = function (label, parseError) {
     return intSubType(i, label, parseError);
   };
 });
*/

const stringTests = {
  length   : function (v, l) { return v.length === l; },
  minlength: function (v, l) { return v.length  >= l; },
  maxlength: function (v, l) { return v.length  <= l; }
};

const numericValueTests = {
  mininclusive  : function (n, m) { return n >= m; },
  minexclusive  : function (n, m) { return n >  m; },
  maxinclusive  : function (n, m) { return n <= m; },
  maxexclusive  : function (n, m) { return n <  m; }
};

const decimalLexicalTests = {
  totaldigits   : function (v, d) {
    const m = v.match(/[0-9]/g);
    return m && m.length <= d;
  },
  fractiondigits: function (v, d) {
    const m = v.match(/^[+-]?[0-9]*\.?([0-9]*)$/);
    return m && m[1].length <= d;
  }
};

        function ldify (term) {
          if (term[0] !== "\"")
            return term;
          const ret = { value: ShExTerm.getLiteralValue(term) };
          const dt = ShExTerm.getLiteralType(term);
          if (dt &&
              dt !== "http://www.w3.org/2001/XMLSchema#string" &&
              dt !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString")
            ret.type = dt;
          const lang = ShExTerm.getLiteralLanguage(term)
          if (lang)
            ret.language = lang;
          return ret;
        }

    function isTerm (t) {
      return typeof t !== "object" || "value" in t && Object.keys(t).reduce((r, k) => {
        return r === false ? r : ["value", "type", "language"].indexOf(k) !== -1;
      }, true);
    }

/* ShExValidator_constructor - construct an object for validating a schema.
 *
 * schema: a structure produced by a ShEx parser or equivalent.
 * options: object with controls for
 *   lax(true): boolean: whine about missing types in schema.
 *   diagnose(false): boolean: makde validate return a structure with errors.
 */
function ShExValidator_constructor(schema, db, options) {
  if (!(this instanceof ShExValidator_constructor))
    return new ShExValidator_constructor(schema, db, options);
  let index = schema._index || ShExVisitor.index(schema)
  this.type = "ShExValidator";
  options = options || {};
  this.options = options;
  this.options.coverage = this.options.coverage || "exhaustive";
  if (!("noCache" in options && options.noCache))
    this.known = {};

  const _ShExValidator = this;
  this.schema = schema;
  this._expect = this.options.lax ? noop : expect; // report errors on missing types.
  this._optimize = {}; // optimizations:
    // hasRepeatedGroups: whether there are patterns like (:p1 ., :p2 .)*
  this.reset = function () {  }; // included in case we need it later.
  // const regexModule = this.options.regexModule || require("@shexjs/eval-simple-1err");
  const regexModule = this.options.regexModule || __webpack_require__(237);

  /* indexTripleConstraints - compile regular expression and index triple constraints
   */
  this.indexTripleConstraints = function (expression) {
    // list of triple constraints from (:p1 ., (:p2 . | :p3 .))
    const tripleConstraints = [];

    if (expression)
      indexTripleConstraints_dive(expression);
    return tripleConstraints;

    function indexTripleConstraints_dive (expr) {
      if (typeof expr === "string") // Inclusion
        return indexTripleConstraints_dive(index.tripleExprs[expr]);

      else if (expr.type === "TripleConstraint") {
        tripleConstraints.push(expr);
        return [tripleConstraints.length - 1]; // index of expr
      }

      else if (expr.type === "OneOf" || expr.type === "EachOf")
        return expr.expressions.reduce(function (acc, nested) {
          return acc.concat(indexTripleConstraints_dive(nested));
        }, []);

      else
        return runtimeError("unexpected expr type: " + expr.type);
    };
  };

  /* emptyTracker - a tracker that does nothing
   */
  this.emptyTracker = function () {
    const noop = x => x;
    return {
      recurse: noop,
      known: noop,
      enter: function (point, label) { ++this.depth; },
      exit: function (point, label, ret) { --this.depth; },
      depth: 0
    };
  };

  /* validate - test point in db against the schema for labelOrShape
   * depth: level of recurssion; for logging.
   */
  this.validate = function (point, label, tracker, seen, subGraph) {
    // default to schema's start shape
    if (typeof point === "object" && "termType" in point) {
      point = ShExTerm.internalTerm(point)
    }
    if (typeof point === "object") {
      const shapeMap = point;
      if (this.options.results === "api") {
        return shapeMap.map(pair => {
          let time = new Date();
          const res = this.validate(pair.node, pair.shape, label, tracker); // really tracker and seen
          time = new Date() - time;
          return {
            node: pair.node,
            shape: pair.shape,
            status: "errors" in res ? "nonconformant" : "conformant",
            appinfo: res,
            elapsed: time
          };
        });
      }
      const results = shapeMap.reduce((ret, pair) => {
        const res = this.validate(pair.node, pair.shape, label, tracker, subGraph); // really tracker and seen
        return "errors" in res ?
          { passes: ret.passes, failures: ret.failures.concat(res) } :
          { passes: ret.passes.concat(res), failures: ret.failures } ;
      }, {passes: [], failures: []});
      if (false) { var _add; }
      if (results.failures.length > 0) {
        return results.failures.length !== 1 ?
          { type: "FailureList", errors: results.failures } :
          results.failures [0];
      } else {
        return results.passes.length !== 1 ?
          { type: "SolutionList", solutions: results.passes } :
          results.passes [0];
      }
    }

    const outside = tracker === undefined;
    // logging stuff
    if (!tracker)
      tracker = this.emptyTracker();
    if (!label || label === Start) {
      if (!schema.start)
        runtimeError("start production not defined");
    }

    let shape = null;
    if (label == Start) {
      shape = schema.start;
    } else if (!("shapes" in this.schema) || this.schema.shapes.length === 0) {
      runtimeError("shape " + label + " not found; no shapes in schema");
    } else if (label in index.shapeExprs) {
      shape = index.shapeExprs[label]
    } else {
      runtimeError("shape " + label + " not found in:\n" + Object.keys(index.shapeExprs || []).map(s => "  " + s).join("\n"));
    }

    // if we passed in an expression rather than a label, validate it directly.
    if (typeof label !== "string")
      return this._validateShapeDecl(point, shape, Start, 0, tracker, seen);

    if (seen === undefined)
      seen = {};
    const seenKey = point + "@" + (label === Start ? "_: -start-" : label);
    if (!subGraph) { // Don't cache base shape validations as they aren't testing the full neighborhood.
      if (seenKey in seen)
        return tracker.recurse({
          type: "Recursion",
          node: ldify(point),
          shape: label
        });
      if ("known" in this && seenKey in this.known)
        return tracker.known(this.known[seenKey]);
      seen[seenKey] = { point: point, shape: label };
      tracker.enter(point, label);
    }
    const ret = this._validateDescendants(point, label, 0, tracker, seen, subGraph);
    if (!subGraph) {
      tracker.exit(point, label, ret);
      delete seen[seenKey];
      if ("known" in this)
        this.known[seenKey] = ret;
    }
    if ("startActs" in schema && outside) {
      ret.startActs = schema.startActs;
    }
    return ret;
  }

  this._validateDescendants = function (point, shapeLabel, depth, tracker, seen, subGraph, allowAbstract) {
    if (subGraph) // Shape inference doesn't apply when validating base shapes.
      return this._validateShapeDecl(point, index.shapeExprs[shapeLabel], shapeLabel, 0, tracker, seen, subGraph);

    // Find all non-abstract shapeExprs extended with label. 
    let candidates = [shapeLabel];
    candidates = candidates.concat(indexExtensions(this.schema)[shapeLabel] || []);
    // Uniquify list.
    for (let i = candidates.length - 1; i >= 0; --i) {
      if (candidates.indexOf(candidates[i]) < i)
        candidates.splice(i, 1);
    }
    // Filter out abstract shapes.
    if (!allowAbstract)
      candidates = candidates.filter(l => !index.shapeExprs[l].abstract);

    // Aggregate results in a SolutionList or FailureList.
    const results = candidates.reduce((ret, candidateShapeLabel) => {
      const shapeExpr = index.shapeExprs[candidateShapeLabel];
      const res = this._validateShapeDecl(point, shapeExpr, candidateShapeLabel, 0, tracker, seen, subGraph);
      return "errors" in res ?
        { passes: ret.passes, failures: ret.failures.concat(res) } :
        { passes: ret.passes.concat(res), failures: ret.failures } ;

    }, {passes: [], failures: []});
    let ret;
    if (results.passes.length > 0) {
      ret = results.passes.length !== 1 ?
        { type: "SolutionList", solutions: results.passes } :
      results.passes [0];
    } else if (results.failures.length > 0) {
      ret = results.failures.length !== 1 ?
        { type: "FailureList", errors: results.failures } :
      results.failures [0];
    } else {
      ret = {
        type: "AbstractShapeFailure",
        shape: shapeLabel,
        errors: shapeLabel + " has no non-abstract children"
      };
    }
    return ret;

    // @TODO move to Vistior.index
    function indexExtensions (schema) {
      const abstractness = {};
      const extensions = Hierarchy.create();
      makeSchemaVisitor().visitSchema(schema);
      return extensions.children;

      function makeSchemaVisitor (schema) {
        const schemaVisitor = ShExUtil.Visitor();
        let curLabel;
        let curAbstract;
        const oldVisitShapeDecl = schemaVisitor.visitShapeDecl;
        schemaVisitor.visitShapeDecl = function (decl) {
          curLabel = decl.id;
          curAbstract = decl.abstract;
          abstractness[decl.id] = decl.abstract;
          return oldVisitShapeDecl.call(schemaVisitor, decl, decl.id);
        };
        const oldVisitShape = schemaVisitor.visitShape;
        schemaVisitor.visitShape = function (shape) {
          if ("extends" in shape) {
            shape.extends.forEach(ext => {
              const extendsVisitor = ShExUtil.Visitor();
              extendsVisitor.visitShapeRef = function (parent) {
                extensions.add(parent, curLabel);
                // makeSchemaVisitor().visitSchema(schema);
                return "null";
              };
              extendsVisitor.visitShapeExpr(ext);
            })
          }
          return "null";
        };
        return schemaVisitor;
      }
    }
  }

  this._validateShapeDecl = function (point, shapeExpr, shapeLabel, depth, tracker, seen, subgraph) {
    const expr = shapeExpr.type === "ShapeDecl" ? shapeExpr.shapeExpr : shapeExpr;
    return this._validateShapeExpr(point, expr, shapeLabel, depth, tracker, seen, subgraph);
  }

  this._validateShapeExpr = function (point, shapeExpr, shapeLabel, depth, tracker, seen, subgraph) {
    if (point === "")
      throw Error("validation needs a valid focus node");
    let ret = null
    if (typeof shapeExpr === "string") { // ShapeRef
      // ret = this._validateShapeDecl(point, schema._index.shapeExprs[shapeExpr], shapeExpr, depth, tracker, seen, subgraph);
      ret = this._validateDescendants(point, shapeExpr, depth, tracker, seen, subgraph, true);
    } else if (shapeExpr.type === "NodeConstraint") {
      const sub = this._errorsMatchingNodeConstraint(point, shapeExpr, null);
      ret = sub.errors && sub.errors.length ? { // @@ when are both conditionals needed?
        type: "Failure",
        node: ldify(point),
        shape: shapeLabel,
        errors: sub.errors.map(function (error) { // !!! just sub.errors?
          return {
            type: "NodeConstraintViolation",
            shapeExpr: shapeExpr,
            error: error
          };
        })
      } : {
        type: "NodeConstraintTest",
        node: ldify(point),
        shape: shapeLabel,
        shapeExpr: shapeExpr
      };
    } else if (shapeExpr.type === "Shape") {
      ret = this._validateShape(point, shapeExpr, shapeLabel, depth, tracker, seen, subgraph);
    } else if (shapeExpr.type === "ShapeExternal") {
      ret = this.options.validateExtern(point, shapeLabel, tracker, seen);
    } else if (shapeExpr.type === "ShapeOr") {
      const errors = [];
      for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        const nested = shapeExpr.shapeExprs[i];
        const sub = this._validateShapeExpr(point, nested, shapeLabel, depth, tracker, seen, subgraph);
        if ("errors" in sub)
          errors.push(sub);
        else
          return { type: "ShapeOrResults", solution: sub };
      }
      ret = { type: "ShapeOrFailure", errors: errors };
    } else if (shapeExpr.type === "ShapeNot") {
      const sub = this._validateShapeExpr(point, shapeExpr.shapeExpr, shapeLabel, depth, tracker, seen, subgraph);
      if ("errors" in sub)
          ret = { type: "ShapeNotResults", solution: sub };
        else
          ret = { type: "ShapeNotFailure", errors: sub };
    } else if (shapeExpr.type === "ShapeAnd") {
      const passes = [];
      const errors = [];
      for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        const nested = shapeExpr.shapeExprs[i];
        const sub = this._validateShapeExpr(point, nested, shapeLabel, depth, tracker, seen, subgraph);
        if ("errors" in sub)
          errors.push(sub);
        else
          passes.push(sub);
      }
      if (errors.length > 0)
        ret = { type: "ShapeAndFailure", errors: errors };
      else
        ret = { type: "ShapeAndResults", solutions: passes };
    } else {
      throw Error("expected one of Shape{Ref,And,Or} or NodeConstraint, got " + JSON.stringify(shapeExpr));
    }

    if (typeof shapeExpr !== "string" // ShapeRefs are haneled in the referent.
        &&  shapeExpr.type !== "Shape" // Shapes are handled in the try-everything loop.
        && !("errors" in ret) && "semActs" in shapeExpr) {
      const semActErrors = this.semActHandler.dispatchAll(shapeExpr.semActs, Object.assign({node: point}, ret), ret)
      if (semActErrors.length)
        // some semAct aborted
        return { type: "Failure", node: ldify(point), shape: shapeLabel, errors: semActErrors};
    }
    return ret;
  }

  this._validateShape = function (point, shape, shapeLabel, depth, tracker, seen, subgraph) {
    const _ShExValidator = this;
    const valParms = { db, shapeLabel, depth, tracker, seen };

    let ret = null;
    const startAcionStorage = {}; // !!! need test to see this write to results structure.
    if ("startActs" in schema) {
      const semActErrors = this.semActHandler.dispatchAll(schema.startActs, null, startAcionStorage)
      if (semActErrors.length)
        return {
          type: "Failure",
          node: ldify(point),
          shape: shapeLabel,
          errors: semActErrors
        }; // some semAct aborted !! return a better error
    }

    const fromDB  = (subgraph || db).getNeighborhood(point, shapeLabel, shape);
    const outgoingLength = fromDB.outgoing.length;
    const neighborhood = fromDB.outgoing.sort(
      (l, r) => l.predicate.localeCompare(r.predicate) || sparqlOrder(l.object, r.object)
    ).concat(fromDB.incoming.sort(
      (l, r) => l.predicate.localeCompare(r.predicate) || sparqlOrder(l.object, r.object)
    ));

    const localTCs = this.indexTripleConstraints(shape.expression);
    const extendedTCs = getExtendedTripleConstraints(shape);
    const constraintList = extendedTCs.map(
      ext => ext.tripleConstraint
    ).concat(localTCs);
    const tripleList = matchByPredicate(constraintList, neighborhood, outgoingLength, point, valParms);
    const {misses, extras} = whatsMissing(tripleList, neighborhood, outgoingLength, shape.extra || [])

    const xp = crossProduct(tripleList.constraintList, "NO_TRIPLE_CONSTRAINT");
    const partitionErrors = [];
    const regexEngine = regexModule.compile(schema, shape, index);
    while (xp.next() && ret === null) {
      const errors = []
      const usedTriples = []; // [{s1,p1,o1},{s2,p2,o2}] implicated triples -- used for messages
      const constraintMatchCount = // [2,1,0,1] how many triples matched a constraint
            _seq(neighborhood.length).map(function () { return 0; });

      // t2tc - array mapping neighborhood index to TripleConstraint
      const t2tcForThisShapeAndExtends = xp.get(); // [0,1,0,3] mapping from triple to constraint
      const t2tcForThisShape = []
      const tripleToExtends = []
      const extendsToTriples = _seq((shape.extends || []).length).map(() => [])
      t2tcForThisShapeAndExtends.forEach((cNo, tNo) => {
        if (cNo !== "NO_TRIPLE_CONSTRAINT" && cNo < extendedTCs.length) {
          const extNo = extendedTCs[cNo].extendsNo;
          extendsToTriples[extNo].push(neighborhood[tNo]);
          tripleToExtends[tNo] = cNo;
          t2tcForThisShape[tNo] = "NO_TRIPLE_CONSTRAINT";
        } else {
          tripleToExtends[tNo] = "NO_EXTENDS";
          t2tcForThisShape[tNo] = cNo;
        }
      });

      // Triples not mapped to triple constraints are not allowed in closed shapes.
      if (shape.closed) {
        const unexpectedTriples = neighborhood.slice(0, outgoingLength).filter((t, i) => {
          return t2tcForThisShape[i] === "NO_TRIPLE_CONSTRAINT" && // didn't match a constraint
            tripleToExtends[i] === "NO_EXTENDS" && // didn't match an EXTENDS
            extras.indexOf(i) === -1; // wasn't in EXTRAs.
        });
        if (unexpectedTriples.length > 0)
          errors.push({
            type: "ClosedShapeViolation",
            unexpectedTriples: unexpectedTriples
          });
      }

      // Set usedTriples and constraintMatchCount.
      t2tcForThisShape.forEach(function (tpNumber, ord) {
        if (tpNumber !== "NO_TRIPLE_CONSTRAINT") {
          usedTriples.push(neighborhood[ord]);
          ++constraintMatchCount[tpNumber];
        }
      });
      const tc2t = _constraintToTriples(t2tcForThisShape, constraintList, tripleList); // e.g. [[t0, t2], [t1, t3]]

      let results = testExtends(shape, point, extendsToTriples, valParms);
      if (results === null || !("errors" in results)) {
        const sub = regexEngine.match(db, point, constraintList, tc2t, t2tcForThisShape, neighborhood, this.semActHandler, null);
        if (!("errors" in sub) && results) {
          results = { type: "ExtendedResults", extensions: results };
          if (Object.keys(sub).length > 0) // no empty objects from {}s.
            results.local = sub;
        } else {
          results = sub;
        }
      }
      if ("errors" in results)
        [].push.apply(errors, results.errors);

      const possibleRet = { type: "ShapeTest", node: ldify(point), shape: shapeLabel };
      if (errors.length === 0 && Object.keys(results).length > 0) // only include .solution for non-empty pattern
        possibleRet.solution = results;
      if ("semActs" in shape) {
        const semActErrors = this.semActHandler.dispatchAll(shape.semActs, Object.assign({node: point}, results), possibleRet)
        if (semActErrors.length)
          // some semAct aborted
          [].push.apply(errors, semActErrors);
      }

      partitionErrors.push(errors)
      if (errors.length === 0)
        ret = possibleRet
    }
    // end of while(xp.next())

    const missErrors = misses.map(function (miss) {
      const t = neighborhood[miss.tripleNo];
      return {
        type: "TypeMismatch",
        triple: {type: "TestedTriple", subject: t.subject, predicate: t.predicate, object: ldify(t.object)},
        constraint: constraintList[miss.constraintNo],
        errors: miss.errors
      };
    });

    // Report only last errors until we have a better idea.
    const lastErrors = partitionErrors[partitionErrors.length - 1];
    let errors = missErrors.concat(lastErrors.length === 1 ? lastErrors[0] : lastErrors);
    if (errors.length > 0)
      ret = {
        type: "Failure",
        node: ldify(point),
        shape: shapeLabel,
        errors: errors
      };

    // remove N3jsTripleToString
    if (VERBOSE)
      neighborhood.forEach(function (t) {
        delete t.toString;
      });

    return addShapeAttributes(shape, ret);
  };

  function matchByPredicate (constraintList, neighborhood, outgoingLength, point, valParms) {
    const outgoing = indexNeighborhood(neighborhood.slice(0, outgoingLength));
    const incoming = indexNeighborhood(neighborhood.slice(outgoingLength));
    return constraintList.reduce(function (ret, constraint, cNo) {

      // subject and object depend on direction of constraint.
      const searchSubject = constraint.inverse ? null : point;
      const searchObject = constraint.inverse ? point : null;
      const index = constraint.inverse ? incoming : outgoing;

      // get triples matching predciate
      const matchPredicate = index.byPredicate[constraint.predicate] ||
            []; // empty list when no triple matches that constraint

      // strip to triples matching value constraints (apart from @<someShape>)
      const matchConstraints = _ShExValidator._triplesMatchingShapeExpr(
        matchPredicate, constraint, valParms
      );

      matchConstraints.hits.forEach(function (evidence) {
        const tNo = neighborhood.indexOf(evidence.triple);
        ret.constraintList[tNo].push(cNo);
        ret.results[cNo][tNo] = evidence.sub;
      });
      matchConstraints.misses.forEach(function (evidence) {
        const tNo = neighborhood.indexOf(evidence.triple);
        ret.misses[tNo] = {constraintNo: cNo, errors: evidence.errors};
      });
      return ret;
    }, { misses: {}, results: _alist(constraintList.length), constraintList:_alist(neighborhood.length) })
  }

  function whatsMissing (tripleList, neighborhood, outgoingLength, extras) {
    const matchedExtras = []; // triples accounted for by EXTRA
    const misses = tripleList.constraintList.reduce(function (ret, constraints, ord) {
      if (constraints.length === 0 &&   // matches no constraints
          ord < outgoingLength &&       // not an incoming triple
          ord in tripleList.misses) {   // predicate matched some constraint(s)
        if (extras.indexOf(neighborhood[ord].predicate) !== -1) {
          matchedExtras.push(ord);
        } else {                        // not declared extra
          ret.push({                    // so it's a missed triple.
            tripleNo: ord,
            constraintNo: tripleList.misses[ord].constraintNo,
            errors: tripleList.misses[ord].errors
          });
        }
      }
      return ret;
    }, []);
    return {misses, extras: matchedExtras}
  }

  function addShapeAttributes (shape, ret) {
    if ("annotations" in shape)
      ret.annotations = shape.annotations;
    return ret;
  }

  // Pivot to triples by constraint.
  function _constraintToTriples (t2tc, constraintList, tripleList) {
    return t2tc.slice().
      reduce(function (ret, cNo, tNo) {
        if (cNo !== "NO_TRIPLE_CONSTRAINT")
          ret[cNo].push({tNo: tNo, res: tripleList.results[cNo][tNo]});
        return ret;
      }, _seq(constraintList.length).map(() => [])); // [length][]
  }

  function testExtends (expr, point, extendsToTriples, valParms) {
    if (!("extends" in expr))
      return null;
    const passes = [];
    const errors = [];
    for (let eNo = 0; eNo < expr.extends.length; ++eNo) {
      const extend = expr.extends[eNo];
      const subgraph = ShExUtil.makeTriplesDB(null); // These triples were tracked earlier.
      extendsToTriples[eNo].forEach(t => subgraph.addOutgoingTriples([t]));
      const sub = _ShExValidator.validate(point, extend, valParms.tracker, valParms.seen, subgraph)
      if ("errors" in sub)
        errors.push(sub);
      else
        passes.push(sub);
    }
    if (errors.length > 0) {
      return { type: "ExtensionFailure", errors: errors };
    }
    return { type: "ExtensionResults", solutions: passes };
  }

  /** getExtendedTripleConstraints - walk shape's extends to get all
   * referenced triple constraints.
   *
   * @param {} shape
   * @returns {}
   */
  function getExtendedTripleConstraints (shape) {
    const ret = []
    if ("extends" in shape) {
      shape.extends.forEach((se, extendsNo) => {
        // Index incoming and outgoing arcs by predicate.  Multiple TCs with the
        // same predicate are aggregated into a single TC with the maximum
        // cardinality span. (@@Does this actually reduce permutations?)
        // tests: Extend3G-pass
        const ins = {}, outs = {};
        visitTripleConstraints(se, ins, outs);

        [ins, outs].forEach(directionIndex => {
          Object.keys(directionIndex).forEach(predicate => {
            let tripleConstraint = directionIndex[predicate]
            ret.push({tripleConstraint, extendsNo});
          });
        });
      })
    }
    return ret;

    /*
     * @expr - shape expression to walk
     * @ins - incoming arcs: map from IRI to {min, max, seen}
     * @outs - outgoing arcs
     */
    function visitTripleConstraints (expr, ins, outs) {
      const visitor = ShExUtil.Visitor();
      let outerMin = 1;
      let outerMax = 1;
      const oldVisitOneOf = visitor.visitOneOf;

      // Override visitShapeRef to follow references.
      // tests: Extend3G-pass, vitals-RESTRICTS-pass_lie-Vital...
      visitor.visitShapeRef = function (inclusion) {
        return visitor.visitShapeDecl(index.shapeExprs[inclusion]);
      };

      // Visit shape's EXTENDS and expression.
      visitor.visitShape = function (shape, label) {
        if ("extends" in shape) {
          shape.extends.forEach( // extension of an extension...
            se => visitTripleConstraints(se, ins, outs)
          )
        }
        if ("expression" in shape) {
          visitor.visitExpression(shape.expression);
        }
        return { type: "Shape" }; // NOP
      }

      // Any TC inside a OneOf implicitly has a min cardinality of 0.
      visitor.visitOneOf = function (expr) {
        const oldOuterMin = outerMin;
        const oldOuterMax = outerMax;
        outerMin = 0;
        oldVisitOneOf.call(visitor, expr);
        outerMin = oldOuterMin;
        outerMax = oldOuterMax;
      }

      // Synthesize a TripleConstraint with the implicit cardinality.
      visitor.visitTripleConstraint = function (expr) {
        const idx = expr.inverse ? ins : outs; // pick an index
        let min = "min" in expr ? expr.min : 1; min = min * outerMin;
        let max = "max" in expr ? expr.max : 1; max = max * outerMax;
        idx[expr.predicate] = {
          type: "TripleConstraint",
          predicate: expr.predicate,
          min: expr.predicate in idx ? Math.max(idx[expr.predicate].min, min) : min,
          max: expr.predicate in idx ? Math.min(idx[expr.predicate].max, max) : max,
          seen: expr.predicate in idx ? idx[expr.predicate].seen + 1 : 1,
          tcs: expr.predicate in idx ? idx[expr.predicate].tcs.concat([expr]) : [expr]
        }
        return expr;
      };

      // Call constructed visitor on expr.
      visitor.visitShapeExpr(expr);
    }
  }

  this._triplesMatchingShapeExpr = function (triples, constraint, valParms) {
    const _ShExValidator = this;
    const misses = [];
    const hits = [];
    triples.forEach(function (triple) {
      const value = constraint.inverse ? triple.subject : triple.object;
      let sub;
      const oldBindings = JSON.parse(JSON.stringify(_ShExValidator.semActHandler.results));
      const errors = constraint.valueExpr === undefined ?
          undefined :
          (sub = _ShExValidator._errorsMatchingShapeExpr(value, constraint.valueExpr, valParms)).errors;
      if (!errors) {
        hits.push({triple: triple, sub: sub});
      } else if (hits.indexOf(triple) === -1) {
        _ShExValidator.semActHandler.results = JSON.parse(JSON.stringify(oldBindings));
        misses.push({triple: triple, errors: sub});
      }
    });
    return { hits: hits, misses: misses };
  }
  this._errorsMatchingShapeExpr = function (value, valueExpr, valParms, subgraph) {
    const _ShExValidator = this;
    if (typeof valueExpr === "string") { // ShapeRef
      return _ShExValidator.validate(value, valueExpr, valParms.tracker, valParms.seen, subgraph);
    } else if (valueExpr.type === "NodeConstraint") {
      return this._errorsMatchingNodeConstraint(value, valueExpr, null);
    } else if (valueExpr.type === "Shape") {
      return _ShExValidator._validateShapeExpr(value, valueExpr, valParms.shapeLabel, valParms.depth, valParms.tracker, valParms.seen, subgraph)
    } else if (valueExpr.type === "ShapeOr") {
      const errors = [];
      for (let i = 0; i < valueExpr.shapeExprs.length; ++i) {
        const nested = valueExpr.shapeExprs[i];
        const sub = _ShExValidator._errorsMatchingShapeExpr(value, nested, valParms, subgraph);
        if ("errors" in sub)
          errors.push(sub);
        else
          return { type: "ShapeOrResults", solution: sub };
      }
      return { type: "ShapeOrFailure", errors: errors };
    } else if (valueExpr.type === "ShapeAnd") {
      const passes = [];
      for (let i = 0; i < valueExpr.shapeExprs.length; ++i) {
        const nested = valueExpr.shapeExprs[i];
        const sub = _ShExValidator._errorsMatchingShapeExpr(value, nested, valParms, subgraph);
        if ("errors" in sub)
          return { type: "ShapeAndFailure", errors: [sub] };
        else
          passes.push(sub);
      }
      return { type: "ShapeAndResults", solutions: passes };
    } else if (valueExpr.type === "ShapeNot") {
      const sub = _ShExValidator._errorsMatchingShapeExpr(value, valueExpr.shapeExpr, valParms, subgraph);
      // return sub.errors && sub.errors.length ? {} : {
      //   errors: ["Error validating " + value + " as " + JSON.stringify(valueExpr) + ": expected NOT to pass"] };
      const ret = Object.assign({
        type: null,
        focus: value
      }, valueExpr);
      if (sub.errors && sub.errors.length) {
        ret.type = "ShapeNotTest";
        // ret = {};
      } else {
        ret.type = "ShapeNotFailure";
        ret.errors = ["Error validating " + value + " as " + JSON.stringify(valueExpr) + ": expected NOT to pass"]
      }
      return ret;
    } else {
      throw Error("unknown value expression type '" + valueExpr.type + "'");
    }
  };

  /* _errorsMatchingNodeConstraint - return whether the value matches the value
   * expression without checking shape references.
   */
  this._errorsMatchingNodeConstraint = function (value, valueExpr, recurse) {
    const errors = [];
    const label = ShExTerm.isLiteral(value) ? ShExTerm.getLiteralValue(value) :
      ShExTerm.isBlank(value) ? value.substring(2) :
      value;
    const dt = ShExTerm.isLiteral(value) ? ShExTerm.getLiteralType(value) : null;
    const numeric = integerDatatypes.indexOf(dt) !== -1 ? XSD + "integer" : numericDatatypes.indexOf(dt) !== -1 ? dt : undefined;

    function validationError () {
      const errorStr = Array.prototype.join.call(arguments, "");
      errors.push("Error validating " + value + " as " + JSON.stringify(valueExpr) + ": " + errorStr);
      return false;
    }
    // if (negated) ;
    if (false) {} else {
      if ("nodeKind" in valueExpr) {
        if (["iri", "bnode", "literal", "nonliteral"].indexOf(valueExpr.nodeKind) === -1) {
          validationError("unknown node kind '" + valueExpr.nodeKind + "'");
        }
        if (ShExTerm.isBlank(value)) {
          if (valueExpr.nodeKind === "iri" || valueExpr.nodeKind === "literal") {
            validationError("blank node found when " + valueExpr.nodeKind + " expected");
          }
        } else if (ShExTerm.isLiteral(value)) {
          if (valueExpr.nodeKind !== "literal") {
            validationError("literal found when " + valueExpr.nodeKind + " expected");
          }
        } else if (valueExpr.nodeKind === "bnode" || valueExpr.nodeKind === "literal") {
          validationError("iri found when " + valueExpr.nodeKind + " expected");
        }
      }

      if (valueExpr.datatype  && valueExpr.values  ) validationError("found both datatype and values in "   +tripleConstraint);

      if (valueExpr.datatype) {
        if (!ShExTerm.isLiteral(value)) {
          validationError("mismatched datatype: " + value + " is not a literal with datatype " + valueExpr.datatype);
        }
        else if (ShExTerm.getLiteralType(value) !== valueExpr.datatype) {
          validationError("mismatched datatype: " + ShExTerm.getLiteralType(value) + " !== " + valueExpr.datatype);
        }
        else if (numeric) {
          testRange(numericParsers[numeric](label, validationError), valueExpr.datatype, validationError);
        }
        else if (valueExpr.datatype === XSD + "boolean") {
          if (label !== "true" && label !== "false" && label !== "1" && label !== "0")
            validationError("illegal boolean value: " + label);
        }
        else if (valueExpr.datatype === XSD + "dateTime") {
          if (!label.match(/^[+-]?\d{4}-[01]\d-[0-3]\dT[0-5]\d:[0-5]\d:[0-5]\d(\.\d+)?([+-][0-2]\d:[0-5]\d|Z)?$/))
            validationError("illegal dateTime value: " + label);
        }
      }

      if (valueExpr.values) {
        if (ShExTerm.isLiteral(value) && valueExpr.values.reduce((ret, v) => {
          if (ret) return true;
          const ld = ldify(value);
          if (v.type === "Language") {
            return v.languageTag === ld.language; // @@ use equals/normalizeTest
          }
          if (!(typeof v === "object" && "value" in v))
            return false;
          return v.value === ld.value &&
            v.type === ld.type &&
            v.language === ld.language;
        }, false)) {
          // literal match
        } else if (valueExpr.values.indexOf(value) !== -1) {
          // trivial match
        } else {
          if (!(valueExpr.values.some(function (valueConstraint) {
            if (typeof valueConstraint === "object" && !("value" in valueConstraint)) { // isTerm me -- strike "value" in
              if (!("type" in valueConstraint))
                runtimeError("expected "+JSON.stringify(valueConstraint)+" to have a 'type' attribute.");
              const stemRangeTypes = [
                "Language",
                "IriStem",      "LiteralStem",      "LanguageStem",
                "IriStemRange", "LiteralStemRange", "LanguageStemRange"
              ];
              if (stemRangeTypes.indexOf(valueConstraint.type) === -1)
                runtimeError("expected type attribute '"+valueConstraint.type+"' to be in '"+stemRangeTypes+"'.");

              /* expect N3.js literals with {Literal,Language}StemRange
               *       or non-literals with IriStemRange
               */
              function normalizedTest (val, ref, func) {
                if (ShExTerm.isLiteral(val)) {
                  if (["LiteralStem", "LiteralStemRange"].indexOf(valueConstraint.type) !== -1) {
                    return func(ShExTerm.getLiteralValue(val), ref);
                  } else if (["LanguageStem", "LanguageStemRange"].indexOf(valueConstraint.type) !== -1) {
                    return func(ShExTerm.getLiteralLanguage(val) || null, ref);
                  } else {
                    return validationError("literal " + val + " not comparable with non-literal " + ref);
                  }
                } else {
                  if (["IriStem", "IriStemRange"].indexOf(valueConstraint.type) === -1) {
                    return validationError("nonliteral " + val + " not comparable with literal " + JSON.stringify(ref));
                  } else {
                    return func(val, ref);
                  }
                }
              }
              function startsWith (val, ref) {
                return normalizedTest(val, ref, (l, r) => {
                  return (valueConstraint.type === "LanguageStem" ||
                          valueConstraint.type === "LanguageStemRange") ?
                    // rfc4647 basic filtering
                    l !== null && (l === r || r === "" || l[r.length] === "-") :
                    // simple substring
                    l.startsWith(r);
                });
              }
              function equals (val, ref) {
                return normalizedTest(val, ref, (l, r) => { return l === r; });
              }

              if (!isTerm(valueConstraint.stem)) {
                expect(valueConstraint.stem, "type", "Wildcard");
                // match whatever but check exclusions below
              } else {
                if (!(startsWith(value, valueConstraint.stem))) {
                  return false;
                }
              }
              if (valueConstraint.exclusions) {
                return !valueConstraint.exclusions.some(function (c) {
                  if (!isTerm(c)) {
                    if (!("type" in c))
                      runtimeError("expected "+JSON.stringify(c)+" to have a 'type' attribute.");
                    const stemTypes = ["IriStem", "LiteralStem", "LanguageStem"];
                    if (stemTypes.indexOf(c.type) === -1)
                      runtimeError("expected type attribute '"+c.type+"' to be in '"+stemTypes+"'.");
                    return startsWith(value, c.stem);
                  } else {
                    return equals(value, c);
                  }
                });
              }
              return true;
            } else {
              // ignore -- would have caught it above
            }
          }))) {
            validationError("value " + value + " not found in set " + JSON.stringify(valueExpr.values));
          }
        }
      }
    }

    if ("pattern" in valueExpr) {
      const regexp = "flags" in valueExpr ?
	  new RegExp(valueExpr.pattern, valueExpr.flags) :
	  new RegExp(valueExpr.pattern);
      if (!(getLexicalValue(value).match(regexp)))
        validationError("value " + getLexicalValue(value) + " did not match pattern " + valueExpr.pattern);
    }

    Object.keys(stringTests).forEach(function (test) {
      if (test in valueExpr && !stringTests[test](label, valueExpr[test])) {
        validationError("facet violation: expected " + test + " of " + valueExpr[test] + " but got " + value);
      }
    });

    Object.keys(numericValueTests).forEach(function (test) {
      if (test in valueExpr) {
        if (numeric) {
          if (!numericValueTests[test](numericParsers[numeric](label, validationError), valueExpr[test])) {
            validationError("facet violation: expected " + test + " of " + valueExpr[test] + " but got " + value);
          }
        } else {
          validationError("facet violation: numeric facet " + test + " can't apply to " + value);
        }
      }
    });

    Object.keys(decimalLexicalTests).forEach(function (test) {
      if (test in valueExpr) {
        if (numeric === XSD + "integer" || numeric === XSD + "decimal") {
          if (!decimalLexicalTests[test](""+numericParsers[numeric](label, validationError), valueExpr[test])) {
            validationError("facet violation: expected " + test + " of " + valueExpr[test] + " but got " + value);
          }
        } else {
          validationError("facet violation: numeric facet " + test + " can't apply to " + value);
        }
      }
    });
    const ret = {
      type: null,
      focus: value,
      shapeExpr: valueExpr
    };
    if (errors.length) {
      ret.type = "NodeConstraintViolation";
      ret.errors = errors;
    } else {
      ret.type = "NodeConstraintTest";
    }
    return ret;
  };

  this.semActHandler = {
    handlers: { },
    results: { },
    /**
     * Store a semantic action handler.
     *
     * @param {string} name - semantic action's URL.
     * @param {object} handler - handler function.
     *
     * The handler object has a dispatch function is invoked with:
     * @param {string} code - text of the semantic action.
     * @param {object} ctx - matched triple or results subset.
     * @param {object} extensionStorage - place where the extension writes into the result structure.
     * @return {bool} false if the extension failed or did not accept the ctx object.
     */
    register: function (name, handler) {
      this.handlers[name] = handler;
    },
    /**
     * Calls all semantic actions, allowing each to write to resultsArtifact.
     *
     * @param {array} semActs - list of semantic actions to invoke.
     * @return {bool} false if any result was false.
     */
    dispatchAll: function (semActs, ctx, resultsArtifact) {
      const _semActHanlder = this;
      return semActs.reduce(function (ret, semAct) {
        if (ret.length === 0 && semAct.name in _semActHanlder.handlers) {
          const code = "code" in semAct ? semAct.code : _ShExValidator.options.semActs[semAct.name];
          const existing = "extensions" in resultsArtifact && semAct.name in resultsArtifact.extensions;
          const extensionStorage = existing ? resultsArtifact.extensions[semAct.name] : {};
          const response = _semActHanlder.handlers[semAct.name].dispatch(code, ctx, extensionStorage);
          if (typeof response === 'boolean') {
            if (!response)
              ret.push({ type: "SemActFailure", errors: [{ type: "BooleanSemActFailure", code: code, ctx }] })
          } else if (typeof response === 'object' && Array.isArray(response)) {
            if (response.length > 0)
              ret.push({ type: "SemActFailure", errors: response })
          } else {
            throw Error("unsupported response from semantic action handler: " + JSON.stringify(response))
          }
          if (!existing && Object.keys(extensionStorage).length > 0) {
            if (!("extensions" in resultsArtifact))
              resultsArtifact.extensions = {};
            resultsArtifact.extensions[semAct.name] = extensionStorage;
          }
          return ret;
        }
        return ret;
      }, []);
    }
  };
}

// http://stackoverflow.com/questions/9422386/lazy-cartesian-product-of-arrays-arbitrary-nested-loops
function crossProduct(sets, emptyValue) {
  const n = sets.length, carets = [];
  let args = null;

  function init() {
    args = [];
    for (let i = 0; i < n; i++) {
      carets[i] = 0;
      args[i] = sets[i].length > 0 ? sets[i][0] : emptyValue;
    }
  }

  function next() {

    // special case: crossProduct([]).next().next() returns false.
    if (args !== null && args.length === 0)
      return false;

    if (args === null) {
      init();
      return true;
    }
    let i = n - 1;
    carets[i]++;
    if (carets[i] < sets[i].length) {
      args[i] = sets[i][carets[i]];
      return true;
    }
    while (carets[i] >= sets[i].length) {
      if (i == 0) {
        return false;
      }
      carets[i] = 0;
      args[i] = sets[i].length > 0 ? sets[i][0] : emptyValue;
      carets[--i]++;
    }
    args[i] = sets[i][carets[i]];
    return true;
  }

  return {
    next: next,
    do: function (block, _context) { // old API
      return block.apply(_context, args);
    },
    // new API because
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments#Description
    // cautions about functions over arguments.
    get: function () { return args; }
  };
}

/* N3jsTripleToString - simple toString function to make N3.js's triples
 * printable.
 */
const N3jsTripleToString = function () {
  function fmt (n) {
    return ShExTerm.isLiteral(n) ?
      [ "http://www.w3.org/2001/XMLSchema#integer",
        "http://www.w3.org/2001/XMLSchema#float",
        "http://www.w3.org/2001/XMLSchema#double"
      ].indexOf(ShExTerm.getLiteralType(n)) !== -1 ?
      parseInt(ShExTerm.getLiteralValue(n)) :
      n :
    ShExTerm.isBlank(n) ?
      n :
      "<" + n + ">";
  }
  return fmt(this.subject) + " " + fmt(this.predicate) + " " + fmt(this.object) + " .";
};

/* indexNeighborhood - index triples by predicate
 * returns: {
 *     byPredicate: Object: mapping from predicate to triples containing that
 *                  predicate.
 *
 *     candidates: [[1,3], [0,2]]: mapping from triple to the triple constraints
 *                 it matches.  It is initialized to []. Mappings that remain an
 *                 empty set indicate a triple which didn't matching anything in
 *                 the shape.
 *
 *     misses: list to recieve value constraint failures.
 *   }
 */
function indexNeighborhood (triples) {
  return {
    byPredicate: triples.reduce(function (ret, t) {
      const p = t.predicate;
      if (!(p in ret))
        ret[p] = [];
      ret[p].push(t);

      // If in VERBOSE mode, add a nice toString to N3.js's triple objects.
      if (VERBOSE)
        t.toString = N3jsTripleToString;

      return ret;
    }, {}),
    candidates: _seq(triples.length).map(function () {
      return [];
    }),
    misses: []
  };
}

/* sparqlOrder - sort triples by subject following SPARQL partial ordering.
 */
function sparqlOrder (l, r) {
  const [lprec, rprec] = [l, r].map(
    x => ShExTerm.isBlank(x) ? 1 : ShExTerm.isLiteral(x) ? 2 : 3
  );
  return lprec === rprec ? l.localeCompare(r) : lprec - rprec;
}

/* Return a list of n `undefined`s.
 *
 * Note that Array(n) on its own returns a "sparse array" so Array(n).map(f)
 * never calls f.
 */
function _seq (n) {
  return Array.from(Array(n)); // hahaha, javascript, you suck.
}

/* Expect property p with value v in object o
 */
function expect (o, p, v) {
  if (!(p in o))
    runtimeError("expected "+JSON.stringify(o)+" to have a '"+p+"' attribute.");
  if (arguments.length > 2 && o[p] !== v)
    runtimeError("expected "+p+" attribute '"+o[p]+"' to equal '"+v+"'.");
}

function noop () {  }

function runtimeError () {
  const errorStr = Array.prototype.join.call(arguments, "");
  const e = new Error(errorStr);
  Error.captureStackTrace(e, runtimeError);
  throw e;
}

  function _alist (len) {
    return _seq(len).map(() => [])
  }

  return {
    construct: ShExValidator_constructor,
    start: Start,
    options: InterfaceOptions
  };
})();

// Export the `ShExValidator` class as a whole.
if (true)
  module.exports = ShExValidatorCjsModule;


/***/ }),

/***/ 806:
/***/ ((module) => {


function ShExVisitor () {

    function isTerm (t) {
      return typeof t !== "object" || "value" in t && Object.keys(t).reduce((r, k) => {
        return r === false ? r : ["value", "type", "language"].indexOf(k) !== -1;
      }, true);
    }

  function isShapeRef (expr) {
    return typeof expr === "string" // test for JSON-LD @ID
  }
  let isInclusion = isShapeRef;

  // function expect (l, r) { const ls = JSON.stringify(l), rs = JSON.stringify(r); if (ls !== rs) throw Error(ls+" !== "+rs); }
  const _ShExUtil = this;
  function visitMap (map, val) {
    const ret = {};
    Object.keys(map).forEach(function (item) {
      ret[item] = val(map[item]);
    });
    return ret;
  }
  const r = {
    runtimeError: function (e) {
      throw e;
    },

    visitSchema: function (schema) {
      const ret = { type: "Schema" };
      this._expect(schema, "type", "Schema");
      this._maybeSet(schema, ret, "Schema",
                     ["@context", "prefixes", "base", "imports", "startActs", "start", "shapes"],
                     ["_base", "_prefixes", "_index", "_sourceMap"]
                    );
      return ret;
    },

    visitPrefixes: function (prefixes) {
      return prefixes === undefined ?
        undefined :
        visitMap(prefixes, function (val) {
          return val;
        });
    },

    visitIRI: function (i) {
      return i;
    },

    visitImports: function (imports) {
      const _Visitor = this;
      return imports.map(function (imp) {
        return _Visitor.visitIRI(imp);
      });
    },

    visitStartActs: function (startActs) {
      const _Visitor = this;
      return startActs === undefined ?
        undefined :
        startActs.map(function (act) {
          return _Visitor.visitSemAct(act);
        });
    },
    visitSemActs: function (semActs) {
      const _Visitor = this;
      if (semActs === undefined)
        return undefined;
      const ret = []
      Object.keys(semActs).forEach(function (label) {
        ret.push(_Visitor.visitSemAct(semActs[label], label));
      });
      return ret;
    },
    visitSemAct: function (semAct, label) {
      const ret = { type: "SemAct" };
      this._expect(semAct, "type", "SemAct");

      this._maybeSet(semAct, ret, "SemAct",
                     ["name", "code"]);
      return ret;
    },

    visitShapes: function (shapes) {
      const _Visitor = this;
      if (shapes === undefined)
        return undefined;
      return shapes.map(
        shapeExpr =>
          _Visitor.visitShapeDecl(shapeExpr)
      );
    },

    visitProductions999: function (productions) { // !! DELETE
      const _Visitor = this;
      if (productions === undefined)
        return undefined;
      const ret = {}
      Object.keys(productions).forEach(function (label) {
        ret[label] = _Visitor.visitExpression(productions[label], label);
      });
      return ret;
    },

    visitShapeDecl: function (decl, label) {
      return decl.type === "ShapeDecl" ?
        this._maybeSet(decl, { type: "ShapeDecl" }, "ShapeDecl",
                       ["id", "abstract", "restricts", "shapeExpr"]) :
        this.visitShapeExpr(decl, label);
    },

    visitShapeExpr: function (expr, label) {
      if (isShapeRef(expr))
        return this.visitShapeRef(expr)
      const r =
          expr.type === "Shape" ? this.visitShape(expr, label) :
          expr.type === "NodeConstraint" ? this.visitNodeConstraint(expr, label) :
          expr.type === "ShapeAnd" ? this.visitShapeAnd(expr, label) :
          expr.type === "ShapeOr" ? this.visitShapeOr(expr, label) :
          expr.type === "ShapeNot" ? this.visitShapeNot(expr, label) :
          expr.type === "ShapeExternal" ? this.visitShapeExternal(expr) :
          null;// if (expr.type === "ShapeRef") r = 0; // console.warn("visitShapeExpr:", r);
      if (r === null)
        throw Error("unexpected shapeExpr type: " + expr.type);
      else
        return r;
    },

    // _visitShapeGroup: visit a grouping expression (shapeAnd, shapeOr)
    _visitShapeGroup: function (expr, label) {
      this._testUnknownAttributes(expr, ["id", "shapeExprs"], expr.type, this.visitShapeNot)
      const _Visitor = this;
      const r = { type: expr.type };
      if ("id" in expr)
        r.id = expr.id;
      r.shapeExprs = expr.shapeExprs.map(function (nested) {
        return _Visitor.visitShapeExpr(nested, label);
      });
      return r;
    },

    // _visitShapeNot: visit negated shape
    visitShapeNot: function (expr, label) {
      this._testUnknownAttributes(expr, ["id", "shapeExpr"], "ShapeNot", this.visitShapeNot)
      const r = { type: expr.type };
      if ("id" in expr)
        r.id = expr.id;
      r.shapeExpr = this.visitShapeExpr(expr.shapeExpr, label);
      return r;
    },

    // ### `visitNodeConstraint` deep-copies the structure of a shape
    visitShape: function (shape, label) {
      const ret = { type: "Shape" };
      this._expect(shape, "type", "Shape");

      this._maybeSet(shape, ret, "Shape",
                     [ "id",
                       "abstract", "extends",
                       "closed",
                       "expression", "extra", "semActs", "annotations"]);
      return ret;
    },

    _visitShapeExprList: function (ext) {
      const _Visitor = this;
      return ext.map(function (t) {
        return _Visitor.visitShapeExpr(t, undefined);
      });
    },

    // ### `visitNodeConstraint` deep-copies the structure of a shape
    visitNodeConstraint: function (shape, label) {
      const ret = { type: "NodeConstraint" };
      this._expect(shape, "type", "NodeConstraint");

      this._maybeSet(shape, ret, "NodeConstraint",
                     [ "id",
                       // "abstract", "extends", "restricts", -- futureWork
                       "nodeKind", "datatype", "pattern", "flags", "length",
                       "reference", "minlength", "maxlength",
                       "mininclusive", "minexclusive", "maxinclusive", "maxexclusive",
                       "totaldigits", "fractiondigits", "values", "annotations", "semActs"]);
      return ret;
    },

    visitShapeRef: function (reference) {
      if (typeof reference !== "string") {
        let ex = Exception("visitShapeRef expected a string, not " + JSON.stringify(reference));
        console.warn(ex);
        throw ex;
      }
      return reference;
    },

    visitShapeExternal: function (expr) {
      this._testUnknownAttributes(expr, ["id"], "ShapeExternal", this.visitShapeNot)
      return Object.assign("id" in expr ? { id: expr.id } : {}, { type: "ShapeExternal" });
    },

    // _visitGroup: visit a grouping expression (someOf or eachOf)
    _visitGroup: function (expr, type) {
      const _Visitor = this;
      const r = Object.assign(
        // pre-declare an id so it sorts to the top
        "id" in expr ? { id: null } : { },
        { type: expr.type }
      );
      r.expressions = expr.expressions.map(function (nested) {
        return _Visitor.visitExpression(nested);
      });
      return this._maybeSet(expr, r, "expr",
                            ["id", "min", "max", "annotations", "semActs"], ["expressions"]);
    },

    visitTripleConstraint: function (expr) {
      return this._maybeSet(expr,
                            Object.assign(
                              // pre-declare an id so it sorts to the top
                              "id" in expr ? { id: null } : { },
                              { type: "TripleConstraint" }
                            ),
                            "TripleConstraint",
                            ["id", "inverse", "predicate", "valueExpr",
                             "min", "max", "annotations", "semActs"])
    },

    visitExpression: function (expr) {
      if (typeof expr === "string")
        return this.visitInclusion(expr);
      const r = expr.type === "TripleConstraint" ? this.visitTripleConstraint(expr) :
          expr.type === "OneOf" ? this.visitOneOf(expr) :
          expr.type === "EachOf" ? this.visitEachOf(expr) :
          null;
      if (r === null)
        throw Error("unexpected expression type: " + expr.type);
      else
        return r;
    },

    visitValues: function (values) {
      const _Visitor = this;
      return values.map(function (t) {
        return isTerm(t) || t.type === "Language" ?
          t :
          _Visitor.visitStemRange(t);
      });
    },

    visitStemRange: function (t) {
      const _Visitor = this; // console.log(Error(t.type).stack);
      // this._expect(t, "type", "IriStemRange");
      if (!("type" in t))
        _Visitor.runtimeError(Error("expected "+JSON.stringify(t)+" to have a 'type' attribute."));
      const stemRangeTypes = ["IriStem", "LiteralStem", "LanguageStem", "IriStemRange", "LiteralStemRange", "LanguageStemRange"];
      if (stemRangeTypes.indexOf(t.type) === -1)
        _Visitor.runtimeError(Error("expected type attribute '"+t.type+"' to be in '"+stemRangeTypes+"'."));
      let stem;
      if (isTerm(t)) {
        this._expect(t.stem, "type", "Wildcard");
        stem = { type: t.type, stem: { type: "Wildcard" } };
      } else {
        stem = { type: t.type, stem: t.stem };
      }
      if (t.exclusions) {
        stem.exclusions = t.exclusions.map(function (c) {
          return _Visitor.visitExclusion(c);
        });
      }
      return stem;
    },

    visitExclusion: function (c) {
      if (!isTerm(c)) {
        // this._expect(c, "type", "IriStem");
        if (!("type" in c))
          _Visitor.runtimeError(Error("expected "+JSON.stringify(c)+" to have a 'type' attribute."));
        const stemTypes = ["IriStem", "LiteralStem", "LanguageStem"];
        if (stemTypes.indexOf(c.type) === -1)
          _Visitor.runtimeError(Error("expected type attribute '"+c.type+"' to be in '"+stemTypes+"'."));
        return { type: c.type, stem: c.stem };
      } else {
        return c;
      }
    },

    visitInclusion: function (inclusion) {
      if (typeof inclusion !== "string") {
        let ex = Exception("visitInclusion expected a string, not " + JSON.stringify(inclusion));
        console.warn(ex);
        throw ex;
      }
      return inclusion;
    },

    _maybeSet: function (obj, ret, context, members, ignore) {
      const _Visitor = this;
      this._testUnknownAttributes(obj, ignore ? members.concat(ignore) : members, context, this._maybeSet)
      members.forEach(function (member) {
        const methodName = "visit" + member.charAt(0).toUpperCase() + member.slice(1);
        if (member in obj) {
          const f = _Visitor[methodName];
          if (typeof f !== "function") {
            throw Error(methodName + " not found in Visitor");
          }
          const t = f.call(_Visitor, obj[member]);
          if (t !== undefined) {
            ret[member] = t;
          }
        }
      });
      return ret;
    },
    _visitValue: function (v) {
      return v;
    },
    _visitList: function (l) {
      return l.slice();
    },
    _testUnknownAttributes: function (obj, expected, context, captureFrame) {
      const unknownMembers = Object.keys(obj).reduce(function (ret, k) {
        return k !== "type" && expected.indexOf(k) === -1 ? ret.concat(k) : ret;
      }, []);
      if (unknownMembers.length > 0) {
        const e = Error("unknown propert" + (unknownMembers.length > 1 ? "ies" : "y") + ": " +
                      unknownMembers.map(function (p) {
                        return "\"" + p + "\"";
                      }).join(",") +
                      " in " + context + ": " + JSON.stringify(obj));
        Error.captureStackTrace(e, captureFrame);
        throw e;
      }
    },
    _expect: function (o, p, v) {
      if (!(p in o))
        this.runtimeError(Error("expected "+JSON.stringify(o)+" to have a ."+p));
      if (arguments.length > 2 && o[p] !== v)
        this.runtimeError(Error("expected "+o[p]+" to equal "+v));
    },
  };

  r.visitBase = r.visitStart = r.visitClosed = r["visit@context"] = r._visitValue;
  r.visitRestricts = r.visitExtends = r._visitShapeExprList;
  r.visitExtra = r.visitAnnotations = r._visitList;
  r.visitAbstract = r.visitInverse = r.visitPredicate = r._visitValue;
  r.visitName = r.visitId = r.visitCode = r.visitMin = r.visitMax = r._visitValue;

  r.visitType = r.visitNodeKind = r.visitDatatype = r.visitPattern = r.visitFlags = r.visitLength = r.visitMinlength = r.visitMaxlength = r.visitMininclusive = r.visitMinexclusive = r.visitMaxinclusive = r.visitMaxexclusive = r.visitTotaldigits = r.visitFractiondigits = r._visitValue;
  r.visitOneOf = r.visitEachOf = r._visitGroup;
  r.visitShapeAnd = r.visitShapeOr = r._visitShapeGroup;
  r.visitInclude = r._visitValue;
  r.visitValueExpr = r.visitShapeExpr;
  return r;

  // Expect property p with value v in object o
}

// The ShEx Vistor is here to minimize deps for ShExValidator.
/** create indexes for schema
 */
ShExVisitor.index = function (schema) {
  let index = {
    shapeExprs: {},
    tripleExprs: {}
  };
  let v = ShExVisitor();

  let oldVisitExpression = v.visitExpression;
  v.visitExpression = function (expression) {
    if (typeof expression === "object" && "id" in expression)
      index.tripleExprs[expression.id] = expression;
    return oldVisitExpression.call(v, expression);
  };

  let oldVisitShapeExpr = v.visitShapeExpr;
  v.visitShapeExpr = v.visitValueExpr = function (shapeExpr, label) {
    if (typeof shapeExpr === "object" && "id" in shapeExpr)
      index.shapeExprs[shapeExpr.id] = shapeExpr;
    return oldVisitShapeExpr.call(v, shapeExpr, label);
  };

  let oldVisitShapeDecl = v.visitShapeDecl;
  v.visitShapeDecl = v.visitValueExpr = function (shapeExpr, label) {
    if (typeof shapeExpr === "object" && "id" in shapeExpr)
      index.shapeExprs[shapeExpr.id] = shapeExpr;
    return oldVisitShapeDecl.call(v, shapeExpr, label);
  };

  v.visitSchema(schema);
  return index;
}

if (true)
  module.exports = ShExVisitor;



/***/ }),

/***/ 863:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

ShExWebApp = (function () {
  let shapeMap = __webpack_require__(261)
  return Object.assign({}, {
    ShExTerm:             __webpack_require__(118),
    Util:                 __webpack_require__(443),
    Validator:            __webpack_require__(457),
    Writer:               __webpack_require__(95),
    Api:                  __webpack_require__(410),
    Parser:               __webpack_require__(931),
    "eval-simple-1err":   __webpack_require__(540),
    "eval-threaded-nerr": __webpack_require__(237),
    ShapeMap:             shapeMap,
    ShapeMapParser:       shapeMap.Parser,
    DcTap:                (__webpack_require__(281).DcTap),
  })
})()

if (true)
  module.exports = ShExWebApp;


/***/ }),

/***/ 95:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// **ShExWriter** writes ShEx documents.

const ShExWriterCjsModule = (function () {
const RelateUrl = __webpack_require__(755);
const UNBOUNDED = -1;

// Matches a literal as represented in memory by the ShEx library
const ShExLiteralMatcher = /^"([^]*)"(?:\^\^(.+)|@([\-a-z]+))?$/i;

// rdf:type predicate (for 'a' abbreviation)
const RDF_PREFIX = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    RDF_TYPE   = RDF_PREFIX + 'type';

// Characters in literals that require escaping
const ESCAPE_1 = /["\\\t\n\r\b\f\u0000-\u0019\ud800-\udbff]/,
    ESCAPE_g = /["\\\t\n\r\b\f\u0000-\u0019]|[\ud800-\udbff][\udc00-\udfff]/g,
    ESCAPE_replacements = { '\\': '\\\\', '"': '\\"', '/': '\\/', '\t': '\\t',
                            '\n': '\\n', '\r': '\\r', '\b': '\\b', '\f': '\\f' };

const nodeKinds = {
  'iri': "IRI",
  'bnode': "BNODE",
  'literal': "LITERAL",
  'nonliteral': "NONLITERAL"
};
const nonLitNodeKinds = {
  'iri': "IRI",
  'bnode': "BNODE",
  'literal': "LITERAL",
  'nonliteral': "NONLITERAL"
};

// ## Constructor
function ShExWriter (outputStream, options) {
  if (!(this instanceof ShExWriter))
    return new ShExWriter(outputStream, options);

  // Shift arguments if the first argument is not a stream
  if (outputStream && typeof outputStream.write !== 'function')
    options = outputStream, outputStream = null;
  options = options || {};

  // If no output stream given, send the output as string through the end callback
  if (!outputStream) {
    let output = '';
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
  this._baseIRI = options.base || null;
  options.prefixes && this.addPrefixes(options.prefixes);

  this._error = options.error || _throwError;
  this.forceParens = !options.simplifyParentheses; // default to false
  this._expect = options.lax ? noop : expect;
}

ShExWriter.prototype = {
  // ## Private methods

  // ### `_write` writes the argument to the output stream
  _write: function (string, callback) {
    this._outputStream.write(string, 'utf8', callback);
  },

  // ### `_writeSchema` writes the shape to the output stream
  _writeSchema: function (schema, done) {
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
                           ("code" in act ? "{"+escapeCode(act.code)+"%"+"}" : "%"));
      });
    if (schema.start)
      _ShExWriter._write("start = " + _ShExWriter._writeShapeExpr(schema.start, done, true, 0).join('') + "\n")
    if ("shapes" in schema)
      schema.shapes.forEach(function (shapeExpr) {
        let id = shapeExpr.id;
        let abstract = "";
        if (shapeExpr.type === "ShapeDecl") {
          if (shapeExpr.abstract)
            abstract = "abstract "
          shapeExpr = shapeExpr.shapeExpr;
        }
        _ShExWriter._write(
          abstract +
          _ShExWriter._encodeShapeName(id, false) +
            " " +
            _ShExWriter._writeShapeExpr(shapeExpr, done, true, 0).join("")+"\n",
          done
        );
      })
  },

  _writeShapeExpr: function (shapeExpr, done, forceBraces, parentPrec) {
    const _ShExWriter = this;
    const pieces = [];
    if (typeof shapeExpr === "string") // ShapeRef
      pieces.push("@", _ShExWriter._encodeShapeName(shapeExpr));
    // !!! []s for precedence!
    else if (shapeExpr.type === "ShapeDecl")
      pieces.push(_ShExWriter._writeShapeExpr(shapeExpr.shapeExpr, done, false, 3));
    else if (shapeExpr.type === "ShapeExternal")
      pieces.push("EXTERNAL");
    else if (shapeExpr.type === "ShapeAnd") {
      if (parentPrec >= 3)
        pieces.push("(");
      let lastAndElided = false;
      shapeExpr.shapeExprs.forEach(function (expr, ord) {
        if (ord > 0) { // && !!! grammar rules too weird here
          /*
            shapeAtom:
                  nonLitNodeConstraint shapeOrRef?
                | shapeDecl nonLitNodeConstraint?

            nonLitInlineNodeConstraint:
                  nonLiteralKind stringFacet*
          */
          function nonLitNodeConstraint (idx) {
            let c = shapeExpr.shapeExprs[idx];
            return c.type !== "NodeConstraint"
              || ("nodeKind" in c && c.nodeKind === "literal")
              || "datatype" in c
              || "values" in c
              ? false
              : true;
          }

          function shapeOrRef (idx) {
            let c = shapeExpr.shapeExprs[idx];
            return c.type === "Shape" || c.type === "ShapeRef";
          }

          function shapeDecl (idx) {
            let c = shapeExpr.shapeExprs[idx];
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
        [].push.apply(pieces, _ShExWriter._writeShapeExpr(expr, done, false, 3));
      });
      if (parentPrec >= 3)
        pieces.push(")");
    } else if (shapeExpr.type === "ShapeOr") {
      if (parentPrec >= 2)
        pieces.push("(");
      shapeExpr.shapeExprs.forEach(function (expr, ord) {
        if (ord > 0)
          pieces.push(" OR ");
        [].push.apply(pieces, _ShExWriter._writeShapeExpr(expr, done, forceBraces, 2));
      });
      if (parentPrec >= 2)
        pieces.push(")");
    } else if (shapeExpr.type === "ShapeNot") {
      if (parentPrec >= 4)
        pieces.push("(");
      pieces.push("NOT ");
      [].push.apply(pieces, _ShExWriter._writeShapeExpr(shapeExpr.shapeExpr, done, forceBraces, 4));
      if (parentPrec >= 4)
        pieces.push(")");
    } else if (shapeExpr.type === "Shape") {
      [].push.apply(pieces, _ShExWriter._writeShape(shapeExpr, done, forceBraces));
    } else if (shapeExpr.type === "NodeConstraint") {
      [].push.apply(pieces, _ShExWriter._writeNodeConstraint(shapeExpr, done, forceBraces));
    } else
      throw Error("expected Shape{,And,Or,Ref} or NodeConstraint in " + JSON.stringify(shapeExpr));
    return pieces;
  },

  // ### `_writeShape` writes the shape to the output stream
  _writeShape: function (shape, done, forceBraces) {
    const _ShExWriter = this;
    try {
      const pieces = []; // guessing push/join is faster than concat
      this._expect(shape, "type", "Shape");

      if (shape.closed) pieces.push("CLOSED ");

      [{keyword: "extends", marker: "EXTENDS "}].forEach(pair => {
         // pieces = pieces.concat(_ShExWriter._writeShapeExpr(expr.valueExpr, done, true, 0));
         if (shape[pair.keyword] && shape[pair.keyword].length > 0) {
           shape[pair.keyword].forEach(function (i, ord) {
             if (ord)
               pieces.push(" ")
             pieces.push(pair.marker);
             [].push.apply(pieces, _ShExWriter._writeShapeExpr(i, done, true, 0));
           });
           pieces.push(" ");
         }
       });

      if (shape.extra && shape.extra.length > 0) {
        pieces.push("EXTRA ");
        shape.extra.forEach(function (i, ord) {
          pieces.push(_ShExWriter._encodeShapeName(i, false)+" ");
        });
        pieces.push(" ");
      }
      const empties = ["values", "length", "minlength", "maxlength", "pattern", "flags"];
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
        else if (min === 0 && max === UNBOUNDED) pieces.push("*");
        else if (min === undefined && max === undefined)                         ;
        else if (min === 1 && max === UNBOUNDED) pieces.push("+");
        else
          pieces.push("{", min, ",", (max === UNBOUNDED ? "*" : max), "}"); // by coincidence, both use the same character.
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

        if ("id" in expr) {
          pieces.push("$");
          pieces.push(_ShExWriter._encodeIriOrBlankNode(expr.id, true));
        }

        if (expr.type === "TripleConstraint") {
          if (expr.inverse)
            pieces.push("^");
          if (expr.negated)
            pieces.push("!");
          pieces.push(indent,
                      _ShExWriter._encodePredicate(expr.predicate),
                      " ");

          if ("valueExpr" in expr)
            [].push.apply(pieces, _ShExWriter._writeShapeExpr(expr.valueExpr, done, true, 0));
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

        else throw Error("unexpected expr type: " + expr.type);
        }
      }

      if (shape.expression) // t: 0, 0Extend1
        _writeExpression(shape.expression, "  ", 0);
      pieces.push("\n}");
      _writeShapeActions(shape.semActs);
      _ShExWriter._annotations(pieces, shape.annotations, "  ");

      return pieces;
    }
    catch (error) { done && done(error); }
  },

  // ### `_writeShape` writes the shape to the output stream
  _writeNodeConstraint: function (v, done) {
    const _ShExWriter = this;
    try {
      _ShExWriter._expect(v, "type", "NodeConstraint");

      const pieces = [];
      if (v.nodeKind in nodeKinds)       pieces.push(nodeKinds[v.nodeKind], " ");
      else if (v.nodeKind !== undefined) _ShExWriter._error("unexpected nodeKind: " + v.nodeKind); // !!!!

      this._fillNodeConstraint(pieces, v, done);
      this._annotations(pieces, v.annotations, "  ");
      return pieces;
    }
    catch (error) { done && done(error); }

  },

  _annotations: function (pieces, annotations, indent) {
    const _ShExWriter = this;
    if (annotations) {
      annotations.forEach(function (a) {
        _ShExWriter._expect(a, "type", "Annotation");
        pieces.push("//\n"+indent+"   ");
        pieces.push(_ShExWriter._encodeValue(a.predicate));
        pieces.push(" ");
        pieces.push(_ShExWriter._encodeValue(a.object));
      });
    }
  },

  _fillNodeConstraint: function (pieces, v, done) {
    const _ShExWriter = this;
    if (v.datatype  && v.values  ) _ShExWriter._error("found both datatype and values in "   +expr);
    if (v.datatype) {
      pieces.push(_ShExWriter._encodeShapeName(v.datatype));
    }

    if (v.values) {
      pieces.push("[");

      v.values.forEach(function (t, ord) {
        if (ord > 0)
          pieces.push(" ");

        if (!isTerm(t)) {
//          expect(t, "type", "IriStemRange");
              if (!("type" in t))
                runtimeError("expected "+JSON.stringify(t)+" to have a 'type' attribute.");
          const stemRangeTypes = ["Language", "IriStem", "LiteralStem", "LanguageStem", "IriStemRange", "LiteralStemRange", "LanguageStemRange"];
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
                    const stemTypes = ["IriStem", "LiteralStem", "LanguageStem"];
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
              _ShExWriter._encodeValue(c)
          }
        } else {
          pieces.push(_ShExWriter._encodeValue(t));
        }
      });

      pieces.push("]");
    }

    if ('pattern' in v) {
      const pattern = v.pattern.
          replace(/\//g, "\\/");
      // if (ESCAPE_1.test(pattern))
      //   pattern = pattern.replace(ESCAPE_g, characterReplacer);
      const flags = 'flags' in v ? v.flags : "";
      pieces.push("/" + pattern + "/" + flags + " ");
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
    const prefixMatch = this._prefixRegex.exec(iri);
    return !prefixMatch
      ? this._relateUrl(iri)
      : (!prefixMatch[1]
         ? iri
         : this._prefixIRIs[prefixMatch[1]] + prefixMatch[2])
      + trailingSpace;
  },

  // ### ``
  _relateUrl: function (iri) {
    const base = this._baseIRI;
    try {
      if (base && new URL(base).host === new URL(iri).host) // https://github.com/stevenvachon/relateurl/issues/28
        iri = RelateUrl.relate(base, iri, { output: RelateUrl.ROOT_PATH_RELATIVE });
    } catch (e) {
      // invalid URL for e.g. already relative IMPORTs
    }
    return '<' + iri + '>';
  },

  // ### `_encodeLiteral` represents a literal
  _encodeLiteral: function (value, type, language) {
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
      _ShExWriter._encodeShapeName(name, false) +
        " " +
        _ShExWriter._writeShapeExpr(shape, done, true, 0).join(""),
      done
    );
  },

  // ### `addShapes` adds the shapes to the output stream
  addShapes: function (shapes) {
    for (let i = 0; i < shapes.length; i++)
      this.addShape(shapes[i]);
  },

  // ### `addPrefix` adds the prefix to the output stream
  addPrefix: function (prefix, iri, done) {
    const prefixes = {};
    prefixes[prefix] = iri;
    this.addPrefixes(prefixes, done);
  },

  // ### `addPrefixes` adds the prefixes to the output stream
  addPrefixes: function (prefixes, done) {
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
  },

  // ### `_prefixRegex` matches a prefixed name or IRI that begins with one of the added prefixes
  _prefixRegex: /$0^/,

  // ### `end` signals the end of the output stream
  end: function (done) {
    // Disallow further writing
    this._write = this._blockedWrite;

    // Try to end the underlying stream, ensuring done is called exactly one time
    let singleDone = done && function (error, result) { singleDone = null, done(error, result); };
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
  const e = new Error(str);
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

return ShExWriter;
})();

// Export the `ShExWriter` class as a whole.
if (true)
  module.exports = ShExWriterCjsModule; // node environment


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(863);
/******/ 	
/******/ })()
;