"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegexpModule = void 0;
const term_1 = require("@shexjs/term");
const UNBOUNDED = -1;
/**
 * A thread's remaining pool, cloned.
 *
 * The Map was copied but the arrays inside it were not, and
 * matchTripleConstraint takes its triples by splicing them out -- so two
 * threads forked from one shared a pool, and what either took the other went
 * without.  Where a constraint is visited once that is invisible (the winner
 * consumed everything anyway); where it is visited again -- an iteration of a
 * repeated group -- the second visit found the pool drained by the first
 * visit's *other* branch, and reported the property missing.
 */
function ownPool(avail) {
    const mine = new Map();
    avail.forEach((triples, constraint) => mine.set(constraint, triples.slice()));
    return mine;
}
class RegexpThread {
    constructor(avail = new Map(), errors = [], matched = [], expression) {
        this.avail = avail;
        this.errors = errors;
        this.matched = matched;
        this.expression = expression;
    }
    makeResultsThread(expr, tests, errors, matched, minmax) {
        return new RegexpThread(ownPool(this.avail), // the parent's remaining triples, this thread's to spend
        errors, matched.concat({
            triples: tests.map(p => p.triple)
        }), Object.assign({ type: "TripleConstraintSolutions", predicate: expr.predicate }, expr.valueExpr !== undefined ? { valueExpr: expr.valueExpr } : {}, expr.id !== undefined ? { productionLabel: expr.id } : {}, minmax, { solutions: tests.map(p => p.tested) }));
    }
    makeMissingPropertyThread(expr, matched) {
        return new RegexpThread(ownPool(this.avail), this.errors.concat([
            Object.assign({ type: "MissingProperty", property: expr.predicate }, expr.valueExpr ? { valueExpr: expr.valueExpr } : {})
        ]), matched);
    }
}
exports.RegexpModule = {
    name: "eval-threaded-nerr",
    description: "emulation of regular expression engine with error permutations",
    /* compile - compile regular expression and index triple constraints
     */
    compile: (_schema, shape, index, debugHooks) => {
        return new EvalThreadedNErrRegexEngine(shape, index, debugHooks); // not called if there's no expression
    }
};
class EvalThreadedNErrRegexEngine {
    constructor(shape, index, debugHooks) {
        this.shape = shape;
        this.index = index;
        this.debugHooks = debugHooks;
        this.node = null; // the focus node while match() runs
        this.outerExpression = shape.expression;
        this.greedy = this.takesAllItCan(this.outerExpression);
    }
    /**
     * Which constraints can take every triple assigned to them at once.
     *
     * The validator hands this engine an assignment: each triple in the
     * neighborhood belongs to exactly one TripleConstraint (t2tc), and a
     * triple this expression doesn't consume is an ExcessTripleViolation.  So
     * for a constraint the expression reaches once, consuming fewer than all
     * of its triples cannot lead anywhere the maximum doesn't: there is no
     * other constraint those triples could go to.  Trying every prefix
     * length, as this engine did, multiplies out -- one thread per
     * combination of prefix lengths across the repeated constraints, all of
     * them passing, all but one of them discarded.
     *
     * Two shapes of expression still need the enumeration, and are left to
     * it: a constraint reached twice (the same TripleConstraint object under
     * two Inclusions) shares one pool of triples between two occurrences, and
     * a constraint under a repeated group is visited once per iteration.  In
     * both, what one visit takes is what another goes without -- e.g.
     * `&<onePlus>; &<onePlus>` over two triples matches only 1 + 1.
     */
    takesAllItCan(expr) {
        const once = new Set();
        const twice = new Set();
        const walk = (e, repeated, seen) => {
            if (typeof e === "string") {
                if (seen.has(e))
                    return; // recursive inclusion: already counted
                const included = this.index.tripleExprs[e];
                if (included === undefined)
                    return;
                return walk(included, repeated, new Set(seen).add(e));
            }
            switch (e.type) {
                case "TripleConstraint":
                    if (repeated || once.has(e))
                        twice.add(e);
                    once.add(e);
                    return;
                case "EachOf":
                case "OneOf": {
                    const max = e.max === undefined ? 1 : e.max;
                    const iterates = repeated || max === UNBOUNDED || max > 1;
                    e.expressions.forEach(nested => walk(nested, iterates, seen));
                    return;
                }
            }
        };
        walk(expr, false, new Set());
        twice.forEach(tc => once.delete(tc));
        return once;
    }
    match(node, constraintToTripleMapping, semActHandler, _trace) {
        this.node = node;
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
                // more than one way to read this neighborhood, and each of them
                // failed: say so as a disjunction rather than as a nested array
                type: "Alternatives",
                errors: ret.reduce((all, e) => {
                    return all.concat([{ type: "AllOf", errors: e.errors }]);
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
                const thcopy = new RegexpThread(ownPool(th.avail), th.errors, th.matched //.slice() ever needed??
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
        if (this.debugHooks && this.debugHooks.onConstraint)
            this.debugHooks.onConstraint(constraint, {
                node: this.node,
                triples: constraintToTripleMapping.get(constraint).map(pair => pair.triple),
            });
        if (thread.avail.get(constraint) === undefined)
            thread.avail.set(constraint, constraintToTripleMapping.get(constraint).map(pair => pair.triple));
        // all of them at once where nothing else could want them (takesAllItCan),
        // otherwise the minimum, and one more thread per triple after that
        const greedy = this.greedy.has(constraint);
        const wanted = greedy ? Math.min(thread.avail.get(constraint).length, max) : min;
        const taken = thread.avail.get(constraint).splice(0, Math.max(wanted, min));
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
            if (!greedy && thread.avail.get(constraint).length > 0 && taken.length < max) {
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
    /**
     * One thread per distinct future, rather than one per distinct past.
     *
     * Two threads at the same point in a repeated group with the same triples
     * left will match the rest of the expression the same way; they differ
     * only in *which* triples each iteration took, i.e. in the witness.  So
     * the frontier only needs one of each, and the ways to split N triples
     * across iterations -- the compositions of N, which is what made this
     * exponential -- collapse to the N+1 counts they can leave behind.
     *
     * Counts alone identify the future because the validator has already
     * assigned each triple to exactly one TripleConstraint (see t2tc): the
     * triples in a pool are interchangeable, and none of them is wanted
     * anywhere else.
     */
    static mergeEquivalent(threads) {
        if (threads.length < 2)
            return threads;
        const byRemaining = new Map();
        for (const thread of threads) {
            const counts = [];
            thread.avail.forEach(triples => counts.push(triples.length));
            const key = counts.join(",");
            if (!byRemaining.has(key))
                byRemaining.set(key, thread);
        }
        return Array.from(byRemaining.values());
    }
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
            let stumbled = [];
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
                    inner = inner.concat(sub);
                }
                else {
                    // This thread can't take another iteration.  Another might: the
                    // threads here are the ways the last iteration could have gone,
                    // and they leave different triples behind.  Returning on the
                    // first that stumbles discards the ones that would have finished
                    // -- which is how `( :p . + ; :q . ){2}` over two of each came to
                    // report :p missing, having spent both :p's in one iteration of
                    // the thread that happened to be looked at second.
                    stumbled = stumbled.concat(sub);
                }
            }
            if (inner.length === 0)
                // none of them could: short of the minimum that is the failure,
                // and past it the iterations already made stand
                return repeated < min ? stumbled : newThreads;
            newThreads = EvalThreadedNErrRegexEngine.mergeEquivalent(inner);
        }
        if (newThreads.length > 0 && newThreads[0].errors.length === 0 && groupTE.semActs !== undefined) {
            const passes = [];
            const failures = [];
            for (const newThread of newThreads) {
                const ctx = {
                    // (concat rather than flatMap: this package compiles against
                    // lib ES2021.String, which brings no Array.prototype.flatMap)
                    triples: [].concat(...newThread.matched.map(m => m.triples)),
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