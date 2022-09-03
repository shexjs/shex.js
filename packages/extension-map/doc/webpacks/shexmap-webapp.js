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

/***/ 2808:
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

/***/ 1368:
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

/***/ 6642:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


exports.decode = exports.parse = __webpack_require__(2808);
exports.encode = exports.stringify = __webpack_require__(1368);


/***/ }),

/***/ 3362:
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

/***/ 9779:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var constants = __webpack_require__(3362);



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


var constants  = __webpack_require__(3362);
var formatUrl  = __webpack_require__(9779);
var getOptions = __webpack_require__(4141);
var objUtils   = __webpack_require__(1609);
var parseUrl   = __webpack_require__(5398);
var relateUrl  = __webpack_require__(6258);



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

/***/ 4141:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var objUtils = __webpack_require__(1609);



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

/***/ 6420:
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

/***/ 6849:
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

/***/ 5398:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var hrefInfo   = __webpack_require__(6849);
var parseHost  = __webpack_require__(6420);
var parsePath  = __webpack_require__(8965);
var parsePort  = __webpack_require__(2022);
var parseQuery = __webpack_require__(9150);
var parseUrlString = __webpack_require__(8936);
var pathUtils      = __webpack_require__(7831);



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

/***/ 8965:
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

/***/ 2022:
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

/***/ 9150:
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

/***/ 8936:
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


var findRelation = __webpack_require__(8019);
var objUtils     = __webpack_require__(1609);
var pathUtils    = __webpack_require__(7831);



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

/***/ 8019:
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

/***/ 6258:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var absolutize = __webpack_require__(799);
var relativize = __webpack_require__(7255);



function relateUrl(siteUrlObj, urlObj, options)
{
	absolutize(urlObj, siteUrlObj, options);
	relativize(urlObj, siteUrlObj, options);
	
	return urlObj;
}



module.exports = relateUrl;


/***/ }),

/***/ 7255:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var pathUtils = __webpack_require__(7831);



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

/***/ 1609:
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

/***/ 7831:
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

/***/ 9639:
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



var punycode = __webpack_require__(9639);
var util = __webpack_require__(5225);

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
    querystring = __webpack_require__(6642);

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

/***/ 5225:
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

/***/ 6540:
/***/ ((module, exports, __webpack_require__) => {

const EvalSimple1ErrCjsModule = (function () {
  const ShExTerm = __webpack_require__(1118);
  const { NoTripleConstraint } = __webpack_require__(3530);

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
            let min = "min" in state.c ? state.c.min : 1;
            let max = "max" in state.c ? state.c.max === UNBOUNDED ? Infinity : state.c.max : 1;
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
                return t === NoTripleConstraint ? ret : ret + 1; // count expected
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
              if (tripleToConstraintMapping[k] !== NoTripleConstraint)
                unmatchedTriples[k] = tripleToConstraintMapping[k];
            });
            // Removed triples matched in this thread.
            elt.matched.forEach(m => {
              m.triples.forEach(t => {
                delete unmatchedTriples[t];
              });
            });

          return acc.concat(Object.keys(unmatchedTriples).map(i => extend({
            type: lastState.c.negated
              ? "NegatedProperty"
              : "ExcessTripleViolation",
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

/***/ 6863:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const EvalThreadedNErrCjsModule = (function () {
const ShExTerm = __webpack_require__(1118);
const { NoTripleConstraint } = __webpack_require__(3530);
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
              if (tripleToConstraintMapping[k] !== NoTripleConstraint)
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

/***/ 3530:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NoTripleConstraint = void 0;
exports.NoTripleConstraint = Symbol('NO_TRIPLE_CONSTRAINT');


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

const ShExMapMaterializerCjsModule = function (config) {

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

const ShExTerm = __webpack_require__(1118);
const ShExMap = __webpack_require__(1279);

const UNBOUNDED = -1;

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

function makeCache () {
  const _keys = {}; // _keys[http://abcd] = [obj1, obj2]
  const _vals = {}; // _vals[http://abcd] = [res1, res2]
  return {
    cached: function (point, shape) {
      let cache = _keys[point];
      if (!cache) {
        _keys[point] = cache = [];
        _vals[point] = [];
        return undefined;
      }
      const idx = cache.indexOf(shape);
      return idx === -1 ? undefined : _vals[point][idx];
    },
    remember: function (point, shape, res) {
      const cache = _keys[point];
      if (!cache) {
        _keys[point] = [];
        _vals[point] = [];
      } else if (cache.indexOf(shape) !== -1) {
        // we're conservative in the use here.
        throw Error("not expecting duplicate key " + key);
      }
      _keys[point].push(shape);
      _vals[point].push(res);
    }
  };
}

/* ShExValidator_constructor - construct an object for validating a schema.
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

  /* validate - test point in db against the schema for labelOrShape
   * depth: level of recurssion; for logging.
   */
  this.validate = function (db, point, labelOrShape, depth, seen) {
    // default to schema's start shape
    if (!labelOrShape || labelOrShape === config.Validator.start) {
      if (!schema.start)
        runtimeError("start production not defined");
      labelOrShape = schema.start;
    }
    if (typeof labelOrShape !== "string")
      return this._validateShapeExpr(db, point, labelOrShape, "_: -start-", depth, seen);

    if (!(labelOrShape in this.schema._index.shapeExprs))
      runtimeError("shape " + labelOrShape + " not defined");

    const shapeLabel = labelOrShape; // for clarity
    if (seen === undefined)
      seen = {};
    const seenKey = point + "|" + shapeLabel;
    if (seenKey in seen)
      return {
        type: "Recursion",
        node: ldify(point),
        shape: shapeLabel
      };
    seen[seenKey] = { point: point, shapeLabel: shapeLabel };
    const ret = this._validateShapeDecl(db, point, schema._index.shapeExprs[shapeLabel], shapeLabel, depth, seen);
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
        node: ldify(point),
        shape: shapeLabel,
        errors: errors.map(function (miss) {
          return {
            type: "NodeConstraintViolation",
            shapeExpr: shapeExpr
          };
        })
      } : {
        type: "NodeConstraintTest",
        node: ldify(point),
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
    // const tripleList = constraintList.reduce(function (ret, constraint, ord) {

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
    //     ret.constraintList[neighborhood.indexOf(t)].push(ord);
    //   });
    //   matchConstraints.misses.forEach(function (t) {
    //     ret.misses[neighborhood.indexOf(t.triple)] = {constraintNo: ord, errors: t.errors};
    //   });
    //   return ret;
    // }, { misses: {}, constraintList:_seq(neighborhood.length).map(function () { return []; }) }); // start with [[],[]...]

    // _log("constraints by triple: ", JSON.stringify(tripleList.constraintList));

    // const misses = tripleList.constraintList.reduce(function (ret, constraints, ord) {
    //   if (constraints.length === 0 &&                       // matches no constraints
    //       ord < outgoing.triples.length &&                  // not an incoming triple
    //       ord in tripleList.misses &&                       // predicate matched some constraint(s)
    //       (shape.extra === undefined ||                     // not declared extra
    //        shape.extra.indexOf(neighborhood[ord].predicate) === -1)) {
    //     ret.push({tripleNo: ord, constraintNo: tripleList.misses[ord].constraintNo, errors: tripleList.misses[ord].errors});
    //   }
    //   return ret;
    // }, []);

    // const xp = crossProduct(tripleList.constraintList);
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
      //   const cll = constraintList.length;
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
        // console.log({"constraintNo": constraintNo, "min": min, "max": max, "constraintList": constraintList, "db": db, "point": point, "regexEngine": regexEngine, "shape": shape, "shapeLabel": shapeLabel, "depth": depth, "seen": seen});
        const tc = constraintList[constraintNo];
        const curSubjectx = {cs: point};
        const target = new config.rdfjs.Store();
        mapper.visitTripleConstraint(tc, curSubjectx, nextBNode, target, { _maybeSet: () => {} }, _ShExValidator.schema, db, _recurse, _direct, _testExpr);
        const oldLen = neighborhood.length;
        const created = target.getQuads().map(ShExTerm.internalTriple);
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
      //   const fromNFA = nfa.match(db, point, constraintList, _constraintToTriples(), tripleToConstraintMapping, neighborhood, _recurse, this.semActHandler, _testExpr, null);
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

      const possibleRet = { type: "ShapeTest", node: ldify(point), shape: shapeLabel };
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
      //     triple: {subject: t.subject, predicate: t.predicate, object: ldify(t.object)},
      //     constraint: constraintList[miss.constraintNo],
      //     errors: miss.errors
      //   };
      // });
      ret = {
        type: "Failure",
        node: ldify(point),
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

    function validationError () {
      const errorStr = Array.prototype.join.call(arguments, "");
      errors.push("Error validating " + value + " as " + JSON.stringify(valueExpr) + ": " + errorStr);
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
      }

      if (valueExpr.values) {
        if (ShExTerm.isLiteral(value) && valueExpr.values.reduce((ret, v) => {
          if (ret) return true;
          if (!(typeof v === "object" && "value" in v))
            return false;
          const ld = ldify(value);
          return v.value === ld.value &&
            v.type === ld.type &&
            v.language === ld.language;
        }, false)) {
          // literal match
        } else if (valueExpr.values.indexOf(value) !== -1) {
          // trivial match
        } else {
          if (!(valueExpr.values.some(function (valueConstraint) {
            if (typeof valueConstraint === "object" && !("value" in valueConstraint)) {
              expect(valueConstraint, "type", "StemRange");
              if (typeof valueConstraint.stem === "object") {
                expect(valueConstraint.stem, "type", "Wildcard");
                // match whatever but check exclusions below
              } else {
                if (!(value.startsWith(valueConstraint.stem))) {
                  return false;
                }
              }
              if (valueConstraint.exclusions) {
                return !valueConstraint.exclusions.some(function (c) {
                  if (typeof c === "object") {
                    expect(c, "type", "Stem");
                    return value.startsWith(c.stem);
                  } else {
                    return value === c;
                  }
                });
              }
              return true;
            } else {
              // ignore -- would have caught it above
            }
          }))) {
            validationError("value " + value + " not found in set " + valueExpr.values);
          }
        }
      }
    }

    if ("pattern" in valueExpr) {
      const regexp = new RegExp(valueExpr.pattern);
      if (!(getLexicalValue(value).match(regexp)))
        validationError("value " + value + " did not match pattern " + valueExpr.pattern);
    }

    const label = ShExTerm.isLiteral(value) ? ShExTerm.getLiteralValue(value) :
      ShExTerm.isBlank(value) ? value.substring(2) :
      value;
    const dt = ShExTerm.isLiteral(value) ? ShExTerm.getLiteralType(value) : null;
    const numeric = integerDatatypes.indexOf(dt) !== -1 ? XSD + "integer" : numericDatatypes.indexOf(dt) !== -1 ? dt : undefined;

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
    return errors;
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
  const lprec = ShExTerm.isBlank(l) ? 1 : ShExTerm.isLiteral(l) ? 2 : 3;
  const rprec = ShExTerm.isBlank(r) ? 1 : ShExTerm.isLiteral(r) ? 2 : 3;
  return lprec === rprec ? l > r : lprec > rprec;
}

/* byObject - sort triples by object following SPARQL partial ordering.
 */
function byObject (t1, t2) {
  // if (t1.predicate !== t2.predicate) // sort predicate first for easier scanning of results
  //   return t1.predicate > t2.predicate;
  const l = t1.object, r = t2.object;
  const lprec = ShExTerm.isBlank(l) ? 1 : ShExTerm.isLiteral(l) ? 2 : 3;
  const rprec = ShExTerm.isBlank(r) ? 1 : ShExTerm.isLiteral(r) ? 2 : 3;
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

const NFAXVal1ErrMaterializer = (function () {

  const ShExTerm = __webpack_require__(1118);

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
          const ret = [];
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
          const min = "min" in state.c ? state.c.min : 1;
          const max = "max" in state.c ? state.c.max === UNBOUNDED ? Infinity : state.c.max : 1;
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
            if (ShExTerm.isBlank(ref))
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
          function diver (focus, shape, dive) {
            const sub = dive(focus, shape);
            if ("errors" in sub) {
              // console.dir(sub);
              const err = {
                type: "ReferenceError", focus: focus,
                shape: shape, errors: sub
              };
              if (typeof shapeLabel === "string" && ShExTerm.isBlank(shapeLabel))
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
          if ("valueExpr" in ptr)
            [].push.apply(errors, checkValueExpr(ptr.inverse ? triple.subject : triple.object, ptr.valueExpr, diveRecurse, diveDirect));

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
    const matches = /^[ ]*([\w:<>]+)[ ]*,[ ]*({.*)$/.exec(args);
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

/***/ 1279:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*
 * TODO
 *   templates: @<foo> %map:{ my:specimen.container.code=.1.code, my:specimen.container.disp=.1.display %}
 *   node identifiers: @foo> %map:{ foo.id=substr(20) %}
 *   multiplicity: ...
 */

const ShExMapCjsModule = function (config) {

const extensions = __webpack_require__(1386);
const N3Util = __webpack_require__(7141);
const N3DataFactory = (__webpack_require__(713)["default"]);
const materializer = __webpack_require__(4865)(config);

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
            const quotedValue = value; // value.match(/"(.+)"/) === null ? '"' + value + '"' : value;

            validator.semActHandler.results[MapExt][prefixedName] = quotedValue;
            extensionStorage[prefixedName] = quotedValue;
        };

        // Do we have a map extension function?
        if (/.*[(].*[)].*$/.test(code)) {
          const results = extensions.lift(code, ctx.object, prefixes);
          for (key in results)
            update(key, results[key])
        } else {
          const bindingName = code.match(pattern);
          update(bindingName, ctx.node || ctx.object);
        }

        return true;
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
      function P (pname) { return expandPrefixedName(pname, schema._prefixes); }
      function L (value, modifier) { return N3Util.createLiteral(value, modifier); }
      function B () { return nextBNode(); }
      // utility functions for e.g. s = add(B(), P(":value"), L("70", P("xsd:float")))
      function add (s, p, o) {
        target.addQuad(api.ShExTerm.externalTriple({
          subject: s,
          predicate: p,
          object: o
        }, N3DataFactory));
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
            //add(tripleObject, expr.predicate, curSubject);
              add(tripleObject, expr.predicate, curSubjectx.cs);
            else
            //add(curSubject    , expr.predicate, tripleObject);
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
              const res = checkValueExpr(curSubjectx.cs, expr.valueExpr, recurse, direct)
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
      shape = !shape || shape === validator.start ? schema.start : shape;
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
    ShExTerm:             __webpack_require__(1118),
    Util:                 __webpack_require__(9443),
    RdfJsDb:              (__webpack_require__(319).ctor),
    Validator:            __webpack_require__(3457),
    Writer:               __webpack_require__(95),
    Loader:               __webpack_require__(2863),
    Parser:               __webpack_require__(931),
    "eval-simple-1err":   __webpack_require__(6540),
    "eval-threaded-nerr": __webpack_require__(6863),
    ShapeMap:             shapeMap,
    ShapeMapParser:       shapeMap.Parser,
    JsYaml:               __webpack_require__(9431),
    DcTap:                (__webpack_require__(5281).DcTap),
    Map:                  __webpack_require__(1279),
  })
})()

if (true)
  module.exports = ShExWebApp;


/***/ }),

/***/ 319:
/***/ ((module, exports, __webpack_require__) => {

/** Implementation of @shexjs/neighborhood-api which gets data from an @rdfjs/dataset
 */
const NeighborhoodRdfJsModule = (function () {
  const ShExTerm = __webpack_require__(1118);

  function rdfjsDB (db /*:typeof N3Store*/, queryTracker /*:QueryTracker*/) {

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
  function parsePName (pname, meta) {
    const namePos = pname.indexOf(':');
    return meta.expandPrefix(pname.substr(0, namePos)) + ShExUtil.unescapeText(pname.substr(namePos + 1), pnameEscapeReplacements);
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
this.$ = { shape: ShapeMap.start };
break;
case 15:

        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        this.$ = { shape: expandPrefix(yy.schemaMeta.prefixes, $$[$0].substr(0, $$[$0].length - 1)) };
      
break;
case 16:

        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        const namePos = $$[$0].indexOf(':');
        this.$ = { shape: expandPrefix(yy.schemaMeta.prefixes, $$[$0].substr(0, namePos)) + $$[$0].substr(namePos + 1) };
      
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

        const node = ShExUtil.unescapeText($$[$0].slice(1,-1), {});
        this.$ = yy.dataMeta.base === null || absoluteIRI.test(node) ? node : yy.dataMeta._resolveIRI(node)
      
break;
case 85: case 86:
this.$ = parsePName($$[$0], yy.dataMeta);
break;
case 87:
this.$ = yy.dataMeta.expandPrefix($$[$0].substr(0, $$[$0].length - 1));;
break;
case 88:

        const shape = ShExUtil.unescapeText($$[$0].slice(1,-1), {});
        this.$ = yy.schemaMeta.base === null || absoluteIRI.test(shape) ? shape : yy.schemaMeta._resolveIRI(shape)
      
break;
case 89: case 90:
this.$ = parsePName($$[$0], yy.schemaMeta);
break;
case 91:
this.$ = yy.schemaMeta.expandPrefix($$[$0].substr(0, $$[$0].length - 1));;
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
  expandPrefix (prefix) {
    if (!(prefix in this.prefixes))
      this.error(new Error('Parse error; unknown prefix "' + prefix + ':"'));
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
    focus: { term: "FOCUS" },
    start: { term: "START" },
    wildcard: { term: "WILDCARD" },
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
  };
  return loader
  
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
    try {
      loadSchemaImports(obj.schema, resourceLoadControler, options)
      return {mediaType, url: obj.url, schema: obj.schema}
    } catch (e) {
      const e2 = Error("error merging schema object " + obj.schema + ": " + e)
      e2.stack = e.stack
      throw e2
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

  function loadList (src, metaList, mediaType, parserWrapper, merger, options, resourceLoadControler) {
    return src.map(
      async p => {
        const meta = addMeta(typeof p === "string" ? p : p.url, mediaType, metaList)
        const ret =
              typeof p === "object" && !("text" in p)
              ? merger(p, mediaType, resourceLoadControler, options)
              : loadParseMergeSchema(p, meta)
        resourceLoadControler.add(ret)
        return ret
      }
    )

    async function loadParseMergeSchema (p, meta) {
      if (typeof p === "object") {
        return await parserWrapper(p.text, mediaType, p.url, meta, options, resourceLoadControler)
      } else {
        const loaded = await loader.GET(p, mediaType)
        meta.base = meta.url = loaded.url // update with wherever if ultimately loaded from after URL fixups and redirects
        resourceLoadControler.loadNovelUrl(loaded.url, p) // replace p with loaded.url in loaded list
        return await parserWrapper(loaded.text, mediaType, loaded.url,
                             meta, options, resourceLoadControler)
      }
    }
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
      const s = parser.parse(text, url/*, opts, filename*/)
      // !! horrible hack until I set a variable to know if there's a BASE.
      if (s.base === url) delete s.base
      meta.prefixes = s._prefixes || {}
      meta.base = s._base || meta.base
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
      const graphParser = schemaOptions.graphParser.validator.construct(
        schemaOptions.graphParser.schema,
        schemaOptions.graphParser.rdfjsdb(graph),
        {}
      );
      const schemaRoot = graph.getQuads(null, ShExUtil.RDF.type, "http://www.w3.org/ns/shex#Schema")[0].subject;
      const val = graphParser.validate(schemaRoot, schemaOptions.graphParser.validator.start);
      if ("errors" in val)
        throw Error(`${url} did not validate as a ShEx schema: ${JSON.stringify(val.errors, null, 2)}`)
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
      throw Error("error parsing JSON-ld " + url + ": " + e)
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

const { JisonParser, o } = __webpack_require__(9041);const $V0=[7,18,19,20,21,23,26,36,194,216,217],$V1=[19,21,216,217],$V2=[2,27],$V3=[1,22],$V4=[1,23],$V5=[2,12],$V6=[2,13],$V7=[2,14],$V8=[7,18,19,20,21,23,26,36,216,217],$V9=[1,29],$Va=[1,32],$Vb=[1,31],$Vc=[2,18],$Vd=[2,19],$Ve=[1,38],$Vf=[1,42],$Vg=[1,41],$Vh=[1,40],$Vi=[1,44],$Vj=[1,47],$Vk=[1,46],$Vl=[2,15],$Vm=[2,17],$Vn=[2,264],$Vo=[2,265],$Vp=[2,266],$Vq=[2,267],$Vr=[19,21,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,162,190,216,228],$Vs=[2,62],$Vt=[1,65],$Vu=[19,21,40,44,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,162,180,190,216,228,230],$Vv=[2,29],$Vw=[2,242],$Vx=[2,243],$Vy=[2,268],$Vz=[194,196],$VA=[1,73],$VB=[1,76],$VC=[1,75],$VD=[2,16],$VE=[7,18,19,20,21,23,26,36,51,216,217],$VF=[2,48],$VG=[7,18,19,20,21,23,26,36,51,53,216,217],$VH=[2,55],$VI=[119,125,127,190,228],$VJ=[2,140],$VK=[1,111],$VL=[1,119],$VM=[1,93],$VN=[1,101],$VO=[1,102],$VP=[1,103],$VQ=[1,110],$VR=[1,115],$VS=[1,116],$VT=[1,117],$VU=[1,120],$VV=[1,121],$VW=[1,122],$VX=[1,123],$VY=[1,124],$VZ=[1,125],$V_=[1,106],$V$=[1,118],$V01=[2,63],$V11=[19,21,69,71,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,162,190,216,228],$V21=[1,138],$V31=[1,137],$V41=[2,233],$V51=[2,234],$V61=[2,235],$V71=[2,20],$V81=[1,145],$V91=[2,54],$Va1=[1,147],$Vb1=[2,61],$Vc1=[2,70],$Vd1=[1,153],$Ve1=[1,154],$Vf1=[1,155],$Vg1=[2,66],$Vh1=[2,72],$Vi1=[1,162],$Vj1=[1,163],$Vk1=[1,164],$Vl1=[1,167],$Vm1=[1,170],$Vn1=[1,172],$Vo1=[1,173],$Vp1=[1,174],$Vq1=[2,69],$Vr1=[7,18,19,20,21,23,26,36,51,53,79,80,81,119,125,127,190,191,194,216,217,228],$Vs1=[2,96],$Vt1=[7,18,19,20,21,23,26,36,51,53,191,194,216,217],$Vu1=[7,18,19,20,21,23,26,36,51,53,96,97,98,101,102,103,104,216,217],$Vv1=[2,88],$Vw1=[2,89],$Vx1=[7,18,19,20,21,23,26,36,51,53,79,80,81,101,102,103,104,119,125,127,190,191,194,216,217,228],$Vy1=[2,109],$Vz1=[2,108],$VA1=[7,18,19,20,21,23,26,36,51,53,101,102,103,104,112,113,114,115,116,117,191,194,216,217],$VB1=[2,103],$VC1=[2,102],$VD1=[7,18,19,20,21,23,26,36,51,53,96,97,98,101,102,103,104,191,194,216,217],$VE1=[2,92],$VF1=[2,93],$VG1=[2,113],$VH1=[2,114],$VI1=[2,115],$VJ1=[2,111],$VK1=[2,241],$VL1=[19,21,71,81,100,108,109,164,186,205,206,207,208,209,210,211,212,213,214,216],$VM1=[2,187],$VN1=[7,18,19,20,21,23,26,36,51,53,112,113,114,115,116,117,191,194,216,217],$VO1=[2,105],$VP1=[1,197],$VQ1=[1,199],$VR1=[1,201],$VS1=[1,200],$VT1=[2,119],$VU1=[1,208],$VV1=[1,209],$VW1=[1,210],$VX1=[1,211],$VY1=[100,108,109,207,208,209,210],$VZ1=[2,26],$V_1=[2,31],$V$1=[2,32],$V02=[2,33],$V12=[79,80,81,119,125,127,190,228],$V22=[1,273],$V32=[1,278],$V42=[1,255],$V52=[1,263],$V62=[1,264],$V72=[1,265],$V82=[1,272],$V92=[1,268],$Va2=[1,277],$Vb2=[2,49],$Vc2=[2,56],$Vd2=[2,65],$Ve2=[2,71],$Vf2=[2,67],$Vg2=[2,73],$Vh2=[7,18,19,20,21,23,26,36,51,53,101,102,103,104,191,194,216,217],$Vi2=[1,332],$Vj2=[1,340],$Vk2=[1,341],$Vl2=[1,342],$Vm2=[1,348],$Vn2=[1,349],$Vo2=[51,53],$Vp2=[7,18,19,20,21,23,26,36,51,53,79,80,81,119,125,127,190,194,216,217,228],$Vq2=[2,231],$Vr2=[7,18,19,20,21,23,26,36,51,53,194,216,217],$Vs2=[1,365],$Vt2=[2,107],$Vu2=[2,112],$Vv2=[2,99],$Vw2=[1,371],$Vx2=[2,100],$Vy2=[2,101],$Vz2=[2,106],$VA2=[7,18,19,20,21,23,26,36,51,53,96,97,98,101,102,103,104,194,216,217],$VB2=[2,94],$VC2=[1,388],$VD2=[1,394],$VE2=[1,383],$VF2=[1,387],$VG2=[1,397],$VH2=[1,398],$VI2=[1,399],$VJ2=[1,386],$VK2=[1,400],$VL2=[1,401],$VM2=[1,406],$VN2=[1,407],$VO2=[1,408],$VP2=[1,409],$VQ2=[1,402],$VR2=[1,403],$VS2=[1,404],$VT2=[1,405],$VU2=[1,393],$VV2=[19,21,69,160,161,200,216],$VW2=[2,168],$VX2=[2,142],$VY2=[1,422],$VZ2=[1,421],$V_2=[1,432],$V$2=[1,435],$V03=[1,431],$V13=[1,434],$V23=[19,21,44,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,162,190,216,228],$V33=[2,118],$V43=[2,123],$V53=[2,125],$V63=[2,126],$V73=[2,127],$V83=[2,256],$V93=[2,257],$Va3=[2,258],$Vb3=[2,259],$Vc3=[2,124],$Vd3=[2,36],$Ve3=[2,40],$Vf3=[2,43],$Vg3=[2,46],$Vh3=[19,21,40,44,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,162,180,190,191,194,216,228,230],$Vi3=[2,37],$Vj3=[2,75],$Vk3=[2,78],$Vl3=[1,457],$Vm3=[1,459],$Vn3=[1,465],$Vo3=[1,466],$Vp3=[1,467],$Vq3=[1,474],$Vr3=[1,475],$Vs3=[1,476],$Vt3=[1,479],$Vu3=[2,42],$Vv3=[1,557],$Vw3=[2,45],$Vx3=[1,593],$Vy3=[2,68],$Vz3=[51,53,70],$VA3=[1,622],$VB3=[51,53,70,79,80,81,119,125,127,190,191,194,228],$VC3=[51,53,70,191,194],$VD3=[51,53,70,96,97,98,101,102,103,104,191,194],$VE3=[51,53,70,79,80,81,101,102,103,104,119,125,127,190,191,194,228],$VF3=[51,53,70,101,102,103,104,112,113,114,115,116,117,191,194],$VG3=[51,53,70,112,113,114,115,116,117,191,194],$VH3=[51,70],$VI3=[7,18,19,20,21,23,26,36,51,53,79,80,81,119,125,127,190,216,217,228],$VJ3=[2,98],$VK3=[2,97],$VL3=[2,230],$VM3=[1,664],$VN3=[1,667],$VO3=[1,663],$VP3=[1,666],$VQ3=[2,95],$VR3=[2,110],$VS3=[2,104],$VT3=[2,116],$VU3=[2,117],$VV3=[2,135],$VW3=[2,186],$VX3=[1,697],$VY3=[19,21,71,81,100,108,109,164,179,186,205,206,207,208,209,210,211,212,213,214,216],$VZ3=[2,236],$V_3=[2,237],$V$3=[2,238],$V04=[2,249],$V14=[2,252],$V24=[2,246],$V34=[2,247],$V44=[2,248],$V54=[2,254],$V64=[2,255],$V74=[2,260],$V84=[2,261],$V94=[2,262],$Va4=[2,263],$Vb4=[19,21,71,81,100,108,109,111,164,179,186,205,206,207,208,209,210,211,212,213,214,216],$Vc4=[2,147],$Vd4=[2,148],$Ve4=[1,705],$Vf4=[2,149],$Vg4=[121,135],$Vh4=[2,154],$Vi4=[2,155],$Vj4=[2,157],$Vk4=[1,708],$Vl4=[1,709],$Vm4=[19,21,200,216],$Vn4=[2,176],$Vo4=[1,717],$Vp4=[1,718],$Vq4=[121,135,140,141],$Vr4=[2,166],$Vs4=[51,119,125,127,190,228],$Vt4=[51,53,119,125,127,190,228],$Vu4=[2,277],$Vv4=[1,751],$Vw4=[1,752],$Vx4=[1,753],$Vy4=[1,763],$Vz4=[19,21,119,125,127,190,200,216,228],$VA4=[2,239],$VB4=[2,240],$VC4=[2,44],$VD4=[2,41],$VE4=[2,47],$VF4=[19,21,40,44,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,162,180,190,194,216,228,230],$VG4=[2,34],$VH4=[2,38],$VI4=[2,74],$VJ4=[2,76],$VK4=[2,35],$VL4=[1,810],$VM4=[1,816],$VN4=[1,856],$VO4=[1,903],$VP4=[51,53,70,101,102,103,104,191,194],$VQ4=[51,53,70,79,80,81,119,125,127,190,194,228],$VR4=[51,53,70,194],$VS4=[1,946],$VT4=[51,53,70,96,97,98,101,102,103,104,194],$VU4=[1,956],$VV4=[1,993],$VW4=[1,1029],$VX4=[2,232],$VY4=[1,1040],$VZ4=[1,1046],$V_4=[1,1045],$V$4=[19,21,100,108,109,205,206,207,208,209,210,211,212,213,214,216],$V05=[1,1066],$V15=[1,1072],$V25=[1,1071],$V35=[1,1093],$V45=[1,1099],$V55=[1,1098],$V65=[1,1116],$V75=[1,1118],$V85=[1,1120],$V95=[19,21,71,81,100,108,109,164,180,186,205,206,207,208,209,210,211,212,213,214,216],$Va5=[1,1124],$Vb5=[1,1130],$Vc5=[1,1133],$Vd5=[1,1134],$Ve5=[1,1135],$Vf5=[1,1123],$Vg5=[1,1136],$Vh5=[1,1137],$Vi5=[1,1142],$Vj5=[1,1143],$Vk5=[1,1144],$Vl5=[1,1145],$Vm5=[1,1138],$Vn5=[1,1139],$Vo5=[1,1140],$Vp5=[1,1141],$Vq5=[1,1129],$Vr5=[2,250],$Vs5=[2,253],$Vt5=[2,136],$Vu5=[2,150],$Vv5=[2,152],$Vw5=[2,156],$Vx5=[2,158],$Vy5=[2,159],$Vz5=[2,163],$VA5=[2,165],$VB5=[2,170],$VC5=[2,171],$VD5=[1,1160],$VE5=[1,1163],$VF5=[1,1159],$VG5=[1,1162],$VH5=[1,1173],$VI5=[2,226],$VJ5=[2,244],$VK5=[2,245],$VL5=[2,275],$VM5=[2,279],$VN5=[2,281],$VO5=[2,86],$VP5=[1,1196],$VQ5=[2,284],$VR5=[79,80,81,101,102,103,104,119,125,127,190,228],$VS5=[51,53,101,102,103,104,112,113,114,115,116,117,119,125,127,190,228],$VT5=[51,53,96,97,98,101,102,103,104,119,125,127,190,228],$VU5=[2,90],$VV5=[2,91],$VW5=[51,53,112,113,114,115,116,117,119,125,127,190,228],$VX5=[2,128],$VY5=[2,77],$VZ5=[1,1255],$V_5=[1,1291],$V$5=[1,1350],$V06=[1,1356],$V16=[1,1388],$V26=[1,1394],$V36=[51,53,70,79,80,81,119,125,127,190,228],$V46=[51,53,70,96,97,98,101,102,103,104],$V56=[1,1452],$V66=[1,1499],$V76=[2,227],$V86=[2,228],$V96=[2,229],$Va6=[7,18,19,20,21,23,26,36,51,53,79,80,81,111,119,125,127,190,191,194,216,217,228],$Vb6=[7,18,19,20,21,23,26,36,51,53,111,191,194,216,217],$Vc6=[7,18,19,20,21,23,26,36,51,53,96,97,98,101,102,103,104,111,191,194,216,217],$Vd6=[2,209],$Ve6=[1,1552],$Vf6=[19,21,71,81,100,108,109,164,179,180,186,205,206,207,208,209,210,211,212,213,214,216],$Vg6=[19,21,71,81,100,108,109,111,164,179,180,186,205,206,207,208,209,210,211,212,213,214,216],$Vh6=[2,251],$Vi6=[2,153],$Vj6=[2,151],$Vk6=[2,160],$Vl6=[2,164],$Vm6=[2,161],$Vn6=[2,162],$Vo6=[1,1569],$Vp6=[70,135],$Vq6=[1,1572],$Vr6=[1,1573],$Vs6=[70,135,140,141],$Vt6=[2,278],$Vu6=[2,280],$Vv6=[2,282],$Vw6=[2,87],$Vx6=[51,53,101,102,103,104,119,125,127,190,228],$Vy6=[1,1611],$Vz6=[1,1621],$VA6=[1,1627],$VB6=[1,1626],$VC6=[1,1664],$VD6=[1,1711],$VE6=[1,1744],$VF6=[1,1750],$VG6=[1,1749],$VH6=[1,1770],$VI6=[1,1776],$VJ6=[1,1775],$VK6=[1,1797],$VL6=[1,1803],$VM6=[1,1802],$VN6=[1,1848],$VO6=[1,1914],$VP6=[1,1920],$VQ6=[1,1919],$VR6=[1,1940],$VS6=[1,1946],$VT6=[1,1945],$VU6=[1,1966],$VV6=[1,1972],$VW6=[1,1971],$VX6=[1,2013],$VY6=[1,2019],$VZ6=[1,2051],$V_6=[1,2057],$V$6=[121,135,140,141,191,194],$V07=[2,173],$V17=[1,2077],$V27=[1,2078],$V37=[1,2079],$V47=[1,2080],$V57=[121,135,140,141,156,157,158,159,191,194],$V67=[2,39],$V77=[51,121,135,140,141,156,157,158,159,191,194],$V87=[2,52],$V97=[51,53,121,135,140,141,156,157,158,159,191,194],$Va7=[2,59],$Vb7=[1,2109],$Vc7=[2,276],$Vd7=[2,283],$Ve7=[19,21,40,44,69,71,79,80,81,85,96,97,98,101,102,103,104,111,112,113,114,115,116,117,119,125,127,162,180,190,191,194,216,228,230],$Vf7=[1,2222],$Vg7=[1,2228],$Vh7=[1,2260],$Vi7=[1,2266],$Vj7=[1,2319],$Vk7=[1,2352],$Vl7=[1,2358],$Vm7=[1,2357],$Vn7=[1,2378],$Vo7=[1,2384],$Vp7=[1,2383],$Vq7=[1,2405],$Vr7=[1,2411],$Vs7=[1,2410],$Vt7=[1,2432],$Vu7=[1,2438],$Vv7=[1,2437],$Vw7=[1,2458],$Vx7=[1,2464],$Vy7=[1,2463],$Vz7=[1,2485],$VA7=[1,2491],$VB7=[1,2490],$VC7=[51,53,70,79,80,81,111,119,125,127,190,191,194,228],$VD7=[51,53,70,111,191,194],$VE7=[51,53,70,96,97,98,101,102,103,104,111,191,194],$VF7=[1,2560],$VG7=[2,174],$VH7=[2,178],$VI7=[2,179],$VJ7=[2,180],$VK7=[2,181],$VL7=[2,50],$VM7=[2,57],$VN7=[2,64],$VO7=[2,84],$VP7=[2,80],$VQ7=[1,2643],$VR7=[2,83],$VS7=[51,53,79,80,81,101,102,103,104,119,121,125,127,135,140,141,156,157,158,159,190,191,194,228],$VT7=[51,53,79,80,81,119,121,125,127,135,140,141,156,157,158,159,190,191,194,228],$VU7=[51,53,101,102,103,104,112,113,114,115,116,117,121,135,140,141,156,157,158,159,191,194],$VV7=[51,53,96,97,98,101,102,103,104,121,135,140,141,156,157,158,159,191,194],$VW7=[51,53,112,113,114,115,116,117,121,135,140,141,156,157,158,159,191,194],$VX7=[1,2693],$VY7=[1,2731],$VZ7=[1,2786],$V_7=[1,2875],$V$7=[1,2881],$V08=[1,2964],$V18=[1,2997],$V28=[1,3003],$V38=[1,3002],$V48=[1,3023],$V58=[1,3029],$V68=[1,3028],$V78=[1,3050],$V88=[1,3056],$V98=[1,3055],$Va8=[1,3077],$Vb8=[1,3083],$Vc8=[1,3082],$Vd8=[1,3103],$Ve8=[1,3109],$Vf8=[1,3108],$Vg8=[1,3130],$Vh8=[1,3136],$Vi8=[1,3135],$Vj8=[121,135,140,141,194],$Vk8=[1,3155],$Vl8=[2,53],$Vm8=[2,60],$Vn8=[2,79],$Vo8=[2,85],$Vp8=[2,81],$Vq8=[51,53,101,102,103,104,121,135,140,141,156,157,158,159,191,194],$Vr8=[1,3179],$Vs8=[70,135,140,141,191,194],$Vt8=[1,3188],$Vu8=[1,3189],$Vv8=[1,3190],$Vw8=[1,3191],$Vx8=[70,135,140,141,156,157,158,159,191,194],$Vy8=[51,70,135,140,141,156,157,158,159,191,194],$Vz8=[51,53,70,135,140,141,156,157,158,159,191,194],$VA8=[1,3220],$VB8=[1,3247],$VC8=[1,3270],$VD8=[1,3301],$VE8=[1,3334],$VF8=[1,3340],$VG8=[1,3339],$VH8=[1,3360],$VI8=[1,3366],$VJ8=[1,3365],$VK8=[1,3387],$VL8=[1,3393],$VM8=[1,3392],$VN8=[1,3414],$VO8=[1,3420],$VP8=[1,3419],$VQ8=[1,3440],$VR8=[1,3446],$VS8=[1,3445],$VT8=[1,3467],$VU8=[1,3473],$VV8=[1,3472],$VW8=[1,3550],$VX8=[1,3556],$VY8=[2,175],$VZ8=[2,51],$V_8=[1,3644],$V$8=[2,58],$V09=[1,3677],$V19=[2,82],$V29=[2,172],$V39=[1,3722],$V49=[51,53,70,79,80,81,101,102,103,104,119,125,127,135,140,141,156,157,158,159,190,191,194,228],$V59=[51,53,70,79,80,81,119,125,127,135,140,141,156,157,158,159,190,191,194,228],$V69=[51,53,70,101,102,103,104,112,113,114,115,116,117,135,140,141,156,157,158,159,191,194],$V79=[51,53,70,96,97,98,101,102,103,104,135,140,141,156,157,158,159,191,194],$V89=[51,53,70,112,113,114,115,116,117,135,140,141,156,157,158,159,191,194],$V99=[1,3827],$Va9=[1,3833],$Vb9=[1,3896],$Vc9=[1,3902],$Vd9=[1,3901],$Ve9=[1,3922],$Vf9=[1,3928],$Vg9=[1,3927],$Vh9=[1,3949],$Vi9=[1,3955],$Vj9=[1,3954],$Vk9=[1,4014],$Vl9=[1,4020],$Vm9=[1,4019],$Vn9=[1,4055],$Vo9=[1,4097],$Vp9=[70,135,140,141,194],$Vq9=[1,4127],$Vr9=[51,53,70,101,102,103,104,135,140,141,156,157,158,159,191,194],$Vs9=[1,4151],$Vt9=[1,4174],$Vu9=[1,4268],$Vv9=[1,4274],$Vw9=[1,4273],$Vx9=[1,4294],$Vy9=[1,4300],$Vz9=[1,4299],$VA9=[1,4321],$VB9=[1,4327],$VC9=[1,4326],$VD9=[111,121,135,140,141,191,194],$VE9=[1,4369],$VF9=[1,4393],$VG9=[1,4435],$VH9=[1,4468],$VI9=[1,4508],$VJ9=[1,4531],$VK9=[1,4537],$VL9=[1,4536],$VM9=[1,4557],$VN9=[1,4563],$VO9=[1,4562],$VP9=[1,4584],$VQ9=[1,4590],$VR9=[1,4589],$VS9=[1,4664],$VT9=[1,4707],$VU9=[1,4713],$VV9=[1,4712],$VW9=[1,4748],$VX9=[1,4790],$VY9=[1,4880],$VZ9=[70,111,135,140,141,191,194],$V_9=[1,4935],$V$9=[1,4959],$V0a=[1,4997],$V1a=[1,5043],$V2a=[1,5121],$V3a=[1,5170];

class ShExJisonParser extends JisonParser {
    constructor(yy = {}, lexer = new ShExJisonLexer(yy)) {
        super(yy, lexer);
        this.symbols_ = {"error":2,"shexDoc":3,"initParser":4,"Qdirective_E_Star":5,"Q_O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C_E_Opt":6,"EOF":7,"directive":8,"O_QnotStartAction_E_Or_QstartActions_E_C":9,"notStartAction":10,"startActions":11,"Qstatement_E_Star":12,"statement":13,"O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C":14,"baseDecl":15,"prefixDecl":16,"importDecl":17,"IT_BASE":18,"IRIREF":19,"IT_PREFIX":20,"PNAME_NS":21,"iri":22,"IT_IMPORT":23,"start":24,"shapeExprDecl":25,"IT_start":26,"=":27,"shapeAnd":28,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Star":29,"QcodeDecl_E_Plus":30,"codeDecl":31,"QIT_ABSTRACT_E_Opt":32,"shapeExprLabel":33,"Qrestriction_E_Star":34,"O_QshapeExpression_E_Or_QshapeRef_E_Or_QIT_EXTERNAL_E_C":35,"IT_ABSTRACT":36,"restriction":37,"shapeExpression":38,"shapeRef":39,"IT_EXTERNAL":40,"QIT_NOT_E_Opt":41,"shapeAtomNoRef":42,"QshapeOr_E_Opt":43,"IT_NOT":44,"shapeOr":45,"inlineShapeExpression":46,"inlineShapeOr":47,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Plus":48,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Plus":49,"O_QIT_OR_E_S_QshapeAnd_E_C":50,"IT_OR":51,"O_QIT_AND_E_S_QshapeNot_E_C":52,"IT_AND":53,"shapeNot":54,"inlineShapeAnd":55,"Q_O_QIT_OR_E_S_QinlineShapeAnd_E_C_E_Star":56,"O_QIT_OR_E_S_QinlineShapeAnd_E_C":57,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Star":58,"inlineShapeNot":59,"Q_O_QIT_AND_E_S_QinlineShapeNot_E_C_E_Star":60,"O_QIT_AND_E_S_QinlineShapeNot_E_C":61,"shapeAtom":62,"inlineShapeAtom":63,"nonLitNodeConstraint":64,"QshapeOrRef_E_Opt":65,"litNodeConstraint":66,"shapeOrRef":67,"QnonLitNodeConstraint_E_Opt":68,"(":69,")":70,".":71,"shapeDefinition":72,"nonLitInlineNodeConstraint":73,"QinlineShapeOrRef_E_Opt":74,"litInlineNodeConstraint":75,"inlineShapeOrRef":76,"QnonLitInlineNodeConstraint_E_Opt":77,"inlineShapeDefinition":78,"ATPNAME_LN":79,"ATPNAME_NS":80,"@":81,"Qannotation_E_Star":82,"semanticActions":83,"annotation":84,"IT_LITERAL":85,"QxsFacet_E_Star":86,"datatype":87,"valueSet":88,"QnumericFacet_E_Plus":89,"xsFacet":90,"numericFacet":91,"nonLiteralKind":92,"QstringFacet_E_Star":93,"QstringFacet_E_Plus":94,"stringFacet":95,"IT_IRI":96,"IT_BNODE":97,"IT_NONLITERAL":98,"stringLength":99,"INTEGER":100,"REGEXP":101,"IT_LENGTH":102,"IT_MINLENGTH":103,"IT_MAXLENGTH":104,"numericRange":105,"rawNumeric":106,"numericLength":107,"DECIMAL":108,"DOUBLE":109,"string":110,"^^":111,"IT_MININCLUSIVE":112,"IT_MINEXCLUSIVE":113,"IT_MAXINCLUSIVE":114,"IT_MAXEXCLUSIVE":115,"IT_TOTALDIGITS":116,"IT_FRACTIONDIGITS":117,"Q_O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C_E_Star":118,"{":119,"QtripleExpression_E_Opt":120,"}":121,"O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C":122,"extension":123,"extraPropertySet":124,"IT_CLOSED":125,"tripleExpression":126,"IT_EXTRA":127,"Qpredicate_E_Plus":128,"predicate":129,"oneOfTripleExpr":130,"groupTripleExpr":131,"multiElementOneOf":132,"Q_O_QGT_PIPE_E_S_QgroupTripleExpr_E_C_E_Plus":133,"O_QGT_PIPE_E_S_QgroupTripleExpr_E_C":134,"|":135,"singleElementGroup":136,"multiElementGroup":137,"unaryTripleExpr":138,"QGT_SEMI_E_Opt":139,",":140,";":141,"Q_O_QGT_SEMI_E_S_QunaryTripleExpr_E_C_E_Plus":142,"O_QGT_SEMI_E_S_QunaryTripleExpr_E_C":143,"Q_O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C_E_Opt":144,"O_QtripleConstraint_E_Or_QbracketedTripleExpr_E_C":145,"include":146,"O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C":147,"$":148,"tripleExprLabel":149,"tripleConstraint":150,"bracketedTripleExpr":151,"Qcardinality_E_Opt":152,"cardinality":153,"QsenseFlags_E_Opt":154,"senseFlags":155,"*":156,"+":157,"?":158,"REPEAT_RANGE":159,"^":160,"!":161,"[":162,"QvalueSetValue_E_Star":163,"]":164,"valueSetValue":165,"iriRange":166,"literalRange":167,"languageRange":168,"O_QiriExclusion_E_Plus_Or_QliteralExclusion_E_Plus_Or_QlanguageExclusion_E_Plus_C":169,"QiriExclusion_E_Plus":170,"iriExclusion":171,"QliteralExclusion_E_Plus":172,"literalExclusion":173,"QlanguageExclusion_E_Plus":174,"languageExclusion":175,"Q_O_QGT_TILDE_E_S_QiriExclusion_E_Star_C_E_Opt":176,"QiriExclusion_E_Star":177,"O_QGT_TILDE_E_S_QiriExclusion_E_Star_C":178,"~":179,"-":180,"QGT_TILDE_E_Opt":181,"literal":182,"Q_O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C_E_Opt":183,"QliteralExclusion_E_Star":184,"O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C":185,"LANGTAG":186,"Q_O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C_E_Opt":187,"O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C":188,"QlanguageExclusion_E_Star":189,"&":190,"//":191,"O_Qiri_E_Or_Qliteral_E_C":192,"QcodeDecl_E_Star":193,"%":194,"O_QCODE_E_Or_QGT_MODULO_E_C":195,"CODE":196,"rdfLiteral":197,"numericLiteral":198,"booleanLiteral":199,"a":200,"blankNode":201,"langString":202,"Q_O_QGT_DTYPE_E_S_Qdatatype_E_C_E_Opt":203,"O_QGT_DTYPE_E_S_Qdatatype_E_C":204,"IT_true":205,"IT_false":206,"STRING_LITERAL1":207,"STRING_LITERAL_LONG1":208,"STRING_LITERAL2":209,"STRING_LITERAL_LONG2":210,"LANG_STRING_LITERAL1":211,"LANG_STRING_LITERAL_LONG1":212,"LANG_STRING_LITERAL2":213,"LANG_STRING_LITERAL_LONG2":214,"prefixedName":215,"PNAME_LN":216,"BLANK_NODE_LABEL":217,"O_QIT_EXTENDS_E_Or_QGT_AMP_E_C":218,"extendsShapeExpression":219,"extendsShapeOr":220,"extendsShapeAnd":221,"Q_O_QIT_OR_E_S_QextendsShapeAnd_E_C_E_Star":222,"O_QIT_OR_E_S_QextendsShapeAnd_E_C":223,"extendsShapeNot":224,"Q_O_QIT_AND_E_S_QextendsShapeNot_E_C_E_Star":225,"O_QIT_AND_E_S_QextendsShapeNot_E_C":226,"extendsShapeAtom":227,"IT_EXTENDS":228,"O_QIT_RESTRICTS_E_Or_QGT_MINUS_E_C":229,"IT_RESTRICTS":230,"$accept":0,"$end":1};
        this.terminals_ = {2:"error",7:"EOF",18:"IT_BASE",19:"IRIREF",20:"IT_PREFIX",21:"PNAME_NS",23:"IT_IMPORT",26:"IT_start",27:"=",36:"IT_ABSTRACT",40:"IT_EXTERNAL",44:"IT_NOT",51:"IT_OR",53:"IT_AND",69:"(",70:")",71:".",79:"ATPNAME_LN",80:"ATPNAME_NS",81:"@",85:"IT_LITERAL",96:"IT_IRI",97:"IT_BNODE",98:"IT_NONLITERAL",100:"INTEGER",101:"REGEXP",102:"IT_LENGTH",103:"IT_MINLENGTH",104:"IT_MAXLENGTH",108:"DECIMAL",109:"DOUBLE",111:"^^",112:"IT_MININCLUSIVE",113:"IT_MINEXCLUSIVE",114:"IT_MAXINCLUSIVE",115:"IT_MAXEXCLUSIVE",116:"IT_TOTALDIGITS",117:"IT_FRACTIONDIGITS",119:"{",121:"}",125:"IT_CLOSED",127:"IT_EXTRA",135:"|",140:",",141:";",148:"$",156:"*",157:"+",158:"?",159:"REPEAT_RANGE",160:"^",161:"!",162:"[",164:"]",179:"~",180:"-",186:"LANGTAG",190:"&",191:"//",194:"%",196:"CODE",200:"a",205:"IT_true",206:"IT_false",207:"STRING_LITERAL1",208:"STRING_LITERAL_LONG1",209:"STRING_LITERAL2",210:"STRING_LITERAL_LONG2",211:"LANG_STRING_LITERAL1",212:"LANG_STRING_LITERAL_LONG1",213:"LANG_STRING_LITERAL2",214:"LANG_STRING_LITERAL_LONG2",216:"PNAME_LN",217:"BLANK_NODE_LABEL",228:"IT_EXTENDS",230:"IT_RESTRICTS"};
        this.productions_ = [0,[3,4],[4,0],[5,0],[5,2],[9,1],[9,1],[12,0],[12,2],[14,2],[6,0],[6,1],[8,1],[8,1],[8,1],[15,2],[16,3],[17,2],[10,1],[10,1],[24,4],[11,1],[30,1],[30,2],[13,1],[13,1],[25,4],[32,0],[32,1],[34,0],[34,2],[35,1],[35,1],[35,1],[38,3],[38,3],[38,2],[43,0],[43,1],[46,1],[45,1],[45,2],[50,2],[48,1],[48,2],[52,2],[49,1],[49,2],[29,0],[29,2],[47,2],[57,2],[56,0],[56,2],[28,2],[58,0],[58,2],[55,2],[61,2],[60,0],[60,2],[54,2],[41,0],[41,1],[59,2],[62,2],[62,1],[62,2],[62,3],[62,1],[65,0],[65,1],[68,0],[68,1],[42,2],[42,1],[42,2],[42,3],[42,1],[63,2],[63,1],[63,2],[63,3],[63,1],[74,0],[74,1],[77,0],[77,1],[67,1],[67,1],[76,1],[76,1],[39,1],[39,1],[39,2],[66,3],[82,0],[82,2],[64,3],[75,2],[75,2],[75,2],[75,1],[86,0],[86,2],[89,1],[89,2],[73,2],[73,1],[93,0],[93,2],[94,1],[94,2],[92,1],[92,1],[92,1],[90,1],[90,1],[95,2],[95,1],[99,1],[99,1],[99,1],[91,2],[91,2],[106,1],[106,1],[106,1],[106,3],[105,1],[105,1],[105,1],[105,1],[107,1],[107,1],[72,3],[78,4],[122,1],[122,1],[122,1],[118,0],[118,2],[120,0],[120,1],[124,2],[128,1],[128,2],[126,1],[130,1],[130,1],[132,2],[134,2],[133,1],[133,2],[131,1],[131,1],[136,2],[139,0],[139,1],[139,1],[137,3],[143,2],[143,2],[142,1],[142,2],[138,2],[138,1],[147,2],[144,0],[144,1],[145,1],[145,1],[151,6],[152,0],[152,1],[150,6],[154,0],[154,1],[153,1],[153,1],[153,1],[153,1],[155,1],[155,2],[155,1],[155,2],[88,3],[163,0],[163,2],[165,1],[165,1],[165,1],[165,2],[170,1],[170,2],[172,1],[172,2],[174,1],[174,2],[169,1],[169,1],[169,1],[166,2],[177,0],[177,2],[178,2],[176,0],[176,1],[171,3],[181,0],[181,1],[167,2],[184,0],[184,2],[185,2],[183,0],[183,1],[173,3],[168,2],[168,2],[189,0],[189,2],[188,2],[187,0],[187,1],[175,3],[146,2],[84,3],[192,1],[192,1],[83,1],[193,0],[193,2],[31,3],[195,1],[195,1],[182,1],[182,1],[182,1],[129,1],[129,1],[87,1],[33,1],[33,1],[149,1],[149,1],[198,1],[198,1],[198,1],[197,1],[197,2],[204,2],[203,0],[203,1],[199,1],[199,1],[110,1],[110,1],[110,1],[110,1],[202,1],[202,1],[202,1],[202,1],[22,1],[22,1],[215,1],[215,1],[201,1],[123,2],[219,1],[220,2],[223,2],[222,0],[222,2],[221,2],[226,2],[225,0],[225,2],[224,2],[227,2],[227,1],[227,2],[227,3],[227,1],[218,1],[218,1],[37,2],[229,1],[229,1]];
        this.table = [o($V0,[2,2],{3:1,4:2}),{1:[3]},o($V0,[2,3],{5:3}),o($V1,$V2,{6:4,8:5,14:6,15:7,16:8,17:9,9:10,10:14,11:15,24:16,25:17,30:18,32:20,31:21,7:[2,10],18:[1,11],20:[1,12],23:[1,13],26:[1,19],36:$V3,194:$V4}),{7:[1,24]},o($V0,[2,4]),{7:[2,11]},o($V0,$V5),o($V0,$V6),o($V0,$V7),o($V8,[2,7],{12:25}),{19:[1,26]},{21:[1,27]},{19:$V9,21:$Va,22:28,215:30,216:$Vb},o($V8,[2,5]),o($V8,[2,6]),o($V8,$Vc),o($V8,$Vd),o($V8,[2,21],{31:33,194:$V4}),{27:[1,34]},{19:$Ve,21:$Vf,22:36,33:35,201:37,215:39,216:$Vg,217:$Vh},o($V0,[2,22]),o($V1,[2,28]),{19:$Vi,21:$Vj,22:43,215:45,216:$Vk},{1:[2,1]},o($V1,$V2,{13:48,8:49,10:50,15:51,16:52,17:53,24:54,25:55,32:60,7:[2,9],18:[1,56],20:[1,57],23:[1,58],26:[1,59],36:$V3}),o($V0,$Vl),{19:$V9,21:$Va,22:61,215:30,216:$Vb},o($V0,$Vm),o($V0,$Vn),o($V0,$Vo),o($V0,$Vp),o($V0,$Vq),o($V0,[2,23]),o($Vr,$Vs,{28:62,54:63,41:64,44:$Vt}),o($Vu,$Vv,{34:66}),o($Vu,$Vw),o($Vu,$Vx),o($Vu,$Vn),o($Vu,$Vo),o($Vu,$Vy),o($Vu,$Vp),o($Vu,$Vq),{194:[1,69],195:67,196:[1,68]},o($Vz,$Vn),o($Vz,$Vo),o($Vz,$Vp),o($Vz,$Vq),o($V8,[2,8]),o($V8,[2,24]),o($V8,[2,25]),o($V8,$V5),o($V8,$V6),o($V8,$V7),o($V8,$Vc),o($V8,$Vd),{19:[1,70]},{21:[1,71]},{19:$VA,21:$VB,22:72,215:74,216:$VC},{27:[1,77]},{19:$Ve,21:$Vf,22:36,33:78,201:37,215:39,216:$Vg,217:$Vh},o($V0,$VD),o($VE,$VF,{29:79}),o($VG,$VH,{58:80}),o($VI,$VJ,{62:81,64:82,66:83,67:84,73:87,75:88,72:89,39:90,92:91,94:92,87:94,88:95,89:96,78:97,95:104,22:105,91:107,118:108,99:109,215:112,105:113,107:114,19:$VK,21:$VL,69:[1,85],71:[1,86],79:[1,98],80:[1,99],81:[1,100],85:$VM,96:$VN,97:$VO,98:$VP,101:$VQ,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:$V_,216:$V$}),o($Vr,$V01),o($V11,$Vs,{35:126,37:127,38:128,39:129,229:131,41:132,40:[1,130],44:[1,133],79:[1,134],80:[1,135],81:[1,136],180:$V21,230:$V31}),o($V0,$V41),o($V0,$V51),o($V0,$V61),o($V8,$Vl),{19:$VA,21:$VB,22:139,215:74,216:$VC},o($V8,$Vm),o($V8,$Vn),o($V8,$Vo),o($V8,$Vp),o($V8,$Vq),o($Vr,$Vs,{28:140,54:141,41:142,44:$Vt}),o($Vu,$Vv,{34:143}),o($V8,$V71,{50:144,51:$V81}),o($VE,$V91,{52:146,53:$Va1}),o($VG,$Vb1),o($VG,$Vc1,{65:148,67:149,72:150,39:151,78:152,118:156,79:$Vd1,80:$Ve1,81:$Vf1,119:$VJ,125:$VJ,127:$VJ,190:$VJ,228:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:157,64:158,73:159,92:160,94:161,95:165,99:166,96:$Vi1,97:$Vj1,98:$Vk1,101:$Vl1,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{38:168,41:169,39:171,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:175}),o($Vt1,$Vs1,{82:176}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:177}),o($Vr1,$Vz1,{99:109,95:178,101:$VQ,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:179}),o($VA1,$VB1,{86:180}),o($VA1,$VB1,{86:181}),o($Vt1,$VC1,{105:113,107:114,91:182,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:183}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,187],21:[1,191],22:185,33:184,201:186,215:188,216:[1,190],217:[1,189]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{163:192}),o($VN1,$VO1),{119:[1,193],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},{100:[1,202]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,204],106:203,108:[1,205],109:[1,206],110:207,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,212]},{100:[2,120]},{100:[2,121]},{100:[2,122]},o($VA1,$Vp),o($VA1,$Vq),o($VY1,[2,129]),o($VY1,[2,130]),o($VY1,[2,131]),o($VY1,[2,132]),{100:[2,133]},{100:[2,134]},o($V8,$VZ1),o($Vu,[2,30]),o($V8,$V_1),o($V8,$V$1,{45:213,48:214,49:215,50:216,52:217,51:$V81,53:$Va1}),o($V8,$V02),o($VI,$VJ,{67:218,72:219,39:220,78:221,118:225,79:[1,222],80:[1,223],81:[1,224]}),o($VI,$VJ,{73:87,75:88,92:91,94:92,87:94,88:95,89:96,78:97,95:104,22:105,91:107,118:108,99:109,215:112,105:113,107:114,42:226,64:227,66:228,72:229,19:$VK,21:$VL,69:[1,230],71:[1,231],85:$VM,96:$VN,97:$VO,98:$VP,101:$VQ,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:$V_,216:$V$}),o($V11,$V01,{39:232,79:$Vd1,80:$Ve1,81:$Vf1}),o($VG,$VE1),o($VG,$VF1),{19:[1,236],21:[1,240],22:234,33:233,201:235,215:237,216:[1,239],217:[1,238]},o($V12,[2,288]),o($V12,[2,289]),o($V8,$VD),o($VE,$VF,{29:241}),o($VG,$VH,{58:242}),o($VI,$VJ,{62:243,64:244,66:245,67:246,73:249,75:250,72:251,39:252,92:253,94:254,87:256,88:257,89:258,78:259,95:266,22:267,91:269,118:270,99:271,215:274,105:275,107:276,19:$V22,21:$V32,69:[1,247],71:[1,248],79:[1,260],80:[1,261],81:[1,262],85:$V42,96:$V52,97:$V62,98:$V72,101:$V82,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:$V92,216:$Va2}),o($V11,$Vs,{37:127,229:131,35:279,38:280,39:281,41:283,40:[1,282],44:[1,284],79:[1,285],80:[1,286],81:[1,287],180:$V21,230:$V31}),o($VE,$Vb2),o($Vr,$Vs,{28:288,54:289,41:290,44:$Vt}),o($VG,$Vc2),o($Vr,$Vs,{54:291,41:292,44:$Vt}),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:293}),o($VG,$VE1),o($VG,$VF1),{19:[1,297],21:[1,301],22:295,33:294,201:296,215:298,216:[1,300],217:[1,299]},{119:[1,302],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:303}),o($Vh2,$Vy1,{93:304}),o($Vt1,$Vz1,{99:166,95:305,101:$Vl1,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,306]},o($Vh2,$VT1),{70:[1,307]},o($VI,$VJ,{42:308,64:309,66:310,72:311,73:314,75:315,78:316,92:317,94:318,87:320,88:321,89:322,118:323,95:327,22:328,91:330,99:331,215:334,105:335,107:336,19:[1,333],21:[1,338],69:[1,312],71:[1,313],85:[1,319],96:[1,324],97:[1,325],98:[1,326],101:$Vi2,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:[1,329],216:[1,337]}),o($V11,$V01,{39:339,79:$Vj2,80:$Vk2,81:$Vl2}),{45:343,48:344,49:345,50:346,51:$Vm2,52:347,53:$Vn2},o($Vo2,$VE1),o($Vo2,$VF1),{19:[1,353],21:[1,357],22:351,33:350,201:352,215:354,216:[1,356],217:[1,355]},o($Vp2,$Vq2,{83:358,84:359,193:360,191:[1,361]}),o($Vr2,$Vq2,{83:362,84:363,193:364,191:$Vs2}),o($Vr1,$Vt2,{99:109,95:366,101:$VQ,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:367,95:368,91:369,99:370,105:372,107:373,101:$Vw2,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:367,95:368,91:369,99:370,105:372,107:373,101:$Vw2,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:367,95:368,91:369,99:370,105:372,107:373,101:$Vw2,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:374,84:375,193:376,191:[1,377]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,378],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VV2,$VW2,{120:410,126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,121:$VX2,148:$VY2,190:$VZ2}),o($VI,[2,141]),o($VI,[2,137]),o($VI,[2,138]),o($VI,[2,139]),o($Vr,$Vs,{219:423,220:424,221:425,224:426,41:427,44:$Vt}),{19:$V_2,21:$V$2,22:430,128:428,129:429,200:$V03,215:433,216:$V13},o($V23,[2,285]),o($V23,[2,286]),o($Vx1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),o($VN1,$V73),{111:[1,436]},{111:$V83},{111:$V93},{111:$Va3},{111:$Vb3},o($VN1,$Vc3),o($V8,$Vd3),o($V8,$Ve3,{50:437,51:$V81}),o($VE,$VF,{29:438,52:439,53:$Va1}),o($VE,$Vf3),o($VG,$Vg3),o($Vu,[2,287]),o($Vu,$Vv1),o($Vu,$Vw1),o($Vh3,$Vs1,{82:440}),o($Vu,$VE1),o($Vu,$VF1),{19:[1,444],21:[1,448],22:442,33:441,201:443,215:445,216:[1,447],217:[1,446]},{119:[1,449],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($V8,$Vi3,{48:214,49:215,50:216,52:217,43:450,45:451,51:$V81,53:$Va1}),o($VG,$Vc1,{67:149,72:150,39:151,78:152,118:156,65:452,79:$Vd1,80:$Ve1,81:$Vf1,119:$VJ,125:$VJ,127:$VJ,190:$VJ,228:$VJ}),o($VG,$Vj3),o($VG,$Vh1,{64:158,73:159,92:160,94:161,95:165,99:166,68:453,96:$Vi1,97:$Vj1,98:$Vk1,101:$Vl1,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:454,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vk3),o($V8,$Vi3,{48:214,49:215,50:216,52:217,45:451,43:455,51:$V81,53:$Va1}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($V8,$V71,{50:456,51:$Vl3}),o($VE,$V91,{52:458,53:$Vm3}),o($VG,$Vb1),o($VG,$Vc1,{65:460,67:461,72:462,39:463,78:464,118:468,79:$Vn3,80:$Vo3,81:$Vp3,119:$VJ,125:$VJ,127:$VJ,190:$VJ,228:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:469,64:470,73:471,92:472,94:473,95:477,99:478,96:$Vq3,97:$Vr3,98:$Vs3,101:$Vt3,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:480,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:481}),o($Vt1,$Vs1,{82:482}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:483}),o($Vr1,$Vz1,{99:271,95:484,101:$V82,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:485}),o($VA1,$VB1,{86:486}),o($VA1,$VB1,{86:487}),o($Vt1,$VC1,{105:275,107:276,91:488,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:489}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,493],21:[1,497],22:491,33:490,201:492,215:494,216:[1,496],217:[1,495]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{163:498}),o($VN1,$VO1),{119:[1,499],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},{100:[1,500]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,502],106:501,108:[1,503],109:[1,504],110:505,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,506]},o($VA1,$Vp),o($VA1,$Vq),o($V8,$VZ1),o($V8,$V_1),o($V8,$V$1,{45:507,48:508,49:509,50:510,52:511,51:$Vl3,53:$Vm3}),o($V8,$V02),o($VI,$VJ,{73:249,75:250,92:253,94:254,87:256,88:257,89:258,78:259,95:266,22:267,91:269,118:270,99:271,215:274,105:275,107:276,42:512,64:513,66:514,72:515,19:$V22,21:$V32,69:[1,516],71:[1,517],85:$V42,96:$V52,97:$V62,98:$V72,101:$V82,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:$V92,216:$Va2}),o($V11,$V01,{39:518,79:$Vn3,80:$Vo3,81:$Vp3}),o($VG,$VE1),o($VG,$VF1),{19:[1,522],21:[1,526],22:520,33:519,201:521,215:523,216:[1,525],217:[1,524]},o($VE,$Vu3),o($VG,$VH,{58:527}),o($VI,$VJ,{62:528,64:529,66:530,67:531,73:534,75:535,72:536,39:537,92:538,94:539,87:541,88:542,89:543,78:544,95:551,22:552,91:554,118:555,99:556,215:559,105:560,107:561,19:[1,558],21:[1,563],69:[1,532],71:[1,533],79:[1,545],80:[1,546],81:[1,547],85:[1,540],96:[1,548],97:[1,549],98:[1,550],101:$Vv3,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:[1,553],216:[1,562]}),o($VG,$Vw3),o($VI,$VJ,{62:564,64:565,66:566,67:567,73:570,75:571,72:572,39:573,92:574,94:575,87:577,88:578,89:579,78:580,95:587,22:588,91:590,118:591,99:592,215:595,105:596,107:597,19:[1,594],21:[1,599],69:[1,568],71:[1,569],79:[1,581],80:[1,582],81:[1,583],85:[1,576],96:[1,584],97:[1,585],98:[1,586],101:$Vx3,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:[1,589],216:[1,598]}),o($Vr2,$Vq2,{84:363,193:364,83:600,191:$Vs2}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:601,121:$VX2,148:$VY2,190:$VZ2}),o($Vr2,$Vq2,{84:363,193:364,83:602,191:$Vs2}),o($Vt1,$Vt2,{99:166,95:603,101:$Vl1,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V33),o($VG,$Vy3),{43:604,45:605,48:344,49:345,50:346,51:$Vm2,52:347,53:$Vn2,70:$Vi3},o($VI,$VJ,{65:606,67:607,72:608,39:609,78:610,118:611,51:$Vc1,53:$Vc1,70:$Vc1,79:$Vj2,80:$Vk2,81:$Vl2}),o($Vz3,$Vj3),o($Vz3,$Vh1,{68:612,64:613,73:614,92:615,94:616,95:620,99:621,96:[1,617],97:[1,618],98:[1,619],101:$VA3,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:623,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vz3,$Vk3),o($VB3,$Vs1,{82:624}),o($VC3,$Vs1,{82:625}),o($VD3,$Vs1,{82:626}),o($VE3,$Vy1,{93:627}),o($VB3,$Vz1,{99:331,95:628,101:$Vi2,102:$VR,103:$VS,104:$VT}),o($VF3,$VB1,{86:629}),o($VF3,$VB1,{86:630}),o($VF3,$VB1,{86:631}),o($VC3,$VC1,{105:335,107:336,91:632,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),{119:[1,633],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($VE3,$VG1),o($VE3,$VH1),o($VE3,$VI1),o($VE3,$VJ1),o($VF3,$VK1),o($VL1,$VM1,{163:634}),o($VG3,$VO1),{100:[1,635]},o($VE3,$VT1),o($VF3,$Vn),o($VF3,$Vo),{100:[1,637],106:636,108:[1,638],109:[1,639],110:640,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,641]},o($VF3,$Vp),o($VF3,$Vq),{43:642,45:605,48:344,49:345,50:346,51:$Vm2,52:347,53:$Vn2,70:$Vi3},o($Vz3,$VE1),o($Vz3,$VF1),{19:[1,646],21:[1,650],22:644,33:643,201:645,215:647,216:[1,649],217:[1,648]},{70:$Vd3},{50:651,51:$Vm2,70:$Ve3},o($VH3,$VF,{29:652,52:653,53:$Vn2}),o($VH3,$Vf3),o($Vz3,$Vg3),o($Vr,$Vs,{28:654,54:655,41:656,44:$Vt}),o($Vr,$Vs,{54:657,41:658,44:$Vt}),o($Vo2,$VB2),o($Vo2,$Vw),o($Vo2,$Vx),o($Vo2,$Vn),o($Vo2,$Vo),o($Vo2,$Vy),o($Vo2,$Vp),o($Vo2,$Vq),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:659,194:[1,660]}),{19:$VM3,21:$VN3,22:662,129:661,200:$VO3,215:665,216:$VP3},o($VG,$VQ3),o($Vt1,$VK3),o($VG,$VL3,{31:668,194:[1,669]}),{19:$VM3,21:$VN3,22:662,129:670,200:$VO3,215:665,216:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{100:[1,671]},o($VA1,$VT1),{100:[1,673],106:672,108:[1,674],109:[1,675],110:676,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,677]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:678,194:[1,679]}),{19:$VM3,21:$VN3,22:662,129:680,200:$VO3,215:665,216:$VP3},o($VA1,$VW3),o($VL1,[2,188]),o($VL1,[2,189]),o($VL1,[2,190]),o($VL1,[2,191]),{169:681,170:682,171:685,172:683,173:686,174:684,175:687,180:[1,688]},o($VL1,[2,206],{176:689,178:690,179:[1,691]}),o($VL1,[2,215],{183:692,185:693,179:[1,694]}),o($VL1,[2,223],{187:695,188:696,179:$VX3}),{179:$VX3,188:698},o($VY3,$Vn),o($VY3,$Vo),o($VY3,$VZ3),o($VY3,$V_3),o($VY3,$V$3),o($VY3,$Vp),o($VY3,$Vq),o($VY3,$V04),o($VY3,$V14,{203:699,204:700,111:[1,701]}),o($VY3,$V24),o($VY3,$V34),o($VY3,$V44),o($VY3,$V54),o($VY3,$V64),o($VY3,$V74),o($VY3,$V84),o($VY3,$V94),o($VY3,$Va4),o($Vb4,$V83),o($Vb4,$V93),o($Vb4,$Va3),o($Vb4,$Vb3),{121:[1,702]},{121:[2,143]},{121:$Vc4},{121:$Vd4,133:703,134:704,135:$Ve4},{121:$Vf4},o($Vg4,$Vh4),o($Vg4,$Vi4),o($Vg4,$Vj4,{139:706,142:707,143:710,140:$Vk4,141:$Vl4}),o($Vm4,$Vn4,{145:711,150:712,151:713,154:714,155:716,69:[1,715],160:$Vo4,161:$Vp4}),o($Vq4,$Vr4),o($VV2,[2,169]),{19:[1,722],21:[1,726],22:720,149:719,201:721,215:723,216:[1,725],217:[1,724]},{19:[1,730],21:[1,734],22:728,149:727,201:729,215:731,216:[1,733],217:[1,732]},o($VI,[2,269]),o($VI,[2,270]),o($Vs4,[2,273],{222:735}),o($Vt4,$Vu4,{225:736}),o($VI,$VJ,{227:737,73:738,75:739,76:740,92:743,94:744,87:746,88:747,89:748,78:749,39:750,95:754,22:755,91:757,118:758,99:762,215:765,105:766,107:767,19:[1,764],21:[1,769],69:[1,741],71:[1,742],79:[1,759],80:[1,760],81:[1,761],85:[1,745],96:$Vv4,97:$Vw4,98:$Vx4,101:$Vy4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:[1,756],216:[1,768]}),o($VI,[2,144],{22:430,215:433,129:770,19:$V_2,21:$V$2,200:$V03,216:$V13}),o($Vz4,[2,145]),o($Vz4,$VA4),o($Vz4,$VB4),o($Vz4,$Vn),o($Vz4,$Vo),o($Vz4,$Vp),o($Vz4,$Vq),{19:[1,773],21:[1,776],22:772,87:771,215:774,216:[1,775]},o($VE,$VC4),o($V8,$VD4,{50:144,51:$V81}),o($VG,$VE4),o($VF4,$Vq2,{83:777,84:778,193:779,191:[1,780]}),o($Vu,$VB2),o($Vu,$Vw),o($Vu,$Vx),o($Vu,$Vn),o($Vu,$Vo),o($Vu,$Vy),o($Vu,$Vp),o($Vu,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:781,121:$VX2,148:$VY2,190:$VZ2}),o($V8,$VG4),o($V8,$VH4),o($VG,$VI4),o($VG,$VJ4),{70:[1,782]},o($V8,$VK4),o($VE,$Vb2),o($Vr,$Vs,{28:783,54:784,41:785,44:$Vt}),o($VG,$Vc2),o($Vr,$Vs,{54:786,41:787,44:$Vt}),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:788}),o($VG,$VE1),o($VG,$VF1),{19:[1,792],21:[1,796],22:790,33:789,201:791,215:793,216:[1,795],217:[1,794]},{119:[1,797],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:798}),o($Vh2,$Vy1,{93:799}),o($Vt1,$Vz1,{99:478,95:800,101:$Vt3,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,801]},o($Vh2,$VT1),{70:[1,802]},o($Vp2,$Vq2,{83:803,84:804,193:805,191:[1,806]}),o($Vr2,$Vq2,{83:807,84:808,193:809,191:$VL4}),o($Vr1,$Vt2,{99:271,95:811,101:$V82,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:812,95:813,91:814,99:815,105:817,107:818,101:$VM4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:812,95:813,91:814,99:815,105:817,107:818,101:$VM4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:812,95:813,91:814,99:815,105:817,107:818,101:$VM4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:819,84:820,193:821,191:[1,822]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,823],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:824,121:$VX2,148:$VY2,190:$VZ2}),o($Vx1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),o($VN1,$V73),{111:[1,825]},o($VN1,$Vc3),o($V8,$Vd3),o($V8,$Ve3,{50:826,51:$Vl3}),o($VE,$VF,{29:827,52:828,53:$Vm3}),o($VE,$Vf3),o($VG,$Vg3),o($V8,$Vi3,{48:508,49:509,50:510,52:511,43:829,45:830,51:$Vl3,53:$Vm3}),o($VG,$Vc1,{67:461,72:462,39:463,78:464,118:468,65:831,79:$Vn3,80:$Vo3,81:$Vp3,119:$VJ,125:$VJ,127:$VJ,190:$VJ,228:$VJ}),o($VG,$Vj3),o($VG,$Vh1,{64:470,73:471,92:472,94:473,95:477,99:478,68:832,96:$Vq3,97:$Vr3,98:$Vs3,101:$Vt3,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:833,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vk3),o($V8,$Vi3,{48:508,49:509,50:510,52:511,45:830,43:834,51:$Vl3,53:$Vm3}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VE,$V91,{52:835,53:[1,836]}),o($VG,$Vb1),o($VG,$Vc1,{65:837,67:838,72:839,39:840,78:841,118:845,79:[1,842],80:[1,843],81:[1,844],119:$VJ,125:$VJ,127:$VJ,190:$VJ,228:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:846,64:847,73:848,92:849,94:850,95:854,99:855,96:[1,851],97:[1,852],98:[1,853],101:$VN4,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:857,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:858}),o($Vt1,$Vs1,{82:859}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:860}),o($Vr1,$Vz1,{99:556,95:861,101:$Vv3,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:862}),o($VA1,$VB1,{86:863}),o($VA1,$VB1,{86:864}),o($Vt1,$VC1,{105:560,107:561,91:865,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:866}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,870],21:[1,874],22:868,33:867,201:869,215:871,216:[1,873],217:[1,872]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{163:875}),o($VN1,$VO1),{119:[1,876],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},{100:[1,877]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,879],106:878,108:[1,880],109:[1,881],110:882,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,883]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$Vb1),o($VG,$Vc1,{65:884,67:885,72:886,39:887,78:888,118:892,79:[1,889],80:[1,890],81:[1,891],119:$VJ,125:$VJ,127:$VJ,190:$VJ,228:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:893,64:894,73:895,92:896,94:897,95:901,99:902,96:[1,898],97:[1,899],98:[1,900],101:$VO4,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:904,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:905}),o($Vt1,$Vs1,{82:906}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:907}),o($Vr1,$Vz1,{99:592,95:908,101:$Vx3,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:909}),o($VA1,$VB1,{86:910}),o($VA1,$VB1,{86:911}),o($Vt1,$VC1,{105:596,107:597,91:912,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:913}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,917],21:[1,921],22:915,33:914,201:916,215:918,216:[1,920],217:[1,919]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{163:922}),o($VN1,$VO1),{119:[1,923],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},{100:[1,924]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,926],106:925,108:[1,927],109:[1,928],110:929,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,930]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$VV3),{121:[1,931]},o($VG,$VJ3),o($Vh2,$VR3),{70:$VG4},{70:$VH4},o($Vz3,$VI4),o($Vz3,$Ve2),o($Vz3,$Vv1),o($Vz3,$Vw1),o($VC3,$Vs1,{82:932}),{119:[1,933],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($Vz3,$VJ4),o($Vz3,$Vg2),o($VC3,$Vs1,{82:934}),o($VP4,$Vy1,{93:935}),o($VC3,$Vz1,{99:621,95:936,101:$VA3,102:$VR,103:$VS,104:$VT}),o($VP4,$VG1),o($VP4,$VH1),o($VP4,$VI1),o($VP4,$VJ1),{100:[1,937]},o($VP4,$VT1),{70:[1,938]},o($VQ4,$Vq2,{83:939,84:940,193:941,191:[1,942]}),o($VR4,$Vq2,{83:943,84:944,193:945,191:$VS4}),o($VT4,$Vq2,{83:947,84:948,193:949,191:[1,950]}),o($VB3,$Vt2,{99:331,95:951,101:$Vi2,102:$VR,103:$VS,104:$VT}),o($VE3,$Vu2),o($VC3,$Vv2,{90:952,95:953,91:954,99:955,105:957,107:958,101:$VU4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VC3,$Vx2,{90:952,95:953,91:954,99:955,105:957,107:958,101:$VU4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VC3,$Vy2,{90:952,95:953,91:954,99:955,105:957,107:958,101:$VU4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VG3,$Vz2),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:959,121:$VX2,148:$VY2,190:$VZ2}),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,960],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VE3,$V33),o($VG3,$V43),o($VG3,$V53),o($VG3,$V63),o($VG3,$V73),{111:[1,961]},o($VG3,$Vc3),{70:$VK4},o($Vz3,$VB2),o($Vz3,$Vw),o($Vz3,$Vx),o($Vz3,$Vn),o($Vz3,$Vo),o($Vz3,$Vy),o($Vz3,$Vp),o($Vz3,$Vq),o($VH3,$VC4),{50:962,51:$Vm2,70:$VD4},o($Vz3,$VE4),o($VH3,$Vu3),o($Vz3,$VH,{58:963}),o($VI,$VJ,{62:964,64:965,66:966,67:967,73:970,75:971,72:972,39:973,92:974,94:975,87:977,88:978,89:979,78:980,95:987,22:988,91:990,118:991,99:992,215:995,105:996,107:997,19:[1,994],21:[1,999],69:[1,968],71:[1,969],79:[1,981],80:[1,982],81:[1,983],85:[1,976],96:[1,984],97:[1,985],98:[1,986],101:$VV4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:[1,989],216:[1,998]}),o($Vz3,$Vw3),o($VI,$VJ,{62:1000,64:1001,66:1002,67:1003,73:1006,75:1007,72:1008,39:1009,92:1010,94:1011,87:1013,88:1014,89:1015,78:1016,95:1023,22:1024,91:1026,118:1027,99:1028,215:1031,105:1032,107:1033,19:[1,1030],21:[1,1035],69:[1,1004],71:[1,1005],79:[1,1017],80:[1,1018],81:[1,1019],85:[1,1012],96:[1,1020],97:[1,1021],98:[1,1022],101:$VW4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:[1,1025],216:[1,1034]}),o($Vp2,$VX4),{19:$Vi,21:$Vj,22:1036,215:45,216:$Vk},{19:$VY4,21:$VZ4,22:1038,100:[1,1049],108:[1,1050],109:[1,1051],110:1048,182:1039,192:1037,197:1042,198:1043,199:1044,202:1047,205:[1,1052],206:[1,1053],207:[1,1058],208:[1,1059],209:[1,1060],210:[1,1061],211:[1,1054],212:[1,1055],213:[1,1056],214:[1,1057],215:1041,216:$V_4},o($V$4,$VA4),o($V$4,$VB4),o($V$4,$Vn),o($V$4,$Vo),o($V$4,$Vp),o($V$4,$Vq),o($Vr2,$VX4),{19:$Vi,21:$Vj,22:1062,215:45,216:$Vk},{19:$V05,21:$V15,22:1064,100:[1,1075],108:[1,1076],109:[1,1077],110:1074,182:1065,192:1063,197:1068,198:1069,199:1070,202:1073,205:[1,1078],206:[1,1079],207:[1,1084],208:[1,1085],209:[1,1086],210:[1,1087],211:[1,1080],212:[1,1081],213:[1,1082],214:[1,1083],215:1067,216:$V25},o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),o($VA1,$V73),{111:[1,1088]},o($VA1,$Vc3),o($VA2,$VX4),{19:$Vi,21:$Vj,22:1089,215:45,216:$Vk},{19:$V35,21:$V45,22:1091,100:[1,1102],108:[1,1103],109:[1,1104],110:1101,182:1092,192:1090,197:1095,198:1096,199:1097,202:1100,205:[1,1105],206:[1,1106],207:[1,1111],208:[1,1112],209:[1,1113],210:[1,1114],211:[1,1107],212:[1,1108],213:[1,1109],214:[1,1110],215:1094,216:$V55},o($VL1,[2,192]),o($VL1,[2,199],{171:1115,180:$V65}),o($VL1,[2,200],{173:1117,180:$V75}),o($VL1,[2,201],{175:1119,180:$V85}),o($V95,[2,193]),o($V95,[2,195]),o($V95,[2,197]),{19:$Va5,21:$Vb5,22:1121,100:$Vc5,108:$Vd5,109:$Ve5,110:1132,182:1122,186:$Vf5,197:1126,198:1127,199:1128,202:1131,205:$Vg5,206:$Vh5,207:$Vi5,208:$Vj5,209:$Vk5,210:$Vl5,211:$Vm5,212:$Vn5,213:$Vo5,214:$Vp5,215:1125,216:$Vq5},o($VL1,[2,202]),o($VL1,[2,207]),o($V95,[2,203],{177:1146}),o($VL1,[2,211]),o($VL1,[2,216]),o($V95,[2,212],{184:1147}),o($VL1,[2,218]),o($VL1,[2,224]),o($V95,[2,220],{189:1148}),o($VL1,[2,219]),o($VY3,$Vr5),o($VY3,$Vs5),{19:$VC2,21:$VD2,22:1150,87:1149,215:389,216:$VU2},o($VD1,$Vt5),{121:$Vu5,134:1151,135:$Ve4},o($Vg4,$Vv5),o($VV2,$VW2,{136:415,137:416,138:417,144:418,146:419,147:420,131:1152,148:$VY2,190:$VZ2}),o($Vg4,$Vw5),o($Vg4,$Vj4,{139:1153,143:1154,140:$Vk4,141:$Vl4}),o($VV2,$VW2,{144:418,146:419,147:420,138:1155,121:$Vx5,135:$Vx5,148:$VY2,190:$VZ2}),o($VV2,$VW2,{144:418,146:419,147:420,138:1156,121:$Vy5,135:$Vy5,148:$VY2,190:$VZ2}),o($Vq4,$Vz5),o($Vq4,$VA5),o($Vq4,$VB5),o($Vq4,$VC5),{19:$VD5,21:$VE5,22:1158,129:1157,200:$VF5,215:1161,216:$VG5},o($VV2,$VW2,{147:420,126:1164,130:1165,131:1166,132:1167,136:1168,137:1169,138:1170,144:1171,146:1172,148:$VY2,190:$VH5}),o($Vm4,[2,177]),o($Vm4,[2,182],{161:[1,1174]}),o($Vm4,[2,184],{160:[1,1175]}),o($Vq4,$VI5),o($Vq4,$VJ5),o($Vq4,$VK5),o($Vq4,$Vn),o($Vq4,$Vo),o($Vq4,$Vy),o($Vq4,$Vp),o($Vq4,$Vq),o($VV2,[2,167]),o($VV2,$VJ5),o($VV2,$VK5),o($VV2,$Vn),o($VV2,$Vo),o($VV2,$Vy),o($VV2,$Vp),o($VV2,$Vq),o($VI,[2,271],{223:1176,51:[1,1177]}),o($Vs4,$VL5,{226:1178,53:[1,1179]}),o($Vt4,$VM5),o($VI,$VJ,{76:1180,78:1181,39:1182,118:1183,79:[1,1184],80:[1,1185],81:[1,1186]}),o($Vt4,$VN5),o($Vt4,$VO5,{77:1187,73:1188,92:1189,94:1190,95:1194,99:1195,96:[1,1191],97:[1,1192],98:[1,1193],101:$VP5,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:1197,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vt4,$VQ5),o($VR5,$Vy1,{93:1198}),o($V12,$Vz1,{99:762,95:1199,101:$Vy4,102:$VR,103:$VS,104:$VT}),o($VS5,$VB1,{86:1200}),o($VS5,$VB1,{86:1201}),o($VS5,$VB1,{86:1202}),o($Vt4,$VC1,{105:766,107:767,91:1203,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VT5,$VU5),o($VT5,$VV5),o($VR5,$VG1),o($VR5,$VH1),o($VR5,$VI1),o($VR5,$VJ1),o($VS5,$VK1),o($VL1,$VM1,{163:1204}),o($VW5,$VO1),{119:[1,1205],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($VT5,$VE1),o($VT5,$VF1),{19:[1,1209],21:[1,1213],22:1207,33:1206,201:1208,215:1210,216:[1,1212],217:[1,1211]},{100:[1,1214]},o($VR5,$VT1),o($VS5,$Vn),o($VS5,$Vo),{100:[1,1216],106:1215,108:[1,1217],109:[1,1218],110:1219,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,1220]},o($VS5,$Vp),o($VS5,$Vq),o($Vz4,[2,146]),o($VN1,$VX5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($Vu,$VV3),o($Vh3,$VK3),o($Vu,$VL3,{31:1221,194:[1,1222]}),{19:$VM3,21:$VN3,22:662,129:1223,200:$VO3,215:665,216:$VP3},{121:[1,1224]},o($VG,$VY5),o($VE,$Vu3),o($VG,$VH,{58:1225}),o($VI,$VJ,{62:1226,64:1227,66:1228,67:1229,73:1232,75:1233,72:1234,39:1235,92:1236,94:1237,87:1239,88:1240,89:1241,78:1242,95:1249,22:1250,91:1252,118:1253,99:1254,215:1257,105:1258,107:1259,19:[1,1256],21:[1,1261],69:[1,1230],71:[1,1231],79:[1,1243],80:[1,1244],81:[1,1245],85:[1,1238],96:[1,1246],97:[1,1247],98:[1,1248],101:$VZ5,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:[1,1251],216:[1,1260]}),o($VG,$Vw3),o($VI,$VJ,{62:1262,64:1263,66:1264,67:1265,73:1268,75:1269,72:1270,39:1271,92:1272,94:1273,87:1275,88:1276,89:1277,78:1278,95:1285,22:1286,91:1288,118:1289,99:1290,215:1293,105:1294,107:1295,19:[1,1292],21:[1,1297],69:[1,1266],71:[1,1267],79:[1,1279],80:[1,1280],81:[1,1281],85:[1,1274],96:[1,1282],97:[1,1283],98:[1,1284],101:$V_5,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:[1,1287],216:[1,1296]}),o($Vr2,$Vq2,{84:808,193:809,83:1298,191:$VL4}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:1299,121:$VX2,148:$VY2,190:$VZ2}),o($Vr2,$Vq2,{84:808,193:809,83:1300,191:$VL4}),o($Vt1,$Vt2,{99:478,95:1301,101:$Vt3,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V33),o($VG,$Vy3),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:1302,194:[1,1303]}),{19:$VM3,21:$VN3,22:662,129:1304,200:$VO3,215:665,216:$VP3},o($VG,$VQ3),o($Vt1,$VK3),o($VG,$VL3,{31:1305,194:[1,1306]}),{19:$VM3,21:$VN3,22:662,129:1307,200:$VO3,215:665,216:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{100:[1,1308]},o($VA1,$VT1),{100:[1,1310],106:1309,108:[1,1311],109:[1,1312],110:1313,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,1314]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:1315,194:[1,1316]}),{19:$VM3,21:$VN3,22:662,129:1317,200:$VO3,215:665,216:$VP3},o($VA1,$VW3),{121:[1,1318]},{19:[1,1321],21:[1,1324],22:1320,87:1319,215:1322,216:[1,1323]},o($VE,$VC4),o($V8,$VD4,{50:456,51:$Vl3}),o($VG,$VE4),o($V8,$VG4),o($V8,$VH4),o($VG,$VI4),o($VG,$VJ4),{70:[1,1325]},o($V8,$VK4),o($VG,$Vc2),o($Vr,$Vs,{54:1326,41:1327,44:$Vt}),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:1328}),o($VG,$VE1),o($VG,$VF1),{19:[1,1332],21:[1,1336],22:1330,33:1329,201:1331,215:1333,216:[1,1335],217:[1,1334]},{119:[1,1337],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:1338}),o($Vh2,$Vy1,{93:1339}),o($Vt1,$Vz1,{99:855,95:1340,101:$VN4,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,1341]},o($Vh2,$VT1),{70:[1,1342]},o($Vp2,$Vq2,{83:1343,84:1344,193:1345,191:[1,1346]}),o($Vr2,$Vq2,{83:1347,84:1348,193:1349,191:$V$5}),o($Vr1,$Vt2,{99:556,95:1351,101:$Vv3,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:1352,95:1353,91:1354,99:1355,105:1357,107:1358,101:$V06,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:1352,95:1353,91:1354,99:1355,105:1357,107:1358,101:$V06,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:1352,95:1353,91:1354,99:1355,105:1357,107:1358,101:$V06,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:1359,84:1360,193:1361,191:[1,1362]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,1363],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:1364,121:$VX2,148:$VY2,190:$VZ2}),o($Vx1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),o($VN1,$V73),{111:[1,1365]},o($VN1,$Vc3),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:1366}),o($VG,$VE1),o($VG,$VF1),{19:[1,1370],21:[1,1374],22:1368,33:1367,201:1369,215:1371,216:[1,1373],217:[1,1372]},{119:[1,1375],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:1376}),o($Vh2,$Vy1,{93:1377}),o($Vt1,$Vz1,{99:902,95:1378,101:$VO4,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,1379]},o($Vh2,$VT1),{70:[1,1380]},o($Vp2,$Vq2,{83:1381,84:1382,193:1383,191:[1,1384]}),o($Vr2,$Vq2,{83:1385,84:1386,193:1387,191:$V16}),o($Vr1,$Vt2,{99:592,95:1389,101:$Vx3,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:1390,95:1391,91:1392,99:1393,105:1395,107:1396,101:$V26,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:1390,95:1391,91:1392,99:1393,105:1395,107:1396,101:$V26,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:1390,95:1391,91:1392,99:1393,105:1395,107:1396,101:$V26,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:1397,84:1398,193:1399,191:[1,1400]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,1401],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:1402,121:$VX2,148:$VY2,190:$VZ2}),o($Vx1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),o($VN1,$V73),{111:[1,1403]},o($VN1,$Vc3),o($Vt1,$Vt5),o($VR4,$Vq2,{84:944,193:945,83:1404,191:$VS4}),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:1405,121:$VX2,148:$VY2,190:$VZ2}),o($VR4,$Vq2,{84:944,193:945,83:1406,191:$VS4}),o($VC3,$Vt2,{99:621,95:1407,101:$VA3,102:$VR,103:$VS,104:$VT}),o($VP4,$Vu2),o($VP4,$V33),o($Vz3,$VY5),o($V36,$VJ3),o($VB3,$VK3),o($V36,$VL3,{31:1408,194:[1,1409]}),{19:$VM3,21:$VN3,22:662,129:1410,200:$VO3,215:665,216:$VP3},o($Vz3,$VQ3),o($VC3,$VK3),o($Vz3,$VL3,{31:1411,194:[1,1412]}),{19:$VM3,21:$VN3,22:662,129:1413,200:$VO3,215:665,216:$VP3},o($V46,$VV3),o($VD3,$VK3),o($V46,$VL3,{31:1414,194:[1,1415]}),{19:$VM3,21:$VN3,22:662,129:1416,200:$VO3,215:665,216:$VP3},o($VE3,$VR3),o($VF3,$VS3),o($VF3,$VT3),o($VF3,$VU3),{100:[1,1417]},o($VF3,$VT1),{100:[1,1419],106:1418,108:[1,1420],109:[1,1421],110:1422,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,1423]},{121:[1,1424]},o($VF3,$VW3),{19:[1,1427],21:[1,1430],22:1426,87:1425,215:1428,216:[1,1429]},o($VH3,$Vb2),o($VH3,$V91,{52:1431,53:[1,1432]}),o($Vz3,$Vb1),o($VI,$VJ,{65:1433,67:1434,72:1435,39:1436,78:1437,118:1441,51:$Vc1,53:$Vc1,70:$Vc1,79:[1,1438],80:[1,1439],81:[1,1440]}),o($Vz3,$Vg1),o($Vz3,$Vh1,{68:1442,64:1443,73:1444,92:1445,94:1446,95:1450,99:1451,96:[1,1447],97:[1,1448],98:[1,1449],101:$V56,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:1453,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vz3,$Vq1),o($VB3,$Vs1,{82:1454}),o($VC3,$Vs1,{82:1455}),o($V46,$Vv1),o($V46,$Vw1),o($VE3,$Vy1,{93:1456}),o($VB3,$Vz1,{99:992,95:1457,101:$VV4,102:$VR,103:$VS,104:$VT}),o($VF3,$VB1,{86:1458}),o($VF3,$VB1,{86:1459}),o($VF3,$VB1,{86:1460}),o($VC3,$VC1,{105:996,107:997,91:1461,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD3,$Vs1,{82:1462}),o($V46,$VE1),o($V46,$VF1),{19:[1,1466],21:[1,1470],22:1464,33:1463,201:1465,215:1467,216:[1,1469],217:[1,1468]},o($VE3,$VG1),o($VE3,$VH1),o($VE3,$VI1),o($VE3,$VJ1),o($VF3,$VK1),o($VL1,$VM1,{163:1471}),o($VG3,$VO1),{119:[1,1472],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},{100:[1,1473]},o($VE3,$VT1),o($VF3,$Vn),o($VF3,$Vo),{100:[1,1475],106:1474,108:[1,1476],109:[1,1477],110:1478,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,1479]},o($VF3,$Vp),o($VF3,$Vq),o($Vz3,$Vb1),o($VI,$VJ,{65:1480,67:1481,72:1482,39:1483,78:1484,118:1488,51:$Vc1,53:$Vc1,70:$Vc1,79:[1,1485],80:[1,1486],81:[1,1487]}),o($Vz3,$Vg1),o($Vz3,$Vh1,{68:1489,64:1490,73:1491,92:1492,94:1493,95:1497,99:1498,96:[1,1494],97:[1,1495],98:[1,1496],101:$V66,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:1500,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vz3,$Vq1),o($VB3,$Vs1,{82:1501}),o($VC3,$Vs1,{82:1502}),o($V46,$Vv1),o($V46,$Vw1),o($VE3,$Vy1,{93:1503}),o($VB3,$Vz1,{99:1028,95:1504,101:$VW4,102:$VR,103:$VS,104:$VT}),o($VF3,$VB1,{86:1505}),o($VF3,$VB1,{86:1506}),o($VF3,$VB1,{86:1507}),o($VC3,$VC1,{105:1032,107:1033,91:1508,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD3,$Vs1,{82:1509}),o($V46,$VE1),o($V46,$VF1),{19:[1,1513],21:[1,1517],22:1511,33:1510,201:1512,215:1514,216:[1,1516],217:[1,1515]},o($VE3,$VG1),o($VE3,$VH1),o($VE3,$VI1),o($VE3,$VJ1),o($VF3,$VK1),o($VL1,$VM1,{163:1518}),o($VG3,$VO1),{119:[1,1519],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},{100:[1,1520]},o($VE3,$VT1),o($VF3,$Vn),o($VF3,$Vo),{100:[1,1522],106:1521,108:[1,1523],109:[1,1524],110:1525,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,1526]},o($VF3,$Vp),o($VF3,$Vq),{194:[1,1529],195:1527,196:[1,1528]},o($Vr1,$V76),o($Vr1,$V86),o($Vr1,$V96),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V04),o($Vr1,$V14,{203:1530,204:1531,111:[1,1532]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($Va6,$Vb3),{194:[1,1535],195:1533,196:[1,1534]},o($Vt1,$V76),o($Vt1,$V86),o($Vt1,$V96),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V04),o($Vt1,$V14,{203:1536,204:1537,111:[1,1538]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vb6,$V83),o($Vb6,$V93),o($Vb6,$Va3),o($Vb6,$Vb3),{19:[1,1541],21:[1,1544],22:1540,87:1539,215:1542,216:[1,1543]},{194:[1,1547],195:1545,196:[1,1546]},o($VD1,$V76),o($VD1,$V86),o($VD1,$V96),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V04),o($VD1,$V14,{203:1548,204:1549,111:[1,1550]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vc6,$V83),o($Vc6,$V93),o($Vc6,$Va3),o($Vc6,$Vb3),o($V95,[2,194]),{19:$Va5,21:$Vb5,22:1121,215:1125,216:$Vq5},o($V95,[2,196]),{100:$Vc5,108:$Vd5,109:$Ve5,110:1132,182:1122,197:1126,198:1127,199:1128,202:1131,205:$Vg5,206:$Vh5,207:$Vi5,208:$Vj5,209:$Vk5,210:$Vl5,211:$Vm5,212:$Vn5,213:$Vo5,214:$Vp5},o($V95,[2,198]),{186:$Vf5},o($V95,$Vd6,{181:1551,179:$Ve6}),o($V95,$Vd6,{181:1553,179:$Ve6}),o($V95,$Vd6,{181:1554,179:$Ve6}),o($Vf6,$Vn),o($Vf6,$Vo),o($Vf6,$VZ3),o($Vf6,$V_3),o($Vf6,$V$3),o($Vf6,$Vp),o($Vf6,$Vq),o($Vf6,$V04),o($Vf6,$V14,{203:1555,204:1556,111:[1,1557]}),o($Vf6,$V24),o($Vf6,$V34),o($Vf6,$V44),o($Vf6,$V54),o($Vf6,$V64),o($Vf6,$V74),o($Vf6,$V84),o($Vf6,$V94),o($Vf6,$Va4),o($Vg6,$V83),o($Vg6,$V93),o($Vg6,$Va3),o($Vg6,$Vb3),o($VL1,[2,205],{171:1558,180:$V65}),o($VL1,[2,214],{173:1559,180:$V75}),o($VL1,[2,222],{175:1560,180:$V85}),o($VY3,$Vh6),o($VY3,$VK1),o($Vg4,$Vi6),o($Vg4,$Vj6),o($Vg4,$Vk6),o($Vq4,$Vl6),o($Vq4,$Vm6),o($Vq4,$Vn6),o($Vr,$Vs,{46:1561,47:1562,55:1563,59:1564,41:1565,44:$Vt}),o($V23,$VA4),o($V23,$VB4),o($V23,$Vn),o($V23,$Vo),o($V23,$Vp),o($V23,$Vq),{70:[1,1566]},{70:$Vc4},{70:$Vd4,133:1567,134:1568,135:$Vo6},{70:$Vf4},o($Vp6,$Vh4),o($Vp6,$Vi4),o($Vp6,$Vj4,{139:1570,142:1571,143:1574,140:$Vq6,141:$Vr6}),o($Vm4,$Vn4,{155:716,145:1575,150:1576,151:1577,154:1578,69:[1,1579],160:$Vo4,161:$Vp4}),o($Vs6,$Vr4),{19:[1,1583],21:[1,1587],22:1581,149:1580,201:1582,215:1584,216:[1,1586],217:[1,1585]},o($Vm4,[2,183]),o($Vm4,[2,185]),o($Vs4,[2,274]),o($Vr,$Vs,{221:1588,224:1589,41:1590,44:$Vt}),o($Vt4,$Vt6),o($Vr,$Vs,{224:1591,41:1592,44:$Vt}),o($Vt4,$Vu6),o($Vt4,$VU5),o($Vt4,$VV5),{119:[1,1593],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($Vt4,$VE1),o($Vt4,$VF1),{19:[1,1597],21:[1,1601],22:1595,33:1594,201:1596,215:1598,216:[1,1600],217:[1,1599]},o($Vt4,$Vv6),o($Vt4,$Vw6),o($Vx6,$Vy1,{93:1602}),o($Vt4,$Vz1,{99:1195,95:1603,101:$VP5,102:$VR,103:$VS,104:$VT}),o($Vx6,$VG1),o($Vx6,$VH1),o($Vx6,$VI1),o($Vx6,$VJ1),{100:[1,1604]},o($Vx6,$VT1),{70:[1,1605]},o($V12,$Vt2,{99:762,95:1606,101:$Vy4,102:$VR,103:$VS,104:$VT}),o($VR5,$Vu2),o($Vt4,$Vv2,{90:1607,95:1608,91:1609,99:1610,105:1612,107:1613,101:$Vy6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt4,$Vx2,{90:1607,95:1608,91:1609,99:1610,105:1612,107:1613,101:$Vy6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt4,$Vy2,{90:1607,95:1608,91:1609,99:1610,105:1612,107:1613,101:$Vy6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VW5,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,1614],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:1615,121:$VX2,148:$VY2,190:$VZ2}),o($VT5,$VB2),o($VT5,$Vw),o($VT5,$Vx),o($VT5,$Vn),o($VT5,$Vo),o($VT5,$Vy),o($VT5,$Vp),o($VT5,$Vq),o($VR5,$V33),o($VW5,$V43),o($VW5,$V53),o($VW5,$V63),o($VW5,$V73),{111:[1,1616]},o($VW5,$Vc3),o($VF4,$VX4),{19:$Vi,21:$Vj,22:1617,215:45,216:$Vk},{19:$Vz6,21:$VA6,22:1619,100:[1,1630],108:[1,1631],109:[1,1632],110:1629,182:1620,192:1618,197:1623,198:1624,199:1625,202:1628,205:[1,1633],206:[1,1634],207:[1,1639],208:[1,1640],209:[1,1641],210:[1,1642],211:[1,1635],212:[1,1636],213:[1,1637],214:[1,1638],215:1622,216:$VB6},o($Vh3,$Vt5),o($VE,$V91,{52:1643,53:[1,1644]}),o($VG,$Vb1),o($VG,$Vc1,{65:1645,67:1646,72:1647,39:1648,78:1649,118:1653,79:[1,1650],80:[1,1651],81:[1,1652],119:$VJ,125:$VJ,127:$VJ,190:$VJ,228:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:1654,64:1655,73:1656,92:1657,94:1658,95:1662,99:1663,96:[1,1659],97:[1,1660],98:[1,1661],101:$VC6,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:1665,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:1666}),o($Vt1,$Vs1,{82:1667}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:1668}),o($Vr1,$Vz1,{99:1254,95:1669,101:$VZ5,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:1670}),o($VA1,$VB1,{86:1671}),o($VA1,$VB1,{86:1672}),o($Vt1,$VC1,{105:1258,107:1259,91:1673,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:1674}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,1678],21:[1,1682],22:1676,33:1675,201:1677,215:1679,216:[1,1681],217:[1,1680]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{163:1683}),o($VN1,$VO1),{119:[1,1684],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},{100:[1,1685]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,1687],106:1686,108:[1,1688],109:[1,1689],110:1690,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,1691]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$Vb1),o($VG,$Vc1,{65:1692,67:1693,72:1694,39:1695,78:1696,118:1700,79:[1,1697],80:[1,1698],81:[1,1699],119:$VJ,125:$VJ,127:$VJ,190:$VJ,228:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:1701,64:1702,73:1703,92:1704,94:1705,95:1709,99:1710,96:[1,1706],97:[1,1707],98:[1,1708],101:$VD6,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:1712,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:1713}),o($Vt1,$Vs1,{82:1714}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:1715}),o($Vr1,$Vz1,{99:1290,95:1716,101:$V_5,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:1717}),o($VA1,$VB1,{86:1718}),o($VA1,$VB1,{86:1719}),o($Vt1,$VC1,{105:1294,107:1295,91:1720,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:1721}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,1725],21:[1,1729],22:1723,33:1722,201:1724,215:1726,216:[1,1728],217:[1,1727]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{163:1730}),o($VN1,$VO1),{119:[1,1731],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},{100:[1,1732]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,1734],106:1733,108:[1,1735],109:[1,1736],110:1737,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,1738]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$VV3),{121:[1,1739]},o($VG,$VJ3),o($Vh2,$VR3),o($Vp2,$VX4),{19:$Vi,21:$Vj,22:1740,215:45,216:$Vk},{19:$VE6,21:$VF6,22:1742,100:[1,1753],108:[1,1754],109:[1,1755],110:1752,182:1743,192:1741,197:1746,198:1747,199:1748,202:1751,205:[1,1756],206:[1,1757],207:[1,1762],208:[1,1763],209:[1,1764],210:[1,1765],211:[1,1758],212:[1,1759],213:[1,1760],214:[1,1761],215:1745,216:$VG6},o($Vr2,$VX4),{19:$Vi,21:$Vj,22:1766,215:45,216:$Vk},{19:$VH6,21:$VI6,22:1768,100:[1,1779],108:[1,1780],109:[1,1781],110:1778,182:1769,192:1767,197:1772,198:1773,199:1774,202:1777,205:[1,1782],206:[1,1783],207:[1,1788],208:[1,1789],209:[1,1790],210:[1,1791],211:[1,1784],212:[1,1785],213:[1,1786],214:[1,1787],215:1771,216:$VJ6},o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),o($VA1,$V73),{111:[1,1792]},o($VA1,$Vc3),o($VA2,$VX4),{19:$Vi,21:$Vj,22:1793,215:45,216:$Vk},{19:$VK6,21:$VL6,22:1795,100:[1,1806],108:[1,1807],109:[1,1808],110:1805,182:1796,192:1794,197:1799,198:1800,199:1801,202:1804,205:[1,1809],206:[1,1810],207:[1,1815],208:[1,1816],209:[1,1817],210:[1,1818],211:[1,1811],212:[1,1812],213:[1,1813],214:[1,1814],215:1798,216:$VM6},o($VD1,$Vt5),o($VN1,$VX5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($VG,$VY5),o($VG,$Vw3),o($VI,$VJ,{62:1819,64:1820,66:1821,67:1822,73:1825,75:1826,72:1827,39:1828,92:1829,94:1830,87:1832,88:1833,89:1834,78:1835,95:1842,22:1843,91:1845,118:1846,99:1847,215:1850,105:1851,107:1852,19:[1,1849],21:[1,1854],69:[1,1823],71:[1,1824],79:[1,1836],80:[1,1837],81:[1,1838],85:[1,1831],96:[1,1839],97:[1,1840],98:[1,1841],101:$VN6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:[1,1844],216:[1,1853]}),o($Vr2,$Vq2,{84:1348,193:1349,83:1855,191:$V$5}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:1856,121:$VX2,148:$VY2,190:$VZ2}),o($Vr2,$Vq2,{84:1348,193:1349,83:1857,191:$V$5}),o($Vt1,$Vt2,{99:855,95:1858,101:$VN4,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V33),o($VG,$Vy3),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:1859,194:[1,1860]}),{19:$VM3,21:$VN3,22:662,129:1861,200:$VO3,215:665,216:$VP3},o($VG,$VQ3),o($Vt1,$VK3),o($VG,$VL3,{31:1862,194:[1,1863]}),{19:$VM3,21:$VN3,22:662,129:1864,200:$VO3,215:665,216:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{100:[1,1865]},o($VA1,$VT1),{100:[1,1867],106:1866,108:[1,1868],109:[1,1869],110:1870,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,1871]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:1872,194:[1,1873]}),{19:$VM3,21:$VN3,22:662,129:1874,200:$VO3,215:665,216:$VP3},o($VA1,$VW3),{121:[1,1875]},{19:[1,1878],21:[1,1881],22:1877,87:1876,215:1879,216:[1,1880]},o($Vr2,$Vq2,{84:1386,193:1387,83:1882,191:$V16}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:1883,121:$VX2,148:$VY2,190:$VZ2}),o($Vr2,$Vq2,{84:1386,193:1387,83:1884,191:$V16}),o($Vt1,$Vt2,{99:902,95:1885,101:$VO4,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V33),o($VG,$Vy3),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:1886,194:[1,1887]}),{19:$VM3,21:$VN3,22:662,129:1888,200:$VO3,215:665,216:$VP3},o($VG,$VQ3),o($Vt1,$VK3),o($VG,$VL3,{31:1889,194:[1,1890]}),{19:$VM3,21:$VN3,22:662,129:1891,200:$VO3,215:665,216:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{100:[1,1892]},o($VA1,$VT1),{100:[1,1894],106:1893,108:[1,1895],109:[1,1896],110:1897,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,1898]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:1899,194:[1,1900]}),{19:$VM3,21:$VN3,22:662,129:1901,200:$VO3,215:665,216:$VP3},o($VA1,$VW3),{121:[1,1902]},{19:[1,1905],21:[1,1908],22:1904,87:1903,215:1906,216:[1,1907]},o($Vz3,$VV3),{121:[1,1909]},o($Vz3,$VJ3),o($VP4,$VR3),o($VQ4,$VX4),{19:$Vi,21:$Vj,22:1910,215:45,216:$Vk},{19:$VO6,21:$VP6,22:1912,100:[1,1923],108:[1,1924],109:[1,1925],110:1922,182:1913,192:1911,197:1916,198:1917,199:1918,202:1921,205:[1,1926],206:[1,1927],207:[1,1932],208:[1,1933],209:[1,1934],210:[1,1935],211:[1,1928],212:[1,1929],213:[1,1930],214:[1,1931],215:1915,216:$VQ6},o($VR4,$VX4),{19:$Vi,21:$Vj,22:1936,215:45,216:$Vk},{19:$VR6,21:$VS6,22:1938,100:[1,1949],108:[1,1950],109:[1,1951],110:1948,182:1939,192:1937,197:1942,198:1943,199:1944,202:1947,205:[1,1952],206:[1,1953],207:[1,1958],208:[1,1959],209:[1,1960],210:[1,1961],211:[1,1954],212:[1,1955],213:[1,1956],214:[1,1957],215:1941,216:$VT6},o($VT4,$VX4),{19:$Vi,21:$Vj,22:1962,215:45,216:$Vk},{19:$VU6,21:$VV6,22:1964,100:[1,1975],108:[1,1976],109:[1,1977],110:1974,182:1965,192:1963,197:1968,198:1969,199:1970,202:1973,205:[1,1978],206:[1,1979],207:[1,1984],208:[1,1985],209:[1,1986],210:[1,1987],211:[1,1980],212:[1,1981],213:[1,1982],214:[1,1983],215:1967,216:$VW6},o($VF3,$V33),o($VF3,$V43),o($VF3,$V53),o($VF3,$V63),o($VF3,$V73),{111:[1,1988]},o($VF3,$Vc3),o($VD3,$Vt5),o($VG3,$VX5),o($VG3,$VK1),o($VG3,$Vn),o($VG3,$Vo),o($VG3,$Vp),o($VG3,$Vq),o($Vz3,$Vc2),o($Vr,$Vs,{54:1989,41:1990,44:$Vt}),o($Vz3,$Vd2),o($Vz3,$Ve2),o($Vz3,$Vv1),o($Vz3,$Vw1),o($VC3,$Vs1,{82:1991}),o($Vz3,$VE1),o($Vz3,$VF1),{19:[1,1995],21:[1,1999],22:1993,33:1992,201:1994,215:1996,216:[1,1998],217:[1,1997]},{119:[1,2000],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($Vz3,$Vf2),o($Vz3,$Vg2),o($VC3,$Vs1,{82:2001}),o($VP4,$Vy1,{93:2002}),o($VC3,$Vz1,{99:1451,95:2003,101:$V56,102:$VR,103:$VS,104:$VT}),o($VP4,$VG1),o($VP4,$VH1),o($VP4,$VI1),o($VP4,$VJ1),{100:[1,2004]},o($VP4,$VT1),{70:[1,2005]},o($VQ4,$Vq2,{83:2006,84:2007,193:2008,191:[1,2009]}),o($VR4,$Vq2,{83:2010,84:2011,193:2012,191:$VX6}),o($VB3,$Vt2,{99:992,95:2014,101:$VV4,102:$VR,103:$VS,104:$VT}),o($VE3,$Vu2),o($VC3,$Vv2,{90:2015,95:2016,91:2017,99:2018,105:2020,107:2021,101:$VY6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VC3,$Vx2,{90:2015,95:2016,91:2017,99:2018,105:2020,107:2021,101:$VY6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VC3,$Vy2,{90:2015,95:2016,91:2017,99:2018,105:2020,107:2021,101:$VY6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VG3,$Vz2),o($VT4,$Vq2,{83:2022,84:2023,193:2024,191:[1,2025]}),o($V46,$VB2),o($V46,$Vw),o($V46,$Vx),o($V46,$Vn),o($V46,$Vo),o($V46,$Vy),o($V46,$Vp),o($V46,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,2026],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:2027,121:$VX2,148:$VY2,190:$VZ2}),o($VE3,$V33),o($VG3,$V43),o($VG3,$V53),o($VG3,$V63),o($VG3,$V73),{111:[1,2028]},o($VG3,$Vc3),o($Vz3,$Vd2),o($Vz3,$Ve2),o($Vz3,$Vv1),o($Vz3,$Vw1),o($VC3,$Vs1,{82:2029}),o($Vz3,$VE1),o($Vz3,$VF1),{19:[1,2033],21:[1,2037],22:2031,33:2030,201:2032,215:2034,216:[1,2036],217:[1,2035]},{119:[1,2038],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($Vz3,$Vf2),o($Vz3,$Vg2),o($VC3,$Vs1,{82:2039}),o($VP4,$Vy1,{93:2040}),o($VC3,$Vz1,{99:1498,95:2041,101:$V66,102:$VR,103:$VS,104:$VT}),o($VP4,$VG1),o($VP4,$VH1),o($VP4,$VI1),o($VP4,$VJ1),{100:[1,2042]},o($VP4,$VT1),{70:[1,2043]},o($VQ4,$Vq2,{83:2044,84:2045,193:2046,191:[1,2047]}),o($VR4,$Vq2,{83:2048,84:2049,193:2050,191:$VZ6}),o($VB3,$Vt2,{99:1028,95:2052,101:$VW4,102:$VR,103:$VS,104:$VT}),o($VE3,$Vu2),o($VC3,$Vv2,{90:2053,95:2054,91:2055,99:2056,105:2058,107:2059,101:$V_6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VC3,$Vx2,{90:2053,95:2054,91:2055,99:2056,105:2058,107:2059,101:$V_6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VC3,$Vy2,{90:2053,95:2054,91:2055,99:2056,105:2058,107:2059,101:$V_6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VG3,$Vz2),o($VT4,$Vq2,{83:2060,84:2061,193:2062,191:[1,2063]}),o($V46,$VB2),o($V46,$Vw),o($V46,$Vx),o($V46,$Vn),o($V46,$Vo),o($V46,$Vy),o($V46,$Vp),o($V46,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,2064],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:2065,121:$VX2,148:$VY2,190:$VZ2}),o($VE3,$V33),o($VG3,$V43),o($VG3,$V53),o($VG3,$V63),o($VG3,$V73),{111:[1,2066]},o($VG3,$Vc3),o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$Vr5),o($Vr1,$Vs5),{19:$VY4,21:$VZ4,22:2068,87:2067,215:1041,216:$V_4},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$Vr5),o($Vt1,$Vs5),{19:$V05,21:$V15,22:2070,87:2069,215:1067,216:$V25},o($VA1,$VX5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$Vr5),o($VD1,$Vs5),{19:$V35,21:$V45,22:2072,87:2071,215:1094,216:$V55},o($V95,[2,208]),o($V95,[2,210]),o($V95,[2,217]),o($V95,[2,225]),o($Vf6,$Vr5),o($Vf6,$Vs5),{19:$Va5,21:$Vb5,22:2074,87:2073,215:1125,216:$Vq5},o($V95,[2,204]),o($V95,[2,213]),o($V95,[2,221]),o($V$6,$V07,{152:2075,153:2076,156:$V17,157:$V27,158:$V37,159:$V47}),o($V57,$V67),o($V77,$V87,{56:2081}),o($V97,$Va7,{60:2082}),o($VI,$VJ,{63:2083,73:2084,75:2085,76:2086,92:2089,94:2090,87:2092,88:2093,89:2094,78:2095,39:2096,95:2100,22:2101,91:2103,118:2104,99:2108,215:2111,105:2112,107:2113,19:[1,2110],21:[1,2115],69:[1,2087],71:[1,2088],79:[1,2105],80:[1,2106],81:[1,2107],85:[1,2091],96:[1,2097],97:[1,2098],98:[1,2099],101:$Vb7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:[1,2102],216:[1,2114]}),o($V$6,$V07,{153:2076,152:2116,156:$V17,157:$V27,158:$V37,159:$V47}),{70:$Vu5,134:2117,135:$Vo6},o($Vp6,$Vv5),o($VV2,$VW2,{147:420,136:1168,137:1169,138:1170,144:1171,146:1172,131:2118,148:$VY2,190:$VH5}),o($Vp6,$Vw5),o($Vp6,$Vj4,{139:2119,143:2120,140:$Vq6,141:$Vr6}),o($VV2,$VW2,{147:420,144:1171,146:1172,138:2121,70:$Vx5,135:$Vx5,148:$VY2,190:$VH5}),o($VV2,$VW2,{147:420,144:1171,146:1172,138:2122,70:$Vy5,135:$Vy5,148:$VY2,190:$VH5}),o($Vs6,$Vz5),o($Vs6,$VA5),o($Vs6,$VB5),o($Vs6,$VC5),{19:$VD5,21:$VE5,22:1158,129:2123,200:$VF5,215:1161,216:$VG5},o($VV2,$VW2,{147:420,130:1165,131:1166,132:1167,136:1168,137:1169,138:1170,144:1171,146:1172,126:2124,148:$VY2,190:$VH5}),o($Vs6,$VI5),o($Vs6,$VJ5),o($Vs6,$VK5),o($Vs6,$Vn),o($Vs6,$Vo),o($Vs6,$Vy),o($Vs6,$Vp),o($Vs6,$Vq),o($Vs4,[2,272]),o($Vt4,$Vu4,{225:2125}),o($VI,$VJ,{92:743,94:744,95:754,99:762,227:2126,73:2127,75:2128,76:2129,87:2133,88:2134,89:2135,78:2136,39:2137,22:2138,91:2140,118:2141,215:2146,105:2147,107:2148,19:[1,2145],21:[1,2150],69:[1,2130],71:[1,2131],79:[1,2142],80:[1,2143],81:[1,2144],85:[1,2132],96:$Vv4,97:$Vw4,98:$Vx4,101:$Vy4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:[1,2139],216:[1,2149]}),o($Vt4,$Vc7),o($VI,$VJ,{92:743,94:744,95:754,99:762,227:2151,73:2152,75:2153,76:2154,87:2158,88:2159,89:2160,78:2161,39:2162,22:2163,91:2165,118:2166,215:2171,105:2172,107:2173,19:[1,2170],21:[1,2175],69:[1,2155],71:[1,2156],79:[1,2167],80:[1,2168],81:[1,2169],85:[1,2157],96:$Vv4,97:$Vw4,98:$Vx4,101:$Vy4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:[1,2164],216:[1,2174]}),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:2176,121:$VX2,148:$VY2,190:$VZ2}),o($Vt4,$VB2),o($Vt4,$Vw),o($Vt4,$Vx),o($Vt4,$Vn),o($Vt4,$Vo),o($Vt4,$Vy),o($Vt4,$Vp),o($Vt4,$Vq),o($Vt4,$Vt2,{99:1195,95:2177,101:$VP5,102:$VR,103:$VS,104:$VT}),o($Vx6,$Vu2),o($Vx6,$V33),o($Vt4,$Vd7),o($VR5,$VR3),o($VS5,$VS3),o($VS5,$VT3),o($VS5,$VU3),{100:[1,2178]},o($VS5,$VT1),{100:[1,2180],106:2179,108:[1,2181],109:[1,2182],110:2183,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,2184]},o($VS5,$VW3),{121:[1,2185]},{19:[1,2188],21:[1,2191],22:2187,87:2186,215:2189,216:[1,2190]},{194:[1,2194],195:2192,196:[1,2193]},o($Vh3,$V76),o($Vh3,$V86),o($Vh3,$V96),o($Vh3,$Vn),o($Vh3,$Vo),o($Vh3,$VZ3),o($Vh3,$V_3),o($Vh3,$V$3),o($Vh3,$Vp),o($Vh3,$Vq),o($Vh3,$V04),o($Vh3,$V14,{203:2195,204:2196,111:[1,2197]}),o($Vh3,$V24),o($Vh3,$V34),o($Vh3,$V44),o($Vh3,$V54),o($Vh3,$V64),o($Vh3,$V74),o($Vh3,$V84),o($Vh3,$V94),o($Vh3,$Va4),o($Ve7,$V83),o($Ve7,$V93),o($Ve7,$Va3),o($Ve7,$Vb3),o($VG,$Vc2),o($Vr,$Vs,{54:2198,41:2199,44:$Vt}),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:2200}),o($VG,$VE1),o($VG,$VF1),{19:[1,2204],21:[1,2208],22:2202,33:2201,201:2203,215:2205,216:[1,2207],217:[1,2206]},{119:[1,2209],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:2210}),o($Vh2,$Vy1,{93:2211}),o($Vt1,$Vz1,{99:1663,95:2212,101:$VC6,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,2213]},o($Vh2,$VT1),{70:[1,2214]},o($Vp2,$Vq2,{83:2215,84:2216,193:2217,191:[1,2218]}),o($Vr2,$Vq2,{83:2219,84:2220,193:2221,191:$Vf7}),o($Vr1,$Vt2,{99:1254,95:2223,101:$VZ5,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:2224,95:2225,91:2226,99:2227,105:2229,107:2230,101:$Vg7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:2224,95:2225,91:2226,99:2227,105:2229,107:2230,101:$Vg7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:2224,95:2225,91:2226,99:2227,105:2229,107:2230,101:$Vg7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:2231,84:2232,193:2233,191:[1,2234]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,2235],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:2236,121:$VX2,148:$VY2,190:$VZ2}),o($Vx1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),o($VN1,$V73),{111:[1,2237]},o($VN1,$Vc3),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:2238}),o($VG,$VE1),o($VG,$VF1),{19:[1,2242],21:[1,2246],22:2240,33:2239,201:2241,215:2243,216:[1,2245],217:[1,2244]},{119:[1,2247],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:2248}),o($Vh2,$Vy1,{93:2249}),o($Vt1,$Vz1,{99:1710,95:2250,101:$VD6,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,2251]},o($Vh2,$VT1),{70:[1,2252]},o($Vp2,$Vq2,{83:2253,84:2254,193:2255,191:[1,2256]}),o($Vr2,$Vq2,{83:2257,84:2258,193:2259,191:$Vh7}),o($Vr1,$Vt2,{99:1290,95:2261,101:$V_5,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:2262,95:2263,91:2264,99:2265,105:2267,107:2268,101:$Vi7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:2262,95:2263,91:2264,99:2265,105:2267,107:2268,101:$Vi7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:2262,95:2263,91:2264,99:2265,105:2267,107:2268,101:$Vi7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:2269,84:2270,193:2271,191:[1,2272]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,2273],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:2274,121:$VX2,148:$VY2,190:$VZ2}),o($Vx1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),o($VN1,$V73),{111:[1,2275]},o($VN1,$Vc3),o($Vt1,$Vt5),{194:[1,2278],195:2276,196:[1,2277]},o($Vr1,$V76),o($Vr1,$V86),o($Vr1,$V96),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V04),o($Vr1,$V14,{203:2279,204:2280,111:[1,2281]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($Va6,$Vb3),{194:[1,2284],195:2282,196:[1,2283]},o($Vt1,$V76),o($Vt1,$V86),o($Vt1,$V96),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V04),o($Vt1,$V14,{203:2285,204:2286,111:[1,2287]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vb6,$V83),o($Vb6,$V93),o($Vb6,$Va3),o($Vb6,$Vb3),{19:[1,2290],21:[1,2293],22:2289,87:2288,215:2291,216:[1,2292]},{194:[1,2296],195:2294,196:[1,2295]},o($VD1,$V76),o($VD1,$V86),o($VD1,$V96),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V04),o($VD1,$V14,{203:2297,204:2298,111:[1,2299]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vc6,$V83),o($Vc6,$V93),o($Vc6,$Va3),o($Vc6,$Vb3),o($VG,$Vb1),o($VG,$Vc1,{65:2300,67:2301,72:2302,39:2303,78:2304,118:2308,79:[1,2305],80:[1,2306],81:[1,2307],119:$VJ,125:$VJ,127:$VJ,190:$VJ,228:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:2309,64:2310,73:2311,92:2312,94:2313,95:2317,99:2318,96:[1,2314],97:[1,2315],98:[1,2316],101:$Vj7,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:2320,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:2321}),o($Vt1,$Vs1,{82:2322}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:2323}),o($Vr1,$Vz1,{99:1847,95:2324,101:$VN6,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:2325}),o($VA1,$VB1,{86:2326}),o($VA1,$VB1,{86:2327}),o($Vt1,$VC1,{105:1851,107:1852,91:2328,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:2329}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,2333],21:[1,2337],22:2331,33:2330,201:2332,215:2334,216:[1,2336],217:[1,2335]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{163:2338}),o($VN1,$VO1),{119:[1,2339],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},{100:[1,2340]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,2342],106:2341,108:[1,2343],109:[1,2344],110:2345,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,2346]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$VV3),{121:[1,2347]},o($VG,$VJ3),o($Vh2,$VR3),o($Vp2,$VX4),{19:$Vi,21:$Vj,22:2348,215:45,216:$Vk},{19:$Vk7,21:$Vl7,22:2350,100:[1,2361],108:[1,2362],109:[1,2363],110:2360,182:2351,192:2349,197:2354,198:2355,199:2356,202:2359,205:[1,2364],206:[1,2365],207:[1,2370],208:[1,2371],209:[1,2372],210:[1,2373],211:[1,2366],212:[1,2367],213:[1,2368],214:[1,2369],215:2353,216:$Vm7},o($Vr2,$VX4),{19:$Vi,21:$Vj,22:2374,215:45,216:$Vk},{19:$Vn7,21:$Vo7,22:2376,100:[1,2387],108:[1,2388],109:[1,2389],110:2386,182:2377,192:2375,197:2380,198:2381,199:2382,202:2385,205:[1,2390],206:[1,2391],207:[1,2396],208:[1,2397],209:[1,2398],210:[1,2399],211:[1,2392],212:[1,2393],213:[1,2394],214:[1,2395],215:2379,216:$Vp7},o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),o($VA1,$V73),{111:[1,2400]},o($VA1,$Vc3),o($VA2,$VX4),{19:$Vi,21:$Vj,22:2401,215:45,216:$Vk},{19:$Vq7,21:$Vr7,22:2403,100:[1,2414],108:[1,2415],109:[1,2416],110:2413,182:2404,192:2402,197:2407,198:2408,199:2409,202:2412,205:[1,2417],206:[1,2418],207:[1,2423],208:[1,2424],209:[1,2425],210:[1,2426],211:[1,2419],212:[1,2420],213:[1,2421],214:[1,2422],215:2406,216:$Vs7},o($VD1,$Vt5),o($VN1,$VX5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($VG,$VV3),{121:[1,2427]},o($VG,$VJ3),o($Vh2,$VR3),o($Vp2,$VX4),{19:$Vi,21:$Vj,22:2428,215:45,216:$Vk},{19:$Vt7,21:$Vu7,22:2430,100:[1,2441],108:[1,2442],109:[1,2443],110:2440,182:2431,192:2429,197:2434,198:2435,199:2436,202:2439,205:[1,2444],206:[1,2445],207:[1,2450],208:[1,2451],209:[1,2452],210:[1,2453],211:[1,2446],212:[1,2447],213:[1,2448],214:[1,2449],215:2433,216:$Vv7},o($Vr2,$VX4),{19:$Vi,21:$Vj,22:2454,215:45,216:$Vk},{19:$Vw7,21:$Vx7,22:2456,100:[1,2467],108:[1,2468],109:[1,2469],110:2466,182:2457,192:2455,197:2460,198:2461,199:2462,202:2465,205:[1,2470],206:[1,2471],207:[1,2476],208:[1,2477],209:[1,2478],210:[1,2479],211:[1,2472],212:[1,2473],213:[1,2474],214:[1,2475],215:2459,216:$Vy7},o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),o($VA1,$V73),{111:[1,2480]},o($VA1,$Vc3),o($VA2,$VX4),{19:$Vi,21:$Vj,22:2481,215:45,216:$Vk},{19:$Vz7,21:$VA7,22:2483,100:[1,2494],108:[1,2495],109:[1,2496],110:2493,182:2484,192:2482,197:2487,198:2488,199:2489,202:2492,205:[1,2497],206:[1,2498],207:[1,2503],208:[1,2504],209:[1,2505],210:[1,2506],211:[1,2499],212:[1,2500],213:[1,2501],214:[1,2502],215:2486,216:$VB7},o($VD1,$Vt5),o($VN1,$VX5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($VC3,$Vt5),{194:[1,2509],195:2507,196:[1,2508]},o($VB3,$V76),o($VB3,$V86),o($VB3,$V96),o($VB3,$Vn),o($VB3,$Vo),o($VB3,$VZ3),o($VB3,$V_3),o($VB3,$V$3),o($VB3,$Vp),o($VB3,$Vq),o($VB3,$V04),o($VB3,$V14,{203:2510,204:2511,111:[1,2512]}),o($VB3,$V24),o($VB3,$V34),o($VB3,$V44),o($VB3,$V54),o($VB3,$V64),o($VB3,$V74),o($VB3,$V84),o($VB3,$V94),o($VB3,$Va4),o($VC7,$V83),o($VC7,$V93),o($VC7,$Va3),o($VC7,$Vb3),{194:[1,2515],195:2513,196:[1,2514]},o($VC3,$V76),o($VC3,$V86),o($VC3,$V96),o($VC3,$Vn),o($VC3,$Vo),o($VC3,$VZ3),o($VC3,$V_3),o($VC3,$V$3),o($VC3,$Vp),o($VC3,$Vq),o($VC3,$V04),o($VC3,$V14,{203:2516,204:2517,111:[1,2518]}),o($VC3,$V24),o($VC3,$V34),o($VC3,$V44),o($VC3,$V54),o($VC3,$V64),o($VC3,$V74),o($VC3,$V84),o($VC3,$V94),o($VC3,$Va4),o($VD7,$V83),o($VD7,$V93),o($VD7,$Va3),o($VD7,$Vb3),{194:[1,2521],195:2519,196:[1,2520]},o($VD3,$V76),o($VD3,$V86),o($VD3,$V96),o($VD3,$Vn),o($VD3,$Vo),o($VD3,$VZ3),o($VD3,$V_3),o($VD3,$V$3),o($VD3,$Vp),o($VD3,$Vq),o($VD3,$V04),o($VD3,$V14,{203:2522,204:2523,111:[1,2524]}),o($VD3,$V24),o($VD3,$V34),o($VD3,$V44),o($VD3,$V54),o($VD3,$V64),o($VD3,$V74),o($VD3,$V84),o($VD3,$V94),o($VD3,$Va4),o($VE7,$V83),o($VE7,$V93),o($VE7,$Va3),o($VE7,$Vb3),{19:[1,2527],21:[1,2530],22:2526,87:2525,215:2528,216:[1,2529]},o($Vz3,$Vw3),o($VI,$VJ,{62:2531,64:2532,66:2533,67:2534,73:2537,75:2538,72:2539,39:2540,92:2541,94:2542,87:2544,88:2545,89:2546,78:2547,95:2554,22:2555,91:2557,118:2558,99:2559,215:2562,105:2563,107:2564,19:[1,2561],21:[1,2566],69:[1,2535],71:[1,2536],79:[1,2548],80:[1,2549],81:[1,2550],85:[1,2543],96:[1,2551],97:[1,2552],98:[1,2553],101:$VF7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:[1,2556],216:[1,2565]}),o($VR4,$Vq2,{84:2011,193:2012,83:2567,191:$VX6}),o($Vz3,$VB2),o($Vz3,$Vw),o($Vz3,$Vx),o($Vz3,$Vn),o($Vz3,$Vo),o($Vz3,$Vy),o($Vz3,$Vp),o($Vz3,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:2568,121:$VX2,148:$VY2,190:$VZ2}),o($VR4,$Vq2,{84:2011,193:2012,83:2569,191:$VX6}),o($VC3,$Vt2,{99:1451,95:2570,101:$V56,102:$VR,103:$VS,104:$VT}),o($VP4,$Vu2),o($VP4,$V33),o($Vz3,$Vy3),o($V36,$VJ3),o($VB3,$VK3),o($V36,$VL3,{31:2571,194:[1,2572]}),{19:$VM3,21:$VN3,22:662,129:2573,200:$VO3,215:665,216:$VP3},o($Vz3,$VQ3),o($VC3,$VK3),o($Vz3,$VL3,{31:2574,194:[1,2575]}),{19:$VM3,21:$VN3,22:662,129:2576,200:$VO3,215:665,216:$VP3},o($VE3,$VR3),o($VF3,$VS3),o($VF3,$VT3),o($VF3,$VU3),{100:[1,2577]},o($VF3,$VT1),{100:[1,2579],106:2578,108:[1,2580],109:[1,2581],110:2582,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,2583]},o($V46,$VV3),o($VD3,$VK3),o($V46,$VL3,{31:2584,194:[1,2585]}),{19:$VM3,21:$VN3,22:662,129:2586,200:$VO3,215:665,216:$VP3},o($VF3,$VW3),{121:[1,2587]},{19:[1,2590],21:[1,2593],22:2589,87:2588,215:2591,216:[1,2592]},o($VR4,$Vq2,{84:2049,193:2050,83:2594,191:$VZ6}),o($Vz3,$VB2),o($Vz3,$Vw),o($Vz3,$Vx),o($Vz3,$Vn),o($Vz3,$Vo),o($Vz3,$Vy),o($Vz3,$Vp),o($Vz3,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:2595,121:$VX2,148:$VY2,190:$VZ2}),o($VR4,$Vq2,{84:2049,193:2050,83:2596,191:$VZ6}),o($VC3,$Vt2,{99:1498,95:2597,101:$V66,102:$VR,103:$VS,104:$VT}),o($VP4,$Vu2),o($VP4,$V33),o($Vz3,$Vy3),o($V36,$VJ3),o($VB3,$VK3),o($V36,$VL3,{31:2598,194:[1,2599]}),{19:$VM3,21:$VN3,22:662,129:2600,200:$VO3,215:665,216:$VP3},o($Vz3,$VQ3),o($VC3,$VK3),o($Vz3,$VL3,{31:2601,194:[1,2602]}),{19:$VM3,21:$VN3,22:662,129:2603,200:$VO3,215:665,216:$VP3},o($VE3,$VR3),o($VF3,$VS3),o($VF3,$VT3),o($VF3,$VU3),{100:[1,2604]},o($VF3,$VT1),{100:[1,2606],106:2605,108:[1,2607],109:[1,2608],110:2609,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,2610]},o($V46,$VV3),o($VD3,$VK3),o($V46,$VL3,{31:2611,194:[1,2612]}),{19:$VM3,21:$VN3,22:662,129:2613,200:$VO3,215:665,216:$VP3},o($VF3,$VW3),{121:[1,2614]},{19:[1,2617],21:[1,2620],22:2616,87:2615,215:2618,216:[1,2619]},o($Vr1,$Vh6),o($Vr1,$VK1),o($Vt1,$Vh6),o($Vt1,$VK1),o($VD1,$Vh6),o($VD1,$VK1),o($Vf6,$Vh6),o($Vf6,$VK1),o($V$6,$Vs1,{82:2621}),o($V$6,$VG7),o($V$6,$VH7),o($V$6,$VI7),o($V$6,$VJ7),o($V$6,$VK7),o($V57,$VL7,{57:2622,51:[1,2623]}),o($V77,$VM7,{61:2624,53:[1,2625]}),o($V97,$VN7),o($V97,$VO7,{74:2626,76:2627,78:2628,39:2629,118:2630,79:[1,2631],80:[1,2632],81:[1,2633],119:$VJ,125:$VJ,127:$VJ,190:$VJ,228:$VJ}),o($V97,$VP7),o($V97,$VO5,{77:2634,73:2635,92:2636,94:2637,95:2641,99:2642,96:[1,2638],97:[1,2639],98:[1,2640],101:$VQ7,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:2644,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($V97,$VR7),o($VS7,$Vy1,{93:2645}),o($VT7,$Vz1,{99:2108,95:2646,101:$Vb7,102:$VR,103:$VS,104:$VT}),o($VU7,$VB1,{86:2647}),o($VU7,$VB1,{86:2648}),o($VU7,$VB1,{86:2649}),o($V97,$VC1,{105:2112,107:2113,91:2650,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VV7,$VU5),o($VV7,$VV5),o($VS7,$VG1),o($VS7,$VH1),o($VS7,$VI1),o($VS7,$VJ1),o($VU7,$VK1),o($VL1,$VM1,{163:2651}),o($VW7,$VO1),{119:[1,2652],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($VV7,$VE1),o($VV7,$VF1),{19:[1,2656],21:[1,2660],22:2654,33:2653,201:2655,215:2657,216:[1,2659],217:[1,2658]},{100:[1,2661]},o($VS7,$VT1),o($VU7,$Vn),o($VU7,$Vo),{100:[1,2663],106:2662,108:[1,2664],109:[1,2665],110:2666,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,2667]},o($VU7,$Vp),o($VU7,$Vq),o($V$6,$Vs1,{82:2668}),o($Vp6,$Vi6),o($Vp6,$Vj6),o($Vp6,$Vk6),o($Vs6,$Vl6),o($Vs6,$Vm6),o($Vs6,$Vn6),o($Vr,$Vs,{46:2669,47:2670,55:2671,59:2672,41:2673,44:$Vt}),{70:[1,2674]},o($Vs4,$VL5,{226:2675,53:[1,2676]}),o($Vt4,$VM5),o($VI,$VJ,{76:2677,78:2678,39:2679,118:2680,79:[1,2681],80:[1,2682],81:[1,2683]}),o($Vt4,$VN5),o($Vt4,$VO5,{77:2684,73:2685,92:2686,94:2687,95:2691,99:2692,96:[1,2688],97:[1,2689],98:[1,2690],101:$VX7,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:2694,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vt4,$VQ5),o($VS5,$VB1,{86:2695}),o($VS5,$VB1,{86:2696}),o($VS5,$VB1,{86:2697}),o($Vt4,$VC1,{105:2147,107:2148,91:2698,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VT5,$VU5),o($VT5,$VV5),o($VS5,$VK1),o($VL1,$VM1,{163:2699}),o($VW5,$VO1),{119:[1,2700],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($VT5,$VE1),o($VT5,$VF1),{19:[1,2704],21:[1,2708],22:2702,33:2701,201:2703,215:2705,216:[1,2707],217:[1,2706]},o($VS5,$Vn),o($VS5,$Vo),{100:[1,2710],106:2709,108:[1,2711],109:[1,2712],110:2713,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,2714]},o($VS5,$Vp),o($VS5,$Vq),o($Vt4,$VM5),o($VI,$VJ,{76:2715,78:2716,39:2717,118:2718,79:[1,2719],80:[1,2720],81:[1,2721]}),o($Vt4,$VN5),o($Vt4,$VO5,{77:2722,73:2723,92:2724,94:2725,95:2729,99:2730,96:[1,2726],97:[1,2727],98:[1,2728],101:$VY7,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:2732,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vt4,$VQ5),o($VS5,$VB1,{86:2733}),o($VS5,$VB1,{86:2734}),o($VS5,$VB1,{86:2735}),o($Vt4,$VC1,{105:2172,107:2173,91:2736,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VT5,$VU5),o($VT5,$VV5),o($VS5,$VK1),o($VL1,$VM1,{163:2737}),o($VW5,$VO1),{119:[1,2738],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($VT5,$VE1),o($VT5,$VF1),{19:[1,2742],21:[1,2746],22:2740,33:2739,201:2741,215:2743,216:[1,2745],217:[1,2744]},o($VS5,$Vn),o($VS5,$Vo),{100:[1,2748],106:2747,108:[1,2749],109:[1,2750],110:2751,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,2752]},o($VS5,$Vp),o($VS5,$Vq),{121:[1,2753]},o($Vx6,$VR3),o($VS5,$V33),o($VS5,$V43),o($VS5,$V53),o($VS5,$V63),o($VS5,$V73),{111:[1,2754]},o($VS5,$Vc3),o($VT5,$Vt5),o($VW5,$VX5),o($VW5,$VK1),o($VW5,$Vn),o($VW5,$Vo),o($VW5,$Vp),o($VW5,$Vq),o($VF4,$V41),o($VF4,$V51),o($VF4,$V61),o($Vh3,$Vr5),o($Vh3,$Vs5),{19:$Vz6,21:$VA6,22:2756,87:2755,215:1622,216:$VB6},o($VG,$Vw3),o($VI,$VJ,{62:2757,64:2758,66:2759,67:2760,73:2763,75:2764,72:2765,39:2766,92:2767,94:2768,87:2770,88:2771,89:2772,78:2773,95:2780,22:2781,91:2783,118:2784,99:2785,215:2788,105:2789,107:2790,19:[1,2787],21:[1,2792],69:[1,2761],71:[1,2762],79:[1,2774],80:[1,2775],81:[1,2776],85:[1,2769],96:[1,2777],97:[1,2778],98:[1,2779],101:$VZ7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:[1,2782],216:[1,2791]}),o($Vr2,$Vq2,{84:2220,193:2221,83:2793,191:$Vf7}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:2794,121:$VX2,148:$VY2,190:$VZ2}),o($Vr2,$Vq2,{84:2220,193:2221,83:2795,191:$Vf7}),o($Vt1,$Vt2,{99:1663,95:2796,101:$VC6,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V33),o($VG,$Vy3),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:2797,194:[1,2798]}),{19:$VM3,21:$VN3,22:662,129:2799,200:$VO3,215:665,216:$VP3},o($VG,$VQ3),o($Vt1,$VK3),o($VG,$VL3,{31:2800,194:[1,2801]}),{19:$VM3,21:$VN3,22:662,129:2802,200:$VO3,215:665,216:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{100:[1,2803]},o($VA1,$VT1),{100:[1,2805],106:2804,108:[1,2806],109:[1,2807],110:2808,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,2809]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:2810,194:[1,2811]}),{19:$VM3,21:$VN3,22:662,129:2812,200:$VO3,215:665,216:$VP3},o($VA1,$VW3),{121:[1,2813]},{19:[1,2816],21:[1,2819],22:2815,87:2814,215:2817,216:[1,2818]},o($Vr2,$Vq2,{84:2258,193:2259,83:2820,191:$Vh7}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:2821,121:$VX2,148:$VY2,190:$VZ2}),o($Vr2,$Vq2,{84:2258,193:2259,83:2822,191:$Vh7}),o($Vt1,$Vt2,{99:1710,95:2823,101:$VD6,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V33),o($VG,$Vy3),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:2824,194:[1,2825]}),{19:$VM3,21:$VN3,22:662,129:2826,200:$VO3,215:665,216:$VP3},o($VG,$VQ3),o($Vt1,$VK3),o($VG,$VL3,{31:2827,194:[1,2828]}),{19:$VM3,21:$VN3,22:662,129:2829,200:$VO3,215:665,216:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{100:[1,2830]},o($VA1,$VT1),{100:[1,2832],106:2831,108:[1,2833],109:[1,2834],110:2835,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,2836]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:2837,194:[1,2838]}),{19:$VM3,21:$VN3,22:662,129:2839,200:$VO3,215:665,216:$VP3},o($VA1,$VW3),{121:[1,2840]},{19:[1,2843],21:[1,2846],22:2842,87:2841,215:2844,216:[1,2845]},o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$Vr5),o($Vr1,$Vs5),{19:$VE6,21:$VF6,22:2848,87:2847,215:1745,216:$VG6},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$Vr5),o($Vt1,$Vs5),{19:$VH6,21:$VI6,22:2850,87:2849,215:1771,216:$VJ6},o($VA1,$VX5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$Vr5),o($VD1,$Vs5),{19:$VK6,21:$VL6,22:2852,87:2851,215:1798,216:$VM6},o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:2853}),o($VG,$VE1),o($VG,$VF1),{19:[1,2857],21:[1,2861],22:2855,33:2854,201:2856,215:2858,216:[1,2860],217:[1,2859]},{119:[1,2862],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:2863}),o($Vh2,$Vy1,{93:2864}),o($Vt1,$Vz1,{99:2318,95:2865,101:$Vj7,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,2866]},o($Vh2,$VT1),{70:[1,2867]},o($Vp2,$Vq2,{83:2868,84:2869,193:2870,191:[1,2871]}),o($Vr2,$Vq2,{83:2872,84:2873,193:2874,191:$V_7}),o($Vr1,$Vt2,{99:1847,95:2876,101:$VN6,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:2877,95:2878,91:2879,99:2880,105:2882,107:2883,101:$V$7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:2877,95:2878,91:2879,99:2880,105:2882,107:2883,101:$V$7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:2877,95:2878,91:2879,99:2880,105:2882,107:2883,101:$V$7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:2884,84:2885,193:2886,191:[1,2887]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,2888],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:2889,121:$VX2,148:$VY2,190:$VZ2}),o($Vx1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),o($VN1,$V73),{111:[1,2890]},o($VN1,$Vc3),o($Vt1,$Vt5),{194:[1,2893],195:2891,196:[1,2892]},o($Vr1,$V76),o($Vr1,$V86),o($Vr1,$V96),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V04),o($Vr1,$V14,{203:2894,204:2895,111:[1,2896]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($Va6,$Vb3),{194:[1,2899],195:2897,196:[1,2898]},o($Vt1,$V76),o($Vt1,$V86),o($Vt1,$V96),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V04),o($Vt1,$V14,{203:2900,204:2901,111:[1,2902]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vb6,$V83),o($Vb6,$V93),o($Vb6,$Va3),o($Vb6,$Vb3),{19:[1,2905],21:[1,2908],22:2904,87:2903,215:2906,216:[1,2907]},{194:[1,2911],195:2909,196:[1,2910]},o($VD1,$V76),o($VD1,$V86),o($VD1,$V96),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V04),o($VD1,$V14,{203:2912,204:2913,111:[1,2914]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vc6,$V83),o($Vc6,$V93),o($Vc6,$Va3),o($Vc6,$Vb3),o($Vt1,$Vt5),{194:[1,2917],195:2915,196:[1,2916]},o($Vr1,$V76),o($Vr1,$V86),o($Vr1,$V96),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V04),o($Vr1,$V14,{203:2918,204:2919,111:[1,2920]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($Va6,$Vb3),{194:[1,2923],195:2921,196:[1,2922]},o($Vt1,$V76),o($Vt1,$V86),o($Vt1,$V96),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V04),o($Vt1,$V14,{203:2924,204:2925,111:[1,2926]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vb6,$V83),o($Vb6,$V93),o($Vb6,$Va3),o($Vb6,$Vb3),{19:[1,2929],21:[1,2932],22:2928,87:2927,215:2930,216:[1,2931]},{194:[1,2935],195:2933,196:[1,2934]},o($VD1,$V76),o($VD1,$V86),o($VD1,$V96),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V04),o($VD1,$V14,{203:2936,204:2937,111:[1,2938]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vc6,$V83),o($Vc6,$V93),o($Vc6,$Va3),o($Vc6,$Vb3),o($VQ4,$V41),o($VQ4,$V51),o($VQ4,$V61),o($VB3,$Vr5),o($VB3,$Vs5),{19:$VO6,21:$VP6,22:2940,87:2939,215:1915,216:$VQ6},o($VR4,$V41),o($VR4,$V51),o($VR4,$V61),o($VC3,$Vr5),o($VC3,$Vs5),{19:$VR6,21:$VS6,22:2942,87:2941,215:1941,216:$VT6},o($VT4,$V41),o($VT4,$V51),o($VT4,$V61),o($VD3,$Vr5),o($VD3,$Vs5),{19:$VU6,21:$VV6,22:2944,87:2943,215:1967,216:$VW6},o($VF3,$VX5),o($VF3,$VK1),o($VF3,$Vn),o($VF3,$Vo),o($VF3,$Vp),o($VF3,$Vq),o($Vz3,$Vb1),o($VI,$VJ,{65:2945,67:2946,72:2947,39:2948,78:2949,118:2953,51:$Vc1,53:$Vc1,70:$Vc1,79:[1,2950],80:[1,2951],81:[1,2952]}),o($Vz3,$Vg1),o($Vz3,$Vh1,{68:2954,64:2955,73:2956,92:2957,94:2958,95:2962,99:2963,96:[1,2959],97:[1,2960],98:[1,2961],101:$V08,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:2965,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vz3,$Vq1),o($VB3,$Vs1,{82:2966}),o($VC3,$Vs1,{82:2967}),o($V46,$Vv1),o($V46,$Vw1),o($VE3,$Vy1,{93:2968}),o($VB3,$Vz1,{99:2559,95:2969,101:$VF7,102:$VR,103:$VS,104:$VT}),o($VF3,$VB1,{86:2970}),o($VF3,$VB1,{86:2971}),o($VF3,$VB1,{86:2972}),o($VC3,$VC1,{105:2563,107:2564,91:2973,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD3,$Vs1,{82:2974}),o($V46,$VE1),o($V46,$VF1),{19:[1,2978],21:[1,2982],22:2976,33:2975,201:2977,215:2979,216:[1,2981],217:[1,2980]},o($VE3,$VG1),o($VE3,$VH1),o($VE3,$VI1),o($VE3,$VJ1),o($VF3,$VK1),o($VL1,$VM1,{163:2983}),o($VG3,$VO1),{119:[1,2984],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},{100:[1,2985]},o($VE3,$VT1),o($VF3,$Vn),o($VF3,$Vo),{100:[1,2987],106:2986,108:[1,2988],109:[1,2989],110:2990,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,2991]},o($VF3,$Vp),o($VF3,$Vq),o($Vz3,$VV3),{121:[1,2992]},o($Vz3,$VJ3),o($VP4,$VR3),o($VQ4,$VX4),{19:$Vi,21:$Vj,22:2993,215:45,216:$Vk},{19:$V18,21:$V28,22:2995,100:[1,3006],108:[1,3007],109:[1,3008],110:3005,182:2996,192:2994,197:2999,198:3000,199:3001,202:3004,205:[1,3009],206:[1,3010],207:[1,3015],208:[1,3016],209:[1,3017],210:[1,3018],211:[1,3011],212:[1,3012],213:[1,3013],214:[1,3014],215:2998,216:$V38},o($VR4,$VX4),{19:$Vi,21:$Vj,22:3019,215:45,216:$Vk},{19:$V48,21:$V58,22:3021,100:[1,3032],108:[1,3033],109:[1,3034],110:3031,182:3022,192:3020,197:3025,198:3026,199:3027,202:3030,205:[1,3035],206:[1,3036],207:[1,3041],208:[1,3042],209:[1,3043],210:[1,3044],211:[1,3037],212:[1,3038],213:[1,3039],214:[1,3040],215:3024,216:$V68},o($VF3,$V33),o($VF3,$V43),o($VF3,$V53),o($VF3,$V63),o($VF3,$V73),{111:[1,3045]},o($VF3,$Vc3),o($VT4,$VX4),{19:$Vi,21:$Vj,22:3046,215:45,216:$Vk},{19:$V78,21:$V88,22:3048,100:[1,3059],108:[1,3060],109:[1,3061],110:3058,182:3049,192:3047,197:3052,198:3053,199:3054,202:3057,205:[1,3062],206:[1,3063],207:[1,3068],208:[1,3069],209:[1,3070],210:[1,3071],211:[1,3064],212:[1,3065],213:[1,3066],214:[1,3067],215:3051,216:$V98},o($VD3,$Vt5),o($VG3,$VX5),o($VG3,$VK1),o($VG3,$Vn),o($VG3,$Vo),o($VG3,$Vp),o($VG3,$Vq),o($Vz3,$VV3),{121:[1,3072]},o($Vz3,$VJ3),o($VP4,$VR3),o($VQ4,$VX4),{19:$Vi,21:$Vj,22:3073,215:45,216:$Vk},{19:$Va8,21:$Vb8,22:3075,100:[1,3086],108:[1,3087],109:[1,3088],110:3085,182:3076,192:3074,197:3079,198:3080,199:3081,202:3084,205:[1,3089],206:[1,3090],207:[1,3095],208:[1,3096],209:[1,3097],210:[1,3098],211:[1,3091],212:[1,3092],213:[1,3093],214:[1,3094],215:3078,216:$Vc8},o($VR4,$VX4),{19:$Vi,21:$Vj,22:3099,215:45,216:$Vk},{19:$Vd8,21:$Ve8,22:3101,100:[1,3112],108:[1,3113],109:[1,3114],110:3111,182:3102,192:3100,197:3105,198:3106,199:3107,202:3110,205:[1,3115],206:[1,3116],207:[1,3121],208:[1,3122],209:[1,3123],210:[1,3124],211:[1,3117],212:[1,3118],213:[1,3119],214:[1,3120],215:3104,216:$Vf8},o($VF3,$V33),o($VF3,$V43),o($VF3,$V53),o($VF3,$V63),o($VF3,$V73),{111:[1,3125]},o($VF3,$Vc3),o($VT4,$VX4),{19:$Vi,21:$Vj,22:3126,215:45,216:$Vk},{19:$Vg8,21:$Vh8,22:3128,100:[1,3139],108:[1,3140],109:[1,3141],110:3138,182:3129,192:3127,197:3132,198:3133,199:3134,202:3137,205:[1,3142],206:[1,3143],207:[1,3148],208:[1,3149],209:[1,3150],210:[1,3151],211:[1,3144],212:[1,3145],213:[1,3146],214:[1,3147],215:3131,216:$Vi8},o($VD3,$Vt5),o($VG3,$VX5),o($VG3,$VK1),o($VG3,$Vn),o($VG3,$Vo),o($VG3,$Vp),o($VG3,$Vq),o($Vj8,$Vq2,{83:3152,84:3153,193:3154,191:$Vk8}),o($V77,$Vl8),o($Vr,$Vs,{55:3156,59:3157,41:3158,44:$Vt}),o($V97,$Vm8),o($Vr,$Vs,{59:3159,41:3160,44:$Vt}),o($V97,$Vn8),o($V97,$Vo8),o($V97,$VU5),o($V97,$VV5),{119:[1,3161],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($V97,$VE1),o($V97,$VF1),{19:[1,3165],21:[1,3169],22:3163,33:3162,201:3164,215:3166,216:[1,3168],217:[1,3167]},o($V97,$Vp8),o($V97,$Vw6),o($Vq8,$Vy1,{93:3170}),o($V97,$Vz1,{99:2642,95:3171,101:$VQ7,102:$VR,103:$VS,104:$VT}),o($Vq8,$VG1),o($Vq8,$VH1),o($Vq8,$VI1),o($Vq8,$VJ1),{100:[1,3172]},o($Vq8,$VT1),{70:[1,3173]},o($VT7,$Vt2,{99:2108,95:3174,101:$Vb7,102:$VR,103:$VS,104:$VT}),o($VS7,$Vu2),o($V97,$Vv2,{90:3175,95:3176,91:3177,99:3178,105:3180,107:3181,101:$Vr8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V97,$Vx2,{90:3175,95:3176,91:3177,99:3178,105:3180,107:3181,101:$Vr8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V97,$Vy2,{90:3175,95:3176,91:3177,99:3178,105:3180,107:3181,101:$Vr8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VW7,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,3182],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:3183,121:$VX2,148:$VY2,190:$VZ2}),o($VV7,$VB2),o($VV7,$Vw),o($VV7,$Vx),o($VV7,$Vn),o($VV7,$Vo),o($VV7,$Vy),o($VV7,$Vp),o($VV7,$Vq),o($VS7,$V33),o($VW7,$V43),o($VW7,$V53),o($VW7,$V63),o($VW7,$V73),{111:[1,3184]},o($VW7,$Vc3),o($Vj8,$Vq2,{84:3153,193:3154,83:3185,191:$Vk8}),o($Vs8,$V07,{152:3186,153:3187,156:$Vt8,157:$Vu8,158:$Vv8,159:$Vw8}),o($Vx8,$V67),o($Vy8,$V87,{56:3192}),o($Vz8,$Va7,{60:3193}),o($VI,$VJ,{63:3194,73:3195,75:3196,76:3197,92:3200,94:3201,87:3203,88:3204,89:3205,78:3206,39:3207,95:3211,22:3212,91:3214,118:3215,99:3219,215:3222,105:3223,107:3224,19:[1,3221],21:[1,3226],69:[1,3198],71:[1,3199],79:[1,3216],80:[1,3217],81:[1,3218],85:[1,3202],96:[1,3208],97:[1,3209],98:[1,3210],101:$VA8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:[1,3213],216:[1,3225]}),o($Vs8,$V07,{153:3187,152:3227,156:$Vt8,157:$Vu8,158:$Vv8,159:$Vw8}),o($Vt4,$Vt6),o($Vr,$Vs,{224:3228,41:3229,44:$Vt}),o($Vt4,$Vu6),o($Vt4,$VU5),o($Vt4,$VV5),{119:[1,3230],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($Vt4,$VE1),o($Vt4,$VF1),{19:[1,3234],21:[1,3238],22:3232,33:3231,201:3233,215:3235,216:[1,3237],217:[1,3236]},o($Vt4,$Vv6),o($Vt4,$Vw6),o($Vx6,$Vy1,{93:3239}),o($Vt4,$Vz1,{99:2692,95:3240,101:$VX7,102:$VR,103:$VS,104:$VT}),o($Vx6,$VG1),o($Vx6,$VH1),o($Vx6,$VI1),o($Vx6,$VJ1),{100:[1,3241]},o($Vx6,$VT1),{70:[1,3242]},o($Vt4,$Vv2,{90:3243,95:3244,91:3245,99:3246,105:3248,107:3249,101:$VB8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt4,$Vx2,{90:3243,95:3244,91:3245,99:3246,105:3248,107:3249,101:$VB8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt4,$Vy2,{90:3243,95:3244,91:3245,99:3246,105:3248,107:3249,101:$VB8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VW5,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,3250],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:3251,121:$VX2,148:$VY2,190:$VZ2}),o($VT5,$VB2),o($VT5,$Vw),o($VT5,$Vx),o($VT5,$Vn),o($VT5,$Vo),o($VT5,$Vy),o($VT5,$Vp),o($VT5,$Vq),o($VW5,$V43),o($VW5,$V53),o($VW5,$V63),o($VW5,$V73),{111:[1,3252]},o($VW5,$Vc3),o($Vt4,$Vu6),o($Vt4,$VU5),o($Vt4,$VV5),{119:[1,3253],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($Vt4,$VE1),o($Vt4,$VF1),{19:[1,3257],21:[1,3261],22:3255,33:3254,201:3256,215:3258,216:[1,3260],217:[1,3259]},o($Vt4,$Vv6),o($Vt4,$Vw6),o($Vx6,$Vy1,{93:3262}),o($Vt4,$Vz1,{99:2730,95:3263,101:$VY7,102:$VR,103:$VS,104:$VT}),o($Vx6,$VG1),o($Vx6,$VH1),o($Vx6,$VI1),o($Vx6,$VJ1),{100:[1,3264]},o($Vx6,$VT1),{70:[1,3265]},o($Vt4,$Vv2,{90:3266,95:3267,91:3268,99:3269,105:3271,107:3272,101:$VC8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt4,$Vx2,{90:3266,95:3267,91:3268,99:3269,105:3271,107:3272,101:$VC8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt4,$Vy2,{90:3266,95:3267,91:3268,99:3269,105:3271,107:3272,101:$VC8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VW5,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,3273],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:3274,121:$VX2,148:$VY2,190:$VZ2}),o($VT5,$VB2),o($VT5,$Vw),o($VT5,$Vx),o($VT5,$Vn),o($VT5,$Vo),o($VT5,$Vy),o($VT5,$Vp),o($VT5,$Vq),o($VW5,$V43),o($VW5,$V53),o($VW5,$V63),o($VW5,$V73),{111:[1,3275]},o($VW5,$Vc3),o($Vt4,$Vt5),{19:[1,3278],21:[1,3281],22:3277,87:3276,215:3279,216:[1,3280]},o($Vh3,$Vh6),o($Vh3,$VK1),o($VG,$Vb1),o($VG,$Vc1,{65:3282,67:3283,72:3284,39:3285,78:3286,118:3290,79:[1,3287],80:[1,3288],81:[1,3289],119:$VJ,125:$VJ,127:$VJ,190:$VJ,228:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:3291,64:3292,73:3293,92:3294,94:3295,95:3299,99:3300,96:[1,3296],97:[1,3297],98:[1,3298],101:$VD8,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:3302,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:3303}),o($Vt1,$Vs1,{82:3304}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:3305}),o($Vr1,$Vz1,{99:2785,95:3306,101:$VZ7,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:3307}),o($VA1,$VB1,{86:3308}),o($VA1,$VB1,{86:3309}),o($Vt1,$VC1,{105:2789,107:2790,91:3310,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:3311}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,3315],21:[1,3319],22:3313,33:3312,201:3314,215:3316,216:[1,3318],217:[1,3317]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{163:3320}),o($VN1,$VO1),{119:[1,3321],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},{100:[1,3322]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,3324],106:3323,108:[1,3325],109:[1,3326],110:3327,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,3328]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$VV3),{121:[1,3329]},o($VG,$VJ3),o($Vh2,$VR3),o($Vp2,$VX4),{19:$Vi,21:$Vj,22:3330,215:45,216:$Vk},{19:$VE8,21:$VF8,22:3332,100:[1,3343],108:[1,3344],109:[1,3345],110:3342,182:3333,192:3331,197:3336,198:3337,199:3338,202:3341,205:[1,3346],206:[1,3347],207:[1,3352],208:[1,3353],209:[1,3354],210:[1,3355],211:[1,3348],212:[1,3349],213:[1,3350],214:[1,3351],215:3335,216:$VG8},o($Vr2,$VX4),{19:$Vi,21:$Vj,22:3356,215:45,216:$Vk},{19:$VH8,21:$VI8,22:3358,100:[1,3369],108:[1,3370],109:[1,3371],110:3368,182:3359,192:3357,197:3362,198:3363,199:3364,202:3367,205:[1,3372],206:[1,3373],207:[1,3378],208:[1,3379],209:[1,3380],210:[1,3381],211:[1,3374],212:[1,3375],213:[1,3376],214:[1,3377],215:3361,216:$VJ8},o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),o($VA1,$V73),{111:[1,3382]},o($VA1,$Vc3),o($VA2,$VX4),{19:$Vi,21:$Vj,22:3383,215:45,216:$Vk},{19:$VK8,21:$VL8,22:3385,100:[1,3396],108:[1,3397],109:[1,3398],110:3395,182:3386,192:3384,197:3389,198:3390,199:3391,202:3394,205:[1,3399],206:[1,3400],207:[1,3405],208:[1,3406],209:[1,3407],210:[1,3408],211:[1,3401],212:[1,3402],213:[1,3403],214:[1,3404],215:3388,216:$VM8},o($VD1,$Vt5),o($VN1,$VX5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($VG,$VV3),{121:[1,3409]},o($VG,$VJ3),o($Vh2,$VR3),o($Vp2,$VX4),{19:$Vi,21:$Vj,22:3410,215:45,216:$Vk},{19:$VN8,21:$VO8,22:3412,100:[1,3423],108:[1,3424],109:[1,3425],110:3422,182:3413,192:3411,197:3416,198:3417,199:3418,202:3421,205:[1,3426],206:[1,3427],207:[1,3432],208:[1,3433],209:[1,3434],210:[1,3435],211:[1,3428],212:[1,3429],213:[1,3430],214:[1,3431],215:3415,216:$VP8},o($Vr2,$VX4),{19:$Vi,21:$Vj,22:3436,215:45,216:$Vk},{19:$VQ8,21:$VR8,22:3438,100:[1,3449],108:[1,3450],109:[1,3451],110:3448,182:3439,192:3437,197:3442,198:3443,199:3444,202:3447,205:[1,3452],206:[1,3453],207:[1,3458],208:[1,3459],209:[1,3460],210:[1,3461],211:[1,3454],212:[1,3455],213:[1,3456],214:[1,3457],215:3441,216:$VS8},o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),o($VA1,$V73),{111:[1,3462]},o($VA1,$Vc3),o($VA2,$VX4),{19:$Vi,21:$Vj,22:3463,215:45,216:$Vk},{19:$VT8,21:$VU8,22:3465,100:[1,3476],108:[1,3477],109:[1,3478],110:3475,182:3466,192:3464,197:3469,198:3470,199:3471,202:3474,205:[1,3479],206:[1,3480],207:[1,3485],208:[1,3486],209:[1,3487],210:[1,3488],211:[1,3481],212:[1,3482],213:[1,3483],214:[1,3484],215:3468,216:$VV8},o($VD1,$Vt5),o($VN1,$VX5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($Vr1,$Vh6),o($Vr1,$VK1),o($Vt1,$Vh6),o($Vt1,$VK1),o($VD1,$Vh6),o($VD1,$VK1),o($Vr2,$Vq2,{84:2873,193:2874,83:3489,191:$V_7}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:3490,121:$VX2,148:$VY2,190:$VZ2}),o($Vr2,$Vq2,{84:2873,193:2874,83:3491,191:$V_7}),o($Vt1,$Vt2,{99:2318,95:3492,101:$Vj7,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V33),o($VG,$Vy3),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:3493,194:[1,3494]}),{19:$VM3,21:$VN3,22:662,129:3495,200:$VO3,215:665,216:$VP3},o($VG,$VQ3),o($Vt1,$VK3),o($VG,$VL3,{31:3496,194:[1,3497]}),{19:$VM3,21:$VN3,22:662,129:3498,200:$VO3,215:665,216:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{100:[1,3499]},o($VA1,$VT1),{100:[1,3501],106:3500,108:[1,3502],109:[1,3503],110:3504,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,3505]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:3506,194:[1,3507]}),{19:$VM3,21:$VN3,22:662,129:3508,200:$VO3,215:665,216:$VP3},o($VA1,$VW3),{121:[1,3509]},{19:[1,3512],21:[1,3515],22:3511,87:3510,215:3513,216:[1,3514]},o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$Vr5),o($Vr1,$Vs5),{19:$Vk7,21:$Vl7,22:3517,87:3516,215:2353,216:$Vm7},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$Vr5),o($Vt1,$Vs5),{19:$Vn7,21:$Vo7,22:3519,87:3518,215:2379,216:$Vp7},o($VA1,$VX5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$Vr5),o($VD1,$Vs5),{19:$Vq7,21:$Vr7,22:3521,87:3520,215:2406,216:$Vs7},o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$Vr5),o($Vr1,$Vs5),{19:$Vt7,21:$Vu7,22:3523,87:3522,215:2433,216:$Vv7},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$Vr5),o($Vt1,$Vs5),{19:$Vw7,21:$Vx7,22:3525,87:3524,215:2459,216:$Vy7},o($VA1,$VX5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$Vr5),o($VD1,$Vs5),{19:$Vz7,21:$VA7,22:3527,87:3526,215:2486,216:$VB7},o($VB3,$Vh6),o($VB3,$VK1),o($VC3,$Vh6),o($VC3,$VK1),o($VD3,$Vh6),o($VD3,$VK1),o($Vz3,$Vd2),o($Vz3,$Ve2),o($Vz3,$Vv1),o($Vz3,$Vw1),o($VC3,$Vs1,{82:3528}),o($Vz3,$VE1),o($Vz3,$VF1),{19:[1,3532],21:[1,3536],22:3530,33:3529,201:3531,215:3533,216:[1,3535],217:[1,3534]},{119:[1,3537],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($Vz3,$Vf2),o($Vz3,$Vg2),o($VC3,$Vs1,{82:3538}),o($VP4,$Vy1,{93:3539}),o($VC3,$Vz1,{99:2963,95:3540,101:$V08,102:$VR,103:$VS,104:$VT}),o($VP4,$VG1),o($VP4,$VH1),o($VP4,$VI1),o($VP4,$VJ1),{100:[1,3541]},o($VP4,$VT1),{70:[1,3542]},o($VQ4,$Vq2,{83:3543,84:3544,193:3545,191:[1,3546]}),o($VR4,$Vq2,{83:3547,84:3548,193:3549,191:$VW8}),o($VB3,$Vt2,{99:2559,95:3551,101:$VF7,102:$VR,103:$VS,104:$VT}),o($VE3,$Vu2),o($VC3,$Vv2,{90:3552,95:3553,91:3554,99:3555,105:3557,107:3558,101:$VX8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VC3,$Vx2,{90:3552,95:3553,91:3554,99:3555,105:3557,107:3558,101:$VX8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VC3,$Vy2,{90:3552,95:3553,91:3554,99:3555,105:3557,107:3558,101:$VX8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VG3,$Vz2),o($VT4,$Vq2,{83:3559,84:3560,193:3561,191:[1,3562]}),o($V46,$VB2),o($V46,$Vw),o($V46,$Vx),o($V46,$Vn),o($V46,$Vo),o($V46,$Vy),o($V46,$Vp),o($V46,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,3563],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:3564,121:$VX2,148:$VY2,190:$VZ2}),o($VE3,$V33),o($VG3,$V43),o($VG3,$V53),o($VG3,$V63),o($VG3,$V73),{111:[1,3565]},o($VG3,$Vc3),o($VC3,$Vt5),{194:[1,3568],195:3566,196:[1,3567]},o($VB3,$V76),o($VB3,$V86),o($VB3,$V96),o($VB3,$Vn),o($VB3,$Vo),o($VB3,$VZ3),o($VB3,$V_3),o($VB3,$V$3),o($VB3,$Vp),o($VB3,$Vq),o($VB3,$V04),o($VB3,$V14,{203:3569,204:3570,111:[1,3571]}),o($VB3,$V24),o($VB3,$V34),o($VB3,$V44),o($VB3,$V54),o($VB3,$V64),o($VB3,$V74),o($VB3,$V84),o($VB3,$V94),o($VB3,$Va4),o($VC7,$V83),o($VC7,$V93),o($VC7,$Va3),o($VC7,$Vb3),{194:[1,3574],195:3572,196:[1,3573]},o($VC3,$V76),o($VC3,$V86),o($VC3,$V96),o($VC3,$Vn),o($VC3,$Vo),o($VC3,$VZ3),o($VC3,$V_3),o($VC3,$V$3),o($VC3,$Vp),o($VC3,$Vq),o($VC3,$V04),o($VC3,$V14,{203:3575,204:3576,111:[1,3577]}),o($VC3,$V24),o($VC3,$V34),o($VC3,$V44),o($VC3,$V54),o($VC3,$V64),o($VC3,$V74),o($VC3,$V84),o($VC3,$V94),o($VC3,$Va4),o($VD7,$V83),o($VD7,$V93),o($VD7,$Va3),o($VD7,$Vb3),{19:[1,3580],21:[1,3583],22:3579,87:3578,215:3581,216:[1,3582]},{194:[1,3586],195:3584,196:[1,3585]},o($VD3,$V76),o($VD3,$V86),o($VD3,$V96),o($VD3,$Vn),o($VD3,$Vo),o($VD3,$VZ3),o($VD3,$V_3),o($VD3,$V$3),o($VD3,$Vp),o($VD3,$Vq),o($VD3,$V04),o($VD3,$V14,{203:3587,204:3588,111:[1,3589]}),o($VD3,$V24),o($VD3,$V34),o($VD3,$V44),o($VD3,$V54),o($VD3,$V64),o($VD3,$V74),o($VD3,$V84),o($VD3,$V94),o($VD3,$Va4),o($VE7,$V83),o($VE7,$V93),o($VE7,$Va3),o($VE7,$Vb3),o($VC3,$Vt5),{194:[1,3592],195:3590,196:[1,3591]},o($VB3,$V76),o($VB3,$V86),o($VB3,$V96),o($VB3,$Vn),o($VB3,$Vo),o($VB3,$VZ3),o($VB3,$V_3),o($VB3,$V$3),o($VB3,$Vp),o($VB3,$Vq),o($VB3,$V04),o($VB3,$V14,{203:3593,204:3594,111:[1,3595]}),o($VB3,$V24),o($VB3,$V34),o($VB3,$V44),o($VB3,$V54),o($VB3,$V64),o($VB3,$V74),o($VB3,$V84),o($VB3,$V94),o($VB3,$Va4),o($VC7,$V83),o($VC7,$V93),o($VC7,$Va3),o($VC7,$Vb3),{194:[1,3598],195:3596,196:[1,3597]},o($VC3,$V76),o($VC3,$V86),o($VC3,$V96),o($VC3,$Vn),o($VC3,$Vo),o($VC3,$VZ3),o($VC3,$V_3),o($VC3,$V$3),o($VC3,$Vp),o($VC3,$Vq),o($VC3,$V04),o($VC3,$V14,{203:3599,204:3600,111:[1,3601]}),o($VC3,$V24),o($VC3,$V34),o($VC3,$V44),o($VC3,$V54),o($VC3,$V64),o($VC3,$V74),o($VC3,$V84),o($VC3,$V94),o($VC3,$Va4),o($VD7,$V83),o($VD7,$V93),o($VD7,$Va3),o($VD7,$Vb3),{19:[1,3604],21:[1,3607],22:3603,87:3602,215:3605,216:[1,3606]},{194:[1,3610],195:3608,196:[1,3609]},o($VD3,$V76),o($VD3,$V86),o($VD3,$V96),o($VD3,$Vn),o($VD3,$Vo),o($VD3,$VZ3),o($VD3,$V_3),o($VD3,$V$3),o($VD3,$Vp),o($VD3,$Vq),o($VD3,$V04),o($VD3,$V14,{203:3611,204:3612,111:[1,3613]}),o($VD3,$V24),o($VD3,$V34),o($VD3,$V44),o($VD3,$V54),o($VD3,$V64),o($VD3,$V74),o($VD3,$V84),o($VD3,$V94),o($VD3,$Va4),o($VE7,$V83),o($VE7,$V93),o($VE7,$Va3),o($VE7,$Vb3),o($Vq4,$VY8),o($V$6,$VK3),o($Vq4,$VL3,{31:3614,194:[1,3615]}),{19:$VM3,21:$VN3,22:662,129:3616,200:$VO3,215:665,216:$VP3},o($V77,$VZ8),o($V97,$Va7,{60:3617}),o($VI,$VJ,{63:3618,73:3619,75:3620,76:3621,92:3624,94:3625,87:3627,88:3628,89:3629,78:3630,39:3631,95:3635,22:3636,91:3638,118:3639,99:3643,215:3646,105:3647,107:3648,19:[1,3645],21:[1,3650],69:[1,3622],71:[1,3623],79:[1,3640],80:[1,3641],81:[1,3642],85:[1,3626],96:[1,3632],97:[1,3633],98:[1,3634],101:$V_8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:[1,3637],216:[1,3649]}),o($V97,$V$8),o($VI,$VJ,{63:3651,73:3652,75:3653,76:3654,92:3657,94:3658,87:3660,88:3661,89:3662,78:3663,39:3664,95:3668,22:3669,91:3671,118:3672,99:3676,215:3679,105:3680,107:3681,19:[1,3678],21:[1,3683],69:[1,3655],71:[1,3656],79:[1,3673],80:[1,3674],81:[1,3675],85:[1,3659],96:[1,3665],97:[1,3666],98:[1,3667],101:$V09,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:[1,3670],216:[1,3682]}),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:3684,121:$VX2,148:$VY2,190:$VZ2}),o($V97,$VB2),o($V97,$Vw),o($V97,$Vx),o($V97,$Vn),o($V97,$Vo),o($V97,$Vy),o($V97,$Vp),o($V97,$Vq),o($V97,$Vt2,{99:2642,95:3685,101:$VQ7,102:$VR,103:$VS,104:$VT}),o($Vq8,$Vu2),o($Vq8,$V33),o($V97,$V19),o($VS7,$VR3),o($VU7,$VS3),o($VU7,$VT3),o($VU7,$VU3),{100:[1,3686]},o($VU7,$VT1),{100:[1,3688],106:3687,108:[1,3689],109:[1,3690],110:3691,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,3692]},o($VU7,$VW3),{121:[1,3693]},{19:[1,3696],21:[1,3699],22:3695,87:3694,215:3697,216:[1,3698]},o($Vq4,$V29),o($Vs8,$Vs1,{82:3700}),o($Vs8,$VG7),o($Vs8,$VH7),o($Vs8,$VI7),o($Vs8,$VJ7),o($Vs8,$VK7),o($Vx8,$VL7,{57:3701,51:[1,3702]}),o($Vy8,$VM7,{61:3703,53:[1,3704]}),o($Vz8,$VN7),o($Vz8,$VO7,{74:3705,76:3706,78:3707,39:3708,118:3709,79:[1,3710],80:[1,3711],81:[1,3712],119:$VJ,125:$VJ,127:$VJ,190:$VJ,228:$VJ}),o($Vz8,$VP7),o($Vz8,$VO5,{77:3713,73:3714,92:3715,94:3716,95:3720,99:3721,96:[1,3717],97:[1,3718],98:[1,3719],101:$V39,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:3723,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vz8,$VR7),o($V49,$Vy1,{93:3724}),o($V59,$Vz1,{99:3219,95:3725,101:$VA8,102:$VR,103:$VS,104:$VT}),o($V69,$VB1,{86:3726}),o($V69,$VB1,{86:3727}),o($V69,$VB1,{86:3728}),o($Vz8,$VC1,{105:3223,107:3224,91:3729,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V79,$VU5),o($V79,$VV5),o($V49,$VG1),o($V49,$VH1),o($V49,$VI1),o($V49,$VJ1),o($V69,$VK1),o($VL1,$VM1,{163:3730}),o($V89,$VO1),{119:[1,3731],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($V79,$VE1),o($V79,$VF1),{19:[1,3735],21:[1,3739],22:3733,33:3732,201:3734,215:3736,216:[1,3738],217:[1,3737]},{100:[1,3740]},o($V49,$VT1),o($V69,$Vn),o($V69,$Vo),{100:[1,3742],106:3741,108:[1,3743],109:[1,3744],110:3745,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,3746]},o($V69,$Vp),o($V69,$Vq),o($Vs8,$Vs1,{82:3747}),o($Vt4,$Vc7),o($VI,$VJ,{92:743,94:744,95:754,99:762,227:3748,73:3749,75:3750,76:3751,87:3755,88:3756,89:3757,78:3758,39:3759,22:3760,91:3762,118:3763,215:3768,105:3769,107:3770,19:[1,3767],21:[1,3772],69:[1,3752],71:[1,3753],79:[1,3764],80:[1,3765],81:[1,3766],85:[1,3754],96:$Vv4,97:$Vw4,98:$Vx4,101:$Vy4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:[1,3761],216:[1,3771]}),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:3773,121:$VX2,148:$VY2,190:$VZ2}),o($Vt4,$VB2),o($Vt4,$Vw),o($Vt4,$Vx),o($Vt4,$Vn),o($Vt4,$Vo),o($Vt4,$Vy),o($Vt4,$Vp),o($Vt4,$Vq),o($Vt4,$Vt2,{99:2692,95:3774,101:$VX7,102:$VR,103:$VS,104:$VT}),o($Vx6,$Vu2),o($Vx6,$V33),o($Vt4,$Vd7),o($VS5,$VS3),o($VS5,$VT3),o($VS5,$VU3),{100:[1,3775]},o($VS5,$VT1),{100:[1,3777],106:3776,108:[1,3778],109:[1,3779],110:3780,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,3781]},o($VS5,$VW3),{121:[1,3782]},{19:[1,3785],21:[1,3788],22:3784,87:3783,215:3786,216:[1,3787]},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:3789,121:$VX2,148:$VY2,190:$VZ2}),o($Vt4,$VB2),o($Vt4,$Vw),o($Vt4,$Vx),o($Vt4,$Vn),o($Vt4,$Vo),o($Vt4,$Vy),o($Vt4,$Vp),o($Vt4,$Vq),o($Vt4,$Vt2,{99:2730,95:3790,101:$VY7,102:$VR,103:$VS,104:$VT}),o($Vx6,$Vu2),o($Vx6,$V33),o($Vt4,$Vd7),o($VS5,$VS3),o($VS5,$VT3),o($VS5,$VU3),{100:[1,3791]},o($VS5,$VT1),{100:[1,3793],106:3792,108:[1,3794],109:[1,3795],110:3796,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,3797]},o($VS5,$VW3),{121:[1,3798]},{19:[1,3801],21:[1,3804],22:3800,87:3799,215:3802,216:[1,3803]},o($VS5,$VX5),o($VS5,$VK1),o($VS5,$Vn),o($VS5,$Vo),o($VS5,$Vp),o($VS5,$Vq),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:3805}),o($VG,$VE1),o($VG,$VF1),{19:[1,3809],21:[1,3813],22:3807,33:3806,201:3808,215:3810,216:[1,3812],217:[1,3811]},{119:[1,3814],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:3815}),o($Vh2,$Vy1,{93:3816}),o($Vt1,$Vz1,{99:3300,95:3817,101:$VD8,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,3818]},o($Vh2,$VT1),{70:[1,3819]},o($Vp2,$Vq2,{83:3820,84:3821,193:3822,191:[1,3823]}),o($Vr2,$Vq2,{83:3824,84:3825,193:3826,191:$V99}),o($Vr1,$Vt2,{99:2785,95:3828,101:$VZ7,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:3829,95:3830,91:3831,99:3832,105:3834,107:3835,101:$Va9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:3829,95:3830,91:3831,99:3832,105:3834,107:3835,101:$Va9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:3829,95:3830,91:3831,99:3832,105:3834,107:3835,101:$Va9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:3836,84:3837,193:3838,191:[1,3839]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,3840],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:3841,121:$VX2,148:$VY2,190:$VZ2}),o($Vx1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),o($VN1,$V73),{111:[1,3842]},o($VN1,$Vc3),o($Vt1,$Vt5),{194:[1,3845],195:3843,196:[1,3844]},o($Vr1,$V76),o($Vr1,$V86),o($Vr1,$V96),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V04),o($Vr1,$V14,{203:3846,204:3847,111:[1,3848]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($Va6,$Vb3),{194:[1,3851],195:3849,196:[1,3850]},o($Vt1,$V76),o($Vt1,$V86),o($Vt1,$V96),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V04),o($Vt1,$V14,{203:3852,204:3853,111:[1,3854]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vb6,$V83),o($Vb6,$V93),o($Vb6,$Va3),o($Vb6,$Vb3),{19:[1,3857],21:[1,3860],22:3856,87:3855,215:3858,216:[1,3859]},{194:[1,3863],195:3861,196:[1,3862]},o($VD1,$V76),o($VD1,$V86),o($VD1,$V96),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V04),o($VD1,$V14,{203:3864,204:3865,111:[1,3866]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vc6,$V83),o($Vc6,$V93),o($Vc6,$Va3),o($Vc6,$Vb3),o($Vt1,$Vt5),{194:[1,3869],195:3867,196:[1,3868]},o($Vr1,$V76),o($Vr1,$V86),o($Vr1,$V96),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V04),o($Vr1,$V14,{203:3870,204:3871,111:[1,3872]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($Va6,$Vb3),{194:[1,3875],195:3873,196:[1,3874]},o($Vt1,$V76),o($Vt1,$V86),o($Vt1,$V96),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V04),o($Vt1,$V14,{203:3876,204:3877,111:[1,3878]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vb6,$V83),o($Vb6,$V93),o($Vb6,$Va3),o($Vb6,$Vb3),{19:[1,3881],21:[1,3884],22:3880,87:3879,215:3882,216:[1,3883]},{194:[1,3887],195:3885,196:[1,3886]},o($VD1,$V76),o($VD1,$V86),o($VD1,$V96),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V04),o($VD1,$V14,{203:3888,204:3889,111:[1,3890]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vc6,$V83),o($Vc6,$V93),o($Vc6,$Va3),o($Vc6,$Vb3),o($VG,$VV3),{121:[1,3891]},o($VG,$VJ3),o($Vh2,$VR3),o($Vp2,$VX4),{19:$Vi,21:$Vj,22:3892,215:45,216:$Vk},{19:$Vb9,21:$Vc9,22:3894,100:[1,3905],108:[1,3906],109:[1,3907],110:3904,182:3895,192:3893,197:3898,198:3899,199:3900,202:3903,205:[1,3908],206:[1,3909],207:[1,3914],208:[1,3915],209:[1,3916],210:[1,3917],211:[1,3910],212:[1,3911],213:[1,3912],214:[1,3913],215:3897,216:$Vd9},o($Vr2,$VX4),{19:$Vi,21:$Vj,22:3918,215:45,216:$Vk},{19:$Ve9,21:$Vf9,22:3920,100:[1,3931],108:[1,3932],109:[1,3933],110:3930,182:3921,192:3919,197:3924,198:3925,199:3926,202:3929,205:[1,3934],206:[1,3935],207:[1,3940],208:[1,3941],209:[1,3942],210:[1,3943],211:[1,3936],212:[1,3937],213:[1,3938],214:[1,3939],215:3923,216:$Vg9},o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),o($VA1,$V73),{111:[1,3944]},o($VA1,$Vc3),o($VA2,$VX4),{19:$Vi,21:$Vj,22:3945,215:45,216:$Vk},{19:$Vh9,21:$Vi9,22:3947,100:[1,3958],108:[1,3959],109:[1,3960],110:3957,182:3948,192:3946,197:3951,198:3952,199:3953,202:3956,205:[1,3961],206:[1,3962],207:[1,3967],208:[1,3968],209:[1,3969],210:[1,3970],211:[1,3963],212:[1,3964],213:[1,3965],214:[1,3966],215:3950,216:$Vj9},o($VD1,$Vt5),o($VN1,$VX5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($Vr1,$Vh6),o($Vr1,$VK1),o($Vt1,$Vh6),o($Vt1,$VK1),o($VD1,$Vh6),o($VD1,$VK1),o($Vr1,$Vh6),o($Vr1,$VK1),o($Vt1,$Vh6),o($Vt1,$VK1),o($VD1,$Vh6),o($VD1,$VK1),o($VR4,$Vq2,{84:3548,193:3549,83:3971,191:$VW8}),o($Vz3,$VB2),o($Vz3,$Vw),o($Vz3,$Vx),o($Vz3,$Vn),o($Vz3,$Vo),o($Vz3,$Vy),o($Vz3,$Vp),o($Vz3,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:3972,121:$VX2,148:$VY2,190:$VZ2}),o($VR4,$Vq2,{84:3548,193:3549,83:3973,191:$VW8}),o($VC3,$Vt2,{99:2963,95:3974,101:$V08,102:$VR,103:$VS,104:$VT}),o($VP4,$Vu2),o($VP4,$V33),o($Vz3,$Vy3),o($V36,$VJ3),o($VB3,$VK3),o($V36,$VL3,{31:3975,194:[1,3976]}),{19:$VM3,21:$VN3,22:662,129:3977,200:$VO3,215:665,216:$VP3},o($Vz3,$VQ3),o($VC3,$VK3),o($Vz3,$VL3,{31:3978,194:[1,3979]}),{19:$VM3,21:$VN3,22:662,129:3980,200:$VO3,215:665,216:$VP3},o($VE3,$VR3),o($VF3,$VS3),o($VF3,$VT3),o($VF3,$VU3),{100:[1,3981]},o($VF3,$VT1),{100:[1,3983],106:3982,108:[1,3984],109:[1,3985],110:3986,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,3987]},o($V46,$VV3),o($VD3,$VK3),o($V46,$VL3,{31:3988,194:[1,3989]}),{19:$VM3,21:$VN3,22:662,129:3990,200:$VO3,215:665,216:$VP3},o($VF3,$VW3),{121:[1,3991]},{19:[1,3994],21:[1,3997],22:3993,87:3992,215:3995,216:[1,3996]},o($VQ4,$V41),o($VQ4,$V51),o($VQ4,$V61),o($VB3,$Vr5),o($VB3,$Vs5),{19:$V18,21:$V28,22:3999,87:3998,215:2998,216:$V38},o($VR4,$V41),o($VR4,$V51),o($VR4,$V61),o($VC3,$Vr5),o($VC3,$Vs5),{19:$V48,21:$V58,22:4001,87:4000,215:3024,216:$V68},o($VF3,$VX5),o($VF3,$VK1),o($VF3,$Vn),o($VF3,$Vo),o($VF3,$Vp),o($VF3,$Vq),o($VT4,$V41),o($VT4,$V51),o($VT4,$V61),o($VD3,$Vr5),o($VD3,$Vs5),{19:$V78,21:$V88,22:4003,87:4002,215:3051,216:$V98},o($VQ4,$V41),o($VQ4,$V51),o($VQ4,$V61),o($VB3,$Vr5),o($VB3,$Vs5),{19:$Va8,21:$Vb8,22:4005,87:4004,215:3078,216:$Vc8},o($VR4,$V41),o($VR4,$V51),o($VR4,$V61),o($VC3,$Vr5),o($VC3,$Vs5),{19:$Vd8,21:$Ve8,22:4007,87:4006,215:3104,216:$Vf8},o($VF3,$VX5),o($VF3,$VK1),o($VF3,$Vn),o($VF3,$Vo),o($VF3,$Vp),o($VF3,$Vq),o($VT4,$V41),o($VT4,$V51),o($VT4,$V61),o($VD3,$Vr5),o($VD3,$Vs5),{19:$Vg8,21:$Vh8,22:4009,87:4008,215:3131,216:$Vi8},o($Vj8,$VX4),{19:$Vi,21:$Vj,22:4010,215:45,216:$Vk},{19:$Vk9,21:$Vl9,22:4012,100:[1,4023],108:[1,4024],109:[1,4025],110:4022,182:4013,192:4011,197:4016,198:4017,199:4018,202:4021,205:[1,4026],206:[1,4027],207:[1,4032],208:[1,4033],209:[1,4034],210:[1,4035],211:[1,4028],212:[1,4029],213:[1,4030],214:[1,4031],215:4015,216:$Vm9},o($V77,$VM7,{61:4036,53:[1,4037]}),o($V97,$VN7),o($V97,$VO7,{74:4038,76:4039,78:4040,39:4041,118:4042,79:[1,4043],80:[1,4044],81:[1,4045],119:$VJ,125:$VJ,127:$VJ,190:$VJ,228:$VJ}),o($V97,$VP7),o($V97,$VO5,{77:4046,73:4047,92:4048,94:4049,95:4053,99:4054,96:[1,4050],97:[1,4051],98:[1,4052],101:$Vn9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:4056,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($V97,$VR7),o($VS7,$Vy1,{93:4057}),o($VT7,$Vz1,{99:3643,95:4058,101:$V_8,102:$VR,103:$VS,104:$VT}),o($VU7,$VB1,{86:4059}),o($VU7,$VB1,{86:4060}),o($VU7,$VB1,{86:4061}),o($V97,$VC1,{105:3647,107:3648,91:4062,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VV7,$VU5),o($VV7,$VV5),o($VS7,$VG1),o($VS7,$VH1),o($VS7,$VI1),o($VS7,$VJ1),o($VU7,$VK1),o($VL1,$VM1,{163:4063}),o($VW7,$VO1),{119:[1,4064],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($VV7,$VE1),o($VV7,$VF1),{19:[1,4068],21:[1,4072],22:4066,33:4065,201:4067,215:4069,216:[1,4071],217:[1,4070]},{100:[1,4073]},o($VS7,$VT1),o($VU7,$Vn),o($VU7,$Vo),{100:[1,4075],106:4074,108:[1,4076],109:[1,4077],110:4078,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,4079]},o($VU7,$Vp),o($VU7,$Vq),o($V97,$VN7),o($V97,$VO7,{74:4080,76:4081,78:4082,39:4083,118:4084,79:[1,4085],80:[1,4086],81:[1,4087],119:$VJ,125:$VJ,127:$VJ,190:$VJ,228:$VJ}),o($V97,$VP7),o($V97,$VO5,{77:4088,73:4089,92:4090,94:4091,95:4095,99:4096,96:[1,4092],97:[1,4093],98:[1,4094],101:$Vo9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:4098,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($V97,$VR7),o($VS7,$Vy1,{93:4099}),o($VT7,$Vz1,{99:3676,95:4100,101:$V09,102:$VR,103:$VS,104:$VT}),o($VU7,$VB1,{86:4101}),o($VU7,$VB1,{86:4102}),o($VU7,$VB1,{86:4103}),o($V97,$VC1,{105:3680,107:3681,91:4104,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VV7,$VU5),o($VV7,$VV5),o($VS7,$VG1),o($VS7,$VH1),o($VS7,$VI1),o($VS7,$VJ1),o($VU7,$VK1),o($VL1,$VM1,{163:4105}),o($VW7,$VO1),{119:[1,4106],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($VV7,$VE1),o($VV7,$VF1),{19:[1,4110],21:[1,4114],22:4108,33:4107,201:4109,215:4111,216:[1,4113],217:[1,4112]},{100:[1,4115]},o($VS7,$VT1),o($VU7,$Vn),o($VU7,$Vo),{100:[1,4117],106:4116,108:[1,4118],109:[1,4119],110:4120,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,4121]},o($VU7,$Vp),o($VU7,$Vq),{121:[1,4122]},o($Vq8,$VR3),o($VU7,$V33),o($VU7,$V43),o($VU7,$V53),o($VU7,$V63),o($VU7,$V73),{111:[1,4123]},o($VU7,$Vc3),o($VV7,$Vt5),o($VW7,$VX5),o($VW7,$VK1),o($VW7,$Vn),o($VW7,$Vo),o($VW7,$Vp),o($VW7,$Vq),o($Vp9,$Vq2,{83:4124,84:4125,193:4126,191:$Vq9}),o($Vy8,$Vl8),o($Vr,$Vs,{55:4128,59:4129,41:4130,44:$Vt}),o($Vz8,$Vm8),o($Vr,$Vs,{59:4131,41:4132,44:$Vt}),o($Vz8,$Vn8),o($Vz8,$Vo8),o($Vz8,$VU5),o($Vz8,$VV5),{119:[1,4133],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($Vz8,$VE1),o($Vz8,$VF1),{19:[1,4137],21:[1,4141],22:4135,33:4134,201:4136,215:4138,216:[1,4140],217:[1,4139]},o($Vz8,$Vp8),o($Vz8,$Vw6),o($Vr9,$Vy1,{93:4142}),o($Vz8,$Vz1,{99:3721,95:4143,101:$V39,102:$VR,103:$VS,104:$VT}),o($Vr9,$VG1),o($Vr9,$VH1),o($Vr9,$VI1),o($Vr9,$VJ1),{100:[1,4144]},o($Vr9,$VT1),{70:[1,4145]},o($V59,$Vt2,{99:3219,95:4146,101:$VA8,102:$VR,103:$VS,104:$VT}),o($V49,$Vu2),o($Vz8,$Vv2,{90:4147,95:4148,91:4149,99:4150,105:4152,107:4153,101:$Vs9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vz8,$Vx2,{90:4147,95:4148,91:4149,99:4150,105:4152,107:4153,101:$Vs9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vz8,$Vy2,{90:4147,95:4148,91:4149,99:4150,105:4152,107:4153,101:$Vs9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V89,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,4154],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:4155,121:$VX2,148:$VY2,190:$VZ2}),o($V79,$VB2),o($V79,$Vw),o($V79,$Vx),o($V79,$Vn),o($V79,$Vo),o($V79,$Vy),o($V79,$Vp),o($V79,$Vq),o($V49,$V33),o($V89,$V43),o($V89,$V53),o($V89,$V63),o($V89,$V73),{111:[1,4156]},o($V89,$Vc3),o($Vp9,$Vq2,{84:4125,193:4126,83:4157,191:$Vq9}),o($Vt4,$VM5),o($VI,$VJ,{76:4158,78:4159,39:4160,118:4161,79:[1,4162],80:[1,4163],81:[1,4164]}),o($Vt4,$VN5),o($Vt4,$VO5,{77:4165,73:4166,92:4167,94:4168,95:4172,99:4173,96:[1,4169],97:[1,4170],98:[1,4171],101:$Vt9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:4175,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vt4,$VQ5),o($VS5,$VB1,{86:4176}),o($VS5,$VB1,{86:4177}),o($VS5,$VB1,{86:4178}),o($Vt4,$VC1,{105:3769,107:3770,91:4179,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VT5,$VU5),o($VT5,$VV5),o($VS5,$VK1),o($VL1,$VM1,{163:4180}),o($VW5,$VO1),{119:[1,4181],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($VT5,$VE1),o($VT5,$VF1),{19:[1,4185],21:[1,4189],22:4183,33:4182,201:4184,215:4186,216:[1,4188],217:[1,4187]},o($VS5,$Vn),o($VS5,$Vo),{100:[1,4191],106:4190,108:[1,4192],109:[1,4193],110:4194,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,4195]},o($VS5,$Vp),o($VS5,$Vq),{121:[1,4196]},o($Vx6,$VR3),o($VS5,$V33),o($VS5,$V43),o($VS5,$V53),o($VS5,$V63),o($VS5,$V73),{111:[1,4197]},o($VS5,$Vc3),o($VT5,$Vt5),o($VW5,$VX5),o($VW5,$VK1),o($VW5,$Vn),o($VW5,$Vo),o($VW5,$Vp),o($VW5,$Vq),{121:[1,4198]},o($Vx6,$VR3),o($VS5,$V33),o($VS5,$V43),o($VS5,$V53),o($VS5,$V63),o($VS5,$V73),{111:[1,4199]},o($VS5,$Vc3),o($VT5,$Vt5),o($VW5,$VX5),o($VW5,$VK1),o($VW5,$Vn),o($VW5,$Vo),o($VW5,$Vp),o($VW5,$Vq),o($Vr2,$Vq2,{84:3825,193:3826,83:4200,191:$V99}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:4201,121:$VX2,148:$VY2,190:$VZ2}),o($Vr2,$Vq2,{84:3825,193:3826,83:4202,191:$V99}),o($Vt1,$Vt2,{99:3300,95:4203,101:$VD8,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V33),o($VG,$Vy3),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:4204,194:[1,4205]}),{19:$VM3,21:$VN3,22:662,129:4206,200:$VO3,215:665,216:$VP3},o($VG,$VQ3),o($Vt1,$VK3),o($VG,$VL3,{31:4207,194:[1,4208]}),{19:$VM3,21:$VN3,22:662,129:4209,200:$VO3,215:665,216:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{100:[1,4210]},o($VA1,$VT1),{100:[1,4212],106:4211,108:[1,4213],109:[1,4214],110:4215,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,4216]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:4217,194:[1,4218]}),{19:$VM3,21:$VN3,22:662,129:4219,200:$VO3,215:665,216:$VP3},o($VA1,$VW3),{121:[1,4220]},{19:[1,4223],21:[1,4226],22:4222,87:4221,215:4224,216:[1,4225]},o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$Vr5),o($Vr1,$Vs5),{19:$VE8,21:$VF8,22:4228,87:4227,215:3335,216:$VG8},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$Vr5),o($Vt1,$Vs5),{19:$VH8,21:$VI8,22:4230,87:4229,215:3361,216:$VJ8},o($VA1,$VX5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$Vr5),o($VD1,$Vs5),{19:$VK8,21:$VL8,22:4232,87:4231,215:3388,216:$VM8},o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$Vr5),o($Vr1,$Vs5),{19:$VN8,21:$VO8,22:4234,87:4233,215:3415,216:$VP8},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$Vr5),o($Vt1,$Vs5),{19:$VQ8,21:$VR8,22:4236,87:4235,215:3441,216:$VS8},o($VA1,$VX5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$Vr5),o($VD1,$Vs5),{19:$VT8,21:$VU8,22:4238,87:4237,215:3468,216:$VV8},o($Vt1,$Vt5),{194:[1,4241],195:4239,196:[1,4240]},o($Vr1,$V76),o($Vr1,$V86),o($Vr1,$V96),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V04),o($Vr1,$V14,{203:4242,204:4243,111:[1,4244]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($Va6,$Vb3),{194:[1,4247],195:4245,196:[1,4246]},o($Vt1,$V76),o($Vt1,$V86),o($Vt1,$V96),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V04),o($Vt1,$V14,{203:4248,204:4249,111:[1,4250]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vb6,$V83),o($Vb6,$V93),o($Vb6,$Va3),o($Vb6,$Vb3),{19:[1,4253],21:[1,4256],22:4252,87:4251,215:4254,216:[1,4255]},{194:[1,4259],195:4257,196:[1,4258]},o($VD1,$V76),o($VD1,$V86),o($VD1,$V96),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V04),o($VD1,$V14,{203:4260,204:4261,111:[1,4262]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vc6,$V83),o($Vc6,$V93),o($Vc6,$Va3),o($Vc6,$Vb3),o($Vz3,$VV3),{121:[1,4263]},o($Vz3,$VJ3),o($VP4,$VR3),o($VQ4,$VX4),{19:$Vi,21:$Vj,22:4264,215:45,216:$Vk},{19:$Vu9,21:$Vv9,22:4266,100:[1,4277],108:[1,4278],109:[1,4279],110:4276,182:4267,192:4265,197:4270,198:4271,199:4272,202:4275,205:[1,4280],206:[1,4281],207:[1,4286],208:[1,4287],209:[1,4288],210:[1,4289],211:[1,4282],212:[1,4283],213:[1,4284],214:[1,4285],215:4269,216:$Vw9},o($VR4,$VX4),{19:$Vi,21:$Vj,22:4290,215:45,216:$Vk},{19:$Vx9,21:$Vy9,22:4292,100:[1,4303],108:[1,4304],109:[1,4305],110:4302,182:4293,192:4291,197:4296,198:4297,199:4298,202:4301,205:[1,4306],206:[1,4307],207:[1,4312],208:[1,4313],209:[1,4314],210:[1,4315],211:[1,4308],212:[1,4309],213:[1,4310],214:[1,4311],215:4295,216:$Vz9},o($VF3,$V33),o($VF3,$V43),o($VF3,$V53),o($VF3,$V63),o($VF3,$V73),{111:[1,4316]},o($VF3,$Vc3),o($VT4,$VX4),{19:$Vi,21:$Vj,22:4317,215:45,216:$Vk},{19:$VA9,21:$VB9,22:4319,100:[1,4330],108:[1,4331],109:[1,4332],110:4329,182:4320,192:4318,197:4323,198:4324,199:4325,202:4328,205:[1,4333],206:[1,4334],207:[1,4339],208:[1,4340],209:[1,4341],210:[1,4342],211:[1,4335],212:[1,4336],213:[1,4337],214:[1,4338],215:4322,216:$VC9},o($VD3,$Vt5),o($VG3,$VX5),o($VG3,$VK1),o($VG3,$Vn),o($VG3,$Vo),o($VG3,$Vp),o($VG3,$Vq),o($VB3,$Vh6),o($VB3,$VK1),o($VC3,$Vh6),o($VC3,$VK1),o($VD3,$Vh6),o($VD3,$VK1),o($VB3,$Vh6),o($VB3,$VK1),o($VC3,$Vh6),o($VC3,$VK1),o($VD3,$Vh6),o($VD3,$VK1),{194:[1,4345],195:4343,196:[1,4344]},o($V$6,$V76),o($V$6,$V86),o($V$6,$V96),o($V$6,$Vn),o($V$6,$Vo),o($V$6,$VZ3),o($V$6,$V_3),o($V$6,$V$3),o($V$6,$Vp),o($V$6,$Vq),o($V$6,$V04),o($V$6,$V14,{203:4346,204:4347,111:[1,4348]}),o($V$6,$V24),o($V$6,$V34),o($V$6,$V44),o($V$6,$V54),o($V$6,$V64),o($V$6,$V74),o($V$6,$V84),o($V$6,$V94),o($V$6,$Va4),o($VD9,$V83),o($VD9,$V93),o($VD9,$Va3),o($VD9,$Vb3),o($V97,$Vm8),o($Vr,$Vs,{59:4349,41:4350,44:$Vt}),o($V97,$Vn8),o($V97,$Vo8),o($V97,$VU5),o($V97,$VV5),{119:[1,4351],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($V97,$VE1),o($V97,$VF1),{19:[1,4355],21:[1,4359],22:4353,33:4352,201:4354,215:4356,216:[1,4358],217:[1,4357]},o($V97,$Vp8),o($V97,$Vw6),o($Vq8,$Vy1,{93:4360}),o($V97,$Vz1,{99:4054,95:4361,101:$Vn9,102:$VR,103:$VS,104:$VT}),o($Vq8,$VG1),o($Vq8,$VH1),o($Vq8,$VI1),o($Vq8,$VJ1),{100:[1,4362]},o($Vq8,$VT1),{70:[1,4363]},o($VT7,$Vt2,{99:3643,95:4364,101:$V_8,102:$VR,103:$VS,104:$VT}),o($VS7,$Vu2),o($V97,$Vv2,{90:4365,95:4366,91:4367,99:4368,105:4370,107:4371,101:$VE9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V97,$Vx2,{90:4365,95:4366,91:4367,99:4368,105:4370,107:4371,101:$VE9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V97,$Vy2,{90:4365,95:4366,91:4367,99:4368,105:4370,107:4371,101:$VE9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VW7,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,4372],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:4373,121:$VX2,148:$VY2,190:$VZ2}),o($VV7,$VB2),o($VV7,$Vw),o($VV7,$Vx),o($VV7,$Vn),o($VV7,$Vo),o($VV7,$Vy),o($VV7,$Vp),o($VV7,$Vq),o($VS7,$V33),o($VW7,$V43),o($VW7,$V53),o($VW7,$V63),o($VW7,$V73),{111:[1,4374]},o($VW7,$Vc3),o($V97,$Vn8),o($V97,$Vo8),o($V97,$VU5),o($V97,$VV5),{119:[1,4375],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($V97,$VE1),o($V97,$VF1),{19:[1,4379],21:[1,4383],22:4377,33:4376,201:4378,215:4380,216:[1,4382],217:[1,4381]},o($V97,$Vp8),o($V97,$Vw6),o($Vq8,$Vy1,{93:4384}),o($V97,$Vz1,{99:4096,95:4385,101:$Vo9,102:$VR,103:$VS,104:$VT}),o($Vq8,$VG1),o($Vq8,$VH1),o($Vq8,$VI1),o($Vq8,$VJ1),{100:[1,4386]},o($Vq8,$VT1),{70:[1,4387]},o($VT7,$Vt2,{99:3676,95:4388,101:$V09,102:$VR,103:$VS,104:$VT}),o($VS7,$Vu2),o($V97,$Vv2,{90:4389,95:4390,91:4391,99:4392,105:4394,107:4395,101:$VF9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V97,$Vx2,{90:4389,95:4390,91:4391,99:4392,105:4394,107:4395,101:$VF9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V97,$Vy2,{90:4389,95:4390,91:4391,99:4392,105:4394,107:4395,101:$VF9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VW7,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,4396],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:4397,121:$VX2,148:$VY2,190:$VZ2}),o($VV7,$VB2),o($VV7,$Vw),o($VV7,$Vx),o($VV7,$Vn),o($VV7,$Vo),o($VV7,$Vy),o($VV7,$Vp),o($VV7,$Vq),o($VS7,$V33),o($VW7,$V43),o($VW7,$V53),o($VW7,$V63),o($VW7,$V73),{111:[1,4398]},o($VW7,$Vc3),o($V97,$Vt5),{19:[1,4401],21:[1,4404],22:4400,87:4399,215:4402,216:[1,4403]},o($Vs6,$VY8),o($Vs8,$VK3),o($Vs6,$VL3,{31:4405,194:[1,4406]}),{19:$VM3,21:$VN3,22:662,129:4407,200:$VO3,215:665,216:$VP3},o($Vy8,$VZ8),o($Vz8,$Va7,{60:4408}),o($VI,$VJ,{63:4409,73:4410,75:4411,76:4412,92:4415,94:4416,87:4418,88:4419,89:4420,78:4421,39:4422,95:4426,22:4427,91:4429,118:4430,99:4434,215:4437,105:4438,107:4439,19:[1,4436],21:[1,4441],69:[1,4413],71:[1,4414],79:[1,4431],80:[1,4432],81:[1,4433],85:[1,4417],96:[1,4423],97:[1,4424],98:[1,4425],101:$VG9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:[1,4428],216:[1,4440]}),o($Vz8,$V$8),o($VI,$VJ,{63:4442,73:4443,75:4444,76:4445,92:4448,94:4449,87:4451,88:4452,89:4453,78:4454,39:4455,95:4459,22:4460,91:4462,118:4463,99:4467,215:4470,105:4471,107:4472,19:[1,4469],21:[1,4474],69:[1,4446],71:[1,4447],79:[1,4464],80:[1,4465],81:[1,4466],85:[1,4450],96:[1,4456],97:[1,4457],98:[1,4458],101:$VH9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:[1,4461],216:[1,4473]}),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:4475,121:$VX2,148:$VY2,190:$VZ2}),o($Vz8,$VB2),o($Vz8,$Vw),o($Vz8,$Vx),o($Vz8,$Vn),o($Vz8,$Vo),o($Vz8,$Vy),o($Vz8,$Vp),o($Vz8,$Vq),o($Vz8,$Vt2,{99:3721,95:4476,101:$V39,102:$VR,103:$VS,104:$VT}),o($Vr9,$Vu2),o($Vr9,$V33),o($Vz8,$V19),o($V49,$VR3),o($V69,$VS3),o($V69,$VT3),o($V69,$VU3),{100:[1,4477]},o($V69,$VT1),{100:[1,4479],106:4478,108:[1,4480],109:[1,4481],110:4482,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,4483]},o($V69,$VW3),{121:[1,4484]},{19:[1,4487],21:[1,4490],22:4486,87:4485,215:4488,216:[1,4489]},o($Vs6,$V29),o($Vt4,$Vu6),o($Vt4,$VU5),o($Vt4,$VV5),{119:[1,4491],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($Vt4,$VE1),o($Vt4,$VF1),{19:[1,4495],21:[1,4499],22:4493,33:4492,201:4494,215:4496,216:[1,4498],217:[1,4497]},o($Vt4,$Vv6),o($Vt4,$Vw6),o($Vx6,$Vy1,{93:4500}),o($Vt4,$Vz1,{99:4173,95:4501,101:$Vt9,102:$VR,103:$VS,104:$VT}),o($Vx6,$VG1),o($Vx6,$VH1),o($Vx6,$VI1),o($Vx6,$VJ1),{100:[1,4502]},o($Vx6,$VT1),{70:[1,4503]},o($Vt4,$Vv2,{90:4504,95:4505,91:4506,99:4507,105:4509,107:4510,101:$VI9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt4,$Vx2,{90:4504,95:4505,91:4506,99:4507,105:4509,107:4510,101:$VI9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt4,$Vy2,{90:4504,95:4505,91:4506,99:4507,105:4509,107:4510,101:$VI9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VW5,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,4511],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:4512,121:$VX2,148:$VY2,190:$VZ2}),o($VT5,$VB2),o($VT5,$Vw),o($VT5,$Vx),o($VT5,$Vn),o($VT5,$Vo),o($VT5,$Vy),o($VT5,$Vp),o($VT5,$Vq),o($VW5,$V43),o($VW5,$V53),o($VW5,$V63),o($VW5,$V73),{111:[1,4513]},o($VW5,$Vc3),o($Vt4,$Vt5),{19:[1,4516],21:[1,4519],22:4515,87:4514,215:4517,216:[1,4518]},o($Vt4,$Vt5),{19:[1,4522],21:[1,4525],22:4521,87:4520,215:4523,216:[1,4524]},o($VG,$VV3),{121:[1,4526]},o($VG,$VJ3),o($Vh2,$VR3),o($Vp2,$VX4),{19:$Vi,21:$Vj,22:4527,215:45,216:$Vk},{19:$VJ9,21:$VK9,22:4529,100:[1,4540],108:[1,4541],109:[1,4542],110:4539,182:4530,192:4528,197:4533,198:4534,199:4535,202:4538,205:[1,4543],206:[1,4544],207:[1,4549],208:[1,4550],209:[1,4551],210:[1,4552],211:[1,4545],212:[1,4546],213:[1,4547],214:[1,4548],215:4532,216:$VL9},o($Vr2,$VX4),{19:$Vi,21:$Vj,22:4553,215:45,216:$Vk},{19:$VM9,21:$VN9,22:4555,100:[1,4566],108:[1,4567],109:[1,4568],110:4565,182:4556,192:4554,197:4559,198:4560,199:4561,202:4564,205:[1,4569],206:[1,4570],207:[1,4575],208:[1,4576],209:[1,4577],210:[1,4578],211:[1,4571],212:[1,4572],213:[1,4573],214:[1,4574],215:4558,216:$VO9},o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),o($VA1,$V73),{111:[1,4579]},o($VA1,$Vc3),o($VA2,$VX4),{19:$Vi,21:$Vj,22:4580,215:45,216:$Vk},{19:$VP9,21:$VQ9,22:4582,100:[1,4593],108:[1,4594],109:[1,4595],110:4592,182:4583,192:4581,197:4586,198:4587,199:4588,202:4591,205:[1,4596],206:[1,4597],207:[1,4602],208:[1,4603],209:[1,4604],210:[1,4605],211:[1,4598],212:[1,4599],213:[1,4600],214:[1,4601],215:4585,216:$VR9},o($VD1,$Vt5),o($VN1,$VX5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($Vr1,$Vh6),o($Vr1,$VK1),o($Vt1,$Vh6),o($Vt1,$VK1),o($VD1,$Vh6),o($VD1,$VK1),o($Vr1,$Vh6),o($Vr1,$VK1),o($Vt1,$Vh6),o($Vt1,$VK1),o($VD1,$Vh6),o($VD1,$VK1),o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$Vr5),o($Vr1,$Vs5),{19:$Vb9,21:$Vc9,22:4607,87:4606,215:3897,216:$Vd9},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$Vr5),o($Vt1,$Vs5),{19:$Ve9,21:$Vf9,22:4609,87:4608,215:3923,216:$Vg9},o($VA1,$VX5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$Vr5),o($VD1,$Vs5),{19:$Vh9,21:$Vi9,22:4611,87:4610,215:3950,216:$Vj9},o($VC3,$Vt5),{194:[1,4614],195:4612,196:[1,4613]},o($VB3,$V76),o($VB3,$V86),o($VB3,$V96),o($VB3,$Vn),o($VB3,$Vo),o($VB3,$VZ3),o($VB3,$V_3),o($VB3,$V$3),o($VB3,$Vp),o($VB3,$Vq),o($VB3,$V04),o($VB3,$V14,{203:4615,204:4616,111:[1,4617]}),o($VB3,$V24),o($VB3,$V34),o($VB3,$V44),o($VB3,$V54),o($VB3,$V64),o($VB3,$V74),o($VB3,$V84),o($VB3,$V94),o($VB3,$Va4),o($VC7,$V83),o($VC7,$V93),o($VC7,$Va3),o($VC7,$Vb3),{194:[1,4620],195:4618,196:[1,4619]},o($VC3,$V76),o($VC3,$V86),o($VC3,$V96),o($VC3,$Vn),o($VC3,$Vo),o($VC3,$VZ3),o($VC3,$V_3),o($VC3,$V$3),o($VC3,$Vp),o($VC3,$Vq),o($VC3,$V04),o($VC3,$V14,{203:4621,204:4622,111:[1,4623]}),o($VC3,$V24),o($VC3,$V34),o($VC3,$V44),o($VC3,$V54),o($VC3,$V64),o($VC3,$V74),o($VC3,$V84),o($VC3,$V94),o($VC3,$Va4),o($VD7,$V83),o($VD7,$V93),o($VD7,$Va3),o($VD7,$Vb3),{19:[1,4626],21:[1,4629],22:4625,87:4624,215:4627,216:[1,4628]},{194:[1,4632],195:4630,196:[1,4631]},o($VD3,$V76),o($VD3,$V86),o($VD3,$V96),o($VD3,$Vn),o($VD3,$Vo),o($VD3,$VZ3),o($VD3,$V_3),o($VD3,$V$3),o($VD3,$Vp),o($VD3,$Vq),o($VD3,$V04),o($VD3,$V14,{203:4633,204:4634,111:[1,4635]}),o($VD3,$V24),o($VD3,$V34),o($VD3,$V44),o($VD3,$V54),o($VD3,$V64),o($VD3,$V74),o($VD3,$V84),o($VD3,$V94),o($VD3,$Va4),o($VE7,$V83),o($VE7,$V93),o($VE7,$Va3),o($VE7,$Vb3),o($Vj8,$V41),o($Vj8,$V51),o($Vj8,$V61),o($V$6,$Vr5),o($V$6,$Vs5),{19:$Vk9,21:$Vl9,22:4637,87:4636,215:4015,216:$Vm9},o($V97,$V$8),o($VI,$VJ,{63:4638,73:4639,75:4640,76:4641,92:4644,94:4645,87:4647,88:4648,89:4649,78:4650,39:4651,95:4655,22:4656,91:4658,118:4659,99:4663,215:4666,105:4667,107:4668,19:[1,4665],21:[1,4670],69:[1,4642],71:[1,4643],79:[1,4660],80:[1,4661],81:[1,4662],85:[1,4646],96:[1,4652],97:[1,4653],98:[1,4654],101:$VS9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:[1,4657],216:[1,4669]}),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:4671,121:$VX2,148:$VY2,190:$VZ2}),o($V97,$VB2),o($V97,$Vw),o($V97,$Vx),o($V97,$Vn),o($V97,$Vo),o($V97,$Vy),o($V97,$Vp),o($V97,$Vq),o($V97,$Vt2,{99:4054,95:4672,101:$Vn9,102:$VR,103:$VS,104:$VT}),o($Vq8,$Vu2),o($Vq8,$V33),o($V97,$V19),o($VS7,$VR3),o($VU7,$VS3),o($VU7,$VT3),o($VU7,$VU3),{100:[1,4673]},o($VU7,$VT1),{100:[1,4675],106:4674,108:[1,4676],109:[1,4677],110:4678,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,4679]},o($VU7,$VW3),{121:[1,4680]},{19:[1,4683],21:[1,4686],22:4682,87:4681,215:4684,216:[1,4685]},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:4687,121:$VX2,148:$VY2,190:$VZ2}),o($V97,$VB2),o($V97,$Vw),o($V97,$Vx),o($V97,$Vn),o($V97,$Vo),o($V97,$Vy),o($V97,$Vp),o($V97,$Vq),o($V97,$Vt2,{99:4096,95:4688,101:$Vo9,102:$VR,103:$VS,104:$VT}),o($Vq8,$Vu2),o($Vq8,$V33),o($V97,$V19),o($VS7,$VR3),o($VU7,$VS3),o($VU7,$VT3),o($VU7,$VU3),{100:[1,4689]},o($VU7,$VT1),{100:[1,4691],106:4690,108:[1,4692],109:[1,4693],110:4694,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,4695]},o($VU7,$VW3),{121:[1,4696]},{19:[1,4699],21:[1,4702],22:4698,87:4697,215:4700,216:[1,4701]},o($VU7,$VX5),o($VU7,$VK1),o($VU7,$Vn),o($VU7,$Vo),o($VU7,$Vp),o($VU7,$Vq),o($Vp9,$VX4),{19:$Vi,21:$Vj,22:4703,215:45,216:$Vk},{19:$VT9,21:$VU9,22:4705,100:[1,4716],108:[1,4717],109:[1,4718],110:4715,182:4706,192:4704,197:4709,198:4710,199:4711,202:4714,205:[1,4719],206:[1,4720],207:[1,4725],208:[1,4726],209:[1,4727],210:[1,4728],211:[1,4721],212:[1,4722],213:[1,4723],214:[1,4724],215:4708,216:$VV9},o($Vy8,$VM7,{61:4729,53:[1,4730]}),o($Vz8,$VN7),o($Vz8,$VO7,{74:4731,76:4732,78:4733,39:4734,118:4735,79:[1,4736],80:[1,4737],81:[1,4738],119:$VJ,125:$VJ,127:$VJ,190:$VJ,228:$VJ}),o($Vz8,$VP7),o($Vz8,$VO5,{77:4739,73:4740,92:4741,94:4742,95:4746,99:4747,96:[1,4743],97:[1,4744],98:[1,4745],101:$VW9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:4749,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vz8,$VR7),o($V49,$Vy1,{93:4750}),o($V59,$Vz1,{99:4434,95:4751,101:$VG9,102:$VR,103:$VS,104:$VT}),o($V69,$VB1,{86:4752}),o($V69,$VB1,{86:4753}),o($V69,$VB1,{86:4754}),o($Vz8,$VC1,{105:4438,107:4439,91:4755,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V79,$VU5),o($V79,$VV5),o($V49,$VG1),o($V49,$VH1),o($V49,$VI1),o($V49,$VJ1),o($V69,$VK1),o($VL1,$VM1,{163:4756}),o($V89,$VO1),{119:[1,4757],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($V79,$VE1),o($V79,$VF1),{19:[1,4761],21:[1,4765],22:4759,33:4758,201:4760,215:4762,216:[1,4764],217:[1,4763]},{100:[1,4766]},o($V49,$VT1),o($V69,$Vn),o($V69,$Vo),{100:[1,4768],106:4767,108:[1,4769],109:[1,4770],110:4771,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,4772]},o($V69,$Vp),o($V69,$Vq),o($Vz8,$VN7),o($Vz8,$VO7,{74:4773,76:4774,78:4775,39:4776,118:4777,79:[1,4778],80:[1,4779],81:[1,4780],119:$VJ,125:$VJ,127:$VJ,190:$VJ,228:$VJ}),o($Vz8,$VP7),o($Vz8,$VO5,{77:4781,73:4782,92:4783,94:4784,95:4788,99:4789,96:[1,4785],97:[1,4786],98:[1,4787],101:$VX9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:4791,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vz8,$VR7),o($V49,$Vy1,{93:4792}),o($V59,$Vz1,{99:4467,95:4793,101:$VH9,102:$VR,103:$VS,104:$VT}),o($V69,$VB1,{86:4794}),o($V69,$VB1,{86:4795}),o($V69,$VB1,{86:4796}),o($Vz8,$VC1,{105:4471,107:4472,91:4797,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V79,$VU5),o($V79,$VV5),o($V49,$VG1),o($V49,$VH1),o($V49,$VI1),o($V49,$VJ1),o($V69,$VK1),o($VL1,$VM1,{163:4798}),o($V89,$VO1),{119:[1,4799],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($V79,$VE1),o($V79,$VF1),{19:[1,4803],21:[1,4807],22:4801,33:4800,201:4802,215:4804,216:[1,4806],217:[1,4805]},{100:[1,4808]},o($V49,$VT1),o($V69,$Vn),o($V69,$Vo),{100:[1,4810],106:4809,108:[1,4811],109:[1,4812],110:4813,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,4814]},o($V69,$Vp),o($V69,$Vq),{121:[1,4815]},o($Vr9,$VR3),o($V69,$V33),o($V69,$V43),o($V69,$V53),o($V69,$V63),o($V69,$V73),{111:[1,4816]},o($V69,$Vc3),o($V79,$Vt5),o($V89,$VX5),o($V89,$VK1),o($V89,$Vn),o($V89,$Vo),o($V89,$Vp),o($V89,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:4817,121:$VX2,148:$VY2,190:$VZ2}),o($Vt4,$VB2),o($Vt4,$Vw),o($Vt4,$Vx),o($Vt4,$Vn),o($Vt4,$Vo),o($Vt4,$Vy),o($Vt4,$Vp),o($Vt4,$Vq),o($Vt4,$Vt2,{99:4173,95:4818,101:$Vt9,102:$VR,103:$VS,104:$VT}),o($Vx6,$Vu2),o($Vx6,$V33),o($Vt4,$Vd7),o($VS5,$VS3),o($VS5,$VT3),o($VS5,$VU3),{100:[1,4819]},o($VS5,$VT1),{100:[1,4821],106:4820,108:[1,4822],109:[1,4823],110:4824,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,4825]},o($VS5,$VW3),{121:[1,4826]},{19:[1,4829],21:[1,4832],22:4828,87:4827,215:4830,216:[1,4831]},o($VS5,$VX5),o($VS5,$VK1),o($VS5,$Vn),o($VS5,$Vo),o($VS5,$Vp),o($VS5,$Vq),o($VS5,$VX5),o($VS5,$VK1),o($VS5,$Vn),o($VS5,$Vo),o($VS5,$Vp),o($VS5,$Vq),o($Vt1,$Vt5),{194:[1,4835],195:4833,196:[1,4834]},o($Vr1,$V76),o($Vr1,$V86),o($Vr1,$V96),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V04),o($Vr1,$V14,{203:4836,204:4837,111:[1,4838]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($Va6,$Vb3),{194:[1,4841],195:4839,196:[1,4840]},o($Vt1,$V76),o($Vt1,$V86),o($Vt1,$V96),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V04),o($Vt1,$V14,{203:4842,204:4843,111:[1,4844]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vb6,$V83),o($Vb6,$V93),o($Vb6,$Va3),o($Vb6,$Vb3),{19:[1,4847],21:[1,4850],22:4846,87:4845,215:4848,216:[1,4849]},{194:[1,4853],195:4851,196:[1,4852]},o($VD1,$V76),o($VD1,$V86),o($VD1,$V96),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V04),o($VD1,$V14,{203:4854,204:4855,111:[1,4856]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vc6,$V83),o($Vc6,$V93),o($Vc6,$Va3),o($Vc6,$Vb3),o($Vr1,$Vh6),o($Vr1,$VK1),o($Vt1,$Vh6),o($Vt1,$VK1),o($VD1,$Vh6),o($VD1,$VK1),o($VQ4,$V41),o($VQ4,$V51),o($VQ4,$V61),o($VB3,$Vr5),o($VB3,$Vs5),{19:$Vu9,21:$Vv9,22:4858,87:4857,215:4269,216:$Vw9},o($VR4,$V41),o($VR4,$V51),o($VR4,$V61),o($VC3,$Vr5),o($VC3,$Vs5),{19:$Vx9,21:$Vy9,22:4860,87:4859,215:4295,216:$Vz9},o($VF3,$VX5),o($VF3,$VK1),o($VF3,$Vn),o($VF3,$Vo),o($VF3,$Vp),o($VF3,$Vq),o($VT4,$V41),o($VT4,$V51),o($VT4,$V61),o($VD3,$Vr5),o($VD3,$Vs5),{19:$VA9,21:$VB9,22:4862,87:4861,215:4322,216:$VC9},o($V$6,$Vh6),o($V$6,$VK1),o($V97,$VN7),o($V97,$VO7,{74:4863,76:4864,78:4865,39:4866,118:4867,79:[1,4868],80:[1,4869],81:[1,4870],119:$VJ,125:$VJ,127:$VJ,190:$VJ,228:$VJ}),o($V97,$VP7),o($V97,$VO5,{77:4871,73:4872,92:4873,94:4874,95:4878,99:4879,96:[1,4875],97:[1,4876],98:[1,4877],101:$VY9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:4881,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($V97,$VR7),o($VS7,$Vy1,{93:4882}),o($VT7,$Vz1,{99:4663,95:4883,101:$VS9,102:$VR,103:$VS,104:$VT}),o($VU7,$VB1,{86:4884}),o($VU7,$VB1,{86:4885}),o($VU7,$VB1,{86:4886}),o($V97,$VC1,{105:4667,107:4668,91:4887,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VV7,$VU5),o($VV7,$VV5),o($VS7,$VG1),o($VS7,$VH1),o($VS7,$VI1),o($VS7,$VJ1),o($VU7,$VK1),o($VL1,$VM1,{163:4888}),o($VW7,$VO1),{119:[1,4889],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($VV7,$VE1),o($VV7,$VF1),{19:[1,4893],21:[1,4897],22:4891,33:4890,201:4892,215:4894,216:[1,4896],217:[1,4895]},{100:[1,4898]},o($VS7,$VT1),o($VU7,$Vn),o($VU7,$Vo),{100:[1,4900],106:4899,108:[1,4901],109:[1,4902],110:4903,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,4904]},o($VU7,$Vp),o($VU7,$Vq),{121:[1,4905]},o($Vq8,$VR3),o($VU7,$V33),o($VU7,$V43),o($VU7,$V53),o($VU7,$V63),o($VU7,$V73),{111:[1,4906]},o($VU7,$Vc3),o($VV7,$Vt5),o($VW7,$VX5),o($VW7,$VK1),o($VW7,$Vn),o($VW7,$Vo),o($VW7,$Vp),o($VW7,$Vq),{121:[1,4907]},o($Vq8,$VR3),o($VU7,$V33),o($VU7,$V43),o($VU7,$V53),o($VU7,$V63),o($VU7,$V73),{111:[1,4908]},o($VU7,$Vc3),o($VV7,$Vt5),o($VW7,$VX5),o($VW7,$VK1),o($VW7,$Vn),o($VW7,$Vo),o($VW7,$Vp),o($VW7,$Vq),{194:[1,4911],195:4909,196:[1,4910]},o($Vs8,$V76),o($Vs8,$V86),o($Vs8,$V96),o($Vs8,$Vn),o($Vs8,$Vo),o($Vs8,$VZ3),o($Vs8,$V_3),o($Vs8,$V$3),o($Vs8,$Vp),o($Vs8,$Vq),o($Vs8,$V04),o($Vs8,$V14,{203:4912,204:4913,111:[1,4914]}),o($Vs8,$V24),o($Vs8,$V34),o($Vs8,$V44),o($Vs8,$V54),o($Vs8,$V64),o($Vs8,$V74),o($Vs8,$V84),o($Vs8,$V94),o($Vs8,$Va4),o($VZ9,$V83),o($VZ9,$V93),o($VZ9,$Va3),o($VZ9,$Vb3),o($Vz8,$Vm8),o($Vr,$Vs,{59:4915,41:4916,44:$Vt}),o($Vz8,$Vn8),o($Vz8,$Vo8),o($Vz8,$VU5),o($Vz8,$VV5),{119:[1,4917],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($Vz8,$VE1),o($Vz8,$VF1),{19:[1,4921],21:[1,4925],22:4919,33:4918,201:4920,215:4922,216:[1,4924],217:[1,4923]},o($Vz8,$Vp8),o($Vz8,$Vw6),o($Vr9,$Vy1,{93:4926}),o($Vz8,$Vz1,{99:4747,95:4927,101:$VW9,102:$VR,103:$VS,104:$VT}),o($Vr9,$VG1),o($Vr9,$VH1),o($Vr9,$VI1),o($Vr9,$VJ1),{100:[1,4928]},o($Vr9,$VT1),{70:[1,4929]},o($V59,$Vt2,{99:4434,95:4930,101:$VG9,102:$VR,103:$VS,104:$VT}),o($V49,$Vu2),o($Vz8,$Vv2,{90:4931,95:4932,91:4933,99:4934,105:4936,107:4937,101:$V_9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vz8,$Vx2,{90:4931,95:4932,91:4933,99:4934,105:4936,107:4937,101:$V_9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vz8,$Vy2,{90:4931,95:4932,91:4933,99:4934,105:4936,107:4937,101:$V_9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V89,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,4938],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:4939,121:$VX2,148:$VY2,190:$VZ2}),o($V79,$VB2),o($V79,$Vw),o($V79,$Vx),o($V79,$Vn),o($V79,$Vo),o($V79,$Vy),o($V79,$Vp),o($V79,$Vq),o($V49,$V33),o($V89,$V43),o($V89,$V53),o($V89,$V63),o($V89,$V73),{111:[1,4940]},o($V89,$Vc3),o($Vz8,$Vn8),o($Vz8,$Vo8),o($Vz8,$VU5),o($Vz8,$VV5),{119:[1,4941],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($Vz8,$VE1),o($Vz8,$VF1),{19:[1,4945],21:[1,4949],22:4943,33:4942,201:4944,215:4946,216:[1,4948],217:[1,4947]},o($Vz8,$Vp8),o($Vz8,$Vw6),o($Vr9,$Vy1,{93:4950}),o($Vz8,$Vz1,{99:4789,95:4951,101:$VX9,102:$VR,103:$VS,104:$VT}),o($Vr9,$VG1),o($Vr9,$VH1),o($Vr9,$VI1),o($Vr9,$VJ1),{100:[1,4952]},o($Vr9,$VT1),{70:[1,4953]},o($V59,$Vt2,{99:4467,95:4954,101:$VH9,102:$VR,103:$VS,104:$VT}),o($V49,$Vu2),o($Vz8,$Vv2,{90:4955,95:4956,91:4957,99:4958,105:4960,107:4961,101:$V$9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vz8,$Vx2,{90:4955,95:4956,91:4957,99:4958,105:4960,107:4961,101:$V$9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vz8,$Vy2,{90:4955,95:4956,91:4957,99:4958,105:4960,107:4961,101:$V$9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V89,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,4962],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:4963,121:$VX2,148:$VY2,190:$VZ2}),o($V79,$VB2),o($V79,$Vw),o($V79,$Vx),o($V79,$Vn),o($V79,$Vo),o($V79,$Vy),o($V79,$Vp),o($V79,$Vq),o($V49,$V33),o($V89,$V43),o($V89,$V53),o($V89,$V63),o($V89,$V73),{111:[1,4964]},o($V89,$Vc3),o($Vz8,$Vt5),{19:[1,4967],21:[1,4970],22:4966,87:4965,215:4968,216:[1,4969]},{121:[1,4971]},o($Vx6,$VR3),o($VS5,$V33),o($VS5,$V43),o($VS5,$V53),o($VS5,$V63),o($VS5,$V73),{111:[1,4972]},o($VS5,$Vc3),o($VT5,$Vt5),o($VW5,$VX5),o($VW5,$VK1),o($VW5,$Vn),o($VW5,$Vo),o($VW5,$Vp),o($VW5,$Vq),o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$Vr5),o($Vr1,$Vs5),{19:$VJ9,21:$VK9,22:4974,87:4973,215:4532,216:$VL9},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$Vr5),o($Vt1,$Vs5),{19:$VM9,21:$VN9,22:4976,87:4975,215:4558,216:$VO9},o($VA1,$VX5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$Vr5),o($VD1,$Vs5),{19:$VP9,21:$VQ9,22:4978,87:4977,215:4585,216:$VR9},o($VB3,$Vh6),o($VB3,$VK1),o($VC3,$Vh6),o($VC3,$VK1),o($VD3,$Vh6),o($VD3,$VK1),o($V97,$Vn8),o($V97,$Vo8),o($V97,$VU5),o($V97,$VV5),{119:[1,4979],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($V97,$VE1),o($V97,$VF1),{19:[1,4983],21:[1,4987],22:4981,33:4980,201:4982,215:4984,216:[1,4986],217:[1,4985]},o($V97,$Vp8),o($V97,$Vw6),o($Vq8,$Vy1,{93:4988}),o($V97,$Vz1,{99:4879,95:4989,101:$VY9,102:$VR,103:$VS,104:$VT}),o($Vq8,$VG1),o($Vq8,$VH1),o($Vq8,$VI1),o($Vq8,$VJ1),{100:[1,4990]},o($Vq8,$VT1),{70:[1,4991]},o($VT7,$Vt2,{99:4663,95:4992,101:$VS9,102:$VR,103:$VS,104:$VT}),o($VS7,$Vu2),o($V97,$Vv2,{90:4993,95:4994,91:4995,99:4996,105:4998,107:4999,101:$V0a,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V97,$Vx2,{90:4993,95:4994,91:4995,99:4996,105:4998,107:4999,101:$V0a,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V97,$Vy2,{90:4993,95:4994,91:4995,99:4996,105:4998,107:4999,101:$V0a,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VW7,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,5000],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:5001,121:$VX2,148:$VY2,190:$VZ2}),o($VV7,$VB2),o($VV7,$Vw),o($VV7,$Vx),o($VV7,$Vn),o($VV7,$Vo),o($VV7,$Vy),o($VV7,$Vp),o($VV7,$Vq),o($VS7,$V33),o($VW7,$V43),o($VW7,$V53),o($VW7,$V63),o($VW7,$V73),{111:[1,5002]},o($VW7,$Vc3),o($V97,$Vt5),{19:[1,5005],21:[1,5008],22:5004,87:5003,215:5006,216:[1,5007]},o($V97,$Vt5),{19:[1,5011],21:[1,5014],22:5010,87:5009,215:5012,216:[1,5013]},o($Vp9,$V41),o($Vp9,$V51),o($Vp9,$V61),o($Vs8,$Vr5),o($Vs8,$Vs5),{19:$VT9,21:$VU9,22:5016,87:5015,215:4708,216:$VV9},o($Vz8,$V$8),o($VI,$VJ,{63:5017,73:5018,75:5019,76:5020,92:5023,94:5024,87:5026,88:5027,89:5028,78:5029,39:5030,95:5034,22:5035,91:5037,118:5038,99:5042,215:5045,105:5046,107:5047,19:[1,5044],21:[1,5049],69:[1,5021],71:[1,5022],79:[1,5039],80:[1,5040],81:[1,5041],85:[1,5025],96:[1,5031],97:[1,5032],98:[1,5033],101:$V1a,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,162:[1,5036],216:[1,5048]}),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:5050,121:$VX2,148:$VY2,190:$VZ2}),o($Vz8,$VB2),o($Vz8,$Vw),o($Vz8,$Vx),o($Vz8,$Vn),o($Vz8,$Vo),o($Vz8,$Vy),o($Vz8,$Vp),o($Vz8,$Vq),o($Vz8,$Vt2,{99:4747,95:5051,101:$VW9,102:$VR,103:$VS,104:$VT}),o($Vr9,$Vu2),o($Vr9,$V33),o($Vz8,$V19),o($V49,$VR3),o($V69,$VS3),o($V69,$VT3),o($V69,$VU3),{100:[1,5052]},o($V69,$VT1),{100:[1,5054],106:5053,108:[1,5055],109:[1,5056],110:5057,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,5058]},o($V69,$VW3),{121:[1,5059]},{19:[1,5062],21:[1,5065],22:5061,87:5060,215:5063,216:[1,5064]},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:5066,121:$VX2,148:$VY2,190:$VZ2}),o($Vz8,$VB2),o($Vz8,$Vw),o($Vz8,$Vx),o($Vz8,$Vn),o($Vz8,$Vo),o($Vz8,$Vy),o($Vz8,$Vp),o($Vz8,$Vq),o($Vz8,$Vt2,{99:4789,95:5067,101:$VX9,102:$VR,103:$VS,104:$VT}),o($Vr9,$Vu2),o($Vr9,$V33),o($Vz8,$V19),o($V49,$VR3),o($V69,$VS3),o($V69,$VT3),o($V69,$VU3),{100:[1,5068]},o($V69,$VT1),{100:[1,5070],106:5069,108:[1,5071],109:[1,5072],110:5073,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,5074]},o($V69,$VW3),{121:[1,5075]},{19:[1,5078],21:[1,5081],22:5077,87:5076,215:5079,216:[1,5080]},o($V69,$VX5),o($V69,$VK1),o($V69,$Vn),o($V69,$Vo),o($V69,$Vp),o($V69,$Vq),o($Vt4,$Vt5),{19:[1,5084],21:[1,5087],22:5083,87:5082,215:5085,216:[1,5086]},o($Vr1,$Vh6),o($Vr1,$VK1),o($Vt1,$Vh6),o($Vt1,$VK1),o($VD1,$Vh6),o($VD1,$VK1),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:5088,121:$VX2,148:$VY2,190:$VZ2}),o($V97,$VB2),o($V97,$Vw),o($V97,$Vx),o($V97,$Vn),o($V97,$Vo),o($V97,$Vy),o($V97,$Vp),o($V97,$Vq),o($V97,$Vt2,{99:4879,95:5089,101:$VY9,102:$VR,103:$VS,104:$VT}),o($Vq8,$Vu2),o($Vq8,$V33),o($V97,$V19),o($VS7,$VR3),o($VU7,$VS3),o($VU7,$VT3),o($VU7,$VU3),{100:[1,5090]},o($VU7,$VT1),{100:[1,5092],106:5091,108:[1,5093],109:[1,5094],110:5095,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,5096]},o($VU7,$VW3),{121:[1,5097]},{19:[1,5100],21:[1,5103],22:5099,87:5098,215:5101,216:[1,5102]},o($VU7,$VX5),o($VU7,$VK1),o($VU7,$Vn),o($VU7,$Vo),o($VU7,$Vp),o($VU7,$Vq),o($VU7,$VX5),o($VU7,$VK1),o($VU7,$Vn),o($VU7,$Vo),o($VU7,$Vp),o($VU7,$Vq),o($Vs8,$Vh6),o($Vs8,$VK1),o($Vz8,$VN7),o($Vz8,$VO7,{74:5104,76:5105,78:5106,39:5107,118:5108,79:[1,5109],80:[1,5110],81:[1,5111],119:$VJ,125:$VJ,127:$VJ,190:$VJ,228:$VJ}),o($Vz8,$VP7),o($Vz8,$VO5,{77:5112,73:5113,92:5114,94:5115,95:5119,99:5120,96:[1,5116],97:[1,5117],98:[1,5118],101:$V2a,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:5122,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vz8,$VR7),o($V49,$Vy1,{93:5123}),o($V59,$Vz1,{99:5042,95:5124,101:$V1a,102:$VR,103:$VS,104:$VT}),o($V69,$VB1,{86:5125}),o($V69,$VB1,{86:5126}),o($V69,$VB1,{86:5127}),o($Vz8,$VC1,{105:5046,107:5047,91:5128,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V79,$VU5),o($V79,$VV5),o($V49,$VG1),o($V49,$VH1),o($V49,$VI1),o($V49,$VJ1),o($V69,$VK1),o($VL1,$VM1,{163:5129}),o($V89,$VO1),{119:[1,5130],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($V79,$VE1),o($V79,$VF1),{19:[1,5134],21:[1,5138],22:5132,33:5131,201:5133,215:5135,216:[1,5137],217:[1,5136]},{100:[1,5139]},o($V49,$VT1),o($V69,$Vn),o($V69,$Vo),{100:[1,5141],106:5140,108:[1,5142],109:[1,5143],110:5144,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,5145]},o($V69,$Vp),o($V69,$Vq),{121:[1,5146]},o($Vr9,$VR3),o($V69,$V33),o($V69,$V43),o($V69,$V53),o($V69,$V63),o($V69,$V73),{111:[1,5147]},o($V69,$Vc3),o($V79,$Vt5),o($V89,$VX5),o($V89,$VK1),o($V89,$Vn),o($V89,$Vo),o($V89,$Vp),o($V89,$Vq),{121:[1,5148]},o($Vr9,$VR3),o($V69,$V33),o($V69,$V43),o($V69,$V53),o($V69,$V63),o($V69,$V73),{111:[1,5149]},o($V69,$Vc3),o($V79,$Vt5),o($V89,$VX5),o($V89,$VK1),o($V89,$Vn),o($V89,$Vo),o($V89,$Vp),o($V89,$Vq),o($VS5,$VX5),o($VS5,$VK1),o($VS5,$Vn),o($VS5,$Vo),o($VS5,$Vp),o($VS5,$Vq),{121:[1,5150]},o($Vq8,$VR3),o($VU7,$V33),o($VU7,$V43),o($VU7,$V53),o($VU7,$V63),o($VU7,$V73),{111:[1,5151]},o($VU7,$Vc3),o($VV7,$Vt5),o($VW7,$VX5),o($VW7,$VK1),o($VW7,$Vn),o($VW7,$Vo),o($VW7,$Vp),o($VW7,$Vq),o($Vz8,$Vn8),o($Vz8,$Vo8),o($Vz8,$VU5),o($Vz8,$VV5),{119:[1,5152],122:194,123:195,124:196,125:$VP1,127:$VQ1,190:$VR1,218:198,228:$VS1},o($Vz8,$VE1),o($Vz8,$VF1),{19:[1,5156],21:[1,5160],22:5154,33:5153,201:5155,215:5157,216:[1,5159],217:[1,5158]},o($Vz8,$Vp8),o($Vz8,$Vw6),o($Vr9,$Vy1,{93:5161}),o($Vz8,$Vz1,{99:5120,95:5162,101:$V2a,102:$VR,103:$VS,104:$VT}),o($Vr9,$VG1),o($Vr9,$VH1),o($Vr9,$VI1),o($Vr9,$VJ1),{100:[1,5163]},o($Vr9,$VT1),{70:[1,5164]},o($V59,$Vt2,{99:5042,95:5165,101:$V1a,102:$VR,103:$VS,104:$VT}),o($V49,$Vu2),o($Vz8,$Vv2,{90:5166,95:5167,91:5168,99:5169,105:5171,107:5172,101:$V3a,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vz8,$Vx2,{90:5166,95:5167,91:5168,99:5169,105:5171,107:5172,101:$V3a,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vz8,$Vy2,{90:5166,95:5167,91:5168,99:5169,105:5171,107:5172,101:$V3a,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V89,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,164:[1,5173],165:379,166:380,167:381,168:382,182:385,186:$VJ2,197:390,198:391,199:392,202:395,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:$VT2,215:389,216:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:5174,121:$VX2,148:$VY2,190:$VZ2}),o($V79,$VB2),o($V79,$Vw),o($V79,$Vx),o($V79,$Vn),o($V79,$Vo),o($V79,$Vy),o($V79,$Vp),o($V79,$Vq),o($V49,$V33),o($V89,$V43),o($V89,$V53),o($V89,$V63),o($V89,$V73),{111:[1,5175]},o($V89,$Vc3),o($Vz8,$Vt5),{19:[1,5178],21:[1,5181],22:5177,87:5176,215:5179,216:[1,5180]},o($Vz8,$Vt5),{19:[1,5184],21:[1,5187],22:5183,87:5182,215:5185,216:[1,5186]},o($V97,$Vt5),{19:[1,5190],21:[1,5193],22:5189,87:5188,215:5191,216:[1,5192]},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:5194,121:$VX2,148:$VY2,190:$VZ2}),o($Vz8,$VB2),o($Vz8,$Vw),o($Vz8,$Vx),o($Vz8,$Vn),o($Vz8,$Vo),o($Vz8,$Vy),o($Vz8,$Vp),o($Vz8,$Vq),o($Vz8,$Vt2,{99:5120,95:5195,101:$V2a,102:$VR,103:$VS,104:$VT}),o($Vr9,$Vu2),o($Vr9,$V33),o($Vz8,$V19),o($V49,$VR3),o($V69,$VS3),o($V69,$VT3),o($V69,$VU3),{100:[1,5196]},o($V69,$VT1),{100:[1,5198],106:5197,108:[1,5199],109:[1,5200],110:5201,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{100:[1,5202]},o($V69,$VW3),{121:[1,5203]},{19:[1,5206],21:[1,5209],22:5205,87:5204,215:5207,216:[1,5208]},o($V69,$VX5),o($V69,$VK1),o($V69,$Vn),o($V69,$Vo),o($V69,$Vp),o($V69,$Vq),o($V69,$VX5),o($V69,$VK1),o($V69,$Vn),o($V69,$Vo),o($V69,$Vp),o($V69,$Vq),o($VU7,$VX5),o($VU7,$VK1),o($VU7,$Vn),o($VU7,$Vo),o($VU7,$Vp),o($VU7,$Vq),{121:[1,5210]},o($Vr9,$VR3),o($V69,$V33),o($V69,$V43),o($V69,$V53),o($V69,$V63),o($V69,$V73),{111:[1,5211]},o($V69,$Vc3),o($V79,$Vt5),o($V89,$VX5),o($V89,$VK1),o($V89,$Vn),o($V89,$Vo),o($V89,$Vp),o($V89,$Vq),o($Vz8,$Vt5),{19:[1,5214],21:[1,5217],22:5213,87:5212,215:5215,216:[1,5216]},o($V69,$VX5),o($V69,$VK1),o($V69,$Vn),o($V69,$Vo),o($V69,$Vp),o($V69,$Vq)];
        this.defaultActions = {6:[2,11],24:[2,1],115:[2,120],116:[2,121],117:[2,122],124:[2,133],125:[2,134],208:[2,256],209:[2,257],210:[2,258],211:[2,259],343:[2,36],411:[2,143],412:[2,147],414:[2,149],604:[2,34],605:[2,38],642:[2,35],1165:[2,147],1167:[2,149]};
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
case 15:
 // t: @@
        yy._setBase(yy._base === null ||
                    absoluteIRI.test($$[$0].slice(1, -1)) ? $$[$0].slice(1, -1) : yy._resolveIRI($$[$0].slice(1, -1)));
      
break;
case 16:
 // t: ShExParser-test.js/with pre-defined prefixes
        yy._prefixes[$$[$0-1].slice(0, -1)] = $$[$0];
      
break;
case 17:
 // t: @@
        yy._imports.push($$[$0]);
      
break;
case 20:

        if (yy.start)
          yy.error(new Error("Parse error: start already defined"));
        yy.start = shapeJunction("ShapeOr", $$[$0-1], $$[$0]); // t: startInline
      
break;
case 21:

        yy.startActs = $$[$0]; // t: startCode1
      
break;
case 22:
this.$ = [$$[$0]] // t: startCode1;
break;
case 23:
this.$ = appendTo($$[$0-1], $$[$0]) // t: startCode3;
break;
case 26:
 // t: 1dot 1val1vsMinusiri3??
        yy.addShape($$[$0-2], Object.assign({type: "ShapeDecl"}, $$[$0-3],
                                   $$[$0-1].length > 0 ? { restricts: $$[$0-1] } : { },
                                   {shapeExpr: $$[$0]})) // $$[$01]: t: @@
      
break;
case 27:
this.$ = {  };
break;
case 28:
this.$ = { abstract: true };
break;
case 29: case 96:
this.$ = [] // t: 1dot, 1dotAnnot3;
break;
case 30: case 97:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotAnnot3;
break;
case 31:

        this.$ = nonest($$[$0]);
      
break;
case 33:
this.$ = { type: "ShapeExternal" };
break;
case 34:

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
case 35:

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
case 36:

        $$[$0].needsAtom.unshift(nonest($$[$0-1]));
        delete $$[$0].needsAtom;
        this.$ = $$[$0]; // { type: "ShapeOr", "shapeExprs": [$$[$0-1]].concat($$[$0]) };
      
break;
case 37: case 235: case 252:
this.$ = null;
break;
case 38: case 42: case 45: case 51: case 58: case 192: case 251: case 272: case 276:
this.$ = $$[$0];
break;
case 40:
 // returns a ShapeOr
        const disjuncts = $$[$0].map(nonest);
        this.$ = { type: "ShapeOr", shapeExprs: disjuncts, needsAtom: disjuncts }; // t: @@
      
break;
case 41:
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
case 43: case 46:
this.$ = [$$[$0]];
break;
case 44: case 47: case 49: case 53: case 56: case 60: case 274: case 278:
this.$ = $$[$0-1].concat($$[$0]);
break;
case 48: case 52: case 55: case 59: case 273: case 277:
this.$ = [];
break;
case 50: case 271:
this.$ = shapeJunction("ShapeOr", $$[$0-1], $$[$0]);
break;
case 54: case 57:
this.$ = shapeJunction("ShapeAnd", $$[$0-1], $$[$0]) // t: @@;
break;
case 61:
this.$ = $$[$0-1] ? { type: "ShapeNot", "shapeExpr": nonest($$[$0]) } /* t:@@ */ : $$[$0];
break;
case 62:
this.$ = false;
break;
case 63:
this.$ = true;
break;
case 64:
this.$ = $$[$0-1] ? { type: "ShapeNot", "shapeExpr": nonest($$[$0]) } /* t: 1NOTNOTdot, 1NOTNOTIRI, 1NOTNOTvs */ : $$[$0];
break;
case 65: case 74: case 79: case 280: case 282:
this.$ = $$[$0] ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $$[$0-1]), $$[$0] ] } : $$[$0-1];
break;
case 67:
this.$ = $$[$0] ? shapeJunction("ShapeAnd", $$[$0-1], [$$[$0]]) /* t: 1dotRef1 */ : $$[$0-1] // t:@@;
break;
case 68: case 77: case 82:
this.$ = Object.assign($$[$0-1], {nested: true}) // t: 1val1vsMinusiri3;
break;
case 69: case 78: case 83:
this.$ = yy.EmptyShape // t: 1dot;
break;
case 76:
this.$ = $$[$0] ? shapeJunction("ShapeAnd", $$[$0-1], [$$[$0]]) /* t:@@ */ : $$[$0-1]	 // t: 1dotRef1 -- use _QnonLitNodeConstraint_E_Opt like below?;
break;
case 81:
this.$ = $$[$0] ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $$[$0-1]), $$[$0] ] } : $$[$0-1] // t: !! look to 1dotRef1;
break;
case 92:
 // t: 1dotRefLNex@@
        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        const namePos = $$[$0].indexOf(':');
        this.$ = yy.addSourceMap(yy.expandPrefix($$[$0].substr(0, namePos), yy) + $$[$0].substr(namePos + 1)); // ShapeRef
      
break;
case 93:
 // t: 1dotRefNS1@@
        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        this.$ = yy.addSourceMap(yy.expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy)); // ShapeRef
      
break;
case 94:
this.$ = yy.addSourceMap($$[$0]) // ShapeRef // t: 1dotRef1, 1dotRefSpaceLNex, 1dotRefSpaceNS1;
break;
case 95: case 98:
 // t: !!
        this.$ = $$[$0-2]
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: !!
        if ($$[$0]) { this.$.semActs = $$[$0].semActs; } // t: !!
      
break;
case 99:
this.$ = extend({ type: "NodeConstraint", nodeKind: "literal" }, $$[$0]) // t: 1literalPattern;
break;
case 100:

        if (numericDatatypes.indexOf($$[$0-1]) === -1)
          numericFacets.forEach(function (facet) {
            if (facet in $$[$0])
              yy.error(new Error("Parse error: facet " + facet + " not allowed for unknown datatype " + $$[$0-1]));
          });
        this.$ = extend({ type: "NodeConstraint", datatype: $$[$0-1] }, $$[$0]) // t: 1datatype
      
break;
case 101:
this.$ = { type: "NodeConstraint", values: $$[$0-1] } // t: 1val1IRIREF;
break;
case 102:
this.$ = extend({ type: "NodeConstraint"}, $$[$0]);
break;
case 103:
this.$ = {} // t: 1literalPattern;
break;
case 104:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          yy.error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"));
        }
        this.$ = extend($$[$0-1], $$[$0]) // t: 1literalLength
      
break;
case 106: case 112:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          yy.error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"));
        }
        this.$ = extend($$[$0-1], $$[$0]) // t: !! look to 1literalLength
      
break;
case 107:
this.$ = extend({ type: "NodeConstraint" }, $$[$0-1], $$[$0] ? $$[$0] : {}) // t: 1iriPattern;
break;
case 108:
this.$ = extend({ type: "NodeConstraint" }, $$[$0]) // t: @@;
break;
case 109:
this.$ = {};
break;
case 110:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          yy.error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"));
        }
        this.$ = extend($$[$0-1], $$[$0])
      
break;
case 113:
this.$ = { nodeKind: "iri" } // t: 1iriPattern;
break;
case 114:
this.$ = { nodeKind: "bnode" } // t: 1bnodeLength;
break;
case 115:
this.$ = { nodeKind: "nonliteral" } // t: 1nonliteralLength;
break;
case 118:
this.$ = keyValObject($$[$0-1], parseInt($$[$0], 10)) // t: 1literalLength;
break;
case 119:
this.$ = unescapeRegexp($$[$0]) // t: 1literalPattern;
break;
case 120:
this.$ = "length" // t: 1literalLength;
break;
case 121:
this.$ = "minlength" // t: 1literalMinlength;
break;
case 122:
this.$ = "maxlength" // t: 1literalMaxlength;
break;
case 123:
this.$ = keyValObject($$[$0-1], $$[$0]) // t: 1literalMininclusive;
break;
case 124:
this.$ = keyValObject($$[$0-1], parseInt($$[$0], 10)) // t: 1literalTotaldigits;
break;
case 125:
this.$ = parseInt($$[$0], 10);
break;
case 126: case 127:
this.$ = parseFloat($$[$0]);
break;
case 128:
 // ## deprecated
        if ($$[$0] === XSD_DECIMAL || $$[$0] === XSD_FLOAT || $$[$0] === XSD_DOUBLE)
          this.$ = parseFloat($$[$0-2].value);
        else if (numericDatatypes.indexOf($$[$0]) !== -1)
          this.$ = parseInt($$[$0-2].value)
        else
          yy.error(new Error("Parse error: numeric range facet expected numeric datatype instead of " + $$[$0]));
      
break;
case 129:
this.$ = "mininclusive" // t: 1literalMininclusive;
break;
case 130:
this.$ = "minexclusive" // t: 1literalMinexclusive;
break;
case 131:
this.$ = "maxinclusive" // t: 1literalMaxinclusive;
break;
case 132:
this.$ = "maxexclusive" // t: 1literalMaxexclusive;
break;
case 133:
this.$ = "totaldigits" // t: 1literalTotaldigits;
break;
case 134:
this.$ = "fractiondigits" // t: 1literalFractiondigits;
break;
case 135:
 // t: 1dotExtend3
        this.$ = $$[$0-2] === yy.EmptyShape ? { type: "Shape" } : $$[$0-2]; // t: 0
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: !! look to open3groupdotcloseAnnot3, open3groupdotclosecard23Annot3Code2
        if ($$[$0]) { this.$.semActs = $$[$0].semActs; } // t: !! look to open3groupdotcloseCode1, !open1dotOr1dot
      
break;
case 136:
 // t: 1dotExtend3
        const exprObj = $$[$0-1] ? { expression: $$[$0-1] } : yy.EmptyObject; // t: 0, 0Extend1
        this.$ = (exprObj === yy.EmptyObject && $$[$0-3] === yy.EmptyObject) ?
	  yy.EmptyShape :
	  extend({ type: "Shape" }, exprObj, $$[$0-3]);
      
break;
case 137:
this.$ = [ "extends", [$$[$0]] ] // t: 1dotExtend1;
break;
case 138:
this.$ = [ "extra", $$[$0] ] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3;
break;
case 139:
this.$ = [ "closed", true ] // t: 1dotClosed;
break;
case 140:
this.$ = yy.EmptyObject;
break;
case 141:

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
case 144:
this.$ = $$[$0] // t: 1dotExtra1, 3groupdot3Extra;
break;
case 145:
this.$ = [$$[$0]] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3;
break;
case 146:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 3groupdotExtra3;
break;
case 150:
this.$ = { type: "OneOf", expressions: unionAll([$$[$0-1]], $$[$0]) } // t: 2oneOfdot;
break;
case 151:
this.$ = $$[$0] // t: 2oneOfdot;
break;
case 152:
this.$ = [$$[$0]] // t: 2oneOfdot;
break;
case 153:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 2oneOfdot;
break;
case 156:
this.$ = $$[$0-1];
break;
case 160:
this.$ = { type: "EachOf", expressions: unionAll([$$[$0-2]], $$[$0-1]) } // t: 2groupOfdot;
break;
case 161:
this.$ = $$[$0] // ## deprecated // t: 2groupOfdot;
break;
case 162:
this.$ = $$[$0] // t: 2groupOfdot;
break;
case 163:
this.$ = [$$[$0]] // t: 2groupOfdot;
break;
case 164:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 2groupOfdot;
break;
case 165:

        if ($$[$0-1]) {
          this.$ = extend({ id: $$[$0-1] }, $$[$0]);
          yy.addProduction($$[$0-1],  this.$);
        } else {
          this.$ = $$[$0]
        }
      
break;
case 167:
this.$ = yy.addSourceMap($$[$0]);
break;
case 172:

        // t: open1dotOr1dot, !openopen1dotcloseCode1closeCode2
        this.$ = $$[$0-4];
        // Copy all of the new attributes into the encapsulated shape.
        if ("min" in $$[$0-2]) { this.$.min = $$[$0-2].min; } // t: open3groupdotclosecard23Annot3Code2
        if ("max" in $$[$0-2]) { this.$.max = $$[$0-2].max; } // t: open3groupdotclosecard23Annot3Code2
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: open3groupdotcloseAnnot3, open3groupdotclosecard23Annot3Code2
        if ($$[$0]) { this.$.semActs = "semActs" in $$[$0-4] ? $$[$0-4].semActs.concat($$[$0].semActs) : $$[$0].semActs; } // t: open3groupdotcloseCode1, !open1dotOr1dot
      
break;
case 173:
this.$ = {} // t: 1dot;
break;
case 175:

        // $$[$0]: t: 1dotCode1
	if ($$[$0-3] !== yy.EmptyShape && false) {}
        // %6: t: 1inversedotCode1
        this.$ = extend({ type: "TripleConstraint" }, $$[$0-5] ? $$[$0-5] : {}, { predicate: $$[$0-4] }, ($$[$0-3] === yy.EmptyShape ? {} : { valueExpr: $$[$0-3] }), $$[$0-2], $$[$0]); // t: 1dot, 1inversedot, 1negatedinversedot
        if ($$[$0-1].length)
          this.$["annotations"] = $$[$0-1]; // t: 1dotAnnot3, 1inversedotAnnot3
      
break;
case 178:
this.$ = { min:0, max:UNBOUNDED } // t: 1cardStar;
break;
case 179:
this.$ = { min:1, max:UNBOUNDED } // t: 1cardPlus;
break;
case 180:
this.$ = { min:0, max:1 } // t: 1cardOpt;
break;
case 181:

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
case 182:
this.$ = { inverse: true } // t: 1inversedot;
break;
case 183:
this.$ = { inverse: true, negated: true } // t: 1negatedinversedot;
break;
case 184:
this.$ = { negated: true } // t: 1negateddot;
break;
case 185:
this.$ = { inverse: true, negated: true } // t: 1inversenegateddot;
break;
case 186:
this.$ = $$[$0-1] // t: 1val1IRIREF;
break;
case 187:
this.$ = [] // t: 1val1IRIREF;
break;
case 188:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1IRIREF;
break;
case 193:
this.$ = [$$[$0]] // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 194:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 195:
this.$ = [$$[$0]] // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 196:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 197:
this.$ = [$$[$0]] // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 198:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 199:
this.$ = { type: "IriStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 200:
this.$ = { type: "LiteralStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 201:
this.$ = { type: "LanguageStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 202:

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
case 203:
this.$ = [] // t: 1val1iriStem, 1val1iriStemMinusiri3;
break;
case 204:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1iriStemMinusiri3;
break;
case 205:
this.$ = $$[$0] // t: 1val1iriStemMinusiri3;
break;
case 208:
this.$ = $$[$0] ? { type: "IriStem", stem: $$[$0-1] } /* t: 1val1iriStemMinusiriStem3 */ : $$[$0-1] // t: 1val1iriStemMinusiri3;
break;
case 211:

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
case 212:
this.$ = [] // t: 1val1literalStem, 1val1literalStemMinusliteral3;
break;
case 213:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1literalStemMinusliteral3;
break;
case 214:
this.$ = $$[$0] // t: 1val1literalStemMinusliteral3;
break;
case 217:
this.$ = $$[$0] ? { type: "LiteralStem", stem: $$[$0-1].value } /* t: 1val1literalStemMinusliteral3 */ : $$[$0-1].value // t: 1val1literalStemMinusliteralStem3;
break;
case 218:

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
case 219:

        this.$ = {  // t: @@
          type: $$[$0].length ? "LanguageStemRange" : "LanguageStem",
          stem: ""
        };
        if ($$[$0].length)
          this.$["exclusions"] = $$[$0]; // t: @@
      
break;
case 220:
this.$ = [] // t: 1val1languageStem, 1val1languageStemMinuslanguage3;
break;
case 221:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1languageStemMinuslanguage3;
break;
case 222:
this.$ = $$[$0] // t: 1val1languageStemMinuslanguage3;
break;
case 225:
this.$ = $$[$0] ? { type: "LanguageStem", stem: $$[$0-1] } /* t: 1val1languageStemMinuslanguageStem3 */ : $$[$0-1] // t: 1val1languageStemMinuslanguage3;
break;
case 226:
this.$ = yy.addSourceMap($$[$0]) // Inclusion // t: 2groupInclude1;
break;
case 227:
this.$ = { type: "Annotation", predicate: $$[$0-1], object: $$[$0] } // t: 1dotAnnotIRIREF;
break;
case 230:
this.$ = $$[$0].length ? { semActs: $$[$0] } : null // t: 1dotCode1/2oneOfDot;
break;
case 231:
this.$ = [] // t: 1dot, 1dotCode1;
break;
case 232:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotCode1;
break;
case 233:
this.$ = $$[$0] ? unescapeSemanticAction($$[$0-1], $$[$0]) /* t: 1dotCode1 */ : { type: "SemAct", name: $$[$0-1] } // t: 1dotNoCode1;
break;
case 240:
this.$ = RDF_TYPE // t: 1AvalA;
break;
case 246:
this.$ = createLiteral($$[$0], XSD_INTEGER) // t: 1val1INTEGER;
break;
case 247:
this.$ = createLiteral($$[$0], XSD_DECIMAL) // t: 1val1DECIMAL;
break;
case 248:
this.$ = createLiteral($$[$0], XSD_DOUBLE) // t: 1val1DOUBLE;
break;
case 250:
this.$ = $$[$0] ? extend($$[$0-1], { type: $$[$0] }) : $$[$0-1] // t: 1val1Datatype;
break;
case 254:
this.$ = { value: "true", type: XSD_BOOLEAN } // t: 1val1true;
break;
case 255:
this.$ = { value: "false", type: XSD_BOOLEAN } // t: 1val1false;
break;
case 256:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL2;
break;
case 257:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL1;
break;
case 258:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL_LONG2;
break;
case 259:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG1;
break;
case 260:
this.$ = unescapeLangString($$[$0], 1)	// t: @@;
break;
case 261:
this.$ = unescapeLangString($$[$0], 3)	// t: @@;
break;
case 262:
this.$ = unescapeLangString($$[$0], 1)	// t: 1val1LANGTAG;
break;
case 263:
this.$ = unescapeLangString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG2_with_LANGTAG;
break;
case 264:
 // t: 1dot
        const unesc = ShExUtil.unescapeText($$[$0].slice(1,-1), {});
        this.$ = yy._base === null || absoluteIRI.test(unesc) ? unesc : yy._resolveIRI(unesc)
      
break;
case 266:
 // t:1dotPNex, 1dotPNdefault, ShExParser-test.js/with pre-defined prefixes
        const namePos1 = $$[$0].indexOf(':');
        this.$ = yy.expandPrefix($$[$0].substr(0, namePos1), yy) + ShExUtil.unescapeText($$[$0].substr(namePos1 + 1), pnameEscapeReplacements);
      
break;
case 267:
 // t: 1dotNS2, 1dotNSdefault, ShExParser-test.js/PNAME_NS with pre-defined prefixes
        this.$ = yy.expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy);
      
break;
case 269:
this.$ = $$[$0] // t: 0Extends1, 1dotExtends1, 1dot3ExtendsLN;
break;
case 275:
this.$ = shapeJunction("ShapeAnd", $$[$0-1], $$[$0]);
break;
case 279:
this.$ = $$[$0-1] ? { type: "ShapeNot", "shapeExpr": nonest($$[$0]) } : $$[$0];
break;
case 283:
this.$ = Object.assign($$[$0-1], {nested: true});
break;
case 284:
this.$ = yy.EmptyShape;
break;
case 287:
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
        this.rules = [/^(?:\s+|(#[^\u000a\u000d]*|\/\*([^*]|\*([^/]|\\\/))*\*\/))/,/^(?:(@(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*))))/,/^(?:(@((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)))/,/^(?:(@([A-Za-z])+((-([0-9A-Za-z])+))*))/,/^(?:@)/,/^(?:(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*)))/,/^(?:(\{((([+-])?([0-9])+))((,(((([+-])?([0-9])+))|\*)?))?\}))/,/^(?:(([+-])?((([0-9])+\.([0-9])*(([Ee]([+-])?([0-9])+)))|((\.)?([0-9])+(([Ee]([+-])?([0-9])+))))))/,/^(?:(([+-])?([0-9])*\.([0-9])+))/,/^(?:(([+-])?([0-9])+))/,/^(?:{ANON})/,/^(?:(<([^\u0000-\u0020<>\"{}|^`\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*>))/,/^(?:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:))/,/^(?:a\b)/,/^(?:(\/([^\u002f\u005C\u000A\u000D]|\\[nrt\\|.?*+(){}$\u002D\u005B\u005D\u005E/]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))+\/[smix]*))/,/^(?:(_:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|[0-9])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?))/,/^(?:(\{([^%\\]|\\[%\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*%\}))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"))/,/^(?:([Bb][Aa][Ss][Ee]))/,/^(?:([Pp][Rr][Ee][Ff][Ii][Xx]))/,/^(?:([iI][mM][pP][oO][rR][tT]))/,/^(?:([sS][tT][aA][rR][tT]))/,/^(?:([eE][xX][tT][eE][rR][nN][aA][lL]))/,/^(?:([Aa][Bb][Ss][Tt][Rr][Aa][Cc][Tt]))/,/^(?:([Rr][Ee][Ss][Tt][Rr][Ii][Cc][Tt][Ss]))/,/^(?:([Ee][Xx][Tt][Ee][Nn][Dd][Ss]))/,/^(?:([Cc][Ll][Oo][Ss][Ee][Dd]))/,/^(?:([Ee][Xx][Tt][Rr][Aa]))/,/^(?:([Ll][Ii][Tt][Ee][Rr][Aa][Ll]))/,/^(?:([Bb][Nn][Oo][Dd][Ee]))/,/^(?:([Ii][Rr][Ii]))/,/^(?:([Nn][Oo][Nn][Ll][Ii][Tt][Ee][Rr][Aa][Ll]))/,/^(?:([Aa][Nn][Dd]))/,/^(?:([Oo][Rr]))/,/^(?:([No][Oo][Tt]))/,/^(?:([Mm][Ii][Nn][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Ii][Nn][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Aa][Xx][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Aa][Xx][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Mm][Ii][Nn][Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Mm][Aa][Xx][Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Tt][Oo][Tt][Aa][Ll][Dd][Ii][Gg][Ii][Tt][Ss]))/,/^(?:([Ff][Rr][Aa][Cc][Tt][Ii][Oo][Nn][Dd][Ii][Gg][Ii][Tt][Ss]))/,/^(?:=)/,/^(?:\/\/)/,/^(?:\{)/,/^(?:\})/,/^(?:&)/,/^(?:\|\|)/,/^(?:\|)/,/^(?:,)/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?:\$)/,/^(?:!)/,/^(?:\^\^)/,/^(?:\^)/,/^(?:\.)/,/^(?:~)/,/^(?:;)/,/^(?:\*)/,/^(?:\+)/,/^(?:\?)/,/^(?:-)/,/^(?:%)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:$)/,/^(?:[a-zA-Z0-9_-]+)/,/^(?:.)/];
        this.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79],"inclusive":true}};
    }
    performAction (yy, yy_, $avoiding_name_collisions, YY_START) {
              let YYSTATE = YY_START;
            switch ($avoiding_name_collisions) {
    case 0:/**/
      break;
    case 1:return 79;
      break;
    case 2:return 80;
      break;
    case 3: yy_.yytext = yy_.yytext.substr(1); return 186; 
      break;
    case 4:return 81;
      break;
    case 5:return 216;
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
    case 13:return 200;
      break;
    case 14:return 101;
      break;
    case 15:return 217;
      break;
    case 16:return 196;
      break;
    case 17:return 212;
      break;
    case 18:return 214;
      break;
    case 19:return 211;
      break;
    case 20:return 213;
      break;
    case 21:return 208;
      break;
    case 22:return 210;
      break;
    case 23:return 207;
      break;
    case 24:return 209;
      break;
    case 25:return 18;
      break;
    case 26:return 20;
      break;
    case 27:return 23;
      break;
    case 28:return 26;
      break;
    case 29:return 40;
      break;
    case 30:return 36;
      break;
    case 31:return 230;
      break;
    case 32:return 228;
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
    case 41:return 44;
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
    case 52:return 191;
      break;
    case 53:return 119;
      break;
    case 54:return 121;
      break;
    case 55:return 190;
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
    case 61:return 162;
      break;
    case 62:return 164;
      break;
    case 63:return 148;
      break;
    case 64:return 161;
      break;
    case 65:return 111;
      break;
    case 66:return 160;
      break;
    case 67:return 71;
      break;
    case 68:return 179;
      break;
    case 69:return 141;
      break;
    case 70:return 156;
      break;
    case 71:return 157;
      break;
    case 72:return 158;
      break;
    case 73:return 180;
      break;
    case 74:return 194;
      break;
    case 75:return 205;
      break;
    case 76:return 206;
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

// Export module
__webpack_unused_export__ = ({ value: true });
__webpack_unused_export__ = ShExJisonLexer;



/***/ }),

/***/ 931:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const ShExParserCjsModule = (function () {

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
    let errors = [];
    parserState.recoverable = e =>
      errors.push(e);
    let ret = null;
    try {
      ret = oldParse.call(parser, input, parserState);
    } catch (e) {
      errors.push(e);
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

/***/ 1118:
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

/***/ 9443:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// **ShExUtil** provides ShEx utility functions

const ShExUtilCjsModule = (function () {
const ShExTerm = __webpack_require__(1118);
const Visitor = __webpack_require__(8806)
const Hierarchy = __webpack_require__(2515)

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
            _walkShapeExpression(expr, negated ^ !!expr.negated);
          });
        } else if (shapeExpr.type === "ShapeNot") {
          _walkShapeExpression(shapeExpr.shapeExpr, negated ^ 1); // !!! test negation
        } else if (shapeExpr.type === "Shape") {
          _walkShape(shapeExpr, negated ^ !!shapeExpr.negated);
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
              _walkTripleExpression(nested, negated ^ !!nested.negated) // ?? negation allowed?
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
              _walkTripleConstraint(tripleExpr, negated ^ !!tripleExpr.negated);
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
          _walkTripleExpression(shape.expression, negated ^ !!shape.negated);
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
      return _ShExUtil.walkVal(val.solution, cb);
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
   *             { "ldterm": "_:n3-41", "nested": {
   *                  "rdf:type": [ { "ldterm": ":ShapeNot" } ], ":shapeExpr": [
   *                   { "ldterm": "#S2", "nested": {
   *                        "rdf:type": [ { "ldterm": ":ShapeDecl" } ], ":shapeExpr": [
   *                         { "ldterm": "_:n3-42", "nested": {
   *                              "rdf:type": [ { "ldterm": ":Shape" } ], ":expression": [
   *                               { "ldterm": "_:n3-43", "nested": {
   *                                    "rdf:type": [ { "ldterm": ":TripleConstraint" } ], ":predicate": [ { "ldterm": "#p3" } ] } }
   *                             ] } }
   *                       ] } }
   *                 ] } }
   *           ] } },
   *       { "ldterm": "#S2", "nested": {
   *            "rdf:type": [ { "ldterm": ":ShapeDecl" } ], ":shapeExpr": [
   *             { "ldterm": "_:n3-42", "nested": {
   *                  "rdf:type": [ { "ldterm": ":Shape" } ], ":expression": [
   *                   { "ldterm": "_:n3-43", "nested": {
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
        ["inverse", "negated"].forEach(a => {
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
        node: ShExTerm.resolveRelativeIRI(base, elt.node),
        shape: ShExTerm.resolveRelativeIRI(base, elt.shape)
      });
    });
  },

  errsToSimple: function (val) {
    const _ShExUtil = this;
    if (Array.isArray(val)) {
      return val.reduce((ret, e) => {
        const nested = _ShExUtil.errsToSimple(e).map(s => "  " + s);
        return ret.length ? ret.concat(["AND"]).concat(nested) : nested;
      }, []);
    }
    if (typeof val === "string")
      return [val];

    switch (val.type) {
    case "FailureList":
      return val.errors.reduce((ret, e) => {
        return ret.concat(_ShExUtil.errsToSimple(e));
      }, []);
    case "Failure":
      return ["validating " + val.node + " as " + val.shape + ":"].concat(errorList(val.errors).reduce((ret, e) => {
        const nested = _ShExUtil.errsToSimple(e).map(s => "  " + s);
        return ret.length > 0 ? ret.concat(["  OR"]).concat(nested) : nested.map(s => "  " + s);
      }, []));
    case "TypeMismatch": {
      const nested = Array.isArray(val.errors) ?
          val.errors.reduce((ret, e) => {
            return ret.concat((typeof e === "string" ? [e] : _ShExUtil.errsToSimple(e)).map(s => "  " + s));
          }, []) :
          "  " + (typeof e === "string" ? [val.errors] : _ShExUtil.errsToSimple(val.errors));
      return ["validating " + n3ify(val.triple.object) + ":"].concat(nested);
    }
    case "RestrictionError": {
      const nested = val.errors.constructor === Array ?
          val.errors.reduce((ret, e) => {
            return ret.concat((typeof e === "string" ? [e] : _ShExUtil.errsToSimple(e)).map(s => "  " + s));
          }, []) :
          "  " + (typeof e === "string" ? [val.errors] : _ShExUtil.errsToSimple(val.errors));
      return ["validating restrictions on " + n3ify(val.focus) + ":"].concat(nested);
    }
    case "ShapeAndFailure":
      return Array.isArray(val.errors) ?
          val.errors.reduce((ret, e) => {
            return ret.concat((typeof e === "string" ? [e] : _ShExUtil.errsToSimple(e)).map(s => "  " + s));
          }, []) :
          "  " + (typeof e === "string" ? [val.errors] : _ShExUtil.errsToSimple(val.errors));
    case "ShapeOrFailure":
      return Array.isArray(val.errors) ?
          val.errors.reduce((ret, e) => {
            return ret.concat(" OR " + (typeof e === "string" ? [e] : _ShExUtil.errsToSimple(e)));
          }, []) :
          " OR " + (typeof e === "string" ? [val.errors] : _ShExUtil.errsToSimple(val.errors));
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
      const w = __webpack_require__(95)();
      w._write(w._writeNodeConstraint(val.shapeExpr).join(""));
      let txt;
      w.end((err, res) => {
        txt = res;
      });
      return ["NodeConstraintError: expected to match " + txt];
    case "MissingProperty":
      return ["Missing property: " + val.property];
    case "NegatedProperty":
      return ["Unexpected property: " + val.property];
    case "AbstractShapeFailure":
      return ["Abstract Shape: " + val.shape];
    case "SemActFailure": {
      const nested = Array.isArray(val.errors) ?
          val.errors.reduce((ret, e) => {
            return ret.concat((typeof e === "string" ? [e] : _ShExUtil.errsToSimple(e)).map(s => "  " + s));
          }, []) :
          "  " + (typeof e === "string" ? [val.errors] : _ShExUtil.errsToSimple(val.errors));
      return ["rejected by semantic action:"].concat(nested);
    }
    case "SemActViolation":
      return [val.message];
    case "BooleanSemActFailure":
      return ["Failed evaluating " + val.code + " on context " + JSON.stringify(val.ctx)];
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

/***/ 3457:
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

const ShExTerm = __webpack_require__(1118);
const ShExVisitor = __webpack_require__(8806);
const { NoTripleConstraint } = __webpack_require__(3530);
const NoExtends = Symbol("NO_EXTENDS");
const Hierarchy = __webpack_require__(2515)

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
  const regexModule = this.options.regexModule || __webpack_require__(6863);

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
  this.validate = function (point, label, tracker, seen, matchTarget, subGraph) {
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
        const res = this.validate(pair.node, pair.shape, label, tracker, matchTarget, subGraph); // really tracker and seen
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
    } else {
      shape = this._lookupShape(label);
    }

    // if we passed in an expression rather than a label, validate it directly.
    if (typeof label !== "string")
      return this._validateShapeExpr(point, shape, Start, 0, tracker, seen);

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
    const ret = this._validateDescendants(point, label, 0, tracker, seen, matchTarget, subGraph);
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

  this._validateDescendants = function (point, shapeLabel, depth, tracker, seen, matchTarget, subGraph, allowAbstract) {
    const _ShExValidator = this;
    if (subGraph) { // !! matchTarget?
      // matchTarget indicates that shape substitution has already been applied.
      // Now we're testing a subgraph against the base shapes.
      const res = this._validateShapeDecl(point, this._lookupShape(shapeLabel), shapeLabel, 0, tracker, seen, matchTarget, subGraph);
      if (matchTarget && shapeLabel === matchTarget.label && !("errors" in res))
        matchTarget.count++;
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
    if (!allowAbstract)
      candidates = candidates.filter(l => !this._lookupShape(l).abstract);

    // Aggregate results in a SolutionList or FailureList.
    const results = candidates.reduce((ret, candidateShapeLabel) => {
      const shapeExpr = this._lookupShape(candidateShapeLabel);
      const matchTarget = candidateShapeLabel === shapeLabel ? null : { label: shapeLabel, count: 0 };
      const res = this._validateShapeDecl(point, shapeExpr, candidateShapeLabel, 0, tracker, seen, matchTarget, subGraph);
      return "errors" in res || matchTarget && matchTarget.count === 0 ?
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
        const schemaVisitor = ShExVisitor();
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
              const extendsVisitor = ShExVisitor();
              extendsVisitor.visitExpression = function (expr, ...args) { return "null"; }
              extendsVisitor.visitShapeRef = function (reference, ...args) {
                extensions.add(reference, curLabel);
                extendsVisitor.visitShapeDecl(_ShExValidator._lookupShape(reference))
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

  this._validateShapeDecl = function (point, shapeDecl, shapeLabel, depth, tracker, seen, matchTarget, subGraph) {
    const conjuncts = (shapeDecl.restricts || []).concat([shapeDecl.shapeExpr])
    const expr = conjuncts.length === 1
          ? conjuncts[0]
          : { type: "ShapeAnd", shapeExprs: conjuncts };
    return this._validateShapeExpr(point, expr, shapeLabel, depth, tracker, seen, matchTarget, subGraph);
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

  this._validateShapeExpr = function (point, shapeExpr, shapeLabel, depth, tracker, seen, matchTarget, subGraph) {
    if (point === "")
      throw Error("validation needs a valid focus node");
    let ret = null
    if (typeof shapeExpr === "string") { // ShapeRef
      ret = this._validateDescendants(point, shapeExpr, depth, tracker, seen, matchTarget, subGraph, true);
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
      ret = this._validateShape(point, shapeExpr, shapeLabel, depth, tracker, seen, matchTarget, subGraph);
    } else if (shapeExpr.type === "ShapeExternal") {
      ret = this.options.validateExtern(point, shapeLabel, tracker, seen);
    } else if (shapeExpr.type === "ShapeOr") {
      const errors = [];
      for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        const nested = shapeExpr.shapeExprs[i];
        const sub = this._validateShapeExpr(point, nested, shapeLabel, depth, tracker, seen, matchTarget, subGraph);
        if ("errors" in sub)
          errors.push(sub);
        else if (!matchTarget || matchTarget.count > 0)
          return { type: "ShapeOrResults", solution: sub };
      }
      ret = { type: "ShapeOrFailure", errors: errors };
    } else if (shapeExpr.type === "ShapeNot") {
      const sub = this._validateShapeExpr(point, shapeExpr.shapeExpr, shapeLabel, depth, tracker, seen, matchTarget, subGraph);
      if ("errors" in sub)
          ret = { type: "ShapeNotResults", solution: sub };
        else
          ret = { type: "ShapeNotFailure", errors: sub };
    } else if (shapeExpr.type === "ShapeAnd") {
      const passes = [];
      const errors = [];
      for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        const nested = shapeExpr.shapeExprs[i];
        const sub = this._validateShapeExpr(point, nested, shapeLabel, depth, tracker, seen, matchTarget, subGraph);
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

  this._validateShape = function (point, shape, shapeLabel, depth, tracker, seen, matchTarget, subGraph) {
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

    const fromDB  = (subGraph || db).getNeighborhood(point, shapeLabel, shape);
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

    // neighborhood already integrates subGraph so don't pass to _errorsMatchingShapeExpr
    const tripleList = matchByPredicate(constraintList, neighborhood, outgoingLength, point, valParms, matchTarget);
    const {misses, extras} = whatsMissing(tripleList, neighborhood, outgoingLength, shape.extra || [])

    const xp = crossProduct(tripleList.constraintList, NoTripleConstraint);
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
      const extendsToTriples = _seq((shape.extends || []).length).map(() => []);
      t2tcForThisShapeAndExtends.forEach((cNo, tNo) => {
        if (cNo !== NoTripleConstraint && cNo < extendedTCs.length) {
          const extNo = extendedTCs[cNo].extendsNo;
          extendsToTriples[extNo].push(neighborhood[tNo]);
          tripleToExtends[tNo] = cNo;
          t2tcForThisShape[tNo] = NoTripleConstraint;
        } else {
          tripleToExtends[tNo] = NoExtends;
          t2tcForThisShape[tNo] = cNo;
        }
      });

      // Triples not mapped to triple constraints are not allowed in closed shapes.
      if (shape.closed) {
        const unexpectedTriples = neighborhood.slice(0, outgoingLength).filter((t, i) => {
          return t2tcForThisShape[i] === NoTripleConstraint && // didn't match a constraint
            tripleToExtends[i] === NoExtends && // didn't match an EXTENDS
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
        if (tpNumber !== NoTripleConstraint) {
          usedTriples.push(neighborhood[ord]);
          ++constraintMatchCount[tpNumber];
        }
      });
      const tc2t = _constraintToTriples(t2tcForThisShape, constraintList, tripleList); // e.g. [[t0, t2], [t1, t3]]

      let results = testExtends(shape, point, extendsToTriples, valParms, matchTarget);
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

  function matchByPredicate (constraintList, neighborhood, outgoingLength, point, valParms, matchTarget) {
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
        matchPredicate, constraint, valParms, matchTarget
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
        if (cNo !== NoTripleConstraint)
          ret[cNo].push({tNo: tNo, res: tripleList.results[cNo][tNo]});
        return ret;
      }, _seq(constraintList.length).map(() => [])); // [length][]
  }

  function testExtends (expr, point, extendsToTriples, valParms, matchTarget) {
    if (!("extends" in expr))
      return null;
    const passes = [];
    const errors = [];
    for (let eNo = 0; eNo < expr.extends.length; ++eNo) {
      const extend = expr.extends[eNo];
      const subgraph = makeTriplesDB(null); // These triples were tracked earlier.
      extendsToTriples[eNo].forEach(t => subgraph.addOutgoingTriples([t]));
      const sub = _ShExValidator._validateShapeExpr(point, extend, valParms.shapeLabel, valParms.depth, valParms.tracker, valParms.seen, matchTarget, subgraph);
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

  /** Directly construct a DB from triples.
   * TODO: should this be in @shexjs/neighborhood-something ?
   */
  function makeTriplesDB (queryTracker) { // implements ValidatorNeighborhood
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
      const visitor = ShExVisitor();
      let outerMin = 1;
      let outerMax = 1;
      const oldVisitOneOf = visitor.visitOneOf;

      // Override visitShapeRef to follow references.
      // tests: Extend3G-pass, vitals-RESTRICTS-pass_lie-Vital...
      visitor.visitShapeRef = function (inclusion) {
        return visitor.visitShapeDecl(_ShExValidator._lookupShape(inclusion));
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

  this._triplesMatchingShapeExpr = function (triples, constraint, valParms, matchTarget) {
    const _ShExValidator = this;
    const misses = [];
    const hits = [];
    triples.forEach(function (triple) {
      const value = constraint.inverse ? triple.subject : triple.object;
      let sub;
      const oldBindings = JSON.parse(JSON.stringify(_ShExValidator.semActHandler.results));
      const errors = constraint.valueExpr === undefined ?
          undefined :
          (sub = _ShExValidator._errorsMatchingShapeExpr(value, constraint.valueExpr, valParms, matchTarget)).errors;
      if (!errors) {
        hits.push({triple: triple, sub: sub});
      } else if (hits.indexOf(triple) === -1) {
        _ShExValidator.semActHandler.results = JSON.parse(JSON.stringify(oldBindings));
        misses.push({triple: triple, errors: sub});
      }
    });
    return { hits: hits, misses: misses };
  }
  this._errorsMatchingShapeExpr = function (value, valueExpr, valParms, matchTarget, subgraph) {
    const _ShExValidator = this;
    if (typeof valueExpr === "string") { // ShapeRef
      return _ShExValidator.validate(value, valueExpr, valParms.tracker, valParms.seen, matchTarget, subgraph);
    } else if (valueExpr.type === "NodeConstraint") {
      return this._errorsMatchingNodeConstraint(value, valueExpr, null);
    } else if (valueExpr.type === "Shape") {
      return _ShExValidator._validateShapeExpr(value, valueExpr, valParms.shapeLabel, valParms.depth, valParms.tracker, valParms.seen, matchTarget, subgraph)
    } else if (valueExpr.type === "ShapeOr") {
      const errors = [];
      for (let i = 0; i < valueExpr.shapeExprs.length; ++i) {
        const nested = valueExpr.shapeExprs[i];
        const sub = _ShExValidator._errorsMatchingShapeExpr(value, nested, valParms, matchTarget, subgraph);
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
        const sub = _ShExValidator._errorsMatchingShapeExpr(value, nested, valParms, matchTarget, subgraph);
        if ("errors" in sub)
          return { type: "ShapeAndFailure", errors: [sub] };
        else
          passes.push(sub);
      }
      return { type: "ShapeAndResults", solutions: passes };
    } else if (valueExpr.type === "ShapeNot") {
      const sub = _ShExValidator._errorsMatchingShapeExpr(value, valueExpr.shapeExpr, valParms, matchTarget, subgraph);
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
                            ["id", "inverse", "negated", "predicate", "valueExpr",
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
  r.visitAbstract = r.visitInverse = r.visitNegated = r.visitPredicate = r._visitValue;
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
ShExVisitor.index = function (schema) {
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
  module.exports = ShExVisitor;



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
/******/ 	var __webpack_exports__ = __webpack_require__(9709);
/******/ 	
/******/ })()
;