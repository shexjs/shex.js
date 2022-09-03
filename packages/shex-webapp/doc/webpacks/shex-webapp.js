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

        else if (expr.type === "ValueComparison") {
          s = State_make(expr, []);
          states[s].stack = stack;
          return {start: s, tail: [s]};
        }

        else if (expr.type === "Unique") {
          s = State_make(expr, []);
          states[s].stack = stack;
          return {start: s, tail: [s]};
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
      function dumpValueComparison (cmp) {
        return "(" + cmp.left + " " + cmp.comparator + " " + cmp.right + ")";
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
              s.c.type === "TripleConstraint" ? dumpTripleConstraint(s.c) :
              s.c.type === "ValueComparison" ? dumpValueComparison(s.c) :
              "<unknown type:" + s.c.type + ">"
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

    function rbenx_match (graph, node, constraintList, constraintToTripleMapping, tripleToConstraintMapping, neighborhood, semActHandler, trace, uniques) {
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
            if (trace)
              trace[trace.length-1].threads.push({
                state: clist[threadno].state,
                to:nlist.slice(nlistlen).map(x => {
                  return stateString(x.state, x.repeats);
                })
              });
          } else if (state.c.type === "ValueComparison") {
            var lefts  = resolveAccessor(thread.matched, state.c.left);
            var rights = resolveAccessor(thread.matched, state.c.right);
            var errors = [];
            lefts.forEach(left => {
              rights.forEach(right => {
                function test (passed) {
                  if (!passed)
                    errors.push({
                      type: "ValueComparisonFailure",
                      comparator: state.c.comparator,
                      left: left,
                      right: right
                    });
                }
                switch (state.c.comparator) {
                case ">" : test(left >  right); break;
                case "<" : test(left <  right); break;
                case "==": test(left == right); break;
                case "!=": test(left != right); break;
                default: throw Error("unknown value comparator: " + state.c.comparator);
                }
              });
            });
            if (errors.length === 0)
              state.outs.forEach(o => { // single out if NFA includes epsilons
                addstate(rbenx, nlist, o, thread);
              });
          } else if (state.c.type === "Unique") {
            var keys =
              (state.c.focus ? [node] : []).concat(
                state.c.uniques.reduce((ret, u) => {
                  return ret.concat(resolveAccessor(thread.matched, u));
                }, [])
              );
            var errors = [];
            var already = uniques[keys.join(" ")];
            if (already && already !== node)
              errors.push({type:"UniqueViolation", keys: keys, node: node, conflictsWith: already});
            else
              uniques[keys.join(" ")] = node;
            if (errors.length === 0)
              state.outs.forEach(o => { // single out if NFA includes epsilons
                addstate(rbenx, nlist, o, thread);
              });
          } else {
            throw Error("unknown match type " + state.c.type);
          }
          function resolveAccessor (matched, accessor) {
            return matched.reduce((ret, m) => {
              return m.c.id === accessor.productionLabel ? ret.concat(m.triples.map(t => {
                var triple = neighborhood[t];
                var node = m.inverse ? triple.subject : triple.object;
                switch (accessor.type) {
                case "TermAccessor":
                  return ShExTerm.isLiteral(node) ? ShExTerm.getLiteralValue(node) :
                    ShExTerm.isBlank(node) ? node.substr(2) :
                    node ;
                case "LangtagAccessor":
                  return ShExTerm.isLiteral(node) ? ShExTerm.getLiteralLanguage(node) : "";
                case "DatatypeAccessor":
                  return ShExTerm.isLiteral(node) ? ShExTerm.getLiteralType(node) : "";
                default:
                  throw Error("unknown accessor type:", accessor.type);
                }
              })) : ret;
            }, []);
          }
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
            valueExpr = c.valueExpr
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

            if (c.type === "ValueComparison")
              return acc.concat([extend({
                type: "ValueComparisonFailure",
                left: c.left, comparator: c.comparator, right: c.right
              }, valueExpr ? { valueExpr: valueExpr } : {})]);
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

    function match (graph, node, constraintList, constraintToTripleMapping, tripleToConstraintMapping, neighborhood, semActHandler, trace, uniques) {

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
                  object: ldify(t.object),
                  // These should be in a neighboring object.
                  tripleNo: tripleNo,
                  constraintNo: constraintNo // !! improv
                };
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

        else if (expr.type === "ValueComparison") {
          var lefts  = resolveAccessor(thread.solution, expr.left);
          var rights = resolveAccessor(thread.solution, expr.right);
          var errors = [];
          lefts.forEach(left => {
            rights.forEach(right => {
              function test (passed) {
                if (!passed)
                  errors.push({
                    type: "ValueComparisonFailure",
                    comparator: expr.comparator,
                    left: left,
                    right: right
                  });
              }
              switch (expr.comparator) {
              case ">" : test(left >  right); break;
              case "<" : test(left <  right); break;
              case "==": test(left == right); break;
              case "!=": test(left != right); break;
              default: throw Error("unknown value comparator: " + expr.comparator);
              }
            });
          });
          return [{
            avail:thread.avail,
            errors:thread.errors.concat(errors),
            matched:thread.matched
          }];
        }

        else if (expr.type === "Unique") {
          var keys =
              (expr.focus ? [node] : []).concat(
                expr.uniques.reduce((ret, u) => {
                  return ret.concat(resolveAccessor(thread.solution, u));
                }, [])
              );
          console.warn(keys);
          var errors = [];
          var already = uniques[keys.join(" ")];
          if (already !== node)
            errors.push({type:"UniqueViolation", keys: keys, node: node, conflictsWith: already});
          else
            uniques[keys.join(" ")] = node;
          return [{
            avail:thread.avail,
            errors:thread.errors.concat(errors),
            matched:thread.matched
          }];
          var ret = [{"avail":thread.avail,"errors":thread.errors,"matched":thread.matched,"expression":{ type: "UniqueSolution", expression:expr }}];
//          var ret = [{"avail":thread.avail,"errors":thread.errors.concat([{"type":"UniqueFailure","comparison":expr}]),"matched":thread.matched}]
          console.log(JSON.stringify(ret));
          return ret;
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

        function resolveAccessor (solution, accessor) {
          return solution.expressions.reduce((ret, o) => {
            return "productionLabel" in o && o.productionLabel === accessor.productionLabel ? ret.concat(o.solutions.map(s => {
              var triple = neighborhood[s.tripleNo];
              var node = constraintList[s.constraintNo].inverse ? triple.subject : triple.object;
	      switch (accessor.type) {
	      case "TermAccessor":
		return ShExTerm.isLiteral(node) ? ShExTerm.getLiteralValue(node) :
		  ShExTerm.isBlank(node) ? node.substr(2) :
		  node ;
	      case "LangtagAccessor":
		return ShExTerm.isLiteral(node) ? ShExTerm.getLiteralLanguage(node) : "";
	      case "DatatypeAccessor":
		return ShExTerm.isLiteral(node) ? ShExTerm.getLiteralType(node) : "";
	      default:
		throw Error("unknown accessor type:", accessor.type);
              }
	    })) : ret;
	  }, [])
        }

        // serializers for debugging
        function threadMatched (th) {
          return JSON.stringify(th.matched.map(m => { return m.tNos; }));
        }
        function exprMatched (xp) {
          return JSON.stringify(
            xp.reduce((outer, e) => {
              return e.solutions.reduce((inner, s) => {
                inner[s.constraintNo] = inner[s.constraintNo] ?
                  inner[s.constraintNo].concat([s.tripleNo]) :
                  [s.tripleNo];
                return inner;
              }, outer);
            }, []));
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
            if (x.type === "TestedTriple") { // already done
              // These should be in a neighboring object.
              delete x.tripleNo;
              delete x.constraintNo;
              return x; // c.f. validation/3circularRef1_pass-open
            }
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

/***/ 1837:
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

const { JisonParser, o } = __webpack_require__(9041);const $V0=[7,18,19,20,21,23,26,36,208,230,231],$V1=[19,21,230,231],$V2=[2,27],$V3=[1,22],$V4=[1,23],$V5=[2,12],$V6=[2,13],$V7=[2,14],$V8=[7,18,19,20,21,23,26,36,230,231],$V9=[1,29],$Va=[1,32],$Vb=[1,31],$Vc=[2,18],$Vd=[2,19],$Ve=[1,38],$Vf=[1,42],$Vg=[1,41],$Vh=[1,40],$Vi=[1,44],$Vj=[1,47],$Vk=[1,46],$Vl=[2,15],$Vm=[2,17],$Vn=[2,280],$Vo=[2,281],$Vp=[2,282],$Vq=[2,283],$Vr=[19,21,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,163,204,230,242],$Vs=[2,62],$Vt=[1,65],$Vu=[19,21,40,44,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,163,181,204,230,242,244],$Vv=[2,29],$Vw=[2,258],$Vx=[2,259],$Vy=[2,284],$Vz=[208,210],$VA=[1,73],$VB=[1,76],$VC=[1,75],$VD=[2,16],$VE=[7,18,19,20,21,23,26,36,51,230,231],$VF=[2,48],$VG=[7,18,19,20,21,23,26,36,51,53,230,231],$VH=[2,55],$VI=[119,125,127,204,242],$VJ=[2,140],$VK=[1,111],$VL=[1,119],$VM=[1,93],$VN=[1,101],$VO=[1,102],$VP=[1,103],$VQ=[1,110],$VR=[1,115],$VS=[1,116],$VT=[1,117],$VU=[1,120],$VV=[1,121],$VW=[1,122],$VX=[1,123],$VY=[1,124],$VZ=[1,125],$V_=[1,106],$V$=[1,118],$V01=[2,63],$V11=[19,21,69,71,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,163,204,230,242],$V21=[1,138],$V31=[1,137],$V41=[2,249],$V51=[2,250],$V61=[2,251],$V71=[2,20],$V81=[1,145],$V91=[2,54],$Va1=[1,147],$Vb1=[2,61],$Vc1=[2,70],$Vd1=[1,153],$Ve1=[1,154],$Vf1=[1,155],$Vg1=[2,66],$Vh1=[2,72],$Vi1=[1,162],$Vj1=[1,163],$Vk1=[1,164],$Vl1=[1,167],$Vm1=[1,170],$Vn1=[1,172],$Vo1=[1,173],$Vp1=[1,174],$Vq1=[2,69],$Vr1=[7,18,19,20,21,23,26,36,51,53,79,80,81,119,125,127,204,205,208,230,231,242],$Vs1=[2,96],$Vt1=[7,18,19,20,21,23,26,36,51,53,205,208,230,231],$Vu1=[7,18,19,20,21,23,26,36,51,53,96,97,98,101,102,103,104,230,231],$Vv1=[2,88],$Vw1=[2,89],$Vx1=[7,18,19,20,21,23,26,36,51,53,79,80,81,101,102,103,104,119,125,127,204,205,208,230,231,242],$Vy1=[2,109],$Vz1=[2,108],$VA1=[7,18,19,20,21,23,26,36,51,53,101,102,103,104,112,113,114,115,116,117,205,208,230,231],$VB1=[2,103],$VC1=[2,102],$VD1=[7,18,19,20,21,23,26,36,51,53,96,97,98,101,102,103,104,205,208,230,231],$VE1=[2,92],$VF1=[2,93],$VG1=[2,113],$VH1=[2,114],$VI1=[2,115],$VJ1=[2,111],$VK1=[2,257],$VL1=[19,21,71,81,100,108,109,165,187,219,220,221,222,223,224,225,226,227,228,230],$VM1=[2,188],$VN1=[7,18,19,20,21,23,26,36,51,53,112,113,114,115,116,117,205,208,230,231],$VO1=[2,105],$VP1=[1,197],$VQ1=[1,199],$VR1=[1,201],$VS1=[1,200],$VT1=[2,119],$VU1=[1,208],$VV1=[1,209],$VW1=[1,210],$VX1=[1,211],$VY1=[100,108,109,221,222,223,224],$VZ1=[2,26],$V_1=[2,31],$V$1=[2,32],$V02=[2,33],$V12=[79,80,81,119,125,127,204,242],$V22=[1,273],$V32=[1,278],$V42=[1,255],$V52=[1,263],$V62=[1,264],$V72=[1,265],$V82=[1,272],$V92=[1,268],$Va2=[1,277],$Vb2=[2,49],$Vc2=[2,56],$Vd2=[2,65],$Ve2=[2,71],$Vf2=[2,67],$Vg2=[2,73],$Vh2=[7,18,19,20,21,23,26,36,51,53,101,102,103,104,205,208,230,231],$Vi2=[1,332],$Vj2=[1,340],$Vk2=[1,341],$Vl2=[1,342],$Vm2=[1,348],$Vn2=[1,349],$Vo2=[51,53],$Vp2=[7,18,19,20,21,23,26,36,51,53,79,80,81,119,125,127,204,208,230,231,242],$Vq2=[2,247],$Vr2=[7,18,19,20,21,23,26,36,51,53,208,230,231],$Vs2=[1,365],$Vt2=[2,107],$Vu2=[2,112],$Vv2=[2,99],$Vw2=[1,371],$Vx2=[2,100],$Vy2=[2,101],$Vz2=[2,106],$VA2=[7,18,19,20,21,23,26,36,51,53,96,97,98,101,102,103,104,208,230,231],$VB2=[2,94],$VC2=[1,388],$VD2=[1,394],$VE2=[1,383],$VF2=[1,387],$VG2=[1,397],$VH2=[1,398],$VI2=[1,399],$VJ2=[1,386],$VK2=[1,400],$VL2=[1,401],$VM2=[1,406],$VN2=[1,407],$VO2=[1,408],$VP2=[1,409],$VQ2=[1,402],$VR2=[1,403],$VS2=[1,404],$VT2=[1,405],$VU2=[1,393],$VV2=[19,21,69,161,162,214,230],$VW2=[2,169],$VX2=[2,142],$VY2=[1,425],$VZ2=[1,422],$V_2=[1,426],$V$2=[1,427],$V03=[1,424],$V13=[1,437],$V23=[1,440],$V33=[1,436],$V43=[1,439],$V53=[19,21,44,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,163,204,230,242],$V63=[2,118],$V73=[2,123],$V83=[2,125],$V93=[2,126],$Va3=[2,127],$Vb3=[2,272],$Vc3=[2,273],$Vd3=[2,274],$Ve3=[2,275],$Vf3=[2,124],$Vg3=[2,36],$Vh3=[2,40],$Vi3=[2,43],$Vj3=[2,46],$Vk3=[19,21,40,44,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,163,181,204,205,208,230,242,244],$Vl3=[2,37],$Vm3=[2,75],$Vn3=[2,78],$Vo3=[1,462],$Vp3=[1,464],$Vq3=[1,470],$Vr3=[1,471],$Vs3=[1,472],$Vt3=[1,479],$Vu3=[1,480],$Vv3=[1,481],$Vw3=[1,484],$Vx3=[2,42],$Vy3=[1,562],$Vz3=[2,45],$VA3=[1,598],$VB3=[2,68],$VC3=[51,53,70],$VD3=[1,627],$VE3=[51,53,70,79,80,81,119,125,127,204,205,208,242],$VF3=[51,53,70,205,208],$VG3=[51,53,70,96,97,98,101,102,103,104,205,208],$VH3=[51,53,70,79,80,81,101,102,103,104,119,125,127,204,205,208,242],$VI3=[51,53,70,101,102,103,104,112,113,114,115,116,117,205,208],$VJ3=[51,53,70,112,113,114,115,116,117,205,208],$VK3=[51,70],$VL3=[7,18,19,20,21,23,26,36,51,53,79,80,81,119,125,127,204,230,231,242],$VM3=[2,98],$VN3=[2,97],$VO3=[2,246],$VP3=[1,669],$VQ3=[1,672],$VR3=[1,668],$VS3=[1,671],$VT3=[2,95],$VU3=[2,110],$VV3=[2,104],$VW3=[2,116],$VX3=[2,117],$VY3=[2,135],$VZ3=[2,187],$V_3=[1,702],$V$3=[19,21,71,81,100,108,109,165,180,187,219,220,221,222,223,224,225,226,227,228,230],$V04=[2,252],$V14=[2,253],$V24=[2,254],$V34=[2,265],$V44=[2,268],$V54=[2,262],$V64=[2,263],$V74=[2,264],$V84=[2,270],$V94=[2,271],$Va4=[2,276],$Vb4=[2,277],$Vc4=[2,278],$Vd4=[2,279],$Ve4=[19,21,71,81,100,108,109,111,165,180,187,219,220,221,222,223,224,225,226,227,228,230],$Vf4=[2,147],$Vg4=[2,148],$Vh4=[1,710],$Vi4=[2,149],$Vj4=[121,135],$Vk4=[2,154],$Vl4=[2,155],$Vm4=[2,157],$Vn4=[1,713],$Vo4=[1,714],$Vp4=[19,21,214,230],$Vq4=[2,177],$Vr4=[1,722],$Vs4=[1,723],$Vt4=[121,135,140,141],$Vu4=[2,166],$Vv4=[2,167],$Vw4=[1,727],$Vx4=[1,726],$Vy4=[1,728],$Vz4=[1,729],$VA4=[1,733],$VB4=[1,737],$VC4=[1,736],$VD4=[1,735],$VE4=[51,119,125,127,204,242],$VF4=[51,53,119,125,127,204,242],$VG4=[2,293],$VH4=[1,764],$VI4=[1,765],$VJ4=[1,766],$VK4=[1,776],$VL4=[19,21,119,125,127,204,214,230,242],$VM4=[2,255],$VN4=[2,256],$VO4=[2,44],$VP4=[2,41],$VQ4=[2,47],$VR4=[19,21,40,44,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,163,181,204,208,230,242,244],$VS4=[2,34],$VT4=[2,38],$VU4=[2,74],$VV4=[2,76],$VW4=[2,35],$VX4=[1,823],$VY4=[1,829],$VZ4=[1,869],$V_4=[1,916],$V$4=[51,53,70,101,102,103,104,205,208],$V05=[51,53,70,79,80,81,119,125,127,204,208,242],$V15=[51,53,70,208],$V25=[1,959],$V35=[51,53,70,96,97,98,101,102,103,104,208],$V45=[1,969],$V55=[1,1006],$V65=[1,1042],$V75=[2,248],$V85=[1,1053],$V95=[1,1059],$Va5=[1,1058],$Vb5=[19,21,100,108,109,219,220,221,222,223,224,225,226,227,228,230],$Vc5=[1,1079],$Vd5=[1,1085],$Ve5=[1,1084],$Vf5=[1,1106],$Vg5=[1,1112],$Vh5=[1,1111],$Vi5=[1,1129],$Vj5=[1,1131],$Vk5=[1,1133],$Vl5=[19,21,71,81,100,108,109,165,181,187,219,220,221,222,223,224,225,226,227,228,230],$Vm5=[1,1137],$Vn5=[1,1143],$Vo5=[1,1146],$Vp5=[1,1147],$Vq5=[1,1148],$Vr5=[1,1136],$Vs5=[1,1149],$Vt5=[1,1150],$Vu5=[1,1155],$Vv5=[1,1156],$Vw5=[1,1157],$Vx5=[1,1158],$Vy5=[1,1151],$Vz5=[1,1152],$VA5=[1,1153],$VB5=[1,1154],$VC5=[1,1142],$VD5=[2,266],$VE5=[2,269],$VF5=[2,136],$VG5=[2,150],$VH5=[2,152],$VI5=[2,156],$VJ5=[2,158],$VK5=[2,159],$VL5=[2,163],$VM5=[2,165],$VN5=[2,171],$VO5=[2,172],$VP5=[1,1173],$VQ5=[1,1176],$VR5=[1,1172],$VS5=[1,1175],$VT5=[1,1187],$VU5=[1,1189],$VV5=[149,202,203],$VW5=[2,230],$VX5=[1,1194],$VY5=[2,242],$VZ5=[2,260],$V_5=[2,261],$V$5=[2,239],$V06=[19,21,27,69,161,162,199,200,201,214,230],$V16=[2,291],$V26=[2,295],$V36=[2,297],$V46=[2,86],$V56=[1,1221],$V66=[2,300],$V76=[79,80,81,101,102,103,104,119,125,127,204,242],$V86=[51,53,101,102,103,104,112,113,114,115,116,117,119,125,127,204,242],$V96=[51,53,96,97,98,101,102,103,104,119,125,127,204,242],$Va6=[2,90],$Vb6=[2,91],$Vc6=[51,53,112,113,114,115,116,117,119,125,127,204,242],$Vd6=[2,128],$Ve6=[2,77],$Vf6=[1,1280],$Vg6=[1,1316],$Vh6=[1,1375],$Vi6=[1,1381],$Vj6=[1,1413],$Vk6=[1,1419],$Vl6=[51,53,70,79,80,81,119,125,127,204,242],$Vm6=[51,53,70,96,97,98,101,102,103,104],$Vn6=[1,1477],$Vo6=[1,1524],$Vp6=[2,243],$Vq6=[2,244],$Vr6=[2,245],$Vs6=[7,18,19,20,21,23,26,36,51,53,79,80,81,111,119,125,127,204,205,208,230,231,242],$Vt6=[7,18,19,20,21,23,26,36,51,53,111,205,208,230,231],$Vu6=[7,18,19,20,21,23,26,36,51,53,96,97,98,101,102,103,104,111,205,208,230,231],$Vv6=[2,210],$Vw6=[1,1577],$Vx6=[19,21,71,81,100,108,109,165,180,181,187,219,220,221,222,223,224,225,226,227,228,230],$Vy6=[19,21,71,81,100,108,109,111,165,180,181,187,219,220,221,222,223,224,225,226,227,228,230],$Vz6=[2,267],$VA6=[2,153],$VB6=[2,151],$VC6=[2,160],$VD6=[2,164],$VE6=[2,161],$VF6=[2,162],$VG6=[1,1594],$VH6=[70,135],$VI6=[1,1597],$VJ6=[1,1598],$VK6=[70,135,140,141],$VL6=[1,1610],$VM6=[1,1614],$VN6=[1,1613],$VO6=[1,1612],$VP6=[1,1616],$VQ6=[1,1617],$VR6=[1,1618],$VS6=[2,228],$VT6=[1,1626],$VU6=[1,1630],$VV6=[1,1629],$VW6=[1,1628],$VX6=[2,294],$VY6=[2,296],$VZ6=[2,298],$V_6=[2,87],$V$6=[51,53,101,102,103,104,119,125,127,204,242],$V07=[1,1655],$V17=[1,1665],$V27=[1,1671],$V37=[1,1670],$V47=[1,1708],$V57=[1,1755],$V67=[1,1788],$V77=[1,1794],$V87=[1,1793],$V97=[1,1814],$Va7=[1,1820],$Vb7=[1,1819],$Vc7=[1,1841],$Vd7=[1,1847],$Ve7=[1,1846],$Vf7=[1,1892],$Vg7=[1,1958],$Vh7=[1,1964],$Vi7=[1,1963],$Vj7=[1,1984],$Vk7=[1,1990],$Vl7=[1,1989],$Vm7=[1,2010],$Vn7=[1,2016],$Vo7=[1,2015],$Vp7=[1,2057],$Vq7=[1,2063],$Vr7=[1,2095],$Vs7=[1,2101],$Vt7=[121,135,140,141,205,208],$Vu7=[2,174],$Vv7=[1,2121],$Vw7=[1,2122],$Vx7=[1,2123],$Vy7=[1,2124],$Vz7=[121,135,140,141,157,158,159,160,205,208],$VA7=[2,39],$VB7=[51,121,135,140,141,157,158,159,160,205,208],$VC7=[2,52],$VD7=[51,53,121,135,140,141,157,158,159,160,205,208],$VE7=[2,59],$VF7=[1,2153],$VG7=[70,140],$VH7=[2,233],$VI7=[2,292],$VJ7=[2,299],$VK7=[19,21,40,44,69,71,79,80,81,85,96,97,98,101,102,103,104,111,112,113,114,115,116,117,119,125,127,163,181,204,205,208,230,242,244],$VL7=[1,2286],$VM7=[1,2292],$VN7=[1,2324],$VO7=[1,2330],$VP7=[1,2383],$VQ7=[1,2416],$VR7=[1,2422],$VS7=[1,2421],$VT7=[1,2442],$VU7=[1,2448],$VV7=[1,2447],$VW7=[1,2469],$VX7=[1,2475],$VY7=[1,2474],$VZ7=[1,2496],$V_7=[1,2502],$V$7=[1,2501],$V08=[1,2522],$V18=[1,2528],$V28=[1,2527],$V38=[1,2549],$V48=[1,2555],$V58=[1,2554],$V68=[51,53,70,79,80,81,111,119,125,127,204,205,208,242],$V78=[51,53,70,111,205,208],$V88=[51,53,70,96,97,98,101,102,103,104,111,205,208],$V98=[1,2624],$Va8=[2,175],$Vb8=[2,179],$Vc8=[2,180],$Vd8=[2,181],$Ve8=[2,182],$Vf8=[2,50],$Vg8=[2,57],$Vh8=[2,64],$Vi8=[2,84],$Vj8=[2,80],$Vk8=[1,2707],$Vl8=[2,83],$Vm8=[51,53,79,80,81,101,102,103,104,119,121,125,127,135,140,141,157,158,159,160,204,205,208,242],$Vn8=[51,53,79,80,81,119,121,125,127,135,140,141,157,158,159,160,204,205,208,242],$Vo8=[51,53,101,102,103,104,112,113,114,115,116,117,121,135,140,141,157,158,159,160,205,208],$Vp8=[51,53,96,97,98,101,102,103,104,121,135,140,141,157,158,159,160,205,208],$Vq8=[51,53,112,113,114,115,116,117,121,135,140,141,157,158,159,160,205,208],$Vr8=[1,2745],$Vs8=[27,199,200,201],$Vt8=[2,240],$Vu8=[2,241],$Vv8=[1,2768],$Vw8=[1,2806],$Vx8=[1,2861],$Vy8=[1,2950],$Vz8=[1,2956],$VA8=[1,3039],$VB8=[1,3072],$VC8=[1,3078],$VD8=[1,3077],$VE8=[1,3098],$VF8=[1,3104],$VG8=[1,3103],$VH8=[1,3125],$VI8=[1,3131],$VJ8=[1,3130],$VK8=[1,3152],$VL8=[1,3158],$VM8=[1,3157],$VN8=[1,3178],$VO8=[1,3184],$VP8=[1,3183],$VQ8=[1,3205],$VR8=[1,3211],$VS8=[1,3210],$VT8=[121,135,140,141,208],$VU8=[1,3230],$VV8=[2,53],$VW8=[2,60],$VX8=[2,79],$VY8=[2,85],$VZ8=[2,81],$V_8=[51,53,101,102,103,104,121,135,140,141,157,158,159,160,205,208],$V$8=[1,3254],$V09=[70,135,140,141,205,208],$V19=[1,3263],$V29=[1,3264],$V39=[1,3265],$V49=[1,3266],$V59=[70,135,140,141,157,158,159,160,205,208],$V69=[51,70,135,140,141,157,158,159,160,205,208],$V79=[51,53,70,135,140,141,157,158,159,160,205,208],$V89=[1,3295],$V99=[2,227],$Va9=[1,3333],$Vb9=[1,3356],$Vc9=[1,3387],$Vd9=[1,3420],$Ve9=[1,3426],$Vf9=[1,3425],$Vg9=[1,3446],$Vh9=[1,3452],$Vi9=[1,3451],$Vj9=[1,3473],$Vk9=[1,3479],$Vl9=[1,3478],$Vm9=[1,3500],$Vn9=[1,3506],$Vo9=[1,3505],$Vp9=[1,3526],$Vq9=[1,3532],$Vr9=[1,3531],$Vs9=[1,3553],$Vt9=[1,3559],$Vu9=[1,3558],$Vv9=[1,3636],$Vw9=[1,3642],$Vx9=[2,176],$Vy9=[2,51],$Vz9=[1,3730],$VA9=[2,58],$VB9=[1,3763],$VC9=[2,82],$VD9=[2,173],$VE9=[1,3808],$VF9=[51,53,70,79,80,81,101,102,103,104,119,125,127,135,140,141,157,158,159,160,204,205,208,242],$VG9=[51,53,70,79,80,81,119,125,127,135,140,141,157,158,159,160,204,205,208,242],$VH9=[51,53,70,101,102,103,104,112,113,114,115,116,117,135,140,141,157,158,159,160,205,208],$VI9=[51,53,70,96,97,98,101,102,103,104,135,140,141,157,158,159,160,205,208],$VJ9=[51,53,70,112,113,114,115,116,117,135,140,141,157,158,159,160,205,208],$VK9=[1,3928],$VL9=[1,3934],$VM9=[1,3997],$VN9=[1,4003],$VO9=[1,4002],$VP9=[1,4023],$VQ9=[1,4029],$VR9=[1,4028],$VS9=[1,4050],$VT9=[1,4056],$VU9=[1,4055],$VV9=[1,4115],$VW9=[1,4121],$VX9=[1,4120],$VY9=[1,4156],$VZ9=[1,4198],$V_9=[70,135,140,141,208],$V$9=[1,4228],$V0a=[51,53,70,101,102,103,104,135,140,141,157,158,159,160,205,208],$V1a=[1,4252],$V2a=[1,4279],$V3a=[1,4373],$V4a=[1,4379],$V5a=[1,4378],$V6a=[1,4399],$V7a=[1,4405],$V8a=[1,4404],$V9a=[1,4426],$Vaa=[1,4432],$Vba=[1,4431],$Vca=[111,121,135,140,141,205,208],$Vda=[1,4474],$Vea=[1,4498],$Vfa=[1,4540],$Vga=[1,4573],$Vha=[1,4615],$Via=[1,4638],$Vja=[1,4644],$Vka=[1,4643],$Vla=[1,4664],$Vma=[1,4670],$Vna=[1,4669],$Voa=[1,4691],$Vpa=[1,4697],$Vqa=[1,4696],$Vra=[1,4771],$Vsa=[1,4814],$Vta=[1,4820],$Vua=[1,4819],$Vva=[1,4855],$Vwa=[1,4897],$Vxa=[1,4989],$Vya=[70,111,135,140,141,205,208],$Vza=[1,5044],$VAa=[1,5068],$VBa=[1,5106],$VCa=[1,5152],$VDa=[1,5230],$VEa=[1,5279];

class ShExJisonParser extends JisonParser {
    constructor(yy = {}, lexer = new ShExJisonLexer(yy)) {
        super(yy, lexer);
        this.symbols_ = {"error":2,"shexDoc":3,"initParser":4,"Qdirective_E_Star":5,"Q_O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C_E_Opt":6,"EOF":7,"directive":8,"O_QnotStartAction_E_Or_QstartActions_E_C":9,"notStartAction":10,"startActions":11,"Qstatement_E_Star":12,"statement":13,"O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C":14,"baseDecl":15,"prefixDecl":16,"importDecl":17,"IT_BASE":18,"IRIREF":19,"IT_PREFIX":20,"PNAME_NS":21,"iri":22,"IT_IMPORT":23,"start":24,"shapeExprDecl":25,"IT_start":26,"=":27,"shapeAnd":28,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Star":29,"QcodeDecl_E_Plus":30,"codeDecl":31,"QIT_ABSTRACT_E_Opt":32,"shapeExprLabel":33,"Qrestriction_E_Star":34,"O_QshapeExpression_E_Or_QshapeRef_E_Or_QIT_EXTERNAL_E_C":35,"IT_ABSTRACT":36,"restriction":37,"shapeExpression":38,"shapeRef":39,"IT_EXTERNAL":40,"QIT_NOT_E_Opt":41,"shapeAtomNoRef":42,"QshapeOr_E_Opt":43,"IT_NOT":44,"shapeOr":45,"inlineShapeExpression":46,"inlineShapeOr":47,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Plus":48,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Plus":49,"O_QIT_OR_E_S_QshapeAnd_E_C":50,"IT_OR":51,"O_QIT_AND_E_S_QshapeNot_E_C":52,"IT_AND":53,"shapeNot":54,"inlineShapeAnd":55,"Q_O_QIT_OR_E_S_QinlineShapeAnd_E_C_E_Star":56,"O_QIT_OR_E_S_QinlineShapeAnd_E_C":57,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Star":58,"inlineShapeNot":59,"Q_O_QIT_AND_E_S_QinlineShapeNot_E_C_E_Star":60,"O_QIT_AND_E_S_QinlineShapeNot_E_C":61,"shapeAtom":62,"inlineShapeAtom":63,"nonLitNodeConstraint":64,"QshapeOrRef_E_Opt":65,"litNodeConstraint":66,"shapeOrRef":67,"QnonLitNodeConstraint_E_Opt":68,"(":69,")":70,".":71,"shapeDefinition":72,"nonLitInlineNodeConstraint":73,"QinlineShapeOrRef_E_Opt":74,"litInlineNodeConstraint":75,"inlineShapeOrRef":76,"QnonLitInlineNodeConstraint_E_Opt":77,"inlineShapeDefinition":78,"ATPNAME_LN":79,"ATPNAME_NS":80,"@":81,"Qannotation_E_Star":82,"semanticActions":83,"annotation":84,"IT_LITERAL":85,"QxsFacet_E_Star":86,"datatype":87,"valueSet":88,"QnumericFacet_E_Plus":89,"xsFacet":90,"numericFacet":91,"nonLiteralKind":92,"QstringFacet_E_Star":93,"QstringFacet_E_Plus":94,"stringFacet":95,"IT_IRI":96,"IT_BNODE":97,"IT_NONLITERAL":98,"stringLength":99,"INTEGER":100,"REGEXP":101,"IT_LENGTH":102,"IT_MINLENGTH":103,"IT_MAXLENGTH":104,"numericRange":105,"rawNumeric":106,"numericLength":107,"DECIMAL":108,"DOUBLE":109,"string":110,"^^":111,"IT_MININCLUSIVE":112,"IT_MINEXCLUSIVE":113,"IT_MAXINCLUSIVE":114,"IT_MAXEXCLUSIVE":115,"IT_TOTALDIGITS":116,"IT_FRACTIONDIGITS":117,"Q_O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C_E_Star":118,"{":119,"QtripleExpression_E_Opt":120,"}":121,"O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C":122,"extension":123,"extraPropertySet":124,"IT_CLOSED":125,"tripleExpression":126,"IT_EXTRA":127,"Qpredicate_E_Plus":128,"predicate":129,"oneOfTripleExpr":130,"groupTripleExpr":131,"multiElementOneOf":132,"Q_O_QGT_PIPE_E_S_QgroupTripleExpr_E_C_E_Plus":133,"O_QGT_PIPE_E_S_QgroupTripleExpr_E_C":134,"|":135,"singleElementGroup":136,"multiElementGroup":137,"unaryTripleExpr":138,"QGT_SEMI_E_Opt":139,",":140,";":141,"Q_O_QGT_SEMI_E_S_QunaryTripleExpr_E_C_E_Plus":142,"O_QGT_SEMI_E_S_QunaryTripleExpr_E_C":143,"Q_O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C_E_Opt":144,"O_QtripleConstraint_E_Or_QbracketedTripleExpr_E_C":145,"valueConstraint":146,"include":147,"O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C":148,"$":149,"tripleExprLabel":150,"tripleConstraint":151,"bracketedTripleExpr":152,"Qcardinality_E_Opt":153,"cardinality":154,"QsenseFlags_E_Opt":155,"senseFlags":156,"*":157,"+":158,"?":159,"REPEAT_RANGE":160,"^":161,"!":162,"[":163,"QvalueSetValue_E_Star":164,"]":165,"valueSetValue":166,"iriRange":167,"literalRange":168,"languageRange":169,"O_QiriExclusion_E_Plus_Or_QliteralExclusion_E_Plus_Or_QlanguageExclusion_E_Plus_C":170,"QiriExclusion_E_Plus":171,"iriExclusion":172,"QliteralExclusion_E_Plus":173,"literalExclusion":174,"QlanguageExclusion_E_Plus":175,"languageExclusion":176,"Q_O_QGT_TILDE_E_S_QiriExclusion_E_Star_C_E_Opt":177,"QiriExclusion_E_Star":178,"O_QGT_TILDE_E_S_QiriExclusion_E_Star_C":179,"~":180,"-":181,"QGT_TILDE_E_Opt":182,"literal":183,"Q_O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C_E_Opt":184,"QliteralExclusion_E_Star":185,"O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C":186,"LANGTAG":187,"Q_O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C_E_Opt":188,"O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C":189,"QlanguageExclusion_E_Star":190,"IT_UNIQUE":191,"Q_O_QIT_FOCUS_E_S_QGT_COMMA_E_C_E_Opt":192,"accessor":193,"Q_O_QGT_COMMA_E_S_Qaccessor_E_C_E_Star":194,"O_QGT_LT_E_Or_QGT_EQUAL_E_Or_QGT_NEQUAL_E_Or_QGT_GT_E_C":195,"O_QIT_FOCUS_E_S_QGT_COMMA_E_C":196,"IT_FOCUS":197,"O_QGT_COMMA_E_S_Qaccessor_E_C":198,"<":199,"!=":200,">":201,"IT_LANGTAG":202,"IT_DATATYPE":203,"&":204,"//":205,"O_Qiri_E_Or_Qliteral_E_C":206,"QcodeDecl_E_Star":207,"%":208,"O_QCODE_E_Or_QGT_MODULO_E_C":209,"CODE":210,"rdfLiteral":211,"numericLiteral":212,"booleanLiteral":213,"a":214,"blankNode":215,"langString":216,"Q_O_QGT_DTYPE_E_S_Qdatatype_E_C_E_Opt":217,"O_QGT_DTYPE_E_S_Qdatatype_E_C":218,"IT_true":219,"IT_false":220,"STRING_LITERAL1":221,"STRING_LITERAL_LONG1":222,"STRING_LITERAL2":223,"STRING_LITERAL_LONG2":224,"LANG_STRING_LITERAL1":225,"LANG_STRING_LITERAL_LONG1":226,"LANG_STRING_LITERAL2":227,"LANG_STRING_LITERAL_LONG2":228,"prefixedName":229,"PNAME_LN":230,"BLANK_NODE_LABEL":231,"O_QIT_EXTENDS_E_Or_QGT_AMP_E_C":232,"extendsShapeExpression":233,"extendsShapeOr":234,"extendsShapeAnd":235,"Q_O_QIT_OR_E_S_QextendsShapeAnd_E_C_E_Star":236,"O_QIT_OR_E_S_QextendsShapeAnd_E_C":237,"extendsShapeNot":238,"Q_O_QIT_AND_E_S_QextendsShapeNot_E_C_E_Star":239,"O_QIT_AND_E_S_QextendsShapeNot_E_C":240,"extendsShapeAtom":241,"IT_EXTENDS":242,"O_QIT_RESTRICTS_E_Or_QGT_MINUS_E_C":243,"IT_RESTRICTS":244,"$accept":0,"$end":1};
        this.terminals_ = {2:"error",7:"EOF",18:"IT_BASE",19:"IRIREF",20:"IT_PREFIX",21:"PNAME_NS",23:"IT_IMPORT",26:"IT_start",27:"=",36:"IT_ABSTRACT",40:"IT_EXTERNAL",44:"IT_NOT",51:"IT_OR",53:"IT_AND",69:"(",70:")",71:".",79:"ATPNAME_LN",80:"ATPNAME_NS",81:"@",85:"IT_LITERAL",96:"IT_IRI",97:"IT_BNODE",98:"IT_NONLITERAL",100:"INTEGER",101:"REGEXP",102:"IT_LENGTH",103:"IT_MINLENGTH",104:"IT_MAXLENGTH",108:"DECIMAL",109:"DOUBLE",111:"^^",112:"IT_MININCLUSIVE",113:"IT_MINEXCLUSIVE",114:"IT_MAXINCLUSIVE",115:"IT_MAXEXCLUSIVE",116:"IT_TOTALDIGITS",117:"IT_FRACTIONDIGITS",119:"{",121:"}",125:"IT_CLOSED",127:"IT_EXTRA",135:"|",140:",",141:";",149:"$",157:"*",158:"+",159:"?",160:"REPEAT_RANGE",161:"^",162:"!",163:"[",165:"]",180:"~",181:"-",187:"LANGTAG",191:"IT_UNIQUE",197:"IT_FOCUS",199:"<",200:"!=",201:">",202:"IT_LANGTAG",203:"IT_DATATYPE",204:"&",205:"//",208:"%",210:"CODE",214:"a",219:"IT_true",220:"IT_false",221:"STRING_LITERAL1",222:"STRING_LITERAL_LONG1",223:"STRING_LITERAL2",224:"STRING_LITERAL_LONG2",225:"LANG_STRING_LITERAL1",226:"LANG_STRING_LITERAL_LONG1",227:"LANG_STRING_LITERAL2",228:"LANG_STRING_LITERAL_LONG2",230:"PNAME_LN",231:"BLANK_NODE_LABEL",242:"IT_EXTENDS",244:"IT_RESTRICTS"};
        this.productions_ = [0,[3,4],[4,0],[5,0],[5,2],[9,1],[9,1],[12,0],[12,2],[14,2],[6,0],[6,1],[8,1],[8,1],[8,1],[15,2],[16,3],[17,2],[10,1],[10,1],[24,4],[11,1],[30,1],[30,2],[13,1],[13,1],[25,4],[32,0],[32,1],[34,0],[34,2],[35,1],[35,1],[35,1],[38,3],[38,3],[38,2],[43,0],[43,1],[46,1],[45,1],[45,2],[50,2],[48,1],[48,2],[52,2],[49,1],[49,2],[29,0],[29,2],[47,2],[57,2],[56,0],[56,2],[28,2],[58,0],[58,2],[55,2],[61,2],[60,0],[60,2],[54,2],[41,0],[41,1],[59,2],[62,2],[62,1],[62,2],[62,3],[62,1],[65,0],[65,1],[68,0],[68,1],[42,2],[42,1],[42,2],[42,3],[42,1],[63,2],[63,1],[63,2],[63,3],[63,1],[74,0],[74,1],[77,0],[77,1],[67,1],[67,1],[76,1],[76,1],[39,1],[39,1],[39,2],[66,3],[82,0],[82,2],[64,3],[75,2],[75,2],[75,2],[75,1],[86,0],[86,2],[89,1],[89,2],[73,2],[73,1],[93,0],[93,2],[94,1],[94,2],[92,1],[92,1],[92,1],[90,1],[90,1],[95,2],[95,1],[99,1],[99,1],[99,1],[91,2],[91,2],[106,1],[106,1],[106,1],[106,3],[105,1],[105,1],[105,1],[105,1],[107,1],[107,1],[72,3],[78,4],[122,1],[122,1],[122,1],[118,0],[118,2],[120,0],[120,1],[124,2],[128,1],[128,2],[126,1],[130,1],[130,1],[132,2],[134,2],[133,1],[133,2],[131,1],[131,1],[136,2],[139,0],[139,1],[139,1],[137,3],[143,2],[143,2],[142,1],[142,2],[138,2],[138,1],[138,1],[148,2],[144,0],[144,1],[145,1],[145,1],[152,6],[153,0],[153,1],[151,6],[155,0],[155,1],[154,1],[154,1],[154,1],[154,1],[156,1],[156,2],[156,1],[156,2],[88,3],[164,0],[164,2],[166,1],[166,1],[166,1],[166,2],[171,1],[171,2],[173,1],[173,2],[175,1],[175,2],[170,1],[170,1],[170,1],[167,2],[178,0],[178,2],[179,2],[177,0],[177,1],[172,3],[182,0],[182,1],[168,2],[185,0],[185,2],[186,2],[184,0],[184,1],[174,3],[169,2],[169,2],[190,0],[190,2],[189,2],[188,0],[188,1],[176,3],[146,6],[146,3],[196,2],[192,0],[192,1],[198,2],[194,0],[194,2],[195,1],[195,1],[195,1],[195,1],[193,2],[193,5],[193,5],[147,2],[84,3],[206,1],[206,1],[83,1],[207,0],[207,2],[31,3],[209,1],[209,1],[183,1],[183,1],[183,1],[129,1],[129,1],[87,1],[33,1],[33,1],[150,1],[150,1],[212,1],[212,1],[212,1],[211,1],[211,2],[218,2],[217,0],[217,1],[213,1],[213,1],[110,1],[110,1],[110,1],[110,1],[216,1],[216,1],[216,1],[216,1],[22,1],[22,1],[229,1],[229,1],[215,1],[123,2],[233,1],[234,2],[237,2],[236,0],[236,2],[235,2],[240,2],[239,0],[239,2],[238,2],[241,2],[241,1],[241,2],[241,3],[241,1],[232,1],[232,1],[37,2],[243,1],[243,1]];
        this.table = [o($V0,[2,2],{3:1,4:2}),{1:[3]},o($V0,[2,3],{5:3}),o($V1,$V2,{6:4,8:5,14:6,15:7,16:8,17:9,9:10,10:14,11:15,24:16,25:17,30:18,32:20,31:21,7:[2,10],18:[1,11],20:[1,12],23:[1,13],26:[1,19],36:$V3,208:$V4}),{7:[1,24]},o($V0,[2,4]),{7:[2,11]},o($V0,$V5),o($V0,$V6),o($V0,$V7),o($V8,[2,7],{12:25}),{19:[1,26]},{21:[1,27]},{19:$V9,21:$Va,22:28,229:30,230:$Vb},o($V8,[2,5]),o($V8,[2,6]),o($V8,$Vc),o($V8,$Vd),o($V8,[2,21],{31:33,208:$V4}),{27:[1,34]},{19:$Ve,21:$Vf,22:36,33:35,215:37,229:39,230:$Vg,231:$Vh},o($V0,[2,22]),o($V1,[2,28]),{19:$Vi,21:$Vj,22:43,229:45,230:$Vk},{1:[2,1]},o($V1,$V2,{13:48,8:49,10:50,15:51,16:52,17:53,24:54,25:55,32:60,7:[2,9],18:[1,56],20:[1,57],23:[1,58],26:[1,59],36:$V3}),o($V0,$Vl),{19:$V9,21:$Va,22:61,229:30,230:$Vb},o($V0,$Vm),o($V0,$Vn),o($V0,$Vo),o($V0,$Vp),o($V0,$Vq),o($V0,[2,23]),o($Vr,$Vs,{28:62,54:63,41:64,44:$Vt}),o($Vu,$Vv,{34:66}),o($Vu,$Vw),o($Vu,$Vx),o($Vu,$Vn),o($Vu,$Vo),o($Vu,$Vy),o($Vu,$Vp),o($Vu,$Vq),{208:[1,69],209:67,210:[1,68]},o($Vz,$Vn),o($Vz,$Vo),o($Vz,$Vp),o($Vz,$Vq),o($V8,[2,8]),o($V8,[2,24]),o($V8,[2,25]),o($V8,$V5),o($V8,$V6),o($V8,$V7),o($V8,$Vc),o($V8,$Vd),{19:[1,70]},{21:[1,71]},{19:$VA,21:$VB,22:72,229:74,230:$VC},{27:[1,77]},{19:$Ve,21:$Vf,22:36,33:78,215:37,229:39,230:$Vg,231:$Vh},o($V0,$VD),o($VE,$VF,{29:79}),o($VG,$VH,{58:80}),o($VI,$VJ,{62:81,64:82,66:83,67:84,73:87,75:88,72:89,39:90,92:91,94:92,87:94,88:95,89:96,78:97,95:104,22:105,91:107,118:108,99:109,229:112,105:113,107:114,19:$VK,21:$VL,69:[1,85],71:[1,86],79:[1,98],80:[1,99],81:[1,100],85:$VM,96:$VN,97:$VO,98:$VP,101:$VQ,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:$V_,230:$V$}),o($Vr,$V01),o($V11,$Vs,{35:126,37:127,38:128,39:129,243:131,41:132,40:[1,130],44:[1,133],79:[1,134],80:[1,135],81:[1,136],181:$V21,244:$V31}),o($V0,$V41),o($V0,$V51),o($V0,$V61),o($V8,$Vl),{19:$VA,21:$VB,22:139,229:74,230:$VC},o($V8,$Vm),o($V8,$Vn),o($V8,$Vo),o($V8,$Vp),o($V8,$Vq),o($Vr,$Vs,{28:140,54:141,41:142,44:$Vt}),o($Vu,$Vv,{34:143}),o($V8,$V71,{50:144,51:$V81}),o($VE,$V91,{52:146,53:$Va1}),o($VG,$Vb1),o($VG,$Vc1,{65:148,67:149,72:150,39:151,78:152,118:156,79:$Vd1,80:$Ve1,81:$Vf1,119:$VJ,125:$VJ,127:$VJ,204:$VJ,242:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:157,64:158,73:159,92:160,94:161,95:165,99:166,96:$Vi1,97:$Vj1,98:$Vk1,101:$Vl1,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{38:168,41:169,39:171,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:175}),o($Vt1,$Vs1,{82:176}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:177}),o($Vr1,$Vz1,{99:109,95:178,101:$VQ,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:179}),o($VA1,$VB1,{86:180}),o($VA1,$VB1,{86:181}),o($Vt1,$VC1,{105:113,107:114,91:182,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:183}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,187],21:[1,191],22:185,33:184,215:186,229:188,230:[1,190],231:[1,189]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{164:192}),o($VN1,$VO1),{119:[1,193],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},{100:[1,202]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,204],106:203,108:[1,205],109:[1,206],110:207,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,212]},{100:[2,120]},{100:[2,121]},{100:[2,122]},o($VA1,$Vp),o($VA1,$Vq),o($VY1,[2,129]),o($VY1,[2,130]),o($VY1,[2,131]),o($VY1,[2,132]),{100:[2,133]},{100:[2,134]},o($V8,$VZ1),o($Vu,[2,30]),o($V8,$V_1),o($V8,$V$1,{45:213,48:214,49:215,50:216,52:217,51:$V81,53:$Va1}),o($V8,$V02),o($VI,$VJ,{67:218,72:219,39:220,78:221,118:225,79:[1,222],80:[1,223],81:[1,224]}),o($VI,$VJ,{73:87,75:88,92:91,94:92,87:94,88:95,89:96,78:97,95:104,22:105,91:107,118:108,99:109,229:112,105:113,107:114,42:226,64:227,66:228,72:229,19:$VK,21:$VL,69:[1,230],71:[1,231],85:$VM,96:$VN,97:$VO,98:$VP,101:$VQ,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:$V_,230:$V$}),o($V11,$V01,{39:232,79:$Vd1,80:$Ve1,81:$Vf1}),o($VG,$VE1),o($VG,$VF1),{19:[1,236],21:[1,240],22:234,33:233,215:235,229:237,230:[1,239],231:[1,238]},o($V12,[2,304]),o($V12,[2,305]),o($V8,$VD),o($VE,$VF,{29:241}),o($VG,$VH,{58:242}),o($VI,$VJ,{62:243,64:244,66:245,67:246,73:249,75:250,72:251,39:252,92:253,94:254,87:256,88:257,89:258,78:259,95:266,22:267,91:269,118:270,99:271,229:274,105:275,107:276,19:$V22,21:$V32,69:[1,247],71:[1,248],79:[1,260],80:[1,261],81:[1,262],85:$V42,96:$V52,97:$V62,98:$V72,101:$V82,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:$V92,230:$Va2}),o($V11,$Vs,{37:127,243:131,35:279,38:280,39:281,41:283,40:[1,282],44:[1,284],79:[1,285],80:[1,286],81:[1,287],181:$V21,244:$V31}),o($VE,$Vb2),o($Vr,$Vs,{28:288,54:289,41:290,44:$Vt}),o($VG,$Vc2),o($Vr,$Vs,{54:291,41:292,44:$Vt}),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:293}),o($VG,$VE1),o($VG,$VF1),{19:[1,297],21:[1,301],22:295,33:294,215:296,229:298,230:[1,300],231:[1,299]},{119:[1,302],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:303}),o($Vh2,$Vy1,{93:304}),o($Vt1,$Vz1,{99:166,95:305,101:$Vl1,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,306]},o($Vh2,$VT1),{70:[1,307]},o($VI,$VJ,{42:308,64:309,66:310,72:311,73:314,75:315,78:316,92:317,94:318,87:320,88:321,89:322,118:323,95:327,22:328,91:330,99:331,229:334,105:335,107:336,19:[1,333],21:[1,338],69:[1,312],71:[1,313],85:[1,319],96:[1,324],97:[1,325],98:[1,326],101:$Vi2,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:[1,329],230:[1,337]}),o($V11,$V01,{39:339,79:$Vj2,80:$Vk2,81:$Vl2}),{45:343,48:344,49:345,50:346,51:$Vm2,52:347,53:$Vn2},o($Vo2,$VE1),o($Vo2,$VF1),{19:[1,353],21:[1,357],22:351,33:350,215:352,229:354,230:[1,356],231:[1,355]},o($Vp2,$Vq2,{83:358,84:359,207:360,205:[1,361]}),o($Vr2,$Vq2,{83:362,84:363,207:364,205:$Vs2}),o($Vr1,$Vt2,{99:109,95:366,101:$VQ,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:367,95:368,91:369,99:370,105:372,107:373,101:$Vw2,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:367,95:368,91:369,99:370,105:372,107:373,101:$Vw2,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:367,95:368,91:369,99:370,105:372,107:373,101:$Vw2,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:374,84:375,207:376,205:[1,377]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,378],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VV2,$VW2,{120:410,126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($VI,[2,141]),o($VI,[2,137]),o($VI,[2,138]),o($VI,[2,139]),o($Vr,$Vs,{233:428,234:429,235:430,238:431,41:432,44:$Vt}),{19:$V13,21:$V23,22:435,128:433,129:434,214:$V33,229:438,230:$V43},o($V53,[2,301]),o($V53,[2,302]),o($Vx1,$V63),o($VN1,$V73),o($VN1,$V83),o($VN1,$V93),o($VN1,$Va3),{111:[1,441]},{111:$Vb3},{111:$Vc3},{111:$Vd3},{111:$Ve3},o($VN1,$Vf3),o($V8,$Vg3),o($V8,$Vh3,{50:442,51:$V81}),o($VE,$VF,{29:443,52:444,53:$Va1}),o($VE,$Vi3),o($VG,$Vj3),o($Vu,[2,303]),o($Vu,$Vv1),o($Vu,$Vw1),o($Vk3,$Vs1,{82:445}),o($Vu,$VE1),o($Vu,$VF1),{19:[1,449],21:[1,453],22:447,33:446,215:448,229:450,230:[1,452],231:[1,451]},{119:[1,454],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($V8,$Vl3,{48:214,49:215,50:216,52:217,43:455,45:456,51:$V81,53:$Va1}),o($VG,$Vc1,{67:149,72:150,39:151,78:152,118:156,65:457,79:$Vd1,80:$Ve1,81:$Vf1,119:$VJ,125:$VJ,127:$VJ,204:$VJ,242:$VJ}),o($VG,$Vm3),o($VG,$Vh1,{64:158,73:159,92:160,94:161,95:165,99:166,68:458,96:$Vi1,97:$Vj1,98:$Vk1,101:$Vl1,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:459,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vn3),o($V8,$Vl3,{48:214,49:215,50:216,52:217,45:456,43:460,51:$V81,53:$Va1}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($V8,$V71,{50:461,51:$Vo3}),o($VE,$V91,{52:463,53:$Vp3}),o($VG,$Vb1),o($VG,$Vc1,{65:465,67:466,72:467,39:468,78:469,118:473,79:$Vq3,80:$Vr3,81:$Vs3,119:$VJ,125:$VJ,127:$VJ,204:$VJ,242:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:474,64:475,73:476,92:477,94:478,95:482,99:483,96:$Vt3,97:$Vu3,98:$Vv3,101:$Vw3,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:485,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:486}),o($Vt1,$Vs1,{82:487}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:488}),o($Vr1,$Vz1,{99:271,95:489,101:$V82,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:490}),o($VA1,$VB1,{86:491}),o($VA1,$VB1,{86:492}),o($Vt1,$VC1,{105:275,107:276,91:493,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:494}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,498],21:[1,502],22:496,33:495,215:497,229:499,230:[1,501],231:[1,500]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{164:503}),o($VN1,$VO1),{119:[1,504],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},{100:[1,505]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,507],106:506,108:[1,508],109:[1,509],110:510,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,511]},o($VA1,$Vp),o($VA1,$Vq),o($V8,$VZ1),o($V8,$V_1),o($V8,$V$1,{45:512,48:513,49:514,50:515,52:516,51:$Vo3,53:$Vp3}),o($V8,$V02),o($VI,$VJ,{73:249,75:250,92:253,94:254,87:256,88:257,89:258,78:259,95:266,22:267,91:269,118:270,99:271,229:274,105:275,107:276,42:517,64:518,66:519,72:520,19:$V22,21:$V32,69:[1,521],71:[1,522],85:$V42,96:$V52,97:$V62,98:$V72,101:$V82,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:$V92,230:$Va2}),o($V11,$V01,{39:523,79:$Vq3,80:$Vr3,81:$Vs3}),o($VG,$VE1),o($VG,$VF1),{19:[1,527],21:[1,531],22:525,33:524,215:526,229:528,230:[1,530],231:[1,529]},o($VE,$Vx3),o($VG,$VH,{58:532}),o($VI,$VJ,{62:533,64:534,66:535,67:536,73:539,75:540,72:541,39:542,92:543,94:544,87:546,88:547,89:548,78:549,95:556,22:557,91:559,118:560,99:561,229:564,105:565,107:566,19:[1,563],21:[1,568],69:[1,537],71:[1,538],79:[1,550],80:[1,551],81:[1,552],85:[1,545],96:[1,553],97:[1,554],98:[1,555],101:$Vy3,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:[1,558],230:[1,567]}),o($VG,$Vz3),o($VI,$VJ,{62:569,64:570,66:571,67:572,73:575,75:576,72:577,39:578,92:579,94:580,87:582,88:583,89:584,78:585,95:592,22:593,91:595,118:596,99:597,229:600,105:601,107:602,19:[1,599],21:[1,604],69:[1,573],71:[1,574],79:[1,586],80:[1,587],81:[1,588],85:[1,581],96:[1,589],97:[1,590],98:[1,591],101:$VA3,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:[1,594],230:[1,603]}),o($Vr2,$Vq2,{84:363,207:364,83:605,205:$Vs2}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:606,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($Vr2,$Vq2,{84:363,207:364,83:607,205:$Vs2}),o($Vt1,$Vt2,{99:166,95:608,101:$Vl1,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V63),o($VG,$VB3),{43:609,45:610,48:344,49:345,50:346,51:$Vm2,52:347,53:$Vn2,70:$Vl3},o($VI,$VJ,{65:611,67:612,72:613,39:614,78:615,118:616,51:$Vc1,53:$Vc1,70:$Vc1,79:$Vj2,80:$Vk2,81:$Vl2}),o($VC3,$Vm3),o($VC3,$Vh1,{68:617,64:618,73:619,92:620,94:621,95:625,99:626,96:[1,622],97:[1,623],98:[1,624],101:$VD3,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:628,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VC3,$Vn3),o($VE3,$Vs1,{82:629}),o($VF3,$Vs1,{82:630}),o($VG3,$Vs1,{82:631}),o($VH3,$Vy1,{93:632}),o($VE3,$Vz1,{99:331,95:633,101:$Vi2,102:$VR,103:$VS,104:$VT}),o($VI3,$VB1,{86:634}),o($VI3,$VB1,{86:635}),o($VI3,$VB1,{86:636}),o($VF3,$VC1,{105:335,107:336,91:637,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),{119:[1,638],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VH3,$VG1),o($VH3,$VH1),o($VH3,$VI1),o($VH3,$VJ1),o($VI3,$VK1),o($VL1,$VM1,{164:639}),o($VJ3,$VO1),{100:[1,640]},o($VH3,$VT1),o($VI3,$Vn),o($VI3,$Vo),{100:[1,642],106:641,108:[1,643],109:[1,644],110:645,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,646]},o($VI3,$Vp),o($VI3,$Vq),{43:647,45:610,48:344,49:345,50:346,51:$Vm2,52:347,53:$Vn2,70:$Vl3},o($VC3,$VE1),o($VC3,$VF1),{19:[1,651],21:[1,655],22:649,33:648,215:650,229:652,230:[1,654],231:[1,653]},{70:$Vg3},{50:656,51:$Vm2,70:$Vh3},o($VK3,$VF,{29:657,52:658,53:$Vn2}),o($VK3,$Vi3),o($VC3,$Vj3),o($Vr,$Vs,{28:659,54:660,41:661,44:$Vt}),o($Vr,$Vs,{54:662,41:663,44:$Vt}),o($Vo2,$VB2),o($Vo2,$Vw),o($Vo2,$Vx),o($Vo2,$Vn),o($Vo2,$Vo),o($Vo2,$Vy),o($Vo2,$Vp),o($Vo2,$Vq),o($VL3,$VM3),o($Vr1,$VN3),o($VL3,$VO3,{31:664,208:[1,665]}),{19:$VP3,21:$VQ3,22:667,129:666,214:$VR3,229:670,230:$VS3},o($VG,$VT3),o($Vt1,$VN3),o($VG,$VO3,{31:673,208:[1,674]}),{19:$VP3,21:$VQ3,22:667,129:675,214:$VR3,229:670,230:$VS3},o($Vx1,$VU3),o($VA1,$VV3),o($VA1,$VW3),o($VA1,$VX3),{100:[1,676]},o($VA1,$VT1),{100:[1,678],106:677,108:[1,679],109:[1,680],110:681,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,682]},o($Vu1,$VY3),o($VD1,$VN3),o($Vu1,$VO3,{31:683,208:[1,684]}),{19:$VP3,21:$VQ3,22:667,129:685,214:$VR3,229:670,230:$VS3},o($VA1,$VZ3),o($VL1,[2,189]),o($VL1,[2,190]),o($VL1,[2,191]),o($VL1,[2,192]),{170:686,171:687,172:690,173:688,174:691,175:689,176:692,181:[1,693]},o($VL1,[2,207],{177:694,179:695,180:[1,696]}),o($VL1,[2,216],{184:697,186:698,180:[1,699]}),o($VL1,[2,224],{188:700,189:701,180:$V_3}),{180:$V_3,189:703},o($V$3,$Vn),o($V$3,$Vo),o($V$3,$V04),o($V$3,$V14),o($V$3,$V24),o($V$3,$Vp),o($V$3,$Vq),o($V$3,$V34),o($V$3,$V44,{217:704,218:705,111:[1,706]}),o($V$3,$V54),o($V$3,$V64),o($V$3,$V74),o($V$3,$V84),o($V$3,$V94),o($V$3,$Va4),o($V$3,$Vb4),o($V$3,$Vc4),o($V$3,$Vd4),o($Ve4,$Vb3),o($Ve4,$Vc3),o($Ve4,$Vd3),o($Ve4,$Ve3),{121:[1,707]},{121:[2,143]},{121:$Vf4},{121:$Vg4,133:708,134:709,135:$Vh4},{121:$Vi4},o($Vj4,$Vk4),o($Vj4,$Vl4),o($Vj4,$Vm4,{139:711,142:712,143:715,140:$Vn4,141:$Vo4}),o($Vp4,$Vq4,{145:716,151:717,152:718,155:719,156:721,69:[1,720],161:$Vr4,162:$Vs4}),o($Vt4,$Vu4),o($Vt4,$Vv4),o($VV2,[2,170]),{69:[1,724]},{27:$Vw4,195:725,199:$Vx4,200:$Vy4,201:$Vz4},{19:$VA4,21:$VB4,22:731,150:730,215:732,229:734,230:$VC4,231:$VD4},{19:[1,741],21:[1,745],22:739,150:738,215:740,229:742,230:[1,744],231:[1,743]},{69:[1,746]},{69:[1,747]},o($VI,[2,285]),o($VI,[2,286]),o($VE4,[2,289],{236:748}),o($VF4,$VG4,{239:749}),o($VI,$VJ,{241:750,73:751,75:752,76:753,92:756,94:757,87:759,88:760,89:761,78:762,39:763,95:767,22:768,91:770,118:771,99:775,229:778,105:779,107:780,19:[1,777],21:[1,782],69:[1,754],71:[1,755],79:[1,772],80:[1,773],81:[1,774],85:[1,758],96:$VH4,97:$VI4,98:$VJ4,101:$VK4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:[1,769],230:[1,781]}),o($VI,[2,144],{22:435,229:438,129:783,19:$V13,21:$V23,214:$V33,230:$V43}),o($VL4,[2,145]),o($VL4,$VM4),o($VL4,$VN4),o($VL4,$Vn),o($VL4,$Vo),o($VL4,$Vp),o($VL4,$Vq),{19:[1,786],21:[1,789],22:785,87:784,229:787,230:[1,788]},o($VE,$VO4),o($V8,$VP4,{50:144,51:$V81}),o($VG,$VQ4),o($VR4,$Vq2,{83:790,84:791,207:792,205:[1,793]}),o($Vu,$VB2),o($Vu,$Vw),o($Vu,$Vx),o($Vu,$Vn),o($Vu,$Vo),o($Vu,$Vy),o($Vu,$Vp),o($Vu,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:794,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($V8,$VS4),o($V8,$VT4),o($VG,$VU4),o($VG,$VV4),{70:[1,795]},o($V8,$VW4),o($VE,$Vb2),o($Vr,$Vs,{28:796,54:797,41:798,44:$Vt}),o($VG,$Vc2),o($Vr,$Vs,{54:799,41:800,44:$Vt}),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:801}),o($VG,$VE1),o($VG,$VF1),{19:[1,805],21:[1,809],22:803,33:802,215:804,229:806,230:[1,808],231:[1,807]},{119:[1,810],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:811}),o($Vh2,$Vy1,{93:812}),o($Vt1,$Vz1,{99:483,95:813,101:$Vw3,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,814]},o($Vh2,$VT1),{70:[1,815]},o($Vp2,$Vq2,{83:816,84:817,207:818,205:[1,819]}),o($Vr2,$Vq2,{83:820,84:821,207:822,205:$VX4}),o($Vr1,$Vt2,{99:271,95:824,101:$V82,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:825,95:826,91:827,99:828,105:830,107:831,101:$VY4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:825,95:826,91:827,99:828,105:830,107:831,101:$VY4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:825,95:826,91:827,99:828,105:830,107:831,101:$VY4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:832,84:833,207:834,205:[1,835]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,836],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:837,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($Vx1,$V63),o($VN1,$V73),o($VN1,$V83),o($VN1,$V93),o($VN1,$Va3),{111:[1,838]},o($VN1,$Vf3),o($V8,$Vg3),o($V8,$Vh3,{50:839,51:$Vo3}),o($VE,$VF,{29:840,52:841,53:$Vp3}),o($VE,$Vi3),o($VG,$Vj3),o($V8,$Vl3,{48:513,49:514,50:515,52:516,43:842,45:843,51:$Vo3,53:$Vp3}),o($VG,$Vc1,{67:466,72:467,39:468,78:469,118:473,65:844,79:$Vq3,80:$Vr3,81:$Vs3,119:$VJ,125:$VJ,127:$VJ,204:$VJ,242:$VJ}),o($VG,$Vm3),o($VG,$Vh1,{64:475,73:476,92:477,94:478,95:482,99:483,68:845,96:$Vt3,97:$Vu3,98:$Vv3,101:$Vw3,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:846,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vn3),o($V8,$Vl3,{48:513,49:514,50:515,52:516,45:843,43:847,51:$Vo3,53:$Vp3}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VE,$V91,{52:848,53:[1,849]}),o($VG,$Vb1),o($VG,$Vc1,{65:850,67:851,72:852,39:853,78:854,118:858,79:[1,855],80:[1,856],81:[1,857],119:$VJ,125:$VJ,127:$VJ,204:$VJ,242:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:859,64:860,73:861,92:862,94:863,95:867,99:868,96:[1,864],97:[1,865],98:[1,866],101:$VZ4,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:870,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:871}),o($Vt1,$Vs1,{82:872}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:873}),o($Vr1,$Vz1,{99:561,95:874,101:$Vy3,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:875}),o($VA1,$VB1,{86:876}),o($VA1,$VB1,{86:877}),o($Vt1,$VC1,{105:565,107:566,91:878,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:879}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,883],21:[1,887],22:881,33:880,215:882,229:884,230:[1,886],231:[1,885]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{164:888}),o($VN1,$VO1),{119:[1,889],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},{100:[1,890]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,892],106:891,108:[1,893],109:[1,894],110:895,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,896]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$Vb1),o($VG,$Vc1,{65:897,67:898,72:899,39:900,78:901,118:905,79:[1,902],80:[1,903],81:[1,904],119:$VJ,125:$VJ,127:$VJ,204:$VJ,242:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:906,64:907,73:908,92:909,94:910,95:914,99:915,96:[1,911],97:[1,912],98:[1,913],101:$V_4,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:917,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:918}),o($Vt1,$Vs1,{82:919}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:920}),o($Vr1,$Vz1,{99:597,95:921,101:$VA3,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:922}),o($VA1,$VB1,{86:923}),o($VA1,$VB1,{86:924}),o($Vt1,$VC1,{105:601,107:602,91:925,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:926}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,930],21:[1,934],22:928,33:927,215:929,229:931,230:[1,933],231:[1,932]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{164:935}),o($VN1,$VO1),{119:[1,936],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},{100:[1,937]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,939],106:938,108:[1,940],109:[1,941],110:942,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,943]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$VY3),{121:[1,944]},o($VG,$VM3),o($Vh2,$VU3),{70:$VS4},{70:$VT4},o($VC3,$VU4),o($VC3,$Ve2),o($VC3,$Vv1),o($VC3,$Vw1),o($VF3,$Vs1,{82:945}),{119:[1,946],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VC3,$VV4),o($VC3,$Vg2),o($VF3,$Vs1,{82:947}),o($V$4,$Vy1,{93:948}),o($VF3,$Vz1,{99:626,95:949,101:$VD3,102:$VR,103:$VS,104:$VT}),o($V$4,$VG1),o($V$4,$VH1),o($V$4,$VI1),o($V$4,$VJ1),{100:[1,950]},o($V$4,$VT1),{70:[1,951]},o($V05,$Vq2,{83:952,84:953,207:954,205:[1,955]}),o($V15,$Vq2,{83:956,84:957,207:958,205:$V25}),o($V35,$Vq2,{83:960,84:961,207:962,205:[1,963]}),o($VE3,$Vt2,{99:331,95:964,101:$Vi2,102:$VR,103:$VS,104:$VT}),o($VH3,$Vu2),o($VF3,$Vv2,{90:965,95:966,91:967,99:968,105:970,107:971,101:$V45,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VF3,$Vx2,{90:965,95:966,91:967,99:968,105:970,107:971,101:$V45,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VF3,$Vy2,{90:965,95:966,91:967,99:968,105:970,107:971,101:$V45,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VJ3,$Vz2),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:972,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,973],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VH3,$V63),o($VJ3,$V73),o($VJ3,$V83),o($VJ3,$V93),o($VJ3,$Va3),{111:[1,974]},o($VJ3,$Vf3),{70:$VW4},o($VC3,$VB2),o($VC3,$Vw),o($VC3,$Vx),o($VC3,$Vn),o($VC3,$Vo),o($VC3,$Vy),o($VC3,$Vp),o($VC3,$Vq),o($VK3,$VO4),{50:975,51:$Vm2,70:$VP4},o($VC3,$VQ4),o($VK3,$Vx3),o($VC3,$VH,{58:976}),o($VI,$VJ,{62:977,64:978,66:979,67:980,73:983,75:984,72:985,39:986,92:987,94:988,87:990,88:991,89:992,78:993,95:1000,22:1001,91:1003,118:1004,99:1005,229:1008,105:1009,107:1010,19:[1,1007],21:[1,1012],69:[1,981],71:[1,982],79:[1,994],80:[1,995],81:[1,996],85:[1,989],96:[1,997],97:[1,998],98:[1,999],101:$V55,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:[1,1002],230:[1,1011]}),o($VC3,$Vz3),o($VI,$VJ,{62:1013,64:1014,66:1015,67:1016,73:1019,75:1020,72:1021,39:1022,92:1023,94:1024,87:1026,88:1027,89:1028,78:1029,95:1036,22:1037,91:1039,118:1040,99:1041,229:1044,105:1045,107:1046,19:[1,1043],21:[1,1048],69:[1,1017],71:[1,1018],79:[1,1030],80:[1,1031],81:[1,1032],85:[1,1025],96:[1,1033],97:[1,1034],98:[1,1035],101:$V65,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:[1,1038],230:[1,1047]}),o($Vp2,$V75),{19:$Vi,21:$Vj,22:1049,229:45,230:$Vk},{19:$V85,21:$V95,22:1051,100:[1,1062],108:[1,1063],109:[1,1064],110:1061,183:1052,206:1050,211:1055,212:1056,213:1057,216:1060,219:[1,1065],220:[1,1066],221:[1,1071],222:[1,1072],223:[1,1073],224:[1,1074],225:[1,1067],226:[1,1068],227:[1,1069],228:[1,1070],229:1054,230:$Va5},o($Vb5,$VM4),o($Vb5,$VN4),o($Vb5,$Vn),o($Vb5,$Vo),o($Vb5,$Vp),o($Vb5,$Vq),o($Vr2,$V75),{19:$Vi,21:$Vj,22:1075,229:45,230:$Vk},{19:$Vc5,21:$Vd5,22:1077,100:[1,1088],108:[1,1089],109:[1,1090],110:1087,183:1078,206:1076,211:1081,212:1082,213:1083,216:1086,219:[1,1091],220:[1,1092],221:[1,1097],222:[1,1098],223:[1,1099],224:[1,1100],225:[1,1093],226:[1,1094],227:[1,1095],228:[1,1096],229:1080,230:$Ve5},o($VA1,$V63),o($VA1,$V73),o($VA1,$V83),o($VA1,$V93),o($VA1,$Va3),{111:[1,1101]},o($VA1,$Vf3),o($VA2,$V75),{19:$Vi,21:$Vj,22:1102,229:45,230:$Vk},{19:$Vf5,21:$Vg5,22:1104,100:[1,1115],108:[1,1116],109:[1,1117],110:1114,183:1105,206:1103,211:1108,212:1109,213:1110,216:1113,219:[1,1118],220:[1,1119],221:[1,1124],222:[1,1125],223:[1,1126],224:[1,1127],225:[1,1120],226:[1,1121],227:[1,1122],228:[1,1123],229:1107,230:$Vh5},o($VL1,[2,193]),o($VL1,[2,200],{172:1128,181:$Vi5}),o($VL1,[2,201],{174:1130,181:$Vj5}),o($VL1,[2,202],{176:1132,181:$Vk5}),o($Vl5,[2,194]),o($Vl5,[2,196]),o($Vl5,[2,198]),{19:$Vm5,21:$Vn5,22:1134,100:$Vo5,108:$Vp5,109:$Vq5,110:1145,183:1135,187:$Vr5,211:1139,212:1140,213:1141,216:1144,219:$Vs5,220:$Vt5,221:$Vu5,222:$Vv5,223:$Vw5,224:$Vx5,225:$Vy5,226:$Vz5,227:$VA5,228:$VB5,229:1138,230:$VC5},o($VL1,[2,203]),o($VL1,[2,208]),o($Vl5,[2,204],{178:1159}),o($VL1,[2,212]),o($VL1,[2,217]),o($Vl5,[2,213],{185:1160}),o($VL1,[2,219]),o($VL1,[2,225]),o($Vl5,[2,221],{190:1161}),o($VL1,[2,220]),o($V$3,$VD5),o($V$3,$VE5),{19:$VC2,21:$VD2,22:1163,87:1162,229:389,230:$VU2},o($VD1,$VF5),{121:$VG5,134:1164,135:$Vh4},o($Vj4,$VH5),o($VV2,$VW2,{136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,131:1165,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($Vj4,$VI5),o($Vj4,$Vm4,{139:1166,143:1167,140:$Vn4,141:$Vo4}),o($VV2,$VW2,{144:418,146:419,147:420,148:421,193:423,138:1168,121:$VJ5,135:$VJ5,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($VV2,$VW2,{144:418,146:419,147:420,148:421,193:423,138:1169,121:$VK5,135:$VK5,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($Vt4,$VL5),o($Vt4,$VM5),o($Vt4,$VN5),o($Vt4,$VO5),{19:$VP5,21:$VQ5,22:1171,129:1170,214:$VR5,229:1174,230:$VS5},o($VV2,$VW2,{148:421,126:1177,130:1178,131:1179,132:1180,136:1181,137:1182,138:1183,144:1184,146:1185,147:1186,193:1188,149:$VY2,191:$VT5,202:$V_2,203:$V$2,204:$VU5}),o($Vp4,[2,178]),o($Vp4,[2,183],{162:[1,1190]}),o($Vp4,[2,185],{161:[1,1191]}),o($VV5,$VW5,{192:1192,196:1193,197:$VX5}),{149:[1,1196],193:1195,202:[1,1197],203:[1,1198]},o($VV5,[2,235]),o($VV5,[2,236]),o($VV5,[2,237]),o($VV5,[2,238]),o($Vt4,$VY5),o($Vt4,$VZ5),o($Vt4,$V_5),o($Vt4,$Vn),o($Vt4,$Vo),o($Vt4,$Vy),o($Vt4,$Vp),o($Vt4,$Vq),o($VV2,[2,168],{27:$V$5,199:$V$5,200:$V$5,201:$V$5}),o($V06,$VZ5),o($V06,$V_5),o($V06,$Vn),o($V06,$Vo),o($V06,$Vy),o($V06,$Vp),o($V06,$Vq),{149:[1,1199]},{149:[1,1200]},o($VI,[2,287],{237:1201,51:[1,1202]}),o($VE4,$V16,{240:1203,53:[1,1204]}),o($VF4,$V26),o($VI,$VJ,{76:1205,78:1206,39:1207,118:1208,79:[1,1209],80:[1,1210],81:[1,1211]}),o($VF4,$V36),o($VF4,$V46,{77:1212,73:1213,92:1214,94:1215,95:1219,99:1220,96:[1,1216],97:[1,1217],98:[1,1218],101:$V56,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:1222,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VF4,$V66),o($V76,$Vy1,{93:1223}),o($V12,$Vz1,{99:775,95:1224,101:$VK4,102:$VR,103:$VS,104:$VT}),o($V86,$VB1,{86:1225}),o($V86,$VB1,{86:1226}),o($V86,$VB1,{86:1227}),o($VF4,$VC1,{105:779,107:780,91:1228,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V96,$Va6),o($V96,$Vb6),o($V76,$VG1),o($V76,$VH1),o($V76,$VI1),o($V76,$VJ1),o($V86,$VK1),o($VL1,$VM1,{164:1229}),o($Vc6,$VO1),{119:[1,1230],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($V96,$VE1),o($V96,$VF1),{19:[1,1234],21:[1,1238],22:1232,33:1231,215:1233,229:1235,230:[1,1237],231:[1,1236]},{100:[1,1239]},o($V76,$VT1),o($V86,$Vn),o($V86,$Vo),{100:[1,1241],106:1240,108:[1,1242],109:[1,1243],110:1244,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,1245]},o($V86,$Vp),o($V86,$Vq),o($VL4,[2,146]),o($VN1,$Vd6),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($Vu,$VY3),o($Vk3,$VN3),o($Vu,$VO3,{31:1246,208:[1,1247]}),{19:$VP3,21:$VQ3,22:667,129:1248,214:$VR3,229:670,230:$VS3},{121:[1,1249]},o($VG,$Ve6),o($VE,$Vx3),o($VG,$VH,{58:1250}),o($VI,$VJ,{62:1251,64:1252,66:1253,67:1254,73:1257,75:1258,72:1259,39:1260,92:1261,94:1262,87:1264,88:1265,89:1266,78:1267,95:1274,22:1275,91:1277,118:1278,99:1279,229:1282,105:1283,107:1284,19:[1,1281],21:[1,1286],69:[1,1255],71:[1,1256],79:[1,1268],80:[1,1269],81:[1,1270],85:[1,1263],96:[1,1271],97:[1,1272],98:[1,1273],101:$Vf6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:[1,1276],230:[1,1285]}),o($VG,$Vz3),o($VI,$VJ,{62:1287,64:1288,66:1289,67:1290,73:1293,75:1294,72:1295,39:1296,92:1297,94:1298,87:1300,88:1301,89:1302,78:1303,95:1310,22:1311,91:1313,118:1314,99:1315,229:1318,105:1319,107:1320,19:[1,1317],21:[1,1322],69:[1,1291],71:[1,1292],79:[1,1304],80:[1,1305],81:[1,1306],85:[1,1299],96:[1,1307],97:[1,1308],98:[1,1309],101:$Vg6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:[1,1312],230:[1,1321]}),o($Vr2,$Vq2,{84:821,207:822,83:1323,205:$VX4}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:1324,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($Vr2,$Vq2,{84:821,207:822,83:1325,205:$VX4}),o($Vt1,$Vt2,{99:483,95:1326,101:$Vw3,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V63),o($VG,$VB3),o($VL3,$VM3),o($Vr1,$VN3),o($VL3,$VO3,{31:1327,208:[1,1328]}),{19:$VP3,21:$VQ3,22:667,129:1329,214:$VR3,229:670,230:$VS3},o($VG,$VT3),o($Vt1,$VN3),o($VG,$VO3,{31:1330,208:[1,1331]}),{19:$VP3,21:$VQ3,22:667,129:1332,214:$VR3,229:670,230:$VS3},o($Vx1,$VU3),o($VA1,$VV3),o($VA1,$VW3),o($VA1,$VX3),{100:[1,1333]},o($VA1,$VT1),{100:[1,1335],106:1334,108:[1,1336],109:[1,1337],110:1338,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,1339]},o($Vu1,$VY3),o($VD1,$VN3),o($Vu1,$VO3,{31:1340,208:[1,1341]}),{19:$VP3,21:$VQ3,22:667,129:1342,214:$VR3,229:670,230:$VS3},o($VA1,$VZ3),{121:[1,1343]},{19:[1,1346],21:[1,1349],22:1345,87:1344,229:1347,230:[1,1348]},o($VE,$VO4),o($V8,$VP4,{50:461,51:$Vo3}),o($VG,$VQ4),o($V8,$VS4),o($V8,$VT4),o($VG,$VU4),o($VG,$VV4),{70:[1,1350]},o($V8,$VW4),o($VG,$Vc2),o($Vr,$Vs,{54:1351,41:1352,44:$Vt}),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:1353}),o($VG,$VE1),o($VG,$VF1),{19:[1,1357],21:[1,1361],22:1355,33:1354,215:1356,229:1358,230:[1,1360],231:[1,1359]},{119:[1,1362],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:1363}),o($Vh2,$Vy1,{93:1364}),o($Vt1,$Vz1,{99:868,95:1365,101:$VZ4,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,1366]},o($Vh2,$VT1),{70:[1,1367]},o($Vp2,$Vq2,{83:1368,84:1369,207:1370,205:[1,1371]}),o($Vr2,$Vq2,{83:1372,84:1373,207:1374,205:$Vh6}),o($Vr1,$Vt2,{99:561,95:1376,101:$Vy3,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:1377,95:1378,91:1379,99:1380,105:1382,107:1383,101:$Vi6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:1377,95:1378,91:1379,99:1380,105:1382,107:1383,101:$Vi6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:1377,95:1378,91:1379,99:1380,105:1382,107:1383,101:$Vi6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:1384,84:1385,207:1386,205:[1,1387]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,1388],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:1389,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($Vx1,$V63),o($VN1,$V73),o($VN1,$V83),o($VN1,$V93),o($VN1,$Va3),{111:[1,1390]},o($VN1,$Vf3),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:1391}),o($VG,$VE1),o($VG,$VF1),{19:[1,1395],21:[1,1399],22:1393,33:1392,215:1394,229:1396,230:[1,1398],231:[1,1397]},{119:[1,1400],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:1401}),o($Vh2,$Vy1,{93:1402}),o($Vt1,$Vz1,{99:915,95:1403,101:$V_4,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,1404]},o($Vh2,$VT1),{70:[1,1405]},o($Vp2,$Vq2,{83:1406,84:1407,207:1408,205:[1,1409]}),o($Vr2,$Vq2,{83:1410,84:1411,207:1412,205:$Vj6}),o($Vr1,$Vt2,{99:597,95:1414,101:$VA3,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:1415,95:1416,91:1417,99:1418,105:1420,107:1421,101:$Vk6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:1415,95:1416,91:1417,99:1418,105:1420,107:1421,101:$Vk6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:1415,95:1416,91:1417,99:1418,105:1420,107:1421,101:$Vk6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:1422,84:1423,207:1424,205:[1,1425]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,1426],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:1427,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($Vx1,$V63),o($VN1,$V73),o($VN1,$V83),o($VN1,$V93),o($VN1,$Va3),{111:[1,1428]},o($VN1,$Vf3),o($Vt1,$VF5),o($V15,$Vq2,{84:957,207:958,83:1429,205:$V25}),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:1430,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($V15,$Vq2,{84:957,207:958,83:1431,205:$V25}),o($VF3,$Vt2,{99:626,95:1432,101:$VD3,102:$VR,103:$VS,104:$VT}),o($V$4,$Vu2),o($V$4,$V63),o($VC3,$Ve6),o($Vl6,$VM3),o($VE3,$VN3),o($Vl6,$VO3,{31:1433,208:[1,1434]}),{19:$VP3,21:$VQ3,22:667,129:1435,214:$VR3,229:670,230:$VS3},o($VC3,$VT3),o($VF3,$VN3),o($VC3,$VO3,{31:1436,208:[1,1437]}),{19:$VP3,21:$VQ3,22:667,129:1438,214:$VR3,229:670,230:$VS3},o($Vm6,$VY3),o($VG3,$VN3),o($Vm6,$VO3,{31:1439,208:[1,1440]}),{19:$VP3,21:$VQ3,22:667,129:1441,214:$VR3,229:670,230:$VS3},o($VH3,$VU3),o($VI3,$VV3),o($VI3,$VW3),o($VI3,$VX3),{100:[1,1442]},o($VI3,$VT1),{100:[1,1444],106:1443,108:[1,1445],109:[1,1446],110:1447,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,1448]},{121:[1,1449]},o($VI3,$VZ3),{19:[1,1452],21:[1,1455],22:1451,87:1450,229:1453,230:[1,1454]},o($VK3,$Vb2),o($VK3,$V91,{52:1456,53:[1,1457]}),o($VC3,$Vb1),o($VI,$VJ,{65:1458,67:1459,72:1460,39:1461,78:1462,118:1466,51:$Vc1,53:$Vc1,70:$Vc1,79:[1,1463],80:[1,1464],81:[1,1465]}),o($VC3,$Vg1),o($VC3,$Vh1,{68:1467,64:1468,73:1469,92:1470,94:1471,95:1475,99:1476,96:[1,1472],97:[1,1473],98:[1,1474],101:$Vn6,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:1478,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VC3,$Vq1),o($VE3,$Vs1,{82:1479}),o($VF3,$Vs1,{82:1480}),o($Vm6,$Vv1),o($Vm6,$Vw1),o($VH3,$Vy1,{93:1481}),o($VE3,$Vz1,{99:1005,95:1482,101:$V55,102:$VR,103:$VS,104:$VT}),o($VI3,$VB1,{86:1483}),o($VI3,$VB1,{86:1484}),o($VI3,$VB1,{86:1485}),o($VF3,$VC1,{105:1009,107:1010,91:1486,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VG3,$Vs1,{82:1487}),o($Vm6,$VE1),o($Vm6,$VF1),{19:[1,1491],21:[1,1495],22:1489,33:1488,215:1490,229:1492,230:[1,1494],231:[1,1493]},o($VH3,$VG1),o($VH3,$VH1),o($VH3,$VI1),o($VH3,$VJ1),o($VI3,$VK1),o($VL1,$VM1,{164:1496}),o($VJ3,$VO1),{119:[1,1497],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},{100:[1,1498]},o($VH3,$VT1),o($VI3,$Vn),o($VI3,$Vo),{100:[1,1500],106:1499,108:[1,1501],109:[1,1502],110:1503,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,1504]},o($VI3,$Vp),o($VI3,$Vq),o($VC3,$Vb1),o($VI,$VJ,{65:1505,67:1506,72:1507,39:1508,78:1509,118:1513,51:$Vc1,53:$Vc1,70:$Vc1,79:[1,1510],80:[1,1511],81:[1,1512]}),o($VC3,$Vg1),o($VC3,$Vh1,{68:1514,64:1515,73:1516,92:1517,94:1518,95:1522,99:1523,96:[1,1519],97:[1,1520],98:[1,1521],101:$Vo6,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:1525,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VC3,$Vq1),o($VE3,$Vs1,{82:1526}),o($VF3,$Vs1,{82:1527}),o($Vm6,$Vv1),o($Vm6,$Vw1),o($VH3,$Vy1,{93:1528}),o($VE3,$Vz1,{99:1041,95:1529,101:$V65,102:$VR,103:$VS,104:$VT}),o($VI3,$VB1,{86:1530}),o($VI3,$VB1,{86:1531}),o($VI3,$VB1,{86:1532}),o($VF3,$VC1,{105:1045,107:1046,91:1533,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VG3,$Vs1,{82:1534}),o($Vm6,$VE1),o($Vm6,$VF1),{19:[1,1538],21:[1,1542],22:1536,33:1535,215:1537,229:1539,230:[1,1541],231:[1,1540]},o($VH3,$VG1),o($VH3,$VH1),o($VH3,$VI1),o($VH3,$VJ1),o($VI3,$VK1),o($VL1,$VM1,{164:1543}),o($VJ3,$VO1),{119:[1,1544],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},{100:[1,1545]},o($VH3,$VT1),o($VI3,$Vn),o($VI3,$Vo),{100:[1,1547],106:1546,108:[1,1548],109:[1,1549],110:1550,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,1551]},o($VI3,$Vp),o($VI3,$Vq),{208:[1,1554],209:1552,210:[1,1553]},o($Vr1,$Vp6),o($Vr1,$Vq6),o($Vr1,$Vr6),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$V04),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V34),o($Vr1,$V44,{217:1555,218:1556,111:[1,1557]}),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Vr1,$Vb4),o($Vr1,$Vc4),o($Vr1,$Vd4),o($Vs6,$Vb3),o($Vs6,$Vc3),o($Vs6,$Vd3),o($Vs6,$Ve3),{208:[1,1560],209:1558,210:[1,1559]},o($Vt1,$Vp6),o($Vt1,$Vq6),o($Vt1,$Vr6),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$V04),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V34),o($Vt1,$V44,{217:1561,218:1562,111:[1,1563]}),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vt1,$Vb4),o($Vt1,$Vc4),o($Vt1,$Vd4),o($Vt6,$Vb3),o($Vt6,$Vc3),o($Vt6,$Vd3),o($Vt6,$Ve3),{19:[1,1566],21:[1,1569],22:1565,87:1564,229:1567,230:[1,1568]},{208:[1,1572],209:1570,210:[1,1571]},o($VD1,$Vp6),o($VD1,$Vq6),o($VD1,$Vr6),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$V04),o($VD1,$V14),o($VD1,$V24),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V34),o($VD1,$V44,{217:1573,218:1574,111:[1,1575]}),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($VD1,$Vb4),o($VD1,$Vc4),o($VD1,$Vd4),o($Vu6,$Vb3),o($Vu6,$Vc3),o($Vu6,$Vd3),o($Vu6,$Ve3),o($Vl5,[2,195]),{19:$Vm5,21:$Vn5,22:1134,229:1138,230:$VC5},o($Vl5,[2,197]),{100:$Vo5,108:$Vp5,109:$Vq5,110:1145,183:1135,211:1139,212:1140,213:1141,216:1144,219:$Vs5,220:$Vt5,221:$Vu5,222:$Vv5,223:$Vw5,224:$Vx5,225:$Vy5,226:$Vz5,227:$VA5,228:$VB5},o($Vl5,[2,199]),{187:$Vr5},o($Vl5,$Vv6,{182:1576,180:$Vw6}),o($Vl5,$Vv6,{182:1578,180:$Vw6}),o($Vl5,$Vv6,{182:1579,180:$Vw6}),o($Vx6,$Vn),o($Vx6,$Vo),o($Vx6,$V04),o($Vx6,$V14),o($Vx6,$V24),o($Vx6,$Vp),o($Vx6,$Vq),o($Vx6,$V34),o($Vx6,$V44,{217:1580,218:1581,111:[1,1582]}),o($Vx6,$V54),o($Vx6,$V64),o($Vx6,$V74),o($Vx6,$V84),o($Vx6,$V94),o($Vx6,$Va4),o($Vx6,$Vb4),o($Vx6,$Vc4),o($Vx6,$Vd4),o($Vy6,$Vb3),o($Vy6,$Vc3),o($Vy6,$Vd3),o($Vy6,$Ve3),o($VL1,[2,206],{172:1583,181:$Vi5}),o($VL1,[2,215],{174:1584,181:$Vj5}),o($VL1,[2,223],{176:1585,181:$Vk5}),o($V$3,$Vz6),o($V$3,$VK1),o($Vj4,$VA6),o($Vj4,$VB6),o($Vj4,$VC6),o($Vt4,$VD6),o($Vt4,$VE6),o($Vt4,$VF6),o($Vr,$Vs,{46:1586,47:1587,55:1588,59:1589,41:1590,44:$Vt}),o($V53,$VM4),o($V53,$VN4),o($V53,$Vn),o($V53,$Vo),o($V53,$Vp),o($V53,$Vq),{70:[1,1591]},{70:$Vf4},{70:$Vg4,133:1592,134:1593,135:$VG6},{70:$Vi4},o($VH6,$Vk4),o($VH6,$Vl4),o($VH6,$Vm4,{139:1595,142:1596,143:1599,140:$VI6,141:$VJ6}),o($Vp4,$Vq4,{156:721,145:1600,151:1601,152:1602,155:1603,69:[1,1604],161:$Vr4,162:$Vs4}),o($VK6,$Vu4),o($VK6,$Vv4),{69:[1,1605]},{27:$Vw4,195:1606,199:$Vx4,200:$Vy4,201:$Vz4},{19:$VL6,21:$VM6,22:1608,150:1607,215:1609,229:1611,230:$VN6,231:$VO6},o($Vp4,[2,184]),o($Vp4,[2,186]),{149:$VP6,193:1615,202:$VQ6,203:$VR6},o($VV5,[2,231]),{140:[1,1619]},o($Vt4,$VS6),{19:$VA4,21:$VB4,22:731,150:1620,215:732,229:734,230:$VC4,231:$VD4},{69:[1,1621]},{69:[1,1622]},{19:$VT6,21:$VU6,22:1624,150:1623,215:1625,229:1627,230:$VV6,231:$VW6},{19:$VT6,21:$VU6,22:1624,150:1631,215:1625,229:1627,230:$VV6,231:$VW6},o($VE4,[2,290]),o($Vr,$Vs,{235:1632,238:1633,41:1634,44:$Vt}),o($VF4,$VX6),o($Vr,$Vs,{238:1635,41:1636,44:$Vt}),o($VF4,$VY6),o($VF4,$Va6),o($VF4,$Vb6),{119:[1,1637],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VF4,$VE1),o($VF4,$VF1),{19:[1,1641],21:[1,1645],22:1639,33:1638,215:1640,229:1642,230:[1,1644],231:[1,1643]},o($VF4,$VZ6),o($VF4,$V_6),o($V$6,$Vy1,{93:1646}),o($VF4,$Vz1,{99:1220,95:1647,101:$V56,102:$VR,103:$VS,104:$VT}),o($V$6,$VG1),o($V$6,$VH1),o($V$6,$VI1),o($V$6,$VJ1),{100:[1,1648]},o($V$6,$VT1),{70:[1,1649]},o($V12,$Vt2,{99:775,95:1650,101:$VK4,102:$VR,103:$VS,104:$VT}),o($V76,$Vu2),o($VF4,$Vv2,{90:1651,95:1652,91:1653,99:1654,105:1656,107:1657,101:$V07,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VF4,$Vx2,{90:1651,95:1652,91:1653,99:1654,105:1656,107:1657,101:$V07,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VF4,$Vy2,{90:1651,95:1652,91:1653,99:1654,105:1656,107:1657,101:$V07,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vc6,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,1658],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:1659,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($V96,$VB2),o($V96,$Vw),o($V96,$Vx),o($V96,$Vn),o($V96,$Vo),o($V96,$Vy),o($V96,$Vp),o($V96,$Vq),o($V76,$V63),o($Vc6,$V73),o($Vc6,$V83),o($Vc6,$V93),o($Vc6,$Va3),{111:[1,1660]},o($Vc6,$Vf3),o($VR4,$V75),{19:$Vi,21:$Vj,22:1661,229:45,230:$Vk},{19:$V17,21:$V27,22:1663,100:[1,1674],108:[1,1675],109:[1,1676],110:1673,183:1664,206:1662,211:1667,212:1668,213:1669,216:1672,219:[1,1677],220:[1,1678],221:[1,1683],222:[1,1684],223:[1,1685],224:[1,1686],225:[1,1679],226:[1,1680],227:[1,1681],228:[1,1682],229:1666,230:$V37},o($Vk3,$VF5),o($VE,$V91,{52:1687,53:[1,1688]}),o($VG,$Vb1),o($VG,$Vc1,{65:1689,67:1690,72:1691,39:1692,78:1693,118:1697,79:[1,1694],80:[1,1695],81:[1,1696],119:$VJ,125:$VJ,127:$VJ,204:$VJ,242:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:1698,64:1699,73:1700,92:1701,94:1702,95:1706,99:1707,96:[1,1703],97:[1,1704],98:[1,1705],101:$V47,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:1709,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:1710}),o($Vt1,$Vs1,{82:1711}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:1712}),o($Vr1,$Vz1,{99:1279,95:1713,101:$Vf6,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:1714}),o($VA1,$VB1,{86:1715}),o($VA1,$VB1,{86:1716}),o($Vt1,$VC1,{105:1283,107:1284,91:1717,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:1718}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,1722],21:[1,1726],22:1720,33:1719,215:1721,229:1723,230:[1,1725],231:[1,1724]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{164:1727}),o($VN1,$VO1),{119:[1,1728],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},{100:[1,1729]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,1731],106:1730,108:[1,1732],109:[1,1733],110:1734,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,1735]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$Vb1),o($VG,$Vc1,{65:1736,67:1737,72:1738,39:1739,78:1740,118:1744,79:[1,1741],80:[1,1742],81:[1,1743],119:$VJ,125:$VJ,127:$VJ,204:$VJ,242:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:1745,64:1746,73:1747,92:1748,94:1749,95:1753,99:1754,96:[1,1750],97:[1,1751],98:[1,1752],101:$V57,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:1756,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:1757}),o($Vt1,$Vs1,{82:1758}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:1759}),o($Vr1,$Vz1,{99:1315,95:1760,101:$Vg6,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:1761}),o($VA1,$VB1,{86:1762}),o($VA1,$VB1,{86:1763}),o($Vt1,$VC1,{105:1319,107:1320,91:1764,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:1765}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,1769],21:[1,1773],22:1767,33:1766,215:1768,229:1770,230:[1,1772],231:[1,1771]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{164:1774}),o($VN1,$VO1),{119:[1,1775],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},{100:[1,1776]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,1778],106:1777,108:[1,1779],109:[1,1780],110:1781,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,1782]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$VY3),{121:[1,1783]},o($VG,$VM3),o($Vh2,$VU3),o($Vp2,$V75),{19:$Vi,21:$Vj,22:1784,229:45,230:$Vk},{19:$V67,21:$V77,22:1786,100:[1,1797],108:[1,1798],109:[1,1799],110:1796,183:1787,206:1785,211:1790,212:1791,213:1792,216:1795,219:[1,1800],220:[1,1801],221:[1,1806],222:[1,1807],223:[1,1808],224:[1,1809],225:[1,1802],226:[1,1803],227:[1,1804],228:[1,1805],229:1789,230:$V87},o($Vr2,$V75),{19:$Vi,21:$Vj,22:1810,229:45,230:$Vk},{19:$V97,21:$Va7,22:1812,100:[1,1823],108:[1,1824],109:[1,1825],110:1822,183:1813,206:1811,211:1816,212:1817,213:1818,216:1821,219:[1,1826],220:[1,1827],221:[1,1832],222:[1,1833],223:[1,1834],224:[1,1835],225:[1,1828],226:[1,1829],227:[1,1830],228:[1,1831],229:1815,230:$Vb7},o($VA1,$V63),o($VA1,$V73),o($VA1,$V83),o($VA1,$V93),o($VA1,$Va3),{111:[1,1836]},o($VA1,$Vf3),o($VA2,$V75),{19:$Vi,21:$Vj,22:1837,229:45,230:$Vk},{19:$Vc7,21:$Vd7,22:1839,100:[1,1850],108:[1,1851],109:[1,1852],110:1849,183:1840,206:1838,211:1843,212:1844,213:1845,216:1848,219:[1,1853],220:[1,1854],221:[1,1859],222:[1,1860],223:[1,1861],224:[1,1862],225:[1,1855],226:[1,1856],227:[1,1857],228:[1,1858],229:1842,230:$Ve7},o($VD1,$VF5),o($VN1,$Vd6),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($VG,$Ve6),o($VG,$Vz3),o($VI,$VJ,{62:1863,64:1864,66:1865,67:1866,73:1869,75:1870,72:1871,39:1872,92:1873,94:1874,87:1876,88:1877,89:1878,78:1879,95:1886,22:1887,91:1889,118:1890,99:1891,229:1894,105:1895,107:1896,19:[1,1893],21:[1,1898],69:[1,1867],71:[1,1868],79:[1,1880],80:[1,1881],81:[1,1882],85:[1,1875],96:[1,1883],97:[1,1884],98:[1,1885],101:$Vf7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:[1,1888],230:[1,1897]}),o($Vr2,$Vq2,{84:1373,207:1374,83:1899,205:$Vh6}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:1900,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($Vr2,$Vq2,{84:1373,207:1374,83:1901,205:$Vh6}),o($Vt1,$Vt2,{99:868,95:1902,101:$VZ4,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V63),o($VG,$VB3),o($VL3,$VM3),o($Vr1,$VN3),o($VL3,$VO3,{31:1903,208:[1,1904]}),{19:$VP3,21:$VQ3,22:667,129:1905,214:$VR3,229:670,230:$VS3},o($VG,$VT3),o($Vt1,$VN3),o($VG,$VO3,{31:1906,208:[1,1907]}),{19:$VP3,21:$VQ3,22:667,129:1908,214:$VR3,229:670,230:$VS3},o($Vx1,$VU3),o($VA1,$VV3),o($VA1,$VW3),o($VA1,$VX3),{100:[1,1909]},o($VA1,$VT1),{100:[1,1911],106:1910,108:[1,1912],109:[1,1913],110:1914,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,1915]},o($Vu1,$VY3),o($VD1,$VN3),o($Vu1,$VO3,{31:1916,208:[1,1917]}),{19:$VP3,21:$VQ3,22:667,129:1918,214:$VR3,229:670,230:$VS3},o($VA1,$VZ3),{121:[1,1919]},{19:[1,1922],21:[1,1925],22:1921,87:1920,229:1923,230:[1,1924]},o($Vr2,$Vq2,{84:1411,207:1412,83:1926,205:$Vj6}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:1927,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($Vr2,$Vq2,{84:1411,207:1412,83:1928,205:$Vj6}),o($Vt1,$Vt2,{99:915,95:1929,101:$V_4,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V63),o($VG,$VB3),o($VL3,$VM3),o($Vr1,$VN3),o($VL3,$VO3,{31:1930,208:[1,1931]}),{19:$VP3,21:$VQ3,22:667,129:1932,214:$VR3,229:670,230:$VS3},o($VG,$VT3),o($Vt1,$VN3),o($VG,$VO3,{31:1933,208:[1,1934]}),{19:$VP3,21:$VQ3,22:667,129:1935,214:$VR3,229:670,230:$VS3},o($Vx1,$VU3),o($VA1,$VV3),o($VA1,$VW3),o($VA1,$VX3),{100:[1,1936]},o($VA1,$VT1),{100:[1,1938],106:1937,108:[1,1939],109:[1,1940],110:1941,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,1942]},o($Vu1,$VY3),o($VD1,$VN3),o($Vu1,$VO3,{31:1943,208:[1,1944]}),{19:$VP3,21:$VQ3,22:667,129:1945,214:$VR3,229:670,230:$VS3},o($VA1,$VZ3),{121:[1,1946]},{19:[1,1949],21:[1,1952],22:1948,87:1947,229:1950,230:[1,1951]},o($VC3,$VY3),{121:[1,1953]},o($VC3,$VM3),o($V$4,$VU3),o($V05,$V75),{19:$Vi,21:$Vj,22:1954,229:45,230:$Vk},{19:$Vg7,21:$Vh7,22:1956,100:[1,1967],108:[1,1968],109:[1,1969],110:1966,183:1957,206:1955,211:1960,212:1961,213:1962,216:1965,219:[1,1970],220:[1,1971],221:[1,1976],222:[1,1977],223:[1,1978],224:[1,1979],225:[1,1972],226:[1,1973],227:[1,1974],228:[1,1975],229:1959,230:$Vi7},o($V15,$V75),{19:$Vi,21:$Vj,22:1980,229:45,230:$Vk},{19:$Vj7,21:$Vk7,22:1982,100:[1,1993],108:[1,1994],109:[1,1995],110:1992,183:1983,206:1981,211:1986,212:1987,213:1988,216:1991,219:[1,1996],220:[1,1997],221:[1,2002],222:[1,2003],223:[1,2004],224:[1,2005],225:[1,1998],226:[1,1999],227:[1,2000],228:[1,2001],229:1985,230:$Vl7},o($V35,$V75),{19:$Vi,21:$Vj,22:2006,229:45,230:$Vk},{19:$Vm7,21:$Vn7,22:2008,100:[1,2019],108:[1,2020],109:[1,2021],110:2018,183:2009,206:2007,211:2012,212:2013,213:2014,216:2017,219:[1,2022],220:[1,2023],221:[1,2028],222:[1,2029],223:[1,2030],224:[1,2031],225:[1,2024],226:[1,2025],227:[1,2026],228:[1,2027],229:2011,230:$Vo7},o($VI3,$V63),o($VI3,$V73),o($VI3,$V83),o($VI3,$V93),o($VI3,$Va3),{111:[1,2032]},o($VI3,$Vf3),o($VG3,$VF5),o($VJ3,$Vd6),o($VJ3,$VK1),o($VJ3,$Vn),o($VJ3,$Vo),o($VJ3,$Vp),o($VJ3,$Vq),o($VC3,$Vc2),o($Vr,$Vs,{54:2033,41:2034,44:$Vt}),o($VC3,$Vd2),o($VC3,$Ve2),o($VC3,$Vv1),o($VC3,$Vw1),o($VF3,$Vs1,{82:2035}),o($VC3,$VE1),o($VC3,$VF1),{19:[1,2039],21:[1,2043],22:2037,33:2036,215:2038,229:2040,230:[1,2042],231:[1,2041]},{119:[1,2044],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VC3,$Vf2),o($VC3,$Vg2),o($VF3,$Vs1,{82:2045}),o($V$4,$Vy1,{93:2046}),o($VF3,$Vz1,{99:1476,95:2047,101:$Vn6,102:$VR,103:$VS,104:$VT}),o($V$4,$VG1),o($V$4,$VH1),o($V$4,$VI1),o($V$4,$VJ1),{100:[1,2048]},o($V$4,$VT1),{70:[1,2049]},o($V05,$Vq2,{83:2050,84:2051,207:2052,205:[1,2053]}),o($V15,$Vq2,{83:2054,84:2055,207:2056,205:$Vp7}),o($VE3,$Vt2,{99:1005,95:2058,101:$V55,102:$VR,103:$VS,104:$VT}),o($VH3,$Vu2),o($VF3,$Vv2,{90:2059,95:2060,91:2061,99:2062,105:2064,107:2065,101:$Vq7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VF3,$Vx2,{90:2059,95:2060,91:2061,99:2062,105:2064,107:2065,101:$Vq7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VF3,$Vy2,{90:2059,95:2060,91:2061,99:2062,105:2064,107:2065,101:$Vq7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VJ3,$Vz2),o($V35,$Vq2,{83:2066,84:2067,207:2068,205:[1,2069]}),o($Vm6,$VB2),o($Vm6,$Vw),o($Vm6,$Vx),o($Vm6,$Vn),o($Vm6,$Vo),o($Vm6,$Vy),o($Vm6,$Vp),o($Vm6,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,2070],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:2071,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($VH3,$V63),o($VJ3,$V73),o($VJ3,$V83),o($VJ3,$V93),o($VJ3,$Va3),{111:[1,2072]},o($VJ3,$Vf3),o($VC3,$Vd2),o($VC3,$Ve2),o($VC3,$Vv1),o($VC3,$Vw1),o($VF3,$Vs1,{82:2073}),o($VC3,$VE1),o($VC3,$VF1),{19:[1,2077],21:[1,2081],22:2075,33:2074,215:2076,229:2078,230:[1,2080],231:[1,2079]},{119:[1,2082],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VC3,$Vf2),o($VC3,$Vg2),o($VF3,$Vs1,{82:2083}),o($V$4,$Vy1,{93:2084}),o($VF3,$Vz1,{99:1523,95:2085,101:$Vo6,102:$VR,103:$VS,104:$VT}),o($V$4,$VG1),o($V$4,$VH1),o($V$4,$VI1),o($V$4,$VJ1),{100:[1,2086]},o($V$4,$VT1),{70:[1,2087]},o($V05,$Vq2,{83:2088,84:2089,207:2090,205:[1,2091]}),o($V15,$Vq2,{83:2092,84:2093,207:2094,205:$Vr7}),o($VE3,$Vt2,{99:1041,95:2096,101:$V65,102:$VR,103:$VS,104:$VT}),o($VH3,$Vu2),o($VF3,$Vv2,{90:2097,95:2098,91:2099,99:2100,105:2102,107:2103,101:$Vs7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VF3,$Vx2,{90:2097,95:2098,91:2099,99:2100,105:2102,107:2103,101:$Vs7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VF3,$Vy2,{90:2097,95:2098,91:2099,99:2100,105:2102,107:2103,101:$Vs7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VJ3,$Vz2),o($V35,$Vq2,{83:2104,84:2105,207:2106,205:[1,2107]}),o($Vm6,$VB2),o($Vm6,$Vw),o($Vm6,$Vx),o($Vm6,$Vn),o($Vm6,$Vo),o($Vm6,$Vy),o($Vm6,$Vp),o($Vm6,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,2108],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:2109,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($VH3,$V63),o($VJ3,$V73),o($VJ3,$V83),o($VJ3,$V93),o($VJ3,$Va3),{111:[1,2110]},o($VJ3,$Vf3),o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$VD5),o($Vr1,$VE5),{19:$V85,21:$V95,22:2112,87:2111,229:1054,230:$Va5},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$VD5),o($Vt1,$VE5),{19:$Vc5,21:$Vd5,22:2114,87:2113,229:1080,230:$Ve5},o($VA1,$Vd6),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$VD5),o($VD1,$VE5),{19:$Vf5,21:$Vg5,22:2116,87:2115,229:1107,230:$Vh5},o($Vl5,[2,209]),o($Vl5,[2,211]),o($Vl5,[2,218]),o($Vl5,[2,226]),o($Vx6,$VD5),o($Vx6,$VE5),{19:$Vm5,21:$Vn5,22:2118,87:2117,229:1138,230:$VC5},o($Vl5,[2,205]),o($Vl5,[2,214]),o($Vl5,[2,222]),o($Vt7,$Vu7,{153:2119,154:2120,157:$Vv7,158:$Vw7,159:$Vx7,160:$Vy7}),o($Vz7,$VA7),o($VB7,$VC7,{56:2125}),o($VD7,$VE7,{60:2126}),o($VI,$VJ,{63:2127,73:2128,75:2129,76:2130,92:2133,94:2134,87:2136,88:2137,89:2138,78:2139,39:2140,95:2144,22:2145,91:2147,118:2148,99:2152,229:2155,105:2156,107:2157,19:[1,2154],21:[1,2159],69:[1,2131],71:[1,2132],79:[1,2149],80:[1,2150],81:[1,2151],85:[1,2135],96:[1,2141],97:[1,2142],98:[1,2143],101:$VF7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:[1,2146],230:[1,2158]}),o($Vt7,$Vu7,{154:2120,153:2160,157:$Vv7,158:$Vw7,159:$Vx7,160:$Vy7}),{70:$VG5,134:2161,135:$VG6},o($VH6,$VH5),o($VV2,$VW2,{148:421,136:1181,137:1182,138:1183,144:1184,146:1185,147:1186,193:1188,131:2162,149:$VY2,191:$VT5,202:$V_2,203:$V$2,204:$VU5}),o($VH6,$VI5),o($VH6,$Vm4,{139:2163,143:2164,140:$VI6,141:$VJ6}),o($VV2,$VW2,{148:421,144:1184,146:1185,147:1186,193:1188,138:2165,70:$VJ5,135:$VJ5,149:$VY2,191:$VT5,202:$V_2,203:$V$2,204:$VU5}),o($VV2,$VW2,{148:421,144:1184,146:1185,147:1186,193:1188,138:2166,70:$VK5,135:$VK5,149:$VY2,191:$VT5,202:$V_2,203:$V$2,204:$VU5}),o($VK6,$VL5),o($VK6,$VM5),o($VK6,$VN5),o($VK6,$VO5),{19:$VP5,21:$VQ5,22:1171,129:2167,214:$VR5,229:1174,230:$VS5},o($VV2,$VW2,{148:421,130:1178,131:1179,132:1180,136:1181,137:1182,138:1183,144:1184,146:1185,147:1186,193:1188,126:2168,149:$VY2,191:$VT5,202:$V_2,203:$V$2,204:$VU5}),o($VV5,$VW5,{196:1193,192:2169,197:$VX5}),{149:[1,2171],193:2170,202:[1,2172],203:[1,2173]},o($VK6,$VY5),o($VK6,$VZ5),o($VK6,$V_5),o($VK6,$Vn),o($VK6,$Vo),o($VK6,$Vy),o($VK6,$Vp),o($VK6,$Vq),o($VG7,$VH7,{194:2174}),{19:[1,2178],21:[1,2182],22:2176,150:2175,215:2177,229:2179,230:[1,2181],231:[1,2180]},{69:[1,2183]},{69:[1,2184]},o($VV5,[2,229]),o($Vt4,$V$5),{149:[1,2185]},{149:[1,2186]},{70:[1,2187]},{70:$VZ5},{70:$V_5},{70:$Vn},{70:$Vo},{70:$Vy},{70:$Vp},{70:$Vq},{70:[1,2188]},o($VE4,[2,288]),o($VF4,$VG4,{239:2189}),o($VI,$VJ,{92:756,94:757,95:767,99:775,241:2190,73:2191,75:2192,76:2193,87:2197,88:2198,89:2199,78:2200,39:2201,22:2202,91:2204,118:2205,229:2210,105:2211,107:2212,19:[1,2209],21:[1,2214],69:[1,2194],71:[1,2195],79:[1,2206],80:[1,2207],81:[1,2208],85:[1,2196],96:$VH4,97:$VI4,98:$VJ4,101:$VK4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:[1,2203],230:[1,2213]}),o($VF4,$VI7),o($VI,$VJ,{92:756,94:757,95:767,99:775,241:2215,73:2216,75:2217,76:2218,87:2222,88:2223,89:2224,78:2225,39:2226,22:2227,91:2229,118:2230,229:2235,105:2236,107:2237,19:[1,2234],21:[1,2239],69:[1,2219],71:[1,2220],79:[1,2231],80:[1,2232],81:[1,2233],85:[1,2221],96:$VH4,97:$VI4,98:$VJ4,101:$VK4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:[1,2228],230:[1,2238]}),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:2240,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($VF4,$VB2),o($VF4,$Vw),o($VF4,$Vx),o($VF4,$Vn),o($VF4,$Vo),o($VF4,$Vy),o($VF4,$Vp),o($VF4,$Vq),o($VF4,$Vt2,{99:1220,95:2241,101:$V56,102:$VR,103:$VS,104:$VT}),o($V$6,$Vu2),o($V$6,$V63),o($VF4,$VJ7),o($V76,$VU3),o($V86,$VV3),o($V86,$VW3),o($V86,$VX3),{100:[1,2242]},o($V86,$VT1),{100:[1,2244],106:2243,108:[1,2245],109:[1,2246],110:2247,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,2248]},o($V86,$VZ3),{121:[1,2249]},{19:[1,2252],21:[1,2255],22:2251,87:2250,229:2253,230:[1,2254]},{208:[1,2258],209:2256,210:[1,2257]},o($Vk3,$Vp6),o($Vk3,$Vq6),o($Vk3,$Vr6),o($Vk3,$Vn),o($Vk3,$Vo),o($Vk3,$V04),o($Vk3,$V14),o($Vk3,$V24),o($Vk3,$Vp),o($Vk3,$Vq),o($Vk3,$V34),o($Vk3,$V44,{217:2259,218:2260,111:[1,2261]}),o($Vk3,$V54),o($Vk3,$V64),o($Vk3,$V74),o($Vk3,$V84),o($Vk3,$V94),o($Vk3,$Va4),o($Vk3,$Vb4),o($Vk3,$Vc4),o($Vk3,$Vd4),o($VK7,$Vb3),o($VK7,$Vc3),o($VK7,$Vd3),o($VK7,$Ve3),o($VG,$Vc2),o($Vr,$Vs,{54:2262,41:2263,44:$Vt}),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:2264}),o($VG,$VE1),o($VG,$VF1),{19:[1,2268],21:[1,2272],22:2266,33:2265,215:2267,229:2269,230:[1,2271],231:[1,2270]},{119:[1,2273],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:2274}),o($Vh2,$Vy1,{93:2275}),o($Vt1,$Vz1,{99:1707,95:2276,101:$V47,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,2277]},o($Vh2,$VT1),{70:[1,2278]},o($Vp2,$Vq2,{83:2279,84:2280,207:2281,205:[1,2282]}),o($Vr2,$Vq2,{83:2283,84:2284,207:2285,205:$VL7}),o($Vr1,$Vt2,{99:1279,95:2287,101:$Vf6,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:2288,95:2289,91:2290,99:2291,105:2293,107:2294,101:$VM7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:2288,95:2289,91:2290,99:2291,105:2293,107:2294,101:$VM7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:2288,95:2289,91:2290,99:2291,105:2293,107:2294,101:$VM7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:2295,84:2296,207:2297,205:[1,2298]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,2299],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:2300,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($Vx1,$V63),o($VN1,$V73),o($VN1,$V83),o($VN1,$V93),o($VN1,$Va3),{111:[1,2301]},o($VN1,$Vf3),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:2302}),o($VG,$VE1),o($VG,$VF1),{19:[1,2306],21:[1,2310],22:2304,33:2303,215:2305,229:2307,230:[1,2309],231:[1,2308]},{119:[1,2311],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:2312}),o($Vh2,$Vy1,{93:2313}),o($Vt1,$Vz1,{99:1754,95:2314,101:$V57,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,2315]},o($Vh2,$VT1),{70:[1,2316]},o($Vp2,$Vq2,{83:2317,84:2318,207:2319,205:[1,2320]}),o($Vr2,$Vq2,{83:2321,84:2322,207:2323,205:$VN7}),o($Vr1,$Vt2,{99:1315,95:2325,101:$Vg6,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:2326,95:2327,91:2328,99:2329,105:2331,107:2332,101:$VO7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:2326,95:2327,91:2328,99:2329,105:2331,107:2332,101:$VO7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:2326,95:2327,91:2328,99:2329,105:2331,107:2332,101:$VO7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:2333,84:2334,207:2335,205:[1,2336]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,2337],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:2338,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($Vx1,$V63),o($VN1,$V73),o($VN1,$V83),o($VN1,$V93),o($VN1,$Va3),{111:[1,2339]},o($VN1,$Vf3),o($Vt1,$VF5),{208:[1,2342],209:2340,210:[1,2341]},o($Vr1,$Vp6),o($Vr1,$Vq6),o($Vr1,$Vr6),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$V04),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V34),o($Vr1,$V44,{217:2343,218:2344,111:[1,2345]}),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Vr1,$Vb4),o($Vr1,$Vc4),o($Vr1,$Vd4),o($Vs6,$Vb3),o($Vs6,$Vc3),o($Vs6,$Vd3),o($Vs6,$Ve3),{208:[1,2348],209:2346,210:[1,2347]},o($Vt1,$Vp6),o($Vt1,$Vq6),o($Vt1,$Vr6),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$V04),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V34),o($Vt1,$V44,{217:2349,218:2350,111:[1,2351]}),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vt1,$Vb4),o($Vt1,$Vc4),o($Vt1,$Vd4),o($Vt6,$Vb3),o($Vt6,$Vc3),o($Vt6,$Vd3),o($Vt6,$Ve3),{19:[1,2354],21:[1,2357],22:2353,87:2352,229:2355,230:[1,2356]},{208:[1,2360],209:2358,210:[1,2359]},o($VD1,$Vp6),o($VD1,$Vq6),o($VD1,$Vr6),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$V04),o($VD1,$V14),o($VD1,$V24),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V34),o($VD1,$V44,{217:2361,218:2362,111:[1,2363]}),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($VD1,$Vb4),o($VD1,$Vc4),o($VD1,$Vd4),o($Vu6,$Vb3),o($Vu6,$Vc3),o($Vu6,$Vd3),o($Vu6,$Ve3),o($VG,$Vb1),o($VG,$Vc1,{65:2364,67:2365,72:2366,39:2367,78:2368,118:2372,79:[1,2369],80:[1,2370],81:[1,2371],119:$VJ,125:$VJ,127:$VJ,204:$VJ,242:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:2373,64:2374,73:2375,92:2376,94:2377,95:2381,99:2382,96:[1,2378],97:[1,2379],98:[1,2380],101:$VP7,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:2384,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:2385}),o($Vt1,$Vs1,{82:2386}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:2387}),o($Vr1,$Vz1,{99:1891,95:2388,101:$Vf7,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:2389}),o($VA1,$VB1,{86:2390}),o($VA1,$VB1,{86:2391}),o($Vt1,$VC1,{105:1895,107:1896,91:2392,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:2393}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,2397],21:[1,2401],22:2395,33:2394,215:2396,229:2398,230:[1,2400],231:[1,2399]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{164:2402}),o($VN1,$VO1),{119:[1,2403],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},{100:[1,2404]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,2406],106:2405,108:[1,2407],109:[1,2408],110:2409,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,2410]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$VY3),{121:[1,2411]},o($VG,$VM3),o($Vh2,$VU3),o($Vp2,$V75),{19:$Vi,21:$Vj,22:2412,229:45,230:$Vk},{19:$VQ7,21:$VR7,22:2414,100:[1,2425],108:[1,2426],109:[1,2427],110:2424,183:2415,206:2413,211:2418,212:2419,213:2420,216:2423,219:[1,2428],220:[1,2429],221:[1,2434],222:[1,2435],223:[1,2436],224:[1,2437],225:[1,2430],226:[1,2431],227:[1,2432],228:[1,2433],229:2417,230:$VS7},o($Vr2,$V75),{19:$Vi,21:$Vj,22:2438,229:45,230:$Vk},{19:$VT7,21:$VU7,22:2440,100:[1,2451],108:[1,2452],109:[1,2453],110:2450,183:2441,206:2439,211:2444,212:2445,213:2446,216:2449,219:[1,2454],220:[1,2455],221:[1,2460],222:[1,2461],223:[1,2462],224:[1,2463],225:[1,2456],226:[1,2457],227:[1,2458],228:[1,2459],229:2443,230:$VV7},o($VA1,$V63),o($VA1,$V73),o($VA1,$V83),o($VA1,$V93),o($VA1,$Va3),{111:[1,2464]},o($VA1,$Vf3),o($VA2,$V75),{19:$Vi,21:$Vj,22:2465,229:45,230:$Vk},{19:$VW7,21:$VX7,22:2467,100:[1,2478],108:[1,2479],109:[1,2480],110:2477,183:2468,206:2466,211:2471,212:2472,213:2473,216:2476,219:[1,2481],220:[1,2482],221:[1,2487],222:[1,2488],223:[1,2489],224:[1,2490],225:[1,2483],226:[1,2484],227:[1,2485],228:[1,2486],229:2470,230:$VY7},o($VD1,$VF5),o($VN1,$Vd6),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($VG,$VY3),{121:[1,2491]},o($VG,$VM3),o($Vh2,$VU3),o($Vp2,$V75),{19:$Vi,21:$Vj,22:2492,229:45,230:$Vk},{19:$VZ7,21:$V_7,22:2494,100:[1,2505],108:[1,2506],109:[1,2507],110:2504,183:2495,206:2493,211:2498,212:2499,213:2500,216:2503,219:[1,2508],220:[1,2509],221:[1,2514],222:[1,2515],223:[1,2516],224:[1,2517],225:[1,2510],226:[1,2511],227:[1,2512],228:[1,2513],229:2497,230:$V$7},o($Vr2,$V75),{19:$Vi,21:$Vj,22:2518,229:45,230:$Vk},{19:$V08,21:$V18,22:2520,100:[1,2531],108:[1,2532],109:[1,2533],110:2530,183:2521,206:2519,211:2524,212:2525,213:2526,216:2529,219:[1,2534],220:[1,2535],221:[1,2540],222:[1,2541],223:[1,2542],224:[1,2543],225:[1,2536],226:[1,2537],227:[1,2538],228:[1,2539],229:2523,230:$V28},o($VA1,$V63),o($VA1,$V73),o($VA1,$V83),o($VA1,$V93),o($VA1,$Va3),{111:[1,2544]},o($VA1,$Vf3),o($VA2,$V75),{19:$Vi,21:$Vj,22:2545,229:45,230:$Vk},{19:$V38,21:$V48,22:2547,100:[1,2558],108:[1,2559],109:[1,2560],110:2557,183:2548,206:2546,211:2551,212:2552,213:2553,216:2556,219:[1,2561],220:[1,2562],221:[1,2567],222:[1,2568],223:[1,2569],224:[1,2570],225:[1,2563],226:[1,2564],227:[1,2565],228:[1,2566],229:2550,230:$V58},o($VD1,$VF5),o($VN1,$Vd6),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($VF3,$VF5),{208:[1,2573],209:2571,210:[1,2572]},o($VE3,$Vp6),o($VE3,$Vq6),o($VE3,$Vr6),o($VE3,$Vn),o($VE3,$Vo),o($VE3,$V04),o($VE3,$V14),o($VE3,$V24),o($VE3,$Vp),o($VE3,$Vq),o($VE3,$V34),o($VE3,$V44,{217:2574,218:2575,111:[1,2576]}),o($VE3,$V54),o($VE3,$V64),o($VE3,$V74),o($VE3,$V84),o($VE3,$V94),o($VE3,$Va4),o($VE3,$Vb4),o($VE3,$Vc4),o($VE3,$Vd4),o($V68,$Vb3),o($V68,$Vc3),o($V68,$Vd3),o($V68,$Ve3),{208:[1,2579],209:2577,210:[1,2578]},o($VF3,$Vp6),o($VF3,$Vq6),o($VF3,$Vr6),o($VF3,$Vn),o($VF3,$Vo),o($VF3,$V04),o($VF3,$V14),o($VF3,$V24),o($VF3,$Vp),o($VF3,$Vq),o($VF3,$V34),o($VF3,$V44,{217:2580,218:2581,111:[1,2582]}),o($VF3,$V54),o($VF3,$V64),o($VF3,$V74),o($VF3,$V84),o($VF3,$V94),o($VF3,$Va4),o($VF3,$Vb4),o($VF3,$Vc4),o($VF3,$Vd4),o($V78,$Vb3),o($V78,$Vc3),o($V78,$Vd3),o($V78,$Ve3),{208:[1,2585],209:2583,210:[1,2584]},o($VG3,$Vp6),o($VG3,$Vq6),o($VG3,$Vr6),o($VG3,$Vn),o($VG3,$Vo),o($VG3,$V04),o($VG3,$V14),o($VG3,$V24),o($VG3,$Vp),o($VG3,$Vq),o($VG3,$V34),o($VG3,$V44,{217:2586,218:2587,111:[1,2588]}),o($VG3,$V54),o($VG3,$V64),o($VG3,$V74),o($VG3,$V84),o($VG3,$V94),o($VG3,$Va4),o($VG3,$Vb4),o($VG3,$Vc4),o($VG3,$Vd4),o($V88,$Vb3),o($V88,$Vc3),o($V88,$Vd3),o($V88,$Ve3),{19:[1,2591],21:[1,2594],22:2590,87:2589,229:2592,230:[1,2593]},o($VC3,$Vz3),o($VI,$VJ,{62:2595,64:2596,66:2597,67:2598,73:2601,75:2602,72:2603,39:2604,92:2605,94:2606,87:2608,88:2609,89:2610,78:2611,95:2618,22:2619,91:2621,118:2622,99:2623,229:2626,105:2627,107:2628,19:[1,2625],21:[1,2630],69:[1,2599],71:[1,2600],79:[1,2612],80:[1,2613],81:[1,2614],85:[1,2607],96:[1,2615],97:[1,2616],98:[1,2617],101:$V98,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:[1,2620],230:[1,2629]}),o($V15,$Vq2,{84:2055,207:2056,83:2631,205:$Vp7}),o($VC3,$VB2),o($VC3,$Vw),o($VC3,$Vx),o($VC3,$Vn),o($VC3,$Vo),o($VC3,$Vy),o($VC3,$Vp),o($VC3,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:2632,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($V15,$Vq2,{84:2055,207:2056,83:2633,205:$Vp7}),o($VF3,$Vt2,{99:1476,95:2634,101:$Vn6,102:$VR,103:$VS,104:$VT}),o($V$4,$Vu2),o($V$4,$V63),o($VC3,$VB3),o($Vl6,$VM3),o($VE3,$VN3),o($Vl6,$VO3,{31:2635,208:[1,2636]}),{19:$VP3,21:$VQ3,22:667,129:2637,214:$VR3,229:670,230:$VS3},o($VC3,$VT3),o($VF3,$VN3),o($VC3,$VO3,{31:2638,208:[1,2639]}),{19:$VP3,21:$VQ3,22:667,129:2640,214:$VR3,229:670,230:$VS3},o($VH3,$VU3),o($VI3,$VV3),o($VI3,$VW3),o($VI3,$VX3),{100:[1,2641]},o($VI3,$VT1),{100:[1,2643],106:2642,108:[1,2644],109:[1,2645],110:2646,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,2647]},o($Vm6,$VY3),o($VG3,$VN3),o($Vm6,$VO3,{31:2648,208:[1,2649]}),{19:$VP3,21:$VQ3,22:667,129:2650,214:$VR3,229:670,230:$VS3},o($VI3,$VZ3),{121:[1,2651]},{19:[1,2654],21:[1,2657],22:2653,87:2652,229:2655,230:[1,2656]},o($V15,$Vq2,{84:2093,207:2094,83:2658,205:$Vr7}),o($VC3,$VB2),o($VC3,$Vw),o($VC3,$Vx),o($VC3,$Vn),o($VC3,$Vo),o($VC3,$Vy),o($VC3,$Vp),o($VC3,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:2659,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($V15,$Vq2,{84:2093,207:2094,83:2660,205:$Vr7}),o($VF3,$Vt2,{99:1523,95:2661,101:$Vo6,102:$VR,103:$VS,104:$VT}),o($V$4,$Vu2),o($V$4,$V63),o($VC3,$VB3),o($Vl6,$VM3),o($VE3,$VN3),o($Vl6,$VO3,{31:2662,208:[1,2663]}),{19:$VP3,21:$VQ3,22:667,129:2664,214:$VR3,229:670,230:$VS3},o($VC3,$VT3),o($VF3,$VN3),o($VC3,$VO3,{31:2665,208:[1,2666]}),{19:$VP3,21:$VQ3,22:667,129:2667,214:$VR3,229:670,230:$VS3},o($VH3,$VU3),o($VI3,$VV3),o($VI3,$VW3),o($VI3,$VX3),{100:[1,2668]},o($VI3,$VT1),{100:[1,2670],106:2669,108:[1,2671],109:[1,2672],110:2673,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,2674]},o($Vm6,$VY3),o($VG3,$VN3),o($Vm6,$VO3,{31:2675,208:[1,2676]}),{19:$VP3,21:$VQ3,22:667,129:2677,214:$VR3,229:670,230:$VS3},o($VI3,$VZ3),{121:[1,2678]},{19:[1,2681],21:[1,2684],22:2680,87:2679,229:2682,230:[1,2683]},o($Vr1,$Vz6),o($Vr1,$VK1),o($Vt1,$Vz6),o($Vt1,$VK1),o($VD1,$Vz6),o($VD1,$VK1),o($Vx6,$Vz6),o($Vx6,$VK1),o($Vt7,$Vs1,{82:2685}),o($Vt7,$Va8),o($Vt7,$Vb8),o($Vt7,$Vc8),o($Vt7,$Vd8),o($Vt7,$Ve8),o($Vz7,$Vf8,{57:2686,51:[1,2687]}),o($VB7,$Vg8,{61:2688,53:[1,2689]}),o($VD7,$Vh8),o($VD7,$Vi8,{74:2690,76:2691,78:2692,39:2693,118:2694,79:[1,2695],80:[1,2696],81:[1,2697],119:$VJ,125:$VJ,127:$VJ,204:$VJ,242:$VJ}),o($VD7,$Vj8),o($VD7,$V46,{77:2698,73:2699,92:2700,94:2701,95:2705,99:2706,96:[1,2702],97:[1,2703],98:[1,2704],101:$Vk8,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:2708,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VD7,$Vl8),o($Vm8,$Vy1,{93:2709}),o($Vn8,$Vz1,{99:2152,95:2710,101:$VF7,102:$VR,103:$VS,104:$VT}),o($Vo8,$VB1,{86:2711}),o($Vo8,$VB1,{86:2712}),o($Vo8,$VB1,{86:2713}),o($VD7,$VC1,{105:2156,107:2157,91:2714,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vp8,$Va6),o($Vp8,$Vb6),o($Vm8,$VG1),o($Vm8,$VH1),o($Vm8,$VI1),o($Vm8,$VJ1),o($Vo8,$VK1),o($VL1,$VM1,{164:2715}),o($Vq8,$VO1),{119:[1,2716],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($Vp8,$VE1),o($Vp8,$VF1),{19:[1,2720],21:[1,2724],22:2718,33:2717,215:2719,229:2721,230:[1,2723],231:[1,2722]},{100:[1,2725]},o($Vm8,$VT1),o($Vo8,$Vn),o($Vo8,$Vo),{100:[1,2727],106:2726,108:[1,2728],109:[1,2729],110:2730,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,2731]},o($Vo8,$Vp),o($Vo8,$Vq),o($Vt7,$Vs1,{82:2732}),o($VH6,$VA6),o($VH6,$VB6),o($VH6,$VC6),o($VK6,$VD6),o($VK6,$VE6),o($VK6,$VF6),o($Vr,$Vs,{46:2733,47:2734,55:2735,59:2736,41:2737,44:$Vt}),{70:[1,2738]},{149:$VP6,193:2739,202:$VQ6,203:$VR6},o($VK6,$VS6),{19:$VL6,21:$VM6,22:1608,150:2740,215:1609,229:1611,230:$VN6,231:$VO6},{69:[1,2741]},{69:[1,2742]},{70:[1,2743],140:$Vr8,198:2744},o($VG7,$V$5),o($VG7,$VZ5),o($VG7,$V_5),o($VG7,$Vn),o($VG7,$Vo),o($VG7,$Vy),o($VG7,$Vp),o($VG7,$Vq),{149:[1,2746]},{149:[1,2747]},{19:$VT6,21:$VU6,22:1624,150:2748,215:1625,229:1627,230:$VV6,231:$VW6},{19:$VT6,21:$VU6,22:1624,150:2749,215:1625,229:1627,230:$VV6,231:$VW6},o($Vs8,$Vt8),o($Vs8,$Vu8),o($VE4,$V16,{240:2750,53:[1,2751]}),o($VF4,$V26),o($VI,$VJ,{76:2752,78:2753,39:2754,118:2755,79:[1,2756],80:[1,2757],81:[1,2758]}),o($VF4,$V36),o($VF4,$V46,{77:2759,73:2760,92:2761,94:2762,95:2766,99:2767,96:[1,2763],97:[1,2764],98:[1,2765],101:$Vv8,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:2769,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VF4,$V66),o($V86,$VB1,{86:2770}),o($V86,$VB1,{86:2771}),o($V86,$VB1,{86:2772}),o($VF4,$VC1,{105:2211,107:2212,91:2773,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V96,$Va6),o($V96,$Vb6),o($V86,$VK1),o($VL1,$VM1,{164:2774}),o($Vc6,$VO1),{119:[1,2775],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($V96,$VE1),o($V96,$VF1),{19:[1,2779],21:[1,2783],22:2777,33:2776,215:2778,229:2780,230:[1,2782],231:[1,2781]},o($V86,$Vn),o($V86,$Vo),{100:[1,2785],106:2784,108:[1,2786],109:[1,2787],110:2788,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,2789]},o($V86,$Vp),o($V86,$Vq),o($VF4,$V26),o($VI,$VJ,{76:2790,78:2791,39:2792,118:2793,79:[1,2794],80:[1,2795],81:[1,2796]}),o($VF4,$V36),o($VF4,$V46,{77:2797,73:2798,92:2799,94:2800,95:2804,99:2805,96:[1,2801],97:[1,2802],98:[1,2803],101:$Vw8,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:2807,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VF4,$V66),o($V86,$VB1,{86:2808}),o($V86,$VB1,{86:2809}),o($V86,$VB1,{86:2810}),o($VF4,$VC1,{105:2236,107:2237,91:2811,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V96,$Va6),o($V96,$Vb6),o($V86,$VK1),o($VL1,$VM1,{164:2812}),o($Vc6,$VO1),{119:[1,2813],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($V96,$VE1),o($V96,$VF1),{19:[1,2817],21:[1,2821],22:2815,33:2814,215:2816,229:2818,230:[1,2820],231:[1,2819]},o($V86,$Vn),o($V86,$Vo),{100:[1,2823],106:2822,108:[1,2824],109:[1,2825],110:2826,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,2827]},o($V86,$Vp),o($V86,$Vq),{121:[1,2828]},o($V$6,$VU3),o($V86,$V63),o($V86,$V73),o($V86,$V83),o($V86,$V93),o($V86,$Va3),{111:[1,2829]},o($V86,$Vf3),o($V96,$VF5),o($Vc6,$Vd6),o($Vc6,$VK1),o($Vc6,$Vn),o($Vc6,$Vo),o($Vc6,$Vp),o($Vc6,$Vq),o($VR4,$V41),o($VR4,$V51),o($VR4,$V61),o($Vk3,$VD5),o($Vk3,$VE5),{19:$V17,21:$V27,22:2831,87:2830,229:1666,230:$V37},o($VG,$Vz3),o($VI,$VJ,{62:2832,64:2833,66:2834,67:2835,73:2838,75:2839,72:2840,39:2841,92:2842,94:2843,87:2845,88:2846,89:2847,78:2848,95:2855,22:2856,91:2858,118:2859,99:2860,229:2863,105:2864,107:2865,19:[1,2862],21:[1,2867],69:[1,2836],71:[1,2837],79:[1,2849],80:[1,2850],81:[1,2851],85:[1,2844],96:[1,2852],97:[1,2853],98:[1,2854],101:$Vx8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:[1,2857],230:[1,2866]}),o($Vr2,$Vq2,{84:2284,207:2285,83:2868,205:$VL7}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:2869,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($Vr2,$Vq2,{84:2284,207:2285,83:2870,205:$VL7}),o($Vt1,$Vt2,{99:1707,95:2871,101:$V47,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V63),o($VG,$VB3),o($VL3,$VM3),o($Vr1,$VN3),o($VL3,$VO3,{31:2872,208:[1,2873]}),{19:$VP3,21:$VQ3,22:667,129:2874,214:$VR3,229:670,230:$VS3},o($VG,$VT3),o($Vt1,$VN3),o($VG,$VO3,{31:2875,208:[1,2876]}),{19:$VP3,21:$VQ3,22:667,129:2877,214:$VR3,229:670,230:$VS3},o($Vx1,$VU3),o($VA1,$VV3),o($VA1,$VW3),o($VA1,$VX3),{100:[1,2878]},o($VA1,$VT1),{100:[1,2880],106:2879,108:[1,2881],109:[1,2882],110:2883,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,2884]},o($Vu1,$VY3),o($VD1,$VN3),o($Vu1,$VO3,{31:2885,208:[1,2886]}),{19:$VP3,21:$VQ3,22:667,129:2887,214:$VR3,229:670,230:$VS3},o($VA1,$VZ3),{121:[1,2888]},{19:[1,2891],21:[1,2894],22:2890,87:2889,229:2892,230:[1,2893]},o($Vr2,$Vq2,{84:2322,207:2323,83:2895,205:$VN7}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:2896,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($Vr2,$Vq2,{84:2322,207:2323,83:2897,205:$VN7}),o($Vt1,$Vt2,{99:1754,95:2898,101:$V57,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V63),o($VG,$VB3),o($VL3,$VM3),o($Vr1,$VN3),o($VL3,$VO3,{31:2899,208:[1,2900]}),{19:$VP3,21:$VQ3,22:667,129:2901,214:$VR3,229:670,230:$VS3},o($VG,$VT3),o($Vt1,$VN3),o($VG,$VO3,{31:2902,208:[1,2903]}),{19:$VP3,21:$VQ3,22:667,129:2904,214:$VR3,229:670,230:$VS3},o($Vx1,$VU3),o($VA1,$VV3),o($VA1,$VW3),o($VA1,$VX3),{100:[1,2905]},o($VA1,$VT1),{100:[1,2907],106:2906,108:[1,2908],109:[1,2909],110:2910,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,2911]},o($Vu1,$VY3),o($VD1,$VN3),o($Vu1,$VO3,{31:2912,208:[1,2913]}),{19:$VP3,21:$VQ3,22:667,129:2914,214:$VR3,229:670,230:$VS3},o($VA1,$VZ3),{121:[1,2915]},{19:[1,2918],21:[1,2921],22:2917,87:2916,229:2919,230:[1,2920]},o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$VD5),o($Vr1,$VE5),{19:$V67,21:$V77,22:2923,87:2922,229:1789,230:$V87},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$VD5),o($Vt1,$VE5),{19:$V97,21:$Va7,22:2925,87:2924,229:1815,230:$Vb7},o($VA1,$Vd6),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$VD5),o($VD1,$VE5),{19:$Vc7,21:$Vd7,22:2927,87:2926,229:1842,230:$Ve7},o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:2928}),o($VG,$VE1),o($VG,$VF1),{19:[1,2932],21:[1,2936],22:2930,33:2929,215:2931,229:2933,230:[1,2935],231:[1,2934]},{119:[1,2937],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:2938}),o($Vh2,$Vy1,{93:2939}),o($Vt1,$Vz1,{99:2382,95:2940,101:$VP7,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,2941]},o($Vh2,$VT1),{70:[1,2942]},o($Vp2,$Vq2,{83:2943,84:2944,207:2945,205:[1,2946]}),o($Vr2,$Vq2,{83:2947,84:2948,207:2949,205:$Vy8}),o($Vr1,$Vt2,{99:1891,95:2951,101:$Vf7,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:2952,95:2953,91:2954,99:2955,105:2957,107:2958,101:$Vz8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:2952,95:2953,91:2954,99:2955,105:2957,107:2958,101:$Vz8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:2952,95:2953,91:2954,99:2955,105:2957,107:2958,101:$Vz8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:2959,84:2960,207:2961,205:[1,2962]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,2963],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:2964,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($Vx1,$V63),o($VN1,$V73),o($VN1,$V83),o($VN1,$V93),o($VN1,$Va3),{111:[1,2965]},o($VN1,$Vf3),o($Vt1,$VF5),{208:[1,2968],209:2966,210:[1,2967]},o($Vr1,$Vp6),o($Vr1,$Vq6),o($Vr1,$Vr6),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$V04),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V34),o($Vr1,$V44,{217:2969,218:2970,111:[1,2971]}),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Vr1,$Vb4),o($Vr1,$Vc4),o($Vr1,$Vd4),o($Vs6,$Vb3),o($Vs6,$Vc3),o($Vs6,$Vd3),o($Vs6,$Ve3),{208:[1,2974],209:2972,210:[1,2973]},o($Vt1,$Vp6),o($Vt1,$Vq6),o($Vt1,$Vr6),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$V04),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V34),o($Vt1,$V44,{217:2975,218:2976,111:[1,2977]}),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vt1,$Vb4),o($Vt1,$Vc4),o($Vt1,$Vd4),o($Vt6,$Vb3),o($Vt6,$Vc3),o($Vt6,$Vd3),o($Vt6,$Ve3),{19:[1,2980],21:[1,2983],22:2979,87:2978,229:2981,230:[1,2982]},{208:[1,2986],209:2984,210:[1,2985]},o($VD1,$Vp6),o($VD1,$Vq6),o($VD1,$Vr6),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$V04),o($VD1,$V14),o($VD1,$V24),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V34),o($VD1,$V44,{217:2987,218:2988,111:[1,2989]}),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($VD1,$Vb4),o($VD1,$Vc4),o($VD1,$Vd4),o($Vu6,$Vb3),o($Vu6,$Vc3),o($Vu6,$Vd3),o($Vu6,$Ve3),o($Vt1,$VF5),{208:[1,2992],209:2990,210:[1,2991]},o($Vr1,$Vp6),o($Vr1,$Vq6),o($Vr1,$Vr6),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$V04),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V34),o($Vr1,$V44,{217:2993,218:2994,111:[1,2995]}),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Vr1,$Vb4),o($Vr1,$Vc4),o($Vr1,$Vd4),o($Vs6,$Vb3),o($Vs6,$Vc3),o($Vs6,$Vd3),o($Vs6,$Ve3),{208:[1,2998],209:2996,210:[1,2997]},o($Vt1,$Vp6),o($Vt1,$Vq6),o($Vt1,$Vr6),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$V04),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V34),o($Vt1,$V44,{217:2999,218:3000,111:[1,3001]}),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vt1,$Vb4),o($Vt1,$Vc4),o($Vt1,$Vd4),o($Vt6,$Vb3),o($Vt6,$Vc3),o($Vt6,$Vd3),o($Vt6,$Ve3),{19:[1,3004],21:[1,3007],22:3003,87:3002,229:3005,230:[1,3006]},{208:[1,3010],209:3008,210:[1,3009]},o($VD1,$Vp6),o($VD1,$Vq6),o($VD1,$Vr6),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$V04),o($VD1,$V14),o($VD1,$V24),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V34),o($VD1,$V44,{217:3011,218:3012,111:[1,3013]}),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($VD1,$Vb4),o($VD1,$Vc4),o($VD1,$Vd4),o($Vu6,$Vb3),o($Vu6,$Vc3),o($Vu6,$Vd3),o($Vu6,$Ve3),o($V05,$V41),o($V05,$V51),o($V05,$V61),o($VE3,$VD5),o($VE3,$VE5),{19:$Vg7,21:$Vh7,22:3015,87:3014,229:1959,230:$Vi7},o($V15,$V41),o($V15,$V51),o($V15,$V61),o($VF3,$VD5),o($VF3,$VE5),{19:$Vj7,21:$Vk7,22:3017,87:3016,229:1985,230:$Vl7},o($V35,$V41),o($V35,$V51),o($V35,$V61),o($VG3,$VD5),o($VG3,$VE5),{19:$Vm7,21:$Vn7,22:3019,87:3018,229:2011,230:$Vo7},o($VI3,$Vd6),o($VI3,$VK1),o($VI3,$Vn),o($VI3,$Vo),o($VI3,$Vp),o($VI3,$Vq),o($VC3,$Vb1),o($VI,$VJ,{65:3020,67:3021,72:3022,39:3023,78:3024,118:3028,51:$Vc1,53:$Vc1,70:$Vc1,79:[1,3025],80:[1,3026],81:[1,3027]}),o($VC3,$Vg1),o($VC3,$Vh1,{68:3029,64:3030,73:3031,92:3032,94:3033,95:3037,99:3038,96:[1,3034],97:[1,3035],98:[1,3036],101:$VA8,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:3040,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VC3,$Vq1),o($VE3,$Vs1,{82:3041}),o($VF3,$Vs1,{82:3042}),o($Vm6,$Vv1),o($Vm6,$Vw1),o($VH3,$Vy1,{93:3043}),o($VE3,$Vz1,{99:2623,95:3044,101:$V98,102:$VR,103:$VS,104:$VT}),o($VI3,$VB1,{86:3045}),o($VI3,$VB1,{86:3046}),o($VI3,$VB1,{86:3047}),o($VF3,$VC1,{105:2627,107:2628,91:3048,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VG3,$Vs1,{82:3049}),o($Vm6,$VE1),o($Vm6,$VF1),{19:[1,3053],21:[1,3057],22:3051,33:3050,215:3052,229:3054,230:[1,3056],231:[1,3055]},o($VH3,$VG1),o($VH3,$VH1),o($VH3,$VI1),o($VH3,$VJ1),o($VI3,$VK1),o($VL1,$VM1,{164:3058}),o($VJ3,$VO1),{119:[1,3059],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},{100:[1,3060]},o($VH3,$VT1),o($VI3,$Vn),o($VI3,$Vo),{100:[1,3062],106:3061,108:[1,3063],109:[1,3064],110:3065,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,3066]},o($VI3,$Vp),o($VI3,$Vq),o($VC3,$VY3),{121:[1,3067]},o($VC3,$VM3),o($V$4,$VU3),o($V05,$V75),{19:$Vi,21:$Vj,22:3068,229:45,230:$Vk},{19:$VB8,21:$VC8,22:3070,100:[1,3081],108:[1,3082],109:[1,3083],110:3080,183:3071,206:3069,211:3074,212:3075,213:3076,216:3079,219:[1,3084],220:[1,3085],221:[1,3090],222:[1,3091],223:[1,3092],224:[1,3093],225:[1,3086],226:[1,3087],227:[1,3088],228:[1,3089],229:3073,230:$VD8},o($V15,$V75),{19:$Vi,21:$Vj,22:3094,229:45,230:$Vk},{19:$VE8,21:$VF8,22:3096,100:[1,3107],108:[1,3108],109:[1,3109],110:3106,183:3097,206:3095,211:3100,212:3101,213:3102,216:3105,219:[1,3110],220:[1,3111],221:[1,3116],222:[1,3117],223:[1,3118],224:[1,3119],225:[1,3112],226:[1,3113],227:[1,3114],228:[1,3115],229:3099,230:$VG8},o($VI3,$V63),o($VI3,$V73),o($VI3,$V83),o($VI3,$V93),o($VI3,$Va3),{111:[1,3120]},o($VI3,$Vf3),o($V35,$V75),{19:$Vi,21:$Vj,22:3121,229:45,230:$Vk},{19:$VH8,21:$VI8,22:3123,100:[1,3134],108:[1,3135],109:[1,3136],110:3133,183:3124,206:3122,211:3127,212:3128,213:3129,216:3132,219:[1,3137],220:[1,3138],221:[1,3143],222:[1,3144],223:[1,3145],224:[1,3146],225:[1,3139],226:[1,3140],227:[1,3141],228:[1,3142],229:3126,230:$VJ8},o($VG3,$VF5),o($VJ3,$Vd6),o($VJ3,$VK1),o($VJ3,$Vn),o($VJ3,$Vo),o($VJ3,$Vp),o($VJ3,$Vq),o($VC3,$VY3),{121:[1,3147]},o($VC3,$VM3),o($V$4,$VU3),o($V05,$V75),{19:$Vi,21:$Vj,22:3148,229:45,230:$Vk},{19:$VK8,21:$VL8,22:3150,100:[1,3161],108:[1,3162],109:[1,3163],110:3160,183:3151,206:3149,211:3154,212:3155,213:3156,216:3159,219:[1,3164],220:[1,3165],221:[1,3170],222:[1,3171],223:[1,3172],224:[1,3173],225:[1,3166],226:[1,3167],227:[1,3168],228:[1,3169],229:3153,230:$VM8},o($V15,$V75),{19:$Vi,21:$Vj,22:3174,229:45,230:$Vk},{19:$VN8,21:$VO8,22:3176,100:[1,3187],108:[1,3188],109:[1,3189],110:3186,183:3177,206:3175,211:3180,212:3181,213:3182,216:3185,219:[1,3190],220:[1,3191],221:[1,3196],222:[1,3197],223:[1,3198],224:[1,3199],225:[1,3192],226:[1,3193],227:[1,3194],228:[1,3195],229:3179,230:$VP8},o($VI3,$V63),o($VI3,$V73),o($VI3,$V83),o($VI3,$V93),o($VI3,$Va3),{111:[1,3200]},o($VI3,$Vf3),o($V35,$V75),{19:$Vi,21:$Vj,22:3201,229:45,230:$Vk},{19:$VQ8,21:$VR8,22:3203,100:[1,3214],108:[1,3215],109:[1,3216],110:3213,183:3204,206:3202,211:3207,212:3208,213:3209,216:3212,219:[1,3217],220:[1,3218],221:[1,3223],222:[1,3224],223:[1,3225],224:[1,3226],225:[1,3219],226:[1,3220],227:[1,3221],228:[1,3222],229:3206,230:$VS8},o($VG3,$VF5),o($VJ3,$Vd6),o($VJ3,$VK1),o($VJ3,$Vn),o($VJ3,$Vo),o($VJ3,$Vp),o($VJ3,$Vq),o($VT8,$Vq2,{83:3227,84:3228,207:3229,205:$VU8}),o($VB7,$VV8),o($Vr,$Vs,{55:3231,59:3232,41:3233,44:$Vt}),o($VD7,$VW8),o($Vr,$Vs,{59:3234,41:3235,44:$Vt}),o($VD7,$VX8),o($VD7,$VY8),o($VD7,$Va6),o($VD7,$Vb6),{119:[1,3236],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VD7,$VE1),o($VD7,$VF1),{19:[1,3240],21:[1,3244],22:3238,33:3237,215:3239,229:3241,230:[1,3243],231:[1,3242]},o($VD7,$VZ8),o($VD7,$V_6),o($V_8,$Vy1,{93:3245}),o($VD7,$Vz1,{99:2706,95:3246,101:$Vk8,102:$VR,103:$VS,104:$VT}),o($V_8,$VG1),o($V_8,$VH1),o($V_8,$VI1),o($V_8,$VJ1),{100:[1,3247]},o($V_8,$VT1),{70:[1,3248]},o($Vn8,$Vt2,{99:2152,95:3249,101:$VF7,102:$VR,103:$VS,104:$VT}),o($Vm8,$Vu2),o($VD7,$Vv2,{90:3250,95:3251,91:3252,99:3253,105:3255,107:3256,101:$V$8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD7,$Vx2,{90:3250,95:3251,91:3252,99:3253,105:3255,107:3256,101:$V$8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD7,$Vy2,{90:3250,95:3251,91:3252,99:3253,105:3255,107:3256,101:$V$8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vq8,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,3257],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:3258,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($Vp8,$VB2),o($Vp8,$Vw),o($Vp8,$Vx),o($Vp8,$Vn),o($Vp8,$Vo),o($Vp8,$Vy),o($Vp8,$Vp),o($Vp8,$Vq),o($Vm8,$V63),o($Vq8,$V73),o($Vq8,$V83),o($Vq8,$V93),o($Vq8,$Va3),{111:[1,3259]},o($Vq8,$Vf3),o($VT8,$Vq2,{84:3228,207:3229,83:3260,205:$VU8}),o($V09,$Vu7,{153:3261,154:3262,157:$V19,158:$V29,159:$V39,160:$V49}),o($V59,$VA7),o($V69,$VC7,{56:3267}),o($V79,$VE7,{60:3268}),o($VI,$VJ,{63:3269,73:3270,75:3271,76:3272,92:3275,94:3276,87:3278,88:3279,89:3280,78:3281,39:3282,95:3286,22:3287,91:3289,118:3290,99:3294,229:3297,105:3298,107:3299,19:[1,3296],21:[1,3301],69:[1,3273],71:[1,3274],79:[1,3291],80:[1,3292],81:[1,3293],85:[1,3277],96:[1,3283],97:[1,3284],98:[1,3285],101:$V89,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:[1,3288],230:[1,3300]}),o($V09,$Vu7,{154:3262,153:3302,157:$V19,158:$V29,159:$V39,160:$V49}),o($VG7,$VH7,{194:3303}),o($VK6,$V$5),{149:[1,3304]},{149:[1,3305]},o($Vt4,$V99),o($VG7,[2,234]),{149:[1,3307],193:3306,202:[1,3308],203:[1,3309]},{19:$VT6,21:$VU6,22:1624,150:3310,215:1625,229:1627,230:$VV6,231:$VW6},{19:$VT6,21:$VU6,22:1624,150:3311,215:1625,229:1627,230:$VV6,231:$VW6},{70:[1,3312]},{70:[1,3313]},o($VF4,$VX6),o($Vr,$Vs,{238:3314,41:3315,44:$Vt}),o($VF4,$VY6),o($VF4,$Va6),o($VF4,$Vb6),{119:[1,3316],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VF4,$VE1),o($VF4,$VF1),{19:[1,3320],21:[1,3324],22:3318,33:3317,215:3319,229:3321,230:[1,3323],231:[1,3322]},o($VF4,$VZ6),o($VF4,$V_6),o($V$6,$Vy1,{93:3325}),o($VF4,$Vz1,{99:2767,95:3326,101:$Vv8,102:$VR,103:$VS,104:$VT}),o($V$6,$VG1),o($V$6,$VH1),o($V$6,$VI1),o($V$6,$VJ1),{100:[1,3327]},o($V$6,$VT1),{70:[1,3328]},o($VF4,$Vv2,{90:3329,95:3330,91:3331,99:3332,105:3334,107:3335,101:$Va9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VF4,$Vx2,{90:3329,95:3330,91:3331,99:3332,105:3334,107:3335,101:$Va9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VF4,$Vy2,{90:3329,95:3330,91:3331,99:3332,105:3334,107:3335,101:$Va9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vc6,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,3336],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:3337,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($V96,$VB2),o($V96,$Vw),o($V96,$Vx),o($V96,$Vn),o($V96,$Vo),o($V96,$Vy),o($V96,$Vp),o($V96,$Vq),o($Vc6,$V73),o($Vc6,$V83),o($Vc6,$V93),o($Vc6,$Va3),{111:[1,3338]},o($Vc6,$Vf3),o($VF4,$VY6),o($VF4,$Va6),o($VF4,$Vb6),{119:[1,3339],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VF4,$VE1),o($VF4,$VF1),{19:[1,3343],21:[1,3347],22:3341,33:3340,215:3342,229:3344,230:[1,3346],231:[1,3345]},o($VF4,$VZ6),o($VF4,$V_6),o($V$6,$Vy1,{93:3348}),o($VF4,$Vz1,{99:2805,95:3349,101:$Vw8,102:$VR,103:$VS,104:$VT}),o($V$6,$VG1),o($V$6,$VH1),o($V$6,$VI1),o($V$6,$VJ1),{100:[1,3350]},o($V$6,$VT1),{70:[1,3351]},o($VF4,$Vv2,{90:3352,95:3353,91:3354,99:3355,105:3357,107:3358,101:$Vb9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VF4,$Vx2,{90:3352,95:3353,91:3354,99:3355,105:3357,107:3358,101:$Vb9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VF4,$Vy2,{90:3352,95:3353,91:3354,99:3355,105:3357,107:3358,101:$Vb9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vc6,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,3359],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:3360,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($V96,$VB2),o($V96,$Vw),o($V96,$Vx),o($V96,$Vn),o($V96,$Vo),o($V96,$Vy),o($V96,$Vp),o($V96,$Vq),o($Vc6,$V73),o($Vc6,$V83),o($Vc6,$V93),o($Vc6,$Va3),{111:[1,3361]},o($Vc6,$Vf3),o($VF4,$VF5),{19:[1,3364],21:[1,3367],22:3363,87:3362,229:3365,230:[1,3366]},o($Vk3,$Vz6),o($Vk3,$VK1),o($VG,$Vb1),o($VG,$Vc1,{65:3368,67:3369,72:3370,39:3371,78:3372,118:3376,79:[1,3373],80:[1,3374],81:[1,3375],119:$VJ,125:$VJ,127:$VJ,204:$VJ,242:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:3377,64:3378,73:3379,92:3380,94:3381,95:3385,99:3386,96:[1,3382],97:[1,3383],98:[1,3384],101:$Vc9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:3388,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:3389}),o($Vt1,$Vs1,{82:3390}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:3391}),o($Vr1,$Vz1,{99:2860,95:3392,101:$Vx8,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:3393}),o($VA1,$VB1,{86:3394}),o($VA1,$VB1,{86:3395}),o($Vt1,$VC1,{105:2864,107:2865,91:3396,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:3397}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,3401],21:[1,3405],22:3399,33:3398,215:3400,229:3402,230:[1,3404],231:[1,3403]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{164:3406}),o($VN1,$VO1),{119:[1,3407],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},{100:[1,3408]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,3410],106:3409,108:[1,3411],109:[1,3412],110:3413,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,3414]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$VY3),{121:[1,3415]},o($VG,$VM3),o($Vh2,$VU3),o($Vp2,$V75),{19:$Vi,21:$Vj,22:3416,229:45,230:$Vk},{19:$Vd9,21:$Ve9,22:3418,100:[1,3429],108:[1,3430],109:[1,3431],110:3428,183:3419,206:3417,211:3422,212:3423,213:3424,216:3427,219:[1,3432],220:[1,3433],221:[1,3438],222:[1,3439],223:[1,3440],224:[1,3441],225:[1,3434],226:[1,3435],227:[1,3436],228:[1,3437],229:3421,230:$Vf9},o($Vr2,$V75),{19:$Vi,21:$Vj,22:3442,229:45,230:$Vk},{19:$Vg9,21:$Vh9,22:3444,100:[1,3455],108:[1,3456],109:[1,3457],110:3454,183:3445,206:3443,211:3448,212:3449,213:3450,216:3453,219:[1,3458],220:[1,3459],221:[1,3464],222:[1,3465],223:[1,3466],224:[1,3467],225:[1,3460],226:[1,3461],227:[1,3462],228:[1,3463],229:3447,230:$Vi9},o($VA1,$V63),o($VA1,$V73),o($VA1,$V83),o($VA1,$V93),o($VA1,$Va3),{111:[1,3468]},o($VA1,$Vf3),o($VA2,$V75),{19:$Vi,21:$Vj,22:3469,229:45,230:$Vk},{19:$Vj9,21:$Vk9,22:3471,100:[1,3482],108:[1,3483],109:[1,3484],110:3481,183:3472,206:3470,211:3475,212:3476,213:3477,216:3480,219:[1,3485],220:[1,3486],221:[1,3491],222:[1,3492],223:[1,3493],224:[1,3494],225:[1,3487],226:[1,3488],227:[1,3489],228:[1,3490],229:3474,230:$Vl9},o($VD1,$VF5),o($VN1,$Vd6),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($VG,$VY3),{121:[1,3495]},o($VG,$VM3),o($Vh2,$VU3),o($Vp2,$V75),{19:$Vi,21:$Vj,22:3496,229:45,230:$Vk},{19:$Vm9,21:$Vn9,22:3498,100:[1,3509],108:[1,3510],109:[1,3511],110:3508,183:3499,206:3497,211:3502,212:3503,213:3504,216:3507,219:[1,3512],220:[1,3513],221:[1,3518],222:[1,3519],223:[1,3520],224:[1,3521],225:[1,3514],226:[1,3515],227:[1,3516],228:[1,3517],229:3501,230:$Vo9},o($Vr2,$V75),{19:$Vi,21:$Vj,22:3522,229:45,230:$Vk},{19:$Vp9,21:$Vq9,22:3524,100:[1,3535],108:[1,3536],109:[1,3537],110:3534,183:3525,206:3523,211:3528,212:3529,213:3530,216:3533,219:[1,3538],220:[1,3539],221:[1,3544],222:[1,3545],223:[1,3546],224:[1,3547],225:[1,3540],226:[1,3541],227:[1,3542],228:[1,3543],229:3527,230:$Vr9},o($VA1,$V63),o($VA1,$V73),o($VA1,$V83),o($VA1,$V93),o($VA1,$Va3),{111:[1,3548]},o($VA1,$Vf3),o($VA2,$V75),{19:$Vi,21:$Vj,22:3549,229:45,230:$Vk},{19:$Vs9,21:$Vt9,22:3551,100:[1,3562],108:[1,3563],109:[1,3564],110:3561,183:3552,206:3550,211:3555,212:3556,213:3557,216:3560,219:[1,3565],220:[1,3566],221:[1,3571],222:[1,3572],223:[1,3573],224:[1,3574],225:[1,3567],226:[1,3568],227:[1,3569],228:[1,3570],229:3554,230:$Vu9},o($VD1,$VF5),o($VN1,$Vd6),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($Vr1,$Vz6),o($Vr1,$VK1),o($Vt1,$Vz6),o($Vt1,$VK1),o($VD1,$Vz6),o($VD1,$VK1),o($Vr2,$Vq2,{84:2948,207:2949,83:3575,205:$Vy8}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:3576,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($Vr2,$Vq2,{84:2948,207:2949,83:3577,205:$Vy8}),o($Vt1,$Vt2,{99:2382,95:3578,101:$VP7,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V63),o($VG,$VB3),o($VL3,$VM3),o($Vr1,$VN3),o($VL3,$VO3,{31:3579,208:[1,3580]}),{19:$VP3,21:$VQ3,22:667,129:3581,214:$VR3,229:670,230:$VS3},o($VG,$VT3),o($Vt1,$VN3),o($VG,$VO3,{31:3582,208:[1,3583]}),{19:$VP3,21:$VQ3,22:667,129:3584,214:$VR3,229:670,230:$VS3},o($Vx1,$VU3),o($VA1,$VV3),o($VA1,$VW3),o($VA1,$VX3),{100:[1,3585]},o($VA1,$VT1),{100:[1,3587],106:3586,108:[1,3588],109:[1,3589],110:3590,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,3591]},o($Vu1,$VY3),o($VD1,$VN3),o($Vu1,$VO3,{31:3592,208:[1,3593]}),{19:$VP3,21:$VQ3,22:667,129:3594,214:$VR3,229:670,230:$VS3},o($VA1,$VZ3),{121:[1,3595]},{19:[1,3598],21:[1,3601],22:3597,87:3596,229:3599,230:[1,3600]},o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$VD5),o($Vr1,$VE5),{19:$VQ7,21:$VR7,22:3603,87:3602,229:2417,230:$VS7},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$VD5),o($Vt1,$VE5),{19:$VT7,21:$VU7,22:3605,87:3604,229:2443,230:$VV7},o($VA1,$Vd6),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$VD5),o($VD1,$VE5),{19:$VW7,21:$VX7,22:3607,87:3606,229:2470,230:$VY7},o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$VD5),o($Vr1,$VE5),{19:$VZ7,21:$V_7,22:3609,87:3608,229:2497,230:$V$7},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$VD5),o($Vt1,$VE5),{19:$V08,21:$V18,22:3611,87:3610,229:2523,230:$V28},o($VA1,$Vd6),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$VD5),o($VD1,$VE5),{19:$V38,21:$V48,22:3613,87:3612,229:2550,230:$V58},o($VE3,$Vz6),o($VE3,$VK1),o($VF3,$Vz6),o($VF3,$VK1),o($VG3,$Vz6),o($VG3,$VK1),o($VC3,$Vd2),o($VC3,$Ve2),o($VC3,$Vv1),o($VC3,$Vw1),o($VF3,$Vs1,{82:3614}),o($VC3,$VE1),o($VC3,$VF1),{19:[1,3618],21:[1,3622],22:3616,33:3615,215:3617,229:3619,230:[1,3621],231:[1,3620]},{119:[1,3623],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VC3,$Vf2),o($VC3,$Vg2),o($VF3,$Vs1,{82:3624}),o($V$4,$Vy1,{93:3625}),o($VF3,$Vz1,{99:3038,95:3626,101:$VA8,102:$VR,103:$VS,104:$VT}),o($V$4,$VG1),o($V$4,$VH1),o($V$4,$VI1),o($V$4,$VJ1),{100:[1,3627]},o($V$4,$VT1),{70:[1,3628]},o($V05,$Vq2,{83:3629,84:3630,207:3631,205:[1,3632]}),o($V15,$Vq2,{83:3633,84:3634,207:3635,205:$Vv9}),o($VE3,$Vt2,{99:2623,95:3637,101:$V98,102:$VR,103:$VS,104:$VT}),o($VH3,$Vu2),o($VF3,$Vv2,{90:3638,95:3639,91:3640,99:3641,105:3643,107:3644,101:$Vw9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VF3,$Vx2,{90:3638,95:3639,91:3640,99:3641,105:3643,107:3644,101:$Vw9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VF3,$Vy2,{90:3638,95:3639,91:3640,99:3641,105:3643,107:3644,101:$Vw9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VJ3,$Vz2),o($V35,$Vq2,{83:3645,84:3646,207:3647,205:[1,3648]}),o($Vm6,$VB2),o($Vm6,$Vw),o($Vm6,$Vx),o($Vm6,$Vn),o($Vm6,$Vo),o($Vm6,$Vy),o($Vm6,$Vp),o($Vm6,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,3649],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:3650,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($VH3,$V63),o($VJ3,$V73),o($VJ3,$V83),o($VJ3,$V93),o($VJ3,$Va3),{111:[1,3651]},o($VJ3,$Vf3),o($VF3,$VF5),{208:[1,3654],209:3652,210:[1,3653]},o($VE3,$Vp6),o($VE3,$Vq6),o($VE3,$Vr6),o($VE3,$Vn),o($VE3,$Vo),o($VE3,$V04),o($VE3,$V14),o($VE3,$V24),o($VE3,$Vp),o($VE3,$Vq),o($VE3,$V34),o($VE3,$V44,{217:3655,218:3656,111:[1,3657]}),o($VE3,$V54),o($VE3,$V64),o($VE3,$V74),o($VE3,$V84),o($VE3,$V94),o($VE3,$Va4),o($VE3,$Vb4),o($VE3,$Vc4),o($VE3,$Vd4),o($V68,$Vb3),o($V68,$Vc3),o($V68,$Vd3),o($V68,$Ve3),{208:[1,3660],209:3658,210:[1,3659]},o($VF3,$Vp6),o($VF3,$Vq6),o($VF3,$Vr6),o($VF3,$Vn),o($VF3,$Vo),o($VF3,$V04),o($VF3,$V14),o($VF3,$V24),o($VF3,$Vp),o($VF3,$Vq),o($VF3,$V34),o($VF3,$V44,{217:3661,218:3662,111:[1,3663]}),o($VF3,$V54),o($VF3,$V64),o($VF3,$V74),o($VF3,$V84),o($VF3,$V94),o($VF3,$Va4),o($VF3,$Vb4),o($VF3,$Vc4),o($VF3,$Vd4),o($V78,$Vb3),o($V78,$Vc3),o($V78,$Vd3),o($V78,$Ve3),{19:[1,3666],21:[1,3669],22:3665,87:3664,229:3667,230:[1,3668]},{208:[1,3672],209:3670,210:[1,3671]},o($VG3,$Vp6),o($VG3,$Vq6),o($VG3,$Vr6),o($VG3,$Vn),o($VG3,$Vo),o($VG3,$V04),o($VG3,$V14),o($VG3,$V24),o($VG3,$Vp),o($VG3,$Vq),o($VG3,$V34),o($VG3,$V44,{217:3673,218:3674,111:[1,3675]}),o($VG3,$V54),o($VG3,$V64),o($VG3,$V74),o($VG3,$V84),o($VG3,$V94),o($VG3,$Va4),o($VG3,$Vb4),o($VG3,$Vc4),o($VG3,$Vd4),o($V88,$Vb3),o($V88,$Vc3),o($V88,$Vd3),o($V88,$Ve3),o($VF3,$VF5),{208:[1,3678],209:3676,210:[1,3677]},o($VE3,$Vp6),o($VE3,$Vq6),o($VE3,$Vr6),o($VE3,$Vn),o($VE3,$Vo),o($VE3,$V04),o($VE3,$V14),o($VE3,$V24),o($VE3,$Vp),o($VE3,$Vq),o($VE3,$V34),o($VE3,$V44,{217:3679,218:3680,111:[1,3681]}),o($VE3,$V54),o($VE3,$V64),o($VE3,$V74),o($VE3,$V84),o($VE3,$V94),o($VE3,$Va4),o($VE3,$Vb4),o($VE3,$Vc4),o($VE3,$Vd4),o($V68,$Vb3),o($V68,$Vc3),o($V68,$Vd3),o($V68,$Ve3),{208:[1,3684],209:3682,210:[1,3683]},o($VF3,$Vp6),o($VF3,$Vq6),o($VF3,$Vr6),o($VF3,$Vn),o($VF3,$Vo),o($VF3,$V04),o($VF3,$V14),o($VF3,$V24),o($VF3,$Vp),o($VF3,$Vq),o($VF3,$V34),o($VF3,$V44,{217:3685,218:3686,111:[1,3687]}),o($VF3,$V54),o($VF3,$V64),o($VF3,$V74),o($VF3,$V84),o($VF3,$V94),o($VF3,$Va4),o($VF3,$Vb4),o($VF3,$Vc4),o($VF3,$Vd4),o($V78,$Vb3),o($V78,$Vc3),o($V78,$Vd3),o($V78,$Ve3),{19:[1,3690],21:[1,3693],22:3689,87:3688,229:3691,230:[1,3692]},{208:[1,3696],209:3694,210:[1,3695]},o($VG3,$Vp6),o($VG3,$Vq6),o($VG3,$Vr6),o($VG3,$Vn),o($VG3,$Vo),o($VG3,$V04),o($VG3,$V14),o($VG3,$V24),o($VG3,$Vp),o($VG3,$Vq),o($VG3,$V34),o($VG3,$V44,{217:3697,218:3698,111:[1,3699]}),o($VG3,$V54),o($VG3,$V64),o($VG3,$V74),o($VG3,$V84),o($VG3,$V94),o($VG3,$Va4),o($VG3,$Vb4),o($VG3,$Vc4),o($VG3,$Vd4),o($V88,$Vb3),o($V88,$Vc3),o($V88,$Vd3),o($V88,$Ve3),o($Vt4,$Vx9),o($Vt7,$VN3),o($Vt4,$VO3,{31:3700,208:[1,3701]}),{19:$VP3,21:$VQ3,22:667,129:3702,214:$VR3,229:670,230:$VS3},o($VB7,$Vy9),o($VD7,$VE7,{60:3703}),o($VI,$VJ,{63:3704,73:3705,75:3706,76:3707,92:3710,94:3711,87:3713,88:3714,89:3715,78:3716,39:3717,95:3721,22:3722,91:3724,118:3725,99:3729,229:3732,105:3733,107:3734,19:[1,3731],21:[1,3736],69:[1,3708],71:[1,3709],79:[1,3726],80:[1,3727],81:[1,3728],85:[1,3712],96:[1,3718],97:[1,3719],98:[1,3720],101:$Vz9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:[1,3723],230:[1,3735]}),o($VD7,$VA9),o($VI,$VJ,{63:3737,73:3738,75:3739,76:3740,92:3743,94:3744,87:3746,88:3747,89:3748,78:3749,39:3750,95:3754,22:3755,91:3757,118:3758,99:3762,229:3765,105:3766,107:3767,19:[1,3764],21:[1,3769],69:[1,3741],71:[1,3742],79:[1,3759],80:[1,3760],81:[1,3761],85:[1,3745],96:[1,3751],97:[1,3752],98:[1,3753],101:$VB9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:[1,3756],230:[1,3768]}),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:3770,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($VD7,$VB2),o($VD7,$Vw),o($VD7,$Vx),o($VD7,$Vn),o($VD7,$Vo),o($VD7,$Vy),o($VD7,$Vp),o($VD7,$Vq),o($VD7,$Vt2,{99:2706,95:3771,101:$Vk8,102:$VR,103:$VS,104:$VT}),o($V_8,$Vu2),o($V_8,$V63),o($VD7,$VC9),o($Vm8,$VU3),o($Vo8,$VV3),o($Vo8,$VW3),o($Vo8,$VX3),{100:[1,3772]},o($Vo8,$VT1),{100:[1,3774],106:3773,108:[1,3775],109:[1,3776],110:3777,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,3778]},o($Vo8,$VZ3),{121:[1,3779]},{19:[1,3782],21:[1,3785],22:3781,87:3780,229:3783,230:[1,3784]},o($Vt4,$VD9),o($V09,$Vs1,{82:3786}),o($V09,$Va8),o($V09,$Vb8),o($V09,$Vc8),o($V09,$Vd8),o($V09,$Ve8),o($V59,$Vf8,{57:3787,51:[1,3788]}),o($V69,$Vg8,{61:3789,53:[1,3790]}),o($V79,$Vh8),o($V79,$Vi8,{74:3791,76:3792,78:3793,39:3794,118:3795,79:[1,3796],80:[1,3797],81:[1,3798],119:$VJ,125:$VJ,127:$VJ,204:$VJ,242:$VJ}),o($V79,$Vj8),o($V79,$V46,{77:3799,73:3800,92:3801,94:3802,95:3806,99:3807,96:[1,3803],97:[1,3804],98:[1,3805],101:$VE9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:3809,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($V79,$Vl8),o($VF9,$Vy1,{93:3810}),o($VG9,$Vz1,{99:3294,95:3811,101:$V89,102:$VR,103:$VS,104:$VT}),o($VH9,$VB1,{86:3812}),o($VH9,$VB1,{86:3813}),o($VH9,$VB1,{86:3814}),o($V79,$VC1,{105:3298,107:3299,91:3815,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VI9,$Va6),o($VI9,$Vb6),o($VF9,$VG1),o($VF9,$VH1),o($VF9,$VI1),o($VF9,$VJ1),o($VH9,$VK1),o($VL1,$VM1,{164:3816}),o($VJ9,$VO1),{119:[1,3817],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VI9,$VE1),o($VI9,$VF1),{19:[1,3821],21:[1,3825],22:3819,33:3818,215:3820,229:3822,230:[1,3824],231:[1,3823]},{100:[1,3826]},o($VF9,$VT1),o($VH9,$Vn),o($VH9,$Vo),{100:[1,3828],106:3827,108:[1,3829],109:[1,3830],110:3831,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,3832]},o($VH9,$Vp),o($VH9,$Vq),o($V09,$Vs1,{82:3833}),{70:[1,3834],140:$Vr8,198:2744},{19:$VT6,21:$VU6,22:1624,150:3835,215:1625,229:1627,230:$VV6,231:$VW6},{19:$VT6,21:$VU6,22:1624,150:3836,215:1625,229:1627,230:$VV6,231:$VW6},o($VG7,[2,232]),{19:[1,3840],21:[1,3844],22:3838,150:3837,215:3839,229:3841,230:[1,3843],231:[1,3842]},{69:[1,3845]},{69:[1,3846]},{70:[1,3847]},{70:[1,3848]},o($Vt4,$Vt8),o($Vt4,$Vu8),o($VF4,$VI7),o($VI,$VJ,{92:756,94:757,95:767,99:775,241:3849,73:3850,75:3851,76:3852,87:3856,88:3857,89:3858,78:3859,39:3860,22:3861,91:3863,118:3864,229:3869,105:3870,107:3871,19:[1,3868],21:[1,3873],69:[1,3853],71:[1,3854],79:[1,3865],80:[1,3866],81:[1,3867],85:[1,3855],96:$VH4,97:$VI4,98:$VJ4,101:$VK4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:[1,3862],230:[1,3872]}),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:3874,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($VF4,$VB2),o($VF4,$Vw),o($VF4,$Vx),o($VF4,$Vn),o($VF4,$Vo),o($VF4,$Vy),o($VF4,$Vp),o($VF4,$Vq),o($VF4,$Vt2,{99:2767,95:3875,101:$Vv8,102:$VR,103:$VS,104:$VT}),o($V$6,$Vu2),o($V$6,$V63),o($VF4,$VJ7),o($V86,$VV3),o($V86,$VW3),o($V86,$VX3),{100:[1,3876]},o($V86,$VT1),{100:[1,3878],106:3877,108:[1,3879],109:[1,3880],110:3881,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,3882]},o($V86,$VZ3),{121:[1,3883]},{19:[1,3886],21:[1,3889],22:3885,87:3884,229:3887,230:[1,3888]},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:3890,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($VF4,$VB2),o($VF4,$Vw),o($VF4,$Vx),o($VF4,$Vn),o($VF4,$Vo),o($VF4,$Vy),o($VF4,$Vp),o($VF4,$Vq),o($VF4,$Vt2,{99:2805,95:3891,101:$Vw8,102:$VR,103:$VS,104:$VT}),o($V$6,$Vu2),o($V$6,$V63),o($VF4,$VJ7),o($V86,$VV3),o($V86,$VW3),o($V86,$VX3),{100:[1,3892]},o($V86,$VT1),{100:[1,3894],106:3893,108:[1,3895],109:[1,3896],110:3897,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,3898]},o($V86,$VZ3),{121:[1,3899]},{19:[1,3902],21:[1,3905],22:3901,87:3900,229:3903,230:[1,3904]},o($V86,$Vd6),o($V86,$VK1),o($V86,$Vn),o($V86,$Vo),o($V86,$Vp),o($V86,$Vq),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:3906}),o($VG,$VE1),o($VG,$VF1),{19:[1,3910],21:[1,3914],22:3908,33:3907,215:3909,229:3911,230:[1,3913],231:[1,3912]},{119:[1,3915],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:3916}),o($Vh2,$Vy1,{93:3917}),o($Vt1,$Vz1,{99:3386,95:3918,101:$Vc9,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,3919]},o($Vh2,$VT1),{70:[1,3920]},o($Vp2,$Vq2,{83:3921,84:3922,207:3923,205:[1,3924]}),o($Vr2,$Vq2,{83:3925,84:3926,207:3927,205:$VK9}),o($Vr1,$Vt2,{99:2860,95:3929,101:$Vx8,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:3930,95:3931,91:3932,99:3933,105:3935,107:3936,101:$VL9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:3930,95:3931,91:3932,99:3933,105:3935,107:3936,101:$VL9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:3930,95:3931,91:3932,99:3933,105:3935,107:3936,101:$VL9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:3937,84:3938,207:3939,205:[1,3940]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,3941],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:3942,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($Vx1,$V63),o($VN1,$V73),o($VN1,$V83),o($VN1,$V93),o($VN1,$Va3),{111:[1,3943]},o($VN1,$Vf3),o($Vt1,$VF5),{208:[1,3946],209:3944,210:[1,3945]},o($Vr1,$Vp6),o($Vr1,$Vq6),o($Vr1,$Vr6),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$V04),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V34),o($Vr1,$V44,{217:3947,218:3948,111:[1,3949]}),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Vr1,$Vb4),o($Vr1,$Vc4),o($Vr1,$Vd4),o($Vs6,$Vb3),o($Vs6,$Vc3),o($Vs6,$Vd3),o($Vs6,$Ve3),{208:[1,3952],209:3950,210:[1,3951]},o($Vt1,$Vp6),o($Vt1,$Vq6),o($Vt1,$Vr6),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$V04),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V34),o($Vt1,$V44,{217:3953,218:3954,111:[1,3955]}),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vt1,$Vb4),o($Vt1,$Vc4),o($Vt1,$Vd4),o($Vt6,$Vb3),o($Vt6,$Vc3),o($Vt6,$Vd3),o($Vt6,$Ve3),{19:[1,3958],21:[1,3961],22:3957,87:3956,229:3959,230:[1,3960]},{208:[1,3964],209:3962,210:[1,3963]},o($VD1,$Vp6),o($VD1,$Vq6),o($VD1,$Vr6),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$V04),o($VD1,$V14),o($VD1,$V24),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V34),o($VD1,$V44,{217:3965,218:3966,111:[1,3967]}),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($VD1,$Vb4),o($VD1,$Vc4),o($VD1,$Vd4),o($Vu6,$Vb3),o($Vu6,$Vc3),o($Vu6,$Vd3),o($Vu6,$Ve3),o($Vt1,$VF5),{208:[1,3970],209:3968,210:[1,3969]},o($Vr1,$Vp6),o($Vr1,$Vq6),o($Vr1,$Vr6),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$V04),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V34),o($Vr1,$V44,{217:3971,218:3972,111:[1,3973]}),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Vr1,$Vb4),o($Vr1,$Vc4),o($Vr1,$Vd4),o($Vs6,$Vb3),o($Vs6,$Vc3),o($Vs6,$Vd3),o($Vs6,$Ve3),{208:[1,3976],209:3974,210:[1,3975]},o($Vt1,$Vp6),o($Vt1,$Vq6),o($Vt1,$Vr6),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$V04),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V34),o($Vt1,$V44,{217:3977,218:3978,111:[1,3979]}),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vt1,$Vb4),o($Vt1,$Vc4),o($Vt1,$Vd4),o($Vt6,$Vb3),o($Vt6,$Vc3),o($Vt6,$Vd3),o($Vt6,$Ve3),{19:[1,3982],21:[1,3985],22:3981,87:3980,229:3983,230:[1,3984]},{208:[1,3988],209:3986,210:[1,3987]},o($VD1,$Vp6),o($VD1,$Vq6),o($VD1,$Vr6),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$V04),o($VD1,$V14),o($VD1,$V24),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V34),o($VD1,$V44,{217:3989,218:3990,111:[1,3991]}),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($VD1,$Vb4),o($VD1,$Vc4),o($VD1,$Vd4),o($Vu6,$Vb3),o($Vu6,$Vc3),o($Vu6,$Vd3),o($Vu6,$Ve3),o($VG,$VY3),{121:[1,3992]},o($VG,$VM3),o($Vh2,$VU3),o($Vp2,$V75),{19:$Vi,21:$Vj,22:3993,229:45,230:$Vk},{19:$VM9,21:$VN9,22:3995,100:[1,4006],108:[1,4007],109:[1,4008],110:4005,183:3996,206:3994,211:3999,212:4000,213:4001,216:4004,219:[1,4009],220:[1,4010],221:[1,4015],222:[1,4016],223:[1,4017],224:[1,4018],225:[1,4011],226:[1,4012],227:[1,4013],228:[1,4014],229:3998,230:$VO9},o($Vr2,$V75),{19:$Vi,21:$Vj,22:4019,229:45,230:$Vk},{19:$VP9,21:$VQ9,22:4021,100:[1,4032],108:[1,4033],109:[1,4034],110:4031,183:4022,206:4020,211:4025,212:4026,213:4027,216:4030,219:[1,4035],220:[1,4036],221:[1,4041],222:[1,4042],223:[1,4043],224:[1,4044],225:[1,4037],226:[1,4038],227:[1,4039],228:[1,4040],229:4024,230:$VR9},o($VA1,$V63),o($VA1,$V73),o($VA1,$V83),o($VA1,$V93),o($VA1,$Va3),{111:[1,4045]},o($VA1,$Vf3),o($VA2,$V75),{19:$Vi,21:$Vj,22:4046,229:45,230:$Vk},{19:$VS9,21:$VT9,22:4048,100:[1,4059],108:[1,4060],109:[1,4061],110:4058,183:4049,206:4047,211:4052,212:4053,213:4054,216:4057,219:[1,4062],220:[1,4063],221:[1,4068],222:[1,4069],223:[1,4070],224:[1,4071],225:[1,4064],226:[1,4065],227:[1,4066],228:[1,4067],229:4051,230:$VU9},o($VD1,$VF5),o($VN1,$Vd6),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($Vr1,$Vz6),o($Vr1,$VK1),o($Vt1,$Vz6),o($Vt1,$VK1),o($VD1,$Vz6),o($VD1,$VK1),o($Vr1,$Vz6),o($Vr1,$VK1),o($Vt1,$Vz6),o($Vt1,$VK1),o($VD1,$Vz6),o($VD1,$VK1),o($V15,$Vq2,{84:3634,207:3635,83:4072,205:$Vv9}),o($VC3,$VB2),o($VC3,$Vw),o($VC3,$Vx),o($VC3,$Vn),o($VC3,$Vo),o($VC3,$Vy),o($VC3,$Vp),o($VC3,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:4073,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($V15,$Vq2,{84:3634,207:3635,83:4074,205:$Vv9}),o($VF3,$Vt2,{99:3038,95:4075,101:$VA8,102:$VR,103:$VS,104:$VT}),o($V$4,$Vu2),o($V$4,$V63),o($VC3,$VB3),o($Vl6,$VM3),o($VE3,$VN3),o($Vl6,$VO3,{31:4076,208:[1,4077]}),{19:$VP3,21:$VQ3,22:667,129:4078,214:$VR3,229:670,230:$VS3},o($VC3,$VT3),o($VF3,$VN3),o($VC3,$VO3,{31:4079,208:[1,4080]}),{19:$VP3,21:$VQ3,22:667,129:4081,214:$VR3,229:670,230:$VS3},o($VH3,$VU3),o($VI3,$VV3),o($VI3,$VW3),o($VI3,$VX3),{100:[1,4082]},o($VI3,$VT1),{100:[1,4084],106:4083,108:[1,4085],109:[1,4086],110:4087,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,4088]},o($Vm6,$VY3),o($VG3,$VN3),o($Vm6,$VO3,{31:4089,208:[1,4090]}),{19:$VP3,21:$VQ3,22:667,129:4091,214:$VR3,229:670,230:$VS3},o($VI3,$VZ3),{121:[1,4092]},{19:[1,4095],21:[1,4098],22:4094,87:4093,229:4096,230:[1,4097]},o($V05,$V41),o($V05,$V51),o($V05,$V61),o($VE3,$VD5),o($VE3,$VE5),{19:$VB8,21:$VC8,22:4100,87:4099,229:3073,230:$VD8},o($V15,$V41),o($V15,$V51),o($V15,$V61),o($VF3,$VD5),o($VF3,$VE5),{19:$VE8,21:$VF8,22:4102,87:4101,229:3099,230:$VG8},o($VI3,$Vd6),o($VI3,$VK1),o($VI3,$Vn),o($VI3,$Vo),o($VI3,$Vp),o($VI3,$Vq),o($V35,$V41),o($V35,$V51),o($V35,$V61),o($VG3,$VD5),o($VG3,$VE5),{19:$VH8,21:$VI8,22:4104,87:4103,229:3126,230:$VJ8},o($V05,$V41),o($V05,$V51),o($V05,$V61),o($VE3,$VD5),o($VE3,$VE5),{19:$VK8,21:$VL8,22:4106,87:4105,229:3153,230:$VM8},o($V15,$V41),o($V15,$V51),o($V15,$V61),o($VF3,$VD5),o($VF3,$VE5),{19:$VN8,21:$VO8,22:4108,87:4107,229:3179,230:$VP8},o($VI3,$Vd6),o($VI3,$VK1),o($VI3,$Vn),o($VI3,$Vo),o($VI3,$Vp),o($VI3,$Vq),o($V35,$V41),o($V35,$V51),o($V35,$V61),o($VG3,$VD5),o($VG3,$VE5),{19:$VQ8,21:$VR8,22:4110,87:4109,229:3206,230:$VS8},o($VT8,$V75),{19:$Vi,21:$Vj,22:4111,229:45,230:$Vk},{19:$VV9,21:$VW9,22:4113,100:[1,4124],108:[1,4125],109:[1,4126],110:4123,183:4114,206:4112,211:4117,212:4118,213:4119,216:4122,219:[1,4127],220:[1,4128],221:[1,4133],222:[1,4134],223:[1,4135],224:[1,4136],225:[1,4129],226:[1,4130],227:[1,4131],228:[1,4132],229:4116,230:$VX9},o($VB7,$Vg8,{61:4137,53:[1,4138]}),o($VD7,$Vh8),o($VD7,$Vi8,{74:4139,76:4140,78:4141,39:4142,118:4143,79:[1,4144],80:[1,4145],81:[1,4146],119:$VJ,125:$VJ,127:$VJ,204:$VJ,242:$VJ}),o($VD7,$Vj8),o($VD7,$V46,{77:4147,73:4148,92:4149,94:4150,95:4154,99:4155,96:[1,4151],97:[1,4152],98:[1,4153],101:$VY9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:4157,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VD7,$Vl8),o($Vm8,$Vy1,{93:4158}),o($Vn8,$Vz1,{99:3729,95:4159,101:$Vz9,102:$VR,103:$VS,104:$VT}),o($Vo8,$VB1,{86:4160}),o($Vo8,$VB1,{86:4161}),o($Vo8,$VB1,{86:4162}),o($VD7,$VC1,{105:3733,107:3734,91:4163,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vp8,$Va6),o($Vp8,$Vb6),o($Vm8,$VG1),o($Vm8,$VH1),o($Vm8,$VI1),o($Vm8,$VJ1),o($Vo8,$VK1),o($VL1,$VM1,{164:4164}),o($Vq8,$VO1),{119:[1,4165],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($Vp8,$VE1),o($Vp8,$VF1),{19:[1,4169],21:[1,4173],22:4167,33:4166,215:4168,229:4170,230:[1,4172],231:[1,4171]},{100:[1,4174]},o($Vm8,$VT1),o($Vo8,$Vn),o($Vo8,$Vo),{100:[1,4176],106:4175,108:[1,4177],109:[1,4178],110:4179,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,4180]},o($Vo8,$Vp),o($Vo8,$Vq),o($VD7,$Vh8),o($VD7,$Vi8,{74:4181,76:4182,78:4183,39:4184,118:4185,79:[1,4186],80:[1,4187],81:[1,4188],119:$VJ,125:$VJ,127:$VJ,204:$VJ,242:$VJ}),o($VD7,$Vj8),o($VD7,$V46,{77:4189,73:4190,92:4191,94:4192,95:4196,99:4197,96:[1,4193],97:[1,4194],98:[1,4195],101:$VZ9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:4199,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VD7,$Vl8),o($Vm8,$Vy1,{93:4200}),o($Vn8,$Vz1,{99:3762,95:4201,101:$VB9,102:$VR,103:$VS,104:$VT}),o($Vo8,$VB1,{86:4202}),o($Vo8,$VB1,{86:4203}),o($Vo8,$VB1,{86:4204}),o($VD7,$VC1,{105:3766,107:3767,91:4205,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vp8,$Va6),o($Vp8,$Vb6),o($Vm8,$VG1),o($Vm8,$VH1),o($Vm8,$VI1),o($Vm8,$VJ1),o($Vo8,$VK1),o($VL1,$VM1,{164:4206}),o($Vq8,$VO1),{119:[1,4207],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($Vp8,$VE1),o($Vp8,$VF1),{19:[1,4211],21:[1,4215],22:4209,33:4208,215:4210,229:4212,230:[1,4214],231:[1,4213]},{100:[1,4216]},o($Vm8,$VT1),o($Vo8,$Vn),o($Vo8,$Vo),{100:[1,4218],106:4217,108:[1,4219],109:[1,4220],110:4221,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,4222]},o($Vo8,$Vp),o($Vo8,$Vq),{121:[1,4223]},o($V_8,$VU3),o($Vo8,$V63),o($Vo8,$V73),o($Vo8,$V83),o($Vo8,$V93),o($Vo8,$Va3),{111:[1,4224]},o($Vo8,$Vf3),o($Vp8,$VF5),o($Vq8,$Vd6),o($Vq8,$VK1),o($Vq8,$Vn),o($Vq8,$Vo),o($Vq8,$Vp),o($Vq8,$Vq),o($V_9,$Vq2,{83:4225,84:4226,207:4227,205:$V$9}),o($V69,$VV8),o($Vr,$Vs,{55:4229,59:4230,41:4231,44:$Vt}),o($V79,$VW8),o($Vr,$Vs,{59:4232,41:4233,44:$Vt}),o($V79,$VX8),o($V79,$VY8),o($V79,$Va6),o($V79,$Vb6),{119:[1,4234],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($V79,$VE1),o($V79,$VF1),{19:[1,4238],21:[1,4242],22:4236,33:4235,215:4237,229:4239,230:[1,4241],231:[1,4240]},o($V79,$VZ8),o($V79,$V_6),o($V0a,$Vy1,{93:4243}),o($V79,$Vz1,{99:3807,95:4244,101:$VE9,102:$VR,103:$VS,104:$VT}),o($V0a,$VG1),o($V0a,$VH1),o($V0a,$VI1),o($V0a,$VJ1),{100:[1,4245]},o($V0a,$VT1),{70:[1,4246]},o($VG9,$Vt2,{99:3294,95:4247,101:$V89,102:$VR,103:$VS,104:$VT}),o($VF9,$Vu2),o($V79,$Vv2,{90:4248,95:4249,91:4250,99:4251,105:4253,107:4254,101:$V1a,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V79,$Vx2,{90:4248,95:4249,91:4250,99:4251,105:4253,107:4254,101:$V1a,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V79,$Vy2,{90:4248,95:4249,91:4250,99:4251,105:4253,107:4254,101:$V1a,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VJ9,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,4255],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:4256,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($VI9,$VB2),o($VI9,$Vw),o($VI9,$Vx),o($VI9,$Vn),o($VI9,$Vo),o($VI9,$Vy),o($VI9,$Vp),o($VI9,$Vq),o($VF9,$V63),o($VJ9,$V73),o($VJ9,$V83),o($VJ9,$V93),o($VJ9,$Va3),{111:[1,4257]},o($VJ9,$Vf3),o($V_9,$Vq2,{84:4226,207:4227,83:4258,205:$V$9}),o($VK6,$V99),{70:[1,4259]},{70:[1,4260]},o($VG7,$V$5),o($VG7,$VZ5),o($VG7,$V_5),o($VG7,$Vn),o($VG7,$Vo),o($VG7,$Vy),o($VG7,$Vp),o($VG7,$Vq),{149:[1,4261]},{149:[1,4262]},o($VG7,$Vt8),o($VG7,$Vu8),o($VF4,$V26),o($VI,$VJ,{76:4263,78:4264,39:4265,118:4266,79:[1,4267],80:[1,4268],81:[1,4269]}),o($VF4,$V36),o($VF4,$V46,{77:4270,73:4271,92:4272,94:4273,95:4277,99:4278,96:[1,4274],97:[1,4275],98:[1,4276],101:$V2a,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:4280,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VF4,$V66),o($V86,$VB1,{86:4281}),o($V86,$VB1,{86:4282}),o($V86,$VB1,{86:4283}),o($VF4,$VC1,{105:3870,107:3871,91:4284,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V96,$Va6),o($V96,$Vb6),o($V86,$VK1),o($VL1,$VM1,{164:4285}),o($Vc6,$VO1),{119:[1,4286],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($V96,$VE1),o($V96,$VF1),{19:[1,4290],21:[1,4294],22:4288,33:4287,215:4289,229:4291,230:[1,4293],231:[1,4292]},o($V86,$Vn),o($V86,$Vo),{100:[1,4296],106:4295,108:[1,4297],109:[1,4298],110:4299,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,4300]},o($V86,$Vp),o($V86,$Vq),{121:[1,4301]},o($V$6,$VU3),o($V86,$V63),o($V86,$V73),o($V86,$V83),o($V86,$V93),o($V86,$Va3),{111:[1,4302]},o($V86,$Vf3),o($V96,$VF5),o($Vc6,$Vd6),o($Vc6,$VK1),o($Vc6,$Vn),o($Vc6,$Vo),o($Vc6,$Vp),o($Vc6,$Vq),{121:[1,4303]},o($V$6,$VU3),o($V86,$V63),o($V86,$V73),o($V86,$V83),o($V86,$V93),o($V86,$Va3),{111:[1,4304]},o($V86,$Vf3),o($V96,$VF5),o($Vc6,$Vd6),o($Vc6,$VK1),o($Vc6,$Vn),o($Vc6,$Vo),o($Vc6,$Vp),o($Vc6,$Vq),o($Vr2,$Vq2,{84:3926,207:3927,83:4305,205:$VK9}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:4306,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($Vr2,$Vq2,{84:3926,207:3927,83:4307,205:$VK9}),o($Vt1,$Vt2,{99:3386,95:4308,101:$Vc9,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V63),o($VG,$VB3),o($VL3,$VM3),o($Vr1,$VN3),o($VL3,$VO3,{31:4309,208:[1,4310]}),{19:$VP3,21:$VQ3,22:667,129:4311,214:$VR3,229:670,230:$VS3},o($VG,$VT3),o($Vt1,$VN3),o($VG,$VO3,{31:4312,208:[1,4313]}),{19:$VP3,21:$VQ3,22:667,129:4314,214:$VR3,229:670,230:$VS3},o($Vx1,$VU3),o($VA1,$VV3),o($VA1,$VW3),o($VA1,$VX3),{100:[1,4315]},o($VA1,$VT1),{100:[1,4317],106:4316,108:[1,4318],109:[1,4319],110:4320,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,4321]},o($Vu1,$VY3),o($VD1,$VN3),o($Vu1,$VO3,{31:4322,208:[1,4323]}),{19:$VP3,21:$VQ3,22:667,129:4324,214:$VR3,229:670,230:$VS3},o($VA1,$VZ3),{121:[1,4325]},{19:[1,4328],21:[1,4331],22:4327,87:4326,229:4329,230:[1,4330]},o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$VD5),o($Vr1,$VE5),{19:$Vd9,21:$Ve9,22:4333,87:4332,229:3421,230:$Vf9},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$VD5),o($Vt1,$VE5),{19:$Vg9,21:$Vh9,22:4335,87:4334,229:3447,230:$Vi9},o($VA1,$Vd6),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$VD5),o($VD1,$VE5),{19:$Vj9,21:$Vk9,22:4337,87:4336,229:3474,230:$Vl9},o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$VD5),o($Vr1,$VE5),{19:$Vm9,21:$Vn9,22:4339,87:4338,229:3501,230:$Vo9},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$VD5),o($Vt1,$VE5),{19:$Vp9,21:$Vq9,22:4341,87:4340,229:3527,230:$Vr9},o($VA1,$Vd6),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$VD5),o($VD1,$VE5),{19:$Vs9,21:$Vt9,22:4343,87:4342,229:3554,230:$Vu9},o($Vt1,$VF5),{208:[1,4346],209:4344,210:[1,4345]},o($Vr1,$Vp6),o($Vr1,$Vq6),o($Vr1,$Vr6),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$V04),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V34),o($Vr1,$V44,{217:4347,218:4348,111:[1,4349]}),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Vr1,$Vb4),o($Vr1,$Vc4),o($Vr1,$Vd4),o($Vs6,$Vb3),o($Vs6,$Vc3),o($Vs6,$Vd3),o($Vs6,$Ve3),{208:[1,4352],209:4350,210:[1,4351]},o($Vt1,$Vp6),o($Vt1,$Vq6),o($Vt1,$Vr6),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$V04),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V34),o($Vt1,$V44,{217:4353,218:4354,111:[1,4355]}),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vt1,$Vb4),o($Vt1,$Vc4),o($Vt1,$Vd4),o($Vt6,$Vb3),o($Vt6,$Vc3),o($Vt6,$Vd3),o($Vt6,$Ve3),{19:[1,4358],21:[1,4361],22:4357,87:4356,229:4359,230:[1,4360]},{208:[1,4364],209:4362,210:[1,4363]},o($VD1,$Vp6),o($VD1,$Vq6),o($VD1,$Vr6),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$V04),o($VD1,$V14),o($VD1,$V24),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V34),o($VD1,$V44,{217:4365,218:4366,111:[1,4367]}),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($VD1,$Vb4),o($VD1,$Vc4),o($VD1,$Vd4),o($Vu6,$Vb3),o($Vu6,$Vc3),o($Vu6,$Vd3),o($Vu6,$Ve3),o($VC3,$VY3),{121:[1,4368]},o($VC3,$VM3),o($V$4,$VU3),o($V05,$V75),{19:$Vi,21:$Vj,22:4369,229:45,230:$Vk},{19:$V3a,21:$V4a,22:4371,100:[1,4382],108:[1,4383],109:[1,4384],110:4381,183:4372,206:4370,211:4375,212:4376,213:4377,216:4380,219:[1,4385],220:[1,4386],221:[1,4391],222:[1,4392],223:[1,4393],224:[1,4394],225:[1,4387],226:[1,4388],227:[1,4389],228:[1,4390],229:4374,230:$V5a},o($V15,$V75),{19:$Vi,21:$Vj,22:4395,229:45,230:$Vk},{19:$V6a,21:$V7a,22:4397,100:[1,4408],108:[1,4409],109:[1,4410],110:4407,183:4398,206:4396,211:4401,212:4402,213:4403,216:4406,219:[1,4411],220:[1,4412],221:[1,4417],222:[1,4418],223:[1,4419],224:[1,4420],225:[1,4413],226:[1,4414],227:[1,4415],228:[1,4416],229:4400,230:$V8a},o($VI3,$V63),o($VI3,$V73),o($VI3,$V83),o($VI3,$V93),o($VI3,$Va3),{111:[1,4421]},o($VI3,$Vf3),o($V35,$V75),{19:$Vi,21:$Vj,22:4422,229:45,230:$Vk},{19:$V9a,21:$Vaa,22:4424,100:[1,4435],108:[1,4436],109:[1,4437],110:4434,183:4425,206:4423,211:4428,212:4429,213:4430,216:4433,219:[1,4438],220:[1,4439],221:[1,4444],222:[1,4445],223:[1,4446],224:[1,4447],225:[1,4440],226:[1,4441],227:[1,4442],228:[1,4443],229:4427,230:$Vba},o($VG3,$VF5),o($VJ3,$Vd6),o($VJ3,$VK1),o($VJ3,$Vn),o($VJ3,$Vo),o($VJ3,$Vp),o($VJ3,$Vq),o($VE3,$Vz6),o($VE3,$VK1),o($VF3,$Vz6),o($VF3,$VK1),o($VG3,$Vz6),o($VG3,$VK1),o($VE3,$Vz6),o($VE3,$VK1),o($VF3,$Vz6),o($VF3,$VK1),o($VG3,$Vz6),o($VG3,$VK1),{208:[1,4450],209:4448,210:[1,4449]},o($Vt7,$Vp6),o($Vt7,$Vq6),o($Vt7,$Vr6),o($Vt7,$Vn),o($Vt7,$Vo),o($Vt7,$V04),o($Vt7,$V14),o($Vt7,$V24),o($Vt7,$Vp),o($Vt7,$Vq),o($Vt7,$V34),o($Vt7,$V44,{217:4451,218:4452,111:[1,4453]}),o($Vt7,$V54),o($Vt7,$V64),o($Vt7,$V74),o($Vt7,$V84),o($Vt7,$V94),o($Vt7,$Va4),o($Vt7,$Vb4),o($Vt7,$Vc4),o($Vt7,$Vd4),o($Vca,$Vb3),o($Vca,$Vc3),o($Vca,$Vd3),o($Vca,$Ve3),o($VD7,$VW8),o($Vr,$Vs,{59:4454,41:4455,44:$Vt}),o($VD7,$VX8),o($VD7,$VY8),o($VD7,$Va6),o($VD7,$Vb6),{119:[1,4456],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VD7,$VE1),o($VD7,$VF1),{19:[1,4460],21:[1,4464],22:4458,33:4457,215:4459,229:4461,230:[1,4463],231:[1,4462]},o($VD7,$VZ8),o($VD7,$V_6),o($V_8,$Vy1,{93:4465}),o($VD7,$Vz1,{99:4155,95:4466,101:$VY9,102:$VR,103:$VS,104:$VT}),o($V_8,$VG1),o($V_8,$VH1),o($V_8,$VI1),o($V_8,$VJ1),{100:[1,4467]},o($V_8,$VT1),{70:[1,4468]},o($Vn8,$Vt2,{99:3729,95:4469,101:$Vz9,102:$VR,103:$VS,104:$VT}),o($Vm8,$Vu2),o($VD7,$Vv2,{90:4470,95:4471,91:4472,99:4473,105:4475,107:4476,101:$Vda,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD7,$Vx2,{90:4470,95:4471,91:4472,99:4473,105:4475,107:4476,101:$Vda,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD7,$Vy2,{90:4470,95:4471,91:4472,99:4473,105:4475,107:4476,101:$Vda,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vq8,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,4477],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:4478,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($Vp8,$VB2),o($Vp8,$Vw),o($Vp8,$Vx),o($Vp8,$Vn),o($Vp8,$Vo),o($Vp8,$Vy),o($Vp8,$Vp),o($Vp8,$Vq),o($Vm8,$V63),o($Vq8,$V73),o($Vq8,$V83),o($Vq8,$V93),o($Vq8,$Va3),{111:[1,4479]},o($Vq8,$Vf3),o($VD7,$VX8),o($VD7,$VY8),o($VD7,$Va6),o($VD7,$Vb6),{119:[1,4480],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VD7,$VE1),o($VD7,$VF1),{19:[1,4484],21:[1,4488],22:4482,33:4481,215:4483,229:4485,230:[1,4487],231:[1,4486]},o($VD7,$VZ8),o($VD7,$V_6),o($V_8,$Vy1,{93:4489}),o($VD7,$Vz1,{99:4197,95:4490,101:$VZ9,102:$VR,103:$VS,104:$VT}),o($V_8,$VG1),o($V_8,$VH1),o($V_8,$VI1),o($V_8,$VJ1),{100:[1,4491]},o($V_8,$VT1),{70:[1,4492]},o($Vn8,$Vt2,{99:3762,95:4493,101:$VB9,102:$VR,103:$VS,104:$VT}),o($Vm8,$Vu2),o($VD7,$Vv2,{90:4494,95:4495,91:4496,99:4497,105:4499,107:4500,101:$Vea,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD7,$Vx2,{90:4494,95:4495,91:4496,99:4497,105:4499,107:4500,101:$Vea,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD7,$Vy2,{90:4494,95:4495,91:4496,99:4497,105:4499,107:4500,101:$Vea,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vq8,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,4501],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:4502,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($Vp8,$VB2),o($Vp8,$Vw),o($Vp8,$Vx),o($Vp8,$Vn),o($Vp8,$Vo),o($Vp8,$Vy),o($Vp8,$Vp),o($Vp8,$Vq),o($Vm8,$V63),o($Vq8,$V73),o($Vq8,$V83),o($Vq8,$V93),o($Vq8,$Va3),{111:[1,4503]},o($Vq8,$Vf3),o($VD7,$VF5),{19:[1,4506],21:[1,4509],22:4505,87:4504,229:4507,230:[1,4508]},o($VK6,$Vx9),o($V09,$VN3),o($VK6,$VO3,{31:4510,208:[1,4511]}),{19:$VP3,21:$VQ3,22:667,129:4512,214:$VR3,229:670,230:$VS3},o($V69,$Vy9),o($V79,$VE7,{60:4513}),o($VI,$VJ,{63:4514,73:4515,75:4516,76:4517,92:4520,94:4521,87:4523,88:4524,89:4525,78:4526,39:4527,95:4531,22:4532,91:4534,118:4535,99:4539,229:4542,105:4543,107:4544,19:[1,4541],21:[1,4546],69:[1,4518],71:[1,4519],79:[1,4536],80:[1,4537],81:[1,4538],85:[1,4522],96:[1,4528],97:[1,4529],98:[1,4530],101:$Vfa,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:[1,4533],230:[1,4545]}),o($V79,$VA9),o($VI,$VJ,{63:4547,73:4548,75:4549,76:4550,92:4553,94:4554,87:4556,88:4557,89:4558,78:4559,39:4560,95:4564,22:4565,91:4567,118:4568,99:4572,229:4575,105:4576,107:4577,19:[1,4574],21:[1,4579],69:[1,4551],71:[1,4552],79:[1,4569],80:[1,4570],81:[1,4571],85:[1,4555],96:[1,4561],97:[1,4562],98:[1,4563],101:$Vga,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:[1,4566],230:[1,4578]}),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:4580,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($V79,$VB2),o($V79,$Vw),o($V79,$Vx),o($V79,$Vn),o($V79,$Vo),o($V79,$Vy),o($V79,$Vp),o($V79,$Vq),o($V79,$Vt2,{99:3807,95:4581,101:$VE9,102:$VR,103:$VS,104:$VT}),o($V0a,$Vu2),o($V0a,$V63),o($V79,$VC9),o($VF9,$VU3),o($VH9,$VV3),o($VH9,$VW3),o($VH9,$VX3),{100:[1,4582]},o($VH9,$VT1),{100:[1,4584],106:4583,108:[1,4585],109:[1,4586],110:4587,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,4588]},o($VH9,$VZ3),{121:[1,4589]},{19:[1,4592],21:[1,4595],22:4591,87:4590,229:4593,230:[1,4594]},o($VK6,$VD9),o($VK6,$Vt8),o($VK6,$Vu8),{19:$VT6,21:$VU6,22:1624,150:4596,215:1625,229:1627,230:$VV6,231:$VW6},{19:$VT6,21:$VU6,22:1624,150:4597,215:1625,229:1627,230:$VV6,231:$VW6},o($VF4,$VY6),o($VF4,$Va6),o($VF4,$Vb6),{119:[1,4598],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VF4,$VE1),o($VF4,$VF1),{19:[1,4602],21:[1,4606],22:4600,33:4599,215:4601,229:4603,230:[1,4605],231:[1,4604]},o($VF4,$VZ6),o($VF4,$V_6),o($V$6,$Vy1,{93:4607}),o($VF4,$Vz1,{99:4278,95:4608,101:$V2a,102:$VR,103:$VS,104:$VT}),o($V$6,$VG1),o($V$6,$VH1),o($V$6,$VI1),o($V$6,$VJ1),{100:[1,4609]},o($V$6,$VT1),{70:[1,4610]},o($VF4,$Vv2,{90:4611,95:4612,91:4613,99:4614,105:4616,107:4617,101:$Vha,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VF4,$Vx2,{90:4611,95:4612,91:4613,99:4614,105:4616,107:4617,101:$Vha,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VF4,$Vy2,{90:4611,95:4612,91:4613,99:4614,105:4616,107:4617,101:$Vha,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vc6,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,4618],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:4619,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($V96,$VB2),o($V96,$Vw),o($V96,$Vx),o($V96,$Vn),o($V96,$Vo),o($V96,$Vy),o($V96,$Vp),o($V96,$Vq),o($Vc6,$V73),o($Vc6,$V83),o($Vc6,$V93),o($Vc6,$Va3),{111:[1,4620]},o($Vc6,$Vf3),o($VF4,$VF5),{19:[1,4623],21:[1,4626],22:4622,87:4621,229:4624,230:[1,4625]},o($VF4,$VF5),{19:[1,4629],21:[1,4632],22:4628,87:4627,229:4630,230:[1,4631]},o($VG,$VY3),{121:[1,4633]},o($VG,$VM3),o($Vh2,$VU3),o($Vp2,$V75),{19:$Vi,21:$Vj,22:4634,229:45,230:$Vk},{19:$Via,21:$Vja,22:4636,100:[1,4647],108:[1,4648],109:[1,4649],110:4646,183:4637,206:4635,211:4640,212:4641,213:4642,216:4645,219:[1,4650],220:[1,4651],221:[1,4656],222:[1,4657],223:[1,4658],224:[1,4659],225:[1,4652],226:[1,4653],227:[1,4654],228:[1,4655],229:4639,230:$Vka},o($Vr2,$V75),{19:$Vi,21:$Vj,22:4660,229:45,230:$Vk},{19:$Vla,21:$Vma,22:4662,100:[1,4673],108:[1,4674],109:[1,4675],110:4672,183:4663,206:4661,211:4666,212:4667,213:4668,216:4671,219:[1,4676],220:[1,4677],221:[1,4682],222:[1,4683],223:[1,4684],224:[1,4685],225:[1,4678],226:[1,4679],227:[1,4680],228:[1,4681],229:4665,230:$Vna},o($VA1,$V63),o($VA1,$V73),o($VA1,$V83),o($VA1,$V93),o($VA1,$Va3),{111:[1,4686]},o($VA1,$Vf3),o($VA2,$V75),{19:$Vi,21:$Vj,22:4687,229:45,230:$Vk},{19:$Voa,21:$Vpa,22:4689,100:[1,4700],108:[1,4701],109:[1,4702],110:4699,183:4690,206:4688,211:4693,212:4694,213:4695,216:4698,219:[1,4703],220:[1,4704],221:[1,4709],222:[1,4710],223:[1,4711],224:[1,4712],225:[1,4705],226:[1,4706],227:[1,4707],228:[1,4708],229:4692,230:$Vqa},o($VD1,$VF5),o($VN1,$Vd6),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($Vr1,$Vz6),o($Vr1,$VK1),o($Vt1,$Vz6),o($Vt1,$VK1),o($VD1,$Vz6),o($VD1,$VK1),o($Vr1,$Vz6),o($Vr1,$VK1),o($Vt1,$Vz6),o($Vt1,$VK1),o($VD1,$Vz6),o($VD1,$VK1),o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$VD5),o($Vr1,$VE5),{19:$VM9,21:$VN9,22:4714,87:4713,229:3998,230:$VO9},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$VD5),o($Vt1,$VE5),{19:$VP9,21:$VQ9,22:4716,87:4715,229:4024,230:$VR9},o($VA1,$Vd6),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$VD5),o($VD1,$VE5),{19:$VS9,21:$VT9,22:4718,87:4717,229:4051,230:$VU9},o($VF3,$VF5),{208:[1,4721],209:4719,210:[1,4720]},o($VE3,$Vp6),o($VE3,$Vq6),o($VE3,$Vr6),o($VE3,$Vn),o($VE3,$Vo),o($VE3,$V04),o($VE3,$V14),o($VE3,$V24),o($VE3,$Vp),o($VE3,$Vq),o($VE3,$V34),o($VE3,$V44,{217:4722,218:4723,111:[1,4724]}),o($VE3,$V54),o($VE3,$V64),o($VE3,$V74),o($VE3,$V84),o($VE3,$V94),o($VE3,$Va4),o($VE3,$Vb4),o($VE3,$Vc4),o($VE3,$Vd4),o($V68,$Vb3),o($V68,$Vc3),o($V68,$Vd3),o($V68,$Ve3),{208:[1,4727],209:4725,210:[1,4726]},o($VF3,$Vp6),o($VF3,$Vq6),o($VF3,$Vr6),o($VF3,$Vn),o($VF3,$Vo),o($VF3,$V04),o($VF3,$V14),o($VF3,$V24),o($VF3,$Vp),o($VF3,$Vq),o($VF3,$V34),o($VF3,$V44,{217:4728,218:4729,111:[1,4730]}),o($VF3,$V54),o($VF3,$V64),o($VF3,$V74),o($VF3,$V84),o($VF3,$V94),o($VF3,$Va4),o($VF3,$Vb4),o($VF3,$Vc4),o($VF3,$Vd4),o($V78,$Vb3),o($V78,$Vc3),o($V78,$Vd3),o($V78,$Ve3),{19:[1,4733],21:[1,4736],22:4732,87:4731,229:4734,230:[1,4735]},{208:[1,4739],209:4737,210:[1,4738]},o($VG3,$Vp6),o($VG3,$Vq6),o($VG3,$Vr6),o($VG3,$Vn),o($VG3,$Vo),o($VG3,$V04),o($VG3,$V14),o($VG3,$V24),o($VG3,$Vp),o($VG3,$Vq),o($VG3,$V34),o($VG3,$V44,{217:4740,218:4741,111:[1,4742]}),o($VG3,$V54),o($VG3,$V64),o($VG3,$V74),o($VG3,$V84),o($VG3,$V94),o($VG3,$Va4),o($VG3,$Vb4),o($VG3,$Vc4),o($VG3,$Vd4),o($V88,$Vb3),o($V88,$Vc3),o($V88,$Vd3),o($V88,$Ve3),o($VT8,$V41),o($VT8,$V51),o($VT8,$V61),o($Vt7,$VD5),o($Vt7,$VE5),{19:$VV9,21:$VW9,22:4744,87:4743,229:4116,230:$VX9},o($VD7,$VA9),o($VI,$VJ,{63:4745,73:4746,75:4747,76:4748,92:4751,94:4752,87:4754,88:4755,89:4756,78:4757,39:4758,95:4762,22:4763,91:4765,118:4766,99:4770,229:4773,105:4774,107:4775,19:[1,4772],21:[1,4777],69:[1,4749],71:[1,4750],79:[1,4767],80:[1,4768],81:[1,4769],85:[1,4753],96:[1,4759],97:[1,4760],98:[1,4761],101:$Vra,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:[1,4764],230:[1,4776]}),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:4778,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($VD7,$VB2),o($VD7,$Vw),o($VD7,$Vx),o($VD7,$Vn),o($VD7,$Vo),o($VD7,$Vy),o($VD7,$Vp),o($VD7,$Vq),o($VD7,$Vt2,{99:4155,95:4779,101:$VY9,102:$VR,103:$VS,104:$VT}),o($V_8,$Vu2),o($V_8,$V63),o($VD7,$VC9),o($Vm8,$VU3),o($Vo8,$VV3),o($Vo8,$VW3),o($Vo8,$VX3),{100:[1,4780]},o($Vo8,$VT1),{100:[1,4782],106:4781,108:[1,4783],109:[1,4784],110:4785,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,4786]},o($Vo8,$VZ3),{121:[1,4787]},{19:[1,4790],21:[1,4793],22:4789,87:4788,229:4791,230:[1,4792]},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:4794,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($VD7,$VB2),o($VD7,$Vw),o($VD7,$Vx),o($VD7,$Vn),o($VD7,$Vo),o($VD7,$Vy),o($VD7,$Vp),o($VD7,$Vq),o($VD7,$Vt2,{99:4197,95:4795,101:$VZ9,102:$VR,103:$VS,104:$VT}),o($V_8,$Vu2),o($V_8,$V63),o($VD7,$VC9),o($Vm8,$VU3),o($Vo8,$VV3),o($Vo8,$VW3),o($Vo8,$VX3),{100:[1,4796]},o($Vo8,$VT1),{100:[1,4798],106:4797,108:[1,4799],109:[1,4800],110:4801,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,4802]},o($Vo8,$VZ3),{121:[1,4803]},{19:[1,4806],21:[1,4809],22:4805,87:4804,229:4807,230:[1,4808]},o($Vo8,$Vd6),o($Vo8,$VK1),o($Vo8,$Vn),o($Vo8,$Vo),o($Vo8,$Vp),o($Vo8,$Vq),o($V_9,$V75),{19:$Vi,21:$Vj,22:4810,229:45,230:$Vk},{19:$Vsa,21:$Vta,22:4812,100:[1,4823],108:[1,4824],109:[1,4825],110:4822,183:4813,206:4811,211:4816,212:4817,213:4818,216:4821,219:[1,4826],220:[1,4827],221:[1,4832],222:[1,4833],223:[1,4834],224:[1,4835],225:[1,4828],226:[1,4829],227:[1,4830],228:[1,4831],229:4815,230:$Vua},o($V69,$Vg8,{61:4836,53:[1,4837]}),o($V79,$Vh8),o($V79,$Vi8,{74:4838,76:4839,78:4840,39:4841,118:4842,79:[1,4843],80:[1,4844],81:[1,4845],119:$VJ,125:$VJ,127:$VJ,204:$VJ,242:$VJ}),o($V79,$Vj8),o($V79,$V46,{77:4846,73:4847,92:4848,94:4849,95:4853,99:4854,96:[1,4850],97:[1,4851],98:[1,4852],101:$Vva,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:4856,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($V79,$Vl8),o($VF9,$Vy1,{93:4857}),o($VG9,$Vz1,{99:4539,95:4858,101:$Vfa,102:$VR,103:$VS,104:$VT}),o($VH9,$VB1,{86:4859}),o($VH9,$VB1,{86:4860}),o($VH9,$VB1,{86:4861}),o($V79,$VC1,{105:4543,107:4544,91:4862,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VI9,$Va6),o($VI9,$Vb6),o($VF9,$VG1),o($VF9,$VH1),o($VF9,$VI1),o($VF9,$VJ1),o($VH9,$VK1),o($VL1,$VM1,{164:4863}),o($VJ9,$VO1),{119:[1,4864],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VI9,$VE1),o($VI9,$VF1),{19:[1,4868],21:[1,4872],22:4866,33:4865,215:4867,229:4869,230:[1,4871],231:[1,4870]},{100:[1,4873]},o($VF9,$VT1),o($VH9,$Vn),o($VH9,$Vo),{100:[1,4875],106:4874,108:[1,4876],109:[1,4877],110:4878,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,4879]},o($VH9,$Vp),o($VH9,$Vq),o($V79,$Vh8),o($V79,$Vi8,{74:4880,76:4881,78:4882,39:4883,118:4884,79:[1,4885],80:[1,4886],81:[1,4887],119:$VJ,125:$VJ,127:$VJ,204:$VJ,242:$VJ}),o($V79,$Vj8),o($V79,$V46,{77:4888,73:4889,92:4890,94:4891,95:4895,99:4896,96:[1,4892],97:[1,4893],98:[1,4894],101:$Vwa,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:4898,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($V79,$Vl8),o($VF9,$Vy1,{93:4899}),o($VG9,$Vz1,{99:4572,95:4900,101:$Vga,102:$VR,103:$VS,104:$VT}),o($VH9,$VB1,{86:4901}),o($VH9,$VB1,{86:4902}),o($VH9,$VB1,{86:4903}),o($V79,$VC1,{105:4576,107:4577,91:4904,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VI9,$Va6),o($VI9,$Vb6),o($VF9,$VG1),o($VF9,$VH1),o($VF9,$VI1),o($VF9,$VJ1),o($VH9,$VK1),o($VL1,$VM1,{164:4905}),o($VJ9,$VO1),{119:[1,4906],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VI9,$VE1),o($VI9,$VF1),{19:[1,4910],21:[1,4914],22:4908,33:4907,215:4909,229:4911,230:[1,4913],231:[1,4912]},{100:[1,4915]},o($VF9,$VT1),o($VH9,$Vn),o($VH9,$Vo),{100:[1,4917],106:4916,108:[1,4918],109:[1,4919],110:4920,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,4921]},o($VH9,$Vp),o($VH9,$Vq),{121:[1,4922]},o($V0a,$VU3),o($VH9,$V63),o($VH9,$V73),o($VH9,$V83),o($VH9,$V93),o($VH9,$Va3),{111:[1,4923]},o($VH9,$Vf3),o($VI9,$VF5),o($VJ9,$Vd6),o($VJ9,$VK1),o($VJ9,$Vn),o($VJ9,$Vo),o($VJ9,$Vp),o($VJ9,$Vq),{70:[1,4924]},{70:[1,4925]},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:4926,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($VF4,$VB2),o($VF4,$Vw),o($VF4,$Vx),o($VF4,$Vn),o($VF4,$Vo),o($VF4,$Vy),o($VF4,$Vp),o($VF4,$Vq),o($VF4,$Vt2,{99:4278,95:4927,101:$V2a,102:$VR,103:$VS,104:$VT}),o($V$6,$Vu2),o($V$6,$V63),o($VF4,$VJ7),o($V86,$VV3),o($V86,$VW3),o($V86,$VX3),{100:[1,4928]},o($V86,$VT1),{100:[1,4930],106:4929,108:[1,4931],109:[1,4932],110:4933,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,4934]},o($V86,$VZ3),{121:[1,4935]},{19:[1,4938],21:[1,4941],22:4937,87:4936,229:4939,230:[1,4940]},o($V86,$Vd6),o($V86,$VK1),o($V86,$Vn),o($V86,$Vo),o($V86,$Vp),o($V86,$Vq),o($V86,$Vd6),o($V86,$VK1),o($V86,$Vn),o($V86,$Vo),o($V86,$Vp),o($V86,$Vq),o($Vt1,$VF5),{208:[1,4944],209:4942,210:[1,4943]},o($Vr1,$Vp6),o($Vr1,$Vq6),o($Vr1,$Vr6),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$V04),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V34),o($Vr1,$V44,{217:4945,218:4946,111:[1,4947]}),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Vr1,$Vb4),o($Vr1,$Vc4),o($Vr1,$Vd4),o($Vs6,$Vb3),o($Vs6,$Vc3),o($Vs6,$Vd3),o($Vs6,$Ve3),{208:[1,4950],209:4948,210:[1,4949]},o($Vt1,$Vp6),o($Vt1,$Vq6),o($Vt1,$Vr6),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$V04),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V34),o($Vt1,$V44,{217:4951,218:4952,111:[1,4953]}),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vt1,$Vb4),o($Vt1,$Vc4),o($Vt1,$Vd4),o($Vt6,$Vb3),o($Vt6,$Vc3),o($Vt6,$Vd3),o($Vt6,$Ve3),{19:[1,4956],21:[1,4959],22:4955,87:4954,229:4957,230:[1,4958]},{208:[1,4962],209:4960,210:[1,4961]},o($VD1,$Vp6),o($VD1,$Vq6),o($VD1,$Vr6),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$V04),o($VD1,$V14),o($VD1,$V24),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V34),o($VD1,$V44,{217:4963,218:4964,111:[1,4965]}),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($VD1,$Vb4),o($VD1,$Vc4),o($VD1,$Vd4),o($Vu6,$Vb3),o($Vu6,$Vc3),o($Vu6,$Vd3),o($Vu6,$Ve3),o($Vr1,$Vz6),o($Vr1,$VK1),o($Vt1,$Vz6),o($Vt1,$VK1),o($VD1,$Vz6),o($VD1,$VK1),o($V05,$V41),o($V05,$V51),o($V05,$V61),o($VE3,$VD5),o($VE3,$VE5),{19:$V3a,21:$V4a,22:4967,87:4966,229:4374,230:$V5a},o($V15,$V41),o($V15,$V51),o($V15,$V61),o($VF3,$VD5),o($VF3,$VE5),{19:$V6a,21:$V7a,22:4969,87:4968,229:4400,230:$V8a},o($VI3,$Vd6),o($VI3,$VK1),o($VI3,$Vn),o($VI3,$Vo),o($VI3,$Vp),o($VI3,$Vq),o($V35,$V41),o($V35,$V51),o($V35,$V61),o($VG3,$VD5),o($VG3,$VE5),{19:$V9a,21:$Vaa,22:4971,87:4970,229:4427,230:$Vba},o($Vt7,$Vz6),o($Vt7,$VK1),o($VD7,$Vh8),o($VD7,$Vi8,{74:4972,76:4973,78:4974,39:4975,118:4976,79:[1,4977],80:[1,4978],81:[1,4979],119:$VJ,125:$VJ,127:$VJ,204:$VJ,242:$VJ}),o($VD7,$Vj8),o($VD7,$V46,{77:4980,73:4981,92:4982,94:4983,95:4987,99:4988,96:[1,4984],97:[1,4985],98:[1,4986],101:$Vxa,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:4990,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VD7,$Vl8),o($Vm8,$Vy1,{93:4991}),o($Vn8,$Vz1,{99:4770,95:4992,101:$Vra,102:$VR,103:$VS,104:$VT}),o($Vo8,$VB1,{86:4993}),o($Vo8,$VB1,{86:4994}),o($Vo8,$VB1,{86:4995}),o($VD7,$VC1,{105:4774,107:4775,91:4996,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vp8,$Va6),o($Vp8,$Vb6),o($Vm8,$VG1),o($Vm8,$VH1),o($Vm8,$VI1),o($Vm8,$VJ1),o($Vo8,$VK1),o($VL1,$VM1,{164:4997}),o($Vq8,$VO1),{119:[1,4998],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($Vp8,$VE1),o($Vp8,$VF1),{19:[1,5002],21:[1,5006],22:5000,33:4999,215:5001,229:5003,230:[1,5005],231:[1,5004]},{100:[1,5007]},o($Vm8,$VT1),o($Vo8,$Vn),o($Vo8,$Vo),{100:[1,5009],106:5008,108:[1,5010],109:[1,5011],110:5012,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,5013]},o($Vo8,$Vp),o($Vo8,$Vq),{121:[1,5014]},o($V_8,$VU3),o($Vo8,$V63),o($Vo8,$V73),o($Vo8,$V83),o($Vo8,$V93),o($Vo8,$Va3),{111:[1,5015]},o($Vo8,$Vf3),o($Vp8,$VF5),o($Vq8,$Vd6),o($Vq8,$VK1),o($Vq8,$Vn),o($Vq8,$Vo),o($Vq8,$Vp),o($Vq8,$Vq),{121:[1,5016]},o($V_8,$VU3),o($Vo8,$V63),o($Vo8,$V73),o($Vo8,$V83),o($Vo8,$V93),o($Vo8,$Va3),{111:[1,5017]},o($Vo8,$Vf3),o($Vp8,$VF5),o($Vq8,$Vd6),o($Vq8,$VK1),o($Vq8,$Vn),o($Vq8,$Vo),o($Vq8,$Vp),o($Vq8,$Vq),{208:[1,5020],209:5018,210:[1,5019]},o($V09,$Vp6),o($V09,$Vq6),o($V09,$Vr6),o($V09,$Vn),o($V09,$Vo),o($V09,$V04),o($V09,$V14),o($V09,$V24),o($V09,$Vp),o($V09,$Vq),o($V09,$V34),o($V09,$V44,{217:5021,218:5022,111:[1,5023]}),o($V09,$V54),o($V09,$V64),o($V09,$V74),o($V09,$V84),o($V09,$V94),o($V09,$Va4),o($V09,$Vb4),o($V09,$Vc4),o($V09,$Vd4),o($Vya,$Vb3),o($Vya,$Vc3),o($Vya,$Vd3),o($Vya,$Ve3),o($V79,$VW8),o($Vr,$Vs,{59:5024,41:5025,44:$Vt}),o($V79,$VX8),o($V79,$VY8),o($V79,$Va6),o($V79,$Vb6),{119:[1,5026],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($V79,$VE1),o($V79,$VF1),{19:[1,5030],21:[1,5034],22:5028,33:5027,215:5029,229:5031,230:[1,5033],231:[1,5032]},o($V79,$VZ8),o($V79,$V_6),o($V0a,$Vy1,{93:5035}),o($V79,$Vz1,{99:4854,95:5036,101:$Vva,102:$VR,103:$VS,104:$VT}),o($V0a,$VG1),o($V0a,$VH1),o($V0a,$VI1),o($V0a,$VJ1),{100:[1,5037]},o($V0a,$VT1),{70:[1,5038]},o($VG9,$Vt2,{99:4539,95:5039,101:$Vfa,102:$VR,103:$VS,104:$VT}),o($VF9,$Vu2),o($V79,$Vv2,{90:5040,95:5041,91:5042,99:5043,105:5045,107:5046,101:$Vza,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V79,$Vx2,{90:5040,95:5041,91:5042,99:5043,105:5045,107:5046,101:$Vza,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V79,$Vy2,{90:5040,95:5041,91:5042,99:5043,105:5045,107:5046,101:$Vza,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VJ9,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,5047],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:5048,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($VI9,$VB2),o($VI9,$Vw),o($VI9,$Vx),o($VI9,$Vn),o($VI9,$Vo),o($VI9,$Vy),o($VI9,$Vp),o($VI9,$Vq),o($VF9,$V63),o($VJ9,$V73),o($VJ9,$V83),o($VJ9,$V93),o($VJ9,$Va3),{111:[1,5049]},o($VJ9,$Vf3),o($V79,$VX8),o($V79,$VY8),o($V79,$Va6),o($V79,$Vb6),{119:[1,5050],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($V79,$VE1),o($V79,$VF1),{19:[1,5054],21:[1,5058],22:5052,33:5051,215:5053,229:5055,230:[1,5057],231:[1,5056]},o($V79,$VZ8),o($V79,$V_6),o($V0a,$Vy1,{93:5059}),o($V79,$Vz1,{99:4896,95:5060,101:$Vwa,102:$VR,103:$VS,104:$VT}),o($V0a,$VG1),o($V0a,$VH1),o($V0a,$VI1),o($V0a,$VJ1),{100:[1,5061]},o($V0a,$VT1),{70:[1,5062]},o($VG9,$Vt2,{99:4572,95:5063,101:$Vga,102:$VR,103:$VS,104:$VT}),o($VF9,$Vu2),o($V79,$Vv2,{90:5064,95:5065,91:5066,99:5067,105:5069,107:5070,101:$VAa,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V79,$Vx2,{90:5064,95:5065,91:5066,99:5067,105:5069,107:5070,101:$VAa,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V79,$Vy2,{90:5064,95:5065,91:5066,99:5067,105:5069,107:5070,101:$VAa,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VJ9,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,5071],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:5072,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($VI9,$VB2),o($VI9,$Vw),o($VI9,$Vx),o($VI9,$Vn),o($VI9,$Vo),o($VI9,$Vy),o($VI9,$Vp),o($VI9,$Vq),o($VF9,$V63),o($VJ9,$V73),o($VJ9,$V83),o($VJ9,$V93),o($VJ9,$Va3),{111:[1,5073]},o($VJ9,$Vf3),o($V79,$VF5),{19:[1,5076],21:[1,5079],22:5075,87:5074,229:5077,230:[1,5078]},o($VG7,$Vt8),o($VG7,$Vu8),{121:[1,5080]},o($V$6,$VU3),o($V86,$V63),o($V86,$V73),o($V86,$V83),o($V86,$V93),o($V86,$Va3),{111:[1,5081]},o($V86,$Vf3),o($V96,$VF5),o($Vc6,$Vd6),o($Vc6,$VK1),o($Vc6,$Vn),o($Vc6,$Vo),o($Vc6,$Vp),o($Vc6,$Vq),o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$VD5),o($Vr1,$VE5),{19:$Via,21:$Vja,22:5083,87:5082,229:4639,230:$Vka},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$VD5),o($Vt1,$VE5),{19:$Vla,21:$Vma,22:5085,87:5084,229:4665,230:$Vna},o($VA1,$Vd6),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$VD5),o($VD1,$VE5),{19:$Voa,21:$Vpa,22:5087,87:5086,229:4692,230:$Vqa},o($VE3,$Vz6),o($VE3,$VK1),o($VF3,$Vz6),o($VF3,$VK1),o($VG3,$Vz6),o($VG3,$VK1),o($VD7,$VX8),o($VD7,$VY8),o($VD7,$Va6),o($VD7,$Vb6),{119:[1,5088],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VD7,$VE1),o($VD7,$VF1),{19:[1,5092],21:[1,5096],22:5090,33:5089,215:5091,229:5093,230:[1,5095],231:[1,5094]},o($VD7,$VZ8),o($VD7,$V_6),o($V_8,$Vy1,{93:5097}),o($VD7,$Vz1,{99:4988,95:5098,101:$Vxa,102:$VR,103:$VS,104:$VT}),o($V_8,$VG1),o($V_8,$VH1),o($V_8,$VI1),o($V_8,$VJ1),{100:[1,5099]},o($V_8,$VT1),{70:[1,5100]},o($Vn8,$Vt2,{99:4770,95:5101,101:$Vra,102:$VR,103:$VS,104:$VT}),o($Vm8,$Vu2),o($VD7,$Vv2,{90:5102,95:5103,91:5104,99:5105,105:5107,107:5108,101:$VBa,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD7,$Vx2,{90:5102,95:5103,91:5104,99:5105,105:5107,107:5108,101:$VBa,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD7,$Vy2,{90:5102,95:5103,91:5104,99:5105,105:5107,107:5108,101:$VBa,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vq8,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,5109],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:5110,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($Vp8,$VB2),o($Vp8,$Vw),o($Vp8,$Vx),o($Vp8,$Vn),o($Vp8,$Vo),o($Vp8,$Vy),o($Vp8,$Vp),o($Vp8,$Vq),o($Vm8,$V63),o($Vq8,$V73),o($Vq8,$V83),o($Vq8,$V93),o($Vq8,$Va3),{111:[1,5111]},o($Vq8,$Vf3),o($VD7,$VF5),{19:[1,5114],21:[1,5117],22:5113,87:5112,229:5115,230:[1,5116]},o($VD7,$VF5),{19:[1,5120],21:[1,5123],22:5119,87:5118,229:5121,230:[1,5122]},o($V_9,$V41),o($V_9,$V51),o($V_9,$V61),o($V09,$VD5),o($V09,$VE5),{19:$Vsa,21:$Vta,22:5125,87:5124,229:4815,230:$Vua},o($V79,$VA9),o($VI,$VJ,{63:5126,73:5127,75:5128,76:5129,92:5132,94:5133,87:5135,88:5136,89:5137,78:5138,39:5139,95:5143,22:5144,91:5146,118:5147,99:5151,229:5154,105:5155,107:5156,19:[1,5153],21:[1,5158],69:[1,5130],71:[1,5131],79:[1,5148],80:[1,5149],81:[1,5150],85:[1,5134],96:[1,5140],97:[1,5141],98:[1,5142],101:$VCa,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,163:[1,5145],230:[1,5157]}),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:5159,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($V79,$VB2),o($V79,$Vw),o($V79,$Vx),o($V79,$Vn),o($V79,$Vo),o($V79,$Vy),o($V79,$Vp),o($V79,$Vq),o($V79,$Vt2,{99:4854,95:5160,101:$Vva,102:$VR,103:$VS,104:$VT}),o($V0a,$Vu2),o($V0a,$V63),o($V79,$VC9),o($VF9,$VU3),o($VH9,$VV3),o($VH9,$VW3),o($VH9,$VX3),{100:[1,5161]},o($VH9,$VT1),{100:[1,5163],106:5162,108:[1,5164],109:[1,5165],110:5166,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,5167]},o($VH9,$VZ3),{121:[1,5168]},{19:[1,5171],21:[1,5174],22:5170,87:5169,229:5172,230:[1,5173]},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:5175,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($V79,$VB2),o($V79,$Vw),o($V79,$Vx),o($V79,$Vn),o($V79,$Vo),o($V79,$Vy),o($V79,$Vp),o($V79,$Vq),o($V79,$Vt2,{99:4896,95:5176,101:$Vwa,102:$VR,103:$VS,104:$VT}),o($V0a,$Vu2),o($V0a,$V63),o($V79,$VC9),o($VF9,$VU3),o($VH9,$VV3),o($VH9,$VW3),o($VH9,$VX3),{100:[1,5177]},o($VH9,$VT1),{100:[1,5179],106:5178,108:[1,5180],109:[1,5181],110:5182,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,5183]},o($VH9,$VZ3),{121:[1,5184]},{19:[1,5187],21:[1,5190],22:5186,87:5185,229:5188,230:[1,5189]},o($VH9,$Vd6),o($VH9,$VK1),o($VH9,$Vn),o($VH9,$Vo),o($VH9,$Vp),o($VH9,$Vq),o($VF4,$VF5),{19:[1,5193],21:[1,5196],22:5192,87:5191,229:5194,230:[1,5195]},o($Vr1,$Vz6),o($Vr1,$VK1),o($Vt1,$Vz6),o($Vt1,$VK1),o($VD1,$Vz6),o($VD1,$VK1),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:5197,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($VD7,$VB2),o($VD7,$Vw),o($VD7,$Vx),o($VD7,$Vn),o($VD7,$Vo),o($VD7,$Vy),o($VD7,$Vp),o($VD7,$Vq),o($VD7,$Vt2,{99:4988,95:5198,101:$Vxa,102:$VR,103:$VS,104:$VT}),o($V_8,$Vu2),o($V_8,$V63),o($VD7,$VC9),o($Vm8,$VU3),o($Vo8,$VV3),o($Vo8,$VW3),o($Vo8,$VX3),{100:[1,5199]},o($Vo8,$VT1),{100:[1,5201],106:5200,108:[1,5202],109:[1,5203],110:5204,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,5205]},o($Vo8,$VZ3),{121:[1,5206]},{19:[1,5209],21:[1,5212],22:5208,87:5207,229:5210,230:[1,5211]},o($Vo8,$Vd6),o($Vo8,$VK1),o($Vo8,$Vn),o($Vo8,$Vo),o($Vo8,$Vp),o($Vo8,$Vq),o($Vo8,$Vd6),o($Vo8,$VK1),o($Vo8,$Vn),o($Vo8,$Vo),o($Vo8,$Vp),o($Vo8,$Vq),o($V09,$Vz6),o($V09,$VK1),o($V79,$Vh8),o($V79,$Vi8,{74:5213,76:5214,78:5215,39:5216,118:5217,79:[1,5218],80:[1,5219],81:[1,5220],119:$VJ,125:$VJ,127:$VJ,204:$VJ,242:$VJ}),o($V79,$Vj8),o($V79,$V46,{77:5221,73:5222,92:5223,94:5224,95:5228,99:5229,96:[1,5225],97:[1,5226],98:[1,5227],101:$VDa,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:5231,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($V79,$Vl8),o($VF9,$Vy1,{93:5232}),o($VG9,$Vz1,{99:5151,95:5233,101:$VCa,102:$VR,103:$VS,104:$VT}),o($VH9,$VB1,{86:5234}),o($VH9,$VB1,{86:5235}),o($VH9,$VB1,{86:5236}),o($V79,$VC1,{105:5155,107:5156,91:5237,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VI9,$Va6),o($VI9,$Vb6),o($VF9,$VG1),o($VF9,$VH1),o($VF9,$VI1),o($VF9,$VJ1),o($VH9,$VK1),o($VL1,$VM1,{164:5238}),o($VJ9,$VO1),{119:[1,5239],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($VI9,$VE1),o($VI9,$VF1),{19:[1,5243],21:[1,5247],22:5241,33:5240,215:5242,229:5244,230:[1,5246],231:[1,5245]},{100:[1,5248]},o($VF9,$VT1),o($VH9,$Vn),o($VH9,$Vo),{100:[1,5250],106:5249,108:[1,5251],109:[1,5252],110:5253,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,5254]},o($VH9,$Vp),o($VH9,$Vq),{121:[1,5255]},o($V0a,$VU3),o($VH9,$V63),o($VH9,$V73),o($VH9,$V83),o($VH9,$V93),o($VH9,$Va3),{111:[1,5256]},o($VH9,$Vf3),o($VI9,$VF5),o($VJ9,$Vd6),o($VJ9,$VK1),o($VJ9,$Vn),o($VJ9,$Vo),o($VJ9,$Vp),o($VJ9,$Vq),{121:[1,5257]},o($V0a,$VU3),o($VH9,$V63),o($VH9,$V73),o($VH9,$V83),o($VH9,$V93),o($VH9,$Va3),{111:[1,5258]},o($VH9,$Vf3),o($VI9,$VF5),o($VJ9,$Vd6),o($VJ9,$VK1),o($VJ9,$Vn),o($VJ9,$Vo),o($VJ9,$Vp),o($VJ9,$Vq),o($V86,$Vd6),o($V86,$VK1),o($V86,$Vn),o($V86,$Vo),o($V86,$Vp),o($V86,$Vq),{121:[1,5259]},o($V_8,$VU3),o($Vo8,$V63),o($Vo8,$V73),o($Vo8,$V83),o($Vo8,$V93),o($Vo8,$Va3),{111:[1,5260]},o($Vo8,$Vf3),o($Vp8,$VF5),o($Vq8,$Vd6),o($Vq8,$VK1),o($Vq8,$Vn),o($Vq8,$Vo),o($Vq8,$Vp),o($Vq8,$Vq),o($V79,$VX8),o($V79,$VY8),o($V79,$Va6),o($V79,$Vb6),{119:[1,5261],122:194,123:195,124:196,125:$VP1,127:$VQ1,204:$VR1,232:198,242:$VS1},o($V79,$VE1),o($V79,$VF1),{19:[1,5265],21:[1,5269],22:5263,33:5262,215:5264,229:5266,230:[1,5268],231:[1,5267]},o($V79,$VZ8),o($V79,$V_6),o($V0a,$Vy1,{93:5270}),o($V79,$Vz1,{99:5229,95:5271,101:$VDa,102:$VR,103:$VS,104:$VT}),o($V0a,$VG1),o($V0a,$VH1),o($V0a,$VI1),o($V0a,$VJ1),{100:[1,5272]},o($V0a,$VT1),{70:[1,5273]},o($VG9,$Vt2,{99:5151,95:5274,101:$VCa,102:$VR,103:$VS,104:$VT}),o($VF9,$Vu2),o($V79,$Vv2,{90:5275,95:5276,91:5277,99:5278,105:5280,107:5281,101:$VEa,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V79,$Vx2,{90:5275,95:5276,91:5277,99:5278,105:5280,107:5281,101:$VEa,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V79,$Vy2,{90:5275,95:5276,91:5277,99:5278,105:5280,107:5281,101:$VEa,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VJ9,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,165:[1,5282],166:379,167:380,168:381,169:382,183:385,187:$VJ2,211:390,212:391,213:392,216:395,219:$VK2,220:$VL2,221:$VM2,222:$VN2,223:$VO2,224:$VP2,225:$VQ2,226:$VR2,227:$VS2,228:$VT2,229:389,230:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:5283,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($VI9,$VB2),o($VI9,$Vw),o($VI9,$Vx),o($VI9,$Vn),o($VI9,$Vo),o($VI9,$Vy),o($VI9,$Vp),o($VI9,$Vq),o($VF9,$V63),o($VJ9,$V73),o($VJ9,$V83),o($VJ9,$V93),o($VJ9,$Va3),{111:[1,5284]},o($VJ9,$Vf3),o($V79,$VF5),{19:[1,5287],21:[1,5290],22:5286,87:5285,229:5288,230:[1,5289]},o($V79,$VF5),{19:[1,5293],21:[1,5296],22:5292,87:5291,229:5294,230:[1,5295]},o($VD7,$VF5),{19:[1,5299],21:[1,5302],22:5298,87:5297,229:5300,230:[1,5301]},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,148:421,193:423,120:5303,121:$VX2,149:$VY2,191:$VZ2,202:$V_2,203:$V$2,204:$V03}),o($V79,$VB2),o($V79,$Vw),o($V79,$Vx),o($V79,$Vn),o($V79,$Vo),o($V79,$Vy),o($V79,$Vp),o($V79,$Vq),o($V79,$Vt2,{99:5229,95:5304,101:$VDa,102:$VR,103:$VS,104:$VT}),o($V0a,$Vu2),o($V0a,$V63),o($V79,$VC9),o($VF9,$VU3),o($VH9,$VV3),o($VH9,$VW3),o($VH9,$VX3),{100:[1,5305]},o($VH9,$VT1),{100:[1,5307],106:5306,108:[1,5308],109:[1,5309],110:5310,221:$VU1,222:$VV1,223:$VW1,224:$VX1},{100:[1,5311]},o($VH9,$VZ3),{121:[1,5312]},{19:[1,5315],21:[1,5318],22:5314,87:5313,229:5316,230:[1,5317]},o($VH9,$Vd6),o($VH9,$VK1),o($VH9,$Vn),o($VH9,$Vo),o($VH9,$Vp),o($VH9,$Vq),o($VH9,$Vd6),o($VH9,$VK1),o($VH9,$Vn),o($VH9,$Vo),o($VH9,$Vp),o($VH9,$Vq),o($Vo8,$Vd6),o($Vo8,$VK1),o($Vo8,$Vn),o($Vo8,$Vo),o($Vo8,$Vp),o($Vo8,$Vq),{121:[1,5319]},o($V0a,$VU3),o($VH9,$V63),o($VH9,$V73),o($VH9,$V83),o($VH9,$V93),o($VH9,$Va3),{111:[1,5320]},o($VH9,$Vf3),o($VI9,$VF5),o($VJ9,$Vd6),o($VJ9,$VK1),o($VJ9,$Vn),o($VJ9,$Vo),o($VJ9,$Vp),o($VJ9,$Vq),o($V79,$VF5),{19:[1,5323],21:[1,5326],22:5322,87:5321,229:5324,230:[1,5325]},o($VH9,$Vd6),o($VH9,$VK1),o($VH9,$Vn),o($VH9,$Vo),o($VH9,$Vp),o($VH9,$Vq)];
        this.defaultActions = {6:[2,11],24:[2,1],115:[2,120],116:[2,121],117:[2,122],124:[2,133],125:[2,134],208:[2,272],209:[2,273],210:[2,274],211:[2,275],343:[2,36],411:[2,143],412:[2,147],414:[2,149],609:[2,34],610:[2,38],647:[2,35],1178:[2,147],1180:[2,149],1624:[2,260],1625:[2,261],1626:[2,280],1627:[2,281],1628:[2,284],1629:[2,282],1630:[2,283]};
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
case 37: case 251: case 268:
this.$ = null;
break;
case 38: case 42: case 45: case 51: case 58: case 193: case 232: case 267: case 288: case 292:
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
case 44: case 47: case 49: case 53: case 56: case 60: case 234: case 290: case 294:
this.$ = $$[$0-1].concat($$[$0]);
break;
case 48: case 52: case 55: case 59: case 233: case 289: case 293:
this.$ = [];
break;
case 50: case 287:
this.$ = shapeJunction("ShapeOr", $$[$0-1], $$[$0]);
break;
case 54: case 57:
this.$ = shapeJunction("ShapeAnd", $$[$0-1], $$[$0]) // t: @@;
break;
case 61:
this.$ = $$[$0-1] ? { type: "ShapeNot", "shapeExpr": nonest($$[$0]) } /* t:@@ */ : $$[$0];
break;
case 62: case 230:
this.$ = false;
break;
case 63: case 231:
this.$ = true;
break;
case 64:
this.$ = $$[$0-1] ? { type: "ShapeNot", "shapeExpr": nonest($$[$0]) } /* t: 1NOTNOTdot, 1NOTNOTIRI, 1NOTNOTvs */ : $$[$0];
break;
case 65: case 74: case 79: case 296: case 298:
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
case 168:
this.$ = yy.addSourceMap($$[$0]);
break;
case 173:

        // t: open1dotOr1dot, !openopen1dotcloseCode1closeCode2
        this.$ = $$[$0-4];
        // Copy all of the new attributes into the encapsulated shape.
        if ("min" in $$[$0-2]) { this.$.min = $$[$0-2].min; } // t: open3groupdotclosecard23Annot3Code2
        if ("max" in $$[$0-2]) { this.$.max = $$[$0-2].max; } // t: open3groupdotclosecard23Annot3Code2
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: open3groupdotcloseAnnot3, open3groupdotclosecard23Annot3Code2
        if ($$[$0]) { this.$.semActs = "semActs" in $$[$0-4] ? $$[$0-4].semActs.concat($$[$0].semActs) : $$[$0].semActs; } // t: open3groupdotcloseCode1, !open1dotOr1dot
      
break;
case 174:
this.$ = {} // t: 1dot;
break;
case 176:

        // $$[$0]: t: 1dotCode1
	if ($$[$0-3] !== yy.EmptyShape && false) {}
        // %6: t: 1inversedotCode1
        this.$ = extend({ type: "TripleConstraint" }, $$[$0-5] ? $$[$0-5] : {}, { predicate: $$[$0-4] }, ($$[$0-3] === yy.EmptyShape ? {} : { valueExpr: $$[$0-3] }), $$[$0-2], $$[$0]); // t: 1dot, 1inversedot, 1negatedinversedot
        if ($$[$0-1].length)
          this.$["annotations"] = $$[$0-1]; // t: 1dotAnnot3, 1inversedotAnnot3
      
break;
case 179:
this.$ = { min:0, max:UNBOUNDED } // t: 1cardStar;
break;
case 180:
this.$ = { min:1, max:UNBOUNDED } // t: 1cardPlus;
break;
case 181:
this.$ = { min:0, max:1 } // t: 1cardOpt;
break;
case 182:

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
case 183:
this.$ = { inverse: true } // t: 1inversedot;
break;
case 184:
this.$ = { inverse: true, negated: true } // t: 1negatedinversedot;
break;
case 185:
this.$ = { negated: true } // t: 1negateddot;
break;
case 186:
this.$ = { inverse: true, negated: true } // t: 1inversenegateddot;
break;
case 187:
this.$ = $$[$0-1] // t: 1val1IRIREF;
break;
case 188:
this.$ = [] // t: 1val1IRIREF;
break;
case 189:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1IRIREF;
break;
case 194:
this.$ = [$$[$0]] // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 195:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 196:
this.$ = [$$[$0]] // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 197:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 198:
this.$ = [$$[$0]] // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 199:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 200:
this.$ = { type: "IriStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 201:
this.$ = { type: "LiteralStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 202:
this.$ = { type: "LanguageStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 203:

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
case 204:
this.$ = [] // t: 1val1iriStem, 1val1iriStemMinusiri3;
break;
case 205:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1iriStemMinusiri3;
break;
case 206:
this.$ = $$[$0] // t: 1val1iriStemMinusiri3;
break;
case 209:
this.$ = $$[$0] ? { type: "IriStem", stem: $$[$0-1] } /* t: 1val1iriStemMinusiriStem3 */ : $$[$0-1] // t: 1val1iriStemMinusiri3;
break;
case 212:

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
case 213:
this.$ = [] // t: 1val1literalStem, 1val1literalStemMinusliteral3;
break;
case 214:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1literalStemMinusliteral3;
break;
case 215:
this.$ = $$[$0] // t: 1val1literalStemMinusliteral3;
break;
case 218:
this.$ = $$[$0] ? { type: "LiteralStem", stem: $$[$0-1].value } /* t: 1val1literalStemMinusliteral3 */ : $$[$0-1].value // t: 1val1literalStemMinusliteralStem3;
break;
case 219:

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
case 220:

        this.$ = {  // t: @@
          type: $$[$0].length ? "LanguageStemRange" : "LanguageStem",
          stem: ""
        };
        if ($$[$0].length)
          this.$["exclusions"] = $$[$0]; // t: @@
      
break;
case 221:
this.$ = [] // t: 1val1languageStem, 1val1languageStemMinuslanguage3;
break;
case 222:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1languageStemMinuslanguage3;
break;
case 223:
this.$ = $$[$0] // t: 1val1languageStemMinuslanguage3;
break;
case 226:
this.$ = $$[$0] ? { type: "LanguageStem", stem: $$[$0-1] } /* t: 1val1languageStemMinuslanguageStem3 */ : $$[$0-1] // t: 1val1languageStemMinuslanguage3;
break;
case 227:

        this.$ = { type: "Unique", focus: $$[$0-3], uniques: [$$[$0-2]].concat($$[$0-1]) };
      
break;
case 228:

        this.$ = { type: "ValueComparison", left: $$[$0-2], comparator: $$[$0-1], right: $$[$0] };
      
break;
case 239:
this.$ = { type: "TermAccessor", productionLabel: $$[$0] };
break;
case 240:
this.$ = { type: "LangtagAccessor", name: $$[$0-1] };
break;
case 241:
this.$ = { type: "DatatypeAccessor", name: $$[$0-1] };
break;
case 242:
this.$ = yy.addSourceMap($$[$0]) // Inclusion // t: 2groupInclude1;
break;
case 243:
this.$ = { type: "Annotation", predicate: $$[$0-1], object: $$[$0] } // t: 1dotAnnotIRIREF;
break;
case 246:
this.$ = $$[$0].length ? { semActs: $$[$0] } : null // t: 1dotCode1/2oneOfDot;
break;
case 247:
this.$ = [] // t: 1dot, 1dotCode1;
break;
case 248:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotCode1;
break;
case 249:
this.$ = $$[$0] ? unescapeSemanticAction($$[$0-1], $$[$0]) /* t: 1dotCode1 */ : { type: "SemAct", name: $$[$0-1] } // t: 1dotNoCode1;
break;
case 256:
this.$ = RDF_TYPE // t: 1AvalA;
break;
case 262:
this.$ = createLiteral($$[$0], XSD_INTEGER) // t: 1val1INTEGER;
break;
case 263:
this.$ = createLiteral($$[$0], XSD_DECIMAL) // t: 1val1DECIMAL;
break;
case 264:
this.$ = createLiteral($$[$0], XSD_DOUBLE) // t: 1val1DOUBLE;
break;
case 266:
this.$ = $$[$0] ? extend($$[$0-1], { type: $$[$0] }) : $$[$0-1] // t: 1val1Datatype;
break;
case 270:
this.$ = { value: "true", type: XSD_BOOLEAN } // t: 1val1true;
break;
case 271:
this.$ = { value: "false", type: XSD_BOOLEAN } // t: 1val1false;
break;
case 272:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL2;
break;
case 273:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL1;
break;
case 274:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL_LONG2;
break;
case 275:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG1;
break;
case 276:
this.$ = unescapeLangString($$[$0], 1)	// t: @@;
break;
case 277:
this.$ = unescapeLangString($$[$0], 3)	// t: @@;
break;
case 278:
this.$ = unescapeLangString($$[$0], 1)	// t: 1val1LANGTAG;
break;
case 279:
this.$ = unescapeLangString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG2_with_LANGTAG;
break;
case 280:
 // t: 1dot
        const unesc = ShExUtil.unescapeText($$[$0].slice(1,-1), {});
        this.$ = yy._base === null || absoluteIRI.test(unesc) ? unesc : yy._resolveIRI(unesc)
      
break;
case 282:
 // t:1dotPNex, 1dotPNdefault, ShExParser-test.js/with pre-defined prefixes
        const namePos1 = $$[$0].indexOf(':');
        this.$ = yy.expandPrefix($$[$0].substr(0, namePos1), yy) + ShExUtil.unescapeText($$[$0].substr(namePos1 + 1), pnameEscapeReplacements);
      
break;
case 283:
 // t: 1dotNS2, 1dotNSdefault, ShExParser-test.js/PNAME_NS with pre-defined prefixes
        this.$ = yy.expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy);
      
break;
case 285:
this.$ = $$[$0] // t: 0Extends1, 1dotExtends1, 1dot3ExtendsLN;
break;
case 291:
this.$ = shapeJunction("ShapeAnd", $$[$0-1], $$[$0]);
break;
case 295:
this.$ = $$[$0-1] ? { type: "ShapeNot", "shapeExpr": nonest($$[$0]) } : $$[$0];
break;
case 299:
this.$ = Object.assign($$[$0-1], {nested: true});
break;
case 300:
this.$ = yy.EmptyShape;
break;
case 303:
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
        this.rules = [/^(?:\s+|(#[^\u000a\u000d]*|\/\*([^*]|\*([^/]|\\\/))*\*\/))/,/^(?:(@(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*))))/,/^(?:(@((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)))/,/^(?:(@([A-Za-z])+((-([0-9A-Za-z])+))*))/,/^(?:@)/,/^(?:(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*)))/,/^(?:(\{((([+-])?([0-9])+))((,(((([+-])?([0-9])+))|\*)?))?\}))/,/^(?:(([+-])?((([0-9])+\.([0-9])*(([Ee]([+-])?([0-9])+)))|((\.)?([0-9])+(([Ee]([+-])?([0-9])+))))))/,/^(?:(([+-])?([0-9])*\.([0-9])+))/,/^(?:(([+-])?([0-9])+))/,/^(?:{ANON})/,/^(?:(<([^\u0000-\u0020<>\"{}|^`\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*>))/,/^(?:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:))/,/^(?:a\b)/,/^(?:(\/([^\u002f\u005C\u000A\u000D]|\\[nrt\\|.?*+(){}$\u002D\u005B\u005D\u005E/]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))+\/[smix]*))/,/^(?:(_:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|[0-9])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?))/,/^(?:(\{([^%\\]|\\[%\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*%\}))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"))/,/^(?:([Bb][Aa][Ss][Ee]))/,/^(?:([Pp][Rr][Ee][Ff][Ii][Xx]))/,/^(?:([iI][mM][pP][oO][rR][tT]))/,/^(?:([sS][tT][aA][rR][tT]))/,/^(?:([eE][xX][tT][eE][rR][nN][aA][lL]))/,/^(?:([Aa][Bb][Ss][Tt][Rr][Aa][Cc][Tt]))/,/^(?:([Rr][Ee][Ss][Tt][Rr][Ii][Cc][Tt][Ss]))/,/^(?:([Ee][Xx][Tt][Ee][Nn][Dd][Ss]))/,/^(?:([Cc][Ll][Oo][Ss][Ee][Dd]))/,/^(?:([Ee][Xx][Tt][Rr][Aa]))/,/^(?:([Ll][Ii][Tt][Ee][Rr][Aa][Ll]))/,/^(?:([Bb][Nn][Oo][Dd][Ee]))/,/^(?:([Ii][Rr][Ii]))/,/^(?:([Nn][Oo][Nn][Ll][Ii][Tt][Ee][Rr][Aa][Ll]))/,/^(?:([Aa][Nn][Dd]))/,/^(?:([Oo][Rr]))/,/^(?:([No][Oo][Tt]))/,/^(?:([Mm][Ii][Nn][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Ii][Nn][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Aa][Xx][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Aa][Xx][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Mm][Ii][Nn][Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Mm][Aa][Xx][Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Tt][Oo][Tt][Aa][Ll][Dd][Ii][Gg][Ii][Tt][Ss]))/,/^(?:([Ff][Rr][Aa][Cc][Tt][Ii][Oo][Nn][Dd][Ii][Gg][Ii][Tt][Ss]))/,/^(?:([Uu][Nn][Ii][Qq][Uu][Ee]))/,/^(?:([Ff][Oo][Cc][Uu][Ss]))/,/^(?:([Dd][Aa][Tt][Aa][Tt][Yy][Pp][Ee]))/,/^(?:([Ll][Aa][Nn][Gg][Tt][Aa][Gg]))/,/^(?:<)/,/^(?:=)/,/^(?:>)/,/^(?:!=)/,/^(?:\/\/)/,/^(?:\{)/,/^(?:\})/,/^(?:&)/,/^(?:\|\|)/,/^(?:\|)/,/^(?:,)/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?:\$)/,/^(?:!)/,/^(?:\^\^)/,/^(?:\^)/,/^(?:\.)/,/^(?:~)/,/^(?:;)/,/^(?:\*)/,/^(?:\+)/,/^(?:\?)/,/^(?:-)/,/^(?:%)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:$)/,/^(?:[a-zA-Z0-9_-]+)/,/^(?:.)/];
        this.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86],"inclusive":true}};
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
    case 3: yy_.yytext = yy_.yytext.substr(1); return 187; 
      break;
    case 4:return 81;
      break;
    case 5:return 230;
      break;
    case 6:return 160;
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
    case 13:return 214;
      break;
    case 14:return 101;
      break;
    case 15:return 231;
      break;
    case 16:return 210;
      break;
    case 17:return 226;
      break;
    case 18:return 228;
      break;
    case 19:return 225;
      break;
    case 20:return 227;
      break;
    case 21:return 222;
      break;
    case 22:return 224;
      break;
    case 23:return 221;
      break;
    case 24:return 223;
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
    case 31:return 244;
      break;
    case 32:return 242;
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
    case 51:return 191;
      break;
    case 52:return 197;
      break;
    case 53:return 203;
      break;
    case 54:return 202;
      break;
    case 55:return 199;
      break;
    case 56:return 27;
      break;
    case 57:return 201;
      break;
    case 58:return 200;
      break;
    case 59:return 205;
      break;
    case 60:return 119;
      break;
    case 61:return 121;
      break;
    case 62:return 204;
      break;
    case 63:return '||';
      break;
    case 64:return 135;
      break;
    case 65:return 140;
      break;
    case 66:return 69;
      break;
    case 67:return 70;
      break;
    case 68:return 163;
      break;
    case 69:return 165;
      break;
    case 70:return 149;
      break;
    case 71:return 162;
      break;
    case 72:return 111;
      break;
    case 73:return 161;
      break;
    case 74:return 71;
      break;
    case 75:return 180;
      break;
    case 76:return 141;
      break;
    case 77:return 157;
      break;
    case 78:return 158;
      break;
    case 79:return 159;
      break;
    case 80:return 181;
      break;
    case 81:return 208;
      break;
    case 82:return 219;
      break;
    case 83:return 220;
      break;
    case 84:return 7;
      break;
    case 85:return 'unexpected word "'+yy_.yytext+'"';
      break;
    case 86:return 'invalid character '+yy_.yytext;
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
            } else if (tripleExpr.type === "Unique") {
            } else if (tripleExpr.type === "ValueComparison") {
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
    case "ValueComparisonFailure":
      return ["ValueComparisonFailure: expected " + val.left + val.comparator + val.right];
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

      else if (expr.type === "ValueComparison" || expr.type === "Unique")
        return [];

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
  this.validate = function (point, label, tracker, seen, matchTarget, subGraph, uniques) {
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
    if (seen === undefined)
      seen = {};
    if (uniques === undefined)
      uniques = {};

    let shape = null;
    if (label == Start) {
      shape = schema.start;
    } else {
      shape = this._lookupShape(label);
    }

    // if we passed in an expression rather than a label, validate it directly.
    if (typeof label !== "string")
      return this._validateShapeExpr(point, shape, Start, 0, tracker, seen, null, null, uniques);

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
    const ret = this._validateDescendants(point, label, 0, tracker, seen, matchTarget, subGraph, false, uniques);
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

  this._validateDescendants = function (point, shapeLabel, depth, tracker, seen, matchTarget, subGraph, allowAbstract, uniques) {
    const _ShExValidator = this;
    if (subGraph) { // !! matchTarget?
      // matchTarget indicates that shape substitution has already been applied.
      // Now we're testing a subgraph against the base shapes.
      const res = this._validateShapeDecl(point, this._lookupShape(shapeLabel), shapeLabel, 0, tracker, seen, matchTarget, subGraph, uniques);
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
      const res = this._validateShapeDecl(point, shapeExpr, candidateShapeLabel, 0, tracker, seen, matchTarget, subGraph, uniques);
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

  this._validateShapeDecl = function (point, shapeDecl, shapeLabel, depth, tracker, seen, matchTarget, subGraph, uniques) {
    const conjuncts = (shapeDecl.restricts || []).concat([shapeDecl.shapeExpr])
    const expr = conjuncts.length === 1
          ? conjuncts[0]
          : { type: "ShapeAnd", shapeExprs: conjuncts };
    return this._validateShapeExpr(point, expr, shapeLabel, depth, tracker, seen, matchTarget, subGraph, uniques);
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

  this._validateShapeExpr = function (point, shapeExpr, shapeLabel, depth, tracker, seen, matchTarget, subGraph, uniques) {
    if (point === "")
      throw Error("validation needs a valid focus node");
    let ret = null
    if (typeof shapeExpr === "string") { // ShapeRef
      ret = this._validateDescendants(point, shapeExpr, depth, tracker, seen, matchTarget, subGraph, true, uniques);
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
      ret = this._validateShape(point, shapeExpr, shapeLabel, depth, tracker, seen, matchTarget, subGraph, uniques);
    } else if (shapeExpr.type === "ShapeExternal") {
      ret = this.options.validateExtern(point, shapeLabel, tracker, seen, uniques);
    } else if (shapeExpr.type === "ShapeOr") {
      const errors = [];
      for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        const nested = shapeExpr.shapeExprs[i];
        const sub = this._validateShapeExpr(point, nested, shapeLabel, depth, tracker, seen, matchTarget, subGraph, uniques);
        if ("errors" in sub)
          errors.push(sub);
        else if (!matchTarget || matchTarget.count > 0)
          return { type: "ShapeOrResults", solution: sub };
      }
      ret = { type: "ShapeOrFailure", errors: errors };
    } else if (shapeExpr.type === "ShapeNot") {
      const sub = this._validateShapeExpr(point, shapeExpr.shapeExpr, shapeLabel, depth, tracker, seen, matchTarget, subGraph, uniques);
      if ("errors" in sub)
          ret = { type: "ShapeNotResults", solution: sub };
        else
          ret = { type: "ShapeNotFailure", errors: sub };
    } else if (shapeExpr.type === "ShapeAnd") {
      const passes = [];
      const errors = [];
      for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        const nested = shapeExpr.shapeExprs[i];
        const sub = this._validateShapeExpr(point, nested, shapeLabel, depth, tracker, seen, matchTarget, subGraph, uniques);
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

  this._validateShape = function (point, shape, shapeLabel, depth, tracker, seen, matchTarget, subGraph, uniques) {
    const _ShExValidator = this;
    const valParms = { db, shapeLabel, depth, tracker, seen, uniques };

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
    const tripleList = matchByPredicate(constraintList, neighborhood, outgoingLength, point, valParms, matchTarget, null, uniques); // don't override with passed subGraph
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

  function matchByPredicate (constraintList, neighborhood, outgoingLength, point, valParms, matchTarget, subgraph, uniques) {
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
        matchPredicate, constraint, valParms, matchTarget, subgraph, uniques
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
      const sub = _ShExValidator._validateShapeExpr(point, extend, valParms.shapeLabel, valParms.depth, valParms.tracker, valParms.seen, matchTarget, subgraph, valParms.uniques);
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

  this._triplesMatchingShapeExpr = function (triples, constraint, valParms, matchTarget, subgraph, uniques) {
    const _ShExValidator = this;
    const misses = [];
    const hits = [];
    triples.forEach(function (triple) {
      const value = constraint.inverse ? triple.subject : triple.object;
      let sub;
      const oldBindings = JSON.parse(JSON.stringify(_ShExValidator.semActHandler.results));
      const errors = constraint.valueExpr === undefined ?
          undefined :
          (sub = _ShExValidator._errorsMatchingShapeExpr(value, constraint.valueExpr, valParms, matchTarget, subgraph, uniques)).errors;
      if (!errors) {
        hits.push({triple: triple, sub: sub});
      } else if (hits.indexOf(triple) === -1) {
        _ShExValidator.semActHandler.results = JSON.parse(JSON.stringify(oldBindings));
        misses.push({triple: triple, errors: sub});
      }
    });
    return { hits: hits, misses: misses };
  }

  this._errorsMatchingShapeExpr = function (value, valueExpr, valParms, matchTarget, subgraph, uniques) {
    const _ShExValidator = this;
    if (typeof valueExpr === "string") { // ShapeRef
      return _ShExValidator.validate(value, valueExpr, valParms.tracker, valParms.seen, matchTarget, subgraph, uniques);
    } else if (valueExpr.type === "NodeConstraint") {
      return this._errorsMatchingNodeConstraint(value, valueExpr, null);
    } else if (valueExpr.type === "Shape") {
      return _ShExValidator._validateShapeExpr(value, valueExpr, valParms.shapeLabel, valParms.depth, valParms.tracker, valParms.seen, matchTarget, subgraph)
    } else if (valueExpr.type === "ShapeOr") {
      const errors = [];
      for (let i = 0; i < valueExpr.shapeExprs.length; ++i) {
        const nested = valueExpr.shapeExprs[i];
        const sub = _ShExValidator._errorsMatchingShapeExpr(value, nested, valParms, matchTarget, subgraph, uniques);
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
        const sub = _ShExValidator._errorsMatchingShapeExpr(value, nested, valParms, matchTarget, subgraph, uniques);
        if ("errors" in sub)
          return { type: "ShapeAndFailure", errors: [sub] };
        else
          passes.push(sub);
      }
      return { type: "ShapeAndResults", solutions: passes };
    } else if (valueExpr.type === "ShapeNot") {
      const sub = _ShExValidator._errorsMatchingShapeExpr(value, valueExpr.shapeExpr, valParms, matchTarget, subgraph, uniques);
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
      case "Unique": return this.visitUnique(expr);
      case "ValueComparison": return this.visitValueComparison(expr);
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

    visitUnique: function (unique, ...args) {
      var ret = { type: "Unique" };
      this._expect(unique, "type", "Unique");

      if ("focus" in unique)
        ret.focus = unique.focus;
      ret.uniques = this._visitList(unique.uniques, ...args);
      return ret;
    },

    visitAccessors: function (accessors, ...args) {
      var _Visitor = this;
      return accessors.map(function (t) {
        return typeof t === "object" ? _Visitor.visitAccessorFunction(t, ...args) : t;
      });
    },

    visitAccessorFunction: function (f, ...args) {
      var _Visitor = this;
      var r =
          f.type === "LangtagAccessor" ? { type: "LangtagAccessor" } :
          f.type === "DatatypeAccessor" ? { type: "DatatypeAccessor" } :
          null;
      if (r === null)
        throw Error("unexpected accessor function : " + f.type);
      r.name = f.name;
      return r;
    },

    visitValueComparison: function (cmp, ...args) {
      var ret = { type: "ValueComparison" };
      this._expect(cmp, "type", "ValueComparison");

      ret.left = cmp.left;
      ret.comparator = cmp.comparator;
      ret.right = cmp.right;
      return ret;
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

/***/ 2863:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

ShExWebApp = (function () {
  const shapeMap = __webpack_require__(6261)
  return Object.assign({}, {
    ShExTerm:             __webpack_require__(1118),
    Util:                 __webpack_require__(9443),
    RdfJsDb:              (__webpack_require__(319).ctor),
    Validator:            __webpack_require__(3457),
    Writer:               __webpack_require__(95),
    Loader:               __webpack_require__(1837),
    Parser:               __webpack_require__(931),
    "eval-simple-1err":   __webpack_require__(6540),
    "eval-threaded-nerr": __webpack_require__(6863),
    ShapeMap:             shapeMap,
    ShapeMapParser:       shapeMap.Parser,
    JsYaml:               __webpack_require__(9431),
    DcTap:                (__webpack_require__(5281).DcTap),
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
/******/ 	var __webpack_exports__ = __webpack_require__(2863);
/******/ 	
/******/ })()
;