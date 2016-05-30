/* ShExValidator - javascript module to validate a graph with respect to Shape Expressions
 *
 * Status: 1/2 tested, no known bugs.
 *
 * TODO:
 *   constraint violation reporting.
 */

// interface constants
var InterfaceOptions = {
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

var VERBOSE = "VERBOSE" in process.env;
// **ShExValidator** provides ShEx utility functions

var ProgramFlowError = { type: "ProgramFlowError", errors: { type: "UntrackedError" } };

var N3Util = require("n3").Util;

function getLexicalValue (term) {
  return N3Util.isIRI(term) ? term :
    N3Util.isLiteral(term) ? N3Util.getLiteralValue(term) :
    term.substr(2); // bnodes start with "_:"
}


var XSD = "http://www.w3.org/2001/XMLSchema#";
var integerDatatypes = [
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

var numericDatatypes = [
  XSD + "decimal",
  XSD + "float",
  XSD + "double"
].concat(integerDatatypes);

var numericParsers = {};
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
  var ret = numericParsers[XSD + "integer"](label, parseError);
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

var stringTests = {
  length   : function (v, l) { return v.length === l; },
  minlength: function (v, l) { return v.length  >= l; },
  maxlength: function (v, l) { return v.length  <= l; }
};

var numericValueTests = {
  mininclusive  : function (n, m) { return n        >= m; },
  minexclusive  : function (n, m) { return n        >  m; },
  maxinclusive  : function (n, m) { return n        <= m; },
  maxexclusive  : function (n, m) { return n        <  m; }
};

var decimalLexicalTests = {
  totaldigits   : function (v, d) { var m = v.match(/[0-9]/g); return m && m.length === d; },
  fractiondigits: function (v, d) { var m = v.match(/\.[0-9]+/); return m && m[0].length - 1 === d; }
};

/* ShExValidator - construct an object for validating a schema.
 *
 * schema: a structure produced by a ShEx parser or equivalent.
 * options: object with controls for
 *   lax(true): boolean: whine about missing types in schema.
 *   diagnose(false): boolean: makde validate return a structure with errors.
 */
function ShExValidator(schema, options) {
  if (!(this instanceof ShExValidator))
    return new ShExValidator(schema, options);
  this.type = "ShExValidator";
  this.options = options || {};
  this.options.or = this.options.or || "someOf";
  this.options.partition = this.options.partition || "exhaustive";

  var _ShExValidator = this;
  this.schema = schema;
  this._shapeCompilationByLabel = {}; // map from shape label to compilation structure.
  this._NFAByLabel = {}; // map from shape label to compilation structure.
  this._expect = this.options.lax ? noop : expect; // report errors on missing types.
  this._optimize = {}; // optimizations:
    // hasRepeatedGroups: whether there are patterns like (:p1 ., :p2 .)*
  this.reset = function () {  }; // included in case we need it later.

  /* getAST - compile a traditional regular expression abstract syntax tree.
   * Tested but not used at present.
   */
  this.getAST = function () {
    return {
      type: "AST",
      shapes: Object.keys(this._shapeCompilationByLabel).reduce(function (ret, label) {
        ret[label] = {
          type: "ASTshape",
          expression: _compileShapeToAST(_ShExValidator.schema.shapes[label].expression, [], _ShExValidator.schema)
        };
        return ret;
      }, {})
    };
  };

  /* compileExpression - compile regular expression and index triple constraints
   */
  this.compileExpression = function (expression) {
    var optimize = {};
    var tripleConstraints = []; // list of triple constraints from (:p1 ., (:p2 . | :p3 .))
    var predicateToTripleConstraints = []; // index tripleConstraints by predicate. {p1: 0, p2: 1, p3: 2}

    // this._expect(shape, "type", "Shape");

    // @@TODO shape.virtual, shape.inherit

    return {
      regexp: expression ? this._compileRegexp(expression, tripleConstraints,
                                               predicateToTripleConstraints, optimize, true) : "()",
      tripleConstraints: tripleConstraints,
      optimize: optimize
      //ast: _compileShapeToAST(shape.expression, [], this.schema) // @@ make sure this ends up the same as _ShExValidator._shapeCompilationByLabel[label].tripleConstraints
    };
  };

  /* _compileRegexp - compile shape expression to regular expression; builds list
   *   of triple constraints (tripleConstraints) and indexes them by predicate
   *   (predicateToTripleConstraints).
   */
  this._compileRegexp = function (expr, tripleConstraints, predicateToTripleConstraints, optimize, capture) {
    var _ShExValidator = this;
    var regexp = "", ret;

    function _writeCardinality (min, max, negated) {
      if (negated)                                return "{0,0}";
      if (min === 0 && max === 1)                 return "?";
      if (min === 0 && max === "*")               return "*";
      if (min === undefined && max === undefined) return "";
      if (min === 1 && max === "*")               return "+";
      return "{" + min + "," + (max === "*" ? "" : max) + "}";
    }

    if (expr.type === "TripleConstraint") {
      var ordinal = tripleConstraints.indexOf(expr);
      if (ordinal === -1) // always true unless that expr was expanded in an earlier disjunct a la "0 (1 )?|1 "
        ordinal = tripleConstraints.push(expr)-1;
      if (!(expr.predicate in predicateToTripleConstraints))
        predicateToTripleConstraints[expr.predicate] = [];
      predicateToTripleConstraints[expr.predicate].push(expr);
      regexp += "("+(capture ? "" : "?:")+"(?:"+ordinal + " )" + _writeCardinality(expr.min, expr.max, expr.negated) + ")";
    }

    else if (expr.type === "SomeOf") {
      ret = "";
      expr.expressions.forEach(function (nested, ord) {
        if (ord)
          ret += "|";
        ret += _ShExValidator._compileRegexp(nested, tripleConstraints, predicateToTripleConstraints, optimize, capture);
        if (_ShExValidator.options.or !== "oneOf") {
          /* enumerate following disjuncts as optional a la /a|b|c/ -> /ab?c?|bc?|c/ */
          ret += expr.expressions.slice(ord + 1).map(function (following) {
            return "(?:"+_ShExValidator._compileRegexp(following, tripleConstraints, predicateToTripleConstraints, optimize, false)+")?";
          }).join("");
        }
      });
      regexp += "(?:" + ret + ")" + _writeCardinality(expr.min, expr.max, false);
    }

    else if (expr.type === "EachOf") {
      ret = "";
      expr.expressions.forEach(function (nested) {
        ret += _ShExValidator._compileRegexp(nested, tripleConstraints, predicateToTripleConstraints, optimize, capture);
      });
      regexp += "(" + ret + ")" + _writeCardinality(expr.min, expr.max, false);
    }

    else if (expr.type === "Inclusion") {
      var included = schema.shapes[expr.include].expression;
      regexp += _ShExValidator._compileRegexp(included, tripleConstraints, predicateToTripleConstraints, optimize, capture);
    }

    else {
      runtimeError("unexpected expr type: " + expr.type);
    }

    // Test for repeated groups, e.g. (:p1 ., :p2 .)*
    if (["SomeOf", "EachOf"].indexOf(expr.type) !== -1 &&
        ("min" in expr && expr.min !== 1 ||
         "max" in expr && expr.max !== 1)) {
      optimize.hasRepeatedGroups = true;
    }

    return regexp;
  };

  var Split = "<span class='keyword' title='Split'>|</span>";
  var Rept  = "<span class='keyword' title='Repeat'>×</span>";
  var Match = "<span class='keyword' title='Match'>␃</span>";
  /* compileNFA - compile regular expression and index triple constraints
   */
  this.compileNFA = function (expression) {
    var _ShExValidator = this;
    var states = [];
    var stack = [];
    var pair;
    if (expression)
      pair = walkExpr(expression, []);
    matchstate = State_make(Match, []);
    var startNo = matchstate;
    if (expression) { // empty shape compiles to matchstate
      patch(pair.tail, matchstate);
      startNo = pair.start;
    }
    return {
      algorithm: "rbenx",
      end: matchstate,
      states: states,
      start: startNo,
      match: rbenx_match
    }

    function walkExpr (expr, stack) {
      var s, starts;
      var lastTail;
      function maybeAddRept (start, tail) {
        if ((expr.min == undefined || expr.min === 1) &&
            (expr.max == undefined || expr.max === 1))
          return {start: start, tail: tail}
        s = State_make(Rept, [start]);
        states[s].expr = expr;
        // cache min/max in normalized form for simplicity of comparison.
        states[s].min = "min" in expr ? expr.min : 1;
        states[s].max = "max" in expr ? expr.max === "*" ? Infinity : expr.max : 1;
        patch(tail, s);
        return {start: s, tail: [s]}
      }

      if (expr.type === "TripleConstraint") {
        s = State_make(expr, []);
        states[s].stack = stack;
        return {start: s, tail: [s]};
        // maybeAddRept(s, [s]);
      }

      else if (expr.type === "SomeOf") {
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
        var included = schema.shapes[expr.include].expression;
        return walkExpr(included, stack);
      }

      runtimeError("unexpected expr type: " + expr.type);
    };

    function State_make (c, outs, negated) {
      var ret = states.length;
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

    function rbenx_match (graph, node, trace, constraintList, constraintToTripleMapping) {
      var _this = this;
      var clist = [], nlist = []; // list of {state:state number, repeats:stateNo->repetitionCount}

      function resetRepeat (thread, repeatedState) {
        var trimmedRepeats = Object.keys(thread.repeats).reduce((r, k) => {
          if (parseInt(k) !== repeatedState) // ugh, hash keys are strings
            r[k] = thread.repeats[k];
          return r;
        }, {});
        return {state:thread.state/*???*/, repeats:trimmedRepeats, matched:thread.matched, avail:thread.avail.slice(), stack:thread.stack};
      }
      function incrmRepeat (thread, repeatedState) {
        var incrmedRepeats = Object.keys(thread.repeats).reduce((r, k) => {
          r[k] = parseInt(k) == repeatedState ? thread.repeats[k] + 1 : thread.repeats[k];
          return r;
        }, {});
        return {state:thread.state/*???*/, repeats:incrmedRepeats, matched:thread.matched, avail:thread.avail.slice(), stack:thread.stack};
      }
      function stateString (state, repeats) {
        var rs = Object.keys(repeats).map(rpt => {
          return rpt+":"+repeats[rpt];
        }).join(",");
        return rs.length ? state + "-" + rs : ""+state;
      }

      function addstate (list, stateNo, thread, seen) {
        seen = seen || [];
        var seenkey = stateString(stateNo, thread.repeats);
        if (seen.indexOf(seenkey) !== -1)
          return;
        seen.push(seenkey);

        var s = _this.states[stateNo];
        if (s.c === Split) {
          s.outs.forEach((o, idx) => {
            addstate(list, o , thread, seen);
          });
        // } else if (s.c.type === "SomeOf" || s.c.type === "EachOf") { // don't need Rept
        } else if (s.c === Rept) {
          // matched = [matched].concat("Rept" + s.expr);
          if (!(stateNo in thread.repeats))
            thread.repeats[stateNo] = 0;
          var repetitions = thread.repeats[stateNo];
          // add(r < s.min ? outs[0] : r >= s.min && < s.max ? outs[0], outs[1] : outs[1])
          if (repetitions < s.max)
            addstate(list, s.outs[0], incrmRepeat(thread, stateNo), seen); // outs[0] to repeat
          if (repetitions >= s.min && repetitions <= s.max)
            addstate(list, s.outs[1], resetRepeat(thread, stateNo), seen); // outs[1] when done
        } else {
          if (stateNo !== _this.end || !thread.avail.reduce((r2, avail) => {
            return r2 || avail.length > 0;
          }, false)) {
            list.push({state:stateNo, repeats:thread.repeats, avail:thread.avail.map(a => {
              return a.slice();
            }), stack:thread.stack, matched:thread.matched}); // copy parent thread's avail vector
          }
        }
      }

      function localExpect (list) {
        return list.map(st => {
          var s = _this.states[st.state]; // simpler threads are a list of states.
          return renderAtom(s.c, s.negated);
        });
      }

      if (_this.states.length === 1)
        return {  };

      var chosen = null;
      addstate(clist, startNo, {repeats:{}, avail:[], matched:[], stack:[]}); // a thread which repeats no states
      while (clist.length && chosen === null) {
        nlist = [];
        if (trace)
          trace.push({threads:[]});
        for (var threadno = 0; threadno < clist.length; ++threadno) {
          var thread = clist[threadno];
          var state = _this.states[thread.state];
          var nlistlen = nlist.length;
          var constraintNo = constraintList.indexOf(state.c);
          // may be Accept!
          var min = "min" in state.c ? state.c.min : 1;
          var max = "max" in state.c ? state.c.max === "*" ? Infinity : state.c.max : 1;
          if ("negated" in state.c && state.c.negated)
            min = max = 0;
          if (thread.avail[constraintNo] === undefined)
            thread.avail[constraintNo] = constraintToTripleMapping[constraintNo].slice();
          var taken = thread.avail[constraintNo].splice(0, min);
          if (taken.length === min) {
            do {
              var exprs = _this.states.map(x => { return x.expr; });
              var withIndexes = {
                c: state.c,
                triples: taken,
                stack: state.stack.map(e => {
                  var i = thread.repeats[exprs.indexOf(e.c)];
                  if (i === undefined)
                    i = 0; // no repeats
                  else
                    i = i-1;
                  return { c:e.c, e:e.e, i:i };
                })
              };
              thread.matched = thread.matched.concat(withIndexes);
              state.outs.forEach(o => { // single out if NFA includes epsilons
                addstate(nlist, o, thread);
              });
            } while ((function () {
              if (thread.avail[constraintNo].length > 0 && taken.length < max) {
                taken.push(thread.avail[constraintNo].shift());
                return true;
              } else {
                return false;
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
        if (nlist.length === 0)
          return reportError(localExpect(clist, _this.states));
        var t = clist;
        clist = nlist;
        nlist = t;
        chosen = clist.reduce((ret, elt) => {
          return ret !== null ? ret : (elt.state === _this.end) ? elt : null;
        }, null)
        // if (chosen !== null)
        //   console.log(JSON.stringify(matchedToResult(chosen.matched)));
      }
      if (chosen === null)
        return reportError();
      function reportError () { return {
        type: "failure",
        node: node,
        errors: localExpect(clist, _this.states)
      } }
      function localExpect () {
        return clist.map(t => {
          var c = states[t.state].c;
          return {
            type: "MissingProperty",
            property: c.predicate,
            valueExpr: c.valueExpr
          };
        });
      }
      return chosen.matched;
    }
  }

  this.matchedToResult = function (matched, neighborhood, recurse, semActHandler) {
    var last = [];
    var errors = [];
    var skips = [];
    var ret = matched.reduce((out, m) => {
      var mis = 0;
      var ptr = out, t;
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
          if ("min" in m.stack[mis].c)
            ptr.min = m.stack[mis].c.min;
          if ("max" in m.stack[mis].c)
            ptr.max = m.stack[mis].c.max;
          ptr.type = m.stack[mis].c.type === "EachOf" ? "eachOfSolutions" : "someOfSolutions", ptr.solutions = t;
          if ("annotations" in m.stack[mis].c)
            ptr.annotations = m.stack[mis].c.annotations;
          if ("semActs" in m.stack[mis].c)
            ptr.semActs = m.stack[mis].c.semActs;
          ptr = t;
          last[mis].i = null;
          // !!! on the way out to call after valueExpr test
          if (!semActHandler.dispatchAll(m.stack[mis].c.semActs || [], "???"))
            throw { type: "SemActFailure", errors: [{ type: "UntrackedSemActFailure" }] };
          if (ret && "semActs" in expr) { ret.semActs = expr.semActs; }
        } else {
          ptr = ptr.solutions;
        }
        if (m.stack[mis].i !== last[mis].i) {
          t = [];
          ptr[m.stack[mis].i] = {
            type:m.stack[mis].c.type === "EachOf" ? "eachOfSolution" : "someOfSolution",
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
          last[mis.e] = null;
        } else {
          throw "how'd we get here?"
          ptr = ptr[last[mis].e];
        }
        ++mis;
      }
      ptr.type = "tripleConstraintSolutions";
      if ("min" in m.c)
        ptr.min = m.c.min;
      if ("max" in m.c)
        ptr.max = m.c.max;
      ptr.predicate = m.c.predicate;
      if ("valueExpr" in m.c)
        ptr.valueExpr = m.c.valueExpr;
      ptr.solutions = m.triples.map(tno => {
        var triple = neighborhood[tno];
        var ret = {
          type: "testedTriple",
          subject: triple.subject,
          predicate: triple.predicate,
          object: triple.object
        };

        errors = errors.concat(_ShExValidator._errorsMatchingValueExpr(ptr.inverse ? triple.subject : triple.object, ptr.valueExpr, ptr.inverse, function (focus, shape) {
          var sub = recurse(focus, shape);
          if ("errors" in sub) {
            // console.dir(sub);
            return [{
              type: "ReferenceError", focus: focus,
              shape: shape, errors: sub
            }];
          }
          ret.referenced = sub; // !!! needs to aggregate errors and solutions
          return [];
        }));

        if (!semActHandler.dispatchAll(m.c.semActs || [], triple))
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
      return errors;

    // Clear out the nulls for the expressions with min:0 and no matches.
    // <S> { (:p .; :q .)?; :r . } \ { <s> :r 1 } -> i:0, e:1 resulting in null at e=0
    // Maybe we want these nulls in expressions[] to make it clear that there are holes?
    skips.forEach(skip => {
      for (var exprNo = 0; exprNo < skip.length; ++exprNo)
        if (skip[exprNo] === null || skip[exprNo] === undefined)
          skip.splice(exprNo--, 1);
    });
    
    return ret;
  }

  /* validate - test point in db against the schema for shapeLabel
   * depth: level of recurssion; for logging.
   */
  this.validate = function (db, point, shapeLabel, depth, seen) {
    // default to schema's start shape
    shapeLabel = shapeLabel || schema.start;
    if (!shapeLabel)
      runtimeError("start production not defined");
    if (!(shapeLabel in this._shapeCompilationByLabel))
      runtimeError("shape " + shapeLabel + " not defined");

    if (seen === undefined)
      seen = {};
    var seenKey = point + "|" + shapeLabel;
    if (seenKey in seen)
      return {
        type: "recursion",
        node: point,
        shape: shapeLabel
      };
    seen[seenKey] = { point: point, shapeLabel: shapeLabel };

    var compiledExpression = this._shapeCompilationByLabel[shapeLabel];
    var nfa = this._NFAByLabel[shapeLabel];
    var shapeExpr = schema.shapes[shapeLabel];
    var ret;
    if (shapeExpr.type === "Shape") {
      ret = this._validateExpression(db, point, compiledExpression, nfa,
                                     shapeExpr, shapeLabel, depth, seen);
    } else {
      ret = {
        "type": "ShapeAnd",
        "solutions":
        shapeExpr.shapeExprs.map((shape, ord) => {
          return this._validateExpression(db, point, compiledExpression[ord], nfa[ord],
                                          shape, shapeLabel, depth, seen);
        })
      };
    }
    delete seen[seenKey];
    return ret;
  }

  this._validateExpression = function (db, point, compiledExpression, nfa, shape, shapeLabel, depth, seen) {
    var _ShExValidator = this;

    // logging stuff
    if (depth === undefined)
      depth = 0;
    var padding = (new Array(depth + 1)).join("  "); // AKA "  ".repeat(depth);
    function _log () {
      if (!VERBOSE) { return; }
      console.log(padding + Array.prototype.join.call(arguments, ""));
    }

    // <expeditiousHack>
    var errors = [];
    function validationError () {
      var errorStr = Array.prototype.join.call(arguments, "");
      errors.push("Error validating " + value + " as " + JSON.toString(valueExpr) + ": " + errorStr);
    }
    var valueExpr = shape;
    var value = point;
    var label = N3Util.isLiteral(value) ? N3Util.getLiteralValue(value) :
      N3Util.isBlank(value) ? value.substring(2) :
      value;
// !! copied
      if ("nodeKind" in valueExpr) {
        if (["iri", "bnode", "literal", "nonliteral"].indexOf(valueExpr.nodeKind) === -1) {
          validationError("unknown node kind '" + valueExpr.nodeKind + "'");
        }
        if (N3Util.isBlank(value)) {
          if (valueExpr.nodeKind === "iri" || valueExpr.nodeKind === "literal") {
            validationError("blank node found when " + valueExpr.nodeKind + " expected");
          }
        } else if (N3Util.isLiteral(value)) {
          if (valueExpr.nodeKind !== "literal") {
            validationError("literal found when " + valueExpr.nodeKind + " expected");
          }
        } else if (valueExpr.nodeKind === "bnode" || valueExpr.nodeKind === "literal") {
          validationError("iri found when " + valueExpr.nodeKind + " expected");
        }
      }
    if ("pattern" in valueExpr) {
      if (!(getLexicalValue(value).match(new RegExp(valueExpr.pattern)))) {
        validationError("value " + value + " did not match pattern " + valueExpr.pattern);
      }
    }
    Object.keys(stringTests).forEach(function (test) {
      if (test in valueExpr && !stringTests[test](label, valueExpr[test])) {
        validationError("facet violation: expected " + test + " of " + valueExpr[test] + " but got " + value);
      }
    });
    // </expeditiousHack>
    var ret = null;
    if (errors.length)
      ret = {
        type: "failure",
        node: point,
        shape: shapeLabel,
        errors: errors.map(function (miss) {
          return {
            type: "NodeConstraintViolation",
            shape: valueExpr
          };
        })
      };

    if (!this.semActHandler.dispatchAll(schema.startActs || [], null))
      return null; // some semAct aborted !! return real error
    _log("validating <" + point + "> as <" + shapeLabel + ">");

    var outgoing = indexNeighborhood(db.findByIRI(point, null, null, null).sort(byObject));
    var incoming = indexNeighborhood(db.findByIRI(null, null, point, null).sort(bySubject));
    var neighborhood = outgoing.triples.concat(incoming.triples); // @@ make fancy array holder.

    var constraintList = compiledExpression.tripleConstraints;

    var tripleList = constraintList.reduce(function (ret, constraint, ord) {

      // subject and object depend on direction of constraint.
      var searchSubject = constraint.inverse ? null : point;
      var searchObject = constraint.inverse ? point : null;
      var index = constraint.inverse ? incoming : outgoing;

      // get triples matching predciate
      var matchPredicate = index.byPredicate[constraint.predicate] ||
        []; // empty list when no triple matches that constraint

      // strip to triples matching value constraints (apart from @<someShape>)
      var matchConstraints = _ShExValidator._triplesMatchingValueExpr(matchPredicate, constraint.valueExpr, constraint.inverse, _ShExValidator.options.partition === "exhaustive" ? undefined : function (focus, shape) {
        var sub = _ShExValidator.validate(db, focus, shape, depth + 1, seen);
        if ("errors" in sub)
          return sub.errors;
        // testedTriple.referenced = sub; // !!! needs to aggregate errors and solutions
        return [];
      });

      matchConstraints.hits.forEach(function (t) {
        ret.constraintList[neighborhood.indexOf(t)].push(ord);
      });
      matchConstraints.misses.forEach(function (t) {
        ret.misses[neighborhood.indexOf(t)] = ord;
      });
      return ret;
    }, { misses: {}, constraintList:_seq(neighborhood.length).map(function () { return []; }) }); // start with [[],[]...]

    _log("constraints by triple: ", JSON.stringify(tripleList.constraintList));

    var misses = tripleList.constraintList.reduce(function (ret, constraints, ord) {
      if (constraints.length === 0 &&                       // matches no constraints
          ord < outgoing.triples.length &&                  // not an incoming triple
          ord in tripleList.misses &&                       // predicate matched some constraint(s)
          (shape.extra === undefined ||                     // not declared extra
           shape.extra.indexOf(neighborhood[ord].predicate) === -1)) {
        ret.push({tripleNo: ord, constraintNo: tripleList.misses[ord]});
      }
      return ret;
    }, []);

    var r = new RegExp("^"+compiledExpression.regexp+"$"); // ((0 )*(1 )+|(2 )(3 ))
    var xp = crossProduct(tripleList.constraintList);
    var partitionErrors = [];
    while (misses.length === 0 && xp.next() && ret === null) {
      // caution: early continues

      var usedTriples = []; // [{s1,p1,o1},{s2,p2,o2}] implicated triples -- used for messages
      var constraintMatchCount = // [2,1,0,1] how many triples matched a constraint
        _seq(neighborhood.length).map(function () { return 0; });
      var tripleToConstraintMapping = xp.get(); // [0,1,0,3] mapping from triple to constraint

      // Triples not mapped to triple constraints are not allowed in closed shapes.
      if (shape.closed) {
        var firstSkippedTriple = tripleToConstraintMapping.indexOf(undefined);
        if (firstSkippedTriple !== -1 && firstSkippedTriple < outgoing.triples.length) {
          continue; // closed shape violation.
        }
      }

      // Set usedTriples and constraintMatchCount.
      tripleToConstraintMapping.forEach(function (tpNumber, ord) {
        if (tpNumber !== undefined) {
          usedTriples.push(neighborhood[ord]);
          ++constraintMatchCount[tpNumber];
        }
      });

      // Pivot to triples by constraint.
      function _constraintToTriples () {
        var cll = constraintList.length;
        return tripleToConstraintMapping.slice().
          reduce(function (ret, c, ord) {
            if (c !== undefined)
              ret[c].push(ord);
            return ret;
          }, _seq(cll).map(function () { return []; }));
      }

      // Create string to match regexp.
      var byConstraint =
        compiledExpression.optimize.hasRepeatedGroups ?
        _compileFootprint(shape.expression,
                          _constraintToTriples(), constraintList) : // walk schema
      tripleToConstraintMapping.slice().sort(function (a,b) { return a-b; }).filter(function (i) { // sort constraint numbers
        return i !== undefined;
      }).map(function (n) { return n + " "; }).join(""); // e.g. 0 0 1 3 

      // Test if byConstraint matches the compiled regexp.
      _log("trying " + tripleToConstraintMapping.slice().join(" ")+" |" + byConstraint + " (" + shapeLabel + ") with " + usedTriples.join(" "));
      var nfaTrace = [];
      var fromNFA = nfa.match(db, point, nfaTrace, constraintList, _constraintToTriples());
      if (!("errors" in fromNFA) && fromNFA.constructor === Array) { // {} for empty result
        function recurse999 (point, shapeLabel) {
          return _ShExValidator.validate(db, point, shapeLabel, depth+1, seen);
        }
        fromNFA = _ShExValidator.matchedToResult(fromNFA, neighborhood, recurse999, this.semActHandler);
        if ("semActs" in shape) {
          fromNFA.semActs = shape.semActs;
        }
      }
      if ("errors" in fromNFA || fromNFA.constructor === Array) {
        partitionErrors.push({
          errors: fromNFA.constructor === Array ? fromNFA : fromNFA.errors
        });
        if (_ShExValidator.options.partition !== "exhaustive")
          break;
        else
          continue;
      }

      _log("post-regexp " + usedTriples.join(" "));

      if (!this.semActHandler.dispatchAll(shape.semActs || [], fromNFA))
        continue; // some semAct aborted
      if ("semActs" in shape) { fromNFA.semActs = shape.semActs; }
      _log("final " + usedTriples.join(" "));

      ret = { type: "test", node: point, shape: shapeLabel, solution: fromNFA }; // expression: expr, triples: usedTriples
      // alts.push(tripleToConstraintMapping);
    }
    if (ret === null && this.options.diagnose) {
      var missErrors = misses.map(function (miss) {
        return [{
          type: "TypeMismatch",
          triple: neighborhood[miss.tripleNo],
          constraint: constraintList[miss.constraintNo]
        }];
      });
      ret = {
        type: "failure",
        node: point,
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

  this._triplesMatchingValueExpr = function (triples, valueExpr, inverse, recurse) {
    var _ShExValidator = this;
    var misses = [];
    var hits = [];
    triples.forEach(function (triple) {
      var value = inverse ? triple.subject : triple.object;
      var errors = _ShExValidator._errorsMatchingValueExpr(value, valueExpr, inverse, recurse);
      if (errors.length === 0) {
        hits.push(triple);
      } else if (hits.indexOf(triple) === -1) {
        misses.push(triple);
      }
    });
    return { hits: hits, misses: misses };
  }
  this._errorsMatchingValueExpr = function (value, valueExpr, inverse, recurse) {
    var _ShExValidator = this;
    if (valueExpr.type === "ValueClass") {
      return this._errorsMatchingValueClass (value, valueExpr, inverse, recurse);
    } else if (valueExpr.type === "ValueRef") {
      return this._errorsMatchingValueExpr (value, schema.valueExprDefns[valueExpr.valueExprRef].valueExpr, inverse, recurse);
    } else if (valueExpr.type === "ValueOr") {
      var ret = [];
      for (var i = 0; i < valueExpr.valueExprs.length; ++i) {
        var nested = _ShExValidator._errorsMatchingValueExpr(value, valueExpr.valueExprs[i], inverse, recurse);
        if (nested.length === 0)
          return nested;
        ret = ret.concat(nested);
      }
      return ret;
    } else if (valueExpr.type === "ValueAnd") {
      return valueExpr.valueExprs.reduce(function (ret, nested, iter) {
        return ret.concat(_ShExValidator._errorsMatchingValueExpr (value, nested, inverse, recurse));
      }, []);
    } else {
      validationError("unknown value expression type '" + valueExpr + "'");
    }
  };

  /* _errorsMatchingValueClass - return whether the value matches the value
   * expression without checking shape references.
   */
  this._errorsMatchingValueClass = function (value, valueExpr, inverse, recurse) {
    var errors = [];

    function validationError () {
      var errorStr = Array.prototype.join.call(arguments, "");
      errors.push("Error validating " + value + " as " + JSON.toString(valueExpr) + ": " + errorStr);
    }

    // if (negated) ;
    expect(valueExpr, "type", "ValueClass");
    if (!valueExpr.reference && !valueExpr.nodeKind && !valueExpr.values && !valueExpr.datatype) {
      // wildcard -- ignore
    } else {
      if ("nodeKind" in valueExpr) {
        if (["iri", "bnode", "literal", "nonliteral"].indexOf(valueExpr.nodeKind) === -1) {
          validationError("unknown node kind '" + valueExpr.nodeKind + "'");
        }
        if (N3Util.isBlank(value)) {
          if (valueExpr.nodeKind === "iri" || valueExpr.nodeKind === "literal") {
            validationError("blank node found when " + valueExpr.nodeKind + " expected");
          }
        } else if (N3Util.isLiteral(value)) {
          if (valueExpr.nodeKind !== "literal") {
            validationError("literal found when " + valueExpr.nodeKind + " expected");
          }
        } else if (valueExpr.nodeKind === "bnode" || valueExpr.nodeKind === "literal") {
          validationError("iri found when " + valueExpr.nodeKind + " expected");
        }
      }

      if (valueExpr.reference && valueExpr.values  ) validationError("found both reference and values in "  +tripleConstraint);
      if (valueExpr.reference && valueExpr.datatype) validationError("found both reference and datatype in "+tripleConstraint);
      if (valueExpr.datatype  && valueExpr.values  ) validationError("found both datatype and values in "   +tripleConstraint);

      if (valueExpr.reference && recurse) {
        errors = errors.concat(recurse(value, valueExpr.reference));
      }

      if (valueExpr.datatype) {
        if (!N3Util.isLiteral(value)) {
          validationError("mismatched datatype: " + value + " is not a literal with datatype " + valueExpr.datatype);
        }
        else if (N3Util.getLiteralType(value) !== valueExpr.datatype) {
          validationError("mismatched datatype: " + N3Util.getLiteralType(value) + " !== " + valueExpr.datatype);
        }
      }

      if (valueExpr.values) {
        if (valueExpr.values.indexOf(value) !== -1) {
          // trivial match
        } else {
          if (!(valueExpr.values.some(function (valueConstraint) {
            if (typeof valueConstraint === "object") {
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
      if (!(getLexicalValue(value).match(new RegExp(valueExpr.pattern)))) {
        validationError("value " + value + " did not match pattern " + valueExpr.pattern);
      }
    }

    var label = N3Util.isLiteral(value) ? N3Util.getLiteralValue(value) :
      N3Util.isBlank(value) ? value.substring(2) :
      value;
    var dt = N3Util.isLiteral(value) ? N3Util.getLiteralType(value) : null;
    var numeric = integerDatatypes.indexOf(dt) !== -1 ? XSD + "integer" : numericDatatypes.indexOf(dt) !== -1 ? dt : undefined;

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
        if (numeric === XSD + "integer" || numeric === XSD + "decimal" || numeric === XSD + "float") {
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
    register: function (name, handler) {
      this.handlers[name] = handler;
    },
    dispatchAll: function (semActs, ctx) {
      var _semActHanlder = this;
      return semActs.reduce(function (ret, semAct) {
        if (ret && semAct.name in _semActHanlder.handlers) {
          var code = "code" in semAct ? semAct.code : _ShExValidator.options.semActs[semAct.name];
          return ret && _semActHanlder.handlers[semAct.name].dispatch(code, ctx);
        }
        return ret;
      }, true);
    }
  };

  // Compile each shape in the schema (could also be lazy about it).
  Object.keys(schema.shapes).forEach(function (label) {
    _ShExValidator._shapeCompilationByLabel[label] =
      _ShExValidator.compileExpression(schema.shapes[label].expression);
  });

  // Compile each shape in the schema (could also be lazy about it).
  Object.keys(schema.shapes).forEach(function (label) {
    var shapeExpr = schema.shapes[label];
    _ShExValidator._shapeCompilationByLabel[label] = // !!! eliminate
      shapeExpr.type === "Shape" ?
      _ShExValidator.compileExpression(shapeExpr.expression) :
      shapeExpr.shapeExprs.map(shape => {
        return _ShExValidator.compileExpression(shape.expression);
      });
    _ShExValidator._NFAByLabel[label] =
      shapeExpr.type === "Shape" ?
      _ShExValidator.compileNFA(shapeExpr.expression) :
      shapeExpr.shapeExprs.map(shape => {
        return _ShExValidator.compileNFA(shape.expression);
      });
  });

  if (VERBOSE) { console.log(this._shapeCompilationByLabel); }
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
    var repeated, container;

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

      var opts = max === "*" ?
        new KleeneStar(expr) :
        _seq(max - min).reduce(function (ret, elt, ord) {
          return ord === 0 ?
            new Choice([expr, new Epsilon]) :
            new Choice([new EachOf([expr, ret]), new Epsilon]);
        }, undefined);

      var reqd = min !== 0 ?
        new EachOf(_seq(min).map(function (ret) {
          return expr; // @@ something with ret
        }).concat(opts)) : opts;
      return reqd;
    }

    if (expr.type === "TripleConstraint") {
      // predicate, inverse, negated, valueExpr, annotations, semActs, min, max
      var valueExpr = "valueExprRef" in expr ?
        schema.valueExprDefns[expr.valueExprRef] :
        expr.valueExpr;
      var ordinal = tripleConstraints.push(expr)-1;
      var tp = new TripleConstraint(ordinal, expr.predicate, expr.inverse, expr.negated, valueExpr);
      repeated = _repeat(tp, expr.min, expr.max);
      return expr.semActs ? new SemActs(repeated, expr.semActs) : repeated;
    }

    else if (expr.type === "SomeOf") {
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
      var included = schema.shapes[expr.include].expression;
      return _compileExpression(included, schema);
    }

    else throw Error("unexpected expr type: " + expr.type);
  }

  return expression ? _compileExpression(expression, schema) : new Epsilon();
}

/* Walk an expression, representing each triple matching a constraint by
 * its constraint number.
 */
function _compileFootprint (expr, constraintToTriples, constraintList) { // consumes constraintToTriples
  var regexp = "", added;

  if (expr.type === "TripleConstraint") {
    var constraintNo = constraintList.indexOf(expr);
    var take = expr.max === undefined ? 1 : expr.max;
    while (constraintToTriples[constraintNo].length && (take === "*" || take--)) {
      constraintToTriples[constraintNo].shift();
      regexp += constraintNo + " ";
    }
    // inverse, predicate, min, max, semActs
  }

  else if (expr.type === "SomeOf" || expr.type === "EachOf") {
    added = "";
    do {
      expr.expressions.forEach(function (nested) {
        regexp += added = _compileFootprint(nested, constraintToTriples, constraintList);
      });
    } while (added !== "");
  }

  else if (expr.type === "Inclusion") {
    var included = schema.shapes[expr.include].expression;
    regexp += _compileFootprint(included, constraintToTriples, constraintList);
  }

  else runtimeError("unexpected expr type: " + expr.type);
  return regexp;
}

// http://stackoverflow.com/questions/9422386/lazy-cartesian-product-of-arrays-arbitrary-nested-loops
function crossProduct(sets) {
  var n = sets.length, carets = [], args = null;

  function init() {
    args = [];
    for (var i = 0; i < n; i++) {
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
    var i = n - 1;
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
var N3jsTripleToString = function () {
  function fmt (n) {
    return N3Util.isLiteral(n) ?
      [ "http://www.w3.org/2001/XMLSchema#integer",
        "http://www.w3.org/2001/XMLSchema#float",
        "http://www.w3.org/2001/XMLSchema#double"
      ].indexOf(N3Util.getLiteralType(n)) !== -1 ?
      parseInt(N3Util.getLiteralValue(n)) :
      n :
    N3Util.isBlank(n) ?
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
      var p = t.predicate;
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
  var l = t1.subject, r = t2.subject;
  var lprec = N3Util.isBlank(l) ? 1 : N3Util.isLiteral(l) ? 2 : 3;
  var rprec = N3Util.isBlank(r) ? 1 : N3Util.isLiteral(r) ? 2 : 3;
  return lprec === rprec ? l > r : lprec > rprec;
}

/* byObject - sort triples by object following SPARQL partial ordering.
 */
function byObject (t1, t2) {
  // if (t1.predicate !== t2.predicate) // sort predicate first for easier scanning of results
  //   return t1.predicate > t2.predicate;
  var l = t1.object, r = t2.object;
  var lprec = N3Util.isBlank(l) ? 1 : N3Util.isLiteral(l) ? 2 : 3;
  var rprec = N3Util.isBlank(r) ? 1 : N3Util.isLiteral(r) ? 2 : 3;
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

function extend(base) {
  if (!base) base = {};
  for (var i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
    for (var name in arg)
      base[name] = arg[name];
  return base;
}

function runtimeError () {
  var errorStr = Array.prototype.join.call(arguments, "");
  throw new Error("Runtime error: " + errorStr);
}

// ## Exports

// Export the `ShExValidator` class as a whole.
if (typeof require !== "undefined" && typeof exports !== "undefined")
  module.exports = { // node environment
    construct: ShExValidator,
    options: InterfaceOptions
  };
else
  ShExValidator =  { // browser environment
    construct: ShExValidator,
    options: InterfaceOptions
  };;
