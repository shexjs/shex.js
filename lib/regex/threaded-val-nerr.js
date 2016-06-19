function vpEngine (schema, shape) {
    var outerExpression = shape.expression;
    return {
      match:match
    };

    function match (graph, node, constraintList, constraintToTripleMapping, tripleToConstraintMapping, neighborhood, recurse, semActHandler, checkValueExpr, trace) {

      /*
       * returns: list of passing or failing threads (no heterogeneous lists)
       */
      function validateExpr (expr, thread) {
        var constraintNo = constraintList.indexOf(expr);
        var min = "min" in expr ? expr.min : 1;
        var max = "max" in expr ? expr.max === "*" ? Infinity : expr.max : 1;

        function validateRept (type, val) {
          var repeated = 0, errOut = false;
          var newThreads = [thread];
          var minmax = {  };
          if ("min" in expr && expr.min !== 1 || "max" in expr && expr.max !== 1) {
            minmax.min = expr.min;
            minmax.max = expr.max;
          }
          if ("semActs" in expr)
            minmax.semActs = expr.semActs;
          if ("annotations" in expr)
            minmax.annotations = expr.annotations;
          for (; repeated < max && !errOut; ++repeated) {
            var inner = [];
            for (var t = 0; t < newThreads.length; ++t) {
              var newt = newThreads[t];
              var sub = val(newt);
              if (sub.length > 0 && sub[0].errors.length === 0) {
                sub.forEach(newThread => {
                  var solutions =
                      "expression" in newt ? newt.expression.solutions : [];
                  if ("solution" in newThread)
                    solutions = solutions.concat(newThread.solution);
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
          if (newThreads.length > 0 && newThreads[0].errors.length === 0 &&
              !semActHandler.dispatchAll(expr.semActs || [], "???"))
            newThreads.forEach(newThread => {
              newThread.errors.push({ type: "SemActFailure", errors: [{ type: "UntrackedSemActFailure" }] });
            });
          return newThreads;
        }

        if (expr.type === "TripleConstraint") {
          var negated = "negated" in expr && expr.negated || max === 0;
          if (negated)
            min = max = Infinity;
          if (thread.avail[constraintNo] === undefined)
            thread.avail[constraintNo] = constraintToTripleMapping[constraintNo].slice();
          var minmax = {  };
          if ("min" in expr && expr.min !== 1 || "max" in expr && expr.max !== 1) {
            minmax.min = expr.min;
            minmax.max = expr.max;
          }
          if ("semActs" in expr)
            minmax.semActs = expr.semActs;
          if ("annotations" in expr)
            minmax.annotations = expr.annotations;
          var taken = thread.avail[constraintNo].splice(0, min);
          var passed = negated ? taken.length === 0 : taken.length >= min;
          var ret = [];
          var matched = thread.matched;
          if (passed) {
            do {
              ret.push({
                avail: thread.avail.map(a => { // copy parent thread's avail vector
                  return a.slice();
                }), // was: extend({}, thread.avail)
                errors: thread.errors.slice(),
                matched: matched.concat({
                  tNos: taken.slice()
                }),
                expression: extend({
                  type: "tripleConstraintSolutions",
                  predicate: expr.predicate,
                  valueExpr: expr.valueExpr,
                  solutions: taken.map(tripleNo =>  {
                    return { type: "halfTestedTriple", tripleNo: tripleNo, constraintNo: constraintNo };
                  })
                  // map(triple => {
                  //   var t = neighborhood[triple];
                  //   return {
                  //     type: "testedTriple", subject: t.subject, predicate: t.predicate, object: t.object
                  //   }
                  // })
                }, minmax)
              });
            } while ((function () {
              if (thread.avail[constraintNo].length > 0 && taken.length < max) {
                taken.push(thread.avail[constraintNo].shift());
                return true;
              } else {
                return false;
              }
            })());
          } else {
            ret.push({
              avail: thread.avail,
              errors: thread.errors.concat([{
                type: negated ? "NegatedProperty" : "MissingProperty",
                property: expr.predicate,
                valueExpr: expr.valueExpr
              }]),
              matched: matched
            });
          }

          return ret;
        }

        else if (expr.type === "SomeOf") {
          return validateRept("someOfSolutions", (th) => {
            var accept = null;
            var matched = [];
            var failed = [];
            expr.expressions.forEach(nested => {
              var thcopy = {
                avail: th.avail.map(a => { return a.slice(); }),
                errors: th.errors,
                matched: th.matched//.slice() ever needed??
              };
              var sub = validateExpr(nested, thcopy);
              if (sub[0].errors.length === 0) {
                matched = matched.concat(sub);
                sub.forEach(newThread => {
                  var expressions =
                      "solution" in thcopy ? thcopy.solution.expressions : [];
                  if ("expression" in newThread) // undefined for no matches on min card:0
                    expressions = expressions.concat([newThread.expression]);
                  delete newThread.expression;
                  newThread.solution = {
                    type: "someOfSolution",
                    expressions: expressions
                  };
                });
              } else
                failed = failed.concat(sub);
            });
            return matched.length > 0 ? matched : failed;
          });
        }

        else if (expr.type === "EachOf") {
          return validateRept("eachOfSolutions", (th) => {
            return expr.expressions.reduce((newThreads, nested) => {
              return newThreads.reduce((newts, newt) => {
                var sub = newts.concat(validateExpr(nested, newt));
                if (sub[0].errors.length === 0) {
                  sub.forEach(newThread => {
                    var expressions =
                        "solution" in newt ? newt.solution.expressions : [];
                    if ("expression" in newThread) // undefined for no matches on min card:0
                      expressions = expressions.concat([newThread.expression]);
                    delete newThread.expression;
                    newThread.solution = {
                      type: "eachOfSolution",
                      expressions: expressions
                    };
                  });
                }
                return sub;
              }, []);
            }, [th]);
          });
        }

        else if (expr.type === "Inclusion") {
          var included = schema.shapes[expr.include].expression;
          return validateExpr(included, thread);
        }

        runtimeError("unexpected expr type: " + expr.type);
      }

      var startingThread = { // starting thread
        avail:[],    // triples remaining by constraint number
        matched:[],  // triples matched in this thread
        errors:[]   // errors encounted
      };
      if (!outerExpression)
        return { }; // vapid match if no expression
      var ret = validateExpr(outerExpression, startingThread);
      // console.log(JSON.stringify(ret));
      // note: don't return if ret.length === 1 because it might fail the unmatchedTriples test.
      var longerChosen = ret[0].errors.length > 0 ? null :
          ret.reduce((ret, elt) => {
            var unmatchedTriples = {};
            // Collect triples assigned to some constraint.
            Object.keys(tripleToConstraintMapping).forEach(k => {
              if (tripleToConstraintMapping[k] !== undefined)
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
      return longerChosen !== null ? finish(longerChosen.expression, constraintList, neighborhood, recurse, semActHandler, checkValueExpr) :
        ret.length > 1 ? {
          type: "PossibleErrors",
          errors: ret.reduce((all, e) => {
            return all.concat([e.errors]);
          }, [])
        } : ret[0];
    }

    function finish (fromValidatePoint, constraintList, neighborhood, recurse, semActHandler, checkValueExpr) {
      function _dive (solns) {
        if (solns.type === "someOfSolutions" ||
            solns.type === "eachOfSolutions") {
          solns.solutions.forEach(s => {
            s.expressions.forEach(e => {
              _dive(e);
            });
          });
        } else if (solns.type === "tripleConstraintSolutions") {
          solns.solutions = solns.solutions.map(x => {
            if (x.type === "testedTriple") // already done
              return x; // c.f. validation/3circularRef1_pass-open
            var t = neighborhood[x.tripleNo];
            var expr = constraintList[x.constraintNo];
            var ret = {
              type: "testedTriple", subject: t.subject, predicate: t.predicate, object: t.object
            };
            var subErrors = checkValueExpr(expr.inverse ? t.subject : t.object, expr.valueExpr, expr.inverse, function (focus, shapeLabel) {
              var sub = recurse(focus, shapeLabel)
              if ("errors" in sub) {
                // console.dir(sub);
                return [{
                  type: "ReferenceError", focus: focus,
                  shape: shape, errors: sub
                }];
              }
              ret.referenced = sub; // !!! needs to aggregate errors and solutions
              return [];
            });
            if (subErrors.length === 0)
              if (!semActHandler.dispatchAll(expr.semActs || [], t))
                subErrors.push({ type: "SemActFailure", errors: [{ type: "UntrackedSemActFailure" }] }) // some semAct aborted
            if (subErrors.length > 0) {
              fromValidatePoint.errors = fromValidatePoint.errors || [];
              fromValidatePoint.errors = fromValidatePoint.errors.concat(subErrors);
            }
            return ret;
          });
        } else {
          runtimeError("unexpected expr type in " + JSON.stringify(solns));
        }
      }
      if (Object.keys(fromValidatePoint).length > 0) // guard against {}
        _dive(fromValidatePoint);
      if ("semActs" in shape)
        fromValidatePoint.semActs = shape.semActs;
      return fromValidatePoint;
    }
  }

function extend(base) {
  if (!base) base = {};
  for (var i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
    for (var name in arg)
      base[name] = arg[name];
  return base;
}

// ## Exports

var exports = { name: "threaded-val-nerr", compile: vpEngine };

// Export the `ShExValidator` class as a whole.
if (typeof require !== "undefined" && typeof exports !== "undefined")
  module.exports = exports;
else
  ThreadedValNErr = exports;
