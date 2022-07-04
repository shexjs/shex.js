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

/***/ 6863:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const EvalThreadedNErrCjsModule = (function () {
const ShExTerm = __webpack_require__(1118);
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
      const ret = [];
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
        this.visitExpression(schema.shapes[r], r);
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
    ShExTerm:       __webpack_require__(1118),
    Util:           __webpack_require__(9443),
    Validator:      __webpack_require__(3457),
    Writer:         __webpack_require__(95),
    Api:            __webpack_require__(9237),
    Parser:         __webpack_require__(931),
    ShapeMap:       shapeMap,
    ShapeMapParser: shapeMap.Parser,
    JsYaml:         __webpack_require__(9431),

    Map:            __webpack_require__(1279),
  })
})()

if (true)
  module.exports = ShExWebApp;


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

/***/ 9237:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/** @shexjs/api - HTTP access functions for @shexjs library.
 * For `file:` access or dynamic loading of ShEx extensions, use `@shexjs/node`.
 *
 * load function(shExC, shExJ, turtle, jsonld, schemaOptions = {}, dataOptions = {})
 *   return promise of loaded schema URLs (ShExC and ShExJ), data files (turle, and jsonld)
 * loadExtensions function(globs[])
 *   prototype of loadExtensions. does nothing
 * GET function(url, mediaType)
 *   return promise of {contents, url}
 */

const ShExApiCjsModule = function (config = {}) {

  const ShExUtil = __webpack_require__(9443);
  const ShExParser = __webpack_require__(931);

  const api = {
    load: LoadPromise,
    loadExtensions: LoadNoExtensions,
    GET: GET,
    loadShExImports_NotUsed: loadShExImports_NotUsed // possible load imports function
  };
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
      const s = parser.parse(text, url/*, opts, filename*/)
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
      const schema = parser.parse(loaded.text/*, base, opts, filename*/)
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
  module.exports = ShExApiCjsModule


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

const { JisonParser, o } = __webpack_require__(9041);const $V0=[7,18,19,20,21,23,26,36,193,215,216],$V1=[19,21,215,216],$V2=[2,27],$V3=[1,22],$V4=[1,23],$V5=[2,12],$V6=[2,13],$V7=[2,14],$V8=[7,18,19,20,21,23,26,36,215,216],$V9=[1,29],$Va=[1,32],$Vb=[1,31],$Vc=[2,18],$Vd=[2,19],$Ve=[1,38],$Vf=[1,42],$Vg=[1,41],$Vh=[1,40],$Vi=[1,44],$Vj=[1,47],$Vk=[1,46],$Vl=[2,15],$Vm=[2,17],$Vn=[2,260],$Vo=[2,261],$Vp=[2,262],$Vq=[2,263],$Vr=[19,21,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,161,189,215,227],$Vs=[2,61],$Vt=[1,65],$Vu=[19,21,39,43,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,161,179,189,215,227,229],$Vv=[2,29],$Vw=[2,238],$Vx=[2,239],$Vy=[2,264],$Vz=[193,195],$VA=[1,73],$VB=[1,76],$VC=[1,75],$VD=[2,16],$VE=[7,18,19,20,21,23,26,36,51,215,216],$VF=[2,47],$VG=[7,18,19,20,21,23,26,36,51,53,215,216],$VH=[2,54],$VI=[119,125,127,189,227],$VJ=[2,139],$VK=[1,111],$VL=[1,119],$VM=[1,93],$VN=[1,101],$VO=[1,102],$VP=[1,103],$VQ=[1,110],$VR=[1,115],$VS=[1,116],$VT=[1,117],$VU=[1,120],$VV=[1,121],$VW=[1,122],$VX=[1,123],$VY=[1,124],$VZ=[1,125],$V_=[1,106],$V$=[1,118],$V01=[2,62],$V11=[19,21,69,71,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,161,189,215,227],$V21=[1,136],$V31=[1,137],$V41=[1,138],$V51=[1,135],$V61=[1,134],$V71=[2,229],$V81=[2,230],$V91=[2,231],$Va1=[2,20],$Vb1=[1,145],$Vc1=[2,53],$Vd1=[1,147],$Ve1=[2,60],$Vf1=[2,69],$Vg1=[1,153],$Vh1=[1,154],$Vi1=[1,155],$Vj1=[2,65],$Vk1=[2,71],$Vl1=[1,162],$Vm1=[1,163],$Vn1=[1,164],$Vo1=[1,167],$Vp1=[1,170],$Vq1=[2,68],$Vr1=[7,18,19,20,21,23,26,36,51,53,79,80,81,119,125,127,189,190,193,215,216,227],$Vs1=[2,95],$Vt1=[7,18,19,20,21,23,26,36,51,53,190,193,215,216],$Vu1=[7,18,19,20,21,23,26,36,51,53,96,97,98,101,102,103,104,215,216],$Vv1=[2,87],$Vw1=[2,88],$Vx1=[7,18,19,20,21,23,26,36,51,53,79,80,81,101,102,103,104,119,125,127,189,190,193,215,216,227],$Vy1=[2,108],$Vz1=[2,107],$VA1=[7,18,19,20,21,23,26,36,51,53,101,102,103,104,112,113,114,115,116,117,190,193,215,216],$VB1=[2,102],$VC1=[2,101],$VD1=[7,18,19,20,21,23,26,36,51,53,96,97,98,101,102,103,104,190,193,215,216],$VE1=[2,91],$VF1=[2,92],$VG1=[2,112],$VH1=[2,113],$VI1=[2,114],$VJ1=[2,110],$VK1=[2,237],$VL1=[19,21,71,81,100,108,109,163,185,204,205,206,207,208,209,210,211,212,213,215],$VM1=[2,183],$VN1=[7,18,19,20,21,23,26,36,51,53,112,113,114,115,116,117,190,193,215,216],$VO1=[2,104],$VP1=[1,194],$VQ1=[1,196],$VR1=[1,198],$VS1=[1,197],$VT1=[2,118],$VU1=[1,205],$VV1=[1,206],$VW1=[1,207],$VX1=[1,208],$VY1=[100,108,109,206,207,208,209],$VZ1=[2,26],$V_1=[2,31],$V$1=[2,32],$V02=[79,80,81,119,125,127,189,227],$V12=[51,53],$V22=[1,270],$V32=[1,275],$V42=[1,252],$V52=[1,260],$V62=[1,261],$V72=[1,262],$V82=[1,269],$V92=[1,265],$Va2=[1,274],$Vb2=[2,48],$Vc2=[2,55],$Vd2=[2,64],$Ve2=[2,70],$Vf2=[2,66],$Vg2=[2,72],$Vh2=[7,18,19,20,21,23,26,36,51,53,101,102,103,104,190,193,215,216],$Vi2=[1,326],$Vj2=[1,334],$Vk2=[1,335],$Vl2=[1,336],$Vm2=[1,342],$Vn2=[1,343],$Vo2=[7,18,19,20,21,23,26,36,51,53,79,80,81,119,125,127,189,193,215,216,227],$Vp2=[2,227],$Vq2=[7,18,19,20,21,23,26,36,51,53,193,215,216],$Vr2=[1,351],$Vs2=[2,106],$Vt2=[2,111],$Vu2=[2,98],$Vv2=[1,357],$Vw2=[2,99],$Vx2=[2,100],$Vy2=[2,105],$Vz2=[7,18,19,20,21,23,26,36,51,53,96,97,98,101,102,103,104,193,215,216],$VA2=[2,93],$VB2=[1,374],$VC2=[1,380],$VD2=[1,369],$VE2=[1,373],$VF2=[1,383],$VG2=[1,384],$VH2=[1,385],$VI2=[1,372],$VJ2=[1,386],$VK2=[1,387],$VL2=[1,392],$VM2=[1,393],$VN2=[1,394],$VO2=[1,395],$VP2=[1,388],$VQ2=[1,389],$VR2=[1,390],$VS2=[1,391],$VT2=[1,379],$VU2=[19,21,69,160,199,215],$VV2=[2,167],$VW2=[2,141],$VX2=[1,408],$VY2=[1,407],$VZ2=[1,418],$V_2=[1,421],$V$2=[1,417],$V03=[1,420],$V13=[19,21,43,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,161,189,215,227],$V23=[2,117],$V33=[2,122],$V43=[2,124],$V53=[2,125],$V63=[2,126],$V73=[2,252],$V83=[2,253],$V93=[2,254],$Va3=[2,255],$Vb3=[2,123],$Vc3=[19,21,39,43,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,161,179,189,190,193,215,227,229],$Vd3=[2,36],$Ve3=[2,74],$Vf3=[2,77],$Vg3=[2,35],$Vh3=[2,39],$Vi3=[2,42],$Vj3=[2,45],$Vk3=[1,443],$Vl3=[1,445],$Vm3=[1,451],$Vn3=[1,452],$Vo3=[1,453],$Vp3=[1,460],$Vq3=[1,461],$Vr3=[1,462],$Vs3=[1,465],$Vt3=[2,41],$Vu3=[1,535],$Vv3=[2,44],$Vw3=[1,571],$Vx3=[2,67],$Vy3=[51,53,70],$Vz3=[1,600],$VA3=[51,53,70,79,80,81,119,125,127,189,190,193,227],$VB3=[51,53,70,190,193],$VC3=[51,53,70,96,97,98,101,102,103,104,190,193],$VD3=[51,53,70,79,80,81,101,102,103,104,119,125,127,189,190,193,227],$VE3=[51,53,70,101,102,103,104,112,113,114,115,116,117,190,193],$VF3=[51,53,70,112,113,114,115,116,117,190,193],$VG3=[51,70],$VH3=[7,18,19,20,21,23,26,36,51,53,79,80,81,119,125,127,189,215,216,227],$VI3=[2,97],$VJ3=[2,96],$VK3=[2,226],$VL3=[1,642],$VM3=[1,645],$VN3=[1,641],$VO3=[1,644],$VP3=[2,94],$VQ3=[2,109],$VR3=[2,103],$VS3=[2,115],$VT3=[2,116],$VU3=[2,134],$VV3=[2,182],$VW3=[1,675],$VX3=[19,21,71,81,100,108,109,163,178,185,204,205,206,207,208,209,210,211,212,213,215],$VY3=[2,232],$VZ3=[2,233],$V_3=[2,234],$V$3=[2,245],$V04=[2,248],$V14=[2,242],$V24=[2,243],$V34=[2,244],$V44=[2,250],$V54=[2,251],$V64=[2,256],$V74=[2,257],$V84=[2,258],$V94=[2,259],$Va4=[19,21,71,81,100,108,109,111,163,178,185,204,205,206,207,208,209,210,211,212,213,215],$Vb4=[2,146],$Vc4=[2,147],$Vd4=[1,683],$Ve4=[2,148],$Vf4=[121,135],$Vg4=[2,153],$Vh4=[2,154],$Vi4=[2,156],$Vj4=[1,686],$Vk4=[1,687],$Vl4=[19,21,199,215],$Vm4=[2,175],$Vn4=[1,695],$Vo4=[121,135,140,141],$Vp4=[2,165],$Vq4=[51,119,125,127,189,227],$Vr4=[51,53,119,125,127,189,227],$Vs4=[2,273],$Vt4=[1,728],$Vu4=[1,729],$Vv4=[1,730],$Vw4=[1,740],$Vx4=[19,21,119,125,127,189,199,215,227],$Vy4=[2,235],$Vz4=[2,236],$VA4=[19,21,39,43,69,71,79,80,81,85,96,97,98,101,102,103,104,112,113,114,115,116,117,119,125,127,161,179,189,193,215,227,229],$VB4=[2,33],$VC4=[2,37],$VD4=[2,73],$VE4=[2,75],$VF4=[2,34],$VG4=[2,43],$VH4=[2,40],$VI4=[2,46],$VJ4=[1,787],$VK4=[1,793],$VL4=[1,833],$VM4=[1,880],$VN4=[51,53,70,101,102,103,104,190,193],$VO4=[51,53,70,79,80,81,119,125,127,189,193,227],$VP4=[51,53,70,193],$VQ4=[1,923],$VR4=[51,53,70,96,97,98,101,102,103,104,193],$VS4=[1,933],$VT4=[1,970],$VU4=[1,1006],$VV4=[2,228],$VW4=[1,1017],$VX4=[1,1023],$VY4=[1,1022],$VZ4=[19,21,100,108,109,204,205,206,207,208,209,210,211,212,213,215],$V_4=[1,1043],$V$4=[1,1049],$V05=[1,1048],$V15=[1,1070],$V25=[1,1076],$V35=[1,1075],$V45=[1,1093],$V55=[1,1095],$V65=[1,1097],$V75=[19,21,71,81,100,108,109,163,179,185,204,205,206,207,208,209,210,211,212,213,215],$V85=[1,1101],$V95=[1,1107],$Va5=[1,1110],$Vb5=[1,1111],$Vc5=[1,1112],$Vd5=[1,1100],$Ve5=[1,1113],$Vf5=[1,1114],$Vg5=[1,1119],$Vh5=[1,1120],$Vi5=[1,1121],$Vj5=[1,1122],$Vk5=[1,1115],$Vl5=[1,1116],$Vm5=[1,1117],$Vn5=[1,1118],$Vo5=[1,1106],$Vp5=[2,246],$Vq5=[2,249],$Vr5=[2,135],$Vs5=[2,149],$Vt5=[2,151],$Vu5=[2,155],$Vv5=[2,157],$Vw5=[2,158],$Vx5=[2,162],$Vy5=[2,164],$Vz5=[2,169],$VA5=[2,170],$VB5=[1,1137],$VC5=[1,1140],$VD5=[1,1136],$VE5=[1,1139],$VF5=[1,1150],$VG5=[2,222],$VH5=[2,240],$VI5=[2,241],$VJ5=[2,271],$VK5=[2,275],$VL5=[2,277],$VM5=[2,85],$VN5=[1,1171],$VO5=[2,280],$VP5=[79,80,81,101,102,103,104,119,125,127,189,227],$VQ5=[51,53,101,102,103,104,112,113,114,115,116,117,119,125,127,189,227],$VR5=[51,53,96,97,98,101,102,103,104,119,125,127,189,227],$VS5=[2,89],$VT5=[2,90],$VU5=[51,53,112,113,114,115,116,117,119,125,127,189,227],$VV5=[2,127],$VW5=[2,76],$VX5=[1,1230],$VY5=[1,1266],$VZ5=[1,1325],$V_5=[1,1331],$V$5=[1,1363],$V06=[1,1369],$V16=[51,53,70,79,80,81,119,125,127,189,227],$V26=[51,53,70,96,97,98,101,102,103,104],$V36=[1,1427],$V46=[1,1474],$V56=[2,223],$V66=[2,224],$V76=[2,225],$V86=[7,18,19,20,21,23,26,36,51,53,79,80,81,111,119,125,127,189,190,193,215,216,227],$V96=[7,18,19,20,21,23,26,36,51,53,111,190,193,215,216],$Va6=[7,18,19,20,21,23,26,36,51,53,96,97,98,101,102,103,104,111,190,193,215,216],$Vb6=[2,205],$Vc6=[1,1527],$Vd6=[19,21,71,81,100,108,109,163,178,179,185,204,205,206,207,208,209,210,211,212,213,215],$Ve6=[19,21,71,81,100,108,109,111,163,178,179,185,204,205,206,207,208,209,210,211,212,213,215],$Vf6=[2,247],$Vg6=[2,152],$Vh6=[2,150],$Vi6=[2,159],$Vj6=[2,163],$Vk6=[2,160],$Vl6=[2,161],$Vm6=[1,1544],$Vn6=[70,135],$Vo6=[1,1547],$Vp6=[1,1548],$Vq6=[70,135,140,141],$Vr6=[2,274],$Vs6=[2,276],$Vt6=[2,278],$Vu6=[2,86],$Vv6=[51,53,101,102,103,104,119,125,127,189,227],$Vw6=[1,1586],$Vx6=[1,1596],$Vy6=[1,1602],$Vz6=[1,1601],$VA6=[1,1639],$VB6=[1,1686],$VC6=[1,1719],$VD6=[1,1725],$VE6=[1,1724],$VF6=[1,1745],$VG6=[1,1751],$VH6=[1,1750],$VI6=[1,1772],$VJ6=[1,1778],$VK6=[1,1777],$VL6=[1,1823],$VM6=[1,1889],$VN6=[1,1895],$VO6=[1,1894],$VP6=[1,1915],$VQ6=[1,1921],$VR6=[1,1920],$VS6=[1,1941],$VT6=[1,1947],$VU6=[1,1946],$VV6=[1,1988],$VW6=[1,1994],$VX6=[1,2026],$VY6=[1,2032],$VZ6=[121,135,140,141,190,193],$V_6=[2,172],$V$6=[1,2052],$V07=[1,2053],$V17=[1,2054],$V27=[1,2055],$V37=[121,135,140,141,156,157,158,159,190,193],$V47=[2,38],$V57=[51,121,135,140,141,156,157,158,159,190,193],$V67=[2,51],$V77=[51,53,121,135,140,141,156,157,158,159,190,193],$V87=[2,58],$V97=[1,2084],$Va7=[2,272],$Vb7=[2,279],$Vc7=[19,21,39,43,69,71,79,80,81,85,96,97,98,101,102,103,104,111,112,113,114,115,116,117,119,125,127,161,179,189,190,193,215,227,229],$Vd7=[1,2197],$Ve7=[1,2203],$Vf7=[1,2235],$Vg7=[1,2241],$Vh7=[1,2294],$Vi7=[1,2327],$Vj7=[1,2333],$Vk7=[1,2332],$Vl7=[1,2353],$Vm7=[1,2359],$Vn7=[1,2358],$Vo7=[1,2380],$Vp7=[1,2386],$Vq7=[1,2385],$Vr7=[1,2407],$Vs7=[1,2413],$Vt7=[1,2412],$Vu7=[1,2433],$Vv7=[1,2439],$Vw7=[1,2438],$Vx7=[1,2460],$Vy7=[1,2466],$Vz7=[1,2465],$VA7=[51,53,70,79,80,81,111,119,125,127,189,190,193,227],$VB7=[51,53,70,111,190,193],$VC7=[51,53,70,96,97,98,101,102,103,104,111,190,193],$VD7=[1,2535],$VE7=[2,173],$VF7=[2,177],$VG7=[2,178],$VH7=[2,179],$VI7=[2,180],$VJ7=[2,49],$VK7=[2,56],$VL7=[2,63],$VM7=[2,83],$VN7=[2,79],$VO7=[1,2618],$VP7=[2,82],$VQ7=[51,53,79,80,81,101,102,103,104,119,121,125,127,135,140,141,156,157,158,159,189,190,193,227],$VR7=[51,53,79,80,81,119,121,125,127,135,140,141,156,157,158,159,189,190,193,227],$VS7=[51,53,101,102,103,104,112,113,114,115,116,117,121,135,140,141,156,157,158,159,190,193],$VT7=[51,53,96,97,98,101,102,103,104,121,135,140,141,156,157,158,159,190,193],$VU7=[51,53,112,113,114,115,116,117,121,135,140,141,156,157,158,159,190,193],$VV7=[1,2668],$VW7=[1,2706],$VX7=[1,2761],$VY7=[1,2850],$VZ7=[1,2856],$V_7=[1,2939],$V$7=[1,2972],$V08=[1,2978],$V18=[1,2977],$V28=[1,2998],$V38=[1,3004],$V48=[1,3003],$V58=[1,3025],$V68=[1,3031],$V78=[1,3030],$V88=[1,3052],$V98=[1,3058],$Va8=[1,3057],$Vb8=[1,3078],$Vc8=[1,3084],$Vd8=[1,3083],$Ve8=[1,3105],$Vf8=[1,3111],$Vg8=[1,3110],$Vh8=[121,135,140,141,193],$Vi8=[1,3130],$Vj8=[2,52],$Vk8=[2,59],$Vl8=[2,78],$Vm8=[2,84],$Vn8=[2,80],$Vo8=[51,53,101,102,103,104,121,135,140,141,156,157,158,159,190,193],$Vp8=[1,3154],$Vq8=[70,135,140,141,190,193],$Vr8=[1,3163],$Vs8=[1,3164],$Vt8=[1,3165],$Vu8=[1,3166],$Vv8=[70,135,140,141,156,157,158,159,190,193],$Vw8=[51,70,135,140,141,156,157,158,159,190,193],$Vx8=[51,53,70,135,140,141,156,157,158,159,190,193],$Vy8=[1,3195],$Vz8=[1,3222],$VA8=[1,3245],$VB8=[1,3276],$VC8=[1,3309],$VD8=[1,3315],$VE8=[1,3314],$VF8=[1,3335],$VG8=[1,3341],$VH8=[1,3340],$VI8=[1,3362],$VJ8=[1,3368],$VK8=[1,3367],$VL8=[1,3389],$VM8=[1,3395],$VN8=[1,3394],$VO8=[1,3415],$VP8=[1,3421],$VQ8=[1,3420],$VR8=[1,3442],$VS8=[1,3448],$VT8=[1,3447],$VU8=[1,3525],$VV8=[1,3531],$VW8=[2,174],$VX8=[2,50],$VY8=[1,3619],$VZ8=[2,57],$V_8=[1,3652],$V$8=[2,81],$V09=[2,171],$V19=[1,3697],$V29=[51,53,70,79,80,81,101,102,103,104,119,125,127,135,140,141,156,157,158,159,189,190,193,227],$V39=[51,53,70,79,80,81,119,125,127,135,140,141,156,157,158,159,189,190,193,227],$V49=[51,53,70,101,102,103,104,112,113,114,115,116,117,135,140,141,156,157,158,159,190,193],$V59=[51,53,70,96,97,98,101,102,103,104,135,140,141,156,157,158,159,190,193],$V69=[51,53,70,112,113,114,115,116,117,135,140,141,156,157,158,159,190,193],$V79=[1,3802],$V89=[1,3808],$V99=[1,3871],$Va9=[1,3877],$Vb9=[1,3876],$Vc9=[1,3897],$Vd9=[1,3903],$Ve9=[1,3902],$Vf9=[1,3924],$Vg9=[1,3930],$Vh9=[1,3929],$Vi9=[1,3989],$Vj9=[1,3995],$Vk9=[1,3994],$Vl9=[1,4030],$Vm9=[1,4072],$Vn9=[70,135,140,141,193],$Vo9=[1,4102],$Vp9=[51,53,70,101,102,103,104,135,140,141,156,157,158,159,190,193],$Vq9=[1,4126],$Vr9=[1,4149],$Vs9=[1,4243],$Vt9=[1,4249],$Vu9=[1,4248],$Vv9=[1,4269],$Vw9=[1,4275],$Vx9=[1,4274],$Vy9=[1,4296],$Vz9=[1,4302],$VA9=[1,4301],$VB9=[111,121,135,140,141,190,193],$VC9=[1,4344],$VD9=[1,4368],$VE9=[1,4410],$VF9=[1,4443],$VG9=[1,4483],$VH9=[1,4506],$VI9=[1,4512],$VJ9=[1,4511],$VK9=[1,4532],$VL9=[1,4538],$VM9=[1,4537],$VN9=[1,4559],$VO9=[1,4565],$VP9=[1,4564],$VQ9=[1,4639],$VR9=[1,4682],$VS9=[1,4688],$VT9=[1,4687],$VU9=[1,4723],$VV9=[1,4765],$VW9=[1,4855],$VX9=[70,111,135,140,141,190,193],$VY9=[1,4910],$VZ9=[1,4934],$V_9=[1,4972],$V$9=[1,5018],$V0a=[1,5096],$V1a=[1,5145];

class ShExJisonParser extends JisonParser {
    constructor(yy = {}, lexer = new ShExJisonLexer(yy)) {
        super(yy, lexer);
        this.symbols_ = {"error":2,"shexDoc":3,"initParser":4,"Qdirective_E_Star":5,"Q_O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C_E_Opt":6,"EOF":7,"directive":8,"O_QnotStartAction_E_Or_QstartActions_E_C":9,"notStartAction":10,"startActions":11,"Qstatement_E_Star":12,"statement":13,"O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C":14,"baseDecl":15,"prefixDecl":16,"importDecl":17,"IT_BASE":18,"IRIREF":19,"IT_PREFIX":20,"PNAME_NS":21,"iri":22,"IT_IMPORT":23,"start":24,"shapeExprDecl":25,"IT_start":26,"=":27,"shapeAnd":28,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Star":29,"QcodeDecl_E_Plus":30,"codeDecl":31,"QIT_ABSTRACT_E_Opt":32,"shapeExprLabel":33,"Qrestriction_E_Star":34,"O_QshapeExpression_E_Or_QIT_EXTERNAL_E_C":35,"IT_ABSTRACT":36,"restriction":37,"shapeExpression":38,"IT_EXTERNAL":39,"QIT_NOT_E_Opt":40,"shapeAtomNoRef":41,"QshapeOr_E_Opt":42,"IT_NOT":43,"shapeRef":44,"shapeOr":45,"inlineShapeExpression":46,"inlineShapeOr":47,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Plus":48,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Plus":49,"O_QIT_OR_E_S_QshapeAnd_E_C":50,"IT_OR":51,"O_QIT_AND_E_S_QshapeNot_E_C":52,"IT_AND":53,"shapeNot":54,"inlineShapeAnd":55,"Q_O_QIT_OR_E_S_QinlineShapeAnd_E_C_E_Star":56,"O_QIT_OR_E_S_QinlineShapeAnd_E_C":57,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Star":58,"inlineShapeNot":59,"Q_O_QIT_AND_E_S_QinlineShapeNot_E_C_E_Star":60,"O_QIT_AND_E_S_QinlineShapeNot_E_C":61,"shapeAtom":62,"inlineShapeAtom":63,"nonLitNodeConstraint":64,"QshapeOrRef_E_Opt":65,"litNodeConstraint":66,"shapeOrRef":67,"QnonLitNodeConstraint_E_Opt":68,"(":69,")":70,".":71,"shapeDefinition":72,"nonLitInlineNodeConstraint":73,"QinlineShapeOrRef_E_Opt":74,"litInlineNodeConstraint":75,"inlineShapeOrRef":76,"QnonLitInlineNodeConstraint_E_Opt":77,"inlineShapeDefinition":78,"ATPNAME_LN":79,"ATPNAME_NS":80,"@":81,"Qannotation_E_Star":82,"semanticActions":83,"annotation":84,"IT_LITERAL":85,"QxsFacet_E_Star":86,"datatype":87,"valueSet":88,"QnumericFacet_E_Plus":89,"xsFacet":90,"numericFacet":91,"nonLiteralKind":92,"QstringFacet_E_Star":93,"QstringFacet_E_Plus":94,"stringFacet":95,"IT_IRI":96,"IT_BNODE":97,"IT_NONLITERAL":98,"stringLength":99,"INTEGER":100,"REGEXP":101,"IT_LENGTH":102,"IT_MINLENGTH":103,"IT_MAXLENGTH":104,"numericRange":105,"rawNumeric":106,"numericLength":107,"DECIMAL":108,"DOUBLE":109,"string":110,"^^":111,"IT_MININCLUSIVE":112,"IT_MINEXCLUSIVE":113,"IT_MAXINCLUSIVE":114,"IT_MAXEXCLUSIVE":115,"IT_TOTALDIGITS":116,"IT_FRACTIONDIGITS":117,"Q_O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C_E_Star":118,"{":119,"QtripleExpression_E_Opt":120,"}":121,"O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C":122,"extension":123,"extraPropertySet":124,"IT_CLOSED":125,"tripleExpression":126,"IT_EXTRA":127,"Qpredicate_E_Plus":128,"predicate":129,"oneOfTripleExpr":130,"groupTripleExpr":131,"multiElementOneOf":132,"Q_O_QGT_PIPE_E_S_QgroupTripleExpr_E_C_E_Plus":133,"O_QGT_PIPE_E_S_QgroupTripleExpr_E_C":134,"|":135,"singleElementGroup":136,"multiElementGroup":137,"unaryTripleExpr":138,"QGT_SEMI_E_Opt":139,",":140,";":141,"Q_O_QGT_SEMI_E_S_QunaryTripleExpr_E_C_E_Plus":142,"O_QGT_SEMI_E_S_QunaryTripleExpr_E_C":143,"Q_O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C_E_Opt":144,"O_QtripleConstraint_E_Or_QbracketedTripleExpr_E_C":145,"include":146,"O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C":147,"$":148,"tripleExprLabel":149,"tripleConstraint":150,"bracketedTripleExpr":151,"Qcardinality_E_Opt":152,"cardinality":153,"QsenseFlags_E_Opt":154,"senseFlags":155,"*":156,"+":157,"?":158,"REPEAT_RANGE":159,"^":160,"[":161,"QvalueSetValue_E_Star":162,"]":163,"valueSetValue":164,"iriRange":165,"literalRange":166,"languageRange":167,"O_QiriExclusion_E_Plus_Or_QliteralExclusion_E_Plus_Or_QlanguageExclusion_E_Plus_C":168,"QiriExclusion_E_Plus":169,"iriExclusion":170,"QliteralExclusion_E_Plus":171,"literalExclusion":172,"QlanguageExclusion_E_Plus":173,"languageExclusion":174,"Q_O_QGT_TILDE_E_S_QiriExclusion_E_Star_C_E_Opt":175,"QiriExclusion_E_Star":176,"O_QGT_TILDE_E_S_QiriExclusion_E_Star_C":177,"~":178,"-":179,"QGT_TILDE_E_Opt":180,"literal":181,"Q_O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C_E_Opt":182,"QliteralExclusion_E_Star":183,"O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C":184,"LANGTAG":185,"Q_O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C_E_Opt":186,"O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C":187,"QlanguageExclusion_E_Star":188,"&":189,"//":190,"O_Qiri_E_Or_Qliteral_E_C":191,"QcodeDecl_E_Star":192,"%":193,"O_QCODE_E_Or_QGT_MODULO_E_C":194,"CODE":195,"rdfLiteral":196,"numericLiteral":197,"booleanLiteral":198,"a":199,"blankNode":200,"langString":201,"Q_O_QGT_DTYPE_E_S_Qdatatype_E_C_E_Opt":202,"O_QGT_DTYPE_E_S_Qdatatype_E_C":203,"IT_true":204,"IT_false":205,"STRING_LITERAL1":206,"STRING_LITERAL_LONG1":207,"STRING_LITERAL2":208,"STRING_LITERAL_LONG2":209,"LANG_STRING_LITERAL1":210,"LANG_STRING_LITERAL_LONG1":211,"LANG_STRING_LITERAL2":212,"LANG_STRING_LITERAL_LONG2":213,"prefixedName":214,"PNAME_LN":215,"BLANK_NODE_LABEL":216,"O_QIT_EXTENDS_E_Or_QGT_AMP_E_C":217,"extendsShapeExpression":218,"extendsShapeOr":219,"extendsShapeAnd":220,"Q_O_QIT_OR_E_S_QextendsShapeAnd_E_C_E_Star":221,"O_QIT_OR_E_S_QextendsShapeAnd_E_C":222,"extendsShapeNot":223,"Q_O_QIT_AND_E_S_QextendsShapeNot_E_C_E_Star":224,"O_QIT_AND_E_S_QextendsShapeNot_E_C":225,"extendsShapeAtom":226,"IT_EXTENDS":227,"O_QIT_RESTRICTS_E_Or_QGT_MINUS_E_C":228,"IT_RESTRICTS":229,"$accept":0,"$end":1};
        this.terminals_ = {2:"error",7:"EOF",18:"IT_BASE",19:"IRIREF",20:"IT_PREFIX",21:"PNAME_NS",23:"IT_IMPORT",26:"IT_start",27:"=",36:"IT_ABSTRACT",39:"IT_EXTERNAL",43:"IT_NOT",51:"IT_OR",53:"IT_AND",69:"(",70:")",71:".",79:"ATPNAME_LN",80:"ATPNAME_NS",81:"@",85:"IT_LITERAL",96:"IT_IRI",97:"IT_BNODE",98:"IT_NONLITERAL",100:"INTEGER",101:"REGEXP",102:"IT_LENGTH",103:"IT_MINLENGTH",104:"IT_MAXLENGTH",108:"DECIMAL",109:"DOUBLE",111:"^^",112:"IT_MININCLUSIVE",113:"IT_MINEXCLUSIVE",114:"IT_MAXINCLUSIVE",115:"IT_MAXEXCLUSIVE",116:"IT_TOTALDIGITS",117:"IT_FRACTIONDIGITS",119:"{",121:"}",125:"IT_CLOSED",127:"IT_EXTRA",135:"|",140:",",141:";",148:"$",156:"*",157:"+",158:"?",159:"REPEAT_RANGE",160:"^",161:"[",163:"]",178:"~",179:"-",185:"LANGTAG",189:"&",190:"//",193:"%",195:"CODE",199:"a",204:"IT_true",205:"IT_false",206:"STRING_LITERAL1",207:"STRING_LITERAL_LONG1",208:"STRING_LITERAL2",209:"STRING_LITERAL_LONG2",210:"LANG_STRING_LITERAL1",211:"LANG_STRING_LITERAL_LONG1",212:"LANG_STRING_LITERAL2",213:"LANG_STRING_LITERAL_LONG2",215:"PNAME_LN",216:"BLANK_NODE_LABEL",227:"IT_EXTENDS",229:"IT_RESTRICTS"};
        this.productions_ = [0,[3,4],[4,0],[5,0],[5,2],[9,1],[9,1],[12,0],[12,2],[14,2],[6,0],[6,1],[8,1],[8,1],[8,1],[15,2],[16,3],[17,2],[10,1],[10,1],[24,4],[11,1],[30,1],[30,2],[13,1],[13,1],[25,4],[32,0],[32,1],[34,0],[34,2],[35,1],[35,1],[38,3],[38,3],[38,2],[42,0],[42,1],[46,1],[45,1],[45,2],[50,2],[48,1],[48,2],[52,2],[49,1],[49,2],[29,0],[29,2],[47,2],[57,2],[56,0],[56,2],[28,2],[58,0],[58,2],[55,2],[61,2],[60,0],[60,2],[54,2],[40,0],[40,1],[59,2],[62,2],[62,1],[62,2],[62,3],[62,1],[65,0],[65,1],[68,0],[68,1],[41,2],[41,1],[41,2],[41,3],[41,1],[63,2],[63,1],[63,2],[63,3],[63,1],[74,0],[74,1],[77,0],[77,1],[67,1],[67,1],[76,1],[76,1],[44,1],[44,1],[44,2],[66,3],[82,0],[82,2],[64,3],[75,2],[75,2],[75,2],[75,1],[86,0],[86,2],[89,1],[89,2],[73,2],[73,1],[93,0],[93,2],[94,1],[94,2],[92,1],[92,1],[92,1],[90,1],[90,1],[95,2],[95,1],[99,1],[99,1],[99,1],[91,2],[91,2],[106,1],[106,1],[106,1],[106,3],[105,1],[105,1],[105,1],[105,1],[107,1],[107,1],[72,3],[78,4],[122,1],[122,1],[122,1],[118,0],[118,2],[120,0],[120,1],[124,2],[128,1],[128,2],[126,1],[130,1],[130,1],[132,2],[134,2],[133,1],[133,2],[131,1],[131,1],[136,2],[139,0],[139,1],[139,1],[137,3],[143,2],[143,2],[142,1],[142,2],[138,2],[138,1],[147,2],[144,0],[144,1],[145,1],[145,1],[151,6],[152,0],[152,1],[150,6],[154,0],[154,1],[153,1],[153,1],[153,1],[153,1],[155,1],[88,3],[162,0],[162,2],[164,1],[164,1],[164,1],[164,2],[169,1],[169,2],[171,1],[171,2],[173,1],[173,2],[168,1],[168,1],[168,1],[165,2],[176,0],[176,2],[177,2],[175,0],[175,1],[170,3],[180,0],[180,1],[166,2],[183,0],[183,2],[184,2],[182,0],[182,1],[172,3],[167,2],[167,2],[188,0],[188,2],[187,2],[186,0],[186,1],[174,3],[146,2],[84,3],[191,1],[191,1],[83,1],[192,0],[192,2],[31,3],[194,1],[194,1],[181,1],[181,1],[181,1],[129,1],[129,1],[87,1],[33,1],[33,1],[149,1],[149,1],[197,1],[197,1],[197,1],[196,1],[196,2],[203,2],[202,0],[202,1],[198,1],[198,1],[110,1],[110,1],[110,1],[110,1],[201,1],[201,1],[201,1],[201,1],[22,1],[22,1],[214,1],[214,1],[200,1],[123,2],[218,1],[219,2],[222,2],[221,0],[221,2],[220,2],[225,2],[224,0],[224,2],[223,2],[226,2],[226,1],[226,2],[226,3],[226,1],[217,1],[217,1],[37,2],[228,1],[228,1]];
        this.table = [o($V0,[2,2],{3:1,4:2}),{1:[3]},o($V0,[2,3],{5:3}),o($V1,$V2,{6:4,8:5,14:6,15:7,16:8,17:9,9:10,10:14,11:15,24:16,25:17,30:18,32:20,31:21,7:[2,10],18:[1,11],20:[1,12],23:[1,13],26:[1,19],36:$V3,193:$V4}),{7:[1,24]},o($V0,[2,4]),{7:[2,11]},o($V0,$V5),o($V0,$V6),o($V0,$V7),o($V8,[2,7],{12:25}),{19:[1,26]},{21:[1,27]},{19:$V9,21:$Va,22:28,214:30,215:$Vb},o($V8,[2,5]),o($V8,[2,6]),o($V8,$Vc),o($V8,$Vd),o($V8,[2,21],{31:33,193:$V4}),{27:[1,34]},{19:$Ve,21:$Vf,22:36,33:35,200:37,214:39,215:$Vg,216:$Vh},o($V0,[2,22]),o($V1,[2,28]),{19:$Vi,21:$Vj,22:43,214:45,215:$Vk},{1:[2,1]},o($V1,$V2,{13:48,8:49,10:50,15:51,16:52,17:53,24:54,25:55,32:60,7:[2,9],18:[1,56],20:[1,57],23:[1,58],26:[1,59],36:$V3}),o($V0,$Vl),{19:$V9,21:$Va,22:61,214:30,215:$Vb},o($V0,$Vm),o($V0,$Vn),o($V0,$Vo),o($V0,$Vp),o($V0,$Vq),o($V0,[2,23]),o($Vr,$Vs,{28:62,54:63,40:64,43:$Vt}),o($Vu,$Vv,{34:66}),o($Vu,$Vw),o($Vu,$Vx),o($Vu,$Vn),o($Vu,$Vo),o($Vu,$Vy),o($Vu,$Vp),o($Vu,$Vq),{193:[1,69],194:67,195:[1,68]},o($Vz,$Vn),o($Vz,$Vo),o($Vz,$Vp),o($Vz,$Vq),o($V8,[2,8]),o($V8,[2,24]),o($V8,[2,25]),o($V8,$V5),o($V8,$V6),o($V8,$V7),o($V8,$Vc),o($V8,$Vd),{19:[1,70]},{21:[1,71]},{19:$VA,21:$VB,22:72,214:74,215:$VC},{27:[1,77]},{19:$Ve,21:$Vf,22:36,33:78,200:37,214:39,215:$Vg,216:$Vh},o($V0,$VD),o($VE,$VF,{29:79}),o($VG,$VH,{58:80}),o($VI,$VJ,{62:81,64:82,66:83,67:84,73:87,75:88,72:89,44:90,92:91,94:92,87:94,88:95,89:96,78:97,95:104,22:105,91:107,118:108,99:109,214:112,105:113,107:114,19:$VK,21:$VL,69:[1,85],71:[1,86],79:[1,98],80:[1,99],81:[1,100],85:$VM,96:$VN,97:$VO,98:$VP,101:$VQ,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:$V_,215:$V$}),o($Vr,$V01),o($V11,$Vs,{35:126,37:127,38:128,228:130,40:131,44:133,39:[1,129],43:[1,132],79:$V21,80:$V31,81:$V41,179:$V51,229:$V61}),o($V0,$V71),o($V0,$V81),o($V0,$V91),o($V8,$Vl),{19:$VA,21:$VB,22:139,214:74,215:$VC},o($V8,$Vm),o($V8,$Vn),o($V8,$Vo),o($V8,$Vp),o($V8,$Vq),o($Vr,$Vs,{28:140,54:141,40:142,43:$Vt}),o($Vu,$Vv,{34:143}),o($V8,$Va1,{50:144,51:$Vb1}),o($VE,$Vc1,{52:146,53:$Vd1}),o($VG,$Ve1),o($VG,$Vf1,{65:148,67:149,72:150,44:151,78:152,118:156,79:$Vg1,80:$Vh1,81:$Vi1,119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($VG,$Vj1),o($VG,$Vk1,{68:157,64:158,73:159,92:160,94:161,95:165,99:166,96:$Vl1,97:$Vm1,98:$Vn1,101:$Vo1,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{38:168,40:169,44:171,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VG,$Vq1),o($Vr1,$Vs1,{82:172}),o($Vt1,$Vs1,{82:173}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:174}),o($Vr1,$Vz1,{99:109,95:175,101:$VQ,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:176}),o($VA1,$VB1,{86:177}),o($VA1,$VB1,{86:178}),o($Vt1,$VC1,{105:113,107:114,91:179,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:180}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,184],21:[1,188],22:182,33:181,200:183,214:185,215:[1,187],216:[1,186]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:189}),o($VN1,$VO1),{119:[1,190],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},{100:[1,199]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,201],106:200,108:[1,202],109:[1,203],110:204,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,209]},{100:[2,119]},{100:[2,120]},{100:[2,121]},o($VA1,$Vp),o($VA1,$Vq),o($VY1,[2,128]),o($VY1,[2,129]),o($VY1,[2,130]),o($VY1,[2,131]),{100:[2,132]},{100:[2,133]},o($V8,$VZ1),o($Vu,[2,30]),o($V8,$V_1),o($V8,$V$1),o($VI,$VJ,{67:210,72:211,44:212,78:213,118:217,79:[1,214],80:[1,215],81:[1,216]}),o($VI,$VJ,{73:87,75:88,92:91,94:92,87:94,88:95,89:96,78:97,95:104,22:105,91:107,118:108,99:109,214:112,105:113,107:114,41:218,64:219,66:220,72:221,19:$VK,21:$VL,69:[1,222],71:[1,223],85:$VM,96:$VN,97:$VO,98:$VP,101:$VQ,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:$V_,215:$V$}),o($V11,$V01,{44:224,79:$Vg1,80:$Vh1,81:$Vi1}),{45:225,48:226,49:227,50:228,51:$Vb1,52:229,53:$Vd1},o($V02,[2,284]),o($V02,[2,285]),o($V12,$VE1),o($V12,$VF1),{19:[1,233],21:[1,237],22:231,33:230,200:232,214:234,215:[1,236],216:[1,235]},o($V8,$VD),o($VE,$VF,{29:238}),o($VG,$VH,{58:239}),o($VI,$VJ,{62:240,64:241,66:242,67:243,73:246,75:247,72:248,44:249,92:250,94:251,87:253,88:254,89:255,78:256,95:263,22:264,91:266,118:267,99:268,214:271,105:272,107:273,19:$V22,21:$V32,69:[1,244],71:[1,245],79:[1,257],80:[1,258],81:[1,259],85:$V42,96:$V52,97:$V62,98:$V72,101:$V82,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:$V92,215:$Va2}),o($V11,$Vs,{37:127,228:130,35:276,38:277,40:279,44:281,39:[1,278],43:[1,280],79:$V21,80:$V31,81:$V41,179:$V51,229:$V61}),o($VE,$Vb2),o($Vr,$Vs,{28:282,54:283,40:284,43:$Vt}),o($VG,$Vc2),o($Vr,$Vs,{54:285,40:286,43:$Vt}),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:287}),o($VG,$VE1),o($VG,$VF1),{19:[1,291],21:[1,295],22:289,33:288,200:290,214:292,215:[1,294],216:[1,293]},{119:[1,296],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:297}),o($Vh2,$Vy1,{93:298}),o($Vt1,$Vz1,{99:166,95:299,101:$Vo1,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,300]},o($Vh2,$VT1),{70:[1,301]},o($VI,$VJ,{41:302,64:303,66:304,72:305,73:308,75:309,78:310,92:311,94:312,87:314,88:315,89:316,118:317,95:321,22:322,91:324,99:325,214:328,105:329,107:330,19:[1,327],21:[1,332],69:[1,306],71:[1,307],85:[1,313],96:[1,318],97:[1,319],98:[1,320],101:$Vi2,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,323],215:[1,331]}),o($V11,$V01,{44:333,79:$Vj2,80:$Vk2,81:$Vl2}),{45:337,48:338,49:339,50:340,51:$Vm2,52:341,53:$Vn2},o($Vo2,$Vp2,{83:344,84:345,192:346,190:[1,347]}),o($Vq2,$Vp2,{83:348,84:349,192:350,190:$Vr2}),o($Vr1,$Vs2,{99:109,95:352,101:$VQ,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vt2),o($Vt1,$Vu2,{90:353,95:354,91:355,99:356,105:358,107:359,101:$Vv2,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vw2,{90:353,95:354,91:355,99:356,105:358,107:359,101:$Vv2,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:353,95:354,91:355,99:356,105:358,107:359,101:$Vv2,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vy2),o($Vz2,$Vp2,{83:360,84:361,192:362,190:[1,363]}),o($Vu1,$VA2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,364],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{120:396,126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,121:$VW2,148:$VX2,189:$VY2}),o($VI,[2,140]),o($VI,[2,136]),o($VI,[2,137]),o($VI,[2,138]),o($Vr,$Vs,{218:409,219:410,220:411,223:412,40:413,43:$Vt}),{19:$VZ2,21:$V_2,22:416,128:414,129:415,199:$V$2,214:419,215:$V03},o($V13,[2,281]),o($V13,[2,282]),o($Vx1,$V23),o($VN1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),{111:[1,422]},{111:$V73},{111:$V83},{111:$V93},{111:$Va3},o($VN1,$Vb3),o($Vu,[2,283]),o($Vu,$Vv1),o($Vu,$Vw1),o($Vc3,$Vs1,{82:423}),o($Vu,$VE1),o($Vu,$VF1),{19:[1,427],21:[1,431],22:425,33:424,200:426,214:428,215:[1,430],216:[1,429]},{119:[1,432],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($V8,$Vd3,{48:226,49:227,50:228,52:229,42:433,45:434,51:$Vb1,53:$Vd1}),o($VG,$Vf1,{67:149,72:150,44:151,78:152,118:156,65:435,79:$Vg1,80:$Vh1,81:$Vi1,119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($VG,$Ve3),o($VG,$Vk1,{64:158,73:159,92:160,94:161,95:165,99:166,68:436,96:$Vl1,97:$Vm1,98:$Vn1,101:$Vo1,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:437,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VG,$Vf3),o($V8,$Vd3,{48:226,49:227,50:228,52:229,45:434,42:438,51:$Vb1,53:$Vd1}),o($V8,$Vg3),o($V8,$Vh3,{50:439,51:$Vb1}),o($VE,$VF,{29:440,52:441,53:$Vd1}),o($VE,$Vi3),o($VG,$Vj3),o($V12,$VA2),o($V12,$Vw),o($V12,$Vx),o($V12,$Vn),o($V12,$Vo),o($V12,$Vy),o($V12,$Vp),o($V12,$Vq),o($V8,$Va1,{50:442,51:$Vk3}),o($VE,$Vc1,{52:444,53:$Vl3}),o($VG,$Ve1),o($VG,$Vf1,{65:446,67:447,72:448,44:449,78:450,118:454,79:$Vm3,80:$Vn3,81:$Vo3,119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($VG,$Vj1),o($VG,$Vk1,{68:455,64:456,73:457,92:458,94:459,95:463,99:464,96:$Vp3,97:$Vq3,98:$Vr3,101:$Vs3,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:466,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VG,$Vq1),o($Vr1,$Vs1,{82:467}),o($Vt1,$Vs1,{82:468}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:469}),o($Vr1,$Vz1,{99:268,95:470,101:$V82,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:471}),o($VA1,$VB1,{86:472}),o($VA1,$VB1,{86:473}),o($Vt1,$VC1,{105:272,107:273,91:474,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:475}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,479],21:[1,483],22:477,33:476,200:478,214:480,215:[1,482],216:[1,481]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:484}),o($VN1,$VO1),{119:[1,485],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},{100:[1,486]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,488],106:487,108:[1,489],109:[1,490],110:491,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,492]},o($VA1,$Vp),o($VA1,$Vq),o($V8,$VZ1),o($V8,$V_1),o($V8,$V$1),o($VI,$VJ,{73:246,75:247,92:250,94:251,87:253,88:254,89:255,78:256,95:263,22:264,91:266,118:267,99:268,214:271,105:272,107:273,41:493,64:494,66:495,72:496,19:$V22,21:$V32,69:[1,497],71:[1,498],85:$V42,96:$V52,97:$V62,98:$V72,101:$V82,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:$V92,215:$Va2}),o($V11,$V01,{44:499,79:$Vm3,80:$Vn3,81:$Vo3}),{45:500,48:501,49:502,50:503,51:$Vk3,52:504,53:$Vl3},o($VE,$Vt3),o($VG,$VH,{58:505}),o($VI,$VJ,{62:506,64:507,66:508,67:509,73:512,75:513,72:514,44:515,92:516,94:517,87:519,88:520,89:521,78:522,95:529,22:530,91:532,118:533,99:534,214:537,105:538,107:539,19:[1,536],21:[1,541],69:[1,510],71:[1,511],79:[1,523],80:[1,524],81:[1,525],85:[1,518],96:[1,526],97:[1,527],98:[1,528],101:$Vu3,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,531],215:[1,540]}),o($VG,$Vv3),o($VI,$VJ,{62:542,64:543,66:544,67:545,73:548,75:549,72:550,44:551,92:552,94:553,87:555,88:556,89:557,78:558,95:565,22:566,91:568,118:569,99:570,214:573,105:574,107:575,19:[1,572],21:[1,577],69:[1,546],71:[1,547],79:[1,559],80:[1,560],81:[1,561],85:[1,554],96:[1,562],97:[1,563],98:[1,564],101:$Vw3,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,567],215:[1,576]}),o($Vq2,$Vp2,{84:349,192:350,83:578,190:$Vr2}),o($VG,$VA2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:579,121:$VW2,148:$VX2,189:$VY2}),o($Vq2,$Vp2,{84:349,192:350,83:580,190:$Vr2}),o($Vt1,$Vs2,{99:166,95:581,101:$Vo1,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vt2),o($Vh2,$V23),o($VG,$Vx3),{42:582,45:583,48:338,49:339,50:340,51:$Vm2,52:341,53:$Vn2,70:$Vd3},o($VI,$VJ,{65:584,67:585,72:586,44:587,78:588,118:589,51:$Vf1,53:$Vf1,70:$Vf1,79:$Vj2,80:$Vk2,81:$Vl2}),o($Vy3,$Ve3),o($Vy3,$Vk1,{68:590,64:591,73:592,92:593,94:594,95:598,99:599,96:[1,595],97:[1,596],98:[1,597],101:$Vz3,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:601,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($Vy3,$Vf3),o($VA3,$Vs1,{82:602}),o($VB3,$Vs1,{82:603}),o($VC3,$Vs1,{82:604}),o($VD3,$Vy1,{93:605}),o($VA3,$Vz1,{99:325,95:606,101:$Vi2,102:$VR,103:$VS,104:$VT}),o($VE3,$VB1,{86:607}),o($VE3,$VB1,{86:608}),o($VE3,$VB1,{86:609}),o($VB3,$VC1,{105:329,107:330,91:610,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),{119:[1,611],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($VD3,$VG1),o($VD3,$VH1),o($VD3,$VI1),o($VD3,$VJ1),o($VE3,$VK1),o($VL1,$VM1,{162:612}),o($VF3,$VO1),{100:[1,613]},o($VD3,$VT1),o($VE3,$Vn),o($VE3,$Vo),{100:[1,615],106:614,108:[1,616],109:[1,617],110:618,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,619]},o($VE3,$Vp),o($VE3,$Vq),{42:620,45:583,48:338,49:339,50:340,51:$Vm2,52:341,53:$Vn2,70:$Vd3},o($Vy3,$VE1),o($Vy3,$VF1),{19:[1,624],21:[1,628],22:622,33:621,200:623,214:625,215:[1,627],216:[1,626]},{70:$Vg3},{50:629,51:$Vm2,70:$Vh3},o($VG3,$VF,{29:630,52:631,53:$Vn2}),o($VG3,$Vi3),o($Vy3,$Vj3),o($Vr,$Vs,{28:632,54:633,40:634,43:$Vt}),o($Vr,$Vs,{54:635,40:636,43:$Vt}),o($VH3,$VI3),o($Vr1,$VJ3),o($VH3,$VK3,{31:637,193:[1,638]}),{19:$VL3,21:$VM3,22:640,129:639,199:$VN3,214:643,215:$VO3},o($VG,$VP3),o($Vt1,$VJ3),o($VG,$VK3,{31:646,193:[1,647]}),{19:$VL3,21:$VM3,22:640,129:648,199:$VN3,214:643,215:$VO3},o($Vx1,$VQ3),o($VA1,$VR3),o($VA1,$VS3),o($VA1,$VT3),{100:[1,649]},o($VA1,$VT1),{100:[1,651],106:650,108:[1,652],109:[1,653],110:654,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,655]},o($Vu1,$VU3),o($VD1,$VJ3),o($Vu1,$VK3,{31:656,193:[1,657]}),{19:$VL3,21:$VM3,22:640,129:658,199:$VN3,214:643,215:$VO3},o($VA1,$VV3),o($VL1,[2,184]),o($VL1,[2,185]),o($VL1,[2,186]),o($VL1,[2,187]),{168:659,169:660,170:663,171:661,172:664,173:662,174:665,179:[1,666]},o($VL1,[2,202],{175:667,177:668,178:[1,669]}),o($VL1,[2,211],{182:670,184:671,178:[1,672]}),o($VL1,[2,219],{186:673,187:674,178:$VW3}),{178:$VW3,187:676},o($VX3,$Vn),o($VX3,$Vo),o($VX3,$VY3),o($VX3,$VZ3),o($VX3,$V_3),o($VX3,$Vp),o($VX3,$Vq),o($VX3,$V$3),o($VX3,$V04,{202:677,203:678,111:[1,679]}),o($VX3,$V14),o($VX3,$V24),o($VX3,$V34),o($VX3,$V44),o($VX3,$V54),o($VX3,$V64),o($VX3,$V74),o($VX3,$V84),o($VX3,$V94),o($Va4,$V73),o($Va4,$V83),o($Va4,$V93),o($Va4,$Va3),{121:[1,680]},{121:[2,142]},{121:$Vb4},{121:$Vc4,133:681,134:682,135:$Vd4},{121:$Ve4},o($Vf4,$Vg4),o($Vf4,$Vh4),o($Vf4,$Vi4,{139:684,142:685,143:688,140:$Vj4,141:$Vk4}),o($Vl4,$Vm4,{145:689,150:690,151:691,154:692,155:694,69:[1,693],160:$Vn4}),o($Vo4,$Vp4),o($VU2,[2,168]),{19:[1,699],21:[1,703],22:697,149:696,200:698,214:700,215:[1,702],216:[1,701]},{19:[1,707],21:[1,711],22:705,149:704,200:706,214:708,215:[1,710],216:[1,709]},o($VI,[2,265]),o($VI,[2,266]),o($Vq4,[2,269],{221:712}),o($Vr4,$Vs4,{224:713}),o($VI,$VJ,{226:714,73:715,75:716,76:717,92:720,94:721,87:723,88:724,89:725,78:726,44:727,95:731,22:732,91:734,118:735,99:739,214:742,105:743,107:744,19:[1,741],21:[1,746],69:[1,718],71:[1,719],79:[1,736],80:[1,737],81:[1,738],85:[1,722],96:$Vt4,97:$Vu4,98:$Vv4,101:$Vw4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,733],215:[1,745]}),o($VI,[2,143],{22:416,214:419,129:747,19:$VZ2,21:$V_2,199:$V$2,215:$V03}),o($Vx4,[2,144]),o($Vx4,$Vy4),o($Vx4,$Vz4),o($Vx4,$Vn),o($Vx4,$Vo),o($Vx4,$Vp),o($Vx4,$Vq),{19:[1,750],21:[1,753],22:749,87:748,214:751,215:[1,752]},o($VA4,$Vp2,{83:754,84:755,192:756,190:[1,757]}),o($Vu,$VA2),o($Vu,$Vw),o($Vu,$Vx),o($Vu,$Vn),o($Vu,$Vo),o($Vu,$Vy),o($Vu,$Vp),o($Vu,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:758,121:$VW2,148:$VX2,189:$VY2}),o($V8,$VB4),o($V8,$VC4),o($VG,$VD4),o($VG,$VE4),{70:[1,759]},o($V8,$VF4),o($VE,$VG4),o($V8,$VH4,{50:144,51:$Vb1}),o($VG,$VI4),o($VE,$Vb2),o($Vr,$Vs,{28:760,54:761,40:762,43:$Vt}),o($VG,$Vc2),o($Vr,$Vs,{54:763,40:764,43:$Vt}),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:765}),o($VG,$VE1),o($VG,$VF1),{19:[1,769],21:[1,773],22:767,33:766,200:768,214:770,215:[1,772],216:[1,771]},{119:[1,774],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:775}),o($Vh2,$Vy1,{93:776}),o($Vt1,$Vz1,{99:464,95:777,101:$Vs3,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,778]},o($Vh2,$VT1),{70:[1,779]},o($Vo2,$Vp2,{83:780,84:781,192:782,190:[1,783]}),o($Vq2,$Vp2,{83:784,84:785,192:786,190:$VJ4}),o($Vr1,$Vs2,{99:268,95:788,101:$V82,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vt2),o($Vt1,$Vu2,{90:789,95:790,91:791,99:792,105:794,107:795,101:$VK4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vw2,{90:789,95:790,91:791,99:792,105:794,107:795,101:$VK4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:789,95:790,91:791,99:792,105:794,107:795,101:$VK4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vy2),o($Vz2,$Vp2,{83:796,84:797,192:798,190:[1,799]}),o($Vu1,$VA2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,800],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:801,121:$VW2,148:$VX2,189:$VY2}),o($Vx1,$V23),o($VN1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),{111:[1,802]},o($VN1,$Vb3),o($V8,$Vd3,{48:501,49:502,50:503,52:504,42:803,45:804,51:$Vk3,53:$Vl3}),o($VG,$Vf1,{67:447,72:448,44:449,78:450,118:454,65:805,79:$Vm3,80:$Vn3,81:$Vo3,119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($VG,$Ve3),o($VG,$Vk1,{64:456,73:457,92:458,94:459,95:463,99:464,68:806,96:$Vp3,97:$Vq3,98:$Vr3,101:$Vs3,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:807,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VG,$Vf3),o($V8,$Vd3,{48:501,49:502,50:503,52:504,45:804,42:808,51:$Vk3,53:$Vl3}),o($V8,$Vg3),o($V8,$Vh3,{50:809,51:$Vk3}),o($VE,$VF,{29:810,52:811,53:$Vl3}),o($VE,$Vi3),o($VG,$Vj3),o($VE,$Vc1,{52:812,53:[1,813]}),o($VG,$Ve1),o($VG,$Vf1,{65:814,67:815,72:816,44:817,78:818,118:822,79:[1,819],80:[1,820],81:[1,821],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($VG,$Vj1),o($VG,$Vk1,{68:823,64:824,73:825,92:826,94:827,95:831,99:832,96:[1,828],97:[1,829],98:[1,830],101:$VL4,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:834,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VG,$Vq1),o($Vr1,$Vs1,{82:835}),o($Vt1,$Vs1,{82:836}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:837}),o($Vr1,$Vz1,{99:534,95:838,101:$Vu3,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:839}),o($VA1,$VB1,{86:840}),o($VA1,$VB1,{86:841}),o($Vt1,$VC1,{105:538,107:539,91:842,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:843}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,847],21:[1,851],22:845,33:844,200:846,214:848,215:[1,850],216:[1,849]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:852}),o($VN1,$VO1),{119:[1,853],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},{100:[1,854]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,856],106:855,108:[1,857],109:[1,858],110:859,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,860]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$Ve1),o($VG,$Vf1,{65:861,67:862,72:863,44:864,78:865,118:869,79:[1,866],80:[1,867],81:[1,868],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($VG,$Vj1),o($VG,$Vk1,{68:870,64:871,73:872,92:873,94:874,95:878,99:879,96:[1,875],97:[1,876],98:[1,877],101:$VM4,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:881,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VG,$Vq1),o($Vr1,$Vs1,{82:882}),o($Vt1,$Vs1,{82:883}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:884}),o($Vr1,$Vz1,{99:570,95:885,101:$Vw3,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:886}),o($VA1,$VB1,{86:887}),o($VA1,$VB1,{86:888}),o($Vt1,$VC1,{105:574,107:575,91:889,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:890}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,894],21:[1,898],22:892,33:891,200:893,214:895,215:[1,897],216:[1,896]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:899}),o($VN1,$VO1),{119:[1,900],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},{100:[1,901]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,903],106:902,108:[1,904],109:[1,905],110:906,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,907]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$VU3),{121:[1,908]},o($VG,$VI3),o($Vh2,$VQ3),{70:$VB4},{70:$VC4},o($Vy3,$VD4),o($Vy3,$Ve2),o($Vy3,$Vv1),o($Vy3,$Vw1),o($VB3,$Vs1,{82:909}),{119:[1,910],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($Vy3,$VE4),o($Vy3,$Vg2),o($VB3,$Vs1,{82:911}),o($VN4,$Vy1,{93:912}),o($VB3,$Vz1,{99:599,95:913,101:$Vz3,102:$VR,103:$VS,104:$VT}),o($VN4,$VG1),o($VN4,$VH1),o($VN4,$VI1),o($VN4,$VJ1),{100:[1,914]},o($VN4,$VT1),{70:[1,915]},o($VO4,$Vp2,{83:916,84:917,192:918,190:[1,919]}),o($VP4,$Vp2,{83:920,84:921,192:922,190:$VQ4}),o($VR4,$Vp2,{83:924,84:925,192:926,190:[1,927]}),o($VA3,$Vs2,{99:325,95:928,101:$Vi2,102:$VR,103:$VS,104:$VT}),o($VD3,$Vt2),o($VB3,$Vu2,{90:929,95:930,91:931,99:932,105:934,107:935,101:$VS4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VB3,$Vw2,{90:929,95:930,91:931,99:932,105:934,107:935,101:$VS4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VB3,$Vx2,{90:929,95:930,91:931,99:932,105:934,107:935,101:$VS4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VF3,$Vy2),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:936,121:$VW2,148:$VX2,189:$VY2}),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,937],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VD3,$V23),o($VF3,$V33),o($VF3,$V43),o($VF3,$V53),o($VF3,$V63),{111:[1,938]},o($VF3,$Vb3),{70:$VF4},o($Vy3,$VA2),o($Vy3,$Vw),o($Vy3,$Vx),o($Vy3,$Vn),o($Vy3,$Vo),o($Vy3,$Vy),o($Vy3,$Vp),o($Vy3,$Vq),o($VG3,$VG4),{50:939,51:$Vm2,70:$VH4},o($Vy3,$VI4),o($VG3,$Vt3),o($Vy3,$VH,{58:940}),o($VI,$VJ,{62:941,64:942,66:943,67:944,73:947,75:948,72:949,44:950,92:951,94:952,87:954,88:955,89:956,78:957,95:964,22:965,91:967,118:968,99:969,214:972,105:973,107:974,19:[1,971],21:[1,976],69:[1,945],71:[1,946],79:[1,958],80:[1,959],81:[1,960],85:[1,953],96:[1,961],97:[1,962],98:[1,963],101:$VT4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,966],215:[1,975]}),o($Vy3,$Vv3),o($VI,$VJ,{62:977,64:978,66:979,67:980,73:983,75:984,72:985,44:986,92:987,94:988,87:990,88:991,89:992,78:993,95:1000,22:1001,91:1003,118:1004,99:1005,214:1008,105:1009,107:1010,19:[1,1007],21:[1,1012],69:[1,981],71:[1,982],79:[1,994],80:[1,995],81:[1,996],85:[1,989],96:[1,997],97:[1,998],98:[1,999],101:$VU4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,1002],215:[1,1011]}),o($Vo2,$VV4),{19:$Vi,21:$Vj,22:1013,214:45,215:$Vk},{19:$VW4,21:$VX4,22:1015,100:[1,1026],108:[1,1027],109:[1,1028],110:1025,181:1016,191:1014,196:1019,197:1020,198:1021,201:1024,204:[1,1029],205:[1,1030],206:[1,1035],207:[1,1036],208:[1,1037],209:[1,1038],210:[1,1031],211:[1,1032],212:[1,1033],213:[1,1034],214:1018,215:$VY4},o($VZ4,$Vy4),o($VZ4,$Vz4),o($VZ4,$Vn),o($VZ4,$Vo),o($VZ4,$Vp),o($VZ4,$Vq),o($Vq2,$VV4),{19:$Vi,21:$Vj,22:1039,214:45,215:$Vk},{19:$V_4,21:$V$4,22:1041,100:[1,1052],108:[1,1053],109:[1,1054],110:1051,181:1042,191:1040,196:1045,197:1046,198:1047,201:1050,204:[1,1055],205:[1,1056],206:[1,1061],207:[1,1062],208:[1,1063],209:[1,1064],210:[1,1057],211:[1,1058],212:[1,1059],213:[1,1060],214:1044,215:$V05},o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),{111:[1,1065]},o($VA1,$Vb3),o($Vz2,$VV4),{19:$Vi,21:$Vj,22:1066,214:45,215:$Vk},{19:$V15,21:$V25,22:1068,100:[1,1079],108:[1,1080],109:[1,1081],110:1078,181:1069,191:1067,196:1072,197:1073,198:1074,201:1077,204:[1,1082],205:[1,1083],206:[1,1088],207:[1,1089],208:[1,1090],209:[1,1091],210:[1,1084],211:[1,1085],212:[1,1086],213:[1,1087],214:1071,215:$V35},o($VL1,[2,188]),o($VL1,[2,195],{170:1092,179:$V45}),o($VL1,[2,196],{172:1094,179:$V55}),o($VL1,[2,197],{174:1096,179:$V65}),o($V75,[2,189]),o($V75,[2,191]),o($V75,[2,193]),{19:$V85,21:$V95,22:1098,100:$Va5,108:$Vb5,109:$Vc5,110:1109,181:1099,185:$Vd5,196:1103,197:1104,198:1105,201:1108,204:$Ve5,205:$Vf5,206:$Vg5,207:$Vh5,208:$Vi5,209:$Vj5,210:$Vk5,211:$Vl5,212:$Vm5,213:$Vn5,214:1102,215:$Vo5},o($VL1,[2,198]),o($VL1,[2,203]),o($V75,[2,199],{176:1123}),o($VL1,[2,207]),o($VL1,[2,212]),o($V75,[2,208],{183:1124}),o($VL1,[2,214]),o($VL1,[2,220]),o($V75,[2,216],{188:1125}),o($VL1,[2,215]),o($VX3,$Vp5),o($VX3,$Vq5),{19:$VB2,21:$VC2,22:1127,87:1126,214:375,215:$VT2},o($VD1,$Vr5),{121:$Vs5,134:1128,135:$Vd4},o($Vf4,$Vt5),o($VU2,$VV2,{136:401,137:402,138:403,144:404,146:405,147:406,131:1129,148:$VX2,189:$VY2}),o($Vf4,$Vu5),o($Vf4,$Vi4,{139:1130,143:1131,140:$Vj4,141:$Vk4}),o($VU2,$VV2,{144:404,146:405,147:406,138:1132,121:$Vv5,135:$Vv5,148:$VX2,189:$VY2}),o($VU2,$VV2,{144:404,146:405,147:406,138:1133,121:$Vw5,135:$Vw5,148:$VX2,189:$VY2}),o($Vo4,$Vx5),o($Vo4,$Vy5),o($Vo4,$Vz5),o($Vo4,$VA5),{19:$VB5,21:$VC5,22:1135,129:1134,199:$VD5,214:1138,215:$VE5},o($VU2,$VV2,{147:406,126:1141,130:1142,131:1143,132:1144,136:1145,137:1146,138:1147,144:1148,146:1149,148:$VX2,189:$VF5}),o($Vl4,[2,176]),o($Vl4,[2,181]),o($Vo4,$VG5),o($Vo4,$VH5),o($Vo4,$VI5),o($Vo4,$Vn),o($Vo4,$Vo),o($Vo4,$Vy),o($Vo4,$Vp),o($Vo4,$Vq),o($VU2,[2,166]),o($VU2,$VH5),o($VU2,$VI5),o($VU2,$Vn),o($VU2,$Vo),o($VU2,$Vy),o($VU2,$Vp),o($VU2,$Vq),o($VI,[2,267],{222:1151,51:[1,1152]}),o($Vq4,$VJ5,{225:1153,53:[1,1154]}),o($Vr4,$VK5),o($VI,$VJ,{76:1155,78:1156,44:1157,118:1158,79:[1,1159],80:[1,1160],81:[1,1161]}),o($Vr4,$VL5),o($Vr4,$VM5,{77:1162,73:1163,92:1164,94:1165,95:1169,99:1170,96:[1,1166],97:[1,1167],98:[1,1168],101:$VN5,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:1172,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($Vr4,$VO5),o($VP5,$Vy1,{93:1173}),o($V02,$Vz1,{99:739,95:1174,101:$Vw4,102:$VR,103:$VS,104:$VT}),o($VQ5,$VB1,{86:1175}),o($VQ5,$VB1,{86:1176}),o($VQ5,$VB1,{86:1177}),o($Vr4,$VC1,{105:743,107:744,91:1178,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VR5,$VS5),o($VR5,$VT5),o($VP5,$VG1),o($VP5,$VH1),o($VP5,$VI1),o($VP5,$VJ1),o($VQ5,$VK1),o($VL1,$VM1,{162:1179}),o($VU5,$VO1),{119:[1,1180],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($VR5,$VE1),o($VR5,$VF1),{19:[1,1184],21:[1,1188],22:1182,33:1181,200:1183,214:1185,215:[1,1187],216:[1,1186]},{100:[1,1189]},o($VP5,$VT1),o($VQ5,$Vn),o($VQ5,$Vo),{100:[1,1191],106:1190,108:[1,1192],109:[1,1193],110:1194,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1195]},o($VQ5,$Vp),o($VQ5,$Vq),o($Vx4,[2,145]),o($VN1,$VV5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($Vu,$VU3),o($Vc3,$VJ3),o($Vu,$VK3,{31:1196,193:[1,1197]}),{19:$VL3,21:$VM3,22:640,129:1198,199:$VN3,214:643,215:$VO3},{121:[1,1199]},o($VG,$VW5),o($VE,$Vt3),o($VG,$VH,{58:1200}),o($VI,$VJ,{62:1201,64:1202,66:1203,67:1204,73:1207,75:1208,72:1209,44:1210,92:1211,94:1212,87:1214,88:1215,89:1216,78:1217,95:1224,22:1225,91:1227,118:1228,99:1229,214:1232,105:1233,107:1234,19:[1,1231],21:[1,1236],69:[1,1205],71:[1,1206],79:[1,1218],80:[1,1219],81:[1,1220],85:[1,1213],96:[1,1221],97:[1,1222],98:[1,1223],101:$VX5,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,1226],215:[1,1235]}),o($VG,$Vv3),o($VI,$VJ,{62:1237,64:1238,66:1239,67:1240,73:1243,75:1244,72:1245,44:1246,92:1247,94:1248,87:1250,88:1251,89:1252,78:1253,95:1260,22:1261,91:1263,118:1264,99:1265,214:1268,105:1269,107:1270,19:[1,1267],21:[1,1272],69:[1,1241],71:[1,1242],79:[1,1254],80:[1,1255],81:[1,1256],85:[1,1249],96:[1,1257],97:[1,1258],98:[1,1259],101:$VY5,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,1262],215:[1,1271]}),o($Vq2,$Vp2,{84:785,192:786,83:1273,190:$VJ4}),o($VG,$VA2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:1274,121:$VW2,148:$VX2,189:$VY2}),o($Vq2,$Vp2,{84:785,192:786,83:1275,190:$VJ4}),o($Vt1,$Vs2,{99:464,95:1276,101:$Vs3,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vt2),o($Vh2,$V23),o($VG,$Vx3),o($VH3,$VI3),o($Vr1,$VJ3),o($VH3,$VK3,{31:1277,193:[1,1278]}),{19:$VL3,21:$VM3,22:640,129:1279,199:$VN3,214:643,215:$VO3},o($VG,$VP3),o($Vt1,$VJ3),o($VG,$VK3,{31:1280,193:[1,1281]}),{19:$VL3,21:$VM3,22:640,129:1282,199:$VN3,214:643,215:$VO3},o($Vx1,$VQ3),o($VA1,$VR3),o($VA1,$VS3),o($VA1,$VT3),{100:[1,1283]},o($VA1,$VT1),{100:[1,1285],106:1284,108:[1,1286],109:[1,1287],110:1288,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1289]},o($Vu1,$VU3),o($VD1,$VJ3),o($Vu1,$VK3,{31:1290,193:[1,1291]}),{19:$VL3,21:$VM3,22:640,129:1292,199:$VN3,214:643,215:$VO3},o($VA1,$VV3),{121:[1,1293]},{19:[1,1296],21:[1,1299],22:1295,87:1294,214:1297,215:[1,1298]},o($V8,$VB4),o($V8,$VC4),o($VG,$VD4),o($VG,$VE4),{70:[1,1300]},o($V8,$VF4),o($VE,$VG4),o($V8,$VH4,{50:442,51:$Vk3}),o($VG,$VI4),o($VG,$Vc2),o($Vr,$Vs,{54:1301,40:1302,43:$Vt}),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:1303}),o($VG,$VE1),o($VG,$VF1),{19:[1,1307],21:[1,1311],22:1305,33:1304,200:1306,214:1308,215:[1,1310],216:[1,1309]},{119:[1,1312],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:1313}),o($Vh2,$Vy1,{93:1314}),o($Vt1,$Vz1,{99:832,95:1315,101:$VL4,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,1316]},o($Vh2,$VT1),{70:[1,1317]},o($Vo2,$Vp2,{83:1318,84:1319,192:1320,190:[1,1321]}),o($Vq2,$Vp2,{83:1322,84:1323,192:1324,190:$VZ5}),o($Vr1,$Vs2,{99:534,95:1326,101:$Vu3,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vt2),o($Vt1,$Vu2,{90:1327,95:1328,91:1329,99:1330,105:1332,107:1333,101:$V_5,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vw2,{90:1327,95:1328,91:1329,99:1330,105:1332,107:1333,101:$V_5,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:1327,95:1328,91:1329,99:1330,105:1332,107:1333,101:$V_5,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vy2),o($Vz2,$Vp2,{83:1334,84:1335,192:1336,190:[1,1337]}),o($Vu1,$VA2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,1338],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:1339,121:$VW2,148:$VX2,189:$VY2}),o($Vx1,$V23),o($VN1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),{111:[1,1340]},o($VN1,$Vb3),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:1341}),o($VG,$VE1),o($VG,$VF1),{19:[1,1345],21:[1,1349],22:1343,33:1342,200:1344,214:1346,215:[1,1348],216:[1,1347]},{119:[1,1350],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:1351}),o($Vh2,$Vy1,{93:1352}),o($Vt1,$Vz1,{99:879,95:1353,101:$VM4,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,1354]},o($Vh2,$VT1),{70:[1,1355]},o($Vo2,$Vp2,{83:1356,84:1357,192:1358,190:[1,1359]}),o($Vq2,$Vp2,{83:1360,84:1361,192:1362,190:$V$5}),o($Vr1,$Vs2,{99:570,95:1364,101:$Vw3,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vt2),o($Vt1,$Vu2,{90:1365,95:1366,91:1367,99:1368,105:1370,107:1371,101:$V06,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vw2,{90:1365,95:1366,91:1367,99:1368,105:1370,107:1371,101:$V06,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:1365,95:1366,91:1367,99:1368,105:1370,107:1371,101:$V06,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vy2),o($Vz2,$Vp2,{83:1372,84:1373,192:1374,190:[1,1375]}),o($Vu1,$VA2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,1376],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:1377,121:$VW2,148:$VX2,189:$VY2}),o($Vx1,$V23),o($VN1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),{111:[1,1378]},o($VN1,$Vb3),o($Vt1,$Vr5),o($VP4,$Vp2,{84:921,192:922,83:1379,190:$VQ4}),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:1380,121:$VW2,148:$VX2,189:$VY2}),o($VP4,$Vp2,{84:921,192:922,83:1381,190:$VQ4}),o($VB3,$Vs2,{99:599,95:1382,101:$Vz3,102:$VR,103:$VS,104:$VT}),o($VN4,$Vt2),o($VN4,$V23),o($Vy3,$VW5),o($V16,$VI3),o($VA3,$VJ3),o($V16,$VK3,{31:1383,193:[1,1384]}),{19:$VL3,21:$VM3,22:640,129:1385,199:$VN3,214:643,215:$VO3},o($Vy3,$VP3),o($VB3,$VJ3),o($Vy3,$VK3,{31:1386,193:[1,1387]}),{19:$VL3,21:$VM3,22:640,129:1388,199:$VN3,214:643,215:$VO3},o($V26,$VU3),o($VC3,$VJ3),o($V26,$VK3,{31:1389,193:[1,1390]}),{19:$VL3,21:$VM3,22:640,129:1391,199:$VN3,214:643,215:$VO3},o($VD3,$VQ3),o($VE3,$VR3),o($VE3,$VS3),o($VE3,$VT3),{100:[1,1392]},o($VE3,$VT1),{100:[1,1394],106:1393,108:[1,1395],109:[1,1396],110:1397,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1398]},{121:[1,1399]},o($VE3,$VV3),{19:[1,1402],21:[1,1405],22:1401,87:1400,214:1403,215:[1,1404]},o($VG3,$Vb2),o($VG3,$Vc1,{52:1406,53:[1,1407]}),o($Vy3,$Ve1),o($VI,$VJ,{65:1408,67:1409,72:1410,44:1411,78:1412,118:1416,51:$Vf1,53:$Vf1,70:$Vf1,79:[1,1413],80:[1,1414],81:[1,1415]}),o($Vy3,$Vj1),o($Vy3,$Vk1,{68:1417,64:1418,73:1419,92:1420,94:1421,95:1425,99:1426,96:[1,1422],97:[1,1423],98:[1,1424],101:$V36,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:1428,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($Vy3,$Vq1),o($VA3,$Vs1,{82:1429}),o($VB3,$Vs1,{82:1430}),o($V26,$Vv1),o($V26,$Vw1),o($VD3,$Vy1,{93:1431}),o($VA3,$Vz1,{99:969,95:1432,101:$VT4,102:$VR,103:$VS,104:$VT}),o($VE3,$VB1,{86:1433}),o($VE3,$VB1,{86:1434}),o($VE3,$VB1,{86:1435}),o($VB3,$VC1,{105:973,107:974,91:1436,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VC3,$Vs1,{82:1437}),o($V26,$VE1),o($V26,$VF1),{19:[1,1441],21:[1,1445],22:1439,33:1438,200:1440,214:1442,215:[1,1444],216:[1,1443]},o($VD3,$VG1),o($VD3,$VH1),o($VD3,$VI1),o($VD3,$VJ1),o($VE3,$VK1),o($VL1,$VM1,{162:1446}),o($VF3,$VO1),{119:[1,1447],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},{100:[1,1448]},o($VD3,$VT1),o($VE3,$Vn),o($VE3,$Vo),{100:[1,1450],106:1449,108:[1,1451],109:[1,1452],110:1453,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1454]},o($VE3,$Vp),o($VE3,$Vq),o($Vy3,$Ve1),o($VI,$VJ,{65:1455,67:1456,72:1457,44:1458,78:1459,118:1463,51:$Vf1,53:$Vf1,70:$Vf1,79:[1,1460],80:[1,1461],81:[1,1462]}),o($Vy3,$Vj1),o($Vy3,$Vk1,{68:1464,64:1465,73:1466,92:1467,94:1468,95:1472,99:1473,96:[1,1469],97:[1,1470],98:[1,1471],101:$V46,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:1475,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($Vy3,$Vq1),o($VA3,$Vs1,{82:1476}),o($VB3,$Vs1,{82:1477}),o($V26,$Vv1),o($V26,$Vw1),o($VD3,$Vy1,{93:1478}),o($VA3,$Vz1,{99:1005,95:1479,101:$VU4,102:$VR,103:$VS,104:$VT}),o($VE3,$VB1,{86:1480}),o($VE3,$VB1,{86:1481}),o($VE3,$VB1,{86:1482}),o($VB3,$VC1,{105:1009,107:1010,91:1483,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VC3,$Vs1,{82:1484}),o($V26,$VE1),o($V26,$VF1),{19:[1,1488],21:[1,1492],22:1486,33:1485,200:1487,214:1489,215:[1,1491],216:[1,1490]},o($VD3,$VG1),o($VD3,$VH1),o($VD3,$VI1),o($VD3,$VJ1),o($VE3,$VK1),o($VL1,$VM1,{162:1493}),o($VF3,$VO1),{119:[1,1494],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},{100:[1,1495]},o($VD3,$VT1),o($VE3,$Vn),o($VE3,$Vo),{100:[1,1497],106:1496,108:[1,1498],109:[1,1499],110:1500,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1501]},o($VE3,$Vp),o($VE3,$Vq),{193:[1,1504],194:1502,195:[1,1503]},o($Vr1,$V56),o($Vr1,$V66),o($Vr1,$V76),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VY3),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V$3),o($Vr1,$V04,{202:1505,203:1506,111:[1,1507]}),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($V86,$V73),o($V86,$V83),o($V86,$V93),o($V86,$Va3),{193:[1,1510],194:1508,195:[1,1509]},o($Vt1,$V56),o($Vt1,$V66),o($Vt1,$V76),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VY3),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V$3),o($Vt1,$V04,{202:1511,203:1512,111:[1,1513]}),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($V96,$V73),o($V96,$V83),o($V96,$V93),o($V96,$Va3),{19:[1,1516],21:[1,1519],22:1515,87:1514,214:1517,215:[1,1518]},{193:[1,1522],194:1520,195:[1,1521]},o($VD1,$V56),o($VD1,$V66),o($VD1,$V76),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VY3),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V$3),o($VD1,$V04,{202:1523,203:1524,111:[1,1525]}),o($VD1,$V14),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($Va6,$V73),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($V75,[2,190]),{19:$V85,21:$V95,22:1098,214:1102,215:$Vo5},o($V75,[2,192]),{100:$Va5,108:$Vb5,109:$Vc5,110:1109,181:1099,196:1103,197:1104,198:1105,201:1108,204:$Ve5,205:$Vf5,206:$Vg5,207:$Vh5,208:$Vi5,209:$Vj5,210:$Vk5,211:$Vl5,212:$Vm5,213:$Vn5},o($V75,[2,194]),{185:$Vd5},o($V75,$Vb6,{180:1526,178:$Vc6}),o($V75,$Vb6,{180:1528,178:$Vc6}),o($V75,$Vb6,{180:1529,178:$Vc6}),o($Vd6,$Vn),o($Vd6,$Vo),o($Vd6,$VY3),o($Vd6,$VZ3),o($Vd6,$V_3),o($Vd6,$Vp),o($Vd6,$Vq),o($Vd6,$V$3),o($Vd6,$V04,{202:1530,203:1531,111:[1,1532]}),o($Vd6,$V14),o($Vd6,$V24),o($Vd6,$V34),o($Vd6,$V44),o($Vd6,$V54),o($Vd6,$V64),o($Vd6,$V74),o($Vd6,$V84),o($Vd6,$V94),o($Ve6,$V73),o($Ve6,$V83),o($Ve6,$V93),o($Ve6,$Va3),o($VL1,[2,201],{170:1533,179:$V45}),o($VL1,[2,210],{172:1534,179:$V55}),o($VL1,[2,218],{174:1535,179:$V65}),o($VX3,$Vf6),o($VX3,$VK1),o($Vf4,$Vg6),o($Vf4,$Vh6),o($Vf4,$Vi6),o($Vo4,$Vj6),o($Vo4,$Vk6),o($Vo4,$Vl6),o($Vr,$Vs,{46:1536,47:1537,55:1538,59:1539,40:1540,43:$Vt}),o($V13,$Vy4),o($V13,$Vz4),o($V13,$Vn),o($V13,$Vo),o($V13,$Vp),o($V13,$Vq),{70:[1,1541]},{70:$Vb4},{70:$Vc4,133:1542,134:1543,135:$Vm6},{70:$Ve4},o($Vn6,$Vg4),o($Vn6,$Vh4),o($Vn6,$Vi4,{139:1545,142:1546,143:1549,140:$Vo6,141:$Vp6}),o($Vl4,$Vm4,{155:694,145:1550,150:1551,151:1552,154:1553,69:[1,1554],160:$Vn4}),o($Vq6,$Vp4),{19:[1,1558],21:[1,1562],22:1556,149:1555,200:1557,214:1559,215:[1,1561],216:[1,1560]},o($Vq4,[2,270]),o($Vr,$Vs,{220:1563,223:1564,40:1565,43:$Vt}),o($Vr4,$Vr6),o($Vr,$Vs,{223:1566,40:1567,43:$Vt}),o($Vr4,$Vs6),o($Vr4,$VS5),o($Vr4,$VT5),{119:[1,1568],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($Vr4,$VE1),o($Vr4,$VF1),{19:[1,1572],21:[1,1576],22:1570,33:1569,200:1571,214:1573,215:[1,1575],216:[1,1574]},o($Vr4,$Vt6),o($Vr4,$Vu6),o($Vv6,$Vy1,{93:1577}),o($Vr4,$Vz1,{99:1170,95:1578,101:$VN5,102:$VR,103:$VS,104:$VT}),o($Vv6,$VG1),o($Vv6,$VH1),o($Vv6,$VI1),o($Vv6,$VJ1),{100:[1,1579]},o($Vv6,$VT1),{70:[1,1580]},o($V02,$Vs2,{99:739,95:1581,101:$Vw4,102:$VR,103:$VS,104:$VT}),o($VP5,$Vt2),o($Vr4,$Vu2,{90:1582,95:1583,91:1584,99:1585,105:1587,107:1588,101:$Vw6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vr4,$Vw2,{90:1582,95:1583,91:1584,99:1585,105:1587,107:1588,101:$Vw6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vr4,$Vx2,{90:1582,95:1583,91:1584,99:1585,105:1587,107:1588,101:$Vw6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VU5,$Vy2),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,1589],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:1590,121:$VW2,148:$VX2,189:$VY2}),o($VR5,$VA2),o($VR5,$Vw),o($VR5,$Vx),o($VR5,$Vn),o($VR5,$Vo),o($VR5,$Vy),o($VR5,$Vp),o($VR5,$Vq),o($VP5,$V23),o($VU5,$V33),o($VU5,$V43),o($VU5,$V53),o($VU5,$V63),{111:[1,1591]},o($VU5,$Vb3),o($VA4,$VV4),{19:$Vi,21:$Vj,22:1592,214:45,215:$Vk},{19:$Vx6,21:$Vy6,22:1594,100:[1,1605],108:[1,1606],109:[1,1607],110:1604,181:1595,191:1593,196:1598,197:1599,198:1600,201:1603,204:[1,1608],205:[1,1609],206:[1,1614],207:[1,1615],208:[1,1616],209:[1,1617],210:[1,1610],211:[1,1611],212:[1,1612],213:[1,1613],214:1597,215:$Vz6},o($Vc3,$Vr5),o($VE,$Vc1,{52:1618,53:[1,1619]}),o($VG,$Ve1),o($VG,$Vf1,{65:1620,67:1621,72:1622,44:1623,78:1624,118:1628,79:[1,1625],80:[1,1626],81:[1,1627],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($VG,$Vj1),o($VG,$Vk1,{68:1629,64:1630,73:1631,92:1632,94:1633,95:1637,99:1638,96:[1,1634],97:[1,1635],98:[1,1636],101:$VA6,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:1640,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VG,$Vq1),o($Vr1,$Vs1,{82:1641}),o($Vt1,$Vs1,{82:1642}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:1643}),o($Vr1,$Vz1,{99:1229,95:1644,101:$VX5,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:1645}),o($VA1,$VB1,{86:1646}),o($VA1,$VB1,{86:1647}),o($Vt1,$VC1,{105:1233,107:1234,91:1648,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:1649}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,1653],21:[1,1657],22:1651,33:1650,200:1652,214:1654,215:[1,1656],216:[1,1655]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:1658}),o($VN1,$VO1),{119:[1,1659],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},{100:[1,1660]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,1662],106:1661,108:[1,1663],109:[1,1664],110:1665,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1666]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$Ve1),o($VG,$Vf1,{65:1667,67:1668,72:1669,44:1670,78:1671,118:1675,79:[1,1672],80:[1,1673],81:[1,1674],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($VG,$Vj1),o($VG,$Vk1,{68:1676,64:1677,73:1678,92:1679,94:1680,95:1684,99:1685,96:[1,1681],97:[1,1682],98:[1,1683],101:$VB6,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:1687,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VG,$Vq1),o($Vr1,$Vs1,{82:1688}),o($Vt1,$Vs1,{82:1689}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:1690}),o($Vr1,$Vz1,{99:1265,95:1691,101:$VY5,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:1692}),o($VA1,$VB1,{86:1693}),o($VA1,$VB1,{86:1694}),o($Vt1,$VC1,{105:1269,107:1270,91:1695,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:1696}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,1700],21:[1,1704],22:1698,33:1697,200:1699,214:1701,215:[1,1703],216:[1,1702]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:1705}),o($VN1,$VO1),{119:[1,1706],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},{100:[1,1707]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,1709],106:1708,108:[1,1710],109:[1,1711],110:1712,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1713]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$VU3),{121:[1,1714]},o($VG,$VI3),o($Vh2,$VQ3),o($Vo2,$VV4),{19:$Vi,21:$Vj,22:1715,214:45,215:$Vk},{19:$VC6,21:$VD6,22:1717,100:[1,1728],108:[1,1729],109:[1,1730],110:1727,181:1718,191:1716,196:1721,197:1722,198:1723,201:1726,204:[1,1731],205:[1,1732],206:[1,1737],207:[1,1738],208:[1,1739],209:[1,1740],210:[1,1733],211:[1,1734],212:[1,1735],213:[1,1736],214:1720,215:$VE6},o($Vq2,$VV4),{19:$Vi,21:$Vj,22:1741,214:45,215:$Vk},{19:$VF6,21:$VG6,22:1743,100:[1,1754],108:[1,1755],109:[1,1756],110:1753,181:1744,191:1742,196:1747,197:1748,198:1749,201:1752,204:[1,1757],205:[1,1758],206:[1,1763],207:[1,1764],208:[1,1765],209:[1,1766],210:[1,1759],211:[1,1760],212:[1,1761],213:[1,1762],214:1746,215:$VH6},o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),{111:[1,1767]},o($VA1,$Vb3),o($Vz2,$VV4),{19:$Vi,21:$Vj,22:1768,214:45,215:$Vk},{19:$VI6,21:$VJ6,22:1770,100:[1,1781],108:[1,1782],109:[1,1783],110:1780,181:1771,191:1769,196:1774,197:1775,198:1776,201:1779,204:[1,1784],205:[1,1785],206:[1,1790],207:[1,1791],208:[1,1792],209:[1,1793],210:[1,1786],211:[1,1787],212:[1,1788],213:[1,1789],214:1773,215:$VK6},o($VD1,$Vr5),o($VN1,$VV5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($VG,$VW5),o($VG,$Vv3),o($VI,$VJ,{62:1794,64:1795,66:1796,67:1797,73:1800,75:1801,72:1802,44:1803,92:1804,94:1805,87:1807,88:1808,89:1809,78:1810,95:1817,22:1818,91:1820,118:1821,99:1822,214:1825,105:1826,107:1827,19:[1,1824],21:[1,1829],69:[1,1798],71:[1,1799],79:[1,1811],80:[1,1812],81:[1,1813],85:[1,1806],96:[1,1814],97:[1,1815],98:[1,1816],101:$VL6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,1819],215:[1,1828]}),o($Vq2,$Vp2,{84:1323,192:1324,83:1830,190:$VZ5}),o($VG,$VA2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:1831,121:$VW2,148:$VX2,189:$VY2}),o($Vq2,$Vp2,{84:1323,192:1324,83:1832,190:$VZ5}),o($Vt1,$Vs2,{99:832,95:1833,101:$VL4,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vt2),o($Vh2,$V23),o($VG,$Vx3),o($VH3,$VI3),o($Vr1,$VJ3),o($VH3,$VK3,{31:1834,193:[1,1835]}),{19:$VL3,21:$VM3,22:640,129:1836,199:$VN3,214:643,215:$VO3},o($VG,$VP3),o($Vt1,$VJ3),o($VG,$VK3,{31:1837,193:[1,1838]}),{19:$VL3,21:$VM3,22:640,129:1839,199:$VN3,214:643,215:$VO3},o($Vx1,$VQ3),o($VA1,$VR3),o($VA1,$VS3),o($VA1,$VT3),{100:[1,1840]},o($VA1,$VT1),{100:[1,1842],106:1841,108:[1,1843],109:[1,1844],110:1845,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1846]},o($Vu1,$VU3),o($VD1,$VJ3),o($Vu1,$VK3,{31:1847,193:[1,1848]}),{19:$VL3,21:$VM3,22:640,129:1849,199:$VN3,214:643,215:$VO3},o($VA1,$VV3),{121:[1,1850]},{19:[1,1853],21:[1,1856],22:1852,87:1851,214:1854,215:[1,1855]},o($Vq2,$Vp2,{84:1361,192:1362,83:1857,190:$V$5}),o($VG,$VA2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:1858,121:$VW2,148:$VX2,189:$VY2}),o($Vq2,$Vp2,{84:1361,192:1362,83:1859,190:$V$5}),o($Vt1,$Vs2,{99:879,95:1860,101:$VM4,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vt2),o($Vh2,$V23),o($VG,$Vx3),o($VH3,$VI3),o($Vr1,$VJ3),o($VH3,$VK3,{31:1861,193:[1,1862]}),{19:$VL3,21:$VM3,22:640,129:1863,199:$VN3,214:643,215:$VO3},o($VG,$VP3),o($Vt1,$VJ3),o($VG,$VK3,{31:1864,193:[1,1865]}),{19:$VL3,21:$VM3,22:640,129:1866,199:$VN3,214:643,215:$VO3},o($Vx1,$VQ3),o($VA1,$VR3),o($VA1,$VS3),o($VA1,$VT3),{100:[1,1867]},o($VA1,$VT1),{100:[1,1869],106:1868,108:[1,1870],109:[1,1871],110:1872,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,1873]},o($Vu1,$VU3),o($VD1,$VJ3),o($Vu1,$VK3,{31:1874,193:[1,1875]}),{19:$VL3,21:$VM3,22:640,129:1876,199:$VN3,214:643,215:$VO3},o($VA1,$VV3),{121:[1,1877]},{19:[1,1880],21:[1,1883],22:1879,87:1878,214:1881,215:[1,1882]},o($Vy3,$VU3),{121:[1,1884]},o($Vy3,$VI3),o($VN4,$VQ3),o($VO4,$VV4),{19:$Vi,21:$Vj,22:1885,214:45,215:$Vk},{19:$VM6,21:$VN6,22:1887,100:[1,1898],108:[1,1899],109:[1,1900],110:1897,181:1888,191:1886,196:1891,197:1892,198:1893,201:1896,204:[1,1901],205:[1,1902],206:[1,1907],207:[1,1908],208:[1,1909],209:[1,1910],210:[1,1903],211:[1,1904],212:[1,1905],213:[1,1906],214:1890,215:$VO6},o($VP4,$VV4),{19:$Vi,21:$Vj,22:1911,214:45,215:$Vk},{19:$VP6,21:$VQ6,22:1913,100:[1,1924],108:[1,1925],109:[1,1926],110:1923,181:1914,191:1912,196:1917,197:1918,198:1919,201:1922,204:[1,1927],205:[1,1928],206:[1,1933],207:[1,1934],208:[1,1935],209:[1,1936],210:[1,1929],211:[1,1930],212:[1,1931],213:[1,1932],214:1916,215:$VR6},o($VR4,$VV4),{19:$Vi,21:$Vj,22:1937,214:45,215:$Vk},{19:$VS6,21:$VT6,22:1939,100:[1,1950],108:[1,1951],109:[1,1952],110:1949,181:1940,191:1938,196:1943,197:1944,198:1945,201:1948,204:[1,1953],205:[1,1954],206:[1,1959],207:[1,1960],208:[1,1961],209:[1,1962],210:[1,1955],211:[1,1956],212:[1,1957],213:[1,1958],214:1942,215:$VU6},o($VE3,$V23),o($VE3,$V33),o($VE3,$V43),o($VE3,$V53),o($VE3,$V63),{111:[1,1963]},o($VE3,$Vb3),o($VC3,$Vr5),o($VF3,$VV5),o($VF3,$VK1),o($VF3,$Vn),o($VF3,$Vo),o($VF3,$Vp),o($VF3,$Vq),o($Vy3,$Vc2),o($Vr,$Vs,{54:1964,40:1965,43:$Vt}),o($Vy3,$Vd2),o($Vy3,$Ve2),o($Vy3,$Vv1),o($Vy3,$Vw1),o($VB3,$Vs1,{82:1966}),o($Vy3,$VE1),o($Vy3,$VF1),{19:[1,1970],21:[1,1974],22:1968,33:1967,200:1969,214:1971,215:[1,1973],216:[1,1972]},{119:[1,1975],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($Vy3,$Vf2),o($Vy3,$Vg2),o($VB3,$Vs1,{82:1976}),o($VN4,$Vy1,{93:1977}),o($VB3,$Vz1,{99:1426,95:1978,101:$V36,102:$VR,103:$VS,104:$VT}),o($VN4,$VG1),o($VN4,$VH1),o($VN4,$VI1),o($VN4,$VJ1),{100:[1,1979]},o($VN4,$VT1),{70:[1,1980]},o($VO4,$Vp2,{83:1981,84:1982,192:1983,190:[1,1984]}),o($VP4,$Vp2,{83:1985,84:1986,192:1987,190:$VV6}),o($VA3,$Vs2,{99:969,95:1989,101:$VT4,102:$VR,103:$VS,104:$VT}),o($VD3,$Vt2),o($VB3,$Vu2,{90:1990,95:1991,91:1992,99:1993,105:1995,107:1996,101:$VW6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VB3,$Vw2,{90:1990,95:1991,91:1992,99:1993,105:1995,107:1996,101:$VW6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VB3,$Vx2,{90:1990,95:1991,91:1992,99:1993,105:1995,107:1996,101:$VW6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VF3,$Vy2),o($VR4,$Vp2,{83:1997,84:1998,192:1999,190:[1,2000]}),o($V26,$VA2),o($V26,$Vw),o($V26,$Vx),o($V26,$Vn),o($V26,$Vo),o($V26,$Vy),o($V26,$Vp),o($V26,$Vq),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,2001],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:2002,121:$VW2,148:$VX2,189:$VY2}),o($VD3,$V23),o($VF3,$V33),o($VF3,$V43),o($VF3,$V53),o($VF3,$V63),{111:[1,2003]},o($VF3,$Vb3),o($Vy3,$Vd2),o($Vy3,$Ve2),o($Vy3,$Vv1),o($Vy3,$Vw1),o($VB3,$Vs1,{82:2004}),o($Vy3,$VE1),o($Vy3,$VF1),{19:[1,2008],21:[1,2012],22:2006,33:2005,200:2007,214:2009,215:[1,2011],216:[1,2010]},{119:[1,2013],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($Vy3,$Vf2),o($Vy3,$Vg2),o($VB3,$Vs1,{82:2014}),o($VN4,$Vy1,{93:2015}),o($VB3,$Vz1,{99:1473,95:2016,101:$V46,102:$VR,103:$VS,104:$VT}),o($VN4,$VG1),o($VN4,$VH1),o($VN4,$VI1),o($VN4,$VJ1),{100:[1,2017]},o($VN4,$VT1),{70:[1,2018]},o($VO4,$Vp2,{83:2019,84:2020,192:2021,190:[1,2022]}),o($VP4,$Vp2,{83:2023,84:2024,192:2025,190:$VX6}),o($VA3,$Vs2,{99:1005,95:2027,101:$VU4,102:$VR,103:$VS,104:$VT}),o($VD3,$Vt2),o($VB3,$Vu2,{90:2028,95:2029,91:2030,99:2031,105:2033,107:2034,101:$VY6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VB3,$Vw2,{90:2028,95:2029,91:2030,99:2031,105:2033,107:2034,101:$VY6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VB3,$Vx2,{90:2028,95:2029,91:2030,99:2031,105:2033,107:2034,101:$VY6,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VF3,$Vy2),o($VR4,$Vp2,{83:2035,84:2036,192:2037,190:[1,2038]}),o($V26,$VA2),o($V26,$Vw),o($V26,$Vx),o($V26,$Vn),o($V26,$Vo),o($V26,$Vy),o($V26,$Vp),o($V26,$Vq),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,2039],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:2040,121:$VW2,148:$VX2,189:$VY2}),o($VD3,$V23),o($VF3,$V33),o($VF3,$V43),o($VF3,$V53),o($VF3,$V63),{111:[1,2041]},o($VF3,$Vb3),o($Vo2,$V71),o($Vo2,$V81),o($Vo2,$V91),o($Vr1,$Vp5),o($Vr1,$Vq5),{19:$VW4,21:$VX4,22:2043,87:2042,214:1018,215:$VY4},o($Vq2,$V71),o($Vq2,$V81),o($Vq2,$V91),o($Vt1,$Vp5),o($Vt1,$Vq5),{19:$V_4,21:$V$4,22:2045,87:2044,214:1044,215:$V05},o($VA1,$VV5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($Vz2,$V71),o($Vz2,$V81),o($Vz2,$V91),o($VD1,$Vp5),o($VD1,$Vq5),{19:$V15,21:$V25,22:2047,87:2046,214:1071,215:$V35},o($V75,[2,204]),o($V75,[2,206]),o($V75,[2,213]),o($V75,[2,221]),o($Vd6,$Vp5),o($Vd6,$Vq5),{19:$V85,21:$V95,22:2049,87:2048,214:1102,215:$Vo5},o($V75,[2,200]),o($V75,[2,209]),o($V75,[2,217]),o($VZ6,$V_6,{152:2050,153:2051,156:$V$6,157:$V07,158:$V17,159:$V27}),o($V37,$V47),o($V57,$V67,{56:2056}),o($V77,$V87,{60:2057}),o($VI,$VJ,{63:2058,73:2059,75:2060,76:2061,92:2064,94:2065,87:2067,88:2068,89:2069,78:2070,44:2071,95:2075,22:2076,91:2078,118:2079,99:2083,214:2086,105:2087,107:2088,19:[1,2085],21:[1,2090],69:[1,2062],71:[1,2063],79:[1,2080],80:[1,2081],81:[1,2082],85:[1,2066],96:[1,2072],97:[1,2073],98:[1,2074],101:$V97,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,2077],215:[1,2089]}),o($VZ6,$V_6,{153:2051,152:2091,156:$V$6,157:$V07,158:$V17,159:$V27}),{70:$Vs5,134:2092,135:$Vm6},o($Vn6,$Vt5),o($VU2,$VV2,{147:406,136:1145,137:1146,138:1147,144:1148,146:1149,131:2093,148:$VX2,189:$VF5}),o($Vn6,$Vu5),o($Vn6,$Vi4,{139:2094,143:2095,140:$Vo6,141:$Vp6}),o($VU2,$VV2,{147:406,144:1148,146:1149,138:2096,70:$Vv5,135:$Vv5,148:$VX2,189:$VF5}),o($VU2,$VV2,{147:406,144:1148,146:1149,138:2097,70:$Vw5,135:$Vw5,148:$VX2,189:$VF5}),o($Vq6,$Vx5),o($Vq6,$Vy5),o($Vq6,$Vz5),o($Vq6,$VA5),{19:$VB5,21:$VC5,22:1135,129:2098,199:$VD5,214:1138,215:$VE5},o($VU2,$VV2,{147:406,130:1142,131:1143,132:1144,136:1145,137:1146,138:1147,144:1148,146:1149,126:2099,148:$VX2,189:$VF5}),o($Vq6,$VG5),o($Vq6,$VH5),o($Vq6,$VI5),o($Vq6,$Vn),o($Vq6,$Vo),o($Vq6,$Vy),o($Vq6,$Vp),o($Vq6,$Vq),o($Vq4,[2,268]),o($Vr4,$Vs4,{224:2100}),o($VI,$VJ,{92:720,94:721,95:731,99:739,226:2101,73:2102,75:2103,76:2104,87:2108,88:2109,89:2110,78:2111,44:2112,22:2113,91:2115,118:2116,214:2121,105:2122,107:2123,19:[1,2120],21:[1,2125],69:[1,2105],71:[1,2106],79:[1,2117],80:[1,2118],81:[1,2119],85:[1,2107],96:$Vt4,97:$Vu4,98:$Vv4,101:$Vw4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,2114],215:[1,2124]}),o($Vr4,$Va7),o($VI,$VJ,{92:720,94:721,95:731,99:739,226:2126,73:2127,75:2128,76:2129,87:2133,88:2134,89:2135,78:2136,44:2137,22:2138,91:2140,118:2141,214:2146,105:2147,107:2148,19:[1,2145],21:[1,2150],69:[1,2130],71:[1,2131],79:[1,2142],80:[1,2143],81:[1,2144],85:[1,2132],96:$Vt4,97:$Vu4,98:$Vv4,101:$Vw4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,2139],215:[1,2149]}),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:2151,121:$VW2,148:$VX2,189:$VY2}),o($Vr4,$VA2),o($Vr4,$Vw),o($Vr4,$Vx),o($Vr4,$Vn),o($Vr4,$Vo),o($Vr4,$Vy),o($Vr4,$Vp),o($Vr4,$Vq),o($Vr4,$Vs2,{99:1170,95:2152,101:$VN5,102:$VR,103:$VS,104:$VT}),o($Vv6,$Vt2),o($Vv6,$V23),o($Vr4,$Vb7),o($VP5,$VQ3),o($VQ5,$VR3),o($VQ5,$VS3),o($VQ5,$VT3),{100:[1,2153]},o($VQ5,$VT1),{100:[1,2155],106:2154,108:[1,2156],109:[1,2157],110:2158,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2159]},o($VQ5,$VV3),{121:[1,2160]},{19:[1,2163],21:[1,2166],22:2162,87:2161,214:2164,215:[1,2165]},{193:[1,2169],194:2167,195:[1,2168]},o($Vc3,$V56),o($Vc3,$V66),o($Vc3,$V76),o($Vc3,$Vn),o($Vc3,$Vo),o($Vc3,$VY3),o($Vc3,$VZ3),o($Vc3,$V_3),o($Vc3,$Vp),o($Vc3,$Vq),o($Vc3,$V$3),o($Vc3,$V04,{202:2170,203:2171,111:[1,2172]}),o($Vc3,$V14),o($Vc3,$V24),o($Vc3,$V34),o($Vc3,$V44),o($Vc3,$V54),o($Vc3,$V64),o($Vc3,$V74),o($Vc3,$V84),o($Vc3,$V94),o($Vc7,$V73),o($Vc7,$V83),o($Vc7,$V93),o($Vc7,$Va3),o($VG,$Vc2),o($Vr,$Vs,{54:2173,40:2174,43:$Vt}),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:2175}),o($VG,$VE1),o($VG,$VF1),{19:[1,2179],21:[1,2183],22:2177,33:2176,200:2178,214:2180,215:[1,2182],216:[1,2181]},{119:[1,2184],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:2185}),o($Vh2,$Vy1,{93:2186}),o($Vt1,$Vz1,{99:1638,95:2187,101:$VA6,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,2188]},o($Vh2,$VT1),{70:[1,2189]},o($Vo2,$Vp2,{83:2190,84:2191,192:2192,190:[1,2193]}),o($Vq2,$Vp2,{83:2194,84:2195,192:2196,190:$Vd7}),o($Vr1,$Vs2,{99:1229,95:2198,101:$VX5,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vt2),o($Vt1,$Vu2,{90:2199,95:2200,91:2201,99:2202,105:2204,107:2205,101:$Ve7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vw2,{90:2199,95:2200,91:2201,99:2202,105:2204,107:2205,101:$Ve7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:2199,95:2200,91:2201,99:2202,105:2204,107:2205,101:$Ve7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vy2),o($Vz2,$Vp2,{83:2206,84:2207,192:2208,190:[1,2209]}),o($Vu1,$VA2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,2210],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:2211,121:$VW2,148:$VX2,189:$VY2}),o($Vx1,$V23),o($VN1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),{111:[1,2212]},o($VN1,$Vb3),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:2213}),o($VG,$VE1),o($VG,$VF1),{19:[1,2217],21:[1,2221],22:2215,33:2214,200:2216,214:2218,215:[1,2220],216:[1,2219]},{119:[1,2222],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:2223}),o($Vh2,$Vy1,{93:2224}),o($Vt1,$Vz1,{99:1685,95:2225,101:$VB6,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,2226]},o($Vh2,$VT1),{70:[1,2227]},o($Vo2,$Vp2,{83:2228,84:2229,192:2230,190:[1,2231]}),o($Vq2,$Vp2,{83:2232,84:2233,192:2234,190:$Vf7}),o($Vr1,$Vs2,{99:1265,95:2236,101:$VY5,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vt2),o($Vt1,$Vu2,{90:2237,95:2238,91:2239,99:2240,105:2242,107:2243,101:$Vg7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vw2,{90:2237,95:2238,91:2239,99:2240,105:2242,107:2243,101:$Vg7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:2237,95:2238,91:2239,99:2240,105:2242,107:2243,101:$Vg7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vy2),o($Vz2,$Vp2,{83:2244,84:2245,192:2246,190:[1,2247]}),o($Vu1,$VA2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,2248],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:2249,121:$VW2,148:$VX2,189:$VY2}),o($Vx1,$V23),o($VN1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),{111:[1,2250]},o($VN1,$Vb3),o($Vt1,$Vr5),{193:[1,2253],194:2251,195:[1,2252]},o($Vr1,$V56),o($Vr1,$V66),o($Vr1,$V76),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VY3),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V$3),o($Vr1,$V04,{202:2254,203:2255,111:[1,2256]}),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($V86,$V73),o($V86,$V83),o($V86,$V93),o($V86,$Va3),{193:[1,2259],194:2257,195:[1,2258]},o($Vt1,$V56),o($Vt1,$V66),o($Vt1,$V76),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VY3),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V$3),o($Vt1,$V04,{202:2260,203:2261,111:[1,2262]}),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($V96,$V73),o($V96,$V83),o($V96,$V93),o($V96,$Va3),{19:[1,2265],21:[1,2268],22:2264,87:2263,214:2266,215:[1,2267]},{193:[1,2271],194:2269,195:[1,2270]},o($VD1,$V56),o($VD1,$V66),o($VD1,$V76),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VY3),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V$3),o($VD1,$V04,{202:2272,203:2273,111:[1,2274]}),o($VD1,$V14),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($Va6,$V73),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($VG,$Ve1),o($VG,$Vf1,{65:2275,67:2276,72:2277,44:2278,78:2279,118:2283,79:[1,2280],80:[1,2281],81:[1,2282],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($VG,$Vj1),o($VG,$Vk1,{68:2284,64:2285,73:2286,92:2287,94:2288,95:2292,99:2293,96:[1,2289],97:[1,2290],98:[1,2291],101:$Vh7,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:2295,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VG,$Vq1),o($Vr1,$Vs1,{82:2296}),o($Vt1,$Vs1,{82:2297}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:2298}),o($Vr1,$Vz1,{99:1822,95:2299,101:$VL6,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:2300}),o($VA1,$VB1,{86:2301}),o($VA1,$VB1,{86:2302}),o($Vt1,$VC1,{105:1826,107:1827,91:2303,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:2304}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,2308],21:[1,2312],22:2306,33:2305,200:2307,214:2309,215:[1,2311],216:[1,2310]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:2313}),o($VN1,$VO1),{119:[1,2314],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},{100:[1,2315]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,2317],106:2316,108:[1,2318],109:[1,2319],110:2320,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2321]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$VU3),{121:[1,2322]},o($VG,$VI3),o($Vh2,$VQ3),o($Vo2,$VV4),{19:$Vi,21:$Vj,22:2323,214:45,215:$Vk},{19:$Vi7,21:$Vj7,22:2325,100:[1,2336],108:[1,2337],109:[1,2338],110:2335,181:2326,191:2324,196:2329,197:2330,198:2331,201:2334,204:[1,2339],205:[1,2340],206:[1,2345],207:[1,2346],208:[1,2347],209:[1,2348],210:[1,2341],211:[1,2342],212:[1,2343],213:[1,2344],214:2328,215:$Vk7},o($Vq2,$VV4),{19:$Vi,21:$Vj,22:2349,214:45,215:$Vk},{19:$Vl7,21:$Vm7,22:2351,100:[1,2362],108:[1,2363],109:[1,2364],110:2361,181:2352,191:2350,196:2355,197:2356,198:2357,201:2360,204:[1,2365],205:[1,2366],206:[1,2371],207:[1,2372],208:[1,2373],209:[1,2374],210:[1,2367],211:[1,2368],212:[1,2369],213:[1,2370],214:2354,215:$Vn7},o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),{111:[1,2375]},o($VA1,$Vb3),o($Vz2,$VV4),{19:$Vi,21:$Vj,22:2376,214:45,215:$Vk},{19:$Vo7,21:$Vp7,22:2378,100:[1,2389],108:[1,2390],109:[1,2391],110:2388,181:2379,191:2377,196:2382,197:2383,198:2384,201:2387,204:[1,2392],205:[1,2393],206:[1,2398],207:[1,2399],208:[1,2400],209:[1,2401],210:[1,2394],211:[1,2395],212:[1,2396],213:[1,2397],214:2381,215:$Vq7},o($VD1,$Vr5),o($VN1,$VV5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($VG,$VU3),{121:[1,2402]},o($VG,$VI3),o($Vh2,$VQ3),o($Vo2,$VV4),{19:$Vi,21:$Vj,22:2403,214:45,215:$Vk},{19:$Vr7,21:$Vs7,22:2405,100:[1,2416],108:[1,2417],109:[1,2418],110:2415,181:2406,191:2404,196:2409,197:2410,198:2411,201:2414,204:[1,2419],205:[1,2420],206:[1,2425],207:[1,2426],208:[1,2427],209:[1,2428],210:[1,2421],211:[1,2422],212:[1,2423],213:[1,2424],214:2408,215:$Vt7},o($Vq2,$VV4),{19:$Vi,21:$Vj,22:2429,214:45,215:$Vk},{19:$Vu7,21:$Vv7,22:2431,100:[1,2442],108:[1,2443],109:[1,2444],110:2441,181:2432,191:2430,196:2435,197:2436,198:2437,201:2440,204:[1,2445],205:[1,2446],206:[1,2451],207:[1,2452],208:[1,2453],209:[1,2454],210:[1,2447],211:[1,2448],212:[1,2449],213:[1,2450],214:2434,215:$Vw7},o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),{111:[1,2455]},o($VA1,$Vb3),o($Vz2,$VV4),{19:$Vi,21:$Vj,22:2456,214:45,215:$Vk},{19:$Vx7,21:$Vy7,22:2458,100:[1,2469],108:[1,2470],109:[1,2471],110:2468,181:2459,191:2457,196:2462,197:2463,198:2464,201:2467,204:[1,2472],205:[1,2473],206:[1,2478],207:[1,2479],208:[1,2480],209:[1,2481],210:[1,2474],211:[1,2475],212:[1,2476],213:[1,2477],214:2461,215:$Vz7},o($VD1,$Vr5),o($VN1,$VV5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($VB3,$Vr5),{193:[1,2484],194:2482,195:[1,2483]},o($VA3,$V56),o($VA3,$V66),o($VA3,$V76),o($VA3,$Vn),o($VA3,$Vo),o($VA3,$VY3),o($VA3,$VZ3),o($VA3,$V_3),o($VA3,$Vp),o($VA3,$Vq),o($VA3,$V$3),o($VA3,$V04,{202:2485,203:2486,111:[1,2487]}),o($VA3,$V14),o($VA3,$V24),o($VA3,$V34),o($VA3,$V44),o($VA3,$V54),o($VA3,$V64),o($VA3,$V74),o($VA3,$V84),o($VA3,$V94),o($VA7,$V73),o($VA7,$V83),o($VA7,$V93),o($VA7,$Va3),{193:[1,2490],194:2488,195:[1,2489]},o($VB3,$V56),o($VB3,$V66),o($VB3,$V76),o($VB3,$Vn),o($VB3,$Vo),o($VB3,$VY3),o($VB3,$VZ3),o($VB3,$V_3),o($VB3,$Vp),o($VB3,$Vq),o($VB3,$V$3),o($VB3,$V04,{202:2491,203:2492,111:[1,2493]}),o($VB3,$V14),o($VB3,$V24),o($VB3,$V34),o($VB3,$V44),o($VB3,$V54),o($VB3,$V64),o($VB3,$V74),o($VB3,$V84),o($VB3,$V94),o($VB7,$V73),o($VB7,$V83),o($VB7,$V93),o($VB7,$Va3),{193:[1,2496],194:2494,195:[1,2495]},o($VC3,$V56),o($VC3,$V66),o($VC3,$V76),o($VC3,$Vn),o($VC3,$Vo),o($VC3,$VY3),o($VC3,$VZ3),o($VC3,$V_3),o($VC3,$Vp),o($VC3,$Vq),o($VC3,$V$3),o($VC3,$V04,{202:2497,203:2498,111:[1,2499]}),o($VC3,$V14),o($VC3,$V24),o($VC3,$V34),o($VC3,$V44),o($VC3,$V54),o($VC3,$V64),o($VC3,$V74),o($VC3,$V84),o($VC3,$V94),o($VC7,$V73),o($VC7,$V83),o($VC7,$V93),o($VC7,$Va3),{19:[1,2502],21:[1,2505],22:2501,87:2500,214:2503,215:[1,2504]},o($Vy3,$Vv3),o($VI,$VJ,{62:2506,64:2507,66:2508,67:2509,73:2512,75:2513,72:2514,44:2515,92:2516,94:2517,87:2519,88:2520,89:2521,78:2522,95:2529,22:2530,91:2532,118:2533,99:2534,214:2537,105:2538,107:2539,19:[1,2536],21:[1,2541],69:[1,2510],71:[1,2511],79:[1,2523],80:[1,2524],81:[1,2525],85:[1,2518],96:[1,2526],97:[1,2527],98:[1,2528],101:$VD7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,2531],215:[1,2540]}),o($VP4,$Vp2,{84:1986,192:1987,83:2542,190:$VV6}),o($Vy3,$VA2),o($Vy3,$Vw),o($Vy3,$Vx),o($Vy3,$Vn),o($Vy3,$Vo),o($Vy3,$Vy),o($Vy3,$Vp),o($Vy3,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:2543,121:$VW2,148:$VX2,189:$VY2}),o($VP4,$Vp2,{84:1986,192:1987,83:2544,190:$VV6}),o($VB3,$Vs2,{99:1426,95:2545,101:$V36,102:$VR,103:$VS,104:$VT}),o($VN4,$Vt2),o($VN4,$V23),o($Vy3,$Vx3),o($V16,$VI3),o($VA3,$VJ3),o($V16,$VK3,{31:2546,193:[1,2547]}),{19:$VL3,21:$VM3,22:640,129:2548,199:$VN3,214:643,215:$VO3},o($Vy3,$VP3),o($VB3,$VJ3),o($Vy3,$VK3,{31:2549,193:[1,2550]}),{19:$VL3,21:$VM3,22:640,129:2551,199:$VN3,214:643,215:$VO3},o($VD3,$VQ3),o($VE3,$VR3),o($VE3,$VS3),o($VE3,$VT3),{100:[1,2552]},o($VE3,$VT1),{100:[1,2554],106:2553,108:[1,2555],109:[1,2556],110:2557,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2558]},o($V26,$VU3),o($VC3,$VJ3),o($V26,$VK3,{31:2559,193:[1,2560]}),{19:$VL3,21:$VM3,22:640,129:2561,199:$VN3,214:643,215:$VO3},o($VE3,$VV3),{121:[1,2562]},{19:[1,2565],21:[1,2568],22:2564,87:2563,214:2566,215:[1,2567]},o($VP4,$Vp2,{84:2024,192:2025,83:2569,190:$VX6}),o($Vy3,$VA2),o($Vy3,$Vw),o($Vy3,$Vx),o($Vy3,$Vn),o($Vy3,$Vo),o($Vy3,$Vy),o($Vy3,$Vp),o($Vy3,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:2570,121:$VW2,148:$VX2,189:$VY2}),o($VP4,$Vp2,{84:2024,192:2025,83:2571,190:$VX6}),o($VB3,$Vs2,{99:1473,95:2572,101:$V46,102:$VR,103:$VS,104:$VT}),o($VN4,$Vt2),o($VN4,$V23),o($Vy3,$Vx3),o($V16,$VI3),o($VA3,$VJ3),o($V16,$VK3,{31:2573,193:[1,2574]}),{19:$VL3,21:$VM3,22:640,129:2575,199:$VN3,214:643,215:$VO3},o($Vy3,$VP3),o($VB3,$VJ3),o($Vy3,$VK3,{31:2576,193:[1,2577]}),{19:$VL3,21:$VM3,22:640,129:2578,199:$VN3,214:643,215:$VO3},o($VD3,$VQ3),o($VE3,$VR3),o($VE3,$VS3),o($VE3,$VT3),{100:[1,2579]},o($VE3,$VT1),{100:[1,2581],106:2580,108:[1,2582],109:[1,2583],110:2584,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2585]},o($V26,$VU3),o($VC3,$VJ3),o($V26,$VK3,{31:2586,193:[1,2587]}),{19:$VL3,21:$VM3,22:640,129:2588,199:$VN3,214:643,215:$VO3},o($VE3,$VV3),{121:[1,2589]},{19:[1,2592],21:[1,2595],22:2591,87:2590,214:2593,215:[1,2594]},o($Vr1,$Vf6),o($Vr1,$VK1),o($Vt1,$Vf6),o($Vt1,$VK1),o($VD1,$Vf6),o($VD1,$VK1),o($Vd6,$Vf6),o($Vd6,$VK1),o($VZ6,$Vs1,{82:2596}),o($VZ6,$VE7),o($VZ6,$VF7),o($VZ6,$VG7),o($VZ6,$VH7),o($VZ6,$VI7),o($V37,$VJ7,{57:2597,51:[1,2598]}),o($V57,$VK7,{61:2599,53:[1,2600]}),o($V77,$VL7),o($V77,$VM7,{74:2601,76:2602,78:2603,44:2604,118:2605,79:[1,2606],80:[1,2607],81:[1,2608],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($V77,$VN7),o($V77,$VM5,{77:2609,73:2610,92:2611,94:2612,95:2616,99:2617,96:[1,2613],97:[1,2614],98:[1,2615],101:$VO7,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:2619,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($V77,$VP7),o($VQ7,$Vy1,{93:2620}),o($VR7,$Vz1,{99:2083,95:2621,101:$V97,102:$VR,103:$VS,104:$VT}),o($VS7,$VB1,{86:2622}),o($VS7,$VB1,{86:2623}),o($VS7,$VB1,{86:2624}),o($V77,$VC1,{105:2087,107:2088,91:2625,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VT7,$VS5),o($VT7,$VT5),o($VQ7,$VG1),o($VQ7,$VH1),o($VQ7,$VI1),o($VQ7,$VJ1),o($VS7,$VK1),o($VL1,$VM1,{162:2626}),o($VU7,$VO1),{119:[1,2627],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($VT7,$VE1),o($VT7,$VF1),{19:[1,2631],21:[1,2635],22:2629,33:2628,200:2630,214:2632,215:[1,2634],216:[1,2633]},{100:[1,2636]},o($VQ7,$VT1),o($VS7,$Vn),o($VS7,$Vo),{100:[1,2638],106:2637,108:[1,2639],109:[1,2640],110:2641,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2642]},o($VS7,$Vp),o($VS7,$Vq),o($VZ6,$Vs1,{82:2643}),o($Vn6,$Vg6),o($Vn6,$Vh6),o($Vn6,$Vi6),o($Vq6,$Vj6),o($Vq6,$Vk6),o($Vq6,$Vl6),o($Vr,$Vs,{46:2644,47:2645,55:2646,59:2647,40:2648,43:$Vt}),{70:[1,2649]},o($Vq4,$VJ5,{225:2650,53:[1,2651]}),o($Vr4,$VK5),o($VI,$VJ,{76:2652,78:2653,44:2654,118:2655,79:[1,2656],80:[1,2657],81:[1,2658]}),o($Vr4,$VL5),o($Vr4,$VM5,{77:2659,73:2660,92:2661,94:2662,95:2666,99:2667,96:[1,2663],97:[1,2664],98:[1,2665],101:$VV7,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:2669,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($Vr4,$VO5),o($VQ5,$VB1,{86:2670}),o($VQ5,$VB1,{86:2671}),o($VQ5,$VB1,{86:2672}),o($Vr4,$VC1,{105:2122,107:2123,91:2673,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VR5,$VS5),o($VR5,$VT5),o($VQ5,$VK1),o($VL1,$VM1,{162:2674}),o($VU5,$VO1),{119:[1,2675],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($VR5,$VE1),o($VR5,$VF1),{19:[1,2679],21:[1,2683],22:2677,33:2676,200:2678,214:2680,215:[1,2682],216:[1,2681]},o($VQ5,$Vn),o($VQ5,$Vo),{100:[1,2685],106:2684,108:[1,2686],109:[1,2687],110:2688,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2689]},o($VQ5,$Vp),o($VQ5,$Vq),o($Vr4,$VK5),o($VI,$VJ,{76:2690,78:2691,44:2692,118:2693,79:[1,2694],80:[1,2695],81:[1,2696]}),o($Vr4,$VL5),o($Vr4,$VM5,{77:2697,73:2698,92:2699,94:2700,95:2704,99:2705,96:[1,2701],97:[1,2702],98:[1,2703],101:$VW7,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:2707,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($Vr4,$VO5),o($VQ5,$VB1,{86:2708}),o($VQ5,$VB1,{86:2709}),o($VQ5,$VB1,{86:2710}),o($Vr4,$VC1,{105:2147,107:2148,91:2711,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VR5,$VS5),o($VR5,$VT5),o($VQ5,$VK1),o($VL1,$VM1,{162:2712}),o($VU5,$VO1),{119:[1,2713],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($VR5,$VE1),o($VR5,$VF1),{19:[1,2717],21:[1,2721],22:2715,33:2714,200:2716,214:2718,215:[1,2720],216:[1,2719]},o($VQ5,$Vn),o($VQ5,$Vo),{100:[1,2723],106:2722,108:[1,2724],109:[1,2725],110:2726,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2727]},o($VQ5,$Vp),o($VQ5,$Vq),{121:[1,2728]},o($Vv6,$VQ3),o($VQ5,$V23),o($VQ5,$V33),o($VQ5,$V43),o($VQ5,$V53),o($VQ5,$V63),{111:[1,2729]},o($VQ5,$Vb3),o($VR5,$Vr5),o($VU5,$VV5),o($VU5,$VK1),o($VU5,$Vn),o($VU5,$Vo),o($VU5,$Vp),o($VU5,$Vq),o($VA4,$V71),o($VA4,$V81),o($VA4,$V91),o($Vc3,$Vp5),o($Vc3,$Vq5),{19:$Vx6,21:$Vy6,22:2731,87:2730,214:1597,215:$Vz6},o($VG,$Vv3),o($VI,$VJ,{62:2732,64:2733,66:2734,67:2735,73:2738,75:2739,72:2740,44:2741,92:2742,94:2743,87:2745,88:2746,89:2747,78:2748,95:2755,22:2756,91:2758,118:2759,99:2760,214:2763,105:2764,107:2765,19:[1,2762],21:[1,2767],69:[1,2736],71:[1,2737],79:[1,2749],80:[1,2750],81:[1,2751],85:[1,2744],96:[1,2752],97:[1,2753],98:[1,2754],101:$VX7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,2757],215:[1,2766]}),o($Vq2,$Vp2,{84:2195,192:2196,83:2768,190:$Vd7}),o($VG,$VA2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:2769,121:$VW2,148:$VX2,189:$VY2}),o($Vq2,$Vp2,{84:2195,192:2196,83:2770,190:$Vd7}),o($Vt1,$Vs2,{99:1638,95:2771,101:$VA6,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vt2),o($Vh2,$V23),o($VG,$Vx3),o($VH3,$VI3),o($Vr1,$VJ3),o($VH3,$VK3,{31:2772,193:[1,2773]}),{19:$VL3,21:$VM3,22:640,129:2774,199:$VN3,214:643,215:$VO3},o($VG,$VP3),o($Vt1,$VJ3),o($VG,$VK3,{31:2775,193:[1,2776]}),{19:$VL3,21:$VM3,22:640,129:2777,199:$VN3,214:643,215:$VO3},o($Vx1,$VQ3),o($VA1,$VR3),o($VA1,$VS3),o($VA1,$VT3),{100:[1,2778]},o($VA1,$VT1),{100:[1,2780],106:2779,108:[1,2781],109:[1,2782],110:2783,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2784]},o($Vu1,$VU3),o($VD1,$VJ3),o($Vu1,$VK3,{31:2785,193:[1,2786]}),{19:$VL3,21:$VM3,22:640,129:2787,199:$VN3,214:643,215:$VO3},o($VA1,$VV3),{121:[1,2788]},{19:[1,2791],21:[1,2794],22:2790,87:2789,214:2792,215:[1,2793]},o($Vq2,$Vp2,{84:2233,192:2234,83:2795,190:$Vf7}),o($VG,$VA2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:2796,121:$VW2,148:$VX2,189:$VY2}),o($Vq2,$Vp2,{84:2233,192:2234,83:2797,190:$Vf7}),o($Vt1,$Vs2,{99:1685,95:2798,101:$VB6,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vt2),o($Vh2,$V23),o($VG,$Vx3),o($VH3,$VI3),o($Vr1,$VJ3),o($VH3,$VK3,{31:2799,193:[1,2800]}),{19:$VL3,21:$VM3,22:640,129:2801,199:$VN3,214:643,215:$VO3},o($VG,$VP3),o($Vt1,$VJ3),o($VG,$VK3,{31:2802,193:[1,2803]}),{19:$VL3,21:$VM3,22:640,129:2804,199:$VN3,214:643,215:$VO3},o($Vx1,$VQ3),o($VA1,$VR3),o($VA1,$VS3),o($VA1,$VT3),{100:[1,2805]},o($VA1,$VT1),{100:[1,2807],106:2806,108:[1,2808],109:[1,2809],110:2810,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2811]},o($Vu1,$VU3),o($VD1,$VJ3),o($Vu1,$VK3,{31:2812,193:[1,2813]}),{19:$VL3,21:$VM3,22:640,129:2814,199:$VN3,214:643,215:$VO3},o($VA1,$VV3),{121:[1,2815]},{19:[1,2818],21:[1,2821],22:2817,87:2816,214:2819,215:[1,2820]},o($Vo2,$V71),o($Vo2,$V81),o($Vo2,$V91),o($Vr1,$Vp5),o($Vr1,$Vq5),{19:$VC6,21:$VD6,22:2823,87:2822,214:1720,215:$VE6},o($Vq2,$V71),o($Vq2,$V81),o($Vq2,$V91),o($Vt1,$Vp5),o($Vt1,$Vq5),{19:$VF6,21:$VG6,22:2825,87:2824,214:1746,215:$VH6},o($VA1,$VV5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($Vz2,$V71),o($Vz2,$V81),o($Vz2,$V91),o($VD1,$Vp5),o($VD1,$Vq5),{19:$VI6,21:$VJ6,22:2827,87:2826,214:1773,215:$VK6},o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:2828}),o($VG,$VE1),o($VG,$VF1),{19:[1,2832],21:[1,2836],22:2830,33:2829,200:2831,214:2833,215:[1,2835],216:[1,2834]},{119:[1,2837],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:2838}),o($Vh2,$Vy1,{93:2839}),o($Vt1,$Vz1,{99:2293,95:2840,101:$Vh7,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,2841]},o($Vh2,$VT1),{70:[1,2842]},o($Vo2,$Vp2,{83:2843,84:2844,192:2845,190:[1,2846]}),o($Vq2,$Vp2,{83:2847,84:2848,192:2849,190:$VY7}),o($Vr1,$Vs2,{99:1822,95:2851,101:$VL6,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vt2),o($Vt1,$Vu2,{90:2852,95:2853,91:2854,99:2855,105:2857,107:2858,101:$VZ7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vw2,{90:2852,95:2853,91:2854,99:2855,105:2857,107:2858,101:$VZ7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:2852,95:2853,91:2854,99:2855,105:2857,107:2858,101:$VZ7,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vy2),o($Vz2,$Vp2,{83:2859,84:2860,192:2861,190:[1,2862]}),o($Vu1,$VA2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,2863],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:2864,121:$VW2,148:$VX2,189:$VY2}),o($Vx1,$V23),o($VN1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),{111:[1,2865]},o($VN1,$Vb3),o($Vt1,$Vr5),{193:[1,2868],194:2866,195:[1,2867]},o($Vr1,$V56),o($Vr1,$V66),o($Vr1,$V76),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VY3),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V$3),o($Vr1,$V04,{202:2869,203:2870,111:[1,2871]}),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($V86,$V73),o($V86,$V83),o($V86,$V93),o($V86,$Va3),{193:[1,2874],194:2872,195:[1,2873]},o($Vt1,$V56),o($Vt1,$V66),o($Vt1,$V76),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VY3),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V$3),o($Vt1,$V04,{202:2875,203:2876,111:[1,2877]}),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($V96,$V73),o($V96,$V83),o($V96,$V93),o($V96,$Va3),{19:[1,2880],21:[1,2883],22:2879,87:2878,214:2881,215:[1,2882]},{193:[1,2886],194:2884,195:[1,2885]},o($VD1,$V56),o($VD1,$V66),o($VD1,$V76),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VY3),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V$3),o($VD1,$V04,{202:2887,203:2888,111:[1,2889]}),o($VD1,$V14),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($Va6,$V73),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($Vt1,$Vr5),{193:[1,2892],194:2890,195:[1,2891]},o($Vr1,$V56),o($Vr1,$V66),o($Vr1,$V76),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VY3),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V$3),o($Vr1,$V04,{202:2893,203:2894,111:[1,2895]}),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($V86,$V73),o($V86,$V83),o($V86,$V93),o($V86,$Va3),{193:[1,2898],194:2896,195:[1,2897]},o($Vt1,$V56),o($Vt1,$V66),o($Vt1,$V76),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VY3),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V$3),o($Vt1,$V04,{202:2899,203:2900,111:[1,2901]}),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($V96,$V73),o($V96,$V83),o($V96,$V93),o($V96,$Va3),{19:[1,2904],21:[1,2907],22:2903,87:2902,214:2905,215:[1,2906]},{193:[1,2910],194:2908,195:[1,2909]},o($VD1,$V56),o($VD1,$V66),o($VD1,$V76),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VY3),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V$3),o($VD1,$V04,{202:2911,203:2912,111:[1,2913]}),o($VD1,$V14),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($Va6,$V73),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($VO4,$V71),o($VO4,$V81),o($VO4,$V91),o($VA3,$Vp5),o($VA3,$Vq5),{19:$VM6,21:$VN6,22:2915,87:2914,214:1890,215:$VO6},o($VP4,$V71),o($VP4,$V81),o($VP4,$V91),o($VB3,$Vp5),o($VB3,$Vq5),{19:$VP6,21:$VQ6,22:2917,87:2916,214:1916,215:$VR6},o($VR4,$V71),o($VR4,$V81),o($VR4,$V91),o($VC3,$Vp5),o($VC3,$Vq5),{19:$VS6,21:$VT6,22:2919,87:2918,214:1942,215:$VU6},o($VE3,$VV5),o($VE3,$VK1),o($VE3,$Vn),o($VE3,$Vo),o($VE3,$Vp),o($VE3,$Vq),o($Vy3,$Ve1),o($VI,$VJ,{65:2920,67:2921,72:2922,44:2923,78:2924,118:2928,51:$Vf1,53:$Vf1,70:$Vf1,79:[1,2925],80:[1,2926],81:[1,2927]}),o($Vy3,$Vj1),o($Vy3,$Vk1,{68:2929,64:2930,73:2931,92:2932,94:2933,95:2937,99:2938,96:[1,2934],97:[1,2935],98:[1,2936],101:$V_7,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:2940,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($Vy3,$Vq1),o($VA3,$Vs1,{82:2941}),o($VB3,$Vs1,{82:2942}),o($V26,$Vv1),o($V26,$Vw1),o($VD3,$Vy1,{93:2943}),o($VA3,$Vz1,{99:2534,95:2944,101:$VD7,102:$VR,103:$VS,104:$VT}),o($VE3,$VB1,{86:2945}),o($VE3,$VB1,{86:2946}),o($VE3,$VB1,{86:2947}),o($VB3,$VC1,{105:2538,107:2539,91:2948,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VC3,$Vs1,{82:2949}),o($V26,$VE1),o($V26,$VF1),{19:[1,2953],21:[1,2957],22:2951,33:2950,200:2952,214:2954,215:[1,2956],216:[1,2955]},o($VD3,$VG1),o($VD3,$VH1),o($VD3,$VI1),o($VD3,$VJ1),o($VE3,$VK1),o($VL1,$VM1,{162:2958}),o($VF3,$VO1),{119:[1,2959],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},{100:[1,2960]},o($VD3,$VT1),o($VE3,$Vn),o($VE3,$Vo),{100:[1,2962],106:2961,108:[1,2963],109:[1,2964],110:2965,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,2966]},o($VE3,$Vp),o($VE3,$Vq),o($Vy3,$VU3),{121:[1,2967]},o($Vy3,$VI3),o($VN4,$VQ3),o($VO4,$VV4),{19:$Vi,21:$Vj,22:2968,214:45,215:$Vk},{19:$V$7,21:$V08,22:2970,100:[1,2981],108:[1,2982],109:[1,2983],110:2980,181:2971,191:2969,196:2974,197:2975,198:2976,201:2979,204:[1,2984],205:[1,2985],206:[1,2990],207:[1,2991],208:[1,2992],209:[1,2993],210:[1,2986],211:[1,2987],212:[1,2988],213:[1,2989],214:2973,215:$V18},o($VP4,$VV4),{19:$Vi,21:$Vj,22:2994,214:45,215:$Vk},{19:$V28,21:$V38,22:2996,100:[1,3007],108:[1,3008],109:[1,3009],110:3006,181:2997,191:2995,196:3000,197:3001,198:3002,201:3005,204:[1,3010],205:[1,3011],206:[1,3016],207:[1,3017],208:[1,3018],209:[1,3019],210:[1,3012],211:[1,3013],212:[1,3014],213:[1,3015],214:2999,215:$V48},o($VE3,$V23),o($VE3,$V33),o($VE3,$V43),o($VE3,$V53),o($VE3,$V63),{111:[1,3020]},o($VE3,$Vb3),o($VR4,$VV4),{19:$Vi,21:$Vj,22:3021,214:45,215:$Vk},{19:$V58,21:$V68,22:3023,100:[1,3034],108:[1,3035],109:[1,3036],110:3033,181:3024,191:3022,196:3027,197:3028,198:3029,201:3032,204:[1,3037],205:[1,3038],206:[1,3043],207:[1,3044],208:[1,3045],209:[1,3046],210:[1,3039],211:[1,3040],212:[1,3041],213:[1,3042],214:3026,215:$V78},o($VC3,$Vr5),o($VF3,$VV5),o($VF3,$VK1),o($VF3,$Vn),o($VF3,$Vo),o($VF3,$Vp),o($VF3,$Vq),o($Vy3,$VU3),{121:[1,3047]},o($Vy3,$VI3),o($VN4,$VQ3),o($VO4,$VV4),{19:$Vi,21:$Vj,22:3048,214:45,215:$Vk},{19:$V88,21:$V98,22:3050,100:[1,3061],108:[1,3062],109:[1,3063],110:3060,181:3051,191:3049,196:3054,197:3055,198:3056,201:3059,204:[1,3064],205:[1,3065],206:[1,3070],207:[1,3071],208:[1,3072],209:[1,3073],210:[1,3066],211:[1,3067],212:[1,3068],213:[1,3069],214:3053,215:$Va8},o($VP4,$VV4),{19:$Vi,21:$Vj,22:3074,214:45,215:$Vk},{19:$Vb8,21:$Vc8,22:3076,100:[1,3087],108:[1,3088],109:[1,3089],110:3086,181:3077,191:3075,196:3080,197:3081,198:3082,201:3085,204:[1,3090],205:[1,3091],206:[1,3096],207:[1,3097],208:[1,3098],209:[1,3099],210:[1,3092],211:[1,3093],212:[1,3094],213:[1,3095],214:3079,215:$Vd8},o($VE3,$V23),o($VE3,$V33),o($VE3,$V43),o($VE3,$V53),o($VE3,$V63),{111:[1,3100]},o($VE3,$Vb3),o($VR4,$VV4),{19:$Vi,21:$Vj,22:3101,214:45,215:$Vk},{19:$Ve8,21:$Vf8,22:3103,100:[1,3114],108:[1,3115],109:[1,3116],110:3113,181:3104,191:3102,196:3107,197:3108,198:3109,201:3112,204:[1,3117],205:[1,3118],206:[1,3123],207:[1,3124],208:[1,3125],209:[1,3126],210:[1,3119],211:[1,3120],212:[1,3121],213:[1,3122],214:3106,215:$Vg8},o($VC3,$Vr5),o($VF3,$VV5),o($VF3,$VK1),o($VF3,$Vn),o($VF3,$Vo),o($VF3,$Vp),o($VF3,$Vq),o($Vh8,$Vp2,{83:3127,84:3128,192:3129,190:$Vi8}),o($V57,$Vj8),o($Vr,$Vs,{55:3131,59:3132,40:3133,43:$Vt}),o($V77,$Vk8),o($Vr,$Vs,{59:3134,40:3135,43:$Vt}),o($V77,$Vl8),o($V77,$Vm8),o($V77,$VS5),o($V77,$VT5),{119:[1,3136],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($V77,$VE1),o($V77,$VF1),{19:[1,3140],21:[1,3144],22:3138,33:3137,200:3139,214:3141,215:[1,3143],216:[1,3142]},o($V77,$Vn8),o($V77,$Vu6),o($Vo8,$Vy1,{93:3145}),o($V77,$Vz1,{99:2617,95:3146,101:$VO7,102:$VR,103:$VS,104:$VT}),o($Vo8,$VG1),o($Vo8,$VH1),o($Vo8,$VI1),o($Vo8,$VJ1),{100:[1,3147]},o($Vo8,$VT1),{70:[1,3148]},o($VR7,$Vs2,{99:2083,95:3149,101:$V97,102:$VR,103:$VS,104:$VT}),o($VQ7,$Vt2),o($V77,$Vu2,{90:3150,95:3151,91:3152,99:3153,105:3155,107:3156,101:$Vp8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V77,$Vw2,{90:3150,95:3151,91:3152,99:3153,105:3155,107:3156,101:$Vp8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V77,$Vx2,{90:3150,95:3151,91:3152,99:3153,105:3155,107:3156,101:$Vp8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VU7,$Vy2),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,3157],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:3158,121:$VW2,148:$VX2,189:$VY2}),o($VT7,$VA2),o($VT7,$Vw),o($VT7,$Vx),o($VT7,$Vn),o($VT7,$Vo),o($VT7,$Vy),o($VT7,$Vp),o($VT7,$Vq),o($VQ7,$V23),o($VU7,$V33),o($VU7,$V43),o($VU7,$V53),o($VU7,$V63),{111:[1,3159]},o($VU7,$Vb3),o($Vh8,$Vp2,{84:3128,192:3129,83:3160,190:$Vi8}),o($Vq8,$V_6,{152:3161,153:3162,156:$Vr8,157:$Vs8,158:$Vt8,159:$Vu8}),o($Vv8,$V47),o($Vw8,$V67,{56:3167}),o($Vx8,$V87,{60:3168}),o($VI,$VJ,{63:3169,73:3170,75:3171,76:3172,92:3175,94:3176,87:3178,88:3179,89:3180,78:3181,44:3182,95:3186,22:3187,91:3189,118:3190,99:3194,214:3197,105:3198,107:3199,19:[1,3196],21:[1,3201],69:[1,3173],71:[1,3174],79:[1,3191],80:[1,3192],81:[1,3193],85:[1,3177],96:[1,3183],97:[1,3184],98:[1,3185],101:$Vy8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,3188],215:[1,3200]}),o($Vq8,$V_6,{153:3162,152:3202,156:$Vr8,157:$Vs8,158:$Vt8,159:$Vu8}),o($Vr4,$Vr6),o($Vr,$Vs,{223:3203,40:3204,43:$Vt}),o($Vr4,$Vs6),o($Vr4,$VS5),o($Vr4,$VT5),{119:[1,3205],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($Vr4,$VE1),o($Vr4,$VF1),{19:[1,3209],21:[1,3213],22:3207,33:3206,200:3208,214:3210,215:[1,3212],216:[1,3211]},o($Vr4,$Vt6),o($Vr4,$Vu6),o($Vv6,$Vy1,{93:3214}),o($Vr4,$Vz1,{99:2667,95:3215,101:$VV7,102:$VR,103:$VS,104:$VT}),o($Vv6,$VG1),o($Vv6,$VH1),o($Vv6,$VI1),o($Vv6,$VJ1),{100:[1,3216]},o($Vv6,$VT1),{70:[1,3217]},o($Vr4,$Vu2,{90:3218,95:3219,91:3220,99:3221,105:3223,107:3224,101:$Vz8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vr4,$Vw2,{90:3218,95:3219,91:3220,99:3221,105:3223,107:3224,101:$Vz8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vr4,$Vx2,{90:3218,95:3219,91:3220,99:3221,105:3223,107:3224,101:$Vz8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VU5,$Vy2),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,3225],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:3226,121:$VW2,148:$VX2,189:$VY2}),o($VR5,$VA2),o($VR5,$Vw),o($VR5,$Vx),o($VR5,$Vn),o($VR5,$Vo),o($VR5,$Vy),o($VR5,$Vp),o($VR5,$Vq),o($VU5,$V33),o($VU5,$V43),o($VU5,$V53),o($VU5,$V63),{111:[1,3227]},o($VU5,$Vb3),o($Vr4,$Vs6),o($Vr4,$VS5),o($Vr4,$VT5),{119:[1,3228],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($Vr4,$VE1),o($Vr4,$VF1),{19:[1,3232],21:[1,3236],22:3230,33:3229,200:3231,214:3233,215:[1,3235],216:[1,3234]},o($Vr4,$Vt6),o($Vr4,$Vu6),o($Vv6,$Vy1,{93:3237}),o($Vr4,$Vz1,{99:2705,95:3238,101:$VW7,102:$VR,103:$VS,104:$VT}),o($Vv6,$VG1),o($Vv6,$VH1),o($Vv6,$VI1),o($Vv6,$VJ1),{100:[1,3239]},o($Vv6,$VT1),{70:[1,3240]},o($Vr4,$Vu2,{90:3241,95:3242,91:3243,99:3244,105:3246,107:3247,101:$VA8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vr4,$Vw2,{90:3241,95:3242,91:3243,99:3244,105:3246,107:3247,101:$VA8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vr4,$Vx2,{90:3241,95:3242,91:3243,99:3244,105:3246,107:3247,101:$VA8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VU5,$Vy2),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,3248],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:3249,121:$VW2,148:$VX2,189:$VY2}),o($VR5,$VA2),o($VR5,$Vw),o($VR5,$Vx),o($VR5,$Vn),o($VR5,$Vo),o($VR5,$Vy),o($VR5,$Vp),o($VR5,$Vq),o($VU5,$V33),o($VU5,$V43),o($VU5,$V53),o($VU5,$V63),{111:[1,3250]},o($VU5,$Vb3),o($Vr4,$Vr5),{19:[1,3253],21:[1,3256],22:3252,87:3251,214:3254,215:[1,3255]},o($Vc3,$Vf6),o($Vc3,$VK1),o($VG,$Ve1),o($VG,$Vf1,{65:3257,67:3258,72:3259,44:3260,78:3261,118:3265,79:[1,3262],80:[1,3263],81:[1,3264],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($VG,$Vj1),o($VG,$Vk1,{68:3266,64:3267,73:3268,92:3269,94:3270,95:3274,99:3275,96:[1,3271],97:[1,3272],98:[1,3273],101:$VB8,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:3277,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($VG,$Vq1),o($Vr1,$Vs1,{82:3278}),o($Vt1,$Vs1,{82:3279}),o($Vu1,$Vv1),o($Vu1,$Vw1),o($Vx1,$Vy1,{93:3280}),o($Vr1,$Vz1,{99:2760,95:3281,101:$VX7,102:$VR,103:$VS,104:$VT}),o($VA1,$VB1,{86:3282}),o($VA1,$VB1,{86:3283}),o($VA1,$VB1,{86:3284}),o($Vt1,$VC1,{105:2764,107:2765,91:3285,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VD1,$Vs1,{82:3286}),o($Vu1,$VE1),o($Vu1,$VF1),{19:[1,3290],21:[1,3294],22:3288,33:3287,200:3289,214:3291,215:[1,3293],216:[1,3292]},o($Vx1,$VG1),o($Vx1,$VH1),o($Vx1,$VI1),o($Vx1,$VJ1),o($VA1,$VK1),o($VL1,$VM1,{162:3295}),o($VN1,$VO1),{119:[1,3296],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},{100:[1,3297]},o($Vx1,$VT1),o($VA1,$Vn),o($VA1,$Vo),{100:[1,3299],106:3298,108:[1,3300],109:[1,3301],110:3302,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,3303]},o($VA1,$Vp),o($VA1,$Vq),o($VG,$VU3),{121:[1,3304]},o($VG,$VI3),o($Vh2,$VQ3),o($Vo2,$VV4),{19:$Vi,21:$Vj,22:3305,214:45,215:$Vk},{19:$VC8,21:$VD8,22:3307,100:[1,3318],108:[1,3319],109:[1,3320],110:3317,181:3308,191:3306,196:3311,197:3312,198:3313,201:3316,204:[1,3321],205:[1,3322],206:[1,3327],207:[1,3328],208:[1,3329],209:[1,3330],210:[1,3323],211:[1,3324],212:[1,3325],213:[1,3326],214:3310,215:$VE8},o($Vq2,$VV4),{19:$Vi,21:$Vj,22:3331,214:45,215:$Vk},{19:$VF8,21:$VG8,22:3333,100:[1,3344],108:[1,3345],109:[1,3346],110:3343,181:3334,191:3332,196:3337,197:3338,198:3339,201:3342,204:[1,3347],205:[1,3348],206:[1,3353],207:[1,3354],208:[1,3355],209:[1,3356],210:[1,3349],211:[1,3350],212:[1,3351],213:[1,3352],214:3336,215:$VH8},o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),{111:[1,3357]},o($VA1,$Vb3),o($Vz2,$VV4),{19:$Vi,21:$Vj,22:3358,214:45,215:$Vk},{19:$VI8,21:$VJ8,22:3360,100:[1,3371],108:[1,3372],109:[1,3373],110:3370,181:3361,191:3359,196:3364,197:3365,198:3366,201:3369,204:[1,3374],205:[1,3375],206:[1,3380],207:[1,3381],208:[1,3382],209:[1,3383],210:[1,3376],211:[1,3377],212:[1,3378],213:[1,3379],214:3363,215:$VK8},o($VD1,$Vr5),o($VN1,$VV5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($VG,$VU3),{121:[1,3384]},o($VG,$VI3),o($Vh2,$VQ3),o($Vo2,$VV4),{19:$Vi,21:$Vj,22:3385,214:45,215:$Vk},{19:$VL8,21:$VM8,22:3387,100:[1,3398],108:[1,3399],109:[1,3400],110:3397,181:3388,191:3386,196:3391,197:3392,198:3393,201:3396,204:[1,3401],205:[1,3402],206:[1,3407],207:[1,3408],208:[1,3409],209:[1,3410],210:[1,3403],211:[1,3404],212:[1,3405],213:[1,3406],214:3390,215:$VN8},o($Vq2,$VV4),{19:$Vi,21:$Vj,22:3411,214:45,215:$Vk},{19:$VO8,21:$VP8,22:3413,100:[1,3424],108:[1,3425],109:[1,3426],110:3423,181:3414,191:3412,196:3417,197:3418,198:3419,201:3422,204:[1,3427],205:[1,3428],206:[1,3433],207:[1,3434],208:[1,3435],209:[1,3436],210:[1,3429],211:[1,3430],212:[1,3431],213:[1,3432],214:3416,215:$VQ8},o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),{111:[1,3437]},o($VA1,$Vb3),o($Vz2,$VV4),{19:$Vi,21:$Vj,22:3438,214:45,215:$Vk},{19:$VR8,21:$VS8,22:3440,100:[1,3451],108:[1,3452],109:[1,3453],110:3450,181:3441,191:3439,196:3444,197:3445,198:3446,201:3449,204:[1,3454],205:[1,3455],206:[1,3460],207:[1,3461],208:[1,3462],209:[1,3463],210:[1,3456],211:[1,3457],212:[1,3458],213:[1,3459],214:3443,215:$VT8},o($VD1,$Vr5),o($VN1,$VV5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($Vr1,$Vf6),o($Vr1,$VK1),o($Vt1,$Vf6),o($Vt1,$VK1),o($VD1,$Vf6),o($VD1,$VK1),o($Vq2,$Vp2,{84:2848,192:2849,83:3464,190:$VY7}),o($VG,$VA2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:3465,121:$VW2,148:$VX2,189:$VY2}),o($Vq2,$Vp2,{84:2848,192:2849,83:3466,190:$VY7}),o($Vt1,$Vs2,{99:2293,95:3467,101:$Vh7,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vt2),o($Vh2,$V23),o($VG,$Vx3),o($VH3,$VI3),o($Vr1,$VJ3),o($VH3,$VK3,{31:3468,193:[1,3469]}),{19:$VL3,21:$VM3,22:640,129:3470,199:$VN3,214:643,215:$VO3},o($VG,$VP3),o($Vt1,$VJ3),o($VG,$VK3,{31:3471,193:[1,3472]}),{19:$VL3,21:$VM3,22:640,129:3473,199:$VN3,214:643,215:$VO3},o($Vx1,$VQ3),o($VA1,$VR3),o($VA1,$VS3),o($VA1,$VT3),{100:[1,3474]},o($VA1,$VT1),{100:[1,3476],106:3475,108:[1,3477],109:[1,3478],110:3479,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,3480]},o($Vu1,$VU3),o($VD1,$VJ3),o($Vu1,$VK3,{31:3481,193:[1,3482]}),{19:$VL3,21:$VM3,22:640,129:3483,199:$VN3,214:643,215:$VO3},o($VA1,$VV3),{121:[1,3484]},{19:[1,3487],21:[1,3490],22:3486,87:3485,214:3488,215:[1,3489]},o($Vo2,$V71),o($Vo2,$V81),o($Vo2,$V91),o($Vr1,$Vp5),o($Vr1,$Vq5),{19:$Vi7,21:$Vj7,22:3492,87:3491,214:2328,215:$Vk7},o($Vq2,$V71),o($Vq2,$V81),o($Vq2,$V91),o($Vt1,$Vp5),o($Vt1,$Vq5),{19:$Vl7,21:$Vm7,22:3494,87:3493,214:2354,215:$Vn7},o($VA1,$VV5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($Vz2,$V71),o($Vz2,$V81),o($Vz2,$V91),o($VD1,$Vp5),o($VD1,$Vq5),{19:$Vo7,21:$Vp7,22:3496,87:3495,214:2381,215:$Vq7},o($Vo2,$V71),o($Vo2,$V81),o($Vo2,$V91),o($Vr1,$Vp5),o($Vr1,$Vq5),{19:$Vr7,21:$Vs7,22:3498,87:3497,214:2408,215:$Vt7},o($Vq2,$V71),o($Vq2,$V81),o($Vq2,$V91),o($Vt1,$Vp5),o($Vt1,$Vq5),{19:$Vu7,21:$Vv7,22:3500,87:3499,214:2434,215:$Vw7},o($VA1,$VV5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($Vz2,$V71),o($Vz2,$V81),o($Vz2,$V91),o($VD1,$Vp5),o($VD1,$Vq5),{19:$Vx7,21:$Vy7,22:3502,87:3501,214:2461,215:$Vz7},o($VA3,$Vf6),o($VA3,$VK1),o($VB3,$Vf6),o($VB3,$VK1),o($VC3,$Vf6),o($VC3,$VK1),o($Vy3,$Vd2),o($Vy3,$Ve2),o($Vy3,$Vv1),o($Vy3,$Vw1),o($VB3,$Vs1,{82:3503}),o($Vy3,$VE1),o($Vy3,$VF1),{19:[1,3507],21:[1,3511],22:3505,33:3504,200:3506,214:3508,215:[1,3510],216:[1,3509]},{119:[1,3512],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($Vy3,$Vf2),o($Vy3,$Vg2),o($VB3,$Vs1,{82:3513}),o($VN4,$Vy1,{93:3514}),o($VB3,$Vz1,{99:2938,95:3515,101:$V_7,102:$VR,103:$VS,104:$VT}),o($VN4,$VG1),o($VN4,$VH1),o($VN4,$VI1),o($VN4,$VJ1),{100:[1,3516]},o($VN4,$VT1),{70:[1,3517]},o($VO4,$Vp2,{83:3518,84:3519,192:3520,190:[1,3521]}),o($VP4,$Vp2,{83:3522,84:3523,192:3524,190:$VU8}),o($VA3,$Vs2,{99:2534,95:3526,101:$VD7,102:$VR,103:$VS,104:$VT}),o($VD3,$Vt2),o($VB3,$Vu2,{90:3527,95:3528,91:3529,99:3530,105:3532,107:3533,101:$VV8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VB3,$Vw2,{90:3527,95:3528,91:3529,99:3530,105:3532,107:3533,101:$VV8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VB3,$Vx2,{90:3527,95:3528,91:3529,99:3530,105:3532,107:3533,101:$VV8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VF3,$Vy2),o($VR4,$Vp2,{83:3534,84:3535,192:3536,190:[1,3537]}),o($V26,$VA2),o($V26,$Vw),o($V26,$Vx),o($V26,$Vn),o($V26,$Vo),o($V26,$Vy),o($V26,$Vp),o($V26,$Vq),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,3538],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:3539,121:$VW2,148:$VX2,189:$VY2}),o($VD3,$V23),o($VF3,$V33),o($VF3,$V43),o($VF3,$V53),o($VF3,$V63),{111:[1,3540]},o($VF3,$Vb3),o($VB3,$Vr5),{193:[1,3543],194:3541,195:[1,3542]},o($VA3,$V56),o($VA3,$V66),o($VA3,$V76),o($VA3,$Vn),o($VA3,$Vo),o($VA3,$VY3),o($VA3,$VZ3),o($VA3,$V_3),o($VA3,$Vp),o($VA3,$Vq),o($VA3,$V$3),o($VA3,$V04,{202:3544,203:3545,111:[1,3546]}),o($VA3,$V14),o($VA3,$V24),o($VA3,$V34),o($VA3,$V44),o($VA3,$V54),o($VA3,$V64),o($VA3,$V74),o($VA3,$V84),o($VA3,$V94),o($VA7,$V73),o($VA7,$V83),o($VA7,$V93),o($VA7,$Va3),{193:[1,3549],194:3547,195:[1,3548]},o($VB3,$V56),o($VB3,$V66),o($VB3,$V76),o($VB3,$Vn),o($VB3,$Vo),o($VB3,$VY3),o($VB3,$VZ3),o($VB3,$V_3),o($VB3,$Vp),o($VB3,$Vq),o($VB3,$V$3),o($VB3,$V04,{202:3550,203:3551,111:[1,3552]}),o($VB3,$V14),o($VB3,$V24),o($VB3,$V34),o($VB3,$V44),o($VB3,$V54),o($VB3,$V64),o($VB3,$V74),o($VB3,$V84),o($VB3,$V94),o($VB7,$V73),o($VB7,$V83),o($VB7,$V93),o($VB7,$Va3),{19:[1,3555],21:[1,3558],22:3554,87:3553,214:3556,215:[1,3557]},{193:[1,3561],194:3559,195:[1,3560]},o($VC3,$V56),o($VC3,$V66),o($VC3,$V76),o($VC3,$Vn),o($VC3,$Vo),o($VC3,$VY3),o($VC3,$VZ3),o($VC3,$V_3),o($VC3,$Vp),o($VC3,$Vq),o($VC3,$V$3),o($VC3,$V04,{202:3562,203:3563,111:[1,3564]}),o($VC3,$V14),o($VC3,$V24),o($VC3,$V34),o($VC3,$V44),o($VC3,$V54),o($VC3,$V64),o($VC3,$V74),o($VC3,$V84),o($VC3,$V94),o($VC7,$V73),o($VC7,$V83),o($VC7,$V93),o($VC7,$Va3),o($VB3,$Vr5),{193:[1,3567],194:3565,195:[1,3566]},o($VA3,$V56),o($VA3,$V66),o($VA3,$V76),o($VA3,$Vn),o($VA3,$Vo),o($VA3,$VY3),o($VA3,$VZ3),o($VA3,$V_3),o($VA3,$Vp),o($VA3,$Vq),o($VA3,$V$3),o($VA3,$V04,{202:3568,203:3569,111:[1,3570]}),o($VA3,$V14),o($VA3,$V24),o($VA3,$V34),o($VA3,$V44),o($VA3,$V54),o($VA3,$V64),o($VA3,$V74),o($VA3,$V84),o($VA3,$V94),o($VA7,$V73),o($VA7,$V83),o($VA7,$V93),o($VA7,$Va3),{193:[1,3573],194:3571,195:[1,3572]},o($VB3,$V56),o($VB3,$V66),o($VB3,$V76),o($VB3,$Vn),o($VB3,$Vo),o($VB3,$VY3),o($VB3,$VZ3),o($VB3,$V_3),o($VB3,$Vp),o($VB3,$Vq),o($VB3,$V$3),o($VB3,$V04,{202:3574,203:3575,111:[1,3576]}),o($VB3,$V14),o($VB3,$V24),o($VB3,$V34),o($VB3,$V44),o($VB3,$V54),o($VB3,$V64),o($VB3,$V74),o($VB3,$V84),o($VB3,$V94),o($VB7,$V73),o($VB7,$V83),o($VB7,$V93),o($VB7,$Va3),{19:[1,3579],21:[1,3582],22:3578,87:3577,214:3580,215:[1,3581]},{193:[1,3585],194:3583,195:[1,3584]},o($VC3,$V56),o($VC3,$V66),o($VC3,$V76),o($VC3,$Vn),o($VC3,$Vo),o($VC3,$VY3),o($VC3,$VZ3),o($VC3,$V_3),o($VC3,$Vp),o($VC3,$Vq),o($VC3,$V$3),o($VC3,$V04,{202:3586,203:3587,111:[1,3588]}),o($VC3,$V14),o($VC3,$V24),o($VC3,$V34),o($VC3,$V44),o($VC3,$V54),o($VC3,$V64),o($VC3,$V74),o($VC3,$V84),o($VC3,$V94),o($VC7,$V73),o($VC7,$V83),o($VC7,$V93),o($VC7,$Va3),o($Vo4,$VW8),o($VZ6,$VJ3),o($Vo4,$VK3,{31:3589,193:[1,3590]}),{19:$VL3,21:$VM3,22:640,129:3591,199:$VN3,214:643,215:$VO3},o($V57,$VX8),o($V77,$V87,{60:3592}),o($VI,$VJ,{63:3593,73:3594,75:3595,76:3596,92:3599,94:3600,87:3602,88:3603,89:3604,78:3605,44:3606,95:3610,22:3611,91:3613,118:3614,99:3618,214:3621,105:3622,107:3623,19:[1,3620],21:[1,3625],69:[1,3597],71:[1,3598],79:[1,3615],80:[1,3616],81:[1,3617],85:[1,3601],96:[1,3607],97:[1,3608],98:[1,3609],101:$VY8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,3612],215:[1,3624]}),o($V77,$VZ8),o($VI,$VJ,{63:3626,73:3627,75:3628,76:3629,92:3632,94:3633,87:3635,88:3636,89:3637,78:3638,44:3639,95:3643,22:3644,91:3646,118:3647,99:3651,214:3654,105:3655,107:3656,19:[1,3653],21:[1,3658],69:[1,3630],71:[1,3631],79:[1,3648],80:[1,3649],81:[1,3650],85:[1,3634],96:[1,3640],97:[1,3641],98:[1,3642],101:$V_8,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,3645],215:[1,3657]}),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:3659,121:$VW2,148:$VX2,189:$VY2}),o($V77,$VA2),o($V77,$Vw),o($V77,$Vx),o($V77,$Vn),o($V77,$Vo),o($V77,$Vy),o($V77,$Vp),o($V77,$Vq),o($V77,$Vs2,{99:2617,95:3660,101:$VO7,102:$VR,103:$VS,104:$VT}),o($Vo8,$Vt2),o($Vo8,$V23),o($V77,$V$8),o($VQ7,$VQ3),o($VS7,$VR3),o($VS7,$VS3),o($VS7,$VT3),{100:[1,3661]},o($VS7,$VT1),{100:[1,3663],106:3662,108:[1,3664],109:[1,3665],110:3666,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,3667]},o($VS7,$VV3),{121:[1,3668]},{19:[1,3671],21:[1,3674],22:3670,87:3669,214:3672,215:[1,3673]},o($Vo4,$V09),o($Vq8,$Vs1,{82:3675}),o($Vq8,$VE7),o($Vq8,$VF7),o($Vq8,$VG7),o($Vq8,$VH7),o($Vq8,$VI7),o($Vv8,$VJ7,{57:3676,51:[1,3677]}),o($Vw8,$VK7,{61:3678,53:[1,3679]}),o($Vx8,$VL7),o($Vx8,$VM7,{74:3680,76:3681,78:3682,44:3683,118:3684,79:[1,3685],80:[1,3686],81:[1,3687],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($Vx8,$VN7),o($Vx8,$VM5,{77:3688,73:3689,92:3690,94:3691,95:3695,99:3696,96:[1,3692],97:[1,3693],98:[1,3694],101:$V19,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:3698,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($Vx8,$VP7),o($V29,$Vy1,{93:3699}),o($V39,$Vz1,{99:3194,95:3700,101:$Vy8,102:$VR,103:$VS,104:$VT}),o($V49,$VB1,{86:3701}),o($V49,$VB1,{86:3702}),o($V49,$VB1,{86:3703}),o($Vx8,$VC1,{105:3198,107:3199,91:3704,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V59,$VS5),o($V59,$VT5),o($V29,$VG1),o($V29,$VH1),o($V29,$VI1),o($V29,$VJ1),o($V49,$VK1),o($VL1,$VM1,{162:3705}),o($V69,$VO1),{119:[1,3706],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($V59,$VE1),o($V59,$VF1),{19:[1,3710],21:[1,3714],22:3708,33:3707,200:3709,214:3711,215:[1,3713],216:[1,3712]},{100:[1,3715]},o($V29,$VT1),o($V49,$Vn),o($V49,$Vo),{100:[1,3717],106:3716,108:[1,3718],109:[1,3719],110:3720,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,3721]},o($V49,$Vp),o($V49,$Vq),o($Vq8,$Vs1,{82:3722}),o($Vr4,$Va7),o($VI,$VJ,{92:720,94:721,95:731,99:739,226:3723,73:3724,75:3725,76:3726,87:3730,88:3731,89:3732,78:3733,44:3734,22:3735,91:3737,118:3738,214:3743,105:3744,107:3745,19:[1,3742],21:[1,3747],69:[1,3727],71:[1,3728],79:[1,3739],80:[1,3740],81:[1,3741],85:[1,3729],96:$Vt4,97:$Vu4,98:$Vv4,101:$Vw4,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,3736],215:[1,3746]}),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:3748,121:$VW2,148:$VX2,189:$VY2}),o($Vr4,$VA2),o($Vr4,$Vw),o($Vr4,$Vx),o($Vr4,$Vn),o($Vr4,$Vo),o($Vr4,$Vy),o($Vr4,$Vp),o($Vr4,$Vq),o($Vr4,$Vs2,{99:2667,95:3749,101:$VV7,102:$VR,103:$VS,104:$VT}),o($Vv6,$Vt2),o($Vv6,$V23),o($Vr4,$Vb7),o($VQ5,$VR3),o($VQ5,$VS3),o($VQ5,$VT3),{100:[1,3750]},o($VQ5,$VT1),{100:[1,3752],106:3751,108:[1,3753],109:[1,3754],110:3755,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,3756]},o($VQ5,$VV3),{121:[1,3757]},{19:[1,3760],21:[1,3763],22:3759,87:3758,214:3761,215:[1,3762]},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:3764,121:$VW2,148:$VX2,189:$VY2}),o($Vr4,$VA2),o($Vr4,$Vw),o($Vr4,$Vx),o($Vr4,$Vn),o($Vr4,$Vo),o($Vr4,$Vy),o($Vr4,$Vp),o($Vr4,$Vq),o($Vr4,$Vs2,{99:2705,95:3765,101:$VW7,102:$VR,103:$VS,104:$VT}),o($Vv6,$Vt2),o($Vv6,$V23),o($Vr4,$Vb7),o($VQ5,$VR3),o($VQ5,$VS3),o($VQ5,$VT3),{100:[1,3766]},o($VQ5,$VT1),{100:[1,3768],106:3767,108:[1,3769],109:[1,3770],110:3771,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,3772]},o($VQ5,$VV3),{121:[1,3773]},{19:[1,3776],21:[1,3779],22:3775,87:3774,214:3777,215:[1,3778]},o($VQ5,$VV5),o($VQ5,$VK1),o($VQ5,$Vn),o($VQ5,$Vo),o($VQ5,$Vp),o($VQ5,$Vq),o($VG,$Vd2),o($VG,$Ve2),o($VG,$Vv1),o($VG,$Vw1),o($Vt1,$Vs1,{82:3780}),o($VG,$VE1),o($VG,$VF1),{19:[1,3784],21:[1,3788],22:3782,33:3781,200:3783,214:3785,215:[1,3787],216:[1,3786]},{119:[1,3789],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($VG,$Vf2),o($VG,$Vg2),o($Vt1,$Vs1,{82:3790}),o($Vh2,$Vy1,{93:3791}),o($Vt1,$Vz1,{99:3275,95:3792,101:$VB8,102:$VR,103:$VS,104:$VT}),o($Vh2,$VG1),o($Vh2,$VH1),o($Vh2,$VI1),o($Vh2,$VJ1),{100:[1,3793]},o($Vh2,$VT1),{70:[1,3794]},o($Vo2,$Vp2,{83:3795,84:3796,192:3797,190:[1,3798]}),o($Vq2,$Vp2,{83:3799,84:3800,192:3801,190:$V79}),o($Vr1,$Vs2,{99:2760,95:3803,101:$VX7,102:$VR,103:$VS,104:$VT}),o($Vx1,$Vt2),o($Vt1,$Vu2,{90:3804,95:3805,91:3806,99:3807,105:3809,107:3810,101:$V89,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vw2,{90:3804,95:3805,91:3806,99:3807,105:3809,107:3810,101:$V89,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vt1,$Vx2,{90:3804,95:3805,91:3806,99:3807,105:3809,107:3810,101:$V89,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VN1,$Vy2),o($Vz2,$Vp2,{83:3811,84:3812,192:3813,190:[1,3814]}),o($Vu1,$VA2),o($Vu1,$Vw),o($Vu1,$Vx),o($Vu1,$Vn),o($Vu1,$Vo),o($Vu1,$Vy),o($Vu1,$Vp),o($Vu1,$Vq),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,3815],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:3816,121:$VW2,148:$VX2,189:$VY2}),o($Vx1,$V23),o($VN1,$V33),o($VN1,$V43),o($VN1,$V53),o($VN1,$V63),{111:[1,3817]},o($VN1,$Vb3),o($Vt1,$Vr5),{193:[1,3820],194:3818,195:[1,3819]},o($Vr1,$V56),o($Vr1,$V66),o($Vr1,$V76),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VY3),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V$3),o($Vr1,$V04,{202:3821,203:3822,111:[1,3823]}),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($V86,$V73),o($V86,$V83),o($V86,$V93),o($V86,$Va3),{193:[1,3826],194:3824,195:[1,3825]},o($Vt1,$V56),o($Vt1,$V66),o($Vt1,$V76),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VY3),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V$3),o($Vt1,$V04,{202:3827,203:3828,111:[1,3829]}),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($V96,$V73),o($V96,$V83),o($V96,$V93),o($V96,$Va3),{19:[1,3832],21:[1,3835],22:3831,87:3830,214:3833,215:[1,3834]},{193:[1,3838],194:3836,195:[1,3837]},o($VD1,$V56),o($VD1,$V66),o($VD1,$V76),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VY3),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V$3),o($VD1,$V04,{202:3839,203:3840,111:[1,3841]}),o($VD1,$V14),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($Va6,$V73),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($Vt1,$Vr5),{193:[1,3844],194:3842,195:[1,3843]},o($Vr1,$V56),o($Vr1,$V66),o($Vr1,$V76),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VY3),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V$3),o($Vr1,$V04,{202:3845,203:3846,111:[1,3847]}),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($V86,$V73),o($V86,$V83),o($V86,$V93),o($V86,$Va3),{193:[1,3850],194:3848,195:[1,3849]},o($Vt1,$V56),o($Vt1,$V66),o($Vt1,$V76),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VY3),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V$3),o($Vt1,$V04,{202:3851,203:3852,111:[1,3853]}),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($V96,$V73),o($V96,$V83),o($V96,$V93),o($V96,$Va3),{19:[1,3856],21:[1,3859],22:3855,87:3854,214:3857,215:[1,3858]},{193:[1,3862],194:3860,195:[1,3861]},o($VD1,$V56),o($VD1,$V66),o($VD1,$V76),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VY3),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V$3),o($VD1,$V04,{202:3863,203:3864,111:[1,3865]}),o($VD1,$V14),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($Va6,$V73),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($VG,$VU3),{121:[1,3866]},o($VG,$VI3),o($Vh2,$VQ3),o($Vo2,$VV4),{19:$Vi,21:$Vj,22:3867,214:45,215:$Vk},{19:$V99,21:$Va9,22:3869,100:[1,3880],108:[1,3881],109:[1,3882],110:3879,181:3870,191:3868,196:3873,197:3874,198:3875,201:3878,204:[1,3883],205:[1,3884],206:[1,3889],207:[1,3890],208:[1,3891],209:[1,3892],210:[1,3885],211:[1,3886],212:[1,3887],213:[1,3888],214:3872,215:$Vb9},o($Vq2,$VV4),{19:$Vi,21:$Vj,22:3893,214:45,215:$Vk},{19:$Vc9,21:$Vd9,22:3895,100:[1,3906],108:[1,3907],109:[1,3908],110:3905,181:3896,191:3894,196:3899,197:3900,198:3901,201:3904,204:[1,3909],205:[1,3910],206:[1,3915],207:[1,3916],208:[1,3917],209:[1,3918],210:[1,3911],211:[1,3912],212:[1,3913],213:[1,3914],214:3898,215:$Ve9},o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),{111:[1,3919]},o($VA1,$Vb3),o($Vz2,$VV4),{19:$Vi,21:$Vj,22:3920,214:45,215:$Vk},{19:$Vf9,21:$Vg9,22:3922,100:[1,3933],108:[1,3934],109:[1,3935],110:3932,181:3923,191:3921,196:3926,197:3927,198:3928,201:3931,204:[1,3936],205:[1,3937],206:[1,3942],207:[1,3943],208:[1,3944],209:[1,3945],210:[1,3938],211:[1,3939],212:[1,3940],213:[1,3941],214:3925,215:$Vh9},o($VD1,$Vr5),o($VN1,$VV5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($Vr1,$Vf6),o($Vr1,$VK1),o($Vt1,$Vf6),o($Vt1,$VK1),o($VD1,$Vf6),o($VD1,$VK1),o($Vr1,$Vf6),o($Vr1,$VK1),o($Vt1,$Vf6),o($Vt1,$VK1),o($VD1,$Vf6),o($VD1,$VK1),o($VP4,$Vp2,{84:3523,192:3524,83:3946,190:$VU8}),o($Vy3,$VA2),o($Vy3,$Vw),o($Vy3,$Vx),o($Vy3,$Vn),o($Vy3,$Vo),o($Vy3,$Vy),o($Vy3,$Vp),o($Vy3,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:3947,121:$VW2,148:$VX2,189:$VY2}),o($VP4,$Vp2,{84:3523,192:3524,83:3948,190:$VU8}),o($VB3,$Vs2,{99:2938,95:3949,101:$V_7,102:$VR,103:$VS,104:$VT}),o($VN4,$Vt2),o($VN4,$V23),o($Vy3,$Vx3),o($V16,$VI3),o($VA3,$VJ3),o($V16,$VK3,{31:3950,193:[1,3951]}),{19:$VL3,21:$VM3,22:640,129:3952,199:$VN3,214:643,215:$VO3},o($Vy3,$VP3),o($VB3,$VJ3),o($Vy3,$VK3,{31:3953,193:[1,3954]}),{19:$VL3,21:$VM3,22:640,129:3955,199:$VN3,214:643,215:$VO3},o($VD3,$VQ3),o($VE3,$VR3),o($VE3,$VS3),o($VE3,$VT3),{100:[1,3956]},o($VE3,$VT1),{100:[1,3958],106:3957,108:[1,3959],109:[1,3960],110:3961,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,3962]},o($V26,$VU3),o($VC3,$VJ3),o($V26,$VK3,{31:3963,193:[1,3964]}),{19:$VL3,21:$VM3,22:640,129:3965,199:$VN3,214:643,215:$VO3},o($VE3,$VV3),{121:[1,3966]},{19:[1,3969],21:[1,3972],22:3968,87:3967,214:3970,215:[1,3971]},o($VO4,$V71),o($VO4,$V81),o($VO4,$V91),o($VA3,$Vp5),o($VA3,$Vq5),{19:$V$7,21:$V08,22:3974,87:3973,214:2973,215:$V18},o($VP4,$V71),o($VP4,$V81),o($VP4,$V91),o($VB3,$Vp5),o($VB3,$Vq5),{19:$V28,21:$V38,22:3976,87:3975,214:2999,215:$V48},o($VE3,$VV5),o($VE3,$VK1),o($VE3,$Vn),o($VE3,$Vo),o($VE3,$Vp),o($VE3,$Vq),o($VR4,$V71),o($VR4,$V81),o($VR4,$V91),o($VC3,$Vp5),o($VC3,$Vq5),{19:$V58,21:$V68,22:3978,87:3977,214:3026,215:$V78},o($VO4,$V71),o($VO4,$V81),o($VO4,$V91),o($VA3,$Vp5),o($VA3,$Vq5),{19:$V88,21:$V98,22:3980,87:3979,214:3053,215:$Va8},o($VP4,$V71),o($VP4,$V81),o($VP4,$V91),o($VB3,$Vp5),o($VB3,$Vq5),{19:$Vb8,21:$Vc8,22:3982,87:3981,214:3079,215:$Vd8},o($VE3,$VV5),o($VE3,$VK1),o($VE3,$Vn),o($VE3,$Vo),o($VE3,$Vp),o($VE3,$Vq),o($VR4,$V71),o($VR4,$V81),o($VR4,$V91),o($VC3,$Vp5),o($VC3,$Vq5),{19:$Ve8,21:$Vf8,22:3984,87:3983,214:3106,215:$Vg8},o($Vh8,$VV4),{19:$Vi,21:$Vj,22:3985,214:45,215:$Vk},{19:$Vi9,21:$Vj9,22:3987,100:[1,3998],108:[1,3999],109:[1,4000],110:3997,181:3988,191:3986,196:3991,197:3992,198:3993,201:3996,204:[1,4001],205:[1,4002],206:[1,4007],207:[1,4008],208:[1,4009],209:[1,4010],210:[1,4003],211:[1,4004],212:[1,4005],213:[1,4006],214:3990,215:$Vk9},o($V57,$VK7,{61:4011,53:[1,4012]}),o($V77,$VL7),o($V77,$VM7,{74:4013,76:4014,78:4015,44:4016,118:4017,79:[1,4018],80:[1,4019],81:[1,4020],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($V77,$VN7),o($V77,$VM5,{77:4021,73:4022,92:4023,94:4024,95:4028,99:4029,96:[1,4025],97:[1,4026],98:[1,4027],101:$Vl9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:4031,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($V77,$VP7),o($VQ7,$Vy1,{93:4032}),o($VR7,$Vz1,{99:3618,95:4033,101:$VY8,102:$VR,103:$VS,104:$VT}),o($VS7,$VB1,{86:4034}),o($VS7,$VB1,{86:4035}),o($VS7,$VB1,{86:4036}),o($V77,$VC1,{105:3622,107:3623,91:4037,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VT7,$VS5),o($VT7,$VT5),o($VQ7,$VG1),o($VQ7,$VH1),o($VQ7,$VI1),o($VQ7,$VJ1),o($VS7,$VK1),o($VL1,$VM1,{162:4038}),o($VU7,$VO1),{119:[1,4039],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($VT7,$VE1),o($VT7,$VF1),{19:[1,4043],21:[1,4047],22:4041,33:4040,200:4042,214:4044,215:[1,4046],216:[1,4045]},{100:[1,4048]},o($VQ7,$VT1),o($VS7,$Vn),o($VS7,$Vo),{100:[1,4050],106:4049,108:[1,4051],109:[1,4052],110:4053,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4054]},o($VS7,$Vp),o($VS7,$Vq),o($V77,$VL7),o($V77,$VM7,{74:4055,76:4056,78:4057,44:4058,118:4059,79:[1,4060],80:[1,4061],81:[1,4062],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($V77,$VN7),o($V77,$VM5,{77:4063,73:4064,92:4065,94:4066,95:4070,99:4071,96:[1,4067],97:[1,4068],98:[1,4069],101:$Vm9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:4073,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($V77,$VP7),o($VQ7,$Vy1,{93:4074}),o($VR7,$Vz1,{99:3651,95:4075,101:$V_8,102:$VR,103:$VS,104:$VT}),o($VS7,$VB1,{86:4076}),o($VS7,$VB1,{86:4077}),o($VS7,$VB1,{86:4078}),o($V77,$VC1,{105:3655,107:3656,91:4079,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VT7,$VS5),o($VT7,$VT5),o($VQ7,$VG1),o($VQ7,$VH1),o($VQ7,$VI1),o($VQ7,$VJ1),o($VS7,$VK1),o($VL1,$VM1,{162:4080}),o($VU7,$VO1),{119:[1,4081],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($VT7,$VE1),o($VT7,$VF1),{19:[1,4085],21:[1,4089],22:4083,33:4082,200:4084,214:4086,215:[1,4088],216:[1,4087]},{100:[1,4090]},o($VQ7,$VT1),o($VS7,$Vn),o($VS7,$Vo),{100:[1,4092],106:4091,108:[1,4093],109:[1,4094],110:4095,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4096]},o($VS7,$Vp),o($VS7,$Vq),{121:[1,4097]},o($Vo8,$VQ3),o($VS7,$V23),o($VS7,$V33),o($VS7,$V43),o($VS7,$V53),o($VS7,$V63),{111:[1,4098]},o($VS7,$Vb3),o($VT7,$Vr5),o($VU7,$VV5),o($VU7,$VK1),o($VU7,$Vn),o($VU7,$Vo),o($VU7,$Vp),o($VU7,$Vq),o($Vn9,$Vp2,{83:4099,84:4100,192:4101,190:$Vo9}),o($Vw8,$Vj8),o($Vr,$Vs,{55:4103,59:4104,40:4105,43:$Vt}),o($Vx8,$Vk8),o($Vr,$Vs,{59:4106,40:4107,43:$Vt}),o($Vx8,$Vl8),o($Vx8,$Vm8),o($Vx8,$VS5),o($Vx8,$VT5),{119:[1,4108],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($Vx8,$VE1),o($Vx8,$VF1),{19:[1,4112],21:[1,4116],22:4110,33:4109,200:4111,214:4113,215:[1,4115],216:[1,4114]},o($Vx8,$Vn8),o($Vx8,$Vu6),o($Vp9,$Vy1,{93:4117}),o($Vx8,$Vz1,{99:3696,95:4118,101:$V19,102:$VR,103:$VS,104:$VT}),o($Vp9,$VG1),o($Vp9,$VH1),o($Vp9,$VI1),o($Vp9,$VJ1),{100:[1,4119]},o($Vp9,$VT1),{70:[1,4120]},o($V39,$Vs2,{99:3194,95:4121,101:$Vy8,102:$VR,103:$VS,104:$VT}),o($V29,$Vt2),o($Vx8,$Vu2,{90:4122,95:4123,91:4124,99:4125,105:4127,107:4128,101:$Vq9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vx8,$Vw2,{90:4122,95:4123,91:4124,99:4125,105:4127,107:4128,101:$Vq9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vx8,$Vx2,{90:4122,95:4123,91:4124,99:4125,105:4127,107:4128,101:$Vq9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V69,$Vy2),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,4129],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4130,121:$VW2,148:$VX2,189:$VY2}),o($V59,$VA2),o($V59,$Vw),o($V59,$Vx),o($V59,$Vn),o($V59,$Vo),o($V59,$Vy),o($V59,$Vp),o($V59,$Vq),o($V29,$V23),o($V69,$V33),o($V69,$V43),o($V69,$V53),o($V69,$V63),{111:[1,4131]},o($V69,$Vb3),o($Vn9,$Vp2,{84:4100,192:4101,83:4132,190:$Vo9}),o($Vr4,$VK5),o($VI,$VJ,{76:4133,78:4134,44:4135,118:4136,79:[1,4137],80:[1,4138],81:[1,4139]}),o($Vr4,$VL5),o($Vr4,$VM5,{77:4140,73:4141,92:4142,94:4143,95:4147,99:4148,96:[1,4144],97:[1,4145],98:[1,4146],101:$Vr9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:4150,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($Vr4,$VO5),o($VQ5,$VB1,{86:4151}),o($VQ5,$VB1,{86:4152}),o($VQ5,$VB1,{86:4153}),o($Vr4,$VC1,{105:3744,107:3745,91:4154,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VR5,$VS5),o($VR5,$VT5),o($VQ5,$VK1),o($VL1,$VM1,{162:4155}),o($VU5,$VO1),{119:[1,4156],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($VR5,$VE1),o($VR5,$VF1),{19:[1,4160],21:[1,4164],22:4158,33:4157,200:4159,214:4161,215:[1,4163],216:[1,4162]},o($VQ5,$Vn),o($VQ5,$Vo),{100:[1,4166],106:4165,108:[1,4167],109:[1,4168],110:4169,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4170]},o($VQ5,$Vp),o($VQ5,$Vq),{121:[1,4171]},o($Vv6,$VQ3),o($VQ5,$V23),o($VQ5,$V33),o($VQ5,$V43),o($VQ5,$V53),o($VQ5,$V63),{111:[1,4172]},o($VQ5,$Vb3),o($VR5,$Vr5),o($VU5,$VV5),o($VU5,$VK1),o($VU5,$Vn),o($VU5,$Vo),o($VU5,$Vp),o($VU5,$Vq),{121:[1,4173]},o($Vv6,$VQ3),o($VQ5,$V23),o($VQ5,$V33),o($VQ5,$V43),o($VQ5,$V53),o($VQ5,$V63),{111:[1,4174]},o($VQ5,$Vb3),o($VR5,$Vr5),o($VU5,$VV5),o($VU5,$VK1),o($VU5,$Vn),o($VU5,$Vo),o($VU5,$Vp),o($VU5,$Vq),o($Vq2,$Vp2,{84:3800,192:3801,83:4175,190:$V79}),o($VG,$VA2),o($VG,$Vw),o($VG,$Vx),o($VG,$Vn),o($VG,$Vo),o($VG,$Vy),o($VG,$Vp),o($VG,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4176,121:$VW2,148:$VX2,189:$VY2}),o($Vq2,$Vp2,{84:3800,192:3801,83:4177,190:$V79}),o($Vt1,$Vs2,{99:3275,95:4178,101:$VB8,102:$VR,103:$VS,104:$VT}),o($Vh2,$Vt2),o($Vh2,$V23),o($VG,$Vx3),o($VH3,$VI3),o($Vr1,$VJ3),o($VH3,$VK3,{31:4179,193:[1,4180]}),{19:$VL3,21:$VM3,22:640,129:4181,199:$VN3,214:643,215:$VO3},o($VG,$VP3),o($Vt1,$VJ3),o($VG,$VK3,{31:4182,193:[1,4183]}),{19:$VL3,21:$VM3,22:640,129:4184,199:$VN3,214:643,215:$VO3},o($Vx1,$VQ3),o($VA1,$VR3),o($VA1,$VS3),o($VA1,$VT3),{100:[1,4185]},o($VA1,$VT1),{100:[1,4187],106:4186,108:[1,4188],109:[1,4189],110:4190,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4191]},o($Vu1,$VU3),o($VD1,$VJ3),o($Vu1,$VK3,{31:4192,193:[1,4193]}),{19:$VL3,21:$VM3,22:640,129:4194,199:$VN3,214:643,215:$VO3},o($VA1,$VV3),{121:[1,4195]},{19:[1,4198],21:[1,4201],22:4197,87:4196,214:4199,215:[1,4200]},o($Vo2,$V71),o($Vo2,$V81),o($Vo2,$V91),o($Vr1,$Vp5),o($Vr1,$Vq5),{19:$VC8,21:$VD8,22:4203,87:4202,214:3310,215:$VE8},o($Vq2,$V71),o($Vq2,$V81),o($Vq2,$V91),o($Vt1,$Vp5),o($Vt1,$Vq5),{19:$VF8,21:$VG8,22:4205,87:4204,214:3336,215:$VH8},o($VA1,$VV5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($Vz2,$V71),o($Vz2,$V81),o($Vz2,$V91),o($VD1,$Vp5),o($VD1,$Vq5),{19:$VI8,21:$VJ8,22:4207,87:4206,214:3363,215:$VK8},o($Vo2,$V71),o($Vo2,$V81),o($Vo2,$V91),o($Vr1,$Vp5),o($Vr1,$Vq5),{19:$VL8,21:$VM8,22:4209,87:4208,214:3390,215:$VN8},o($Vq2,$V71),o($Vq2,$V81),o($Vq2,$V91),o($Vt1,$Vp5),o($Vt1,$Vq5),{19:$VO8,21:$VP8,22:4211,87:4210,214:3416,215:$VQ8},o($VA1,$VV5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($Vz2,$V71),o($Vz2,$V81),o($Vz2,$V91),o($VD1,$Vp5),o($VD1,$Vq5),{19:$VR8,21:$VS8,22:4213,87:4212,214:3443,215:$VT8},o($Vt1,$Vr5),{193:[1,4216],194:4214,195:[1,4215]},o($Vr1,$V56),o($Vr1,$V66),o($Vr1,$V76),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VY3),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V$3),o($Vr1,$V04,{202:4217,203:4218,111:[1,4219]}),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($V86,$V73),o($V86,$V83),o($V86,$V93),o($V86,$Va3),{193:[1,4222],194:4220,195:[1,4221]},o($Vt1,$V56),o($Vt1,$V66),o($Vt1,$V76),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VY3),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V$3),o($Vt1,$V04,{202:4223,203:4224,111:[1,4225]}),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($V96,$V73),o($V96,$V83),o($V96,$V93),o($V96,$Va3),{19:[1,4228],21:[1,4231],22:4227,87:4226,214:4229,215:[1,4230]},{193:[1,4234],194:4232,195:[1,4233]},o($VD1,$V56),o($VD1,$V66),o($VD1,$V76),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VY3),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V$3),o($VD1,$V04,{202:4235,203:4236,111:[1,4237]}),o($VD1,$V14),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($Va6,$V73),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($Vy3,$VU3),{121:[1,4238]},o($Vy3,$VI3),o($VN4,$VQ3),o($VO4,$VV4),{19:$Vi,21:$Vj,22:4239,214:45,215:$Vk},{19:$Vs9,21:$Vt9,22:4241,100:[1,4252],108:[1,4253],109:[1,4254],110:4251,181:4242,191:4240,196:4245,197:4246,198:4247,201:4250,204:[1,4255],205:[1,4256],206:[1,4261],207:[1,4262],208:[1,4263],209:[1,4264],210:[1,4257],211:[1,4258],212:[1,4259],213:[1,4260],214:4244,215:$Vu9},o($VP4,$VV4),{19:$Vi,21:$Vj,22:4265,214:45,215:$Vk},{19:$Vv9,21:$Vw9,22:4267,100:[1,4278],108:[1,4279],109:[1,4280],110:4277,181:4268,191:4266,196:4271,197:4272,198:4273,201:4276,204:[1,4281],205:[1,4282],206:[1,4287],207:[1,4288],208:[1,4289],209:[1,4290],210:[1,4283],211:[1,4284],212:[1,4285],213:[1,4286],214:4270,215:$Vx9},o($VE3,$V23),o($VE3,$V33),o($VE3,$V43),o($VE3,$V53),o($VE3,$V63),{111:[1,4291]},o($VE3,$Vb3),o($VR4,$VV4),{19:$Vi,21:$Vj,22:4292,214:45,215:$Vk},{19:$Vy9,21:$Vz9,22:4294,100:[1,4305],108:[1,4306],109:[1,4307],110:4304,181:4295,191:4293,196:4298,197:4299,198:4300,201:4303,204:[1,4308],205:[1,4309],206:[1,4314],207:[1,4315],208:[1,4316],209:[1,4317],210:[1,4310],211:[1,4311],212:[1,4312],213:[1,4313],214:4297,215:$VA9},o($VC3,$Vr5),o($VF3,$VV5),o($VF3,$VK1),o($VF3,$Vn),o($VF3,$Vo),o($VF3,$Vp),o($VF3,$Vq),o($VA3,$Vf6),o($VA3,$VK1),o($VB3,$Vf6),o($VB3,$VK1),o($VC3,$Vf6),o($VC3,$VK1),o($VA3,$Vf6),o($VA3,$VK1),o($VB3,$Vf6),o($VB3,$VK1),o($VC3,$Vf6),o($VC3,$VK1),{193:[1,4320],194:4318,195:[1,4319]},o($VZ6,$V56),o($VZ6,$V66),o($VZ6,$V76),o($VZ6,$Vn),o($VZ6,$Vo),o($VZ6,$VY3),o($VZ6,$VZ3),o($VZ6,$V_3),o($VZ6,$Vp),o($VZ6,$Vq),o($VZ6,$V$3),o($VZ6,$V04,{202:4321,203:4322,111:[1,4323]}),o($VZ6,$V14),o($VZ6,$V24),o($VZ6,$V34),o($VZ6,$V44),o($VZ6,$V54),o($VZ6,$V64),o($VZ6,$V74),o($VZ6,$V84),o($VZ6,$V94),o($VB9,$V73),o($VB9,$V83),o($VB9,$V93),o($VB9,$Va3),o($V77,$Vk8),o($Vr,$Vs,{59:4324,40:4325,43:$Vt}),o($V77,$Vl8),o($V77,$Vm8),o($V77,$VS5),o($V77,$VT5),{119:[1,4326],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($V77,$VE1),o($V77,$VF1),{19:[1,4330],21:[1,4334],22:4328,33:4327,200:4329,214:4331,215:[1,4333],216:[1,4332]},o($V77,$Vn8),o($V77,$Vu6),o($Vo8,$Vy1,{93:4335}),o($V77,$Vz1,{99:4029,95:4336,101:$Vl9,102:$VR,103:$VS,104:$VT}),o($Vo8,$VG1),o($Vo8,$VH1),o($Vo8,$VI1),o($Vo8,$VJ1),{100:[1,4337]},o($Vo8,$VT1),{70:[1,4338]},o($VR7,$Vs2,{99:3618,95:4339,101:$VY8,102:$VR,103:$VS,104:$VT}),o($VQ7,$Vt2),o($V77,$Vu2,{90:4340,95:4341,91:4342,99:4343,105:4345,107:4346,101:$VC9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V77,$Vw2,{90:4340,95:4341,91:4342,99:4343,105:4345,107:4346,101:$VC9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V77,$Vx2,{90:4340,95:4341,91:4342,99:4343,105:4345,107:4346,101:$VC9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VU7,$Vy2),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,4347],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4348,121:$VW2,148:$VX2,189:$VY2}),o($VT7,$VA2),o($VT7,$Vw),o($VT7,$Vx),o($VT7,$Vn),o($VT7,$Vo),o($VT7,$Vy),o($VT7,$Vp),o($VT7,$Vq),o($VQ7,$V23),o($VU7,$V33),o($VU7,$V43),o($VU7,$V53),o($VU7,$V63),{111:[1,4349]},o($VU7,$Vb3),o($V77,$Vl8),o($V77,$Vm8),o($V77,$VS5),o($V77,$VT5),{119:[1,4350],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($V77,$VE1),o($V77,$VF1),{19:[1,4354],21:[1,4358],22:4352,33:4351,200:4353,214:4355,215:[1,4357],216:[1,4356]},o($V77,$Vn8),o($V77,$Vu6),o($Vo8,$Vy1,{93:4359}),o($V77,$Vz1,{99:4071,95:4360,101:$Vm9,102:$VR,103:$VS,104:$VT}),o($Vo8,$VG1),o($Vo8,$VH1),o($Vo8,$VI1),o($Vo8,$VJ1),{100:[1,4361]},o($Vo8,$VT1),{70:[1,4362]},o($VR7,$Vs2,{99:3651,95:4363,101:$V_8,102:$VR,103:$VS,104:$VT}),o($VQ7,$Vt2),o($V77,$Vu2,{90:4364,95:4365,91:4366,99:4367,105:4369,107:4370,101:$VD9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V77,$Vw2,{90:4364,95:4365,91:4366,99:4367,105:4369,107:4370,101:$VD9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V77,$Vx2,{90:4364,95:4365,91:4366,99:4367,105:4369,107:4370,101:$VD9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VU7,$Vy2),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,4371],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4372,121:$VW2,148:$VX2,189:$VY2}),o($VT7,$VA2),o($VT7,$Vw),o($VT7,$Vx),o($VT7,$Vn),o($VT7,$Vo),o($VT7,$Vy),o($VT7,$Vp),o($VT7,$Vq),o($VQ7,$V23),o($VU7,$V33),o($VU7,$V43),o($VU7,$V53),o($VU7,$V63),{111:[1,4373]},o($VU7,$Vb3),o($V77,$Vr5),{19:[1,4376],21:[1,4379],22:4375,87:4374,214:4377,215:[1,4378]},o($Vq6,$VW8),o($Vq8,$VJ3),o($Vq6,$VK3,{31:4380,193:[1,4381]}),{19:$VL3,21:$VM3,22:640,129:4382,199:$VN3,214:643,215:$VO3},o($Vw8,$VX8),o($Vx8,$V87,{60:4383}),o($VI,$VJ,{63:4384,73:4385,75:4386,76:4387,92:4390,94:4391,87:4393,88:4394,89:4395,78:4396,44:4397,95:4401,22:4402,91:4404,118:4405,99:4409,214:4412,105:4413,107:4414,19:[1,4411],21:[1,4416],69:[1,4388],71:[1,4389],79:[1,4406],80:[1,4407],81:[1,4408],85:[1,4392],96:[1,4398],97:[1,4399],98:[1,4400],101:$VE9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,4403],215:[1,4415]}),o($Vx8,$VZ8),o($VI,$VJ,{63:4417,73:4418,75:4419,76:4420,92:4423,94:4424,87:4426,88:4427,89:4428,78:4429,44:4430,95:4434,22:4435,91:4437,118:4438,99:4442,214:4445,105:4446,107:4447,19:[1,4444],21:[1,4449],69:[1,4421],71:[1,4422],79:[1,4439],80:[1,4440],81:[1,4441],85:[1,4425],96:[1,4431],97:[1,4432],98:[1,4433],101:$VF9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,4436],215:[1,4448]}),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4450,121:$VW2,148:$VX2,189:$VY2}),o($Vx8,$VA2),o($Vx8,$Vw),o($Vx8,$Vx),o($Vx8,$Vn),o($Vx8,$Vo),o($Vx8,$Vy),o($Vx8,$Vp),o($Vx8,$Vq),o($Vx8,$Vs2,{99:3696,95:4451,101:$V19,102:$VR,103:$VS,104:$VT}),o($Vp9,$Vt2),o($Vp9,$V23),o($Vx8,$V$8),o($V29,$VQ3),o($V49,$VR3),o($V49,$VS3),o($V49,$VT3),{100:[1,4452]},o($V49,$VT1),{100:[1,4454],106:4453,108:[1,4455],109:[1,4456],110:4457,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4458]},o($V49,$VV3),{121:[1,4459]},{19:[1,4462],21:[1,4465],22:4461,87:4460,214:4463,215:[1,4464]},o($Vq6,$V09),o($Vr4,$Vs6),o($Vr4,$VS5),o($Vr4,$VT5),{119:[1,4466],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($Vr4,$VE1),o($Vr4,$VF1),{19:[1,4470],21:[1,4474],22:4468,33:4467,200:4469,214:4471,215:[1,4473],216:[1,4472]},o($Vr4,$Vt6),o($Vr4,$Vu6),o($Vv6,$Vy1,{93:4475}),o($Vr4,$Vz1,{99:4148,95:4476,101:$Vr9,102:$VR,103:$VS,104:$VT}),o($Vv6,$VG1),o($Vv6,$VH1),o($Vv6,$VI1),o($Vv6,$VJ1),{100:[1,4477]},o($Vv6,$VT1),{70:[1,4478]},o($Vr4,$Vu2,{90:4479,95:4480,91:4481,99:4482,105:4484,107:4485,101:$VG9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vr4,$Vw2,{90:4479,95:4480,91:4481,99:4482,105:4484,107:4485,101:$VG9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vr4,$Vx2,{90:4479,95:4480,91:4481,99:4482,105:4484,107:4485,101:$VG9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VU5,$Vy2),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,4486],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4487,121:$VW2,148:$VX2,189:$VY2}),o($VR5,$VA2),o($VR5,$Vw),o($VR5,$Vx),o($VR5,$Vn),o($VR5,$Vo),o($VR5,$Vy),o($VR5,$Vp),o($VR5,$Vq),o($VU5,$V33),o($VU5,$V43),o($VU5,$V53),o($VU5,$V63),{111:[1,4488]},o($VU5,$Vb3),o($Vr4,$Vr5),{19:[1,4491],21:[1,4494],22:4490,87:4489,214:4492,215:[1,4493]},o($Vr4,$Vr5),{19:[1,4497],21:[1,4500],22:4496,87:4495,214:4498,215:[1,4499]},o($VG,$VU3),{121:[1,4501]},o($VG,$VI3),o($Vh2,$VQ3),o($Vo2,$VV4),{19:$Vi,21:$Vj,22:4502,214:45,215:$Vk},{19:$VH9,21:$VI9,22:4504,100:[1,4515],108:[1,4516],109:[1,4517],110:4514,181:4505,191:4503,196:4508,197:4509,198:4510,201:4513,204:[1,4518],205:[1,4519],206:[1,4524],207:[1,4525],208:[1,4526],209:[1,4527],210:[1,4520],211:[1,4521],212:[1,4522],213:[1,4523],214:4507,215:$VJ9},o($Vq2,$VV4),{19:$Vi,21:$Vj,22:4528,214:45,215:$Vk},{19:$VK9,21:$VL9,22:4530,100:[1,4541],108:[1,4542],109:[1,4543],110:4540,181:4531,191:4529,196:4534,197:4535,198:4536,201:4539,204:[1,4544],205:[1,4545],206:[1,4550],207:[1,4551],208:[1,4552],209:[1,4553],210:[1,4546],211:[1,4547],212:[1,4548],213:[1,4549],214:4533,215:$VM9},o($VA1,$V23),o($VA1,$V33),o($VA1,$V43),o($VA1,$V53),o($VA1,$V63),{111:[1,4554]},o($VA1,$Vb3),o($Vz2,$VV4),{19:$Vi,21:$Vj,22:4555,214:45,215:$Vk},{19:$VN9,21:$VO9,22:4557,100:[1,4568],108:[1,4569],109:[1,4570],110:4567,181:4558,191:4556,196:4561,197:4562,198:4563,201:4566,204:[1,4571],205:[1,4572],206:[1,4577],207:[1,4578],208:[1,4579],209:[1,4580],210:[1,4573],211:[1,4574],212:[1,4575],213:[1,4576],214:4560,215:$VP9},o($VD1,$Vr5),o($VN1,$VV5),o($VN1,$VK1),o($VN1,$Vn),o($VN1,$Vo),o($VN1,$Vp),o($VN1,$Vq),o($Vr1,$Vf6),o($Vr1,$VK1),o($Vt1,$Vf6),o($Vt1,$VK1),o($VD1,$Vf6),o($VD1,$VK1),o($Vr1,$Vf6),o($Vr1,$VK1),o($Vt1,$Vf6),o($Vt1,$VK1),o($VD1,$Vf6),o($VD1,$VK1),o($Vo2,$V71),o($Vo2,$V81),o($Vo2,$V91),o($Vr1,$Vp5),o($Vr1,$Vq5),{19:$V99,21:$Va9,22:4582,87:4581,214:3872,215:$Vb9},o($Vq2,$V71),o($Vq2,$V81),o($Vq2,$V91),o($Vt1,$Vp5),o($Vt1,$Vq5),{19:$Vc9,21:$Vd9,22:4584,87:4583,214:3898,215:$Ve9},o($VA1,$VV5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($Vz2,$V71),o($Vz2,$V81),o($Vz2,$V91),o($VD1,$Vp5),o($VD1,$Vq5),{19:$Vf9,21:$Vg9,22:4586,87:4585,214:3925,215:$Vh9},o($VB3,$Vr5),{193:[1,4589],194:4587,195:[1,4588]},o($VA3,$V56),o($VA3,$V66),o($VA3,$V76),o($VA3,$Vn),o($VA3,$Vo),o($VA3,$VY3),o($VA3,$VZ3),o($VA3,$V_3),o($VA3,$Vp),o($VA3,$Vq),o($VA3,$V$3),o($VA3,$V04,{202:4590,203:4591,111:[1,4592]}),o($VA3,$V14),o($VA3,$V24),o($VA3,$V34),o($VA3,$V44),o($VA3,$V54),o($VA3,$V64),o($VA3,$V74),o($VA3,$V84),o($VA3,$V94),o($VA7,$V73),o($VA7,$V83),o($VA7,$V93),o($VA7,$Va3),{193:[1,4595],194:4593,195:[1,4594]},o($VB3,$V56),o($VB3,$V66),o($VB3,$V76),o($VB3,$Vn),o($VB3,$Vo),o($VB3,$VY3),o($VB3,$VZ3),o($VB3,$V_3),o($VB3,$Vp),o($VB3,$Vq),o($VB3,$V$3),o($VB3,$V04,{202:4596,203:4597,111:[1,4598]}),o($VB3,$V14),o($VB3,$V24),o($VB3,$V34),o($VB3,$V44),o($VB3,$V54),o($VB3,$V64),o($VB3,$V74),o($VB3,$V84),o($VB3,$V94),o($VB7,$V73),o($VB7,$V83),o($VB7,$V93),o($VB7,$Va3),{19:[1,4601],21:[1,4604],22:4600,87:4599,214:4602,215:[1,4603]},{193:[1,4607],194:4605,195:[1,4606]},o($VC3,$V56),o($VC3,$V66),o($VC3,$V76),o($VC3,$Vn),o($VC3,$Vo),o($VC3,$VY3),o($VC3,$VZ3),o($VC3,$V_3),o($VC3,$Vp),o($VC3,$Vq),o($VC3,$V$3),o($VC3,$V04,{202:4608,203:4609,111:[1,4610]}),o($VC3,$V14),o($VC3,$V24),o($VC3,$V34),o($VC3,$V44),o($VC3,$V54),o($VC3,$V64),o($VC3,$V74),o($VC3,$V84),o($VC3,$V94),o($VC7,$V73),o($VC7,$V83),o($VC7,$V93),o($VC7,$Va3),o($Vh8,$V71),o($Vh8,$V81),o($Vh8,$V91),o($VZ6,$Vp5),o($VZ6,$Vq5),{19:$Vi9,21:$Vj9,22:4612,87:4611,214:3990,215:$Vk9},o($V77,$VZ8),o($VI,$VJ,{63:4613,73:4614,75:4615,76:4616,92:4619,94:4620,87:4622,88:4623,89:4624,78:4625,44:4626,95:4630,22:4631,91:4633,118:4634,99:4638,214:4641,105:4642,107:4643,19:[1,4640],21:[1,4645],69:[1,4617],71:[1,4618],79:[1,4635],80:[1,4636],81:[1,4637],85:[1,4621],96:[1,4627],97:[1,4628],98:[1,4629],101:$VQ9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,4632],215:[1,4644]}),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4646,121:$VW2,148:$VX2,189:$VY2}),o($V77,$VA2),o($V77,$Vw),o($V77,$Vx),o($V77,$Vn),o($V77,$Vo),o($V77,$Vy),o($V77,$Vp),o($V77,$Vq),o($V77,$Vs2,{99:4029,95:4647,101:$Vl9,102:$VR,103:$VS,104:$VT}),o($Vo8,$Vt2),o($Vo8,$V23),o($V77,$V$8),o($VQ7,$VQ3),o($VS7,$VR3),o($VS7,$VS3),o($VS7,$VT3),{100:[1,4648]},o($VS7,$VT1),{100:[1,4650],106:4649,108:[1,4651],109:[1,4652],110:4653,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4654]},o($VS7,$VV3),{121:[1,4655]},{19:[1,4658],21:[1,4661],22:4657,87:4656,214:4659,215:[1,4660]},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4662,121:$VW2,148:$VX2,189:$VY2}),o($V77,$VA2),o($V77,$Vw),o($V77,$Vx),o($V77,$Vn),o($V77,$Vo),o($V77,$Vy),o($V77,$Vp),o($V77,$Vq),o($V77,$Vs2,{99:4071,95:4663,101:$Vm9,102:$VR,103:$VS,104:$VT}),o($Vo8,$Vt2),o($Vo8,$V23),o($V77,$V$8),o($VQ7,$VQ3),o($VS7,$VR3),o($VS7,$VS3),o($VS7,$VT3),{100:[1,4664]},o($VS7,$VT1),{100:[1,4666],106:4665,108:[1,4667],109:[1,4668],110:4669,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4670]},o($VS7,$VV3),{121:[1,4671]},{19:[1,4674],21:[1,4677],22:4673,87:4672,214:4675,215:[1,4676]},o($VS7,$VV5),o($VS7,$VK1),o($VS7,$Vn),o($VS7,$Vo),o($VS7,$Vp),o($VS7,$Vq),o($Vn9,$VV4),{19:$Vi,21:$Vj,22:4678,214:45,215:$Vk},{19:$VR9,21:$VS9,22:4680,100:[1,4691],108:[1,4692],109:[1,4693],110:4690,181:4681,191:4679,196:4684,197:4685,198:4686,201:4689,204:[1,4694],205:[1,4695],206:[1,4700],207:[1,4701],208:[1,4702],209:[1,4703],210:[1,4696],211:[1,4697],212:[1,4698],213:[1,4699],214:4683,215:$VT9},o($Vw8,$VK7,{61:4704,53:[1,4705]}),o($Vx8,$VL7),o($Vx8,$VM7,{74:4706,76:4707,78:4708,44:4709,118:4710,79:[1,4711],80:[1,4712],81:[1,4713],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($Vx8,$VN7),o($Vx8,$VM5,{77:4714,73:4715,92:4716,94:4717,95:4721,99:4722,96:[1,4718],97:[1,4719],98:[1,4720],101:$VU9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:4724,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($Vx8,$VP7),o($V29,$Vy1,{93:4725}),o($V39,$Vz1,{99:4409,95:4726,101:$VE9,102:$VR,103:$VS,104:$VT}),o($V49,$VB1,{86:4727}),o($V49,$VB1,{86:4728}),o($V49,$VB1,{86:4729}),o($Vx8,$VC1,{105:4413,107:4414,91:4730,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V59,$VS5),o($V59,$VT5),o($V29,$VG1),o($V29,$VH1),o($V29,$VI1),o($V29,$VJ1),o($V49,$VK1),o($VL1,$VM1,{162:4731}),o($V69,$VO1),{119:[1,4732],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($V59,$VE1),o($V59,$VF1),{19:[1,4736],21:[1,4740],22:4734,33:4733,200:4735,214:4737,215:[1,4739],216:[1,4738]},{100:[1,4741]},o($V29,$VT1),o($V49,$Vn),o($V49,$Vo),{100:[1,4743],106:4742,108:[1,4744],109:[1,4745],110:4746,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4747]},o($V49,$Vp),o($V49,$Vq),o($Vx8,$VL7),o($Vx8,$VM7,{74:4748,76:4749,78:4750,44:4751,118:4752,79:[1,4753],80:[1,4754],81:[1,4755],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($Vx8,$VN7),o($Vx8,$VM5,{77:4756,73:4757,92:4758,94:4759,95:4763,99:4764,96:[1,4760],97:[1,4761],98:[1,4762],101:$VV9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:4766,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($Vx8,$VP7),o($V29,$Vy1,{93:4767}),o($V39,$Vz1,{99:4442,95:4768,101:$VF9,102:$VR,103:$VS,104:$VT}),o($V49,$VB1,{86:4769}),o($V49,$VB1,{86:4770}),o($V49,$VB1,{86:4771}),o($Vx8,$VC1,{105:4446,107:4447,91:4772,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V59,$VS5),o($V59,$VT5),o($V29,$VG1),o($V29,$VH1),o($V29,$VI1),o($V29,$VJ1),o($V49,$VK1),o($VL1,$VM1,{162:4773}),o($V69,$VO1),{119:[1,4774],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($V59,$VE1),o($V59,$VF1),{19:[1,4778],21:[1,4782],22:4776,33:4775,200:4777,214:4779,215:[1,4781],216:[1,4780]},{100:[1,4783]},o($V29,$VT1),o($V49,$Vn),o($V49,$Vo),{100:[1,4785],106:4784,108:[1,4786],109:[1,4787],110:4788,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4789]},o($V49,$Vp),o($V49,$Vq),{121:[1,4790]},o($Vp9,$VQ3),o($V49,$V23),o($V49,$V33),o($V49,$V43),o($V49,$V53),o($V49,$V63),{111:[1,4791]},o($V49,$Vb3),o($V59,$Vr5),o($V69,$VV5),o($V69,$VK1),o($V69,$Vn),o($V69,$Vo),o($V69,$Vp),o($V69,$Vq),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4792,121:$VW2,148:$VX2,189:$VY2}),o($Vr4,$VA2),o($Vr4,$Vw),o($Vr4,$Vx),o($Vr4,$Vn),o($Vr4,$Vo),o($Vr4,$Vy),o($Vr4,$Vp),o($Vr4,$Vq),o($Vr4,$Vs2,{99:4148,95:4793,101:$Vr9,102:$VR,103:$VS,104:$VT}),o($Vv6,$Vt2),o($Vv6,$V23),o($Vr4,$Vb7),o($VQ5,$VR3),o($VQ5,$VS3),o($VQ5,$VT3),{100:[1,4794]},o($VQ5,$VT1),{100:[1,4796],106:4795,108:[1,4797],109:[1,4798],110:4799,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4800]},o($VQ5,$VV3),{121:[1,4801]},{19:[1,4804],21:[1,4807],22:4803,87:4802,214:4805,215:[1,4806]},o($VQ5,$VV5),o($VQ5,$VK1),o($VQ5,$Vn),o($VQ5,$Vo),o($VQ5,$Vp),o($VQ5,$Vq),o($VQ5,$VV5),o($VQ5,$VK1),o($VQ5,$Vn),o($VQ5,$Vo),o($VQ5,$Vp),o($VQ5,$Vq),o($Vt1,$Vr5),{193:[1,4810],194:4808,195:[1,4809]},o($Vr1,$V56),o($Vr1,$V66),o($Vr1,$V76),o($Vr1,$Vn),o($Vr1,$Vo),o($Vr1,$VY3),o($Vr1,$VZ3),o($Vr1,$V_3),o($Vr1,$Vp),o($Vr1,$Vq),o($Vr1,$V$3),o($Vr1,$V04,{202:4811,203:4812,111:[1,4813]}),o($Vr1,$V14),o($Vr1,$V24),o($Vr1,$V34),o($Vr1,$V44),o($Vr1,$V54),o($Vr1,$V64),o($Vr1,$V74),o($Vr1,$V84),o($Vr1,$V94),o($V86,$V73),o($V86,$V83),o($V86,$V93),o($V86,$Va3),{193:[1,4816],194:4814,195:[1,4815]},o($Vt1,$V56),o($Vt1,$V66),o($Vt1,$V76),o($Vt1,$Vn),o($Vt1,$Vo),o($Vt1,$VY3),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$Vp),o($Vt1,$Vq),o($Vt1,$V$3),o($Vt1,$V04,{202:4817,203:4818,111:[1,4819]}),o($Vt1,$V14),o($Vt1,$V24),o($Vt1,$V34),o($Vt1,$V44),o($Vt1,$V54),o($Vt1,$V64),o($Vt1,$V74),o($Vt1,$V84),o($Vt1,$V94),o($V96,$V73),o($V96,$V83),o($V96,$V93),o($V96,$Va3),{19:[1,4822],21:[1,4825],22:4821,87:4820,214:4823,215:[1,4824]},{193:[1,4828],194:4826,195:[1,4827]},o($VD1,$V56),o($VD1,$V66),o($VD1,$V76),o($VD1,$Vn),o($VD1,$Vo),o($VD1,$VY3),o($VD1,$VZ3),o($VD1,$V_3),o($VD1,$Vp),o($VD1,$Vq),o($VD1,$V$3),o($VD1,$V04,{202:4829,203:4830,111:[1,4831]}),o($VD1,$V14),o($VD1,$V24),o($VD1,$V34),o($VD1,$V44),o($VD1,$V54),o($VD1,$V64),o($VD1,$V74),o($VD1,$V84),o($VD1,$V94),o($Va6,$V73),o($Va6,$V83),o($Va6,$V93),o($Va6,$Va3),o($Vr1,$Vf6),o($Vr1,$VK1),o($Vt1,$Vf6),o($Vt1,$VK1),o($VD1,$Vf6),o($VD1,$VK1),o($VO4,$V71),o($VO4,$V81),o($VO4,$V91),o($VA3,$Vp5),o($VA3,$Vq5),{19:$Vs9,21:$Vt9,22:4833,87:4832,214:4244,215:$Vu9},o($VP4,$V71),o($VP4,$V81),o($VP4,$V91),o($VB3,$Vp5),o($VB3,$Vq5),{19:$Vv9,21:$Vw9,22:4835,87:4834,214:4270,215:$Vx9},o($VE3,$VV5),o($VE3,$VK1),o($VE3,$Vn),o($VE3,$Vo),o($VE3,$Vp),o($VE3,$Vq),o($VR4,$V71),o($VR4,$V81),o($VR4,$V91),o($VC3,$Vp5),o($VC3,$Vq5),{19:$Vy9,21:$Vz9,22:4837,87:4836,214:4297,215:$VA9},o($VZ6,$Vf6),o($VZ6,$VK1),o($V77,$VL7),o($V77,$VM7,{74:4838,76:4839,78:4840,44:4841,118:4842,79:[1,4843],80:[1,4844],81:[1,4845],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($V77,$VN7),o($V77,$VM5,{77:4846,73:4847,92:4848,94:4849,95:4853,99:4854,96:[1,4850],97:[1,4851],98:[1,4852],101:$VW9,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:4856,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($V77,$VP7),o($VQ7,$Vy1,{93:4857}),o($VR7,$Vz1,{99:4638,95:4858,101:$VQ9,102:$VR,103:$VS,104:$VT}),o($VS7,$VB1,{86:4859}),o($VS7,$VB1,{86:4860}),o($VS7,$VB1,{86:4861}),o($V77,$VC1,{105:4642,107:4643,91:4862,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VT7,$VS5),o($VT7,$VT5),o($VQ7,$VG1),o($VQ7,$VH1),o($VQ7,$VI1),o($VQ7,$VJ1),o($VS7,$VK1),o($VL1,$VM1,{162:4863}),o($VU7,$VO1),{119:[1,4864],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($VT7,$VE1),o($VT7,$VF1),{19:[1,4868],21:[1,4872],22:4866,33:4865,200:4867,214:4869,215:[1,4871],216:[1,4870]},{100:[1,4873]},o($VQ7,$VT1),o($VS7,$Vn),o($VS7,$Vo),{100:[1,4875],106:4874,108:[1,4876],109:[1,4877],110:4878,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,4879]},o($VS7,$Vp),o($VS7,$Vq),{121:[1,4880]},o($Vo8,$VQ3),o($VS7,$V23),o($VS7,$V33),o($VS7,$V43),o($VS7,$V53),o($VS7,$V63),{111:[1,4881]},o($VS7,$Vb3),o($VT7,$Vr5),o($VU7,$VV5),o($VU7,$VK1),o($VU7,$Vn),o($VU7,$Vo),o($VU7,$Vp),o($VU7,$Vq),{121:[1,4882]},o($Vo8,$VQ3),o($VS7,$V23),o($VS7,$V33),o($VS7,$V43),o($VS7,$V53),o($VS7,$V63),{111:[1,4883]},o($VS7,$Vb3),o($VT7,$Vr5),o($VU7,$VV5),o($VU7,$VK1),o($VU7,$Vn),o($VU7,$Vo),o($VU7,$Vp),o($VU7,$Vq),{193:[1,4886],194:4884,195:[1,4885]},o($Vq8,$V56),o($Vq8,$V66),o($Vq8,$V76),o($Vq8,$Vn),o($Vq8,$Vo),o($Vq8,$VY3),o($Vq8,$VZ3),o($Vq8,$V_3),o($Vq8,$Vp),o($Vq8,$Vq),o($Vq8,$V$3),o($Vq8,$V04,{202:4887,203:4888,111:[1,4889]}),o($Vq8,$V14),o($Vq8,$V24),o($Vq8,$V34),o($Vq8,$V44),o($Vq8,$V54),o($Vq8,$V64),o($Vq8,$V74),o($Vq8,$V84),o($Vq8,$V94),o($VX9,$V73),o($VX9,$V83),o($VX9,$V93),o($VX9,$Va3),o($Vx8,$Vk8),o($Vr,$Vs,{59:4890,40:4891,43:$Vt}),o($Vx8,$Vl8),o($Vx8,$Vm8),o($Vx8,$VS5),o($Vx8,$VT5),{119:[1,4892],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($Vx8,$VE1),o($Vx8,$VF1),{19:[1,4896],21:[1,4900],22:4894,33:4893,200:4895,214:4897,215:[1,4899],216:[1,4898]},o($Vx8,$Vn8),o($Vx8,$Vu6),o($Vp9,$Vy1,{93:4901}),o($Vx8,$Vz1,{99:4722,95:4902,101:$VU9,102:$VR,103:$VS,104:$VT}),o($Vp9,$VG1),o($Vp9,$VH1),o($Vp9,$VI1),o($Vp9,$VJ1),{100:[1,4903]},o($Vp9,$VT1),{70:[1,4904]},o($V39,$Vs2,{99:4409,95:4905,101:$VE9,102:$VR,103:$VS,104:$VT}),o($V29,$Vt2),o($Vx8,$Vu2,{90:4906,95:4907,91:4908,99:4909,105:4911,107:4912,101:$VY9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vx8,$Vw2,{90:4906,95:4907,91:4908,99:4909,105:4911,107:4912,101:$VY9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vx8,$Vx2,{90:4906,95:4907,91:4908,99:4909,105:4911,107:4912,101:$VY9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V69,$Vy2),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,4913],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4914,121:$VW2,148:$VX2,189:$VY2}),o($V59,$VA2),o($V59,$Vw),o($V59,$Vx),o($V59,$Vn),o($V59,$Vo),o($V59,$Vy),o($V59,$Vp),o($V59,$Vq),o($V29,$V23),o($V69,$V33),o($V69,$V43),o($V69,$V53),o($V69,$V63),{111:[1,4915]},o($V69,$Vb3),o($Vx8,$Vl8),o($Vx8,$Vm8),o($Vx8,$VS5),o($Vx8,$VT5),{119:[1,4916],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($Vx8,$VE1),o($Vx8,$VF1),{19:[1,4920],21:[1,4924],22:4918,33:4917,200:4919,214:4921,215:[1,4923],216:[1,4922]},o($Vx8,$Vn8),o($Vx8,$Vu6),o($Vp9,$Vy1,{93:4925}),o($Vx8,$Vz1,{99:4764,95:4926,101:$VV9,102:$VR,103:$VS,104:$VT}),o($Vp9,$VG1),o($Vp9,$VH1),o($Vp9,$VI1),o($Vp9,$VJ1),{100:[1,4927]},o($Vp9,$VT1),{70:[1,4928]},o($V39,$Vs2,{99:4442,95:4929,101:$VF9,102:$VR,103:$VS,104:$VT}),o($V29,$Vt2),o($Vx8,$Vu2,{90:4930,95:4931,91:4932,99:4933,105:4935,107:4936,101:$VZ9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vx8,$Vw2,{90:4930,95:4931,91:4932,99:4933,105:4935,107:4936,101:$VZ9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vx8,$Vx2,{90:4930,95:4931,91:4932,99:4933,105:4935,107:4936,101:$VZ9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V69,$Vy2),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,4937],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4938,121:$VW2,148:$VX2,189:$VY2}),o($V59,$VA2),o($V59,$Vw),o($V59,$Vx),o($V59,$Vn),o($V59,$Vo),o($V59,$Vy),o($V59,$Vp),o($V59,$Vq),o($V29,$V23),o($V69,$V33),o($V69,$V43),o($V69,$V53),o($V69,$V63),{111:[1,4939]},o($V69,$Vb3),o($Vx8,$Vr5),{19:[1,4942],21:[1,4945],22:4941,87:4940,214:4943,215:[1,4944]},{121:[1,4946]},o($Vv6,$VQ3),o($VQ5,$V23),o($VQ5,$V33),o($VQ5,$V43),o($VQ5,$V53),o($VQ5,$V63),{111:[1,4947]},o($VQ5,$Vb3),o($VR5,$Vr5),o($VU5,$VV5),o($VU5,$VK1),o($VU5,$Vn),o($VU5,$Vo),o($VU5,$Vp),o($VU5,$Vq),o($Vo2,$V71),o($Vo2,$V81),o($Vo2,$V91),o($Vr1,$Vp5),o($Vr1,$Vq5),{19:$VH9,21:$VI9,22:4949,87:4948,214:4507,215:$VJ9},o($Vq2,$V71),o($Vq2,$V81),o($Vq2,$V91),o($Vt1,$Vp5),o($Vt1,$Vq5),{19:$VK9,21:$VL9,22:4951,87:4950,214:4533,215:$VM9},o($VA1,$VV5),o($VA1,$VK1),o($VA1,$Vn),o($VA1,$Vo),o($VA1,$Vp),o($VA1,$Vq),o($Vz2,$V71),o($Vz2,$V81),o($Vz2,$V91),o($VD1,$Vp5),o($VD1,$Vq5),{19:$VN9,21:$VO9,22:4953,87:4952,214:4560,215:$VP9},o($VA3,$Vf6),o($VA3,$VK1),o($VB3,$Vf6),o($VB3,$VK1),o($VC3,$Vf6),o($VC3,$VK1),o($V77,$Vl8),o($V77,$Vm8),o($V77,$VS5),o($V77,$VT5),{119:[1,4954],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($V77,$VE1),o($V77,$VF1),{19:[1,4958],21:[1,4962],22:4956,33:4955,200:4957,214:4959,215:[1,4961],216:[1,4960]},o($V77,$Vn8),o($V77,$Vu6),o($Vo8,$Vy1,{93:4963}),o($V77,$Vz1,{99:4854,95:4964,101:$VW9,102:$VR,103:$VS,104:$VT}),o($Vo8,$VG1),o($Vo8,$VH1),o($Vo8,$VI1),o($Vo8,$VJ1),{100:[1,4965]},o($Vo8,$VT1),{70:[1,4966]},o($VR7,$Vs2,{99:4638,95:4967,101:$VQ9,102:$VR,103:$VS,104:$VT}),o($VQ7,$Vt2),o($V77,$Vu2,{90:4968,95:4969,91:4970,99:4971,105:4973,107:4974,101:$V_9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V77,$Vw2,{90:4968,95:4969,91:4970,99:4971,105:4973,107:4974,101:$V_9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V77,$Vx2,{90:4968,95:4969,91:4970,99:4971,105:4973,107:4974,101:$V_9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($VU7,$Vy2),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,4975],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:4976,121:$VW2,148:$VX2,189:$VY2}),o($VT7,$VA2),o($VT7,$Vw),o($VT7,$Vx),o($VT7,$Vn),o($VT7,$Vo),o($VT7,$Vy),o($VT7,$Vp),o($VT7,$Vq),o($VQ7,$V23),o($VU7,$V33),o($VU7,$V43),o($VU7,$V53),o($VU7,$V63),{111:[1,4977]},o($VU7,$Vb3),o($V77,$Vr5),{19:[1,4980],21:[1,4983],22:4979,87:4978,214:4981,215:[1,4982]},o($V77,$Vr5),{19:[1,4986],21:[1,4989],22:4985,87:4984,214:4987,215:[1,4988]},o($Vn9,$V71),o($Vn9,$V81),o($Vn9,$V91),o($Vq8,$Vp5),o($Vq8,$Vq5),{19:$VR9,21:$VS9,22:4991,87:4990,214:4683,215:$VT9},o($Vx8,$VZ8),o($VI,$VJ,{63:4992,73:4993,75:4994,76:4995,92:4998,94:4999,87:5001,88:5002,89:5003,78:5004,44:5005,95:5009,22:5010,91:5012,118:5013,99:5017,214:5020,105:5021,107:5022,19:[1,5019],21:[1,5024],69:[1,4996],71:[1,4997],79:[1,5014],80:[1,5015],81:[1,5016],85:[1,5000],96:[1,5006],97:[1,5007],98:[1,5008],101:$V$9,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ,161:[1,5011],215:[1,5023]}),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:5025,121:$VW2,148:$VX2,189:$VY2}),o($Vx8,$VA2),o($Vx8,$Vw),o($Vx8,$Vx),o($Vx8,$Vn),o($Vx8,$Vo),o($Vx8,$Vy),o($Vx8,$Vp),o($Vx8,$Vq),o($Vx8,$Vs2,{99:4722,95:5026,101:$VU9,102:$VR,103:$VS,104:$VT}),o($Vp9,$Vt2),o($Vp9,$V23),o($Vx8,$V$8),o($V29,$VQ3),o($V49,$VR3),o($V49,$VS3),o($V49,$VT3),{100:[1,5027]},o($V49,$VT1),{100:[1,5029],106:5028,108:[1,5030],109:[1,5031],110:5032,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,5033]},o($V49,$VV3),{121:[1,5034]},{19:[1,5037],21:[1,5040],22:5036,87:5035,214:5038,215:[1,5039]},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:5041,121:$VW2,148:$VX2,189:$VY2}),o($Vx8,$VA2),o($Vx8,$Vw),o($Vx8,$Vx),o($Vx8,$Vn),o($Vx8,$Vo),o($Vx8,$Vy),o($Vx8,$Vp),o($Vx8,$Vq),o($Vx8,$Vs2,{99:4764,95:5042,101:$VV9,102:$VR,103:$VS,104:$VT}),o($Vp9,$Vt2),o($Vp9,$V23),o($Vx8,$V$8),o($V29,$VQ3),o($V49,$VR3),o($V49,$VS3),o($V49,$VT3),{100:[1,5043]},o($V49,$VT1),{100:[1,5045],106:5044,108:[1,5046],109:[1,5047],110:5048,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,5049]},o($V49,$VV3),{121:[1,5050]},{19:[1,5053],21:[1,5056],22:5052,87:5051,214:5054,215:[1,5055]},o($V49,$VV5),o($V49,$VK1),o($V49,$Vn),o($V49,$Vo),o($V49,$Vp),o($V49,$Vq),o($Vr4,$Vr5),{19:[1,5059],21:[1,5062],22:5058,87:5057,214:5060,215:[1,5061]},o($Vr1,$Vf6),o($Vr1,$VK1),o($Vt1,$Vf6),o($Vt1,$VK1),o($VD1,$Vf6),o($VD1,$VK1),o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:5063,121:$VW2,148:$VX2,189:$VY2}),o($V77,$VA2),o($V77,$Vw),o($V77,$Vx),o($V77,$Vn),o($V77,$Vo),o($V77,$Vy),o($V77,$Vp),o($V77,$Vq),o($V77,$Vs2,{99:4854,95:5064,101:$VW9,102:$VR,103:$VS,104:$VT}),o($Vo8,$Vt2),o($Vo8,$V23),o($V77,$V$8),o($VQ7,$VQ3),o($VS7,$VR3),o($VS7,$VS3),o($VS7,$VT3),{100:[1,5065]},o($VS7,$VT1),{100:[1,5067],106:5066,108:[1,5068],109:[1,5069],110:5070,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,5071]},o($VS7,$VV3),{121:[1,5072]},{19:[1,5075],21:[1,5078],22:5074,87:5073,214:5076,215:[1,5077]},o($VS7,$VV5),o($VS7,$VK1),o($VS7,$Vn),o($VS7,$Vo),o($VS7,$Vp),o($VS7,$Vq),o($VS7,$VV5),o($VS7,$VK1),o($VS7,$Vn),o($VS7,$Vo),o($VS7,$Vp),o($VS7,$Vq),o($Vq8,$Vf6),o($Vq8,$VK1),o($Vx8,$VL7),o($Vx8,$VM7,{74:5079,76:5080,78:5081,44:5082,118:5083,79:[1,5084],80:[1,5085],81:[1,5086],119:$VJ,125:$VJ,127:$VJ,189:$VJ,227:$VJ}),o($Vx8,$VN7),o($Vx8,$VM5,{77:5087,73:5088,92:5089,94:5090,95:5094,99:5095,96:[1,5091],97:[1,5092],98:[1,5093],101:$V0a,102:$VR,103:$VS,104:$VT}),o($V11,$Vs,{40:169,44:171,38:5097,43:$Vp1,79:$V21,80:$V31,81:$V41}),o($Vx8,$VP7),o($V29,$Vy1,{93:5098}),o($V39,$Vz1,{99:5017,95:5099,101:$V$9,102:$VR,103:$VS,104:$VT}),o($V49,$VB1,{86:5100}),o($V49,$VB1,{86:5101}),o($V49,$VB1,{86:5102}),o($Vx8,$VC1,{105:5021,107:5022,91:5103,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V59,$VS5),o($V59,$VT5),o($V29,$VG1),o($V29,$VH1),o($V29,$VI1),o($V29,$VJ1),o($V49,$VK1),o($VL1,$VM1,{162:5104}),o($V69,$VO1),{119:[1,5105],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($V59,$VE1),o($V59,$VF1),{19:[1,5109],21:[1,5113],22:5107,33:5106,200:5108,214:5110,215:[1,5112],216:[1,5111]},{100:[1,5114]},o($V29,$VT1),o($V49,$Vn),o($V49,$Vo),{100:[1,5116],106:5115,108:[1,5117],109:[1,5118],110:5119,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,5120]},o($V49,$Vp),o($V49,$Vq),{121:[1,5121]},o($Vp9,$VQ3),o($V49,$V23),o($V49,$V33),o($V49,$V43),o($V49,$V53),o($V49,$V63),{111:[1,5122]},o($V49,$Vb3),o($V59,$Vr5),o($V69,$VV5),o($V69,$VK1),o($V69,$Vn),o($V69,$Vo),o($V69,$Vp),o($V69,$Vq),{121:[1,5123]},o($Vp9,$VQ3),o($V49,$V23),o($V49,$V33),o($V49,$V43),o($V49,$V53),o($V49,$V63),{111:[1,5124]},o($V49,$Vb3),o($V59,$Vr5),o($V69,$VV5),o($V69,$VK1),o($V69,$Vn),o($V69,$Vo),o($V69,$Vp),o($V69,$Vq),o($VQ5,$VV5),o($VQ5,$VK1),o($VQ5,$Vn),o($VQ5,$Vo),o($VQ5,$Vp),o($VQ5,$Vq),{121:[1,5125]},o($Vo8,$VQ3),o($VS7,$V23),o($VS7,$V33),o($VS7,$V43),o($VS7,$V53),o($VS7,$V63),{111:[1,5126]},o($VS7,$Vb3),o($VT7,$Vr5),o($VU7,$VV5),o($VU7,$VK1),o($VU7,$Vn),o($VU7,$Vo),o($VU7,$Vp),o($VU7,$Vq),o($Vx8,$Vl8),o($Vx8,$Vm8),o($Vx8,$VS5),o($Vx8,$VT5),{119:[1,5127],122:191,123:192,124:193,125:$VP1,127:$VQ1,189:$VR1,217:195,227:$VS1},o($Vx8,$VE1),o($Vx8,$VF1),{19:[1,5131],21:[1,5135],22:5129,33:5128,200:5130,214:5132,215:[1,5134],216:[1,5133]},o($Vx8,$Vn8),o($Vx8,$Vu6),o($Vp9,$Vy1,{93:5136}),o($Vx8,$Vz1,{99:5095,95:5137,101:$V0a,102:$VR,103:$VS,104:$VT}),o($Vp9,$VG1),o($Vp9,$VH1),o($Vp9,$VI1),o($Vp9,$VJ1),{100:[1,5138]},o($Vp9,$VT1),{70:[1,5139]},o($V39,$Vs2,{99:5017,95:5140,101:$V$9,102:$VR,103:$VS,104:$VT}),o($V29,$Vt2),o($Vx8,$Vu2,{90:5141,95:5142,91:5143,99:5144,105:5146,107:5147,101:$V1a,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vx8,$Vw2,{90:5141,95:5142,91:5143,99:5144,105:5146,107:5147,101:$V1a,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($Vx8,$Vx2,{90:5141,95:5142,91:5143,99:5144,105:5146,107:5147,101:$V1a,102:$VR,103:$VS,104:$VT,112:$VU,113:$VV,114:$VW,115:$VX,116:$VY,117:$VZ}),o($V69,$Vy2),{19:$VB2,21:$VC2,22:370,71:$VD2,81:$VE2,100:$VF2,108:$VG2,109:$VH2,110:382,163:[1,5148],164:365,165:366,166:367,167:368,181:371,185:$VI2,196:376,197:377,198:378,201:381,204:$VJ2,205:$VK2,206:$VL2,207:$VM2,208:$VN2,209:$VO2,210:$VP2,211:$VQ2,212:$VR2,213:$VS2,214:375,215:$VT2},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:5149,121:$VW2,148:$VX2,189:$VY2}),o($V59,$VA2),o($V59,$Vw),o($V59,$Vx),o($V59,$Vn),o($V59,$Vo),o($V59,$Vy),o($V59,$Vp),o($V59,$Vq),o($V29,$V23),o($V69,$V33),o($V69,$V43),o($V69,$V53),o($V69,$V63),{111:[1,5150]},o($V69,$Vb3),o($Vx8,$Vr5),{19:[1,5153],21:[1,5156],22:5152,87:5151,214:5154,215:[1,5155]},o($Vx8,$Vr5),{19:[1,5159],21:[1,5162],22:5158,87:5157,214:5160,215:[1,5161]},o($V77,$Vr5),{19:[1,5165],21:[1,5168],22:5164,87:5163,214:5166,215:[1,5167]},o($VU2,$VV2,{126:397,130:398,131:399,132:400,136:401,137:402,138:403,144:404,146:405,147:406,120:5169,121:$VW2,148:$VX2,189:$VY2}),o($Vx8,$VA2),o($Vx8,$Vw),o($Vx8,$Vx),o($Vx8,$Vn),o($Vx8,$Vo),o($Vx8,$Vy),o($Vx8,$Vp),o($Vx8,$Vq),o($Vx8,$Vs2,{99:5095,95:5170,101:$V0a,102:$VR,103:$VS,104:$VT}),o($Vp9,$Vt2),o($Vp9,$V23),o($Vx8,$V$8),o($V29,$VQ3),o($V49,$VR3),o($V49,$VS3),o($V49,$VT3),{100:[1,5171]},o($V49,$VT1),{100:[1,5173],106:5172,108:[1,5174],109:[1,5175],110:5176,206:$VU1,207:$VV1,208:$VW1,209:$VX1},{100:[1,5177]},o($V49,$VV3),{121:[1,5178]},{19:[1,5181],21:[1,5184],22:5180,87:5179,214:5182,215:[1,5183]},o($V49,$VV5),o($V49,$VK1),o($V49,$Vn),o($V49,$Vo),o($V49,$Vp),o($V49,$Vq),o($V49,$VV5),o($V49,$VK1),o($V49,$Vn),o($V49,$Vo),o($V49,$Vp),o($V49,$Vq),o($VS7,$VV5),o($VS7,$VK1),o($VS7,$Vn),o($VS7,$Vo),o($VS7,$Vp),o($VS7,$Vq),{121:[1,5185]},o($Vp9,$VQ3),o($V49,$V23),o($V49,$V33),o($V49,$V43),o($V49,$V53),o($V49,$V63),{111:[1,5186]},o($V49,$Vb3),o($V59,$Vr5),o($V69,$VV5),o($V69,$VK1),o($V69,$Vn),o($V69,$Vo),o($V69,$Vp),o($V69,$Vq),o($Vx8,$Vr5),{19:[1,5189],21:[1,5192],22:5188,87:5187,214:5190,215:[1,5191]},o($V49,$VV5),o($V49,$VK1),o($V49,$Vn),o($V49,$Vo),o($V49,$Vp),o($V49,$Vq)];
        this.defaultActions = {6:[2,11],24:[2,1],115:[2,119],116:[2,120],117:[2,121],124:[2,132],125:[2,133],205:[2,252],206:[2,253],207:[2,254],208:[2,255],337:[2,35],397:[2,142],398:[2,146],400:[2,148],582:[2,33],583:[2,37],620:[2,34],1142:[2,146],1144:[2,148]};
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
case 37: case 41: case 44: case 50: case 57: case 188: case 247: case 268: case 272:
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
case 43: case 46: case 48: case 52: case 55: case 59: case 270: case 274:
this.$ = $$[$0-1].concat($$[$0]);
break;
case 47: case 51: case 54: case 58: case 269: case 273:
this.$ = [];
break;
case 49: case 267:
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
case 64: case 73: case 78: case 276: case 278:
this.$ = $$[$0] ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $$[$0-1]), $$[$0] ] } : $$[$0-1];
break;
case 66:
this.$ = $$[$0] ? shapeJunction("ShapeAnd", $$[$0-1], [$$[$0]]) /* t: 1dotRef1 */ : $$[$0-1] // t:@@;
break;
case 67: case 76: case 81:
this.$ = Object.assign($$[$0-1], {nested: true}) // t: 1val1vsMinusiri3;
break;
case 68: case 77: case 82:
this.$ = yy.EmptyShape // t: 1dot;
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
        this.$ = yy.addSourceMap(yy.expandPrefix($$[$0].substr(0, namePos), yy) + $$[$0].substr(namePos + 1)); // ShapeRef
      
break;
case 92:
 // t: 1dotRefNS1@@
        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        this.$ = yy.addSourceMap(yy.expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy)); // ShapeRef
      
break;
case 93:
this.$ = yy.addSourceMap($$[$0]) // ShapeRef // t: 1dotRef1, 1dotRefSpaceLNex, 1dotRefSpaceNS1;
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
              yy.error(new Error("Parse error: facet " + facet + " not allowed for unknown datatype " + $$[$0-1]));
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
          yy.error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"));
        }
        this.$ = extend($$[$0-1], $$[$0]) // t: 1literalLength
      
break;
case 105: case 111:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          yy.error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"));
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
          yy.error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"));
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
          yy.error(new Error("Parse error: numeric range facet expected numeric datatype instead of " + $$[$0]));
      
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
        this.$ = $$[$0-2] === yy.EmptyShape ? { type: "Shape" } : $$[$0-2]; // t: 0
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: !! look to open3groupdotcloseAnnot3, open3groupdotclosecard23Annot3Code2
        if ($$[$0]) { this.$.semActs = $$[$0].semActs; } // t: !! look to open3groupdotcloseCode1, !open1dotOr1dot
      
break;
case 135:
 // t: 1dotExtend3
        const exprObj = $$[$0-1] ? { expression: $$[$0-1] } : yy.EmptyObject; // t: 0, 0Extend1
        this.$ = (exprObj === yy.EmptyObject && $$[$0-3] === yy.EmptyObject) ?
	  yy.EmptyShape :
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
this.$ = yy.EmptyObject;
break;
case 140:

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
          yy.addProduction($$[$0-1],  this.$);
        } else {
          this.$ = $$[$0]
        }
      
break;
case 166:
this.$ = yy.addSourceMap($$[$0]);
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
	if ($$[$0-3] !== yy.EmptyShape && false) {}
        // %7: t: 1inversedotCode1
        this.$ = extend({ type: "TripleConstraint" }, $$[$0-5], { predicate: $$[$0-4] }, ($$[$0-3] === yy.EmptyShape ? {} : { valueExpr: $$[$0-3] }), $$[$0-2], $$[$0]); // t: 1dot, 1inversedot
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
this.$ = yy.addSourceMap($$[$0]) // Inclusion // t: 2groupInclude1;
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
        this.$ = yy._base === null || absoluteIRI.test(unesc) ? unesc : yy._resolveIRI(unesc)
      
break;
case 262:
 // t:1dotPNex, 1dotPNdefault, ShExParser-test.js/with pre-defined prefixes
        const namePos1 = $$[$0].indexOf(':');
        this.$ = yy.expandPrefix($$[$0].substr(0, namePos1), yy) + ShExUtil.unescapeText($$[$0].substr(namePos1 + 1), pnameEscapeReplacements);
      
break;
case 263:
 // t: 1dotNS2, 1dotNSdefault, ShExParser-test.js/PNAME_NS with pre-defined prefixes
        this.$ = yy.expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy);
      
break;
case 265:
this.$ = $$[$0] // t: 0Extends1, 1dotExtends1, 1dot3ExtendsLN;
break;
case 271:
this.$ = shapeJunction("ShapeAnd", $$[$0-1], $$[$0]);
break;
case 275:
this.$ = $$[$0-1] ? { type: "ShapeNot", "shapeExpr": nonest($$[$0]) } : $$[$0];
break;
case 279:
this.$ = Object.assign($$[$0-1], {nested: true});
break;
case 280:
this.$ = yy.EmptyShape;
break;
case 283:
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
    case 29:return 39;
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
        oldVisitExpression = v.visitExpression;
    v.keepShapeExpr = oldVisitShapeExpr;

    v.visitShapeExpr = v.visitValueExpr = function (expr, label) {
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
        } else {
          delete expr.id;
          return oldVisitShapeExpr.call(this, expr, label);
        }
      }
      return oldVisitShapeExpr.call(this, expr, label);
    };

    v.visitExpression = function (expr) {
      if (typeof expr === "string") { // shortcut for recursive references e.g. 1Include1 and ../doc/TODO.md
        return expr;
      } else if ("id" in expr) {
        if (expr.id in knownTripleExpressions) {
          knownTripleExpressions[expr.id].refCount++;
          return expr.id;
        }
      }
      const ret = oldVisitExpression.call(this, expr);
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
      schema.shapes = schema.shapes.map((sh, idx) => v.visitShapeDecl(sh));

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
    const oldVisitInclusion = v.visitInclusion, oldVisitExpression = v.visitExpression, oldVisitExtra = v.visitExtra;
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
        ret.shapes = shapes.map(v => { // @@ console.log(v.nested);
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
let ShExVisitor = __webpack_require__(8806);
let ShExUtil = __webpack_require__(9443);
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
                extendsVisitor.visitShapeDecl(_ShExValidator._lookupShape(parent))
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
    const tripleList = matchByPredicate(constraintList, neighborhood, outgoingLength, point, valParms, matchTarget);
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
        if (cNo !== "NO_TRIPLE_CONSTRAINT")
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
      const subgraph = ShExUtil.makeTriplesDB(null); // These triples were tracked earlier.
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
      return this._maybeSet(decl, { type: "ShapeDecl" }, "ShapeDecl",
                            ["id", "abstract", "restricts", "shapeExpr"]);
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
  v.visitShapeDecl = function (shapeExpr, label) {
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