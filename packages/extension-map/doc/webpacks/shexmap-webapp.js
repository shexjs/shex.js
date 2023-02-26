/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 2752:
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

/***/ 9041:
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
    JisonParser.prototype.parse = function (input, yy) {
        if (yy === void 0) { yy = typeof this.yy === 'function' && typeof this.yy.constructor === 'function' ? new this.yy(this, this.lexer) : Object.create(this.yy); }
        var self = this, stack = [0], tstack = [], // token stack
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
        var args = lstack.slice.call(arguments, 1);
        //this.reductionCount = this.shiftCount = 0;
        var lexer = Object.create(this.lexer);
        var sharedState = { yy: yy };
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

/***/ 5281:
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
        type: "ShapeDecl",
        id: sh.shapeID,
        shapeExpr: {
          type: "Shape",
          expression: maybeAnd(sh.tripleConstraints.map(tc => Object.assign(
            {
              type: "TripleConstraint",
              predicate: tc.propertyID,
            },
            tc.mandatory ? { min: 1 } : {},
            tc.repeatable ? { max: -1 } : {},
            shexValueExpr(tc),
          )), "EachOf", "expressions")
        }
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

/***/ 2515:
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

/***/ 9431:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";



var loader = __webpack_require__(7633);
var dumper = __webpack_require__(8812);


function renamed(from, to) {
  return function () {
    throw new Error('Function yaml.' + from + ' is removed in js-yaml 4. ' +
      'Use yaml.' + to + ' instead, which is now safe by default.');
  };
}


module.exports.Type = __webpack_require__(8954);
module.exports.Schema = __webpack_require__(5771);
module.exports.FAILSAFE_SCHEMA = __webpack_require__(6126);
module.exports.JSON_SCHEMA = __webpack_require__(7505);
module.exports.CORE_SCHEMA = __webpack_require__(2230);
module.exports.DEFAULT_SCHEMA = __webpack_require__(215);
module.exports.load                = loader.load;
module.exports.loadAll             = loader.loadAll;
module.exports.dump                = dumper.dump;
module.exports.YAMLException = __webpack_require__(8689);

// Re-export all types in case user wants to create custom schema
module.exports.types = {
  binary:    __webpack_require__(9054),
  float:     __webpack_require__(9685),
  map:       __webpack_require__(1021),
  null:      __webpack_require__(4716),
  pairs:     __webpack_require__(7268),
  set:       __webpack_require__(9784),
  timestamp: __webpack_require__(8436),
  bool:      __webpack_require__(8568),
  int:       __webpack_require__(391),
  merge:     __webpack_require__(3021),
  omap:      __webpack_require__(7668),
  seq:       __webpack_require__(8394),
  str:       __webpack_require__(1002)
};

// Removed functions from JS-YAML 3.0.x
module.exports.safeLoad            = renamed('safeLoad', 'load');
module.exports.safeLoadAll         = renamed('safeLoadAll', 'loadAll');
module.exports.safeDump            = renamed('safeDump', 'dump');


/***/ }),

/***/ 1052:
/***/ ((module) => {

"use strict";



function isNothing(subject) {
  return (typeof subject === 'undefined') || (subject === null);
}


function isObject(subject) {
  return (typeof subject === 'object') && (subject !== null);
}


function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;
  else if (isNothing(sequence)) return [];

  return [ sequence ];
}


function extend(target, source) {
  var index, length, key, sourceKeys;

  if (source) {
    sourceKeys = Object.keys(source);

    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }

  return target;
}


function repeat(string, count) {
  var result = '', cycle;

  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }

  return result;
}


function isNegativeZero(number) {
  return (number === 0) && (Number.NEGATIVE_INFINITY === 1 / number);
}


module.exports.isNothing      = isNothing;
module.exports.isObject       = isObject;
module.exports.toArray        = toArray;
module.exports.repeat         = repeat;
module.exports.isNegativeZero = isNegativeZero;
module.exports.extend         = extend;


/***/ }),

/***/ 8812:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/*eslint-disable no-use-before-define*/

var common              = __webpack_require__(1052);
var YAMLException       = __webpack_require__(8689);
var DEFAULT_SCHEMA      = __webpack_require__(215);

var _toString       = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;

var CHAR_BOM                  = 0xFEFF;
var CHAR_TAB                  = 0x09; /* Tab */
var CHAR_LINE_FEED            = 0x0A; /* LF */
var CHAR_CARRIAGE_RETURN      = 0x0D; /* CR */
var CHAR_SPACE                = 0x20; /* Space */
var CHAR_EXCLAMATION          = 0x21; /* ! */
var CHAR_DOUBLE_QUOTE         = 0x22; /* " */
var CHAR_SHARP                = 0x23; /* # */
var CHAR_PERCENT              = 0x25; /* % */
var CHAR_AMPERSAND            = 0x26; /* & */
var CHAR_SINGLE_QUOTE         = 0x27; /* ' */
var CHAR_ASTERISK             = 0x2A; /* * */
var CHAR_COMMA                = 0x2C; /* , */
var CHAR_MINUS                = 0x2D; /* - */
var CHAR_COLON                = 0x3A; /* : */
var CHAR_EQUALS               = 0x3D; /* = */
var CHAR_GREATER_THAN         = 0x3E; /* > */
var CHAR_QUESTION             = 0x3F; /* ? */
var CHAR_COMMERCIAL_AT        = 0x40; /* @ */
var CHAR_LEFT_SQUARE_BRACKET  = 0x5B; /* [ */
var CHAR_RIGHT_SQUARE_BRACKET = 0x5D; /* ] */
var CHAR_GRAVE_ACCENT         = 0x60; /* ` */
var CHAR_LEFT_CURLY_BRACKET   = 0x7B; /* { */
var CHAR_VERTICAL_LINE        = 0x7C; /* | */
var CHAR_RIGHT_CURLY_BRACKET  = 0x7D; /* } */

var ESCAPE_SEQUENCES = {};

ESCAPE_SEQUENCES[0x00]   = '\\0';
ESCAPE_SEQUENCES[0x07]   = '\\a';
ESCAPE_SEQUENCES[0x08]   = '\\b';
ESCAPE_SEQUENCES[0x09]   = '\\t';
ESCAPE_SEQUENCES[0x0A]   = '\\n';
ESCAPE_SEQUENCES[0x0B]   = '\\v';
ESCAPE_SEQUENCES[0x0C]   = '\\f';
ESCAPE_SEQUENCES[0x0D]   = '\\r';
ESCAPE_SEQUENCES[0x1B]   = '\\e';
ESCAPE_SEQUENCES[0x22]   = '\\"';
ESCAPE_SEQUENCES[0x5C]   = '\\\\';
ESCAPE_SEQUENCES[0x85]   = '\\N';
ESCAPE_SEQUENCES[0xA0]   = '\\_';
ESCAPE_SEQUENCES[0x2028] = '\\L';
ESCAPE_SEQUENCES[0x2029] = '\\P';

var DEPRECATED_BOOLEANS_SYNTAX = [
  'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON',
  'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'
];

var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;

function compileStyleMap(schema, map) {
  var result, keys, index, length, tag, style, type;

  if (map === null) return {};

  result = {};
  keys = Object.keys(map);

  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map[tag]);

    if (tag.slice(0, 2) === '!!') {
      tag = 'tag:yaml.org,2002:' + tag.slice(2);
    }
    type = schema.compiledTypeMap['fallback'][tag];

    if (type && _hasOwnProperty.call(type.styleAliases, style)) {
      style = type.styleAliases[style];
    }

    result[tag] = style;
  }

  return result;
}

function encodeHex(character) {
  var string, handle, length;

  string = character.toString(16).toUpperCase();

  if (character <= 0xFF) {
    handle = 'x';
    length = 2;
  } else if (character <= 0xFFFF) {
    handle = 'u';
    length = 4;
  } else if (character <= 0xFFFFFFFF) {
    handle = 'U';
    length = 8;
  } else {
    throw new YAMLException('code point within a string may not be greater than 0xFFFFFFFF');
  }

  return '\\' + handle + common.repeat('0', length - string.length) + string;
}


var QUOTING_TYPE_SINGLE = 1,
    QUOTING_TYPE_DOUBLE = 2;

function State(options) {
  this.schema        = options['schema'] || DEFAULT_SCHEMA;
  this.indent        = Math.max(1, (options['indent'] || 2));
  this.noArrayIndent = options['noArrayIndent'] || false;
  this.skipInvalid   = options['skipInvalid'] || false;
  this.flowLevel     = (common.isNothing(options['flowLevel']) ? -1 : options['flowLevel']);
  this.styleMap      = compileStyleMap(this.schema, options['styles'] || null);
  this.sortKeys      = options['sortKeys'] || false;
  this.lineWidth     = options['lineWidth'] || 80;
  this.noRefs        = options['noRefs'] || false;
  this.noCompatMode  = options['noCompatMode'] || false;
  this.condenseFlow  = options['condenseFlow'] || false;
  this.quotingType   = options['quotingType'] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes   = options['forceQuotes'] || false;
  this.replacer      = typeof options['replacer'] === 'function' ? options['replacer'] : null;

  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;

  this.tag = null;
  this.result = '';

  this.duplicates = [];
  this.usedDuplicates = null;
}

// Indents every line in a string. Empty lines (\n only) are not indented.
function indentString(string, spaces) {
  var ind = common.repeat(' ', spaces),
      position = 0,
      next = -1,
      result = '',
      line,
      length = string.length;

  while (position < length) {
    next = string.indexOf('\n', position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }

    if (line.length && line !== '\n') result += ind;

    result += line;
  }

  return result;
}

function generateNextLine(state, level) {
  return '\n' + common.repeat(' ', state.indent * level);
}

function testImplicitResolving(state, str) {
  var index, length, type;

  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type = state.implicitTypes[index];

    if (type.resolve(str)) {
      return true;
    }
  }

  return false;
}

// [33] s-white ::= s-space | s-tab
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}

// Returns true if the character can be printed without escaping.
// From YAML 1.2: "any allowed characters known to be non-printable
// should also be escaped. [However,] This isn’t mandatory"
// Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.
function isPrintable(c) {
  return  (0x00020 <= c && c <= 0x00007E)
      || ((0x000A1 <= c && c <= 0x00D7FF) && c !== 0x2028 && c !== 0x2029)
      || ((0x0E000 <= c && c <= 0x00FFFD) && c !== CHAR_BOM)
      ||  (0x10000 <= c && c <= 0x10FFFF);
}

// [34] ns-char ::= nb-char - s-white
// [27] nb-char ::= c-printable - b-char - c-byte-order-mark
// [26] b-char  ::= b-line-feed | b-carriage-return
// Including s-white (for some reason, examples doesn't match specs in this aspect)
// ns-char ::= c-printable - b-line-feed - b-carriage-return - c-byte-order-mark
function isNsCharOrWhitespace(c) {
  return isPrintable(c)
    && c !== CHAR_BOM
    // - b-char
    && c !== CHAR_CARRIAGE_RETURN
    && c !== CHAR_LINE_FEED;
}

// [127]  ns-plain-safe(c) ::= c = flow-out  ⇒ ns-plain-safe-out
//                             c = flow-in   ⇒ ns-plain-safe-in
//                             c = block-key ⇒ ns-plain-safe-out
//                             c = flow-key  ⇒ ns-plain-safe-in
// [128] ns-plain-safe-out ::= ns-char
// [129]  ns-plain-safe-in ::= ns-char - c-flow-indicator
// [130]  ns-plain-char(c) ::=  ( ns-plain-safe(c) - “:” - “#” )
//                            | ( /* An ns-char preceding */ “#” )
//                            | ( “:” /* Followed by an ns-plain-safe(c) */ )
function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (
    // ns-plain-safe
    inblock ? // c = flow-in
      cIsNsCharOrWhitespace
      : cIsNsCharOrWhitespace
        // - c-flow-indicator
        && c !== CHAR_COMMA
        && c !== CHAR_LEFT_SQUARE_BRACKET
        && c !== CHAR_RIGHT_SQUARE_BRACKET
        && c !== CHAR_LEFT_CURLY_BRACKET
        && c !== CHAR_RIGHT_CURLY_BRACKET
  )
    // ns-plain-char
    && c !== CHAR_SHARP // false on '#'
    && !(prev === CHAR_COLON && !cIsNsChar) // false on ': '
    || (isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP) // change to true on '[^ ]#'
    || (prev === CHAR_COLON && cIsNsChar); // change to true on ':[^ ]'
}

// Simplified test for values allowed as the first character in plain style.
function isPlainSafeFirst(c) {
  // Uses a subset of ns-char - c-indicator
  // where ns-char = nb-char - s-white.
  // No support of ( ( “?” | “:” | “-” ) /* Followed by an ns-plain-safe(c)) */ ) part
  return isPrintable(c) && c !== CHAR_BOM
    && !isWhitespace(c) // - s-white
    // - (c-indicator ::=
    // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
    && c !== CHAR_MINUS
    && c !== CHAR_QUESTION
    && c !== CHAR_COLON
    && c !== CHAR_COMMA
    && c !== CHAR_LEFT_SQUARE_BRACKET
    && c !== CHAR_RIGHT_SQUARE_BRACKET
    && c !== CHAR_LEFT_CURLY_BRACKET
    && c !== CHAR_RIGHT_CURLY_BRACKET
    // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
    && c !== CHAR_SHARP
    && c !== CHAR_AMPERSAND
    && c !== CHAR_ASTERISK
    && c !== CHAR_EXCLAMATION
    && c !== CHAR_VERTICAL_LINE
    && c !== CHAR_EQUALS
    && c !== CHAR_GREATER_THAN
    && c !== CHAR_SINGLE_QUOTE
    && c !== CHAR_DOUBLE_QUOTE
    // | “%” | “@” | “`”)
    && c !== CHAR_PERCENT
    && c !== CHAR_COMMERCIAL_AT
    && c !== CHAR_GRAVE_ACCENT;
}

// Simplified test for values allowed as the last character in plain style.
function isPlainSafeLast(c) {
  // just not whitespace or colon, it will be checked to be plain character later
  return !isWhitespace(c) && c !== CHAR_COLON;
}

// Same as 'string'.codePointAt(pos), but works in older browsers.
function codePointAt(string, pos) {
  var first = string.charCodeAt(pos), second;
  if (first >= 0xD800 && first <= 0xDBFF && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);
    if (second >= 0xDC00 && second <= 0xDFFF) {
      // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
    }
  }
  return first;
}

// Determines whether block indentation indicator is required.
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}

var STYLE_PLAIN   = 1,
    STYLE_SINGLE  = 2,
    STYLE_LITERAL = 3,
    STYLE_FOLDED  = 4,
    STYLE_DOUBLE  = 5;

// Determines which scalar styles are possible and returns the preferred style.
// lineWidth = -1 => no limit.
// Pre-conditions: str.length > 0.
// Post-conditions:
//    STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
//    STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
//    STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth != -1).
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth,
  testAmbiguousType, quotingType, forceQuotes, inblock) {

  var i;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false; // only checked if shouldTrackWidth
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1; // count the first line correctly
  var plain = isPlainSafeFirst(codePointAt(string, 0))
          && isPlainSafeLast(codePointAt(string, string.length - 1));

  if (singleLineOnly || forceQuotes) {
    // Case: no block styles.
    // Check for disallowed characters to rule out plain and single.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    // Case: block styles permitted.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        // Check if any line can be folded.
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine ||
            // Foldable line = too long, and not more-indented.
            (i - previousLineBreak - 1 > lineWidth &&
             string[previousLineBreak + 1] !== ' ');
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    // in case the end is missing a \n
    hasFoldableLine = hasFoldableLine || (shouldTrackWidth &&
      (i - previousLineBreak - 1 > lineWidth &&
       string[previousLineBreak + 1] !== ' '));
  }
  // Although every style can represent \n without escaping, prefer block styles
  // for multiline, since they're more readable and they don't add empty lines.
  // Also prefer folding a super-long line.
  if (!hasLineBreak && !hasFoldableLine) {
    // Strings interpretable as another type have to be quoted;
    // e.g. the string 'true' vs. the boolean true.
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  // Edge case: block indentation indicator can only have one digit.
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  // At this point we know block styles are valid.
  // Prefer literal style unless we want to fold.
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}

// Note: line breaking/folding is implemented for only the folded style.
// NB. We drop the last trailing newline (if any) of a returned block scalar
//  since the dumper adds its own newline. This always works:
//    • No ending newline => unaffected; already using strip "-" chomping.
//    • Ending newline    => removed then restored.
//  Importantly, this keeps the "+" chomp indicator from gaining an extra line.
function writeScalar(state, string, level, iskey, inblock) {
  state.dump = (function () {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? ('"' + string + '"') : ("'" + string + "'");
      }
    }

    var indent = state.indent * Math.max(1, level); // no 0-indent scalars
    // As indentation gets deeper, let the width decrease monotonically
    // to the lower bound min(state.lineWidth, 40).
    // Note that this implies
    //  state.lineWidth ≤ 40 + state.indent: width is fixed at the lower bound.
    //  state.lineWidth > 40 + state.indent: width decreases until the lower bound.
    // This behaves better than a constant minimum width which disallows narrower options,
    // or an indent threshold which causes the width to suddenly increase.
    var lineWidth = state.lineWidth === -1
      ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);

    // Without knowing if keys are implicit/explicit, assume implicit for safety.
    var singleLineOnly = iskey
      // No block styles in flow mode.
      || (state.flowLevel > -1 && level >= state.flowLevel);
    function testAmbiguity(string) {
      return testImplicitResolving(state, string);
    }

    switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth,
      testAmbiguity, state.quotingType, state.forceQuotes && !iskey, inblock)) {

      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return '|' + blockHeader(string, state.indent)
          + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return '>' + blockHeader(string, state.indent)
          + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string, lineWidth) + '"';
      default:
        throw new YAMLException('impossible error: invalid scalar style');
    }
  }());
}

// Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : '';

  // note the special case: the string '\n' counts as a "trailing" empty line.
  var clip =          string[string.length - 1] === '\n';
  var keep = clip && (string[string.length - 2] === '\n' || string === '\n');
  var chomp = keep ? '+' : (clip ? '' : '-');

  return indentIndicator + chomp + '\n';
}

// (See the note for writeScalar.)
function dropEndingNewline(string) {
  return string[string.length - 1] === '\n' ? string.slice(0, -1) : string;
}

// Note: a long line without a suitable break point will exceed the width limit.
// Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.
function foldString(string, width) {
  // In folded style, $k$ consecutive newlines output as $k+1$ newlines—
  // unless they're before or after a more-indented line, or at the very
  // beginning or end, in which case $k$ maps to $k$.
  // Therefore, parse each chunk as newline(s) followed by a content line.
  var lineRe = /(\n+)([^\n]*)/g;

  // first line (possibly an empty line)
  var result = (function () {
    var nextLF = string.indexOf('\n');
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  }());
  // If we haven't reached the first content line yet, don't add an extra \n.
  var prevMoreIndented = string[0] === '\n' || string[0] === ' ';
  var moreIndented;

  // rest of the lines
  var match;
  while ((match = lineRe.exec(string))) {
    var prefix = match[1], line = match[2];
    moreIndented = (line[0] === ' ');
    result += prefix
      + (!prevMoreIndented && !moreIndented && line !== ''
        ? '\n' : '')
      + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }

  return result;
}

// Greedy line breaking.
// Picks the longest line under the limit each time,
// otherwise settles for the shortest line over the limit.
// NB. More-indented lines *cannot* be folded, as that would add an extra \n.
function foldLine(line, width) {
  if (line === '' || line[0] === ' ') return line;

  // Since a more-indented line adds a \n, breaks can't be followed by a space.
  var breakRe = / [^ ]/g; // note: the match index will always be <= length-2.
  var match;
  // start is an inclusive index. end, curr, and next are exclusive.
  var start = 0, end, curr = 0, next = 0;
  var result = '';

  // Invariants: 0 <= start <= length-1.
  //   0 <= curr <= next <= max(0, length-2). curr - start <= width.
  // Inside the loop:
  //   A match implies length >= 2, so curr and next are <= length-2.
  while ((match = breakRe.exec(line))) {
    next = match.index;
    // maintain invariant: curr - start <= width
    if (next - start > width) {
      end = (curr > start) ? curr : next; // derive end <= length-2
      result += '\n' + line.slice(start, end);
      // skip the space that was output as \n
      start = end + 1;                    // derive start <= length-1
    }
    curr = next;
  }

  // By the invariants, start <= length-1, so there is something left over.
  // It is either the whole string or a part starting from non-whitespace.
  result += '\n';
  // Insert a break if the remainder is too long and there is a break available.
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + '\n' + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }

  return result.slice(1); // drop extra \n joiner
}

// Escapes a double-quoted string.
function escapeString(string) {
  var result = '';
  var char = 0;
  var escapeSeq;

  for (var i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
    char = codePointAt(string, i);
    escapeSeq = ESCAPE_SEQUENCES[char];

    if (!escapeSeq && isPrintable(char)) {
      result += string[i];
      if (char >= 0x10000) result += string[i + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }

  return result;
}

function writeFlowSequence(state, level, object) {
  var _result = '',
      _tag    = state.tag,
      index,
      length,
      value;

  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];

    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }

    // Write only valid elements, put null instead of invalid elements.
    if (writeNode(state, level, value, false, false) ||
        (typeof value === 'undefined' &&
         writeNode(state, level, null, false, false))) {

      if (_result !== '') _result += ',' + (!state.condenseFlow ? ' ' : '');
      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = '[' + _result + ']';
}

function writeBlockSequence(state, level, object, compact) {
  var _result = '',
      _tag    = state.tag,
      index,
      length,
      value;

  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];

    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }

    // Write only valid elements, put null instead of invalid elements.
    if (writeNode(state, level + 1, value, true, true, false, true) ||
        (typeof value === 'undefined' &&
         writeNode(state, level + 1, null, true, true, false, true))) {

      if (!compact || _result !== '') {
        _result += generateNextLine(state, level);
      }

      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += '-';
      } else {
        _result += '- ';
      }

      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = _result || '[]'; // Empty sequence if no valid values.
}

function writeFlowMapping(state, level, object) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      pairBuffer;

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {

    pairBuffer = '';
    if (_result !== '') pairBuffer += ', ';

    if (state.condenseFlow) pairBuffer += '"';

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }

    if (!writeNode(state, level, objectKey, false, false)) {
      continue; // Skip this pair because of invalid key;
    }

    if (state.dump.length > 1024) pairBuffer += '? ';

    pairBuffer += state.dump + (state.condenseFlow ? '"' : '') + ':' + (state.condenseFlow ? '' : ' ');

    if (!writeNode(state, level, objectValue, false, false)) {
      continue; // Skip this pair because of invalid value.
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = '{' + _result + '}';
}

function writeBlockMapping(state, level, object, compact) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      explicitPair,
      pairBuffer;

  // Allow sorting keys so that the output file is deterministic
  if (state.sortKeys === true) {
    // Default sorting
    objectKeyList.sort();
  } else if (typeof state.sortKeys === 'function') {
    // Custom sort function
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    // Something is wrong
    throw new YAMLException('sortKeys must be a boolean or a function');
  }

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = '';

    if (!compact || _result !== '') {
      pairBuffer += generateNextLine(state, level);
    }

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }

    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue; // Skip this pair because of invalid key.
    }

    explicitPair = (state.tag !== null && state.tag !== '?') ||
                   (state.dump && state.dump.length > 1024);

    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += '?';
      } else {
        pairBuffer += '? ';
      }
    }

    pairBuffer += state.dump;

    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }

    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue; // Skip this pair because of invalid value.
    }

    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ':';
    } else {
      pairBuffer += ': ';
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = _result || '{}'; // Empty mapping if no valid pairs.
}

function detectType(state, object, explicit) {
  var _result, typeList, index, length, type, style;

  typeList = explicit ? state.explicitTypes : state.implicitTypes;

  for (index = 0, length = typeList.length; index < length; index += 1) {
    type = typeList[index];

    if ((type.instanceOf  || type.predicate) &&
        (!type.instanceOf || ((typeof object === 'object') && (object instanceof type.instanceOf))) &&
        (!type.predicate  || type.predicate(object))) {

      if (explicit) {
        if (type.multi && type.representName) {
          state.tag = type.representName(object);
        } else {
          state.tag = type.tag;
        }
      } else {
        state.tag = '?';
      }

      if (type.represent) {
        style = state.styleMap[type.tag] || type.defaultStyle;

        if (_toString.call(type.represent) === '[object Function]') {
          _result = type.represent(object, style);
        } else if (_hasOwnProperty.call(type.represent, style)) {
          _result = type.represent[style](object, style);
        } else {
          throw new YAMLException('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
        }

        state.dump = _result;
      }

      return true;
    }
  }

  return false;
}

// Serializes `object` and writes it to global `result`.
// Returns true on success, or false on invalid object.
//
function writeNode(state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;

  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }

  var type = _toString.call(state.dump);
  var inblock = block;
  var tagStr;

  if (block) {
    block = (state.flowLevel < 0 || state.flowLevel > level);
  }

  var objectOrArray = type === '[object Object]' || type === '[object Array]',
      duplicateIndex,
      duplicate;

  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }

  if ((state.tag !== null && state.tag !== '?') || duplicate || (state.indent !== 2 && level > 0)) {
    compact = false;
  }

  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = '*ref_' + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type === '[object Object]') {
      if (block && (Object.keys(state.dump).length !== 0)) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object Array]') {
      if (block && (state.dump.length !== 0)) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object String]') {
      if (state.tag !== '?') {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type === '[object Undefined]') {
      return false;
    } else {
      if (state.skipInvalid) return false;
      throw new YAMLException('unacceptable kind of an object to dump ' + type);
    }

    if (state.tag !== null && state.tag !== '?') {
      // Need to encode all characters except those allowed by the spec:
      //
      // [35] ns-dec-digit    ::=  [#x30-#x39] /* 0-9 */
      // [36] ns-hex-digit    ::=  ns-dec-digit
      //                         | [#x41-#x46] /* A-F */ | [#x61-#x66] /* a-f */
      // [37] ns-ascii-letter ::=  [#x41-#x5A] /* A-Z */ | [#x61-#x7A] /* a-z */
      // [38] ns-word-char    ::=  ns-dec-digit | ns-ascii-letter | “-”
      // [39] ns-uri-char     ::=  “%” ns-hex-digit ns-hex-digit | ns-word-char | “#”
      //                         | “;” | “/” | “?” | “:” | “@” | “&” | “=” | “+” | “$” | “,”
      //                         | “_” | “.” | “!” | “~” | “*” | “'” | “(” | “)” | “[” | “]”
      //
      // Also need to encode '!' because it has special meaning (end of tag prefix).
      //
      tagStr = encodeURI(
        state.tag[0] === '!' ? state.tag.slice(1) : state.tag
      ).replace(/!/g, '%21');

      if (state.tag[0] === '!') {
        tagStr = '!' + tagStr;
      } else if (tagStr.slice(0, 18) === 'tag:yaml.org,2002:') {
        tagStr = '!!' + tagStr.slice(18);
      } else {
        tagStr = '!<' + tagStr + '>';
      }

      state.dump = tagStr + ' ' + state.dump;
    }
  }

  return true;
}

function getDuplicateReferences(object, state) {
  var objects = [],
      duplicatesIndexes = [],
      index,
      length;

  inspectNode(object, objects, duplicatesIndexes);

  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}

function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList,
      index,
      length;

  if (object !== null && typeof object === 'object') {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);

      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);

        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}

function dump(input, options) {
  options = options || {};

  var state = new State(options);

  if (!state.noRefs) getDuplicateReferences(input, state);

  var value = input;

  if (state.replacer) {
    value = state.replacer.call({ '': value }, '', value);
  }

  if (writeNode(state, 0, value, true, true)) return state.dump + '\n';

  return '';
}

module.exports.dump = dump;


/***/ }),

/***/ 8689:
/***/ ((module) => {

"use strict";
// YAML error class. http://stackoverflow.com/questions/8458984
//



function formatError(exception, compact) {
  var where = '', message = exception.reason || '(unknown reason)';

  if (!exception.mark) return message;

  if (exception.mark.name) {
    where += 'in "' + exception.mark.name + '" ';
  }

  where += '(' + (exception.mark.line + 1) + ':' + (exception.mark.column + 1) + ')';

  if (!compact && exception.mark.snippet) {
    where += '\n\n' + exception.mark.snippet;
  }

  return message + ' ' + where;
}


function YAMLException(reason, mark) {
  // Super constructor
  Error.call(this);

  this.name = 'YAMLException';
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false);

  // Include stack trace in error object
  if (Error.captureStackTrace) {
    // Chrome and NodeJS
    Error.captureStackTrace(this, this.constructor);
  } else {
    // FF, IE 10+ and Safari 6+. Fallback for others
    this.stack = (new Error()).stack || '';
  }
}


// Inherit from Error
YAMLException.prototype = Object.create(Error.prototype);
YAMLException.prototype.constructor = YAMLException;


YAMLException.prototype.toString = function toString(compact) {
  return this.name + ': ' + formatError(this, compact);
};


module.exports = YAMLException;


/***/ }),

/***/ 7633:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/*eslint-disable max-len,no-use-before-define*/

var common              = __webpack_require__(1052);
var YAMLException       = __webpack_require__(8689);
var makeSnippet         = __webpack_require__(901);
var DEFAULT_SCHEMA      = __webpack_require__(215);


var _hasOwnProperty = Object.prototype.hasOwnProperty;


var CONTEXT_FLOW_IN   = 1;
var CONTEXT_FLOW_OUT  = 2;
var CONTEXT_BLOCK_IN  = 3;
var CONTEXT_BLOCK_OUT = 4;


var CHOMPING_CLIP  = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP  = 3;


var PATTERN_NON_PRINTABLE         = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS       = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE            = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI               = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;


function _class(obj) { return Object.prototype.toString.call(obj); }

function is_EOL(c) {
  return (c === 0x0A/* LF */) || (c === 0x0D/* CR */);
}

function is_WHITE_SPACE(c) {
  return (c === 0x09/* Tab */) || (c === 0x20/* Space */);
}

function is_WS_OR_EOL(c) {
  return (c === 0x09/* Tab */) ||
         (c === 0x20/* Space */) ||
         (c === 0x0A/* LF */) ||
         (c === 0x0D/* CR */);
}

function is_FLOW_INDICATOR(c) {
  return c === 0x2C/* , */ ||
         c === 0x5B/* [ */ ||
         c === 0x5D/* ] */ ||
         c === 0x7B/* { */ ||
         c === 0x7D/* } */;
}

function fromHexCode(c) {
  var lc;

  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  /*eslint-disable no-bitwise*/
  lc = c | 0x20;

  if ((0x61/* a */ <= lc) && (lc <= 0x66/* f */)) {
    return lc - 0x61 + 10;
  }

  return -1;
}

function escapedHexLen(c) {
  if (c === 0x78/* x */) { return 2; }
  if (c === 0x75/* u */) { return 4; }
  if (c === 0x55/* U */) { return 8; }
  return 0;
}

function fromDecimalCode(c) {
  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  return -1;
}

function simpleEscapeSequence(c) {
  /* eslint-disable indent */
  return (c === 0x30/* 0 */) ? '\x00' :
        (c === 0x61/* a */) ? '\x07' :
        (c === 0x62/* b */) ? '\x08' :
        (c === 0x74/* t */) ? '\x09' :
        (c === 0x09/* Tab */) ? '\x09' :
        (c === 0x6E/* n */) ? '\x0A' :
        (c === 0x76/* v */) ? '\x0B' :
        (c === 0x66/* f */) ? '\x0C' :
        (c === 0x72/* r */) ? '\x0D' :
        (c === 0x65/* e */) ? '\x1B' :
        (c === 0x20/* Space */) ? ' ' :
        (c === 0x22/* " */) ? '\x22' :
        (c === 0x2F/* / */) ? '/' :
        (c === 0x5C/* \ */) ? '\x5C' :
        (c === 0x4E/* N */) ? '\x85' :
        (c === 0x5F/* _ */) ? '\xA0' :
        (c === 0x4C/* L */) ? '\u2028' :
        (c === 0x50/* P */) ? '\u2029' : '';
}

function charFromCodepoint(c) {
  if (c <= 0xFFFF) {
    return String.fromCharCode(c);
  }
  // Encode UTF-16 surrogate pair
  // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
  return String.fromCharCode(
    ((c - 0x010000) >> 10) + 0xD800,
    ((c - 0x010000) & 0x03FF) + 0xDC00
  );
}

var simpleEscapeCheck = new Array(256); // integer, for fast access
var simpleEscapeMap = new Array(256);
for (var i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}


function State(input, options) {
  this.input = input;

  this.filename  = options['filename']  || null;
  this.schema    = options['schema']    || DEFAULT_SCHEMA;
  this.onWarning = options['onWarning'] || null;
  // (Hidden) Remove? makes the loader to expect YAML 1.1 documents
  // if such documents have no explicit %YAML directive
  this.legacy    = options['legacy']    || false;

  this.json      = options['json']      || false;
  this.listener  = options['listener']  || null;

  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap       = this.schema.compiledTypeMap;

  this.length     = input.length;
  this.position   = 0;
  this.line       = 0;
  this.lineStart  = 0;
  this.lineIndent = 0;

  // position of first leading tab in the current line,
  // used to make sure there are no tabs in the indentation
  this.firstTabInLine = -1;

  this.documents = [];

  /*
  this.version;
  this.checkLineBreaks;
  this.tagMap;
  this.anchorMap;
  this.tag;
  this.anchor;
  this.kind;
  this.result;*/

}


function generateError(state, message) {
  var mark = {
    name:     state.filename,
    buffer:   state.input.slice(0, -1), // omit trailing \0
    position: state.position,
    line:     state.line,
    column:   state.position - state.lineStart
  };

  mark.snippet = makeSnippet(mark);

  return new YAMLException(message, mark);
}

function throwError(state, message) {
  throw generateError(state, message);
}

function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}


var directiveHandlers = {

  YAML: function handleYamlDirective(state, name, args) {

    var match, major, minor;

    if (state.version !== null) {
      throwError(state, 'duplication of %YAML directive');
    }

    if (args.length !== 1) {
      throwError(state, 'YAML directive accepts exactly one argument');
    }

    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

    if (match === null) {
      throwError(state, 'ill-formed argument of the YAML directive');
    }

    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);

    if (major !== 1) {
      throwError(state, 'unacceptable YAML version of the document');
    }

    state.version = args[0];
    state.checkLineBreaks = (minor < 2);

    if (minor !== 1 && minor !== 2) {
      throwWarning(state, 'unsupported YAML version of the document');
    }
  },

  TAG: function handleTagDirective(state, name, args) {

    var handle, prefix;

    if (args.length !== 2) {
      throwError(state, 'TAG directive accepts exactly two arguments');
    }

    handle = args[0];
    prefix = args[1];

    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
    }

    if (_hasOwnProperty.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }

    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
    }

    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, 'tag prefix is malformed: ' + prefix);
    }

    state.tagMap[handle] = prefix;
  }
};


function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;

  if (start < end) {
    _result = state.input.slice(start, end);

    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 0x09 ||
              (0x20 <= _character && _character <= 0x10FFFF))) {
          throwError(state, 'expected valid JSON character');
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, 'the stream contains non-printable characters');
    }

    state.result += _result;
  }
}

function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;

  if (!common.isObject(source)) {
    throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
  }

  sourceKeys = Object.keys(source);

  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];

    if (!_hasOwnProperty.call(destination, key)) {
      destination[key] = source[key];
      overridableKeys[key] = true;
    }
  }
}

function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode,
  startLine, startLineStart, startPos) {

  var index, quantity;

  // The output is a plain object here, so keys can only be strings.
  // We need to convert keyNode to a string, but doing so can hang the process
  // (deeply nested arrays that explode exponentially using aliases).
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);

    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, 'nested arrays are not supported inside keys');
      }

      if (typeof keyNode === 'object' && _class(keyNode[index]) === '[object Object]') {
        keyNode[index] = '[object Object]';
      }
    }
  }

  // Avoid code execution in load() via toString property
  // (still use its own toString for arrays, timestamps,
  // and whatever user schema extensions happen to have @@toStringTag)
  if (typeof keyNode === 'object' && _class(keyNode) === '[object Object]') {
    keyNode = '[object Object]';
  }


  keyNode = String(keyNode);

  if (_result === null) {
    _result = {};
  }

  if (keyTag === 'tag:yaml.org,2002:merge') {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json &&
        !_hasOwnProperty.call(overridableKeys, keyNode) &&
        _hasOwnProperty.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, 'duplicated mapping key');
    }

    // used for this specific key only because Object.defineProperty is slow
    if (keyNode === '__proto__') {
      Object.defineProperty(_result, keyNode, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: valueNode
      });
    } else {
      _result[keyNode] = valueNode;
    }
    delete overridableKeys[keyNode];
  }

  return _result;
}

function readLineBreak(state) {
  var ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x0A/* LF */) {
    state.position++;
  } else if (ch === 0x0D/* CR */) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 0x0A/* LF */) {
      state.position++;
    }
  } else {
    throwError(state, 'a line break is expected');
  }

  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}

function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0,
      ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 0x09/* Tab */ && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }

    if (allowComments && ch === 0x23/* # */) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 0x0A/* LF */ && ch !== 0x0D/* CR */ && ch !== 0);
    }

    if (is_EOL(ch)) {
      readLineBreak(state);

      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;

      while (ch === 0x20/* Space */) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }

  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, 'deficient indentation');
  }

  return lineBreaks;
}

function testDocumentSeparator(state) {
  var _position = state.position,
      ch;

  ch = state.input.charCodeAt(_position);

  // Condition state.position === state.lineStart is tested
  // in parent on each call, for efficiency. No needs to test here again.
  if ((ch === 0x2D/* - */ || ch === 0x2E/* . */) &&
      ch === state.input.charCodeAt(_position + 1) &&
      ch === state.input.charCodeAt(_position + 2)) {

    _position += 3;

    ch = state.input.charCodeAt(_position);

    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }

  return false;
}

function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += ' ';
  } else if (count > 1) {
    state.result += common.repeat('\n', count - 1);
  }
}


function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding,
      following,
      captureStart,
      captureEnd,
      hasPendingContent,
      _line,
      _lineStart,
      _lineIndent,
      _kind = state.kind,
      _result = state.result,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (is_WS_OR_EOL(ch)      ||
      is_FLOW_INDICATOR(ch) ||
      ch === 0x23/* # */    ||
      ch === 0x26/* & */    ||
      ch === 0x2A/* * */    ||
      ch === 0x21/* ! */    ||
      ch === 0x7C/* | */    ||
      ch === 0x3E/* > */    ||
      ch === 0x27/* ' */    ||
      ch === 0x22/* " */    ||
      ch === 0x25/* % */    ||
      ch === 0x40/* @ */    ||
      ch === 0x60/* ` */) {
    return false;
  }

  if (ch === 0x3F/* ? */ || ch === 0x2D/* - */) {
    following = state.input.charCodeAt(state.position + 1);

    if (is_WS_OR_EOL(following) ||
        withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }

  state.kind = 'scalar';
  state.result = '';
  captureStart = captureEnd = state.position;
  hasPendingContent = false;

  while (ch !== 0) {
    if (ch === 0x3A/* : */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following) ||
          withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }

    } else if (ch === 0x23/* # */) {
      preceding = state.input.charCodeAt(state.position - 1);

      if (is_WS_OR_EOL(preceding)) {
        break;
      }

    } else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
               withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;

    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);

      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }

    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }

    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }

    ch = state.input.charCodeAt(++state.position);
  }

  captureSegment(state, captureStart, captureEnd, false);

  if (state.result) {
    return true;
  }

  state.kind = _kind;
  state.result = _result;
  return false;
}

function readSingleQuotedScalar(state, nodeIndent) {
  var ch,
      captureStart, captureEnd;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x27/* ' */) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x27/* ' */) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (ch === 0x27/* ' */) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a single quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a single quoted scalar');
}

function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart,
      captureEnd,
      hexLength,
      hexResult,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x22/* " */) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x22/* " */) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;

    } else if (ch === 0x5C/* \ */) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);

        // TODO: rework to inline fn with no type cast?
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;

      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;

        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);

          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;

          } else {
            throwError(state, 'expected hexadecimal character');
          }
        }

        state.result += charFromCodepoint(hexResult);

        state.position++;

      } else {
        throwError(state, 'unknown escape sequence');
      }

      captureStart = captureEnd = state.position;

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a double quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a double quoted scalar');
}

function readFlowCollection(state, nodeIndent) {
  var readNext = true,
      _line,
      _lineStart,
      _pos,
      _tag     = state.tag,
      _result,
      _anchor  = state.anchor,
      following,
      terminator,
      isPair,
      isExplicitPair,
      isMapping,
      overridableKeys = Object.create(null),
      keyNode,
      keyTag,
      valueNode,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x5B/* [ */) {
    terminator = 0x5D;/* ] */
    isMapping = false;
    _result = [];
  } else if (ch === 0x7B/* { */) {
    terminator = 0x7D;/* } */
    isMapping = true;
    _result = {};
  } else {
    return false;
  }

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(++state.position);

  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? 'mapping' : 'sequence';
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, 'missed comma between flow collection entries');
    } else if (ch === 0x2C/* , */) {
      // "flow collection entries can never be completely empty", as per YAML 1.2, section 7.4
      throwError(state, "expected the node content, but found ','");
    }

    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;

    if (ch === 0x3F/* ? */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }

    _line = state.line; // Save the current line.
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if ((isExplicitPair || state.line === _line) && ch === 0x3A/* : */) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }

    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }

    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === 0x2C/* , */) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }

  throwError(state, 'unexpected end of the stream within a flow collection');
}

function readBlockScalar(state, nodeIndent) {
  var captureStart,
      folding,
      chomping       = CHOMPING_CLIP,
      didReadContent = false,
      detectedIndent = false,
      textIndent     = nodeIndent,
      emptyLines     = 0,
      atMoreIndented = false,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x7C/* | */) {
    folding = false;
  } else if (ch === 0x3E/* > */) {
    folding = true;
  } else {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';

  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);

    if (ch === 0x2B/* + */ || ch === 0x2D/* - */) {
      if (CHOMPING_CLIP === chomping) {
        chomping = (ch === 0x2B/* + */) ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, 'repeat of a chomping mode identifier');
      }

    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, 'repeat of an indentation width identifier');
      }

    } else {
      break;
    }
  }

  if (is_WHITE_SPACE(ch)) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (is_WHITE_SPACE(ch));

    if (ch === 0x23/* # */) {
      do { ch = state.input.charCodeAt(++state.position); }
      while (!is_EOL(ch) && (ch !== 0));
    }
  }

  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;

    ch = state.input.charCodeAt(state.position);

    while ((!detectedIndent || state.lineIndent < textIndent) &&
           (ch === 0x20/* Space */)) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }

    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }

    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }

    // End of the scalar.
    if (state.lineIndent < textIndent) {

      // Perform the chomping.
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) { // i.e. only if the scalar is not empty.
          state.result += '\n';
        }
      }

      // Break this `while` cycle and go to the funciton's epilogue.
      break;
    }

    // Folded style: use fancy rules to handle line breaks.
    if (folding) {

      // Lines starting with white space characters (more-indented lines) are not folded.
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        // except for the first content line (cf. Example 8.1)
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);

      // End of more-indented block.
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat('\n', emptyLines + 1);

      // Just one line break - perceive as the same line.
      } else if (emptyLines === 0) {
        if (didReadContent) { // i.e. only if we have already read some scalar content.
          state.result += ' ';
        }

      // Several line breaks - perceive as different lines.
      } else {
        state.result += common.repeat('\n', emptyLines);
      }

    // Literal style: just add exact number of line breaks between content lines.
    } else {
      // Keep all line breaks except the header line break.
      state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
    }

    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;

    while (!is_EOL(ch) && (ch !== 0)) {
      ch = state.input.charCodeAt(++state.position);
    }

    captureSegment(state, captureStart, state.position, false);
  }

  return true;
}

function readBlockSequence(state, nodeIndent) {
  var _line,
      _tag      = state.tag,
      _anchor   = state.anchor,
      _result   = [],
      following,
      detected  = false,
      ch;

  // there is a leading tab before this token, so it can't be a block sequence/mapping;
  // it can still be flow sequence/mapping or a scalar
  if (state.firstTabInLine !== -1) return false;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, 'tab characters must not be used in indentation');
    }

    if (ch !== 0x2D/* - */) {
      break;
    }

    following = state.input.charCodeAt(state.position + 1);

    if (!is_WS_OR_EOL(following)) {
      break;
    }

    detected = true;
    state.position++;

    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }

    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
      throwError(state, 'bad indentation of a sequence entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'sequence';
    state.result = _result;
    return true;
  }
  return false;
}

function readBlockMapping(state, nodeIndent, flowIndent) {
  var following,
      allowCompact,
      _line,
      _keyLine,
      _keyLineStart,
      _keyPos,
      _tag          = state.tag,
      _anchor       = state.anchor,
      _result       = {},
      overridableKeys = Object.create(null),
      keyTag        = null,
      keyNode       = null,
      valueNode     = null,
      atExplicitKey = false,
      detected      = false,
      ch;

  // there is a leading tab before this token, so it can't be a block sequence/mapping;
  // it can still be flow sequence/mapping or a scalar
  if (state.firstTabInLine !== -1) return false;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, 'tab characters must not be used in indentation');
    }

    following = state.input.charCodeAt(state.position + 1);
    _line = state.line; // Save the current line.

    //
    // Explicit notation case. There are two separate blocks:
    // first for the key (denoted by "?") and second for the value (denoted by ":")
    //
    if ((ch === 0x3F/* ? */ || ch === 0x3A/* : */) && is_WS_OR_EOL(following)) {

      if (ch === 0x3F/* ? */) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }

        detected = true;
        atExplicitKey = true;
        allowCompact = true;

      } else if (atExplicitKey) {
        // i.e. 0x3A/* : */ === character after the explicit key.
        atExplicitKey = false;
        allowCompact = true;

      } else {
        throwError(state, 'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line');
      }

      state.position += 1;
      ch = following;

    //
    // Implicit notation case. Flow-style node as the key first, then ":", and the value.
    //
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;

      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        // Neither implicit nor explicit notation.
        // Reading is done. Go to the epilogue.
        break;
      }

      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);

        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        if (ch === 0x3A/* : */) {
          ch = state.input.charCodeAt(++state.position);

          if (!is_WS_OR_EOL(ch)) {
            throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
          }

          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }

          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;

        } else if (detected) {
          throwError(state, 'can not read an implicit mapping pair; a colon is missed');

        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true; // Keep the result of `composeNode`.
        }

      } else if (detected) {
        throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');

      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true; // Keep the result of `composeNode`.
      }
    }

    //
    // Common reading code for both explicit and implicit notations.
    //
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }

      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }

      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }

      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }

    if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
      throwError(state, 'bad indentation of a mapping entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  //
  // Epilogue.
  //

  // Special case: last mapping's node contains only the key in explicit notation.
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }

  // Expose the resulting mapping.
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'mapping';
    state.result = _result;
  }

  return detected;
}

function readTagProperty(state) {
  var _position,
      isVerbatim = false,
      isNamed    = false,
      tagHandle,
      tagName,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x21/* ! */) return false;

  if (state.tag !== null) {
    throwError(state, 'duplication of a tag property');
  }

  ch = state.input.charCodeAt(++state.position);

  if (ch === 0x3C/* < */) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);

  } else if (ch === 0x21/* ! */) {
    isNamed = true;
    tagHandle = '!!';
    ch = state.input.charCodeAt(++state.position);

  } else {
    tagHandle = '!';
  }

  _position = state.position;

  if (isVerbatim) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (ch !== 0 && ch !== 0x3E/* > */);

    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, 'unexpected end of the stream within a verbatim tag');
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {

      if (ch === 0x21/* ! */) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);

          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, 'named tag handle cannot contain such characters');
          }

          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, 'tag suffix cannot contain exclamation marks');
        }
      }

      ch = state.input.charCodeAt(++state.position);
    }

    tagName = state.input.slice(_position, state.position);

    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, 'tag suffix cannot contain flow indicator characters');
    }
  }

  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, 'tag name cannot contain such characters: ' + tagName);
  }

  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, 'tag name is malformed: ' + tagName);
  }

  if (isVerbatim) {
    state.tag = tagName;

  } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;

  } else if (tagHandle === '!') {
    state.tag = '!' + tagName;

  } else if (tagHandle === '!!') {
    state.tag = 'tag:yaml.org,2002:' + tagName;

  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }

  return true;
}

function readAnchorProperty(state) {
  var _position,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x26/* & */) return false;

  if (state.anchor !== null) {
    throwError(state, 'duplication of an anchor property');
  }

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an anchor node must contain at least one character');
  }

  state.anchor = state.input.slice(_position, state.position);
  return true;
}

function readAlias(state) {
  var _position, alias,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x2A/* * */) return false;

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an alias node must contain at least one character');
  }

  alias = state.input.slice(_position, state.position);

  if (!_hasOwnProperty.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }

  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}

function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles,
      allowBlockScalars,
      allowBlockCollections,
      indentStatus = 1, // 1: this>parent, 0: this=parent, -1: this<parent
      atNewLine  = false,
      hasContent = false,
      typeIndex,
      typeQuantity,
      typeList,
      type,
      flowIndent,
      blockIndent;

  if (state.listener !== null) {
    state.listener('open', state);
  }

  state.tag    = null;
  state.anchor = null;
  state.kind   = null;
  state.result = null;

  allowBlockStyles = allowBlockScalars = allowBlockCollections =
    CONTEXT_BLOCK_OUT === nodeContext ||
    CONTEXT_BLOCK_IN  === nodeContext;

  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;

      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }

  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;

        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }

  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }

  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }

    blockIndent = state.position - state.lineStart;

    if (indentStatus === 1) {
      if (allowBlockCollections &&
          (readBlockSequence(state, blockIndent) ||
           readBlockMapping(state, blockIndent, flowIndent)) ||
          readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
            readSingleQuotedScalar(state, flowIndent) ||
            readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;

        } else if (readAlias(state)) {
          hasContent = true;

          if (state.tag !== null || state.anchor !== null) {
            throwError(state, 'alias node should not have any properties');
          }

        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;

          if (state.tag === null) {
            state.tag = '?';
          }
        }

        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      // Special case: block sequences are allowed to have same indentation level as the parent.
      // http://www.yaml.org/spec/1.2/spec.html#id2799784
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }

  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }

  } else if (state.tag === '?') {
    // Implicit resolving is not allowed for non-scalar types, and '?'
    // non-specific tag is only automatically assigned to plain scalars.
    //
    // We only need to check kind conformity in case user explicitly assigns '?'
    // tag, for example like this: "!<?> [0]"
    //
    if (state.result !== null && state.kind !== 'scalar') {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }

    for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type = state.implicitTypes[typeIndex];

      if (type.resolve(state.result)) { // `state.result` updated in resolver if matched
        state.result = type.construct(state.result);
        state.tag = type.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== '!') {
    if (_hasOwnProperty.call(state.typeMap[state.kind || 'fallback'], state.tag)) {
      type = state.typeMap[state.kind || 'fallback'][state.tag];
    } else {
      // looking for multi type
      type = null;
      typeList = state.typeMap.multi[state.kind || 'fallback'];

      for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type = typeList[typeIndex];
          break;
        }
      }
    }

    if (!type) {
      throwError(state, 'unknown tag !<' + state.tag + '>');
    }

    if (state.result !== null && type.kind !== state.kind) {
      throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
    }

    if (!type.resolve(state.result, state.tag)) { // `state.result` updated in resolver if matched
      throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
    } else {
      state.result = type.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }

  if (state.listener !== null) {
    state.listener('close', state);
  }
  return state.tag !== null ||  state.anchor !== null || hasContent;
}

function readDocument(state) {
  var documentStart = state.position,
      _position,
      directiveName,
      directiveArgs,
      hasDirectives = false,
      ch;

  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = Object.create(null);
  state.anchorMap = Object.create(null);

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if (state.lineIndent > 0 || ch !== 0x25/* % */) {
      break;
    }

    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];

    if (directiveName.length < 1) {
      throwError(state, 'directive name must not be less than one character in length');
    }

    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      if (ch === 0x23/* # */) {
        do { ch = state.input.charCodeAt(++state.position); }
        while (ch !== 0 && !is_EOL(ch));
        break;
      }

      if (is_EOL(ch)) break;

      _position = state.position;

      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      directiveArgs.push(state.input.slice(_position, state.position));
    }

    if (ch !== 0) readLineBreak(state);

    if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }

  skipSeparationSpace(state, true, -1);

  if (state.lineIndent === 0 &&
      state.input.charCodeAt(state.position)     === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 1) === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 2) === 0x2D/* - */) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);

  } else if (hasDirectives) {
    throwError(state, 'directives end mark is expected');
  }

  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);

  if (state.checkLineBreaks &&
      PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, 'non-ASCII line breaks are interpreted as content');
  }

  state.documents.push(state.result);

  if (state.position === state.lineStart && testDocumentSeparator(state)) {

    if (state.input.charCodeAt(state.position) === 0x2E/* . */) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }

  if (state.position < (state.length - 1)) {
    throwError(state, 'end of the stream or a document separator is expected');
  } else {
    return;
  }
}


function loadDocuments(input, options) {
  input = String(input);
  options = options || {};

  if (input.length !== 0) {

    // Add tailing `\n` if not exists
    if (input.charCodeAt(input.length - 1) !== 0x0A/* LF */ &&
        input.charCodeAt(input.length - 1) !== 0x0D/* CR */) {
      input += '\n';
    }

    // Strip BOM
    if (input.charCodeAt(0) === 0xFEFF) {
      input = input.slice(1);
    }
  }

  var state = new State(input, options);

  var nullpos = input.indexOf('\0');

  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, 'null byte is not allowed in input');
  }

  // Use 0 as string terminator. That significantly simplifies bounds check.
  state.input += '\0';

  while (state.input.charCodeAt(state.position) === 0x20/* Space */) {
    state.lineIndent += 1;
    state.position += 1;
  }

  while (state.position < (state.length - 1)) {
    readDocument(state);
  }

  return state.documents;
}


function loadAll(input, iterator, options) {
  if (iterator !== null && typeof iterator === 'object' && typeof options === 'undefined') {
    options = iterator;
    iterator = null;
  }

  var documents = loadDocuments(input, options);

  if (typeof iterator !== 'function') {
    return documents;
  }

  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}


function load(input, options) {
  var documents = loadDocuments(input, options);

  if (documents.length === 0) {
    /*eslint-disable no-undefined*/
    return undefined;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new YAMLException('expected a single document in the stream, but found more');
}


module.exports.loadAll = loadAll;
module.exports.load    = load;


/***/ }),

/***/ 5771:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/*eslint-disable max-len*/

var YAMLException = __webpack_require__(8689);
var Type          = __webpack_require__(8954);


function compileList(schema, name) {
  var result = [];

  schema[name].forEach(function (currentType) {
    var newIndex = result.length;

    result.forEach(function (previousType, previousIndex) {
      if (previousType.tag === currentType.tag &&
          previousType.kind === currentType.kind &&
          previousType.multi === currentType.multi) {

        newIndex = previousIndex;
      }
    });

    result[newIndex] = currentType;
  });

  return result;
}


function compileMap(/* lists... */) {
  var result = {
        scalar: {},
        sequence: {},
        mapping: {},
        fallback: {},
        multi: {
          scalar: [],
          sequence: [],
          mapping: [],
          fallback: []
        }
      }, index, length;

  function collectType(type) {
    if (type.multi) {
      result.multi[type.kind].push(type);
      result.multi['fallback'].push(type);
    } else {
      result[type.kind][type.tag] = result['fallback'][type.tag] = type;
    }
  }

  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}


function Schema(definition) {
  return this.extend(definition);
}


Schema.prototype.extend = function extend(definition) {
  var implicit = [];
  var explicit = [];

  if (definition instanceof Type) {
    // Schema.extend(type)
    explicit.push(definition);

  } else if (Array.isArray(definition)) {
    // Schema.extend([ type1, type2, ... ])
    explicit = explicit.concat(definition);

  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    // Schema.extend({ explicit: [ type1, type2, ... ], implicit: [ type1, type2, ... ] })
    if (definition.implicit) implicit = implicit.concat(definition.implicit);
    if (definition.explicit) explicit = explicit.concat(definition.explicit);

  } else {
    throw new YAMLException('Schema.extend argument should be a Type, [ Type ], ' +
      'or a schema definition ({ implicit: [...], explicit: [...] })');
  }

  implicit.forEach(function (type) {
    if (!(type instanceof Type)) {
      throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }

    if (type.loadKind && type.loadKind !== 'scalar') {
      throw new YAMLException('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
    }

    if (type.multi) {
      throw new YAMLException('There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.');
    }
  });

  explicit.forEach(function (type) {
    if (!(type instanceof Type)) {
      throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }
  });

  var result = Object.create(Schema.prototype);

  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);

  result.compiledImplicit = compileList(result, 'implicit');
  result.compiledExplicit = compileList(result, 'explicit');
  result.compiledTypeMap  = compileMap(result.compiledImplicit, result.compiledExplicit);

  return result;
};


module.exports = Schema;


/***/ }),

/***/ 2230:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// Standard YAML's Core schema.
// http://www.yaml.org/spec/1.2/spec.html#id2804923
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, Core schema has no distinctions from JSON schema is JS-YAML.





module.exports = __webpack_require__(7505);


/***/ }),

/***/ 215:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// JS-YAML's default schema for `safeLoad` function.
// It is not described in the YAML specification.
//
// This schema is based on standard YAML's Core schema and includes most of
// extra types described at YAML tag repository. (http://yaml.org/type/)





module.exports = (__webpack_require__(2230).extend)({
  implicit: [
    __webpack_require__(8436),
    __webpack_require__(3021)
  ],
  explicit: [
    __webpack_require__(9054),
    __webpack_require__(7668),
    __webpack_require__(7268),
    __webpack_require__(9784)
  ]
});


/***/ }),

/***/ 6126:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// Standard YAML's Failsafe schema.
// http://www.yaml.org/spec/1.2/spec.html#id2802346





var Schema = __webpack_require__(5771);


module.exports = new Schema({
  explicit: [
    __webpack_require__(1002),
    __webpack_require__(8394),
    __webpack_require__(1021)
  ]
});


/***/ }),

/***/ 7505:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// Standard YAML's JSON schema.
// http://www.yaml.org/spec/1.2/spec.html#id2803231
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, this schema is not such strict as defined in the YAML specification.
// It allows numbers in binary notaion, use `Null` and `NULL` as `null`, etc.





module.exports = (__webpack_require__(6126).extend)({
  implicit: [
    __webpack_require__(4716),
    __webpack_require__(8568),
    __webpack_require__(391),
    __webpack_require__(9685)
  ]
});


/***/ }),

/***/ 901:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";



var common = __webpack_require__(1052);


// get snippet for a single line, respecting maxLength
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = '';
  var tail = '';
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;

  if (position - lineStart > maxHalfLength) {
    head = ' ... ';
    lineStart = position - maxHalfLength + head.length;
  }

  if (lineEnd - position > maxHalfLength) {
    tail = ' ...';
    lineEnd = position + maxHalfLength - tail.length;
  }

  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, '→') + tail,
    pos: position - lineStart + head.length // relative position
  };
}


function padStart(string, max) {
  return common.repeat(' ', max - string.length) + string;
}


function makeSnippet(mark, options) {
  options = Object.create(options || null);

  if (!mark.buffer) return null;

  if (!options.maxLength) options.maxLength = 79;
  if (typeof options.indent      !== 'number') options.indent      = 1;
  if (typeof options.linesBefore !== 'number') options.linesBefore = 3;
  if (typeof options.linesAfter  !== 'number') options.linesAfter  = 2;

  var re = /\r?\n|\r|\0/g;
  var lineStarts = [ 0 ];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;

  while ((match = re.exec(mark.buffer))) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);

    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }

  if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;

  var result = '', i, line;
  var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);

  for (i = 1; i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo - i],
      lineEnds[foundLineNo - i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
      maxLineLength
    );
    result = common.repeat(' ', options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) +
      ' | ' + line.str + '\n' + result;
  }

  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common.repeat(' ', options.indent) + padStart((mark.line + 1).toString(), lineNoLength) +
    ' | ' + line.str + '\n';
  result += common.repeat('-', options.indent + lineNoLength + 3 + line.pos) + '^' + '\n';

  for (i = 1; i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo + i],
      lineEnds[foundLineNo + i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
      maxLineLength
    );
    result += common.repeat(' ', options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) +
      ' | ' + line.str + '\n';
  }

  return result.replace(/\n$/, '');
}


module.exports = makeSnippet;


/***/ }),

/***/ 8954:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var YAMLException = __webpack_require__(8689);

var TYPE_CONSTRUCTOR_OPTIONS = [
  'kind',
  'multi',
  'resolve',
  'construct',
  'instanceOf',
  'predicate',
  'represent',
  'representName',
  'defaultStyle',
  'styleAliases'
];

var YAML_NODE_KINDS = [
  'scalar',
  'sequence',
  'mapping'
];

function compileStyleAliases(map) {
  var result = {};

  if (map !== null) {
    Object.keys(map).forEach(function (style) {
      map[style].forEach(function (alias) {
        result[String(alias)] = style;
      });
    });
  }

  return result;
}

function Type(tag, options) {
  options = options || {};

  Object.keys(options).forEach(function (name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new YAMLException('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });

  // TODO: Add tag format check.
  this.options       = options; // keep original options in case user wants to extend this type later
  this.tag           = tag;
  this.kind          = options['kind']          || null;
  this.resolve       = options['resolve']       || function () { return true; };
  this.construct     = options['construct']     || function (data) { return data; };
  this.instanceOf    = options['instanceOf']    || null;
  this.predicate     = options['predicate']     || null;
  this.represent     = options['represent']     || null;
  this.representName = options['representName'] || null;
  this.defaultStyle  = options['defaultStyle']  || null;
  this.multi         = options['multi']         || false;
  this.styleAliases  = compileStyleAliases(options['styleAliases'] || null);

  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new YAMLException('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}

module.exports = Type;


/***/ }),

/***/ 9054:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/*eslint-disable no-bitwise*/


var Type = __webpack_require__(8954);


// [ 64, 65, 66 ] -> [ padding, CR, LF ]
var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';


function resolveYamlBinary(data) {
  if (data === null) return false;

  var code, idx, bitlen = 0, max = data.length, map = BASE64_MAP;

  // Convert one by one.
  for (idx = 0; idx < max; idx++) {
    code = map.indexOf(data.charAt(idx));

    // Skip CR/LF
    if (code > 64) continue;

    // Fail on illegal characters
    if (code < 0) return false;

    bitlen += 6;
  }

  // If there are any bits left, source was corrupted
  return (bitlen % 8) === 0;
}

function constructYamlBinary(data) {
  var idx, tailbits,
      input = data.replace(/[\r\n=]/g, ''), // remove CR/LF & padding to simplify scan
      max = input.length,
      map = BASE64_MAP,
      bits = 0,
      result = [];

  // Collect by 6*4 bits (3 bytes)

  for (idx = 0; idx < max; idx++) {
    if ((idx % 4 === 0) && idx) {
      result.push((bits >> 16) & 0xFF);
      result.push((bits >> 8) & 0xFF);
      result.push(bits & 0xFF);
    }

    bits = (bits << 6) | map.indexOf(input.charAt(idx));
  }

  // Dump tail

  tailbits = (max % 4) * 6;

  if (tailbits === 0) {
    result.push((bits >> 16) & 0xFF);
    result.push((bits >> 8) & 0xFF);
    result.push(bits & 0xFF);
  } else if (tailbits === 18) {
    result.push((bits >> 10) & 0xFF);
    result.push((bits >> 2) & 0xFF);
  } else if (tailbits === 12) {
    result.push((bits >> 4) & 0xFF);
  }

  return new Uint8Array(result);
}

function representYamlBinary(object /*, style*/) {
  var result = '', bits = 0, idx, tail,
      max = object.length,
      map = BASE64_MAP;

  // Convert every three bytes to 4 ASCII characters.

  for (idx = 0; idx < max; idx++) {
    if ((idx % 3 === 0) && idx) {
      result += map[(bits >> 18) & 0x3F];
      result += map[(bits >> 12) & 0x3F];
      result += map[(bits >> 6) & 0x3F];
      result += map[bits & 0x3F];
    }

    bits = (bits << 8) + object[idx];
  }

  // Dump tail

  tail = max % 3;

  if (tail === 0) {
    result += map[(bits >> 18) & 0x3F];
    result += map[(bits >> 12) & 0x3F];
    result += map[(bits >> 6) & 0x3F];
    result += map[bits & 0x3F];
  } else if (tail === 2) {
    result += map[(bits >> 10) & 0x3F];
    result += map[(bits >> 4) & 0x3F];
    result += map[(bits << 2) & 0x3F];
    result += map[64];
  } else if (tail === 1) {
    result += map[(bits >> 2) & 0x3F];
    result += map[(bits << 4) & 0x3F];
    result += map[64];
    result += map[64];
  }

  return result;
}

function isBinary(obj) {
  return Object.prototype.toString.call(obj) ===  '[object Uint8Array]';
}

module.exports = new Type('tag:yaml.org,2002:binary', {
  kind: 'scalar',
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});


/***/ }),

/***/ 8568:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(8954);

function resolveYamlBoolean(data) {
  if (data === null) return false;

  var max = data.length;

  return (max === 4 && (data === 'true' || data === 'True' || data === 'TRUE')) ||
         (max === 5 && (data === 'false' || data === 'False' || data === 'FALSE'));
}

function constructYamlBoolean(data) {
  return data === 'true' ||
         data === 'True' ||
         data === 'TRUE';
}

function isBoolean(object) {
  return Object.prototype.toString.call(object) === '[object Boolean]';
}

module.exports = new Type('tag:yaml.org,2002:bool', {
  kind: 'scalar',
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function (object) { return object ? 'true' : 'false'; },
    uppercase: function (object) { return object ? 'TRUE' : 'FALSE'; },
    camelcase: function (object) { return object ? 'True' : 'False'; }
  },
  defaultStyle: 'lowercase'
});


/***/ }),

/***/ 9685:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var common = __webpack_require__(1052);
var Type   = __webpack_require__(8954);

var YAML_FLOAT_PATTERN = new RegExp(
  // 2.5e4, 2.5 and integers
  '^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?' +
  // .2e4, .2
  // special case, seems not from spec
  '|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?' +
  // .inf
  '|[-+]?\\.(?:inf|Inf|INF)' +
  // .nan
  '|\\.(?:nan|NaN|NAN))$');

function resolveYamlFloat(data) {
  if (data === null) return false;

  if (!YAML_FLOAT_PATTERN.test(data) ||
      // Quick hack to not allow integers end with `_`
      // Probably should update regexp & check speed
      data[data.length - 1] === '_') {
    return false;
  }

  return true;
}

function constructYamlFloat(data) {
  var value, sign;

  value  = data.replace(/_/g, '').toLowerCase();
  sign   = value[0] === '-' ? -1 : 1;

  if ('+-'.indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }

  if (value === '.inf') {
    return (sign === 1) ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

  } else if (value === '.nan') {
    return NaN;
  }
  return sign * parseFloat(value, 10);
}


var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;

function representYamlFloat(object, style) {
  var res;

  if (isNaN(object)) {
    switch (style) {
      case 'lowercase': return '.nan';
      case 'uppercase': return '.NAN';
      case 'camelcase': return '.NaN';
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '.inf';
      case 'uppercase': return '.INF';
      case 'camelcase': return '.Inf';
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '-.inf';
      case 'uppercase': return '-.INF';
      case 'camelcase': return '-.Inf';
    }
  } else if (common.isNegativeZero(object)) {
    return '-0.0';
  }

  res = object.toString(10);

  // JS stringifier can build scientific format without dots: 5e-100,
  // while YAML requres dot: 5.e-100. Fix it with simple hack

  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
}

function isFloat(object) {
  return (Object.prototype.toString.call(object) === '[object Number]') &&
         (object % 1 !== 0 || common.isNegativeZero(object));
}

module.exports = new Type('tag:yaml.org,2002:float', {
  kind: 'scalar',
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: 'lowercase'
});


/***/ }),

/***/ 391:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var common = __webpack_require__(1052);
var Type   = __webpack_require__(8954);

function isHexCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) ||
         ((0x41/* A */ <= c) && (c <= 0x46/* F */)) ||
         ((0x61/* a */ <= c) && (c <= 0x66/* f */));
}

function isOctCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x37/* 7 */));
}

function isDecCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */));
}

function resolveYamlInteger(data) {
  if (data === null) return false;

  var max = data.length,
      index = 0,
      hasDigits = false,
      ch;

  if (!max) return false;

  ch = data[index];

  // sign
  if (ch === '-' || ch === '+') {
    ch = data[++index];
  }

  if (ch === '0') {
    // 0
    if (index + 1 === max) return true;
    ch = data[++index];

    // base 2, base 8, base 16

    if (ch === 'b') {
      // base 2
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (ch !== '0' && ch !== '1') return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }


    if (ch === 'x') {
      // base 16
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }


    if (ch === 'o') {
      // base 8
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isOctCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }
  }

  // base 10 (except 0)

  // value should not start with `_`;
  if (ch === '_') return false;

  for (; index < max; index++) {
    ch = data[index];
    if (ch === '_') continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }

  // Should have digits and should not end with `_`
  if (!hasDigits || ch === '_') return false;

  return true;
}

function constructYamlInteger(data) {
  var value = data, sign = 1, ch;

  if (value.indexOf('_') !== -1) {
    value = value.replace(/_/g, '');
  }

  ch = value[0];

  if (ch === '-' || ch === '+') {
    if (ch === '-') sign = -1;
    value = value.slice(1);
    ch = value[0];
  }

  if (value === '0') return 0;

  if (ch === '0') {
    if (value[1] === 'b') return sign * parseInt(value.slice(2), 2);
    if (value[1] === 'x') return sign * parseInt(value.slice(2), 16);
    if (value[1] === 'o') return sign * parseInt(value.slice(2), 8);
  }

  return sign * parseInt(value, 10);
}

function isInteger(object) {
  return (Object.prototype.toString.call(object)) === '[object Number]' &&
         (object % 1 === 0 && !common.isNegativeZero(object));
}

module.exports = new Type('tag:yaml.org,2002:int', {
  kind: 'scalar',
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary:      function (obj) { return obj >= 0 ? '0b' + obj.toString(2) : '-0b' + obj.toString(2).slice(1); },
    octal:       function (obj) { return obj >= 0 ? '0o'  + obj.toString(8) : '-0o'  + obj.toString(8).slice(1); },
    decimal:     function (obj) { return obj.toString(10); },
    /* eslint-disable max-len */
    hexadecimal: function (obj) { return obj >= 0 ? '0x' + obj.toString(16).toUpperCase() :  '-0x' + obj.toString(16).toUpperCase().slice(1); }
  },
  defaultStyle: 'decimal',
  styleAliases: {
    binary:      [ 2,  'bin' ],
    octal:       [ 8,  'oct' ],
    decimal:     [ 10, 'dec' ],
    hexadecimal: [ 16, 'hex' ]
  }
});


/***/ }),

/***/ 1021:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(8954);

module.exports = new Type('tag:yaml.org,2002:map', {
  kind: 'mapping',
  construct: function (data) { return data !== null ? data : {}; }
});


/***/ }),

/***/ 3021:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(8954);

function resolveYamlMerge(data) {
  return data === '<<' || data === null;
}

module.exports = new Type('tag:yaml.org,2002:merge', {
  kind: 'scalar',
  resolve: resolveYamlMerge
});


/***/ }),

/***/ 4716:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(8954);

function resolveYamlNull(data) {
  if (data === null) return true;

  var max = data.length;

  return (max === 1 && data === '~') ||
         (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'));
}

function constructYamlNull() {
  return null;
}

function isNull(object) {
  return object === null;
}

module.exports = new Type('tag:yaml.org,2002:null', {
  kind: 'scalar',
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function () { return '~';    },
    lowercase: function () { return 'null'; },
    uppercase: function () { return 'NULL'; },
    camelcase: function () { return 'Null'; },
    empty:     function () { return '';     }
  },
  defaultStyle: 'lowercase'
});


/***/ }),

/***/ 7668:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(8954);

var _hasOwnProperty = Object.prototype.hasOwnProperty;
var _toString       = Object.prototype.toString;

function resolveYamlOmap(data) {
  if (data === null) return true;

  var objectKeys = [], index, length, pair, pairKey, pairHasKey,
      object = data;

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;

    if (_toString.call(pair) !== '[object Object]') return false;

    for (pairKey in pair) {
      if (_hasOwnProperty.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;
        else return false;
      }
    }

    if (!pairHasKey) return false;

    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
    else return false;
  }

  return true;
}

function constructYamlOmap(data) {
  return data !== null ? data : [];
}

module.exports = new Type('tag:yaml.org,2002:omap', {
  kind: 'sequence',
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});


/***/ }),

/***/ 7268:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(8954);

var _toString = Object.prototype.toString;

function resolveYamlPairs(data) {
  if (data === null) return true;

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    if (_toString.call(pair) !== '[object Object]') return false;

    keys = Object.keys(pair);

    if (keys.length !== 1) return false;

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return true;
}

function constructYamlPairs(data) {
  if (data === null) return [];

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    keys = Object.keys(pair);

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return result;
}

module.exports = new Type('tag:yaml.org,2002:pairs', {
  kind: 'sequence',
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});


/***/ }),

/***/ 8394:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(8954);

module.exports = new Type('tag:yaml.org,2002:seq', {
  kind: 'sequence',
  construct: function (data) { return data !== null ? data : []; }
});


/***/ }),

/***/ 9784:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(8954);

var _hasOwnProperty = Object.prototype.hasOwnProperty;

function resolveYamlSet(data) {
  if (data === null) return true;

  var key, object = data;

  for (key in object) {
    if (_hasOwnProperty.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }

  return true;
}

function constructYamlSet(data) {
  return data !== null ? data : {};
}

module.exports = new Type('tag:yaml.org,2002:set', {
  kind: 'mapping',
  resolve: resolveYamlSet,
  construct: constructYamlSet
});


/***/ }),

/***/ 1002:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(8954);

module.exports = new Type('tag:yaml.org,2002:str', {
  kind: 'scalar',
  construct: function (data) { return data !== null ? data : ''; }
});


/***/ }),

/***/ 8436:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(8954);

var YAML_DATE_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9])'                    + // [2] month
  '-([0-9][0-9])$');                   // [3] day

var YAML_TIMESTAMP_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9]?)'                   + // [2] month
  '-([0-9][0-9]?)'                   + // [3] day
  '(?:[Tt]|[ \\t]+)'                 + // ...
  '([0-9][0-9]?)'                    + // [4] hour
  ':([0-9][0-9])'                    + // [5] minute
  ':([0-9][0-9])'                    + // [6] second
  '(?:\\.([0-9]*))?'                 + // [7] fraction
  '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
  '(?::([0-9][0-9]))?))?$');           // [11] tz_minute

function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}

function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0,
      delta = null, tz_hour, tz_minute, date;

  match = YAML_DATE_REGEXP.exec(data);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);

  if (match === null) throw new Error('Date resolve error');

  // match: [1] year [2] month [3] day

  year = +(match[1]);
  month = +(match[2]) - 1; // JS month starts with 0
  day = +(match[3]);

  if (!match[4]) { // no hour
    return new Date(Date.UTC(year, month, day));
  }

  // match: [4] hour [5] minute [6] second [7] fraction

  hour = +(match[4]);
  minute = +(match[5]);
  second = +(match[6]);

  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) { // milli-seconds
      fraction += '0';
    }
    fraction = +fraction;
  }

  // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute

  if (match[9]) {
    tz_hour = +(match[10]);
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds
    if (match[9] === '-') delta = -delta;
  }

  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));

  if (delta) date.setTime(date.getTime() - delta);

  return date;
}

function representYamlTimestamp(object /*, style*/) {
  return object.toISOString();
}

module.exports = new Type('tag:yaml.org,2002:timestamp', {
  kind: 'scalar',
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});


/***/ }),

/***/ 5325:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      XSD = 'http://www.w3.org/2001/XMLSchema#',
      SWAP = 'http://www.w3.org/2000/10/swap/';
var _default = {
  xsd: {
    decimal: `${XSD}decimal`,
    boolean: `${XSD}boolean`,
    double: `${XSD}double`,
    integer: `${XSD}integer`,
    string: `${XSD}string`
  },
  rdf: {
    type: `${RDF}type`,
    nil: `${RDF}nil`,
    first: `${RDF}first`,
    rest: `${RDF}rest`,
    langString: `${RDF}langString`
  },
  owl: {
    sameAs: 'http://www.w3.org/2002/07/owl#sameAs'
  },
  r: {
    forSome: `${SWAP}reify#forSome`,
    forAll: `${SWAP}reify#forAll`
  },
  log: {
    implies: `${SWAP}log#implies`
  }
};
exports["default"] = _default;

/***/ }),

/***/ 713:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = exports.Variable = exports.Triple = exports.Term = exports.Quad = exports.NamedNode = exports.Literal = exports.DefaultGraph = exports.BlankNode = void 0;
exports.escapeQuotes = escapeQuotes;
exports.termFromId = termFromId;
exports.termToId = termToId;
exports.unescapeQuotes = unescapeQuotes;

var _IRIs = _interopRequireDefault(__webpack_require__(5325));

var _N3Util = __webpack_require__(7141);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// N3.js implementations of the RDF/JS core data types
// See https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md
const {
  rdf,
  xsd
} = _IRIs.default; // eslint-disable-next-line prefer-const

let DEFAULTGRAPH;
let _blankNodeCounter = 0;
const escapedLiteral = /^"(.*".*)(?="[^"]*$)/;
const quadId = /^<<("(?:""|[^"])*"[^ ]*|[^ ]+) ("(?:""|[^"])*"[^ ]*|[^ ]+) ("(?:""|[^"])*"[^ ]*|[^ ]+) ?("(?:""|[^"])*"[^ ]*|[^ ]+)?>>$/; // ## DataFactory singleton

const DataFactory = {
  namedNode,
  blankNode,
  variable,
  literal,
  defaultGraph,
  quad,
  triple: quad
};
var _default = DataFactory; // ## Term constructor

exports["default"] = _default;

class Term {
  constructor(id) {
    this.id = id;
  } // ### The value of this term


  get value() {
    return this.id;
  } // ### Returns whether this object represents the same term as the other


  equals(other) {
    // If both terms were created by this library,
    // equality can be computed through ids
    if (other instanceof Term) return this.id === other.id; // Otherwise, compare term type and value

    return !!other && this.termType === other.termType && this.value === other.value;
  } // ### Implement hashCode for Immutable.js, since we implement `equals`
  // https://immutable-js.com/docs/v4.0.0/ValueObject/#hashCode()


  hashCode() {
    return 0;
  } // ### Returns a plain object representation of this term


  toJSON() {
    return {
      termType: this.termType,
      value: this.value
    };
  }

} // ## NamedNode constructor


exports.Term = Term;

class NamedNode extends Term {
  // ### The term type of this term
  get termType() {
    return 'NamedNode';
  }

} // ## Literal constructor


exports.NamedNode = NamedNode;

class Literal extends Term {
  // ### The term type of this term
  get termType() {
    return 'Literal';
  } // ### The text value of this literal


  get value() {
    return this.id.substring(1, this.id.lastIndexOf('"'));
  } // ### The language of this literal


  get language() {
    // Find the last quotation mark (e.g., '"abc"@en-us')
    const id = this.id;
    let atPos = id.lastIndexOf('"') + 1; // If "@" it follows, return the remaining substring; empty otherwise

    return atPos < id.length && id[atPos++] === '@' ? id.substr(atPos).toLowerCase() : '';
  } // ### The datatype IRI of this literal


  get datatype() {
    return new NamedNode(this.datatypeString);
  } // ### The datatype string of this literal


  get datatypeString() {
    // Find the last quotation mark (e.g., '"abc"^^http://ex.org/types#t')
    const id = this.id,
          dtPos = id.lastIndexOf('"') + 1;
    const char = dtPos < id.length ? id[dtPos] : ''; // If "^" it follows, return the remaining substring

    return char === '^' ? id.substr(dtPos + 2) : // If "@" follows, return rdf:langString; xsd:string otherwise
    char !== '@' ? xsd.string : rdf.langString;
  } // ### Returns whether this object represents the same term as the other


  equals(other) {
    // If both literals were created by this library,
    // equality can be computed through ids
    if (other instanceof Literal) return this.id === other.id; // Otherwise, compare term type, value, language, and datatype

    return !!other && !!other.datatype && this.termType === other.termType && this.value === other.value && this.language === other.language && this.datatype.value === other.datatype.value;
  }

  toJSON() {
    return {
      termType: this.termType,
      value: this.value,
      language: this.language,
      datatype: {
        termType: 'NamedNode',
        value: this.datatypeString
      }
    };
  }

} // ## BlankNode constructor


exports.Literal = Literal;

class BlankNode extends Term {
  constructor(name) {
    super(`_:${name}`);
  } // ### The term type of this term


  get termType() {
    return 'BlankNode';
  } // ### The name of this blank node


  get value() {
    return this.id.substr(2);
  }

}

exports.BlankNode = BlankNode;

class Variable extends Term {
  constructor(name) {
    super(`?${name}`);
  } // ### The term type of this term


  get termType() {
    return 'Variable';
  } // ### The name of this variable


  get value() {
    return this.id.substr(1);
  }

} // ## DefaultGraph constructor


exports.Variable = Variable;

class DefaultGraph extends Term {
  constructor() {
    super('');
    return DEFAULTGRAPH || this;
  } // ### The term type of this term


  get termType() {
    return 'DefaultGraph';
  } // ### Returns whether this object represents the same term as the other


  equals(other) {
    // If both terms were created by this library,
    // equality can be computed through strict equality;
    // otherwise, compare term types.
    return this === other || !!other && this.termType === other.termType;
  }

} // ## DefaultGraph singleton


exports.DefaultGraph = DefaultGraph;
DEFAULTGRAPH = new DefaultGraph(); // ### Constructs a term from the given internal string ID

function termFromId(id, factory) {
  factory = factory || DataFactory; // Falsy value or empty string indicate the default graph

  if (!id) return factory.defaultGraph(); // Identify the term type based on the first character

  switch (id[0]) {
    case '?':
      return factory.variable(id.substr(1));

    case '_':
      return factory.blankNode(id.substr(2));

    case '"':
      // Shortcut for internal literals
      if (factory === DataFactory) return new Literal(id); // Literal without datatype or language

      if (id[id.length - 1] === '"') return factory.literal(id.substr(1, id.length - 2)); // Literal with datatype or language

      const endPos = id.lastIndexOf('"', id.length - 1);
      return factory.literal(id.substr(1, endPos - 1), id[endPos + 1] === '@' ? id.substr(endPos + 2) : factory.namedNode(id.substr(endPos + 3)));

    case '<':
      const components = quadId.exec(id);
      return factory.quad(termFromId(unescapeQuotes(components[1]), factory), termFromId(unescapeQuotes(components[2]), factory), termFromId(unescapeQuotes(components[3]), factory), components[4] && termFromId(unescapeQuotes(components[4]), factory));

    default:
      return factory.namedNode(id);
  }
} // ### Constructs an internal string ID from the given term or ID string


function termToId(term) {
  if (typeof term === 'string') return term;
  if (term instanceof Term && term.termType !== 'Quad') return term.id;
  if (!term) return DEFAULTGRAPH.id; // Term instantiated with another library

  switch (term.termType) {
    case 'NamedNode':
      return term.value;

    case 'BlankNode':
      return `_:${term.value}`;

    case 'Variable':
      return `?${term.value}`;

    case 'DefaultGraph':
      return '';

    case 'Literal':
      return `"${term.value}"${term.language ? `@${term.language}` : term.datatype && term.datatype.value !== xsd.string ? `^^${term.datatype.value}` : ''}`;

    case 'Quad':
      // To identify RDF* quad components, we escape quotes by doubling them.
      // This avoids the overhead of backslash parsing of Turtle-like syntaxes.
      return `<<${escapeQuotes(termToId(term.subject))} ${escapeQuotes(termToId(term.predicate))} ${escapeQuotes(termToId(term.object))}${(0, _N3Util.isDefaultGraph)(term.graph) ? '' : ` ${termToId(term.graph)}`}>>`;

    default:
      throw new Error(`Unexpected termType: ${term.termType}`);
  }
} // ## Quad constructor


class Quad extends Term {
  constructor(subject, predicate, object, graph) {
    super('');
    this._subject = subject;
    this._predicate = predicate;
    this._object = object;
    this._graph = graph || DEFAULTGRAPH;
  } // ### The term type of this term


  get termType() {
    return 'Quad';
  }

  get subject() {
    return this._subject;
  }

  get predicate() {
    return this._predicate;
  }

  get object() {
    return this._object;
  }

  get graph() {
    return this._graph;
  } // ### Returns a plain object representation of this quad


  toJSON() {
    return {
      termType: this.termType,
      subject: this._subject.toJSON(),
      predicate: this._predicate.toJSON(),
      object: this._object.toJSON(),
      graph: this._graph.toJSON()
    };
  } // ### Returns whether this object represents the same quad as the other


  equals(other) {
    return !!other && this._subject.equals(other.subject) && this._predicate.equals(other.predicate) && this._object.equals(other.object) && this._graph.equals(other.graph);
  }

}

exports.Triple = exports.Quad = Quad;

// ### Escapes the quotes within the given literal
function escapeQuotes(id) {
  return id.replace(escapedLiteral, (_, quoted) => `"${quoted.replace(/"/g, '""')}`);
} // ### Unescapes the quotes within the given literal


function unescapeQuotes(id) {
  return id.replace(escapedLiteral, (_, quoted) => `"${quoted.replace(/""/g, '"')}`);
} // ### Creates an IRI


function namedNode(iri) {
  return new NamedNode(iri);
} // ### Creates a blank node


function blankNode(name) {
  return new BlankNode(name || `n3-${_blankNodeCounter++}`);
} // ### Creates a literal


function literal(value, languageOrDataType) {
  // Create a language-tagged string
  if (typeof languageOrDataType === 'string') return new Literal(`"${value}"@${languageOrDataType.toLowerCase()}`); // Automatically determine datatype for booleans and numbers

  let datatype = languageOrDataType ? languageOrDataType.value : '';

  if (datatype === '') {
    // Convert a boolean
    if (typeof value === 'boolean') datatype = xsd.boolean; // Convert an integer or double
    else if (typeof value === 'number') {
      if (Number.isFinite(value)) datatype = Number.isInteger(value) ? xsd.integer : xsd.double;else {
        datatype = xsd.double;
        if (!Number.isNaN(value)) value = value > 0 ? 'INF' : '-INF';
      }
    }
  } // Create a datatyped literal


  return datatype === '' || datatype === xsd.string ? new Literal(`"${value}"`) : new Literal(`"${value}"^^${datatype}`);
} // ### Creates a variable


function variable(name) {
  return new Variable(name);
} // ### Returns the default graph


function defaultGraph() {
  return DEFAULTGRAPH;
} // ### Creates a quad


function quad(subject, predicate, object, graph) {
  return new Quad(subject, predicate, object, graph);
}

/***/ }),

/***/ 7141:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.inDefaultGraph = inDefaultGraph;
exports.isBlankNode = isBlankNode;
exports.isDefaultGraph = isDefaultGraph;
exports.isLiteral = isLiteral;
exports.isNamedNode = isNamedNode;
exports.isVariable = isVariable;
exports.prefix = prefix;
exports.prefixes = prefixes;

var _N3DataFactory = _interopRequireDefault(__webpack_require__(713));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// **N3Util** provides N3 utility functions.
// Tests whether the given term represents an IRI
function isNamedNode(term) {
  return !!term && term.termType === 'NamedNode';
} // Tests whether the given term represents a blank node


function isBlankNode(term) {
  return !!term && term.termType === 'BlankNode';
} // Tests whether the given term represents a literal


function isLiteral(term) {
  return !!term && term.termType === 'Literal';
} // Tests whether the given term represents a variable


function isVariable(term) {
  return !!term && term.termType === 'Variable';
} // Tests whether the given term represents the default graph


function isDefaultGraph(term) {
  return !!term && term.termType === 'DefaultGraph';
} // Tests whether the given quad is in the default graph


function inDefaultGraph(quad) {
  return isDefaultGraph(quad.graph);
} // Creates a function that prepends the given IRI to a local name


function prefix(iri, factory) {
  return prefixes({
    '': iri.value || iri
  }, factory)('');
} // Creates a function that allows registering and expanding prefixes


function prefixes(defaultPrefixes, factory) {
  // Add all of the default prefixes
  const prefixes = Object.create(null);

  for (const prefix in defaultPrefixes) processPrefix(prefix, defaultPrefixes[prefix]); // Set the default factory if none was specified


  factory = factory || _N3DataFactory.default; // Registers a new prefix (if an IRI was specified)
  // or retrieves a function that expands an existing prefix (if no IRI was specified)

  function processPrefix(prefix, iri) {
    // Create a new prefix if an IRI is specified or the prefix doesn't exist
    if (typeof iri === 'string') {
      // Create a function that expands the prefix
      const cache = Object.create(null);

      prefixes[prefix] = local => {
        return cache[local] || (cache[local] = factory.namedNode(iri + local));
      };
    } else if (!(prefix in prefixes)) {
      throw new Error(`Unknown prefix: ${prefix}`);
    }

    return prefixes[prefix];
  }

  return processPrefix;
}

/***/ }),

/***/ 1194:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(8279), exports);
__exportStar(__webpack_require__(370), exports);
__exportStar(__webpack_require__(1261), exports);
__exportStar(__webpack_require__(8990), exports);
__exportStar(__webpack_require__(4938), exports);
__exportStar(__webpack_require__(5414), exports);
__exportStar(__webpack_require__(3910), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 8279:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BlankNode = void 0;
/**
 * A term that represents an RDF blank node with a label.
 */
class BlankNode {
    constructor(value) {
        this.termType = 'BlankNode';
        this.value = value;
    }
    equals(other) {
        return !!other && other.termType === 'BlankNode' && other.value === this.value;
    }
}
exports.BlankNode = BlankNode;
//# sourceMappingURL=BlankNode.js.map

/***/ }),

/***/ 370:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DataFactory = void 0;
const BlankNode_1 = __webpack_require__(8279);
const DefaultGraph_1 = __webpack_require__(1261);
const Literal_1 = __webpack_require__(8990);
const NamedNode_1 = __webpack_require__(4938);
const Quad_1 = __webpack_require__(5414);
const Variable_1 = __webpack_require__(3910);
let dataFactoryCounter = 0;
/**
 * A factory for instantiating RDF terms and quads.
 */
class DataFactory {
    constructor(options) {
        this.blankNodeCounter = 0;
        options = options || {};
        this.blankNodePrefix = options.blankNodePrefix || `df_${dataFactoryCounter++}_`;
    }
    /**
     * @param value The IRI for the named node.
     * @return A new instance of NamedNode.
     * @see NamedNode
     */
    namedNode(value) {
        return new NamedNode_1.NamedNode(value);
    }
    /**
     * @param value The optional blank node identifier.
     * @return A new instance of BlankNode.
     *         If the `value` parameter is undefined a new identifier
     *         for the blank node is generated for each call.
     * @see BlankNode
     */
    blankNode(value) {
        return new BlankNode_1.BlankNode(value || `${this.blankNodePrefix}${this.blankNodeCounter++}`);
    }
    /**
     * @param value              The literal value.
     * @param languageOrDatatype The optional language or datatype.
     *                           If `languageOrDatatype` is a NamedNode,
     *                           then it is used for the value of `NamedNode.datatype`.
     *                           Otherwise `languageOrDatatype` is used for the value
     *                           of `NamedNode.language`.
     * @return A new instance of Literal.
     * @see Literal
     */
    literal(value, languageOrDatatype) {
        return new Literal_1.Literal(value, languageOrDatatype);
    }
    /**
     * This method is optional.
     * @param value The variable name
     * @return A new instance of Variable.
     * @see Variable
     */
    variable(value) {
        return new Variable_1.Variable(value);
    }
    /**
     * @return An instance of DefaultGraph.
     */
    defaultGraph() {
        return DefaultGraph_1.DefaultGraph.INSTANCE;
    }
    /**
     * @param subject   The quad subject term.
     * @param predicate The quad predicate term.
     * @param object    The quad object term.
     * @param graph     The quad graph term.
     * @return A new instance of Quad.
     * @see Quad
     */
    quad(subject, predicate, object, graph) {
        return new Quad_1.Quad(subject, predicate, object, graph || this.defaultGraph());
    }
    /**
     * Create a deep copy of the given term using this data factory.
     * @param original An RDF term.
     * @return A deep copy of the given term.
     */
    fromTerm(original) {
        // TODO: remove nasty any casts when this TS bug has been fixed:
        //  https://github.com/microsoft/TypeScript/issues/26933
        switch (original.termType) {
            case 'NamedNode':
                return this.namedNode(original.value);
            case 'BlankNode':
                return this.blankNode(original.value);
            case 'Literal':
                if (original.language) {
                    return this.literal(original.value, original.language);
                }
                if (!original.datatype.equals(Literal_1.Literal.XSD_STRING)) {
                    return this.literal(original.value, this.fromTerm(original.datatype));
                }
                return this.literal(original.value);
            case 'Variable':
                return this.variable(original.value);
            case 'DefaultGraph':
                return this.defaultGraph();
            case 'Quad':
                return this.quad(this.fromTerm(original.subject), this.fromTerm(original.predicate), this.fromTerm(original.object), this.fromTerm(original.graph));
        }
    }
    /**
     * Create a deep copy of the given quad using this data factory.
     * @param original An RDF quad.
     * @return A deep copy of the given quad.
     */
    fromQuad(original) {
        return this.fromTerm(original);
    }
    /**
     * Reset the internal blank node counter.
     */
    resetBlankNodeCounter() {
        this.blankNodeCounter = 0;
    }
}
exports.DataFactory = DataFactory;
//# sourceMappingURL=DataFactory.js.map

/***/ }),

/***/ 1261:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DefaultGraph = void 0;
/**
 * A singleton term instance that represents the default graph.
 * It's only allowed to assign a DefaultGraph to the .graph property of a Quad.
 */
class DefaultGraph {
    constructor() {
        this.termType = 'DefaultGraph';
        this.value = '';
        // Private constructor
    }
    equals(other) {
        return !!other && other.termType === 'DefaultGraph';
    }
}
exports.DefaultGraph = DefaultGraph;
DefaultGraph.INSTANCE = new DefaultGraph();
//# sourceMappingURL=DefaultGraph.js.map

/***/ }),

/***/ 8990:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Literal = void 0;
const NamedNode_1 = __webpack_require__(4938);
/**
 * A term that represents an RDF literal, containing a string with an optional language tag or datatype.
 */
class Literal {
    constructor(value, languageOrDatatype) {
        this.termType = 'Literal';
        this.value = value;
        if (typeof languageOrDatatype === 'string') {
            this.language = languageOrDatatype;
            this.datatype = Literal.RDF_LANGUAGE_STRING;
        }
        else if (languageOrDatatype) {
            this.language = '';
            this.datatype = languageOrDatatype;
        }
        else {
            this.language = '';
            this.datatype = Literal.XSD_STRING;
        }
    }
    equals(other) {
        return !!other && other.termType === 'Literal' && other.value === this.value &&
            other.language === this.language && other.datatype.equals(this.datatype);
    }
}
exports.Literal = Literal;
Literal.RDF_LANGUAGE_STRING = new NamedNode_1.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
Literal.XSD_STRING = new NamedNode_1.NamedNode('http://www.w3.org/2001/XMLSchema#string');
//# sourceMappingURL=Literal.js.map

/***/ }),

/***/ 4938:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NamedNode = void 0;
/**
 * A term that contains an IRI.
 */
class NamedNode {
    constructor(value) {
        this.termType = 'NamedNode';
        this.value = value;
    }
    equals(other) {
        return !!other && other.termType === 'NamedNode' && other.value === this.value;
    }
}
exports.NamedNode = NamedNode;
//# sourceMappingURL=NamedNode.js.map

/***/ }),

/***/ 5414:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Quad = void 0;
/**
 * An instance of DefaultGraph represents the default graph.
 * It's only allowed to assign a DefaultGraph to the .graph property of a Quad.
 */
class Quad {
    constructor(subject, predicate, object, graph) {
        this.termType = 'Quad';
        this.value = '';
        this.subject = subject;
        this.predicate = predicate;
        this.object = object;
        this.graph = graph;
    }
    equals(other) {
        // `|| !other.termType` is for backwards-compatibility with old factories without RDF* support.
        return !!other && (other.termType === 'Quad' || !other.termType) &&
            this.subject.equals(other.subject) &&
            this.predicate.equals(other.predicate) &&
            this.object.equals(other.object) &&
            this.graph.equals(other.graph);
    }
}
exports.Quad = Quad;
//# sourceMappingURL=Quad.js.map

/***/ }),

/***/ 3910:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Variable = void 0;
/**
 * A term that represents a variable.
 */
class Variable {
    constructor(value) {
        this.termType = 'Variable';
        this.value = value;
    }
    equals(other) {
        return !!other && other.termType === 'Variable' && other.value === this.value;
    }
}
exports.Variable = Variable;
//# sourceMappingURL=Variable.js.map

/***/ }),

/***/ 4436:
/***/ ((module) => {

class RelativizeUrl {
  static components = [
    {name: 'protocol', write: u => u.protocol },
    {name: 'hostname', write: u => '//' + u.hostname },
    {name: 'port', write: u => ':' + u.port },
    {name: 'pathname', write: (u, frm, relativize) => {
      if (!relativize) return u.pathname;
      const f = frm.pathname.split('/').slice(1);
      const t = u.pathname.split('/').slice(1);
      const maxDepth = Math.max(f.length, t.length);

      let start = 0;
      while(start < maxDepth && f[start] === t[start]) ++start;
      const rel = f.slice(start+1).map(c => '..').concat(t.slice(start)).join('/');
      return rel.length <= u.pathname.length ? rel : u.pathname
    }},
    {name: 'search', write: u => u.search },
    {name: 'hash', write: u => u.hash},
  ];

  constructor (base, options) { this.base = base; this.options = options; }

  relate (rel) { return RelativizeUrl.relativize(rel, this.base, this.options); }

  static relativize (rel, base, opts = {}) { // opts not yet used
    const from = new URL(base);
    const to = new URL(rel, from);
    let ret = '';
    for (let component of RelativizeUrl.components) {
      if (ret) { // force abs path if e.g. host was diffferent
        if (to[component.name]) {
          ret += component.write(to, from, false);
        }
      } else if (from[component.name] !== to[component.name]) {
        ret = component.write(to, from, true);
      }
    }
    return ret;
  }
}

/* istanbul ignore next */
if (true)
  module.exports = RelativizeUrl;


/***/ }),

/***/ 8986:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
exports.G = void 0;
const term_1 = __webpack_require__(1101);
var ControlType;
(function (ControlType) {
    ControlType[ControlType["Split"] = 0] = "Split";
    ControlType[ControlType["Rept"] = 1] = "Rept";
    ControlType[ControlType["Match"] = 2] = "Match";
})(ControlType || (ControlType = {}));
class StackEntry {
    constructor(c, e) {
        this.c = c;
        this.e = e;
        this.i = null;
    }
}
class RegExpState {
    constructor(outs) {
        this.outs = outs;
    }
}
class TripleConstraintState extends RegExpState {
    constructor(c, outs, stack) {
        super(outs);
        this.c = c;
        this.stack = stack;
    }
}
class ControlState extends RegExpState {
}
class SplitState extends ControlState {
    constructor(c, outs, expr) {
        super(outs);
        this.c = c;
        this.expr = expr;
    }
}
class ReptState extends ControlState {
    constructor(c, outs, expr) {
        super(outs);
        this.c = c;
        this.expr = expr;
        this.min = expr.min === undefined ? 1 : expr.min;
        this.max = expr.max === undefined
            ? 1
            : expr.max === UNBOUNDED
                ? Infinity
                : expr.max;
    }
}
class MatchState extends ControlState {
    constructor(c) {
        super([]);
        this.c = c;
    }
}
class RegExpPair {
    constructor(start, tail) {
        this.start = start;
        this.tail = tail;
    }
}
const UNBOUNDED = -1;
exports.G = {
    name: "eval-simple-1err",
    description: "simple regular expression engine with n out states",
    /* compile - compile regular expression and index triple constraints
     */
    compile: (_schema, shape, index) => {
        const expression = shape.expression;
        return NFA();
        function NFA() {
            // wrapper for states, startNo and matchstate
            const states = [];
            const matchstate = addState(new MatchState(ControlType.Match));
            let startNo = matchstate;
            let pair;
            if (expression) {
                const pair = walkExpr(expression, []);
                patch(pair.tail, matchstate);
                startNo = pair.start;
            }
            return new EvalSimple1ErrRegexEngine(shape, states, startNo, matchstate);
            function maybeAddRept(expr, start, tail) {
                if ((expr.min == undefined || expr.min === 1) &&
                    (expr.max == undefined || expr.max === 1))
                    return new RegExpPair(start, tail);
                const s = addState(new ReptState(ControlType.Rept, [start], expr));
                patch(tail, s);
                return new RegExpPair(s, [s]);
            }
            function walkExpr(expr, stack) {
                let s, starts;
                let lastTail;
                if (typeof expr === "string") { // Inclusion
                    const included = index.tripleExprs[expr];
                    return walkExpr(included, stack);
                }
                else {
                    switch (expr.type) {
                        case "TripleConstraint":
                            s = addState(new TripleConstraintState(expr, [], stack));
                            return new RegExpPair(s, [s]);
                        case "OneOf":
                            lastTail = [];
                            starts = [];
                            expr.expressions.forEach(function (nested, ord) {
                                pair = walkExpr(nested, stack.concat([new StackEntry(expr, ord)]));
                                starts.push(pair.start);
                                lastTail = lastTail.concat(pair.tail);
                            });
                            s = addState(new SplitState(ControlType.Split, starts, expr));
                            return maybeAddRept(expr, s, lastTail);
                        case "EachOf":
                            expr.expressions.forEach(function (nested, ord) {
                                pair = walkExpr(nested, stack.concat([new StackEntry(expr, ord)]));
                                if (ord === 0)
                                    s = pair.start;
                                else
                                    patch(lastTail, pair.start);
                                lastTail = pair.tail;
                            });
                            return maybeAddRept(expr, s, lastTail); // ShExJ says that EachOf has at least two expressions
                    }
                }
            }
            function addState(state) {
                const ret = states.length;
                states.push(state);
                return ret;
            }
            function patch(l, target) {
                l.forEach(elt => {
                    states[elt].outs.push(target);
                });
            }
        }
    }
};
/**
 * debugging tool; lots of ts-ignores
 */
class NfaToString {
    constructor() {
        this.known = { OneOf: [], EachOf: [] };
    }
    dumpTripleConstraint(tc) {
        return "<" + tc.predicate + ">";
    }
    card(obj) {
        let x = "";
        if ("min" in obj)
            // @ts-ignore
            x += obj.min;
        if ("max" in obj)
            // @ts-ignore
            x += "," + obj.max;
        return x ? "{" + x + "}" : "";
    }
    junct(j) {
        // @ts-ignore
        let id = known[j.type].indexOf(j);
        if (id === -1) { // @ts-ignore
            id = known[j.type].push(j) - 1;
        }
        // @ts-ignore
        return j.type + id; // + card(j);
    }
    dumpStackElt(elt) {
        return this.junct(elt.c) + "." + elt.e + ("i" in elt ? "[" + elt.i + "]" : "");
    }
    dumpStack(stack) {
        return stack.map(elt => {
            return this.dumpStackElt(elt);
        }).join("/");
    }
    dumpNFA(states, startNo) {
        return states.map((s, i) => {
            return (i === startNo
                ? s instanceof MatchState
                    ? "."
                    : "S"
                : s instanceof MatchState
                    ? "E"
                    : " ")
                + i + " " + (s instanceof SplitState
                ? ("Split-" + this.junct(s.expr))
                : s instanceof ReptState
                    ? ("Rept-" + this.junct(s.expr))
                    : s instanceof MatchState
                        ? "Match"
                        : this.dumpTripleConstraint(s.c))
                + this.card(s) + "→" + s.outs.join(" | ") + ("stack" in s
                ? this.dumpStack(s.stack)
                : "");
        }).join("\n");
    }
    dumpMatched(matched) {
        return matched.map(m => {
            return this.dumpTripleConstraint(m.c) + "[" + m.triples.join(",") + "]" + this.dumpStack(m.stack);
        }).join(",");
    }
    dumpThread(thread) {
        return "S" + thread.state + ":" + Object.keys(thread.repeats).map(k => {
            return k + "×" + thread.repeats[k];
        }).join(",") + " " + this.dumpMatched(thread.matched);
    }
    dumpThreadList(list) {
        return "[[" + list.map(thread => {
            return this.dumpThread(thread);
        }).join("\n  ") + "]]";
    }
}
class RegExpThread {
    constructor(state = -1, repeats = {}, avail = new Map(), stack = [], matched = [], errors = []) {
        this.state = state;
        this.repeats = repeats;
        this.avail = avail;
        this.stack = stack;
        this.matched = matched;
        this.errors = errors;
    }
}
class EvalSimple1ErrRegexEngine {
    constructor(shape, states, startNo, matchstate) {
        this.shape = shape;
        this.end = matchstate;
        this.states = states;
        this.start = startNo;
    }
    match(node, constraintToTripleMapping, semActHandler, trace) {
        const thisEvalSimple1ErrRegexEngine = this;
        let clist = [], nlist = []; // list of {state:state number, repeats:stateNo->repetitionCount}
        const allTriples = constraintToTripleMapping.reduce((allTriples, _tripleConstraint, tripleResult) => {
            tripleResult.forEach(res => allTriples.add(res.triple));
            return allTriples;
        }, new Set());
        if (thisEvalSimple1ErrRegexEngine.states.length === 1)
            return this.matchedToResult([], constraintToTripleMapping, semActHandler);
        let chosen = null;
        // console.log(new NfaToString().dumpNFA(this.states, this.start));
        this.addstate(clist, this.start, new RegExpThread());
        while (clist.length) {
            nlist = [];
            if (trace)
                trace.push({ threads: [] });
            for (let threadno = 0; threadno < clist.length; ++threadno) {
                const thread = clist[threadno];
                if (thread.state === thisEvalSimple1ErrRegexEngine.end)
                    continue;
                const state = thisEvalSimple1ErrRegexEngine.states[thread.state];
                const nlistlen = nlist.length;
                // may be an Accept state
                if (state instanceof TripleConstraintState) {
                    const tripleConstraint = state.c;
                    let min = state.c.min !== undefined ? state.c.min : 1;
                    let max = state.c.max !== undefined ? state.c.max === UNBOUNDED ? Infinity : state.c.max : 1;
                    if (!thread.avail.has(tripleConstraint))
                        thread.avail.set(tripleConstraint, constraintToTripleMapping.get(tripleConstraint).map(pair => pair.triple));
                    const taken = thread.avail.get(tripleConstraint).splice(0, max);
                    if (taken.length >= min) {
                        do {
                            this.addStates(nlist, thread, taken);
                        } while ((function () {
                            if (thread.avail.get(tripleConstraint).length > 0 && taken.length < max) {
                                taken.push(thread.avail.get(tripleConstraint).shift());
                                return true; // stay in look to take more.
                            }
                            else {
                                return false; // no more to take or we're already at max
                            }
                        })());
                    }
                }
                if (trace)
                    // @ts-ignore
                    trace[trace.length - 1].threads.push({
                        state: clist[threadno].state,
                        to: nlist.slice(nlistlen).map(x => {
                            return this.stateString(x.state, x.repeats);
                        })
                    });
            }
            if (nlist.length === 0 && chosen === null)
                return reportError(localExpect(clist, thisEvalSimple1ErrRegexEngine.states));
            const t = clist;
            clist = nlist;
            nlist = t;
            const longerChosen = clist.reduce((ret, elt) => {
                const matchedAll = elt.matched.reduce((ret, m) => {
                    return ret + m.triples.length; // count matched triples
                }, 0) === allTriples.size;
                return ret !== null ? ret : (elt.state === thisEvalSimple1ErrRegexEngine.end && matchedAll) ? elt : null;
            }, null);
            if (longerChosen)
                chosen = longerChosen;
        }
        if (chosen === null)
            return reportError([]);
        function reportError(_x) {
            return {
                type: "Failure",
                node: node,
                errors: localExpect(clist, thisEvalSimple1ErrRegexEngine.states)
            };
        }
        function localExpect(clist, states) {
            const lastState = states[states.length - 1];
            return clist.reduce((acc, elt) => {
                const c = thisEvalSimple1ErrRegexEngine.states[elt.state].c; // Always fails on a TCState
                // if (c === ControlType.Match)
                //   return { type: "EndState999" };
                let valueExpr = null;
                if (typeof c.valueExpr === "string") { // ShapeRef
                    valueExpr = c.valueExpr;
                }
                else if (c.valueExpr) {
                    valueExpr = c.valueExpr;
                }
                if (elt.state !== thisEvalSimple1ErrRegexEngine.end) {
                    const error = {
                        type: "MissingProperty",
                        property: lastState.c.predicate,
                    };
                    if (valueExpr)
                        error.valueExpr = valueExpr;
                    // @ts-ignore -- Type 'MissingProperty' is not assignable to type 'shapeExprTest'?
                    return acc.concat([error]);
                }
                else {
                    const unmatchedTriples = new Map();
                    const threadMatches = elt.matched.reduce((threadMatches, eltMatched) => {
                        eltMatched.triples.forEach(triple => threadMatches.add(triple));
                        return threadMatches;
                    }, new Set());
                    const errors = Array.from(allTriples).reduce((errors, triple) => {
                        if (!threadMatches.has(triple)) {
                            const error = {
                                type: "ExcessTripleViolation",
                                property: lastState.c.predicate,
                                triple: triple,
                            };
                            if (valueExpr)
                                error.valueExpr = valueExpr;
                            errors.push(error);
                        }
                        return errors;
                    }, []);
                    return acc.concat(errors);
                }
            }, []);
        }
        // console.log("chosen:", dump.thread(chosen));
        return "errors" in chosen.matched ?
            chosen.matched :
            this.matchedToResult(chosen.matched, constraintToTripleMapping, semActHandler);
    }
    addStates(nlist, thread, taken) {
        const state = this.states[thread.state];
        // find the exprs that require repetition
        const exprs = this.states.map(x => { return x instanceof ReptState ? x.expr : null; });
        const newStack = state.stack.map(e => {
            let i = thread.repeats[exprs.indexOf(e.c)];
            if (i === undefined)
                i = 0; // expr has no repeats
            else
                i = i - 1;
            return { c: e.c, e: e.e, i: i };
        });
        const withIndexes = {
            c: state.c,
            triples: taken,
            stack: newStack
        };
        thread.matched = thread.matched.concat([withIndexes]);
        state.outs.forEach(o => {
            this.addstate(nlist, o, thread);
        });
    }
    addstate(list, stateNo, thread, seen = []) {
        const seenkey = this.stateString(stateNo, thread.repeats);
        if (seen.indexOf(seenkey) !== -1)
            return [];
        seen.push(seenkey);
        const s = this.states[stateNo];
        if (s instanceof SplitState) {
            return s.outs.reduce((ret, o) => {
                return ret.concat(this.addstate(list, o, thread, seen));
            }, []);
            // } else if (s.c.type === "OneOf" || s.c.type === "EachOf") { // don't need Rept
        }
        else if (s instanceof ReptState) {
            const ret = [];
            // matched = [matched].concat("Rept" + s.expr);
            if (!(stateNo in thread.repeats))
                thread.repeats[stateNo] = 0;
            const repetitions = thread.repeats[stateNo];
            // add(r < s.min ? outs[0] : r >= s.min && < s.max ? outs[0], outs[1] : outs[1])
            if (repetitions < s.max)
                Array.prototype.push.apply(ret, this.addstate(list, s.outs[0], this.incrmRepeat(thread, stateNo), seen)); // outs[0] to repeat
            if (repetitions >= s.min && repetitions <= s.max)
                Array.prototype.push.apply(ret, this.addstate(list, s.outs[1], this.resetRepeat(thread, stateNo), seen)); // outs[1] when done
            return ret;
        }
        else {
            // if (stateNo !== rbenx.end || !thread.avail.reduce((r2, avail) => { faster if we trim early??
            //   return r2 || avail.length > 0;
            // }, false))
            return [list.push(new RegExpThread(// return [new list element index]
                stateNo, thread.repeats, thread.avail, // Experiments indicate this and it's arrays safe to reuse, but I've not thought about it.
                thread.stack, thread.matched, thread.errors)) - 1];
        }
    }
    resetRepeat(thread, repeatedState) {
        const trimmedRepeats = Object.keys(thread.repeats).reduce((r, k) => {
            if (parseInt(k) !== repeatedState) // ugh, hash keys are strings
                r[k] = thread.repeats[k];
            return r;
        }, {});
        return new RegExpThread(thread.state /*???*/, trimmedRepeats, thread.avail, // Experiments indicate this is safe to reuse, but I've not thought about it.
        thread.stack, thread.matched, []);
    }
    incrmRepeat(thread, repeatedState) {
        const incrmedRepeats = Object.keys(thread.repeats).reduce((r, k) => {
            r[k] = parseInt(k) == repeatedState ? thread.repeats[k] + 1 : thread.repeats[k];
            return r;
        }, {});
        return new RegExpThread(thread.state /*???*/, incrmedRepeats, [...thread.avail.keys()].reduce((acc, tc) => { acc.set(tc, thread.avail.get(tc)); return acc; }, new Map()), thread.stack, thread.matched, []);
    }
    stateString(state, repeats) {
        const rs = Object.keys(repeats).map(rpt => {
            return rpt + ":" + repeats[rpt];
        }).join(",");
        return rs.length ? state + "-" + rs : "" + state;
    }
    matchedToResult(matched, constraintToTripleMapping, semActHandler) {
        let last = [];
        const errors = [];
        const skips = [];
        const ret = matched.reduce((out, m) => {
            let mis = 0;
            let ptr = out;
            while (mis < last.length &&
                m.stack[mis].c === last[mis].c && // constraint
                m.stack[mis].i === last[mis].i && // iteration number
                m.stack[mis].e === last[mis].e) { // (dis|con)junction number
                ptr = ptr.solutions[last[mis].i].expressions[last[mis].e];
                ++mis;
            }
            while (mis < m.stack.length) {
                if (mis >= last.length) {
                    last.push({}); // to be filled in below
                }
                let xOfSolns;
                if (m.stack[mis].c !== last[mis].c) {
                    const t = [];
                    ptr.type = m.stack[mis].c.type === "EachOf" ? "EachOfSolutions" : "OneOfSolutions";
                    ptr.solutions = t; // arbitrary down cast
                    if ("min" in m.stack[mis].c)
                        ptr.min = m.stack[mis].c.min;
                    if ("max" in m.stack[mis].c)
                        ptr.max = m.stack[mis].c.max;
                    if ("annotations" in m.stack[mis].c)
                        ptr.annotations = m.stack[mis].c.annotations;
                    if ("semActs" in m.stack[mis].c)
                        ptr.semActs = m.stack[mis].c.semActs;
                    xOfSolns = t;
                    last[mis].i = null;
                    // !!! on the way out to call after valueExpr test
                    if ("semActs" in m.stack[mis].c) {
                        const errors = semActHandler.dispatchAll(m.stack[mis].c.semActs, "???", ptr);
                        if (errors.length)
                            throw errors;
                    }
                    // if (ret && "semActs" in expr) { ret.semActs = expr.semActs; }
                }
                else {
                    xOfSolns = ptr.solutions;
                }
                let texprSolns;
                if (m.stack[mis].i !== last[mis].i) {
                    const t = [];
                    xOfSolns[m.stack[mis].i] = {
                        type: m.stack[mis].c.type === "EachOf" ? "EachOfSolution" : "OneOfSolution",
                        expressions: t
                    };
                    texprSolns = t;
                    last[mis].e = -1; // trigger m.stack[mis].e !== last[mis].e below
                }
                else {
                    texprSolns = xOfSolns[last[mis].i].expressions;
                }
                if (m.stack[mis].e !== last[mis].e) {
                    const t = {};
                    texprSolns[m.stack[mis].e] = t;
                    if (m.stack[mis].e > 0 && texprSolns[m.stack[mis].e - 1] === undefined && skips.indexOf(texprSolns) === -1)
                        skips.push(texprSolns);
                    ptr = t;
                    last.length = mis + 1; // chop off last so we create everything underneath
                }
                else {
                    throw "how'd we get here?";
                    // ptr = texprSolns[last[mis].e];
                }
                ++mis;
            }
            const tcSolns = ptr;
            tcSolns.type = "TripleConstraintSolutions";
            if ("min" in m.c)
                tcSolns.min = m.c.min;
            if ("max" in m.c)
                tcSolns.max = m.c.max;
            tcSolns.predicate = m.c.predicate;
            if ("valueExpr" in m.c)
                tcSolns.valueExpr = m.c.valueExpr;
            if ("id" in m.c)
                tcSolns.productionLabel = m.c.id;
            tcSolns.solutions = m.triples.map(triple => {
                const ret = {
                    type: "TestedTriple",
                    subject: (0, term_1.rdfJsTerm2Ld)(triple.subject),
                    predicate: (0, term_1.rdfJsTerm2Ld)(triple.predicate),
                    object: (0, term_1.rdfJsTerm2Ld)(triple.object)
                };
                const hit = constraintToTripleMapping.get(m.c).find(x => x.triple === triple);
                if (hit.res && Object.keys(hit.res).length > 0)
                    ret.referenced = hit.res;
                if (errors.length === 0 && "semActs" in m.c) { // @ts-ignore
                    [].push.apply(errors, semActHandler.dispatchAll(m.c.semActs, triple, ret));
                }
                return ret;
            });
            if ("annotations" in m.c)
                tcSolns.annotations = m.c.annotations;
            if ("semActs" in m.c)
                tcSolns.semActs = m.c.semActs;
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
        if ("semActs" in this.shape)
            ret.semActs = this.shape.semActs;
        return ret;
    }
}
EvalSimple1ErrRegexEngine.algorithm = "rbenx"; // rename at will; only used for debugging
//# sourceMappingURL=eval-simple-1err.js.map

/***/ }),

/***/ 6201:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
exports.G = void 0;
const term_1 = __webpack_require__(1101);
const UNBOUNDED = -1;
class RegexpThread {
    constructor(avail = new Map(), errors = [], matched = [], expression) {
        this.avail = avail;
        this.errors = errors;
        this.matched = matched;
        this.expression = expression;
    }
    makeResultsThread(expr, tests, errors, matched, minmax) {
        return new RegexpThread(new Map(this.avail), // copy parent thread's avail vector,
        errors, matched.concat({
            triples: tests.map(p => p.triple)
        }), Object.assign({ type: "TripleConstraintSolutions", predicate: expr.predicate }, expr.valueExpr !== undefined ? { valueExpr: expr.valueExpr } : {}, expr.id !== undefined ? { productionLabel: expr.id } : {}, minmax, { solutions: tests.map(p => p.tested) }));
    }
    makeMissingPropertyThread(expr, matched) {
        return new RegexpThread(this.avail, this.errors.concat([
            Object.assign({ type: "MissingProperty", property: expr.predicate }, expr.valueExpr ? { valueExpr: expr.valueExpr } : {})
        ]), matched);
    }
}
exports.G = {
    name: "eval-threaded-nerr",
    description: "emulation of regular expression engine with error permutations",
    /* compile - compile regular expression and index triple constraints
     */
    compile: (_schema, shape, index) => {
        return new EvalThreadedNErrRegexEngine(shape, index); // not called if there's no expression
    }
};
class EvalThreadedNErrRegexEngine {
    constructor(shape, index) {
        this.shape = shape;
        this.index = index;
        this.outerExpression = shape.expression;
    }
    match(node, constraintToTripleMapping, semActHandler, _trace) {
        const allTriples = constraintToTripleMapping.reduce((allTriples, _tripleConstraint, tripleResult) => {
            tripleResult.forEach(res => allTriples.add(res.triple));
            return allTriples;
        }, new Set());
        const startingThread = new RegexpThread();
        const ret = this.matchTripleExpression(this.outerExpression, startingThread, constraintToTripleMapping, semActHandler);
        // console.log(JSON.stringify(ret));
        // note: don't return if ret.length === 1 because it might fail the unmatchedTriples test.
        const longerChosen = ret.reduce((ret, elt) => {
            if (elt.errors.length > 0)
                return ret; // early return
            const unmatchedTriples = new Set(allTriples);
            // Removed triples matched in this thread.
            elt.matched.forEach(m => {
                m.triples.forEach(t => {
                    unmatchedTriples.delete(t);
                });
            });
            // Remaining triples are unaccounted for.
            unmatchedTriples.forEach(t => {
                elt.errors.push({
                    type: "ExcessTripleViolation",
                    triple: t,
                });
            });
            return ret !== null ? ret : // keep first solution
                // Accept thread with no unmatched triples.
                unmatchedTriples.size > 0 ? null : elt;
        }, null);
        if (longerChosen !== null) {
            let fromValidationPoint = longerChosen.expression;
            if (this.shape.semActs !== undefined)
                fromValidationPoint.semActs = this.shape.semActs;
            return fromValidationPoint;
        }
        else {
            return ret.length > 1 ? {
                type: "PossibleErrors",
                errors: ret.reduce((all, e) => {
                    return all.concat([e.errors]);
                }, [])
            } : {
                type: "Failure",
                node: node,
                errors: ret[0].errors
            };
        }
    }
    matchTripleExpression(expr, thread, constraintToTripleMapping, semActHandler) {
        if (typeof expr === "string") { // Inclusion
            const included = this.index.tripleExprs[expr];
            return this.matchTripleExpression(included, thread, constraintToTripleMapping, semActHandler);
        }
        let min = expr.min !== undefined ? expr.min : 1;
        let max = expr.max !== undefined ? expr.max === UNBOUNDED ? Infinity : expr.max : 1;
        switch (expr.type) {
            case "OneOf":
                return this.matchOneOf(expr, min, max, thread, constraintToTripleMapping, semActHandler);
            case "EachOf":
                return this.matchEachOf(expr, min, max, thread, constraintToTripleMapping, semActHandler);
            case "TripleConstraint":
                return this.matchTripleConstraint(expr, min, max, thread, constraintToTripleMapping, semActHandler);
            default:
                throw Error("how'd we get here?");
        }
    }
    matchOneOf(oneOf, min, max, thread, constraintToTripleMapping, semActHandler) {
        return EvalThreadedNErrRegexEngine.matchRepeat(oneOf, min, max, thread, "OneOfSolutions", (th) => {
            // const accept = null;
            const matched = [];
            const failed = [];
            oneOf.expressions.forEach(nested => {
                const thcopy = new RegexpThread(new Map(th.avail), th.errors, th.matched //.slice() ever needed??
                );
                const sub = this.matchTripleExpression(nested, thcopy, constraintToTripleMapping, semActHandler);
                if (sub[0].errors.length === 0) { // all subs pass or all fail
                    Array.prototype.push.apply(matched, sub);
                    sub.forEach(newThread => {
                        const expressions = thcopy.solution !== undefined ? thcopy.solution.expressions : [];
                        if (newThread.expression !== undefined) // undefined for no matches on min card:0
                            expressions.push(newThread.expression);
                        delete newThread.expression;
                        newThread.solution = {
                            type: "OneOfSolution",
                            expressions: expressions
                        };
                    });
                }
                else
                    Array.prototype.push.apply(failed, sub);
            });
            return matched.length > 0 ? matched : failed;
        }, semActHandler);
    }
    matchEachOf(expr, min, max, thread, constraintToTripleMapping, semActHandler) {
        return EvalThreadedNErrRegexEngine.homogenize(EvalThreadedNErrRegexEngine.matchRepeat(expr, min, max, thread, "EachOfSolutions", (th) => {
            // Iterate through nested expressions, exprThreads starts as [th].
            return expr.expressions.reduce((exprThreads, nested) => {
                // Iterate through current thread list composing nextThreads.
                // Consider e.g.
                // <S1> { <p1> . | <p2> .; <p3> . } / { <x> <p2> 2; <p3> 3 } (should pass)
                // <S1> { <p1> .; <p2> . }          / { <s1> <p1> 1 }        (should fail)
                return EvalThreadedNErrRegexEngine.homogenize(exprThreads.reduce((nextThreads, exprThread) => {
                    const sub = this.matchTripleExpression(nested, exprThread, constraintToTripleMapping, semActHandler);
                    // Move newThread.expression into a hierarchical solution structure.
                    sub.forEach(newThread => {
                        if (newThread.errors.length === 0) {
                            const expressions = exprThread.solution !== undefined ? exprThread.solution.expressions.slice() : [];
                            if (newThread.expression !== undefined) // undefined for no matches on min card:0
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
        }, semActHandler));
    }
    // Early return in case of insufficient matching triples
    matchTripleConstraint(constraint, min, max, thread, constraintToTripleMapping, semActHandler) {
        if (thread.avail.get(constraint) === undefined)
            thread.avail.set(constraint, constraintToTripleMapping.get(constraint).map(pair => pair.triple));
        const taken = thread.avail.get(constraint).splice(0, min);
        if (!(taken.length >= min)) // Early return
            return [thread.makeMissingPropertyThread(constraint, thread.matched)];
        const ret = [];
        const minmax = {};
        if (constraint.min !== undefined && constraint.min !== 1 || constraint.max !== undefined && constraint.max !== 1) {
            minmax.min = constraint.min;
            minmax.max = constraint.max;
        }
        if (constraint.semActs !== undefined)
            minmax.semActs = constraint.semActs;
        if (constraint.annotations !== undefined)
            minmax.annotations = constraint.annotations;
        do {
            const passFail = taken.reduce((acc, triple) => {
                const tested = {
                    type: "TestedTriple",
                    subject: (0, term_1.rdfJsTerm2Ld)(triple.subject),
                    predicate: (0, term_1.rdfJsTerm2Ld)(triple.predicate),
                    object: (0, term_1.rdfJsTerm2Ld)(triple.object)
                };
                const hit = constraintToTripleMapping.get(constraint).find(x => x.triple === triple);
                if (hit.res !== undefined)
                    tested.referenced = hit.res;
                const semActErrors = thread.errors.concat(constraint.semActs !== undefined
                    ? semActHandler.dispatchAll(constraint.semActs, triple, tested)
                    : []);
                if (semActErrors.length > 0)
                    acc.fail.push({ triple, tested, semActErrors });
                else
                    acc.pass.push({ triple, tested, semActErrors });
                return acc;
            }, { pass: [], fail: [] });
            // return an empty solution if min card was 0
            if (passFail.fail.length === 0) {
                // If we didn't take anything, fall back to old errors.
                // Could do something fancy here with a semAct registration for negative matches.
                const totalErrors = taken.length === 0 ? thread.errors.slice() : [];
                const myThread = thread.makeResultsThread(constraint, passFail.pass, totalErrors, thread.matched, minmax);
                ret.push(myThread);
            }
            else {
                passFail.fail.forEach(f => ret.push(thread.makeResultsThread(constraint, [f], f.semActErrors, thread.matched, minmax)));
            }
        } while ((() => {
            if (thread.avail.get(constraint).length > 0 && taken.length < max) {
                // build another thread.
                taken.push(thread.avail.get(constraint).shift());
                return true;
            }
            else {
                // no more threads
                return false;
            }
        })());
        return ret;
    }
    /*
       * returns: list of all passing or all failing threads (no heterogeneous lists)
       */
    static matchRepeat(groupTE, min, max, thread, type, evalGroup, semActHandler) {
        let repeated = 0, errOut = false;
        let newThreads = [thread];
        const minmax = {};
        if (groupTE.min !== undefined && groupTE.min !== 1 || groupTE.max !== undefined && groupTE.max !== 1) {
            minmax.min = groupTE.min;
            minmax.max = groupTE.max;
        }
        if (groupTE.semActs !== undefined)
            minmax.semActs = groupTE.semActs;
        if (groupTE.annotations !== undefined)
            minmax.annotations = groupTE.annotations;
        for (; repeated < max && !errOut; ++repeated) {
            let inner = [];
            for (let t = 0; t < newThreads.length; ++t) {
                const newt = newThreads[t];
                const sub = evalGroup(newt);
                if (sub.length > 0 && sub[0].errors.length === 0) { // all subs pass or all fail
                    sub.forEach(newThread => {
                        const solutions = newt.expression !== undefined ? newt.expression.solutions.slice() : [];
                        if (newThread.solution !== undefined)
                            solutions.push(newThread.solution);
                        delete newThread.solution;
                        newThread.expression = Object.assign({
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
        if (newThreads.length > 0 && newThreads[0].errors.length === 0 && groupTE.semActs !== undefined) {
            const passes = [];
            const failures = [];
            newThreads.forEach(newThread => {
                const semActErrors = semActHandler.dispatchAll(groupTE.semActs, "???", newThread);
                if (semActErrors.length === 0) {
                    passes.push(newThread);
                }
                else {
                    Array.prototype.push.apply(newThread.errors, semActErrors);
                    failures.push(newThread);
                }
            });
            newThreads = passes.length > 0 ? passes : failures;
        }
        return newThreads;
    }
    static homogenize(list) {
        return list.reduce((acc, elt) => {
            if (elt.errors.length === 0) {
                if (acc.errors) {
                    return { errors: false, l: [elt] };
                }
                else {
                    return { errors: false, l: acc.l.concat(elt) };
                }
            }
            else {
                if (acc.errors) {
                    return { errors: true, l: acc.l.concat(elt) };
                }
                else {
                    return acc;
                }
            }
        }, { errors: true, l: [] }).l;
    }
}
//# sourceMappingURL=eval-threaded-nerr.js.map

/***/ }),

/***/ 3530:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MapArray = void 0;
class MapArray {
    constructor() {
        this.data = new Map(); // public 'cause I don't know how to fix reduce to use this.data
        this.reduce = (f, acc) => {
            const keys = [...this.data.keys()];
            for (const key of keys)
                acc = f(acc, key, this.data.get(key));
            return acc;
        };
    }
    add(a, t) {
        if (!this.data.has(a)) {
            this.data.set(a, []);
        }
        if (this.data.get(a).indexOf(t) !== -1) {
            throw Error(`Error adding [${a}] ${t}; already included`);
        }
        this.data.get(a).push(t);
    }
    get length() { return this.data.size; }
    get keys() { return this.data.keys(); }
    get(key) { return this.data.get(key); }
    empty(key) {
        this.data.set(key, []);
    }
}
exports.MapArray = MapArray;


/***/ }),

/***/ 6053:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * options: {
 *   indent: '    ',
 *   checkCorefs: n => false, // meaning "trust me, it's a tree"
 * }
 */

// **N3Writer** writes N3 documents.
const namespaces = (__webpack_require__(5325)["default"]);
const N3Fac = __webpack_require__(713);
const { Term } = N3Fac;
const N3DataFactory = N3Fac.default;
const { isDefaultGraph } = __webpack_require__(7141);

const DEFAULTGRAPH = N3DataFactory.defaultGraph();

const { rdf, xsd } = namespaces;

// Characters in literals that require escaping
const escape    = /["\\\t\n\r\b\f\u0000-\u0019\ud800-\udbff]/,
    escapeAll = /["\\\t\n\r\b\f\u0000-\u0019]|[\ud800-\udbff][\udc00-\udfff]/g,
    escapedCharacters = {
      '\\': '\\\\', '"': '\\"', '\t': '\\t',
      '\n': '\\n', '\r': '\\r', '\b': '\\b', '\f': '\\f',
    };
const rdf10LocalName = `[_a-zA-Z][\\-_a-zA-Z0-9]*`;
const rdf11LocalName = `[_a-zA-Z0-9][\\-_a-zA-Z0-9.]*`;

// ## Placeholder class to represent already pretty-printed terms
class SerializedTerm extends Term {
  // Pretty-printed nodes are not equal to any other node
  // (e.g., [] does not equal [])
  equals() {
    return false;
  }
}

const INDENT = '  ';

class Nesting {
  constructor (stream, indent, subject, predicate) {
    if (this.constructor === Nesting)
      throw new TypeError(`Cannot construct ${new.target.name} instances directly`);
    const missing = (['close']).filter(m => this[m] === Nesting.prototype[m]);
    if (missing.length)
      throw new TypeError(`${new.target.name} missing methods: ${missing.join(', ')}`);

    this._stream = stream;
    this._indent = indent;
    this._subject = subject;
    this._predicate = predicate; // gets updated by _writeQuad()
  }

  close (done) { this._abstract('close'); }

  _abstract (method) { throw new TypeError(`${this.constructor.name}.${method} not implemented`); }
}

class Root extends Nesting {
  constructor (stream, subject, predicate) { super(stream, '  ', subject, predicate); }
  close (done) {
    if (this.used) {
      this._stream._write('.\n', done);
      this.used = false;
    }
  }
}

class BNode extends Nesting {
  constructor (stream, indent, node) { super(stream, indent, node, null); }
  close (done, p) {
    this._stream._write((this.used ? `\n${p._indent}` : '') + ']', done);
  }
}

class Collection extends Nesting {
  constructor (stream, indent, members) {
    super(stream, indent, null, null);
    this._members = members;
    this.leadSpace = false;
  }
  close (done, p) {
    this._stream._write(`\n${p._indent})`, done);
  }
}


// ## Constructor
class Writer {
  constructor(outputStream, options) {
    // ### `_prefixRegex` matches a prefixed name or IRI that begins with one of the added prefixes
    this._prefixRegex = /$0^/;

    // Shift arguments if the first argument is not a stream
    if (outputStream && typeof outputStream.write !== 'function')
      options = outputStream, outputStream = null;
    options = options || {};
    this._lists = options.lists;
    this._indent = options.indent || '  ';
    this._checkCorefs = options.checkCorefs || (n => false); // if unsupplied; assume a tree
    this._version = options.version || 1.0;
    this._localName = this._version === 1.0
        ? rdf10LocalName
        : rdf11LocalName;

    // If no output stream given, send the output as string through the end callback
    if (!outputStream) {
      let output = '';
      this._outputStream = {
        write(chunk, encoding, done) { if (options.debug) { console.log({chunk, output}); } output += chunk; done && done(); },
        end: done => { done && done(null, output); },
      };
      this._endStream = true;
    }
    else {
      this._outputStream = outputStream;
      this._endStream = options.end === undefined ? true : !!options.end;
    }

    // Initialize writer, depending on the format
    this._nestings = [new Root(this, null, null)];
    if (!(/triple|quad/i).test(options.format)) {
      this._lineMode = false;
      this._graph = DEFAULTGRAPH;
      this._prefixIRIs = Object.create(null);
      options.prefixes && this.addPrefixes(options.prefixes);
      if (options.baseIRI) {
        this._baseMatcher = new RegExp(`^${escapeRegex(options.baseIRI)
            }${options.baseIRI.endsWith('/') ? '' : '[#?]'}`);
        this._baseLength = options.baseIRI.length;
      }
    }
    else {
      this._lineMode = true;
      this._writeQuad = this._writeQuadLine;
    }
  }

  // ## Private methods

  // ### Whether the current graph is the default graph
  get _inDefaultGraph() {
    return DEFAULTGRAPH.equals(this._graph);
  }

  // ### `_write` writes the argument to the output stream
  _write(string, callback) {
    this._outputStream.write(string, 'utf8', callback);
  }

  // ### `_writeQuad` writes the quad to the output stream
  _writeQuad(subject, predicate, object, graph, done) {
    try {
      // Write the graph's label if it has changed
      if (!graph.equals(this._graph)) {
        // Close the previous graph and start the new one
        this._getNestingForSubject(DEFAULTGRAPH); // TODO: should be fresh bnode or null-ish thingy
        this._write((this._nestings.length === 1 ? '' : (this._inDefaultGraph ? '.\n' : '\n}\n')) +
                    (DEFAULTGRAPH.equals(graph) ? '' : `${this._encodeIriOrBlank(graph)} {\n`));
        this._graph = graph;
      }

      const oldLength = this._nestings.length;
      let [nesting, matched] = this._getNestingForSubject(subject);

      let objectStr;
      if (this._lists && (object.value in this._lists)) {
        objectStr = '(';
        this._nestings.push(new Collection(this, nesting._indent + INDENT, this._lists[object.value]));
      } else if (object.termType === 'BlankNode'
          && this._checkCorefs
          && !this._checkCorefs(object)) {
        objectStr = '[';
        this._nestings.push(new BNode(this, nesting._indent + INDENT, object));
      } else {
        objectStr = this._encodeObject(object);
      }

      // Don't repeat the subject if it's the same
      if (matched) {
        // Don't repeat the predicate if it's the same
        if (predicate.equals(nesting.predicate)) {
          this._write(`, ${objectStr}`, done);
          // Same subject, different predicate
        } else {
          this._write(`${nesting.used ? ';' : ''}\n${nesting._indent}${
              this._encodePredicate(nesting.predicate = predicate)} ${
              objectStr}`, done);
        }
      }
      // Different subject; write the whole quad
      else {
        nesting._subject = subject; nesting._predicate = predicate;
        this._write(`${
                    this._encodeSubject(subject)} ${
                    this._encodePredicate(predicate)} ${
                    objectStr}`, done);
      }
      nesting.used = true;
    }
    catch (error) { if (done) done(error); else throw error;  }
  }

  /*
    closes BNodes and iterates and closes Collections until finding subject.
   */
  _getNestingForSubject (subject) {
    let nesting = this._nestings.length > 0
        ? this._nestings[this._nestings.length - 1]
        : null;

    while (nesting && !subject.equals(nesting._subject)) {

      if (nesting instanceof Collection) {

        const leadSpace = nesting.leadSpace ? ' ' : '';
        if (nesting._subject) {
          this._write(`${leadSpace}${this._encodeObject(nesting._subject)}`);
          nesting._subject = null; // don't serialize again if e.g. returning from nested list
          nesting.leadSpace = true;
        }
        if (nesting._members.length === 0) {
          nesting = this._closeNesting();
        } else {
          const li = nesting._members.shift();
          if (li.value in this._lists) {
            // list in a list
            this._write(`${leadSpace}(`)
            this._nestings.push(nesting = new Collection(this, nesting._indent + INDENT, this._lists[li.value]));
            nesting.leadSpace = false;
          } else {
            // any other element in the list
            if (li.equals(subject)) {
              this._write("\n" + nesting._indent + '[');
              nesting._subject = null;
              this._nestings.push(nesting = new BNode(this, nesting._indent + INDENT, subject));
              nesting.leadSpace = false;
            } else {
              nesting._subject = li;
            }
          }
        }
      } else if (nesting instanceof BNode) {
        nesting = this._closeNesting();
      } else {
        nesting.close();
        return [nesting, false]; // didn't match subject
      }
    }
    return [nesting, subject.equals(nesting._subject)]; // hard code true?

  }

  _closeNesting () {
    const nesting = this._nestings.pop();
    const ret = this._nestings[this._nestings.length - 1];
    nesting.close(null, ret);
    return ret;
  }

  _finish() {
    const oldLength = this._nestings.length;
    this._getNestingForSubject(DEFAULTGRAPH); // TODO: should be fresh bnode or null-ish thingy
    if (oldLength !== 1) {
      if (this._inDefaultGraph) {
      } else {
        this._write('\n}\n');
      }
      return true;
    } else {
      return false;
    }
  }

  // ### `_writeQuadLine` writes the quad to the output stream as a single line
  _writeQuadLine(subject, predicate, object, graph, done) {
    // Write the quad without prefixes
    delete this._prefixMatch;
    this._write(this.quadToString(subject, predicate, object, graph), done);
  }

  // ### `quadToString` serializes a quad as a string
  quadToString(subject, predicate, object, graph) {
    return  `${this._encodeSubject(subject)} ${
            this._encodeIriOrBlank(predicate)} ${
            this._encodeObject(object)
            }${graph && graph.value ? ` ${this._encodeIriOrBlank(graph)} .\n` : ' .\n'}`;
  }

  // ### `quadsToString` serializes an array of quads as a string
  quadsToString(quads) {
    return quads.map(t => {
      return this.quadToString(t.subject, t.predicate, t.object, t.graph);
    }).join('');
  }

  // ### `_encodeSubject` represents a subject
  _encodeSubject(entity) {
    return entity.termType === 'Quad' ?
      this._encodeQuad(entity) : this._encodeIriOrBlank(entity);
  }

  // ### `_encodeIriOrBlank` represents an IRI or blank node
  _encodeIriOrBlank(entity) {
    // A blank node or list is represented as-is
    if (entity.termType !== 'NamedNode') {
      // If it is a list head, pretty-print it
      return 'id' in entity ? entity.id : `_:${entity.value}`;
    }
    let iri = entity.value;
    // Use relative IRIs if requested and possible
    if (this._baseMatcher && this._baseMatcher.test(iri))
      iri = iri.substr(this._baseLength);
    // Escape special characters
    if (escape.test(iri))
      iri = iri.replace(escapeAll, characterReplacer);
    // Try to represent the IRI as prefixed name
    const prefixMatch = this._prefixRegex.exec(iri);
    return !prefixMatch ? `<${iri}>` :
           (!prefixMatch[1] ? iri : this._prefixIRIs[prefixMatch[1]] + prefixMatch[2]);
  }

  // ### `_encodeLiteral` represents a literal
  _encodeLiteral(literal) {
    // Escape special characters
    let value = literal.value;
    if (escape.test(value))
      value = value.replace(escapeAll, characterReplacer);

    // Write a language-tagged literal
    if (literal.language)
      return `"${value}"@${literal.language}`;

    // Write dedicated literals per data type
    if (this._lineMode) {
      // Only abbreviate strings in N-Triples or N-Quads
      if (literal.datatype.value === xsd.string)
        return `"${value}"`;
    }
    else {
      // Use common datatype abbreviations in Turtle or TriG
      switch (literal.datatype.value) {
      case xsd.string:
        return `"${value}"`;
      case xsd.boolean:
        if (value === 'true' || value === 'false')
          return value;
        break;
      case xsd.integer:
        if (/^[+-]?\d+$/.test(value))
          return value;
        break;
      case xsd.decimal:
        if (/^[+-]?\d*\.\d+$/.test(value))
          return value;
        break;
      case xsd.double:
        if (/^[+-]?(?:\d+\.\d*|\.?\d+)[eE][+-]?\d+$/.test(value))
          return value;
        break;
      }
    }

    // Write a regular datatyped literal
    return `"${value}"^^${this._encodeIriOrBlank(literal.datatype)}`;
  }

  // ### `_encodePredicate` represents a predicate
  _encodePredicate(predicate) {
    return predicate.value === rdf.type ? 'a' : this._encodeIriOrBlank(predicate);
  }

  // ### `_encodeObject` represents an object
  _encodeObject(object) {
    switch (object.termType) {
    case 'Quad':
      return this._encodeQuad(object);
    case 'Literal':
      return this._encodeLiteral(object);
    default:
      return this._encodeIriOrBlank(object);
    }
  }

  // ### `_encodeQuad` encodes an RDF* quad
  _encodeQuad({ subject, predicate, object, graph }) {
    return `<<${
      this._encodeSubject(subject)} ${
      this._encodePredicate(predicate)} ${
      this._encodeObject(object)}${
      isDefaultGraph(graph) ? '' : ` ${this._encodeIriOrBlank(graph)}`}>>`;
  }

  // ### `_blockedWrite` replaces `_write` after the writer has been closed
  _blockedWrite() {
    throw new Error('Cannot write because the writer has been closed.');
  }

  // ### `addQuad` adds the quad to the output stream
  addQuad(subject, predicate, object, graph, done) {
    // The quad was given as an object, so shift parameters
    if (object === undefined)
      this._writeQuad(subject.subject, subject.predicate, subject.object, subject.graph, predicate);
    // The optional `graph` parameter was not provided
    else if (typeof graph === 'function')
      this._writeQuad(subject, predicate, object, DEFAULTGRAPH, graph);
    // The `graph` parameter was provided
    else
      this._writeQuad(subject, predicate, object, graph || DEFAULTGRAPH, done);
  }

  // ### `addQuads` adds the quads to the output stream
  addQuads(quads) {
    for (let i = 0; i < quads.length; i++)
      this.addQuad(quads[i]);
  }

  // ### `addPrefix` adds the prefix to the output stream
  addPrefix(prefix, iri, done) {
    const prefixes = {};
    prefixes[prefix] = iri;
    this.addPrefixes(prefixes, done);
  }

  // ### `addPrefixes` adds the prefixes to the output stream
  addPrefixes(prefixes, done) {
    // Ignore prefixes if not supported by the serialization
    if (!this._prefixIRIs)
      return done && done();

    // Write all new prefixes
    let hasPrefixes = false;
    for (let prefix in prefixes) {
      let iri = prefixes[prefix];
      if (typeof iri !== 'string')
        iri = iri.value;
      hasPrefixes = true;
      // Finish a possible pending quad
      if (this._finish())
        this._graph = '';
      // Store and write the prefix
      this._prefixIRIs[iri] = (prefix += ':');
      if (this._version > 1) {
        this._write(`PREFIX ${prefix} <${iri}>\n`);
      } else {
        this._write(`@prefix ${prefix} <${iri}>.\n`);
      }
    }
    // Recreate the prefix matcher
    if (hasPrefixes) {
      let IRIlist = '', prefixList = '';
      for (const prefixIRI in this._prefixIRIs) {
        IRIlist += IRIlist ? `|${prefixIRI}` : prefixIRI;
        prefixList += (prefixList ? '|' : '') + this._prefixIRIs[prefixIRI];
      }
      IRIlist = escapeRegex(IRIlist, /[\]\/\(\)\*\+\?\.\\\$]/g, '\\$&');
      this._prefixRegex = new RegExp(`^(?:${prefixList})[^\/]*$|` +
                                     `^(${IRIlist})(${this._localName})$`);
    }
    // End a prefix block with a newline
    this._write(hasPrefixes ? '\n' : '', done);
  }

  // ### `blank` creates a blank node with the given content
  blank(predicate, object) {
    let children = predicate, child, length;
    // Empty blank node
    if (predicate === undefined)
      children = [];
    // Blank node passed as blank(Term("predicate"), Term("object"))
    else if (predicate.termType)
      children = [{ predicate: predicate, object: object }];
    // Blank node passed as blank({ predicate: predicate, object: object })
    else if (!('length' in predicate))
      children = [predicate];

    switch (length = children.length) {
    // Generate an empty blank node
    case 0:
      return new SerializedTerm('[]');
    // Generate a non-nested one-triple blank node
    case 1:
      child = children[0];
      if (!(child.object instanceof SerializedTerm))
        return new SerializedTerm(`[ ${this._encodePredicate(child.predicate)} ${
                                  this._encodeObject(child.object)} ]`);
    // Generate a multi-triple or nested blank node
    default:
      let contents = '[';
      // Write all triples in order
      for (let i = 0; i < length; i++) {
        child = children[i];
        // Write only the object is the predicate is the same as the previous
        if (child.predicate.equals(predicate))
          contents += `, ${this._encodeObject(child.object)}`;
        // Otherwise, write the predicate and the object
        else {
          contents += `${(i ? ';\n  ' : '\n  ') +
                      this._encodePredicate(child.predicate)} ${
                      this._encodeObject(child.object)}`;
          predicate = child.predicate;
        }
      }
      return new SerializedTerm(`${contents}\n]`);
    }
  }

  // ### `list` creates a list node with the given content
  list(elements) {
    const length = elements && elements.length || 0, contents = new Array(length);
    for (let i = 0; i < length; i++)
      contents[i] = this._encodeObject(elements[i]);
    return new SerializedTerm(`(${contents.join(' ')})`);
  }

  // ### `end` signals the end of the output stream
  comment(text) {
    // Finish a possible pending quad
    this._finish();
    this._write(text + "\n");
  }

  // ### `end` signals the end of the output stream
  end(done) {
    // Finish a possible pending quad
    this._finish();
    // Disallow further writing
    this._write = this._blockedWrite;

    // Try to end the underlying stream, ensuring done is called exactly one time
    let singleDone = done && ((error, result) => { singleDone = null, done(error, result); });
    if (this._endStream) {
      try { return this._outputStream.end(singleDone); }
      catch (error) { /* error closing stream */ }
    }
    singleDone && singleDone();
  }
}

// Replaces a character by its escaped version
function characterReplacer(character) {
  // Replace a single character by its escaped version
  let result = escapedCharacters[character];
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

function escapeRegex(regex) {
  return regex.replace(/[\]\/\(\)\*\+\?\.\\\$]/g, '\\$&');
}

if (true)
  module.exports = {Writer};


/***/ }),

/***/ 4865:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* ShExMaterializer - javascript module to validate a graph with respect to Shape Expressions
 *
 * Status: 1/2 tested, no known bugs.
 *
 * TODO:
 *   constraint violation reporting.
 */

const {rdfJsTerm2Ld} = __webpack_require__(1101);

const ShExMapMaterializerCjsModule = function (config) {

const Start = config.Validator.Start;

// interface constants
const InterfaceOptions = {
  "or": {
    "oneOf": "exactly one disjunct must pass",
    "someOf": "one or more disjuncts must pass",
    "firstOf": "disjunct evaluation stops after one passes"
  },
  "partition": {
    "greedy": "each triple constraint consumes all triples matching predicate and object",
    "exhaustive": "search all mappings of triples to triple constriant"
  }
};

const VERBOSE = false; // "VERBOSE" in process.env;
// **ShExValidator** provides ShEx utility functions

const ProgramFlowError = { type: "ProgramFlowError", errors: { type: "UntrackedError" } };

const ShExTerm = __webpack_require__(1101);
const ShExMap = __webpack_require__(1279);

const UNBOUNDED = -1;

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
    parseError("illegal integer value '" + label + "'");
  }
  return parseFloat(label);
};
numericParsers[XSD + "float"  ] = function (label, parseError) {
  if (!(label.match(/^[+-]?(?:[0-9]*\.[0-9]+|[0-9]+)$/))) { // XSD has no pattern for float?
    parseError("illegal integer value '" + label + "'");
  }
  return parseFloat(label);
};
numericParsers[XSD + "double" ] = function (label, parseError) {
  if (!(label.match(/[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/))) {
    parseError("illegal integer value '" + label + "'");
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

function makeCache () {
  const _keys = {}; // _keys[http://abcd] = [obj1, obj2]
  const _vals = {}; // _vals[http://abcd] = [res1, res2]
  return {
    cached: function (focus, shape) {
     const key = ShExTerm.rdfJsTerm2Turtle(focus);
      let cache = _keys[key];
      if (!cache) {
        _keys[key] = cache = [];
        _vals[key] = [];
        return undefined;
      }
      const idx = cache.indexOf(shape);
      return idx === -1 ? undefined : _vals[key][idx];
    },
    remember: function (focus, shape, res) {
     const key = ShExTerm.rdfJsTerm2Turtle(focus);
      const cache = _keys[key];
      if (!cache) {
        _keys[key] = [];
        _vals[key] = [];
      } else if (cache.indexOf(shape) !== -1) {
        // we're conservative in the use here.
        throw Error("not expecting duplicate key " + key);
      }
      _keys[key].push(shape);
      _vals[key].push(res);
    }
  };
}

/* ShExValidator - construct an object for validating a schema.
 *
 * schema: a structure produced by a ShEx parser or equivalent.
 * options: object with controls for
 *   lax(true): boolean: whine about missing types in schema.
 *   diagnose(false): boolean: makde validate return a structure with errors.
 */
function ShExMaterializer_constructor(schema, mapper, options) {
  if (!(this instanceof ShExMaterializer_constructor))
    return new ShExMaterializer_constructor(schema, mapper, options);
  this.type = "ShExValidator";
  options = options || {};
  this.options = options;
  this.options.or = this.options.or || "someOf";
  this.options.partition = this.options.partition || "exhaustive";
  if (!("noCache" in options && options.noCache))
    this.known = makeCache();

  const _ShExValidator = this;
  this.schema = schema;
  this._expect = this.options.lax ? noop : expect; // report errors on missing types.
  this._optimize = {}; // optimizations:
    // hasRepeatedGroups: whether there are patterns like (:p1 ., :p2 .)*
  this.reset = function () {  }; // included in case we need it later.
  // const regexModule = this.options.regexModule || require("@shexjs/eval-simple-1err");
  const regexModule = this.options.regexModule || __webpack_require__(1670);

  let blankNodeCount = 0;
  const nextBNode = options.nextBNode || function () {
    return '_:b' + blankNodeCount++;
  };

  /* getAST - compile a traditional regular expression abstract syntax tree.
   * Tested but not used at present.
   */
  this.getAST = function () {
    return {
      type: "AST",
      shapes: Object.keys(this.schema._index.shapeExprs).reduce(function (ret, label) {
        ret[label] = {
          type: "ASTshape",
          expression: _compileShapeToAST(_ShExValidator.schema._index.shapeExprs[label].expression, [], _ShExValidator.schema)
        };
        return ret;
      }, {})
    };
  };

  /* indexTripleConstraints - compile regular expression and index triple constraints
   */
  this.indexTripleConstraints = function (expression) {
    // list of triple constraints from (:p1 ., (:p2 . | :p3 .))
    const tripleConstraints = [];

    if (expression)
      indexTripleConstraints_dive(expression);
    return tripleConstraints;

    function indexTripleConstraints_dive (expr) {
      if (expr.type === "TripleConstraint")
        tripleConstraints.push(expr)-1;

      else if (expr.type === "OneOf" || expr.type === "EachOf")
        expr.expressions.forEach(function (nested) {
          indexTripleConstraints_dive(nested);
        });

      else if (expr.type === "Inclusion")
        indexTripleConstraints_dive(schema.productions[expr.include]);

      else
        runtimeError("unexpected expr type: " + expr.type);
    };
  };

  this.validateShapeMap = function (db, shapeMap, depth, seen) {
    return shapeMap.map(pair => {
      let time = new Date();
      const res = this.validate(db, ShExTerm.ld2RdfJsTerm(pair.node), pair.shape, depth, seen); // really tracker and seen
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

  /* validate - test point in db against the schema for labelOrShape
   * depth: level of recurssion; for logging.
   */
  this.validate = function (db, point, labelOrShape, depth, seen) {
    // default to schema's start shape
    if (!labelOrShape || labelOrShape === config.Validator.Start) {
      if (!schema.start)
        runtimeError("start production not defined");
      labelOrShape = schema.start;
    }
    if (typeof labelOrShape !== "string")
      return this._validateShapeExpr(db, point, labelOrShape, "_: -start-", depth, seen);

    if (!(labelOrShape in this.schema._index.shapeExprs))
      runtimeError("shape " + labelOrShape + " not defined");

    const label = labelOrShape; // for clarity
    if (seen === undefined)
      seen = {};
    const seenKey = ShExTerm.rdfJsTerm2Turtle(point) + "@" + (label === Start ? "_: -start-" : label);
    if (seenKey in seen)
      return {
        type: "Recursion",
        node: rdfJsTerm2Ld(point),
        shape: label
      };
    seen[seenKey] = { point: point, shapeLabel: label };
    const ret = this._validateShapeDecl(db, point, schema._index.shapeExprs[label], label, depth, seen);
    delete seen[seenKey];
    return ret;
  }

  this._validateShapeDecl = function (db, point, shapeDecl, shapeLabel, depth, tracker, seen, subgraph) {
    return this._validateShapeExpr(db, point, shapeDecl.shapeExpr, shapeLabel, depth, tracker, seen, subgraph);
  }

  this._lookupShape = function (label) {
    if (!("shapes" in this.schema) || this.schema.shapes.length === 0) {
      runtimeError("shape " + label + " not found; no shapes in schema");
    } else if (label in index.shapeExprs) {
      return index.shapeExprs[label]
    } else {
      runtimeError("shape " + label + " not found in:\n" + Object.keys(index.shapeExprs || []).map(s => "  " + s).join("\n"));
    }
  }

  this._validateShapeExpr = function (db, point, shapeExpr, shapeLabel, depth, seen) {
    if ("known" in this && this.known.cached(point, shapeExpr))
      return this.known.cached(point, shapeExpr);
    let ret = null;
    if (point === "")
      throw Error("validation needs a valid focus node");
    if (typeof(shapeExpr) === "string") { // ShapeRef
      ret = this._validateShapeDecl(db, point, schema._index.shapeExprs[shapeExpr], shapeExpr, depth, seen);
    } else if (shapeExpr.type === "NodeConstraint") {
      const errors = this._errorsMatchingNodeConstraint(point, shapeExpr, null);
      ret = errors.length ? {
        type: "Failure",
        node: rdfJsTerm2Ld(point),
        shape: shapeLabel,
        errors: errors.map(function (miss) {
          return {
            type: "NodeConstraintViolation",
            shapeExpr: shapeExpr
          };
        })
      } : {
        type: "NodeConstraintTest",
        node: rdfJsTerm2Ld(point),
        shape: shapeLabel,
        shapeExpr: shapeExpr
      };
    } else if (shapeExpr.type === "Shape") {
      ret = this._validateShape(db, point, regexModule.compile(schema, shapeExpr),
                                 shapeExpr, shapeLabel, depth, seen);
    } else if (shapeExpr.type === "ShapeExternal") {
      ret = this.options.validateExtern(db, point, shapeLabel, depth, seen);
    } else if (shapeExpr.type === "ShapeOr") {
      const errors = [];
      ret = { type: "ShapeOrFailure", errors: errors };
      for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        const nested = shapeExpr.shapeExprs[i];
        const sub = this._validateShapeExpr(db, point, nested, shapeLabel, depth, seen);
        if ("errors" in sub)
          errors.push(sub);
        else {
          ret = { type: "ShapeOrResults", solution: sub };
          break;
        }
      }
    } else if (shapeExpr.type === "ShapeNot") {
      const sub = this._validateShapeExpr(db, point, shapeExpr.shapeExpr, shapeLabel, depth, seen);
      if ("errors" in sub)
          ret = { type: "ShapeNotResults", solution: sub };
        else
          ret = { type: "ShapeNotFailure", errors: sub };
    } else if (shapeExpr.type === "ShapeAnd") {
      const passes = [];
      ret = { type: "ShapeAndResults", solutions: passes };
      for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        const nested = shapeExpr.shapeExprs[i];
        const sub = this._validateShapeExpr(db, point, nested, shapeLabel, depth, seen);
        if ("errors" in sub) {
          ret = { type: "ShapeAndFailure", errors: sub };
          break;
        } else
          passes.push(sub);
      }
    } else
      throw Error("expected one of Shape{Ref,And,Or} or NodeConstraint, got " + JSON.stringify(shapeExpr));
    if ("known" in this)
      this.known.remember(point, shapeExpr, ret);
    return ret;
  }

  this._validateShape = function (db, point, regexEngine, shape, shapeLabel, depth, seen) {
    const _ShExValidator = this;

    // logging stuff
    if (depth === undefined)
      depth = 0;
    const padding = (new Array(depth + 1)).join("  "); // AKA "  ".repeat(depth);
    function _log () {
      if (!VERBOSE) { return; }
      console.log(padding + Array.prototype.join.call(arguments, ""));
    }

    let ret = null;
    const startAcionStorage = {}; // !!! need test to see this write to results structure.
    if ("startActs" in schema && !this.semActHandler.dispatchAll(schema.startActs, null, startAcionStorage))
      return null; // some semAct aborted !! return real error
    _log("validating <" + point + "> as <" + shapeLabel + ">");

    // const outgoing = indexNeighborhood(db.findByIRI(point, null, null, null).sort(byObject));
    // const incoming = indexNeighborhood(db.findByIRI(null, null, point, null).sort(bySubject));
    const neighborhood = []; // outgoing.triples.concat(incoming.triples); // @@ make fancy array holder.

    const constraintList = this.indexTripleConstraints(shape.expression);
    // const tripleList = triple2constraintList.reduce(function (ret, constraint, ord) {

    //   // subject and object depend on direction of constraint.
    //   const searchSubject = constraint.inverse ? null : point;
    //   const searchObject = constraint.inverse ? point : null;
    //   const index = constraint.inverse ? incoming : outgoing;

    //   // get triples matching predciate
    //   const matchPredicate = index.byPredicate[constraint.predicate] ||
    //     []; // empty list when no triple matches that constraint

    //   function _errorsByShapeLabel (focus, shapeLabel) {
    //     const sub = _ShExValidator.validate(db, focus, shapeLabel, depth + 1, seen);
    //     return "errors" in sub ? sub.errors : [];
    //   }
    //   function _errorsByShapeExpr (focus, shapeExpr) {
    //     const sub = _ShExValidator._validateShapeExpr(db, focus, shapeExpr, shapeLabel, depth, seen);
    //     return "errors" in sub ? sub.errors : [];
    //   }
    //   // strip to triples matching value constraints (apart from @<someShape>)
    //   const matchConstraints = _ShExValidator._triplesMatchingShapeExpr(
    //     matchPredicate,
    //     constraint.valueExpr,
    //     constraint.inverse,
    //     /* _ShExValidator.options.partition === "exhaustive" ? undefined : */ _errorsByShapeLabel,
    //     /* _ShExValidator.options.partition === "exhaustive" ? undefined : */ _errorsByShapeExpr
    //   );

    //   matchConstraints.hits.forEach(function (t) {
    //     ret.triple2constraintList[neighborhood.indexOf(t)].push(ord);
    //   });
    //   matchConstraints.misses.forEach(function (t) {
    //     ret.misses[neighborhood.indexOf(t.triple)] = {constraintNo: ord, errors: t.errors};
    //   });
    //   return ret;
    // }, { misses: {}, triple2constraintList:_seq(neighborhood.length).map(function () { return []; }) }); // start with [[],[]...]

    // _log("constraints by triple: ", JSON.stringify(tripleList.triple2constraintList));

    // const misses = tripleList.triple2constraintList.reduce(function (ret, constraints, ord) {
    //   if (constraints.length === 0 &&                       // matches no constraints
    //       ord < outgoing.triples.length &&                  // not an incoming triple
    //       ord in tripleList.misses &&                       // predicate matched some constraint(s)
    //       (shape.extra === undefined ||                     // not declared extra
    //        shape.extra.indexOf(neighborhood[ord].predicate) === -1)) {
    //     ret.push({tripleNo: ord, constraintNo: tripleList.misses[ord].constraintNo, errors: tripleList.misses[ord].errors});
    //   }
    //   return ret;
    // }, []);

    // const xp = crossProduct(tripleList.triple2constraintList);
    const partitionErrors = [];
    // while (misses.length === 0 && xp.next() && ret === null) {
    //   // caution: early continues
    for (let __once = 0; __once < 1; ++__once) {
      // const usedTriples = []; // [{s1,p1,o1},{s2,p2,o2}] implicated triples -- used for messages
      // const constraintMatchCount = // [2,1,0,1] how many triples matched a constraint
      //   _seq(neighborhood.length).map(function () { return 0; });
      // const tripleToConstraintMapping = xp.get(); // [0,1,0,3] mapping from triple to constraint

      // // Triples not mapped to triple constraints are not allowed in closed shapes.
      // if (shape.closed) {
      //   const firstSkippedTriple = tripleToConstraintMapping.indexOf(undefined);
      //   if (firstSkippedTriple !== -1 && firstSkippedTriple < outgoing.triples.length) {
      //     partitionErrors.push({
      //       errors: [
      //         {
      //           type: "ClosedShapeViolation",
      //           unexpectedTriples: tripleToConstraintMapping.reduce((ret, c, idx) => {
      //             if (idx < outgoing.triples.length && c === undefined)
      //               ret.push(outgoing.triples[idx]);
      //             return ret;
      //           }, [])
      //         }
      //       ]
      //     });
      //     continue; // closed shape violation.
      //   }
      // }

      // // Set usedTriples and constraintMatchCount.
      // tripleToConstraintMapping.forEach(function (tpNumber, ord) {
      //   if (tpNumber !== undefined) {
      //     usedTriples.push(neighborhood[ord]);
      //     ++constraintMatchCount[tpNumber];
      //   }
      // });

      // // Pivot to triples by constraint.
      // function _constraintToTriples () {
      //   const cll = triple2constraintList.length;
      //   return tripleToConstraintMapping.slice().
      //     reduce(function (ret, c, ord) {
      //       if (c !== undefined)
      //         ret[c].push(ord);
      //       return ret;
      //     }, _seq(cll).map(function () { return []; }));
      // }

      // tripleToConstraintMapping.slice().sort(function (a,b) { return a-b; }).filter(function (i) { // sort constraint numbers
      //   return i !== undefined;
      // }).map(function (n) { return n + " "; }).join(""); // e.g. 0 0 1 3 

      function _recurse (point, shapeLabel) {
        return _ShExValidator.validate(db, point, shapeLabel, depth+1, seen);
      }
      function _direct (point, shapeExpr) {
        return _ShExValidator._validateShapeExpr(db, point, shapeExpr, shapeLabel, depth, seen);
      }
      function _testExpr (term, valueExpr, recurse, direct) {
        return _ShExValidator._errorsMatchingShapeExpr(term, valueExpr, recurse, direct)
      }
      const results = regexEngine.match(db, point, constraintList, _synthesize, /*_constraintToTriples(), tripleToConstraintMapping, */ neighborhood, _recurse, _direct, this.semActHandler, _testExpr, null);
      function _synthesize (constraintNo, min, max, neighborhood) {
        // console.log({"constraintNo": constraintNo, "min": min, "max": max, "triple2constraintList": triple2constraintList, "db": db, "point": point, "regexEngine": regexEngine, "shape": shape, "shapeLabel": shapeLabel, "depth": depth, "seen": seen});
        const tc = constraintList[constraintNo];
        const curSubjectx = {cs: point};
        const target = new config.rdfjs.Store();
        mapper.visitTripleConstraint(tc, curSubjectx, nextBNode, target, { _maybeSet: () => {} }, _ShExValidator.schema, db, _recurse, _direct, _testExpr);
        const oldLen = neighborhood.length;
        const created = [... target.match()];
        neighborhood.push.apply(neighborhood, created);
        if (false) {}
        return Array.apply(null, {length: created.length}).map((_, idx)=>{ return idx+oldLen});
        // if ("semActs" in tc) {
        //   tc.semActs.forEach(function (semAct) {
        //     if (semAct.name === ShExMap.url) {
        //       const prefixes = _ShExValidator.schema.prefixes;
              
        //     }
        //   });
        // }
        // console.dir();
        return [];
      }
      function mapper_visitTripleConstraint (expr) {
        const mapExts = (expr.semActs || []).filter(function (ext) { return ext.name === ShExMap.url; });
        if (mapExts.length) {
          mapExts.forEach(function (ext) {
            const code = ext.code;
            const m = code.match(pattern);

            let tripleObject;
            if (m) { 
              const arg = m[1] ? m[1] : P(m[2] + ":" + m[3]); 
              if (!_.isUndefined(bindings[arg])) {
                tripleObject = bindings[arg];
              }
            }

            // Is the arg a function? Check if it has parentheses and ends with a closing one
            if (_.isUndefined(tripleObject)) {
              if (/[ a-zA-Z0-9]+\(/.test(code)) 
                  tripleObject = extensions.lower(code, bindings, schema.prefixes);
            }

            if (_.isUndefined(tripleObject)) console.warn('Not in bindings: ',code);
            add(curSubject, expr.predicate, tripleObject);
          });

        } else if ("values" in expr.valueExpr && expr.valueExpr.values.length === 1) {
          add(curSubject, expr.predicate, expr.valueExpr.values[0]);

        } else {
          const oldSubject = curSubject;
          curSubject = B();
          add(oldSubject, expr.predicate, curSubject);
          this._maybeSet(expr, { type: "TripleConstraint" }, "TripleConstraint",
                         ["inverse", "negated", "predicate", "valueExprRef", "valueExpr",
                          "min", "max", "annotations", "semActs"])
          curSubject = oldSubject;
        }
      };

      // {// testing parity between two engines
      //   const nfa = require("@shexjs/eval-simple-1err").compile(schema, shape);
      //   const fromNFA = nfa.match(db, point, triple2constraintList, _constraintToTriples(), tripleToConstraintMapping, neighborhood, _recurse, this.semActHandler, _testExpr, null);
      //   if ("errors" in fromNFA !== "errors" in results)
      //     { throw Error(JSON.stringify(results) + " vs " + JSON.stringify(fromNFA)); }
      // }
      if ("errors" in results) {
        partitionErrors.push({
          errors: results.errors
        });
        if (_ShExValidator.options.partition !== "exhaustive")
          break;
        else
          continue;
      }

      // _log("post-regexp " + usedTriples.join(" "));

      const possibleRet = { type: "ShapeTest", node: rdfJsTerm2Ld(point), shape: shapeLabel };
      if (Object.keys(results).length > 0) // only include .solution for non-empty pattern
        possibleRet.solution = results;
      if ("semActs" in shape &&
          !this.semActHandler.dispatchAll(shape.semActs, results, possibleRet)) {
        // some semAct aborted
        partitionErrors.push({
          errors: [ { type: "SemActFailure", errors: [{ type: "UntrackedSemActFailure" }] } ]
        });
        if (_ShExValidator.options.partition !== "exhaustive")
          break;
        else
          continue;
      }
      // _log("final " + usedTriples.join(" "));

      ret = possibleRet;
      // alts.push(tripleToConstraintMapping);
    }
    if (ret === null/* !! && this.options.diagnose */) {
      const missErrors = [];// misses.map(function (miss) {
      //   const t = neighborhood[miss.tripleNo];
      //   return {
      //     type: "TypeMismatch",
      //     triple: {subject: t.subject, predicate: t.predicate, object: rdfJsTerm2Ld(t.object)},
      //     constraint: triple2constraintList[miss.constraintNo],
      //     errors: miss.errors
      //   };
      // });
      ret = {
        type: "Failure",
        node: rdfJsTerm2Ld(point),
        shape: shapeLabel,
        errors: missErrors.concat(partitionErrors.length === 1 ? partitionErrors[0].errors : partitionErrors) 
      };
    }

    if (VERBOSE) { // remove N3jsTripleToString
      neighborhood.forEach(function (t) {
        delete t.toString;
      });
    }
    if ("startActs" in schema && depth === 0) {
      ret.startActs = schema.startActs;
    }
    _log("</" + shapeLabel + ">");
    return ret;
  };

  this._triplesMatchingShapeExpr = function (triples, valueExpr, inverse, recurse, direct) {
    const _ShExValidator = this;
    const misses = [];
    const hits = [];
    triples.forEach(function (triple) {
      const value = inverse ? triple.subject : triple.object;
      const errors = valueExpr === undefined ?
          [] :
          _ShExValidator._errorsMatchingShapeExpr(value, valueExpr, recurse, direct);
      if (errors.length === 0) {
        hits.push(triple);
      } else if (hits.indexOf(triple) === -1) {
        misses.push({triple: triple, errors: errors});
      }
    });
    return { hits: hits, misses: misses };
  }
  this._errorsMatchingShapeExpr = function (value, valueExpr, recurse, direct) {
    const _ShExValidator = this;
    if (typeof(valueExpr) === "string") { // ShapeRef
      return recurse ? recurse(value, valueExpr) : [];
    } else if (valueExpr.type === "NodeConstraint") {
      return this._errorsMatchingNodeConstraint(value, valueExpr, null);
    } else if (valueExpr.type === "Shape") {
      return direct === undefined ? [] : direct(value, valueExpr);
    } else if (valueExpr.type === "ShapeOr") {
      let ret = [];
      for (let i = 0; i < valueExpr.shapeExprs.length; ++i) {
        const nested = _ShExValidator._errorsMatchingShapeExpr(value, valueExpr.shapeExprs[i], recurse, direct);
        if (nested.length === 0)
          return nested;
        ret = ret.concat(nested);
      }
      return ret;
    } else if (valueExpr.type === "ShapeAnd") {
      return valueExpr.shapeExprs.reduce(function (ret, nested, iter) {
        return ret.concat(_ShExValidator._errorsMatchingShapeExpr(value, nested, recurse, direct, true));
      }, []);
    } else {
      throw Error("unknown value expression type '" + valueExpr.type + "'");
    }
  };

  /* _errorsMatchingNodeConstraint - return whether the value matches the value
   * expression without checking shape references.
   */
  this._errorsMatchingNodeConstraint = function (value, valueExpr, recurse) {
    const errors = [];
    const label = value.value;
    const dt = value.termType === "Literal" ? value.datatype.value : null;
    const numeric = integerDatatypes.indexOf(dt) !== -1 ? XSD + "integer" : numericDatatypes.indexOf(dt) !== -1 ? dt : undefined;

    function validationError () {
      const errorStr = Array.prototype.join.call(arguments, "");
      errors.push("Error validating " + ShExTerm.rdfJsTerm2Turtle(value) + " as " + JSON.stringify(valueExpr) + ": " + errorStr);
      return false;
    }
    // if (negated) ;
    if (false) {} else {
      if ("nodeKind" in valueExpr) {
        if (["iri", "bnode", "literal", "nonliteral"].indexOf(valueExpr.nodeKind) === -1) {
          validationError("unknown node kind '" + valueExpr.nodeKind + "'");
        }
        if (value.termType === "BlankNode") {
          if (valueExpr.nodeKind === "iri" || valueExpr.nodeKind === "literal") {
            validationError("blank node found when " + valueExpr.nodeKind + " expected");
          }
        } else if (value.termType === "Literal") {
          if (valueExpr.nodeKind !== "literal") {
            validationError("literal found when " + valueExpr.nodeKind + " expected");
          }
        } else if (valueExpr.nodeKind === "bnode" || valueExpr.nodeKind === "literal") {
          validationError("iri found when " + valueExpr.nodeKind + " expected");
        }
      }

      if (valueExpr.datatype  && valueExpr.values) validationError("found both datatype and values in " + valueExpr);

      if (valueExpr.datatype) {
        if (value.termType !== "Literal") {
          validationError("mismatched datatype: " + JSON.stringify(rdfJsTerm2Ld(value)) + " is not a literal with datatype " + valueExpr.datatype);
        }
        else if (value.datatype.value !== valueExpr.datatype) {
          validationError("mismatched datatype: " + value.datatype.value + " !== " + valueExpr.datatype);
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
        if (value.termType === "Literal" && valueExpr.values.reduce((ret, v) => {
          if (ret) return true;
          const ld = rdfJsTerm2Ld(value);
          if (v.type === "Language") {
            return v.languageTag === ld.language; // @@ use equals/normalizeTest
          }
          if (!(typeof v === "object" && "value" in v)) // don't check for equivalent term if not a simple literal
            return false;
          return v.value === label
            && (!("type" in v) || v.type === value.datatype.value)
            && (!("language" in v) || v.language === value.language);
        }, false)) {
          // literal match
        } else if (valueExpr.values.indexOf(label) !== -1) {
          // trivial match
        } else {
          if (!(valueExpr.values.some(function (valueConstraint) {
            if (typeof valueConstraint === "object" && !("value" in valueConstraint)) { // i.e. not a simple term
              if (!("type" in valueConstraint))
                runtimeError("expected "+JSON.stringify(valueConstraint)+" to have a 'type' attribute.");
              const ExpectedTypePattern = /(Iri|Literal|Language)(Stem)?(Range)?/;
              const matchType = valueConstraint.type.match(ExpectedTypePattern);
              if (!matchType)
                runtimeError("expected type attribute '" + valueConstraint.type + "' to match " + ExpectedTypePattern + ".");
              const [undefined, valType, isStem, isRange] = matchType;
              if (valType === 'Iri') {
                if (value.termType !== 'NamedNode')
                  return false;
              } else {
                if (value.termType !== 'Literal')
                  return false;
              }

              /* expect N3.js literals with {Literal,Language}StemRange
               *       or non-literals with IriStemRange
               */
              function normalizedTest (val, ref, func) {
                if (["Literal", "Language"].indexOf(valType) !== -1) { // val.termType === "Literal"
                  if (["LiteralStem", "LiteralStemRange"].indexOf(valueConstraint.type) !== -1) {
                    return func(val.value, ref);
                  } else if (["LanguageStem", "LanguageStemRange"].indexOf(valueConstraint.type) !== -1) {
                    return func(val.language || null, ref);
                  } else {
                    return validationError("literal " + JSON.stringify(val) + " not comparable with non-literal " + ref);
                  }
                } else {
                  if (["IriStem", "IriStemRange"].indexOf(valueConstraint.type) === -1) {
                    return validationError("nonliteral " + JSON.stringify(val) + " not comparable with literal " + JSON.stringify(ref));
                  } else {
                    return func(val.value, ref);
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
            validationError("value " + label + " not found in set " + JSON.stringify(valueExpr.values));
          }
        }
      }
    }

    if ("pattern" in valueExpr) {
      const regexp = "flags" in valueExpr ?
	  new RegExp(valueExpr.pattern, valueExpr.flags) :
	  new RegExp(valueExpr.pattern);
      if (!(label.match(regexp)))
        validationError("value " + label + " did not match pattern " + valueExpr.pattern);
    }

    Object.keys(stringTests).forEach(function (test) {
      if (test in valueExpr && !stringTests[test](label, valueExpr[test])) {
        validationError("facet violation: expected " + test + " of " + valueExpr[test] + " but got " + label);
      }
    });

    Object.keys(numericValueTests).forEach(function (test) {
      if (test in valueExpr) {
        if (numeric) {
          if (!numericValueTests[test](numericParsers[numeric](label, validationError), valueExpr[test])) {
            validationError("facet violation: expected " + test + " of " + valueExpr[test] + " but got " + label);
          }
        } else {
          validationError("facet violation: numeric facet " + test + " can't apply to " + label);
        }
      }
    });

    Object.keys(decimalLexicalTests).forEach(function (test) {
      if (test in valueExpr) {
        if (numeric === XSD + "integer" || numeric === XSD + "decimal") {
          if (!decimalLexicalTests[test](""+numericParsers[numeric](label, validationError), valueExpr[test])) {
            validationError("facet violation: expected " + test + " of " + valueExpr[test] + " but got " + label);
          }
        } else {
          validationError("facet violation: numeric facet " + test + " can't apply to " + label);
        }
      }
    });
    const ret = {
      type: null,
      focus: rdfJsTerm2Ld(value),
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
        if (ret && semAct.name in _semActHanlder.handlers) {
          const code = "code" in semAct ? semAct.code : _ShExValidator.options.semActs[semAct.name];
          const existing = "extensions" in resultsArtifact && semAct.name in resultsArtifact.extensions;
          const extensionStorage = existing ? resultsArtifact.extensions[semAct.name] : {};
          ret = ret && _semActHanlder.handlers[semAct.name].dispatch(code, ctx, extensionStorage);
          if (!existing && Object.keys(extensionStorage).length > 0) {
            if (!("extensions" in resultsArtifact))
              resultsArtifact.extensions = {};
            resultsArtifact.extensions[semAct.name] = extensionStorage;
          }
          return ret;
        }
        return ret;
      }, true);
    }
  };
}

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
        _seq(max - min).reduce(function (ret, elt, ord) {
          return ord === 0 ?
            new Choice([expr, new Epsilon]) :
            new Choice([new EachOf([expr, ret]), new Epsilon]);
        }, undefined);

      const reqd = min !== 0 ?
        new EachOf(_seq(min).map(function (ret) {
          return expr; // @@ something with ret
        }).concat(opts)) : opts;
      return reqd;
    }

    if (expr.type === "TripleConstraint") {
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

    else if (expr.type === "Inclusion") {
      const included = schema._index.shapeExprs[expr.include].expression;
      return _compileExpression(included, schema);
    }

    else throw Error("unexpected expr type: " + expr.type);
  }

  return expression ? _compileExpression(expression, schema) : new Epsilon();
}

// http://stackoverflow.com/questions/9422386/lazy-cartesian-product-of-arrays-arbitrary-nested-loops
function crossProduct(sets) {
  const n = sets.length, carets = [], args = null;

  function init() {
    args = [];
    for (let i = 0; i < n; i++) {
      carets[i] = 0;
      args[i] = sets[i][0];
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
    const i = n - 1;
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
      args[i] = sets[i][0];
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
    return n.termType === "Literal" ?
      [ "http://www.w3.org/2001/XMLSchema#integer",
        "http://www.w3.org/2001/XMLSchema#float",
        "http://www.w3.org/2001/XMLSchema#double"
      ].indexOf(n.datatype.value) !== -1 ?
      parseInt(n.value) :
      n :
    n.termType === "BlankNode" ?
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
    triples: triples,
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

/* bySubject - sort triples by subject following SPARQL partial ordering.
 */
function bySubject (t1, t2) {
  // if (t1.predicate !== t2.predicate) // sort predicate first for easier scanning of results
  //   return t1.predicate > t2.predicate;
  const l = t1.subject, r = t2.subject;
  const lprec = l.termType === "BlankNode" ? 1 : l.termType === "Literal" ? 2 : 3;
  const rprec = r.termType === "BlankNode" ? 1 : r.termType === "Literal" ? 2 : 3;
  return lprec === rprec ? l > r : lprec > rprec;
}

/* byObject - sort triples by object following SPARQL partial ordering.
 */
function byObject (t1, t2) {
  // if (t1.predicate !== t2.predicate) // sort predicate first for easier scanning of results
  //   return t1.predicate > t2.predicate;
  const l = t1.object, r = t2.object;
  const lprec = l.termType === "BlankNode" ? 1 : l.termType === "Literal" ? 2 : 3;
  const rprec = r.termType === "BlankNode" ? 1 : r.termType === "Literal" ? 2 : 3;
  return lprec === rprec ? l > r : lprec > rprec;
}

/* Return a list of n ""s.
 *
 * Note that Array(n) on its own returns a "sparse array" so Array(n).map(f)
 * never calls f.
 */
function _seq (n) {
  return n === 0 ?
    [] :
    Array(n).join(" ").split(/ /); // hahaha, javascript, you suck.
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
  const e = new Error("Runtime error: " + errorStr);
  Error.captureStackTrace(e, runtimeError);
  throw e;
}

  return { // node environment
    construct: ShExMaterializer_constructor,
    options: InterfaceOptions
  };
}


// ## Exports

// Export the `ShExMaterializer` class as a whole.
if (true)
  module.exports = ShExMapMaterializerCjsModule;


/***/ }),

/***/ 1670:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const {rdfJsTerm2Ld} = __webpack_require__(1101);

const NFAXVal1ErrMaterializer = (function () {

  const ShExTerm = __webpack_require__(1101);

  const Split = "<span class='keyword' title='Split'>|</span>";
  const Rept  = "<span class='keyword' title='Repeat'>×</span>";
  const Match = "<span class='keyword' title='Match'>␃</span>";
const UNBOUNDED = -1;
  /* compileNFA - compile regular expression and index triple constraints
   */
function compileNFA (schema, shape) {
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

        if (expr.type === "TripleConstraint") {
          s = State_make(expr, []);
          states[s].stack = stack;
          return {start: s, tail: [s]};
          // maybeAddRept(s, [s]);
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

        else if (expr.type === "Inclusion") {
          const included = schema.productions[expr.include];
          return walkExpr(included, stack);
        }

        runtimeError("unexpected expr type: " + expr.type);
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
        let x = "";
        if ("min" in obj) x += obj.min;
        if ("max" in obj) x += "," + obj.max;
        return x ? "{" + x + "}" : "";
      }
      function junct (j) {
        let id = known[j.type].indexOf(j);
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

  function rbenx_match (graph, node, constraintList, synthesize, /* constraintToTripleMapping, tripleToConstraintMapping, */ neighborhood, recurse, direct, semActHandler, checkValueExpr, trace) {
      const rbenx = this;
      let clist = [], nlist = []; // list of {state:state number, repeats:stateNo->repetitionCount}

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

      function addstate (list, stateNo, thread, seen) {
        seen = seen || [];
        const seenkey = stateString(stateNo, thread.repeats);
        if (seen.indexOf(seenkey) !== -1)
          return;
        seen.push(seenkey);

        const s = rbenx.states[stateNo];
        if (s.c === Split) {
          return s.outs.reduce((ret, o, idx) => {
            return ret.concat(addstate(list, o, thread, seen));
          }, []);
        // } else if (s.c.type === "OneOf" || s.c.type === "EachOf") { // don't need Rept
        } else if (s.c === Rept) {
          let ret = [];
          // matched = [matched].concat("Rept" + s.expr);
          if (!(stateNo in thread.repeats))
            thread.repeats[stateNo] = 0;
          const repetitions = thread.repeats[stateNo];
          // add(r < s.min ? outs[0] : r >= s.min && < s.max ? outs[0], outs[1] : outs[1])
          if (repetitions < s.max)
            ret = ret.concat(addstate(list, s.outs[0], incrmRepeat(thread, stateNo), seen)); // outs[0] to repeat
          if (repetitions >= s.min && repetitions <= s.max)
            ret = ret.concat(addstate(list, s.outs[1], resetRepeat(thread, stateNo), seen)); // outs[1] when done
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

      function localExpect999 (list) {
        return list.map(st => {
          const s = rbenx.states[st.state]; // simpler threads are a list of states.
          return renderAtom(s.c, s.negated);
        });
      }

      if (rbenx.states.length === 1)
        return matchedToResult([], constraintList, neighborhood, recurse, direct, semActHandler, checkValueExpr);

      let chosen = null;
      // const dump = nfaToString();
      // console.log(dump.nfa(this.states, this.start));
      addstate(clist, this.start, {repeats:{}, avail:[], matched:[], stack:[], errors:[]});
      while (clist.length) {
        nlist.length = 0;
        if (trace)
          trace.push({threads:[]});
        for (let threadno = 0; threadno < clist.length; ++threadno) {
          const thread = clist[threadno];
          if (thread.state === rbenx.end)
            continue;
          const state = rbenx.states[thread.state];
          const nlistlen = nlist.length;
          const constraintNo = constraintList.indexOf(state.c);
          // may be Accept!
          let min = "min" in state.c ? state.c.min : 1;
          let max = "max" in state.c ? state.c.max === UNBOUNDED ? Infinity : state.c.max : 1;
          if ("negated" in state.c && state.c.negated)
            min = max = 0;
          if (thread.avail[constraintNo] === undefined)
            thread.avail[constraintNo] = synthesize(constraintNo, min, max, neighborhood);
          const taken = thread.avail[constraintNo].splice(0, max);
          if (taken.length >= min) {
            do {
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
                addstate(nlist, o, thread);
              });
            } while ((function () {
              if (thread.avail[constraintNo].length > 0 && taken.length < max) {
                taken.push(thread.avail[constraintNo].shift());
                return true; // stay in look to take more.
              } else {
                return false; // no more to take or we're already at max
              }
            })());
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
              // elt.matched.reduce((ret, m) => {
              //   return ret + m.triples.length; // count matched triples
              // }, 0) === tripleToConstraintMapping.reduce((ret, t) => {
              //   return t === undefined ? ret : ret + 1; // count expected
              // }, 0);
                true;
          return ret !== null ? ret : (elt.state === rbenx.end && matchedAll) ? elt : null;
        }, null)
        if (longerChosen)
          chosen = longerChosen;
        // if (longerChosen !== null)
        //   console.log(JSON.stringify(matchedToResult(longerChosen.matched)));
      }
      if (chosen === null)
        return reportError(localExpect(clist, rbenx.states));
      function reportError (errors) { return {
        type: "Failure",
        node: node,
        errors: errors
      } }
      function localExpect (clist, states) {
        const lastState = states[states.length - 1];
        return clist.map(t => {
          const c = rbenx.states[t.state].c;
          // if (c === Match)
          //   return { type: "EndState999" };
          const valueExpr = extend({}, c.valueExpr);
          if ("reference" in valueExpr) {
            const ref = valueExpr.reference;
            if (ref.termType === "BlankNode")
              valueExpr.reference = schema.shapes[ref];
          }
          return extend({
            type: lastState.c.negated ? "NegatedProperty" :
              t.state === rbenx.end ? "ExcessTripleViolation" :
              "MissingProperty",
            property: lastState.c.predicate
          }, Object.keys(valueExpr).length > 0 ? { valueExpr: valueExpr } : {});
        });
      }
      // console.log("chosen:", dump.thread(chosen));
      return "errors" in chosen.matched ?
        chosen.matched :
        matchedToResult(chosen.matched, constraintList, neighborhood, recurse, direct, semActHandler, checkValueExpr);
    }

    function matchedToResult (matched, constraintList, neighborhood, recurse, direct, semActHandler, checkValueExpr) {
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
              if (!semActHandler.dispatchAll(m.stack[mis].c.semActs, "???", ptr))
                throw { type: "SemActFailure", errors: [{ type: "UntrackedSemActFailure" }] };
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
        if ("productionLabel" in m.c)
          ptr.productionLabel = m.c.productionLabel;
        ptr.solutions = m.triples.map(tno => {
          const triple = neighborhood[tno];
          const ret = {
            type: "TestedTriple",
            subject: rdfJsTerm2Ld(triple.subject),
            predicate: rdfJsTerm2Ld(triple.predicate),
            object: rdfJsTerm2Ld(triple.object)
          };

          function diver (focus, shape, dive) {
            const sub = dive(focus, shape);
            if ("errors" in sub) {
              // console.dir(sub);
              const err = {
                type: "ReferenceError", focus: focus,
                shape: shape, errors: sub
              };
              if (shapeLabel.termType === "BlankNode")
                err.referencedShape = shape;
              return [err];
            }
            if ("solution" in sub && Object.keys(sub.solution).length !== 0 ||
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
          if ("valueExpr" in ptr) {
            const sub = checkValueExpr(ptr.inverse ? triple.subject : triple.object, ptr.valueExpr, diveRecurse, diveDirect);
            if ("errors" in sub)
              [].push.apply(errors, sub.errors);
          }

          if (errors.length === 0 && "semActs" in m.c &&
              !semActHandler.dispatchAll(m.c.semActs, triple, ret))
            errors.push({ type: "SemActFailure", errors: [{ type: "UntrackedSemActFailure" }] }) // some semAct aborted
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

return {
  name: "eval-simple-1err",
  description: "simple regular expression engine with n out states",
  compile: compileNFA
};
})();
// Export the `ShExValidator` class as a whole.
if (true)
  module.exports = NFAXVal1ErrMaterializer;


/***/ }),

/***/ 1961:
/***/ ((module) => {

/**
 * A file with common utility functions used by the extensions.
 */

const ExtensionUtils = (function () {

return {
    // Collapse multiple spaces into one
    collapseSpaces:  function(string) { 
        return string.replace(/  +/g, ' '); 
    },

    // Remove starting and trailing quotes - does not affect center quotes
    trimQuotes: function(string) {

        // empty string or 1 char string cannot have matching quotes
        if (string === undefined || string.length < 2) return string;

        // Starting with single or double quote?
        if (string[0] === '"' || string[0] === "'") {

            // first and last char ar matching pair of either single or double quotes
            if (string[0] === string[string.length-1]) 
               return string.substring(1, string.length-1);
        }
       
        return string;
    },

    // Unescape the backslash characters in a string (e.g., in a URL)
    unescapeMetaChars: function(string) { 
        return string.replace(/\\([\/^$])/g, "$1"); 
    }
}
})();

if (true)
  module.exports = ExtensionUtils;


/***/ }),

/***/ 1386:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * This file is the main entry point into calling an extension. 
 * It determines which extension is requested, and then, assuming
 * the extension is valid, it forwards the request on
 */
const Extensions = (function () {

// Known extensions
const hashmap_extension = __webpack_require__(9445);
const regex_extension = __webpack_require__(7521);

const utils = __webpack_require__(1961);

/**
 * Given a map directive that contains an extension of format 
 *          extensionName(args) 
 * split it up for easy access to extenion name and arguments separately 
 * 
 * @param a map directive with an extension call embedded
 *
 * @return an object with members:  extension name and the arguments.
 */
function extensionDef(mapDirective) { 
    if (mapDirective === undefined)
        throw Error("Invalid extension function: " + mapDirective + "!");

    // Get the extension name and argument(s)  
    mapDirective = mapDirective.trim(); // Strip any leading or trailing white space
    const startArgs = mapDirective.indexOf('(', 0);
    const endArgs = mapDirective.lastIndexOf(')');
    if (startArgs < 2 || endArgs < 4 || endArgs <= startArgs+1 || endArgs != mapDirective.length-1) 
        throw Error("Invalid extension function: " + mapDirective + "!");

    return { name:  mapDirective.substring(0, startArgs),
             args:  mapDirective.substring(startArgs+1, endArgs) }; 
}

function lift(mapDirective, input, prefixes) {
    const extDef = extensionDef(mapDirective);
    switch (extDef.name) {
        case 'hashmap': 
          return hashmap_extension.lift(mapDirective, input, prefixes, extDef.args);

        case 'regex': 
          return regex_extension.lift(mapDirective, input, prefixes, extDef.args);

        case 'test': 
          return mapDirective;

        default: 
          throw Error('Unknown extension: '+ mapDirective+'!');
    }
}

function lower(mapDirective, bindings, prefixes) {
    const extDef = extensionDef(mapDirective);
    switch (extDef.name) {
        case 'hashmap': 
          return hashmap_extension.lower(mapDirective, bindings, prefixes, extDef.args);

        case 'regex': 
          return regex_extension.lower(mapDirective, bindings, prefixes, extDef.args);

        case 'test': 
          return mapDirective;
      
        default: 
          throw Error('Unknown extension: ' + mapDirective+'!');
    }
}

return {
    lift: lift,
    lower: lower,
};
})();

if (true)
  module.exports = Extensions;


/***/ }),

/***/ 9445:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * The hashmap extension expects a hash map directive in JSON format like: 
 *    hashmap(variable, {"D": "Divorced", "M": "Married", "S": "Single", "W": "Widowed"}) 
 * And returns the appropriate map value based on the input.
 */
const HashmapExtension = (function () {

const extUtils = __webpack_require__(1961);

/**
 * This function will parse the args string to find the target variable name and 
 * JSON hashmap arguments we'll use for doing the hash mapping.  
 * 
 * @param args a string with the extension arguments
 * 
 * @return an object of format: {const: varname, map: hashmap}
 */
function parseArgs(mapDirective, args) {

    // Do we have anything in args? 
    if (args === undefined || args.length === 0) throw Error("Hashmap extension requires a variable name and map as arguments, but found none!");

    // get the variable name and hashmap
    const matches = /^[ ]*([\w:<>]+)[ ]*,[ ]*({.*)$/s.exec(args);
    if (matches === null || matches.length < 3) throw Error("Hashmap extension requires a variable name and map as arguments, but found: " + mapDirective + "!");

    const varName = matches[1]; 
    const hashString = matches[2];

    let map;
    try { 
        map = JSON.parse(hashString);
        if (Object.keys(map).length === 0) throw Error("Empty hashmap!");
    } catch(e) { 
        throw Error("Hashmap extension unable to parse map in " + mapDirective+"!" + e.message);
    } 

    // Verify that the hash key/value pairs are unique
    const values = Object.values(map);
  if (values.length != [...new Set(values)].length) throw Error('Hashmap extension requires unique key/value pairs!');

    return { varName: varName,
             hash: map };
         
}

/**
 * If the variable name is a prefixed name (format prefix:name), expand it 
 * to the full name; returns the original variable name if not prefixed.
 * 
 * @param varName variable name
 * @param prefixes a list of known prefixes in <short name>: <expanded name>
 * 
 * @return the variable name, expanded if it had a prefix on it
 */
function expandedVarName(varName, prefixes) { 
    const varComponents = varName.match(/^([\w]+):(.*)$/);

    if (varComponents !== null && varComponents.length == 3) {
        const prefix = varComponents[1];
        const name = varComponents[2];

        // Verify we've got a good const name, prefix, and prefix value
        if (prefix.length === 0 || name.length === 0) throw Error("Hashmap extension given invalid target variable name " + varName);
        if (!(prefix in prefixes)) throw Error("Hashmap extension given undefined variable prefix " + prefix);

        expandedName = prefixes[prefix] + name; 
    } else {
        // Not a prefixed name
        expandedName = varName;
    }

    return expandedName;
}

/**
 * Invert the value by finding the hash key that matches the value
 * This assumes key/value pairs are unique
 *
 * @param hash hash object whose attributes should be traversed.
 * @param value scalar value to look for
 */
function invert(hash, value) {

   const key = Object.keys(hash).find(key => value === hash[key])

   if (!key)
       throw Error("Hashmap extension was unable to invert the value " 
                   + value + " with map " + JSON.stringify(hash, {depth: null}) +"!");
   return key;
}
 
function lift(mapDirective, input, prefixes, args) {

    // Parse to get the target const name and the hash map
    const mapArgs = parseArgs(mapDirective, args);
    
    // Get the expanded const name if it was prefixed
    const expandedName = expandedVarName(mapArgs.varName, prefixes);

    const key = extUtils.trimQuotes(input);
    if (key.length === 0) throw Error('Hashmap extension has no input');
    
    const mappedValue = mapArgs.hash[key];
    return { [expandedName]: mappedValue };
}

function lower(mapDirective, bindings, prefixes, args) {
    const mapArgs = parseArgs(mapDirective, args);

    // Get the expanded const name if it was prefixed
    const expandedName = expandedVarName(mapArgs.varName, prefixes);

    const mappedValue = extUtils.trimQuotes( bindings.get(expandedName) );
    if (mappedValue === undefined) throw Error('Unable to find mapped value for ' + mapArgs.varName);

    // Now use the mapped Value to find the original value and clean it up if we get something
    const inverseValue = invert(mapArgs.hash, mappedValue);
    if (inverseValue.length !== 0) {
        return extUtils.unescapeMetaChars( extUtils.collapseSpaces(inverseValue) );
    }

    return inverseValue; 
}

return {
  lift: lift,
  lower: lower
};
})();

if (true)
  module.exports = HashmapExtension;


/***/ }),

/***/ 7521:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * The regex extension expects a map directive like: 
 *    regex(/<regex>/) 
 * where the regex should specify one or more target variables, e.g.,
 *    regex(/"(?<dem:family>[a-zA-Z'\\-]+),\\s*(?<dem:given>[a-zA-Z'\\-\\s]+)"/)
 * The expression will be applied and the results returned as a hash.
 */

const RegexExtension = (function () {
const extUtils = __webpack_require__(1961);

const captureGroupName = "(\\?<(?:[a-zA-Z:]+|<[^>]+>)>)";

/**
 * Given a variable name, looks up its prefix, and  replacing the shorthand
 * prefix name in the variable with l name.
 *
 * @param shortPrefixedVar a short prefixed variable name to expand e.g., dem:id
 * @param prefixes a list of the prefix short name/full name mappings
 *
 * @return the fully expanded name
 */
function applyPrefix(varName, prefixes) {

  // Figure out what variable syntax we have.  It could be <varname> or <prefix:varname>
  const matches = varName.match(/^ *(?:<([^>]*)>|([^:]*):([^ ]*)) *$/);
  if (matches === null)
    throw Error("variable \"" + varName + "\" did not match expected pattern!");

  let expandedVarName;
  if (matches[1]) {
    // Got <varname>
    expandedVarName = matches[1];

  } else if (matches[2] in prefixes) {
    // prefixed const e.g., dem:id
    expandedVarName = prefixes[matches[2]] + matches[3];

  } else
    // unknown prefix
    throw Error("Unknown prefix " + matches[2] + " in \"" + varName + "\"!");

  return expandedVarName;
}

/**
 * Expand the variable passed in shortPrefixedVar, and add it to a list of the known
 * fully expanded variables.
 *
 * @param shortPrefixedVar a short prefixed variable name e.g., ?<dem:id>
 * @param expandedVars the list of known variables
 * @param prefixes the prefix hash that maps short prefix name to the full URI prefix
 *
 * @return the fully expanded variable name
 */
function buildExpandedVars(shortPrefixedVar, expandedVars, prefixes) {

    // shortPrefixedVar will look like this: ?<test:string> - strip off the ?< and > chars
    const v = extUtils.unescapeMetaChars( shortPrefixedVar.substr(2, shortPrefixedVar.length - 3) );
    const expandedVarName = applyPrefix(v, prefixes);

  if (expandedVarName in expandedVars)
        throw Error("unable to process prefixes in " + expandedVarName);

    // Add this new const to the list and return the expanded const name
    expandedVars.push(expandedVarName);

    return expandedVarName;
}

/**
 * Strip any starting and trailing / char, ignoring leading & trailing whitespace
 */
function trimPattern(args) { 
    if (/^\s*\/.*\/\s*$/.test(args)) {   
        args = /^\s*\/(.*)\/\s*$/.exec(args)[1];
        if (args.length < 1) throw Error(mapDirective + ' is missing the required regex pattern');
    }

    return args;
}

function lift(mapDirective, input, prefixes, args) {
    args = trimPattern(args);

    const expandedVars = [];
    const pattern = args.replace(RegExp(captureGroupName, "g"), 
        function (m, varName, offset, regexStr) {
            buildExpandedVars(varName, expandedVars, prefixes);
            return "";
    });

    if (expandedVars.length === 0) {
        throw Error('Found no capture variable in ' + mapDirective + '!');
    }
    
    let matches;
    try {
        matches = input.match(RegExp(pattern));
    } catch (e) {
        throw Error('Error pattern matching '+mapDirective + " with " + input + ": " + e.message);
    }

    if (!matches) throw Error(mapDirective + ' found no match for input "' + input + '"!');

    // Build a hash of the regex variable name/value pairs
    const result = {};
    for (let i = 1; i < matches.length; ++i) {
      result[expandedVars[i-1]] = matches[i];
    }
  
    return result;
}

function lower(mapDirective, bindings, prefixes, args) {
    args = trimPattern(args);

    // Replace mapDirective named capture groups into bindings for those names.
    const expandedVars = [];
    let matched = false;
    let string = args.replace(RegExp("\\("+captureGroupName+"[^)]+\\)", "g"),
        function (m, varName, offset, str) {
            matched = true;
            const expVarName = buildExpandedVars(varName, expandedVars, prefixes);
            const val = bindings.get(expVarName);
            if (val === undefined) {
                throw Error("Unable to process " + mapDirective + 
                            " because variable \"" + expVarName + "\" was not found!");
      
            } else {
                return extUtils.trimQuotes( val);
            }
    });

    if (!matched) {
        throw Error('Found no capture variable in ' + mapDirective + '!');
    }

    string = extUtils.collapseSpaces(string); // replaces white space with a single space 
    return extUtils.unescapeMetaChars(string);
}

return {
  lift: lift,
  lower: lower
};
})();

if (true)
  module.exports = RegexExtension;


/***/ }),

/***/ 3146:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

/**
 * N3id - webapps and scripts that rely specifically on N3.js leverage the fact
 * that term.id is N-Triples for all terms except typed literals, which lack
 * <>s around data types. This is handy for testing.
 *   NamedNode: bare word, e.g. http://a.example/
 *   BlankNode: "_:" + label, e.g. _:b1
 *   Literal: quoted value plus ntriples lang or datatype, e.g:
 *     "I said \"Hello World\"."
 *     "I said \"Hello World\"."@en
 *     "1.1"^^http://www.w3.org/2001/XMLSchema#float
 */

const {DataFactory} = __webpack_require__(1194);
const RdfJsFactory = new DataFactory();

/**
 * Map an N3id quad to an RdfJs quad
 * @param {*} s subject
 * @param {*} p predicate
 * @param {*} o object
 * @param {*} g graph
 * @returns RdfJs quad
 */
function n3idQuad2RdfJs (s/*: string*/, p/*: string*/, o/*: string*/, g/*: string*/)/*: Quad*/ {
  const graph = g ? n3idTerm2RdfJs(g) : RdfJsFactory.defaultGraph();
  return RdfJsFactory.quad(
      // there probably some elegant way to do this without lots of casting
    n3idTerm2RdfJs(s)/* as NamedNode | BlankNode*/,
    n3idTerm2RdfJs(p)/* as NamedNode*/,
    n3idTerm2RdfJs(o)/* as NamedNode | BlankNode | Literal*/,
    graph/* as NamedNode | BlankNode*/,
  );
}

/**
 * Map an N3id term to an RdfJs Term.
 * @param {*} term N3Id term
 * @returns RdfJs Term
 */
function n3idTerm2RdfJs (term/*: string*/)/*: RdfJsTerm*/ {
  if (term[0] === "_" && term[1] === ":")
    return RdfJsFactory.blankNode(term.substr(2));

  if (term[0] === "\"" || term[0] === "'") {
    const closeQuote = term.lastIndexOf(term[0]);
    if (closeQuote === -1)
      throw new Error(`no close ${term[0]}: ${term}`);
    const value = term.substr(1, closeQuote - 1).replace(/\\"/g, '"');
    const langOrDt = term.length === closeQuote + 1
      ? undefined
      : term[closeQuote + 1] === "@"
      ? term.substr(closeQuote + 2)
      : parseDt(closeQuote + 1)
    return RdfJsFactory.literal(value, langOrDt);
  }

  return RdfJsFactory.namedNode(term);

  function parseDt (from/*: number*/)/*: NamedNode*/ {
    if (term[from] !== "^" || term[from + 1] !== "^")
      throw new Error(`garbage after closing \": ${term}`);
    return RdfJsFactory.namedNode(term.substr(from + 2));
  }
}

module.exports = {
  n3idQuad2RdfJs,
  n3idTerm2RdfJs,
}


/***/ }),

/***/ 1279:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*
 * TODO
 *   templates: @<foo> %map:{ my:specimen.container.code=.1.code, my:specimen.container.disp=.1.display %}
 *   node identifiers: @foo> %map:{ foo.id=substr(20) %}
 *   multiplicity: ...
 */

const {rdfJsTerm2Ld} = __webpack_require__(1101);

const ShExMapCjsModule = function (config) {

const ShExTerm = __webpack_require__(1101);
const extensions = __webpack_require__(1386);
const N3Util = __webpack_require__(7141);
const N3DataFactory = (__webpack_require__(713)["default"]);
const materializer = __webpack_require__(4865)(config);
const StringToRdfJs = __webpack_require__(3146);

const MapExt = "http://shex.io/extensions/Map/#";
const pattern = /^ *(?:<([^>]*)>|([^:]*):([^ ]*)) *$/;

const UNBOUNDED = -1;
const MAX_MAX_CARD = 50; // @@ don't repeat forever during dev experiments.

function register (validator, api) {
  if (api === undefined || !('ShExTerm' in api))
    throw Error('SemAct extensions must be called with register(validator, {ShExTerm, ...)')

  const prefixes = "_prefixes" in validator.schema ?
      validator.schema._prefixes :
      {};

  validator.semActHandler.results[MapExt] = {};
  validator.semActHandler.register(
    MapExt,
    {
      /**
       * Callback for extension invocation.
       *
       * @param {string} code - text of the semantic action.
       * @param {object} ctx - matched triple or results subset.
       * @param {object} extensionStorage - place where the extension writes into the result structure.
       * @return {bool} false if the extension failed or did not accept the ctx object.
       */
      dispatch: function (code, ctx, extensionStorage) {
        function fail (msg) { const e = Error(msg); Error.captureStackTrace(e, fail); throw e; }
        function getPrefixedName(bindingName) {
           // already have the fully prefixed binding name ready to go
           if (typeof bindingName === "string") return bindingName;

           // bindingName is from a pattern match - need to get & expand it with prefix
            const prefixedName = bindingName[1] ? bindingName[1] :
                bindingName[2] in prefixes ? (prefixes[bindingName[2]] + bindingName[3]) :
                fail("unknown prefix " + bindingName[2] + " in \"" + code + "\".");
            return prefixedName;
        }

        const update = function(bindingName, value) {

            if (!bindingName) {
               throw Error("Invocation error: " + MapExt + " code \"" + code + "\" didn't match " + pattern);
            }

            const prefixedName = getPrefixedName(bindingName);
            const quotedValue = rdfJsTerm2Ld(value);

            validator.semActHandler.results[MapExt][prefixedName] = quotedValue;
            extensionStorage[prefixedName] = quotedValue;
        };

        // Do we have a map extension function?
        if (/.*[(].*[)].*$/s.test(code)) {
          const results = extensions.lift(code, ctx.object.value, prefixes);
          for (key in results)
            update(key, RdfJs.DataFactory.literal(results[key]));
        } else {
          const bindingName = code.match(pattern);
          update(bindingName, ctx.node || ctx.object);
        }

        return []; // There are no evaluation failures. Any parsing problem throws.
      }
    }
  );
  return {
    results: validator.semActHandler.results[MapExt],
    binder,
    trivialMaterializer,
    visitTripleConstraint
  }

function visitTripleConstraint (expr, curSubjectx, nextBNode, target, visitor, schema, bindings, recurse, direct, checkValueExpr) {
      // utility functions for e.g. s = add(B(), P(":value"), L("70", P("xsd:float")))
      function P (pname) { return expandPrefixedName(pname, schema._prefixes); }
      function L (value, modifier) { return N3Util.createLiteral(value, modifier); }
      function B () { return nextBNode(); }
      function add (s, p, o) {
        target.addQuad(StringToRdfJs.n3idQuad2RdfJs(s, p, o));
        return s;
      }

        const mapExts = (expr.semActs || []).filter(function (ext) { return ext.name === MapExt; });
        if (mapExts.length) {
          mapExts.forEach(function (ext) {
            const code = ext.code;
            const m = code.match(pattern);

            let tripleObject;
            if (m) { 
              const arg = m[1] ? m[1] : P(m[2] + ":" + m[3]);
              const val = n3ify(bindings.get(arg));
              if (val !== undefined) {
                tripleObject = val;
              }
            }

            // Is the arg a function? Check if it has parentheses and ends with a closing one
            if (tripleObject === undefined) {
              if (/[ a-zA-Z0-9]+\(/.test(code)) 
                  tripleObject = extensions.lower(code, bindings, schema.prefixes);
            }

            if (tripleObject === undefined)
              ; // console.warn('Not in bindings: ',code);
            else if (expr.inverse)
              add(tripleObject, expr.predicate, curSubjectx.cs);
            else
              add(curSubjectx.cs, expr.predicate, tripleObject);
          });

        } else if (typeof expr.valueExpr !== "string" && "values" in expr.valueExpr && expr.valueExpr.values.length === 1) {
          if (expr.inverse)
            add(expr.valueExpr.values[0], expr.predicate, curSubjectx.cs);
          else
            add(curSubjectx.cs, expr.predicate, n3ify(expr.valueExpr.values[0]));

        } else {
          const oldSubject = curSubjectx.cs;
          let maxAdd = "max" in expr ? expr.max === UNBOUNDED ? Infinity : expr.max : 1;
          if (maxAdd > MAX_MAX_CARD)
            maxAdd = MAX_MAX_CARD;
          if (!recurse)
            maxAdd = 1; // no grounds to know how much to repeat.
          for (let repetition = 0; repetition < maxAdd; ++repetition) {
            curSubjectx.cs = B();
            if (recurse) {
              const res = checkValueExpr(StringToRdfJs.n3idTerm2RdfJs(curSubjectx.cs), expr.valueExpr, recurse, direct)
              if ("errors" in res)
                break;
            }
            if (expr.inverse)
              add(curSubjectx.cs, expr.predicate, oldSubject);
            else
              add(oldSubject, expr.predicate, curSubjectx.cs);
          }
          visitor._maybeSet(expr, { type: "TripleConstraint" }, "TripleConstraint",
                         ["inverse", "negated", "predicate", "valueExpr",
                          "min", "max", "annotations", "semActs"])
          curSubjectx.cs = oldSubject;
        }
      }

function trivialMaterializer (schema, nextBNode) {
  let blankNodeCount = 0;
  const index = schema._index || api.ShExUtil.index(schema)
  nextBNode = nextBNode || function () {
    return '_:b' + blankNodeCount++;
  };
  return {
    materialize: function (bindings, createRoot, shape, target) {
      shape = !shape || shape === validator.Start
        ? schema.start
        : schema.shapes.indexOf(shape) !== -1
        ? shape
        : this._lookupShape(shape);
      target = target || new config.rdfjs.Store();
      // target.addPrefixes(schema.prefixes); // not used, but seems polite

      // utility functions for e.g. s = add(B(), P(":value"), L("70", P("xsd:float")))
      function P (pname) { return expandPrefixedName(pname, schema.prefixes); }
      function L (value, modifier) { return N3Util.createLiteral(value, modifier); }
      function B () { return nextBNode(); }
      function add (s, p, o) { target.addTriple({ subject: s, predicate: p, object: n3ify(o) }); return s; }

      const curSubject = createRoot || B();
      const curSubjectx = {cs: curSubject};

      const v = api.ShExUtil.Visitor();
      const oldVisitShapeRef = v.visitShapeRef;

      v.visitShapeRef = function (shapeRef) {
        this.visitShapeDecl(index.shapeExprs[shapeRef], shapeRef);
        return oldVisitShapeRef.call(v, shapeRef);
      };

      v.visitValueRef = function (r) {
        this.visitTripleExpr(schema.shapes[r], r);
        return this._visitValue(r);
      };

      v.visitTripleConstraint = function (expr) {
        visitTripleConstraint(expr, curSubjectx, nextBNode, target, this, schema, bindings);
      };

      v.visitShapeExpr(shape, "_: -start-");
      return target;
    }
  };
}

function binder (tree) {
  let stack = []; // e.g. [2, 1] for v="http://shex.io/extensions/Map/#BPDAM-XXX"
  const globals = {}; // !! delme
  //

  /**
   * returns: { const->count }
   */
  function _mults (obj) {
    const rays = [];
    const objs = [];
    const counts = Object.keys(obj).reduce((r, k) => {
      let toAdd = null;
      if (typeof obj[k] === "object" && !("value" in obj[k])) {
        toAdd = _mults(obj[k]);
        if (Array.isArray(obj[k]))
          rays.push(k);
        else
          objs.push(k);
      } else {
        // variable name.
        toAdd = _make(k, 1);
      }
      return _add(r, toAdd);
    }, {});
    if (rays.length > 0) {
      objs.forEach(i => {
        const novel = Object.keys(obj[i]).filter(k => {
          return counts[k] === 1;
        });
        if (novel.length) {
          const n2 = novel.reduce((r, k) => {
            r[k] = obj[i][k];
            return r;
          }, {});
          rays.forEach(l => {
            _cross(obj[l], n2);
          });
        }
      });
      objs.reverse();
      objs.forEach(i => {
        obj.splice(i, 1); // remove object from tree
      });
    }
    return counts;
  }
  function _add (l, r) {
    const ret = Object.assign({}, l);
    return Object.keys(r).reduce((ret, k) => {
      const add = k in r ? r[k] : 1;
      ret[k] = k in ret ? ret[k] + add : add;
      return ret;
    }, ret);
  }
  function _make (k, v) {
    const ret = {};
    ret[k] = v;
    return ret;
  }
  function _cross (list, map) {
    for (let listIndex in list) {
      if (Array.isArray(list[listIndex])) {
        _cross(list[listIndex], map);
      } else {
        Object.keys(map).forEach(mapKey => {
          if (mapKey in list[listIndex])
            throw Error("unexpected duplicate key: " + mapKey + " in " + JSON.stringify(list[listIndex]));
          list[listIndex][mapKey] = map[mapKey];
        });
      }
    };
  }
  _mults(tree);
  function _simplify (list) {
    const ret = list.reduce((r, elt) => {
      return r.concat(
        Array.isArray(elt) ?
          _simplify(elt) :
          elt
      );
    }, []);
    return ret.length === 1 ? ret[0] : ret;
  }
  tree = Array.isArray(tree) ? _simplify(tree) : [tree]; // expects an array

  // const globals = tree.reduce((r, e, idx) => {
  //   if (!Array.isArray(e)) {
  //     Object.keys(e).forEach(k => {
  //       r[k] = e[k];
  //     });
  //     removables.unshift(idx); // higher indexes at the left
  //   }
  //   return r;
  // }, {});

  function getter (v) {
    // work with copy of stack while trying to grok this problem...
    if (stack === null)
      return undefined;
    if (v in globals)
      return globals[v];
    const nextStack = stack.slice();
    let next = diveIntoObj(nextStack); // no effect if in obj
    while (!(v in next)) {
      let last;
      while(!Array.isArray(next)) {
        last = nextStack.pop();
        next = getObj(nextStack);
      }
      if (next.length === last+1) {
        stack = null;
        return undefined;
      }
      nextStack.push(last+1);
      next = diveIntoObj(nextStack);
      // console.log("advanced to " + nextStack);
      // throw Error ("can't advance to find " + v + " in " + JSON.stringify(next));
    }
    stack = nextStack.slice();
    const ret = next[v];
    delete next[v];
    return ret;

    function getObj (s) {
      return s.reduce(function (res, elt) {
        return res[elt];
      }, tree);
    }

    function diveIntoObj (s) {
      while (Array.isArray(getObj(s)))
        s.push(0);
      return getObj(s);
    }
  };
  return {get: getter};
}

}

function done (validator) {
  if (Object.keys(validator.semActHandler.results[MapExt]).length === 0)
    delete validator.semActHandler.results[MapExt];
}

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

  // Expands the prefixed name to a full IRI (also when it occurs as a literal's type)
  function expandPrefixedName (prefixedName, prefixes) {
    const match = /(?:^|"\^\^)([^:\/#"'\^_]*):[^\/]*$/.exec(prefixedName);
    let prefix, base, index;
    if (match)
      prefix = match[1], base = prefixes[prefix], index = match.index;
    if (base === undefined)
      return prefixedName;

    // The match index is non-zero when expanding a literal's type
    return index === 0 ? base + prefixedName.substr(prefix.length + 1)
                       : prefixedName.substr(0, index + 3) +
                         base + prefixedName.substr(index + prefix.length + 4);
  }

function extractBindingsDelMe (soln, min, max, depth) {
  if ("min" in soln && soln.min < min)
    min = soln.min
  const myMax = "max" in soln ?
      (soln.max === UNBOUNDED ?
       Infinity :
       soln.max) :
      1;
  if (myMax > max)
    max = myMax

  function walkExpressions (s) {
    return s.expressions.reduce((inner, e) => {
      return inner.concat(extractBindingsDelMe(e, min, max, depth+1));
    }, []);
  }

  function walkTriple (s) {
    const fromTriple = "extensions" in s && MapExt in s.extensions ?
        [{ depth: depth, min: min, max: max, obj: s.extensions[MapExt] }] :
        [];
    return "referenced" in s ?
      fromTriple.concat(extractBindingsDelMe(s.referenced.solution, min, max, depth+1)) :
      fromTriple;
  }

  function structuralError (msg) { throw Error(msg); }

  const walk = // function to explore each solution
      soln.type === "someOfSolutions" ||
      soln.type === "eachOfSolutions" ? walkExpressions :
      soln.type === "tripleConstraintSolutions" ? walkTriple :
      structuralError("unknown type: " + soln.type);

  if (myMax > 1) // preserve important associations:
    // map: e.g. [[1,2],[3,4]]
    // [walk(soln.solutions[0]), walk(soln.solutions[1]),...]
    return soln.solutions.map(walk);
  else // hide unimportant nesting:
    // flatmap: e.g. [1,2,3,4]
    // [].concat(walk(soln.solutions[0])).concat(walk(soln.solutions[1]))...
    return [].concat.apply([], soln.solutions.map(walk));
}

return {
  register: register,
  done: done,
  materializer: materializer,
  // binder: binder,
  url: MapExt,
  // visitTripleConstraint: myvisitTripleConstraint
  extension: {
    hashmap: __webpack_require__(9445),
    regex: __webpack_require__(7521)
  },
  extensions: __webpack_require__(1386),
  utils: __webpack_require__(1961),
};

};

if (true)
  module.exports = ShExMapCjsModule;


/***/ }),

/***/ 9709:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

ShExWebApp = (function () {
  const shapeMap = __webpack_require__(6261)
  return Object.assign({}, {
    ShExTerm:             __webpack_require__(1101),
    Util:                 __webpack_require__(9443),
    RdfJsDb:              (__webpack_require__(319).ctor),
    SparqlDb:             (__webpack_require__(1609).ctor),
    Validator:            (__webpack_require__(7403).ShExValidator),
    Writer:               __webpack_require__(95),
    Loader:               __webpack_require__(2863),
    Parser:               __webpack_require__(931),
    "eval-simple-1err":   (__webpack_require__(8986)/* .RegexpModule */ .G),
    "eval-threaded-nerr": (__webpack_require__(6201)/* .RegexpModule */ .G),
    ShapeMap:             shapeMap,
    ShapeMapParser:       shapeMap.Parser,
    JsYaml:               __webpack_require__(9431),
    DcTap:                (__webpack_require__(5281).DcTap),
    Map:                  __webpack_require__(1279),
    StringToRdfJs:        __webpack_require__(3146),
    NestedTurtleWriter:   __webpack_require__(6053),
  })
})()

if (true)
  module.exports = ShExWebApp;


/***/ }),

/***/ 3486:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sparqlOrder = exports.Start = void 0;
exports.Start = { term: "START" };
/* sparqlOrder - sort triples by subject following SPARQL partial ordering.
 */
function sparqlOrder(l, r) {
    const [lprec, rprec] = [prec(l), prec(r)];
    return lprec === rprec ? l.value.localeCompare(r.value) : lprec - rprec;
}
exports.sparqlOrder = sparqlOrder;
const termType2Prec = {
    'BlankNode': 1,
    'Literal': 2,
    'NamedNode': 3,
};
function prec(t) {
    let typeLabel = t.termType;
    if (typeLabel === 'Quad' || typeLabel === 'Variable' || typeLabel === 'DefaultGraph')
        throw Error(`no defined SPARQL order for ${typeLabel} ${t.value}`);
    return termType2Prec[typeLabel];
}


/***/ }),

/***/ 319:
/***/ ((module, exports, __webpack_require__) => {

/** Implementation of @shexjs/neighborhood-api which gets data from an @rdfjs/dataset
 */
const NeighborhoodRdfJsModule = (function () {
  const Api = __webpack_require__(3486);

  function rdfjsDB (db /*:typeof N3Store*/, queryTracker /*:QueryTracker*/) {

    function getSubjects () { return db.getSubjects(); }
    function getPredicates () { return db.getPredicates(); }
    function getObjects () { return db.getObjects(); }
    function getQuads ()/*: Quad[]*/ { return db.getQuads.apply(db, arguments); }

    function getNeighborhood (point/*: string*/, shapeLabel/*: string*//*, shape */) {
      // I'm guessing a local DB doesn't benefit from shape optimization.
      let startTime;
      if (queryTracker) {
        startTime = new Date();
        queryTracker.start(false, point, shapeLabel);
      }
      const outgoing/*: Quad[]*/ = [... db.match(point, null, null, null)].sort(
        (l, r) => Api.sparqlOrder(l.object, r.object)
      );
      if (queryTracker) {
        const time = new Date();
        queryTracker.end(outgoing, time.valueOf() - startTime.valueOf());
        startTime = time;
      }
      if (queryTracker) {
        queryTracker.start(true, point, shapeLabel);
      }
      const incoming/*: Quad[]*/ = [...db.match(null, null, point, null)].sort(
        (l, r) => Api.sparqlOrder(l.object, r.object)
      );
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
  }

// ## Exports

return exports = {
  name: "neighborhood-rdfjs",
  description: "Implementation of @shexjs/neighborhood-api which gets data from an @rdfjs/dataset",
  ctor: rdfjsDB
};

})();

if (true)
  module.exports = NeighborhoodRdfJsModule;


/***/ }),

/***/ 1609:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/** Implementation of @shexjs/neighborhood-api which gets data from a SPARQL endpoint
 */
const NeighborhoodSparqlModule = (function () {
  const ShExTerm = __webpack_require__(1101);
  const ShExUtil = __webpack_require__(9443);
  const ShExVisitor = __webpack_require__(8806);

  function sparqlDB (endpoint, queryTracker, options = {}) {
    // Need to inspect the schema to calculate the relevant neighborhood.
    let schemaIndex = null;
    const bnodes = { };

    function getQuads(s, p, o, g) {
      return mapQueryToTriples("SELECT " + [
        (s?"":"?s"), (p?"":"?p"), (o?"":"?o"),
        "{",
        (s?s:"?s"), (p?p:"?s"), (o?o:"?s"),
        "}"].join(" "), s, o)
    }

    function mapQueryToTriples (query, s, o) {
      const rows = ShExUtil.executeQuery(query, endpoint);
      const triples = rows.map(row =>  {
        return s ? {
          subject: s, // arcs out
          predicate: row[0],
          object: row[1]
        } : {
          subject: row[0], // arcs in
          predicate: row[1],
          object: o
        };
      });
      return triples;
    }

    function getTripleConstraints (tripleExpr) {
      const visitor = ShExVisitor();
      const ret = {
        out: [],
        inc: []
      };
      visitor.visitTripleConstraint = function (expr) {
        ret[expr.inverse ? "inc" : "out"].push(expr);
        return expr;
      };

      visitor.visitInclusion = function (inclusion) {
        return visitor.visitExpression(schemaIndex.tripleExprs[inclusion]);
      }

      if (tripleExpr)
        visitor.visitExpression(tripleExpr);
      return ret;
    }

    function getNeighborhood (point, shapeLabel, shape) {
      // I'm guessing a local DB doesn't benefit from shape optimization.
      let startTime;
      const pointStr = find(point);
      const tcs = getTripleConstraints(shape.expression);
      let pz = tcs.out.map(t => t.predicate);
      pz = pz.filter((p, idx) => pz.lastIndexOf(p) === idx);
      if (queryTracker) {
        startTime = new Date();
        queryTracker.start(false, point, shapeLabel);
      }
      const outgoing = (tcs.out.length > 0 || shape.closed)
            ? mapQueryToTriples(
              shape.closed || options.allOutgoing
                ? `SELECT ?p ?o { ${pointStr} ?s ?p ?o }`
                : `SELECT ?p ?o { # ${point}\n` + pointStr +
                pz.map(
                  p => `  {?s <${p}> ?o BIND(<${p}> AS ?p)}`
                ).join(" UNION\n") +
                "\n}",
              point, null
            )
            : [];
      if (queryTracker) {
        const time = new Date();
        queryTracker.end(outgoing, time - startTime);
        startTime = time;
      }
      let incoming = [];
      if (tcs.inc.length > 0) {
        if (queryTracker) {
          queryTracker.start(true, point, shapeLabel);
        }
        const incoming = mapQueryToTriples(`SELECT ?s ?p { ?s ?p ${pointStr} }`, null, point);
        if (queryTracker) {
          queryTracker.end(incoming, new Date() - startTime);
        }
      }
      const bnodesByPredicate = outgoing.reduce((acc, t) => {
        if (t.object.startsWith("_:")) {
          bnodes[t.object] = { from: point, p: t.predicate };
          // e.g. { from: "n0", p: "p0" }
          if (!(t.predicate in acc))
            acc[t.predicate] = [];
          acc[t.predicate].push(t.object);
        }
        return acc;
      }, {});
      Object.keys(bnodesByPredicate)
        .filter(p => bnodesByPredicate[p].length > 1)
        .forEach(p => {
          const query = `SELECT ?s ?p ?o { # find bnodes in <${point}> ${p} ?o
${find(bnodesByPredicate[p][0])}  ?s ?p ?o
}`;
          const rows = ShExUtil.executeQuery(query, endpoint);
          const uniques = getUniques(rows);
          Object.keys(uniques).forEach(s => {
            bnodes[s].unique = uniques[s].unique,
            bnodes[s].proxies = uniques[s].proxies
            bnodes[s].see = uniques[s].see
          });
        });
      return  {
        outgoing: outgoing,
        incoming: incoming
      };
    }

    return {
      getNeighborhood: getNeighborhood,
      getQuads: getQuads,
      getSubjects: function () { return ["!Query DB can't index subjects"] },
      getPredicates: function () { return ["!Query DB can't index predicates"] },
      getObjects: function () { return ["!Query DB can't index objects"] },
      get size() { return undefined; },
      setSchema: function (schema) { schemaIndex = schema._index || ShExUtil.index(schema) },
    };

    function find (point, depth = 0, recursed = false) {
      if (!point.startsWith("_:"))
        return recursed
        ? "  <" + point + ">"
        : "  BIND (" + "<" + point + ">" + " AS ?s)\n";

      const see = bnodes[point].see || point;
      const s = depth === 0 ? '?s' : `?_${depth}`;
      const {from, p, unique, proxies} = bnodes[see];
      const prior = find(from, depth+1, true);
      const uniqueStr = unique
            ? ".\n" + Object.keys(unique).map(
              p => `  ${s} <${p}> ${unique[p].map(o => `<${o}>`).join(', ')} .
MINUS {
  ${s} <${p}> ${s}_ne .
  FILTER (${s}_ne NOT IN (${unique[p].map(o => `<${o}>`).join(', ')}))
}`
            ).join('\n')
            : '.';
      // "\n# " + JSON.stringify(unique)
      const limitPre = proxies ? "{ SELECT ?s WHERE {\n" : "";
      const limitPost = proxies ? "} LIMIT 1 }" : "";
      return depth === 0
        ? `${limitPre}${prior} <${p}> ?s ${uniqueStr}${limitPost}\n`
        : `${prior} <${p}> ?_${depth}  ${uniqueStr}\n  ?_${depth}`;
    }

    function getUniques (rs) {
      // index the result set three ways
      const index = rs.reduce((acc, t) => {
        const [s, p, o] = t;
        if (!s.startsWith("_:")) // only index bnodes
          return acc;
        acc.sz.add(s);

        indexTriple(acc.spo, s, p, o);
        indexTriple(acc.pso, p, s, o);
        indexTriple(acc.pos, p, o, s);

        return acc;

        function indexTriple (index, a, b, c) {
          if (!(a in index))
            index[a] = {};
          if (!(b in index[a]))
            index[a][b] = [];
          index[a][b].push(c);
        }
      }, {sz: new Set(), spo: {}, pso: {}, pos: {}});

      // use the spo index to find indistinguishable bnodes
      const duplicates = [...index.sz].reduce((acc, s) => {
        const po = index.spo[s];
        const poStr = JSON.stringify(po);
        if (poStr in acc.strs) {
          const firstS = acc.strs[poStr];
          acc.duplicates[s] = firstS;
        } else {
          acc.strs[poStr] = s;
        }
        return acc;
      }, {strs: {}, duplicates:{}}).duplicates;

      // Optimization: order predicates by maximum coverage.
      const pzSortedByObjects = Object.keys(index.pos).sort( // sort by number of unique values
        (l, r) => Object.keys(index.pos[r]).length - Object.keys(index.pos[l]).length
      );

      // Map subjects to their unique attributes.
      return [...index.sz].reduce((acc, s) => {
        if (s in duplicates) {
          const see = duplicates[s]
          // queries for s should use `see` instead
          acc[s].see = see;
          // record that see proxies for s
          addAttr(acc[see], 'proxies', s);
        } else {
          // which other subjects to test for value collisions
          const others = [...index.sz].filter(member => member !== s && !(member in duplicates));
          // walk the power set of properties
          const pzIterator = OrderedPowerSet(pzSortedByObjects, true, false);
          for (const pz of pzIterator) {
            // s's values for this set of properties
            const testUnique = vals(index.pso, s, pz);
            // other subjects with the save values for the same properties
            const conflicts = others.filter(
              other => hashOfArraysEqual(testUnique, vals(index.pso, other, pz))
            );
            if (conflicts.length === 0) {
              // record set of unique p/o that identifies s
              acc[s].unique = testUnique;
              // skip remaining power set
              break;
            }
          };
        }
        return acc;
      }, [...index.sz].reduce((acc, s) => setAttr(acc, s, {}), {}))
    }

    function vals (pso, s, pz) {
      return pz.reduce((acc, p) => {
        acc[p] = pso[p][s]
        return acc;
      }, {});
    }

    function setAttr (obj, attr, val) {
      obj[attr] = val;
      return obj;
    }

    function addAttr (obj, attr, val) {
      if (!(attr in obj))
        obj[attr] = [];
      obj[attr].push(val);
      return obj;
    }

    function hashOfArraysEqual (l, r) {
      if (Object.keys(l).length !== Object.keys(r).length) return false;
      return Object.keys(l).every(k => arrayEqual(l[k], r[k]))
    }
    function arrayEqual (l, r) {
      if (l === undefined && r === undefined) return true;
      if (l === undefined || r === undefined) return true;
      if (l.length !== r.length) return false;
      return l.every((v, idx) => r[idx] === v)
    }

    /** Generates a power set ordered by set length and member order.
     * This algorithm does not keep the entire power set in memory.
     *
     * @param members - array elements to combine in power set, e.g. ['a', 'b']
     * @param unique - whether results have no repeats, e.g. ['a', 'a']
     * @param reorder - whether results include reorderings, e.g ['a', 'b'] and ['b', 'a']
     * @yields elements in the power set, e.g. a,b,c,ab,ac,bc,abc
     */
    function *OrderedPowerSet (members, unique = false, reorder = true) {
      let last;
      let k = null;
      for (k = 1; k <= members.length; ++k)
        yield* combi.call(this, 0, [[]]);

      function *combi (n, comb) {
        let combs = [];
        for (let x = 0; x < comb.length; ++x) {
          const next = reorder
                ? 0 // LSB gets all characters
                : comb.length === 1 && comb[0].length === 0
                ? x // LSB starts after x
                : members.indexOf(comb[x][comb[x].length - 1]) // after last character
          for (let l = next; l < members.length; ++l) {
            if (!unique || comb[x].indexOf(members[l]) === -1) {
              const entry = comb[x].concat([members[l]]);
              if (n === k - 1)
                yield entry;
              else
                combs.push(entry); // build intermediate combinations
            }
          }
        }
        if (n < k - 1) {
          n++;
          yield* combi.call(this, n, combs);
        }
      }
    }
  }

  return {
    name: "neighborhood-sparql",
    description: "Implementation of @shexjs/neighborhood-api which gets data from a SPARQL endpoint",
    ctor: sparqlDB
  };
})();

if (true)
  module.exports = NeighborhoodSparqlModule;


/***/ }),

/***/ 2839:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;
/* parser generated by jison 0.3.0 */
/**
 * Returns a Parser implementing JisonParserApi and a Lexer implementing JisonLexerApi.
 */

  /*
    ShapeMap parser in the Jison parser generator format.
  */

  const ShExUtil = __webpack_require__(9443);
  const ShapeMap = __webpack_require__(1014);

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

  const absoluteIRI = /^[a-z][a-z0-9+.-]*:/i;

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
    return obj("@value", ShExUtil.unescapeText(string, stringEscapeReplacements));
  }

  function unescapeLangString(string, trimLength) {
    const at = string.lastIndexOf("@");
    const lang = string.substr(at);
    string = string.substr(0, at);
    const u = unescapeString(string, trimLength);
    return extend(u, obj("@language", lang.substr(1).toLowerCase()));
  }

  // Parse a prefix out of a PName or throw Error
  function parsePName (pname, meta, parserState) {
    const namePos = pname.indexOf(':');
    return meta.expandPrefix(pname.substr(0, namePos), parserState) + ShExUtil.unescapeText(pname.substr(namePos + 1), pnameEscapeReplacements);
  }

  const EmptyObject = {  };
  const EmptyShape = { type: "Shape" };


const { JisonParser, o } = __webpack_require__(9041);const $V0=[1,7],$V1=[1,16],$V2=[1,11],$V3=[1,14],$V4=[1,25],$V5=[1,24],$V6=[1,21],$V7=[1,22],$V8=[1,23],$V9=[1,28],$Va=[1,26],$Vb=[1,27],$Vc=[1,29],$Vd=[1,12],$Ve=[1,13],$Vf=[1,15],$Vg=[4,9],$Vh=[16,19,20,21],$Vi=[2,25],$Vj=[16,19,20,21,37],$Vk=[16,19,20,21,31,34,37,39,46,48,50,53,54,55,56,76,77,78,79,80,81,82],$Vl=[4,9,16,19,20,21,37,43,74,75],$Vm=[4,9,43],$Vn=[29,46,80,81,82],$Vo=[4,9,42,43],$Vp=[1,59],$Vq=[46,79,80,81,82],$Vr=[31,34,39,46,48,50,53,54,55,56,76,77,78,80,81,82],$Vs=[1,94],$Vt=[1,85],$Vu=[1,86],$Vv=[1,87],$Vw=[1,90],$Vx=[1,91],$Vy=[1,92],$Vz=[1,93],$VA=[1,95],$VB=[33,48,49,50,53,54,55,56,63],$VC=[4,9,37,65],$VD=[1,99],$VE=[9,37],$VF=[9,65];

class ShapeMapJisonParser extends JisonParser {
    constructor(yy = {}, lexer = new ShapeMapJisonLexer(yy)) {
        super(yy, lexer);
        this.symbols_ = {"error":2,"shapeMap":3,"EOF":4,"pair":5,"Q_O_QGT_COMMA_E_S_Qpair_E_C_E_Star":6,"QGT_COMMA_E_Opt":7,"O_QGT_COMMA_E_S_Qpair_E_C":8,"GT_COMMA":9,"nodeSelector":10,"statusAndShape":11,"Qreason_E_Opt":12,"QjsonAttributes_E_Opt":13,"reason":14,"jsonAttributes":15,"GT_AT":16,"Qstatus_E_Opt":17,"shapeSelector":18,"ATSTART":19,"ATPNAME_NS":20,"ATPNAME_LN":21,"status":22,"objectTerm":23,"triplePattern":24,"IT_SPARQL":25,"string":26,"nodeIri":27,"shapeIri":28,"START":29,"subjectTerm":30,"BLANK_NODE_LABEL":31,"literal":32,"GT_LCURLEY":33,"IT_FOCUS":34,"nodePredicate":35,"O_QobjectTerm_E_Or_QIT___E_C":36,"GT_RCURLEY":37,"O_QsubjectTerm_E_Or_QIT___E_C":38,"IT__":39,"GT_NOT":40,"GT_OPT":41,"GT_DIVIDE":42,"GT_DOLLAR":43,"O_QAPPINFO_COLON_E_Or_QAPPINFO_SPACE_COLON_E_C":44,"jsonValue":45,"APPINFO_COLON":46,"APPINFO_SPACE_COLON":47,"IT_false":48,"IT_null":49,"IT_true":50,"jsonObject":51,"jsonArray":52,"INTEGER":53,"DECIMAL":54,"DOUBLE":55,"STRING_LITERAL2":56,"Q_O_QjsonMember_E_S_QGT_COMMA_E_S_QjsonMember_E_Star_C_E_Opt":57,"O_QGT_COMMA_E_S_QjsonMember_E_C":58,"jsonMember":59,"Q_O_QGT_COMMA_E_S_QjsonMember_E_C_E_Star":60,"O_QjsonMember_E_S_QGT_COMMA_E_S_QjsonMember_E_Star_C":61,"STRING_LITERAL2_COLON":62,"GT_LBRACKET":63,"Q_O_QjsonValue_E_S_QGT_COMMA_E_S_QjsonValue_E_Star_C_E_Opt":64,"GT_RBRACKET":65,"O_QGT_COMMA_E_S_QjsonValue_E_C":66,"Q_O_QGT_COMMA_E_S_QjsonValue_E_C_E_Star":67,"O_QjsonValue_E_S_QGT_COMMA_E_S_QjsonValue_E_Star_C":68,"rdfLiteral":69,"numericLiteral":70,"booleanLiteral":71,"Q_O_QLANGTAG_E_Or_QGT_DTYPE_E_S_QnodeIri_E_C_E_Opt":72,"O_QLANGTAG_E_Or_QGT_DTYPE_E_S_QnodeIri_E_C":73,"LANGTAG":74,"GT_DTYPE":75,"STRING_LITERAL1":76,"STRING_LITERAL_LONG1":77,"STRING_LITERAL_LONG2":78,"IT_a":79,"IRIREF":80,"PNAME_LN":81,"PNAME_NS":82,"$accept":0,"$end":1};
        this.terminals_ = {2:"error",4:"EOF",9:"GT_COMMA",16:"GT_AT",19:"ATSTART",20:"ATPNAME_NS",21:"ATPNAME_LN",25:"IT_SPARQL",29:"START",31:"BLANK_NODE_LABEL",33:"GT_LCURLEY",34:"IT_FOCUS",37:"GT_RCURLEY",39:"IT__",40:"GT_NOT",41:"GT_OPT",42:"GT_DIVIDE",43:"GT_DOLLAR",46:"APPINFO_COLON",47:"APPINFO_SPACE_COLON",48:"IT_false",49:"IT_null",50:"IT_true",53:"INTEGER",54:"DECIMAL",55:"DOUBLE",56:"STRING_LITERAL2",62:"STRING_LITERAL2_COLON",63:"GT_LBRACKET",65:"GT_RBRACKET",74:"LANGTAG",75:"GT_DTYPE",76:"STRING_LITERAL1",77:"STRING_LITERAL_LONG1",78:"STRING_LITERAL_LONG2",79:"IT_a",80:"IRIREF",81:"PNAME_LN",82:"PNAME_NS"};
        this.productions_ = [0,[3,1],[3,4],[8,2],[6,0],[6,2],[7,0],[7,1],[5,4],[12,0],[12,1],[13,0],[13,1],[11,3],[11,1],[11,1],[11,1],[17,0],[17,1],[10,1],[10,1],[10,2],[10,2],[18,1],[18,1],[30,1],[30,1],[23,1],[23,1],[24,5],[24,5],[36,1],[36,1],[38,1],[38,1],[22,1],[22,1],[14,2],[15,3],[44,1],[44,1],[45,1],[45,1],[45,1],[45,1],[45,1],[45,1],[45,1],[45,1],[45,1],[51,3],[58,2],[60,0],[60,2],[61,2],[57,0],[57,1],[59,2],[52,3],[66,2],[67,0],[67,2],[68,2],[64,0],[64,1],[32,1],[32,1],[32,1],[70,1],[70,1],[70,1],[69,2],[73,1],[73,2],[72,0],[72,1],[71,1],[71,1],[26,1],[26,1],[26,1],[26,1],[35,1],[35,1],[27,1],[27,1],[27,1],[27,1],[28,1],[28,1],[28,1],[28,1]];
        this.table = [{3:1,4:[1,2],5:3,10:4,23:5,24:6,25:$V0,26:20,27:8,30:9,31:$V1,32:10,33:$V2,46:$V3,48:$V4,50:$V5,53:$V6,54:$V7,55:$V8,56:$V9,69:17,70:18,71:19,76:$Va,77:$Vb,78:$Vc,80:$Vd,81:$Ve,82:$Vf},{1:[3]},{1:[2,1]},o($Vg,[2,4],{6:30}),{11:31,16:[1,32],19:[1,33],20:[1,34],21:[1,35]},o($Vh,[2,19]),o($Vh,[2,20]),{26:36,56:$V9,76:$Va,77:$Vb,78:$Vc},o($Vh,$Vi,{26:37,56:$V9,76:$Va,77:$Vb,78:$Vc}),o($Vj,[2,27]),o($Vj,[2,28]),{27:42,30:40,31:$V1,34:[1,38],38:39,39:[1,41],46:$V3,80:$Vd,81:$Ve,82:$Vf},o($Vk,[2,84]),o($Vk,[2,85]),o($Vk,[2,86]),o($Vk,[2,87]),o([16,19,20,21,37,46,79,80,81,82],[2,26]),o($Vj,[2,65]),o($Vj,[2,66]),o($Vj,[2,67]),o($Vj,[2,74],{72:43,73:44,74:[1,45],75:[1,46]}),o($Vj,[2,68]),o($Vj,[2,69]),o($Vj,[2,70]),o($Vj,[2,76]),o($Vj,[2,77]),o($Vl,[2,78]),o($Vl,[2,79]),o($Vl,[2,80]),o($Vl,[2,81]),{4:[2,6],7:47,8:48,9:[1,49]},o($Vm,[2,9],{12:50,14:51,42:[1,52]}),o($Vn,[2,17],{17:53,22:54,40:[1,55],41:[1,56]}),o($Vo,[2,14]),o($Vo,[2,15]),o($Vo,[2,16]),o($Vh,[2,21]),o($Vh,[2,22]),{27:58,35:57,46:$V3,79:$Vp,80:$Vd,81:$Ve,82:$Vf},{27:58,35:60,46:$V3,79:$Vp,80:$Vd,81:$Ve,82:$Vf},o($Vq,[2,33]),o($Vq,[2,34]),o([37,46,79,80,81,82],$Vi),o($Vj,[2,71]),o($Vj,[2,75]),o($Vj,[2,72]),{27:61,46:$V3,80:$Vd,81:$Ve,82:$Vf},{4:[1,62]},o($Vg,[2,5]),{4:[2,7],5:63,10:4,23:5,24:6,25:$V0,26:20,27:8,30:9,31:$V1,32:10,33:$V2,46:$V3,48:$V4,50:$V5,53:$V6,54:$V7,55:$V8,56:$V9,69:17,70:18,71:19,76:$Va,77:$Vb,78:$Vc,80:$Vd,81:$Ve,82:$Vf},o($Vg,[2,11],{13:64,15:65,43:[1,66]}),o($Vm,[2,10]),{26:67,56:$V9,76:$Va,77:$Vb,78:$Vc},{18:68,28:69,29:[1,70],46:[1,73],80:[1,71],81:[1,72],82:[1,74]},o($Vn,[2,18]),o($Vn,[2,35]),o($Vn,[2,36]),{23:76,26:20,27:42,30:9,31:$V1,32:10,36:75,39:[1,77],46:$V3,48:$V4,50:$V5,53:$V6,54:$V7,55:$V8,56:$V9,69:17,70:18,71:19,76:$Va,77:$Vb,78:$Vc,80:$Vd,81:$Ve,82:$Vf},o($Vr,[2,82]),o($Vr,[2,83]),{34:[1,78]},o($Vj,[2,73]),{1:[2,2]},o($Vg,[2,3]),o($Vg,[2,8]),o($Vg,[2,12]),{44:79,46:[1,80],47:[1,81]},o($Vm,[2,37]),o($Vo,[2,13]),o($Vo,[2,23]),o($Vo,[2,24]),o($Vo,[2,88]),o($Vo,[2,89]),o($Vo,[2,90]),o($Vo,[2,91]),{37:[1,82]},{37:[2,31]},{37:[2,32]},{37:[1,83]},{33:$Vs,45:84,48:$Vt,49:$Vu,50:$Vv,51:88,52:89,53:$Vw,54:$Vx,55:$Vy,56:$Vz,63:$VA},o($VB,[2,39]),o($VB,[2,40]),o($Vh,[2,29]),o($Vh,[2,30]),o($Vg,[2,38]),o($VC,[2,41]),o($VC,[2,42]),o($VC,[2,43]),o($VC,[2,44]),o($VC,[2,45]),o($VC,[2,46]),o($VC,[2,47]),o($VC,[2,48]),o($VC,[2,49]),{37:[2,55],57:96,59:98,61:97,62:$VD},{33:$Vs,45:102,48:$Vt,49:$Vu,50:$Vv,51:88,52:89,53:$Vw,54:$Vx,55:$Vy,56:$Vz,63:$VA,64:100,65:[2,63],68:101},{37:[1,103]},{37:[2,56]},o($VE,[2,52],{60:104}),{33:$Vs,45:105,48:$Vt,49:$Vu,50:$Vv,51:88,52:89,53:$Vw,54:$Vx,55:$Vy,56:$Vz,63:$VA},{65:[1,106]},{65:[2,64]},o($VF,[2,60],{67:107}),o($VC,[2,50]),{9:[1,109],37:[2,54],58:108},o($VE,[2,57]),o($VC,[2,58]),{9:[1,111],65:[2,62],66:110},o($VE,[2,53]),{59:112,62:$VD},o($VF,[2,61]),{33:$Vs,45:113,48:$Vt,49:$Vu,50:$Vv,51:88,52:89,53:$Vw,54:$Vx,55:$Vy,56:$Vz,63:$VA},o($VE,[2,51]),o($VF,[2,59])];
        this.defaultActions = {2:[2,1],62:[2,2],76:[2,31],77:[2,32],97:[2,56],101:[2,64]};
    }
    performAction (yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
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
this.$ = { shape: ShapeMap.Start };
break;
case 15:

        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        this.$ = { shape: yy.schemaMeta.expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy) };
      
break;
case 16:

        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        const namePos = $$[$0].indexOf(':');
        this.$ = { shape: yy.schemaMeta.expandPrefix($$[$0].substr(0, namePos), yy) + $$[$0].substr(namePos + 1) };
      
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
this.$ = ShapeMap.Start;
break;
case 29:
this.$ = { type: "TriplePattern", subject: ShapeMap.Focus, predicate: $$[$0-2], object: $$[$0-1] };
break;
case 30:
this.$ = { type: "TriplePattern", subject: $$[$0-3], predicate: $$[$0-2], object: ShapeMap.Focus };
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

        const node = ShExUtil.unescapeText($$[$0].slice(1,-1), {});
        this.$ = yy.dataMeta.base === null || absoluteIRI.test(node) ? node : yy.dataMeta._resolveIRI(node)
      
break;
case 85: case 86:
this.$ = parsePName($$[$0], yy.dataMeta, yy);
break;
case 87:
this.$ = yy.dataMeta.expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy);;
break;
case 88:

        const shape = ShExUtil.unescapeText($$[$0].slice(1,-1), {});
        this.$ = yy.schemaMeta.base === null || absoluteIRI.test(shape) ? shape : yy.schemaMeta._resolveIRI(shape)
      
break;
case 89: case 90:
this.$ = parsePName($$[$0], yy.schemaMeta, yy);
break;
case 91:
this.$ = yy.schemaMeta.expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy);;
break;
        }
    }
}

// Export module
__webpack_unused_export__ = ({ value: true });
exports.HW = ShapeMapJisonParser;


/* generated by ts-jison-lex 0.3.0 */
const { JisonLexer } = __webpack_require__(2752);
class ShapeMapJisonLexer extends JisonLexer {
    constructor (yy = {}) {
        super(yy);
        this.options = {"moduleName":"ShapeMapJison"};
        this.rules = [/^(?:\s+|(#[^\u000a\u000d]*|\/\*([^*]|\*([^/]|\\\/))*\*\/))/,/^(?:(appinfo[\u0020\u000A\u0009]+:))/,/^(?:("([^\u0022\u005C\u000A\u000D]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"[\u0020\u000A\u0009]*:))/,/^(?:([Ff][Oo][Cc][Uu][Ss]))/,/^(?:([Ss][Tt][Aa][Rr][Tt]))/,/^(?:(@[Ss][Tt][Aa][Rr][Tt]))/,/^(?:([Ss][Pp][Aa][Rr][Qq][Ll]))/,/^(?:(@(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*))))/,/^(?:(@((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)))/,/^(?:(@([A-Za-z])+((-([0-9A-Za-z])+))*))/,/^(?:(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*)))/,/^(?:(appinfo:))/,/^(?:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:))/,/^(?:(([+-])?((([0-9])+\.([0-9])*(([Ee]([+-])?([0-9])+)))|((\.)?([0-9])+(([Ee]([+-])?([0-9])+))))))/,/^(?:(([+-])?([0-9])*\.([0-9])+))/,/^(?:(([+-])?([0-9])+))/,/^(?:(<([^\u0000-\u0020<>\"{}|^`\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*>))/,/^(?:(_:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|[0-9])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"))/,/^(?:a\b)/,/^(?:,)/,/^(?:\{)/,/^(?:\})/,/^(?:@)/,/^(?:!)/,/^(?:\?)/,/^(?:\/)/,/^(?:\$)/,/^(?:\[)/,/^(?:\])/,/^(?:\^\^)/,/^(?:_\b)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:null\b)/,/^(?:$)/,/^(?:[a-zA-Z0-9_-]+)/,/^(?:.)/];
        this.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40],"inclusive":true}};
    }
    performAction (yy, yy_, $avoiding_name_collisions, YY_START) {
              let YYSTATE = YY_START;
            switch ($avoiding_name_collisions) {
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

// Export module
__webpack_unused_export__ = ({ value: true });
__webpack_unused_export__ = ShapeMapJisonLexer;



/***/ }),

/***/ 3018:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const ShapeMapParser = (function () {

// stolen as much as possible from SPARQL.js
if (true) {
  ShapeMapJison = (__webpack_require__(2839)/* .ShapeMapJisonParser */ .HW); // node environment
} else {}

const schemeAuthority = /^(?:([a-z][a-z0-9+.-]*:))?(?:\/\/[^\/]*)?/i,
    dotSegments = /(?:^|\/)\.\.?(?:$|[\/#?])/;

class ResourceMetadata {
  constructor () {
  }

  reset () {
    this.prefixes = null; // Reset state.
    this.base = this._baseIRI = this._baseIRIPath = this._baseIRIRoot = null;
  }

  // N3.js:lib/N3Parser.js<0.4.5>:58 with
  //   s/this\./ShapeMapJisonParser./g
  // ### `_setBase` sets the base IRI to resolve relative IRIs.
  _setBase (baseIRI) {
    if (!baseIRI)
      baseIRI = null;

    // baseIRI '#' check disabled to allow -x 'data:text/shex,...#'
    // else if (baseIRI.indexOf('#') >= 0)
    //   throw new Error('Invalid base IRI ' + baseIRI);

    // Set base IRI and its components
    if (this.base = baseIRI) {
      this._basePath   = baseIRI.replace(/[^\/?]*(?:\?.*)?$/, '');
      baseIRI = baseIRI.match(schemeAuthority);
      this._baseRoot   = baseIRI[0];
      this._baseScheme = baseIRI[1];
    }
  }

  // N3.js:lib/N3Parser.js<0.4.5>:576 with
  //   s/this\./ShapeMapJisonParser./g
  //   s/token/iri/
  // ### `_resolveIRI` resolves a relative IRI token against the base path,
  // assuming that a base path has been set and that the IRI is indeed relative.
  _resolveIRI (iri) {
    switch (iri[0]) {
    // An empty relative IRI indicates the base IRI
    case undefined: return this.base;
    // Resolve relative fragment IRIs against the base IRI
    case '#': return this.base + iri;
    // Resolve relative query string IRIs by replacing the query string
    case '?': return this.base.replace(/(?:\?.*)?$/, iri);
    // Resolve root-relative IRIs at the root of the base IRI
    case '/':
      // Resolve scheme-relative IRIs to the scheme
      return (iri[1] === '/' ? this._baseScheme : this._baseRoot) + this._removeDotSegments(iri);
    // Resolve all other IRIs at the base IRI's path
    default: {
      return this._removeDotSegments(this._basePath + iri);
    }
    }
  }

  // ### `_removeDotSegments` resolves './' and '../' path segments in an IRI as per RFC3986.
  _removeDotSegments (iri) {
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

  // Expand declared prefix or throw Error
  expandPrefix (prefix, parserState) {
    if (!(prefix in this.prefixes))
      parserState.error(new Error('Parse error; unknown prefix "' + prefix + ':"'));
    return this.prefixes[prefix];
  }

}

class ShapeMapParserState {
  constructor () {
    this.schemaMeta = new ResourceMetadata();
    this.dataMeta = new ResourceMetadata();
    this._fileName = undefined; // for debugging
  }

  reset () {
    this.schemaMeta.reset();
    this.dataMeta.reset();
  }

  _setFileName (fn) { this._fileName = fn; }

  error (e) {debugger; // !!
    const hash = {
      text: this.lexer.match,
      // token: this.terminals_[symbol] || symbol,
      line: this.lexer.thislineno,
      loc: this.lexer.thislloc,
      // expected: expected
      pos: this.lexer.showPosition()
    }
    e.hash = hash;
    if (this.recoverable) {
      this.recoverable(e)
    } else {
      throw e;
      this.reset();
    }
  }

}

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
  const oldParse = parser.parse;

  function runParser (input, filename = null) {
    const parserState = globalThis.PS = new ShapeMapParserState();
    parserState.schemaMeta.prefixes = Object.create(schemaPrefixesCopy);
    parserState.schemaMeta._setBase(schemaBase);
    parserState.dataMeta.prefixes = Object.create(dataPrefixesCopy);
    parserState.dataMeta._setBase(dataBase);
    parserState._setFileName(baseIRI);
    parserState._fileName = filename;
    try {
      return oldParse.call(parser, input, parserState);
    } catch (e) {
      // use the lexer's pretty-printing
      const lineNo = "lexer" in parser.yy ? parser.yy.lexer.yylineno + 1 : 1;
      const pos = "lexer" in parser.yy ? parser.yy.lexer.showPosition() : "";
      const t = Error(`${baseIRI}(${lineNo}): ${e.message}\n${pos}`);
      Error.captureStackTrace(t, runParser);
      parserState.reset();
      throw t;
    }
  }
  parser.parse = runParser;
  return parser;
}

return {
  construct: prepareParser
};
})();

if (true)
  module.exports = ShapeMapParser;


/***/ }),

/***/ 1014:
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
    Focus: { term: "FOCUS" },
    Start: { term: "START" },
    Wildcard: { term: "WILDCARD" },
  }
})();

// Export the `ShExValidator` class as a whole.
if (true)
  module.exports = ShapeMapSymbols;


/***/ }),

/***/ 6261:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* ShapeMap - javascript module to associate RDF nodes with labeled shapes.
 *
 * See README for description.
 */

const ShapeMapCjsModule = (function () {

  const symbols = __webpack_require__(1014)

  // Write the parser object directly into the symbols so the caller shares a
  // symbol space with ShapeMapJison for e.g. start and focus.
  symbols.Parser = __webpack_require__(3018)
  return symbols
})();

// Export the `ShExValidator` class as a whole.
if (true)
  module.exports = ShapeMapCjsModule;


/***/ }),

/***/ 2863:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/** @shexjs/loader - HTTP access functions for @shexjs library.
 * For `file:` access or dynamic loading of ShEx extensions, use `@shexjs/node`.
 *
 * load function(shExC, shExJ, turtle, jsonld, schemaOptions = {}, dataOptions = {})
 *   return promise of loaded schema URLs (ShExC and ShExJ), data files (turle, and jsonld)
 * loadExtensions function(globs[])
 *   prototype of loadExtensions. does nothing
 * GET function(url, mediaType)
 *   return promise of {contents, url}
 */

const ShExLoaderCjsModule = function (config = {}) {

  const ShExUtil = __webpack_require__(9443);
  const ShExParser = __webpack_require__(931);

  class WebError extends Error {
    constructor (msg, url) {
      super(msg)
      this.url = url
    }
  }

  class FetchError extends WebError {
    constructor (msg, url, status, text) {
      super(msg, url)
      this.status = status
      this.text = text
    }
  }

  class ResourceError extends WebError {
    constructor (msg, url) {
      super(msg)
      this.url = url
    }
  }

  class ResourceLoadControler {
    constructor (src) {
      this.schemasSeen = src.map(p => typeof p === "object" ? p.url : p) // loaded URLs
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
      this.toLoad = []
      this.results = []
      this.loaded = 0
    }
    add (promise) {
      this.toLoad.push(promise)
      const index = this.toLoad.length - 1
      promise.then(value => {
        ++this.loaded
        this.results[index] = value
        if (this.loaded === this.toLoad.length) {
          this.resolve(this.results)
        }
      }).catch(error => this.reject(error))
      return promise
    }
    allLoaded () {
      return this.toLoad.length > 0
        ? this.promise
        : Promise.resolve([])
    }
    loadNovelUrl (url, oldUrl = null) {
      if (this.schemasSeen.indexOf(url) !== -1)
        return false
      this.schemasSeen.push(url)
      if (oldUrl) {
        const oldI = this.schemasSeen.indexOf(oldUrl)
        if (oldI !== -1) {
          this.schemasSeen.splice(oldI, 1)
        }
      }
      return true
    }
  }

  const loader = {
    load: load,
    loadExtensions: LoadNoExtensions,
    GET,
    ResourceLoadControler,
    loadSchemaImports,
    WebError,
    FetchError,
  };
  return loader
  
  async function GET (url, mediaType) {
    let m;
    return (m = url.match("^data:([^,]+),(.*)$"))
      ? Promise.resolve({text: m[2], url: m[0]}) // Read from data: URL
      : (url.match("^(blob:)?[a-z]+://."))
      ? myHttpRequest(url, mediaType) // whatever fetch handles
      : (() => { throw new WebError(`Unrecognized URL protocol ${url}`) })()

    async function myHttpRequest(url, mediaType) {
      if (typeof config.fetch !== "function")
        throw new WebError(`Unable to fetch ${url} with fetch=${config.fetch}`)
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
        throw new WebError(`GET <${url}> network failure: ${e.message}`)
      }
      if (!resp.ok)
        throw new FetchError(`GET <${url}> failed: ${resp.status} ${resp.statusText}`, url, resp.status, resp.text)
      const text = await resp.text()
      return {text, url}
    }
  }

  function addMeta (url, mediaType, metaList) {
      const meta = {
        mediaType,
        url,
        base: url,
        prefixes: {}
      }
      metaList.push(meta)
      return meta
    }

  async function mergeSchema (obj, mediaType, resourceLoadControler, options) {
    if (!("schema" in obj))
      throw Error(`Bad parameter to mergeSchema; ${summarize(obj)} is not a loaded schema`)
    if (obj.schema.type !== "Schema")
      throw Error(`Bad parameter to mergeSchema .schema; ${summarize(obj.schema)} !== ""Schema`)
    try {
      loadSchemaImports(obj.schema, resourceLoadControler, options)
      return {mediaType, url: obj.url, schema: obj.schema}
    } catch (e) {
      const e2 = Error("error merging schema object " + obj.schema + ": " + e)
      e2.stack = e.stack
      throw e2
    }

    function summarize (o) {
      const marker = Math.random()
      const shallow = Object.keys(obj).reduce((acc, k) => {
        acc[k] = typeof obj[k] === "object" ? marker : obj[k]
        return acc
      }, {})
      return JSON.stringify(shallow).replace(new RegExp(marker, 'g'), "\u2026")
    }
  }

  async function mergeGraph (obj, mediaType, resourceLoadControler, options) {
    try {
      const graph = Array.isArray(typeof obj.graph)
            ? obj.graph
            : obj.graph.getQuads()
      return {mediaType, url: obj.url, graph}
    } catch (e) {
      const e2 = Error("error merging graph object " + obj.graph + ": " + e)
      e2.stack = e.stack
      throw e2
    }
  }

  function loadSchemaImports (schema, resourceLoadControler, schemaOptions) {
    if (!("imports" in schema))
      return schema
    if (schemaOptions.keepImports) {
      return schema
    }
    const ret = Object.assign({}, schema)
    const imports = ret.imports
    delete ret.imports // @@ needed? useful?

    schema.imports.map(
      i => "iriTransform" in schemaOptions ? schemaOptions.iriTransform(i) : i
    ).filter(
      i => resourceLoadControler.loadNovelUrl(i)
    ).map(i => {
      resourceLoadControler.add(loader.GET(i).then(loaded => {
        const meta = {
          // mediaType: mediaType,
          url: loaded.url,
          base: loaded.url,
          prefixes: {}
        }
        // metaList.push(meta)
        return parseShExC(loaded.text, "text/shex", loaded.url,
                          meta, schemaOptions, resourceLoadControler)
          .then(({mediaType, url, schema}) => {
            if (schema.start) // When some schema A imports schema B, B's start member is ignored.
              delete schema.start // — http://shex.io/spec/#import
            return {mediaType, url, schema}
          })
      })); // addAfter would be after invoking schema.
    })
    return ret
  }

  async function loadList (src, metaList, mediaType, parserWrapper, merger, options, resourceLoadControler) {
    return src.map(
      p => {
        const meta = addMeta(typeof p === "string" ? p : p.url, mediaType, metaList)
        let ret;
        if (typeof p === "string") {
          ret = loader.GET(p, mediaType).then(loaded => {
            meta.base = meta.url = loaded.url // update with wherever if ultimately loaded from after URL fixups and redirects
            resourceLoadControler.loadNovelUrl(loaded.url, p) // replace p with loaded.url in loaded list
            return parserWrapper(loaded.text, mediaType, loaded.url,
                                 meta, options, resourceLoadControler)
          })
        } else {
          if ("text" in p)
            ret = parserWrapper(p.text, mediaType, p.url, meta, options, resourceLoadControler);
          else
            ret = merger(p, mediaType, resourceLoadControler, options)
        }
        resourceLoadControler.add(ret)
        return ret
      }
    )
  }

  /* load - load shex and json files into a single Schema and turtle into
   * a graph (Data).
   * SOURCE may be
   * * file path or URL - where to load item.
   * * object: {text: string, url: string} - text and URL of already-loaded resource.
   * * (schema) ShExJ object
   * * (data) RdfJs data store
   * @param schema - { shexc: [ShExC SOURCE], json: [JSON SOURCE], turtle: [ShExR SOURCE] }
   * @param data - { turtle: [Turtle SOURCE], jsonld: [JSON-LD SOURCE] }
   * @param schemaOptions
   * @param dataOptions
   * @returns {Promise<{schema: any, dataMeta: *[], data: (*|null), schemaMeta: *[]}>}
   * @constructor
   */
  async function load (schema, data, schemaOptions = {}, dataOptions = {}) {
    const returns = {
      schema: ShExUtil.emptySchema(),
      data: config.rdfjs ? new config.rdfjs.Store() : null,
      schemaMeta: [],
      dataMeta: []
    };
    let allSchemas, allGraphs;

    // gather all the potentially remote inputs
    if (schemaOptions && "termResolver" in schemaOptions) {
      returns.resolverMeta = []
      // load the resolver then the schema sources,
      const allResolvers = new ResourceLoadControler(schemaOptions.termResolver);
      loadList(schemaOptions.termResolver, returns.resolverMeta, "text/turtle",
               parseTurtle, mergeGraph, dataOptions, allResolvers)
      const loadedResolvers = await allResolvers.allLoaded()
      returns.resolver = new config.rdfjs.Store()
      loadedResolvers.forEach(rSrc => {
        returns.resolver.addQuads(rSrc.graph)
        delete rSrc.graph;
      })
      schemaOptions.termResolver = ShExParser.dbTermResolver(returns.resolver)
    }
    {
      const {shexc = [], json = [], turtle = []} = schema || {};
      allSchemas = new ResourceLoadControler(shexc.concat(json).concat(turtle));
      loadList(shexc, returns.schemaMeta, "text/shex",
               parseShExC, mergeSchema, schemaOptions, allSchemas)
      loadList(json, returns.schemaMeta, "application/json",
               parseShExJ, mergeSchema, schemaOptions, allSchemas)
      loadList(turtle || [], returns.schemaMeta, "text/turtle",
               parseShExR, mergeSchema, schemaOptions, allSchemas)
    }

    {
      const {turtle = [], jsonld = []} = data || {};
      allGraphs = new ResourceLoadControler(turtle.concat(jsonld));
      loadList(turtle, returns.dataMeta, "text/turtle",
               parseTurtle, mergeGraph, dataOptions, allGraphs)
      loadList(jsonld, returns.dataMeta, "application/ld+json",
               parseJSONLD, mergeGraph, dataOptions, allGraphs)
    }

    const [schemaSrcs, dataSrcs] = await Promise.all([allSchemas.allLoaded(),
                                                      allGraphs.allLoaded()])
    schemaSrcs.forEach(sSrc => {
      ShExUtil.merge(returns.schema, sSrc.schema, schemaOptions.collisionPolicy, true)
      delete sSrc.schema;
    })
    dataSrcs.forEach(dSrc => {
      returns.data.addQuads(dSrc.graph)
      delete dSrc.graph;
    })
    if (returns.schemaMeta.length > 0)
      ShExUtil.isWellDefined(returns.schema)
    return returns
  }

  function parseShExC (text, mediaType, url, meta, schemaOptions, resourceLoadControler) {
    const parser = schemaOptions && "parser" in schemaOptions ?
        schemaOptions.parser :
        ShExParser.construct(url, {}, schemaOptions)
    try {
      meta.prefixes = {};
      const s = parser.parse(text, url, {meta}, /*filename*/)
      // !! horrible hack until I set a variable to know if there's a BASE.
      if (s.base === url) delete s.base
      loadSchemaImports(s, resourceLoadControler, schemaOptions)
      return Promise.resolve({mediaType, url, schema: s})
    } catch (e) {
      e.message = "error parsing ShEx " + url + ": " + e.message
      return Promise.reject(e)
    }
  }

  function parseShExJ (text, mediaType, url, meta, schemaOptions, resourceLoadControler) {
    try {
      const s = ShExUtil.ShExJtoAS(JSON.parse(text))
      meta.prefixes = {}
      meta.base = null
      loadSchemaImports(s, resourceLoadControler)
      return Promise.resolve({mediaType, url, schema: s})
    } catch (e) {
      const e2 = Error("error parsing JSON " + url + ": " + e)
      // e2.stack = e.stack
      return Promise.reject(e2)
    }
  }

  async function parseShExR (text, mediaType, url, meta, schemaOptions, resourceLoadControler) {
    try {
      const x = await parseTurtle(text, mediaType, url, meta, schemaOptions, resourceLoadControler)
      const graph = new config.rdfjs.Store();
      graph.addQuads(x.graph);
      const graphParser = new schemaOptions.graphParser.validator(
        schemaOptions.graphParser.schema,
        schemaOptions.graphParser.rdfjsdb(graph),
        {}
      );
      const schemaRoot = graph.getQuads(null, ShExUtil.RDF.type, "http://www.w3.org/ns/shex#Schema")[0].subject;
      const val = graphParser.validate(schemaRoot, schemaOptions.graphParser.validator.Start);
      if ("errors" in val)
        throw ResourceError(`${url} did not validate as a ShEx schema: ${JSON.stringify(val.errors, null, 2)}`, url)
      const schema = ShExUtil.ShExJtoAS(ShExUtil.ShExRtoShExJ(ShExUtil.valuesToSchema(ShExUtil.valToValues(val))));
      await loadSchemaImports(schema, resourceLoadControler); // shouldn't be any
      return Promise.resolve({mediaType, url, schema})
    } catch (e) {
      const e2 = Error("error parsing Turtle schema " + url + ": " + e)
      if (typeof e === "object" && "stack" in e)
        e2.stack = e.stack
      return Promise.reject(e2)
    }
  }

  function parseTurtle (text, mediaType, url, meta, dataOptions) {
    return new Promise(function (resolve, reject) {
      const graph = []
      new config.rdfjs.Parser({baseIRI: url, blankNodePrefix: "", format: "text/turtle"}).
        parse(text,
              function (error, quad, prefixes) {
                if (prefixes) {
                  meta.prefixes = prefixes
                  // data.addPrefixes(prefixes)
                }
                if (error) {
                  reject("error parsing " + url + ": " + error)
                } else if (quad) {
                  graph.push(quad)
                } else {
                  meta.base = this._base
                  resolve({mediaType, url, graph})
                }
              })
    })
  }

  async function parseJSONLD (text, mediaType, url, data, meta, dataOptions) {
    const struct = JSON.parse(text)
    try {
      const nquads = await config.jsonld.toRDF(struct, Object.assign(
        {
          format: "application/nquads",
          base: url
        },
        config.jsonLdOptions || {}
      ))
      meta.prefixes = {}; // @@ take from @context?
      meta.base = url;    // @@ take from @context.base? (or vocab?)
      return parseTurtle(nquads, mediaType, url, data, meta)
    } catch (lderr) {
      let e = lderr
      if ("details" in e) e = e.details
      if ("cause" in e) e = e.cause
      throw new ResourceError("error parsing JSON-ld " + url + ": " + e, url)
    }
  }

  function LoadNoExtensions (globs) { return []; }
}

if (true)
  module.exports = ShExLoaderCjsModule


/***/ }),

/***/ 9509:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;
/* parser generated by jison 0.3.0 */
/**
 * Returns a Parser implementing JisonParserApi and a Lexer implementing JisonLexerApi.
 */

  /*
    ShEx parser in the Jison parser generator format.
  */

  const UNBOUNDED = -1;

  const ShExUtil = __webpack_require__(9443);

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

  const absoluteIRI = /^[a-z][a-z0-9+.-]*:/i;

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

const { JisonParser, o } = __webpack_require__(9041);const $V0=[7,19,20,21,22,24,25,32,42,199,221,222],$V1=[20,22,221,222],$V2=[2,33],$V3=[1,24],$V4=[1,25],$V5=[2,12],$V6=[2,13],$V7=[2,14],$V8=[2,15],$V9=[7,19,20,21,22,24,25,32,42,221,222],$Va=[1,31],$Vb=[1,34],$Vc=[1,33],$Vd=[2,24],$Ve=[2,25],$Vf=[1,43],$Vg=[1,47],$Vh=[1,46],$Vi=[1,45],$Vj=[1,49],$Vk=[1,52],$Vl=[1,51],$Vm=[2,16],$Vn=[2,18],$Vo=[2,268],$Vp=[2,269],$Vq=[2,270],$Vr=[2,271],$Vs=[2,19],$Vt=[2,22],$Vu=[20,22,29,221],$Vv=[2,20],$Vw=[20,22,28,75,77,85,86,87,91,102,103,104,107,108,109,110,118,119,120,121,122,123,125,131,133,170,194,221,233],$Vx=[2,68],$Vy=[1,73],$Vz=[20,22,28,46,50,75,77,85,86,87,91,102,103,104,107,108,109,110,118,119,120,121,122,123,125,131,133,170,184,194,221,233,235],$VA=[2,35],$VB=[2,246],$VC=[2,247],$VD=[2,276],$VE=[199,201],$VF=[1,81],$VG=[1,84],$VH=[1,83],$VI=[2,17],$VJ=[1,92],$VK=[1,95],$VL=[1,94],$VM=[7,19,20,21,22,24,25,32,42,57,221,222],$VN=[2,54],$VO=[7,19,20,21,22,24,25,32,42,57,59,221,222],$VP=[2,61],$VQ=[125,131,133,194,233],$VR=[2,146],$VS=[1,128],$VT=[1,130],$VU=[1,123],$VV=[1,110],$VW=[1,118],$VX=[1,119],$VY=[1,120],$VZ=[1,127],$V_=[1,134],$V$=[1,135],$V01=[1,136],$V11=[1,137],$V21=[1,138],$V31=[1,139],$V41=[1,140],$V51=[1,141],$V61=[1,142],$V71=[1,131],$V81=[1,129],$V91=[2,69],$Va1=[20,22,28,75,77,91,102,103,104,107,108,109,110,118,119,120,121,122,123,125,131,133,170,194,221,233],$Vb1=[1,155],$Vc1=[1,154],$Vd1=[2,237],$Ve1=[2,238],$Vf1=[2,239],$Vg1=[2,23],$Vh1=[2,26],$Vi1=[1,163],$Vj1=[2,60],$Vk1=[1,165],$Vl1=[2,67],$Vm1=[2,76],$Vn1=[1,171],$Vo1=[1,172],$Vp1=[1,173],$Vq1=[2,72],$Vr1=[2,78],$Vs1=[1,180],$Vt1=[1,181],$Vu1=[1,182],$Vv1=[1,185],$Vw1=[1,188],$Vx1=[1,190],$Vy1=[1,191],$Vz1=[1,192],$VA1=[2,75],$VB1=[7,19,20,21,22,24,25,32,42,57,59,85,86,87,125,131,133,194,195,199,221,222,233],$VC1=[2,102],$VD1=[7,19,20,21,22,24,25,32,42,57,59,195,199,221,222],$VE1=[7,19,20,21,22,24,25,32,42,57,59,102,103,104,107,108,109,110,221,222],$VF1=[2,94],$VG1=[2,95],$VH1=[7,19,20,21,22,24,25,32,42,57,59,85,86,87,107,108,109,110,125,131,133,194,195,199,221,222,233],$VI1=[2,115],$VJ1=[2,114],$VK1=[7,19,20,21,22,24,25,32,42,57,59,107,108,109,110,118,119,120,121,122,123,195,199,221,222],$VL1=[2,109],$VM1=[2,108],$VN1=[7,19,20,21,22,24,25,32,42,57,59,102,103,104,107,108,109,110,195,199,221,222],$VO1=[2,98],$VP1=[2,99],$VQ1=[2,119],$VR1=[2,120],$VS1=[2,121],$VT1=[2,117],$VU1=[2,245],$VV1=[20,22,29,77,87,106,114,115,170,190,210,211,212,213,214,215,216,217,218,219,221],$VW1=[2,190],$VX1=[7,19,20,21,22,24,25,32,42,57,59,118,119,120,121,122,123,195,199,221,222],$VY1=[2,111],$VZ1=[1,215],$V_1=[1,217],$V$1=[1,219],$V02=[1,218],$V12=[2,125],$V22=[2,272],$V32=[2,273],$V42=[2,274],$V52=[2,275],$V62=[1,226],$V72=[1,227],$V82=[1,228],$V92=[1,229],$Va2=[106,114,115,212,213,214,215],$Vb2=[2,32],$Vc2=[2,37],$Vd2=[2,38],$Ve2=[2,39],$Vf2=[85,86,87,125,131,133,194,233],$Vg2=[1,292],$Vh2=[1,294],$Vi2=[1,287],$Vj2=[1,274],$Vk2=[1,282],$Vl2=[1,283],$Vm2=[1,284],$Vn2=[1,291],$Vo2=[1,295],$Vp2=[1,293],$Vq2=[2,55],$Vr2=[2,62],$Vs2=[2,71],$Vt2=[2,77],$Vu2=[2,73],$Vv2=[2,79],$Vw2=[7,19,20,21,22,24,25,32,42,57,59,107,108,109,110,195,199,221,222],$Vx2=[1,351],$Vy2=[1,359],$Vz2=[1,360],$VA2=[1,361],$VB2=[1,367],$VC2=[1,368],$VD2=[57,59],$VE2=[7,19,20,21,22,24,25,32,42,57,59,85,86,87,125,131,133,194,199,221,222,233],$VF2=[2,235],$VG2=[7,19,20,21,22,24,25,32,42,57,59,199,221,222],$VH2=[1,384],$VI2=[2,113],$VJ2=[2,118],$VK2=[2,105],$VL2=[1,390],$VM2=[2,106],$VN2=[2,107],$VO2=[2,112],$VP2=[7,19,20,21,22,24,25,32,42,57,59,102,103,104,107,108,109,110,199,221,222],$VQ2=[2,100],$VR2=[1,408],$VS2=[1,414],$VT2=[1,403],$VU2=[1,407],$VV2=[1,417],$VW2=[1,418],$VX2=[1,419],$VY2=[1,400],$VZ2=[1,406],$V_2=[1,420],$V$2=[1,421],$V03=[1,426],$V13=[1,427],$V23=[1,428],$V33=[1,429],$V43=[1,422],$V53=[1,423],$V63=[1,424],$V73=[1,425],$V83=[1,413],$V93=[20,22,75,166,170,205,221],$Va3=[2,174],$Vb3=[2,148],$Vc3=[1,442],$Vd3=[1,441],$Ve3=[1,452],$Vf3=[1,454],$Vg3=[1,455],$Vh3=[1,451],$Vi3=[1,453],$Vj3=[20,22,28,50,75,77,85,86,87,91,102,103,104,107,108,109,110,118,119,120,121,122,123,125,131,133,170,194,221,233],$Vk3=[2,124],$Vl3=[2,129],$Vm3=[2,131],$Vn3=[2,132],$Vo3=[2,133],$Vp3=[2,260],$Vq3=[2,261],$Vr3=[2,262],$Vs3=[2,263],$Vt3=[2,130],$Vu3=[2,42],$Vv3=[2,46],$Vw3=[2,49],$Vx3=[2,52],$Vy3=[20,22,28,46,50,75,77,85,86,87,91,102,103,104,107,108,109,110,118,119,120,121,122,123,125,131,133,170,184,194,195,199,221,233,235],$Vz3=[2,43],$VA3=[2,81],$VB3=[2,84],$VC3=[1,477],$VD3=[1,479],$VE3=[1,485],$VF3=[1,486],$VG3=[1,487],$VH3=[1,494],$VI3=[1,495],$VJ3=[1,496],$VK3=[1,499],$VL3=[2,48],$VM3=[1,577],$VN3=[2,51],$VO3=[1,613],$VP3=[2,74],$VQ3=[57,59,76],$VR3=[1,642],$VS3=[57,59,76,85,86,87,125,131,133,194,195,199,233],$VT3=[57,59,76,195,199],$VU3=[57,59,76,102,103,104,107,108,109,110,195,199],$VV3=[57,59,76,85,86,87,107,108,109,110,125,131,133,194,195,199,233],$VW3=[57,59,76,107,108,109,110,118,119,120,121,122,123,195,199],$VX3=[57,59,76,118,119,120,121,122,123,195,199],$VY3=[57,76],$VZ3=[7,19,20,21,22,24,25,32,42,57,59,85,86,87,125,131,133,194,221,222,233],$V_3=[2,104],$V$3=[2,103],$V04=[2,234],$V14=[1,684],$V24=[1,686],$V34=[1,687],$V44=[1,683],$V54=[1,685],$V64=[2,101],$V74=[2,116],$V84=[2,110],$V94=[2,122],$Va4=[2,123],$Vb4=[2,141],$Vc4=[2,189],$Vd4=[1,717],$Ve4=[20,22,29,77,87,106,114,115,170,183,190,210,211,212,213,214,215,216,217,218,219,221],$Vf4=[2,240],$Vg4=[2,241],$Vh4=[2,242],$Vi4=[2,253],$Vj4=[2,256],$Vk4=[2,250],$Vl4=[2,251],$Vm4=[2,252],$Vn4=[2,258],$Vo4=[2,259],$Vp4=[2,264],$Vq4=[2,265],$Vr4=[2,266],$Vs4=[2,267],$Vt4=[20,22,29,77,87,106,114,115,117,170,183,190,210,211,212,213,214,215,216,217,218,219,221],$Vu4=[2,153],$Vv4=[2,154],$Vw4=[1,725],$Vx4=[2,155],$Vy4=[127,141],$Vz4=[2,160],$VA4=[2,161],$VB4=[2,163],$VC4=[1,728],$VD4=[1,729],$VE4=[20,22,170,205,221],$VF4=[2,182],$VG4=[1,737],$VH4=[127,141,146,147],$VI4=[2,172],$VJ4=[57,125,131,133,194,233],$VK4=[57,59,125,131,133,194,233],$VL4=[2,285],$VM4=[1,770],$VN4=[1,771],$VO4=[1,772],$VP4=[1,782],$VQ4=[20,22,125,131,133,170,194,205,221,233],$VR4=[2,243],$VS4=[2,244],$VT4=[2,50],$VU4=[2,47],$VV4=[2,53],$VW4=[20,22,28,46,50,75,77,85,86,87,91,102,103,104,107,108,109,110,118,119,120,121,122,123,125,131,133,170,184,194,199,221,233,235],$VX4=[2,40],$VY4=[2,44],$VZ4=[2,80],$V_4=[2,82],$V$4=[2,41],$V05=[1,829],$V15=[1,835],$V25=[1,875],$V35=[1,922],$V45=[57,59,76,107,108,109,110,195,199],$V55=[57,59,76,85,86,87,125,131,133,194,199,233],$V65=[57,59,76,199],$V75=[1,965],$V85=[57,59,76,102,103,104,107,108,109,110,199],$V95=[1,975],$Va5=[1,1012],$Vb5=[1,1048],$Vc5=[2,236],$Vd5=[1,1059],$Ve5=[1,1061],$Vf5=[1,1062],$Vg5=[1,1060],$Vh5=[20,22,106,114,115,170,210,211,212,213,214,215,216,217,218,219,221],$Vi5=[1,1085],$Vj5=[1,1087],$Vk5=[1,1088],$Vl5=[1,1086],$Vm5=[1,1112],$Vn5=[1,1114],$Vo5=[1,1115],$Vp5=[1,1113],$Vq5=[1,1135],$Vr5=[1,1137],$Vs5=[1,1139],$Vt5=[20,22,29,77,87,106,114,115,170,184,190,210,211,212,213,214,215,216,217,218,219,221],$Vu5=[1,1143],$Vv5=[1,1149],$Vw5=[1,1152],$Vx5=[1,1153],$Vy5=[1,1154],$Vz5=[1,1142],$VA5=[1,1155],$VB5=[1,1156],$VC5=[1,1161],$VD5=[1,1162],$VE5=[1,1163],$VF5=[1,1164],$VG5=[1,1157],$VH5=[1,1158],$VI5=[1,1159],$VJ5=[1,1160],$VK5=[1,1148],$VL5=[2,254],$VM5=[2,257],$VN5=[2,142],$VO5=[2,156],$VP5=[2,158],$VQ5=[2,162],$VR5=[2,164],$VS5=[2,165],$VT5=[2,169],$VU5=[2,171],$VV5=[2,176],$VW5=[2,177],$VX5=[1,1183],$VY5=[1,1185],$VZ5=[1,1186],$V_5=[1,1182],$V$5=[1,1184],$V06=[1,1196],$V16=[2,230],$V26=[2,248],$V36=[2,249],$V46=[2,283],$V56=[2,287],$V66=[2,289],$V76=[2,92],$V86=[1,1217],$V96=[2,292],$Va6=[85,86,87,107,108,109,110,125,131,133,194,233],$Vb6=[57,59,107,108,109,110,118,119,120,121,122,123,125,131,133,194,233],$Vc6=[57,59,102,103,104,107,108,109,110,125,131,133,194,233],$Vd6=[2,96],$Ve6=[2,97],$Vf6=[57,59,118,119,120,121,122,123,125,131,133,194,233],$Vg6=[2,134],$Vh6=[2,83],$Vi6=[1,1276],$Vj6=[1,1312],$Vk6=[1,1371],$Vl6=[1,1377],$Vm6=[1,1409],$Vn6=[1,1415],$Vo6=[57,59,76,85,86,87,125,131,133,194,233],$Vp6=[57,59,76,102,103,104,107,108,109,110],$Vq6=[1,1473],$Vr6=[1,1520],$Vs6=[2,231],$Vt6=[2,232],$Vu6=[2,233],$Vv6=[7,19,20,21,22,24,25,32,42,57,59,85,86,87,117,125,131,133,194,195,199,221,222,233],$Vw6=[7,19,20,21,22,24,25,32,42,57,59,117,195,199,221,222],$Vx6=[7,19,20,21,22,24,25,32,42,57,59,102,103,104,107,108,109,110,117,195,199,221,222],$Vy6=[2,213],$Vz6=[1,1573],$VA6=[20,22,29,77,87,106,114,115,170,183,184,190,210,211,212,213,214,215,216,217,218,219,221],$VB6=[20,22,29,77,87,106,114,115,117,170,183,184,190,210,211,212,213,214,215,216,217,218,219,221],$VC6=[2,255],$VD6=[2,159],$VE6=[2,157],$VF6=[2,166],$VG6=[2,170],$VH6=[2,167],$VI6=[2,168],$VJ6=[1,1590],$VK6=[76,141],$VL6=[1,1593],$VM6=[1,1594],$VN6=[76,141,146,147],$VO6=[2,286],$VP6=[2,288],$VQ6=[2,290],$VR6=[2,93],$VS6=[57,59,107,108,109,110,125,131,133,194,233],$VT6=[1,1632],$VU6=[1,1642],$VV6=[1,1644],$VW6=[1,1645],$VX6=[1,1643],$VY6=[1,1685],$VZ6=[1,1732],$V_6=[1,1765],$V$6=[1,1767],$V07=[1,1768],$V17=[1,1766],$V27=[1,1791],$V37=[1,1793],$V47=[1,1794],$V57=[1,1792],$V67=[1,1818],$V77=[1,1820],$V87=[1,1821],$V97=[1,1819],$Va7=[1,1869],$Vb7=[1,1935],$Vc7=[1,1937],$Vd7=[1,1938],$Ve7=[1,1936],$Vf7=[1,1961],$Vg7=[1,1963],$Vh7=[1,1964],$Vi7=[1,1962],$Vj7=[1,1987],$Vk7=[1,1989],$Vl7=[1,1990],$Vm7=[1,1988],$Vn7=[1,2034],$Vo7=[1,2040],$Vp7=[1,2072],$Vq7=[1,2078],$Vr7=[127,141,146,147,195,199],$Vs7=[2,179],$Vt7=[1,2102],$Vu7=[1,2103],$Vv7=[1,2104],$Vw7=[1,2105],$Vx7=[127,141,146,147,162,163,164,165,195,199],$Vy7=[2,45],$Vz7=[57,127,141,146,147,162,163,164,165,195,199],$VA7=[2,58],$VB7=[57,59,127,141,146,147,162,163,164,165,195,199],$VC7=[2,65],$VD7=[1,2134],$VE7=[2,284],$VF7=[2,291],$VG7=[20,22,28,46,50,75,77,85,86,87,91,102,103,104,107,108,109,110,117,118,119,120,121,122,123,125,131,133,170,184,194,195,199,221,233,235],$VH7=[1,2247],$VI7=[1,2253],$VJ7=[1,2285],$VK7=[1,2291],$VL7=[1,2344],$VM7=[1,2377],$VN7=[1,2379],$VO7=[1,2380],$VP7=[1,2378],$VQ7=[1,2403],$VR7=[1,2405],$VS7=[1,2406],$VT7=[1,2404],$VU7=[1,2430],$VV7=[1,2432],$VW7=[1,2433],$VX7=[1,2431],$VY7=[1,2457],$VZ7=[1,2459],$V_7=[1,2460],$V$7=[1,2458],$V08=[1,2483],$V18=[1,2485],$V28=[1,2486],$V38=[1,2484],$V48=[1,2510],$V58=[1,2512],$V68=[1,2513],$V78=[1,2511],$V88=[57,59,76,85,86,87,117,125,131,133,194,195,199,233],$V98=[57,59,76,117,195,199],$Va8=[57,59,76,102,103,104,107,108,109,110,117,195,199],$Vb8=[1,2585],$Vc8=[2,180],$Vd8=[2,184],$Ve8=[2,185],$Vf8=[2,186],$Vg8=[2,187],$Vh8=[2,56],$Vi8=[2,63],$Vj8=[2,70],$Vk8=[2,90],$Vl8=[2,86],$Vm8=[1,2668],$Vn8=[2,89],$Vo8=[57,59,85,86,87,107,108,109,110,125,127,131,133,141,146,147,162,163,164,165,194,195,199,233],$Vp8=[57,59,85,86,87,125,127,131,133,141,146,147,162,163,164,165,194,195,199,233],$Vq8=[57,59,107,108,109,110,118,119,120,121,122,123,127,141,146,147,162,163,164,165,195,199],$Vr8=[57,59,102,103,104,107,108,109,110,127,141,146,147,162,163,164,165,195,199],$Vs8=[57,59,118,119,120,121,122,123,127,141,146,147,162,163,164,165,195,199],$Vt8=[1,2718],$Vu8=[1,2756],$Vv8=[1,2811],$Vw8=[1,2900],$Vx8=[1,2906],$Vy8=[1,2989],$Vz8=[1,3022],$VA8=[1,3024],$VB8=[1,3025],$VC8=[1,3023],$VD8=[1,3048],$VE8=[1,3050],$VF8=[1,3051],$VG8=[1,3049],$VH8=[1,3075],$VI8=[1,3077],$VJ8=[1,3078],$VK8=[1,3076],$VL8=[1,3102],$VM8=[1,3104],$VN8=[1,3105],$VO8=[1,3103],$VP8=[1,3128],$VQ8=[1,3130],$VR8=[1,3131],$VS8=[1,3129],$VT8=[1,3155],$VU8=[1,3157],$VV8=[1,3158],$VW8=[1,3156],$VX8=[127,141,146,147,199],$VY8=[1,3180],$VZ8=[2,59],$V_8=[2,66],$V$8=[2,85],$V09=[2,91],$V19=[2,87],$V29=[57,59,107,108,109,110,127,141,146,147,162,163,164,165,195,199],$V39=[1,3204],$V49=[76,141,146,147,195,199],$V59=[1,3213],$V69=[1,3214],$V79=[1,3215],$V89=[1,3216],$V99=[76,141,146,147,162,163,164,165,195,199],$Va9=[57,76,141,146,147,162,163,164,165,195,199],$Vb9=[57,59,76,141,146,147,162,163,164,165,195,199],$Vc9=[1,3245],$Vd9=[1,3272],$Ve9=[1,3295],$Vf9=[1,3326],$Vg9=[1,3359],$Vh9=[1,3361],$Vi9=[1,3362],$Vj9=[1,3360],$Vk9=[1,3385],$Vl9=[1,3387],$Vm9=[1,3388],$Vn9=[1,3386],$Vo9=[1,3412],$Vp9=[1,3414],$Vq9=[1,3415],$Vr9=[1,3413],$Vs9=[1,3439],$Vt9=[1,3441],$Vu9=[1,3442],$Vv9=[1,3440],$Vw9=[1,3465],$Vx9=[1,3467],$Vy9=[1,3468],$Vz9=[1,3466],$VA9=[1,3492],$VB9=[1,3494],$VC9=[1,3495],$VD9=[1,3493],$VE9=[1,3575],$VF9=[1,3581],$VG9=[2,181],$VH9=[2,57],$VI9=[1,3669],$VJ9=[2,64],$VK9=[1,3702],$VL9=[2,88],$VM9=[2,178],$VN9=[1,3747],$VO9=[57,59,76,85,86,87,107,108,109,110,125,131,133,141,146,147,162,163,164,165,194,195,199,233],$VP9=[57,59,76,85,86,87,125,131,133,141,146,147,162,163,164,165,194,195,199,233],$VQ9=[57,59,76,107,108,109,110,118,119,120,121,122,123,141,146,147,162,163,164,165,195,199],$VR9=[57,59,76,102,103,104,107,108,109,110,141,146,147,162,163,164,165,195,199],$VS9=[57,59,76,118,119,120,121,122,123,141,146,147,162,163,164,165,195,199],$VT9=[1,3852],$VU9=[1,3858],$VV9=[1,3921],$VW9=[1,3923],$VX9=[1,3924],$VY9=[1,3922],$VZ9=[1,3947],$V_9=[1,3949],$V$9=[1,3950],$V0a=[1,3948],$V1a=[1,3974],$V2a=[1,3976],$V3a=[1,3977],$V4a=[1,3975],$V5a=[1,4039],$V6a=[1,4041],$V7a=[1,4042],$V8a=[1,4040],$V9a=[1,4080],$Vaa=[1,4122],$Vba=[76,141,146,147,199],$Vca=[1,4152],$Vda=[57,59,76,107,108,109,110,141,146,147,162,163,164,165,195,199],$Vea=[1,4176],$Vfa=[1,4199],$Vga=[1,4293],$Vha=[1,4295],$Via=[1,4296],$Vja=[1,4294],$Vka=[1,4319],$Vla=[1,4321],$Vma=[1,4322],$Vna=[1,4320],$Voa=[1,4346],$Vpa=[1,4348],$Vqa=[1,4349],$Vra=[1,4347],$Vsa=[117,127,141,146,147,195,199],$Vta=[1,4394],$Vua=[1,4418],$Vva=[1,4460],$Vwa=[1,4493],$Vxa=[1,4533],$Vya=[1,4556],$Vza=[1,4558],$VAa=[1,4559],$VBa=[1,4557],$VCa=[1,4582],$VDa=[1,4584],$VEa=[1,4585],$VFa=[1,4583],$VGa=[1,4609],$VHa=[1,4611],$VIa=[1,4612],$VJa=[1,4610],$VKa=[1,4689],$VLa=[1,4732],$VMa=[1,4734],$VNa=[1,4735],$VOa=[1,4733],$VPa=[1,4773],$VQa=[1,4815],$VRa=[1,4905],$VSa=[76,117,141,146,147,195,199],$VTa=[1,4960],$VUa=[1,4984],$VVa=[1,5022],$VWa=[1,5068],$VXa=[1,5146],$VYa=[1,5195];

class ShExJisonParser extends JisonParser {
    constructor(yy = {}, lexer = new ShExJisonLexer(yy)) {
        super(yy, lexer);
        this.symbols_ = {"error":2,"shexDoc":3,"initParser":4,"Qdirective_E_Star":5,"Q_O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C_E_Opt":6,"EOF":7,"directive":8,"O_QnotStartAction_E_Or_QstartActions_E_C":9,"notStartAction":10,"startActions":11,"Qstatement_E_Star":12,"statement":13,"O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C":14,"baseDecl":15,"prefixDecl":16,"importDecl":17,"labelDecl":18,"IT_BASE":19,"IRIREF":20,"IT_PREFIX":21,"PNAME_NS":22,"iri":23,"IT_IMPORT":24,"IT_LABEL":25,"O_Qiri_E_Or_QGT_LBRACKET_E_S_Qiri_E_Star_S_QGT_RBRACKET_E_C":26,"Qiri_E_Star":27,"[":28,"]":29,"start":30,"shapeExprDecl":31,"IT_start":32,"=":33,"shapeAnd":34,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Star":35,"QcodeDecl_E_Plus":36,"codeDecl":37,"QIT_ABSTRACT_E_Opt":38,"shapeExprLabel":39,"Qrestriction_E_Star":40,"O_QshapeExpression_E_Or_QshapeRef_E_Or_QIT_EXTERNAL_E_C":41,"IT_ABSTRACT":42,"restriction":43,"shapeExpression":44,"shapeRef":45,"IT_EXTERNAL":46,"QIT_NOT_E_Opt":47,"shapeAtomNoRef":48,"QshapeOr_E_Opt":49,"IT_NOT":50,"shapeOr":51,"inlineShapeExpression":52,"inlineShapeOr":53,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Plus":54,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Plus":55,"O_QIT_OR_E_S_QshapeAnd_E_C":56,"IT_OR":57,"O_QIT_AND_E_S_QshapeNot_E_C":58,"IT_AND":59,"shapeNot":60,"inlineShapeAnd":61,"Q_O_QIT_OR_E_S_QinlineShapeAnd_E_C_E_Star":62,"O_QIT_OR_E_S_QinlineShapeAnd_E_C":63,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Star":64,"inlineShapeNot":65,"Q_O_QIT_AND_E_S_QinlineShapeNot_E_C_E_Star":66,"O_QIT_AND_E_S_QinlineShapeNot_E_C":67,"shapeAtom":68,"inlineShapeAtom":69,"nonLitNodeConstraint":70,"QshapeOrRef_E_Opt":71,"litNodeConstraint":72,"shapeOrRef":73,"QnonLitNodeConstraint_E_Opt":74,"(":75,")":76,".":77,"shapeDefinition":78,"nonLitInlineNodeConstraint":79,"QinlineShapeOrRef_E_Opt":80,"litInlineNodeConstraint":81,"inlineShapeOrRef":82,"QnonLitInlineNodeConstraint_E_Opt":83,"inlineShapeDefinition":84,"ATPNAME_LN":85,"ATPNAME_NS":86,"@":87,"Qannotation_E_Star":88,"semanticActions":89,"annotation":90,"IT_LITERAL":91,"QxsFacet_E_Star":92,"datatype":93,"valueSet":94,"QnumericFacet_E_Plus":95,"xsFacet":96,"numericFacet":97,"nonLiteralKind":98,"QstringFacet_E_Star":99,"QstringFacet_E_Plus":100,"stringFacet":101,"IT_IRI":102,"IT_BNODE":103,"IT_NONLITERAL":104,"stringLength":105,"INTEGER":106,"REGEXP":107,"IT_LENGTH":108,"IT_MINLENGTH":109,"IT_MAXLENGTH":110,"numericRange":111,"rawNumeric":112,"numericLength":113,"DECIMAL":114,"DOUBLE":115,"string":116,"^^":117,"IT_MININCLUSIVE":118,"IT_MINEXCLUSIVE":119,"IT_MAXINCLUSIVE":120,"IT_MAXEXCLUSIVE":121,"IT_TOTALDIGITS":122,"IT_FRACTIONDIGITS":123,"Q_O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C_E_Star":124,"{":125,"QtripleExpression_E_Opt":126,"}":127,"O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C":128,"extension":129,"extraPropertySet":130,"IT_CLOSED":131,"tripleExpression":132,"IT_EXTRA":133,"Qpredicate_E_Plus":134,"predicate":135,"oneOfTripleExpr":136,"groupTripleExpr":137,"multiElementOneOf":138,"Q_O_QGT_PIPE_E_S_QgroupTripleExpr_E_C_E_Plus":139,"O_QGT_PIPE_E_S_QgroupTripleExpr_E_C":140,"|":141,"singleElementGroup":142,"multiElementGroup":143,"unaryTripleExpr":144,"QGT_SEMI_E_Opt":145,",":146,";":147,"Q_O_QGT_SEMI_E_S_QunaryTripleExpr_E_C_E_Plus":148,"O_QGT_SEMI_E_S_QunaryTripleExpr_E_C":149,"Q_O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C_E_Opt":150,"O_QtripleConstraint_E_Or_QbracketedTripleExpr_E_C":151,"include":152,"O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C":153,"$":154,"tripleExprLabel":155,"tripleConstraint":156,"bracketedTripleExpr":157,"Qcardinality_E_Opt":158,"cardinality":159,"QsenseFlags_E_Opt":160,"senseFlags":161,"*":162,"+":163,"?":164,"REPEAT_RANGE":165,"^":166,"QvalueSetValue_E_Star":167,"valueSetValue":168,"iriRange":169,"STRING_GRAVE":170,"literalRange":171,"languageRange":172,"O_QiriExclusion_E_Plus_Or_QliteralExclusion_E_Plus_Or_QlanguageExclusion_E_Plus_C":173,"QiriExclusion_E_Plus":174,"iriExclusion":175,"QliteralExclusion_E_Plus":176,"literalExclusion":177,"QlanguageExclusion_E_Plus":178,"languageExclusion":179,"Q_O_QGT_TILDE_E_S_QiriExclusion_E_Star_C_E_Opt":180,"QiriExclusion_E_Star":181,"O_QGT_TILDE_E_S_QiriExclusion_E_Star_C":182,"~":183,"-":184,"QGT_TILDE_E_Opt":185,"literal":186,"Q_O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C_E_Opt":187,"QliteralExclusion_E_Star":188,"O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C":189,"LANGTAG":190,"Q_O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C_E_Opt":191,"O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C":192,"QlanguageExclusion_E_Star":193,"&":194,"//":195,"O_QiriOrLabel_E_Or_Qliteral_E_C":196,"iriOrLabel":197,"QcodeDecl_E_Star":198,"%":199,"O_QCODE_E_Or_QGT_MODULO_E_C":200,"CODE":201,"rdfLiteral":202,"numericLiteral":203,"booleanLiteral":204,"a":205,"blankNode":206,"langString":207,"Q_O_QGT_DTYPE_E_S_Qdatatype_E_C_E_Opt":208,"O_QGT_DTYPE_E_S_Qdatatype_E_C":209,"IT_true":210,"IT_false":211,"STRING_LITERAL1":212,"STRING_LITERAL_LONG1":213,"STRING_LITERAL2":214,"STRING_LITERAL_LONG2":215,"LANG_STRING_LITERAL1":216,"LANG_STRING_LITERAL_LONG1":217,"LANG_STRING_LITERAL2":218,"LANG_STRING_LITERAL_LONG2":219,"prefixedName":220,"PNAME_LN":221,"BLANK_NODE_LABEL":222,"O_QIT_EXTENDS_E_Or_QGT_AMP_E_C":223,"extendsShapeExpression":224,"extendsShapeOr":225,"extendsShapeAnd":226,"Q_O_QIT_OR_E_S_QextendsShapeAnd_E_C_E_Star":227,"O_QIT_OR_E_S_QextendsShapeAnd_E_C":228,"extendsShapeNot":229,"Q_O_QIT_AND_E_S_QextendsShapeNot_E_C_E_Star":230,"O_QIT_AND_E_S_QextendsShapeNot_E_C":231,"extendsShapeAtom":232,"IT_EXTENDS":233,"O_QIT_RESTRICTS_E_Or_QGT_MINUS_E_C":234,"IT_RESTRICTS":235,"$accept":0,"$end":1};
        this.terminals_ = {2:"error",7:"EOF",19:"IT_BASE",20:"IRIREF",21:"IT_PREFIX",22:"PNAME_NS",24:"IT_IMPORT",25:"IT_LABEL",28:"[",29:"]",32:"IT_start",33:"=",42:"IT_ABSTRACT",46:"IT_EXTERNAL",50:"IT_NOT",57:"IT_OR",59:"IT_AND",75:"(",76:")",77:".",85:"ATPNAME_LN",86:"ATPNAME_NS",87:"@",91:"IT_LITERAL",102:"IT_IRI",103:"IT_BNODE",104:"IT_NONLITERAL",106:"INTEGER",107:"REGEXP",108:"IT_LENGTH",109:"IT_MINLENGTH",110:"IT_MAXLENGTH",114:"DECIMAL",115:"DOUBLE",117:"^^",118:"IT_MININCLUSIVE",119:"IT_MINEXCLUSIVE",120:"IT_MAXINCLUSIVE",121:"IT_MAXEXCLUSIVE",122:"IT_TOTALDIGITS",123:"IT_FRACTIONDIGITS",125:"{",127:"}",131:"IT_CLOSED",133:"IT_EXTRA",141:"|",146:",",147:";",154:"$",162:"*",163:"+",164:"?",165:"REPEAT_RANGE",166:"^",170:"STRING_GRAVE",183:"~",184:"-",190:"LANGTAG",194:"&",195:"//",199:"%",201:"CODE",205:"a",210:"IT_true",211:"IT_false",212:"STRING_LITERAL1",213:"STRING_LITERAL_LONG1",214:"STRING_LITERAL2",215:"STRING_LITERAL_LONG2",216:"LANG_STRING_LITERAL1",217:"LANG_STRING_LITERAL_LONG1",218:"LANG_STRING_LITERAL2",219:"LANG_STRING_LITERAL_LONG2",221:"PNAME_LN",222:"BLANK_NODE_LABEL",233:"IT_EXTENDS",235:"IT_RESTRICTS"};
        this.productions_ = [0,[3,4],[4,0],[5,0],[5,2],[9,1],[9,1],[12,0],[12,2],[14,2],[6,0],[6,1],[8,1],[8,1],[8,1],[8,1],[15,2],[16,3],[17,2],[18,2],[27,0],[27,2],[26,1],[26,3],[10,1],[10,1],[30,4],[11,1],[36,1],[36,2],[13,1],[13,1],[31,4],[38,0],[38,1],[40,0],[40,2],[41,1],[41,1],[41,1],[44,3],[44,3],[44,2],[49,0],[49,1],[52,1],[51,1],[51,2],[56,2],[54,1],[54,2],[58,2],[55,1],[55,2],[35,0],[35,2],[53,2],[63,2],[62,0],[62,2],[34,2],[64,0],[64,2],[61,2],[67,2],[66,0],[66,2],[60,2],[47,0],[47,1],[65,2],[68,2],[68,1],[68,2],[68,3],[68,1],[71,0],[71,1],[74,0],[74,1],[48,2],[48,1],[48,2],[48,3],[48,1],[69,2],[69,1],[69,2],[69,3],[69,1],[80,0],[80,1],[83,0],[83,1],[73,1],[73,1],[82,1],[82,1],[45,1],[45,1],[45,2],[72,3],[88,0],[88,2],[70,3],[81,2],[81,2],[81,2],[81,1],[92,0],[92,2],[95,1],[95,2],[79,2],[79,1],[99,0],[99,2],[100,1],[100,2],[98,1],[98,1],[98,1],[96,1],[96,1],[101,2],[101,1],[105,1],[105,1],[105,1],[97,2],[97,2],[112,1],[112,1],[112,1],[112,3],[111,1],[111,1],[111,1],[111,1],[113,1],[113,1],[78,3],[84,4],[128,1],[128,1],[128,1],[124,0],[124,2],[126,0],[126,1],[130,2],[134,1],[134,2],[132,1],[136,1],[136,1],[138,2],[140,2],[139,1],[139,2],[137,1],[137,1],[142,2],[145,0],[145,1],[145,1],[143,3],[149,2],[149,2],[148,1],[148,2],[144,2],[144,1],[153,2],[150,0],[150,1],[151,1],[151,1],[157,6],[158,0],[158,1],[156,6],[160,0],[160,1],[159,1],[159,1],[159,1],[159,1],[161,1],[94,3],[167,0],[167,2],[168,1],[168,1],[168,1],[168,1],[168,2],[174,1],[174,2],[176,1],[176,2],[178,1],[178,2],[173,1],[173,1],[173,1],[169,2],[181,0],[181,2],[182,2],[180,0],[180,1],[175,3],[185,0],[185,1],[171,2],[188,0],[188,2],[189,2],[187,0],[187,1],[177,3],[172,2],[172,2],[193,0],[193,2],[192,2],[191,0],[191,1],[179,3],[152,2],[90,3],[196,1],[196,1],[89,1],[198,0],[198,2],[37,3],[200,1],[200,1],[186,1],[186,1],[186,1],[135,1],[135,1],[93,1],[39,1],[39,1],[155,1],[155,1],[203,1],[203,1],[203,1],[202,1],[202,2],[209,2],[208,0],[208,1],[204,1],[204,1],[116,1],[116,1],[116,1],[116,1],[207,1],[207,1],[207,1],[207,1],[23,1],[23,1],[220,1],[220,1],[197,1],[197,1],[197,1],[197,1],[206,1],[129,2],[224,1],[225,2],[228,2],[227,0],[227,2],[226,2],[231,2],[230,0],[230,2],[229,2],[232,2],[232,1],[232,2],[232,3],[232,1],[223,1],[223,1],[43,2],[234,1],[234,1]];
        this.table = [o($V0,[2,2],{3:1,4:2}),{1:[3]},o($V0,[2,3],{5:3}),o($V1,$V2,{6:4,8:5,14:6,15:7,16:8,17:9,18:10,9:11,10:16,11:17,30:18,31:19,36:20,38:22,37:23,7:[2,10],19:[1,12],21:[1,13],24:[1,14],25:[1,15],32:[1,21],42:$V3,199:$V4}),{7:[1,26]},o($V0,[2,4]),{7:[2,11]},o($V0,$V5),o($V0,$V6),o($V0,$V7),o($V0,$V8),o($V9,[2,7],{12:27}),{20:[1,28]},{22:[1,29]},{20:$Va,22:$Vb,23:30,220:32,221:$Vc},{20:$Va,22:$Vb,23:36,26:35,28:[1,37],220:32,221:$Vc},o($V9,[2,5]),o($V9,[2,6]),o($V9,$Vd),o($V9,$Ve),o($V9,[2,27],{37:38,199:$V4}),{33:[1,39]},{20:$Vf,22:$Vg,23:41,39:40,206:42,220:44,221:$Vh,222:$Vi},o($V0,[2,28]),o($V1,[2,34]),{20:$Vj,22:$Vk,23:48,220:50,221:$Vl},{1:[2,1]},o($V1,$V2,{13:53,8:54,10:55,15:56,16:57,17:58,18:59,30:60,31:61,38:67,7:[2,9],19:[1,62],21:[1,63],24:[1,64],25:[1,65],32:[1,66],42:$V3}),o($V0,$Vm),{20:$Va,22:$Vb,23:68,220:32,221:$Vc},o($V0,$Vn),o($V0,$Vo),o($V0,$Vp),o($V0,$Vq),o($V0,$Vr),o($V0,$Vs),o($V0,$Vt),o($Vu,$Vv,{27:69}),o($V0,[2,29]),o($Vw,$Vx,{34:70,60:71,47:72,50:$Vy}),o($Vz,$VA,{40:74}),o($Vz,$VB),o($Vz,$VC),o($Vz,$Vo),o($Vz,$Vp),o($Vz,$VD),o($Vz,$Vq),o($Vz,$Vr),{199:[1,77],200:75,201:[1,76]},o($VE,$Vo),o($VE,$Vp),o($VE,$Vq),o($VE,$Vr),o($V9,[2,8]),o($V9,[2,30]),o($V9,[2,31]),o($V9,$V5),o($V9,$V6),o($V9,$V7),o($V9,$V8),o($V9,$Vd),o($V9,$Ve),{20:[1,78]},{22:[1,79]},{20:$VF,22:$VG,23:80,220:82,221:$VH},{20:$VF,22:$VG,23:86,26:85,28:[1,87],220:82,221:$VH},{33:[1,88]},{20:$Vf,22:$Vg,23:41,39:89,206:42,220:44,221:$Vh,222:$Vi},o($V0,$VI),{20:$VJ,22:$VK,23:91,29:[1,90],220:93,221:$VL},o($VM,$VN,{35:96}),o($VO,$VP,{64:97}),o($VQ,$VR,{68:98,70:99,72:100,73:101,79:104,81:105,78:106,45:107,98:108,100:109,93:111,94:112,95:113,84:114,101:121,197:122,97:124,124:125,105:126,111:132,113:133,20:$VS,22:$VT,28:$VU,75:[1,102],77:[1,103],85:[1,115],86:[1,116],87:[1,117],91:$VV,102:$VW,103:$VX,104:$VY,107:$VZ,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:$V71,221:$V81}),o($Vw,$V91),o($Va1,$Vx,{41:143,43:144,44:145,45:146,234:148,47:149,46:[1,147],50:[1,150],85:[1,151],86:[1,152],87:[1,153],184:$Vb1,235:$Vc1}),o($V0,$Vd1),o($V0,$Ve1),o($V0,$Vf1),o($V9,$Vm),{20:$VF,22:$VG,23:156,220:82,221:$VH},o($V9,$Vn),o($V9,$Vo),o($V9,$Vp),o($V9,$Vq),o($V9,$Vr),o($V9,$Vs),o($V9,$Vt),o($Vu,$Vv,{27:157}),o($Vw,$Vx,{34:158,60:159,47:160,50:$Vy}),o($Vz,$VA,{40:161}),o($V0,$Vg1),o($Vu,[2,21]),o($Vu,$Vo),o($Vu,$Vp),o($Vu,$Vq),o($Vu,$Vr),o($V9,$Vh1,{56:162,57:$Vi1}),o($VM,$Vj1,{58:164,59:$Vk1}),o($VO,$Vl1),o($VO,$Vm1,{71:166,73:167,78:168,45:169,84:170,124:174,85:$Vn1,86:$Vo1,87:$Vp1,125:$VR,131:$VR,133:$VR,194:$VR,233:$VR}),o($VO,$Vq1),o($VO,$Vr1,{74:175,70:176,79:177,98:178,100:179,101:183,105:184,102:$Vs1,103:$Vt1,104:$Vu1,107:$Vv1,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{44:186,47:187,45:189,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($VO,$VA1),o($VB1,$VC1,{88:193}),o($VD1,$VC1,{88:194}),o($VE1,$VF1),o($VE1,$VG1),o($VH1,$VI1,{99:195}),o($VB1,$VJ1,{105:126,101:196,107:$VZ,108:$V_,109:$V$,110:$V01}),o($VK1,$VL1,{92:197}),o($VK1,$VL1,{92:198}),o($VK1,$VL1,{92:199}),o($VD1,$VM1,{111:132,113:133,97:200,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VN1,$VC1,{88:201}),o($VE1,$VO1),o($VE1,$VP1),{20:[1,205],22:[1,209],23:203,39:202,206:204,220:206,221:[1,208],222:[1,207]},o($VH1,$VQ1),o($VH1,$VR1),o($VH1,$VS1),o($VH1,$VT1),o($VK1,$VU1),o($VV1,$VW1,{167:210}),o($VX1,$VY1),{125:[1,211],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},{106:[1,220]},o($VH1,$V12),o($VK1,$V22),o($VK1,$V32),o($VK1,$V42),o($VK1,$V52),{106:[1,222],112:221,114:[1,223],115:[1,224],116:225,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,230]},{106:[2,126]},{106:[2,127]},{106:[2,128]},o($Va2,[2,135]),o($Va2,[2,136]),o($Va2,[2,137]),o($Va2,[2,138]),{106:[2,139]},{106:[2,140]},o($V9,$Vb2),o($Vz,[2,36]),o($V9,$Vc2),o($V9,$Vd2,{51:231,54:232,55:233,56:234,58:235,57:$Vi1,59:$Vk1}),o($V9,$Ve2),o($VQ,$VR,{73:236,78:237,45:238,84:239,124:243,85:[1,240],86:[1,241],87:[1,242]}),o($VQ,$VR,{79:104,81:105,98:108,100:109,93:111,94:112,95:113,84:114,101:121,197:122,97:124,124:125,105:126,111:132,113:133,48:244,70:245,72:246,78:247,20:$VS,22:$VT,28:$VU,75:[1,248],77:[1,249],91:$VV,102:$VW,103:$VX,104:$VY,107:$VZ,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:$V71,221:$V81}),o($Va1,$V91,{45:250,85:$Vn1,86:$Vo1,87:$Vp1}),o($VO,$VO1),o($VO,$VP1),{20:[1,254],22:[1,258],23:252,39:251,206:253,220:255,221:[1,257],222:[1,256]},o($Vf2,[2,296]),o($Vf2,[2,297]),o($V9,$VI),{20:$VJ,22:$VK,23:91,29:[1,259],220:93,221:$VL},o($VM,$VN,{35:260}),o($VO,$VP,{64:261}),o($VQ,$VR,{68:262,70:263,72:264,73:265,79:268,81:269,78:270,45:271,98:272,100:273,93:275,94:276,95:277,84:278,101:285,197:286,97:288,124:289,105:290,111:296,113:297,20:$Vg2,22:$Vh2,28:$Vi2,75:[1,266],77:[1,267],85:[1,279],86:[1,280],87:[1,281],91:$Vj2,102:$Vk2,103:$Vl2,104:$Vm2,107:$Vn2,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:$Vo2,221:$Vp2}),o($Va1,$Vx,{43:144,234:148,41:298,44:299,45:300,47:302,46:[1,301],50:[1,303],85:[1,304],86:[1,305],87:[1,306],184:$Vb1,235:$Vc1}),o($VM,$Vq2),o($Vw,$Vx,{34:307,60:308,47:309,50:$Vy}),o($VO,$Vr2),o($Vw,$Vx,{60:310,47:311,50:$Vy}),o($VO,$Vs2),o($VO,$Vt2),o($VO,$VF1),o($VO,$VG1),o($VD1,$VC1,{88:312}),o($VO,$VO1),o($VO,$VP1),{20:[1,316],22:[1,320],23:314,39:313,206:315,220:317,221:[1,319],222:[1,318]},{125:[1,321],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VO,$Vu2),o($VO,$Vv2),o($VD1,$VC1,{88:322}),o($Vw2,$VI1,{99:323}),o($VD1,$VJ1,{105:184,101:324,107:$Vv1,108:$V_,109:$V$,110:$V01}),o($Vw2,$VQ1),o($Vw2,$VR1),o($Vw2,$VS1),o($Vw2,$VT1),{106:[1,325]},o($Vw2,$V12),{76:[1,326]},o($VQ,$VR,{48:327,70:328,72:329,78:330,79:333,81:334,84:335,98:336,100:337,93:339,94:340,95:341,124:342,101:346,197:347,97:349,105:350,111:356,113:357,20:[1,352],22:[1,354],28:[1,348],75:[1,331],77:[1,332],91:[1,338],102:[1,343],103:[1,344],104:[1,345],107:$Vx2,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:[1,355],221:[1,353]}),o($Va1,$V91,{45:358,85:$Vy2,86:$Vz2,87:$VA2}),{51:362,54:363,55:364,56:365,57:$VB2,58:366,59:$VC2},o($VD2,$VO1),o($VD2,$VP1),{20:[1,372],22:[1,376],23:370,39:369,206:371,220:373,221:[1,375],222:[1,374]},o($VE2,$VF2,{89:377,90:378,198:379,195:[1,380]}),o($VG2,$VF2,{89:381,90:382,198:383,195:$VH2}),o($VB1,$VI2,{105:126,101:385,107:$VZ,108:$V_,109:$V$,110:$V01}),o($VH1,$VJ2),o($VD1,$VK2,{96:386,101:387,97:388,105:389,111:391,113:392,107:$VL2,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VD1,$VM2,{96:386,101:387,97:388,105:389,111:391,113:392,107:$VL2,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VD1,$VN2,{96:386,101:387,97:388,105:389,111:391,113:392,107:$VL2,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VX1,$VO2),o($VP2,$VF2,{89:393,90:394,198:395,195:[1,396]}),o($VE1,$VQ2),o($VE1,$VB),o($VE1,$VC),o($VE1,$Vo),o($VE1,$Vp),o($VE1,$VD),o($VE1,$Vq),o($VE1,$Vr),{20:$VR2,22:$VS2,23:404,29:[1,397],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($V93,$Va3,{126:430,132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,127:$Vb3,154:$Vc3,194:$Vd3}),o($VQ,[2,147]),o($VQ,[2,143]),o($VQ,[2,144]),o($VQ,[2,145]),o($Vw,$Vx,{224:443,225:444,226:445,229:446,47:447,50:$Vy}),{20:$Ve3,22:$Vf3,134:448,135:449,170:$Vg3,197:450,205:$Vh3,221:$Vi3},o($Vj3,[2,293]),o($Vj3,[2,294]),o($VH1,$Vk3),o($VX1,$Vl3),o($VX1,$Vm3),o($VX1,$Vn3),o($VX1,$Vo3),{117:[1,456]},{117:$Vp3},{117:$Vq3},{117:$Vr3},{117:$Vs3},o($VX1,$Vt3),o($V9,$Vu3),o($V9,$Vv3,{56:457,57:$Vi1}),o($VM,$VN,{35:458,58:459,59:$Vk1}),o($VM,$Vw3),o($VO,$Vx3),o($Vz,[2,295]),o($Vz,$VF1),o($Vz,$VG1),o($Vy3,$VC1,{88:460}),o($Vz,$VO1),o($Vz,$VP1),{20:[1,464],22:[1,468],23:462,39:461,206:463,220:465,221:[1,467],222:[1,466]},{125:[1,469],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($V9,$Vz3,{54:232,55:233,56:234,58:235,49:470,51:471,57:$Vi1,59:$Vk1}),o($VO,$Vm1,{73:167,78:168,45:169,84:170,124:174,71:472,85:$Vn1,86:$Vo1,87:$Vp1,125:$VR,131:$VR,133:$VR,194:$VR,233:$VR}),o($VO,$VA3),o($VO,$Vr1,{70:176,79:177,98:178,100:179,101:183,105:184,74:473,102:$Vs1,103:$Vt1,104:$Vu1,107:$Vv1,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:474,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($VO,$VB3),o($V9,$Vz3,{54:232,55:233,56:234,58:235,51:471,49:475,57:$Vi1,59:$Vk1}),o($VO,$VQ2),o($VO,$VB),o($VO,$VC),o($VO,$Vo),o($VO,$Vp),o($VO,$VD),o($VO,$Vq),o($VO,$Vr),o($V9,$Vg1),o($V9,$Vh1,{56:476,57:$VC3}),o($VM,$Vj1,{58:478,59:$VD3}),o($VO,$Vl1),o($VO,$Vm1,{71:480,73:481,78:482,45:483,84:484,124:488,85:$VE3,86:$VF3,87:$VG3,125:$VR,131:$VR,133:$VR,194:$VR,233:$VR}),o($VO,$Vq1),o($VO,$Vr1,{74:489,70:490,79:491,98:492,100:493,101:497,105:498,102:$VH3,103:$VI3,104:$VJ3,107:$VK3,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:500,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($VO,$VA1),o($VB1,$VC1,{88:501}),o($VD1,$VC1,{88:502}),o($VE1,$VF1),o($VE1,$VG1),o($VH1,$VI1,{99:503}),o($VB1,$VJ1,{105:290,101:504,107:$Vn2,108:$V_,109:$V$,110:$V01}),o($VK1,$VL1,{92:505}),o($VK1,$VL1,{92:506}),o($VK1,$VL1,{92:507}),o($VD1,$VM1,{111:296,113:297,97:508,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VN1,$VC1,{88:509}),o($VE1,$VO1),o($VE1,$VP1),{20:[1,513],22:[1,517],23:511,39:510,206:512,220:514,221:[1,516],222:[1,515]},o($VH1,$VQ1),o($VH1,$VR1),o($VH1,$VS1),o($VH1,$VT1),o($VK1,$VU1),o($VV1,$VW1,{167:518}),o($VX1,$VY1),{125:[1,519],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},{106:[1,520]},o($VH1,$V12),o($VK1,$V22),o($VK1,$V32),o($VK1,$V42),o($VK1,$V52),{106:[1,522],112:521,114:[1,523],115:[1,524],116:525,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,526]},o($V9,$Vb2),o($V9,$Vc2),o($V9,$Vd2,{51:527,54:528,55:529,56:530,58:531,57:$VC3,59:$VD3}),o($V9,$Ve2),o($VQ,$VR,{79:268,81:269,98:272,100:273,93:275,94:276,95:277,84:278,101:285,197:286,97:288,124:289,105:290,111:296,113:297,48:532,70:533,72:534,78:535,20:$Vg2,22:$Vh2,28:$Vi2,75:[1,536],77:[1,537],91:$Vj2,102:$Vk2,103:$Vl2,104:$Vm2,107:$Vn2,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:$Vo2,221:$Vp2}),o($Va1,$V91,{45:538,85:$VE3,86:$VF3,87:$VG3}),o($VO,$VO1),o($VO,$VP1),{20:[1,542],22:[1,546],23:540,39:539,206:541,220:543,221:[1,545],222:[1,544]},o($VM,$VL3),o($VO,$VP,{64:547}),o($VQ,$VR,{68:548,70:549,72:550,73:551,79:554,81:555,78:556,45:557,98:558,100:559,93:561,94:562,95:563,84:564,101:571,197:572,97:574,124:575,105:576,111:582,113:583,20:[1,578],22:[1,580],28:[1,573],75:[1,552],77:[1,553],85:[1,565],86:[1,566],87:[1,567],91:[1,560],102:[1,568],103:[1,569],104:[1,570],107:$VM3,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:[1,581],221:[1,579]}),o($VO,$VN3),o($VQ,$VR,{68:584,70:585,72:586,73:587,79:590,81:591,78:592,45:593,98:594,100:595,93:597,94:598,95:599,84:600,101:607,197:608,97:610,124:611,105:612,111:618,113:619,20:[1,614],22:[1,616],28:[1,609],75:[1,588],77:[1,589],85:[1,601],86:[1,602],87:[1,603],91:[1,596],102:[1,604],103:[1,605],104:[1,606],107:$VO3,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:[1,617],221:[1,615]}),o($VG2,$VF2,{90:382,198:383,89:620,195:$VH2}),o($VO,$VQ2),o($VO,$VB),o($VO,$VC),o($VO,$Vo),o($VO,$Vp),o($VO,$VD),o($VO,$Vq),o($VO,$Vr),o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:621,127:$Vb3,154:$Vc3,194:$Vd3}),o($VG2,$VF2,{90:382,198:383,89:622,195:$VH2}),o($VD1,$VI2,{105:184,101:623,107:$Vv1,108:$V_,109:$V$,110:$V01}),o($Vw2,$VJ2),o($Vw2,$Vk3),o($VO,$VP3),{49:624,51:625,54:363,55:364,56:365,57:$VB2,58:366,59:$VC2,76:$Vz3},o($VQ,$VR,{71:626,73:627,78:628,45:629,84:630,124:631,57:$Vm1,59:$Vm1,76:$Vm1,85:$Vy2,86:$Vz2,87:$VA2}),o($VQ3,$VA3),o($VQ3,$Vr1,{74:632,70:633,79:634,98:635,100:636,101:640,105:641,102:[1,637],103:[1,638],104:[1,639],107:$VR3,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:643,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($VQ3,$VB3),o($VS3,$VC1,{88:644}),o($VT3,$VC1,{88:645}),o($VU3,$VC1,{88:646}),o($VV3,$VI1,{99:647}),o($VS3,$VJ1,{105:350,101:648,107:$Vx2,108:$V_,109:$V$,110:$V01}),o($VW3,$VL1,{92:649}),o($VW3,$VL1,{92:650}),o($VW3,$VL1,{92:651}),o($VT3,$VM1,{111:356,113:357,97:652,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),{125:[1,653],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VV3,$VQ1),o($VV3,$VR1),o($VV3,$VS1),o($VV3,$VT1),o($VW3,$VU1),o($VV1,$VW1,{167:654}),o($VX3,$VY1),{106:[1,655]},o($VV3,$V12),o($VW3,$V22),o($VW3,$V32),o($VW3,$V42),o($VW3,$V52),{106:[1,657],112:656,114:[1,658],115:[1,659],116:660,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,661]},{49:662,51:625,54:363,55:364,56:365,57:$VB2,58:366,59:$VC2,76:$Vz3},o($VQ3,$VO1),o($VQ3,$VP1),{20:[1,666],22:[1,670],23:664,39:663,206:665,220:667,221:[1,669],222:[1,668]},{76:$Vu3},{56:671,57:$VB2,76:$Vv3},o($VY3,$VN,{35:672,58:673,59:$VC2}),o($VY3,$Vw3),o($VQ3,$Vx3),o($Vw,$Vx,{34:674,60:675,47:676,50:$Vy}),o($Vw,$Vx,{60:677,47:678,50:$Vy}),o($VD2,$VQ2),o($VD2,$VB),o($VD2,$VC),o($VD2,$Vo),o($VD2,$Vp),o($VD2,$VD),o($VD2,$Vq),o($VD2,$Vr),o($VZ3,$V_3),o($VB1,$V$3),o($VZ3,$V04,{37:679,199:[1,680]}),{20:$V14,22:$V24,135:681,170:$V34,197:682,205:$V44,221:$V54},o($VO,$V64),o($VD1,$V$3),o($VO,$V04,{37:688,199:[1,689]}),{20:$V14,22:$V24,135:690,170:$V34,197:682,205:$V44,221:$V54},o($VH1,$V74),o($VK1,$V84),o($VK1,$V94),o($VK1,$Va4),{106:[1,691]},o($VK1,$V12),{106:[1,693],112:692,114:[1,694],115:[1,695],116:696,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,697]},o($VE1,$Vb4),o($VN1,$V$3),o($VE1,$V04,{37:698,199:[1,699]}),{20:$V14,22:$V24,135:700,170:$V34,197:682,205:$V44,221:$V54},o($VK1,$Vc4),o($VV1,[2,191]),o($VV1,[2,192]),o($VV1,[2,193]),o($VV1,[2,194]),o($VV1,[2,195]),{173:701,174:702,175:705,176:703,177:706,178:704,179:707,184:[1,708]},o($VV1,[2,210],{180:709,182:710,183:[1,711]}),o($VV1,[2,219],{187:712,189:713,183:[1,714]}),o($VV1,[2,227],{191:715,192:716,183:$Vd4}),{183:$Vd4,192:718},o($Ve4,$Vo),o($Ve4,$Vp),o($Ve4,$Vf4),o($Ve4,$Vg4),o($Ve4,$Vh4),o($Ve4,$Vq),o($Ve4,$Vr),o($Ve4,$Vi4),o($Ve4,$Vj4,{208:719,209:720,117:[1,721]}),o($Ve4,$Vk4),o($Ve4,$Vl4),o($Ve4,$Vm4),o($Ve4,$Vn4),o($Ve4,$Vo4),o($Ve4,$Vp4),o($Ve4,$Vq4),o($Ve4,$Vr4),o($Ve4,$Vs4),o($Vt4,$Vp3),o($Vt4,$Vq3),o($Vt4,$Vr3),o($Vt4,$Vs3),{127:[1,722]},{127:[2,149]},{127:$Vu4},{127:$Vv4,139:723,140:724,141:$Vw4},{127:$Vx4},o($Vy4,$Vz4),o($Vy4,$VA4),o($Vy4,$VB4,{145:726,148:727,149:730,146:$VC4,147:$VD4}),o($VE4,$VF4,{151:731,156:732,157:733,160:734,161:736,75:[1,735],166:$VG4}),o($VH4,$VI4),o($V93,[2,175]),{20:[1,741],22:[1,745],23:739,155:738,206:740,220:742,221:[1,744],222:[1,743]},{20:[1,749],22:[1,753],23:747,155:746,206:748,220:750,221:[1,752],222:[1,751]},o($VQ,[2,277]),o($VQ,[2,278]),o($VJ4,[2,281],{227:754}),o($VK4,$VL4,{230:755}),o($VQ,$VR,{232:756,79:757,81:758,82:759,98:762,100:763,93:765,94:766,95:767,84:768,45:769,101:773,197:774,97:776,124:777,105:781,111:787,113:788,20:[1,783],22:[1,785],28:[1,775],75:[1,760],77:[1,761],85:[1,778],86:[1,779],87:[1,780],91:[1,764],102:$VM4,103:$VN4,104:$VO4,107:$VP4,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:[1,786],221:[1,784]}),o($VQ,[2,150],{197:450,135:789,20:$Ve3,22:$Vf3,170:$Vg3,205:$Vh3,221:$Vi3}),o($VQ4,[2,151]),o($VQ4,$VR4),o($VQ4,$VS4),o($VQ4,$V22),o($VQ4,$V32),o($VQ4,$V42),o($VQ4,$V52),{20:[1,792],22:[1,794],93:790,170:[1,795],197:791,221:[1,793]},o($VM,$VT4),o($V9,$VU4,{56:162,57:$Vi1}),o($VO,$VV4),o($VW4,$VF2,{89:796,90:797,198:798,195:[1,799]}),o($Vz,$VQ2),o($Vz,$VB),o($Vz,$VC),o($Vz,$Vo),o($Vz,$Vp),o($Vz,$VD),o($Vz,$Vq),o($Vz,$Vr),o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:800,127:$Vb3,154:$Vc3,194:$Vd3}),o($V9,$VX4),o($V9,$VY4),o($VO,$VZ4),o($VO,$V_4),{76:[1,801]},o($V9,$V$4),o($VM,$Vq2),o($Vw,$Vx,{34:802,60:803,47:804,50:$Vy}),o($VO,$Vr2),o($Vw,$Vx,{60:805,47:806,50:$Vy}),o($VO,$Vs2),o($VO,$Vt2),o($VO,$VF1),o($VO,$VG1),o($VD1,$VC1,{88:807}),o($VO,$VO1),o($VO,$VP1),{20:[1,811],22:[1,815],23:809,39:808,206:810,220:812,221:[1,814],222:[1,813]},{125:[1,816],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VO,$Vu2),o($VO,$Vv2),o($VD1,$VC1,{88:817}),o($Vw2,$VI1,{99:818}),o($VD1,$VJ1,{105:498,101:819,107:$VK3,108:$V_,109:$V$,110:$V01}),o($Vw2,$VQ1),o($Vw2,$VR1),o($Vw2,$VS1),o($Vw2,$VT1),{106:[1,820]},o($Vw2,$V12),{76:[1,821]},o($VE2,$VF2,{89:822,90:823,198:824,195:[1,825]}),o($VG2,$VF2,{89:826,90:827,198:828,195:$V05}),o($VB1,$VI2,{105:290,101:830,107:$Vn2,108:$V_,109:$V$,110:$V01}),o($VH1,$VJ2),o($VD1,$VK2,{96:831,101:832,97:833,105:834,111:836,113:837,107:$V15,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VD1,$VM2,{96:831,101:832,97:833,105:834,111:836,113:837,107:$V15,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VD1,$VN2,{96:831,101:832,97:833,105:834,111:836,113:837,107:$V15,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VX1,$VO2),o($VP2,$VF2,{89:838,90:839,198:840,195:[1,841]}),o($VE1,$VQ2),o($VE1,$VB),o($VE1,$VC),o($VE1,$Vo),o($VE1,$Vp),o($VE1,$VD),o($VE1,$Vq),o($VE1,$Vr),{20:$VR2,22:$VS2,23:404,29:[1,842],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:843,127:$Vb3,154:$Vc3,194:$Vd3}),o($VH1,$Vk3),o($VX1,$Vl3),o($VX1,$Vm3),o($VX1,$Vn3),o($VX1,$Vo3),{117:[1,844]},o($VX1,$Vt3),o($V9,$Vu3),o($V9,$Vv3,{56:845,57:$VC3}),o($VM,$VN,{35:846,58:847,59:$VD3}),o($VM,$Vw3),o($VO,$Vx3),o($V9,$Vz3,{54:528,55:529,56:530,58:531,49:848,51:849,57:$VC3,59:$VD3}),o($VO,$Vm1,{73:481,78:482,45:483,84:484,124:488,71:850,85:$VE3,86:$VF3,87:$VG3,125:$VR,131:$VR,133:$VR,194:$VR,233:$VR}),o($VO,$VA3),o($VO,$Vr1,{70:490,79:491,98:492,100:493,101:497,105:498,74:851,102:$VH3,103:$VI3,104:$VJ3,107:$VK3,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:852,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($VO,$VB3),o($V9,$Vz3,{54:528,55:529,56:530,58:531,51:849,49:853,57:$VC3,59:$VD3}),o($VO,$VQ2),o($VO,$VB),o($VO,$VC),o($VO,$Vo),o($VO,$Vp),o($VO,$VD),o($VO,$Vq),o($VO,$Vr),o($VM,$Vj1,{58:854,59:[1,855]}),o($VO,$Vl1),o($VO,$Vm1,{71:856,73:857,78:858,45:859,84:860,124:864,85:[1,861],86:[1,862],87:[1,863],125:$VR,131:$VR,133:$VR,194:$VR,233:$VR}),o($VO,$Vq1),o($VO,$Vr1,{74:865,70:866,79:867,98:868,100:869,101:873,105:874,102:[1,870],103:[1,871],104:[1,872],107:$V25,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:876,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($VO,$VA1),o($VB1,$VC1,{88:877}),o($VD1,$VC1,{88:878}),o($VE1,$VF1),o($VE1,$VG1),o($VH1,$VI1,{99:879}),o($VB1,$VJ1,{105:576,101:880,107:$VM3,108:$V_,109:$V$,110:$V01}),o($VK1,$VL1,{92:881}),o($VK1,$VL1,{92:882}),o($VK1,$VL1,{92:883}),o($VD1,$VM1,{111:582,113:583,97:884,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VN1,$VC1,{88:885}),o($VE1,$VO1),o($VE1,$VP1),{20:[1,889],22:[1,893],23:887,39:886,206:888,220:890,221:[1,892],222:[1,891]},o($VH1,$VQ1),o($VH1,$VR1),o($VH1,$VS1),o($VH1,$VT1),o($VK1,$VU1),o($VV1,$VW1,{167:894}),o($VX1,$VY1),{125:[1,895],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},{106:[1,896]},o($VH1,$V12),o($VK1,$V22),o($VK1,$V32),o($VK1,$V42),o($VK1,$V52),{106:[1,898],112:897,114:[1,899],115:[1,900],116:901,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,902]},o($VO,$Vl1),o($VO,$Vm1,{71:903,73:904,78:905,45:906,84:907,124:911,85:[1,908],86:[1,909],87:[1,910],125:$VR,131:$VR,133:$VR,194:$VR,233:$VR}),o($VO,$Vq1),o($VO,$Vr1,{74:912,70:913,79:914,98:915,100:916,101:920,105:921,102:[1,917],103:[1,918],104:[1,919],107:$V35,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:923,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($VO,$VA1),o($VB1,$VC1,{88:924}),o($VD1,$VC1,{88:925}),o($VE1,$VF1),o($VE1,$VG1),o($VH1,$VI1,{99:926}),o($VB1,$VJ1,{105:612,101:927,107:$VO3,108:$V_,109:$V$,110:$V01}),o($VK1,$VL1,{92:928}),o($VK1,$VL1,{92:929}),o($VK1,$VL1,{92:930}),o($VD1,$VM1,{111:618,113:619,97:931,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VN1,$VC1,{88:932}),o($VE1,$VO1),o($VE1,$VP1),{20:[1,936],22:[1,940],23:934,39:933,206:935,220:937,221:[1,939],222:[1,938]},o($VH1,$VQ1),o($VH1,$VR1),o($VH1,$VS1),o($VH1,$VT1),o($VK1,$VU1),o($VV1,$VW1,{167:941}),o($VX1,$VY1),{125:[1,942],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},{106:[1,943]},o($VH1,$V12),o($VK1,$V22),o($VK1,$V32),o($VK1,$V42),o($VK1,$V52),{106:[1,945],112:944,114:[1,946],115:[1,947],116:948,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,949]},o($VO,$Vb4),{127:[1,950]},o($VO,$V_3),o($Vw2,$V74),{76:$VX4},{76:$VY4},o($VQ3,$VZ4),o($VQ3,$Vt2),o($VQ3,$VF1),o($VQ3,$VG1),o($VT3,$VC1,{88:951}),{125:[1,952],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VQ3,$V_4),o($VQ3,$Vv2),o($VT3,$VC1,{88:953}),o($V45,$VI1,{99:954}),o($VT3,$VJ1,{105:641,101:955,107:$VR3,108:$V_,109:$V$,110:$V01}),o($V45,$VQ1),o($V45,$VR1),o($V45,$VS1),o($V45,$VT1),{106:[1,956]},o($V45,$V12),{76:[1,957]},o($V55,$VF2,{89:958,90:959,198:960,195:[1,961]}),o($V65,$VF2,{89:962,90:963,198:964,195:$V75}),o($V85,$VF2,{89:966,90:967,198:968,195:[1,969]}),o($VS3,$VI2,{105:350,101:970,107:$Vx2,108:$V_,109:$V$,110:$V01}),o($VV3,$VJ2),o($VT3,$VK2,{96:971,101:972,97:973,105:974,111:976,113:977,107:$V95,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VT3,$VM2,{96:971,101:972,97:973,105:974,111:976,113:977,107:$V95,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VT3,$VN2,{96:971,101:972,97:973,105:974,111:976,113:977,107:$V95,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VX3,$VO2),o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:978,127:$Vb3,154:$Vc3,194:$Vd3}),{20:$VR2,22:$VS2,23:404,29:[1,979],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($VV3,$Vk3),o($VX3,$Vl3),o($VX3,$Vm3),o($VX3,$Vn3),o($VX3,$Vo3),{117:[1,980]},o($VX3,$Vt3),{76:$V$4},o($VQ3,$VQ2),o($VQ3,$VB),o($VQ3,$VC),o($VQ3,$Vo),o($VQ3,$Vp),o($VQ3,$VD),o($VQ3,$Vq),o($VQ3,$Vr),o($VY3,$VT4),{56:981,57:$VB2,76:$VU4},o($VQ3,$VV4),o($VY3,$VL3),o($VQ3,$VP,{64:982}),o($VQ,$VR,{68:983,70:984,72:985,73:986,79:989,81:990,78:991,45:992,98:993,100:994,93:996,94:997,95:998,84:999,101:1006,197:1007,97:1009,124:1010,105:1011,111:1017,113:1018,20:[1,1013],22:[1,1015],28:[1,1008],75:[1,987],77:[1,988],85:[1,1000],86:[1,1001],87:[1,1002],91:[1,995],102:[1,1003],103:[1,1004],104:[1,1005],107:$Va5,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:[1,1016],221:[1,1014]}),o($VQ3,$VN3),o($VQ,$VR,{68:1019,70:1020,72:1021,73:1022,79:1025,81:1026,78:1027,45:1028,98:1029,100:1030,93:1032,94:1033,95:1034,84:1035,101:1042,197:1043,97:1045,124:1046,105:1047,111:1053,113:1054,20:[1,1049],22:[1,1051],28:[1,1044],75:[1,1023],77:[1,1024],85:[1,1036],86:[1,1037],87:[1,1038],91:[1,1031],102:[1,1039],103:[1,1040],104:[1,1041],107:$Vb5,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:[1,1052],221:[1,1050]}),o($VE2,$Vc5),{20:$Vj,22:$Vk,23:1055,220:50,221:$Vl},{20:$Vd5,22:$Ve5,106:[1,1068],114:[1,1069],115:[1,1070],116:1067,170:$Vf5,186:1058,196:1056,197:1057,202:1063,203:1064,204:1065,207:1066,210:[1,1071],211:[1,1072],212:[1,1077],213:[1,1078],214:[1,1079],215:[1,1080],216:[1,1073],217:[1,1074],218:[1,1075],219:[1,1076],221:$Vg5},o($Vh5,$VR4),o($Vh5,$VS4),o($Vh5,$V22),o($Vh5,$V32),o($Vh5,$V42),o($Vh5,$V52),o($VG2,$Vc5),{20:$Vj,22:$Vk,23:1081,220:50,221:$Vl},{20:$Vi5,22:$Vj5,106:[1,1094],114:[1,1095],115:[1,1096],116:1093,170:$Vk5,186:1084,196:1082,197:1083,202:1089,203:1090,204:1091,207:1092,210:[1,1097],211:[1,1098],212:[1,1103],213:[1,1104],214:[1,1105],215:[1,1106],216:[1,1099],217:[1,1100],218:[1,1101],219:[1,1102],221:$Vl5},o($VK1,$Vk3),o($VK1,$Vl3),o($VK1,$Vm3),o($VK1,$Vn3),o($VK1,$Vo3),{117:[1,1107]},o($VK1,$Vt3),o($VP2,$Vc5),{20:$Vj,22:$Vk,23:1108,220:50,221:$Vl},{20:$Vm5,22:$Vn5,106:[1,1121],114:[1,1122],115:[1,1123],116:1120,170:$Vo5,186:1111,196:1109,197:1110,202:1116,203:1117,204:1118,207:1119,210:[1,1124],211:[1,1125],212:[1,1130],213:[1,1131],214:[1,1132],215:[1,1133],216:[1,1126],217:[1,1127],218:[1,1128],219:[1,1129],221:$Vp5},o($VV1,[2,196]),o($VV1,[2,203],{175:1134,184:$Vq5}),o($VV1,[2,204],{177:1136,184:$Vr5}),o($VV1,[2,205],{179:1138,184:$Vs5}),o($Vt5,[2,197]),o($Vt5,[2,199]),o($Vt5,[2,201]),{20:$Vu5,22:$Vv5,23:1140,106:$Vw5,114:$Vx5,115:$Vy5,116:1151,186:1141,190:$Vz5,202:1145,203:1146,204:1147,207:1150,210:$VA5,211:$VB5,212:$VC5,213:$VD5,214:$VE5,215:$VF5,216:$VG5,217:$VH5,218:$VI5,219:$VJ5,220:1144,221:$VK5},o($VV1,[2,206]),o($VV1,[2,211]),o($Vt5,[2,207],{181:1165}),o($VV1,[2,215]),o($VV1,[2,220]),o($Vt5,[2,216],{188:1166}),o($VV1,[2,222]),o($VV1,[2,228]),o($Vt5,[2,224],{193:1167}),o($VV1,[2,223]),o($Ve4,$VL5),o($Ve4,$VM5),{20:[1,1170],22:[1,1172],93:1168,170:[1,1173],197:1169,221:[1,1171]},o($VN1,$VN5),{127:$VO5,140:1174,141:$Vw4},o($Vy4,$VP5),o($V93,$Va3,{142:435,143:436,144:437,150:438,152:439,153:440,137:1175,154:$Vc3,194:$Vd3}),o($Vy4,$VQ5),o($Vy4,$VB4,{145:1176,149:1177,146:$VC4,147:$VD4}),o($V93,$Va3,{150:438,152:439,153:440,144:1178,127:$VR5,141:$VR5,154:$Vc3,194:$Vd3}),o($V93,$Va3,{150:438,152:439,153:440,144:1179,127:$VS5,141:$VS5,154:$Vc3,194:$Vd3}),o($VH4,$VT5),o($VH4,$VU5),o($VH4,$VV5),o($VH4,$VW5),{20:$VX5,22:$VY5,135:1180,170:$VZ5,197:1181,205:$V_5,221:$V$5},o($V93,$Va3,{153:440,132:1187,136:1188,137:1189,138:1190,142:1191,143:1192,144:1193,150:1194,152:1195,154:$Vc3,194:$V06}),o($VE4,[2,183]),o($VE4,[2,188]),o($VH4,$V16),o($VH4,$V26),o($VH4,$V36),o($VH4,$Vo),o($VH4,$Vp),o($VH4,$VD),o($VH4,$Vq),o($VH4,$Vr),o($V93,[2,173]),o($V93,$V26),o($V93,$V36),o($V93,$Vo),o($V93,$Vp),o($V93,$VD),o($V93,$Vq),o($V93,$Vr),o($VQ,[2,279],{228:1197,57:[1,1198]}),o($VJ4,$V46,{231:1199,59:[1,1200]}),o($VK4,$V56),o($VQ,$VR,{82:1201,84:1202,45:1203,124:1204,85:[1,1205],86:[1,1206],87:[1,1207]}),o($VK4,$V66),o($VK4,$V76,{83:1208,79:1209,98:1210,100:1211,101:1215,105:1216,102:[1,1212],103:[1,1213],104:[1,1214],107:$V86,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:1218,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($VK4,$V96),o($Va6,$VI1,{99:1219}),o($Vf2,$VJ1,{105:781,101:1220,107:$VP4,108:$V_,109:$V$,110:$V01}),o($Vb6,$VL1,{92:1221}),o($Vb6,$VL1,{92:1222}),o($Vb6,$VL1,{92:1223}),o($VK4,$VM1,{111:787,113:788,97:1224,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vc6,$Vd6),o($Vc6,$Ve6),o($Va6,$VQ1),o($Va6,$VR1),o($Va6,$VS1),o($Va6,$VT1),o($Vb6,$VU1),o($VV1,$VW1,{167:1225}),o($Vf6,$VY1),{125:[1,1226],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($Vc6,$VO1),o($Vc6,$VP1),{20:[1,1230],22:[1,1234],23:1228,39:1227,206:1229,220:1231,221:[1,1233],222:[1,1232]},{106:[1,1235]},o($Va6,$V12),o($Vb6,$V22),o($Vb6,$V32),o($Vb6,$V42),o($Vb6,$V52),{106:[1,1237],112:1236,114:[1,1238],115:[1,1239],116:1240,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,1241]},o($VQ4,[2,152]),o($VX1,$Vg6),o($VX1,$VU1),o($VX1,$V22),o($VX1,$V32),o($VX1,$V42),o($VX1,$V52),o($Vz,$Vb4),o($Vy3,$V$3),o($Vz,$V04,{37:1242,199:[1,1243]}),{20:$V14,22:$V24,135:1244,170:$V34,197:682,205:$V44,221:$V54},{127:[1,1245]},o($VO,$Vh6),o($VM,$VL3),o($VO,$VP,{64:1246}),o($VQ,$VR,{68:1247,70:1248,72:1249,73:1250,79:1253,81:1254,78:1255,45:1256,98:1257,100:1258,93:1260,94:1261,95:1262,84:1263,101:1270,197:1271,97:1273,124:1274,105:1275,111:1281,113:1282,20:[1,1277],22:[1,1279],28:[1,1272],75:[1,1251],77:[1,1252],85:[1,1264],86:[1,1265],87:[1,1266],91:[1,1259],102:[1,1267],103:[1,1268],104:[1,1269],107:$Vi6,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:[1,1280],221:[1,1278]}),o($VO,$VN3),o($VQ,$VR,{68:1283,70:1284,72:1285,73:1286,79:1289,81:1290,78:1291,45:1292,98:1293,100:1294,93:1296,94:1297,95:1298,84:1299,101:1306,197:1307,97:1309,124:1310,105:1311,111:1317,113:1318,20:[1,1313],22:[1,1315],28:[1,1308],75:[1,1287],77:[1,1288],85:[1,1300],86:[1,1301],87:[1,1302],91:[1,1295],102:[1,1303],103:[1,1304],104:[1,1305],107:$Vj6,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:[1,1316],221:[1,1314]}),o($VG2,$VF2,{90:827,198:828,89:1319,195:$V05}),o($VO,$VQ2),o($VO,$VB),o($VO,$VC),o($VO,$Vo),o($VO,$Vp),o($VO,$VD),o($VO,$Vq),o($VO,$Vr),o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:1320,127:$Vb3,154:$Vc3,194:$Vd3}),o($VG2,$VF2,{90:827,198:828,89:1321,195:$V05}),o($VD1,$VI2,{105:498,101:1322,107:$VK3,108:$V_,109:$V$,110:$V01}),o($Vw2,$VJ2),o($Vw2,$Vk3),o($VO,$VP3),o($VZ3,$V_3),o($VB1,$V$3),o($VZ3,$V04,{37:1323,199:[1,1324]}),{20:$V14,22:$V24,135:1325,170:$V34,197:682,205:$V44,221:$V54},o($VO,$V64),o($VD1,$V$3),o($VO,$V04,{37:1326,199:[1,1327]}),{20:$V14,22:$V24,135:1328,170:$V34,197:682,205:$V44,221:$V54},o($VH1,$V74),o($VK1,$V84),o($VK1,$V94),o($VK1,$Va4),{106:[1,1329]},o($VK1,$V12),{106:[1,1331],112:1330,114:[1,1332],115:[1,1333],116:1334,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,1335]},o($VE1,$Vb4),o($VN1,$V$3),o($VE1,$V04,{37:1336,199:[1,1337]}),{20:$V14,22:$V24,135:1338,170:$V34,197:682,205:$V44,221:$V54},o($VK1,$Vc4),{127:[1,1339]},{20:[1,1342],22:[1,1344],93:1340,170:[1,1345],197:1341,221:[1,1343]},o($VM,$VT4),o($V9,$VU4,{56:476,57:$VC3}),o($VO,$VV4),o($V9,$VX4),o($V9,$VY4),o($VO,$VZ4),o($VO,$V_4),{76:[1,1346]},o($V9,$V$4),o($VO,$Vr2),o($Vw,$Vx,{60:1347,47:1348,50:$Vy}),o($VO,$Vs2),o($VO,$Vt2),o($VO,$VF1),o($VO,$VG1),o($VD1,$VC1,{88:1349}),o($VO,$VO1),o($VO,$VP1),{20:[1,1353],22:[1,1357],23:1351,39:1350,206:1352,220:1354,221:[1,1356],222:[1,1355]},{125:[1,1358],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VO,$Vu2),o($VO,$Vv2),o($VD1,$VC1,{88:1359}),o($Vw2,$VI1,{99:1360}),o($VD1,$VJ1,{105:874,101:1361,107:$V25,108:$V_,109:$V$,110:$V01}),o($Vw2,$VQ1),o($Vw2,$VR1),o($Vw2,$VS1),o($Vw2,$VT1),{106:[1,1362]},o($Vw2,$V12),{76:[1,1363]},o($VE2,$VF2,{89:1364,90:1365,198:1366,195:[1,1367]}),o($VG2,$VF2,{89:1368,90:1369,198:1370,195:$Vk6}),o($VB1,$VI2,{105:576,101:1372,107:$VM3,108:$V_,109:$V$,110:$V01}),o($VH1,$VJ2),o($VD1,$VK2,{96:1373,101:1374,97:1375,105:1376,111:1378,113:1379,107:$Vl6,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VD1,$VM2,{96:1373,101:1374,97:1375,105:1376,111:1378,113:1379,107:$Vl6,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VD1,$VN2,{96:1373,101:1374,97:1375,105:1376,111:1378,113:1379,107:$Vl6,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VX1,$VO2),o($VP2,$VF2,{89:1380,90:1381,198:1382,195:[1,1383]}),o($VE1,$VQ2),o($VE1,$VB),o($VE1,$VC),o($VE1,$Vo),o($VE1,$Vp),o($VE1,$VD),o($VE1,$Vq),o($VE1,$Vr),{20:$VR2,22:$VS2,23:404,29:[1,1384],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:1385,127:$Vb3,154:$Vc3,194:$Vd3}),o($VH1,$Vk3),o($VX1,$Vl3),o($VX1,$Vm3),o($VX1,$Vn3),o($VX1,$Vo3),{117:[1,1386]},o($VX1,$Vt3),o($VO,$Vs2),o($VO,$Vt2),o($VO,$VF1),o($VO,$VG1),o($VD1,$VC1,{88:1387}),o($VO,$VO1),o($VO,$VP1),{20:[1,1391],22:[1,1395],23:1389,39:1388,206:1390,220:1392,221:[1,1394],222:[1,1393]},{125:[1,1396],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VO,$Vu2),o($VO,$Vv2),o($VD1,$VC1,{88:1397}),o($Vw2,$VI1,{99:1398}),o($VD1,$VJ1,{105:921,101:1399,107:$V35,108:$V_,109:$V$,110:$V01}),o($Vw2,$VQ1),o($Vw2,$VR1),o($Vw2,$VS1),o($Vw2,$VT1),{106:[1,1400]},o($Vw2,$V12),{76:[1,1401]},o($VE2,$VF2,{89:1402,90:1403,198:1404,195:[1,1405]}),o($VG2,$VF2,{89:1406,90:1407,198:1408,195:$Vm6}),o($VB1,$VI2,{105:612,101:1410,107:$VO3,108:$V_,109:$V$,110:$V01}),o($VH1,$VJ2),o($VD1,$VK2,{96:1411,101:1412,97:1413,105:1414,111:1416,113:1417,107:$Vn6,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VD1,$VM2,{96:1411,101:1412,97:1413,105:1414,111:1416,113:1417,107:$Vn6,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VD1,$VN2,{96:1411,101:1412,97:1413,105:1414,111:1416,113:1417,107:$Vn6,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VX1,$VO2),o($VP2,$VF2,{89:1418,90:1419,198:1420,195:[1,1421]}),o($VE1,$VQ2),o($VE1,$VB),o($VE1,$VC),o($VE1,$Vo),o($VE1,$Vp),o($VE1,$VD),o($VE1,$Vq),o($VE1,$Vr),{20:$VR2,22:$VS2,23:404,29:[1,1422],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:1423,127:$Vb3,154:$Vc3,194:$Vd3}),o($VH1,$Vk3),o($VX1,$Vl3),o($VX1,$Vm3),o($VX1,$Vn3),o($VX1,$Vo3),{117:[1,1424]},o($VX1,$Vt3),o($VD1,$VN5),o($V65,$VF2,{90:963,198:964,89:1425,195:$V75}),o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:1426,127:$Vb3,154:$Vc3,194:$Vd3}),o($V65,$VF2,{90:963,198:964,89:1427,195:$V75}),o($VT3,$VI2,{105:641,101:1428,107:$VR3,108:$V_,109:$V$,110:$V01}),o($V45,$VJ2),o($V45,$Vk3),o($VQ3,$Vh6),o($Vo6,$V_3),o($VS3,$V$3),o($Vo6,$V04,{37:1429,199:[1,1430]}),{20:$V14,22:$V24,135:1431,170:$V34,197:682,205:$V44,221:$V54},o($VQ3,$V64),o($VT3,$V$3),o($VQ3,$V04,{37:1432,199:[1,1433]}),{20:$V14,22:$V24,135:1434,170:$V34,197:682,205:$V44,221:$V54},o($Vp6,$Vb4),o($VU3,$V$3),o($Vp6,$V04,{37:1435,199:[1,1436]}),{20:$V14,22:$V24,135:1437,170:$V34,197:682,205:$V44,221:$V54},o($VV3,$V74),o($VW3,$V84),o($VW3,$V94),o($VW3,$Va4),{106:[1,1438]},o($VW3,$V12),{106:[1,1440],112:1439,114:[1,1441],115:[1,1442],116:1443,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,1444]},{127:[1,1445]},o($VW3,$Vc4),{20:[1,1448],22:[1,1450],93:1446,170:[1,1451],197:1447,221:[1,1449]},o($VY3,$Vq2),o($VY3,$Vj1,{58:1452,59:[1,1453]}),o($VQ3,$Vl1),o($VQ,$VR,{71:1454,73:1455,78:1456,45:1457,84:1458,124:1462,57:$Vm1,59:$Vm1,76:$Vm1,85:[1,1459],86:[1,1460],87:[1,1461]}),o($VQ3,$Vq1),o($VQ3,$Vr1,{74:1463,70:1464,79:1465,98:1466,100:1467,101:1471,105:1472,102:[1,1468],103:[1,1469],104:[1,1470],107:$Vq6,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:1474,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($VQ3,$VA1),o($VS3,$VC1,{88:1475}),o($VT3,$VC1,{88:1476}),o($Vp6,$VF1),o($Vp6,$VG1),o($VV3,$VI1,{99:1477}),o($VS3,$VJ1,{105:1011,101:1478,107:$Va5,108:$V_,109:$V$,110:$V01}),o($VW3,$VL1,{92:1479}),o($VW3,$VL1,{92:1480}),o($VW3,$VL1,{92:1481}),o($VT3,$VM1,{111:1017,113:1018,97:1482,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VU3,$VC1,{88:1483}),o($Vp6,$VO1),o($Vp6,$VP1),{20:[1,1487],22:[1,1491],23:1485,39:1484,206:1486,220:1488,221:[1,1490],222:[1,1489]},o($VV3,$VQ1),o($VV3,$VR1),o($VV3,$VS1),o($VV3,$VT1),o($VW3,$VU1),o($VV1,$VW1,{167:1492}),o($VX3,$VY1),{125:[1,1493],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},{106:[1,1494]},o($VV3,$V12),o($VW3,$V22),o($VW3,$V32),o($VW3,$V42),o($VW3,$V52),{106:[1,1496],112:1495,114:[1,1497],115:[1,1498],116:1499,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,1500]},o($VQ3,$Vl1),o($VQ,$VR,{71:1501,73:1502,78:1503,45:1504,84:1505,124:1509,57:$Vm1,59:$Vm1,76:$Vm1,85:[1,1506],86:[1,1507],87:[1,1508]}),o($VQ3,$Vq1),o($VQ3,$Vr1,{74:1510,70:1511,79:1512,98:1513,100:1514,101:1518,105:1519,102:[1,1515],103:[1,1516],104:[1,1517],107:$Vr6,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:1521,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($VQ3,$VA1),o($VS3,$VC1,{88:1522}),o($VT3,$VC1,{88:1523}),o($Vp6,$VF1),o($Vp6,$VG1),o($VV3,$VI1,{99:1524}),o($VS3,$VJ1,{105:1047,101:1525,107:$Vb5,108:$V_,109:$V$,110:$V01}),o($VW3,$VL1,{92:1526}),o($VW3,$VL1,{92:1527}),o($VW3,$VL1,{92:1528}),o($VT3,$VM1,{111:1053,113:1054,97:1529,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VU3,$VC1,{88:1530}),o($Vp6,$VO1),o($Vp6,$VP1),{20:[1,1534],22:[1,1538],23:1532,39:1531,206:1533,220:1535,221:[1,1537],222:[1,1536]},o($VV3,$VQ1),o($VV3,$VR1),o($VV3,$VS1),o($VV3,$VT1),o($VW3,$VU1),o($VV1,$VW1,{167:1539}),o($VX3,$VY1),{125:[1,1540],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},{106:[1,1541]},o($VV3,$V12),o($VW3,$V22),o($VW3,$V32),o($VW3,$V42),o($VW3,$V52),{106:[1,1543],112:1542,114:[1,1544],115:[1,1545],116:1546,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,1547]},{199:[1,1550],200:1548,201:[1,1549]},o($VB1,$Vs6),o($VB1,$Vt6),o($VB1,$Vu6),o($VB1,$V22),o($VB1,$V32),o($VB1,$V42),o($VB1,$V52),o($VB1,$Vf4),o($VB1,$Vg4),o($VB1,$Vh4),o($VB1,$Vi4),o($VB1,$Vj4,{208:1551,209:1552,117:[1,1553]}),o($VB1,$Vk4),o($VB1,$Vl4),o($VB1,$Vm4),o($VB1,$Vn4),o($VB1,$Vo4),o($VB1,$Vp4),o($VB1,$Vq4),o($VB1,$Vr4),o($VB1,$Vs4),o($Vv6,$Vp3),o($Vv6,$Vq3),o($Vv6,$Vr3),o($Vv6,$Vs3),{199:[1,1556],200:1554,201:[1,1555]},o($VD1,$Vs6),o($VD1,$Vt6),o($VD1,$Vu6),o($VD1,$V22),o($VD1,$V32),o($VD1,$V42),o($VD1,$V52),o($VD1,$Vf4),o($VD1,$Vg4),o($VD1,$Vh4),o($VD1,$Vi4),o($VD1,$Vj4,{208:1557,209:1558,117:[1,1559]}),o($VD1,$Vk4),o($VD1,$Vl4),o($VD1,$Vm4),o($VD1,$Vn4),o($VD1,$Vo4),o($VD1,$Vp4),o($VD1,$Vq4),o($VD1,$Vr4),o($VD1,$Vs4),o($Vw6,$Vp3),o($Vw6,$Vq3),o($Vw6,$Vr3),o($Vw6,$Vs3),{20:[1,1562],22:[1,1564],93:1560,170:[1,1565],197:1561,221:[1,1563]},{199:[1,1568],200:1566,201:[1,1567]},o($VN1,$Vs6),o($VN1,$Vt6),o($VN1,$Vu6),o($VN1,$V22),o($VN1,$V32),o($VN1,$V42),o($VN1,$V52),o($VN1,$Vf4),o($VN1,$Vg4),o($VN1,$Vh4),o($VN1,$Vi4),o($VN1,$Vj4,{208:1569,209:1570,117:[1,1571]}),o($VN1,$Vk4),o($VN1,$Vl4),o($VN1,$Vm4),o($VN1,$Vn4),o($VN1,$Vo4),o($VN1,$Vp4),o($VN1,$Vq4),o($VN1,$Vr4),o($VN1,$Vs4),o($Vx6,$Vp3),o($Vx6,$Vq3),o($Vx6,$Vr3),o($Vx6,$Vs3),o($Vt5,[2,198]),{20:$Vu5,22:$Vv5,23:1140,220:1144,221:$VK5},o($Vt5,[2,200]),{106:$Vw5,114:$Vx5,115:$Vy5,116:1151,186:1141,202:1145,203:1146,204:1147,207:1150,210:$VA5,211:$VB5,212:$VC5,213:$VD5,214:$VE5,215:$VF5,216:$VG5,217:$VH5,218:$VI5,219:$VJ5},o($Vt5,[2,202]),{190:$Vz5},o($Vt5,$Vy6,{185:1572,183:$Vz6}),o($Vt5,$Vy6,{185:1574,183:$Vz6}),o($Vt5,$Vy6,{185:1575,183:$Vz6}),o($VA6,$Vo),o($VA6,$Vp),o($VA6,$Vf4),o($VA6,$Vg4),o($VA6,$Vh4),o($VA6,$Vq),o($VA6,$Vr),o($VA6,$Vi4),o($VA6,$Vj4,{208:1576,209:1577,117:[1,1578]}),o($VA6,$Vk4),o($VA6,$Vl4),o($VA6,$Vm4),o($VA6,$Vn4),o($VA6,$Vo4),o($VA6,$Vp4),o($VA6,$Vq4),o($VA6,$Vr4),o($VA6,$Vs4),o($VB6,$Vp3),o($VB6,$Vq3),o($VB6,$Vr3),o($VB6,$Vs3),o($VV1,[2,209],{175:1579,184:$Vq5}),o($VV1,[2,218],{177:1580,184:$Vr5}),o($VV1,[2,226],{179:1581,184:$Vs5}),o($Ve4,$VC6),o($Ve4,$VU1),o($Ve4,$V22),o($Ve4,$V32),o($Ve4,$V42),o($Ve4,$V52),o($Vy4,$VD6),o($Vy4,$VE6),o($Vy4,$VF6),o($VH4,$VG6),o($VH4,$VH6),o($VH4,$VI6),o($Vw,$Vx,{52:1582,53:1583,61:1584,65:1585,47:1586,50:$Vy}),o($Vj3,$VR4),o($Vj3,$VS4),o($Vj3,$V22),o($Vj3,$V32),o($Vj3,$V42),o($Vj3,$V52),{76:[1,1587]},{76:$Vu4},{76:$Vv4,139:1588,140:1589,141:$VJ6},{76:$Vx4},o($VK6,$Vz4),o($VK6,$VA4),o($VK6,$VB4,{145:1591,148:1592,149:1595,146:$VL6,147:$VM6}),o($VE4,$VF4,{161:736,151:1596,156:1597,157:1598,160:1599,75:[1,1600],166:$VG4}),o($VN6,$VI4),{20:[1,1604],22:[1,1608],23:1602,155:1601,206:1603,220:1605,221:[1,1607],222:[1,1606]},o($VJ4,[2,282]),o($Vw,$Vx,{226:1609,229:1610,47:1611,50:$Vy}),o($VK4,$VO6),o($Vw,$Vx,{229:1612,47:1613,50:$Vy}),o($VK4,$VP6),o($VK4,$Vd6),o($VK4,$Ve6),{125:[1,1614],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VK4,$VO1),o($VK4,$VP1),{20:[1,1618],22:[1,1622],23:1616,39:1615,206:1617,220:1619,221:[1,1621],222:[1,1620]},o($VK4,$VQ6),o($VK4,$VR6),o($VS6,$VI1,{99:1623}),o($VK4,$VJ1,{105:1216,101:1624,107:$V86,108:$V_,109:$V$,110:$V01}),o($VS6,$VQ1),o($VS6,$VR1),o($VS6,$VS1),o($VS6,$VT1),{106:[1,1625]},o($VS6,$V12),{76:[1,1626]},o($Vf2,$VI2,{105:781,101:1627,107:$VP4,108:$V_,109:$V$,110:$V01}),o($Va6,$VJ2),o($VK4,$VK2,{96:1628,101:1629,97:1630,105:1631,111:1633,113:1634,107:$VT6,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VK4,$VM2,{96:1628,101:1629,97:1630,105:1631,111:1633,113:1634,107:$VT6,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VK4,$VN2,{96:1628,101:1629,97:1630,105:1631,111:1633,113:1634,107:$VT6,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vf6,$VO2),{20:$VR2,22:$VS2,23:404,29:[1,1635],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:1636,127:$Vb3,154:$Vc3,194:$Vd3}),o($Vc6,$VQ2),o($Vc6,$VB),o($Vc6,$VC),o($Vc6,$Vo),o($Vc6,$Vp),o($Vc6,$VD),o($Vc6,$Vq),o($Vc6,$Vr),o($Va6,$Vk3),o($Vf6,$Vl3),o($Vf6,$Vm3),o($Vf6,$Vn3),o($Vf6,$Vo3),{117:[1,1637]},o($Vf6,$Vt3),o($VW4,$Vc5),{20:$Vj,22:$Vk,23:1638,220:50,221:$Vl},{20:$VU6,22:$VV6,106:[1,1651],114:[1,1652],115:[1,1653],116:1650,170:$VW6,186:1641,196:1639,197:1640,202:1646,203:1647,204:1648,207:1649,210:[1,1654],211:[1,1655],212:[1,1660],213:[1,1661],214:[1,1662],215:[1,1663],216:[1,1656],217:[1,1657],218:[1,1658],219:[1,1659],221:$VX6},o($Vy3,$VN5),o($VM,$Vj1,{58:1664,59:[1,1665]}),o($VO,$Vl1),o($VO,$Vm1,{71:1666,73:1667,78:1668,45:1669,84:1670,124:1674,85:[1,1671],86:[1,1672],87:[1,1673],125:$VR,131:$VR,133:$VR,194:$VR,233:$VR}),o($VO,$Vq1),o($VO,$Vr1,{74:1675,70:1676,79:1677,98:1678,100:1679,101:1683,105:1684,102:[1,1680],103:[1,1681],104:[1,1682],107:$VY6,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:1686,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($VO,$VA1),o($VB1,$VC1,{88:1687}),o($VD1,$VC1,{88:1688}),o($VE1,$VF1),o($VE1,$VG1),o($VH1,$VI1,{99:1689}),o($VB1,$VJ1,{105:1275,101:1690,107:$Vi6,108:$V_,109:$V$,110:$V01}),o($VK1,$VL1,{92:1691}),o($VK1,$VL1,{92:1692}),o($VK1,$VL1,{92:1693}),o($VD1,$VM1,{111:1281,113:1282,97:1694,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VN1,$VC1,{88:1695}),o($VE1,$VO1),o($VE1,$VP1),{20:[1,1699],22:[1,1703],23:1697,39:1696,206:1698,220:1700,221:[1,1702],222:[1,1701]},o($VH1,$VQ1),o($VH1,$VR1),o($VH1,$VS1),o($VH1,$VT1),o($VK1,$VU1),o($VV1,$VW1,{167:1704}),o($VX1,$VY1),{125:[1,1705],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},{106:[1,1706]},o($VH1,$V12),o($VK1,$V22),o($VK1,$V32),o($VK1,$V42),o($VK1,$V52),{106:[1,1708],112:1707,114:[1,1709],115:[1,1710],116:1711,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,1712]},o($VO,$Vl1),o($VO,$Vm1,{71:1713,73:1714,78:1715,45:1716,84:1717,124:1721,85:[1,1718],86:[1,1719],87:[1,1720],125:$VR,131:$VR,133:$VR,194:$VR,233:$VR}),o($VO,$Vq1),o($VO,$Vr1,{74:1722,70:1723,79:1724,98:1725,100:1726,101:1730,105:1731,102:[1,1727],103:[1,1728],104:[1,1729],107:$VZ6,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:1733,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($VO,$VA1),o($VB1,$VC1,{88:1734}),o($VD1,$VC1,{88:1735}),o($VE1,$VF1),o($VE1,$VG1),o($VH1,$VI1,{99:1736}),o($VB1,$VJ1,{105:1311,101:1737,107:$Vj6,108:$V_,109:$V$,110:$V01}),o($VK1,$VL1,{92:1738}),o($VK1,$VL1,{92:1739}),o($VK1,$VL1,{92:1740}),o($VD1,$VM1,{111:1317,113:1318,97:1741,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VN1,$VC1,{88:1742}),o($VE1,$VO1),o($VE1,$VP1),{20:[1,1746],22:[1,1750],23:1744,39:1743,206:1745,220:1747,221:[1,1749],222:[1,1748]},o($VH1,$VQ1),o($VH1,$VR1),o($VH1,$VS1),o($VH1,$VT1),o($VK1,$VU1),o($VV1,$VW1,{167:1751}),o($VX1,$VY1),{125:[1,1752],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},{106:[1,1753]},o($VH1,$V12),o($VK1,$V22),o($VK1,$V32),o($VK1,$V42),o($VK1,$V52),{106:[1,1755],112:1754,114:[1,1756],115:[1,1757],116:1758,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,1759]},o($VO,$Vb4),{127:[1,1760]},o($VO,$V_3),o($Vw2,$V74),o($VE2,$Vc5),{20:$Vj,22:$Vk,23:1761,220:50,221:$Vl},{20:$V_6,22:$V$6,106:[1,1774],114:[1,1775],115:[1,1776],116:1773,170:$V07,186:1764,196:1762,197:1763,202:1769,203:1770,204:1771,207:1772,210:[1,1777],211:[1,1778],212:[1,1783],213:[1,1784],214:[1,1785],215:[1,1786],216:[1,1779],217:[1,1780],218:[1,1781],219:[1,1782],221:$V17},o($VG2,$Vc5),{20:$Vj,22:$Vk,23:1787,220:50,221:$Vl},{20:$V27,22:$V37,106:[1,1800],114:[1,1801],115:[1,1802],116:1799,170:$V47,186:1790,196:1788,197:1789,202:1795,203:1796,204:1797,207:1798,210:[1,1803],211:[1,1804],212:[1,1809],213:[1,1810],214:[1,1811],215:[1,1812],216:[1,1805],217:[1,1806],218:[1,1807],219:[1,1808],221:$V57},o($VK1,$Vk3),o($VK1,$Vl3),o($VK1,$Vm3),o($VK1,$Vn3),o($VK1,$Vo3),{117:[1,1813]},o($VK1,$Vt3),o($VP2,$Vc5),{20:$Vj,22:$Vk,23:1814,220:50,221:$Vl},{20:$V67,22:$V77,106:[1,1827],114:[1,1828],115:[1,1829],116:1826,170:$V87,186:1817,196:1815,197:1816,202:1822,203:1823,204:1824,207:1825,210:[1,1830],211:[1,1831],212:[1,1836],213:[1,1837],214:[1,1838],215:[1,1839],216:[1,1832],217:[1,1833],218:[1,1834],219:[1,1835],221:$V97},o($VN1,$VN5),o($VX1,$Vg6),o($VX1,$VU1),o($VX1,$V22),o($VX1,$V32),o($VX1,$V42),o($VX1,$V52),o($VO,$Vh6),o($VO,$VN3),o($VQ,$VR,{68:1840,70:1841,72:1842,73:1843,79:1846,81:1847,78:1848,45:1849,98:1850,100:1851,93:1853,94:1854,95:1855,84:1856,101:1863,197:1864,97:1866,124:1867,105:1868,111:1874,113:1875,20:[1,1870],22:[1,1872],28:[1,1865],75:[1,1844],77:[1,1845],85:[1,1857],86:[1,1858],87:[1,1859],91:[1,1852],102:[1,1860],103:[1,1861],104:[1,1862],107:$Va7,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:[1,1873],221:[1,1871]}),o($VG2,$VF2,{90:1369,198:1370,89:1876,195:$Vk6}),o($VO,$VQ2),o($VO,$VB),o($VO,$VC),o($VO,$Vo),o($VO,$Vp),o($VO,$VD),o($VO,$Vq),o($VO,$Vr),o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:1877,127:$Vb3,154:$Vc3,194:$Vd3}),o($VG2,$VF2,{90:1369,198:1370,89:1878,195:$Vk6}),o($VD1,$VI2,{105:874,101:1879,107:$V25,108:$V_,109:$V$,110:$V01}),o($Vw2,$VJ2),o($Vw2,$Vk3),o($VO,$VP3),o($VZ3,$V_3),o($VB1,$V$3),o($VZ3,$V04,{37:1880,199:[1,1881]}),{20:$V14,22:$V24,135:1882,170:$V34,197:682,205:$V44,221:$V54},o($VO,$V64),o($VD1,$V$3),o($VO,$V04,{37:1883,199:[1,1884]}),{20:$V14,22:$V24,135:1885,170:$V34,197:682,205:$V44,221:$V54},o($VH1,$V74),o($VK1,$V84),o($VK1,$V94),o($VK1,$Va4),{106:[1,1886]},o($VK1,$V12),{106:[1,1888],112:1887,114:[1,1889],115:[1,1890],116:1891,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,1892]},o($VE1,$Vb4),o($VN1,$V$3),o($VE1,$V04,{37:1893,199:[1,1894]}),{20:$V14,22:$V24,135:1895,170:$V34,197:682,205:$V44,221:$V54},o($VK1,$Vc4),{127:[1,1896]},{20:[1,1899],22:[1,1901],93:1897,170:[1,1902],197:1898,221:[1,1900]},o($VG2,$VF2,{90:1407,198:1408,89:1903,195:$Vm6}),o($VO,$VQ2),o($VO,$VB),o($VO,$VC),o($VO,$Vo),o($VO,$Vp),o($VO,$VD),o($VO,$Vq),o($VO,$Vr),o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:1904,127:$Vb3,154:$Vc3,194:$Vd3}),o($VG2,$VF2,{90:1407,198:1408,89:1905,195:$Vm6}),o($VD1,$VI2,{105:921,101:1906,107:$V35,108:$V_,109:$V$,110:$V01}),o($Vw2,$VJ2),o($Vw2,$Vk3),o($VO,$VP3),o($VZ3,$V_3),o($VB1,$V$3),o($VZ3,$V04,{37:1907,199:[1,1908]}),{20:$V14,22:$V24,135:1909,170:$V34,197:682,205:$V44,221:$V54},o($VO,$V64),o($VD1,$V$3),o($VO,$V04,{37:1910,199:[1,1911]}),{20:$V14,22:$V24,135:1912,170:$V34,197:682,205:$V44,221:$V54},o($VH1,$V74),o($VK1,$V84),o($VK1,$V94),o($VK1,$Va4),{106:[1,1913]},o($VK1,$V12),{106:[1,1915],112:1914,114:[1,1916],115:[1,1917],116:1918,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,1919]},o($VE1,$Vb4),o($VN1,$V$3),o($VE1,$V04,{37:1920,199:[1,1921]}),{20:$V14,22:$V24,135:1922,170:$V34,197:682,205:$V44,221:$V54},o($VK1,$Vc4),{127:[1,1923]},{20:[1,1926],22:[1,1928],93:1924,170:[1,1929],197:1925,221:[1,1927]},o($VQ3,$Vb4),{127:[1,1930]},o($VQ3,$V_3),o($V45,$V74),o($V55,$Vc5),{20:$Vj,22:$Vk,23:1931,220:50,221:$Vl},{20:$Vb7,22:$Vc7,106:[1,1944],114:[1,1945],115:[1,1946],116:1943,170:$Vd7,186:1934,196:1932,197:1933,202:1939,203:1940,204:1941,207:1942,210:[1,1947],211:[1,1948],212:[1,1953],213:[1,1954],214:[1,1955],215:[1,1956],216:[1,1949],217:[1,1950],218:[1,1951],219:[1,1952],221:$Ve7},o($V65,$Vc5),{20:$Vj,22:$Vk,23:1957,220:50,221:$Vl},{20:$Vf7,22:$Vg7,106:[1,1970],114:[1,1971],115:[1,1972],116:1969,170:$Vh7,186:1960,196:1958,197:1959,202:1965,203:1966,204:1967,207:1968,210:[1,1973],211:[1,1974],212:[1,1979],213:[1,1980],214:[1,1981],215:[1,1982],216:[1,1975],217:[1,1976],218:[1,1977],219:[1,1978],221:$Vi7},o($V85,$Vc5),{20:$Vj,22:$Vk,23:1983,220:50,221:$Vl},{20:$Vj7,22:$Vk7,106:[1,1996],114:[1,1997],115:[1,1998],116:1995,170:$Vl7,186:1986,196:1984,197:1985,202:1991,203:1992,204:1993,207:1994,210:[1,1999],211:[1,2000],212:[1,2005],213:[1,2006],214:[1,2007],215:[1,2008],216:[1,2001],217:[1,2002],218:[1,2003],219:[1,2004],221:$Vm7},o($VW3,$Vk3),o($VW3,$Vl3),o($VW3,$Vm3),o($VW3,$Vn3),o($VW3,$Vo3),{117:[1,2009]},o($VW3,$Vt3),o($VU3,$VN5),o($VX3,$Vg6),o($VX3,$VU1),o($VX3,$V22),o($VX3,$V32),o($VX3,$V42),o($VX3,$V52),o($VQ3,$Vr2),o($Vw,$Vx,{60:2010,47:2011,50:$Vy}),o($VQ3,$Vs2),o($VQ3,$Vt2),o($VQ3,$VF1),o($VQ3,$VG1),o($VT3,$VC1,{88:2012}),o($VQ3,$VO1),o($VQ3,$VP1),{20:[1,2016],22:[1,2020],23:2014,39:2013,206:2015,220:2017,221:[1,2019],222:[1,2018]},{125:[1,2021],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VQ3,$Vu2),o($VQ3,$Vv2),o($VT3,$VC1,{88:2022}),o($V45,$VI1,{99:2023}),o($VT3,$VJ1,{105:1472,101:2024,107:$Vq6,108:$V_,109:$V$,110:$V01}),o($V45,$VQ1),o($V45,$VR1),o($V45,$VS1),o($V45,$VT1),{106:[1,2025]},o($V45,$V12),{76:[1,2026]},o($V55,$VF2,{89:2027,90:2028,198:2029,195:[1,2030]}),o($V65,$VF2,{89:2031,90:2032,198:2033,195:$Vn7}),o($VS3,$VI2,{105:1011,101:2035,107:$Va5,108:$V_,109:$V$,110:$V01}),o($VV3,$VJ2),o($VT3,$VK2,{96:2036,101:2037,97:2038,105:2039,111:2041,113:2042,107:$Vo7,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VT3,$VM2,{96:2036,101:2037,97:2038,105:2039,111:2041,113:2042,107:$Vo7,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VT3,$VN2,{96:2036,101:2037,97:2038,105:2039,111:2041,113:2042,107:$Vo7,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VX3,$VO2),o($V85,$VF2,{89:2043,90:2044,198:2045,195:[1,2046]}),o($Vp6,$VQ2),o($Vp6,$VB),o($Vp6,$VC),o($Vp6,$Vo),o($Vp6,$Vp),o($Vp6,$VD),o($Vp6,$Vq),o($Vp6,$Vr),{20:$VR2,22:$VS2,23:404,29:[1,2047],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:2048,127:$Vb3,154:$Vc3,194:$Vd3}),o($VV3,$Vk3),o($VX3,$Vl3),o($VX3,$Vm3),o($VX3,$Vn3),o($VX3,$Vo3),{117:[1,2049]},o($VX3,$Vt3),o($VQ3,$Vs2),o($VQ3,$Vt2),o($VQ3,$VF1),o($VQ3,$VG1),o($VT3,$VC1,{88:2050}),o($VQ3,$VO1),o($VQ3,$VP1),{20:[1,2054],22:[1,2058],23:2052,39:2051,206:2053,220:2055,221:[1,2057],222:[1,2056]},{125:[1,2059],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VQ3,$Vu2),o($VQ3,$Vv2),o($VT3,$VC1,{88:2060}),o($V45,$VI1,{99:2061}),o($VT3,$VJ1,{105:1519,101:2062,107:$Vr6,108:$V_,109:$V$,110:$V01}),o($V45,$VQ1),o($V45,$VR1),o($V45,$VS1),o($V45,$VT1),{106:[1,2063]},o($V45,$V12),{76:[1,2064]},o($V55,$VF2,{89:2065,90:2066,198:2067,195:[1,2068]}),o($V65,$VF2,{89:2069,90:2070,198:2071,195:$Vp7}),o($VS3,$VI2,{105:1047,101:2073,107:$Vb5,108:$V_,109:$V$,110:$V01}),o($VV3,$VJ2),o($VT3,$VK2,{96:2074,101:2075,97:2076,105:2077,111:2079,113:2080,107:$Vq7,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VT3,$VM2,{96:2074,101:2075,97:2076,105:2077,111:2079,113:2080,107:$Vq7,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VT3,$VN2,{96:2074,101:2075,97:2076,105:2077,111:2079,113:2080,107:$Vq7,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VX3,$VO2),o($V85,$VF2,{89:2081,90:2082,198:2083,195:[1,2084]}),o($Vp6,$VQ2),o($Vp6,$VB),o($Vp6,$VC),o($Vp6,$Vo),o($Vp6,$Vp),o($Vp6,$VD),o($Vp6,$Vq),o($Vp6,$Vr),{20:$VR2,22:$VS2,23:404,29:[1,2085],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:2086,127:$Vb3,154:$Vc3,194:$Vd3}),o($VV3,$Vk3),o($VX3,$Vl3),o($VX3,$Vm3),o($VX3,$Vn3),o($VX3,$Vo3),{117:[1,2087]},o($VX3,$Vt3),o($VE2,$Vd1),o($VE2,$Ve1),o($VE2,$Vf1),o($VB1,$VL5),o($VB1,$VM5),{20:$Vd5,22:$Ve5,93:2088,170:$Vf5,197:2089,221:$Vg5},o($VG2,$Vd1),o($VG2,$Ve1),o($VG2,$Vf1),o($VD1,$VL5),o($VD1,$VM5),{20:$Vi5,22:$Vj5,93:2090,170:$Vk5,197:2091,221:$Vl5},o($VK1,$Vg6),o($VK1,$VU1),o($VK1,$V22),o($VK1,$V32),o($VK1,$V42),o($VK1,$V52),o($VP2,$Vd1),o($VP2,$Ve1),o($VP2,$Vf1),o($VN1,$VL5),o($VN1,$VM5),{20:$Vm5,22:$Vn5,93:2092,170:$Vo5,197:2093,221:$Vp5},o($Vt5,[2,212]),o($Vt5,[2,214]),o($Vt5,[2,221]),o($Vt5,[2,229]),o($VA6,$VL5),o($VA6,$VM5),{20:[1,2096],22:[1,2098],93:2094,170:[1,2099],197:2095,221:[1,2097]},o($Vt5,[2,208]),o($Vt5,[2,217]),o($Vt5,[2,225]),o($Vr7,$Vs7,{158:2100,159:2101,162:$Vt7,163:$Vu7,164:$Vv7,165:$Vw7}),o($Vx7,$Vy7),o($Vz7,$VA7,{62:2106}),o($VB7,$VC7,{66:2107}),o($VQ,$VR,{69:2108,79:2109,81:2110,82:2111,98:2114,100:2115,93:2117,94:2118,95:2119,84:2120,45:2121,101:2125,197:2126,97:2128,124:2129,105:2133,111:2139,113:2140,20:[1,2135],22:[1,2137],28:[1,2127],75:[1,2112],77:[1,2113],85:[1,2130],86:[1,2131],87:[1,2132],91:[1,2116],102:[1,2122],103:[1,2123],104:[1,2124],107:$VD7,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:[1,2138],221:[1,2136]}),o($Vr7,$Vs7,{159:2101,158:2141,162:$Vt7,163:$Vu7,164:$Vv7,165:$Vw7}),{76:$VO5,140:2142,141:$VJ6},o($VK6,$VP5),o($V93,$Va3,{153:440,142:1191,143:1192,144:1193,150:1194,152:1195,137:2143,154:$Vc3,194:$V06}),o($VK6,$VQ5),o($VK6,$VB4,{145:2144,149:2145,146:$VL6,147:$VM6}),o($V93,$Va3,{153:440,150:1194,152:1195,144:2146,76:$VR5,141:$VR5,154:$Vc3,194:$V06}),o($V93,$Va3,{153:440,150:1194,152:1195,144:2147,76:$VS5,141:$VS5,154:$Vc3,194:$V06}),o($VN6,$VT5),o($VN6,$VU5),o($VN6,$VV5),o($VN6,$VW5),{20:$VX5,22:$VY5,135:2148,170:$VZ5,197:1181,205:$V_5,221:$V$5},o($V93,$Va3,{153:440,136:1188,137:1189,138:1190,142:1191,143:1192,144:1193,150:1194,152:1195,132:2149,154:$Vc3,194:$V06}),o($VN6,$V16),o($VN6,$V26),o($VN6,$V36),o($VN6,$Vo),o($VN6,$Vp),o($VN6,$VD),o($VN6,$Vq),o($VN6,$Vr),o($VJ4,[2,280]),o($VK4,$VL4,{230:2150}),o($VQ,$VR,{98:762,100:763,101:773,105:781,232:2151,79:2152,81:2153,82:2154,93:2158,94:2159,95:2160,84:2161,45:2162,197:2163,97:2165,124:2166,111:2174,113:2175,20:[1,2170],22:[1,2172],28:[1,2164],75:[1,2155],77:[1,2156],85:[1,2167],86:[1,2168],87:[1,2169],91:[1,2157],102:$VM4,103:$VN4,104:$VO4,107:$VP4,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:[1,2173],221:[1,2171]}),o($VK4,$VE7),o($VQ,$VR,{98:762,100:763,101:773,105:781,232:2176,79:2177,81:2178,82:2179,93:2183,94:2184,95:2185,84:2186,45:2187,197:2188,97:2190,124:2191,111:2199,113:2200,20:[1,2195],22:[1,2197],28:[1,2189],75:[1,2180],77:[1,2181],85:[1,2192],86:[1,2193],87:[1,2194],91:[1,2182],102:$VM4,103:$VN4,104:$VO4,107:$VP4,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:[1,2198],221:[1,2196]}),o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:2201,127:$Vb3,154:$Vc3,194:$Vd3}),o($VK4,$VQ2),o($VK4,$VB),o($VK4,$VC),o($VK4,$Vo),o($VK4,$Vp),o($VK4,$VD),o($VK4,$Vq),o($VK4,$Vr),o($VK4,$VI2,{105:1216,101:2202,107:$V86,108:$V_,109:$V$,110:$V01}),o($VS6,$VJ2),o($VS6,$Vk3),o($VK4,$VF7),o($Va6,$V74),o($Vb6,$V84),o($Vb6,$V94),o($Vb6,$Va4),{106:[1,2203]},o($Vb6,$V12),{106:[1,2205],112:2204,114:[1,2206],115:[1,2207],116:2208,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,2209]},o($Vb6,$Vc4),{127:[1,2210]},{20:[1,2213],22:[1,2215],93:2211,170:[1,2216],197:2212,221:[1,2214]},{199:[1,2219],200:2217,201:[1,2218]},o($Vy3,$Vs6),o($Vy3,$Vt6),o($Vy3,$Vu6),o($Vy3,$V22),o($Vy3,$V32),o($Vy3,$V42),o($Vy3,$V52),o($Vy3,$Vf4),o($Vy3,$Vg4),o($Vy3,$Vh4),o($Vy3,$Vi4),o($Vy3,$Vj4,{208:2220,209:2221,117:[1,2222]}),o($Vy3,$Vk4),o($Vy3,$Vl4),o($Vy3,$Vm4),o($Vy3,$Vn4),o($Vy3,$Vo4),o($Vy3,$Vp4),o($Vy3,$Vq4),o($Vy3,$Vr4),o($Vy3,$Vs4),o($VG7,$Vp3),o($VG7,$Vq3),o($VG7,$Vr3),o($VG7,$Vs3),o($VO,$Vr2),o($Vw,$Vx,{60:2223,47:2224,50:$Vy}),o($VO,$Vs2),o($VO,$Vt2),o($VO,$VF1),o($VO,$VG1),o($VD1,$VC1,{88:2225}),o($VO,$VO1),o($VO,$VP1),{20:[1,2229],22:[1,2233],23:2227,39:2226,206:2228,220:2230,221:[1,2232],222:[1,2231]},{125:[1,2234],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VO,$Vu2),o($VO,$Vv2),o($VD1,$VC1,{88:2235}),o($Vw2,$VI1,{99:2236}),o($VD1,$VJ1,{105:1684,101:2237,107:$VY6,108:$V_,109:$V$,110:$V01}),o($Vw2,$VQ1),o($Vw2,$VR1),o($Vw2,$VS1),o($Vw2,$VT1),{106:[1,2238]},o($Vw2,$V12),{76:[1,2239]},o($VE2,$VF2,{89:2240,90:2241,198:2242,195:[1,2243]}),o($VG2,$VF2,{89:2244,90:2245,198:2246,195:$VH7}),o($VB1,$VI2,{105:1275,101:2248,107:$Vi6,108:$V_,109:$V$,110:$V01}),o($VH1,$VJ2),o($VD1,$VK2,{96:2249,101:2250,97:2251,105:2252,111:2254,113:2255,107:$VI7,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VD1,$VM2,{96:2249,101:2250,97:2251,105:2252,111:2254,113:2255,107:$VI7,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VD1,$VN2,{96:2249,101:2250,97:2251,105:2252,111:2254,113:2255,107:$VI7,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VX1,$VO2),o($VP2,$VF2,{89:2256,90:2257,198:2258,195:[1,2259]}),o($VE1,$VQ2),o($VE1,$VB),o($VE1,$VC),o($VE1,$Vo),o($VE1,$Vp),o($VE1,$VD),o($VE1,$Vq),o($VE1,$Vr),{20:$VR2,22:$VS2,23:404,29:[1,2260],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:2261,127:$Vb3,154:$Vc3,194:$Vd3}),o($VH1,$Vk3),o($VX1,$Vl3),o($VX1,$Vm3),o($VX1,$Vn3),o($VX1,$Vo3),{117:[1,2262]},o($VX1,$Vt3),o($VO,$Vs2),o($VO,$Vt2),o($VO,$VF1),o($VO,$VG1),o($VD1,$VC1,{88:2263}),o($VO,$VO1),o($VO,$VP1),{20:[1,2267],22:[1,2271],23:2265,39:2264,206:2266,220:2268,221:[1,2270],222:[1,2269]},{125:[1,2272],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VO,$Vu2),o($VO,$Vv2),o($VD1,$VC1,{88:2273}),o($Vw2,$VI1,{99:2274}),o($VD1,$VJ1,{105:1731,101:2275,107:$VZ6,108:$V_,109:$V$,110:$V01}),o($Vw2,$VQ1),o($Vw2,$VR1),o($Vw2,$VS1),o($Vw2,$VT1),{106:[1,2276]},o($Vw2,$V12),{76:[1,2277]},o($VE2,$VF2,{89:2278,90:2279,198:2280,195:[1,2281]}),o($VG2,$VF2,{89:2282,90:2283,198:2284,195:$VJ7}),o($VB1,$VI2,{105:1311,101:2286,107:$Vj6,108:$V_,109:$V$,110:$V01}),o($VH1,$VJ2),o($VD1,$VK2,{96:2287,101:2288,97:2289,105:2290,111:2292,113:2293,107:$VK7,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VD1,$VM2,{96:2287,101:2288,97:2289,105:2290,111:2292,113:2293,107:$VK7,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VD1,$VN2,{96:2287,101:2288,97:2289,105:2290,111:2292,113:2293,107:$VK7,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VX1,$VO2),o($VP2,$VF2,{89:2294,90:2295,198:2296,195:[1,2297]}),o($VE1,$VQ2),o($VE1,$VB),o($VE1,$VC),o($VE1,$Vo),o($VE1,$Vp),o($VE1,$VD),o($VE1,$Vq),o($VE1,$Vr),{20:$VR2,22:$VS2,23:404,29:[1,2298],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:2299,127:$Vb3,154:$Vc3,194:$Vd3}),o($VH1,$Vk3),o($VX1,$Vl3),o($VX1,$Vm3),o($VX1,$Vn3),o($VX1,$Vo3),{117:[1,2300]},o($VX1,$Vt3),o($VD1,$VN5),{199:[1,2303],200:2301,201:[1,2302]},o($VB1,$Vs6),o($VB1,$Vt6),o($VB1,$Vu6),o($VB1,$V22),o($VB1,$V32),o($VB1,$V42),o($VB1,$V52),o($VB1,$Vf4),o($VB1,$Vg4),o($VB1,$Vh4),o($VB1,$Vi4),o($VB1,$Vj4,{208:2304,209:2305,117:[1,2306]}),o($VB1,$Vk4),o($VB1,$Vl4),o($VB1,$Vm4),o($VB1,$Vn4),o($VB1,$Vo4),o($VB1,$Vp4),o($VB1,$Vq4),o($VB1,$Vr4),o($VB1,$Vs4),o($Vv6,$Vp3),o($Vv6,$Vq3),o($Vv6,$Vr3),o($Vv6,$Vs3),{199:[1,2309],200:2307,201:[1,2308]},o($VD1,$Vs6),o($VD1,$Vt6),o($VD1,$Vu6),o($VD1,$V22),o($VD1,$V32),o($VD1,$V42),o($VD1,$V52),o($VD1,$Vf4),o($VD1,$Vg4),o($VD1,$Vh4),o($VD1,$Vi4),o($VD1,$Vj4,{208:2310,209:2311,117:[1,2312]}),o($VD1,$Vk4),o($VD1,$Vl4),o($VD1,$Vm4),o($VD1,$Vn4),o($VD1,$Vo4),o($VD1,$Vp4),o($VD1,$Vq4),o($VD1,$Vr4),o($VD1,$Vs4),o($Vw6,$Vp3),o($Vw6,$Vq3),o($Vw6,$Vr3),o($Vw6,$Vs3),{20:[1,2315],22:[1,2317],93:2313,170:[1,2318],197:2314,221:[1,2316]},{199:[1,2321],200:2319,201:[1,2320]},o($VN1,$Vs6),o($VN1,$Vt6),o($VN1,$Vu6),o($VN1,$V22),o($VN1,$V32),o($VN1,$V42),o($VN1,$V52),o($VN1,$Vf4),o($VN1,$Vg4),o($VN1,$Vh4),o($VN1,$Vi4),o($VN1,$Vj4,{208:2322,209:2323,117:[1,2324]}),o($VN1,$Vk4),o($VN1,$Vl4),o($VN1,$Vm4),o($VN1,$Vn4),o($VN1,$Vo4),o($VN1,$Vp4),o($VN1,$Vq4),o($VN1,$Vr4),o($VN1,$Vs4),o($Vx6,$Vp3),o($Vx6,$Vq3),o($Vx6,$Vr3),o($Vx6,$Vs3),o($VO,$Vl1),o($VO,$Vm1,{71:2325,73:2326,78:2327,45:2328,84:2329,124:2333,85:[1,2330],86:[1,2331],87:[1,2332],125:$VR,131:$VR,133:$VR,194:$VR,233:$VR}),o($VO,$Vq1),o($VO,$Vr1,{74:2334,70:2335,79:2336,98:2337,100:2338,101:2342,105:2343,102:[1,2339],103:[1,2340],104:[1,2341],107:$VL7,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:2345,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($VO,$VA1),o($VB1,$VC1,{88:2346}),o($VD1,$VC1,{88:2347}),o($VE1,$VF1),o($VE1,$VG1),o($VH1,$VI1,{99:2348}),o($VB1,$VJ1,{105:1868,101:2349,107:$Va7,108:$V_,109:$V$,110:$V01}),o($VK1,$VL1,{92:2350}),o($VK1,$VL1,{92:2351}),o($VK1,$VL1,{92:2352}),o($VD1,$VM1,{111:1874,113:1875,97:2353,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VN1,$VC1,{88:2354}),o($VE1,$VO1),o($VE1,$VP1),{20:[1,2358],22:[1,2362],23:2356,39:2355,206:2357,220:2359,221:[1,2361],222:[1,2360]},o($VH1,$VQ1),o($VH1,$VR1),o($VH1,$VS1),o($VH1,$VT1),o($VK1,$VU1),o($VV1,$VW1,{167:2363}),o($VX1,$VY1),{125:[1,2364],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},{106:[1,2365]},o($VH1,$V12),o($VK1,$V22),o($VK1,$V32),o($VK1,$V42),o($VK1,$V52),{106:[1,2367],112:2366,114:[1,2368],115:[1,2369],116:2370,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,2371]},o($VO,$Vb4),{127:[1,2372]},o($VO,$V_3),o($Vw2,$V74),o($VE2,$Vc5),{20:$Vj,22:$Vk,23:2373,220:50,221:$Vl},{20:$VM7,22:$VN7,106:[1,2386],114:[1,2387],115:[1,2388],116:2385,170:$VO7,186:2376,196:2374,197:2375,202:2381,203:2382,204:2383,207:2384,210:[1,2389],211:[1,2390],212:[1,2395],213:[1,2396],214:[1,2397],215:[1,2398],216:[1,2391],217:[1,2392],218:[1,2393],219:[1,2394],221:$VP7},o($VG2,$Vc5),{20:$Vj,22:$Vk,23:2399,220:50,221:$Vl},{20:$VQ7,22:$VR7,106:[1,2412],114:[1,2413],115:[1,2414],116:2411,170:$VS7,186:2402,196:2400,197:2401,202:2407,203:2408,204:2409,207:2410,210:[1,2415],211:[1,2416],212:[1,2421],213:[1,2422],214:[1,2423],215:[1,2424],216:[1,2417],217:[1,2418],218:[1,2419],219:[1,2420],221:$VT7},o($VK1,$Vk3),o($VK1,$Vl3),o($VK1,$Vm3),o($VK1,$Vn3),o($VK1,$Vo3),{117:[1,2425]},o($VK1,$Vt3),o($VP2,$Vc5),{20:$Vj,22:$Vk,23:2426,220:50,221:$Vl},{20:$VU7,22:$VV7,106:[1,2439],114:[1,2440],115:[1,2441],116:2438,170:$VW7,186:2429,196:2427,197:2428,202:2434,203:2435,204:2436,207:2437,210:[1,2442],211:[1,2443],212:[1,2448],213:[1,2449],214:[1,2450],215:[1,2451],216:[1,2444],217:[1,2445],218:[1,2446],219:[1,2447],221:$VX7},o($VN1,$VN5),o($VX1,$Vg6),o($VX1,$VU1),o($VX1,$V22),o($VX1,$V32),o($VX1,$V42),o($VX1,$V52),o($VO,$Vb4),{127:[1,2452]},o($VO,$V_3),o($Vw2,$V74),o($VE2,$Vc5),{20:$Vj,22:$Vk,23:2453,220:50,221:$Vl},{20:$VY7,22:$VZ7,106:[1,2466],114:[1,2467],115:[1,2468],116:2465,170:$V_7,186:2456,196:2454,197:2455,202:2461,203:2462,204:2463,207:2464,210:[1,2469],211:[1,2470],212:[1,2475],213:[1,2476],214:[1,2477],215:[1,2478],216:[1,2471],217:[1,2472],218:[1,2473],219:[1,2474],221:$V$7},o($VG2,$Vc5),{20:$Vj,22:$Vk,23:2479,220:50,221:$Vl},{20:$V08,22:$V18,106:[1,2492],114:[1,2493],115:[1,2494],116:2491,170:$V28,186:2482,196:2480,197:2481,202:2487,203:2488,204:2489,207:2490,210:[1,2495],211:[1,2496],212:[1,2501],213:[1,2502],214:[1,2503],215:[1,2504],216:[1,2497],217:[1,2498],218:[1,2499],219:[1,2500],221:$V38},o($VK1,$Vk3),o($VK1,$Vl3),o($VK1,$Vm3),o($VK1,$Vn3),o($VK1,$Vo3),{117:[1,2505]},o($VK1,$Vt3),o($VP2,$Vc5),{20:$Vj,22:$Vk,23:2506,220:50,221:$Vl},{20:$V48,22:$V58,106:[1,2519],114:[1,2520],115:[1,2521],116:2518,170:$V68,186:2509,196:2507,197:2508,202:2514,203:2515,204:2516,207:2517,210:[1,2522],211:[1,2523],212:[1,2528],213:[1,2529],214:[1,2530],215:[1,2531],216:[1,2524],217:[1,2525],218:[1,2526],219:[1,2527],221:$V78},o($VN1,$VN5),o($VX1,$Vg6),o($VX1,$VU1),o($VX1,$V22),o($VX1,$V32),o($VX1,$V42),o($VX1,$V52),o($VT3,$VN5),{199:[1,2534],200:2532,201:[1,2533]},o($VS3,$Vs6),o($VS3,$Vt6),o($VS3,$Vu6),o($VS3,$V22),o($VS3,$V32),o($VS3,$V42),o($VS3,$V52),o($VS3,$Vf4),o($VS3,$Vg4),o($VS3,$Vh4),o($VS3,$Vi4),o($VS3,$Vj4,{208:2535,209:2536,117:[1,2537]}),o($VS3,$Vk4),o($VS3,$Vl4),o($VS3,$Vm4),o($VS3,$Vn4),o($VS3,$Vo4),o($VS3,$Vp4),o($VS3,$Vq4),o($VS3,$Vr4),o($VS3,$Vs4),o($V88,$Vp3),o($V88,$Vq3),o($V88,$Vr3),o($V88,$Vs3),{199:[1,2540],200:2538,201:[1,2539]},o($VT3,$Vs6),o($VT3,$Vt6),o($VT3,$Vu6),o($VT3,$V22),o($VT3,$V32),o($VT3,$V42),o($VT3,$V52),o($VT3,$Vf4),o($VT3,$Vg4),o($VT3,$Vh4),o($VT3,$Vi4),o($VT3,$Vj4,{208:2541,209:2542,117:[1,2543]}),o($VT3,$Vk4),o($VT3,$Vl4),o($VT3,$Vm4),o($VT3,$Vn4),o($VT3,$Vo4),o($VT3,$Vp4),o($VT3,$Vq4),o($VT3,$Vr4),o($VT3,$Vs4),o($V98,$Vp3),o($V98,$Vq3),o($V98,$Vr3),o($V98,$Vs3),{199:[1,2546],200:2544,201:[1,2545]},o($VU3,$Vs6),o($VU3,$Vt6),o($VU3,$Vu6),o($VU3,$V22),o($VU3,$V32),o($VU3,$V42),o($VU3,$V52),o($VU3,$Vf4),o($VU3,$Vg4),o($VU3,$Vh4),o($VU3,$Vi4),o($VU3,$Vj4,{208:2547,209:2548,117:[1,2549]}),o($VU3,$Vk4),o($VU3,$Vl4),o($VU3,$Vm4),o($VU3,$Vn4),o($VU3,$Vo4),o($VU3,$Vp4),o($VU3,$Vq4),o($VU3,$Vr4),o($VU3,$Vs4),o($Va8,$Vp3),o($Va8,$Vq3),o($Va8,$Vr3),o($Va8,$Vs3),{20:[1,2552],22:[1,2554],93:2550,170:[1,2555],197:2551,221:[1,2553]},o($VQ3,$VN3),o($VQ,$VR,{68:2556,70:2557,72:2558,73:2559,79:2562,81:2563,78:2564,45:2565,98:2566,100:2567,93:2569,94:2570,95:2571,84:2572,101:2579,197:2580,97:2582,124:2583,105:2584,111:2590,113:2591,20:[1,2586],22:[1,2588],28:[1,2581],75:[1,2560],77:[1,2561],85:[1,2573],86:[1,2574],87:[1,2575],91:[1,2568],102:[1,2576],103:[1,2577],104:[1,2578],107:$Vb8,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:[1,2589],221:[1,2587]}),o($V65,$VF2,{90:2032,198:2033,89:2592,195:$Vn7}),o($VQ3,$VQ2),o($VQ3,$VB),o($VQ3,$VC),o($VQ3,$Vo),o($VQ3,$Vp),o($VQ3,$VD),o($VQ3,$Vq),o($VQ3,$Vr),o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:2593,127:$Vb3,154:$Vc3,194:$Vd3}),o($V65,$VF2,{90:2032,198:2033,89:2594,195:$Vn7}),o($VT3,$VI2,{105:1472,101:2595,107:$Vq6,108:$V_,109:$V$,110:$V01}),o($V45,$VJ2),o($V45,$Vk3),o($VQ3,$VP3),o($Vo6,$V_3),o($VS3,$V$3),o($Vo6,$V04,{37:2596,199:[1,2597]}),{20:$V14,22:$V24,135:2598,170:$V34,197:682,205:$V44,221:$V54},o($VQ3,$V64),o($VT3,$V$3),o($VQ3,$V04,{37:2599,199:[1,2600]}),{20:$V14,22:$V24,135:2601,170:$V34,197:682,205:$V44,221:$V54},o($VV3,$V74),o($VW3,$V84),o($VW3,$V94),o($VW3,$Va4),{106:[1,2602]},o($VW3,$V12),{106:[1,2604],112:2603,114:[1,2605],115:[1,2606],116:2607,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,2608]},o($Vp6,$Vb4),o($VU3,$V$3),o($Vp6,$V04,{37:2609,199:[1,2610]}),{20:$V14,22:$V24,135:2611,170:$V34,197:682,205:$V44,221:$V54},o($VW3,$Vc4),{127:[1,2612]},{20:[1,2615],22:[1,2617],93:2613,170:[1,2618],197:2614,221:[1,2616]},o($V65,$VF2,{90:2070,198:2071,89:2619,195:$Vp7}),o($VQ3,$VQ2),o($VQ3,$VB),o($VQ3,$VC),o($VQ3,$Vo),o($VQ3,$Vp),o($VQ3,$VD),o($VQ3,$Vq),o($VQ3,$Vr),o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:2620,127:$Vb3,154:$Vc3,194:$Vd3}),o($V65,$VF2,{90:2070,198:2071,89:2621,195:$Vp7}),o($VT3,$VI2,{105:1519,101:2622,107:$Vr6,108:$V_,109:$V$,110:$V01}),o($V45,$VJ2),o($V45,$Vk3),o($VQ3,$VP3),o($Vo6,$V_3),o($VS3,$V$3),o($Vo6,$V04,{37:2623,199:[1,2624]}),{20:$V14,22:$V24,135:2625,170:$V34,197:682,205:$V44,221:$V54},o($VQ3,$V64),o($VT3,$V$3),o($VQ3,$V04,{37:2626,199:[1,2627]}),{20:$V14,22:$V24,135:2628,170:$V34,197:682,205:$V44,221:$V54},o($VV3,$V74),o($VW3,$V84),o($VW3,$V94),o($VW3,$Va4),{106:[1,2629]},o($VW3,$V12),{106:[1,2631],112:2630,114:[1,2632],115:[1,2633],116:2634,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,2635]},o($Vp6,$Vb4),o($VU3,$V$3),o($Vp6,$V04,{37:2636,199:[1,2637]}),{20:$V14,22:$V24,135:2638,170:$V34,197:682,205:$V44,221:$V54},o($VW3,$Vc4),{127:[1,2639]},{20:[1,2642],22:[1,2644],93:2640,170:[1,2645],197:2641,221:[1,2643]},o($VB1,$VC6),o($VB1,$VU1),o($VD1,$VC6),o($VD1,$VU1),o($VN1,$VC6),o($VN1,$VU1),o($VA6,$VC6),o($VA6,$VU1),o($VA6,$V22),o($VA6,$V32),o($VA6,$V42),o($VA6,$V52),o($Vr7,$VC1,{88:2646}),o($Vr7,$Vc8),o($Vr7,$Vd8),o($Vr7,$Ve8),o($Vr7,$Vf8),o($Vr7,$Vg8),o($Vx7,$Vh8,{63:2647,57:[1,2648]}),o($Vz7,$Vi8,{67:2649,59:[1,2650]}),o($VB7,$Vj8),o($VB7,$Vk8,{80:2651,82:2652,84:2653,45:2654,124:2655,85:[1,2656],86:[1,2657],87:[1,2658],125:$VR,131:$VR,133:$VR,194:$VR,233:$VR}),o($VB7,$Vl8),o($VB7,$V76,{83:2659,79:2660,98:2661,100:2662,101:2666,105:2667,102:[1,2663],103:[1,2664],104:[1,2665],107:$Vm8,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:2669,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($VB7,$Vn8),o($Vo8,$VI1,{99:2670}),o($Vp8,$VJ1,{105:2133,101:2671,107:$VD7,108:$V_,109:$V$,110:$V01}),o($Vq8,$VL1,{92:2672}),o($Vq8,$VL1,{92:2673}),o($Vq8,$VL1,{92:2674}),o($VB7,$VM1,{111:2139,113:2140,97:2675,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vr8,$Vd6),o($Vr8,$Ve6),o($Vo8,$VQ1),o($Vo8,$VR1),o($Vo8,$VS1),o($Vo8,$VT1),o($Vq8,$VU1),o($VV1,$VW1,{167:2676}),o($Vs8,$VY1),{125:[1,2677],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($Vr8,$VO1),o($Vr8,$VP1),{20:[1,2681],22:[1,2685],23:2679,39:2678,206:2680,220:2682,221:[1,2684],222:[1,2683]},{106:[1,2686]},o($Vo8,$V12),o($Vq8,$V22),o($Vq8,$V32),o($Vq8,$V42),o($Vq8,$V52),{106:[1,2688],112:2687,114:[1,2689],115:[1,2690],116:2691,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,2692]},o($Vr7,$VC1,{88:2693}),o($VK6,$VD6),o($VK6,$VE6),o($VK6,$VF6),o($VN6,$VG6),o($VN6,$VH6),o($VN6,$VI6),o($Vw,$Vx,{52:2694,53:2695,61:2696,65:2697,47:2698,50:$Vy}),{76:[1,2699]},o($VJ4,$V46,{231:2700,59:[1,2701]}),o($VK4,$V56),o($VQ,$VR,{82:2702,84:2703,45:2704,124:2705,85:[1,2706],86:[1,2707],87:[1,2708]}),o($VK4,$V66),o($VK4,$V76,{83:2709,79:2710,98:2711,100:2712,101:2716,105:2717,102:[1,2713],103:[1,2714],104:[1,2715],107:$Vt8,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:2719,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($VK4,$V96),o($Vb6,$VL1,{92:2720}),o($Vb6,$VL1,{92:2721}),o($Vb6,$VL1,{92:2722}),o($VK4,$VM1,{111:2174,113:2175,97:2723,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vc6,$Vd6),o($Vc6,$Ve6),o($Vb6,$VU1),o($VV1,$VW1,{167:2724}),o($Vf6,$VY1),{125:[1,2725],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($Vc6,$VO1),o($Vc6,$VP1),{20:[1,2729],22:[1,2733],23:2727,39:2726,206:2728,220:2730,221:[1,2732],222:[1,2731]},o($Vb6,$V22),o($Vb6,$V32),o($Vb6,$V42),o($Vb6,$V52),{106:[1,2735],112:2734,114:[1,2736],115:[1,2737],116:2738,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,2739]},o($VK4,$V56),o($VQ,$VR,{82:2740,84:2741,45:2742,124:2743,85:[1,2744],86:[1,2745],87:[1,2746]}),o($VK4,$V66),o($VK4,$V76,{83:2747,79:2748,98:2749,100:2750,101:2754,105:2755,102:[1,2751],103:[1,2752],104:[1,2753],107:$Vu8,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:2757,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($VK4,$V96),o($Vb6,$VL1,{92:2758}),o($Vb6,$VL1,{92:2759}),o($Vb6,$VL1,{92:2760}),o($VK4,$VM1,{111:2199,113:2200,97:2761,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vc6,$Vd6),o($Vc6,$Ve6),o($Vb6,$VU1),o($VV1,$VW1,{167:2762}),o($Vf6,$VY1),{125:[1,2763],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($Vc6,$VO1),o($Vc6,$VP1),{20:[1,2767],22:[1,2771],23:2765,39:2764,206:2766,220:2768,221:[1,2770],222:[1,2769]},o($Vb6,$V22),o($Vb6,$V32),o($Vb6,$V42),o($Vb6,$V52),{106:[1,2773],112:2772,114:[1,2774],115:[1,2775],116:2776,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,2777]},{127:[1,2778]},o($VS6,$V74),o($Vb6,$Vk3),o($Vb6,$Vl3),o($Vb6,$Vm3),o($Vb6,$Vn3),o($Vb6,$Vo3),{117:[1,2779]},o($Vb6,$Vt3),o($Vc6,$VN5),o($Vf6,$Vg6),o($Vf6,$VU1),o($Vf6,$V22),o($Vf6,$V32),o($Vf6,$V42),o($Vf6,$V52),o($VW4,$Vd1),o($VW4,$Ve1),o($VW4,$Vf1),o($Vy3,$VL5),o($Vy3,$VM5),{20:$VU6,22:$VV6,93:2780,170:$VW6,197:2781,221:$VX6},o($VO,$VN3),o($VQ,$VR,{68:2782,70:2783,72:2784,73:2785,79:2788,81:2789,78:2790,45:2791,98:2792,100:2793,93:2795,94:2796,95:2797,84:2798,101:2805,197:2806,97:2808,124:2809,105:2810,111:2816,113:2817,20:[1,2812],22:[1,2814],28:[1,2807],75:[1,2786],77:[1,2787],85:[1,2799],86:[1,2800],87:[1,2801],91:[1,2794],102:[1,2802],103:[1,2803],104:[1,2804],107:$Vv8,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:[1,2815],221:[1,2813]}),o($VG2,$VF2,{90:2245,198:2246,89:2818,195:$VH7}),o($VO,$VQ2),o($VO,$VB),o($VO,$VC),o($VO,$Vo),o($VO,$Vp),o($VO,$VD),o($VO,$Vq),o($VO,$Vr),o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:2819,127:$Vb3,154:$Vc3,194:$Vd3}),o($VG2,$VF2,{90:2245,198:2246,89:2820,195:$VH7}),o($VD1,$VI2,{105:1684,101:2821,107:$VY6,108:$V_,109:$V$,110:$V01}),o($Vw2,$VJ2),o($Vw2,$Vk3),o($VO,$VP3),o($VZ3,$V_3),o($VB1,$V$3),o($VZ3,$V04,{37:2822,199:[1,2823]}),{20:$V14,22:$V24,135:2824,170:$V34,197:682,205:$V44,221:$V54},o($VO,$V64),o($VD1,$V$3),o($VO,$V04,{37:2825,199:[1,2826]}),{20:$V14,22:$V24,135:2827,170:$V34,197:682,205:$V44,221:$V54},o($VH1,$V74),o($VK1,$V84),o($VK1,$V94),o($VK1,$Va4),{106:[1,2828]},o($VK1,$V12),{106:[1,2830],112:2829,114:[1,2831],115:[1,2832],116:2833,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,2834]},o($VE1,$Vb4),o($VN1,$V$3),o($VE1,$V04,{37:2835,199:[1,2836]}),{20:$V14,22:$V24,135:2837,170:$V34,197:682,205:$V44,221:$V54},o($VK1,$Vc4),{127:[1,2838]},{20:[1,2841],22:[1,2843],93:2839,170:[1,2844],197:2840,221:[1,2842]},o($VG2,$VF2,{90:2283,198:2284,89:2845,195:$VJ7}),o($VO,$VQ2),o($VO,$VB),o($VO,$VC),o($VO,$Vo),o($VO,$Vp),o($VO,$VD),o($VO,$Vq),o($VO,$Vr),o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:2846,127:$Vb3,154:$Vc3,194:$Vd3}),o($VG2,$VF2,{90:2283,198:2284,89:2847,195:$VJ7}),o($VD1,$VI2,{105:1731,101:2848,107:$VZ6,108:$V_,109:$V$,110:$V01}),o($Vw2,$VJ2),o($Vw2,$Vk3),o($VO,$VP3),o($VZ3,$V_3),o($VB1,$V$3),o($VZ3,$V04,{37:2849,199:[1,2850]}),{20:$V14,22:$V24,135:2851,170:$V34,197:682,205:$V44,221:$V54},o($VO,$V64),o($VD1,$V$3),o($VO,$V04,{37:2852,199:[1,2853]}),{20:$V14,22:$V24,135:2854,170:$V34,197:682,205:$V44,221:$V54},o($VH1,$V74),o($VK1,$V84),o($VK1,$V94),o($VK1,$Va4),{106:[1,2855]},o($VK1,$V12),{106:[1,2857],112:2856,114:[1,2858],115:[1,2859],116:2860,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,2861]},o($VE1,$Vb4),o($VN1,$V$3),o($VE1,$V04,{37:2862,199:[1,2863]}),{20:$V14,22:$V24,135:2864,170:$V34,197:682,205:$V44,221:$V54},o($VK1,$Vc4),{127:[1,2865]},{20:[1,2868],22:[1,2870],93:2866,170:[1,2871],197:2867,221:[1,2869]},o($VE2,$Vd1),o($VE2,$Ve1),o($VE2,$Vf1),o($VB1,$VL5),o($VB1,$VM5),{20:$V_6,22:$V$6,93:2872,170:$V07,197:2873,221:$V17},o($VG2,$Vd1),o($VG2,$Ve1),o($VG2,$Vf1),o($VD1,$VL5),o($VD1,$VM5),{20:$V27,22:$V37,93:2874,170:$V47,197:2875,221:$V57},o($VK1,$Vg6),o($VK1,$VU1),o($VK1,$V22),o($VK1,$V32),o($VK1,$V42),o($VK1,$V52),o($VP2,$Vd1),o($VP2,$Ve1),o($VP2,$Vf1),o($VN1,$VL5),o($VN1,$VM5),{20:$V67,22:$V77,93:2876,170:$V87,197:2877,221:$V97},o($VO,$Vs2),o($VO,$Vt2),o($VO,$VF1),o($VO,$VG1),o($VD1,$VC1,{88:2878}),o($VO,$VO1),o($VO,$VP1),{20:[1,2882],22:[1,2886],23:2880,39:2879,206:2881,220:2883,221:[1,2885],222:[1,2884]},{125:[1,2887],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VO,$Vu2),o($VO,$Vv2),o($VD1,$VC1,{88:2888}),o($Vw2,$VI1,{99:2889}),o($VD1,$VJ1,{105:2343,101:2890,107:$VL7,108:$V_,109:$V$,110:$V01}),o($Vw2,$VQ1),o($Vw2,$VR1),o($Vw2,$VS1),o($Vw2,$VT1),{106:[1,2891]},o($Vw2,$V12),{76:[1,2892]},o($VE2,$VF2,{89:2893,90:2894,198:2895,195:[1,2896]}),o($VG2,$VF2,{89:2897,90:2898,198:2899,195:$Vw8}),o($VB1,$VI2,{105:1868,101:2901,107:$Va7,108:$V_,109:$V$,110:$V01}),o($VH1,$VJ2),o($VD1,$VK2,{96:2902,101:2903,97:2904,105:2905,111:2907,113:2908,107:$Vx8,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VD1,$VM2,{96:2902,101:2903,97:2904,105:2905,111:2907,113:2908,107:$Vx8,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VD1,$VN2,{96:2902,101:2903,97:2904,105:2905,111:2907,113:2908,107:$Vx8,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VX1,$VO2),o($VP2,$VF2,{89:2909,90:2910,198:2911,195:[1,2912]}),o($VE1,$VQ2),o($VE1,$VB),o($VE1,$VC),o($VE1,$Vo),o($VE1,$Vp),o($VE1,$VD),o($VE1,$Vq),o($VE1,$Vr),{20:$VR2,22:$VS2,23:404,29:[1,2913],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:2914,127:$Vb3,154:$Vc3,194:$Vd3}),o($VH1,$Vk3),o($VX1,$Vl3),o($VX1,$Vm3),o($VX1,$Vn3),o($VX1,$Vo3),{117:[1,2915]},o($VX1,$Vt3),o($VD1,$VN5),{199:[1,2918],200:2916,201:[1,2917]},o($VB1,$Vs6),o($VB1,$Vt6),o($VB1,$Vu6),o($VB1,$V22),o($VB1,$V32),o($VB1,$V42),o($VB1,$V52),o($VB1,$Vf4),o($VB1,$Vg4),o($VB1,$Vh4),o($VB1,$Vi4),o($VB1,$Vj4,{208:2919,209:2920,117:[1,2921]}),o($VB1,$Vk4),o($VB1,$Vl4),o($VB1,$Vm4),o($VB1,$Vn4),o($VB1,$Vo4),o($VB1,$Vp4),o($VB1,$Vq4),o($VB1,$Vr4),o($VB1,$Vs4),o($Vv6,$Vp3),o($Vv6,$Vq3),o($Vv6,$Vr3),o($Vv6,$Vs3),{199:[1,2924],200:2922,201:[1,2923]},o($VD1,$Vs6),o($VD1,$Vt6),o($VD1,$Vu6),o($VD1,$V22),o($VD1,$V32),o($VD1,$V42),o($VD1,$V52),o($VD1,$Vf4),o($VD1,$Vg4),o($VD1,$Vh4),o($VD1,$Vi4),o($VD1,$Vj4,{208:2925,209:2926,117:[1,2927]}),o($VD1,$Vk4),o($VD1,$Vl4),o($VD1,$Vm4),o($VD1,$Vn4),o($VD1,$Vo4),o($VD1,$Vp4),o($VD1,$Vq4),o($VD1,$Vr4),o($VD1,$Vs4),o($Vw6,$Vp3),o($Vw6,$Vq3),o($Vw6,$Vr3),o($Vw6,$Vs3),{20:[1,2930],22:[1,2932],93:2928,170:[1,2933],197:2929,221:[1,2931]},{199:[1,2936],200:2934,201:[1,2935]},o($VN1,$Vs6),o($VN1,$Vt6),o($VN1,$Vu6),o($VN1,$V22),o($VN1,$V32),o($VN1,$V42),o($VN1,$V52),o($VN1,$Vf4),o($VN1,$Vg4),o($VN1,$Vh4),o($VN1,$Vi4),o($VN1,$Vj4,{208:2937,209:2938,117:[1,2939]}),o($VN1,$Vk4),o($VN1,$Vl4),o($VN1,$Vm4),o($VN1,$Vn4),o($VN1,$Vo4),o($VN1,$Vp4),o($VN1,$Vq4),o($VN1,$Vr4),o($VN1,$Vs4),o($Vx6,$Vp3),o($Vx6,$Vq3),o($Vx6,$Vr3),o($Vx6,$Vs3),o($VD1,$VN5),{199:[1,2942],200:2940,201:[1,2941]},o($VB1,$Vs6),o($VB1,$Vt6),o($VB1,$Vu6),o($VB1,$V22),o($VB1,$V32),o($VB1,$V42),o($VB1,$V52),o($VB1,$Vf4),o($VB1,$Vg4),o($VB1,$Vh4),o($VB1,$Vi4),o($VB1,$Vj4,{208:2943,209:2944,117:[1,2945]}),o($VB1,$Vk4),o($VB1,$Vl4),o($VB1,$Vm4),o($VB1,$Vn4),o($VB1,$Vo4),o($VB1,$Vp4),o($VB1,$Vq4),o($VB1,$Vr4),o($VB1,$Vs4),o($Vv6,$Vp3),o($Vv6,$Vq3),o($Vv6,$Vr3),o($Vv6,$Vs3),{199:[1,2948],200:2946,201:[1,2947]},o($VD1,$Vs6),o($VD1,$Vt6),o($VD1,$Vu6),o($VD1,$V22),o($VD1,$V32),o($VD1,$V42),o($VD1,$V52),o($VD1,$Vf4),o($VD1,$Vg4),o($VD1,$Vh4),o($VD1,$Vi4),o($VD1,$Vj4,{208:2949,209:2950,117:[1,2951]}),o($VD1,$Vk4),o($VD1,$Vl4),o($VD1,$Vm4),o($VD1,$Vn4),o($VD1,$Vo4),o($VD1,$Vp4),o($VD1,$Vq4),o($VD1,$Vr4),o($VD1,$Vs4),o($Vw6,$Vp3),o($Vw6,$Vq3),o($Vw6,$Vr3),o($Vw6,$Vs3),{20:[1,2954],22:[1,2956],93:2952,170:[1,2957],197:2953,221:[1,2955]},{199:[1,2960],200:2958,201:[1,2959]},o($VN1,$Vs6),o($VN1,$Vt6),o($VN1,$Vu6),o($VN1,$V22),o($VN1,$V32),o($VN1,$V42),o($VN1,$V52),o($VN1,$Vf4),o($VN1,$Vg4),o($VN1,$Vh4),o($VN1,$Vi4),o($VN1,$Vj4,{208:2961,209:2962,117:[1,2963]}),o($VN1,$Vk4),o($VN1,$Vl4),o($VN1,$Vm4),o($VN1,$Vn4),o($VN1,$Vo4),o($VN1,$Vp4),o($VN1,$Vq4),o($VN1,$Vr4),o($VN1,$Vs4),o($Vx6,$Vp3),o($Vx6,$Vq3),o($Vx6,$Vr3),o($Vx6,$Vs3),o($V55,$Vd1),o($V55,$Ve1),o($V55,$Vf1),o($VS3,$VL5),o($VS3,$VM5),{20:$Vb7,22:$Vc7,93:2964,170:$Vd7,197:2965,221:$Ve7},o($V65,$Vd1),o($V65,$Ve1),o($V65,$Vf1),o($VT3,$VL5),o($VT3,$VM5),{20:$Vf7,22:$Vg7,93:2966,170:$Vh7,197:2967,221:$Vi7},o($V85,$Vd1),o($V85,$Ve1),o($V85,$Vf1),o($VU3,$VL5),o($VU3,$VM5),{20:$Vj7,22:$Vk7,93:2968,170:$Vl7,197:2969,221:$Vm7},o($VW3,$Vg6),o($VW3,$VU1),o($VW3,$V22),o($VW3,$V32),o($VW3,$V42),o($VW3,$V52),o($VQ3,$Vl1),o($VQ,$VR,{71:2970,73:2971,78:2972,45:2973,84:2974,124:2978,57:$Vm1,59:$Vm1,76:$Vm1,85:[1,2975],86:[1,2976],87:[1,2977]}),o($VQ3,$Vq1),o($VQ3,$Vr1,{74:2979,70:2980,79:2981,98:2982,100:2983,101:2987,105:2988,102:[1,2984],103:[1,2985],104:[1,2986],107:$Vy8,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:2990,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($VQ3,$VA1),o($VS3,$VC1,{88:2991}),o($VT3,$VC1,{88:2992}),o($Vp6,$VF1),o($Vp6,$VG1),o($VV3,$VI1,{99:2993}),o($VS3,$VJ1,{105:2584,101:2994,107:$Vb8,108:$V_,109:$V$,110:$V01}),o($VW3,$VL1,{92:2995}),o($VW3,$VL1,{92:2996}),o($VW3,$VL1,{92:2997}),o($VT3,$VM1,{111:2590,113:2591,97:2998,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VU3,$VC1,{88:2999}),o($Vp6,$VO1),o($Vp6,$VP1),{20:[1,3003],22:[1,3007],23:3001,39:3000,206:3002,220:3004,221:[1,3006],222:[1,3005]},o($VV3,$VQ1),o($VV3,$VR1),o($VV3,$VS1),o($VV3,$VT1),o($VW3,$VU1),o($VV1,$VW1,{167:3008}),o($VX3,$VY1),{125:[1,3009],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},{106:[1,3010]},o($VV3,$V12),o($VW3,$V22),o($VW3,$V32),o($VW3,$V42),o($VW3,$V52),{106:[1,3012],112:3011,114:[1,3013],115:[1,3014],116:3015,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,3016]},o($VQ3,$Vb4),{127:[1,3017]},o($VQ3,$V_3),o($V45,$V74),o($V55,$Vc5),{20:$Vj,22:$Vk,23:3018,220:50,221:$Vl},{20:$Vz8,22:$VA8,106:[1,3031],114:[1,3032],115:[1,3033],116:3030,170:$VB8,186:3021,196:3019,197:3020,202:3026,203:3027,204:3028,207:3029,210:[1,3034],211:[1,3035],212:[1,3040],213:[1,3041],214:[1,3042],215:[1,3043],216:[1,3036],217:[1,3037],218:[1,3038],219:[1,3039],221:$VC8},o($V65,$Vc5),{20:$Vj,22:$Vk,23:3044,220:50,221:$Vl},{20:$VD8,22:$VE8,106:[1,3057],114:[1,3058],115:[1,3059],116:3056,170:$VF8,186:3047,196:3045,197:3046,202:3052,203:3053,204:3054,207:3055,210:[1,3060],211:[1,3061],212:[1,3066],213:[1,3067],214:[1,3068],215:[1,3069],216:[1,3062],217:[1,3063],218:[1,3064],219:[1,3065],221:$VG8},o($VW3,$Vk3),o($VW3,$Vl3),o($VW3,$Vm3),o($VW3,$Vn3),o($VW3,$Vo3),{117:[1,3070]},o($VW3,$Vt3),o($V85,$Vc5),{20:$Vj,22:$Vk,23:3071,220:50,221:$Vl},{20:$VH8,22:$VI8,106:[1,3084],114:[1,3085],115:[1,3086],116:3083,170:$VJ8,186:3074,196:3072,197:3073,202:3079,203:3080,204:3081,207:3082,210:[1,3087],211:[1,3088],212:[1,3093],213:[1,3094],214:[1,3095],215:[1,3096],216:[1,3089],217:[1,3090],218:[1,3091],219:[1,3092],221:$VK8},o($VU3,$VN5),o($VX3,$Vg6),o($VX3,$VU1),o($VX3,$V22),o($VX3,$V32),o($VX3,$V42),o($VX3,$V52),o($VQ3,$Vb4),{127:[1,3097]},o($VQ3,$V_3),o($V45,$V74),o($V55,$Vc5),{20:$Vj,22:$Vk,23:3098,220:50,221:$Vl},{20:$VL8,22:$VM8,106:[1,3111],114:[1,3112],115:[1,3113],116:3110,170:$VN8,186:3101,196:3099,197:3100,202:3106,203:3107,204:3108,207:3109,210:[1,3114],211:[1,3115],212:[1,3120],213:[1,3121],214:[1,3122],215:[1,3123],216:[1,3116],217:[1,3117],218:[1,3118],219:[1,3119],221:$VO8},o($V65,$Vc5),{20:$Vj,22:$Vk,23:3124,220:50,221:$Vl},{20:$VP8,22:$VQ8,106:[1,3137],114:[1,3138],115:[1,3139],116:3136,170:$VR8,186:3127,196:3125,197:3126,202:3132,203:3133,204:3134,207:3135,210:[1,3140],211:[1,3141],212:[1,3146],213:[1,3147],214:[1,3148],215:[1,3149],216:[1,3142],217:[1,3143],218:[1,3144],219:[1,3145],221:$VS8},o($VW3,$Vk3),o($VW3,$Vl3),o($VW3,$Vm3),o($VW3,$Vn3),o($VW3,$Vo3),{117:[1,3150]},o($VW3,$Vt3),o($V85,$Vc5),{20:$Vj,22:$Vk,23:3151,220:50,221:$Vl},{20:$VT8,22:$VU8,106:[1,3164],114:[1,3165],115:[1,3166],116:3163,170:$VV8,186:3154,196:3152,197:3153,202:3159,203:3160,204:3161,207:3162,210:[1,3167],211:[1,3168],212:[1,3173],213:[1,3174],214:[1,3175],215:[1,3176],216:[1,3169],217:[1,3170],218:[1,3171],219:[1,3172],221:$VW8},o($VU3,$VN5),o($VX3,$Vg6),o($VX3,$VU1),o($VX3,$V22),o($VX3,$V32),o($VX3,$V42),o($VX3,$V52),o($VX8,$VF2,{89:3177,90:3178,198:3179,195:$VY8}),o($Vz7,$VZ8),o($Vw,$Vx,{61:3181,65:3182,47:3183,50:$Vy}),o($VB7,$V_8),o($Vw,$Vx,{65:3184,47:3185,50:$Vy}),o($VB7,$V$8),o($VB7,$V09),o($VB7,$Vd6),o($VB7,$Ve6),{125:[1,3186],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VB7,$VO1),o($VB7,$VP1),{20:[1,3190],22:[1,3194],23:3188,39:3187,206:3189,220:3191,221:[1,3193],222:[1,3192]},o($VB7,$V19),o($VB7,$VR6),o($V29,$VI1,{99:3195}),o($VB7,$VJ1,{105:2667,101:3196,107:$Vm8,108:$V_,109:$V$,110:$V01}),o($V29,$VQ1),o($V29,$VR1),o($V29,$VS1),o($V29,$VT1),{106:[1,3197]},o($V29,$V12),{76:[1,3198]},o($Vp8,$VI2,{105:2133,101:3199,107:$VD7,108:$V_,109:$V$,110:$V01}),o($Vo8,$VJ2),o($VB7,$VK2,{96:3200,101:3201,97:3202,105:3203,111:3205,113:3206,107:$V39,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VB7,$VM2,{96:3200,101:3201,97:3202,105:3203,111:3205,113:3206,107:$V39,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VB7,$VN2,{96:3200,101:3201,97:3202,105:3203,111:3205,113:3206,107:$V39,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vs8,$VO2),{20:$VR2,22:$VS2,23:404,29:[1,3207],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:3208,127:$Vb3,154:$Vc3,194:$Vd3}),o($Vr8,$VQ2),o($Vr8,$VB),o($Vr8,$VC),o($Vr8,$Vo),o($Vr8,$Vp),o($Vr8,$VD),o($Vr8,$Vq),o($Vr8,$Vr),o($Vo8,$Vk3),o($Vs8,$Vl3),o($Vs8,$Vm3),o($Vs8,$Vn3),o($Vs8,$Vo3),{117:[1,3209]},o($Vs8,$Vt3),o($VX8,$VF2,{90:3178,198:3179,89:3210,195:$VY8}),o($V49,$Vs7,{158:3211,159:3212,162:$V59,163:$V69,164:$V79,165:$V89}),o($V99,$Vy7),o($Va9,$VA7,{62:3217}),o($Vb9,$VC7,{66:3218}),o($VQ,$VR,{69:3219,79:3220,81:3221,82:3222,98:3225,100:3226,93:3228,94:3229,95:3230,84:3231,45:3232,101:3236,197:3237,97:3239,124:3240,105:3244,111:3250,113:3251,20:[1,3246],22:[1,3248],28:[1,3238],75:[1,3223],77:[1,3224],85:[1,3241],86:[1,3242],87:[1,3243],91:[1,3227],102:[1,3233],103:[1,3234],104:[1,3235],107:$Vc9,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:[1,3249],221:[1,3247]}),o($V49,$Vs7,{159:3212,158:3252,162:$V59,163:$V69,164:$V79,165:$V89}),o($VK4,$VO6),o($Vw,$Vx,{229:3253,47:3254,50:$Vy}),o($VK4,$VP6),o($VK4,$Vd6),o($VK4,$Ve6),{125:[1,3255],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VK4,$VO1),o($VK4,$VP1),{20:[1,3259],22:[1,3263],23:3257,39:3256,206:3258,220:3260,221:[1,3262],222:[1,3261]},o($VK4,$VQ6),o($VK4,$VR6),o($VS6,$VI1,{99:3264}),o($VK4,$VJ1,{105:2717,101:3265,107:$Vt8,108:$V_,109:$V$,110:$V01}),o($VS6,$VQ1),o($VS6,$VR1),o($VS6,$VS1),o($VS6,$VT1),{106:[1,3266]},o($VS6,$V12),{76:[1,3267]},o($VK4,$VK2,{96:3268,101:3269,97:3270,105:3271,111:3273,113:3274,107:$Vd9,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VK4,$VM2,{96:3268,101:3269,97:3270,105:3271,111:3273,113:3274,107:$Vd9,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VK4,$VN2,{96:3268,101:3269,97:3270,105:3271,111:3273,113:3274,107:$Vd9,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vf6,$VO2),{20:$VR2,22:$VS2,23:404,29:[1,3275],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:3276,127:$Vb3,154:$Vc3,194:$Vd3}),o($Vc6,$VQ2),o($Vc6,$VB),o($Vc6,$VC),o($Vc6,$Vo),o($Vc6,$Vp),o($Vc6,$VD),o($Vc6,$Vq),o($Vc6,$Vr),o($Vf6,$Vl3),o($Vf6,$Vm3),o($Vf6,$Vn3),o($Vf6,$Vo3),{117:[1,3277]},o($Vf6,$Vt3),o($VK4,$VP6),o($VK4,$Vd6),o($VK4,$Ve6),{125:[1,3278],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VK4,$VO1),o($VK4,$VP1),{20:[1,3282],22:[1,3286],23:3280,39:3279,206:3281,220:3283,221:[1,3285],222:[1,3284]},o($VK4,$VQ6),o($VK4,$VR6),o($VS6,$VI1,{99:3287}),o($VK4,$VJ1,{105:2755,101:3288,107:$Vu8,108:$V_,109:$V$,110:$V01}),o($VS6,$VQ1),o($VS6,$VR1),o($VS6,$VS1),o($VS6,$VT1),{106:[1,3289]},o($VS6,$V12),{76:[1,3290]},o($VK4,$VK2,{96:3291,101:3292,97:3293,105:3294,111:3296,113:3297,107:$Ve9,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VK4,$VM2,{96:3291,101:3292,97:3293,105:3294,111:3296,113:3297,107:$Ve9,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VK4,$VN2,{96:3291,101:3292,97:3293,105:3294,111:3296,113:3297,107:$Ve9,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vf6,$VO2),{20:$VR2,22:$VS2,23:404,29:[1,3298],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:3299,127:$Vb3,154:$Vc3,194:$Vd3}),o($Vc6,$VQ2),o($Vc6,$VB),o($Vc6,$VC),o($Vc6,$Vo),o($Vc6,$Vp),o($Vc6,$VD),o($Vc6,$Vq),o($Vc6,$Vr),o($Vf6,$Vl3),o($Vf6,$Vm3),o($Vf6,$Vn3),o($Vf6,$Vo3),{117:[1,3300]},o($Vf6,$Vt3),o($VK4,$VN5),{20:[1,3303],22:[1,3305],93:3301,170:[1,3306],197:3302,221:[1,3304]},o($Vy3,$VC6),o($Vy3,$VU1),o($VO,$Vl1),o($VO,$Vm1,{71:3307,73:3308,78:3309,45:3310,84:3311,124:3315,85:[1,3312],86:[1,3313],87:[1,3314],125:$VR,131:$VR,133:$VR,194:$VR,233:$VR}),o($VO,$Vq1),o($VO,$Vr1,{74:3316,70:3317,79:3318,98:3319,100:3320,101:3324,105:3325,102:[1,3321],103:[1,3322],104:[1,3323],107:$Vf9,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:3327,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($VO,$VA1),o($VB1,$VC1,{88:3328}),o($VD1,$VC1,{88:3329}),o($VE1,$VF1),o($VE1,$VG1),o($VH1,$VI1,{99:3330}),o($VB1,$VJ1,{105:2810,101:3331,107:$Vv8,108:$V_,109:$V$,110:$V01}),o($VK1,$VL1,{92:3332}),o($VK1,$VL1,{92:3333}),o($VK1,$VL1,{92:3334}),o($VD1,$VM1,{111:2816,113:2817,97:3335,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VN1,$VC1,{88:3336}),o($VE1,$VO1),o($VE1,$VP1),{20:[1,3340],22:[1,3344],23:3338,39:3337,206:3339,220:3341,221:[1,3343],222:[1,3342]},o($VH1,$VQ1),o($VH1,$VR1),o($VH1,$VS1),o($VH1,$VT1),o($VK1,$VU1),o($VV1,$VW1,{167:3345}),o($VX1,$VY1),{125:[1,3346],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},{106:[1,3347]},o($VH1,$V12),o($VK1,$V22),o($VK1,$V32),o($VK1,$V42),o($VK1,$V52),{106:[1,3349],112:3348,114:[1,3350],115:[1,3351],116:3352,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,3353]},o($VO,$Vb4),{127:[1,3354]},o($VO,$V_3),o($Vw2,$V74),o($VE2,$Vc5),{20:$Vj,22:$Vk,23:3355,220:50,221:$Vl},{20:$Vg9,22:$Vh9,106:[1,3368],114:[1,3369],115:[1,3370],116:3367,170:$Vi9,186:3358,196:3356,197:3357,202:3363,203:3364,204:3365,207:3366,210:[1,3371],211:[1,3372],212:[1,3377],213:[1,3378],214:[1,3379],215:[1,3380],216:[1,3373],217:[1,3374],218:[1,3375],219:[1,3376],221:$Vj9},o($VG2,$Vc5),{20:$Vj,22:$Vk,23:3381,220:50,221:$Vl},{20:$Vk9,22:$Vl9,106:[1,3394],114:[1,3395],115:[1,3396],116:3393,170:$Vm9,186:3384,196:3382,197:3383,202:3389,203:3390,204:3391,207:3392,210:[1,3397],211:[1,3398],212:[1,3403],213:[1,3404],214:[1,3405],215:[1,3406],216:[1,3399],217:[1,3400],218:[1,3401],219:[1,3402],221:$Vn9},o($VK1,$Vk3),o($VK1,$Vl3),o($VK1,$Vm3),o($VK1,$Vn3),o($VK1,$Vo3),{117:[1,3407]},o($VK1,$Vt3),o($VP2,$Vc5),{20:$Vj,22:$Vk,23:3408,220:50,221:$Vl},{20:$Vo9,22:$Vp9,106:[1,3421],114:[1,3422],115:[1,3423],116:3420,170:$Vq9,186:3411,196:3409,197:3410,202:3416,203:3417,204:3418,207:3419,210:[1,3424],211:[1,3425],212:[1,3430],213:[1,3431],214:[1,3432],215:[1,3433],216:[1,3426],217:[1,3427],218:[1,3428],219:[1,3429],221:$Vr9},o($VN1,$VN5),o($VX1,$Vg6),o($VX1,$VU1),o($VX1,$V22),o($VX1,$V32),o($VX1,$V42),o($VX1,$V52),o($VO,$Vb4),{127:[1,3434]},o($VO,$V_3),o($Vw2,$V74),o($VE2,$Vc5),{20:$Vj,22:$Vk,23:3435,220:50,221:$Vl},{20:$Vs9,22:$Vt9,106:[1,3448],114:[1,3449],115:[1,3450],116:3447,170:$Vu9,186:3438,196:3436,197:3437,202:3443,203:3444,204:3445,207:3446,210:[1,3451],211:[1,3452],212:[1,3457],213:[1,3458],214:[1,3459],215:[1,3460],216:[1,3453],217:[1,3454],218:[1,3455],219:[1,3456],221:$Vv9},o($VG2,$Vc5),{20:$Vj,22:$Vk,23:3461,220:50,221:$Vl},{20:$Vw9,22:$Vx9,106:[1,3474],114:[1,3475],115:[1,3476],116:3473,170:$Vy9,186:3464,196:3462,197:3463,202:3469,203:3470,204:3471,207:3472,210:[1,3477],211:[1,3478],212:[1,3483],213:[1,3484],214:[1,3485],215:[1,3486],216:[1,3479],217:[1,3480],218:[1,3481],219:[1,3482],221:$Vz9},o($VK1,$Vk3),o($VK1,$Vl3),o($VK1,$Vm3),o($VK1,$Vn3),o($VK1,$Vo3),{117:[1,3487]},o($VK1,$Vt3),o($VP2,$Vc5),{20:$Vj,22:$Vk,23:3488,220:50,221:$Vl},{20:$VA9,22:$VB9,106:[1,3501],114:[1,3502],115:[1,3503],116:3500,170:$VC9,186:3491,196:3489,197:3490,202:3496,203:3497,204:3498,207:3499,210:[1,3504],211:[1,3505],212:[1,3510],213:[1,3511],214:[1,3512],215:[1,3513],216:[1,3506],217:[1,3507],218:[1,3508],219:[1,3509],221:$VD9},o($VN1,$VN5),o($VX1,$Vg6),o($VX1,$VU1),o($VX1,$V22),o($VX1,$V32),o($VX1,$V42),o($VX1,$V52),o($VB1,$VC6),o($VB1,$VU1),o($VD1,$VC6),o($VD1,$VU1),o($VN1,$VC6),o($VN1,$VU1),o($VG2,$VF2,{90:2898,198:2899,89:3514,195:$Vw8}),o($VO,$VQ2),o($VO,$VB),o($VO,$VC),o($VO,$Vo),o($VO,$Vp),o($VO,$VD),o($VO,$Vq),o($VO,$Vr),o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:3515,127:$Vb3,154:$Vc3,194:$Vd3}),o($VG2,$VF2,{90:2898,198:2899,89:3516,195:$Vw8}),o($VD1,$VI2,{105:2343,101:3517,107:$VL7,108:$V_,109:$V$,110:$V01}),o($Vw2,$VJ2),o($Vw2,$Vk3),o($VO,$VP3),o($VZ3,$V_3),o($VB1,$V$3),o($VZ3,$V04,{37:3518,199:[1,3519]}),{20:$V14,22:$V24,135:3520,170:$V34,197:682,205:$V44,221:$V54},o($VO,$V64),o($VD1,$V$3),o($VO,$V04,{37:3521,199:[1,3522]}),{20:$V14,22:$V24,135:3523,170:$V34,197:682,205:$V44,221:$V54},o($VH1,$V74),o($VK1,$V84),o($VK1,$V94),o($VK1,$Va4),{106:[1,3524]},o($VK1,$V12),{106:[1,3526],112:3525,114:[1,3527],115:[1,3528],116:3529,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,3530]},o($VE1,$Vb4),o($VN1,$V$3),o($VE1,$V04,{37:3531,199:[1,3532]}),{20:$V14,22:$V24,135:3533,170:$V34,197:682,205:$V44,221:$V54},o($VK1,$Vc4),{127:[1,3534]},{20:[1,3537],22:[1,3539],93:3535,170:[1,3540],197:3536,221:[1,3538]},o($VE2,$Vd1),o($VE2,$Ve1),o($VE2,$Vf1),o($VB1,$VL5),o($VB1,$VM5),{20:$VM7,22:$VN7,93:3541,170:$VO7,197:3542,221:$VP7},o($VG2,$Vd1),o($VG2,$Ve1),o($VG2,$Vf1),o($VD1,$VL5),o($VD1,$VM5),{20:$VQ7,22:$VR7,93:3543,170:$VS7,197:3544,221:$VT7},o($VK1,$Vg6),o($VK1,$VU1),o($VK1,$V22),o($VK1,$V32),o($VK1,$V42),o($VK1,$V52),o($VP2,$Vd1),o($VP2,$Ve1),o($VP2,$Vf1),o($VN1,$VL5),o($VN1,$VM5),{20:$VU7,22:$VV7,93:3545,170:$VW7,197:3546,221:$VX7},o($VE2,$Vd1),o($VE2,$Ve1),o($VE2,$Vf1),o($VB1,$VL5),o($VB1,$VM5),{20:$VY7,22:$VZ7,93:3547,170:$V_7,197:3548,221:$V$7},o($VG2,$Vd1),o($VG2,$Ve1),o($VG2,$Vf1),o($VD1,$VL5),o($VD1,$VM5),{20:$V08,22:$V18,93:3549,170:$V28,197:3550,221:$V38},o($VK1,$Vg6),o($VK1,$VU1),o($VK1,$V22),o($VK1,$V32),o($VK1,$V42),o($VK1,$V52),o($VP2,$Vd1),o($VP2,$Ve1),o($VP2,$Vf1),o($VN1,$VL5),o($VN1,$VM5),{20:$V48,22:$V58,93:3551,170:$V68,197:3552,221:$V78},o($VS3,$VC6),o($VS3,$VU1),o($VT3,$VC6),o($VT3,$VU1),o($VU3,$VC6),o($VU3,$VU1),o($VQ3,$Vs2),o($VQ3,$Vt2),o($VQ3,$VF1),o($VQ3,$VG1),o($VT3,$VC1,{88:3553}),o($VQ3,$VO1),o($VQ3,$VP1),{20:[1,3557],22:[1,3561],23:3555,39:3554,206:3556,220:3558,221:[1,3560],222:[1,3559]},{125:[1,3562],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VQ3,$Vu2),o($VQ3,$Vv2),o($VT3,$VC1,{88:3563}),o($V45,$VI1,{99:3564}),o($VT3,$VJ1,{105:2988,101:3565,107:$Vy8,108:$V_,109:$V$,110:$V01}),o($V45,$VQ1),o($V45,$VR1),o($V45,$VS1),o($V45,$VT1),{106:[1,3566]},o($V45,$V12),{76:[1,3567]},o($V55,$VF2,{89:3568,90:3569,198:3570,195:[1,3571]}),o($V65,$VF2,{89:3572,90:3573,198:3574,195:$VE9}),o($VS3,$VI2,{105:2584,101:3576,107:$Vb8,108:$V_,109:$V$,110:$V01}),o($VV3,$VJ2),o($VT3,$VK2,{96:3577,101:3578,97:3579,105:3580,111:3582,113:3583,107:$VF9,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VT3,$VM2,{96:3577,101:3578,97:3579,105:3580,111:3582,113:3583,107:$VF9,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VT3,$VN2,{96:3577,101:3578,97:3579,105:3580,111:3582,113:3583,107:$VF9,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VX3,$VO2),o($V85,$VF2,{89:3584,90:3585,198:3586,195:[1,3587]}),o($Vp6,$VQ2),o($Vp6,$VB),o($Vp6,$VC),o($Vp6,$Vo),o($Vp6,$Vp),o($Vp6,$VD),o($Vp6,$Vq),o($Vp6,$Vr),{20:$VR2,22:$VS2,23:404,29:[1,3588],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:3589,127:$Vb3,154:$Vc3,194:$Vd3}),o($VV3,$Vk3),o($VX3,$Vl3),o($VX3,$Vm3),o($VX3,$Vn3),o($VX3,$Vo3),{117:[1,3590]},o($VX3,$Vt3),o($VT3,$VN5),{199:[1,3593],200:3591,201:[1,3592]},o($VS3,$Vs6),o($VS3,$Vt6),o($VS3,$Vu6),o($VS3,$V22),o($VS3,$V32),o($VS3,$V42),o($VS3,$V52),o($VS3,$Vf4),o($VS3,$Vg4),o($VS3,$Vh4),o($VS3,$Vi4),o($VS3,$Vj4,{208:3594,209:3595,117:[1,3596]}),o($VS3,$Vk4),o($VS3,$Vl4),o($VS3,$Vm4),o($VS3,$Vn4),o($VS3,$Vo4),o($VS3,$Vp4),o($VS3,$Vq4),o($VS3,$Vr4),o($VS3,$Vs4),o($V88,$Vp3),o($V88,$Vq3),o($V88,$Vr3),o($V88,$Vs3),{199:[1,3599],200:3597,201:[1,3598]},o($VT3,$Vs6),o($VT3,$Vt6),o($VT3,$Vu6),o($VT3,$V22),o($VT3,$V32),o($VT3,$V42),o($VT3,$V52),o($VT3,$Vf4),o($VT3,$Vg4),o($VT3,$Vh4),o($VT3,$Vi4),o($VT3,$Vj4,{208:3600,209:3601,117:[1,3602]}),o($VT3,$Vk4),o($VT3,$Vl4),o($VT3,$Vm4),o($VT3,$Vn4),o($VT3,$Vo4),o($VT3,$Vp4),o($VT3,$Vq4),o($VT3,$Vr4),o($VT3,$Vs4),o($V98,$Vp3),o($V98,$Vq3),o($V98,$Vr3),o($V98,$Vs3),{20:[1,3605],22:[1,3607],93:3603,170:[1,3608],197:3604,221:[1,3606]},{199:[1,3611],200:3609,201:[1,3610]},o($VU3,$Vs6),o($VU3,$Vt6),o($VU3,$Vu6),o($VU3,$V22),o($VU3,$V32),o($VU3,$V42),o($VU3,$V52),o($VU3,$Vf4),o($VU3,$Vg4),o($VU3,$Vh4),o($VU3,$Vi4),o($VU3,$Vj4,{208:3612,209:3613,117:[1,3614]}),o($VU3,$Vk4),o($VU3,$Vl4),o($VU3,$Vm4),o($VU3,$Vn4),o($VU3,$Vo4),o($VU3,$Vp4),o($VU3,$Vq4),o($VU3,$Vr4),o($VU3,$Vs4),o($Va8,$Vp3),o($Va8,$Vq3),o($Va8,$Vr3),o($Va8,$Vs3),o($VT3,$VN5),{199:[1,3617],200:3615,201:[1,3616]},o($VS3,$Vs6),o($VS3,$Vt6),o($VS3,$Vu6),o($VS3,$V22),o($VS3,$V32),o($VS3,$V42),o($VS3,$V52),o($VS3,$Vf4),o($VS3,$Vg4),o($VS3,$Vh4),o($VS3,$Vi4),o($VS3,$Vj4,{208:3618,209:3619,117:[1,3620]}),o($VS3,$Vk4),o($VS3,$Vl4),o($VS3,$Vm4),o($VS3,$Vn4),o($VS3,$Vo4),o($VS3,$Vp4),o($VS3,$Vq4),o($VS3,$Vr4),o($VS3,$Vs4),o($V88,$Vp3),o($V88,$Vq3),o($V88,$Vr3),o($V88,$Vs3),{199:[1,3623],200:3621,201:[1,3622]},o($VT3,$Vs6),o($VT3,$Vt6),o($VT3,$Vu6),o($VT3,$V22),o($VT3,$V32),o($VT3,$V42),o($VT3,$V52),o($VT3,$Vf4),o($VT3,$Vg4),o($VT3,$Vh4),o($VT3,$Vi4),o($VT3,$Vj4,{208:3624,209:3625,117:[1,3626]}),o($VT3,$Vk4),o($VT3,$Vl4),o($VT3,$Vm4),o($VT3,$Vn4),o($VT3,$Vo4),o($VT3,$Vp4),o($VT3,$Vq4),o($VT3,$Vr4),o($VT3,$Vs4),o($V98,$Vp3),o($V98,$Vq3),o($V98,$Vr3),o($V98,$Vs3),{20:[1,3629],22:[1,3631],93:3627,170:[1,3632],197:3628,221:[1,3630]},{199:[1,3635],200:3633,201:[1,3634]},o($VU3,$Vs6),o($VU3,$Vt6),o($VU3,$Vu6),o($VU3,$V22),o($VU3,$V32),o($VU3,$V42),o($VU3,$V52),o($VU3,$Vf4),o($VU3,$Vg4),o($VU3,$Vh4),o($VU3,$Vi4),o($VU3,$Vj4,{208:3636,209:3637,117:[1,3638]}),o($VU3,$Vk4),o($VU3,$Vl4),o($VU3,$Vm4),o($VU3,$Vn4),o($VU3,$Vo4),o($VU3,$Vp4),o($VU3,$Vq4),o($VU3,$Vr4),o($VU3,$Vs4),o($Va8,$Vp3),o($Va8,$Vq3),o($Va8,$Vr3),o($Va8,$Vs3),o($VH4,$VG9),o($Vr7,$V$3),o($VH4,$V04,{37:3639,199:[1,3640]}),{20:$V14,22:$V24,135:3641,170:$V34,197:682,205:$V44,221:$V54},o($Vz7,$VH9),o($VB7,$VC7,{66:3642}),o($VQ,$VR,{69:3643,79:3644,81:3645,82:3646,98:3649,100:3650,93:3652,94:3653,95:3654,84:3655,45:3656,101:3660,197:3661,97:3663,124:3664,105:3668,111:3674,113:3675,20:[1,3670],22:[1,3672],28:[1,3662],75:[1,3647],77:[1,3648],85:[1,3665],86:[1,3666],87:[1,3667],91:[1,3651],102:[1,3657],103:[1,3658],104:[1,3659],107:$VI9,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:[1,3673],221:[1,3671]}),o($VB7,$VJ9),o($VQ,$VR,{69:3676,79:3677,81:3678,82:3679,98:3682,100:3683,93:3685,94:3686,95:3687,84:3688,45:3689,101:3693,197:3694,97:3696,124:3697,105:3701,111:3707,113:3708,20:[1,3703],22:[1,3705],28:[1,3695],75:[1,3680],77:[1,3681],85:[1,3698],86:[1,3699],87:[1,3700],91:[1,3684],102:[1,3690],103:[1,3691],104:[1,3692],107:$VK9,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:[1,3706],221:[1,3704]}),o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:3709,127:$Vb3,154:$Vc3,194:$Vd3}),o($VB7,$VQ2),o($VB7,$VB),o($VB7,$VC),o($VB7,$Vo),o($VB7,$Vp),o($VB7,$VD),o($VB7,$Vq),o($VB7,$Vr),o($VB7,$VI2,{105:2667,101:3710,107:$Vm8,108:$V_,109:$V$,110:$V01}),o($V29,$VJ2),o($V29,$Vk3),o($VB7,$VL9),o($Vo8,$V74),o($Vq8,$V84),o($Vq8,$V94),o($Vq8,$Va4),{106:[1,3711]},o($Vq8,$V12),{106:[1,3713],112:3712,114:[1,3714],115:[1,3715],116:3716,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,3717]},o($Vq8,$Vc4),{127:[1,3718]},{20:[1,3721],22:[1,3723],93:3719,170:[1,3724],197:3720,221:[1,3722]},o($VH4,$VM9),o($V49,$VC1,{88:3725}),o($V49,$Vc8),o($V49,$Vd8),o($V49,$Ve8),o($V49,$Vf8),o($V49,$Vg8),o($V99,$Vh8,{63:3726,57:[1,3727]}),o($Va9,$Vi8,{67:3728,59:[1,3729]}),o($Vb9,$Vj8),o($Vb9,$Vk8,{80:3730,82:3731,84:3732,45:3733,124:3734,85:[1,3735],86:[1,3736],87:[1,3737],125:$VR,131:$VR,133:$VR,194:$VR,233:$VR}),o($Vb9,$Vl8),o($Vb9,$V76,{83:3738,79:3739,98:3740,100:3741,101:3745,105:3746,102:[1,3742],103:[1,3743],104:[1,3744],107:$VN9,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:3748,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($Vb9,$Vn8),o($VO9,$VI1,{99:3749}),o($VP9,$VJ1,{105:3244,101:3750,107:$Vc9,108:$V_,109:$V$,110:$V01}),o($VQ9,$VL1,{92:3751}),o($VQ9,$VL1,{92:3752}),o($VQ9,$VL1,{92:3753}),o($Vb9,$VM1,{111:3250,113:3251,97:3754,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VR9,$Vd6),o($VR9,$Ve6),o($VO9,$VQ1),o($VO9,$VR1),o($VO9,$VS1),o($VO9,$VT1),o($VQ9,$VU1),o($VV1,$VW1,{167:3755}),o($VS9,$VY1),{125:[1,3756],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VR9,$VO1),o($VR9,$VP1),{20:[1,3760],22:[1,3764],23:3758,39:3757,206:3759,220:3761,221:[1,3763],222:[1,3762]},{106:[1,3765]},o($VO9,$V12),o($VQ9,$V22),o($VQ9,$V32),o($VQ9,$V42),o($VQ9,$V52),{106:[1,3767],112:3766,114:[1,3768],115:[1,3769],116:3770,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,3771]},o($V49,$VC1,{88:3772}),o($VK4,$VE7),o($VQ,$VR,{98:762,100:763,101:773,105:781,232:3773,79:3774,81:3775,82:3776,93:3780,94:3781,95:3782,84:3783,45:3784,197:3785,97:3787,124:3788,111:3796,113:3797,20:[1,3792],22:[1,3794],28:[1,3786],75:[1,3777],77:[1,3778],85:[1,3789],86:[1,3790],87:[1,3791],91:[1,3779],102:$VM4,103:$VN4,104:$VO4,107:$VP4,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:[1,3795],221:[1,3793]}),o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:3798,127:$Vb3,154:$Vc3,194:$Vd3}),o($VK4,$VQ2),o($VK4,$VB),o($VK4,$VC),o($VK4,$Vo),o($VK4,$Vp),o($VK4,$VD),o($VK4,$Vq),o($VK4,$Vr),o($VK4,$VI2,{105:2717,101:3799,107:$Vt8,108:$V_,109:$V$,110:$V01}),o($VS6,$VJ2),o($VS6,$Vk3),o($VK4,$VF7),o($Vb6,$V84),o($Vb6,$V94),o($Vb6,$Va4),{106:[1,3800]},o($Vb6,$V12),{106:[1,3802],112:3801,114:[1,3803],115:[1,3804],116:3805,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,3806]},o($Vb6,$Vc4),{127:[1,3807]},{20:[1,3810],22:[1,3812],93:3808,170:[1,3813],197:3809,221:[1,3811]},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:3814,127:$Vb3,154:$Vc3,194:$Vd3}),o($VK4,$VQ2),o($VK4,$VB),o($VK4,$VC),o($VK4,$Vo),o($VK4,$Vp),o($VK4,$VD),o($VK4,$Vq),o($VK4,$Vr),o($VK4,$VI2,{105:2755,101:3815,107:$Vu8,108:$V_,109:$V$,110:$V01}),o($VS6,$VJ2),o($VS6,$Vk3),o($VK4,$VF7),o($Vb6,$V84),o($Vb6,$V94),o($Vb6,$Va4),{106:[1,3816]},o($Vb6,$V12),{106:[1,3818],112:3817,114:[1,3819],115:[1,3820],116:3821,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,3822]},o($Vb6,$Vc4),{127:[1,3823]},{20:[1,3826],22:[1,3828],93:3824,170:[1,3829],197:3825,221:[1,3827]},o($Vb6,$Vg6),o($Vb6,$VU1),o($Vb6,$V22),o($Vb6,$V32),o($Vb6,$V42),o($Vb6,$V52),o($VO,$Vs2),o($VO,$Vt2),o($VO,$VF1),o($VO,$VG1),o($VD1,$VC1,{88:3830}),o($VO,$VO1),o($VO,$VP1),{20:[1,3834],22:[1,3838],23:3832,39:3831,206:3833,220:3835,221:[1,3837],222:[1,3836]},{125:[1,3839],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VO,$Vu2),o($VO,$Vv2),o($VD1,$VC1,{88:3840}),o($Vw2,$VI1,{99:3841}),o($VD1,$VJ1,{105:3325,101:3842,107:$Vf9,108:$V_,109:$V$,110:$V01}),o($Vw2,$VQ1),o($Vw2,$VR1),o($Vw2,$VS1),o($Vw2,$VT1),{106:[1,3843]},o($Vw2,$V12),{76:[1,3844]},o($VE2,$VF2,{89:3845,90:3846,198:3847,195:[1,3848]}),o($VG2,$VF2,{89:3849,90:3850,198:3851,195:$VT9}),o($VB1,$VI2,{105:2810,101:3853,107:$Vv8,108:$V_,109:$V$,110:$V01}),o($VH1,$VJ2),o($VD1,$VK2,{96:3854,101:3855,97:3856,105:3857,111:3859,113:3860,107:$VU9,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VD1,$VM2,{96:3854,101:3855,97:3856,105:3857,111:3859,113:3860,107:$VU9,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VD1,$VN2,{96:3854,101:3855,97:3856,105:3857,111:3859,113:3860,107:$VU9,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VX1,$VO2),o($VP2,$VF2,{89:3861,90:3862,198:3863,195:[1,3864]}),o($VE1,$VQ2),o($VE1,$VB),o($VE1,$VC),o($VE1,$Vo),o($VE1,$Vp),o($VE1,$VD),o($VE1,$Vq),o($VE1,$Vr),{20:$VR2,22:$VS2,23:404,29:[1,3865],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:3866,127:$Vb3,154:$Vc3,194:$Vd3}),o($VH1,$Vk3),o($VX1,$Vl3),o($VX1,$Vm3),o($VX1,$Vn3),o($VX1,$Vo3),{117:[1,3867]},o($VX1,$Vt3),o($VD1,$VN5),{199:[1,3870],200:3868,201:[1,3869]},o($VB1,$Vs6),o($VB1,$Vt6),o($VB1,$Vu6),o($VB1,$V22),o($VB1,$V32),o($VB1,$V42),o($VB1,$V52),o($VB1,$Vf4),o($VB1,$Vg4),o($VB1,$Vh4),o($VB1,$Vi4),o($VB1,$Vj4,{208:3871,209:3872,117:[1,3873]}),o($VB1,$Vk4),o($VB1,$Vl4),o($VB1,$Vm4),o($VB1,$Vn4),o($VB1,$Vo4),o($VB1,$Vp4),o($VB1,$Vq4),o($VB1,$Vr4),o($VB1,$Vs4),o($Vv6,$Vp3),o($Vv6,$Vq3),o($Vv6,$Vr3),o($Vv6,$Vs3),{199:[1,3876],200:3874,201:[1,3875]},o($VD1,$Vs6),o($VD1,$Vt6),o($VD1,$Vu6),o($VD1,$V22),o($VD1,$V32),o($VD1,$V42),o($VD1,$V52),o($VD1,$Vf4),o($VD1,$Vg4),o($VD1,$Vh4),o($VD1,$Vi4),o($VD1,$Vj4,{208:3877,209:3878,117:[1,3879]}),o($VD1,$Vk4),o($VD1,$Vl4),o($VD1,$Vm4),o($VD1,$Vn4),o($VD1,$Vo4),o($VD1,$Vp4),o($VD1,$Vq4),o($VD1,$Vr4),o($VD1,$Vs4),o($Vw6,$Vp3),o($Vw6,$Vq3),o($Vw6,$Vr3),o($Vw6,$Vs3),{20:[1,3882],22:[1,3884],93:3880,170:[1,3885],197:3881,221:[1,3883]},{199:[1,3888],200:3886,201:[1,3887]},o($VN1,$Vs6),o($VN1,$Vt6),o($VN1,$Vu6),o($VN1,$V22),o($VN1,$V32),o($VN1,$V42),o($VN1,$V52),o($VN1,$Vf4),o($VN1,$Vg4),o($VN1,$Vh4),o($VN1,$Vi4),o($VN1,$Vj4,{208:3889,209:3890,117:[1,3891]}),o($VN1,$Vk4),o($VN1,$Vl4),o($VN1,$Vm4),o($VN1,$Vn4),o($VN1,$Vo4),o($VN1,$Vp4),o($VN1,$Vq4),o($VN1,$Vr4),o($VN1,$Vs4),o($Vx6,$Vp3),o($Vx6,$Vq3),o($Vx6,$Vr3),o($Vx6,$Vs3),o($VD1,$VN5),{199:[1,3894],200:3892,201:[1,3893]},o($VB1,$Vs6),o($VB1,$Vt6),o($VB1,$Vu6),o($VB1,$V22),o($VB1,$V32),o($VB1,$V42),o($VB1,$V52),o($VB1,$Vf4),o($VB1,$Vg4),o($VB1,$Vh4),o($VB1,$Vi4),o($VB1,$Vj4,{208:3895,209:3896,117:[1,3897]}),o($VB1,$Vk4),o($VB1,$Vl4),o($VB1,$Vm4),o($VB1,$Vn4),o($VB1,$Vo4),o($VB1,$Vp4),o($VB1,$Vq4),o($VB1,$Vr4),o($VB1,$Vs4),o($Vv6,$Vp3),o($Vv6,$Vq3),o($Vv6,$Vr3),o($Vv6,$Vs3),{199:[1,3900],200:3898,201:[1,3899]},o($VD1,$Vs6),o($VD1,$Vt6),o($VD1,$Vu6),o($VD1,$V22),o($VD1,$V32),o($VD1,$V42),o($VD1,$V52),o($VD1,$Vf4),o($VD1,$Vg4),o($VD1,$Vh4),o($VD1,$Vi4),o($VD1,$Vj4,{208:3901,209:3902,117:[1,3903]}),o($VD1,$Vk4),o($VD1,$Vl4),o($VD1,$Vm4),o($VD1,$Vn4),o($VD1,$Vo4),o($VD1,$Vp4),o($VD1,$Vq4),o($VD1,$Vr4),o($VD1,$Vs4),o($Vw6,$Vp3),o($Vw6,$Vq3),o($Vw6,$Vr3),o($Vw6,$Vs3),{20:[1,3906],22:[1,3908],93:3904,170:[1,3909],197:3905,221:[1,3907]},{199:[1,3912],200:3910,201:[1,3911]},o($VN1,$Vs6),o($VN1,$Vt6),o($VN1,$Vu6),o($VN1,$V22),o($VN1,$V32),o($VN1,$V42),o($VN1,$V52),o($VN1,$Vf4),o($VN1,$Vg4),o($VN1,$Vh4),o($VN1,$Vi4),o($VN1,$Vj4,{208:3913,209:3914,117:[1,3915]}),o($VN1,$Vk4),o($VN1,$Vl4),o($VN1,$Vm4),o($VN1,$Vn4),o($VN1,$Vo4),o($VN1,$Vp4),o($VN1,$Vq4),o($VN1,$Vr4),o($VN1,$Vs4),o($Vx6,$Vp3),o($Vx6,$Vq3),o($Vx6,$Vr3),o($Vx6,$Vs3),o($VO,$Vb4),{127:[1,3916]},o($VO,$V_3),o($Vw2,$V74),o($VE2,$Vc5),{20:$Vj,22:$Vk,23:3917,220:50,221:$Vl},{20:$VV9,22:$VW9,106:[1,3930],114:[1,3931],115:[1,3932],116:3929,170:$VX9,186:3920,196:3918,197:3919,202:3925,203:3926,204:3927,207:3928,210:[1,3933],211:[1,3934],212:[1,3939],213:[1,3940],214:[1,3941],215:[1,3942],216:[1,3935],217:[1,3936],218:[1,3937],219:[1,3938],221:$VY9},o($VG2,$Vc5),{20:$Vj,22:$Vk,23:3943,220:50,221:$Vl},{20:$VZ9,22:$V_9,106:[1,3956],114:[1,3957],115:[1,3958],116:3955,170:$V$9,186:3946,196:3944,197:3945,202:3951,203:3952,204:3953,207:3954,210:[1,3959],211:[1,3960],212:[1,3965],213:[1,3966],214:[1,3967],215:[1,3968],216:[1,3961],217:[1,3962],218:[1,3963],219:[1,3964],221:$V0a},o($VK1,$Vk3),o($VK1,$Vl3),o($VK1,$Vm3),o($VK1,$Vn3),o($VK1,$Vo3),{117:[1,3969]},o($VK1,$Vt3),o($VP2,$Vc5),{20:$Vj,22:$Vk,23:3970,220:50,221:$Vl},{20:$V1a,22:$V2a,106:[1,3983],114:[1,3984],115:[1,3985],116:3982,170:$V3a,186:3973,196:3971,197:3972,202:3978,203:3979,204:3980,207:3981,210:[1,3986],211:[1,3987],212:[1,3992],213:[1,3993],214:[1,3994],215:[1,3995],216:[1,3988],217:[1,3989],218:[1,3990],219:[1,3991],221:$V4a},o($VN1,$VN5),o($VX1,$Vg6),o($VX1,$VU1),o($VX1,$V22),o($VX1,$V32),o($VX1,$V42),o($VX1,$V52),o($VB1,$VC6),o($VB1,$VU1),o($VD1,$VC6),o($VD1,$VU1),o($VN1,$VC6),o($VN1,$VU1),o($VB1,$VC6),o($VB1,$VU1),o($VD1,$VC6),o($VD1,$VU1),o($VN1,$VC6),o($VN1,$VU1),o($V65,$VF2,{90:3573,198:3574,89:3996,195:$VE9}),o($VQ3,$VQ2),o($VQ3,$VB),o($VQ3,$VC),o($VQ3,$Vo),o($VQ3,$Vp),o($VQ3,$VD),o($VQ3,$Vq),o($VQ3,$Vr),o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:3997,127:$Vb3,154:$Vc3,194:$Vd3}),o($V65,$VF2,{90:3573,198:3574,89:3998,195:$VE9}),o($VT3,$VI2,{105:2988,101:3999,107:$Vy8,108:$V_,109:$V$,110:$V01}),o($V45,$VJ2),o($V45,$Vk3),o($VQ3,$VP3),o($Vo6,$V_3),o($VS3,$V$3),o($Vo6,$V04,{37:4000,199:[1,4001]}),{20:$V14,22:$V24,135:4002,170:$V34,197:682,205:$V44,221:$V54},o($VQ3,$V64),o($VT3,$V$3),o($VQ3,$V04,{37:4003,199:[1,4004]}),{20:$V14,22:$V24,135:4005,170:$V34,197:682,205:$V44,221:$V54},o($VV3,$V74),o($VW3,$V84),o($VW3,$V94),o($VW3,$Va4),{106:[1,4006]},o($VW3,$V12),{106:[1,4008],112:4007,114:[1,4009],115:[1,4010],116:4011,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,4012]},o($Vp6,$Vb4),o($VU3,$V$3),o($Vp6,$V04,{37:4013,199:[1,4014]}),{20:$V14,22:$V24,135:4015,170:$V34,197:682,205:$V44,221:$V54},o($VW3,$Vc4),{127:[1,4016]},{20:[1,4019],22:[1,4021],93:4017,170:[1,4022],197:4018,221:[1,4020]},o($V55,$Vd1),o($V55,$Ve1),o($V55,$Vf1),o($VS3,$VL5),o($VS3,$VM5),{20:$Vz8,22:$VA8,93:4023,170:$VB8,197:4024,221:$VC8},o($V65,$Vd1),o($V65,$Ve1),o($V65,$Vf1),o($VT3,$VL5),o($VT3,$VM5),{20:$VD8,22:$VE8,93:4025,170:$VF8,197:4026,221:$VG8},o($VW3,$Vg6),o($VW3,$VU1),o($VW3,$V22),o($VW3,$V32),o($VW3,$V42),o($VW3,$V52),o($V85,$Vd1),o($V85,$Ve1),o($V85,$Vf1),o($VU3,$VL5),o($VU3,$VM5),{20:$VH8,22:$VI8,93:4027,170:$VJ8,197:4028,221:$VK8},o($V55,$Vd1),o($V55,$Ve1),o($V55,$Vf1),o($VS3,$VL5),o($VS3,$VM5),{20:$VL8,22:$VM8,93:4029,170:$VN8,197:4030,221:$VO8},o($V65,$Vd1),o($V65,$Ve1),o($V65,$Vf1),o($VT3,$VL5),o($VT3,$VM5),{20:$VP8,22:$VQ8,93:4031,170:$VR8,197:4032,221:$VS8},o($VW3,$Vg6),o($VW3,$VU1),o($VW3,$V22),o($VW3,$V32),o($VW3,$V42),o($VW3,$V52),o($V85,$Vd1),o($V85,$Ve1),o($V85,$Vf1),o($VU3,$VL5),o($VU3,$VM5),{20:$VT8,22:$VU8,93:4033,170:$VV8,197:4034,221:$VW8},o($VX8,$Vc5),{20:$Vj,22:$Vk,23:4035,220:50,221:$Vl},{20:$V5a,22:$V6a,106:[1,4048],114:[1,4049],115:[1,4050],116:4047,170:$V7a,186:4038,196:4036,197:4037,202:4043,203:4044,204:4045,207:4046,210:[1,4051],211:[1,4052],212:[1,4057],213:[1,4058],214:[1,4059],215:[1,4060],216:[1,4053],217:[1,4054],218:[1,4055],219:[1,4056],221:$V8a},o($Vz7,$Vi8,{67:4061,59:[1,4062]}),o($VB7,$Vj8),o($VB7,$Vk8,{80:4063,82:4064,84:4065,45:4066,124:4067,85:[1,4068],86:[1,4069],87:[1,4070],125:$VR,131:$VR,133:$VR,194:$VR,233:$VR}),o($VB7,$Vl8),o($VB7,$V76,{83:4071,79:4072,98:4073,100:4074,101:4078,105:4079,102:[1,4075],103:[1,4076],104:[1,4077],107:$V9a,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:4081,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($VB7,$Vn8),o($Vo8,$VI1,{99:4082}),o($Vp8,$VJ1,{105:3668,101:4083,107:$VI9,108:$V_,109:$V$,110:$V01}),o($Vq8,$VL1,{92:4084}),o($Vq8,$VL1,{92:4085}),o($Vq8,$VL1,{92:4086}),o($VB7,$VM1,{111:3674,113:3675,97:4087,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vr8,$Vd6),o($Vr8,$Ve6),o($Vo8,$VQ1),o($Vo8,$VR1),o($Vo8,$VS1),o($Vo8,$VT1),o($Vq8,$VU1),o($VV1,$VW1,{167:4088}),o($Vs8,$VY1),{125:[1,4089],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($Vr8,$VO1),o($Vr8,$VP1),{20:[1,4093],22:[1,4097],23:4091,39:4090,206:4092,220:4094,221:[1,4096],222:[1,4095]},{106:[1,4098]},o($Vo8,$V12),o($Vq8,$V22),o($Vq8,$V32),o($Vq8,$V42),o($Vq8,$V52),{106:[1,4100],112:4099,114:[1,4101],115:[1,4102],116:4103,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,4104]},o($VB7,$Vj8),o($VB7,$Vk8,{80:4105,82:4106,84:4107,45:4108,124:4109,85:[1,4110],86:[1,4111],87:[1,4112],125:$VR,131:$VR,133:$VR,194:$VR,233:$VR}),o($VB7,$Vl8),o($VB7,$V76,{83:4113,79:4114,98:4115,100:4116,101:4120,105:4121,102:[1,4117],103:[1,4118],104:[1,4119],107:$Vaa,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:4123,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($VB7,$Vn8),o($Vo8,$VI1,{99:4124}),o($Vp8,$VJ1,{105:3701,101:4125,107:$VK9,108:$V_,109:$V$,110:$V01}),o($Vq8,$VL1,{92:4126}),o($Vq8,$VL1,{92:4127}),o($Vq8,$VL1,{92:4128}),o($VB7,$VM1,{111:3707,113:3708,97:4129,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vr8,$Vd6),o($Vr8,$Ve6),o($Vo8,$VQ1),o($Vo8,$VR1),o($Vo8,$VS1),o($Vo8,$VT1),o($Vq8,$VU1),o($VV1,$VW1,{167:4130}),o($Vs8,$VY1),{125:[1,4131],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($Vr8,$VO1),o($Vr8,$VP1),{20:[1,4135],22:[1,4139],23:4133,39:4132,206:4134,220:4136,221:[1,4138],222:[1,4137]},{106:[1,4140]},o($Vo8,$V12),o($Vq8,$V22),o($Vq8,$V32),o($Vq8,$V42),o($Vq8,$V52),{106:[1,4142],112:4141,114:[1,4143],115:[1,4144],116:4145,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,4146]},{127:[1,4147]},o($V29,$V74),o($Vq8,$Vk3),o($Vq8,$Vl3),o($Vq8,$Vm3),o($Vq8,$Vn3),o($Vq8,$Vo3),{117:[1,4148]},o($Vq8,$Vt3),o($Vr8,$VN5),o($Vs8,$Vg6),o($Vs8,$VU1),o($Vs8,$V22),o($Vs8,$V32),o($Vs8,$V42),o($Vs8,$V52),o($Vba,$VF2,{89:4149,90:4150,198:4151,195:$Vca}),o($Va9,$VZ8),o($Vw,$Vx,{61:4153,65:4154,47:4155,50:$Vy}),o($Vb9,$V_8),o($Vw,$Vx,{65:4156,47:4157,50:$Vy}),o($Vb9,$V$8),o($Vb9,$V09),o($Vb9,$Vd6),o($Vb9,$Ve6),{125:[1,4158],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($Vb9,$VO1),o($Vb9,$VP1),{20:[1,4162],22:[1,4166],23:4160,39:4159,206:4161,220:4163,221:[1,4165],222:[1,4164]},o($Vb9,$V19),o($Vb9,$VR6),o($Vda,$VI1,{99:4167}),o($Vb9,$VJ1,{105:3746,101:4168,107:$VN9,108:$V_,109:$V$,110:$V01}),o($Vda,$VQ1),o($Vda,$VR1),o($Vda,$VS1),o($Vda,$VT1),{106:[1,4169]},o($Vda,$V12),{76:[1,4170]},o($VP9,$VI2,{105:3244,101:4171,107:$Vc9,108:$V_,109:$V$,110:$V01}),o($VO9,$VJ2),o($Vb9,$VK2,{96:4172,101:4173,97:4174,105:4175,111:4177,113:4178,107:$Vea,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vb9,$VM2,{96:4172,101:4173,97:4174,105:4175,111:4177,113:4178,107:$Vea,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vb9,$VN2,{96:4172,101:4173,97:4174,105:4175,111:4177,113:4178,107:$Vea,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VS9,$VO2),{20:$VR2,22:$VS2,23:404,29:[1,4179],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:4180,127:$Vb3,154:$Vc3,194:$Vd3}),o($VR9,$VQ2),o($VR9,$VB),o($VR9,$VC),o($VR9,$Vo),o($VR9,$Vp),o($VR9,$VD),o($VR9,$Vq),o($VR9,$Vr),o($VO9,$Vk3),o($VS9,$Vl3),o($VS9,$Vm3),o($VS9,$Vn3),o($VS9,$Vo3),{117:[1,4181]},o($VS9,$Vt3),o($Vba,$VF2,{90:4150,198:4151,89:4182,195:$Vca}),o($VK4,$V56),o($VQ,$VR,{82:4183,84:4184,45:4185,124:4186,85:[1,4187],86:[1,4188],87:[1,4189]}),o($VK4,$V66),o($VK4,$V76,{83:4190,79:4191,98:4192,100:4193,101:4197,105:4198,102:[1,4194],103:[1,4195],104:[1,4196],107:$Vfa,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:4200,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($VK4,$V96),o($Vb6,$VL1,{92:4201}),o($Vb6,$VL1,{92:4202}),o($Vb6,$VL1,{92:4203}),o($VK4,$VM1,{111:3796,113:3797,97:4204,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vc6,$Vd6),o($Vc6,$Ve6),o($Vb6,$VU1),o($VV1,$VW1,{167:4205}),o($Vf6,$VY1),{125:[1,4206],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($Vc6,$VO1),o($Vc6,$VP1),{20:[1,4210],22:[1,4214],23:4208,39:4207,206:4209,220:4211,221:[1,4213],222:[1,4212]},o($Vb6,$V22),o($Vb6,$V32),o($Vb6,$V42),o($Vb6,$V52),{106:[1,4216],112:4215,114:[1,4217],115:[1,4218],116:4219,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,4220]},{127:[1,4221]},o($VS6,$V74),o($Vb6,$Vk3),o($Vb6,$Vl3),o($Vb6,$Vm3),o($Vb6,$Vn3),o($Vb6,$Vo3),{117:[1,4222]},o($Vb6,$Vt3),o($Vc6,$VN5),o($Vf6,$Vg6),o($Vf6,$VU1),o($Vf6,$V22),o($Vf6,$V32),o($Vf6,$V42),o($Vf6,$V52),{127:[1,4223]},o($VS6,$V74),o($Vb6,$Vk3),o($Vb6,$Vl3),o($Vb6,$Vm3),o($Vb6,$Vn3),o($Vb6,$Vo3),{117:[1,4224]},o($Vb6,$Vt3),o($Vc6,$VN5),o($Vf6,$Vg6),o($Vf6,$VU1),o($Vf6,$V22),o($Vf6,$V32),o($Vf6,$V42),o($Vf6,$V52),o($VG2,$VF2,{90:3850,198:3851,89:4225,195:$VT9}),o($VO,$VQ2),o($VO,$VB),o($VO,$VC),o($VO,$Vo),o($VO,$Vp),o($VO,$VD),o($VO,$Vq),o($VO,$Vr),o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:4226,127:$Vb3,154:$Vc3,194:$Vd3}),o($VG2,$VF2,{90:3850,198:3851,89:4227,195:$VT9}),o($VD1,$VI2,{105:3325,101:4228,107:$Vf9,108:$V_,109:$V$,110:$V01}),o($Vw2,$VJ2),o($Vw2,$Vk3),o($VO,$VP3),o($VZ3,$V_3),o($VB1,$V$3),o($VZ3,$V04,{37:4229,199:[1,4230]}),{20:$V14,22:$V24,135:4231,170:$V34,197:682,205:$V44,221:$V54},o($VO,$V64),o($VD1,$V$3),o($VO,$V04,{37:4232,199:[1,4233]}),{20:$V14,22:$V24,135:4234,170:$V34,197:682,205:$V44,221:$V54},o($VH1,$V74),o($VK1,$V84),o($VK1,$V94),o($VK1,$Va4),{106:[1,4235]},o($VK1,$V12),{106:[1,4237],112:4236,114:[1,4238],115:[1,4239],116:4240,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,4241]},o($VE1,$Vb4),o($VN1,$V$3),o($VE1,$V04,{37:4242,199:[1,4243]}),{20:$V14,22:$V24,135:4244,170:$V34,197:682,205:$V44,221:$V54},o($VK1,$Vc4),{127:[1,4245]},{20:[1,4248],22:[1,4250],93:4246,170:[1,4251],197:4247,221:[1,4249]},o($VE2,$Vd1),o($VE2,$Ve1),o($VE2,$Vf1),o($VB1,$VL5),o($VB1,$VM5),{20:$Vg9,22:$Vh9,93:4252,170:$Vi9,197:4253,221:$Vj9},o($VG2,$Vd1),o($VG2,$Ve1),o($VG2,$Vf1),o($VD1,$VL5),o($VD1,$VM5),{20:$Vk9,22:$Vl9,93:4254,170:$Vm9,197:4255,221:$Vn9},o($VK1,$Vg6),o($VK1,$VU1),o($VK1,$V22),o($VK1,$V32),o($VK1,$V42),o($VK1,$V52),o($VP2,$Vd1),o($VP2,$Ve1),o($VP2,$Vf1),o($VN1,$VL5),o($VN1,$VM5),{20:$Vo9,22:$Vp9,93:4256,170:$Vq9,197:4257,221:$Vr9},o($VE2,$Vd1),o($VE2,$Ve1),o($VE2,$Vf1),o($VB1,$VL5),o($VB1,$VM5),{20:$Vs9,22:$Vt9,93:4258,170:$Vu9,197:4259,221:$Vv9},o($VG2,$Vd1),o($VG2,$Ve1),o($VG2,$Vf1),o($VD1,$VL5),o($VD1,$VM5),{20:$Vw9,22:$Vx9,93:4260,170:$Vy9,197:4261,221:$Vz9},o($VK1,$Vg6),o($VK1,$VU1),o($VK1,$V22),o($VK1,$V32),o($VK1,$V42),o($VK1,$V52),o($VP2,$Vd1),o($VP2,$Ve1),o($VP2,$Vf1),o($VN1,$VL5),o($VN1,$VM5),{20:$VA9,22:$VB9,93:4262,170:$VC9,197:4263,221:$VD9},o($VD1,$VN5),{199:[1,4266],200:4264,201:[1,4265]},o($VB1,$Vs6),o($VB1,$Vt6),o($VB1,$Vu6),o($VB1,$V22),o($VB1,$V32),o($VB1,$V42),o($VB1,$V52),o($VB1,$Vf4),o($VB1,$Vg4),o($VB1,$Vh4),o($VB1,$Vi4),o($VB1,$Vj4,{208:4267,209:4268,117:[1,4269]}),o($VB1,$Vk4),o($VB1,$Vl4),o($VB1,$Vm4),o($VB1,$Vn4),o($VB1,$Vo4),o($VB1,$Vp4),o($VB1,$Vq4),o($VB1,$Vr4),o($VB1,$Vs4),o($Vv6,$Vp3),o($Vv6,$Vq3),o($Vv6,$Vr3),o($Vv6,$Vs3),{199:[1,4272],200:4270,201:[1,4271]},o($VD1,$Vs6),o($VD1,$Vt6),o($VD1,$Vu6),o($VD1,$V22),o($VD1,$V32),o($VD1,$V42),o($VD1,$V52),o($VD1,$Vf4),o($VD1,$Vg4),o($VD1,$Vh4),o($VD1,$Vi4),o($VD1,$Vj4,{208:4273,209:4274,117:[1,4275]}),o($VD1,$Vk4),o($VD1,$Vl4),o($VD1,$Vm4),o($VD1,$Vn4),o($VD1,$Vo4),o($VD1,$Vp4),o($VD1,$Vq4),o($VD1,$Vr4),o($VD1,$Vs4),o($Vw6,$Vp3),o($Vw6,$Vq3),o($Vw6,$Vr3),o($Vw6,$Vs3),{20:[1,4278],22:[1,4280],93:4276,170:[1,4281],197:4277,221:[1,4279]},{199:[1,4284],200:4282,201:[1,4283]},o($VN1,$Vs6),o($VN1,$Vt6),o($VN1,$Vu6),o($VN1,$V22),o($VN1,$V32),o($VN1,$V42),o($VN1,$V52),o($VN1,$Vf4),o($VN1,$Vg4),o($VN1,$Vh4),o($VN1,$Vi4),o($VN1,$Vj4,{208:4285,209:4286,117:[1,4287]}),o($VN1,$Vk4),o($VN1,$Vl4),o($VN1,$Vm4),o($VN1,$Vn4),o($VN1,$Vo4),o($VN1,$Vp4),o($VN1,$Vq4),o($VN1,$Vr4),o($VN1,$Vs4),o($Vx6,$Vp3),o($Vx6,$Vq3),o($Vx6,$Vr3),o($Vx6,$Vs3),o($VQ3,$Vb4),{127:[1,4288]},o($VQ3,$V_3),o($V45,$V74),o($V55,$Vc5),{20:$Vj,22:$Vk,23:4289,220:50,221:$Vl},{20:$Vga,22:$Vha,106:[1,4302],114:[1,4303],115:[1,4304],116:4301,170:$Via,186:4292,196:4290,197:4291,202:4297,203:4298,204:4299,207:4300,210:[1,4305],211:[1,4306],212:[1,4311],213:[1,4312],214:[1,4313],215:[1,4314],216:[1,4307],217:[1,4308],218:[1,4309],219:[1,4310],221:$Vja},o($V65,$Vc5),{20:$Vj,22:$Vk,23:4315,220:50,221:$Vl},{20:$Vka,22:$Vla,106:[1,4328],114:[1,4329],115:[1,4330],116:4327,170:$Vma,186:4318,196:4316,197:4317,202:4323,203:4324,204:4325,207:4326,210:[1,4331],211:[1,4332],212:[1,4337],213:[1,4338],214:[1,4339],215:[1,4340],216:[1,4333],217:[1,4334],218:[1,4335],219:[1,4336],221:$Vna},o($VW3,$Vk3),o($VW3,$Vl3),o($VW3,$Vm3),o($VW3,$Vn3),o($VW3,$Vo3),{117:[1,4341]},o($VW3,$Vt3),o($V85,$Vc5),{20:$Vj,22:$Vk,23:4342,220:50,221:$Vl},{20:$Voa,22:$Vpa,106:[1,4355],114:[1,4356],115:[1,4357],116:4354,170:$Vqa,186:4345,196:4343,197:4344,202:4350,203:4351,204:4352,207:4353,210:[1,4358],211:[1,4359],212:[1,4364],213:[1,4365],214:[1,4366],215:[1,4367],216:[1,4360],217:[1,4361],218:[1,4362],219:[1,4363],221:$Vra},o($VU3,$VN5),o($VX3,$Vg6),o($VX3,$VU1),o($VX3,$V22),o($VX3,$V32),o($VX3,$V42),o($VX3,$V52),o($VS3,$VC6),o($VS3,$VU1),o($VT3,$VC6),o($VT3,$VU1),o($VU3,$VC6),o($VU3,$VU1),o($VS3,$VC6),o($VS3,$VU1),o($VT3,$VC6),o($VT3,$VU1),o($VU3,$VC6),o($VU3,$VU1),{199:[1,4370],200:4368,201:[1,4369]},o($Vr7,$Vs6),o($Vr7,$Vt6),o($Vr7,$Vu6),o($Vr7,$V22),o($Vr7,$V32),o($Vr7,$V42),o($Vr7,$V52),o($Vr7,$Vf4),o($Vr7,$Vg4),o($Vr7,$Vh4),o($Vr7,$Vi4),o($Vr7,$Vj4,{208:4371,209:4372,117:[1,4373]}),o($Vr7,$Vk4),o($Vr7,$Vl4),o($Vr7,$Vm4),o($Vr7,$Vn4),o($Vr7,$Vo4),o($Vr7,$Vp4),o($Vr7,$Vq4),o($Vr7,$Vr4),o($Vr7,$Vs4),o($Vsa,$Vp3),o($Vsa,$Vq3),o($Vsa,$Vr3),o($Vsa,$Vs3),o($VB7,$V_8),o($Vw,$Vx,{65:4374,47:4375,50:$Vy}),o($VB7,$V$8),o($VB7,$V09),o($VB7,$Vd6),o($VB7,$Ve6),{125:[1,4376],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VB7,$VO1),o($VB7,$VP1),{20:[1,4380],22:[1,4384],23:4378,39:4377,206:4379,220:4381,221:[1,4383],222:[1,4382]},o($VB7,$V19),o($VB7,$VR6),o($V29,$VI1,{99:4385}),o($VB7,$VJ1,{105:4079,101:4386,107:$V9a,108:$V_,109:$V$,110:$V01}),o($V29,$VQ1),o($V29,$VR1),o($V29,$VS1),o($V29,$VT1),{106:[1,4387]},o($V29,$V12),{76:[1,4388]},o($Vp8,$VI2,{105:3668,101:4389,107:$VI9,108:$V_,109:$V$,110:$V01}),o($Vo8,$VJ2),o($VB7,$VK2,{96:4390,101:4391,97:4392,105:4393,111:4395,113:4396,107:$Vta,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VB7,$VM2,{96:4390,101:4391,97:4392,105:4393,111:4395,113:4396,107:$Vta,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VB7,$VN2,{96:4390,101:4391,97:4392,105:4393,111:4395,113:4396,107:$Vta,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vs8,$VO2),{20:$VR2,22:$VS2,23:404,29:[1,4397],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:4398,127:$Vb3,154:$Vc3,194:$Vd3}),o($Vr8,$VQ2),o($Vr8,$VB),o($Vr8,$VC),o($Vr8,$Vo),o($Vr8,$Vp),o($Vr8,$VD),o($Vr8,$Vq),o($Vr8,$Vr),o($Vo8,$Vk3),o($Vs8,$Vl3),o($Vs8,$Vm3),o($Vs8,$Vn3),o($Vs8,$Vo3),{117:[1,4399]},o($Vs8,$Vt3),o($VB7,$V$8),o($VB7,$V09),o($VB7,$Vd6),o($VB7,$Ve6),{125:[1,4400],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VB7,$VO1),o($VB7,$VP1),{20:[1,4404],22:[1,4408],23:4402,39:4401,206:4403,220:4405,221:[1,4407],222:[1,4406]},o($VB7,$V19),o($VB7,$VR6),o($V29,$VI1,{99:4409}),o($VB7,$VJ1,{105:4121,101:4410,107:$Vaa,108:$V_,109:$V$,110:$V01}),o($V29,$VQ1),o($V29,$VR1),o($V29,$VS1),o($V29,$VT1),{106:[1,4411]},o($V29,$V12),{76:[1,4412]},o($Vp8,$VI2,{105:3701,101:4413,107:$VK9,108:$V_,109:$V$,110:$V01}),o($Vo8,$VJ2),o($VB7,$VK2,{96:4414,101:4415,97:4416,105:4417,111:4419,113:4420,107:$Vua,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VB7,$VM2,{96:4414,101:4415,97:4416,105:4417,111:4419,113:4420,107:$Vua,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VB7,$VN2,{96:4414,101:4415,97:4416,105:4417,111:4419,113:4420,107:$Vua,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vs8,$VO2),{20:$VR2,22:$VS2,23:404,29:[1,4421],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:4422,127:$Vb3,154:$Vc3,194:$Vd3}),o($Vr8,$VQ2),o($Vr8,$VB),o($Vr8,$VC),o($Vr8,$Vo),o($Vr8,$Vp),o($Vr8,$VD),o($Vr8,$Vq),o($Vr8,$Vr),o($Vo8,$Vk3),o($Vs8,$Vl3),o($Vs8,$Vm3),o($Vs8,$Vn3),o($Vs8,$Vo3),{117:[1,4423]},o($Vs8,$Vt3),o($VB7,$VN5),{20:[1,4426],22:[1,4428],93:4424,170:[1,4429],197:4425,221:[1,4427]},o($VN6,$VG9),o($V49,$V$3),o($VN6,$V04,{37:4430,199:[1,4431]}),{20:$V14,22:$V24,135:4432,170:$V34,197:682,205:$V44,221:$V54},o($Va9,$VH9),o($Vb9,$VC7,{66:4433}),o($VQ,$VR,{69:4434,79:4435,81:4436,82:4437,98:4440,100:4441,93:4443,94:4444,95:4445,84:4446,45:4447,101:4451,197:4452,97:4454,124:4455,105:4459,111:4465,113:4466,20:[1,4461],22:[1,4463],28:[1,4453],75:[1,4438],77:[1,4439],85:[1,4456],86:[1,4457],87:[1,4458],91:[1,4442],102:[1,4448],103:[1,4449],104:[1,4450],107:$Vva,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:[1,4464],221:[1,4462]}),o($Vb9,$VJ9),o($VQ,$VR,{69:4467,79:4468,81:4469,82:4470,98:4473,100:4474,93:4476,94:4477,95:4478,84:4479,45:4480,101:4484,197:4485,97:4487,124:4488,105:4492,111:4498,113:4499,20:[1,4494],22:[1,4496],28:[1,4486],75:[1,4471],77:[1,4472],85:[1,4489],86:[1,4490],87:[1,4491],91:[1,4475],102:[1,4481],103:[1,4482],104:[1,4483],107:$Vwa,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:[1,4497],221:[1,4495]}),o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:4500,127:$Vb3,154:$Vc3,194:$Vd3}),o($Vb9,$VQ2),o($Vb9,$VB),o($Vb9,$VC),o($Vb9,$Vo),o($Vb9,$Vp),o($Vb9,$VD),o($Vb9,$Vq),o($Vb9,$Vr),o($Vb9,$VI2,{105:3746,101:4501,107:$VN9,108:$V_,109:$V$,110:$V01}),o($Vda,$VJ2),o($Vda,$Vk3),o($Vb9,$VL9),o($VO9,$V74),o($VQ9,$V84),o($VQ9,$V94),o($VQ9,$Va4),{106:[1,4502]},o($VQ9,$V12),{106:[1,4504],112:4503,114:[1,4505],115:[1,4506],116:4507,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,4508]},o($VQ9,$Vc4),{127:[1,4509]},{20:[1,4512],22:[1,4514],93:4510,170:[1,4515],197:4511,221:[1,4513]},o($VN6,$VM9),o($VK4,$VP6),o($VK4,$Vd6),o($VK4,$Ve6),{125:[1,4516],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VK4,$VO1),o($VK4,$VP1),{20:[1,4520],22:[1,4524],23:4518,39:4517,206:4519,220:4521,221:[1,4523],222:[1,4522]},o($VK4,$VQ6),o($VK4,$VR6),o($VS6,$VI1,{99:4525}),o($VK4,$VJ1,{105:4198,101:4526,107:$Vfa,108:$V_,109:$V$,110:$V01}),o($VS6,$VQ1),o($VS6,$VR1),o($VS6,$VS1),o($VS6,$VT1),{106:[1,4527]},o($VS6,$V12),{76:[1,4528]},o($VK4,$VK2,{96:4529,101:4530,97:4531,105:4532,111:4534,113:4535,107:$Vxa,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VK4,$VM2,{96:4529,101:4530,97:4531,105:4532,111:4534,113:4535,107:$Vxa,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VK4,$VN2,{96:4529,101:4530,97:4531,105:4532,111:4534,113:4535,107:$Vxa,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vf6,$VO2),{20:$VR2,22:$VS2,23:404,29:[1,4536],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:4537,127:$Vb3,154:$Vc3,194:$Vd3}),o($Vc6,$VQ2),o($Vc6,$VB),o($Vc6,$VC),o($Vc6,$Vo),o($Vc6,$Vp),o($Vc6,$VD),o($Vc6,$Vq),o($Vc6,$Vr),o($Vf6,$Vl3),o($Vf6,$Vm3),o($Vf6,$Vn3),o($Vf6,$Vo3),{117:[1,4538]},o($Vf6,$Vt3),o($VK4,$VN5),{20:[1,4541],22:[1,4543],93:4539,170:[1,4544],197:4540,221:[1,4542]},o($VK4,$VN5),{20:[1,4547],22:[1,4549],93:4545,170:[1,4550],197:4546,221:[1,4548]},o($VO,$Vb4),{127:[1,4551]},o($VO,$V_3),o($Vw2,$V74),o($VE2,$Vc5),{20:$Vj,22:$Vk,23:4552,220:50,221:$Vl},{20:$Vya,22:$Vza,106:[1,4565],114:[1,4566],115:[1,4567],116:4564,170:$VAa,186:4555,196:4553,197:4554,202:4560,203:4561,204:4562,207:4563,210:[1,4568],211:[1,4569],212:[1,4574],213:[1,4575],214:[1,4576],215:[1,4577],216:[1,4570],217:[1,4571],218:[1,4572],219:[1,4573],221:$VBa},o($VG2,$Vc5),{20:$Vj,22:$Vk,23:4578,220:50,221:$Vl},{20:$VCa,22:$VDa,106:[1,4591],114:[1,4592],115:[1,4593],116:4590,170:$VEa,186:4581,196:4579,197:4580,202:4586,203:4587,204:4588,207:4589,210:[1,4594],211:[1,4595],212:[1,4600],213:[1,4601],214:[1,4602],215:[1,4603],216:[1,4596],217:[1,4597],218:[1,4598],219:[1,4599],221:$VFa},o($VK1,$Vk3),o($VK1,$Vl3),o($VK1,$Vm3),o($VK1,$Vn3),o($VK1,$Vo3),{117:[1,4604]},o($VK1,$Vt3),o($VP2,$Vc5),{20:$Vj,22:$Vk,23:4605,220:50,221:$Vl},{20:$VGa,22:$VHa,106:[1,4618],114:[1,4619],115:[1,4620],116:4617,170:$VIa,186:4608,196:4606,197:4607,202:4613,203:4614,204:4615,207:4616,210:[1,4621],211:[1,4622],212:[1,4627],213:[1,4628],214:[1,4629],215:[1,4630],216:[1,4623],217:[1,4624],218:[1,4625],219:[1,4626],221:$VJa},o($VN1,$VN5),o($VX1,$Vg6),o($VX1,$VU1),o($VX1,$V22),o($VX1,$V32),o($VX1,$V42),o($VX1,$V52),o($VB1,$VC6),o($VB1,$VU1),o($VD1,$VC6),o($VD1,$VU1),o($VN1,$VC6),o($VN1,$VU1),o($VB1,$VC6),o($VB1,$VU1),o($VD1,$VC6),o($VD1,$VU1),o($VN1,$VC6),o($VN1,$VU1),o($VE2,$Vd1),o($VE2,$Ve1),o($VE2,$Vf1),o($VB1,$VL5),o($VB1,$VM5),{20:$VV9,22:$VW9,93:4631,170:$VX9,197:4632,221:$VY9},o($VG2,$Vd1),o($VG2,$Ve1),o($VG2,$Vf1),o($VD1,$VL5),o($VD1,$VM5),{20:$VZ9,22:$V_9,93:4633,170:$V$9,197:4634,221:$V0a},o($VK1,$Vg6),o($VK1,$VU1),o($VK1,$V22),o($VK1,$V32),o($VK1,$V42),o($VK1,$V52),o($VP2,$Vd1),o($VP2,$Ve1),o($VP2,$Vf1),o($VN1,$VL5),o($VN1,$VM5),{20:$V1a,22:$V2a,93:4635,170:$V3a,197:4636,221:$V4a},o($VT3,$VN5),{199:[1,4639],200:4637,201:[1,4638]},o($VS3,$Vs6),o($VS3,$Vt6),o($VS3,$Vu6),o($VS3,$V22),o($VS3,$V32),o($VS3,$V42),o($VS3,$V52),o($VS3,$Vf4),o($VS3,$Vg4),o($VS3,$Vh4),o($VS3,$Vi4),o($VS3,$Vj4,{208:4640,209:4641,117:[1,4642]}),o($VS3,$Vk4),o($VS3,$Vl4),o($VS3,$Vm4),o($VS3,$Vn4),o($VS3,$Vo4),o($VS3,$Vp4),o($VS3,$Vq4),o($VS3,$Vr4),o($VS3,$Vs4),o($V88,$Vp3),o($V88,$Vq3),o($V88,$Vr3),o($V88,$Vs3),{199:[1,4645],200:4643,201:[1,4644]},o($VT3,$Vs6),o($VT3,$Vt6),o($VT3,$Vu6),o($VT3,$V22),o($VT3,$V32),o($VT3,$V42),o($VT3,$V52),o($VT3,$Vf4),o($VT3,$Vg4),o($VT3,$Vh4),o($VT3,$Vi4),o($VT3,$Vj4,{208:4646,209:4647,117:[1,4648]}),o($VT3,$Vk4),o($VT3,$Vl4),o($VT3,$Vm4),o($VT3,$Vn4),o($VT3,$Vo4),o($VT3,$Vp4),o($VT3,$Vq4),o($VT3,$Vr4),o($VT3,$Vs4),o($V98,$Vp3),o($V98,$Vq3),o($V98,$Vr3),o($V98,$Vs3),{20:[1,4651],22:[1,4653],93:4649,170:[1,4654],197:4650,221:[1,4652]},{199:[1,4657],200:4655,201:[1,4656]},o($VU3,$Vs6),o($VU3,$Vt6),o($VU3,$Vu6),o($VU3,$V22),o($VU3,$V32),o($VU3,$V42),o($VU3,$V52),o($VU3,$Vf4),o($VU3,$Vg4),o($VU3,$Vh4),o($VU3,$Vi4),o($VU3,$Vj4,{208:4658,209:4659,117:[1,4660]}),o($VU3,$Vk4),o($VU3,$Vl4),o($VU3,$Vm4),o($VU3,$Vn4),o($VU3,$Vo4),o($VU3,$Vp4),o($VU3,$Vq4),o($VU3,$Vr4),o($VU3,$Vs4),o($Va8,$Vp3),o($Va8,$Vq3),o($Va8,$Vr3),o($Va8,$Vs3),o($VX8,$Vd1),o($VX8,$Ve1),o($VX8,$Vf1),o($Vr7,$VL5),o($Vr7,$VM5),{20:$V5a,22:$V6a,93:4661,170:$V7a,197:4662,221:$V8a},o($VB7,$VJ9),o($VQ,$VR,{69:4663,79:4664,81:4665,82:4666,98:4669,100:4670,93:4672,94:4673,95:4674,84:4675,45:4676,101:4680,197:4681,97:4683,124:4684,105:4688,111:4694,113:4695,20:[1,4690],22:[1,4692],28:[1,4682],75:[1,4667],77:[1,4668],85:[1,4685],86:[1,4686],87:[1,4687],91:[1,4671],102:[1,4677],103:[1,4678],104:[1,4679],107:$VKa,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:[1,4693],221:[1,4691]}),o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:4696,127:$Vb3,154:$Vc3,194:$Vd3}),o($VB7,$VQ2),o($VB7,$VB),o($VB7,$VC),o($VB7,$Vo),o($VB7,$Vp),o($VB7,$VD),o($VB7,$Vq),o($VB7,$Vr),o($VB7,$VI2,{105:4079,101:4697,107:$V9a,108:$V_,109:$V$,110:$V01}),o($V29,$VJ2),o($V29,$Vk3),o($VB7,$VL9),o($Vo8,$V74),o($Vq8,$V84),o($Vq8,$V94),o($Vq8,$Va4),{106:[1,4698]},o($Vq8,$V12),{106:[1,4700],112:4699,114:[1,4701],115:[1,4702],116:4703,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,4704]},o($Vq8,$Vc4),{127:[1,4705]},{20:[1,4708],22:[1,4710],93:4706,170:[1,4711],197:4707,221:[1,4709]},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:4712,127:$Vb3,154:$Vc3,194:$Vd3}),o($VB7,$VQ2),o($VB7,$VB),o($VB7,$VC),o($VB7,$Vo),o($VB7,$Vp),o($VB7,$VD),o($VB7,$Vq),o($VB7,$Vr),o($VB7,$VI2,{105:4121,101:4713,107:$Vaa,108:$V_,109:$V$,110:$V01}),o($V29,$VJ2),o($V29,$Vk3),o($VB7,$VL9),o($Vo8,$V74),o($Vq8,$V84),o($Vq8,$V94),o($Vq8,$Va4),{106:[1,4714]},o($Vq8,$V12),{106:[1,4716],112:4715,114:[1,4717],115:[1,4718],116:4719,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,4720]},o($Vq8,$Vc4),{127:[1,4721]},{20:[1,4724],22:[1,4726],93:4722,170:[1,4727],197:4723,221:[1,4725]},o($Vq8,$Vg6),o($Vq8,$VU1),o($Vq8,$V22),o($Vq8,$V32),o($Vq8,$V42),o($Vq8,$V52),o($Vba,$Vc5),{20:$Vj,22:$Vk,23:4728,220:50,221:$Vl},{20:$VLa,22:$VMa,106:[1,4741],114:[1,4742],115:[1,4743],116:4740,170:$VNa,186:4731,196:4729,197:4730,202:4736,203:4737,204:4738,207:4739,210:[1,4744],211:[1,4745],212:[1,4750],213:[1,4751],214:[1,4752],215:[1,4753],216:[1,4746],217:[1,4747],218:[1,4748],219:[1,4749],221:$VOa},o($Va9,$Vi8,{67:4754,59:[1,4755]}),o($Vb9,$Vj8),o($Vb9,$Vk8,{80:4756,82:4757,84:4758,45:4759,124:4760,85:[1,4761],86:[1,4762],87:[1,4763],125:$VR,131:$VR,133:$VR,194:$VR,233:$VR}),o($Vb9,$Vl8),o($Vb9,$V76,{83:4764,79:4765,98:4766,100:4767,101:4771,105:4772,102:[1,4768],103:[1,4769],104:[1,4770],107:$VPa,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:4774,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($Vb9,$Vn8),o($VO9,$VI1,{99:4775}),o($VP9,$VJ1,{105:4459,101:4776,107:$Vva,108:$V_,109:$V$,110:$V01}),o($VQ9,$VL1,{92:4777}),o($VQ9,$VL1,{92:4778}),o($VQ9,$VL1,{92:4779}),o($Vb9,$VM1,{111:4465,113:4466,97:4780,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VR9,$Vd6),o($VR9,$Ve6),o($VO9,$VQ1),o($VO9,$VR1),o($VO9,$VS1),o($VO9,$VT1),o($VQ9,$VU1),o($VV1,$VW1,{167:4781}),o($VS9,$VY1),{125:[1,4782],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VR9,$VO1),o($VR9,$VP1),{20:[1,4786],22:[1,4790],23:4784,39:4783,206:4785,220:4787,221:[1,4789],222:[1,4788]},{106:[1,4791]},o($VO9,$V12),o($VQ9,$V22),o($VQ9,$V32),o($VQ9,$V42),o($VQ9,$V52),{106:[1,4793],112:4792,114:[1,4794],115:[1,4795],116:4796,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,4797]},o($Vb9,$Vj8),o($Vb9,$Vk8,{80:4798,82:4799,84:4800,45:4801,124:4802,85:[1,4803],86:[1,4804],87:[1,4805],125:$VR,131:$VR,133:$VR,194:$VR,233:$VR}),o($Vb9,$Vl8),o($Vb9,$V76,{83:4806,79:4807,98:4808,100:4809,101:4813,105:4814,102:[1,4810],103:[1,4811],104:[1,4812],107:$VQa,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:4816,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($Vb9,$Vn8),o($VO9,$VI1,{99:4817}),o($VP9,$VJ1,{105:4492,101:4818,107:$Vwa,108:$V_,109:$V$,110:$V01}),o($VQ9,$VL1,{92:4819}),o($VQ9,$VL1,{92:4820}),o($VQ9,$VL1,{92:4821}),o($Vb9,$VM1,{111:4498,113:4499,97:4822,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VR9,$Vd6),o($VR9,$Ve6),o($VO9,$VQ1),o($VO9,$VR1),o($VO9,$VS1),o($VO9,$VT1),o($VQ9,$VU1),o($VV1,$VW1,{167:4823}),o($VS9,$VY1),{125:[1,4824],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VR9,$VO1),o($VR9,$VP1),{20:[1,4828],22:[1,4832],23:4826,39:4825,206:4827,220:4829,221:[1,4831],222:[1,4830]},{106:[1,4833]},o($VO9,$V12),o($VQ9,$V22),o($VQ9,$V32),o($VQ9,$V42),o($VQ9,$V52),{106:[1,4835],112:4834,114:[1,4836],115:[1,4837],116:4838,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,4839]},{127:[1,4840]},o($Vda,$V74),o($VQ9,$Vk3),o($VQ9,$Vl3),o($VQ9,$Vm3),o($VQ9,$Vn3),o($VQ9,$Vo3),{117:[1,4841]},o($VQ9,$Vt3),o($VR9,$VN5),o($VS9,$Vg6),o($VS9,$VU1),o($VS9,$V22),o($VS9,$V32),o($VS9,$V42),o($VS9,$V52),o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:4842,127:$Vb3,154:$Vc3,194:$Vd3}),o($VK4,$VQ2),o($VK4,$VB),o($VK4,$VC),o($VK4,$Vo),o($VK4,$Vp),o($VK4,$VD),o($VK4,$Vq),o($VK4,$Vr),o($VK4,$VI2,{105:4198,101:4843,107:$Vfa,108:$V_,109:$V$,110:$V01}),o($VS6,$VJ2),o($VS6,$Vk3),o($VK4,$VF7),o($Vb6,$V84),o($Vb6,$V94),o($Vb6,$Va4),{106:[1,4844]},o($Vb6,$V12),{106:[1,4846],112:4845,114:[1,4847],115:[1,4848],116:4849,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,4850]},o($Vb6,$Vc4),{127:[1,4851]},{20:[1,4854],22:[1,4856],93:4852,170:[1,4857],197:4853,221:[1,4855]},o($Vb6,$Vg6),o($Vb6,$VU1),o($Vb6,$V22),o($Vb6,$V32),o($Vb6,$V42),o($Vb6,$V52),o($Vb6,$Vg6),o($Vb6,$VU1),o($Vb6,$V22),o($Vb6,$V32),o($Vb6,$V42),o($Vb6,$V52),o($VD1,$VN5),{199:[1,4860],200:4858,201:[1,4859]},o($VB1,$Vs6),o($VB1,$Vt6),o($VB1,$Vu6),o($VB1,$V22),o($VB1,$V32),o($VB1,$V42),o($VB1,$V52),o($VB1,$Vf4),o($VB1,$Vg4),o($VB1,$Vh4),o($VB1,$Vi4),o($VB1,$Vj4,{208:4861,209:4862,117:[1,4863]}),o($VB1,$Vk4),o($VB1,$Vl4),o($VB1,$Vm4),o($VB1,$Vn4),o($VB1,$Vo4),o($VB1,$Vp4),o($VB1,$Vq4),o($VB1,$Vr4),o($VB1,$Vs4),o($Vv6,$Vp3),o($Vv6,$Vq3),o($Vv6,$Vr3),o($Vv6,$Vs3),{199:[1,4866],200:4864,201:[1,4865]},o($VD1,$Vs6),o($VD1,$Vt6),o($VD1,$Vu6),o($VD1,$V22),o($VD1,$V32),o($VD1,$V42),o($VD1,$V52),o($VD1,$Vf4),o($VD1,$Vg4),o($VD1,$Vh4),o($VD1,$Vi4),o($VD1,$Vj4,{208:4867,209:4868,117:[1,4869]}),o($VD1,$Vk4),o($VD1,$Vl4),o($VD1,$Vm4),o($VD1,$Vn4),o($VD1,$Vo4),o($VD1,$Vp4),o($VD1,$Vq4),o($VD1,$Vr4),o($VD1,$Vs4),o($Vw6,$Vp3),o($Vw6,$Vq3),o($Vw6,$Vr3),o($Vw6,$Vs3),{20:[1,4872],22:[1,4874],93:4870,170:[1,4875],197:4871,221:[1,4873]},{199:[1,4878],200:4876,201:[1,4877]},o($VN1,$Vs6),o($VN1,$Vt6),o($VN1,$Vu6),o($VN1,$V22),o($VN1,$V32),o($VN1,$V42),o($VN1,$V52),o($VN1,$Vf4),o($VN1,$Vg4),o($VN1,$Vh4),o($VN1,$Vi4),o($VN1,$Vj4,{208:4879,209:4880,117:[1,4881]}),o($VN1,$Vk4),o($VN1,$Vl4),o($VN1,$Vm4),o($VN1,$Vn4),o($VN1,$Vo4),o($VN1,$Vp4),o($VN1,$Vq4),o($VN1,$Vr4),o($VN1,$Vs4),o($Vx6,$Vp3),o($Vx6,$Vq3),o($Vx6,$Vr3),o($Vx6,$Vs3),o($VB1,$VC6),o($VB1,$VU1),o($VD1,$VC6),o($VD1,$VU1),o($VN1,$VC6),o($VN1,$VU1),o($V55,$Vd1),o($V55,$Ve1),o($V55,$Vf1),o($VS3,$VL5),o($VS3,$VM5),{20:$Vga,22:$Vha,93:4882,170:$Via,197:4883,221:$Vja},o($V65,$Vd1),o($V65,$Ve1),o($V65,$Vf1),o($VT3,$VL5),o($VT3,$VM5),{20:$Vka,22:$Vla,93:4884,170:$Vma,197:4885,221:$Vna},o($VW3,$Vg6),o($VW3,$VU1),o($VW3,$V22),o($VW3,$V32),o($VW3,$V42),o($VW3,$V52),o($V85,$Vd1),o($V85,$Ve1),o($V85,$Vf1),o($VU3,$VL5),o($VU3,$VM5),{20:$Voa,22:$Vpa,93:4886,170:$Vqa,197:4887,221:$Vra},o($Vr7,$VC6),o($Vr7,$VU1),o($VB7,$Vj8),o($VB7,$Vk8,{80:4888,82:4889,84:4890,45:4891,124:4892,85:[1,4893],86:[1,4894],87:[1,4895],125:$VR,131:$VR,133:$VR,194:$VR,233:$VR}),o($VB7,$Vl8),o($VB7,$V76,{83:4896,79:4897,98:4898,100:4899,101:4903,105:4904,102:[1,4900],103:[1,4901],104:[1,4902],107:$VRa,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:4906,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($VB7,$Vn8),o($Vo8,$VI1,{99:4907}),o($Vp8,$VJ1,{105:4688,101:4908,107:$VKa,108:$V_,109:$V$,110:$V01}),o($Vq8,$VL1,{92:4909}),o($Vq8,$VL1,{92:4910}),o($Vq8,$VL1,{92:4911}),o($VB7,$VM1,{111:4694,113:4695,97:4912,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vr8,$Vd6),o($Vr8,$Ve6),o($Vo8,$VQ1),o($Vo8,$VR1),o($Vo8,$VS1),o($Vo8,$VT1),o($Vq8,$VU1),o($VV1,$VW1,{167:4913}),o($Vs8,$VY1),{125:[1,4914],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($Vr8,$VO1),o($Vr8,$VP1),{20:[1,4918],22:[1,4922],23:4916,39:4915,206:4917,220:4919,221:[1,4921],222:[1,4920]},{106:[1,4923]},o($Vo8,$V12),o($Vq8,$V22),o($Vq8,$V32),o($Vq8,$V42),o($Vq8,$V52),{106:[1,4925],112:4924,114:[1,4926],115:[1,4927],116:4928,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,4929]},{127:[1,4930]},o($V29,$V74),o($Vq8,$Vk3),o($Vq8,$Vl3),o($Vq8,$Vm3),o($Vq8,$Vn3),o($Vq8,$Vo3),{117:[1,4931]},o($Vq8,$Vt3),o($Vr8,$VN5),o($Vs8,$Vg6),o($Vs8,$VU1),o($Vs8,$V22),o($Vs8,$V32),o($Vs8,$V42),o($Vs8,$V52),{127:[1,4932]},o($V29,$V74),o($Vq8,$Vk3),o($Vq8,$Vl3),o($Vq8,$Vm3),o($Vq8,$Vn3),o($Vq8,$Vo3),{117:[1,4933]},o($Vq8,$Vt3),o($Vr8,$VN5),o($Vs8,$Vg6),o($Vs8,$VU1),o($Vs8,$V22),o($Vs8,$V32),o($Vs8,$V42),o($Vs8,$V52),{199:[1,4936],200:4934,201:[1,4935]},o($V49,$Vs6),o($V49,$Vt6),o($V49,$Vu6),o($V49,$V22),o($V49,$V32),o($V49,$V42),o($V49,$V52),o($V49,$Vf4),o($V49,$Vg4),o($V49,$Vh4),o($V49,$Vi4),o($V49,$Vj4,{208:4937,209:4938,117:[1,4939]}),o($V49,$Vk4),o($V49,$Vl4),o($V49,$Vm4),o($V49,$Vn4),o($V49,$Vo4),o($V49,$Vp4),o($V49,$Vq4),o($V49,$Vr4),o($V49,$Vs4),o($VSa,$Vp3),o($VSa,$Vq3),o($VSa,$Vr3),o($VSa,$Vs3),o($Vb9,$V_8),o($Vw,$Vx,{65:4940,47:4941,50:$Vy}),o($Vb9,$V$8),o($Vb9,$V09),o($Vb9,$Vd6),o($Vb9,$Ve6),{125:[1,4942],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($Vb9,$VO1),o($Vb9,$VP1),{20:[1,4946],22:[1,4950],23:4944,39:4943,206:4945,220:4947,221:[1,4949],222:[1,4948]},o($Vb9,$V19),o($Vb9,$VR6),o($Vda,$VI1,{99:4951}),o($Vb9,$VJ1,{105:4772,101:4952,107:$VPa,108:$V_,109:$V$,110:$V01}),o($Vda,$VQ1),o($Vda,$VR1),o($Vda,$VS1),o($Vda,$VT1),{106:[1,4953]},o($Vda,$V12),{76:[1,4954]},o($VP9,$VI2,{105:4459,101:4955,107:$Vva,108:$V_,109:$V$,110:$V01}),o($VO9,$VJ2),o($Vb9,$VK2,{96:4956,101:4957,97:4958,105:4959,111:4961,113:4962,107:$VTa,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vb9,$VM2,{96:4956,101:4957,97:4958,105:4959,111:4961,113:4962,107:$VTa,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vb9,$VN2,{96:4956,101:4957,97:4958,105:4959,111:4961,113:4962,107:$VTa,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VS9,$VO2),{20:$VR2,22:$VS2,23:404,29:[1,4963],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:4964,127:$Vb3,154:$Vc3,194:$Vd3}),o($VR9,$VQ2),o($VR9,$VB),o($VR9,$VC),o($VR9,$Vo),o($VR9,$Vp),o($VR9,$VD),o($VR9,$Vq),o($VR9,$Vr),o($VO9,$Vk3),o($VS9,$Vl3),o($VS9,$Vm3),o($VS9,$Vn3),o($VS9,$Vo3),{117:[1,4965]},o($VS9,$Vt3),o($Vb9,$V$8),o($Vb9,$V09),o($Vb9,$Vd6),o($Vb9,$Ve6),{125:[1,4966],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($Vb9,$VO1),o($Vb9,$VP1),{20:[1,4970],22:[1,4974],23:4968,39:4967,206:4969,220:4971,221:[1,4973],222:[1,4972]},o($Vb9,$V19),o($Vb9,$VR6),o($Vda,$VI1,{99:4975}),o($Vb9,$VJ1,{105:4814,101:4976,107:$VQa,108:$V_,109:$V$,110:$V01}),o($Vda,$VQ1),o($Vda,$VR1),o($Vda,$VS1),o($Vda,$VT1),{106:[1,4977]},o($Vda,$V12),{76:[1,4978]},o($VP9,$VI2,{105:4492,101:4979,107:$Vwa,108:$V_,109:$V$,110:$V01}),o($VO9,$VJ2),o($Vb9,$VK2,{96:4980,101:4981,97:4982,105:4983,111:4985,113:4986,107:$VUa,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vb9,$VM2,{96:4980,101:4981,97:4982,105:4983,111:4985,113:4986,107:$VUa,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vb9,$VN2,{96:4980,101:4981,97:4982,105:4983,111:4985,113:4986,107:$VUa,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VS9,$VO2),{20:$VR2,22:$VS2,23:404,29:[1,4987],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:4988,127:$Vb3,154:$Vc3,194:$Vd3}),o($VR9,$VQ2),o($VR9,$VB),o($VR9,$VC),o($VR9,$Vo),o($VR9,$Vp),o($VR9,$VD),o($VR9,$Vq),o($VR9,$Vr),o($VO9,$Vk3),o($VS9,$Vl3),o($VS9,$Vm3),o($VS9,$Vn3),o($VS9,$Vo3),{117:[1,4989]},o($VS9,$Vt3),o($Vb9,$VN5),{20:[1,4992],22:[1,4994],93:4990,170:[1,4995],197:4991,221:[1,4993]},{127:[1,4996]},o($VS6,$V74),o($Vb6,$Vk3),o($Vb6,$Vl3),o($Vb6,$Vm3),o($Vb6,$Vn3),o($Vb6,$Vo3),{117:[1,4997]},o($Vb6,$Vt3),o($Vc6,$VN5),o($Vf6,$Vg6),o($Vf6,$VU1),o($Vf6,$V22),o($Vf6,$V32),o($Vf6,$V42),o($Vf6,$V52),o($VE2,$Vd1),o($VE2,$Ve1),o($VE2,$Vf1),o($VB1,$VL5),o($VB1,$VM5),{20:$Vya,22:$Vza,93:4998,170:$VAa,197:4999,221:$VBa},o($VG2,$Vd1),o($VG2,$Ve1),o($VG2,$Vf1),o($VD1,$VL5),o($VD1,$VM5),{20:$VCa,22:$VDa,93:5000,170:$VEa,197:5001,221:$VFa},o($VK1,$Vg6),o($VK1,$VU1),o($VK1,$V22),o($VK1,$V32),o($VK1,$V42),o($VK1,$V52),o($VP2,$Vd1),o($VP2,$Ve1),o($VP2,$Vf1),o($VN1,$VL5),o($VN1,$VM5),{20:$VGa,22:$VHa,93:5002,170:$VIa,197:5003,221:$VJa},o($VS3,$VC6),o($VS3,$VU1),o($VT3,$VC6),o($VT3,$VU1),o($VU3,$VC6),o($VU3,$VU1),o($VB7,$V$8),o($VB7,$V09),o($VB7,$Vd6),o($VB7,$Ve6),{125:[1,5004],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VB7,$VO1),o($VB7,$VP1),{20:[1,5008],22:[1,5012],23:5006,39:5005,206:5007,220:5009,221:[1,5011],222:[1,5010]},o($VB7,$V19),o($VB7,$VR6),o($V29,$VI1,{99:5013}),o($VB7,$VJ1,{105:4904,101:5014,107:$VRa,108:$V_,109:$V$,110:$V01}),o($V29,$VQ1),o($V29,$VR1),o($V29,$VS1),o($V29,$VT1),{106:[1,5015]},o($V29,$V12),{76:[1,5016]},o($Vp8,$VI2,{105:4688,101:5017,107:$VKa,108:$V_,109:$V$,110:$V01}),o($Vo8,$VJ2),o($VB7,$VK2,{96:5018,101:5019,97:5020,105:5021,111:5023,113:5024,107:$VVa,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VB7,$VM2,{96:5018,101:5019,97:5020,105:5021,111:5023,113:5024,107:$VVa,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VB7,$VN2,{96:5018,101:5019,97:5020,105:5021,111:5023,113:5024,107:$VVa,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vs8,$VO2),{20:$VR2,22:$VS2,23:404,29:[1,5025],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:5026,127:$Vb3,154:$Vc3,194:$Vd3}),o($Vr8,$VQ2),o($Vr8,$VB),o($Vr8,$VC),o($Vr8,$Vo),o($Vr8,$Vp),o($Vr8,$VD),o($Vr8,$Vq),o($Vr8,$Vr),o($Vo8,$Vk3),o($Vs8,$Vl3),o($Vs8,$Vm3),o($Vs8,$Vn3),o($Vs8,$Vo3),{117:[1,5027]},o($Vs8,$Vt3),o($VB7,$VN5),{20:[1,5030],22:[1,5032],93:5028,170:[1,5033],197:5029,221:[1,5031]},o($VB7,$VN5),{20:[1,5036],22:[1,5038],93:5034,170:[1,5039],197:5035,221:[1,5037]},o($Vba,$Vd1),o($Vba,$Ve1),o($Vba,$Vf1),o($V49,$VL5),o($V49,$VM5),{20:$VLa,22:$VMa,93:5040,170:$VNa,197:5041,221:$VOa},o($Vb9,$VJ9),o($VQ,$VR,{69:5042,79:5043,81:5044,82:5045,98:5048,100:5049,93:5051,94:5052,95:5053,84:5054,45:5055,101:5059,197:5060,97:5062,124:5063,105:5067,111:5073,113:5074,20:[1,5069],22:[1,5071],28:[1,5061],75:[1,5046],77:[1,5047],85:[1,5064],86:[1,5065],87:[1,5066],91:[1,5050],102:[1,5056],103:[1,5057],104:[1,5058],107:$VWa,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61,170:[1,5072],221:[1,5070]}),o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:5075,127:$Vb3,154:$Vc3,194:$Vd3}),o($Vb9,$VQ2),o($Vb9,$VB),o($Vb9,$VC),o($Vb9,$Vo),o($Vb9,$Vp),o($Vb9,$VD),o($Vb9,$Vq),o($Vb9,$Vr),o($Vb9,$VI2,{105:4772,101:5076,107:$VPa,108:$V_,109:$V$,110:$V01}),o($Vda,$VJ2),o($Vda,$Vk3),o($Vb9,$VL9),o($VO9,$V74),o($VQ9,$V84),o($VQ9,$V94),o($VQ9,$Va4),{106:[1,5077]},o($VQ9,$V12),{106:[1,5079],112:5078,114:[1,5080],115:[1,5081],116:5082,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,5083]},o($VQ9,$Vc4),{127:[1,5084]},{20:[1,5087],22:[1,5089],93:5085,170:[1,5090],197:5086,221:[1,5088]},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:5091,127:$Vb3,154:$Vc3,194:$Vd3}),o($Vb9,$VQ2),o($Vb9,$VB),o($Vb9,$VC),o($Vb9,$Vo),o($Vb9,$Vp),o($Vb9,$VD),o($Vb9,$Vq),o($Vb9,$Vr),o($Vb9,$VI2,{105:4814,101:5092,107:$VQa,108:$V_,109:$V$,110:$V01}),o($Vda,$VJ2),o($Vda,$Vk3),o($Vb9,$VL9),o($VO9,$V74),o($VQ9,$V84),o($VQ9,$V94),o($VQ9,$Va4),{106:[1,5093]},o($VQ9,$V12),{106:[1,5095],112:5094,114:[1,5096],115:[1,5097],116:5098,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,5099]},o($VQ9,$Vc4),{127:[1,5100]},{20:[1,5103],22:[1,5105],93:5101,170:[1,5106],197:5102,221:[1,5104]},o($VQ9,$Vg6),o($VQ9,$VU1),o($VQ9,$V22),o($VQ9,$V32),o($VQ9,$V42),o($VQ9,$V52),o($VK4,$VN5),{20:[1,5109],22:[1,5111],93:5107,170:[1,5112],197:5108,221:[1,5110]},o($VB1,$VC6),o($VB1,$VU1),o($VD1,$VC6),o($VD1,$VU1),o($VN1,$VC6),o($VN1,$VU1),o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:5113,127:$Vb3,154:$Vc3,194:$Vd3}),o($VB7,$VQ2),o($VB7,$VB),o($VB7,$VC),o($VB7,$Vo),o($VB7,$Vp),o($VB7,$VD),o($VB7,$Vq),o($VB7,$Vr),o($VB7,$VI2,{105:4904,101:5114,107:$VRa,108:$V_,109:$V$,110:$V01}),o($V29,$VJ2),o($V29,$Vk3),o($VB7,$VL9),o($Vo8,$V74),o($Vq8,$V84),o($Vq8,$V94),o($Vq8,$Va4),{106:[1,5115]},o($Vq8,$V12),{106:[1,5117],112:5116,114:[1,5118],115:[1,5119],116:5120,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,5121]},o($Vq8,$Vc4),{127:[1,5122]},{20:[1,5125],22:[1,5127],93:5123,170:[1,5128],197:5124,221:[1,5126]},o($Vq8,$Vg6),o($Vq8,$VU1),o($Vq8,$V22),o($Vq8,$V32),o($Vq8,$V42),o($Vq8,$V52),o($Vq8,$Vg6),o($Vq8,$VU1),o($Vq8,$V22),o($Vq8,$V32),o($Vq8,$V42),o($Vq8,$V52),o($V49,$VC6),o($V49,$VU1),o($Vb9,$Vj8),o($Vb9,$Vk8,{80:5129,82:5130,84:5131,45:5132,124:5133,85:[1,5134],86:[1,5135],87:[1,5136],125:$VR,131:$VR,133:$VR,194:$VR,233:$VR}),o($Vb9,$Vl8),o($Vb9,$V76,{83:5137,79:5138,98:5139,100:5140,101:5144,105:5145,102:[1,5141],103:[1,5142],104:[1,5143],107:$VXa,108:$V_,109:$V$,110:$V01}),o($Va1,$Vx,{47:187,45:189,44:5147,50:$Vw1,85:$Vx1,86:$Vy1,87:$Vz1}),o($Vb9,$Vn8),o($VO9,$VI1,{99:5148}),o($VP9,$VJ1,{105:5067,101:5149,107:$VWa,108:$V_,109:$V$,110:$V01}),o($VQ9,$VL1,{92:5150}),o($VQ9,$VL1,{92:5151}),o($VQ9,$VL1,{92:5152}),o($Vb9,$VM1,{111:5073,113:5074,97:5153,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VR9,$Vd6),o($VR9,$Ve6),o($VO9,$VQ1),o($VO9,$VR1),o($VO9,$VS1),o($VO9,$VT1),o($VQ9,$VU1),o($VV1,$VW1,{167:5154}),o($VS9,$VY1),{125:[1,5155],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($VR9,$VO1),o($VR9,$VP1),{20:[1,5159],22:[1,5163],23:5157,39:5156,206:5158,220:5160,221:[1,5162],222:[1,5161]},{106:[1,5164]},o($VO9,$V12),o($VQ9,$V22),o($VQ9,$V32),o($VQ9,$V42),o($VQ9,$V52),{106:[1,5166],112:5165,114:[1,5167],115:[1,5168],116:5169,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,5170]},{127:[1,5171]},o($Vda,$V74),o($VQ9,$Vk3),o($VQ9,$Vl3),o($VQ9,$Vm3),o($VQ9,$Vn3),o($VQ9,$Vo3),{117:[1,5172]},o($VQ9,$Vt3),o($VR9,$VN5),o($VS9,$Vg6),o($VS9,$VU1),o($VS9,$V22),o($VS9,$V32),o($VS9,$V42),o($VS9,$V52),{127:[1,5173]},o($Vda,$V74),o($VQ9,$Vk3),o($VQ9,$Vl3),o($VQ9,$Vm3),o($VQ9,$Vn3),o($VQ9,$Vo3),{117:[1,5174]},o($VQ9,$Vt3),o($VR9,$VN5),o($VS9,$Vg6),o($VS9,$VU1),o($VS9,$V22),o($VS9,$V32),o($VS9,$V42),o($VS9,$V52),o($Vb6,$Vg6),o($Vb6,$VU1),o($Vb6,$V22),o($Vb6,$V32),o($Vb6,$V42),o($Vb6,$V52),{127:[1,5175]},o($V29,$V74),o($Vq8,$Vk3),o($Vq8,$Vl3),o($Vq8,$Vm3),o($Vq8,$Vn3),o($Vq8,$Vo3),{117:[1,5176]},o($Vq8,$Vt3),o($Vr8,$VN5),o($Vs8,$Vg6),o($Vs8,$VU1),o($Vs8,$V22),o($Vs8,$V32),o($Vs8,$V42),o($Vs8,$V52),o($Vb9,$V$8),o($Vb9,$V09),o($Vb9,$Vd6),o($Vb9,$Ve6),{125:[1,5177],128:212,129:213,130:214,131:$VZ1,133:$V_1,194:$V$1,223:216,233:$V02},o($Vb9,$VO1),o($Vb9,$VP1),{20:[1,5181],22:[1,5185],23:5179,39:5178,206:5180,220:5182,221:[1,5184],222:[1,5183]},o($Vb9,$V19),o($Vb9,$VR6),o($Vda,$VI1,{99:5186}),o($Vb9,$VJ1,{105:5145,101:5187,107:$VXa,108:$V_,109:$V$,110:$V01}),o($Vda,$VQ1),o($Vda,$VR1),o($Vda,$VS1),o($Vda,$VT1),{106:[1,5188]},o($Vda,$V12),{76:[1,5189]},o($VP9,$VI2,{105:5067,101:5190,107:$VWa,108:$V_,109:$V$,110:$V01}),o($VO9,$VJ2),o($Vb9,$VK2,{96:5191,101:5192,97:5193,105:5194,111:5196,113:5197,107:$VYa,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vb9,$VM2,{96:5191,101:5192,97:5193,105:5194,111:5196,113:5197,107:$VYa,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($Vb9,$VN2,{96:5191,101:5192,97:5193,105:5194,111:5196,113:5197,107:$VYa,108:$V_,109:$V$,110:$V01,118:$V11,119:$V21,120:$V31,121:$V41,122:$V51,123:$V61}),o($VS9,$VO2),{20:$VR2,22:$VS2,23:404,29:[1,5198],77:$VT2,87:$VU2,106:$VV2,114:$VW2,115:$VX2,116:416,168:398,169:399,170:$VY2,171:401,172:402,186:405,190:$VZ2,202:410,203:411,204:412,207:415,210:$V_2,211:$V$2,212:$V03,213:$V13,214:$V23,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:409,221:$V83},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:5199,127:$Vb3,154:$Vc3,194:$Vd3}),o($VR9,$VQ2),o($VR9,$VB),o($VR9,$VC),o($VR9,$Vo),o($VR9,$Vp),o($VR9,$VD),o($VR9,$Vq),o($VR9,$Vr),o($VO9,$Vk3),o($VS9,$Vl3),o($VS9,$Vm3),o($VS9,$Vn3),o($VS9,$Vo3),{117:[1,5200]},o($VS9,$Vt3),o($Vb9,$VN5),{20:[1,5203],22:[1,5205],93:5201,170:[1,5206],197:5202,221:[1,5204]},o($Vb9,$VN5),{20:[1,5209],22:[1,5211],93:5207,170:[1,5212],197:5208,221:[1,5210]},o($VB7,$VN5),{20:[1,5215],22:[1,5217],93:5213,170:[1,5218],197:5214,221:[1,5216]},o($V93,$Va3,{132:431,136:432,137:433,138:434,142:435,143:436,144:437,150:438,152:439,153:440,126:5219,127:$Vb3,154:$Vc3,194:$Vd3}),o($Vb9,$VQ2),o($Vb9,$VB),o($Vb9,$VC),o($Vb9,$Vo),o($Vb9,$Vp),o($Vb9,$VD),o($Vb9,$Vq),o($Vb9,$Vr),o($Vb9,$VI2,{105:5145,101:5220,107:$VXa,108:$V_,109:$V$,110:$V01}),o($Vda,$VJ2),o($Vda,$Vk3),o($Vb9,$VL9),o($VO9,$V74),o($VQ9,$V84),o($VQ9,$V94),o($VQ9,$Va4),{106:[1,5221]},o($VQ9,$V12),{106:[1,5223],112:5222,114:[1,5224],115:[1,5225],116:5226,212:$V62,213:$V72,214:$V82,215:$V92},{106:[1,5227]},o($VQ9,$Vc4),{127:[1,5228]},{20:[1,5231],22:[1,5233],93:5229,170:[1,5234],197:5230,221:[1,5232]},o($VQ9,$Vg6),o($VQ9,$VU1),o($VQ9,$V22),o($VQ9,$V32),o($VQ9,$V42),o($VQ9,$V52),o($VQ9,$Vg6),o($VQ9,$VU1),o($VQ9,$V22),o($VQ9,$V32),o($VQ9,$V42),o($VQ9,$V52),o($Vq8,$Vg6),o($Vq8,$VU1),o($Vq8,$V22),o($Vq8,$V32),o($Vq8,$V42),o($Vq8,$V52),{127:[1,5235]},o($Vda,$V74),o($VQ9,$Vk3),o($VQ9,$Vl3),o($VQ9,$Vm3),o($VQ9,$Vn3),o($VQ9,$Vo3),{117:[1,5236]},o($VQ9,$Vt3),o($VR9,$VN5),o($VS9,$Vg6),o($VS9,$VU1),o($VS9,$V22),o($VS9,$V32),o($VS9,$V42),o($VS9,$V52),o($Vb9,$VN5),{20:[1,5239],22:[1,5241],93:5237,170:[1,5242],197:5238,221:[1,5240]},o($VQ9,$Vg6),o($VQ9,$VU1),o($VQ9,$V22),o($VQ9,$V32),o($VQ9,$V42),o($VQ9,$V52)];
        this.defaultActions = {6:[2,11],26:[2,1],134:[2,126],135:[2,127],136:[2,128],141:[2,139],142:[2,140],226:[2,260],227:[2,261],228:[2,262],229:[2,263],362:[2,42],431:[2,149],432:[2,153],434:[2,155],624:[2,40],625:[2,44],662:[2,41],1188:[2,153],1190:[2,155]};
    }
    performAction (yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */
          const $0 = $$.length - 1;
        switch (yystate) {
case 1:

        let imports = Object.keys(yy._imports).length ? { imports: yy._imports } : {}
        const startObj = yy.start ? { start: yy.start } : {};
        const startActs = yy.startActs ? { startActs: yy.startActs } : {};
        let shapes = yy.shapes ? { shapes: Object.values(yy.shapes) } : {};
        const shexj = Object.assign(
          { type: "Schema" }, imports, startActs, startObj, shapes
        )
        if (yy.options.index) {
          if (yy._base !== null)
            shexj._base = yy._base;
          shexj._prefixes = yy._prefixes;
          shexj._index = {
            shapeExprs: yy.shapes || {},
            tripleExprs: yy.productions || {}
          };
          shexj._sourceMap = yy._sourceMap;
        }
        return shexj;
      
break;
case 2:
 yy.parser.yy = { lexer: yy.lexer} ; 
break;
case 16:
 // t: @@
        yy._setBase(yy._base === null ||
                    absoluteIRI.test($$[$0].slice(1, -1)) ? $$[$0].slice(1, -1) : yy._resolveIRI($$[$0].slice(1, -1)));
      
break;
case 17:
 // t: ShExParser-test.js/with pre-defined prefixes
        yy._prefixes[$$[$0-1].slice(0, -1)] = $$[$0];
      
break;
case 18:
 // t: @@
        yy._imports.push($$[$0]);
      
break;
case 19:

        $$[$0].forEach(function (elt) {
	  yy._termResolver.add(elt);
        });
      
break;
case 20: case 54: case 58: case 61: case 65: case 281: case 285:
this.$ = [];
break;
case 21: case 50: case 53: case 55: case 59: case 62: case 66: case 282: case 286:
this.$ = $$[$0-1].concat($$[$0]);
break;
case 22: case 49: case 52:
this.$ = [$$[$0]];
break;
case 23: case 162:
this.$ = $$[$0-1];
break;
case 26:

        if (yy.start)
          yy.error(new Error("Parse error: start already defined"));
        yy.start = shapeJunction("ShapeOr", $$[$0-1], $$[$0]); // t: startInline
      
break;
case 27:

        yy.startActs = $$[$0]; // t: startCode1
      
break;
case 28:
this.$ = [$$[$0]] // t: startCode1;
break;
case 29:
this.$ = appendTo($$[$0-1], $$[$0]) // t: startCode3;
break;
case 32:
 // t: 1dot 1val1vsMinusiri3??
        yy.addShape($$[$0-2], Object.assign({type: "ShapeDecl"}, $$[$0-3],
                                   $$[$0-1].length > 0 ? { restricts: $$[$0-1] } : { },
                                   {shapeExpr: $$[$0]})) // $$[$01]: t: @@
      
break;
case 33:
this.$ = {  };
break;
case 34:
this.$ = { abstract: true };
break;
case 35: case 102:
this.$ = [] // t: 1dot, 1dotAnnot3;
break;
case 36: case 103:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotAnnot3;
break;
case 37:

        this.$ = nonest($$[$0]);
      
break;
case 39:
this.$ = { type: "ShapeExternal" };
break;
case 40:

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
case 41:

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
case 42:

        $$[$0].needsAtom.unshift(nonest($$[$0-1]));
        delete $$[$0].needsAtom;
        this.$ = $$[$0]; // { type: "ShapeOr", "shapeExprs": [$$[$0-1]].concat($$[$0]) };
      
break;
case 43: case 239: case 256:
this.$ = null;
break;
case 44: case 48: case 51: case 57: case 64: case 196: case 255: case 280: case 284:
this.$ = $$[$0];
break;
case 46:
 // returns a ShapeOr
        const disjuncts = $$[$0].map(nonest);
        this.$ = { type: "ShapeOr", shapeExprs: disjuncts, needsAtom: disjuncts }; // t: @@
      
break;
case 47:
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
case 56: case 279:
this.$ = shapeJunction("ShapeOr", $$[$0-1], $$[$0]);
break;
case 60: case 63:
this.$ = shapeJunction("ShapeAnd", $$[$0-1], $$[$0]) // t: @@;
break;
case 67:
this.$ = $$[$0-1] ? { type: "ShapeNot", "shapeExpr": nonest($$[$0]) } /* t:@@ */ : $$[$0];
break;
case 68:
this.$ = false;
break;
case 69:
this.$ = true;
break;
case 70:
this.$ = $$[$0-1] ? { type: "ShapeNot", "shapeExpr": nonest($$[$0]) } /* t: 1NOTNOTdot, 1NOTNOTIRI, 1NOTNOTvs */ : $$[$0];
break;
case 71: case 80: case 85: case 288: case 290:
this.$ = $$[$0] ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $$[$0-1]), $$[$0] ] } : $$[$0-1];
break;
case 73:
this.$ = $$[$0] ? shapeJunction("ShapeAnd", $$[$0-1], [$$[$0]]) /* t: 1dotRef1 */ : $$[$0-1] // t:@@;
break;
case 74: case 83: case 88:
this.$ = Object.assign($$[$0-1], {nested: true}) // t: 1val1vsMinusiri3;
break;
case 75: case 84: case 89:
this.$ = yy.EmptyShape // t: 1dot;
break;
case 82:
this.$ = $$[$0] ? shapeJunction("ShapeAnd", $$[$0-1], [$$[$0]]) /* t:@@ */ : $$[$0-1]	 // t: 1dotRef1 -- use _QnonLitNodeConstraint_E_Opt like below?;
break;
case 87:
this.$ = $$[$0] ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $$[$0-1]), $$[$0] ] } : $$[$0-1] // t: !! look to 1dotRef1;
break;
case 98:
 // t: 1dotRefLNex@@
        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        const namePos = $$[$0].indexOf(':');
        this.$ = yy.addSourceMap(yy.expandPrefix($$[$0].substr(0, namePos), yy) + $$[$0].substr(namePos + 1)); // ShapeRef
      
break;
case 99:
 // t: 1dotRefNS1@@
        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        this.$ = yy.addSourceMap(yy.expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy)); // ShapeRef
      
break;
case 100:
this.$ = yy.addSourceMap($$[$0]) // ShapeRef // t: 1dotRef1, 1dotRefSpaceLNex, 1dotRefSpaceNS1;
break;
case 101: case 104:
 // t: !!
        this.$ = $$[$0-2]
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: !!
        if ($$[$0]) { this.$.semActs = $$[$0].semActs; } // t: !!
      
break;
case 105:
this.$ = extend({ type: "NodeConstraint", nodeKind: "literal" }, $$[$0]) // t: 1literalPattern;
break;
case 106:

        if (numericDatatypes.indexOf($$[$0-1]) === -1)
          numericFacets.forEach(function (facet) {
            if (facet in $$[$0])
              yy.error(new Error("Parse error: facet " + facet + " not allowed for unknown datatype " + $$[$0-1]));
          });
        this.$ = extend({ type: "NodeConstraint", datatype: $$[$0-1] }, $$[$0]) // t: 1datatype
      
break;
case 107:
this.$ = { type: "NodeConstraint", values: $$[$0-1] } // t: 1val1IRIREF;
break;
case 108:
this.$ = extend({ type: "NodeConstraint"}, $$[$0]);
break;
case 109:
this.$ = {} // t: 1literalPattern;
break;
case 110:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          yy.error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"));
        }
        this.$ = extend($$[$0-1], $$[$0]) // t: 1literalLength
      
break;
case 112: case 118:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          yy.error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"));
        }
        this.$ = extend($$[$0-1], $$[$0]) // t: !! look to 1literalLength
      
break;
case 113:
this.$ = extend({ type: "NodeConstraint" }, $$[$0-1], $$[$0] ? $$[$0] : {}) // t: 1iriPattern;
break;
case 114:
this.$ = extend({ type: "NodeConstraint" }, $$[$0]) // t: @@;
break;
case 115:
this.$ = {};
break;
case 116:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          yy.error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"));
        }
        this.$ = extend($$[$0-1], $$[$0])
      
break;
case 119:
this.$ = { nodeKind: "iri" } // t: 1iriPattern;
break;
case 120:
this.$ = { nodeKind: "bnode" } // t: 1bnodeLength;
break;
case 121:
this.$ = { nodeKind: "nonliteral" } // t: 1nonliteralLength;
break;
case 124:
this.$ = keyValObject($$[$0-1], parseInt($$[$0], 10)) // t: 1literalLength;
break;
case 125:
this.$ = unescapeRegexp($$[$0]) // t: 1literalPattern;
break;
case 126:
this.$ = "length" // t: 1literalLength;
break;
case 127:
this.$ = "minlength" // t: 1literalMinlength;
break;
case 128:
this.$ = "maxlength" // t: 1literalMaxlength;
break;
case 129:
this.$ = keyValObject($$[$0-1], $$[$0]) // t: 1literalMininclusive;
break;
case 130:
this.$ = keyValObject($$[$0-1], parseInt($$[$0], 10)) // t: 1literalTotaldigits;
break;
case 131:
this.$ = parseInt($$[$0], 10);
break;
case 132: case 133:
this.$ = parseFloat($$[$0]);
break;
case 134:
 // ## deprecated
        if ($$[$0] === XSD_DECIMAL || $$[$0] === XSD_FLOAT || $$[$0] === XSD_DOUBLE)
          this.$ = parseFloat($$[$0-2].value);
        else if (numericDatatypes.indexOf($$[$0]) !== -1)
          this.$ = parseInt($$[$0-2].value)
        else
          yy.error(new Error("Parse error: numeric range facet expected numeric datatype instead of " + $$[$0]));
      
break;
case 135:
this.$ = "mininclusive" // t: 1literalMininclusive;
break;
case 136:
this.$ = "minexclusive" // t: 1literalMinexclusive;
break;
case 137:
this.$ = "maxinclusive" // t: 1literalMaxinclusive;
break;
case 138:
this.$ = "maxexclusive" // t: 1literalMaxexclusive;
break;
case 139:
this.$ = "totaldigits" // t: 1literalTotaldigits;
break;
case 140:
this.$ = "fractiondigits" // t: 1literalFractiondigits;
break;
case 141:
 // t: 1dotExtend3
        this.$ = $$[$0-2] === yy.EmptyShape ? { type: "Shape" } : $$[$0-2]; // t: 0
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: !! look to open3groupdotcloseAnnot3, open3groupdotclosecard23Annot3Code2
        if ($$[$0]) { this.$.semActs = $$[$0].semActs; } // t: !! look to open3groupdotcloseCode1, !open1dotOr1dot
      
break;
case 142:
 // t: 1dotExtend3
        const exprObj = $$[$0-1] ? { expression: $$[$0-1] } : yy.EmptyObject; // t: 0, 0Extend1
        this.$ = (exprObj === yy.EmptyObject && $$[$0-3] === yy.EmptyObject) ?
	  yy.EmptyShape :
	  extend({ type: "Shape" }, exprObj, $$[$0-3]);
      
break;
case 143:
this.$ = [ "extends", [$$[$0]] ] // t: 1dotExtend1;
break;
case 144:
this.$ = [ "extra", $$[$0] ] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3;
break;
case 145:
this.$ = [ "closed", true ] // t: 1dotClosed;
break;
case 146:
this.$ = yy.EmptyObject;
break;
case 147:

        if ($$[$0-1] === yy.EmptyObject)
          $$[$0-1] = {};
        if ($$[$0][0] === "closed")
          $$[$0-1]["closed"] = true; // t: 1dotClosed
        else if ($$[$0][0] in $$[$0-1])
          $$[$0-1][$$[$0][0]] = unionAll($$[$0-1][$$[$0][0]], $$[$0][1]); // t: 1dotExtend3, 3groupdot3Extra, 3groupdotExtra3
        else
          $$[$0-1][$$[$0][0]] = $$[$0][1]; // t: 1dotExtend1
        this.$ = $$[$0-1];
      
break;
case 150:
this.$ = $$[$0] // t: 1dotExtra1, 3groupdot3Extra;
break;
case 151:
this.$ = [$$[$0]] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3;
break;
case 152:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 3groupdotExtra3;
break;
case 156:
this.$ = { type: "OneOf", expressions: unionAll([$$[$0-1]], $$[$0]) } // t: 2oneOfdot;
break;
case 157:
this.$ = $$[$0] // t: 2oneOfdot;
break;
case 158:
this.$ = [$$[$0]] // t: 2oneOfdot;
break;
case 159:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 2oneOfdot;
break;
case 166:
this.$ = { type: "EachOf", expressions: unionAll([$$[$0-2]], $$[$0-1]) } // t: 2groupOfdot;
break;
case 167:
this.$ = $$[$0] // ## deprecated // t: 2groupOfdot;
break;
case 168:
this.$ = $$[$0] // t: 2groupOfdot;
break;
case 169:
this.$ = [$$[$0]] // t: 2groupOfdot;
break;
case 170:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 2groupOfdot;
break;
case 171:

        if ($$[$0-1]) {
          this.$ = extend({ id: $$[$0-1] }, $$[$0]);
          yy.addProduction($$[$0-1],  this.$);
        } else {
          this.$ = $$[$0]
        }
      
break;
case 173:
this.$ = yy.addSourceMap($$[$0]);
break;
case 178:

        // t: open1dotOr1dot, !openopen1dotcloseCode1closeCode2
        this.$ = $$[$0-4];
        // Copy all of the new attributes into the encapsulated shape.
        if ("min" in $$[$0-2]) { this.$.min = $$[$0-2].min; } // t: open3groupdotclosecard23Annot3Code2
        if ("max" in $$[$0-2]) { this.$.max = $$[$0-2].max; } // t: open3groupdotclosecard23Annot3Code2
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: open3groupdotcloseAnnot3, open3groupdotclosecard23Annot3Code2
        if ($$[$0]) { this.$.semActs = "semActs" in $$[$0-4] ? $$[$0-4].semActs.concat($$[$0].semActs) : $$[$0].semActs; } // t: open3groupdotcloseCode1, !open1dotOr1dot
      
break;
case 179:
this.$ = {} // t: 1dot;
break;
case 181:

        // $$[$0]: t: 1dotCode1
	if ($$[$0-3] !== yy.EmptyShape && false) {}
        // %7: t: 1inversedotCode1
        this.$ = extend({ type: "TripleConstraint" }, $$[$0-5], { predicate: $$[$0-4] }, ($$[$0-3] === yy.EmptyShape ? {} : { valueExpr: $$[$0-3] }), $$[$0-2], $$[$0]); // t: 1dot, 1inversedot
        if ($$[$0-1].length)
          this.$["annotations"] = $$[$0-1]; // t: 1dotAnnot3, 1inversedotAnnot3
      
break;
case 184:
this.$ = { min:0, max:UNBOUNDED } // t: 1cardStar;
break;
case 185:
this.$ = { min:1, max:UNBOUNDED } // t: 1cardPlus;
break;
case 186:
this.$ = { min:0, max:1 } // t: 1cardOpt;
break;
case 187:

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
case 188:
this.$ = { inverse: true } // t: 1inversedot;
break;
case 189:
this.$ = $$[$0-1] // t: 1val1IRIREF;
break;
case 190:
this.$ = [] // t: 1val1IRIREF;
break;
case 191:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1IRIREF;
break;
case 193:
this.$ = yy._termResolver.resolve($$[$0], yy._prefixes);
break;
case 197:
this.$ = [$$[$0]] // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 198:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 199:
this.$ = [$$[$0]] // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 200:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 201:
this.$ = [$$[$0]] // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 202:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 203:
this.$ = { type: "IriStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 204:
this.$ = { type: "LiteralStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 205:
this.$ = { type: "LanguageStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 206:

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
case 207:
this.$ = [] // t: 1val1iriStem, 1val1iriStemMinusiri3;
break;
case 208:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1iriStemMinusiri3;
break;
case 209:
this.$ = $$[$0] // t: 1val1iriStemMinusiri3;
break;
case 212:
this.$ = $$[$0] ? { type: "IriStem", stem: $$[$0-1] } /* t: 1val1iriStemMinusiriStem3 */ : $$[$0-1] // t: 1val1iriStemMinusiri3;
break;
case 215:

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
case 216:
this.$ = [] // t: 1val1literalStem, 1val1literalStemMinusliteral3;
break;
case 217:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1literalStemMinusliteral3;
break;
case 218:
this.$ = $$[$0] // t: 1val1literalStemMinusliteral3;
break;
case 221:
this.$ = $$[$0] ? { type: "LiteralStem", stem: $$[$0-1].value } /* t: 1val1literalStemMinusliteral3 */ : $$[$0-1].value // t: 1val1literalStemMinusliteralStem3;
break;
case 222:

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
case 223:

        this.$ = {  // t: @@
          type: $$[$0].length ? "LanguageStemRange" : "LanguageStem",
          stem: ""
        };
        if ($$[$0].length)
          this.$["exclusions"] = $$[$0]; // t: @@
      
break;
case 224:
this.$ = [] // t: 1val1languageStem, 1val1languageStemMinuslanguage3;
break;
case 225:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1languageStemMinuslanguage3;
break;
case 226:
this.$ = $$[$0] // t: 1val1languageStemMinuslanguage3;
break;
case 229:
this.$ = $$[$0] ? { type: "LanguageStem", stem: $$[$0-1] } /* t: 1val1languageStemMinuslanguageStem3 */ : $$[$0-1] // t: 1val1languageStemMinuslanguage3;
break;
case 230:
this.$ = yy.addSourceMap($$[$0]) // Inclusion // t: 2groupInclude1;
break;
case 231:
this.$ = { type: "Annotation", predicate: $$[$0-1], object: $$[$0] } // t: 1dotAnnotIRIREF;
break;
case 234:
this.$ = $$[$0].length ? { semActs: $$[$0] } : null // t: 1dotCode1/2oneOfDot;
break;
case 235:
this.$ = [] // t: 1dot, 1dotCode1;
break;
case 236:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotCode1;
break;
case 237:
this.$ = $$[$0] ? unescapeSemanticAction($$[$0-1], $$[$0]) /* t: 1dotCode1 */ : { type: "SemAct", name: $$[$0-1] } // t: 1dotNoCode1;
break;
case 244:
this.$ = RDF_TYPE // t: 1AvalA;
break;
case 250:
this.$ = createLiteral($$[$0], XSD_INTEGER) // t: 1val1INTEGER;
break;
case 251:
this.$ = createLiteral($$[$0], XSD_DECIMAL) // t: 1val1DECIMAL;
break;
case 252:
this.$ = createLiteral($$[$0], XSD_DOUBLE) // t: 1val1DOUBLE;
break;
case 254:
this.$ = $$[$0] ? extend($$[$0-1], { type: $$[$0] }) : $$[$0-1] // t: 1val1Datatype;
break;
case 258:
this.$ = { value: "true", type: XSD_BOOLEAN } // t: 1val1true;
break;
case 259:
this.$ = { value: "false", type: XSD_BOOLEAN } // t: 1val1false;
break;
case 260:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL2;
break;
case 261:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL1;
break;
case 262:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL_LONG2;
break;
case 263:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG1;
break;
case 264:
this.$ = unescapeLangString($$[$0], 1)	// t: @@;
break;
case 265:
this.$ = unescapeLangString($$[$0], 3)	// t: @@;
break;
case 266:
this.$ = unescapeLangString($$[$0], 1)	// t: 1val1LANGTAG;
break;
case 267:
this.$ = unescapeLangString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG2_with_LANGTAG;
break;
case 268:
 // t: 1dot
        const unesc = ShExUtil.unescapeText($$[$0].slice(1,-1), {});
        this.$ = yy._base === null || absoluteIRI.test(unesc) ? unesc : yy._resolveIRI(unesc)
      
break;
case 270:
 // t:1dotPNex, 1dotPNdefault, ShExParser-test.js/with pre-defined prefixes
        const namePos1 = $$[$0].indexOf(':');
        this.$ = yy.expandPrefix($$[$0].substr(0, namePos1), yy) + ShExUtil.unescapeText($$[$0].substr(namePos1 + 1), pnameEscapeReplacements);
      
break;
case 271: case 274:
 // t: 1dotNS2, 1dotNSdefault, ShExParser-test.js/PNAME_NS with pre-defined prefixes
        this.$ = yy.expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy);
      
break;
case 272:
this.$ = this._base === null || absoluteIRI.test($$[$0].slice(1, -1)) ? ShExUtil.unescapeText($$[$0].slice(1,-1), {}) : yy._resolveIRI(ShExUtil.unescapeText($$[$0].slice(1,-1), {})) // t: 1dot;
break;
case 273:
 // t:1dotPNex, 1dotPNdefault, ShExParser-test.js/with pre-defined prefixes
        const namePos2 = $$[$0].indexOf(':');
        this.$ = yy.expandPrefix($$[$0].substr(0, namePos2)) + $$[$0].substr(namePos2 + 1);
      
break;
case 275:

        this.$ = yy._termResolver.resolve($$[$0], yy._prefixes);
      
break;
case 277:
this.$ = $$[$0] // t: 0Extends1, 1dotExtends1, 1dot3ExtendsLN;
break;
case 283:
this.$ = shapeJunction("ShapeAnd", $$[$0-1], $$[$0]);
break;
case 287:
this.$ = $$[$0-1] ? { type: "ShapeNot", "shapeExpr": nonest($$[$0]) } : $$[$0];
break;
case 291:
this.$ = Object.assign($$[$0-1], {nested: true});
break;
case 292:
this.$ = yy.EmptyShape;
break;
case 295:
this.$ = $$[$0] // t: @_$[$0-1]dotSpecialize1, @_$[$0-1]dot3Specialize, @_$[$0-1]dotSpecialize3;
break;
        }
    }
}

// Export module
__webpack_unused_export__ = ({ value: true });
exports.Fm = ShExJisonParser;


/* generated by ts-jison-lex 0.3.0 */
const { JisonLexer } = __webpack_require__(2752);
class ShExJisonLexer extends JisonLexer {
    constructor (yy = {}) {
        super(yy);
        this.options = {"moduleName":"ShExJison"};
        this.rules = [/^(?:(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)?`([^\u0060\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*`))/,/^(?:\s+|(#[^\u000a\u000d]*|\/\*([^*]|\*([^/]|\\\/))*\*\/))/,/^(?:(@(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*))))/,/^(?:(@((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)))/,/^(?:(@([A-Za-z])+((-([0-9A-Za-z])+))*))/,/^(?:@)/,/^(?:(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*)))/,/^(?:(\{((([+-])?([0-9])+))((,(((([+-])?([0-9])+))|\*)?))?\}))/,/^(?:(([+-])?((([0-9])+\.([0-9])*(([Ee]([+-])?([0-9])+)))|((\.)?([0-9])+(([Ee]([+-])?([0-9])+))))))/,/^(?:(([+-])?([0-9])*\.([0-9])+))/,/^(?:(([+-])?([0-9])+))/,/^(?:{ANON})/,/^(?:(<([^\u0000-\u0020<>\"{}|^`\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*>))/,/^(?:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:))/,/^(?:a\b)/,/^(?:(\/([^\u002f\u005C\u000A\u000D]|\\[nrt\\|.?*+(){}$\u002D\u005B\u005D\u005E/]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))+\/[smix]*))/,/^(?:(_:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|[0-9])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?))/,/^(?:(\{([^%\\]|\\[%\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*%\}))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"))/,/^(?:([Bb][Aa][Ss][Ee]))/,/^(?:([Pp][Rr][Ee][Ff][Ii][Xx]))/,/^(?:([iI][mM][pP][oO][rR][tT]))/,/^(?:([Ll][Aa][Bb][Ee][Ll]))/,/^(?:([sS][tT][aA][rR][tT]))/,/^(?:([eE][xX][tT][eE][rR][nN][aA][lL]))/,/^(?:([Aa][Bb][Ss][Tt][Rr][Aa][Cc][Tt]))/,/^(?:([Rr][Ee][Ss][Tt][Rr][Ii][Cc][Tt][Ss]))/,/^(?:([Ee][Xx][Tt][Ee][Nn][Dd][Ss]))/,/^(?:([Cc][Ll][Oo][Ss][Ee][Dd]))/,/^(?:([Ee][Xx][Tt][Rr][Aa]))/,/^(?:([Ll][Ii][Tt][Ee][Rr][Aa][Ll]))/,/^(?:([Bb][Nn][Oo][Dd][Ee]))/,/^(?:([Ii][Rr][Ii]))/,/^(?:([Nn][Oo][Nn][Ll][Ii][Tt][Ee][Rr][Aa][Ll]))/,/^(?:([Aa][Nn][Dd]))/,/^(?:([Oo][Rr]))/,/^(?:([No][Oo][Tt]))/,/^(?:([Mm][Ii][Nn][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Ii][Nn][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Aa][Xx][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Aa][Xx][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Mm][Ii][Nn][Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Mm][Aa][Xx][Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Tt][Oo][Tt][Aa][Ll][Dd][Ii][Gg][Ii][Tt][Ss]))/,/^(?:([Ff][Rr][Aa][Cc][Tt][Ii][Oo][Nn][Dd][Ii][Gg][Ii][Tt][Ss]))/,/^(?:=)/,/^(?:\/\/)/,/^(?:\{)/,/^(?:\})/,/^(?:&)/,/^(?:\|\|)/,/^(?:\|)/,/^(?:,)/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?:\$)/,/^(?:!)/,/^(?:\^\^)/,/^(?:\^)/,/^(?:\.)/,/^(?:~)/,/^(?:;)/,/^(?:\*)/,/^(?:\+)/,/^(?:\?)/,/^(?:-)/,/^(?:%)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:$)/,/^(?:[a-zA-Z0-9_-]+)/,/^(?:.)/];
        this.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81],"inclusive":true}};
    }
    performAction (yy, yy_, $avoiding_name_collisions, YY_START) {
              let YYSTATE = YY_START;
            switch ($avoiding_name_collisions) {
    case 0:
  const iBacktick = yy_.yytext.indexOf('`');
  let prefix = null;
  if (iBacktick > 0) {
    prefix = yy_.yytext.substr(0, iBacktick-1);
    yy_.yytext = yy_.yytext.substr(iBacktick);
  }
  yy_.yytext = { prefix: prefix, label: unescapeString(yy_.yytext, 1) };
  return 170;

      break;
    case 1:/**/
      break;
    case 2:return 85;
      break;
    case 3:return 86;
      break;
    case 4: yy_.yytext = yy_.yytext.substr(1); return 190; 
      break;
    case 5:return 87;
      break;
    case 6:return 221;
      break;
    case 7:return 165;
      break;
    case 8:return 115;
      break;
    case 9:return 114;
      break;
    case 10:return 106;
      break;
    case 11:return 'ANON';
      break;
    case 12:return 20;
      break;
    case 13:return 22;
      break;
    case 14:return 205;
      break;
    case 15:return 107;
      break;
    case 16:return 222;
      break;
    case 17:return 201;
      break;
    case 18:return 217;
      break;
    case 19:return 219;
      break;
    case 20:return 216;
      break;
    case 21:return 218;
      break;
    case 22:return 213;
      break;
    case 23:return 215;
      break;
    case 24:return 212;
      break;
    case 25:return 214;
      break;
    case 26:return 19;
      break;
    case 27:return 21;
      break;
    case 28:return 24;
      break;
    case 29:return 25;
      break;
    case 30:return 32;
      break;
    case 31:return 46;
      break;
    case 32:return 42;
      break;
    case 33:return 235;
      break;
    case 34:return 233;
      break;
    case 35:return 131;
      break;
    case 36:return 133;
      break;
    case 37:return 91;
      break;
    case 38:return 103;
      break;
    case 39:return 102;
      break;
    case 40:return 104;
      break;
    case 41:return 59;
      break;
    case 42:return 57;
      break;
    case 43:return 50;
      break;
    case 44:return 118;
      break;
    case 45:return 119;
      break;
    case 46:return 120;
      break;
    case 47:return 121;
      break;
    case 48:return 108;
      break;
    case 49:return 109;
      break;
    case 50:return 110;
      break;
    case 51:return 122;
      break;
    case 52:return 123;
      break;
    case 53:return 33;
      break;
    case 54:return 195;
      break;
    case 55:return 125;
      break;
    case 56:return 127;
      break;
    case 57:return 194;
      break;
    case 58:return '||';
      break;
    case 59:return 141;
      break;
    case 60:return 146;
      break;
    case 61:return 75;
      break;
    case 62:return 76;
      break;
    case 63:return 28;
      break;
    case 64:return 29;
      break;
    case 65:return 154;
      break;
    case 66:return '!';
      break;
    case 67:return 117;
      break;
    case 68:return 166;
      break;
    case 69:return 77;
      break;
    case 70:return 183;
      break;
    case 71:return 147;
      break;
    case 72:return 162;
      break;
    case 73:return 163;
      break;
    case 74:return 164;
      break;
    case 75:return 184;
      break;
    case 76:return 199;
      break;
    case 77:return 210;
      break;
    case 78:return 211;
      break;
    case 79:return 7;
      break;
    case 80:return 'unexpected word "'+yy_.yytext+'"';
      break;
    case 81:return 'invalid character '+yy_.yytext;
      break;
        }
    }
}

// Export module
__webpack_unused_export__ = ({ value: true });
__webpack_unused_export__ = ShExJisonLexer;



/***/ }),

/***/ 931:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const ShExParserCjsModule = (function () {

const ShExTerm = __webpack_require__(1101);
const ShExJisonParser = (__webpack_require__(9509)/* .ShExJisonParser */ .Fm);

const schemeAuthority = /^(?:([a-z][a-z0-9+.-]*:))?(?:\/\/[^\/]*)?/i,
    dotSegments = /(?:^|\/)\.\.?(?:$|[\/#?])/;

class ShExCParserState {
  constructor () {
    this.blankId = 0;
    this._fileName = undefined; // for debugging
    this.EmptyObject = {  };
    this.EmptyShape = { type: "Shape" };
  }

  reset () {
    this._prefixes = this._imports = this._sourceMap = this.shapes = this.productions = this.start = this.startActs = null; // Reset state.
    this._base = this._baseIRI = this._baseIRIPath = this._baseIRIRoot = null;
    this._termResolver = null;
  }

  _setFileName (fn) { this._fileName = fn; }

  // Creates a new blank node identifier
  blank () {
    return '_:b' + this.blankId++;
  };
  _resetBlanks (value) { this.blankId = value === undefined ? 0 : value; }

  // N3.js:lib/N3Parser.js<0.4.5>:58 with
  //   s/this\./ShExJisonParser./g
  // ### `_setBase` sets the base IRI to resolve relative IRIs.
  _setBase (baseIRI) {
    if (!baseIRI)
      baseIRI = null;

    // baseIRI '#' check disabled to allow -x 'data:text/shex,...#'
    // else if (baseIRI.indexOf('#') >= 0)
    //   throw new Error('Invalid base IRI ' + baseIRI);

    // Set base IRI and its components
    if (this._base = baseIRI) {
      this._basePath   = baseIRI.replace(/[^\/?]*(?:\?.*)?$/, '');
      baseIRI = baseIRI.match(schemeAuthority);
      this._baseRoot   = baseIRI[0];
      this._baseScheme = baseIRI[1];
    }
  }

  // N3.js:lib/N3Parser.js<0.4.5>:576 with
  //   s/this\./ShExJisonParser./g
  //   s/token/iri/
  // ### `_resolveIRI` resolves a relative IRI token against the base path,
  // assuming that a base path has been set and that the IRI is indeed relative.
  _resolveIRI (iri) {
    switch (iri[0]) {
    // An empty relative IRI indicates the base IRI
    case undefined: return this._base;
    // Resolve relative fragment IRIs against the base IRI
    case '#': return this._base + iri;
    // Resolve relative query string IRIs by replacing the query string
    case '?': return this._base.replace(/(?:\?.*)?$/, iri);
    // Resolve root-relative IRIs at the root of the base IRI
    case '/':
      // Resolve scheme-relative IRIs to the scheme
      return (iri[1] === '/' ? this._baseScheme : this._baseRoot) + this._removeDotSegments(iri);
    // Resolve all other IRIs at the base IRI's path
    default: {
      return this._removeDotSegments(this._basePath + iri);
    }
    }
  }

  // ### `_removeDotSegments` resolves './' and '../' path segments in an IRI as per RFC3986.
  _removeDotSegments (iri) {
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

  _setTermResolver (res) {
    this._termResolver = res;
  }

  error (e) {
    const hash = {
      text: this.lexer.match,
      // token: this.terminals_[symbol] || symbol,
      line: this.lexer.yylineno,
      loc: this.lexer.yylloc,
      // expected: expected
      pos: this.lexer.showPosition()
    }
    e.hash = hash;
    if (this.recoverable) {
      this.recoverable(e)
    } else {
      throw e;
      this.reset();
    }
  }

  // Expand declared prefix or throw Error
  expandPrefix (prefix) {
    if (!(prefix in this._prefixes))
      this.error(new Error('Parse error; unknown prefix "' + prefix + ':"'));
    return this._prefixes[prefix];
  }

  // Add a shape to the map
  addShape (label, shape) {
    if (shape === this.EmptyShape)
      shape = { type: "Shape" };
    if (this.productions && label in this.productions)
      this.error(new Error("Structural error: "+label+" is a triple expression"));
    if (!this.shapes)
      this.shapes = {};
    if (label in this.shapes) {
      if (this.options.duplicateShape === "replace")
        this.shapes[label] = shape;
      else if (this.options.duplicateShape !== "ignore")
        this.error(new Error("Parse error: "+label+" already defined"));
    } else {
      this.shapes[label] = Object.assign({id: label}, shape);
    }
  }

  // Add a production to the map
  addProduction (label, production) {
    if (this.shapes && label in this.shapes)
      this.error(new Error("Structural error: "+label+" is a shape expression"));
    if (!this.productions)
      this.productions = {};
    if (label in this.productions) {
      if (this.options.duplicateShape === "replace")
        this.productions[label] = production;
      else if (this.options.duplicateShape !== "ignore")
        this.error(new Error("Parse error: "+label+" already defined"));
    } else
      this.productions[label] = production;
  }

  addSourceMap (obj) {
    if (!this._sourceMap)
      this._sourceMap = new Map();
    let list = this._sourceMap.get(obj)
    if (!list)
      this._sourceMap.set(obj, list = []);
    list.push(this.lexer.yylloc);
    return obj;
  }

}

// Creates a ShEx parser with the given pre-defined prefixes
const prepareParser = function (baseIRI, prefixes, schemaOptions) {
  schemaOptions = schemaOptions || {};
  // Create a copy of the prefixes
  const prefixesCopy = {};
  for (const prefix in prefixes || {})
    prefixesCopy[prefix] = prefixes[prefix];

  // Create a copy of the labelResolvers
  let termResolver = "termResolver" in schemaOptions ?
      schemaOptions.termResolver :
      makeDisabledTermResolver();

  // Create a new parser with the given prefixes
  // (Workaround for https://github.com/zaach/jison/issues/241)
  const parser = new ShExJisonParser(ShExCParserState);
  const oldParse = parser.parse;

  function runParser (input, base = baseIRI, options = schemaOptions, filename = null) {
    const parserState = globalThis.PS = new ShExCParserState();
    parserState._prefixes = Object.create(prefixesCopy);
    parserState._imports = [];
    parserState._setBase(base);
    parserState._setFileName(baseIRI);
    parserState.options = schemaOptions;
    parserState._termResolver = termResolver;
    let errors = [];
    parserState.recoverable = e =>
      errors.push(e);
    let ret = null;
    try {
      ret = oldParse.call(parser, input, parserState);
    } catch (e) {
      errors.push(e);
    }
    if ("meta" in options) {
      options.meta.base = parserState._base;
      options.meta.prefixes = parserState._prefixes;
    }
    parserState.reset();
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
    baseIRI = base;
  }
  parser._setTermResolver = (resolver) => { termResolver = resolver; }
  return parser;

  function contextError (e, lexer) {
    // use the lexer's pretty-printing
    const line = e.location.first_line;
    const col  = e.location.first_column + 1;
    const posStr = "pos" in e.hash ? "\n" + e.hash.pos : ""
    return `${baseIRI}\n line: ${line}, column: ${col}: ${e.message}${posStr}`;
  }
}

const makeDBTermResolver = function (db) {
  const _db = db;
  const _lookFor = [];
  return {
    add: function (iri) {
      _lookFor.push(iri);
    },
    resolve: function (pair, prefixes) {
      const x = _lookFor.reduce((lfacc, lf) => {
        const found1 = _db.getQuads(null, lf, '"' + pair.label.value + '"');
        if (found1.length)
          return pair.prefix === null ?
          {prefix: null, length: null, term: ShExTerm.rdfJsTerm2Ld(found1[0].subject)}:
          found1.reduce((tripacc, triple) => {
            const s = ShExTerm.rdfJsTerm2Ld(triple.subject);
            return Object.keys(prefixes).reduce((prefacc, prefix) => {
              const ns = prefixes[prefix];
              const sw = s.startsWith(ns);
              if (sw && ns.length > prefacc.length && pair.prefix === prefix)
                return {prefix: prefix, length: prefacc.length, term: s};
              return prefacc;
            }, tripacc);
          }, lfacc);
        else
          return lfacc;
      }, {prefix: null, length: 0, term: null});
      if (x.term)
        return x.term;
      throw Error("no term found for `" + JSON.stringify(pair) + "`");
    }
  };
}

const makeDisabledTermResolver = function () {
  return {
    add: function (iri) {
      throw Error("no term resolver to accept <" + iri + ">");
    },
    resolve: function (label, prefixes) {
      throw Error("no term resolver to resolve `" + label + "`");
    }
  };
}

return {
  construct: prepareParser,
  dbTermResolver: makeDBTermResolver,
  disabledTermResolver: makeDisabledTermResolver
};
})();

if (true)
  module.exports = ShExParserCjsModule;


/***/ }),

/***/ 1101:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/**
 * Terms used in ShEx.
 *
 * There are three representations of RDF terms used in ShEx NamedNode validation and applications:
 * 1. LD (short for JSON-LD) @ids used in ShExJ.
 *   "http://a.example/some/Iri
 *   "_:someBlankNode
 *   { "value": "1.0", "datatype": "http://www.w3.org/2001/XMLSchema#float" }
 *   { "value": "chat", "language": "fr" }
 * 2. RdfJs Terms [RdfJsTerm] specification used in validation
 *   { "termType": "NamedNode": "value": "http://a.example/some/Iri" }
 *   { "termType": "BlankNode": "value": "someBlankNode" }
 *   { "termType": "Literal": "value": "1.0", "datatype": "http://www.w3.org/2001/XMLSchema#float" }
 *   { "termType": "Literal": "value": "chat", "language": "fr" }
 * 3. Turtle representation is used for human interfaces
 *   <http://a.example/some/Iri>, p:IRI, p:, :
 *   _:someBlankNode, []
 *   "1.0"^^<http://www.w3.org/2001/XMLSchema#float>, "1.0"^^xsd:float, 1.0
 *   "chat"@fr
 *   "1.0"^^http://www.w3.org/2001/XMLSchema#float
 *
 * [RdfJsTerm](https://rdf.js.org/data-model-spec/#term-interface)
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.rdfJsTerm2Ld = exports.ld2RdfJsTerm = exports.shExJsTerm2Turtle = exports.rdfJsTerm2Turtle = exports.Terminals = exports.XsdString = exports.RdfLangString = void 0;
const RelativizeIri = (__webpack_require__(4436).relativize);
// import {relativize as RelativizeIri} from "relativize-url"; // someone should lecture the maintainer
const rdf_data_factory_1 = __webpack_require__(1194);
const RdfJsFactory = new rdf_data_factory_1.DataFactory();
exports.RdfLangString = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";
exports.XsdString = "http://www.w3.org/2001/XMLSchema#string";
const PN_CHARS_BASE = "A-Za-z\u{C0}-\u{D6}\u{D8}-\u{F6}\u{F8}-\u{2FF}\u{370}-\u{37D}\u{37F}-\u{1FFF}\u{200C}-\u{200D}\u{2070}-\u{218F}\u{2C00}-\u{2FEF}\u{3001}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFFD}"; // escape anything outside BMP: \u{10000}-\u{EFFFF}
const PN_CHARS_U = PN_CHARS_BASE + "_";
const PN_CHARS_WO_HYPHEN = PN_CHARS_U + "0-9\u{B7}\u{300}-\u{36F}\u{203F}-\u{2040}";
const PN_PREFIX = [PN_CHARS_BASE, PN_CHARS_WO_HYPHEN + '.-', PN_CHARS_WO_HYPHEN + '-'];
const PN_LOCAL = [
    PN_CHARS_U + ":0-9",
    PN_CHARS_WO_HYPHEN + ".:-",
    PN_CHARS_WO_HYPHEN + ":-"
];
exports.Terminals = {
    Turtle: {
        PN_CHARS_BASE,
        PN_CHARS_U,
        PN_CHARS_WO_HYPHEN,
        PN_PREFIX,
        PN_LOCAL,
    }
};
function rdfJsTerm2Turtle(node, meta) {
    switch (node.termType) {
        case ("NamedNode"):
            return iri2Turtle(node.value, meta);
        case ("BlankNode"):
            return "_:" + node.value;
        case ("Literal"):
            return "\"" + node.value.replace(/"/g, '\\"') + "\"" + (node.datatype.value === exports.RdfLangString
                ? "@" + node.language
                : node.datatype.value === exports.XsdString
                    ? ""
                    : "^^" + node.datatype.value);
        default: throw Error(`rdfJsTerm2Turtle: unknown RDFJS node type: ${JSON.stringify(node)}`);
    }
}
exports.rdfJsTerm2Turtle = rdfJsTerm2Turtle;
function shExJsTerm2Turtle(node, meta = { base: "", prefixes: {} }, aForType) {
    if (typeof node === "string") {
        if (node.startsWith("_:")) {
            return node;
        }
        else {
            return iri2Turtle(node, meta, aForType);
        }
    }
    else if (node.termType === "Literal") {
        let value = node.value;
        const type = node.datatype.value;
        const language = node.language;
        // Escape special characters
        if (escape.test(value))
            value = value.replace(escapeAll, characterReplacer);
        // Write the literal, possibly with type or language
        if (language)
            return '"' + value + '"@' + language;
        else if (type && type !== "http://www.w3.org/2001/XMLSchema#string")
            return '"' + value + '"^^' + iri2Turtle(type, meta, false);
        else
            return '"' + value + '"';
    }
    else {
        throw Error("Unknown internal term type: " + JSON.stringify(node));
    }
}
exports.shExJsTerm2Turtle = shExJsTerm2Turtle;
// Characters in literals that require escaping
const escape = /["\\\t\n\r\b\f\u0000-\u0019\ud800-\udbff]/;
const escapeAll = /["\\\t\n\r\b\f\u0000-\u0019]|[\ud800-\udbff][\udc00-\udfff]/g;
const escapeReplacements = {
    '\\': '\\\\', '"': '\\"', '\t': '\\t',
    '\n': '\\n', '\r': '\\r', '\b': '\\b', '\f': '\\f',
};
// Replaces a character by its escaped version
function characterReplacer(character) {
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
function ld2RdfJsTerm(ld) {
    switch (typeof ld) {
        case 'object':
            const copy = JSON.parse(JSON.stringify(ld));
            if (!copy.value)
                throw Error(`JSON-LD-style object literal has no value: ${JSON.stringify(ld)}`);
            const value = copy.value;
            delete copy.value;
            if (copy.language)
                return RdfJsFactory.literal(value, copy.language);
            if (copy.type)
                return RdfJsFactory.literal(value, RdfJsFactory.namedNode(copy.type));
            if (Object.keys(copy).length > 0)
                throw Error(`Unrecognized attributes inn JSON-LD-style object literal: ${JSON.stringify(Object.keys(copy))}`);
            return RdfJsFactory.literal(value);
        case 'string':
            return ld.startsWith('_:')
                ? RdfJsFactory.blankNode(ld.substr(2))
                : RdfJsFactory.namedNode(ld);
        default: throw Error(`Unrecognized JSON-LD-style term: ${JSON.stringify(ld)}`);
    }
}
exports.ld2RdfJsTerm = ld2RdfJsTerm;
function rdfJsTerm2Ld(term) {
    switch (term.termType) {
        case "NamedNode": return term.value;
        case "BlankNode": return "_:" + term.value;
        case "Literal":
            const ret = { value: term.value };
            const dt = term.datatype.value;
            const lang = term.language;
            if (dt &&
                dt !== "http://www.w3.org/2001/XMLSchema#string" &&
                dt !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString")
                ret.type = dt;
            if (lang)
                ret.language = lang;
            return ret;
        default:
            throw Error(`Unrecognized termType ${term.termType} ${term.value}`);
    }
}
exports.rdfJsTerm2Ld = rdfJsTerm2Ld;
function iri2Turtle(iri, meta = { base: "", prefixes: {} }, aForType = true) {
    const { base, prefixes = {} } = meta;
    if (aForType && iri === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
        return "a";
    const rel = "<" + (base.length > 0 ? RelativizeIri(iri, base) : iri) + ">";
    for (const prefix in prefixes) {
        const ns = prefixes[prefix];
        if (iri.startsWith(ns)) {
            const localName = iri.substr(ns.length);
            const first = localName.slice(0, 1).replaceAll(new RegExp("[^" + exports.Terminals.Turtle.PN_LOCAL[0] + "]", "g"), s => '\\' + s);
            const middle = localName.slice(1, localName.length - 1).replaceAll(new RegExp("[^" + exports.Terminals.Turtle.PN_LOCAL[1] + "]", "g"), s => '\\' + s);
            const last = localName.length > 1 ? localName.slice(localName.length - 1).replaceAll(new RegExp("[^" + exports.Terminals.Turtle.PN_LOCAL[2] + "]", "g"), s => '\\' + s) : '';
            const pName = prefix + ':' + first + middle + last;
            if (pName.length < rel.length)
                return pName;
        }
    }
    return rel;
}
//# sourceMappingURL=shex-term.js.map

/***/ }),

/***/ 7625:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const ShExHumanErrorWriterCjsModule = (function () {
const ShExTerm = __webpack_require__(1101);
const XSD = {}
XSD._namespace = "http://www.w3.org/2001/XMLSchema#";
["anyURI", "string"].forEach(p => {
  XSD[p] = XSD._namespace+p;
});

return class ShExHumanErrorWriter {
  write (val) {
    const _HumanErrorWriter = this;
    if (Array.isArray(val)) {
      return val.reduce((ret, e) => {
        const nested = _HumanErrorWriter.write(e).map(s => "  " + s);
        return ret.length ? ret.concat(["AND"]).concat(nested) : nested;
      }, []);
    }
    if (typeof val === "string")
      return [val];

    switch (val.type) {
    case "FailureList":
      return val.errors.reduce((ret, e) => {
        return ret.concat(_HumanErrorWriter.write(e));
      }, []);
    case "Failure":
      return ["validating " + val.node + " as " + val.shape + ":"].concat(errorList(val.errors).reduce((ret, e) => {
        const nested = _HumanErrorWriter.write(e).map(s => "  " + s);
        return ret.length > 0 ? ret.concat(["  OR"]).concat(nested) : nested.map(s => "  " + s);
      }, []));
    case "TypeMismatch": {
      const nested = Array.isArray(val.errors) ?
          val.errors.reduce((ret, e) => {
            return ret.concat((typeof e === "string" ? [e] : _HumanErrorWriter.write(e)).map(s => "  " + s));
          }, []) :
          "  " + (typeof e === "string" ? [val.errors] : _HumanErrorWriter.write(val.errors));
      return ["validating " + n3ify(val.triple.object) + ":"].concat(nested);
    }
    case "RestrictionError": {
      const nested = val.errors.constructor === Array ?
          val.errors.reduce((ret, e) => {
            return ret.concat((typeof e === "string" ? [e] : _HumanErrorWriter.write(e)).map(s => "  " + s));
          }, []) :
          "  " + (typeof e === "string" ? [val.errors] : _HumanErrorWriter.write(val.errors));
      return ["validating restrictions on " + n3ify(val.focus) + ":"].concat(nested);
    }
    case "ShapeAndFailure":
      return Array.isArray(val.errors) ?
          val.errors.reduce((ret, e) => {
            return ret.concat((typeof e === "string" ? [e] : _HumanErrorWriter.write(e)).map(s => "  " + s));
          }, []) :
          "  " + (typeof e === "string" ? [val.errors] : _HumanErrorWriter.write(val.errors));
    case "ShapeOrFailure":
      return Array.isArray(val.errors) ?
          val.errors.reduce((ret, e) => {
            return ret.concat(" OR " + (typeof e === "string" ? [e] : _HumanErrorWriter.write(e)));
          }, []) :
          " OR " + (typeof e === "string" ? [val.errors] : _HumanErrorWriter.write(val.errors));
    case "ShapeNotFailure":
      return ["Node " + val.errors.node + " expected to NOT pass " + val.errors.shape];
    case "ExcessTripleViolation":
      return ["validating " + n3ify(val.triple.object) + ": exceeds cardinality"];
    case "ClosedShapeViolation":
      return ["Unexpected triple(s): {"].concat(
        val.unexpectedTriples.map(t => {
          return "  " + t.subject + " " + t.predicate + " " + n3ify(t.object) + " ."
        })
      ).concat(["}"]);
    case "NodeConstraintViolation":
      return ["NodeConstraintError: expected to " + this.nodeConstraintToSimple(val.shapeExpr).join(', ')];
    case "MissingProperty":
      return ["Missing property: " + val.property];
    case "NegatedProperty":
      return ["Unexpected property: " + val.property];
    case "AbstractShapeFailure":
      return ["Abstract Shape: " + val.shape];
    case "SemActFailure": {
      const nested = Array.isArray(val.errors) ?
          val.errors.reduce((ret, e) => {
            return ret.concat((typeof e === "string" ? [e] : _HumanErrorWriter.write(e)).map(s => "  " + s));
          }, []) :
          "  " + (typeof e === "string" ? [val.errors] : _HumanErrorWriter.write(val.errors));
      return ["rejected by semantic action:"].concat(nested);
    }
    case "SemActViolation":
      return [val.message];
    default:
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
  }

  nodeConstraintToSimple (nc) {
    const elts = [];
    if ('nodeKind' in nc) elts.push(`be a ${nc.nodeKind.toUpperCase()}`);
    if ('datatype' in nc) elts.push(`have datatype ${nc.datatype}`);
    if ('length' in nc) elts.push(`have length ${nc.length}`);
    if ('minlength' in nc) elts.push(`have length at least ${nc.length}`);
    if ('maxlength' in nc) elts.push(`have length at most ${nc.length}`);
    if ('pattern' in nc) elts.push(`match regex /${nc.pattern}/${nc.flags ? nc.flags : ''}`);
    if ('mininclusive' in nc) elts.push(`have value at least ${nc.mininclusive}`);
    if ('minexclusive' in nc) elts.push(`have value more than ${nc.minexclusive}`);
    if ('maxinclusive' in nc) elts.push(`have value at most ${nc.maxinclusive}`);
    if ('maxexclusive' in nc) elts.push(`have value less than ${nc.maxexclusive}`);
    if ('totaldigits' in nc) elts.push(`have have ${nc.totaldigits} digits`);
    if ('fractiondigits' in nc) elts.push(`have have ${nc.fractiondigits} digits after the decimal`);
    if ('values' in nc) elts.push(`have a value in [${trim(this.valuesToSimple(nc.values).join(', '), 80, /[, ]^>/)}]`);
    return elts;
  }

  // static
  valuesToSimple (values) {
    return values.map(v => {
      // non stems
      /* IRIREF */ if (typeof v === 'string') return `<${v}>`;
      /* ObjectLiteral */ if ('value' in v) return this.objectLiteralToSimple(v);
      /* Language */ if (v.type === 'Language') return `literal with langauge tag ${v.languageTag}`;

      // stems and stem ranges
      const [undefined, type, range] = v.type.match(/^(Iri|Literal|Language)Stem(Range)?$/);
      let str = type.toLowerCase();

      if (typeof v.stem !== "object")
        str += ` starting with ${v.stem}`

      if ("exclusions" in v)
        str += ` excluding ${
v.exclusions.map(excl => typeof excl === "string"
 ? excl
 : "anything starting with " + excl.stem).join(' or ')
}`;

      return str;
    })
  }

  objectLiteralToSimple (v) {
    return `"${v}` +
      ('type' in v && v.type !== XSD.string ? `^^<${v.type}>` : '') +
      ('language' in v ? `@${v.language}` : '')
  }
}

function trim (str, desired, skip) {
  if (str.length <= desired)
    return str;
  --desired; // leave room for '…'
  while (desired > 0 && str[desired].match(skip))
    --desired;
  return str.slice(0, desired) + '…';
}

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

})()

if (true)
  module.exports = ShExHumanErrorWriterCjsModule; // node environment


/***/ }),

/***/ 9443:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// **ShExUtil** provides ShEx utility functions

const ShExUtilCjsModule = (function () {
const ShExTerm = __webpack_require__(1101);
const {Visitor, index} = __webpack_require__(8806)
const Hierarchy = __webpack_require__(2515)
const ShExHumanErrorWriter = __webpack_require__(7625)

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

  function isShapeRef (expr) {
    return typeof expr === "string" // test for JSON-LD @ID
  }

  let isInclusion = isShapeRef;

const ShExUtil = {

  SX: SX,
  RDF: RDF,
  version: function () {
    return "0.5.0";
  },

  Visitor: Visitor,
  index: index,


  /* getAST - compile a traditional regular expression abstract syntax tree.
   * Tested but not used at present.
   */
  getAST: function (schema) {
    return {
      type: "AST",
      shapes: schema.shapes.reduce(function (ret, shape) {
        ret[shape.id] = {
          type: "ASTshape",
          expression: _compileShapeToAST(shape.shapeExpr.expression, [], schema)
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
    const knownTripleExpressions = {};
    const oldVisitShapeExpr = v.visitShapeExpr,
        oldVisitValueExpr = v.visitValueExpr,
        oldVisitTripleExpr = v.visitTripleExpr;
    v.keepShapeExpr = oldVisitShapeExpr;

    v.visitShapeExpr = function (expr, ...args) {
      if (typeof expr === "string")
        return expr;
      if ("id" in expr) {
        if (knownShapeExprs.has(expr.id) || Object.keys(expr).length === 1) {
          const already = knownShapeExprs.get(expr.id);
          if (typeof expr.expression === "object") {
            if (!already)
              knownShapeExprs.set(expr.id, oldVisitShapeExpr.call(this, expr, label));
          }
          return expr.id;
        }
        delete expr.id;
      }
      return oldVisitShapeExpr.call(this, expr, ...args);
    };

    v.visitTripleExpr = function (expr, ...args) {
      if (typeof expr === "string") { // shortcut for recursive references e.g. 1Include1 and ../doc/TODO.md
        return expr;
      } else if ("id" in expr) {
        if (expr.id in knownTripleExpressions) {
          knownTripleExpressions[expr.id].refCount++;
          return expr.id;
        }
      }
      const ret = oldVisitTripleExpr.call(this, expr, ...args);
      // Everything from RDF has an ID, usually a BNode.
      knownTripleExpressions[expr.id] = { refCount: 1, expr: ret };
      return ret;
    }

    v.cleanIds = function () {
      for (let k in knownTripleExpressions) {
        const known = knownTripleExpressions[k];
        if (known.refCount === 1 && known.expr.id.startsWith("_:"))
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
    const knownShapeExprs = new Map();
    if ("shapes" in schema)
      schema.shapes.forEach(sh => knownShapeExprs.set(sh.id, null))

    // normalize references to those shapeExprs
    const v = this.ShExRVisitor(knownShapeExprs);
    if ("start" in schema)
      schema.start = v.visitShapeExpr(schema.start);
    if ("shapes" in schema)
      schema.shapes = schema.shapes.map(sh => v.visitShapeDecl(sh));

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

  valToN3js: function (res, factory) {
    return this.valGrep(res, "TestedTriple", function (t) {
      const ret = JSON.parse(JSON.stringify(t));
      if (typeof t.object === "object")
        ret.object = ("\"" + t.object.value + "\"" + (
          "type" in t.object ? "^^" + t.object.type :
            "language" in t.object ? "@" + t.object.language :
            ""
        ));
      return ret;
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
    const oldVisitInclusion = v.visitInclusion, oldVisitTripleExpr = v.visitTripleExpr, oldVisitExtra = v.visitExtra;
    v.visitInclusion = function (inclusion) {
      if (knownExpressions.indexOf(inclusion) === -1 &&
          inclusion in index.tripleExprs) {
        knownExpressions.push(inclusion)
        return oldVisitTripleExpr.call(v, index.tripleExprs[inclusion]);
      }
      return oldVisitInclusion.call(v, inclusion);
    };
    v.visitTripleExpr = function (expression) {
      if (typeof expression === "object" && "id" in expression) {
        if (knownExpressions.indexOf(expression.id) === -1) {
          knownExpressions.push(expression.id)
          return oldVisitTripleExpr.call(v, index.tripleExprs[expression.id]);
        }
        return expression.id; // Inclusion
      }
      return oldVisitTripleExpr.call(v, expression);
    };
    v.visitExtra = function (l) {
      return l.slice().sort();
    }
    if (trimIRI) {
      v.visitIRI = function (i) {
        return i.replace(trimIRI, "");
      }
      if ("imports" in ret)
        ret.imports = v.visitImports(ret.imports);
    }
    if ("shapes" in ret) {
      ret.shapes = Object.keys(index.shapeExprs).map(k => {
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
      const shape = index.shapeExprs[label].shapeExpr
      noteReference(label, null) // just note the shape so we have a complete list at the end
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
        && index.shapeExprs[label].shapeExpr.type === 'Shape' // Don't nest e.g. valuesets for now. @@ needs an option
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
          const borged = index.shapeExprs[oldName].shapeExpr
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
      let shapeExpr = schema.shapes[label].shapeExpr
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
      let shapeExpr = schema.shapes[shapeLabel].shapeExpr
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
    (schema.shapes || []).forEach(function (shapeDecl) {
      function _walkShapeExpression (shapeExpr, negated) {
        if (typeof shapeExpr === "string") { // ShapeRef
          ret.add(shapeDecl.id, shapeExpr);
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
            if (negated && ret.inCycle.indexOf(shapeDecl.id) !== -1) // illDefined/negatedRefCycle.err
              throw Error("Structural error: " + shapeDecl.id + " appears in negated cycle");
          }

          if (typeof tripleExpr === "string") { // Inclusion
            ret.add(shapeDecl.id, tripleExpr);
          } else {
            if ("id" in tripleExpr)
              ret.addIn(tripleExpr.id, shapeDecl.id)
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
            ret.add(shapeDecl.id, i);
          });
        })
        if (shape.expression)
          _walkTripleExpression(shape.expression, negated);
      }
      _walkShapeExpression(shapeDecl.shapeExpr, 0); // 0 means false for bitwise XOR
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
  merge: function (left, right, collision = 'throw', inPlace) {
    const overwrite =
          collision === 'left'
          ? () => false
          : collision === 'right'
          ? () => true
          : typeof collision === 'function'
          ? collision
          : (type, left, right) => {
            throw Error(`${type} ${JSON.stringify(right, null, 2)} collides with ${JSON.stringify(left, null, 2)}`);
          };
    const ret = inPlace ? left : this.emptySchema();

    function mergeArray (attr) {
      Object.keys(left[attr] || {}).forEach(function (key) {
        if (!(attr in ret))
          ret[attr] = {};
        ret[attr][key] = left[attr][key];
      });
      Object.keys(right[attr] || {}).forEach(function (key) {
        if (!(attr  in left) || !(key in left[attr]) || overwrite(attr, ret[attr][key], right[attr][key])) {
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
        if (!(attr  in left) || !(left[attr].has(key)) || overwrite(attr, ret[attr].get(key), right[attr].get(key))) {
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
      if (!("_base" in left)/* || overwrite('_base', ret._base, right._base)*/) // _base favors the left
        ret._base = right._base;

    mergeArray("_prefixes");

    mergeMap("_sourceMap");

    if ("imports" in right)
      if (!("imports" in left)) {
        ret.imports = right.imports;
      } else {
        [].push.apply(ret.imports, right.imports.filter(
          mprt => ret.imports.indexOf(mprt) === -1
        ))
      }

    // startActs
    if ("startActs" in left)
      ret.startActs = left.startActs;
    if ("startActs" in right)
      if (!("startActs" in left) || overwrite('startActs', ret.startActs, right.startActs))
        ret.startActs = right.startActs;

    // start
    if ("start" in left)
      ret.start = left.start;
    if ("start" in right)
      if (!("start" in left) || overwrite('start', ret.start, right.start))
        ret.start = right.start;

    const lindex = left._index || this.index(left);

    // shapes
    if (!inPlace)
      (left.shapes || []).forEach(function (lshape) {
        if (!("shapes" in ret))
          ret.shapes = [];
        ret.shapes.push(lshape);
      });
    (right.shapes || []).forEach(function (rshape) {
      if (!("shapes" in ret)) {
        ret.shapes = [];
        ret.shapes.push(rshape)
        lindex.shapeExprs[rshape.id] = rshape;
      } else {
        const previousDecl = lindex.shapeExprs[rshape.id];
        if (!previousDecl) {
          ret.shapes.push(rshape)
        } else if (overwrite('shapeDecl', previousDecl, rshape)) {
          ret.shapes.splice(ret.shapes.indexOf(previousDecl), 1);
          lindex.shapeExprs[rshape.id] = rshape;
          ret.shapes.push(rshape)
        }
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
          (typeof obj[k] === "string" && !obj[k].startsWith("_:"))) { // !! needs ShExTerm.ldTermIsIri
        obj[k] = new URL(obj[k], base).href;
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
          const subject = ShExTerm.ld2RdfJsTerm(s.subject);
          const predicate = ShExTerm.ld2RdfJsTerm(s.predicate);
          const object = ShExTerm.ld2RdfJsTerm(s.object);
          const graph = "graph" in s ? ShExTerm.ld2RdfJsTerm(s.graph) : dataFactory.defaultGraph();
          db.addQuad(dataFactory.quad(subject, predicate, object, graph));
          if ("referenced" in s) {
            _dive1(s.referenced);
          }
        });
      } else if (solns.type === "ExtendedResults") {
        _dive1(solns.extensions);
        if ("local" in solns)
          _dive1(solns.local);        
      } else if (["ShapeNotResults", "Recursion"].indexOf(solns.type) !== -1) {
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

    visitor.visitShape = function (shape, ...args) {
      const lastExtra = currentExtra;
      currentExtra = shape.extra;
      const ret = oldVisitShape.call(visitor, shape, ...args);
      currentExtra = lastExtra;
      return ret;
    }

    const oldVisitShapeNot = visitor.visitShapeNot;
    visitor.visitShapeNot = function (shapeNot, ...args) {
      const lastNegated = currentNegated;
      currentNegated ^= true;
      const ret = oldVisitShapeNot.call(visitor, shapeNot, ...args);
      currentNegated = lastNegated;
      return ret;
    }

    const oldVisitTripleConstraint = visitor.visitTripleConstraint;
    visitor.visitTripleConstraint = function (expr, ...args) {
      const lastNegated = currentNegated;
      if (currentExtra && currentExtra.indexOf(expr.predicate) !== -1)
        currentNegated ^= true;
      inTE = true;
      const ret = oldVisitTripleConstraint.call(visitor, expr, ...args);
      inTE = false;
      currentNegated = lastNegated;
      return ret;
    };

    const oldVisitShapeRef = visitor.visitShapeRef;
    visitor.visitShapeRef = function (shapeRef, ...args) {
      if (!(shapeRef in index.shapeExprs))
        throw firstError(Error("Structural error: reference to " + JSON.stringify(shapeRef) + " not found in schema shape expressions:\n" + dumpKeys(index.shapeExprs) + "."), shapeRef);
      if (!inTE && shapeRef === currentLabel)
        throw firstError(Error("Structural error: circular reference to " + currentLabel + "."), shapeRef);
      (currentNegated ? negativeDeps : positiveDeps).add(currentLabel, shapeRef)
      return oldVisitShapeRef.call(visitor, shapeRef, ...args);
    }

    const oldVisitInclusion = visitor.visitInclusion;
    visitor.visitInclusion = function (inclusion, ...args) {
      let refd;
      if (!(refd = index.tripleExprs[inclusion]))
        throw firstError(Error("Structural error: included shape " + inclusion + " not found in schema triple expressions:\n" + dumpKeys(index.tripleExprs) + "."), inclusion);
      // if (refd.type !== "Shape")
      //   throw Error("Structural error: " + inclusion + " is not a simple shape.");
      return oldVisitInclusion.call(visitor, inclusion, ...args);
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
    }
    switch (val.type) {
    case "SolutionList": // dependent_shape
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
    case "NodeConstraintTest": // 1iri_pass-iri
      return _ShExUtil.walkVal(val.shapeExpr, cb);
    case "NodeConstraint": // 1iri_pass-iri
      return null;
    case "ShapeTest": // 0_empty
      const vals = [];
      visitSolution(val, vals); // A ShapeTest is a sort of Solution.
      const ret = vals.length
            ? {'http://shex.io/reflex': vals}
            : {};
      if ("solution" in val)
        Object.assign(ret, _ShExUtil.walkVal(val.solution, cb))
      return Object.keys(ret).length ? ret : null;
    case "Shape": // 1NOTNOTdot_passIv1
      return null;
    case "ShapeNotTest": // 1NOT_vsANDvs__passIv1
      return _ShExUtil.walkVal(val.shapeExpr, cb);
    case "ShapeNotResults": // NOT1dotOR2dot_pass-empty
      return null; // we don't bind variables from negative tests
    case "Failure": // NOT1dotOR2dot_pass-empty
      return null; // !!TODO
    case "ShapeNot": // 1NOTNOTIRI_passIo1,
      return _ShExUtil.walkVal(val.shapeExpr, cb);
    case "ShapeOrResults": // 1dotRefOR3_passShape1
      return _ShExUtil.walkVal(val.solution, cb);
    case "ShapeOr": // 1NOT_literalORvs__passIo1
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
    case "ShapeAndResults": // 1iriRef1_pass-iri
    case "ExtensionResults": // extends-abstract-multi-empty_pass-missingOptRef1
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
    case "ShapeAnd": // 1NOT_literalANDvs__passIv1
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
    case "ExtendedResults": // extends-abstract-multi-empty_pass-missingOptRef1
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
    case "EachOfSolutions":
    case "OneOfSolutions":
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
    case "TripleConstraintSolutions": // 1dot_pass-noOthers
      if ("solutions" in val) {
        const ret = {};
        const vals = [];
        ret[val.predicate] = vals;
        val.solutions.forEach(sln => visitSolution(sln, vals));
        return vals.length ? ret : null;
      } else {
        return null;
      }
    case "Recursion": // 3circRefPlus1_pass-recursiveData
      return null;
    default:
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
          crushed[k] = elt[k];
        }
        return elt;
      }
      for (let k in obj) {
        if (k === "extensions") {
          if (obj[k])
            list.push(crush(obj[k][lookfor]));
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

  /**
   * Convert a ShExR property tree to ShexJ.
   * A schema like:
   *   <Schema> a :Schema; :shapes (<#S1> <#S2>).
   *   <#S1> a :ShapeDecl; :shapeExpr [ a :ShapeNot; :shapeExpr <#S2> ].
   *   <#S2> a :ShapeDecl; :shapeExpr [ a :Shape; :expression [ a :TripleConstraint; :predicate <#p3> ] ].
   * will parse into a property tree with <#S2> duplicated inside <#S1>:
   *   {  "rdf:type": [ { "ldterm": ":Schema" } ], ":shapes": [
   *       { "ldterm": "#S1", "nested": {
   *           "rdf:type": [ { "ldterm": ":ShapeDecl" } ], ":shapeExpr": [
   *             { "ldterm": "_:b41", "nested": {
   *                  "rdf:type": [ { "ldterm": ":ShapeNot" } ], ":shapeExpr": [
   *                   { "ldterm": "#S2", "nested": {
   *                        "rdf:type": [ { "ldterm": ":ShapeDecl" } ], ":shapeExpr": [
   *                         { "ldterm": "_:b42", "nested": {
   *                              "rdf:type": [ { "ldterm": ":Shape" } ], ":expression": [
   *                               { "ldterm": "_:b43", "nested": {
   *                                    "rdf:type": [ { "ldterm": ":TripleConstraint" } ], ":predicate": [ { "ldterm": "#p3" } ] } }
   *                             ] } }
   *                       ] } }
   *                 ] } }
   *           ] } },
   *       { "ldterm": "#S2", "nested": {
   *            "rdf:type": [ { "ldterm": ":ShapeDecl" } ], ":shapeExpr": [
   *             { "ldterm": "_:b42", "nested": {
   *                  "rdf:type": [ { "ldterm": ":Shape" } ], ":expression": [
   *                   { "ldterm": "_:b43", "nested": {
   *                        "rdf:type": [ { "ldterm": ":TripleConstraint" } ], ":predicate": [ { "ldterm": "#p3" } ] } }
   *                 ] } }
   *           ] } }
   *     ] }
   * This method de-duplicates and normalizes all moves all ShapeDecls to be immediate children of the :shapes collection.
   * @exports
   * @returns ShEx schema
   */
  valuesToSchema: function (values) {
    // console.log(JSON.stringify(values, null, "  "));
    const v = values;
    const t = values[RDF.type][0].ldterm;
    if (t === SX.Schema) {
      /* Schema { "@context":"http://www.w3.org/ns/shex.jsonld"
       *           startActs:[SemAct+]? start:(shapeDeclOrExpr|labeledShapeExpr)?
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
        ret.start = extend({id: values[SX.start][0].ldterm}, shapeDeclOrExpr(values[SX.start][0].nested));
      const shapes = values[SX.shapes];
      if (shapes) {
        ret.shapes = shapes.map(v => {
          var t = v.nested[RDF.type][0].ldterm;
          const obj = shapeDeclOrExpr(v.nested)
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
    /* transform ShapeDecls and shapeExprs. called from .shapes and .valueExpr.
     * The calls from .valueExpr can be Shapes or ShapeDecls because the ShExR graph is not yet normalized.
     */
    function shapeDeclOrExpr (v) {
      // <#shapeDeclOrExpr> @<#ShapeDecl> OR @<#shapeExpr>
      // shapeExpr = ShapeOr | ShapeAnd | ShapeNot | NodeConstraint | Shape | ShapeRef | ShapeExternal;
      const elts = { "ShapeAnd"     : { nary: true , expr: true , prop: "shapeExprs" },
                   "ShapeOr"      : { nary: true , expr: true , prop: "shapeExprs" },
                   "ShapeNot"     : { nary: false, expr: true , prop: "shapeExpr"  },
                   "ShapeRef"     : { nary: false, expr: false, prop: "reference"  },
                   "ShapeExternal": { nary: false, expr: false, prop: null         } };
      let ret = findType(v, elts, shapeDeclOrExpr);
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
            extend({id: v[SX.shapeExpr][0].ldterm}, shapeDeclOrExpr(v[SX.shapeExpr][0].nested)) :
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
        throw Error("unknown shapeDeclOrExpr type in " + JSON.stringify(v));
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
          ret.valueExpr = extend({id: v[SX.valueExpr][0].ldterm}, "nested" in v[SX.valueExpr][0] ? shapeDeclOrExpr(v[SX.valueExpr][0].nested) : {});
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
        node: new URL(elt.node, base).href,
        shape: new URL(elt.shape, base).href
      });
    });
  },

  errsToSimple: function (val) {
    return new ShExHumanErrorWriter().write(val);
  },

  // static
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
        return quoted + "^^" + new URL(rel, meta.base).href;
      return quoted;
    }
    if (!meta)
      return known(passedValue) ? passedValue : this.UnknownIRI;
    const relIRI = passedValue[0] === "<" && passedValue[passedValue.length-1] === ">";
    if (relIRI)
      passedValue = passedValue.substr(1, passedValue.length-2);
    const t = new URL(passedValue, meta.base || "").href; // fall back to base-less mode
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
        if (!(sel in row))
          return null;
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

/***/ 7403:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* ShExValidator - javascript module to validate a graph with respect to Shape Expressions
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShExValidator = exports.resultMapToShapeExprTest = exports.InterfaceOptions = void 0;
// interface constants
const ShExTerm = __importStar(__webpack_require__(1101));
const term_1 = __webpack_require__(1101);
const eval_validator_api_1 = __webpack_require__(3530);
const Hierarchy = __importStar(__webpack_require__(2515));
const neighborhood_api_1 = __webpack_require__(3486);
const shex_xsd_1 = __webpack_require__(8994);
const visitor_1 = __webpack_require__(8806);
exports.InterfaceOptions = {
    "coverage": {
        "firstError": "fail on first error (usually used with eval-simple-1err)",
        "exhaustive": "find as many errors as possible (usually used with eval-threaded-nerr)"
    }
};
const VERBOSE = false; // "VERBOSE" in process.env;
const EvalThreadedNErr = (__webpack_require__(6201)/* .RegexpModule */ .G);
class SemActDispatcherImpl {
    constructor(externalCode) {
        this.handlers = {};
        this.results = {};
        this.externalCode = externalCode || {};
    }
    /**
     * Store a semantic action handler.
     *
     * @param {string} name - semantic action's URL.
     * @param {SemActHandler} handler - handler function.
     *
     * The handler object has a dispatch function is invoked with:
     *   code: string - text of the semantic action.
     *   ctx: object - matched triple or results subset.
     *   extensionStorage: object - place where the extension writes into the result structure.
     *   return :bool - false if the extension failed or did not accept the ctx object.
     */
    register(name, handler) {
        this.handlers[name] = handler;
    }
    /**
     * Calls all semantic actions, allowing each to write to resultsArtifact.
     *
     * @param {ShExJ.SemAct[]} semActs - list of semantic actions to invoke.
     * @param {any} semActParm - evaluation context for SemAct.
     * @param {any} resultsArtifact - simple storage for SemAct.
     * @return {SemActFailure[]} false if any result was false.
     */
    dispatchAll(semActs, semActParm, resultsArtifact) {
        return semActs.reduce((ret, semAct) => {
            if (ret.length === 0 && semAct.name in this.handlers) {
                const code = ("code" in semAct ? semAct.code : this.externalCode[semAct.name]) || null;
                const existing = "extensions" in resultsArtifact && semAct.name in resultsArtifact.extensions;
                const extensionStorage = existing ? resultsArtifact.extensions[semAct.name] : {};
                const response = this.handlers[semAct.name].dispatch(code, semActParm, extensionStorage);
                if (typeof response === 'object' && Array.isArray(response)) {
                    if (response.length > 0)
                        ret.push({ type: "SemActFailure", errors: response });
                }
                else {
                    throw Error("unsupported response from semantic action handler: " + JSON.stringify(response));
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
}
/**
 * A QueryTracker that's all no-ops.
 */
class EmptyTracker {
    constructor() {
        this.depth = 0;
    }
    recurse(_rec) { }
    known(_res) { }
    enter(_term, _shapeLabel) { ++this.depth; }
    exit(_term, _shapeLabel, _res) { --this.depth; }
}
class ShapeExprValidationContext {
    constructor(parent, label, // Can only be Start if it's the root of a context list.
    depth, tracker, seen, matchTarget, subGraph) {
        this.parent = parent;
        this.label = label;
        this.depth = depth;
        this.tracker = tracker;
        this.seen = seen;
        this.matchTarget = matchTarget;
        this.subGraph = subGraph;
    }
    checkShapeLabel(label) {
        return new ShapeExprValidationContext(this, label, this.depth + 1, this.tracker, this.seen, this.matchTarget, this.subGraph);
    }
    followTripleConstraint() {
        return new ShapeExprValidationContext(this, this.label, this.depth + 1, this.tracker, this.seen, this.matchTarget, null);
    }
    checkExtendsPartition(subGraph) {
        return new ShapeExprValidationContext(this, this.label, this.depth + 1, this.tracker, this.seen, this.matchTarget, subGraph);
    }
    checkExtendingClass(label, matchTarget) {
        return new ShapeExprValidationContext(this, label, this.depth + 1, this.tracker, this.seen, matchTarget, this.subGraph);
    }
}
class MapMap {
    constructor() {
        this.data = new Map();
    }
    set(a, b, t) {
        if (!this.data.has(a)) {
            this.data.set(a, new Map());
        }
        if (this.data.get(a).has(b)) {
            throw Error(`Error setting [${a}][${b}]=${t}; already has value ${this.data.get(a).get(b)}`);
        }
        this.data.get(a).set(b, t);
    }
    get(a, b) {
        return this.data.get(a).get(b);
    }
}
class TriplesMatching {
    constructor(hits, misses) {
        this.hits = hits;
        this.misses = misses;
    }
}
class TriplesMatchingResult {
    constructor(triple, sub) {
        this.triple = triple;
        this.sub = sub;
    }
}
class TriplesMatchingHit extends TriplesMatchingResult {
}
class TriplesMatchingNoValueConstraint extends TriplesMatchingResult {
    constructor(triple) {
        super(triple, undefined); // TODO: could weaken typing on the hits, but also weakens the misses
    }
}
class TriplesMatchingMiss extends TriplesMatchingResult {
}
/**
 * Convert a ResultMap to a shapeExprTest by examining each shape association.
 * TODO: migrate to ShExUtil when ShExUtil is TS-ified
 * @param resultsMap - SolutionList or FailureList depending on whether resultsMap had some errors.
 */
function resultMapToShapeExprTest(resultsMap) {
    const passFails = resultsMap.reduce((ret, pair) => {
        const res = pair.appinfo;
        return "errors" in res
            ? { passes: ret.passes, failures: ret.failures.concat([res]) }
            : { passes: ret.passes.concat([res]), failures: ret.failures };
    }, { passes: [], failures: [] });
    if (passFails.failures.length > 0) {
        return passFails.failures.length !== 1
            ? { type: "FailureList", errors: passFails.failures }
            : passFails.failures[0];
    }
    else {
        return passFails.passes.length !== 1
            ? { type: "SolutionList", solutions: passFails.passes }
            : passFails.passes[0];
    }
}
exports.resultMapToShapeExprTest = resultMapToShapeExprTest;
/** Directly construct a DB from triples.
 * TODO: should this be in @shexjs/neighborhood-something ?
 */
class TrivialNeighborhood {
    constructor(queryTracker) {
        this.incoming = [];
        this.outgoing = [];
        this.queryTracker = queryTracker;
    }
    getTriplesByIRI(s, p, o, _g) {
        return this.incoming.concat(this.outgoing).filter(t => (!s || s === t.subject) &&
            (!p || p === t.predicate) &&
            (!o || o === t.object));
    }
    getNeighborhood(_point, _shapeLabel, _shape) {
        return {
            outgoing: this.outgoing,
            incoming: this.incoming
        };
    }
    getSubjects() { throw Error("!Triples DB can't index subjects"); }
    getPredicates() { throw Error("!Triples DB can't index predicates"); }
    getObjects() { throw Error("!Triples DB can't index objects"); }
    getQuads() { throw Error("!Triples DB doesn't have Quads"); }
    get size() { return this.incoming.length + this.outgoing.length; }
    addIncomingTriples(tz) { Array.prototype.push.apply(this.incoming, tz); }
    addOutgoingTriples(tz) { Array.prototype.push.apply(this.outgoing, tz); }
}
class ShExValidator {
    /* ShExValidator - construct an object for validating a schema.
     *
     * schema: a structure produced by a ShEx parser or equivalent.
     * options: object with controls for
     *   lax(true): boolean: whine about missing types in schema.
     *   diagnose(false): boolean: make validate return a structure with errors.
     */
    constructor(schema, db, options = {}) {
        const index = schema._index || (0, visitor_1.index)(schema);
        if (index.labelToTcs === undefined) // make sure there's a labelToTcs in the index
            index.labelToTcs = {};
        this.index = index;
        options = options || {};
        this.options = options;
        this.known = {};
        this.schema = schema;
        this.db = db;
        // const regexModule = this.options.regexModule || require("@shexjs/eval-simple-1err");
        this.regexModule = this.options.regexModule || EvalThreadedNErr;
        this.semActHandler = new SemActDispatcherImpl(options.semActs);
    }
    /**
     * Validate each entry in a fixed ShapeMap, returning a results ShapeMap
     *
     * @param shapeMap - list of node/shape pairs to validate
     * @param tracker - optional implementation of QueryTracker to log validation
     * @param seen - optional (and discouraged) list of currently-visited node/shape associations -- may be useful for rare wizardry.
     */
    validateShapeMap(shapeMap, tracker = new EmptyTracker(), seen = {}) {
        return shapeMap.map(pair => {
            // let time = +new Date();
            const res = this.validateNodeShapePair(ShExTerm.ld2RdfJsTerm(pair.node), pair.shape, tracker, seen);
            // time = +new Date() - time;
            return {
                node: pair.node,
                shape: pair.shape,
                status: "errors" in res ? "nonconformant" : "conformant",
                appinfo: res,
                // elapsed: time
            };
        });
    }
    /**
     * Validate a single node as a labeled shape expression or as the Start shape
     *
     * @param focus - RdfJs Term to validate
     * @param labelOrStart - label of shapeExpr to validate focus against, or `ShExValidator.Start`.
     * @param tracker - optional implementation of QueryTracker to log validation
     * @param seen - optional (and discouraged) list of currently-visited node/shape associations -- may be useful for rare wizardry.
     */
    validateNodeShapePair(focus, labelOrStart, tracker = new EmptyTracker(), seen = {}) {
        const ctx = new ShapeExprValidationContext(null, labelOrStart, 0, tracker, seen, null, null);
        if ("startActs" in this.schema) {
            const startActionStorage = {}; // !!! need test to see this write to results structure.
            const semActErrors = this.semActHandler.dispatchAll(this.schema.startActs, null, startActionStorage);
            if (semActErrors.length)
                return {
                    type: "Failure",
                    node: (0, term_1.rdfJsTerm2Ld)(focus),
                    shape: ctx.label,
                    errors: semActErrors
                }; // some semAct aborted !! return a better error
        }
        const ret = this.validateShapeLabel(focus, ctx);
        if ("startActs" in this.schema) {
            ret.startActs = this.schema.startActs;
        }
        return ret;
    }
    validateShapeLabel(focus, ctx) {
        if (typeof ctx.label !== "string") {
            if (ctx.label !== ShExValidator.Start)
                runtimeError(`unknown shape ctx.label ${JSON.stringify(ctx.label)}`);
            if (!this.schema.start)
                runtimeError("start production not defined");
            return this.validateShapeExpr(focus, this.schema.start, ctx);
        }
        const seenKey = ShExTerm.rdfJsTerm2Turtle(focus) + "@" + ctx.label;
        if (!ctx.subGraph) { // Don't cache base shape validations as they aren't testing the full neighborhood.
            if (seenKey in ctx.seen) {
                let ret = {
                    type: "Recursion",
                    node: (0, term_1.rdfJsTerm2Ld)(focus),
                    shape: ctx.label
                };
                ctx.tracker.recurse(ret);
                return ret;
            }
            if ("known" in this && seenKey in this.known) {
                const ret = this.known[seenKey];
                ctx.tracker.known(ret);
                return ret;
            }
            ctx.seen[seenKey] = { node: focus, shape: ctx.label };
            ctx.tracker.enter(focus, ctx.label);
        }
        const ret = this.validateDescendants(focus, ctx.label, ctx, false);
        if (!ctx.subGraph) {
            ctx.tracker.exit(focus, ctx.label, ret);
            delete ctx.seen[seenKey];
            if ("known" in this)
                this.known[seenKey] = ret;
        }
        return ret;
    }
    /**
     * Validate shapeLabel and shapeExprs which extend shapeLabel
     *
     * @param focus - focus of validation
     * @param shapeLabel - same as ctx.label, but with stronger typing (can't be Start)
     * @param ctx - validation context
     * @param includeAbstractShapes - if true, don't strip out abstract classes (needed for validating abstract base shapes)
     */
    validateDescendants(focus, shapeLabel, ctx, includeAbstractShapes = false) {
        const _ShExValidator = this;
        if (ctx.subGraph) { // !! matchTarget?
            // matchTarget indicates that shape substitution has already been applied.
            // Now we're testing a subgraph against the base shapes.
            const res = this.validateShapeDecl(focus, this.lookupShape(shapeLabel), ctx);
            if (ctx.matchTarget && shapeLabel === ctx.matchTarget.label && !("errors" in res))
                ctx.matchTarget.count++;
            return res;
        }
        // Find all non-abstract shapeExprs extended with label. 
        let candidates = [shapeLabel];
        candidates = candidates.concat(indexExtensions(this.schema)[shapeLabel] || []);
        // Uniquify list.
        for (let i = candidates.length - 1; i >= 0; --i) {
            if (candidates.indexOf(candidates[i]) < i)
                candidates.splice(i, 1);
        }
        // Filter out abstract shapes.
        if (!includeAbstractShapes)
            candidates = candidates.filter(l => !this.lookupShape(l).abstract);
        // Aggregate results in a SolutionList or FailureList.
        const results = candidates.reduce((ret, candidateShapeLabel) => {
            const shapeExpr = this.lookupShape(candidateShapeLabel);
            const matchTarget = candidateShapeLabel === shapeLabel ? null : { label: shapeLabel, count: 0 };
            ctx = ctx.checkExtendingClass(candidateShapeLabel, matchTarget);
            const res = this.validateShapeDecl(focus, shapeExpr, ctx);
            return "errors" in res || matchTarget && matchTarget.count === 0 ?
                { passes: ret.passes, failures: ret.failures.concat(res) } :
                { passes: ret.passes.concat(res), failures: ret.failures };
        }, { passes: [], failures: [] });
        let ret;
        if (results.passes.length > 0) {
            ret = results.passes.length !== 1 ?
                { type: "SolutionList", solutions: results.passes } :
                results.passes[0];
        }
        else if (results.failures.length > 0) {
            ret = results.failures.length !== 1 ?
                { type: "FailureList", errors: results.failures } :
                results.failures[0];
        }
        else {
            ret = {
                type: "AbstractShapeFailure",
                shape: shapeLabel,
                errors: [shapeLabel + " has no non-abstract children"]
            };
        }
        return ret;
        // @TODO move to Visitor.index
        function indexExtensions(schema) {
            const abstractness = {};
            const extensions = Hierarchy.create();
            makeSchemaVisitor().visitSchema(schema);
            return extensions.children;
            function makeSchemaVisitor() {
                const schemaVisitor = (0, visitor_1.Visitor)();
                let curLabel;
                let curAbstract;
                const oldVisitShapeDecl = schemaVisitor.visitShapeDecl;
                schemaVisitor.visitShapeDecl = function (decl) {
                    curLabel = decl.id;
                    curAbstract = decl.abstract;
                    abstractness[decl.id] = !!decl.abstract;
                    return oldVisitShapeDecl.call(schemaVisitor, decl, decl.id);
                };
                schemaVisitor.visitShape = function (shape) {
                    if (shape.extends !== undefined) {
                        shape.extends.forEach(ext => {
                            const extendsVisitor = (0, visitor_1.Visitor)();
                            extendsVisitor.visitExpression = function (_expr, ..._args) { return "null"; };
                            extendsVisitor.visitShapeRef = function (reference, ..._args) {
                                extensions.add(reference, curLabel);
                                extendsVisitor.visitShapeDecl(_ShExValidator.lookupShape(reference));
                                // makeSchemaVisitor().visitSchema(schema);
                                return "null";
                            };
                            extendsVisitor.visitShapeExpr(ext);
                        });
                    }
                    return "null";
                };
                return schemaVisitor;
            }
        }
    }
    /**
     * Validate a ShapeDecl, including any shapes it restricts
     *
     * @param focus - focus of validation
     * @param shapeDecl - ShExJ ShapeDecl object
     * @param ctx - validation context
     */
    validateShapeDecl(focus, shapeDecl, ctx) {
        const conjuncts = (shapeDecl.restricts || []).concat([shapeDecl.shapeExpr]);
        const expr = conjuncts.length === 1
            ? conjuncts[0]
            : { type: "ShapeAnd", shapeExprs: conjuncts };
        return this.validateShapeExpr(focus, expr, ctx);
    }
    lookupShape(label) {
        const shapes = this.schema.shapes;
        if (shapes === undefined) {
            runtimeError("shape " + label + " not found; no shapes in schema");
        }
        else if (label in this.index.shapeExprs) {
            return this.index.shapeExprs[label];
        }
        runtimeError("shape " + label + " not found in:\n" + Object.keys(this.index.shapeExprs || []).map(s => "  " + s).join("\n"));
    }
    validateShapeExpr(focus, shapeExpr, ctx) {
        if (typeof shapeExpr === "string") { // ShapeRef
            return this.validateShapeLabel(focus, ctx.checkShapeLabel(shapeExpr));
        }
        switch (shapeExpr.type) {
            case "NodeConstraint":
                return this.validateNodeConstraint(focus, shapeExpr, ctx);
            case "Shape":
                return this.validateShape(focus, shapeExpr, ctx);
            case "ShapeExternal":
                if (typeof this.options.validateExtern !== "function")
                    throw runtimeError(`validating ${ShExTerm.shExJsTerm2Turtle(focus)} as EXTERNAL shapeExpr ${ctx.label} requires a 'validateExtern' option`);
                return this.options.validateExtern(focus, ctx.label, ctx.checkShapeLabel(ctx.label));
            case "ShapeOr":
                const orErrors = [];
                for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
                    const nested = shapeExpr.shapeExprs[i];
                    const sub = this.validateShapeExpr(focus, nested, ctx);
                    if ("errors" in sub)
                        orErrors.push(sub);
                    else if (!ctx.matchTarget || ctx.matchTarget.count > 0)
                        return { type: "ShapeOrResults", solution: sub };
                }
                return { type: "ShapeOrFailure", errors: orErrors };
            case "ShapeNot":
                const sub = this.validateShapeExpr(focus, shapeExpr.shapeExpr, ctx);
                return ("errors" in sub)
                    ? { type: "ShapeNotResults", solution: sub }
                    : { type: "ShapeNotFailure", errors: sub }; // ugh
            case "ShapeAnd":
                const andPasses = [];
                const andErrors = [];
                for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
                    const nested = shapeExpr.shapeExprs[i];
                    const sub = this.validateShapeExpr(focus, nested, ctx);
                    if ("errors" in sub)
                        andErrors.push(sub);
                    else
                        andPasses.push(sub);
                }
                return andErrors.length > 0
                    ? { type: "ShapeAndFailure", errors: andErrors }
                    : { type: "ShapeAndResults", solutions: andPasses };
            default:
                throw Error("expected one of Shape{Ref,And,Or} or NodeConstraint, got " + JSON.stringify(shapeExpr));
        }
    }
    // TODO: should this be called for and, or, not?
    evaluateShapeExprSemActs(ret, shapeExpr, point, shapeLabel) {
        if (!("errors" in ret) && shapeExpr.semActs !== undefined) {
            const semActErrors = this.semActHandler.dispatchAll(shapeExpr.semActs, Object.assign({ node: point }, ret), ret);
            if (semActErrors.length)
                // some semAct aborted
                return { type: "Failure", node: (0, term_1.rdfJsTerm2Ld)(point), shape: shapeLabel, errors: semActErrors };
        }
        return ret;
    }
    validateShape(focus, shape, ctx) {
        let ret = null;
        const fromDB = (ctx.subGraph || this.db).getNeighborhood(focus, ctx.label, shape);
        const neighborhood = fromDB.outgoing.concat(fromDB.incoming);
        const { extendsTCs, tc2exts, localTCs } = this.TripleConstraintsVisitor(this.index.labelToTcs).getAllTripleConstraints(shape);
        const tripleConstraints = extendsTCs.concat(localTCs);
        // neighborhood already integrates subGraph so don't pass to _errorsMatchingShapeExpr
        const { t2tcs, t2tcErrors, tc2TResults } = this.matchByPredicate(tripleConstraints, fromDB, ctx);
        const { missErrors, matchedExtras } = this.whatsMissing(t2tcs, t2tcErrors, shape.extra || []);
        const allT2TCs = new TripleToTripleConstraints(t2tcs, extendsTCs, tc2exts);
        const partitionErrors = [];
        // only construct a regexp engine if shape has a triple expression
        const regexEngine = shape.expression === undefined ? null : this.regexModule.compile(this.schema, shape, this.index);
        for (let t2tc = allT2TCs.next(); t2tc !== null && ret === null; t2tc = allT2TCs.next()) {
            const { errors, results } = this.tryPartition(t2tc, focus, shape, ctx, extendsTCs, tc2exts, matchedExtras, tripleConstraints, tc2TResults, fromDB.outgoing, regexEngine);
            const possibleRet = { type: "ShapeTest", node: (0, term_1.rdfJsTerm2Ld)(focus), shape: ctx.label };
            if (errors.length === 0 && results !== null) // only include .solution for non-empty pattern
                // @ts-ignore TODO
                possibleRet.solution = results;
            if ("semActs" in shape) {
                const semActErrors = this.semActHandler.dispatchAll(shape.semActs, Object.assign({ node: focus }, results), possibleRet);
                if (semActErrors.length)
                    // some semAct aborted
                    Array.prototype.push.apply(errors, semActErrors);
            }
            partitionErrors.push(errors);
            if (errors.length === 0)
                ret = possibleRet;
        }
        // Report only last errors until we have a better idea.
        const lastErrors = partitionErrors[partitionErrors.length - 1];
        let errors = missErrors.concat(lastErrors.length === 1 ? lastErrors[0] : lastErrors);
        if (errors.length > 0)
            ret = {
                type: "Failure",
                node: (0, term_1.rdfJsTerm2Ld)(focus),
                shape: ctx.label,
                errors: errors
            };
        // remove N3jsTripleToString
        if (VERBOSE)
            neighborhood.forEach(function (t) {
                // @ts-ignore
                delete t.toString;
            });
        return this.addShapeAttributes(shape, ret);
    }
    /**
     * Try a mapping of triples to triple constraints
     *
     * @param t2tc mapping from triples to triple constraints
     * @param focus node being validated
     * @param shape against a give shape
     * @param ctx validation context
     * @param extendsTCs all triple constraints shape transitively extends
     * @param tc2exts mapping of extended triple constraint to position in EXTENDS
     * @param matchedExtras triples allowed by EXTRA
     * @param tripleConstraints triple constraints composing shape
     * @param results mapping from triple to nested validation result
     * @param outgoing triples to check for ClosedShapeViolation
     * @param regexEngine engine to use to test regular triple expression
     * @private
     */
    tryPartition(t2tc, focus, shape, ctx, extendsTCs, tc2exts, matchedExtras, tripleConstraints, t2tcErrors, outgoing, regexEngine) {
        const tc2ts = new eval_validator_api_1.MapArray();
        tripleConstraints.forEach(tc => tc2ts.empty(tc));
        const unexpectedTriples = [];
        const extendsToTriples = _seq((shape.extends || []).length).map(() => []);
        t2tc.forEach((tripleConstraint, triple) => {
            if (extendsTCs.indexOf(tripleConstraint) !== -1) {
                // allocate to EXTENDS
                for (let extNo of tc2exts.get(tripleConstraint)) {
                    // allocated to multiple extends if diamond inheritance
                    extendsToTriples[extNo].push(triple);
                }
            }
            else {
                // allocate to local shape
                tc2ts.add(tripleConstraint, { triple: triple, res: t2tcErrors.get(tripleConstraint, triple) });
            }
        });
        outgoing.forEach(triple => {
            if (!t2tc.has(triple) // didn't match anything
                && matchedExtras.indexOf(triple) === -1) // isn't in EXTRAs
                unexpectedTriples.push(triple);
        });
        const errors = [];
        // Triples not mapped to triple constraints are not allowed in closed shapes.
        if (shape.closed && unexpectedTriples.length > 0) {
            errors.push({
                type: "ClosedShapeViolation",
                unexpectedTriples: unexpectedTriples.map(q => {
                    return {
                        subject: (0, term_1.rdfJsTerm2Ld)(q.subject),
                        predicate: (0, term_1.rdfJsTerm2Ld)(q.predicate),
                        object: (0, term_1.rdfJsTerm2Ld)(q.object),
                    };
                })
            });
        }
        let results = this.testExtends(shape, focus, extendsToTriples, ctx);
        if (results === null || !("errors" in results)) {
            if (regexEngine !== null /* i.e. shape.expression !== undefined */) {
                const sub = regexEngine.match(focus, tc2ts, this.semActHandler, null);
                if (!("errors" in sub) && results) {
                    results = { type: "ExtendedResults", extensions: results, local: sub };
                }
                else {
                    results = sub;
                }
            }
            else if (results) { // constructs { ExtendedResults, extensions: { ExtensionResults ... } with no local: { ... } }
                results = { type: "ExtendedResults", extensions: results }; // TODO: keep that redundant nesting for consistency?
            }
        }
        // TODO: what if results is a TypedError (i.e. not a container of further errors)?
        if (results !== null && results.errors !== undefined)
            Array.prototype.push.apply(errors, results.errors);
        return { errors, results };
    }
    /**
     * For each TripleConstraint TC, for each triple T | T.p === TC.p, get the result of testing the value constraint.
     * @param constraintList - list of TripleConstraint
     * @param neighborhood - list of Quad
     * @param ctx - evaluation context
     */
    matchByPredicate(constraintList, neighborhood, ctx) {
        const _ShExValidator = this;
        const outgoing = indexNeighborhood(neighborhood.outgoing);
        const incoming = indexNeighborhood(neighborhood.incoming);
        const init = { t2tcErrors: new Map(), tc2TResults: new MapMap(), t2tcs: new eval_validator_api_1.MapArray() };
        [neighborhood.outgoing, neighborhood.incoming].forEach(quads => quads.forEach(triple => init.t2tcs.data.set(triple, [])));
        return constraintList.reduce(function (ret, constraint) {
            // subject and object depend on direction of constraint.
            const index = constraint.inverse ? incoming : outgoing;
            // get triples matching predicate
            const matchPredicate = index.byPredicate.get(constraint.predicate) ||
                []; // empty list when no triple matches that constraint
            // strip to triples matching value constraints (apart from @<someShape>)
            const matchConstraints = _ShExValidator.triplesMatchingShapeExpr(matchPredicate, constraint, ctx);
            matchConstraints.hits.forEach(function (evidence) {
                ret.t2tcs.add(evidence.triple, constraint);
                ret.tc2TResults.set(constraint, evidence.triple, evidence.sub);
            });
            matchConstraints.misses.forEach(function (evidence) {
                ret.t2tcErrors.set(evidence.triple, { constraint: constraint, errors: evidence.sub });
            });
            return ret;
        }, init);
    }
    whatsMissing(t2tcs, misses, extras) {
        const matchedExtras = []; // triples accounted for by EXTRA
        const missErrors = t2tcs.reduce((ret, t, constraints) => {
            if (constraints.length === 0 && // matches no constraints
                misses.has(t)) { // predicate matched some constraint(s)
                if (extras.indexOf(t.predicate.value) !== -1) {
                    matchedExtras.push(t);
                }
                else { // not declared extra
                    ret.push({
                        type: "TypeMismatch",
                        triple: { type: "TestedTriple", subject: (0, term_1.rdfJsTerm2Ld)(t.subject), predicate: (0, term_1.rdfJsTerm2Ld)(t.predicate), object: (0, term_1.rdfJsTerm2Ld)(t.object) },
                        constraint: misses.get(t).constraint,
                        errors: misses.get(t).errors
                    });
                }
            }
            return ret;
        }, []);
        return { missErrors, matchedExtras };
    }
    addShapeAttributes(shape, ret) {
        if (shape.annotations !== undefined) { // @ts-ignore TODO: where can annotations appear in results?
            ret.annotations = shape.annotations;
        }
        return ret;
    }
    testExtends(expr, focus, extendsToTriples, ctx) {
        if (expr.extends === undefined)
            return null;
        const passes = [];
        const errors = [];
        for (let eNo = 0; eNo < expr.extends.length; ++eNo) {
            const extend = expr.extends[eNo];
            const subgraph = new TrivialNeighborhood(null); // These triples were tracked earlier.
            extendsToTriples[eNo].forEach(t => subgraph.addOutgoingTriples([t]));
            ctx = ctx.checkExtendsPartition(subgraph); // new context with subgraph
            const sub = this.validateShapeExpr(focus, extend, ctx);
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
    /** TripleConstraintsVisitor - walk shape's extends to get all
     * referenced triple constraints.
     *
     * @param {} labelToTcs: Map<shapeLabel, TripleConstraint[]>
     * @returns { extendsTCs: [[TripleConstraint]], localTCs: [TripleConstraint] }
     */
    TripleConstraintsVisitor(labelToTcs) {
        const _ShExValidator = this;
        const visitor = (0, visitor_1.Visitor)(labelToTcs);
        function emptyShapeExpr() { return []; }
        visitor.visitShapeDecl = function (decl, _min, _max) {
            // if (labelToTcs.has(decl.id)) !! uncomment cache for production
            //   return labelToTcs[decl.id];
            labelToTcs[decl.id] = decl.shapeExpr
                ? visitor.visitShapeExpr(decl.shapeExpr, 1, 1)
                : emptyShapeExpr();
            return [{ type: "Ref", ref: decl.id }];
        };
        visitor.visitShapeOr = function (shapeExpr, _min, max) {
            return shapeExpr.shapeExprs.reduce((acc, disjunct) => acc.concat(this.visitShapeExpr(disjunct, 0, max)), emptyShapeExpr());
        };
        visitor.visitShapeAnd = function (shapeExpr, min, max) {
            const seen = new Set();
            return shapeExpr.shapeExprs.reduce((acc, disjunct) => {
                this.visitShapeExpr(disjunct, min, max).forEach((tc) => {
                    const key = `${tc.min} ${tc.max} ${tc.predicate}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        acc.push(tc);
                    }
                });
                return acc;
            }, []);
        };
        visitor.visitShapeNot = function (expr, _min, _max) {
            throw Error(`don't know what to do when extending ${JSON.stringify(expr)}`);
        };
        visitor.visitShapeExternal = emptyShapeExpr;
        visitor.visitNodeConstraint = emptyShapeExpr;
        // Override visitShapeRef to follow references.
        // tests: Extend3G-pass, vitals-RESTRICTS-pass_lie-Vital...
        visitor.visitShapeRef = function (shapeLabel, min, max) {
            return visitor.visitShapeDecl(_ShExValidator.lookupShape(shapeLabel), min, max);
        };
        visitor.visitShape = function (shape, min, max) {
            const { extendsTCs, localTCs } = shapePieces(shape, min, max);
            return extendsTCs.flat().concat(localTCs);
        };
        // Visit shape's EXTENDS and expression.
        function shapePieces(shape, min, max) {
            const extendsTCs = shape.extends !== undefined
                ? shape.extends.map(ext => visitor.visitShapeExpr(ext, min, max))
                : [];
            const localTCs = shape.expression === undefined
                ? []
                : visitor.visitExpression(shape.expression, min, max);
            return { extendsTCs, localTCs };
        }
        function getAllTripleConstraints(shape) {
            const { extendsTCs: extendsTcOrRefsz, localTCs } = shapePieces(shape, 1, 1);
            const tcs = [];
            const tc2exts = new Map();
            extendsTcOrRefsz.map((tcOrRefs, ord) => flattenExtends(tcOrRefs, ord));
            return { extendsTCs: tcs, tc2exts, localTCs };
            function flattenExtends(tcOrRefs, ord) {
                return tcOrRefs.forEach(tcOrRef => {
                    if (tcOrRef.type === "TripleConstraint") {
                        add(tcOrRef); // as TC
                    }
                    else {
                        flattenExtends(labelToTcs[tcOrRef.ref], ord);
                    }
                });
                function add(tc) {
                    const idx = tcs.indexOf(tc);
                    if (idx === -1) {
                        // new TC
                        tcs.push(tc);
                        tc2exts.set(tc, [ord]);
                    }
                    else {
                        // ref to TC already seen in this or earlier EXTENDS
                        if (tc2exts.get(tc).indexOf(ord) === -1) {
                            // not yet included in this EXTENDS
                            tc2exts.get(tc).push(ord);
                        }
                    }
                }
            }
        }
        // tripleExprs return list of TripleConstraints
        function n(l, expr) {
            if (expr.min === undefined)
                return l;
            return l * expr.min;
        }
        function x(l, expr) {
            if (expr.max === undefined)
                return l;
            if (l === -1 || expr.max === -1)
                return -1;
            return l * expr.max;
        }
        function and(tes) {
            return Array.prototype.concat.apply([], tes);
        }
        // Any TC inside a OneOf implicitly has a min cardinality of 0.
        visitor.visitOneOf = function (expr, _outerMin, outerMax) {
            return and(expr.expressions.map(nested => visitor.visitTripleExpr(nested, 0, x(outerMax, expr))));
        };
        visitor.visitEachOf = function (expr, outerMin, outerMax) {
            return and(expr.expressions.map(nested => visitor.visitTripleExpr(nested, n(outerMin, expr), x(outerMax, expr))));
        };
        visitor.visitInclusion = function (inclusion, outerMin, outerMax) {
            return visitor.visitTripleExpr(_ShExValidator.index.tripleExprs[inclusion], outerMin, outerMax);
        };
        // Synthesize a TripleConstraint with the implicit cardinality.
        visitor.visitTripleConstraint = function (expr, _outerMin, _outerMax) {
            return [expr];
            /* eval-threaded-n-err counts on t2tcs.indexOf(expr) so we can't optimize with:
               const ret = JSON.parse(JSON.stringify(expr));
               ret.min = n(outerMin, expr);
               ret.max = x(outerMax, expr);
               return [ret];
            */
        };
        return { getAllTripleConstraints };
    }
    triplesMatchingShapeExpr(triples, constraint, ctx) {
        const _ShExValidator = this;
        const misses = [];
        const hits = [];
        triples.forEach(function (triple) {
            const value = constraint.inverse ? triple.subject : triple.object;
            const oldBindings = JSON.parse(JSON.stringify(_ShExValidator.semActHandler.results));
            if (constraint.valueExpr === undefined)
                hits.push(new TriplesMatchingNoValueConstraint(triple));
            else {
                ctx = ctx.followTripleConstraint();
                const sub = _ShExValidator.validateShapeExpr(value, constraint.valueExpr, ctx);
                if (sub.errors === undefined) { // TODO: improve typing to cast isn't necessary
                    hits.push(new TriplesMatchingHit(triple, sub));
                }
                else /* !! if (!hits.find(h => h.triple === triple)) */ {
                    _ShExValidator.semActHandler.results = JSON.parse(JSON.stringify(oldBindings));
                    misses.push(new TriplesMatchingMiss(triple, sub));
                }
            }
        });
        return new TriplesMatching(hits, misses);
    }
    /* validateNodeConstraint - return whether the value matches the value
     * expression without checking shape references.
     */
    validateNodeConstraint(focus, nc, ctx) {
        const errors = [];
        function validationError(...s) {
            const errorStr = Array.prototype.join.call(s, "");
            errors.push("Error validating " + ShExTerm.rdfJsTerm2Turtle(focus) + " as " + JSON.stringify(nc) + ": " + errorStr);
            return false;
        }
        if (nc.nodeKind !== undefined) {
            if (["iri", "bnode", "literal", "nonliteral"].indexOf(nc.nodeKind) === -1) {
                validationError(`unknown node kind '${nc.nodeKind}'`);
            }
            if (focus.termType === "BlankNode") {
                if (nc.nodeKind === "iri" || nc.nodeKind === "literal") {
                    validationError(`blank node found when ${nc.nodeKind} expected`);
                }
            }
            else if (focus.termType === "Literal") {
                if (nc.nodeKind !== "literal") {
                    validationError(`literal found when ${nc.nodeKind} expected`);
                }
            }
            else if (nc.nodeKind === "bnode" || nc.nodeKind === "literal") {
                validationError(`iri found when ${nc.nodeKind} expected`);
            }
        }
        if (nc.datatype && nc.values)
            validationError("found both datatype and values in " + nc);
        if (nc.values !== undefined) {
            if (!nc.values.some(valueSetValue => testValueSetValue(valueSetValue, focus))) {
                validationError(`value ${(focus.value)} not found in set ${JSON.stringify(nc.values)}`);
            }
        }
        const numeric = (0, shex_xsd_1.getNumericDatatype)(focus);
        if (nc.datatype !== undefined) {
            (0, shex_xsd_1.testKnownTypes)(focus, validationError, term_1.rdfJsTerm2Ld, nc.datatype, numeric, focus.value);
        }
        (0, shex_xsd_1.testFacets)(nc, focus.value, validationError, numeric);
        const ncRet = Object.assign({}, {
            type: null,
            node: (0, term_1.rdfJsTerm2Ld)(focus)
        }, (ctx.label ? { shape: ctx.label } : {}), { shapeExpr: nc });
        Object.assign(ncRet, errors.length > 0
            ? { type: "NodeConstraintViolation", errors: errors }
            : { type: "NodeConstraintTest", });
        return this.evaluateShapeExprSemActs(ncRet, nc, focus, ctx.label);
    }
}
exports.ShExValidator = ShExValidator;
ShExValidator.Start = neighborhood_api_1.Start;
ShExValidator.InterfaceOptions = exports.InterfaceOptions;
ShExValidator.type = "ShExValidator";
function testLanguageStem(typedValue, stem) {
    const trail = typedValue.substring(stem.length);
    return (typedValue !== "" && typedValue.startsWith(stem) && (stem === "" || trail === "" || trail[0] === "-"));
}
function valueInExclusions(exclusions, value) {
    return exclusions.some(exclusion => {
        if (typeof exclusion === "string") { // Iri
            return (value === exclusion);
        }
        else if (typeof exclusion === "object" // Literal
            && exclusion.type !== undefined
            && !exclusion.type.match(/^(?:Iri|Literal|Language)(?:Stem(?:Range)?)?$/)) {
            return (value === exclusion.value);
        }
        else {
            const valueConstraint = exclusion;
            switch (valueConstraint.type) {
                // "Iri" covered above
                case "IriStem":
                    return (value.startsWith(valueConstraint.stem));
                // "Literal" covered above
                case "LiteralStem":
                    return (value.startsWith(valueConstraint.stem));
                case "Language":
                    return (value === valueConstraint.languageTag);
                case "LanguageStem":
                    return testLanguageStem(value, valueConstraint.stem);
            }
        }
        return false;
    });
}
function testValueSetValue(valueSetValueP, value) {
    if (typeof valueSetValueP === "string") { // Iri
        return (value.termType === "NamedNode" && value.value === valueSetValueP);
    }
    else if (typeof valueSetValueP === "object" // Literal
        && (valueSetValueP.type === undefined
            || !valueSetValueP.type.match(/^(?:Iri|Literal|Language)(?:Stem(?:Range)?)?$/))) {
        if (value.termType !== "Literal") {
            return false;
        }
        else {
            const vsValueLiteral = valueSetValueP;
            const valLiteral = value;
            return (value.value === vsValueLiteral.value
                && (vsValueLiteral.language === undefined || vsValueLiteral.language === valLiteral.language)
                && (vsValueLiteral.type === undefined || vsValueLiteral.type === valLiteral.datatype.value));
        }
    }
    else {
        // Do a little dance to rule out ObjectLiteral and IRIREF
        const valueSetValue = valueSetValueP;
        switch (valueSetValue.type) {
            // "Iri" covered above
            case "IriStem":
                if (value.termType !== "NamedNode")
                    return false;
                return (value.value.startsWith(valueSetValue.stem));
            case "IriStemRange":
                if (value.termType !== "NamedNode")
                    return false;
                if (typeof valueSetValue.stem === "string" && !value.value.startsWith(valueSetValue.stem))
                    return false;
                return (!valueInExclusions(valueSetValue.exclusions, value.value));
            // "Literal" covered above
            case "LiteralStem":
                if (value.termType !== "Literal")
                    return false;
                return (value.value.startsWith(valueSetValue.stem));
            case "LiteralStemRange":
                if (value.termType !== "Literal")
                    return false;
                if (typeof valueSetValue.stem === "string" && !value.value.startsWith(valueSetValue.stem))
                    return false;
                return (!valueInExclusions(valueSetValue.exclusions, value.value));
            case "Language":
                if (value.termType !== "Literal")
                    return false;
                return (value.language === valueSetValue.languageTag);
            case "LanguageStem":
                if (value.termType !== "Literal")
                    return false;
                return testLanguageStem(value.language, valueSetValue.stem);
            case "LanguageStemRange":
                if (value.termType !== "Literal")
                    return false;
                if (typeof valueSetValue.stem === "string" && !testLanguageStem(value.language, valueSetValue.stem))
                    return false;
                return (!valueInExclusions(valueSetValue.exclusions, value.language));
        }
    }
}
const NoTripleConstraint = Symbol('NO_TRIPLE_CONSTRAINT');
/** Explore permutations of mapping from Triples to TripleConstraints
 * documented using test ExtendsRepeatedP-pass
 */
class TripleToTripleConstraints {
    /**
     *
     * @param constraintList mapping from Triple to possible TripleConstraints, e.g. [
     *      [0,2,4], # try T0 against TC0, TC2, TC4
     *      [0,2,4], # try T1 against same
     *      [0,2,4], # try T2 against same
     *      [1,3]    # try T3 against TC1, TC3
     *   ]
     * @param extendsTCs how many TCs are in EXTENDS,
     *   e.g. 4 says that TCs 0-3 are assigned to some EXTENDS; only TC4 is "local".
     * @param tc2exts which TripleConstraints came from which EXTENDS, e.g. [
     *     [0], # TC0 is assignable to EXTENDS 0
     *     [0], # TC1 is assignable to EXTENDS 0
     *     [0], # TC2 is assignable to EXTENDS 0
     *     [0], # TC3 is assignable to EXTENDS 0
     *   ]
     */
    constructor(constraintList, extendsTCs, tc2exts) {
        this.uniqueTCs = [];
        this.extendsTCs = extendsTCs;
        this.tc2exts = tc2exts;
        this.subgraphCache = new Map();
        this.crossProduct = CrossProduct(constraintList, NoTripleConstraint);
    }
    /**
     * Find next mapping of Triples to TripleConstraints.
     * Exclude any that differ only in an irrelevant order difference in assignment to EXTENDS.
     * @returns {(Quad | null}
     */
    next() {
        while (this.crossProduct.next()) {
            /* t2tc - array mapping neighborhood index to TripleConstraint
             * CrossProduct counts through t2tcs from the right:
             *   [ 0, 0, 0, 1 ] # first call
             *   [ 0, 0, 0, 3 ] # second call
             *   [ 0, 0, 2, 1 ] # third call
             *   [ 0, 0, 2, 3 ] # fourth call
             *   [ 0, 0, 4, 1 ] # fifth call
             *   [ 0, 2, 0, 1 ] # sixth call...
             */
            const t2tc = this.crossProduct.get(); // [0,1,0,3] mapping from triple to constraint
            // if (DBG_gonnaMatch (t2tc, fromDB, t2tcs)) debugger;
            /* If this permutation repeats the same assignments to EXTENDS parents, continue to next permutation.
               Test extends-abstract-multi-empty_fail-Ref1ExtraP includes e.g. "_-L4-E0-E0-E0-_" from:
               t2tc: [ NoTripleConstraint, 4, 2, 1, 3, NoTripleConstraint ]
               tc2exts: [[0], [0], [0], [0]] (All four TCs assignable to first EXTENDS.)
            */
            const subgraphKey = [...t2tc.entries()].map(([_triple, tripleConstraint]) => this.extendsTCs.indexOf(tripleConstraint) !== -1
                ? '' + this.tc2exts.get(tripleConstraint).map(eNo => 'E' + eNo)
                : 'L' + this.getUniqueTcNo(tripleConstraint)).join('-');
            if (!this.subgraphCache.has(subgraphKey)) {
                this.subgraphCache.set(subgraphKey, true);
                return t2tc;
            }
        }
        return null;
    }
    getUniqueTcNo(tripleConstraint) {
        let idx = this.uniqueTCs.indexOf(tripleConstraint);
        if (idx === -1) {
            idx = this.uniqueTCs.length;
            this.uniqueTCs.push(tripleConstraint);
        }
        return idx;
    }
}
/**
 * Create a cross-product iterator that walks through all permutations of assigning a set of keys to one of their associated values.
 *
 * started from http://stackoverflow.com/questions/9422386/lazy-cartesian-product-of-arrays-arbitrary-nested-loops
 * TODO: make NoConstraint be part of CrossProduct rather than an externally-supplied value.
 *
 * @param sets Map from key to array of values
 * @param emptyValue a term that won't appear in the values that can be used for internal logic
 * @constructor
 */
function CrossProduct(sets, emptyValue) {
    const n = sets.length, carets = [];
    const keys = [...sets.keys];
    let args = null;
    function init() {
        args = [];
        for (let i = 0; i < n; i++) {
            carets[i] = 0;
            args[i] = sets.get(keys[i]).length > 0 ? sets.get(keys[i])[0] : emptyValue;
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
        if (carets[i] < sets.get(keys[i]).length) {
            args[i] = sets.get(keys[i])[carets[i]];
            return true;
        }
        while (carets[i] >= sets.get(keys[i]).length) {
            if (i === 0) {
                return false;
            }
            carets[i] = 0;
            args[i] = sets.get(keys[i]).length > 0 ? sets.get(keys[i])[0] : emptyValue;
            carets[--i]++;
        }
        args[i] = sets.get(keys[i])[carets[i]];
        return true;
    }
    return {
        next: next,
        // do: function (block, _context) { // old API
        //   return block.apply(_context, args);
        // },
        // new API because
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments#Description
        // cautions about functions over arguments.
        get: function () {
            return args.reduce((acc, listElt, ord) => {
                if (listElt !== emptyValue)
                    acc.set(keys[ord], listElt);
                return acc;
            }, new Map());
        }
    };
}
/* N3jsTripleToString - simple toString function to make N3.js's triples
 * printable.
 */
const N3jsTripleToString = function () {
    function fmt(n) {
        return n.termType === "Literal" ?
            ["http://www.w3.org/2001/XMLSchema#integer",
                "http://www.w3.org/2001/XMLSchema#float",
                "http://www.w3.org/2001/XMLSchema#double"
            ].indexOf(n.datatype.value) !== -1 ?
                parseInt(n.value) :
                n :
            n.termType === "BlankNode" ?
                n :
                "<" + n + ">";
    }
    // @ts-ignore what's an elegant way add toString to Quads?
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
 *     misses: list to receive value constraint failures.
 *   }
 */
function indexNeighborhood(triples) {
    return {
        byPredicate: triples.reduce(function (ret, t) {
            const p = t.predicate.value;
            if (!ret.has(p))
                ret.set(p, []);
            ret.get(p).push(t);
            // If in VERBOSE mode, add a nice toString to N3.js's triple objects.
            if (VERBOSE)
                t.toString = N3jsTripleToString;
            return ret;
        }, new Map()),
        // candidates: _seq<number>(triples.length).map(function () {
        //   return [];
        // }),
        misses: []
    };
}
/* Return a list of n `undefined`s.
 *
 * Note that Array(n) on its own returns a "sparse array" so Array(n).map(f)
 * never calls f.
 * This doesn't work without both a fill and a map (‽):
 *   extendsToTriples: Quad[][] = Array((shape.extends || []).length).fill([]]).map(() => []);
 */
function _seq(n) {
    return Array.from(Array(n)); // ha ha ha, javascript, you suck.
}
function runtimeError(...args) {
    const errorStr = args.join("");
    const e = new Error(errorStr);
    Error.captureStackTrace(e, runtimeError);
    throw e;
}
//# sourceMappingURL=shex-validator.js.map

/***/ }),

/***/ 8994:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.testFacets = exports.testKnownTypes = exports.getNumericDatatype = void 0;
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
numericParsers[XSD + "float"] = function (label, parseError) {
    if (label === "NaN")
        return NaN;
    if (label === "INF")
        return Infinity;
    if (label === "-INF")
        return -Infinity;
    if (!(label.match(DECIMAL_REGEX))) { // XSD has no pattern for float?
        parseError("illegal float value '" + label + "'");
    }
    return parseFloat(label);
};
numericParsers[XSD + "double"] = function (label, parseError) {
    if (label === "NaN")
        return NaN;
    if (label === "INF")
        return Infinity;
    if (label === "-INF")
        return -Infinity;
    if (!(label.match(DECIMAL_REGEX))) {
        parseError("illegal double value '" + label + "'");
    }
    return Number(label);
};
function testRange(value, datatype, parseError) {
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
        integer: { min: -Infinity, max: Infinity },
        decimal: { min: -Infinity, max: Infinity },
        float: { min: -Infinity, max: Infinity },
        double: { min: -Infinity, max: Infinity },
        nonPositiveInteger: { min: -Infinity, max: 0 },
        negativeInteger: { min: -Infinity, max: -1 },
        long: { min: -9223372036854775808, max: 9223372036854775807 },
        int: { min: -2147483648, max: 2147483647 },
        short: { min: -32768, max: 32767 },
        byte: { min: -128, max: 127 },
        nonNegativeInteger: { min: 0, max: Infinity },
        unsignedLong: { min: 0, max: 18446744073709551615 },
        unsignedInt: { min: 0, max: 4294967295 },
        unsignedShort: { min: 0, max: 65535 },
        unsignedByte: { min: 0, max: 255 },
        positiveInteger: { min: 1, max: Infinity }
    };
    const parms = ranges[datatype.substr(XSD.length)];
    if (!parms)
        throw Error("unexpected datatype: " + datatype);
    if (value < parms.min) {
        parseError(`"${value}"^^<${datatype}> is less than the min: ${parms.min}`);
    }
    else if (value > parms.max) {
        parseError(`"${value}"^^<${datatype}> is greater than the min: ${parms.max}`);
    }
}
;
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
    length: function (v, l) { return v.length === l; },
    minlength: function (v, l) { return v.length >= l; },
    maxlength: function (v, l) { return v.length <= l; }
};
const numericValueTests = {
    mininclusive: function (n, m) { return n >= m; },
    minexclusive: function (n, m) { return n > m; },
    maxinclusive: function (n, m) { return n <= m; },
    maxexclusive: function (n, m) { return n < m; }
};
const decimalLexicalTests = {
    totaldigits: function (v, d) {
        const m = v.match(/[0-9]/g);
        return !!m && m.length <= d;
    },
    fractiondigits: function (v, d) {
        const m = v.match(/^[+-]?[0-9]*\.?([0-9]*)$/);
        return !!m && m[1].length <= d;
    }
};
function getNumericDatatype(value) {
    return value.termType !== "Literal"
        ? null
        : integerDatatypes.indexOf(value.datatype.value) !== -1
            ? XSD + "integer"
            : numericDatatypes.indexOf(value.datatype.value) !== -1
                ? value.datatype.value
                : null;
}
exports.getNumericDatatype = getNumericDatatype;
function testKnownTypes(value, validationError, ldify, datatype, numeric, label) {
    if (value.termType !== "Literal") {
        validationError(`mismatched datatype: ${JSON.stringify(ldify(value))} is not a literal with datatype ${datatype}`);
    }
    else if (value.datatype.value !== datatype) {
        validationError(`mismatched datatype: ${value.datatype.value} !== ${datatype}`);
    }
    else if (numeric) {
        testRange(numericParsers[numeric](label, validationError), datatype, validationError);
    }
    else if (datatype === XSD + "boolean") {
        if (label !== "true" && label !== "false" && label !== "1" && label !== "0")
            validationError(`illegal boolean value: ${label}`);
    }
    else if (datatype === XSD + "dateTime") {
        if (!label.match(/^[+-]?\d{4}-[01]\d-[0-3]\dT[0-5]\d:[0-5]\d:[0-5]\d(\.\d+)?([+-][0-2]\d:[0-5]\d|Z)?$/))
            validationError(`illegal dateTime value: ${label}`);
    }
}
exports.testKnownTypes = testKnownTypes;
function testFacets(valueExpr, label, validationError, numeric) {
    if (valueExpr.pattern !== undefined) {
        const regexp = valueExpr.flags !== undefined ?
            new RegExp(valueExpr.pattern, valueExpr.flags) :
            new RegExp(valueExpr.pattern);
        if (!(label.match(regexp)))
            validationError(`value ${label} did not match pattern ${valueExpr.pattern}`);
    }
    for (const [facet, testFunc] of Object.entries(stringTests)) {
        // @ts-ignore - TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'NodeConstraint'
        const facetParm = valueExpr[facet];
        if (facet in valueExpr && !testFunc(label, facetParm)) {
            validationError(`facet violation: expected ${facet} of ${facetParm} but got ${label}`);
        }
    }
    for (const [facet, testFunc] of Object.entries(numericValueTests)) {
        if (facet in valueExpr) {
            if (numeric) {
                // @ts-ignore - TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'NodeConstraint'
                const facetParm = valueExpr[facet];
                if (!testFunc(numericParsers[numeric](label, validationError), facetParm)) {
                    validationError(`facet violation: expected ${facet} of ${facetParm} but got ${label}`);
                }
            }
            else {
                validationError(`facet violation: numeric facet ${facet} can't apply to ${label}`);
            }
        }
    }
    for (const [facet, testFunc] of Object.entries(decimalLexicalTests)) {
        if (facet in valueExpr) {
            if (numeric === XSD + "integer" || numeric === XSD + "decimal") {
                const normalizedDataValue = String(numericParsers[numeric](label, validationError));
                // @ts-ignore - TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'NodeConstraint'
                const facetParm = valueExpr[facet];
                if (!testFunc(normalizedDataValue, facetParm)) {
                    validationError(`facet violation: expected ${facet} of ${facetParm} but got ${label}`);
                }
            }
            else {
                validationError(`facet violation: numeric facet ${facet} can't apply to ${label}`);
            }
        }
    }
}
exports.testFacets = testFacets;
//# sourceMappingURL=shex-xsd.js.map

/***/ }),

/***/ 8806:
/***/ ((module) => {


function ShExVisitor (...ctor_args) {
  this.ctor_args = ctor_args;

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

    visitSchema: function (schema, ...args) {
      const ret = { type: "Schema" };
      this._expect(schema, "type", "Schema");
      this._maybeSet(schema, ret, "Schema",
                     ["@context", "prefixes", "base", "imports", "startActs", "start", "shapes"],
                     ["_base", "_prefixes", "_index", "_sourceMap"],
                     ...args
                    );
      return ret;
    },

    visitPrefixes: function (prefixes, ...args) {
      return prefixes === undefined ?
        undefined :
        visitMap(prefixes, function (val) {
          return val;
        });
    },

    visitIRI: function (i, ...args) {
      return i;
    },

    visitImports: function (imports, ...args) {
      const _Visitor = this;
      return imports.map(function (imp) {
        return _Visitor.visitIRI(imp, args);
      });
    },

    visitStartActs: function (startActs, ...args) {
      const _Visitor = this;
      return startActs === undefined ?
        undefined :
        startActs.map(function (act) {
          return _Visitor.visitSemAct(act, ...args);
        });
    },
    visitSemActs: function (semActs, ...args) {
      const _Visitor = this;
      if (semActs === undefined)
        return undefined;
      const ret = []
      Object.keys(semActs).forEach(function (label) {
        ret.push(_Visitor.visitSemAct(semActs[label], label, ...args));
      });
      return ret;
    },
    visitSemAct: function (semAct, label, ...args) {
      const ret = { type: "SemAct" };
      this._expect(semAct, "type", "SemAct");

      this._maybeSet(semAct, ret, "SemAct",
                     ["name", "code"], null, ...args);
      return ret;
    },

    visitShapes: function (shapes, ...args) {
      const _Visitor = this;
      if (shapes === undefined)
        return undefined;
      return shapes.map(
        shapeExpr =>
          _Visitor.visitShapeDecl(shapeExpr, ...args)
      );
    },

    visitShapeDecl: function (decl, ...args) {
      return this._maybeSet(decl, { type: "ShapeDecl" }, "ShapeDecl",
                            ["id", "abstract", "restricts", "shapeExpr"], null, ...args);
    },

    visitShapeExpr: function (expr, ...args) {
      if (isShapeRef(expr))
        return this.visitShapeRef(expr, ...args)
      switch (expr.type) {
      case "Shape": return this.visitShape(expr, ...args);
      case "NodeConstraint": return this.visitNodeConstraint(expr, ...args);
      case "ShapeAnd": return this.visitShapeAnd(expr, ...args);
      case "ShapeOr": return this.visitShapeOr(expr, ...args);
      case "ShapeNot": return this.visitShapeNot(expr, ...args);
      case "ShapeExternal": return this.visitShapeExternal(expr, ...args);
      default:
        throw Error("unexpected shapeExpr type: " + expr.type);
      }
    },

    visitValueExpr: function (expr, ...args) {
      return this.visitShapeExpr(expr, ...args); // call potentially overloaded visitShapeExpr
    },

    // _visitShapeGroup: visit a grouping expression (shapeAnd, shapeOr)
    _visitShapeGroup: function (expr, ...args) {
      this._testUnknownAttributes(expr, ["shapeExprs"], expr.type, this.visitShapeNot)
      const _Visitor = this;
      const r = { type: expr.type };
      if ("id" in expr)
        r.id = expr.id;
      r.shapeExprs = expr.shapeExprs.map(function (nested) {
        return _Visitor.visitShapeExpr(nested, ...args);
      });
      return r;
    },

    // _visitShapeNot: visit negated shape
    visitShapeNot: function (expr, ...args) {
      this._testUnknownAttributes(expr, ["shapeExpr"], "ShapeNot", this.visitShapeNot)
      const r = { type: expr.type };
      if ("id" in expr)
        r.id = expr.id;
      r.shapeExpr = this.visitShapeExpr(expr.shapeExpr, ...args);
      return r;
    },

    // ### `visitNodeConstraint` deep-copies the structure of a shape
    visitShape: function (shape, ...args) {
      const ret = { type: "Shape" };
      this._expect(shape, "type", "Shape");

      this._maybeSet(shape, ret, "Shape",
                     [ "abstract", "extends",
                       "closed",
                       "expression", "extra", "semActs", "annotations"], null, ...args);
      return ret;
    },

    _visitShapeExprList: function (ext, ...args) {
      const _Visitor = this;
      return ext.map(function (t) {
        return _Visitor.visitShapeExpr(t, ...args);
      });
    },

    // ### `visitNodeConstraint` deep-copies the structure of a shape
    visitNodeConstraint: function (shape, ...args) {
      const ret = { type: "NodeConstraint" };
      this._expect(shape, "type", "NodeConstraint");

      this._maybeSet(shape, ret, "NodeConstraint",
                     [ "nodeKind", "datatype", "pattern", "flags", "length",
                       "reference", "minlength", "maxlength",
                       "mininclusive", "minexclusive", "maxinclusive", "maxexclusive",
                       "totaldigits", "fractiondigits", "values", "annotations", "semActs"], null, ...args);
      return ret;
    },

    visitShapeRef: function (reference, ...args) {
      if (typeof reference !== "string") {
        let ex = Exception("visitShapeRef expected a string, not " + JSON.stringify(reference));
        console.warn(ex);
        throw ex;
      }
      return reference;
    },

    visitShapeExternal: function (expr, ...args) {
      this._testUnknownAttributes(expr, ["id"], "ShapeExternal", this.visitShapeNot)
      return Object.assign("id" in expr ? { id: expr.id } : {}, { type: "ShapeExternal" });
    },

    // _visitGroup: visit a grouping expression (someOf or eachOf)
    _visitGroup: function (expr, type, ...args) {
      const _Visitor = this;
      const r = Object.assign(
        // pre-declare an id so it sorts to the top
        "id" in expr ? { id: null } : { },
        { type: expr.type }
      );
      r.expressions = expr.expressions.map(function (nested) {
        return _Visitor.visitExpression(nested, ...args);
      });
      return this._maybeSet(expr, r, "expr",
                            ["id", "min", "max", "annotations", "semActs"], ["expressions"], ...args);
    },

    visitTripleConstraint: function (expr, ...args) {
      return this._maybeSet(expr,
                            Object.assign(
                              // pre-declare an id so it sorts to the top
                              "id" in expr ? { id: null } : { },
                              { type: "TripleConstraint" }
                            ),
                            "TripleConstraint",
                            ["id", "inverse", "predicate", "valueExpr",
                             "min", "max", "annotations", "semActs"], null, ...args)
    },

    visitTripleExpr: function (expr, ...args) {
      if (typeof expr === "string")
        return this.visitInclusion(expr);
      switch (expr.type) {
      case "TripleConstraint": return this.visitTripleConstraint(expr, ...args);
      case "OneOf": return this.visitOneOf(expr, ...args);
      case "EachOf": return this.visitEachOf(expr, ...args);
      default:
        throw Error("unexpected expression type: " + expr.type);
      }
    },

    visitExpression: function (expr, ...args) {
      return this.visitTripleExpr(expr, ...args); // call potentially overloaded visitTripleExpr
    },

    visitValues: function (values, ...args) {
      const _Visitor = this;
      return values.map(function (t) {
        return isTerm(t) || t.type === "Language" ?
          t :
          _Visitor.visitStemRange(t, ...args);
      });
    },

    visitStemRange: function (t, ...args) {
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
          return _Visitor.visitExclusion(c, ...args);
        });
      }
      return stem;
    },

    visitExclusion: function (c, ...args) {
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

    visitInclusion: function (inclusion, ...args) {
      if (typeof inclusion !== "string") {
        let ex = Exception("visitInclusion expected a string, not " + JSON.stringify(inclusion));
        console.warn(ex);
        throw ex;
      }
      return inclusion;
    },

    _maybeSet: function (obj, ret, context, members, ignore, ...args) {
      const _Visitor = this;
      this._testUnknownAttributes(obj, ignore ? members.concat(ignore) : members, context, this._maybeSet)
      members.forEach(function (member) {
        const methodName = "visit" + member.charAt(0).toUpperCase() + member.slice(1);
        if (member in obj) {
          const f = _Visitor[methodName];
          if (typeof f !== "function") {
            throw Error(methodName + " not found in Visitor");
          }
          const t = f.call(_Visitor, obj[member], ...args);
          if (t !== undefined) {
            ret[member] = t;
          }
        }
      });
      return ret;
    },
    _visitValue: function (v, ...args) {
      return v;
    },
    _visitList: function (l, ...args) {
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
  return r;

  // Expect property p with value v in object o
}

// The ShEx Vistor is here to minimize deps for ShExValidator.
/** create indexes for schema
 */
function index (schema) {
  let index = {
    shapeExprs: {},
    tripleExprs: {}
  };
  let v = ShExVisitor();

  let oldVisitExpression = v.visitTripleExpr;
  v.visitTripleExpr = function (expression, ...args) {
    if (typeof expression === "object" && "id" in expression)
      index.tripleExprs[expression.id] = expression;
    return oldVisitExpression.call(v, expression, ...args);
  };

  let oldVisitShapeDecl = v.visitShapeDecl;
  v.visitShapeDecl = function (shapeExpr, ...args) {
    if (typeof shapeExpr === "object" && "id" in shapeExpr)
      index.shapeExprs[shapeExpr.id] = shapeExpr;
    return oldVisitShapeDecl.call(v, shapeExpr, ...args);
  };

  v.visitSchema(schema);
  return index;
}

if (true)
  module.exports = {
    Visitor: ShExVisitor,
    index: index,
  };



/***/ }),

/***/ 95:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// **ShExWriter** writes ShEx documents.

const ShExWriterCjsModule = (function () {
const RelativizeIri = (__webpack_require__(4436).relativize);
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
      schema.shapes.forEach(function (shapeDecl) {
        _ShExWriter._write(
          _ShExWriter._writeShapeDecl(shapeDecl, done, true, 0).join("")+"\n",
          done
        );
      })
  },

  _writeShapeDecl: function (shapeDecl, done, forceBraces, parentPrec) {
    const _ShExWriter = this;
    const pieces = [];
    if (shapeDecl.abstract)
      pieces.push("ABSTRACT ");
    pieces.push(_ShExWriter._encodeShapeName(shapeDecl.id, false), " ");
    return pieces.concat(_ShExWriter._writeShapeExpr(shapeDecl.shapeExpr, done, true, 0));
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
        iri = RelativizeIri(iri, base);
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
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(9709);
/******/ 	
/******/ })()
;