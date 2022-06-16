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

/***/ 325:
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

var _IRIs = _interopRequireDefault(__webpack_require__(325));

var _N3Util = __webpack_require__(670);

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

/***/ 670:
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

/***/ 863:
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

/***/ 865:
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

const ShExTerm = __webpack_require__(118);
const ShExMap = __webpack_require__(279);

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
  const regexModule = this.options.regexModule || __webpack_require__(991);

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
    const ret = this._validateShapeExpr(db, point, schema._index.shapeExprs[shapeLabel], shapeLabel, depth, seen);
    delete seen[seenKey];
    return ret;
  }

  this._validateShapeExpr = function (db, point, shapeExpr, shapeLabel, depth, seen) {
    if ("known" in this && this.known.cached(point, shapeExpr))
      return this.known.cached(point, shapeExpr);
    let ret = null;
    if (point === "")
      throw Error("validation needs a valid focus node");
    if (typeof(shapeExpr) === "string") { // ShapeRef
      ret = this._validateShapeExpr(db, point, schema._index.shapeExprs[shapeExpr], shapeExpr, depth, seen);
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

/***/ 991:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const NFAXVal1ErrMaterializer = (function () {

  const ShExTerm = __webpack_require__(118);

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

/***/ 961:
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

/***/ 386:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * This file is the main entry point into calling an extension. 
 * It determines which extension is requested, and then, assuming
 * the extension is valid, it forwards the request on
 */
const Extensions = (function () {

// Known extensions
const hashmap_extension = __webpack_require__(445);
const regex_extension = __webpack_require__(521);

const utils = __webpack_require__(961);

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

/***/ 445:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * The hashmap extension expects a hash map directive in JSON format like: 
 *    hashmap(variable, {"D": "Divorced", "M": "Married", "S": "Single", "W": "Widowed"}) 
 * And returns the appropriate map value based on the input.
 */
const HashmapExtension = (function () {

const extUtils = __webpack_require__(961);

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

/***/ 521:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * The regex extension expects a map directive like: 
 *    regex(/<regex>/) 
 * where the regex should specify one or more target variables, e.g.,
 *    regex(/"(?<dem:family>[a-zA-Z'\\-]+),\\s*(?<dem:given>[a-zA-Z'\\-\\s]+)"/)
 * The expression will be applied and the results returned as a hash.
 */

const RegexExtension = (function () {
const extUtils = __webpack_require__(961);

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

/***/ 279:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*
 * TODO
 *   templates: @<foo> %map:{ my:specimen.container.code=.1.code, my:specimen.container.disp=.1.display %}
 *   node identifiers: @foo> %map:{ foo.id=substr(20) %}
 *   multiplicity: ...
 */

const ShExMapCjsModule = function (config) {

const extensions = __webpack_require__(386);
const N3Util = __webpack_require__(670);
const N3DataFactory = (__webpack_require__(713)["default"]);
const materializer = __webpack_require__(865)(config);

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
        this.visitShapeExpr(index.shapeExprs[shapeRef], shapeRef);
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
    hashmap: __webpack_require__(445),
    regex: __webpack_require__(521)
  },
  extensions: __webpack_require__(386),
  utils: __webpack_require__(961),
};

};

if (true)
  module.exports = ShExMapCjsModule;


/***/ }),

/***/ 709:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

ShExWebApp = (function () {
  const shapeMap = __webpack_require__(261)
  return Object.assign({}, {
    ShExTerm:       __webpack_require__(118),
    Util:           __webpack_require__(443),
    Validator:      __webpack_require__(457),
    Writer:         __webpack_require__(95),
    Api:            __webpack_require__(237),
    Parser:         __webpack_require__(931),
    ShapeMap:       shapeMap,
    ShapeMapParser: shapeMap.Parser,

    Map:            __webpack_require__(279),
  })
})()

if (true)
  module.exports = ShExWebApp;


/***/ }),

/***/ 839:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;
/* parser generated by jison 0.3.0 */
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
    return obj("@value", unescapeText(string, stringEscapeReplacements));
  }

  function unescapeLangString(string, trimLength) {
    const at = string.lastIndexOf("@");
    const lang = string.substr(at);
    string = string.substr(0, at);
    const u = unescapeString(string, trimLength);
    return extend(u, obj("@language", lang.substr(1).toLowerCase()));
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

  const EmptyObject = {  };
  const EmptyShape = { type: "Shape" };

  // <?INCLUDE from ShExUtil. Factor into `rdf-token` module? ?>
  /**
   * unescape numerics and allowed single-character escapes.
   * throws: if there are any unallowed sequences
   */
  function unescapeText (string, replacements) { // !! ShExUtil.unescapeText ?
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

const { JisonParser, o } = __webpack_require__(41);const $V0=[1,7],$V1=[1,16],$V2=[1,11],$V3=[1,14],$V4=[1,25],$V5=[1,24],$V6=[1,21],$V7=[1,22],$V8=[1,23],$V9=[1,28],$Va=[1,26],$Vb=[1,27],$Vc=[1,29],$Vd=[1,12],$Ve=[1,13],$Vf=[1,15],$Vg=[4,9],$Vh=[16,19,20,21],$Vi=[2,25],$Vj=[16,19,20,21,37],$Vk=[16,19,20,21,31,34,37,39,46,48,50,53,54,55,56,76,77,78,79,80,81,82],$Vl=[4,9,16,19,20,21,37,43,74,75],$Vm=[4,9,43],$Vn=[29,46,80,81,82],$Vo=[4,9,42,43],$Vp=[1,59],$Vq=[46,79,80,81,82],$Vr=[31,34,39,46,48,50,53,54,55,56,76,77,78,80,81,82],$Vs=[1,94],$Vt=[1,85],$Vu=[1,86],$Vv=[1,87],$Vw=[1,90],$Vx=[1,91],$Vy=[1,92],$Vz=[1,93],$VA=[1,95],$VB=[33,48,49,50,53,54,55,56,63],$VC=[4,9,37,65],$VD=[1,99],$VE=[9,37],$VF=[9,65];

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

        const node = unescapeText($$[$0].slice(1,-1), {});
        this.$ = yy.dataMeta.base === null || absoluteIRI.test(node) ? node : yy.dataMeta._resolveIRI(node)
      
break;
case 85: case 86:
this.$ = parsePName($$[$0], yy.dataMeta.prefixes);
break;
case 87:
this.$ = expandPrefix(yy.dataMeta.prefixes, $$[$0].substr(0, $$[$0].length - 1));;
break;
case 88:

        const shape = unescapeText($$[$0].slice(1,-1), {});
        this.$ = yy.schemaMeta.base === null || absoluteIRI.test(shape) ? shape : yy.schemaMeta._resolveIRI(shape)
      
break;
case 89: case 90:
this.$ = parsePName($$[$0], yy.schemaMeta.prefixes);
break;
case 91:
this.$ = expandPrefix(yy.schemaMeta.prefixes, $$[$0].substr(0, $$[$0].length - 1));;
break;
        }
    }
}

// Export module
__webpack_unused_export__ = ({ value: true });
exports.HW = ShapeMapJisonParser;


/* generated by ts-jison-lex 0.3.0 */
const { JisonLexer } = __webpack_require__(752);
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

/***/ 18:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const ShapeMapParser = (function () {

// stolen as much as possible from SPARQL.js
if (true) {
  ShapeMapJison = (__webpack_require__(839)/* .ShapeMapJisonParser */ .HW); // node environment
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

/***/ 237:
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

  const ShExUtil = __webpack_require__(443);
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

/***/ 509:
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

const { JisonParser, o } = __webpack_require__(41);const $V0=[7,18,19,20,21,23,26,189,211,212],$V1=[1,25],$V2=[1,29],$V3=[1,24],$V4=[1,28],$V5=[1,27],$V6=[2,12],$V7=[2,13],$V8=[2,14],$V9=[7,18,19,20,21,23,26,211,212],$Va=[1,35],$Vb=[1,38],$Vc=[1,37],$Vd=[2,18],$Ve=[2,19],$Vf=[19,21,65,67,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,120,122,157,211],$Vg=[2,57],$Vh=[1,47],$Vi=[1,48],$Vj=[1,49],$Vk=[19,21,35,39,65,67,75,76,77,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,120,122,157,211],$Vl=[2,236],$Vm=[2,237],$Vn=[1,51],$Vo=[1,54],$Vp=[1,53],$Vq=[2,258],$Vr=[2,259],$Vs=[2,262],$Vt=[2,260],$Vu=[2,261],$Vv=[2,15],$Vw=[2,17],$Vx=[19,21,65,67,75,76,77,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,120,122,157,211],$Vy=[1,72],$Vz=[2,26],$VA=[2,27],$VB=[2,28],$VC=[115,120,122],$VD=[2,134],$VE=[1,98],$VF=[1,106],$VG=[1,84],$VH=[1,89],$VI=[1,90],$VJ=[1,91],$VK=[1,97],$VL=[1,102],$VM=[1,103],$VN=[1,104],$VO=[1,107],$VP=[1,108],$VQ=[1,109],$VR=[1,110],$VS=[1,111],$VT=[1,112],$VU=[1,94],$VV=[1,105],$VW=[2,58],$VX=[1,114],$VY=[1,115],$VZ=[1,116],$V_=[1,122],$V$=[1,123],$V01=[47,49],$V11=[2,87],$V21=[2,88],$V31=[189,191],$V41=[1,138],$V51=[1,141],$V61=[1,140],$V71=[2,16],$V81=[7,18,19,20,21,23,26,47,211,212],$V91=[2,43],$Va1=[7,18,19,20,21,23,26,47,49,211,212],$Vb1=[2,50],$Vc1=[2,32],$Vd1=[2,65],$Ve1=[2,70],$Vf1=[2,67],$Vg1=[1,175],$Vh1=[1,176],$Vi1=[1,177],$Vj1=[1,180],$Vk1=[1,183],$Vl1=[2,73],$Vm1=[7,18,19,20,21,23,26,47,49,75,76,77,115,120,122,186,189,211,212],$Vn1=[2,91],$Vo1=[7,18,19,20,21,23,26,47,49,186,189,211,212],$Vp1=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,186,189,211,212],$Vq1=[7,18,19,20,21,23,26,47,49,75,76,77,97,98,99,100,115,120,122,186,189,211,212],$Vr1=[2,104],$Vs1=[2,103],$Vt1=[7,18,19,20,21,23,26,47,49,97,98,99,100,108,109,110,111,112,113,186,189,211,212],$Vu1=[2,98],$Vv1=[2,97],$Vw1=[1,197],$Vx1=[1,198],$Vy1=[2,108],$Vz1=[2,109],$VA1=[2,110],$VB1=[2,106],$VC1=[2,235],$VD1=[19,21,67,77,96,104,105,159,181,200,201,202,203,204,205,206,207,208,209,211],$VE1=[2,181],$VF1=[7,18,19,20,21,23,26,47,49,108,109,110,111,112,113,186,189,211,212],$VG1=[2,100],$VH1=[2,114],$VI1=[1,206],$VJ1=[1,207],$VK1=[1,208],$VL1=[1,209],$VM1=[96,104,105,202,203,204,205],$VN1=[2,31],$VO1=[2,35],$VP1=[2,38],$VQ1=[2,41],$VR1=[2,89],$VS1=[2,227],$VT1=[2,228],$VU1=[2,229],$VV1=[1,257],$VW1=[1,262],$VX1=[1,243],$VY1=[1,248],$VZ1=[1,249],$V_1=[1,250],$V$1=[1,256],$V02=[1,253],$V12=[1,261],$V22=[1,264],$V32=[1,265],$V42=[1,266],$V52=[1,272],$V62=[1,273],$V72=[2,20],$V82=[2,49],$V92=[2,56],$Va2=[2,61],$Vb2=[2,64],$Vc2=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,211,212],$Vd2=[2,83],$Ve2=[2,84],$Vf2=[2,29],$Vg2=[2,33],$Vh2=[2,69],$Vi2=[2,66],$Vj2=[2,71],$Vk2=[2,68],$Vl2=[7,18,19,20,21,23,26,47,49,97,98,99,100,186,189,211,212],$Vm2=[1,318],$Vn2=[1,326],$Vo2=[1,327],$Vp2=[1,328],$Vq2=[1,334],$Vr2=[1,335],$Vs2=[7,18,19,20,21,23,26,47,49,75,76,77,115,120,122,189,211,212],$Vt2=[2,225],$Vu2=[7,18,19,20,21,23,26,47,49,189,211,212],$Vv2=[1,343],$Vw2=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,189,211,212],$Vx2=[2,102],$Vy2=[2,107],$Vz2=[2,94],$VA2=[1,353],$VB2=[2,95],$VC2=[2,96],$VD2=[2,101],$VE2=[19,21,65,155,156,195,211],$VF2=[2,162],$VG2=[2,136],$VH2=[1,368],$VI2=[1,367],$VJ2=[1,373],$VK2=[1,376],$VL2=[1,372],$VM2=[1,375],$VN2=[1,387],$VO2=[1,393],$VP2=[1,382],$VQ2=[1,386],$VR2=[1,396],$VS2=[1,397],$VT2=[1,398],$VU2=[1,385],$VV2=[1,399],$VW2=[1,400],$VX2=[1,405],$VY2=[1,406],$VZ2=[1,407],$V_2=[1,408],$V$2=[1,401],$V03=[1,402],$V13=[1,403],$V23=[1,404],$V33=[1,392],$V43=[2,113],$V53=[2,118],$V63=[2,120],$V73=[2,121],$V83=[2,122],$V93=[2,250],$Va3=[2,251],$Vb3=[2,252],$Vc3=[2,253],$Vd3=[2,119],$Ve3=[2,30],$Vf3=[2,39],$Vg3=[2,36],$Vh3=[2,42],$Vi3=[2,37],$Vj3=[1,440],$Vk3=[2,40],$Vl3=[1,476],$Vm3=[1,509],$Vn3=[1,510],$Vo3=[1,511],$Vp3=[1,514],$Vq3=[2,44],$Vr3=[2,51],$Vs3=[2,60],$Vt3=[2,62],$Vu3=[2,72],$Vv3=[47,49,66],$Vw3=[1,574],$Vx3=[47,49,66,75,76,77,115,120,122,186,189],$Vy3=[47,49,66,186,189],$Vz3=[47,49,66,92,93,94,97,98,99,100,186,189],$VA3=[47,49,66,75,76,77,97,98,99,100,115,120,122,186,189],$VB3=[47,49,66,97,98,99,100,108,109,110,111,112,113,186,189],$VC3=[47,49,66,108,109,110,111,112,113,186,189],$VD3=[47,66],$VE3=[7,18,19,20,21,23,26,47,49,75,76,77,115,120,122,211,212],$VF3=[2,93],$VG3=[2,92],$VH3=[2,224],$VI3=[1,616],$VJ3=[1,619],$VK3=[1,615],$VL3=[1,618],$VM3=[2,90],$VN3=[2,130],$VO3=[2,105],$VP3=[2,99],$VQ3=[2,111],$VR3=[2,112],$VS3=[2,141],$VT3=[2,142],$VU3=[1,636],$VV3=[2,143],$VW3=[117,130],$VX3=[2,148],$VY3=[2,149],$VZ3=[2,151],$V_3=[1,639],$V$3=[1,640],$V04=[19,21,195,211],$V14=[2,170],$V24=[1,648],$V34=[1,649],$V44=[117,130,135,136],$V54=[2,160],$V64=[19,21,115,120,122,195,211],$V74=[2,233],$V84=[2,234],$V94=[2,180],$Va4=[1,683],$Vb4=[19,21,67,77,96,104,105,159,174,181,200,201,202,203,204,205,206,207,208,209,211],$Vc4=[2,230],$Vd4=[2,231],$Ve4=[2,232],$Vf4=[2,243],$Vg4=[2,246],$Vh4=[2,240],$Vi4=[2,241],$Vj4=[2,242],$Vk4=[2,248],$Vl4=[2,249],$Vm4=[2,254],$Vn4=[2,255],$Vo4=[2,256],$Vp4=[2,257],$Vq4=[19,21,67,77,96,104,105,107,159,174,181,200,201,202,203,204,205,206,207,208,209,211],$Vr4=[1,715],$Vs4=[1,762],$Vt4=[1,817],$Vu4=[1,827],$Vv4=[1,863],$Vw4=[1,899],$Vx4=[2,63],$Vy4=[47,49,66,97,98,99,100,186,189],$Vz4=[47,49,66,75,76,77,115,120,122,189],$VA4=[47,49,66,189],$VB4=[1,921],$VC4=[47,49,66,92,93,94,97,98,99,100,189],$VD4=[1,931],$VE4=[1,968],$VF4=[1,1004],$VG4=[2,226],$VH4=[1,1015],$VI4=[1,1021],$VJ4=[1,1020],$VK4=[19,21,96,104,105,200,201,202,203,204,205,206,207,208,209,211],$VL4=[1,1041],$VM4=[1,1047],$VN4=[1,1046],$VO4=[1,1067],$VP4=[1,1073],$VQ4=[1,1072],$VR4=[2,131],$VS4=[2,144],$VT4=[2,146],$VU4=[2,150],$VV4=[2,152],$VW4=[2,153],$VX4=[2,157],$VY4=[2,159],$VZ4=[2,164],$V_4=[2,165],$V$4=[1,1099],$V05=[1,1102],$V15=[1,1098],$V25=[1,1101],$V35=[1,1112],$V45=[2,220],$V55=[2,238],$V65=[2,239],$V75=[1,1116],$V85=[1,1118],$V95=[1,1120],$Va5=[19,21,67,77,96,104,105,159,175,181,200,201,202,203,204,205,206,207,208,209,211],$Vb5=[1,1124],$Vc5=[1,1130],$Vd5=[1,1133],$Ve5=[1,1134],$Vf5=[1,1135],$Vg5=[1,1123],$Vh5=[1,1136],$Vi5=[1,1137],$Vj5=[1,1142],$Vk5=[1,1143],$Vl5=[1,1144],$Vm5=[1,1145],$Vn5=[1,1138],$Vo5=[1,1139],$Vp5=[1,1140],$Vq5=[1,1141],$Vr5=[1,1129],$Vs5=[2,244],$Vt5=[2,247],$Vu5=[2,123],$Vv5=[1,1175],$Vw5=[1,1181],$Vx5=[1,1213],$Vy5=[1,1219],$Vz5=[1,1278],$VA5=[1,1325],$VB5=[47,49,66,75,76,77,115,120,122],$VC5=[47,49,66,92,93,94,97,98,99,100],$VD5=[1,1401],$VE5=[1,1448],$VF5=[2,221],$VG5=[2,222],$VH5=[2,223],$VI5=[7,18,19,20,21,23,26,47,49,75,76,77,107,115,120,122,186,189,211,212],$VJ5=[7,18,19,20,21,23,26,47,49,107,186,189,211,212],$VK5=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,107,186,189,211,212],$VL5=[2,147],$VM5=[2,145],$VN5=[2,154],$VO5=[2,158],$VP5=[2,155],$VQ5=[2,156],$VR5=[19,21,39,65,67,75,76,77,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,120,122,157,211],$VS5=[1,1508],$VT5=[66,130],$VU5=[1,1511],$VV5=[1,1512],$VW5=[66,130,135,136],$VX5=[2,203],$VY5=[1,1528],$VZ5=[19,21,67,77,96,104,105,159,174,175,181,200,201,202,203,204,205,206,207,208,209,211],$V_5=[19,21,67,77,96,104,105,107,159,174,175,181,200,201,202,203,204,205,206,207,208,209,211],$V$5=[2,245],$V06=[1,1566],$V16=[1,1632],$V26=[1,1638],$V36=[1,1637],$V46=[1,1658],$V56=[1,1664],$V66=[1,1663],$V76=[1,1684],$V86=[1,1690],$V96=[1,1689],$Va6=[1,1731],$Vb6=[1,1737],$Vc6=[1,1769],$Vd6=[1,1775],$Ve6=[1,1790],$Vf6=[1,1796],$Vg6=[1,1795],$Vh6=[1,1816],$Vi6=[1,1822],$Vj6=[1,1821],$Vk6=[1,1842],$Vl6=[1,1848],$Vm6=[1,1847],$Vn6=[1,1889],$Vo6=[1,1895],$Vp6=[1,1927],$Vq6=[1,1933],$Vr6=[117,130,135,136,186,189],$Vs6=[2,167],$Vt6=[1,1951],$Vu6=[1,1952],$Vv6=[1,1953],$Vw6=[1,1954],$Vx6=[117,130,135,136,151,152,153,154,186,189],$Vy6=[2,34],$Vz6=[47,117,130,135,136,151,152,153,154,186,189],$VA6=[2,47],$VB6=[47,49,117,130,135,136,151,152,153,154,186,189],$VC6=[2,54],$VD6=[1,1983],$VE6=[1,2020],$VF6=[1,2053],$VG6=[1,2059],$VH6=[1,2058],$VI6=[1,2079],$VJ6=[1,2085],$VK6=[1,2084],$VL6=[1,2106],$VM6=[1,2112],$VN6=[1,2111],$VO6=[1,2133],$VP6=[1,2139],$VQ6=[1,2138],$VR6=[1,2159],$VS6=[1,2165],$VT6=[1,2164],$VU6=[1,2186],$VV6=[1,2192],$VW6=[1,2191],$VX6=[1,2261],$VY6=[47,49,66,75,76,77,107,115,120,122,186,189],$VZ6=[47,49,66,107,186,189],$V_6=[47,49,66,92,93,94,97,98,99,100,107,186,189],$V$6=[1,2375],$V07=[2,168],$V17=[2,172],$V27=[2,173],$V37=[2,174],$V47=[2,175],$V57=[2,45],$V67=[2,52],$V77=[2,59],$V87=[2,79],$V97=[2,75],$Va7=[2,81],$Vb7=[1,2458],$Vc7=[2,78],$Vd7=[47,49,75,76,77,97,98,99,100,115,117,120,122,130,135,136,151,152,153,154,186,189],$Ve7=[47,49,75,76,77,115,117,120,122,130,135,136,151,152,153,154,186,189],$Vf7=[47,49,97,98,99,100,108,109,110,111,112,113,117,130,135,136,151,152,153,154,186,189],$Vg7=[47,49,92,93,94,97,98,99,100,117,130,135,136,151,152,153,154,186,189],$Vh7=[2,85],$Vi7=[2,86],$Vj7=[47,49,108,109,110,111,112,113,117,130,135,136,151,152,153,154,186,189],$Vk7=[1,2512],$Vl7=[1,2518],$Vm7=[1,2601],$Vn7=[1,2634],$Vo7=[1,2640],$Vp7=[1,2639],$Vq7=[1,2660],$Vr7=[1,2666],$Vs7=[1,2665],$Vt7=[1,2687],$Vu7=[1,2693],$Vv7=[1,2692],$Vw7=[1,2714],$Vx7=[1,2720],$Vy7=[1,2719],$Vz7=[1,2740],$VA7=[1,2746],$VB7=[1,2745],$VC7=[1,2767],$VD7=[1,2773],$VE7=[1,2772],$VF7=[1,2814],$VG7=[1,2847],$VH7=[1,2853],$VI7=[1,2852],$VJ7=[1,2873],$VK7=[1,2879],$VL7=[1,2878],$VM7=[1,2900],$VN7=[1,2906],$VO7=[1,2905],$VP7=[1,2927],$VQ7=[1,2933],$VR7=[1,2932],$VS7=[1,2953],$VT7=[1,2959],$VU7=[1,2958],$VV7=[1,2980],$VW7=[1,2986],$VX7=[1,2985],$VY7=[117,130,135,136,189],$VZ7=[1,3005],$V_7=[2,48],$V$7=[2,55],$V08=[2,74],$V18=[2,80],$V28=[2,76],$V38=[2,82],$V48=[47,49,97,98,99,100,117,130,135,136,151,152,153,154,186,189],$V58=[1,3029],$V68=[66,130,135,136,186,189],$V78=[1,3038],$V88=[1,3039],$V98=[1,3040],$Va8=[1,3041],$Vb8=[66,130,135,136,151,152,153,154,186,189],$Vc8=[47,66,130,135,136,151,152,153,154,186,189],$Vd8=[47,49,66,130,135,136,151,152,153,154,186,189],$Ve8=[1,3070],$Vf8=[1,3139],$Vg8=[1,3145],$Vh8=[1,3225],$Vi8=[1,3231],$Vj8=[2,169],$Vk8=[2,46],$Vl8=[1,3319],$Vm8=[2,53],$Vn8=[1,3352],$Vo8=[2,77],$Vp8=[2,166],$Vq8=[1,3397],$Vr8=[47,49,66,75,76,77,97,98,99,100,115,120,122,130,135,136,151,152,153,154,186,189],$Vs8=[47,49,66,75,76,77,115,120,122,130,135,136,151,152,153,154,186,189],$Vt8=[47,49,66,97,98,99,100,108,109,110,111,112,113,130,135,136,151,152,153,154,186,189],$Vu8=[47,49,66,92,93,94,97,98,99,100,130,135,136,151,152,153,154,186,189],$Vv8=[47,49,66,108,109,110,111,112,113,130,135,136,151,152,153,154,186,189],$Vw8=[1,3428],$Vx8=[1,3434],$Vy8=[1,3433],$Vz8=[1,3454],$VA8=[1,3460],$VB8=[1,3459],$VC8=[1,3481],$VD8=[1,3487],$VE8=[1,3486],$VF8=[1,3585],$VG8=[1,3591],$VH8=[1,3590],$VI8=[1,3626],$VJ8=[1,3668],$VK8=[66,130,135,136,189],$VL8=[1,3698],$VM8=[47,49,66,97,98,99,100,130,135,136,151,152,153,154,186,189],$VN8=[1,3722],$VO8=[1,3758],$VP8=[1,3764],$VQ8=[1,3763],$VR8=[1,3784],$VS8=[1,3790],$VT8=[1,3789],$VU8=[1,3811],$VV8=[1,3817],$VW8=[1,3816],$VX8=[1,3838],$VY8=[1,3844],$VZ8=[1,3843],$V_8=[1,3864],$V$8=[1,3870],$V09=[1,3869],$V19=[1,3891],$V29=[1,3897],$V39=[1,3896],$V49=[107,117,130,135,136,186,189],$V59=[1,3939],$V69=[1,3963],$V79=[1,4005],$V89=[1,4038],$V99=[1,4143],$Va9=[1,4186],$Vb9=[1,4192],$Vc9=[1,4191],$Vd9=[1,4227],$Ve9=[1,4269],$Vf9=[1,4325],$Vg9=[66,107,130,135,136,186,189],$Vh9=[1,4380],$Vi9=[1,4404],$Vj9=[1,4434],$Vk9=[1,4480],$Vl9=[1,4552],$Vm9=[1,4601];

class ShExJisonParser extends JisonParser {
    constructor(yy = {}, lexer = new ShExJisonLexer(yy)) {
        super(yy, lexer);
        this.symbols_ = {"error":2,"shexDoc":3,"initParser":4,"Qdirective_E_Star":5,"Q_O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C_E_Opt":6,"EOF":7,"directive":8,"O_QnotStartAction_E_Or_QstartActions_E_C":9,"notStartAction":10,"startActions":11,"Qstatement_E_Star":12,"statement":13,"O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C":14,"baseDecl":15,"prefixDecl":16,"importDecl":17,"IT_BASE":18,"IRIREF":19,"IT_PREFIX":20,"PNAME_NS":21,"iri":22,"IT_IMPORT":23,"start":24,"shapeExprDecl":25,"IT_start":26,"=":27,"shapeAnd":28,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Star":29,"QcodeDecl_E_Plus":30,"codeDecl":31,"shapeExprLabel":32,"O_QshapeExpression_E_Or_QIT_EXTERNAL_E_C":33,"shapeExpression":34,"IT_EXTERNAL":35,"QIT_NOT_E_Opt":36,"shapeAtomNoRef":37,"QshapeOr_E_Opt":38,"IT_NOT":39,"shapeRef":40,"shapeOr":41,"inlineShapeExpression":42,"inlineShapeOr":43,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Plus":44,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Plus":45,"O_QIT_OR_E_S_QshapeAnd_E_C":46,"IT_OR":47,"O_QIT_AND_E_S_QshapeNot_E_C":48,"IT_AND":49,"shapeNot":50,"inlineShapeAnd":51,"Q_O_QIT_OR_E_S_QinlineShapeAnd_E_C_E_Star":52,"O_QIT_OR_E_S_QinlineShapeAnd_E_C":53,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Star":54,"inlineShapeNot":55,"Q_O_QIT_AND_E_S_QinlineShapeNot_E_C_E_Star":56,"O_QIT_AND_E_S_QinlineShapeNot_E_C":57,"shapeAtom":58,"inlineShapeAtom":59,"nonLitNodeConstraint":60,"QshapeOrRef_E_Opt":61,"litNodeConstraint":62,"shapeOrRef":63,"QnonLitNodeConstraint_E_Opt":64,"(":65,")":66,".":67,"shapeDefinition":68,"nonLitInlineNodeConstraint":69,"QinlineShapeOrRef_E_Opt":70,"litInlineNodeConstraint":71,"inlineShapeOrRef":72,"QnonLitInlineNodeConstraint_E_Opt":73,"inlineShapeDefinition":74,"ATPNAME_LN":75,"ATPNAME_NS":76,"@":77,"Qannotation_E_Star":78,"semanticActions":79,"annotation":80,"IT_LITERAL":81,"QxsFacet_E_Star":82,"datatype":83,"valueSet":84,"QnumericFacet_E_Plus":85,"xsFacet":86,"numericFacet":87,"nonLiteralKind":88,"QstringFacet_E_Star":89,"QstringFacet_E_Plus":90,"stringFacet":91,"IT_IRI":92,"IT_BNODE":93,"IT_NONLITERAL":94,"stringLength":95,"INTEGER":96,"REGEXP":97,"IT_LENGTH":98,"IT_MINLENGTH":99,"IT_MAXLENGTH":100,"numericRange":101,"rawNumeric":102,"numericLength":103,"DECIMAL":104,"DOUBLE":105,"string":106,"^^":107,"IT_MININCLUSIVE":108,"IT_MINEXCLUSIVE":109,"IT_MAXINCLUSIVE":110,"IT_MAXEXCLUSIVE":111,"IT_TOTALDIGITS":112,"IT_FRACTIONDIGITS":113,"Q_QextraPropertySet_E_Or_QIT_CLOSED_E_C_E_Star":114,"{":115,"QtripleExpression_E_Opt":116,"}":117,"QextraPropertySet_E_Or_QIT_CLOSED_E_C":118,"extraPropertySet":119,"IT_CLOSED":120,"tripleExpression":121,"IT_EXTRA":122,"Qpredicate_E_Plus":123,"predicate":124,"oneOfTripleExpr":125,"groupTripleExpr":126,"multiElementOneOf":127,"Q_O_QGT_PIPE_E_S_QgroupTripleExpr_E_C_E_Plus":128,"O_QGT_PIPE_E_S_QgroupTripleExpr_E_C":129,"|":130,"singleElementGroup":131,"multiElementGroup":132,"unaryTripleExpr":133,"QGT_SEMI_E_Opt":134,",":135,";":136,"Q_O_QGT_SEMI_E_S_QunaryTripleExpr_E_C_E_Plus":137,"O_QGT_SEMI_E_S_QunaryTripleExpr_E_C":138,"Q_O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C_E_Opt":139,"O_QtripleConstraint_E_Or_QbracketedTripleExpr_E_C":140,"include":141,"O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C":142,"$":143,"tripleExprLabel":144,"tripleConstraint":145,"bracketedTripleExpr":146,"Qcardinality_E_Opt":147,"cardinality":148,"QsenseFlags_E_Opt":149,"senseFlags":150,"*":151,"+":152,"?":153,"REPEAT_RANGE":154,"^":155,"!":156,"[":157,"QvalueSetValue_E_Star":158,"]":159,"valueSetValue":160,"iriRange":161,"literalRange":162,"languageRange":163,"O_QiriExclusion_E_Plus_Or_QliteralExclusion_E_Plus_Or_QlanguageExclusion_E_Plus_C":164,"QiriExclusion_E_Plus":165,"iriExclusion":166,"QliteralExclusion_E_Plus":167,"literalExclusion":168,"QlanguageExclusion_E_Plus":169,"languageExclusion":170,"Q_O_QGT_TILDE_E_S_QiriExclusion_E_Star_C_E_Opt":171,"QiriExclusion_E_Star":172,"O_QGT_TILDE_E_S_QiriExclusion_E_Star_C":173,"~":174,"-":175,"QGT_TILDE_E_Opt":176,"literal":177,"Q_O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C_E_Opt":178,"QliteralExclusion_E_Star":179,"O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C":180,"LANGTAG":181,"Q_O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C_E_Opt":182,"O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C":183,"QlanguageExclusion_E_Star":184,"&":185,"//":186,"O_Qiri_E_Or_Qliteral_E_C":187,"QcodeDecl_E_Star":188,"%":189,"O_QCODE_E_Or_QGT_MODULO_E_C":190,"CODE":191,"rdfLiteral":192,"numericLiteral":193,"booleanLiteral":194,"a":195,"blankNode":196,"langString":197,"Q_O_QGT_DTYPE_E_S_Qdatatype_E_C_E_Opt":198,"O_QGT_DTYPE_E_S_Qdatatype_E_C":199,"IT_true":200,"IT_false":201,"STRING_LITERAL1":202,"STRING_LITERAL_LONG1":203,"STRING_LITERAL2":204,"STRING_LITERAL_LONG2":205,"LANG_STRING_LITERAL1":206,"LANG_STRING_LITERAL_LONG1":207,"LANG_STRING_LITERAL2":208,"LANG_STRING_LITERAL_LONG2":209,"prefixedName":210,"PNAME_LN":211,"BLANK_NODE_LABEL":212,"O_QIT_EXTENDS_E_Or_QGT_AMP_E_C":213,"IT_EXTENDS":214,"$accept":0,"$end":1};
        this.terminals_ = {2:"error",7:"EOF",18:"IT_BASE",19:"IRIREF",20:"IT_PREFIX",21:"PNAME_NS",23:"IT_IMPORT",26:"IT_start",27:"=",35:"IT_EXTERNAL",39:"IT_NOT",47:"IT_OR",49:"IT_AND",65:"(",66:")",67:".",75:"ATPNAME_LN",76:"ATPNAME_NS",77:"@",81:"IT_LITERAL",92:"IT_IRI",93:"IT_BNODE",94:"IT_NONLITERAL",96:"INTEGER",97:"REGEXP",98:"IT_LENGTH",99:"IT_MINLENGTH",100:"IT_MAXLENGTH",104:"DECIMAL",105:"DOUBLE",107:"^^",108:"IT_MININCLUSIVE",109:"IT_MINEXCLUSIVE",110:"IT_MAXINCLUSIVE",111:"IT_MAXEXCLUSIVE",112:"IT_TOTALDIGITS",113:"IT_FRACTIONDIGITS",115:"{",117:"}",120:"IT_CLOSED",122:"IT_EXTRA",130:"|",135:",",136:";",143:"$",151:"*",152:"+",153:"?",154:"REPEAT_RANGE",155:"^",156:"!",157:"[",159:"]",174:"~",175:"-",181:"LANGTAG",185:"&",186:"//",189:"%",191:"CODE",195:"a",200:"IT_true",201:"IT_false",202:"STRING_LITERAL1",203:"STRING_LITERAL_LONG1",204:"STRING_LITERAL2",205:"STRING_LITERAL_LONG2",206:"LANG_STRING_LITERAL1",207:"LANG_STRING_LITERAL_LONG1",208:"LANG_STRING_LITERAL2",209:"LANG_STRING_LITERAL_LONG2",211:"PNAME_LN",212:"BLANK_NODE_LABEL",214:"IT_EXTENDS"};
        this.productions_ = [0,[3,4],[4,0],[5,0],[5,2],[9,1],[9,1],[12,0],[12,2],[14,2],[6,0],[6,1],[8,1],[8,1],[8,1],[15,2],[16,3],[17,2],[10,1],[10,1],[24,4],[11,1],[30,1],[30,2],[13,1],[13,1],[25,2],[33,1],[33,1],[34,3],[34,3],[34,2],[38,0],[38,1],[42,1],[41,1],[41,2],[46,2],[44,1],[44,2],[48,2],[45,1],[45,2],[29,0],[29,2],[43,2],[53,2],[52,0],[52,2],[28,2],[54,0],[54,2],[51,2],[57,2],[56,0],[56,2],[50,2],[36,0],[36,1],[55,2],[58,2],[58,1],[58,2],[58,3],[58,1],[61,0],[61,1],[64,0],[64,1],[37,2],[37,1],[37,2],[37,3],[37,1],[59,2],[59,1],[59,2],[59,3],[59,1],[70,0],[70,1],[73,0],[73,1],[63,1],[63,1],[72,1],[72,1],[40,1],[40,1],[40,2],[62,3],[78,0],[78,2],[60,3],[71,2],[71,2],[71,2],[71,1],[82,0],[82,2],[85,1],[85,2],[69,2],[69,1],[89,0],[89,2],[90,1],[90,2],[88,1],[88,1],[88,1],[86,1],[86,1],[91,2],[91,1],[95,1],[95,1],[95,1],[87,2],[87,2],[102,1],[102,1],[102,1],[102,3],[101,1],[101,1],[101,1],[101,1],[103,1],[103,1],[68,3],[74,4],[118,1],[118,1],[114,0],[114,2],[116,0],[116,1],[119,2],[123,1],[123,2],[121,1],[125,1],[125,1],[127,2],[129,2],[128,1],[128,2],[126,1],[126,1],[131,2],[134,0],[134,1],[134,1],[132,3],[138,2],[138,2],[137,1],[137,2],[133,2],[133,1],[142,2],[139,0],[139,1],[140,1],[140,1],[146,6],[147,0],[147,1],[145,6],[149,0],[149,1],[148,1],[148,1],[148,1],[148,1],[150,1],[150,2],[150,1],[150,2],[84,3],[158,0],[158,2],[160,1],[160,1],[160,1],[160,2],[165,1],[165,2],[167,1],[167,2],[169,1],[169,2],[164,1],[164,1],[164,1],[161,2],[172,0],[172,2],[173,2],[171,0],[171,1],[166,3],[176,0],[176,1],[162,2],[179,0],[179,2],[180,2],[178,0],[178,1],[168,3],[163,2],[163,2],[184,0],[184,2],[183,2],[182,0],[182,1],[170,3],[141,2],[80,3],[187,1],[187,1],[79,1],[188,0],[188,2],[31,3],[190,1],[190,1],[177,1],[177,1],[177,1],[124,1],[124,1],[83,1],[32,1],[32,1],[144,1],[144,1],[193,1],[193,1],[193,1],[192,1],[192,2],[199,2],[198,0],[198,1],[194,1],[194,1],[106,1],[106,1],[106,1],[106,1],[197,1],[197,1],[197,1],[197,1],[22,1],[22,1],[210,1],[210,1],[196,1],[213,1],[213,1]];
        this.table = [o($V0,[2,2],{3:1,4:2}),{1:[3]},o($V0,[2,3],{5:3}),{6:4,7:[2,10],8:5,9:10,10:14,11:15,14:6,15:7,16:8,17:9,18:[1,11],19:$V1,20:[1,12],21:$V2,22:22,23:[1,13],24:16,25:17,26:[1,19],30:18,31:21,32:20,189:$V3,196:23,210:26,211:$V4,212:$V5},{7:[1,30]},o($V0,[2,4]),{7:[2,11]},o($V0,$V6),o($V0,$V7),o($V0,$V8),o($V9,[2,7],{12:31}),{19:[1,32]},{21:[1,33]},{19:$Va,21:$Vb,22:34,210:36,211:$Vc},o($V9,[2,5]),o($V9,[2,6]),o($V9,$Vd),o($V9,$Ve),o($V9,[2,21],{31:39,189:$V3}),{27:[1,40]},o($Vf,$Vg,{33:41,34:42,36:44,40:46,35:[1,43],39:[1,45],75:$Vh,76:$Vi,77:$Vj}),o($V0,[2,22]),o($Vk,$Vl),o($Vk,$Vm),{19:$Vn,21:$Vo,22:50,210:52,211:$Vp},o($Vk,$Vq),o($Vk,$Vr),o($Vk,$Vs),o($Vk,$Vt),o($Vk,$Vu),{1:[2,1]},{7:[2,9],8:56,10:57,13:55,15:58,16:59,17:60,18:[1,63],19:$V1,20:[1,64],21:$V2,22:22,23:[1,65],24:61,25:62,26:[1,66],32:67,196:23,210:26,211:$V4,212:$V5},o($V0,$Vv),{19:$Va,21:$Vb,22:68,210:36,211:$Vc},o($V0,$Vw),o($V0,$Vq),o($V0,$Vr),o($V0,$Vt),o($V0,$Vu),o($V0,[2,23]),o($Vx,$Vg,{28:69,50:70,36:71,39:$Vy}),o($V9,$Vz),o($V9,$VA),o($V9,$VB),o($VC,$VD,{37:73,60:74,62:75,68:76,69:79,71:80,74:81,88:82,90:83,83:85,84:86,85:87,114:88,91:92,22:93,87:95,95:96,210:99,101:100,103:101,19:$VE,21:$VF,65:[1,77],67:[1,78],81:$VG,92:$VH,93:$VI,94:$VJ,97:$VK,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:$VU,211:$VV}),o($Vf,$VW,{40:113,75:$VX,76:$VY,77:$VZ}),{41:117,44:118,45:119,46:120,47:$V_,48:121,49:$V$},o($V01,$V11),o($V01,$V21),{19:[1,127],21:[1,131],22:125,32:124,196:126,210:128,211:[1,130],212:[1,129]},{189:[1,134],190:132,191:[1,133]},o($V31,$Vq),o($V31,$Vr),o($V31,$Vt),o($V31,$Vu),o($V9,[2,8]),o($V9,[2,24]),o($V9,[2,25]),o($V9,$V6),o($V9,$V7),o($V9,$V8),o($V9,$Vd),o($V9,$Ve),{19:[1,135]},{21:[1,136]},{19:$V41,21:$V51,22:137,210:139,211:$V61},{27:[1,142]},o($Vf,$Vg,{33:143,34:144,36:146,40:148,35:[1,145],39:[1,147],75:$Vh,76:$Vi,77:$Vj}),o($V0,$V71),o($V81,$V91,{29:149}),o($Va1,$Vb1,{54:150}),o($VC,$VD,{69:79,71:80,74:81,88:82,90:83,83:85,84:86,85:87,114:88,91:92,22:93,87:95,95:96,210:99,101:100,103:101,58:151,60:152,62:153,63:154,68:157,40:158,19:$VE,21:$VF,65:[1,155],67:[1,156],75:[1,159],76:[1,160],77:[1,161],81:$VG,92:$VH,93:$VI,94:$VJ,97:$VK,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:$VU,211:$VV}),o($Vx,$VW),o($V9,$Vc1,{44:118,45:119,46:120,48:121,38:162,41:163,47:$V_,49:$V$}),o($Va1,$Vd1,{61:164,63:165,68:166,40:167,74:168,114:169,75:$VX,76:$VY,77:$VZ,115:$VD,120:$VD,122:$VD}),o($Va1,$Ve1),o($Va1,$Vf1,{64:170,60:171,69:172,88:173,90:174,91:178,95:179,92:$Vg1,93:$Vh1,94:$Vi1,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{34:181,36:182,40:184,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vl1),o($Vm1,$Vn1,{78:185}),o($Vo1,$Vn1,{78:186}),o($Vp1,$Vn1,{78:187}),o($Vq1,$Vr1,{89:188}),o($Vm1,$Vs1,{95:96,91:189,97:$VK,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:190}),o($Vt1,$Vu1,{82:191}),o($Vt1,$Vu1,{82:192}),o($Vo1,$Vv1,{101:100,103:101,87:193,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),{115:[1,194],118:195,119:196,120:$Vw1,122:$Vx1},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{158:199}),o($VF1,$VG1),{96:[1,200]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,202],102:201,104:[1,203],105:[1,204],106:205,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,210]},{96:[2,115]},{96:[2,116]},{96:[2,117]},o($Vt1,$Vt),o($Vt1,$Vu),o($VM1,[2,124]),o($VM1,[2,125]),o($VM1,[2,126]),o($VM1,[2,127]),{96:[2,128]},{96:[2,129]},o($V9,$Vc1,{44:118,45:119,46:120,48:121,41:163,38:211,47:$V_,49:$V$}),o($Va1,$V11),o($Va1,$V21),{19:[1,215],21:[1,219],22:213,32:212,196:214,210:216,211:[1,218],212:[1,217]},o($V9,$VN1),o($V9,$VO1,{46:220,47:$V_}),o($V81,$V91,{29:221,48:222,49:$V$}),o($V81,$VP1),o($Va1,$VQ1),o($Vx,$Vg,{28:223,50:224,36:225,39:$Vy}),o($Vx,$Vg,{50:226,36:227,39:$Vy}),o($V01,$VR1),o($V01,$Vl),o($V01,$Vm),o($V01,$Vq),o($V01,$Vr),o($V01,$Vs),o($V01,$Vt),o($V01,$Vu),o($V0,$VS1),o($V0,$VT1),o($V0,$VU1),o($V9,$Vv),{19:$V41,21:$V51,22:228,210:139,211:$V61},o($V9,$Vw),o($V9,$Vq),o($V9,$Vr),o($V9,$Vt),o($V9,$Vu),o($Vx,$Vg,{28:229,50:230,36:231,39:$Vy}),o($V9,$Vz),o($V9,$VA),o($V9,$VB),o($VC,$VD,{37:232,60:233,62:234,68:235,69:238,71:239,74:240,88:241,90:242,83:244,84:245,85:246,114:247,91:251,22:252,87:254,95:255,210:258,101:259,103:260,19:$VV1,21:$VW1,65:[1,236],67:[1,237],81:$VX1,92:$VY1,93:$VZ1,94:$V_1,97:$V$1,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:$V02,211:$V12}),o($Vf,$VW,{40:263,75:$V22,76:$V32,77:$V42}),{41:267,44:268,45:269,46:270,47:$V52,48:271,49:$V62},o($V9,$V72,{46:274,47:$V_}),o($V81,$V82,{48:275,49:$V$}),o($Va1,$V92),o($Va1,$Vd1,{63:165,68:166,40:167,74:168,114:169,61:276,75:$VX,76:$VY,77:$VZ,115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{60:171,69:172,88:173,90:174,91:178,95:179,64:277,92:$Vg1,93:$Vh1,94:$Vi1,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:278,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vc2,$V11),o($Vc2,$V21),{19:[1,282],21:[1,286],22:280,32:279,196:281,210:283,211:[1,285],212:[1,284]},o($V9,$Vf2),o($V9,$Vg2),o($Va1,$Vh2),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:287}),{115:[1,288],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vj2),o($Va1,$Vk2),o($Vo1,$Vn1,{78:289}),o($Vl2,$Vr1,{89:290}),o($Vo1,$Vs1,{95:179,91:291,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,292]},o($Vl2,$VH1),{66:[1,293]},o($VC,$VD,{37:294,60:295,62:296,68:297,69:300,71:301,74:302,88:303,90:304,83:306,84:307,85:308,114:309,91:313,22:314,87:316,95:317,210:320,101:321,103:322,19:[1,319],21:[1,324],65:[1,298],67:[1,299],81:[1,305],92:[1,310],93:[1,311],94:[1,312],97:$Vm2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,315],211:[1,323]}),o($Vf,$VW,{40:325,75:$Vn2,76:$Vo2,77:$Vp2}),{41:329,44:330,45:331,46:332,47:$Vq2,48:333,49:$Vr2},o($Vs2,$Vt2,{79:336,80:337,188:338,186:[1,339]}),o($Vu2,$Vt2,{79:340,80:341,188:342,186:$Vv2}),o($Vw2,$Vt2,{79:344,80:345,188:346,186:[1,347]}),o($Vm1,$Vx2,{95:96,91:348,97:$VK,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:349,91:350,87:351,95:352,101:354,103:355,97:$VA2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:349,91:350,87:351,95:352,101:354,103:355,97:$VA2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:349,91:350,87:351,95:352,101:354,103:355,97:$VA2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($VE2,$VF2,{116:356,121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,117:$VG2,143:$VH2,185:$VI2}),o($VC,[2,135]),o($VC,[2,132]),o($VC,[2,133]),{19:$VJ2,21:$VK2,22:371,123:369,124:370,195:$VL2,210:374,211:$VM2},{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,377],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,409]},{107:$V93},{107:$Va3},{107:$Vb3},{107:$Vc3},o($VF1,$Vd3),o($V9,$Ve3),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($V81,$Vf3),o($V9,$Vg3,{46:274,47:$V_}),o($Va1,$Vh3),o($V81,$Vi3),o($Va1,$Vb1,{54:410}),o($VC,$VD,{58:411,60:412,62:413,63:414,69:417,71:418,68:419,40:420,88:421,90:422,83:424,84:425,85:426,74:427,91:434,22:435,87:437,114:438,95:439,210:442,101:443,103:444,19:[1,441],21:[1,446],65:[1,415],67:[1,416],75:[1,428],76:[1,429],77:[1,430],81:[1,423],92:[1,431],93:[1,432],94:[1,433],97:$Vj3,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,436],211:[1,445]}),o($Va1,$Vk3),o($VC,$VD,{58:447,60:448,62:449,63:450,69:453,71:454,68:455,40:456,88:457,90:458,83:460,84:461,85:462,74:463,91:470,22:471,87:473,114:474,95:475,210:478,101:479,103:480,19:[1,477],21:[1,482],65:[1,451],67:[1,452],75:[1,464],76:[1,465],77:[1,466],81:[1,459],92:[1,467],93:[1,468],94:[1,469],97:$Vl3,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,472],211:[1,481]}),o($V9,$V71),o($V81,$V91,{29:483}),o($Va1,$Vb1,{54:484}),o($VC,$VD,{69:238,71:239,74:240,88:241,90:242,83:244,84:245,85:246,114:247,91:251,22:252,87:254,95:255,210:258,101:259,103:260,58:485,60:486,62:487,63:488,68:491,40:492,19:$VV1,21:$VW1,65:[1,489],67:[1,490],75:[1,493],76:[1,494],77:[1,495],81:$VX1,92:$VY1,93:$VZ1,94:$V_1,97:$V$1,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:$V02,211:$V12}),o($V9,$Vc1,{44:268,45:269,46:270,48:271,38:496,41:497,47:$V52,49:$V62}),o($Va1,$Vd1,{61:498,63:499,68:500,40:501,74:502,114:503,75:$V22,76:$V32,77:$V42,115:$VD,120:$VD,122:$VD}),o($Va1,$Ve1),o($Va1,$Vf1,{64:504,60:505,69:506,88:507,90:508,91:512,95:513,92:$Vm3,93:$Vn3,94:$Vo3,97:$Vp3,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:515,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vl1),o($Vm1,$Vn1,{78:516}),o($Vo1,$Vn1,{78:517}),o($Vp1,$Vn1,{78:518}),o($Vq1,$Vr1,{89:519}),o($Vm1,$Vs1,{95:255,91:520,97:$V$1,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:521}),o($Vt1,$Vu1,{82:522}),o($Vt1,$Vu1,{82:523}),o($Vo1,$Vv1,{101:259,103:260,87:524,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),{115:[1,525],118:195,119:196,120:$Vw1,122:$Vx1},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{158:526}),o($VF1,$VG1),{96:[1,527]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,529],102:528,104:[1,530],105:[1,531],106:532,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,533]},o($Vt1,$Vt),o($Vt1,$Vu),o($V9,$Vc1,{44:268,45:269,46:270,48:271,41:497,38:534,47:$V52,49:$V62}),o($Va1,$V11),o($Va1,$V21),{19:[1,538],21:[1,542],22:536,32:535,196:537,210:539,211:[1,541],212:[1,540]},o($V9,$VN1),o($V9,$VO1,{46:543,47:$V52}),o($V81,$V91,{29:544,48:545,49:$V62}),o($V81,$VP1),o($Va1,$VQ1),o($Vx,$Vg,{28:546,50:547,36:548,39:$Vy}),o($Vx,$Vg,{50:549,36:550,39:$Vy}),o($V81,$Vq3),o($Va1,$Vr3),o($Va1,$Vs3),o($Va1,$Vt3),{66:[1,551]},o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),o($Vu2,$Vt2,{80:341,188:342,79:552,186:$Vv2}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:553,117:$VG2,143:$VH2,185:$VI2}),o($Vu2,$Vt2,{80:341,188:342,79:554,186:$Vv2}),o($Vo1,$Vx2,{95:179,91:555,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vu3),{38:556,41:557,44:330,45:331,46:332,47:$Vq2,48:333,49:$Vr2,66:$Vc1},o($Vv3,$Vd1,{61:558,63:559,68:560,40:561,74:562,114:563,75:$Vn2,76:$Vo2,77:$Vp2,115:$VD,120:$VD,122:$VD}),o($Vv3,$Ve1),o($Vv3,$Vf1,{64:564,60:565,69:566,88:567,90:568,91:572,95:573,92:[1,569],93:[1,570],94:[1,571],97:$Vw3,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:575,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vv3,$Vl1),o($Vx3,$Vn1,{78:576}),o($Vy3,$Vn1,{78:577}),o($Vz3,$Vn1,{78:578}),o($VA3,$Vr1,{89:579}),o($Vx3,$Vs1,{95:317,91:580,97:$Vm2,98:$VL,99:$VM,100:$VN}),o($VB3,$Vu1,{82:581}),o($VB3,$Vu1,{82:582}),o($VB3,$Vu1,{82:583}),o($Vy3,$Vv1,{101:321,103:322,87:584,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),{115:[1,585],118:195,119:196,120:$Vw1,122:$Vx1},o($VA3,$Vy1),o($VA3,$Vz1),o($VA3,$VA1),o($VA3,$VB1),o($VB3,$VC1),o($VD1,$VE1,{158:586}),o($VC3,$VG1),{96:[1,587]},o($VA3,$VH1),o($VB3,$Vq),o($VB3,$Vr),{96:[1,589],102:588,104:[1,590],105:[1,591],106:592,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,593]},o($VB3,$Vt),o($VB3,$Vu),{38:594,41:557,44:330,45:331,46:332,47:$Vq2,48:333,49:$Vr2,66:$Vc1},o($Vv3,$V11),o($Vv3,$V21),{19:[1,598],21:[1,602],22:596,32:595,196:597,210:599,211:[1,601],212:[1,600]},{66:$VN1},{46:603,47:$Vq2,66:$VO1},o($VD3,$V91,{29:604,48:605,49:$Vr2}),o($VD3,$VP1),o($Vv3,$VQ1),o($Vx,$Vg,{28:606,50:607,36:608,39:$Vy}),o($Vx,$Vg,{50:609,36:610,39:$Vy}),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:611,189:[1,612]}),{19:$VI3,21:$VJ3,22:614,124:613,195:$VK3,210:617,211:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:620,189:[1,621]}),{19:$VI3,21:$VJ3,22:614,124:622,195:$VK3,210:617,211:$VL3},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:623,189:[1,624]}),{19:$VI3,21:$VJ3,22:614,124:625,195:$VK3,210:617,211:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,626]},o($Vt1,$VH1),{96:[1,628],102:627,104:[1,629],105:[1,630],106:631,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,632]},{117:[1,633]},{117:[2,137]},{117:$VS3},{117:$VT3,128:634,129:635,130:$VU3},{117:$VV3},o($VW3,$VX3),o($VW3,$VY3),o($VW3,$VZ3,{134:637,137:638,138:641,135:$V_3,136:$V$3}),o($V04,$V14,{140:642,145:643,146:644,149:645,150:647,65:[1,646],155:$V24,156:$V34}),o($V44,$V54),o($VE2,[2,163]),{19:[1,653],21:[1,657],22:651,144:650,196:652,210:654,211:[1,656],212:[1,655]},{19:[1,661],21:[1,665],22:659,144:658,196:660,210:662,211:[1,664],212:[1,663]},o($VC,[2,138],{22:371,210:374,124:666,19:$VJ2,21:$VK2,195:$VL2,211:$VM2}),o($V64,[2,139]),o($V64,$V74),o($V64,$V84),o($V64,$Vq),o($V64,$Vr),o($V64,$Vt),o($V64,$Vu),o($Vt1,$V94),o($VD1,[2,182]),o($VD1,[2,183]),o($VD1,[2,184]),o($VD1,[2,185]),{164:667,165:668,166:671,167:669,168:672,169:670,170:673,175:[1,674]},o($VD1,[2,200],{171:675,173:676,174:[1,677]}),o($VD1,[2,209],{178:678,180:679,174:[1,680]}),o($VD1,[2,217],{182:681,183:682,174:$Va4}),{174:$Va4,183:684},o($Vb4,$Vq),o($Vb4,$Vr),o($Vb4,$Vc4),o($Vb4,$Vd4),o($Vb4,$Ve4),o($Vb4,$Vt),o($Vb4,$Vu),o($Vb4,$Vf4),o($Vb4,$Vg4,{198:685,199:686,107:[1,687]}),o($Vb4,$Vh4),o($Vb4,$Vi4),o($Vb4,$Vj4),o($Vb4,$Vk4),o($Vb4,$Vl4),o($Vb4,$Vm4),o($Vb4,$Vn4),o($Vb4,$Vo4),o($Vb4,$Vp4),o($Vq4,$V93),o($Vq4,$Va3),o($Vq4,$Vb3),o($Vq4,$Vc3),{19:[1,690],21:[1,693],22:689,83:688,210:691,211:[1,692]},o($V81,$V82,{48:694,49:[1,695]}),o($Va1,$V92),o($Va1,$Vd1,{61:696,63:697,68:698,40:699,74:700,114:704,75:[1,701],76:[1,702],77:[1,703],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:705,60:706,69:707,88:708,90:709,91:713,95:714,92:[1,710],93:[1,711],94:[1,712],97:$Vr4,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:716,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:717}),o($Vo1,$Vn1,{78:718}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:719}),o($Vm1,$Vs1,{95:439,91:720,97:$Vj3,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:721}),o($Vt1,$Vu1,{82:722}),o($Vt1,$Vu1,{82:723}),o($Vo1,$Vv1,{101:443,103:444,87:724,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:725}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,729],21:[1,733],22:727,32:726,196:728,210:730,211:[1,732],212:[1,731]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{158:734}),o($VF1,$VG1),{115:[1,735],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,736]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,738],102:737,104:[1,739],105:[1,740],106:741,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,742]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$V92),o($Va1,$Vd1,{61:743,63:744,68:745,40:746,74:747,114:751,75:[1,748],76:[1,749],77:[1,750],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:752,60:753,69:754,88:755,90:756,91:760,95:761,92:[1,757],93:[1,758],94:[1,759],97:$Vs4,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:763,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:764}),o($Vo1,$Vn1,{78:765}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:766}),o($Vm1,$Vs1,{95:475,91:767,97:$Vl3,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:768}),o($Vt1,$Vu1,{82:769}),o($Vt1,$Vu1,{82:770}),o($Vo1,$Vv1,{101:479,103:480,87:771,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:772}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,776],21:[1,780],22:774,32:773,196:775,210:777,211:[1,779],212:[1,778]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{158:781}),o($VF1,$VG1),{115:[1,782],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,783]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,785],102:784,104:[1,786],105:[1,787],106:788,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,789]},o($Vt1,$Vt),o($Vt1,$Vu),o($V9,$V72,{46:790,47:$V52}),o($V81,$V82,{48:791,49:$V62}),o($Va1,$V92),o($Va1,$Vd1,{63:499,68:500,40:501,74:502,114:503,61:792,75:$V22,76:$V32,77:$V42,115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{60:505,69:506,88:507,90:508,91:512,95:513,64:793,92:$Vm3,93:$Vn3,94:$Vo3,97:$Vp3,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:794,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vc2,$V11),o($Vc2,$V21),{19:[1,798],21:[1,802],22:796,32:795,196:797,210:799,211:[1,801],212:[1,800]},o($V9,$Vf2),o($V9,$Vg2),o($Va1,$Vh2),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:803}),{115:[1,804],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vj2),o($Va1,$Vk2),o($Vo1,$Vn1,{78:805}),o($Vl2,$Vr1,{89:806}),o($Vo1,$Vs1,{95:513,91:807,97:$Vp3,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,808]},o($Vl2,$VH1),{66:[1,809]},o($Vs2,$Vt2,{79:810,80:811,188:812,186:[1,813]}),o($Vu2,$Vt2,{79:814,80:815,188:816,186:$Vt4}),o($Vw2,$Vt2,{79:818,80:819,188:820,186:[1,821]}),o($Vm1,$Vx2,{95:255,91:822,97:$V$1,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:823,91:824,87:825,95:826,101:828,103:829,97:$Vu4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:823,91:824,87:825,95:826,101:828,103:829,97:$Vu4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:823,91:824,87:825,95:826,101:828,103:829,97:$Vu4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:830,117:$VG2,143:$VH2,185:$VI2}),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,831],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,832]},o($VF1,$Vd3),o($V9,$Ve3),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($V81,$Vf3),o($V9,$Vg3,{46:790,47:$V52}),o($Va1,$Vh3),o($V81,$Vi3),o($Va1,$Vb1,{54:833}),o($VC,$VD,{58:834,60:835,62:836,63:837,69:840,71:841,68:842,40:843,88:844,90:845,83:847,84:848,85:849,74:850,91:857,22:858,87:860,114:861,95:862,210:865,101:866,103:867,19:[1,864],21:[1,869],65:[1,838],67:[1,839],75:[1,851],76:[1,852],77:[1,853],81:[1,846],92:[1,854],93:[1,855],94:[1,856],97:$Vv4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,859],211:[1,868]}),o($Va1,$Vk3),o($VC,$VD,{58:870,60:871,62:872,63:873,69:876,71:877,68:878,40:879,88:880,90:881,83:883,84:884,85:885,74:886,91:893,22:894,87:896,114:897,95:898,210:901,101:902,103:903,19:[1,900],21:[1,905],65:[1,874],67:[1,875],75:[1,887],76:[1,888],77:[1,889],81:[1,882],92:[1,890],93:[1,891],94:[1,892],97:$Vw4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,895],211:[1,904]}),o($Va1,$Vx4),o($Va1,$VN3),{117:[1,906]},o($Va1,$VF3),o($Vl2,$VO3),{66:$Vf2},{66:$Vg2},o($Vv3,$Vh2),o($Vv3,$Vi2),o($Vv3,$Vd2),o($Vv3,$Ve2),o($Vy3,$Vn1,{78:907}),{115:[1,908],118:195,119:196,120:$Vw1,122:$Vx1},o($Vv3,$Vj2),o($Vv3,$Vk2),o($Vy3,$Vn1,{78:909}),o($Vy4,$Vr1,{89:910}),o($Vy3,$Vs1,{95:573,91:911,97:$Vw3,98:$VL,99:$VM,100:$VN}),o($Vy4,$Vy1),o($Vy4,$Vz1),o($Vy4,$VA1),o($Vy4,$VB1),{96:[1,912]},o($Vy4,$VH1),{66:[1,913]},o($Vz4,$Vt2,{79:914,80:915,188:916,186:[1,917]}),o($VA4,$Vt2,{79:918,80:919,188:920,186:$VB4}),o($VC4,$Vt2,{79:922,80:923,188:924,186:[1,925]}),o($Vx3,$Vx2,{95:317,91:926,97:$Vm2,98:$VL,99:$VM,100:$VN}),o($VA3,$Vy2),o($Vy3,$Vz2,{86:927,91:928,87:929,95:930,101:932,103:933,97:$VD4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VB2,{86:927,91:928,87:929,95:930,101:932,103:933,97:$VD4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VC2,{86:927,91:928,87:929,95:930,101:932,103:933,97:$VD4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VC3,$VD2),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:934,117:$VG2,143:$VH2,185:$VI2}),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,935],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VA3,$V43),o($VC3,$V53),o($VC3,$V63),o($VC3,$V73),o($VC3,$V83),{107:[1,936]},o($VC3,$Vd3),{66:$Ve3},o($Vv3,$VR1),o($Vv3,$Vl),o($Vv3,$Vm),o($Vv3,$Vq),o($Vv3,$Vr),o($Vv3,$Vs),o($Vv3,$Vt),o($Vv3,$Vu),o($VD3,$Vf3),{46:937,47:$Vq2,66:$Vg3},o($Vv3,$Vh3),o($VD3,$Vi3),o($Vv3,$Vb1,{54:938}),o($VC,$VD,{58:939,60:940,62:941,63:942,69:945,71:946,68:947,40:948,88:949,90:950,83:952,84:953,85:954,74:955,91:962,22:963,87:965,114:966,95:967,210:970,101:971,103:972,19:[1,969],21:[1,974],65:[1,943],67:[1,944],75:[1,956],76:[1,957],77:[1,958],81:[1,951],92:[1,959],93:[1,960],94:[1,961],97:$VE4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,964],211:[1,973]}),o($Vv3,$Vk3),o($VC,$VD,{58:975,60:976,62:977,63:978,69:981,71:982,68:983,40:984,88:985,90:986,83:988,84:989,85:990,74:991,91:998,22:999,87:1001,114:1002,95:1003,210:1006,101:1007,103:1008,19:[1,1005],21:[1,1010],65:[1,979],67:[1,980],75:[1,992],76:[1,993],77:[1,994],81:[1,987],92:[1,995],93:[1,996],94:[1,997],97:$VF4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,1000],211:[1,1009]}),o($Vs2,$VG4),{19:$Vn,21:$Vo,22:1011,210:52,211:$Vp},{19:$VH4,21:$VI4,22:1013,96:[1,1024],104:[1,1025],105:[1,1026],106:1023,177:1014,187:1012,192:1017,193:1018,194:1019,197:1022,200:[1,1027],201:[1,1028],202:[1,1033],203:[1,1034],204:[1,1035],205:[1,1036],206:[1,1029],207:[1,1030],208:[1,1031],209:[1,1032],210:1016,211:$VJ4},o($VK4,$V74),o($VK4,$V84),o($VK4,$Vq),o($VK4,$Vr),o($VK4,$Vt),o($VK4,$Vu),o($Vu2,$VG4),{19:$Vn,21:$Vo,22:1037,210:52,211:$Vp},{19:$VL4,21:$VM4,22:1039,96:[1,1050],104:[1,1051],105:[1,1052],106:1049,177:1040,187:1038,192:1043,193:1044,194:1045,197:1048,200:[1,1053],201:[1,1054],202:[1,1059],203:[1,1060],204:[1,1061],205:[1,1062],206:[1,1055],207:[1,1056],208:[1,1057],209:[1,1058],210:1042,211:$VN4},o($Vw2,$VG4),{19:$Vn,21:$Vo,22:1063,210:52,211:$Vp},{19:$VO4,21:$VP4,22:1065,96:[1,1076],104:[1,1077],105:[1,1078],106:1075,177:1066,187:1064,192:1069,193:1070,194:1071,197:1074,200:[1,1079],201:[1,1080],202:[1,1085],203:[1,1086],204:[1,1087],205:[1,1088],206:[1,1081],207:[1,1082],208:[1,1083],209:[1,1084],210:1068,211:$VQ4},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,1089]},o($Vt1,$Vd3),o($Vp1,$VR4),{117:$VS4,129:1090,130:$VU3},o($VW3,$VT4),o($VE2,$VF2,{131:361,132:362,133:363,139:364,141:365,142:366,126:1091,143:$VH2,185:$VI2}),o($VW3,$VU4),o($VW3,$VZ3,{134:1092,138:1093,135:$V_3,136:$V$3}),o($VE2,$VF2,{139:364,141:365,142:366,133:1094,117:$VV4,130:$VV4,143:$VH2,185:$VI2}),o($VE2,$VF2,{139:364,141:365,142:366,133:1095,117:$VW4,130:$VW4,143:$VH2,185:$VI2}),o($V44,$VX4),o($V44,$VY4),o($V44,$VZ4),o($V44,$V_4),{19:$V$4,21:$V05,22:1097,124:1096,195:$V15,210:1100,211:$V25},o($VE2,$VF2,{142:366,121:1103,125:1104,126:1105,127:1106,131:1107,132:1108,133:1109,139:1110,141:1111,143:$VH2,185:$V35}),o($V04,[2,171]),o($V04,[2,176],{156:[1,1113]}),o($V04,[2,178],{155:[1,1114]}),o($V44,$V45),o($V44,$V55),o($V44,$V65),o($V44,$Vq),o($V44,$Vr),o($V44,$Vs),o($V44,$Vt),o($V44,$Vu),o($VE2,[2,161]),o($VE2,$V55),o($VE2,$V65),o($VE2,$Vq),o($VE2,$Vr),o($VE2,$Vs),o($VE2,$Vt),o($VE2,$Vu),o($V64,[2,140]),o($VD1,[2,186]),o($VD1,[2,193],{166:1115,175:$V75}),o($VD1,[2,194],{168:1117,175:$V85}),o($VD1,[2,195],{170:1119,175:$V95}),o($Va5,[2,187]),o($Va5,[2,189]),o($Va5,[2,191]),{19:$Vb5,21:$Vc5,22:1121,96:$Vd5,104:$Ve5,105:$Vf5,106:1132,177:1122,181:$Vg5,192:1126,193:1127,194:1128,197:1131,200:$Vh5,201:$Vi5,202:$Vj5,203:$Vk5,204:$Vl5,205:$Vm5,206:$Vn5,207:$Vo5,208:$Vp5,209:$Vq5,210:1125,211:$Vr5},o($VD1,[2,196]),o($VD1,[2,201]),o($Va5,[2,197],{172:1146}),o($VD1,[2,205]),o($VD1,[2,210]),o($Va5,[2,206],{179:1147}),o($VD1,[2,212]),o($VD1,[2,218]),o($Va5,[2,214],{184:1148}),o($VD1,[2,213]),o($Vb4,$Vs5),o($Vb4,$Vt5),{19:$VN2,21:$VO2,22:1150,83:1149,210:388,211:$V33},o($VF1,$Vu5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Va1,$Vr3),o($Vx,$Vg,{50:1151,36:1152,39:$Vy}),o($Va1,$Vs3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:1153}),o($Va1,$V11),o($Va1,$V21),{19:[1,1157],21:[1,1161],22:1155,32:1154,196:1156,210:1158,211:[1,1160],212:[1,1159]},{115:[1,1162],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vt3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:1163}),o($Vl2,$Vr1,{89:1164}),o($Vo1,$Vs1,{95:714,91:1165,97:$Vr4,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,1166]},o($Vl2,$VH1),{66:[1,1167]},o($Vs2,$Vt2,{79:1168,80:1169,188:1170,186:[1,1171]}),o($Vu2,$Vt2,{79:1172,80:1173,188:1174,186:$Vv5}),o($Vm1,$Vx2,{95:439,91:1176,97:$Vj3,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:1177,91:1178,87:1179,95:1180,101:1182,103:1183,97:$Vw5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:1177,91:1178,87:1179,95:1180,101:1182,103:1183,97:$Vw5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:1177,91:1178,87:1179,95:1180,101:1182,103:1183,97:$Vw5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:1184,80:1185,188:1186,186:[1,1187]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,1188],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1189,117:$VG2,143:$VH2,185:$VI2}),o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,1190]},o($VF1,$Vd3),o($Va1,$Vs3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:1191}),o($Va1,$V11),o($Va1,$V21),{19:[1,1195],21:[1,1199],22:1193,32:1192,196:1194,210:1196,211:[1,1198],212:[1,1197]},{115:[1,1200],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vt3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:1201}),o($Vl2,$Vr1,{89:1202}),o($Vo1,$Vs1,{95:761,91:1203,97:$Vs4,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,1204]},o($Vl2,$VH1),{66:[1,1205]},o($Vs2,$Vt2,{79:1206,80:1207,188:1208,186:[1,1209]}),o($Vu2,$Vt2,{79:1210,80:1211,188:1212,186:$Vx5}),o($Vm1,$Vx2,{95:475,91:1214,97:$Vl3,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:1215,91:1216,87:1217,95:1218,101:1220,103:1221,97:$Vy5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:1215,91:1216,87:1217,95:1218,101:1220,103:1221,97:$Vy5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:1215,91:1216,87:1217,95:1218,101:1220,103:1221,97:$Vy5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:1222,80:1223,188:1224,186:[1,1225]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,1226],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1227,117:$VG2,143:$VH2,185:$VI2}),o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,1228]},o($VF1,$Vd3),o($V81,$Vq3),o($Va1,$Vr3),o($Va1,$Vs3),o($Va1,$Vt3),{66:[1,1229]},o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),o($Vu2,$Vt2,{80:815,188:816,79:1230,186:$Vt4}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1231,117:$VG2,143:$VH2,185:$VI2}),o($Vu2,$Vt2,{80:815,188:816,79:1232,186:$Vt4}),o($Vo1,$Vx2,{95:513,91:1233,97:$Vp3,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vu3),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:1234,189:[1,1235]}),{19:$VI3,21:$VJ3,22:614,124:1236,195:$VK3,210:617,211:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:1237,189:[1,1238]}),{19:$VI3,21:$VJ3,22:614,124:1239,195:$VK3,210:617,211:$VL3},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:1240,189:[1,1241]}),{19:$VI3,21:$VJ3,22:614,124:1242,195:$VK3,210:617,211:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,1243]},o($Vt1,$VH1),{96:[1,1245],102:1244,104:[1,1246],105:[1,1247],106:1248,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,1249]},{117:[1,1250]},o($Vt1,$V94),{19:[1,1253],21:[1,1256],22:1252,83:1251,210:1254,211:[1,1255]},o($V81,$V82,{48:1257,49:[1,1258]}),o($Va1,$V92),o($Va1,$Vd1,{61:1259,63:1260,68:1261,40:1262,74:1263,114:1267,75:[1,1264],76:[1,1265],77:[1,1266],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:1268,60:1269,69:1270,88:1271,90:1272,91:1276,95:1277,92:[1,1273],93:[1,1274],94:[1,1275],97:$Vz5,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1279,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:1280}),o($Vo1,$Vn1,{78:1281}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:1282}),o($Vm1,$Vs1,{95:862,91:1283,97:$Vv4,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:1284}),o($Vt1,$Vu1,{82:1285}),o($Vt1,$Vu1,{82:1286}),o($Vo1,$Vv1,{101:866,103:867,87:1287,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:1288}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,1292],21:[1,1296],22:1290,32:1289,196:1291,210:1293,211:[1,1295],212:[1,1294]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{158:1297}),o($VF1,$VG1),{115:[1,1298],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,1299]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,1301],102:1300,104:[1,1302],105:[1,1303],106:1304,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,1305]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$V92),o($Va1,$Vd1,{61:1306,63:1307,68:1308,40:1309,74:1310,114:1314,75:[1,1311],76:[1,1312],77:[1,1313],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:1315,60:1316,69:1317,88:1318,90:1319,91:1323,95:1324,92:[1,1320],93:[1,1321],94:[1,1322],97:$VA5,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1326,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:1327}),o($Vo1,$Vn1,{78:1328}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:1329}),o($Vm1,$Vs1,{95:898,91:1330,97:$Vw4,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:1331}),o($Vt1,$Vu1,{82:1332}),o($Vt1,$Vu1,{82:1333}),o($Vo1,$Vv1,{101:902,103:903,87:1334,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:1335}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,1339],21:[1,1343],22:1337,32:1336,196:1338,210:1340,211:[1,1342],212:[1,1341]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{158:1344}),o($VF1,$VG1),{115:[1,1345],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,1346]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,1348],102:1347,104:[1,1349],105:[1,1350],106:1351,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,1352]},o($Vt1,$Vt),o($Vt1,$Vu),o($Vo1,$VR4),o($VA4,$Vt2,{80:919,188:920,79:1353,186:$VB4}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1354,117:$VG2,143:$VH2,185:$VI2}),o($VA4,$Vt2,{80:919,188:920,79:1355,186:$VB4}),o($Vy3,$Vx2,{95:573,91:1356,97:$Vw3,98:$VL,99:$VM,100:$VN}),o($Vy4,$Vy2),o($Vy4,$V43),o($Vv3,$Vu3),o($VB5,$VF3),o($Vx3,$VG3),o($VB5,$VH3,{31:1357,189:[1,1358]}),{19:$VI3,21:$VJ3,22:614,124:1359,195:$VK3,210:617,211:$VL3},o($Vv3,$VM3),o($Vy3,$VG3),o($Vv3,$VH3,{31:1360,189:[1,1361]}),{19:$VI3,21:$VJ3,22:614,124:1362,195:$VK3,210:617,211:$VL3},o($VC5,$VN3),o($Vz3,$VG3),o($VC5,$VH3,{31:1363,189:[1,1364]}),{19:$VI3,21:$VJ3,22:614,124:1365,195:$VK3,210:617,211:$VL3},o($VA3,$VO3),o($VB3,$VP3),o($VB3,$VQ3),o($VB3,$VR3),{96:[1,1366]},o($VB3,$VH1),{96:[1,1368],102:1367,104:[1,1369],105:[1,1370],106:1371,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,1372]},{117:[1,1373]},o($VB3,$V94),{19:[1,1376],21:[1,1379],22:1375,83:1374,210:1377,211:[1,1378]},o($VD3,$Vq3),o($VD3,$V82,{48:1380,49:[1,1381]}),o($Vv3,$V92),o($Vv3,$Vd1,{61:1382,63:1383,68:1384,40:1385,74:1386,114:1390,75:[1,1387],76:[1,1388],77:[1,1389],115:$VD,120:$VD,122:$VD}),o($Vv3,$Va2),o($Vv3,$Vf1,{64:1391,60:1392,69:1393,88:1394,90:1395,91:1399,95:1400,92:[1,1396],93:[1,1397],94:[1,1398],97:$VD5,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1402,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vv3,$Vb2),o($Vx3,$Vn1,{78:1403}),o($Vy3,$Vn1,{78:1404}),o($VC5,$Vd2),o($VC5,$Ve2),o($VA3,$Vr1,{89:1405}),o($Vx3,$Vs1,{95:967,91:1406,97:$VE4,98:$VL,99:$VM,100:$VN}),o($VB3,$Vu1,{82:1407}),o($VB3,$Vu1,{82:1408}),o($VB3,$Vu1,{82:1409}),o($Vy3,$Vv1,{101:971,103:972,87:1410,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vz3,$Vn1,{78:1411}),o($VC5,$V11),o($VC5,$V21),{19:[1,1415],21:[1,1419],22:1413,32:1412,196:1414,210:1416,211:[1,1418],212:[1,1417]},o($VA3,$Vy1),o($VA3,$Vz1),o($VA3,$VA1),o($VA3,$VB1),o($VB3,$VC1),o($VD1,$VE1,{158:1420}),o($VC3,$VG1),{115:[1,1421],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,1422]},o($VA3,$VH1),o($VB3,$Vq),o($VB3,$Vr),{96:[1,1424],102:1423,104:[1,1425],105:[1,1426],106:1427,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,1428]},o($VB3,$Vt),o($VB3,$Vu),o($Vv3,$V92),o($Vv3,$Vd1,{61:1429,63:1430,68:1431,40:1432,74:1433,114:1437,75:[1,1434],76:[1,1435],77:[1,1436],115:$VD,120:$VD,122:$VD}),o($Vv3,$Va2),o($Vv3,$Vf1,{64:1438,60:1439,69:1440,88:1441,90:1442,91:1446,95:1447,92:[1,1443],93:[1,1444],94:[1,1445],97:$VE5,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1449,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vv3,$Vb2),o($Vx3,$Vn1,{78:1450}),o($Vy3,$Vn1,{78:1451}),o($VC5,$Vd2),o($VC5,$Ve2),o($VA3,$Vr1,{89:1452}),o($Vx3,$Vs1,{95:1003,91:1453,97:$VF4,98:$VL,99:$VM,100:$VN}),o($VB3,$Vu1,{82:1454}),o($VB3,$Vu1,{82:1455}),o($VB3,$Vu1,{82:1456}),o($Vy3,$Vv1,{101:1007,103:1008,87:1457,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vz3,$Vn1,{78:1458}),o($VC5,$V11),o($VC5,$V21),{19:[1,1462],21:[1,1466],22:1460,32:1459,196:1461,210:1463,211:[1,1465],212:[1,1464]},o($VA3,$Vy1),o($VA3,$Vz1),o($VA3,$VA1),o($VA3,$VB1),o($VB3,$VC1),o($VD1,$VE1,{158:1467}),o($VC3,$VG1),{115:[1,1468],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,1469]},o($VA3,$VH1),o($VB3,$Vq),o($VB3,$Vr),{96:[1,1471],102:1470,104:[1,1472],105:[1,1473],106:1474,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,1475]},o($VB3,$Vt),o($VB3,$Vu),{189:[1,1478],190:1476,191:[1,1477]},o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$VH5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Ve4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vf4),o($Vm1,$Vg4,{198:1479,199:1480,107:[1,1481]}),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($Vm1,$Vp4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{189:[1,1484],190:1482,191:[1,1483]},o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$VH5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Ve4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vf4),o($Vo1,$Vg4,{198:1485,199:1486,107:[1,1487]}),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($Vo1,$Vp4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),{189:[1,1490],190:1488,191:[1,1489]},o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$VH5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Ve4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vf4),o($Vp1,$Vg4,{198:1491,199:1492,107:[1,1493]}),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($Vp1,$Vp4),o($VK5,$V93),o($VK5,$Va3),o($VK5,$Vb3),o($VK5,$Vc3),{19:[1,1496],21:[1,1499],22:1495,83:1494,210:1497,211:[1,1498]},o($VW3,$VL5),o($VW3,$VM5),o($VW3,$VN5),o($V44,$VO5),o($V44,$VP5),o($V44,$VQ5),o($Vx,$Vg,{42:1500,43:1501,51:1502,55:1503,36:1504,39:$Vy}),o($VR5,$V74),o($VR5,$V84),o($VR5,$Vq),o($VR5,$Vr),o($VR5,$Vt),o($VR5,$Vu),{66:[1,1505]},{66:$VS3},{66:$VT3,128:1506,129:1507,130:$VS5},{66:$VV3},o($VT5,$VX3),o($VT5,$VY3),o($VT5,$VZ3,{134:1509,137:1510,138:1513,135:$VU5,136:$VV5}),o($V04,$V14,{150:647,140:1514,145:1515,146:1516,149:1517,65:[1,1518],155:$V24,156:$V34}),o($VW5,$V54),{19:[1,1522],21:[1,1526],22:1520,144:1519,196:1521,210:1523,211:[1,1525],212:[1,1524]},o($V04,[2,177]),o($V04,[2,179]),o($Va5,[2,188]),{19:$Vb5,21:$Vc5,22:1121,210:1125,211:$Vr5},o($Va5,[2,190]),{96:$Vd5,104:$Ve5,105:$Vf5,106:1132,177:1122,192:1126,193:1127,194:1128,197:1131,200:$Vh5,201:$Vi5,202:$Vj5,203:$Vk5,204:$Vl5,205:$Vm5,206:$Vn5,207:$Vo5,208:$Vp5,209:$Vq5},o($Va5,[2,192]),{181:$Vg5},o($Va5,$VX5,{176:1527,174:$VY5}),o($Va5,$VX5,{176:1529,174:$VY5}),o($Va5,$VX5,{176:1530,174:$VY5}),o($VZ5,$Vq),o($VZ5,$Vr),o($VZ5,$Vc4),o($VZ5,$Vd4),o($VZ5,$Ve4),o($VZ5,$Vt),o($VZ5,$Vu),o($VZ5,$Vf4),o($VZ5,$Vg4,{198:1531,199:1532,107:[1,1533]}),o($VZ5,$Vh4),o($VZ5,$Vi4),o($VZ5,$Vj4),o($VZ5,$Vk4),o($VZ5,$Vl4),o($VZ5,$Vm4),o($VZ5,$Vn4),o($VZ5,$Vo4),o($VZ5,$Vp4),o($V_5,$V93),o($V_5,$Va3),o($V_5,$Vb3),o($V_5,$Vc3),o($VD1,[2,199],{166:1534,175:$V75}),o($VD1,[2,208],{168:1535,175:$V85}),o($VD1,[2,216],{170:1536,175:$V95}),o($Vb4,$V$5),o($Vb4,$VC1),o($Va1,$Vk3),o($VC,$VD,{58:1537,60:1538,62:1539,63:1540,69:1543,71:1544,68:1545,40:1546,88:1547,90:1548,83:1550,84:1551,85:1552,74:1553,91:1560,22:1561,87:1563,114:1564,95:1565,210:1568,101:1569,103:1570,19:[1,1567],21:[1,1572],65:[1,1541],67:[1,1542],75:[1,1554],76:[1,1555],77:[1,1556],81:[1,1549],92:[1,1557],93:[1,1558],94:[1,1559],97:$V06,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,1562],211:[1,1571]}),o($Vu2,$Vt2,{80:1173,188:1174,79:1573,186:$Vv5}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1574,117:$VG2,143:$VH2,185:$VI2}),o($Vu2,$Vt2,{80:1173,188:1174,79:1575,186:$Vv5}),o($Vo1,$Vx2,{95:714,91:1576,97:$Vr4,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vx4),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:1577,189:[1,1578]}),{19:$VI3,21:$VJ3,22:614,124:1579,195:$VK3,210:617,211:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:1580,189:[1,1581]}),{19:$VI3,21:$VJ3,22:614,124:1582,195:$VK3,210:617,211:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,1583]},o($Vt1,$VH1),{96:[1,1585],102:1584,104:[1,1586],105:[1,1587],106:1588,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,1589]},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:1590,189:[1,1591]}),{19:$VI3,21:$VJ3,22:614,124:1592,195:$VK3,210:617,211:$VL3},o($Vt1,$V94),{117:[1,1593]},{19:[1,1596],21:[1,1599],22:1595,83:1594,210:1597,211:[1,1598]},o($Vu2,$Vt2,{80:1211,188:1212,79:1600,186:$Vx5}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1601,117:$VG2,143:$VH2,185:$VI2}),o($Vu2,$Vt2,{80:1211,188:1212,79:1602,186:$Vx5}),o($Vo1,$Vx2,{95:761,91:1603,97:$Vs4,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vx4),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:1604,189:[1,1605]}),{19:$VI3,21:$VJ3,22:614,124:1606,195:$VK3,210:617,211:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:1607,189:[1,1608]}),{19:$VI3,21:$VJ3,22:614,124:1609,195:$VK3,210:617,211:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,1610]},o($Vt1,$VH1),{96:[1,1612],102:1611,104:[1,1613],105:[1,1614],106:1615,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,1616]},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:1617,189:[1,1618]}),{19:$VI3,21:$VJ3,22:614,124:1619,195:$VK3,210:617,211:$VL3},o($Vt1,$V94),{117:[1,1620]},{19:[1,1623],21:[1,1626],22:1622,83:1621,210:1624,211:[1,1625]},o($Va1,$Vx4),o($Va1,$VN3),{117:[1,1627]},o($Va1,$VF3),o($Vl2,$VO3),o($Vs2,$VG4),{19:$Vn,21:$Vo,22:1628,210:52,211:$Vp},{19:$V16,21:$V26,22:1630,96:[1,1641],104:[1,1642],105:[1,1643],106:1640,177:1631,187:1629,192:1634,193:1635,194:1636,197:1639,200:[1,1644],201:[1,1645],202:[1,1650],203:[1,1651],204:[1,1652],205:[1,1653],206:[1,1646],207:[1,1647],208:[1,1648],209:[1,1649],210:1633,211:$V36},o($Vu2,$VG4),{19:$Vn,21:$Vo,22:1654,210:52,211:$Vp},{19:$V46,21:$V56,22:1656,96:[1,1667],104:[1,1668],105:[1,1669],106:1666,177:1657,187:1655,192:1660,193:1661,194:1662,197:1665,200:[1,1670],201:[1,1671],202:[1,1676],203:[1,1677],204:[1,1678],205:[1,1679],206:[1,1672],207:[1,1673],208:[1,1674],209:[1,1675],210:1659,211:$V66},o($Vw2,$VG4),{19:$Vn,21:$Vo,22:1680,210:52,211:$Vp},{19:$V76,21:$V86,22:1682,96:[1,1693],104:[1,1694],105:[1,1695],106:1692,177:1683,187:1681,192:1686,193:1687,194:1688,197:1691,200:[1,1696],201:[1,1697],202:[1,1702],203:[1,1703],204:[1,1704],205:[1,1705],206:[1,1698],207:[1,1699],208:[1,1700],209:[1,1701],210:1685,211:$V96},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,1706]},o($Vt1,$Vd3),o($Vp1,$VR4),o($VF1,$Vu5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Va1,$Vr3),o($Vx,$Vg,{50:1707,36:1708,39:$Vy}),o($Va1,$Vs3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:1709}),o($Va1,$V11),o($Va1,$V21),{19:[1,1713],21:[1,1717],22:1711,32:1710,196:1712,210:1714,211:[1,1716],212:[1,1715]},{115:[1,1718],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vt3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:1719}),o($Vl2,$Vr1,{89:1720}),o($Vo1,$Vs1,{95:1277,91:1721,97:$Vz5,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,1722]},o($Vl2,$VH1),{66:[1,1723]},o($Vs2,$Vt2,{79:1724,80:1725,188:1726,186:[1,1727]}),o($Vu2,$Vt2,{79:1728,80:1729,188:1730,186:$Va6}),o($Vm1,$Vx2,{95:862,91:1732,97:$Vv4,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:1733,91:1734,87:1735,95:1736,101:1738,103:1739,97:$Vb6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:1733,91:1734,87:1735,95:1736,101:1738,103:1739,97:$Vb6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:1733,91:1734,87:1735,95:1736,101:1738,103:1739,97:$Vb6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:1740,80:1741,188:1742,186:[1,1743]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,1744],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1745,117:$VG2,143:$VH2,185:$VI2}),o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,1746]},o($VF1,$Vd3),o($Va1,$Vs3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:1747}),o($Va1,$V11),o($Va1,$V21),{19:[1,1751],21:[1,1755],22:1749,32:1748,196:1750,210:1752,211:[1,1754],212:[1,1753]},{115:[1,1756],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vt3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:1757}),o($Vl2,$Vr1,{89:1758}),o($Vo1,$Vs1,{95:1324,91:1759,97:$VA5,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,1760]},o($Vl2,$VH1),{66:[1,1761]},o($Vs2,$Vt2,{79:1762,80:1763,188:1764,186:[1,1765]}),o($Vu2,$Vt2,{79:1766,80:1767,188:1768,186:$Vc6}),o($Vm1,$Vx2,{95:898,91:1770,97:$Vw4,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:1771,91:1772,87:1773,95:1774,101:1776,103:1777,97:$Vd6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:1771,91:1772,87:1773,95:1774,101:1776,103:1777,97:$Vd6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:1771,91:1772,87:1773,95:1774,101:1776,103:1777,97:$Vd6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:1778,80:1779,188:1780,186:[1,1781]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,1782],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1783,117:$VG2,143:$VH2,185:$VI2}),o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,1784]},o($VF1,$Vd3),o($Vv3,$VN3),{117:[1,1785]},o($Vv3,$VF3),o($Vy4,$VO3),o($Vz4,$VG4),{19:$Vn,21:$Vo,22:1786,210:52,211:$Vp},{19:$Ve6,21:$Vf6,22:1788,96:[1,1799],104:[1,1800],105:[1,1801],106:1798,177:1789,187:1787,192:1792,193:1793,194:1794,197:1797,200:[1,1802],201:[1,1803],202:[1,1808],203:[1,1809],204:[1,1810],205:[1,1811],206:[1,1804],207:[1,1805],208:[1,1806],209:[1,1807],210:1791,211:$Vg6},o($VA4,$VG4),{19:$Vn,21:$Vo,22:1812,210:52,211:$Vp},{19:$Vh6,21:$Vi6,22:1814,96:[1,1825],104:[1,1826],105:[1,1827],106:1824,177:1815,187:1813,192:1818,193:1819,194:1820,197:1823,200:[1,1828],201:[1,1829],202:[1,1834],203:[1,1835],204:[1,1836],205:[1,1837],206:[1,1830],207:[1,1831],208:[1,1832],209:[1,1833],210:1817,211:$Vj6},o($VC4,$VG4),{19:$Vn,21:$Vo,22:1838,210:52,211:$Vp},{19:$Vk6,21:$Vl6,22:1840,96:[1,1851],104:[1,1852],105:[1,1853],106:1850,177:1841,187:1839,192:1844,193:1845,194:1846,197:1849,200:[1,1854],201:[1,1855],202:[1,1860],203:[1,1861],204:[1,1862],205:[1,1863],206:[1,1856],207:[1,1857],208:[1,1858],209:[1,1859],210:1843,211:$Vm6},o($VB3,$V43),o($VB3,$V53),o($VB3,$V63),o($VB3,$V73),o($VB3,$V83),{107:[1,1864]},o($VB3,$Vd3),o($Vz3,$VR4),o($VC3,$Vu5),o($VC3,$VC1),o($VC3,$Vq),o($VC3,$Vr),o($VC3,$Vt),o($VC3,$Vu),o($Vv3,$Vr3),o($Vx,$Vg,{50:1865,36:1866,39:$Vy}),o($Vv3,$Vs3),o($Vv3,$Vi2),o($Vv3,$Vd2),o($Vv3,$Ve2),o($Vy3,$Vn1,{78:1867}),o($Vv3,$V11),o($Vv3,$V21),{19:[1,1871],21:[1,1875],22:1869,32:1868,196:1870,210:1872,211:[1,1874],212:[1,1873]},{115:[1,1876],118:195,119:196,120:$Vw1,122:$Vx1},o($Vv3,$Vt3),o($Vv3,$Vk2),o($Vy3,$Vn1,{78:1877}),o($Vy4,$Vr1,{89:1878}),o($Vy3,$Vs1,{95:1400,91:1879,97:$VD5,98:$VL,99:$VM,100:$VN}),o($Vy4,$Vy1),o($Vy4,$Vz1),o($Vy4,$VA1),o($Vy4,$VB1),{96:[1,1880]},o($Vy4,$VH1),{66:[1,1881]},o($Vz4,$Vt2,{79:1882,80:1883,188:1884,186:[1,1885]}),o($VA4,$Vt2,{79:1886,80:1887,188:1888,186:$Vn6}),o($Vx3,$Vx2,{95:967,91:1890,97:$VE4,98:$VL,99:$VM,100:$VN}),o($VA3,$Vy2),o($Vy3,$Vz2,{86:1891,91:1892,87:1893,95:1894,101:1896,103:1897,97:$Vo6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VB2,{86:1891,91:1892,87:1893,95:1894,101:1896,103:1897,97:$Vo6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VC2,{86:1891,91:1892,87:1893,95:1894,101:1896,103:1897,97:$Vo6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VC3,$VD2),o($VC4,$Vt2,{79:1898,80:1899,188:1900,186:[1,1901]}),o($VC5,$VR1),o($VC5,$Vl),o($VC5,$Vm),o($VC5,$Vq),o($VC5,$Vr),o($VC5,$Vs),o($VC5,$Vt),o($VC5,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,1902],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1903,117:$VG2,143:$VH2,185:$VI2}),o($VA3,$V43),o($VC3,$V53),o($VC3,$V63),o($VC3,$V73),o($VC3,$V83),{107:[1,1904]},o($VC3,$Vd3),o($Vv3,$Vs3),o($Vv3,$Vi2),o($Vv3,$Vd2),o($Vv3,$Ve2),o($Vy3,$Vn1,{78:1905}),o($Vv3,$V11),o($Vv3,$V21),{19:[1,1909],21:[1,1913],22:1907,32:1906,196:1908,210:1910,211:[1,1912],212:[1,1911]},{115:[1,1914],118:195,119:196,120:$Vw1,122:$Vx1},o($Vv3,$Vt3),o($Vv3,$Vk2),o($Vy3,$Vn1,{78:1915}),o($Vy4,$Vr1,{89:1916}),o($Vy3,$Vs1,{95:1447,91:1917,97:$VE5,98:$VL,99:$VM,100:$VN}),o($Vy4,$Vy1),o($Vy4,$Vz1),o($Vy4,$VA1),o($Vy4,$VB1),{96:[1,1918]},o($Vy4,$VH1),{66:[1,1919]},o($Vz4,$Vt2,{79:1920,80:1921,188:1922,186:[1,1923]}),o($VA4,$Vt2,{79:1924,80:1925,188:1926,186:$Vp6}),o($Vx3,$Vx2,{95:1003,91:1928,97:$VF4,98:$VL,99:$VM,100:$VN}),o($VA3,$Vy2),o($Vy3,$Vz2,{86:1929,91:1930,87:1931,95:1932,101:1934,103:1935,97:$Vq6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VB2,{86:1929,91:1930,87:1931,95:1932,101:1934,103:1935,97:$Vq6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VC2,{86:1929,91:1930,87:1931,95:1932,101:1934,103:1935,97:$Vq6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VC3,$VD2),o($VC4,$Vt2,{79:1936,80:1937,188:1938,186:[1,1939]}),o($VC5,$VR1),o($VC5,$Vl),o($VC5,$Vm),o($VC5,$Vq),o($VC5,$Vr),o($VC5,$Vs),o($VC5,$Vt),o($VC5,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,1940],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1941,117:$VG2,143:$VH2,185:$VI2}),o($VA3,$V43),o($VC3,$V53),o($VC3,$V63),o($VC3,$V73),o($VC3,$V83),{107:[1,1942]},o($VC3,$Vd3),o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vs5),o($Vm1,$Vt5),{19:$VH4,21:$VI4,22:1944,83:1943,210:1016,211:$VJ4},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vs5),o($Vo1,$Vt5),{19:$VL4,21:$VM4,22:1946,83:1945,210:1042,211:$VN4},o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vs5),o($Vp1,$Vt5),{19:$VO4,21:$VP4,22:1948,83:1947,210:1068,211:$VQ4},o($Vt1,$Vu5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vr6,$Vs6,{147:1949,148:1950,151:$Vt6,152:$Vu6,153:$Vv6,154:$Vw6}),o($Vx6,$Vy6),o($Vz6,$VA6,{52:1955}),o($VB6,$VC6,{56:1956}),o($VC,$VD,{59:1957,69:1958,71:1959,72:1960,88:1963,90:1964,83:1966,84:1967,85:1968,74:1969,40:1970,91:1974,22:1975,87:1977,114:1978,95:1982,210:1985,101:1986,103:1987,19:[1,1984],21:[1,1989],65:[1,1961],67:[1,1962],75:[1,1979],76:[1,1980],77:[1,1981],81:[1,1965],92:[1,1971],93:[1,1972],94:[1,1973],97:$VD6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,1976],211:[1,1988]}),o($Vr6,$Vs6,{148:1950,147:1990,151:$Vt6,152:$Vu6,153:$Vv6,154:$Vw6}),{66:$VS4,129:1991,130:$VS5},o($VT5,$VT4),o($VE2,$VF2,{142:366,131:1107,132:1108,133:1109,139:1110,141:1111,126:1992,143:$VH2,185:$V35}),o($VT5,$VU4),o($VT5,$VZ3,{134:1993,138:1994,135:$VU5,136:$VV5}),o($VE2,$VF2,{142:366,139:1110,141:1111,133:1995,66:$VV4,130:$VV4,143:$VH2,185:$V35}),o($VE2,$VF2,{142:366,139:1110,141:1111,133:1996,66:$VW4,130:$VW4,143:$VH2,185:$V35}),o($VW5,$VX4),o($VW5,$VY4),o($VW5,$VZ4),o($VW5,$V_4),{19:$V$4,21:$V05,22:1097,124:1997,195:$V15,210:1100,211:$V25},o($VE2,$VF2,{142:366,125:1104,126:1105,127:1106,131:1107,132:1108,133:1109,139:1110,141:1111,121:1998,143:$VH2,185:$V35}),o($VW5,$V45),o($VW5,$V55),o($VW5,$V65),o($VW5,$Vq),o($VW5,$Vr),o($VW5,$Vs),o($VW5,$Vt),o($VW5,$Vu),o($Va5,[2,202]),o($Va5,[2,204]),o($Va5,[2,211]),o($Va5,[2,219]),o($VZ5,$Vs5),o($VZ5,$Vt5),{19:$Vb5,21:$Vc5,22:2000,83:1999,210:1125,211:$Vr5},o($Va5,[2,198]),o($Va5,[2,207]),o($Va5,[2,215]),o($Va1,$V92),o($Va1,$Vd1,{61:2001,63:2002,68:2003,40:2004,74:2005,114:2009,75:[1,2006],76:[1,2007],77:[1,2008],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:2010,60:2011,69:2012,88:2013,90:2014,91:2018,95:2019,92:[1,2015],93:[1,2016],94:[1,2017],97:$VE6,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2021,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:2022}),o($Vo1,$Vn1,{78:2023}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:2024}),o($Vm1,$Vs1,{95:1565,91:2025,97:$V06,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:2026}),o($Vt1,$Vu1,{82:2027}),o($Vt1,$Vu1,{82:2028}),o($Vo1,$Vv1,{101:1569,103:1570,87:2029,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:2030}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,2034],21:[1,2038],22:2032,32:2031,196:2033,210:2035,211:[1,2037],212:[1,2036]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{158:2039}),o($VF1,$VG1),{115:[1,2040],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,2041]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,2043],102:2042,104:[1,2044],105:[1,2045],106:2046,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,2047]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$VN3),{117:[1,2048]},o($Va1,$VF3),o($Vl2,$VO3),o($Vs2,$VG4),{19:$Vn,21:$Vo,22:2049,210:52,211:$Vp},{19:$VF6,21:$VG6,22:2051,96:[1,2062],104:[1,2063],105:[1,2064],106:2061,177:2052,187:2050,192:2055,193:2056,194:2057,197:2060,200:[1,2065],201:[1,2066],202:[1,2071],203:[1,2072],204:[1,2073],205:[1,2074],206:[1,2067],207:[1,2068],208:[1,2069],209:[1,2070],210:2054,211:$VH6},o($Vu2,$VG4),{19:$Vn,21:$Vo,22:2075,210:52,211:$Vp},{19:$VI6,21:$VJ6,22:2077,96:[1,2088],104:[1,2089],105:[1,2090],106:2087,177:2078,187:2076,192:2081,193:2082,194:2083,197:2086,200:[1,2091],201:[1,2092],202:[1,2097],203:[1,2098],204:[1,2099],205:[1,2100],206:[1,2093],207:[1,2094],208:[1,2095],209:[1,2096],210:2080,211:$VK6},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,2101]},o($Vt1,$Vd3),o($Vw2,$VG4),{19:$Vn,21:$Vo,22:2102,210:52,211:$Vp},{19:$VL6,21:$VM6,22:2104,96:[1,2115],104:[1,2116],105:[1,2117],106:2114,177:2105,187:2103,192:2108,193:2109,194:2110,197:2113,200:[1,2118],201:[1,2119],202:[1,2124],203:[1,2125],204:[1,2126],205:[1,2127],206:[1,2120],207:[1,2121],208:[1,2122],209:[1,2123],210:2107,211:$VN6},o($Vp1,$VR4),o($VF1,$Vu5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Va1,$VN3),{117:[1,2128]},o($Va1,$VF3),o($Vl2,$VO3),o($Vs2,$VG4),{19:$Vn,21:$Vo,22:2129,210:52,211:$Vp},{19:$VO6,21:$VP6,22:2131,96:[1,2142],104:[1,2143],105:[1,2144],106:2141,177:2132,187:2130,192:2135,193:2136,194:2137,197:2140,200:[1,2145],201:[1,2146],202:[1,2151],203:[1,2152],204:[1,2153],205:[1,2154],206:[1,2147],207:[1,2148],208:[1,2149],209:[1,2150],210:2134,211:$VQ6},o($Vu2,$VG4),{19:$Vn,21:$Vo,22:2155,210:52,211:$Vp},{19:$VR6,21:$VS6,22:2157,96:[1,2168],104:[1,2169],105:[1,2170],106:2167,177:2158,187:2156,192:2161,193:2162,194:2163,197:2166,200:[1,2171],201:[1,2172],202:[1,2177],203:[1,2178],204:[1,2179],205:[1,2180],206:[1,2173],207:[1,2174],208:[1,2175],209:[1,2176],210:2160,211:$VT6},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,2181]},o($Vt1,$Vd3),o($Vw2,$VG4),{19:$Vn,21:$Vo,22:2182,210:52,211:$Vp},{19:$VU6,21:$VV6,22:2184,96:[1,2195],104:[1,2196],105:[1,2197],106:2194,177:2185,187:2183,192:2188,193:2189,194:2190,197:2193,200:[1,2198],201:[1,2199],202:[1,2204],203:[1,2205],204:[1,2206],205:[1,2207],206:[1,2200],207:[1,2201],208:[1,2202],209:[1,2203],210:2187,211:$VW6},o($Vp1,$VR4),o($VF1,$Vu5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Vo1,$VR4),{189:[1,2210],190:2208,191:[1,2209]},o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$VH5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Ve4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vf4),o($Vm1,$Vg4,{198:2211,199:2212,107:[1,2213]}),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($Vm1,$Vp4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{189:[1,2216],190:2214,191:[1,2215]},o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$VH5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Ve4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vf4),o($Vo1,$Vg4,{198:2217,199:2218,107:[1,2219]}),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($Vo1,$Vp4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),{189:[1,2222],190:2220,191:[1,2221]},o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$VH5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Ve4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vf4),o($Vp1,$Vg4,{198:2223,199:2224,107:[1,2225]}),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($Vp1,$Vp4),o($VK5,$V93),o($VK5,$Va3),o($VK5,$Vb3),o($VK5,$Vc3),{19:[1,2228],21:[1,2231],22:2227,83:2226,210:2229,211:[1,2230]},o($Va1,$Vk3),o($VC,$VD,{58:2232,60:2233,62:2234,63:2235,69:2238,71:2239,68:2240,40:2241,88:2242,90:2243,83:2245,84:2246,85:2247,74:2248,91:2255,22:2256,87:2258,114:2259,95:2260,210:2263,101:2264,103:2265,19:[1,2262],21:[1,2267],65:[1,2236],67:[1,2237],75:[1,2249],76:[1,2250],77:[1,2251],81:[1,2244],92:[1,2252],93:[1,2253],94:[1,2254],97:$VX6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,2257],211:[1,2266]}),o($Vu2,$Vt2,{80:1729,188:1730,79:2268,186:$Va6}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:2269,117:$VG2,143:$VH2,185:$VI2}),o($Vu2,$Vt2,{80:1729,188:1730,79:2270,186:$Va6}),o($Vo1,$Vx2,{95:1277,91:2271,97:$Vz5,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vx4),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:2272,189:[1,2273]}),{19:$VI3,21:$VJ3,22:614,124:2274,195:$VK3,210:617,211:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:2275,189:[1,2276]}),{19:$VI3,21:$VJ3,22:614,124:2277,195:$VK3,210:617,211:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,2278]},o($Vt1,$VH1),{96:[1,2280],102:2279,104:[1,2281],105:[1,2282],106:2283,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,2284]},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:2285,189:[1,2286]}),{19:$VI3,21:$VJ3,22:614,124:2287,195:$VK3,210:617,211:$VL3},o($Vt1,$V94),{117:[1,2288]},{19:[1,2291],21:[1,2294],22:2290,83:2289,210:2292,211:[1,2293]},o($Vu2,$Vt2,{80:1767,188:1768,79:2295,186:$Vc6}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:2296,117:$VG2,143:$VH2,185:$VI2}),o($Vu2,$Vt2,{80:1767,188:1768,79:2297,186:$Vc6}),o($Vo1,$Vx2,{95:1324,91:2298,97:$VA5,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vx4),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:2299,189:[1,2300]}),{19:$VI3,21:$VJ3,22:614,124:2301,195:$VK3,210:617,211:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:2302,189:[1,2303]}),{19:$VI3,21:$VJ3,22:614,124:2304,195:$VK3,210:617,211:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,2305]},o($Vt1,$VH1),{96:[1,2307],102:2306,104:[1,2308],105:[1,2309],106:2310,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,2311]},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:2312,189:[1,2313]}),{19:$VI3,21:$VJ3,22:614,124:2314,195:$VK3,210:617,211:$VL3},o($Vt1,$V94),{117:[1,2315]},{19:[1,2318],21:[1,2321],22:2317,83:2316,210:2319,211:[1,2320]},o($Vy3,$VR4),{189:[1,2324],190:2322,191:[1,2323]},o($Vx3,$VF5),o($Vx3,$VG5),o($Vx3,$VH5),o($Vx3,$Vq),o($Vx3,$Vr),o($Vx3,$Vc4),o($Vx3,$Vd4),o($Vx3,$Ve4),o($Vx3,$Vt),o($Vx3,$Vu),o($Vx3,$Vf4),o($Vx3,$Vg4,{198:2325,199:2326,107:[1,2327]}),o($Vx3,$Vh4),o($Vx3,$Vi4),o($Vx3,$Vj4),o($Vx3,$Vk4),o($Vx3,$Vl4),o($Vx3,$Vm4),o($Vx3,$Vn4),o($Vx3,$Vo4),o($Vx3,$Vp4),o($VY6,$V93),o($VY6,$Va3),o($VY6,$Vb3),o($VY6,$Vc3),{189:[1,2330],190:2328,191:[1,2329]},o($Vy3,$VF5),o($Vy3,$VG5),o($Vy3,$VH5),o($Vy3,$Vq),o($Vy3,$Vr),o($Vy3,$Vc4),o($Vy3,$Vd4),o($Vy3,$Ve4),o($Vy3,$Vt),o($Vy3,$Vu),o($Vy3,$Vf4),o($Vy3,$Vg4,{198:2331,199:2332,107:[1,2333]}),o($Vy3,$Vh4),o($Vy3,$Vi4),o($Vy3,$Vj4),o($Vy3,$Vk4),o($Vy3,$Vl4),o($Vy3,$Vm4),o($Vy3,$Vn4),o($Vy3,$Vo4),o($Vy3,$Vp4),o($VZ6,$V93),o($VZ6,$Va3),o($VZ6,$Vb3),o($VZ6,$Vc3),{189:[1,2336],190:2334,191:[1,2335]},o($Vz3,$VF5),o($Vz3,$VG5),o($Vz3,$VH5),o($Vz3,$Vq),o($Vz3,$Vr),o($Vz3,$Vc4),o($Vz3,$Vd4),o($Vz3,$Ve4),o($Vz3,$Vt),o($Vz3,$Vu),o($Vz3,$Vf4),o($Vz3,$Vg4,{198:2337,199:2338,107:[1,2339]}),o($Vz3,$Vh4),o($Vz3,$Vi4),o($Vz3,$Vj4),o($Vz3,$Vk4),o($Vz3,$Vl4),o($Vz3,$Vm4),o($Vz3,$Vn4),o($Vz3,$Vo4),o($Vz3,$Vp4),o($V_6,$V93),o($V_6,$Va3),o($V_6,$Vb3),o($V_6,$Vc3),{19:[1,2342],21:[1,2345],22:2341,83:2340,210:2343,211:[1,2344]},o($Vv3,$Vk3),o($VC,$VD,{58:2346,60:2347,62:2348,63:2349,69:2352,71:2353,68:2354,40:2355,88:2356,90:2357,83:2359,84:2360,85:2361,74:2362,91:2369,22:2370,87:2372,114:2373,95:2374,210:2377,101:2378,103:2379,19:[1,2376],21:[1,2381],65:[1,2350],67:[1,2351],75:[1,2363],76:[1,2364],77:[1,2365],81:[1,2358],92:[1,2366],93:[1,2367],94:[1,2368],97:$V$6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,2371],211:[1,2380]}),o($VA4,$Vt2,{80:1887,188:1888,79:2382,186:$Vn6}),o($Vv3,$VR1),o($Vv3,$Vl),o($Vv3,$Vm),o($Vv3,$Vq),o($Vv3,$Vr),o($Vv3,$Vs),o($Vv3,$Vt),o($Vv3,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:2383,117:$VG2,143:$VH2,185:$VI2}),o($VA4,$Vt2,{80:1887,188:1888,79:2384,186:$Vn6}),o($Vy3,$Vx2,{95:1400,91:2385,97:$VD5,98:$VL,99:$VM,100:$VN}),o($Vy4,$Vy2),o($Vy4,$V43),o($Vv3,$Vx4),o($VB5,$VF3),o($Vx3,$VG3),o($VB5,$VH3,{31:2386,189:[1,2387]}),{19:$VI3,21:$VJ3,22:614,124:2388,195:$VK3,210:617,211:$VL3},o($Vv3,$VM3),o($Vy3,$VG3),o($Vv3,$VH3,{31:2389,189:[1,2390]}),{19:$VI3,21:$VJ3,22:614,124:2391,195:$VK3,210:617,211:$VL3},o($VA3,$VO3),o($VB3,$VP3),o($VB3,$VQ3),o($VB3,$VR3),{96:[1,2392]},o($VB3,$VH1),{96:[1,2394],102:2393,104:[1,2395],105:[1,2396],106:2397,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,2398]},o($VC5,$VN3),o($Vz3,$VG3),o($VC5,$VH3,{31:2399,189:[1,2400]}),{19:$VI3,21:$VJ3,22:614,124:2401,195:$VK3,210:617,211:$VL3},o($VB3,$V94),{117:[1,2402]},{19:[1,2405],21:[1,2408],22:2404,83:2403,210:2406,211:[1,2407]},o($VA4,$Vt2,{80:1925,188:1926,79:2409,186:$Vp6}),o($Vv3,$VR1),o($Vv3,$Vl),o($Vv3,$Vm),o($Vv3,$Vq),o($Vv3,$Vr),o($Vv3,$Vs),o($Vv3,$Vt),o($Vv3,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:2410,117:$VG2,143:$VH2,185:$VI2}),o($VA4,$Vt2,{80:1925,188:1926,79:2411,186:$Vp6}),o($Vy3,$Vx2,{95:1447,91:2412,97:$VE5,98:$VL,99:$VM,100:$VN}),o($Vy4,$Vy2),o($Vy4,$V43),o($Vv3,$Vx4),o($VB5,$VF3),o($Vx3,$VG3),o($VB5,$VH3,{31:2413,189:[1,2414]}),{19:$VI3,21:$VJ3,22:614,124:2415,195:$VK3,210:617,211:$VL3},o($Vv3,$VM3),o($Vy3,$VG3),o($Vv3,$VH3,{31:2416,189:[1,2417]}),{19:$VI3,21:$VJ3,22:614,124:2418,195:$VK3,210:617,211:$VL3},o($VA3,$VO3),o($VB3,$VP3),o($VB3,$VQ3),o($VB3,$VR3),{96:[1,2419]},o($VB3,$VH1),{96:[1,2421],102:2420,104:[1,2422],105:[1,2423],106:2424,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,2425]},o($VC5,$VN3),o($Vz3,$VG3),o($VC5,$VH3,{31:2426,189:[1,2427]}),{19:$VI3,21:$VJ3,22:614,124:2428,195:$VK3,210:617,211:$VL3},o($VB3,$V94),{117:[1,2429]},{19:[1,2432],21:[1,2435],22:2431,83:2430,210:2433,211:[1,2434]},o($Vm1,$V$5),o($Vm1,$VC1),o($Vo1,$V$5),o($Vo1,$VC1),o($Vp1,$V$5),o($Vp1,$VC1),o($Vr6,$Vn1,{78:2436}),o($Vr6,$V07),o($Vr6,$V17),o($Vr6,$V27),o($Vr6,$V37),o($Vr6,$V47),o($Vx6,$V57,{53:2437,47:[1,2438]}),o($Vz6,$V67,{57:2439,49:[1,2440]}),o($VB6,$V77),o($VB6,$V87,{70:2441,72:2442,74:2443,40:2444,114:2445,75:[1,2446],76:[1,2447],77:[1,2448],115:$VD,120:$VD,122:$VD}),o($VB6,$V97),o($VB6,$Va7,{73:2449,69:2450,88:2451,90:2452,91:2456,95:2457,92:[1,2453],93:[1,2454],94:[1,2455],97:$Vb7,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2459,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VB6,$Vc7),o($Vd7,$Vr1,{89:2460}),o($Ve7,$Vs1,{95:1982,91:2461,97:$VD6,98:$VL,99:$VM,100:$VN}),o($Vf7,$Vu1,{82:2462}),o($Vf7,$Vu1,{82:2463}),o($Vf7,$Vu1,{82:2464}),o($VB6,$Vv1,{101:1986,103:1987,87:2465,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vg7,$Vh7),o($Vg7,$Vi7),o($Vd7,$Vy1),o($Vd7,$Vz1),o($Vd7,$VA1),o($Vd7,$VB1),o($Vf7,$VC1),o($VD1,$VE1,{158:2466}),o($Vj7,$VG1),{115:[1,2467],118:195,119:196,120:$Vw1,122:$Vx1},o($Vg7,$V11),o($Vg7,$V21),{19:[1,2471],21:[1,2475],22:2469,32:2468,196:2470,210:2472,211:[1,2474],212:[1,2473]},{96:[1,2476]},o($Vd7,$VH1),o($Vf7,$Vq),o($Vf7,$Vr),{96:[1,2478],102:2477,104:[1,2479],105:[1,2480],106:2481,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,2482]},o($Vf7,$Vt),o($Vf7,$Vu),o($Vr6,$Vn1,{78:2483}),o($VT5,$VL5),o($VT5,$VM5),o($VT5,$VN5),o($VW5,$VO5),o($VW5,$VP5),o($VW5,$VQ5),o($Vx,$Vg,{42:2484,43:2485,51:2486,55:2487,36:2488,39:$Vy}),{66:[1,2489]},o($VZ5,$V$5),o($VZ5,$VC1),o($Va1,$Vs3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:2490}),o($Va1,$V11),o($Va1,$V21),{19:[1,2494],21:[1,2498],22:2492,32:2491,196:2493,210:2495,211:[1,2497],212:[1,2496]},{115:[1,2499],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vt3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:2500}),o($Vl2,$Vr1,{89:2501}),o($Vo1,$Vs1,{95:2019,91:2502,97:$VE6,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,2503]},o($Vl2,$VH1),{66:[1,2504]},o($Vs2,$Vt2,{79:2505,80:2506,188:2507,186:[1,2508]}),o($Vu2,$Vt2,{79:2509,80:2510,188:2511,186:$Vk7}),o($Vm1,$Vx2,{95:1565,91:2513,97:$V06,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:2514,91:2515,87:2516,95:2517,101:2519,103:2520,97:$Vl7,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:2514,91:2515,87:2516,95:2517,101:2519,103:2520,97:$Vl7,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:2514,91:2515,87:2516,95:2517,101:2519,103:2520,97:$Vl7,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:2521,80:2522,188:2523,186:[1,2524]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,2525],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:2526,117:$VG2,143:$VH2,185:$VI2}),o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,2527]},o($VF1,$Vd3),o($Vo1,$VR4),{189:[1,2530],190:2528,191:[1,2529]},o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$VH5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Ve4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vf4),o($Vm1,$Vg4,{198:2531,199:2532,107:[1,2533]}),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($Vm1,$Vp4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{189:[1,2536],190:2534,191:[1,2535]},o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$VH5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Ve4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vf4),o($Vo1,$Vg4,{198:2537,199:2538,107:[1,2539]}),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($Vo1,$Vp4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),{19:[1,2542],21:[1,2545],22:2541,83:2540,210:2543,211:[1,2544]},{189:[1,2548],190:2546,191:[1,2547]},o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$VH5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Ve4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vf4),o($Vp1,$Vg4,{198:2549,199:2550,107:[1,2551]}),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($Vp1,$Vp4),o($VK5,$V93),o($VK5,$Va3),o($VK5,$Vb3),o($VK5,$Vc3),o($Vo1,$VR4),{189:[1,2554],190:2552,191:[1,2553]},o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$VH5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Ve4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vf4),o($Vm1,$Vg4,{198:2555,199:2556,107:[1,2557]}),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($Vm1,$Vp4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{189:[1,2560],190:2558,191:[1,2559]},o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$VH5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Ve4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vf4),o($Vo1,$Vg4,{198:2561,199:2562,107:[1,2563]}),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($Vo1,$Vp4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),{19:[1,2566],21:[1,2569],22:2565,83:2564,210:2567,211:[1,2568]},{189:[1,2572],190:2570,191:[1,2571]},o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$VH5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Ve4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vf4),o($Vp1,$Vg4,{198:2573,199:2574,107:[1,2575]}),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($Vp1,$Vp4),o($VK5,$V93),o($VK5,$Va3),o($VK5,$Vb3),o($VK5,$Vc3),o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vs5),o($Vm1,$Vt5),{19:$V16,21:$V26,22:2577,83:2576,210:1633,211:$V36},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vs5),o($Vo1,$Vt5),{19:$V46,21:$V56,22:2579,83:2578,210:1659,211:$V66},o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vs5),o($Vp1,$Vt5),{19:$V76,21:$V86,22:2581,83:2580,210:1685,211:$V96},o($Vt1,$Vu5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$V92),o($Va1,$Vd1,{61:2582,63:2583,68:2584,40:2585,74:2586,114:2590,75:[1,2587],76:[1,2588],77:[1,2589],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:2591,60:2592,69:2593,88:2594,90:2595,91:2599,95:2600,92:[1,2596],93:[1,2597],94:[1,2598],97:$Vm7,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2602,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:2603}),o($Vo1,$Vn1,{78:2604}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:2605}),o($Vm1,$Vs1,{95:2260,91:2606,97:$VX6,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:2607}),o($Vt1,$Vu1,{82:2608}),o($Vt1,$Vu1,{82:2609}),o($Vo1,$Vv1,{101:2264,103:2265,87:2610,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:2611}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,2615],21:[1,2619],22:2613,32:2612,196:2614,210:2616,211:[1,2618],212:[1,2617]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{158:2620}),o($VF1,$VG1),{115:[1,2621],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,2622]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,2624],102:2623,104:[1,2625],105:[1,2626],106:2627,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,2628]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$VN3),{117:[1,2629]},o($Va1,$VF3),o($Vl2,$VO3),o($Vs2,$VG4),{19:$Vn,21:$Vo,22:2630,210:52,211:$Vp},{19:$Vn7,21:$Vo7,22:2632,96:[1,2643],104:[1,2644],105:[1,2645],106:2642,177:2633,187:2631,192:2636,193:2637,194:2638,197:2641,200:[1,2646],201:[1,2647],202:[1,2652],203:[1,2653],204:[1,2654],205:[1,2655],206:[1,2648],207:[1,2649],208:[1,2650],209:[1,2651],210:2635,211:$Vp7},o($Vu2,$VG4),{19:$Vn,21:$Vo,22:2656,210:52,211:$Vp},{19:$Vq7,21:$Vr7,22:2658,96:[1,2669],104:[1,2670],105:[1,2671],106:2668,177:2659,187:2657,192:2662,193:2663,194:2664,197:2667,200:[1,2672],201:[1,2673],202:[1,2678],203:[1,2679],204:[1,2680],205:[1,2681],206:[1,2674],207:[1,2675],208:[1,2676],209:[1,2677],210:2661,211:$Vs7},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,2682]},o($Vt1,$Vd3),o($Vw2,$VG4),{19:$Vn,21:$Vo,22:2683,210:52,211:$Vp},{19:$Vt7,21:$Vu7,22:2685,96:[1,2696],104:[1,2697],105:[1,2698],106:2695,177:2686,187:2684,192:2689,193:2690,194:2691,197:2694,200:[1,2699],201:[1,2700],202:[1,2705],203:[1,2706],204:[1,2707],205:[1,2708],206:[1,2701],207:[1,2702],208:[1,2703],209:[1,2704],210:2688,211:$Vv7},o($Vp1,$VR4),o($VF1,$Vu5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Va1,$VN3),{117:[1,2709]},o($Va1,$VF3),o($Vl2,$VO3),o($Vs2,$VG4),{19:$Vn,21:$Vo,22:2710,210:52,211:$Vp},{19:$Vw7,21:$Vx7,22:2712,96:[1,2723],104:[1,2724],105:[1,2725],106:2722,177:2713,187:2711,192:2716,193:2717,194:2718,197:2721,200:[1,2726],201:[1,2727],202:[1,2732],203:[1,2733],204:[1,2734],205:[1,2735],206:[1,2728],207:[1,2729],208:[1,2730],209:[1,2731],210:2715,211:$Vy7},o($Vu2,$VG4),{19:$Vn,21:$Vo,22:2736,210:52,211:$Vp},{19:$Vz7,21:$VA7,22:2738,96:[1,2749],104:[1,2750],105:[1,2751],106:2748,177:2739,187:2737,192:2742,193:2743,194:2744,197:2747,200:[1,2752],201:[1,2753],202:[1,2758],203:[1,2759],204:[1,2760],205:[1,2761],206:[1,2754],207:[1,2755],208:[1,2756],209:[1,2757],210:2741,211:$VB7},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,2762]},o($Vt1,$Vd3),o($Vw2,$VG4),{19:$Vn,21:$Vo,22:2763,210:52,211:$Vp},{19:$VC7,21:$VD7,22:2765,96:[1,2776],104:[1,2777],105:[1,2778],106:2775,177:2766,187:2764,192:2769,193:2770,194:2771,197:2774,200:[1,2779],201:[1,2780],202:[1,2785],203:[1,2786],204:[1,2787],205:[1,2788],206:[1,2781],207:[1,2782],208:[1,2783],209:[1,2784],210:2768,211:$VE7},o($Vp1,$VR4),o($VF1,$Vu5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Vz4,$VS1),o($Vz4,$VT1),o($Vz4,$VU1),o($Vx3,$Vs5),o($Vx3,$Vt5),{19:$Ve6,21:$Vf6,22:2790,83:2789,210:1791,211:$Vg6},o($VA4,$VS1),o($VA4,$VT1),o($VA4,$VU1),o($Vy3,$Vs5),o($Vy3,$Vt5),{19:$Vh6,21:$Vi6,22:2792,83:2791,210:1817,211:$Vj6},o($VC4,$VS1),o($VC4,$VT1),o($VC4,$VU1),o($Vz3,$Vs5),o($Vz3,$Vt5),{19:$Vk6,21:$Vl6,22:2794,83:2793,210:1843,211:$Vm6},o($VB3,$Vu5),o($VB3,$VC1),o($VB3,$Vq),o($VB3,$Vr),o($VB3,$Vt),o($VB3,$Vu),o($Vv3,$V92),o($Vv3,$Vd1,{61:2795,63:2796,68:2797,40:2798,74:2799,114:2803,75:[1,2800],76:[1,2801],77:[1,2802],115:$VD,120:$VD,122:$VD}),o($Vv3,$Va2),o($Vv3,$Vf1,{64:2804,60:2805,69:2806,88:2807,90:2808,91:2812,95:2813,92:[1,2809],93:[1,2810],94:[1,2811],97:$VF7,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2815,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vv3,$Vb2),o($Vx3,$Vn1,{78:2816}),o($Vy3,$Vn1,{78:2817}),o($VC5,$Vd2),o($VC5,$Ve2),o($VA3,$Vr1,{89:2818}),o($Vx3,$Vs1,{95:2374,91:2819,97:$V$6,98:$VL,99:$VM,100:$VN}),o($VB3,$Vu1,{82:2820}),o($VB3,$Vu1,{82:2821}),o($VB3,$Vu1,{82:2822}),o($Vy3,$Vv1,{101:2378,103:2379,87:2823,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vz3,$Vn1,{78:2824}),o($VC5,$V11),o($VC5,$V21),{19:[1,2828],21:[1,2832],22:2826,32:2825,196:2827,210:2829,211:[1,2831],212:[1,2830]},o($VA3,$Vy1),o($VA3,$Vz1),o($VA3,$VA1),o($VA3,$VB1),o($VB3,$VC1),o($VD1,$VE1,{158:2833}),o($VC3,$VG1),{115:[1,2834],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,2835]},o($VA3,$VH1),o($VB3,$Vq),o($VB3,$Vr),{96:[1,2837],102:2836,104:[1,2838],105:[1,2839],106:2840,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,2841]},o($VB3,$Vt),o($VB3,$Vu),o($Vv3,$VN3),{117:[1,2842]},o($Vv3,$VF3),o($Vy4,$VO3),o($Vz4,$VG4),{19:$Vn,21:$Vo,22:2843,210:52,211:$Vp},{19:$VG7,21:$VH7,22:2845,96:[1,2856],104:[1,2857],105:[1,2858],106:2855,177:2846,187:2844,192:2849,193:2850,194:2851,197:2854,200:[1,2859],201:[1,2860],202:[1,2865],203:[1,2866],204:[1,2867],205:[1,2868],206:[1,2861],207:[1,2862],208:[1,2863],209:[1,2864],210:2848,211:$VI7},o($VA4,$VG4),{19:$Vn,21:$Vo,22:2869,210:52,211:$Vp},{19:$VJ7,21:$VK7,22:2871,96:[1,2882],104:[1,2883],105:[1,2884],106:2881,177:2872,187:2870,192:2875,193:2876,194:2877,197:2880,200:[1,2885],201:[1,2886],202:[1,2891],203:[1,2892],204:[1,2893],205:[1,2894],206:[1,2887],207:[1,2888],208:[1,2889],209:[1,2890],210:2874,211:$VL7},o($VB3,$V43),o($VB3,$V53),o($VB3,$V63),o($VB3,$V73),o($VB3,$V83),{107:[1,2895]},o($VB3,$Vd3),o($VC4,$VG4),{19:$Vn,21:$Vo,22:2896,210:52,211:$Vp},{19:$VM7,21:$VN7,22:2898,96:[1,2909],104:[1,2910],105:[1,2911],106:2908,177:2899,187:2897,192:2902,193:2903,194:2904,197:2907,200:[1,2912],201:[1,2913],202:[1,2918],203:[1,2919],204:[1,2920],205:[1,2921],206:[1,2914],207:[1,2915],208:[1,2916],209:[1,2917],210:2901,211:$VO7},o($Vz3,$VR4),o($VC3,$Vu5),o($VC3,$VC1),o($VC3,$Vq),o($VC3,$Vr),o($VC3,$Vt),o($VC3,$Vu),o($Vv3,$VN3),{117:[1,2922]},o($Vv3,$VF3),o($Vy4,$VO3),o($Vz4,$VG4),{19:$Vn,21:$Vo,22:2923,210:52,211:$Vp},{19:$VP7,21:$VQ7,22:2925,96:[1,2936],104:[1,2937],105:[1,2938],106:2935,177:2926,187:2924,192:2929,193:2930,194:2931,197:2934,200:[1,2939],201:[1,2940],202:[1,2945],203:[1,2946],204:[1,2947],205:[1,2948],206:[1,2941],207:[1,2942],208:[1,2943],209:[1,2944],210:2928,211:$VR7},o($VA4,$VG4),{19:$Vn,21:$Vo,22:2949,210:52,211:$Vp},{19:$VS7,21:$VT7,22:2951,96:[1,2962],104:[1,2963],105:[1,2964],106:2961,177:2952,187:2950,192:2955,193:2956,194:2957,197:2960,200:[1,2965],201:[1,2966],202:[1,2971],203:[1,2972],204:[1,2973],205:[1,2974],206:[1,2967],207:[1,2968],208:[1,2969],209:[1,2970],210:2954,211:$VU7},o($VB3,$V43),o($VB3,$V53),o($VB3,$V63),o($VB3,$V73),o($VB3,$V83),{107:[1,2975]},o($VB3,$Vd3),o($VC4,$VG4),{19:$Vn,21:$Vo,22:2976,210:52,211:$Vp},{19:$VV7,21:$VW7,22:2978,96:[1,2989],104:[1,2990],105:[1,2991],106:2988,177:2979,187:2977,192:2982,193:2983,194:2984,197:2987,200:[1,2992],201:[1,2993],202:[1,2998],203:[1,2999],204:[1,3000],205:[1,3001],206:[1,2994],207:[1,2995],208:[1,2996],209:[1,2997],210:2981,211:$VX7},o($Vz3,$VR4),o($VC3,$Vu5),o($VC3,$VC1),o($VC3,$Vq),o($VC3,$Vr),o($VC3,$Vt),o($VC3,$Vu),o($VY7,$Vt2,{79:3002,80:3003,188:3004,186:$VZ7}),o($Vz6,$V_7),o($Vx,$Vg,{51:3006,55:3007,36:3008,39:$Vy}),o($VB6,$V$7),o($Vx,$Vg,{55:3009,36:3010,39:$Vy}),o($VB6,$V08),o($VB6,$V18),o($VB6,$Vh7),o($VB6,$Vi7),{115:[1,3011],118:195,119:196,120:$Vw1,122:$Vx1},o($VB6,$V11),o($VB6,$V21),{19:[1,3015],21:[1,3019],22:3013,32:3012,196:3014,210:3016,211:[1,3018],212:[1,3017]},o($VB6,$V28),o($VB6,$V38),o($V48,$Vr1,{89:3020}),o($VB6,$Vs1,{95:2457,91:3021,97:$Vb7,98:$VL,99:$VM,100:$VN}),o($V48,$Vy1),o($V48,$Vz1),o($V48,$VA1),o($V48,$VB1),{96:[1,3022]},o($V48,$VH1),{66:[1,3023]},o($Ve7,$Vx2,{95:1982,91:3024,97:$VD6,98:$VL,99:$VM,100:$VN}),o($Vd7,$Vy2),o($VB6,$Vz2,{86:3025,91:3026,87:3027,95:3028,101:3030,103:3031,97:$V58,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB6,$VB2,{86:3025,91:3026,87:3027,95:3028,101:3030,103:3031,97:$V58,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB6,$VC2,{86:3025,91:3026,87:3027,95:3028,101:3030,103:3031,97:$V58,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vj7,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,3032],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3033,117:$VG2,143:$VH2,185:$VI2}),o($Vg7,$VR1),o($Vg7,$Vl),o($Vg7,$Vm),o($Vg7,$Vq),o($Vg7,$Vr),o($Vg7,$Vs),o($Vg7,$Vt),o($Vg7,$Vu),o($Vd7,$V43),o($Vj7,$V53),o($Vj7,$V63),o($Vj7,$V73),o($Vj7,$V83),{107:[1,3034]},o($Vj7,$Vd3),o($VY7,$Vt2,{80:3003,188:3004,79:3035,186:$VZ7}),o($V68,$Vs6,{147:3036,148:3037,151:$V78,152:$V88,153:$V98,154:$Va8}),o($Vb8,$Vy6),o($Vc8,$VA6,{52:3042}),o($Vd8,$VC6,{56:3043}),o($VC,$VD,{59:3044,69:3045,71:3046,72:3047,88:3050,90:3051,83:3053,84:3054,85:3055,74:3056,40:3057,91:3061,22:3062,87:3064,114:3065,95:3069,210:3072,101:3073,103:3074,19:[1,3071],21:[1,3076],65:[1,3048],67:[1,3049],75:[1,3066],76:[1,3067],77:[1,3068],81:[1,3052],92:[1,3058],93:[1,3059],94:[1,3060],97:$Ve8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,3063],211:[1,3075]}),o($V68,$Vs6,{148:3037,147:3077,151:$V78,152:$V88,153:$V98,154:$Va8}),o($Vu2,$Vt2,{80:2510,188:2511,79:3078,186:$Vk7}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3079,117:$VG2,143:$VH2,185:$VI2}),o($Vu2,$Vt2,{80:2510,188:2511,79:3080,186:$Vk7}),o($Vo1,$Vx2,{95:2019,91:3081,97:$VE6,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vx4),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:3082,189:[1,3083]}),{19:$VI3,21:$VJ3,22:614,124:3084,195:$VK3,210:617,211:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:3085,189:[1,3086]}),{19:$VI3,21:$VJ3,22:614,124:3087,195:$VK3,210:617,211:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,3088]},o($Vt1,$VH1),{96:[1,3090],102:3089,104:[1,3091],105:[1,3092],106:3093,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,3094]},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:3095,189:[1,3096]}),{19:$VI3,21:$VJ3,22:614,124:3097,195:$VK3,210:617,211:$VL3},o($Vt1,$V94),{117:[1,3098]},{19:[1,3101],21:[1,3104],22:3100,83:3099,210:3102,211:[1,3103]},o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vs5),o($Vm1,$Vt5),{19:$VF6,21:$VG6,22:3106,83:3105,210:2054,211:$VH6},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vs5),o($Vo1,$Vt5),{19:$VI6,21:$VJ6,22:3108,83:3107,210:2080,211:$VK6},o($Vt1,$Vu5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vs5),o($Vp1,$Vt5),{19:$VL6,21:$VM6,22:3110,83:3109,210:2107,211:$VN6},o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vs5),o($Vm1,$Vt5),{19:$VO6,21:$VP6,22:3112,83:3111,210:2134,211:$VQ6},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vs5),o($Vo1,$Vt5),{19:$VR6,21:$VS6,22:3114,83:3113,210:2160,211:$VT6},o($Vt1,$Vu5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vs5),o($Vp1,$Vt5),{19:$VU6,21:$VV6,22:3116,83:3115,210:2187,211:$VW6},o($Vm1,$V$5),o($Vm1,$VC1),o($Vo1,$V$5),o($Vo1,$VC1),o($Vp1,$V$5),o($Vp1,$VC1),o($Va1,$Vs3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:3117}),o($Va1,$V11),o($Va1,$V21),{19:[1,3121],21:[1,3125],22:3119,32:3118,196:3120,210:3122,211:[1,3124],212:[1,3123]},{115:[1,3126],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vt3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:3127}),o($Vl2,$Vr1,{89:3128}),o($Vo1,$Vs1,{95:2600,91:3129,97:$Vm7,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,3130]},o($Vl2,$VH1),{66:[1,3131]},o($Vs2,$Vt2,{79:3132,80:3133,188:3134,186:[1,3135]}),o($Vu2,$Vt2,{79:3136,80:3137,188:3138,186:$Vf8}),o($Vm1,$Vx2,{95:2260,91:3140,97:$VX6,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:3141,91:3142,87:3143,95:3144,101:3146,103:3147,97:$Vg8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:3141,91:3142,87:3143,95:3144,101:3146,103:3147,97:$Vg8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:3141,91:3142,87:3143,95:3144,101:3146,103:3147,97:$Vg8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:3148,80:3149,188:3150,186:[1,3151]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,3152],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3153,117:$VG2,143:$VH2,185:$VI2}),o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,3154]},o($VF1,$Vd3),o($Vo1,$VR4),{189:[1,3157],190:3155,191:[1,3156]},o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$VH5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Ve4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vf4),o($Vm1,$Vg4,{198:3158,199:3159,107:[1,3160]}),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($Vm1,$Vp4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{189:[1,3163],190:3161,191:[1,3162]},o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$VH5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Ve4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vf4),o($Vo1,$Vg4,{198:3164,199:3165,107:[1,3166]}),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($Vo1,$Vp4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),{19:[1,3169],21:[1,3172],22:3168,83:3167,210:3170,211:[1,3171]},{189:[1,3175],190:3173,191:[1,3174]},o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$VH5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Ve4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vf4),o($Vp1,$Vg4,{198:3176,199:3177,107:[1,3178]}),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($Vp1,$Vp4),o($VK5,$V93),o($VK5,$Va3),o($VK5,$Vb3),o($VK5,$Vc3),o($Vo1,$VR4),{189:[1,3181],190:3179,191:[1,3180]},o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$VH5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Ve4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vf4),o($Vm1,$Vg4,{198:3182,199:3183,107:[1,3184]}),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($Vm1,$Vp4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{189:[1,3187],190:3185,191:[1,3186]},o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$VH5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Ve4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vf4),o($Vo1,$Vg4,{198:3188,199:3189,107:[1,3190]}),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($Vo1,$Vp4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),{19:[1,3193],21:[1,3196],22:3192,83:3191,210:3194,211:[1,3195]},{189:[1,3199],190:3197,191:[1,3198]},o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$VH5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Ve4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vf4),o($Vp1,$Vg4,{198:3200,199:3201,107:[1,3202]}),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($Vp1,$Vp4),o($VK5,$V93),o($VK5,$Va3),o($VK5,$Vb3),o($VK5,$Vc3),o($Vx3,$V$5),o($Vx3,$VC1),o($Vy3,$V$5),o($Vy3,$VC1),o($Vz3,$V$5),o($Vz3,$VC1),o($Vv3,$Vs3),o($Vv3,$Vi2),o($Vv3,$Vd2),o($Vv3,$Ve2),o($Vy3,$Vn1,{78:3203}),o($Vv3,$V11),o($Vv3,$V21),{19:[1,3207],21:[1,3211],22:3205,32:3204,196:3206,210:3208,211:[1,3210],212:[1,3209]},{115:[1,3212],118:195,119:196,120:$Vw1,122:$Vx1},o($Vv3,$Vt3),o($Vv3,$Vk2),o($Vy3,$Vn1,{78:3213}),o($Vy4,$Vr1,{89:3214}),o($Vy3,$Vs1,{95:2813,91:3215,97:$VF7,98:$VL,99:$VM,100:$VN}),o($Vy4,$Vy1),o($Vy4,$Vz1),o($Vy4,$VA1),o($Vy4,$VB1),{96:[1,3216]},o($Vy4,$VH1),{66:[1,3217]},o($Vz4,$Vt2,{79:3218,80:3219,188:3220,186:[1,3221]}),o($VA4,$Vt2,{79:3222,80:3223,188:3224,186:$Vh8}),o($Vx3,$Vx2,{95:2374,91:3226,97:$V$6,98:$VL,99:$VM,100:$VN}),o($VA3,$Vy2),o($Vy3,$Vz2,{86:3227,91:3228,87:3229,95:3230,101:3232,103:3233,97:$Vi8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VB2,{86:3227,91:3228,87:3229,95:3230,101:3232,103:3233,97:$Vi8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VC2,{86:3227,91:3228,87:3229,95:3230,101:3232,103:3233,97:$Vi8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VC3,$VD2),o($VC4,$Vt2,{79:3234,80:3235,188:3236,186:[1,3237]}),o($VC5,$VR1),o($VC5,$Vl),o($VC5,$Vm),o($VC5,$Vq),o($VC5,$Vr),o($VC5,$Vs),o($VC5,$Vt),o($VC5,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,3238],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3239,117:$VG2,143:$VH2,185:$VI2}),o($VA3,$V43),o($VC3,$V53),o($VC3,$V63),o($VC3,$V73),o($VC3,$V83),{107:[1,3240]},o($VC3,$Vd3),o($Vy3,$VR4),{189:[1,3243],190:3241,191:[1,3242]},o($Vx3,$VF5),o($Vx3,$VG5),o($Vx3,$VH5),o($Vx3,$Vq),o($Vx3,$Vr),o($Vx3,$Vc4),o($Vx3,$Vd4),o($Vx3,$Ve4),o($Vx3,$Vt),o($Vx3,$Vu),o($Vx3,$Vf4),o($Vx3,$Vg4,{198:3244,199:3245,107:[1,3246]}),o($Vx3,$Vh4),o($Vx3,$Vi4),o($Vx3,$Vj4),o($Vx3,$Vk4),o($Vx3,$Vl4),o($Vx3,$Vm4),o($Vx3,$Vn4),o($Vx3,$Vo4),o($Vx3,$Vp4),o($VY6,$V93),o($VY6,$Va3),o($VY6,$Vb3),o($VY6,$Vc3),{189:[1,3249],190:3247,191:[1,3248]},o($Vy3,$VF5),o($Vy3,$VG5),o($Vy3,$VH5),o($Vy3,$Vq),o($Vy3,$Vr),o($Vy3,$Vc4),o($Vy3,$Vd4),o($Vy3,$Ve4),o($Vy3,$Vt),o($Vy3,$Vu),o($Vy3,$Vf4),o($Vy3,$Vg4,{198:3250,199:3251,107:[1,3252]}),o($Vy3,$Vh4),o($Vy3,$Vi4),o($Vy3,$Vj4),o($Vy3,$Vk4),o($Vy3,$Vl4),o($Vy3,$Vm4),o($Vy3,$Vn4),o($Vy3,$Vo4),o($Vy3,$Vp4),o($VZ6,$V93),o($VZ6,$Va3),o($VZ6,$Vb3),o($VZ6,$Vc3),{19:[1,3255],21:[1,3258],22:3254,83:3253,210:3256,211:[1,3257]},{189:[1,3261],190:3259,191:[1,3260]},o($Vz3,$VF5),o($Vz3,$VG5),o($Vz3,$VH5),o($Vz3,$Vq),o($Vz3,$Vr),o($Vz3,$Vc4),o($Vz3,$Vd4),o($Vz3,$Ve4),o($Vz3,$Vt),o($Vz3,$Vu),o($Vz3,$Vf4),o($Vz3,$Vg4,{198:3262,199:3263,107:[1,3264]}),o($Vz3,$Vh4),o($Vz3,$Vi4),o($Vz3,$Vj4),o($Vz3,$Vk4),o($Vz3,$Vl4),o($Vz3,$Vm4),o($Vz3,$Vn4),o($Vz3,$Vo4),o($Vz3,$Vp4),o($V_6,$V93),o($V_6,$Va3),o($V_6,$Vb3),o($V_6,$Vc3),o($Vy3,$VR4),{189:[1,3267],190:3265,191:[1,3266]},o($Vx3,$VF5),o($Vx3,$VG5),o($Vx3,$VH5),o($Vx3,$Vq),o($Vx3,$Vr),o($Vx3,$Vc4),o($Vx3,$Vd4),o($Vx3,$Ve4),o($Vx3,$Vt),o($Vx3,$Vu),o($Vx3,$Vf4),o($Vx3,$Vg4,{198:3268,199:3269,107:[1,3270]}),o($Vx3,$Vh4),o($Vx3,$Vi4),o($Vx3,$Vj4),o($Vx3,$Vk4),o($Vx3,$Vl4),o($Vx3,$Vm4),o($Vx3,$Vn4),o($Vx3,$Vo4),o($Vx3,$Vp4),o($VY6,$V93),o($VY6,$Va3),o($VY6,$Vb3),o($VY6,$Vc3),{189:[1,3273],190:3271,191:[1,3272]},o($Vy3,$VF5),o($Vy3,$VG5),o($Vy3,$VH5),o($Vy3,$Vq),o($Vy3,$Vr),o($Vy3,$Vc4),o($Vy3,$Vd4),o($Vy3,$Ve4),o($Vy3,$Vt),o($Vy3,$Vu),o($Vy3,$Vf4),o($Vy3,$Vg4,{198:3274,199:3275,107:[1,3276]}),o($Vy3,$Vh4),o($Vy3,$Vi4),o($Vy3,$Vj4),o($Vy3,$Vk4),o($Vy3,$Vl4),o($Vy3,$Vm4),o($Vy3,$Vn4),o($Vy3,$Vo4),o($Vy3,$Vp4),o($VZ6,$V93),o($VZ6,$Va3),o($VZ6,$Vb3),o($VZ6,$Vc3),{19:[1,3279],21:[1,3282],22:3278,83:3277,210:3280,211:[1,3281]},{189:[1,3285],190:3283,191:[1,3284]},o($Vz3,$VF5),o($Vz3,$VG5),o($Vz3,$VH5),o($Vz3,$Vq),o($Vz3,$Vr),o($Vz3,$Vc4),o($Vz3,$Vd4),o($Vz3,$Ve4),o($Vz3,$Vt),o($Vz3,$Vu),o($Vz3,$Vf4),o($Vz3,$Vg4,{198:3286,199:3287,107:[1,3288]}),o($Vz3,$Vh4),o($Vz3,$Vi4),o($Vz3,$Vj4),o($Vz3,$Vk4),o($Vz3,$Vl4),o($Vz3,$Vm4),o($Vz3,$Vn4),o($Vz3,$Vo4),o($Vz3,$Vp4),o($V_6,$V93),o($V_6,$Va3),o($V_6,$Vb3),o($V_6,$Vc3),o($V44,$Vj8),o($Vr6,$VG3),o($V44,$VH3,{31:3289,189:[1,3290]}),{19:$VI3,21:$VJ3,22:614,124:3291,195:$VK3,210:617,211:$VL3},o($Vz6,$Vk8),o($VB6,$VC6,{56:3292}),o($VC,$VD,{59:3293,69:3294,71:3295,72:3296,88:3299,90:3300,83:3302,84:3303,85:3304,74:3305,40:3306,91:3310,22:3311,87:3313,114:3314,95:3318,210:3321,101:3322,103:3323,19:[1,3320],21:[1,3325],65:[1,3297],67:[1,3298],75:[1,3315],76:[1,3316],77:[1,3317],81:[1,3301],92:[1,3307],93:[1,3308],94:[1,3309],97:$Vl8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,3312],211:[1,3324]}),o($VB6,$Vm8),o($VC,$VD,{59:3326,69:3327,71:3328,72:3329,88:3332,90:3333,83:3335,84:3336,85:3337,74:3338,40:3339,91:3343,22:3344,87:3346,114:3347,95:3351,210:3354,101:3355,103:3356,19:[1,3353],21:[1,3358],65:[1,3330],67:[1,3331],75:[1,3348],76:[1,3349],77:[1,3350],81:[1,3334],92:[1,3340],93:[1,3341],94:[1,3342],97:$Vn8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,3345],211:[1,3357]}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3359,117:$VG2,143:$VH2,185:$VI2}),o($VB6,$VR1),o($VB6,$Vl),o($VB6,$Vm),o($VB6,$Vq),o($VB6,$Vr),o($VB6,$Vs),o($VB6,$Vt),o($VB6,$Vu),o($VB6,$Vx2,{95:2457,91:3360,97:$Vb7,98:$VL,99:$VM,100:$VN}),o($V48,$Vy2),o($V48,$V43),o($VB6,$Vo8),o($Vd7,$VO3),o($Vf7,$VP3),o($Vf7,$VQ3),o($Vf7,$VR3),{96:[1,3361]},o($Vf7,$VH1),{96:[1,3363],102:3362,104:[1,3364],105:[1,3365],106:3366,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,3367]},o($Vf7,$V94),{117:[1,3368]},{19:[1,3371],21:[1,3374],22:3370,83:3369,210:3372,211:[1,3373]},o($V44,$Vp8),o($V68,$Vn1,{78:3375}),o($V68,$V07),o($V68,$V17),o($V68,$V27),o($V68,$V37),o($V68,$V47),o($Vb8,$V57,{53:3376,47:[1,3377]}),o($Vc8,$V67,{57:3378,49:[1,3379]}),o($Vd8,$V77),o($Vd8,$V87,{70:3380,72:3381,74:3382,40:3383,114:3384,75:[1,3385],76:[1,3386],77:[1,3387],115:$VD,120:$VD,122:$VD}),o($Vd8,$V97),o($Vd8,$Va7,{73:3388,69:3389,88:3390,90:3391,91:3395,95:3396,92:[1,3392],93:[1,3393],94:[1,3394],97:$Vq8,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:3398,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vd8,$Vc7),o($Vr8,$Vr1,{89:3399}),o($Vs8,$Vs1,{95:3069,91:3400,97:$Ve8,98:$VL,99:$VM,100:$VN}),o($Vt8,$Vu1,{82:3401}),o($Vt8,$Vu1,{82:3402}),o($Vt8,$Vu1,{82:3403}),o($Vd8,$Vv1,{101:3073,103:3074,87:3404,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vu8,$Vh7),o($Vu8,$Vi7),o($Vr8,$Vy1),o($Vr8,$Vz1),o($Vr8,$VA1),o($Vr8,$VB1),o($Vt8,$VC1),o($VD1,$VE1,{158:3405}),o($Vv8,$VG1),{115:[1,3406],118:195,119:196,120:$Vw1,122:$Vx1},o($Vu8,$V11),o($Vu8,$V21),{19:[1,3410],21:[1,3414],22:3408,32:3407,196:3409,210:3411,211:[1,3413],212:[1,3412]},{96:[1,3415]},o($Vr8,$VH1),o($Vt8,$Vq),o($Vt8,$Vr),{96:[1,3417],102:3416,104:[1,3418],105:[1,3419],106:3420,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,3421]},o($Vt8,$Vt),o($Vt8,$Vu),o($V68,$Vn1,{78:3422}),o($Va1,$VN3),{117:[1,3423]},o($Va1,$VF3),o($Vl2,$VO3),o($Vs2,$VG4),{19:$Vn,21:$Vo,22:3424,210:52,211:$Vp},{19:$Vw8,21:$Vx8,22:3426,96:[1,3437],104:[1,3438],105:[1,3439],106:3436,177:3427,187:3425,192:3430,193:3431,194:3432,197:3435,200:[1,3440],201:[1,3441],202:[1,3446],203:[1,3447],204:[1,3448],205:[1,3449],206:[1,3442],207:[1,3443],208:[1,3444],209:[1,3445],210:3429,211:$Vy8},o($Vu2,$VG4),{19:$Vn,21:$Vo,22:3450,210:52,211:$Vp},{19:$Vz8,21:$VA8,22:3452,96:[1,3463],104:[1,3464],105:[1,3465],106:3462,177:3453,187:3451,192:3456,193:3457,194:3458,197:3461,200:[1,3466],201:[1,3467],202:[1,3472],203:[1,3473],204:[1,3474],205:[1,3475],206:[1,3468],207:[1,3469],208:[1,3470],209:[1,3471],210:3455,211:$VB8},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,3476]},o($Vt1,$Vd3),o($Vw2,$VG4),{19:$Vn,21:$Vo,22:3477,210:52,211:$Vp},{19:$VC8,21:$VD8,22:3479,96:[1,3490],104:[1,3491],105:[1,3492],106:3489,177:3480,187:3478,192:3483,193:3484,194:3485,197:3488,200:[1,3493],201:[1,3494],202:[1,3499],203:[1,3500],204:[1,3501],205:[1,3502],206:[1,3495],207:[1,3496],208:[1,3497],209:[1,3498],210:3482,211:$VE8},o($Vp1,$VR4),o($VF1,$Vu5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Vm1,$V$5),o($Vm1,$VC1),o($Vo1,$V$5),o($Vo1,$VC1),o($Vp1,$V$5),o($Vp1,$VC1),o($Vm1,$V$5),o($Vm1,$VC1),o($Vo1,$V$5),o($Vo1,$VC1),o($Vp1,$V$5),o($Vp1,$VC1),o($Vu2,$Vt2,{80:3137,188:3138,79:3503,186:$Vf8}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3504,117:$VG2,143:$VH2,185:$VI2}),o($Vu2,$Vt2,{80:3137,188:3138,79:3505,186:$Vf8}),o($Vo1,$Vx2,{95:2600,91:3506,97:$Vm7,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vx4),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:3507,189:[1,3508]}),{19:$VI3,21:$VJ3,22:614,124:3509,195:$VK3,210:617,211:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:3510,189:[1,3511]}),{19:$VI3,21:$VJ3,22:614,124:3512,195:$VK3,210:617,211:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,3513]},o($Vt1,$VH1),{96:[1,3515],102:3514,104:[1,3516],105:[1,3517],106:3518,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,3519]},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:3520,189:[1,3521]}),{19:$VI3,21:$VJ3,22:614,124:3522,195:$VK3,210:617,211:$VL3},o($Vt1,$V94),{117:[1,3523]},{19:[1,3526],21:[1,3529],22:3525,83:3524,210:3527,211:[1,3528]},o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vs5),o($Vm1,$Vt5),{19:$Vn7,21:$Vo7,22:3531,83:3530,210:2635,211:$Vp7},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vs5),o($Vo1,$Vt5),{19:$Vq7,21:$Vr7,22:3533,83:3532,210:2661,211:$Vs7},o($Vt1,$Vu5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vs5),o($Vp1,$Vt5),{19:$Vt7,21:$Vu7,22:3535,83:3534,210:2688,211:$Vv7},o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vs5),o($Vm1,$Vt5),{19:$Vw7,21:$Vx7,22:3537,83:3536,210:2715,211:$Vy7},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vs5),o($Vo1,$Vt5),{19:$Vz7,21:$VA7,22:3539,83:3538,210:2741,211:$VB7},o($Vt1,$Vu5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vs5),o($Vp1,$Vt5),{19:$VC7,21:$VD7,22:3541,83:3540,210:2768,211:$VE7},o($VA4,$Vt2,{80:3223,188:3224,79:3542,186:$Vh8}),o($Vv3,$VR1),o($Vv3,$Vl),o($Vv3,$Vm),o($Vv3,$Vq),o($Vv3,$Vr),o($Vv3,$Vs),o($Vv3,$Vt),o($Vv3,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3543,117:$VG2,143:$VH2,185:$VI2}),o($VA4,$Vt2,{80:3223,188:3224,79:3544,186:$Vh8}),o($Vy3,$Vx2,{95:2813,91:3545,97:$VF7,98:$VL,99:$VM,100:$VN}),o($Vy4,$Vy2),o($Vy4,$V43),o($Vv3,$Vx4),o($VB5,$VF3),o($Vx3,$VG3),o($VB5,$VH3,{31:3546,189:[1,3547]}),{19:$VI3,21:$VJ3,22:614,124:3548,195:$VK3,210:617,211:$VL3},o($Vv3,$VM3),o($Vy3,$VG3),o($Vv3,$VH3,{31:3549,189:[1,3550]}),{19:$VI3,21:$VJ3,22:614,124:3551,195:$VK3,210:617,211:$VL3},o($VA3,$VO3),o($VB3,$VP3),o($VB3,$VQ3),o($VB3,$VR3),{96:[1,3552]},o($VB3,$VH1),{96:[1,3554],102:3553,104:[1,3555],105:[1,3556],106:3557,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,3558]},o($VC5,$VN3),o($Vz3,$VG3),o($VC5,$VH3,{31:3559,189:[1,3560]}),{19:$VI3,21:$VJ3,22:614,124:3561,195:$VK3,210:617,211:$VL3},o($VB3,$V94),{117:[1,3562]},{19:[1,3565],21:[1,3568],22:3564,83:3563,210:3566,211:[1,3567]},o($Vz4,$VS1),o($Vz4,$VT1),o($Vz4,$VU1),o($Vx3,$Vs5),o($Vx3,$Vt5),{19:$VG7,21:$VH7,22:3570,83:3569,210:2848,211:$VI7},o($VA4,$VS1),o($VA4,$VT1),o($VA4,$VU1),o($Vy3,$Vs5),o($Vy3,$Vt5),{19:$VJ7,21:$VK7,22:3572,83:3571,210:2874,211:$VL7},o($VB3,$Vu5),o($VB3,$VC1),o($VB3,$Vq),o($VB3,$Vr),o($VB3,$Vt),o($VB3,$Vu),o($VC4,$VS1),o($VC4,$VT1),o($VC4,$VU1),o($Vz3,$Vs5),o($Vz3,$Vt5),{19:$VM7,21:$VN7,22:3574,83:3573,210:2901,211:$VO7},o($Vz4,$VS1),o($Vz4,$VT1),o($Vz4,$VU1),o($Vx3,$Vs5),o($Vx3,$Vt5),{19:$VP7,21:$VQ7,22:3576,83:3575,210:2928,211:$VR7},o($VA4,$VS1),o($VA4,$VT1),o($VA4,$VU1),o($Vy3,$Vs5),o($Vy3,$Vt5),{19:$VS7,21:$VT7,22:3578,83:3577,210:2954,211:$VU7},o($VB3,$Vu5),o($VB3,$VC1),o($VB3,$Vq),o($VB3,$Vr),o($VB3,$Vt),o($VB3,$Vu),o($VC4,$VS1),o($VC4,$VT1),o($VC4,$VU1),o($Vz3,$Vs5),o($Vz3,$Vt5),{19:$VV7,21:$VW7,22:3580,83:3579,210:2981,211:$VX7},o($VY7,$VG4),{19:$Vn,21:$Vo,22:3581,210:52,211:$Vp},{19:$VF8,21:$VG8,22:3583,96:[1,3594],104:[1,3595],105:[1,3596],106:3593,177:3584,187:3582,192:3587,193:3588,194:3589,197:3592,200:[1,3597],201:[1,3598],202:[1,3603],203:[1,3604],204:[1,3605],205:[1,3606],206:[1,3599],207:[1,3600],208:[1,3601],209:[1,3602],210:3586,211:$VH8},o($Vz6,$V67,{57:3607,49:[1,3608]}),o($VB6,$V77),o($VB6,$V87,{70:3609,72:3610,74:3611,40:3612,114:3613,75:[1,3614],76:[1,3615],77:[1,3616],115:$VD,120:$VD,122:$VD}),o($VB6,$V97),o($VB6,$Va7,{73:3617,69:3618,88:3619,90:3620,91:3624,95:3625,92:[1,3621],93:[1,3622],94:[1,3623],97:$VI8,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:3627,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VB6,$Vc7),o($Vd7,$Vr1,{89:3628}),o($Ve7,$Vs1,{95:3318,91:3629,97:$Vl8,98:$VL,99:$VM,100:$VN}),o($Vf7,$Vu1,{82:3630}),o($Vf7,$Vu1,{82:3631}),o($Vf7,$Vu1,{82:3632}),o($VB6,$Vv1,{101:3322,103:3323,87:3633,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vg7,$Vh7),o($Vg7,$Vi7),o($Vd7,$Vy1),o($Vd7,$Vz1),o($Vd7,$VA1),o($Vd7,$VB1),o($Vf7,$VC1),o($VD1,$VE1,{158:3634}),o($Vj7,$VG1),{115:[1,3635],118:195,119:196,120:$Vw1,122:$Vx1},o($Vg7,$V11),o($Vg7,$V21),{19:[1,3639],21:[1,3643],22:3637,32:3636,196:3638,210:3640,211:[1,3642],212:[1,3641]},{96:[1,3644]},o($Vd7,$VH1),o($Vf7,$Vq),o($Vf7,$Vr),{96:[1,3646],102:3645,104:[1,3647],105:[1,3648],106:3649,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,3650]},o($Vf7,$Vt),o($Vf7,$Vu),o($VB6,$V77),o($VB6,$V87,{70:3651,72:3652,74:3653,40:3654,114:3655,75:[1,3656],76:[1,3657],77:[1,3658],115:$VD,120:$VD,122:$VD}),o($VB6,$V97),o($VB6,$Va7,{73:3659,69:3660,88:3661,90:3662,91:3666,95:3667,92:[1,3663],93:[1,3664],94:[1,3665],97:$VJ8,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:3669,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VB6,$Vc7),o($Vd7,$Vr1,{89:3670}),o($Ve7,$Vs1,{95:3351,91:3671,97:$Vn8,98:$VL,99:$VM,100:$VN}),o($Vf7,$Vu1,{82:3672}),o($Vf7,$Vu1,{82:3673}),o($Vf7,$Vu1,{82:3674}),o($VB6,$Vv1,{101:3355,103:3356,87:3675,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vg7,$Vh7),o($Vg7,$Vi7),o($Vd7,$Vy1),o($Vd7,$Vz1),o($Vd7,$VA1),o($Vd7,$VB1),o($Vf7,$VC1),o($VD1,$VE1,{158:3676}),o($Vj7,$VG1),{115:[1,3677],118:195,119:196,120:$Vw1,122:$Vx1},o($Vg7,$V11),o($Vg7,$V21),{19:[1,3681],21:[1,3685],22:3679,32:3678,196:3680,210:3682,211:[1,3684],212:[1,3683]},{96:[1,3686]},o($Vd7,$VH1),o($Vf7,$Vq),o($Vf7,$Vr),{96:[1,3688],102:3687,104:[1,3689],105:[1,3690],106:3691,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,3692]},o($Vf7,$Vt),o($Vf7,$Vu),{117:[1,3693]},o($V48,$VO3),o($Vf7,$V43),o($Vf7,$V53),o($Vf7,$V63),o($Vf7,$V73),o($Vf7,$V83),{107:[1,3694]},o($Vf7,$Vd3),o($Vg7,$VR4),o($Vj7,$Vu5),o($Vj7,$VC1),o($Vj7,$Vq),o($Vj7,$Vr),o($Vj7,$Vt),o($Vj7,$Vu),o($VK8,$Vt2,{79:3695,80:3696,188:3697,186:$VL8}),o($Vc8,$V_7),o($Vx,$Vg,{51:3699,55:3700,36:3701,39:$Vy}),o($Vd8,$V$7),o($Vx,$Vg,{55:3702,36:3703,39:$Vy}),o($Vd8,$V08),o($Vd8,$V18),o($Vd8,$Vh7),o($Vd8,$Vi7),{115:[1,3704],118:195,119:196,120:$Vw1,122:$Vx1},o($Vd8,$V11),o($Vd8,$V21),{19:[1,3708],21:[1,3712],22:3706,32:3705,196:3707,210:3709,211:[1,3711],212:[1,3710]},o($Vd8,$V28),o($Vd8,$V38),o($VM8,$Vr1,{89:3713}),o($Vd8,$Vs1,{95:3396,91:3714,97:$Vq8,98:$VL,99:$VM,100:$VN}),o($VM8,$Vy1),o($VM8,$Vz1),o($VM8,$VA1),o($VM8,$VB1),{96:[1,3715]},o($VM8,$VH1),{66:[1,3716]},o($Vs8,$Vx2,{95:3069,91:3717,97:$Ve8,98:$VL,99:$VM,100:$VN}),o($Vr8,$Vy2),o($Vd8,$Vz2,{86:3718,91:3719,87:3720,95:3721,101:3723,103:3724,97:$VN8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vd8,$VB2,{86:3718,91:3719,87:3720,95:3721,101:3723,103:3724,97:$VN8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vd8,$VC2,{86:3718,91:3719,87:3720,95:3721,101:3723,103:3724,97:$VN8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vv8,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,3725],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3726,117:$VG2,143:$VH2,185:$VI2}),o($Vu8,$VR1),o($Vu8,$Vl),o($Vu8,$Vm),o($Vu8,$Vq),o($Vu8,$Vr),o($Vu8,$Vs),o($Vu8,$Vt),o($Vu8,$Vu),o($Vr8,$V43),o($Vv8,$V53),o($Vv8,$V63),o($Vv8,$V73),o($Vv8,$V83),{107:[1,3727]},o($Vv8,$Vd3),o($VK8,$Vt2,{80:3696,188:3697,79:3728,186:$VL8}),o($Vo1,$VR4),{189:[1,3731],190:3729,191:[1,3730]},o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$VH5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Ve4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vf4),o($Vm1,$Vg4,{198:3732,199:3733,107:[1,3734]}),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($Vm1,$Vp4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{189:[1,3737],190:3735,191:[1,3736]},o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$VH5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Ve4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vf4),o($Vo1,$Vg4,{198:3738,199:3739,107:[1,3740]}),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($Vo1,$Vp4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),{19:[1,3743],21:[1,3746],22:3742,83:3741,210:3744,211:[1,3745]},{189:[1,3749],190:3747,191:[1,3748]},o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$VH5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Ve4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vf4),o($Vp1,$Vg4,{198:3750,199:3751,107:[1,3752]}),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($Vp1,$Vp4),o($VK5,$V93),o($VK5,$Va3),o($VK5,$Vb3),o($VK5,$Vc3),o($Va1,$VN3),{117:[1,3753]},o($Va1,$VF3),o($Vl2,$VO3),o($Vs2,$VG4),{19:$Vn,21:$Vo,22:3754,210:52,211:$Vp},{19:$VO8,21:$VP8,22:3756,96:[1,3767],104:[1,3768],105:[1,3769],106:3766,177:3757,187:3755,192:3760,193:3761,194:3762,197:3765,200:[1,3770],201:[1,3771],202:[1,3776],203:[1,3777],204:[1,3778],205:[1,3779],206:[1,3772],207:[1,3773],208:[1,3774],209:[1,3775],210:3759,211:$VQ8},o($Vu2,$VG4),{19:$Vn,21:$Vo,22:3780,210:52,211:$Vp},{19:$VR8,21:$VS8,22:3782,96:[1,3793],104:[1,3794],105:[1,3795],106:3792,177:3783,187:3781,192:3786,193:3787,194:3788,197:3791,200:[1,3796],201:[1,3797],202:[1,3802],203:[1,3803],204:[1,3804],205:[1,3805],206:[1,3798],207:[1,3799],208:[1,3800],209:[1,3801],210:3785,211:$VT8},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,3806]},o($Vt1,$Vd3),o($Vw2,$VG4),{19:$Vn,21:$Vo,22:3807,210:52,211:$Vp},{19:$VU8,21:$VV8,22:3809,96:[1,3820],104:[1,3821],105:[1,3822],106:3819,177:3810,187:3808,192:3813,193:3814,194:3815,197:3818,200:[1,3823],201:[1,3824],202:[1,3829],203:[1,3830],204:[1,3831],205:[1,3832],206:[1,3825],207:[1,3826],208:[1,3827],209:[1,3828],210:3812,211:$VW8},o($Vp1,$VR4),o($VF1,$Vu5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Vm1,$V$5),o($Vm1,$VC1),o($Vo1,$V$5),o($Vo1,$VC1),o($Vp1,$V$5),o($Vp1,$VC1),o($Vm1,$V$5),o($Vm1,$VC1),o($Vo1,$V$5),o($Vo1,$VC1),o($Vp1,$V$5),o($Vp1,$VC1),o($Vv3,$VN3),{117:[1,3833]},o($Vv3,$VF3),o($Vy4,$VO3),o($Vz4,$VG4),{19:$Vn,21:$Vo,22:3834,210:52,211:$Vp},{19:$VX8,21:$VY8,22:3836,96:[1,3847],104:[1,3848],105:[1,3849],106:3846,177:3837,187:3835,192:3840,193:3841,194:3842,197:3845,200:[1,3850],201:[1,3851],202:[1,3856],203:[1,3857],204:[1,3858],205:[1,3859],206:[1,3852],207:[1,3853],208:[1,3854],209:[1,3855],210:3839,211:$VZ8},o($VA4,$VG4),{19:$Vn,21:$Vo,22:3860,210:52,211:$Vp},{19:$V_8,21:$V$8,22:3862,96:[1,3873],104:[1,3874],105:[1,3875],106:3872,177:3863,187:3861,192:3866,193:3867,194:3868,197:3871,200:[1,3876],201:[1,3877],202:[1,3882],203:[1,3883],204:[1,3884],205:[1,3885],206:[1,3878],207:[1,3879],208:[1,3880],209:[1,3881],210:3865,211:$V09},o($VB3,$V43),o($VB3,$V53),o($VB3,$V63),o($VB3,$V73),o($VB3,$V83),{107:[1,3886]},o($VB3,$Vd3),o($VC4,$VG4),{19:$Vn,21:$Vo,22:3887,210:52,211:$Vp},{19:$V19,21:$V29,22:3889,96:[1,3900],104:[1,3901],105:[1,3902],106:3899,177:3890,187:3888,192:3893,193:3894,194:3895,197:3898,200:[1,3903],201:[1,3904],202:[1,3909],203:[1,3910],204:[1,3911],205:[1,3912],206:[1,3905],207:[1,3906],208:[1,3907],209:[1,3908],210:3892,211:$V39},o($Vz3,$VR4),o($VC3,$Vu5),o($VC3,$VC1),o($VC3,$Vq),o($VC3,$Vr),o($VC3,$Vt),o($VC3,$Vu),o($Vx3,$V$5),o($Vx3,$VC1),o($Vy3,$V$5),o($Vy3,$VC1),o($Vz3,$V$5),o($Vz3,$VC1),o($Vx3,$V$5),o($Vx3,$VC1),o($Vy3,$V$5),o($Vy3,$VC1),o($Vz3,$V$5),o($Vz3,$VC1),{189:[1,3915],190:3913,191:[1,3914]},o($Vr6,$VF5),o($Vr6,$VG5),o($Vr6,$VH5),o($Vr6,$Vq),o($Vr6,$Vr),o($Vr6,$Vc4),o($Vr6,$Vd4),o($Vr6,$Ve4),o($Vr6,$Vt),o($Vr6,$Vu),o($Vr6,$Vf4),o($Vr6,$Vg4,{198:3916,199:3917,107:[1,3918]}),o($Vr6,$Vh4),o($Vr6,$Vi4),o($Vr6,$Vj4),o($Vr6,$Vk4),o($Vr6,$Vl4),o($Vr6,$Vm4),o($Vr6,$Vn4),o($Vr6,$Vo4),o($Vr6,$Vp4),o($V49,$V93),o($V49,$Va3),o($V49,$Vb3),o($V49,$Vc3),o($VB6,$V$7),o($Vx,$Vg,{55:3919,36:3920,39:$Vy}),o($VB6,$V08),o($VB6,$V18),o($VB6,$Vh7),o($VB6,$Vi7),{115:[1,3921],118:195,119:196,120:$Vw1,122:$Vx1},o($VB6,$V11),o($VB6,$V21),{19:[1,3925],21:[1,3929],22:3923,32:3922,196:3924,210:3926,211:[1,3928],212:[1,3927]},o($VB6,$V28),o($VB6,$V38),o($V48,$Vr1,{89:3930}),o($VB6,$Vs1,{95:3625,91:3931,97:$VI8,98:$VL,99:$VM,100:$VN}),o($V48,$Vy1),o($V48,$Vz1),o($V48,$VA1),o($V48,$VB1),{96:[1,3932]},o($V48,$VH1),{66:[1,3933]},o($Ve7,$Vx2,{95:3318,91:3934,97:$Vl8,98:$VL,99:$VM,100:$VN}),o($Vd7,$Vy2),o($VB6,$Vz2,{86:3935,91:3936,87:3937,95:3938,101:3940,103:3941,97:$V59,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB6,$VB2,{86:3935,91:3936,87:3937,95:3938,101:3940,103:3941,97:$V59,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB6,$VC2,{86:3935,91:3936,87:3937,95:3938,101:3940,103:3941,97:$V59,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vj7,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,3942],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3943,117:$VG2,143:$VH2,185:$VI2}),o($Vg7,$VR1),o($Vg7,$Vl),o($Vg7,$Vm),o($Vg7,$Vq),o($Vg7,$Vr),o($Vg7,$Vs),o($Vg7,$Vt),o($Vg7,$Vu),o($Vd7,$V43),o($Vj7,$V53),o($Vj7,$V63),o($Vj7,$V73),o($Vj7,$V83),{107:[1,3944]},o($Vj7,$Vd3),o($VB6,$V08),o($VB6,$V18),o($VB6,$Vh7),o($VB6,$Vi7),{115:[1,3945],118:195,119:196,120:$Vw1,122:$Vx1},o($VB6,$V11),o($VB6,$V21),{19:[1,3949],21:[1,3953],22:3947,32:3946,196:3948,210:3950,211:[1,3952],212:[1,3951]},o($VB6,$V28),o($VB6,$V38),o($V48,$Vr1,{89:3954}),o($VB6,$Vs1,{95:3667,91:3955,97:$VJ8,98:$VL,99:$VM,100:$VN}),o($V48,$Vy1),o($V48,$Vz1),o($V48,$VA1),o($V48,$VB1),{96:[1,3956]},o($V48,$VH1),{66:[1,3957]},o($Ve7,$Vx2,{95:3351,91:3958,97:$Vn8,98:$VL,99:$VM,100:$VN}),o($Vd7,$Vy2),o($VB6,$Vz2,{86:3959,91:3960,87:3961,95:3962,101:3964,103:3965,97:$V69,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB6,$VB2,{86:3959,91:3960,87:3961,95:3962,101:3964,103:3965,97:$V69,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB6,$VC2,{86:3959,91:3960,87:3961,95:3962,101:3964,103:3965,97:$V69,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vj7,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,3966],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3967,117:$VG2,143:$VH2,185:$VI2}),o($Vg7,$VR1),o($Vg7,$Vl),o($Vg7,$Vm),o($Vg7,$Vq),o($Vg7,$Vr),o($Vg7,$Vs),o($Vg7,$Vt),o($Vg7,$Vu),o($Vd7,$V43),o($Vj7,$V53),o($Vj7,$V63),o($Vj7,$V73),o($Vj7,$V83),{107:[1,3968]},o($Vj7,$Vd3),o($VB6,$VR4),{19:[1,3971],21:[1,3974],22:3970,83:3969,210:3972,211:[1,3973]},o($VW5,$Vj8),o($V68,$VG3),o($VW5,$VH3,{31:3975,189:[1,3976]}),{19:$VI3,21:$VJ3,22:614,124:3977,195:$VK3,210:617,211:$VL3},o($Vc8,$Vk8),o($Vd8,$VC6,{56:3978}),o($VC,$VD,{59:3979,69:3980,71:3981,72:3982,88:3985,90:3986,83:3988,84:3989,85:3990,74:3991,40:3992,91:3996,22:3997,87:3999,114:4000,95:4004,210:4007,101:4008,103:4009,19:[1,4006],21:[1,4011],65:[1,3983],67:[1,3984],75:[1,4001],76:[1,4002],77:[1,4003],81:[1,3987],92:[1,3993],93:[1,3994],94:[1,3995],97:$V79,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,3998],211:[1,4010]}),o($Vd8,$Vm8),o($VC,$VD,{59:4012,69:4013,71:4014,72:4015,88:4018,90:4019,83:4021,84:4022,85:4023,74:4024,40:4025,91:4029,22:4030,87:4032,114:4033,95:4037,210:4040,101:4041,103:4042,19:[1,4039],21:[1,4044],65:[1,4016],67:[1,4017],75:[1,4034],76:[1,4035],77:[1,4036],81:[1,4020],92:[1,4026],93:[1,4027],94:[1,4028],97:$V89,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,4031],211:[1,4043]}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4045,117:$VG2,143:$VH2,185:$VI2}),o($Vd8,$VR1),o($Vd8,$Vl),o($Vd8,$Vm),o($Vd8,$Vq),o($Vd8,$Vr),o($Vd8,$Vs),o($Vd8,$Vt),o($Vd8,$Vu),o($Vd8,$Vx2,{95:3396,91:4046,97:$Vq8,98:$VL,99:$VM,100:$VN}),o($VM8,$Vy2),o($VM8,$V43),o($Vd8,$Vo8),o($Vr8,$VO3),o($Vt8,$VP3),o($Vt8,$VQ3),o($Vt8,$VR3),{96:[1,4047]},o($Vt8,$VH1),{96:[1,4049],102:4048,104:[1,4050],105:[1,4051],106:4052,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,4053]},o($Vt8,$V94),{117:[1,4054]},{19:[1,4057],21:[1,4060],22:4056,83:4055,210:4058,211:[1,4059]},o($VW5,$Vp8),o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vs5),o($Vm1,$Vt5),{19:$Vw8,21:$Vx8,22:4062,83:4061,210:3429,211:$Vy8},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vs5),o($Vo1,$Vt5),{19:$Vz8,21:$VA8,22:4064,83:4063,210:3455,211:$VB8},o($Vt1,$Vu5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vs5),o($Vp1,$Vt5),{19:$VC8,21:$VD8,22:4066,83:4065,210:3482,211:$VE8},o($Vo1,$VR4),{189:[1,4069],190:4067,191:[1,4068]},o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$VH5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Ve4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vf4),o($Vm1,$Vg4,{198:4070,199:4071,107:[1,4072]}),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($Vm1,$Vp4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{189:[1,4075],190:4073,191:[1,4074]},o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$VH5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Ve4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vf4),o($Vo1,$Vg4,{198:4076,199:4077,107:[1,4078]}),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($Vo1,$Vp4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),{19:[1,4081],21:[1,4084],22:4080,83:4079,210:4082,211:[1,4083]},{189:[1,4087],190:4085,191:[1,4086]},o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$VH5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Ve4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vf4),o($Vp1,$Vg4,{198:4088,199:4089,107:[1,4090]}),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($Vp1,$Vp4),o($VK5,$V93),o($VK5,$Va3),o($VK5,$Vb3),o($VK5,$Vc3),o($Vy3,$VR4),{189:[1,4093],190:4091,191:[1,4092]},o($Vx3,$VF5),o($Vx3,$VG5),o($Vx3,$VH5),o($Vx3,$Vq),o($Vx3,$Vr),o($Vx3,$Vc4),o($Vx3,$Vd4),o($Vx3,$Ve4),o($Vx3,$Vt),o($Vx3,$Vu),o($Vx3,$Vf4),o($Vx3,$Vg4,{198:4094,199:4095,107:[1,4096]}),o($Vx3,$Vh4),o($Vx3,$Vi4),o($Vx3,$Vj4),o($Vx3,$Vk4),o($Vx3,$Vl4),o($Vx3,$Vm4),o($Vx3,$Vn4),o($Vx3,$Vo4),o($Vx3,$Vp4),o($VY6,$V93),o($VY6,$Va3),o($VY6,$Vb3),o($VY6,$Vc3),{189:[1,4099],190:4097,191:[1,4098]},o($Vy3,$VF5),o($Vy3,$VG5),o($Vy3,$VH5),o($Vy3,$Vq),o($Vy3,$Vr),o($Vy3,$Vc4),o($Vy3,$Vd4),o($Vy3,$Ve4),o($Vy3,$Vt),o($Vy3,$Vu),o($Vy3,$Vf4),o($Vy3,$Vg4,{198:4100,199:4101,107:[1,4102]}),o($Vy3,$Vh4),o($Vy3,$Vi4),o($Vy3,$Vj4),o($Vy3,$Vk4),o($Vy3,$Vl4),o($Vy3,$Vm4),o($Vy3,$Vn4),o($Vy3,$Vo4),o($Vy3,$Vp4),o($VZ6,$V93),o($VZ6,$Va3),o($VZ6,$Vb3),o($VZ6,$Vc3),{19:[1,4105],21:[1,4108],22:4104,83:4103,210:4106,211:[1,4107]},{189:[1,4111],190:4109,191:[1,4110]},o($Vz3,$VF5),o($Vz3,$VG5),o($Vz3,$VH5),o($Vz3,$Vq),o($Vz3,$Vr),o($Vz3,$Vc4),o($Vz3,$Vd4),o($Vz3,$Ve4),o($Vz3,$Vt),o($Vz3,$Vu),o($Vz3,$Vf4),o($Vz3,$Vg4,{198:4112,199:4113,107:[1,4114]}),o($Vz3,$Vh4),o($Vz3,$Vi4),o($Vz3,$Vj4),o($Vz3,$Vk4),o($Vz3,$Vl4),o($Vz3,$Vm4),o($Vz3,$Vn4),o($Vz3,$Vo4),o($Vz3,$Vp4),o($V_6,$V93),o($V_6,$Va3),o($V_6,$Vb3),o($V_6,$Vc3),o($VY7,$VS1),o($VY7,$VT1),o($VY7,$VU1),o($Vr6,$Vs5),o($Vr6,$Vt5),{19:$VF8,21:$VG8,22:4116,83:4115,210:3586,211:$VH8},o($VB6,$Vm8),o($VC,$VD,{59:4117,69:4118,71:4119,72:4120,88:4123,90:4124,83:4126,84:4127,85:4128,74:4129,40:4130,91:4134,22:4135,87:4137,114:4138,95:4142,210:4145,101:4146,103:4147,19:[1,4144],21:[1,4149],65:[1,4121],67:[1,4122],75:[1,4139],76:[1,4140],77:[1,4141],81:[1,4125],92:[1,4131],93:[1,4132],94:[1,4133],97:$V99,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,4136],211:[1,4148]}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4150,117:$VG2,143:$VH2,185:$VI2}),o($VB6,$VR1),o($VB6,$Vl),o($VB6,$Vm),o($VB6,$Vq),o($VB6,$Vr),o($VB6,$Vs),o($VB6,$Vt),o($VB6,$Vu),o($VB6,$Vx2,{95:3625,91:4151,97:$VI8,98:$VL,99:$VM,100:$VN}),o($V48,$Vy2),o($V48,$V43),o($VB6,$Vo8),o($Vd7,$VO3),o($Vf7,$VP3),o($Vf7,$VQ3),o($Vf7,$VR3),{96:[1,4152]},o($Vf7,$VH1),{96:[1,4154],102:4153,104:[1,4155],105:[1,4156],106:4157,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,4158]},o($Vf7,$V94),{117:[1,4159]},{19:[1,4162],21:[1,4165],22:4161,83:4160,210:4163,211:[1,4164]},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4166,117:$VG2,143:$VH2,185:$VI2}),o($VB6,$VR1),o($VB6,$Vl),o($VB6,$Vm),o($VB6,$Vq),o($VB6,$Vr),o($VB6,$Vs),o($VB6,$Vt),o($VB6,$Vu),o($VB6,$Vx2,{95:3667,91:4167,97:$VJ8,98:$VL,99:$VM,100:$VN}),o($V48,$Vy2),o($V48,$V43),o($VB6,$Vo8),o($Vd7,$VO3),o($Vf7,$VP3),o($Vf7,$VQ3),o($Vf7,$VR3),{96:[1,4168]},o($Vf7,$VH1),{96:[1,4170],102:4169,104:[1,4171],105:[1,4172],106:4173,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,4174]},o($Vf7,$V94),{117:[1,4175]},{19:[1,4178],21:[1,4181],22:4177,83:4176,210:4179,211:[1,4180]},o($Vf7,$Vu5),o($Vf7,$VC1),o($Vf7,$Vq),o($Vf7,$Vr),o($Vf7,$Vt),o($Vf7,$Vu),o($VK8,$VG4),{19:$Vn,21:$Vo,22:4182,210:52,211:$Vp},{19:$Va9,21:$Vb9,22:4184,96:[1,4195],104:[1,4196],105:[1,4197],106:4194,177:4185,187:4183,192:4188,193:4189,194:4190,197:4193,200:[1,4198],201:[1,4199],202:[1,4204],203:[1,4205],204:[1,4206],205:[1,4207],206:[1,4200],207:[1,4201],208:[1,4202],209:[1,4203],210:4187,211:$Vc9},o($Vc8,$V67,{57:4208,49:[1,4209]}),o($Vd8,$V77),o($Vd8,$V87,{70:4210,72:4211,74:4212,40:4213,114:4214,75:[1,4215],76:[1,4216],77:[1,4217],115:$VD,120:$VD,122:$VD}),o($Vd8,$V97),o($Vd8,$Va7,{73:4218,69:4219,88:4220,90:4221,91:4225,95:4226,92:[1,4222],93:[1,4223],94:[1,4224],97:$Vd9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4228,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vd8,$Vc7),o($Vr8,$Vr1,{89:4229}),o($Vs8,$Vs1,{95:4004,91:4230,97:$V79,98:$VL,99:$VM,100:$VN}),o($Vt8,$Vu1,{82:4231}),o($Vt8,$Vu1,{82:4232}),o($Vt8,$Vu1,{82:4233}),o($Vd8,$Vv1,{101:4008,103:4009,87:4234,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vu8,$Vh7),o($Vu8,$Vi7),o($Vr8,$Vy1),o($Vr8,$Vz1),o($Vr8,$VA1),o($Vr8,$VB1),o($Vt8,$VC1),o($VD1,$VE1,{158:4235}),o($Vv8,$VG1),{115:[1,4236],118:195,119:196,120:$Vw1,122:$Vx1},o($Vu8,$V11),o($Vu8,$V21),{19:[1,4240],21:[1,4244],22:4238,32:4237,196:4239,210:4241,211:[1,4243],212:[1,4242]},{96:[1,4245]},o($Vr8,$VH1),o($Vt8,$Vq),o($Vt8,$Vr),{96:[1,4247],102:4246,104:[1,4248],105:[1,4249],106:4250,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,4251]},o($Vt8,$Vt),o($Vt8,$Vu),o($Vd8,$V77),o($Vd8,$V87,{70:4252,72:4253,74:4254,40:4255,114:4256,75:[1,4257],76:[1,4258],77:[1,4259],115:$VD,120:$VD,122:$VD}),o($Vd8,$V97),o($Vd8,$Va7,{73:4260,69:4261,88:4262,90:4263,91:4267,95:4268,92:[1,4264],93:[1,4265],94:[1,4266],97:$Ve9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4270,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vd8,$Vc7),o($Vr8,$Vr1,{89:4271}),o($Vs8,$Vs1,{95:4037,91:4272,97:$V89,98:$VL,99:$VM,100:$VN}),o($Vt8,$Vu1,{82:4273}),o($Vt8,$Vu1,{82:4274}),o($Vt8,$Vu1,{82:4275}),o($Vd8,$Vv1,{101:4041,103:4042,87:4276,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vu8,$Vh7),o($Vu8,$Vi7),o($Vr8,$Vy1),o($Vr8,$Vz1),o($Vr8,$VA1),o($Vr8,$VB1),o($Vt8,$VC1),o($VD1,$VE1,{158:4277}),o($Vv8,$VG1),{115:[1,4278],118:195,119:196,120:$Vw1,122:$Vx1},o($Vu8,$V11),o($Vu8,$V21),{19:[1,4282],21:[1,4286],22:4280,32:4279,196:4281,210:4283,211:[1,4285],212:[1,4284]},{96:[1,4287]},o($Vr8,$VH1),o($Vt8,$Vq),o($Vt8,$Vr),{96:[1,4289],102:4288,104:[1,4290],105:[1,4291],106:4292,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,4293]},o($Vt8,$Vt),o($Vt8,$Vu),{117:[1,4294]},o($VM8,$VO3),o($Vt8,$V43),o($Vt8,$V53),o($Vt8,$V63),o($Vt8,$V73),o($Vt8,$V83),{107:[1,4295]},o($Vt8,$Vd3),o($Vu8,$VR4),o($Vv8,$Vu5),o($Vv8,$VC1),o($Vv8,$Vq),o($Vv8,$Vr),o($Vv8,$Vt),o($Vv8,$Vu),o($Vm1,$V$5),o($Vm1,$VC1),o($Vo1,$V$5),o($Vo1,$VC1),o($Vp1,$V$5),o($Vp1,$VC1),o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vs5),o($Vm1,$Vt5),{19:$VO8,21:$VP8,22:4297,83:4296,210:3759,211:$VQ8},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vs5),o($Vo1,$Vt5),{19:$VR8,21:$VS8,22:4299,83:4298,210:3785,211:$VT8},o($Vt1,$Vu5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vs5),o($Vp1,$Vt5),{19:$VU8,21:$VV8,22:4301,83:4300,210:3812,211:$VW8},o($Vz4,$VS1),o($Vz4,$VT1),o($Vz4,$VU1),o($Vx3,$Vs5),o($Vx3,$Vt5),{19:$VX8,21:$VY8,22:4303,83:4302,210:3839,211:$VZ8},o($VA4,$VS1),o($VA4,$VT1),o($VA4,$VU1),o($Vy3,$Vs5),o($Vy3,$Vt5),{19:$V_8,21:$V$8,22:4305,83:4304,210:3865,211:$V09},o($VB3,$Vu5),o($VB3,$VC1),o($VB3,$Vq),o($VB3,$Vr),o($VB3,$Vt),o($VB3,$Vu),o($VC4,$VS1),o($VC4,$VT1),o($VC4,$VU1),o($Vz3,$Vs5),o($Vz3,$Vt5),{19:$V19,21:$V29,22:4307,83:4306,210:3892,211:$V39},o($Vr6,$V$5),o($Vr6,$VC1),o($VB6,$V77),o($VB6,$V87,{70:4308,72:4309,74:4310,40:4311,114:4312,75:[1,4313],76:[1,4314],77:[1,4315],115:$VD,120:$VD,122:$VD}),o($VB6,$V97),o($VB6,$Va7,{73:4316,69:4317,88:4318,90:4319,91:4323,95:4324,92:[1,4320],93:[1,4321],94:[1,4322],97:$Vf9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4326,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VB6,$Vc7),o($Vd7,$Vr1,{89:4327}),o($Ve7,$Vs1,{95:4142,91:4328,97:$V99,98:$VL,99:$VM,100:$VN}),o($Vf7,$Vu1,{82:4329}),o($Vf7,$Vu1,{82:4330}),o($Vf7,$Vu1,{82:4331}),o($VB6,$Vv1,{101:4146,103:4147,87:4332,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vg7,$Vh7),o($Vg7,$Vi7),o($Vd7,$Vy1),o($Vd7,$Vz1),o($Vd7,$VA1),o($Vd7,$VB1),o($Vf7,$VC1),o($VD1,$VE1,{158:4333}),o($Vj7,$VG1),{115:[1,4334],118:195,119:196,120:$Vw1,122:$Vx1},o($Vg7,$V11),o($Vg7,$V21),{19:[1,4338],21:[1,4342],22:4336,32:4335,196:4337,210:4339,211:[1,4341],212:[1,4340]},{96:[1,4343]},o($Vd7,$VH1),o($Vf7,$Vq),o($Vf7,$Vr),{96:[1,4345],102:4344,104:[1,4346],105:[1,4347],106:4348,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,4349]},o($Vf7,$Vt),o($Vf7,$Vu),{117:[1,4350]},o($V48,$VO3),o($Vf7,$V43),o($Vf7,$V53),o($Vf7,$V63),o($Vf7,$V73),o($Vf7,$V83),{107:[1,4351]},o($Vf7,$Vd3),o($Vg7,$VR4),o($Vj7,$Vu5),o($Vj7,$VC1),o($Vj7,$Vq),o($Vj7,$Vr),o($Vj7,$Vt),o($Vj7,$Vu),{117:[1,4352]},o($V48,$VO3),o($Vf7,$V43),o($Vf7,$V53),o($Vf7,$V63),o($Vf7,$V73),o($Vf7,$V83),{107:[1,4353]},o($Vf7,$Vd3),o($Vg7,$VR4),o($Vj7,$Vu5),o($Vj7,$VC1),o($Vj7,$Vq),o($Vj7,$Vr),o($Vj7,$Vt),o($Vj7,$Vu),{189:[1,4356],190:4354,191:[1,4355]},o($V68,$VF5),o($V68,$VG5),o($V68,$VH5),o($V68,$Vq),o($V68,$Vr),o($V68,$Vc4),o($V68,$Vd4),o($V68,$Ve4),o($V68,$Vt),o($V68,$Vu),o($V68,$Vf4),o($V68,$Vg4,{198:4357,199:4358,107:[1,4359]}),o($V68,$Vh4),o($V68,$Vi4),o($V68,$Vj4),o($V68,$Vk4),o($V68,$Vl4),o($V68,$Vm4),o($V68,$Vn4),o($V68,$Vo4),o($V68,$Vp4),o($Vg9,$V93),o($Vg9,$Va3),o($Vg9,$Vb3),o($Vg9,$Vc3),o($Vd8,$V$7),o($Vx,$Vg,{55:4360,36:4361,39:$Vy}),o($Vd8,$V08),o($Vd8,$V18),o($Vd8,$Vh7),o($Vd8,$Vi7),{115:[1,4362],118:195,119:196,120:$Vw1,122:$Vx1},o($Vd8,$V11),o($Vd8,$V21),{19:[1,4366],21:[1,4370],22:4364,32:4363,196:4365,210:4367,211:[1,4369],212:[1,4368]},o($Vd8,$V28),o($Vd8,$V38),o($VM8,$Vr1,{89:4371}),o($Vd8,$Vs1,{95:4226,91:4372,97:$Vd9,98:$VL,99:$VM,100:$VN}),o($VM8,$Vy1),o($VM8,$Vz1),o($VM8,$VA1),o($VM8,$VB1),{96:[1,4373]},o($VM8,$VH1),{66:[1,4374]},o($Vs8,$Vx2,{95:4004,91:4375,97:$V79,98:$VL,99:$VM,100:$VN}),o($Vr8,$Vy2),o($Vd8,$Vz2,{86:4376,91:4377,87:4378,95:4379,101:4381,103:4382,97:$Vh9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vd8,$VB2,{86:4376,91:4377,87:4378,95:4379,101:4381,103:4382,97:$Vh9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vd8,$VC2,{86:4376,91:4377,87:4378,95:4379,101:4381,103:4382,97:$Vh9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vv8,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,4383],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4384,117:$VG2,143:$VH2,185:$VI2}),o($Vu8,$VR1),o($Vu8,$Vl),o($Vu8,$Vm),o($Vu8,$Vq),o($Vu8,$Vr),o($Vu8,$Vs),o($Vu8,$Vt),o($Vu8,$Vu),o($Vr8,$V43),o($Vv8,$V53),o($Vv8,$V63),o($Vv8,$V73),o($Vv8,$V83),{107:[1,4385]},o($Vv8,$Vd3),o($Vd8,$V08),o($Vd8,$V18),o($Vd8,$Vh7),o($Vd8,$Vi7),{115:[1,4386],118:195,119:196,120:$Vw1,122:$Vx1},o($Vd8,$V11),o($Vd8,$V21),{19:[1,4390],21:[1,4394],22:4388,32:4387,196:4389,210:4391,211:[1,4393],212:[1,4392]},o($Vd8,$V28),o($Vd8,$V38),o($VM8,$Vr1,{89:4395}),o($Vd8,$Vs1,{95:4268,91:4396,97:$Ve9,98:$VL,99:$VM,100:$VN}),o($VM8,$Vy1),o($VM8,$Vz1),o($VM8,$VA1),o($VM8,$VB1),{96:[1,4397]},o($VM8,$VH1),{66:[1,4398]},o($Vs8,$Vx2,{95:4037,91:4399,97:$V89,98:$VL,99:$VM,100:$VN}),o($Vr8,$Vy2),o($Vd8,$Vz2,{86:4400,91:4401,87:4402,95:4403,101:4405,103:4406,97:$Vi9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vd8,$VB2,{86:4400,91:4401,87:4402,95:4403,101:4405,103:4406,97:$Vi9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vd8,$VC2,{86:4400,91:4401,87:4402,95:4403,101:4405,103:4406,97:$Vi9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vv8,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,4407],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4408,117:$VG2,143:$VH2,185:$VI2}),o($Vu8,$VR1),o($Vu8,$Vl),o($Vu8,$Vm),o($Vu8,$Vq),o($Vu8,$Vr),o($Vu8,$Vs),o($Vu8,$Vt),o($Vu8,$Vu),o($Vr8,$V43),o($Vv8,$V53),o($Vv8,$V63),o($Vv8,$V73),o($Vv8,$V83),{107:[1,4409]},o($Vv8,$Vd3),o($Vd8,$VR4),{19:[1,4412],21:[1,4415],22:4411,83:4410,210:4413,211:[1,4414]},o($Vm1,$V$5),o($Vm1,$VC1),o($Vo1,$V$5),o($Vo1,$VC1),o($Vp1,$V$5),o($Vp1,$VC1),o($Vx3,$V$5),o($Vx3,$VC1),o($Vy3,$V$5),o($Vy3,$VC1),o($Vz3,$V$5),o($Vz3,$VC1),o($VB6,$V08),o($VB6,$V18),o($VB6,$Vh7),o($VB6,$Vi7),{115:[1,4416],118:195,119:196,120:$Vw1,122:$Vx1},o($VB6,$V11),o($VB6,$V21),{19:[1,4420],21:[1,4424],22:4418,32:4417,196:4419,210:4421,211:[1,4423],212:[1,4422]},o($VB6,$V28),o($VB6,$V38),o($V48,$Vr1,{89:4425}),o($VB6,$Vs1,{95:4324,91:4426,97:$Vf9,98:$VL,99:$VM,100:$VN}),o($V48,$Vy1),o($V48,$Vz1),o($V48,$VA1),o($V48,$VB1),{96:[1,4427]},o($V48,$VH1),{66:[1,4428]},o($Ve7,$Vx2,{95:4142,91:4429,97:$V99,98:$VL,99:$VM,100:$VN}),o($Vd7,$Vy2),o($VB6,$Vz2,{86:4430,91:4431,87:4432,95:4433,101:4435,103:4436,97:$Vj9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB6,$VB2,{86:4430,91:4431,87:4432,95:4433,101:4435,103:4436,97:$Vj9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB6,$VC2,{86:4430,91:4431,87:4432,95:4433,101:4435,103:4436,97:$Vj9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vj7,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,4437],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4438,117:$VG2,143:$VH2,185:$VI2}),o($Vg7,$VR1),o($Vg7,$Vl),o($Vg7,$Vm),o($Vg7,$Vq),o($Vg7,$Vr),o($Vg7,$Vs),o($Vg7,$Vt),o($Vg7,$Vu),o($Vd7,$V43),o($Vj7,$V53),o($Vj7,$V63),o($Vj7,$V73),o($Vj7,$V83),{107:[1,4439]},o($Vj7,$Vd3),o($VB6,$VR4),{19:[1,4442],21:[1,4445],22:4441,83:4440,210:4443,211:[1,4444]},o($VB6,$VR4),{19:[1,4448],21:[1,4451],22:4447,83:4446,210:4449,211:[1,4450]},o($VK8,$VS1),o($VK8,$VT1),o($VK8,$VU1),o($V68,$Vs5),o($V68,$Vt5),{19:$Va9,21:$Vb9,22:4453,83:4452,210:4187,211:$Vc9},o($Vd8,$Vm8),o($VC,$VD,{59:4454,69:4455,71:4456,72:4457,88:4460,90:4461,83:4463,84:4464,85:4465,74:4466,40:4467,91:4471,22:4472,87:4474,114:4475,95:4479,210:4482,101:4483,103:4484,19:[1,4481],21:[1,4486],65:[1,4458],67:[1,4459],75:[1,4476],76:[1,4477],77:[1,4478],81:[1,4462],92:[1,4468],93:[1,4469],94:[1,4470],97:$Vk9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,4473],211:[1,4485]}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4487,117:$VG2,143:$VH2,185:$VI2}),o($Vd8,$VR1),o($Vd8,$Vl),o($Vd8,$Vm),o($Vd8,$Vq),o($Vd8,$Vr),o($Vd8,$Vs),o($Vd8,$Vt),o($Vd8,$Vu),o($Vd8,$Vx2,{95:4226,91:4488,97:$Vd9,98:$VL,99:$VM,100:$VN}),o($VM8,$Vy2),o($VM8,$V43),o($Vd8,$Vo8),o($Vr8,$VO3),o($Vt8,$VP3),o($Vt8,$VQ3),o($Vt8,$VR3),{96:[1,4489]},o($Vt8,$VH1),{96:[1,4491],102:4490,104:[1,4492],105:[1,4493],106:4494,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,4495]},o($Vt8,$V94),{117:[1,4496]},{19:[1,4499],21:[1,4502],22:4498,83:4497,210:4500,211:[1,4501]},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4503,117:$VG2,143:$VH2,185:$VI2}),o($Vd8,$VR1),o($Vd8,$Vl),o($Vd8,$Vm),o($Vd8,$Vq),o($Vd8,$Vr),o($Vd8,$Vs),o($Vd8,$Vt),o($Vd8,$Vu),o($Vd8,$Vx2,{95:4268,91:4504,97:$Ve9,98:$VL,99:$VM,100:$VN}),o($VM8,$Vy2),o($VM8,$V43),o($Vd8,$Vo8),o($Vr8,$VO3),o($Vt8,$VP3),o($Vt8,$VQ3),o($Vt8,$VR3),{96:[1,4505]},o($Vt8,$VH1),{96:[1,4507],102:4506,104:[1,4508],105:[1,4509],106:4510,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,4511]},o($Vt8,$V94),{117:[1,4512]},{19:[1,4515],21:[1,4518],22:4514,83:4513,210:4516,211:[1,4517]},o($Vt8,$Vu5),o($Vt8,$VC1),o($Vt8,$Vq),o($Vt8,$Vr),o($Vt8,$Vt),o($Vt8,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4519,117:$VG2,143:$VH2,185:$VI2}),o($VB6,$VR1),o($VB6,$Vl),o($VB6,$Vm),o($VB6,$Vq),o($VB6,$Vr),o($VB6,$Vs),o($VB6,$Vt),o($VB6,$Vu),o($VB6,$Vx2,{95:4324,91:4520,97:$Vf9,98:$VL,99:$VM,100:$VN}),o($V48,$Vy2),o($V48,$V43),o($VB6,$Vo8),o($Vd7,$VO3),o($Vf7,$VP3),o($Vf7,$VQ3),o($Vf7,$VR3),{96:[1,4521]},o($Vf7,$VH1),{96:[1,4523],102:4522,104:[1,4524],105:[1,4525],106:4526,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,4527]},o($Vf7,$V94),{117:[1,4528]},{19:[1,4531],21:[1,4534],22:4530,83:4529,210:4532,211:[1,4533]},o($Vf7,$Vu5),o($Vf7,$VC1),o($Vf7,$Vq),o($Vf7,$Vr),o($Vf7,$Vt),o($Vf7,$Vu),o($Vf7,$Vu5),o($Vf7,$VC1),o($Vf7,$Vq),o($Vf7,$Vr),o($Vf7,$Vt),o($Vf7,$Vu),o($V68,$V$5),o($V68,$VC1),o($Vd8,$V77),o($Vd8,$V87,{70:4535,72:4536,74:4537,40:4538,114:4539,75:[1,4540],76:[1,4541],77:[1,4542],115:$VD,120:$VD,122:$VD}),o($Vd8,$V97),o($Vd8,$Va7,{73:4543,69:4544,88:4545,90:4546,91:4550,95:4551,92:[1,4547],93:[1,4548],94:[1,4549],97:$Vl9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4553,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vd8,$Vc7),o($Vr8,$Vr1,{89:4554}),o($Vs8,$Vs1,{95:4479,91:4555,97:$Vk9,98:$VL,99:$VM,100:$VN}),o($Vt8,$Vu1,{82:4556}),o($Vt8,$Vu1,{82:4557}),o($Vt8,$Vu1,{82:4558}),o($Vd8,$Vv1,{101:4483,103:4484,87:4559,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vu8,$Vh7),o($Vu8,$Vi7),o($Vr8,$Vy1),o($Vr8,$Vz1),o($Vr8,$VA1),o($Vr8,$VB1),o($Vt8,$VC1),o($VD1,$VE1,{158:4560}),o($Vv8,$VG1),{115:[1,4561],118:195,119:196,120:$Vw1,122:$Vx1},o($Vu8,$V11),o($Vu8,$V21),{19:[1,4565],21:[1,4569],22:4563,32:4562,196:4564,210:4566,211:[1,4568],212:[1,4567]},{96:[1,4570]},o($Vr8,$VH1),o($Vt8,$Vq),o($Vt8,$Vr),{96:[1,4572],102:4571,104:[1,4573],105:[1,4574],106:4575,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,4576]},o($Vt8,$Vt),o($Vt8,$Vu),{117:[1,4577]},o($VM8,$VO3),o($Vt8,$V43),o($Vt8,$V53),o($Vt8,$V63),o($Vt8,$V73),o($Vt8,$V83),{107:[1,4578]},o($Vt8,$Vd3),o($Vu8,$VR4),o($Vv8,$Vu5),o($Vv8,$VC1),o($Vv8,$Vq),o($Vv8,$Vr),o($Vv8,$Vt),o($Vv8,$Vu),{117:[1,4579]},o($VM8,$VO3),o($Vt8,$V43),o($Vt8,$V53),o($Vt8,$V63),o($Vt8,$V73),o($Vt8,$V83),{107:[1,4580]},o($Vt8,$Vd3),o($Vu8,$VR4),o($Vv8,$Vu5),o($Vv8,$VC1),o($Vv8,$Vq),o($Vv8,$Vr),o($Vv8,$Vt),o($Vv8,$Vu),{117:[1,4581]},o($V48,$VO3),o($Vf7,$V43),o($Vf7,$V53),o($Vf7,$V63),o($Vf7,$V73),o($Vf7,$V83),{107:[1,4582]},o($Vf7,$Vd3),o($Vg7,$VR4),o($Vj7,$Vu5),o($Vj7,$VC1),o($Vj7,$Vq),o($Vj7,$Vr),o($Vj7,$Vt),o($Vj7,$Vu),o($Vd8,$V08),o($Vd8,$V18),o($Vd8,$Vh7),o($Vd8,$Vi7),{115:[1,4583],118:195,119:196,120:$Vw1,122:$Vx1},o($Vd8,$V11),o($Vd8,$V21),{19:[1,4587],21:[1,4591],22:4585,32:4584,196:4586,210:4588,211:[1,4590],212:[1,4589]},o($Vd8,$V28),o($Vd8,$V38),o($VM8,$Vr1,{89:4592}),o($Vd8,$Vs1,{95:4551,91:4593,97:$Vl9,98:$VL,99:$VM,100:$VN}),o($VM8,$Vy1),o($VM8,$Vz1),o($VM8,$VA1),o($VM8,$VB1),{96:[1,4594]},o($VM8,$VH1),{66:[1,4595]},o($Vs8,$Vx2,{95:4479,91:4596,97:$Vk9,98:$VL,99:$VM,100:$VN}),o($Vr8,$Vy2),o($Vd8,$Vz2,{86:4597,91:4598,87:4599,95:4600,101:4602,103:4603,97:$Vm9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vd8,$VB2,{86:4597,91:4598,87:4599,95:4600,101:4602,103:4603,97:$Vm9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vd8,$VC2,{86:4597,91:4598,87:4599,95:4600,101:4602,103:4603,97:$Vm9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vv8,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,4604],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4605,117:$VG2,143:$VH2,185:$VI2}),o($Vu8,$VR1),o($Vu8,$Vl),o($Vu8,$Vm),o($Vu8,$Vq),o($Vu8,$Vr),o($Vu8,$Vs),o($Vu8,$Vt),o($Vu8,$Vu),o($Vr8,$V43),o($Vv8,$V53),o($Vv8,$V63),o($Vv8,$V73),o($Vv8,$V83),{107:[1,4606]},o($Vv8,$Vd3),o($Vd8,$VR4),{19:[1,4609],21:[1,4612],22:4608,83:4607,210:4610,211:[1,4611]},o($Vd8,$VR4),{19:[1,4615],21:[1,4618],22:4614,83:4613,210:4616,211:[1,4617]},o($VB6,$VR4),{19:[1,4621],21:[1,4624],22:4620,83:4619,210:4622,211:[1,4623]},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4625,117:$VG2,143:$VH2,185:$VI2}),o($Vd8,$VR1),o($Vd8,$Vl),o($Vd8,$Vm),o($Vd8,$Vq),o($Vd8,$Vr),o($Vd8,$Vs),o($Vd8,$Vt),o($Vd8,$Vu),o($Vd8,$Vx2,{95:4551,91:4626,97:$Vl9,98:$VL,99:$VM,100:$VN}),o($VM8,$Vy2),o($VM8,$V43),o($Vd8,$Vo8),o($Vr8,$VO3),o($Vt8,$VP3),o($Vt8,$VQ3),o($Vt8,$VR3),{96:[1,4627]},o($Vt8,$VH1),{96:[1,4629],102:4628,104:[1,4630],105:[1,4631],106:4632,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,4633]},o($Vt8,$V94),{117:[1,4634]},{19:[1,4637],21:[1,4640],22:4636,83:4635,210:4638,211:[1,4639]},o($Vt8,$Vu5),o($Vt8,$VC1),o($Vt8,$Vq),o($Vt8,$Vr),o($Vt8,$Vt),o($Vt8,$Vu),o($Vt8,$Vu5),o($Vt8,$VC1),o($Vt8,$Vq),o($Vt8,$Vr),o($Vt8,$Vt),o($Vt8,$Vu),o($Vf7,$Vu5),o($Vf7,$VC1),o($Vf7,$Vq),o($Vf7,$Vr),o($Vf7,$Vt),o($Vf7,$Vu),{117:[1,4641]},o($VM8,$VO3),o($Vt8,$V43),o($Vt8,$V53),o($Vt8,$V63),o($Vt8,$V73),o($Vt8,$V83),{107:[1,4642]},o($Vt8,$Vd3),o($Vu8,$VR4),o($Vv8,$Vu5),o($Vv8,$VC1),o($Vv8,$Vq),o($Vv8,$Vr),o($Vv8,$Vt),o($Vv8,$Vu),o($Vd8,$VR4),{19:[1,4645],21:[1,4648],22:4644,83:4643,210:4646,211:[1,4647]},o($Vt8,$Vu5),o($Vt8,$VC1),o($Vt8,$Vq),o($Vt8,$Vr),o($Vt8,$Vt),o($Vt8,$Vu)];
        this.defaultActions = {6:[2,11],30:[2,1],102:[2,115],103:[2,116],104:[2,117],111:[2,128],112:[2,129],206:[2,250],207:[2,251],208:[2,252],209:[2,253],329:[2,31],357:[2,137],358:[2,141],360:[2,143],556:[2,29],557:[2,33],594:[2,30],1104:[2,141],1106:[2,143]};
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
        yy.addShape($$[$0-1],  $$[$0]);
      
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
case 32: case 229: case 246:
this.$ = null;
break;
case 33: case 37: case 40: case 46: case 53: case 186: case 245:
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
this.$ = yy.EmptyShape // t: 1dot;
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
        this.$ = yy.addSourceMap(yy.expandPrefix($$[$0].substr(0, namePos), yy) + $$[$0].substr(namePos + 1)); // ShapeRef
      
break;
case 88:
 // t: 1dotRefNS1@@
        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        this.$ = yy.addSourceMap(yy.expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy)); // ShapeRef
      
break;
case 89:
this.$ = yy.addSourceMap($$[$0]) // ShapeRef // t: 1dotRef1, 1dotRefSpaceLNex, 1dotRefSpaceNS1;
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
              yy.error(new Error("Parse error: facet " + facet + " not allowed for unknown datatype " + $$[$0-1]));
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
          yy.error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"));
        }
        this.$ = extend($$[$0-1], $$[$0]) // t: 1literalLength
      
break;
case 101: case 107:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          yy.error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"));
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
          yy.error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"));
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
          yy.error(new Error("Parse error: numeric range facet expected numeric datatype instead of " + $$[$0]));
      
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
        this.$ = $$[$0-2] === yy.EmptyShape ? { type: "Shape" } : $$[$0-2]; // t: 0
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: !! look to open3groupdotcloseAnnot3, open3groupdotclosecard23Annot3Code2
        if ($$[$0]) { this.$.semActs = $$[$0].semActs; } // t: !! look to open3groupdotcloseCode1, !open1dotOr1dot
      
break;
case 131:
 // t: @@
        const exprObj = $$[$0-1] ? { expression: $$[$0-1] } : yy.EmptyObject; // t: 0
        this.$ = (exprObj === yy.EmptyObject && $$[$0-3] === yy.EmptyObject) ?
	  yy.EmptyShape :
	  extend({ type: "Shape" }, exprObj, $$[$0-3]);
      
break;
case 132:
this.$ = [ "extra", $$[$0] ] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3;
break;
case 133:
this.$ = [ "closed", true ] // t: 1dotClosed;
break;
case 134:
this.$ = yy.EmptyObject;
break;
case 135:

        if ($$[$0-1] === yy.EmptyObject)
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
          yy.addProduction($$[$0-1],  this.$);
        } else {
          this.$ = $$[$0]
        }
      
break;
case 161:
this.$ = yy.addSourceMap($$[$0]);
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
	if ($$[$0-3] !== yy.EmptyShape && false) {}
        // %6: t: 1inversedotCode1
        this.$ = extend({ type: "TripleConstraint" }, $$[$0-5] ? $$[$0-5] : {}, { predicate: $$[$0-4] }, ($$[$0-3] === yy.EmptyShape ? {} : { valueExpr: $$[$0-3] }), $$[$0-2], $$[$0]); // t: 1dot // t: 1inversedot, 1negatedinversedot
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
this.$ = { inverse: true, negated: true } // t: 1negatedinversedot;
break;
case 178:
this.$ = { negated: true } // t: 1negateddot;
break;
case 179:
this.$ = { inverse: true, negated: true } // t: 1inversenegateddot;
break;
case 180:
this.$ = $$[$0-1] // t: 1val1IRIREF;
break;
case 181:
this.$ = [] // t: 1val1IRIREF;
break;
case 182:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1IRIREF;
break;
case 187:
this.$ = [$$[$0]] // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 188:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 189:
this.$ = [$$[$0]] // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 190:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 191:
this.$ = [$$[$0]] // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 192:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 193:
this.$ = { type: "IriStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 194:
this.$ = { type: "LiteralStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 195:
this.$ = { type: "LanguageStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 196:

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
case 197:
this.$ = [] // t: 1val1iriStem, 1val1iriStemMinusiri3;
break;
case 198:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1iriStemMinusiri3;
break;
case 199:
this.$ = $$[$0] // t: 1val1iriStemMinusiri3;
break;
case 202:
this.$ = $$[$0] ? { type: "IriStem", stem: $$[$0-1] } /* t: 1val1iriStemMinusiriStem3 */ : $$[$0-1] // t: 1val1iriStemMinusiri3;
break;
case 205:

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
case 206:
this.$ = [] // t: 1val1literalStem, 1val1literalStemMinusliteral3;
break;
case 207:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1literalStemMinusliteral3;
break;
case 208:
this.$ = $$[$0] // t: 1val1literalStemMinusliteral3;
break;
case 211:
this.$ = $$[$0] ? { type: "LiteralStem", stem: $$[$0-1].value } /* t: 1val1literalStemMinusliteral3 */ : $$[$0-1].value // t: 1val1literalStemMinusliteralStem3;
break;
case 212:

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
case 213:

        this.$ = {  // t: @@
          type: $$[$0].length ? "LanguageStemRange" : "LanguageStem",
          stem: ""
        };
        if ($$[$0].length)
          this.$["exclusions"] = $$[$0]; // t: @@
      
break;
case 214:
this.$ = [] // t: 1val1languageStem, 1val1languageStemMinuslanguage3;
break;
case 215:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1languageStemMinuslanguage3;
break;
case 216:
this.$ = $$[$0] // t: 1val1languageStemMinuslanguage3;
break;
case 219:
this.$ = $$[$0] ? { type: "LanguageStem", stem: $$[$0-1] } /* t: 1val1languageStemMinuslanguageStem3 */ : $$[$0-1] // t: 1val1languageStemMinuslanguage3;
break;
case 220:
this.$ = yy.addSourceMap($$[$0]) // Inclusion // t: 2groupInclude1;
break;
case 221:
this.$ = { type: "Annotation", predicate: $$[$0-1], object: $$[$0] } // t: 1dotAnnotIRIREF;
break;
case 224:
this.$ = $$[$0].length ? { semActs: $$[$0] } : null // t: 1dotCode1/2oneOfDot;
break;
case 225:
this.$ = [] // t: 1dot, 1dotCode1;
break;
case 226:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotCode1;
break;
case 227:
this.$ = $$[$0] ? unescapeSemanticAction($$[$0-1], $$[$0]) /* t: 1dotCode1 */ : { type: "SemAct", name: $$[$0-1] } // t: 1dotNoCode1;
break;
case 234:
this.$ = RDF_TYPE // t: 1AvalA;
break;
case 240:
this.$ = createLiteral($$[$0], XSD_INTEGER) // t: 1val1INTEGER;
break;
case 241:
this.$ = createLiteral($$[$0], XSD_DECIMAL) // t: 1val1DECIMAL;
break;
case 242:
this.$ = createLiteral($$[$0], XSD_DOUBLE) // t: 1val1DOUBLE;
break;
case 244:
this.$ = $$[$0] ? extend($$[$0-1], { type: $$[$0] }) : $$[$0-1] // t: 1val1Datatype;
break;
case 248:
this.$ = { value: "true", type: XSD_BOOLEAN } // t: 1val1true;
break;
case 249:
this.$ = { value: "false", type: XSD_BOOLEAN } // t: 1val1false;
break;
case 250:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL2;
break;
case 251:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL1;
break;
case 252:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL_LONG2;
break;
case 253:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG1;
break;
case 254:
this.$ = unescapeLangString($$[$0], 1)	// t: @@;
break;
case 255:
this.$ = unescapeLangString($$[$0], 3)	// t: @@;
break;
case 256:
this.$ = unescapeLangString($$[$0], 1)	// t: 1val1LANGTAG;
break;
case 257:
this.$ = unescapeLangString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG2_with_LANGTAG;
break;
case 258:
 // t: 1dot
        const unesc = ShExUtil.unescapeText($$[$0].slice(1,-1), {});
        this.$ = yy._base === null || absoluteIRI.test(unesc) ? unesc : yy._resolveIRI(unesc)
      
break;
case 260:
 // t:1dotPNex, 1dotPNdefault, ShExParser-test.js/with pre-defined prefixes
        const namePos1 = $$[$0].indexOf(':');
        this.$ = yy.expandPrefix($$[$0].substr(0, namePos1), yy) + ShExUtil.unescapeText($$[$0].substr(namePos1 + 1), pnameEscapeReplacements);
      
break;
case 261:
 // t: 1dotNS2, 1dotNSdefault, ShExParser-test.js/PNAME_NS with pre-defined prefixes
        this.$ = yy.expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy);
      
break;
        }
    }
}

// Export module
__webpack_unused_export__ = ({ value: true });
exports.Fm = ShExJisonParser;


/* generated by ts-jison-lex 0.3.0 */
const { JisonLexer } = __webpack_require__(752);
class ShExJisonLexer extends JisonLexer {
    constructor (yy = {}) {
        super(yy);
        this.options = {"moduleName":"ShExJison"};
        this.rules = [/^(?:\s+|(#[^\u000a\u000d]*|\/\*([^*]|\*([^/]|\\\/))*\*\/))/,/^(?:(@(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*))))/,/^(?:(@((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)))/,/^(?:(@([A-Za-z])+((-([0-9A-Za-z])+))*))/,/^(?:@)/,/^(?:(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*)))/,/^(?:(\{((([+-])?([0-9])+))((,(((([+-])?([0-9])+))|\*)?))?\}))/,/^(?:(([+-])?((([0-9])+\.([0-9])*(([Ee]([+-])?([0-9])+)))|((\.)?([0-9])+(([Ee]([+-])?([0-9])+))))))/,/^(?:(([+-])?([0-9])*\.([0-9])+))/,/^(?:(([+-])?([0-9])+))/,/^(?:{ANON})/,/^(?:(<([^\u0000-\u0020<>\"{}|^`\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*>))/,/^(?:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:))/,/^(?:a\b)/,/^(?:(\/([^\u002f\u005C\u000A\u000D]|\\[nrt\\|.?*+(){}$\u002D\u005B\u005D\u005E/]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))+\/[smix]*))/,/^(?:(_:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|[0-9])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?))/,/^(?:(\{([^%\\]|\\[%\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*%\}))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"))/,/^(?:([Bb][Aa][Ss][Ee]))/,/^(?:([Pp][Rr][Ee][Ff][Ii][Xx]))/,/^(?:([iI][mM][pP][oO][rR][tT]))/,/^(?:([sS][tT][aA][rR][tT]))/,/^(?:([eE][xX][tT][eE][rR][nN][aA][lL]))/,/^(?:([Cc][Ll][Oo][Ss][Ee][Dd]))/,/^(?:([Ee][Xx][Tt][Rr][Aa]))/,/^(?:([Ll][Ii][Tt][Ee][Rr][Aa][Ll]))/,/^(?:([Bb][Nn][Oo][Dd][Ee]))/,/^(?:([Ii][Rr][Ii]))/,/^(?:([Nn][Oo][Nn][Ll][Ii][Tt][Ee][Rr][Aa][Ll]))/,/^(?:([Aa][Nn][Dd]))/,/^(?:([Oo][Rr]))/,/^(?:([No][Oo][Tt]))/,/^(?:([Mm][Ii][Nn][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Ii][Nn][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Aa][Xx][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Aa][Xx][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Mm][Ii][Nn][Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Mm][Aa][Xx][Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Tt][Oo][Tt][Aa][Ll][Dd][Ii][Gg][Ii][Tt][Ss]))/,/^(?:([Ff][Rr][Aa][Cc][Tt][Ii][Oo][Nn][Dd][Ii][Gg][Ii][Tt][Ss]))/,/^(?:=)/,/^(?:\/\/)/,/^(?:\{)/,/^(?:\})/,/^(?:&)/,/^(?:\|\|)/,/^(?:\|)/,/^(?:,)/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?:\$)/,/^(?:!)/,/^(?:\^\^)/,/^(?:\^)/,/^(?:\.)/,/^(?:~)/,/^(?:;)/,/^(?:\*)/,/^(?:\+)/,/^(?:\?)/,/^(?:-)/,/^(?:%)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:$)/,/^(?:[a-zA-Z0-9_-]+)/,/^(?:.)/];
        this.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76],"inclusive":true}};
    }
    performAction (yy, yy_, $avoiding_name_collisions, YY_START) {
              let YYSTATE = YY_START;
            switch ($avoiding_name_collisions) {
    case 0:/**/
      break;
    case 1:return 75;
      break;
    case 2:return 76;
      break;
    case 3: yy_.yytext = yy_.yytext.substr(1); return 181; 
      break;
    case 4:return 77;
      break;
    case 5:return 211;
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
    case 13:return 195;
      break;
    case 14:return 97;
      break;
    case 15:return 212;
      break;
    case 16:return 191;
      break;
    case 17:return 207;
      break;
    case 18:return 209;
      break;
    case 19:return 206;
      break;
    case 20:return 208;
      break;
    case 21:return 203;
      break;
    case 22:return 205;
      break;
    case 23:return 202;
      break;
    case 24:return 204;
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
    case 49:return 186;
      break;
    case 50:return 115;
      break;
    case 51:return 117;
      break;
    case 52:return 185;
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
    case 58:return 157;
      break;
    case 59:return 159;
      break;
    case 60:return 143;
      break;
    case 61:return 156;
      break;
    case 62:return 107;
      break;
    case 63:return 155;
      break;
    case 64:return 67;
      break;
    case 65:return 174;
      break;
    case 66:return 136;
      break;
    case 67:return 151;
      break;
    case 68:return 152;
      break;
    case 69:return 153;
      break;
    case 70:return 175;
      break;
    case 71:return 189;
      break;
    case 72:return 200;
      break;
    case 73:return 201;
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

// Export module
__webpack_unused_export__ = ({ value: true });
__webpack_unused_export__ = ShExJisonLexer;



/***/ }),

/***/ 931:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const ShExParserCjsModule = (function () {

const ShExJisonParser = (__webpack_require__(509)/* .ShExJisonParser */ .Fm);

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
      ret.shapes = Object.keys(index.shapeExprs).map(k => {
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
            if (negated && ret.inCycle.indexOf(shape.id) !== -1) // illDefined/negatedRefCycle.err
              throw Error("Structural error: " + shape.id + " appears in negated cycle");
          }

          if (typeof tripleExpr === "string") { // Inclusion
            ret.add(shape.id, tripleExpr);
          } else {
            if ("id" in tripleExpr)
              ret.addIn(tripleExpr.id, shape.id)
            if (tripleExpr.type === "TripleConstraint") {
              _walkTripleConstraint(tripleExpr, negated ^ !!tripleExpr.negated);
            } else if (tripleExpr.type === "OneOf" || tripleExpr.type === "EachOf") {
              _exprGroup(tripleExpr.expressions);
            } else {
              throw Error("expected {TripleConstraint,OneOf,EachOf,Inclusion} in " + tripleExpr);
            }
          }
        }

        if (shape.expression)
          _walkTripleExpression(shape.expression, negated ^ !!shape.negated);
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
      let ret = findType(v, elts, shapeExpr);
      if (ret !== Missed)
        return ret;

      const t = v[RDF.type][0].ldterm;
      if (t === SX.Shape) {
        ret = { type: "Shape" };
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
        ["inverse", "negated"].forEach(a => {
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
  const regexModule = this.options.regexModule || __webpack_require__(863);

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
    } else {
      shape = this._lookupShape(label);
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

  this._lookupShape = function (label) {
    if (!("shapes" in this.schema) || this.schema.shapes.length === 0) {
      runtimeError("shape " + label + " not found; no shapes in schema");
    } else if (label in index.shapeExprs) {
      return index.shapeExprs[label]
    } else {
      runtimeError("shape " + label + " not found in:\n" + Object.keys(index.shapeExprs || []).map(s => "  " + s).join("\n"));
    }
  }

  this._validateShapeExpr = function (point, shapeExpr, shapeLabel, tracker, seen) {
    if (point === "")
      throw Error("validation needs a valid focus node");
    let ret = null
    if (typeof shapeExpr === "string") { // ShapeRef
      ret = this._validateShapeExpr(point, this._lookupShape(shapeExpr), shapeExpr, tracker, seen);
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
      this._expect(shape, "type", "Shape");

      this._maybeSet(shape, ret, "Shape",
                     [ "id",
                       "closed",
                       "expression", "extra", "semActs", "annotations"]);
      return ret;
    },

    // ### `visitNodeConstraint` deep-copies the structure of a shape
    visitNodeConstraint: function (shape, label) {
      const ret = { type: "NodeConstraint" };
      this._expect(shape, "type", "NodeConstraint");

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
                            ["id", "inverse", "negated", "predicate", "valueExpr",
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
  r.visitExtra = r.visitAnnotations = r._visitList;
  r.visitInverse = r.visitNegated = r.visitPredicate = r._visitValue;
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
/******/ 	var __webpack_exports__ = __webpack_require__(709);
/******/ 	
/******/ })()
;