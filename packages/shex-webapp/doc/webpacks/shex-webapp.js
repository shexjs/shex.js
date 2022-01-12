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


var _parseUrl = __webpack_require__(883)/* .parse */ .Qc;



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
  ShapeMapJison = __webpack_require__(839)/* .Parser */ ._b; // node environment
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

  const $V0=[7,18,19,20,21,23,26,188,210,211],$V1=[1,25],$V2=[1,29],$V3=[1,24],$V4=[1,28],$V5=[1,27],$V6=[2,12],$V7=[2,13],$V8=[2,14],$V9=[7,18,19,20,21,23,26,210,211],$Va=[1,35],$Vb=[1,38],$Vc=[1,37],$Vd=[2,18],$Ve=[2,19],$Vf=[19,21,65,67,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,120,122,156,210],$Vg=[2,57],$Vh=[1,47],$Vi=[1,48],$Vj=[1,49],$Vk=[19,21,35,39,65,67,75,76,77,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,120,122,156,210],$Vl=[2,233],$Vm=[2,234],$Vn=[1,51],$Vo=[1,54],$Vp=[1,53],$Vq=[2,255],$Vr=[2,256],$Vs=[2,259],$Vt=[2,257],$Vu=[2,258],$Vv=[2,15],$Vw=[2,17],$Vx=[19,21,65,67,75,76,77,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,120,122,156,210],$Vy=[1,72],$Vz=[2,26],$VA=[2,27],$VB=[2,28],$VC=[115,120,122],$VD=[2,134],$VE=[1,98],$VF=[1,106],$VG=[1,84],$VH=[1,89],$VI=[1,90],$VJ=[1,91],$VK=[1,97],$VL=[1,102],$VM=[1,103],$VN=[1,104],$VO=[1,107],$VP=[1,108],$VQ=[1,109],$VR=[1,110],$VS=[1,111],$VT=[1,112],$VU=[1,94],$VV=[1,105],$VW=[2,58],$VX=[1,114],$VY=[1,115],$VZ=[1,116],$V_=[1,122],$V$=[1,123],$V01=[47,49],$V11=[2,87],$V21=[2,88],$V31=[188,190],$V41=[1,138],$V51=[1,141],$V61=[1,140],$V71=[2,16],$V81=[7,18,19,20,21,23,26,47,210,211],$V91=[2,43],$Va1=[7,18,19,20,21,23,26,47,49,210,211],$Vb1=[2,50],$Vc1=[2,32],$Vd1=[2,65],$Ve1=[2,70],$Vf1=[2,67],$Vg1=[1,175],$Vh1=[1,176],$Vi1=[1,177],$Vj1=[1,180],$Vk1=[1,183],$Vl1=[2,73],$Vm1=[7,18,19,20,21,23,26,47,49,75,76,77,115,120,122,185,188,210,211],$Vn1=[2,91],$Vo1=[7,18,19,20,21,23,26,47,49,185,188,210,211],$Vp1=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,185,188,210,211],$Vq1=[7,18,19,20,21,23,26,47,49,75,76,77,97,98,99,100,115,120,122,185,188,210,211],$Vr1=[2,104],$Vs1=[2,103],$Vt1=[7,18,19,20,21,23,26,47,49,97,98,99,100,108,109,110,111,112,113,185,188,210,211],$Vu1=[2,98],$Vv1=[2,97],$Vw1=[1,197],$Vx1=[1,198],$Vy1=[2,108],$Vz1=[2,109],$VA1=[2,110],$VB1=[2,106],$VC1=[2,232],$VD1=[19,21,67,77,96,104,105,158,180,199,200,201,202,203,204,205,206,207,208,210],$VE1=[2,178],$VF1=[7,18,19,20,21,23,26,47,49,108,109,110,111,112,113,185,188,210,211],$VG1=[2,100],$VH1=[2,114],$VI1=[1,206],$VJ1=[1,207],$VK1=[1,208],$VL1=[1,209],$VM1=[96,104,105,201,202,203,204],$VN1=[2,31],$VO1=[2,35],$VP1=[2,38],$VQ1=[2,41],$VR1=[2,89],$VS1=[2,224],$VT1=[2,225],$VU1=[2,226],$VV1=[1,257],$VW1=[1,262],$VX1=[1,243],$VY1=[1,248],$VZ1=[1,249],$V_1=[1,250],$V$1=[1,256],$V02=[1,253],$V12=[1,261],$V22=[1,264],$V32=[1,265],$V42=[1,266],$V52=[1,272],$V62=[1,273],$V72=[2,20],$V82=[2,49],$V92=[2,56],$Va2=[2,61],$Vb2=[2,64],$Vc2=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,210,211],$Vd2=[2,83],$Ve2=[2,84],$Vf2=[2,29],$Vg2=[2,33],$Vh2=[2,69],$Vi2=[2,66],$Vj2=[2,71],$Vk2=[2,68],$Vl2=[7,18,19,20,21,23,26,47,49,97,98,99,100,185,188,210,211],$Vm2=[1,318],$Vn2=[1,326],$Vo2=[1,327],$Vp2=[1,328],$Vq2=[1,334],$Vr2=[1,335],$Vs2=[7,18,19,20,21,23,26,47,49,75,76,77,115,120,122,188,210,211],$Vt2=[2,222],$Vu2=[7,18,19,20,21,23,26,47,49,188,210,211],$Vv2=[1,343],$Vw2=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,188,210,211],$Vx2=[2,102],$Vy2=[2,107],$Vz2=[2,94],$VA2=[1,353],$VB2=[2,95],$VC2=[2,96],$VD2=[2,101],$VE2=[19,21,65,155,194,210],$VF2=[2,162],$VG2=[2,136],$VH2=[1,368],$VI2=[1,367],$VJ2=[1,373],$VK2=[1,376],$VL2=[1,372],$VM2=[1,375],$VN2=[1,387],$VO2=[1,393],$VP2=[1,382],$VQ2=[1,386],$VR2=[1,396],$VS2=[1,397],$VT2=[1,398],$VU2=[1,385],$VV2=[1,399],$VW2=[1,400],$VX2=[1,405],$VY2=[1,406],$VZ2=[1,407],$V_2=[1,408],$V$2=[1,401],$V03=[1,402],$V13=[1,403],$V23=[1,404],$V33=[1,392],$V43=[2,113],$V53=[2,118],$V63=[2,120],$V73=[2,121],$V83=[2,122],$V93=[2,247],$Va3=[2,248],$Vb3=[2,249],$Vc3=[2,250],$Vd3=[2,119],$Ve3=[2,30],$Vf3=[2,39],$Vg3=[2,36],$Vh3=[2,42],$Vi3=[2,37],$Vj3=[1,440],$Vk3=[2,40],$Vl3=[1,476],$Vm3=[1,509],$Vn3=[1,510],$Vo3=[1,511],$Vp3=[1,514],$Vq3=[2,44],$Vr3=[2,51],$Vs3=[2,60],$Vt3=[2,62],$Vu3=[2,72],$Vv3=[47,49,66],$Vw3=[1,574],$Vx3=[47,49,66,75,76,77,115,120,122,185,188],$Vy3=[47,49,66,185,188],$Vz3=[47,49,66,92,93,94,97,98,99,100,185,188],$VA3=[47,49,66,75,76,77,97,98,99,100,115,120,122,185,188],$VB3=[47,49,66,97,98,99,100,108,109,110,111,112,113,185,188],$VC3=[47,49,66,108,109,110,111,112,113,185,188],$VD3=[47,66],$VE3=[7,18,19,20,21,23,26,47,49,75,76,77,115,120,122,210,211],$VF3=[2,93],$VG3=[2,92],$VH3=[2,221],$VI3=[1,616],$VJ3=[1,619],$VK3=[1,615],$VL3=[1,618],$VM3=[2,90],$VN3=[2,130],$VO3=[2,105],$VP3=[2,99],$VQ3=[2,111],$VR3=[2,112],$VS3=[2,141],$VT3=[2,142],$VU3=[1,636],$VV3=[2,143],$VW3=[117,130],$VX3=[2,148],$VY3=[2,149],$VZ3=[2,151],$V_3=[1,639],$V$3=[1,640],$V04=[19,21,194,210],$V14=[2,170],$V24=[1,648],$V34=[117,130,135,136],$V44=[2,160],$V54=[19,21,115,120,122,194,210],$V64=[2,230],$V74=[2,231],$V84=[2,177],$V94=[1,682],$Va4=[19,21,67,77,96,104,105,158,173,180,199,200,201,202,203,204,205,206,207,208,210],$Vb4=[2,227],$Vc4=[2,228],$Vd4=[2,229],$Ve4=[2,240],$Vf4=[2,243],$Vg4=[2,237],$Vh4=[2,238],$Vi4=[2,239],$Vj4=[2,245],$Vk4=[2,246],$Vl4=[2,251],$Vm4=[2,252],$Vn4=[2,253],$Vo4=[2,254],$Vp4=[19,21,67,77,96,104,105,107,158,173,180,199,200,201,202,203,204,205,206,207,208,210],$Vq4=[1,714],$Vr4=[1,761],$Vs4=[1,816],$Vt4=[1,826],$Vu4=[1,862],$Vv4=[1,898],$Vw4=[2,63],$Vx4=[47,49,66,97,98,99,100,185,188],$Vy4=[47,49,66,75,76,77,115,120,122,188],$Vz4=[47,49,66,188],$VA4=[1,920],$VB4=[47,49,66,92,93,94,97,98,99,100,188],$VC4=[1,930],$VD4=[1,967],$VE4=[1,1003],$VF4=[2,223],$VG4=[1,1014],$VH4=[1,1020],$VI4=[1,1019],$VJ4=[19,21,96,104,105,199,200,201,202,203,204,205,206,207,208,210],$VK4=[1,1040],$VL4=[1,1046],$VM4=[1,1045],$VN4=[1,1066],$VO4=[1,1072],$VP4=[1,1071],$VQ4=[2,131],$VR4=[2,144],$VS4=[2,146],$VT4=[2,150],$VU4=[2,152],$VV4=[2,153],$VW4=[2,157],$VX4=[2,159],$VY4=[2,164],$VZ4=[2,165],$V_4=[1,1098],$V$4=[1,1101],$V05=[1,1097],$V15=[1,1100],$V25=[1,1111],$V35=[2,217],$V45=[2,235],$V55=[2,236],$V65=[1,1113],$V75=[1,1115],$V85=[1,1117],$V95=[19,21,67,77,96,104,105,158,174,180,199,200,201,202,203,204,205,206,207,208,210],$Va5=[1,1121],$Vb5=[1,1127],$Vc5=[1,1130],$Vd5=[1,1131],$Ve5=[1,1132],$Vf5=[1,1120],$Vg5=[1,1133],$Vh5=[1,1134],$Vi5=[1,1139],$Vj5=[1,1140],$Vk5=[1,1141],$Vl5=[1,1142],$Vm5=[1,1135],$Vn5=[1,1136],$Vo5=[1,1137],$Vp5=[1,1138],$Vq5=[1,1126],$Vr5=[2,241],$Vs5=[2,244],$Vt5=[2,123],$Vu5=[1,1172],$Vv5=[1,1178],$Vw5=[1,1210],$Vx5=[1,1216],$Vy5=[1,1275],$Vz5=[1,1322],$VA5=[47,49,66,75,76,77,115,120,122],$VB5=[47,49,66,92,93,94,97,98,99,100],$VC5=[1,1398],$VD5=[1,1445],$VE5=[2,218],$VF5=[2,219],$VG5=[2,220],$VH5=[7,18,19,20,21,23,26,47,49,75,76,77,107,115,120,122,185,188,210,211],$VI5=[7,18,19,20,21,23,26,47,49,107,185,188,210,211],$VJ5=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,107,185,188,210,211],$VK5=[2,147],$VL5=[2,145],$VM5=[2,154],$VN5=[2,158],$VO5=[2,155],$VP5=[2,156],$VQ5=[19,21,39,65,67,75,76,77,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,120,122,156,210],$VR5=[1,1505],$VS5=[66,130],$VT5=[1,1508],$VU5=[1,1509],$VV5=[66,130,135,136],$VW5=[2,200],$VX5=[1,1525],$VY5=[19,21,67,77,96,104,105,158,173,174,180,199,200,201,202,203,204,205,206,207,208,210],$VZ5=[19,21,67,77,96,104,105,107,158,173,174,180,199,200,201,202,203,204,205,206,207,208,210],$V_5=[2,242],$V$5=[1,1563],$V06=[1,1629],$V16=[1,1635],$V26=[1,1634],$V36=[1,1655],$V46=[1,1661],$V56=[1,1660],$V66=[1,1681],$V76=[1,1687],$V86=[1,1686],$V96=[1,1728],$Va6=[1,1734],$Vb6=[1,1766],$Vc6=[1,1772],$Vd6=[1,1787],$Ve6=[1,1793],$Vf6=[1,1792],$Vg6=[1,1813],$Vh6=[1,1819],$Vi6=[1,1818],$Vj6=[1,1839],$Vk6=[1,1845],$Vl6=[1,1844],$Vm6=[1,1886],$Vn6=[1,1892],$Vo6=[1,1924],$Vp6=[1,1930],$Vq6=[117,130,135,136,185,188],$Vr6=[2,167],$Vs6=[1,1948],$Vt6=[1,1949],$Vu6=[1,1950],$Vv6=[1,1951],$Vw6=[117,130,135,136,151,152,153,154,185,188],$Vx6=[2,34],$Vy6=[47,117,130,135,136,151,152,153,154,185,188],$Vz6=[2,47],$VA6=[47,49,117,130,135,136,151,152,153,154,185,188],$VB6=[2,54],$VC6=[1,1980],$VD6=[1,2017],$VE6=[1,2050],$VF6=[1,2056],$VG6=[1,2055],$VH6=[1,2076],$VI6=[1,2082],$VJ6=[1,2081],$VK6=[1,2103],$VL6=[1,2109],$VM6=[1,2108],$VN6=[1,2130],$VO6=[1,2136],$VP6=[1,2135],$VQ6=[1,2156],$VR6=[1,2162],$VS6=[1,2161],$VT6=[1,2183],$VU6=[1,2189],$VV6=[1,2188],$VW6=[1,2258],$VX6=[47,49,66,75,76,77,107,115,120,122,185,188],$VY6=[47,49,66,107,185,188],$VZ6=[47,49,66,92,93,94,97,98,99,100,107,185,188],$V_6=[1,2372],$V$6=[2,168],$V07=[2,172],$V17=[2,173],$V27=[2,174],$V37=[2,175],$V47=[2,45],$V57=[2,52],$V67=[2,59],$V77=[2,79],$V87=[2,75],$V97=[2,81],$Va7=[1,2455],$Vb7=[2,78],$Vc7=[47,49,75,76,77,97,98,99,100,115,117,120,122,130,135,136,151,152,153,154,185,188],$Vd7=[47,49,75,76,77,115,117,120,122,130,135,136,151,152,153,154,185,188],$Ve7=[47,49,97,98,99,100,108,109,110,111,112,113,117,130,135,136,151,152,153,154,185,188],$Vf7=[47,49,92,93,94,97,98,99,100,117,130,135,136,151,152,153,154,185,188],$Vg7=[2,85],$Vh7=[2,86],$Vi7=[47,49,108,109,110,111,112,113,117,130,135,136,151,152,153,154,185,188],$Vj7=[1,2509],$Vk7=[1,2515],$Vl7=[1,2598],$Vm7=[1,2631],$Vn7=[1,2637],$Vo7=[1,2636],$Vp7=[1,2657],$Vq7=[1,2663],$Vr7=[1,2662],$Vs7=[1,2684],$Vt7=[1,2690],$Vu7=[1,2689],$Vv7=[1,2711],$Vw7=[1,2717],$Vx7=[1,2716],$Vy7=[1,2737],$Vz7=[1,2743],$VA7=[1,2742],$VB7=[1,2764],$VC7=[1,2770],$VD7=[1,2769],$VE7=[1,2811],$VF7=[1,2844],$VG7=[1,2850],$VH7=[1,2849],$VI7=[1,2870],$VJ7=[1,2876],$VK7=[1,2875],$VL7=[1,2897],$VM7=[1,2903],$VN7=[1,2902],$VO7=[1,2924],$VP7=[1,2930],$VQ7=[1,2929],$VR7=[1,2950],$VS7=[1,2956],$VT7=[1,2955],$VU7=[1,2977],$VV7=[1,2983],$VW7=[1,2982],$VX7=[117,130,135,136,188],$VY7=[1,3002],$VZ7=[2,48],$V_7=[2,55],$V$7=[2,74],$V08=[2,80],$V18=[2,76],$V28=[2,82],$V38=[47,49,97,98,99,100,117,130,135,136,151,152,153,154,185,188],$V48=[1,3026],$V58=[66,130,135,136,185,188],$V68=[1,3035],$V78=[1,3036],$V88=[1,3037],$V98=[1,3038],$Va8=[66,130,135,136,151,152,153,154,185,188],$Vb8=[47,66,130,135,136,151,152,153,154,185,188],$Vc8=[47,49,66,130,135,136,151,152,153,154,185,188],$Vd8=[1,3067],$Ve8=[1,3136],$Vf8=[1,3142],$Vg8=[1,3222],$Vh8=[1,3228],$Vi8=[2,169],$Vj8=[2,46],$Vk8=[1,3316],$Vl8=[2,53],$Vm8=[1,3349],$Vn8=[2,77],$Vo8=[2,166],$Vp8=[1,3394],$Vq8=[47,49,66,75,76,77,97,98,99,100,115,120,122,130,135,136,151,152,153,154,185,188],$Vr8=[47,49,66,75,76,77,115,120,122,130,135,136,151,152,153,154,185,188],$Vs8=[47,49,66,97,98,99,100,108,109,110,111,112,113,130,135,136,151,152,153,154,185,188],$Vt8=[47,49,66,92,93,94,97,98,99,100,130,135,136,151,152,153,154,185,188],$Vu8=[47,49,66,108,109,110,111,112,113,130,135,136,151,152,153,154,185,188],$Vv8=[1,3425],$Vw8=[1,3431],$Vx8=[1,3430],$Vy8=[1,3451],$Vz8=[1,3457],$VA8=[1,3456],$VB8=[1,3478],$VC8=[1,3484],$VD8=[1,3483],$VE8=[1,3582],$VF8=[1,3588],$VG8=[1,3587],$VH8=[1,3623],$VI8=[1,3665],$VJ8=[66,130,135,136,188],$VK8=[1,3695],$VL8=[47,49,66,97,98,99,100,130,135,136,151,152,153,154,185,188],$VM8=[1,3719],$VN8=[1,3755],$VO8=[1,3761],$VP8=[1,3760],$VQ8=[1,3781],$VR8=[1,3787],$VS8=[1,3786],$VT8=[1,3808],$VU8=[1,3814],$VV8=[1,3813],$VW8=[1,3835],$VX8=[1,3841],$VY8=[1,3840],$VZ8=[1,3861],$V_8=[1,3867],$V$8=[1,3866],$V09=[1,3888],$V19=[1,3894],$V29=[1,3893],$V39=[107,117,130,135,136,185,188],$V49=[1,3936],$V59=[1,3960],$V69=[1,4002],$V79=[1,4035],$V89=[1,4140],$V99=[1,4183],$Va9=[1,4189],$Vb9=[1,4188],$Vc9=[1,4224],$Vd9=[1,4266],$Ve9=[1,4322],$Vf9=[66,107,130,135,136,185,188],$Vg9=[1,4377],$Vh9=[1,4401],$Vi9=[1,4431],$Vj9=[1,4477],$Vk9=[1,4549],$Vl9=[1,4598];




  JisonParser.call(this, yy, lexer);


  this.symbols_ = {"error":2,"shexDoc":3,"initParser":4,"Qdirective_E_Star":5,"Q_O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C_E_Opt":6,"EOF":7,"directive":8,"O_QnotStartAction_E_Or_QstartActions_E_C":9,"notStartAction":10,"startActions":11,"Qstatement_E_Star":12,"statement":13,"O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C":14,"baseDecl":15,"prefixDecl":16,"importDecl":17,"IT_BASE":18,"IRIREF":19,"IT_PREFIX":20,"PNAME_NS":21,"iri":22,"IT_IMPORT":23,"start":24,"shapeExprDecl":25,"IT_start":26,"=":27,"shapeAnd":28,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Star":29,"QcodeDecl_E_Plus":30,"codeDecl":31,"shapeExprLabel":32,"O_QshapeExpression_E_Or_QIT_EXTERNAL_E_C":33,"shapeExpression":34,"IT_EXTERNAL":35,"QIT_NOT_E_Opt":36,"shapeAtomNoRef":37,"QshapeOr_E_Opt":38,"IT_NOT":39,"shapeRef":40,"shapeOr":41,"inlineShapeExpression":42,"inlineShapeOr":43,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Plus":44,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Plus":45,"O_QIT_OR_E_S_QshapeAnd_E_C":46,"IT_OR":47,"O_QIT_AND_E_S_QshapeNot_E_C":48,"IT_AND":49,"shapeNot":50,"inlineShapeAnd":51,"Q_O_QIT_OR_E_S_QinlineShapeAnd_E_C_E_Star":52,"O_QIT_OR_E_S_QinlineShapeAnd_E_C":53,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Star":54,"inlineShapeNot":55,"Q_O_QIT_AND_E_S_QinlineShapeNot_E_C_E_Star":56,"O_QIT_AND_E_S_QinlineShapeNot_E_C":57,"shapeAtom":58,"inlineShapeAtom":59,"nonLitNodeConstraint":60,"QshapeOrRef_E_Opt":61,"litNodeConstraint":62,"shapeOrRef":63,"QnonLitNodeConstraint_E_Opt":64,"(":65,")":66,".":67,"shapeDefinition":68,"nonLitInlineNodeConstraint":69,"QinlineShapeOrRef_E_Opt":70,"litInlineNodeConstraint":71,"inlineShapeOrRef":72,"QnonLitInlineNodeConstraint_E_Opt":73,"inlineShapeDefinition":74,"ATPNAME_LN":75,"ATPNAME_NS":76,"@":77,"Qannotation_E_Star":78,"semanticActions":79,"annotation":80,"IT_LITERAL":81,"QxsFacet_E_Star":82,"datatype":83,"valueSet":84,"QnumericFacet_E_Plus":85,"xsFacet":86,"numericFacet":87,"nonLiteralKind":88,"QstringFacet_E_Star":89,"QstringFacet_E_Plus":90,"stringFacet":91,"IT_IRI":92,"IT_BNODE":93,"IT_NONLITERAL":94,"stringLength":95,"INTEGER":96,"REGEXP":97,"IT_LENGTH":98,"IT_MINLENGTH":99,"IT_MAXLENGTH":100,"numericRange":101,"rawNumeric":102,"numericLength":103,"DECIMAL":104,"DOUBLE":105,"string":106,"^^":107,"IT_MININCLUSIVE":108,"IT_MINEXCLUSIVE":109,"IT_MAXINCLUSIVE":110,"IT_MAXEXCLUSIVE":111,"IT_TOTALDIGITS":112,"IT_FRACTIONDIGITS":113,"Q_QextraPropertySet_E_Or_QIT_CLOSED_E_C_E_Star":114,"{":115,"QtripleExpression_E_Opt":116,"}":117,"QextraPropertySet_E_Or_QIT_CLOSED_E_C":118,"extraPropertySet":119,"IT_CLOSED":120,"tripleExpression":121,"IT_EXTRA":122,"Qpredicate_E_Plus":123,"predicate":124,"oneOfTripleExpr":125,"groupTripleExpr":126,"multiElementOneOf":127,"Q_O_QGT_PIPE_E_S_QgroupTripleExpr_E_C_E_Plus":128,"O_QGT_PIPE_E_S_QgroupTripleExpr_E_C":129,"|":130,"singleElementGroup":131,"multiElementGroup":132,"unaryTripleExpr":133,"QGT_SEMI_E_Opt":134,",":135,";":136,"Q_O_QGT_SEMI_E_S_QunaryTripleExpr_E_C_E_Plus":137,"O_QGT_SEMI_E_S_QunaryTripleExpr_E_C":138,"Q_O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C_E_Opt":139,"O_QtripleConstraint_E_Or_QbracketedTripleExpr_E_C":140,"include":141,"O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C":142,"$":143,"tripleExprLabel":144,"tripleConstraint":145,"bracketedTripleExpr":146,"Qcardinality_E_Opt":147,"cardinality":148,"QsenseFlags_E_Opt":149,"senseFlags":150,"*":151,"+":152,"?":153,"REPEAT_RANGE":154,"^":155,"[":156,"QvalueSetValue_E_Star":157,"]":158,"valueSetValue":159,"iriRange":160,"literalRange":161,"languageRange":162,"O_QiriExclusion_E_Plus_Or_QliteralExclusion_E_Plus_Or_QlanguageExclusion_E_Plus_C":163,"QiriExclusion_E_Plus":164,"iriExclusion":165,"QliteralExclusion_E_Plus":166,"literalExclusion":167,"QlanguageExclusion_E_Plus":168,"languageExclusion":169,"Q_O_QGT_TILDE_E_S_QiriExclusion_E_Star_C_E_Opt":170,"QiriExclusion_E_Star":171,"O_QGT_TILDE_E_S_QiriExclusion_E_Star_C":172,"~":173,"-":174,"QGT_TILDE_E_Opt":175,"literal":176,"Q_O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C_E_Opt":177,"QliteralExclusion_E_Star":178,"O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C":179,"LANGTAG":180,"Q_O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C_E_Opt":181,"O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C":182,"QlanguageExclusion_E_Star":183,"&":184,"//":185,"O_Qiri_E_Or_Qliteral_E_C":186,"QcodeDecl_E_Star":187,"%":188,"O_QCODE_E_Or_QGT_MODULO_E_C":189,"CODE":190,"rdfLiteral":191,"numericLiteral":192,"booleanLiteral":193,"a":194,"blankNode":195,"langString":196,"Q_O_QGT_DTYPE_E_S_Qdatatype_E_C_E_Opt":197,"O_QGT_DTYPE_E_S_Qdatatype_E_C":198,"IT_true":199,"IT_false":200,"STRING_LITERAL1":201,"STRING_LITERAL_LONG1":202,"STRING_LITERAL2":203,"STRING_LITERAL_LONG2":204,"LANG_STRING_LITERAL1":205,"LANG_STRING_LITERAL_LONG1":206,"LANG_STRING_LITERAL2":207,"LANG_STRING_LITERAL_LONG2":208,"prefixedName":209,"PNAME_LN":210,"BLANK_NODE_LABEL":211,"O_QIT_EXTENDS_E_Or_QGT_AMP_E_C":212,"IT_EXTENDS":213,"$accept":0,"$end":1};
  this.terminals_ = {2:"error",7:"EOF",18:"IT_BASE",19:"IRIREF",20:"IT_PREFIX",21:"PNAME_NS",23:"IT_IMPORT",26:"IT_start",27:"=",35:"IT_EXTERNAL",39:"IT_NOT",47:"IT_OR",49:"IT_AND",65:"(",66:")",67:".",75:"ATPNAME_LN",76:"ATPNAME_NS",77:"@",81:"IT_LITERAL",92:"IT_IRI",93:"IT_BNODE",94:"IT_NONLITERAL",96:"INTEGER",97:"REGEXP",98:"IT_LENGTH",99:"IT_MINLENGTH",100:"IT_MAXLENGTH",104:"DECIMAL",105:"DOUBLE",107:"^^",108:"IT_MININCLUSIVE",109:"IT_MINEXCLUSIVE",110:"IT_MAXINCLUSIVE",111:"IT_MAXEXCLUSIVE",112:"IT_TOTALDIGITS",113:"IT_FRACTIONDIGITS",115:"{",117:"}",120:"IT_CLOSED",122:"IT_EXTRA",130:"|",135:",",136:";",143:"$",151:"*",152:"+",153:"?",154:"REPEAT_RANGE",155:"^",156:"[",158:"]",173:"~",174:"-",180:"LANGTAG",184:"&",185:"//",188:"%",190:"CODE",194:"a",199:"IT_true",200:"IT_false",201:"STRING_LITERAL1",202:"STRING_LITERAL_LONG1",203:"STRING_LITERAL2",204:"STRING_LITERAL_LONG2",205:"LANG_STRING_LITERAL1",206:"LANG_STRING_LITERAL_LONG1",207:"LANG_STRING_LITERAL2",208:"LANG_STRING_LITERAL_LONG2",210:"PNAME_LN",211:"BLANK_NODE_LABEL",213:"IT_EXTENDS"};
  this.productions_ = [0,[3,4],[4,0],[5,0],[5,2],[9,1],[9,1],[12,0],[12,2],[14,2],[6,0],[6,1],[8,1],[8,1],[8,1],[15,2],[16,3],[17,2],[10,1],[10,1],[24,4],[11,1],[30,1],[30,2],[13,1],[13,1],[25,2],[33,1],[33,1],[34,3],[34,3],[34,2],[38,0],[38,1],[42,1],[41,1],[41,2],[46,2],[44,1],[44,2],[48,2],[45,1],[45,2],[29,0],[29,2],[43,2],[53,2],[52,0],[52,2],[28,2],[54,0],[54,2],[51,2],[57,2],[56,0],[56,2],[50,2],[36,0],[36,1],[55,2],[58,2],[58,1],[58,2],[58,3],[58,1],[61,0],[61,1],[64,0],[64,1],[37,2],[37,1],[37,2],[37,3],[37,1],[59,2],[59,1],[59,2],[59,3],[59,1],[70,0],[70,1],[73,0],[73,1],[63,1],[63,1],[72,1],[72,1],[40,1],[40,1],[40,2],[62,3],[78,0],[78,2],[60,3],[71,2],[71,2],[71,2],[71,1],[82,0],[82,2],[85,1],[85,2],[69,2],[69,1],[89,0],[89,2],[90,1],[90,2],[88,1],[88,1],[88,1],[86,1],[86,1],[91,2],[91,1],[95,1],[95,1],[95,1],[87,2],[87,2],[102,1],[102,1],[102,1],[102,3],[101,1],[101,1],[101,1],[101,1],[103,1],[103,1],[68,3],[74,4],[118,1],[118,1],[114,0],[114,2],[116,0],[116,1],[119,2],[123,1],[123,2],[121,1],[125,1],[125,1],[127,2],[129,2],[128,1],[128,2],[126,1],[126,1],[131,2],[134,0],[134,1],[134,1],[132,3],[138,2],[138,2],[137,1],[137,2],[133,2],[133,1],[142,2],[139,0],[139,1],[140,1],[140,1],[146,6],[147,0],[147,1],[145,6],[149,0],[149,1],[148,1],[148,1],[148,1],[148,1],[150,1],[84,3],[157,0],[157,2],[159,1],[159,1],[159,1],[159,2],[164,1],[164,2],[166,1],[166,2],[168,1],[168,2],[163,1],[163,1],[163,1],[160,2],[171,0],[171,2],[172,2],[170,0],[170,1],[165,3],[175,0],[175,1],[161,2],[178,0],[178,2],[179,2],[177,0],[177,1],[167,3],[162,2],[162,2],[183,0],[183,2],[182,2],[181,0],[181,1],[169,3],[141,2],[80,3],[186,1],[186,1],[79,1],[187,0],[187,2],[31,3],[189,1],[189,1],[176,1],[176,1],[176,1],[124,1],[124,1],[83,1],[32,1],[32,1],[144,1],[144,1],[192,1],[192,1],[192,1],[191,1],[191,2],[198,2],[197,0],[197,1],[193,1],[193,1],[106,1],[106,1],[106,1],[106,1],[196,1],[196,1],[196,1],[196,1],[22,1],[22,1],[209,1],[209,1],[195,1],[212,1],[212,1]];
  this.table = [o($V0,[2,2],{3:1,4:2}),{1:[3]},o($V0,[2,3],{5:3}),{6:4,7:[2,10],8:5,9:10,10:14,11:15,14:6,15:7,16:8,17:9,18:[1,11],19:$V1,20:[1,12],21:$V2,22:22,23:[1,13],24:16,25:17,26:[1,19],30:18,31:21,32:20,188:$V3,195:23,209:26,210:$V4,211:$V5},{7:[1,30]},o($V0,[2,4]),{7:[2,11]},o($V0,$V6),o($V0,$V7),o($V0,$V8),o($V9,[2,7],{12:31}),{19:[1,32]},{21:[1,33]},{19:$Va,21:$Vb,22:34,209:36,210:$Vc},o($V9,[2,5]),o($V9,[2,6]),o($V9,$Vd),o($V9,$Ve),o($V9,[2,21],{31:39,188:$V3}),{27:[1,40]},o($Vf,$Vg,{33:41,34:42,36:44,40:46,35:[1,43],39:[1,45],75:$Vh,76:$Vi,77:$Vj}),o($V0,[2,22]),o($Vk,$Vl),o($Vk,$Vm),{19:$Vn,21:$Vo,22:50,209:52,210:$Vp},o($Vk,$Vq),o($Vk,$Vr),o($Vk,$Vs),o($Vk,$Vt),o($Vk,$Vu),{1:[2,1]},{7:[2,9],8:56,10:57,13:55,15:58,16:59,17:60,18:[1,63],19:$V1,20:[1,64],21:$V2,22:22,23:[1,65],24:61,25:62,26:[1,66],32:67,195:23,209:26,210:$V4,211:$V5},o($V0,$Vv),{19:$Va,21:$Vb,22:68,209:36,210:$Vc},o($V0,$Vw),o($V0,$Vq),o($V0,$Vr),o($V0,$Vt),o($V0,$Vu),o($V0,[2,23]),o($Vx,$Vg,{28:69,50:70,36:71,39:$Vy}),o($V9,$Vz),o($V9,$VA),o($V9,$VB),o($VC,$VD,{37:73,60:74,62:75,68:76,69:79,71:80,74:81,88:82,90:83,83:85,84:86,85:87,114:88,91:92,22:93,87:95,95:96,209:99,101:100,103:101,19:$VE,21:$VF,65:[1,77],67:[1,78],81:$VG,92:$VH,93:$VI,94:$VJ,97:$VK,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,156:$VU,210:$VV}),o($Vf,$VW,{40:113,75:$VX,76:$VY,77:$VZ}),{41:117,44:118,45:119,46:120,47:$V_,48:121,49:$V$},o($V01,$V11),o($V01,$V21),{19:[1,127],21:[1,131],22:125,32:124,195:126,209:128,210:[1,130],211:[1,129]},{188:[1,134],189:132,190:[1,133]},o($V31,$Vq),o($V31,$Vr),o($V31,$Vt),o($V31,$Vu),o($V9,[2,8]),o($V9,[2,24]),o($V9,[2,25]),o($V9,$V6),o($V9,$V7),o($V9,$V8),o($V9,$Vd),o($V9,$Ve),{19:[1,135]},{21:[1,136]},{19:$V41,21:$V51,22:137,209:139,210:$V61},{27:[1,142]},o($Vf,$Vg,{33:143,34:144,36:146,40:148,35:[1,145],39:[1,147],75:$Vh,76:$Vi,77:$Vj}),o($V0,$V71),o($V81,$V91,{29:149}),o($Va1,$Vb1,{54:150}),o($VC,$VD,{69:79,71:80,74:81,88:82,90:83,83:85,84:86,85:87,114:88,91:92,22:93,87:95,95:96,209:99,101:100,103:101,58:151,60:152,62:153,63:154,68:157,40:158,19:$VE,21:$VF,65:[1,155],67:[1,156],75:[1,159],76:[1,160],77:[1,161],81:$VG,92:$VH,93:$VI,94:$VJ,97:$VK,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,156:$VU,210:$VV}),o($Vx,$VW),o($V9,$Vc1,{44:118,45:119,46:120,48:121,38:162,41:163,47:$V_,49:$V$}),o($Va1,$Vd1,{61:164,63:165,68:166,40:167,74:168,114:169,75:$VX,76:$VY,77:$VZ,115:$VD,120:$VD,122:$VD}),o($Va1,$Ve1),o($Va1,$Vf1,{64:170,60:171,69:172,88:173,90:174,91:178,95:179,92:$Vg1,93:$Vh1,94:$Vi1,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{34:181,36:182,40:184,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vl1),o($Vm1,$Vn1,{78:185}),o($Vo1,$Vn1,{78:186}),o($Vp1,$Vn1,{78:187}),o($Vq1,$Vr1,{89:188}),o($Vm1,$Vs1,{95:96,91:189,97:$VK,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:190}),o($Vt1,$Vu1,{82:191}),o($Vt1,$Vu1,{82:192}),o($Vo1,$Vv1,{101:100,103:101,87:193,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),{115:[1,194],118:195,119:196,120:$Vw1,122:$Vx1},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{157:199}),o($VF1,$VG1),{96:[1,200]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,202],102:201,104:[1,203],105:[1,204],106:205,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,210]},{96:[2,115]},{96:[2,116]},{96:[2,117]},o($Vt1,$Vt),o($Vt1,$Vu),o($VM1,[2,124]),o($VM1,[2,125]),o($VM1,[2,126]),o($VM1,[2,127]),{96:[2,128]},{96:[2,129]},o($V9,$Vc1,{44:118,45:119,46:120,48:121,41:163,38:211,47:$V_,49:$V$}),o($Va1,$V11),o($Va1,$V21),{19:[1,215],21:[1,219],22:213,32:212,195:214,209:216,210:[1,218],211:[1,217]},o($V9,$VN1),o($V9,$VO1,{46:220,47:$V_}),o($V81,$V91,{29:221,48:222,49:$V$}),o($V81,$VP1),o($Va1,$VQ1),o($Vx,$Vg,{28:223,50:224,36:225,39:$Vy}),o($Vx,$Vg,{50:226,36:227,39:$Vy}),o($V01,$VR1),o($V01,$Vl),o($V01,$Vm),o($V01,$Vq),o($V01,$Vr),o($V01,$Vs),o($V01,$Vt),o($V01,$Vu),o($V0,$VS1),o($V0,$VT1),o($V0,$VU1),o($V9,$Vv),{19:$V41,21:$V51,22:228,209:139,210:$V61},o($V9,$Vw),o($V9,$Vq),o($V9,$Vr),o($V9,$Vt),o($V9,$Vu),o($Vx,$Vg,{28:229,50:230,36:231,39:$Vy}),o($V9,$Vz),o($V9,$VA),o($V9,$VB),o($VC,$VD,{37:232,60:233,62:234,68:235,69:238,71:239,74:240,88:241,90:242,83:244,84:245,85:246,114:247,91:251,22:252,87:254,95:255,209:258,101:259,103:260,19:$VV1,21:$VW1,65:[1,236],67:[1,237],81:$VX1,92:$VY1,93:$VZ1,94:$V_1,97:$V$1,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,156:$V02,210:$V12}),o($Vf,$VW,{40:263,75:$V22,76:$V32,77:$V42}),{41:267,44:268,45:269,46:270,47:$V52,48:271,49:$V62},o($V9,$V72,{46:274,47:$V_}),o($V81,$V82,{48:275,49:$V$}),o($Va1,$V92),o($Va1,$Vd1,{63:165,68:166,40:167,74:168,114:169,61:276,75:$VX,76:$VY,77:$VZ,115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{60:171,69:172,88:173,90:174,91:178,95:179,64:277,92:$Vg1,93:$Vh1,94:$Vi1,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:278,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vc2,$V11),o($Vc2,$V21),{19:[1,282],21:[1,286],22:280,32:279,195:281,209:283,210:[1,285],211:[1,284]},o($V9,$Vf2),o($V9,$Vg2),o($Va1,$Vh2),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:287}),{115:[1,288],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vj2),o($Va1,$Vk2),o($Vo1,$Vn1,{78:289}),o($Vl2,$Vr1,{89:290}),o($Vo1,$Vs1,{95:179,91:291,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,292]},o($Vl2,$VH1),{66:[1,293]},o($VC,$VD,{37:294,60:295,62:296,68:297,69:300,71:301,74:302,88:303,90:304,83:306,84:307,85:308,114:309,91:313,22:314,87:316,95:317,209:320,101:321,103:322,19:[1,319],21:[1,324],65:[1,298],67:[1,299],81:[1,305],92:[1,310],93:[1,311],94:[1,312],97:$Vm2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,156:[1,315],210:[1,323]}),o($Vf,$VW,{40:325,75:$Vn2,76:$Vo2,77:$Vp2}),{41:329,44:330,45:331,46:332,47:$Vq2,48:333,49:$Vr2},o($Vs2,$Vt2,{79:336,80:337,187:338,185:[1,339]}),o($Vu2,$Vt2,{79:340,80:341,187:342,185:$Vv2}),o($Vw2,$Vt2,{79:344,80:345,187:346,185:[1,347]}),o($Vm1,$Vx2,{95:96,91:348,97:$VK,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:349,91:350,87:351,95:352,101:354,103:355,97:$VA2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:349,91:350,87:351,95:352,101:354,103:355,97:$VA2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:349,91:350,87:351,95:352,101:354,103:355,97:$VA2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($VE2,$VF2,{116:356,121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,117:$VG2,143:$VH2,184:$VI2}),o($VC,[2,135]),o($VC,[2,132]),o($VC,[2,133]),{19:$VJ2,21:$VK2,22:371,123:369,124:370,194:$VL2,209:374,210:$VM2},{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,158:[1,377],159:378,160:379,161:380,162:381,176:384,180:$VU2,191:389,192:390,193:391,196:394,199:$VV2,200:$VW2,201:$VX2,202:$VY2,203:$VZ2,204:$V_2,205:$V$2,206:$V03,207:$V13,208:$V23,209:388,210:$V33},o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,409]},{107:$V93},{107:$Va3},{107:$Vb3},{107:$Vc3},o($VF1,$Vd3),o($V9,$Ve3),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($V81,$Vf3),o($V9,$Vg3,{46:274,47:$V_}),o($Va1,$Vh3),o($V81,$Vi3),o($Va1,$Vb1,{54:410}),o($VC,$VD,{58:411,60:412,62:413,63:414,69:417,71:418,68:419,40:420,88:421,90:422,83:424,84:425,85:426,74:427,91:434,22:435,87:437,114:438,95:439,209:442,101:443,103:444,19:[1,441],21:[1,446],65:[1,415],67:[1,416],75:[1,428],76:[1,429],77:[1,430],81:[1,423],92:[1,431],93:[1,432],94:[1,433],97:$Vj3,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,156:[1,436],210:[1,445]}),o($Va1,$Vk3),o($VC,$VD,{58:447,60:448,62:449,63:450,69:453,71:454,68:455,40:456,88:457,90:458,83:460,84:461,85:462,74:463,91:470,22:471,87:473,114:474,95:475,209:478,101:479,103:480,19:[1,477],21:[1,482],65:[1,451],67:[1,452],75:[1,464],76:[1,465],77:[1,466],81:[1,459],92:[1,467],93:[1,468],94:[1,469],97:$Vl3,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,156:[1,472],210:[1,481]}),o($V9,$V71),o($V81,$V91,{29:483}),o($Va1,$Vb1,{54:484}),o($VC,$VD,{69:238,71:239,74:240,88:241,90:242,83:244,84:245,85:246,114:247,91:251,22:252,87:254,95:255,209:258,101:259,103:260,58:485,60:486,62:487,63:488,68:491,40:492,19:$VV1,21:$VW1,65:[1,489],67:[1,490],75:[1,493],76:[1,494],77:[1,495],81:$VX1,92:$VY1,93:$VZ1,94:$V_1,97:$V$1,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,156:$V02,210:$V12}),o($V9,$Vc1,{44:268,45:269,46:270,48:271,38:496,41:497,47:$V52,49:$V62}),o($Va1,$Vd1,{61:498,63:499,68:500,40:501,74:502,114:503,75:$V22,76:$V32,77:$V42,115:$VD,120:$VD,122:$VD}),o($Va1,$Ve1),o($Va1,$Vf1,{64:504,60:505,69:506,88:507,90:508,91:512,95:513,92:$Vm3,93:$Vn3,94:$Vo3,97:$Vp3,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:515,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vl1),o($Vm1,$Vn1,{78:516}),o($Vo1,$Vn1,{78:517}),o($Vp1,$Vn1,{78:518}),o($Vq1,$Vr1,{89:519}),o($Vm1,$Vs1,{95:255,91:520,97:$V$1,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:521}),o($Vt1,$Vu1,{82:522}),o($Vt1,$Vu1,{82:523}),o($Vo1,$Vv1,{101:259,103:260,87:524,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),{115:[1,525],118:195,119:196,120:$Vw1,122:$Vx1},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{157:526}),o($VF1,$VG1),{96:[1,527]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,529],102:528,104:[1,530],105:[1,531],106:532,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,533]},o($Vt1,$Vt),o($Vt1,$Vu),o($V9,$Vc1,{44:268,45:269,46:270,48:271,41:497,38:534,47:$V52,49:$V62}),o($Va1,$V11),o($Va1,$V21),{19:[1,538],21:[1,542],22:536,32:535,195:537,209:539,210:[1,541],211:[1,540]},o($V9,$VN1),o($V9,$VO1,{46:543,47:$V52}),o($V81,$V91,{29:544,48:545,49:$V62}),o($V81,$VP1),o($Va1,$VQ1),o($Vx,$Vg,{28:546,50:547,36:548,39:$Vy}),o($Vx,$Vg,{50:549,36:550,39:$Vy}),o($V81,$Vq3),o($Va1,$Vr3),o($Va1,$Vs3),o($Va1,$Vt3),{66:[1,551]},o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),o($Vu2,$Vt2,{80:341,187:342,79:552,185:$Vv2}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:553,117:$VG2,143:$VH2,184:$VI2}),o($Vu2,$Vt2,{80:341,187:342,79:554,185:$Vv2}),o($Vo1,$Vx2,{95:179,91:555,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vu3),{38:556,41:557,44:330,45:331,46:332,47:$Vq2,48:333,49:$Vr2,66:$Vc1},o($Vv3,$Vd1,{61:558,63:559,68:560,40:561,74:562,114:563,75:$Vn2,76:$Vo2,77:$Vp2,115:$VD,120:$VD,122:$VD}),o($Vv3,$Ve1),o($Vv3,$Vf1,{64:564,60:565,69:566,88:567,90:568,91:572,95:573,92:[1,569],93:[1,570],94:[1,571],97:$Vw3,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:575,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vv3,$Vl1),o($Vx3,$Vn1,{78:576}),o($Vy3,$Vn1,{78:577}),o($Vz3,$Vn1,{78:578}),o($VA3,$Vr1,{89:579}),o($Vx3,$Vs1,{95:317,91:580,97:$Vm2,98:$VL,99:$VM,100:$VN}),o($VB3,$Vu1,{82:581}),o($VB3,$Vu1,{82:582}),o($VB3,$Vu1,{82:583}),o($Vy3,$Vv1,{101:321,103:322,87:584,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),{115:[1,585],118:195,119:196,120:$Vw1,122:$Vx1},o($VA3,$Vy1),o($VA3,$Vz1),o($VA3,$VA1),o($VA3,$VB1),o($VB3,$VC1),o($VD1,$VE1,{157:586}),o($VC3,$VG1),{96:[1,587]},o($VA3,$VH1),o($VB3,$Vq),o($VB3,$Vr),{96:[1,589],102:588,104:[1,590],105:[1,591],106:592,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,593]},o($VB3,$Vt),o($VB3,$Vu),{38:594,41:557,44:330,45:331,46:332,47:$Vq2,48:333,49:$Vr2,66:$Vc1},o($Vv3,$V11),o($Vv3,$V21),{19:[1,598],21:[1,602],22:596,32:595,195:597,209:599,210:[1,601],211:[1,600]},{66:$VN1},{46:603,47:$Vq2,66:$VO1},o($VD3,$V91,{29:604,48:605,49:$Vr2}),o($VD3,$VP1),o($Vv3,$VQ1),o($Vx,$Vg,{28:606,50:607,36:608,39:$Vy}),o($Vx,$Vg,{50:609,36:610,39:$Vy}),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:611,188:[1,612]}),{19:$VI3,21:$VJ3,22:614,124:613,194:$VK3,209:617,210:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:620,188:[1,621]}),{19:$VI3,21:$VJ3,22:614,124:622,194:$VK3,209:617,210:$VL3},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:623,188:[1,624]}),{19:$VI3,21:$VJ3,22:614,124:625,194:$VK3,209:617,210:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,626]},o($Vt1,$VH1),{96:[1,628],102:627,104:[1,629],105:[1,630],106:631,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,632]},{117:[1,633]},{117:[2,137]},{117:$VS3},{117:$VT3,128:634,129:635,130:$VU3},{117:$VV3},o($VW3,$VX3),o($VW3,$VY3),o($VW3,$VZ3,{134:637,137:638,138:641,135:$V_3,136:$V$3}),o($V04,$V14,{140:642,145:643,146:644,149:645,150:647,65:[1,646],155:$V24}),o($V34,$V44),o($VE2,[2,163]),{19:[1,652],21:[1,656],22:650,144:649,195:651,209:653,210:[1,655],211:[1,654]},{19:[1,660],21:[1,664],22:658,144:657,195:659,209:661,210:[1,663],211:[1,662]},o($VC,[2,138],{22:371,209:374,124:665,19:$VJ2,21:$VK2,194:$VL2,210:$VM2}),o($V54,[2,139]),o($V54,$V64),o($V54,$V74),o($V54,$Vq),o($V54,$Vr),o($V54,$Vt),o($V54,$Vu),o($Vt1,$V84),o($VD1,[2,179]),o($VD1,[2,180]),o($VD1,[2,181]),o($VD1,[2,182]),{163:666,164:667,165:670,166:668,167:671,168:669,169:672,174:[1,673]},o($VD1,[2,197],{170:674,172:675,173:[1,676]}),o($VD1,[2,206],{177:677,179:678,173:[1,679]}),o($VD1,[2,214],{181:680,182:681,173:$V94}),{173:$V94,182:683},o($Va4,$Vq),o($Va4,$Vr),o($Va4,$Vb4),o($Va4,$Vc4),o($Va4,$Vd4),o($Va4,$Vt),o($Va4,$Vu),o($Va4,$Ve4),o($Va4,$Vf4,{197:684,198:685,107:[1,686]}),o($Va4,$Vg4),o($Va4,$Vh4),o($Va4,$Vi4),o($Va4,$Vj4),o($Va4,$Vk4),o($Va4,$Vl4),o($Va4,$Vm4),o($Va4,$Vn4),o($Va4,$Vo4),o($Vp4,$V93),o($Vp4,$Va3),o($Vp4,$Vb3),o($Vp4,$Vc3),{19:[1,689],21:[1,692],22:688,83:687,209:690,210:[1,691]},o($V81,$V82,{48:693,49:[1,694]}),o($Va1,$V92),o($Va1,$Vd1,{61:695,63:696,68:697,40:698,74:699,114:703,75:[1,700],76:[1,701],77:[1,702],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:704,60:705,69:706,88:707,90:708,91:712,95:713,92:[1,709],93:[1,710],94:[1,711],97:$Vq4,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:715,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:716}),o($Vo1,$Vn1,{78:717}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:718}),o($Vm1,$Vs1,{95:439,91:719,97:$Vj3,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:720}),o($Vt1,$Vu1,{82:721}),o($Vt1,$Vu1,{82:722}),o($Vo1,$Vv1,{101:443,103:444,87:723,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:724}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,728],21:[1,732],22:726,32:725,195:727,209:729,210:[1,731],211:[1,730]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{157:733}),o($VF1,$VG1),{115:[1,734],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,735]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,737],102:736,104:[1,738],105:[1,739],106:740,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,741]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$V92),o($Va1,$Vd1,{61:742,63:743,68:744,40:745,74:746,114:750,75:[1,747],76:[1,748],77:[1,749],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:751,60:752,69:753,88:754,90:755,91:759,95:760,92:[1,756],93:[1,757],94:[1,758],97:$Vr4,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:762,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:763}),o($Vo1,$Vn1,{78:764}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:765}),o($Vm1,$Vs1,{95:475,91:766,97:$Vl3,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:767}),o($Vt1,$Vu1,{82:768}),o($Vt1,$Vu1,{82:769}),o($Vo1,$Vv1,{101:479,103:480,87:770,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:771}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,775],21:[1,779],22:773,32:772,195:774,209:776,210:[1,778],211:[1,777]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{157:780}),o($VF1,$VG1),{115:[1,781],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,782]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,784],102:783,104:[1,785],105:[1,786],106:787,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,788]},o($Vt1,$Vt),o($Vt1,$Vu),o($V9,$V72,{46:789,47:$V52}),o($V81,$V82,{48:790,49:$V62}),o($Va1,$V92),o($Va1,$Vd1,{63:499,68:500,40:501,74:502,114:503,61:791,75:$V22,76:$V32,77:$V42,115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{60:505,69:506,88:507,90:508,91:512,95:513,64:792,92:$Vm3,93:$Vn3,94:$Vo3,97:$Vp3,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:793,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vc2,$V11),o($Vc2,$V21),{19:[1,797],21:[1,801],22:795,32:794,195:796,209:798,210:[1,800],211:[1,799]},o($V9,$Vf2),o($V9,$Vg2),o($Va1,$Vh2),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:802}),{115:[1,803],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vj2),o($Va1,$Vk2),o($Vo1,$Vn1,{78:804}),o($Vl2,$Vr1,{89:805}),o($Vo1,$Vs1,{95:513,91:806,97:$Vp3,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,807]},o($Vl2,$VH1),{66:[1,808]},o($Vs2,$Vt2,{79:809,80:810,187:811,185:[1,812]}),o($Vu2,$Vt2,{79:813,80:814,187:815,185:$Vs4}),o($Vw2,$Vt2,{79:817,80:818,187:819,185:[1,820]}),o($Vm1,$Vx2,{95:255,91:821,97:$V$1,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:822,91:823,87:824,95:825,101:827,103:828,97:$Vt4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:822,91:823,87:824,95:825,101:827,103:828,97:$Vt4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:822,91:823,87:824,95:825,101:827,103:828,97:$Vt4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:829,117:$VG2,143:$VH2,184:$VI2}),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,158:[1,830],159:378,160:379,161:380,162:381,176:384,180:$VU2,191:389,192:390,193:391,196:394,199:$VV2,200:$VW2,201:$VX2,202:$VY2,203:$VZ2,204:$V_2,205:$V$2,206:$V03,207:$V13,208:$V23,209:388,210:$V33},o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,831]},o($VF1,$Vd3),o($V9,$Ve3),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($V81,$Vf3),o($V9,$Vg3,{46:789,47:$V52}),o($Va1,$Vh3),o($V81,$Vi3),o($Va1,$Vb1,{54:832}),o($VC,$VD,{58:833,60:834,62:835,63:836,69:839,71:840,68:841,40:842,88:843,90:844,83:846,84:847,85:848,74:849,91:856,22:857,87:859,114:860,95:861,209:864,101:865,103:866,19:[1,863],21:[1,868],65:[1,837],67:[1,838],75:[1,850],76:[1,851],77:[1,852],81:[1,845],92:[1,853],93:[1,854],94:[1,855],97:$Vu4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,156:[1,858],210:[1,867]}),o($Va1,$Vk3),o($VC,$VD,{58:869,60:870,62:871,63:872,69:875,71:876,68:877,40:878,88:879,90:880,83:882,84:883,85:884,74:885,91:892,22:893,87:895,114:896,95:897,209:900,101:901,103:902,19:[1,899],21:[1,904],65:[1,873],67:[1,874],75:[1,886],76:[1,887],77:[1,888],81:[1,881],92:[1,889],93:[1,890],94:[1,891],97:$Vv4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,156:[1,894],210:[1,903]}),o($Va1,$Vw4),o($Va1,$VN3),{117:[1,905]},o($Va1,$VF3),o($Vl2,$VO3),{66:$Vf2},{66:$Vg2},o($Vv3,$Vh2),o($Vv3,$Vi2),o($Vv3,$Vd2),o($Vv3,$Ve2),o($Vy3,$Vn1,{78:906}),{115:[1,907],118:195,119:196,120:$Vw1,122:$Vx1},o($Vv3,$Vj2),o($Vv3,$Vk2),o($Vy3,$Vn1,{78:908}),o($Vx4,$Vr1,{89:909}),o($Vy3,$Vs1,{95:573,91:910,97:$Vw3,98:$VL,99:$VM,100:$VN}),o($Vx4,$Vy1),o($Vx4,$Vz1),o($Vx4,$VA1),o($Vx4,$VB1),{96:[1,911]},o($Vx4,$VH1),{66:[1,912]},o($Vy4,$Vt2,{79:913,80:914,187:915,185:[1,916]}),o($Vz4,$Vt2,{79:917,80:918,187:919,185:$VA4}),o($VB4,$Vt2,{79:921,80:922,187:923,185:[1,924]}),o($Vx3,$Vx2,{95:317,91:925,97:$Vm2,98:$VL,99:$VM,100:$VN}),o($VA3,$Vy2),o($Vy3,$Vz2,{86:926,91:927,87:928,95:929,101:931,103:932,97:$VC4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VB2,{86:926,91:927,87:928,95:929,101:931,103:932,97:$VC4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VC2,{86:926,91:927,87:928,95:929,101:931,103:932,97:$VC4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VC3,$VD2),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:933,117:$VG2,143:$VH2,184:$VI2}),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,158:[1,934],159:378,160:379,161:380,162:381,176:384,180:$VU2,191:389,192:390,193:391,196:394,199:$VV2,200:$VW2,201:$VX2,202:$VY2,203:$VZ2,204:$V_2,205:$V$2,206:$V03,207:$V13,208:$V23,209:388,210:$V33},o($VA3,$V43),o($VC3,$V53),o($VC3,$V63),o($VC3,$V73),o($VC3,$V83),{107:[1,935]},o($VC3,$Vd3),{66:$Ve3},o($Vv3,$VR1),o($Vv3,$Vl),o($Vv3,$Vm),o($Vv3,$Vq),o($Vv3,$Vr),o($Vv3,$Vs),o($Vv3,$Vt),o($Vv3,$Vu),o($VD3,$Vf3),{46:936,47:$Vq2,66:$Vg3},o($Vv3,$Vh3),o($VD3,$Vi3),o($Vv3,$Vb1,{54:937}),o($VC,$VD,{58:938,60:939,62:940,63:941,69:944,71:945,68:946,40:947,88:948,90:949,83:951,84:952,85:953,74:954,91:961,22:962,87:964,114:965,95:966,209:969,101:970,103:971,19:[1,968],21:[1,973],65:[1,942],67:[1,943],75:[1,955],76:[1,956],77:[1,957],81:[1,950],92:[1,958],93:[1,959],94:[1,960],97:$VD4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,156:[1,963],210:[1,972]}),o($Vv3,$Vk3),o($VC,$VD,{58:974,60:975,62:976,63:977,69:980,71:981,68:982,40:983,88:984,90:985,83:987,84:988,85:989,74:990,91:997,22:998,87:1000,114:1001,95:1002,209:1005,101:1006,103:1007,19:[1,1004],21:[1,1009],65:[1,978],67:[1,979],75:[1,991],76:[1,992],77:[1,993],81:[1,986],92:[1,994],93:[1,995],94:[1,996],97:$VE4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,156:[1,999],210:[1,1008]}),o($Vs2,$VF4),{19:$Vn,21:$Vo,22:1010,209:52,210:$Vp},{19:$VG4,21:$VH4,22:1012,96:[1,1023],104:[1,1024],105:[1,1025],106:1022,176:1013,186:1011,191:1016,192:1017,193:1018,196:1021,199:[1,1026],200:[1,1027],201:[1,1032],202:[1,1033],203:[1,1034],204:[1,1035],205:[1,1028],206:[1,1029],207:[1,1030],208:[1,1031],209:1015,210:$VI4},o($VJ4,$V64),o($VJ4,$V74),o($VJ4,$Vq),o($VJ4,$Vr),o($VJ4,$Vt),o($VJ4,$Vu),o($Vu2,$VF4),{19:$Vn,21:$Vo,22:1036,209:52,210:$Vp},{19:$VK4,21:$VL4,22:1038,96:[1,1049],104:[1,1050],105:[1,1051],106:1048,176:1039,186:1037,191:1042,192:1043,193:1044,196:1047,199:[1,1052],200:[1,1053],201:[1,1058],202:[1,1059],203:[1,1060],204:[1,1061],205:[1,1054],206:[1,1055],207:[1,1056],208:[1,1057],209:1041,210:$VM4},o($Vw2,$VF4),{19:$Vn,21:$Vo,22:1062,209:52,210:$Vp},{19:$VN4,21:$VO4,22:1064,96:[1,1075],104:[1,1076],105:[1,1077],106:1074,176:1065,186:1063,191:1068,192:1069,193:1070,196:1073,199:[1,1078],200:[1,1079],201:[1,1084],202:[1,1085],203:[1,1086],204:[1,1087],205:[1,1080],206:[1,1081],207:[1,1082],208:[1,1083],209:1067,210:$VP4},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,1088]},o($Vt1,$Vd3),o($Vp1,$VQ4),{117:$VR4,129:1089,130:$VU3},o($VW3,$VS4),o($VE2,$VF2,{131:361,132:362,133:363,139:364,141:365,142:366,126:1090,143:$VH2,184:$VI2}),o($VW3,$VT4),o($VW3,$VZ3,{134:1091,138:1092,135:$V_3,136:$V$3}),o($VE2,$VF2,{139:364,141:365,142:366,133:1093,117:$VU4,130:$VU4,143:$VH2,184:$VI2}),o($VE2,$VF2,{139:364,141:365,142:366,133:1094,117:$VV4,130:$VV4,143:$VH2,184:$VI2}),o($V34,$VW4),o($V34,$VX4),o($V34,$VY4),o($V34,$VZ4),{19:$V_4,21:$V$4,22:1096,124:1095,194:$V05,209:1099,210:$V15},o($VE2,$VF2,{142:366,121:1102,125:1103,126:1104,127:1105,131:1106,132:1107,133:1108,139:1109,141:1110,143:$VH2,184:$V25}),o($V04,[2,171]),o($V04,[2,176]),o($V34,$V35),o($V34,$V45),o($V34,$V55),o($V34,$Vq),o($V34,$Vr),o($V34,$Vs),o($V34,$Vt),o($V34,$Vu),o($VE2,[2,161]),o($VE2,$V45),o($VE2,$V55),o($VE2,$Vq),o($VE2,$Vr),o($VE2,$Vs),o($VE2,$Vt),o($VE2,$Vu),o($V54,[2,140]),o($VD1,[2,183]),o($VD1,[2,190],{165:1112,174:$V65}),o($VD1,[2,191],{167:1114,174:$V75}),o($VD1,[2,192],{169:1116,174:$V85}),o($V95,[2,184]),o($V95,[2,186]),o($V95,[2,188]),{19:$Va5,21:$Vb5,22:1118,96:$Vc5,104:$Vd5,105:$Ve5,106:1129,176:1119,180:$Vf5,191:1123,192:1124,193:1125,196:1128,199:$Vg5,200:$Vh5,201:$Vi5,202:$Vj5,203:$Vk5,204:$Vl5,205:$Vm5,206:$Vn5,207:$Vo5,208:$Vp5,209:1122,210:$Vq5},o($VD1,[2,193]),o($VD1,[2,198]),o($V95,[2,194],{171:1143}),o($VD1,[2,202]),o($VD1,[2,207]),o($V95,[2,203],{178:1144}),o($VD1,[2,209]),o($VD1,[2,215]),o($V95,[2,211],{183:1145}),o($VD1,[2,210]),o($Va4,$Vr5),o($Va4,$Vs5),{19:$VN2,21:$VO2,22:1147,83:1146,209:388,210:$V33},o($VF1,$Vt5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Va1,$Vr3),o($Vx,$Vg,{50:1148,36:1149,39:$Vy}),o($Va1,$Vs3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:1150}),o($Va1,$V11),o($Va1,$V21),{19:[1,1154],21:[1,1158],22:1152,32:1151,195:1153,209:1155,210:[1,1157],211:[1,1156]},{115:[1,1159],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vt3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:1160}),o($Vl2,$Vr1,{89:1161}),o($Vo1,$Vs1,{95:713,91:1162,97:$Vq4,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,1163]},o($Vl2,$VH1),{66:[1,1164]},o($Vs2,$Vt2,{79:1165,80:1166,187:1167,185:[1,1168]}),o($Vu2,$Vt2,{79:1169,80:1170,187:1171,185:$Vu5}),o($Vm1,$Vx2,{95:439,91:1173,97:$Vj3,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:1174,91:1175,87:1176,95:1177,101:1179,103:1180,97:$Vv5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:1174,91:1175,87:1176,95:1177,101:1179,103:1180,97:$Vv5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:1174,91:1175,87:1176,95:1177,101:1179,103:1180,97:$Vv5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:1181,80:1182,187:1183,185:[1,1184]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,158:[1,1185],159:378,160:379,161:380,162:381,176:384,180:$VU2,191:389,192:390,193:391,196:394,199:$VV2,200:$VW2,201:$VX2,202:$VY2,203:$VZ2,204:$V_2,205:$V$2,206:$V03,207:$V13,208:$V23,209:388,210:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1186,117:$VG2,143:$VH2,184:$VI2}),o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,1187]},o($VF1,$Vd3),o($Va1,$Vs3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:1188}),o($Va1,$V11),o($Va1,$V21),{19:[1,1192],21:[1,1196],22:1190,32:1189,195:1191,209:1193,210:[1,1195],211:[1,1194]},{115:[1,1197],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vt3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:1198}),o($Vl2,$Vr1,{89:1199}),o($Vo1,$Vs1,{95:760,91:1200,97:$Vr4,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,1201]},o($Vl2,$VH1),{66:[1,1202]},o($Vs2,$Vt2,{79:1203,80:1204,187:1205,185:[1,1206]}),o($Vu2,$Vt2,{79:1207,80:1208,187:1209,185:$Vw5}),o($Vm1,$Vx2,{95:475,91:1211,97:$Vl3,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:1212,91:1213,87:1214,95:1215,101:1217,103:1218,97:$Vx5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:1212,91:1213,87:1214,95:1215,101:1217,103:1218,97:$Vx5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:1212,91:1213,87:1214,95:1215,101:1217,103:1218,97:$Vx5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:1219,80:1220,187:1221,185:[1,1222]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,158:[1,1223],159:378,160:379,161:380,162:381,176:384,180:$VU2,191:389,192:390,193:391,196:394,199:$VV2,200:$VW2,201:$VX2,202:$VY2,203:$VZ2,204:$V_2,205:$V$2,206:$V03,207:$V13,208:$V23,209:388,210:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1224,117:$VG2,143:$VH2,184:$VI2}),o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,1225]},o($VF1,$Vd3),o($V81,$Vq3),o($Va1,$Vr3),o($Va1,$Vs3),o($Va1,$Vt3),{66:[1,1226]},o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),o($Vu2,$Vt2,{80:814,187:815,79:1227,185:$Vs4}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1228,117:$VG2,143:$VH2,184:$VI2}),o($Vu2,$Vt2,{80:814,187:815,79:1229,185:$Vs4}),o($Vo1,$Vx2,{95:513,91:1230,97:$Vp3,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vu3),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:1231,188:[1,1232]}),{19:$VI3,21:$VJ3,22:614,124:1233,194:$VK3,209:617,210:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:1234,188:[1,1235]}),{19:$VI3,21:$VJ3,22:614,124:1236,194:$VK3,209:617,210:$VL3},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:1237,188:[1,1238]}),{19:$VI3,21:$VJ3,22:614,124:1239,194:$VK3,209:617,210:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,1240]},o($Vt1,$VH1),{96:[1,1242],102:1241,104:[1,1243],105:[1,1244],106:1245,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,1246]},{117:[1,1247]},o($Vt1,$V84),{19:[1,1250],21:[1,1253],22:1249,83:1248,209:1251,210:[1,1252]},o($V81,$V82,{48:1254,49:[1,1255]}),o($Va1,$V92),o($Va1,$Vd1,{61:1256,63:1257,68:1258,40:1259,74:1260,114:1264,75:[1,1261],76:[1,1262],77:[1,1263],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:1265,60:1266,69:1267,88:1268,90:1269,91:1273,95:1274,92:[1,1270],93:[1,1271],94:[1,1272],97:$Vy5,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1276,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:1277}),o($Vo1,$Vn1,{78:1278}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:1279}),o($Vm1,$Vs1,{95:861,91:1280,97:$Vu4,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:1281}),o($Vt1,$Vu1,{82:1282}),o($Vt1,$Vu1,{82:1283}),o($Vo1,$Vv1,{101:865,103:866,87:1284,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:1285}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,1289],21:[1,1293],22:1287,32:1286,195:1288,209:1290,210:[1,1292],211:[1,1291]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{157:1294}),o($VF1,$VG1),{115:[1,1295],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,1296]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,1298],102:1297,104:[1,1299],105:[1,1300],106:1301,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,1302]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$V92),o($Va1,$Vd1,{61:1303,63:1304,68:1305,40:1306,74:1307,114:1311,75:[1,1308],76:[1,1309],77:[1,1310],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:1312,60:1313,69:1314,88:1315,90:1316,91:1320,95:1321,92:[1,1317],93:[1,1318],94:[1,1319],97:$Vz5,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1323,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:1324}),o($Vo1,$Vn1,{78:1325}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:1326}),o($Vm1,$Vs1,{95:897,91:1327,97:$Vv4,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:1328}),o($Vt1,$Vu1,{82:1329}),o($Vt1,$Vu1,{82:1330}),o($Vo1,$Vv1,{101:901,103:902,87:1331,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:1332}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,1336],21:[1,1340],22:1334,32:1333,195:1335,209:1337,210:[1,1339],211:[1,1338]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{157:1341}),o($VF1,$VG1),{115:[1,1342],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,1343]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,1345],102:1344,104:[1,1346],105:[1,1347],106:1348,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,1349]},o($Vt1,$Vt),o($Vt1,$Vu),o($Vo1,$VQ4),o($Vz4,$Vt2,{80:918,187:919,79:1350,185:$VA4}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1351,117:$VG2,143:$VH2,184:$VI2}),o($Vz4,$Vt2,{80:918,187:919,79:1352,185:$VA4}),o($Vy3,$Vx2,{95:573,91:1353,97:$Vw3,98:$VL,99:$VM,100:$VN}),o($Vx4,$Vy2),o($Vx4,$V43),o($Vv3,$Vu3),o($VA5,$VF3),o($Vx3,$VG3),o($VA5,$VH3,{31:1354,188:[1,1355]}),{19:$VI3,21:$VJ3,22:614,124:1356,194:$VK3,209:617,210:$VL3},o($Vv3,$VM3),o($Vy3,$VG3),o($Vv3,$VH3,{31:1357,188:[1,1358]}),{19:$VI3,21:$VJ3,22:614,124:1359,194:$VK3,209:617,210:$VL3},o($VB5,$VN3),o($Vz3,$VG3),o($VB5,$VH3,{31:1360,188:[1,1361]}),{19:$VI3,21:$VJ3,22:614,124:1362,194:$VK3,209:617,210:$VL3},o($VA3,$VO3),o($VB3,$VP3),o($VB3,$VQ3),o($VB3,$VR3),{96:[1,1363]},o($VB3,$VH1),{96:[1,1365],102:1364,104:[1,1366],105:[1,1367],106:1368,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,1369]},{117:[1,1370]},o($VB3,$V84),{19:[1,1373],21:[1,1376],22:1372,83:1371,209:1374,210:[1,1375]},o($VD3,$Vq3),o($VD3,$V82,{48:1377,49:[1,1378]}),o($Vv3,$V92),o($Vv3,$Vd1,{61:1379,63:1380,68:1381,40:1382,74:1383,114:1387,75:[1,1384],76:[1,1385],77:[1,1386],115:$VD,120:$VD,122:$VD}),o($Vv3,$Va2),o($Vv3,$Vf1,{64:1388,60:1389,69:1390,88:1391,90:1392,91:1396,95:1397,92:[1,1393],93:[1,1394],94:[1,1395],97:$VC5,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1399,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vv3,$Vb2),o($Vx3,$Vn1,{78:1400}),o($Vy3,$Vn1,{78:1401}),o($VB5,$Vd2),o($VB5,$Ve2),o($VA3,$Vr1,{89:1402}),o($Vx3,$Vs1,{95:966,91:1403,97:$VD4,98:$VL,99:$VM,100:$VN}),o($VB3,$Vu1,{82:1404}),o($VB3,$Vu1,{82:1405}),o($VB3,$Vu1,{82:1406}),o($Vy3,$Vv1,{101:970,103:971,87:1407,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vz3,$Vn1,{78:1408}),o($VB5,$V11),o($VB5,$V21),{19:[1,1412],21:[1,1416],22:1410,32:1409,195:1411,209:1413,210:[1,1415],211:[1,1414]},o($VA3,$Vy1),o($VA3,$Vz1),o($VA3,$VA1),o($VA3,$VB1),o($VB3,$VC1),o($VD1,$VE1,{157:1417}),o($VC3,$VG1),{115:[1,1418],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,1419]},o($VA3,$VH1),o($VB3,$Vq),o($VB3,$Vr),{96:[1,1421],102:1420,104:[1,1422],105:[1,1423],106:1424,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,1425]},o($VB3,$Vt),o($VB3,$Vu),o($Vv3,$V92),o($Vv3,$Vd1,{61:1426,63:1427,68:1428,40:1429,74:1430,114:1434,75:[1,1431],76:[1,1432],77:[1,1433],115:$VD,120:$VD,122:$VD}),o($Vv3,$Va2),o($Vv3,$Vf1,{64:1435,60:1436,69:1437,88:1438,90:1439,91:1443,95:1444,92:[1,1440],93:[1,1441],94:[1,1442],97:$VD5,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1446,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vv3,$Vb2),o($Vx3,$Vn1,{78:1447}),o($Vy3,$Vn1,{78:1448}),o($VB5,$Vd2),o($VB5,$Ve2),o($VA3,$Vr1,{89:1449}),o($Vx3,$Vs1,{95:1002,91:1450,97:$VE4,98:$VL,99:$VM,100:$VN}),o($VB3,$Vu1,{82:1451}),o($VB3,$Vu1,{82:1452}),o($VB3,$Vu1,{82:1453}),o($Vy3,$Vv1,{101:1006,103:1007,87:1454,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vz3,$Vn1,{78:1455}),o($VB5,$V11),o($VB5,$V21),{19:[1,1459],21:[1,1463],22:1457,32:1456,195:1458,209:1460,210:[1,1462],211:[1,1461]},o($VA3,$Vy1),o($VA3,$Vz1),o($VA3,$VA1),o($VA3,$VB1),o($VB3,$VC1),o($VD1,$VE1,{157:1464}),o($VC3,$VG1),{115:[1,1465],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,1466]},o($VA3,$VH1),o($VB3,$Vq),o($VB3,$Vr),{96:[1,1468],102:1467,104:[1,1469],105:[1,1470],106:1471,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,1472]},o($VB3,$Vt),o($VB3,$Vu),{188:[1,1475],189:1473,190:[1,1474]},o($Vm1,$VE5),o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vb4),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Ve4),o($Vm1,$Vf4,{197:1476,198:1477,107:[1,1478]}),o($Vm1,$Vg4),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($VH5,$V93),o($VH5,$Va3),o($VH5,$Vb3),o($VH5,$Vc3),{188:[1,1481],189:1479,190:[1,1480]},o($Vo1,$VE5),o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vb4),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Ve4),o($Vo1,$Vf4,{197:1482,198:1483,107:[1,1484]}),o($Vo1,$Vg4),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{188:[1,1487],189:1485,190:[1,1486]},o($Vp1,$VE5),o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vb4),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Ve4),o($Vp1,$Vf4,{197:1488,198:1489,107:[1,1490]}),o($Vp1,$Vg4),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),{19:[1,1493],21:[1,1496],22:1492,83:1491,209:1494,210:[1,1495]},o($VW3,$VK5),o($VW3,$VL5),o($VW3,$VM5),o($V34,$VN5),o($V34,$VO5),o($V34,$VP5),o($Vx,$Vg,{42:1497,43:1498,51:1499,55:1500,36:1501,39:$Vy}),o($VQ5,$V64),o($VQ5,$V74),o($VQ5,$Vq),o($VQ5,$Vr),o($VQ5,$Vt),o($VQ5,$Vu),{66:[1,1502]},{66:$VS3},{66:$VT3,128:1503,129:1504,130:$VR5},{66:$VV3},o($VS5,$VX3),o($VS5,$VY3),o($VS5,$VZ3,{134:1506,137:1507,138:1510,135:$VT5,136:$VU5}),o($V04,$V14,{150:647,140:1511,145:1512,146:1513,149:1514,65:[1,1515],155:$V24}),o($VV5,$V44),{19:[1,1519],21:[1,1523],22:1517,144:1516,195:1518,209:1520,210:[1,1522],211:[1,1521]},o($V95,[2,185]),{19:$Va5,21:$Vb5,22:1118,209:1122,210:$Vq5},o($V95,[2,187]),{96:$Vc5,104:$Vd5,105:$Ve5,106:1129,176:1119,191:1123,192:1124,193:1125,196:1128,199:$Vg5,200:$Vh5,201:$Vi5,202:$Vj5,203:$Vk5,204:$Vl5,205:$Vm5,206:$Vn5,207:$Vo5,208:$Vp5},o($V95,[2,189]),{180:$Vf5},o($V95,$VW5,{175:1524,173:$VX5}),o($V95,$VW5,{175:1526,173:$VX5}),o($V95,$VW5,{175:1527,173:$VX5}),o($VY5,$Vq),o($VY5,$Vr),o($VY5,$Vb4),o($VY5,$Vc4),o($VY5,$Vd4),o($VY5,$Vt),o($VY5,$Vu),o($VY5,$Ve4),o($VY5,$Vf4,{197:1528,198:1529,107:[1,1530]}),o($VY5,$Vg4),o($VY5,$Vh4),o($VY5,$Vi4),o($VY5,$Vj4),o($VY5,$Vk4),o($VY5,$Vl4),o($VY5,$Vm4),o($VY5,$Vn4),o($VY5,$Vo4),o($VZ5,$V93),o($VZ5,$Va3),o($VZ5,$Vb3),o($VZ5,$Vc3),o($VD1,[2,196],{165:1531,174:$V65}),o($VD1,[2,205],{167:1532,174:$V75}),o($VD1,[2,213],{169:1533,174:$V85}),o($Va4,$V_5),o($Va4,$VC1),o($Va1,$Vk3),o($VC,$VD,{58:1534,60:1535,62:1536,63:1537,69:1540,71:1541,68:1542,40:1543,88:1544,90:1545,83:1547,84:1548,85:1549,74:1550,91:1557,22:1558,87:1560,114:1561,95:1562,209:1565,101:1566,103:1567,19:[1,1564],21:[1,1569],65:[1,1538],67:[1,1539],75:[1,1551],76:[1,1552],77:[1,1553],81:[1,1546],92:[1,1554],93:[1,1555],94:[1,1556],97:$V$5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,156:[1,1559],210:[1,1568]}),o($Vu2,$Vt2,{80:1170,187:1171,79:1570,185:$Vu5}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1571,117:$VG2,143:$VH2,184:$VI2}),o($Vu2,$Vt2,{80:1170,187:1171,79:1572,185:$Vu5}),o($Vo1,$Vx2,{95:713,91:1573,97:$Vq4,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vw4),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:1574,188:[1,1575]}),{19:$VI3,21:$VJ3,22:614,124:1576,194:$VK3,209:617,210:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:1577,188:[1,1578]}),{19:$VI3,21:$VJ3,22:614,124:1579,194:$VK3,209:617,210:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,1580]},o($Vt1,$VH1),{96:[1,1582],102:1581,104:[1,1583],105:[1,1584],106:1585,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,1586]},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:1587,188:[1,1588]}),{19:$VI3,21:$VJ3,22:614,124:1589,194:$VK3,209:617,210:$VL3},o($Vt1,$V84),{117:[1,1590]},{19:[1,1593],21:[1,1596],22:1592,83:1591,209:1594,210:[1,1595]},o($Vu2,$Vt2,{80:1208,187:1209,79:1597,185:$Vw5}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1598,117:$VG2,143:$VH2,184:$VI2}),o($Vu2,$Vt2,{80:1208,187:1209,79:1599,185:$Vw5}),o($Vo1,$Vx2,{95:760,91:1600,97:$Vr4,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vw4),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:1601,188:[1,1602]}),{19:$VI3,21:$VJ3,22:614,124:1603,194:$VK3,209:617,210:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:1604,188:[1,1605]}),{19:$VI3,21:$VJ3,22:614,124:1606,194:$VK3,209:617,210:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,1607]},o($Vt1,$VH1),{96:[1,1609],102:1608,104:[1,1610],105:[1,1611],106:1612,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,1613]},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:1614,188:[1,1615]}),{19:$VI3,21:$VJ3,22:614,124:1616,194:$VK3,209:617,210:$VL3},o($Vt1,$V84),{117:[1,1617]},{19:[1,1620],21:[1,1623],22:1619,83:1618,209:1621,210:[1,1622]},o($Va1,$Vw4),o($Va1,$VN3),{117:[1,1624]},o($Va1,$VF3),o($Vl2,$VO3),o($Vs2,$VF4),{19:$Vn,21:$Vo,22:1625,209:52,210:$Vp},{19:$V06,21:$V16,22:1627,96:[1,1638],104:[1,1639],105:[1,1640],106:1637,176:1628,186:1626,191:1631,192:1632,193:1633,196:1636,199:[1,1641],200:[1,1642],201:[1,1647],202:[1,1648],203:[1,1649],204:[1,1650],205:[1,1643],206:[1,1644],207:[1,1645],208:[1,1646],209:1630,210:$V26},o($Vu2,$VF4),{19:$Vn,21:$Vo,22:1651,209:52,210:$Vp},{19:$V36,21:$V46,22:1653,96:[1,1664],104:[1,1665],105:[1,1666],106:1663,176:1654,186:1652,191:1657,192:1658,193:1659,196:1662,199:[1,1667],200:[1,1668],201:[1,1673],202:[1,1674],203:[1,1675],204:[1,1676],205:[1,1669],206:[1,1670],207:[1,1671],208:[1,1672],209:1656,210:$V56},o($Vw2,$VF4),{19:$Vn,21:$Vo,22:1677,209:52,210:$Vp},{19:$V66,21:$V76,22:1679,96:[1,1690],104:[1,1691],105:[1,1692],106:1689,176:1680,186:1678,191:1683,192:1684,193:1685,196:1688,199:[1,1693],200:[1,1694],201:[1,1699],202:[1,1700],203:[1,1701],204:[1,1702],205:[1,1695],206:[1,1696],207:[1,1697],208:[1,1698],209:1682,210:$V86},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,1703]},o($Vt1,$Vd3),o($Vp1,$VQ4),o($VF1,$Vt5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Va1,$Vr3),o($Vx,$Vg,{50:1704,36:1705,39:$Vy}),o($Va1,$Vs3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:1706}),o($Va1,$V11),o($Va1,$V21),{19:[1,1710],21:[1,1714],22:1708,32:1707,195:1709,209:1711,210:[1,1713],211:[1,1712]},{115:[1,1715],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vt3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:1716}),o($Vl2,$Vr1,{89:1717}),o($Vo1,$Vs1,{95:1274,91:1718,97:$Vy5,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,1719]},o($Vl2,$VH1),{66:[1,1720]},o($Vs2,$Vt2,{79:1721,80:1722,187:1723,185:[1,1724]}),o($Vu2,$Vt2,{79:1725,80:1726,187:1727,185:$V96}),o($Vm1,$Vx2,{95:861,91:1729,97:$Vu4,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:1730,91:1731,87:1732,95:1733,101:1735,103:1736,97:$Va6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:1730,91:1731,87:1732,95:1733,101:1735,103:1736,97:$Va6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:1730,91:1731,87:1732,95:1733,101:1735,103:1736,97:$Va6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:1737,80:1738,187:1739,185:[1,1740]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,158:[1,1741],159:378,160:379,161:380,162:381,176:384,180:$VU2,191:389,192:390,193:391,196:394,199:$VV2,200:$VW2,201:$VX2,202:$VY2,203:$VZ2,204:$V_2,205:$V$2,206:$V03,207:$V13,208:$V23,209:388,210:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1742,117:$VG2,143:$VH2,184:$VI2}),o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,1743]},o($VF1,$Vd3),o($Va1,$Vs3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:1744}),o($Va1,$V11),o($Va1,$V21),{19:[1,1748],21:[1,1752],22:1746,32:1745,195:1747,209:1749,210:[1,1751],211:[1,1750]},{115:[1,1753],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vt3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:1754}),o($Vl2,$Vr1,{89:1755}),o($Vo1,$Vs1,{95:1321,91:1756,97:$Vz5,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,1757]},o($Vl2,$VH1),{66:[1,1758]},o($Vs2,$Vt2,{79:1759,80:1760,187:1761,185:[1,1762]}),o($Vu2,$Vt2,{79:1763,80:1764,187:1765,185:$Vb6}),o($Vm1,$Vx2,{95:897,91:1767,97:$Vv4,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:1768,91:1769,87:1770,95:1771,101:1773,103:1774,97:$Vc6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:1768,91:1769,87:1770,95:1771,101:1773,103:1774,97:$Vc6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:1768,91:1769,87:1770,95:1771,101:1773,103:1774,97:$Vc6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:1775,80:1776,187:1777,185:[1,1778]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,158:[1,1779],159:378,160:379,161:380,162:381,176:384,180:$VU2,191:389,192:390,193:391,196:394,199:$VV2,200:$VW2,201:$VX2,202:$VY2,203:$VZ2,204:$V_2,205:$V$2,206:$V03,207:$V13,208:$V23,209:388,210:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1780,117:$VG2,143:$VH2,184:$VI2}),o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,1781]},o($VF1,$Vd3),o($Vv3,$VN3),{117:[1,1782]},o($Vv3,$VF3),o($Vx4,$VO3),o($Vy4,$VF4),{19:$Vn,21:$Vo,22:1783,209:52,210:$Vp},{19:$Vd6,21:$Ve6,22:1785,96:[1,1796],104:[1,1797],105:[1,1798],106:1795,176:1786,186:1784,191:1789,192:1790,193:1791,196:1794,199:[1,1799],200:[1,1800],201:[1,1805],202:[1,1806],203:[1,1807],204:[1,1808],205:[1,1801],206:[1,1802],207:[1,1803],208:[1,1804],209:1788,210:$Vf6},o($Vz4,$VF4),{19:$Vn,21:$Vo,22:1809,209:52,210:$Vp},{19:$Vg6,21:$Vh6,22:1811,96:[1,1822],104:[1,1823],105:[1,1824],106:1821,176:1812,186:1810,191:1815,192:1816,193:1817,196:1820,199:[1,1825],200:[1,1826],201:[1,1831],202:[1,1832],203:[1,1833],204:[1,1834],205:[1,1827],206:[1,1828],207:[1,1829],208:[1,1830],209:1814,210:$Vi6},o($VB4,$VF4),{19:$Vn,21:$Vo,22:1835,209:52,210:$Vp},{19:$Vj6,21:$Vk6,22:1837,96:[1,1848],104:[1,1849],105:[1,1850],106:1847,176:1838,186:1836,191:1841,192:1842,193:1843,196:1846,199:[1,1851],200:[1,1852],201:[1,1857],202:[1,1858],203:[1,1859],204:[1,1860],205:[1,1853],206:[1,1854],207:[1,1855],208:[1,1856],209:1840,210:$Vl6},o($VB3,$V43),o($VB3,$V53),o($VB3,$V63),o($VB3,$V73),o($VB3,$V83),{107:[1,1861]},o($VB3,$Vd3),o($Vz3,$VQ4),o($VC3,$Vt5),o($VC3,$VC1),o($VC3,$Vq),o($VC3,$Vr),o($VC3,$Vt),o($VC3,$Vu),o($Vv3,$Vr3),o($Vx,$Vg,{50:1862,36:1863,39:$Vy}),o($Vv3,$Vs3),o($Vv3,$Vi2),o($Vv3,$Vd2),o($Vv3,$Ve2),o($Vy3,$Vn1,{78:1864}),o($Vv3,$V11),o($Vv3,$V21),{19:[1,1868],21:[1,1872],22:1866,32:1865,195:1867,209:1869,210:[1,1871],211:[1,1870]},{115:[1,1873],118:195,119:196,120:$Vw1,122:$Vx1},o($Vv3,$Vt3),o($Vv3,$Vk2),o($Vy3,$Vn1,{78:1874}),o($Vx4,$Vr1,{89:1875}),o($Vy3,$Vs1,{95:1397,91:1876,97:$VC5,98:$VL,99:$VM,100:$VN}),o($Vx4,$Vy1),o($Vx4,$Vz1),o($Vx4,$VA1),o($Vx4,$VB1),{96:[1,1877]},o($Vx4,$VH1),{66:[1,1878]},o($Vy4,$Vt2,{79:1879,80:1880,187:1881,185:[1,1882]}),o($Vz4,$Vt2,{79:1883,80:1884,187:1885,185:$Vm6}),o($Vx3,$Vx2,{95:966,91:1887,97:$VD4,98:$VL,99:$VM,100:$VN}),o($VA3,$Vy2),o($Vy3,$Vz2,{86:1888,91:1889,87:1890,95:1891,101:1893,103:1894,97:$Vn6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VB2,{86:1888,91:1889,87:1890,95:1891,101:1893,103:1894,97:$Vn6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VC2,{86:1888,91:1889,87:1890,95:1891,101:1893,103:1894,97:$Vn6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VC3,$VD2),o($VB4,$Vt2,{79:1895,80:1896,187:1897,185:[1,1898]}),o($VB5,$VR1),o($VB5,$Vl),o($VB5,$Vm),o($VB5,$Vq),o($VB5,$Vr),o($VB5,$Vs),o($VB5,$Vt),o($VB5,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,158:[1,1899],159:378,160:379,161:380,162:381,176:384,180:$VU2,191:389,192:390,193:391,196:394,199:$VV2,200:$VW2,201:$VX2,202:$VY2,203:$VZ2,204:$V_2,205:$V$2,206:$V03,207:$V13,208:$V23,209:388,210:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1900,117:$VG2,143:$VH2,184:$VI2}),o($VA3,$V43),o($VC3,$V53),o($VC3,$V63),o($VC3,$V73),o($VC3,$V83),{107:[1,1901]},o($VC3,$Vd3),o($Vv3,$Vs3),o($Vv3,$Vi2),o($Vv3,$Vd2),o($Vv3,$Ve2),o($Vy3,$Vn1,{78:1902}),o($Vv3,$V11),o($Vv3,$V21),{19:[1,1906],21:[1,1910],22:1904,32:1903,195:1905,209:1907,210:[1,1909],211:[1,1908]},{115:[1,1911],118:195,119:196,120:$Vw1,122:$Vx1},o($Vv3,$Vt3),o($Vv3,$Vk2),o($Vy3,$Vn1,{78:1912}),o($Vx4,$Vr1,{89:1913}),o($Vy3,$Vs1,{95:1444,91:1914,97:$VD5,98:$VL,99:$VM,100:$VN}),o($Vx4,$Vy1),o($Vx4,$Vz1),o($Vx4,$VA1),o($Vx4,$VB1),{96:[1,1915]},o($Vx4,$VH1),{66:[1,1916]},o($Vy4,$Vt2,{79:1917,80:1918,187:1919,185:[1,1920]}),o($Vz4,$Vt2,{79:1921,80:1922,187:1923,185:$Vo6}),o($Vx3,$Vx2,{95:1002,91:1925,97:$VE4,98:$VL,99:$VM,100:$VN}),o($VA3,$Vy2),o($Vy3,$Vz2,{86:1926,91:1927,87:1928,95:1929,101:1931,103:1932,97:$Vp6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VB2,{86:1926,91:1927,87:1928,95:1929,101:1931,103:1932,97:$Vp6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VC2,{86:1926,91:1927,87:1928,95:1929,101:1931,103:1932,97:$Vp6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VC3,$VD2),o($VB4,$Vt2,{79:1933,80:1934,187:1935,185:[1,1936]}),o($VB5,$VR1),o($VB5,$Vl),o($VB5,$Vm),o($VB5,$Vq),o($VB5,$Vr),o($VB5,$Vs),o($VB5,$Vt),o($VB5,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,158:[1,1937],159:378,160:379,161:380,162:381,176:384,180:$VU2,191:389,192:390,193:391,196:394,199:$VV2,200:$VW2,201:$VX2,202:$VY2,203:$VZ2,204:$V_2,205:$V$2,206:$V03,207:$V13,208:$V23,209:388,210:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1938,117:$VG2,143:$VH2,184:$VI2}),o($VA3,$V43),o($VC3,$V53),o($VC3,$V63),o($VC3,$V73),o($VC3,$V83),{107:[1,1939]},o($VC3,$Vd3),o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vr5),o($Vm1,$Vs5),{19:$VG4,21:$VH4,22:1941,83:1940,209:1015,210:$VI4},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vr5),o($Vo1,$Vs5),{19:$VK4,21:$VL4,22:1943,83:1942,209:1041,210:$VM4},o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vr5),o($Vp1,$Vs5),{19:$VN4,21:$VO4,22:1945,83:1944,209:1067,210:$VP4},o($Vt1,$Vt5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vq6,$Vr6,{147:1946,148:1947,151:$Vs6,152:$Vt6,153:$Vu6,154:$Vv6}),o($Vw6,$Vx6),o($Vy6,$Vz6,{52:1952}),o($VA6,$VB6,{56:1953}),o($VC,$VD,{59:1954,69:1955,71:1956,72:1957,88:1960,90:1961,83:1963,84:1964,85:1965,74:1966,40:1967,91:1971,22:1972,87:1974,114:1975,95:1979,209:1982,101:1983,103:1984,19:[1,1981],21:[1,1986],65:[1,1958],67:[1,1959],75:[1,1976],76:[1,1977],77:[1,1978],81:[1,1962],92:[1,1968],93:[1,1969],94:[1,1970],97:$VC6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,156:[1,1973],210:[1,1985]}),o($Vq6,$Vr6,{148:1947,147:1987,151:$Vs6,152:$Vt6,153:$Vu6,154:$Vv6}),{66:$VR4,129:1988,130:$VR5},o($VS5,$VS4),o($VE2,$VF2,{142:366,131:1106,132:1107,133:1108,139:1109,141:1110,126:1989,143:$VH2,184:$V25}),o($VS5,$VT4),o($VS5,$VZ3,{134:1990,138:1991,135:$VT5,136:$VU5}),o($VE2,$VF2,{142:366,139:1109,141:1110,133:1992,66:$VU4,130:$VU4,143:$VH2,184:$V25}),o($VE2,$VF2,{142:366,139:1109,141:1110,133:1993,66:$VV4,130:$VV4,143:$VH2,184:$V25}),o($VV5,$VW4),o($VV5,$VX4),o($VV5,$VY4),o($VV5,$VZ4),{19:$V_4,21:$V$4,22:1096,124:1994,194:$V05,209:1099,210:$V15},o($VE2,$VF2,{142:366,125:1103,126:1104,127:1105,131:1106,132:1107,133:1108,139:1109,141:1110,121:1995,143:$VH2,184:$V25}),o($VV5,$V35),o($VV5,$V45),o($VV5,$V55),o($VV5,$Vq),o($VV5,$Vr),o($VV5,$Vs),o($VV5,$Vt),o($VV5,$Vu),o($V95,[2,199]),o($V95,[2,201]),o($V95,[2,208]),o($V95,[2,216]),o($VY5,$Vr5),o($VY5,$Vs5),{19:$Va5,21:$Vb5,22:1997,83:1996,209:1122,210:$Vq5},o($V95,[2,195]),o($V95,[2,204]),o($V95,[2,212]),o($Va1,$V92),o($Va1,$Vd1,{61:1998,63:1999,68:2000,40:2001,74:2002,114:2006,75:[1,2003],76:[1,2004],77:[1,2005],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:2007,60:2008,69:2009,88:2010,90:2011,91:2015,95:2016,92:[1,2012],93:[1,2013],94:[1,2014],97:$VD6,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2018,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:2019}),o($Vo1,$Vn1,{78:2020}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:2021}),o($Vm1,$Vs1,{95:1562,91:2022,97:$V$5,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:2023}),o($Vt1,$Vu1,{82:2024}),o($Vt1,$Vu1,{82:2025}),o($Vo1,$Vv1,{101:1566,103:1567,87:2026,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:2027}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,2031],21:[1,2035],22:2029,32:2028,195:2030,209:2032,210:[1,2034],211:[1,2033]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{157:2036}),o($VF1,$VG1),{115:[1,2037],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,2038]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,2040],102:2039,104:[1,2041],105:[1,2042],106:2043,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,2044]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$VN3),{117:[1,2045]},o($Va1,$VF3),o($Vl2,$VO3),o($Vs2,$VF4),{19:$Vn,21:$Vo,22:2046,209:52,210:$Vp},{19:$VE6,21:$VF6,22:2048,96:[1,2059],104:[1,2060],105:[1,2061],106:2058,176:2049,186:2047,191:2052,192:2053,193:2054,196:2057,199:[1,2062],200:[1,2063],201:[1,2068],202:[1,2069],203:[1,2070],204:[1,2071],205:[1,2064],206:[1,2065],207:[1,2066],208:[1,2067],209:2051,210:$VG6},o($Vu2,$VF4),{19:$Vn,21:$Vo,22:2072,209:52,210:$Vp},{19:$VH6,21:$VI6,22:2074,96:[1,2085],104:[1,2086],105:[1,2087],106:2084,176:2075,186:2073,191:2078,192:2079,193:2080,196:2083,199:[1,2088],200:[1,2089],201:[1,2094],202:[1,2095],203:[1,2096],204:[1,2097],205:[1,2090],206:[1,2091],207:[1,2092],208:[1,2093],209:2077,210:$VJ6},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,2098]},o($Vt1,$Vd3),o($Vw2,$VF4),{19:$Vn,21:$Vo,22:2099,209:52,210:$Vp},{19:$VK6,21:$VL6,22:2101,96:[1,2112],104:[1,2113],105:[1,2114],106:2111,176:2102,186:2100,191:2105,192:2106,193:2107,196:2110,199:[1,2115],200:[1,2116],201:[1,2121],202:[1,2122],203:[1,2123],204:[1,2124],205:[1,2117],206:[1,2118],207:[1,2119],208:[1,2120],209:2104,210:$VM6},o($Vp1,$VQ4),o($VF1,$Vt5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Va1,$VN3),{117:[1,2125]},o($Va1,$VF3),o($Vl2,$VO3),o($Vs2,$VF4),{19:$Vn,21:$Vo,22:2126,209:52,210:$Vp},{19:$VN6,21:$VO6,22:2128,96:[1,2139],104:[1,2140],105:[1,2141],106:2138,176:2129,186:2127,191:2132,192:2133,193:2134,196:2137,199:[1,2142],200:[1,2143],201:[1,2148],202:[1,2149],203:[1,2150],204:[1,2151],205:[1,2144],206:[1,2145],207:[1,2146],208:[1,2147],209:2131,210:$VP6},o($Vu2,$VF4),{19:$Vn,21:$Vo,22:2152,209:52,210:$Vp},{19:$VQ6,21:$VR6,22:2154,96:[1,2165],104:[1,2166],105:[1,2167],106:2164,176:2155,186:2153,191:2158,192:2159,193:2160,196:2163,199:[1,2168],200:[1,2169],201:[1,2174],202:[1,2175],203:[1,2176],204:[1,2177],205:[1,2170],206:[1,2171],207:[1,2172],208:[1,2173],209:2157,210:$VS6},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,2178]},o($Vt1,$Vd3),o($Vw2,$VF4),{19:$Vn,21:$Vo,22:2179,209:52,210:$Vp},{19:$VT6,21:$VU6,22:2181,96:[1,2192],104:[1,2193],105:[1,2194],106:2191,176:2182,186:2180,191:2185,192:2186,193:2187,196:2190,199:[1,2195],200:[1,2196],201:[1,2201],202:[1,2202],203:[1,2203],204:[1,2204],205:[1,2197],206:[1,2198],207:[1,2199],208:[1,2200],209:2184,210:$VV6},o($Vp1,$VQ4),o($VF1,$Vt5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Vo1,$VQ4),{188:[1,2207],189:2205,190:[1,2206]},o($Vm1,$VE5),o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vb4),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Ve4),o($Vm1,$Vf4,{197:2208,198:2209,107:[1,2210]}),o($Vm1,$Vg4),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($VH5,$V93),o($VH5,$Va3),o($VH5,$Vb3),o($VH5,$Vc3),{188:[1,2213],189:2211,190:[1,2212]},o($Vo1,$VE5),o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vb4),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Ve4),o($Vo1,$Vf4,{197:2214,198:2215,107:[1,2216]}),o($Vo1,$Vg4),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{188:[1,2219],189:2217,190:[1,2218]},o($Vp1,$VE5),o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vb4),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Ve4),o($Vp1,$Vf4,{197:2220,198:2221,107:[1,2222]}),o($Vp1,$Vg4),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),{19:[1,2225],21:[1,2228],22:2224,83:2223,209:2226,210:[1,2227]},o($Va1,$Vk3),o($VC,$VD,{58:2229,60:2230,62:2231,63:2232,69:2235,71:2236,68:2237,40:2238,88:2239,90:2240,83:2242,84:2243,85:2244,74:2245,91:2252,22:2253,87:2255,114:2256,95:2257,209:2260,101:2261,103:2262,19:[1,2259],21:[1,2264],65:[1,2233],67:[1,2234],75:[1,2246],76:[1,2247],77:[1,2248],81:[1,2241],92:[1,2249],93:[1,2250],94:[1,2251],97:$VW6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,156:[1,2254],210:[1,2263]}),o($Vu2,$Vt2,{80:1726,187:1727,79:2265,185:$V96}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:2266,117:$VG2,143:$VH2,184:$VI2}),o($Vu2,$Vt2,{80:1726,187:1727,79:2267,185:$V96}),o($Vo1,$Vx2,{95:1274,91:2268,97:$Vy5,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vw4),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:2269,188:[1,2270]}),{19:$VI3,21:$VJ3,22:614,124:2271,194:$VK3,209:617,210:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:2272,188:[1,2273]}),{19:$VI3,21:$VJ3,22:614,124:2274,194:$VK3,209:617,210:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,2275]},o($Vt1,$VH1),{96:[1,2277],102:2276,104:[1,2278],105:[1,2279],106:2280,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,2281]},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:2282,188:[1,2283]}),{19:$VI3,21:$VJ3,22:614,124:2284,194:$VK3,209:617,210:$VL3},o($Vt1,$V84),{117:[1,2285]},{19:[1,2288],21:[1,2291],22:2287,83:2286,209:2289,210:[1,2290]},o($Vu2,$Vt2,{80:1764,187:1765,79:2292,185:$Vb6}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:2293,117:$VG2,143:$VH2,184:$VI2}),o($Vu2,$Vt2,{80:1764,187:1765,79:2294,185:$Vb6}),o($Vo1,$Vx2,{95:1321,91:2295,97:$Vz5,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vw4),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:2296,188:[1,2297]}),{19:$VI3,21:$VJ3,22:614,124:2298,194:$VK3,209:617,210:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:2299,188:[1,2300]}),{19:$VI3,21:$VJ3,22:614,124:2301,194:$VK3,209:617,210:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,2302]},o($Vt1,$VH1),{96:[1,2304],102:2303,104:[1,2305],105:[1,2306],106:2307,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,2308]},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:2309,188:[1,2310]}),{19:$VI3,21:$VJ3,22:614,124:2311,194:$VK3,209:617,210:$VL3},o($Vt1,$V84),{117:[1,2312]},{19:[1,2315],21:[1,2318],22:2314,83:2313,209:2316,210:[1,2317]},o($Vy3,$VQ4),{188:[1,2321],189:2319,190:[1,2320]},o($Vx3,$VE5),o($Vx3,$VF5),o($Vx3,$VG5),o($Vx3,$Vq),o($Vx3,$Vr),o($Vx3,$Vb4),o($Vx3,$Vc4),o($Vx3,$Vd4),o($Vx3,$Vt),o($Vx3,$Vu),o($Vx3,$Ve4),o($Vx3,$Vf4,{197:2322,198:2323,107:[1,2324]}),o($Vx3,$Vg4),o($Vx3,$Vh4),o($Vx3,$Vi4),o($Vx3,$Vj4),o($Vx3,$Vk4),o($Vx3,$Vl4),o($Vx3,$Vm4),o($Vx3,$Vn4),o($Vx3,$Vo4),o($VX6,$V93),o($VX6,$Va3),o($VX6,$Vb3),o($VX6,$Vc3),{188:[1,2327],189:2325,190:[1,2326]},o($Vy3,$VE5),o($Vy3,$VF5),o($Vy3,$VG5),o($Vy3,$Vq),o($Vy3,$Vr),o($Vy3,$Vb4),o($Vy3,$Vc4),o($Vy3,$Vd4),o($Vy3,$Vt),o($Vy3,$Vu),o($Vy3,$Ve4),o($Vy3,$Vf4,{197:2328,198:2329,107:[1,2330]}),o($Vy3,$Vg4),o($Vy3,$Vh4),o($Vy3,$Vi4),o($Vy3,$Vj4),o($Vy3,$Vk4),o($Vy3,$Vl4),o($Vy3,$Vm4),o($Vy3,$Vn4),o($Vy3,$Vo4),o($VY6,$V93),o($VY6,$Va3),o($VY6,$Vb3),o($VY6,$Vc3),{188:[1,2333],189:2331,190:[1,2332]},o($Vz3,$VE5),o($Vz3,$VF5),o($Vz3,$VG5),o($Vz3,$Vq),o($Vz3,$Vr),o($Vz3,$Vb4),o($Vz3,$Vc4),o($Vz3,$Vd4),o($Vz3,$Vt),o($Vz3,$Vu),o($Vz3,$Ve4),o($Vz3,$Vf4,{197:2334,198:2335,107:[1,2336]}),o($Vz3,$Vg4),o($Vz3,$Vh4),o($Vz3,$Vi4),o($Vz3,$Vj4),o($Vz3,$Vk4),o($Vz3,$Vl4),o($Vz3,$Vm4),o($Vz3,$Vn4),o($Vz3,$Vo4),o($VZ6,$V93),o($VZ6,$Va3),o($VZ6,$Vb3),o($VZ6,$Vc3),{19:[1,2339],21:[1,2342],22:2338,83:2337,209:2340,210:[1,2341]},o($Vv3,$Vk3),o($VC,$VD,{58:2343,60:2344,62:2345,63:2346,69:2349,71:2350,68:2351,40:2352,88:2353,90:2354,83:2356,84:2357,85:2358,74:2359,91:2366,22:2367,87:2369,114:2370,95:2371,209:2374,101:2375,103:2376,19:[1,2373],21:[1,2378],65:[1,2347],67:[1,2348],75:[1,2360],76:[1,2361],77:[1,2362],81:[1,2355],92:[1,2363],93:[1,2364],94:[1,2365],97:$V_6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,156:[1,2368],210:[1,2377]}),o($Vz4,$Vt2,{80:1884,187:1885,79:2379,185:$Vm6}),o($Vv3,$VR1),o($Vv3,$Vl),o($Vv3,$Vm),o($Vv3,$Vq),o($Vv3,$Vr),o($Vv3,$Vs),o($Vv3,$Vt),o($Vv3,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:2380,117:$VG2,143:$VH2,184:$VI2}),o($Vz4,$Vt2,{80:1884,187:1885,79:2381,185:$Vm6}),o($Vy3,$Vx2,{95:1397,91:2382,97:$VC5,98:$VL,99:$VM,100:$VN}),o($Vx4,$Vy2),o($Vx4,$V43),o($Vv3,$Vw4),o($VA5,$VF3),o($Vx3,$VG3),o($VA5,$VH3,{31:2383,188:[1,2384]}),{19:$VI3,21:$VJ3,22:614,124:2385,194:$VK3,209:617,210:$VL3},o($Vv3,$VM3),o($Vy3,$VG3),o($Vv3,$VH3,{31:2386,188:[1,2387]}),{19:$VI3,21:$VJ3,22:614,124:2388,194:$VK3,209:617,210:$VL3},o($VA3,$VO3),o($VB3,$VP3),o($VB3,$VQ3),o($VB3,$VR3),{96:[1,2389]},o($VB3,$VH1),{96:[1,2391],102:2390,104:[1,2392],105:[1,2393],106:2394,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,2395]},o($VB5,$VN3),o($Vz3,$VG3),o($VB5,$VH3,{31:2396,188:[1,2397]}),{19:$VI3,21:$VJ3,22:614,124:2398,194:$VK3,209:617,210:$VL3},o($VB3,$V84),{117:[1,2399]},{19:[1,2402],21:[1,2405],22:2401,83:2400,209:2403,210:[1,2404]},o($Vz4,$Vt2,{80:1922,187:1923,79:2406,185:$Vo6}),o($Vv3,$VR1),o($Vv3,$Vl),o($Vv3,$Vm),o($Vv3,$Vq),o($Vv3,$Vr),o($Vv3,$Vs),o($Vv3,$Vt),o($Vv3,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:2407,117:$VG2,143:$VH2,184:$VI2}),o($Vz4,$Vt2,{80:1922,187:1923,79:2408,185:$Vo6}),o($Vy3,$Vx2,{95:1444,91:2409,97:$VD5,98:$VL,99:$VM,100:$VN}),o($Vx4,$Vy2),o($Vx4,$V43),o($Vv3,$Vw4),o($VA5,$VF3),o($Vx3,$VG3),o($VA5,$VH3,{31:2410,188:[1,2411]}),{19:$VI3,21:$VJ3,22:614,124:2412,194:$VK3,209:617,210:$VL3},o($Vv3,$VM3),o($Vy3,$VG3),o($Vv3,$VH3,{31:2413,188:[1,2414]}),{19:$VI3,21:$VJ3,22:614,124:2415,194:$VK3,209:617,210:$VL3},o($VA3,$VO3),o($VB3,$VP3),o($VB3,$VQ3),o($VB3,$VR3),{96:[1,2416]},o($VB3,$VH1),{96:[1,2418],102:2417,104:[1,2419],105:[1,2420],106:2421,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,2422]},o($VB5,$VN3),o($Vz3,$VG3),o($VB5,$VH3,{31:2423,188:[1,2424]}),{19:$VI3,21:$VJ3,22:614,124:2425,194:$VK3,209:617,210:$VL3},o($VB3,$V84),{117:[1,2426]},{19:[1,2429],21:[1,2432],22:2428,83:2427,209:2430,210:[1,2431]},o($Vm1,$V_5),o($Vm1,$VC1),o($Vo1,$V_5),o($Vo1,$VC1),o($Vp1,$V_5),o($Vp1,$VC1),o($Vq6,$Vn1,{78:2433}),o($Vq6,$V$6),o($Vq6,$V07),o($Vq6,$V17),o($Vq6,$V27),o($Vq6,$V37),o($Vw6,$V47,{53:2434,47:[1,2435]}),o($Vy6,$V57,{57:2436,49:[1,2437]}),o($VA6,$V67),o($VA6,$V77,{70:2438,72:2439,74:2440,40:2441,114:2442,75:[1,2443],76:[1,2444],77:[1,2445],115:$VD,120:$VD,122:$VD}),o($VA6,$V87),o($VA6,$V97,{73:2446,69:2447,88:2448,90:2449,91:2453,95:2454,92:[1,2450],93:[1,2451],94:[1,2452],97:$Va7,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2456,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VA6,$Vb7),o($Vc7,$Vr1,{89:2457}),o($Vd7,$Vs1,{95:1979,91:2458,97:$VC6,98:$VL,99:$VM,100:$VN}),o($Ve7,$Vu1,{82:2459}),o($Ve7,$Vu1,{82:2460}),o($Ve7,$Vu1,{82:2461}),o($VA6,$Vv1,{101:1983,103:1984,87:2462,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vf7,$Vg7),o($Vf7,$Vh7),o($Vc7,$Vy1),o($Vc7,$Vz1),o($Vc7,$VA1),o($Vc7,$VB1),o($Ve7,$VC1),o($VD1,$VE1,{157:2463}),o($Vi7,$VG1),{115:[1,2464],118:195,119:196,120:$Vw1,122:$Vx1},o($Vf7,$V11),o($Vf7,$V21),{19:[1,2468],21:[1,2472],22:2466,32:2465,195:2467,209:2469,210:[1,2471],211:[1,2470]},{96:[1,2473]},o($Vc7,$VH1),o($Ve7,$Vq),o($Ve7,$Vr),{96:[1,2475],102:2474,104:[1,2476],105:[1,2477],106:2478,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,2479]},o($Ve7,$Vt),o($Ve7,$Vu),o($Vq6,$Vn1,{78:2480}),o($VS5,$VK5),o($VS5,$VL5),o($VS5,$VM5),o($VV5,$VN5),o($VV5,$VO5),o($VV5,$VP5),o($Vx,$Vg,{42:2481,43:2482,51:2483,55:2484,36:2485,39:$Vy}),{66:[1,2486]},o($VY5,$V_5),o($VY5,$VC1),o($Va1,$Vs3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:2487}),o($Va1,$V11),o($Va1,$V21),{19:[1,2491],21:[1,2495],22:2489,32:2488,195:2490,209:2492,210:[1,2494],211:[1,2493]},{115:[1,2496],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vt3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:2497}),o($Vl2,$Vr1,{89:2498}),o($Vo1,$Vs1,{95:2016,91:2499,97:$VD6,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,2500]},o($Vl2,$VH1),{66:[1,2501]},o($Vs2,$Vt2,{79:2502,80:2503,187:2504,185:[1,2505]}),o($Vu2,$Vt2,{79:2506,80:2507,187:2508,185:$Vj7}),o($Vm1,$Vx2,{95:1562,91:2510,97:$V$5,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:2511,91:2512,87:2513,95:2514,101:2516,103:2517,97:$Vk7,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:2511,91:2512,87:2513,95:2514,101:2516,103:2517,97:$Vk7,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:2511,91:2512,87:2513,95:2514,101:2516,103:2517,97:$Vk7,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:2518,80:2519,187:2520,185:[1,2521]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,158:[1,2522],159:378,160:379,161:380,162:381,176:384,180:$VU2,191:389,192:390,193:391,196:394,199:$VV2,200:$VW2,201:$VX2,202:$VY2,203:$VZ2,204:$V_2,205:$V$2,206:$V03,207:$V13,208:$V23,209:388,210:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:2523,117:$VG2,143:$VH2,184:$VI2}),o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,2524]},o($VF1,$Vd3),o($Vo1,$VQ4),{188:[1,2527],189:2525,190:[1,2526]},o($Vm1,$VE5),o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vb4),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Ve4),o($Vm1,$Vf4,{197:2528,198:2529,107:[1,2530]}),o($Vm1,$Vg4),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($VH5,$V93),o($VH5,$Va3),o($VH5,$Vb3),o($VH5,$Vc3),{188:[1,2533],189:2531,190:[1,2532]},o($Vo1,$VE5),o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vb4),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Ve4),o($Vo1,$Vf4,{197:2534,198:2535,107:[1,2536]}),o($Vo1,$Vg4),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{19:[1,2539],21:[1,2542],22:2538,83:2537,209:2540,210:[1,2541]},{188:[1,2545],189:2543,190:[1,2544]},o($Vp1,$VE5),o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vb4),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Ve4),o($Vp1,$Vf4,{197:2546,198:2547,107:[1,2548]}),o($Vp1,$Vg4),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),o($Vo1,$VQ4),{188:[1,2551],189:2549,190:[1,2550]},o($Vm1,$VE5),o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vb4),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Ve4),o($Vm1,$Vf4,{197:2552,198:2553,107:[1,2554]}),o($Vm1,$Vg4),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($VH5,$V93),o($VH5,$Va3),o($VH5,$Vb3),o($VH5,$Vc3),{188:[1,2557],189:2555,190:[1,2556]},o($Vo1,$VE5),o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vb4),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Ve4),o($Vo1,$Vf4,{197:2558,198:2559,107:[1,2560]}),o($Vo1,$Vg4),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{19:[1,2563],21:[1,2566],22:2562,83:2561,209:2564,210:[1,2565]},{188:[1,2569],189:2567,190:[1,2568]},o($Vp1,$VE5),o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vb4),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Ve4),o($Vp1,$Vf4,{197:2570,198:2571,107:[1,2572]}),o($Vp1,$Vg4),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vr5),o($Vm1,$Vs5),{19:$V06,21:$V16,22:2574,83:2573,209:1630,210:$V26},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vr5),o($Vo1,$Vs5),{19:$V36,21:$V46,22:2576,83:2575,209:1656,210:$V56},o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vr5),o($Vp1,$Vs5),{19:$V66,21:$V76,22:2578,83:2577,209:1682,210:$V86},o($Vt1,$Vt5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$V92),o($Va1,$Vd1,{61:2579,63:2580,68:2581,40:2582,74:2583,114:2587,75:[1,2584],76:[1,2585],77:[1,2586],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:2588,60:2589,69:2590,88:2591,90:2592,91:2596,95:2597,92:[1,2593],93:[1,2594],94:[1,2595],97:$Vl7,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2599,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:2600}),o($Vo1,$Vn1,{78:2601}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:2602}),o($Vm1,$Vs1,{95:2257,91:2603,97:$VW6,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:2604}),o($Vt1,$Vu1,{82:2605}),o($Vt1,$Vu1,{82:2606}),o($Vo1,$Vv1,{101:2261,103:2262,87:2607,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:2608}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,2612],21:[1,2616],22:2610,32:2609,195:2611,209:2613,210:[1,2615],211:[1,2614]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{157:2617}),o($VF1,$VG1),{115:[1,2618],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,2619]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,2621],102:2620,104:[1,2622],105:[1,2623],106:2624,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,2625]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$VN3),{117:[1,2626]},o($Va1,$VF3),o($Vl2,$VO3),o($Vs2,$VF4),{19:$Vn,21:$Vo,22:2627,209:52,210:$Vp},{19:$Vm7,21:$Vn7,22:2629,96:[1,2640],104:[1,2641],105:[1,2642],106:2639,176:2630,186:2628,191:2633,192:2634,193:2635,196:2638,199:[1,2643],200:[1,2644],201:[1,2649],202:[1,2650],203:[1,2651],204:[1,2652],205:[1,2645],206:[1,2646],207:[1,2647],208:[1,2648],209:2632,210:$Vo7},o($Vu2,$VF4),{19:$Vn,21:$Vo,22:2653,209:52,210:$Vp},{19:$Vp7,21:$Vq7,22:2655,96:[1,2666],104:[1,2667],105:[1,2668],106:2665,176:2656,186:2654,191:2659,192:2660,193:2661,196:2664,199:[1,2669],200:[1,2670],201:[1,2675],202:[1,2676],203:[1,2677],204:[1,2678],205:[1,2671],206:[1,2672],207:[1,2673],208:[1,2674],209:2658,210:$Vr7},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,2679]},o($Vt1,$Vd3),o($Vw2,$VF4),{19:$Vn,21:$Vo,22:2680,209:52,210:$Vp},{19:$Vs7,21:$Vt7,22:2682,96:[1,2693],104:[1,2694],105:[1,2695],106:2692,176:2683,186:2681,191:2686,192:2687,193:2688,196:2691,199:[1,2696],200:[1,2697],201:[1,2702],202:[1,2703],203:[1,2704],204:[1,2705],205:[1,2698],206:[1,2699],207:[1,2700],208:[1,2701],209:2685,210:$Vu7},o($Vp1,$VQ4),o($VF1,$Vt5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Va1,$VN3),{117:[1,2706]},o($Va1,$VF3),o($Vl2,$VO3),o($Vs2,$VF4),{19:$Vn,21:$Vo,22:2707,209:52,210:$Vp},{19:$Vv7,21:$Vw7,22:2709,96:[1,2720],104:[1,2721],105:[1,2722],106:2719,176:2710,186:2708,191:2713,192:2714,193:2715,196:2718,199:[1,2723],200:[1,2724],201:[1,2729],202:[1,2730],203:[1,2731],204:[1,2732],205:[1,2725],206:[1,2726],207:[1,2727],208:[1,2728],209:2712,210:$Vx7},o($Vu2,$VF4),{19:$Vn,21:$Vo,22:2733,209:52,210:$Vp},{19:$Vy7,21:$Vz7,22:2735,96:[1,2746],104:[1,2747],105:[1,2748],106:2745,176:2736,186:2734,191:2739,192:2740,193:2741,196:2744,199:[1,2749],200:[1,2750],201:[1,2755],202:[1,2756],203:[1,2757],204:[1,2758],205:[1,2751],206:[1,2752],207:[1,2753],208:[1,2754],209:2738,210:$VA7},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,2759]},o($Vt1,$Vd3),o($Vw2,$VF4),{19:$Vn,21:$Vo,22:2760,209:52,210:$Vp},{19:$VB7,21:$VC7,22:2762,96:[1,2773],104:[1,2774],105:[1,2775],106:2772,176:2763,186:2761,191:2766,192:2767,193:2768,196:2771,199:[1,2776],200:[1,2777],201:[1,2782],202:[1,2783],203:[1,2784],204:[1,2785],205:[1,2778],206:[1,2779],207:[1,2780],208:[1,2781],209:2765,210:$VD7},o($Vp1,$VQ4),o($VF1,$Vt5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Vy4,$VS1),o($Vy4,$VT1),o($Vy4,$VU1),o($Vx3,$Vr5),o($Vx3,$Vs5),{19:$Vd6,21:$Ve6,22:2787,83:2786,209:1788,210:$Vf6},o($Vz4,$VS1),o($Vz4,$VT1),o($Vz4,$VU1),o($Vy3,$Vr5),o($Vy3,$Vs5),{19:$Vg6,21:$Vh6,22:2789,83:2788,209:1814,210:$Vi6},o($VB4,$VS1),o($VB4,$VT1),o($VB4,$VU1),o($Vz3,$Vr5),o($Vz3,$Vs5),{19:$Vj6,21:$Vk6,22:2791,83:2790,209:1840,210:$Vl6},o($VB3,$Vt5),o($VB3,$VC1),o($VB3,$Vq),o($VB3,$Vr),o($VB3,$Vt),o($VB3,$Vu),o($Vv3,$V92),o($Vv3,$Vd1,{61:2792,63:2793,68:2794,40:2795,74:2796,114:2800,75:[1,2797],76:[1,2798],77:[1,2799],115:$VD,120:$VD,122:$VD}),o($Vv3,$Va2),o($Vv3,$Vf1,{64:2801,60:2802,69:2803,88:2804,90:2805,91:2809,95:2810,92:[1,2806],93:[1,2807],94:[1,2808],97:$VE7,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2812,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vv3,$Vb2),o($Vx3,$Vn1,{78:2813}),o($Vy3,$Vn1,{78:2814}),o($VB5,$Vd2),o($VB5,$Ve2),o($VA3,$Vr1,{89:2815}),o($Vx3,$Vs1,{95:2371,91:2816,97:$V_6,98:$VL,99:$VM,100:$VN}),o($VB3,$Vu1,{82:2817}),o($VB3,$Vu1,{82:2818}),o($VB3,$Vu1,{82:2819}),o($Vy3,$Vv1,{101:2375,103:2376,87:2820,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vz3,$Vn1,{78:2821}),o($VB5,$V11),o($VB5,$V21),{19:[1,2825],21:[1,2829],22:2823,32:2822,195:2824,209:2826,210:[1,2828],211:[1,2827]},o($VA3,$Vy1),o($VA3,$Vz1),o($VA3,$VA1),o($VA3,$VB1),o($VB3,$VC1),o($VD1,$VE1,{157:2830}),o($VC3,$VG1),{115:[1,2831],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,2832]},o($VA3,$VH1),o($VB3,$Vq),o($VB3,$Vr),{96:[1,2834],102:2833,104:[1,2835],105:[1,2836],106:2837,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,2838]},o($VB3,$Vt),o($VB3,$Vu),o($Vv3,$VN3),{117:[1,2839]},o($Vv3,$VF3),o($Vx4,$VO3),o($Vy4,$VF4),{19:$Vn,21:$Vo,22:2840,209:52,210:$Vp},{19:$VF7,21:$VG7,22:2842,96:[1,2853],104:[1,2854],105:[1,2855],106:2852,176:2843,186:2841,191:2846,192:2847,193:2848,196:2851,199:[1,2856],200:[1,2857],201:[1,2862],202:[1,2863],203:[1,2864],204:[1,2865],205:[1,2858],206:[1,2859],207:[1,2860],208:[1,2861],209:2845,210:$VH7},o($Vz4,$VF4),{19:$Vn,21:$Vo,22:2866,209:52,210:$Vp},{19:$VI7,21:$VJ7,22:2868,96:[1,2879],104:[1,2880],105:[1,2881],106:2878,176:2869,186:2867,191:2872,192:2873,193:2874,196:2877,199:[1,2882],200:[1,2883],201:[1,2888],202:[1,2889],203:[1,2890],204:[1,2891],205:[1,2884],206:[1,2885],207:[1,2886],208:[1,2887],209:2871,210:$VK7},o($VB3,$V43),o($VB3,$V53),o($VB3,$V63),o($VB3,$V73),o($VB3,$V83),{107:[1,2892]},o($VB3,$Vd3),o($VB4,$VF4),{19:$Vn,21:$Vo,22:2893,209:52,210:$Vp},{19:$VL7,21:$VM7,22:2895,96:[1,2906],104:[1,2907],105:[1,2908],106:2905,176:2896,186:2894,191:2899,192:2900,193:2901,196:2904,199:[1,2909],200:[1,2910],201:[1,2915],202:[1,2916],203:[1,2917],204:[1,2918],205:[1,2911],206:[1,2912],207:[1,2913],208:[1,2914],209:2898,210:$VN7},o($Vz3,$VQ4),o($VC3,$Vt5),o($VC3,$VC1),o($VC3,$Vq),o($VC3,$Vr),o($VC3,$Vt),o($VC3,$Vu),o($Vv3,$VN3),{117:[1,2919]},o($Vv3,$VF3),o($Vx4,$VO3),o($Vy4,$VF4),{19:$Vn,21:$Vo,22:2920,209:52,210:$Vp},{19:$VO7,21:$VP7,22:2922,96:[1,2933],104:[1,2934],105:[1,2935],106:2932,176:2923,186:2921,191:2926,192:2927,193:2928,196:2931,199:[1,2936],200:[1,2937],201:[1,2942],202:[1,2943],203:[1,2944],204:[1,2945],205:[1,2938],206:[1,2939],207:[1,2940],208:[1,2941],209:2925,210:$VQ7},o($Vz4,$VF4),{19:$Vn,21:$Vo,22:2946,209:52,210:$Vp},{19:$VR7,21:$VS7,22:2948,96:[1,2959],104:[1,2960],105:[1,2961],106:2958,176:2949,186:2947,191:2952,192:2953,193:2954,196:2957,199:[1,2962],200:[1,2963],201:[1,2968],202:[1,2969],203:[1,2970],204:[1,2971],205:[1,2964],206:[1,2965],207:[1,2966],208:[1,2967],209:2951,210:$VT7},o($VB3,$V43),o($VB3,$V53),o($VB3,$V63),o($VB3,$V73),o($VB3,$V83),{107:[1,2972]},o($VB3,$Vd3),o($VB4,$VF4),{19:$Vn,21:$Vo,22:2973,209:52,210:$Vp},{19:$VU7,21:$VV7,22:2975,96:[1,2986],104:[1,2987],105:[1,2988],106:2985,176:2976,186:2974,191:2979,192:2980,193:2981,196:2984,199:[1,2989],200:[1,2990],201:[1,2995],202:[1,2996],203:[1,2997],204:[1,2998],205:[1,2991],206:[1,2992],207:[1,2993],208:[1,2994],209:2978,210:$VW7},o($Vz3,$VQ4),o($VC3,$Vt5),o($VC3,$VC1),o($VC3,$Vq),o($VC3,$Vr),o($VC3,$Vt),o($VC3,$Vu),o($VX7,$Vt2,{79:2999,80:3000,187:3001,185:$VY7}),o($Vy6,$VZ7),o($Vx,$Vg,{51:3003,55:3004,36:3005,39:$Vy}),o($VA6,$V_7),o($Vx,$Vg,{55:3006,36:3007,39:$Vy}),o($VA6,$V$7),o($VA6,$V08),o($VA6,$Vg7),o($VA6,$Vh7),{115:[1,3008],118:195,119:196,120:$Vw1,122:$Vx1},o($VA6,$V11),o($VA6,$V21),{19:[1,3012],21:[1,3016],22:3010,32:3009,195:3011,209:3013,210:[1,3015],211:[1,3014]},o($VA6,$V18),o($VA6,$V28),o($V38,$Vr1,{89:3017}),o($VA6,$Vs1,{95:2454,91:3018,97:$Va7,98:$VL,99:$VM,100:$VN}),o($V38,$Vy1),o($V38,$Vz1),o($V38,$VA1),o($V38,$VB1),{96:[1,3019]},o($V38,$VH1),{66:[1,3020]},o($Vd7,$Vx2,{95:1979,91:3021,97:$VC6,98:$VL,99:$VM,100:$VN}),o($Vc7,$Vy2),o($VA6,$Vz2,{86:3022,91:3023,87:3024,95:3025,101:3027,103:3028,97:$V48,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VA6,$VB2,{86:3022,91:3023,87:3024,95:3025,101:3027,103:3028,97:$V48,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VA6,$VC2,{86:3022,91:3023,87:3024,95:3025,101:3027,103:3028,97:$V48,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vi7,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,158:[1,3029],159:378,160:379,161:380,162:381,176:384,180:$VU2,191:389,192:390,193:391,196:394,199:$VV2,200:$VW2,201:$VX2,202:$VY2,203:$VZ2,204:$V_2,205:$V$2,206:$V03,207:$V13,208:$V23,209:388,210:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3030,117:$VG2,143:$VH2,184:$VI2}),o($Vf7,$VR1),o($Vf7,$Vl),o($Vf7,$Vm),o($Vf7,$Vq),o($Vf7,$Vr),o($Vf7,$Vs),o($Vf7,$Vt),o($Vf7,$Vu),o($Vc7,$V43),o($Vi7,$V53),o($Vi7,$V63),o($Vi7,$V73),o($Vi7,$V83),{107:[1,3031]},o($Vi7,$Vd3),o($VX7,$Vt2,{80:3000,187:3001,79:3032,185:$VY7}),o($V58,$Vr6,{147:3033,148:3034,151:$V68,152:$V78,153:$V88,154:$V98}),o($Va8,$Vx6),o($Vb8,$Vz6,{52:3039}),o($Vc8,$VB6,{56:3040}),o($VC,$VD,{59:3041,69:3042,71:3043,72:3044,88:3047,90:3048,83:3050,84:3051,85:3052,74:3053,40:3054,91:3058,22:3059,87:3061,114:3062,95:3066,209:3069,101:3070,103:3071,19:[1,3068],21:[1,3073],65:[1,3045],67:[1,3046],75:[1,3063],76:[1,3064],77:[1,3065],81:[1,3049],92:[1,3055],93:[1,3056],94:[1,3057],97:$Vd8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,156:[1,3060],210:[1,3072]}),o($V58,$Vr6,{148:3034,147:3074,151:$V68,152:$V78,153:$V88,154:$V98}),o($Vu2,$Vt2,{80:2507,187:2508,79:3075,185:$Vj7}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3076,117:$VG2,143:$VH2,184:$VI2}),o($Vu2,$Vt2,{80:2507,187:2508,79:3077,185:$Vj7}),o($Vo1,$Vx2,{95:2016,91:3078,97:$VD6,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vw4),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:3079,188:[1,3080]}),{19:$VI3,21:$VJ3,22:614,124:3081,194:$VK3,209:617,210:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:3082,188:[1,3083]}),{19:$VI3,21:$VJ3,22:614,124:3084,194:$VK3,209:617,210:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,3085]},o($Vt1,$VH1),{96:[1,3087],102:3086,104:[1,3088],105:[1,3089],106:3090,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,3091]},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:3092,188:[1,3093]}),{19:$VI3,21:$VJ3,22:614,124:3094,194:$VK3,209:617,210:$VL3},o($Vt1,$V84),{117:[1,3095]},{19:[1,3098],21:[1,3101],22:3097,83:3096,209:3099,210:[1,3100]},o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vr5),o($Vm1,$Vs5),{19:$VE6,21:$VF6,22:3103,83:3102,209:2051,210:$VG6},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vr5),o($Vo1,$Vs5),{19:$VH6,21:$VI6,22:3105,83:3104,209:2077,210:$VJ6},o($Vt1,$Vt5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vr5),o($Vp1,$Vs5),{19:$VK6,21:$VL6,22:3107,83:3106,209:2104,210:$VM6},o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vr5),o($Vm1,$Vs5),{19:$VN6,21:$VO6,22:3109,83:3108,209:2131,210:$VP6},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vr5),o($Vo1,$Vs5),{19:$VQ6,21:$VR6,22:3111,83:3110,209:2157,210:$VS6},o($Vt1,$Vt5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vr5),o($Vp1,$Vs5),{19:$VT6,21:$VU6,22:3113,83:3112,209:2184,210:$VV6},o($Vm1,$V_5),o($Vm1,$VC1),o($Vo1,$V_5),o($Vo1,$VC1),o($Vp1,$V_5),o($Vp1,$VC1),o($Va1,$Vs3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:3114}),o($Va1,$V11),o($Va1,$V21),{19:[1,3118],21:[1,3122],22:3116,32:3115,195:3117,209:3119,210:[1,3121],211:[1,3120]},{115:[1,3123],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vt3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:3124}),o($Vl2,$Vr1,{89:3125}),o($Vo1,$Vs1,{95:2597,91:3126,97:$Vl7,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,3127]},o($Vl2,$VH1),{66:[1,3128]},o($Vs2,$Vt2,{79:3129,80:3130,187:3131,185:[1,3132]}),o($Vu2,$Vt2,{79:3133,80:3134,187:3135,185:$Ve8}),o($Vm1,$Vx2,{95:2257,91:3137,97:$VW6,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:3138,91:3139,87:3140,95:3141,101:3143,103:3144,97:$Vf8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:3138,91:3139,87:3140,95:3141,101:3143,103:3144,97:$Vf8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:3138,91:3139,87:3140,95:3141,101:3143,103:3144,97:$Vf8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:3145,80:3146,187:3147,185:[1,3148]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,158:[1,3149],159:378,160:379,161:380,162:381,176:384,180:$VU2,191:389,192:390,193:391,196:394,199:$VV2,200:$VW2,201:$VX2,202:$VY2,203:$VZ2,204:$V_2,205:$V$2,206:$V03,207:$V13,208:$V23,209:388,210:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3150,117:$VG2,143:$VH2,184:$VI2}),o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,3151]},o($VF1,$Vd3),o($Vo1,$VQ4),{188:[1,3154],189:3152,190:[1,3153]},o($Vm1,$VE5),o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vb4),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Ve4),o($Vm1,$Vf4,{197:3155,198:3156,107:[1,3157]}),o($Vm1,$Vg4),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($VH5,$V93),o($VH5,$Va3),o($VH5,$Vb3),o($VH5,$Vc3),{188:[1,3160],189:3158,190:[1,3159]},o($Vo1,$VE5),o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vb4),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Ve4),o($Vo1,$Vf4,{197:3161,198:3162,107:[1,3163]}),o($Vo1,$Vg4),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{19:[1,3166],21:[1,3169],22:3165,83:3164,209:3167,210:[1,3168]},{188:[1,3172],189:3170,190:[1,3171]},o($Vp1,$VE5),o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vb4),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Ve4),o($Vp1,$Vf4,{197:3173,198:3174,107:[1,3175]}),o($Vp1,$Vg4),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),o($Vo1,$VQ4),{188:[1,3178],189:3176,190:[1,3177]},o($Vm1,$VE5),o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vb4),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Ve4),o($Vm1,$Vf4,{197:3179,198:3180,107:[1,3181]}),o($Vm1,$Vg4),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($VH5,$V93),o($VH5,$Va3),o($VH5,$Vb3),o($VH5,$Vc3),{188:[1,3184],189:3182,190:[1,3183]},o($Vo1,$VE5),o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vb4),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Ve4),o($Vo1,$Vf4,{197:3185,198:3186,107:[1,3187]}),o($Vo1,$Vg4),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{19:[1,3190],21:[1,3193],22:3189,83:3188,209:3191,210:[1,3192]},{188:[1,3196],189:3194,190:[1,3195]},o($Vp1,$VE5),o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vb4),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Ve4),o($Vp1,$Vf4,{197:3197,198:3198,107:[1,3199]}),o($Vp1,$Vg4),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),o($Vx3,$V_5),o($Vx3,$VC1),o($Vy3,$V_5),o($Vy3,$VC1),o($Vz3,$V_5),o($Vz3,$VC1),o($Vv3,$Vs3),o($Vv3,$Vi2),o($Vv3,$Vd2),o($Vv3,$Ve2),o($Vy3,$Vn1,{78:3200}),o($Vv3,$V11),o($Vv3,$V21),{19:[1,3204],21:[1,3208],22:3202,32:3201,195:3203,209:3205,210:[1,3207],211:[1,3206]},{115:[1,3209],118:195,119:196,120:$Vw1,122:$Vx1},o($Vv3,$Vt3),o($Vv3,$Vk2),o($Vy3,$Vn1,{78:3210}),o($Vx4,$Vr1,{89:3211}),o($Vy3,$Vs1,{95:2810,91:3212,97:$VE7,98:$VL,99:$VM,100:$VN}),o($Vx4,$Vy1),o($Vx4,$Vz1),o($Vx4,$VA1),o($Vx4,$VB1),{96:[1,3213]},o($Vx4,$VH1),{66:[1,3214]},o($Vy4,$Vt2,{79:3215,80:3216,187:3217,185:[1,3218]}),o($Vz4,$Vt2,{79:3219,80:3220,187:3221,185:$Vg8}),o($Vx3,$Vx2,{95:2371,91:3223,97:$V_6,98:$VL,99:$VM,100:$VN}),o($VA3,$Vy2),o($Vy3,$Vz2,{86:3224,91:3225,87:3226,95:3227,101:3229,103:3230,97:$Vh8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VB2,{86:3224,91:3225,87:3226,95:3227,101:3229,103:3230,97:$Vh8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VC2,{86:3224,91:3225,87:3226,95:3227,101:3229,103:3230,97:$Vh8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VC3,$VD2),o($VB4,$Vt2,{79:3231,80:3232,187:3233,185:[1,3234]}),o($VB5,$VR1),o($VB5,$Vl),o($VB5,$Vm),o($VB5,$Vq),o($VB5,$Vr),o($VB5,$Vs),o($VB5,$Vt),o($VB5,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,158:[1,3235],159:378,160:379,161:380,162:381,176:384,180:$VU2,191:389,192:390,193:391,196:394,199:$VV2,200:$VW2,201:$VX2,202:$VY2,203:$VZ2,204:$V_2,205:$V$2,206:$V03,207:$V13,208:$V23,209:388,210:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3236,117:$VG2,143:$VH2,184:$VI2}),o($VA3,$V43),o($VC3,$V53),o($VC3,$V63),o($VC3,$V73),o($VC3,$V83),{107:[1,3237]},o($VC3,$Vd3),o($Vy3,$VQ4),{188:[1,3240],189:3238,190:[1,3239]},o($Vx3,$VE5),o($Vx3,$VF5),o($Vx3,$VG5),o($Vx3,$Vq),o($Vx3,$Vr),o($Vx3,$Vb4),o($Vx3,$Vc4),o($Vx3,$Vd4),o($Vx3,$Vt),o($Vx3,$Vu),o($Vx3,$Ve4),o($Vx3,$Vf4,{197:3241,198:3242,107:[1,3243]}),o($Vx3,$Vg4),o($Vx3,$Vh4),o($Vx3,$Vi4),o($Vx3,$Vj4),o($Vx3,$Vk4),o($Vx3,$Vl4),o($Vx3,$Vm4),o($Vx3,$Vn4),o($Vx3,$Vo4),o($VX6,$V93),o($VX6,$Va3),o($VX6,$Vb3),o($VX6,$Vc3),{188:[1,3246],189:3244,190:[1,3245]},o($Vy3,$VE5),o($Vy3,$VF5),o($Vy3,$VG5),o($Vy3,$Vq),o($Vy3,$Vr),o($Vy3,$Vb4),o($Vy3,$Vc4),o($Vy3,$Vd4),o($Vy3,$Vt),o($Vy3,$Vu),o($Vy3,$Ve4),o($Vy3,$Vf4,{197:3247,198:3248,107:[1,3249]}),o($Vy3,$Vg4),o($Vy3,$Vh4),o($Vy3,$Vi4),o($Vy3,$Vj4),o($Vy3,$Vk4),o($Vy3,$Vl4),o($Vy3,$Vm4),o($Vy3,$Vn4),o($Vy3,$Vo4),o($VY6,$V93),o($VY6,$Va3),o($VY6,$Vb3),o($VY6,$Vc3),{19:[1,3252],21:[1,3255],22:3251,83:3250,209:3253,210:[1,3254]},{188:[1,3258],189:3256,190:[1,3257]},o($Vz3,$VE5),o($Vz3,$VF5),o($Vz3,$VG5),o($Vz3,$Vq),o($Vz3,$Vr),o($Vz3,$Vb4),o($Vz3,$Vc4),o($Vz3,$Vd4),o($Vz3,$Vt),o($Vz3,$Vu),o($Vz3,$Ve4),o($Vz3,$Vf4,{197:3259,198:3260,107:[1,3261]}),o($Vz3,$Vg4),o($Vz3,$Vh4),o($Vz3,$Vi4),o($Vz3,$Vj4),o($Vz3,$Vk4),o($Vz3,$Vl4),o($Vz3,$Vm4),o($Vz3,$Vn4),o($Vz3,$Vo4),o($VZ6,$V93),o($VZ6,$Va3),o($VZ6,$Vb3),o($VZ6,$Vc3),o($Vy3,$VQ4),{188:[1,3264],189:3262,190:[1,3263]},o($Vx3,$VE5),o($Vx3,$VF5),o($Vx3,$VG5),o($Vx3,$Vq),o($Vx3,$Vr),o($Vx3,$Vb4),o($Vx3,$Vc4),o($Vx3,$Vd4),o($Vx3,$Vt),o($Vx3,$Vu),o($Vx3,$Ve4),o($Vx3,$Vf4,{197:3265,198:3266,107:[1,3267]}),o($Vx3,$Vg4),o($Vx3,$Vh4),o($Vx3,$Vi4),o($Vx3,$Vj4),o($Vx3,$Vk4),o($Vx3,$Vl4),o($Vx3,$Vm4),o($Vx3,$Vn4),o($Vx3,$Vo4),o($VX6,$V93),o($VX6,$Va3),o($VX6,$Vb3),o($VX6,$Vc3),{188:[1,3270],189:3268,190:[1,3269]},o($Vy3,$VE5),o($Vy3,$VF5),o($Vy3,$VG5),o($Vy3,$Vq),o($Vy3,$Vr),o($Vy3,$Vb4),o($Vy3,$Vc4),o($Vy3,$Vd4),o($Vy3,$Vt),o($Vy3,$Vu),o($Vy3,$Ve4),o($Vy3,$Vf4,{197:3271,198:3272,107:[1,3273]}),o($Vy3,$Vg4),o($Vy3,$Vh4),o($Vy3,$Vi4),o($Vy3,$Vj4),o($Vy3,$Vk4),o($Vy3,$Vl4),o($Vy3,$Vm4),o($Vy3,$Vn4),o($Vy3,$Vo4),o($VY6,$V93),o($VY6,$Va3),o($VY6,$Vb3),o($VY6,$Vc3),{19:[1,3276],21:[1,3279],22:3275,83:3274,209:3277,210:[1,3278]},{188:[1,3282],189:3280,190:[1,3281]},o($Vz3,$VE5),o($Vz3,$VF5),o($Vz3,$VG5),o($Vz3,$Vq),o($Vz3,$Vr),o($Vz3,$Vb4),o($Vz3,$Vc4),o($Vz3,$Vd4),o($Vz3,$Vt),o($Vz3,$Vu),o($Vz3,$Ve4),o($Vz3,$Vf4,{197:3283,198:3284,107:[1,3285]}),o($Vz3,$Vg4),o($Vz3,$Vh4),o($Vz3,$Vi4),o($Vz3,$Vj4),o($Vz3,$Vk4),o($Vz3,$Vl4),o($Vz3,$Vm4),o($Vz3,$Vn4),o($Vz3,$Vo4),o($VZ6,$V93),o($VZ6,$Va3),o($VZ6,$Vb3),o($VZ6,$Vc3),o($V34,$Vi8),o($Vq6,$VG3),o($V34,$VH3,{31:3286,188:[1,3287]}),{19:$VI3,21:$VJ3,22:614,124:3288,194:$VK3,209:617,210:$VL3},o($Vy6,$Vj8),o($VA6,$VB6,{56:3289}),o($VC,$VD,{59:3290,69:3291,71:3292,72:3293,88:3296,90:3297,83:3299,84:3300,85:3301,74:3302,40:3303,91:3307,22:3308,87:3310,114:3311,95:3315,209:3318,101:3319,103:3320,19:[1,3317],21:[1,3322],65:[1,3294],67:[1,3295],75:[1,3312],76:[1,3313],77:[1,3314],81:[1,3298],92:[1,3304],93:[1,3305],94:[1,3306],97:$Vk8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,156:[1,3309],210:[1,3321]}),o($VA6,$Vl8),o($VC,$VD,{59:3323,69:3324,71:3325,72:3326,88:3329,90:3330,83:3332,84:3333,85:3334,74:3335,40:3336,91:3340,22:3341,87:3343,114:3344,95:3348,209:3351,101:3352,103:3353,19:[1,3350],21:[1,3355],65:[1,3327],67:[1,3328],75:[1,3345],76:[1,3346],77:[1,3347],81:[1,3331],92:[1,3337],93:[1,3338],94:[1,3339],97:$Vm8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,156:[1,3342],210:[1,3354]}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3356,117:$VG2,143:$VH2,184:$VI2}),o($VA6,$VR1),o($VA6,$Vl),o($VA6,$Vm),o($VA6,$Vq),o($VA6,$Vr),o($VA6,$Vs),o($VA6,$Vt),o($VA6,$Vu),o($VA6,$Vx2,{95:2454,91:3357,97:$Va7,98:$VL,99:$VM,100:$VN}),o($V38,$Vy2),o($V38,$V43),o($VA6,$Vn8),o($Vc7,$VO3),o($Ve7,$VP3),o($Ve7,$VQ3),o($Ve7,$VR3),{96:[1,3358]},o($Ve7,$VH1),{96:[1,3360],102:3359,104:[1,3361],105:[1,3362],106:3363,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,3364]},o($Ve7,$V84),{117:[1,3365]},{19:[1,3368],21:[1,3371],22:3367,83:3366,209:3369,210:[1,3370]},o($V34,$Vo8),o($V58,$Vn1,{78:3372}),o($V58,$V$6),o($V58,$V07),o($V58,$V17),o($V58,$V27),o($V58,$V37),o($Va8,$V47,{53:3373,47:[1,3374]}),o($Vb8,$V57,{57:3375,49:[1,3376]}),o($Vc8,$V67),o($Vc8,$V77,{70:3377,72:3378,74:3379,40:3380,114:3381,75:[1,3382],76:[1,3383],77:[1,3384],115:$VD,120:$VD,122:$VD}),o($Vc8,$V87),o($Vc8,$V97,{73:3385,69:3386,88:3387,90:3388,91:3392,95:3393,92:[1,3389],93:[1,3390],94:[1,3391],97:$Vp8,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:3395,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vc8,$Vb7),o($Vq8,$Vr1,{89:3396}),o($Vr8,$Vs1,{95:3066,91:3397,97:$Vd8,98:$VL,99:$VM,100:$VN}),o($Vs8,$Vu1,{82:3398}),o($Vs8,$Vu1,{82:3399}),o($Vs8,$Vu1,{82:3400}),o($Vc8,$Vv1,{101:3070,103:3071,87:3401,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vt8,$Vg7),o($Vt8,$Vh7),o($Vq8,$Vy1),o($Vq8,$Vz1),o($Vq8,$VA1),o($Vq8,$VB1),o($Vs8,$VC1),o($VD1,$VE1,{157:3402}),o($Vu8,$VG1),{115:[1,3403],118:195,119:196,120:$Vw1,122:$Vx1},o($Vt8,$V11),o($Vt8,$V21),{19:[1,3407],21:[1,3411],22:3405,32:3404,195:3406,209:3408,210:[1,3410],211:[1,3409]},{96:[1,3412]},o($Vq8,$VH1),o($Vs8,$Vq),o($Vs8,$Vr),{96:[1,3414],102:3413,104:[1,3415],105:[1,3416],106:3417,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,3418]},o($Vs8,$Vt),o($Vs8,$Vu),o($V58,$Vn1,{78:3419}),o($Va1,$VN3),{117:[1,3420]},o($Va1,$VF3),o($Vl2,$VO3),o($Vs2,$VF4),{19:$Vn,21:$Vo,22:3421,209:52,210:$Vp},{19:$Vv8,21:$Vw8,22:3423,96:[1,3434],104:[1,3435],105:[1,3436],106:3433,176:3424,186:3422,191:3427,192:3428,193:3429,196:3432,199:[1,3437],200:[1,3438],201:[1,3443],202:[1,3444],203:[1,3445],204:[1,3446],205:[1,3439],206:[1,3440],207:[1,3441],208:[1,3442],209:3426,210:$Vx8},o($Vu2,$VF4),{19:$Vn,21:$Vo,22:3447,209:52,210:$Vp},{19:$Vy8,21:$Vz8,22:3449,96:[1,3460],104:[1,3461],105:[1,3462],106:3459,176:3450,186:3448,191:3453,192:3454,193:3455,196:3458,199:[1,3463],200:[1,3464],201:[1,3469],202:[1,3470],203:[1,3471],204:[1,3472],205:[1,3465],206:[1,3466],207:[1,3467],208:[1,3468],209:3452,210:$VA8},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,3473]},o($Vt1,$Vd3),o($Vw2,$VF4),{19:$Vn,21:$Vo,22:3474,209:52,210:$Vp},{19:$VB8,21:$VC8,22:3476,96:[1,3487],104:[1,3488],105:[1,3489],106:3486,176:3477,186:3475,191:3480,192:3481,193:3482,196:3485,199:[1,3490],200:[1,3491],201:[1,3496],202:[1,3497],203:[1,3498],204:[1,3499],205:[1,3492],206:[1,3493],207:[1,3494],208:[1,3495],209:3479,210:$VD8},o($Vp1,$VQ4),o($VF1,$Vt5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Vm1,$V_5),o($Vm1,$VC1),o($Vo1,$V_5),o($Vo1,$VC1),o($Vp1,$V_5),o($Vp1,$VC1),o($Vm1,$V_5),o($Vm1,$VC1),o($Vo1,$V_5),o($Vo1,$VC1),o($Vp1,$V_5),o($Vp1,$VC1),o($Vu2,$Vt2,{80:3134,187:3135,79:3500,185:$Ve8}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3501,117:$VG2,143:$VH2,184:$VI2}),o($Vu2,$Vt2,{80:3134,187:3135,79:3502,185:$Ve8}),o($Vo1,$Vx2,{95:2597,91:3503,97:$Vl7,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vw4),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:3504,188:[1,3505]}),{19:$VI3,21:$VJ3,22:614,124:3506,194:$VK3,209:617,210:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:3507,188:[1,3508]}),{19:$VI3,21:$VJ3,22:614,124:3509,194:$VK3,209:617,210:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,3510]},o($Vt1,$VH1),{96:[1,3512],102:3511,104:[1,3513],105:[1,3514],106:3515,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,3516]},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:3517,188:[1,3518]}),{19:$VI3,21:$VJ3,22:614,124:3519,194:$VK3,209:617,210:$VL3},o($Vt1,$V84),{117:[1,3520]},{19:[1,3523],21:[1,3526],22:3522,83:3521,209:3524,210:[1,3525]},o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vr5),o($Vm1,$Vs5),{19:$Vm7,21:$Vn7,22:3528,83:3527,209:2632,210:$Vo7},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vr5),o($Vo1,$Vs5),{19:$Vp7,21:$Vq7,22:3530,83:3529,209:2658,210:$Vr7},o($Vt1,$Vt5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vr5),o($Vp1,$Vs5),{19:$Vs7,21:$Vt7,22:3532,83:3531,209:2685,210:$Vu7},o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vr5),o($Vm1,$Vs5),{19:$Vv7,21:$Vw7,22:3534,83:3533,209:2712,210:$Vx7},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vr5),o($Vo1,$Vs5),{19:$Vy7,21:$Vz7,22:3536,83:3535,209:2738,210:$VA7},o($Vt1,$Vt5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vr5),o($Vp1,$Vs5),{19:$VB7,21:$VC7,22:3538,83:3537,209:2765,210:$VD7},o($Vz4,$Vt2,{80:3220,187:3221,79:3539,185:$Vg8}),o($Vv3,$VR1),o($Vv3,$Vl),o($Vv3,$Vm),o($Vv3,$Vq),o($Vv3,$Vr),o($Vv3,$Vs),o($Vv3,$Vt),o($Vv3,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3540,117:$VG2,143:$VH2,184:$VI2}),o($Vz4,$Vt2,{80:3220,187:3221,79:3541,185:$Vg8}),o($Vy3,$Vx2,{95:2810,91:3542,97:$VE7,98:$VL,99:$VM,100:$VN}),o($Vx4,$Vy2),o($Vx4,$V43),o($Vv3,$Vw4),o($VA5,$VF3),o($Vx3,$VG3),o($VA5,$VH3,{31:3543,188:[1,3544]}),{19:$VI3,21:$VJ3,22:614,124:3545,194:$VK3,209:617,210:$VL3},o($Vv3,$VM3),o($Vy3,$VG3),o($Vv3,$VH3,{31:3546,188:[1,3547]}),{19:$VI3,21:$VJ3,22:614,124:3548,194:$VK3,209:617,210:$VL3},o($VA3,$VO3),o($VB3,$VP3),o($VB3,$VQ3),o($VB3,$VR3),{96:[1,3549]},o($VB3,$VH1),{96:[1,3551],102:3550,104:[1,3552],105:[1,3553],106:3554,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,3555]},o($VB5,$VN3),o($Vz3,$VG3),o($VB5,$VH3,{31:3556,188:[1,3557]}),{19:$VI3,21:$VJ3,22:614,124:3558,194:$VK3,209:617,210:$VL3},o($VB3,$V84),{117:[1,3559]},{19:[1,3562],21:[1,3565],22:3561,83:3560,209:3563,210:[1,3564]},o($Vy4,$VS1),o($Vy4,$VT1),o($Vy4,$VU1),o($Vx3,$Vr5),o($Vx3,$Vs5),{19:$VF7,21:$VG7,22:3567,83:3566,209:2845,210:$VH7},o($Vz4,$VS1),o($Vz4,$VT1),o($Vz4,$VU1),o($Vy3,$Vr5),o($Vy3,$Vs5),{19:$VI7,21:$VJ7,22:3569,83:3568,209:2871,210:$VK7},o($VB3,$Vt5),o($VB3,$VC1),o($VB3,$Vq),o($VB3,$Vr),o($VB3,$Vt),o($VB3,$Vu),o($VB4,$VS1),o($VB4,$VT1),o($VB4,$VU1),o($Vz3,$Vr5),o($Vz3,$Vs5),{19:$VL7,21:$VM7,22:3571,83:3570,209:2898,210:$VN7},o($Vy4,$VS1),o($Vy4,$VT1),o($Vy4,$VU1),o($Vx3,$Vr5),o($Vx3,$Vs5),{19:$VO7,21:$VP7,22:3573,83:3572,209:2925,210:$VQ7},o($Vz4,$VS1),o($Vz4,$VT1),o($Vz4,$VU1),o($Vy3,$Vr5),o($Vy3,$Vs5),{19:$VR7,21:$VS7,22:3575,83:3574,209:2951,210:$VT7},o($VB3,$Vt5),o($VB3,$VC1),o($VB3,$Vq),o($VB3,$Vr),o($VB3,$Vt),o($VB3,$Vu),o($VB4,$VS1),o($VB4,$VT1),o($VB4,$VU1),o($Vz3,$Vr5),o($Vz3,$Vs5),{19:$VU7,21:$VV7,22:3577,83:3576,209:2978,210:$VW7},o($VX7,$VF4),{19:$Vn,21:$Vo,22:3578,209:52,210:$Vp},{19:$VE8,21:$VF8,22:3580,96:[1,3591],104:[1,3592],105:[1,3593],106:3590,176:3581,186:3579,191:3584,192:3585,193:3586,196:3589,199:[1,3594],200:[1,3595],201:[1,3600],202:[1,3601],203:[1,3602],204:[1,3603],205:[1,3596],206:[1,3597],207:[1,3598],208:[1,3599],209:3583,210:$VG8},o($Vy6,$V57,{57:3604,49:[1,3605]}),o($VA6,$V67),o($VA6,$V77,{70:3606,72:3607,74:3608,40:3609,114:3610,75:[1,3611],76:[1,3612],77:[1,3613],115:$VD,120:$VD,122:$VD}),o($VA6,$V87),o($VA6,$V97,{73:3614,69:3615,88:3616,90:3617,91:3621,95:3622,92:[1,3618],93:[1,3619],94:[1,3620],97:$VH8,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:3624,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VA6,$Vb7),o($Vc7,$Vr1,{89:3625}),o($Vd7,$Vs1,{95:3315,91:3626,97:$Vk8,98:$VL,99:$VM,100:$VN}),o($Ve7,$Vu1,{82:3627}),o($Ve7,$Vu1,{82:3628}),o($Ve7,$Vu1,{82:3629}),o($VA6,$Vv1,{101:3319,103:3320,87:3630,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vf7,$Vg7),o($Vf7,$Vh7),o($Vc7,$Vy1),o($Vc7,$Vz1),o($Vc7,$VA1),o($Vc7,$VB1),o($Ve7,$VC1),o($VD1,$VE1,{157:3631}),o($Vi7,$VG1),{115:[1,3632],118:195,119:196,120:$Vw1,122:$Vx1},o($Vf7,$V11),o($Vf7,$V21),{19:[1,3636],21:[1,3640],22:3634,32:3633,195:3635,209:3637,210:[1,3639],211:[1,3638]},{96:[1,3641]},o($Vc7,$VH1),o($Ve7,$Vq),o($Ve7,$Vr),{96:[1,3643],102:3642,104:[1,3644],105:[1,3645],106:3646,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,3647]},o($Ve7,$Vt),o($Ve7,$Vu),o($VA6,$V67),o($VA6,$V77,{70:3648,72:3649,74:3650,40:3651,114:3652,75:[1,3653],76:[1,3654],77:[1,3655],115:$VD,120:$VD,122:$VD}),o($VA6,$V87),o($VA6,$V97,{73:3656,69:3657,88:3658,90:3659,91:3663,95:3664,92:[1,3660],93:[1,3661],94:[1,3662],97:$VI8,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:3666,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VA6,$Vb7),o($Vc7,$Vr1,{89:3667}),o($Vd7,$Vs1,{95:3348,91:3668,97:$Vm8,98:$VL,99:$VM,100:$VN}),o($Ve7,$Vu1,{82:3669}),o($Ve7,$Vu1,{82:3670}),o($Ve7,$Vu1,{82:3671}),o($VA6,$Vv1,{101:3352,103:3353,87:3672,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vf7,$Vg7),o($Vf7,$Vh7),o($Vc7,$Vy1),o($Vc7,$Vz1),o($Vc7,$VA1),o($Vc7,$VB1),o($Ve7,$VC1),o($VD1,$VE1,{157:3673}),o($Vi7,$VG1),{115:[1,3674],118:195,119:196,120:$Vw1,122:$Vx1},o($Vf7,$V11),o($Vf7,$V21),{19:[1,3678],21:[1,3682],22:3676,32:3675,195:3677,209:3679,210:[1,3681],211:[1,3680]},{96:[1,3683]},o($Vc7,$VH1),o($Ve7,$Vq),o($Ve7,$Vr),{96:[1,3685],102:3684,104:[1,3686],105:[1,3687],106:3688,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,3689]},o($Ve7,$Vt),o($Ve7,$Vu),{117:[1,3690]},o($V38,$VO3),o($Ve7,$V43),o($Ve7,$V53),o($Ve7,$V63),o($Ve7,$V73),o($Ve7,$V83),{107:[1,3691]},o($Ve7,$Vd3),o($Vf7,$VQ4),o($Vi7,$Vt5),o($Vi7,$VC1),o($Vi7,$Vq),o($Vi7,$Vr),o($Vi7,$Vt),o($Vi7,$Vu),o($VJ8,$Vt2,{79:3692,80:3693,187:3694,185:$VK8}),o($Vb8,$VZ7),o($Vx,$Vg,{51:3696,55:3697,36:3698,39:$Vy}),o($Vc8,$V_7),o($Vx,$Vg,{55:3699,36:3700,39:$Vy}),o($Vc8,$V$7),o($Vc8,$V08),o($Vc8,$Vg7),o($Vc8,$Vh7),{115:[1,3701],118:195,119:196,120:$Vw1,122:$Vx1},o($Vc8,$V11),o($Vc8,$V21),{19:[1,3705],21:[1,3709],22:3703,32:3702,195:3704,209:3706,210:[1,3708],211:[1,3707]},o($Vc8,$V18),o($Vc8,$V28),o($VL8,$Vr1,{89:3710}),o($Vc8,$Vs1,{95:3393,91:3711,97:$Vp8,98:$VL,99:$VM,100:$VN}),o($VL8,$Vy1),o($VL8,$Vz1),o($VL8,$VA1),o($VL8,$VB1),{96:[1,3712]},o($VL8,$VH1),{66:[1,3713]},o($Vr8,$Vx2,{95:3066,91:3714,97:$Vd8,98:$VL,99:$VM,100:$VN}),o($Vq8,$Vy2),o($Vc8,$Vz2,{86:3715,91:3716,87:3717,95:3718,101:3720,103:3721,97:$VM8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vc8,$VB2,{86:3715,91:3716,87:3717,95:3718,101:3720,103:3721,97:$VM8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vc8,$VC2,{86:3715,91:3716,87:3717,95:3718,101:3720,103:3721,97:$VM8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vu8,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,158:[1,3722],159:378,160:379,161:380,162:381,176:384,180:$VU2,191:389,192:390,193:391,196:394,199:$VV2,200:$VW2,201:$VX2,202:$VY2,203:$VZ2,204:$V_2,205:$V$2,206:$V03,207:$V13,208:$V23,209:388,210:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3723,117:$VG2,143:$VH2,184:$VI2}),o($Vt8,$VR1),o($Vt8,$Vl),o($Vt8,$Vm),o($Vt8,$Vq),o($Vt8,$Vr),o($Vt8,$Vs),o($Vt8,$Vt),o($Vt8,$Vu),o($Vq8,$V43),o($Vu8,$V53),o($Vu8,$V63),o($Vu8,$V73),o($Vu8,$V83),{107:[1,3724]},o($Vu8,$Vd3),o($VJ8,$Vt2,{80:3693,187:3694,79:3725,185:$VK8}),o($Vo1,$VQ4),{188:[1,3728],189:3726,190:[1,3727]},o($Vm1,$VE5),o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vb4),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Ve4),o($Vm1,$Vf4,{197:3729,198:3730,107:[1,3731]}),o($Vm1,$Vg4),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($VH5,$V93),o($VH5,$Va3),o($VH5,$Vb3),o($VH5,$Vc3),{188:[1,3734],189:3732,190:[1,3733]},o($Vo1,$VE5),o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vb4),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Ve4),o($Vo1,$Vf4,{197:3735,198:3736,107:[1,3737]}),o($Vo1,$Vg4),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{19:[1,3740],21:[1,3743],22:3739,83:3738,209:3741,210:[1,3742]},{188:[1,3746],189:3744,190:[1,3745]},o($Vp1,$VE5),o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vb4),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Ve4),o($Vp1,$Vf4,{197:3747,198:3748,107:[1,3749]}),o($Vp1,$Vg4),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),o($Va1,$VN3),{117:[1,3750]},o($Va1,$VF3),o($Vl2,$VO3),o($Vs2,$VF4),{19:$Vn,21:$Vo,22:3751,209:52,210:$Vp},{19:$VN8,21:$VO8,22:3753,96:[1,3764],104:[1,3765],105:[1,3766],106:3763,176:3754,186:3752,191:3757,192:3758,193:3759,196:3762,199:[1,3767],200:[1,3768],201:[1,3773],202:[1,3774],203:[1,3775],204:[1,3776],205:[1,3769],206:[1,3770],207:[1,3771],208:[1,3772],209:3756,210:$VP8},o($Vu2,$VF4),{19:$Vn,21:$Vo,22:3777,209:52,210:$Vp},{19:$VQ8,21:$VR8,22:3779,96:[1,3790],104:[1,3791],105:[1,3792],106:3789,176:3780,186:3778,191:3783,192:3784,193:3785,196:3788,199:[1,3793],200:[1,3794],201:[1,3799],202:[1,3800],203:[1,3801],204:[1,3802],205:[1,3795],206:[1,3796],207:[1,3797],208:[1,3798],209:3782,210:$VS8},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,3803]},o($Vt1,$Vd3),o($Vw2,$VF4),{19:$Vn,21:$Vo,22:3804,209:52,210:$Vp},{19:$VT8,21:$VU8,22:3806,96:[1,3817],104:[1,3818],105:[1,3819],106:3816,176:3807,186:3805,191:3810,192:3811,193:3812,196:3815,199:[1,3820],200:[1,3821],201:[1,3826],202:[1,3827],203:[1,3828],204:[1,3829],205:[1,3822],206:[1,3823],207:[1,3824],208:[1,3825],209:3809,210:$VV8},o($Vp1,$VQ4),o($VF1,$Vt5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Vm1,$V_5),o($Vm1,$VC1),o($Vo1,$V_5),o($Vo1,$VC1),o($Vp1,$V_5),o($Vp1,$VC1),o($Vm1,$V_5),o($Vm1,$VC1),o($Vo1,$V_5),o($Vo1,$VC1),o($Vp1,$V_5),o($Vp1,$VC1),o($Vv3,$VN3),{117:[1,3830]},o($Vv3,$VF3),o($Vx4,$VO3),o($Vy4,$VF4),{19:$Vn,21:$Vo,22:3831,209:52,210:$Vp},{19:$VW8,21:$VX8,22:3833,96:[1,3844],104:[1,3845],105:[1,3846],106:3843,176:3834,186:3832,191:3837,192:3838,193:3839,196:3842,199:[1,3847],200:[1,3848],201:[1,3853],202:[1,3854],203:[1,3855],204:[1,3856],205:[1,3849],206:[1,3850],207:[1,3851],208:[1,3852],209:3836,210:$VY8},o($Vz4,$VF4),{19:$Vn,21:$Vo,22:3857,209:52,210:$Vp},{19:$VZ8,21:$V_8,22:3859,96:[1,3870],104:[1,3871],105:[1,3872],106:3869,176:3860,186:3858,191:3863,192:3864,193:3865,196:3868,199:[1,3873],200:[1,3874],201:[1,3879],202:[1,3880],203:[1,3881],204:[1,3882],205:[1,3875],206:[1,3876],207:[1,3877],208:[1,3878],209:3862,210:$V$8},o($VB3,$V43),o($VB3,$V53),o($VB3,$V63),o($VB3,$V73),o($VB3,$V83),{107:[1,3883]},o($VB3,$Vd3),o($VB4,$VF4),{19:$Vn,21:$Vo,22:3884,209:52,210:$Vp},{19:$V09,21:$V19,22:3886,96:[1,3897],104:[1,3898],105:[1,3899],106:3896,176:3887,186:3885,191:3890,192:3891,193:3892,196:3895,199:[1,3900],200:[1,3901],201:[1,3906],202:[1,3907],203:[1,3908],204:[1,3909],205:[1,3902],206:[1,3903],207:[1,3904],208:[1,3905],209:3889,210:$V29},o($Vz3,$VQ4),o($VC3,$Vt5),o($VC3,$VC1),o($VC3,$Vq),o($VC3,$Vr),o($VC3,$Vt),o($VC3,$Vu),o($Vx3,$V_5),o($Vx3,$VC1),o($Vy3,$V_5),o($Vy3,$VC1),o($Vz3,$V_5),o($Vz3,$VC1),o($Vx3,$V_5),o($Vx3,$VC1),o($Vy3,$V_5),o($Vy3,$VC1),o($Vz3,$V_5),o($Vz3,$VC1),{188:[1,3912],189:3910,190:[1,3911]},o($Vq6,$VE5),o($Vq6,$VF5),o($Vq6,$VG5),o($Vq6,$Vq),o($Vq6,$Vr),o($Vq6,$Vb4),o($Vq6,$Vc4),o($Vq6,$Vd4),o($Vq6,$Vt),o($Vq6,$Vu),o($Vq6,$Ve4),o($Vq6,$Vf4,{197:3913,198:3914,107:[1,3915]}),o($Vq6,$Vg4),o($Vq6,$Vh4),o($Vq6,$Vi4),o($Vq6,$Vj4),o($Vq6,$Vk4),o($Vq6,$Vl4),o($Vq6,$Vm4),o($Vq6,$Vn4),o($Vq6,$Vo4),o($V39,$V93),o($V39,$Va3),o($V39,$Vb3),o($V39,$Vc3),o($VA6,$V_7),o($Vx,$Vg,{55:3916,36:3917,39:$Vy}),o($VA6,$V$7),o($VA6,$V08),o($VA6,$Vg7),o($VA6,$Vh7),{115:[1,3918],118:195,119:196,120:$Vw1,122:$Vx1},o($VA6,$V11),o($VA6,$V21),{19:[1,3922],21:[1,3926],22:3920,32:3919,195:3921,209:3923,210:[1,3925],211:[1,3924]},o($VA6,$V18),o($VA6,$V28),o($V38,$Vr1,{89:3927}),o($VA6,$Vs1,{95:3622,91:3928,97:$VH8,98:$VL,99:$VM,100:$VN}),o($V38,$Vy1),o($V38,$Vz1),o($V38,$VA1),o($V38,$VB1),{96:[1,3929]},o($V38,$VH1),{66:[1,3930]},o($Vd7,$Vx2,{95:3315,91:3931,97:$Vk8,98:$VL,99:$VM,100:$VN}),o($Vc7,$Vy2),o($VA6,$Vz2,{86:3932,91:3933,87:3934,95:3935,101:3937,103:3938,97:$V49,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VA6,$VB2,{86:3932,91:3933,87:3934,95:3935,101:3937,103:3938,97:$V49,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VA6,$VC2,{86:3932,91:3933,87:3934,95:3935,101:3937,103:3938,97:$V49,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vi7,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,158:[1,3939],159:378,160:379,161:380,162:381,176:384,180:$VU2,191:389,192:390,193:391,196:394,199:$VV2,200:$VW2,201:$VX2,202:$VY2,203:$VZ2,204:$V_2,205:$V$2,206:$V03,207:$V13,208:$V23,209:388,210:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3940,117:$VG2,143:$VH2,184:$VI2}),o($Vf7,$VR1),o($Vf7,$Vl),o($Vf7,$Vm),o($Vf7,$Vq),o($Vf7,$Vr),o($Vf7,$Vs),o($Vf7,$Vt),o($Vf7,$Vu),o($Vc7,$V43),o($Vi7,$V53),o($Vi7,$V63),o($Vi7,$V73),o($Vi7,$V83),{107:[1,3941]},o($Vi7,$Vd3),o($VA6,$V$7),o($VA6,$V08),o($VA6,$Vg7),o($VA6,$Vh7),{115:[1,3942],118:195,119:196,120:$Vw1,122:$Vx1},o($VA6,$V11),o($VA6,$V21),{19:[1,3946],21:[1,3950],22:3944,32:3943,195:3945,209:3947,210:[1,3949],211:[1,3948]},o($VA6,$V18),o($VA6,$V28),o($V38,$Vr1,{89:3951}),o($VA6,$Vs1,{95:3664,91:3952,97:$VI8,98:$VL,99:$VM,100:$VN}),o($V38,$Vy1),o($V38,$Vz1),o($V38,$VA1),o($V38,$VB1),{96:[1,3953]},o($V38,$VH1),{66:[1,3954]},o($Vd7,$Vx2,{95:3348,91:3955,97:$Vm8,98:$VL,99:$VM,100:$VN}),o($Vc7,$Vy2),o($VA6,$Vz2,{86:3956,91:3957,87:3958,95:3959,101:3961,103:3962,97:$V59,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VA6,$VB2,{86:3956,91:3957,87:3958,95:3959,101:3961,103:3962,97:$V59,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VA6,$VC2,{86:3956,91:3957,87:3958,95:3959,101:3961,103:3962,97:$V59,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vi7,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,158:[1,3963],159:378,160:379,161:380,162:381,176:384,180:$VU2,191:389,192:390,193:391,196:394,199:$VV2,200:$VW2,201:$VX2,202:$VY2,203:$VZ2,204:$V_2,205:$V$2,206:$V03,207:$V13,208:$V23,209:388,210:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3964,117:$VG2,143:$VH2,184:$VI2}),o($Vf7,$VR1),o($Vf7,$Vl),o($Vf7,$Vm),o($Vf7,$Vq),o($Vf7,$Vr),o($Vf7,$Vs),o($Vf7,$Vt),o($Vf7,$Vu),o($Vc7,$V43),o($Vi7,$V53),o($Vi7,$V63),o($Vi7,$V73),o($Vi7,$V83),{107:[1,3965]},o($Vi7,$Vd3),o($VA6,$VQ4),{19:[1,3968],21:[1,3971],22:3967,83:3966,209:3969,210:[1,3970]},o($VV5,$Vi8),o($V58,$VG3),o($VV5,$VH3,{31:3972,188:[1,3973]}),{19:$VI3,21:$VJ3,22:614,124:3974,194:$VK3,209:617,210:$VL3},o($Vb8,$Vj8),o($Vc8,$VB6,{56:3975}),o($VC,$VD,{59:3976,69:3977,71:3978,72:3979,88:3982,90:3983,83:3985,84:3986,85:3987,74:3988,40:3989,91:3993,22:3994,87:3996,114:3997,95:4001,209:4004,101:4005,103:4006,19:[1,4003],21:[1,4008],65:[1,3980],67:[1,3981],75:[1,3998],76:[1,3999],77:[1,4000],81:[1,3984],92:[1,3990],93:[1,3991],94:[1,3992],97:$V69,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,156:[1,3995],210:[1,4007]}),o($Vc8,$Vl8),o($VC,$VD,{59:4009,69:4010,71:4011,72:4012,88:4015,90:4016,83:4018,84:4019,85:4020,74:4021,40:4022,91:4026,22:4027,87:4029,114:4030,95:4034,209:4037,101:4038,103:4039,19:[1,4036],21:[1,4041],65:[1,4013],67:[1,4014],75:[1,4031],76:[1,4032],77:[1,4033],81:[1,4017],92:[1,4023],93:[1,4024],94:[1,4025],97:$V79,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,156:[1,4028],210:[1,4040]}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4042,117:$VG2,143:$VH2,184:$VI2}),o($Vc8,$VR1),o($Vc8,$Vl),o($Vc8,$Vm),o($Vc8,$Vq),o($Vc8,$Vr),o($Vc8,$Vs),o($Vc8,$Vt),o($Vc8,$Vu),o($Vc8,$Vx2,{95:3393,91:4043,97:$Vp8,98:$VL,99:$VM,100:$VN}),o($VL8,$Vy2),o($VL8,$V43),o($Vc8,$Vn8),o($Vq8,$VO3),o($Vs8,$VP3),o($Vs8,$VQ3),o($Vs8,$VR3),{96:[1,4044]},o($Vs8,$VH1),{96:[1,4046],102:4045,104:[1,4047],105:[1,4048],106:4049,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,4050]},o($Vs8,$V84),{117:[1,4051]},{19:[1,4054],21:[1,4057],22:4053,83:4052,209:4055,210:[1,4056]},o($VV5,$Vo8),o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vr5),o($Vm1,$Vs5),{19:$Vv8,21:$Vw8,22:4059,83:4058,209:3426,210:$Vx8},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vr5),o($Vo1,$Vs5),{19:$Vy8,21:$Vz8,22:4061,83:4060,209:3452,210:$VA8},o($Vt1,$Vt5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vr5),o($Vp1,$Vs5),{19:$VB8,21:$VC8,22:4063,83:4062,209:3479,210:$VD8},o($Vo1,$VQ4),{188:[1,4066],189:4064,190:[1,4065]},o($Vm1,$VE5),o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vb4),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Ve4),o($Vm1,$Vf4,{197:4067,198:4068,107:[1,4069]}),o($Vm1,$Vg4),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($VH5,$V93),o($VH5,$Va3),o($VH5,$Vb3),o($VH5,$Vc3),{188:[1,4072],189:4070,190:[1,4071]},o($Vo1,$VE5),o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vb4),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Ve4),o($Vo1,$Vf4,{197:4073,198:4074,107:[1,4075]}),o($Vo1,$Vg4),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{19:[1,4078],21:[1,4081],22:4077,83:4076,209:4079,210:[1,4080]},{188:[1,4084],189:4082,190:[1,4083]},o($Vp1,$VE5),o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vb4),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Ve4),o($Vp1,$Vf4,{197:4085,198:4086,107:[1,4087]}),o($Vp1,$Vg4),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),o($Vy3,$VQ4),{188:[1,4090],189:4088,190:[1,4089]},o($Vx3,$VE5),o($Vx3,$VF5),o($Vx3,$VG5),o($Vx3,$Vq),o($Vx3,$Vr),o($Vx3,$Vb4),o($Vx3,$Vc4),o($Vx3,$Vd4),o($Vx3,$Vt),o($Vx3,$Vu),o($Vx3,$Ve4),o($Vx3,$Vf4,{197:4091,198:4092,107:[1,4093]}),o($Vx3,$Vg4),o($Vx3,$Vh4),o($Vx3,$Vi4),o($Vx3,$Vj4),o($Vx3,$Vk4),o($Vx3,$Vl4),o($Vx3,$Vm4),o($Vx3,$Vn4),o($Vx3,$Vo4),o($VX6,$V93),o($VX6,$Va3),o($VX6,$Vb3),o($VX6,$Vc3),{188:[1,4096],189:4094,190:[1,4095]},o($Vy3,$VE5),o($Vy3,$VF5),o($Vy3,$VG5),o($Vy3,$Vq),o($Vy3,$Vr),o($Vy3,$Vb4),o($Vy3,$Vc4),o($Vy3,$Vd4),o($Vy3,$Vt),o($Vy3,$Vu),o($Vy3,$Ve4),o($Vy3,$Vf4,{197:4097,198:4098,107:[1,4099]}),o($Vy3,$Vg4),o($Vy3,$Vh4),o($Vy3,$Vi4),o($Vy3,$Vj4),o($Vy3,$Vk4),o($Vy3,$Vl4),o($Vy3,$Vm4),o($Vy3,$Vn4),o($Vy3,$Vo4),o($VY6,$V93),o($VY6,$Va3),o($VY6,$Vb3),o($VY6,$Vc3),{19:[1,4102],21:[1,4105],22:4101,83:4100,209:4103,210:[1,4104]},{188:[1,4108],189:4106,190:[1,4107]},o($Vz3,$VE5),o($Vz3,$VF5),o($Vz3,$VG5),o($Vz3,$Vq),o($Vz3,$Vr),o($Vz3,$Vb4),o($Vz3,$Vc4),o($Vz3,$Vd4),o($Vz3,$Vt),o($Vz3,$Vu),o($Vz3,$Ve4),o($Vz3,$Vf4,{197:4109,198:4110,107:[1,4111]}),o($Vz3,$Vg4),o($Vz3,$Vh4),o($Vz3,$Vi4),o($Vz3,$Vj4),o($Vz3,$Vk4),o($Vz3,$Vl4),o($Vz3,$Vm4),o($Vz3,$Vn4),o($Vz3,$Vo4),o($VZ6,$V93),o($VZ6,$Va3),o($VZ6,$Vb3),o($VZ6,$Vc3),o($VX7,$VS1),o($VX7,$VT1),o($VX7,$VU1),o($Vq6,$Vr5),o($Vq6,$Vs5),{19:$VE8,21:$VF8,22:4113,83:4112,209:3583,210:$VG8},o($VA6,$Vl8),o($VC,$VD,{59:4114,69:4115,71:4116,72:4117,88:4120,90:4121,83:4123,84:4124,85:4125,74:4126,40:4127,91:4131,22:4132,87:4134,114:4135,95:4139,209:4142,101:4143,103:4144,19:[1,4141],21:[1,4146],65:[1,4118],67:[1,4119],75:[1,4136],76:[1,4137],77:[1,4138],81:[1,4122],92:[1,4128],93:[1,4129],94:[1,4130],97:$V89,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,156:[1,4133],210:[1,4145]}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4147,117:$VG2,143:$VH2,184:$VI2}),o($VA6,$VR1),o($VA6,$Vl),o($VA6,$Vm),o($VA6,$Vq),o($VA6,$Vr),o($VA6,$Vs),o($VA6,$Vt),o($VA6,$Vu),o($VA6,$Vx2,{95:3622,91:4148,97:$VH8,98:$VL,99:$VM,100:$VN}),o($V38,$Vy2),o($V38,$V43),o($VA6,$Vn8),o($Vc7,$VO3),o($Ve7,$VP3),o($Ve7,$VQ3),o($Ve7,$VR3),{96:[1,4149]},o($Ve7,$VH1),{96:[1,4151],102:4150,104:[1,4152],105:[1,4153],106:4154,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,4155]},o($Ve7,$V84),{117:[1,4156]},{19:[1,4159],21:[1,4162],22:4158,83:4157,209:4160,210:[1,4161]},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4163,117:$VG2,143:$VH2,184:$VI2}),o($VA6,$VR1),o($VA6,$Vl),o($VA6,$Vm),o($VA6,$Vq),o($VA6,$Vr),o($VA6,$Vs),o($VA6,$Vt),o($VA6,$Vu),o($VA6,$Vx2,{95:3664,91:4164,97:$VI8,98:$VL,99:$VM,100:$VN}),o($V38,$Vy2),o($V38,$V43),o($VA6,$Vn8),o($Vc7,$VO3),o($Ve7,$VP3),o($Ve7,$VQ3),o($Ve7,$VR3),{96:[1,4165]},o($Ve7,$VH1),{96:[1,4167],102:4166,104:[1,4168],105:[1,4169],106:4170,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,4171]},o($Ve7,$V84),{117:[1,4172]},{19:[1,4175],21:[1,4178],22:4174,83:4173,209:4176,210:[1,4177]},o($Ve7,$Vt5),o($Ve7,$VC1),o($Ve7,$Vq),o($Ve7,$Vr),o($Ve7,$Vt),o($Ve7,$Vu),o($VJ8,$VF4),{19:$Vn,21:$Vo,22:4179,209:52,210:$Vp},{19:$V99,21:$Va9,22:4181,96:[1,4192],104:[1,4193],105:[1,4194],106:4191,176:4182,186:4180,191:4185,192:4186,193:4187,196:4190,199:[1,4195],200:[1,4196],201:[1,4201],202:[1,4202],203:[1,4203],204:[1,4204],205:[1,4197],206:[1,4198],207:[1,4199],208:[1,4200],209:4184,210:$Vb9},o($Vb8,$V57,{57:4205,49:[1,4206]}),o($Vc8,$V67),o($Vc8,$V77,{70:4207,72:4208,74:4209,40:4210,114:4211,75:[1,4212],76:[1,4213],77:[1,4214],115:$VD,120:$VD,122:$VD}),o($Vc8,$V87),o($Vc8,$V97,{73:4215,69:4216,88:4217,90:4218,91:4222,95:4223,92:[1,4219],93:[1,4220],94:[1,4221],97:$Vc9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4225,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vc8,$Vb7),o($Vq8,$Vr1,{89:4226}),o($Vr8,$Vs1,{95:4001,91:4227,97:$V69,98:$VL,99:$VM,100:$VN}),o($Vs8,$Vu1,{82:4228}),o($Vs8,$Vu1,{82:4229}),o($Vs8,$Vu1,{82:4230}),o($Vc8,$Vv1,{101:4005,103:4006,87:4231,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vt8,$Vg7),o($Vt8,$Vh7),o($Vq8,$Vy1),o($Vq8,$Vz1),o($Vq8,$VA1),o($Vq8,$VB1),o($Vs8,$VC1),o($VD1,$VE1,{157:4232}),o($Vu8,$VG1),{115:[1,4233],118:195,119:196,120:$Vw1,122:$Vx1},o($Vt8,$V11),o($Vt8,$V21),{19:[1,4237],21:[1,4241],22:4235,32:4234,195:4236,209:4238,210:[1,4240],211:[1,4239]},{96:[1,4242]},o($Vq8,$VH1),o($Vs8,$Vq),o($Vs8,$Vr),{96:[1,4244],102:4243,104:[1,4245],105:[1,4246],106:4247,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,4248]},o($Vs8,$Vt),o($Vs8,$Vu),o($Vc8,$V67),o($Vc8,$V77,{70:4249,72:4250,74:4251,40:4252,114:4253,75:[1,4254],76:[1,4255],77:[1,4256],115:$VD,120:$VD,122:$VD}),o($Vc8,$V87),o($Vc8,$V97,{73:4257,69:4258,88:4259,90:4260,91:4264,95:4265,92:[1,4261],93:[1,4262],94:[1,4263],97:$Vd9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4267,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vc8,$Vb7),o($Vq8,$Vr1,{89:4268}),o($Vr8,$Vs1,{95:4034,91:4269,97:$V79,98:$VL,99:$VM,100:$VN}),o($Vs8,$Vu1,{82:4270}),o($Vs8,$Vu1,{82:4271}),o($Vs8,$Vu1,{82:4272}),o($Vc8,$Vv1,{101:4038,103:4039,87:4273,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vt8,$Vg7),o($Vt8,$Vh7),o($Vq8,$Vy1),o($Vq8,$Vz1),o($Vq8,$VA1),o($Vq8,$VB1),o($Vs8,$VC1),o($VD1,$VE1,{157:4274}),o($Vu8,$VG1),{115:[1,4275],118:195,119:196,120:$Vw1,122:$Vx1},o($Vt8,$V11),o($Vt8,$V21),{19:[1,4279],21:[1,4283],22:4277,32:4276,195:4278,209:4280,210:[1,4282],211:[1,4281]},{96:[1,4284]},o($Vq8,$VH1),o($Vs8,$Vq),o($Vs8,$Vr),{96:[1,4286],102:4285,104:[1,4287],105:[1,4288],106:4289,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,4290]},o($Vs8,$Vt),o($Vs8,$Vu),{117:[1,4291]},o($VL8,$VO3),o($Vs8,$V43),o($Vs8,$V53),o($Vs8,$V63),o($Vs8,$V73),o($Vs8,$V83),{107:[1,4292]},o($Vs8,$Vd3),o($Vt8,$VQ4),o($Vu8,$Vt5),o($Vu8,$VC1),o($Vu8,$Vq),o($Vu8,$Vr),o($Vu8,$Vt),o($Vu8,$Vu),o($Vm1,$V_5),o($Vm1,$VC1),o($Vo1,$V_5),o($Vo1,$VC1),o($Vp1,$V_5),o($Vp1,$VC1),o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vr5),o($Vm1,$Vs5),{19:$VN8,21:$VO8,22:4294,83:4293,209:3756,210:$VP8},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vr5),o($Vo1,$Vs5),{19:$VQ8,21:$VR8,22:4296,83:4295,209:3782,210:$VS8},o($Vt1,$Vt5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vr5),o($Vp1,$Vs5),{19:$VT8,21:$VU8,22:4298,83:4297,209:3809,210:$VV8},o($Vy4,$VS1),o($Vy4,$VT1),o($Vy4,$VU1),o($Vx3,$Vr5),o($Vx3,$Vs5),{19:$VW8,21:$VX8,22:4300,83:4299,209:3836,210:$VY8},o($Vz4,$VS1),o($Vz4,$VT1),o($Vz4,$VU1),o($Vy3,$Vr5),o($Vy3,$Vs5),{19:$VZ8,21:$V_8,22:4302,83:4301,209:3862,210:$V$8},o($VB3,$Vt5),o($VB3,$VC1),o($VB3,$Vq),o($VB3,$Vr),o($VB3,$Vt),o($VB3,$Vu),o($VB4,$VS1),o($VB4,$VT1),o($VB4,$VU1),o($Vz3,$Vr5),o($Vz3,$Vs5),{19:$V09,21:$V19,22:4304,83:4303,209:3889,210:$V29},o($Vq6,$V_5),o($Vq6,$VC1),o($VA6,$V67),o($VA6,$V77,{70:4305,72:4306,74:4307,40:4308,114:4309,75:[1,4310],76:[1,4311],77:[1,4312],115:$VD,120:$VD,122:$VD}),o($VA6,$V87),o($VA6,$V97,{73:4313,69:4314,88:4315,90:4316,91:4320,95:4321,92:[1,4317],93:[1,4318],94:[1,4319],97:$Ve9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4323,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VA6,$Vb7),o($Vc7,$Vr1,{89:4324}),o($Vd7,$Vs1,{95:4139,91:4325,97:$V89,98:$VL,99:$VM,100:$VN}),o($Ve7,$Vu1,{82:4326}),o($Ve7,$Vu1,{82:4327}),o($Ve7,$Vu1,{82:4328}),o($VA6,$Vv1,{101:4143,103:4144,87:4329,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vf7,$Vg7),o($Vf7,$Vh7),o($Vc7,$Vy1),o($Vc7,$Vz1),o($Vc7,$VA1),o($Vc7,$VB1),o($Ve7,$VC1),o($VD1,$VE1,{157:4330}),o($Vi7,$VG1),{115:[1,4331],118:195,119:196,120:$Vw1,122:$Vx1},o($Vf7,$V11),o($Vf7,$V21),{19:[1,4335],21:[1,4339],22:4333,32:4332,195:4334,209:4336,210:[1,4338],211:[1,4337]},{96:[1,4340]},o($Vc7,$VH1),o($Ve7,$Vq),o($Ve7,$Vr),{96:[1,4342],102:4341,104:[1,4343],105:[1,4344],106:4345,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,4346]},o($Ve7,$Vt),o($Ve7,$Vu),{117:[1,4347]},o($V38,$VO3),o($Ve7,$V43),o($Ve7,$V53),o($Ve7,$V63),o($Ve7,$V73),o($Ve7,$V83),{107:[1,4348]},o($Ve7,$Vd3),o($Vf7,$VQ4),o($Vi7,$Vt5),o($Vi7,$VC1),o($Vi7,$Vq),o($Vi7,$Vr),o($Vi7,$Vt),o($Vi7,$Vu),{117:[1,4349]},o($V38,$VO3),o($Ve7,$V43),o($Ve7,$V53),o($Ve7,$V63),o($Ve7,$V73),o($Ve7,$V83),{107:[1,4350]},o($Ve7,$Vd3),o($Vf7,$VQ4),o($Vi7,$Vt5),o($Vi7,$VC1),o($Vi7,$Vq),o($Vi7,$Vr),o($Vi7,$Vt),o($Vi7,$Vu),{188:[1,4353],189:4351,190:[1,4352]},o($V58,$VE5),o($V58,$VF5),o($V58,$VG5),o($V58,$Vq),o($V58,$Vr),o($V58,$Vb4),o($V58,$Vc4),o($V58,$Vd4),o($V58,$Vt),o($V58,$Vu),o($V58,$Ve4),o($V58,$Vf4,{197:4354,198:4355,107:[1,4356]}),o($V58,$Vg4),o($V58,$Vh4),o($V58,$Vi4),o($V58,$Vj4),o($V58,$Vk4),o($V58,$Vl4),o($V58,$Vm4),o($V58,$Vn4),o($V58,$Vo4),o($Vf9,$V93),o($Vf9,$Va3),o($Vf9,$Vb3),o($Vf9,$Vc3),o($Vc8,$V_7),o($Vx,$Vg,{55:4357,36:4358,39:$Vy}),o($Vc8,$V$7),o($Vc8,$V08),o($Vc8,$Vg7),o($Vc8,$Vh7),{115:[1,4359],118:195,119:196,120:$Vw1,122:$Vx1},o($Vc8,$V11),o($Vc8,$V21),{19:[1,4363],21:[1,4367],22:4361,32:4360,195:4362,209:4364,210:[1,4366],211:[1,4365]},o($Vc8,$V18),o($Vc8,$V28),o($VL8,$Vr1,{89:4368}),o($Vc8,$Vs1,{95:4223,91:4369,97:$Vc9,98:$VL,99:$VM,100:$VN}),o($VL8,$Vy1),o($VL8,$Vz1),o($VL8,$VA1),o($VL8,$VB1),{96:[1,4370]},o($VL8,$VH1),{66:[1,4371]},o($Vr8,$Vx2,{95:4001,91:4372,97:$V69,98:$VL,99:$VM,100:$VN}),o($Vq8,$Vy2),o($Vc8,$Vz2,{86:4373,91:4374,87:4375,95:4376,101:4378,103:4379,97:$Vg9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vc8,$VB2,{86:4373,91:4374,87:4375,95:4376,101:4378,103:4379,97:$Vg9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vc8,$VC2,{86:4373,91:4374,87:4375,95:4376,101:4378,103:4379,97:$Vg9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vu8,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,158:[1,4380],159:378,160:379,161:380,162:381,176:384,180:$VU2,191:389,192:390,193:391,196:394,199:$VV2,200:$VW2,201:$VX2,202:$VY2,203:$VZ2,204:$V_2,205:$V$2,206:$V03,207:$V13,208:$V23,209:388,210:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4381,117:$VG2,143:$VH2,184:$VI2}),o($Vt8,$VR1),o($Vt8,$Vl),o($Vt8,$Vm),o($Vt8,$Vq),o($Vt8,$Vr),o($Vt8,$Vs),o($Vt8,$Vt),o($Vt8,$Vu),o($Vq8,$V43),o($Vu8,$V53),o($Vu8,$V63),o($Vu8,$V73),o($Vu8,$V83),{107:[1,4382]},o($Vu8,$Vd3),o($Vc8,$V$7),o($Vc8,$V08),o($Vc8,$Vg7),o($Vc8,$Vh7),{115:[1,4383],118:195,119:196,120:$Vw1,122:$Vx1},o($Vc8,$V11),o($Vc8,$V21),{19:[1,4387],21:[1,4391],22:4385,32:4384,195:4386,209:4388,210:[1,4390],211:[1,4389]},o($Vc8,$V18),o($Vc8,$V28),o($VL8,$Vr1,{89:4392}),o($Vc8,$Vs1,{95:4265,91:4393,97:$Vd9,98:$VL,99:$VM,100:$VN}),o($VL8,$Vy1),o($VL8,$Vz1),o($VL8,$VA1),o($VL8,$VB1),{96:[1,4394]},o($VL8,$VH1),{66:[1,4395]},o($Vr8,$Vx2,{95:4034,91:4396,97:$V79,98:$VL,99:$VM,100:$VN}),o($Vq8,$Vy2),o($Vc8,$Vz2,{86:4397,91:4398,87:4399,95:4400,101:4402,103:4403,97:$Vh9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vc8,$VB2,{86:4397,91:4398,87:4399,95:4400,101:4402,103:4403,97:$Vh9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vc8,$VC2,{86:4397,91:4398,87:4399,95:4400,101:4402,103:4403,97:$Vh9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vu8,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,158:[1,4404],159:378,160:379,161:380,162:381,176:384,180:$VU2,191:389,192:390,193:391,196:394,199:$VV2,200:$VW2,201:$VX2,202:$VY2,203:$VZ2,204:$V_2,205:$V$2,206:$V03,207:$V13,208:$V23,209:388,210:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4405,117:$VG2,143:$VH2,184:$VI2}),o($Vt8,$VR1),o($Vt8,$Vl),o($Vt8,$Vm),o($Vt8,$Vq),o($Vt8,$Vr),o($Vt8,$Vs),o($Vt8,$Vt),o($Vt8,$Vu),o($Vq8,$V43),o($Vu8,$V53),o($Vu8,$V63),o($Vu8,$V73),o($Vu8,$V83),{107:[1,4406]},o($Vu8,$Vd3),o($Vc8,$VQ4),{19:[1,4409],21:[1,4412],22:4408,83:4407,209:4410,210:[1,4411]},o($Vm1,$V_5),o($Vm1,$VC1),o($Vo1,$V_5),o($Vo1,$VC1),o($Vp1,$V_5),o($Vp1,$VC1),o($Vx3,$V_5),o($Vx3,$VC1),o($Vy3,$V_5),o($Vy3,$VC1),o($Vz3,$V_5),o($Vz3,$VC1),o($VA6,$V$7),o($VA6,$V08),o($VA6,$Vg7),o($VA6,$Vh7),{115:[1,4413],118:195,119:196,120:$Vw1,122:$Vx1},o($VA6,$V11),o($VA6,$V21),{19:[1,4417],21:[1,4421],22:4415,32:4414,195:4416,209:4418,210:[1,4420],211:[1,4419]},o($VA6,$V18),o($VA6,$V28),o($V38,$Vr1,{89:4422}),o($VA6,$Vs1,{95:4321,91:4423,97:$Ve9,98:$VL,99:$VM,100:$VN}),o($V38,$Vy1),o($V38,$Vz1),o($V38,$VA1),o($V38,$VB1),{96:[1,4424]},o($V38,$VH1),{66:[1,4425]},o($Vd7,$Vx2,{95:4139,91:4426,97:$V89,98:$VL,99:$VM,100:$VN}),o($Vc7,$Vy2),o($VA6,$Vz2,{86:4427,91:4428,87:4429,95:4430,101:4432,103:4433,97:$Vi9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VA6,$VB2,{86:4427,91:4428,87:4429,95:4430,101:4432,103:4433,97:$Vi9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VA6,$VC2,{86:4427,91:4428,87:4429,95:4430,101:4432,103:4433,97:$Vi9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vi7,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,158:[1,4434],159:378,160:379,161:380,162:381,176:384,180:$VU2,191:389,192:390,193:391,196:394,199:$VV2,200:$VW2,201:$VX2,202:$VY2,203:$VZ2,204:$V_2,205:$V$2,206:$V03,207:$V13,208:$V23,209:388,210:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4435,117:$VG2,143:$VH2,184:$VI2}),o($Vf7,$VR1),o($Vf7,$Vl),o($Vf7,$Vm),o($Vf7,$Vq),o($Vf7,$Vr),o($Vf7,$Vs),o($Vf7,$Vt),o($Vf7,$Vu),o($Vc7,$V43),o($Vi7,$V53),o($Vi7,$V63),o($Vi7,$V73),o($Vi7,$V83),{107:[1,4436]},o($Vi7,$Vd3),o($VA6,$VQ4),{19:[1,4439],21:[1,4442],22:4438,83:4437,209:4440,210:[1,4441]},o($VA6,$VQ4),{19:[1,4445],21:[1,4448],22:4444,83:4443,209:4446,210:[1,4447]},o($VJ8,$VS1),o($VJ8,$VT1),o($VJ8,$VU1),o($V58,$Vr5),o($V58,$Vs5),{19:$V99,21:$Va9,22:4450,83:4449,209:4184,210:$Vb9},o($Vc8,$Vl8),o($VC,$VD,{59:4451,69:4452,71:4453,72:4454,88:4457,90:4458,83:4460,84:4461,85:4462,74:4463,40:4464,91:4468,22:4469,87:4471,114:4472,95:4476,209:4479,101:4480,103:4481,19:[1,4478],21:[1,4483],65:[1,4455],67:[1,4456],75:[1,4473],76:[1,4474],77:[1,4475],81:[1,4459],92:[1,4465],93:[1,4466],94:[1,4467],97:$Vj9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,156:[1,4470],210:[1,4482]}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4484,117:$VG2,143:$VH2,184:$VI2}),o($Vc8,$VR1),o($Vc8,$Vl),o($Vc8,$Vm),o($Vc8,$Vq),o($Vc8,$Vr),o($Vc8,$Vs),o($Vc8,$Vt),o($Vc8,$Vu),o($Vc8,$Vx2,{95:4223,91:4485,97:$Vc9,98:$VL,99:$VM,100:$VN}),o($VL8,$Vy2),o($VL8,$V43),o($Vc8,$Vn8),o($Vq8,$VO3),o($Vs8,$VP3),o($Vs8,$VQ3),o($Vs8,$VR3),{96:[1,4486]},o($Vs8,$VH1),{96:[1,4488],102:4487,104:[1,4489],105:[1,4490],106:4491,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,4492]},o($Vs8,$V84),{117:[1,4493]},{19:[1,4496],21:[1,4499],22:4495,83:4494,209:4497,210:[1,4498]},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4500,117:$VG2,143:$VH2,184:$VI2}),o($Vc8,$VR1),o($Vc8,$Vl),o($Vc8,$Vm),o($Vc8,$Vq),o($Vc8,$Vr),o($Vc8,$Vs),o($Vc8,$Vt),o($Vc8,$Vu),o($Vc8,$Vx2,{95:4265,91:4501,97:$Vd9,98:$VL,99:$VM,100:$VN}),o($VL8,$Vy2),o($VL8,$V43),o($Vc8,$Vn8),o($Vq8,$VO3),o($Vs8,$VP3),o($Vs8,$VQ3),o($Vs8,$VR3),{96:[1,4502]},o($Vs8,$VH1),{96:[1,4504],102:4503,104:[1,4505],105:[1,4506],106:4507,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,4508]},o($Vs8,$V84),{117:[1,4509]},{19:[1,4512],21:[1,4515],22:4511,83:4510,209:4513,210:[1,4514]},o($Vs8,$Vt5),o($Vs8,$VC1),o($Vs8,$Vq),o($Vs8,$Vr),o($Vs8,$Vt),o($Vs8,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4516,117:$VG2,143:$VH2,184:$VI2}),o($VA6,$VR1),o($VA6,$Vl),o($VA6,$Vm),o($VA6,$Vq),o($VA6,$Vr),o($VA6,$Vs),o($VA6,$Vt),o($VA6,$Vu),o($VA6,$Vx2,{95:4321,91:4517,97:$Ve9,98:$VL,99:$VM,100:$VN}),o($V38,$Vy2),o($V38,$V43),o($VA6,$Vn8),o($Vc7,$VO3),o($Ve7,$VP3),o($Ve7,$VQ3),o($Ve7,$VR3),{96:[1,4518]},o($Ve7,$VH1),{96:[1,4520],102:4519,104:[1,4521],105:[1,4522],106:4523,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,4524]},o($Ve7,$V84),{117:[1,4525]},{19:[1,4528],21:[1,4531],22:4527,83:4526,209:4529,210:[1,4530]},o($Ve7,$Vt5),o($Ve7,$VC1),o($Ve7,$Vq),o($Ve7,$Vr),o($Ve7,$Vt),o($Ve7,$Vu),o($Ve7,$Vt5),o($Ve7,$VC1),o($Ve7,$Vq),o($Ve7,$Vr),o($Ve7,$Vt),o($Ve7,$Vu),o($V58,$V_5),o($V58,$VC1),o($Vc8,$V67),o($Vc8,$V77,{70:4532,72:4533,74:4534,40:4535,114:4536,75:[1,4537],76:[1,4538],77:[1,4539],115:$VD,120:$VD,122:$VD}),o($Vc8,$V87),o($Vc8,$V97,{73:4540,69:4541,88:4542,90:4543,91:4547,95:4548,92:[1,4544],93:[1,4545],94:[1,4546],97:$Vk9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4550,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vc8,$Vb7),o($Vq8,$Vr1,{89:4551}),o($Vr8,$Vs1,{95:4476,91:4552,97:$Vj9,98:$VL,99:$VM,100:$VN}),o($Vs8,$Vu1,{82:4553}),o($Vs8,$Vu1,{82:4554}),o($Vs8,$Vu1,{82:4555}),o($Vc8,$Vv1,{101:4480,103:4481,87:4556,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vt8,$Vg7),o($Vt8,$Vh7),o($Vq8,$Vy1),o($Vq8,$Vz1),o($Vq8,$VA1),o($Vq8,$VB1),o($Vs8,$VC1),o($VD1,$VE1,{157:4557}),o($Vu8,$VG1),{115:[1,4558],118:195,119:196,120:$Vw1,122:$Vx1},o($Vt8,$V11),o($Vt8,$V21),{19:[1,4562],21:[1,4566],22:4560,32:4559,195:4561,209:4563,210:[1,4565],211:[1,4564]},{96:[1,4567]},o($Vq8,$VH1),o($Vs8,$Vq),o($Vs8,$Vr),{96:[1,4569],102:4568,104:[1,4570],105:[1,4571],106:4572,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,4573]},o($Vs8,$Vt),o($Vs8,$Vu),{117:[1,4574]},o($VL8,$VO3),o($Vs8,$V43),o($Vs8,$V53),o($Vs8,$V63),o($Vs8,$V73),o($Vs8,$V83),{107:[1,4575]},o($Vs8,$Vd3),o($Vt8,$VQ4),o($Vu8,$Vt5),o($Vu8,$VC1),o($Vu8,$Vq),o($Vu8,$Vr),o($Vu8,$Vt),o($Vu8,$Vu),{117:[1,4576]},o($VL8,$VO3),o($Vs8,$V43),o($Vs8,$V53),o($Vs8,$V63),o($Vs8,$V73),o($Vs8,$V83),{107:[1,4577]},o($Vs8,$Vd3),o($Vt8,$VQ4),o($Vu8,$Vt5),o($Vu8,$VC1),o($Vu8,$Vq),o($Vu8,$Vr),o($Vu8,$Vt),o($Vu8,$Vu),{117:[1,4578]},o($V38,$VO3),o($Ve7,$V43),o($Ve7,$V53),o($Ve7,$V63),o($Ve7,$V73),o($Ve7,$V83),{107:[1,4579]},o($Ve7,$Vd3),o($Vf7,$VQ4),o($Vi7,$Vt5),o($Vi7,$VC1),o($Vi7,$Vq),o($Vi7,$Vr),o($Vi7,$Vt),o($Vi7,$Vu),o($Vc8,$V$7),o($Vc8,$V08),o($Vc8,$Vg7),o($Vc8,$Vh7),{115:[1,4580],118:195,119:196,120:$Vw1,122:$Vx1},o($Vc8,$V11),o($Vc8,$V21),{19:[1,4584],21:[1,4588],22:4582,32:4581,195:4583,209:4585,210:[1,4587],211:[1,4586]},o($Vc8,$V18),o($Vc8,$V28),o($VL8,$Vr1,{89:4589}),o($Vc8,$Vs1,{95:4548,91:4590,97:$Vk9,98:$VL,99:$VM,100:$VN}),o($VL8,$Vy1),o($VL8,$Vz1),o($VL8,$VA1),o($VL8,$VB1),{96:[1,4591]},o($VL8,$VH1),{66:[1,4592]},o($Vr8,$Vx2,{95:4476,91:4593,97:$Vj9,98:$VL,99:$VM,100:$VN}),o($Vq8,$Vy2),o($Vc8,$Vz2,{86:4594,91:4595,87:4596,95:4597,101:4599,103:4600,97:$Vl9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vc8,$VB2,{86:4594,91:4595,87:4596,95:4597,101:4599,103:4600,97:$Vl9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vc8,$VC2,{86:4594,91:4595,87:4596,95:4597,101:4599,103:4600,97:$Vl9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vu8,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,158:[1,4601],159:378,160:379,161:380,162:381,176:384,180:$VU2,191:389,192:390,193:391,196:394,199:$VV2,200:$VW2,201:$VX2,202:$VY2,203:$VZ2,204:$V_2,205:$V$2,206:$V03,207:$V13,208:$V23,209:388,210:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4602,117:$VG2,143:$VH2,184:$VI2}),o($Vt8,$VR1),o($Vt8,$Vl),o($Vt8,$Vm),o($Vt8,$Vq),o($Vt8,$Vr),o($Vt8,$Vs),o($Vt8,$Vt),o($Vt8,$Vu),o($Vq8,$V43),o($Vu8,$V53),o($Vu8,$V63),o($Vu8,$V73),o($Vu8,$V83),{107:[1,4603]},o($Vu8,$Vd3),o($Vc8,$VQ4),{19:[1,4606],21:[1,4609],22:4605,83:4604,209:4607,210:[1,4608]},o($Vc8,$VQ4),{19:[1,4612],21:[1,4615],22:4611,83:4610,209:4613,210:[1,4614]},o($VA6,$VQ4),{19:[1,4618],21:[1,4621],22:4617,83:4616,209:4619,210:[1,4620]},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4622,117:$VG2,143:$VH2,184:$VI2}),o($Vc8,$VR1),o($Vc8,$Vl),o($Vc8,$Vm),o($Vc8,$Vq),o($Vc8,$Vr),o($Vc8,$Vs),o($Vc8,$Vt),o($Vc8,$Vu),o($Vc8,$Vx2,{95:4548,91:4623,97:$Vk9,98:$VL,99:$VM,100:$VN}),o($VL8,$Vy2),o($VL8,$V43),o($Vc8,$Vn8),o($Vq8,$VO3),o($Vs8,$VP3),o($Vs8,$VQ3),o($Vs8,$VR3),{96:[1,4624]},o($Vs8,$VH1),{96:[1,4626],102:4625,104:[1,4627],105:[1,4628],106:4629,201:$VI1,202:$VJ1,203:$VK1,204:$VL1},{96:[1,4630]},o($Vs8,$V84),{117:[1,4631]},{19:[1,4634],21:[1,4637],22:4633,83:4632,209:4635,210:[1,4636]},o($Vs8,$Vt5),o($Vs8,$VC1),o($Vs8,$Vq),o($Vs8,$Vr),o($Vs8,$Vt),o($Vs8,$Vu),o($Vs8,$Vt5),o($Vs8,$VC1),o($Vs8,$Vq),o($Vs8,$Vr),o($Vs8,$Vt),o($Vs8,$Vu),o($Ve7,$Vt5),o($Ve7,$VC1),o($Ve7,$Vq),o($Ve7,$Vr),o($Ve7,$Vt),o($Ve7,$Vu),{117:[1,4638]},o($VL8,$VO3),o($Vs8,$V43),o($Vs8,$V53),o($Vs8,$V63),o($Vs8,$V73),o($Vs8,$V83),{107:[1,4639]},o($Vs8,$Vd3),o($Vt8,$VQ4),o($Vu8,$Vt5),o($Vu8,$VC1),o($Vu8,$Vq),o($Vu8,$Vr),o($Vu8,$Vt),o($Vu8,$Vu),o($Vc8,$VQ4),{19:[1,4642],21:[1,4645],22:4641,83:4640,209:4643,210:[1,4644]},o($Vs8,$Vt5),o($Vs8,$VC1),o($Vs8,$Vq),o($Vs8,$Vr),o($Vs8,$Vt),o($Vs8,$Vu)];
  this.defaultActions = {6:[2,11],30:[2,1],102:[2,115],103:[2,116],104:[2,117],111:[2,128],112:[2,129],206:[2,247],207:[2,248],208:[2,249],209:[2,250],329:[2,31],357:[2,137],358:[2,141],360:[2,143],556:[2,29],557:[2,33],594:[2,30],1103:[2,141],1105:[2,143]};

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
        addShape($$[$0-1],  $$[$0], yy);
      
break;
case 27:

        this.$ = nonest($$[$0]);
      
break;
case 28:
this.$ = { type: "ShapeExternal" };
break;
case 29:

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
case 30:

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
case 31:

        $$[$0].needsAtom.unshift(nonest($$[$0-1]));
        delete $$[$0].needsAtom;
        this.$ = $$[$0]; // { type: "ShapeOr", "shapeExprs": [$$[$0-1]].concat($$[$0]) };
      
break;
case 32: case 226: case 243:
this.$ = null;
break;
case 33: case 37: case 40: case 46: case 53: case 183: case 242:
this.$ = $$[$0];
break;
case 35:
 // returns a ShapeOr
        const disjuncts = $$[$0].map(nonest);
        this.$ = { type: "ShapeOr", shapeExprs: disjuncts, needsAtom: disjuncts }; // t: @@
      
break;
case 36:
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
case 38: case 41:
this.$ = [$$[$0]];
break;
case 39: case 42: case 44: case 48: case 51: case 55:
this.$ = $$[$0-1].concat($$[$0]);
break;
case 43: case 47: case 50: case 54:
this.$ = [];
break;
case 45:
this.$ = shapeJunction("ShapeOr", $$[$0-1], $$[$0]);
break;
case 49: case 52:
this.$ = shapeJunction("ShapeAnd", $$[$0-1], $$[$0]) // t: @@;
break;
case 56:
this.$ = $$[$0-1] ? { type: "ShapeNot", "shapeExpr": nonest($$[$0]) } /* t:@@ */ : $$[$0];
break;
case 57:
this.$ = false;
break;
case 58:
this.$ = true;
break;
case 59:
this.$ = $$[$0-1] ? { type: "ShapeNot", "shapeExpr": nonest($$[$0]) } /* t: 1NOTNOTdot, 1NOTNOTIRI, 1NOTNOTvs */ : $$[$0];
break;
case 60: case 69: case 74:
this.$ = $$[$0] ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $$[$0-1]), $$[$0] ] } : $$[$0-1];
break;
case 62:
this.$ = $$[$0] ? shapeJunction("ShapeAnd", $$[$0-1], [$$[$0]]) /* t: 1dotRef1 */ : $$[$0-1] // t:@@;
break;
case 63: case 72: case 77:
this.$ = Object.assign($$[$0-1], {nested: true}) // t: 1val1vsMinusiri3;
break;
case 64: case 73: case 78:
this.$ = EmptyShape // t: 1dot;
break;
case 71:
this.$ = $$[$0] ? shapeJunction("ShapeAnd", $$[$0-1], [$$[$0]]) /* t:@@ */ : $$[$0-1]	 // t: 1dotRef1 -- use _QnonLitNodeConstraint_E_Opt like below?;
break;
case 76:
this.$ = $$[$0] ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $$[$0-1]), $$[$0] ] } : $$[$0-1] // t: !! look to 1dotRef1;
break;
case 87:
 // t: 1dotRefLNex@@
        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        const namePos = $$[$0].indexOf(':');
        this.$ = addSourceMap(expandPrefix($$[$0].substr(0, namePos), yy) + $$[$0].substr(namePos + 1), yy); // ShapeRef
      
break;
case 88:
 // t: 1dotRefNS1@@
        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        this.$ = addSourceMap(expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy), yy); // ShapeRef
      
break;
case 89:
this.$ = addSourceMap($$[$0], yy) // ShapeRef // t: 1dotRef1, 1dotRefSpaceLNex, 1dotRefSpaceNS1;
break;
case 90: case 93:
 // t: !!
        this.$ = $$[$0-2]
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: !!
        if ($$[$0]) { this.$.semActs = $$[$0].semActs; } // t: !!
      
break;
case 91:
this.$ = [] // t: 1dot, 1dotAnnot3;
break;
case 92:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotAnnot3;
break;
case 94:
this.$ = extend({ type: "NodeConstraint", nodeKind: "literal" }, $$[$0]) // t: 1literalPattern;
break;
case 95:

        if (numericDatatypes.indexOf($$[$0-1]) === -1)
          numericFacets.forEach(function (facet) {
            if (facet in $$[$0])
              error(new Error("Parse error: facet " + facet + " not allowed for unknown datatype " + $$[$0-1]), yy);
          });
        this.$ = extend({ type: "NodeConstraint", datatype: $$[$0-1] }, $$[$0]) // t: 1datatype
      
break;
case 96:
this.$ = { type: "NodeConstraint", values: $$[$0-1] } // t: 1val1IRIREF;
break;
case 97:
this.$ = extend({ type: "NodeConstraint"}, $$[$0]);
break;
case 98:
this.$ = {} // t: 1literalPattern;
break;
case 99:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"), yy);
        }
        this.$ = extend($$[$0-1], $$[$0]) // t: 1literalLength
      
break;
case 101: case 107:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"), yy);
        }
        this.$ = extend($$[$0-1], $$[$0]) // t: !! look to 1literalLength
      
break;
case 102:
this.$ = extend({ type: "NodeConstraint" }, $$[$0-1], $$[$0] ? $$[$0] : {}) // t: 1iriPattern;
break;
case 103:
this.$ = extend({ type: "NodeConstraint" }, $$[$0]) // t: @@;
break;
case 104:
this.$ = {};
break;
case 105:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"), yy);
        }
        this.$ = extend($$[$0-1], $$[$0])
      
break;
case 108:
this.$ = { nodeKind: "iri" } // t: 1iriPattern;
break;
case 109:
this.$ = { nodeKind: "bnode" } // t: 1bnodeLength;
break;
case 110:
this.$ = { nodeKind: "nonliteral" } // t: 1nonliteralLength;
break;
case 113:
this.$ = keyValObject($$[$0-1], parseInt($$[$0], 10)) // t: 1literalLength;
break;
case 114:
this.$ = unescapeRegexp($$[$0]) // t: 1literalPattern;
break;
case 115:
this.$ = "length" // t: 1literalLength;
break;
case 116:
this.$ = "minlength" // t: 1literalMinlength;
break;
case 117:
this.$ = "maxlength" // t: 1literalMaxlength;
break;
case 118:
this.$ = keyValObject($$[$0-1], $$[$0]) // t: 1literalMininclusive;
break;
case 119:
this.$ = keyValObject($$[$0-1], parseInt($$[$0], 10)) // t: 1literalTotaldigits;
break;
case 120:
this.$ = parseInt($$[$0], 10);
break;
case 121: case 122:
this.$ = parseFloat($$[$0]);
break;
case 123:
 // ## deprecated
        if ($$[$0] === XSD_DECIMAL || $$[$0] === XSD_FLOAT || $$[$0] === XSD_DOUBLE)
          this.$ = parseFloat($$[$0-2].value);
        else if (numericDatatypes.indexOf($$[$0]) !== -1)
          this.$ = parseInt($$[$0-2].value)
        else
          error(new Error("Parse error: numeric range facet expected numeric datatype instead of " + $$[$0]), yy);
      
break;
case 124:
this.$ = "mininclusive" // t: 1literalMininclusive;
break;
case 125:
this.$ = "minexclusive" // t: 1literalMinexclusive;
break;
case 126:
this.$ = "maxinclusive" // t: 1literalMaxinclusive;
break;
case 127:
this.$ = "maxexclusive" // t: 1literalMaxexclusive;
break;
case 128:
this.$ = "totaldigits" // t: 1literalTotaldigits;
break;
case 129:
this.$ = "fractiondigits" // t: 1literalFractiondigits;
break;
case 130:
 // t: @@
        this.$ = $$[$0-2] === EmptyShape ? { type: "Shape" } : $$[$0-2]; // t: 0
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: !! look to open3groupdotcloseAnnot3, open3groupdotclosecard23Annot3Code2
        if ($$[$0]) { this.$.semActs = $$[$0].semActs; } // t: !! look to open3groupdotcloseCode1, !open1dotOr1dot
      
break;
case 131:
 // t: @@
        const exprObj = $$[$0-1] ? { expression: $$[$0-1] } : EmptyObject; // t: 0
        this.$ = (exprObj === EmptyObject && $$[$0-3] === EmptyObject) ?
	  EmptyShape :
	  extend({ type: "Shape" }, exprObj, $$[$0-3]);
      
break;
case 132:
this.$ = [ "extra", $$[$0] ] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3;
break;
case 133:
this.$ = [ "closed", true ] // t: 1dotClosed;
break;
case 134:
this.$ = EmptyObject;
break;
case 135:

        if ($$[$0-1] === EmptyObject)
          $$[$0-1] = {};
        if ($$[$0][0] === "closed")
          $$[$0-1]["closed"] = true; // t: 1dotClosed
        else if ($$[$0][0] in $$[$0-1])
          $$[$0-1][$$[$0][0]] = unionAll($$[$0-1][$$[$0][0]], $$[$0][1]); // t: 3groupdot3Extra, 3groupdotExtra3
        else
          $$[$0-1][$$[$0][0]] = $$[$0][1]; // t: @@
        this.$ = $$[$0-1];
      
break;
case 138:
this.$ = $$[$0] // t: 1dotExtra1, 3groupdot3Extra;
break;
case 139:
this.$ = [$$[$0]] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3;
break;
case 140:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 3groupdotExtra3;
break;
case 144:
this.$ = { type: "OneOf", expressions: unionAll([$$[$0-1]], $$[$0]) } // t: 2oneOfdot;
break;
case 145:
this.$ = $$[$0] // t: 2oneOfdot;
break;
case 146:
this.$ = [$$[$0]] // t: 2oneOfdot;
break;
case 147:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 2oneOfdot;
break;
case 150:
this.$ = $$[$0-1];
break;
case 154:
this.$ = { type: "EachOf", expressions: unionAll([$$[$0-2]], $$[$0-1]) } // t: 2groupOfdot;
break;
case 155:
this.$ = $$[$0] // ## deprecated // t: 2groupOfdot;
break;
case 156:
this.$ = $$[$0] // t: 2groupOfdot;
break;
case 157:
this.$ = [$$[$0]] // t: 2groupOfdot;
break;
case 158:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 2groupOfdot;
break;
case 159:

        if ($$[$0-1]) {
          this.$ = extend({ id: $$[$0-1] }, $$[$0]);
          addProduction($$[$0-1],  this.$, yy);
        } else {
          this.$ = $$[$0]
        }
      
break;
case 161:
this.$ = addSourceMap($$[$0], yy);
break;
case 166:

        // t: open1dotOr1dot, !openopen1dotcloseCode1closeCode2
        this.$ = $$[$0-4];
        // Copy all of the new attributes into the encapsulated shape.
        if ("min" in $$[$0-2]) { this.$.min = $$[$0-2].min; } // t: open3groupdotclosecard23Annot3Code2
        if ("max" in $$[$0-2]) { this.$.max = $$[$0-2].max; } // t: open3groupdotclosecard23Annot3Code2
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: open3groupdotcloseAnnot3, open3groupdotclosecard23Annot3Code2
        if ($$[$0]) { this.$.semActs = "semActs" in $$[$0-4] ? $$[$0-4].semActs.concat($$[$0].semActs) : $$[$0].semActs; } // t: open3groupdotcloseCode1, !open1dotOr1dot
      
break;
case 167:
this.$ = {} // t: 1dot;
break;
case 169:

        // $$[$0]: t: 1dotCode1
	if ($$[$0-3] !== EmptyShape && false) {
	  const t = blank();
	  addShape(t, $$[$0-3], yy);
	  $$[$0-3] = t; // ShapeRef
	}
        // %6: t: 1inversedotCode1
        this.$ = extend({ type: "TripleConstraint" }, $$[$0-5] ? $$[$0-5] : {}, { predicate: $$[$0-4] }, ($$[$0-3] === EmptyShape ? {} : { valueExpr: $$[$0-3] }), $$[$0-2], $$[$0]); // t: 1dot // t: 1inversedot
        if ($$[$0-1].length)
          this.$["annotations"] = $$[$0-1]; // t: 1dotAnnot3 // t: 1inversedotAnnot3
      
break;
case 172:
this.$ = { min:0, max:UNBOUNDED } // t: 1cardStar;
break;
case 173:
this.$ = { min:1, max:UNBOUNDED } // t: 1cardPlus;
break;
case 174:
this.$ = { min:0, max:1 } // t: 1cardOpt;
break;
case 175:

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
case 176:
this.$ = { inverse: true } // t: 1inversedot;
break;
case 177:
this.$ = $$[$0-1] // t: 1val1IRIREF;
break;
case 178:
this.$ = [] // t: 1val1IRIREF;
break;
case 179:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1IRIREF;
break;
case 184:
this.$ = [$$[$0]] // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 185:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 186:
this.$ = [$$[$0]] // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 187:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 188:
this.$ = [$$[$0]] // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 189:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 190:
this.$ = { type: "IriStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 191:
this.$ = { type: "LiteralStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 192:
this.$ = { type: "LanguageStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 193:

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
case 194:
this.$ = [] // t: 1val1iriStem, 1val1iriStemMinusiri3;
break;
case 195:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1iriStemMinusiri3;
break;
case 196:
this.$ = $$[$0] // t: 1val1iriStemMinusiri3;
break;
case 199:
this.$ = $$[$0] ? { type: "IriStem", stem: $$[$0-1] } /* t: 1val1iriStemMinusiriStem3 */ : $$[$0-1] // t: 1val1iriStemMinusiri3;
break;
case 202:

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
case 203:
this.$ = [] // t: 1val1literalStem, 1val1literalStemMinusliteral3;
break;
case 204:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1literalStemMinusliteral3;
break;
case 205:
this.$ = $$[$0] // t: 1val1literalStemMinusliteral3;
break;
case 208:
this.$ = $$[$0] ? { type: "LiteralStem", stem: $$[$0-1].value } /* t: 1val1literalStemMinusliteral3 */ : $$[$0-1].value // t: 1val1literalStemMinusliteralStem3;
break;
case 209:

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
case 210:

        this.$ = {  // t: @@
          type: $$[$0].length ? "LanguageStemRange" : "LanguageStem",
          stem: ""
        };
        if ($$[$0].length)
          this.$["exclusions"] = $$[$0]; // t: @@
      
break;
case 211:
this.$ = [] // t: 1val1languageStem, 1val1languageStemMinuslanguage3;
break;
case 212:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1languageStemMinuslanguage3;
break;
case 213:
this.$ = $$[$0] // t: 1val1languageStemMinuslanguage3;
break;
case 216:
this.$ = $$[$0] ? { type: "LanguageStem", stem: $$[$0-1] } /* t: 1val1languageStemMinuslanguageStem3 */ : $$[$0-1] // t: 1val1languageStemMinuslanguage3;
break;
case 217:
this.$ = addSourceMap($$[$0], yy) // Inclusion // t: 2groupInclude1;
break;
case 218:
this.$ = { type: "Annotation", predicate: $$[$0-1], object: $$[$0] } // t: 1dotAnnotIRIREF;
break;
case 221:
this.$ = $$[$0].length ? { semActs: $$[$0] } : null // t: 1dotCode1/2oneOfDot;
break;
case 222:
this.$ = [] // t: 1dot, 1dotCode1;
break;
case 223:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotCode1;
break;
case 224:
this.$ = $$[$0] ? unescapeSemanticAction($$[$0-1], $$[$0]) /* t: 1dotCode1 */ : { type: "SemAct", name: $$[$0-1] } // t: 1dotNoCode1;
break;
case 231:
this.$ = RDF_TYPE // t: 1AvalA;
break;
case 237:
this.$ = createLiteral($$[$0], XSD_INTEGER) // t: 1val1INTEGER;
break;
case 238:
this.$ = createLiteral($$[$0], XSD_DECIMAL) // t: 1val1DECIMAL;
break;
case 239:
this.$ = createLiteral($$[$0], XSD_DOUBLE) // t: 1val1DOUBLE;
break;
case 241:
this.$ = $$[$0] ? extend($$[$0-1], { type: $$[$0] }) : $$[$0-1] // t: 1val1Datatype;
break;
case 245:
this.$ = { value: "true", type: XSD_BOOLEAN } // t: 1val1true;
break;
case 246:
this.$ = { value: "false", type: XSD_BOOLEAN } // t: 1val1false;
break;
case 247:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL2;
break;
case 248:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL1;
break;
case 249:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL_LONG2;
break;
case 250:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG1;
break;
case 251:
this.$ = unescapeLangString($$[$0], 1)	// t: @@;
break;
case 252:
this.$ = unescapeLangString($$[$0], 3)	// t: @@;
break;
case 253:
this.$ = unescapeLangString($$[$0], 1)	// t: 1val1LANGTAG;
break;
case 254:
this.$ = unescapeLangString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG2_with_LANGTAG;
break;
case 255:
 // t: 1dot
        const unesc = ShExUtil.unescapeText($$[$0].slice(1,-1), {});
        this.$ = ShExJisonParser._base === null || absoluteIRI.test(unesc) ? unesc : _resolveIRI(unesc)
      
break;
case 257:
 // t:1dotPNex, 1dotPNdefault, ShExParser-test.js/with pre-defined prefixes
        const namePos1 = $$[$0].indexOf(':');
        this.$ = expandPrefix($$[$0].substr(0, namePos1), yy) + ShExUtil.unescapeText($$[$0].substr(namePos1 + 1), pnameEscapeReplacements);
      
break;
case 258:
 // t: 1dotNS2, 1dotNSdefault, ShExParser-test.js/PNAME_NS with pre-defined prefixes
        this.$ = expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy);
      
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


  this.rules = [/^(?:\s+|(#[^\u000a\u000d]*|\/\*([^*]|\*([^/]|\\\/))*\*\/))/,/^(?:(@(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*))))/,/^(?:(@((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)))/,/^(?:(@([A-Za-z])+((-([0-9A-Za-z])+))*))/,/^(?:@)/,/^(?:(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*)))/,/^(?:(\{((([+-])?([0-9])+))((,(((([+-])?([0-9])+))|\*)?))?\}))/,/^(?:(([+-])?((([0-9])+\.([0-9])*(([Ee]([+-])?([0-9])+)))|((\.)?([0-9])+(([Ee]([+-])?([0-9])+))))))/,/^(?:(([+-])?([0-9])*\.([0-9])+))/,/^(?:(([+-])?([0-9])+))/,/^(?:{ANON})/,/^(?:(<([^\u0000-\u0020<>\"{}|^`\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*>))/,/^(?:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:))/,/^(?:a\b)/,/^(?:(\/([^\u002f\u005C\u000A\u000D]|\\[nrt\\|.?*+(){}$\u002D\u005B\u005D\u005E/]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))+\/[smix]*))/,/^(?:(_:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|[0-9])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?))/,/^(?:(\{([^%\\]|\\[%\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*%\}))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"))/,/^(?:([Bb][Aa][Ss][Ee]))/,/^(?:([Pp][Rr][Ee][Ff][Ii][Xx]))/,/^(?:([iI][mM][pP][oO][rR][tT]))/,/^(?:([sS][tT][aA][rR][tT]))/,/^(?:([eE][xX][tT][eE][rR][nN][aA][lL]))/,/^(?:([Cc][Ll][Oo][Ss][Ee][Dd]))/,/^(?:([Ee][Xx][Tt][Rr][Aa]))/,/^(?:([Ll][Ii][Tt][Ee][Rr][Aa][Ll]))/,/^(?:([Bb][Nn][Oo][Dd][Ee]))/,/^(?:([Ii][Rr][Ii]))/,/^(?:([Nn][Oo][Nn][Ll][Ii][Tt][Ee][Rr][Aa][Ll]))/,/^(?:([Aa][Nn][Dd]))/,/^(?:([Oo][Rr]))/,/^(?:([No][Oo][Tt]))/,/^(?:([Mm][Ii][Nn][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Ii][Nn][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Aa][Xx][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Aa][Xx][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Mm][Ii][Nn][Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Mm][Aa][Xx][Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Tt][Oo][Tt][Aa][Ll][Dd][Ii][Gg][Ii][Tt][Ss]))/,/^(?:([Ff][Rr][Aa][Cc][Tt][Ii][Oo][Nn][Dd][Ii][Gg][Ii][Tt][Ss]))/,/^(?:=)/,/^(?:\/\/)/,/^(?:\{)/,/^(?:\})/,/^(?:&)/,/^(?:\|\|)/,/^(?:\|)/,/^(?:,)/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?:\$)/,/^(?:!)/,/^(?:\^\^)/,/^(?:\^)/,/^(?:\.)/,/^(?:~)/,/^(?:;)/,/^(?:\*)/,/^(?:\+)/,/^(?:\?)/,/^(?:-)/,/^(?:%)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:$)/,/^(?:[a-zA-Z0-9_-]+)/,/^(?:.)/];
  this.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76],"inclusive":true}};
  this.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
    const YYSTATE=YY_START;
    switch($avoiding_name_collisions) {
    case 0:/**/
      break;
    case 1:return 75;
      break;
    case 2:return 76;
      break;
    case 3: yy_.yytext = yy_.yytext.substr(1); return 180; 
      break;
    case 4:return 77;
      break;
    case 5:return 210;
      break;
    case 6:return 154;
      break;
    case 7:return 105;
      break;
    case 8:return 104;
      break;
    case 9:return 96;
      break;
    case 10:return 'ANON';
      break;
    case 11:return 19;
      break;
    case 12:return 21;
      break;
    case 13:return 194;
      break;
    case 14:return 97;
      break;
    case 15:return 211;
      break;
    case 16:return 190;
      break;
    case 17:return 206;
      break;
    case 18:return 208;
      break;
    case 19:return 205;
      break;
    case 20:return 207;
      break;
    case 21:return 202;
      break;
    case 22:return 204;
      break;
    case 23:return 201;
      break;
    case 24:return 203;
      break;
    case 25:return 18;
      break;
    case 26:return 20;
      break;
    case 27:return 23;
      break;
    case 28:return 26;
      break;
    case 29:return 35;
      break;
    case 30:return 120;
      break;
    case 31:return 122;
      break;
    case 32:return 81;
      break;
    case 33:return 93;
      break;
    case 34:return 92;
      break;
    case 35:return 94;
      break;
    case 36:return 49;
      break;
    case 37:return 47;
      break;
    case 38:return 39;
      break;
    case 39:return 108;
      break;
    case 40:return 109;
      break;
    case 41:return 110;
      break;
    case 42:return 111;
      break;
    case 43:return 98;
      break;
    case 44:return 99;
      break;
    case 45:return 100;
      break;
    case 46:return 112;
      break;
    case 47:return 113;
      break;
    case 48:return 27;
      break;
    case 49:return 185;
      break;
    case 50:return 115;
      break;
    case 51:return 117;
      break;
    case 52:return 184;
      break;
    case 53:return '||';
      break;
    case 54:return 130;
      break;
    case 55:return 135;
      break;
    case 56:return 65;
      break;
    case 57:return 66;
      break;
    case 58:return 156;
      break;
    case 59:return 158;
      break;
    case 60:return 143;
      break;
    case 61:return '!';
      break;
    case 62:return 107;
      break;
    case 63:return 155;
      break;
    case 64:return 67;
      break;
    case 65:return 173;
      break;
    case 66:return 136;
      break;
    case 67:return 151;
      break;
    case 68:return 152;
      break;
    case 69:return 153;
      break;
    case 70:return 174;
      break;
    case 71:return 188;
      break;
    case 72:return 199;
      break;
    case 73:return 200;
      break;
    case 74:return 7;
      break;
    case 75:return 'unexpected word "'+yy_.yytext+'"';
      break;
    case 76:return 'invalid character '+yy_.yytext;
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

const ShExJison = __webpack_require__(509)/* .Parser */ ._b;

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

  function externalTerm (node, factory) { // !!intermalTermToRdfjs
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

  function intermalTermToTurtle (node, base, prefixes) {
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
      const value = getLiteralValue(node);
      const type = getLiteralType(node);
      const language = getLiteralLanguage(node);
      // Escape special characters
      if (escape.test(value))
        value = value.replace(escapeAll, characterReplacer);
      // Write the literal, possibly with type or language
      if (language)
        return '"' + value + '"@' + language;
      else if (type && type !== "http://www.w3.org/2001/XMLSchema#string")
        return '"' + value + '"^^' + this.intermalTermToTurtle(type, base, prefixes);
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


// rdf:type predicate (for 'a' abbreviation)
const RDF_PREFIX = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    RDF_TYPE   = RDF_PREFIX + 'type';

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
    const result = escapeReplacements[character];
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
    intermalTermToTurtle: intermalTermToTurtle,
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
 "ShapeOr", "ShapeAnd", "shapeExprs", "nodeKind",
 "NodeConstraint", "iri", "bnode", "nonliteral", "literal", "datatype", "length", "minlength", "maxlength", "pattern", "flags", "mininclusive", "minexclusive", "maxinclusive", "maxexclusive", "totaldigits", "fractiondigits", "values",
 "ShapeNot", "shapeExpr",
 "Shape", "closed", "extra", "expression", "semActs",
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
        return v.keepShapeExpr(sh);
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
        return v.visitShapeExpr(index.shapeExprs[k]);
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
      if (shape.type === 'Shape') {
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
        && index.shapeExprs[label].type === 'Shape' // Don't nest e.g. valuesets for now. @@ needs an option
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
          shapeReferences[oldName][0].tc.valueExpr = borged
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
      let shapeExpr = schema.shapes[label]
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
      let shapeExpr = schema.shapes[shapeLabel]
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

        if (shape.expression)
          _walkTripleExpression(shape.expression, negated);
      }
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
          solns.type === "ShapeAndResults") {
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
      visitor.visitShapeExpr(shape, shape.id);
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
    } else if (val.type === "ShapeAndResults") { // 1iriRef1_pass-iri
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
        ret.shapes = shapes.map(v => {
          return extend({id: v.ldterm}, shapeExpr(v.nested));
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
      const ret = findType(v, elts, shapeExpr);
      if (ret !== Missed)
        return ret;

      const t = v[RDF.type][0].ldterm;
      if (t === SX.Shape) {
        const ret = { type: "Shape" };
        ["closed"].forEach(a => {
          if (SX[a] in v)
            ret[a] = !!v[SX[a]][0].ldterm.value;
        });
        if (SX.extra in v)
          ret.extra = v[SX.extra].map(e => { return e.ldterm; });
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
    } else if (Array.isArray(val)) {debugger;
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
      throw Error("unknown shapeExpression type in " + JSON.stringify(val));
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
      }}).then(resp => resp.json()).then(t => {
        const selects = t.head.vars;
        return t.results.bindings.map(row => {
          return selects.map(sel => {
            const elt = row[sel];
            switch (elt.type) {
            case "uri": return elt.value;
            case "bnode": return "_:" + elt.value;
            case "literal":
              const datatype = elt.datatype;
              const lang = elt["xml:lang"];
              return "\"" + elt.value + "\"" + (
                datatype ? "^^" + datatype :
                  lang ? "@" + lang :
                  "");
            default: throw "unknown XML results type: " + elt.prop("tagName");
            }
            return row[sel];
          })
        });
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
    const t = JSON.parse(xhr.responseText);
    const selects = t.head.vars;
    return t.results.bindings.map(row => {
      return selects.map(sel => {
        const elt = row[sel];
        switch (elt.type) {
        case "uri": return elt.value;
        case "bnode": return "_:" + elt.value;
        case "literal":
          const datatype = elt.datatype;
          const lang = elt["xml:lang"];
          return "\"" + elt.value + "\"" + (
            datatype ? "^^" + datatype :
              lang ? "@" + lang :
              "");
        default: throw "unknown XML results type: " + elt.prop("tagName");
        }
        return row[sel];
      })
    });

/* TO ADD? XML results format parsed with jquery:
        $(data).find("sparql > results > result").
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
*/
  },

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
  this.validate = function (point, label, tracker, seen) {
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
        const res = this.validate(pair.node, pair.shape, label, tracker); // really tracker and seen
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
      return this._validateShapeExpr(point, shape, Start, tracker, seen);

    if (seen === undefined)
      seen = {};
    const seenKey = point + "@" + (label === Start ? "_: -start-" : label);
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
    const ret = this._validateShapeExpr(point, shape, label, tracker, seen);
    tracker.exit(point, label, ret);
    delete seen[seenKey];
    if ("known" in this)
      this.known[seenKey] = ret;
    if ("startActs" in schema && outside) {
      ret.startActs = schema.startActs;
    }
    return this.options.noResults ? {} : ret;
  }

  this._validateShapeExpr = function (point, shapeExpr, shapeLabel, tracker, seen) {
    if (point === "")
      throw Error("validation needs a valid focus node");
    let ret = null
    if (typeof shapeExpr === "string") { // ShapeRef
      ret = this._validateShapeExpr(point, index.shapeExprs[shapeExpr], shapeExpr, tracker, seen);
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
      ret = this._validateShape(point, shapeExpr, shapeLabel, tracker, seen);
    } else if (shapeExpr.type === "ShapeExternal") {
      ret = this.options.validateExtern(point, shapeLabel, tracker, seen);
    } else if (shapeExpr.type === "ShapeOr") {
      const errors = [];
      for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        const nested = shapeExpr.shapeExprs[i];
        const sub = this._validateShapeExpr(point, nested, shapeLabel, tracker, seen);
        if ("errors" in sub)
          errors.push(sub);
        else
          return { type: "ShapeOrResults", solution: sub };
      }
      ret = { type: "ShapeOrFailure", errors: errors };
    } else if (shapeExpr.type === "ShapeNot") {
      const sub = this._validateShapeExpr(point, shapeExpr.shapeExpr, shapeLabel, tracker, seen);
      if ("errors" in sub)
          ret = { type: "ShapeNotResults", solution: sub };
        else
          ret = { type: "ShapeNotFailure", errors: sub };
    } else if (shapeExpr.type === "ShapeAnd") {
      const passes = [];
      const errors = [];
      for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        const nested = shapeExpr.shapeExprs[i];
        const sub = this._validateShapeExpr(point, nested, shapeLabel, tracker, seen);
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

  this._validateShape = function (point, shape, shapeLabel, tracker, seen) {
    const _ShExValidator = this;
    const valParms = { db, shapeLabel, tracker, seen };

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

    const fromDB  = db.getNeighborhood(point, shapeLabel, shape);
    const outgoingLength = fromDB.outgoing.length;
    const neighborhood = fromDB.outgoing.sort(
      (l, r) => l.predicate.localeCompare(r.predicate) || sparqlOrder(l.object, r.object)
    ).concat(fromDB.incoming.sort(
      (l, r) => l.predicate.localeCompare(r.predicate) || sparqlOrder(l.object, r.object)
    ));

    const constraintList = this.indexTripleConstraints(shape.expression);
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
      const t2tcForThisShape = xp.get(); // [0,1,0,3] mapping from triple to constraint

      // Triples not mapped to triple constraints are not allowed in closed shapes.
      if (shape.closed) {
        const unexpectedTriples = neighborhood.slice(0, outgoingLength).filter((t, i) => {
          return t2tcForThisShape[i] === "NO_TRIPLE_CONSTRAINT" && // didn't match a constraint
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

      const results = regexEngine.match(db, point, constraintList, tc2t, t2tcForThisShape, neighborhood, this.semActHandler, null);
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
  this._errorsMatchingShapeExpr = function (value, valueExpr, valParms) {
    const _ShExValidator = this;
    if (typeof valueExpr === "string") { // ShapeRef
      return _ShExValidator.validate(value, valueExpr, valParms.tracker, valParms.seen);
    } else if (valueExpr.type === "NodeConstraint") {
      return this._errorsMatchingNodeConstraint(value, valueExpr, null);
    } else if (valueExpr.type === "Shape") {
      return _ShExValidator._validateShapeExpr(value, valueExpr, valParms.shapeLabel, valParms.tracker, valParms.seen)
    } else if (valueExpr.type === "ShapeOr") {
      const errors = [];
      for (let i = 0; i < valueExpr.shapeExprs.length; ++i) {
        const nested = valueExpr.shapeExprs[i];
        const sub = _ShExValidator._errorsMatchingShapeExpr(value, nested, valParms);
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
        const sub = _ShExValidator._errorsMatchingShapeExpr(value, nested, valParms);
        if ("errors" in sub)
          return { type: "ShapeAndFailure", errors: [sub] };
        else
          passes.push(sub);
      }
      return { type: "ShapeAndResults", solutions: passes };
    } else if (valueExpr.type === "ShapeNot") {
      const sub = _ShExValidator._errorsMatchingShapeExpr(value, valueExpr.shapeExpr, valParms);
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
      _expect(schema, "type", "Schema");
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
      _expect(semAct, "type", "SemAct");

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
          _Visitor.visitShapeExpr(shapeExpr)
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
      _expect(shape, "type", "Shape");

      this._maybeSet(shape, ret, "Shape",
                     [ "id",
                       "closed",
                       "expression", "extra", "semActs", "annotations"]);
      return ret;
    },

    // ### `visitNodeConstraint` deep-copies the structure of a shape
    visitNodeConstraint: function (shape, label) {
      const ret = { type: "NodeConstraint" };
      _expect(shape, "type", "NodeConstraint");

      this._maybeSet(shape, ret, "NodeConstraint",
                     [ "id",
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
      // _expect(t, "type", "IriStemRange");
      if (!("type" in t))
        _Visitor.runtimeError(Error("expected "+JSON.stringify(t)+" to have a 'type' attribute."));
      const stemRangeTypes = ["IriStem", "LiteralStem", "LanguageStem", "IriStemRange", "LiteralStemRange", "LanguageStemRange"];
      if (stemRangeTypes.indexOf(t.type) === -1)
        _Visitor.runtimeError(Error("expected type attribute '"+t.type+"' to be in '"+stemRangeTypes+"'."));
      let stem;
      if (isTerm(t)) {
        _expect(t.stem, "type", "Wildcard");
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
        // _expect(c, "type", "IriStem");
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
    }

  };
  r.visitBase = r.visitStart = r.visitClosed = r["visit@context"] = r._visitValue;
  r.visitExtra = r.visitAnnotations = r._visitList;
  r.visitInverse = r.visitPredicate = r._visitValue;
  r.visitName = r.visitId = r.visitCode = r.visitMin = r.visitMax = r._visitValue;

  r.visitType = r.visitNodeKind = r.visitDatatype = r.visitPattern = r.visitFlags = r.visitLength = r.visitMinlength = r.visitMaxlength = r.visitMininclusive = r.visitMinexclusive = r.visitMaxinclusive = r.visitMaxexclusive = r.visitTotaldigits = r.visitFractiondigits = r._visitValue;
  r.visitOneOf = r.visitEachOf = r._visitGroup;
  r.visitShapeAnd = r.visitShapeOr = r._visitShapeGroup;
  r.visitInclude = r._visitValue;
  r.visitValueExpr = r.visitShapeExpr;
  return r;

  // Expect property p with value v in object o
  function _expect (o, p, v) {
    if (!(p in o))
      this._error("expected "+JSON.stringify(o)+" to have a ."+p);
    if (arguments.length > 2 && o[p] !== v)
      this._error("expected "+o[o]+" to equal ."+v);
  }

  function _error (str) {
    throw new Error(str);
  }
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
    ShExTerm:       __webpack_require__(118),
    Util:           __webpack_require__(443),
    Validator:      __webpack_require__(457),
    Writer:         __webpack_require__(95),
    Api:            __webpack_require__(410),
    Parser:         __webpack_require__(931),
    ShapeMap:       shapeMap,
    ShapeMapParser: shapeMap.Parser,
    DcTap:          __webpack_require__(281).DcTap,
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
        _ShExWriter._write(
          _ShExWriter._encodeShapeName(shapeExpr.id, false) +
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

      if (shape.expression) // t: 0
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