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

import type {TripleConstraint, tripleExpr, tripleExprOrRef} from "shexj";
import type {shapeExprOrRef} from "shexj";
import type {TcCounts} from "./feasibility";

const UNBOUNDED = -1;

/** one arc's share of a repair: add `delta` of them, or take away -`delta` */
export interface RepairArc {
  property: string;
  valueExpr?: shapeExprOrRef;
  delta: number;
}

/** one way to make the node conform: all of these arcs, together */
export interface Repair {
  type: "NearestBag";
  cost: number;
  arcs: RepairArc[];
}

interface Priced {
  cost: number;
  /** the bags that cost that much; more than one where the language offers
   * a real choice, e.g. `:a . | :b .` over a node with neither */
  bags: TcCounts[];
}

/** how many distinct minimal bags to carry; ties multiply through EachOf */
const KEEP = 8;

const min = (expr: {min?: number}) => expr.min === undefined ? 1 : expr.min;
const max = (expr: {max?: number}) =>
  expr.max === undefined ? 1 : expr.max === UNBOUNDED ? Infinity : expr.max;

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
function key (bag: TcCounts, index: Map<TripleConstraint, number>): string {
  const parts: number[] = [];
  let unknown = 0;
  bag.forEach((n, tc) => {
    if (n === 0) return;
    const at = index.get(tc);
    parts.push((at === undefined ? -(++unknown) : at) * 1e6 + n);
  });
  return parts.sort((a, b) => a - b).join(",");
}

export class NearestAcceptedBag {
  /** every TripleConstraint the expression reaches, in the order it does */
  public readonly tripleConstraints: TripleConstraint[] = [];
  private observed: TcCounts = new Map();
  private memo = new Map<string, Priced>();
  private ids = new Map<tripleExpr, number>();
  private slots = new Map<tripleExpr, TripleConstraint[]>();
  /** each constraint's position, so a bag can be keyed by what it holds */
  private tcIndex = new Map<TripleConstraint, number>();
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
  private answered = new Map<string, Repair[]>();

  constructor(
      private expr: tripleExprOrRef,
      private lookupInclusion: (label: string) => tripleExpr,
  ) {
    this.collect(this.resolve(expr, new Set()), new Set());
    this.tripleConstraints.forEach((tc, i) => this.tcIndex.set(tc, i));
  }

  private resolve(expr: tripleExprOrRef, seen: Set<string>): tripleExpr {
    if (typeof expr !== "string")
      return expr;
    if (seen.has(expr))
      throw Error(`recursive triple expression ${expr}`);
    seen.add(expr);
    return this.resolve(this.lookupInclusion(expr), seen);
  }

  private id(expr: tripleExpr): number {
    let at = this.ids.get(expr);
    if (at === undefined)
      this.ids.set(expr, at = this.ids.size);
    return at;
  }

  /** the constraints under a subexpression, so a bag can be scoped to it */
  private collect(expr: tripleExpr, seen: Set<string>): TripleConstraint[] {
    const already = this.slots.get(expr);
    if (already !== undefined)
      return already;
    let mine: TripleConstraint[];
    if (expr.type === "TripleConstraint") {
      mine = [expr];
      this.tripleConstraints.push(expr);
    } else {
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
  nearest(observed: TcCounts): Priced {
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
  repairs(observed: TcCounts, satisfies?: TripleConstraint[][]): Repair[] {
    // Keyed on the satisfaction relation when there is one -- it is what the
    // node actually holds (which triples, and which constraints each could
    // satisfy), of which `observed`'s per-constraint counts are one arbitrary
    // reading -- else on the counts alone (a count-only caller).
    const asked = satisfies === undefined
          ? key(observed, this.tcIndex)
          : this.satisfactionKey(satisfies);
    const already = this.answered.get(asked);
    if (already !== undefined)
      return already;
    const answer = this.computeRepairs(observed, satisfies);
    this.answered.set(asked, answer);
    return answer;
  }

  private computeRepairs(observed: TcCounts, satisfies?: TripleConstraint[][]): Repair[] {
    let best: Repair[] = [];
    let bestCost = Infinity;
    for (const dealt of this.deals(observed, satisfies)) {
      const found = this.repairsFor(dealt);
      if (found.length === 0 || found[0].cost > bestCost)
        continue;
      if (found[0].cost < bestCost) {
        bestCost = found[0].cost;
        best = [];
      }
      const said = (repair: Repair) =>
        repair.arcs.map(a => a.property + " " + a.delta).sort().join(",");
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

  /** how many ways to deal the pooled triples of one arc among its
   * constraints, in total, before this gives up on being exhaustive */
  static readonly DEALS = 64;

  /**
   * The ways to account the node's triples against the constraints that could
   * take them, one count-vector each for the DP to price.
   *
   * With a satisfaction relation (`satisfies`, one entry per triple naming
   * the constraints whose value expression it meets), G3: assign each triple
   * to one constraint it satisfies and pool the distinct count-vectors.  A
   * predicate constrained twice with *different* value expressions gets a
   * min-cost bipartite assignment this way -- the DP prices every candidate
   * vector and keeps the cheapest -- rather than the caller's arbitrary
   * count.  A predicate constrained twice with the *same* value expression
   * falls out as the special case where every triple satisfies both, which
   * reproduces the old stars-and-bars spread.
   *
   * Without one (a count-only caller), fall back to dealing indistinguishable
   * -- same predicate, same value expression -- constraints' pooled counts
   * every way, which is the usual single-constraint-per-arc no-op.
   */
  private deals(observed: TcCounts, satisfies?: TripleConstraint[][]): TcCounts[] {
    if (satisfies === undefined)
      return this.dealsByKind(observed);
    // group the triples' satisfying-sets by predicate (a triple has one
    // predicate, and only same-predicate constraints can take it)
    const byPredicate = new Map<string, TripleConstraint[][]>();
    for (const set of satisfies) {
      if (set.length === 0)
        continue; // a triple no constraint takes is homeless, not the DP's
      const already = byPredicate.get(set[0].predicate);
      if (already === undefined)
        byPredicate.set(set[0].predicate, [set]);
      else
        already.push(set);
    }
    let deals: TcCounts[] = [new Map()];
    for (const sets of byPredicate.values()) {
      const spreads = this.assignmentsFor(sets);
      const grown: TcCounts[] = [];
      for (const deal of deals)
        for (const spread of spreads) {
          if (grown.length >= NearestAcceptedBag.DEALS)
            break;
          const next = new Map(deal);
          spread.forEach((n, tc) => next.set(tc, n));
          grown.push(next);
        }
      deals = grown;
    }
    return deals;
  }

  /**
   * Every distinct count-vector from assigning each of one predicate's
   * triples to one constraint it satisfies (its satisfying-set).  The DFS is
   * over assignments, deduped by count-vector and capped at DEALS, so a
   * triple that satisfies only one constraint fixes that count and the common
   * one-constraint-per-predicate case yields a single vector.
   */
  private assignmentsFor(sets: TripleConstraint[][]): TcCounts[] {
    const seen = new Map<string, TcCounts>();
    const counts = new Map<TripleConstraint, number>();
    const vectorKey = (): string => {
      const parts: string[] = [];
      counts.forEach((n, tc) => { if (n > 0) parts.push(this.tcIndex.get(tc) + ":" + n); });
      return parts.sort().join(",");
    };
    const assign = (at: number): void => {
      if (seen.size >= NearestAcceptedBag.DEALS)
        return;
      if (at === sets.length) {
        const k = vectorKey();
        if (!seen.has(k)) {
          const vec: TcCounts = new Map();
          counts.forEach((n, tc) => { if (n > 0) vec.set(tc, n); });
          seen.set(k, vec);
        }
        return;
      }
      for (const tc of sets[at]) {
        counts.set(tc, (counts.get(tc) || 0) + 1);
        assign(at + 1);
        counts.set(tc, counts.get(tc)! - 1);
        if (seen.size >= NearestAcceptedBag.DEALS)
          return;
      }
    };
    assign(0);
    return seen.size === 0 ? [new Map()] : [...seen.values()];
  }

  /** the satisfaction relation as a stable key: per triple, its satisfying
   * constraints by index, sorted; the multiset of those over the node */
  private satisfactionKey(satisfies: TripleConstraint[][]): string {
    return satisfies
      .map(set => set.map(tc => this.tcIndex.get(tc)).sort((a, b) => a! - b!).join("."))
      .sort()
      .join("|");
  }

  /**
   * Every way of dealing the observed triples among constraints that are
   * indistinguishable -- same predicate, same value expression.  One deal
   * where every arc is constrained once, which is the usual case.  (The
   * count-only fallback for a caller with no satisfaction relation.)
   */
  private dealsByKind(observed: TcCounts): TcCounts[] {
    const byKind = new Map<string, TripleConstraint[]>();
    this.tripleConstraints.forEach(tc => {
      const kind = tc.predicate + " " + JSON.stringify(tc.valueExpr === undefined ? null : tc.valueExpr);
      const already = byKind.get(kind);
      if (already === undefined)
        byKind.set(kind, [tc]);
      else
        already.push(tc);
    });
    let deals: TcCounts[] = [new Map()];
    for (const kind of byKind.values()) {
      const pool = kind.reduce((sum, tc) => sum + (observed.get(tc) || 0), 0);
      const spreads: number[][] = [];
      const spread = (at: number, left: number, so_far: number[]): void => {
        if (spreads.length >= NearestAcceptedBag.DEALS)
          return;
        if (at === kind.length - 1)
          return void spreads.push(so_far.concat([left]));
        for (let mine = left; mine >= 0; --mine)
          spread(at + 1, left - mine, so_far.concat([mine]));
      };
      spread(0, pool, []);
      const grown: TcCounts[] = [];
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

  private repairsFor(observed: TcCounts): Repair[] {
    const {cost, bags} = this.nearest(observed);
    return bags.map(bag => ({
      type: "NearestBag" as const,
      cost,
      arcs: this.tripleConstraints.reduce<RepairArc[]>((arcs, tc) => {
        const delta = (bag.get(tc) || 0) - (observed.get(tc) || 0);
        return delta === 0 ? arcs : arcs.concat([Object.assign(
          {property: tc.predicate, delta},
          tc.valueExpr === undefined ? {} : {valueExpr: tc.valueExpr})]);
      }, []),
    }));
  }

  /** what the subtree holds now, which bounds how far its counts must move */
  private capacity(expr: tripleExpr): number {
    return this.slots.get(expr)!.reduce(
      (sum, tc) => sum + (this.observed.get(tc) || 0) + min(tc), 0);
  }

  /** this subexpression matched exactly `r` times */
  private cost(expr: tripleExpr, r: number): Priced {
    const memoKey = this.id(expr) + "@" + r;
    const already = this.memo.get(memoKey);
    if (already !== undefined)
      return already;
    const lo = r * min(expr);
    const hi = r * max(expr);
    const ceiling = Math.max(lo, Math.min(hi, this.capacity(expr)));
    let best: Priced = {cost: Infinity, bags: []};
    for (let t = lo; t <= ceiling; ++t)
      best = this.better(best, this.body(expr, t));
    this.memo.set(memoKey, best);
    return best;
  }

  /** this subexpression's body, contributing `t` matches in total */
  private body(expr: tripleExpr, t: number): Priced {
    if (expr.type === "TripleConstraint") {
      const have = this.observed.get(expr) || 0;
      return {cost: Math.abs(have - t), bags: [new Map([[expr, t]])]};
    }
    const children = expr.expressions.map(nested => this.resolve(nested, new Set()));
    if (expr.type === "EachOf")
      // every child matched t times; their slices don't overlap, so the
      // costs add and the bags combine
      return children.reduce<Priced>(
        (all, child) => this.together(all, this.cost(child, t)),
        {cost: 0, bags: [new Map()]});

    // OneOf: t matches shared out among the branches, every way of doing so
    let spread: Priced[] = [{cost: 0, bags: [new Map()]}];
    children.forEach((child, at) => {
      const next: Priced[] = [];
      for (let used = 0; used <= t; ++used) {
        let best: Priced = {cost: Infinity, bags: []};
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
    return spread[spread.length === 1 ? 0 : t] || {cost: Infinity, bags: []};
  }

  /** two disjoint slices of one bag */
  private together(a: Priced, b: Priced): Priced {
    if (a.cost === Infinity || b.cost === Infinity)
      return {cost: Infinity, bags: []};
    const bags: TcCounts[] = [];
    const seen = new Set<string>();
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
    return {cost: a.cost + b.cost, bags};
  }

  /** the cheaper of two, keeping both sets of bags on a tie */
  private better(a: Priced, b: Priced): Priced {
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
    return {cost: a.cost, bags};
  }
}
