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
exports.default = void 0;
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
exports.default = _default;

/***/ }),

/***/ 713:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.termFromId = termFromId;
exports.termToId = termToId;
exports.escapeQuotes = escapeQuotes;
exports.unescapeQuotes = unescapeQuotes;
exports.Triple = exports.Quad = exports.DefaultGraph = exports.Variable = exports.BlankNode = exports.Literal = exports.NamedNode = exports.Term = exports.default = void 0;

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

exports.default = _default;

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
exports.isNamedNode = isNamedNode;
exports.isBlankNode = isBlankNode;
exports.isLiteral = isLiteral;
exports.isVariable = isVariable;
exports.isDefaultGraph = isDefaultGraph;
exports.inDefaultGraph = inDefaultGraph;
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
    '': iri
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
const N3DataFactory = __webpack_require__(713).default;
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
        if (obj[k].constructor === Array)
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
      if (list[listIndex].constructor === Array) {
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
        elt.constructor === Array ?
          _simplify(elt) :
          elt
      );
    }, []);
    return ret.length === 1 ? ret[0] : ret;
  }
  tree = tree.constructor === Array ? _simplify(tree) : [tree]; // expects an array

  // const globals = tree.reduce((r, e, idx) => {
  //   if (e.constructor !== Array) {
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
      while(next.constructor !== Array) {
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
      while (getObj(s).constructor === Array)
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

/***/ 237:
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
      ShExJisonParser.shapes = new Map();
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
      ShExJisonParser.productions = new Map();
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
      return { type: type, shapeExprs: [nonest(shapeAtom)].concat(juncts) };
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

  const $V0=[7,18,19,20,21,23,26,203,225,226],$V1=[1,25],$V2=[1,29],$V3=[1,24],$V4=[1,28],$V5=[1,27],$V6=[2,12],$V7=[2,13],$V8=[2,14],$V9=[7,18,19,20,21,23,26,225,226],$Va=[1,35],$Vb=[1,38],$Vc=[1,37],$Vd=[2,18],$Ve=[2,19],$Vf=[19,21,65,67,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,120,122,158,225],$Vg=[2,57],$Vh=[1,47],$Vi=[1,48],$Vj=[1,49],$Vk=[19,21,35,39,65,67,75,76,77,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,120,122,158,225],$Vl=[2,252],$Vm=[2,253],$Vn=[1,51],$Vo=[1,54],$Vp=[1,53],$Vq=[2,274],$Vr=[2,275],$Vs=[2,278],$Vt=[2,276],$Vu=[2,277],$Vv=[2,15],$Vw=[2,17],$Vx=[19,21,65,67,75,76,77,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,120,122,158,225],$Vy=[1,72],$Vz=[2,26],$VA=[2,27],$VB=[2,28],$VC=[115,120,122],$VD=[2,134],$VE=[1,98],$VF=[1,106],$VG=[1,84],$VH=[1,89],$VI=[1,90],$VJ=[1,91],$VK=[1,97],$VL=[1,102],$VM=[1,103],$VN=[1,104],$VO=[1,107],$VP=[1,108],$VQ=[1,109],$VR=[1,110],$VS=[1,111],$VT=[1,112],$VU=[1,94],$VV=[1,105],$VW=[2,58],$VX=[1,114],$VY=[1,115],$VZ=[1,116],$V_=[1,122],$V$=[1,123],$V01=[47,49],$V11=[2,87],$V21=[2,88],$V31=[203,205],$V41=[1,138],$V51=[1,141],$V61=[1,140],$V71=[2,16],$V81=[7,18,19,20,21,23,26,47,225,226],$V91=[2,43],$Va1=[7,18,19,20,21,23,26,47,49,225,226],$Vb1=[2,50],$Vc1=[2,32],$Vd1=[2,65],$Ve1=[2,70],$Vf1=[2,67],$Vg1=[1,175],$Vh1=[1,176],$Vi1=[1,177],$Vj1=[1,180],$Vk1=[1,183],$Vl1=[2,73],$Vm1=[7,18,19,20,21,23,26,47,49,75,76,77,115,120,122,200,203,225,226],$Vn1=[2,91],$Vo1=[7,18,19,20,21,23,26,47,49,200,203,225,226],$Vp1=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,200,203,225,226],$Vq1=[7,18,19,20,21,23,26,47,49,75,76,77,97,98,99,100,115,120,122,200,203,225,226],$Vr1=[2,104],$Vs1=[2,103],$Vt1=[7,18,19,20,21,23,26,47,49,97,98,99,100,108,109,110,111,112,113,200,203,225,226],$Vu1=[2,98],$Vv1=[2,97],$Vw1=[1,197],$Vx1=[1,198],$Vy1=[2,108],$Vz1=[2,109],$VA1=[2,110],$VB1=[2,106],$VC1=[2,251],$VD1=[19,21,67,77,96,104,105,160,182,214,215,216,217,218,219,220,221,222,223,225],$VE1=[2,182],$VF1=[7,18,19,20,21,23,26,47,49,108,109,110,111,112,113,200,203,225,226],$VG1=[2,100],$VH1=[2,114],$VI1=[1,206],$VJ1=[1,207],$VK1=[1,208],$VL1=[1,209],$VM1=[96,104,105,216,217,218,219],$VN1=[2,31],$VO1=[2,35],$VP1=[2,38],$VQ1=[2,41],$VR1=[2,89],$VS1=[2,243],$VT1=[2,244],$VU1=[2,245],$VV1=[1,257],$VW1=[1,262],$VX1=[1,243],$VY1=[1,248],$VZ1=[1,249],$V_1=[1,250],$V$1=[1,256],$V02=[1,253],$V12=[1,261],$V22=[1,264],$V32=[1,265],$V42=[1,266],$V52=[1,272],$V62=[1,273],$V72=[2,20],$V82=[2,49],$V92=[2,56],$Va2=[2,61],$Vb2=[2,64],$Vc2=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,225,226],$Vd2=[2,83],$Ve2=[2,84],$Vf2=[2,29],$Vg2=[2,33],$Vh2=[2,69],$Vi2=[2,66],$Vj2=[2,71],$Vk2=[2,68],$Vl2=[7,18,19,20,21,23,26,47,49,97,98,99,100,200,203,225,226],$Vm2=[1,318],$Vn2=[1,326],$Vo2=[1,327],$Vp2=[1,328],$Vq2=[1,334],$Vr2=[1,335],$Vs2=[7,18,19,20,21,23,26,47,49,75,76,77,115,120,122,203,225,226],$Vt2=[2,241],$Vu2=[7,18,19,20,21,23,26,47,49,203,225,226],$Vv2=[1,343],$Vw2=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,203,225,226],$Vx2=[2,102],$Vy2=[2,107],$Vz2=[2,94],$VA2=[1,353],$VB2=[2,95],$VC2=[2,96],$VD2=[2,101],$VE2=[19,21,65,156,157,209,225],$VF2=[2,163],$VG2=[2,136],$VH2=[1,371],$VI2=[1,368],$VJ2=[1,372],$VK2=[1,373],$VL2=[1,370],$VM2=[1,378],$VN2=[1,381],$VO2=[1,377],$VP2=[1,380],$VQ2=[1,392],$VR2=[1,398],$VS2=[1,387],$VT2=[1,391],$VU2=[1,401],$VV2=[1,402],$VW2=[1,403],$VX2=[1,390],$VY2=[1,404],$VZ2=[1,405],$V_2=[1,410],$V$2=[1,411],$V03=[1,412],$V13=[1,413],$V23=[1,406],$V33=[1,407],$V43=[1,408],$V53=[1,409],$V63=[1,397],$V73=[2,113],$V83=[2,118],$V93=[2,120],$Va3=[2,121],$Vb3=[2,122],$Vc3=[2,266],$Vd3=[2,267],$Ve3=[2,268],$Vf3=[2,269],$Vg3=[2,119],$Vh3=[2,30],$Vi3=[2,39],$Vj3=[2,36],$Vk3=[2,42],$Vl3=[2,37],$Vm3=[1,445],$Vn3=[2,40],$Vo3=[1,481],$Vp3=[1,514],$Vq3=[1,515],$Vr3=[1,516],$Vs3=[1,519],$Vt3=[2,44],$Vu3=[2,51],$Vv3=[2,60],$Vw3=[2,62],$Vx3=[2,72],$Vy3=[47,49,66],$Vz3=[1,579],$VA3=[47,49,66,75,76,77,115,120,122,200,203],$VB3=[47,49,66,200,203],$VC3=[47,49,66,92,93,94,97,98,99,100,200,203],$VD3=[47,49,66,75,76,77,97,98,99,100,115,120,122,200,203],$VE3=[47,49,66,97,98,99,100,108,109,110,111,112,113,200,203],$VF3=[47,49,66,108,109,110,111,112,113,200,203],$VG3=[47,66],$VH3=[7,18,19,20,21,23,26,47,49,75,76,77,115,120,122,225,226],$VI3=[2,93],$VJ3=[2,92],$VK3=[2,240],$VL3=[1,621],$VM3=[1,624],$VN3=[1,620],$VO3=[1,623],$VP3=[2,90],$VQ3=[2,130],$VR3=[2,105],$VS3=[2,99],$VT3=[2,111],$VU3=[2,112],$VV3=[2,141],$VW3=[2,142],$VX3=[1,641],$VY3=[2,143],$VZ3=[117,130],$V_3=[2,148],$V$3=[2,149],$V04=[2,151],$V14=[1,644],$V24=[1,645],$V34=[19,21,209,225],$V44=[2,171],$V54=[1,653],$V64=[1,654],$V74=[117,130,135,136],$V84=[2,160],$V94=[2,161],$Va4=[1,658],$Vb4=[1,657],$Vc4=[1,659],$Vd4=[1,660],$Ve4=[1,664],$Vf4=[1,668],$Vg4=[1,667],$Vh4=[1,666],$Vi4=[19,21,115,120,122,209,225],$Vj4=[2,249],$Vk4=[2,250],$Vl4=[2,181],$Vm4=[1,696],$Vn4=[19,21,67,77,96,104,105,160,175,182,214,215,216,217,218,219,220,221,222,223,225],$Vo4=[2,246],$Vp4=[2,247],$Vq4=[2,248],$Vr4=[2,259],$Vs4=[2,262],$Vt4=[2,256],$Vu4=[2,257],$Vv4=[2,258],$Vw4=[2,264],$Vx4=[2,265],$Vy4=[2,270],$Vz4=[2,271],$VA4=[2,272],$VB4=[2,273],$VC4=[19,21,67,77,96,104,105,107,160,175,182,214,215,216,217,218,219,220,221,222,223,225],$VD4=[1,728],$VE4=[1,775],$VF4=[1,830],$VG4=[1,840],$VH4=[1,876],$VI4=[1,912],$VJ4=[2,63],$VK4=[47,49,66,97,98,99,100,200,203],$VL4=[47,49,66,75,76,77,115,120,122,203],$VM4=[47,49,66,203],$VN4=[1,934],$VO4=[47,49,66,92,93,94,97,98,99,100,203],$VP4=[1,944],$VQ4=[1,981],$VR4=[1,1017],$VS4=[2,242],$VT4=[1,1028],$VU4=[1,1034],$VV4=[1,1033],$VW4=[19,21,96,104,105,214,215,216,217,218,219,220,221,222,223,225],$VX4=[1,1054],$VY4=[1,1060],$VZ4=[1,1059],$V_4=[1,1080],$V$4=[1,1086],$V05=[1,1085],$V15=[2,131],$V25=[2,144],$V35=[2,146],$V45=[2,150],$V55=[2,152],$V65=[2,153],$V75=[2,157],$V85=[2,159],$V95=[2,165],$Va5=[2,166],$Vb5=[1,1112],$Vc5=[1,1115],$Vd5=[1,1111],$Ve5=[1,1114],$Vf5=[1,1126],$Vg5=[1,1128],$Vh5=[144,197,198],$Vi5=[2,224],$Vj5=[1,1133],$Vk5=[2,236],$Vl5=[2,254],$Vm5=[2,255],$Vn5=[2,233],$Vo5=[19,21,27,65,156,157,194,195,196,209,225],$Vp5=[1,1141],$Vq5=[1,1143],$Vr5=[1,1145],$Vs5=[19,21,67,77,96,104,105,160,176,182,214,215,216,217,218,219,220,221,222,223,225],$Vt5=[1,1149],$Vu5=[1,1155],$Vv5=[1,1158],$Vw5=[1,1159],$Vx5=[1,1160],$Vy5=[1,1148],$Vz5=[1,1161],$VA5=[1,1162],$VB5=[1,1167],$VC5=[1,1168],$VD5=[1,1169],$VE5=[1,1170],$VF5=[1,1163],$VG5=[1,1164],$VH5=[1,1165],$VI5=[1,1166],$VJ5=[1,1154],$VK5=[2,260],$VL5=[2,263],$VM5=[2,123],$VN5=[1,1200],$VO5=[1,1206],$VP5=[1,1238],$VQ5=[1,1244],$VR5=[1,1303],$VS5=[1,1350],$VT5=[47,49,66,75,76,77,115,120,122],$VU5=[47,49,66,92,93,94,97,98,99,100],$VV5=[1,1426],$VW5=[1,1473],$VX5=[2,237],$VY5=[2,238],$VZ5=[2,239],$V_5=[7,18,19,20,21,23,26,47,49,75,76,77,107,115,120,122,200,203,225,226],$V$5=[7,18,19,20,21,23,26,47,49,107,200,203,225,226],$V06=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,107,200,203,225,226],$V16=[2,147],$V26=[2,145],$V36=[2,154],$V46=[2,158],$V56=[2,155],$V66=[2,156],$V76=[19,21,39,65,67,75,76,77,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,120,122,158,225],$V86=[1,1533],$V96=[66,130],$Va6=[1,1536],$Vb6=[1,1537],$Vc6=[66,130,135,136],$Vd6=[1,1549],$Ve6=[1,1553],$Vf6=[1,1552],$Vg6=[1,1551],$Vh6=[1,1555],$Vi6=[1,1556],$Vj6=[1,1557],$Vk6=[2,222],$Vl6=[1,1565],$Vm6=[1,1569],$Vn6=[1,1568],$Vo6=[1,1567],$Vp6=[2,204],$Vq6=[1,1572],$Vr6=[19,21,67,77,96,104,105,160,175,176,182,214,215,216,217,218,219,220,221,222,223,225],$Vs6=[19,21,67,77,96,104,105,107,160,175,176,182,214,215,216,217,218,219,220,221,222,223,225],$Vt6=[2,261],$Vu6=[1,1610],$Vv6=[1,1676],$Vw6=[1,1682],$Vx6=[1,1681],$Vy6=[1,1702],$Vz6=[1,1708],$VA6=[1,1707],$VB6=[1,1728],$VC6=[1,1734],$VD6=[1,1733],$VE6=[1,1775],$VF6=[1,1781],$VG6=[1,1813],$VH6=[1,1819],$VI6=[1,1834],$VJ6=[1,1840],$VK6=[1,1839],$VL6=[1,1860],$VM6=[1,1866],$VN6=[1,1865],$VO6=[1,1886],$VP6=[1,1892],$VQ6=[1,1891],$VR6=[1,1933],$VS6=[1,1939],$VT6=[1,1971],$VU6=[1,1977],$VV6=[117,130,135,136,200,203],$VW6=[2,168],$VX6=[1,1995],$VY6=[1,1996],$VZ6=[1,1997],$V_6=[1,1998],$V$6=[117,130,135,136,152,153,154,155,200,203],$V07=[2,34],$V17=[47,117,130,135,136,152,153,154,155,200,203],$V27=[2,47],$V37=[47,49,117,130,135,136,152,153,154,155,200,203],$V47=[2,54],$V57=[1,2027],$V67=[66,135],$V77=[2,227],$V87=[1,2084],$V97=[1,2117],$Va7=[1,2123],$Vb7=[1,2122],$Vc7=[1,2143],$Vd7=[1,2149],$Ve7=[1,2148],$Vf7=[1,2170],$Vg7=[1,2176],$Vh7=[1,2175],$Vi7=[1,2197],$Vj7=[1,2203],$Vk7=[1,2202],$Vl7=[1,2223],$Vm7=[1,2229],$Vn7=[1,2228],$Vo7=[1,2250],$Vp7=[1,2256],$Vq7=[1,2255],$Vr7=[1,2325],$Vs7=[47,49,66,75,76,77,107,115,120,122,200,203],$Vt7=[47,49,66,107,200,203],$Vu7=[47,49,66,92,93,94,97,98,99,100,107,200,203],$Vv7=[1,2439],$Vw7=[2,169],$Vx7=[2,173],$Vy7=[2,174],$Vz7=[2,175],$VA7=[2,176],$VB7=[2,45],$VC7=[2,52],$VD7=[2,59],$VE7=[2,79],$VF7=[2,75],$VG7=[2,81],$VH7=[1,2522],$VI7=[2,78],$VJ7=[47,49,75,76,77,97,98,99,100,115,117,120,122,130,135,136,152,153,154,155,200,203],$VK7=[47,49,75,76,77,115,117,120,122,130,135,136,152,153,154,155,200,203],$VL7=[47,49,97,98,99,100,108,109,110,111,112,113,117,130,135,136,152,153,154,155,200,203],$VM7=[47,49,92,93,94,97,98,99,100,117,130,135,136,152,153,154,155,200,203],$VN7=[2,85],$VO7=[2,86],$VP7=[47,49,108,109,110,111,112,113,117,130,135,136,152,153,154,155,200,203],$VQ7=[1,2560],$VR7=[27,194,195,196],$VS7=[2,234],$VT7=[2,235],$VU7=[1,2587],$VV7=[1,2593],$VW7=[1,2676],$VX7=[1,2709],$VY7=[1,2715],$VZ7=[1,2714],$V_7=[1,2735],$V$7=[1,2741],$V08=[1,2740],$V18=[1,2762],$V28=[1,2768],$V38=[1,2767],$V48=[1,2789],$V58=[1,2795],$V68=[1,2794],$V78=[1,2815],$V88=[1,2821],$V98=[1,2820],$Va8=[1,2842],$Vb8=[1,2848],$Vc8=[1,2847],$Vd8=[1,2889],$Ve8=[1,2922],$Vf8=[1,2928],$Vg8=[1,2927],$Vh8=[1,2948],$Vi8=[1,2954],$Vj8=[1,2953],$Vk8=[1,2975],$Vl8=[1,2981],$Vm8=[1,2980],$Vn8=[1,3002],$Vo8=[1,3008],$Vp8=[1,3007],$Vq8=[1,3028],$Vr8=[1,3034],$Vs8=[1,3033],$Vt8=[1,3055],$Vu8=[1,3061],$Vv8=[1,3060],$Vw8=[117,130,135,136,203],$Vx8=[1,3080],$Vy8=[2,48],$Vz8=[2,55],$VA8=[2,74],$VB8=[2,80],$VC8=[2,76],$VD8=[2,82],$VE8=[47,49,97,98,99,100,117,130,135,136,152,153,154,155,200,203],$VF8=[1,3104],$VG8=[66,130,135,136,200,203],$VH8=[1,3113],$VI8=[1,3114],$VJ8=[1,3115],$VK8=[1,3116],$VL8=[66,130,135,136,152,153,154,155,200,203],$VM8=[47,66,130,135,136,152,153,154,155,200,203],$VN8=[47,49,66,130,135,136,152,153,154,155,200,203],$VO8=[1,3145],$VP8=[2,221],$VQ8=[1,3225],$VR8=[1,3231],$VS8=[1,3311],$VT8=[1,3317],$VU8=[2,170],$VV8=[2,46],$VW8=[1,3405],$VX8=[2,53],$VY8=[1,3438],$VZ8=[2,77],$V_8=[2,167],$V$8=[1,3483],$V09=[47,49,66,75,76,77,97,98,99,100,115,120,122,130,135,136,152,153,154,155,200,203],$V19=[47,49,66,75,76,77,115,120,122,130,135,136,152,153,154,155,200,203],$V29=[47,49,66,97,98,99,100,108,109,110,111,112,113,130,135,136,152,153,154,155,200,203],$V39=[47,49,66,92,93,94,97,98,99,100,130,135,136,152,153,154,155,200,203],$V49=[47,49,66,108,109,110,111,112,113,130,135,136,152,153,154,155,200,203],$V59=[1,3529],$V69=[1,3535],$V79=[1,3534],$V89=[1,3555],$V99=[1,3561],$Va9=[1,3560],$Vb9=[1,3582],$Vc9=[1,3588],$Vd9=[1,3587],$Ve9=[1,3686],$Vf9=[1,3692],$Vg9=[1,3691],$Vh9=[1,3727],$Vi9=[1,3769],$Vj9=[66,130,135,136,203],$Vk9=[1,3799],$Vl9=[47,49,66,97,98,99,100,130,135,136,152,153,154,155,200,203],$Vm9=[1,3823],$Vn9=[1,3863],$Vo9=[1,3869],$Vp9=[1,3868],$Vq9=[1,3889],$Vr9=[1,3895],$Vs9=[1,3894],$Vt9=[1,3916],$Vu9=[1,3922],$Vv9=[1,3921],$Vw9=[1,3943],$Vx9=[1,3949],$Vy9=[1,3948],$Vz9=[1,3969],$VA9=[1,3975],$VB9=[1,3974],$VC9=[1,3996],$VD9=[1,4002],$VE9=[1,4001],$VF9=[107,117,130,135,136,200,203],$VG9=[1,4044],$VH9=[1,4068],$VI9=[1,4110],$VJ9=[1,4143],$VK9=[1,4250],$VL9=[1,4293],$VM9=[1,4299],$VN9=[1,4298],$VO9=[1,4334],$VP9=[1,4376],$VQ9=[1,4434],$VR9=[66,107,130,135,136,200,203],$VS9=[1,4489],$VT9=[1,4513],$VU9=[1,4543],$VV9=[1,4589],$VW9=[1,4661],$VX9=[1,4710];




  JisonParser.call(this, yy, lexer);


  this.symbols_ = {"error":2,"shexDoc":3,"initParser":4,"Qdirective_E_Star":5,"Q_O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C_E_Opt":6,"EOF":7,"directive":8,"O_QnotStartAction_E_Or_QstartActions_E_C":9,"notStartAction":10,"startActions":11,"Qstatement_E_Star":12,"statement":13,"O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C":14,"baseDecl":15,"prefixDecl":16,"importDecl":17,"IT_BASE":18,"IRIREF":19,"IT_PREFIX":20,"PNAME_NS":21,"iri":22,"IT_IMPORT":23,"start":24,"shapeExprDecl":25,"IT_start":26,"=":27,"shapeAnd":28,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Star":29,"QcodeDecl_E_Plus":30,"codeDecl":31,"shapeExprLabel":32,"O_QshapeExpression_E_Or_QIT_EXTERNAL_E_C":33,"shapeExpression":34,"IT_EXTERNAL":35,"QIT_NOT_E_Opt":36,"shapeAtomNoRef":37,"QshapeOr_E_Opt":38,"IT_NOT":39,"shapeRef":40,"shapeOr":41,"inlineShapeExpression":42,"inlineShapeOr":43,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Plus":44,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Plus":45,"O_QIT_OR_E_S_QshapeAnd_E_C":46,"IT_OR":47,"O_QIT_AND_E_S_QshapeNot_E_C":48,"IT_AND":49,"shapeNot":50,"inlineShapeAnd":51,"Q_O_QIT_OR_E_S_QinlineShapeAnd_E_C_E_Star":52,"O_QIT_OR_E_S_QinlineShapeAnd_E_C":53,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Star":54,"inlineShapeNot":55,"Q_O_QIT_AND_E_S_QinlineShapeNot_E_C_E_Star":56,"O_QIT_AND_E_S_QinlineShapeNot_E_C":57,"shapeAtom":58,"inlineShapeAtom":59,"nonLitNodeConstraint":60,"QshapeOrRef_E_Opt":61,"litNodeConstraint":62,"shapeOrRef":63,"QnonLitNodeConstraint_E_Opt":64,"(":65,")":66,".":67,"shapeDefinition":68,"nonLitInlineNodeConstraint":69,"QinlineShapeOrRef_E_Opt":70,"litInlineNodeConstraint":71,"inlineShapeOrRef":72,"QnonLitInlineNodeConstraint_E_Opt":73,"inlineShapeDefinition":74,"ATPNAME_LN":75,"ATPNAME_NS":76,"@":77,"Qannotation_E_Star":78,"semanticActions":79,"annotation":80,"IT_LITERAL":81,"QxsFacet_E_Star":82,"datatype":83,"valueSet":84,"QnumericFacet_E_Plus":85,"xsFacet":86,"numericFacet":87,"nonLiteralKind":88,"QstringFacet_E_Star":89,"QstringFacet_E_Plus":90,"stringFacet":91,"IT_IRI":92,"IT_BNODE":93,"IT_NONLITERAL":94,"stringLength":95,"INTEGER":96,"REGEXP":97,"IT_LENGTH":98,"IT_MINLENGTH":99,"IT_MAXLENGTH":100,"numericRange":101,"rawNumeric":102,"numericLength":103,"DECIMAL":104,"DOUBLE":105,"string":106,"^^":107,"IT_MININCLUSIVE":108,"IT_MINEXCLUSIVE":109,"IT_MAXINCLUSIVE":110,"IT_MAXEXCLUSIVE":111,"IT_TOTALDIGITS":112,"IT_FRACTIONDIGITS":113,"Q_QextraPropertySet_E_Or_QIT_CLOSED_E_C_E_Star":114,"{":115,"QtripleExpression_E_Opt":116,"}":117,"QextraPropertySet_E_Or_QIT_CLOSED_E_C":118,"extraPropertySet":119,"IT_CLOSED":120,"tripleExpression":121,"IT_EXTRA":122,"Qpredicate_E_Plus":123,"predicate":124,"oneOfTripleExpr":125,"groupTripleExpr":126,"multiElementOneOf":127,"Q_O_QGT_PIPE_E_S_QgroupTripleExpr_E_C_E_Plus":128,"O_QGT_PIPE_E_S_QgroupTripleExpr_E_C":129,"|":130,"singleElementGroup":131,"multiElementGroup":132,"unaryTripleExpr":133,"QGT_SEMI_E_Opt":134,",":135,";":136,"Q_O_QGT_SEMI_E_S_QunaryTripleExpr_E_C_E_Plus":137,"O_QGT_SEMI_E_S_QunaryTripleExpr_E_C":138,"Q_O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C_E_Opt":139,"O_QtripleConstraint_E_Or_QbracketedTripleExpr_E_C":140,"valueConstraint":141,"include":142,"O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C":143,"$":144,"tripleExprLabel":145,"tripleConstraint":146,"bracketedTripleExpr":147,"Qcardinality_E_Opt":148,"cardinality":149,"QsenseFlags_E_Opt":150,"senseFlags":151,"*":152,"+":153,"?":154,"REPEAT_RANGE":155,"^":156,"!":157,"[":158,"QvalueSetValue_E_Star":159,"]":160,"valueSetValue":161,"iriRange":162,"literalRange":163,"languageRange":164,"O_QiriExclusion_E_Plus_Or_QliteralExclusion_E_Plus_Or_QlanguageExclusion_E_Plus_C":165,"QiriExclusion_E_Plus":166,"iriExclusion":167,"QliteralExclusion_E_Plus":168,"literalExclusion":169,"QlanguageExclusion_E_Plus":170,"languageExclusion":171,"Q_O_QGT_TILDE_E_S_QiriExclusion_E_Star_C_E_Opt":172,"QiriExclusion_E_Star":173,"O_QGT_TILDE_E_S_QiriExclusion_E_Star_C":174,"~":175,"-":176,"QGT_TILDE_E_Opt":177,"literal":178,"Q_O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C_E_Opt":179,"QliteralExclusion_E_Star":180,"O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C":181,"LANGTAG":182,"Q_O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C_E_Opt":183,"O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C":184,"QlanguageExclusion_E_Star":185,"IT_UNIQUE":186,"Q_O_QIT_FOCUS_E_S_QGT_COMMA_E_C_E_Opt":187,"accessor":188,"Q_O_QGT_COMMA_E_S_Qaccessor_E_C_E_Star":189,"O_QGT_LT_E_Or_QGT_EQUAL_E_Or_QGT_NEQUAL_E_Or_QGT_GT_E_C":190,"O_QIT_FOCUS_E_S_QGT_COMMA_E_C":191,"IT_FOCUS":192,"O_QGT_COMMA_E_S_Qaccessor_E_C":193,"<":194,"!=":195,">":196,"IT_LANGTAG":197,"IT_DATATYPE":198,"&":199,"//":200,"O_Qiri_E_Or_Qliteral_E_C":201,"QcodeDecl_E_Star":202,"%":203,"O_QCODE_E_Or_QGT_MODULO_E_C":204,"CODE":205,"rdfLiteral":206,"numericLiteral":207,"booleanLiteral":208,"a":209,"blankNode":210,"langString":211,"Q_O_QGT_DTYPE_E_S_Qdatatype_E_C_E_Opt":212,"O_QGT_DTYPE_E_S_Qdatatype_E_C":213,"IT_true":214,"IT_false":215,"STRING_LITERAL1":216,"STRING_LITERAL_LONG1":217,"STRING_LITERAL2":218,"STRING_LITERAL_LONG2":219,"LANG_STRING_LITERAL1":220,"LANG_STRING_LITERAL_LONG1":221,"LANG_STRING_LITERAL2":222,"LANG_STRING_LITERAL_LONG2":223,"prefixedName":224,"PNAME_LN":225,"BLANK_NODE_LABEL":226,"O_QIT_EXTENDS_E_Or_QGT_AMP_E_C":227,"IT_EXTENDS":228,"$accept":0,"$end":1};
  this.terminals_ = {2:"error",7:"EOF",18:"IT_BASE",19:"IRIREF",20:"IT_PREFIX",21:"PNAME_NS",23:"IT_IMPORT",26:"IT_start",27:"=",35:"IT_EXTERNAL",39:"IT_NOT",47:"IT_OR",49:"IT_AND",65:"(",66:")",67:".",75:"ATPNAME_LN",76:"ATPNAME_NS",77:"@",81:"IT_LITERAL",92:"IT_IRI",93:"IT_BNODE",94:"IT_NONLITERAL",96:"INTEGER",97:"REGEXP",98:"IT_LENGTH",99:"IT_MINLENGTH",100:"IT_MAXLENGTH",104:"DECIMAL",105:"DOUBLE",107:"^^",108:"IT_MININCLUSIVE",109:"IT_MINEXCLUSIVE",110:"IT_MAXINCLUSIVE",111:"IT_MAXEXCLUSIVE",112:"IT_TOTALDIGITS",113:"IT_FRACTIONDIGITS",115:"{",117:"}",120:"IT_CLOSED",122:"IT_EXTRA",130:"|",135:",",136:";",144:"$",152:"*",153:"+",154:"?",155:"REPEAT_RANGE",156:"^",157:"!",158:"[",160:"]",175:"~",176:"-",182:"LANGTAG",186:"IT_UNIQUE",192:"IT_FOCUS",194:"<",195:"!=",196:">",197:"IT_LANGTAG",198:"IT_DATATYPE",199:"&",200:"//",203:"%",205:"CODE",209:"a",214:"IT_true",215:"IT_false",216:"STRING_LITERAL1",217:"STRING_LITERAL_LONG1",218:"STRING_LITERAL2",219:"STRING_LITERAL_LONG2",220:"LANG_STRING_LITERAL1",221:"LANG_STRING_LITERAL_LONG1",222:"LANG_STRING_LITERAL2",223:"LANG_STRING_LITERAL_LONG2",225:"PNAME_LN",226:"BLANK_NODE_LABEL",228:"IT_EXTENDS"};
  this.productions_ = [0,[3,4],[4,0],[5,0],[5,2],[9,1],[9,1],[12,0],[12,2],[14,2],[6,0],[6,1],[8,1],[8,1],[8,1],[15,2],[16,3],[17,2],[10,1],[10,1],[24,4],[11,1],[30,1],[30,2],[13,1],[13,1],[25,2],[33,1],[33,1],[34,3],[34,3],[34,2],[38,0],[38,1],[42,1],[41,1],[41,2],[46,2],[44,1],[44,2],[48,2],[45,1],[45,2],[29,0],[29,2],[43,2],[53,2],[52,0],[52,2],[28,2],[54,0],[54,2],[51,2],[57,2],[56,0],[56,2],[50,2],[36,0],[36,1],[55,2],[58,2],[58,1],[58,2],[58,3],[58,1],[61,0],[61,1],[64,0],[64,1],[37,2],[37,1],[37,2],[37,3],[37,1],[59,2],[59,1],[59,2],[59,3],[59,1],[70,0],[70,1],[73,0],[73,1],[63,1],[63,1],[72,1],[72,1],[40,1],[40,1],[40,2],[62,3],[78,0],[78,2],[60,3],[71,2],[71,2],[71,2],[71,1],[82,0],[82,2],[85,1],[85,2],[69,2],[69,1],[89,0],[89,2],[90,1],[90,2],[88,1],[88,1],[88,1],[86,1],[86,1],[91,2],[91,1],[95,1],[95,1],[95,1],[87,2],[87,2],[102,1],[102,1],[102,1],[102,3],[101,1],[101,1],[101,1],[101,1],[103,1],[103,1],[68,3],[74,4],[118,1],[118,1],[114,0],[114,2],[116,0],[116,1],[119,2],[123,1],[123,2],[121,1],[125,1],[125,1],[127,2],[129,2],[128,1],[128,2],[126,1],[126,1],[131,2],[134,0],[134,1],[134,1],[132,3],[138,2],[138,2],[137,1],[137,2],[133,2],[133,1],[133,1],[143,2],[139,0],[139,1],[140,1],[140,1],[147,6],[148,0],[148,1],[146,6],[150,0],[150,1],[149,1],[149,1],[149,1],[149,1],[151,1],[151,2],[151,1],[151,2],[84,3],[159,0],[159,2],[161,1],[161,1],[161,1],[161,2],[166,1],[166,2],[168,1],[168,2],[170,1],[170,2],[165,1],[165,1],[165,1],[162,2],[173,0],[173,2],[174,2],[172,0],[172,1],[167,3],[177,0],[177,1],[163,2],[180,0],[180,2],[181,2],[179,0],[179,1],[169,3],[164,2],[164,2],[185,0],[185,2],[184,2],[183,0],[183,1],[171,3],[141,6],[141,3],[191,2],[187,0],[187,1],[193,2],[189,0],[189,2],[190,1],[190,1],[190,1],[190,1],[188,2],[188,5],[188,5],[142,2],[80,3],[201,1],[201,1],[79,1],[202,0],[202,2],[31,3],[204,1],[204,1],[178,1],[178,1],[178,1],[124,1],[124,1],[83,1],[32,1],[32,1],[145,1],[145,1],[207,1],[207,1],[207,1],[206,1],[206,2],[213,2],[212,0],[212,1],[208,1],[208,1],[106,1],[106,1],[106,1],[106,1],[211,1],[211,1],[211,1],[211,1],[22,1],[22,1],[224,1],[224,1],[210,1],[227,1],[227,1]];
  this.table = [o($V0,[2,2],{3:1,4:2}),{1:[3]},o($V0,[2,3],{5:3}),{6:4,7:[2,10],8:5,9:10,10:14,11:15,14:6,15:7,16:8,17:9,18:[1,11],19:$V1,20:[1,12],21:$V2,22:22,23:[1,13],24:16,25:17,26:[1,19],30:18,31:21,32:20,203:$V3,210:23,224:26,225:$V4,226:$V5},{7:[1,30]},o($V0,[2,4]),{7:[2,11]},o($V0,$V6),o($V0,$V7),o($V0,$V8),o($V9,[2,7],{12:31}),{19:[1,32]},{21:[1,33]},{19:$Va,21:$Vb,22:34,224:36,225:$Vc},o($V9,[2,5]),o($V9,[2,6]),o($V9,$Vd),o($V9,$Ve),o($V9,[2,21],{31:39,203:$V3}),{27:[1,40]},o($Vf,$Vg,{33:41,34:42,36:44,40:46,35:[1,43],39:[1,45],75:$Vh,76:$Vi,77:$Vj}),o($V0,[2,22]),o($Vk,$Vl),o($Vk,$Vm),{19:$Vn,21:$Vo,22:50,224:52,225:$Vp},o($Vk,$Vq),o($Vk,$Vr),o($Vk,$Vs),o($Vk,$Vt),o($Vk,$Vu),{1:[2,1]},{7:[2,9],8:56,10:57,13:55,15:58,16:59,17:60,18:[1,63],19:$V1,20:[1,64],21:$V2,22:22,23:[1,65],24:61,25:62,26:[1,66],32:67,210:23,224:26,225:$V4,226:$V5},o($V0,$Vv),{19:$Va,21:$Vb,22:68,224:36,225:$Vc},o($V0,$Vw),o($V0,$Vq),o($V0,$Vr),o($V0,$Vt),o($V0,$Vu),o($V0,[2,23]),o($Vx,$Vg,{28:69,50:70,36:71,39:$Vy}),o($V9,$Vz),o($V9,$VA),o($V9,$VB),o($VC,$VD,{37:73,60:74,62:75,68:76,69:79,71:80,74:81,88:82,90:83,83:85,84:86,85:87,114:88,91:92,22:93,87:95,95:96,224:99,101:100,103:101,19:$VE,21:$VF,65:[1,77],67:[1,78],81:$VG,92:$VH,93:$VI,94:$VJ,97:$VK,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,158:$VU,225:$VV}),o($Vf,$VW,{40:113,75:$VX,76:$VY,77:$VZ}),{41:117,44:118,45:119,46:120,47:$V_,48:121,49:$V$},o($V01,$V11),o($V01,$V21),{19:[1,127],21:[1,131],22:125,32:124,210:126,224:128,225:[1,130],226:[1,129]},{203:[1,134],204:132,205:[1,133]},o($V31,$Vq),o($V31,$Vr),o($V31,$Vt),o($V31,$Vu),o($V9,[2,8]),o($V9,[2,24]),o($V9,[2,25]),o($V9,$V6),o($V9,$V7),o($V9,$V8),o($V9,$Vd),o($V9,$Ve),{19:[1,135]},{21:[1,136]},{19:$V41,21:$V51,22:137,224:139,225:$V61},{27:[1,142]},o($Vf,$Vg,{33:143,34:144,36:146,40:148,35:[1,145],39:[1,147],75:$Vh,76:$Vi,77:$Vj}),o($V0,$V71),o($V81,$V91,{29:149}),o($Va1,$Vb1,{54:150}),o($VC,$VD,{69:79,71:80,74:81,88:82,90:83,83:85,84:86,85:87,114:88,91:92,22:93,87:95,95:96,224:99,101:100,103:101,58:151,60:152,62:153,63:154,68:157,40:158,19:$VE,21:$VF,65:[1,155],67:[1,156],75:[1,159],76:[1,160],77:[1,161],81:$VG,92:$VH,93:$VI,94:$VJ,97:$VK,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,158:$VU,225:$VV}),o($Vx,$VW),o($V9,$Vc1,{44:118,45:119,46:120,48:121,38:162,41:163,47:$V_,49:$V$}),o($Va1,$Vd1,{61:164,63:165,68:166,40:167,74:168,114:169,75:$VX,76:$VY,77:$VZ,115:$VD,120:$VD,122:$VD}),o($Va1,$Ve1),o($Va1,$Vf1,{64:170,60:171,69:172,88:173,90:174,91:178,95:179,92:$Vg1,93:$Vh1,94:$Vi1,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{34:181,36:182,40:184,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vl1),o($Vm1,$Vn1,{78:185}),o($Vo1,$Vn1,{78:186}),o($Vp1,$Vn1,{78:187}),o($Vq1,$Vr1,{89:188}),o($Vm1,$Vs1,{95:96,91:189,97:$VK,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:190}),o($Vt1,$Vu1,{82:191}),o($Vt1,$Vu1,{82:192}),o($Vo1,$Vv1,{101:100,103:101,87:193,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),{115:[1,194],118:195,119:196,120:$Vw1,122:$Vx1},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{159:199}),o($VF1,$VG1),{96:[1,200]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,202],102:201,104:[1,203],105:[1,204],106:205,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,210]},{96:[2,115]},{96:[2,116]},{96:[2,117]},o($Vt1,$Vt),o($Vt1,$Vu),o($VM1,[2,124]),o($VM1,[2,125]),o($VM1,[2,126]),o($VM1,[2,127]),{96:[2,128]},{96:[2,129]},o($V9,$Vc1,{44:118,45:119,46:120,48:121,41:163,38:211,47:$V_,49:$V$}),o($Va1,$V11),o($Va1,$V21),{19:[1,215],21:[1,219],22:213,32:212,210:214,224:216,225:[1,218],226:[1,217]},o($V9,$VN1),o($V9,$VO1,{46:220,47:$V_}),o($V81,$V91,{29:221,48:222,49:$V$}),o($V81,$VP1),o($Va1,$VQ1),o($Vx,$Vg,{28:223,50:224,36:225,39:$Vy}),o($Vx,$Vg,{50:226,36:227,39:$Vy}),o($V01,$VR1),o($V01,$Vl),o($V01,$Vm),o($V01,$Vq),o($V01,$Vr),o($V01,$Vs),o($V01,$Vt),o($V01,$Vu),o($V0,$VS1),o($V0,$VT1),o($V0,$VU1),o($V9,$Vv),{19:$V41,21:$V51,22:228,224:139,225:$V61},o($V9,$Vw),o($V9,$Vq),o($V9,$Vr),o($V9,$Vt),o($V9,$Vu),o($Vx,$Vg,{28:229,50:230,36:231,39:$Vy}),o($V9,$Vz),o($V9,$VA),o($V9,$VB),o($VC,$VD,{37:232,60:233,62:234,68:235,69:238,71:239,74:240,88:241,90:242,83:244,84:245,85:246,114:247,91:251,22:252,87:254,95:255,224:258,101:259,103:260,19:$VV1,21:$VW1,65:[1,236],67:[1,237],81:$VX1,92:$VY1,93:$VZ1,94:$V_1,97:$V$1,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,158:$V02,225:$V12}),o($Vf,$VW,{40:263,75:$V22,76:$V32,77:$V42}),{41:267,44:268,45:269,46:270,47:$V52,48:271,49:$V62},o($V9,$V72,{46:274,47:$V_}),o($V81,$V82,{48:275,49:$V$}),o($Va1,$V92),o($Va1,$Vd1,{63:165,68:166,40:167,74:168,114:169,61:276,75:$VX,76:$VY,77:$VZ,115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{60:171,69:172,88:173,90:174,91:178,95:179,64:277,92:$Vg1,93:$Vh1,94:$Vi1,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:278,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vc2,$V11),o($Vc2,$V21),{19:[1,282],21:[1,286],22:280,32:279,210:281,224:283,225:[1,285],226:[1,284]},o($V9,$Vf2),o($V9,$Vg2),o($Va1,$Vh2),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:287}),{115:[1,288],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vj2),o($Va1,$Vk2),o($Vo1,$Vn1,{78:289}),o($Vl2,$Vr1,{89:290}),o($Vo1,$Vs1,{95:179,91:291,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,292]},o($Vl2,$VH1),{66:[1,293]},o($VC,$VD,{37:294,60:295,62:296,68:297,69:300,71:301,74:302,88:303,90:304,83:306,84:307,85:308,114:309,91:313,22:314,87:316,95:317,224:320,101:321,103:322,19:[1,319],21:[1,324],65:[1,298],67:[1,299],81:[1,305],92:[1,310],93:[1,311],94:[1,312],97:$Vm2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,158:[1,315],225:[1,323]}),o($Vf,$VW,{40:325,75:$Vn2,76:$Vo2,77:$Vp2}),{41:329,44:330,45:331,46:332,47:$Vq2,48:333,49:$Vr2},o($Vs2,$Vt2,{79:336,80:337,202:338,200:[1,339]}),o($Vu2,$Vt2,{79:340,80:341,202:342,200:$Vv2}),o($Vw2,$Vt2,{79:344,80:345,202:346,200:[1,347]}),o($Vm1,$Vx2,{95:96,91:348,97:$VK,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:349,91:350,87:351,95:352,101:354,103:355,97:$VA2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:349,91:350,87:351,95:352,101:354,103:355,97:$VA2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:349,91:350,87:351,95:352,101:354,103:355,97:$VA2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($VE2,$VF2,{116:356,121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($VC,[2,135]),o($VC,[2,132]),o($VC,[2,133]),{19:$VM2,21:$VN2,22:376,123:374,124:375,209:$VO2,224:379,225:$VP2},{19:$VQ2,21:$VR2,22:388,67:$VS2,77:$VT2,96:$VU2,104:$VV2,105:$VW2,106:400,160:[1,382],161:383,162:384,163:385,164:386,178:389,182:$VX2,206:394,207:395,208:396,211:399,214:$VY2,215:$VZ2,216:$V_2,217:$V$2,218:$V03,219:$V13,220:$V23,221:$V33,222:$V43,223:$V53,224:393,225:$V63},o($Vq1,$V73),o($VF1,$V83),o($VF1,$V93),o($VF1,$Va3),o($VF1,$Vb3),{107:[1,414]},{107:$Vc3},{107:$Vd3},{107:$Ve3},{107:$Vf3},o($VF1,$Vg3),o($V9,$Vh3),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($V81,$Vi3),o($V9,$Vj3,{46:274,47:$V_}),o($Va1,$Vk3),o($V81,$Vl3),o($Va1,$Vb1,{54:415}),o($VC,$VD,{58:416,60:417,62:418,63:419,69:422,71:423,68:424,40:425,88:426,90:427,83:429,84:430,85:431,74:432,91:439,22:440,87:442,114:443,95:444,224:447,101:448,103:449,19:[1,446],21:[1,451],65:[1,420],67:[1,421],75:[1,433],76:[1,434],77:[1,435],81:[1,428],92:[1,436],93:[1,437],94:[1,438],97:$Vm3,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,158:[1,441],225:[1,450]}),o($Va1,$Vn3),o($VC,$VD,{58:452,60:453,62:454,63:455,69:458,71:459,68:460,40:461,88:462,90:463,83:465,84:466,85:467,74:468,91:475,22:476,87:478,114:479,95:480,224:483,101:484,103:485,19:[1,482],21:[1,487],65:[1,456],67:[1,457],75:[1,469],76:[1,470],77:[1,471],81:[1,464],92:[1,472],93:[1,473],94:[1,474],97:$Vo3,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,158:[1,477],225:[1,486]}),o($V9,$V71),o($V81,$V91,{29:488}),o($Va1,$Vb1,{54:489}),o($VC,$VD,{69:238,71:239,74:240,88:241,90:242,83:244,84:245,85:246,114:247,91:251,22:252,87:254,95:255,224:258,101:259,103:260,58:490,60:491,62:492,63:493,68:496,40:497,19:$VV1,21:$VW1,65:[1,494],67:[1,495],75:[1,498],76:[1,499],77:[1,500],81:$VX1,92:$VY1,93:$VZ1,94:$V_1,97:$V$1,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,158:$V02,225:$V12}),o($V9,$Vc1,{44:268,45:269,46:270,48:271,38:501,41:502,47:$V52,49:$V62}),o($Va1,$Vd1,{61:503,63:504,68:505,40:506,74:507,114:508,75:$V22,76:$V32,77:$V42,115:$VD,120:$VD,122:$VD}),o($Va1,$Ve1),o($Va1,$Vf1,{64:509,60:510,69:511,88:512,90:513,91:517,95:518,92:$Vp3,93:$Vq3,94:$Vr3,97:$Vs3,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:520,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vl1),o($Vm1,$Vn1,{78:521}),o($Vo1,$Vn1,{78:522}),o($Vp1,$Vn1,{78:523}),o($Vq1,$Vr1,{89:524}),o($Vm1,$Vs1,{95:255,91:525,97:$V$1,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:526}),o($Vt1,$Vu1,{82:527}),o($Vt1,$Vu1,{82:528}),o($Vo1,$Vv1,{101:259,103:260,87:529,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),{115:[1,530],118:195,119:196,120:$Vw1,122:$Vx1},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{159:531}),o($VF1,$VG1),{96:[1,532]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,534],102:533,104:[1,535],105:[1,536],106:537,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,538]},o($Vt1,$Vt),o($Vt1,$Vu),o($V9,$Vc1,{44:268,45:269,46:270,48:271,41:502,38:539,47:$V52,49:$V62}),o($Va1,$V11),o($Va1,$V21),{19:[1,543],21:[1,547],22:541,32:540,210:542,224:544,225:[1,546],226:[1,545]},o($V9,$VN1),o($V9,$VO1,{46:548,47:$V52}),o($V81,$V91,{29:549,48:550,49:$V62}),o($V81,$VP1),o($Va1,$VQ1),o($Vx,$Vg,{28:551,50:552,36:553,39:$Vy}),o($Vx,$Vg,{50:554,36:555,39:$Vy}),o($V81,$Vt3),o($Va1,$Vu3),o($Va1,$Vv3),o($Va1,$Vw3),{66:[1,556]},o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),o($Vu2,$Vt2,{80:341,202:342,79:557,200:$Vv2}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:558,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($Vu2,$Vt2,{80:341,202:342,79:559,200:$Vv2}),o($Vo1,$Vx2,{95:179,91:560,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V73),o($Va1,$Vx3),{38:561,41:562,44:330,45:331,46:332,47:$Vq2,48:333,49:$Vr2,66:$Vc1},o($Vy3,$Vd1,{61:563,63:564,68:565,40:566,74:567,114:568,75:$Vn2,76:$Vo2,77:$Vp2,115:$VD,120:$VD,122:$VD}),o($Vy3,$Ve1),o($Vy3,$Vf1,{64:569,60:570,69:571,88:572,90:573,91:577,95:578,92:[1,574],93:[1,575],94:[1,576],97:$Vz3,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:580,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vy3,$Vl1),o($VA3,$Vn1,{78:581}),o($VB3,$Vn1,{78:582}),o($VC3,$Vn1,{78:583}),o($VD3,$Vr1,{89:584}),o($VA3,$Vs1,{95:317,91:585,97:$Vm2,98:$VL,99:$VM,100:$VN}),o($VE3,$Vu1,{82:586}),o($VE3,$Vu1,{82:587}),o($VE3,$Vu1,{82:588}),o($VB3,$Vv1,{101:321,103:322,87:589,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),{115:[1,590],118:195,119:196,120:$Vw1,122:$Vx1},o($VD3,$Vy1),o($VD3,$Vz1),o($VD3,$VA1),o($VD3,$VB1),o($VE3,$VC1),o($VD1,$VE1,{159:591}),o($VF3,$VG1),{96:[1,592]},o($VD3,$VH1),o($VE3,$Vq),o($VE3,$Vr),{96:[1,594],102:593,104:[1,595],105:[1,596],106:597,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,598]},o($VE3,$Vt),o($VE3,$Vu),{38:599,41:562,44:330,45:331,46:332,47:$Vq2,48:333,49:$Vr2,66:$Vc1},o($Vy3,$V11),o($Vy3,$V21),{19:[1,603],21:[1,607],22:601,32:600,210:602,224:604,225:[1,606],226:[1,605]},{66:$VN1},{46:608,47:$Vq2,66:$VO1},o($VG3,$V91,{29:609,48:610,49:$Vr2}),o($VG3,$VP1),o($Vy3,$VQ1),o($Vx,$Vg,{28:611,50:612,36:613,39:$Vy}),o($Vx,$Vg,{50:614,36:615,39:$Vy}),o($VH3,$VI3),o($Vm1,$VJ3),o($VH3,$VK3,{31:616,203:[1,617]}),{19:$VL3,21:$VM3,22:619,124:618,209:$VN3,224:622,225:$VO3},o($Va1,$VP3),o($Vo1,$VJ3),o($Va1,$VK3,{31:625,203:[1,626]}),{19:$VL3,21:$VM3,22:619,124:627,209:$VN3,224:622,225:$VO3},o($Vc2,$VQ3),o($Vp1,$VJ3),o($Vc2,$VK3,{31:628,203:[1,629]}),{19:$VL3,21:$VM3,22:619,124:630,209:$VN3,224:622,225:$VO3},o($Vq1,$VR3),o($Vt1,$VS3),o($Vt1,$VT3),o($Vt1,$VU3),{96:[1,631]},o($Vt1,$VH1),{96:[1,633],102:632,104:[1,634],105:[1,635],106:636,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,637]},{117:[1,638]},{117:[2,137]},{117:$VV3},{117:$VW3,128:639,129:640,130:$VX3},{117:$VY3},o($VZ3,$V_3),o($VZ3,$V$3),o($VZ3,$V04,{134:642,137:643,138:646,135:$V14,136:$V24}),o($V34,$V44,{140:647,146:648,147:649,150:650,151:652,65:[1,651],156:$V54,157:$V64}),o($V74,$V84),o($V74,$V94),o($VE2,[2,164]),{65:[1,655]},{27:$Va4,190:656,194:$Vb4,195:$Vc4,196:$Vd4},{19:$Ve4,21:$Vf4,22:662,145:661,210:663,224:665,225:$Vg4,226:$Vh4},{19:[1,672],21:[1,676],22:670,145:669,210:671,224:673,225:[1,675],226:[1,674]},{65:[1,677]},{65:[1,678]},o($VC,[2,138],{22:376,224:379,124:679,19:$VM2,21:$VN2,209:$VO2,225:$VP2}),o($Vi4,[2,139]),o($Vi4,$Vj4),o($Vi4,$Vk4),o($Vi4,$Vq),o($Vi4,$Vr),o($Vi4,$Vt),o($Vi4,$Vu),o($Vt1,$Vl4),o($VD1,[2,183]),o($VD1,[2,184]),o($VD1,[2,185]),o($VD1,[2,186]),{165:680,166:681,167:684,168:682,169:685,170:683,171:686,176:[1,687]},o($VD1,[2,201],{172:688,174:689,175:[1,690]}),o($VD1,[2,210],{179:691,181:692,175:[1,693]}),o($VD1,[2,218],{183:694,184:695,175:$Vm4}),{175:$Vm4,184:697},o($Vn4,$Vq),o($Vn4,$Vr),o($Vn4,$Vo4),o($Vn4,$Vp4),o($Vn4,$Vq4),o($Vn4,$Vt),o($Vn4,$Vu),o($Vn4,$Vr4),o($Vn4,$Vs4,{212:698,213:699,107:[1,700]}),o($Vn4,$Vt4),o($Vn4,$Vu4),o($Vn4,$Vv4),o($Vn4,$Vw4),o($Vn4,$Vx4),o($Vn4,$Vy4),o($Vn4,$Vz4),o($Vn4,$VA4),o($Vn4,$VB4),o($VC4,$Vc3),o($VC4,$Vd3),o($VC4,$Ve3),o($VC4,$Vf3),{19:[1,703],21:[1,706],22:702,83:701,224:704,225:[1,705]},o($V81,$V82,{48:707,49:[1,708]}),o($Va1,$V92),o($Va1,$Vd1,{61:709,63:710,68:711,40:712,74:713,114:717,75:[1,714],76:[1,715],77:[1,716],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:718,60:719,69:720,88:721,90:722,91:726,95:727,92:[1,723],93:[1,724],94:[1,725],97:$VD4,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:729,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:730}),o($Vo1,$Vn1,{78:731}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:732}),o($Vm1,$Vs1,{95:444,91:733,97:$Vm3,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:734}),o($Vt1,$Vu1,{82:735}),o($Vt1,$Vu1,{82:736}),o($Vo1,$Vv1,{101:448,103:449,87:737,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:738}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,742],21:[1,746],22:740,32:739,210:741,224:743,225:[1,745],226:[1,744]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{159:747}),o($VF1,$VG1),{115:[1,748],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,749]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,751],102:750,104:[1,752],105:[1,753],106:754,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,755]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$V92),o($Va1,$Vd1,{61:756,63:757,68:758,40:759,74:760,114:764,75:[1,761],76:[1,762],77:[1,763],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:765,60:766,69:767,88:768,90:769,91:773,95:774,92:[1,770],93:[1,771],94:[1,772],97:$VE4,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:776,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:777}),o($Vo1,$Vn1,{78:778}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:779}),o($Vm1,$Vs1,{95:480,91:780,97:$Vo3,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:781}),o($Vt1,$Vu1,{82:782}),o($Vt1,$Vu1,{82:783}),o($Vo1,$Vv1,{101:484,103:485,87:784,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:785}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,789],21:[1,793],22:787,32:786,210:788,224:790,225:[1,792],226:[1,791]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{159:794}),o($VF1,$VG1),{115:[1,795],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,796]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,798],102:797,104:[1,799],105:[1,800],106:801,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,802]},o($Vt1,$Vt),o($Vt1,$Vu),o($V9,$V72,{46:803,47:$V52}),o($V81,$V82,{48:804,49:$V62}),o($Va1,$V92),o($Va1,$Vd1,{63:504,68:505,40:506,74:507,114:508,61:805,75:$V22,76:$V32,77:$V42,115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{60:510,69:511,88:512,90:513,91:517,95:518,64:806,92:$Vp3,93:$Vq3,94:$Vr3,97:$Vs3,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:807,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vc2,$V11),o($Vc2,$V21),{19:[1,811],21:[1,815],22:809,32:808,210:810,224:812,225:[1,814],226:[1,813]},o($V9,$Vf2),o($V9,$Vg2),o($Va1,$Vh2),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:816}),{115:[1,817],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vj2),o($Va1,$Vk2),o($Vo1,$Vn1,{78:818}),o($Vl2,$Vr1,{89:819}),o($Vo1,$Vs1,{95:518,91:820,97:$Vs3,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,821]},o($Vl2,$VH1),{66:[1,822]},o($Vs2,$Vt2,{79:823,80:824,202:825,200:[1,826]}),o($Vu2,$Vt2,{79:827,80:828,202:829,200:$VF4}),o($Vw2,$Vt2,{79:831,80:832,202:833,200:[1,834]}),o($Vm1,$Vx2,{95:255,91:835,97:$V$1,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:836,91:837,87:838,95:839,101:841,103:842,97:$VG4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:836,91:837,87:838,95:839,101:841,103:842,97:$VG4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:836,91:837,87:838,95:839,101:841,103:842,97:$VG4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:843,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),{19:$VQ2,21:$VR2,22:388,67:$VS2,77:$VT2,96:$VU2,104:$VV2,105:$VW2,106:400,160:[1,844],161:383,162:384,163:385,164:386,178:389,182:$VX2,206:394,207:395,208:396,211:399,214:$VY2,215:$VZ2,216:$V_2,217:$V$2,218:$V03,219:$V13,220:$V23,221:$V33,222:$V43,223:$V53,224:393,225:$V63},o($Vq1,$V73),o($VF1,$V83),o($VF1,$V93),o($VF1,$Va3),o($VF1,$Vb3),{107:[1,845]},o($VF1,$Vg3),o($V9,$Vh3),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($V81,$Vi3),o($V9,$Vj3,{46:803,47:$V52}),o($Va1,$Vk3),o($V81,$Vl3),o($Va1,$Vb1,{54:846}),o($VC,$VD,{58:847,60:848,62:849,63:850,69:853,71:854,68:855,40:856,88:857,90:858,83:860,84:861,85:862,74:863,91:870,22:871,87:873,114:874,95:875,224:878,101:879,103:880,19:[1,877],21:[1,882],65:[1,851],67:[1,852],75:[1,864],76:[1,865],77:[1,866],81:[1,859],92:[1,867],93:[1,868],94:[1,869],97:$VH4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,158:[1,872],225:[1,881]}),o($Va1,$Vn3),o($VC,$VD,{58:883,60:884,62:885,63:886,69:889,71:890,68:891,40:892,88:893,90:894,83:896,84:897,85:898,74:899,91:906,22:907,87:909,114:910,95:911,224:914,101:915,103:916,19:[1,913],21:[1,918],65:[1,887],67:[1,888],75:[1,900],76:[1,901],77:[1,902],81:[1,895],92:[1,903],93:[1,904],94:[1,905],97:$VI4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,158:[1,908],225:[1,917]}),o($Va1,$VJ4),o($Va1,$VQ3),{117:[1,919]},o($Va1,$VI3),o($Vl2,$VR3),{66:$Vf2},{66:$Vg2},o($Vy3,$Vh2),o($Vy3,$Vi2),o($Vy3,$Vd2),o($Vy3,$Ve2),o($VB3,$Vn1,{78:920}),{115:[1,921],118:195,119:196,120:$Vw1,122:$Vx1},o($Vy3,$Vj2),o($Vy3,$Vk2),o($VB3,$Vn1,{78:922}),o($VK4,$Vr1,{89:923}),o($VB3,$Vs1,{95:578,91:924,97:$Vz3,98:$VL,99:$VM,100:$VN}),o($VK4,$Vy1),o($VK4,$Vz1),o($VK4,$VA1),o($VK4,$VB1),{96:[1,925]},o($VK4,$VH1),{66:[1,926]},o($VL4,$Vt2,{79:927,80:928,202:929,200:[1,930]}),o($VM4,$Vt2,{79:931,80:932,202:933,200:$VN4}),o($VO4,$Vt2,{79:935,80:936,202:937,200:[1,938]}),o($VA3,$Vx2,{95:317,91:939,97:$Vm2,98:$VL,99:$VM,100:$VN}),o($VD3,$Vy2),o($VB3,$Vz2,{86:940,91:941,87:942,95:943,101:945,103:946,97:$VP4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB3,$VB2,{86:940,91:941,87:942,95:943,101:945,103:946,97:$VP4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB3,$VC2,{86:940,91:941,87:942,95:943,101:945,103:946,97:$VP4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF3,$VD2),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:947,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),{19:$VQ2,21:$VR2,22:388,67:$VS2,77:$VT2,96:$VU2,104:$VV2,105:$VW2,106:400,160:[1,948],161:383,162:384,163:385,164:386,178:389,182:$VX2,206:394,207:395,208:396,211:399,214:$VY2,215:$VZ2,216:$V_2,217:$V$2,218:$V03,219:$V13,220:$V23,221:$V33,222:$V43,223:$V53,224:393,225:$V63},o($VD3,$V73),o($VF3,$V83),o($VF3,$V93),o($VF3,$Va3),o($VF3,$Vb3),{107:[1,949]},o($VF3,$Vg3),{66:$Vh3},o($Vy3,$VR1),o($Vy3,$Vl),o($Vy3,$Vm),o($Vy3,$Vq),o($Vy3,$Vr),o($Vy3,$Vs),o($Vy3,$Vt),o($Vy3,$Vu),o($VG3,$Vi3),{46:950,47:$Vq2,66:$Vj3},o($Vy3,$Vk3),o($VG3,$Vl3),o($Vy3,$Vb1,{54:951}),o($VC,$VD,{58:952,60:953,62:954,63:955,69:958,71:959,68:960,40:961,88:962,90:963,83:965,84:966,85:967,74:968,91:975,22:976,87:978,114:979,95:980,224:983,101:984,103:985,19:[1,982],21:[1,987],65:[1,956],67:[1,957],75:[1,969],76:[1,970],77:[1,971],81:[1,964],92:[1,972],93:[1,973],94:[1,974],97:$VQ4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,158:[1,977],225:[1,986]}),o($Vy3,$Vn3),o($VC,$VD,{58:988,60:989,62:990,63:991,69:994,71:995,68:996,40:997,88:998,90:999,83:1001,84:1002,85:1003,74:1004,91:1011,22:1012,87:1014,114:1015,95:1016,224:1019,101:1020,103:1021,19:[1,1018],21:[1,1023],65:[1,992],67:[1,993],75:[1,1005],76:[1,1006],77:[1,1007],81:[1,1000],92:[1,1008],93:[1,1009],94:[1,1010],97:$VR4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,158:[1,1013],225:[1,1022]}),o($Vs2,$VS4),{19:$Vn,21:$Vo,22:1024,224:52,225:$Vp},{19:$VT4,21:$VU4,22:1026,96:[1,1037],104:[1,1038],105:[1,1039],106:1036,178:1027,201:1025,206:1030,207:1031,208:1032,211:1035,214:[1,1040],215:[1,1041],216:[1,1046],217:[1,1047],218:[1,1048],219:[1,1049],220:[1,1042],221:[1,1043],222:[1,1044],223:[1,1045],224:1029,225:$VV4},o($VW4,$Vj4),o($VW4,$Vk4),o($VW4,$Vq),o($VW4,$Vr),o($VW4,$Vt),o($VW4,$Vu),o($Vu2,$VS4),{19:$Vn,21:$Vo,22:1050,224:52,225:$Vp},{19:$VX4,21:$VY4,22:1052,96:[1,1063],104:[1,1064],105:[1,1065],106:1062,178:1053,201:1051,206:1056,207:1057,208:1058,211:1061,214:[1,1066],215:[1,1067],216:[1,1072],217:[1,1073],218:[1,1074],219:[1,1075],220:[1,1068],221:[1,1069],222:[1,1070],223:[1,1071],224:1055,225:$VZ4},o($Vw2,$VS4),{19:$Vn,21:$Vo,22:1076,224:52,225:$Vp},{19:$V_4,21:$V$4,22:1078,96:[1,1089],104:[1,1090],105:[1,1091],106:1088,178:1079,201:1077,206:1082,207:1083,208:1084,211:1087,214:[1,1092],215:[1,1093],216:[1,1098],217:[1,1099],218:[1,1100],219:[1,1101],220:[1,1094],221:[1,1095],222:[1,1096],223:[1,1097],224:1081,225:$V05},o($Vt1,$V73),o($Vt1,$V83),o($Vt1,$V93),o($Vt1,$Va3),o($Vt1,$Vb3),{107:[1,1102]},o($Vt1,$Vg3),o($Vp1,$V15),{117:$V25,129:1103,130:$VX3},o($VZ3,$V35),o($VE2,$VF2,{131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,126:1104,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($VZ3,$V45),o($VZ3,$V04,{134:1105,138:1106,135:$V14,136:$V24}),o($VE2,$VF2,{139:364,141:365,142:366,143:367,188:369,133:1107,117:$V55,130:$V55,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($VE2,$VF2,{139:364,141:365,142:366,143:367,188:369,133:1108,117:$V65,130:$V65,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($V74,$V75),o($V74,$V85),o($V74,$V95),o($V74,$Va5),{19:$Vb5,21:$Vc5,22:1110,124:1109,209:$Vd5,224:1113,225:$Ve5},o($VE2,$VF2,{143:367,121:1116,125:1117,126:1118,127:1119,131:1120,132:1121,133:1122,139:1123,141:1124,142:1125,188:1127,144:$VH2,186:$Vf5,197:$VJ2,198:$VK2,199:$Vg5}),o($V34,[2,172]),o($V34,[2,177],{157:[1,1129]}),o($V34,[2,179],{156:[1,1130]}),o($Vh5,$Vi5,{187:1131,191:1132,192:$Vj5}),{144:[1,1135],188:1134,197:[1,1136],198:[1,1137]},o($Vh5,[2,229]),o($Vh5,[2,230]),o($Vh5,[2,231]),o($Vh5,[2,232]),o($V74,$Vk5),o($V74,$Vl5),o($V74,$Vm5),o($V74,$Vq),o($V74,$Vr),o($V74,$Vs),o($V74,$Vt),o($V74,$Vu),o($VE2,[2,162],{27:$Vn5,194:$Vn5,195:$Vn5,196:$Vn5}),o($Vo5,$Vl5),o($Vo5,$Vm5),o($Vo5,$Vq),o($Vo5,$Vr),o($Vo5,$Vs),o($Vo5,$Vt),o($Vo5,$Vu),{144:[1,1138]},{144:[1,1139]},o($Vi4,[2,140]),o($VD1,[2,187]),o($VD1,[2,194],{167:1140,176:$Vp5}),o($VD1,[2,195],{169:1142,176:$Vq5}),o($VD1,[2,196],{171:1144,176:$Vr5}),o($Vs5,[2,188]),o($Vs5,[2,190]),o($Vs5,[2,192]),{19:$Vt5,21:$Vu5,22:1146,96:$Vv5,104:$Vw5,105:$Vx5,106:1157,178:1147,182:$Vy5,206:1151,207:1152,208:1153,211:1156,214:$Vz5,215:$VA5,216:$VB5,217:$VC5,218:$VD5,219:$VE5,220:$VF5,221:$VG5,222:$VH5,223:$VI5,224:1150,225:$VJ5},o($VD1,[2,197]),o($VD1,[2,202]),o($Vs5,[2,198],{173:1171}),o($VD1,[2,206]),o($VD1,[2,211]),o($Vs5,[2,207],{180:1172}),o($VD1,[2,213]),o($VD1,[2,219]),o($Vs5,[2,215],{185:1173}),o($VD1,[2,214]),o($Vn4,$VK5),o($Vn4,$VL5),{19:$VQ2,21:$VR2,22:1175,83:1174,224:393,225:$V63},o($VF1,$VM5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Va1,$Vu3),o($Vx,$Vg,{50:1176,36:1177,39:$Vy}),o($Va1,$Vv3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:1178}),o($Va1,$V11),o($Va1,$V21),{19:[1,1182],21:[1,1186],22:1180,32:1179,210:1181,224:1183,225:[1,1185],226:[1,1184]},{115:[1,1187],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vw3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:1188}),o($Vl2,$Vr1,{89:1189}),o($Vo1,$Vs1,{95:727,91:1190,97:$VD4,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,1191]},o($Vl2,$VH1),{66:[1,1192]},o($Vs2,$Vt2,{79:1193,80:1194,202:1195,200:[1,1196]}),o($Vu2,$Vt2,{79:1197,80:1198,202:1199,200:$VN5}),o($Vm1,$Vx2,{95:444,91:1201,97:$Vm3,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:1202,91:1203,87:1204,95:1205,101:1207,103:1208,97:$VO5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:1202,91:1203,87:1204,95:1205,101:1207,103:1208,97:$VO5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:1202,91:1203,87:1204,95:1205,101:1207,103:1208,97:$VO5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:1209,80:1210,202:1211,200:[1,1212]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VQ2,21:$VR2,22:388,67:$VS2,77:$VT2,96:$VU2,104:$VV2,105:$VW2,106:400,160:[1,1213],161:383,162:384,163:385,164:386,178:389,182:$VX2,206:394,207:395,208:396,211:399,214:$VY2,215:$VZ2,216:$V_2,217:$V$2,218:$V03,219:$V13,220:$V23,221:$V33,222:$V43,223:$V53,224:393,225:$V63},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:1214,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($Vq1,$V73),o($VF1,$V83),o($VF1,$V93),o($VF1,$Va3),o($VF1,$Vb3),{107:[1,1215]},o($VF1,$Vg3),o($Va1,$Vv3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:1216}),o($Va1,$V11),o($Va1,$V21),{19:[1,1220],21:[1,1224],22:1218,32:1217,210:1219,224:1221,225:[1,1223],226:[1,1222]},{115:[1,1225],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vw3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:1226}),o($Vl2,$Vr1,{89:1227}),o($Vo1,$Vs1,{95:774,91:1228,97:$VE4,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,1229]},o($Vl2,$VH1),{66:[1,1230]},o($Vs2,$Vt2,{79:1231,80:1232,202:1233,200:[1,1234]}),o($Vu2,$Vt2,{79:1235,80:1236,202:1237,200:$VP5}),o($Vm1,$Vx2,{95:480,91:1239,97:$Vo3,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:1240,91:1241,87:1242,95:1243,101:1245,103:1246,97:$VQ5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:1240,91:1241,87:1242,95:1243,101:1245,103:1246,97:$VQ5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:1240,91:1241,87:1242,95:1243,101:1245,103:1246,97:$VQ5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:1247,80:1248,202:1249,200:[1,1250]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VQ2,21:$VR2,22:388,67:$VS2,77:$VT2,96:$VU2,104:$VV2,105:$VW2,106:400,160:[1,1251],161:383,162:384,163:385,164:386,178:389,182:$VX2,206:394,207:395,208:396,211:399,214:$VY2,215:$VZ2,216:$V_2,217:$V$2,218:$V03,219:$V13,220:$V23,221:$V33,222:$V43,223:$V53,224:393,225:$V63},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:1252,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($Vq1,$V73),o($VF1,$V83),o($VF1,$V93),o($VF1,$Va3),o($VF1,$Vb3),{107:[1,1253]},o($VF1,$Vg3),o($V81,$Vt3),o($Va1,$Vu3),o($Va1,$Vv3),o($Va1,$Vw3),{66:[1,1254]},o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),o($Vu2,$Vt2,{80:828,202:829,79:1255,200:$VF4}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:1256,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($Vu2,$Vt2,{80:828,202:829,79:1257,200:$VF4}),o($Vo1,$Vx2,{95:518,91:1258,97:$Vs3,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V73),o($Va1,$Vx3),o($VH3,$VI3),o($Vm1,$VJ3),o($VH3,$VK3,{31:1259,203:[1,1260]}),{19:$VL3,21:$VM3,22:619,124:1261,209:$VN3,224:622,225:$VO3},o($Va1,$VP3),o($Vo1,$VJ3),o($Va1,$VK3,{31:1262,203:[1,1263]}),{19:$VL3,21:$VM3,22:619,124:1264,209:$VN3,224:622,225:$VO3},o($Vc2,$VQ3),o($Vp1,$VJ3),o($Vc2,$VK3,{31:1265,203:[1,1266]}),{19:$VL3,21:$VM3,22:619,124:1267,209:$VN3,224:622,225:$VO3},o($Vq1,$VR3),o($Vt1,$VS3),o($Vt1,$VT3),o($Vt1,$VU3),{96:[1,1268]},o($Vt1,$VH1),{96:[1,1270],102:1269,104:[1,1271],105:[1,1272],106:1273,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,1274]},{117:[1,1275]},o($Vt1,$Vl4),{19:[1,1278],21:[1,1281],22:1277,83:1276,224:1279,225:[1,1280]},o($V81,$V82,{48:1282,49:[1,1283]}),o($Va1,$V92),o($Va1,$Vd1,{61:1284,63:1285,68:1286,40:1287,74:1288,114:1292,75:[1,1289],76:[1,1290],77:[1,1291],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:1293,60:1294,69:1295,88:1296,90:1297,91:1301,95:1302,92:[1,1298],93:[1,1299],94:[1,1300],97:$VR5,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1304,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:1305}),o($Vo1,$Vn1,{78:1306}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:1307}),o($Vm1,$Vs1,{95:875,91:1308,97:$VH4,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:1309}),o($Vt1,$Vu1,{82:1310}),o($Vt1,$Vu1,{82:1311}),o($Vo1,$Vv1,{101:879,103:880,87:1312,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:1313}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,1317],21:[1,1321],22:1315,32:1314,210:1316,224:1318,225:[1,1320],226:[1,1319]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{159:1322}),o($VF1,$VG1),{115:[1,1323],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,1324]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,1326],102:1325,104:[1,1327],105:[1,1328],106:1329,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,1330]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$V92),o($Va1,$Vd1,{61:1331,63:1332,68:1333,40:1334,74:1335,114:1339,75:[1,1336],76:[1,1337],77:[1,1338],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:1340,60:1341,69:1342,88:1343,90:1344,91:1348,95:1349,92:[1,1345],93:[1,1346],94:[1,1347],97:$VS5,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1351,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:1352}),o($Vo1,$Vn1,{78:1353}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:1354}),o($Vm1,$Vs1,{95:911,91:1355,97:$VI4,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:1356}),o($Vt1,$Vu1,{82:1357}),o($Vt1,$Vu1,{82:1358}),o($Vo1,$Vv1,{101:915,103:916,87:1359,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:1360}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,1364],21:[1,1368],22:1362,32:1361,210:1363,224:1365,225:[1,1367],226:[1,1366]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{159:1369}),o($VF1,$VG1),{115:[1,1370],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,1371]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,1373],102:1372,104:[1,1374],105:[1,1375],106:1376,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,1377]},o($Vt1,$Vt),o($Vt1,$Vu),o($Vo1,$V15),o($VM4,$Vt2,{80:932,202:933,79:1378,200:$VN4}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:1379,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($VM4,$Vt2,{80:932,202:933,79:1380,200:$VN4}),o($VB3,$Vx2,{95:578,91:1381,97:$Vz3,98:$VL,99:$VM,100:$VN}),o($VK4,$Vy2),o($VK4,$V73),o($Vy3,$Vx3),o($VT5,$VI3),o($VA3,$VJ3),o($VT5,$VK3,{31:1382,203:[1,1383]}),{19:$VL3,21:$VM3,22:619,124:1384,209:$VN3,224:622,225:$VO3},o($Vy3,$VP3),o($VB3,$VJ3),o($Vy3,$VK3,{31:1385,203:[1,1386]}),{19:$VL3,21:$VM3,22:619,124:1387,209:$VN3,224:622,225:$VO3},o($VU5,$VQ3),o($VC3,$VJ3),o($VU5,$VK3,{31:1388,203:[1,1389]}),{19:$VL3,21:$VM3,22:619,124:1390,209:$VN3,224:622,225:$VO3},o($VD3,$VR3),o($VE3,$VS3),o($VE3,$VT3),o($VE3,$VU3),{96:[1,1391]},o($VE3,$VH1),{96:[1,1393],102:1392,104:[1,1394],105:[1,1395],106:1396,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,1397]},{117:[1,1398]},o($VE3,$Vl4),{19:[1,1401],21:[1,1404],22:1400,83:1399,224:1402,225:[1,1403]},o($VG3,$Vt3),o($VG3,$V82,{48:1405,49:[1,1406]}),o($Vy3,$V92),o($Vy3,$Vd1,{61:1407,63:1408,68:1409,40:1410,74:1411,114:1415,75:[1,1412],76:[1,1413],77:[1,1414],115:$VD,120:$VD,122:$VD}),o($Vy3,$Va2),o($Vy3,$Vf1,{64:1416,60:1417,69:1418,88:1419,90:1420,91:1424,95:1425,92:[1,1421],93:[1,1422],94:[1,1423],97:$VV5,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1427,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vy3,$Vb2),o($VA3,$Vn1,{78:1428}),o($VB3,$Vn1,{78:1429}),o($VU5,$Vd2),o($VU5,$Ve2),o($VD3,$Vr1,{89:1430}),o($VA3,$Vs1,{95:980,91:1431,97:$VQ4,98:$VL,99:$VM,100:$VN}),o($VE3,$Vu1,{82:1432}),o($VE3,$Vu1,{82:1433}),o($VE3,$Vu1,{82:1434}),o($VB3,$Vv1,{101:984,103:985,87:1435,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VC3,$Vn1,{78:1436}),o($VU5,$V11),o($VU5,$V21),{19:[1,1440],21:[1,1444],22:1438,32:1437,210:1439,224:1441,225:[1,1443],226:[1,1442]},o($VD3,$Vy1),o($VD3,$Vz1),o($VD3,$VA1),o($VD3,$VB1),o($VE3,$VC1),o($VD1,$VE1,{159:1445}),o($VF3,$VG1),{115:[1,1446],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,1447]},o($VD3,$VH1),o($VE3,$Vq),o($VE3,$Vr),{96:[1,1449],102:1448,104:[1,1450],105:[1,1451],106:1452,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,1453]},o($VE3,$Vt),o($VE3,$Vu),o($Vy3,$V92),o($Vy3,$Vd1,{61:1454,63:1455,68:1456,40:1457,74:1458,114:1462,75:[1,1459],76:[1,1460],77:[1,1461],115:$VD,120:$VD,122:$VD}),o($Vy3,$Va2),o($Vy3,$Vf1,{64:1463,60:1464,69:1465,88:1466,90:1467,91:1471,95:1472,92:[1,1468],93:[1,1469],94:[1,1470],97:$VW5,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1474,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vy3,$Vb2),o($VA3,$Vn1,{78:1475}),o($VB3,$Vn1,{78:1476}),o($VU5,$Vd2),o($VU5,$Ve2),o($VD3,$Vr1,{89:1477}),o($VA3,$Vs1,{95:1016,91:1478,97:$VR4,98:$VL,99:$VM,100:$VN}),o($VE3,$Vu1,{82:1479}),o($VE3,$Vu1,{82:1480}),o($VE3,$Vu1,{82:1481}),o($VB3,$Vv1,{101:1020,103:1021,87:1482,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VC3,$Vn1,{78:1483}),o($VU5,$V11),o($VU5,$V21),{19:[1,1487],21:[1,1491],22:1485,32:1484,210:1486,224:1488,225:[1,1490],226:[1,1489]},o($VD3,$Vy1),o($VD3,$Vz1),o($VD3,$VA1),o($VD3,$VB1),o($VE3,$VC1),o($VD1,$VE1,{159:1492}),o($VF3,$VG1),{115:[1,1493],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,1494]},o($VD3,$VH1),o($VE3,$Vq),o($VE3,$Vr),{96:[1,1496],102:1495,104:[1,1497],105:[1,1498],106:1499,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,1500]},o($VE3,$Vt),o($VE3,$Vu),{203:[1,1503],204:1501,205:[1,1502]},o($Vm1,$VX5),o($Vm1,$VY5),o($Vm1,$VZ5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vo4),o($Vm1,$Vp4),o($Vm1,$Vq4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vr4),o($Vm1,$Vs4,{212:1504,213:1505,107:[1,1506]}),o($Vm1,$Vt4),o($Vm1,$Vu4),o($Vm1,$Vv4),o($Vm1,$Vw4),o($Vm1,$Vx4),o($Vm1,$Vy4),o($Vm1,$Vz4),o($Vm1,$VA4),o($Vm1,$VB4),o($V_5,$Vc3),o($V_5,$Vd3),o($V_5,$Ve3),o($V_5,$Vf3),{203:[1,1509],204:1507,205:[1,1508]},o($Vo1,$VX5),o($Vo1,$VY5),o($Vo1,$VZ5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vo4),o($Vo1,$Vp4),o($Vo1,$Vq4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vr4),o($Vo1,$Vs4,{212:1510,213:1511,107:[1,1512]}),o($Vo1,$Vt4),o($Vo1,$Vu4),o($Vo1,$Vv4),o($Vo1,$Vw4),o($Vo1,$Vx4),o($Vo1,$Vy4),o($Vo1,$Vz4),o($Vo1,$VA4),o($Vo1,$VB4),o($V$5,$Vc3),o($V$5,$Vd3),o($V$5,$Ve3),o($V$5,$Vf3),{203:[1,1515],204:1513,205:[1,1514]},o($Vp1,$VX5),o($Vp1,$VY5),o($Vp1,$VZ5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vo4),o($Vp1,$Vp4),o($Vp1,$Vq4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vr4),o($Vp1,$Vs4,{212:1516,213:1517,107:[1,1518]}),o($Vp1,$Vt4),o($Vp1,$Vu4),o($Vp1,$Vv4),o($Vp1,$Vw4),o($Vp1,$Vx4),o($Vp1,$Vy4),o($Vp1,$Vz4),o($Vp1,$VA4),o($Vp1,$VB4),o($V06,$Vc3),o($V06,$Vd3),o($V06,$Ve3),o($V06,$Vf3),{19:[1,1521],21:[1,1524],22:1520,83:1519,224:1522,225:[1,1523]},o($VZ3,$V16),o($VZ3,$V26),o($VZ3,$V36),o($V74,$V46),o($V74,$V56),o($V74,$V66),o($Vx,$Vg,{42:1525,43:1526,51:1527,55:1528,36:1529,39:$Vy}),o($V76,$Vj4),o($V76,$Vk4),o($V76,$Vq),o($V76,$Vr),o($V76,$Vt),o($V76,$Vu),{66:[1,1530]},{66:$VV3},{66:$VW3,128:1531,129:1532,130:$V86},{66:$VY3},o($V96,$V_3),o($V96,$V$3),o($V96,$V04,{134:1534,137:1535,138:1538,135:$Va6,136:$Vb6}),o($V34,$V44,{151:652,140:1539,146:1540,147:1541,150:1542,65:[1,1543],156:$V54,157:$V64}),o($Vc6,$V84),o($Vc6,$V94),{65:[1,1544]},{27:$Va4,190:1545,194:$Vb4,195:$Vc4,196:$Vd4},{19:$Vd6,21:$Ve6,22:1547,145:1546,210:1548,224:1550,225:$Vf6,226:$Vg6},o($V34,[2,178]),o($V34,[2,180]),{144:$Vh6,188:1554,197:$Vi6,198:$Vj6},o($Vh5,[2,225]),{135:[1,1558]},o($V74,$Vk6),{19:$Ve4,21:$Vf4,22:662,145:1559,210:663,224:665,225:$Vg4,226:$Vh4},{65:[1,1560]},{65:[1,1561]},{19:$Vl6,21:$Vm6,22:1563,145:1562,210:1564,224:1566,225:$Vn6,226:$Vo6},{19:$Vl6,21:$Vm6,22:1563,145:1570,210:1564,224:1566,225:$Vn6,226:$Vo6},o($Vs5,[2,189]),{19:$Vt5,21:$Vu5,22:1146,224:1150,225:$VJ5},o($Vs5,[2,191]),{96:$Vv5,104:$Vw5,105:$Vx5,106:1157,178:1147,206:1151,207:1152,208:1153,211:1156,214:$Vz5,215:$VA5,216:$VB5,217:$VC5,218:$VD5,219:$VE5,220:$VF5,221:$VG5,222:$VH5,223:$VI5},o($Vs5,[2,193]),{182:$Vy5},o($Vs5,$Vp6,{177:1571,175:$Vq6}),o($Vs5,$Vp6,{177:1573,175:$Vq6}),o($Vs5,$Vp6,{177:1574,175:$Vq6}),o($Vr6,$Vq),o($Vr6,$Vr),o($Vr6,$Vo4),o($Vr6,$Vp4),o($Vr6,$Vq4),o($Vr6,$Vt),o($Vr6,$Vu),o($Vr6,$Vr4),o($Vr6,$Vs4,{212:1575,213:1576,107:[1,1577]}),o($Vr6,$Vt4),o($Vr6,$Vu4),o($Vr6,$Vv4),o($Vr6,$Vw4),o($Vr6,$Vx4),o($Vr6,$Vy4),o($Vr6,$Vz4),o($Vr6,$VA4),o($Vr6,$VB4),o($Vs6,$Vc3),o($Vs6,$Vd3),o($Vs6,$Ve3),o($Vs6,$Vf3),o($VD1,[2,200],{167:1578,176:$Vp5}),o($VD1,[2,209],{169:1579,176:$Vq5}),o($VD1,[2,217],{171:1580,176:$Vr5}),o($Vn4,$Vt6),o($Vn4,$VC1),o($Va1,$Vn3),o($VC,$VD,{58:1581,60:1582,62:1583,63:1584,69:1587,71:1588,68:1589,40:1590,88:1591,90:1592,83:1594,84:1595,85:1596,74:1597,91:1604,22:1605,87:1607,114:1608,95:1609,224:1612,101:1613,103:1614,19:[1,1611],21:[1,1616],65:[1,1585],67:[1,1586],75:[1,1598],76:[1,1599],77:[1,1600],81:[1,1593],92:[1,1601],93:[1,1602],94:[1,1603],97:$Vu6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,158:[1,1606],225:[1,1615]}),o($Vu2,$Vt2,{80:1198,202:1199,79:1617,200:$VN5}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:1618,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($Vu2,$Vt2,{80:1198,202:1199,79:1619,200:$VN5}),o($Vo1,$Vx2,{95:727,91:1620,97:$VD4,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V73),o($Va1,$VJ4),o($VH3,$VI3),o($Vm1,$VJ3),o($VH3,$VK3,{31:1621,203:[1,1622]}),{19:$VL3,21:$VM3,22:619,124:1623,209:$VN3,224:622,225:$VO3},o($Va1,$VP3),o($Vo1,$VJ3),o($Va1,$VK3,{31:1624,203:[1,1625]}),{19:$VL3,21:$VM3,22:619,124:1626,209:$VN3,224:622,225:$VO3},o($Vq1,$VR3),o($Vt1,$VS3),o($Vt1,$VT3),o($Vt1,$VU3),{96:[1,1627]},o($Vt1,$VH1),{96:[1,1629],102:1628,104:[1,1630],105:[1,1631],106:1632,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,1633]},o($Vc2,$VQ3),o($Vp1,$VJ3),o($Vc2,$VK3,{31:1634,203:[1,1635]}),{19:$VL3,21:$VM3,22:619,124:1636,209:$VN3,224:622,225:$VO3},o($Vt1,$Vl4),{117:[1,1637]},{19:[1,1640],21:[1,1643],22:1639,83:1638,224:1641,225:[1,1642]},o($Vu2,$Vt2,{80:1236,202:1237,79:1644,200:$VP5}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:1645,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($Vu2,$Vt2,{80:1236,202:1237,79:1646,200:$VP5}),o($Vo1,$Vx2,{95:774,91:1647,97:$VE4,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V73),o($Va1,$VJ4),o($VH3,$VI3),o($Vm1,$VJ3),o($VH3,$VK3,{31:1648,203:[1,1649]}),{19:$VL3,21:$VM3,22:619,124:1650,209:$VN3,224:622,225:$VO3},o($Va1,$VP3),o($Vo1,$VJ3),o($Va1,$VK3,{31:1651,203:[1,1652]}),{19:$VL3,21:$VM3,22:619,124:1653,209:$VN3,224:622,225:$VO3},o($Vq1,$VR3),o($Vt1,$VS3),o($Vt1,$VT3),o($Vt1,$VU3),{96:[1,1654]},o($Vt1,$VH1),{96:[1,1656],102:1655,104:[1,1657],105:[1,1658],106:1659,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,1660]},o($Vc2,$VQ3),o($Vp1,$VJ3),o($Vc2,$VK3,{31:1661,203:[1,1662]}),{19:$VL3,21:$VM3,22:619,124:1663,209:$VN3,224:622,225:$VO3},o($Vt1,$Vl4),{117:[1,1664]},{19:[1,1667],21:[1,1670],22:1666,83:1665,224:1668,225:[1,1669]},o($Va1,$VJ4),o($Va1,$VQ3),{117:[1,1671]},o($Va1,$VI3),o($Vl2,$VR3),o($Vs2,$VS4),{19:$Vn,21:$Vo,22:1672,224:52,225:$Vp},{19:$Vv6,21:$Vw6,22:1674,96:[1,1685],104:[1,1686],105:[1,1687],106:1684,178:1675,201:1673,206:1678,207:1679,208:1680,211:1683,214:[1,1688],215:[1,1689],216:[1,1694],217:[1,1695],218:[1,1696],219:[1,1697],220:[1,1690],221:[1,1691],222:[1,1692],223:[1,1693],224:1677,225:$Vx6},o($Vu2,$VS4),{19:$Vn,21:$Vo,22:1698,224:52,225:$Vp},{19:$Vy6,21:$Vz6,22:1700,96:[1,1711],104:[1,1712],105:[1,1713],106:1710,178:1701,201:1699,206:1704,207:1705,208:1706,211:1709,214:[1,1714],215:[1,1715],216:[1,1720],217:[1,1721],218:[1,1722],219:[1,1723],220:[1,1716],221:[1,1717],222:[1,1718],223:[1,1719],224:1703,225:$VA6},o($Vw2,$VS4),{19:$Vn,21:$Vo,22:1724,224:52,225:$Vp},{19:$VB6,21:$VC6,22:1726,96:[1,1737],104:[1,1738],105:[1,1739],106:1736,178:1727,201:1725,206:1730,207:1731,208:1732,211:1735,214:[1,1740],215:[1,1741],216:[1,1746],217:[1,1747],218:[1,1748],219:[1,1749],220:[1,1742],221:[1,1743],222:[1,1744],223:[1,1745],224:1729,225:$VD6},o($Vt1,$V73),o($Vt1,$V83),o($Vt1,$V93),o($Vt1,$Va3),o($Vt1,$Vb3),{107:[1,1750]},o($Vt1,$Vg3),o($Vp1,$V15),o($VF1,$VM5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Va1,$Vu3),o($Vx,$Vg,{50:1751,36:1752,39:$Vy}),o($Va1,$Vv3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:1753}),o($Va1,$V11),o($Va1,$V21),{19:[1,1757],21:[1,1761],22:1755,32:1754,210:1756,224:1758,225:[1,1760],226:[1,1759]},{115:[1,1762],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vw3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:1763}),o($Vl2,$Vr1,{89:1764}),o($Vo1,$Vs1,{95:1302,91:1765,97:$VR5,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,1766]},o($Vl2,$VH1),{66:[1,1767]},o($Vs2,$Vt2,{79:1768,80:1769,202:1770,200:[1,1771]}),o($Vu2,$Vt2,{79:1772,80:1773,202:1774,200:$VE6}),o($Vm1,$Vx2,{95:875,91:1776,97:$VH4,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:1777,91:1778,87:1779,95:1780,101:1782,103:1783,97:$VF6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:1777,91:1778,87:1779,95:1780,101:1782,103:1783,97:$VF6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:1777,91:1778,87:1779,95:1780,101:1782,103:1783,97:$VF6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:1784,80:1785,202:1786,200:[1,1787]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VQ2,21:$VR2,22:388,67:$VS2,77:$VT2,96:$VU2,104:$VV2,105:$VW2,106:400,160:[1,1788],161:383,162:384,163:385,164:386,178:389,182:$VX2,206:394,207:395,208:396,211:399,214:$VY2,215:$VZ2,216:$V_2,217:$V$2,218:$V03,219:$V13,220:$V23,221:$V33,222:$V43,223:$V53,224:393,225:$V63},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:1789,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($Vq1,$V73),o($VF1,$V83),o($VF1,$V93),o($VF1,$Va3),o($VF1,$Vb3),{107:[1,1790]},o($VF1,$Vg3),o($Va1,$Vv3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:1791}),o($Va1,$V11),o($Va1,$V21),{19:[1,1795],21:[1,1799],22:1793,32:1792,210:1794,224:1796,225:[1,1798],226:[1,1797]},{115:[1,1800],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vw3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:1801}),o($Vl2,$Vr1,{89:1802}),o($Vo1,$Vs1,{95:1349,91:1803,97:$VS5,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,1804]},o($Vl2,$VH1),{66:[1,1805]},o($Vs2,$Vt2,{79:1806,80:1807,202:1808,200:[1,1809]}),o($Vu2,$Vt2,{79:1810,80:1811,202:1812,200:$VG6}),o($Vm1,$Vx2,{95:911,91:1814,97:$VI4,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:1815,91:1816,87:1817,95:1818,101:1820,103:1821,97:$VH6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:1815,91:1816,87:1817,95:1818,101:1820,103:1821,97:$VH6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:1815,91:1816,87:1817,95:1818,101:1820,103:1821,97:$VH6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:1822,80:1823,202:1824,200:[1,1825]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VQ2,21:$VR2,22:388,67:$VS2,77:$VT2,96:$VU2,104:$VV2,105:$VW2,106:400,160:[1,1826],161:383,162:384,163:385,164:386,178:389,182:$VX2,206:394,207:395,208:396,211:399,214:$VY2,215:$VZ2,216:$V_2,217:$V$2,218:$V03,219:$V13,220:$V23,221:$V33,222:$V43,223:$V53,224:393,225:$V63},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:1827,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($Vq1,$V73),o($VF1,$V83),o($VF1,$V93),o($VF1,$Va3),o($VF1,$Vb3),{107:[1,1828]},o($VF1,$Vg3),o($Vy3,$VQ3),{117:[1,1829]},o($Vy3,$VI3),o($VK4,$VR3),o($VL4,$VS4),{19:$Vn,21:$Vo,22:1830,224:52,225:$Vp},{19:$VI6,21:$VJ6,22:1832,96:[1,1843],104:[1,1844],105:[1,1845],106:1842,178:1833,201:1831,206:1836,207:1837,208:1838,211:1841,214:[1,1846],215:[1,1847],216:[1,1852],217:[1,1853],218:[1,1854],219:[1,1855],220:[1,1848],221:[1,1849],222:[1,1850],223:[1,1851],224:1835,225:$VK6},o($VM4,$VS4),{19:$Vn,21:$Vo,22:1856,224:52,225:$Vp},{19:$VL6,21:$VM6,22:1858,96:[1,1869],104:[1,1870],105:[1,1871],106:1868,178:1859,201:1857,206:1862,207:1863,208:1864,211:1867,214:[1,1872],215:[1,1873],216:[1,1878],217:[1,1879],218:[1,1880],219:[1,1881],220:[1,1874],221:[1,1875],222:[1,1876],223:[1,1877],224:1861,225:$VN6},o($VO4,$VS4),{19:$Vn,21:$Vo,22:1882,224:52,225:$Vp},{19:$VO6,21:$VP6,22:1884,96:[1,1895],104:[1,1896],105:[1,1897],106:1894,178:1885,201:1883,206:1888,207:1889,208:1890,211:1893,214:[1,1898],215:[1,1899],216:[1,1904],217:[1,1905],218:[1,1906],219:[1,1907],220:[1,1900],221:[1,1901],222:[1,1902],223:[1,1903],224:1887,225:$VQ6},o($VE3,$V73),o($VE3,$V83),o($VE3,$V93),o($VE3,$Va3),o($VE3,$Vb3),{107:[1,1908]},o($VE3,$Vg3),o($VC3,$V15),o($VF3,$VM5),o($VF3,$VC1),o($VF3,$Vq),o($VF3,$Vr),o($VF3,$Vt),o($VF3,$Vu),o($Vy3,$Vu3),o($Vx,$Vg,{50:1909,36:1910,39:$Vy}),o($Vy3,$Vv3),o($Vy3,$Vi2),o($Vy3,$Vd2),o($Vy3,$Ve2),o($VB3,$Vn1,{78:1911}),o($Vy3,$V11),o($Vy3,$V21),{19:[1,1915],21:[1,1919],22:1913,32:1912,210:1914,224:1916,225:[1,1918],226:[1,1917]},{115:[1,1920],118:195,119:196,120:$Vw1,122:$Vx1},o($Vy3,$Vw3),o($Vy3,$Vk2),o($VB3,$Vn1,{78:1921}),o($VK4,$Vr1,{89:1922}),o($VB3,$Vs1,{95:1425,91:1923,97:$VV5,98:$VL,99:$VM,100:$VN}),o($VK4,$Vy1),o($VK4,$Vz1),o($VK4,$VA1),o($VK4,$VB1),{96:[1,1924]},o($VK4,$VH1),{66:[1,1925]},o($VL4,$Vt2,{79:1926,80:1927,202:1928,200:[1,1929]}),o($VM4,$Vt2,{79:1930,80:1931,202:1932,200:$VR6}),o($VA3,$Vx2,{95:980,91:1934,97:$VQ4,98:$VL,99:$VM,100:$VN}),o($VD3,$Vy2),o($VB3,$Vz2,{86:1935,91:1936,87:1937,95:1938,101:1940,103:1941,97:$VS6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB3,$VB2,{86:1935,91:1936,87:1937,95:1938,101:1940,103:1941,97:$VS6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB3,$VC2,{86:1935,91:1936,87:1937,95:1938,101:1940,103:1941,97:$VS6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF3,$VD2),o($VO4,$Vt2,{79:1942,80:1943,202:1944,200:[1,1945]}),o($VU5,$VR1),o($VU5,$Vl),o($VU5,$Vm),o($VU5,$Vq),o($VU5,$Vr),o($VU5,$Vs),o($VU5,$Vt),o($VU5,$Vu),{19:$VQ2,21:$VR2,22:388,67:$VS2,77:$VT2,96:$VU2,104:$VV2,105:$VW2,106:400,160:[1,1946],161:383,162:384,163:385,164:386,178:389,182:$VX2,206:394,207:395,208:396,211:399,214:$VY2,215:$VZ2,216:$V_2,217:$V$2,218:$V03,219:$V13,220:$V23,221:$V33,222:$V43,223:$V53,224:393,225:$V63},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:1947,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($VD3,$V73),o($VF3,$V83),o($VF3,$V93),o($VF3,$Va3),o($VF3,$Vb3),{107:[1,1948]},o($VF3,$Vg3),o($Vy3,$Vv3),o($Vy3,$Vi2),o($Vy3,$Vd2),o($Vy3,$Ve2),o($VB3,$Vn1,{78:1949}),o($Vy3,$V11),o($Vy3,$V21),{19:[1,1953],21:[1,1957],22:1951,32:1950,210:1952,224:1954,225:[1,1956],226:[1,1955]},{115:[1,1958],118:195,119:196,120:$Vw1,122:$Vx1},o($Vy3,$Vw3),o($Vy3,$Vk2),o($VB3,$Vn1,{78:1959}),o($VK4,$Vr1,{89:1960}),o($VB3,$Vs1,{95:1472,91:1961,97:$VW5,98:$VL,99:$VM,100:$VN}),o($VK4,$Vy1),o($VK4,$Vz1),o($VK4,$VA1),o($VK4,$VB1),{96:[1,1962]},o($VK4,$VH1),{66:[1,1963]},o($VL4,$Vt2,{79:1964,80:1965,202:1966,200:[1,1967]}),o($VM4,$Vt2,{79:1968,80:1969,202:1970,200:$VT6}),o($VA3,$Vx2,{95:1016,91:1972,97:$VR4,98:$VL,99:$VM,100:$VN}),o($VD3,$Vy2),o($VB3,$Vz2,{86:1973,91:1974,87:1975,95:1976,101:1978,103:1979,97:$VU6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB3,$VB2,{86:1973,91:1974,87:1975,95:1976,101:1978,103:1979,97:$VU6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB3,$VC2,{86:1973,91:1974,87:1975,95:1976,101:1978,103:1979,97:$VU6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF3,$VD2),o($VO4,$Vt2,{79:1980,80:1981,202:1982,200:[1,1983]}),o($VU5,$VR1),o($VU5,$Vl),o($VU5,$Vm),o($VU5,$Vq),o($VU5,$Vr),o($VU5,$Vs),o($VU5,$Vt),o($VU5,$Vu),{19:$VQ2,21:$VR2,22:388,67:$VS2,77:$VT2,96:$VU2,104:$VV2,105:$VW2,106:400,160:[1,1984],161:383,162:384,163:385,164:386,178:389,182:$VX2,206:394,207:395,208:396,211:399,214:$VY2,215:$VZ2,216:$V_2,217:$V$2,218:$V03,219:$V13,220:$V23,221:$V33,222:$V43,223:$V53,224:393,225:$V63},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:1985,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($VD3,$V73),o($VF3,$V83),o($VF3,$V93),o($VF3,$Va3),o($VF3,$Vb3),{107:[1,1986]},o($VF3,$Vg3),o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$VK5),o($Vm1,$VL5),{19:$VT4,21:$VU4,22:1988,83:1987,224:1029,225:$VV4},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$VK5),o($Vo1,$VL5),{19:$VX4,21:$VY4,22:1990,83:1989,224:1055,225:$VZ4},o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$VK5),o($Vp1,$VL5),{19:$V_4,21:$V$4,22:1992,83:1991,224:1081,225:$V05},o($Vt1,$VM5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($VV6,$VW6,{148:1993,149:1994,152:$VX6,153:$VY6,154:$VZ6,155:$V_6}),o($V$6,$V07),o($V17,$V27,{52:1999}),o($V37,$V47,{56:2000}),o($VC,$VD,{59:2001,69:2002,71:2003,72:2004,88:2007,90:2008,83:2010,84:2011,85:2012,74:2013,40:2014,91:2018,22:2019,87:2021,114:2022,95:2026,224:2029,101:2030,103:2031,19:[1,2028],21:[1,2033],65:[1,2005],67:[1,2006],75:[1,2023],76:[1,2024],77:[1,2025],81:[1,2009],92:[1,2015],93:[1,2016],94:[1,2017],97:$V57,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,158:[1,2020],225:[1,2032]}),o($VV6,$VW6,{149:1994,148:2034,152:$VX6,153:$VY6,154:$VZ6,155:$V_6}),{66:$V25,129:2035,130:$V86},o($V96,$V35),o($VE2,$VF2,{143:367,131:1120,132:1121,133:1122,139:1123,141:1124,142:1125,188:1127,126:2036,144:$VH2,186:$Vf5,197:$VJ2,198:$VK2,199:$Vg5}),o($V96,$V45),o($V96,$V04,{134:2037,138:2038,135:$Va6,136:$Vb6}),o($VE2,$VF2,{143:367,139:1123,141:1124,142:1125,188:1127,133:2039,66:$V55,130:$V55,144:$VH2,186:$Vf5,197:$VJ2,198:$VK2,199:$Vg5}),o($VE2,$VF2,{143:367,139:1123,141:1124,142:1125,188:1127,133:2040,66:$V65,130:$V65,144:$VH2,186:$Vf5,197:$VJ2,198:$VK2,199:$Vg5}),o($Vc6,$V75),o($Vc6,$V85),o($Vc6,$V95),o($Vc6,$Va5),{19:$Vb5,21:$Vc5,22:1110,124:2041,209:$Vd5,224:1113,225:$Ve5},o($VE2,$VF2,{143:367,125:1117,126:1118,127:1119,131:1120,132:1121,133:1122,139:1123,141:1124,142:1125,188:1127,121:2042,144:$VH2,186:$Vf5,197:$VJ2,198:$VK2,199:$Vg5}),o($Vh5,$Vi5,{191:1132,187:2043,192:$Vj5}),{144:[1,2045],188:2044,197:[1,2046],198:[1,2047]},o($Vc6,$Vk5),o($Vc6,$Vl5),o($Vc6,$Vm5),o($Vc6,$Vq),o($Vc6,$Vr),o($Vc6,$Vs),o($Vc6,$Vt),o($Vc6,$Vu),o($V67,$V77,{189:2048}),{19:[1,2052],21:[1,2056],22:2050,145:2049,210:2051,224:2053,225:[1,2055],226:[1,2054]},{65:[1,2057]},{65:[1,2058]},o($Vh5,[2,223]),o($V74,$Vn5),{144:[1,2059]},{144:[1,2060]},{66:[1,2061]},{66:$Vl5},{66:$Vm5},{66:$Vq},{66:$Vr},{66:$Vs},{66:$Vt},{66:$Vu},{66:[1,2062]},o($Vs5,[2,203]),o($Vs5,[2,205]),o($Vs5,[2,212]),o($Vs5,[2,220]),o($Vr6,$VK5),o($Vr6,$VL5),{19:$Vt5,21:$Vu5,22:2064,83:2063,224:1150,225:$VJ5},o($Vs5,[2,199]),o($Vs5,[2,208]),o($Vs5,[2,216]),o($Va1,$V92),o($Va1,$Vd1,{61:2065,63:2066,68:2067,40:2068,74:2069,114:2073,75:[1,2070],76:[1,2071],77:[1,2072],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:2074,60:2075,69:2076,88:2077,90:2078,91:2082,95:2083,92:[1,2079],93:[1,2080],94:[1,2081],97:$V87,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2085,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:2086}),o($Vo1,$Vn1,{78:2087}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:2088}),o($Vm1,$Vs1,{95:1609,91:2089,97:$Vu6,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:2090}),o($Vt1,$Vu1,{82:2091}),o($Vt1,$Vu1,{82:2092}),o($Vo1,$Vv1,{101:1613,103:1614,87:2093,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:2094}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,2098],21:[1,2102],22:2096,32:2095,210:2097,224:2099,225:[1,2101],226:[1,2100]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{159:2103}),o($VF1,$VG1),{115:[1,2104],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,2105]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,2107],102:2106,104:[1,2108],105:[1,2109],106:2110,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,2111]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$VQ3),{117:[1,2112]},o($Va1,$VI3),o($Vl2,$VR3),o($Vs2,$VS4),{19:$Vn,21:$Vo,22:2113,224:52,225:$Vp},{19:$V97,21:$Va7,22:2115,96:[1,2126],104:[1,2127],105:[1,2128],106:2125,178:2116,201:2114,206:2119,207:2120,208:2121,211:2124,214:[1,2129],215:[1,2130],216:[1,2135],217:[1,2136],218:[1,2137],219:[1,2138],220:[1,2131],221:[1,2132],222:[1,2133],223:[1,2134],224:2118,225:$Vb7},o($Vu2,$VS4),{19:$Vn,21:$Vo,22:2139,224:52,225:$Vp},{19:$Vc7,21:$Vd7,22:2141,96:[1,2152],104:[1,2153],105:[1,2154],106:2151,178:2142,201:2140,206:2145,207:2146,208:2147,211:2150,214:[1,2155],215:[1,2156],216:[1,2161],217:[1,2162],218:[1,2163],219:[1,2164],220:[1,2157],221:[1,2158],222:[1,2159],223:[1,2160],224:2144,225:$Ve7},o($Vt1,$V73),o($Vt1,$V83),o($Vt1,$V93),o($Vt1,$Va3),o($Vt1,$Vb3),{107:[1,2165]},o($Vt1,$Vg3),o($Vw2,$VS4),{19:$Vn,21:$Vo,22:2166,224:52,225:$Vp},{19:$Vf7,21:$Vg7,22:2168,96:[1,2179],104:[1,2180],105:[1,2181],106:2178,178:2169,201:2167,206:2172,207:2173,208:2174,211:2177,214:[1,2182],215:[1,2183],216:[1,2188],217:[1,2189],218:[1,2190],219:[1,2191],220:[1,2184],221:[1,2185],222:[1,2186],223:[1,2187],224:2171,225:$Vh7},o($Vp1,$V15),o($VF1,$VM5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Va1,$VQ3),{117:[1,2192]},o($Va1,$VI3),o($Vl2,$VR3),o($Vs2,$VS4),{19:$Vn,21:$Vo,22:2193,224:52,225:$Vp},{19:$Vi7,21:$Vj7,22:2195,96:[1,2206],104:[1,2207],105:[1,2208],106:2205,178:2196,201:2194,206:2199,207:2200,208:2201,211:2204,214:[1,2209],215:[1,2210],216:[1,2215],217:[1,2216],218:[1,2217],219:[1,2218],220:[1,2211],221:[1,2212],222:[1,2213],223:[1,2214],224:2198,225:$Vk7},o($Vu2,$VS4),{19:$Vn,21:$Vo,22:2219,224:52,225:$Vp},{19:$Vl7,21:$Vm7,22:2221,96:[1,2232],104:[1,2233],105:[1,2234],106:2231,178:2222,201:2220,206:2225,207:2226,208:2227,211:2230,214:[1,2235],215:[1,2236],216:[1,2241],217:[1,2242],218:[1,2243],219:[1,2244],220:[1,2237],221:[1,2238],222:[1,2239],223:[1,2240],224:2224,225:$Vn7},o($Vt1,$V73),o($Vt1,$V83),o($Vt1,$V93),o($Vt1,$Va3),o($Vt1,$Vb3),{107:[1,2245]},o($Vt1,$Vg3),o($Vw2,$VS4),{19:$Vn,21:$Vo,22:2246,224:52,225:$Vp},{19:$Vo7,21:$Vp7,22:2248,96:[1,2259],104:[1,2260],105:[1,2261],106:2258,178:2249,201:2247,206:2252,207:2253,208:2254,211:2257,214:[1,2262],215:[1,2263],216:[1,2268],217:[1,2269],218:[1,2270],219:[1,2271],220:[1,2264],221:[1,2265],222:[1,2266],223:[1,2267],224:2251,225:$Vq7},o($Vp1,$V15),o($VF1,$VM5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Vo1,$V15),{203:[1,2274],204:2272,205:[1,2273]},o($Vm1,$VX5),o($Vm1,$VY5),o($Vm1,$VZ5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vo4),o($Vm1,$Vp4),o($Vm1,$Vq4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vr4),o($Vm1,$Vs4,{212:2275,213:2276,107:[1,2277]}),o($Vm1,$Vt4),o($Vm1,$Vu4),o($Vm1,$Vv4),o($Vm1,$Vw4),o($Vm1,$Vx4),o($Vm1,$Vy4),o($Vm1,$Vz4),o($Vm1,$VA4),o($Vm1,$VB4),o($V_5,$Vc3),o($V_5,$Vd3),o($V_5,$Ve3),o($V_5,$Vf3),{203:[1,2280],204:2278,205:[1,2279]},o($Vo1,$VX5),o($Vo1,$VY5),o($Vo1,$VZ5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vo4),o($Vo1,$Vp4),o($Vo1,$Vq4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vr4),o($Vo1,$Vs4,{212:2281,213:2282,107:[1,2283]}),o($Vo1,$Vt4),o($Vo1,$Vu4),o($Vo1,$Vv4),o($Vo1,$Vw4),o($Vo1,$Vx4),o($Vo1,$Vy4),o($Vo1,$Vz4),o($Vo1,$VA4),o($Vo1,$VB4),o($V$5,$Vc3),o($V$5,$Vd3),o($V$5,$Ve3),o($V$5,$Vf3),{203:[1,2286],204:2284,205:[1,2285]},o($Vp1,$VX5),o($Vp1,$VY5),o($Vp1,$VZ5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vo4),o($Vp1,$Vp4),o($Vp1,$Vq4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vr4),o($Vp1,$Vs4,{212:2287,213:2288,107:[1,2289]}),o($Vp1,$Vt4),o($Vp1,$Vu4),o($Vp1,$Vv4),o($Vp1,$Vw4),o($Vp1,$Vx4),o($Vp1,$Vy4),o($Vp1,$Vz4),o($Vp1,$VA4),o($Vp1,$VB4),o($V06,$Vc3),o($V06,$Vd3),o($V06,$Ve3),o($V06,$Vf3),{19:[1,2292],21:[1,2295],22:2291,83:2290,224:2293,225:[1,2294]},o($Va1,$Vn3),o($VC,$VD,{58:2296,60:2297,62:2298,63:2299,69:2302,71:2303,68:2304,40:2305,88:2306,90:2307,83:2309,84:2310,85:2311,74:2312,91:2319,22:2320,87:2322,114:2323,95:2324,224:2327,101:2328,103:2329,19:[1,2326],21:[1,2331],65:[1,2300],67:[1,2301],75:[1,2313],76:[1,2314],77:[1,2315],81:[1,2308],92:[1,2316],93:[1,2317],94:[1,2318],97:$Vr7,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,158:[1,2321],225:[1,2330]}),o($Vu2,$Vt2,{80:1773,202:1774,79:2332,200:$VE6}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:2333,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($Vu2,$Vt2,{80:1773,202:1774,79:2334,200:$VE6}),o($Vo1,$Vx2,{95:1302,91:2335,97:$VR5,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V73),o($Va1,$VJ4),o($VH3,$VI3),o($Vm1,$VJ3),o($VH3,$VK3,{31:2336,203:[1,2337]}),{19:$VL3,21:$VM3,22:619,124:2338,209:$VN3,224:622,225:$VO3},o($Va1,$VP3),o($Vo1,$VJ3),o($Va1,$VK3,{31:2339,203:[1,2340]}),{19:$VL3,21:$VM3,22:619,124:2341,209:$VN3,224:622,225:$VO3},o($Vq1,$VR3),o($Vt1,$VS3),o($Vt1,$VT3),o($Vt1,$VU3),{96:[1,2342]},o($Vt1,$VH1),{96:[1,2344],102:2343,104:[1,2345],105:[1,2346],106:2347,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,2348]},o($Vc2,$VQ3),o($Vp1,$VJ3),o($Vc2,$VK3,{31:2349,203:[1,2350]}),{19:$VL3,21:$VM3,22:619,124:2351,209:$VN3,224:622,225:$VO3},o($Vt1,$Vl4),{117:[1,2352]},{19:[1,2355],21:[1,2358],22:2354,83:2353,224:2356,225:[1,2357]},o($Vu2,$Vt2,{80:1811,202:1812,79:2359,200:$VG6}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:2360,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($Vu2,$Vt2,{80:1811,202:1812,79:2361,200:$VG6}),o($Vo1,$Vx2,{95:1349,91:2362,97:$VS5,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V73),o($Va1,$VJ4),o($VH3,$VI3),o($Vm1,$VJ3),o($VH3,$VK3,{31:2363,203:[1,2364]}),{19:$VL3,21:$VM3,22:619,124:2365,209:$VN3,224:622,225:$VO3},o($Va1,$VP3),o($Vo1,$VJ3),o($Va1,$VK3,{31:2366,203:[1,2367]}),{19:$VL3,21:$VM3,22:619,124:2368,209:$VN3,224:622,225:$VO3},o($Vq1,$VR3),o($Vt1,$VS3),o($Vt1,$VT3),o($Vt1,$VU3),{96:[1,2369]},o($Vt1,$VH1),{96:[1,2371],102:2370,104:[1,2372],105:[1,2373],106:2374,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,2375]},o($Vc2,$VQ3),o($Vp1,$VJ3),o($Vc2,$VK3,{31:2376,203:[1,2377]}),{19:$VL3,21:$VM3,22:619,124:2378,209:$VN3,224:622,225:$VO3},o($Vt1,$Vl4),{117:[1,2379]},{19:[1,2382],21:[1,2385],22:2381,83:2380,224:2383,225:[1,2384]},o($VB3,$V15),{203:[1,2388],204:2386,205:[1,2387]},o($VA3,$VX5),o($VA3,$VY5),o($VA3,$VZ5),o($VA3,$Vq),o($VA3,$Vr),o($VA3,$Vo4),o($VA3,$Vp4),o($VA3,$Vq4),o($VA3,$Vt),o($VA3,$Vu),o($VA3,$Vr4),o($VA3,$Vs4,{212:2389,213:2390,107:[1,2391]}),o($VA3,$Vt4),o($VA3,$Vu4),o($VA3,$Vv4),o($VA3,$Vw4),o($VA3,$Vx4),o($VA3,$Vy4),o($VA3,$Vz4),o($VA3,$VA4),o($VA3,$VB4),o($Vs7,$Vc3),o($Vs7,$Vd3),o($Vs7,$Ve3),o($Vs7,$Vf3),{203:[1,2394],204:2392,205:[1,2393]},o($VB3,$VX5),o($VB3,$VY5),o($VB3,$VZ5),o($VB3,$Vq),o($VB3,$Vr),o($VB3,$Vo4),o($VB3,$Vp4),o($VB3,$Vq4),o($VB3,$Vt),o($VB3,$Vu),o($VB3,$Vr4),o($VB3,$Vs4,{212:2395,213:2396,107:[1,2397]}),o($VB3,$Vt4),o($VB3,$Vu4),o($VB3,$Vv4),o($VB3,$Vw4),o($VB3,$Vx4),o($VB3,$Vy4),o($VB3,$Vz4),o($VB3,$VA4),o($VB3,$VB4),o($Vt7,$Vc3),o($Vt7,$Vd3),o($Vt7,$Ve3),o($Vt7,$Vf3),{203:[1,2400],204:2398,205:[1,2399]},o($VC3,$VX5),o($VC3,$VY5),o($VC3,$VZ5),o($VC3,$Vq),o($VC3,$Vr),o($VC3,$Vo4),o($VC3,$Vp4),o($VC3,$Vq4),o($VC3,$Vt),o($VC3,$Vu),o($VC3,$Vr4),o($VC3,$Vs4,{212:2401,213:2402,107:[1,2403]}),o($VC3,$Vt4),o($VC3,$Vu4),o($VC3,$Vv4),o($VC3,$Vw4),o($VC3,$Vx4),o($VC3,$Vy4),o($VC3,$Vz4),o($VC3,$VA4),o($VC3,$VB4),o($Vu7,$Vc3),o($Vu7,$Vd3),o($Vu7,$Ve3),o($Vu7,$Vf3),{19:[1,2406],21:[1,2409],22:2405,83:2404,224:2407,225:[1,2408]},o($Vy3,$Vn3),o($VC,$VD,{58:2410,60:2411,62:2412,63:2413,69:2416,71:2417,68:2418,40:2419,88:2420,90:2421,83:2423,84:2424,85:2425,74:2426,91:2433,22:2434,87:2436,114:2437,95:2438,224:2441,101:2442,103:2443,19:[1,2440],21:[1,2445],65:[1,2414],67:[1,2415],75:[1,2427],76:[1,2428],77:[1,2429],81:[1,2422],92:[1,2430],93:[1,2431],94:[1,2432],97:$Vv7,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,158:[1,2435],225:[1,2444]}),o($VM4,$Vt2,{80:1931,202:1932,79:2446,200:$VR6}),o($Vy3,$VR1),o($Vy3,$Vl),o($Vy3,$Vm),o($Vy3,$Vq),o($Vy3,$Vr),o($Vy3,$Vs),o($Vy3,$Vt),o($Vy3,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:2447,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($VM4,$Vt2,{80:1931,202:1932,79:2448,200:$VR6}),o($VB3,$Vx2,{95:1425,91:2449,97:$VV5,98:$VL,99:$VM,100:$VN}),o($VK4,$Vy2),o($VK4,$V73),o($Vy3,$VJ4),o($VT5,$VI3),o($VA3,$VJ3),o($VT5,$VK3,{31:2450,203:[1,2451]}),{19:$VL3,21:$VM3,22:619,124:2452,209:$VN3,224:622,225:$VO3},o($Vy3,$VP3),o($VB3,$VJ3),o($Vy3,$VK3,{31:2453,203:[1,2454]}),{19:$VL3,21:$VM3,22:619,124:2455,209:$VN3,224:622,225:$VO3},o($VD3,$VR3),o($VE3,$VS3),o($VE3,$VT3),o($VE3,$VU3),{96:[1,2456]},o($VE3,$VH1),{96:[1,2458],102:2457,104:[1,2459],105:[1,2460],106:2461,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,2462]},o($VU5,$VQ3),o($VC3,$VJ3),o($VU5,$VK3,{31:2463,203:[1,2464]}),{19:$VL3,21:$VM3,22:619,124:2465,209:$VN3,224:622,225:$VO3},o($VE3,$Vl4),{117:[1,2466]},{19:[1,2469],21:[1,2472],22:2468,83:2467,224:2470,225:[1,2471]},o($VM4,$Vt2,{80:1969,202:1970,79:2473,200:$VT6}),o($Vy3,$VR1),o($Vy3,$Vl),o($Vy3,$Vm),o($Vy3,$Vq),o($Vy3,$Vr),o($Vy3,$Vs),o($Vy3,$Vt),o($Vy3,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:2474,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($VM4,$Vt2,{80:1969,202:1970,79:2475,200:$VT6}),o($VB3,$Vx2,{95:1472,91:2476,97:$VW5,98:$VL,99:$VM,100:$VN}),o($VK4,$Vy2),o($VK4,$V73),o($Vy3,$VJ4),o($VT5,$VI3),o($VA3,$VJ3),o($VT5,$VK3,{31:2477,203:[1,2478]}),{19:$VL3,21:$VM3,22:619,124:2479,209:$VN3,224:622,225:$VO3},o($Vy3,$VP3),o($VB3,$VJ3),o($Vy3,$VK3,{31:2480,203:[1,2481]}),{19:$VL3,21:$VM3,22:619,124:2482,209:$VN3,224:622,225:$VO3},o($VD3,$VR3),o($VE3,$VS3),o($VE3,$VT3),o($VE3,$VU3),{96:[1,2483]},o($VE3,$VH1),{96:[1,2485],102:2484,104:[1,2486],105:[1,2487],106:2488,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,2489]},o($VU5,$VQ3),o($VC3,$VJ3),o($VU5,$VK3,{31:2490,203:[1,2491]}),{19:$VL3,21:$VM3,22:619,124:2492,209:$VN3,224:622,225:$VO3},o($VE3,$Vl4),{117:[1,2493]},{19:[1,2496],21:[1,2499],22:2495,83:2494,224:2497,225:[1,2498]},o($Vm1,$Vt6),o($Vm1,$VC1),o($Vo1,$Vt6),o($Vo1,$VC1),o($Vp1,$Vt6),o($Vp1,$VC1),o($VV6,$Vn1,{78:2500}),o($VV6,$Vw7),o($VV6,$Vx7),o($VV6,$Vy7),o($VV6,$Vz7),o($VV6,$VA7),o($V$6,$VB7,{53:2501,47:[1,2502]}),o($V17,$VC7,{57:2503,49:[1,2504]}),o($V37,$VD7),o($V37,$VE7,{70:2505,72:2506,74:2507,40:2508,114:2509,75:[1,2510],76:[1,2511],77:[1,2512],115:$VD,120:$VD,122:$VD}),o($V37,$VF7),o($V37,$VG7,{73:2513,69:2514,88:2515,90:2516,91:2520,95:2521,92:[1,2517],93:[1,2518],94:[1,2519],97:$VH7,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2523,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($V37,$VI7),o($VJ7,$Vr1,{89:2524}),o($VK7,$Vs1,{95:2026,91:2525,97:$V57,98:$VL,99:$VM,100:$VN}),o($VL7,$Vu1,{82:2526}),o($VL7,$Vu1,{82:2527}),o($VL7,$Vu1,{82:2528}),o($V37,$Vv1,{101:2030,103:2031,87:2529,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VM7,$VN7),o($VM7,$VO7),o($VJ7,$Vy1),o($VJ7,$Vz1),o($VJ7,$VA1),o($VJ7,$VB1),o($VL7,$VC1),o($VD1,$VE1,{159:2530}),o($VP7,$VG1),{115:[1,2531],118:195,119:196,120:$Vw1,122:$Vx1},o($VM7,$V11),o($VM7,$V21),{19:[1,2535],21:[1,2539],22:2533,32:2532,210:2534,224:2536,225:[1,2538],226:[1,2537]},{96:[1,2540]},o($VJ7,$VH1),o($VL7,$Vq),o($VL7,$Vr),{96:[1,2542],102:2541,104:[1,2543],105:[1,2544],106:2545,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,2546]},o($VL7,$Vt),o($VL7,$Vu),o($VV6,$Vn1,{78:2547}),o($V96,$V16),o($V96,$V26),o($V96,$V36),o($Vc6,$V46),o($Vc6,$V56),o($Vc6,$V66),o($Vx,$Vg,{42:2548,43:2549,51:2550,55:2551,36:2552,39:$Vy}),{66:[1,2553]},{144:$Vh6,188:2554,197:$Vi6,198:$Vj6},o($Vc6,$Vk6),{19:$Vd6,21:$Ve6,22:1547,145:2555,210:1548,224:1550,225:$Vf6,226:$Vg6},{65:[1,2556]},{65:[1,2557]},{66:[1,2558],135:$VQ7,193:2559},o($V67,$Vn5),o($V67,$Vl5),o($V67,$Vm5),o($V67,$Vq),o($V67,$Vr),o($V67,$Vs),o($V67,$Vt),o($V67,$Vu),{144:[1,2561]},{144:[1,2562]},{19:$Vl6,21:$Vm6,22:1563,145:2563,210:1564,224:1566,225:$Vn6,226:$Vo6},{19:$Vl6,21:$Vm6,22:1563,145:2564,210:1564,224:1566,225:$Vn6,226:$Vo6},o($VR7,$VS7),o($VR7,$VT7),o($Vr6,$Vt6),o($Vr6,$VC1),o($Va1,$Vv3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:2565}),o($Va1,$V11),o($Va1,$V21),{19:[1,2569],21:[1,2573],22:2567,32:2566,210:2568,224:2570,225:[1,2572],226:[1,2571]},{115:[1,2574],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vw3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:2575}),o($Vl2,$Vr1,{89:2576}),o($Vo1,$Vs1,{95:2083,91:2577,97:$V87,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,2578]},o($Vl2,$VH1),{66:[1,2579]},o($Vs2,$Vt2,{79:2580,80:2581,202:2582,200:[1,2583]}),o($Vu2,$Vt2,{79:2584,80:2585,202:2586,200:$VU7}),o($Vm1,$Vx2,{95:1609,91:2588,97:$Vu6,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:2589,91:2590,87:2591,95:2592,101:2594,103:2595,97:$VV7,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:2589,91:2590,87:2591,95:2592,101:2594,103:2595,97:$VV7,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:2589,91:2590,87:2591,95:2592,101:2594,103:2595,97:$VV7,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:2596,80:2597,202:2598,200:[1,2599]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VQ2,21:$VR2,22:388,67:$VS2,77:$VT2,96:$VU2,104:$VV2,105:$VW2,106:400,160:[1,2600],161:383,162:384,163:385,164:386,178:389,182:$VX2,206:394,207:395,208:396,211:399,214:$VY2,215:$VZ2,216:$V_2,217:$V$2,218:$V03,219:$V13,220:$V23,221:$V33,222:$V43,223:$V53,224:393,225:$V63},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:2601,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($Vq1,$V73),o($VF1,$V83),o($VF1,$V93),o($VF1,$Va3),o($VF1,$Vb3),{107:[1,2602]},o($VF1,$Vg3),o($Vo1,$V15),{203:[1,2605],204:2603,205:[1,2604]},o($Vm1,$VX5),o($Vm1,$VY5),o($Vm1,$VZ5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vo4),o($Vm1,$Vp4),o($Vm1,$Vq4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vr4),o($Vm1,$Vs4,{212:2606,213:2607,107:[1,2608]}),o($Vm1,$Vt4),o($Vm1,$Vu4),o($Vm1,$Vv4),o($Vm1,$Vw4),o($Vm1,$Vx4),o($Vm1,$Vy4),o($Vm1,$Vz4),o($Vm1,$VA4),o($Vm1,$VB4),o($V_5,$Vc3),o($V_5,$Vd3),o($V_5,$Ve3),o($V_5,$Vf3),{203:[1,2611],204:2609,205:[1,2610]},o($Vo1,$VX5),o($Vo1,$VY5),o($Vo1,$VZ5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vo4),o($Vo1,$Vp4),o($Vo1,$Vq4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vr4),o($Vo1,$Vs4,{212:2612,213:2613,107:[1,2614]}),o($Vo1,$Vt4),o($Vo1,$Vu4),o($Vo1,$Vv4),o($Vo1,$Vw4),o($Vo1,$Vx4),o($Vo1,$Vy4),o($Vo1,$Vz4),o($Vo1,$VA4),o($Vo1,$VB4),o($V$5,$Vc3),o($V$5,$Vd3),o($V$5,$Ve3),o($V$5,$Vf3),{19:[1,2617],21:[1,2620],22:2616,83:2615,224:2618,225:[1,2619]},{203:[1,2623],204:2621,205:[1,2622]},o($Vp1,$VX5),o($Vp1,$VY5),o($Vp1,$VZ5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vo4),o($Vp1,$Vp4),o($Vp1,$Vq4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vr4),o($Vp1,$Vs4,{212:2624,213:2625,107:[1,2626]}),o($Vp1,$Vt4),o($Vp1,$Vu4),o($Vp1,$Vv4),o($Vp1,$Vw4),o($Vp1,$Vx4),o($Vp1,$Vy4),o($Vp1,$Vz4),o($Vp1,$VA4),o($Vp1,$VB4),o($V06,$Vc3),o($V06,$Vd3),o($V06,$Ve3),o($V06,$Vf3),o($Vo1,$V15),{203:[1,2629],204:2627,205:[1,2628]},o($Vm1,$VX5),o($Vm1,$VY5),o($Vm1,$VZ5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vo4),o($Vm1,$Vp4),o($Vm1,$Vq4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vr4),o($Vm1,$Vs4,{212:2630,213:2631,107:[1,2632]}),o($Vm1,$Vt4),o($Vm1,$Vu4),o($Vm1,$Vv4),o($Vm1,$Vw4),o($Vm1,$Vx4),o($Vm1,$Vy4),o($Vm1,$Vz4),o($Vm1,$VA4),o($Vm1,$VB4),o($V_5,$Vc3),o($V_5,$Vd3),o($V_5,$Ve3),o($V_5,$Vf3),{203:[1,2635],204:2633,205:[1,2634]},o($Vo1,$VX5),o($Vo1,$VY5),o($Vo1,$VZ5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vo4),o($Vo1,$Vp4),o($Vo1,$Vq4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vr4),o($Vo1,$Vs4,{212:2636,213:2637,107:[1,2638]}),o($Vo1,$Vt4),o($Vo1,$Vu4),o($Vo1,$Vv4),o($Vo1,$Vw4),o($Vo1,$Vx4),o($Vo1,$Vy4),o($Vo1,$Vz4),o($Vo1,$VA4),o($Vo1,$VB4),o($V$5,$Vc3),o($V$5,$Vd3),o($V$5,$Ve3),o($V$5,$Vf3),{19:[1,2641],21:[1,2644],22:2640,83:2639,224:2642,225:[1,2643]},{203:[1,2647],204:2645,205:[1,2646]},o($Vp1,$VX5),o($Vp1,$VY5),o($Vp1,$VZ5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vo4),o($Vp1,$Vp4),o($Vp1,$Vq4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vr4),o($Vp1,$Vs4,{212:2648,213:2649,107:[1,2650]}),o($Vp1,$Vt4),o($Vp1,$Vu4),o($Vp1,$Vv4),o($Vp1,$Vw4),o($Vp1,$Vx4),o($Vp1,$Vy4),o($Vp1,$Vz4),o($Vp1,$VA4),o($Vp1,$VB4),o($V06,$Vc3),o($V06,$Vd3),o($V06,$Ve3),o($V06,$Vf3),o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$VK5),o($Vm1,$VL5),{19:$Vv6,21:$Vw6,22:2652,83:2651,224:1677,225:$Vx6},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$VK5),o($Vo1,$VL5),{19:$Vy6,21:$Vz6,22:2654,83:2653,224:1703,225:$VA6},o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$VK5),o($Vp1,$VL5),{19:$VB6,21:$VC6,22:2656,83:2655,224:1729,225:$VD6},o($Vt1,$VM5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$V92),o($Va1,$Vd1,{61:2657,63:2658,68:2659,40:2660,74:2661,114:2665,75:[1,2662],76:[1,2663],77:[1,2664],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:2666,60:2667,69:2668,88:2669,90:2670,91:2674,95:2675,92:[1,2671],93:[1,2672],94:[1,2673],97:$VW7,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2677,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:2678}),o($Vo1,$Vn1,{78:2679}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:2680}),o($Vm1,$Vs1,{95:2324,91:2681,97:$Vr7,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:2682}),o($Vt1,$Vu1,{82:2683}),o($Vt1,$Vu1,{82:2684}),o($Vo1,$Vv1,{101:2328,103:2329,87:2685,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:2686}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,2690],21:[1,2694],22:2688,32:2687,210:2689,224:2691,225:[1,2693],226:[1,2692]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{159:2695}),o($VF1,$VG1),{115:[1,2696],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,2697]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,2699],102:2698,104:[1,2700],105:[1,2701],106:2702,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,2703]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$VQ3),{117:[1,2704]},o($Va1,$VI3),o($Vl2,$VR3),o($Vs2,$VS4),{19:$Vn,21:$Vo,22:2705,224:52,225:$Vp},{19:$VX7,21:$VY7,22:2707,96:[1,2718],104:[1,2719],105:[1,2720],106:2717,178:2708,201:2706,206:2711,207:2712,208:2713,211:2716,214:[1,2721],215:[1,2722],216:[1,2727],217:[1,2728],218:[1,2729],219:[1,2730],220:[1,2723],221:[1,2724],222:[1,2725],223:[1,2726],224:2710,225:$VZ7},o($Vu2,$VS4),{19:$Vn,21:$Vo,22:2731,224:52,225:$Vp},{19:$V_7,21:$V$7,22:2733,96:[1,2744],104:[1,2745],105:[1,2746],106:2743,178:2734,201:2732,206:2737,207:2738,208:2739,211:2742,214:[1,2747],215:[1,2748],216:[1,2753],217:[1,2754],218:[1,2755],219:[1,2756],220:[1,2749],221:[1,2750],222:[1,2751],223:[1,2752],224:2736,225:$V08},o($Vt1,$V73),o($Vt1,$V83),o($Vt1,$V93),o($Vt1,$Va3),o($Vt1,$Vb3),{107:[1,2757]},o($Vt1,$Vg3),o($Vw2,$VS4),{19:$Vn,21:$Vo,22:2758,224:52,225:$Vp},{19:$V18,21:$V28,22:2760,96:[1,2771],104:[1,2772],105:[1,2773],106:2770,178:2761,201:2759,206:2764,207:2765,208:2766,211:2769,214:[1,2774],215:[1,2775],216:[1,2780],217:[1,2781],218:[1,2782],219:[1,2783],220:[1,2776],221:[1,2777],222:[1,2778],223:[1,2779],224:2763,225:$V38},o($Vp1,$V15),o($VF1,$VM5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Va1,$VQ3),{117:[1,2784]},o($Va1,$VI3),o($Vl2,$VR3),o($Vs2,$VS4),{19:$Vn,21:$Vo,22:2785,224:52,225:$Vp},{19:$V48,21:$V58,22:2787,96:[1,2798],104:[1,2799],105:[1,2800],106:2797,178:2788,201:2786,206:2791,207:2792,208:2793,211:2796,214:[1,2801],215:[1,2802],216:[1,2807],217:[1,2808],218:[1,2809],219:[1,2810],220:[1,2803],221:[1,2804],222:[1,2805],223:[1,2806],224:2790,225:$V68},o($Vu2,$VS4),{19:$Vn,21:$Vo,22:2811,224:52,225:$Vp},{19:$V78,21:$V88,22:2813,96:[1,2824],104:[1,2825],105:[1,2826],106:2823,178:2814,201:2812,206:2817,207:2818,208:2819,211:2822,214:[1,2827],215:[1,2828],216:[1,2833],217:[1,2834],218:[1,2835],219:[1,2836],220:[1,2829],221:[1,2830],222:[1,2831],223:[1,2832],224:2816,225:$V98},o($Vt1,$V73),o($Vt1,$V83),o($Vt1,$V93),o($Vt1,$Va3),o($Vt1,$Vb3),{107:[1,2837]},o($Vt1,$Vg3),o($Vw2,$VS4),{19:$Vn,21:$Vo,22:2838,224:52,225:$Vp},{19:$Va8,21:$Vb8,22:2840,96:[1,2851],104:[1,2852],105:[1,2853],106:2850,178:2841,201:2839,206:2844,207:2845,208:2846,211:2849,214:[1,2854],215:[1,2855],216:[1,2860],217:[1,2861],218:[1,2862],219:[1,2863],220:[1,2856],221:[1,2857],222:[1,2858],223:[1,2859],224:2843,225:$Vc8},o($Vp1,$V15),o($VF1,$VM5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($VL4,$VS1),o($VL4,$VT1),o($VL4,$VU1),o($VA3,$VK5),o($VA3,$VL5),{19:$VI6,21:$VJ6,22:2865,83:2864,224:1835,225:$VK6},o($VM4,$VS1),o($VM4,$VT1),o($VM4,$VU1),o($VB3,$VK5),o($VB3,$VL5),{19:$VL6,21:$VM6,22:2867,83:2866,224:1861,225:$VN6},o($VO4,$VS1),o($VO4,$VT1),o($VO4,$VU1),o($VC3,$VK5),o($VC3,$VL5),{19:$VO6,21:$VP6,22:2869,83:2868,224:1887,225:$VQ6},o($VE3,$VM5),o($VE3,$VC1),o($VE3,$Vq),o($VE3,$Vr),o($VE3,$Vt),o($VE3,$Vu),o($Vy3,$V92),o($Vy3,$Vd1,{61:2870,63:2871,68:2872,40:2873,74:2874,114:2878,75:[1,2875],76:[1,2876],77:[1,2877],115:$VD,120:$VD,122:$VD}),o($Vy3,$Va2),o($Vy3,$Vf1,{64:2879,60:2880,69:2881,88:2882,90:2883,91:2887,95:2888,92:[1,2884],93:[1,2885],94:[1,2886],97:$Vd8,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2890,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vy3,$Vb2),o($VA3,$Vn1,{78:2891}),o($VB3,$Vn1,{78:2892}),o($VU5,$Vd2),o($VU5,$Ve2),o($VD3,$Vr1,{89:2893}),o($VA3,$Vs1,{95:2438,91:2894,97:$Vv7,98:$VL,99:$VM,100:$VN}),o($VE3,$Vu1,{82:2895}),o($VE3,$Vu1,{82:2896}),o($VE3,$Vu1,{82:2897}),o($VB3,$Vv1,{101:2442,103:2443,87:2898,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VC3,$Vn1,{78:2899}),o($VU5,$V11),o($VU5,$V21),{19:[1,2903],21:[1,2907],22:2901,32:2900,210:2902,224:2904,225:[1,2906],226:[1,2905]},o($VD3,$Vy1),o($VD3,$Vz1),o($VD3,$VA1),o($VD3,$VB1),o($VE3,$VC1),o($VD1,$VE1,{159:2908}),o($VF3,$VG1),{115:[1,2909],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,2910]},o($VD3,$VH1),o($VE3,$Vq),o($VE3,$Vr),{96:[1,2912],102:2911,104:[1,2913],105:[1,2914],106:2915,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,2916]},o($VE3,$Vt),o($VE3,$Vu),o($Vy3,$VQ3),{117:[1,2917]},o($Vy3,$VI3),o($VK4,$VR3),o($VL4,$VS4),{19:$Vn,21:$Vo,22:2918,224:52,225:$Vp},{19:$Ve8,21:$Vf8,22:2920,96:[1,2931],104:[1,2932],105:[1,2933],106:2930,178:2921,201:2919,206:2924,207:2925,208:2926,211:2929,214:[1,2934],215:[1,2935],216:[1,2940],217:[1,2941],218:[1,2942],219:[1,2943],220:[1,2936],221:[1,2937],222:[1,2938],223:[1,2939],224:2923,225:$Vg8},o($VM4,$VS4),{19:$Vn,21:$Vo,22:2944,224:52,225:$Vp},{19:$Vh8,21:$Vi8,22:2946,96:[1,2957],104:[1,2958],105:[1,2959],106:2956,178:2947,201:2945,206:2950,207:2951,208:2952,211:2955,214:[1,2960],215:[1,2961],216:[1,2966],217:[1,2967],218:[1,2968],219:[1,2969],220:[1,2962],221:[1,2963],222:[1,2964],223:[1,2965],224:2949,225:$Vj8},o($VE3,$V73),o($VE3,$V83),o($VE3,$V93),o($VE3,$Va3),o($VE3,$Vb3),{107:[1,2970]},o($VE3,$Vg3),o($VO4,$VS4),{19:$Vn,21:$Vo,22:2971,224:52,225:$Vp},{19:$Vk8,21:$Vl8,22:2973,96:[1,2984],104:[1,2985],105:[1,2986],106:2983,178:2974,201:2972,206:2977,207:2978,208:2979,211:2982,214:[1,2987],215:[1,2988],216:[1,2993],217:[1,2994],218:[1,2995],219:[1,2996],220:[1,2989],221:[1,2990],222:[1,2991],223:[1,2992],224:2976,225:$Vm8},o($VC3,$V15),o($VF3,$VM5),o($VF3,$VC1),o($VF3,$Vq),o($VF3,$Vr),o($VF3,$Vt),o($VF3,$Vu),o($Vy3,$VQ3),{117:[1,2997]},o($Vy3,$VI3),o($VK4,$VR3),o($VL4,$VS4),{19:$Vn,21:$Vo,22:2998,224:52,225:$Vp},{19:$Vn8,21:$Vo8,22:3000,96:[1,3011],104:[1,3012],105:[1,3013],106:3010,178:3001,201:2999,206:3004,207:3005,208:3006,211:3009,214:[1,3014],215:[1,3015],216:[1,3020],217:[1,3021],218:[1,3022],219:[1,3023],220:[1,3016],221:[1,3017],222:[1,3018],223:[1,3019],224:3003,225:$Vp8},o($VM4,$VS4),{19:$Vn,21:$Vo,22:3024,224:52,225:$Vp},{19:$Vq8,21:$Vr8,22:3026,96:[1,3037],104:[1,3038],105:[1,3039],106:3036,178:3027,201:3025,206:3030,207:3031,208:3032,211:3035,214:[1,3040],215:[1,3041],216:[1,3046],217:[1,3047],218:[1,3048],219:[1,3049],220:[1,3042],221:[1,3043],222:[1,3044],223:[1,3045],224:3029,225:$Vs8},o($VE3,$V73),o($VE3,$V83),o($VE3,$V93),o($VE3,$Va3),o($VE3,$Vb3),{107:[1,3050]},o($VE3,$Vg3),o($VO4,$VS4),{19:$Vn,21:$Vo,22:3051,224:52,225:$Vp},{19:$Vt8,21:$Vu8,22:3053,96:[1,3064],104:[1,3065],105:[1,3066],106:3063,178:3054,201:3052,206:3057,207:3058,208:3059,211:3062,214:[1,3067],215:[1,3068],216:[1,3073],217:[1,3074],218:[1,3075],219:[1,3076],220:[1,3069],221:[1,3070],222:[1,3071],223:[1,3072],224:3056,225:$Vv8},o($VC3,$V15),o($VF3,$VM5),o($VF3,$VC1),o($VF3,$Vq),o($VF3,$Vr),o($VF3,$Vt),o($VF3,$Vu),o($Vw8,$Vt2,{79:3077,80:3078,202:3079,200:$Vx8}),o($V17,$Vy8),o($Vx,$Vg,{51:3081,55:3082,36:3083,39:$Vy}),o($V37,$Vz8),o($Vx,$Vg,{55:3084,36:3085,39:$Vy}),o($V37,$VA8),o($V37,$VB8),o($V37,$VN7),o($V37,$VO7),{115:[1,3086],118:195,119:196,120:$Vw1,122:$Vx1},o($V37,$V11),o($V37,$V21),{19:[1,3090],21:[1,3094],22:3088,32:3087,210:3089,224:3091,225:[1,3093],226:[1,3092]},o($V37,$VC8),o($V37,$VD8),o($VE8,$Vr1,{89:3095}),o($V37,$Vs1,{95:2521,91:3096,97:$VH7,98:$VL,99:$VM,100:$VN}),o($VE8,$Vy1),o($VE8,$Vz1),o($VE8,$VA1),o($VE8,$VB1),{96:[1,3097]},o($VE8,$VH1),{66:[1,3098]},o($VK7,$Vx2,{95:2026,91:3099,97:$V57,98:$VL,99:$VM,100:$VN}),o($VJ7,$Vy2),o($V37,$Vz2,{86:3100,91:3101,87:3102,95:3103,101:3105,103:3106,97:$VF8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($V37,$VB2,{86:3100,91:3101,87:3102,95:3103,101:3105,103:3106,97:$VF8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($V37,$VC2,{86:3100,91:3101,87:3102,95:3103,101:3105,103:3106,97:$VF8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VP7,$VD2),{19:$VQ2,21:$VR2,22:388,67:$VS2,77:$VT2,96:$VU2,104:$VV2,105:$VW2,106:400,160:[1,3107],161:383,162:384,163:385,164:386,178:389,182:$VX2,206:394,207:395,208:396,211:399,214:$VY2,215:$VZ2,216:$V_2,217:$V$2,218:$V03,219:$V13,220:$V23,221:$V33,222:$V43,223:$V53,224:393,225:$V63},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:3108,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($VM7,$VR1),o($VM7,$Vl),o($VM7,$Vm),o($VM7,$Vq),o($VM7,$Vr),o($VM7,$Vs),o($VM7,$Vt),o($VM7,$Vu),o($VJ7,$V73),o($VP7,$V83),o($VP7,$V93),o($VP7,$Va3),o($VP7,$Vb3),{107:[1,3109]},o($VP7,$Vg3),o($Vw8,$Vt2,{80:3078,202:3079,79:3110,200:$Vx8}),o($VG8,$VW6,{148:3111,149:3112,152:$VH8,153:$VI8,154:$VJ8,155:$VK8}),o($VL8,$V07),o($VM8,$V27,{52:3117}),o($VN8,$V47,{56:3118}),o($VC,$VD,{59:3119,69:3120,71:3121,72:3122,88:3125,90:3126,83:3128,84:3129,85:3130,74:3131,40:3132,91:3136,22:3137,87:3139,114:3140,95:3144,224:3147,101:3148,103:3149,19:[1,3146],21:[1,3151],65:[1,3123],67:[1,3124],75:[1,3141],76:[1,3142],77:[1,3143],81:[1,3127],92:[1,3133],93:[1,3134],94:[1,3135],97:$VO8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,158:[1,3138],225:[1,3150]}),o($VG8,$VW6,{149:3112,148:3152,152:$VH8,153:$VI8,154:$VJ8,155:$VK8}),o($V67,$V77,{189:3153}),o($Vc6,$Vn5),{144:[1,3154]},{144:[1,3155]},o($V74,$VP8),o($V67,[2,228]),{144:[1,3157],188:3156,197:[1,3158],198:[1,3159]},{19:$Vl6,21:$Vm6,22:1563,145:3160,210:1564,224:1566,225:$Vn6,226:$Vo6},{19:$Vl6,21:$Vm6,22:1563,145:3161,210:1564,224:1566,225:$Vn6,226:$Vo6},{66:[1,3162]},{66:[1,3163]},o($Vu2,$Vt2,{80:2585,202:2586,79:3164,200:$VU7}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:3165,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($Vu2,$Vt2,{80:2585,202:2586,79:3166,200:$VU7}),o($Vo1,$Vx2,{95:2083,91:3167,97:$V87,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V73),o($Va1,$VJ4),o($VH3,$VI3),o($Vm1,$VJ3),o($VH3,$VK3,{31:3168,203:[1,3169]}),{19:$VL3,21:$VM3,22:619,124:3170,209:$VN3,224:622,225:$VO3},o($Va1,$VP3),o($Vo1,$VJ3),o($Va1,$VK3,{31:3171,203:[1,3172]}),{19:$VL3,21:$VM3,22:619,124:3173,209:$VN3,224:622,225:$VO3},o($Vq1,$VR3),o($Vt1,$VS3),o($Vt1,$VT3),o($Vt1,$VU3),{96:[1,3174]},o($Vt1,$VH1),{96:[1,3176],102:3175,104:[1,3177],105:[1,3178],106:3179,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,3180]},o($Vc2,$VQ3),o($Vp1,$VJ3),o($Vc2,$VK3,{31:3181,203:[1,3182]}),{19:$VL3,21:$VM3,22:619,124:3183,209:$VN3,224:622,225:$VO3},o($Vt1,$Vl4),{117:[1,3184]},{19:[1,3187],21:[1,3190],22:3186,83:3185,224:3188,225:[1,3189]},o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$VK5),o($Vm1,$VL5),{19:$V97,21:$Va7,22:3192,83:3191,224:2118,225:$Vb7},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$VK5),o($Vo1,$VL5),{19:$Vc7,21:$Vd7,22:3194,83:3193,224:2144,225:$Ve7},o($Vt1,$VM5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$VK5),o($Vp1,$VL5),{19:$Vf7,21:$Vg7,22:3196,83:3195,224:2171,225:$Vh7},o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$VK5),o($Vm1,$VL5),{19:$Vi7,21:$Vj7,22:3198,83:3197,224:2198,225:$Vk7},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$VK5),o($Vo1,$VL5),{19:$Vl7,21:$Vm7,22:3200,83:3199,224:2224,225:$Vn7},o($Vt1,$VM5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$VK5),o($Vp1,$VL5),{19:$Vo7,21:$Vp7,22:3202,83:3201,224:2251,225:$Vq7},o($Vm1,$Vt6),o($Vm1,$VC1),o($Vo1,$Vt6),o($Vo1,$VC1),o($Vp1,$Vt6),o($Vp1,$VC1),o($Va1,$Vv3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:3203}),o($Va1,$V11),o($Va1,$V21),{19:[1,3207],21:[1,3211],22:3205,32:3204,210:3206,224:3208,225:[1,3210],226:[1,3209]},{115:[1,3212],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vw3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:3213}),o($Vl2,$Vr1,{89:3214}),o($Vo1,$Vs1,{95:2675,91:3215,97:$VW7,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,3216]},o($Vl2,$VH1),{66:[1,3217]},o($Vs2,$Vt2,{79:3218,80:3219,202:3220,200:[1,3221]}),o($Vu2,$Vt2,{79:3222,80:3223,202:3224,200:$VQ8}),o($Vm1,$Vx2,{95:2324,91:3226,97:$Vr7,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:3227,91:3228,87:3229,95:3230,101:3232,103:3233,97:$VR8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:3227,91:3228,87:3229,95:3230,101:3232,103:3233,97:$VR8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:3227,91:3228,87:3229,95:3230,101:3232,103:3233,97:$VR8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:3234,80:3235,202:3236,200:[1,3237]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VQ2,21:$VR2,22:388,67:$VS2,77:$VT2,96:$VU2,104:$VV2,105:$VW2,106:400,160:[1,3238],161:383,162:384,163:385,164:386,178:389,182:$VX2,206:394,207:395,208:396,211:399,214:$VY2,215:$VZ2,216:$V_2,217:$V$2,218:$V03,219:$V13,220:$V23,221:$V33,222:$V43,223:$V53,224:393,225:$V63},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:3239,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($Vq1,$V73),o($VF1,$V83),o($VF1,$V93),o($VF1,$Va3),o($VF1,$Vb3),{107:[1,3240]},o($VF1,$Vg3),o($Vo1,$V15),{203:[1,3243],204:3241,205:[1,3242]},o($Vm1,$VX5),o($Vm1,$VY5),o($Vm1,$VZ5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vo4),o($Vm1,$Vp4),o($Vm1,$Vq4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vr4),o($Vm1,$Vs4,{212:3244,213:3245,107:[1,3246]}),o($Vm1,$Vt4),o($Vm1,$Vu4),o($Vm1,$Vv4),o($Vm1,$Vw4),o($Vm1,$Vx4),o($Vm1,$Vy4),o($Vm1,$Vz4),o($Vm1,$VA4),o($Vm1,$VB4),o($V_5,$Vc3),o($V_5,$Vd3),o($V_5,$Ve3),o($V_5,$Vf3),{203:[1,3249],204:3247,205:[1,3248]},o($Vo1,$VX5),o($Vo1,$VY5),o($Vo1,$VZ5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vo4),o($Vo1,$Vp4),o($Vo1,$Vq4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vr4),o($Vo1,$Vs4,{212:3250,213:3251,107:[1,3252]}),o($Vo1,$Vt4),o($Vo1,$Vu4),o($Vo1,$Vv4),o($Vo1,$Vw4),o($Vo1,$Vx4),o($Vo1,$Vy4),o($Vo1,$Vz4),o($Vo1,$VA4),o($Vo1,$VB4),o($V$5,$Vc3),o($V$5,$Vd3),o($V$5,$Ve3),o($V$5,$Vf3),{19:[1,3255],21:[1,3258],22:3254,83:3253,224:3256,225:[1,3257]},{203:[1,3261],204:3259,205:[1,3260]},o($Vp1,$VX5),o($Vp1,$VY5),o($Vp1,$VZ5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vo4),o($Vp1,$Vp4),o($Vp1,$Vq4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vr4),o($Vp1,$Vs4,{212:3262,213:3263,107:[1,3264]}),o($Vp1,$Vt4),o($Vp1,$Vu4),o($Vp1,$Vv4),o($Vp1,$Vw4),o($Vp1,$Vx4),o($Vp1,$Vy4),o($Vp1,$Vz4),o($Vp1,$VA4),o($Vp1,$VB4),o($V06,$Vc3),o($V06,$Vd3),o($V06,$Ve3),o($V06,$Vf3),o($Vo1,$V15),{203:[1,3267],204:3265,205:[1,3266]},o($Vm1,$VX5),o($Vm1,$VY5),o($Vm1,$VZ5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vo4),o($Vm1,$Vp4),o($Vm1,$Vq4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vr4),o($Vm1,$Vs4,{212:3268,213:3269,107:[1,3270]}),o($Vm1,$Vt4),o($Vm1,$Vu4),o($Vm1,$Vv4),o($Vm1,$Vw4),o($Vm1,$Vx4),o($Vm1,$Vy4),o($Vm1,$Vz4),o($Vm1,$VA4),o($Vm1,$VB4),o($V_5,$Vc3),o($V_5,$Vd3),o($V_5,$Ve3),o($V_5,$Vf3),{203:[1,3273],204:3271,205:[1,3272]},o($Vo1,$VX5),o($Vo1,$VY5),o($Vo1,$VZ5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vo4),o($Vo1,$Vp4),o($Vo1,$Vq4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vr4),o($Vo1,$Vs4,{212:3274,213:3275,107:[1,3276]}),o($Vo1,$Vt4),o($Vo1,$Vu4),o($Vo1,$Vv4),o($Vo1,$Vw4),o($Vo1,$Vx4),o($Vo1,$Vy4),o($Vo1,$Vz4),o($Vo1,$VA4),o($Vo1,$VB4),o($V$5,$Vc3),o($V$5,$Vd3),o($V$5,$Ve3),o($V$5,$Vf3),{19:[1,3279],21:[1,3282],22:3278,83:3277,224:3280,225:[1,3281]},{203:[1,3285],204:3283,205:[1,3284]},o($Vp1,$VX5),o($Vp1,$VY5),o($Vp1,$VZ5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vo4),o($Vp1,$Vp4),o($Vp1,$Vq4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vr4),o($Vp1,$Vs4,{212:3286,213:3287,107:[1,3288]}),o($Vp1,$Vt4),o($Vp1,$Vu4),o($Vp1,$Vv4),o($Vp1,$Vw4),o($Vp1,$Vx4),o($Vp1,$Vy4),o($Vp1,$Vz4),o($Vp1,$VA4),o($Vp1,$VB4),o($V06,$Vc3),o($V06,$Vd3),o($V06,$Ve3),o($V06,$Vf3),o($VA3,$Vt6),o($VA3,$VC1),o($VB3,$Vt6),o($VB3,$VC1),o($VC3,$Vt6),o($VC3,$VC1),o($Vy3,$Vv3),o($Vy3,$Vi2),o($Vy3,$Vd2),o($Vy3,$Ve2),o($VB3,$Vn1,{78:3289}),o($Vy3,$V11),o($Vy3,$V21),{19:[1,3293],21:[1,3297],22:3291,32:3290,210:3292,224:3294,225:[1,3296],226:[1,3295]},{115:[1,3298],118:195,119:196,120:$Vw1,122:$Vx1},o($Vy3,$Vw3),o($Vy3,$Vk2),o($VB3,$Vn1,{78:3299}),o($VK4,$Vr1,{89:3300}),o($VB3,$Vs1,{95:2888,91:3301,97:$Vd8,98:$VL,99:$VM,100:$VN}),o($VK4,$Vy1),o($VK4,$Vz1),o($VK4,$VA1),o($VK4,$VB1),{96:[1,3302]},o($VK4,$VH1),{66:[1,3303]},o($VL4,$Vt2,{79:3304,80:3305,202:3306,200:[1,3307]}),o($VM4,$Vt2,{79:3308,80:3309,202:3310,200:$VS8}),o($VA3,$Vx2,{95:2438,91:3312,97:$Vv7,98:$VL,99:$VM,100:$VN}),o($VD3,$Vy2),o($VB3,$Vz2,{86:3313,91:3314,87:3315,95:3316,101:3318,103:3319,97:$VT8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB3,$VB2,{86:3313,91:3314,87:3315,95:3316,101:3318,103:3319,97:$VT8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB3,$VC2,{86:3313,91:3314,87:3315,95:3316,101:3318,103:3319,97:$VT8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF3,$VD2),o($VO4,$Vt2,{79:3320,80:3321,202:3322,200:[1,3323]}),o($VU5,$VR1),o($VU5,$Vl),o($VU5,$Vm),o($VU5,$Vq),o($VU5,$Vr),o($VU5,$Vs),o($VU5,$Vt),o($VU5,$Vu),{19:$VQ2,21:$VR2,22:388,67:$VS2,77:$VT2,96:$VU2,104:$VV2,105:$VW2,106:400,160:[1,3324],161:383,162:384,163:385,164:386,178:389,182:$VX2,206:394,207:395,208:396,211:399,214:$VY2,215:$VZ2,216:$V_2,217:$V$2,218:$V03,219:$V13,220:$V23,221:$V33,222:$V43,223:$V53,224:393,225:$V63},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:3325,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($VD3,$V73),o($VF3,$V83),o($VF3,$V93),o($VF3,$Va3),o($VF3,$Vb3),{107:[1,3326]},o($VF3,$Vg3),o($VB3,$V15),{203:[1,3329],204:3327,205:[1,3328]},o($VA3,$VX5),o($VA3,$VY5),o($VA3,$VZ5),o($VA3,$Vq),o($VA3,$Vr),o($VA3,$Vo4),o($VA3,$Vp4),o($VA3,$Vq4),o($VA3,$Vt),o($VA3,$Vu),o($VA3,$Vr4),o($VA3,$Vs4,{212:3330,213:3331,107:[1,3332]}),o($VA3,$Vt4),o($VA3,$Vu4),o($VA3,$Vv4),o($VA3,$Vw4),o($VA3,$Vx4),o($VA3,$Vy4),o($VA3,$Vz4),o($VA3,$VA4),o($VA3,$VB4),o($Vs7,$Vc3),o($Vs7,$Vd3),o($Vs7,$Ve3),o($Vs7,$Vf3),{203:[1,3335],204:3333,205:[1,3334]},o($VB3,$VX5),o($VB3,$VY5),o($VB3,$VZ5),o($VB3,$Vq),o($VB3,$Vr),o($VB3,$Vo4),o($VB3,$Vp4),o($VB3,$Vq4),o($VB3,$Vt),o($VB3,$Vu),o($VB3,$Vr4),o($VB3,$Vs4,{212:3336,213:3337,107:[1,3338]}),o($VB3,$Vt4),o($VB3,$Vu4),o($VB3,$Vv4),o($VB3,$Vw4),o($VB3,$Vx4),o($VB3,$Vy4),o($VB3,$Vz4),o($VB3,$VA4),o($VB3,$VB4),o($Vt7,$Vc3),o($Vt7,$Vd3),o($Vt7,$Ve3),o($Vt7,$Vf3),{19:[1,3341],21:[1,3344],22:3340,83:3339,224:3342,225:[1,3343]},{203:[1,3347],204:3345,205:[1,3346]},o($VC3,$VX5),o($VC3,$VY5),o($VC3,$VZ5),o($VC3,$Vq),o($VC3,$Vr),o($VC3,$Vo4),o($VC3,$Vp4),o($VC3,$Vq4),o($VC3,$Vt),o($VC3,$Vu),o($VC3,$Vr4),o($VC3,$Vs4,{212:3348,213:3349,107:[1,3350]}),o($VC3,$Vt4),o($VC3,$Vu4),o($VC3,$Vv4),o($VC3,$Vw4),o($VC3,$Vx4),o($VC3,$Vy4),o($VC3,$Vz4),o($VC3,$VA4),o($VC3,$VB4),o($Vu7,$Vc3),o($Vu7,$Vd3),o($Vu7,$Ve3),o($Vu7,$Vf3),o($VB3,$V15),{203:[1,3353],204:3351,205:[1,3352]},o($VA3,$VX5),o($VA3,$VY5),o($VA3,$VZ5),o($VA3,$Vq),o($VA3,$Vr),o($VA3,$Vo4),o($VA3,$Vp4),o($VA3,$Vq4),o($VA3,$Vt),o($VA3,$Vu),o($VA3,$Vr4),o($VA3,$Vs4,{212:3354,213:3355,107:[1,3356]}),o($VA3,$Vt4),o($VA3,$Vu4),o($VA3,$Vv4),o($VA3,$Vw4),o($VA3,$Vx4),o($VA3,$Vy4),o($VA3,$Vz4),o($VA3,$VA4),o($VA3,$VB4),o($Vs7,$Vc3),o($Vs7,$Vd3),o($Vs7,$Ve3),o($Vs7,$Vf3),{203:[1,3359],204:3357,205:[1,3358]},o($VB3,$VX5),o($VB3,$VY5),o($VB3,$VZ5),o($VB3,$Vq),o($VB3,$Vr),o($VB3,$Vo4),o($VB3,$Vp4),o($VB3,$Vq4),o($VB3,$Vt),o($VB3,$Vu),o($VB3,$Vr4),o($VB3,$Vs4,{212:3360,213:3361,107:[1,3362]}),o($VB3,$Vt4),o($VB3,$Vu4),o($VB3,$Vv4),o($VB3,$Vw4),o($VB3,$Vx4),o($VB3,$Vy4),o($VB3,$Vz4),o($VB3,$VA4),o($VB3,$VB4),o($Vt7,$Vc3),o($Vt7,$Vd3),o($Vt7,$Ve3),o($Vt7,$Vf3),{19:[1,3365],21:[1,3368],22:3364,83:3363,224:3366,225:[1,3367]},{203:[1,3371],204:3369,205:[1,3370]},o($VC3,$VX5),o($VC3,$VY5),o($VC3,$VZ5),o($VC3,$Vq),o($VC3,$Vr),o($VC3,$Vo4),o($VC3,$Vp4),o($VC3,$Vq4),o($VC3,$Vt),o($VC3,$Vu),o($VC3,$Vr4),o($VC3,$Vs4,{212:3372,213:3373,107:[1,3374]}),o($VC3,$Vt4),o($VC3,$Vu4),o($VC3,$Vv4),o($VC3,$Vw4),o($VC3,$Vx4),o($VC3,$Vy4),o($VC3,$Vz4),o($VC3,$VA4),o($VC3,$VB4),o($Vu7,$Vc3),o($Vu7,$Vd3),o($Vu7,$Ve3),o($Vu7,$Vf3),o($V74,$VU8),o($VV6,$VJ3),o($V74,$VK3,{31:3375,203:[1,3376]}),{19:$VL3,21:$VM3,22:619,124:3377,209:$VN3,224:622,225:$VO3},o($V17,$VV8),o($V37,$V47,{56:3378}),o($VC,$VD,{59:3379,69:3380,71:3381,72:3382,88:3385,90:3386,83:3388,84:3389,85:3390,74:3391,40:3392,91:3396,22:3397,87:3399,114:3400,95:3404,224:3407,101:3408,103:3409,19:[1,3406],21:[1,3411],65:[1,3383],67:[1,3384],75:[1,3401],76:[1,3402],77:[1,3403],81:[1,3387],92:[1,3393],93:[1,3394],94:[1,3395],97:$VW8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,158:[1,3398],225:[1,3410]}),o($V37,$VX8),o($VC,$VD,{59:3412,69:3413,71:3414,72:3415,88:3418,90:3419,83:3421,84:3422,85:3423,74:3424,40:3425,91:3429,22:3430,87:3432,114:3433,95:3437,224:3440,101:3441,103:3442,19:[1,3439],21:[1,3444],65:[1,3416],67:[1,3417],75:[1,3434],76:[1,3435],77:[1,3436],81:[1,3420],92:[1,3426],93:[1,3427],94:[1,3428],97:$VY8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,158:[1,3431],225:[1,3443]}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:3445,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($V37,$VR1),o($V37,$Vl),o($V37,$Vm),o($V37,$Vq),o($V37,$Vr),o($V37,$Vs),o($V37,$Vt),o($V37,$Vu),o($V37,$Vx2,{95:2521,91:3446,97:$VH7,98:$VL,99:$VM,100:$VN}),o($VE8,$Vy2),o($VE8,$V73),o($V37,$VZ8),o($VJ7,$VR3),o($VL7,$VS3),o($VL7,$VT3),o($VL7,$VU3),{96:[1,3447]},o($VL7,$VH1),{96:[1,3449],102:3448,104:[1,3450],105:[1,3451],106:3452,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,3453]},o($VL7,$Vl4),{117:[1,3454]},{19:[1,3457],21:[1,3460],22:3456,83:3455,224:3458,225:[1,3459]},o($V74,$V_8),o($VG8,$Vn1,{78:3461}),o($VG8,$Vw7),o($VG8,$Vx7),o($VG8,$Vy7),o($VG8,$Vz7),o($VG8,$VA7),o($VL8,$VB7,{53:3462,47:[1,3463]}),o($VM8,$VC7,{57:3464,49:[1,3465]}),o($VN8,$VD7),o($VN8,$VE7,{70:3466,72:3467,74:3468,40:3469,114:3470,75:[1,3471],76:[1,3472],77:[1,3473],115:$VD,120:$VD,122:$VD}),o($VN8,$VF7),o($VN8,$VG7,{73:3474,69:3475,88:3476,90:3477,91:3481,95:3482,92:[1,3478],93:[1,3479],94:[1,3480],97:$V$8,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:3484,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VN8,$VI7),o($V09,$Vr1,{89:3485}),o($V19,$Vs1,{95:3144,91:3486,97:$VO8,98:$VL,99:$VM,100:$VN}),o($V29,$Vu1,{82:3487}),o($V29,$Vu1,{82:3488}),o($V29,$Vu1,{82:3489}),o($VN8,$Vv1,{101:3148,103:3149,87:3490,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($V39,$VN7),o($V39,$VO7),o($V09,$Vy1),o($V09,$Vz1),o($V09,$VA1),o($V09,$VB1),o($V29,$VC1),o($VD1,$VE1,{159:3491}),o($V49,$VG1),{115:[1,3492],118:195,119:196,120:$Vw1,122:$Vx1},o($V39,$V11),o($V39,$V21),{19:[1,3496],21:[1,3500],22:3494,32:3493,210:3495,224:3497,225:[1,3499],226:[1,3498]},{96:[1,3501]},o($V09,$VH1),o($V29,$Vq),o($V29,$Vr),{96:[1,3503],102:3502,104:[1,3504],105:[1,3505],106:3506,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,3507]},o($V29,$Vt),o($V29,$Vu),o($VG8,$Vn1,{78:3508}),{66:[1,3509],135:$VQ7,193:2559},{19:$Vl6,21:$Vm6,22:1563,145:3510,210:1564,224:1566,225:$Vn6,226:$Vo6},{19:$Vl6,21:$Vm6,22:1563,145:3511,210:1564,224:1566,225:$Vn6,226:$Vo6},o($V67,[2,226]),{19:[1,3515],21:[1,3519],22:3513,145:3512,210:3514,224:3516,225:[1,3518],226:[1,3517]},{65:[1,3520]},{65:[1,3521]},{66:[1,3522]},{66:[1,3523]},o($V74,$VS7),o($V74,$VT7),o($Va1,$VQ3),{117:[1,3524]},o($Va1,$VI3),o($Vl2,$VR3),o($Vs2,$VS4),{19:$Vn,21:$Vo,22:3525,224:52,225:$Vp},{19:$V59,21:$V69,22:3527,96:[1,3538],104:[1,3539],105:[1,3540],106:3537,178:3528,201:3526,206:3531,207:3532,208:3533,211:3536,214:[1,3541],215:[1,3542],216:[1,3547],217:[1,3548],218:[1,3549],219:[1,3550],220:[1,3543],221:[1,3544],222:[1,3545],223:[1,3546],224:3530,225:$V79},o($Vu2,$VS4),{19:$Vn,21:$Vo,22:3551,224:52,225:$Vp},{19:$V89,21:$V99,22:3553,96:[1,3564],104:[1,3565],105:[1,3566],106:3563,178:3554,201:3552,206:3557,207:3558,208:3559,211:3562,214:[1,3567],215:[1,3568],216:[1,3573],217:[1,3574],218:[1,3575],219:[1,3576],220:[1,3569],221:[1,3570],222:[1,3571],223:[1,3572],224:3556,225:$Va9},o($Vt1,$V73),o($Vt1,$V83),o($Vt1,$V93),o($Vt1,$Va3),o($Vt1,$Vb3),{107:[1,3577]},o($Vt1,$Vg3),o($Vw2,$VS4),{19:$Vn,21:$Vo,22:3578,224:52,225:$Vp},{19:$Vb9,21:$Vc9,22:3580,96:[1,3591],104:[1,3592],105:[1,3593],106:3590,178:3581,201:3579,206:3584,207:3585,208:3586,211:3589,214:[1,3594],215:[1,3595],216:[1,3600],217:[1,3601],218:[1,3602],219:[1,3603],220:[1,3596],221:[1,3597],222:[1,3598],223:[1,3599],224:3583,225:$Vd9},o($Vp1,$V15),o($VF1,$VM5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Vm1,$Vt6),o($Vm1,$VC1),o($Vo1,$Vt6),o($Vo1,$VC1),o($Vp1,$Vt6),o($Vp1,$VC1),o($Vm1,$Vt6),o($Vm1,$VC1),o($Vo1,$Vt6),o($Vo1,$VC1),o($Vp1,$Vt6),o($Vp1,$VC1),o($Vu2,$Vt2,{80:3223,202:3224,79:3604,200:$VQ8}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:3605,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($Vu2,$Vt2,{80:3223,202:3224,79:3606,200:$VQ8}),o($Vo1,$Vx2,{95:2675,91:3607,97:$VW7,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V73),o($Va1,$VJ4),o($VH3,$VI3),o($Vm1,$VJ3),o($VH3,$VK3,{31:3608,203:[1,3609]}),{19:$VL3,21:$VM3,22:619,124:3610,209:$VN3,224:622,225:$VO3},o($Va1,$VP3),o($Vo1,$VJ3),o($Va1,$VK3,{31:3611,203:[1,3612]}),{19:$VL3,21:$VM3,22:619,124:3613,209:$VN3,224:622,225:$VO3},o($Vq1,$VR3),o($Vt1,$VS3),o($Vt1,$VT3),o($Vt1,$VU3),{96:[1,3614]},o($Vt1,$VH1),{96:[1,3616],102:3615,104:[1,3617],105:[1,3618],106:3619,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,3620]},o($Vc2,$VQ3),o($Vp1,$VJ3),o($Vc2,$VK3,{31:3621,203:[1,3622]}),{19:$VL3,21:$VM3,22:619,124:3623,209:$VN3,224:622,225:$VO3},o($Vt1,$Vl4),{117:[1,3624]},{19:[1,3627],21:[1,3630],22:3626,83:3625,224:3628,225:[1,3629]},o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$VK5),o($Vm1,$VL5),{19:$VX7,21:$VY7,22:3632,83:3631,224:2710,225:$VZ7},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$VK5),o($Vo1,$VL5),{19:$V_7,21:$V$7,22:3634,83:3633,224:2736,225:$V08},o($Vt1,$VM5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$VK5),o($Vp1,$VL5),{19:$V18,21:$V28,22:3636,83:3635,224:2763,225:$V38},o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$VK5),o($Vm1,$VL5),{19:$V48,21:$V58,22:3638,83:3637,224:2790,225:$V68},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$VK5),o($Vo1,$VL5),{19:$V78,21:$V88,22:3640,83:3639,224:2816,225:$V98},o($Vt1,$VM5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$VK5),o($Vp1,$VL5),{19:$Va8,21:$Vb8,22:3642,83:3641,224:2843,225:$Vc8},o($VM4,$Vt2,{80:3309,202:3310,79:3643,200:$VS8}),o($Vy3,$VR1),o($Vy3,$Vl),o($Vy3,$Vm),o($Vy3,$Vq),o($Vy3,$Vr),o($Vy3,$Vs),o($Vy3,$Vt),o($Vy3,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:3644,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($VM4,$Vt2,{80:3309,202:3310,79:3645,200:$VS8}),o($VB3,$Vx2,{95:2888,91:3646,97:$Vd8,98:$VL,99:$VM,100:$VN}),o($VK4,$Vy2),o($VK4,$V73),o($Vy3,$VJ4),o($VT5,$VI3),o($VA3,$VJ3),o($VT5,$VK3,{31:3647,203:[1,3648]}),{19:$VL3,21:$VM3,22:619,124:3649,209:$VN3,224:622,225:$VO3},o($Vy3,$VP3),o($VB3,$VJ3),o($Vy3,$VK3,{31:3650,203:[1,3651]}),{19:$VL3,21:$VM3,22:619,124:3652,209:$VN3,224:622,225:$VO3},o($VD3,$VR3),o($VE3,$VS3),o($VE3,$VT3),o($VE3,$VU3),{96:[1,3653]},o($VE3,$VH1),{96:[1,3655],102:3654,104:[1,3656],105:[1,3657],106:3658,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,3659]},o($VU5,$VQ3),o($VC3,$VJ3),o($VU5,$VK3,{31:3660,203:[1,3661]}),{19:$VL3,21:$VM3,22:619,124:3662,209:$VN3,224:622,225:$VO3},o($VE3,$Vl4),{117:[1,3663]},{19:[1,3666],21:[1,3669],22:3665,83:3664,224:3667,225:[1,3668]},o($VL4,$VS1),o($VL4,$VT1),o($VL4,$VU1),o($VA3,$VK5),o($VA3,$VL5),{19:$Ve8,21:$Vf8,22:3671,83:3670,224:2923,225:$Vg8},o($VM4,$VS1),o($VM4,$VT1),o($VM4,$VU1),o($VB3,$VK5),o($VB3,$VL5),{19:$Vh8,21:$Vi8,22:3673,83:3672,224:2949,225:$Vj8},o($VE3,$VM5),o($VE3,$VC1),o($VE3,$Vq),o($VE3,$Vr),o($VE3,$Vt),o($VE3,$Vu),o($VO4,$VS1),o($VO4,$VT1),o($VO4,$VU1),o($VC3,$VK5),o($VC3,$VL5),{19:$Vk8,21:$Vl8,22:3675,83:3674,224:2976,225:$Vm8},o($VL4,$VS1),o($VL4,$VT1),o($VL4,$VU1),o($VA3,$VK5),o($VA3,$VL5),{19:$Vn8,21:$Vo8,22:3677,83:3676,224:3003,225:$Vp8},o($VM4,$VS1),o($VM4,$VT1),o($VM4,$VU1),o($VB3,$VK5),o($VB3,$VL5),{19:$Vq8,21:$Vr8,22:3679,83:3678,224:3029,225:$Vs8},o($VE3,$VM5),o($VE3,$VC1),o($VE3,$Vq),o($VE3,$Vr),o($VE3,$Vt),o($VE3,$Vu),o($VO4,$VS1),o($VO4,$VT1),o($VO4,$VU1),o($VC3,$VK5),o($VC3,$VL5),{19:$Vt8,21:$Vu8,22:3681,83:3680,224:3056,225:$Vv8},o($Vw8,$VS4),{19:$Vn,21:$Vo,22:3682,224:52,225:$Vp},{19:$Ve9,21:$Vf9,22:3684,96:[1,3695],104:[1,3696],105:[1,3697],106:3694,178:3685,201:3683,206:3688,207:3689,208:3690,211:3693,214:[1,3698],215:[1,3699],216:[1,3704],217:[1,3705],218:[1,3706],219:[1,3707],220:[1,3700],221:[1,3701],222:[1,3702],223:[1,3703],224:3687,225:$Vg9},o($V17,$VC7,{57:3708,49:[1,3709]}),o($V37,$VD7),o($V37,$VE7,{70:3710,72:3711,74:3712,40:3713,114:3714,75:[1,3715],76:[1,3716],77:[1,3717],115:$VD,120:$VD,122:$VD}),o($V37,$VF7),o($V37,$VG7,{73:3718,69:3719,88:3720,90:3721,91:3725,95:3726,92:[1,3722],93:[1,3723],94:[1,3724],97:$Vh9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:3728,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($V37,$VI7),o($VJ7,$Vr1,{89:3729}),o($VK7,$Vs1,{95:3404,91:3730,97:$VW8,98:$VL,99:$VM,100:$VN}),o($VL7,$Vu1,{82:3731}),o($VL7,$Vu1,{82:3732}),o($VL7,$Vu1,{82:3733}),o($V37,$Vv1,{101:3408,103:3409,87:3734,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VM7,$VN7),o($VM7,$VO7),o($VJ7,$Vy1),o($VJ7,$Vz1),o($VJ7,$VA1),o($VJ7,$VB1),o($VL7,$VC1),o($VD1,$VE1,{159:3735}),o($VP7,$VG1),{115:[1,3736],118:195,119:196,120:$Vw1,122:$Vx1},o($VM7,$V11),o($VM7,$V21),{19:[1,3740],21:[1,3744],22:3738,32:3737,210:3739,224:3741,225:[1,3743],226:[1,3742]},{96:[1,3745]},o($VJ7,$VH1),o($VL7,$Vq),o($VL7,$Vr),{96:[1,3747],102:3746,104:[1,3748],105:[1,3749],106:3750,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,3751]},o($VL7,$Vt),o($VL7,$Vu),o($V37,$VD7),o($V37,$VE7,{70:3752,72:3753,74:3754,40:3755,114:3756,75:[1,3757],76:[1,3758],77:[1,3759],115:$VD,120:$VD,122:$VD}),o($V37,$VF7),o($V37,$VG7,{73:3760,69:3761,88:3762,90:3763,91:3767,95:3768,92:[1,3764],93:[1,3765],94:[1,3766],97:$Vi9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:3770,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($V37,$VI7),o($VJ7,$Vr1,{89:3771}),o($VK7,$Vs1,{95:3437,91:3772,97:$VY8,98:$VL,99:$VM,100:$VN}),o($VL7,$Vu1,{82:3773}),o($VL7,$Vu1,{82:3774}),o($VL7,$Vu1,{82:3775}),o($V37,$Vv1,{101:3441,103:3442,87:3776,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VM7,$VN7),o($VM7,$VO7),o($VJ7,$Vy1),o($VJ7,$Vz1),o($VJ7,$VA1),o($VJ7,$VB1),o($VL7,$VC1),o($VD1,$VE1,{159:3777}),o($VP7,$VG1),{115:[1,3778],118:195,119:196,120:$Vw1,122:$Vx1},o($VM7,$V11),o($VM7,$V21),{19:[1,3782],21:[1,3786],22:3780,32:3779,210:3781,224:3783,225:[1,3785],226:[1,3784]},{96:[1,3787]},o($VJ7,$VH1),o($VL7,$Vq),o($VL7,$Vr),{96:[1,3789],102:3788,104:[1,3790],105:[1,3791],106:3792,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,3793]},o($VL7,$Vt),o($VL7,$Vu),{117:[1,3794]},o($VE8,$VR3),o($VL7,$V73),o($VL7,$V83),o($VL7,$V93),o($VL7,$Va3),o($VL7,$Vb3),{107:[1,3795]},o($VL7,$Vg3),o($VM7,$V15),o($VP7,$VM5),o($VP7,$VC1),o($VP7,$Vq),o($VP7,$Vr),o($VP7,$Vt),o($VP7,$Vu),o($Vj9,$Vt2,{79:3796,80:3797,202:3798,200:$Vk9}),o($VM8,$Vy8),o($Vx,$Vg,{51:3800,55:3801,36:3802,39:$Vy}),o($VN8,$Vz8),o($Vx,$Vg,{55:3803,36:3804,39:$Vy}),o($VN8,$VA8),o($VN8,$VB8),o($VN8,$VN7),o($VN8,$VO7),{115:[1,3805],118:195,119:196,120:$Vw1,122:$Vx1},o($VN8,$V11),o($VN8,$V21),{19:[1,3809],21:[1,3813],22:3807,32:3806,210:3808,224:3810,225:[1,3812],226:[1,3811]},o($VN8,$VC8),o($VN8,$VD8),o($Vl9,$Vr1,{89:3814}),o($VN8,$Vs1,{95:3482,91:3815,97:$V$8,98:$VL,99:$VM,100:$VN}),o($Vl9,$Vy1),o($Vl9,$Vz1),o($Vl9,$VA1),o($Vl9,$VB1),{96:[1,3816]},o($Vl9,$VH1),{66:[1,3817]},o($V19,$Vx2,{95:3144,91:3818,97:$VO8,98:$VL,99:$VM,100:$VN}),o($V09,$Vy2),o($VN8,$Vz2,{86:3819,91:3820,87:3821,95:3822,101:3824,103:3825,97:$Vm9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VN8,$VB2,{86:3819,91:3820,87:3821,95:3822,101:3824,103:3825,97:$Vm9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VN8,$VC2,{86:3819,91:3820,87:3821,95:3822,101:3824,103:3825,97:$Vm9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($V49,$VD2),{19:$VQ2,21:$VR2,22:388,67:$VS2,77:$VT2,96:$VU2,104:$VV2,105:$VW2,106:400,160:[1,3826],161:383,162:384,163:385,164:386,178:389,182:$VX2,206:394,207:395,208:396,211:399,214:$VY2,215:$VZ2,216:$V_2,217:$V$2,218:$V03,219:$V13,220:$V23,221:$V33,222:$V43,223:$V53,224:393,225:$V63},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:3827,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($V39,$VR1),o($V39,$Vl),o($V39,$Vm),o($V39,$Vq),o($V39,$Vr),o($V39,$Vs),o($V39,$Vt),o($V39,$Vu),o($V09,$V73),o($V49,$V83),o($V49,$V93),o($V49,$Va3),o($V49,$Vb3),{107:[1,3828]},o($V49,$Vg3),o($Vj9,$Vt2,{80:3797,202:3798,79:3829,200:$Vk9}),o($Vc6,$VP8),{66:[1,3830]},{66:[1,3831]},o($V67,$Vn5),o($V67,$Vl5),o($V67,$Vm5),o($V67,$Vq),o($V67,$Vr),o($V67,$Vs),o($V67,$Vt),o($V67,$Vu),{144:[1,3832]},{144:[1,3833]},o($V67,$VS7),o($V67,$VT7),o($Vo1,$V15),{203:[1,3836],204:3834,205:[1,3835]},o($Vm1,$VX5),o($Vm1,$VY5),o($Vm1,$VZ5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vo4),o($Vm1,$Vp4),o($Vm1,$Vq4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vr4),o($Vm1,$Vs4,{212:3837,213:3838,107:[1,3839]}),o($Vm1,$Vt4),o($Vm1,$Vu4),o($Vm1,$Vv4),o($Vm1,$Vw4),o($Vm1,$Vx4),o($Vm1,$Vy4),o($Vm1,$Vz4),o($Vm1,$VA4),o($Vm1,$VB4),o($V_5,$Vc3),o($V_5,$Vd3),o($V_5,$Ve3),o($V_5,$Vf3),{203:[1,3842],204:3840,205:[1,3841]},o($Vo1,$VX5),o($Vo1,$VY5),o($Vo1,$VZ5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vo4),o($Vo1,$Vp4),o($Vo1,$Vq4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vr4),o($Vo1,$Vs4,{212:3843,213:3844,107:[1,3845]}),o($Vo1,$Vt4),o($Vo1,$Vu4),o($Vo1,$Vv4),o($Vo1,$Vw4),o($Vo1,$Vx4),o($Vo1,$Vy4),o($Vo1,$Vz4),o($Vo1,$VA4),o($Vo1,$VB4),o($V$5,$Vc3),o($V$5,$Vd3),o($V$5,$Ve3),o($V$5,$Vf3),{19:[1,3848],21:[1,3851],22:3847,83:3846,224:3849,225:[1,3850]},{203:[1,3854],204:3852,205:[1,3853]},o($Vp1,$VX5),o($Vp1,$VY5),o($Vp1,$VZ5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vo4),o($Vp1,$Vp4),o($Vp1,$Vq4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vr4),o($Vp1,$Vs4,{212:3855,213:3856,107:[1,3857]}),o($Vp1,$Vt4),o($Vp1,$Vu4),o($Vp1,$Vv4),o($Vp1,$Vw4),o($Vp1,$Vx4),o($Vp1,$Vy4),o($Vp1,$Vz4),o($Vp1,$VA4),o($Vp1,$VB4),o($V06,$Vc3),o($V06,$Vd3),o($V06,$Ve3),o($V06,$Vf3),o($Va1,$VQ3),{117:[1,3858]},o($Va1,$VI3),o($Vl2,$VR3),o($Vs2,$VS4),{19:$Vn,21:$Vo,22:3859,224:52,225:$Vp},{19:$Vn9,21:$Vo9,22:3861,96:[1,3872],104:[1,3873],105:[1,3874],106:3871,178:3862,201:3860,206:3865,207:3866,208:3867,211:3870,214:[1,3875],215:[1,3876],216:[1,3881],217:[1,3882],218:[1,3883],219:[1,3884],220:[1,3877],221:[1,3878],222:[1,3879],223:[1,3880],224:3864,225:$Vp9},o($Vu2,$VS4),{19:$Vn,21:$Vo,22:3885,224:52,225:$Vp},{19:$Vq9,21:$Vr9,22:3887,96:[1,3898],104:[1,3899],105:[1,3900],106:3897,178:3888,201:3886,206:3891,207:3892,208:3893,211:3896,214:[1,3901],215:[1,3902],216:[1,3907],217:[1,3908],218:[1,3909],219:[1,3910],220:[1,3903],221:[1,3904],222:[1,3905],223:[1,3906],224:3890,225:$Vs9},o($Vt1,$V73),o($Vt1,$V83),o($Vt1,$V93),o($Vt1,$Va3),o($Vt1,$Vb3),{107:[1,3911]},o($Vt1,$Vg3),o($Vw2,$VS4),{19:$Vn,21:$Vo,22:3912,224:52,225:$Vp},{19:$Vt9,21:$Vu9,22:3914,96:[1,3925],104:[1,3926],105:[1,3927],106:3924,178:3915,201:3913,206:3918,207:3919,208:3920,211:3923,214:[1,3928],215:[1,3929],216:[1,3934],217:[1,3935],218:[1,3936],219:[1,3937],220:[1,3930],221:[1,3931],222:[1,3932],223:[1,3933],224:3917,225:$Vv9},o($Vp1,$V15),o($VF1,$VM5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Vm1,$Vt6),o($Vm1,$VC1),o($Vo1,$Vt6),o($Vo1,$VC1),o($Vp1,$Vt6),o($Vp1,$VC1),o($Vm1,$Vt6),o($Vm1,$VC1),o($Vo1,$Vt6),o($Vo1,$VC1),o($Vp1,$Vt6),o($Vp1,$VC1),o($Vy3,$VQ3),{117:[1,3938]},o($Vy3,$VI3),o($VK4,$VR3),o($VL4,$VS4),{19:$Vn,21:$Vo,22:3939,224:52,225:$Vp},{19:$Vw9,21:$Vx9,22:3941,96:[1,3952],104:[1,3953],105:[1,3954],106:3951,178:3942,201:3940,206:3945,207:3946,208:3947,211:3950,214:[1,3955],215:[1,3956],216:[1,3961],217:[1,3962],218:[1,3963],219:[1,3964],220:[1,3957],221:[1,3958],222:[1,3959],223:[1,3960],224:3944,225:$Vy9},o($VM4,$VS4),{19:$Vn,21:$Vo,22:3965,224:52,225:$Vp},{19:$Vz9,21:$VA9,22:3967,96:[1,3978],104:[1,3979],105:[1,3980],106:3977,178:3968,201:3966,206:3971,207:3972,208:3973,211:3976,214:[1,3981],215:[1,3982],216:[1,3987],217:[1,3988],218:[1,3989],219:[1,3990],220:[1,3983],221:[1,3984],222:[1,3985],223:[1,3986],224:3970,225:$VB9},o($VE3,$V73),o($VE3,$V83),o($VE3,$V93),o($VE3,$Va3),o($VE3,$Vb3),{107:[1,3991]},o($VE3,$Vg3),o($VO4,$VS4),{19:$Vn,21:$Vo,22:3992,224:52,225:$Vp},{19:$VC9,21:$VD9,22:3994,96:[1,4005],104:[1,4006],105:[1,4007],106:4004,178:3995,201:3993,206:3998,207:3999,208:4000,211:4003,214:[1,4008],215:[1,4009],216:[1,4014],217:[1,4015],218:[1,4016],219:[1,4017],220:[1,4010],221:[1,4011],222:[1,4012],223:[1,4013],224:3997,225:$VE9},o($VC3,$V15),o($VF3,$VM5),o($VF3,$VC1),o($VF3,$Vq),o($VF3,$Vr),o($VF3,$Vt),o($VF3,$Vu),o($VA3,$Vt6),o($VA3,$VC1),o($VB3,$Vt6),o($VB3,$VC1),o($VC3,$Vt6),o($VC3,$VC1),o($VA3,$Vt6),o($VA3,$VC1),o($VB3,$Vt6),o($VB3,$VC1),o($VC3,$Vt6),o($VC3,$VC1),{203:[1,4020],204:4018,205:[1,4019]},o($VV6,$VX5),o($VV6,$VY5),o($VV6,$VZ5),o($VV6,$Vq),o($VV6,$Vr),o($VV6,$Vo4),o($VV6,$Vp4),o($VV6,$Vq4),o($VV6,$Vt),o($VV6,$Vu),o($VV6,$Vr4),o($VV6,$Vs4,{212:4021,213:4022,107:[1,4023]}),o($VV6,$Vt4),o($VV6,$Vu4),o($VV6,$Vv4),o($VV6,$Vw4),o($VV6,$Vx4),o($VV6,$Vy4),o($VV6,$Vz4),o($VV6,$VA4),o($VV6,$VB4),o($VF9,$Vc3),o($VF9,$Vd3),o($VF9,$Ve3),o($VF9,$Vf3),o($V37,$Vz8),o($Vx,$Vg,{55:4024,36:4025,39:$Vy}),o($V37,$VA8),o($V37,$VB8),o($V37,$VN7),o($V37,$VO7),{115:[1,4026],118:195,119:196,120:$Vw1,122:$Vx1},o($V37,$V11),o($V37,$V21),{19:[1,4030],21:[1,4034],22:4028,32:4027,210:4029,224:4031,225:[1,4033],226:[1,4032]},o($V37,$VC8),o($V37,$VD8),o($VE8,$Vr1,{89:4035}),o($V37,$Vs1,{95:3726,91:4036,97:$Vh9,98:$VL,99:$VM,100:$VN}),o($VE8,$Vy1),o($VE8,$Vz1),o($VE8,$VA1),o($VE8,$VB1),{96:[1,4037]},o($VE8,$VH1),{66:[1,4038]},o($VK7,$Vx2,{95:3404,91:4039,97:$VW8,98:$VL,99:$VM,100:$VN}),o($VJ7,$Vy2),o($V37,$Vz2,{86:4040,91:4041,87:4042,95:4043,101:4045,103:4046,97:$VG9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($V37,$VB2,{86:4040,91:4041,87:4042,95:4043,101:4045,103:4046,97:$VG9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($V37,$VC2,{86:4040,91:4041,87:4042,95:4043,101:4045,103:4046,97:$VG9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VP7,$VD2),{19:$VQ2,21:$VR2,22:388,67:$VS2,77:$VT2,96:$VU2,104:$VV2,105:$VW2,106:400,160:[1,4047],161:383,162:384,163:385,164:386,178:389,182:$VX2,206:394,207:395,208:396,211:399,214:$VY2,215:$VZ2,216:$V_2,217:$V$2,218:$V03,219:$V13,220:$V23,221:$V33,222:$V43,223:$V53,224:393,225:$V63},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:4048,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($VM7,$VR1),o($VM7,$Vl),o($VM7,$Vm),o($VM7,$Vq),o($VM7,$Vr),o($VM7,$Vs),o($VM7,$Vt),o($VM7,$Vu),o($VJ7,$V73),o($VP7,$V83),o($VP7,$V93),o($VP7,$Va3),o($VP7,$Vb3),{107:[1,4049]},o($VP7,$Vg3),o($V37,$VA8),o($V37,$VB8),o($V37,$VN7),o($V37,$VO7),{115:[1,4050],118:195,119:196,120:$Vw1,122:$Vx1},o($V37,$V11),o($V37,$V21),{19:[1,4054],21:[1,4058],22:4052,32:4051,210:4053,224:4055,225:[1,4057],226:[1,4056]},o($V37,$VC8),o($V37,$VD8),o($VE8,$Vr1,{89:4059}),o($V37,$Vs1,{95:3768,91:4060,97:$Vi9,98:$VL,99:$VM,100:$VN}),o($VE8,$Vy1),o($VE8,$Vz1),o($VE8,$VA1),o($VE8,$VB1),{96:[1,4061]},o($VE8,$VH1),{66:[1,4062]},o($VK7,$Vx2,{95:3437,91:4063,97:$VY8,98:$VL,99:$VM,100:$VN}),o($VJ7,$Vy2),o($V37,$Vz2,{86:4064,91:4065,87:4066,95:4067,101:4069,103:4070,97:$VH9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($V37,$VB2,{86:4064,91:4065,87:4066,95:4067,101:4069,103:4070,97:$VH9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($V37,$VC2,{86:4064,91:4065,87:4066,95:4067,101:4069,103:4070,97:$VH9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VP7,$VD2),{19:$VQ2,21:$VR2,22:388,67:$VS2,77:$VT2,96:$VU2,104:$VV2,105:$VW2,106:400,160:[1,4071],161:383,162:384,163:385,164:386,178:389,182:$VX2,206:394,207:395,208:396,211:399,214:$VY2,215:$VZ2,216:$V_2,217:$V$2,218:$V03,219:$V13,220:$V23,221:$V33,222:$V43,223:$V53,224:393,225:$V63},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:4072,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($VM7,$VR1),o($VM7,$Vl),o($VM7,$Vm),o($VM7,$Vq),o($VM7,$Vr),o($VM7,$Vs),o($VM7,$Vt),o($VM7,$Vu),o($VJ7,$V73),o($VP7,$V83),o($VP7,$V93),o($VP7,$Va3),o($VP7,$Vb3),{107:[1,4073]},o($VP7,$Vg3),o($V37,$V15),{19:[1,4076],21:[1,4079],22:4075,83:4074,224:4077,225:[1,4078]},o($Vc6,$VU8),o($VG8,$VJ3),o($Vc6,$VK3,{31:4080,203:[1,4081]}),{19:$VL3,21:$VM3,22:619,124:4082,209:$VN3,224:622,225:$VO3},o($VM8,$VV8),o($VN8,$V47,{56:4083}),o($VC,$VD,{59:4084,69:4085,71:4086,72:4087,88:4090,90:4091,83:4093,84:4094,85:4095,74:4096,40:4097,91:4101,22:4102,87:4104,114:4105,95:4109,224:4112,101:4113,103:4114,19:[1,4111],21:[1,4116],65:[1,4088],67:[1,4089],75:[1,4106],76:[1,4107],77:[1,4108],81:[1,4092],92:[1,4098],93:[1,4099],94:[1,4100],97:$VI9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,158:[1,4103],225:[1,4115]}),o($VN8,$VX8),o($VC,$VD,{59:4117,69:4118,71:4119,72:4120,88:4123,90:4124,83:4126,84:4127,85:4128,74:4129,40:4130,91:4134,22:4135,87:4137,114:4138,95:4142,224:4145,101:4146,103:4147,19:[1,4144],21:[1,4149],65:[1,4121],67:[1,4122],75:[1,4139],76:[1,4140],77:[1,4141],81:[1,4125],92:[1,4131],93:[1,4132],94:[1,4133],97:$VJ9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,158:[1,4136],225:[1,4148]}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:4150,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($VN8,$VR1),o($VN8,$Vl),o($VN8,$Vm),o($VN8,$Vq),o($VN8,$Vr),o($VN8,$Vs),o($VN8,$Vt),o($VN8,$Vu),o($VN8,$Vx2,{95:3482,91:4151,97:$V$8,98:$VL,99:$VM,100:$VN}),o($Vl9,$Vy2),o($Vl9,$V73),o($VN8,$VZ8),o($V09,$VR3),o($V29,$VS3),o($V29,$VT3),o($V29,$VU3),{96:[1,4152]},o($V29,$VH1),{96:[1,4154],102:4153,104:[1,4155],105:[1,4156],106:4157,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,4158]},o($V29,$Vl4),{117:[1,4159]},{19:[1,4162],21:[1,4165],22:4161,83:4160,224:4163,225:[1,4164]},o($Vc6,$V_8),o($Vc6,$VS7),o($Vc6,$VT7),{19:$Vl6,21:$Vm6,22:1563,145:4166,210:1564,224:1566,225:$Vn6,226:$Vo6},{19:$Vl6,21:$Vm6,22:1563,145:4167,210:1564,224:1566,225:$Vn6,226:$Vo6},o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$VK5),o($Vm1,$VL5),{19:$V59,21:$V69,22:4169,83:4168,224:3530,225:$V79},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$VK5),o($Vo1,$VL5),{19:$V89,21:$V99,22:4171,83:4170,224:3556,225:$Va9},o($Vt1,$VM5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$VK5),o($Vp1,$VL5),{19:$Vb9,21:$Vc9,22:4173,83:4172,224:3583,225:$Vd9},o($Vo1,$V15),{203:[1,4176],204:4174,205:[1,4175]},o($Vm1,$VX5),o($Vm1,$VY5),o($Vm1,$VZ5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vo4),o($Vm1,$Vp4),o($Vm1,$Vq4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vr4),o($Vm1,$Vs4,{212:4177,213:4178,107:[1,4179]}),o($Vm1,$Vt4),o($Vm1,$Vu4),o($Vm1,$Vv4),o($Vm1,$Vw4),o($Vm1,$Vx4),o($Vm1,$Vy4),o($Vm1,$Vz4),o($Vm1,$VA4),o($Vm1,$VB4),o($V_5,$Vc3),o($V_5,$Vd3),o($V_5,$Ve3),o($V_5,$Vf3),{203:[1,4182],204:4180,205:[1,4181]},o($Vo1,$VX5),o($Vo1,$VY5),o($Vo1,$VZ5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vo4),o($Vo1,$Vp4),o($Vo1,$Vq4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vr4),o($Vo1,$Vs4,{212:4183,213:4184,107:[1,4185]}),o($Vo1,$Vt4),o($Vo1,$Vu4),o($Vo1,$Vv4),o($Vo1,$Vw4),o($Vo1,$Vx4),o($Vo1,$Vy4),o($Vo1,$Vz4),o($Vo1,$VA4),o($Vo1,$VB4),o($V$5,$Vc3),o($V$5,$Vd3),o($V$5,$Ve3),o($V$5,$Vf3),{19:[1,4188],21:[1,4191],22:4187,83:4186,224:4189,225:[1,4190]},{203:[1,4194],204:4192,205:[1,4193]},o($Vp1,$VX5),o($Vp1,$VY5),o($Vp1,$VZ5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vo4),o($Vp1,$Vp4),o($Vp1,$Vq4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vr4),o($Vp1,$Vs4,{212:4195,213:4196,107:[1,4197]}),o($Vp1,$Vt4),o($Vp1,$Vu4),o($Vp1,$Vv4),o($Vp1,$Vw4),o($Vp1,$Vx4),o($Vp1,$Vy4),o($Vp1,$Vz4),o($Vp1,$VA4),o($Vp1,$VB4),o($V06,$Vc3),o($V06,$Vd3),o($V06,$Ve3),o($V06,$Vf3),o($VB3,$V15),{203:[1,4200],204:4198,205:[1,4199]},o($VA3,$VX5),o($VA3,$VY5),o($VA3,$VZ5),o($VA3,$Vq),o($VA3,$Vr),o($VA3,$Vo4),o($VA3,$Vp4),o($VA3,$Vq4),o($VA3,$Vt),o($VA3,$Vu),o($VA3,$Vr4),o($VA3,$Vs4,{212:4201,213:4202,107:[1,4203]}),o($VA3,$Vt4),o($VA3,$Vu4),o($VA3,$Vv4),o($VA3,$Vw4),o($VA3,$Vx4),o($VA3,$Vy4),o($VA3,$Vz4),o($VA3,$VA4),o($VA3,$VB4),o($Vs7,$Vc3),o($Vs7,$Vd3),o($Vs7,$Ve3),o($Vs7,$Vf3),{203:[1,4206],204:4204,205:[1,4205]},o($VB3,$VX5),o($VB3,$VY5),o($VB3,$VZ5),o($VB3,$Vq),o($VB3,$Vr),o($VB3,$Vo4),o($VB3,$Vp4),o($VB3,$Vq4),o($VB3,$Vt),o($VB3,$Vu),o($VB3,$Vr4),o($VB3,$Vs4,{212:4207,213:4208,107:[1,4209]}),o($VB3,$Vt4),o($VB3,$Vu4),o($VB3,$Vv4),o($VB3,$Vw4),o($VB3,$Vx4),o($VB3,$Vy4),o($VB3,$Vz4),o($VB3,$VA4),o($VB3,$VB4),o($Vt7,$Vc3),o($Vt7,$Vd3),o($Vt7,$Ve3),o($Vt7,$Vf3),{19:[1,4212],21:[1,4215],22:4211,83:4210,224:4213,225:[1,4214]},{203:[1,4218],204:4216,205:[1,4217]},o($VC3,$VX5),o($VC3,$VY5),o($VC3,$VZ5),o($VC3,$Vq),o($VC3,$Vr),o($VC3,$Vo4),o($VC3,$Vp4),o($VC3,$Vq4),o($VC3,$Vt),o($VC3,$Vu),o($VC3,$Vr4),o($VC3,$Vs4,{212:4219,213:4220,107:[1,4221]}),o($VC3,$Vt4),o($VC3,$Vu4),o($VC3,$Vv4),o($VC3,$Vw4),o($VC3,$Vx4),o($VC3,$Vy4),o($VC3,$Vz4),o($VC3,$VA4),o($VC3,$VB4),o($Vu7,$Vc3),o($Vu7,$Vd3),o($Vu7,$Ve3),o($Vu7,$Vf3),o($Vw8,$VS1),o($Vw8,$VT1),o($Vw8,$VU1),o($VV6,$VK5),o($VV6,$VL5),{19:$Ve9,21:$Vf9,22:4223,83:4222,224:3687,225:$Vg9},o($V37,$VX8),o($VC,$VD,{59:4224,69:4225,71:4226,72:4227,88:4230,90:4231,83:4233,84:4234,85:4235,74:4236,40:4237,91:4241,22:4242,87:4244,114:4245,95:4249,224:4252,101:4253,103:4254,19:[1,4251],21:[1,4256],65:[1,4228],67:[1,4229],75:[1,4246],76:[1,4247],77:[1,4248],81:[1,4232],92:[1,4238],93:[1,4239],94:[1,4240],97:$VK9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,158:[1,4243],225:[1,4255]}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:4257,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($V37,$VR1),o($V37,$Vl),o($V37,$Vm),o($V37,$Vq),o($V37,$Vr),o($V37,$Vs),o($V37,$Vt),o($V37,$Vu),o($V37,$Vx2,{95:3726,91:4258,97:$Vh9,98:$VL,99:$VM,100:$VN}),o($VE8,$Vy2),o($VE8,$V73),o($V37,$VZ8),o($VJ7,$VR3),o($VL7,$VS3),o($VL7,$VT3),o($VL7,$VU3),{96:[1,4259]},o($VL7,$VH1),{96:[1,4261],102:4260,104:[1,4262],105:[1,4263],106:4264,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,4265]},o($VL7,$Vl4),{117:[1,4266]},{19:[1,4269],21:[1,4272],22:4268,83:4267,224:4270,225:[1,4271]},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:4273,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($V37,$VR1),o($V37,$Vl),o($V37,$Vm),o($V37,$Vq),o($V37,$Vr),o($V37,$Vs),o($V37,$Vt),o($V37,$Vu),o($V37,$Vx2,{95:3768,91:4274,97:$Vi9,98:$VL,99:$VM,100:$VN}),o($VE8,$Vy2),o($VE8,$V73),o($V37,$VZ8),o($VJ7,$VR3),o($VL7,$VS3),o($VL7,$VT3),o($VL7,$VU3),{96:[1,4275]},o($VL7,$VH1),{96:[1,4277],102:4276,104:[1,4278],105:[1,4279],106:4280,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,4281]},o($VL7,$Vl4),{117:[1,4282]},{19:[1,4285],21:[1,4288],22:4284,83:4283,224:4286,225:[1,4287]},o($VL7,$VM5),o($VL7,$VC1),o($VL7,$Vq),o($VL7,$Vr),o($VL7,$Vt),o($VL7,$Vu),o($Vj9,$VS4),{19:$Vn,21:$Vo,22:4289,224:52,225:$Vp},{19:$VL9,21:$VM9,22:4291,96:[1,4302],104:[1,4303],105:[1,4304],106:4301,178:4292,201:4290,206:4295,207:4296,208:4297,211:4300,214:[1,4305],215:[1,4306],216:[1,4311],217:[1,4312],218:[1,4313],219:[1,4314],220:[1,4307],221:[1,4308],222:[1,4309],223:[1,4310],224:4294,225:$VN9},o($VM8,$VC7,{57:4315,49:[1,4316]}),o($VN8,$VD7),o($VN8,$VE7,{70:4317,72:4318,74:4319,40:4320,114:4321,75:[1,4322],76:[1,4323],77:[1,4324],115:$VD,120:$VD,122:$VD}),o($VN8,$VF7),o($VN8,$VG7,{73:4325,69:4326,88:4327,90:4328,91:4332,95:4333,92:[1,4329],93:[1,4330],94:[1,4331],97:$VO9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4335,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VN8,$VI7),o($V09,$Vr1,{89:4336}),o($V19,$Vs1,{95:4109,91:4337,97:$VI9,98:$VL,99:$VM,100:$VN}),o($V29,$Vu1,{82:4338}),o($V29,$Vu1,{82:4339}),o($V29,$Vu1,{82:4340}),o($VN8,$Vv1,{101:4113,103:4114,87:4341,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($V39,$VN7),o($V39,$VO7),o($V09,$Vy1),o($V09,$Vz1),o($V09,$VA1),o($V09,$VB1),o($V29,$VC1),o($VD1,$VE1,{159:4342}),o($V49,$VG1),{115:[1,4343],118:195,119:196,120:$Vw1,122:$Vx1},o($V39,$V11),o($V39,$V21),{19:[1,4347],21:[1,4351],22:4345,32:4344,210:4346,224:4348,225:[1,4350],226:[1,4349]},{96:[1,4352]},o($V09,$VH1),o($V29,$Vq),o($V29,$Vr),{96:[1,4354],102:4353,104:[1,4355],105:[1,4356],106:4357,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,4358]},o($V29,$Vt),o($V29,$Vu),o($VN8,$VD7),o($VN8,$VE7,{70:4359,72:4360,74:4361,40:4362,114:4363,75:[1,4364],76:[1,4365],77:[1,4366],115:$VD,120:$VD,122:$VD}),o($VN8,$VF7),o($VN8,$VG7,{73:4367,69:4368,88:4369,90:4370,91:4374,95:4375,92:[1,4371],93:[1,4372],94:[1,4373],97:$VP9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4377,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VN8,$VI7),o($V09,$Vr1,{89:4378}),o($V19,$Vs1,{95:4142,91:4379,97:$VJ9,98:$VL,99:$VM,100:$VN}),o($V29,$Vu1,{82:4380}),o($V29,$Vu1,{82:4381}),o($V29,$Vu1,{82:4382}),o($VN8,$Vv1,{101:4146,103:4147,87:4383,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($V39,$VN7),o($V39,$VO7),o($V09,$Vy1),o($V09,$Vz1),o($V09,$VA1),o($V09,$VB1),o($V29,$VC1),o($VD1,$VE1,{159:4384}),o($V49,$VG1),{115:[1,4385],118:195,119:196,120:$Vw1,122:$Vx1},o($V39,$V11),o($V39,$V21),{19:[1,4389],21:[1,4393],22:4387,32:4386,210:4388,224:4390,225:[1,4392],226:[1,4391]},{96:[1,4394]},o($V09,$VH1),o($V29,$Vq),o($V29,$Vr),{96:[1,4396],102:4395,104:[1,4397],105:[1,4398],106:4399,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,4400]},o($V29,$Vt),o($V29,$Vu),{117:[1,4401]},o($Vl9,$VR3),o($V29,$V73),o($V29,$V83),o($V29,$V93),o($V29,$Va3),o($V29,$Vb3),{107:[1,4402]},o($V29,$Vg3),o($V39,$V15),o($V49,$VM5),o($V49,$VC1),o($V49,$Vq),o($V49,$Vr),o($V49,$Vt),o($V49,$Vu),{66:[1,4403]},{66:[1,4404]},o($Vm1,$Vt6),o($Vm1,$VC1),o($Vo1,$Vt6),o($Vo1,$VC1),o($Vp1,$Vt6),o($Vp1,$VC1),o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$VK5),o($Vm1,$VL5),{19:$Vn9,21:$Vo9,22:4406,83:4405,224:3864,225:$Vp9},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$VK5),o($Vo1,$VL5),{19:$Vq9,21:$Vr9,22:4408,83:4407,224:3890,225:$Vs9},o($Vt1,$VM5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$VK5),o($Vp1,$VL5),{19:$Vt9,21:$Vu9,22:4410,83:4409,224:3917,225:$Vv9},o($VL4,$VS1),o($VL4,$VT1),o($VL4,$VU1),o($VA3,$VK5),o($VA3,$VL5),{19:$Vw9,21:$Vx9,22:4412,83:4411,224:3944,225:$Vy9},o($VM4,$VS1),o($VM4,$VT1),o($VM4,$VU1),o($VB3,$VK5),o($VB3,$VL5),{19:$Vz9,21:$VA9,22:4414,83:4413,224:3970,225:$VB9},o($VE3,$VM5),o($VE3,$VC1),o($VE3,$Vq),o($VE3,$Vr),o($VE3,$Vt),o($VE3,$Vu),o($VO4,$VS1),o($VO4,$VT1),o($VO4,$VU1),o($VC3,$VK5),o($VC3,$VL5),{19:$VC9,21:$VD9,22:4416,83:4415,224:3997,225:$VE9},o($VV6,$Vt6),o($VV6,$VC1),o($V37,$VD7),o($V37,$VE7,{70:4417,72:4418,74:4419,40:4420,114:4421,75:[1,4422],76:[1,4423],77:[1,4424],115:$VD,120:$VD,122:$VD}),o($V37,$VF7),o($V37,$VG7,{73:4425,69:4426,88:4427,90:4428,91:4432,95:4433,92:[1,4429],93:[1,4430],94:[1,4431],97:$VQ9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4435,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($V37,$VI7),o($VJ7,$Vr1,{89:4436}),o($VK7,$Vs1,{95:4249,91:4437,97:$VK9,98:$VL,99:$VM,100:$VN}),o($VL7,$Vu1,{82:4438}),o($VL7,$Vu1,{82:4439}),o($VL7,$Vu1,{82:4440}),o($V37,$Vv1,{101:4253,103:4254,87:4441,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VM7,$VN7),o($VM7,$VO7),o($VJ7,$Vy1),o($VJ7,$Vz1),o($VJ7,$VA1),o($VJ7,$VB1),o($VL7,$VC1),o($VD1,$VE1,{159:4442}),o($VP7,$VG1),{115:[1,4443],118:195,119:196,120:$Vw1,122:$Vx1},o($VM7,$V11),o($VM7,$V21),{19:[1,4447],21:[1,4451],22:4445,32:4444,210:4446,224:4448,225:[1,4450],226:[1,4449]},{96:[1,4452]},o($VJ7,$VH1),o($VL7,$Vq),o($VL7,$Vr),{96:[1,4454],102:4453,104:[1,4455],105:[1,4456],106:4457,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,4458]},o($VL7,$Vt),o($VL7,$Vu),{117:[1,4459]},o($VE8,$VR3),o($VL7,$V73),o($VL7,$V83),o($VL7,$V93),o($VL7,$Va3),o($VL7,$Vb3),{107:[1,4460]},o($VL7,$Vg3),o($VM7,$V15),o($VP7,$VM5),o($VP7,$VC1),o($VP7,$Vq),o($VP7,$Vr),o($VP7,$Vt),o($VP7,$Vu),{117:[1,4461]},o($VE8,$VR3),o($VL7,$V73),o($VL7,$V83),o($VL7,$V93),o($VL7,$Va3),o($VL7,$Vb3),{107:[1,4462]},o($VL7,$Vg3),o($VM7,$V15),o($VP7,$VM5),o($VP7,$VC1),o($VP7,$Vq),o($VP7,$Vr),o($VP7,$Vt),o($VP7,$Vu),{203:[1,4465],204:4463,205:[1,4464]},o($VG8,$VX5),o($VG8,$VY5),o($VG8,$VZ5),o($VG8,$Vq),o($VG8,$Vr),o($VG8,$Vo4),o($VG8,$Vp4),o($VG8,$Vq4),o($VG8,$Vt),o($VG8,$Vu),o($VG8,$Vr4),o($VG8,$Vs4,{212:4466,213:4467,107:[1,4468]}),o($VG8,$Vt4),o($VG8,$Vu4),o($VG8,$Vv4),o($VG8,$Vw4),o($VG8,$Vx4),o($VG8,$Vy4),o($VG8,$Vz4),o($VG8,$VA4),o($VG8,$VB4),o($VR9,$Vc3),o($VR9,$Vd3),o($VR9,$Ve3),o($VR9,$Vf3),o($VN8,$Vz8),o($Vx,$Vg,{55:4469,36:4470,39:$Vy}),o($VN8,$VA8),o($VN8,$VB8),o($VN8,$VN7),o($VN8,$VO7),{115:[1,4471],118:195,119:196,120:$Vw1,122:$Vx1},o($VN8,$V11),o($VN8,$V21),{19:[1,4475],21:[1,4479],22:4473,32:4472,210:4474,224:4476,225:[1,4478],226:[1,4477]},o($VN8,$VC8),o($VN8,$VD8),o($Vl9,$Vr1,{89:4480}),o($VN8,$Vs1,{95:4333,91:4481,97:$VO9,98:$VL,99:$VM,100:$VN}),o($Vl9,$Vy1),o($Vl9,$Vz1),o($Vl9,$VA1),o($Vl9,$VB1),{96:[1,4482]},o($Vl9,$VH1),{66:[1,4483]},o($V19,$Vx2,{95:4109,91:4484,97:$VI9,98:$VL,99:$VM,100:$VN}),o($V09,$Vy2),o($VN8,$Vz2,{86:4485,91:4486,87:4487,95:4488,101:4490,103:4491,97:$VS9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VN8,$VB2,{86:4485,91:4486,87:4487,95:4488,101:4490,103:4491,97:$VS9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VN8,$VC2,{86:4485,91:4486,87:4487,95:4488,101:4490,103:4491,97:$VS9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($V49,$VD2),{19:$VQ2,21:$VR2,22:388,67:$VS2,77:$VT2,96:$VU2,104:$VV2,105:$VW2,106:400,160:[1,4492],161:383,162:384,163:385,164:386,178:389,182:$VX2,206:394,207:395,208:396,211:399,214:$VY2,215:$VZ2,216:$V_2,217:$V$2,218:$V03,219:$V13,220:$V23,221:$V33,222:$V43,223:$V53,224:393,225:$V63},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:4493,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($V39,$VR1),o($V39,$Vl),o($V39,$Vm),o($V39,$Vq),o($V39,$Vr),o($V39,$Vs),o($V39,$Vt),o($V39,$Vu),o($V09,$V73),o($V49,$V83),o($V49,$V93),o($V49,$Va3),o($V49,$Vb3),{107:[1,4494]},o($V49,$Vg3),o($VN8,$VA8),o($VN8,$VB8),o($VN8,$VN7),o($VN8,$VO7),{115:[1,4495],118:195,119:196,120:$Vw1,122:$Vx1},o($VN8,$V11),o($VN8,$V21),{19:[1,4499],21:[1,4503],22:4497,32:4496,210:4498,224:4500,225:[1,4502],226:[1,4501]},o($VN8,$VC8),o($VN8,$VD8),o($Vl9,$Vr1,{89:4504}),o($VN8,$Vs1,{95:4375,91:4505,97:$VP9,98:$VL,99:$VM,100:$VN}),o($Vl9,$Vy1),o($Vl9,$Vz1),o($Vl9,$VA1),o($Vl9,$VB1),{96:[1,4506]},o($Vl9,$VH1),{66:[1,4507]},o($V19,$Vx2,{95:4142,91:4508,97:$VJ9,98:$VL,99:$VM,100:$VN}),o($V09,$Vy2),o($VN8,$Vz2,{86:4509,91:4510,87:4511,95:4512,101:4514,103:4515,97:$VT9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VN8,$VB2,{86:4509,91:4510,87:4511,95:4512,101:4514,103:4515,97:$VT9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VN8,$VC2,{86:4509,91:4510,87:4511,95:4512,101:4514,103:4515,97:$VT9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($V49,$VD2),{19:$VQ2,21:$VR2,22:388,67:$VS2,77:$VT2,96:$VU2,104:$VV2,105:$VW2,106:400,160:[1,4516],161:383,162:384,163:385,164:386,178:389,182:$VX2,206:394,207:395,208:396,211:399,214:$VY2,215:$VZ2,216:$V_2,217:$V$2,218:$V03,219:$V13,220:$V23,221:$V33,222:$V43,223:$V53,224:393,225:$V63},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:4517,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($V39,$VR1),o($V39,$Vl),o($V39,$Vm),o($V39,$Vq),o($V39,$Vr),o($V39,$Vs),o($V39,$Vt),o($V39,$Vu),o($V09,$V73),o($V49,$V83),o($V49,$V93),o($V49,$Va3),o($V49,$Vb3),{107:[1,4518]},o($V49,$Vg3),o($VN8,$V15),{19:[1,4521],21:[1,4524],22:4520,83:4519,224:4522,225:[1,4523]},o($V67,$VS7),o($V67,$VT7),o($Vm1,$Vt6),o($Vm1,$VC1),o($Vo1,$Vt6),o($Vo1,$VC1),o($Vp1,$Vt6),o($Vp1,$VC1),o($VA3,$Vt6),o($VA3,$VC1),o($VB3,$Vt6),o($VB3,$VC1),o($VC3,$Vt6),o($VC3,$VC1),o($V37,$VA8),o($V37,$VB8),o($V37,$VN7),o($V37,$VO7),{115:[1,4525],118:195,119:196,120:$Vw1,122:$Vx1},o($V37,$V11),o($V37,$V21),{19:[1,4529],21:[1,4533],22:4527,32:4526,210:4528,224:4530,225:[1,4532],226:[1,4531]},o($V37,$VC8),o($V37,$VD8),o($VE8,$Vr1,{89:4534}),o($V37,$Vs1,{95:4433,91:4535,97:$VQ9,98:$VL,99:$VM,100:$VN}),o($VE8,$Vy1),o($VE8,$Vz1),o($VE8,$VA1),o($VE8,$VB1),{96:[1,4536]},o($VE8,$VH1),{66:[1,4537]},o($VK7,$Vx2,{95:4249,91:4538,97:$VK9,98:$VL,99:$VM,100:$VN}),o($VJ7,$Vy2),o($V37,$Vz2,{86:4539,91:4540,87:4541,95:4542,101:4544,103:4545,97:$VU9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($V37,$VB2,{86:4539,91:4540,87:4541,95:4542,101:4544,103:4545,97:$VU9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($V37,$VC2,{86:4539,91:4540,87:4541,95:4542,101:4544,103:4545,97:$VU9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VP7,$VD2),{19:$VQ2,21:$VR2,22:388,67:$VS2,77:$VT2,96:$VU2,104:$VV2,105:$VW2,106:400,160:[1,4546],161:383,162:384,163:385,164:386,178:389,182:$VX2,206:394,207:395,208:396,211:399,214:$VY2,215:$VZ2,216:$V_2,217:$V$2,218:$V03,219:$V13,220:$V23,221:$V33,222:$V43,223:$V53,224:393,225:$V63},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:4547,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($VM7,$VR1),o($VM7,$Vl),o($VM7,$Vm),o($VM7,$Vq),o($VM7,$Vr),o($VM7,$Vs),o($VM7,$Vt),o($VM7,$Vu),o($VJ7,$V73),o($VP7,$V83),o($VP7,$V93),o($VP7,$Va3),o($VP7,$Vb3),{107:[1,4548]},o($VP7,$Vg3),o($V37,$V15),{19:[1,4551],21:[1,4554],22:4550,83:4549,224:4552,225:[1,4553]},o($V37,$V15),{19:[1,4557],21:[1,4560],22:4556,83:4555,224:4558,225:[1,4559]},o($Vj9,$VS1),o($Vj9,$VT1),o($Vj9,$VU1),o($VG8,$VK5),o($VG8,$VL5),{19:$VL9,21:$VM9,22:4562,83:4561,224:4294,225:$VN9},o($VN8,$VX8),o($VC,$VD,{59:4563,69:4564,71:4565,72:4566,88:4569,90:4570,83:4572,84:4573,85:4574,74:4575,40:4576,91:4580,22:4581,87:4583,114:4584,95:4588,224:4591,101:4592,103:4593,19:[1,4590],21:[1,4595],65:[1,4567],67:[1,4568],75:[1,4585],76:[1,4586],77:[1,4587],81:[1,4571],92:[1,4577],93:[1,4578],94:[1,4579],97:$VV9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,158:[1,4582],225:[1,4594]}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:4596,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($VN8,$VR1),o($VN8,$Vl),o($VN8,$Vm),o($VN8,$Vq),o($VN8,$Vr),o($VN8,$Vs),o($VN8,$Vt),o($VN8,$Vu),o($VN8,$Vx2,{95:4333,91:4597,97:$VO9,98:$VL,99:$VM,100:$VN}),o($Vl9,$Vy2),o($Vl9,$V73),o($VN8,$VZ8),o($V09,$VR3),o($V29,$VS3),o($V29,$VT3),o($V29,$VU3),{96:[1,4598]},o($V29,$VH1),{96:[1,4600],102:4599,104:[1,4601],105:[1,4602],106:4603,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,4604]},o($V29,$Vl4),{117:[1,4605]},{19:[1,4608],21:[1,4611],22:4607,83:4606,224:4609,225:[1,4610]},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:4612,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($VN8,$VR1),o($VN8,$Vl),o($VN8,$Vm),o($VN8,$Vq),o($VN8,$Vr),o($VN8,$Vs),o($VN8,$Vt),o($VN8,$Vu),o($VN8,$Vx2,{95:4375,91:4613,97:$VP9,98:$VL,99:$VM,100:$VN}),o($Vl9,$Vy2),o($Vl9,$V73),o($VN8,$VZ8),o($V09,$VR3),o($V29,$VS3),o($V29,$VT3),o($V29,$VU3),{96:[1,4614]},o($V29,$VH1),{96:[1,4616],102:4615,104:[1,4617],105:[1,4618],106:4619,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,4620]},o($V29,$Vl4),{117:[1,4621]},{19:[1,4624],21:[1,4627],22:4623,83:4622,224:4625,225:[1,4626]},o($V29,$VM5),o($V29,$VC1),o($V29,$Vq),o($V29,$Vr),o($V29,$Vt),o($V29,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:4628,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($V37,$VR1),o($V37,$Vl),o($V37,$Vm),o($V37,$Vq),o($V37,$Vr),o($V37,$Vs),o($V37,$Vt),o($V37,$Vu),o($V37,$Vx2,{95:4433,91:4629,97:$VQ9,98:$VL,99:$VM,100:$VN}),o($VE8,$Vy2),o($VE8,$V73),o($V37,$VZ8),o($VJ7,$VR3),o($VL7,$VS3),o($VL7,$VT3),o($VL7,$VU3),{96:[1,4630]},o($VL7,$VH1),{96:[1,4632],102:4631,104:[1,4633],105:[1,4634],106:4635,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,4636]},o($VL7,$Vl4),{117:[1,4637]},{19:[1,4640],21:[1,4643],22:4639,83:4638,224:4641,225:[1,4642]},o($VL7,$VM5),o($VL7,$VC1),o($VL7,$Vq),o($VL7,$Vr),o($VL7,$Vt),o($VL7,$Vu),o($VL7,$VM5),o($VL7,$VC1),o($VL7,$Vq),o($VL7,$Vr),o($VL7,$Vt),o($VL7,$Vu),o($VG8,$Vt6),o($VG8,$VC1),o($VN8,$VD7),o($VN8,$VE7,{70:4644,72:4645,74:4646,40:4647,114:4648,75:[1,4649],76:[1,4650],77:[1,4651],115:$VD,120:$VD,122:$VD}),o($VN8,$VF7),o($VN8,$VG7,{73:4652,69:4653,88:4654,90:4655,91:4659,95:4660,92:[1,4656],93:[1,4657],94:[1,4658],97:$VW9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4662,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VN8,$VI7),o($V09,$Vr1,{89:4663}),o($V19,$Vs1,{95:4588,91:4664,97:$VV9,98:$VL,99:$VM,100:$VN}),o($V29,$Vu1,{82:4665}),o($V29,$Vu1,{82:4666}),o($V29,$Vu1,{82:4667}),o($VN8,$Vv1,{101:4592,103:4593,87:4668,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($V39,$VN7),o($V39,$VO7),o($V09,$Vy1),o($V09,$Vz1),o($V09,$VA1),o($V09,$VB1),o($V29,$VC1),o($VD1,$VE1,{159:4669}),o($V49,$VG1),{115:[1,4670],118:195,119:196,120:$Vw1,122:$Vx1},o($V39,$V11),o($V39,$V21),{19:[1,4674],21:[1,4678],22:4672,32:4671,210:4673,224:4675,225:[1,4677],226:[1,4676]},{96:[1,4679]},o($V09,$VH1),o($V29,$Vq),o($V29,$Vr),{96:[1,4681],102:4680,104:[1,4682],105:[1,4683],106:4684,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,4685]},o($V29,$Vt),o($V29,$Vu),{117:[1,4686]},o($Vl9,$VR3),o($V29,$V73),o($V29,$V83),o($V29,$V93),o($V29,$Va3),o($V29,$Vb3),{107:[1,4687]},o($V29,$Vg3),o($V39,$V15),o($V49,$VM5),o($V49,$VC1),o($V49,$Vq),o($V49,$Vr),o($V49,$Vt),o($V49,$Vu),{117:[1,4688]},o($Vl9,$VR3),o($V29,$V73),o($V29,$V83),o($V29,$V93),o($V29,$Va3),o($V29,$Vb3),{107:[1,4689]},o($V29,$Vg3),o($V39,$V15),o($V49,$VM5),o($V49,$VC1),o($V49,$Vq),o($V49,$Vr),o($V49,$Vt),o($V49,$Vu),{117:[1,4690]},o($VE8,$VR3),o($VL7,$V73),o($VL7,$V83),o($VL7,$V93),o($VL7,$Va3),o($VL7,$Vb3),{107:[1,4691]},o($VL7,$Vg3),o($VM7,$V15),o($VP7,$VM5),o($VP7,$VC1),o($VP7,$Vq),o($VP7,$Vr),o($VP7,$Vt),o($VP7,$Vu),o($VN8,$VA8),o($VN8,$VB8),o($VN8,$VN7),o($VN8,$VO7),{115:[1,4692],118:195,119:196,120:$Vw1,122:$Vx1},o($VN8,$V11),o($VN8,$V21),{19:[1,4696],21:[1,4700],22:4694,32:4693,210:4695,224:4697,225:[1,4699],226:[1,4698]},o($VN8,$VC8),o($VN8,$VD8),o($Vl9,$Vr1,{89:4701}),o($VN8,$Vs1,{95:4660,91:4702,97:$VW9,98:$VL,99:$VM,100:$VN}),o($Vl9,$Vy1),o($Vl9,$Vz1),o($Vl9,$VA1),o($Vl9,$VB1),{96:[1,4703]},o($Vl9,$VH1),{66:[1,4704]},o($V19,$Vx2,{95:4588,91:4705,97:$VV9,98:$VL,99:$VM,100:$VN}),o($V09,$Vy2),o($VN8,$Vz2,{86:4706,91:4707,87:4708,95:4709,101:4711,103:4712,97:$VX9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VN8,$VB2,{86:4706,91:4707,87:4708,95:4709,101:4711,103:4712,97:$VX9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VN8,$VC2,{86:4706,91:4707,87:4708,95:4709,101:4711,103:4712,97:$VX9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($V49,$VD2),{19:$VQ2,21:$VR2,22:388,67:$VS2,77:$VT2,96:$VU2,104:$VV2,105:$VW2,106:400,160:[1,4713],161:383,162:384,163:385,164:386,178:389,182:$VX2,206:394,207:395,208:396,211:399,214:$VY2,215:$VZ2,216:$V_2,217:$V$2,218:$V03,219:$V13,220:$V23,221:$V33,222:$V43,223:$V53,224:393,225:$V63},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:4714,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($V39,$VR1),o($V39,$Vl),o($V39,$Vm),o($V39,$Vq),o($V39,$Vr),o($V39,$Vs),o($V39,$Vt),o($V39,$Vu),o($V09,$V73),o($V49,$V83),o($V49,$V93),o($V49,$Va3),o($V49,$Vb3),{107:[1,4715]},o($V49,$Vg3),o($VN8,$V15),{19:[1,4718],21:[1,4721],22:4717,83:4716,224:4719,225:[1,4720]},o($VN8,$V15),{19:[1,4724],21:[1,4727],22:4723,83:4722,224:4725,225:[1,4726]},o($V37,$V15),{19:[1,4730],21:[1,4733],22:4729,83:4728,224:4731,225:[1,4732]},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,143:367,188:369,116:4734,117:$VG2,144:$VH2,186:$VI2,197:$VJ2,198:$VK2,199:$VL2}),o($VN8,$VR1),o($VN8,$Vl),o($VN8,$Vm),o($VN8,$Vq),o($VN8,$Vr),o($VN8,$Vs),o($VN8,$Vt),o($VN8,$Vu),o($VN8,$Vx2,{95:4660,91:4735,97:$VW9,98:$VL,99:$VM,100:$VN}),o($Vl9,$Vy2),o($Vl9,$V73),o($VN8,$VZ8),o($V09,$VR3),o($V29,$VS3),o($V29,$VT3),o($V29,$VU3),{96:[1,4736]},o($V29,$VH1),{96:[1,4738],102:4737,104:[1,4739],105:[1,4740],106:4741,216:$VI1,217:$VJ1,218:$VK1,219:$VL1},{96:[1,4742]},o($V29,$Vl4),{117:[1,4743]},{19:[1,4746],21:[1,4749],22:4745,83:4744,224:4747,225:[1,4748]},o($V29,$VM5),o($V29,$VC1),o($V29,$Vq),o($V29,$Vr),o($V29,$Vt),o($V29,$Vu),o($V29,$VM5),o($V29,$VC1),o($V29,$Vq),o($V29,$Vr),o($V29,$Vt),o($V29,$Vu),o($VL7,$VM5),o($VL7,$VC1),o($VL7,$Vq),o($VL7,$Vr),o($VL7,$Vt),o($VL7,$Vu),{117:[1,4750]},o($Vl9,$VR3),o($V29,$V73),o($V29,$V83),o($V29,$V93),o($V29,$Va3),o($V29,$Vb3),{107:[1,4751]},o($V29,$Vg3),o($V39,$V15),o($V49,$VM5),o($V49,$VC1),o($V49,$Vq),o($V49,$Vr),o($V49,$Vt),o($V49,$Vu),o($VN8,$V15),{19:[1,4754],21:[1,4757],22:4753,83:4752,224:4755,225:[1,4756]},o($V29,$VM5),o($V29,$VC1),o($V29,$Vq),o($V29,$Vr),o($V29,$Vt),o($V29,$Vu)];
  this.defaultActions = {6:[2,11],30:[2,1],102:[2,115],103:[2,116],104:[2,117],111:[2,128],112:[2,129],206:[2,266],207:[2,267],208:[2,268],209:[2,269],329:[2,31],357:[2,137],358:[2,141],360:[2,143],561:[2,29],562:[2,33],599:[2,30],1117:[2,141],1119:[2,143],1563:[2,254],1564:[2,255],1565:[2,274],1566:[2,275],1567:[2,278],1568:[2,276],1569:[2,277]};

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
            shapeExprs: ShExJisonParser.shapes || new Map(),
            tripleExprs: ShExJisonParser.productions || new Map()
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
case 32: case 245: case 262:
this.$ = null;
break;
case 33: case 37: case 40: case 46: case 53: case 187: case 226: case 261:
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
case 39: case 42: case 44: case 48: case 51: case 55: case 228:
this.$ = $$[$0-1].concat($$[$0]);
break;
case 43: case 47: case 50: case 54: case 227:
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
case 57: case 224:
this.$ = false;
break;
case 58: case 225:
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
case 162:
this.$ = addSourceMap($$[$0], yy);
break;
case 167:

        // t: open1dotOr1dot, !openopen1dotcloseCode1closeCode2
        this.$ = $$[$0-4];
        // Copy all of the new attributes into the encapsulated shape.
        if ("min" in $$[$0-2]) { this.$.min = $$[$0-2].min; } // t: open3groupdotclosecard23Annot3Code2
        if ("max" in $$[$0-2]) { this.$.max = $$[$0-2].max; } // t: open3groupdotclosecard23Annot3Code2
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: open3groupdotcloseAnnot3, open3groupdotclosecard23Annot3Code2
        if ($$[$0]) { this.$.semActs = "semActs" in $$[$0-4] ? $$[$0-4].semActs.concat($$[$0].semActs) : $$[$0].semActs; } // t: open3groupdotcloseCode1, !open1dotOr1dot
      
break;
case 168:
this.$ = {} // t: 1dot;
break;
case 170:

        // $$[$0]: t: 1dotCode1
	if ($$[$0-3] !== EmptyShape && false) {
	  const t = blank();
	  addShape(t, $$[$0-3], yy);
	  $$[$0-3] = t; // ShapeRef
	}
        // %6: t: 1inversedotCode1
        this.$ = extend({ type: "TripleConstraint" }, $$[$0-5] ? $$[$0-5] : {}, { predicate: $$[$0-4] }, ($$[$0-3] === EmptyShape ? {} : { valueExpr: $$[$0-3] }), $$[$0-2], $$[$0]); // t: 1dot // t: 1inversedot, 1negatedinversedot
        if ($$[$0-1].length)
          this.$["annotations"] = $$[$0-1]; // t: 1dotAnnot3 // t: 1inversedotAnnot3
      
break;
case 173:
this.$ = { min:0, max:UNBOUNDED } // t: 1cardStar;
break;
case 174:
this.$ = { min:1, max:UNBOUNDED } // t: 1cardPlus;
break;
case 175:
this.$ = { min:0, max:1 } // t: 1cardOpt;
break;
case 176:

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
case 177:
this.$ = { inverse: true } // t: 1inversedot;
break;
case 178:
this.$ = { inverse: true, negated: true } // t: 1negatedinversedot;
break;
case 179:
this.$ = { negated: true } // t: 1negateddot;
break;
case 180:
this.$ = { inverse: true, negated: true } // t: 1inversenegateddot;
break;
case 181:
this.$ = $$[$0-1] // t: 1val1IRIREF;
break;
case 182:
this.$ = [] // t: 1val1IRIREF;
break;
case 183:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1IRIREF;
break;
case 188:
this.$ = [$$[$0]] // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 189:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 190:
this.$ = [$$[$0]] // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 191:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 192:
this.$ = [$$[$0]] // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 193:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 194:
this.$ = { type: "IriStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 195:
this.$ = { type: "LiteralStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 196:
this.$ = { type: "LanguageStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 197:

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
case 198:
this.$ = [] // t: 1val1iriStem, 1val1iriStemMinusiri3;
break;
case 199:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1iriStemMinusiri3;
break;
case 200:
this.$ = $$[$0] // t: 1val1iriStemMinusiri3;
break;
case 203:
this.$ = $$[$0] ? { type: "IriStem", stem: $$[$0-1] } /* t: 1val1iriStemMinusiriStem3 */ : $$[$0-1] // t: 1val1iriStemMinusiri3;
break;
case 206:

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
case 207:
this.$ = [] // t: 1val1literalStem, 1val1literalStemMinusliteral3;
break;
case 208:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1literalStemMinusliteral3;
break;
case 209:
this.$ = $$[$0] // t: 1val1literalStemMinusliteral3;
break;
case 212:
this.$ = $$[$0] ? { type: "LiteralStem", stem: $$[$0-1].value } /* t: 1val1literalStemMinusliteral3 */ : $$[$0-1].value // t: 1val1literalStemMinusliteralStem3;
break;
case 213:

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
case 214:

        this.$ = {  // t: @@
          type: $$[$0].length ? "LanguageStemRange" : "LanguageStem",
          stem: ""
        };
        if ($$[$0].length)
          this.$["exclusions"] = $$[$0]; // t: @@
      
break;
case 215:
this.$ = [] // t: 1val1languageStem, 1val1languageStemMinuslanguage3;
break;
case 216:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1languageStemMinuslanguage3;
break;
case 217:
this.$ = $$[$0] // t: 1val1languageStemMinuslanguage3;
break;
case 220:
this.$ = $$[$0] ? { type: "LanguageStem", stem: $$[$0-1] } /* t: 1val1languageStemMinuslanguageStem3 */ : $$[$0-1] // t: 1val1languageStemMinuslanguage3;
break;
case 221:

        this.$ = { type: "Unique", focus: $$[$0-3], uniques: [$$[$0-2]].concat($$[$0-1]) };
      
break;
case 222:

        this.$ = { type: "ValueComparison", left: $$[$0-2], comparator: $$[$0-1], right: $$[$0] };
      
break;
case 233:
this.$ = { type: "TermAccessor", productionLabel: $$[$0] };
break;
case 234:
this.$ = { type: "LangtagAccessor", name: $$[$0-1] };
break;
case 235:
this.$ = { type: "DatatypeAccessor", name: $$[$0-1] };
break;
case 236:
this.$ = addSourceMap($$[$0], yy) // Inclusion // t: 2groupInclude1;
break;
case 237:
this.$ = { type: "Annotation", predicate: $$[$0-1], object: $$[$0] } // t: 1dotAnnotIRIREF;
break;
case 240:
this.$ = $$[$0].length ? { semActs: $$[$0] } : null // t: 1dotCode1/2oneOfDot;
break;
case 241:
this.$ = [] // t: 1dot, 1dotCode1;
break;
case 242:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotCode1;
break;
case 243:
this.$ = $$[$0] ? unescapeSemanticAction($$[$0-1], $$[$0]) /* t: 1dotCode1 */ : { type: "SemAct", name: $$[$0-1] } // t: 1dotNoCode1;
break;
case 250:
this.$ = RDF_TYPE // t: 1AvalA;
break;
case 256:
this.$ = createLiteral($$[$0], XSD_INTEGER) // t: 1val1INTEGER;
break;
case 257:
this.$ = createLiteral($$[$0], XSD_DECIMAL) // t: 1val1DECIMAL;
break;
case 258:
this.$ = createLiteral($$[$0], XSD_DOUBLE) // t: 1val1DOUBLE;
break;
case 260:
this.$ = $$[$0] ? extend($$[$0-1], { type: $$[$0] }) : $$[$0-1] // t: 1val1Datatype;
break;
case 264:
this.$ = { value: "true", type: XSD_BOOLEAN } // t: 1val1true;
break;
case 265:
this.$ = { value: "false", type: XSD_BOOLEAN } // t: 1val1false;
break;
case 266:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL2;
break;
case 267:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL1;
break;
case 268:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL_LONG2;
break;
case 269:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG1;
break;
case 270:
this.$ = unescapeLangString($$[$0], 1)	// t: @@;
break;
case 271:
this.$ = unescapeLangString($$[$0], 3)	// t: @@;
break;
case 272:
this.$ = unescapeLangString($$[$0], 1)	// t: 1val1LANGTAG;
break;
case 273:
this.$ = unescapeLangString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG2_with_LANGTAG;
break;
case 274:
 // t: 1dot
        const unesc = ShExUtil.unescapeText($$[$0].slice(1,-1), {});
        this.$ = ShExJisonParser._base === null || absoluteIRI.test(unesc) ? unesc : _resolveIRI(unesc)
      
break;
case 276:
 // t:1dotPNex, 1dotPNdefault, ShExParser-test.js/with pre-defined prefixes
        const namePos1 = $$[$0].indexOf(':');
        this.$ = expandPrefix($$[$0].substr(0, namePos1), yy) + ShExUtil.unescapeText($$[$0].substr(namePos1 + 1), pnameEscapeReplacements);
      
break;
case 277:
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


  this.rules = [/^(?:\s+|(#[^\u000a\u000d]*|\/\*([^*]|\*([^/]|\\\/))*\*\/))/,/^(?:(@(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*))))/,/^(?:(@((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)))/,/^(?:(@([A-Za-z])+((-([0-9A-Za-z])+))*))/,/^(?:@)/,/^(?:(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*)))/,/^(?:(\{((([+-])?([0-9])+))((,(((([+-])?([0-9])+))|\*)?))?\}))/,/^(?:(([+-])?((([0-9])+\.([0-9])*(([Ee]([+-])?([0-9])+)))|((\.)?([0-9])+(([Ee]([+-])?([0-9])+))))))/,/^(?:(([+-])?([0-9])*\.([0-9])+))/,/^(?:(([+-])?([0-9])+))/,/^(?:{ANON})/,/^(?:(<([^\u0000-\u0020<>\"{}|^`\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*>))/,/^(?:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:))/,/^(?:a\b)/,/^(?:(\/([^\u002f\u005C\u000A\u000D]|\\[nrt\\|.?*+(){}$\u002D\u005B\u005D\u005E/]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))+\/[smix]*))/,/^(?:(_:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|[0-9])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?))/,/^(?:(\{([^%\\]|\\[%\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*%\}))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"))/,/^(?:([Bb][Aa][Ss][Ee]))/,/^(?:([Pp][Rr][Ee][Ff][Ii][Xx]))/,/^(?:([iI][mM][pP][oO][rR][tT]))/,/^(?:([sS][tT][aA][rR][tT]))/,/^(?:([eE][xX][tT][eE][rR][nN][aA][lL]))/,/^(?:([Cc][Ll][Oo][Ss][Ee][Dd]))/,/^(?:([Ee][Xx][Tt][Rr][Aa]))/,/^(?:([Ll][Ii][Tt][Ee][Rr][Aa][Ll]))/,/^(?:([Bb][Nn][Oo][Dd][Ee]))/,/^(?:([Ii][Rr][Ii]))/,/^(?:([Nn][Oo][Nn][Ll][Ii][Tt][Ee][Rr][Aa][Ll]))/,/^(?:([Aa][Nn][Dd]))/,/^(?:([Oo][Rr]))/,/^(?:([No][Oo][Tt]))/,/^(?:([Mm][Ii][Nn][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Ii][Nn][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Aa][Xx][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Aa][Xx][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Mm][Ii][Nn][Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Mm][Aa][Xx][Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Tt][Oo][Tt][Aa][Ll][Dd][Ii][Gg][Ii][Tt][Ss]))/,/^(?:([Ff][Rr][Aa][Cc][Tt][Ii][Oo][Nn][Dd][Ii][Gg][Ii][Tt][Ss]))/,/^(?:([Uu][Nn][Ii][Qq][Uu][Ee]))/,/^(?:([Ff][Oo][Cc][Uu][Ss]))/,/^(?:([Dd][Aa][Tt][Aa][Tt][Yy][Pp][Ee]))/,/^(?:([Ll][Aa][Nn][Gg][Tt][Aa][Gg]))/,/^(?:<)/,/^(?:=)/,/^(?:>)/,/^(?:!=)/,/^(?:\/\/)/,/^(?:\{)/,/^(?:\})/,/^(?:&)/,/^(?:\|\|)/,/^(?:\|)/,/^(?:,)/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?:\$)/,/^(?:!)/,/^(?:\^\^)/,/^(?:\^)/,/^(?:\.)/,/^(?:~)/,/^(?:;)/,/^(?:\*)/,/^(?:\+)/,/^(?:\?)/,/^(?:-)/,/^(?:%)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:$)/,/^(?:[a-zA-Z0-9_-]+)/,/^(?:.)/];
  this.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83],"inclusive":true}};
  this.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
    const YYSTATE=YY_START;
    switch($avoiding_name_collisions) {
    case 0:/**/
      break;
    case 1:return 75;
      break;
    case 2:return 76;
      break;
    case 3: yy_.yytext = yy_.yytext.substr(1); return 182; 
      break;
    case 4:return 77;
      break;
    case 5:return 225;
      break;
    case 6:return 155;
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
    case 13:return 209;
      break;
    case 14:return 97;
      break;
    case 15:return 226;
      break;
    case 16:return 205;
      break;
    case 17:return 221;
      break;
    case 18:return 223;
      break;
    case 19:return 220;
      break;
    case 20:return 222;
      break;
    case 21:return 217;
      break;
    case 22:return 219;
      break;
    case 23:return 216;
      break;
    case 24:return 218;
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
    case 48:return 186;
      break;
    case 49:return 192;
      break;
    case 50:return 198;
      break;
    case 51:return 197;
      break;
    case 52:return 194;
      break;
    case 53:return 27;
      break;
    case 54:return 196;
      break;
    case 55:return 195;
      break;
    case 56:return 200;
      break;
    case 57:return 115;
      break;
    case 58:return 117;
      break;
    case 59:return 199;
      break;
    case 60:return '||';
      break;
    case 61:return 130;
      break;
    case 62:return 135;
      break;
    case 63:return 65;
      break;
    case 64:return 66;
      break;
    case 65:return 158;
      break;
    case 66:return 160;
      break;
    case 67:return 144;
      break;
    case 68:return 157;
      break;
    case 69:return 107;
      break;
    case 70:return 156;
      break;
    case 71:return 67;
      break;
    case 72:return 175;
      break;
    case 73:return 136;
      break;
    case 74:return 152;
      break;
    case 75:return 153;
      break;
    case 76:return 154;
      break;
    case 77:return 176;
      break;
    case 78:return 203;
      break;
    case 79:return 214;
      break;
    case 80:return 215;
      break;
    case 81:return 7;
      break;
    case 82:return 'unexpected word "'+yy_.yytext+'"';
      break;
    case 83:return 'invalid character '+yy_.yytext;
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
      return "\"" + node.value + "\"" + (
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
    return match[1];
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

  // tests
  // console.warn("HERE:", ShExJtoAS({"type":"Schema","shapes":[{"id":"http://all.example/S1","type":"Shape","expression":
  //  { "id":"http://all.example/S1e", "type":"EachOf","expressions":[ ] },
  // // { "id":"http://all.example/S1e","type":"TripleConstraint","predicate":"http://all.example/p1"},
  // "extra":["http://all.example/p3","http://all.example/p1","http://all.example/p2"]
  // }]}).shapes['http://all.example/S1']);

  ShExJtoAS: function (schema) {
    const _ShExUtil = this;
    schema._prefixes = schema.prefixes || {  };
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
            } else if (tripleExpr.type === "Unique") {
            } else if (tripleExpr.type === "ValueComparison") {
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
        if (elt.constructor === Array) {
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
          if (nested.constructor === Array)
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
      const nested = val.errors.constructor === Array ?
          val.errors.reduce((ret, e) => {
            return ret.concat((typeof e === "string" ? [e] : _ShExUtil.errsToSimple(e)).map(s => "  " + s));
          }, []) :
          "  " + (typeof e === "string" ? [val.errors] : _ShExUtil.errsToSimple(val.errors));
      return ["validating " + n3ify(val.triple.object) + ":"].concat(nested);
    } else if (val.type === "ShapeAndFailure") {
      return val.errors.constructor === Array ?
          val.errors.reduce((ret, e) => {
            return ret.concat((typeof e === "string" ? [e] : _ShExUtil.errsToSimple(e)).map(s => "  " + s));
          }, []) :
          "  " + (typeof e === "string" ? [val.errors] : _ShExUtil.errsToSimple(val.errors));
    } else if (val.type === "ShapeOrFailure") {
      return val.errors.constructor === Array ?
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
    } else if (val.constructor === Array) {debugger;
      return val.reduce((ret, e) => {
        const nested = _ShExUtil.errsToSimple(e).map(s => "  " + s);
        return ret.length ? ret.concat(["AND"]).concat(nested) : nested;
      }, []);
    } else if (val.type === "ValueComparisonFailure") {
      return ["ValueComparisonFailure: expected " + val.left + val.comparator + val.right];
    } else if (val.type === "SemActFailure") {
      const nested = val.errors.constructor === Array ?
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
  const regexModule = this.options.regexModule || __webpack_require__(863);

  /* getAST - compile a traditional regular expression abstract syntax tree.
   * Tested but not used at present.
   */
  this.getAST = function () {
    return {
      type: "AST",
      shapes: schema.shapes.reduce(function (ret, shape) {
        ret[shape.id] = {
          type: "ASTshape",
          expression: _compileShapeToAST(shape.expression, [], _ShExValidator.schema)
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
  this.validate = function (point, label, tracker, seen, uniques) {
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
    if (seen === undefined)
      seen = {};
    if (uniques === undefined)
      uniques = {};

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
    const ret = this._validateShapeExpr(point, shape, label, tracker, seen, uniques);
    tracker.exit(point, label, ret);
    delete seen[seenKey];
    if ("known" in this)
      this.known[seenKey] = ret;
    if ("startActs" in schema && outside) {
      ret.startActs = schema.startActs;
    }
    return this.options.noResults ? {} : ret;
  }

  this._validateShapeExpr = function (point, shapeExpr, shapeLabel, tracker, seen, uniques) {
    if (point === "")
      throw Error("validation needs a valid focus node");
    let ret = null
    if (typeof shapeExpr === "string") { // ShapeRef
      ret = this._validateShapeExpr(point, index.shapeExprs[shapeExpr], shapeExpr, tracker, seen, uniques);
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
      ret = this._validateShape(point, shapeExpr, shapeLabel, tracker, seen, uniques);
    } else if (shapeExpr.type === "ShapeExternal") {
      ret = this.options.validateExtern(point, shapeLabel, tracker, seen, uniques);
    } else if (shapeExpr.type === "ShapeOr") {
      const errors = [];
      for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        const nested = shapeExpr.shapeExprs[i];
        const sub = this._validateShapeExpr(point, nested, shapeLabel, tracker, seen, uniques);
        if ("errors" in sub)
          errors.push(sub);
        else
          return { type: "ShapeOrResults", solution: sub };
      }
      ret = { type: "ShapeOrFailure", errors: errors };
    } else if (shapeExpr.type === "ShapeNot") {
      const sub = this._validateShapeExpr(point, shapeExpr.shapeExpr, shapeLabel, tracker, seen, uniques);
      if ("errors" in sub)
          ret = { type: "ShapeNotResults", solution: sub };
        else
          ret = { type: "ShapeNotFailure", errors: sub };
    } else if (shapeExpr.type === "ShapeAnd") {
      const passes = [];
      const errors = [];
      for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        const nested = shapeExpr.shapeExprs[i];
        const sub = this._validateShapeExpr(point, nested, shapeLabel, tracker, seen, uniques);
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

  this._validateShape = function (point, shape, shapeLabel, tracker, seen, uniques) {
    const _ShExValidator = this;
    const valParms = { db, shapeLabel, tracker, seen, uniques };

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
      return _ShExValidator.validate(value, valueExpr, valParms.tracker, valParms.seen, valParms.uniques);
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
          } else if (typeof response === 'object' && response.constructor === Array) {
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
          expr.type === "Unique" ? this.visitUnique(expr) :
          expr.type === "ValueComparison" ? this.visitValueComparison(expr) :
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

      visitUnique: function (unique) {
        var ret = { type: "Unique" };
        _expect(unique, "type", "Unique");

        if ("focus" in unique)
          ret.focus = unique.focus;
        ret.uniques = this._visitList(unique.uniques);
        return ret;
      },

      visitAccessors: function (accessors) {
        var _Visitor = this;
        return accessors.map(function (t) {
          return typeof t === "object" ? _Visitor.visitAccessorFunction(t) : t;
        });
      },

      visitAccessorFunction: function (f) {
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

      visitValueComparison: function (cmp) {
        var ret = { type: "ValueComparison" };
        _expect(cmp, "type", "ValueComparison");

        ret.left = cmp.left;
        ret.comparator = cmp.comparator;
        ret.right = cmp.right;
        return ret;
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