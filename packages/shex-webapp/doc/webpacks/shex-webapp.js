/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 7450
(__unused_webpack_module, exports) {

"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
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
        if (this._input.length === 0) {
            this.done = true;
            return '' + this.EOF;
        }
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

/***/ },

/***/ 5546
(__unused_webpack_module, exports) {

"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
exports.JisonParser = void 0;
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
    /* Function that extends an object with the given value for all given keys
     * e.g., o([1, 3, 4], [6, 7], { x: 1, y: 2 }) = { 1: [6, 7]; 3: [6, 7], 4: [6, 7], x: 1, y: 2 }
     * This is used to docompress parser tables at module load time.
     */
    JisonParser.expandParseTable = function (k, v, o) {
        var l = k.length;
        for (o = o || {}; l--; o[k[l]] = v)
            ;
        return o;
    };
    return JisonParser;
}());
exports.JisonParser = JisonParser;
//# sourceMappingURL=parser.js.map

/***/ },

/***/ 2430
(module) {

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


/***/ },

/***/ 9950
(module) {

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


/***/ },

/***/ 9515
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const loader = __webpack_require__(9176)
const dumper = __webpack_require__(2946)

function renamed (from, to) {
  return function () {
    throw new Error('Function yaml.' + from + ' is removed in js-yaml 4. ' +
      'Use yaml.' + to + ' instead, which is now safe by default.')
  }
}

module.exports.Type = __webpack_require__(6623)
module.exports.Schema = __webpack_require__(4664)
module.exports.FAILSAFE_SCHEMA = __webpack_require__(5942)
module.exports.JSON_SCHEMA = __webpack_require__(1345)
module.exports.CORE_SCHEMA = __webpack_require__(3496)
module.exports.DEFAULT_SCHEMA = __webpack_require__(5674)
module.exports.load = loader.load
module.exports.loadAll = loader.loadAll
module.exports.dump = dumper.dump
module.exports.YAMLException = __webpack_require__(1538)

// Re-export all types in case user wants to create custom schema
module.exports.types = {
  binary: __webpack_require__(3779),
  float: __webpack_require__(3366),
  map: __webpack_require__(658),
  null: __webpack_require__(6419),
  pairs: __webpack_require__(8993),
  set: __webpack_require__(1368),
  timestamp: __webpack_require__(7856),
  bool: __webpack_require__(4286),
  int: __webpack_require__(5481),
  merge: __webpack_require__(5732),
  omap: __webpack_require__(9039),
  seq: __webpack_require__(3515),
  str: __webpack_require__(6823)
}

// Removed functions from JS-YAML 3.0.x
module.exports.safeLoad = renamed('safeLoad', 'load')
module.exports.safeLoadAll = renamed('safeLoadAll', 'loadAll')
module.exports.safeDump = renamed('safeDump', 'dump')


/***/ },

/***/ 4018
(module) {

"use strict";
var __webpack_unused_export__;


function isNothing (subject) {
  return (typeof subject === 'undefined') || (subject === null)
}

function isObject (subject) {
  return (typeof subject === 'object') && (subject !== null)
}

function toArray (sequence) {
  if (Array.isArray(sequence)) return sequence
  else if (isNothing(sequence)) return []

  return [sequence]
}

function extend (target, source) {
  if (source) {
    const sourceKeys = Object.keys(source)

    for (let index = 0, length = sourceKeys.length; index < length; index += 1) {
      const key = sourceKeys[index]
      target[key] = source[key]
    }
  }

  return target
}

function repeat (string, count) {
  let result = ''

  for (let cycle = 0; cycle < count; cycle += 1) {
    result += string
  }

  return result
}

function isNegativeZero (number) {
  return (number === 0) && (Number.NEGATIVE_INFINITY === 1 / number)
}

module.exports.isNothing = isNothing
module.exports.isObject = isObject
__webpack_unused_export__ = toArray
module.exports.repeat = repeat
module.exports.isNegativeZero = isNegativeZero
__webpack_unused_export__ = extend


/***/ },

/***/ 2946
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const common = __webpack_require__(4018)
const YAMLException = __webpack_require__(1538)
const DEFAULT_SCHEMA = __webpack_require__(5674)

const _toString = Object.prototype.toString
const _hasOwnProperty = Object.prototype.hasOwnProperty

const CHAR_BOM = 0xFEFF
const CHAR_TAB = 0x09 /* Tab */
const CHAR_LINE_FEED = 0x0A /* LF */
const CHAR_CARRIAGE_RETURN = 0x0D /* CR */
const CHAR_SPACE = 0x20 /* Space */
const CHAR_EXCLAMATION = 0x21 /* ! */
const CHAR_DOUBLE_QUOTE = 0x22 /* " */
const CHAR_SHARP = 0x23 /* # */
const CHAR_PERCENT = 0x25 /* % */
const CHAR_AMPERSAND = 0x26 /* & */
const CHAR_SINGLE_QUOTE = 0x27 /* ' */
const CHAR_ASTERISK = 0x2A /* * */
const CHAR_COMMA = 0x2C /* , */
const CHAR_MINUS = 0x2D /* - */
const CHAR_COLON = 0x3A /* : */
const CHAR_EQUALS = 0x3D /* = */
const CHAR_GREATER_THAN = 0x3E /* > */
const CHAR_QUESTION = 0x3F /* ? */
const CHAR_COMMERCIAL_AT = 0x40 /* @ */
const CHAR_LEFT_SQUARE_BRACKET = 0x5B /* [ */
const CHAR_RIGHT_SQUARE_BRACKET = 0x5D /* ] */
const CHAR_GRAVE_ACCENT = 0x60 /* ` */
const CHAR_LEFT_CURLY_BRACKET = 0x7B /* { */
const CHAR_VERTICAL_LINE = 0x7C /* | */
const CHAR_RIGHT_CURLY_BRACKET = 0x7D /* } */

const ESCAPE_SEQUENCES = {}

ESCAPE_SEQUENCES[0x00] = '\\0'
ESCAPE_SEQUENCES[0x07] = '\\a'
ESCAPE_SEQUENCES[0x08] = '\\b'
ESCAPE_SEQUENCES[0x09] = '\\t'
ESCAPE_SEQUENCES[0x0A] = '\\n'
ESCAPE_SEQUENCES[0x0B] = '\\v'
ESCAPE_SEQUENCES[0x0C] = '\\f'
ESCAPE_SEQUENCES[0x0D] = '\\r'
ESCAPE_SEQUENCES[0x1B] = '\\e'
ESCAPE_SEQUENCES[0x22] = '\\"'
ESCAPE_SEQUENCES[0x5C] = '\\\\'
ESCAPE_SEQUENCES[0x85] = '\\N'
ESCAPE_SEQUENCES[0xA0] = '\\_'
ESCAPE_SEQUENCES[0x2028] = '\\L'
ESCAPE_SEQUENCES[0x2029] = '\\P'

const DEPRECATED_BOOLEANS_SYNTAX = [
  'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON',
  'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'
]

const DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/

function compileStyleMap (schema, map) {
  if (map === null) return {}

  const result = {}
  const keys = Object.keys(map)

  for (let index = 0, length = keys.length; index < length; index += 1) {
    let tag = keys[index]
    let style = String(map[tag])

    if (tag.slice(0, 2) === '!!') {
      tag = 'tag:yaml.org,2002:' + tag.slice(2)
    }
    const type = schema.compiledTypeMap['fallback'][tag]

    if (type && _hasOwnProperty.call(type.styleAliases, style)) {
      style = type.styleAliases[style]
    }

    result[tag] = style
  }

  return result
}

function encodeHex (character) {
  let handle
  let length

  const string = character.toString(16).toUpperCase()

  if (character <= 0xFF) {
    handle = 'x'
    length = 2
  } else if (character <= 0xFFFF) {
    handle = 'u'
    length = 4
  } else if (character <= 0xFFFFFFFF) {
    handle = 'U'
    length = 8
  } else {
    throw new YAMLException('code point within a string may not be greater than 0xFFFFFFFF')
  }

  return '\\' + handle + common.repeat('0', length - string.length) + string
}

const QUOTING_TYPE_SINGLE = 1
const QUOTING_TYPE_DOUBLE = 2

function State (options) {
  this.schema = options['schema'] || DEFAULT_SCHEMA
  this.indent = Math.max(1, (options['indent'] || 2))
  this.noArrayIndent = options['noArrayIndent'] || false
  this.skipInvalid = options['skipInvalid'] || false
  this.flowLevel = (common.isNothing(options['flowLevel']) ? -1 : options['flowLevel'])
  this.styleMap = compileStyleMap(this.schema, options['styles'] || null)
  this.sortKeys = options['sortKeys'] || false
  this.lineWidth = options['lineWidth'] || 80
  this.noRefs = options['noRefs'] || false
  this.noCompatMode = options['noCompatMode'] || false
  this.condenseFlow = options['condenseFlow'] || false
  this.quotingType = options['quotingType'] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE
  this.forceQuotes = options['forceQuotes'] || false
  this.replacer = typeof options['replacer'] === 'function' ? options['replacer'] : null

  this.implicitTypes = this.schema.compiledImplicit
  this.explicitTypes = this.schema.compiledExplicit

  this.tag = null
  this.result = ''

  this.duplicates = []
  this.usedDuplicates = null
}

// Indents every line in a string. Empty lines (\n only) are not indented.
function indentString (string, spaces) {
  const ind = common.repeat(' ', spaces)
  let position = 0
  let result = ''
  const length = string.length

  while (position < length) {
    let line
    const next = string.indexOf('\n', position)
    if (next === -1) {
      line = string.slice(position)
      position = length
    } else {
      line = string.slice(position, next + 1)
      position = next + 1
    }

    if (line.length && line !== '\n') result += ind

    result += line
  }

  return result
}

function generateNextLine (state, level) {
  return '\n' + common.repeat(' ', state.indent * level)
}

function testImplicitResolving (state, str) {
  for (let index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    const type = state.implicitTypes[index]

    if (type.resolve(str)) {
      return true
    }
  }

  return false
}

// [33] s-white ::= s-space | s-tab
function isWhitespace (c) {
  return c === CHAR_SPACE || c === CHAR_TAB
}

// Returns true if the character can be printed without escaping.
// From YAML 1.2: "any allowed characters known to be non-printable
// should also be escaped. [However,] This isn’t mandatory"
// Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.
function isPrintable (c) {
  return (c >= 0x00020 && c <= 0x00007E) ||
    ((c >= 0x000A1 && c <= 0x00D7FF) && c !== 0x2028 && c !== 0x2029) ||
    ((c >= 0x0E000 && c <= 0x00FFFD) && c !== CHAR_BOM) ||
    (c >= 0x10000 && c <= 0x10FFFF)
}

// [34] ns-char ::= nb-char - s-white
// [27] nb-char ::= c-printable - b-char - c-byte-order-mark
// [26] b-char  ::= b-line-feed | b-carriage-return
// Including s-white (for some reason, examples doesn't match specs in this aspect)
// ns-char ::= c-printable - b-line-feed - b-carriage-return - c-byte-order-mark
function isNsCharOrWhitespace (c) {
  return isPrintable(c) &&
    c !== CHAR_BOM &&
    // - b-char
    c !== CHAR_CARRIAGE_RETURN &&
    c !== CHAR_LINE_FEED
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
function isPlainSafe (c, prev, inblock) {
  const cIsNsCharOrWhitespace = isNsCharOrWhitespace(c)
  const cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c)
  return (
    (
      // ns-plain-safe
      inblock // c = flow-in
        ? cIsNsCharOrWhitespace
        : cIsNsCharOrWhitespace &&
          // - c-flow-indicator
          c !== CHAR_COMMA &&
          c !== CHAR_LEFT_SQUARE_BRACKET &&
          c !== CHAR_RIGHT_SQUARE_BRACKET &&
          c !== CHAR_LEFT_CURLY_BRACKET &&
          c !== CHAR_RIGHT_CURLY_BRACKET
    ) &&
    // ns-plain-char
    c !== CHAR_SHARP && // false on '#'
    !(prev === CHAR_COLON && !cIsNsChar)
  ) || // false on ': '
  (isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP) || // change to true on '[^ ]#'
  (prev === CHAR_COLON && cIsNsChar) // change to true on ':[^ ]'
}

// Simplified test for values allowed as the first character in plain style.
function isPlainSafeFirst (c) {
  // Uses a subset of ns-char - c-indicator
  // where ns-char = nb-char - s-white.
  // No support of ( ( “?” | “:” | “-” ) /* Followed by an ns-plain-safe(c)) */ ) part
  return isPrintable(c) &&
    c !== CHAR_BOM &&
    !isWhitespace(c) && // - s-white
    // - (c-indicator ::=
    // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
    c !== CHAR_MINUS &&
    c !== CHAR_QUESTION &&
    c !== CHAR_COLON &&
    c !== CHAR_COMMA &&
    c !== CHAR_LEFT_SQUARE_BRACKET &&
    c !== CHAR_RIGHT_SQUARE_BRACKET &&
    c !== CHAR_LEFT_CURLY_BRACKET &&
    c !== CHAR_RIGHT_CURLY_BRACKET &&
    // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
    c !== CHAR_SHARP &&
    c !== CHAR_AMPERSAND &&
    c !== CHAR_ASTERISK &&
    c !== CHAR_EXCLAMATION &&
    c !== CHAR_VERTICAL_LINE &&
    c !== CHAR_EQUALS &&
    c !== CHAR_GREATER_THAN &&
    c !== CHAR_SINGLE_QUOTE &&
    c !== CHAR_DOUBLE_QUOTE &&
    // | “%” | “@” | “`”)
    c !== CHAR_PERCENT &&
    c !== CHAR_COMMERCIAL_AT &&
    c !== CHAR_GRAVE_ACCENT
}

// Simplified test for values allowed as the last character in plain style.
function isPlainSafeLast (c) {
  // just not whitespace or colon, it will be checked to be plain character later
  return !isWhitespace(c) && c !== CHAR_COLON
}

// Same as 'string'.codePointAt(pos), but works in older browsers.
function codePointAt (string, pos) {
  const first = string.charCodeAt(pos)
  let second

  if (first >= 0xD800 && first <= 0xDBFF && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1)
    if (second >= 0xDC00 && second <= 0xDFFF) {
      // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000
    }
  }
  return first
}

// Determines whether block indentation indicator is required.
function needIndentIndicator (string) {
  const leadingSpaceRe = /^\n* /
  return leadingSpaceRe.test(string)
}

const STYLE_PLAIN = 1
const STYLE_SINGLE = 2
const STYLE_LITERAL = 3
const STYLE_FOLDED = 4
const STYLE_DOUBLE = 5

// Determines which scalar styles are possible and returns the preferred style.
// lineWidth = -1 => no limit.
// Pre-conditions: str.length > 0.
// Post-conditions:
//    STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
//    STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
//    STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth != -1).
function chooseScalarStyle (string, singleLineOnly, indentPerLevel, lineWidth,
  testAmbiguousType, quotingType, forceQuotes, inblock) {
  let i
  let char = 0
  let prevChar = null
  let hasLineBreak = false
  let hasFoldableLine = false // only checked if shouldTrackWidth
  const shouldTrackWidth = lineWidth !== -1
  let previousLineBreak = -1 // count the first line correctly
  let plain = isPlainSafeFirst(codePointAt(string, 0)) &&
    isPlainSafeLast(codePointAt(string, string.length - 1))

  if (singleLineOnly || forceQuotes) {
    // Case: no block styles.
    // Check for disallowed characters to rule out plain and single.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i)
      if (!isPrintable(char)) {
        return STYLE_DOUBLE
      }
      plain = plain && isPlainSafe(char, prevChar, inblock)
      prevChar = char
    }
  } else {
    // Case: block styles permitted.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i)
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true
        // Check if any line can be folded.
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine ||
            // Foldable line = too long, and not more-indented.
            (i - previousLineBreak - 1 > lineWidth &&
             string[previousLineBreak + 1] !== ' ')
          previousLineBreak = i
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE
      }
      plain = plain && isPlainSafe(char, prevChar, inblock)
      prevChar = char
    }
    // in case the end is missing a \n
    hasFoldableLine = hasFoldableLine || (shouldTrackWidth &&
      (i - previousLineBreak - 1 > lineWidth &&
       string[previousLineBreak + 1] !== ' '))
  }
  // Although every style can represent \n without escaping, prefer block styles
  // for multiline, since they're more readable and they don't add empty lines.
  // Also prefer folding a super-long line.
  if (!hasLineBreak && !hasFoldableLine) {
    // Strings interpretable as another type have to be quoted;
    // e.g. the string 'true' vs. the boolean true.
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE
  }
  // Edge case: block indentation indicator can only have one digit.
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE
  }
  // At this point we know block styles are valid.
  // Prefer literal style unless we want to fold.
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE
}

// Note: line breaking/folding is implemented for only the folded style.
// NB. We drop the last trailing newline (if any) of a returned block scalar
//  since the dumper adds its own newline. This always works:
//    • No ending newline => unaffected; already using strip "-" chomping.
//    • Ending newline    => removed then restored.
//  Importantly, this keeps the "+" chomp indicator from gaining an extra line.
function writeScalar (state, string, level, iskey, inblock) {
  state.dump = (function () {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''"
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? ('"' + string + '"') : ("'" + string + "'")
      }
    }

    const indent = state.indent * Math.max(1, level) // no 0-indent scalars
    // As indentation gets deeper, let the width decrease monotonically
    // to the lower bound min(state.lineWidth, 40).
    // Note that this implies
    //  state.lineWidth ≤ 40 + state.indent: width is fixed at the lower bound.
    //  state.lineWidth > 40 + state.indent: width decreases until the lower bound.
    // This behaves better than a constant minimum width which disallows narrower options,
    // or an indent threshold which causes the width to suddenly increase.
    const lineWidth = (state.lineWidth === -1)
      ? -1
      : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent)

    // Without knowing if keys are implicit/explicit, assume implicit for safety.
    const singleLineOnly = iskey ||
      // No block styles in flow mode.
      (state.flowLevel > -1 && level >= state.flowLevel)
    function testAmbiguity (string) {
      return testImplicitResolving(state, string)
    }

    switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth,
      testAmbiguity, state.quotingType, state.forceQuotes && !iskey, inblock)) {
      case STYLE_PLAIN:
        return string
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'"
      case STYLE_LITERAL:
        return '|' + blockHeader(string, state.indent) +
          dropEndingNewline(indentString(string, indent))
      case STYLE_FOLDED:
        return '>' + blockHeader(string, state.indent) +
          dropEndingNewline(indentString(foldString(string, lineWidth), indent))
      case STYLE_DOUBLE:
        return '"' + escapeString(string, lineWidth) + '"'
      default:
        throw new YAMLException('impossible error: invalid scalar style')
    }
  }())
}

// Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.
function blockHeader (string, indentPerLevel) {
  const indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : ''

  // note the special case: the string '\n' counts as a "trailing" empty line.
  const clip = string[string.length - 1] === '\n'
  const keep = clip && (string[string.length - 2] === '\n' || string === '\n')
  const chomp = keep ? '+' : (clip ? '' : '-')

  return indentIndicator + chomp + '\n'
}

// (See the note for writeScalar.)
function dropEndingNewline (string) {
  return string[string.length - 1] === '\n' ? string.slice(0, -1) : string
}

// Note: a long line without a suitable break point will exceed the width limit.
// Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.
function foldString (string, width) {
  // In folded style, $k$ consecutive newlines output as $k+1$ newlines—
  // unless they're before or after a more-indented line, or at the very
  // beginning or end, in which case $k$ maps to $k$.
  // Therefore, parse each chunk as newline(s) followed by a content line.
  const lineRe = /(\n+)([^\n]*)/g

  // first line (possibly an empty line)
  let result = (function () {
    let nextLF = string.indexOf('\n')
    nextLF = nextLF !== -1 ? nextLF : string.length
    lineRe.lastIndex = nextLF
    return foldLine(string.slice(0, nextLF), width)
  }())
  // If we haven't reached the first content line yet, don't add an extra \n.
  let prevMoreIndented = string[0] === '\n' || string[0] === ' '
  let moreIndented

  // rest of the lines
  let match
  while ((match = lineRe.exec(string))) {
    const prefix = match[1]
    const line = match[2]

    moreIndented = (line[0] === ' ')
    result += prefix +
      ((!prevMoreIndented && !moreIndented && line !== '') ? '\n' : '') +
      foldLine(line, width)
    prevMoreIndented = moreIndented
  }

  return result
}

// Greedy line breaking.
// Picks the longest line under the limit each time,
// otherwise settles for the shortest line over the limit.
// NB. More-indented lines *cannot* be folded, as that would add an extra \n.
function foldLine (line, width) {
  if (line === '' || line[0] === ' ') return line

  // Since a more-indented line adds a \n, breaks can't be followed by a space.
  const breakRe = / [^ ]/g // note: the match index will always be <= length-2.
  let match
  // start is an inclusive index. end, curr, and next are exclusive.
  let start = 0
  let end
  let curr = 0
  let next = 0
  let result = ''

  // Invariants: 0 <= start <= length-1.
  //   0 <= curr <= next <= max(0, length-2). curr - start <= width.
  // Inside the loop:
  //   A match implies length >= 2, so curr and next are <= length-2.
  while ((match = breakRe.exec(line))) {
    next = match.index
    // maintain invariant: curr - start <= width
    if (next - start > width) {
      end = (curr > start) ? curr : next // derive end <= length-2
      result += '\n' + line.slice(start, end)
      // skip the space that was output as \n
      start = end + 1                    // derive start <= length-1
    }
    curr = next
  }

  // By the invariants, start <= length-1, so there is something left over.
  // It is either the whole string or a part starting from non-whitespace.
  result += '\n'
  // Insert a break if the remainder is too long and there is a break available.
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + '\n' + line.slice(curr + 1)
  } else {
    result += line.slice(start)
  }

  return result.slice(1) // drop extra \n joiner
}

// Escapes a double-quoted string.
function escapeString (string) {
  let result = ''
  let char = 0

  for (let i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
    char = codePointAt(string, i)
    const escapeSeq = ESCAPE_SEQUENCES[char]

    if (!escapeSeq && isPrintable(char)) {
      result += string[i]
      if (char >= 0x10000) result += string[i + 1]
    } else {
      result += escapeSeq || encodeHex(char)
    }
  }

  return result
}

function writeFlowSequence (state, level, object) {
  let _result = ''
  const _tag = state.tag

  for (let index = 0, length = object.length; index < length; index += 1) {
    let value = object[index]

    if (state.replacer) {
      value = state.replacer.call(object, String(index), value)
    }

    // Write only valid elements, put null instead of invalid elements.
    if (writeNode(state, level, value, false, false) ||
        (typeof value === 'undefined' &&
         writeNode(state, level, null, false, false))) {
      if (_result !== '') _result += ',' + (!state.condenseFlow ? ' ' : '')
      _result += state.dump
    }
  }

  state.tag = _tag
  state.dump = '[' + _result + ']'
}

function writeBlockSequence (state, level, object, compact) {
  let _result = ''
  const _tag = state.tag

  for (let index = 0, length = object.length; index < length; index += 1) {
    let value = object[index]

    if (state.replacer) {
      value = state.replacer.call(object, String(index), value)
    }

    // Write only valid elements, put null instead of invalid elements.
    if (writeNode(state, level + 1, value, true, true, false, true) ||
        (typeof value === 'undefined' &&
         writeNode(state, level + 1, null, true, true, false, true))) {
      if (!compact || _result !== '') {
        _result += generateNextLine(state, level)
      }

      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += '-'
      } else {
        _result += '- '
      }

      _result += state.dump
    }
  }

  state.tag = _tag
  state.dump = _result || '[]' // Empty sequence if no valid values.
}

function writeFlowMapping (state, level, object) {
  let _result = ''
  const _tag = state.tag
  const objectKeyList = Object.keys(object)

  for (let index = 0, length = objectKeyList.length; index < length; index += 1) {
    let pairBuffer = ''
    if (_result !== '') pairBuffer += ', '

    if (state.condenseFlow) pairBuffer += '"'

    const objectKey = objectKeyList[index]
    let objectValue = object[objectKey]

    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue)
    }

    if (!writeNode(state, level, objectKey, false, false)) {
      continue // Skip this pair because of invalid key;
    }

    if (state.dump.length > 1024) pairBuffer += '? '

    pairBuffer += state.dump + (state.condenseFlow ? '"' : '') + ':' + (state.condenseFlow ? '' : ' ')

    if (!writeNode(state, level, objectValue, false, false)) {
      continue // Skip this pair because of invalid value.
    }

    pairBuffer += state.dump

    // Both key and value are valid.
    _result += pairBuffer
  }

  state.tag = _tag
  state.dump = '{' + _result + '}'
}

function writeBlockMapping (state, level, object, compact) {
  let _result = ''
  const _tag = state.tag
  const objectKeyList = Object.keys(object)

  // Allow sorting keys so that the output file is deterministic
  if (state.sortKeys === true) {
    // Default sorting
    objectKeyList.sort()
  } else if (typeof state.sortKeys === 'function') {
    // Custom sort function
    objectKeyList.sort(state.sortKeys)
  } else if (state.sortKeys) {
    // Something is wrong
    throw new YAMLException('sortKeys must be a boolean or a function')
  }

  for (let index = 0, length = objectKeyList.length; index < length; index += 1) {
    let pairBuffer = ''

    if (!compact || _result !== '') {
      pairBuffer += generateNextLine(state, level)
    }

    const objectKey = objectKeyList[index]
    let objectValue = object[objectKey]

    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue)
    }

    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue // Skip this pair because of invalid key.
    }

    const explicitPair = (state.tag !== null && state.tag !== '?') ||
                   (state.dump && state.dump.length > 1024)

    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += '?'
      } else {
        pairBuffer += '? '
      }
    }

    pairBuffer += state.dump

    if (explicitPair) {
      pairBuffer += generateNextLine(state, level)
    }

    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue // Skip this pair because of invalid value.
    }

    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ':'
    } else {
      pairBuffer += ': '
    }

    pairBuffer += state.dump

    // Both key and value are valid.
    _result += pairBuffer
  }

  state.tag = _tag
  state.dump = _result || '{}' // Empty mapping if no valid pairs.
}

function detectType (state, object, explicit) {
  const typeList = explicit ? state.explicitTypes : state.implicitTypes

  for (let index = 0, length = typeList.length; index < length; index += 1) {
    const type = typeList[index]

    if ((type.instanceOf || type.predicate) &&
        (!type.instanceOf || ((typeof object === 'object') && (object instanceof type.instanceOf))) &&
        (!type.predicate || type.predicate(object))) {
      if (explicit) {
        if (type.multi && type.representName) {
          state.tag = type.representName(object)
        } else {
          state.tag = type.tag
        }
      } else {
        state.tag = '?'
      }

      if (type.represent) {
        const style = state.styleMap[type.tag] || type.defaultStyle

        let _result
        if (_toString.call(type.represent) === '[object Function]') {
          _result = type.represent(object, style)
        } else if (_hasOwnProperty.call(type.represent, style)) {
          _result = type.represent[style](object, style)
        } else {
          throw new YAMLException('!<' + type.tag + '> tag resolver accepts not "' + style + '" style')
        }

        state.dump = _result
      }

      return true
    }
  }

  return false
}

// Serializes `object` and writes it to global `result`.
// Returns true on success, or false on invalid object.
//
function writeNode (state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null
  state.dump = object

  if (!detectType(state, object, false)) {
    detectType(state, object, true)
  }

  const type = _toString.call(state.dump)
  const inblock = block

  if (block) {
    block = (state.flowLevel < 0 || state.flowLevel > level)
  }

  const objectOrArray = type === '[object Object]' || type === '[object Array]'
  let duplicateIndex
  let duplicate

  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object)
    duplicate = duplicateIndex !== -1
  }

  if ((state.tag !== null && state.tag !== '?') || duplicate || (state.indent !== 2 && level > 0)) {
    compact = false
  }

  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = '*ref_' + duplicateIndex
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true
    }
    if (type === '[object Object]') {
      if (block && (Object.keys(state.dump).length !== 0)) {
        writeBlockMapping(state, level, state.dump, compact)
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump
        }
      } else {
        writeFlowMapping(state, level, state.dump)
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump
        }
      }
    } else if (type === '[object Array]') {
      if (block && (state.dump.length !== 0)) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact)
        } else {
          writeBlockSequence(state, level, state.dump, compact)
        }
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump
        }
      } else {
        writeFlowSequence(state, level, state.dump)
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump
        }
      }
    } else if (type === '[object String]') {
      if (state.tag !== '?') {
        writeScalar(state, state.dump, level, iskey, inblock)
      }
    } else if (type === '[object Undefined]') {
      return false
    } else {
      if (state.skipInvalid) return false
      throw new YAMLException('unacceptable kind of an object to dump ' + type)
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
      let tagStr = encodeURI(
        state.tag[0] === '!' ? state.tag.slice(1) : state.tag
      ).replace(/!/g, '%21')

      if (state.tag[0] === '!') {
        tagStr = '!' + tagStr
      } else if (tagStr.slice(0, 18) === 'tag:yaml.org,2002:') {
        tagStr = '!!' + tagStr.slice(18)
      } else {
        tagStr = '!<' + tagStr + '>'
      }

      state.dump = tagStr + ' ' + state.dump
    }
  }

  return true
}

function getDuplicateReferences (object, state) {
  const objects = []
  const duplicatesIndexes = []

  inspectNode(object, objects, duplicatesIndexes)

  const length = duplicatesIndexes.length
  for (let index = 0; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]])
  }
  state.usedDuplicates = new Array(length)
}

function inspectNode (object, objects, duplicatesIndexes) {
  if (object !== null && typeof object === 'object') {
    const index = objects.indexOf(object)
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index)
      }
    } else {
      objects.push(object)

      if (Array.isArray(object)) {
        for (let i = 0, length = object.length; i < length; i += 1) {
          inspectNode(object[i], objects, duplicatesIndexes)
        }
      } else {
        const objectKeyList = Object.keys(object)

        for (let i = 0, length = objectKeyList.length; i < length; i += 1) {
          inspectNode(object[objectKeyList[i]], objects, duplicatesIndexes)
        }
      }
    }
  }
}

function dump (input, options) {
  options = options || {}

  const state = new State(options)

  if (!state.noRefs) getDuplicateReferences(input, state)

  let value = input

  if (state.replacer) {
    value = state.replacer.call({ '': value }, '', value)
  }

  if (writeNode(state, 0, value, true, true)) return state.dump + '\n'

  return ''
}

module.exports.dump = dump


/***/ },

/***/ 1538
(module) {

"use strict";
// YAML error class. http://stackoverflow.com/questions/8458984
//


function formatError (exception, compact) {
  let where = ''
  const message = exception.reason || '(unknown reason)'

  if (!exception.mark) return message

  if (exception.mark.name) {
    where += 'in "' + exception.mark.name + '" '
  }

  where += '(' + (exception.mark.line + 1) + ':' + (exception.mark.column + 1) + ')'

  if (!compact && exception.mark.snippet) {
    where += '\n\n' + exception.mark.snippet
  }

  return message + ' ' + where
}

function YAMLException (reason, mark) {
  // Super constructor
  Error.call(this)

  this.name = 'YAMLException'
  this.reason = reason
  this.mark = mark
  this.message = formatError(this, false)

  // Include stack trace in error object
  if (Error.captureStackTrace) {
    // Chrome and NodeJS
    Error.captureStackTrace(this, this.constructor)
  } else {
    // FF, IE 10+ and Safari 6+. Fallback for others
    this.stack = (new Error()).stack || ''
  }
}

// Inherit from Error
YAMLException.prototype = Object.create(Error.prototype)
YAMLException.prototype.constructor = YAMLException

YAMLException.prototype.toString = function toString (compact) {
  return this.name + ': ' + formatError(this, compact)
}

module.exports = YAMLException


/***/ },

/***/ 9176
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const common = __webpack_require__(4018)
const YAMLException = __webpack_require__(1538)
const makeSnippet = __webpack_require__(7694)
const DEFAULT_SCHEMA = __webpack_require__(5674)

const _hasOwnProperty = Object.prototype.hasOwnProperty

const CONTEXT_FLOW_IN = 1
const CONTEXT_FLOW_OUT = 2
const CONTEXT_BLOCK_IN = 3
const CONTEXT_BLOCK_OUT = 4

const CHOMPING_CLIP = 1
const CHOMPING_STRIP = 2
const CHOMPING_KEEP = 3

// eslint-disable-next-line no-control-regex
const PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/
const PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/
// eslint-disable-next-line no-useless-escape
const PATTERN_FLOW_INDICATORS = /[,\[\]{}]/
// eslint-disable-next-line no-useless-escape
const PATTERN_TAG_HANDLE = /^(?:!|!!|![0-9A-Za-z-]+!)$/
// eslint-disable-next-line no-useless-escape
const PATTERN_TAG_URI = /^(?:!|[^,\[\]{}])(?:%[0-9a-f]{2}|[0-9a-z\-#;/?:@&=+$,_.!~*'()\[\]])*$/i

function _class (obj) { return Object.prototype.toString.call(obj) }

function isEol (c) {
  return (c === 0x0A/* LF */) || (c === 0x0D/* CR */)
}

function isWhiteSpace (c) {
  return (c === 0x09/* Tab */) || (c === 0x20/* Space */)
}

function isWsOrEol (c) {
  return (c === 0x09/* Tab */) ||
         (c === 0x20/* Space */) ||
         (c === 0x0A/* LF */) ||
         (c === 0x0D/* CR */)
}

function isFlowIndicator (c) {
  return c === 0x2C/* , */ ||
         c === 0x5B/* [ */ ||
         c === 0x5D/* ] */ ||
         c === 0x7B/* { */ ||
         c === 0x7D/* } */
}

function fromHexCode (c) {
  if ((c >= 0x30/* 0 */) && (c <= 0x39/* 9 */)) {
    return c - 0x30
  }

  const lc = c | 0x20

  if ((lc >= 0x61/* a */) && (lc <= 0x66/* f */)) {
    return lc - 0x61 + 10
  }

  return -1
}

function escapedHexLen (c) {
  if (c === 0x78/* x */) { return 2 }
  if (c === 0x75/* u */) { return 4 }
  if (c === 0x55/* U */) { return 8 }
  return 0
}

function fromDecimalCode (c) {
  if ((c >= 0x30/* 0 */) && (c <= 0x39/* 9 */)) {
    return c - 0x30
  }

  return -1
}

function simpleEscapeSequence (c) {
  switch (c) {
    case 0x30/* 0 */: return '\x00'
    case 0x61/* a */: return '\x07'
    case 0x62/* b */: return '\x08'
    case 0x74/* t */: return '\x09'
    case 0x09/* Tab */: return '\x09'
    case 0x6E/* n */: return '\x0A'
    case 0x76/* v */: return '\x0B'
    case 0x66/* f */: return '\x0C'
    case 0x72/* r */: return '\x0D'
    case 0x65/* e */: return '\x1B'
    case 0x20/* Space */: return ' '
    case 0x22/* " */: return '\x22'
    case 0x2F/* / */: return '/'
    case 0x5C/* \ */: return '\x5C'
    case 0x4E/* N */: return '\x85'
    case 0x5F/* _ */: return '\xA0'
    case 0x4C/* L */: return '\u2028'
    case 0x50/* P */: return '\u2029'
    default: return ''
  }
}

function charFromCodepoint (c) {
  if (c <= 0xFFFF) {
    return String.fromCharCode(c)
  }
  // Encode UTF-16 surrogate pair
  // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
  return String.fromCharCode(
    ((c - 0x010000) >> 10) + 0xD800,
    ((c - 0x010000) & 0x03FF) + 0xDC00
  )
}

// set a property of a literal object, while protecting against prototype pollution,
// see https://github.com/nodeca/js-yaml/issues/164 for more details
function setProperty (object, key, value) {
  // used for this specific key only because Object.defineProperty is slow
  if (key === '__proto__') {
    Object.defineProperty(object, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: value
    })
  } else {
    object[key] = value
  }
}

const simpleEscapeCheck = new Array(256) // integer, for fast access
const simpleEscapeMap = new Array(256)
for (let i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0
  simpleEscapeMap[i] = simpleEscapeSequence(i)
}

function State (input, options) {
  this.input = input

  this.filename = options['filename'] || null
  this.schema = options['schema'] || DEFAULT_SCHEMA
  this.onWarning = options['onWarning'] || null
  // (Hidden) Remove? makes the loader to expect YAML 1.1 documents
  // if such documents have no explicit %YAML directive
  this.legacy = options['legacy'] || false

  this.json = options['json'] || false
  this.listener = options['listener'] || null
  this.maxDepth = typeof options['maxDepth'] === 'number' ? options['maxDepth'] : 100
  this.maxTotalMergeKeys = typeof options['maxTotalMergeKeys'] === 'number' ? options['maxTotalMergeKeys'] : 10000

  this.implicitTypes = this.schema.compiledImplicit
  this.typeMap = this.schema.compiledTypeMap

  this.length = input.length
  this.position = 0
  this.line = 0
  this.lineStart = 0
  this.lineIndent = 0
  this.depth = 0
  this.totalMergeKeys = 0

  // position of first leading tab in the current line,
  // used to make sure there are no tabs in the indentation
  this.firstTabInLine = -1

  this.documents = []
  this.anchorMapTransactions = []

  /*
  this.version;
  this.checkLineBreaks;
  this.tagMap;
  this.anchorMap;
  this.tag;
  this.anchor;
  this.kind;
  this.result; */
}

function generateError (state, message) {
  const mark = {
    name: state.filename,
    buffer: state.input.slice(0, -1), // omit trailing \0
    position: state.position,
    line: state.line,
    column: state.position - state.lineStart
  }

  mark.snippet = makeSnippet(mark)

  return new YAMLException(message, mark)
}

function throwError (state, message) {
  throw generateError(state, message)
}

function throwWarning (state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message))
  }
}

function storeAnchor (state, name, value) {
  const transactions = state.anchorMapTransactions

  if (transactions.length !== 0) {
    const transaction = transactions[transactions.length - 1]

    if (!_hasOwnProperty.call(transaction, name)) {
      transaction[name] = {
        existed: _hasOwnProperty.call(state.anchorMap, name),
        value: state.anchorMap[name]
      }
    }
  }

  state.anchorMap[name] = value
}

function beginAnchorTransaction (state) {
  state.anchorMapTransactions.push(Object.create(null))
}

function commitAnchorTransaction (state) {
  const transaction = state.anchorMapTransactions.pop()
  const transactions = state.anchorMapTransactions

  if (transactions.length === 0) return

  const parent = transactions[transactions.length - 1]
  const names = Object.keys(transaction)

  for (let index = 0, length = names.length; index < length; index += 1) {
    const name = names[index]

    if (!_hasOwnProperty.call(parent, name)) {
      parent[name] = transaction[name]
    }
  }
}

function rollbackAnchorTransaction (state) {
  const transaction = state.anchorMapTransactions.pop()
  const names = Object.keys(transaction)

  for (let index = names.length - 1; index >= 0; index -= 1) {
    const entry = transaction[names[index]]

    if (entry.existed) {
      state.anchorMap[names[index]] = entry.value
    } else {
      delete state.anchorMap[names[index]]
    }
  }
}

function snapshotState (state) {
  return {
    position: state.position,
    line: state.line,
    lineStart: state.lineStart,
    lineIndent: state.lineIndent,
    firstTabInLine: state.firstTabInLine,
    tag: state.tag,
    anchor: state.anchor,
    kind: state.kind,
    result: state.result
  }
}

function restoreState (state, snapshot) {
  state.position = snapshot.position
  state.line = snapshot.line
  state.lineStart = snapshot.lineStart
  state.lineIndent = snapshot.lineIndent
  state.firstTabInLine = snapshot.firstTabInLine
  state.tag = snapshot.tag
  state.anchor = snapshot.anchor
  state.kind = snapshot.kind
  state.result = snapshot.result
}

const directiveHandlers = {

  YAML: function handleYamlDirective (state, name, args) {
    if (state.version !== null) {
      throwError(state, 'duplication of %YAML directive')
    }

    if (args.length !== 1) {
      throwError(state, 'YAML directive accepts exactly one argument')
    }

    const match = /^([0-9]+)\.([0-9]+)$/.exec(args[0])

    if (match === null) {
      throwError(state, 'ill-formed argument of the YAML directive')
    }

    const major = parseInt(match[1], 10)
    const minor = parseInt(match[2], 10)

    if (major !== 1) {
      throwError(state, 'unacceptable YAML version of the document')
    }

    state.version = args[0]
    state.checkLineBreaks = (minor < 2)

    if (minor !== 1 && minor !== 2) {
      throwWarning(state, 'unsupported YAML version of the document')
    }
  },

  TAG: function handleTagDirective (state, name, args) {
    let prefix

    if (args.length !== 2) {
      throwError(state, 'TAG directive accepts exactly two arguments')
    }

    const handle = args[0]
    prefix = args[1]

    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, 'ill-formed tag handle (first argument) of the TAG directive')
    }

    if (_hasOwnProperty.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle')
    }

    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive')
    }

    try {
      prefix = decodeURIComponent(prefix)
    } catch (err) {
      throwError(state, 'tag prefix is malformed: ' + prefix)
    }

    state.tagMap[handle] = prefix
  }
}

function captureSegment (state, start, end, checkJson) {
  if (start < end) {
    const _result = state.input.slice(start, end)

    if (checkJson) {
      for (let _position = 0, _length = _result.length; _position < _length; _position += 1) {
        const _character = _result.charCodeAt(_position)
        if (!(_character === 0x09 ||
              (_character >= 0x20 && _character <= 0x10FFFF))) {
          throwError(state, 'expected valid JSON character')
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, 'the stream contains non-printable characters')
    }

    state.result += _result
  }
}

function mergeMappings (state, destination, source, overridableKeys) {
  if (!common.isObject(source)) {
    throwError(state, 'cannot merge mappings; the provided source object is unacceptable')
  }

  const sourceKeys = Object.keys(source)

  for (let index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    const key = sourceKeys[index]

    if (state.maxTotalMergeKeys !== -1 && ++state.totalMergeKeys > state.maxTotalMergeKeys) {
      throwError(state, 'merge keys exceeded maxTotalMergeKeys (' + state.maxTotalMergeKeys + ')')
    }

    if (!_hasOwnProperty.call(destination, key)) {
      setProperty(destination, key, source[key])
      overridableKeys[key] = true
    }
  }
}

function storeMappingPair (state, _result, overridableKeys, keyTag, keyNode, valueNode,
  startLine, startLineStart, startPos) {
  // The output is a plain object here, so keys can only be strings.
  // We need to convert keyNode to a string, but doing so can hang the process
  // (deeply nested arrays that explode exponentially using aliases).
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode)

    for (let index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, 'nested arrays are not supported inside keys')
      }

      if (typeof keyNode === 'object' && _class(keyNode[index]) === '[object Object]') {
        keyNode[index] = '[object Object]'
      }
    }
  }

  // Avoid code execution in load() via toString property
  // (still use its own toString for arrays, timestamps,
  // and whatever user schema extensions happen to have @@toStringTag)
  if (typeof keyNode === 'object' && _class(keyNode) === '[object Object]') {
    keyNode = '[object Object]'
  }

  keyNode = String(keyNode)

  if (_result === null) {
    _result = {}
  }

  if (keyTag === 'tag:yaml.org,2002:merge') {
    if (Array.isArray(valueNode)) {
      for (let index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys)
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys)
    }
  } else {
    if (!state.json &&
        !_hasOwnProperty.call(overridableKeys, keyNode) &&
        _hasOwnProperty.call(_result, keyNode)) {
      state.line = startLine || state.line
      state.lineStart = startLineStart || state.lineStart
      state.position = startPos || state.position
      throwError(state, 'duplicated mapping key')
    }

    setProperty(_result, keyNode, valueNode)
    delete overridableKeys[keyNode]
  }

  return _result
}

function readLineBreak (state) {
  const ch = state.input.charCodeAt(state.position)

  if (ch === 0x0A/* LF */) {
    state.position++
  } else if (ch === 0x0D/* CR */) {
    state.position++
    if (state.input.charCodeAt(state.position) === 0x0A/* LF */) {
      state.position++
    }
  } else {
    throwError(state, 'a line break is expected')
  }

  state.line += 1
  state.lineStart = state.position
  state.firstTabInLine = -1
}

function skipSeparationSpace (state, allowComments, checkIndent) {
  let lineBreaks = 0
  let ch = state.input.charCodeAt(state.position)

  while (ch !== 0) {
    while (isWhiteSpace(ch)) {
      if (ch === 0x09/* Tab */ && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position
      }
      ch = state.input.charCodeAt(++state.position)
    }

    if (allowComments && ch === 0x23/* # */) {
      do {
        ch = state.input.charCodeAt(++state.position)
      } while (ch !== 0x0A/* LF */ && ch !== 0x0D/* CR */ && ch !== 0)
    }

    if (isEol(ch)) {
      readLineBreak(state)

      ch = state.input.charCodeAt(state.position)
      lineBreaks++
      state.lineIndent = 0

      while (ch === 0x20/* Space */) {
        state.lineIndent++
        ch = state.input.charCodeAt(++state.position)
      }
    } else {
      break
    }
  }

  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, 'deficient indentation')
  }

  return lineBreaks
}

function testDocumentSeparator (state) {
  let _position = state.position
  let ch = state.input.charCodeAt(_position)

  // Condition state.position === state.lineStart is tested
  // in parent on each call, for efficiency. No needs to test here again.
  if ((ch === 0x2D/* - */ || ch === 0x2E/* . */) &&
      ch === state.input.charCodeAt(_position + 1) &&
      ch === state.input.charCodeAt(_position + 2)) {
    _position += 3

    ch = state.input.charCodeAt(_position)

    if (ch === 0 || isWsOrEol(ch)) {
      return true
    }
  }

  return false
}

function writeFoldedLines (state, count) {
  if (count === 1) {
    state.result += ' '
  } else if (count > 1) {
    state.result += common.repeat('\n', count - 1)
  }
}

function readPlainScalar (state, nodeIndent, withinFlowCollection) {
  let captureStart
  let captureEnd
  let hasPendingContent
  let _line
  let _lineStart
  let _lineIndent
  const _kind = state.kind
  const _result = state.result

  let ch = state.input.charCodeAt(state.position)

  if (isWsOrEol(ch) ||
      isFlowIndicator(ch) ||
      ch === 0x23/* # */ ||
      ch === 0x26/* & */ ||
      ch === 0x2A/* * */ ||
      ch === 0x21/* ! */ ||
      ch === 0x7C/* | */ ||
      ch === 0x3E/* > */ ||
      ch === 0x27/* ' */ ||
      ch === 0x22/* " */ ||
      ch === 0x25/* % */ ||
      ch === 0x40/* @ */ ||
      ch === 0x60/* ` */) {
    return false
  }

  if (ch === 0x3F/* ? */ || ch === 0x2D/* - */) {
    const following = state.input.charCodeAt(state.position + 1)

    if (isWsOrEol(following) ||
        (withinFlowCollection && isFlowIndicator(following))) {
      return false
    }
  }

  state.kind = 'scalar'
  state.result = ''
  captureStart = captureEnd = state.position
  hasPendingContent = false

  while (ch !== 0) {
    if (ch === 0x3A/* : */) {
      const following = state.input.charCodeAt(state.position + 1)

      if (isWsOrEol(following) ||
          (withinFlowCollection && isFlowIndicator(following))) {
        break
      }
    } else if (ch === 0x23/* # */) {
      const preceding = state.input.charCodeAt(state.position - 1)

      if (isWsOrEol(preceding)) {
        break
      }
    } else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
               (withinFlowCollection && isFlowIndicator(ch))) {
      break
    } else if (isEol(ch)) {
      _line = state.line
      _lineStart = state.lineStart
      _lineIndent = state.lineIndent
      skipSeparationSpace(state, false, -1)

      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true
        ch = state.input.charCodeAt(state.position)
        continue
      } else {
        state.position = captureEnd
        state.line = _line
        state.lineStart = _lineStart
        state.lineIndent = _lineIndent
        break
      }
    }

    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false)
      writeFoldedLines(state, state.line - _line)
      captureStart = captureEnd = state.position
      hasPendingContent = false
    }

    if (!isWhiteSpace(ch)) {
      captureEnd = state.position + 1
    }

    ch = state.input.charCodeAt(++state.position)
  }

  captureSegment(state, captureStart, captureEnd, false)

  if (state.result) {
    return true
  }

  state.kind = _kind
  state.result = _result
  return false
}

function readSingleQuotedScalar (state, nodeIndent) {
  let captureStart
  let captureEnd

  let ch = state.input.charCodeAt(state.position)

  if (ch !== 0x27/* ' */) {
    return false
  }

  state.kind = 'scalar'
  state.result = ''
  state.position++
  captureStart = captureEnd = state.position

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x27/* ' */) {
      captureSegment(state, captureStart, state.position, true)
      ch = state.input.charCodeAt(++state.position)

      if (ch === 0x27/* ' */) {
        captureStart = state.position
        state.position++
        captureEnd = state.position
      } else {
        return true
      }
    } else if (isEol(ch)) {
      captureSegment(state, captureStart, captureEnd, true)
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent))
      captureStart = captureEnd = state.position
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a single quoted scalar')
    } else {
      state.position++
      if (!isWhiteSpace(ch)) {
        captureEnd = state.position
      }
    }
  }

  throwError(state, 'unexpected end of the stream within a single quoted scalar')
}

function readDoubleQuotedScalar (state, nodeIndent) {
  let captureStart
  let captureEnd
  let tmp

  let ch = state.input.charCodeAt(state.position)

  if (ch !== 0x22/* " */) {
    return false
  }

  state.kind = 'scalar'
  state.result = ''
  state.position++
  captureStart = captureEnd = state.position

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x22/* " */) {
      captureSegment(state, captureStart, state.position, true)
      state.position++
      return true
    } else if (ch === 0x5C/* \ */) {
      captureSegment(state, captureStart, state.position, true)
      ch = state.input.charCodeAt(++state.position)

      if (isEol(ch)) {
        skipSeparationSpace(state, false, nodeIndent)

        // TODO: rework to inline fn with no type cast?
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch]
        state.position++
      } else if ((tmp = escapedHexLen(ch)) > 0) {
        let hexLength = tmp
        let hexResult = 0

        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position)

          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp
          } else {
            throwError(state, 'expected hexadecimal character')
          }
        }

        state.result += charFromCodepoint(hexResult)

        state.position++
      } else {
        throwError(state, 'unknown escape sequence')
      }

      captureStart = captureEnd = state.position
    } else if (isEol(ch)) {
      captureSegment(state, captureStart, captureEnd, true)
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent))
      captureStart = captureEnd = state.position
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a double quoted scalar')
    } else {
      state.position++
      if (!isWhiteSpace(ch)) {
        captureEnd = state.position
      }
    }
  }

  throwError(state, 'unexpected end of the stream within a double quoted scalar')
}

function readFlowCollection (state, nodeIndent) {
  let readNext = true
  let _line
  let _lineStart
  let _pos
  const _tag = state.tag
  let _result
  const _anchor = state.anchor
  let terminator
  let isPair
  let isExplicitPair
  let isMapping
  const overridableKeys = Object.create(null)
  let keyNode
  let keyTag
  let valueNode

  let ch = state.input.charCodeAt(state.position)

  if (ch === 0x5B/* [ */) {
    terminator = 0x5D/* ] */
    isMapping = false
    _result = []
  } else if (ch === 0x7B/* { */) {
    terminator = 0x7D/* } */
    isMapping = true
    _result = {}
  } else {
    return false
  }

  if (state.anchor !== null) {
    storeAnchor(state, state.anchor, _result)
  }

  ch = state.input.charCodeAt(++state.position)

  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent)

    ch = state.input.charCodeAt(state.position)

    if (ch === terminator) {
      state.position++
      state.tag = _tag
      state.anchor = _anchor
      state.kind = isMapping ? 'mapping' : 'sequence'
      state.result = _result
      return true
    } else if (!readNext) {
      throwError(state, 'missed comma between flow collection entries')
    } else if (ch === 0x2C/* , */) {
      // "flow collection entries can never be completely empty", as per YAML 1.2, section 7.4
      throwError(state, "expected the node content, but found ','")
    }

    keyTag = keyNode = valueNode = null
    isPair = isExplicitPair = false

    if (ch === 0x3F/* ? */) {
      const following = state.input.charCodeAt(state.position + 1)

      if (isWsOrEol(following)) {
        isPair = isExplicitPair = true
        state.position++
        skipSeparationSpace(state, true, nodeIndent)
      }
    }

    _line = state.line // Save the current line.
    _lineStart = state.lineStart
    _pos = state.position
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true)
    keyTag = state.tag
    keyNode = state.result
    skipSeparationSpace(state, true, nodeIndent)

    ch = state.input.charCodeAt(state.position)

    if ((isExplicitPair || state.line === _line) && ch === 0x3A/* : */) {
      isPair = true
      ch = state.input.charCodeAt(++state.position)
      skipSeparationSpace(state, true, nodeIndent)
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true)
      valueNode = state.result
    }

    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos)
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos))
    } else {
      _result.push(keyNode)
    }

    skipSeparationSpace(state, true, nodeIndent)

    ch = state.input.charCodeAt(state.position)

    if (ch === 0x2C/* , */) {
      readNext = true
      ch = state.input.charCodeAt(++state.position)
    } else {
      readNext = false
    }
  }

  throwError(state, 'unexpected end of the stream within a flow collection')
}

function readBlockScalar (state, nodeIndent) {
  let folding
  let chomping = CHOMPING_CLIP
  let didReadContent = false
  let detectedIndent = false
  let textIndent = nodeIndent
  let emptyLines = 0
  let atMoreIndented = false
  let tmp

  let ch = state.input.charCodeAt(state.position)

  if (ch === 0x7C/* | */) {
    folding = false
  } else if (ch === 0x3E/* > */) {
    folding = true
  } else {
    return false
  }

  state.kind = 'scalar'
  state.result = ''

  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position)

    if (ch === 0x2B/* + */ || ch === 0x2D/* - */) {
      if (CHOMPING_CLIP === chomping) {
        chomping = (ch === 0x2B/* + */) ? CHOMPING_KEEP : CHOMPING_STRIP
      } else {
        throwError(state, 'repeat of a chomping mode identifier')
      }
    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one')
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1
        detectedIndent = true
      } else {
        throwError(state, 'repeat of an indentation width identifier')
      }
    } else {
      break
    }
  }

  if (isWhiteSpace(ch)) {
    do { ch = state.input.charCodeAt(++state.position) }
    while (isWhiteSpace(ch))

    if (ch === 0x23/* # */) {
      do { ch = state.input.charCodeAt(++state.position) }
      while (!isEol(ch) && (ch !== 0))
    }
  }

  while (ch !== 0) {
    readLineBreak(state)
    state.lineIndent = 0

    ch = state.input.charCodeAt(state.position)

    // eslint-disable-next-line no-unmodified-loop-condition
    while ((!detectedIndent || state.lineIndent < textIndent) &&
           (ch === 0x20/* Space */)) {
      state.lineIndent++
      ch = state.input.charCodeAt(++state.position)
    }

    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent
    }

    if (isEol(ch)) {
      emptyLines++
      continue
    }

    if (!detectedIndent && textIndent === 0) {
      throwError(state, 'missing indentation for block scalar')
    }

    // End of the scalar.
    if (state.lineIndent < textIndent) {
      // Perform the chomping.
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines)
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) { // i.e. only if the scalar is not empty.
          state.result += '\n'
        }
      }

      // Break this `while` cycle and go to the funciton's epilogue.
      break
    }

    // Folded style: use fancy rules to handle line breaks.
    if (folding) {
      // Lines starting with white space characters (more-indented lines) are not folded.
      if (isWhiteSpace(ch)) {
        atMoreIndented = true
        // except for the first content line (cf. Example 8.1)
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines)

      // End of more-indented block.
      } else if (atMoreIndented) {
        atMoreIndented = false
        state.result += common.repeat('\n', emptyLines + 1)

      // Just one line break - perceive as the same line.
      } else if (emptyLines === 0) {
        if (didReadContent) { // i.e. only if we have already read some scalar content.
          state.result += ' '
        }

      // Several line breaks - perceive as different lines.
      } else {
        state.result += common.repeat('\n', emptyLines)
      }

    // Literal style: just add exact number of line breaks between content lines.
    } else {
      // Keep all line breaks except the header line break.
      state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines)
    }

    didReadContent = true
    detectedIndent = true
    emptyLines = 0
    const captureStart = state.position

    while (!isEol(ch) && (ch !== 0)) {
      ch = state.input.charCodeAt(++state.position)
    }

    captureSegment(state, captureStart, state.position, false)
  }

  return true
}

function readBlockSequence (state, nodeIndent) {
  const _tag = state.tag
  const _anchor = state.anchor
  const _result = []
  let detected = false

  // there is a leading tab before this token, so it can't be a block sequence/mapping;
  // it can still be flow sequence/mapping or a scalar
  if (state.firstTabInLine !== -1) return false

  if (state.anchor !== null) {
    storeAnchor(state, state.anchor, _result)
  }

  let ch = state.input.charCodeAt(state.position)

  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine
      throwError(state, 'tab characters must not be used in indentation')
    }

    if (ch !== 0x2D/* - */) {
      break
    }

    const following = state.input.charCodeAt(state.position + 1)

    if (!isWsOrEol(following)) {
      break
    }

    detected = true
    state.position++

    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null)
        ch = state.input.charCodeAt(state.position)
        continue
      }
    }

    const _line = state.line
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true)
    _result.push(state.result)
    skipSeparationSpace(state, true, -1)

    ch = state.input.charCodeAt(state.position)

    if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
      throwError(state, 'bad indentation of a sequence entry')
    } else if (state.lineIndent < nodeIndent) {
      break
    }
  }

  if (detected) {
    state.tag = _tag
    state.anchor = _anchor
    state.kind = 'sequence'
    state.result = _result
    return true
  }
  return false
}

function readBlockMapping (state, nodeIndent, flowIndent) {
  let allowCompact
  let _keyLine
  let _keyLineStart
  let _keyPos
  const _tag = state.tag
  const _anchor = state.anchor
  const _result = {}
  const overridableKeys = Object.create(null)
  let keyTag = null
  let keyNode = null
  let valueNode = null
  let atExplicitKey = false
  let detected = false

  // there is a leading tab before this token, so it can't be a block sequence/mapping;
  // it can still be flow sequence/mapping or a scalar
  if (state.firstTabInLine !== -1) return false

  if (state.anchor !== null) {
    storeAnchor(state, state.anchor, _result)
  }

  let ch = state.input.charCodeAt(state.position)

  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine
      throwError(state, 'tab characters must not be used in indentation')
    }

    const following = state.input.charCodeAt(state.position + 1)
    const _line = state.line // Save the current line.

    //
    // Explicit notation case. There are two separate blocks:
    // first for the key (denoted by "?") and second for the value (denoted by ":")
    //
    if ((ch === 0x3F/* ? */ || ch === 0x3A/* : */) && isWsOrEol(following)) {
      if (ch === 0x3F/* ? */) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos)
          keyTag = keyNode = valueNode = null
        }

        detected = true
        atExplicitKey = true
        allowCompact = true
      } else if (atExplicitKey) {
        // i.e. 0x3A/* : */ === character after the explicit key.
        atExplicitKey = false
        allowCompact = true
      } else {
        throwError(state, 'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line')
      }

      state.position += 1
      ch = following

    //
    // Implicit notation case. Flow-style node as the key first, then ":", and the value.
    //
    } else {
      _keyLine = state.line
      _keyLineStart = state.lineStart
      _keyPos = state.position

      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        // Neither implicit nor explicit notation.
        // Reading is done. Go to the epilogue.
        break
      }

      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position)

        while (isWhiteSpace(ch)) {
          ch = state.input.charCodeAt(++state.position)
        }

        if (ch === 0x3A/* : */) {
          ch = state.input.charCodeAt(++state.position)

          if (!isWsOrEol(ch)) {
            throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping')
          }

          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos)
            keyTag = keyNode = valueNode = null
          }

          detected = true
          atExplicitKey = false
          allowCompact = false
          keyTag = state.tag
          keyNode = state.result
        } else if (detected) {
          throwError(state, 'can not read an implicit mapping pair; a colon is missed')
        } else {
          state.tag = _tag
          state.anchor = _anchor
          return true // Keep the result of `composeNode`.
        }
      } else if (detected) {
        throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key')
      } else {
        state.tag = _tag
        state.anchor = _anchor
        return true // Keep the result of `composeNode`.
      }
    }

    //
    // Common reading code for both explicit and implicit notations.
    //
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line
        _keyLineStart = state.lineStart
        _keyPos = state.position
      }

      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result
        } else {
          valueNode = state.result
        }
      }

      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos)
        keyTag = keyNode = valueNode = null
      }

      skipSeparationSpace(state, true, -1)
      ch = state.input.charCodeAt(state.position)
    }

    if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
      throwError(state, 'bad indentation of a mapping entry')
    } else if (state.lineIndent < nodeIndent) {
      break
    }
  }

  //
  // Epilogue.
  //

  // Special case: last mapping's node contains only the key in explicit notation.
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos)
  }

  // Expose the resulting mapping.
  if (detected) {
    state.tag = _tag
    state.anchor = _anchor
    state.kind = 'mapping'
    state.result = _result
  }

  return detected
}

function readTagProperty (state) {
  let isVerbatim = false
  let isNamed = false
  let tagHandle
  let tagName

  let ch = state.input.charCodeAt(state.position)

  if (ch !== 0x21/* ! */) return false

  if (state.tag !== null) {
    throwError(state, 'duplication of a tag property')
  }

  ch = state.input.charCodeAt(++state.position)

  if (ch === 0x3C/* < */) {
    isVerbatim = true
    ch = state.input.charCodeAt(++state.position)
  } else if (ch === 0x21/* ! */) {
    isNamed = true
    tagHandle = '!!'
    ch = state.input.charCodeAt(++state.position)
  } else {
    tagHandle = '!'
  }

  let _position = state.position

  if (isVerbatim) {
    do { ch = state.input.charCodeAt(++state.position) }
    while (ch !== 0 && ch !== 0x3E/* > */)

    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position)
      ch = state.input.charCodeAt(++state.position)
    } else {
      throwError(state, 'unexpected end of the stream within a verbatim tag')
    }
  } else {
    while (ch !== 0 && !isWsOrEol(ch)) {
      if (ch === 0x21/* ! */) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1)

          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, 'named tag handle cannot contain such characters')
          }

          isNamed = true
          _position = state.position + 1
        } else {
          throwError(state, 'tag suffix cannot contain exclamation marks')
        }
      }

      ch = state.input.charCodeAt(++state.position)
    }

    tagName = state.input.slice(_position, state.position)

    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, 'tag suffix cannot contain flow indicator characters')
    }
  }

  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, 'tag name cannot contain such characters: ' + tagName)
  }

  try {
    tagName = decodeURIComponent(tagName)
  } catch (err) {
    throwError(state, 'tag name is malformed: ' + tagName)
  }

  if (isVerbatim) {
    state.tag = tagName
  } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName
  } else if (tagHandle === '!') {
    state.tag = '!' + tagName
  } else if (tagHandle === '!!') {
    state.tag = 'tag:yaml.org,2002:' + tagName
  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"')
  }

  return true
}

function readAnchorProperty (state) {
  let ch = state.input.charCodeAt(state.position)

  if (ch !== 0x26/* & */) return false

  if (state.anchor !== null) {
    throwError(state, 'duplication of an anchor property')
  }

  ch = state.input.charCodeAt(++state.position)
  const _position = state.position

  while (ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch)) {
    ch = state.input.charCodeAt(++state.position)
  }

  if (state.position === _position) {
    throwError(state, 'name of an anchor node must contain at least one character')
  }

  state.anchor = state.input.slice(_position, state.position)
  return true
}

function readAlias (state) {
  let ch = state.input.charCodeAt(state.position)

  if (ch !== 0x2A/* * */) return false

  ch = state.input.charCodeAt(++state.position)
  const _position = state.position

  while (ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch)) {
    ch = state.input.charCodeAt(++state.position)
  }

  if (state.position === _position) {
    throwError(state, 'name of an alias node must contain at least one character')
  }

  const alias = state.input.slice(_position, state.position)

  if (!_hasOwnProperty.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"')
  }

  state.result = state.anchorMap[alias]
  skipSeparationSpace(state, true, -1)
  return true
}

function tryReadBlockMappingFromProperty (state, propertyStart, nodeIndent, flowIndent) {
  const fallbackState = snapshotState(state)

  beginAnchorTransaction(state)
  restoreState(state, propertyStart)

  // Re-read the leading properties as part of the first implicit key, not as
  // properties of the current node.
  state.tag = null
  state.anchor = null
  state.kind = null
  state.result = null

  if (readBlockMapping(state, nodeIndent, flowIndent) && state.kind === 'mapping') {
    commitAnchorTransaction(state)
    return true
  }

  rollbackAnchorTransaction(state)
  restoreState(state, fallbackState)
  return false
}

function composeNode (state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  let allowBlockScalars
  let allowBlockCollections
  let indentStatus = 1 // 1: this>parent, 0: this=parent, -1: this<parent
  let atNewLine = false
  let hasContent = false
  let propertyStart = null
  let type
  let flowIndent
  let blockIndent

  if (state.depth >= state.maxDepth) {
    throwError(state, 'nesting exceeded maxDepth (' + state.maxDepth + ')')
  }

  state.depth += 1

  if (state.listener !== null) {
    state.listener('open', state)
  }

  state.tag = null
  state.anchor = null
  state.kind = null
  state.result = null

  const allowBlockStyles = allowBlockScalars = allowBlockCollections =
    CONTEXT_BLOCK_OUT === nodeContext ||
    CONTEXT_BLOCK_IN === nodeContext

  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true

      if (state.lineIndent > parentIndent) {
        indentStatus = 1
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1
      }
    }
  }

  if (indentStatus === 1) {
    while (true) {
      const ch = state.input.charCodeAt(state.position)
      const propertyState = snapshotState(state)

      // A duplicate property token after a line break can be the first key of
      // a nested block mapping, e.g. `!!map\n  !!str key: value`.
      if (atNewLine &&
          ((ch === 0x21/* ! */ && state.tag !== null) ||
           (ch === 0x26/* & */ && state.anchor !== null))) {
        break
      }

      if (!readTagProperty(state) && !readAnchorProperty(state)) {
        break
      }

      if (propertyStart === null) {
        propertyStart = propertyState
      }

      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true
        allowBlockCollections = allowBlockStyles

        if (state.lineIndent > parentIndent) {
          indentStatus = 1
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1
        }
      } else {
        allowBlockCollections = false
      }
    }
  }

  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact
  }

  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent
    } else {
      flowIndent = parentIndent + 1
    }

    blockIndent = state.position - state.lineStart

    if (indentStatus === 1) {
      if ((allowBlockCollections &&
          (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent))) ||
          readFlowCollection(state, flowIndent)) {
        hasContent = true
      } else {
        const ch = state.input.charCodeAt(state.position)

        if (propertyStart !== null && allowBlockStyles && !allowBlockCollections &&
            ch !== 0x7C/* | */ && ch !== 0x3E/* > */ &&
            tryReadBlockMappingFromProperty(
              state,
              propertyStart,
              propertyStart.position - propertyStart.lineStart,
              flowIndent
            )) {
          hasContent = true
        } else if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
            readSingleQuotedScalar(state, flowIndent) ||
            readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true
        } else if (readAlias(state)) {
          hasContent = true

          if (state.tag !== null || state.anchor !== null) {
            throwError(state, 'alias node should not have any properties')
          }
        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true

          if (state.tag === null) {
            state.tag = '?'
          }
        }

        if (state.anchor !== null) {
          storeAnchor(state, state.anchor, state.result)
        }
      }
    } else if (indentStatus === 0) {
      // Special case: block sequences are allowed to have same indentation level as the parent.
      // http://www.yaml.org/spec/1.2/spec.html#id2799784
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent)
    }
  }

  if (state.tag === null) {
    if (state.anchor !== null) {
      storeAnchor(state, state.anchor, state.result)
    }
  } else if (state.tag === '?') {
    // Implicit resolving is not allowed for non-scalar types, and '?'
    // non-specific tag is only automatically assigned to plain scalars.
    //
    // We only need to check kind conformity in case user explicitly assigns '?'
    // tag, for example like this: "!<?> [0]"
    //
    if (state.result !== null && state.kind !== 'scalar') {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"')
    }

    for (let typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type = state.implicitTypes[typeIndex]

      if (type.resolve(state.result)) { // `state.result` updated in resolver if matched
        state.result = type.construct(state.result)
        state.tag = type.tag
        if (state.anchor !== null) {
          storeAnchor(state, state.anchor, state.result)
        }
        break
      }
    }
  } else if (state.tag !== '!') {
    if (_hasOwnProperty.call(state.typeMap[state.kind || 'fallback'], state.tag)) {
      type = state.typeMap[state.kind || 'fallback'][state.tag]
    } else {
      // looking for multi type
      type = null
      const typeList = state.typeMap.multi[state.kind || 'fallback']

      for (let typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type = typeList[typeIndex]
          break
        }
      }
    }

    if (!type) {
      throwError(state, 'unknown tag !<' + state.tag + '>')
    }

    if (state.result !== null && type.kind !== state.kind) {
      throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"')
    }

    if (!type.resolve(state.result, state.tag)) { // `state.result` updated in resolver if matched
      throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag')
    } else {
      state.result = type.construct(state.result, state.tag)
      if (state.anchor !== null) {
        storeAnchor(state, state.anchor, state.result)
      }
    }
  }

  if (state.listener !== null) {
    state.listener('close', state)
  }

  state.depth -= 1
  return state.tag !== null || state.anchor !== null || hasContent
}

function readDocument (state) {
  const documentStart = state.position
  let hasDirectives = false
  let ch

  state.version = null
  state.checkLineBreaks = state.legacy
  state.tagMap = Object.create(null)
  state.anchorMap = Object.create(null)

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1)

    ch = state.input.charCodeAt(state.position)

    if (state.lineIndent > 0 || ch !== 0x25/* % */) {
      break
    }

    hasDirectives = true
    ch = state.input.charCodeAt(++state.position)
    let _position = state.position

    while (ch !== 0 && !isWsOrEol(ch)) {
      ch = state.input.charCodeAt(++state.position)
    }

    const directiveName = state.input.slice(_position, state.position)
    const directiveArgs = []

    if (directiveName.length < 1) {
      throwError(state, 'directive name must not be less than one character in length')
    }

    while (ch !== 0) {
      while (isWhiteSpace(ch)) {
        ch = state.input.charCodeAt(++state.position)
      }

      if (ch === 0x23/* # */) {
        do { ch = state.input.charCodeAt(++state.position) }
        while (ch !== 0 && !isEol(ch))
        break
      }

      if (isEol(ch)) break

      _position = state.position

      while (ch !== 0 && !isWsOrEol(ch)) {
        ch = state.input.charCodeAt(++state.position)
      }

      directiveArgs.push(state.input.slice(_position, state.position))
    }

    if (ch !== 0) readLineBreak(state)

    if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs)
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"')
    }
  }

  skipSeparationSpace(state, true, -1)

  if (state.lineIndent === 0 &&
      state.input.charCodeAt(state.position) === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 1) === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 2) === 0x2D/* - */) {
    state.position += 3
    skipSeparationSpace(state, true, -1)
  } else if (hasDirectives) {
    throwError(state, 'directives end mark is expected')
  }

  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true)
  skipSeparationSpace(state, true, -1)

  if (state.checkLineBreaks &&
      PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, 'non-ASCII line breaks are interpreted as content')
  }

  state.documents.push(state.result)

  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    if (state.input.charCodeAt(state.position) === 0x2E/* . */) {
      state.position += 3
      skipSeparationSpace(state, true, -1)
    }
    return
  }

  if (state.position < (state.length - 1)) {
    throwError(state, 'end of the stream or a document separator is expected')
  }
}

function loadDocuments (input, options) {
  input = String(input)
  options = options || {}

  if (input.length !== 0) {
    // Add tailing `\n` if not exists
    if (input.charCodeAt(input.length - 1) !== 0x0A/* LF */ &&
        input.charCodeAt(input.length - 1) !== 0x0D/* CR */) {
      input += '\n'
    }

    // Strip BOM
    if (input.charCodeAt(0) === 0xFEFF) {
      input = input.slice(1)
    }
  }

  const state = new State(input, options)

  const nullpos = input.indexOf('\0')

  if (nullpos !== -1) {
    state.position = nullpos
    throwError(state, 'null byte is not allowed in input')
  }

  // Use 0 as string terminator. That significantly simplifies bounds check.
  state.input += '\0'

  while (state.input.charCodeAt(state.position) === 0x20/* Space */) {
    state.lineIndent += 1
    state.position += 1
  }

  while (state.position < (state.length - 1)) {
    readDocument(state)
  }

  return state.documents
}

function loadAll (input, iterator, options) {
  if (iterator !== null && typeof iterator === 'object' && typeof options === 'undefined') {
    options = iterator
    iterator = null
  }

  const documents = loadDocuments(input, options)

  if (typeof iterator !== 'function') {
    return documents
  }

  for (let index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index])
  }
}

function load (input, options) {
  const documents = loadDocuments(input, options)

  if (documents.length === 0) {
    return undefined
  } else if (documents.length === 1) {
    return documents[0]
  }
  throw new YAMLException('expected a single document in the stream, but found more')
}

module.exports.loadAll = loadAll
module.exports.load = load


/***/ },

/***/ 4664
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const YAMLException = __webpack_require__(1538)
const Type = __webpack_require__(6623)

function compileList (schema, name) {
  const result = []

  schema[name].forEach(function (currentType) {
    let newIndex = result.length

    result.forEach(function (previousType, previousIndex) {
      if (previousType.tag === currentType.tag &&
          previousType.kind === currentType.kind &&
          previousType.multi === currentType.multi) {
        newIndex = previousIndex
      }
    })

    result[newIndex] = currentType
  })

  return result
}

function compileMap (/* lists... */) {
  const result = {
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
  }
  function collectType (type) {
    if (type.multi) {
      result.multi[type.kind].push(type)
      result.multi['fallback'].push(type)
    } else {
      result[type.kind][type.tag] = result['fallback'][type.tag] = type
    }
  }

  for (let index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType)
  }
  return result
}

function Schema (definition) {
  return this.extend(definition)
}

Schema.prototype.extend = function extend (definition) {
  let implicit = []
  let explicit = []

  if (definition instanceof Type) {
    // Schema.extend(type)
    explicit.push(definition)
  } else if (Array.isArray(definition)) {
    // Schema.extend([ type1, type2, ... ])
    explicit = explicit.concat(definition)
  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    // Schema.extend({ explicit: [ type1, type2, ... ], implicit: [ type1, type2, ... ] })
    if (definition.implicit) implicit = implicit.concat(definition.implicit)
    if (definition.explicit) explicit = explicit.concat(definition.explicit)
  } else {
    throw new YAMLException('Schema.extend argument should be a Type, [ Type ], ' +
      'or a schema definition ({ implicit: [...], explicit: [...] })')
  }

  implicit.forEach(function (type) {
    if (!(type instanceof Type)) {
      throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.')
    }

    if (type.loadKind && type.loadKind !== 'scalar') {
      throw new YAMLException('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.')
    }

    if (type.multi) {
      throw new YAMLException('There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.')
    }
  })

  explicit.forEach(function (type) {
    if (!(type instanceof Type)) {
      throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.')
    }
  })

  const result = Object.create(Schema.prototype)

  result.implicit = (this.implicit || []).concat(implicit)
  result.explicit = (this.explicit || []).concat(explicit)

  result.compiledImplicit = compileList(result, 'implicit')
  result.compiledExplicit = compileList(result, 'explicit')
  result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit)

  return result
}

module.exports = Schema


/***/ },

/***/ 3496
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
// Standard YAML's Core schema.
// http://www.yaml.org/spec/1.2/spec.html#id2804923
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, Core schema has no distinctions from JSON schema is JS-YAML.



module.exports = __webpack_require__(1345)


/***/ },

/***/ 5674
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
// JS-YAML's default schema for `safeLoad` function.
// It is not described in the YAML specification.
//
// This schema is based on standard YAML's Core schema and includes most of
// extra types described at YAML tag repository. (http://yaml.org/type/)



module.exports = (__webpack_require__(3496).extend)({
  implicit: [
    __webpack_require__(7856),
    __webpack_require__(5732)
  ],
  explicit: [
    __webpack_require__(3779),
    __webpack_require__(9039),
    __webpack_require__(8993),
    __webpack_require__(1368)
  ]
})


/***/ },

/***/ 5942
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
// Standard YAML's Failsafe schema.
// http://www.yaml.org/spec/1.2/spec.html#id2802346



const Schema = __webpack_require__(4664)

module.exports = new Schema({
  explicit: [
    __webpack_require__(6823),
    __webpack_require__(3515),
    __webpack_require__(658)
  ]
})


/***/ },

/***/ 1345
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
// Standard YAML's JSON schema.
// http://www.yaml.org/spec/1.2/spec.html#id2803231
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, this schema is not such strict as defined in the YAML specification.
// It allows numbers in binary notaion, use `Null` and `NULL` as `null`, etc.



module.exports = (__webpack_require__(5942).extend)({
  implicit: [
    __webpack_require__(6419),
    __webpack_require__(4286),
    __webpack_require__(5481),
    __webpack_require__(3366)
  ]
})


/***/ },

/***/ 7694
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const common = __webpack_require__(4018)

// get snippet for a single line, respecting maxLength
function getLine (buffer, lineStart, lineEnd, position, maxLineLength) {
  let head = ''
  let tail = ''
  const maxHalfLength = Math.floor(maxLineLength / 2) - 1

  if (position - lineStart > maxHalfLength) {
    head = ' ... '
    lineStart = position - maxHalfLength + head.length
  }

  if (lineEnd - position > maxHalfLength) {
    tail = ' ...'
    lineEnd = position + maxHalfLength - tail.length
  }

  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, '→') + tail,
    pos: position - lineStart + head.length // relative position
  }
}

function padStart (string, max) {
  return common.repeat(' ', max - string.length) + string
}

function makeSnippet (mark, options) {
  options = Object.create(options || null)

  if (!mark.buffer) return null

  if (!options.maxLength) options.maxLength = 79
  if (typeof options.indent !== 'number') options.indent = 1
  if (typeof options.linesBefore !== 'number') options.linesBefore = 3
  if (typeof options.linesAfter !== 'number') options.linesAfter = 2

  const re = /\r?\n|\r|\0/g
  const lineStarts = [0]
  const lineEnds = []
  let match
  let foundLineNo = -1

  while ((match = re.exec(mark.buffer))) {
    lineEnds.push(match.index)
    lineStarts.push(match.index + match[0].length)

    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2
    }
  }

  if (foundLineNo < 0) foundLineNo = lineStarts.length - 1

  let result = ''
  const lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length
  const maxLineLength = options.maxLength - (options.indent + lineNoLength + 3)

  for (let i = 1; i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0) break
    const line = getLine(
      mark.buffer,
      lineStarts[foundLineNo - i],
      lineEnds[foundLineNo - i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
      maxLineLength
    )
    result = common.repeat(' ', options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) +
      ' | ' + line.str + '\n' + result
  }

  const line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength)
  result += common.repeat(' ', options.indent) + padStart((mark.line + 1).toString(), lineNoLength) +
    ' | ' + line.str + '\n'
  result += common.repeat('-', options.indent + lineNoLength + 3 + line.pos) + '^' + '\n'

  for (let i = 1; i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length) break
    const line = getLine(
      mark.buffer,
      lineStarts[foundLineNo + i],
      lineEnds[foundLineNo + i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
      maxLineLength
    )
    result += common.repeat(' ', options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) +
      ' | ' + line.str + '\n'
  }

  return result.replace(/\n$/, '')
}

module.exports = makeSnippet


/***/ },

/***/ 6623
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const YAMLException = __webpack_require__(1538)

const TYPE_CONSTRUCTOR_OPTIONS = [
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
]

const YAML_NODE_KINDS = [
  'scalar',
  'sequence',
  'mapping'
]

function compileStyleAliases (map) {
  const result = {}

  if (map !== null) {
    Object.keys(map).forEach(function (style) {
      map[style].forEach(function (alias) {
        result[String(alias)] = style
      })
    })
  }

  return result
}

function Type (tag, options) {
  options = options || {}

  Object.keys(options).forEach(function (name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new YAMLException('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.')
    }
  })

  // TODO: Add tag format check.
  this.options = options // keep original options in case user wants to extend this type later
  this.tag = tag
  this.kind = options['kind'] || null
  this.resolve = options['resolve'] || function () { return true }
  this.construct = options['construct'] || function (data) { return data }
  this.instanceOf = options['instanceOf'] || null
  this.predicate = options['predicate'] || null
  this.represent = options['represent'] || null
  this.representName = options['representName'] || null
  this.defaultStyle = options['defaultStyle'] || null
  this.multi = options['multi'] || false
  this.styleAliases = compileStyleAliases(options['styleAliases'] || null)

  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new YAMLException('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.')
  }
}

module.exports = Type


/***/ },

/***/ 3779
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const Type = __webpack_require__(6623)

// [ 64, 65, 66 ] -> [ padding, CR, LF ]
const BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r'

function resolveYamlBinary (data) {
  if (data === null) return false

  let bitlen = 0
  const max = data.length
  const map = BASE64_MAP

  // Convert one by one.
  for (let idx = 0; idx < max; idx++) {
    const code = map.indexOf(data.charAt(idx))

    // Skip CR/LF
    if (code > 64) continue

    // Fail on illegal characters
    if (code < 0) return false

    bitlen += 6
  }

  // If there are any bits left, source was corrupted
  return (bitlen % 8) === 0
}

function constructYamlBinary (data) {
  const input = data.replace(/[\r\n=]/g, '') // remove CR/LF & padding to simplify scan
  const max = input.length
  const map = BASE64_MAP
  let bits = 0
  const result = []

  // Collect by 6*4 bits (3 bytes)

  for (let idx = 0; idx < max; idx++) {
    if ((idx % 4 === 0) && idx) {
      result.push((bits >> 16) & 0xFF)
      result.push((bits >> 8) & 0xFF)
      result.push(bits & 0xFF)
    }

    bits = (bits << 6) | map.indexOf(input.charAt(idx))
  }

  // Dump tail

  const tailbits = (max % 4) * 6

  if (tailbits === 0) {
    result.push((bits >> 16) & 0xFF)
    result.push((bits >> 8) & 0xFF)
    result.push(bits & 0xFF)
  } else if (tailbits === 18) {
    result.push((bits >> 10) & 0xFF)
    result.push((bits >> 2) & 0xFF)
  } else if (tailbits === 12) {
    result.push((bits >> 4) & 0xFF)
  }

  return new Uint8Array(result)
}

function representYamlBinary (object /*, style */) {
  let result = ''
  let bits = 0
  const max = object.length
  const map = BASE64_MAP

  // Convert every three bytes to 4 ASCII characters.

  for (let idx = 0; idx < max; idx++) {
    if ((idx % 3 === 0) && idx) {
      result += map[(bits >> 18) & 0x3F]
      result += map[(bits >> 12) & 0x3F]
      result += map[(bits >> 6) & 0x3F]
      result += map[bits & 0x3F]
    }

    bits = (bits << 8) + object[idx]
  }

  // Dump tail

  const tail = max % 3

  if (tail === 0) {
    result += map[(bits >> 18) & 0x3F]
    result += map[(bits >> 12) & 0x3F]
    result += map[(bits >> 6) & 0x3F]
    result += map[bits & 0x3F]
  } else if (tail === 2) {
    result += map[(bits >> 10) & 0x3F]
    result += map[(bits >> 4) & 0x3F]
    result += map[(bits << 2) & 0x3F]
    result += map[64]
  } else if (tail === 1) {
    result += map[(bits >> 2) & 0x3F]
    result += map[(bits << 4) & 0x3F]
    result += map[64]
    result += map[64]
  }

  return result
}

function isBinary (obj) {
  return Object.prototype.toString.call(obj) === '[object Uint8Array]'
}

module.exports = new Type('tag:yaml.org,2002:binary', {
  kind: 'scalar',
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
})


/***/ },

/***/ 4286
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const Type = __webpack_require__(6623)

function resolveYamlBoolean (data) {
  if (data === null) return false

  const max = data.length

  return (max === 4 && (data === 'true' || data === 'True' || data === 'TRUE')) ||
         (max === 5 && (data === 'false' || data === 'False' || data === 'FALSE'))
}

function constructYamlBoolean (data) {
  return data === 'true' ||
         data === 'True' ||
         data === 'TRUE'
}

function isBoolean (object) {
  return Object.prototype.toString.call(object) === '[object Boolean]'
}

module.exports = new Type('tag:yaml.org,2002:bool', {
  kind: 'scalar',
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function (object) { return object ? 'true' : 'false' },
    uppercase: function (object) { return object ? 'TRUE' : 'FALSE' },
    camelcase: function (object) { return object ? 'True' : 'False' }
  },
  defaultStyle: 'lowercase'
})


/***/ },

/***/ 3366
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const common = __webpack_require__(4018)
const Type = __webpack_require__(6623)

const YAML_FLOAT_PATTERN = new RegExp(
  // 2.5e4, 2.5 and integers
  '^(?:[-+]?(?:[0-9]+)(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?' +
  // .2e4, .2
  // special case, seems not from spec
  '|\\.[0-9]+(?:[eE][-+]?[0-9]+)?' +
  // .inf
  '|[-+]?\\.(?:inf|Inf|INF)' +
  // .nan
  '|\\.(?:nan|NaN|NAN))$')

const YAML_FLOAT_SPECIAL_PATTERN = new RegExp(
  '^(?:' +
  // .inf
  '[-+]?\\.(?:inf|Inf|INF)' +
  // .nan
  '|\\.(?:nan|NaN|NAN))$')

function resolveYamlFloat (data) {
  if (data === null) return false

  if (!YAML_FLOAT_PATTERN.test(data)) {
    return false
  }

  if (isFinite(parseFloat(data, 10))) {
    return true
  }

  return YAML_FLOAT_SPECIAL_PATTERN.test(data)
}

function constructYamlFloat (data) {
  let value = data.toLowerCase()
  const sign = value[0] === '-' ? -1 : 1

  if ('+-'.indexOf(value[0]) >= 0) {
    value = value.slice(1)
  }

  if (value === '.inf') {
    return (sign === 1) ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY
  } else if (value === '.nan') {
    return NaN
  }
  return sign * parseFloat(value, 10)
}

const SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/

function representYamlFloat (object, style) {
  if (isNaN(object)) {
    switch (style) {
      case 'lowercase': return '.nan'
      case 'uppercase': return '.NAN'
      case 'camelcase': return '.NaN'
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '.inf'
      case 'uppercase': return '.INF'
      case 'camelcase': return '.Inf'
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '-.inf'
      case 'uppercase': return '-.INF'
      case 'camelcase': return '-.Inf'
    }
  } else if (common.isNegativeZero(object)) {
    return '-0.0'
  }

  const res = object.toString(10)

  // JS stringifier can build scientific format without dots: 5e-100,
  // while YAML requres dot: 5.e-100. Fix it with simple hack

  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res
}

function isFloat (object) {
  return (Object.prototype.toString.call(object) === '[object Number]') &&
         (object % 1 !== 0 || common.isNegativeZero(object))
}

module.exports = new Type('tag:yaml.org,2002:float', {
  kind: 'scalar',
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: 'lowercase'
})


/***/ },

/***/ 5481
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const common = __webpack_require__(4018)
const Type = __webpack_require__(6623)

function isHexCode (c) {
  return ((c >= 0x30/* 0 */) && (c <= 0x39/* 9 */)) ||
         ((c >= 0x41/* A */) && (c <= 0x46/* F */)) ||
         ((c >= 0x61/* a */) && (c <= 0x66/* f */))
}

function isOctCode (c) {
  return ((c >= 0x30/* 0 */) && (c <= 0x37/* 7 */))
}

function isDecCode (c) {
  return ((c >= 0x30/* 0 */) && (c <= 0x39/* 9 */))
}

function resolveYamlInteger (data) {
  if (data === null) return false

  const max = data.length
  let index = 0
  let hasDigits = false

  if (!max) return false

  let ch = data[index]

  // sign
  if (ch === '-' || ch === '+') {
    ch = data[++index]
  }

  if (ch === '0') {
    // 0
    if (index + 1 === max) return true
    ch = data[++index]

    // base 2, base 8, base 16

    if (ch === 'b') {
      // base 2
      index++

      for (; index < max; index++) {
        ch = data[index]
        if (ch !== '0' && ch !== '1') return false
        hasDigits = true
      }
      return hasDigits && isFinite(parseYamlInteger(data))
    }

    if (ch === 'x') {
      // base 16
      index++

      for (; index < max; index++) {
        if (!isHexCode(data.charCodeAt(index))) return false
        hasDigits = true
      }
      return hasDigits && isFinite(parseYamlInteger(data))
    }

    if (ch === 'o') {
      // base 8
      index++

      for (; index < max; index++) {
        if (!isOctCode(data.charCodeAt(index))) return false
        hasDigits = true
      }
      return hasDigits && isFinite(parseYamlInteger(data))
    }
  }

  // base 10 (except 0)

  for (; index < max; index++) {
    if (!isDecCode(data.charCodeAt(index))) {
      return false
    }
    hasDigits = true
  }

  if (!hasDigits) return false

  return isFinite(parseYamlInteger(data))
}

function parseYamlInteger (data) {
  let value = data
  let sign = 1

  let ch = value[0]

  if (ch === '-' || ch === '+') {
    if (ch === '-') sign = -1
    value = value.slice(1)
    ch = value[0]
  }

  if (value === '0') return 0

  if (ch === '0') {
    if (value[1] === 'b') return sign * parseInt(value.slice(2), 2)
    if (value[1] === 'x') return sign * parseInt(value.slice(2), 16)
    if (value[1] === 'o') return sign * parseInt(value.slice(2), 8)
  }

  return sign * parseInt(value, 10)
}

function constructYamlInteger (data) {
  return parseYamlInteger(data)
}

function isInteger (object) {
  return (Object.prototype.toString.call(object)) === '[object Number]' &&
         (object % 1 === 0 && !common.isNegativeZero(object))
}

module.exports = new Type('tag:yaml.org,2002:int', {
  kind: 'scalar',
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary: function (obj) { return obj >= 0 ? '0b' + obj.toString(2) : '-0b' + obj.toString(2).slice(1) },
    octal: function (obj) { return obj >= 0 ? '0o' + obj.toString(8) : '-0o' + obj.toString(8).slice(1) },
    decimal: function (obj) { return obj.toString(10) },
    hexadecimal: function (obj) { return obj >= 0 ? '0x' + obj.toString(16).toUpperCase() : '-0x' + obj.toString(16).toUpperCase().slice(1) }
  },
  defaultStyle: 'decimal',
  styleAliases: {
    binary: [2, 'bin'],
    octal: [8, 'oct'],
    decimal: [10, 'dec'],
    hexadecimal: [16, 'hex']
  }
})


/***/ },

/***/ 658
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const Type = __webpack_require__(6623)

module.exports = new Type('tag:yaml.org,2002:map', {
  kind: 'mapping',
  construct: function (data) { return data !== null ? data : {} }
})


/***/ },

/***/ 5732
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const Type = __webpack_require__(6623)

function resolveYamlMerge (data) {
  return data === '<<' || data === null
}

module.exports = new Type('tag:yaml.org,2002:merge', {
  kind: 'scalar',
  resolve: resolveYamlMerge
})


/***/ },

/***/ 6419
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const Type = __webpack_require__(6623)

function resolveYamlNull (data) {
  if (data === null) return true

  const max = data.length

  return (max === 1 && data === '~') ||
         (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'))
}

function constructYamlNull () {
  return null
}

function isNull (object) {
  return object === null
}

module.exports = new Type('tag:yaml.org,2002:null', {
  kind: 'scalar',
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function () { return '~' },
    lowercase: function () { return 'null' },
    uppercase: function () { return 'NULL' },
    camelcase: function () { return 'Null' },
    empty: function () { return '' }
  },
  defaultStyle: 'lowercase'
})


/***/ },

/***/ 9039
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const Type = __webpack_require__(6623)

const _hasOwnProperty = Object.prototype.hasOwnProperty
const _toString = Object.prototype.toString

function resolveYamlOmap (data) {
  if (data === null) return true

  const objectKeys = []
  const object = data

  for (let index = 0, length = object.length; index < length; index += 1) {
    const pair = object[index]
    let pairHasKey = false

    if (_toString.call(pair) !== '[object Object]') return false

    let pairKey
    for (pairKey in pair) {
      if (_hasOwnProperty.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true
        else return false
      }
    }

    if (!pairHasKey) return false

    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey)
    else return false
  }

  return true
}

function constructYamlOmap (data) {
  return data !== null ? data : []
}

module.exports = new Type('tag:yaml.org,2002:omap', {
  kind: 'sequence',
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
})


/***/ },

/***/ 8993
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const Type = __webpack_require__(6623)

const _toString = Object.prototype.toString

function resolveYamlPairs (data) {
  if (data === null) return true

  const object = data

  const result = new Array(object.length)

  for (let index = 0, length = object.length; index < length; index += 1) {
    const pair = object[index]

    if (_toString.call(pair) !== '[object Object]') return false

    const keys = Object.keys(pair)

    if (keys.length !== 1) return false

    result[index] = [keys[0], pair[keys[0]]]
  }

  return true
}

function constructYamlPairs (data) {
  if (data === null) return []

  const object = data
  const result = new Array(object.length)

  for (let index = 0, length = object.length; index < length; index += 1) {
    const pair = object[index]

    const keys = Object.keys(pair)

    result[index] = [keys[0], pair[keys[0]]]
  }

  return result
}

module.exports = new Type('tag:yaml.org,2002:pairs', {
  kind: 'sequence',
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
})


/***/ },

/***/ 3515
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const Type = __webpack_require__(6623)

module.exports = new Type('tag:yaml.org,2002:seq', {
  kind: 'sequence',
  construct: function (data) { return data !== null ? data : [] }
})


/***/ },

/***/ 1368
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const Type = __webpack_require__(6623)

const _hasOwnProperty = Object.prototype.hasOwnProperty

function resolveYamlSet (data) {
  if (data === null) return true

  const object = data

  for (const key in object) {
    if (_hasOwnProperty.call(object, key)) {
      if (object[key] !== null) return false
    }
  }

  return true
}

function constructYamlSet (data) {
  return data !== null ? data : {}
}

module.exports = new Type('tag:yaml.org,2002:set', {
  kind: 'mapping',
  resolve: resolveYamlSet,
  construct: constructYamlSet
})


/***/ },

/***/ 6823
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const Type = __webpack_require__(6623)

module.exports = new Type('tag:yaml.org,2002:str', {
  kind: 'scalar',
  construct: function (data) { return data !== null ? data : '' }
})


/***/ },

/***/ 7856
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const Type = __webpack_require__(6623)

const YAML_DATE_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])' + // [1] year
  '-([0-9][0-9])' + // [2] month
  '-([0-9][0-9])$')                   // [3] day

const YAML_TIMESTAMP_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])' + // [1] year
  '-([0-9][0-9]?)' + // [2] month
  '-([0-9][0-9]?)' + // [3] day
  '(?:[Tt]|[ \\t]+)' + // ...
  '([0-9][0-9]?)' + // [4] hour
  ':([0-9][0-9])' + // [5] minute
  ':([0-9][0-9])' + // [6] second
  '(?:\\.([0-9]*))?' + // [7] fraction
  '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tzHour
  '(?::([0-9][0-9]))?))?$')           // [11] tzMinute

function resolveYamlTimestamp (data) {
  if (data === null) return false
  if (YAML_DATE_REGEXP.exec(data) !== null) return true
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true
  return false
}

function constructYamlTimestamp (data) {
  let fraction = 0
  let delta = null

  let match = YAML_DATE_REGEXP.exec(data)
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data)

  if (match === null) throw new Error('Date resolve error')

  // match: [1] year [2] month [3] day

  const year = +(match[1])
  const month = +(match[2]) - 1 // JS month starts with 0
  const day = +(match[3])

  if (!match[4]) { // no hour
    return new Date(Date.UTC(year, month, day))
  }

  // match: [4] hour [5] minute [6] second [7] fraction

  const hour = +(match[4])
  const minute = +(match[5])
  const second = +(match[6])

  if (match[7]) {
    fraction = match[7].slice(0, 3)
    while (fraction.length < 3) { // milli-seconds
      fraction += '0'
    }
    fraction = +fraction
  }

  // match: [8] tz [9] tz_sign [10] tzHour [11] tzMinute

  if (match[9]) {
    const tzHour = +(match[10])
    const tzMinute = +(match[11] || 0)
    delta = (tzHour * 60 + tzMinute) * 60000 // delta in mili-seconds
    if (match[9] === '-') delta = -delta
  }

  const date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction))

  if (delta) date.setTime(date.getTime() - delta)

  return date
}

function representYamlTimestamp (object /*, style */) {
  return object.toISOString()
}

module.exports = new Type('tag:yaml.org,2002:timestamp', {
  kind: 'scalar',
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
})


/***/ },

/***/ 3724
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  DataFactory: () => (/* reexport */ N3DataFactory)
});

// UNUSED EXPORTS: BaseIRI, BlankNode, DefaultGraph, EntityIndex, Lexer, Literal, NamedNode, Parser, Quad, Reasoner, Store, StoreFactory, StreamParser, StreamWriter, Term, Triple, Util, Variable, Writer, default, getRulesFromDataset, termFromId, termToId

;// ../../node_modules/n3/src/IRIs.js
const RDF  = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    XSD  = 'http://www.w3.org/2001/XMLSchema#',
    SWAP = 'http://www.w3.org/2000/10/swap/';

/* harmony default export */ const IRIs = ({
  xsd: {
    decimal: `${XSD}decimal`,
    boolean: `${XSD}boolean`,
    double:  `${XSD}double`,
    integer: `${XSD}integer`,
    string:  `${XSD}string`,
  },
  rdf: {
    type:       `${RDF}type`,
    nil:        `${RDF}nil`,
    first:      `${RDF}first`,
    rest:       `${RDF}rest`,
    langString: `${RDF}langString`,
  },
  owl: {
    sameAs: 'http://www.w3.org/2002/07/owl#sameAs',
  },
  r: {
    forSome: `${SWAP}reify#forSome`,
    forAll:  `${SWAP}reify#forAll`,
  },
  log: {
    implies: `${SWAP}log#implies`,
    isImpliedBy: `${SWAP}log#isImpliedBy`,
  },
});

;// ../../node_modules/n3/src/N3DataFactory.js
// N3.js implementations of the RDF/JS core data types
// See http://rdf.js.org/data-model-spec/



const { rdf, xsd } = IRIs;

// eslint-disable-next-line prefer-const
let DEFAULTGRAPH;
let _blankNodeCounter = 0;

const escapedLiteral = /^"(.*".*)(?="[^"]*$)/;

// ## DataFactory singleton
const DataFactory = {
  namedNode,
  blankNode,
  variable,
  literal,
  defaultGraph,
  quad,
  triple: quad,
  fromTerm,
  fromQuad,
};
/* harmony default export */ const N3DataFactory = (DataFactory);

// ## Term constructor
class Term {
  constructor(id) {
    this.id = id;
  }

  // ### The value of this term
  get value() {
    return this.id;
  }

  // ### Returns whether this object represents the same term as the other
  equals(other) {
    // If both terms were created by this library,
    // equality can be computed through ids
    if (other instanceof Term)
      return this.id === other.id;
    // Otherwise, compare term type and value
    return !!other && this.termType === other.termType &&
                      this.value    === other.value;
  }

  // ### Implement hashCode for Immutable.js, since we implement `equals`
  // https://immutable-js.com/docs/v4.0.0/ValueObject/#hashCode()
  hashCode() {
    return 0;
  }

  // ### Returns a plain object representation of this term
  toJSON() {
    return {
      termType: this.termType,
      value:    this.value,
    };
  }
}


// ## NamedNode constructor
class NamedNode extends Term {
  // ### The term type of this term
  get termType() {
    return 'NamedNode';
  }
}

// ## Literal constructor
class Literal extends Term {
  // ### The term type of this term
  get termType() {
    return 'Literal';
  }

  // ### The text value of this literal
  get value() {
    return this.id.substring(1, this.id.lastIndexOf('"'));
  }

  // ### The language of this literal
  get language() {
    // Find the last quotation mark (e.g., '"abc"@en-us')
    const id = this.id;
    let atPos = id.lastIndexOf('"') + 1;
    // If "@" it follows, return the remaining substring; empty otherwise
    return atPos < id.length && id[atPos++] === '@' ? id.substr(atPos).toLowerCase() : '';
  }

  // ### The datatype IRI of this literal
  get datatype() {
    return new NamedNode(this.datatypeString);
  }

  // ### The datatype string of this literal
  get datatypeString() {
    // Find the last quotation mark (e.g., '"abc"^^http://ex.org/types#t')
    const id = this.id, dtPos = id.lastIndexOf('"') + 1;
    const char = dtPos < id.length ? id[dtPos] : '';
    // If "^" it follows, return the remaining substring
    return char === '^' ? id.substr(dtPos + 2) :
           // If "@" follows, return rdf:langString; xsd:string otherwise
           (char !== '@' ? xsd.string : rdf.langString);
  }

  // ### Returns whether this object represents the same term as the other
  equals(other) {
    // If both literals were created by this library,
    // equality can be computed through ids
    if (other instanceof Literal)
      return this.id === other.id;
    // Otherwise, compare term type, value, language, and datatype
    return !!other && !!other.datatype &&
                      this.termType === other.termType &&
                      this.value    === other.value    &&
                      this.language === other.language &&
                      this.datatype.value === other.datatype.value;
  }

  toJSON() {
    return {
      termType: this.termType,
      value:    this.value,
      language: this.language,
      datatype: { termType: 'NamedNode', value: this.datatypeString },
    };
  }
}

// ## BlankNode constructor
class BlankNode extends Term {
  constructor(name) {
    super(`_:${name}`);
  }

  // ### The term type of this term
  get termType() {
    return 'BlankNode';
  }

  // ### The name of this blank node
  get value() {
    return this.id.substr(2);
  }
}

class Variable extends Term {
  constructor(name) {
    super(`?${name}`);
  }

  // ### The term type of this term
  get termType() {
    return 'Variable';
  }

  // ### The name of this variable
  get value() {
    return this.id.substr(1);
  }
}

// ## DefaultGraph constructor
class DefaultGraph extends Term {
  constructor() {
    super('');
    return DEFAULTGRAPH || this;
  }

  // ### The term type of this term
  get termType() {
    return 'DefaultGraph';
  }

  // ### Returns whether this object represents the same term as the other
  equals(other) {
    // If both terms were created by this library,
    // equality can be computed through strict equality;
    // otherwise, compare term types.
    return (this === other) || (!!other && (this.termType === other.termType));
  }
}

// ## DefaultGraph singleton
DEFAULTGRAPH = new DefaultGraph();

// ### Constructs a term from the given internal string ID
// The third 'nested' parameter of this function is to aid
// with recursion over nested terms. It should not be used
// by consumers of this library.
// See https://github.com/rdfjs/N3.js/pull/311#discussion_r1061042725
function termFromId(id, factory, nested) {
  factory = factory || DataFactory;

  // Falsy value or empty string indicate the default graph
  if (!id)
    return factory.defaultGraph();

  // Identify the term type based on the first character
  switch (id[0]) {
  case '?':
    return factory.variable(id.substr(1));
  case '_':
    return factory.blankNode(id.substr(2));
  case '"':
    // Shortcut for internal literals
    if (factory === DataFactory)
      return new Literal(id);
    // Literal without datatype or language
    if (id[id.length - 1] === '"')
      return factory.literal(id.substr(1, id.length - 2));
    // Literal with datatype or language
    const endPos = id.lastIndexOf('"', id.length - 1);
    return factory.literal(id.substr(1, endPos - 1),
            id[endPos + 1] === '@' ? id.substr(endPos + 2)
                                   : factory.namedNode(id.substr(endPos + 3)));
  case '[':
    id = JSON.parse(id);
    break;
  default:
    if (!nested || !Array.isArray(id)) {
      return factory.namedNode(id);
    }
  }
  return factory.quad(
    termFromId(id[0], factory, true),
    termFromId(id[1], factory, true),
    termFromId(id[2], factory, true),
    id[3] && termFromId(id[3], factory, true),
  );
}

// ### Constructs an internal string ID from the given term or ID string
// The third 'nested' parameter of this function is to aid
// with recursion over nested terms. It should not be used
// by consumers of this library.
// See https://github.com/rdfjs/N3.js/pull/311#discussion_r1061042725
function termToId(term, nested) {
  if (typeof term === 'string')
    return term;
  if (term instanceof Term && term.termType !== 'Quad')
    return term.id;
  if (!term)
    return DEFAULTGRAPH.id;

  // Term instantiated with another library
  switch (term.termType) {
  case 'NamedNode':    return term.value;
  case 'BlankNode':    return `_:${term.value}`;
  case 'Variable':     return `?${term.value}`;
  case 'DefaultGraph': return '';
  case 'Literal':      return `"${term.value}"${
    term.language ? `@${term.language}` :
      (term.datatype && term.datatype.value !== xsd.string ? `^^${term.datatype.value}` : '')}`;
  case 'Quad':
    const res = [
      termToId(term.subject, true),
      termToId(term.predicate, true),
      termToId(term.object, true),
    ];
    if (term.graph && term.graph.termType !== 'DefaultGraph') {
      res.push(termToId(term.graph, true));
    }
    return nested ? res : JSON.stringify(res);
  default: throw new Error(`Unexpected termType: ${term.termType}`);
  }
}


// ## Quad constructor
class Quad extends Term {
  constructor(subject, predicate, object, graph) {
    super('');
    this._subject   = subject;
    this._predicate = predicate;
    this._object    = object;
    this._graph     = graph || DEFAULTGRAPH;
  }

  // ### The term type of this term
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
  }

  // ### Returns a plain object representation of this quad
  toJSON() {
    return {
      termType:  this.termType,
      subject:   this._subject.toJSON(),
      predicate: this._predicate.toJSON(),
      object:    this._object.toJSON(),
      graph:     this._graph.toJSON(),
    };
  }

  // ### Returns whether this object represents the same quad as the other
  equals(other) {
    return !!other && this._subject.equals(other.subject)     &&
                      this._predicate.equals(other.predicate) &&
                      this._object.equals(other.object)       &&
                      this._graph.equals(other.graph);
  }
}


// ### Escapes the quotes within the given literal
function escapeQuotes(id) {
  return id.replace(escapedLiteral, (_, quoted) => `"${quoted.replace(/"/g, '""')}`);
}

// ### Unescapes the quotes within the given literal
function unescapeQuotes(id) {
  return id.replace(escapedLiteral, (_, quoted) => `"${quoted.replace(/""/g, '"')}`);
}

// ### Creates an IRI
function namedNode(iri) {
  return new NamedNode(iri);
}

// ### Creates a blank node
function blankNode(name) {
  return new BlankNode(name || `n3-${_blankNodeCounter++}`);
}

// ### Creates a literal
function literal(value, languageOrDataType) {
  // Create a language-tagged string
  if (typeof languageOrDataType === 'string')
    return new Literal(`"${value}"@${languageOrDataType.toLowerCase()}`);

  // Automatically determine datatype for booleans and numbers
  let datatype = languageOrDataType ? languageOrDataType.value : '';
  if (datatype === '') {
    // Convert a boolean
    if (typeof value === 'boolean')
      datatype = xsd.boolean;
    // Convert an integer or double
    else if (typeof value === 'number') {
      if (Number.isFinite(value))
        datatype = Number.isInteger(value) ? xsd.integer : xsd.double;
      else {
        datatype = xsd.double;
        if (!Number.isNaN(value))
          value = value > 0 ? 'INF' : '-INF';
      }
    }
  }

  // Create a datatyped literal
  return (datatype === '' || datatype === xsd.string) ?
    new Literal(`"${value}"`) :
    new Literal(`"${value}"^^${datatype}`);
}

// ### Creates a variable
function variable(name) {
  return new Variable(name);
}

// ### Returns the default graph
function defaultGraph() {
  return DEFAULTGRAPH;
}

// ### Creates a quad
function quad(subject, predicate, object, graph) {
  return new Quad(subject, predicate, object, graph);
}

function fromTerm(term) {
  if (term instanceof Term)
    return term;

  // Term instantiated with another library
  switch (term.termType) {
  case 'NamedNode':    return namedNode(term.value);
  case 'BlankNode':    return blankNode(term.value);
  case 'Variable':     return variable(term.value);
  case 'DefaultGraph': return DEFAULTGRAPH;
  case 'Literal':      return literal(term.value, term.language || term.datatype);
  case 'Quad':         return fromQuad(term);
  default:             throw new Error(`Unexpected termType: ${term.termType}`);
  }
}

function fromQuad(inQuad) {
  if (inQuad instanceof Quad)
    return inQuad;

  if (inQuad.termType !== 'Quad')
    throw new Error(`Unexpected termType: ${inQuad.termType}`);

  return quad(fromTerm(inQuad.subject), fromTerm(inQuad.predicate), fromTerm(inQuad.object), fromTerm(inQuad.graph));
}

;// ../../node_modules/n3/src/index.js
/* unused harmony import specifier */ var Lexer;
/* unused harmony import specifier */ var Parser;
/* unused harmony import specifier */ var Writer;
/* unused harmony import specifier */ var Store;
/* unused harmony import specifier */ var EntityIndex;
/* unused harmony import specifier */ var StoreFactory;
/* unused harmony import specifier */ var Reasoner;
/* unused harmony import specifier */ var StreamParser;
/* unused harmony import specifier */ var StreamWriter;
/* unused harmony import specifier */ var Util;
/* unused harmony import specifier */ var BaseIRI;
/* unused harmony import specifier */ var src_DataFactory;
/* unused harmony import specifier */ var src_Term;
/* unused harmony import specifier */ var src_NamedNode;
/* unused harmony import specifier */ var src_Literal;
/* unused harmony import specifier */ var src_BlankNode;
/* unused harmony import specifier */ var src_Variable;
/* unused harmony import specifier */ var src_DefaultGraph;
/* unused harmony import specifier */ var src_Quad;
/* unused harmony import specifier */ var Triple;
/* unused harmony import specifier */ var src_termFromId;
/* unused harmony import specifier */ var src_termToId;













// Named exports


// Export all named exports as a default object for backward compatibility
/* harmony default export */ const src = ((/* unused pure expression or super */ null && ({
  Lexer,
  Parser,
  Writer,
  Store,
  StoreFactory,
  EntityIndex,
  StreamParser,
  StreamWriter,
  Util,
  Reasoner,
  BaseIRI,

  DataFactory: src_DataFactory,

  Term: src_Term,
  NamedNode: src_NamedNode,
  Literal: src_Literal,
  BlankNode: src_BlankNode,
  Variable: src_Variable,
  DefaultGraph: src_DefaultGraph,
  Quad: src_Quad,
  Triple,

  termFromId: src_termFromId,
  termToId: src_termToId,
})));


/***/ },

/***/ 8050
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(3968), exports);
__exportStar(__webpack_require__(1352), exports);
__exportStar(__webpack_require__(1947), exports);
__exportStar(__webpack_require__(1417), exports);
__exportStar(__webpack_require__(8963), exports);
__exportStar(__webpack_require__(9135), exports);
__exportStar(__webpack_require__(2000), exports);
//# sourceMappingURL=index.js.map

/***/ },

/***/ 3968
(__unused_webpack_module, exports) {

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

/***/ },

/***/ 1352
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DataFactory = void 0;
const BlankNode_1 = __webpack_require__(3968);
const DefaultGraph_1 = __webpack_require__(1947);
const Literal_1 = __webpack_require__(1417);
const NamedNode_1 = __webpack_require__(8963);
const Quad_1 = __webpack_require__(9135);
const Variable_1 = __webpack_require__(2000);
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

/***/ },

/***/ 1947
(__unused_webpack_module, exports) {

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

/***/ },

/***/ 1417
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Literal = void 0;
const NamedNode_1 = __webpack_require__(8963);
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
            other.language === this.language && this.datatype.equals(other.datatype);
    }
}
exports.Literal = Literal;
Literal.RDF_LANGUAGE_STRING = new NamedNode_1.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
Literal.XSD_STRING = new NamedNode_1.NamedNode('http://www.w3.org/2001/XMLSchema#string');
//# sourceMappingURL=Literal.js.map

/***/ },

/***/ 8963
(__unused_webpack_module, exports) {

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

/***/ },

/***/ 9135
(__unused_webpack_module, exports) {

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

/***/ },

/***/ 2000
(__unused_webpack_module, exports) {

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

/***/ },

/***/ 2962
(module) {

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
      const rel = f.slice(start+1).map(c => '..').concat(t.slice(start === f.length ? start - 1 : start)).join('/');
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


/***/ },

/***/ 1636
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
exports.a = void 0;
const term_1 = __webpack_require__(2130);
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
exports.a = {
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
                        const ctx = {
                            triples: constraintToTripleMapping.get(m.c)
                                .map(m => m.triple),
                            tripleExpr: m.c
                        };
                        const errors = semActHandler.dispatchAll(m.stack[mis].c.semActs, ctx, ptr);
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
            tcSolns.solutions = m.triples.reduce((acc, triple) => {
                const ret = {
                    type: "TestedTriple",
                    subject: (0, term_1.rdfJsTerm2Ld)(triple.subject),
                    predicate: (0, term_1.rdfJsTerm2Ld)(triple.predicate),
                    object: (0, term_1.rdfJsTerm2Ld)(triple.object)
                };
                const hit = constraintToTripleMapping.get(m.c).find(x => x.triple === triple);
                if (hit.res && Object.keys(hit.res).length > 0)
                    ret.referenced = hit.res;
                if (errors.length === 0 && "semActs" in m.c) {
                    Array.prototype.push.apply(errors, semActHandler.dispatchAll(m.c.semActs, { triples: [triple], tripleExpr: m.c }, ret));
                }
                return acc.concat(ret);
            }, []);
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

/***/ },

/***/ 4516
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
exports.a = void 0;
const term_1 = __webpack_require__(2130);
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
exports.a = {
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
            for (const nested of oneOf.expressions) {
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
            }
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
                    ? semActHandler.dispatchAll(constraint.semActs, { triples: [triple], tripleExpr: constraint }, tested)
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
            for (const newThread of newThreads) {
                const ctx = {
                    triples: newThread.matched.flatMap(m => m.triples),
                    tripleExpr: groupTE,
                };
                const semActErrors = semActHandler.dispatchAll(groupTE.semActs, ctx, newThread);
                if (semActErrors.length === 0) {
                    passes.push(newThread);
                }
                else {
                    Array.prototype.push.apply(newThread.errors, semActErrors);
                    failures.push(newThread);
                }
            }
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

/***/ },

/***/ 4085
(__unused_webpack_module, exports) {

"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
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


/***/ },

/***/ 7682
(__unused_webpack_module, exports) {

"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
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


/***/ },

/***/ 2932
(module, exports, __webpack_require__) {

/** Implementation of @shexjs/neighborhood-api which gets data from an @rdfjs/dataset
 */
const NeighborhoodRdfJsModule = (function () {
  const Api = __webpack_require__(7682);

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


/***/ },

/***/ 1238
(module, __unused_webpack_exports, __webpack_require__) {

/** Implementation of @shexjs/neighborhood-api which gets data from a SPARQL endpoint
 */
const NeighborhoodSparqlModule = (function () {
  const ShExTerm = __webpack_require__(2130);
  const ShExUtil = __webpack_require__(8822);
  const {ShExVisitor} = __webpack_require__(9522);
  const RdfJs = __webpack_require__(3724); // TODO: set global externally

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
      const rows = ShExUtil.executeQuery(query, endpoint, RdfJs.DataFactory);
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
      class MyVisitor extends ShExVisitor {
        constructor () {
          super();
          this.ret = {
            out: [],
            inc: []
          };
        }
        visitTripleConstraint (expr) {
          this.ret[expr.inverse ? "inc" : "out"].push(expr);
          return expr;
        };

        visitInclusion (inclusion) {
          return this.visitExpression(schemaIndex.tripleExprs[inclusion]);
        }
      }
      const visitor = new MyVisitor();

      if (tripleExpr)
        visitor.visitExpression(tripleExpr);
      return visitor.ret;
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
        if (t.object.termType === "BlankNode") {
          bnodes[t.object.value] = { from: point, p: t.predicate };
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
          const rows = ShExUtil.executeQuery(query, endpoint, RdfJs.DataFactory);
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
      if (point.termType !== "BlankNode")
        return recursed
        ? " " + turtlifyRdfJs(point)
        : " BIND (" + turtlifyRdfJs(point) + " AS ?s)\n";

      const see = bnodes[point.value].see || point;
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

    function turtlifyRdfJs (term) {
      switch (term.termType) {
      case "NamedNode": return "<" + term.value + ">";
      case "BlankNode": return "_:" + term.value;
      case "Literal": return "'" + term.value.replace() + "'" +
          (term.language
           ? "@" + term.language
           : term.datatypeString !== "http://www.w3.org/2001/XMLSchema#string"
           ? "^^<" + term.datatypeString + ">"
           : "");
      default: throw Error(`unrecognized termType ${term.termType} in ${term}`);
      }
    }

    function getUniques (rs) {
      // index the result set three ways
      const index = rs.reduce((acc, t) => {
        const [s, p, o] = t;
        if (s.termType !== "BlankNode") // only index bnodes
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


/***/ },

/***/ 876
(__unused_webpack_module, exports, __webpack_require__) {

var __webpack_unused_export__;
const { JisonParser, o } = __webpack_require__(5546);
/**
 * parser generated by  @ts-jison/parser-generator 0.4.1-alpha.2
 * @returns Parser implementing JisonParserApi and a Lexer implementing JisonLexerApi.
 */

  /*
    ShapeMap parser in the Jison parser generator format.
  */

  const ShExUtil = __webpack_require__(8822);
  const ShapeMap = __webpack_require__(4898);

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

  const EmptyObject = (/* unused pure expression or super */ null && ({  }));
  const EmptyShape = (/* unused pure expression or super */ null && ({ type: "Shape" }));


class ShapeMapJisonParser extends JisonParser {
    constructor(yy = {}, lexer = new ShapeMapJisonLexer(yy)) {
        super(yy, lexer);
        this.symbols_ = {"error":2,"shapeMap":3,"EOF":4,"pair":5,"Q_O_QGT_COMMA_E_S_Qpair_E_C_E_Star":6,"QGT_COMMA_E_Opt":7,"O_QGT_COMMA_E_S_Qpair_E_C":8,"GT_COMMA":9,"nodeSelector":10,"statusAndShape":11,"Qreason_E_Opt":12,"QjsonAttributes_E_Opt":13,"reason":14,"jsonAttributes":15,"GT_AT":16,"Qstatus_E_Opt":17,"shapeSelector":18,"ATSTART":19,"ATPNAME_NS":20,"ATPNAME_LN":21,"status":22,"objectTerm":23,"triplePattern":24,"IT_SPARQL":25,"string":26,"nodeIri":27,"shapeIri":28,"START":29,"subjectTerm":30,"BLANK_NODE_LABEL":31,"literal":32,"GT_LCURLEY":33,"IT_FOCUS":34,"nodePredicate":35,"O_QobjectTerm_E_Or_QIT___E_C":36,"GT_RCURLEY":37,"O_QsubjectTerm_E_Or_QIT___E_C":38,"IT__":39,"GT_NOT":40,"GT_OPT":41,"GT_DIVIDE":42,"GT_DOLLAR":43,"O_QAPPINFO_COLON_E_Or_QAPPINFO_SPACE_COLON_E_C":44,"jsonValue":45,"APPINFO_COLON":46,"APPINFO_SPACE_COLON":47,"IT_false":48,"IT_null":49,"IT_true":50,"jsonObject":51,"jsonArray":52,"INTEGER":53,"DECIMAL":54,"DOUBLE":55,"STRING_LITERAL2":56,"Q_O_QjsonMember_E_S_QGT_COMMA_E_S_QjsonMember_E_Star_C_E_Opt":57,"O_QGT_COMMA_E_S_QjsonMember_E_C":58,"jsonMember":59,"Q_O_QGT_COMMA_E_S_QjsonMember_E_C_E_Star":60,"O_QjsonMember_E_S_QGT_COMMA_E_S_QjsonMember_E_Star_C":61,"STRING_LITERAL2_COLON":62,"GT_LBRACKET":63,"Q_O_QjsonValue_E_S_QGT_COMMA_E_S_QjsonValue_E_Star_C_E_Opt":64,"GT_RBRACKET":65,"O_QGT_COMMA_E_S_QjsonValue_E_C":66,"Q_O_QGT_COMMA_E_S_QjsonValue_E_C_E_Star":67,"O_QjsonValue_E_S_QGT_COMMA_E_S_QjsonValue_E_Star_C":68,"rdfLiteral":69,"numericLiteral":70,"booleanLiteral":71,"Q_O_QLANGTAG_E_Or_QGT_DTYPE_E_S_QnodeIri_E_C_E_Opt":72,"O_QLANGTAG_E_Or_QGT_DTYPE_E_S_QnodeIri_E_C":73,"LANGTAG":74,"GT_DTYPE":75,"STRING_LITERAL1":76,"STRING_LITERAL_LONG1":77,"STRING_LITERAL_LONG2":78,"IT_a":79,"IRIREF":80,"PNAME_LN":81,"PNAME_NS":82,"$accept":0,"$end":1};
        this.terminals_ = {2:"error",4:"EOF",9:"GT_COMMA",16:"GT_AT",19:"ATSTART",20:"ATPNAME_NS",21:"ATPNAME_LN",25:"IT_SPARQL",29:"START",31:"BLANK_NODE_LABEL",33:"GT_LCURLEY",34:"IT_FOCUS",37:"GT_RCURLEY",39:"IT__",40:"GT_NOT",41:"GT_OPT",42:"GT_DIVIDE",43:"GT_DOLLAR",46:"APPINFO_COLON",47:"APPINFO_SPACE_COLON",48:"IT_false",49:"IT_null",50:"IT_true",53:"INTEGER",54:"DECIMAL",55:"DOUBLE",56:"STRING_LITERAL2",62:"STRING_LITERAL2_COLON",63:"GT_LBRACKET",65:"GT_RBRACKET",74:"LANGTAG",75:"GT_DTYPE",76:"STRING_LITERAL1",77:"STRING_LITERAL_LONG1",78:"STRING_LITERAL_LONG2",79:"IT_a",80:"IRIREF",81:"PNAME_LN",82:"PNAME_NS"};
        this.productions_ = [0,[3,1],[3,4],[8,2],[6,0],[6,2],[7,0],[7,1],[5,4],[12,0],[12,1],[13,0],[13,1],[11,3],[11,1],[11,1],[11,1],[17,0],[17,1],[10,1],[10,1],[10,2],[10,2],[18,1],[18,1],[30,1],[30,1],[23,1],[23,1],[24,5],[24,5],[36,1],[36,1],[38,1],[38,1],[22,1],[22,1],[14,2],[15,3],[44,1],[44,1],[45,1],[45,1],[45,1],[45,1],[45,1],[45,1],[45,1],[45,1],[45,1],[51,3],[58,2],[60,0],[60,2],[61,2],[57,0],[57,1],[59,2],[52,3],[66,2],[67,0],[67,2],[68,2],[64,0],[64,1],[32,1],[32,1],[32,1],[70,1],[70,1],[70,1],[69,2],[73,1],[73,2],[72,0],[72,1],[71,1],[71,1],[26,1],[26,1],[26,1],[26,1],[35,1],[35,1],[27,1],[27,1],[27,1],[27,1],[28,1],[28,1],[28,1],[28,1]];

        // shorten static method to just `o` for terse STATE_TABLE
        const $V0=[1,7],$V1=[1,16],$V2=[1,11],$V3=[1,14],$V4=[1,25],$V5=[1,24],$V6=[1,21],$V7=[1,22],$V8=[1,23],$V9=[1,28],$Va=[1,26],$Vb=[1,27],$Vc=[1,29],$Vd=[1,12],$Ve=[1,13],$Vf=[1,15],$Vg=[4,9],$Vh=[16,19,20,21],$Vi=[2,25],$Vj=[16,19,20,21,37],$Vk=[16,19,20,21,31,34,37,39,46,48,50,53,54,55,56,76,77,78,79,80,81,82],$Vl=[4,9,16,19,20,21,37,43,74,75],$Vm=[4,9,43],$Vn=[29,46,80,81,82],$Vo=[4,9,42,43],$Vp=[1,59],$Vq=[46,79,80,81,82],$Vr=[31,34,39,46,48,50,53,54,55,56,76,77,78,80,81,82],$Vs=[1,94],$Vt=[1,85],$Vu=[1,86],$Vv=[1,87],$Vw=[1,90],$Vx=[1,91],$Vy=[1,92],$Vz=[1,93],$VA=[1,95],$VB=[33,48,49,50,53,54,55,56,63],$VC=[4,9,37,65],$VD=[1,99],$VE=[9,37],$VF=[9,65];
        const o = JisonParser.expandParseTable;
        this.table = [{3:1,4:[1,2],5:3,10:4,23:5,24:6,25:$V0,26:20,27:8,30:9,31:$V1,32:10,33:$V2,46:$V3,48:$V4,50:$V5,53:$V6,54:$V7,55:$V8,56:$V9,69:17,70:18,71:19,76:$Va,77:$Vb,78:$Vc,80:$Vd,81:$Ve,82:$Vf},{1:[3]},{1:[2,1]},o($Vg,[2,4],{6:30}),{11:31,16:[1,32],19:[1,33],20:[1,34],21:[1,35]},o($Vh,[2,19]),o($Vh,[2,20]),{26:36,56:$V9,76:$Va,77:$Vb,78:$Vc},o($Vh,$Vi,{26:37,56:$V9,76:$Va,77:$Vb,78:$Vc}),o($Vj,[2,27]),o($Vj,[2,28]),{27:42,30:40,31:$V1,34:[1,38],38:39,39:[1,41],46:$V3,80:$Vd,81:$Ve,82:$Vf},o($Vk,[2,84]),o($Vk,[2,85]),o($Vk,[2,86]),o($Vk,[2,87]),o([16,19,20,21,37,46,79,80,81,82],[2,26]),o($Vj,[2,65]),o($Vj,[2,66]),o($Vj,[2,67]),o($Vj,[2,74],{72:43,73:44,74:[1,45],75:[1,46]}),o($Vj,[2,68]),o($Vj,[2,69]),o($Vj,[2,70]),o($Vj,[2,76]),o($Vj,[2,77]),o($Vl,[2,78]),o($Vl,[2,79]),o($Vl,[2,80]),o($Vl,[2,81]),{4:[2,6],7:47,8:48,9:[1,49]},o($Vm,[2,9],{12:50,14:51,42:[1,52]}),o($Vn,[2,17],{17:53,22:54,40:[1,55],41:[1,56]}),o($Vo,[2,14]),o($Vo,[2,15]),o($Vo,[2,16]),o($Vh,[2,21]),o($Vh,[2,22]),{27:58,35:57,46:$V3,79:$Vp,80:$Vd,81:$Ve,82:$Vf},{27:58,35:60,46:$V3,79:$Vp,80:$Vd,81:$Ve,82:$Vf},o($Vq,[2,33]),o($Vq,[2,34]),o([37,46,79,80,81,82],$Vi),o($Vj,[2,71]),o($Vj,[2,75]),o($Vj,[2,72]),{27:61,46:$V3,80:$Vd,81:$Ve,82:$Vf},{4:[1,62]},o($Vg,[2,5]),{4:[2,7],5:63,10:4,23:5,24:6,25:$V0,26:20,27:8,30:9,31:$V1,32:10,33:$V2,46:$V3,48:$V4,50:$V5,53:$V6,54:$V7,55:$V8,56:$V9,69:17,70:18,71:19,76:$Va,77:$Vb,78:$Vc,80:$Vd,81:$Ve,82:$Vf},o($Vg,[2,11],{13:64,15:65,43:[1,66]}),o($Vm,[2,10]),{26:67,56:$V9,76:$Va,77:$Vb,78:$Vc},{18:68,28:69,29:[1,70],46:[1,73],80:[1,71],81:[1,72],82:[1,74]},o($Vn,[2,18]),o($Vn,[2,35]),o($Vn,[2,36]),{23:76,26:20,27:42,30:9,31:$V1,32:10,36:75,39:[1,77],46:$V3,48:$V4,50:$V5,53:$V6,54:$V7,55:$V8,56:$V9,69:17,70:18,71:19,76:$Va,77:$Vb,78:$Vc,80:$Vd,81:$Ve,82:$Vf},o($Vr,[2,82]),o($Vr,[2,83]),{34:[1,78]},o($Vj,[2,73]),{1:[2,2]},o($Vg,[2,3]),o($Vg,[2,8]),o($Vg,[2,12]),{44:79,46:[1,80],47:[1,81]},o($Vm,[2,37]),o($Vo,[2,13]),o($Vo,[2,23]),o($Vo,[2,24]),o($Vo,[2,88]),o($Vo,[2,89]),o($Vo,[2,90]),o($Vo,[2,91]),{37:[1,82]},{37:[2,31]},{37:[2,32]},{37:[1,83]},{33:$Vs,45:84,48:$Vt,49:$Vu,50:$Vv,51:88,52:89,53:$Vw,54:$Vx,55:$Vy,56:$Vz,63:$VA},o($VB,[2,39]),o($VB,[2,40]),o($Vh,[2,29]),o($Vh,[2,30]),o($Vg,[2,38]),o($VC,[2,41]),o($VC,[2,42]),o($VC,[2,43]),o($VC,[2,44]),o($VC,[2,45]),o($VC,[2,46]),o($VC,[2,47]),o($VC,[2,48]),o($VC,[2,49]),{37:[2,55],57:96,59:98,61:97,62:$VD},{33:$Vs,45:102,48:$Vt,49:$Vu,50:$Vv,51:88,52:89,53:$Vw,54:$Vx,55:$Vy,56:$Vz,63:$VA,64:100,65:[2,63],68:101},{37:[1,103]},{37:[2,56]},o($VE,[2,52],{60:104}),{33:$Vs,45:105,48:$Vt,49:$Vu,50:$Vv,51:88,52:89,53:$Vw,54:$Vx,55:$Vy,56:$Vz,63:$VA},{65:[1,106]},{65:[2,64]},o($VF,[2,60],{67:107}),o($VC,[2,50]),{9:[1,109],37:[2,54],58:108},o($VE,[2,57]),o($VC,[2,58]),{9:[1,111],65:[2,62],66:110},o($VE,[2,53]),{59:112,62:$VD},o($VF,[2,61]),{33:$Vs,45:113,48:$Vt,49:$Vu,50:$Vv,51:88,52:89,53:$Vw,54:$Vx,55:$Vy,56:$Vz,63:$VA},o($VE,[2,51]),o($VF,[2,59])];
        this.defaultActions = {2:[2,1],62:[2,2],76:[2,31],77:[2,32],97:[2,56],101:[2,64]};
    }
    performAction (yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */
          const $0 = $$.length - 1;
        switch (yystate) {
case 1:

          return []
        
// removed by dead control flow

case 2:

          return [$$[$0-3]].concat($$[$0-2])
        
// removed by dead control flow

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
exports.Gs = ShapeMapJisonParser;


/* generated by @ts-jison/lexer-generator 0.4.1-alpha.2 */
const { JisonLexer } = __webpack_require__(7450);

class ShapeMapJisonLexer extends JisonLexer {
    constructor (yy = {}) {
        super(yy);
        this.options = {"moduleName":"ShapeMapJison"};
        this.rules = [
        /^(?:\s+|#[^\u000a\u000d]*|\/\*(?:[^*]|\*(?:[^/]|\\\/))*\*\/)/,
        /^(?:appinfo[\u0020\u000A\u0009]+:)/,
        /^(?:"(?:[^\u0022\u005C\u000A\u000D]|\\[\"\'\\bfnrt]|\\u(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\U(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f]))*"[\u0020\u000A\u0009]*:)/,
        /^(?:[Ff][Oo][Cc][Uu][Ss])/,
        /^(?:[Ss][Tt][Aa][Rr][Tt])/,
        /^(?:@[Ss][Tt][Aa][Rr][Tt])/,
        /^(?:[Ss][Pp][Aa][Rr][Qq][Ll])/,
        /^(?:@(?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])(?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]|\.)*(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|:|[0-9]|%(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\(?:_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]|\.|:|%(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\(?:_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))*)/,
        /^(?:@(?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])(?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]|\.)*(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)/,
        /^(?:@[A-Za-z]+(?:-[0-9A-Za-z]+)*)/,
        /^(?:(?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])(?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]|\.)*(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|:|[0-9]|%(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\(?:_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]|\.|:|%(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\(?:_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))*)/,
        /^(?:appinfo:)/,
        /^(?:(?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])(?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]|\.)*(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)/,
        /^(?:[+-]?(?:[0-9]+\.[0-9]*[Ee][+-]?[0-9]+|\.?[0-9]+[Ee][+-]?[0-9]+))/,
        /^(?:[+-]?[0-9]*\.[0-9]+)/,
        /^(?:[+-]?[0-9]+)/,
        /^(?:<(?:[^\u0000-\u0020<>\"{}|^`\\]|\\u(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\U(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f]))*>)/,
        /^(?:_:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|[0-9])(?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]|\.)*(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)/,
        /^(?:'''(?:(?:'|'')?(?:[^\'\\]|\\[\"\'\\bfnrt]|\\u(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\U(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])))*''')/,
        /^(?:"""(?:(?:"|"")?(?:[^\"\\]|\\[\"\'\\bfnrt]|\\u(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\U(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])))*""")/,
        /^(?:'(?:[^\u0027\u005c\u000a\u000d]|\\[\"\'\\bfnrt]|\\u(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\U(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f]))*')/,
        /^(?:"(?:[^\u0022\u005c\u000a\u000d]|\\[\"\'\\bfnrt]|\\u(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\U(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f]))*")/,
        /^(?:a\b)/,
        /^(?:,)/,
        /^(?:\{)/,
        /^(?:\})/,
        /^(?:@)/,
        /^(?:!)/,
        /^(?:\?)/,
        /^(?:\/)/,
        /^(?:\$)/,
        /^(?:\[)/,
        /^(?:\])/,
        /^(?:\^\^)/,
        /^(?:_\b)/,
        /^(?:true\b)/,
        /^(?:false\b)/,
        /^(?:null\b)/,
        /^(?:$)/,
        /^(?:[a-zA-Z0-9_-]+)/,
        /^(?:.)/
    ];
        this.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40],"inclusive":true}};
    }
    performAction (yy, yy_, $avoiding_name_collisions, YY_START) {
              let YYSTATE = YY_START;
            switch ($avoiding_name_collisions) {
    case 0:/**/
      break;
    case 1:return 47;
      // removed by dead control flow

    case 2:return 62;
      // removed by dead control flow

    case 3:return 34;
      // removed by dead control flow

    case 4:return 29;
      // removed by dead control flow

    case 5:return 19;
      // removed by dead control flow

    case 6:return 25;
      // removed by dead control flow

    case 7:return 21;
      // removed by dead control flow

    case 8:return 20;
      // removed by dead control flow

    case 9:return 74;
      // removed by dead control flow

    case 10:return 81;
      // removed by dead control flow

    case 11:return 46;
      // removed by dead control flow

    case 12:return 82;
      // removed by dead control flow

    case 13:return 55;
      // removed by dead control flow

    case 14:return 54;
      // removed by dead control flow

    case 15:return 53;
      // removed by dead control flow

    case 16:return 80;
      // removed by dead control flow

    case 17:return 31;
      // removed by dead control flow

    case 18:return 77;
      // removed by dead control flow

    case 19:return 78;
      // removed by dead control flow

    case 20:return 76;
      // removed by dead control flow

    case 21:return 56;
      // removed by dead control flow

    case 22:return 79;
      // removed by dead control flow

    case 23:return 9;
      // removed by dead control flow

    case 24:return 33;
      // removed by dead control flow

    case 25:return 37;
      // removed by dead control flow

    case 26:return 16;
      // removed by dead control flow

    case 27:return 40;
      // removed by dead control flow

    case 28:return 41;
      // removed by dead control flow

    case 29:return 42;
      // removed by dead control flow

    case 30:return 43;
      // removed by dead control flow

    case 31:return 63;
      // removed by dead control flow

    case 32:return 65;
      // removed by dead control flow

    case 33:return 75;
      // removed by dead control flow

    case 34:return 39;
      // removed by dead control flow

    case 35:return 50;
      // removed by dead control flow

    case 36:return 48;
      // removed by dead control flow

    case 37:return 49;
      // removed by dead control flow

    case 38:return 4;
      // removed by dead control flow

    case 39:return 'unexpected word "'+yy_.yytext+'"';
      // removed by dead control flow

    case 40:return 'invalid character '+yy_.yytext;
      // removed by dead control flow

        }
    }
}


// Export module
__webpack_unused_export__ = ({ value: true });
__webpack_unused_export__ = ShapeMapJisonLexer;



/***/ },

/***/ 2192
(module, __unused_webpack_exports, __webpack_require__) {

const ShapeMapParser = (function () {

// stolen as much as possible from SPARQL.js
if (true) {
  ShapeMapJison = (__webpack_require__(876)/* .ShapeMapJisonParser */ .Gs); // node environment
} else // removed by dead control flow
{}

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
      // removed by dead control flow

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


/***/ },

/***/ 4898
(module) {

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


/***/ },

/***/ 3854
(module, __unused_webpack_exports, __webpack_require__) {

/* ShapeMap - javascript module to associate RDF nodes with labeled shapes.
 *
 * See README for description.
 */

const ShapeMapCjsModule = (function () {

  const symbols = __webpack_require__(4898)

  // Write the parser object directly into the symbols so the caller shares a
  // symbol space with ShapeMapJison for e.g. start and focus.
  symbols.Parser = __webpack_require__(2192)
  return symbols
})();

// Export the `ShExValidator` class as a whole.
if (true)
  module.exports = ShapeMapCjsModule;


/***/ },

/***/ 6702
(module, __unused_webpack_exports, __webpack_require__) {

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

  const ShExUtil = __webpack_require__(8822);
  const {Merger} = __webpack_require__(4717);
  const ShExParser = __webpack_require__(8170);

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
      }, error => this.reject(error));
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
    loadExtensions: config.loadExtensions || LoadNoExtensions,
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

  async function mergeSchema (obj, mediaType, resourceLoadControler, options, importers) {
    if (!("schema" in obj))
      throw Error(`Bad parameter to mergeSchema; ${summarize(obj)} is not a loaded schema`)
    if (obj.schema.type !== "Schema")
      throw Error(`Bad parameter to mergeSchema .schema; ${summarize(obj.schema)} !== ""Schema`)
    try {
      loadSchemaImports(obj.schema, importers.concat([obj.url]), resourceLoadControler, options);
      return {mediaType, url: obj.url, importers, schema: obj.schema};
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

  async function mergeGraph (obj, mediaType, _resourceLoadControler, options, importers) {
    try {
      // loadOwlImports(obj.graph, importers.concat([obj.url]), resourceLoadControler, options)
      const graph = Array.isArray(typeof obj.graph)
            ? obj.graph
            : obj.graph.getQuads()
      return {mediaType, url: obj.url, importers, graph}
    } catch (e) {
      const e2 = Error("error merging graph object " + obj.graph + ": " + e)
      e2.stack = e.stack
      throw e2
    }
  }

  function loadSchemaImports (schema, importers, resourceLoadControler, schemaOptions) {
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
                          meta, schemaOptions, resourceLoadControler, importers)
          .then(({mediaType, url, schema}) => {
            if (schema.start) // When some schema A imports schema B, B's start member is ignored.
              delete schema.start // — http://shex.io/spec/#import
            return {mediaType, url, importers, schema}
          })
      })); // addAfter would be after invoking schema.
    })
    return ret
  }

  async function loadList (src, metaList, mediaType, parserWrapper, merger, options, resourceLoadControler, importers) {
    return src.map(
      p => {
        const meta = addMeta(typeof p === "string" ? p : p.url, mediaType, metaList)
        let ret;
        if (typeof p === "string") {
          ret = loader.GET(p, mediaType).then(loaded => {
            meta.base = meta.url = loaded.url // update with wherever if ultimately loaded from after URL fixups and redirects
            resourceLoadControler.loadNovelUrl(loaded.url, p) // replace p with loaded.url in loaded list
            return parserWrapper(loaded.text, mediaType, loaded.url,
                                 meta, options, resourceLoadControler, importers)
          })
        } else {
          if ("text" in p) {
            ret = parserWrapper(p.text, mediaType, p.url, meta, options, resourceLoadControler, importers);
          } else {
            ret = merger(p, mediaType, resourceLoadControler, options, importers);
            meta.importers = importers;
          }
        }
        resourceLoadControler.add(ret);
        return ret;
      }
    )
  }

  /* load - load ShExC, ShExJ, and ShExR into a single Schema and RDF flavors into
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
      allSchemas = schemaOptions.loadController || new ResourceLoadControler(shexc.concat(json).concat(turtle));
      loadList(shexc, returns.schemaMeta, "text/shex",
               parseShExC, mergeSchema, schemaOptions, allSchemas, [])
      loadList(json, returns.schemaMeta, "application/json",
               parseShExJ, mergeSchema, schemaOptions, allSchemas, [])
      loadList(turtle || [], returns.schemaMeta, "text/turtle",
               parseShExR, mergeSchema, schemaOptions, allSchemas, [])
    }

    {
      const {turtle = [], jsonld = []} = data || {};
      allGraphs = dataOptions.loadController || new ResourceLoadControler(turtle.concat(jsonld));
      loadList(turtle, returns.dataMeta, "text/turtle",
               parseTurtle, mergeGraph, dataOptions, allGraphs, [])
      loadList(jsonld, returns.dataMeta, "application/ld+json",
               parseJSONLD, mergeGraph, dataOptions, allGraphs, [])
    }

    const [schemaSrcs, dataSrcs] = await Promise.all([allSchemas.allLoaded(),
                                                      allGraphs.allLoaded()])
    const left = {schema: returns.schema, schemaMeta: returns.schemaMeta[0]};
    // const merger = new Merger(left, schemaOptions.collisionPolicy, true);
    schemaSrcs.forEach((sSrc, idx) => {
      const {schema, ...schemaMeta} = sSrc;
      /*merger*/new Merger(left, schemaOptions.collisionPolicy, true).merge({schema, schemaMeta});
      delete sSrc.schema;
      // process.stdout.clearLine();
      // process.stdout.cursorTo(0);
      // process.stdout.write(`Merged ${idx} of ${schemaSrcs.length} imports: ${schemaMeta.url}`);
    });
    // process.stdout.clearLine();
    // process.stdout.cursorTo(0);
    // process.stdout.write(`Merged ${schemaSrcs.length} imports.\n`);
    dataSrcs.forEach(dSrc => {
      returns.data.addQuads(dSrc.graph)
      delete dSrc.graph;
    });
    if (returns.schemaMeta.length > 0 && !schemaOptions.keepImports)
      ShExUtil.isWellDefined(returns.schema, schemaOptions)
    return returns
  }

  function parseShExC (text, mediaType, url, meta, schemaOptions, resourceLoadControler, importers) {
    const parser = schemaOptions && "parser" in schemaOptions ?
        schemaOptions.parser :
        ShExParser.construct(url, {}, schemaOptions)
    try {
      meta.prefixes = {};
      meta.importers = importers;
      const schema = parser.parse(text, url, {meta}, /*filename*/)
      // !! horrible hack until I set a variable to know if there's a BASE.
      if (schema.base === url) delete schema.base
      loadSchemaImports(schema, importers.concat([url]), resourceLoadControler, schemaOptions)
      return Promise.resolve({mediaType, url, importers, schema})
    } catch (e) {
      const locStr = e.location
            ? `(${e.location.first_line}:${e.location.first_column})`
            : ''
      e.message = "error parsing ShEx " + url + locStr + ": " + e.message
      return Promise.reject(e)
    }
  }

  function parseShExJ (text, mediaType, url, meta, schemaOptions, resourceLoadControler, importers) {
    try {
      const s = ShExUtil.ShExJtoAS(JSON.parse(text))
      meta.prefixes = {}
      meta.importers = importers;
      meta.base = null
      loadSchemaImports(s, importers.concat([url]), resourceLoadControler)
      return Promise.resolve({mediaType, url, importers, schema: s})
    } catch (e) {
      const e2 = Error("error parsing JSON " + url + ": " + e)
      // e2.stack = e.stack
      return Promise.reject(e2)
    }
  }

  async function parseShExR (text, mediaType, url, meta, schemaOptions, resourceLoadControler, importers) {
    try {
      const x = await parseTurtle(text, mediaType, url, meta, schemaOptions, resourceLoadControler, importers)
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
      await loadSchemaImports(schema, importers.concat([url]), resourceLoadControler); // shouldn't be any
      return Promise.resolve({mediaType, url, importers, schema})
    } catch (e) {
      const e2 = Error("error parsing Turtle schema " + url + ": " + e)
      if (typeof e === "object" && "stack" in e)
        e2.stack = e.stack
      return Promise.reject(e2)
    }
  }

  function parseTurtle (text, mediaType, url, meta, dataOptions, resourceLoadControler, importers) {
    return new Promise(function (resolve, reject) {
      const graph = []
      new config.rdfjs.Parser({baseIRI: url, blankNodePrefix: "", format: "text/turtle"}).
        parse(text,
              function (error, quad, prefixes) {
                if (prefixes) {
                  meta.prefixes = prefixes
                  // data.addPrefixes(prefixes)
                }
                meta.importers = importers;
                if (error) {
                  reject("error parsing " + url + ": " + error)
                } else if (quad) {
                  graph.push(quad)
                } else {
                  meta.base = this._base
                  resolve({mediaType, url, importers, graph})
                }
              })
    })
  }

  async function parseJSONLD (text, mediaType, url, meta, dataOptions, resourceLoadControler, importers) {
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
      meta.importers = importers;
      return parseTurtle(nquads, mediaType, url, meta, dataOptions, resourceLoadControler, importers)
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


/***/ },

/***/ 4613
(__unused_webpack_module, exports, __webpack_require__) {

var __webpack_unused_export__;
const { JisonParser, o } = __webpack_require__(5546);
/**
 * parser generated by  @ts-jison/parser-generator 0.4.1-alpha.2
 * @returns Parser implementing JisonParserApi and a Lexer implementing JisonLexerApi.
 */

  /*
    ShEx parser in the Jison parser generator format.
  */

  const UNBOUNDED = -1;

  const ShExUtil = __webpack_require__(8822);

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

class ShExJisonParser extends JisonParser {
    constructor(yy = {}, lexer = new ShExJisonLexer(yy)) {
        super(yy, lexer);
        this.symbols_ = {"error":2,"shexDoc":3,"initParser":4,"Qdirective_E_Star":5,"Q_O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C_E_Opt":6,"EOF":7,"directive":8,"O_QnotStartAction_E_Or_QstartActions_E_C":9,"notStartAction":10,"startActions":11,"Qstatement_E_Star":12,"statement":13,"O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C":14,"baseDecl":15,"prefixDecl":16,"importDecl":17,"IT_BASE":18,"IRIREF":19,"IT_PREFIX":20,"PNAME_NS":21,"iri":22,"IT_IMPORT":23,"start":24,"shapeExprDecl":25,"IT_start":26,"=":27,"shapeAnd":28,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Star":29,"QcodeDecl_E_Plus":30,"codeDecl":31,"mark":32,"QIT_ABSTRACT_E_Opt":33,"shapeExprLabel":34,"Qrestriction_E_Star":35,"O_QshapeExpression_E_Or_QshapeRef_E_Or_QIT_EXTERNAL_E_C":36,"IT_ABSTRACT":37,"restriction":38,"shapeExpression":39,"shapeRef":40,"IT_EXTERNAL":41,"QIT_NOT_E_Opt":42,"shapeAtomNoRef":43,"QshapeOr_E_Opt":44,"IT_NOT":45,"shapeOr":46,"inlineShapeExpression":47,"inlineShapeOr":48,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Plus":49,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Plus":50,"O_QIT_OR_E_S_QshapeAnd_E_C":51,"IT_OR":52,"O_QIT_AND_E_S_QshapeNot_E_C":53,"IT_AND":54,"shapeNot":55,"inlineShapeAnd":56,"Q_O_QIT_OR_E_S_QinlineShapeAnd_E_C_E_Star":57,"O_QIT_OR_E_S_QinlineShapeAnd_E_C":58,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Star":59,"inlineShapeNot":60,"Q_O_QIT_AND_E_S_QinlineShapeNot_E_C_E_Star":61,"O_QIT_AND_E_S_QinlineShapeNot_E_C":62,"shapeAtom":63,"inlineShapeAtom":64,"nonLitNodeConstraint":65,"QshapeOrRef_E_Opt":66,"litNodeConstraint":67,"shapeOrRef":68,"QnonLitNodeConstraint_E_Opt":69,"(":70,")":71,".":72,"shapeDefinition":73,"nonLitInlineNodeConstraint":74,"QinlineShapeOrRef_E_Opt":75,"litInlineNodeConstraint":76,"inlineShapeOrRef":77,"QnonLitInlineNodeConstraint_E_Opt":78,"inlineShapeDefinition":79,"ATPNAME_LN":80,"ATPNAME_NS":81,"@":82,"Qannotation_E_Star":83,"semanticActions":84,"annotation":85,"IT_LITERAL":86,"QxsFacet_E_Star":87,"datatype":88,"valueSet":89,"QnumericFacet_E_Plus":90,"xsFacet":91,"numericFacet":92,"nonLiteralKind":93,"QstringFacet_E_Star":94,"QstringFacet_E_Plus":95,"stringFacet":96,"IT_IRI":97,"IT_BNODE":98,"IT_NONLITERAL":99,"stringLength":100,"INTEGER":101,"REGEXP":102,"IT_LENGTH":103,"IT_MINLENGTH":104,"IT_MAXLENGTH":105,"numericRange":106,"rawNumeric":107,"numericLength":108,"DECIMAL":109,"DOUBLE":110,"string":111,"^^":112,"IT_MININCLUSIVE":113,"IT_MINEXCLUSIVE":114,"IT_MAXINCLUSIVE":115,"IT_MAXEXCLUSIVE":116,"IT_TOTALDIGITS":117,"IT_FRACTIONDIGITS":118,"Q_O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C_E_Star":119,"{":120,"QtripleExpression_E_Opt":121,"}":122,"O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C":123,"extension":124,"extraPropertySet":125,"IT_CLOSED":126,"tripleExpression":127,"IT_EXTRA":128,"Qpredicate_E_Plus":129,"predicate":130,"oneOfTripleExpr":131,"groupTripleExpr":132,"multiElementOneOf":133,"Q_O_QGT_PIPE_E_S_QgroupTripleExpr_E_C_E_Plus":134,"O_QGT_PIPE_E_S_QgroupTripleExpr_E_C":135,"|":136,"singleElementGroup":137,"multiElementGroup":138,"unaryTripleExpr":139,"QGT_SEMI_E_Opt":140,",":141,";":142,"Q_O_QGT_SEMI_E_S_QunaryTripleExpr_E_C_E_Plus":143,"O_QGT_SEMI_E_S_QunaryTripleExpr_E_C":144,"Q_O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C_E_Opt":145,"O_QtripleConstraint_E_Or_QbracketedTripleExpr_E_C":146,"include":147,"O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C":148,"$":149,"tripleExprLabel":150,"tripleConstraint":151,"bracketedTripleExpr":152,"Qcardinality_E_Opt":153,"cardinality":154,"QsenseFlags_E_Opt":155,"senseFlags":156,"*":157,"+":158,"?":159,"REPEAT_RANGE":160,"^":161,"[":162,"QvalueSetValue_E_Star":163,"]":164,"valueSetValue":165,"iriRange":166,"literalRange":167,"languageRange":168,"O_QiriExclusion_E_Plus_Or_QliteralExclusion_E_Plus_Or_QlanguageExclusion_E_Plus_C":169,"QiriExclusion_E_Plus":170,"iriExclusion":171,"QliteralExclusion_E_Plus":172,"literalExclusion":173,"QlanguageExclusion_E_Plus":174,"languageExclusion":175,"Q_O_QGT_TILDE_E_S_QiriExclusion_E_Star_C_E_Opt":176,"QiriExclusion_E_Star":177,"O_QGT_TILDE_E_S_QiriExclusion_E_Star_C":178,"~":179,"-":180,"QGT_TILDE_E_Opt":181,"literal":182,"Q_O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C_E_Opt":183,"QliteralExclusion_E_Star":184,"O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C":185,"LANGTAG":186,"Q_O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C_E_Opt":187,"O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C":188,"QlanguageExclusion_E_Star":189,"&":190,"//":191,"O_Qiri_E_Or_Qliteral_E_C":192,"QcodeDecl_E_Star":193,"%":194,"O_QCODE_E_Or_QGT_MODULO_E_C":195,"CODE":196,"rdfLiteral":197,"numericLiteral":198,"booleanLiteral":199,"a":200,"blankNode":201,"langString":202,"Q_O_QGT_DTYPE_E_S_Qdatatype_E_C_E_Opt":203,"O_QGT_DTYPE_E_S_Qdatatype_E_C":204,"IT_true":205,"IT_false":206,"STRING_LITERAL1":207,"STRING_LITERAL_LONG1":208,"STRING_LITERAL2":209,"STRING_LITERAL_LONG2":210,"LANG_STRING_LITERAL1":211,"LANG_STRING_LITERAL_LONG1":212,"LANG_STRING_LITERAL2":213,"LANG_STRING_LITERAL_LONG2":214,"prefixedName":215,"PNAME_LN":216,"BLANK_NODE_LABEL":217,"O_QIT_EXTENDS_E_Or_QGT_AMP_E_C":218,"extendsShapeExpression":219,"extendsShapeOr":220,"extendsShapeAnd":221,"Q_O_QIT_OR_E_S_QextendsShapeAnd_E_C_E_Star":222,"O_QIT_OR_E_S_QextendsShapeAnd_E_C":223,"extendsShapeNot":224,"Q_O_QIT_AND_E_S_QextendsShapeNot_E_C_E_Star":225,"O_QIT_AND_E_S_QextendsShapeNot_E_C":226,"extendsShapeAtom":227,"IT_EXTENDS":228,"O_QIT_RESTRICTS_E_Or_QGT_MINUS_E_C":229,"IT_RESTRICTS":230,"$accept":0,"$end":1};
        this.terminals_ = {2:"error",7:"EOF",18:"IT_BASE",19:"IRIREF",20:"IT_PREFIX",21:"PNAME_NS",23:"IT_IMPORT",26:"IT_start",27:"=",37:"IT_ABSTRACT",41:"IT_EXTERNAL",45:"IT_NOT",52:"IT_OR",54:"IT_AND",70:"(",71:")",72:".",80:"ATPNAME_LN",81:"ATPNAME_NS",82:"@",86:"IT_LITERAL",97:"IT_IRI",98:"IT_BNODE",99:"IT_NONLITERAL",101:"INTEGER",102:"REGEXP",103:"IT_LENGTH",104:"IT_MINLENGTH",105:"IT_MAXLENGTH",109:"DECIMAL",110:"DOUBLE",112:"^^",113:"IT_MININCLUSIVE",114:"IT_MINEXCLUSIVE",115:"IT_MAXINCLUSIVE",116:"IT_MAXEXCLUSIVE",117:"IT_TOTALDIGITS",118:"IT_FRACTIONDIGITS",120:"{",122:"}",126:"IT_CLOSED",128:"IT_EXTRA",136:"|",141:",",142:";",149:"$",157:"*",158:"+",159:"?",160:"REPEAT_RANGE",161:"^",162:"[",164:"]",179:"~",180:"-",186:"LANGTAG",190:"&",191:"//",194:"%",196:"CODE",200:"a",205:"IT_true",206:"IT_false",207:"STRING_LITERAL1",208:"STRING_LITERAL_LONG1",209:"STRING_LITERAL2",210:"STRING_LITERAL_LONG2",211:"LANG_STRING_LITERAL1",212:"LANG_STRING_LITERAL_LONG1",213:"LANG_STRING_LITERAL2",214:"LANG_STRING_LITERAL_LONG2",216:"PNAME_LN",217:"BLANK_NODE_LABEL",228:"IT_EXTENDS",230:"IT_RESTRICTS"};
        this.productions_ = [0,[3,4],[4,0],[5,0],[5,2],[9,1],[9,1],[12,0],[12,2],[14,2],[6,0],[6,1],[8,1],[8,1],[8,1],[15,2],[16,3],[17,2],[10,1],[10,1],[24,4],[11,1],[30,1],[30,2],[13,1],[13,1],[25,6],[32,0],[33,0],[33,1],[35,0],[35,2],[36,1],[36,1],[36,1],[39,3],[39,3],[39,2],[44,0],[44,1],[47,1],[46,1],[46,2],[51,2],[49,1],[49,2],[53,2],[50,1],[50,2],[29,0],[29,2],[48,2],[58,2],[57,0],[57,2],[28,2],[59,0],[59,2],[56,2],[62,2],[61,0],[61,2],[55,2],[42,0],[42,1],[60,2],[63,2],[63,1],[63,2],[63,3],[63,1],[66,0],[66,1],[69,0],[69,1],[43,2],[43,1],[43,2],[43,3],[43,1],[64,2],[64,1],[64,2],[64,3],[64,1],[75,0],[75,1],[78,0],[78,1],[68,1],[68,1],[77,1],[77,1],[40,1],[40,1],[40,2],[67,3],[83,0],[83,2],[65,3],[76,2],[76,2],[76,2],[76,1],[87,0],[87,2],[90,1],[90,2],[74,2],[74,1],[94,0],[94,2],[95,1],[95,2],[93,1],[93,1],[93,1],[91,1],[91,1],[96,2],[96,1],[100,1],[100,1],[100,1],[92,2],[92,2],[107,1],[107,1],[107,1],[107,3],[106,1],[106,1],[106,1],[106,1],[108,1],[108,1],[73,3],[79,4],[123,1],[123,1],[123,1],[119,0],[119,2],[121,0],[121,1],[125,2],[129,1],[129,2],[127,1],[131,1],[131,1],[133,2],[135,2],[134,1],[134,2],[132,1],[132,1],[137,2],[140,0],[140,1],[140,1],[138,3],[144,2],[144,2],[143,1],[143,2],[139,2],[139,1],[148,2],[145,0],[145,1],[146,1],[146,1],[152,6],[153,0],[153,1],[151,6],[155,0],[155,1],[154,1],[154,1],[154,1],[154,1],[156,1],[89,3],[163,0],[163,2],[165,1],[165,1],[165,1],[165,2],[170,1],[170,2],[172,1],[172,2],[174,1],[174,2],[169,1],[169,1],[169,1],[166,2],[177,0],[177,2],[178,2],[176,0],[176,1],[171,3],[181,0],[181,1],[167,2],[184,0],[184,2],[185,2],[183,0],[183,1],[173,3],[168,2],[168,2],[189,0],[189,2],[188,2],[187,0],[187,1],[175,3],[147,2],[85,3],[192,1],[192,1],[84,1],[193,0],[193,2],[31,3],[195,1],[195,1],[182,1],[182,1],[182,1],[130,1],[130,1],[88,1],[34,1],[34,1],[150,1],[150,1],[198,1],[198,1],[198,1],[197,1],[197,2],[204,2],[203,0],[203,1],[199,1],[199,1],[111,1],[111,1],[111,1],[111,1],[202,1],[202,1],[202,1],[202,1],[22,1],[22,1],[215,1],[215,1],[201,1],[124,2],[219,1],[220,2],[223,2],[222,0],[222,2],[221,2],[226,2],[225,0],[225,2],[224,2],[227,2],[227,1],[227,2],[227,3],[227,1],[218,1],[218,1],[38,2],[229,1],[229,1]];

        // shorten static method to just `o` for terse STATE_TABLE
        const $V0=[7,18,19,20,21,23,26,37,194,216,217],$V1=[19,21,37,216,217],$V2=[2,27],$V3=[1,22],$V4=[2,12],$V5=[2,13],$V6=[2,14],$V7=[7,18,19,20,21,23,26,37,216,217],$V8=[1,28],$V9=[1,31],$Va=[1,30],$Vb=[2,18],$Vc=[2,19],$Vd=[19,21,216,217],$Ve=[2,28],$Vf=[1,35],$Vg=[1,37],$Vh=[1,40],$Vi=[1,39],$Vj=[2,15],$Vk=[2,17],$Vl=[2,262],$Vm=[2,263],$Vn=[2,264],$Vo=[2,265],$Vp=[19,21,70,72,80,81,82,86,97,98,99,102,103,104,105,113,114,115,116,117,118,120,126,128,162,190,216,228],$Vq=[2,63],$Vr=[1,58],$Vs=[1,62],$Vt=[1,66],$Vu=[1,65],$Vv=[1,64],$Vw=[194,196],$Vx=[1,73],$Vy=[1,76],$Vz=[1,75],$VA=[2,16],$VB=[7,18,19,20,21,23,26,37,52,216,217],$VC=[2,49],$VD=[7,18,19,20,21,23,26,37,52,54,216,217],$VE=[2,56],$VF=[120,126,128,190,228],$VG=[2,141],$VH=[1,111],$VI=[1,119],$VJ=[1,93],$VK=[1,101],$VL=[1,102],$VM=[1,103],$VN=[1,110],$VO=[1,115],$VP=[1,116],$VQ=[1,117],$VR=[1,120],$VS=[1,121],$VT=[1,122],$VU=[1,123],$VV=[1,124],$VW=[1,125],$VX=[1,106],$VY=[1,118],$VZ=[2,64],$V_=[19,21,41,45,70,72,80,81,82,86,97,98,99,102,103,104,105,113,114,115,116,117,118,120,126,128,162,180,190,216,228,230],$V$=[2,30],$V01=[2,240],$V11=[2,241],$V21=[2,266],$V31=[2,231],$V41=[2,232],$V51=[2,233],$V61=[2,20],$V71=[1,133],$V81=[2,55],$V91=[1,135],$Va1=[2,62],$Vb1=[2,71],$Vc1=[1,141],$Vd1=[1,142],$Ve1=[1,143],$Vf1=[2,67],$Vg1=[2,73],$Vh1=[1,150],$Vi1=[1,151],$Vj1=[1,152],$Vk1=[1,155],$Vl1=[19,21,70,72,86,97,98,99,102,103,104,105,113,114,115,116,117,118,120,126,128,162,190,216,228],$Vm1=[1,158],$Vn1=[1,160],$Vo1=[1,161],$Vp1=[1,162],$Vq1=[2,70],$Vr1=[7,18,19,20,21,23,26,37,52,54,80,81,82,120,126,128,190,191,194,216,217,228],$Vs1=[2,97],$Vt1=[7,18,19,20,21,23,26,37,52,54,191,194,216,217],$Vu1=[7,18,19,20,21,23,26,37,52,54,97,98,99,102,103,104,105,216,217],$Vv1=[2,89],$Vw1=[2,90],$Vx1=[7,18,19,20,21,23,26,37,52,54,80,81,82,102,103,104,105,120,126,128,190,191,194,216,217,228],$Vy1=[2,110],$Vz1=[2,109],$VA1=[7,18,19,20,21,23,26,37,52,54,102,103,104,105,113,114,115,116,117,118,191,194,216,217],$VB1=[2,104],$VC1=[2,103],$VD1=[7,18,19,20,21,23,26,37,52,54,97,98,99,102,103,104,105,191,194,216,217],$VE1=[2,93],$VF1=[2,94],$VG1=[2,114],$VH1=[2,115],$VI1=[2,116],$VJ1=[2,112],$VK1=[2,239],$VL1=[19,21,72,82,101,109,110,164,186,205,206,207,208,209,210,211,212,213,214,216],$VM1=[2,185],$VN1=[7,18,19,20,21,23,26,37,52,54,113,114,115,116,117,118,191,194,216,217],$VO1=[2,106],$VP1=[1,185],$VQ1=[1,187],$VR1=[1,189],$VS1=[1,188],$VT1=[2,120],$VU1=[1,196],$VV1=[1,197],$VW1=[1,198],$VX1=[1,199],$VY1=[101,109,110,207,208,209,210],$VZ1=[1,213],$V_1=[1,212],$V$1=[1,246],$V02=[1,251],$V12=[1,228],$V22=[1,236],$V32=[1,237],$V42=[1,238],$V52=[1,245],$V62=[1,241],$V72=[1,250],$V82=[2,50],$V92=[2,57],$Va2=[2,66],$Vb2=[2,72],$Vc2=[2,68],$Vd2=[2,74],$Ve2=[7,18,19,20,21,23,26,37,52,54,102,103,104,105,191,194,216,217],$Vf2=[1,297],$Vg2=[1,305],$Vh2=[1,306],$Vi2=[1,307],$Vj2=[1,313],$Vk2=[1,314],$Vl2=[52,54],$Vm2=[7,18,19,20,21,23,26,37,52,54,80,81,82,120,126,128,190,194,216,217,228],$Vn2=[2,229],$Vo2=[7,18,19,20,21,23,26,37,52,54,194,216,217],$Vp2=[1,330],$Vq2=[2,108],$Vr2=[2,113],$Vs2=[2,100],$Vt2=[1,336],$Vu2=[2,101],$Vv2=[2,102],$Vw2=[2,107],$Vx2=[7,18,19,20,21,23,26,37,52,54,97,98,99,102,103,104,105,194,216,217],$Vy2=[2,95],$Vz2=[1,353],$VA2=[1,359],$VB2=[1,348],$VC2=[1,352],$VD2=[1,362],$VE2=[1,363],$VF2=[1,364],$VG2=[1,351],$VH2=[1,365],$VI2=[1,366],$VJ2=[1,371],$VK2=[1,372],$VL2=[1,373],$VM2=[1,374],$VN2=[1,367],$VO2=[1,368],$VP2=[1,369],$VQ2=[1,370],$VR2=[1,358],$VS2=[19,21,70,161,200,216],$VT2=[2,169],$VU2=[2,143],$VV2=[1,387],$VW2=[1,386],$VX2=[1,397],$VY2=[1,400],$VZ2=[1,396],$V_2=[1,399],$V$2=[19,21,45,70,72,80,81,82,86,97,98,99,102,103,104,105,113,114,115,116,117,118,120,126,128,162,190,216,228],$V03=[2,119],$V13=[2,124],$V23=[2,126],$V33=[2,127],$V43=[2,128],$V53=[2,254],$V63=[2,255],$V73=[2,256],$V83=[2,257],$V93=[2,125],$Va3=[2,32],$Vb3=[2,33],$Vc3=[2,34],$Vd3=[80,81,82,120,126,128,190,228],$Ve3=[1,432],$Vf3=[1,434],$Vg3=[1,440],$Vh3=[1,441],$Vi3=[1,442],$Vj3=[1,449],$Vk3=[1,450],$Vl3=[1,451],$Vm3=[1,454],$Vn3=[2,43],$Vo3=[1,521],$Vp3=[2,46],$Vq3=[1,557],$Vr3=[2,69],$Vs3=[2,38],$Vt3=[52,54,71],$Vu3=[2,76],$Vv3=[1,586],$Vw3=[2,79],$Vx3=[52,54,71,80,81,82,120,126,128,190,191,194,228],$Vy3=[52,54,71,191,194],$Vz3=[52,54,71,97,98,99,102,103,104,105,191,194],$VA3=[52,54,71,80,81,82,102,103,104,105,120,126,128,190,191,194,228],$VB3=[52,54,71,102,103,104,105,113,114,115,116,117,118,191,194],$VC3=[52,54,71,113,114,115,116,117,118,191,194],$VD3=[2,37],$VE3=[2,41],$VF3=[52,71],$VG3=[2,44],$VH3=[2,47],$VI3=[7,18,19,20,21,23,26,37,52,54,80,81,82,120,126,128,190,216,217,228],$VJ3=[2,99],$VK3=[2,98],$VL3=[2,228],$VM3=[1,628],$VN3=[1,631],$VO3=[1,627],$VP3=[1,630],$VQ3=[2,96],$VR3=[2,111],$VS3=[2,105],$VT3=[2,117],$VU3=[2,118],$VV3=[2,136],$VW3=[2,184],$VX3=[1,661],$VY3=[19,21,72,82,101,109,110,164,179,186,205,206,207,208,209,210,211,212,213,214,216],$VZ3=[2,234],$V_3=[2,235],$V$3=[2,236],$V04=[2,247],$V14=[2,250],$V24=[2,244],$V34=[2,245],$V44=[2,246],$V54=[2,252],$V64=[2,253],$V74=[2,258],$V84=[2,259],$V94=[2,260],$Va4=[2,261],$Vb4=[19,21,72,82,101,109,110,112,164,179,186,205,206,207,208,209,210,211,212,213,214,216],$Vc4=[2,148],$Vd4=[2,149],$Ve4=[1,669],$Vf4=[2,150],$Vg4=[122,136],$Vh4=[2,155],$Vi4=[2,156],$Vj4=[2,158],$Vk4=[1,672],$Vl4=[1,673],$Vm4=[19,21,200,216],$Vn4=[2,177],$Vo4=[1,681],$Vp4=[122,136,141,142],$Vq4=[2,167],$Vr4=[52,120,126,128,190,228],$Vs4=[52,54,120,126,128,190,228],$Vt4=[2,275],$Vu4=[1,714],$Vv4=[1,715],$Vw4=[1,716],$Vx4=[1,726],$Vy4=[19,21,120,126,128,190,200,216,228],$Vz4=[2,237],$VA4=[2,238],$VB4=[2,26],$VC4=[19,21,41,45,70,72,80,81,82,86,97,98,99,102,103,104,105,113,114,115,116,117,118,120,126,128,162,180,190,191,194,216,228,230],$VD4=[1,786],$VE4=[1,792],$VF4=[1,844],$VG4=[1,891],$VH4=[2,35],$VI4=[2,39],$VJ4=[2,75],$VK4=[2,77],$VL4=[52,54,71,102,103,104,105,191,194],$VM4=[52,54,71,80,81,82,120,126,128,190,194,228],$VN4=[52,54,71,194],$VO4=[1,934],$VP4=[52,54,71,97,98,99,102,103,104,105,194],$VQ4=[1,944],$VR4=[2,36],$VS4=[2,45],$VT4=[2,42],$VU4=[2,48],$VV4=[1,981],$VW4=[1,1017],$VX4=[2,230],$VY4=[1,1028],$VZ4=[1,1034],$V_4=[1,1033],$V$4=[19,21,101,109,110,205,206,207,208,209,210,211,212,213,214,216],$V05=[1,1054],$V15=[1,1060],$V25=[1,1059],$V35=[1,1081],$V45=[1,1087],$V55=[1,1086],$V65=[1,1104],$V75=[1,1106],$V85=[1,1108],$V95=[19,21,72,82,101,109,110,164,180,186,205,206,207,208,209,210,211,212,213,214,216],$Va5=[1,1112],$Vb5=[1,1118],$Vc5=[1,1121],$Vd5=[1,1122],$Ve5=[1,1123],$Vf5=[1,1111],$Vg5=[1,1124],$Vh5=[1,1125],$Vi5=[1,1130],$Vj5=[1,1131],$Vk5=[1,1132],$Vl5=[1,1133],$Vm5=[1,1126],$Vn5=[1,1127],$Vo5=[1,1128],$Vp5=[1,1129],$Vq5=[1,1117],$Vr5=[2,248],$Vs5=[2,251],$Vt5=[2,137],$Vu5=[2,151],$Vv5=[2,153],$Vw5=[2,157],$Vx5=[2,159],$Vy5=[2,160],$Vz5=[2,164],$VA5=[2,166],$VB5=[2,171],$VC5=[2,172],$VD5=[1,1148],$VE5=[1,1151],$VF5=[1,1147],$VG5=[1,1150],$VH5=[1,1161],$VI5=[2,224],$VJ5=[2,242],$VK5=[2,243],$VL5=[2,273],$VM5=[2,277],$VN5=[2,279],$VO5=[2,87],$VP5=[1,1182],$VQ5=[2,282],$VR5=[80,81,82,102,103,104,105,120,126,128,190,228],$VS5=[52,54,102,103,104,105,113,114,115,116,117,118,120,126,128,190,228],$VT5=[52,54,97,98,99,102,103,104,105,120,126,128,190,228],$VU5=[2,91],$VV5=[2,92],$VW5=[52,54,113,114,115,116,117,118,120,126,128,190,228],$VX5=[2,129],$VY5=[19,21,41,45,70,72,80,81,82,86,97,98,99,102,103,104,105,113,114,115,116,117,118,120,126,128,162,180,190,194,216,228,230],$VZ5=[1,1243],$V_5=[1,1279],$V$5=[1,1346],$V06=[1,1352],$V16=[1,1384],$V26=[1,1390],$V36=[2,78],$V46=[52,54,71,80,81,82,120,126,128,190,228],$V56=[52,54,71,97,98,99,102,103,104,105],$V66=[1,1448],$V76=[1,1495],$V86=[2,225],$V96=[2,226],$Va6=[2,227],$Vb6=[7,18,19,20,21,23,26,37,52,54,80,81,82,112,120,126,128,190,191,194,216,217,228],$Vc6=[7,18,19,20,21,23,26,37,52,54,112,191,194,216,217],$Vd6=[7,18,19,20,21,23,26,37,52,54,97,98,99,102,103,104,105,112,191,194,216,217],$Ve6=[2,207],$Vf6=[1,1548],$Vg6=[19,21,72,82,101,109,110,164,179,180,186,205,206,207,208,209,210,211,212,213,214,216],$Vh6=[19,21,72,82,101,109,110,112,164,179,180,186,205,206,207,208,209,210,211,212,213,214,216],$Vi6=[2,249],$Vj6=[2,154],$Vk6=[2,152],$Vl6=[2,161],$Vm6=[2,165],$Vn6=[2,162],$Vo6=[2,163],$Vp6=[1,1565],$Vq6=[71,136],$Vr6=[1,1568],$Vs6=[1,1569],$Vt6=[71,136,141,142],$Vu6=[2,276],$Vv6=[2,278],$Vw6=[2,280],$Vx6=[2,88],$Vy6=[52,54,102,103,104,105,120,126,128,190,228],$Vz6=[1,1607],$VA6=[1,1638],$VB6=[1,1685],$VC6=[1,1718],$VD6=[1,1724],$VE6=[1,1723],$VF6=[1,1744],$VG6=[1,1750],$VH6=[1,1749],$VI6=[1,1771],$VJ6=[1,1777],$VK6=[1,1776],$VL6=[1,1823],$VM6=[1,1889],$VN6=[1,1895],$VO6=[1,1894],$VP6=[1,1915],$VQ6=[1,1921],$VR6=[1,1920],$VS6=[1,1941],$VT6=[1,1947],$VU6=[1,1946],$VV6=[1,1988],$VW6=[1,1994],$VX6=[1,2026],$VY6=[1,2032],$VZ6=[122,136,141,142,191,194],$V_6=[2,174],$V$6=[1,2052],$V07=[1,2053],$V17=[1,2054],$V27=[1,2055],$V37=[122,136,141,142,157,158,159,160,191,194],$V47=[2,40],$V57=[52,122,136,141,142,157,158,159,160,191,194],$V67=[2,53],$V77=[52,54,122,136,141,142,157,158,159,160,191,194],$V87=[2,60],$V97=[1,2084],$Va7=[2,274],$Vb7=[2,281],$Vc7=[1,2171],$Vd7=[1,2177],$Ve7=[1,2176],$Vf7=[1,2217],$Vg7=[1,2223],$Vh7=[1,2255],$Vi7=[1,2261],$Vj7=[1,2314],$Vk7=[1,2347],$Vl7=[1,2353],$Vm7=[1,2352],$Vn7=[1,2373],$Vo7=[1,2379],$Vp7=[1,2378],$Vq7=[1,2400],$Vr7=[1,2406],$Vs7=[1,2405],$Vt7=[1,2427],$Vu7=[1,2433],$Vv7=[1,2432],$Vw7=[1,2453],$Vx7=[1,2459],$Vy7=[1,2458],$Vz7=[1,2480],$VA7=[1,2486],$VB7=[1,2485],$VC7=[52,54,71,80,81,82,112,120,126,128,190,191,194,228],$VD7=[52,54,71,112,191,194],$VE7=[52,54,71,97,98,99,102,103,104,105,112,191,194],$VF7=[1,2555],$VG7=[2,175],$VH7=[2,179],$VI7=[2,180],$VJ7=[2,181],$VK7=[2,182],$VL7=[2,51],$VM7=[2,58],$VN7=[2,65],$VO7=[2,85],$VP7=[2,81],$VQ7=[1,2638],$VR7=[2,84],$VS7=[52,54,80,81,82,102,103,104,105,120,122,126,128,136,141,142,157,158,159,160,190,191,194,228],$VT7=[52,54,80,81,82,120,122,126,128,136,141,142,157,158,159,160,190,191,194,228],$VU7=[52,54,102,103,104,105,113,114,115,116,117,118,122,136,141,142,157,158,159,160,191,194],$VV7=[52,54,97,98,99,102,103,104,105,122,136,141,142,157,158,159,160,191,194],$VW7=[52,54,113,114,115,116,117,118,122,136,141,142,157,158,159,160,191,194],$VX7=[1,2688],$VY7=[1,2726],$VZ7=[19,21,41,45,70,72,80,81,82,86,97,98,99,102,103,104,105,112,113,114,115,116,117,118,120,126,128,162,180,190,191,194,216,228,230],$V_7=[1,2785],$V$7=[1,2874],$V08=[1,2880],$V18=[1,2963],$V28=[1,2996],$V38=[1,3002],$V48=[1,3001],$V58=[1,3022],$V68=[1,3028],$V78=[1,3027],$V88=[1,3049],$V98=[1,3055],$Va8=[1,3054],$Vb8=[1,3076],$Vc8=[1,3082],$Vd8=[1,3081],$Ve8=[1,3102],$Vf8=[1,3108],$Vg8=[1,3107],$Vh8=[1,3129],$Vi8=[1,3135],$Vj8=[1,3134],$Vk8=[122,136,141,142,194],$Vl8=[1,3154],$Vm8=[2,54],$Vn8=[2,61],$Vo8=[2,80],$Vp8=[2,86],$Vq8=[2,82],$Vr8=[52,54,102,103,104,105,122,136,141,142,157,158,159,160,191,194],$Vs8=[1,3178],$Vt8=[71,136,141,142,191,194],$Vu8=[1,3187],$Vv8=[1,3188],$Vw8=[1,3189],$Vx8=[1,3190],$Vy8=[71,136,141,142,157,158,159,160,191,194],$Vz8=[52,71,136,141,142,157,158,159,160,191,194],$VA8=[52,54,71,136,141,142,157,158,159,160,191,194],$VB8=[1,3219],$VC8=[1,3246],$VD8=[1,3269],$VE8=[1,3302],$VF8=[1,3335],$VG8=[1,3341],$VH8=[1,3340],$VI8=[1,3361],$VJ8=[1,3367],$VK8=[1,3366],$VL8=[1,3388],$VM8=[1,3394],$VN8=[1,3393],$VO8=[1,3415],$VP8=[1,3421],$VQ8=[1,3420],$VR8=[1,3441],$VS8=[1,3447],$VT8=[1,3446],$VU8=[1,3468],$VV8=[1,3474],$VW8=[1,3473],$VX8=[1,3551],$VY8=[1,3557],$VZ8=[2,176],$V_8=[2,52],$V$8=[1,3645],$V09=[2,59],$V19=[1,3678],$V29=[2,83],$V39=[2,173],$V49=[1,3723],$V59=[52,54,71,80,81,82,102,103,104,105,120,126,128,136,141,142,157,158,159,160,190,191,194,228],$V69=[52,54,71,80,81,82,120,126,128,136,141,142,157,158,159,160,190,191,194,228],$V79=[52,54,71,102,103,104,105,113,114,115,116,117,118,136,141,142,157,158,159,160,191,194],$V89=[52,54,71,97,98,99,102,103,104,105,136,141,142,157,158,159,160,191,194],$V99=[52,54,71,113,114,115,116,117,118,136,141,142,157,158,159,160,191,194],$Va9=[1,3828],$Vb9=[1,3834],$Vc9=[1,3897],$Vd9=[1,3903],$Ve9=[1,3902],$Vf9=[1,3923],$Vg9=[1,3929],$Vh9=[1,3928],$Vi9=[1,3950],$Vj9=[1,3956],$Vk9=[1,3955],$Vl9=[1,4015],$Vm9=[1,4021],$Vn9=[1,4020],$Vo9=[1,4056],$Vp9=[1,4098],$Vq9=[71,136,141,142,194],$Vr9=[1,4128],$Vs9=[52,54,71,102,103,104,105,136,141,142,157,158,159,160,191,194],$Vt9=[1,4152],$Vu9=[1,4175],$Vv9=[1,4269],$Vw9=[1,4275],$Vx9=[1,4274],$Vy9=[1,4295],$Vz9=[1,4301],$VA9=[1,4300],$VB9=[1,4322],$VC9=[1,4328],$VD9=[1,4327],$VE9=[112,122,136,141,142,191,194],$VF9=[1,4370],$VG9=[1,4394],$VH9=[1,4436],$VI9=[1,4469],$VJ9=[1,4509],$VK9=[1,4532],$VL9=[1,4538],$VM9=[1,4537],$VN9=[1,4558],$VO9=[1,4564],$VP9=[1,4563],$VQ9=[1,4585],$VR9=[1,4591],$VS9=[1,4590],$VT9=[1,4665],$VU9=[1,4708],$VV9=[1,4714],$VW9=[1,4713],$VX9=[1,4749],$VY9=[1,4791],$VZ9=[1,4881],$V_9=[71,112,136,141,142,191,194],$V$9=[1,4936],$V0a=[1,4960],$V1a=[1,4998],$V2a=[1,5044],$V3a=[1,5122],$V4a=[1,5171];
        const o = JisonParser.expandParseTable;
        this.table = [o($V0,[2,2],{3:1,4:2}),{1:[3]},o($V0,[2,3],{5:3}),o($V1,$V2,{6:4,8:5,14:6,15:7,16:8,17:9,9:10,10:14,11:15,24:16,25:17,30:18,32:20,31:21,7:[2,10],18:[1,11],20:[1,12],23:[1,13],26:[1,19],194:$V3}),{7:[1,23]},o($V0,[2,4]),{7:[2,11]},o($V0,$V4),o($V0,$V5),o($V0,$V6),o($V7,[2,7],{12:24}),{19:[1,25]},{21:[1,26]},{19:$V8,21:$V9,22:27,215:29,216:$Va},o($V7,[2,5]),o($V7,[2,6]),o($V7,$Vb),o($V7,$Vc),o($V7,[2,21],{31:32,194:$V3}),{27:[1,33]},o($Vd,$Ve,{33:34,37:$Vf}),o($V0,[2,22]),{19:$Vg,21:$Vh,22:36,215:38,216:$Vi},{1:[2,1]},o($V1,$V2,{13:41,8:42,10:43,15:44,16:45,17:46,24:47,25:48,32:53,7:[2,9],18:[1,49],20:[1,50],23:[1,51],26:[1,52]}),o($V0,$Vj),{19:$V8,21:$V9,22:54,215:29,216:$Va},o($V0,$Vk),o($V0,$Vl),o($V0,$Vm),o($V0,$Vn),o($V0,$Vo),o($V0,[2,23]),o($Vp,$Vq,{28:55,55:56,42:57,45:$Vr}),{19:$Vs,21:$Vt,22:60,34:59,201:61,215:63,216:$Vu,217:$Vv},o($Vd,[2,29]),{194:[1,69],195:67,196:[1,68]},o($Vw,$Vl),o($Vw,$Vm),o($Vw,$Vn),o($Vw,$Vo),o($V7,[2,8]),o($V7,[2,24]),o($V7,[2,25]),o($V7,$V4),o($V7,$V5),o($V7,$V6),o($V7,$Vb),o($V7,$Vc),{19:[1,70]},{21:[1,71]},{19:$Vx,21:$Vy,22:72,215:74,216:$Vz},{27:[1,77]},o($Vd,$Ve,{33:78,37:$Vf}),o($V0,$VA),o($VB,$VC,{29:79}),o($VD,$VE,{59:80}),o($VF,$VG,{63:81,65:82,67:83,68:84,74:87,76:88,73:89,40:90,93:91,95:92,88:94,89:95,90:96,79:97,96:104,22:105,92:107,119:108,100:109,215:112,106:113,108:114,19:$VH,21:$VI,70:[1,85],72:[1,86],80:[1,98],81:[1,99],82:[1,100],86:$VJ,97:$VK,98:$VL,99:$VM,102:$VN,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:$VX,216:$VY}),o($Vp,$VZ),o($V_,$V$,{35:126}),o($V_,$V01),o($V_,$V11),o($V_,$Vl),o($V_,$Vm),o($V_,$V21),o($V_,$Vn),o($V_,$Vo),o($V0,$V31),o($V0,$V41),o($V0,$V51),o($V7,$Vj),{19:$Vx,21:$Vy,22:127,215:74,216:$Vz},o($V7,$Vk),o($V7,$Vl),o($V7,$Vm),o($V7,$Vn),o($V7,$Vo),o($Vp,$Vq,{28:128,55:129,42:130,45:$Vr}),{19:$Vs,21:$Vt,22:60,34:131,201:61,215:63,216:$Vu,217:$Vv},o($V7,$V61,{51:132,52:$V71}),o($VB,$V81,{53:134,54:$V91}),o($VD,$Va1),o($VD,$Vb1,{66:136,68:137,73:138,40:139,79:140,119:144,80:$Vc1,81:$Vd1,82:$Ve1,120:$VG,126:$VG,128:$VG,190:$VG,228:$VG}),o($VD,$Vf1),o($VD,$Vg1,{69:145,65:146,74:147,93:148,95:149,96:153,100:154,97:$Vh1,98:$Vi1,99:$Vj1,102:$Vk1,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{39:156,42:157,40:159,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($VD,$Vq1),o($Vr1,$Vs1,{83:163}),o($Vt1,$Vs1,{83:164}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{94:165}),o($Vr1,$Vz1,{100:109,96:166,102:$VN,103:$VO,104:$VP,105:$VQ}),o($VA1,$VB1,{87:167}),o($VA1,$VB1,{87:168}),o($VA1,$VB1,{87:169}),o($Vt1,$VC1,{106:113,108:114,92:170,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VD1,$Vs1,{83:171}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,175],21:[1,179],22:173,34:172,201:174,215:176,216:[1,178],217:[1,177]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{163:180}),o($VN1,$VO1),{120:[1,181],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},{101:[1,190]},o($Vx1,$VT1),o($VA1,$Vl),o($VA1,$Vm),{101:[1,192],107:191,109:[1,193],110:[1,194],111:195,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,200]},{101:[2,121]},{101:[2,122]},{101:[2,123]},o($VA1,$Vn),o($VA1,$Vo),o($VY1,[2,130]),o($VY1,[2,131]),o($VY1,[2,132]),o($VY1,[2,133]),{101:[2,134]},{101:[2,135]},o($Vl1,$Vq,{36:201,38:202,39:203,40:204,229:206,42:207,41:[1,205],45:[1,208],80:[1,209],81:[1,210],82:[1,211],180:$VZ1,230:$V_1}),o($V7,$VA),o($VB,$VC,{29:214}),o($VD,$VE,{59:215}),o($VF,$VG,{63:216,65:217,67:218,68:219,74:222,76:223,73:224,40:225,93:226,95:227,88:229,89:230,90:231,79:232,96:239,22:240,92:242,119:243,100:244,215:247,106:248,108:249,19:$V$1,21:$V02,70:[1,220],72:[1,221],80:[1,233],81:[1,234],82:[1,235],86:$V12,97:$V22,98:$V32,99:$V42,102:$V52,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:$V62,216:$V72}),o($V_,$V$,{35:252}),o($VB,$V82),o($Vp,$Vq,{28:253,55:254,42:255,45:$Vr}),o($VD,$V92),o($Vp,$Vq,{55:256,42:257,45:$Vr}),o($VD,$Va2),o($VD,$Vb2),o($VD,$Vv1),o($VD,$Vw1),o($Vt1,$Vs1,{83:258}),o($VD,$VE1),o($VD,$VF1),{19:[1,262],21:[1,266],22:260,34:259,201:261,215:263,216:[1,265],217:[1,264]},{120:[1,267],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($VD,$Vc2),o($VD,$Vd2),o($Vt1,$Vs1,{83:268}),o($Ve2,$Vy1,{94:269}),o($Vt1,$Vz1,{100:154,96:270,102:$Vk1,103:$VO,104:$VP,105:$VQ}),o($Ve2,$VG1),o($Ve2,$VH1),o($Ve2,$VI1),o($Ve2,$VJ1),{101:[1,271]},o($Ve2,$VT1),{71:[1,272]},o($VF,$VG,{43:273,65:274,67:275,73:276,74:279,76:280,79:281,93:282,95:283,88:285,89:286,90:287,119:288,96:292,22:293,92:295,100:296,215:299,106:300,108:301,19:[1,298],21:[1,303],70:[1,277],72:[1,278],86:[1,284],97:[1,289],98:[1,290],99:[1,291],102:$Vf2,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:[1,294],216:[1,302]}),o($Vl1,$VZ,{40:304,80:$Vg2,81:$Vh2,82:$Vi2}),{46:308,49:309,50:310,51:311,52:$Vj2,53:312,54:$Vk2},o($Vl2,$VE1),o($Vl2,$VF1),{19:[1,318],21:[1,322],22:316,34:315,201:317,215:319,216:[1,321],217:[1,320]},o($Vm2,$Vn2,{84:323,85:324,193:325,191:[1,326]}),o($Vo2,$Vn2,{84:327,85:328,193:329,191:$Vp2}),o($Vr1,$Vq2,{100:109,96:331,102:$VN,103:$VO,104:$VP,105:$VQ}),o($Vx1,$Vr2),o($Vt1,$Vs2,{91:332,96:333,92:334,100:335,106:337,108:338,102:$Vt2,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vt1,$Vu2,{91:332,96:333,92:334,100:335,106:337,108:338,102:$Vt2,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vt1,$Vv2,{91:332,96:333,92:334,100:335,106:337,108:338,102:$Vt2,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VN1,$Vw2),o($Vx2,$Vn2,{84:339,85:340,193:341,191:[1,342]}),o($Vu1,$Vy2),o($Vu1,$V01),o($Vu1,$V11),o($Vu1,$Vl),o($Vu1,$Vm),o($Vu1,$V21),o($Vu1,$Vn),o($Vu1,$Vo),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,343],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VS2,$VT2,{121:375,127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,122:$VU2,149:$VV2,190:$VW2}),o($VF,[2,142]),o($VF,[2,138]),o($VF,[2,139]),o($VF,[2,140]),o($Vp,$Vq,{219:388,220:389,221:390,224:391,42:392,45:$Vr}),{19:$VX2,21:$VY2,22:395,129:393,130:394,200:$VZ2,215:398,216:$V_2},o($V$2,[2,283]),o($V$2,[2,284]),o($Vx1,$V03),o($VN1,$V13),o($VN1,$V23),o($VN1,$V33),o($VN1,$V43),{112:[1,401]},{112:$V53},{112:$V63},{112:$V73},{112:$V83},o($VN1,$V93),o($V7,$V2,{32:402}),o($V_,[2,31]),o($V7,$Va3),o($V7,$Vb3,{46:403,49:404,50:405,51:406,53:407,52:$V71,54:$V91}),o($V7,$Vc3),o($VF,$VG,{68:408,73:409,40:410,79:411,119:415,80:[1,412],81:[1,413],82:[1,414]}),o($VF,$VG,{74:87,76:88,93:91,95:92,88:94,89:95,90:96,79:97,96:104,22:105,92:107,119:108,100:109,215:112,106:113,108:114,43:416,65:417,67:418,73:419,19:$VH,21:$VI,70:[1,420],72:[1,421],86:$VJ,97:$VK,98:$VL,99:$VM,102:$VN,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:$VX,216:$VY}),o($Vl1,$VZ,{40:422,80:$Vc1,81:$Vd1,82:$Ve1}),o($VD,$VE1),o($VD,$VF1),{19:[1,426],21:[1,430],22:424,34:423,201:425,215:427,216:[1,429],217:[1,428]},o($Vd3,[2,286]),o($Vd3,[2,287]),o($V7,$V61,{51:431,52:$Ve3}),o($VB,$V81,{53:433,54:$Vf3}),o($VD,$Va1),o($VD,$Vb1,{66:435,68:436,73:437,40:438,79:439,119:443,80:$Vg3,81:$Vh3,82:$Vi3,120:$VG,126:$VG,128:$VG,190:$VG,228:$VG}),o($VD,$Vf1),o($VD,$Vg1,{69:444,65:445,74:446,93:447,95:448,96:452,100:453,97:$Vj3,98:$Vk3,99:$Vl3,102:$Vm3,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:455,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($VD,$Vq1),o($Vr1,$Vs1,{83:456}),o($Vt1,$Vs1,{83:457}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{94:458}),o($Vr1,$Vz1,{100:244,96:459,102:$V52,103:$VO,104:$VP,105:$VQ}),o($VA1,$VB1,{87:460}),o($VA1,$VB1,{87:461}),o($VA1,$VB1,{87:462}),o($Vt1,$VC1,{106:248,108:249,92:463,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VD1,$Vs1,{83:464}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,468],21:[1,472],22:466,34:465,201:467,215:469,216:[1,471],217:[1,470]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{163:473}),o($VN1,$VO1),{120:[1,474],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},{101:[1,475]},o($Vx1,$VT1),o($VA1,$Vl),o($VA1,$Vm),{101:[1,477],107:476,109:[1,478],110:[1,479],111:480,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,481]},o($VA1,$Vn),o($VA1,$Vo),o($Vl1,$Vq,{38:202,229:206,36:482,39:483,40:484,42:486,41:[1,485],45:[1,487],80:[1,488],81:[1,489],82:[1,490],180:$VZ1,230:$V_1}),o($VB,$Vn3),o($VD,$VE,{59:491}),o($VF,$VG,{63:492,65:493,67:494,68:495,74:498,76:499,73:500,40:501,93:502,95:503,88:505,89:506,90:507,79:508,96:515,22:516,92:518,119:519,100:520,215:523,106:524,108:525,19:[1,522],21:[1,527],70:[1,496],72:[1,497],80:[1,509],81:[1,510],82:[1,511],86:[1,504],97:[1,512],98:[1,513],99:[1,514],102:$Vo3,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:[1,517],216:[1,526]}),o($VD,$Vp3),o($VF,$VG,{63:528,65:529,67:530,68:531,74:534,76:535,73:536,40:537,93:538,95:539,88:541,89:542,90:543,79:544,96:551,22:552,92:554,119:555,100:556,215:559,106:560,108:561,19:[1,558],21:[1,563],70:[1,532],72:[1,533],80:[1,545],81:[1,546],82:[1,547],86:[1,540],97:[1,548],98:[1,549],99:[1,550],102:$Vq3,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:[1,553],216:[1,562]}),o($Vo2,$Vn2,{85:328,193:329,84:564,191:$Vp2}),o($VD,$Vy2),o($VD,$V01),o($VD,$V11),o($VD,$Vl),o($VD,$Vm),o($VD,$V21),o($VD,$Vn),o($VD,$Vo),o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:565,122:$VU2,149:$VV2,190:$VW2}),o($Vo2,$Vn2,{85:328,193:329,84:566,191:$Vp2}),o($Vt1,$Vq2,{100:154,96:567,102:$Vk1,103:$VO,104:$VP,105:$VQ}),o($Ve2,$Vr2),o($Ve2,$V03),o($VD,$Vr3),{44:568,46:569,49:309,50:310,51:311,52:$Vj2,53:312,54:$Vk2,71:$Vs3},o($VF,$VG,{66:570,68:571,73:572,40:573,79:574,119:575,52:$Vb1,54:$Vb1,71:$Vb1,80:$Vg2,81:$Vh2,82:$Vi2}),o($Vt3,$Vu3),o($Vt3,$Vg1,{69:576,65:577,74:578,93:579,95:580,96:584,100:585,97:[1,581],98:[1,582],99:[1,583],102:$Vv3,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:587,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($Vt3,$Vw3),o($Vx3,$Vs1,{83:588}),o($Vy3,$Vs1,{83:589}),o($Vz3,$Vs1,{83:590}),o($VA3,$Vy1,{94:591}),o($Vx3,$Vz1,{100:296,96:592,102:$Vf2,103:$VO,104:$VP,105:$VQ}),o($VB3,$VB1,{87:593}),o($VB3,$VB1,{87:594}),o($VB3,$VB1,{87:595}),o($Vy3,$VC1,{106:300,108:301,92:596,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),{120:[1,597],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($VA3,$VG1),o($VA3,$VH1),o($VA3,$VI1),o($VA3,$VJ1),o($VB3,$VK1),o($VL1,$VM1,{163:598}),o($VC3,$VO1),{101:[1,599]},o($VA3,$VT1),o($VB3,$Vl),o($VB3,$Vm),{101:[1,601],107:600,109:[1,602],110:[1,603],111:604,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,605]},o($VB3,$Vn),o($VB3,$Vo),{44:606,46:569,49:309,50:310,51:311,52:$Vj2,53:312,54:$Vk2,71:$Vs3},o($Vt3,$VE1),o($Vt3,$VF1),{19:[1,610],21:[1,614],22:608,34:607,201:609,215:611,216:[1,613],217:[1,612]},{71:$VD3},{51:615,52:$Vj2,71:$VE3},o($VF3,$VC,{29:616,53:617,54:$Vk2}),o($VF3,$VG3),o($Vt3,$VH3),o($Vp,$Vq,{28:618,55:619,42:620,45:$Vr}),o($Vp,$Vq,{55:621,42:622,45:$Vr}),o($Vl2,$Vy2),o($Vl2,$V01),o($Vl2,$V11),o($Vl2,$Vl),o($Vl2,$Vm),o($Vl2,$V21),o($Vl2,$Vn),o($Vl2,$Vo),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:623,194:[1,624]}),{19:$VM3,21:$VN3,22:626,130:625,200:$VO3,215:629,216:$VP3},o($VD,$VQ3),o($Vt1,$VK3),o($VD,$VL3,{31:632,194:[1,633]}),{19:$VM3,21:$VN3,22:626,130:634,200:$VO3,215:629,216:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{101:[1,635]},o($VA1,$VT1),{101:[1,637],107:636,109:[1,638],110:[1,639],111:640,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,641]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:642,194:[1,643]}),{19:$VM3,21:$VN3,22:626,130:644,200:$VO3,215:629,216:$VP3},o($VA1,$VW3),o($VL1,[2,186]),o($VL1,[2,187]),o($VL1,[2,188]),o($VL1,[2,189]),{169:645,170:646,171:649,172:647,173:650,174:648,175:651,180:[1,652]},o($VL1,[2,204],{176:653,178:654,179:[1,655]}),o($VL1,[2,213],{183:656,185:657,179:[1,658]}),o($VL1,[2,221],{187:659,188:660,179:$VX3}),{179:$VX3,188:662},o($VY3,$Vl),o($VY3,$Vm),o($VY3,$VZ3),o($VY3,$V_3),o($VY3,$V$3),o($VY3,$Vn),o($VY3,$Vo),o($VY3,$V04),o($VY3,$V14,{203:663,204:664,112:[1,665]}),o($VY3,$V24),o($VY3,$V34),o($VY3,$V44),o($VY3,$V54),o($VY3,$V64),o($VY3,$V74),o($VY3,$V84),o($VY3,$V94),o($VY3,$Va4),o($Vb4,$V53),o($Vb4,$V63),o($Vb4,$V73),o($Vb4,$V83),{122:[1,666]},{122:[2,144]},{122:$Vc4},{122:$Vd4,134:667,135:668,136:$Ve4},{122:$Vf4},o($Vg4,$Vh4),o($Vg4,$Vi4),o($Vg4,$Vj4,{140:670,143:671,144:674,141:$Vk4,142:$Vl4}),o($Vm4,$Vn4,{146:675,151:676,152:677,155:678,156:680,70:[1,679],161:$Vo4}),o($Vp4,$Vq4),o($VS2,[2,170]),{19:[1,685],21:[1,689],22:683,150:682,201:684,215:686,216:[1,688],217:[1,687]},{19:[1,693],21:[1,697],22:691,150:690,201:692,215:694,216:[1,696],217:[1,695]},o($VF,[2,267]),o($VF,[2,268]),o($Vr4,[2,271],{222:698}),o($Vs4,$Vt4,{225:699}),o($VF,$VG,{227:700,74:701,76:702,77:703,93:706,95:707,88:709,89:710,90:711,79:712,40:713,96:717,22:718,92:720,119:721,100:725,215:728,106:729,108:730,19:[1,727],21:[1,732],70:[1,704],72:[1,705],80:[1,722],81:[1,723],82:[1,724],86:[1,708],97:$Vu4,98:$Vv4,99:$Vw4,102:$Vx4,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:[1,719],216:[1,731]}),o($VF,[2,145],{22:395,215:398,130:733,19:$VX2,21:$VY2,200:$VZ2,216:$V_2}),o($Vy4,[2,146]),o($Vy4,$Vz4),o($Vy4,$VA4),o($Vy4,$Vl),o($Vy4,$Vm),o($Vy4,$Vn),o($Vy4,$Vo),{19:[1,736],21:[1,739],22:735,88:734,215:737,216:[1,738]},o($V7,$VB4),o($V7,$VD3),o($V7,$VE3,{51:740,52:$V71}),o($VB,$VC,{29:741,53:742,54:$V91}),o($VB,$VG3),o($VD,$VH3),o($V_,[2,285]),o($V_,$Vv1),o($V_,$Vw1),o($VC4,$Vs1,{83:743}),o($V_,$VE1),o($V_,$VF1),{19:[1,747],21:[1,751],22:745,34:744,201:746,215:748,216:[1,750],217:[1,749]},{120:[1,752],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($V7,$Vs3,{49:404,50:405,51:406,53:407,44:753,46:754,52:$V71,54:$V91}),o($VD,$Vb1,{68:137,73:138,40:139,79:140,119:144,66:755,80:$Vc1,81:$Vd1,82:$Ve1,120:$VG,126:$VG,128:$VG,190:$VG,228:$VG}),o($VD,$Vu3),o($VD,$Vg1,{65:146,74:147,93:148,95:149,96:153,100:154,69:756,97:$Vh1,98:$Vi1,99:$Vj1,102:$Vk1,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:757,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($VD,$Vw3),o($V7,$Vs3,{49:404,50:405,51:406,53:407,46:754,44:758,52:$V71,54:$V91}),o($VD,$Vy2),o($VD,$V01),o($VD,$V11),o($VD,$Vl),o($VD,$Vm),o($VD,$V21),o($VD,$Vn),o($VD,$Vo),o($VB,$V82),o($Vp,$Vq,{28:759,55:760,42:761,45:$Vr}),o($VD,$V92),o($Vp,$Vq,{55:762,42:763,45:$Vr}),o($VD,$Va2),o($VD,$Vb2),o($VD,$Vv1),o($VD,$Vw1),o($Vt1,$Vs1,{83:764}),o($VD,$VE1),o($VD,$VF1),{19:[1,768],21:[1,772],22:766,34:765,201:767,215:769,216:[1,771],217:[1,770]},{120:[1,773],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($VD,$Vc2),o($VD,$Vd2),o($Vt1,$Vs1,{83:774}),o($Ve2,$Vy1,{94:775}),o($Vt1,$Vz1,{100:453,96:776,102:$Vm3,103:$VO,104:$VP,105:$VQ}),o($Ve2,$VG1),o($Ve2,$VH1),o($Ve2,$VI1),o($Ve2,$VJ1),{101:[1,777]},o($Ve2,$VT1),{71:[1,778]},o($Vm2,$Vn2,{84:779,85:780,193:781,191:[1,782]}),o($Vo2,$Vn2,{84:783,85:784,193:785,191:$VD4}),o($Vr1,$Vq2,{100:244,96:787,102:$V52,103:$VO,104:$VP,105:$VQ}),o($Vx1,$Vr2),o($Vt1,$Vs2,{91:788,96:789,92:790,100:791,106:793,108:794,102:$VE4,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vt1,$Vu2,{91:788,96:789,92:790,100:791,106:793,108:794,102:$VE4,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vt1,$Vv2,{91:788,96:789,92:790,100:791,106:793,108:794,102:$VE4,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VN1,$Vw2),o($Vx2,$Vn2,{84:795,85:796,193:797,191:[1,798]}),o($Vu1,$Vy2),o($Vu1,$V01),o($Vu1,$V11),o($Vu1,$Vl),o($Vu1,$Vm),o($Vu1,$V21),o($Vu1,$Vn),o($Vu1,$Vo),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,799],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:800,122:$VU2,149:$VV2,190:$VW2}),o($Vx1,$V03),o($VN1,$V13),o($VN1,$V23),o($VN1,$V33),o($VN1,$V43),{112:[1,801]},o($VN1,$V93),o($V7,$V2,{32:802}),o($V7,$Va3),o($V7,$Vb3,{46:803,49:804,50:805,51:806,53:807,52:$Ve3,54:$Vf3}),o($V7,$Vc3),o($VF,$VG,{74:222,76:223,93:226,95:227,88:229,89:230,90:231,79:232,96:239,22:240,92:242,119:243,100:244,215:247,106:248,108:249,43:808,65:809,67:810,73:811,19:$V$1,21:$V02,70:[1,812],72:[1,813],86:$V12,97:$V22,98:$V32,99:$V42,102:$V52,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:$V62,216:$V72}),o($Vl1,$VZ,{40:814,80:$Vg3,81:$Vh3,82:$Vi3}),o($VD,$VE1),o($VD,$VF1),{19:[1,818],21:[1,822],22:816,34:815,201:817,215:819,216:[1,821],217:[1,820]},o($VB,$V81,{53:823,54:[1,824]}),o($VD,$Va1),o($VD,$Vb1,{66:825,68:826,73:827,40:828,79:829,119:833,80:[1,830],81:[1,831],82:[1,832],120:$VG,126:$VG,128:$VG,190:$VG,228:$VG}),o($VD,$Vf1),o($VD,$Vg1,{69:834,65:835,74:836,93:837,95:838,96:842,100:843,97:[1,839],98:[1,840],99:[1,841],102:$VF4,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:845,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($VD,$Vq1),o($Vr1,$Vs1,{83:846}),o($Vt1,$Vs1,{83:847}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{94:848}),o($Vr1,$Vz1,{100:520,96:849,102:$Vo3,103:$VO,104:$VP,105:$VQ}),o($VA1,$VB1,{87:850}),o($VA1,$VB1,{87:851}),o($VA1,$VB1,{87:852}),o($Vt1,$VC1,{106:524,108:525,92:853,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VD1,$Vs1,{83:854}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,858],21:[1,862],22:856,34:855,201:857,215:859,216:[1,861],217:[1,860]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{163:863}),o($VN1,$VO1),{120:[1,864],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},{101:[1,865]},o($Vx1,$VT1),o($VA1,$Vl),o($VA1,$Vm),{101:[1,867],107:866,109:[1,868],110:[1,869],111:870,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,871]},o($VA1,$Vn),o($VA1,$Vo),o($VD,$Va1),o($VD,$Vb1,{66:872,68:873,73:874,40:875,79:876,119:880,80:[1,877],81:[1,878],82:[1,879],120:$VG,126:$VG,128:$VG,190:$VG,228:$VG}),o($VD,$Vf1),o($VD,$Vg1,{69:881,65:882,74:883,93:884,95:885,96:889,100:890,97:[1,886],98:[1,887],99:[1,888],102:$VG4,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:892,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($VD,$Vq1),o($Vr1,$Vs1,{83:893}),o($Vt1,$Vs1,{83:894}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{94:895}),o($Vr1,$Vz1,{100:556,96:896,102:$Vq3,103:$VO,104:$VP,105:$VQ}),o($VA1,$VB1,{87:897}),o($VA1,$VB1,{87:898}),o($VA1,$VB1,{87:899}),o($Vt1,$VC1,{106:560,108:561,92:900,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VD1,$Vs1,{83:901}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,905],21:[1,909],22:903,34:902,201:904,215:906,216:[1,908],217:[1,907]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{163:910}),o($VN1,$VO1),{120:[1,911],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},{101:[1,912]},o($Vx1,$VT1),o($VA1,$Vl),o($VA1,$Vm),{101:[1,914],107:913,109:[1,915],110:[1,916],111:917,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,918]},o($VA1,$Vn),o($VA1,$Vo),o($VD,$VV3),{122:[1,919]},o($VD,$VJ3),o($Ve2,$VR3),{71:$VH4},{71:$VI4},o($Vt3,$VJ4),o($Vt3,$Vb2),o($Vt3,$Vv1),o($Vt3,$Vw1),o($Vy3,$Vs1,{83:920}),{120:[1,921],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($Vt3,$VK4),o($Vt3,$Vd2),o($Vy3,$Vs1,{83:922}),o($VL4,$Vy1,{94:923}),o($Vy3,$Vz1,{100:585,96:924,102:$Vv3,103:$VO,104:$VP,105:$VQ}),o($VL4,$VG1),o($VL4,$VH1),o($VL4,$VI1),o($VL4,$VJ1),{101:[1,925]},o($VL4,$VT1),{71:[1,926]},o($VM4,$Vn2,{84:927,85:928,193:929,191:[1,930]}),o($VN4,$Vn2,{84:931,85:932,193:933,191:$VO4}),o($VP4,$Vn2,{84:935,85:936,193:937,191:[1,938]}),o($Vx3,$Vq2,{100:296,96:939,102:$Vf2,103:$VO,104:$VP,105:$VQ}),o($VA3,$Vr2),o($Vy3,$Vs2,{91:940,96:941,92:942,100:943,106:945,108:946,102:$VQ4,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vy3,$Vu2,{91:940,96:941,92:942,100:943,106:945,108:946,102:$VQ4,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vy3,$Vv2,{91:940,96:941,92:942,100:943,106:945,108:946,102:$VQ4,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VC3,$Vw2),o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:947,122:$VU2,149:$VV2,190:$VW2}),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,948],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VA3,$V03),o($VC3,$V13),o($VC3,$V23),o($VC3,$V33),o($VC3,$V43),{112:[1,949]},o($VC3,$V93),{71:$VR4},o($Vt3,$Vy2),o($Vt3,$V01),o($Vt3,$V11),o($Vt3,$Vl),o($Vt3,$Vm),o($Vt3,$V21),o($Vt3,$Vn),o($Vt3,$Vo),o($VF3,$VS4),{51:950,52:$Vj2,71:$VT4},o($Vt3,$VU4),o($VF3,$Vn3),o($Vt3,$VE,{59:951}),o($VF,$VG,{63:952,65:953,67:954,68:955,74:958,76:959,73:960,40:961,93:962,95:963,88:965,89:966,90:967,79:968,96:975,22:976,92:978,119:979,100:980,215:983,106:984,108:985,19:[1,982],21:[1,987],70:[1,956],72:[1,957],80:[1,969],81:[1,970],82:[1,971],86:[1,964],97:[1,972],98:[1,973],99:[1,974],102:$VV4,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:[1,977],216:[1,986]}),o($Vt3,$Vp3),o($VF,$VG,{63:988,65:989,67:990,68:991,74:994,76:995,73:996,40:997,93:998,95:999,88:1001,89:1002,90:1003,79:1004,96:1011,22:1012,92:1014,119:1015,100:1016,215:1019,106:1020,108:1021,19:[1,1018],21:[1,1023],70:[1,992],72:[1,993],80:[1,1005],81:[1,1006],82:[1,1007],86:[1,1000],97:[1,1008],98:[1,1009],99:[1,1010],102:$VW4,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:[1,1013],216:[1,1022]}),o($Vm2,$VX4),{19:$Vg,21:$Vh,22:1024,215:38,216:$Vi},{19:$VY4,21:$VZ4,22:1026,101:[1,1037],109:[1,1038],110:[1,1039],111:1036,182:1027,192:1025,197:1030,198:1031,199:1032,202:1035,205:[1,1040],206:[1,1041],207:[1,1046],208:[1,1047],209:[1,1048],210:[1,1049],211:[1,1042],212:[1,1043],213:[1,1044],214:[1,1045],215:1029,216:$V_4},o($V$4,$Vz4),o($V$4,$VA4),o($V$4,$Vl),o($V$4,$Vm),o($V$4,$Vn),o($V$4,$Vo),o($Vo2,$VX4),{19:$Vg,21:$Vh,22:1050,215:38,216:$Vi},{19:$V05,21:$V15,22:1052,101:[1,1063],109:[1,1064],110:[1,1065],111:1062,182:1053,192:1051,197:1056,198:1057,199:1058,202:1061,205:[1,1066],206:[1,1067],207:[1,1072],208:[1,1073],209:[1,1074],210:[1,1075],211:[1,1068],212:[1,1069],213:[1,1070],214:[1,1071],215:1055,216:$V25},o($VA1,$V03),o($VA1,$V13),o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),{112:[1,1076]},o($VA1,$V93),o($Vx2,$VX4),{19:$Vg,21:$Vh,22:1077,215:38,216:$Vi},{19:$V35,21:$V45,22:1079,101:[1,1090],109:[1,1091],110:[1,1092],111:1089,182:1080,192:1078,197:1083,198:1084,199:1085,202:1088,205:[1,1093],206:[1,1094],207:[1,1099],208:[1,1100],209:[1,1101],210:[1,1102],211:[1,1095],212:[1,1096],213:[1,1097],214:[1,1098],215:1082,216:$V55},o($VL1,[2,190]),o($VL1,[2,197],{171:1103,180:$V65}),o($VL1,[2,198],{173:1105,180:$V75}),o($VL1,[2,199],{175:1107,180:$V85}),o($V95,[2,191]),o($V95,[2,193]),o($V95,[2,195]),{19:$Va5,21:$Vb5,22:1109,101:$Vc5,109:$Vd5,110:$Ve5,111:1120,182:1110,186:$Vf5,197:1114,198:1115,199:1116,202:1119,205:$Vg5,206:$Vh5,207:$Vi5,208:$Vj5,209:$Vk5,210:$Vl5,211:$Vm5,212:$Vn5,213:$Vo5,214:$Vp5,215:1113,216:$Vq5},o($VL1,[2,200]),o($VL1,[2,205]),o($V95,[2,201],{177:1134}),o($VL1,[2,209]),o($VL1,[2,214]),o($V95,[2,210],{184:1135}),o($VL1,[2,216]),o($VL1,[2,222]),o($V95,[2,218],{189:1136}),o($VL1,[2,217]),o($VY3,$Vr5),o($VY3,$Vs5),{19:$Vz2,21:$VA2,22:1138,88:1137,215:354,216:$VR2},o($VD1,$Vt5),{122:$Vu5,135:1139,136:$Ve4},o($Vg4,$Vv5),o($VS2,$VT2,{137:380,138:381,139:382,145:383,147:384,148:385,132:1140,149:$VV2,190:$VW2}),o($Vg4,$Vw5),o($Vg4,$Vj4,{140:1141,144:1142,141:$Vk4,142:$Vl4}),o($VS2,$VT2,{145:383,147:384,148:385,139:1143,122:$Vx5,136:$Vx5,149:$VV2,190:$VW2}),o($VS2,$VT2,{145:383,147:384,148:385,139:1144,122:$Vy5,136:$Vy5,149:$VV2,190:$VW2}),o($Vp4,$Vz5),o($Vp4,$VA5),o($Vp4,$VB5),o($Vp4,$VC5),{19:$VD5,21:$VE5,22:1146,130:1145,200:$VF5,215:1149,216:$VG5},o($VS2,$VT2,{148:385,127:1152,131:1153,132:1154,133:1155,137:1156,138:1157,139:1158,145:1159,147:1160,149:$VV2,190:$VH5}),o($Vm4,[2,178]),o($Vm4,[2,183]),o($Vp4,$VI5),o($Vp4,$VJ5),o($Vp4,$VK5),o($Vp4,$Vl),o($Vp4,$Vm),o($Vp4,$V21),o($Vp4,$Vn),o($Vp4,$Vo),o($VS2,[2,168]),o($VS2,$VJ5),o($VS2,$VK5),o($VS2,$Vl),o($VS2,$Vm),o($VS2,$V21),o($VS2,$Vn),o($VS2,$Vo),o($VF,[2,269],{223:1162,52:[1,1163]}),o($Vr4,$VL5,{226:1164,54:[1,1165]}),o($Vs4,$VM5),o($VF,$VG,{77:1166,79:1167,40:1168,119:1169,80:[1,1170],81:[1,1171],82:[1,1172]}),o($Vs4,$VN5),o($Vs4,$VO5,{78:1173,74:1174,93:1175,95:1176,96:1180,100:1181,97:[1,1177],98:[1,1178],99:[1,1179],102:$VP5,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:1183,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($Vs4,$VQ5),o($VR5,$Vy1,{94:1184}),o($Vd3,$Vz1,{100:725,96:1185,102:$Vx4,103:$VO,104:$VP,105:$VQ}),o($VS5,$VB1,{87:1186}),o($VS5,$VB1,{87:1187}),o($VS5,$VB1,{87:1188}),o($Vs4,$VC1,{106:729,108:730,92:1189,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VT5,$VU5),o($VT5,$VV5),o($VR5,$VG1),o($VR5,$VH1),o($VR5,$VI1),o($VR5,$VJ1),o($VS5,$VK1),o($VL1,$VM1,{163:1190}),o($VW5,$VO1),{120:[1,1191],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($VT5,$VE1),o($VT5,$VF1),{19:[1,1195],21:[1,1199],22:1193,34:1192,201:1194,215:1196,216:[1,1198],217:[1,1197]},{101:[1,1200]},o($VR5,$VT1),o($VS5,$Vl),o($VS5,$Vm),{101:[1,1202],107:1201,109:[1,1203],110:[1,1204],111:1205,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,1206]},o($VS5,$Vn),o($VS5,$Vo),o($Vy4,[2,147]),o($VN1,$VX5),o($VN1,$VK1),o($VN1,$Vl),o($VN1,$Vm),o($VN1,$Vn),o($VN1,$Vo),o($VB,$VS4),o($V7,$VT4,{51:132,52:$V71}),o($VD,$VU4),o($VY5,$Vn2,{84:1207,85:1208,193:1209,191:[1,1210]}),o($V_,$Vy2),o($V_,$V01),o($V_,$V11),o($V_,$Vl),o($V_,$Vm),o($V_,$V21),o($V_,$Vn),o($V_,$Vo),o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:1211,122:$VU2,149:$VV2,190:$VW2}),o($V7,$VH4),o($V7,$VI4),o($VD,$VJ4),o($VD,$VK4),{71:[1,1212]},o($V7,$VR4),o($VB,$Vn3),o($VD,$VE,{59:1213}),o($VF,$VG,{63:1214,65:1215,67:1216,68:1217,74:1220,76:1221,73:1222,40:1223,93:1224,95:1225,88:1227,89:1228,90:1229,79:1230,96:1237,22:1238,92:1240,119:1241,100:1242,215:1245,106:1246,108:1247,19:[1,1244],21:[1,1249],70:[1,1218],72:[1,1219],80:[1,1231],81:[1,1232],82:[1,1233],86:[1,1226],97:[1,1234],98:[1,1235],99:[1,1236],102:$VZ5,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:[1,1239],216:[1,1248]}),o($VD,$Vp3),o($VF,$VG,{63:1250,65:1251,67:1252,68:1253,74:1256,76:1257,73:1258,40:1259,93:1260,95:1261,88:1263,89:1264,90:1265,79:1266,96:1273,22:1274,92:1276,119:1277,100:1278,215:1281,106:1282,108:1283,19:[1,1280],21:[1,1285],70:[1,1254],72:[1,1255],80:[1,1267],81:[1,1268],82:[1,1269],86:[1,1262],97:[1,1270],98:[1,1271],99:[1,1272],102:$V_5,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:[1,1275],216:[1,1284]}),o($Vo2,$Vn2,{85:784,193:785,84:1286,191:$VD4}),o($VD,$Vy2),o($VD,$V01),o($VD,$V11),o($VD,$Vl),o($VD,$Vm),o($VD,$V21),o($VD,$Vn),o($VD,$Vo),o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:1287,122:$VU2,149:$VV2,190:$VW2}),o($Vo2,$Vn2,{85:784,193:785,84:1288,191:$VD4}),o($Vt1,$Vq2,{100:453,96:1289,102:$Vm3,103:$VO,104:$VP,105:$VQ}),o($Ve2,$Vr2),o($Ve2,$V03),o($VD,$Vr3),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:1290,194:[1,1291]}),{19:$VM3,21:$VN3,22:626,130:1292,200:$VO3,215:629,216:$VP3},o($VD,$VQ3),o($Vt1,$VK3),o($VD,$VL3,{31:1293,194:[1,1294]}),{19:$VM3,21:$VN3,22:626,130:1295,200:$VO3,215:629,216:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{101:[1,1296]},o($VA1,$VT1),{101:[1,1298],107:1297,109:[1,1299],110:[1,1300],111:1301,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,1302]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:1303,194:[1,1304]}),{19:$VM3,21:$VN3,22:626,130:1305,200:$VO3,215:629,216:$VP3},o($VA1,$VW3),{122:[1,1306]},{19:[1,1309],21:[1,1312],22:1308,88:1307,215:1310,216:[1,1311]},o($V7,$VB4),o($V7,$VD3),o($V7,$VE3,{51:1313,52:$Ve3}),o($VB,$VC,{29:1314,53:1315,54:$Vf3}),o($VB,$VG3),o($VD,$VH3),o($V7,$Vs3,{49:804,50:805,51:806,53:807,44:1316,46:1317,52:$Ve3,54:$Vf3}),o($VD,$Vb1,{68:436,73:437,40:438,79:439,119:443,66:1318,80:$Vg3,81:$Vh3,82:$Vi3,120:$VG,126:$VG,128:$VG,190:$VG,228:$VG}),o($VD,$Vu3),o($VD,$Vg1,{65:445,74:446,93:447,95:448,96:452,100:453,69:1319,97:$Vj3,98:$Vk3,99:$Vl3,102:$Vm3,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:1320,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($VD,$Vw3),o($V7,$Vs3,{49:804,50:805,51:806,53:807,46:1317,44:1321,52:$Ve3,54:$Vf3}),o($VD,$Vy2),o($VD,$V01),o($VD,$V11),o($VD,$Vl),o($VD,$Vm),o($VD,$V21),o($VD,$Vn),o($VD,$Vo),o($VD,$V92),o($Vp,$Vq,{55:1322,42:1323,45:$Vr}),o($VD,$Va2),o($VD,$Vb2),o($VD,$Vv1),o($VD,$Vw1),o($Vt1,$Vs1,{83:1324}),o($VD,$VE1),o($VD,$VF1),{19:[1,1328],21:[1,1332],22:1326,34:1325,201:1327,215:1329,216:[1,1331],217:[1,1330]},{120:[1,1333],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($VD,$Vc2),o($VD,$Vd2),o($Vt1,$Vs1,{83:1334}),o($Ve2,$Vy1,{94:1335}),o($Vt1,$Vz1,{100:843,96:1336,102:$VF4,103:$VO,104:$VP,105:$VQ}),o($Ve2,$VG1),o($Ve2,$VH1),o($Ve2,$VI1),o($Ve2,$VJ1),{101:[1,1337]},o($Ve2,$VT1),{71:[1,1338]},o($Vm2,$Vn2,{84:1339,85:1340,193:1341,191:[1,1342]}),o($Vo2,$Vn2,{84:1343,85:1344,193:1345,191:$V$5}),o($Vr1,$Vq2,{100:520,96:1347,102:$Vo3,103:$VO,104:$VP,105:$VQ}),o($Vx1,$Vr2),o($Vt1,$Vs2,{91:1348,96:1349,92:1350,100:1351,106:1353,108:1354,102:$V06,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vt1,$Vu2,{91:1348,96:1349,92:1350,100:1351,106:1353,108:1354,102:$V06,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vt1,$Vv2,{91:1348,96:1349,92:1350,100:1351,106:1353,108:1354,102:$V06,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VN1,$Vw2),o($Vx2,$Vn2,{84:1355,85:1356,193:1357,191:[1,1358]}),o($Vu1,$Vy2),o($Vu1,$V01),o($Vu1,$V11),o($Vu1,$Vl),o($Vu1,$Vm),o($Vu1,$V21),o($Vu1,$Vn),o($Vu1,$Vo),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,1359],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:1360,122:$VU2,149:$VV2,190:$VW2}),o($Vx1,$V03),o($VN1,$V13),o($VN1,$V23),o($VN1,$V33),o($VN1,$V43),{112:[1,1361]},o($VN1,$V93),o($VD,$Va2),o($VD,$Vb2),o($VD,$Vv1),o($VD,$Vw1),o($Vt1,$Vs1,{83:1362}),o($VD,$VE1),o($VD,$VF1),{19:[1,1366],21:[1,1370],22:1364,34:1363,201:1365,215:1367,216:[1,1369],217:[1,1368]},{120:[1,1371],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($VD,$Vc2),o($VD,$Vd2),o($Vt1,$Vs1,{83:1372}),o($Ve2,$Vy1,{94:1373}),o($Vt1,$Vz1,{100:890,96:1374,102:$VG4,103:$VO,104:$VP,105:$VQ}),o($Ve2,$VG1),o($Ve2,$VH1),o($Ve2,$VI1),o($Ve2,$VJ1),{101:[1,1375]},o($Ve2,$VT1),{71:[1,1376]},o($Vm2,$Vn2,{84:1377,85:1378,193:1379,191:[1,1380]}),o($Vo2,$Vn2,{84:1381,85:1382,193:1383,191:$V16}),o($Vr1,$Vq2,{100:556,96:1385,102:$Vq3,103:$VO,104:$VP,105:$VQ}),o($Vx1,$Vr2),o($Vt1,$Vs2,{91:1386,96:1387,92:1388,100:1389,106:1391,108:1392,102:$V26,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vt1,$Vu2,{91:1386,96:1387,92:1388,100:1389,106:1391,108:1392,102:$V26,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vt1,$Vv2,{91:1386,96:1387,92:1388,100:1389,106:1391,108:1392,102:$V26,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VN1,$Vw2),o($Vx2,$Vn2,{84:1393,85:1394,193:1395,191:[1,1396]}),o($Vu1,$Vy2),o($Vu1,$V01),o($Vu1,$V11),o($Vu1,$Vl),o($Vu1,$Vm),o($Vu1,$V21),o($Vu1,$Vn),o($Vu1,$Vo),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,1397],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:1398,122:$VU2,149:$VV2,190:$VW2}),o($Vx1,$V03),o($VN1,$V13),o($VN1,$V23),o($VN1,$V33),o($VN1,$V43),{112:[1,1399]},o($VN1,$V93),o($Vt1,$Vt5),o($VN4,$Vn2,{85:932,193:933,84:1400,191:$VO4}),o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:1401,122:$VU2,149:$VV2,190:$VW2}),o($VN4,$Vn2,{85:932,193:933,84:1402,191:$VO4}),o($Vy3,$Vq2,{100:585,96:1403,102:$Vv3,103:$VO,104:$VP,105:$VQ}),o($VL4,$Vr2),o($VL4,$V03),o($Vt3,$V36),o($V46,$VJ3),o($Vx3,$VK3),o($V46,$VL3,{31:1404,194:[1,1405]}),{19:$VM3,21:$VN3,22:626,130:1406,200:$VO3,215:629,216:$VP3},o($Vt3,$VQ3),o($Vy3,$VK3),o($Vt3,$VL3,{31:1407,194:[1,1408]}),{19:$VM3,21:$VN3,22:626,130:1409,200:$VO3,215:629,216:$VP3},o($V56,$VV3),o($Vz3,$VK3),o($V56,$VL3,{31:1410,194:[1,1411]}),{19:$VM3,21:$VN3,22:626,130:1412,200:$VO3,215:629,216:$VP3},o($VA3,$VR3),o($VB3,$VS3),o($VB3,$VT3),o($VB3,$VU3),{101:[1,1413]},o($VB3,$VT1),{101:[1,1415],107:1414,109:[1,1416],110:[1,1417],111:1418,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,1419]},{122:[1,1420]},o($VB3,$VW3),{19:[1,1423],21:[1,1426],22:1422,88:1421,215:1424,216:[1,1425]},o($VF3,$V82),o($VF3,$V81,{53:1427,54:[1,1428]}),o($Vt3,$Va1),o($VF,$VG,{66:1429,68:1430,73:1431,40:1432,79:1433,119:1437,52:$Vb1,54:$Vb1,71:$Vb1,80:[1,1434],81:[1,1435],82:[1,1436]}),o($Vt3,$Vf1),o($Vt3,$Vg1,{69:1438,65:1439,74:1440,93:1441,95:1442,96:1446,100:1447,97:[1,1443],98:[1,1444],99:[1,1445],102:$V66,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:1449,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($Vt3,$Vq1),o($Vx3,$Vs1,{83:1450}),o($Vy3,$Vs1,{83:1451}),o($V56,$Vv1),o($V56,$Vw1),o($VA3,$Vy1,{94:1452}),o($Vx3,$Vz1,{100:980,96:1453,102:$VV4,103:$VO,104:$VP,105:$VQ}),o($VB3,$VB1,{87:1454}),o($VB3,$VB1,{87:1455}),o($VB3,$VB1,{87:1456}),o($Vy3,$VC1,{106:984,108:985,92:1457,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vz3,$Vs1,{83:1458}),o($V56,$VE1),o($V56,$VF1),{19:[1,1462],21:[1,1466],22:1460,34:1459,201:1461,215:1463,216:[1,1465],217:[1,1464]},o($VA3,$VG1),o($VA3,$VH1),o($VA3,$VI1),o($VA3,$VJ1),o($VB3,$VK1),o($VL1,$VM1,{163:1467}),o($VC3,$VO1),{120:[1,1468],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},{101:[1,1469]},o($VA3,$VT1),o($VB3,$Vl),o($VB3,$Vm),{101:[1,1471],107:1470,109:[1,1472],110:[1,1473],111:1474,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,1475]},o($VB3,$Vn),o($VB3,$Vo),o($Vt3,$Va1),o($VF,$VG,{66:1476,68:1477,73:1478,40:1479,79:1480,119:1484,52:$Vb1,54:$Vb1,71:$Vb1,80:[1,1481],81:[1,1482],82:[1,1483]}),o($Vt3,$Vf1),o($Vt3,$Vg1,{69:1485,65:1486,74:1487,93:1488,95:1489,96:1493,100:1494,97:[1,1490],98:[1,1491],99:[1,1492],102:$V76,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:1496,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($Vt3,$Vq1),o($Vx3,$Vs1,{83:1497}),o($Vy3,$Vs1,{83:1498}),o($V56,$Vv1),o($V56,$Vw1),o($VA3,$Vy1,{94:1499}),o($Vx3,$Vz1,{100:1016,96:1500,102:$VW4,103:$VO,104:$VP,105:$VQ}),o($VB3,$VB1,{87:1501}),o($VB3,$VB1,{87:1502}),o($VB3,$VB1,{87:1503}),o($Vy3,$VC1,{106:1020,108:1021,92:1504,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vz3,$Vs1,{83:1505}),o($V56,$VE1),o($V56,$VF1),{19:[1,1509],21:[1,1513],22:1507,34:1506,201:1508,215:1510,216:[1,1512],217:[1,1511]},o($VA3,$VG1),o($VA3,$VH1),o($VA3,$VI1),o($VA3,$VJ1),o($VB3,$VK1),o($VL1,$VM1,{163:1514}),o($VC3,$VO1),{120:[1,1515],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},{101:[1,1516]},o($VA3,$VT1),o($VB3,$Vl),o($VB3,$Vm),{101:[1,1518],107:1517,109:[1,1519],110:[1,1520],111:1521,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,1522]},o($VB3,$Vn),o($VB3,$Vo),{194:[1,1525],195:1523,196:[1,1524]},o($Vr1,$V86),o($Vr1,$V96),o($Vr1,$Va6),o($Vr1,$Vl),o($Vr1,$Vm),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$V04),o($Vr1,$V14,{203:1526,204:1527,112:[1,1528]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Vb6,$V53),o($Vb6,$V63),o($Vb6,$V73),o($Vb6,$V83),{194:[1,1531],195:1529,196:[1,1530]},o($Vt1,$V86),o($Vt1,$V96),o($Vt1,$Va6),o($Vt1,$Vl),o($Vt1,$Vm),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$V04),o($Vt1,$V14,{203:1532,204:1533,112:[1,1534]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vc6,$V53),o($Vc6,$V63),o($Vc6,$V73),o($Vc6,$V83),{19:[1,1537],21:[1,1540],22:1536,88:1535,215:1538,216:[1,1539]},{194:[1,1543],195:1541,196:[1,1542]},o($VD1,$V86),o($VD1,$V96),o($VD1,$Va6),o($VD1,$Vl),o($VD1,$Vm),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$V04),o($VD1,$V14,{203:1544,204:1545,112:[1,1546]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vd6,$V53),o($Vd6,$V63),o($Vd6,$V73),o($Vd6,$V83),o($V95,[2,192]),{19:$Va5,21:$Vb5,22:1109,215:1113,216:$Vq5},o($V95,[2,194]),{101:$Vc5,109:$Vd5,110:$Ve5,111:1120,182:1110,197:1114,198:1115,199:1116,202:1119,205:$Vg5,206:$Vh5,207:$Vi5,208:$Vj5,209:$Vk5,210:$Vl5,211:$Vm5,212:$Vn5,213:$Vo5,214:$Vp5},o($V95,[2,196]),{186:$Vf5},o($V95,$Ve6,{181:1547,179:$Vf6}),o($V95,$Ve6,{181:1549,179:$Vf6}),o($V95,$Ve6,{181:1550,179:$Vf6}),o($Vg6,$Vl),o($Vg6,$Vm),o($Vg6,$VZ3),o($Vg6,$V_3),o($Vg6,$V$3),o($Vg6,$Vn),o($Vg6,$Vo),o($Vg6,$V04),o($Vg6,$V14,{203:1551,204:1552,112:[1,1553]}),o($Vg6,$V24),o($Vg6,$V34),o($Vg6,$V44),o($Vg6,$V54),o($Vg6,$V64),o($Vg6,$V74),o($Vg6,$V84),o($Vg6,$V94),o($Vg6,$Va4),o($Vh6,$V53),o($Vh6,$V63),o($Vh6,$V73),o($Vh6,$V83),o($VL1,[2,203],{171:1554,180:$V65}),o($VL1,[2,212],{173:1555,180:$V75}),o($VL1,[2,220],{175:1556,180:$V85}),o($VY3,$Vi6),o($VY3,$VK1),o($Vg4,$Vj6),o($Vg4,$Vk6),o($Vg4,$Vl6),o($Vp4,$Vm6),o($Vp4,$Vn6),o($Vp4,$Vo6),o($Vp,$Vq,{47:1557,48:1558,56:1559,60:1560,42:1561,45:$Vr}),o($V$2,$Vz4),o($V$2,$VA4),o($V$2,$Vl),o($V$2,$Vm),o($V$2,$Vn),o($V$2,$Vo),{71:[1,1562]},{71:$Vc4},{71:$Vd4,134:1563,135:1564,136:$Vp6},{71:$Vf4},o($Vq6,$Vh4),o($Vq6,$Vi4),o($Vq6,$Vj4,{140:1566,143:1567,144:1570,141:$Vr6,142:$Vs6}),o($Vm4,$Vn4,{156:680,146:1571,151:1572,152:1573,155:1574,70:[1,1575],161:$Vo4}),o($Vt6,$Vq4),{19:[1,1579],21:[1,1583],22:1577,150:1576,201:1578,215:1580,216:[1,1582],217:[1,1581]},o($Vr4,[2,272]),o($Vp,$Vq,{221:1584,224:1585,42:1586,45:$Vr}),o($Vs4,$Vu6),o($Vp,$Vq,{224:1587,42:1588,45:$Vr}),o($Vs4,$Vv6),o($Vs4,$VU5),o($Vs4,$VV5),{120:[1,1589],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($Vs4,$VE1),o($Vs4,$VF1),{19:[1,1593],21:[1,1597],22:1591,34:1590,201:1592,215:1594,216:[1,1596],217:[1,1595]},o($Vs4,$Vw6),o($Vs4,$Vx6),o($Vy6,$Vy1,{94:1598}),o($Vs4,$Vz1,{100:1181,96:1599,102:$VP5,103:$VO,104:$VP,105:$VQ}),o($Vy6,$VG1),o($Vy6,$VH1),o($Vy6,$VI1),o($Vy6,$VJ1),{101:[1,1600]},o($Vy6,$VT1),{71:[1,1601]},o($Vd3,$Vq2,{100:725,96:1602,102:$Vx4,103:$VO,104:$VP,105:$VQ}),o($VR5,$Vr2),o($Vs4,$Vs2,{91:1603,96:1604,92:1605,100:1606,106:1608,108:1609,102:$Vz6,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vs4,$Vu2,{91:1603,96:1604,92:1605,100:1606,106:1608,108:1609,102:$Vz6,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vs4,$Vv2,{91:1603,96:1604,92:1605,100:1606,106:1608,108:1609,102:$Vz6,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VW5,$Vw2),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,1610],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:1611,122:$VU2,149:$VV2,190:$VW2}),o($VT5,$Vy2),o($VT5,$V01),o($VT5,$V11),o($VT5,$Vl),o($VT5,$Vm),o($VT5,$V21),o($VT5,$Vn),o($VT5,$Vo),o($VR5,$V03),o($VW5,$V13),o($VW5,$V23),o($VW5,$V33),o($VW5,$V43),{112:[1,1612]},o($VW5,$V93),o($V_,$VV3),o($VC4,$VK3),o($V_,$VL3,{31:1613,194:[1,1614]}),{19:$VM3,21:$VN3,22:626,130:1615,200:$VO3,215:629,216:$VP3},{122:[1,1616]},o($VD,$V36),o($VB,$V81,{53:1617,54:[1,1618]}),o($VD,$Va1),o($VD,$Vb1,{66:1619,68:1620,73:1621,40:1622,79:1623,119:1627,80:[1,1624],81:[1,1625],82:[1,1626],120:$VG,126:$VG,128:$VG,190:$VG,228:$VG}),o($VD,$Vf1),o($VD,$Vg1,{69:1628,65:1629,74:1630,93:1631,95:1632,96:1636,100:1637,97:[1,1633],98:[1,1634],99:[1,1635],102:$VA6,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:1639,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($VD,$Vq1),o($Vr1,$Vs1,{83:1640}),o($Vt1,$Vs1,{83:1641}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{94:1642}),o($Vr1,$Vz1,{100:1242,96:1643,102:$VZ5,103:$VO,104:$VP,105:$VQ}),o($VA1,$VB1,{87:1644}),o($VA1,$VB1,{87:1645}),o($VA1,$VB1,{87:1646}),o($Vt1,$VC1,{106:1246,108:1247,92:1647,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VD1,$Vs1,{83:1648}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,1652],21:[1,1656],22:1650,34:1649,201:1651,215:1653,216:[1,1655],217:[1,1654]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{163:1657}),o($VN1,$VO1),{120:[1,1658],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},{101:[1,1659]},o($Vx1,$VT1),o($VA1,$Vl),o($VA1,$Vm),{101:[1,1661],107:1660,109:[1,1662],110:[1,1663],111:1664,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,1665]},o($VA1,$Vn),o($VA1,$Vo),o($VD,$Va1),o($VD,$Vb1,{66:1666,68:1667,73:1668,40:1669,79:1670,119:1674,80:[1,1671],81:[1,1672],82:[1,1673],120:$VG,126:$VG,128:$VG,190:$VG,228:$VG}),o($VD,$Vf1),o($VD,$Vg1,{69:1675,65:1676,74:1677,93:1678,95:1679,96:1683,100:1684,97:[1,1680],98:[1,1681],99:[1,1682],102:$VB6,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:1686,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($VD,$Vq1),o($Vr1,$Vs1,{83:1687}),o($Vt1,$Vs1,{83:1688}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{94:1689}),o($Vr1,$Vz1,{100:1278,96:1690,102:$V_5,103:$VO,104:$VP,105:$VQ}),o($VA1,$VB1,{87:1691}),o($VA1,$VB1,{87:1692}),o($VA1,$VB1,{87:1693}),o($Vt1,$VC1,{106:1282,108:1283,92:1694,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VD1,$Vs1,{83:1695}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,1699],21:[1,1703],22:1697,34:1696,201:1698,215:1700,216:[1,1702],217:[1,1701]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{163:1704}),o($VN1,$VO1),{120:[1,1705],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},{101:[1,1706]},o($Vx1,$VT1),o($VA1,$Vl),o($VA1,$Vm),{101:[1,1708],107:1707,109:[1,1709],110:[1,1710],111:1711,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,1712]},o($VA1,$Vn),o($VA1,$Vo),o($VD,$VV3),{122:[1,1713]},o($VD,$VJ3),o($Ve2,$VR3),o($Vm2,$VX4),{19:$Vg,21:$Vh,22:1714,215:38,216:$Vi},{19:$VC6,21:$VD6,22:1716,101:[1,1727],109:[1,1728],110:[1,1729],111:1726,182:1717,192:1715,197:1720,198:1721,199:1722,202:1725,205:[1,1730],206:[1,1731],207:[1,1736],208:[1,1737],209:[1,1738],210:[1,1739],211:[1,1732],212:[1,1733],213:[1,1734],214:[1,1735],215:1719,216:$VE6},o($Vo2,$VX4),{19:$Vg,21:$Vh,22:1740,215:38,216:$Vi},{19:$VF6,21:$VG6,22:1742,101:[1,1753],109:[1,1754],110:[1,1755],111:1752,182:1743,192:1741,197:1746,198:1747,199:1748,202:1751,205:[1,1756],206:[1,1757],207:[1,1762],208:[1,1763],209:[1,1764],210:[1,1765],211:[1,1758],212:[1,1759],213:[1,1760],214:[1,1761],215:1745,216:$VH6},o($VA1,$V03),o($VA1,$V13),o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),{112:[1,1766]},o($VA1,$V93),o($Vx2,$VX4),{19:$Vg,21:$Vh,22:1767,215:38,216:$Vi},{19:$VI6,21:$VJ6,22:1769,101:[1,1780],109:[1,1781],110:[1,1782],111:1779,182:1770,192:1768,197:1773,198:1774,199:1775,202:1778,205:[1,1783],206:[1,1784],207:[1,1789],208:[1,1790],209:[1,1791],210:[1,1792],211:[1,1785],212:[1,1786],213:[1,1787],214:[1,1788],215:1772,216:$VK6},o($VD1,$Vt5),o($VN1,$VX5),o($VN1,$VK1),o($VN1,$Vl),o($VN1,$Vm),o($VN1,$Vn),o($VN1,$Vo),o($VB,$VS4),o($V7,$VT4,{51:431,52:$Ve3}),o($VD,$VU4),o($V7,$VH4),o($V7,$VI4),o($VD,$VJ4),o($VD,$VK4),{71:[1,1793]},o($V7,$VR4),o($VD,$Vp3),o($VF,$VG,{63:1794,65:1795,67:1796,68:1797,74:1800,76:1801,73:1802,40:1803,93:1804,95:1805,88:1807,89:1808,90:1809,79:1810,96:1817,22:1818,92:1820,119:1821,100:1822,215:1825,106:1826,108:1827,19:[1,1824],21:[1,1829],70:[1,1798],72:[1,1799],80:[1,1811],81:[1,1812],82:[1,1813],86:[1,1806],97:[1,1814],98:[1,1815],99:[1,1816],102:$VL6,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:[1,1819],216:[1,1828]}),o($Vo2,$Vn2,{85:1344,193:1345,84:1830,191:$V$5}),o($VD,$Vy2),o($VD,$V01),o($VD,$V11),o($VD,$Vl),o($VD,$Vm),o($VD,$V21),o($VD,$Vn),o($VD,$Vo),o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:1831,122:$VU2,149:$VV2,190:$VW2}),o($Vo2,$Vn2,{85:1344,193:1345,84:1832,191:$V$5}),o($Vt1,$Vq2,{100:843,96:1833,102:$VF4,103:$VO,104:$VP,105:$VQ}),o($Ve2,$Vr2),o($Ve2,$V03),o($VD,$Vr3),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:1834,194:[1,1835]}),{19:$VM3,21:$VN3,22:626,130:1836,200:$VO3,215:629,216:$VP3},o($VD,$VQ3),o($Vt1,$VK3),o($VD,$VL3,{31:1837,194:[1,1838]}),{19:$VM3,21:$VN3,22:626,130:1839,200:$VO3,215:629,216:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{101:[1,1840]},o($VA1,$VT1),{101:[1,1842],107:1841,109:[1,1843],110:[1,1844],111:1845,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,1846]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:1847,194:[1,1848]}),{19:$VM3,21:$VN3,22:626,130:1849,200:$VO3,215:629,216:$VP3},o($VA1,$VW3),{122:[1,1850]},{19:[1,1853],21:[1,1856],22:1852,88:1851,215:1854,216:[1,1855]},o($Vo2,$Vn2,{85:1382,193:1383,84:1857,191:$V16}),o($VD,$Vy2),o($VD,$V01),o($VD,$V11),o($VD,$Vl),o($VD,$Vm),o($VD,$V21),o($VD,$Vn),o($VD,$Vo),o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:1858,122:$VU2,149:$VV2,190:$VW2}),o($Vo2,$Vn2,{85:1382,193:1383,84:1859,191:$V16}),o($Vt1,$Vq2,{100:890,96:1860,102:$VG4,103:$VO,104:$VP,105:$VQ}),o($Ve2,$Vr2),o($Ve2,$V03),o($VD,$Vr3),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:1861,194:[1,1862]}),{19:$VM3,21:$VN3,22:626,130:1863,200:$VO3,215:629,216:$VP3},o($VD,$VQ3),o($Vt1,$VK3),o($VD,$VL3,{31:1864,194:[1,1865]}),{19:$VM3,21:$VN3,22:626,130:1866,200:$VO3,215:629,216:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{101:[1,1867]},o($VA1,$VT1),{101:[1,1869],107:1868,109:[1,1870],110:[1,1871],111:1872,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,1873]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:1874,194:[1,1875]}),{19:$VM3,21:$VN3,22:626,130:1876,200:$VO3,215:629,216:$VP3},o($VA1,$VW3),{122:[1,1877]},{19:[1,1880],21:[1,1883],22:1879,88:1878,215:1881,216:[1,1882]},o($Vt3,$VV3),{122:[1,1884]},o($Vt3,$VJ3),o($VL4,$VR3),o($VM4,$VX4),{19:$Vg,21:$Vh,22:1885,215:38,216:$Vi},{19:$VM6,21:$VN6,22:1887,101:[1,1898],109:[1,1899],110:[1,1900],111:1897,182:1888,192:1886,197:1891,198:1892,199:1893,202:1896,205:[1,1901],206:[1,1902],207:[1,1907],208:[1,1908],209:[1,1909],210:[1,1910],211:[1,1903],212:[1,1904],213:[1,1905],214:[1,1906],215:1890,216:$VO6},o($VN4,$VX4),{19:$Vg,21:$Vh,22:1911,215:38,216:$Vi},{19:$VP6,21:$VQ6,22:1913,101:[1,1924],109:[1,1925],110:[1,1926],111:1923,182:1914,192:1912,197:1917,198:1918,199:1919,202:1922,205:[1,1927],206:[1,1928],207:[1,1933],208:[1,1934],209:[1,1935],210:[1,1936],211:[1,1929],212:[1,1930],213:[1,1931],214:[1,1932],215:1916,216:$VR6},o($VP4,$VX4),{19:$Vg,21:$Vh,22:1937,215:38,216:$Vi},{19:$VS6,21:$VT6,22:1939,101:[1,1950],109:[1,1951],110:[1,1952],111:1949,182:1940,192:1938,197:1943,198:1944,199:1945,202:1948,205:[1,1953],206:[1,1954],207:[1,1959],208:[1,1960],209:[1,1961],210:[1,1962],211:[1,1955],212:[1,1956],213:[1,1957],214:[1,1958],215:1942,216:$VU6},o($VB3,$V03),o($VB3,$V13),o($VB3,$V23),o($VB3,$V33),o($VB3,$V43),{112:[1,1963]},o($VB3,$V93),o($Vz3,$Vt5),o($VC3,$VX5),o($VC3,$VK1),o($VC3,$Vl),o($VC3,$Vm),o($VC3,$Vn),o($VC3,$Vo),o($Vt3,$V92),o($Vp,$Vq,{55:1964,42:1965,45:$Vr}),o($Vt3,$Va2),o($Vt3,$Vb2),o($Vt3,$Vv1),o($Vt3,$Vw1),o($Vy3,$Vs1,{83:1966}),o($Vt3,$VE1),o($Vt3,$VF1),{19:[1,1970],21:[1,1974],22:1968,34:1967,201:1969,215:1971,216:[1,1973],217:[1,1972]},{120:[1,1975],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($Vt3,$Vc2),o($Vt3,$Vd2),o($Vy3,$Vs1,{83:1976}),o($VL4,$Vy1,{94:1977}),o($Vy3,$Vz1,{100:1447,96:1978,102:$V66,103:$VO,104:$VP,105:$VQ}),o($VL4,$VG1),o($VL4,$VH1),o($VL4,$VI1),o($VL4,$VJ1),{101:[1,1979]},o($VL4,$VT1),{71:[1,1980]},o($VM4,$Vn2,{84:1981,85:1982,193:1983,191:[1,1984]}),o($VN4,$Vn2,{84:1985,85:1986,193:1987,191:$VV6}),o($Vx3,$Vq2,{100:980,96:1989,102:$VV4,103:$VO,104:$VP,105:$VQ}),o($VA3,$Vr2),o($Vy3,$Vs2,{91:1990,96:1991,92:1992,100:1993,106:1995,108:1996,102:$VW6,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vy3,$Vu2,{91:1990,96:1991,92:1992,100:1993,106:1995,108:1996,102:$VW6,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vy3,$Vv2,{91:1990,96:1991,92:1992,100:1993,106:1995,108:1996,102:$VW6,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VC3,$Vw2),o($VP4,$Vn2,{84:1997,85:1998,193:1999,191:[1,2000]}),o($V56,$Vy2),o($V56,$V01),o($V56,$V11),o($V56,$Vl),o($V56,$Vm),o($V56,$V21),o($V56,$Vn),o($V56,$Vo),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,2001],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:2002,122:$VU2,149:$VV2,190:$VW2}),o($VA3,$V03),o($VC3,$V13),o($VC3,$V23),o($VC3,$V33),o($VC3,$V43),{112:[1,2003]},o($VC3,$V93),o($Vt3,$Va2),o($Vt3,$Vb2),o($Vt3,$Vv1),o($Vt3,$Vw1),o($Vy3,$Vs1,{83:2004}),o($Vt3,$VE1),o($Vt3,$VF1),{19:[1,2008],21:[1,2012],22:2006,34:2005,201:2007,215:2009,216:[1,2011],217:[1,2010]},{120:[1,2013],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($Vt3,$Vc2),o($Vt3,$Vd2),o($Vy3,$Vs1,{83:2014}),o($VL4,$Vy1,{94:2015}),o($Vy3,$Vz1,{100:1494,96:2016,102:$V76,103:$VO,104:$VP,105:$VQ}),o($VL4,$VG1),o($VL4,$VH1),o($VL4,$VI1),o($VL4,$VJ1),{101:[1,2017]},o($VL4,$VT1),{71:[1,2018]},o($VM4,$Vn2,{84:2019,85:2020,193:2021,191:[1,2022]}),o($VN4,$Vn2,{84:2023,85:2024,193:2025,191:$VX6}),o($Vx3,$Vq2,{100:1016,96:2027,102:$VW4,103:$VO,104:$VP,105:$VQ}),o($VA3,$Vr2),o($Vy3,$Vs2,{91:2028,96:2029,92:2030,100:2031,106:2033,108:2034,102:$VY6,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vy3,$Vu2,{91:2028,96:2029,92:2030,100:2031,106:2033,108:2034,102:$VY6,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vy3,$Vv2,{91:2028,96:2029,92:2030,100:2031,106:2033,108:2034,102:$VY6,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VC3,$Vw2),o($VP4,$Vn2,{84:2035,85:2036,193:2037,191:[1,2038]}),o($V56,$Vy2),o($V56,$V01),o($V56,$V11),o($V56,$Vl),o($V56,$Vm),o($V56,$V21),o($V56,$Vn),o($V56,$Vo),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,2039],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:2040,122:$VU2,149:$VV2,190:$VW2}),o($VA3,$V03),o($VC3,$V13),o($VC3,$V23),o($VC3,$V33),o($VC3,$V43),{112:[1,2041]},o($VC3,$V93),o($Vm2,$V31),o($Vm2,$V41),o($Vm2,$V51),o($Vr1,$Vr5),o($Vr1,$Vs5),{19:$VY4,21:$VZ4,22:2043,88:2042,215:1029,216:$V_4},o($Vo2,$V31),o($Vo2,$V41),o($Vo2,$V51),o($Vt1,$Vr5),o($Vt1,$Vs5),{19:$V05,21:$V15,22:2045,88:2044,215:1055,216:$V25},o($VA1,$VX5),o($VA1,$VK1),o($VA1,$Vl),o($VA1,$Vm),o($VA1,$Vn),o($VA1,$Vo),o($Vx2,$V31),o($Vx2,$V41),o($Vx2,$V51),o($VD1,$Vr5),o($VD1,$Vs5),{19:$V35,21:$V45,22:2047,88:2046,215:1082,216:$V55},o($V95,[2,206]),o($V95,[2,208]),o($V95,[2,215]),o($V95,[2,223]),o($Vg6,$Vr5),o($Vg6,$Vs5),{19:$Va5,21:$Vb5,22:2049,88:2048,215:1113,216:$Vq5},o($V95,[2,202]),o($V95,[2,211]),o($V95,[2,219]),o($VZ6,$V_6,{153:2050,154:2051,157:$V$6,158:$V07,159:$V17,160:$V27}),o($V37,$V47),o($V57,$V67,{57:2056}),o($V77,$V87,{61:2057}),o($VF,$VG,{64:2058,74:2059,76:2060,77:2061,93:2064,95:2065,88:2067,89:2068,90:2069,79:2070,40:2071,96:2075,22:2076,92:2078,119:2079,100:2083,215:2086,106:2087,108:2088,19:[1,2085],21:[1,2090],70:[1,2062],72:[1,2063],80:[1,2080],81:[1,2081],82:[1,2082],86:[1,2066],97:[1,2072],98:[1,2073],99:[1,2074],102:$V97,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:[1,2077],216:[1,2089]}),o($VZ6,$V_6,{154:2051,153:2091,157:$V$6,158:$V07,159:$V17,160:$V27}),{71:$Vu5,135:2092,136:$Vp6},o($Vq6,$Vv5),o($VS2,$VT2,{148:385,137:1156,138:1157,139:1158,145:1159,147:1160,132:2093,149:$VV2,190:$VH5}),o($Vq6,$Vw5),o($Vq6,$Vj4,{140:2094,144:2095,141:$Vr6,142:$Vs6}),o($VS2,$VT2,{148:385,145:1159,147:1160,139:2096,71:$Vx5,136:$Vx5,149:$VV2,190:$VH5}),o($VS2,$VT2,{148:385,145:1159,147:1160,139:2097,71:$Vy5,136:$Vy5,149:$VV2,190:$VH5}),o($Vt6,$Vz5),o($Vt6,$VA5),o($Vt6,$VB5),o($Vt6,$VC5),{19:$VD5,21:$VE5,22:1146,130:2098,200:$VF5,215:1149,216:$VG5},o($VS2,$VT2,{148:385,131:1153,132:1154,133:1155,137:1156,138:1157,139:1158,145:1159,147:1160,127:2099,149:$VV2,190:$VH5}),o($Vt6,$VI5),o($Vt6,$VJ5),o($Vt6,$VK5),o($Vt6,$Vl),o($Vt6,$Vm),o($Vt6,$V21),o($Vt6,$Vn),o($Vt6,$Vo),o($Vr4,[2,270]),o($Vs4,$Vt4,{225:2100}),o($VF,$VG,{93:706,95:707,96:717,100:725,227:2101,74:2102,76:2103,77:2104,88:2108,89:2109,90:2110,79:2111,40:2112,22:2113,92:2115,119:2116,215:2121,106:2122,108:2123,19:[1,2120],21:[1,2125],70:[1,2105],72:[1,2106],80:[1,2117],81:[1,2118],82:[1,2119],86:[1,2107],97:$Vu4,98:$Vv4,99:$Vw4,102:$Vx4,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:[1,2114],216:[1,2124]}),o($Vs4,$Va7),o($VF,$VG,{93:706,95:707,96:717,100:725,227:2126,74:2127,76:2128,77:2129,88:2133,89:2134,90:2135,79:2136,40:2137,22:2138,92:2140,119:2141,215:2146,106:2147,108:2148,19:[1,2145],21:[1,2150],70:[1,2130],72:[1,2131],80:[1,2142],81:[1,2143],82:[1,2144],86:[1,2132],97:$Vu4,98:$Vv4,99:$Vw4,102:$Vx4,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:[1,2139],216:[1,2149]}),o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:2151,122:$VU2,149:$VV2,190:$VW2}),o($Vs4,$Vy2),o($Vs4,$V01),o($Vs4,$V11),o($Vs4,$Vl),o($Vs4,$Vm),o($Vs4,$V21),o($Vs4,$Vn),o($Vs4,$Vo),o($Vs4,$Vq2,{100:1181,96:2152,102:$VP5,103:$VO,104:$VP,105:$VQ}),o($Vy6,$Vr2),o($Vy6,$V03),o($Vs4,$Vb7),o($VR5,$VR3),o($VS5,$VS3),o($VS5,$VT3),o($VS5,$VU3),{101:[1,2153]},o($VS5,$VT1),{101:[1,2155],107:2154,109:[1,2156],110:[1,2157],111:2158,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,2159]},o($VS5,$VW3),{122:[1,2160]},{19:[1,2163],21:[1,2166],22:2162,88:2161,215:2164,216:[1,2165]},o($VY5,$VX4),{19:$Vg,21:$Vh,22:2167,215:38,216:$Vi},{19:$Vc7,21:$Vd7,22:2169,101:[1,2180],109:[1,2181],110:[1,2182],111:2179,182:2170,192:2168,197:2173,198:2174,199:2175,202:2178,205:[1,2183],206:[1,2184],207:[1,2189],208:[1,2190],209:[1,2191],210:[1,2192],211:[1,2185],212:[1,2186],213:[1,2187],214:[1,2188],215:2172,216:$Ve7},o($VC4,$Vt5),o($VD,$V92),o($Vp,$Vq,{55:2193,42:2194,45:$Vr}),o($VD,$Va2),o($VD,$Vb2),o($VD,$Vv1),o($VD,$Vw1),o($Vt1,$Vs1,{83:2195}),o($VD,$VE1),o($VD,$VF1),{19:[1,2199],21:[1,2203],22:2197,34:2196,201:2198,215:2200,216:[1,2202],217:[1,2201]},{120:[1,2204],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($VD,$Vc2),o($VD,$Vd2),o($Vt1,$Vs1,{83:2205}),o($Ve2,$Vy1,{94:2206}),o($Vt1,$Vz1,{100:1637,96:2207,102:$VA6,103:$VO,104:$VP,105:$VQ}),o($Ve2,$VG1),o($Ve2,$VH1),o($Ve2,$VI1),o($Ve2,$VJ1),{101:[1,2208]},o($Ve2,$VT1),{71:[1,2209]},o($Vm2,$Vn2,{84:2210,85:2211,193:2212,191:[1,2213]}),o($Vo2,$Vn2,{84:2214,85:2215,193:2216,191:$Vf7}),o($Vr1,$Vq2,{100:1242,96:2218,102:$VZ5,103:$VO,104:$VP,105:$VQ}),o($Vx1,$Vr2),o($Vt1,$Vs2,{91:2219,96:2220,92:2221,100:2222,106:2224,108:2225,102:$Vg7,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vt1,$Vu2,{91:2219,96:2220,92:2221,100:2222,106:2224,108:2225,102:$Vg7,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vt1,$Vv2,{91:2219,96:2220,92:2221,100:2222,106:2224,108:2225,102:$Vg7,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VN1,$Vw2),o($Vx2,$Vn2,{84:2226,85:2227,193:2228,191:[1,2229]}),o($Vu1,$Vy2),o($Vu1,$V01),o($Vu1,$V11),o($Vu1,$Vl),o($Vu1,$Vm),o($Vu1,$V21),o($Vu1,$Vn),o($Vu1,$Vo),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,2230],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:2231,122:$VU2,149:$VV2,190:$VW2}),o($Vx1,$V03),o($VN1,$V13),o($VN1,$V23),o($VN1,$V33),o($VN1,$V43),{112:[1,2232]},o($VN1,$V93),o($VD,$Va2),o($VD,$Vb2),o($VD,$Vv1),o($VD,$Vw1),o($Vt1,$Vs1,{83:2233}),o($VD,$VE1),o($VD,$VF1),{19:[1,2237],21:[1,2241],22:2235,34:2234,201:2236,215:2238,216:[1,2240],217:[1,2239]},{120:[1,2242],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($VD,$Vc2),o($VD,$Vd2),o($Vt1,$Vs1,{83:2243}),o($Ve2,$Vy1,{94:2244}),o($Vt1,$Vz1,{100:1684,96:2245,102:$VB6,103:$VO,104:$VP,105:$VQ}),o($Ve2,$VG1),o($Ve2,$VH1),o($Ve2,$VI1),o($Ve2,$VJ1),{101:[1,2246]},o($Ve2,$VT1),{71:[1,2247]},o($Vm2,$Vn2,{84:2248,85:2249,193:2250,191:[1,2251]}),o($Vo2,$Vn2,{84:2252,85:2253,193:2254,191:$Vh7}),o($Vr1,$Vq2,{100:1278,96:2256,102:$V_5,103:$VO,104:$VP,105:$VQ}),o($Vx1,$Vr2),o($Vt1,$Vs2,{91:2257,96:2258,92:2259,100:2260,106:2262,108:2263,102:$Vi7,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vt1,$Vu2,{91:2257,96:2258,92:2259,100:2260,106:2262,108:2263,102:$Vi7,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vt1,$Vv2,{91:2257,96:2258,92:2259,100:2260,106:2262,108:2263,102:$Vi7,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VN1,$Vw2),o($Vx2,$Vn2,{84:2264,85:2265,193:2266,191:[1,2267]}),o($Vu1,$Vy2),o($Vu1,$V01),o($Vu1,$V11),o($Vu1,$Vl),o($Vu1,$Vm),o($Vu1,$V21),o($Vu1,$Vn),o($Vu1,$Vo),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,2268],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:2269,122:$VU2,149:$VV2,190:$VW2}),o($Vx1,$V03),o($VN1,$V13),o($VN1,$V23),o($VN1,$V33),o($VN1,$V43),{112:[1,2270]},o($VN1,$V93),o($Vt1,$Vt5),{194:[1,2273],195:2271,196:[1,2272]},o($Vr1,$V86),o($Vr1,$V96),o($Vr1,$Va6),o($Vr1,$Vl),o($Vr1,$Vm),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$V04),o($Vr1,$V14,{203:2274,204:2275,112:[1,2276]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Vb6,$V53),o($Vb6,$V63),o($Vb6,$V73),o($Vb6,$V83),{194:[1,2279],195:2277,196:[1,2278]},o($Vt1,$V86),o($Vt1,$V96),o($Vt1,$Va6),o($Vt1,$Vl),o($Vt1,$Vm),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$V04),o($Vt1,$V14,{203:2280,204:2281,112:[1,2282]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vc6,$V53),o($Vc6,$V63),o($Vc6,$V73),o($Vc6,$V83),{19:[1,2285],21:[1,2288],22:2284,88:2283,215:2286,216:[1,2287]},{194:[1,2291],195:2289,196:[1,2290]},o($VD1,$V86),o($VD1,$V96),o($VD1,$Va6),o($VD1,$Vl),o($VD1,$Vm),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$V04),o($VD1,$V14,{203:2292,204:2293,112:[1,2294]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vd6,$V53),o($Vd6,$V63),o($Vd6,$V73),o($Vd6,$V83),o($VD,$V36),o($VD,$Va1),o($VD,$Vb1,{66:2295,68:2296,73:2297,40:2298,79:2299,119:2303,80:[1,2300],81:[1,2301],82:[1,2302],120:$VG,126:$VG,128:$VG,190:$VG,228:$VG}),o($VD,$Vf1),o($VD,$Vg1,{69:2304,65:2305,74:2306,93:2307,95:2308,96:2312,100:2313,97:[1,2309],98:[1,2310],99:[1,2311],102:$Vj7,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:2315,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($VD,$Vq1),o($Vr1,$Vs1,{83:2316}),o($Vt1,$Vs1,{83:2317}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{94:2318}),o($Vr1,$Vz1,{100:1822,96:2319,102:$VL6,103:$VO,104:$VP,105:$VQ}),o($VA1,$VB1,{87:2320}),o($VA1,$VB1,{87:2321}),o($VA1,$VB1,{87:2322}),o($Vt1,$VC1,{106:1826,108:1827,92:2323,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VD1,$Vs1,{83:2324}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,2328],21:[1,2332],22:2326,34:2325,201:2327,215:2329,216:[1,2331],217:[1,2330]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{163:2333}),o($VN1,$VO1),{120:[1,2334],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},{101:[1,2335]},o($Vx1,$VT1),o($VA1,$Vl),o($VA1,$Vm),{101:[1,2337],107:2336,109:[1,2338],110:[1,2339],111:2340,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,2341]},o($VA1,$Vn),o($VA1,$Vo),o($VD,$VV3),{122:[1,2342]},o($VD,$VJ3),o($Ve2,$VR3),o($Vm2,$VX4),{19:$Vg,21:$Vh,22:2343,215:38,216:$Vi},{19:$Vk7,21:$Vl7,22:2345,101:[1,2356],109:[1,2357],110:[1,2358],111:2355,182:2346,192:2344,197:2349,198:2350,199:2351,202:2354,205:[1,2359],206:[1,2360],207:[1,2365],208:[1,2366],209:[1,2367],210:[1,2368],211:[1,2361],212:[1,2362],213:[1,2363],214:[1,2364],215:2348,216:$Vm7},o($Vo2,$VX4),{19:$Vg,21:$Vh,22:2369,215:38,216:$Vi},{19:$Vn7,21:$Vo7,22:2371,101:[1,2382],109:[1,2383],110:[1,2384],111:2381,182:2372,192:2370,197:2375,198:2376,199:2377,202:2380,205:[1,2385],206:[1,2386],207:[1,2391],208:[1,2392],209:[1,2393],210:[1,2394],211:[1,2387],212:[1,2388],213:[1,2389],214:[1,2390],215:2374,216:$Vp7},o($VA1,$V03),o($VA1,$V13),o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),{112:[1,2395]},o($VA1,$V93),o($Vx2,$VX4),{19:$Vg,21:$Vh,22:2396,215:38,216:$Vi},{19:$Vq7,21:$Vr7,22:2398,101:[1,2409],109:[1,2410],110:[1,2411],111:2408,182:2399,192:2397,197:2402,198:2403,199:2404,202:2407,205:[1,2412],206:[1,2413],207:[1,2418],208:[1,2419],209:[1,2420],210:[1,2421],211:[1,2414],212:[1,2415],213:[1,2416],214:[1,2417],215:2401,216:$Vs7},o($VD1,$Vt5),o($VN1,$VX5),o($VN1,$VK1),o($VN1,$Vl),o($VN1,$Vm),o($VN1,$Vn),o($VN1,$Vo),o($VD,$VV3),{122:[1,2422]},o($VD,$VJ3),o($Ve2,$VR3),o($Vm2,$VX4),{19:$Vg,21:$Vh,22:2423,215:38,216:$Vi},{19:$Vt7,21:$Vu7,22:2425,101:[1,2436],109:[1,2437],110:[1,2438],111:2435,182:2426,192:2424,197:2429,198:2430,199:2431,202:2434,205:[1,2439],206:[1,2440],207:[1,2445],208:[1,2446],209:[1,2447],210:[1,2448],211:[1,2441],212:[1,2442],213:[1,2443],214:[1,2444],215:2428,216:$Vv7},o($Vo2,$VX4),{19:$Vg,21:$Vh,22:2449,215:38,216:$Vi},{19:$Vw7,21:$Vx7,22:2451,101:[1,2462],109:[1,2463],110:[1,2464],111:2461,182:2452,192:2450,197:2455,198:2456,199:2457,202:2460,205:[1,2465],206:[1,2466],207:[1,2471],208:[1,2472],209:[1,2473],210:[1,2474],211:[1,2467],212:[1,2468],213:[1,2469],214:[1,2470],215:2454,216:$Vy7},o($VA1,$V03),o($VA1,$V13),o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),{112:[1,2475]},o($VA1,$V93),o($Vx2,$VX4),{19:$Vg,21:$Vh,22:2476,215:38,216:$Vi},{19:$Vz7,21:$VA7,22:2478,101:[1,2489],109:[1,2490],110:[1,2491],111:2488,182:2479,192:2477,197:2482,198:2483,199:2484,202:2487,205:[1,2492],206:[1,2493],207:[1,2498],208:[1,2499],209:[1,2500],210:[1,2501],211:[1,2494],212:[1,2495],213:[1,2496],214:[1,2497],215:2481,216:$VB7},o($VD1,$Vt5),o($VN1,$VX5),o($VN1,$VK1),o($VN1,$Vl),o($VN1,$Vm),o($VN1,$Vn),o($VN1,$Vo),o($Vy3,$Vt5),{194:[1,2504],195:2502,196:[1,2503]},o($Vx3,$V86),o($Vx3,$V96),o($Vx3,$Va6),o($Vx3,$Vl),o($Vx3,$Vm),o($Vx3,$VZ3),o($Vx3,$V_3),o($Vx3,$V$3),o($Vx3,$Vn),o($Vx3,$Vo),o($Vx3,$V04),o($Vx3,$V14,{203:2505,204:2506,112:[1,2507]}),o($Vx3,$V24),o($Vx3,$V34),o($Vx3,$V44),o($Vx3,$V54),o($Vx3,$V64),o($Vx3,$V74),o($Vx3,$V84),o($Vx3,$V94),o($Vx3,$Va4),o($VC7,$V53),o($VC7,$V63),o($VC7,$V73),o($VC7,$V83),{194:[1,2510],195:2508,196:[1,2509]},o($Vy3,$V86),o($Vy3,$V96),o($Vy3,$Va6),o($Vy3,$Vl),o($Vy3,$Vm),o($Vy3,$VZ3),o($Vy3,$V_3),o($Vy3,$V$3),o($Vy3,$Vn),o($Vy3,$Vo),o($Vy3,$V04),o($Vy3,$V14,{203:2511,204:2512,112:[1,2513]}),o($Vy3,$V24),o($Vy3,$V34),o($Vy3,$V44),o($Vy3,$V54),o($Vy3,$V64),o($Vy3,$V74),o($Vy3,$V84),o($Vy3,$V94),o($Vy3,$Va4),o($VD7,$V53),o($VD7,$V63),o($VD7,$V73),o($VD7,$V83),{194:[1,2516],195:2514,196:[1,2515]},o($Vz3,$V86),o($Vz3,$V96),o($Vz3,$Va6),o($Vz3,$Vl),o($Vz3,$Vm),o($Vz3,$VZ3),o($Vz3,$V_3),o($Vz3,$V$3),o($Vz3,$Vn),o($Vz3,$Vo),o($Vz3,$V04),o($Vz3,$V14,{203:2517,204:2518,112:[1,2519]}),o($Vz3,$V24),o($Vz3,$V34),o($Vz3,$V44),o($Vz3,$V54),o($Vz3,$V64),o($Vz3,$V74),o($Vz3,$V84),o($Vz3,$V94),o($Vz3,$Va4),o($VE7,$V53),o($VE7,$V63),o($VE7,$V73),o($VE7,$V83),{19:[1,2522],21:[1,2525],22:2521,88:2520,215:2523,216:[1,2524]},o($Vt3,$Vp3),o($VF,$VG,{63:2526,65:2527,67:2528,68:2529,74:2532,76:2533,73:2534,40:2535,93:2536,95:2537,88:2539,89:2540,90:2541,79:2542,96:2549,22:2550,92:2552,119:2553,100:2554,215:2557,106:2558,108:2559,19:[1,2556],21:[1,2561],70:[1,2530],72:[1,2531],80:[1,2543],81:[1,2544],82:[1,2545],86:[1,2538],97:[1,2546],98:[1,2547],99:[1,2548],102:$VF7,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:[1,2551],216:[1,2560]}),o($VN4,$Vn2,{85:1986,193:1987,84:2562,191:$VV6}),o($Vt3,$Vy2),o($Vt3,$V01),o($Vt3,$V11),o($Vt3,$Vl),o($Vt3,$Vm),o($Vt3,$V21),o($Vt3,$Vn),o($Vt3,$Vo),o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:2563,122:$VU2,149:$VV2,190:$VW2}),o($VN4,$Vn2,{85:1986,193:1987,84:2564,191:$VV6}),o($Vy3,$Vq2,{100:1447,96:2565,102:$V66,103:$VO,104:$VP,105:$VQ}),o($VL4,$Vr2),o($VL4,$V03),o($Vt3,$Vr3),o($V46,$VJ3),o($Vx3,$VK3),o($V46,$VL3,{31:2566,194:[1,2567]}),{19:$VM3,21:$VN3,22:626,130:2568,200:$VO3,215:629,216:$VP3},o($Vt3,$VQ3),o($Vy3,$VK3),o($Vt3,$VL3,{31:2569,194:[1,2570]}),{19:$VM3,21:$VN3,22:626,130:2571,200:$VO3,215:629,216:$VP3},o($VA3,$VR3),o($VB3,$VS3),o($VB3,$VT3),o($VB3,$VU3),{101:[1,2572]},o($VB3,$VT1),{101:[1,2574],107:2573,109:[1,2575],110:[1,2576],111:2577,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,2578]},o($V56,$VV3),o($Vz3,$VK3),o($V56,$VL3,{31:2579,194:[1,2580]}),{19:$VM3,21:$VN3,22:626,130:2581,200:$VO3,215:629,216:$VP3},o($VB3,$VW3),{122:[1,2582]},{19:[1,2585],21:[1,2588],22:2584,88:2583,215:2586,216:[1,2587]},o($VN4,$Vn2,{85:2024,193:2025,84:2589,191:$VX6}),o($Vt3,$Vy2),o($Vt3,$V01),o($Vt3,$V11),o($Vt3,$Vl),o($Vt3,$Vm),o($Vt3,$V21),o($Vt3,$Vn),o($Vt3,$Vo),o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:2590,122:$VU2,149:$VV2,190:$VW2}),o($VN4,$Vn2,{85:2024,193:2025,84:2591,191:$VX6}),o($Vy3,$Vq2,{100:1494,96:2592,102:$V76,103:$VO,104:$VP,105:$VQ}),o($VL4,$Vr2),o($VL4,$V03),o($Vt3,$Vr3),o($V46,$VJ3),o($Vx3,$VK3),o($V46,$VL3,{31:2593,194:[1,2594]}),{19:$VM3,21:$VN3,22:626,130:2595,200:$VO3,215:629,216:$VP3},o($Vt3,$VQ3),o($Vy3,$VK3),o($Vt3,$VL3,{31:2596,194:[1,2597]}),{19:$VM3,21:$VN3,22:626,130:2598,200:$VO3,215:629,216:$VP3},o($VA3,$VR3),o($VB3,$VS3),o($VB3,$VT3),o($VB3,$VU3),{101:[1,2599]},o($VB3,$VT1),{101:[1,2601],107:2600,109:[1,2602],110:[1,2603],111:2604,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,2605]},o($V56,$VV3),o($Vz3,$VK3),o($V56,$VL3,{31:2606,194:[1,2607]}),{19:$VM3,21:$VN3,22:626,130:2608,200:$VO3,215:629,216:$VP3},o($VB3,$VW3),{122:[1,2609]},{19:[1,2612],21:[1,2615],22:2611,88:2610,215:2613,216:[1,2614]},o($Vr1,$Vi6),o($Vr1,$VK1),o($Vt1,$Vi6),o($Vt1,$VK1),o($VD1,$Vi6),o($VD1,$VK1),o($Vg6,$Vi6),o($Vg6,$VK1),o($VZ6,$Vs1,{83:2616}),o($VZ6,$VG7),o($VZ6,$VH7),o($VZ6,$VI7),o($VZ6,$VJ7),o($VZ6,$VK7),o($V37,$VL7,{58:2617,52:[1,2618]}),o($V57,$VM7,{62:2619,54:[1,2620]}),o($V77,$VN7),o($V77,$VO7,{75:2621,77:2622,79:2623,40:2624,119:2625,80:[1,2626],81:[1,2627],82:[1,2628],120:$VG,126:$VG,128:$VG,190:$VG,228:$VG}),o($V77,$VP7),o($V77,$VO5,{78:2629,74:2630,93:2631,95:2632,96:2636,100:2637,97:[1,2633],98:[1,2634],99:[1,2635],102:$VQ7,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:2639,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($V77,$VR7),o($VS7,$Vy1,{94:2640}),o($VT7,$Vz1,{100:2083,96:2641,102:$V97,103:$VO,104:$VP,105:$VQ}),o($VU7,$VB1,{87:2642}),o($VU7,$VB1,{87:2643}),o($VU7,$VB1,{87:2644}),o($V77,$VC1,{106:2087,108:2088,92:2645,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VV7,$VU5),o($VV7,$VV5),o($VS7,$VG1),o($VS7,$VH1),o($VS7,$VI1),o($VS7,$VJ1),o($VU7,$VK1),o($VL1,$VM1,{163:2646}),o($VW7,$VO1),{120:[1,2647],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($VV7,$VE1),o($VV7,$VF1),{19:[1,2651],21:[1,2655],22:2649,34:2648,201:2650,215:2652,216:[1,2654],217:[1,2653]},{101:[1,2656]},o($VS7,$VT1),o($VU7,$Vl),o($VU7,$Vm),{101:[1,2658],107:2657,109:[1,2659],110:[1,2660],111:2661,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,2662]},o($VU7,$Vn),o($VU7,$Vo),o($VZ6,$Vs1,{83:2663}),o($Vq6,$Vj6),o($Vq6,$Vk6),o($Vq6,$Vl6),o($Vt6,$Vm6),o($Vt6,$Vn6),o($Vt6,$Vo6),o($Vp,$Vq,{47:2664,48:2665,56:2666,60:2667,42:2668,45:$Vr}),{71:[1,2669]},o($Vr4,$VL5,{226:2670,54:[1,2671]}),o($Vs4,$VM5),o($VF,$VG,{77:2672,79:2673,40:2674,119:2675,80:[1,2676],81:[1,2677],82:[1,2678]}),o($Vs4,$VN5),o($Vs4,$VO5,{78:2679,74:2680,93:2681,95:2682,96:2686,100:2687,97:[1,2683],98:[1,2684],99:[1,2685],102:$VX7,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:2689,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($Vs4,$VQ5),o($VS5,$VB1,{87:2690}),o($VS5,$VB1,{87:2691}),o($VS5,$VB1,{87:2692}),o($Vs4,$VC1,{106:2122,108:2123,92:2693,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VT5,$VU5),o($VT5,$VV5),o($VS5,$VK1),o($VL1,$VM1,{163:2694}),o($VW5,$VO1),{120:[1,2695],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($VT5,$VE1),o($VT5,$VF1),{19:[1,2699],21:[1,2703],22:2697,34:2696,201:2698,215:2700,216:[1,2702],217:[1,2701]},o($VS5,$Vl),o($VS5,$Vm),{101:[1,2705],107:2704,109:[1,2706],110:[1,2707],111:2708,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,2709]},o($VS5,$Vn),o($VS5,$Vo),o($Vs4,$VM5),o($VF,$VG,{77:2710,79:2711,40:2712,119:2713,80:[1,2714],81:[1,2715],82:[1,2716]}),o($Vs4,$VN5),o($Vs4,$VO5,{78:2717,74:2718,93:2719,95:2720,96:2724,100:2725,97:[1,2721],98:[1,2722],99:[1,2723],102:$VY7,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:2727,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($Vs4,$VQ5),o($VS5,$VB1,{87:2728}),o($VS5,$VB1,{87:2729}),o($VS5,$VB1,{87:2730}),o($Vs4,$VC1,{106:2147,108:2148,92:2731,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VT5,$VU5),o($VT5,$VV5),o($VS5,$VK1),o($VL1,$VM1,{163:2732}),o($VW5,$VO1),{120:[1,2733],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($VT5,$VE1),o($VT5,$VF1),{19:[1,2737],21:[1,2741],22:2735,34:2734,201:2736,215:2738,216:[1,2740],217:[1,2739]},o($VS5,$Vl),o($VS5,$Vm),{101:[1,2743],107:2742,109:[1,2744],110:[1,2745],111:2746,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,2747]},o($VS5,$Vn),o($VS5,$Vo),{122:[1,2748]},o($Vy6,$VR3),o($VS5,$V03),o($VS5,$V13),o($VS5,$V23),o($VS5,$V33),o($VS5,$V43),{112:[1,2749]},o($VS5,$V93),o($VT5,$Vt5),o($VW5,$VX5),o($VW5,$VK1),o($VW5,$Vl),o($VW5,$Vm),o($VW5,$Vn),o($VW5,$Vo),{194:[1,2752],195:2750,196:[1,2751]},o($VC4,$V86),o($VC4,$V96),o($VC4,$Va6),o($VC4,$Vl),o($VC4,$Vm),o($VC4,$VZ3),o($VC4,$V_3),o($VC4,$V$3),o($VC4,$Vn),o($VC4,$Vo),o($VC4,$V04),o($VC4,$V14,{203:2753,204:2754,112:[1,2755]}),o($VC4,$V24),o($VC4,$V34),o($VC4,$V44),o($VC4,$V54),o($VC4,$V64),o($VC4,$V74),o($VC4,$V84),o($VC4,$V94),o($VC4,$Va4),o($VZ7,$V53),o($VZ7,$V63),o($VZ7,$V73),o($VZ7,$V83),o($VD,$Vp3),o($VF,$VG,{63:2756,65:2757,67:2758,68:2759,74:2762,76:2763,73:2764,40:2765,93:2766,95:2767,88:2769,89:2770,90:2771,79:2772,96:2779,22:2780,92:2782,119:2783,100:2784,215:2787,106:2788,108:2789,19:[1,2786],21:[1,2791],70:[1,2760],72:[1,2761],80:[1,2773],81:[1,2774],82:[1,2775],86:[1,2768],97:[1,2776],98:[1,2777],99:[1,2778],102:$V_7,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:[1,2781],216:[1,2790]}),o($Vo2,$Vn2,{85:2215,193:2216,84:2792,191:$Vf7}),o($VD,$Vy2),o($VD,$V01),o($VD,$V11),o($VD,$Vl),o($VD,$Vm),o($VD,$V21),o($VD,$Vn),o($VD,$Vo),o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:2793,122:$VU2,149:$VV2,190:$VW2}),o($Vo2,$Vn2,{85:2215,193:2216,84:2794,191:$Vf7}),o($Vt1,$Vq2,{100:1637,96:2795,102:$VA6,103:$VO,104:$VP,105:$VQ}),o($Ve2,$Vr2),o($Ve2,$V03),o($VD,$Vr3),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:2796,194:[1,2797]}),{19:$VM3,21:$VN3,22:626,130:2798,200:$VO3,215:629,216:$VP3},o($VD,$VQ3),o($Vt1,$VK3),o($VD,$VL3,{31:2799,194:[1,2800]}),{19:$VM3,21:$VN3,22:626,130:2801,200:$VO3,215:629,216:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{101:[1,2802]},o($VA1,$VT1),{101:[1,2804],107:2803,109:[1,2805],110:[1,2806],111:2807,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,2808]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:2809,194:[1,2810]}),{19:$VM3,21:$VN3,22:626,130:2811,200:$VO3,215:629,216:$VP3},o($VA1,$VW3),{122:[1,2812]},{19:[1,2815],21:[1,2818],22:2814,88:2813,215:2816,216:[1,2817]},o($Vo2,$Vn2,{85:2253,193:2254,84:2819,191:$Vh7}),o($VD,$Vy2),o($VD,$V01),o($VD,$V11),o($VD,$Vl),o($VD,$Vm),o($VD,$V21),o($VD,$Vn),o($VD,$Vo),o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:2820,122:$VU2,149:$VV2,190:$VW2}),o($Vo2,$Vn2,{85:2253,193:2254,84:2821,191:$Vh7}),o($Vt1,$Vq2,{100:1684,96:2822,102:$VB6,103:$VO,104:$VP,105:$VQ}),o($Ve2,$Vr2),o($Ve2,$V03),o($VD,$Vr3),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:2823,194:[1,2824]}),{19:$VM3,21:$VN3,22:626,130:2825,200:$VO3,215:629,216:$VP3},o($VD,$VQ3),o($Vt1,$VK3),o($VD,$VL3,{31:2826,194:[1,2827]}),{19:$VM3,21:$VN3,22:626,130:2828,200:$VO3,215:629,216:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{101:[1,2829]},o($VA1,$VT1),{101:[1,2831],107:2830,109:[1,2832],110:[1,2833],111:2834,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,2835]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:2836,194:[1,2837]}),{19:$VM3,21:$VN3,22:626,130:2838,200:$VO3,215:629,216:$VP3},o($VA1,$VW3),{122:[1,2839]},{19:[1,2842],21:[1,2845],22:2841,88:2840,215:2843,216:[1,2844]},o($Vm2,$V31),o($Vm2,$V41),o($Vm2,$V51),o($Vr1,$Vr5),o($Vr1,$Vs5),{19:$VC6,21:$VD6,22:2847,88:2846,215:1719,216:$VE6},o($Vo2,$V31),o($Vo2,$V41),o($Vo2,$V51),o($Vt1,$Vr5),o($Vt1,$Vs5),{19:$VF6,21:$VG6,22:2849,88:2848,215:1745,216:$VH6},o($VA1,$VX5),o($VA1,$VK1),o($VA1,$Vl),o($VA1,$Vm),o($VA1,$Vn),o($VA1,$Vo),o($Vx2,$V31),o($Vx2,$V41),o($Vx2,$V51),o($VD1,$Vr5),o($VD1,$Vs5),{19:$VI6,21:$VJ6,22:2851,88:2850,215:1772,216:$VK6},o($VD,$Va2),o($VD,$Vb2),o($VD,$Vv1),o($VD,$Vw1),o($Vt1,$Vs1,{83:2852}),o($VD,$VE1),o($VD,$VF1),{19:[1,2856],21:[1,2860],22:2854,34:2853,201:2855,215:2857,216:[1,2859],217:[1,2858]},{120:[1,2861],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($VD,$Vc2),o($VD,$Vd2),o($Vt1,$Vs1,{83:2862}),o($Ve2,$Vy1,{94:2863}),o($Vt1,$Vz1,{100:2313,96:2864,102:$Vj7,103:$VO,104:$VP,105:$VQ}),o($Ve2,$VG1),o($Ve2,$VH1),o($Ve2,$VI1),o($Ve2,$VJ1),{101:[1,2865]},o($Ve2,$VT1),{71:[1,2866]},o($Vm2,$Vn2,{84:2867,85:2868,193:2869,191:[1,2870]}),o($Vo2,$Vn2,{84:2871,85:2872,193:2873,191:$V$7}),o($Vr1,$Vq2,{100:1822,96:2875,102:$VL6,103:$VO,104:$VP,105:$VQ}),o($Vx1,$Vr2),o($Vt1,$Vs2,{91:2876,96:2877,92:2878,100:2879,106:2881,108:2882,102:$V08,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vt1,$Vu2,{91:2876,96:2877,92:2878,100:2879,106:2881,108:2882,102:$V08,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vt1,$Vv2,{91:2876,96:2877,92:2878,100:2879,106:2881,108:2882,102:$V08,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VN1,$Vw2),o($Vx2,$Vn2,{84:2883,85:2884,193:2885,191:[1,2886]}),o($Vu1,$Vy2),o($Vu1,$V01),o($Vu1,$V11),o($Vu1,$Vl),o($Vu1,$Vm),o($Vu1,$V21),o($Vu1,$Vn),o($Vu1,$Vo),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,2887],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:2888,122:$VU2,149:$VV2,190:$VW2}),o($Vx1,$V03),o($VN1,$V13),o($VN1,$V23),o($VN1,$V33),o($VN1,$V43),{112:[1,2889]},o($VN1,$V93),o($Vt1,$Vt5),{194:[1,2892],195:2890,196:[1,2891]},o($Vr1,$V86),o($Vr1,$V96),o($Vr1,$Va6),o($Vr1,$Vl),o($Vr1,$Vm),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$V04),o($Vr1,$V14,{203:2893,204:2894,112:[1,2895]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Vb6,$V53),o($Vb6,$V63),o($Vb6,$V73),o($Vb6,$V83),{194:[1,2898],195:2896,196:[1,2897]},o($Vt1,$V86),o($Vt1,$V96),o($Vt1,$Va6),o($Vt1,$Vl),o($Vt1,$Vm),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$V04),o($Vt1,$V14,{203:2899,204:2900,112:[1,2901]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vc6,$V53),o($Vc6,$V63),o($Vc6,$V73),o($Vc6,$V83),{19:[1,2904],21:[1,2907],22:2903,88:2902,215:2905,216:[1,2906]},{194:[1,2910],195:2908,196:[1,2909]},o($VD1,$V86),o($VD1,$V96),o($VD1,$Va6),o($VD1,$Vl),o($VD1,$Vm),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$V04),o($VD1,$V14,{203:2911,204:2912,112:[1,2913]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vd6,$V53),o($Vd6,$V63),o($Vd6,$V73),o($Vd6,$V83),o($Vt1,$Vt5),{194:[1,2916],195:2914,196:[1,2915]},o($Vr1,$V86),o($Vr1,$V96),o($Vr1,$Va6),o($Vr1,$Vl),o($Vr1,$Vm),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$V04),o($Vr1,$V14,{203:2917,204:2918,112:[1,2919]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Vb6,$V53),o($Vb6,$V63),o($Vb6,$V73),o($Vb6,$V83),{194:[1,2922],195:2920,196:[1,2921]},o($Vt1,$V86),o($Vt1,$V96),o($Vt1,$Va6),o($Vt1,$Vl),o($Vt1,$Vm),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$V04),o($Vt1,$V14,{203:2923,204:2924,112:[1,2925]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vc6,$V53),o($Vc6,$V63),o($Vc6,$V73),o($Vc6,$V83),{19:[1,2928],21:[1,2931],22:2927,88:2926,215:2929,216:[1,2930]},{194:[1,2934],195:2932,196:[1,2933]},o($VD1,$V86),o($VD1,$V96),o($VD1,$Va6),o($VD1,$Vl),o($VD1,$Vm),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$V04),o($VD1,$V14,{203:2935,204:2936,112:[1,2937]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vd6,$V53),o($Vd6,$V63),o($Vd6,$V73),o($Vd6,$V83),o($VM4,$V31),o($VM4,$V41),o($VM4,$V51),o($Vx3,$Vr5),o($Vx3,$Vs5),{19:$VM6,21:$VN6,22:2939,88:2938,215:1890,216:$VO6},o($VN4,$V31),o($VN4,$V41),o($VN4,$V51),o($Vy3,$Vr5),o($Vy3,$Vs5),{19:$VP6,21:$VQ6,22:2941,88:2940,215:1916,216:$VR6},o($VP4,$V31),o($VP4,$V41),o($VP4,$V51),o($Vz3,$Vr5),o($Vz3,$Vs5),{19:$VS6,21:$VT6,22:2943,88:2942,215:1942,216:$VU6},o($VB3,$VX5),o($VB3,$VK1),o($VB3,$Vl),o($VB3,$Vm),o($VB3,$Vn),o($VB3,$Vo),o($Vt3,$Va1),o($VF,$VG,{66:2944,68:2945,73:2946,40:2947,79:2948,119:2952,52:$Vb1,54:$Vb1,71:$Vb1,80:[1,2949],81:[1,2950],82:[1,2951]}),o($Vt3,$Vf1),o($Vt3,$Vg1,{69:2953,65:2954,74:2955,93:2956,95:2957,96:2961,100:2962,97:[1,2958],98:[1,2959],99:[1,2960],102:$V18,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:2964,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($Vt3,$Vq1),o($Vx3,$Vs1,{83:2965}),o($Vy3,$Vs1,{83:2966}),o($V56,$Vv1),o($V56,$Vw1),o($VA3,$Vy1,{94:2967}),o($Vx3,$Vz1,{100:2554,96:2968,102:$VF7,103:$VO,104:$VP,105:$VQ}),o($VB3,$VB1,{87:2969}),o($VB3,$VB1,{87:2970}),o($VB3,$VB1,{87:2971}),o($Vy3,$VC1,{106:2558,108:2559,92:2972,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vz3,$Vs1,{83:2973}),o($V56,$VE1),o($V56,$VF1),{19:[1,2977],21:[1,2981],22:2975,34:2974,201:2976,215:2978,216:[1,2980],217:[1,2979]},o($VA3,$VG1),o($VA3,$VH1),o($VA3,$VI1),o($VA3,$VJ1),o($VB3,$VK1),o($VL1,$VM1,{163:2982}),o($VC3,$VO1),{120:[1,2983],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},{101:[1,2984]},o($VA3,$VT1),o($VB3,$Vl),o($VB3,$Vm),{101:[1,2986],107:2985,109:[1,2987],110:[1,2988],111:2989,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,2990]},o($VB3,$Vn),o($VB3,$Vo),o($Vt3,$VV3),{122:[1,2991]},o($Vt3,$VJ3),o($VL4,$VR3),o($VM4,$VX4),{19:$Vg,21:$Vh,22:2992,215:38,216:$Vi},{19:$V28,21:$V38,22:2994,101:[1,3005],109:[1,3006],110:[1,3007],111:3004,182:2995,192:2993,197:2998,198:2999,199:3000,202:3003,205:[1,3008],206:[1,3009],207:[1,3014],208:[1,3015],209:[1,3016],210:[1,3017],211:[1,3010],212:[1,3011],213:[1,3012],214:[1,3013],215:2997,216:$V48},o($VN4,$VX4),{19:$Vg,21:$Vh,22:3018,215:38,216:$Vi},{19:$V58,21:$V68,22:3020,101:[1,3031],109:[1,3032],110:[1,3033],111:3030,182:3021,192:3019,197:3024,198:3025,199:3026,202:3029,205:[1,3034],206:[1,3035],207:[1,3040],208:[1,3041],209:[1,3042],210:[1,3043],211:[1,3036],212:[1,3037],213:[1,3038],214:[1,3039],215:3023,216:$V78},o($VB3,$V03),o($VB3,$V13),o($VB3,$V23),o($VB3,$V33),o($VB3,$V43),{112:[1,3044]},o($VB3,$V93),o($VP4,$VX4),{19:$Vg,21:$Vh,22:3045,215:38,216:$Vi},{19:$V88,21:$V98,22:3047,101:[1,3058],109:[1,3059],110:[1,3060],111:3057,182:3048,192:3046,197:3051,198:3052,199:3053,202:3056,205:[1,3061],206:[1,3062],207:[1,3067],208:[1,3068],209:[1,3069],210:[1,3070],211:[1,3063],212:[1,3064],213:[1,3065],214:[1,3066],215:3050,216:$Va8},o($Vz3,$Vt5),o($VC3,$VX5),o($VC3,$VK1),o($VC3,$Vl),o($VC3,$Vm),o($VC3,$Vn),o($VC3,$Vo),o($Vt3,$VV3),{122:[1,3071]},o($Vt3,$VJ3),o($VL4,$VR3),o($VM4,$VX4),{19:$Vg,21:$Vh,22:3072,215:38,216:$Vi},{19:$Vb8,21:$Vc8,22:3074,101:[1,3085],109:[1,3086],110:[1,3087],111:3084,182:3075,192:3073,197:3078,198:3079,199:3080,202:3083,205:[1,3088],206:[1,3089],207:[1,3094],208:[1,3095],209:[1,3096],210:[1,3097],211:[1,3090],212:[1,3091],213:[1,3092],214:[1,3093],215:3077,216:$Vd8},o($VN4,$VX4),{19:$Vg,21:$Vh,22:3098,215:38,216:$Vi},{19:$Ve8,21:$Vf8,22:3100,101:[1,3111],109:[1,3112],110:[1,3113],111:3110,182:3101,192:3099,197:3104,198:3105,199:3106,202:3109,205:[1,3114],206:[1,3115],207:[1,3120],208:[1,3121],209:[1,3122],210:[1,3123],211:[1,3116],212:[1,3117],213:[1,3118],214:[1,3119],215:3103,216:$Vg8},o($VB3,$V03),o($VB3,$V13),o($VB3,$V23),o($VB3,$V33),o($VB3,$V43),{112:[1,3124]},o($VB3,$V93),o($VP4,$VX4),{19:$Vg,21:$Vh,22:3125,215:38,216:$Vi},{19:$Vh8,21:$Vi8,22:3127,101:[1,3138],109:[1,3139],110:[1,3140],111:3137,182:3128,192:3126,197:3131,198:3132,199:3133,202:3136,205:[1,3141],206:[1,3142],207:[1,3147],208:[1,3148],209:[1,3149],210:[1,3150],211:[1,3143],212:[1,3144],213:[1,3145],214:[1,3146],215:3130,216:$Vj8},o($Vz3,$Vt5),o($VC3,$VX5),o($VC3,$VK1),o($VC3,$Vl),o($VC3,$Vm),o($VC3,$Vn),o($VC3,$Vo),o($Vk8,$Vn2,{84:3151,85:3152,193:3153,191:$Vl8}),o($V57,$Vm8),o($Vp,$Vq,{56:3155,60:3156,42:3157,45:$Vr}),o($V77,$Vn8),o($Vp,$Vq,{60:3158,42:3159,45:$Vr}),o($V77,$Vo8),o($V77,$Vp8),o($V77,$VU5),o($V77,$VV5),{120:[1,3160],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($V77,$VE1),o($V77,$VF1),{19:[1,3164],21:[1,3168],22:3162,34:3161,201:3163,215:3165,216:[1,3167],217:[1,3166]},o($V77,$Vq8),o($V77,$Vx6),o($Vr8,$Vy1,{94:3169}),o($V77,$Vz1,{100:2637,96:3170,102:$VQ7,103:$VO,104:$VP,105:$VQ}),o($Vr8,$VG1),o($Vr8,$VH1),o($Vr8,$VI1),o($Vr8,$VJ1),{101:[1,3171]},o($Vr8,$VT1),{71:[1,3172]},o($VT7,$Vq2,{100:2083,96:3173,102:$V97,103:$VO,104:$VP,105:$VQ}),o($VS7,$Vr2),o($V77,$Vs2,{91:3174,96:3175,92:3176,100:3177,106:3179,108:3180,102:$Vs8,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($V77,$Vu2,{91:3174,96:3175,92:3176,100:3177,106:3179,108:3180,102:$Vs8,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($V77,$Vv2,{91:3174,96:3175,92:3176,100:3177,106:3179,108:3180,102:$Vs8,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VW7,$Vw2),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,3181],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:3182,122:$VU2,149:$VV2,190:$VW2}),o($VV7,$Vy2),o($VV7,$V01),o($VV7,$V11),o($VV7,$Vl),o($VV7,$Vm),o($VV7,$V21),o($VV7,$Vn),o($VV7,$Vo),o($VS7,$V03),o($VW7,$V13),o($VW7,$V23),o($VW7,$V33),o($VW7,$V43),{112:[1,3183]},o($VW7,$V93),o($Vk8,$Vn2,{85:3152,193:3153,84:3184,191:$Vl8}),o($Vt8,$V_6,{153:3185,154:3186,157:$Vu8,158:$Vv8,159:$Vw8,160:$Vx8}),o($Vy8,$V47),o($Vz8,$V67,{57:3191}),o($VA8,$V87,{61:3192}),o($VF,$VG,{64:3193,74:3194,76:3195,77:3196,93:3199,95:3200,88:3202,89:3203,90:3204,79:3205,40:3206,96:3210,22:3211,92:3213,119:3214,100:3218,215:3221,106:3222,108:3223,19:[1,3220],21:[1,3225],70:[1,3197],72:[1,3198],80:[1,3215],81:[1,3216],82:[1,3217],86:[1,3201],97:[1,3207],98:[1,3208],99:[1,3209],102:$VB8,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:[1,3212],216:[1,3224]}),o($Vt8,$V_6,{154:3186,153:3226,157:$Vu8,158:$Vv8,159:$Vw8,160:$Vx8}),o($Vs4,$Vu6),o($Vp,$Vq,{224:3227,42:3228,45:$Vr}),o($Vs4,$Vv6),o($Vs4,$VU5),o($Vs4,$VV5),{120:[1,3229],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($Vs4,$VE1),o($Vs4,$VF1),{19:[1,3233],21:[1,3237],22:3231,34:3230,201:3232,215:3234,216:[1,3236],217:[1,3235]},o($Vs4,$Vw6),o($Vs4,$Vx6),o($Vy6,$Vy1,{94:3238}),o($Vs4,$Vz1,{100:2687,96:3239,102:$VX7,103:$VO,104:$VP,105:$VQ}),o($Vy6,$VG1),o($Vy6,$VH1),o($Vy6,$VI1),o($Vy6,$VJ1),{101:[1,3240]},o($Vy6,$VT1),{71:[1,3241]},o($Vs4,$Vs2,{91:3242,96:3243,92:3244,100:3245,106:3247,108:3248,102:$VC8,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vs4,$Vu2,{91:3242,96:3243,92:3244,100:3245,106:3247,108:3248,102:$VC8,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vs4,$Vv2,{91:3242,96:3243,92:3244,100:3245,106:3247,108:3248,102:$VC8,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VW5,$Vw2),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,3249],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:3250,122:$VU2,149:$VV2,190:$VW2}),o($VT5,$Vy2),o($VT5,$V01),o($VT5,$V11),o($VT5,$Vl),o($VT5,$Vm),o($VT5,$V21),o($VT5,$Vn),o($VT5,$Vo),o($VW5,$V13),o($VW5,$V23),o($VW5,$V33),o($VW5,$V43),{112:[1,3251]},o($VW5,$V93),o($Vs4,$Vv6),o($Vs4,$VU5),o($Vs4,$VV5),{120:[1,3252],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($Vs4,$VE1),o($Vs4,$VF1),{19:[1,3256],21:[1,3260],22:3254,34:3253,201:3255,215:3257,216:[1,3259],217:[1,3258]},o($Vs4,$Vw6),o($Vs4,$Vx6),o($Vy6,$Vy1,{94:3261}),o($Vs4,$Vz1,{100:2725,96:3262,102:$VY7,103:$VO,104:$VP,105:$VQ}),o($Vy6,$VG1),o($Vy6,$VH1),o($Vy6,$VI1),o($Vy6,$VJ1),{101:[1,3263]},o($Vy6,$VT1),{71:[1,3264]},o($Vs4,$Vs2,{91:3265,96:3266,92:3267,100:3268,106:3270,108:3271,102:$VD8,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vs4,$Vu2,{91:3265,96:3266,92:3267,100:3268,106:3270,108:3271,102:$VD8,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vs4,$Vv2,{91:3265,96:3266,92:3267,100:3268,106:3270,108:3271,102:$VD8,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VW5,$Vw2),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,3272],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:3273,122:$VU2,149:$VV2,190:$VW2}),o($VT5,$Vy2),o($VT5,$V01),o($VT5,$V11),o($VT5,$Vl),o($VT5,$Vm),o($VT5,$V21),o($VT5,$Vn),o($VT5,$Vo),o($VW5,$V13),o($VW5,$V23),o($VW5,$V33),o($VW5,$V43),{112:[1,3274]},o($VW5,$V93),o($Vs4,$Vt5),{19:[1,3277],21:[1,3280],22:3276,88:3275,215:3278,216:[1,3279]},o($VY5,$V31),o($VY5,$V41),o($VY5,$V51),o($VC4,$Vr5),o($VC4,$Vs5),{19:$Vc7,21:$Vd7,22:3282,88:3281,215:2172,216:$Ve7},o($VD,$Va1),o($VD,$Vb1,{66:3283,68:3284,73:3285,40:3286,79:3287,119:3291,80:[1,3288],81:[1,3289],82:[1,3290],120:$VG,126:$VG,128:$VG,190:$VG,228:$VG}),o($VD,$Vf1),o($VD,$Vg1,{69:3292,65:3293,74:3294,93:3295,95:3296,96:3300,100:3301,97:[1,3297],98:[1,3298],99:[1,3299],102:$VE8,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:3303,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($VD,$Vq1),o($Vr1,$Vs1,{83:3304}),o($Vt1,$Vs1,{83:3305}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{94:3306}),o($Vr1,$Vz1,{100:2784,96:3307,102:$V_7,103:$VO,104:$VP,105:$VQ}),o($VA1,$VB1,{87:3308}),o($VA1,$VB1,{87:3309}),o($VA1,$VB1,{87:3310}),o($Vt1,$VC1,{106:2788,108:2789,92:3311,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VD1,$Vs1,{83:3312}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,3316],21:[1,3320],22:3314,34:3313,201:3315,215:3317,216:[1,3319],217:[1,3318]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{163:3321}),o($VN1,$VO1),{120:[1,3322],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},{101:[1,3323]},o($Vx1,$VT1),o($VA1,$Vl),o($VA1,$Vm),{101:[1,3325],107:3324,109:[1,3326],110:[1,3327],111:3328,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,3329]},o($VA1,$Vn),o($VA1,$Vo),o($VD,$VV3),{122:[1,3330]},o($VD,$VJ3),o($Ve2,$VR3),o($Vm2,$VX4),{19:$Vg,21:$Vh,22:3331,215:38,216:$Vi},{19:$VF8,21:$VG8,22:3333,101:[1,3344],109:[1,3345],110:[1,3346],111:3343,182:3334,192:3332,197:3337,198:3338,199:3339,202:3342,205:[1,3347],206:[1,3348],207:[1,3353],208:[1,3354],209:[1,3355],210:[1,3356],211:[1,3349],212:[1,3350],213:[1,3351],214:[1,3352],215:3336,216:$VH8},o($Vo2,$VX4),{19:$Vg,21:$Vh,22:3357,215:38,216:$Vi},{19:$VI8,21:$VJ8,22:3359,101:[1,3370],109:[1,3371],110:[1,3372],111:3369,182:3360,192:3358,197:3363,198:3364,199:3365,202:3368,205:[1,3373],206:[1,3374],207:[1,3379],208:[1,3380],209:[1,3381],210:[1,3382],211:[1,3375],212:[1,3376],213:[1,3377],214:[1,3378],215:3362,216:$VK8},o($VA1,$V03),o($VA1,$V13),o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),{112:[1,3383]},o($VA1,$V93),o($Vx2,$VX4),{19:$Vg,21:$Vh,22:3384,215:38,216:$Vi},{19:$VL8,21:$VM8,22:3386,101:[1,3397],109:[1,3398],110:[1,3399],111:3396,182:3387,192:3385,197:3390,198:3391,199:3392,202:3395,205:[1,3400],206:[1,3401],207:[1,3406],208:[1,3407],209:[1,3408],210:[1,3409],211:[1,3402],212:[1,3403],213:[1,3404],214:[1,3405],215:3389,216:$VN8},o($VD1,$Vt5),o($VN1,$VX5),o($VN1,$VK1),o($VN1,$Vl),o($VN1,$Vm),o($VN1,$Vn),o($VN1,$Vo),o($VD,$VV3),{122:[1,3410]},o($VD,$VJ3),o($Ve2,$VR3),o($Vm2,$VX4),{19:$Vg,21:$Vh,22:3411,215:38,216:$Vi},{19:$VO8,21:$VP8,22:3413,101:[1,3424],109:[1,3425],110:[1,3426],111:3423,182:3414,192:3412,197:3417,198:3418,199:3419,202:3422,205:[1,3427],206:[1,3428],207:[1,3433],208:[1,3434],209:[1,3435],210:[1,3436],211:[1,3429],212:[1,3430],213:[1,3431],214:[1,3432],215:3416,216:$VQ8},o($Vo2,$VX4),{19:$Vg,21:$Vh,22:3437,215:38,216:$Vi},{19:$VR8,21:$VS8,22:3439,101:[1,3450],109:[1,3451],110:[1,3452],111:3449,182:3440,192:3438,197:3443,198:3444,199:3445,202:3448,205:[1,3453],206:[1,3454],207:[1,3459],208:[1,3460],209:[1,3461],210:[1,3462],211:[1,3455],212:[1,3456],213:[1,3457],214:[1,3458],215:3442,216:$VT8},o($VA1,$V03),o($VA1,$V13),o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),{112:[1,3463]},o($VA1,$V93),o($Vx2,$VX4),{19:$Vg,21:$Vh,22:3464,215:38,216:$Vi},{19:$VU8,21:$VV8,22:3466,101:[1,3477],109:[1,3478],110:[1,3479],111:3476,182:3467,192:3465,197:3470,198:3471,199:3472,202:3475,205:[1,3480],206:[1,3481],207:[1,3486],208:[1,3487],209:[1,3488],210:[1,3489],211:[1,3482],212:[1,3483],213:[1,3484],214:[1,3485],215:3469,216:$VW8},o($VD1,$Vt5),o($VN1,$VX5),o($VN1,$VK1),o($VN1,$Vl),o($VN1,$Vm),o($VN1,$Vn),o($VN1,$Vo),o($Vr1,$Vi6),o($Vr1,$VK1),o($Vt1,$Vi6),o($Vt1,$VK1),o($VD1,$Vi6),o($VD1,$VK1),o($Vo2,$Vn2,{85:2872,193:2873,84:3490,191:$V$7}),o($VD,$Vy2),o($VD,$V01),o($VD,$V11),o($VD,$Vl),o($VD,$Vm),o($VD,$V21),o($VD,$Vn),o($VD,$Vo),o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:3491,122:$VU2,149:$VV2,190:$VW2}),o($Vo2,$Vn2,{85:2872,193:2873,84:3492,191:$V$7}),o($Vt1,$Vq2,{100:2313,96:3493,102:$Vj7,103:$VO,104:$VP,105:$VQ}),o($Ve2,$Vr2),o($Ve2,$V03),o($VD,$Vr3),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:3494,194:[1,3495]}),{19:$VM3,21:$VN3,22:626,130:3496,200:$VO3,215:629,216:$VP3},o($VD,$VQ3),o($Vt1,$VK3),o($VD,$VL3,{31:3497,194:[1,3498]}),{19:$VM3,21:$VN3,22:626,130:3499,200:$VO3,215:629,216:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{101:[1,3500]},o($VA1,$VT1),{101:[1,3502],107:3501,109:[1,3503],110:[1,3504],111:3505,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,3506]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:3507,194:[1,3508]}),{19:$VM3,21:$VN3,22:626,130:3509,200:$VO3,215:629,216:$VP3},o($VA1,$VW3),{122:[1,3510]},{19:[1,3513],21:[1,3516],22:3512,88:3511,215:3514,216:[1,3515]},o($Vm2,$V31),o($Vm2,$V41),o($Vm2,$V51),o($Vr1,$Vr5),o($Vr1,$Vs5),{19:$Vk7,21:$Vl7,22:3518,88:3517,215:2348,216:$Vm7},o($Vo2,$V31),o($Vo2,$V41),o($Vo2,$V51),o($Vt1,$Vr5),o($Vt1,$Vs5),{19:$Vn7,21:$Vo7,22:3520,88:3519,215:2374,216:$Vp7},o($VA1,$VX5),o($VA1,$VK1),o($VA1,$Vl),o($VA1,$Vm),o($VA1,$Vn),o($VA1,$Vo),o($Vx2,$V31),o($Vx2,$V41),o($Vx2,$V51),o($VD1,$Vr5),o($VD1,$Vs5),{19:$Vq7,21:$Vr7,22:3522,88:3521,215:2401,216:$Vs7},o($Vm2,$V31),o($Vm2,$V41),o($Vm2,$V51),o($Vr1,$Vr5),o($Vr1,$Vs5),{19:$Vt7,21:$Vu7,22:3524,88:3523,215:2428,216:$Vv7},o($Vo2,$V31),o($Vo2,$V41),o($Vo2,$V51),o($Vt1,$Vr5),o($Vt1,$Vs5),{19:$Vw7,21:$Vx7,22:3526,88:3525,215:2454,216:$Vy7},o($VA1,$VX5),o($VA1,$VK1),o($VA1,$Vl),o($VA1,$Vm),o($VA1,$Vn),o($VA1,$Vo),o($Vx2,$V31),o($Vx2,$V41),o($Vx2,$V51),o($VD1,$Vr5),o($VD1,$Vs5),{19:$Vz7,21:$VA7,22:3528,88:3527,215:2481,216:$VB7},o($Vx3,$Vi6),o($Vx3,$VK1),o($Vy3,$Vi6),o($Vy3,$VK1),o($Vz3,$Vi6),o($Vz3,$VK1),o($Vt3,$Va2),o($Vt3,$Vb2),o($Vt3,$Vv1),o($Vt3,$Vw1),o($Vy3,$Vs1,{83:3529}),o($Vt3,$VE1),o($Vt3,$VF1),{19:[1,3533],21:[1,3537],22:3531,34:3530,201:3532,215:3534,216:[1,3536],217:[1,3535]},{120:[1,3538],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($Vt3,$Vc2),o($Vt3,$Vd2),o($Vy3,$Vs1,{83:3539}),o($VL4,$Vy1,{94:3540}),o($Vy3,$Vz1,{100:2962,96:3541,102:$V18,103:$VO,104:$VP,105:$VQ}),o($VL4,$VG1),o($VL4,$VH1),o($VL4,$VI1),o($VL4,$VJ1),{101:[1,3542]},o($VL4,$VT1),{71:[1,3543]},o($VM4,$Vn2,{84:3544,85:3545,193:3546,191:[1,3547]}),o($VN4,$Vn2,{84:3548,85:3549,193:3550,191:$VX8}),o($Vx3,$Vq2,{100:2554,96:3552,102:$VF7,103:$VO,104:$VP,105:$VQ}),o($VA3,$Vr2),o($Vy3,$Vs2,{91:3553,96:3554,92:3555,100:3556,106:3558,108:3559,102:$VY8,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vy3,$Vu2,{91:3553,96:3554,92:3555,100:3556,106:3558,108:3559,102:$VY8,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vy3,$Vv2,{91:3553,96:3554,92:3555,100:3556,106:3558,108:3559,102:$VY8,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VC3,$Vw2),o($VP4,$Vn2,{84:3560,85:3561,193:3562,191:[1,3563]}),o($V56,$Vy2),o($V56,$V01),o($V56,$V11),o($V56,$Vl),o($V56,$Vm),o($V56,$V21),o($V56,$Vn),o($V56,$Vo),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,3564],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:3565,122:$VU2,149:$VV2,190:$VW2}),o($VA3,$V03),o($VC3,$V13),o($VC3,$V23),o($VC3,$V33),o($VC3,$V43),{112:[1,3566]},o($VC3,$V93),o($Vy3,$Vt5),{194:[1,3569],195:3567,196:[1,3568]},o($Vx3,$V86),o($Vx3,$V96),o($Vx3,$Va6),o($Vx3,$Vl),o($Vx3,$Vm),o($Vx3,$VZ3),o($Vx3,$V_3),o($Vx3,$V$3),o($Vx3,$Vn),o($Vx3,$Vo),o($Vx3,$V04),o($Vx3,$V14,{203:3570,204:3571,112:[1,3572]}),o($Vx3,$V24),o($Vx3,$V34),o($Vx3,$V44),o($Vx3,$V54),o($Vx3,$V64),o($Vx3,$V74),o($Vx3,$V84),o($Vx3,$V94),o($Vx3,$Va4),o($VC7,$V53),o($VC7,$V63),o($VC7,$V73),o($VC7,$V83),{194:[1,3575],195:3573,196:[1,3574]},o($Vy3,$V86),o($Vy3,$V96),o($Vy3,$Va6),o($Vy3,$Vl),o($Vy3,$Vm),o($Vy3,$VZ3),o($Vy3,$V_3),o($Vy3,$V$3),o($Vy3,$Vn),o($Vy3,$Vo),o($Vy3,$V04),o($Vy3,$V14,{203:3576,204:3577,112:[1,3578]}),o($Vy3,$V24),o($Vy3,$V34),o($Vy3,$V44),o($Vy3,$V54),o($Vy3,$V64),o($Vy3,$V74),o($Vy3,$V84),o($Vy3,$V94),o($Vy3,$Va4),o($VD7,$V53),o($VD7,$V63),o($VD7,$V73),o($VD7,$V83),{19:[1,3581],21:[1,3584],22:3580,88:3579,215:3582,216:[1,3583]},{194:[1,3587],195:3585,196:[1,3586]},o($Vz3,$V86),o($Vz3,$V96),o($Vz3,$Va6),o($Vz3,$Vl),o($Vz3,$Vm),o($Vz3,$VZ3),o($Vz3,$V_3),o($Vz3,$V$3),o($Vz3,$Vn),o($Vz3,$Vo),o($Vz3,$V04),o($Vz3,$V14,{203:3588,204:3589,112:[1,3590]}),o($Vz3,$V24),o($Vz3,$V34),o($Vz3,$V44),o($Vz3,$V54),o($Vz3,$V64),o($Vz3,$V74),o($Vz3,$V84),o($Vz3,$V94),o($Vz3,$Va4),o($VE7,$V53),o($VE7,$V63),o($VE7,$V73),o($VE7,$V83),o($Vy3,$Vt5),{194:[1,3593],195:3591,196:[1,3592]},o($Vx3,$V86),o($Vx3,$V96),o($Vx3,$Va6),o($Vx3,$Vl),o($Vx3,$Vm),o($Vx3,$VZ3),o($Vx3,$V_3),o($Vx3,$V$3),o($Vx3,$Vn),o($Vx3,$Vo),o($Vx3,$V04),o($Vx3,$V14,{203:3594,204:3595,112:[1,3596]}),o($Vx3,$V24),o($Vx3,$V34),o($Vx3,$V44),o($Vx3,$V54),o($Vx3,$V64),o($Vx3,$V74),o($Vx3,$V84),o($Vx3,$V94),o($Vx3,$Va4),o($VC7,$V53),o($VC7,$V63),o($VC7,$V73),o($VC7,$V83),{194:[1,3599],195:3597,196:[1,3598]},o($Vy3,$V86),o($Vy3,$V96),o($Vy3,$Va6),o($Vy3,$Vl),o($Vy3,$Vm),o($Vy3,$VZ3),o($Vy3,$V_3),o($Vy3,$V$3),o($Vy3,$Vn),o($Vy3,$Vo),o($Vy3,$V04),o($Vy3,$V14,{203:3600,204:3601,112:[1,3602]}),o($Vy3,$V24),o($Vy3,$V34),o($Vy3,$V44),o($Vy3,$V54),o($Vy3,$V64),o($Vy3,$V74),o($Vy3,$V84),o($Vy3,$V94),o($Vy3,$Va4),o($VD7,$V53),o($VD7,$V63),o($VD7,$V73),o($VD7,$V83),{19:[1,3605],21:[1,3608],22:3604,88:3603,215:3606,216:[1,3607]},{194:[1,3611],195:3609,196:[1,3610]},o($Vz3,$V86),o($Vz3,$V96),o($Vz3,$Va6),o($Vz3,$Vl),o($Vz3,$Vm),o($Vz3,$VZ3),o($Vz3,$V_3),o($Vz3,$V$3),o($Vz3,$Vn),o($Vz3,$Vo),o($Vz3,$V04),o($Vz3,$V14,{203:3612,204:3613,112:[1,3614]}),o($Vz3,$V24),o($Vz3,$V34),o($Vz3,$V44),o($Vz3,$V54),o($Vz3,$V64),o($Vz3,$V74),o($Vz3,$V84),o($Vz3,$V94),o($Vz3,$Va4),o($VE7,$V53),o($VE7,$V63),o($VE7,$V73),o($VE7,$V83),o($Vp4,$VZ8),o($VZ6,$VK3),o($Vp4,$VL3,{31:3615,194:[1,3616]}),{19:$VM3,21:$VN3,22:626,130:3617,200:$VO3,215:629,216:$VP3},o($V57,$V_8),o($V77,$V87,{61:3618}),o($VF,$VG,{64:3619,74:3620,76:3621,77:3622,93:3625,95:3626,88:3628,89:3629,90:3630,79:3631,40:3632,96:3636,22:3637,92:3639,119:3640,100:3644,215:3647,106:3648,108:3649,19:[1,3646],21:[1,3651],70:[1,3623],72:[1,3624],80:[1,3641],81:[1,3642],82:[1,3643],86:[1,3627],97:[1,3633],98:[1,3634],99:[1,3635],102:$V$8,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:[1,3638],216:[1,3650]}),o($V77,$V09),o($VF,$VG,{64:3652,74:3653,76:3654,77:3655,93:3658,95:3659,88:3661,89:3662,90:3663,79:3664,40:3665,96:3669,22:3670,92:3672,119:3673,100:3677,215:3680,106:3681,108:3682,19:[1,3679],21:[1,3684],70:[1,3656],72:[1,3657],80:[1,3674],81:[1,3675],82:[1,3676],86:[1,3660],97:[1,3666],98:[1,3667],99:[1,3668],102:$V19,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:[1,3671],216:[1,3683]}),o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:3685,122:$VU2,149:$VV2,190:$VW2}),o($V77,$Vy2),o($V77,$V01),o($V77,$V11),o($V77,$Vl),o($V77,$Vm),o($V77,$V21),o($V77,$Vn),o($V77,$Vo),o($V77,$Vq2,{100:2637,96:3686,102:$VQ7,103:$VO,104:$VP,105:$VQ}),o($Vr8,$Vr2),o($Vr8,$V03),o($V77,$V29),o($VS7,$VR3),o($VU7,$VS3),o($VU7,$VT3),o($VU7,$VU3),{101:[1,3687]},o($VU7,$VT1),{101:[1,3689],107:3688,109:[1,3690],110:[1,3691],111:3692,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,3693]},o($VU7,$VW3),{122:[1,3694]},{19:[1,3697],21:[1,3700],22:3696,88:3695,215:3698,216:[1,3699]},o($Vp4,$V39),o($Vt8,$Vs1,{83:3701}),o($Vt8,$VG7),o($Vt8,$VH7),o($Vt8,$VI7),o($Vt8,$VJ7),o($Vt8,$VK7),o($Vy8,$VL7,{58:3702,52:[1,3703]}),o($Vz8,$VM7,{62:3704,54:[1,3705]}),o($VA8,$VN7),o($VA8,$VO7,{75:3706,77:3707,79:3708,40:3709,119:3710,80:[1,3711],81:[1,3712],82:[1,3713],120:$VG,126:$VG,128:$VG,190:$VG,228:$VG}),o($VA8,$VP7),o($VA8,$VO5,{78:3714,74:3715,93:3716,95:3717,96:3721,100:3722,97:[1,3718],98:[1,3719],99:[1,3720],102:$V49,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:3724,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($VA8,$VR7),o($V59,$Vy1,{94:3725}),o($V69,$Vz1,{100:3218,96:3726,102:$VB8,103:$VO,104:$VP,105:$VQ}),o($V79,$VB1,{87:3727}),o($V79,$VB1,{87:3728}),o($V79,$VB1,{87:3729}),o($VA8,$VC1,{106:3222,108:3223,92:3730,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($V89,$VU5),o($V89,$VV5),o($V59,$VG1),o($V59,$VH1),o($V59,$VI1),o($V59,$VJ1),o($V79,$VK1),o($VL1,$VM1,{163:3731}),o($V99,$VO1),{120:[1,3732],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($V89,$VE1),o($V89,$VF1),{19:[1,3736],21:[1,3740],22:3734,34:3733,201:3735,215:3737,216:[1,3739],217:[1,3738]},{101:[1,3741]},o($V59,$VT1),o($V79,$Vl),o($V79,$Vm),{101:[1,3743],107:3742,109:[1,3744],110:[1,3745],111:3746,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,3747]},o($V79,$Vn),o($V79,$Vo),o($Vt8,$Vs1,{83:3748}),o($Vs4,$Va7),o($VF,$VG,{93:706,95:707,96:717,100:725,227:3749,74:3750,76:3751,77:3752,88:3756,89:3757,90:3758,79:3759,40:3760,22:3761,92:3763,119:3764,215:3769,106:3770,108:3771,19:[1,3768],21:[1,3773],70:[1,3753],72:[1,3754],80:[1,3765],81:[1,3766],82:[1,3767],86:[1,3755],97:$Vu4,98:$Vv4,99:$Vw4,102:$Vx4,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:[1,3762],216:[1,3772]}),o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:3774,122:$VU2,149:$VV2,190:$VW2}),o($Vs4,$Vy2),o($Vs4,$V01),o($Vs4,$V11),o($Vs4,$Vl),o($Vs4,$Vm),o($Vs4,$V21),o($Vs4,$Vn),o($Vs4,$Vo),o($Vs4,$Vq2,{100:2687,96:3775,102:$VX7,103:$VO,104:$VP,105:$VQ}),o($Vy6,$Vr2),o($Vy6,$V03),o($Vs4,$Vb7),o($VS5,$VS3),o($VS5,$VT3),o($VS5,$VU3),{101:[1,3776]},o($VS5,$VT1),{101:[1,3778],107:3777,109:[1,3779],110:[1,3780],111:3781,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,3782]},o($VS5,$VW3),{122:[1,3783]},{19:[1,3786],21:[1,3789],22:3785,88:3784,215:3787,216:[1,3788]},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:3790,122:$VU2,149:$VV2,190:$VW2}),o($Vs4,$Vy2),o($Vs4,$V01),o($Vs4,$V11),o($Vs4,$Vl),o($Vs4,$Vm),o($Vs4,$V21),o($Vs4,$Vn),o($Vs4,$Vo),o($Vs4,$Vq2,{100:2725,96:3791,102:$VY7,103:$VO,104:$VP,105:$VQ}),o($Vy6,$Vr2),o($Vy6,$V03),o($Vs4,$Vb7),o($VS5,$VS3),o($VS5,$VT3),o($VS5,$VU3),{101:[1,3792]},o($VS5,$VT1),{101:[1,3794],107:3793,109:[1,3795],110:[1,3796],111:3797,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,3798]},o($VS5,$VW3),{122:[1,3799]},{19:[1,3802],21:[1,3805],22:3801,88:3800,215:3803,216:[1,3804]},o($VS5,$VX5),o($VS5,$VK1),o($VS5,$Vl),o($VS5,$Vm),o($VS5,$Vn),o($VS5,$Vo),o($VC4,$Vi6),o($VC4,$VK1),o($VD,$Va2),o($VD,$Vb2),o($VD,$Vv1),o($VD,$Vw1),o($Vt1,$Vs1,{83:3806}),o($VD,$VE1),o($VD,$VF1),{19:[1,3810],21:[1,3814],22:3808,34:3807,201:3809,215:3811,216:[1,3813],217:[1,3812]},{120:[1,3815],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($VD,$Vc2),o($VD,$Vd2),o($Vt1,$Vs1,{83:3816}),o($Ve2,$Vy1,{94:3817}),o($Vt1,$Vz1,{100:3301,96:3818,102:$VE8,103:$VO,104:$VP,105:$VQ}),o($Ve2,$VG1),o($Ve2,$VH1),o($Ve2,$VI1),o($Ve2,$VJ1),{101:[1,3819]},o($Ve2,$VT1),{71:[1,3820]},o($Vm2,$Vn2,{84:3821,85:3822,193:3823,191:[1,3824]}),o($Vo2,$Vn2,{84:3825,85:3826,193:3827,191:$Va9}),o($Vr1,$Vq2,{100:2784,96:3829,102:$V_7,103:$VO,104:$VP,105:$VQ}),o($Vx1,$Vr2),o($Vt1,$Vs2,{91:3830,96:3831,92:3832,100:3833,106:3835,108:3836,102:$Vb9,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vt1,$Vu2,{91:3830,96:3831,92:3832,100:3833,106:3835,108:3836,102:$Vb9,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vt1,$Vv2,{91:3830,96:3831,92:3832,100:3833,106:3835,108:3836,102:$Vb9,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VN1,$Vw2),o($Vx2,$Vn2,{84:3837,85:3838,193:3839,191:[1,3840]}),o($Vu1,$Vy2),o($Vu1,$V01),o($Vu1,$V11),o($Vu1,$Vl),o($Vu1,$Vm),o($Vu1,$V21),o($Vu1,$Vn),o($Vu1,$Vo),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,3841],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:3842,122:$VU2,149:$VV2,190:$VW2}),o($Vx1,$V03),o($VN1,$V13),o($VN1,$V23),o($VN1,$V33),o($VN1,$V43),{112:[1,3843]},o($VN1,$V93),o($Vt1,$Vt5),{194:[1,3846],195:3844,196:[1,3845]},o($Vr1,$V86),o($Vr1,$V96),o($Vr1,$Va6),o($Vr1,$Vl),o($Vr1,$Vm),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$V04),o($Vr1,$V14,{203:3847,204:3848,112:[1,3849]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Vb6,$V53),o($Vb6,$V63),o($Vb6,$V73),o($Vb6,$V83),{194:[1,3852],195:3850,196:[1,3851]},o($Vt1,$V86),o($Vt1,$V96),o($Vt1,$Va6),o($Vt1,$Vl),o($Vt1,$Vm),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$V04),o($Vt1,$V14,{203:3853,204:3854,112:[1,3855]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vc6,$V53),o($Vc6,$V63),o($Vc6,$V73),o($Vc6,$V83),{19:[1,3858],21:[1,3861],22:3857,88:3856,215:3859,216:[1,3860]},{194:[1,3864],195:3862,196:[1,3863]},o($VD1,$V86),o($VD1,$V96),o($VD1,$Va6),o($VD1,$Vl),o($VD1,$Vm),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$V04),o($VD1,$V14,{203:3865,204:3866,112:[1,3867]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vd6,$V53),o($Vd6,$V63),o($Vd6,$V73),o($Vd6,$V83),o($Vt1,$Vt5),{194:[1,3870],195:3868,196:[1,3869]},o($Vr1,$V86),o($Vr1,$V96),o($Vr1,$Va6),o($Vr1,$Vl),o($Vr1,$Vm),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$V04),o($Vr1,$V14,{203:3871,204:3872,112:[1,3873]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Vb6,$V53),o($Vb6,$V63),o($Vb6,$V73),o($Vb6,$V83),{194:[1,3876],195:3874,196:[1,3875]},o($Vt1,$V86),o($Vt1,$V96),o($Vt1,$Va6),o($Vt1,$Vl),o($Vt1,$Vm),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$V04),o($Vt1,$V14,{203:3877,204:3878,112:[1,3879]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vc6,$V53),o($Vc6,$V63),o($Vc6,$V73),o($Vc6,$V83),{19:[1,3882],21:[1,3885],22:3881,88:3880,215:3883,216:[1,3884]},{194:[1,3888],195:3886,196:[1,3887]},o($VD1,$V86),o($VD1,$V96),o($VD1,$Va6),o($VD1,$Vl),o($VD1,$Vm),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$V04),o($VD1,$V14,{203:3889,204:3890,112:[1,3891]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vd6,$V53),o($Vd6,$V63),o($Vd6,$V73),o($Vd6,$V83),o($VD,$VV3),{122:[1,3892]},o($VD,$VJ3),o($Ve2,$VR3),o($Vm2,$VX4),{19:$Vg,21:$Vh,22:3893,215:38,216:$Vi},{19:$Vc9,21:$Vd9,22:3895,101:[1,3906],109:[1,3907],110:[1,3908],111:3905,182:3896,192:3894,197:3899,198:3900,199:3901,202:3904,205:[1,3909],206:[1,3910],207:[1,3915],208:[1,3916],209:[1,3917],210:[1,3918],211:[1,3911],212:[1,3912],213:[1,3913],214:[1,3914],215:3898,216:$Ve9},o($Vo2,$VX4),{19:$Vg,21:$Vh,22:3919,215:38,216:$Vi},{19:$Vf9,21:$Vg9,22:3921,101:[1,3932],109:[1,3933],110:[1,3934],111:3931,182:3922,192:3920,197:3925,198:3926,199:3927,202:3930,205:[1,3935],206:[1,3936],207:[1,3941],208:[1,3942],209:[1,3943],210:[1,3944],211:[1,3937],212:[1,3938],213:[1,3939],214:[1,3940],215:3924,216:$Vh9},o($VA1,$V03),o($VA1,$V13),o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),{112:[1,3945]},o($VA1,$V93),o($Vx2,$VX4),{19:$Vg,21:$Vh,22:3946,215:38,216:$Vi},{19:$Vi9,21:$Vj9,22:3948,101:[1,3959],109:[1,3960],110:[1,3961],111:3958,182:3949,192:3947,197:3952,198:3953,199:3954,202:3957,205:[1,3962],206:[1,3963],207:[1,3968],208:[1,3969],209:[1,3970],210:[1,3971],211:[1,3964],212:[1,3965],213:[1,3966],214:[1,3967],215:3951,216:$Vk9},o($VD1,$Vt5),o($VN1,$VX5),o($VN1,$VK1),o($VN1,$Vl),o($VN1,$Vm),o($VN1,$Vn),o($VN1,$Vo),o($Vr1,$Vi6),o($Vr1,$VK1),o($Vt1,$Vi6),o($Vt1,$VK1),o($VD1,$Vi6),o($VD1,$VK1),o($Vr1,$Vi6),o($Vr1,$VK1),o($Vt1,$Vi6),o($Vt1,$VK1),o($VD1,$Vi6),o($VD1,$VK1),o($VN4,$Vn2,{85:3549,193:3550,84:3972,191:$VX8}),o($Vt3,$Vy2),o($Vt3,$V01),o($Vt3,$V11),o($Vt3,$Vl),o($Vt3,$Vm),o($Vt3,$V21),o($Vt3,$Vn),o($Vt3,$Vo),o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:3973,122:$VU2,149:$VV2,190:$VW2}),o($VN4,$Vn2,{85:3549,193:3550,84:3974,191:$VX8}),o($Vy3,$Vq2,{100:2962,96:3975,102:$V18,103:$VO,104:$VP,105:$VQ}),o($VL4,$Vr2),o($VL4,$V03),o($Vt3,$Vr3),o($V46,$VJ3),o($Vx3,$VK3),o($V46,$VL3,{31:3976,194:[1,3977]}),{19:$VM3,21:$VN3,22:626,130:3978,200:$VO3,215:629,216:$VP3},o($Vt3,$VQ3),o($Vy3,$VK3),o($Vt3,$VL3,{31:3979,194:[1,3980]}),{19:$VM3,21:$VN3,22:626,130:3981,200:$VO3,215:629,216:$VP3},o($VA3,$VR3),o($VB3,$VS3),o($VB3,$VT3),o($VB3,$VU3),{101:[1,3982]},o($VB3,$VT1),{101:[1,3984],107:3983,109:[1,3985],110:[1,3986],111:3987,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,3988]},o($V56,$VV3),o($Vz3,$VK3),o($V56,$VL3,{31:3989,194:[1,3990]}),{19:$VM3,21:$VN3,22:626,130:3991,200:$VO3,215:629,216:$VP3},o($VB3,$VW3),{122:[1,3992]},{19:[1,3995],21:[1,3998],22:3994,88:3993,215:3996,216:[1,3997]},o($VM4,$V31),o($VM4,$V41),o($VM4,$V51),o($Vx3,$Vr5),o($Vx3,$Vs5),{19:$V28,21:$V38,22:4000,88:3999,215:2997,216:$V48},o($VN4,$V31),o($VN4,$V41),o($VN4,$V51),o($Vy3,$Vr5),o($Vy3,$Vs5),{19:$V58,21:$V68,22:4002,88:4001,215:3023,216:$V78},o($VB3,$VX5),o($VB3,$VK1),o($VB3,$Vl),o($VB3,$Vm),o($VB3,$Vn),o($VB3,$Vo),o($VP4,$V31),o($VP4,$V41),o($VP4,$V51),o($Vz3,$Vr5),o($Vz3,$Vs5),{19:$V88,21:$V98,22:4004,88:4003,215:3050,216:$Va8},o($VM4,$V31),o($VM4,$V41),o($VM4,$V51),o($Vx3,$Vr5),o($Vx3,$Vs5),{19:$Vb8,21:$Vc8,22:4006,88:4005,215:3077,216:$Vd8},o($VN4,$V31),o($VN4,$V41),o($VN4,$V51),o($Vy3,$Vr5),o($Vy3,$Vs5),{19:$Ve8,21:$Vf8,22:4008,88:4007,215:3103,216:$Vg8},o($VB3,$VX5),o($VB3,$VK1),o($VB3,$Vl),o($VB3,$Vm),o($VB3,$Vn),o($VB3,$Vo),o($VP4,$V31),o($VP4,$V41),o($VP4,$V51),o($Vz3,$Vr5),o($Vz3,$Vs5),{19:$Vh8,21:$Vi8,22:4010,88:4009,215:3130,216:$Vj8},o($Vk8,$VX4),{19:$Vg,21:$Vh,22:4011,215:38,216:$Vi},{19:$Vl9,21:$Vm9,22:4013,101:[1,4024],109:[1,4025],110:[1,4026],111:4023,182:4014,192:4012,197:4017,198:4018,199:4019,202:4022,205:[1,4027],206:[1,4028],207:[1,4033],208:[1,4034],209:[1,4035],210:[1,4036],211:[1,4029],212:[1,4030],213:[1,4031],214:[1,4032],215:4016,216:$Vn9},o($V57,$VM7,{62:4037,54:[1,4038]}),o($V77,$VN7),o($V77,$VO7,{75:4039,77:4040,79:4041,40:4042,119:4043,80:[1,4044],81:[1,4045],82:[1,4046],120:$VG,126:$VG,128:$VG,190:$VG,228:$VG}),o($V77,$VP7),o($V77,$VO5,{78:4047,74:4048,93:4049,95:4050,96:4054,100:4055,97:[1,4051],98:[1,4052],99:[1,4053],102:$Vo9,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:4057,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($V77,$VR7),o($VS7,$Vy1,{94:4058}),o($VT7,$Vz1,{100:3644,96:4059,102:$V$8,103:$VO,104:$VP,105:$VQ}),o($VU7,$VB1,{87:4060}),o($VU7,$VB1,{87:4061}),o($VU7,$VB1,{87:4062}),o($V77,$VC1,{106:3648,108:3649,92:4063,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VV7,$VU5),o($VV7,$VV5),o($VS7,$VG1),o($VS7,$VH1),o($VS7,$VI1),o($VS7,$VJ1),o($VU7,$VK1),o($VL1,$VM1,{163:4064}),o($VW7,$VO1),{120:[1,4065],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($VV7,$VE1),o($VV7,$VF1),{19:[1,4069],21:[1,4073],22:4067,34:4066,201:4068,215:4070,216:[1,4072],217:[1,4071]},{101:[1,4074]},o($VS7,$VT1),o($VU7,$Vl),o($VU7,$Vm),{101:[1,4076],107:4075,109:[1,4077],110:[1,4078],111:4079,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,4080]},o($VU7,$Vn),o($VU7,$Vo),o($V77,$VN7),o($V77,$VO7,{75:4081,77:4082,79:4083,40:4084,119:4085,80:[1,4086],81:[1,4087],82:[1,4088],120:$VG,126:$VG,128:$VG,190:$VG,228:$VG}),o($V77,$VP7),o($V77,$VO5,{78:4089,74:4090,93:4091,95:4092,96:4096,100:4097,97:[1,4093],98:[1,4094],99:[1,4095],102:$Vp9,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:4099,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($V77,$VR7),o($VS7,$Vy1,{94:4100}),o($VT7,$Vz1,{100:3677,96:4101,102:$V19,103:$VO,104:$VP,105:$VQ}),o($VU7,$VB1,{87:4102}),o($VU7,$VB1,{87:4103}),o($VU7,$VB1,{87:4104}),o($V77,$VC1,{106:3681,108:3682,92:4105,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VV7,$VU5),o($VV7,$VV5),o($VS7,$VG1),o($VS7,$VH1),o($VS7,$VI1),o($VS7,$VJ1),o($VU7,$VK1),o($VL1,$VM1,{163:4106}),o($VW7,$VO1),{120:[1,4107],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($VV7,$VE1),o($VV7,$VF1),{19:[1,4111],21:[1,4115],22:4109,34:4108,201:4110,215:4112,216:[1,4114],217:[1,4113]},{101:[1,4116]},o($VS7,$VT1),o($VU7,$Vl),o($VU7,$Vm),{101:[1,4118],107:4117,109:[1,4119],110:[1,4120],111:4121,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,4122]},o($VU7,$Vn),o($VU7,$Vo),{122:[1,4123]},o($Vr8,$VR3),o($VU7,$V03),o($VU7,$V13),o($VU7,$V23),o($VU7,$V33),o($VU7,$V43),{112:[1,4124]},o($VU7,$V93),o($VV7,$Vt5),o($VW7,$VX5),o($VW7,$VK1),o($VW7,$Vl),o($VW7,$Vm),o($VW7,$Vn),o($VW7,$Vo),o($Vq9,$Vn2,{84:4125,85:4126,193:4127,191:$Vr9}),o($Vz8,$Vm8),o($Vp,$Vq,{56:4129,60:4130,42:4131,45:$Vr}),o($VA8,$Vn8),o($Vp,$Vq,{60:4132,42:4133,45:$Vr}),o($VA8,$Vo8),o($VA8,$Vp8),o($VA8,$VU5),o($VA8,$VV5),{120:[1,4134],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($VA8,$VE1),o($VA8,$VF1),{19:[1,4138],21:[1,4142],22:4136,34:4135,201:4137,215:4139,216:[1,4141],217:[1,4140]},o($VA8,$Vq8),o($VA8,$Vx6),o($Vs9,$Vy1,{94:4143}),o($VA8,$Vz1,{100:3722,96:4144,102:$V49,103:$VO,104:$VP,105:$VQ}),o($Vs9,$VG1),o($Vs9,$VH1),o($Vs9,$VI1),o($Vs9,$VJ1),{101:[1,4145]},o($Vs9,$VT1),{71:[1,4146]},o($V69,$Vq2,{100:3218,96:4147,102:$VB8,103:$VO,104:$VP,105:$VQ}),o($V59,$Vr2),o($VA8,$Vs2,{91:4148,96:4149,92:4150,100:4151,106:4153,108:4154,102:$Vt9,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VA8,$Vu2,{91:4148,96:4149,92:4150,100:4151,106:4153,108:4154,102:$Vt9,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VA8,$Vv2,{91:4148,96:4149,92:4150,100:4151,106:4153,108:4154,102:$Vt9,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($V99,$Vw2),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,4155],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:4156,122:$VU2,149:$VV2,190:$VW2}),o($V89,$Vy2),o($V89,$V01),o($V89,$V11),o($V89,$Vl),o($V89,$Vm),o($V89,$V21),o($V89,$Vn),o($V89,$Vo),o($V59,$V03),o($V99,$V13),o($V99,$V23),o($V99,$V33),o($V99,$V43),{112:[1,4157]},o($V99,$V93),o($Vq9,$Vn2,{85:4126,193:4127,84:4158,191:$Vr9}),o($Vs4,$VM5),o($VF,$VG,{77:4159,79:4160,40:4161,119:4162,80:[1,4163],81:[1,4164],82:[1,4165]}),o($Vs4,$VN5),o($Vs4,$VO5,{78:4166,74:4167,93:4168,95:4169,96:4173,100:4174,97:[1,4170],98:[1,4171],99:[1,4172],102:$Vu9,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:4176,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($Vs4,$VQ5),o($VS5,$VB1,{87:4177}),o($VS5,$VB1,{87:4178}),o($VS5,$VB1,{87:4179}),o($Vs4,$VC1,{106:3770,108:3771,92:4180,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VT5,$VU5),o($VT5,$VV5),o($VS5,$VK1),o($VL1,$VM1,{163:4181}),o($VW5,$VO1),{120:[1,4182],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($VT5,$VE1),o($VT5,$VF1),{19:[1,4186],21:[1,4190],22:4184,34:4183,201:4185,215:4187,216:[1,4189],217:[1,4188]},o($VS5,$Vl),o($VS5,$Vm),{101:[1,4192],107:4191,109:[1,4193],110:[1,4194],111:4195,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,4196]},o($VS5,$Vn),o($VS5,$Vo),{122:[1,4197]},o($Vy6,$VR3),o($VS5,$V03),o($VS5,$V13),o($VS5,$V23),o($VS5,$V33),o($VS5,$V43),{112:[1,4198]},o($VS5,$V93),o($VT5,$Vt5),o($VW5,$VX5),o($VW5,$VK1),o($VW5,$Vl),o($VW5,$Vm),o($VW5,$Vn),o($VW5,$Vo),{122:[1,4199]},o($Vy6,$VR3),o($VS5,$V03),o($VS5,$V13),o($VS5,$V23),o($VS5,$V33),o($VS5,$V43),{112:[1,4200]},o($VS5,$V93),o($VT5,$Vt5),o($VW5,$VX5),o($VW5,$VK1),o($VW5,$Vl),o($VW5,$Vm),o($VW5,$Vn),o($VW5,$Vo),o($Vo2,$Vn2,{85:3826,193:3827,84:4201,191:$Va9}),o($VD,$Vy2),o($VD,$V01),o($VD,$V11),o($VD,$Vl),o($VD,$Vm),o($VD,$V21),o($VD,$Vn),o($VD,$Vo),o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:4202,122:$VU2,149:$VV2,190:$VW2}),o($Vo2,$Vn2,{85:3826,193:3827,84:4203,191:$Va9}),o($Vt1,$Vq2,{100:3301,96:4204,102:$VE8,103:$VO,104:$VP,105:$VQ}),o($Ve2,$Vr2),o($Ve2,$V03),o($VD,$Vr3),o($VI3,$VJ3),o($Vr1,$VK3),o($VI3,$VL3,{31:4205,194:[1,4206]}),{19:$VM3,21:$VN3,22:626,130:4207,200:$VO3,215:629,216:$VP3},o($VD,$VQ3),o($Vt1,$VK3),o($VD,$VL3,{31:4208,194:[1,4209]}),{19:$VM3,21:$VN3,22:626,130:4210,200:$VO3,215:629,216:$VP3},o($Vx1,$VR3),o($VA1,$VS3),o($VA1,$VT3),o($VA1,$VU3),{101:[1,4211]},o($VA1,$VT1),{101:[1,4213],107:4212,109:[1,4214],110:[1,4215],111:4216,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,4217]},o($Vu1,$VV3),o($VD1,$VK3),o($Vu1,$VL3,{31:4218,194:[1,4219]}),{19:$VM3,21:$VN3,22:626,130:4220,200:$VO3,215:629,216:$VP3},o($VA1,$VW3),{122:[1,4221]},{19:[1,4224],21:[1,4227],22:4223,88:4222,215:4225,216:[1,4226]},o($Vm2,$V31),o($Vm2,$V41),o($Vm2,$V51),o($Vr1,$Vr5),o($Vr1,$Vs5),{19:$VF8,21:$VG8,22:4229,88:4228,215:3336,216:$VH8},o($Vo2,$V31),o($Vo2,$V41),o($Vo2,$V51),o($Vt1,$Vr5),o($Vt1,$Vs5),{19:$VI8,21:$VJ8,22:4231,88:4230,215:3362,216:$VK8},o($VA1,$VX5),o($VA1,$VK1),o($VA1,$Vl),o($VA1,$Vm),o($VA1,$Vn),o($VA1,$Vo),o($Vx2,$V31),o($Vx2,$V41),o($Vx2,$V51),o($VD1,$Vr5),o($VD1,$Vs5),{19:$VL8,21:$VM8,22:4233,88:4232,215:3389,216:$VN8},o($Vm2,$V31),o($Vm2,$V41),o($Vm2,$V51),o($Vr1,$Vr5),o($Vr1,$Vs5),{19:$VO8,21:$VP8,22:4235,88:4234,215:3416,216:$VQ8},o($Vo2,$V31),o($Vo2,$V41),o($Vo2,$V51),o($Vt1,$Vr5),o($Vt1,$Vs5),{19:$VR8,21:$VS8,22:4237,88:4236,215:3442,216:$VT8},o($VA1,$VX5),o($VA1,$VK1),o($VA1,$Vl),o($VA1,$Vm),o($VA1,$Vn),o($VA1,$Vo),o($Vx2,$V31),o($Vx2,$V41),o($Vx2,$V51),o($VD1,$Vr5),o($VD1,$Vs5),{19:$VU8,21:$VV8,22:4239,88:4238,215:3469,216:$VW8},o($Vt1,$Vt5),{194:[1,4242],195:4240,196:[1,4241]},o($Vr1,$V86),o($Vr1,$V96),o($Vr1,$Va6),o($Vr1,$Vl),o($Vr1,$Vm),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$V04),o($Vr1,$V14,{203:4243,204:4244,112:[1,4245]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Vb6,$V53),o($Vb6,$V63),o($Vb6,$V73),o($Vb6,$V83),{194:[1,4248],195:4246,196:[1,4247]},o($Vt1,$V86),o($Vt1,$V96),o($Vt1,$Va6),o($Vt1,$Vl),o($Vt1,$Vm),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$V04),o($Vt1,$V14,{203:4249,204:4250,112:[1,4251]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vc6,$V53),o($Vc6,$V63),o($Vc6,$V73),o($Vc6,$V83),{19:[1,4254],21:[1,4257],22:4253,88:4252,215:4255,216:[1,4256]},{194:[1,4260],195:4258,196:[1,4259]},o($VD1,$V86),o($VD1,$V96),o($VD1,$Va6),o($VD1,$Vl),o($VD1,$Vm),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$V04),o($VD1,$V14,{203:4261,204:4262,112:[1,4263]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vd6,$V53),o($Vd6,$V63),o($Vd6,$V73),o($Vd6,$V83),o($Vt3,$VV3),{122:[1,4264]},o($Vt3,$VJ3),o($VL4,$VR3),o($VM4,$VX4),{19:$Vg,21:$Vh,22:4265,215:38,216:$Vi},{19:$Vv9,21:$Vw9,22:4267,101:[1,4278],109:[1,4279],110:[1,4280],111:4277,182:4268,192:4266,197:4271,198:4272,199:4273,202:4276,205:[1,4281],206:[1,4282],207:[1,4287],208:[1,4288],209:[1,4289],210:[1,4290],211:[1,4283],212:[1,4284],213:[1,4285],214:[1,4286],215:4270,216:$Vx9},o($VN4,$VX4),{19:$Vg,21:$Vh,22:4291,215:38,216:$Vi},{19:$Vy9,21:$Vz9,22:4293,101:[1,4304],109:[1,4305],110:[1,4306],111:4303,182:4294,192:4292,197:4297,198:4298,199:4299,202:4302,205:[1,4307],206:[1,4308],207:[1,4313],208:[1,4314],209:[1,4315],210:[1,4316],211:[1,4309],212:[1,4310],213:[1,4311],214:[1,4312],215:4296,216:$VA9},o($VB3,$V03),o($VB3,$V13),o($VB3,$V23),o($VB3,$V33),o($VB3,$V43),{112:[1,4317]},o($VB3,$V93),o($VP4,$VX4),{19:$Vg,21:$Vh,22:4318,215:38,216:$Vi},{19:$VB9,21:$VC9,22:4320,101:[1,4331],109:[1,4332],110:[1,4333],111:4330,182:4321,192:4319,197:4324,198:4325,199:4326,202:4329,205:[1,4334],206:[1,4335],207:[1,4340],208:[1,4341],209:[1,4342],210:[1,4343],211:[1,4336],212:[1,4337],213:[1,4338],214:[1,4339],215:4323,216:$VD9},o($Vz3,$Vt5),o($VC3,$VX5),o($VC3,$VK1),o($VC3,$Vl),o($VC3,$Vm),o($VC3,$Vn),o($VC3,$Vo),o($Vx3,$Vi6),o($Vx3,$VK1),o($Vy3,$Vi6),o($Vy3,$VK1),o($Vz3,$Vi6),o($Vz3,$VK1),o($Vx3,$Vi6),o($Vx3,$VK1),o($Vy3,$Vi6),o($Vy3,$VK1),o($Vz3,$Vi6),o($Vz3,$VK1),{194:[1,4346],195:4344,196:[1,4345]},o($VZ6,$V86),o($VZ6,$V96),o($VZ6,$Va6),o($VZ6,$Vl),o($VZ6,$Vm),o($VZ6,$VZ3),o($VZ6,$V_3),o($VZ6,$V$3),o($VZ6,$Vn),o($VZ6,$Vo),o($VZ6,$V04),o($VZ6,$V14,{203:4347,204:4348,112:[1,4349]}),o($VZ6,$V24),o($VZ6,$V34),o($VZ6,$V44),o($VZ6,$V54),o($VZ6,$V64),o($VZ6,$V74),o($VZ6,$V84),o($VZ6,$V94),o($VZ6,$Va4),o($VE9,$V53),o($VE9,$V63),o($VE9,$V73),o($VE9,$V83),o($V77,$Vn8),o($Vp,$Vq,{60:4350,42:4351,45:$Vr}),o($V77,$Vo8),o($V77,$Vp8),o($V77,$VU5),o($V77,$VV5),{120:[1,4352],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($V77,$VE1),o($V77,$VF1),{19:[1,4356],21:[1,4360],22:4354,34:4353,201:4355,215:4357,216:[1,4359],217:[1,4358]},o($V77,$Vq8),o($V77,$Vx6),o($Vr8,$Vy1,{94:4361}),o($V77,$Vz1,{100:4055,96:4362,102:$Vo9,103:$VO,104:$VP,105:$VQ}),o($Vr8,$VG1),o($Vr8,$VH1),o($Vr8,$VI1),o($Vr8,$VJ1),{101:[1,4363]},o($Vr8,$VT1),{71:[1,4364]},o($VT7,$Vq2,{100:3644,96:4365,102:$V$8,103:$VO,104:$VP,105:$VQ}),o($VS7,$Vr2),o($V77,$Vs2,{91:4366,96:4367,92:4368,100:4369,106:4371,108:4372,102:$VF9,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($V77,$Vu2,{91:4366,96:4367,92:4368,100:4369,106:4371,108:4372,102:$VF9,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($V77,$Vv2,{91:4366,96:4367,92:4368,100:4369,106:4371,108:4372,102:$VF9,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VW7,$Vw2),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,4373],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:4374,122:$VU2,149:$VV2,190:$VW2}),o($VV7,$Vy2),o($VV7,$V01),o($VV7,$V11),o($VV7,$Vl),o($VV7,$Vm),o($VV7,$V21),o($VV7,$Vn),o($VV7,$Vo),o($VS7,$V03),o($VW7,$V13),o($VW7,$V23),o($VW7,$V33),o($VW7,$V43),{112:[1,4375]},o($VW7,$V93),o($V77,$Vo8),o($V77,$Vp8),o($V77,$VU5),o($V77,$VV5),{120:[1,4376],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($V77,$VE1),o($V77,$VF1),{19:[1,4380],21:[1,4384],22:4378,34:4377,201:4379,215:4381,216:[1,4383],217:[1,4382]},o($V77,$Vq8),o($V77,$Vx6),o($Vr8,$Vy1,{94:4385}),o($V77,$Vz1,{100:4097,96:4386,102:$Vp9,103:$VO,104:$VP,105:$VQ}),o($Vr8,$VG1),o($Vr8,$VH1),o($Vr8,$VI1),o($Vr8,$VJ1),{101:[1,4387]},o($Vr8,$VT1),{71:[1,4388]},o($VT7,$Vq2,{100:3677,96:4389,102:$V19,103:$VO,104:$VP,105:$VQ}),o($VS7,$Vr2),o($V77,$Vs2,{91:4390,96:4391,92:4392,100:4393,106:4395,108:4396,102:$VG9,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($V77,$Vu2,{91:4390,96:4391,92:4392,100:4393,106:4395,108:4396,102:$VG9,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($V77,$Vv2,{91:4390,96:4391,92:4392,100:4393,106:4395,108:4396,102:$VG9,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VW7,$Vw2),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,4397],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:4398,122:$VU2,149:$VV2,190:$VW2}),o($VV7,$Vy2),o($VV7,$V01),o($VV7,$V11),o($VV7,$Vl),o($VV7,$Vm),o($VV7,$V21),o($VV7,$Vn),o($VV7,$Vo),o($VS7,$V03),o($VW7,$V13),o($VW7,$V23),o($VW7,$V33),o($VW7,$V43),{112:[1,4399]},o($VW7,$V93),o($V77,$Vt5),{19:[1,4402],21:[1,4405],22:4401,88:4400,215:4403,216:[1,4404]},o($Vt6,$VZ8),o($Vt8,$VK3),o($Vt6,$VL3,{31:4406,194:[1,4407]}),{19:$VM3,21:$VN3,22:626,130:4408,200:$VO3,215:629,216:$VP3},o($Vz8,$V_8),o($VA8,$V87,{61:4409}),o($VF,$VG,{64:4410,74:4411,76:4412,77:4413,93:4416,95:4417,88:4419,89:4420,90:4421,79:4422,40:4423,96:4427,22:4428,92:4430,119:4431,100:4435,215:4438,106:4439,108:4440,19:[1,4437],21:[1,4442],70:[1,4414],72:[1,4415],80:[1,4432],81:[1,4433],82:[1,4434],86:[1,4418],97:[1,4424],98:[1,4425],99:[1,4426],102:$VH9,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:[1,4429],216:[1,4441]}),o($VA8,$V09),o($VF,$VG,{64:4443,74:4444,76:4445,77:4446,93:4449,95:4450,88:4452,89:4453,90:4454,79:4455,40:4456,96:4460,22:4461,92:4463,119:4464,100:4468,215:4471,106:4472,108:4473,19:[1,4470],21:[1,4475],70:[1,4447],72:[1,4448],80:[1,4465],81:[1,4466],82:[1,4467],86:[1,4451],97:[1,4457],98:[1,4458],99:[1,4459],102:$VI9,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:[1,4462],216:[1,4474]}),o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:4476,122:$VU2,149:$VV2,190:$VW2}),o($VA8,$Vy2),o($VA8,$V01),o($VA8,$V11),o($VA8,$Vl),o($VA8,$Vm),o($VA8,$V21),o($VA8,$Vn),o($VA8,$Vo),o($VA8,$Vq2,{100:3722,96:4477,102:$V49,103:$VO,104:$VP,105:$VQ}),o($Vs9,$Vr2),o($Vs9,$V03),o($VA8,$V29),o($V59,$VR3),o($V79,$VS3),o($V79,$VT3),o($V79,$VU3),{101:[1,4478]},o($V79,$VT1),{101:[1,4480],107:4479,109:[1,4481],110:[1,4482],111:4483,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,4484]},o($V79,$VW3),{122:[1,4485]},{19:[1,4488],21:[1,4491],22:4487,88:4486,215:4489,216:[1,4490]},o($Vt6,$V39),o($Vs4,$Vv6),o($Vs4,$VU5),o($Vs4,$VV5),{120:[1,4492],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($Vs4,$VE1),o($Vs4,$VF1),{19:[1,4496],21:[1,4500],22:4494,34:4493,201:4495,215:4497,216:[1,4499],217:[1,4498]},o($Vs4,$Vw6),o($Vs4,$Vx6),o($Vy6,$Vy1,{94:4501}),o($Vs4,$Vz1,{100:4174,96:4502,102:$Vu9,103:$VO,104:$VP,105:$VQ}),o($Vy6,$VG1),o($Vy6,$VH1),o($Vy6,$VI1),o($Vy6,$VJ1),{101:[1,4503]},o($Vy6,$VT1),{71:[1,4504]},o($Vs4,$Vs2,{91:4505,96:4506,92:4507,100:4508,106:4510,108:4511,102:$VJ9,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vs4,$Vu2,{91:4505,96:4506,92:4507,100:4508,106:4510,108:4511,102:$VJ9,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($Vs4,$Vv2,{91:4505,96:4506,92:4507,100:4508,106:4510,108:4511,102:$VJ9,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VW5,$Vw2),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,4512],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:4513,122:$VU2,149:$VV2,190:$VW2}),o($VT5,$Vy2),o($VT5,$V01),o($VT5,$V11),o($VT5,$Vl),o($VT5,$Vm),o($VT5,$V21),o($VT5,$Vn),o($VT5,$Vo),o($VW5,$V13),o($VW5,$V23),o($VW5,$V33),o($VW5,$V43),{112:[1,4514]},o($VW5,$V93),o($Vs4,$Vt5),{19:[1,4517],21:[1,4520],22:4516,88:4515,215:4518,216:[1,4519]},o($Vs4,$Vt5),{19:[1,4523],21:[1,4526],22:4522,88:4521,215:4524,216:[1,4525]},o($VD,$VV3),{122:[1,4527]},o($VD,$VJ3),o($Ve2,$VR3),o($Vm2,$VX4),{19:$Vg,21:$Vh,22:4528,215:38,216:$Vi},{19:$VK9,21:$VL9,22:4530,101:[1,4541],109:[1,4542],110:[1,4543],111:4540,182:4531,192:4529,197:4534,198:4535,199:4536,202:4539,205:[1,4544],206:[1,4545],207:[1,4550],208:[1,4551],209:[1,4552],210:[1,4553],211:[1,4546],212:[1,4547],213:[1,4548],214:[1,4549],215:4533,216:$VM9},o($Vo2,$VX4),{19:$Vg,21:$Vh,22:4554,215:38,216:$Vi},{19:$VN9,21:$VO9,22:4556,101:[1,4567],109:[1,4568],110:[1,4569],111:4566,182:4557,192:4555,197:4560,198:4561,199:4562,202:4565,205:[1,4570],206:[1,4571],207:[1,4576],208:[1,4577],209:[1,4578],210:[1,4579],211:[1,4572],212:[1,4573],213:[1,4574],214:[1,4575],215:4559,216:$VP9},o($VA1,$V03),o($VA1,$V13),o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),{112:[1,4580]},o($VA1,$V93),o($Vx2,$VX4),{19:$Vg,21:$Vh,22:4581,215:38,216:$Vi},{19:$VQ9,21:$VR9,22:4583,101:[1,4594],109:[1,4595],110:[1,4596],111:4593,182:4584,192:4582,197:4587,198:4588,199:4589,202:4592,205:[1,4597],206:[1,4598],207:[1,4603],208:[1,4604],209:[1,4605],210:[1,4606],211:[1,4599],212:[1,4600],213:[1,4601],214:[1,4602],215:4586,216:$VS9},o($VD1,$Vt5),o($VN1,$VX5),o($VN1,$VK1),o($VN1,$Vl),o($VN1,$Vm),o($VN1,$Vn),o($VN1,$Vo),o($Vr1,$Vi6),o($Vr1,$VK1),o($Vt1,$Vi6),o($Vt1,$VK1),o($VD1,$Vi6),o($VD1,$VK1),o($Vr1,$Vi6),o($Vr1,$VK1),o($Vt1,$Vi6),o($Vt1,$VK1),o($VD1,$Vi6),o($VD1,$VK1),o($Vm2,$V31),o($Vm2,$V41),o($Vm2,$V51),o($Vr1,$Vr5),o($Vr1,$Vs5),{19:$Vc9,21:$Vd9,22:4608,88:4607,215:3898,216:$Ve9},o($Vo2,$V31),o($Vo2,$V41),o($Vo2,$V51),o($Vt1,$Vr5),o($Vt1,$Vs5),{19:$Vf9,21:$Vg9,22:4610,88:4609,215:3924,216:$Vh9},o($VA1,$VX5),o($VA1,$VK1),o($VA1,$Vl),o($VA1,$Vm),o($VA1,$Vn),o($VA1,$Vo),o($Vx2,$V31),o($Vx2,$V41),o($Vx2,$V51),o($VD1,$Vr5),o($VD1,$Vs5),{19:$Vi9,21:$Vj9,22:4612,88:4611,215:3951,216:$Vk9},o($Vy3,$Vt5),{194:[1,4615],195:4613,196:[1,4614]},o($Vx3,$V86),o($Vx3,$V96),o($Vx3,$Va6),o($Vx3,$Vl),o($Vx3,$Vm),o($Vx3,$VZ3),o($Vx3,$V_3),o($Vx3,$V$3),o($Vx3,$Vn),o($Vx3,$Vo),o($Vx3,$V04),o($Vx3,$V14,{203:4616,204:4617,112:[1,4618]}),o($Vx3,$V24),o($Vx3,$V34),o($Vx3,$V44),o($Vx3,$V54),o($Vx3,$V64),o($Vx3,$V74),o($Vx3,$V84),o($Vx3,$V94),o($Vx3,$Va4),o($VC7,$V53),o($VC7,$V63),o($VC7,$V73),o($VC7,$V83),{194:[1,4621],195:4619,196:[1,4620]},o($Vy3,$V86),o($Vy3,$V96),o($Vy3,$Va6),o($Vy3,$Vl),o($Vy3,$Vm),o($Vy3,$VZ3),o($Vy3,$V_3),o($Vy3,$V$3),o($Vy3,$Vn),o($Vy3,$Vo),o($Vy3,$V04),o($Vy3,$V14,{203:4622,204:4623,112:[1,4624]}),o($Vy3,$V24),o($Vy3,$V34),o($Vy3,$V44),o($Vy3,$V54),o($Vy3,$V64),o($Vy3,$V74),o($Vy3,$V84),o($Vy3,$V94),o($Vy3,$Va4),o($VD7,$V53),o($VD7,$V63),o($VD7,$V73),o($VD7,$V83),{19:[1,4627],21:[1,4630],22:4626,88:4625,215:4628,216:[1,4629]},{194:[1,4633],195:4631,196:[1,4632]},o($Vz3,$V86),o($Vz3,$V96),o($Vz3,$Va6),o($Vz3,$Vl),o($Vz3,$Vm),o($Vz3,$VZ3),o($Vz3,$V_3),o($Vz3,$V$3),o($Vz3,$Vn),o($Vz3,$Vo),o($Vz3,$V04),o($Vz3,$V14,{203:4634,204:4635,112:[1,4636]}),o($Vz3,$V24),o($Vz3,$V34),o($Vz3,$V44),o($Vz3,$V54),o($Vz3,$V64),o($Vz3,$V74),o($Vz3,$V84),o($Vz3,$V94),o($Vz3,$Va4),o($VE7,$V53),o($VE7,$V63),o($VE7,$V73),o($VE7,$V83),o($Vk8,$V31),o($Vk8,$V41),o($Vk8,$V51),o($VZ6,$Vr5),o($VZ6,$Vs5),{19:$Vl9,21:$Vm9,22:4638,88:4637,215:4016,216:$Vn9},o($V77,$V09),o($VF,$VG,{64:4639,74:4640,76:4641,77:4642,93:4645,95:4646,88:4648,89:4649,90:4650,79:4651,40:4652,96:4656,22:4657,92:4659,119:4660,100:4664,215:4667,106:4668,108:4669,19:[1,4666],21:[1,4671],70:[1,4643],72:[1,4644],80:[1,4661],81:[1,4662],82:[1,4663],86:[1,4647],97:[1,4653],98:[1,4654],99:[1,4655],102:$VT9,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:[1,4658],216:[1,4670]}),o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:4672,122:$VU2,149:$VV2,190:$VW2}),o($V77,$Vy2),o($V77,$V01),o($V77,$V11),o($V77,$Vl),o($V77,$Vm),o($V77,$V21),o($V77,$Vn),o($V77,$Vo),o($V77,$Vq2,{100:4055,96:4673,102:$Vo9,103:$VO,104:$VP,105:$VQ}),o($Vr8,$Vr2),o($Vr8,$V03),o($V77,$V29),o($VS7,$VR3),o($VU7,$VS3),o($VU7,$VT3),o($VU7,$VU3),{101:[1,4674]},o($VU7,$VT1),{101:[1,4676],107:4675,109:[1,4677],110:[1,4678],111:4679,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,4680]},o($VU7,$VW3),{122:[1,4681]},{19:[1,4684],21:[1,4687],22:4683,88:4682,215:4685,216:[1,4686]},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:4688,122:$VU2,149:$VV2,190:$VW2}),o($V77,$Vy2),o($V77,$V01),o($V77,$V11),o($V77,$Vl),o($V77,$Vm),o($V77,$V21),o($V77,$Vn),o($V77,$Vo),o($V77,$Vq2,{100:4097,96:4689,102:$Vp9,103:$VO,104:$VP,105:$VQ}),o($Vr8,$Vr2),o($Vr8,$V03),o($V77,$V29),o($VS7,$VR3),o($VU7,$VS3),o($VU7,$VT3),o($VU7,$VU3),{101:[1,4690]},o($VU7,$VT1),{101:[1,4692],107:4691,109:[1,4693],110:[1,4694],111:4695,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,4696]},o($VU7,$VW3),{122:[1,4697]},{19:[1,4700],21:[1,4703],22:4699,88:4698,215:4701,216:[1,4702]},o($VU7,$VX5),o($VU7,$VK1),o($VU7,$Vl),o($VU7,$Vm),o($VU7,$Vn),o($VU7,$Vo),o($Vq9,$VX4),{19:$Vg,21:$Vh,22:4704,215:38,216:$Vi},{19:$VU9,21:$VV9,22:4706,101:[1,4717],109:[1,4718],110:[1,4719],111:4716,182:4707,192:4705,197:4710,198:4711,199:4712,202:4715,205:[1,4720],206:[1,4721],207:[1,4726],208:[1,4727],209:[1,4728],210:[1,4729],211:[1,4722],212:[1,4723],213:[1,4724],214:[1,4725],215:4709,216:$VW9},o($Vz8,$VM7,{62:4730,54:[1,4731]}),o($VA8,$VN7),o($VA8,$VO7,{75:4732,77:4733,79:4734,40:4735,119:4736,80:[1,4737],81:[1,4738],82:[1,4739],120:$VG,126:$VG,128:$VG,190:$VG,228:$VG}),o($VA8,$VP7),o($VA8,$VO5,{78:4740,74:4741,93:4742,95:4743,96:4747,100:4748,97:[1,4744],98:[1,4745],99:[1,4746],102:$VX9,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:4750,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($VA8,$VR7),o($V59,$Vy1,{94:4751}),o($V69,$Vz1,{100:4435,96:4752,102:$VH9,103:$VO,104:$VP,105:$VQ}),o($V79,$VB1,{87:4753}),o($V79,$VB1,{87:4754}),o($V79,$VB1,{87:4755}),o($VA8,$VC1,{106:4439,108:4440,92:4756,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($V89,$VU5),o($V89,$VV5),o($V59,$VG1),o($V59,$VH1),o($V59,$VI1),o($V59,$VJ1),o($V79,$VK1),o($VL1,$VM1,{163:4757}),o($V99,$VO1),{120:[1,4758],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($V89,$VE1),o($V89,$VF1),{19:[1,4762],21:[1,4766],22:4760,34:4759,201:4761,215:4763,216:[1,4765],217:[1,4764]},{101:[1,4767]},o($V59,$VT1),o($V79,$Vl),o($V79,$Vm),{101:[1,4769],107:4768,109:[1,4770],110:[1,4771],111:4772,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,4773]},o($V79,$Vn),o($V79,$Vo),o($VA8,$VN7),o($VA8,$VO7,{75:4774,77:4775,79:4776,40:4777,119:4778,80:[1,4779],81:[1,4780],82:[1,4781],120:$VG,126:$VG,128:$VG,190:$VG,228:$VG}),o($VA8,$VP7),o($VA8,$VO5,{78:4782,74:4783,93:4784,95:4785,96:4789,100:4790,97:[1,4786],98:[1,4787],99:[1,4788],102:$VY9,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:4792,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($VA8,$VR7),o($V59,$Vy1,{94:4793}),o($V69,$Vz1,{100:4468,96:4794,102:$VI9,103:$VO,104:$VP,105:$VQ}),o($V79,$VB1,{87:4795}),o($V79,$VB1,{87:4796}),o($V79,$VB1,{87:4797}),o($VA8,$VC1,{106:4472,108:4473,92:4798,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($V89,$VU5),o($V89,$VV5),o($V59,$VG1),o($V59,$VH1),o($V59,$VI1),o($V59,$VJ1),o($V79,$VK1),o($VL1,$VM1,{163:4799}),o($V99,$VO1),{120:[1,4800],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($V89,$VE1),o($V89,$VF1),{19:[1,4804],21:[1,4808],22:4802,34:4801,201:4803,215:4805,216:[1,4807],217:[1,4806]},{101:[1,4809]},o($V59,$VT1),o($V79,$Vl),o($V79,$Vm),{101:[1,4811],107:4810,109:[1,4812],110:[1,4813],111:4814,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,4815]},o($V79,$Vn),o($V79,$Vo),{122:[1,4816]},o($Vs9,$VR3),o($V79,$V03),o($V79,$V13),o($V79,$V23),o($V79,$V33),o($V79,$V43),{112:[1,4817]},o($V79,$V93),o($V89,$Vt5),o($V99,$VX5),o($V99,$VK1),o($V99,$Vl),o($V99,$Vm),o($V99,$Vn),o($V99,$Vo),o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:4818,122:$VU2,149:$VV2,190:$VW2}),o($Vs4,$Vy2),o($Vs4,$V01),o($Vs4,$V11),o($Vs4,$Vl),o($Vs4,$Vm),o($Vs4,$V21),o($Vs4,$Vn),o($Vs4,$Vo),o($Vs4,$Vq2,{100:4174,96:4819,102:$Vu9,103:$VO,104:$VP,105:$VQ}),o($Vy6,$Vr2),o($Vy6,$V03),o($Vs4,$Vb7),o($VS5,$VS3),o($VS5,$VT3),o($VS5,$VU3),{101:[1,4820]},o($VS5,$VT1),{101:[1,4822],107:4821,109:[1,4823],110:[1,4824],111:4825,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,4826]},o($VS5,$VW3),{122:[1,4827]},{19:[1,4830],21:[1,4833],22:4829,88:4828,215:4831,216:[1,4832]},o($VS5,$VX5),o($VS5,$VK1),o($VS5,$Vl),o($VS5,$Vm),o($VS5,$Vn),o($VS5,$Vo),o($VS5,$VX5),o($VS5,$VK1),o($VS5,$Vl),o($VS5,$Vm),o($VS5,$Vn),o($VS5,$Vo),o($Vt1,$Vt5),{194:[1,4836],195:4834,196:[1,4835]},o($Vr1,$V86),o($Vr1,$V96),o($Vr1,$Va6),o($Vr1,$Vl),o($Vr1,$Vm),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$V$3),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$V04),o($Vr1,$V14,{203:4837,204:4838,112:[1,4839]}),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($Vr1,$Va4),o($Vb6,$V53),o($Vb6,$V63),o($Vb6,$V73),o($Vb6,$V83),{194:[1,4842],195:4840,196:[1,4841]},o($Vt1,$V86),o($Vt1,$V96),o($Vt1,$Va6),o($Vt1,$Vl),o($Vt1,$Vm),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$V04),o($Vt1,$V14,{203:4843,204:4844,112:[1,4845]}),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($Vt1,$Va4),o($Vc6,$V53),o($Vc6,$V63),o($Vc6,$V73),o($Vc6,$V83),{19:[1,4848],21:[1,4851],22:4847,88:4846,215:4849,216:[1,4850]},{194:[1,4854],195:4852,196:[1,4853]},o($VD1,$V86),o($VD1,$V96),o($VD1,$Va6),o($VD1,$Vl),o($VD1,$Vm),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$V$3),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$V04),o($VD1,$V14,{203:4855,204:4856,112:[1,4857]}),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($VD1,$Va4),o($Vd6,$V53),o($Vd6,$V63),o($Vd6,$V73),o($Vd6,$V83),o($Vr1,$Vi6),o($Vr1,$VK1),o($Vt1,$Vi6),o($Vt1,$VK1),o($VD1,$Vi6),o($VD1,$VK1),o($VM4,$V31),o($VM4,$V41),o($VM4,$V51),o($Vx3,$Vr5),o($Vx3,$Vs5),{19:$Vv9,21:$Vw9,22:4859,88:4858,215:4270,216:$Vx9},o($VN4,$V31),o($VN4,$V41),o($VN4,$V51),o($Vy3,$Vr5),o($Vy3,$Vs5),{19:$Vy9,21:$Vz9,22:4861,88:4860,215:4296,216:$VA9},o($VB3,$VX5),o($VB3,$VK1),o($VB3,$Vl),o($VB3,$Vm),o($VB3,$Vn),o($VB3,$Vo),o($VP4,$V31),o($VP4,$V41),o($VP4,$V51),o($Vz3,$Vr5),o($Vz3,$Vs5),{19:$VB9,21:$VC9,22:4863,88:4862,215:4323,216:$VD9},o($VZ6,$Vi6),o($VZ6,$VK1),o($V77,$VN7),o($V77,$VO7,{75:4864,77:4865,79:4866,40:4867,119:4868,80:[1,4869],81:[1,4870],82:[1,4871],120:$VG,126:$VG,128:$VG,190:$VG,228:$VG}),o($V77,$VP7),o($V77,$VO5,{78:4872,74:4873,93:4874,95:4875,96:4879,100:4880,97:[1,4876],98:[1,4877],99:[1,4878],102:$VZ9,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:4882,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($V77,$VR7),o($VS7,$Vy1,{94:4883}),o($VT7,$Vz1,{100:4664,96:4884,102:$VT9,103:$VO,104:$VP,105:$VQ}),o($VU7,$VB1,{87:4885}),o($VU7,$VB1,{87:4886}),o($VU7,$VB1,{87:4887}),o($V77,$VC1,{106:4668,108:4669,92:4888,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VV7,$VU5),o($VV7,$VV5),o($VS7,$VG1),o($VS7,$VH1),o($VS7,$VI1),o($VS7,$VJ1),o($VU7,$VK1),o($VL1,$VM1,{163:4889}),o($VW7,$VO1),{120:[1,4890],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($VV7,$VE1),o($VV7,$VF1),{19:[1,4894],21:[1,4898],22:4892,34:4891,201:4893,215:4895,216:[1,4897],217:[1,4896]},{101:[1,4899]},o($VS7,$VT1),o($VU7,$Vl),o($VU7,$Vm),{101:[1,4901],107:4900,109:[1,4902],110:[1,4903],111:4904,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,4905]},o($VU7,$Vn),o($VU7,$Vo),{122:[1,4906]},o($Vr8,$VR3),o($VU7,$V03),o($VU7,$V13),o($VU7,$V23),o($VU7,$V33),o($VU7,$V43),{112:[1,4907]},o($VU7,$V93),o($VV7,$Vt5),o($VW7,$VX5),o($VW7,$VK1),o($VW7,$Vl),o($VW7,$Vm),o($VW7,$Vn),o($VW7,$Vo),{122:[1,4908]},o($Vr8,$VR3),o($VU7,$V03),o($VU7,$V13),o($VU7,$V23),o($VU7,$V33),o($VU7,$V43),{112:[1,4909]},o($VU7,$V93),o($VV7,$Vt5),o($VW7,$VX5),o($VW7,$VK1),o($VW7,$Vl),o($VW7,$Vm),o($VW7,$Vn),o($VW7,$Vo),{194:[1,4912],195:4910,196:[1,4911]},o($Vt8,$V86),o($Vt8,$V96),o($Vt8,$Va6),o($Vt8,$Vl),o($Vt8,$Vm),o($Vt8,$VZ3),o($Vt8,$V_3),o($Vt8,$V$3),o($Vt8,$Vn),o($Vt8,$Vo),o($Vt8,$V04),o($Vt8,$V14,{203:4913,204:4914,112:[1,4915]}),o($Vt8,$V24),o($Vt8,$V34),o($Vt8,$V44),o($Vt8,$V54),o($Vt8,$V64),o($Vt8,$V74),o($Vt8,$V84),o($Vt8,$V94),o($Vt8,$Va4),o($V_9,$V53),o($V_9,$V63),o($V_9,$V73),o($V_9,$V83),o($VA8,$Vn8),o($Vp,$Vq,{60:4916,42:4917,45:$Vr}),o($VA8,$Vo8),o($VA8,$Vp8),o($VA8,$VU5),o($VA8,$VV5),{120:[1,4918],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($VA8,$VE1),o($VA8,$VF1),{19:[1,4922],21:[1,4926],22:4920,34:4919,201:4921,215:4923,216:[1,4925],217:[1,4924]},o($VA8,$Vq8),o($VA8,$Vx6),o($Vs9,$Vy1,{94:4927}),o($VA8,$Vz1,{100:4748,96:4928,102:$VX9,103:$VO,104:$VP,105:$VQ}),o($Vs9,$VG1),o($Vs9,$VH1),o($Vs9,$VI1),o($Vs9,$VJ1),{101:[1,4929]},o($Vs9,$VT1),{71:[1,4930]},o($V69,$Vq2,{100:4435,96:4931,102:$VH9,103:$VO,104:$VP,105:$VQ}),o($V59,$Vr2),o($VA8,$Vs2,{91:4932,96:4933,92:4934,100:4935,106:4937,108:4938,102:$V$9,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VA8,$Vu2,{91:4932,96:4933,92:4934,100:4935,106:4937,108:4938,102:$V$9,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VA8,$Vv2,{91:4932,96:4933,92:4934,100:4935,106:4937,108:4938,102:$V$9,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($V99,$Vw2),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,4939],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:4940,122:$VU2,149:$VV2,190:$VW2}),o($V89,$Vy2),o($V89,$V01),o($V89,$V11),o($V89,$Vl),o($V89,$Vm),o($V89,$V21),o($V89,$Vn),o($V89,$Vo),o($V59,$V03),o($V99,$V13),o($V99,$V23),o($V99,$V33),o($V99,$V43),{112:[1,4941]},o($V99,$V93),o($VA8,$Vo8),o($VA8,$Vp8),o($VA8,$VU5),o($VA8,$VV5),{120:[1,4942],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($VA8,$VE1),o($VA8,$VF1),{19:[1,4946],21:[1,4950],22:4944,34:4943,201:4945,215:4947,216:[1,4949],217:[1,4948]},o($VA8,$Vq8),o($VA8,$Vx6),o($Vs9,$Vy1,{94:4951}),o($VA8,$Vz1,{100:4790,96:4952,102:$VY9,103:$VO,104:$VP,105:$VQ}),o($Vs9,$VG1),o($Vs9,$VH1),o($Vs9,$VI1),o($Vs9,$VJ1),{101:[1,4953]},o($Vs9,$VT1),{71:[1,4954]},o($V69,$Vq2,{100:4468,96:4955,102:$VI9,103:$VO,104:$VP,105:$VQ}),o($V59,$Vr2),o($VA8,$Vs2,{91:4956,96:4957,92:4958,100:4959,106:4961,108:4962,102:$V0a,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VA8,$Vu2,{91:4956,96:4957,92:4958,100:4959,106:4961,108:4962,102:$V0a,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VA8,$Vv2,{91:4956,96:4957,92:4958,100:4959,106:4961,108:4962,102:$V0a,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($V99,$Vw2),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,4963],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:4964,122:$VU2,149:$VV2,190:$VW2}),o($V89,$Vy2),o($V89,$V01),o($V89,$V11),o($V89,$Vl),o($V89,$Vm),o($V89,$V21),o($V89,$Vn),o($V89,$Vo),o($V59,$V03),o($V99,$V13),o($V99,$V23),o($V99,$V33),o($V99,$V43),{112:[1,4965]},o($V99,$V93),o($VA8,$Vt5),{19:[1,4968],21:[1,4971],22:4967,88:4966,215:4969,216:[1,4970]},{122:[1,4972]},o($Vy6,$VR3),o($VS5,$V03),o($VS5,$V13),o($VS5,$V23),o($VS5,$V33),o($VS5,$V43),{112:[1,4973]},o($VS5,$V93),o($VT5,$Vt5),o($VW5,$VX5),o($VW5,$VK1),o($VW5,$Vl),o($VW5,$Vm),o($VW5,$Vn),o($VW5,$Vo),o($Vm2,$V31),o($Vm2,$V41),o($Vm2,$V51),o($Vr1,$Vr5),o($Vr1,$Vs5),{19:$VK9,21:$VL9,22:4975,88:4974,215:4533,216:$VM9},o($Vo2,$V31),o($Vo2,$V41),o($Vo2,$V51),o($Vt1,$Vr5),o($Vt1,$Vs5),{19:$VN9,21:$VO9,22:4977,88:4976,215:4559,216:$VP9},o($VA1,$VX5),o($VA1,$VK1),o($VA1,$Vl),o($VA1,$Vm),o($VA1,$Vn),o($VA1,$Vo),o($Vx2,$V31),o($Vx2,$V41),o($Vx2,$V51),o($VD1,$Vr5),o($VD1,$Vs5),{19:$VQ9,21:$VR9,22:4979,88:4978,215:4586,216:$VS9},o($Vx3,$Vi6),o($Vx3,$VK1),o($Vy3,$Vi6),o($Vy3,$VK1),o($Vz3,$Vi6),o($Vz3,$VK1),o($V77,$Vo8),o($V77,$Vp8),o($V77,$VU5),o($V77,$VV5),{120:[1,4980],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($V77,$VE1),o($V77,$VF1),{19:[1,4984],21:[1,4988],22:4982,34:4981,201:4983,215:4985,216:[1,4987],217:[1,4986]},o($V77,$Vq8),o($V77,$Vx6),o($Vr8,$Vy1,{94:4989}),o($V77,$Vz1,{100:4880,96:4990,102:$VZ9,103:$VO,104:$VP,105:$VQ}),o($Vr8,$VG1),o($Vr8,$VH1),o($Vr8,$VI1),o($Vr8,$VJ1),{101:[1,4991]},o($Vr8,$VT1),{71:[1,4992]},o($VT7,$Vq2,{100:4664,96:4993,102:$VT9,103:$VO,104:$VP,105:$VQ}),o($VS7,$Vr2),o($V77,$Vs2,{91:4994,96:4995,92:4996,100:4997,106:4999,108:5000,102:$V1a,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($V77,$Vu2,{91:4994,96:4995,92:4996,100:4997,106:4999,108:5000,102:$V1a,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($V77,$Vv2,{91:4994,96:4995,92:4996,100:4997,106:4999,108:5000,102:$V1a,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VW7,$Vw2),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,5001],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:5002,122:$VU2,149:$VV2,190:$VW2}),o($VV7,$Vy2),o($VV7,$V01),o($VV7,$V11),o($VV7,$Vl),o($VV7,$Vm),o($VV7,$V21),o($VV7,$Vn),o($VV7,$Vo),o($VS7,$V03),o($VW7,$V13),o($VW7,$V23),o($VW7,$V33),o($VW7,$V43),{112:[1,5003]},o($VW7,$V93),o($V77,$Vt5),{19:[1,5006],21:[1,5009],22:5005,88:5004,215:5007,216:[1,5008]},o($V77,$Vt5),{19:[1,5012],21:[1,5015],22:5011,88:5010,215:5013,216:[1,5014]},o($Vq9,$V31),o($Vq9,$V41),o($Vq9,$V51),o($Vt8,$Vr5),o($Vt8,$Vs5),{19:$VU9,21:$VV9,22:5017,88:5016,215:4709,216:$VW9},o($VA8,$V09),o($VF,$VG,{64:5018,74:5019,76:5020,77:5021,93:5024,95:5025,88:5027,89:5028,90:5029,79:5030,40:5031,96:5035,22:5036,92:5038,119:5039,100:5043,215:5046,106:5047,108:5048,19:[1,5045],21:[1,5050],70:[1,5022],72:[1,5023],80:[1,5040],81:[1,5041],82:[1,5042],86:[1,5026],97:[1,5032],98:[1,5033],99:[1,5034],102:$V2a,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW,162:[1,5037],216:[1,5049]}),o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:5051,122:$VU2,149:$VV2,190:$VW2}),o($VA8,$Vy2),o($VA8,$V01),o($VA8,$V11),o($VA8,$Vl),o($VA8,$Vm),o($VA8,$V21),o($VA8,$Vn),o($VA8,$Vo),o($VA8,$Vq2,{100:4748,96:5052,102:$VX9,103:$VO,104:$VP,105:$VQ}),o($Vs9,$Vr2),o($Vs9,$V03),o($VA8,$V29),o($V59,$VR3),o($V79,$VS3),o($V79,$VT3),o($V79,$VU3),{101:[1,5053]},o($V79,$VT1),{101:[1,5055],107:5054,109:[1,5056],110:[1,5057],111:5058,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,5059]},o($V79,$VW3),{122:[1,5060]},{19:[1,5063],21:[1,5066],22:5062,88:5061,215:5064,216:[1,5065]},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:5067,122:$VU2,149:$VV2,190:$VW2}),o($VA8,$Vy2),o($VA8,$V01),o($VA8,$V11),o($VA8,$Vl),o($VA8,$Vm),o($VA8,$V21),o($VA8,$Vn),o($VA8,$Vo),o($VA8,$Vq2,{100:4790,96:5068,102:$VY9,103:$VO,104:$VP,105:$VQ}),o($Vs9,$Vr2),o($Vs9,$V03),o($VA8,$V29),o($V59,$VR3),o($V79,$VS3),o($V79,$VT3),o($V79,$VU3),{101:[1,5069]},o($V79,$VT1),{101:[1,5071],107:5070,109:[1,5072],110:[1,5073],111:5074,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,5075]},o($V79,$VW3),{122:[1,5076]},{19:[1,5079],21:[1,5082],22:5078,88:5077,215:5080,216:[1,5081]},o($V79,$VX5),o($V79,$VK1),o($V79,$Vl),o($V79,$Vm),o($V79,$Vn),o($V79,$Vo),o($Vs4,$Vt5),{19:[1,5085],21:[1,5088],22:5084,88:5083,215:5086,216:[1,5087]},o($Vr1,$Vi6),o($Vr1,$VK1),o($Vt1,$Vi6),o($Vt1,$VK1),o($VD1,$Vi6),o($VD1,$VK1),o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:5089,122:$VU2,149:$VV2,190:$VW2}),o($V77,$Vy2),o($V77,$V01),o($V77,$V11),o($V77,$Vl),o($V77,$Vm),o($V77,$V21),o($V77,$Vn),o($V77,$Vo),o($V77,$Vq2,{100:4880,96:5090,102:$VZ9,103:$VO,104:$VP,105:$VQ}),o($Vr8,$Vr2),o($Vr8,$V03),o($V77,$V29),o($VS7,$VR3),o($VU7,$VS3),o($VU7,$VT3),o($VU7,$VU3),{101:[1,5091]},o($VU7,$VT1),{101:[1,5093],107:5092,109:[1,5094],110:[1,5095],111:5096,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,5097]},o($VU7,$VW3),{122:[1,5098]},{19:[1,5101],21:[1,5104],22:5100,88:5099,215:5102,216:[1,5103]},o($VU7,$VX5),o($VU7,$VK1),o($VU7,$Vl),o($VU7,$Vm),o($VU7,$Vn),o($VU7,$Vo),o($VU7,$VX5),o($VU7,$VK1),o($VU7,$Vl),o($VU7,$Vm),o($VU7,$Vn),o($VU7,$Vo),o($Vt8,$Vi6),o($Vt8,$VK1),o($VA8,$VN7),o($VA8,$VO7,{75:5105,77:5106,79:5107,40:5108,119:5109,80:[1,5110],81:[1,5111],82:[1,5112],120:$VG,126:$VG,128:$VG,190:$VG,228:$VG}),o($VA8,$VP7),o($VA8,$VO5,{78:5113,74:5114,93:5115,95:5116,96:5120,100:5121,97:[1,5117],98:[1,5118],99:[1,5119],102:$V3a,103:$VO,104:$VP,105:$VQ}),o($Vl1,$Vq,{42:157,40:159,39:5123,45:$Vm1,80:$Vn1,81:$Vo1,82:$Vp1}),o($VA8,$VR7),o($V59,$Vy1,{94:5124}),o($V69,$Vz1,{100:5043,96:5125,102:$V2a,103:$VO,104:$VP,105:$VQ}),o($V79,$VB1,{87:5126}),o($V79,$VB1,{87:5127}),o($V79,$VB1,{87:5128}),o($VA8,$VC1,{106:5047,108:5048,92:5129,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($V89,$VU5),o($V89,$VV5),o($V59,$VG1),o($V59,$VH1),o($V59,$VI1),o($V59,$VJ1),o($V79,$VK1),o($VL1,$VM1,{163:5130}),o($V99,$VO1),{120:[1,5131],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($V89,$VE1),o($V89,$VF1),{19:[1,5135],21:[1,5139],22:5133,34:5132,201:5134,215:5136,216:[1,5138],217:[1,5137]},{101:[1,5140]},o($V59,$VT1),o($V79,$Vl),o($V79,$Vm),{101:[1,5142],107:5141,109:[1,5143],110:[1,5144],111:5145,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,5146]},o($V79,$Vn),o($V79,$Vo),{122:[1,5147]},o($Vs9,$VR3),o($V79,$V03),o($V79,$V13),o($V79,$V23),o($V79,$V33),o($V79,$V43),{112:[1,5148]},o($V79,$V93),o($V89,$Vt5),o($V99,$VX5),o($V99,$VK1),o($V99,$Vl),o($V99,$Vm),o($V99,$Vn),o($V99,$Vo),{122:[1,5149]},o($Vs9,$VR3),o($V79,$V03),o($V79,$V13),o($V79,$V23),o($V79,$V33),o($V79,$V43),{112:[1,5150]},o($V79,$V93),o($V89,$Vt5),o($V99,$VX5),o($V99,$VK1),o($V99,$Vl),o($V99,$Vm),o($V99,$Vn),o($V99,$Vo),o($VS5,$VX5),o($VS5,$VK1),o($VS5,$Vl),o($VS5,$Vm),o($VS5,$Vn),o($VS5,$Vo),{122:[1,5151]},o($Vr8,$VR3),o($VU7,$V03),o($VU7,$V13),o($VU7,$V23),o($VU7,$V33),o($VU7,$V43),{112:[1,5152]},o($VU7,$V93),o($VV7,$Vt5),o($VW7,$VX5),o($VW7,$VK1),o($VW7,$Vl),o($VW7,$Vm),o($VW7,$Vn),o($VW7,$Vo),o($VA8,$Vo8),o($VA8,$Vp8),o($VA8,$VU5),o($VA8,$VV5),{120:[1,5153],123:182,124:183,125:184,126:$VP1,128:$VQ1,190:$VR1,218:186,228:$VS1},o($VA8,$VE1),o($VA8,$VF1),{19:[1,5157],21:[1,5161],22:5155,34:5154,201:5156,215:5158,216:[1,5160],217:[1,5159]},o($VA8,$Vq8),o($VA8,$Vx6),o($Vs9,$Vy1,{94:5162}),o($VA8,$Vz1,{100:5121,96:5163,102:$V3a,103:$VO,104:$VP,105:$VQ}),o($Vs9,$VG1),o($Vs9,$VH1),o($Vs9,$VI1),o($Vs9,$VJ1),{101:[1,5164]},o($Vs9,$VT1),{71:[1,5165]},o($V69,$Vq2,{100:5043,96:5166,102:$V2a,103:$VO,104:$VP,105:$VQ}),o($V59,$Vr2),o($VA8,$Vs2,{91:5167,96:5168,92:5169,100:5170,106:5172,108:5173,102:$V4a,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VA8,$Vu2,{91:5167,96:5168,92:5169,100:5170,106:5172,108:5173,102:$V4a,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($VA8,$Vv2,{91:5167,96:5168,92:5169,100:5170,106:5172,108:5173,102:$V4a,103:$VO,104:$VP,105:$VQ,113:$VR,114:$VS,115:$VT,116:$VU,117:$VV,118:$VW}),o($V99,$Vw2),{19:$Vz2,21:$VA2,22:349,72:$VB2,82:$VC2,101:$VD2,109:$VE2,110:$VF2,111:361,164:[1,5174],165:344,166:345,167:346,168:347,182:350,186:$VG2,197:355,198:356,199:357,202:360,205:$VH2,206:$VI2,207:$VJ2,208:$VK2,209:$VL2,210:$VM2,211:$VN2,212:$VO2,213:$VP2,214:$VQ2,215:354,216:$VR2},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:5175,122:$VU2,149:$VV2,190:$VW2}),o($V89,$Vy2),o($V89,$V01),o($V89,$V11),o($V89,$Vl),o($V89,$Vm),o($V89,$V21),o($V89,$Vn),o($V89,$Vo),o($V59,$V03),o($V99,$V13),o($V99,$V23),o($V99,$V33),o($V99,$V43),{112:[1,5176]},o($V99,$V93),o($VA8,$Vt5),{19:[1,5179],21:[1,5182],22:5178,88:5177,215:5180,216:[1,5181]},o($VA8,$Vt5),{19:[1,5185],21:[1,5188],22:5184,88:5183,215:5186,216:[1,5187]},o($V77,$Vt5),{19:[1,5191],21:[1,5194],22:5190,88:5189,215:5192,216:[1,5193]},o($VS2,$VT2,{127:376,131:377,132:378,133:379,137:380,138:381,139:382,145:383,147:384,148:385,121:5195,122:$VU2,149:$VV2,190:$VW2}),o($VA8,$Vy2),o($VA8,$V01),o($VA8,$V11),o($VA8,$Vl),o($VA8,$Vm),o($VA8,$V21),o($VA8,$Vn),o($VA8,$Vo),o($VA8,$Vq2,{100:5121,96:5196,102:$V3a,103:$VO,104:$VP,105:$VQ}),o($Vs9,$Vr2),o($Vs9,$V03),o($VA8,$V29),o($V59,$VR3),o($V79,$VS3),o($V79,$VT3),o($V79,$VU3),{101:[1,5197]},o($V79,$VT1),{101:[1,5199],107:5198,109:[1,5200],110:[1,5201],111:5202,207:$VU1,208:$VV1,209:$VW1,210:$VX1},{101:[1,5203]},o($V79,$VW3),{122:[1,5204]},{19:[1,5207],21:[1,5210],22:5206,88:5205,215:5208,216:[1,5209]},o($V79,$VX5),o($V79,$VK1),o($V79,$Vl),o($V79,$Vm),o($V79,$Vn),o($V79,$Vo),o($V79,$VX5),o($V79,$VK1),o($V79,$Vl),o($V79,$Vm),o($V79,$Vn),o($V79,$Vo),o($VU7,$VX5),o($VU7,$VK1),o($VU7,$Vl),o($VU7,$Vm),o($VU7,$Vn),o($VU7,$Vo),{122:[1,5211]},o($Vs9,$VR3),o($V79,$V03),o($V79,$V13),o($V79,$V23),o($V79,$V33),o($V79,$V43),{112:[1,5212]},o($V79,$V93),o($V89,$Vt5),o($V99,$VX5),o($V99,$VK1),o($V99,$Vl),o($V99,$Vm),o($V99,$Vn),o($V99,$Vo),o($VA8,$Vt5),{19:[1,5215],21:[1,5218],22:5214,88:5213,215:5216,216:[1,5217]},o($V79,$VX5),o($V79,$VK1),o($V79,$Vl),o($V79,$Vm),o($V79,$Vn),o($V79,$Vo)];
        this.defaultActions = {6:[2,11],23:[2,1],115:[2,121],116:[2,122],117:[2,123],124:[2,134],125:[2,135],196:[2,254],197:[2,255],198:[2,256],199:[2,257],308:[2,37],376:[2,144],377:[2,148],379:[2,150],568:[2,35],569:[2,39],606:[2,36],1153:[2,148],1155:[2,150]};
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
          shexj._locations = yy.locations;
        }
        return shexj;
      
// removed by dead control flow

case 2:
 yy.parser.yy = { lexer: yy.lexer} ; 
break;
case 15:
 // t: 1dot-base
        yy._setBase(yy._base === null ||
                    absoluteIRI.test($$[$0].slice(1, -1)) ? $$[$0].slice(1, -1) : yy._resolveIRI($$[$0].slice(1, -1)));
      
break;
case 16:
 // t: ShExParser-test.js/with pre-defined prefixes
        yy._prefixes[$$[$0-1].slice(0, -1)] = $$[$0];
      
break;
case 17:
 // t: 1dotIMPORT1dot
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
        yy.addShape($$[$0-3], Object.assign(
          {type: "ShapeDecl"}, $$[$0-4],
          $$[$0-2].length > 0 ? { restricts: $$[$0-2] } : { },
          {shapeExpr: $$[$0-1]} ), $$[$0-5], $$[$0])	// t: 0.json
      
break;
case 27:
 this.$ = yy.lexer.yylloc; /* yy.lexer.showPosition(); */ 
break;
case 28:
this.$ = {  };
break;
case 29:
this.$ = { abstract: true };
break;
case 30:
this.$ = [] // t: 1dot, 1dotAnnot3;
break;
case 31:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotAnnot3;
break;
case 32:

        this.$ = nonest($$[$0]);
      
break;
case 34:
this.$ = { type: "ShapeExternal" };
break;
case 35:

        if ($$[$0-2])
          $$[$0-1] = { type: "ShapeNot", "shapeExpr": nonest($$[$0-1]) };	// t: 1NOTNOTIRI
        if ($$[$0]) { // If there were disjuncts or conjuncts,
          //           shapeOr will have $$[$0].set needsAtom.
          //           Prepend $$[$0].needsAtom with $$[$0-1].
          //           Note that $$[$0] may be a ShapeOr or a ShapeAnd.
          if ($$[$0-1].type === 'ShapeAnd' && $$[$0].type === 'ShapeAnd' && !$$[$0-1].nested && !$$[$0].nested) {
            // $$[$0].annotations = $$[$0].shapeExprs[0].annotations;
            // delete $$[$0].shapeExprs[0].annotations;
            // $$[$0-1].semActs = $$[$0-1].shapeExprs[0].semActs;
            // delete $$[$0].shapeExprs[0].semActs;
            $$[$0].shapeExprs.splice(0, 0, ...$$[$0-1].shapeExprs)
          } else {
            $$[$0].needsAtom.unshift(nonest($$[$0-1])); // t: focusbnode0ORfocusPattern0
          }
          delete $$[$0].needsAtom;
          this.$ = $$[$0];	// t: 1NOT_literalANDvs_
        } else {
          this.$ = $$[$0-1];	// t: 0
        }
      
break;
case 36:

        $$[$0-1] = { type: "ShapeNot", "shapeExpr": nonest($$[$0-1]) }	// t: focusNOTRefOR1dot !!! opt
        if ($$[$0]) { // If there were disjuncts,
          //           shapeOr will have $$[$0].set needsAtom.
          //           Prepend $$[$0].needsAtom with $$[$0-1].
          //           Note that $$[$0] may be a ShapeOr or a ShapeAnd.
          $$[$0].needsAtom.unshift(nonest($$[$0-1]));
          delete $$[$0].needsAtom;
          this.$ = $$[$0];	// t: focusNOTRefOR1dot
        } else {
          this.$ = $$[$0-1];	// t: TwoNegation
        }
      
break;
case 37:

        $$[$0].needsAtom.unshift(nonest($$[$0-1]));
        delete $$[$0].needsAtom;
        this.$ = $$[$0]; // { type: "ShapeOr", "shapeExprs": [$$[$0-1]].concat($$[$0]) };
      
break;
case 38:
this.$ = null	// t: 0;
break;
case 39:
this.$ = $$[$0]	// t: 1NOT_literalANDvs_;
break;
case 41:
 // returns a ShapeOr
        const shapeExprs = $$[$0].map(nonest);
        this.$ = { type: "ShapeOr", shapeExprs: shapeExprs, needsAtom: shapeExprs }; // t: 1val1vExprRefOR3
      
break;
case 42:
 // returns a ShapeAnd
        // $$[$0-1] could have implicit conjuncts and explicit nested ANDs (will have .nested: true)
        $$[$0-1].filter(c => c.type === "ShapeAnd").length === $$[$0-1].length
        const and = {
          type: "ShapeAnd",
          shapeExprs: $$[$0-1].reduce(
            (acc, elt) =>
              acc.concat(elt.type === 'ShapeAnd' && !elt.nested ? elt.shapeExprs : nonest(elt)), [] // t: 1dotANDopen1dotAND1dotclose : @@
          )
        };
        this.$ = $$[$0].length > 0 ? { type: "ShapeOr", shapeExprs: [and].concat($$[$0].map(nonest)) } : and; // t: focusbnode0ORfocusPattern0 : 1val1vExprRefAND3
        this.$.needsAtom = and.shapeExprs;
      
break;
case 43: case 46: case 190: case 249: case 270: case 274:
this.$ = $$[$0];
break;
case 44:
this.$ = [$$[$0]] // t: 1val1vExprRefOR3;
break;
case 45:
this.$ = $$[$0-1].concat($$[$0]) // t: 1val1vExprRefOR3;
break;
case 47:
this.$ = [$$[$0]] // t: 1val1vExprRefAND3;
break;
case 48:
this.$ = $$[$0-1].concat($$[$0]) // t: 1val1vExprRefAND3;
break;
case 49:
this.$ = [] // t: 1val1vExprRefAND3;
break;
case 50: case 57:
this.$ = $$[$0-1].concat($$[$0]) // t: focusbnode0ORfocusPattern0;
break;
case 51:
this.$ = shapeJunction("ShapeOr", $$[$0-1], $$[$0]) // t: 1dot;
break;
case 52:
this.$ = $$[$0] // t: 1dotRefOR3;
break;
case 53: case 60:
this.$ = [] // t: 1dot;
break;
case 54:
this.$ = $$[$0-1].concat($$[$0]) // t: 1dotRefOR3;
break;
case 55:
this.$ = shapeJunction("ShapeAnd", $$[$0-1], $$[$0])	// t: focusbnode0ORfocusPattern0;
break;
case 56:
this.$ = [] // t: 1val1vExprRefOR3;
break;
case 58:
this.$ = shapeJunction("ShapeAnd", $$[$0-1], $$[$0])	// t: 1iriRef1;
break;
case 59:
this.$ = $$[$0] // t: 1iriRef1;
break;
case 61:
this.$ = $$[$0-1].concat($$[$0]) // t: 1iriRef1;
break;
case 62:
this.$ = $$[$0-1] ? { type: "ShapeNot", "shapeExpr": nonest($$[$0]) } : $$[$0] // t: 1val1vExprRefAND3 : OneNegation;
break;
case 63:
this.$ = false // t: 0;
break;
case 64:
this.$ = true // t: 1NOTIRI;
break;
case 65:
this.$ = $$[$0-1] ? { type: "ShapeNot", "shapeExpr": nonest($$[$0]) } /* t: 1NOTNOTdot, 1NOTNOTIRI, 1NOTNOTvs */ : $$[$0] // t: 1NOTIRI : 1dot;
break;
case 66:
this.$ = $$[$0] ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $$[$0-1]), $$[$0] ] } : $$[$0-1] // t: focusbnode0ORfocusPattern0 : focusvsANDIRI;
break;
case 68:
this.$ = $$[$0] ? shapeJunction("ShapeAnd", $$[$0-1], [$$[$0]]) /* t: 1dotRef1 */ : $$[$0-1] // t: @@ : 1val1vExprRefAND3;
break;
case 69: case 78:
this.$ = Object.assign($$[$0-1], {nested: true}) // t: NOT1dotOR2dotX3;
break;
case 70:
this.$ = yy.EmptyShape // t: @@;
break;
case 75:
this.$ = $$[$0] ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $$[$0-1]), $$[$0] ] } : $$[$0-1] // t: 0focusIRI : 1NOTNOTIRI;
break;
case 77:
this.$ = $$[$0] ? shapeJunction("ShapeAnd", $$[$0-1], [$$[$0]]) : $$[$0-1]	 // t: @@ : 0 // 1dotRef1 -- use _QnonLitNodeConstraint_E_Opt like below?;
break;
case 79:
this.$ = yy.EmptyShape // t: 1NOTNOTdot;
break;
case 80:
this.$ = $$[$0] ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $$[$0-1]), $$[$0] ] } : $$[$0-1] // t: 1iriRef1 : 1iri;
break;
case 82:
this.$ = $$[$0] ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $$[$0-1]), $$[$0] ] } : $$[$0-1] // t: @@ : 1dotRef1;
break;
case 83:
this.$ = Object.assign($$[$0-1], {nested: true}) // t: 1NOTNOTIRI;
break;
case 84:
this.$ = yy.EmptyShape // t: 1dot;
break;
case 93:
 // t: 1dotRefLNex1
        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        const namePos = $$[$0].indexOf(':');
        this.$ = yy.addSourceMap(yy.expandPrefix($$[$0].substr(0, namePos), yy) + $$[$0].substr(namePos + 1)); // ShapeRef
      
break;
case 94:
 // t: 1dotRefNS1
        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        this.$ = yy.addSourceMap(yy.expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy)); // ShapeRef
      
break;
case 95:
this.$ = yy.addSourceMap($$[$0]) // ShapeRef // t: 1dotRef1, 1dotRefSpaceLNex, 1dotRefSpaceNS1;
break;
case 96:

        this.$ = $$[$0-2]
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: @@ : 1val1refvsMinusiri3
        if ($$[$0]) { this.$.semActs = $$[$0].semActs; } // t: @@ : 1val1refvsMinusiri3
      
break;
case 97:
this.$ = [] // t: 0, 1dot, 1dotAnnot3;
break;
case 98:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotAnnotIRIREF, 1dotAnnot3;
break;
case 99:

        this.$ = $$[$0-2]
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: @@ : 1NOTNOTIRI
        if ($$[$0]) { this.$.semActs = $$[$0].semActs; } // t: @@ : 1NOTNOTIRI
      
break;
case 100:
this.$ = extend({ type: "NodeConstraint", nodeKind: "literal" }, $$[$0]) // t: 1literal;
break;
case 101:

        if (numericDatatypes.indexOf($$[$0-1]) === -1)
          numericFacets.forEach(function (facet) {
            if (facet in $$[$0]) // 1unknowndatatypeMaxInclusive
              yy.error(new Error("Parse error: facet " + facet + " not allowed for unknown datatype " + $$[$0-1]));
          });
        this.$ = extend({ type: "NodeConstraint", datatype: $$[$0-1] }, $$[$0]) // t: 1datatype
      
break;
case 102:
this.$ = { type: "NodeConstraint", values: $$[$0-1] } // t: 1val1IRIREF;
break;
case 103:
this.$ = extend({ type: "NodeConstraint"}, $$[$0]) // @@;
break;
case 104:
this.$ = {} // t: 1literal;
break;
case 105:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          yy.error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"));
        }
        this.$ = extend($$[$0-1], $$[$0]) // t: 1datatypeLength
      
break;
case 107:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          yy.error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"));
        }
        this.$ = extend($$[$0-1], $$[$0]) // t: !! look to 1literalLength
      
break;
case 108:
this.$ = extend({ type: "NodeConstraint" }, $$[$0-1], $$[$0] ? $$[$0] : {}) // t: 1iriPattern;
break;
case 109:
this.$ = extend({ type: "NodeConstraint" }, $$[$0]) // t: 1Length;
break;
case 110:
this.$ = {} // 1iri;
break;
case 111: case 113:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          yy.error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"));
        }
        this.$ = extend($$[$0-1], $$[$0])
      
break;
case 114:
this.$ = { nodeKind: "iri" } // t: 1iriPattern;
break;
case 115:
this.$ = { nodeKind: "bnode" } // t: 1bnodeLength;
break;
case 116:
this.$ = { nodeKind: "nonliteral" } // t: 1nonliteralLength;
break;
case 119:
this.$ = keyValObject($$[$0-1], parseInt($$[$0], 10)) // t: 1literalLength;
break;
case 120:
this.$ = unescapeRegexp($$[$0]) // t: 1literalPattern;
break;
case 121:
this.$ = "length" // t: 1literalLength;
break;
case 122:
this.$ = "minlength" // t: 1literalMinlength;
break;
case 123:
this.$ = "maxlength" // t: 1literalMaxlength;
break;
case 124:
this.$ = keyValObject($$[$0-1], $$[$0]) // t: 1literalMininclusive;
break;
case 125:
this.$ = keyValObject($$[$0-1], parseInt($$[$0], 10)) // t: 1literalTotaldigits;
break;
case 126:
this.$ = parseInt($$[$0], 10) // t: 1floatMininclusiveINTEGER;
break;
case 127:
this.$ = parseFloat($$[$0]) // t: 1integerMininclusiveDECIMAL;
break;
case 128:
this.$ = parseFloat($$[$0]) // t: 1integerMininclusiveDOUBLE;
break;
case 129:
 // ## deprecated
        if ($$[$0] === XSD_DECIMAL || $$[$0] === XSD_FLOAT || $$[$0] === XSD_DOUBLE) // t: @@
          this.$ = parseFloat($$[$0-2].value);
      else if (numericDatatypes.indexOf($$[$0]) !== -1) // t: @@
          this.$ = parseInt($$[$0-2].value)
        else // t: negativeSyntax/1decimalMininclusiveroman-numeral
          yy.error(new Error("Parse error: numeric range facet expected numeric datatype instead of " + $$[$0]));
      
break;
case 130:
this.$ = "mininclusive" // t: 1literalMininclusive;
break;
case 131:
this.$ = "minexclusive" // t: 1literalMinexclusive;
break;
case 132:
this.$ = "maxinclusive" // t: 1literalMaxinclusive;
break;
case 133:
this.$ = "maxexclusive" // t: 1literalMaxexclusive;
break;
case 134:
this.$ = "totaldigits" // t: 1literalTotaldigits;
break;
case 135:
this.$ = "fractiondigits" // t: 1literalFractiondigits;
break;
case 136:
 // t: 1dotExtend3
        this.$ = $$[$0-2] === yy.EmptyShape ? { type: "Shape" } : $$[$0-2]; // t: @@ : 1dot
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: 1dotShapeAnnotIRIREF : 0
        if ($$[$0]) { this.$.semActs = $$[$0].semActs; } // t: 1dotShapeCode1 : 0
      
break;
case 137:
 // t: 1dotExtend3
        const exprObj = $$[$0-1] ? { expression: $$[$0-1] } : yy.EmptyObject; // t: 1dot : 1focusMissingRefdot
        this.$ = (exprObj === yy.EmptyObject && $$[$0-3] === yy.EmptyObject)
	  ? yy.EmptyShape
	  : extend({ type: "Shape" }, exprObj, $$[$0-3]); // t: @@ : 1dot
      
break;
case 138:
this.$ = [ "extends", [$$[$0]] ] // t: 1dotExtend1;
break;
case 139:
this.$ = [ "extra", $$[$0] ] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3;
break;
case 140:
this.$ = [ "closed", true ] // t: 1dotClosed;
break;
case 141:
this.$ = yy.EmptyObject;
break;
case 142:

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
case 145:
this.$ = $$[$0] // t: 1dotExtra1, 3groupdot3Extra;
break;
case 146:
this.$ = [$$[$0]] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3;
break;
case 147:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 3groupdotExtra3;
break;
case 151:
this.$ = { type: "OneOf", expressions: unionAll([$$[$0-1]], $$[$0]) } // t: 2oneOfdot;
break;
case 152:
this.$ = $$[$0] // t: 2oneOfdot;
break;
case 153:
this.$ = [$$[$0]] // t: 2oneOfdot;
break;
case 154:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 2oneOfdot;
break;
case 157:
this.$ = $$[$0-1] // t: 1dot;
break;
case 161:
this.$ = { type: "EachOf", expressions: unionAll([$$[$0-2]], $$[$0-1]) } // t: 2groupOfdot;
break;
case 162:
this.$ = $$[$0] // @Deprecated;
break;
case 163:
this.$ = $$[$0] // t: 2groupOfdot;
break;
case 164:
this.$ = [$$[$0]] // t: 2groupOfdot;
break;
case 165:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 3Eachdot;
break;
case 166:

        if ($$[$0-1]) { // t: 2EachInclude1
          this.$ = extend({ id: $$[$0-1] }, $$[$0]);
          yy.addProduction($$[$0-1],  this.$);
        } else { // t: 1dot
          this.$ = $$[$0]
        }
      
break;
case 168:
this.$ = yy.addSourceMap($$[$0]) // t: 2EachInclude1;
break;
case 173:

        // t: open1dotOr1dot, !openopen1dotcloseCode1closeCode2
        this.$ = $$[$0-4];
        // Copy all of the new attributes into the encapsulated shape.
        if ("min" in $$[$0-2]) { this.$.min = $$[$0-2].min; } // t: 1cardOpt : @@
        if ("max" in $$[$0-2]) { this.$.max = $$[$0-2].max; } // t: 1cardOpt : @@
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: open3EachdotcloseAnnot3 : 1dot
        if ($$[$0]) {
          this.$.semActs = "semActs" in $$[$0-4]
            ? $$[$0-4].semActs.concat($$[$0].semActs) // t: 1dotCode3
            : $$[$0].semActs; // t: 1dotCode1
        } // t: 1dotCode1 : @@
      
break;
case 174:
this.$ = {} // t: 1dot;
break;
case 176:

        // $$[$0]: t: 1dotCode1
	// if ($$[$0-3] !== yy.EmptyShape && false) {
	//   const t = yy.blank();
	//   yy.addShape(t, $$[$0-3]);
	//   $$[$0-3] = t; // ShapeRef
	// }
        // %7: t: 1inversedotCode1
        this.$ = Object.assign(
          { type: "TripleConstraint" },
          $$[$0-5],
          { predicate: $$[$0-4] },
          ($$[$0-3] === yy.EmptyShape ? {} : { valueExpr: $$[$0-3] }), // 1dot : 1iri
          $$[$0-2],
          $$[$0]
        ); // t: 1dot, 1inversedot
        if ($$[$0-1].length)
          this.$["annotations"] = $$[$0-1]; // t: 1dotAnnot3, 1inversedotAnnot3 : 1dot
      
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
this.$ = $$[$0-1] // t: 1val1IRIREF;
break;
case 185:
this.$ = [] // t: 1val1IRIREF;
break;
case 186:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1IRIREF;
break;
case 191:
this.$ = [$$[$0]] // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 192:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 193:
this.$ = [$$[$0]] // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 194:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 195:
this.$ = [$$[$0]] // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 196:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 197:
this.$ = { type: "IriStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 198:
this.$ = { type: "LiteralStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 199:
this.$ = { type: "LanguageStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 200:

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
case 201:
this.$ = [] // t: 1val1iriStem, 1val1iriStemMinusiri3;
break;
case 202:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1iriStemMinusiri3;
break;
case 203:
this.$ = $$[$0] // t: 1val1iriStemMinusiri3;
break;
case 206:
this.$ = $$[$0] ? { type: "IriStem", stem: $$[$0-1] } /* t: 1val1iriStemMinusiriStem3 */ : $$[$0-1] // t: 1val1iriStemMinusiri3;
break;
case 209:

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
case 210:
this.$ = [] // t: 1val1literalStem, 1val1literalStemMinusliteral3;
break;
case 211:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1literalStemMinusliteral3;
break;
case 212:
this.$ = $$[$0] // t: 1val1literalStemMinusliteral3;
break;
case 215:
this.$ = $$[$0] ? { type: "LiteralStem", stem: $$[$0-1].value } /* t: 1val1literalStemMinusliteral3 */ : $$[$0-1].value // t: 1val1literalStemMinusliteralStem3;
break;
case 216:

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
case 217:

        this.$ = {  // t: @@
          type: $$[$0].length ? "LanguageStemRange" : "LanguageStem",
          stem: ""
        };
        if ($$[$0].length)
          this.$["exclusions"] = $$[$0]; // t: @@
      
break;
case 218:
this.$ = [] // t: 1val1languageStem, 1val1languageStemMinuslanguage3;
break;
case 219:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1languageStemMinuslanguage3;
break;
case 220:
this.$ = $$[$0] // t: 1val1languageStemMinuslanguage3;
break;
case 223:
this.$ = $$[$0] ? { type: "LanguageStem", stem: $$[$0-1] } /* t: 1val1languageStemMinuslanguageStem3 */ : $$[$0-1] // t: 1val1languageStemMinuslanguage3;
break;
case 224:
this.$ = yy.addSourceMap($$[$0]) // Inclusion // t: 2groupInclude1;
break;
case 225:
this.$ = { type: "Annotation", predicate: $$[$0-1], object: $$[$0] } // t: 1dotAnnotIRIREF;
break;
case 228:
this.$ = $$[$0].length ? { semActs: $$[$0] } : null // t: 1dotCode1/2oneOfDot;
break;
case 229:
this.$ = [] // t: 1dot, 1dotCode1;
break;
case 230:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotCode1;
break;
case 231:
this.$ = $$[$0] ? unescapeSemanticAction($$[$0-1], $$[$0]) /* t: 1dotCode1 */ : { type: "SemAct", name: $$[$0-1] } // t: 1dotNoCode1;
break;
case 233: case 250:
this.$ = null;
break;
case 238:
this.$ = RDF_TYPE // t: 1AvalA;
break;
case 244:
this.$ = createLiteral($$[$0], XSD_INTEGER) // t: 1val1INTEGER;
break;
case 245:
this.$ = createLiteral($$[$0], XSD_DECIMAL) // t: 1val1DECIMAL;
break;
case 246:
this.$ = createLiteral($$[$0], XSD_DOUBLE) // t: 1val1DOUBLE;
break;
case 248:
this.$ = $$[$0] ? extend($$[$0-1], { type: $$[$0] }) : $$[$0-1] // t: 1val1Datatype;
break;
case 252:
this.$ = { value: "true", type: XSD_BOOLEAN } // t: 1val1true;
break;
case 253:
this.$ = { value: "false", type: XSD_BOOLEAN } // t: 1val1false;
break;
case 254:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL2;
break;
case 255:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL1;
break;
case 256:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL_LONG2;
break;
case 257:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG1;
break;
case 258:
this.$ = unescapeLangString($$[$0], 1)	// t: @@;
break;
case 259:
this.$ = unescapeLangString($$[$0], 3)	// t: @@;
break;
case 260:
this.$ = unescapeLangString($$[$0], 1)	// t: 1val1LANGTAG;
break;
case 261:
this.$ = unescapeLangString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG2_with_LANGTAG;
break;
case 262:
 // t: 1dot
        const unesc = ShExUtil.unescapeText($$[$0].slice(1,-1), {});
        this.$ = yy._base === null || absoluteIRI.test(unesc) ? unesc : yy._resolveIRI(unesc)
      
break;
case 264:
 // t:1dotPNex, 1dotPNdefault, ShExParser-test.js/with pre-defined prefixes
        const namePos1 = $$[$0].indexOf(':');
        this.$ = yy.expandPrefix($$[$0].substr(0, namePos1), yy) + ShExUtil.unescapeText($$[$0].substr(namePos1 + 1), pnameEscapeReplacements);
      
break;
case 265:
 // t: 1dotNS2, 1dotNSdefault, ShExParser-test.js/PNAME_NS with pre-defined prefixes
        this.$ = yy.expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy);
      
break;
case 267:
this.$ = $$[$0] // t: 0Extends1, 1dotExtends1, 1dot3ExtendsLN;
break;
case 269:
this.$ = shapeJunction("ShapeOr", $$[$0-1], $$[$0]);
break;
case 271: case 275:
this.$ = [];
break;
case 272: case 276:
this.$ = $$[$0-1].concat($$[$0]);
break;
case 273:
this.$ = shapeJunction("ShapeAnd", $$[$0-1], $$[$0]);
break;
case 277:
this.$ = $$[$0-1] ? { type: "ShapeNot", "shapeExpr": nonest($$[$0]) } : $$[$0];
break;
case 278: case 280:
this.$ = $$[$0] ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $$[$0-1]), $$[$0] ] } : $$[$0-1];
break;
case 281:
this.$ = Object.assign($$[$0-1], {nested: true});
break;
case 282:
this.$ = yy.EmptyShape;
break;
case 285:
this.$ = $$[$0] // t: @_$[$0-1]dotSpecialize1, @_$[$0-1]dot3Specialize, @_$[$0-1]dotSpecialize3;
break;
        }
    }
}

// Export module
__webpack_unused_export__ = ({ value: true });
exports.JY = ShExJisonParser;


/* generated by @ts-jison/lexer-generator 0.4.1-alpha.2 */
const { JisonLexer } = __webpack_require__(7450);

class ShExJisonLexer extends JisonLexer {
    constructor (yy = {}) {
        super(yy);
        this.options = {"moduleName":"ShExJison"};
        this.rules = [
        /^(?:\s+|#[^\u000a\u000d]*|\/\*(?:[^*]|\*(?:[^/]|\\\/))*\*\/)/,
        /^(?:@(?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])(?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]|\.)*(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|:|[0-9]|%(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\(?:_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))(?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]|\.|:|%(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\(?:_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))*(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]|:|%(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\(?:_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%)))?)/,
        /^(?:@(?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])(?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]|\.)*(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)/,
        /^(?:@[A-Za-z]+(?:-[0-9A-Za-z]+)*)/,
        /^(?:@)/,
        /^(?:(?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])(?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]|\.)*(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|:|[0-9]|%(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\(?:_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))(?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]|\.|:|%(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\(?:_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))*(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]|:|%(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\(?:_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%)))?)/,
        /^(?:\{[+-]?[0-9]+(?:,(?:[+-]?[0-9]+|\*)?)?\})/,
        /^(?:[+-]?(?:[0-9]+\.[0-9]*[Ee][+-]?[0-9]+|\.?[0-9]+[Ee][+-]?[0-9]+))/,
        /^(?:[+-]?[0-9]*\.[0-9]+)/,
        /^(?:[+-]?[0-9]+)/,
        /^(?:<(?:[^\u0000-\u0020<>\"{}|^`\\]|\\u(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\U(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f]))*>)/,
        /^(?:(?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])(?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]|\.)*(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)/,
        /^(?:a\b)/,
        /^(?:\/(?:[^\u002f\u005C\u000A\u000D]|\\[nrt\\|.?*+(){}$\u002D\u005B\u005D\u005E/]|\\u(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\U(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f]))+\/[smix]*)/,
        /^(?:_:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|[0-9])(?:(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]|\.)*(?:[A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF]|_|_|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)/,
        /^(?:\{(?:[^%\\]|\\[%\\]|\\u(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\U(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f]))*%\})/,
        /^(?:'''(?:(?:'|'')?(?:[^\'\\]|\\[\"\'\\bfnrt]|\\u(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\U(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])))*'''@[A-Za-z]+(?:-[0-9A-Za-z]+)*)/,
        /^(?:"""(?:(?:"|"")?(?:[^\"\\]|\\[\"\'\\bfnrt]|\\u(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\U(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])))*"""@[A-Za-z]+(?:-[0-9A-Za-z]+)*)/,
        /^(?:'(?:[^\u0027\u005c\u000a\u000d]|\\[\"\'\\bfnrt]|\\u(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\U(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f]))*'@[A-Za-z]+(?:-[0-9A-Za-z]+)*)/,
        /^(?:"(?:[^\u0022\u005c\u000a\u000d]|\\[\"\'\\bfnrt]|\\u(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\U(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f]))*"@[A-Za-z]+(?:-[0-9A-Za-z]+)*)/,
        /^(?:'''(?:(?:'|'')?(?:[^\'\\]|\\[\"\'\\bfnrt]|\\u(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\U(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])))*''')/,
        /^(?:"""(?:(?:"|"")?(?:[^\"\\]|\\[\"\'\\bfnrt]|\\u(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\U(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])))*""")/,
        /^(?:'(?:[^\u0027\u005c\u000a\u000d]|\\[\"\'\\bfnrt]|\\u(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\U(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f]))*')/,
        /^(?:"(?:[^\u0022\u005c\u000a\u000d]|\\[\"\'\\bfnrt]|\\u(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])|\\U(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f])(?:[0-9]|[A-F]|[a-f]))*")/,
        /^(?:[Bb][Aa][Ss][Ee])/,
        /^(?:[Pp][Rr][Ee][Ff][Ii][Xx])/,
        /^(?:[iI][mM][pP][oO][rR][tT])/,
        /^(?:[sS][tT][aA][rR][tT])/,
        /^(?:[eE][xX][tT][eE][rR][nN][aA][lL])/,
        /^(?:[Aa][Bb][Ss][Tt][Rr][Aa][Cc][Tt])/,
        /^(?:[Rr][Ee][Ss][Tt][Rr][Ii][Cc][Tt][Ss])/,
        /^(?:[Ee][Xx][Tt][Ee][Nn][Dd][Ss])/,
        /^(?:[Cc][Ll][Oo][Ss][Ee][Dd])/,
        /^(?:[Ee][Xx][Tt][Rr][Aa])/,
        /^(?:[Ll][Ii][Tt][Ee][Rr][Aa][Ll])/,
        /^(?:[Bb][Nn][Oo][Dd][Ee])/,
        /^(?:[Ii][Rr][Ii])/,
        /^(?:[Nn][Oo][Nn][Ll][Ii][Tt][Ee][Rr][Aa][Ll])/,
        /^(?:[Aa][Nn][Dd])/,
        /^(?:[Oo][Rr])/,
        /^(?:[No][Oo][Tt])/,
        /^(?:[Mm][Ii][Nn][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee])/,
        /^(?:[Mm][Ii][Nn][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee])/,
        /^(?:[Mm][Aa][Xx][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee])/,
        /^(?:[Mm][Aa][Xx][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee])/,
        /^(?:[Ll][Ee][Nn][Gg][Tt][Hh])/,
        /^(?:[Mm][Ii][Nn][Ll][Ee][Nn][Gg][Tt][Hh])/,
        /^(?:[Mm][Aa][Xx][Ll][Ee][Nn][Gg][Tt][Hh])/,
        /^(?:[Tt][Oo][Tt][Aa][Ll][Dd][Ii][Gg][Ii][Tt][Ss])/,
        /^(?:[Ff][Rr][Aa][Cc][Tt][Ii][Oo][Nn][Dd][Ii][Gg][Ii][Tt][Ss])/,
        /^(?:=)/,
        /^(?:\/\/)/,
        /^(?:\{)/,
        /^(?:\})/,
        /^(?:&)/,
        /^(?:\|\|)/,
        /^(?:\|)/,
        /^(?:,)/,
        /^(?:\()/,
        /^(?:\))/,
        /^(?:\[)/,
        /^(?:\])/,
        /^(?:\$)/,
        /^(?:!)/,
        /^(?:\^\^)/,
        /^(?:\^)/,
        /^(?:\.)/,
        /^(?:~)/,
        /^(?:;)/,
        /^(?:\*)/,
        /^(?:\+)/,
        /^(?:\?)/,
        /^(?:-)/,
        /^(?:%)/,
        /^(?:true\b)/,
        /^(?:false\b)/,
        /^(?:$)/,
        /^(?:[a-zA-Z0-9_-]+)/,
        /^(?:.)/
    ];
        this.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78],"inclusive":true}};
    }
    performAction (yy, yy_, $avoiding_name_collisions, YY_START) {
              let YYSTATE = YY_START;
            switch ($avoiding_name_collisions) {
    case 0:
  // space eaten by whitespace and comments
  if (yy.skipped.last_line === yy_.yylloc.first_line &&
      yy.skipped.last_column === yy_.yylloc.first_column) {
    // immediately follows a skipped span
    yy.skipped.last_line = yy_.yylloc.last_line;
    yy.skipped.last_column = yy_.yylloc.last_column;
  } else {
    // follows something else
    yy.skipped = yy_.yylloc
  };

      break;
    case 1:return 80;
    case 2:return 81;
    case 3: yy_.yytext = yy_.yytext.substr(1); return 186; 
    case 4:return 82;
    case 5:return 216;
    case 6:return 160;
    case 7:return 110;
    case 8:return 109;
    case 9:return 101;
    case 10:return 19;
    case 11:return 21;
    case 12:return 200;
    case 13:return 102;
    case 14:return 217;
    case 15:return 196;
    case 16:return 212;
    case 17:return 214;
    case 18:return 211;
    case 19:return 213;
    case 20:return 208;
    case 21:return 210;
    case 22:return 207;
    case 23:return 209;
    case 24:return 18;
    case 25:return 20;
    case 26:return 23;
    case 27:return 26;
    case 28:return 41;
    case 29:return 37;
    case 30:return 230;
    case 31:return 228;
    case 32:return 126;
    case 33:return 128;
    case 34:return 86;
    case 35:return 98;
    case 36:return 97;
    case 37:return 99;
    case 38:return 54;
    case 39:return 52;
    case 40:return 45;
    case 41:return 113;
    case 42:return 114;
    case 43:return 115;
    case 44:return 116;
    case 45:return 103;
    case 46:return 104;
    case 47:return 105;
    case 48:return 117;
    case 49:return 118;
    case 50:return 27;
    case 51:return 191;
    case 52:return 120;
    case 53:return 122;
    case 54:return 190;
    case 55:return '||';
    case 56:return 136;
    case 57:return 141;
    case 58:return 70;
    case 59:return 71;
    case 60:return 162;
    case 61:return 164;
    case 62:return 149;
    case 63:return '!';
    case 64:return 112;
    case 65:return 161;
    case 66:return 72;
    case 67:return 179;
    case 68:return 142;
    case 69:return 157;
    case 70:return 158;
    case 71:return 159;
    case 72:return 180;
    case 73:return 194;
    case 74:return 205;
    case 75:return 206;
    case 76:return 7;
    case 77:return 'unexpected word "'+yy_.yytext+'"';
    case 78:return 'invalid character '+yy_.yytext;
        }
    }
}


// Export module
__webpack_unused_export__ = ({ value: true });
__webpack_unused_export__ = ShExJisonLexer;



/***/ },

/***/ 8170
(module, __unused_webpack_exports, __webpack_require__) {

const ShExParserCjsModule = (function () {

const ShExJisonParser = (__webpack_require__(4613)/* .ShExJisonParser */ .JY);

const schemeAuthority = /^(?:([a-z][a-z0-9+.-]*:))?(?:\/\/[^\/]*)?/i,
    dotSegments = /(?:^|\/)\.\.?(?:$|[\/#?])/;

class ShExCParserState {
  constructor () {
    this.blankId = 0;
    this._fileName = undefined; // for debugging
    this.EmptyObject = {  };
    this.EmptyShape = { type: "Shape" };
    this.skipped = { // space eaten by whitespace and comments
      first_line: 0,
      first_column: 0,
      last_line: 0,
      last_column: 0,
    };
    this.locations = {  };
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
      // removed by dead control flow

    }
  }

  // Expand declared prefix or throw Error
  expandPrefix (prefix) {
    if (!(prefix in this._prefixes))
      this.error(new Error('Parse error; unknown prefix "' + prefix + ':"'));
    return this._prefixes[prefix];
  }

  // Add a shape to the list of shape(Expr)s
  addShape (label, shape, start, end) {
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
      this.locations[label] = this.makeLocation(start, end);
    }
  }

  makeLocation (start, end) {
    if (end.first_line === this.skipped.last_line && end.first_column === this.skipped.last_column)
      end = this.skipped
    return {
      filename: this._fileName,
      first_line: start.first_line,
      first_column: start.first_column,
      last_line: end.first_line,
      last_column: end.first_column,
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


/***/ },

/***/ 2130
(__unused_webpack_module, exports, __webpack_require__) {

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
const RelativizeIri = (__webpack_require__(2962).relativize);
// import {relativize as RelativizeIri} from "relativize-url"; // someone should lecture the maintainer
const rdf_data_factory_1 = __webpack_require__(8050);
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
    else if (typeof node === "object" && "value" in node) {
        let value = node.value;
        const type = node.type;
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
                throw Error(`Unrecognized attributes in JSON-LD-style object literal: ${JSON.stringify(Object.keys(copy))}`);
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

/***/ },

/***/ 4717
(module, __unused_webpack_exports, __webpack_require__) {

const ShExUtil = __webpack_require__(8822);
const {ShExIndexVisitor} = __webpack_require__(9522);

/**
 *
 * Collision API:
 *   @param type element of schema: imports|start|startActs|_locations...
 *   @param left structure with duplicated item.
 *   @param right structure with introducing duplicate item.
 *   @param leftLloc? yylloc structure for source of left item
 *   @param rightLloc? ylloc structure for source of right item
 *   @returns {boolean} false: keep left, true: overwrite with right. May also throw.   *
 */
class Merger {

  /**
   * Join to ShExJ schemas. The schemas may have `_index` and `_locations` attributes.
   * @param left first schema to be joined.
   * @param right second schema to be joined.
   * @param collision the string "left" or "right" or a function folling the collision API.
   * @param inPlace if true, edit the left schema directly.
   * @returns ShExJ schema
   */
  constructor (olde, ...args) {
    this.left = olde.schema;
    this.leftMeta = olde.schemaMeta
    let newe, collision = 'throw', inPlace = false;

    switch (args.length) {
    case 0:
      break;
    case 1:
      collision = args[0];
      break;
    case 2:
      collision = args[0];
      inPlace = args[1];
      break;
    case 3:
      this.right = args[0].schema;
      this.rightMeta = args[0].schemaMeta
      collision = args[0];
      inPlace = args[1];
      break;
    default:
      throw Error(`Did not expect ${args.length} arguments to Merger`);
    }

    this.overwrite =
          collision === 'left'
          ? () => false
          : collision === 'right'
          ? () => true
          : typeof collision === 'object'
          ? (type, left, right, leftLloc, rightLloc) => collision.overwrite(type, left, right, leftLloc, rightLloc, this.leftMeta, this.rightMeta)
          : typeof collision === 'function'
          ? collision
          : (type, left, right, _leftLloc, _rightLloc, _leftMeta, _rightMeta) => {
            throw Error(`${type} ${JSON.stringify(right, null, 2)} collides with ${JSON.stringify(left, null, 2)}`);
          };
    this.inPlace = inPlace;
    this.ret = inPlace ? this.left : ShExUtil.emptySchema();
  }

  mergeArray (attr) {
    Object.keys(this.left[attr] || {}).forEach(key => {
      if (!(attr in this.ret))
        this.ret[attr] = {};
      this.ret[attr][key] = this.left[attr][key];
    });
    Object.keys(this.right[attr] || {}).forEach(key => {
      if (!(attr in this.left) || !(key in this.left[attr])
          || (this.left[attr][key] !== this.right[attr][key] && this.overwrite(attr, this.ret[attr][key], this.right[attr][key], undefined, undefined, this.leftMeta, this.rightMeta))) {
        if (!(attr in this.ret))
          this.ret[attr] = {};
        this.ret[attr][key] = this.right[attr][key];
      }
    });
  }

  mergeMap (attr, myOverwrite = this.overwrite) {
    (this.left[attr] || new Map()).forEach((value, key, map) => {
      if (!(attr in this.ret))
        this.ret[attr] = new Map();
      this.ret[attr].set(key, this.left[attr].get(key));
    });
    (this.right[attr] || new Map()).forEach((value, key, map) => {
      if (!(attr  in this.left) || !(this.left[attr].has(key)) || myOverwrite(attr, this.ret[attr].get(key), this.right[attr].get(key)), undefined, undefined, this.leftMeta, this.rightMeta) {
        if (!(attr in this.ret))
          this.ret[attr] = new Map();
        this.ret[attr].set(key, this.right[attr].get(key));
      }
    });
  }

  merge (...args) {
    switch (args.length) {
    case 0:
      if (!this.left)
        throw Error(`expected left argument to merge`);
      if (!this.right)
        throw Error(`expected right argument to merge`);
      break;
    case 1:
      this.right = args[0].schema;
      this.rightMeta = args[0].schemaMeta
      break;
    case 2:
      this.left = args[0].schema;
      this.leftMeta = args[0].schemaMeta
      this.right = args[1].schema;
      this.rightMeta = args[1].schemaMeta
      break;
    default:
      throw Error(`Did not expect ${args.length} arguments to merge`);
    }

    // base
    if ("_base" in this.left)
      this.ret._base = this.left._base;
    if ("_base" in this.right)
      if (!("_base" in this.left)/* || this.overwrite('_base', this.ret._base, this.right._base)*/) // _base favors the this.left
        this.ret._base = this.right._base;

    this.mergeArray("_prefixes");

    this.mergeMap("_sourceMap", () => false);

    if ("_locations" in this.left || "_locations" in this.right)
      this.ret._locations = this.left._locations || {};

    if ("imports" in this.right)
      if (!("imports" in this.left)) {
        this.ret.imports = this.right.imports;
      } else {
        [].push.apply(this.ret.imports, this.right.imports.filter(
          mprt => this.ret.imports.indexOf(mprt) === -1
        ))
      }

    // startActs
    if ("startActs" in this.left)
      this.ret.startActs = this.left.startActs;
    if ("startActs" in this.right)
      if (!("startActs" in this.left) || this.overwrite('startActs', this.ret.startActs, this.right.startActs, undefined, undefined, this.leftMeta, this.rightMeta))
        this.ret.startActs = this.right.startActs;

    // start
    if ("start" in this.left)
      this.ret.start = this.left.start;
    if ("start" in this.right)
      if (!("start" in this.left) || this.overwrite('start', this.ret.start, this.right.start, undefined, undefined, this.leftMeta, this.rightMeta))
        this.ret.start = this.right.start;

    const lindex = this.left._index || ShExIndexVisitor.index(this.left);

    // shapes
    if (!this.inPlace)
      (this.left.shapes || []).forEach(lshape => {
        if (!("shapes" in this.ret))
          this.ret.shapes = [];
        this.ret.shapes.push(lshape);
      });
    (this.right.shapes || []).forEach(rshape => {
      if (!("shapes" in this.ret)) {
        this.ret.shapes = [];
        this.ret.shapes.push(rshape)
        lindex.shapeExprs[rshape.id] = rshape;
      } else {
        const previousDecl = lindex.shapeExprs[rshape.id];
        if (!previousDecl) {
          this.ret.shapes.push(rshape)
          lindex.shapeExprs[rshape.id] = rshape;
        } else if (this.overwrite('shapeDecl', previousDecl, rshape, (this.left._locations || {})[rshape.id], (this.right._locations || {})[rshape.id], this.leftMeta, this.rightMeta)) {
          this.ret.shapes.splice(this.ret.shapes.indexOf(previousDecl), 1, rshape);
          lindex.shapeExprs[rshape.id] = rshape;
        }
      }
      if ("_locations" in this.ret)
        this.ret._locations[rshape.id] = (this.right._locations || {})[rshape.id];
    });

    if (this.left._index || this.right._index)
      this.ret._index = ShExIndexVisitor.index(this.ret); // inefficient; could build above

    return this.ret;
  }

  /**
   * A merge function collision handler that warns on duplicates and throws on redefinitions.
   * @param type element of schema: imports|start|startActs|_locations...
   * @param left structure with duplicated item.
   * @param right structure with introducing duplicate item.
   * @param leftLloc? yylloc structure for source of left item
   * @param rightLloc? ylloc structure for source of right item
   * @returns {boolean} false: keep left, true: overwrite with right. May also throw.
   */
  static warnDuplicates (type, left, right, leftLloc, rightLloc, _leftMeta, _rightMeta) {
    if (type === "_prefixes")
      return false;
    if (type !== "shapeDecl")
      throw Error(`Unexpected ${type} conflict: ${JSON.stringify(left)}, ${JSON.stringify(right)}`);

    const lStr = JSON.stringify(left);
    const rStr = JSON.stringify(right);
    const wheresStr = [];
    if (leftLloc) wheresStr.push(yyllocToString(leftLloc));
    if (rightLloc) wheresStr.push(yyllocToString(rightLloc));
    if (lStr === rStr) {
      console.warn(`Duplicate definitions for ${left.id}: ${wheresStr.map(s => "\n  " + s)}`)
      return false; // keep left/old assignment
    }
    throw new Error(`Conflicing definitions for ${left.id}:\n${locIndent(leftLloc)}    ${lStr}\n${locIndent(rightLloc)}    ${rStr}`);

    function locIndent (yylloc) {
      return yylloc ? "  " + yyllocToString(yylloc) + ":\n" : "";
    }
  }
}

function yyllocToString (yylloc) {
  return `${yylloc.filename}(${yylloc.first_line}:${yylloc.first_column}-${yylloc.last_line}:${yylloc.last_column})${yylloc.importers ? yylloc.importers.reverse().map(i => "\n      <= " + i).join() : ""}`
}

/**
 * A merge function collision handler that accumulates redeclarations.
 */
class StoreDuplicates {
  constructor () {
    this.duplicates = {};
  }
  overwrite (type, left, right, leftLloc, rightLloc, leftMeta, rightMeta) {
    if (type === "_prefixes")
      return false;
    if (type !== "shapeDecl")
      throw Error(`Unexpected ${type} conflict: ${JSON.stringify(left)}, ${JSON.stringify(right)}`);

    const id = left.id;
    if (!this.duplicates[id])
      this.duplicates[id] = [{...leftLloc, importers: leftMeta.importers}];
    this.duplicates[id].push({...rightLloc, importers: rightMeta.importers})
    return false; // keep left/old assignment
  }
}

module.exports = {Merger, StoreDuplicates, yyllocToString};


/***/ },

/***/ 156
(module, __unused_webpack_exports, __webpack_require__) {

const ShExHumanErrorWriterCjsModule = (function () {
const ShExTerm = __webpack_require__(2130);
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


/***/ },

/***/ 8822
(module, __unused_webpack_exports, __webpack_require__) {

// **ShExUtil** provides ShEx utility functions

const ShExUtilCjsModule = (function () {
const ShExTerm = __webpack_require__(2130);
const {ShExVisitor, ShExIndexVisitor} = __webpack_require__(9522)
const Hierarchy = __webpack_require__(9950)
const ShExHumanErrorWriter = __webpack_require__(156)

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


  class MissingReferenceError extends Error {
    constructor (ref, labelStr, known) {
      super(`Structural error: reference to ${ref} not found in ${labelStr}`);
      this.reference = ref;
      this.known = known;
    }

    /** append directly after `error.message`
     */
    notFoundIn () {
      return ":\n" + this.known.map(
        u => u.substr(0, 2) === '_:' ? u : '<' + u + '>'
      ).join("\n        ") + ".";
    }
  }
  class MissingDeclRefError extends MissingReferenceError {
    constructor (ref, known) {
      super(ref, "shape declarations", known);
    }
  }
  class MissingTripleExprRefError extends MissingReferenceError {
    constructor (ref, known) {
      super(ref, "triple expressions", known);
    }
  }

const ShExUtil = {

  SX: SX,
  RDF: RDF,
  version: function () {
    return "0.5.0";
  },

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
    // 2.1- > 2.2
    const updated2_1to2_2 = (schema.shapes || []).reduce((acc, sh, ord) => {
      if (sh.type === "ShapeDecl")
        return acc;
      const id = sh.id;
      delete sh.id;
      const newDecl = {
        type: "ShapeDecl",
        id: id,
        shapeExpr: sh,
      };
      schema.shapes[ord] = newDecl;
      return acc.concat([newDecl]);
    }, []);
    // if (updated2_1to2_2.length > 0)
    //   console.log("Updated 2.1 -> 2.2: " + updated2_1to2_2.map(decl => decl.id).join(", "));
    schema._prefixes = schema._prefixes || {  };
    // schema._base = schema._prefixes || ""; // leave undefined to signal no provided base
    schema._index = ShExIndexVisitor.index(schema);
    return schema;
  },

  AStoShExJ: function (schema) {
    schema["@context"] = schema["@context"] || "http://www.w3.org/ns/shex.jsonld";
    delete schema["_index"];
    delete schema["_prefixes"];
    delete schema["_base"];
    delete schema["_locations"];
    delete schema["_sourceMap"];
    return schema;
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

    class ShExRVisitor extends ShExVisitor {
      constructor (knownShapeExprs) {
        super()
        this.knownShapeExprs = knownShapeExprs;
        this.knownTripleExpressions = {};
      }

      visitShapeExpr (expr, ...args) {
        if (typeof expr === "string")
          return expr;
        if ("id" in expr) {
          if (this.knownShapeExprs.has(expr.id) || Object.keys(expr).length === 1) {
            const already = this.knownShapeExprs.get(expr.id);
            if (typeof expr.expression === "object") {
              if (!already)
                this.knownShapeExprs.set(expr.id, super.visitShapeExpr(expr, label));
            }
            return expr.id;
          }
          delete expr.id;
        }
        return super.visitShapeExpr(expr, ...args);
      };

      visitTripleExpr (expr, ...args) {
        if (typeof expr === "string") { // shortcut for recursive references e.g. 1Include1
          return expr;
        } else if ("id" in expr) {
          if (expr.id in this.knownTripleExpressions) {
            this.knownTripleExpressions[expr.id].refCount++;
            return expr.id;
          }
        }
        const ret = super.visitTripleExpr(expr, ...args);
        // Everything from RDF has an ID, usually a BNode.
        this.knownTripleExpressions[expr.id] = { refCount: 1, expr: ret };
        return ret;
      }

      cleanIds () {
        for (let k in this.knownTripleExpressions) {
          const known = this.knownTripleExpressions[k];
          if (known.refCount === 1 && known.expr.id.startsWith("_:"))
            delete known.expr.id;
        };
      }
    }

    // normalize references to those shapeExprs
    const v = new ShExRVisitor(knownShapeExprs);
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
    let index = ret._index || ShExIndexVisitor.index(schema);
    delete ret._index;
    let sourceMap = ret._sourceMap;
    delete ret._sourceMap;
    let locations = ret._locations;
    delete ret._locations;
    // Don't delete ret.productions as it's part of the AS.

    class MyVisitor extends ShExVisitor {
      constructor(index) {
        super();
        this.index = index;
        this.knownExpressions = [];
      }

      visitInclusion (inclusion) {
        if (this.knownExpressions.indexOf(inclusion) === -1 &&
            inclusion in this.index.tripleExprs) {
          this.knownExpressions.push(inclusion)
          return super.visitTripleExpr(this.index.tripleExprs[inclusion]);
        }
        return super.visitInclusion(inclusion);
      }

      visitTripleExpr (expression) {
        if (typeof expression === "object" && "id" in expression) {
          if (this.knownExpressions.indexOf(expression.id) === -1) {
            this.knownExpressions.push(expression.id)
            return super.visitTripleExpr(this.index.tripleExprs[expression.id]);
          }
          return expression.id; // Inclusion
        }
        return super.visitTripleExpr(expression);
      }

      visitExtra (l) {
        return l.slice().sort();
        // removed by dead control flow

      }
    }

    v = new MyVisitor(index);
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
    const index = schema._index || ShExIndexVisitor.index(schema);
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
    const inputIndex = schema._index || ShExIndexVisitor.index(schema)
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
    const v = new ShExVisitor();
    return v.visitSchema(schema);
  },

  // @@ put predicateUsage here

  emptySchema: function () {
    return {
      type: "Schema"
    };
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

  MissingReferenceError,
  MissingDeclRefError,
  MissingTripleExprRefError,

  HierarchyVisitor: function (schemaP, optionsP, negativeDepsP, positiveDepsP) {

    const visitor = new SchemaStructureValidator(schemaP, optionsP, negativeDepsP, positiveDepsP);
    return visitor;
  },

  validateSchema: function (schema, options) { // obselete, but may need other validations in the future.

    // Stand-alone class but left in function scope to minimize symbol space
    class SchemaStructureValidator extends ShExVisitor {
      constructor (schema, options, negativeDeps, positiveDeps) {
        super();
        this.schema = schema;
        this.options = options;
        this.negativeDeps = negativeDeps;
        this.positiveDeps = positiveDeps;

        this.currentLabel = null;
        this.currentExtra = null;
        this.currentNegated = false;
        this.inTE = false;
        this.index = schema.index || ShExIndexVisitor.index(schema);
      }

      visitShape (shape, ...args) {
        const lastExtra = this.currentExtra;
        this.currentExtra = shape.extra;
        const ret = super.visitShape(shape, ...args);
        this.currentExtra = lastExtra;
        return ret;
      };

      visitShapeNot (shapeNot, ...args) {
        const lastNegated = this.currentNegated;
        this.currentNegated ^= true;
        const ret = super.visitShapeNot(shapeNot, ...args);
        this.currentNegated = lastNegated;
        return ret;
      };

      visitTripleConstraint (expr, ...args) {
        const lastNegated = this.currentNegated;
        if (this.currentExtra && this.currentExtra.indexOf(expr.predicate) !== -1)
          this.currentNegated ^= true;
        this.inTE = true;
        const ret = super.visitTripleConstraint(expr, ...args);
        this.inTE = false;
        this.currentNegated = lastNegated;
        return ret;
      };

      visitShapeRef (shapeRef, ...args) {
        if (!(shapeRef in this.index.shapeExprs)) {
          const error = this.firstError(new MissingDeclRefError(shapeRef, Object.keys(this.index.shapeExprs)), shapeRef);
          if (this.options.missingReferent) {
            this.options.missingReferent(error, (this.schema._locations || {})[this.currentLabel]);
          } else {
            throw error;
          }
        }
        if (!this.inTE && shapeRef === this.currentLabel)
          throw this.firstError(Error("Structural error: circular reference to " + this.currentLabel + "."), shapeRef);
        if (!this.options.skipCycleCheck)
          (this.currentNegated ? this.negativeDeps : this.positiveDeps).add(this.currentLabel, shapeRef);
        return super.visitShapeRef(shapeRef, ...args);
      };

      visitInclusion (inclusion, ...args) {
        let refd;
        if (!(refd = this.index.tripleExprs[inclusion]))
          throw this.firstError(new MissingTripleExprRefError(inclusion, Object.keys(this.index.tripleExprs)), inclusion);
        // if (refd.type !== "Shape")
        //   throw Error("Structural error: " + inclusion + " is not a simple shape.");
        return super.visitInclusion(inclusion, ...args);
      };

      firstError(e, obj) {
        if ("_sourceMap" in this.schema)
          e.location = (this.schema._sourceMap.get(obj) || [undefined])[0];
        return e;
      }

      static validate (schema, options) {
        const negativeDeps = Hierarchy.create();
        const positiveDeps = Hierarchy.create();
        const visitor = new SchemaStructureValidator(schema, options, negativeDeps, positiveDeps);

        (schema.shapes || []).forEach(function (shape) {
          visitor.currentLabel = shape.id;
          visitor.visitShapeDecl(shape, shape.id);
          visitor.currentLabel = null;
        });
        let circs = Object.keys(negativeDeps.children).filter(
          k => negativeDeps.children[k].filter(
            k2 => k2 in negativeDeps.children && negativeDeps.children[k2].indexOf(k) !== -1
              || k2 in positiveDeps.children && positiveDeps.children[k2].indexOf(k) !== -1
          ).length > 0
        );
        if (circs.length)
          throw visitor.firstError(Error("Structural error: circular negative dependencies on " + circs.join(',') + "."), circs[0]);
      }
    }

    SchemaStructureValidator.validate(schema, options);
  },

  /** isWellDefined: assert that schema is well-defined.
   *
   * @schema: input schema
   * @@TODO
   */
  isWellDefined: function (schema, options) {
    this.validateSchema(schema, options);
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
    const t = new URL(passedValue, (meta.base === "" || !meta.base ? undefined : meta.base)).href; // fall back to base-less mode
    if (known(t))
      return t;
    if (!relIRI) {
      const t2 = this.resolvePrefixedIRI(passedValue, meta.prefixes);
      if (t2 !== null && known(t2))
        return t2;
    }
    return reportUnknown ? reportUnknown(t) : this.UnknownIRI;
  },

  executeQueryPromise: function (query, endpoint, dataFactory) {
    let rows;
    if (!endpoint)
      throw Error(`Can't execute a SPARQL query with no endpoint`);

    const queryURL = endpoint + "?query=" + encodeURIComponent(query);
    return fetch(queryURL, {
      headers: {
        'Accept': 'application/sparql-results+json'
      }}).then(resp => resp.json()).then(jsonObject => {
        return this.parseSparqlJsonResults(jsonObject, dataFactory);
      })// .then(x => new Promise(resolve => setTimeout(() => resolve(x), 1000)));
  },

  executeQuery: function (query, endpoint, dataFactory) {
    let rows;
    const queryURL = endpoint + "?query=" + encodeURIComponent(query);
    const xhr = new XMLHttpRequest();
    xhr.open("GET", queryURL, false);
    xhr.setRequestHeader('Accept', 'application/sparql-results+json');
    xhr.send();
    // const selectsBlock = query.match(/SELECT\s*(.*?)\s*{/)[1];
    // const selects = selectsBlock.match(/\?[^\s?]+/g);
    const jsonObject = JSON.parse(xhr.responseText);
    return this.parseSparqlJsonResults(jsonObject, dataFactory);
  },

  parseSparqlJsonResults: function (jsonObject, dataFactory) {
    const selects = jsonObject.head.vars;
    return jsonObject.results.bindings.map(row => {
      // spec: https://www.w3.org/TR/rdf-sparql-json-res/#variable-binding-results
      return selects.map(sel => {
        if (!(sel in row))
          return null;
        const elt = row[sel];
        switch (elt.type) {
        case "uri": return dataFactory.namedNode(elt.value);
        case "bnode": return dataFactory.blankNode(elt.value);
        case "literal":
          return dataFactory.literal(
            elt.value,
            "xml:lang" in elt
              ? elt["xml:lang"]
              : "datatype" in elt
              ? dataFactory.namedNode(elt.datatype)
              : undefined
          );
        case "typed-literal": // encountered in wikidata query service
          return dataFactory.literal(elt.value, elt.datatype);
        default: throw "unknown XML results type: " + elt.type;
        }
      })
    });
  },

/* TO ADD? XML results format parsed with jquery:
  // parse..._dom(new window.DOMParser().parseFromString(str, "text/xml"));

  parseSparqlXmlResults_dom: function (doc, dataFactory) {
    Array.from(X.querySelectorAll('sparql > results > result')).map(row => {
      Array.from(row.querySelectorAll("binding")).map(elt => {
        const typed = Array.from(elt.children)[0];
        const text = typed.textContent;

        switch (elt.tagName) {
        case "uri": return dataFactory.namedNode(text);
        case "bnode": return dataFactory.blankNode(text);
        case "literal":
          const datatype = typed.getAttribute("datatype");
          const lang = typed.getAttribute("xml:lang");
          return dataFactory.literal(text, lang ? lang : datatype ? dataFactory.namedNode(datatype) : undefined);
        default: throw "unknown XML results type: " + elt.tagName;
        }
      })
    })
  },

  parseSparqlXmlResults_jquery: function (jqObj, dataFactory) {
    $(jqObj).find("sparql > results > result").
      each((_, row) => {
        rows.push($(row).find("binding > *:nth-child(1)").
          map((idx, elt) => {
            elt = $(elt);
            const text = elt.text();

            switch (elt.prop("tagName")) {
            case "uri": return dataFactory.namedNode(text);
            case "bnode": return dataFactory.blankNode(text);
            case "literal":
              const datatype = elt.attr("datatype");
              const lang = elt.attr("xml:lang");
              return dataFactory.literal(text, lang ? lang : datatype ? dataFactory.namedNode(datatype) : undefined);
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


/***/ },

/***/ 8006
(__unused_webpack_module, exports, __webpack_require__) {

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
exports.ShExValidator = exports.resultMapToShapeExprTest = exports.ShapeExprValidationContext = exports.InterfaceOptions = void 0;
// interface constants
const ShExTerm = __importStar(__webpack_require__(2130));
const term_1 = __webpack_require__(2130);
const eval_validator_api_1 = __webpack_require__(4085);
const Hierarchy = __importStar(__webpack_require__(9950));
const neighborhood_api_1 = __webpack_require__(7682);
const shex_xsd_1 = __webpack_require__(5683);
const visitor_1 = __webpack_require__(9522);
exports.InterfaceOptions = {
    "coverage": {
        "firstError": "fail on first error (usually used with eval-simple-1err)",
        "exhaustive": "find as many errors as possible (usually used with eval-threaded-nerr)"
    }
};
const VERBOSE = false; // "VERBOSE" in process.env;
const EvalThreadedNErr = (__webpack_require__(4516)/* .RegexpModule */ .a);
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
    depth = 0, tracker = new EmptyTracker(), seen = {}, matchTarget = null, subGraph = null) {
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
exports.ShapeExprValidationContext = ShapeExprValidationContext;
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
        const index = schema._index || visitor_1.ShExIndexVisitor.index(schema);
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
        return shapeMap.reduce((acc, pair) => {
            // let time = +new Date();
            const res = this.validateNodeShapePair(ShExTerm.ld2RdfJsTerm(pair.node), pair.shape, tracker, seen);
            // time = +new Date() - time;
            return acc.concat([{
                    node: pair.node,
                    shape: pair.shape,
                    status: "errors" in res ? "nonconformant" : "conformant",
                    appinfo: res,
                    // elapsed: time
                }]);
        }, []);
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
        // @TODO move to ShExIndexVisitor.index
        function indexExtensions(schema) {
            const abstractness = {};
            const extensions = Hierarchy.create();
            makeSchemaVisitor().visitSchema(schema);
            return extensions.children;
            function makeSchemaVisitor() {
                const schemaVisitor = new visitor_1.ShExVisitor();
                let curLabel;
                // let curAbstract; -- not yet used
                const oldVisitShapeDecl = schemaVisitor.visitShapeDecl;
                schemaVisitor.visitShapeDecl = function (decl) {
                    curLabel = decl.id;
                    // curAbstract = decl.abstract;
                    abstractness[decl.id] = !!decl.abstract;
                    return oldVisitShapeDecl.call(schemaVisitor, decl, decl.id);
                };
                schemaVisitor.visitShape = function (shape) {
                    if (shape.extends !== undefined) {
                        shape.extends.forEach(ext => {
                            const extendsVisitor = new visitor_1.ShExVisitor();
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
                    : { type: "ShapeNotFailure", errors: sub };
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
            const { errors, triples, results } = this.tryPartition(t2tc, focus, shape, ctx, extendsTCs, tc2exts, matchedExtras, tripleConstraints, tc2TResults, fromDB.outgoing, regexEngine);
            const possibleRet = { type: "ShapeTest", node: (0, term_1.rdfJsTerm2Ld)(focus), shape: ctx.label };
            if (errors.length === 0 && results !== null) // only include .solution for non-empty pattern
                // @ts-ignore TODO
                possibleRet.solution = results;
            if ("semActs" in shape) {
                const semActErrors = this.semActHandler.dispatchAll(shape.semActs, Object.assign({ node: focus, triples }, results), possibleRet);
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
        if (false)
            // removed by dead control flow
{}
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
        const usedTriples = [];
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
        // usedTriples are returned to be passed to a SemActHandler
        outgoing.forEach(triple => {
            if (!t2tc.has(triple) // didn't match anything
                && matchedExtras.indexOf(triple) === -1) // isn't in EXTRAs
                unexpectedTriples.push(triple);
            else
                usedTriples.push(triple);
        });
        const errors = [];
        // Triples not mapped to triple constraints are not allowed in closed shapes.
        if (shape.closed && unexpectedTriples.length > 0 && !this.options.ignoreClosed) {
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
        return { errors, triples: usedTriples, results };
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
        const visitor = new visitor_1.ShExVisitor(labelToTcs);
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
        for (const triple of triples) {
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
        }
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
            if (false)
                // removed by dead control flow
{}
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
    if ("captureStackTrace" in Error) {
        Error.captureStackTrace(e, runtimeError);
    }
    throw e;
}
//# sourceMappingURL=shex-validator.js.map

/***/ },

/***/ 5683
(__unused_webpack_module, exports) {

"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
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

/***/ },

/***/ 9522
(module) {


class ShExVisitor {
  constructor (...ctor_args) {
    this.ctor_args = ctor_args;
  }

  static isTerm (t) {
    return typeof t !== "object" || "value" in t && Object.keys(t).reduce((r, k) => {
      return r === false ? r : ["value", "type", "language"].indexOf(k) !== -1;
    }, true);
  }

  static isShapeRef (expr) {
    return typeof expr === "string" // test for JSON-LD @ID
  }

  static visitMap (map, val) {
    const ret = {};
    Object.keys(map).forEach(function (item) {
      ret[item] = val(map[item]);
    });
    return ret;
  }

  runtimeError (e) {
    throw e;
  }

  visitSchema (schema, ...args) {
    const ret = { type: "Schema" };
    this._expect(schema, "type", "Schema");
    this._maybeSet(schema, ret, "Schema",
                   ["@context", "prefixes", "base", "imports", "startActs", "start", "shapes"],
                   ["_base", "_prefixes", "_index", "_sourceMap", "_locations"],
                   ...args
                  );
    return ret;
  }

  visitPrefixes (prefixes, ...args) {
    return prefixes === undefined ?
      undefined :
      ShExVisitor.visitMap(prefixes, function (val) {
        return val;
      });
  }

  visitIRI (i, ...args) {
    return i;
  }

  visitImports (imports, ...args) {
    return imports.map((imp) => {
      return this.visitIRI(imp, args);
    });
  }

  visitStartActs (startActs, ...args) {
    return startActs === undefined ?
      undefined :
      startActs.map((act) => {
        return this.visitSemAct(act, ...args);
      });
  }

  visitSemActs (semActs, ...args) {
    if (semActs === undefined)
      return undefined;
    const ret = []
    Object.keys(semActs).forEach((label) => {
      ret.push(this.visitSemAct(semActs[label], label, ...args));
    });
    return ret;
  }

  visitSemAct (semAct, label, ...args) {
    const ret = { type: "SemAct" };
    this._expect(semAct, "type", "SemAct");

    this._maybeSet(semAct, ret, "SemAct",
                   ["name", "code"], null, ...args);
    return ret;
  }

  visitShapes (shapes, ...args) {
    if (shapes === undefined)
      return undefined;
    return shapes.map(
      shapeExpr =>
      this.visitShapeDecl(shapeExpr, ...args)
    );
  }

  visitShapeDecl (decl, ...args) {
    return this._maybeSet(decl, { type: "ShapeDecl" }, "ShapeDecl",
                          ["id", "abstract", "restricts", "shapeExpr"], null, ...args);
  }

  visitShapeExpr (expr, ...args) {
    if (ShExVisitor.isShapeRef(expr))
      return this.visitShapeRef(expr, ...args)
    switch (expr.type) {
    case "Shape": return this.visitShape(expr, ...args);
    case "NodeConstraint": return this.visitNodeConstraint(expr, ...args);
    case "ShapeAnd": return this.visitShapeAnd(expr, ...args);
    case "ShapeOr": return this.visitShapeOr(expr, ...args);
    case "ShapeNot": return this.visitShapeNot(expr, ...args);
    case "ShapeExternal": return this.visitShapeExternal(expr, ...args);
    default:
      throw Error("unexpected shapeExpr type: " + expr.type + JSON.stringify(expr));
    }
  }

  visitValueExpr (expr, ...args) {
    return this.visitShapeExpr(expr, ...args); // call potentially overloaded visitShapeExpr
  }

  // _visitShapeGroup: visit a grouping expression (shapeAnd, shapeOr)
  _visitShapeGroup (expr, ...args) {
    this._testUnknownAttributes(expr, ["shapeExprs"], expr.type, this.visitShapeNot)
    const r = { type: expr.type };
    if ("id" in expr)
      r.id = expr.id;
    r.shapeExprs = expr.shapeExprs.map((nested) => {
      return this.visitShapeExpr(nested, ...args);
    });
    return r;
  }

  // _visitShapeNot: visit negated shape
  visitShapeNot (expr, ...args) {
    this._testUnknownAttributes(expr, ["shapeExpr"], "ShapeNot", this.visitShapeNot)
    const r = { type: expr.type };
    if ("id" in expr)
      r.id = expr.id;
    r.shapeExpr = this.visitShapeExpr(expr.shapeExpr, ...args);
    return r;
  }

  // ### `visitNodeConstraint` deep-copies the structure of a shape
  visitShape (shape, ...args) {
    const ret = { type: "Shape" };
    this._expect(shape, "type", "Shape");

    this._maybeSet(shape, ret, "Shape",
                   [ "abstract", "extends",
                     "closed",
                     "expression", "extra", "semActs", "annotations"], null, ...args);
    return ret;
  }

  _visitShapeExprList (ext, ...args) {
    return ext.map((t) => {
      return this.visitShapeExpr(t, ...args);
    });
  }

  // ### `visitNodeConstraint` deep-copies the structure of a shape
  visitNodeConstraint (shape, ...args) {
    const ret = { type: "NodeConstraint" };
    this._expect(shape, "type", "NodeConstraint");

    this._maybeSet(shape, ret, "NodeConstraint",
                   [ "nodeKind", "datatype", "pattern", "flags", "length",
                     "reference", "minlength", "maxlength",
                     "mininclusive", "minexclusive", "maxinclusive", "maxexclusive",
                     "totaldigits", "fractiondigits", "values", "annotations", "semActs"], null, ...args);
    return ret;
  }

  visitShapeRef (reference, ...args) {
    if (typeof reference !== "string") {
      let ex = Error("visitShapeRef expected a string, not " + JSON.stringify(reference));
      console.warn(ex);
      throw ex;
    }
    return reference;
  }

  visitShapeExternal (expr, ...args) {
    this._testUnknownAttributes(expr, ["id"], "ShapeExternal", this.visitShapeNot)
    return Object.assign("id" in expr ? { id: expr.id } : {}, { type: "ShapeExternal" });
  }

  // _visitGroup: visit a grouping expression (someOf or eachOf)
  _visitGroup (expr, ...args) {
    const r = Object.assign(
      // pre-declare an id so it sorts to the top
      "id" in expr ? { id: null } : { },
      { type: expr.type }
    );
    r.expressions = expr.expressions.map((nested) => {
      return this.visitExpression(nested, ...args);
    });
    return this._maybeSet(expr, r, "expr",
                          ["id", "min", "max", "annotations", "semActs"], ["expressions"], ...args);
  }

  visitTripleConstraint (expr, ...args) {
    return this._maybeSet(expr,
                          Object.assign(
                            // pre-declare an id so it sorts to the top
                            "id" in expr ? { id: null } : { },
                            { type: "TripleConstraint" }
                          ),
                          "TripleConstraint",
                          ["id", "inverse", "predicate", "valueExpr",
                           "min", "max", "annotations", "semActs"], null, ...args)
  }

  visitTripleExpr (expr, ...args) {
    if (typeof expr === "string")
      return this.visitInclusion(expr);
    switch (expr.type) {
    case "TripleConstraint": return this.visitTripleConstraint(expr, ...args);
    case "OneOf": return this.visitOneOf(expr, ...args);
    case "EachOf": return this.visitEachOf(expr, ...args);
    default:
      throw Error("unexpected expression type: " + expr.type);
    }
  }

  visitExpression (expr, ...args) {
    return this.visitTripleExpr(expr, ...args); // call potentially overloaded visitTripleExpr
  }

  visitValues (values, ...args) {
    return values.map((t) => {
      return ShExVisitor.isTerm(t) || t.type === "Language" ?
        t :
        this.visitStemRange(t, ...args);
    });
  }

  visitStemRange (t, ...args) {
    // this._expect(t, "type", "IriStemRange");
    if (!("type" in t))
      this.runtimeError(Error("expected "+JSON.stringify(t)+" to have a 'type' attribute."));
    const stemRangeTypes = ["IriStem", "LiteralStem", "LanguageStem", "IriStemRange", "LiteralStemRange", "LanguageStemRange"];
    if (stemRangeTypes.indexOf(t.type) === -1)
      this.runtimeError(Error("expected type attribute '"+t.type+"' to be in '"+stemRangeTypes+"'."));
    let stem;
    if (ShExVisitor.isTerm(t)) {
      this._expect(t.stem, "type", "Wildcard");
      stem = { type: t.type, stem: { type: "Wildcard" } };
    } else {
      stem = { type: t.type, stem: t.stem };
    }
    if (t.exclusions) {
      stem.exclusions = t.exclusions.map((c) => {
        return this.visitExclusion(c, ...args);
      });
    }
    return stem;
  }

  visitExclusion (c, ...args) {
    if (!ShExVisitor.isTerm(c)) {
      // this._expect(c, "type", "IriStem");
      if (!("type" in c))
        this.runtimeError(Error("expected "+JSON.stringify(c)+" to have a 'type' attribute."));
      const stemTypes = ["IriStem", "LiteralStem", "LanguageStem"];
      if (stemTypes.indexOf(c.type) === -1)
        this.runtimeError(Error("expected type attribute '"+c.type+"' to be in '"+stemTypes+"'."));
      return { type: c.type, stem: c.stem };
    } else {
      return c;
    }
  }

  visitInclusion (inclusion, ...args) {
    if (typeof inclusion !== "string") {
      let ex = Error("visitInclusion expected a string, not " + JSON.stringify(inclusion));
      console.warn(ex);
      throw ex;
    }
    return inclusion;
  }

  _maybeSet (obj, ret, context, members, ignore, ...args) {
    this._testUnknownAttributes(obj, ignore ? members.concat(ignore) : members, context, this._maybeSet)
    members.forEach((member) => {
      const methodName = "visit" + member.charAt(0).toUpperCase() + member.slice(1);
      if (member in obj) {
        const f = this[methodName];
        if (typeof f !== "function") {
          throw Error(methodName + " not found in Visitor");
        }
        const t = f.call(this, obj[member], ...args);
        if (t !== undefined) {
          ret[member] = t;
        }
      }
    });
    return ret;
  }

  _visitValue (v, ...args) {
    return v;
  }

  _visitList (l, ...args) {
    return l.slice();
  }

  _testUnknownAttributes (obj, expected, context, captureFrame) {
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

  _expect (o, p, v) {
    if (!(p in o))
      this.runtimeError(Error("expected "+JSON.stringify(o)+" to have a ."+p));
    if (arguments.length > 2 && o[p] !== v)
      this.runtimeError(Error("expected "+o[p]+" to equal "+v));
  }
}

// A lot of ShExVisitor's functions are the same. This creates them.
ShExVisitor.prototype.visitBase = ShExVisitor.prototype.visitStart = ShExVisitor.prototype.visitClosed = ShExVisitor.prototype["visit@context"] = ShExVisitor.prototype._visitValue;
ShExVisitor.prototype.visitRestricts = ShExVisitor.prototype.visitExtends = ShExVisitor.prototype._visitShapeExprList;
ShExVisitor.prototype.visitExtra = ShExVisitor.prototype.visitAnnotations = ShExVisitor.prototype._visitList;
ShExVisitor.prototype.visitAbstract = ShExVisitor.prototype.visitInverse = ShExVisitor.prototype.visitPredicate = ShExVisitor.prototype._visitValue;
ShExVisitor.prototype.visitName = ShExVisitor.prototype.visitId = ShExVisitor.prototype.visitCode = ShExVisitor.prototype.visitMin = ShExVisitor.prototype.visitMax = ShExVisitor.prototype._visitValue;

ShExVisitor.prototype.visitType = ShExVisitor.prototype.visitNodeKind = ShExVisitor.prototype.visitDatatype = ShExVisitor.prototype.visitPattern = ShExVisitor.prototype.visitFlags = ShExVisitor.prototype.visitLength = ShExVisitor.prototype.visitMinlength = ShExVisitor.prototype.visitMaxlength = ShExVisitor.prototype.visitMininclusive = ShExVisitor.prototype.visitMinexclusive = ShExVisitor.prototype.visitMaxinclusive = ShExVisitor.prototype.visitMaxexclusive = ShExVisitor.prototype.visitTotaldigits = ShExVisitor.prototype.visitFractiondigits = ShExVisitor.prototype._visitValue;
ShExVisitor.prototype.visitOneOf = ShExVisitor.prototype.visitEachOf = ShExVisitor.prototype._visitGroup;
ShExVisitor.prototype.visitShapeAnd = ShExVisitor.prototype.visitShapeOr = ShExVisitor.prototype._visitShapeGroup;
ShExVisitor.prototype.visitInclude = ShExVisitor.prototype._visitValue;


/** create indexes for schema
 */
class ShExIndexVisitor extends ShExVisitor {
  constructor () {
    super();
    this.myIndex = {
        shapeExprs: {},
        tripleExprs: {}
    };
  }

  visitTripleExpr (expression, ...args) {
    if (typeof expression === "object" && "id" in expression)
      this.myIndex.tripleExprs[expression.id] = expression;
    return super.visitTripleExpr(expression, ...args);
  };

  visitShapeDecl (shapeExpr, ...args) {
    if (typeof shapeExpr === "object" && "id" in shapeExpr)
      this.myIndex.shapeExprs[shapeExpr.id] = shapeExpr;
    return super.visitShapeDecl(shapeExpr, ...args);
  };

  static index (schema, ...args) {
    const v = new ShExIndexVisitor();
    v.visitSchema(schema, ...args);
    return v.myIndex;
  }
}


if (true)
  module.exports = {
    ShExVisitor,
    ShExIndexVisitor,
  };



/***/ },

/***/ 530
(module, __unused_webpack_exports, __webpack_require__) {

// **ShExWriter** writes ShEx documents.

const ShExWriterCjsModule = (function () {
const RelativizeIri = (__webpack_require__(2962).relativize);
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
      _ShExWriter._write("START = " + _ShExWriter._writeShapeExpr(schema.start, done, true, 0).join('') + "\n")
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


/***/ },

/***/ 3933
(module, __unused_webpack_exports, __webpack_require__) {

ShExWebApp = (function () {
  const shapeMap = __webpack_require__(3854)
  return Object.assign({}, {
    ShExTerm:             __webpack_require__(2130),
    Util:                 __webpack_require__(8822),
    RdfJsDb:              (__webpack_require__(2932).ctor),
    SparqlDb:             (__webpack_require__(1238).ctor),
    Validator:            (__webpack_require__(8006).ShExValidator),
    Writer:               __webpack_require__(530),
    Loader:               __webpack_require__(6702),
    Parser:               __webpack_require__(8170),
    "eval-simple-1err":   (__webpack_require__(1636)/* .RegexpModule */ .a),
    "eval-threaded-nerr": (__webpack_require__(4516)/* .RegexpModule */ .a),
    ShapeMap:             shapeMap,
    ShapeMapParser:       shapeMap.Parser,
    JsYaml:               __webpack_require__(9515),
    DcTap:                (__webpack_require__(2430).DcTap),
  })
})()

if (true)
  module.exports = ShExWebApp;


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
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
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter/value functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			if(Array.isArray(definition)) {
/******/ 				var i = 0;
/******/ 				while(i < definition.length) {
/******/ 					var key = definition[i++];
/******/ 					var binding = definition[i++];
/******/ 					if(!__webpack_require__.o(exports, key)) {
/******/ 						if(binding === 0) {
/******/ 							Object.defineProperty(exports, key, { enumerable: true, value: definition[i++] });
/******/ 						} else {
/******/ 							Object.defineProperty(exports, key, { enumerable: true, get: binding });
/******/ 						}
/******/ 					} else if(binding === 0) { i++; }
/******/ 				}
/******/ 			} else {
/******/ 				for(var key in definition) {
/******/ 					if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 						Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	let __webpack_exports__ = __webpack_require__(3933);
/******/ 	
/******/ })()
;