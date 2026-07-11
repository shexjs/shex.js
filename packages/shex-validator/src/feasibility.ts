/**
 * A sound refutation test over partially-determined bags of TripleConstraint
 * assignments — the "feasibility" layer of the partition search.
 *
 * A *partial bag* gives every TripleConstraint TC an interval [lo(TC), hi(TC)]:
 * lo(TC) triples are committed to TC and at most hi(TC) are attainable.
 * `feasible(lo, hi)` returns false only if **no** bag between lo and hi
 * (pointwise) is accepted by the triple expression: a necessary condition
 * computable in time linear in the expression, not a decision procedure —
 * assignments that pass must still be verified by the regex engine.
 *
 * Two modes: in *exact* mode a subexpression must match exactly once, so OneOf
 * alternatives are exclusive (unchosen branches must be committable to zero)
 * and upper bounds apply. In *iterated* mode (under a group cardinality that
 * repeats) only the monotone consequences survive summation over iterations:
 * OneOf branches may mix, upper bounds vanish, but EachOf co-occurrence
 * survives at the occupancy level. Deliberately ignored (left to the regex
 * engine): count coupling between constraints of a repeated group and
 * divisibility constraints.
 *
 * Ported from the same analysis implemented for Apache Jena
 * (jena-shex/docs/matching-search-optimization.md, with soundness proof) and
 * rudof (docs/dev/feasibility-model.md).
 */

import type {TripleConstraint, tripleExpr, tripleExprOrRef} from "shexj";

export type TcCounts = Map<TripleConstraint, number>;

const UNBOUNDED = -1;

export class TripleExprFeasibility {
  /** All TripleConstraints (by identity) reachable from the expression. */
  public readonly tripleConstraints: TripleConstraint[] = [];

  private lo: TcCounts = new Map();
  private hi: TcCounts = new Map();

  /**
   * @param expr the shape's triple expression
   * @param lookupInclusion resolver for tripleExpr references (Inclusion)
   */
  constructor(
      private expr: tripleExprOrRef,
      private lookupInclusion: (label: string) => tripleExpr,
  ) {
    this.collect(expr, new Set());
  }

  private collect(expr: tripleExprOrRef, seen: Set<string>): void {
    if (typeof expr === "string") {
      if (seen.has(expr)) return;
      seen.add(expr);
      return this.collect(this.lookupInclusion(expr), seen);
    }
    switch (expr.type) {
      case "TripleConstraint": this.tripleConstraints.push(expr); break;
      case "EachOf": // fall through
      case "OneOf": expr.expressions.forEach(nested => this.collect(nested, seen)); break;
    }
  }

  /**
   * Whether some bag c with lo <= c <= hi (pointwise; missing entries are 0)
   * could be accepted by the expression. `false` is definitive; `true` is not.
   */
  feasible(lo: TcCounts, hi: TcCounts): boolean {
    this.lo = lo;
    this.hi = hi;
    return this.fx(this.expr, new Set());
  }

  private getLo(tc: TripleConstraint): number { return this.lo.get(tc) || 0; }
  private getHi(tc: TripleConstraint): number { return this.hi.get(tc) || 0; }
  private static min(expr: {min?: number}): number { return expr.min === undefined ? 1 : expr.min; }
  private static max(expr: {max?: number}): number { return expr.max === undefined ? 1 : expr.max; }

  /** The subexpression's slice can be committed to all-zero. */
  private zero(expr: tripleExprOrRef, seen: Set<string>): boolean {
    if (typeof expr === "string") {
      if (seen.has(expr)) return true;
      seen.add(expr);
      return this.zero(this.lookupInclusion(expr), seen);
    }
    switch (expr.type) {
      case "TripleConstraint": return this.getLo(expr) === 0;
      case "EachOf": case "OneOf": return expr.expressions.every(nested => this.zero(nested, seen));
    }
  }

  /** Applies the group cardinality decomposition shared by fx and fi:
   * how a subexpression with min/max on it relates to one or many matches. */
  private withCardinality(expr: EachOfOrOneOf, seen: Set<string>, once: (e: tripleExprOrRef, s: Set<string>) => boolean, body: (e: EachOfOrOneOf, s: Set<string>) => boolean): boolean {
    const min = TripleExprFeasibility.min(expr), max = TripleExprFeasibility.max(expr);
    if (max === 0)
      return this.zero(expr, new Set(seen));
    if (min === 0 && max === 1)                      // ?
      return this.zero(expr, new Set(seen)) || body.call(this, expr, seen);
    if (min === 1 && max === 1)                      // exactly once: no repetition
      return body.call(this, expr, seen);
    if (min === 0)                                   // * or {0,n}: zero or >=1 iterations
      return this.zero(expr, new Set(seen)) || (this.fiBody(expr, seen) && once.call(this, expr, seen));
    // min >= 1 with repetition: any accepted slice is a sum of >= 1 iteration bags
    return this.fiBody(expr, seen) && once.call(this, expr, seen);
  }

  /**
   * TripleConstraints in mandatory position (not inside a OneOf, no min-0 group
   * above them) whose predicate has no candidate triples at all: their absence
   * alone makes the expression unsatisfiable, and "MissingProperty" explains a
   * refutation better than a generic feasibility error.
   */
  unattainableMandatory(hi: TcCounts): TripleConstraint[] {
    const missing: TripleConstraint[] = [];
    const walk = (expr: tripleExprOrRef, seen: Set<string>): void => {
      if (typeof expr === "string") {
        if (seen.has(expr)) return;
        seen.add(expr);
        return walk(this.lookupInclusion(expr), seen);
      }
      if (TripleExprFeasibility.min(expr) === 0)
        return; // an optional group can be left empty
      switch (expr.type) {
        case "TripleConstraint":
          if ((hi.get(expr) || 0) === 0)
            missing.push(expr);
          return;
        case "EachOf":
          expr.expressions.forEach(nested => walk(nested, seen));
          return;
        case "OneOf":
          return; // no single branch is mandatory
      }
    };
    walk(this.expr, new Set());
    return missing;
  }

  /** Exact mode: necessary condition for the slice to be accepted exactly once. */
  private fx(expr: tripleExprOrRef, seen: Set<string>): boolean {
    if (typeof expr === "string") {
      if (seen.has(expr)) return true;
      seen.add(expr);
      return this.fx(this.lookupInclusion(expr), seen);
    }
    if (expr.type === "TripleConstraint") {
      const min = TripleExprFeasibility.min(expr), max = TripleExprFeasibility.max(expr);
      return (max === UNBOUNDED || this.getLo(expr) <= max) && this.getHi(expr) >= min;
    }
    return this.withCardinality(expr, seen, this.once, this.fxBody);
  }

  private fxBody(expr: EachOfOrOneOf, seen: Set<string>): boolean {
    if (expr.type === "EachOf")
      return expr.expressions.every(nested => this.fx(nested, seen));
    // OneOf, exact: one branch matches, the others' slices are zero
    return expr.expressions.some((branch, i) =>
        this.fx(branch, seen)
        && expr.expressions.every((other, j) => j === i || this.zero(other, new Set(seen))));
  }

  /** Iterated mode: the slice is a sum of >= 1 iteration bags — monotone weakening. */
  private fi(expr: tripleExprOrRef, seen: Set<string>): boolean {
    if (typeof expr === "string") {
      if (seen.has(expr)) return true;
      seen.add(expr);
      return this.fi(this.lookupInclusion(expr), seen);
    }
    if (expr.type === "TripleConstraint") {
      const min = TripleExprFeasibility.min(expr), max = TripleExprFeasibility.max(expr);
      return (min === 0 || this.getHi(expr) >= min) && (max !== 0 || this.getLo(expr) === 0);
    }
    const min = TripleExprFeasibility.min(expr), max = TripleExprFeasibility.max(expr);
    if (max === 0)
      return this.zero(expr, new Set(seen));
    if (min === 0)
      return this.zero(expr, new Set(seen)) || this.fiBody(expr, seen);
    return this.fiBody(expr, seen) && this.once(expr, seen);
  }

  private fiBody(expr: EachOfOrOneOf, seen: Set<string>): boolean {
    if (expr.type === "EachOf")
      return expr.expressions.every(nested => this.fi(nested, seen));
    // OneOf, iterated: branches may mix; an occupied branch must itself be iterable
    return expr.expressions.every(branch => this.zero(branch, new Set(seen)) || this.fi(branch, seen));
  }

  /** Occupancy of one non-empty iteration within hi. */
  private once(expr: tripleExprOrRef, seen: Set<string>): boolean {
    if (typeof expr === "string") {
      if (seen.has(expr)) return true;
      seen.add(expr);
      return this.once(this.lookupInclusion(expr), seen);
    }
    const min = TripleExprFeasibility.min(expr);
    if (expr.type === "TripleConstraint")
      return min === 0 || this.getHi(expr) >= min;
    if (min === 0)
      return true;
    return expr.type === "EachOf"
        ? expr.expressions.every(nested => this.once(nested, seen))
        : expr.expressions.some(nested => this.once(nested, seen));
  }
}

type EachOfOrOneOf = Extract<tripleExpr, {type: "EachOf" | "OneOf"}>;
