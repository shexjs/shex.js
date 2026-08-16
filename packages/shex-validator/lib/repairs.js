"use strict";
/**
 * The nearest bag the schema accepts, and what it takes to get there.
 *
 * A triple expression denotes a set of bags -- multisets of triple
 * constraints -- which is the RBE view ShEx was designed around (Staworko et
 * al., ICDT 2015, see doc/error-normalization.md).  A node's neighborhood,
 * once each triple is assigned to a constraint, is a bag too.  So a failure
 * can be reported as the difference between the bag the node has and the
 * closest bag the schema accepts: which arcs to add, which to take away.
 *
 * That answer is defined on the language and the data rather than on the
 * syntax tree, so two spellings of one language give one answer -- which is
 * the point of it.  `( :name . | :given . ; :family . ) ; :mbox .` and
 * `( :name . ; :mbox . | :given . ; :family . ; :mbox . )` describe the same
 * bags, and a node with only a :name is told to add an :mbox by both.
 *
 * The computation is a bottom-up dynamic program over the expression, which
 * is the repair form of the interval computation ShEx's tractability rests
 * on (and of ./feasibility.ts, which computes those intervals as a
 * refutation).  For a subexpression E and a number of iterations r:
 *
 *   TripleConstraint x, observed c   body(t) = |c - t|
 *   EachOf(E1..Ep)                   body(t) = sum_i cost_Ei(t)
 *   OneOf(E1..Ep)                    body(t) = min over r1+..+rp = t
 *                                                of sum_i cost_Ei(ri)
 *   any node with cardinality [m,M]  cost(r) = min over t in [r*m, r*M]
 *                                                of body(t)
 *
 * and the answer is cost_root(1).  Costs are small integers and the range of
 * t is bounded by what the node has plus what the schema requires, so this
 * is linear in the expression times a small factor -- no threads, no
 * backtracking, and complete over the counts.
 *
 * Where it is not exact, and says so: a bag is only as good as the
 * assignment of triples to constraints it was counted from (`EXTRA`, or one
 * predicate constrained twice, leaves that ambiguous -- general RBE matching
 * is NP-hard, and ShEx's tractable class is deterministic SORBE), and a
 * repeated group's iterations are treated as independent, which is the
 * coupling ./feasibility.ts also sets aside.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NearestAcceptedBag = void 0;
const UNBOUNDED = -1;
/** how many distinct minimal bags to carry; ties multiply through EachOf */
const KEEP = 8;
const min = (expr) => expr.min === undefined ? 1 : expr.min;
const max = (expr) => expr.max === undefined ? 1 : expr.max === UNBOUNDED ? Infinity : expr.max;
/**
 * A bag's identity, for the dedup in together() and better().
 *
 * Spelling it as one count per *known* constraint -- `order.map(tc =>
 * bag.get(tc) || 0).join(",")` -- costs a walk over every constraint the
 * expression reaches, plus an array and a string, for every combination
 * considered.  The bags are sparse, so nearly all of that emitted zeroes:
 * over shexTest this was the single hottest thing in the validator once
 * repairs became the default, at 34% of one test file's whole run.
 *
 * Keying on the non-zero entries alone is the same identity -- a missing
 * count and a zero count already meant the same thing -- and is
 * proportional to what the bag actually holds.
 */
function key(bag, index) {
    const parts = [];
    let unknown = 0;
    bag.forEach((n, tc) => {
        if (n === 0)
            return;
        const at = index.get(tc);
        parts.push((at === undefined ? -(++unknown) : at) * 1e6 + n);
    });
    return parts.sort((a, b) => a - b).join(",");
}
class NearestAcceptedBag {
    constructor(expr, lookupInclusion) {
        this.expr = expr;
        this.lookupInclusion = lookupInclusion;
        /** every TripleConstraint the expression reaches, in the order it does */
        this.tripleConstraints = [];
        this.observed = new Map();
        this.memo = new Map();
        this.ids = new Map();
        this.slots = new Map();
        /** each constraint's position, so a bag can be keyed by what it holds */
        this.tcIndex = new Map();
        /**
         * The answer for a bag this has already been asked about.
         *
         * The validator asks once per failing shape test, and a search that
         * ultimately succeeds still fails plenty of branches on the way: over
         * shexTest's parser round-trip -- where every test passes -- this was
         * asked 5485 times about 40 distinct bags.  The question is a pure
         * function of (expression, bag), and the expression is fixed per
         * instance, so the bag is the whole key.
         */
        this.answered = new Map();
        this.collect(this.resolve(expr, new Set()), new Set());
        this.tripleConstraints.forEach((tc, i) => this.tcIndex.set(tc, i));
    }
    resolve(expr, seen) {
        if (typeof expr !== "string")
            return expr;
        if (seen.has(expr))
            throw Error(`recursive triple expression ${expr}`);
        seen.add(expr);
        return this.resolve(this.lookupInclusion(expr), seen);
    }
    id(expr) {
        let at = this.ids.get(expr);
        if (at === undefined)
            this.ids.set(expr, at = this.ids.size);
        return at;
    }
    /** the constraints under a subexpression, so a bag can be scoped to it */
    collect(expr, seen) {
        const already = this.slots.get(expr);
        if (already !== undefined)
            return already;
        let mine;
        if (expr.type === "TripleConstraint") {
            mine = [expr];
            this.tripleConstraints.push(expr);
        }
        else {
            mine = [];
            expr.expressions.forEach(nested => {
                const resolved = this.resolve(nested, new Set(seen));
                this.collect(resolved, seen).forEach(tc => mine.push(tc));
            });
        }
        this.slots.set(expr, mine);
        return mine;
    }
    /**
     * The nearest bags to `observed`, and what they cost.  `observed` counts
     * triples per TripleConstraint; constraints it doesn't mention have none.
     */
    nearest(observed) {
        this.observed = observed;
        this.memo = new Map();
        return this.cost(this.resolve(this.expr, new Set()), 1);
    }
    /**
     * The repairs: one per nearest bag, each naming the arcs to add or drop.
     *
     * The counts come in per constraint, but a triple satisfying one of two
     * identical constraints satisfies the other, so which of them it was
     * counted against is the caller's accident and not the node's fault.  The
     * triples of each arc are pooled and dealt out again every way they can
     * be, and the best of those is the answer -- which is what makes
     * `( :name . ; :mbox . | :given . ; :family . ; :mbox . )` answer as its
     * one-`:mbox` spelling does.
     */
    repairs(observed) {
        const asked = key(observed, this.tcIndex);
        const already = this.answered.get(asked);
        if (already !== undefined)
            return already;
        const answer = this.computeRepairs(observed);
        this.answered.set(asked, answer);
        return answer;
    }
    computeRepairs(observed) {
        let best = [];
        let bestCost = Infinity;
        for (const dealt of this.deals(observed)) {
            const found = this.repairsFor(dealt);
            if (found.length === 0 || found[0].cost > bestCost)
                continue;
            if (found[0].cost < bestCost) {
                bestCost = found[0].cost;
                best = [];
            }
            const said = (repair) => repair.arcs.map(a => a.property + " " + a.delta).sort().join(",");
            const seen = new Set(best.map(said));
            found.forEach(repair => {
                if (!seen.has(said(repair))) {
                    seen.add(said(repair));
                    best.push(repair);
                }
            });
        }
        return best;
    }
    /**
     * Every way of dealing the observed triples among constraints that are
     * indistinguishable -- same predicate, same value expression.  One deal
     * where every arc is constrained once, which is the usual case.
     */
    deals(observed) {
        const byKind = new Map();
        this.tripleConstraints.forEach(tc => {
            const kind = tc.predicate + " " + JSON.stringify(tc.valueExpr === undefined ? null : tc.valueExpr);
            const already = byKind.get(kind);
            if (already === undefined)
                byKind.set(kind, [tc]);
            else
                already.push(tc);
        });
        let deals = [new Map()];
        for (const kind of byKind.values()) {
            const pool = kind.reduce((sum, tc) => sum + (observed.get(tc) || 0), 0);
            const spreads = [];
            const spread = (at, left, so_far) => {
                if (spreads.length >= NearestAcceptedBag.DEALS)
                    return;
                if (at === kind.length - 1)
                    return void spreads.push(so_far.concat([left]));
                for (let mine = left; mine >= 0; --mine)
                    spread(at + 1, left - mine, so_far.concat([mine]));
            };
            spread(0, pool, []);
            const grown = [];
            for (const deal of deals)
                for (const counts of spreads) {
                    if (grown.length >= NearestAcceptedBag.DEALS)
                        break;
                    const next = new Map(deal);
                    kind.forEach((tc, at) => next.set(tc, counts[at]));
                    grown.push(next);
                }
            deals = grown;
        }
        return deals;
    }
    repairsFor(observed) {
        const { cost, bags } = this.nearest(observed);
        return bags.map(bag => ({
            type: "NearestBag",
            cost,
            arcs: this.tripleConstraints.reduce((arcs, tc) => {
                const delta = (bag.get(tc) || 0) - (observed.get(tc) || 0);
                return delta === 0 ? arcs : arcs.concat([Object.assign({ property: tc.predicate, delta }, tc.valueExpr === undefined ? {} : { valueExpr: tc.valueExpr })]);
            }, []),
        }));
    }
    /** what the subtree holds now, which bounds how far its counts must move */
    capacity(expr) {
        return this.slots.get(expr).reduce((sum, tc) => sum + (this.observed.get(tc) || 0) + min(tc), 0);
    }
    /** this subexpression matched exactly `r` times */
    cost(expr, r) {
        const memoKey = this.id(expr) + "@" + r;
        const already = this.memo.get(memoKey);
        if (already !== undefined)
            return already;
        const lo = r * min(expr);
        const hi = r * max(expr);
        const ceiling = Math.max(lo, Math.min(hi, this.capacity(expr)));
        let best = { cost: Infinity, bags: [] };
        for (let t = lo; t <= ceiling; ++t)
            best = this.better(best, this.body(expr, t));
        this.memo.set(memoKey, best);
        return best;
    }
    /** this subexpression's body, contributing `t` matches in total */
    body(expr, t) {
        if (expr.type === "TripleConstraint") {
            const have = this.observed.get(expr) || 0;
            return { cost: Math.abs(have - t), bags: [new Map([[expr, t]])] };
        }
        const children = expr.expressions.map(nested => this.resolve(nested, new Set()));
        if (expr.type === "EachOf")
            // every child matched t times; their slices don't overlap, so the
            // costs add and the bags combine
            return children.reduce((all, child) => this.together(all, this.cost(child, t)), { cost: 0, bags: [new Map()] });
        // OneOf: t matches shared out among the branches, every way of doing so
        let spread = [{ cost: 0, bags: [new Map()] }];
        children.forEach((child, at) => {
            const next = [];
            for (let used = 0; used <= t; ++used) {
                let best = { cost: Infinity, bags: [] };
                for (let mine = 0; mine <= used; ++mine) {
                    const before = spread[used - mine];
                    if (before === undefined || before.cost === Infinity)
                        continue;
                    best = this.better(best, this.together(before, this.cost(child, mine)));
                }
                next[used] = best;
            }
            // the last branch has to land exactly on t; before that, keep the row
            spread = at === children.length - 1 ? [next[t]] : next;
        });
        return spread[spread.length === 1 ? 0 : t] || { cost: Infinity, bags: [] };
    }
    /** two disjoint slices of one bag */
    together(a, b) {
        if (a.cost === Infinity || b.cost === Infinity)
            return { cost: Infinity, bags: [] };
        const bags = [];
        const seen = new Set();
        for (const one of a.bags)
            for (const other of b.bags) {
                const merged = new Map(one);
                other.forEach((n, tc) => merged.set(tc, n));
                const k = key(merged, this.tcIndex);
                if (!seen.has(k)) {
                    seen.add(k);
                    if (bags.length < KEEP)
                        bags.push(merged);
                }
            }
        return { cost: a.cost + b.cost, bags };
    }
    /** the cheaper of two, keeping both sets of bags on a tie */
    better(a, b) {
        if (b.cost > a.cost)
            return a;
        if (b.cost < a.cost)
            return b;
        const bags = a.bags.slice();
        const seen = new Set(bags.map(bag => key(bag, this.tcIndex)));
        for (const bag of b.bags) {
            const k = key(bag, this.tcIndex);
            if (!seen.has(k)) {
                seen.add(k);
                if (bags.length < KEEP)
                    bags.push(bag);
            }
        }
        return { cost: a.cost, bags };
    }
}
exports.NearestAcceptedBag = NearestAcceptedBag;
/** how many ways to deal the pooled triples of one arc among its
 * constraints, in total, before this gives up on being exhaustive */
NearestAcceptedBag.DEALS = 64;
//# sourceMappingURL=repairs.js.map