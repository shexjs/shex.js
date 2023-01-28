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
        const thisEvalThreadedNErrRegexEngine = this;
        /*
         * returns: list of passing or failing threads (no heterogeneous lists)
         */
        function validateExpr(expr, thread) {
            if (typeof expr === "string") { // Inclusion
                const included = thisEvalThreadedNErrRegexEngine.index.tripleExprs[expr];
                return validateExpr(included, thread);
            }
            let min = expr.min !== undefined ? expr.min : 1;
            let max = expr.max !== undefined ? expr.max === UNBOUNDED ? Infinity : expr.max : 1;
            function validateRept(groupTE, type, val) {
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
                        const sub = val(newt);
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
            if (expr.type === "TripleConstraint") {
                const constraint = expr;
                if (thread.avail.get(constraint) === undefined)
                    thread.avail.set(constraint, constraintToTripleMapping.get(constraint).map(pair => pair.triple));
                const minmax = {};
                if (expr.min !== undefined && expr.min !== 1 || expr.max !== undefined && expr.max !== 1) {
                    minmax.min = expr.min;
                    minmax.max = expr.max;
                }
                if (expr.semActs !== undefined)
                    minmax.semActs = expr.semActs;
                if (expr.annotations !== undefined)
                    minmax.annotations = expr.annotations;
                const taken = thread.avail.get(constraint).splice(0, min);
                const passed = taken.length >= min;
                const ret = [];
                const matched = thread.matched;
                if (passed) {
                    do {
                        const passFail = taken.reduce((acc, triple) => {
                            const tested = {
                                type: "TestedTriple",
                                subject: (0, term_1.rdfJsTerm2Ld)(triple.subject),
                                predicate: (0, term_1.rdfJsTerm2Ld)(triple.predicate),
                                object: (0, term_1.rdfJsTerm2Ld)(triple.object)
                            };
                            const hit = constraintToTripleMapping.get(constraint).find(x => x.triple === triple); // will definitely find one
                            if (hit.res !== undefined)
                                tested.referenced = hit.res;
                            const semActErrors = thread.errors.concat(expr.semActs !== undefined
                                ? semActHandler.dispatchAll(expr.semActs, triple, tested)
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
                            const myThread = makeThread(expr, passFail.pass, totalErrors);
                            ret.push(myThread);
                        }
                        else {
                            passFail.fail.forEach(f => ret.push(makeThread(expr, [f], f.semActErrors)));
                        }
                        function makeThread(expr, tests, errors) {
                            return {
                                avail: new Map(thread.avail),
                                errors: errors,
                                matched: matched.concat({
                                    triples: tests.map(p => p.triple)
                                }),
                                expression: Object.assign({
                                    type: "TripleConstraintSolutions",
                                    predicate: expr.predicate
                                }, expr.valueExpr !== undefined ? { valueExpr: expr.valueExpr } : {}, expr.id !== undefined ? { productionLabel: expr.id } : {}, minmax, {
                                    solutions: tests.map(p => p.tested)
                                })
                            };
                        }
                    } while ((function () {
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
                }
                else {
                    ret.push({
                        avail: thread.avail,
                        errors: thread.errors.concat([
                            Object.assign({
                                type: "MissingProperty",
                                property: expr.predicate
                            }, expr.valueExpr ? { valueExpr: expr.valueExpr } : {})
                        ]),
                        matched: matched
                    });
                }
                return ret;
            }
            else if (expr.type === "OneOf") {
                return validateRept(expr, "OneOfSolutions", (th) => {
                    // const accept = null;
                    const matched = [];
                    const failed = [];
                    expr.expressions.forEach(nested => {
                        const thcopy = {
                            avail: new Map(th.avail),
                            errors: th.errors,
                            matched: th.matched //.slice() ever needed??
                        };
                        const sub = validateExpr(nested, thcopy);
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
                });
            }
            else if (expr.type === "EachOf") {
                return homogenize(validateRept(expr, "EachOfSolutions", (th) => {
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
                }));
            }
            else {
                // runtimeError("unexpected expr type: " + expr.type);
                throw Error("how'd we get here?");
            }
            function homogenize(list) {
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
        const startingThread = {
            avail: new Map(),
            matched: [],
            errors: [] // errors encounted
        };
        const ret = validateExpr(this.outerExpression, startingThread);
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
        return longerChosen !== null ?
            this.finish(longerChosen.expression) :
            ret.length > 1 ? {
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
    finish(fromValidatePoint) {
        if (this.shape.semActs !== undefined)
            fromValidatePoint.semActs = this.shape.semActs;
        return fromValidatePoint;
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

const { JisonParser, o } = __webpack_require__(9041);const $V0=[7,18,19,20,21,23,26,36,193,215,216],$V1=[19,21,215,216],$V2=[2,27],$V3=[1,22],$V4=[1,23],$V5=[2,12],$V6=[2,13],$V7=[2,14],$V8=[7,18,19,20,21,23,26,36,215,216],$V9=[1,29],$Va=[1,32],$Vb=[1,31],$Vc=[2,18],$Vd=[2,19],$Ve=[1,38],$Vf=[1,42],$Vg=[1,41],$Vh=[1,40],$Vi=[1,44],$Vj=[1,47],$Vk=[1,46],$Vl=[2,15],$Vm=[2,17],$Vn=[2,261],$Vo=[2,262],$Vp=[2,263],$Vq=[2,264],$Vr=[19,21,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,161,189,215,227],$Vs=[2,62],$Vt=[1,65],$Vu=[19,21,40,44,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,161,179,189,215,227,229],$Vv=[2,29],$Vw=[2,239],$Vx=[2,240],$Vy=[2,265],$Vz=[193,195],$VA=[1,73],$VB=[1,76],$VC=[1,75],$VD=[2,16],$VE=[7,18,19,20,21,23,26,36,51,215,216],$VF=[2,48],$VG=[7,18,19,20,21,23,26,36,51,53,215,216],$VH=[2,55],$VI=[119,125,127,189,227],$VJ=[2,140],$VK=[1,111],$VL=[1,119],$VM=[1,93],$VN=[1,101],$VO=[1,102],$VP=[1,103],$VQ=[1,110],$VR=[1,115],$VS=[1,116],$VT=[1,117],$VU=[1,120],$VV=[1,121],$VW=[1,122],$VX=[1,123],$VY=[1,124],$VZ=[1,125],$V_=[1,106],$V$=[1,118],$V01=[2,63],$V11=[19,21,69,71,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,161,189,215,227],$V21=[1,138],$V31=[1,137],$V41=[2,230],$V51=[2,231],$V61=[2,232],$V71=[2,20],$V81=[1,145],$V91=[2,54],$Va1=[1,147],$Vb1=[2,61],$Vc1=[2,70],$Vd1=[1,153],$Ve1=[1,154],$Vf1=[1,155],$Vg1=[2,66],$Vh1=[2,72],$Vi1=[1,162],$Vj1=[1,163],$Vk1=[1,164],$Vl1=[1,167],$Vm1=[1,170],$Vn1=[1,172],$Vo1=[1,173],$Vp1=[1,174],$Vq1=[2,69],$Vr1=[7,18,19,20,21,23,26,36,51,53,79,80,81,119,125,127,189,190,193,215,216,227],$Vs1=[2,96],$Vt1=[7,18,19,20,21,23,26,36,51,53,190,193,215,216],$Vu1=[7,18,19,20,21,23,26,36,51,53,96,97,98,101,102,103,104,215,216],$Vv1=[2,88],$Vw1=[2,89],$Vx1=[7,18,19,20,21,23,26,36,51,53,79,80,81,101,102,103,104,119,125,127,189,190,193,215,216,227],$Vy1=[2,109],$Vz1=[2,108],$VA1=[7,18,19,20,21,23,26,36,51,53,101,102,103,104,112,113,114,115,116,117,190,193,215,216],$VB1=[2,103],$VC1=[2,102],$VD1=[7,18,19,20,21,23,26,36,51,53,96,97,98,101,102,103,104,190,193,215,216],$VE1=[2,92],$VF1=[2,93],$VG1=[2,113],$VH1=[2,114],$VI1=[2,115],$VJ1=[2,111],$VK1=[2,238],$VL1=[19,21,71,81,100,108,109,163,185,204,205,206,207,208,209,210,211,212,213,215],$VM1=[2,184],$VN1=[7,18,19,20,21,23,26,36,51,53,112,113,114,115,116,117,190,193,215,216],$VO1=[2,105],$VP1=[1,197],$VQ1=[1,199],$VR1=[1,201],$VS1=[1,200],$VT1=[2,119],$VU1=[1,208],$VV1=[1,209],$VW1=[1,210],$VX1=[1,211],$VY1=[100,108,109,206,207,208,209],$VZ1=[2,26],$V_1=[2,31],$V$1=[2,32],$V02=[2,33],$V12=[79,80,81,119,125,127,189,227],$V22=[1,273],$V32=[1,278],$V42=[1,255],$V52=[1,263],$V62=[1,264],$V72=[1,265],$V82=[1,272],$V92=[1,268],$Va2=[1,277],$Vb2=[2,49],$Vc2=[2,56],$Vd2=[2,65],$Ve2=[2,71],$Vf2=[2,67],$Vg2=[2,73],$Vh2=[7,18,19,20,21,23,26,36,51,53,101,102,103,104,190,193,215,216],$Vi2=[1,332],$Vj2=[1,340],$Vk2=[1,341],$Vl2=[1,342],$Vm2=[1,348],$Vn2=[1,349],$Vo2=[51,53],$Vp2=[7,18,19,20,21,23,26,36,51,53,79,80,81,119,125,127,189,193,215,216,227],$Vq2=[2,228],$Vr2=[7,18,19,20,21,23,26,36,51,53,193,215,216],$Vs2=[1,365],$Vt2=[2,107],$Vu2=[2,112],$Vv2=[2,99],$Vw2=[1,371],$Vx2=[2,100],$Vy2=[2,101],$Vz2=[2,106],$VA2=[7,18,19,20,21,23,26,36,51,53,96,97,98,101,102,103,104,193,215,216],$VB2=[2,94],$VC2=[1,388],$VD2=[1,394],$VE2=[1,383],$VF2=[1,387],$VG2=[1,397],$VH2=[1,398],$VI2=[1,399],$VJ2=[1,386],$VK2=[1,400],$VL2=[1,401],$VM2=[1,406],$VN2=[1,407],$VO2=[1,408],$VP2=[1,409],$VQ2=[1,402],$VR2=[1,403],$VS2=[1,404],$VT2=[1,405],$VU2=[1,393],$VV2=[19,21,69,160,199,215],$VW2=[2,168],$VX2=[2,142],$VY2=[1,422],$VZ2=[1,421],$V_2=[1,432],$V$2=[1,435],$V03=[1,431],$V13=[1,434],$V23=[19,21,44,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,161,189,215,227],$V33=[2,118],$V43=[2,123],$V53=[2,125],$V63=[2,126],$V73=[2,127],$V83=[2,253],$V93=[2,254],$Va3=[2,255],$Vb3=[2,256],$Vc3=[2,124],$Vd3=[2,36],$Ve3=[2,40],$Vf3=[2,43],$Vg3=[2,46],$Vh3=[19,21,40,44,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,161,179,189,190,193,215,227,229],$Vi3=[2,37],$Vj3=[2,75],$Vk3=[2,78],$Vl3=[1,457],$Vm3=[1,459],$Vn3=[1,465],$Vo3=[1,466],$Vp3=[1,467],$Vq3=[1,474],$Vr3=[1,475],$Vs3=[1,476],$Vt3=[1,479],$Vu3=[2,42],$Vv3=[1,557],$Vw3=[2,45],$Vx3=[1,593],$Vy3=[2,68],$Vz3=[51,53,70],$VA3=[1,622],$VB3=[51,53,70,79,80,81,119,125,127,189,190,193,227],$VC3=[51,53,70,190,193],$VD3=[51,53,70,96,97,98,101,102,103,104,190,193],$VE3=[51,53,70,79,80,81,101,102,103,104,119,125,127,189,190,193,227],$VF3=[51,53,70,101,102,103,104,112,113,114,115,116,117,190,193],$VG3=[51,53,70,112,113,114,115,116,117,190,193],$VH3=[51,70],$VI3=[7,18,19,20,21,23,26,36,51,53,79,80,81,119,125,127,189,215,216,227],$VJ3=[2,98],$VK3=[2,97],$VL3=[2,227],$VM3=[1,664],$VN3=[1,667],$VO3=[1,663],$VP3=[1,666],$VQ3=[2,95],$VR3=[2,110],$VS3=[2,104],$VT3=[2,116],$VU3=[2,117],$VV3=[2,135],$VW3=[2,183],$VX3=[1,697],$VY3=[19,21,71,81,100,108,109,163,178,185,204,205,206,207,208,209,210,211,212,213,215],$VZ3=[2,233],$V_3=[2,234],$V$3=[2,235],$V04=[2,246],$V14=[2,249],$V24=[2,243],$V34=[2,244],$V44=[2,245],$V54=[2,251],$V64=[2,252],$V74=[2,257],$V84=[2,258],$V94=[2,259],$Va4=[2,260],$Vb4=[19,21,71,81,100,108,109,111,163,178,185,204,205,206,207,208,209,210,211,212,213,215],$Vc4=[2,147],$Vd4=[2,148],$Ve4=[1,705],$Vf4=[2,149],$Vg4=[121,135],$Vh4=[2,154],$Vi4=[2,155],$Vj4=[2,157],$Vk4=[1,708],$Vl4=[1,709],$Vm4=[19,21,199,215],$Vn4=[2,176],$Vo4=[1,717],$Vp4=[121,135,140,141],$Vq4=[2,166],$Vr4=[51,119,125,127,189,227],$Vs4=[51,53,119,125,127,189,227],$Vt4=[2,274],$Vu4=[1,750],$Vv4=[1,751],$Vw4=[1,752],$Vx4=[1,762],$Vy4=[19,21,119,125,127,189,199,215,227],$Vz4=[2,236],$VA4=[2,237],$VB4=[2,44],$VC4=[2,41],$VD4=[2,47],$VE4=[19,21,40,44,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,161,179,189,193,215,227,229],$VF4=[2,34],$VG4=[2,38],$VH4=[2,74],$VI4=[2,76],$VJ4=[2,35],$VK4=[1,809],$VL4=[1,815],$VM4=[1,855],$VN4=[1,902],$VO4=[51,53,70,101,102,103,104,190,193],$VP4=[51,53,70,79,80,81,119,125,127,189,193,227],$VQ4=[51,53,70,193],$VR4=[1,945],$VS4=[51,53,70,96,97,98,101,102,103,104,193],$VT4=[1,955],$VU4=[1,992],$VV4=[1,1028],$VW4=[2,229],$VX4=[1,1039],$VY4=[1,1045],$VZ4=[1,1044],$V_4=[19,21,100,108,109,204,205,206,207,208,209,210,211,212,213,215],$V$4=[1,1065],$V05=[1,1071],$V15=[1,1070],$V25=[1,1092],$V35=[1,1098],$V45=[1,1097],$V55=[1,1115],$V65=[1,1117],$V75=[1,1119],$V85=[19,21,71,81,100,108,109,163,179,185,204,205,206,207,208,209,210,211,212,213,215],$V95=[1,1123],$Va5=[1,1129],$Vb5=[1,1132],$Vc5=[1,1133],$Vd5=[1,1134],$Ve5=[1,1122],$Vf5=[1,1135],$Vg5=[1,1136],$Vh5=[1,1141],$Vi5=[1,1142],$Vj5=[1,1143],$Vk5=[1,1144],$Vl5=[1,1137],$Vm5=[1,1138],$Vn5=[1,1139],$Vo5=[1,1140],$Vp5=[1,1128],$Vq5=[2,247],$Vr5=[2,250],$Vs5=[2,136],$Vt5=[2,150],$Vu5=[2,152],$Vv5=[2,156],$Vw5=[2,158],$Vx5=[2,159],$Vy5=[2,163],$Vz5=[2,165],$VA5=[2,170],$VB5=[2,171],$VC5=[1,1159],$VD5=[1,1162],$VE5=[1,1158],$VF5=[1,1161],$VG5=[1,1172],$VH5=[2,223],$VI5=[2,241],$VJ5=[2,242],$VK5=[2,272],$VL5=[2,276],$VM5=[2,278],$VN5=[2,86],$VO5=[1,1193],$VP5=[2,281],$VQ5=[79,80,81,101,102,103,104,119,125,127,189,227],$VR5=[51,53,101,102,103,104,112,113,114,115,116,117,119,125,127,189,227],$VS5=[51,53,96,97,98,101,102,103,104,119,125,127,189,227],$VT5=[2,90],$VU5=[2,91],$VV5=[51,53,112,113,114,115,116,117,119,125,127,189,227],$VW5=[2,128],$VX5=[2,77],$VY5=[1,1252],$VZ5=[1,1288],$V_5=[1,1347],$V$5=[1,1353],$V06=[1,1385],$V16=[1,1391],$V26=[51,53,70,79,80,81,119,125,127,189,227],$V36=[51,53,70,96,97,98,101,102,103,104],$V46=[1,1449],$V56=[1,1496],$V66=[2,224],$V76=[2,225],$V86=[2,226],$V96=[7,18,19,20,21,23,26,36,51,53,79,80,81,111,119,125,127,189,190,193,215,216,227],$Va6=[7,18,19,20,21,23,26,36,51,53,111,190,193,215,216],$Vb6=[7,18,19,20,21,23,26,36,51,53,96,97,98,101,102,103,104,111,190,193,215,216],$Vc6=[2,206],$Vd6=[1,1549],$Ve6=[19,21,71,81,100,108,109,163,178,179,185,204,205,206,207,208,209,210,211,212,213,215],$Vf6=[19,21,71,81,100,108,109,111,163,178,179,185,204,205,206,207,208,209,210,211,212,213,215],$Vg6=[2,248],$Vh6=[2,153],$Vi6=[2,151],$Vj6=[2,160],$Vk6=[2,164],$Vl6=[2,161],$Vm6=[2,162],$Vn6=[1,1566],$Vo6=[70,135],$Vp6=[1,1569],$Vq6=[1,1570],$Vr6=[70,135,140,141],$Vs6=[2,275],$Vt6=[2,277],$Vu6=[2,279],$Vv6=[2,87],$Vw6=[51,53,101,102,103,104,119,125,127,189,227],$Vx6=[1,1608],$Vy6=[1,1618],$Vz6=[1,1624],$VA6=[1,1623],$VB6=[1,1661],$VC6=[1,1708],$VD6=[1,1741],$VE6=[1,1747],$VF6=[1,1746],$VG6=[1,1767],$VH6=[1,1773],$VI6=[1,1772],$VJ6=[1,1794],$VK6=[1,1800],$VL6=[1,1799],$VM6=[1,1845],$VN6=[1,1911],$VO6=[1,1917],$VP6=[1,1916],$VQ6=[1,1937],$VR6=[1,1943],$VS6=[1,1942],$VT6=[1,1963],$VU6=[1,1969],$VV6=[1,1968],$VW6=[1,2010],$VX6=[1,2016],$VY6=[1,2048],$VZ6=[1,2054],$V_6=[121,135,140,141,190,193],$V$6=[2,173],$V07=[1,2074],$V17=[1,2075],$V27=[1,2076],$V37=[1,2077],$V47=[121,135,140,141,156,157,158,159,190,193],$V57=[2,39],$V67=[51,121,135,140,141,156,157,158,159,190,193],$V77=[2,52],$V87=[51,53,121,135,140,141,156,157,158,159,190,193],$V97=[2,59],$Va7=[1,2106],$Vb7=[2,273],$Vc7=[2,280],$Vd7=[19,21,40,44,69,71,79,80,81,85,96,97,98,101,102,103,104,111,112,113,114,115,116,117,119,125,127,161,179,189,190,193,215,227,229],$Ve7=[1,2219],$Vf7=[1,2225],$Vg7=[1,2257],$Vh7=[1,2263],$Vi7=[1,2316],$Vj7=[1,2349],$Vk7=[1,2355],$Vl7=[1,2354],$Vm7=[1,2375],$Vn7=[1,2381],$Vo7=[1,2380],$Vp7=[1,2402],$Vq7=[1,2408],$Vr7=[1,2407],$Vs7=[1,2429],$Vt7=[1,2435],$Vu7=[1,2434],$Vv7=[1,2455],$Vw7=[1,2461],$Vx7=[1,2460],$Vy7=[1,2482],$Vz7=[1,2488],$VA7=[1,2487],$VB7=[51,53,70,79,80,81,111,119,125,127,189,190,193,227],$VC7=[51,53,70,111,190,193],$VD7=[51,53,70,96,97,98,101,102,103,104,111,190,193],$VE7=[1,2557],$VF7=[2,174],$VG7=[2,178],$VH7=[2,179],$VI7=[2,180],$VJ7=[2,181],$VK7=[2,50],$VL7=[2,57],$VM7=[2,64],$VN7=[2,84],$VO7=[2,80],$VP7=[1,2640],$VQ7=[2,83],$VR7=[51,53,79,80,81,101,102,103,104,119,121,125,127,135,140,141,156,157,158,159,189,190,193,227],$VS7=[51,53,79,80,81,119,121,125,127,135,140,141,156,157,158,159,189,190,193,227],$VT7=[51,53,101,102,103,104,112,113,114,115,116,117,121,135,140,141,156,157,158,159,190,193],$VU7=[51,53,96,97,98,101,102,103,104,121,135,140,141,156,157,158,159,190,193],$VV7=[51,53,112,113,114,115,116,117,121,135,140,141,156,157,158,159,190,193],$VW7=[1,2690],$VX7=[1,2728],$VY7=[1,2783],$VZ7=[1,2872],$V_7=[1,2878],$V$7=[1,2961],$V08=[1,2994],$V18=[1,3000],$V28=[1,2999],$V38=[1,3020],$V48=[1,3026],$V58=[1,3025],$V68=[1,3047],$V78=[1,3053],$V88=[1,3052],$V98=[1,3074],$Va8=[1,3080],$Vb8=[1,3079],$Vc8=[1,3100],$Vd8=[1,3106],$Ve8=[1,3105],$Vf8=[1,3127],$Vg8=[1,3133],$Vh8=[1,3132],$Vi8=[121,135,140,141,193],$Vj8=[1,3152],$Vk8=[2,53],$Vl8=[2,60],$Vm8=[2,79],$Vn8=[2,85],$Vo8=[2,81],$Vp8=[51,53,101,102,103,104,121,135,140,141,156,157,158,159,190,193],$Vq8=[1,3176],$Vr8=[70,135,140,141,190,193],$Vs8=[1,3185],$Vt8=[1,3186],$Vu8=[1,3187],$Vv8=[1,3188],$Vw8=[70,135,140,141,156,157,158,159,190,193],$Vx8=[51,70,135,140,141,156,157,158,159,190,193],$Vy8=[51,53,70,135,140,141,156,157,158,159,190,193],$Vz8=[1,3217],$VA8=[1,3244],$VB8=[1,3267],$VC8=[1,3298],$VD8=[1,3331],$VE8=[1,3337],$VF8=[1,3336],$VG8=[1,3357],$VH8=[1,3363],$VI8=[1,3362],$VJ8=[1,3384],$VK8=[1,3390],$VL8=[1,3389],$VM8=[1,3411],$VN8=[1,3417],$VO8=[1,3416],$VP8=[1,3437],$VQ8=[1,3443],$VR8=[1,3442],$VS8=[1,3464],$VT8=[1,3470],$VU8=[1,3469],$VV8=[1,3547],$VW8=[1,3553],$VX8=[2,175],$VY8=[2,51],$VZ8=[1,3641],$V_8=[2,58],$V$8=[1,3674],$V09=[2,82],$V19=[2,172],$V29=[1,3719],$V39=[51,53,70,79,80,81,101,102,103,104,119,125,127,135,140,141,156,157,158,159,189,190,193,227],$V49=[51,53,70,79,80,81,119,125,127,135,140,141,156,157,158,159,189,190,193,227],$V59=[51,53,70,101,102,103,104,112,113,114,115,116,117,135,140,141,156,157,158,159,190,193],$V69=[51,53,70,96,97,98,101,102,103,104,135,140,141,156,157,158,159,190,193],$V79=[51,53,70,112,113,114,115,116,117,135,140,141,156,157,158,159,190,193],$V89=[1,3824],$V99=[1,3830],$Va9=[1,3893],$Vb9=[1,3899],$Vc9=[1,3898],$Vd9=[1,3919],$Ve9=[1,3925],$Vf9=[1,3924],$Vg9=[1,3946],$Vh9=[1,3952],$Vi9=[1,3951],$Vj9=[1,4011],$Vk9=[1,4017],$Vl9=[1,4016],$Vm9=[1,4052],$Vn9=[1,4094],$Vo9=[70,135,140,141,193],$Vp9=[1,4124],$Vq9=[51,53,70,101,102,103,104,135,140,141,156,157,158,159,190,193],$Vr9=[1,4148],$Vs9=[1,4171],$Vt9=[1,4265],$Vu9=[1,4271],$Vv9=[1,4270],$Vw9=[1,4291],$Vx9=[1,4297],$Vy9=[1,4296],$Vz9=[1,4318],$VA9=[1,4324],$VB9=[1,4323],$VC9=[111,121,135,140,141,190,193],$VD9=[1,4366],$VE9=[1,4390],$VF9=[1,4432],$VG9=[1,4465],$VH9=[1,4505],$VI9=[1,4528],$VJ9=[1,4534],$VK9=[1,4533],$VL9=[1,4554],$VM9=[1,4560],$VN9=[1,4559],$VO9=[1,4581],$VP9=[1,4587],$VQ9=[1,4586],$VR9=[1,4661],$VS9=[1,4704],$VT9=[1,4710],$VU9=[1,4709],$VV9=[1,4745],$VW9=[1,4787],$VX9=[1,4877],$VY9=[70,111,135,140,141,190,193],$VZ9=[1,4932],$V_9=[1,4956],$V$9=[1,4994],$V0a=[1,5040],$V1a=[1,5118],$V2a=[1,5167];

class ShExJisonParser extends JisonParser {
    constructor(yy = {}, lexer = new ShExJisonLexer(yy)) {
        super(yy, lexer);
        this.symbols_ = {"error":2,"shexDoc":3,"initParser":4,"Qdirective_E_Star":5,"Q_O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C_E_Opt":6,"EOF":7,"directive":8,"O_QnotStartAction_E_Or_QstartActions_E_C":9,"notStartAction":10,"startActions":11,"Qstatement_E_Star":12,"statement":13,"O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C":14,"baseDecl":15,"prefixDecl":16,"importDecl":17,"IT_BASE":18,"IRIREF":19,"IT_PREFIX":20,"PNAME_NS":21,"iri":22,"IT_IMPORT":23,"start":24,"shapeExprDecl":25,"IT_start":26,"=":27,"shapeAnd":28,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Star":29,"QcodeDecl_E_Plus":30,"codeDecl":31,"QIT_ABSTRACT_E_Opt":32,"shapeExprLabel":33,"Qrestriction_E_Star":34,"O_QshapeExpression_E_Or_QshapeRef_E_Or_QIT_EXTERNAL_E_C":35,"IT_ABSTRACT":36,"restriction":37,"shapeExpression":38,"shapeRef":39,"IT_EXTERNAL":40,"QIT_NOT_E_Opt":41,"shapeAtomNoRef":42,"QshapeOr_E_Opt":43,"IT_NOT":44,"shapeOr":45,"inlineShapeExpression":46,"inlineShapeOr":47,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Plus":48,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Plus":49,"O_QIT_OR_E_S_QshapeAnd_E_C":50,"IT_OR":51,"O_QIT_AND_E_S_QshapeNot_E_C":52,"IT_AND":53,"shapeNot":54,"inlineShapeAnd":55,"Q_O_QIT_OR_E_S_QinlineShapeAnd_E_C_E_Star":56,"O_QIT_OR_E_S_QinlineShapeAnd_E_C":57,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Star":58,"inlineShapeNot":59,"Q_O_QIT_AND_E_S_QinlineShapeNot_E_C_E_Star":60,"O_QIT_AND_E_S_QinlineShapeNot_E_C":61,"shapeAtom":62,"inlineShapeAtom":63,"nonLitNodeConstraint":64,"QshapeOrRef_E_Opt":65,"litNodeConstraint":66,"shapeOrRef":67,"QnonLitNodeConstraint_E_Opt":68,"(":69,")":70,".":71,"shapeDefinition":72,"nonLitInlineNodeConstraint":73,"QinlineShapeOrRef_E_Opt":74,"litInlineNodeConstraint":75,"inlineShapeOrRef":76,"QnonLitInlineNodeConstraint_E_Opt":77,"inlineShapeDefinition":78,"ATPNAME_LN":79,"ATPNAME_NS":80,"@":81,"Qannotation_E_Star":82,"semanticActions":83,"annotation":84,"IT_LITERAL":85,"QxsFacet_E_Star":86,"datatype":87,"valueSet":88,"QnumericFacet_E_Plus":89,"xsFacet":90,"numericFacet":91,"nonLiteralKind":92,"QstringFacet_E_Star":93,"QstringFacet_E_Plus":94,"stringFacet":95,"IT_IRI":96,"IT_BNODE":97,"IT_NONLITERAL":98,"stringLength":99,"INTEGER":100,"REGEXP":101,"IT_LENGTH":102,"IT_MINLENGTH":103,"IT_MAXLENGTH":104,"numericRange":105,"rawNumeric":106,"numericLength":107,"DECIMAL":108,"DOUBLE":109,"string":110,"^^":111,"IT_MININCLUSIVE":112,"IT_MINEXCLUSIVE":113,"IT_MAXINCLUSIVE":114,"IT_MAXEXCLUSIVE":115,"IT_TOTALDIGITS":116,"IT_FRACTIONDIGITS":117,"Q_O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C_E_Star":118,"{":119,"QtripleExpression_E_Opt":120,"}":121,"O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C":122,"extension":123,"extraPropertySet":124,"IT_CLOSED":125,"tripleExpression":126,"IT_EXTRA":127,"Qpredicate_E_Plus":128,"predicate":129,"oneOfTripleExpr":130,"groupTripleExpr":131,"multiElementOneOf":132,"Q_O_QGT_PIPE_E_S_QgroupTripleExpr_E_C_E_Plus":133,"O_QGT_PIPE_E_S_QgroupTripleExpr_E_C":134,"|":135,"singleElementGroup":136,"multiElementGroup":137,"unaryTripleExpr":138,"QGT_SEMI_E_Opt":139,",":140,";":141,"Q_O_QGT_SEMI_E_S_QunaryTripleExpr_E_C_E_Plus":142,"O_QGT_SEMI_E_S_QunaryTripleExpr_E_C":143,"Q_O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C_E_Opt":144,"O_QtripleConstraint_E_Or_QbracketedTripleExpr_E_C":145,"include":146,"O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C":147,"$":148,"tripleExprLabel":149,"tripleConstraint":150,"bracketedTripleExpr":151,"Qcardinality_E_Opt":152,"cardinality":153,"QsenseFlags_E_Opt":154,"senseFlags":155,"*":156,"+":157,"?":158,"REPEAT_RANGE":159,"^":160,"[":161,"QvalueSetValue_E_Star":162,"]":163,"valueSetValue":164,"iriRange":165,"literalRange":166,"languageRange":167,"O_QiriExclusion_E_Plus_Or_QliteralExclusion_E_Plus_Or_QlanguageExclusion_E_Plus_C":168,"QiriExclusion_E_Plus":169,"iriExclusion":170,"QliteralExclusion_E_Plus":171,"literalExclusion":172,"QlanguageExclusion_E_Plus":173,"languageExclusion":174,"Q_O_QGT_TILDE_E_S_QiriExclusion_E_Star_C_E_Opt":175,"QiriExclusion_E_Star":176,"O_QGT_TILDE_E_S_QiriExclusion_E_Star_C":177,"~":178,"-":179,"QGT_TILDE_E_Opt":180,"literal":181,"Q_O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C_E_Opt":182,"QliteralExclusion_E_Star":183,"O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C":184,"LANGTAG":185,"Q_O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C_E_Opt":186,"O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C":187,"QlanguageExclusion_E_Star":188,"&":189,"//":190,"O_Qiri_E_Or_Qliteral_E_C":191,"QcodeDecl_E_Star":192,"%":193,"O_QCODE_E_Or_QGT_MODULO_E_C":194,"CODE":195,"rdfLiteral":196,"numericLiteral":197,"booleanLiteral":198,"a":199,"blankNode":200,"langString":201,"Q_O_QGT_DTYPE_E_S_Qdatatype_E_C_E_Opt":202,"O_QGT_DTYPE_E_S_Qdatatype_E_C":203,"IT_true":204,"IT_false":205,"STRING_LITERAL1":206,"STRING_LITERAL_LONG1":207,"STRING_LITERAL2":208,"STRING_LITERAL_LONG2":209,"LANG_STRING_LITERAL1":210,"LANG_STRING_LITERAL_LONG1":211,"LANG_STRING_LITERAL2":212,"LANG_STRING_LITERAL_LONG2":213,"prefixedName":214,"PNAME_LN":215,"BLANK_NODE_LABEL":216,"O_QIT_EXTENDS_E_Or_QGT_AMP_E_C":217,"extendsShapeExpression":218,"extendsShapeOr":219,"extendsShapeAnd":220,"Q_O_QIT_OR_E_S_QextendsShapeAnd_E_C_E_Star":221,"O_QIT_OR_E_S_QextendsShapeAnd_E_C":222,"extendsShapeNot":223,"Q_O_QIT_AND_E_S_QextendsShapeNot_E_C_E_Star":224,"O_QIT_AND_E_S_QextendsShapeNot_E_C":225,"extendsShapeAtom":226,"IT_EXTENDS":227,"O_QIT_RESTRICTS_E_Or_QGT_MINUS_E_C":228,"IT_RESTRICTS":229,"$accept":0,"$end":1};
        this.terminals_ = {2:"error",7:"EOF",18:"IT_BASE",19:"IRIREF",20:"IT_PREFIX",21:"PNAME_NS",23:"IT_IMPORT",26:"IT_start",27:"=",36:"IT_ABSTRACT",40:"IT_EXTERNAL",44:"IT_NOT",51:"IT_OR",53:"IT_AND",69:"(",70:")",71:".",79:"ATPNAME_LN",80:"ATPNAME_NS",81:"@",85:"IT_LITERAL",96:"IT_IRI",97:"IT_BNODE",98:"IT_NONLITERAL",100:"INTEGER",101:"REGEXP",102:"IT_LENGTH",103:"IT_MINLENGTH",104:"IT_MAXLENGTH",108:"DECIMAL",109:"DOUBLE",111:"^^",112:"IT_MININCLUSIVE",113:"IT_MINEXCLUSIVE",114:"IT_MAXINCLUSIVE",115:"IT_MAXEXCLUSIVE",116:"IT_TOTALDIGITS",117:"IT_FRACTIONDIGITS",119:"{",121:"}",125:"IT_CLOSED",127:"IT_EXTRA",135:"|",140:",",141:";",148:"$",156:"*",157:"+",158:"?",159:"REPEAT_RANGE",160:"^",161:"[",163:"]",178:"~",179:"-",185:"LANGTAG",189:"&",190:"//",193:"%",195:"CODE",199:"a",204:"IT_true",205:"IT_false",206:"STRING_LITERAL1",207:"STRING_LITERAL_LONG1",208:"STRING_LITERAL2",209:"STRING_LITERAL_LONG2",210:"LANG_STRING_LITERAL1",211:"LANG_STRING_LITERAL_LONG1",212:"LANG_STRING_LITERAL2",213:"LANG_STRING_LITERAL_LONG2",215:"PNAME_LN",216:"BLANK_NODE_LABEL",227:"IT_EXTENDS",229:"IT_RESTRICTS"};
        this.productions_ = [0,[3,4],[4,0],[5,0],[5,2],[9,1],[9,1],[12,0],[12,2],[14,2],[6,0],[6,1],[8,1],[8,1],[8,1],[15,2],[16,3],[17,2],[10,1],[10,1],[24,4],[11,1],[30,1],[30,2],[13,1],[13,1],[25,4],[32,0],[32,1],[34,0],[34,2],[35,1],[35,1],[35,1],[38,3],[38,3],[38,2],[43,0],[43,1],[46,1],[45,1],[45,2],[50,2],[48,1],[48,2],[52,2],[49,1],[49,2],[29,0],[29,2],[47,2],[57,2],[56,0],[56,2],[28,2],[58,0],[58,2],[55,2],[61,2],[60,0],[60,2],[54,2],[41,0],[41,1],[59,2],[62,2],[62,1],[62,2],[62,3],[62,1],[65,0],[65,1],[68,0],[68,1],[42,2],[42,1],[42,2],[42,3],[42,1],[63,2],[63,1],[63,2],[63,3],[63,1],[74,0],[74,1],[77,0],[77,1],[67,1],[67,1],[76,1],[76,1],[39,1],[39,1],[39,2],[66,3],[82,0],[82,2],[64,3],[75,2],[75,2],[75,2],[75,1],[86,0],[86,2],[89,1],[89,2],[73,2],[73,1],[93,0],[93,2],[94,1],[94,2],[92,1],[92,1],[92,1],[90,1],[90,1],[95,2],[95,1],[99,1],[99,1],[99,1],[91,2],[91,2],[106,1],[106,1],[106,1],[106,3],[105,1],[105,1],[105,1],[105,1],[107,1],[107,1],[72,3],[78,4],[122,1],[122,1],[122,1],[118,0],[118,2],[120,0],[120,1],[124,2],[128,1],[128,2],[126,1],[130,1],[130,1],[132,2],[134,2],[133,1],[133,2],[131,1],[131,1],[136,2],[139,0],[139,1],[139,1],[137,3],[143,2],[143,2],[142,1],[142,2],[138,2],[138,1],[147,2],[144,0],[144,1],[145,1],[145,1],[151,6],[152,0],[152,1],[150,6],[154,0],[154,1],[153,1],[153,1],[153,1],[153,1],[155,1],[88,3],[162,0],[162,2],[164,1],[164,1],[164,1],[164,2],[169,1],[169,2],[171,1],[171,2],[173,1],[173,2],[168,1],[168,1],[168,1],[165,2],[176,0],[176,2],[177,2],[175,0],[175,1],[170,3],[180,0],[180,1],[166,2],[183,0],[183,2],[184,2],[182,0],[182,1],[172,3],[167,2],[167,2],[188,0],[188,2],[187,2],[186,0],[186,1],[174,3],[146,2],[84,3],[191,1],[191,1],[83,1],[192,0],[192,2],[31,3],[194,1],[194,1],[181,1],[181,1],[181,1],[129,1],[129,1],[87,1],[33,1],[33,1],[149,1],[149,1],[197,1],[197,1],[197,1],[196,1],[196,2],[203,2],[202,0],[202,1],[198,1],[198,1],[110,1],[110,1],[110,1],[110,1],[201,1],[201,1],[201,1],[201,1],[22,1],[22,1],[214,1],[214,1],[200,1],[123,2],[218,1],[219,2],[222,2],[221,0],[221,2],[220,2],[225,2],[224,0],[224,2],[223,2],[226,2],[226,1],[226,2],[226,3],[226,1],[217,1],[217,1],[37,2],[228,1],[228,1]];
        this.table = [o($V0,[2,2],{3:1,4:2}),{1:[3]},o($V0,[2,3],{5:3}),o($V1,$V2,{6:4,8:5,14:6,15:7,16:8,17:9,9:10,10:14,11:15,24:16,25:17,30:18,32:20,31:21,7:[2,10],18:[1,11],20:[1,12],23:[1,13],26:[1,19],36:$V3,193:$V4}),{7:[1,24]},o($V0,[2,4]),{7:[2,11]},o($V0,$V5),o($V0,$V6),o($V0,$V7),o($V8,[2,7],{12:25}),{19:[1,26]},{21:[1,27]},{19:$V9,21:$Va,22:28,214:30,215:$Vb},o($V8,[2,5]),o($V8,[2,6]),o($V8,$Vc),o($V8,$Vd),o($V8,[2,21],{31:33,193:$V4}),{27:[1,34]},{19:$Ve,21:$Vf,22:36,33:35,200:37,214:39,215:$Vg,216:$Vh},o($V0,[2,22]),o($V1,[2,28]),{19:$Vi,21:$Vj,22:43,214:45,215:$Vk},{1:[2,1]},o($V1,$V2,{13:48,8:49,10:50,15:51,16:52,17:53,24:54,25:55,32:60,7:[2,9],18:[1,56],20:[1,57],23:[1,58],26:[1,59],36:$V3}),o($V0,$Vl),{19:$V9,21:$Va,22:61,214:30,215:$Vb},o($V0,$Vm),o($V0,$Vn),o($V0,$Vo),o($V0,$Vp),o($V0,$Vq),o($V0,[2,23]),o($Vr,$Vs,{28:62,54:63,41:64,44:$Vt}),o($Vu,$Vv,{34:66}),o($Vu,$Vw),o($Vu,$Vx),o($Vu,$Vn),o($Vu,$Vo),o($Vu,$Vy),o($Vu,$Vp),o($Vu,$Vq),{193:[1,69],194:67,195:[1,68]},o($Vz,$Vn),o($Vz,$Vo),o($Vz,$Vp),o($Vz,$Vq),o($V8,[2,8]),o($V8,[2,24]),o($V8,[2,25]),o($V8,$V5),o($V8,$V6),o($V8,$V7),o($V8,$Vc),o($V8,$Vd),{19:[1,70]},{21:[1,71]},{19:$VA,21:$VB,22:72,214:74,215:$VC},{27:[1,77]},{19:$Ve,21:$Vf,22:36,33:78,200:37,214:39,215:$Vg,216:$Vh},o($V0,$VD),o($VE,$VF,{29:79}),o($VG,$VH,{58:80}),o($VI,$VJ,{62:81,64:82,66:83,67:84,73:87,75:88,72:89,39:90,92:91,94:92,87:94,88:95,89:96,78:97,95:104,22:105,91:107,118:108,99:109,214:112,105:113,107:114,19:$VK,21:$VL,69:[1,85],71:[1,86],79:[1,98],80:[1,99],81:[1,100],85:$VM,96:$VN,97:$VO,98:$VP,101:$VQ,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:$V_,215:$V$}),o($Vr,$V01),o($V11,$Vs,{35:126,37:127,38:128,39:129,228:131,41:132,40:[1,130],44:[1,133],79:[1,134],80:[1,135],81:[1,136],179:$V21,229:$V31}),o($V0,$V41),o($V0,$V51),o($V0,$V61),o($V8,$Vl),{19:$VA,21:$VB,22:139,214:74,215:$VC},o($V8,$Vm),o($V8,$Vn),o($V8,$Vo),o($V8,$Vp),o($V8,$Vq),o($Vr,$Vs,{28:140,54:141,41:142,44:$Vt}),o($Vu,$Vv,{34:143}),o($V8,$V71,{50:144,51:$V81}),o($VE,$V91,{52:146,53:$Va1}),o($VG,$Vb1),o($VG,$Vc1,{65:148,67:149,72:150,39:151,78:152,118:156,79:$Vd1,80:$Ve1,81:$Vf1,119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:157,64:158,73:159,92:160,94:161,95:165,99:166,96:$Vi1,97:$Vj1,98:$Vk1,101:$Vl1,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{38:168,41:169,39:171,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:175}),o($Vt1,$Vs1,{82:176}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:177}),o($Vr1,$Vz1,{99:109,95:178,101:$VQ,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:179}),o($VA1,$VB1,{86:180}),o($VA1,$VB1,{86:181}),o($Vt1,$VC1,{105:113,107:114,91:182,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:183}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,187],21:[1,191],22:185,33:184,200:186,214:188,215:[1,190],216:[1,189]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:192}),o($VN1,$VO1),{119:[1,193],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},{100:[1,202]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,204],106:203,108:[1,205],109:[1,206],110:207,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,212]},{100:[2,120]},{100:[2,121]},{100:[2,122]},o($VA1,$Vp),o($VA1,$Vq),o($VY1,[2,129]),o($VY1,[2,130]),o($VY1,[2,131]),o($VY1,[2,132]),{100:[2,133]},{100:[2,134]},o($V8,$VZ1),o($Vu,[2,30]),o($V8,$V_1),o($V8,$V$1,{45:213,48:214,49:215,50:216,52:217,51:$V81,53:$Va1}),o($V8,$V02),o($VI,$VJ,{67:218,72:219,39:220,78:221,118:225,79:[1,222],80:[1,223],81:[1,224]}),o($VI,$VJ,{73:87,75:88,92:91,94:92,87:94,88:95,89:96,78:97,95:104,22:105,91:107,118:108,99:109,214:112,105:113,107:114,42:226,64:227,66:228,72:229,19:$VK,21:$VL,69:[1,230],71:[1,231],85:$VM,96:$VN,97:$VO,98:$VP,101:$VQ,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:$V_,215:$V$}),o($V11,$V01,{39:232,79:$Vd1,80:$Ve1,81:$Vf1}),o($VG,$VE1),o($VG,$VF1),{19:[1,236],21:[1,240],22:234,33:233,200:235,214:237,215:[1,239],216:[1,238]},o($V12,[2,285]),o($V12,[2,286]),o($V8,$VD),o($VE,$VF,{29:241}),o($VG,$VH,{58:242}),o($VI,$VJ,{62:243,64:244,66:245,67:246,73:249,75:250,72:251,39:252,92:253,94:254,87:256,88:257,89:258,78:259,95:266,22:267,91:269,118:270,99:271,214:274,105:275,107:276,19:$V22,21:$V32,69:[1,247],71:[1,248],79:[1,260],80:[1,261],81:[1,262],85:$V42,96:$V52,97:$V62,98:$V72,101:$V82,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:$V92,215:$Va2}),o($V11,$Vs,{37:127,228:131,35:279,38:280,39:281,41:283,40:[1,282],44:[1,284],79:[1,285],80:[1,286],81:[1,287],179:$V21,229:$V31}),o($VE,$Vb2),o($Vr,$Vs,{28:288,54:289,41:290,44:$Vt}),o($VG,$Vc2),o($Vr,$Vs,{54:291,41:292,44:$Vt}),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:293}),o($VG,$VE1),o($VG,$VF1),{19:[1,297],21:[1,301],22:295,33:294,200:296,214:298,215:[1,300],216:[1,299]},{119:[1,302],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:303}),o($Vh2,$Vy1,{93:304}),o($Vt1,$Vz1,{99:166,95:305,101:$Vl1,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,306]},o($Vh2,$VT1),{70:[1,307]},o($VI,$VJ,{42:308,64:309,66:310,72:311,73:314,75:315,78:316,92:317,94:318,87:320,88:321,89:322,118:323,95:327,22:328,91:330,99:331,214:334,105:335,107:336,19:[1,333],21:[1,338],69:[1,312],71:[1,313],85:[1,319],96:[1,324],97:[1,325],98:[1,326],101:$Vi2,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,329],215:[1,337]}),o($V11,$V01,{39:339,79:$Vj2,80:$Vk2,81:$Vl2}),{45:343,48:344,49:345,50:346,51:$Vm2,52:347,53:$Vn2},o($Vo2,$VE1),o($Vo2,$VF1),{19:[1,353],21:[1,357],22:351,33:350,200:352,214:354,215:[1,356],216:[1,355]},o($Vp2,$Vq2,{83:358,84:359,192:360,190:[1,361]}),o($Vr2,$Vq2,{83:362,84:363,192:364,190:$Vs2}),o($Vr1,$Vt2,{99:109,95:366,101:$VQ,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:367,95:368,91:369,99:370,105:372,107:373,101:$Vw2,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:367,95:368,91:369,99:370,105:372,107:373,101:$Vw2,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:367,95:368,91:369,99:370,105:372,107:373,101:$Vw2,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:374,84:375,192:376,190:[1,377]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,378],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VV2,$VW2,{120:410,126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,121:$VX2,148:$VY2,189:$VZ2}),o($VI,[2,141]),o($VI,[2,137]),o($VI,[2,138]),o($VI,[2,139]),o($Vr,$Vs,{218:423,219:424,220:425,223:426,41:427,44:$Vt}),{19:$V_2,21:$V$2,22:430,128:428,129:429,199:$V03,214:433,215:$V13},o($V23,[2,282]),o($V23,[2,283]),o($Vx1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),o($VN1,$V73),{111:[1,436]},{111:$V83},{111:$V93},{111:$Va3},{111:$Vb3},o($VN1,$Vc3),o($V8,$Vd3),o($V8,$Ve3,{50:437,51:$V81}),o($VE,$VF,{29:438,52:439,53:$Va1}),o($VE,$Vf3),o($VG,$Vg3),o($Vu,[2,284]),o($Vu,$Vv1),o($Vu,$Vw1),o($Vh3,$Vs1,{82:440}),o($Vu,$VE1),o($Vu,$VF1),{19:[1,444],21:[1,448],22:442,33:441,200:443,214:445,215:[1,447],216:[1,446]},{119:[1,449],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($V8,$Vi3,{48:214,49:215,50:216,52:217,43:450,45:451,51:$V81,53:$Va1}),o($VG,$Vc1,{67:149,72:150,39:151,78:152,118:156,65:452,79:$Vd1,80:$Ve1,81:$Vf1,119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($VG,$Vj3),o($VG,$Vh1,{64:158,73:159,92:160,94:161,95:165,99:166,68:453,96:$Vi1,97:$Vj1,98:$Vk1,101:$Vl1,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:454,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vk3),o($V8,$Vi3,{48:214,49:215,50:216,52:217,45:451,43:455,51:$V81,53:$Va1}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($V8,$V71,{50:456,51:$Vl3}),o($VE,$V91,{52:458,53:$Vm3}),o($VG,$Vb1),o($VG,$Vc1,{65:460,67:461,72:462,39:463,78:464,118:468,79:$Vn3,80:$Vo3,81:$Vp3,119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:469,64:470,73:471,92:472,94:473,95:477,99:478,96:$Vq3,97:$Vr3,98:$Vs3,101:$Vt3,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:480,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:481}),o($Vt1,$Vs1,{82:482}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:483}),o($Vr1,$Vz1,{99:271,95:484,101:$V82,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:485}),o($VA1,$VB1,{86:486}),o($VA1,$VB1,{86:487}),o($Vt1,$VC1,{105:275,107:276,91:488,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:489}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,493],21:[1,497],22:491,33:490,200:492,214:494,215:[1,496],216:[1,495]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:498}),o($VN1,$VO1),{119:[1,499],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},{100:[1,500]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,502],106:501,108:[1,503],109:[1,504],110:505,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,506]},o($VA1,$Vp),o($VA1,$Vq),o($V8,$VZ1),o($V8,$V_1),o($V8,$V$1,{45:507,48:508,49:509,50:510,52:511,51:$Vl3,53:$Vm3}),o($V8,$V02),o($VI,$VJ,{73:249,75:250,92:253,94:254,87:256,88:257,89:258,78:259,95:266,22:267,91:269,118:270,99:271,214:274,105:275,107:276,42:512,64:513,66:514,72:515,19:$V22,21:$V32,69:[1,516],71:[1,517],85:$V42,96:$V52,97:$V62,98:$V72,101:$V82,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:$V92,215:$Va2}),o($V11,$V01,{39:518,79:$Vn3,80:$Vo3,81:$Vp3}),o($VG,$VE1),o($VG,$VF1),{19:[1,522],21:[1,526],22:520,33:519,200:521,214:523,215:[1,525],216:[1,524]},o($VE,$Vu3),o($VG,$VH,{58:527}),o($VI,$VJ,{62:528,64:529,66:530,67:531,73:534,75:535,72:536,39:537,92:538,94:539,87:541,88:542,89:543,78:544,95:551,22:552,91:554,118:555,99:556,214:559,105:560,107:561,19:[1,558],21:[1,563],69:[1,532],71:[1,533],79:[1,545],80:[1,546],81:[1,547],85:[1,540],96:[1,548],97:[1,549],98:[1,550],101:$Vv3,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,553],215:[1,562]}),o($VG,$Vw3),o($VI,$VJ,{62:564,64:565,66:566,67:567,73:570,75:571,72:572,39:573,92:574,94:575,87:577,88:578,89:579,78:580,95:587,22:588,91:590,118:591,99:592,214:595,105:596,107:597,19:[1,594],21:[1,599],69:[1,568],71:[1,569],79:[1,581],80:[1,582],81:[1,583],85:[1,576],96:[1,584],97:[1,585],98:[1,586],101:$Vx3,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,589],215:[1,598]}),o($Vr2,$Vq2,{84:363,192:364,83:600,190:$Vs2}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:601,121:$VX2,148:$VY2,189:$VZ2}),o($Vr2,$Vq2,{84:363,192:364,83:602,190:$Vs2}),o($Vt1,$Vt2,{99:166,95:603,101:$Vl1,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V33),o($VG,$Vy3),{43:604,45:605,48:344,49:345,50:346,51:$Vm2,52:347,53:$Vn2,70:$Vi3},o($VI,$VJ,{65:606,67:607,72:608,39:609,78:610,118:611,51:$Vc1,53:$Vc1,70:$Vc1,79:$Vj2,80:$Vk2,81:$Vl2}),o($Vz3,$Vj3),o($Vz3,$Vh1,{68:612,64:613,73:614,92:615,94:616,95:620,99:621,96:[1,617],97:[1,618],98:[1,619],101:$VA3,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:623,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vz3,$Vk3),o($VB3,$Vs1,{82:624}),o($VC3,$Vs1,{82:625}),o($VD3,$Vs1,{82:626}),o($VE3,$Vy1,{93:627}),o($VB3,$Vz1,{99:331,95:628,101:$Vi2,102:$VR,103:$VS,104:$VT}),o($VF3,$VB1,{86:629}),o($VF3,$VB1,{86:630}),o($VF3,$VB1,{86:631}),o($VC3,$VC1,{105:335,107:336,91:632,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),{119:[1,633],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($VE3,$VG1),o($VE3,$VH1),o($VE3,$VI1),o($VE3,$VJ1),o($VF3,$VK1),o($VL1,$VM1,{162:634}),o($VG3,$VO1),{100:[1,635]},o($VE3,$VT1),o($VF3,$Vn),o($VF3,$Vo),{100:[1,637],106:636,108:[1,638],109:[1,639],110:640,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,641]},o($VF3,$Vp),o($VF3,$Vq),{43:642,45:605,48:344,49:345,50:346,51:$Vm2,52:347,53:$Vn2,70:$Vi3},o($Vz3,$VE1),o($Vz3,$VF1),{19:[1,646],21:[1,650],22:644,33:643,200:645,214:647,215:[1,649],216:[1,648]},{70:$Vd3},{50:651,51:$Vm2,70:$Ve3},o($VH3,$VF,{29:652,52:653,53:$Vn2}),o($VH3,$Vf3),o($Vz3,$Vg3),o($Vr,$Vs,{28:654,54:655,41:656,44:$Vt}),o($Vr,$Vs,{54:657,41:658,44:$Vt}),o($Vo2,$VB2),o($Vo2,$Vw),o($Vo2,$Vx),o($Vo2,$Vn),o($Vo2,$Vo),o($Vo2,$Vy),o($Vo2,$Vp),o($Vo2,$Vq),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:659,193:[1,660]}),{19:$VM3,21:$VN3,22:662,129:661,199:$VO3,214:665,215:$VP3},o($VG,$VQ3),o($Vt1,$VK3),o($VG,$VL3,{31:668,193:[1,669]}),{19:$VM3,21:$VN3,22:662,129:670,199:$VO3,214:665,215:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{100:[1,671]},o($VA1,$VT1),{100:[1,673],106:672,108:[1,674],109:[1,675],110:676,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,677]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:678,193:[1,679]}),{19:$VM3,21:$VN3,22:662,129:680,199:$VO3,214:665,215:$VP3},o($VA1,$VW3),o($VL1,[2,185]),o($VL1,[2,186]),o($VL1,[2,187]),o($VL1,[2,188]),{168:681,169:682,170:685,171:683,172:686,173:684,174:687,179:[1,688]},o($VL1,[2,203],{175:689,177:690,178:[1,691]}),o($VL1,[2,212],{182:692,184:693,178:[1,694]}),o($VL1,[2,220],{186:695,187:696,178:$VX3}),{178:$VX3,187:698},o($VY3,$Vn),o($VY3,$Vo),o($VY3,$VZ3),o($VY3,$V_3),o($VY3,$V$3),o($VY3,$Vp),o($VY3,$Vq),o($VY3,$V04),o($VY3,$V14,{202:699,203:700,111:[1,701]}),o($VY3,$V24),o($VY3,$V34),o($VY3,$V44),o($VY3,$V54),o($VY3,$V64),o($VY3,$V74),o($VY3,$V84),o($VY3,$V94),o($VY3,$Va4),o($Vb4,$V83),o($Vb4,$V93),o($Vb4,$Va3),o($Vb4,$Vb3),{121:[1,702]},{121:[2,143]},{121:$Vc4},{121:$Vd4,133:703,134:704,135:$Ve4},{121:$Vf4},o($Vg4,$Vh4),o($Vg4,$Vi4),o($Vg4,$Vj4,{139:706,142:707,143:710,140:$Vk4,141:$Vl4}),o($Vm4,$Vn4,{145:711,150:712,151:713,154:714,155:716,69:[1,715],160:$Vo4}),o($Vp4,$Vq4),o($VV2,[2,169]),{19:[1,721],21:[1,725],22:719,149:718,200:720,214:722,215:[1,724],216:[1,723]},{19:[1,729],21:[1,733],22:727,149:726,200:728,214:730,215:[1,732],216:[1,731]},o($VI,[2,266]),o($VI,[2,267]),o($Vr4,[2,270],{221:734}),o($Vs4,$Vt4,{224:735}),o($VI,$VJ,{226:736,73:737,75:738,76:739,92:742,94:743,87:745,88:746,89:747,78:748,39:749,95:753,22:754,91:756,118:757,99:761,214:764,105:765,107:766,19:[1,763],21:[1,768],69:[1,740],71:[1,741],79:[1,758],80:[1,759],81:[1,760],85:[1,744],96:$Vu4,97:$Vv4,98:$Vw4,101:$Vx4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,755],215:[1,767]}),o($VI,[2,144],{22:430,214:433,129:769,19:$V_2,21:$V$2,199:$V03,215:$V13}),o($Vy4,[2,145]),o($Vy4,$Vz4),o($Vy4,$VA4),o($Vy4,$Vn),o($Vy4,$Vo),o($Vy4,$Vp),o($Vy4,$Vq),{19:[1,772],21:[1,775],22:771,87:770,214:773,215:[1,774]},o($VE,$VB4),o($V8,$VC4,{50:144,51:$V81}),o($VG,$VD4),o($VE4,$Vq2,{83:776,84:777,192:778,190:[1,779]}),o($Vu,$VB2),o($Vu,$Vw),o($Vu,$Vx),o($Vu,$Vn),o($Vu,$Vo),o($Vu,$Vy),o($Vu,$Vp),o($Vu,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:780,121:$VX2,148:$VY2,189:$VZ2}),o($V8,$VF4),o($V8,$VG4),o($VG,$VH4),o($VG,$VI4),{70:[1,781]},o($V8,$VJ4),o($VE,$Vb2),o($Vr,$Vs,{28:782,54:783,41:784,44:$Vt}),o($VG,$Vc2),o($Vr,$Vs,{54:785,41:786,44:$Vt}),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:787}),o($VG,$VE1),o($VG,$VF1),{19:[1,791],21:[1,795],22:789,33:788,200:790,214:792,215:[1,794],216:[1,793]},{119:[1,796],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:797}),o($Vh2,$Vy1,{93:798}),o($Vt1,$Vz1,{99:478,95:799,101:$Vt3,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,800]},o($Vh2,$VT1),{70:[1,801]},o($Vp2,$Vq2,{83:802,84:803,192:804,190:[1,805]}),o($Vr2,$Vq2,{83:806,84:807,192:808,190:$VK4}),o($Vr1,$Vt2,{99:271,95:810,101:$V82,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:811,95:812,91:813,99:814,105:816,107:817,101:$VL4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:811,95:812,91:813,99:814,105:816,107:817,101:$VL4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:811,95:812,91:813,99:814,105:816,107:817,101:$VL4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:818,84:819,192:820,190:[1,821]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,822],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:823,121:$VX2,148:$VY2,189:$VZ2}),o($Vx1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),o($VN1,$V73),{111:[1,824]},o($VN1,$Vc3),o($V8,$Vd3),o($V8,$Ve3,{50:825,51:$Vl3}),o($VE,$VF,{29:826,52:827,53:$Vm3}),o($VE,$Vf3),o($VG,$Vg3),o($V8,$Vi3,{48:508,49:509,50:510,52:511,43:828,45:829,51:$Vl3,53:$Vm3}),o($VG,$Vc1,{67:461,72:462,39:463,78:464,118:468,65:830,79:$Vn3,80:$Vo3,81:$Vp3,119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($VG,$Vj3),o($VG,$Vh1,{64:470,73:471,92:472,94:473,95:477,99:478,68:831,96:$Vq3,97:$Vr3,98:$Vs3,101:$Vt3,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:832,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vk3),o($V8,$Vi3,{48:508,49:509,50:510,52:511,45:829,43:833,51:$Vl3,53:$Vm3}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VE,$V91,{52:834,53:[1,835]}),o($VG,$Vb1),o($VG,$Vc1,{65:836,67:837,72:838,39:839,78:840,118:844,79:[1,841],80:[1,842],81:[1,843],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:845,64:846,73:847,92:848,94:849,95:853,99:854,96:[1,850],97:[1,851],98:[1,852],101:$VM4,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:856,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:857}),o($Vt1,$Vs1,{82:858}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:859}),o($Vr1,$Vz1,{99:556,95:860,101:$Vv3,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:861}),o($VA1,$VB1,{86:862}),o($VA1,$VB1,{86:863}),o($Vt1,$VC1,{105:560,107:561,91:864,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:865}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,869],21:[1,873],22:867,33:866,200:868,214:870,215:[1,872],216:[1,871]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:874}),o($VN1,$VO1),{119:[1,875],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},{100:[1,876]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,878],106:877,108:[1,879],109:[1,880],110:881,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,882]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$Vb1),o($VG,$Vc1,{65:883,67:884,72:885,39:886,78:887,118:891,79:[1,888],80:[1,889],81:[1,890],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:892,64:893,73:894,92:895,94:896,95:900,99:901,96:[1,897],97:[1,898],98:[1,899],101:$VN4,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:903,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:904}),o($Vt1,$Vs1,{82:905}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:906}),o($Vr1,$Vz1,{99:592,95:907,101:$Vx3,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:908}),o($VA1,$VB1,{86:909}),o($VA1,$VB1,{86:910}),o($Vt1,$VC1,{105:596,107:597,91:911,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:912}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,916],21:[1,920],22:914,33:913,200:915,214:917,215:[1,919],216:[1,918]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:921}),o($VN1,$VO1),{119:[1,922],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},{100:[1,923]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,925],106:924,108:[1,926],109:[1,927],110:928,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,929]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$VV3),{121:[1,930]},o($VG,$VJ3),o($Vh2,$VR3),{70:$VF4},{70:$VG4},o($Vz3,$VH4),o($Vz3,$Ve2),o($Vz3,$Vv1),o($Vz3,$Vw1),o($VC3,$Vs1,{82:931}),{119:[1,932],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($Vz3,$VI4),o($Vz3,$Vg2),o($VC3,$Vs1,{82:933}),o($VO4,$Vy1,{93:934}),o($VC3,$Vz1,{99:621,95:935,101:$VA3,102:$VR,103:$VS,104:$VT}),o($VO4,$VG1),o($VO4,$VH1),o($VO4,$VI1),o($VO4,$VJ1),{100:[1,936]},o($VO4,$VT1),{70:[1,937]},o($VP4,$Vq2,{83:938,84:939,192:940,190:[1,941]}),o($VQ4,$Vq2,{83:942,84:943,192:944,190:$VR4}),o($VS4,$Vq2,{83:946,84:947,192:948,190:[1,949]}),o($VB3,$Vt2,{99:331,95:950,101:$Vi2,102:$VR,103:$VS,104:$VT}),o($VE3,$Vu2),o($VC3,$Vv2,{90:951,95:952,91:953,99:954,105:956,107:957,101:$VT4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VC3,$Vx2,{90:951,95:952,91:953,99:954,105:956,107:957,101:$VT4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VC3,$Vy2,{90:951,95:952,91:953,99:954,105:956,107:957,101:$VT4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VG3,$Vz2),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:958,121:$VX2,148:$VY2,189:$VZ2}),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,959],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VE3,$V33),o($VG3,$V43),o($VG3,$V53),o($VG3,$V63),o($VG3,$V73),{111:[1,960]},o($VG3,$Vc3),{70:$VJ4},o($Vz3,$VB2),o($Vz3,$Vw),o($Vz3,$Vx),o($Vz3,$Vn),o($Vz3,$Vo),o($Vz3,$Vy),o($Vz3,$Vp),o($Vz3,$Vq),o($VH3,$VB4),{50:961,51:$Vm2,70:$VC4},o($Vz3,$VD4),o($VH3,$Vu3),o($Vz3,$VH,{58:962}),o($VI,$VJ,{62:963,64:964,66:965,67:966,73:969,75:970,72:971,39:972,92:973,94:974,87:976,88:977,89:978,78:979,95:986,22:987,91:989,118:990,99:991,214:994,105:995,107:996,19:[1,993],21:[1,998],69:[1,967],71:[1,968],79:[1,980],80:[1,981],81:[1,982],85:[1,975],96:[1,983],97:[1,984],98:[1,985],101:$VU4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,988],215:[1,997]}),o($Vz3,$Vw3),o($VI,$VJ,{62:999,64:1000,66:1001,67:1002,73:1005,75:1006,72:1007,39:1008,92:1009,94:1010,87:1012,88:1013,89:1014,78:1015,95:1022,22:1023,91:1025,118:1026,99:1027,214:1030,105:1031,107:1032,19:[1,1029],21:[1,1034],69:[1,1003],71:[1,1004],79:[1,1016],80:[1,1017],81:[1,1018],85:[1,1011],96:[1,1019],97:[1,1020],98:[1,1021],101:$VV4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,1024],215:[1,1033]}),o($Vp2,$VW4),{19:$Vi,21:$Vj,22:1035,214:45,215:$Vk},{19:$VX4,21:$VY4,22:1037,100:[1,1048],108:[1,1049],109:[1,1050],110:1047,181:1038,191:1036,196:1041,197:1042,198:1043,201:1046,204:[1,1051],205:[1,1052],206:[1,1057],207:[1,1058],208:[1,1059],209:[1,1060],210:[1,1053],211:[1,1054],212:[1,1055],213:[1,1056],214:1040,215:$VZ4},o($V_4,$Vz4),o($V_4,$VA4),o($V_4,$Vn),o($V_4,$Vo),o($V_4,$Vp),o($V_4,$Vq),o($Vr2,$VW4),{19:$Vi,21:$Vj,22:1061,214:45,215:$Vk},{19:$V$4,21:$V05,22:1063,100:[1,1074],108:[1,1075],109:[1,1076],110:1073,181:1064,191:1062,196:1067,197:1068,198:1069,201:1072,204:[1,1077],205:[1,1078],206:[1,1083],207:[1,1084],208:[1,1085],209:[1,1086],210:[1,1079],211:[1,1080],212:[1,1081],213:[1,1082],214:1066,215:$V15},o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),o($VA1,$V73),{111:[1,1087]},o($VA1,$Vc3),o($VA2,$VW4),{19:$Vi,21:$Vj,22:1088,214:45,215:$Vk},{19:$V25,21:$V35,22:1090,100:[1,1101],108:[1,1102],109:[1,1103],110:1100,181:1091,191:1089,196:1094,197:1095,198:1096,201:1099,204:[1,1104],205:[1,1105],206:[1,1110],207:[1,1111],208:[1,1112],209:[1,1113],210:[1,1106],211:[1,1107],212:[1,1108],213:[1,1109],214:1093,215:$V45},o($VL1,[2,189]),o($VL1,[2,196],{170:1114,179:$V55}),o($VL1,[2,197],{172:1116,179:$V65}),o($VL1,[2,198],{174:1118,179:$V75}),o($V85,[2,190]),o($V85,[2,192]),o($V85,[2,194]),{19:$V95,21:$Va5,22:1120,100:$Vb5,108:$Vc5,109:$Vd5,110:1131,181:1121,185:$Ve5,196:1125,197:1126,198:1127,201:1130,204:$Vf5,205:$Vg5,206:$Vh5,207:$Vi5,208:$Vj5,209:$Vk5,210:$Vl5,211:$Vm5,212:$Vn5,213:$Vo5,214:1124,215:$Vp5},o($VL1,[2,199]),o($VL1,[2,204]),o($V85,[2,200],{176:1145}),o($VL1,[2,208]),o($VL1,[2,213]),o($V85,[2,209],{183:1146}),o($VL1,[2,215]),o($VL1,[2,221]),o($V85,[2,217],{188:1147}),o($VL1,[2,216]),o($VY3,$Vq5),o($VY3,$Vr5),{19:$VC2,21:$VD2,22:1149,87:1148,214:389,215:$VU2},o($VD1,$Vs5),{121:$Vt5,134:1150,135:$Ve4},o($Vg4,$Vu5),o($VV2,$VW2,{136:415,137:416,138:417,144:418,146:419,147:420,131:1151,148:$VY2,189:$VZ2}),o($Vg4,$Vv5),o($Vg4,$Vj4,{139:1152,143:1153,140:$Vk4,141:$Vl4}),o($VV2,$VW2,{144:418,146:419,147:420,138:1154,121:$Vw5,135:$Vw5,148:$VY2,189:$VZ2}),o($VV2,$VW2,{144:418,146:419,147:420,138:1155,121:$Vx5,135:$Vx5,148:$VY2,189:$VZ2}),o($Vp4,$Vy5),o($Vp4,$Vz5),o($Vp4,$VA5),o($Vp4,$VB5),{19:$VC5,21:$VD5,22:1157,129:1156,199:$VE5,214:1160,215:$VF5},o($VV2,$VW2,{147:420,126:1163,130:1164,131:1165,132:1166,136:1167,137:1168,138:1169,144:1170,146:1171,148:$VY2,189:$VG5}),o($Vm4,[2,177]),o($Vm4,[2,182]),o($Vp4,$VH5),o($Vp4,$VI5),o($Vp4,$VJ5),o($Vp4,$Vn),o($Vp4,$Vo),o($Vp4,$Vy),o($Vp4,$Vp),o($Vp4,$Vq),o($VV2,[2,167]),o($VV2,$VI5),o($VV2,$VJ5),o($VV2,$Vn),o($VV2,$Vo),o($VV2,$Vy),o($VV2,$Vp),o($VV2,$Vq),o($VI,[2,268],{222:1173,51:[1,1174]}),o($Vr4,$VK5,{225:1175,53:[1,1176]}),o($Vs4,$VL5),o($VI,$VJ,{76:1177,78:1178,39:1179,118:1180,79:[1,1181],80:[1,1182],81:[1,1183]}),o($Vs4,$VM5),o($Vs4,$VN5,{77:1184,73:1185,92:1186,94:1187,95:1191,99:1192,96:[1,1188],97:[1,1189],98:[1,1190],101:$VO5,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:1194,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vs4,$VP5),o($VQ5,$Vy1,{93:1195}),o($V12,$Vz1,{99:761,95:1196,101:$Vx4,102:$VR,103:$VS,104:$VT}),o($VR5,$VB1,{86:1197}),o($VR5,$VB1,{86:1198}),o($VR5,$VB1,{86:1199}),o($Vs4,$VC1,{105:765,107:766,91:1200,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VS5,$VT5),o($VS5,$VU5),o($VQ5,$VG1),o($VQ5,$VH1),o($VQ5,$VI1),o($VQ5,$VJ1),o($VR5,$VK1),o($VL1,$VM1,{162:1201}),o($VV5,$VO1),{119:[1,1202],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($VS5,$VE1),o($VS5,$VF1),{19:[1,1206],21:[1,1210],22:1204,33:1203,200:1205,214:1207,215:[1,1209],216:[1,1208]},{100:[1,1211]},o($VQ5,$VT1),o($VR5,$Vn),o($VR5,$Vo),{100:[1,1213],106:1212,108:[1,1214],109:[1,1215],110:1216,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1217]},o($VR5,$Vp),o($VR5,$Vq),o($Vy4,[2,146]),o($VN1,$VW5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($Vu,$VV3),o($Vh3,$VK3),o($Vu,$VL3,{31:1218,193:[1,1219]}),{19:$VM3,21:$VN3,22:662,129:1220,199:$VO3,214:665,215:$VP3},{121:[1,1221]},o($VG,$VX5),o($VE,$Vu3),o($VG,$VH,{58:1222}),o($VI,$VJ,{62:1223,64:1224,66:1225,67:1226,73:1229,75:1230,72:1231,39:1232,92:1233,94:1234,87:1236,88:1237,89:1238,78:1239,95:1246,22:1247,91:1249,118:1250,99:1251,214:1254,105:1255,107:1256,19:[1,1253],21:[1,1258],69:[1,1227],71:[1,1228],79:[1,1240],80:[1,1241],81:[1,1242],85:[1,1235],96:[1,1243],97:[1,1244],98:[1,1245],101:$VY5,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,1248],215:[1,1257]}),o($VG,$Vw3),o($VI,$VJ,{62:1259,64:1260,66:1261,67:1262,73:1265,75:1266,72:1267,39:1268,92:1269,94:1270,87:1272,88:1273,89:1274,78:1275,95:1282,22:1283,91:1285,118:1286,99:1287,214:1290,105:1291,107:1292,19:[1,1289],21:[1,1294],69:[1,1263],71:[1,1264],79:[1,1276],80:[1,1277],81:[1,1278],85:[1,1271],96:[1,1279],97:[1,1280],98:[1,1281],101:$VZ5,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,1284],215:[1,1293]}),o($Vr2,$Vq2,{84:807,192:808,83:1295,190:$VK4}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:1296,121:$VX2,148:$VY2,189:$VZ2}),o($Vr2,$Vq2,{84:807,192:808,83:1297,190:$VK4}),o($Vt1,$Vt2,{99:478,95:1298,101:$Vt3,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V33),o($VG,$Vy3),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:1299,193:[1,1300]}),{19:$VM3,21:$VN3,22:662,129:1301,199:$VO3,214:665,215:$VP3},o($VG,$VQ3),o($Vt1,$VK3),o($VG,$VL3,{31:1302,193:[1,1303]}),{19:$VM3,21:$VN3,22:662,129:1304,199:$VO3,214:665,215:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{100:[1,1305]},o($VA1,$VT1),{100:[1,1307],106:1306,108:[1,1308],109:[1,1309],110:1310,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1311]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:1312,193:[1,1313]}),{19:$VM3,21:$VN3,22:662,129:1314,199:$VO3,214:665,215:$VP3},o($VA1,$VW3),{121:[1,1315]},{19:[1,1318],21:[1,1321],22:1317,87:1316,214:1319,215:[1,1320]},o($VE,$VB4),o($V8,$VC4,{50:456,51:$Vl3}),o($VG,$VD4),o($V8,$VF4),o($V8,$VG4),o($VG,$VH4),o($VG,$VI4),{70:[1,1322]},o($V8,$VJ4),o($VG,$Vc2),o($Vr,$Vs,{54:1323,41:1324,44:$Vt}),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:1325}),o($VG,$VE1),o($VG,$VF1),{19:[1,1329],21:[1,1333],22:1327,33:1326,200:1328,214:1330,215:[1,1332],216:[1,1331]},{119:[1,1334],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:1335}),o($Vh2,$Vy1,{93:1336}),o($Vt1,$Vz1,{99:854,95:1337,101:$VM4,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,1338]},o($Vh2,$VT1),{70:[1,1339]},o($Vp2,$Vq2,{83:1340,84:1341,192:1342,190:[1,1343]}),o($Vr2,$Vq2,{83:1344,84:1345,192:1346,190:$V_5}),o($Vr1,$Vt2,{99:556,95:1348,101:$Vv3,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:1349,95:1350,91:1351,99:1352,105:1354,107:1355,101:$V$5,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:1349,95:1350,91:1351,99:1352,105:1354,107:1355,101:$V$5,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:1349,95:1350,91:1351,99:1352,105:1354,107:1355,101:$V$5,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:1356,84:1357,192:1358,190:[1,1359]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,1360],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:1361,121:$VX2,148:$VY2,189:$VZ2}),o($Vx1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),o($VN1,$V73),{111:[1,1362]},o($VN1,$Vc3),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:1363}),o($VG,$VE1),o($VG,$VF1),{19:[1,1367],21:[1,1371],22:1365,33:1364,200:1366,214:1368,215:[1,1370],216:[1,1369]},{119:[1,1372],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:1373}),o($Vh2,$Vy1,{93:1374}),o($Vt1,$Vz1,{99:901,95:1375,101:$VN4,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,1376]},o($Vh2,$VT1),{70:[1,1377]},o($Vp2,$Vq2,{83:1378,84:1379,192:1380,190:[1,1381]}),o($Vr2,$Vq2,{83:1382,84:1383,192:1384,190:$V06}),o($Vr1,$Vt2,{99:592,95:1386,101:$Vx3,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:1387,95:1388,91:1389,99:1390,105:1392,107:1393,101:$V16,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:1387,95:1388,91:1389,99:1390,105:1392,107:1393,101:$V16,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:1387,95:1388,91:1389,99:1390,105:1392,107:1393,101:$V16,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:1394,84:1395,192:1396,190:[1,1397]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,1398],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:1399,121:$VX2,148:$VY2,189:$VZ2}),o($Vx1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),o($VN1,$V73),{111:[1,1400]},o($VN1,$Vc3),o($Vt1,$Vs5),o($VQ4,$Vq2,{84:943,192:944,83:1401,190:$VR4}),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:1402,121:$VX2,148:$VY2,189:$VZ2}),o($VQ4,$Vq2,{84:943,192:944,83:1403,190:$VR4}),o($VC3,$Vt2,{99:621,95:1404,101:$VA3,102:$VR,103:$VS,104:$VT}),o($VO4,$Vu2),o($VO4,$V33),o($Vz3,$VX5),o($V26,$VJ3),o($VB3,$VK3),o($V26,$VL3,{31:1405,193:[1,1406]}),{19:$VM3,21:$VN3,22:662,129:1407,199:$VO3,214:665,215:$VP3},o($Vz3,$VQ3),o($VC3,$VK3),o($Vz3,$VL3,{31:1408,193:[1,1409]}),{19:$VM3,21:$VN3,22:662,129:1410,199:$VO3,214:665,215:$VP3},o($V36,$VV3),o($VD3,$VK3),o($V36,$VL3,{31:1411,193:[1,1412]}),{19:$VM3,21:$VN3,22:662,129:1413,199:$VO3,214:665,215:$VP3},o($VE3,$VR3),o($VF3,$VS3),o($VF3,$VT3),o($VF3,$VU3),{100:[1,1414]},o($VF3,$VT1),{100:[1,1416],106:1415,108:[1,1417],109:[1,1418],110:1419,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1420]},{121:[1,1421]},o($VF3,$VW3),{19:[1,1424],21:[1,1427],22:1423,87:1422,214:1425,215:[1,1426]},o($VH3,$Vb2),o($VH3,$V91,{52:1428,53:[1,1429]}),o($Vz3,$Vb1),o($VI,$VJ,{65:1430,67:1431,72:1432,39:1433,78:1434,118:1438,51:$Vc1,53:$Vc1,70:$Vc1,79:[1,1435],80:[1,1436],81:[1,1437]}),o($Vz3,$Vg1),o($Vz3,$Vh1,{68:1439,64:1440,73:1441,92:1442,94:1443,95:1447,99:1448,96:[1,1444],97:[1,1445],98:[1,1446],101:$V46,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:1450,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vz3,$Vq1),o($VB3,$Vs1,{82:1451}),o($VC3,$Vs1,{82:1452}),o($V36,$Vv1),o($V36,$Vw1),o($VE3,$Vy1,{93:1453}),o($VB3,$Vz1,{99:991,95:1454,101:$VU4,102:$VR,103:$VS,104:$VT}),o($VF3,$VB1,{86:1455}),o($VF3,$VB1,{86:1456}),o($VF3,$VB1,{86:1457}),o($VC3,$VC1,{105:995,107:996,91:1458,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD3,$Vs1,{82:1459}),o($V36,$VE1),o($V36,$VF1),{19:[1,1463],21:[1,1467],22:1461,33:1460,200:1462,214:1464,215:[1,1466],216:[1,1465]},o($VE3,$VG1),o($VE3,$VH1),o($VE3,$VI1),o($VE3,$VJ1),o($VF3,$VK1),o($VL1,$VM1,{162:1468}),o($VG3,$VO1),{119:[1,1469],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},{100:[1,1470]},o($VE3,$VT1),o($VF3,$Vn),o($VF3,$Vo),{100:[1,1472],106:1471,108:[1,1473],109:[1,1474],110:1475,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1476]},o($VF3,$Vp),o($VF3,$Vq),o($Vz3,$Vb1),o($VI,$VJ,{65:1477,67:1478,72:1479,39:1480,78:1481,118:1485,51:$Vc1,53:$Vc1,70:$Vc1,79:[1,1482],80:[1,1483],81:[1,1484]}),o($Vz3,$Vg1),o($Vz3,$Vh1,{68:1486,64:1487,73:1488,92:1489,94:1490,95:1494,99:1495,96:[1,1491],97:[1,1492],98:[1,1493],101:$V56,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:1497,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vz3,$Vq1),o($VB3,$Vs1,{82:1498}),o($VC3,$Vs1,{82:1499}),o($V36,$Vv1),o($V36,$Vw1),o($VE3,$Vy1,{93:1500}),o($VB3,$Vz1,{99:1027,95:1501,101:$VV4,102:$VR,103:$VS,104:$VT}),o($VF3,$VB1,{86:1502}),o($VF3,$VB1,{86:1503}),o($VF3,$VB1,{86:1504}),o($VC3,$VC1,{105:1031,107:1032,91:1505,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD3,$Vs1,{82:1506}),o($V36,$VE1),o($V36,$VF1),{19:[1,1510],21:[1,1514],22:1508,33:1507,200:1509,214:1511,215:[1,1513],216:[1,1512]},o($VE3,$VG1),o($VE3,$VH1),o($VE3,$VI1),o($VE3,$VJ1),o($VF3,$VK1),o($VL1,$VM1,{162:1515}),o($VG3,$VO1),{119:[1,1516],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},{100:[1,1517]},o($VE3,$VT1),o($VF3,$Vn),o($VF3,$Vo),{100:[1,1519],106:1518,108:[1,1520],109:[1,1521],110:1522,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1523]},o($VF3,$Vp),o($VF3,$Vq),{193:[1,1526],194:1524,195:[1,1525]},o($Vr1,$V66),o($Vr1,$V76),o($Vr1,$V86),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V04),o($Vr1,$V14,{202:1527,203:1528,111:[1,1529]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($V96,$V83),o($V96,$V93),o($V96,$Va3),o($V96,$Vb3),{193:[1,1532],194:1530,195:[1,1531]},o($Vt1,$V66),o($Vt1,$V76),o($Vt1,$V86),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V04),o($Vt1,$V14,{202:1533,203:1534,111:[1,1535]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($Va6,$Vb3),{19:[1,1538],21:[1,1541],22:1537,87:1536,214:1539,215:[1,1540]},{193:[1,1544],194:1542,195:[1,1543]},o($VD1,$V66),o($VD1,$V76),o($VD1,$V86),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V04),o($VD1,$V14,{202:1545,203:1546,111:[1,1547]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vb6,$V83),o($Vb6,$V93),o($Vb6,$Va3),o($Vb6,$Vb3),o($V85,[2,191]),{19:$V95,21:$Va5,22:1120,214:1124,215:$Vp5},o($V85,[2,193]),{100:$Vb5,108:$Vc5,109:$Vd5,110:1131,181:1121,196:1125,197:1126,198:1127,201:1130,204:$Vf5,205:$Vg5,206:$Vh5,207:$Vi5,208:$Vj5,209:$Vk5,210:$Vl5,211:$Vm5,212:$Vn5,213:$Vo5},o($V85,[2,195]),{185:$Ve5},o($V85,$Vc6,{180:1548,178:$Vd6}),o($V85,$Vc6,{180:1550,178:$Vd6}),o($V85,$Vc6,{180:1551,178:$Vd6}),o($Ve6,$Vn),o($Ve6,$Vo),o($Ve6,$VZ3),o($Ve6,$V_3),o($Ve6,$V$3),o($Ve6,$Vp),o($Ve6,$Vq),o($Ve6,$V04),o($Ve6,$V14,{202:1552,203:1553,111:[1,1554]}),o($Ve6,$V24),o($Ve6,$V34),o($Ve6,$V44),o($Ve6,$V54),o($Ve6,$V64),o($Ve6,$V74),o($Ve6,$V84),o($Ve6,$V94),o($Ve6,$Va4),o($Vf6,$V83),o($Vf6,$V93),o($Vf6,$Va3),o($Vf6,$Vb3),o($VL1,[2,202],{170:1555,179:$V55}),o($VL1,[2,211],{172:1556,179:$V65}),o($VL1,[2,219],{174:1557,179:$V75}),o($VY3,$Vg6),o($VY3,$VK1),o($Vg4,$Vh6),o($Vg4,$Vi6),o($Vg4,$Vj6),o($Vp4,$Vk6),o($Vp4,$Vl6),o($Vp4,$Vm6),o($Vr,$Vs,{46:1558,47:1559,55:1560,59:1561,41:1562,44:$Vt}),o($V23,$Vz4),o($V23,$VA4),o($V23,$Vn),o($V23,$Vo),o($V23,$Vp),o($V23,$Vq),{70:[1,1563]},{70:$Vc4},{70:$Vd4,133:1564,134:1565,135:$Vn6},{70:$Vf4},o($Vo6,$Vh4),o($Vo6,$Vi4),o($Vo6,$Vj4,{139:1567,142:1568,143:1571,140:$Vp6,141:$Vq6}),o($Vm4,$Vn4,{155:716,145:1572,150:1573,151:1574,154:1575,69:[1,1576],160:$Vo4}),o($Vr6,$Vq4),{19:[1,1580],21:[1,1584],22:1578,149:1577,200:1579,214:1581,215:[1,1583],216:[1,1582]},o($Vr4,[2,271]),o($Vr,$Vs,{220:1585,223:1586,41:1587,44:$Vt}),o($Vs4,$Vs6),o($Vr,$Vs,{223:1588,41:1589,44:$Vt}),o($Vs4,$Vt6),o($Vs4,$VT5),o($Vs4,$VU5),{119:[1,1590],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($Vs4,$VE1),o($Vs4,$VF1),{19:[1,1594],21:[1,1598],22:1592,33:1591,200:1593,214:1595,215:[1,1597],216:[1,1596]},o($Vs4,$Vu6),o($Vs4,$Vv6),o($Vw6,$Vy1,{93:1599}),o($Vs4,$Vz1,{99:1192,95:1600,101:$VO5,102:$VR,103:$VS,104:$VT}),o($Vw6,$VG1),o($Vw6,$VH1),o($Vw6,$VI1),o($Vw6,$VJ1),{100:[1,1601]},o($Vw6,$VT1),{70:[1,1602]},o($V12,$Vt2,{99:761,95:1603,101:$Vx4,102:$VR,103:$VS,104:$VT}),o($VQ5,$Vu2),o($Vs4,$Vv2,{90:1604,95:1605,91:1606,99:1607,105:1609,107:1610,101:$Vx6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vs4,$Vx2,{90:1604,95:1605,91:1606,99:1607,105:1609,107:1610,101:$Vx6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vs4,$Vy2,{90:1604,95:1605,91:1606,99:1607,105:1609,107:1610,101:$Vx6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VV5,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,1611],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:1612,121:$VX2,148:$VY2,189:$VZ2}),o($VS5,$VB2),o($VS5,$Vw),o($VS5,$Vx),o($VS5,$Vn),o($VS5,$Vo),o($VS5,$Vy),o($VS5,$Vp),o($VS5,$Vq),o($VQ5,$V33),o($VV5,$V43),o($VV5,$V53),o($VV5,$V63),o($VV5,$V73),{111:[1,1613]},o($VV5,$Vc3),o($VE4,$VW4),{19:$Vi,21:$Vj,22:1614,214:45,215:$Vk},{19:$Vy6,21:$Vz6,22:1616,100:[1,1627],108:[1,1628],109:[1,1629],110:1626,181:1617,191:1615,196:1620,197:1621,198:1622,201:1625,204:[1,1630],205:[1,1631],206:[1,1636],207:[1,1637],208:[1,1638],209:[1,1639],210:[1,1632],211:[1,1633],212:[1,1634],213:[1,1635],214:1619,215:$VA6},o($Vh3,$Vs5),o($VE,$V91,{52:1640,53:[1,1641]}),o($VG,$Vb1),o($VG,$Vc1,{65:1642,67:1643,72:1644,39:1645,78:1646,118:1650,79:[1,1647],80:[1,1648],81:[1,1649],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:1651,64:1652,73:1653,92:1654,94:1655,95:1659,99:1660,96:[1,1656],97:[1,1657],98:[1,1658],101:$VB6,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:1662,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:1663}),o($Vt1,$Vs1,{82:1664}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:1665}),o($Vr1,$Vz1,{99:1251,95:1666,101:$VY5,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:1667}),o($VA1,$VB1,{86:1668}),o($VA1,$VB1,{86:1669}),o($Vt1,$VC1,{105:1255,107:1256,91:1670,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:1671}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,1675],21:[1,1679],22:1673,33:1672,200:1674,214:1676,215:[1,1678],216:[1,1677]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:1680}),o($VN1,$VO1),{119:[1,1681],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},{100:[1,1682]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,1684],106:1683,108:[1,1685],109:[1,1686],110:1687,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1688]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$Vb1),o($VG,$Vc1,{65:1689,67:1690,72:1691,39:1692,78:1693,118:1697,79:[1,1694],80:[1,1695],81:[1,1696],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:1698,64:1699,73:1700,92:1701,94:1702,95:1706,99:1707,96:[1,1703],97:[1,1704],98:[1,1705],101:$VC6,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:1709,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:1710}),o($Vt1,$Vs1,{82:1711}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:1712}),o($Vr1,$Vz1,{99:1287,95:1713,101:$VZ5,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:1714}),o($VA1,$VB1,{86:1715}),o($VA1,$VB1,{86:1716}),o($Vt1,$VC1,{105:1291,107:1292,91:1717,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:1718}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,1722],21:[1,1726],22:1720,33:1719,200:1721,214:1723,215:[1,1725],216:[1,1724]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:1727}),o($VN1,$VO1),{119:[1,1728],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},{100:[1,1729]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,1731],106:1730,108:[1,1732],109:[1,1733],110:1734,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1735]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$VV3),{121:[1,1736]},o($VG,$VJ3),o($Vh2,$VR3),o($Vp2,$VW4),{19:$Vi,21:$Vj,22:1737,214:45,215:$Vk},{19:$VD6,21:$VE6,22:1739,100:[1,1750],108:[1,1751],109:[1,1752],110:1749,181:1740,191:1738,196:1743,197:1744,198:1745,201:1748,204:[1,1753],205:[1,1754],206:[1,1759],207:[1,1760],208:[1,1761],209:[1,1762],210:[1,1755],211:[1,1756],212:[1,1757],213:[1,1758],214:1742,215:$VF6},o($Vr2,$VW4),{19:$Vi,21:$Vj,22:1763,214:45,215:$Vk},{19:$VG6,21:$VH6,22:1765,100:[1,1776],108:[1,1777],109:[1,1778],110:1775,181:1766,191:1764,196:1769,197:1770,198:1771,201:1774,204:[1,1779],205:[1,1780],206:[1,1785],207:[1,1786],208:[1,1787],209:[1,1788],210:[1,1781],211:[1,1782],212:[1,1783],213:[1,1784],214:1768,215:$VI6},o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),o($VA1,$V73),{111:[1,1789]},o($VA1,$Vc3),o($VA2,$VW4),{19:$Vi,21:$Vj,22:1790,214:45,215:$Vk},{19:$VJ6,21:$VK6,22:1792,100:[1,1803],108:[1,1804],109:[1,1805],110:1802,181:1793,191:1791,196:1796,197:1797,198:1798,201:1801,204:[1,1806],205:[1,1807],206:[1,1812],207:[1,1813],208:[1,1814],209:[1,1815],210:[1,1808],211:[1,1809],212:[1,1810],213:[1,1811],214:1795,215:$VL6},o($VD1,$Vs5),o($VN1,$VW5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($VG,$VX5),o($VG,$Vw3),o($VI,$VJ,{62:1816,64:1817,66:1818,67:1819,73:1822,75:1823,72:1824,39:1825,92:1826,94:1827,87:1829,88:1830,89:1831,78:1832,95:1839,22:1840,91:1842,118:1843,99:1844,214:1847,105:1848,107:1849,19:[1,1846],21:[1,1851],69:[1,1820],71:[1,1821],79:[1,1833],80:[1,1834],81:[1,1835],85:[1,1828],96:[1,1836],97:[1,1837],98:[1,1838],101:$VM6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,1841],215:[1,1850]}),o($Vr2,$Vq2,{84:1345,192:1346,83:1852,190:$V_5}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:1853,121:$VX2,148:$VY2,189:$VZ2}),o($Vr2,$Vq2,{84:1345,192:1346,83:1854,190:$V_5}),o($Vt1,$Vt2,{99:854,95:1855,101:$VM4,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V33),o($VG,$Vy3),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:1856,193:[1,1857]}),{19:$VM3,21:$VN3,22:662,129:1858,199:$VO3,214:665,215:$VP3},o($VG,$VQ3),o($Vt1,$VK3),o($VG,$VL3,{31:1859,193:[1,1860]}),{19:$VM3,21:$VN3,22:662,129:1861,199:$VO3,214:665,215:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{100:[1,1862]},o($VA1,$VT1),{100:[1,1864],106:1863,108:[1,1865],109:[1,1866],110:1867,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1868]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:1869,193:[1,1870]}),{19:$VM3,21:$VN3,22:662,129:1871,199:$VO3,214:665,215:$VP3},o($VA1,$VW3),{121:[1,1872]},{19:[1,1875],21:[1,1878],22:1874,87:1873,214:1876,215:[1,1877]},o($Vr2,$Vq2,{84:1383,192:1384,83:1879,190:$V06}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:1880,121:$VX2,148:$VY2,189:$VZ2}),o($Vr2,$Vq2,{84:1383,192:1384,83:1881,190:$V06}),o($Vt1,$Vt2,{99:901,95:1882,101:$VN4,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V33),o($VG,$Vy3),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:1883,193:[1,1884]}),{19:$VM3,21:$VN3,22:662,129:1885,199:$VO3,214:665,215:$VP3},o($VG,$VQ3),o($Vt1,$VK3),o($VG,$VL3,{31:1886,193:[1,1887]}),{19:$VM3,21:$VN3,22:662,129:1888,199:$VO3,214:665,215:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{100:[1,1889]},o($VA1,$VT1),{100:[1,1891],106:1890,108:[1,1892],109:[1,1893],110:1894,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1895]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:1896,193:[1,1897]}),{19:$VM3,21:$VN3,22:662,129:1898,199:$VO3,214:665,215:$VP3},o($VA1,$VW3),{121:[1,1899]},{19:[1,1902],21:[1,1905],22:1901,87:1900,214:1903,215:[1,1904]},o($Vz3,$VV3),{121:[1,1906]},o($Vz3,$VJ3),o($VO4,$VR3),o($VP4,$VW4),{19:$Vi,21:$Vj,22:1907,214:45,215:$Vk},{19:$VN6,21:$VO6,22:1909,100:[1,1920],108:[1,1921],109:[1,1922],110:1919,181:1910,191:1908,196:1913,197:1914,198:1915,201:1918,204:[1,1923],205:[1,1924],206:[1,1929],207:[1,1930],208:[1,1931],209:[1,1932],210:[1,1925],211:[1,1926],212:[1,1927],213:[1,1928],214:1912,215:$VP6},o($VQ4,$VW4),{19:$Vi,21:$Vj,22:1933,214:45,215:$Vk},{19:$VQ6,21:$VR6,22:1935,100:[1,1946],108:[1,1947],109:[1,1948],110:1945,181:1936,191:1934,196:1939,197:1940,198:1941,201:1944,204:[1,1949],205:[1,1950],206:[1,1955],207:[1,1956],208:[1,1957],209:[1,1958],210:[1,1951],211:[1,1952],212:[1,1953],213:[1,1954],214:1938,215:$VS6},o($VS4,$VW4),{19:$Vi,21:$Vj,22:1959,214:45,215:$Vk},{19:$VT6,21:$VU6,22:1961,100:[1,1972],108:[1,1973],109:[1,1974],110:1971,181:1962,191:1960,196:1965,197:1966,198:1967,201:1970,204:[1,1975],205:[1,1976],206:[1,1981],207:[1,1982],208:[1,1983],209:[1,1984],210:[1,1977],211:[1,1978],212:[1,1979],213:[1,1980],214:1964,215:$VV6},o($VF3,$V33),o($VF3,$V43),o($VF3,$V53),o($VF3,$V63),o($VF3,$V73),{111:[1,1985]},o($VF3,$Vc3),o($VD3,$Vs5),o($VG3,$VW5),o($VG3,$VK1),o($VG3,$Vn),o($VG3,$Vo),o($VG3,$Vp),o($VG3,$Vq),o($Vz3,$Vc2),o($Vr,$Vs,{54:1986,41:1987,44:$Vt}),o($Vz3,$Vd2),o($Vz3,$Ve2),o($Vz3,$Vv1),o($Vz3,$Vw1),o($VC3,$Vs1,{82:1988}),o($Vz3,$VE1),o($Vz3,$VF1),{19:[1,1992],21:[1,1996],22:1990,33:1989,200:1991,214:1993,215:[1,1995],216:[1,1994]},{119:[1,1997],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($Vz3,$Vf2),o($Vz3,$Vg2),o($VC3,$Vs1,{82:1998}),o($VO4,$Vy1,{93:1999}),o($VC3,$Vz1,{99:1448,95:2000,101:$V46,102:$VR,103:$VS,104:$VT}),o($VO4,$VG1),o($VO4,$VH1),o($VO4,$VI1),o($VO4,$VJ1),{100:[1,2001]},o($VO4,$VT1),{70:[1,2002]},o($VP4,$Vq2,{83:2003,84:2004,192:2005,190:[1,2006]}),o($VQ4,$Vq2,{83:2007,84:2008,192:2009,190:$VW6}),o($VB3,$Vt2,{99:991,95:2011,101:$VU4,102:$VR,103:$VS,104:$VT}),o($VE3,$Vu2),o($VC3,$Vv2,{90:2012,95:2013,91:2014,99:2015,105:2017,107:2018,101:$VX6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VC3,$Vx2,{90:2012,95:2013,91:2014,99:2015,105:2017,107:2018,101:$VX6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VC3,$Vy2,{90:2012,95:2013,91:2014,99:2015,105:2017,107:2018,101:$VX6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VG3,$Vz2),o($VS4,$Vq2,{83:2019,84:2020,192:2021,190:[1,2022]}),o($V36,$VB2),o($V36,$Vw),o($V36,$Vx),o($V36,$Vn),o($V36,$Vo),o($V36,$Vy),o($V36,$Vp),o($V36,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,2023],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:2024,121:$VX2,148:$VY2,189:$VZ2}),o($VE3,$V33),o($VG3,$V43),o($VG3,$V53),o($VG3,$V63),o($VG3,$V73),{111:[1,2025]},o($VG3,$Vc3),o($Vz3,$Vd2),o($Vz3,$Ve2),o($Vz3,$Vv1),o($Vz3,$Vw1),o($VC3,$Vs1,{82:2026}),o($Vz3,$VE1),o($Vz3,$VF1),{19:[1,2030],21:[1,2034],22:2028,33:2027,200:2029,214:2031,215:[1,2033],216:[1,2032]},{119:[1,2035],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($Vz3,$Vf2),o($Vz3,$Vg2),o($VC3,$Vs1,{82:2036}),o($VO4,$Vy1,{93:2037}),o($VC3,$Vz1,{99:1495,95:2038,101:$V56,102:$VR,103:$VS,104:$VT}),o($VO4,$VG1),o($VO4,$VH1),o($VO4,$VI1),o($VO4,$VJ1),{100:[1,2039]},o($VO4,$VT1),{70:[1,2040]},o($VP4,$Vq2,{83:2041,84:2042,192:2043,190:[1,2044]}),o($VQ4,$Vq2,{83:2045,84:2046,192:2047,190:$VY6}),o($VB3,$Vt2,{99:1027,95:2049,101:$VV4,102:$VR,103:$VS,104:$VT}),o($VE3,$Vu2),o($VC3,$Vv2,{90:2050,95:2051,91:2052,99:2053,105:2055,107:2056,101:$VZ6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VC3,$Vx2,{90:2050,95:2051,91:2052,99:2053,105:2055,107:2056,101:$VZ6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VC3,$Vy2,{90:2050,95:2051,91:2052,99:2053,105:2055,107:2056,101:$VZ6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VG3,$Vz2),o($VS4,$Vq2,{83:2057,84:2058,192:2059,190:[1,2060]}),o($V36,$VB2),o($V36,$Vw),o($V36,$Vx),o($V36,$Vn),o($V36,$Vo),o($V36,$Vy),o($V36,$Vp),o($V36,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,2061],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:2062,121:$VX2,148:$VY2,189:$VZ2}),o($VE3,$V33),o($VG3,$V43),o($VG3,$V53),o($VG3,$V63),o($VG3,$V73),{111:[1,2063]},o($VG3,$Vc3),o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$Vq5),o($Vr1,$Vr5),{19:$VX4,21:$VY4,22:2065,87:2064,214:1040,215:$VZ4},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$Vq5),o($Vt1,$Vr5),{19:$V$4,21:$V05,22:2067,87:2066,214:1066,215:$V15},o($VA1,$VW5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$Vq5),o($VD1,$Vr5),{19:$V25,21:$V35,22:2069,87:2068,214:1093,215:$V45},o($V85,[2,205]),o($V85,[2,207]),o($V85,[2,214]),o($V85,[2,222]),o($Ve6,$Vq5),o($Ve6,$Vr5),{19:$V95,21:$Va5,22:2071,87:2070,214:1124,215:$Vp5},o($V85,[2,201]),o($V85,[2,210]),o($V85,[2,218]),o($V_6,$V$6,{152:2072,153:2073,156:$V07,157:$V17,158:$V27,159:$V37}),o($V47,$V57),o($V67,$V77,{56:2078}),o($V87,$V97,{60:2079}),o($VI,$VJ,{63:2080,73:2081,75:2082,76:2083,92:2086,94:2087,87:2089,88:2090,89:2091,78:2092,39:2093,95:2097,22:2098,91:2100,118:2101,99:2105,214:2108,105:2109,107:2110,19:[1,2107],21:[1,2112],69:[1,2084],71:[1,2085],79:[1,2102],80:[1,2103],81:[1,2104],85:[1,2088],96:[1,2094],97:[1,2095],98:[1,2096],101:$Va7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,2099],215:[1,2111]}),o($V_6,$V$6,{153:2073,152:2113,156:$V07,157:$V17,158:$V27,159:$V37}),{70:$Vt5,134:2114,135:$Vn6},o($Vo6,$Vu5),o($VV2,$VW2,{147:420,136:1167,137:1168,138:1169,144:1170,146:1171,131:2115,148:$VY2,189:$VG5}),o($Vo6,$Vv5),o($Vo6,$Vj4,{139:2116,143:2117,140:$Vp6,141:$Vq6}),o($VV2,$VW2,{147:420,144:1170,146:1171,138:2118,70:$Vw5,135:$Vw5,148:$VY2,189:$VG5}),o($VV2,$VW2,{147:420,144:1170,146:1171,138:2119,70:$Vx5,135:$Vx5,148:$VY2,189:$VG5}),o($Vr6,$Vy5),o($Vr6,$Vz5),o($Vr6,$VA5),o($Vr6,$VB5),{19:$VC5,21:$VD5,22:1157,129:2120,199:$VE5,214:1160,215:$VF5},o($VV2,$VW2,{147:420,130:1164,131:1165,132:1166,136:1167,137:1168,138:1169,144:1170,146:1171,126:2121,148:$VY2,189:$VG5}),o($Vr6,$VH5),o($Vr6,$VI5),o($Vr6,$VJ5),o($Vr6,$Vn),o($Vr6,$Vo),o($Vr6,$Vy),o($Vr6,$Vp),o($Vr6,$Vq),o($Vr4,[2,269]),o($Vs4,$Vt4,{224:2122}),o($VI,$VJ,{92:742,94:743,95:753,99:761,226:2123,73:2124,75:2125,76:2126,87:2130,88:2131,89:2132,78:2133,39:2134,22:2135,91:2137,118:2138,214:2143,105:2144,107:2145,19:[1,2142],21:[1,2147],69:[1,2127],71:[1,2128],79:[1,2139],80:[1,2140],81:[1,2141],85:[1,2129],96:$Vu4,97:$Vv4,98:$Vw4,101:$Vx4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,2136],215:[1,2146]}),o($Vs4,$Vb7),o($VI,$VJ,{92:742,94:743,95:753,99:761,226:2148,73:2149,75:2150,76:2151,87:2155,88:2156,89:2157,78:2158,39:2159,22:2160,91:2162,118:2163,214:2168,105:2169,107:2170,19:[1,2167],21:[1,2172],69:[1,2152],71:[1,2153],79:[1,2164],80:[1,2165],81:[1,2166],85:[1,2154],96:$Vu4,97:$Vv4,98:$Vw4,101:$Vx4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,2161],215:[1,2171]}),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:2173,121:$VX2,148:$VY2,189:$VZ2}),o($Vs4,$VB2),o($Vs4,$Vw),o($Vs4,$Vx),o($Vs4,$Vn),o($Vs4,$Vo),o($Vs4,$Vy),o($Vs4,$Vp),o($Vs4,$Vq),o($Vs4,$Vt2,{99:1192,95:2174,101:$VO5,102:$VR,103:$VS,104:$VT}),o($Vw6,$Vu2),o($Vw6,$V33),o($Vs4,$Vc7),o($VQ5,$VR3),o($VR5,$VS3),o($VR5,$VT3),o($VR5,$VU3),{100:[1,2175]},o($VR5,$VT1),{100:[1,2177],106:2176,108:[1,2178],109:[1,2179],110:2180,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2181]},o($VR5,$VW3),{121:[1,2182]},{19:[1,2185],21:[1,2188],22:2184,87:2183,214:2186,215:[1,2187]},{193:[1,2191],194:2189,195:[1,2190]},o($Vh3,$V66),o($Vh3,$V76),o($Vh3,$V86),o($Vh3,$Vn),o($Vh3,$Vo),o($Vh3,$VZ3),o($Vh3,$V_3),o($Vh3,$V$3),o($Vh3,$Vp),o($Vh3,$Vq),o($Vh3,$V04),o($Vh3,$V14,{202:2192,203:2193,111:[1,2194]}),o($Vh3,$V24),o($Vh3,$V34),o($Vh3,$V44),o($Vh3,$V54),o($Vh3,$V64),o($Vh3,$V74),o($Vh3,$V84),o($Vh3,$V94),o($Vh3,$Va4),o($Vd7,$V83),o($Vd7,$V93),o($Vd7,$Va3),o($Vd7,$Vb3),o($VG,$Vc2),o($Vr,$Vs,{54:2195,41:2196,44:$Vt}),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:2197}),o($VG,$VE1),o($VG,$VF1),{19:[1,2201],21:[1,2205],22:2199,33:2198,200:2200,214:2202,215:[1,2204],216:[1,2203]},{119:[1,2206],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:2207}),o($Vh2,$Vy1,{93:2208}),o($Vt1,$Vz1,{99:1660,95:2209,101:$VB6,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,2210]},o($Vh2,$VT1),{70:[1,2211]},o($Vp2,$Vq2,{83:2212,84:2213,192:2214,190:[1,2215]}),o($Vr2,$Vq2,{83:2216,84:2217,192:2218,190:$Ve7}),o($Vr1,$Vt2,{99:1251,95:2220,101:$VY5,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:2221,95:2222,91:2223,99:2224,105:2226,107:2227,101:$Vf7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:2221,95:2222,91:2223,99:2224,105:2226,107:2227,101:$Vf7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:2221,95:2222,91:2223,99:2224,105:2226,107:2227,101:$Vf7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:2228,84:2229,192:2230,190:[1,2231]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,2232],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:2233,121:$VX2,148:$VY2,189:$VZ2}),o($Vx1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),o($VN1,$V73),{111:[1,2234]},o($VN1,$Vc3),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:2235}),o($VG,$VE1),o($VG,$VF1),{19:[1,2239],21:[1,2243],22:2237,33:2236,200:2238,214:2240,215:[1,2242],216:[1,2241]},{119:[1,2244],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:2245}),o($Vh2,$Vy1,{93:2246}),o($Vt1,$Vz1,{99:1707,95:2247,101:$VC6,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,2248]},o($Vh2,$VT1),{70:[1,2249]},o($Vp2,$Vq2,{83:2250,84:2251,192:2252,190:[1,2253]}),o($Vr2,$Vq2,{83:2254,84:2255,192:2256,190:$Vg7}),o($Vr1,$Vt2,{99:1287,95:2258,101:$VZ5,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:2259,95:2260,91:2261,99:2262,105:2264,107:2265,101:$Vh7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:2259,95:2260,91:2261,99:2262,105:2264,107:2265,101:$Vh7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:2259,95:2260,91:2261,99:2262,105:2264,107:2265,101:$Vh7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:2266,84:2267,192:2268,190:[1,2269]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,2270],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:2271,121:$VX2,148:$VY2,189:$VZ2}),o($Vx1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),o($VN1,$V73),{111:[1,2272]},o($VN1,$Vc3),o($Vt1,$Vs5),{193:[1,2275],194:2273,195:[1,2274]},o($Vr1,$V66),o($Vr1,$V76),o($Vr1,$V86),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V04),o($Vr1,$V14,{202:2276,203:2277,111:[1,2278]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($V96,$V83),o($V96,$V93),o($V96,$Va3),o($V96,$Vb3),{193:[1,2281],194:2279,195:[1,2280]},o($Vt1,$V66),o($Vt1,$V76),o($Vt1,$V86),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V04),o($Vt1,$V14,{202:2282,203:2283,111:[1,2284]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($Va6,$Vb3),{19:[1,2287],21:[1,2290],22:2286,87:2285,214:2288,215:[1,2289]},{193:[1,2293],194:2291,195:[1,2292]},o($VD1,$V66),o($VD1,$V76),o($VD1,$V86),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V04),o($VD1,$V14,{202:2294,203:2295,111:[1,2296]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vb6,$V83),o($Vb6,$V93),o($Vb6,$Va3),o($Vb6,$Vb3),o($VG,$Vb1),o($VG,$Vc1,{65:2297,67:2298,72:2299,39:2300,78:2301,118:2305,79:[1,2302],80:[1,2303],81:[1,2304],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:2306,64:2307,73:2308,92:2309,94:2310,95:2314,99:2315,96:[1,2311],97:[1,2312],98:[1,2313],101:$Vi7,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:2317,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:2318}),o($Vt1,$Vs1,{82:2319}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:2320}),o($Vr1,$Vz1,{99:1844,95:2321,101:$VM6,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:2322}),o($VA1,$VB1,{86:2323}),o($VA1,$VB1,{86:2324}),o($Vt1,$VC1,{105:1848,107:1849,91:2325,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:2326}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,2330],21:[1,2334],22:2328,33:2327,200:2329,214:2331,215:[1,2333],216:[1,2332]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:2335}),o($VN1,$VO1),{119:[1,2336],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},{100:[1,2337]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,2339],106:2338,108:[1,2340],109:[1,2341],110:2342,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2343]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$VV3),{121:[1,2344]},o($VG,$VJ3),o($Vh2,$VR3),o($Vp2,$VW4),{19:$Vi,21:$Vj,22:2345,214:45,215:$Vk},{19:$Vj7,21:$Vk7,22:2347,100:[1,2358],108:[1,2359],109:[1,2360],110:2357,181:2348,191:2346,196:2351,197:2352,198:2353,201:2356,204:[1,2361],205:[1,2362],206:[1,2367],207:[1,2368],208:[1,2369],209:[1,2370],210:[1,2363],211:[1,2364],212:[1,2365],213:[1,2366],214:2350,215:$Vl7},o($Vr2,$VW4),{19:$Vi,21:$Vj,22:2371,214:45,215:$Vk},{19:$Vm7,21:$Vn7,22:2373,100:[1,2384],108:[1,2385],109:[1,2386],110:2383,181:2374,191:2372,196:2377,197:2378,198:2379,201:2382,204:[1,2387],205:[1,2388],206:[1,2393],207:[1,2394],208:[1,2395],209:[1,2396],210:[1,2389],211:[1,2390],212:[1,2391],213:[1,2392],214:2376,215:$Vo7},o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),o($VA1,$V73),{111:[1,2397]},o($VA1,$Vc3),o($VA2,$VW4),{19:$Vi,21:$Vj,22:2398,214:45,215:$Vk},{19:$Vp7,21:$Vq7,22:2400,100:[1,2411],108:[1,2412],109:[1,2413],110:2410,181:2401,191:2399,196:2404,197:2405,198:2406,201:2409,204:[1,2414],205:[1,2415],206:[1,2420],207:[1,2421],208:[1,2422],209:[1,2423],210:[1,2416],211:[1,2417],212:[1,2418],213:[1,2419],214:2403,215:$Vr7},o($VD1,$Vs5),o($VN1,$VW5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($VG,$VV3),{121:[1,2424]},o($VG,$VJ3),o($Vh2,$VR3),o($Vp2,$VW4),{19:$Vi,21:$Vj,22:2425,214:45,215:$Vk},{19:$Vs7,21:$Vt7,22:2427,100:[1,2438],108:[1,2439],109:[1,2440],110:2437,181:2428,191:2426,196:2431,197:2432,198:2433,201:2436,204:[1,2441],205:[1,2442],206:[1,2447],207:[1,2448],208:[1,2449],209:[1,2450],210:[1,2443],211:[1,2444],212:[1,2445],213:[1,2446],214:2430,215:$Vu7},o($Vr2,$VW4),{19:$Vi,21:$Vj,22:2451,214:45,215:$Vk},{19:$Vv7,21:$Vw7,22:2453,100:[1,2464],108:[1,2465],109:[1,2466],110:2463,181:2454,191:2452,196:2457,197:2458,198:2459,201:2462,204:[1,2467],205:[1,2468],206:[1,2473],207:[1,2474],208:[1,2475],209:[1,2476],210:[1,2469],211:[1,2470],212:[1,2471],213:[1,2472],214:2456,215:$Vx7},o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),o($VA1,$V73),{111:[1,2477]},o($VA1,$Vc3),o($VA2,$VW4),{19:$Vi,21:$Vj,22:2478,214:45,215:$Vk},{19:$Vy7,21:$Vz7,22:2480,100:[1,2491],108:[1,2492],109:[1,2493],110:2490,181:2481,191:2479,196:2484,197:2485,198:2486,201:2489,204:[1,2494],205:[1,2495],206:[1,2500],207:[1,2501],208:[1,2502],209:[1,2503],210:[1,2496],211:[1,2497],212:[1,2498],213:[1,2499],214:2483,215:$VA7},o($VD1,$Vs5),o($VN1,$VW5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($VC3,$Vs5),{193:[1,2506],194:2504,195:[1,2505]},o($VB3,$V66),o($VB3,$V76),o($VB3,$V86),o($VB3,$Vn),o($VB3,$Vo),o($VB3,$VZ3),o($VB3,$V_3),o($VB3,$V$3),o($VB3,$Vp),o($VB3,$Vq),o($VB3,$V04),o($VB3,$V14,{202:2507,203:2508,111:[1,2509]}),o($VB3,$V24),o($VB3,$V34),o($VB3,$V44),o($VB3,$V54),o($VB3,$V64),o($VB3,$V74),o($VB3,$V84),o($VB3,$V94),o($VB3,$Va4),o($VB7,$V83),o($VB7,$V93),o($VB7,$Va3),o($VB7,$Vb3),{193:[1,2512],194:2510,195:[1,2511]},o($VC3,$V66),o($VC3,$V76),o($VC3,$V86),o($VC3,$Vn),o($VC3,$Vo),o($VC3,$VZ3),o($VC3,$V_3),o($VC3,$V$3),o($VC3,$Vp),o($VC3,$Vq),o($VC3,$V04),o($VC3,$V14,{202:2513,203:2514,111:[1,2515]}),o($VC3,$V24),o($VC3,$V34),o($VC3,$V44),o($VC3,$V54),o($VC3,$V64),o($VC3,$V74),o($VC3,$V84),o($VC3,$V94),o($VC3,$Va4),o($VC7,$V83),o($VC7,$V93),o($VC7,$Va3),o($VC7,$Vb3),{193:[1,2518],194:2516,195:[1,2517]},o($VD3,$V66),o($VD3,$V76),o($VD3,$V86),o($VD3,$Vn),o($VD3,$Vo),o($VD3,$VZ3),o($VD3,$V_3),o($VD3,$V$3),o($VD3,$Vp),o($VD3,$Vq),o($VD3,$V04),o($VD3,$V14,{202:2519,203:2520,111:[1,2521]}),o($VD3,$V24),o($VD3,$V34),o($VD3,$V44),o($VD3,$V54),o($VD3,$V64),o($VD3,$V74),o($VD3,$V84),o($VD3,$V94),o($VD3,$Va4),o($VD7,$V83),o($VD7,$V93),o($VD7,$Va3),o($VD7,$Vb3),{19:[1,2524],21:[1,2527],22:2523,87:2522,214:2525,215:[1,2526]},o($Vz3,$Vw3),o($VI,$VJ,{62:2528,64:2529,66:2530,67:2531,73:2534,75:2535,72:2536,39:2537,92:2538,94:2539,87:2541,88:2542,89:2543,78:2544,95:2551,22:2552,91:2554,118:2555,99:2556,214:2559,105:2560,107:2561,19:[1,2558],21:[1,2563],69:[1,2532],71:[1,2533],79:[1,2545],80:[1,2546],81:[1,2547],85:[1,2540],96:[1,2548],97:[1,2549],98:[1,2550],101:$VE7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,2553],215:[1,2562]}),o($VQ4,$Vq2,{84:2008,192:2009,83:2564,190:$VW6}),o($Vz3,$VB2),o($Vz3,$Vw),o($Vz3,$Vx),o($Vz3,$Vn),o($Vz3,$Vo),o($Vz3,$Vy),o($Vz3,$Vp),o($Vz3,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:2565,121:$VX2,148:$VY2,189:$VZ2}),o($VQ4,$Vq2,{84:2008,192:2009,83:2566,190:$VW6}),o($VC3,$Vt2,{99:1448,95:2567,101:$V46,102:$VR,103:$VS,104:$VT}),o($VO4,$Vu2),o($VO4,$V33),o($Vz3,$Vy3),o($V26,$VJ3),o($VB3,$VK3),o($V26,$VL3,{31:2568,193:[1,2569]}),{19:$VM3,21:$VN3,22:662,129:2570,199:$VO3,214:665,215:$VP3},o($Vz3,$VQ3),o($VC3,$VK3),o($Vz3,$VL3,{31:2571,193:[1,2572]}),{19:$VM3,21:$VN3,22:662,129:2573,199:$VO3,214:665,215:$VP3},o($VE3,$VR3),o($VF3,$VS3),o($VF3,$VT3),o($VF3,$VU3),{100:[1,2574]},o($VF3,$VT1),{100:[1,2576],106:2575,108:[1,2577],109:[1,2578],110:2579,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2580]},o($V36,$VV3),o($VD3,$VK3),o($V36,$VL3,{31:2581,193:[1,2582]}),{19:$VM3,21:$VN3,22:662,129:2583,199:$VO3,214:665,215:$VP3},o($VF3,$VW3),{121:[1,2584]},{19:[1,2587],21:[1,2590],22:2586,87:2585,214:2588,215:[1,2589]},o($VQ4,$Vq2,{84:2046,192:2047,83:2591,190:$VY6}),o($Vz3,$VB2),o($Vz3,$Vw),o($Vz3,$Vx),o($Vz3,$Vn),o($Vz3,$Vo),o($Vz3,$Vy),o($Vz3,$Vp),o($Vz3,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:2592,121:$VX2,148:$VY2,189:$VZ2}),o($VQ4,$Vq2,{84:2046,192:2047,83:2593,190:$VY6}),o($VC3,$Vt2,{99:1495,95:2594,101:$V56,102:$VR,103:$VS,104:$VT}),o($VO4,$Vu2),o($VO4,$V33),o($Vz3,$Vy3),o($V26,$VJ3),o($VB3,$VK3),o($V26,$VL3,{31:2595,193:[1,2596]}),{19:$VM3,21:$VN3,22:662,129:2597,199:$VO3,214:665,215:$VP3},o($Vz3,$VQ3),o($VC3,$VK3),o($Vz3,$VL3,{31:2598,193:[1,2599]}),{19:$VM3,21:$VN3,22:662,129:2600,199:$VO3,214:665,215:$VP3},o($VE3,$VR3),o($VF3,$VS3),o($VF3,$VT3),o($VF3,$VU3),{100:[1,2601]},o($VF3,$VT1),{100:[1,2603],106:2602,108:[1,2604],109:[1,2605],110:2606,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2607]},o($V36,$VV3),o($VD3,$VK3),o($V36,$VL3,{31:2608,193:[1,2609]}),{19:$VM3,21:$VN3,22:662,129:2610,199:$VO3,214:665,215:$VP3},o($VF3,$VW3),{121:[1,2611]},{19:[1,2614],21:[1,2617],22:2613,87:2612,214:2615,215:[1,2616]},o($Vr1,$Vg6),o($Vr1,$VK1),o($Vt1,$Vg6),o($Vt1,$VK1),o($VD1,$Vg6),o($VD1,$VK1),o($Ve6,$Vg6),o($Ve6,$VK1),o($V_6,$Vs1,{82:2618}),o($V_6,$VF7),o($V_6,$VG7),o($V_6,$VH7),o($V_6,$VI7),o($V_6,$VJ7),o($V47,$VK7,{57:2619,51:[1,2620]}),o($V67,$VL7,{61:2621,53:[1,2622]}),o($V87,$VM7),o($V87,$VN7,{74:2623,76:2624,78:2625,39:2626,118:2627,79:[1,2628],80:[1,2629],81:[1,2630],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($V87,$VO7),o($V87,$VN5,{77:2631,73:2632,92:2633,94:2634,95:2638,99:2639,96:[1,2635],97:[1,2636],98:[1,2637],101:$VP7,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:2641,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($V87,$VQ7),o($VR7,$Vy1,{93:2642}),o($VS7,$Vz1,{99:2105,95:2643,101:$Va7,102:$VR,103:$VS,104:$VT}),o($VT7,$VB1,{86:2644}),o($VT7,$VB1,{86:2645}),o($VT7,$VB1,{86:2646}),o($V87,$VC1,{105:2109,107:2110,91:2647,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VU7,$VT5),o($VU7,$VU5),o($VR7,$VG1),o($VR7,$VH1),o($VR7,$VI1),o($VR7,$VJ1),o($VT7,$VK1),o($VL1,$VM1,{162:2648}),o($VV7,$VO1),{119:[1,2649],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($VU7,$VE1),o($VU7,$VF1),{19:[1,2653],21:[1,2657],22:2651,33:2650,200:2652,214:2654,215:[1,2656],216:[1,2655]},{100:[1,2658]},o($VR7,$VT1),o($VT7,$Vn),o($VT7,$Vo),{100:[1,2660],106:2659,108:[1,2661],109:[1,2662],110:2663,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2664]},o($VT7,$Vp),o($VT7,$Vq),o($V_6,$Vs1,{82:2665}),o($Vo6,$Vh6),o($Vo6,$Vi6),o($Vo6,$Vj6),o($Vr6,$Vk6),o($Vr6,$Vl6),o($Vr6,$Vm6),o($Vr,$Vs,{46:2666,47:2667,55:2668,59:2669,41:2670,44:$Vt}),{70:[1,2671]},o($Vr4,$VK5,{225:2672,53:[1,2673]}),o($Vs4,$VL5),o($VI,$VJ,{76:2674,78:2675,39:2676,118:2677,79:[1,2678],80:[1,2679],81:[1,2680]}),o($Vs4,$VM5),o($Vs4,$VN5,{77:2681,73:2682,92:2683,94:2684,95:2688,99:2689,96:[1,2685],97:[1,2686],98:[1,2687],101:$VW7,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:2691,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vs4,$VP5),o($VR5,$VB1,{86:2692}),o($VR5,$VB1,{86:2693}),o($VR5,$VB1,{86:2694}),o($Vs4,$VC1,{105:2144,107:2145,91:2695,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VS5,$VT5),o($VS5,$VU5),o($VR5,$VK1),o($VL1,$VM1,{162:2696}),o($VV5,$VO1),{119:[1,2697],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($VS5,$VE1),o($VS5,$VF1),{19:[1,2701],21:[1,2705],22:2699,33:2698,200:2700,214:2702,215:[1,2704],216:[1,2703]},o($VR5,$Vn),o($VR5,$Vo),{100:[1,2707],106:2706,108:[1,2708],109:[1,2709],110:2710,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2711]},o($VR5,$Vp),o($VR5,$Vq),o($Vs4,$VL5),o($VI,$VJ,{76:2712,78:2713,39:2714,118:2715,79:[1,2716],80:[1,2717],81:[1,2718]}),o($Vs4,$VM5),o($Vs4,$VN5,{77:2719,73:2720,92:2721,94:2722,95:2726,99:2727,96:[1,2723],97:[1,2724],98:[1,2725],101:$VX7,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:2729,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vs4,$VP5),o($VR5,$VB1,{86:2730}),o($VR5,$VB1,{86:2731}),o($VR5,$VB1,{86:2732}),o($Vs4,$VC1,{105:2169,107:2170,91:2733,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VS5,$VT5),o($VS5,$VU5),o($VR5,$VK1),o($VL1,$VM1,{162:2734}),o($VV5,$VO1),{119:[1,2735],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($VS5,$VE1),o($VS5,$VF1),{19:[1,2739],21:[1,2743],22:2737,33:2736,200:2738,214:2740,215:[1,2742],216:[1,2741]},o($VR5,$Vn),o($VR5,$Vo),{100:[1,2745],106:2744,108:[1,2746],109:[1,2747],110:2748,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2749]},o($VR5,$Vp),o($VR5,$Vq),{121:[1,2750]},o($Vw6,$VR3),o($VR5,$V33),o($VR5,$V43),o($VR5,$V53),o($VR5,$V63),o($VR5,$V73),{111:[1,2751]},o($VR5,$Vc3),o($VS5,$Vs5),o($VV5,$VW5),o($VV5,$VK1),o($VV5,$Vn),o($VV5,$Vo),o($VV5,$Vp),o($VV5,$Vq),o($VE4,$V41),o($VE4,$V51),o($VE4,$V61),o($Vh3,$Vq5),o($Vh3,$Vr5),{19:$Vy6,21:$Vz6,22:2753,87:2752,214:1619,215:$VA6},o($VG,$Vw3),o($VI,$VJ,{62:2754,64:2755,66:2756,67:2757,73:2760,75:2761,72:2762,39:2763,92:2764,94:2765,87:2767,88:2768,89:2769,78:2770,95:2777,22:2778,91:2780,118:2781,99:2782,214:2785,105:2786,107:2787,19:[1,2784],21:[1,2789],69:[1,2758],71:[1,2759],79:[1,2771],80:[1,2772],81:[1,2773],85:[1,2766],96:[1,2774],97:[1,2775],98:[1,2776],101:$VY7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,2779],215:[1,2788]}),o($Vr2,$Vq2,{84:2217,192:2218,83:2790,190:$Ve7}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:2791,121:$VX2,148:$VY2,189:$VZ2}),o($Vr2,$Vq2,{84:2217,192:2218,83:2792,190:$Ve7}),o($Vt1,$Vt2,{99:1660,95:2793,101:$VB6,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V33),o($VG,$Vy3),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:2794,193:[1,2795]}),{19:$VM3,21:$VN3,22:662,129:2796,199:$VO3,214:665,215:$VP3},o($VG,$VQ3),o($Vt1,$VK3),o($VG,$VL3,{31:2797,193:[1,2798]}),{19:$VM3,21:$VN3,22:662,129:2799,199:$VO3,214:665,215:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{100:[1,2800]},o($VA1,$VT1),{100:[1,2802],106:2801,108:[1,2803],109:[1,2804],110:2805,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2806]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:2807,193:[1,2808]}),{19:$VM3,21:$VN3,22:662,129:2809,199:$VO3,214:665,215:$VP3},o($VA1,$VW3),{121:[1,2810]},{19:[1,2813],21:[1,2816],22:2812,87:2811,214:2814,215:[1,2815]},o($Vr2,$Vq2,{84:2255,192:2256,83:2817,190:$Vg7}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:2818,121:$VX2,148:$VY2,189:$VZ2}),o($Vr2,$Vq2,{84:2255,192:2256,83:2819,190:$Vg7}),o($Vt1,$Vt2,{99:1707,95:2820,101:$VC6,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V33),o($VG,$Vy3),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:2821,193:[1,2822]}),{19:$VM3,21:$VN3,22:662,129:2823,199:$VO3,214:665,215:$VP3},o($VG,$VQ3),o($Vt1,$VK3),o($VG,$VL3,{31:2824,193:[1,2825]}),{19:$VM3,21:$VN3,22:662,129:2826,199:$VO3,214:665,215:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{100:[1,2827]},o($VA1,$VT1),{100:[1,2829],106:2828,108:[1,2830],109:[1,2831],110:2832,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2833]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:2834,193:[1,2835]}),{19:$VM3,21:$VN3,22:662,129:2836,199:$VO3,214:665,215:$VP3},o($VA1,$VW3),{121:[1,2837]},{19:[1,2840],21:[1,2843],22:2839,87:2838,214:2841,215:[1,2842]},o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$Vq5),o($Vr1,$Vr5),{19:$VD6,21:$VE6,22:2845,87:2844,214:1742,215:$VF6},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$Vq5),o($Vt1,$Vr5),{19:$VG6,21:$VH6,22:2847,87:2846,214:1768,215:$VI6},o($VA1,$VW5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$Vq5),o($VD1,$Vr5),{19:$VJ6,21:$VK6,22:2849,87:2848,214:1795,215:$VL6},o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:2850}),o($VG,$VE1),o($VG,$VF1),{19:[1,2854],21:[1,2858],22:2852,33:2851,200:2853,214:2855,215:[1,2857],216:[1,2856]},{119:[1,2859],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:2860}),o($Vh2,$Vy1,{93:2861}),o($Vt1,$Vz1,{99:2315,95:2862,101:$Vi7,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,2863]},o($Vh2,$VT1),{70:[1,2864]},o($Vp2,$Vq2,{83:2865,84:2866,192:2867,190:[1,2868]}),o($Vr2,$Vq2,{83:2869,84:2870,192:2871,190:$VZ7}),o($Vr1,$Vt2,{99:1844,95:2873,101:$VM6,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:2874,95:2875,91:2876,99:2877,105:2879,107:2880,101:$V_7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:2874,95:2875,91:2876,99:2877,105:2879,107:2880,101:$V_7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:2874,95:2875,91:2876,99:2877,105:2879,107:2880,101:$V_7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:2881,84:2882,192:2883,190:[1,2884]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,2885],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:2886,121:$VX2,148:$VY2,189:$VZ2}),o($Vx1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),o($VN1,$V73),{111:[1,2887]},o($VN1,$Vc3),o($Vt1,$Vs5),{193:[1,2890],194:2888,195:[1,2889]},o($Vr1,$V66),o($Vr1,$V76),o($Vr1,$V86),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V04),o($Vr1,$V14,{202:2891,203:2892,111:[1,2893]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($V96,$V83),o($V96,$V93),o($V96,$Va3),o($V96,$Vb3),{193:[1,2896],194:2894,195:[1,2895]},o($Vt1,$V66),o($Vt1,$V76),o($Vt1,$V86),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V04),o($Vt1,$V14,{202:2897,203:2898,111:[1,2899]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($Va6,$Vb3),{19:[1,2902],21:[1,2905],22:2901,87:2900,214:2903,215:[1,2904]},{193:[1,2908],194:2906,195:[1,2907]},o($VD1,$V66),o($VD1,$V76),o($VD1,$V86),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V04),o($VD1,$V14,{202:2909,203:2910,111:[1,2911]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vb6,$V83),o($Vb6,$V93),o($Vb6,$Va3),o($Vb6,$Vb3),o($Vt1,$Vs5),{193:[1,2914],194:2912,195:[1,2913]},o($Vr1,$V66),o($Vr1,$V76),o($Vr1,$V86),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V04),o($Vr1,$V14,{202:2915,203:2916,111:[1,2917]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($V96,$V83),o($V96,$V93),o($V96,$Va3),o($V96,$Vb3),{193:[1,2920],194:2918,195:[1,2919]},o($Vt1,$V66),o($Vt1,$V76),o($Vt1,$V86),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V04),o($Vt1,$V14,{202:2921,203:2922,111:[1,2923]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($Va6,$Vb3),{19:[1,2926],21:[1,2929],22:2925,87:2924,214:2927,215:[1,2928]},{193:[1,2932],194:2930,195:[1,2931]},o($VD1,$V66),o($VD1,$V76),o($VD1,$V86),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V04),o($VD1,$V14,{202:2933,203:2934,111:[1,2935]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vb6,$V83),o($Vb6,$V93),o($Vb6,$Va3),o($Vb6,$Vb3),o($VP4,$V41),o($VP4,$V51),o($VP4,$V61),o($VB3,$Vq5),o($VB3,$Vr5),{19:$VN6,21:$VO6,22:2937,87:2936,214:1912,215:$VP6},o($VQ4,$V41),o($VQ4,$V51),o($VQ4,$V61),o($VC3,$Vq5),o($VC3,$Vr5),{19:$VQ6,21:$VR6,22:2939,87:2938,214:1938,215:$VS6},o($VS4,$V41),o($VS4,$V51),o($VS4,$V61),o($VD3,$Vq5),o($VD3,$Vr5),{19:$VT6,21:$VU6,22:2941,87:2940,214:1964,215:$VV6},o($VF3,$VW5),o($VF3,$VK1),o($VF3,$Vn),o($VF3,$Vo),o($VF3,$Vp),o($VF3,$Vq),o($Vz3,$Vb1),o($VI,$VJ,{65:2942,67:2943,72:2944,39:2945,78:2946,118:2950,51:$Vc1,53:$Vc1,70:$Vc1,79:[1,2947],80:[1,2948],81:[1,2949]}),o($Vz3,$Vg1),o($Vz3,$Vh1,{68:2951,64:2952,73:2953,92:2954,94:2955,95:2959,99:2960,96:[1,2956],97:[1,2957],98:[1,2958],101:$V$7,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:2962,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vz3,$Vq1),o($VB3,$Vs1,{82:2963}),o($VC3,$Vs1,{82:2964}),o($V36,$Vv1),o($V36,$Vw1),o($VE3,$Vy1,{93:2965}),o($VB3,$Vz1,{99:2556,95:2966,101:$VE7,102:$VR,103:$VS,104:$VT}),o($VF3,$VB1,{86:2967}),o($VF3,$VB1,{86:2968}),o($VF3,$VB1,{86:2969}),o($VC3,$VC1,{105:2560,107:2561,91:2970,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD3,$Vs1,{82:2971}),o($V36,$VE1),o($V36,$VF1),{19:[1,2975],21:[1,2979],22:2973,33:2972,200:2974,214:2976,215:[1,2978],216:[1,2977]},o($VE3,$VG1),o($VE3,$VH1),o($VE3,$VI1),o($VE3,$VJ1),o($VF3,$VK1),o($VL1,$VM1,{162:2980}),o($VG3,$VO1),{119:[1,2981],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},{100:[1,2982]},o($VE3,$VT1),o($VF3,$Vn),o($VF3,$Vo),{100:[1,2984],106:2983,108:[1,2985],109:[1,2986],110:2987,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2988]},o($VF3,$Vp),o($VF3,$Vq),o($Vz3,$VV3),{121:[1,2989]},o($Vz3,$VJ3),o($VO4,$VR3),o($VP4,$VW4),{19:$Vi,21:$Vj,22:2990,214:45,215:$Vk},{19:$V08,21:$V18,22:2992,100:[1,3003],108:[1,3004],109:[1,3005],110:3002,181:2993,191:2991,196:2996,197:2997,198:2998,201:3001,204:[1,3006],205:[1,3007],206:[1,3012],207:[1,3013],208:[1,3014],209:[1,3015],210:[1,3008],211:[1,3009],212:[1,3010],213:[1,3011],214:2995,215:$V28},o($VQ4,$VW4),{19:$Vi,21:$Vj,22:3016,214:45,215:$Vk},{19:$V38,21:$V48,22:3018,100:[1,3029],108:[1,3030],109:[1,3031],110:3028,181:3019,191:3017,196:3022,197:3023,198:3024,201:3027,204:[1,3032],205:[1,3033],206:[1,3038],207:[1,3039],208:[1,3040],209:[1,3041],210:[1,3034],211:[1,3035],212:[1,3036],213:[1,3037],214:3021,215:$V58},o($VF3,$V33),o($VF3,$V43),o($VF3,$V53),o($VF3,$V63),o($VF3,$V73),{111:[1,3042]},o($VF3,$Vc3),o($VS4,$VW4),{19:$Vi,21:$Vj,22:3043,214:45,215:$Vk},{19:$V68,21:$V78,22:3045,100:[1,3056],108:[1,3057],109:[1,3058],110:3055,181:3046,191:3044,196:3049,197:3050,198:3051,201:3054,204:[1,3059],205:[1,3060],206:[1,3065],207:[1,3066],208:[1,3067],209:[1,3068],210:[1,3061],211:[1,3062],212:[1,3063],213:[1,3064],214:3048,215:$V88},o($VD3,$Vs5),o($VG3,$VW5),o($VG3,$VK1),o($VG3,$Vn),o($VG3,$Vo),o($VG3,$Vp),o($VG3,$Vq),o($Vz3,$VV3),{121:[1,3069]},o($Vz3,$VJ3),o($VO4,$VR3),o($VP4,$VW4),{19:$Vi,21:$Vj,22:3070,214:45,215:$Vk},{19:$V98,21:$Va8,22:3072,100:[1,3083],108:[1,3084],109:[1,3085],110:3082,181:3073,191:3071,196:3076,197:3077,198:3078,201:3081,204:[1,3086],205:[1,3087],206:[1,3092],207:[1,3093],208:[1,3094],209:[1,3095],210:[1,3088],211:[1,3089],212:[1,3090],213:[1,3091],214:3075,215:$Vb8},o($VQ4,$VW4),{19:$Vi,21:$Vj,22:3096,214:45,215:$Vk},{19:$Vc8,21:$Vd8,22:3098,100:[1,3109],108:[1,3110],109:[1,3111],110:3108,181:3099,191:3097,196:3102,197:3103,198:3104,201:3107,204:[1,3112],205:[1,3113],206:[1,3118],207:[1,3119],208:[1,3120],209:[1,3121],210:[1,3114],211:[1,3115],212:[1,3116],213:[1,3117],214:3101,215:$Ve8},o($VF3,$V33),o($VF3,$V43),o($VF3,$V53),o($VF3,$V63),o($VF3,$V73),{111:[1,3122]},o($VF3,$Vc3),o($VS4,$VW4),{19:$Vi,21:$Vj,22:3123,214:45,215:$Vk},{19:$Vf8,21:$Vg8,22:3125,100:[1,3136],108:[1,3137],109:[1,3138],110:3135,181:3126,191:3124,196:3129,197:3130,198:3131,201:3134,204:[1,3139],205:[1,3140],206:[1,3145],207:[1,3146],208:[1,3147],209:[1,3148],210:[1,3141],211:[1,3142],212:[1,3143],213:[1,3144],214:3128,215:$Vh8},o($VD3,$Vs5),o($VG3,$VW5),o($VG3,$VK1),o($VG3,$Vn),o($VG3,$Vo),o($VG3,$Vp),o($VG3,$Vq),o($Vi8,$Vq2,{83:3149,84:3150,192:3151,190:$Vj8}),o($V67,$Vk8),o($Vr,$Vs,{55:3153,59:3154,41:3155,44:$Vt}),o($V87,$Vl8),o($Vr,$Vs,{59:3156,41:3157,44:$Vt}),o($V87,$Vm8),o($V87,$Vn8),o($V87,$VT5),o($V87,$VU5),{119:[1,3158],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($V87,$VE1),o($V87,$VF1),{19:[1,3162],21:[1,3166],22:3160,33:3159,200:3161,214:3163,215:[1,3165],216:[1,3164]},o($V87,$Vo8),o($V87,$Vv6),o($Vp8,$Vy1,{93:3167}),o($V87,$Vz1,{99:2639,95:3168,101:$VP7,102:$VR,103:$VS,104:$VT}),o($Vp8,$VG1),o($Vp8,$VH1),o($Vp8,$VI1),o($Vp8,$VJ1),{100:[1,3169]},o($Vp8,$VT1),{70:[1,3170]},o($VS7,$Vt2,{99:2105,95:3171,101:$Va7,102:$VR,103:$VS,104:$VT}),o($VR7,$Vu2),o($V87,$Vv2,{90:3172,95:3173,91:3174,99:3175,105:3177,107:3178,101:$Vq8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V87,$Vx2,{90:3172,95:3173,91:3174,99:3175,105:3177,107:3178,101:$Vq8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V87,$Vy2,{90:3172,95:3173,91:3174,99:3175,105:3177,107:3178,101:$Vq8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VV7,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,3179],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:3180,121:$VX2,148:$VY2,189:$VZ2}),o($VU7,$VB2),o($VU7,$Vw),o($VU7,$Vx),o($VU7,$Vn),o($VU7,$Vo),o($VU7,$Vy),o($VU7,$Vp),o($VU7,$Vq),o($VR7,$V33),o($VV7,$V43),o($VV7,$V53),o($VV7,$V63),o($VV7,$V73),{111:[1,3181]},o($VV7,$Vc3),o($Vi8,$Vq2,{84:3150,192:3151,83:3182,190:$Vj8}),o($Vr8,$V$6,{152:3183,153:3184,156:$Vs8,157:$Vt8,158:$Vu8,159:$Vv8}),o($Vw8,$V57),o($Vx8,$V77,{56:3189}),o($Vy8,$V97,{60:3190}),o($VI,$VJ,{63:3191,73:3192,75:3193,76:3194,92:3197,94:3198,87:3200,88:3201,89:3202,78:3203,39:3204,95:3208,22:3209,91:3211,118:3212,99:3216,214:3219,105:3220,107:3221,19:[1,3218],21:[1,3223],69:[1,3195],71:[1,3196],79:[1,3213],80:[1,3214],81:[1,3215],85:[1,3199],96:[1,3205],97:[1,3206],98:[1,3207],101:$Vz8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,3210],215:[1,3222]}),o($Vr8,$V$6,{153:3184,152:3224,156:$Vs8,157:$Vt8,158:$Vu8,159:$Vv8}),o($Vs4,$Vs6),o($Vr,$Vs,{223:3225,41:3226,44:$Vt}),o($Vs4,$Vt6),o($Vs4,$VT5),o($Vs4,$VU5),{119:[1,3227],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($Vs4,$VE1),o($Vs4,$VF1),{19:[1,3231],21:[1,3235],22:3229,33:3228,200:3230,214:3232,215:[1,3234],216:[1,3233]},o($Vs4,$Vu6),o($Vs4,$Vv6),o($Vw6,$Vy1,{93:3236}),o($Vs4,$Vz1,{99:2689,95:3237,101:$VW7,102:$VR,103:$VS,104:$VT}),o($Vw6,$VG1),o($Vw6,$VH1),o($Vw6,$VI1),o($Vw6,$VJ1),{100:[1,3238]},o($Vw6,$VT1),{70:[1,3239]},o($Vs4,$Vv2,{90:3240,95:3241,91:3242,99:3243,105:3245,107:3246,101:$VA8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vs4,$Vx2,{90:3240,95:3241,91:3242,99:3243,105:3245,107:3246,101:$VA8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vs4,$Vy2,{90:3240,95:3241,91:3242,99:3243,105:3245,107:3246,101:$VA8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VV5,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,3247],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:3248,121:$VX2,148:$VY2,189:$VZ2}),o($VS5,$VB2),o($VS5,$Vw),o($VS5,$Vx),o($VS5,$Vn),o($VS5,$Vo),o($VS5,$Vy),o($VS5,$Vp),o($VS5,$Vq),o($VV5,$V43),o($VV5,$V53),o($VV5,$V63),o($VV5,$V73),{111:[1,3249]},o($VV5,$Vc3),o($Vs4,$Vt6),o($Vs4,$VT5),o($Vs4,$VU5),{119:[1,3250],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($Vs4,$VE1),o($Vs4,$VF1),{19:[1,3254],21:[1,3258],22:3252,33:3251,200:3253,214:3255,215:[1,3257],216:[1,3256]},o($Vs4,$Vu6),o($Vs4,$Vv6),o($Vw6,$Vy1,{93:3259}),o($Vs4,$Vz1,{99:2727,95:3260,101:$VX7,102:$VR,103:$VS,104:$VT}),o($Vw6,$VG1),o($Vw6,$VH1),o($Vw6,$VI1),o($Vw6,$VJ1),{100:[1,3261]},o($Vw6,$VT1),{70:[1,3262]},o($Vs4,$Vv2,{90:3263,95:3264,91:3265,99:3266,105:3268,107:3269,101:$VB8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vs4,$Vx2,{90:3263,95:3264,91:3265,99:3266,105:3268,107:3269,101:$VB8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vs4,$Vy2,{90:3263,95:3264,91:3265,99:3266,105:3268,107:3269,101:$VB8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VV5,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,3270],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:3271,121:$VX2,148:$VY2,189:$VZ2}),o($VS5,$VB2),o($VS5,$Vw),o($VS5,$Vx),o($VS5,$Vn),o($VS5,$Vo),o($VS5,$Vy),o($VS5,$Vp),o($VS5,$Vq),o($VV5,$V43),o($VV5,$V53),o($VV5,$V63),o($VV5,$V73),{111:[1,3272]},o($VV5,$Vc3),o($Vs4,$Vs5),{19:[1,3275],21:[1,3278],22:3274,87:3273,214:3276,215:[1,3277]},o($Vh3,$Vg6),o($Vh3,$VK1),o($VG,$Vb1),o($VG,$Vc1,{65:3279,67:3280,72:3281,39:3282,78:3283,118:3287,79:[1,3284],80:[1,3285],81:[1,3286],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($VG,$Vg1),o($VG,$Vh1,{68:3288,64:3289,73:3290,92:3291,94:3292,95:3296,99:3297,96:[1,3293],97:[1,3294],98:[1,3295],101:$VC8,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:3299,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($VG,$Vq1),o($Vr1,$Vs1,{82:3300}),o($Vt1,$Vs1,{82:3301}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:3302}),o($Vr1,$Vz1,{99:2782,95:3303,101:$VY7,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:3304}),o($VA1,$VB1,{86:3305}),o($VA1,$VB1,{86:3306}),o($Vt1,$VC1,{105:2786,107:2787,91:3307,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:3308}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,3312],21:[1,3316],22:3310,33:3309,200:3311,214:3313,215:[1,3315],216:[1,3314]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:3317}),o($VN1,$VO1),{119:[1,3318],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},{100:[1,3319]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,3321],106:3320,108:[1,3322],109:[1,3323],110:3324,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,3325]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$VV3),{121:[1,3326]},o($VG,$VJ3),o($Vh2,$VR3),o($Vp2,$VW4),{19:$Vi,21:$Vj,22:3327,214:45,215:$Vk},{19:$VD8,21:$VE8,22:3329,100:[1,3340],108:[1,3341],109:[1,3342],110:3339,181:3330,191:3328,196:3333,197:3334,198:3335,201:3338,204:[1,3343],205:[1,3344],206:[1,3349],207:[1,3350],208:[1,3351],209:[1,3352],210:[1,3345],211:[1,3346],212:[1,3347],213:[1,3348],214:3332,215:$VF8},o($Vr2,$VW4),{19:$Vi,21:$Vj,22:3353,214:45,215:$Vk},{19:$VG8,21:$VH8,22:3355,100:[1,3366],108:[1,3367],109:[1,3368],110:3365,181:3356,191:3354,196:3359,197:3360,198:3361,201:3364,204:[1,3369],205:[1,3370],206:[1,3375],207:[1,3376],208:[1,3377],209:[1,3378],210:[1,3371],211:[1,3372],212:[1,3373],213:[1,3374],214:3358,215:$VI8},o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),o($VA1,$V73),{111:[1,3379]},o($VA1,$Vc3),o($VA2,$VW4),{19:$Vi,21:$Vj,22:3380,214:45,215:$Vk},{19:$VJ8,21:$VK8,22:3382,100:[1,3393],108:[1,3394],109:[1,3395],110:3392,181:3383,191:3381,196:3386,197:3387,198:3388,201:3391,204:[1,3396],205:[1,3397],206:[1,3402],207:[1,3403],208:[1,3404],209:[1,3405],210:[1,3398],211:[1,3399],212:[1,3400],213:[1,3401],214:3385,215:$VL8},o($VD1,$Vs5),o($VN1,$VW5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($VG,$VV3),{121:[1,3406]},o($VG,$VJ3),o($Vh2,$VR3),o($Vp2,$VW4),{19:$Vi,21:$Vj,22:3407,214:45,215:$Vk},{19:$VM8,21:$VN8,22:3409,100:[1,3420],108:[1,3421],109:[1,3422],110:3419,181:3410,191:3408,196:3413,197:3414,198:3415,201:3418,204:[1,3423],205:[1,3424],206:[1,3429],207:[1,3430],208:[1,3431],209:[1,3432],210:[1,3425],211:[1,3426],212:[1,3427],213:[1,3428],214:3412,215:$VO8},o($Vr2,$VW4),{19:$Vi,21:$Vj,22:3433,214:45,215:$Vk},{19:$VP8,21:$VQ8,22:3435,100:[1,3446],108:[1,3447],109:[1,3448],110:3445,181:3436,191:3434,196:3439,197:3440,198:3441,201:3444,204:[1,3449],205:[1,3450],206:[1,3455],207:[1,3456],208:[1,3457],209:[1,3458],210:[1,3451],211:[1,3452],212:[1,3453],213:[1,3454],214:3438,215:$VR8},o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),o($VA1,$V73),{111:[1,3459]},o($VA1,$Vc3),o($VA2,$VW4),{19:$Vi,21:$Vj,22:3460,214:45,215:$Vk},{19:$VS8,21:$VT8,22:3462,100:[1,3473],108:[1,3474],109:[1,3475],110:3472,181:3463,191:3461,196:3466,197:3467,198:3468,201:3471,204:[1,3476],205:[1,3477],206:[1,3482],207:[1,3483],208:[1,3484],209:[1,3485],210:[1,3478],211:[1,3479],212:[1,3480],213:[1,3481],214:3465,215:$VU8},o($VD1,$Vs5),o($VN1,$VW5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($Vr1,$Vg6),o($Vr1,$VK1),o($Vt1,$Vg6),o($Vt1,$VK1),o($VD1,$Vg6),o($VD1,$VK1),o($Vr2,$Vq2,{84:2870,192:2871,83:3486,190:$VZ7}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:3487,121:$VX2,148:$VY2,189:$VZ2}),o($Vr2,$Vq2,{84:2870,192:2871,83:3488,190:$VZ7}),o($Vt1,$Vt2,{99:2315,95:3489,101:$Vi7,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V33),o($VG,$Vy3),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:3490,193:[1,3491]}),{19:$VM3,21:$VN3,22:662,129:3492,199:$VO3,214:665,215:$VP3},o($VG,$VQ3),o($Vt1,$VK3),o($VG,$VL3,{31:3493,193:[1,3494]}),{19:$VM3,21:$VN3,22:662,129:3495,199:$VO3,214:665,215:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{100:[1,3496]},o($VA1,$VT1),{100:[1,3498],106:3497,108:[1,3499],109:[1,3500],110:3501,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,3502]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:3503,193:[1,3504]}),{19:$VM3,21:$VN3,22:662,129:3505,199:$VO3,214:665,215:$VP3},o($VA1,$VW3),{121:[1,3506]},{19:[1,3509],21:[1,3512],22:3508,87:3507,214:3510,215:[1,3511]},o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$Vq5),o($Vr1,$Vr5),{19:$Vj7,21:$Vk7,22:3514,87:3513,214:2350,215:$Vl7},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$Vq5),o($Vt1,$Vr5),{19:$Vm7,21:$Vn7,22:3516,87:3515,214:2376,215:$Vo7},o($VA1,$VW5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$Vq5),o($VD1,$Vr5),{19:$Vp7,21:$Vq7,22:3518,87:3517,214:2403,215:$Vr7},o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$Vq5),o($Vr1,$Vr5),{19:$Vs7,21:$Vt7,22:3520,87:3519,214:2430,215:$Vu7},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$Vq5),o($Vt1,$Vr5),{19:$Vv7,21:$Vw7,22:3522,87:3521,214:2456,215:$Vx7},o($VA1,$VW5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$Vq5),o($VD1,$Vr5),{19:$Vy7,21:$Vz7,22:3524,87:3523,214:2483,215:$VA7},o($VB3,$Vg6),o($VB3,$VK1),o($VC3,$Vg6),o($VC3,$VK1),o($VD3,$Vg6),o($VD3,$VK1),o($Vz3,$Vd2),o($Vz3,$Ve2),o($Vz3,$Vv1),o($Vz3,$Vw1),o($VC3,$Vs1,{82:3525}),o($Vz3,$VE1),o($Vz3,$VF1),{19:[1,3529],21:[1,3533],22:3527,33:3526,200:3528,214:3530,215:[1,3532],216:[1,3531]},{119:[1,3534],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($Vz3,$Vf2),o($Vz3,$Vg2),o($VC3,$Vs1,{82:3535}),o($VO4,$Vy1,{93:3536}),o($VC3,$Vz1,{99:2960,95:3537,101:$V$7,102:$VR,103:$VS,104:$VT}),o($VO4,$VG1),o($VO4,$VH1),o($VO4,$VI1),o($VO4,$VJ1),{100:[1,3538]},o($VO4,$VT1),{70:[1,3539]},o($VP4,$Vq2,{83:3540,84:3541,192:3542,190:[1,3543]}),o($VQ4,$Vq2,{83:3544,84:3545,192:3546,190:$VV8}),o($VB3,$Vt2,{99:2556,95:3548,101:$VE7,102:$VR,103:$VS,104:$VT}),o($VE3,$Vu2),o($VC3,$Vv2,{90:3549,95:3550,91:3551,99:3552,105:3554,107:3555,101:$VW8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VC3,$Vx2,{90:3549,95:3550,91:3551,99:3552,105:3554,107:3555,101:$VW8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VC3,$Vy2,{90:3549,95:3550,91:3551,99:3552,105:3554,107:3555,101:$VW8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VG3,$Vz2),o($VS4,$Vq2,{83:3556,84:3557,192:3558,190:[1,3559]}),o($V36,$VB2),o($V36,$Vw),o($V36,$Vx),o($V36,$Vn),o($V36,$Vo),o($V36,$Vy),o($V36,$Vp),o($V36,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,3560],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:3561,121:$VX2,148:$VY2,189:$VZ2}),o($VE3,$V33),o($VG3,$V43),o($VG3,$V53),o($VG3,$V63),o($VG3,$V73),{111:[1,3562]},o($VG3,$Vc3),o($VC3,$Vs5),{193:[1,3565],194:3563,195:[1,3564]},o($VB3,$V66),o($VB3,$V76),o($VB3,$V86),o($VB3,$Vn),o($VB3,$Vo),o($VB3,$VZ3),o($VB3,$V_3),o($VB3,$V$3),o($VB3,$Vp),o($VB3,$Vq),o($VB3,$V04),o($VB3,$V14,{202:3566,203:3567,111:[1,3568]}),o($VB3,$V24),o($VB3,$V34),o($VB3,$V44),o($VB3,$V54),o($VB3,$V64),o($VB3,$V74),o($VB3,$V84),o($VB3,$V94),o($VB3,$Va4),o($VB7,$V83),o($VB7,$V93),o($VB7,$Va3),o($VB7,$Vb3),{193:[1,3571],194:3569,195:[1,3570]},o($VC3,$V66),o($VC3,$V76),o($VC3,$V86),o($VC3,$Vn),o($VC3,$Vo),o($VC3,$VZ3),o($VC3,$V_3),o($VC3,$V$3),o($VC3,$Vp),o($VC3,$Vq),o($VC3,$V04),o($VC3,$V14,{202:3572,203:3573,111:[1,3574]}),o($VC3,$V24),o($VC3,$V34),o($VC3,$V44),o($VC3,$V54),o($VC3,$V64),o($VC3,$V74),o($VC3,$V84),o($VC3,$V94),o($VC3,$Va4),o($VC7,$V83),o($VC7,$V93),o($VC7,$Va3),o($VC7,$Vb3),{19:[1,3577],21:[1,3580],22:3576,87:3575,214:3578,215:[1,3579]},{193:[1,3583],194:3581,195:[1,3582]},o($VD3,$V66),o($VD3,$V76),o($VD3,$V86),o($VD3,$Vn),o($VD3,$Vo),o($VD3,$VZ3),o($VD3,$V_3),o($VD3,$V$3),o($VD3,$Vp),o($VD3,$Vq),o($VD3,$V04),o($VD3,$V14,{202:3584,203:3585,111:[1,3586]}),o($VD3,$V24),o($VD3,$V34),o($VD3,$V44),o($VD3,$V54),o($VD3,$V64),o($VD3,$V74),o($VD3,$V84),o($VD3,$V94),o($VD3,$Va4),o($VD7,$V83),o($VD7,$V93),o($VD7,$Va3),o($VD7,$Vb3),o($VC3,$Vs5),{193:[1,3589],194:3587,195:[1,3588]},o($VB3,$V66),o($VB3,$V76),o($VB3,$V86),o($VB3,$Vn),o($VB3,$Vo),o($VB3,$VZ3),o($VB3,$V_3),o($VB3,$V$3),o($VB3,$Vp),o($VB3,$Vq),o($VB3,$V04),o($VB3,$V14,{202:3590,203:3591,111:[1,3592]}),o($VB3,$V24),o($VB3,$V34),o($VB3,$V44),o($VB3,$V54),o($VB3,$V64),o($VB3,$V74),o($VB3,$V84),o($VB3,$V94),o($VB3,$Va4),o($VB7,$V83),o($VB7,$V93),o($VB7,$Va3),o($VB7,$Vb3),{193:[1,3595],194:3593,195:[1,3594]},o($VC3,$V66),o($VC3,$V76),o($VC3,$V86),o($VC3,$Vn),o($VC3,$Vo),o($VC3,$VZ3),o($VC3,$V_3),o($VC3,$V$3),o($VC3,$Vp),o($VC3,$Vq),o($VC3,$V04),o($VC3,$V14,{202:3596,203:3597,111:[1,3598]}),o($VC3,$V24),o($VC3,$V34),o($VC3,$V44),o($VC3,$V54),o($VC3,$V64),o($VC3,$V74),o($VC3,$V84),o($VC3,$V94),o($VC3,$Va4),o($VC7,$V83),o($VC7,$V93),o($VC7,$Va3),o($VC7,$Vb3),{19:[1,3601],21:[1,3604],22:3600,87:3599,214:3602,215:[1,3603]},{193:[1,3607],194:3605,195:[1,3606]},o($VD3,$V66),o($VD3,$V76),o($VD3,$V86),o($VD3,$Vn),o($VD3,$Vo),o($VD3,$VZ3),o($VD3,$V_3),o($VD3,$V$3),o($VD3,$Vp),o($VD3,$Vq),o($VD3,$V04),o($VD3,$V14,{202:3608,203:3609,111:[1,3610]}),o($VD3,$V24),o($VD3,$V34),o($VD3,$V44),o($VD3,$V54),o($VD3,$V64),o($VD3,$V74),o($VD3,$V84),o($VD3,$V94),o($VD3,$Va4),o($VD7,$V83),o($VD7,$V93),o($VD7,$Va3),o($VD7,$Vb3),o($Vp4,$VX8),o($V_6,$VK3),o($Vp4,$VL3,{31:3611,193:[1,3612]}),{19:$VM3,21:$VN3,22:662,129:3613,199:$VO3,214:665,215:$VP3},o($V67,$VY8),o($V87,$V97,{60:3614}),o($VI,$VJ,{63:3615,73:3616,75:3617,76:3618,92:3621,94:3622,87:3624,88:3625,89:3626,78:3627,39:3628,95:3632,22:3633,91:3635,118:3636,99:3640,214:3643,105:3644,107:3645,19:[1,3642],21:[1,3647],69:[1,3619],71:[1,3620],79:[1,3637],80:[1,3638],81:[1,3639],85:[1,3623],96:[1,3629],97:[1,3630],98:[1,3631],101:$VZ8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,3634],215:[1,3646]}),o($V87,$V_8),o($VI,$VJ,{63:3648,73:3649,75:3650,76:3651,92:3654,94:3655,87:3657,88:3658,89:3659,78:3660,39:3661,95:3665,22:3666,91:3668,118:3669,99:3673,214:3676,105:3677,107:3678,19:[1,3675],21:[1,3680],69:[1,3652],71:[1,3653],79:[1,3670],80:[1,3671],81:[1,3672],85:[1,3656],96:[1,3662],97:[1,3663],98:[1,3664],101:$V$8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,3667],215:[1,3679]}),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:3681,121:$VX2,148:$VY2,189:$VZ2}),o($V87,$VB2),o($V87,$Vw),o($V87,$Vx),o($V87,$Vn),o($V87,$Vo),o($V87,$Vy),o($V87,$Vp),o($V87,$Vq),o($V87,$Vt2,{99:2639,95:3682,101:$VP7,102:$VR,103:$VS,104:$VT}),o($Vp8,$Vu2),o($Vp8,$V33),o($V87,$V09),o($VR7,$VR3),o($VT7,$VS3),o($VT7,$VT3),o($VT7,$VU3),{100:[1,3683]},o($VT7,$VT1),{100:[1,3685],106:3684,108:[1,3686],109:[1,3687],110:3688,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,3689]},o($VT7,$VW3),{121:[1,3690]},{19:[1,3693],21:[1,3696],22:3692,87:3691,214:3694,215:[1,3695]},o($Vp4,$V19),o($Vr8,$Vs1,{82:3697}),o($Vr8,$VF7),o($Vr8,$VG7),o($Vr8,$VH7),o($Vr8,$VI7),o($Vr8,$VJ7),o($Vw8,$VK7,{57:3698,51:[1,3699]}),o($Vx8,$VL7,{61:3700,53:[1,3701]}),o($Vy8,$VM7),o($Vy8,$VN7,{74:3702,76:3703,78:3704,39:3705,118:3706,79:[1,3707],80:[1,3708],81:[1,3709],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($Vy8,$VO7),o($Vy8,$VN5,{77:3710,73:3711,92:3712,94:3713,95:3717,99:3718,96:[1,3714],97:[1,3715],98:[1,3716],101:$V29,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:3720,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vy8,$VQ7),o($V39,$Vy1,{93:3721}),o($V49,$Vz1,{99:3216,95:3722,101:$Vz8,102:$VR,103:$VS,104:$VT}),o($V59,$VB1,{86:3723}),o($V59,$VB1,{86:3724}),o($V59,$VB1,{86:3725}),o($Vy8,$VC1,{105:3220,107:3221,91:3726,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V69,$VT5),o($V69,$VU5),o($V39,$VG1),o($V39,$VH1),o($V39,$VI1),o($V39,$VJ1),o($V59,$VK1),o($VL1,$VM1,{162:3727}),o($V79,$VO1),{119:[1,3728],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($V69,$VE1),o($V69,$VF1),{19:[1,3732],21:[1,3736],22:3730,33:3729,200:3731,214:3733,215:[1,3735],216:[1,3734]},{100:[1,3737]},o($V39,$VT1),o($V59,$Vn),o($V59,$Vo),{100:[1,3739],106:3738,108:[1,3740],109:[1,3741],110:3742,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,3743]},o($V59,$Vp),o($V59,$Vq),o($Vr8,$Vs1,{82:3744}),o($Vs4,$Vb7),o($VI,$VJ,{92:742,94:743,95:753,99:761,226:3745,73:3746,75:3747,76:3748,87:3752,88:3753,89:3754,78:3755,39:3756,22:3757,91:3759,118:3760,214:3765,105:3766,107:3767,19:[1,3764],21:[1,3769],69:[1,3749],71:[1,3750],79:[1,3761],80:[1,3762],81:[1,3763],85:[1,3751],96:$Vu4,97:$Vv4,98:$Vw4,101:$Vx4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,3758],215:[1,3768]}),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:3770,121:$VX2,148:$VY2,189:$VZ2}),o($Vs4,$VB2),o($Vs4,$Vw),o($Vs4,$Vx),o($Vs4,$Vn),o($Vs4,$Vo),o($Vs4,$Vy),o($Vs4,$Vp),o($Vs4,$Vq),o($Vs4,$Vt2,{99:2689,95:3771,101:$VW7,102:$VR,103:$VS,104:$VT}),o($Vw6,$Vu2),o($Vw6,$V33),o($Vs4,$Vc7),o($VR5,$VS3),o($VR5,$VT3),o($VR5,$VU3),{100:[1,3772]},o($VR5,$VT1),{100:[1,3774],106:3773,108:[1,3775],109:[1,3776],110:3777,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,3778]},o($VR5,$VW3),{121:[1,3779]},{19:[1,3782],21:[1,3785],22:3781,87:3780,214:3783,215:[1,3784]},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:3786,121:$VX2,148:$VY2,189:$VZ2}),o($Vs4,$VB2),o($Vs4,$Vw),o($Vs4,$Vx),o($Vs4,$Vn),o($Vs4,$Vo),o($Vs4,$Vy),o($Vs4,$Vp),o($Vs4,$Vq),o($Vs4,$Vt2,{99:2727,95:3787,101:$VX7,102:$VR,103:$VS,104:$VT}),o($Vw6,$Vu2),o($Vw6,$V33),o($Vs4,$Vc7),o($VR5,$VS3),o($VR5,$VT3),o($VR5,$VU3),{100:[1,3788]},o($VR5,$VT1),{100:[1,3790],106:3789,108:[1,3791],109:[1,3792],110:3793,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,3794]},o($VR5,$VW3),{121:[1,3795]},{19:[1,3798],21:[1,3801],22:3797,87:3796,214:3799,215:[1,3800]},o($VR5,$VW5),o($VR5,$VK1),o($VR5,$Vn),o($VR5,$Vo),o($VR5,$Vp),o($VR5,$Vq),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:3802}),o($VG,$VE1),o($VG,$VF1),{19:[1,3806],21:[1,3810],22:3804,33:3803,200:3805,214:3807,215:[1,3809],216:[1,3808]},{119:[1,3811],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:3812}),o($Vh2,$Vy1,{93:3813}),o($Vt1,$Vz1,{99:3297,95:3814,101:$VC8,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,3815]},o($Vh2,$VT1),{70:[1,3816]},o($Vp2,$Vq2,{83:3817,84:3818,192:3819,190:[1,3820]}),o($Vr2,$Vq2,{83:3821,84:3822,192:3823,190:$V89}),o($Vr1,$Vt2,{99:2782,95:3825,101:$VY7,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vu2),o($Vt1,$Vv2,{90:3826,95:3827,91:3828,99:3829,105:3831,107:3832,101:$V99,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:3826,95:3827,91:3828,99:3829,105:3831,107:3832,101:$V99,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vy2,{90:3826,95:3827,91:3828,99:3829,105:3831,107:3832,101:$V99,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vz2),o($VA2,$Vq2,{83:3833,84:3834,192:3835,190:[1,3836]}),o($Vu1,$VB2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,3837],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:3838,121:$VX2,148:$VY2,189:$VZ2}),o($Vx1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),o($VN1,$V73),{111:[1,3839]},o($VN1,$Vc3),o($Vt1,$Vs5),{193:[1,3842],194:3840,195:[1,3841]},o($Vr1,$V66),o($Vr1,$V76),o($Vr1,$V86),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V04),o($Vr1,$V14,{202:3843,203:3844,111:[1,3845]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($V96,$V83),o($V96,$V93),o($V96,$Va3),o($V96,$Vb3),{193:[1,3848],194:3846,195:[1,3847]},o($Vt1,$V66),o($Vt1,$V76),o($Vt1,$V86),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V04),o($Vt1,$V14,{202:3849,203:3850,111:[1,3851]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($Va6,$Vb3),{19:[1,3854],21:[1,3857],22:3853,87:3852,214:3855,215:[1,3856]},{193:[1,3860],194:3858,195:[1,3859]},o($VD1,$V66),o($VD1,$V76),o($VD1,$V86),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V04),o($VD1,$V14,{202:3861,203:3862,111:[1,3863]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vb6,$V83),o($Vb6,$V93),o($Vb6,$Va3),o($Vb6,$Vb3),o($Vt1,$Vs5),{193:[1,3866],194:3864,195:[1,3865]},o($Vr1,$V66),o($Vr1,$V76),o($Vr1,$V86),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V04),o($Vr1,$V14,{202:3867,203:3868,111:[1,3869]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($V96,$V83),o($V96,$V93),o($V96,$Va3),o($V96,$Vb3),{193:[1,3872],194:3870,195:[1,3871]},o($Vt1,$V66),o($Vt1,$V76),o($Vt1,$V86),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V04),o($Vt1,$V14,{202:3873,203:3874,111:[1,3875]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($Va6,$Vb3),{19:[1,3878],21:[1,3881],22:3877,87:3876,214:3879,215:[1,3880]},{193:[1,3884],194:3882,195:[1,3883]},o($VD1,$V66),o($VD1,$V76),o($VD1,$V86),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V04),o($VD1,$V14,{202:3885,203:3886,111:[1,3887]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vb6,$V83),o($Vb6,$V93),o($Vb6,$Va3),o($Vb6,$Vb3),o($VG,$VV3),{121:[1,3888]},o($VG,$VJ3),o($Vh2,$VR3),o($Vp2,$VW4),{19:$Vi,21:$Vj,22:3889,214:45,215:$Vk},{19:$Va9,21:$Vb9,22:3891,100:[1,3902],108:[1,3903],109:[1,3904],110:3901,181:3892,191:3890,196:3895,197:3896,198:3897,201:3900,204:[1,3905],205:[1,3906],206:[1,3911],207:[1,3912],208:[1,3913],209:[1,3914],210:[1,3907],211:[1,3908],212:[1,3909],213:[1,3910],214:3894,215:$Vc9},o($Vr2,$VW4),{19:$Vi,21:$Vj,22:3915,214:45,215:$Vk},{19:$Vd9,21:$Ve9,22:3917,100:[1,3928],108:[1,3929],109:[1,3930],110:3927,181:3918,191:3916,196:3921,197:3922,198:3923,201:3926,204:[1,3931],205:[1,3932],206:[1,3937],207:[1,3938],208:[1,3939],209:[1,3940],210:[1,3933],211:[1,3934],212:[1,3935],213:[1,3936],214:3920,215:$Vf9},o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),o($VA1,$V73),{111:[1,3941]},o($VA1,$Vc3),o($VA2,$VW4),{19:$Vi,21:$Vj,22:3942,214:45,215:$Vk},{19:$Vg9,21:$Vh9,22:3944,100:[1,3955],108:[1,3956],109:[1,3957],110:3954,181:3945,191:3943,196:3948,197:3949,198:3950,201:3953,204:[1,3958],205:[1,3959],206:[1,3964],207:[1,3965],208:[1,3966],209:[1,3967],210:[1,3960],211:[1,3961],212:[1,3962],213:[1,3963],214:3947,215:$Vi9},o($VD1,$Vs5),o($VN1,$VW5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($Vr1,$Vg6),o($Vr1,$VK1),o($Vt1,$Vg6),o($Vt1,$VK1),o($VD1,$Vg6),o($VD1,$VK1),o($Vr1,$Vg6),o($Vr1,$VK1),o($Vt1,$Vg6),o($Vt1,$VK1),o($VD1,$Vg6),o($VD1,$VK1),o($VQ4,$Vq2,{84:3545,192:3546,83:3968,190:$VV8}),o($Vz3,$VB2),o($Vz3,$Vw),o($Vz3,$Vx),o($Vz3,$Vn),o($Vz3,$Vo),o($Vz3,$Vy),o($Vz3,$Vp),o($Vz3,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:3969,121:$VX2,148:$VY2,189:$VZ2}),o($VQ4,$Vq2,{84:3545,192:3546,83:3970,190:$VV8}),o($VC3,$Vt2,{99:2960,95:3971,101:$V$7,102:$VR,103:$VS,104:$VT}),o($VO4,$Vu2),o($VO4,$V33),o($Vz3,$Vy3),o($V26,$VJ3),o($VB3,$VK3),o($V26,$VL3,{31:3972,193:[1,3973]}),{19:$VM3,21:$VN3,22:662,129:3974,199:$VO3,214:665,215:$VP3},o($Vz3,$VQ3),o($VC3,$VK3),o($Vz3,$VL3,{31:3975,193:[1,3976]}),{19:$VM3,21:$VN3,22:662,129:3977,199:$VO3,214:665,215:$VP3},o($VE3,$VR3),o($VF3,$VS3),o($VF3,$VT3),o($VF3,$VU3),{100:[1,3978]},o($VF3,$VT1),{100:[1,3980],106:3979,108:[1,3981],109:[1,3982],110:3983,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,3984]},o($V36,$VV3),o($VD3,$VK3),o($V36,$VL3,{31:3985,193:[1,3986]}),{19:$VM3,21:$VN3,22:662,129:3987,199:$VO3,214:665,215:$VP3},o($VF3,$VW3),{121:[1,3988]},{19:[1,3991],21:[1,3994],22:3990,87:3989,214:3992,215:[1,3993]},o($VP4,$V41),o($VP4,$V51),o($VP4,$V61),o($VB3,$Vq5),o($VB3,$Vr5),{19:$V08,21:$V18,22:3996,87:3995,214:2995,215:$V28},o($VQ4,$V41),o($VQ4,$V51),o($VQ4,$V61),o($VC3,$Vq5),o($VC3,$Vr5),{19:$V38,21:$V48,22:3998,87:3997,214:3021,215:$V58},o($VF3,$VW5),o($VF3,$VK1),o($VF3,$Vn),o($VF3,$Vo),o($VF3,$Vp),o($VF3,$Vq),o($VS4,$V41),o($VS4,$V51),o($VS4,$V61),o($VD3,$Vq5),o($VD3,$Vr5),{19:$V68,21:$V78,22:4000,87:3999,214:3048,215:$V88},o($VP4,$V41),o($VP4,$V51),o($VP4,$V61),o($VB3,$Vq5),o($VB3,$Vr5),{19:$V98,21:$Va8,22:4002,87:4001,214:3075,215:$Vb8},o($VQ4,$V41),o($VQ4,$V51),o($VQ4,$V61),o($VC3,$Vq5),o($VC3,$Vr5),{19:$Vc8,21:$Vd8,22:4004,87:4003,214:3101,215:$Ve8},o($VF3,$VW5),o($VF3,$VK1),o($VF3,$Vn),o($VF3,$Vo),o($VF3,$Vp),o($VF3,$Vq),o($VS4,$V41),o($VS4,$V51),o($VS4,$V61),o($VD3,$Vq5),o($VD3,$Vr5),{19:$Vf8,21:$Vg8,22:4006,87:4005,214:3128,215:$Vh8},o($Vi8,$VW4),{19:$Vi,21:$Vj,22:4007,214:45,215:$Vk},{19:$Vj9,21:$Vk9,22:4009,100:[1,4020],108:[1,4021],109:[1,4022],110:4019,181:4010,191:4008,196:4013,197:4014,198:4015,201:4018,204:[1,4023],205:[1,4024],206:[1,4029],207:[1,4030],208:[1,4031],209:[1,4032],210:[1,4025],211:[1,4026],212:[1,4027],213:[1,4028],214:4012,215:$Vl9},o($V67,$VL7,{61:4033,53:[1,4034]}),o($V87,$VM7),o($V87,$VN7,{74:4035,76:4036,78:4037,39:4038,118:4039,79:[1,4040],80:[1,4041],81:[1,4042],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($V87,$VO7),o($V87,$VN5,{77:4043,73:4044,92:4045,94:4046,95:4050,99:4051,96:[1,4047],97:[1,4048],98:[1,4049],101:$Vm9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:4053,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($V87,$VQ7),o($VR7,$Vy1,{93:4054}),o($VS7,$Vz1,{99:3640,95:4055,101:$VZ8,102:$VR,103:$VS,104:$VT}),o($VT7,$VB1,{86:4056}),o($VT7,$VB1,{86:4057}),o($VT7,$VB1,{86:4058}),o($V87,$VC1,{105:3644,107:3645,91:4059,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VU7,$VT5),o($VU7,$VU5),o($VR7,$VG1),o($VR7,$VH1),o($VR7,$VI1),o($VR7,$VJ1),o($VT7,$VK1),o($VL1,$VM1,{162:4060}),o($VV7,$VO1),{119:[1,4061],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($VU7,$VE1),o($VU7,$VF1),{19:[1,4065],21:[1,4069],22:4063,33:4062,200:4064,214:4066,215:[1,4068],216:[1,4067]},{100:[1,4070]},o($VR7,$VT1),o($VT7,$Vn),o($VT7,$Vo),{100:[1,4072],106:4071,108:[1,4073],109:[1,4074],110:4075,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4076]},o($VT7,$Vp),o($VT7,$Vq),o($V87,$VM7),o($V87,$VN7,{74:4077,76:4078,78:4079,39:4080,118:4081,79:[1,4082],80:[1,4083],81:[1,4084],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($V87,$VO7),o($V87,$VN5,{77:4085,73:4086,92:4087,94:4088,95:4092,99:4093,96:[1,4089],97:[1,4090],98:[1,4091],101:$Vn9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:4095,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($V87,$VQ7),o($VR7,$Vy1,{93:4096}),o($VS7,$Vz1,{99:3673,95:4097,101:$V$8,102:$VR,103:$VS,104:$VT}),o($VT7,$VB1,{86:4098}),o($VT7,$VB1,{86:4099}),o($VT7,$VB1,{86:4100}),o($V87,$VC1,{105:3677,107:3678,91:4101,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VU7,$VT5),o($VU7,$VU5),o($VR7,$VG1),o($VR7,$VH1),o($VR7,$VI1),o($VR7,$VJ1),o($VT7,$VK1),o($VL1,$VM1,{162:4102}),o($VV7,$VO1),{119:[1,4103],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($VU7,$VE1),o($VU7,$VF1),{19:[1,4107],21:[1,4111],22:4105,33:4104,200:4106,214:4108,215:[1,4110],216:[1,4109]},{100:[1,4112]},o($VR7,$VT1),o($VT7,$Vn),o($VT7,$Vo),{100:[1,4114],106:4113,108:[1,4115],109:[1,4116],110:4117,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4118]},o($VT7,$Vp),o($VT7,$Vq),{121:[1,4119]},o($Vp8,$VR3),o($VT7,$V33),o($VT7,$V43),o($VT7,$V53),o($VT7,$V63),o($VT7,$V73),{111:[1,4120]},o($VT7,$Vc3),o($VU7,$Vs5),o($VV7,$VW5),o($VV7,$VK1),o($VV7,$Vn),o($VV7,$Vo),o($VV7,$Vp),o($VV7,$Vq),o($Vo9,$Vq2,{83:4121,84:4122,192:4123,190:$Vp9}),o($Vx8,$Vk8),o($Vr,$Vs,{55:4125,59:4126,41:4127,44:$Vt}),o($Vy8,$Vl8),o($Vr,$Vs,{59:4128,41:4129,44:$Vt}),o($Vy8,$Vm8),o($Vy8,$Vn8),o($Vy8,$VT5),o($Vy8,$VU5),{119:[1,4130],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($Vy8,$VE1),o($Vy8,$VF1),{19:[1,4134],21:[1,4138],22:4132,33:4131,200:4133,214:4135,215:[1,4137],216:[1,4136]},o($Vy8,$Vo8),o($Vy8,$Vv6),o($Vq9,$Vy1,{93:4139}),o($Vy8,$Vz1,{99:3718,95:4140,101:$V29,102:$VR,103:$VS,104:$VT}),o($Vq9,$VG1),o($Vq9,$VH1),o($Vq9,$VI1),o($Vq9,$VJ1),{100:[1,4141]},o($Vq9,$VT1),{70:[1,4142]},o($V49,$Vt2,{99:3216,95:4143,101:$Vz8,102:$VR,103:$VS,104:$VT}),o($V39,$Vu2),o($Vy8,$Vv2,{90:4144,95:4145,91:4146,99:4147,105:4149,107:4150,101:$Vr9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vy8,$Vx2,{90:4144,95:4145,91:4146,99:4147,105:4149,107:4150,101:$Vr9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vy8,$Vy2,{90:4144,95:4145,91:4146,99:4147,105:4149,107:4150,101:$Vr9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V79,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,4151],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:4152,121:$VX2,148:$VY2,189:$VZ2}),o($V69,$VB2),o($V69,$Vw),o($V69,$Vx),o($V69,$Vn),o($V69,$Vo),o($V69,$Vy),o($V69,$Vp),o($V69,$Vq),o($V39,$V33),o($V79,$V43),o($V79,$V53),o($V79,$V63),o($V79,$V73),{111:[1,4153]},o($V79,$Vc3),o($Vo9,$Vq2,{84:4122,192:4123,83:4154,190:$Vp9}),o($Vs4,$VL5),o($VI,$VJ,{76:4155,78:4156,39:4157,118:4158,79:[1,4159],80:[1,4160],81:[1,4161]}),o($Vs4,$VM5),o($Vs4,$VN5,{77:4162,73:4163,92:4164,94:4165,95:4169,99:4170,96:[1,4166],97:[1,4167],98:[1,4168],101:$Vs9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:4172,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vs4,$VP5),o($VR5,$VB1,{86:4173}),o($VR5,$VB1,{86:4174}),o($VR5,$VB1,{86:4175}),o($Vs4,$VC1,{105:3766,107:3767,91:4176,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VS5,$VT5),o($VS5,$VU5),o($VR5,$VK1),o($VL1,$VM1,{162:4177}),o($VV5,$VO1),{119:[1,4178],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($VS5,$VE1),o($VS5,$VF1),{19:[1,4182],21:[1,4186],22:4180,33:4179,200:4181,214:4183,215:[1,4185],216:[1,4184]},o($VR5,$Vn),o($VR5,$Vo),{100:[1,4188],106:4187,108:[1,4189],109:[1,4190],110:4191,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4192]},o($VR5,$Vp),o($VR5,$Vq),{121:[1,4193]},o($Vw6,$VR3),o($VR5,$V33),o($VR5,$V43),o($VR5,$V53),o($VR5,$V63),o($VR5,$V73),{111:[1,4194]},o($VR5,$Vc3),o($VS5,$Vs5),o($VV5,$VW5),o($VV5,$VK1),o($VV5,$Vn),o($VV5,$Vo),o($VV5,$Vp),o($VV5,$Vq),{121:[1,4195]},o($Vw6,$VR3),o($VR5,$V33),o($VR5,$V43),o($VR5,$V53),o($VR5,$V63),o($VR5,$V73),{111:[1,4196]},o($VR5,$Vc3),o($VS5,$Vs5),o($VV5,$VW5),o($VV5,$VK1),o($VV5,$Vn),o($VV5,$Vo),o($VV5,$Vp),o($VV5,$Vq),o($Vr2,$Vq2,{84:3822,192:3823,83:4197,190:$V89}),o($VG,$VB2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:4198,121:$VX2,148:$VY2,189:$VZ2}),o($Vr2,$Vq2,{84:3822,192:3823,83:4199,190:$V89}),o($Vt1,$Vt2,{99:3297,95:4200,101:$VC8,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vu2),o($Vh2,$V33),o($VG,$Vy3),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:4201,193:[1,4202]}),{19:$VM3,21:$VN3,22:662,129:4203,199:$VO3,214:665,215:$VP3},o($VG,$VQ3),o($Vt1,$VK3),o($VG,$VL3,{31:4204,193:[1,4205]}),{19:$VM3,21:$VN3,22:662,129:4206,199:$VO3,214:665,215:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{100:[1,4207]},o($VA1,$VT1),{100:[1,4209],106:4208,108:[1,4210],109:[1,4211],110:4212,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4213]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:4214,193:[1,4215]}),{19:$VM3,21:$VN3,22:662,129:4216,199:$VO3,214:665,215:$VP3},o($VA1,$VW3),{121:[1,4217]},{19:[1,4220],21:[1,4223],22:4219,87:4218,214:4221,215:[1,4222]},o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$Vq5),o($Vr1,$Vr5),{19:$VD8,21:$VE8,22:4225,87:4224,214:3332,215:$VF8},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$Vq5),o($Vt1,$Vr5),{19:$VG8,21:$VH8,22:4227,87:4226,214:3358,215:$VI8},o($VA1,$VW5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$Vq5),o($VD1,$Vr5),{19:$VJ8,21:$VK8,22:4229,87:4228,214:3385,215:$VL8},o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$Vq5),o($Vr1,$Vr5),{19:$VM8,21:$VN8,22:4231,87:4230,214:3412,215:$VO8},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$Vq5),o($Vt1,$Vr5),{19:$VP8,21:$VQ8,22:4233,87:4232,214:3438,215:$VR8},o($VA1,$VW5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$Vq5),o($VD1,$Vr5),{19:$VS8,21:$VT8,22:4235,87:4234,214:3465,215:$VU8},o($Vt1,$Vs5),{193:[1,4238],194:4236,195:[1,4237]},o($Vr1,$V66),o($Vr1,$V76),o($Vr1,$V86),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V04),o($Vr1,$V14,{202:4239,203:4240,111:[1,4241]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($V96,$V83),o($V96,$V93),o($V96,$Va3),o($V96,$Vb3),{193:[1,4244],194:4242,195:[1,4243]},o($Vt1,$V66),o($Vt1,$V76),o($Vt1,$V86),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V04),o($Vt1,$V14,{202:4245,203:4246,111:[1,4247]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($Va6,$Vb3),{19:[1,4250],21:[1,4253],22:4249,87:4248,214:4251,215:[1,4252]},{193:[1,4256],194:4254,195:[1,4255]},o($VD1,$V66),o($VD1,$V76),o($VD1,$V86),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V04),o($VD1,$V14,{202:4257,203:4258,111:[1,4259]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vb6,$V83),o($Vb6,$V93),o($Vb6,$Va3),o($Vb6,$Vb3),o($Vz3,$VV3),{121:[1,4260]},o($Vz3,$VJ3),o($VO4,$VR3),o($VP4,$VW4),{19:$Vi,21:$Vj,22:4261,214:45,215:$Vk},{19:$Vt9,21:$Vu9,22:4263,100:[1,4274],108:[1,4275],109:[1,4276],110:4273,181:4264,191:4262,196:4267,197:4268,198:4269,201:4272,204:[1,4277],205:[1,4278],206:[1,4283],207:[1,4284],208:[1,4285],209:[1,4286],210:[1,4279],211:[1,4280],212:[1,4281],213:[1,4282],214:4266,215:$Vv9},o($VQ4,$VW4),{19:$Vi,21:$Vj,22:4287,214:45,215:$Vk},{19:$Vw9,21:$Vx9,22:4289,100:[1,4300],108:[1,4301],109:[1,4302],110:4299,181:4290,191:4288,196:4293,197:4294,198:4295,201:4298,204:[1,4303],205:[1,4304],206:[1,4309],207:[1,4310],208:[1,4311],209:[1,4312],210:[1,4305],211:[1,4306],212:[1,4307],213:[1,4308],214:4292,215:$Vy9},o($VF3,$V33),o($VF3,$V43),o($VF3,$V53),o($VF3,$V63),o($VF3,$V73),{111:[1,4313]},o($VF3,$Vc3),o($VS4,$VW4),{19:$Vi,21:$Vj,22:4314,214:45,215:$Vk},{19:$Vz9,21:$VA9,22:4316,100:[1,4327],108:[1,4328],109:[1,4329],110:4326,181:4317,191:4315,196:4320,197:4321,198:4322,201:4325,204:[1,4330],205:[1,4331],206:[1,4336],207:[1,4337],208:[1,4338],209:[1,4339],210:[1,4332],211:[1,4333],212:[1,4334],213:[1,4335],214:4319,215:$VB9},o($VD3,$Vs5),o($VG3,$VW5),o($VG3,$VK1),o($VG3,$Vn),o($VG3,$Vo),o($VG3,$Vp),o($VG3,$Vq),o($VB3,$Vg6),o($VB3,$VK1),o($VC3,$Vg6),o($VC3,$VK1),o($VD3,$Vg6),o($VD3,$VK1),o($VB3,$Vg6),o($VB3,$VK1),o($VC3,$Vg6),o($VC3,$VK1),o($VD3,$Vg6),o($VD3,$VK1),{193:[1,4342],194:4340,195:[1,4341]},o($V_6,$V66),o($V_6,$V76),o($V_6,$V86),o($V_6,$Vn),o($V_6,$Vo),o($V_6,$VZ3),o($V_6,$V_3),o($V_6,$V$3),o($V_6,$Vp),o($V_6,$Vq),o($V_6,$V04),o($V_6,$V14,{202:4343,203:4344,111:[1,4345]}),o($V_6,$V24),o($V_6,$V34),o($V_6,$V44),o($V_6,$V54),o($V_6,$V64),o($V_6,$V74),o($V_6,$V84),o($V_6,$V94),o($V_6,$Va4),o($VC9,$V83),o($VC9,$V93),o($VC9,$Va3),o($VC9,$Vb3),o($V87,$Vl8),o($Vr,$Vs,{59:4346,41:4347,44:$Vt}),o($V87,$Vm8),o($V87,$Vn8),o($V87,$VT5),o($V87,$VU5),{119:[1,4348],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($V87,$VE1),o($V87,$VF1),{19:[1,4352],21:[1,4356],22:4350,33:4349,200:4351,214:4353,215:[1,4355],216:[1,4354]},o($V87,$Vo8),o($V87,$Vv6),o($Vp8,$Vy1,{93:4357}),o($V87,$Vz1,{99:4051,95:4358,101:$Vm9,102:$VR,103:$VS,104:$VT}),o($Vp8,$VG1),o($Vp8,$VH1),o($Vp8,$VI1),o($Vp8,$VJ1),{100:[1,4359]},o($Vp8,$VT1),{70:[1,4360]},o($VS7,$Vt2,{99:3640,95:4361,101:$VZ8,102:$VR,103:$VS,104:$VT}),o($VR7,$Vu2),o($V87,$Vv2,{90:4362,95:4363,91:4364,99:4365,105:4367,107:4368,101:$VD9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V87,$Vx2,{90:4362,95:4363,91:4364,99:4365,105:4367,107:4368,101:$VD9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V87,$Vy2,{90:4362,95:4363,91:4364,99:4365,105:4367,107:4368,101:$VD9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VV7,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,4369],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:4370,121:$VX2,148:$VY2,189:$VZ2}),o($VU7,$VB2),o($VU7,$Vw),o($VU7,$Vx),o($VU7,$Vn),o($VU7,$Vo),o($VU7,$Vy),o($VU7,$Vp),o($VU7,$Vq),o($VR7,$V33),o($VV7,$V43),o($VV7,$V53),o($VV7,$V63),o($VV7,$V73),{111:[1,4371]},o($VV7,$Vc3),o($V87,$Vm8),o($V87,$Vn8),o($V87,$VT5),o($V87,$VU5),{119:[1,4372],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($V87,$VE1),o($V87,$VF1),{19:[1,4376],21:[1,4380],22:4374,33:4373,200:4375,214:4377,215:[1,4379],216:[1,4378]},o($V87,$Vo8),o($V87,$Vv6),o($Vp8,$Vy1,{93:4381}),o($V87,$Vz1,{99:4093,95:4382,101:$Vn9,102:$VR,103:$VS,104:$VT}),o($Vp8,$VG1),o($Vp8,$VH1),o($Vp8,$VI1),o($Vp8,$VJ1),{100:[1,4383]},o($Vp8,$VT1),{70:[1,4384]},o($VS7,$Vt2,{99:3673,95:4385,101:$V$8,102:$VR,103:$VS,104:$VT}),o($VR7,$Vu2),o($V87,$Vv2,{90:4386,95:4387,91:4388,99:4389,105:4391,107:4392,101:$VE9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V87,$Vx2,{90:4386,95:4387,91:4388,99:4389,105:4391,107:4392,101:$VE9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V87,$Vy2,{90:4386,95:4387,91:4388,99:4389,105:4391,107:4392,101:$VE9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VV7,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,4393],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:4394,121:$VX2,148:$VY2,189:$VZ2}),o($VU7,$VB2),o($VU7,$Vw),o($VU7,$Vx),o($VU7,$Vn),o($VU7,$Vo),o($VU7,$Vy),o($VU7,$Vp),o($VU7,$Vq),o($VR7,$V33),o($VV7,$V43),o($VV7,$V53),o($VV7,$V63),o($VV7,$V73),{111:[1,4395]},o($VV7,$Vc3),o($V87,$Vs5),{19:[1,4398],21:[1,4401],22:4397,87:4396,214:4399,215:[1,4400]},o($Vr6,$VX8),o($Vr8,$VK3),o($Vr6,$VL3,{31:4402,193:[1,4403]}),{19:$VM3,21:$VN3,22:662,129:4404,199:$VO3,214:665,215:$VP3},o($Vx8,$VY8),o($Vy8,$V97,{60:4405}),o($VI,$VJ,{63:4406,73:4407,75:4408,76:4409,92:4412,94:4413,87:4415,88:4416,89:4417,78:4418,39:4419,95:4423,22:4424,91:4426,118:4427,99:4431,214:4434,105:4435,107:4436,19:[1,4433],21:[1,4438],69:[1,4410],71:[1,4411],79:[1,4428],80:[1,4429],81:[1,4430],85:[1,4414],96:[1,4420],97:[1,4421],98:[1,4422],101:$VF9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,4425],215:[1,4437]}),o($Vy8,$V_8),o($VI,$VJ,{63:4439,73:4440,75:4441,76:4442,92:4445,94:4446,87:4448,88:4449,89:4450,78:4451,39:4452,95:4456,22:4457,91:4459,118:4460,99:4464,214:4467,105:4468,107:4469,19:[1,4466],21:[1,4471],69:[1,4443],71:[1,4444],79:[1,4461],80:[1,4462],81:[1,4463],85:[1,4447],96:[1,4453],97:[1,4454],98:[1,4455],101:$VG9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,4458],215:[1,4470]}),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:4472,121:$VX2,148:$VY2,189:$VZ2}),o($Vy8,$VB2),o($Vy8,$Vw),o($Vy8,$Vx),o($Vy8,$Vn),o($Vy8,$Vo),o($Vy8,$Vy),o($Vy8,$Vp),o($Vy8,$Vq),o($Vy8,$Vt2,{99:3718,95:4473,101:$V29,102:$VR,103:$VS,104:$VT}),o($Vq9,$Vu2),o($Vq9,$V33),o($Vy8,$V09),o($V39,$VR3),o($V59,$VS3),o($V59,$VT3),o($V59,$VU3),{100:[1,4474]},o($V59,$VT1),{100:[1,4476],106:4475,108:[1,4477],109:[1,4478],110:4479,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4480]},o($V59,$VW3),{121:[1,4481]},{19:[1,4484],21:[1,4487],22:4483,87:4482,214:4485,215:[1,4486]},o($Vr6,$V19),o($Vs4,$Vt6),o($Vs4,$VT5),o($Vs4,$VU5),{119:[1,4488],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($Vs4,$VE1),o($Vs4,$VF1),{19:[1,4492],21:[1,4496],22:4490,33:4489,200:4491,214:4493,215:[1,4495],216:[1,4494]},o($Vs4,$Vu6),o($Vs4,$Vv6),o($Vw6,$Vy1,{93:4497}),o($Vs4,$Vz1,{99:4170,95:4498,101:$Vs9,102:$VR,103:$VS,104:$VT}),o($Vw6,$VG1),o($Vw6,$VH1),o($Vw6,$VI1),o($Vw6,$VJ1),{100:[1,4499]},o($Vw6,$VT1),{70:[1,4500]},o($Vs4,$Vv2,{90:4501,95:4502,91:4503,99:4504,105:4506,107:4507,101:$VH9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vs4,$Vx2,{90:4501,95:4502,91:4503,99:4504,105:4506,107:4507,101:$VH9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vs4,$Vy2,{90:4501,95:4502,91:4503,99:4504,105:4506,107:4507,101:$VH9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VV5,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,4508],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:4509,121:$VX2,148:$VY2,189:$VZ2}),o($VS5,$VB2),o($VS5,$Vw),o($VS5,$Vx),o($VS5,$Vn),o($VS5,$Vo),o($VS5,$Vy),o($VS5,$Vp),o($VS5,$Vq),o($VV5,$V43),o($VV5,$V53),o($VV5,$V63),o($VV5,$V73),{111:[1,4510]},o($VV5,$Vc3),o($Vs4,$Vs5),{19:[1,4513],21:[1,4516],22:4512,87:4511,214:4514,215:[1,4515]},o($Vs4,$Vs5),{19:[1,4519],21:[1,4522],22:4518,87:4517,214:4520,215:[1,4521]},o($VG,$VV3),{121:[1,4523]},o($VG,$VJ3),o($Vh2,$VR3),o($Vp2,$VW4),{19:$Vi,21:$Vj,22:4524,214:45,215:$Vk},{19:$VI9,21:$VJ9,22:4526,100:[1,4537],108:[1,4538],109:[1,4539],110:4536,181:4527,191:4525,196:4530,197:4531,198:4532,201:4535,204:[1,4540],205:[1,4541],206:[1,4546],207:[1,4547],208:[1,4548],209:[1,4549],210:[1,4542],211:[1,4543],212:[1,4544],213:[1,4545],214:4529,215:$VK9},o($Vr2,$VW4),{19:$Vi,21:$Vj,22:4550,214:45,215:$Vk},{19:$VL9,21:$VM9,22:4552,100:[1,4563],108:[1,4564],109:[1,4565],110:4562,181:4553,191:4551,196:4556,197:4557,198:4558,201:4561,204:[1,4566],205:[1,4567],206:[1,4572],207:[1,4573],208:[1,4574],209:[1,4575],210:[1,4568],211:[1,4569],212:[1,4570],213:[1,4571],214:4555,215:$VN9},o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),o($VA1,$V73),{111:[1,4576]},o($VA1,$Vc3),o($VA2,$VW4),{19:$Vi,21:$Vj,22:4577,214:45,215:$Vk},{19:$VO9,21:$VP9,22:4579,100:[1,4590],108:[1,4591],109:[1,4592],110:4589,181:4580,191:4578,196:4583,197:4584,198:4585,201:4588,204:[1,4593],205:[1,4594],206:[1,4599],207:[1,4600],208:[1,4601],209:[1,4602],210:[1,4595],211:[1,4596],212:[1,4597],213:[1,4598],214:4582,215:$VQ9},o($VD1,$Vs5),o($VN1,$VW5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($Vr1,$Vg6),o($Vr1,$VK1),o($Vt1,$Vg6),o($Vt1,$VK1),o($VD1,$Vg6),o($VD1,$VK1),o($Vr1,$Vg6),o($Vr1,$VK1),o($Vt1,$Vg6),o($Vt1,$VK1),o($VD1,$Vg6),o($VD1,$VK1),o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$Vq5),o($Vr1,$Vr5),{19:$Va9,21:$Vb9,22:4604,87:4603,214:3894,215:$Vc9},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$Vq5),o($Vt1,$Vr5),{19:$Vd9,21:$Ve9,22:4606,87:4605,214:3920,215:$Vf9},o($VA1,$VW5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$Vq5),o($VD1,$Vr5),{19:$Vg9,21:$Vh9,22:4608,87:4607,214:3947,215:$Vi9},o($VC3,$Vs5),{193:[1,4611],194:4609,195:[1,4610]},o($VB3,$V66),o($VB3,$V76),o($VB3,$V86),o($VB3,$Vn),o($VB3,$Vo),o($VB3,$VZ3),o($VB3,$V_3),o($VB3,$V$3),o($VB3,$Vp),o($VB3,$Vq),o($VB3,$V04),o($VB3,$V14,{202:4612,203:4613,111:[1,4614]}),o($VB3,$V24),o($VB3,$V34),o($VB3,$V44),o($VB3,$V54),o($VB3,$V64),o($VB3,$V74),o($VB3,$V84),o($VB3,$V94),o($VB3,$Va4),o($VB7,$V83),o($VB7,$V93),o($VB7,$Va3),o($VB7,$Vb3),{193:[1,4617],194:4615,195:[1,4616]},o($VC3,$V66),o($VC3,$V76),o($VC3,$V86),o($VC3,$Vn),o($VC3,$Vo),o($VC3,$VZ3),o($VC3,$V_3),o($VC3,$V$3),o($VC3,$Vp),o($VC3,$Vq),o($VC3,$V04),o($VC3,$V14,{202:4618,203:4619,111:[1,4620]}),o($VC3,$V24),o($VC3,$V34),o($VC3,$V44),o($VC3,$V54),o($VC3,$V64),o($VC3,$V74),o($VC3,$V84),o($VC3,$V94),o($VC3,$Va4),o($VC7,$V83),o($VC7,$V93),o($VC7,$Va3),o($VC7,$Vb3),{19:[1,4623],21:[1,4626],22:4622,87:4621,214:4624,215:[1,4625]},{193:[1,4629],194:4627,195:[1,4628]},o($VD3,$V66),o($VD3,$V76),o($VD3,$V86),o($VD3,$Vn),o($VD3,$Vo),o($VD3,$VZ3),o($VD3,$V_3),o($VD3,$V$3),o($VD3,$Vp),o($VD3,$Vq),o($VD3,$V04),o($VD3,$V14,{202:4630,203:4631,111:[1,4632]}),o($VD3,$V24),o($VD3,$V34),o($VD3,$V44),o($VD3,$V54),o($VD3,$V64),o($VD3,$V74),o($VD3,$V84),o($VD3,$V94),o($VD3,$Va4),o($VD7,$V83),o($VD7,$V93),o($VD7,$Va3),o($VD7,$Vb3),o($Vi8,$V41),o($Vi8,$V51),o($Vi8,$V61),o($V_6,$Vq5),o($V_6,$Vr5),{19:$Vj9,21:$Vk9,22:4634,87:4633,214:4012,215:$Vl9},o($V87,$V_8),o($VI,$VJ,{63:4635,73:4636,75:4637,76:4638,92:4641,94:4642,87:4644,88:4645,89:4646,78:4647,39:4648,95:4652,22:4653,91:4655,118:4656,99:4660,214:4663,105:4664,107:4665,19:[1,4662],21:[1,4667],69:[1,4639],71:[1,4640],79:[1,4657],80:[1,4658],81:[1,4659],85:[1,4643],96:[1,4649],97:[1,4650],98:[1,4651],101:$VR9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,4654],215:[1,4666]}),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:4668,121:$VX2,148:$VY2,189:$VZ2}),o($V87,$VB2),o($V87,$Vw),o($V87,$Vx),o($V87,$Vn),o($V87,$Vo),o($V87,$Vy),o($V87,$Vp),o($V87,$Vq),o($V87,$Vt2,{99:4051,95:4669,101:$Vm9,102:$VR,103:$VS,104:$VT}),o($Vp8,$Vu2),o($Vp8,$V33),o($V87,$V09),o($VR7,$VR3),o($VT7,$VS3),o($VT7,$VT3),o($VT7,$VU3),{100:[1,4670]},o($VT7,$VT1),{100:[1,4672],106:4671,108:[1,4673],109:[1,4674],110:4675,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4676]},o($VT7,$VW3),{121:[1,4677]},{19:[1,4680],21:[1,4683],22:4679,87:4678,214:4681,215:[1,4682]},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:4684,121:$VX2,148:$VY2,189:$VZ2}),o($V87,$VB2),o($V87,$Vw),o($V87,$Vx),o($V87,$Vn),o($V87,$Vo),o($V87,$Vy),o($V87,$Vp),o($V87,$Vq),o($V87,$Vt2,{99:4093,95:4685,101:$Vn9,102:$VR,103:$VS,104:$VT}),o($Vp8,$Vu2),o($Vp8,$V33),o($V87,$V09),o($VR7,$VR3),o($VT7,$VS3),o($VT7,$VT3),o($VT7,$VU3),{100:[1,4686]},o($VT7,$VT1),{100:[1,4688],106:4687,108:[1,4689],109:[1,4690],110:4691,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4692]},o($VT7,$VW3),{121:[1,4693]},{19:[1,4696],21:[1,4699],22:4695,87:4694,214:4697,215:[1,4698]},o($VT7,$VW5),o($VT7,$VK1),o($VT7,$Vn),o($VT7,$Vo),o($VT7,$Vp),o($VT7,$Vq),o($Vo9,$VW4),{19:$Vi,21:$Vj,22:4700,214:45,215:$Vk},{19:$VS9,21:$VT9,22:4702,100:[1,4713],108:[1,4714],109:[1,4715],110:4712,181:4703,191:4701,196:4706,197:4707,198:4708,201:4711,204:[1,4716],205:[1,4717],206:[1,4722],207:[1,4723],208:[1,4724],209:[1,4725],210:[1,4718],211:[1,4719],212:[1,4720],213:[1,4721],214:4705,215:$VU9},o($Vx8,$VL7,{61:4726,53:[1,4727]}),o($Vy8,$VM7),o($Vy8,$VN7,{74:4728,76:4729,78:4730,39:4731,118:4732,79:[1,4733],80:[1,4734],81:[1,4735],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($Vy8,$VO7),o($Vy8,$VN5,{77:4736,73:4737,92:4738,94:4739,95:4743,99:4744,96:[1,4740],97:[1,4741],98:[1,4742],101:$VV9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:4746,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vy8,$VQ7),o($V39,$Vy1,{93:4747}),o($V49,$Vz1,{99:4431,95:4748,101:$VF9,102:$VR,103:$VS,104:$VT}),o($V59,$VB1,{86:4749}),o($V59,$VB1,{86:4750}),o($V59,$VB1,{86:4751}),o($Vy8,$VC1,{105:4435,107:4436,91:4752,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V69,$VT5),o($V69,$VU5),o($V39,$VG1),o($V39,$VH1),o($V39,$VI1),o($V39,$VJ1),o($V59,$VK1),o($VL1,$VM1,{162:4753}),o($V79,$VO1),{119:[1,4754],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($V69,$VE1),o($V69,$VF1),{19:[1,4758],21:[1,4762],22:4756,33:4755,200:4757,214:4759,215:[1,4761],216:[1,4760]},{100:[1,4763]},o($V39,$VT1),o($V59,$Vn),o($V59,$Vo),{100:[1,4765],106:4764,108:[1,4766],109:[1,4767],110:4768,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4769]},o($V59,$Vp),o($V59,$Vq),o($Vy8,$VM7),o($Vy8,$VN7,{74:4770,76:4771,78:4772,39:4773,118:4774,79:[1,4775],80:[1,4776],81:[1,4777],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($Vy8,$VO7),o($Vy8,$VN5,{77:4778,73:4779,92:4780,94:4781,95:4785,99:4786,96:[1,4782],97:[1,4783],98:[1,4784],101:$VW9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:4788,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vy8,$VQ7),o($V39,$Vy1,{93:4789}),o($V49,$Vz1,{99:4464,95:4790,101:$VG9,102:$VR,103:$VS,104:$VT}),o($V59,$VB1,{86:4791}),o($V59,$VB1,{86:4792}),o($V59,$VB1,{86:4793}),o($Vy8,$VC1,{105:4468,107:4469,91:4794,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V69,$VT5),o($V69,$VU5),o($V39,$VG1),o($V39,$VH1),o($V39,$VI1),o($V39,$VJ1),o($V59,$VK1),o($VL1,$VM1,{162:4795}),o($V79,$VO1),{119:[1,4796],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($V69,$VE1),o($V69,$VF1),{19:[1,4800],21:[1,4804],22:4798,33:4797,200:4799,214:4801,215:[1,4803],216:[1,4802]},{100:[1,4805]},o($V39,$VT1),o($V59,$Vn),o($V59,$Vo),{100:[1,4807],106:4806,108:[1,4808],109:[1,4809],110:4810,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4811]},o($V59,$Vp),o($V59,$Vq),{121:[1,4812]},o($Vq9,$VR3),o($V59,$V33),o($V59,$V43),o($V59,$V53),o($V59,$V63),o($V59,$V73),{111:[1,4813]},o($V59,$Vc3),o($V69,$Vs5),o($V79,$VW5),o($V79,$VK1),o($V79,$Vn),o($V79,$Vo),o($V79,$Vp),o($V79,$Vq),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:4814,121:$VX2,148:$VY2,189:$VZ2}),o($Vs4,$VB2),o($Vs4,$Vw),o($Vs4,$Vx),o($Vs4,$Vn),o($Vs4,$Vo),o($Vs4,$Vy),o($Vs4,$Vp),o($Vs4,$Vq),o($Vs4,$Vt2,{99:4170,95:4815,101:$Vs9,102:$VR,103:$VS,104:$VT}),o($Vw6,$Vu2),o($Vw6,$V33),o($Vs4,$Vc7),o($VR5,$VS3),o($VR5,$VT3),o($VR5,$VU3),{100:[1,4816]},o($VR5,$VT1),{100:[1,4818],106:4817,108:[1,4819],109:[1,4820],110:4821,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4822]},o($VR5,$VW3),{121:[1,4823]},{19:[1,4826],21:[1,4829],22:4825,87:4824,214:4827,215:[1,4828]},o($VR5,$VW5),o($VR5,$VK1),o($VR5,$Vn),o($VR5,$Vo),o($VR5,$Vp),o($VR5,$Vq),o($VR5,$VW5),o($VR5,$VK1),o($VR5,$Vn),o($VR5,$Vo),o($VR5,$Vp),o($VR5,$Vq),o($Vt1,$Vs5),{193:[1,4832],194:4830,195:[1,4831]},o($Vr1,$V66),o($Vr1,$V76),o($Vr1,$V86),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V04),o($Vr1,$V14,{202:4833,203:4834,111:[1,4835]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($V96,$V83),o($V96,$V93),o($V96,$Va3),o($V96,$Vb3),{193:[1,4838],194:4836,195:[1,4837]},o($Vt1,$V66),o($Vt1,$V76),o($Vt1,$V86),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V04),o($Vt1,$V14,{202:4839,203:4840,111:[1,4841]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($Va6,$Vb3),{19:[1,4844],21:[1,4847],22:4843,87:4842,214:4845,215:[1,4846]},{193:[1,4850],194:4848,195:[1,4849]},o($VD1,$V66),o($VD1,$V76),o($VD1,$V86),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V04),o($VD1,$V14,{202:4851,203:4852,111:[1,4853]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vb6,$V83),o($Vb6,$V93),o($Vb6,$Va3),o($Vb6,$Vb3),o($Vr1,$Vg6),o($Vr1,$VK1),o($Vt1,$Vg6),o($Vt1,$VK1),o($VD1,$Vg6),o($VD1,$VK1),o($VP4,$V41),o($VP4,$V51),o($VP4,$V61),o($VB3,$Vq5),o($VB3,$Vr5),{19:$Vt9,21:$Vu9,22:4855,87:4854,214:4266,215:$Vv9},o($VQ4,$V41),o($VQ4,$V51),o($VQ4,$V61),o($VC3,$Vq5),o($VC3,$Vr5),{19:$Vw9,21:$Vx9,22:4857,87:4856,214:4292,215:$Vy9},o($VF3,$VW5),o($VF3,$VK1),o($VF3,$Vn),o($VF3,$Vo),o($VF3,$Vp),o($VF3,$Vq),o($VS4,$V41),o($VS4,$V51),o($VS4,$V61),o($VD3,$Vq5),o($VD3,$Vr5),{19:$Vz9,21:$VA9,22:4859,87:4858,214:4319,215:$VB9},o($V_6,$Vg6),o($V_6,$VK1),o($V87,$VM7),o($V87,$VN7,{74:4860,76:4861,78:4862,39:4863,118:4864,79:[1,4865],80:[1,4866],81:[1,4867],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($V87,$VO7),o($V87,$VN5,{77:4868,73:4869,92:4870,94:4871,95:4875,99:4876,96:[1,4872],97:[1,4873],98:[1,4874],101:$VX9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:4878,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($V87,$VQ7),o($VR7,$Vy1,{93:4879}),o($VS7,$Vz1,{99:4660,95:4880,101:$VR9,102:$VR,103:$VS,104:$VT}),o($VT7,$VB1,{86:4881}),o($VT7,$VB1,{86:4882}),o($VT7,$VB1,{86:4883}),o($V87,$VC1,{105:4664,107:4665,91:4884,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VU7,$VT5),o($VU7,$VU5),o($VR7,$VG1),o($VR7,$VH1),o($VR7,$VI1),o($VR7,$VJ1),o($VT7,$VK1),o($VL1,$VM1,{162:4885}),o($VV7,$VO1),{119:[1,4886],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($VU7,$VE1),o($VU7,$VF1),{19:[1,4890],21:[1,4894],22:4888,33:4887,200:4889,214:4891,215:[1,4893],216:[1,4892]},{100:[1,4895]},o($VR7,$VT1),o($VT7,$Vn),o($VT7,$Vo),{100:[1,4897],106:4896,108:[1,4898],109:[1,4899],110:4900,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4901]},o($VT7,$Vp),o($VT7,$Vq),{121:[1,4902]},o($Vp8,$VR3),o($VT7,$V33),o($VT7,$V43),o($VT7,$V53),o($VT7,$V63),o($VT7,$V73),{111:[1,4903]},o($VT7,$Vc3),o($VU7,$Vs5),o($VV7,$VW5),o($VV7,$VK1),o($VV7,$Vn),o($VV7,$Vo),o($VV7,$Vp),o($VV7,$Vq),{121:[1,4904]},o($Vp8,$VR3),o($VT7,$V33),o($VT7,$V43),o($VT7,$V53),o($VT7,$V63),o($VT7,$V73),{111:[1,4905]},o($VT7,$Vc3),o($VU7,$Vs5),o($VV7,$VW5),o($VV7,$VK1),o($VV7,$Vn),o($VV7,$Vo),o($VV7,$Vp),o($VV7,$Vq),{193:[1,4908],194:4906,195:[1,4907]},o($Vr8,$V66),o($Vr8,$V76),o($Vr8,$V86),o($Vr8,$Vn),o($Vr8,$Vo),o($Vr8,$VZ3),o($Vr8,$V_3),o($Vr8,$V$3),o($Vr8,$Vp),o($Vr8,$Vq),o($Vr8,$V04),o($Vr8,$V14,{202:4909,203:4910,111:[1,4911]}),o($Vr8,$V24),o($Vr8,$V34),o($Vr8,$V44),o($Vr8,$V54),o($Vr8,$V64),o($Vr8,$V74),o($Vr8,$V84),o($Vr8,$V94),o($Vr8,$Va4),o($VY9,$V83),o($VY9,$V93),o($VY9,$Va3),o($VY9,$Vb3),o($Vy8,$Vl8),o($Vr,$Vs,{59:4912,41:4913,44:$Vt}),o($Vy8,$Vm8),o($Vy8,$Vn8),o($Vy8,$VT5),o($Vy8,$VU5),{119:[1,4914],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($Vy8,$VE1),o($Vy8,$VF1),{19:[1,4918],21:[1,4922],22:4916,33:4915,200:4917,214:4919,215:[1,4921],216:[1,4920]},o($Vy8,$Vo8),o($Vy8,$Vv6),o($Vq9,$Vy1,{93:4923}),o($Vy8,$Vz1,{99:4744,95:4924,101:$VV9,102:$VR,103:$VS,104:$VT}),o($Vq9,$VG1),o($Vq9,$VH1),o($Vq9,$VI1),o($Vq9,$VJ1),{100:[1,4925]},o($Vq9,$VT1),{70:[1,4926]},o($V49,$Vt2,{99:4431,95:4927,101:$VF9,102:$VR,103:$VS,104:$VT}),o($V39,$Vu2),o($Vy8,$Vv2,{90:4928,95:4929,91:4930,99:4931,105:4933,107:4934,101:$VZ9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vy8,$Vx2,{90:4928,95:4929,91:4930,99:4931,105:4933,107:4934,101:$VZ9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vy8,$Vy2,{90:4928,95:4929,91:4930,99:4931,105:4933,107:4934,101:$VZ9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V79,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,4935],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:4936,121:$VX2,148:$VY2,189:$VZ2}),o($V69,$VB2),o($V69,$Vw),o($V69,$Vx),o($V69,$Vn),o($V69,$Vo),o($V69,$Vy),o($V69,$Vp),o($V69,$Vq),o($V39,$V33),o($V79,$V43),o($V79,$V53),o($V79,$V63),o($V79,$V73),{111:[1,4937]},o($V79,$Vc3),o($Vy8,$Vm8),o($Vy8,$Vn8),o($Vy8,$VT5),o($Vy8,$VU5),{119:[1,4938],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($Vy8,$VE1),o($Vy8,$VF1),{19:[1,4942],21:[1,4946],22:4940,33:4939,200:4941,214:4943,215:[1,4945],216:[1,4944]},o($Vy8,$Vo8),o($Vy8,$Vv6),o($Vq9,$Vy1,{93:4947}),o($Vy8,$Vz1,{99:4786,95:4948,101:$VW9,102:$VR,103:$VS,104:$VT}),o($Vq9,$VG1),o($Vq9,$VH1),o($Vq9,$VI1),o($Vq9,$VJ1),{100:[1,4949]},o($Vq9,$VT1),{70:[1,4950]},o($V49,$Vt2,{99:4464,95:4951,101:$VG9,102:$VR,103:$VS,104:$VT}),o($V39,$Vu2),o($Vy8,$Vv2,{90:4952,95:4953,91:4954,99:4955,105:4957,107:4958,101:$V_9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vy8,$Vx2,{90:4952,95:4953,91:4954,99:4955,105:4957,107:4958,101:$V_9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vy8,$Vy2,{90:4952,95:4953,91:4954,99:4955,105:4957,107:4958,101:$V_9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V79,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,4959],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:4960,121:$VX2,148:$VY2,189:$VZ2}),o($V69,$VB2),o($V69,$Vw),o($V69,$Vx),o($V69,$Vn),o($V69,$Vo),o($V69,$Vy),o($V69,$Vp),o($V69,$Vq),o($V39,$V33),o($V79,$V43),o($V79,$V53),o($V79,$V63),o($V79,$V73),{111:[1,4961]},o($V79,$Vc3),o($Vy8,$Vs5),{19:[1,4964],21:[1,4967],22:4963,87:4962,214:4965,215:[1,4966]},{121:[1,4968]},o($Vw6,$VR3),o($VR5,$V33),o($VR5,$V43),o($VR5,$V53),o($VR5,$V63),o($VR5,$V73),{111:[1,4969]},o($VR5,$Vc3),o($VS5,$Vs5),o($VV5,$VW5),o($VV5,$VK1),o($VV5,$Vn),o($VV5,$Vo),o($VV5,$Vp),o($VV5,$Vq),o($Vp2,$V41),o($Vp2,$V51),o($Vp2,$V61),o($Vr1,$Vq5),o($Vr1,$Vr5),{19:$VI9,21:$VJ9,22:4971,87:4970,214:4529,215:$VK9},o($Vr2,$V41),o($Vr2,$V51),o($Vr2,$V61),o($Vt1,$Vq5),o($Vt1,$Vr5),{19:$VL9,21:$VM9,22:4973,87:4972,214:4555,215:$VN9},o($VA1,$VW5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($VA2,$V41),o($VA2,$V51),o($VA2,$V61),o($VD1,$Vq5),o($VD1,$Vr5),{19:$VO9,21:$VP9,22:4975,87:4974,214:4582,215:$VQ9},o($VB3,$Vg6),o($VB3,$VK1),o($VC3,$Vg6),o($VC3,$VK1),o($VD3,$Vg6),o($VD3,$VK1),o($V87,$Vm8),o($V87,$Vn8),o($V87,$VT5),o($V87,$VU5),{119:[1,4976],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($V87,$VE1),o($V87,$VF1),{19:[1,4980],21:[1,4984],22:4978,33:4977,200:4979,214:4981,215:[1,4983],216:[1,4982]},o($V87,$Vo8),o($V87,$Vv6),o($Vp8,$Vy1,{93:4985}),o($V87,$Vz1,{99:4876,95:4986,101:$VX9,102:$VR,103:$VS,104:$VT}),o($Vp8,$VG1),o($Vp8,$VH1),o($Vp8,$VI1),o($Vp8,$VJ1),{100:[1,4987]},o($Vp8,$VT1),{70:[1,4988]},o($VS7,$Vt2,{99:4660,95:4989,101:$VR9,102:$VR,103:$VS,104:$VT}),o($VR7,$Vu2),o($V87,$Vv2,{90:4990,95:4991,91:4992,99:4993,105:4995,107:4996,101:$V$9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V87,$Vx2,{90:4990,95:4991,91:4992,99:4993,105:4995,107:4996,101:$V$9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V87,$Vy2,{90:4990,95:4991,91:4992,99:4993,105:4995,107:4996,101:$V$9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VV7,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,4997],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:4998,121:$VX2,148:$VY2,189:$VZ2}),o($VU7,$VB2),o($VU7,$Vw),o($VU7,$Vx),o($VU7,$Vn),o($VU7,$Vo),o($VU7,$Vy),o($VU7,$Vp),o($VU7,$Vq),o($VR7,$V33),o($VV7,$V43),o($VV7,$V53),o($VV7,$V63),o($VV7,$V73),{111:[1,4999]},o($VV7,$Vc3),o($V87,$Vs5),{19:[1,5002],21:[1,5005],22:5001,87:5000,214:5003,215:[1,5004]},o($V87,$Vs5),{19:[1,5008],21:[1,5011],22:5007,87:5006,214:5009,215:[1,5010]},o($Vo9,$V41),o($Vo9,$V51),o($Vo9,$V61),o($Vr8,$Vq5),o($Vr8,$Vr5),{19:$VS9,21:$VT9,22:5013,87:5012,214:4705,215:$VU9},o($Vy8,$V_8),o($VI,$VJ,{63:5014,73:5015,75:5016,76:5017,92:5020,94:5021,87:5023,88:5024,89:5025,78:5026,39:5027,95:5031,22:5032,91:5034,118:5035,99:5039,214:5042,105:5043,107:5044,19:[1,5041],21:[1,5046],69:[1,5018],71:[1,5019],79:[1,5036],80:[1,5037],81:[1,5038],85:[1,5022],96:[1,5028],97:[1,5029],98:[1,5030],101:$V0a,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,5033],215:[1,5045]}),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:5047,121:$VX2,148:$VY2,189:$VZ2}),o($Vy8,$VB2),o($Vy8,$Vw),o($Vy8,$Vx),o($Vy8,$Vn),o($Vy8,$Vo),o($Vy8,$Vy),o($Vy8,$Vp),o($Vy8,$Vq),o($Vy8,$Vt2,{99:4744,95:5048,101:$VV9,102:$VR,103:$VS,104:$VT}),o($Vq9,$Vu2),o($Vq9,$V33),o($Vy8,$V09),o($V39,$VR3),o($V59,$VS3),o($V59,$VT3),o($V59,$VU3),{100:[1,5049]},o($V59,$VT1),{100:[1,5051],106:5050,108:[1,5052],109:[1,5053],110:5054,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,5055]},o($V59,$VW3),{121:[1,5056]},{19:[1,5059],21:[1,5062],22:5058,87:5057,214:5060,215:[1,5061]},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:5063,121:$VX2,148:$VY2,189:$VZ2}),o($Vy8,$VB2),o($Vy8,$Vw),o($Vy8,$Vx),o($Vy8,$Vn),o($Vy8,$Vo),o($Vy8,$Vy),o($Vy8,$Vp),o($Vy8,$Vq),o($Vy8,$Vt2,{99:4786,95:5064,101:$VW9,102:$VR,103:$VS,104:$VT}),o($Vq9,$Vu2),o($Vq9,$V33),o($Vy8,$V09),o($V39,$VR3),o($V59,$VS3),o($V59,$VT3),o($V59,$VU3),{100:[1,5065]},o($V59,$VT1),{100:[1,5067],106:5066,108:[1,5068],109:[1,5069],110:5070,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,5071]},o($V59,$VW3),{121:[1,5072]},{19:[1,5075],21:[1,5078],22:5074,87:5073,214:5076,215:[1,5077]},o($V59,$VW5),o($V59,$VK1),o($V59,$Vn),o($V59,$Vo),o($V59,$Vp),o($V59,$Vq),o($Vs4,$Vs5),{19:[1,5081],21:[1,5084],22:5080,87:5079,214:5082,215:[1,5083]},o($Vr1,$Vg6),o($Vr1,$VK1),o($Vt1,$Vg6),o($Vt1,$VK1),o($VD1,$Vg6),o($VD1,$VK1),o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:5085,121:$VX2,148:$VY2,189:$VZ2}),o($V87,$VB2),o($V87,$Vw),o($V87,$Vx),o($V87,$Vn),o($V87,$Vo),o($V87,$Vy),o($V87,$Vp),o($V87,$Vq),o($V87,$Vt2,{99:4876,95:5086,101:$VX9,102:$VR,103:$VS,104:$VT}),o($Vp8,$Vu2),o($Vp8,$V33),o($V87,$V09),o($VR7,$VR3),o($VT7,$VS3),o($VT7,$VT3),o($VT7,$VU3),{100:[1,5087]},o($VT7,$VT1),{100:[1,5089],106:5088,108:[1,5090],109:[1,5091],110:5092,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,5093]},o($VT7,$VW3),{121:[1,5094]},{19:[1,5097],21:[1,5100],22:5096,87:5095,214:5098,215:[1,5099]},o($VT7,$VW5),o($VT7,$VK1),o($VT7,$Vn),o($VT7,$Vo),o($VT7,$Vp),o($VT7,$Vq),o($VT7,$VW5),o($VT7,$VK1),o($VT7,$Vn),o($VT7,$Vo),o($VT7,$Vp),o($VT7,$Vq),o($Vr8,$Vg6),o($Vr8,$VK1),o($Vy8,$VM7),o($Vy8,$VN7,{74:5101,76:5102,78:5103,39:5104,118:5105,79:[1,5106],80:[1,5107],81:[1,5108],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($Vy8,$VO7),o($Vy8,$VN5,{77:5109,73:5110,92:5111,94:5112,95:5116,99:5117,96:[1,5113],97:[1,5114],98:[1,5115],101:$V1a,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{41:169,39:171,38:5119,44:$Vm1,79:$Vn1,80:$Vo1,81:$Vp1}),o($Vy8,$VQ7),o($V39,$Vy1,{93:5120}),o($V49,$Vz1,{99:5039,95:5121,101:$V0a,102:$VR,103:$VS,104:$VT}),o($V59,$VB1,{86:5122}),o($V59,$VB1,{86:5123}),o($V59,$VB1,{86:5124}),o($Vy8,$VC1,{105:5043,107:5044,91:5125,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V69,$VT5),o($V69,$VU5),o($V39,$VG1),o($V39,$VH1),o($V39,$VI1),o($V39,$VJ1),o($V59,$VK1),o($VL1,$VM1,{162:5126}),o($V79,$VO1),{119:[1,5127],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($V69,$VE1),o($V69,$VF1),{19:[1,5131],21:[1,5135],22:5129,33:5128,200:5130,214:5132,215:[1,5134],216:[1,5133]},{100:[1,5136]},o($V39,$VT1),o($V59,$Vn),o($V59,$Vo),{100:[1,5138],106:5137,108:[1,5139],109:[1,5140],110:5141,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,5142]},o($V59,$Vp),o($V59,$Vq),{121:[1,5143]},o($Vq9,$VR3),o($V59,$V33),o($V59,$V43),o($V59,$V53),o($V59,$V63),o($V59,$V73),{111:[1,5144]},o($V59,$Vc3),o($V69,$Vs5),o($V79,$VW5),o($V79,$VK1),o($V79,$Vn),o($V79,$Vo),o($V79,$Vp),o($V79,$Vq),{121:[1,5145]},o($Vq9,$VR3),o($V59,$V33),o($V59,$V43),o($V59,$V53),o($V59,$V63),o($V59,$V73),{111:[1,5146]},o($V59,$Vc3),o($V69,$Vs5),o($V79,$VW5),o($V79,$VK1),o($V79,$Vn),o($V79,$Vo),o($V79,$Vp),o($V79,$Vq),o($VR5,$VW5),o($VR5,$VK1),o($VR5,$Vn),o($VR5,$Vo),o($VR5,$Vp),o($VR5,$Vq),{121:[1,5147]},o($Vp8,$VR3),o($VT7,$V33),o($VT7,$V43),o($VT7,$V53),o($VT7,$V63),o($VT7,$V73),{111:[1,5148]},o($VT7,$Vc3),o($VU7,$Vs5),o($VV7,$VW5),o($VV7,$VK1),o($VV7,$Vn),o($VV7,$Vo),o($VV7,$Vp),o($VV7,$Vq),o($Vy8,$Vm8),o($Vy8,$Vn8),o($Vy8,$VT5),o($Vy8,$VU5),{119:[1,5149],122:194,123:195,124:196,125:$VP1,127:$VQ1,189:$VR1,217:198,227:$VS1},o($Vy8,$VE1),o($Vy8,$VF1),{19:[1,5153],21:[1,5157],22:5151,33:5150,200:5152,214:5154,215:[1,5156],216:[1,5155]},o($Vy8,$Vo8),o($Vy8,$Vv6),o($Vq9,$Vy1,{93:5158}),o($Vy8,$Vz1,{99:5117,95:5159,101:$V1a,102:$VR,103:$VS,104:$VT}),o($Vq9,$VG1),o($Vq9,$VH1),o($Vq9,$VI1),o($Vq9,$VJ1),{100:[1,5160]},o($Vq9,$VT1),{70:[1,5161]},o($V49,$Vt2,{99:5039,95:5162,101:$V0a,102:$VR,103:$VS,104:$VT}),o($V39,$Vu2),o($Vy8,$Vv2,{90:5163,95:5164,91:5165,99:5166,105:5168,107:5169,101:$V2a,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vy8,$Vx2,{90:5163,95:5164,91:5165,99:5166,105:5168,107:5169,101:$V2a,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vy8,$Vy2,{90:5163,95:5164,91:5165,99:5166,105:5168,107:5169,101:$V2a,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V79,$Vz2),{19:$VC2,21:$VD2,22:384,71:$VE2,81:$VF2,100:$VG2,108:$VH2,109:$VI2,110:396,163:[1,5170],164:379,165:380,166:381,167:382,181:385,185:$VJ2,196:390,197:391,198:392,201:395,204:$VK2,205:$VL2,206:$VM2,207:$VN2,208:$VO2,209:$VP2,210:$VQ2,211:$VR2,212:$VS2,213:$VT2,214:389,215:$VU2},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:5171,121:$VX2,148:$VY2,189:$VZ2}),o($V69,$VB2),o($V69,$Vw),o($V69,$Vx),o($V69,$Vn),o($V69,$Vo),o($V69,$Vy),o($V69,$Vp),o($V69,$Vq),o($V39,$V33),o($V79,$V43),o($V79,$V53),o($V79,$V63),o($V79,$V73),{111:[1,5172]},o($V79,$Vc3),o($Vy8,$Vs5),{19:[1,5175],21:[1,5178],22:5174,87:5173,214:5176,215:[1,5177]},o($Vy8,$Vs5),{19:[1,5181],21:[1,5184],22:5180,87:5179,214:5182,215:[1,5183]},o($V87,$Vs5),{19:[1,5187],21:[1,5190],22:5186,87:5185,214:5188,215:[1,5189]},o($VV2,$VW2,{126:411,130:412,131:413,132:414,136:415,137:416,138:417,144:418,146:419,147:420,120:5191,121:$VX2,148:$VY2,189:$VZ2}),o($Vy8,$VB2),o($Vy8,$Vw),o($Vy8,$Vx),o($Vy8,$Vn),o($Vy8,$Vo),o($Vy8,$Vy),o($Vy8,$Vp),o($Vy8,$Vq),o($Vy8,$Vt2,{99:5117,95:5192,101:$V1a,102:$VR,103:$VS,104:$VT}),o($Vq9,$Vu2),o($Vq9,$V33),o($Vy8,$V09),o($V39,$VR3),o($V59,$VS3),o($V59,$VT3),o($V59,$VU3),{100:[1,5193]},o($V59,$VT1),{100:[1,5195],106:5194,108:[1,5196],109:[1,5197],110:5198,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,5199]},o($V59,$VW3),{121:[1,5200]},{19:[1,5203],21:[1,5206],22:5202,87:5201,214:5204,215:[1,5205]},o($V59,$VW5),o($V59,$VK1),o($V59,$Vn),o($V59,$Vo),o($V59,$Vp),o($V59,$Vq),o($V59,$VW5),o($V59,$VK1),o($V59,$Vn),o($V59,$Vo),o($V59,$Vp),o($V59,$Vq),o($VT7,$VW5),o($VT7,$VK1),o($VT7,$Vn),o($VT7,$Vo),o($VT7,$Vp),o($VT7,$Vq),{121:[1,5207]},o($Vq9,$VR3),o($V59,$V33),o($V59,$V43),o($V59,$V53),o($V59,$V63),o($V59,$V73),{111:[1,5208]},o($V59,$Vc3),o($V69,$Vs5),o($V79,$VW5),o($V79,$VK1),o($V79,$Vn),o($V79,$Vo),o($V79,$Vp),o($V79,$Vq),o($Vy8,$Vs5),{19:[1,5211],21:[1,5214],22:5210,87:5209,214:5212,215:[1,5213]},o($V59,$VW5),o($V59,$VK1),o($V59,$Vn),o($V59,$Vo),o($V59,$Vp),o($V59,$Vq)];
        this.defaultActions = {6:[2,11],24:[2,1],115:[2,120],116:[2,121],117:[2,122],124:[2,133],125:[2,134],208:[2,253],209:[2,254],210:[2,255],211:[2,256],343:[2,36],411:[2,143],412:[2,147],414:[2,149],604:[2,34],605:[2,38],642:[2,35],1164:[2,147],1166:[2,149]};
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
case 37: case 232: case 249:
this.$ = null;
break;
case 38: case 42: case 45: case 51: case 58: case 189: case 248: case 269: case 273:
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
case 44: case 47: case 49: case 53: case 56: case 60: case 271: case 275:
this.$ = $$[$0-1].concat($$[$0]);
break;
case 48: case 52: case 55: case 59: case 270: case 274:
this.$ = [];
break;
case 50: case 268:
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
case 65: case 74: case 79: case 277: case 279:
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
        // %7: t: 1inversedotCode1
        this.$ = extend({ type: "TripleConstraint" }, $$[$0-5], { predicate: $$[$0-4] }, ($$[$0-3] === yy.EmptyShape ? {} : { valueExpr: $$[$0-3] }), $$[$0-2], $$[$0]); // t: 1dot, 1inversedot
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
this.$ = $$[$0-1] // t: 1val1IRIREF;
break;
case 184:
this.$ = [] // t: 1val1IRIREF;
break;
case 185:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1IRIREF;
break;
case 190:
this.$ = [$$[$0]] // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 191:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 192:
this.$ = [$$[$0]] // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 193:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 194:
this.$ = [$$[$0]] // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 195:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 196:
this.$ = { type: "IriStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 197:
this.$ = { type: "LiteralStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 198:
this.$ = { type: "LanguageStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 199:

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
case 200:
this.$ = [] // t: 1val1iriStem, 1val1iriStemMinusiri3;
break;
case 201:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1iriStemMinusiri3;
break;
case 202:
this.$ = $$[$0] // t: 1val1iriStemMinusiri3;
break;
case 205:
this.$ = $$[$0] ? { type: "IriStem", stem: $$[$0-1] } /* t: 1val1iriStemMinusiriStem3 */ : $$[$0-1] // t: 1val1iriStemMinusiri3;
break;
case 208:

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
case 209:
this.$ = [] // t: 1val1literalStem, 1val1literalStemMinusliteral3;
break;
case 210:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1literalStemMinusliteral3;
break;
case 211:
this.$ = $$[$0] // t: 1val1literalStemMinusliteral3;
break;
case 214:
this.$ = $$[$0] ? { type: "LiteralStem", stem: $$[$0-1].value } /* t: 1val1literalStemMinusliteral3 */ : $$[$0-1].value // t: 1val1literalStemMinusliteralStem3;
break;
case 215:

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
case 216:

        this.$ = {  // t: @@
          type: $$[$0].length ? "LanguageStemRange" : "LanguageStem",
          stem: ""
        };
        if ($$[$0].length)
          this.$["exclusions"] = $$[$0]; // t: @@
      
break;
case 217:
this.$ = [] // t: 1val1languageStem, 1val1languageStemMinuslanguage3;
break;
case 218:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1languageStemMinuslanguage3;
break;
case 219:
this.$ = $$[$0] // t: 1val1languageStemMinuslanguage3;
break;
case 222:
this.$ = $$[$0] ? { type: "LanguageStem", stem: $$[$0-1] } /* t: 1val1languageStemMinuslanguageStem3 */ : $$[$0-1] // t: 1val1languageStemMinuslanguage3;
break;
case 223:
this.$ = yy.addSourceMap($$[$0]) // Inclusion // t: 2groupInclude1;
break;
case 224:
this.$ = { type: "Annotation", predicate: $$[$0-1], object: $$[$0] } // t: 1dotAnnotIRIREF;
break;
case 227:
this.$ = $$[$0].length ? { semActs: $$[$0] } : null // t: 1dotCode1/2oneOfDot;
break;
case 228:
this.$ = [] // t: 1dot, 1dotCode1;
break;
case 229:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotCode1;
break;
case 230:
this.$ = $$[$0] ? unescapeSemanticAction($$[$0-1], $$[$0]) /* t: 1dotCode1 */ : { type: "SemAct", name: $$[$0-1] } // t: 1dotNoCode1;
break;
case 237:
this.$ = RDF_TYPE // t: 1AvalA;
break;
case 243:
this.$ = createLiteral($$[$0], XSD_INTEGER) // t: 1val1INTEGER;
break;
case 244:
this.$ = createLiteral($$[$0], XSD_DECIMAL) // t: 1val1DECIMAL;
break;
case 245:
this.$ = createLiteral($$[$0], XSD_DOUBLE) // t: 1val1DOUBLE;
break;
case 247:
this.$ = $$[$0] ? extend($$[$0-1], { type: $$[$0] }) : $$[$0-1] // t: 1val1Datatype;
break;
case 251:
this.$ = { value: "true", type: XSD_BOOLEAN } // t: 1val1true;
break;
case 252:
this.$ = { value: "false", type: XSD_BOOLEAN } // t: 1val1false;
break;
case 253:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL2;
break;
case 254:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL1;
break;
case 255:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL_LONG2;
break;
case 256:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG1;
break;
case 257:
this.$ = unescapeLangString($$[$0], 1)	// t: @@;
break;
case 258:
this.$ = unescapeLangString($$[$0], 3)	// t: @@;
break;
case 259:
this.$ = unescapeLangString($$[$0], 1)	// t: 1val1LANGTAG;
break;
case 260:
this.$ = unescapeLangString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG2_with_LANGTAG;
break;
case 261:
 // t: 1dot
        const unesc = ShExUtil.unescapeText($$[$0].slice(1,-1), {});
        this.$ = yy._base === null || absoluteIRI.test(unesc) ? unesc : yy._resolveIRI(unesc)
      
break;
case 263:
 // t:1dotPNex, 1dotPNdefault, ShExParser-test.js/with pre-defined prefixes
        const namePos1 = $$[$0].indexOf(':');
        this.$ = yy.expandPrefix($$[$0].substr(0, namePos1), yy) + ShExUtil.unescapeText($$[$0].substr(namePos1 + 1), pnameEscapeReplacements);
      
break;
case 264:
 // t: 1dotNS2, 1dotNSdefault, ShExParser-test.js/PNAME_NS with pre-defined prefixes
        this.$ = yy.expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy);
      
break;
case 266:
this.$ = $$[$0] // t: 0Extends1, 1dotExtends1, 1dot3ExtendsLN;
break;
case 272:
this.$ = shapeJunction("ShapeAnd", $$[$0-1], $$[$0]);
break;
case 276:
this.$ = $$[$0-1] ? { type: "ShapeNot", "shapeExpr": nonest($$[$0]) } : $$[$0];
break;
case 280:
this.$ = Object.assign($$[$0-1], {nested: true});
break;
case 281:
this.$ = yy.EmptyShape;
break;
case 284:
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
    case 29:return 40;
      break;
    case 30:return 36;
      break;
    case 31:return 229;
      break;
    case 32:return 227;
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
        const tripleList = this.matchByPredicate(tripleConstraints, fromDB, ctx);
        const { missErrors, matchedExtras } = this.whatsMissing(tripleList, shape.extra || []);
        const allT2TCs = new TripleToTripleConstraints(tripleList.triple2constraintList, extendsTCs, tc2exts);
        const partitionErrors = [];
        // only construct a regexp engine if shape has a triple expression
        const regexEngine = shape.expression === undefined ? null : this.regexModule.compile(this.schema, shape, this.index);
        for (let t2tc = allT2TCs.next(); t2tc !== null && ret === null; t2tc = allT2TCs.next()) {
            const { errors, results } = this.tryPartition(t2tc, focus, shape, ctx, extendsTCs, tc2exts, matchedExtras, tripleConstraints, tripleList, fromDB.outgoing, regexEngine);
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
     * @param tripleList mapping from triple to nested validation result
     * @param outgoing triples to check for ClosedShapeViolation
     * @param regexEngine engine to use to test regular triple expression
     * @private
     */
    tryPartition(t2tc, focus, shape, ctx, extendsTCs, tc2exts, matchedExtras, tripleConstraints, tripleList, outgoing, regexEngine) {
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
                tc2ts.add(tripleConstraint, { triple: triple, res: tripleList.results.get(tripleConstraint, triple) });
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
        const all = neighborhood.outgoing.concat(neighborhood.incoming);
        const init = { misses: new Map(), results: new MapMap(), triple2constraintList: new eval_validator_api_1.MapArray() };
        [neighborhood.outgoing, neighborhood.incoming].forEach(quads => quads.forEach(triple => init.triple2constraintList.data.set(triple, [])));
        return constraintList.reduce(function (ret, constraint) {
            // subject and object depend on direction of constraint.
            const index = constraint.inverse ? incoming : outgoing;
            // get triples matching predicate
            const matchPredicate = index.byPredicate.get(constraint.predicate) ||
                []; // empty list when no triple matches that constraint
            // strip to triples matching value constraints (apart from @<someShape>)
            const matchConstraints = _ShExValidator.triplesMatchingShapeExpr(matchPredicate, constraint, ctx);
            matchConstraints.hits.forEach(function (evidence) {
                ret.triple2constraintList.add(evidence.triple, constraint);
                ret.results.set(constraint, evidence.triple, evidence.sub);
            });
            matchConstraints.misses.forEach(function (evidence) {
                ret.misses.set(evidence.triple, { constraint: constraint, errors: evidence.sub });
            });
            return ret;
        }, init);
    }
    whatsMissing(tripleList, extras) {
        const matchedExtras = []; // triples accounted for by EXTRA
        const missErrors = tripleList.triple2constraintList.reduce((ret, t, constraints) => {
            if (constraints.length === 0 && // matches no constraints
                tripleList.misses.has(t)) { // predicate matched some constraint(s)
                if (extras.indexOf(t.predicate.value) !== -1) {
                    matchedExtras.push(t);
                }
                else { // not declared extra
                    ret.push({
                        type: "TypeMismatch",
                        triple: { type: "TestedTriple", subject: (0, term_1.rdfJsTerm2Ld)(t.subject), predicate: (0, term_1.rdfJsTerm2Ld)(t.predicate), object: (0, term_1.rdfJsTerm2Ld)(t.object) },
                        constraint: tripleList.misses.get(t).constraint,
                        errors: tripleList.misses.get(t).errors
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
            /* eval-threaded-n-err counts on triple2constraintList.indexOf(expr) so we can't optimize with:
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
             * CrossProduct counts through triple2constraintList from the right:
             *   [ 0, 0, 0, 1 ] # first call
             *   [ 0, 0, 0, 3 ] # second call
             *   [ 0, 0, 2, 1 ] # third call
             *   [ 0, 0, 2, 3 ] # fourth call
             *   [ 0, 0, 4, 1 ] # fifth call
             *   [ 0, 2, 0, 1 ] # sixth call...
             */
            const t2tc = this.crossProduct.get(); // [0,1,0,3] mapping from triple to constraint
            // if (DBG_gonnaMatch (t2tc, fromDB, triple2constraintList)) debugger;
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

/***/ 2863:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

ShExWebApp = (function () {
  const shapeMap = __webpack_require__(6261)
  return Object.assign({}, {
    ShExTerm:             __webpack_require__(1101),
    Util:                 __webpack_require__(9443),
    RdfJsDb:              (__webpack_require__(319).ctor),
    Validator:            (__webpack_require__(7403).ShExValidator),
    Writer:               __webpack_require__(95),
    Loader:               __webpack_require__(1837),
    Parser:               __webpack_require__(931),
    "eval-simple-1err":   (__webpack_require__(8986)/* .RegexpModule */ .G),
    "eval-threaded-nerr": (__webpack_require__(6201)/* .RegexpModule */ .G),
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
/******/ 	var __webpack_exports__ = __webpack_require__(2863);
/******/ 	
/******/ })()
;