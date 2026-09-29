/**
 * Evaluation: an AST, a context item and some bound variables in, a set
 * of terms out.
 *
 * Every expression denotes a set of RDF terms (distinct by term, order
 * immaterial).  A property step asks the data source for the neighborhood
 * of the context item -- the one question every NeighborhoodDb answers --
 * and keeps the arcs along that predicate; everything else is computed
 * from terms already in hand.  So the evaluator reaches data exactly the
 * way the validator does, one node at a time, and runs unchanged over any
 * data source: an in-memory store, an endpoint, a wikibase fetching pages
 * as it goes.
 *
 * A data source may answer synchronously or with a promise.  Rather than
 * two evaluators, every function here returns a Maybe<T>: the value when
 * it has it, a promise when it had to wait.  `then` and `all` chain either
 * without making a promise where there was none, so a local store never
 * pays for asynchrony.
 */
import type {Term, Quad} from "@rdfjs/types";
import {Node, textOf} from "./parser";
import {lookupFunction, TermSetLike} from "./functions";
import {
  termKey, equalTerms, compareTerms, ebvOf, bool, number, namedNode, valueOf, widerKind, NumericKind,
} from "./terms";

export type Maybe<T> = T | PromiseLike<T>;

export function isThenable<T> (x: Maybe<T>): x is PromiseLike<T> {
  return x !== null && typeof x === "object" && typeof (x as {then?: unknown}).then === "function";
}

export function then<T, U> (x: Maybe<T>, f: (t: T) => Maybe<U>): Maybe<U> {
  return isThenable(x) ? x.then(f) : f(x);
}

export function all<T> (xs: Maybe<T>[]): Maybe<T[]> {
  return xs.some(isThenable) ? Promise.all(xs) : xs as T[];
}

/** what went wrong with the expression rather than with the data: an
 * unbound variable, a step with nothing to step from, a bad arity */
export class EvalError extends Error {
  constructor (message: string) { super(message); this.name = "EvalError"; }
}

export class TermSet implements TermSetLike {
  readonly items: Term[] = [];
  private readonly keys = new Set<string>();

  static of (...terms: Term[]): TermSet {
    const s = new TermSet();
    terms.forEach(t => s.add(t));
    return s;
  }

  add (t: Term): this {
    const k = termKey(t);
    if (!this.keys.has(k)) { this.keys.add(k); this.items.push(t); }
    return this;
  }

  has (t: Term): boolean { return this.keys.has(termKey(t)); }
  get size (): number { return this.items.length; }
  /** effective boolean value: some item's is true */
  get ebv (): boolean { return this.items.some(ebvOf); }
}

export function union (sets: TermSet[]): TermSet {
  const out = new TermSet();
  sets.forEach(s => s.items.forEach(t => out.add(t)));
  return out;
}

export interface Neighborhood { outgoing: Quad[]; incoming: Quad[]; }

export interface DataSource {
  getNeighborhood (point: Term, shapeLabel: any, shape: any): Maybe<Neighborhood>;
}

export interface EvalContext {
  db: DataSource;
  /** what the data source is told is asking (a NeighborhoodDb's shapeLabel) */
  shapeLabel: string;
  code: string;
  /** arcs already fetched in this evaluation, by term and step */
  memo: Map<string, Maybe<Term[]>>;
}

export interface Env {
  item?: Term;
  vars: Map<string, TermSet>;
}

const withItem = (env: Env, item: Term): Env => ({item, vars: env.vars});
const bind = (env: Env, name: string, value: TermSet): Env => {
  const vars = new Map(env.vars);
  vars.set(name, value);
  return {item: env.item, vars};
};

// ── data access ─────────────────────────────────────────────────────────────

/** the terms one step away along `predicate`: the objects of the arcs out
 * of `term`, or the subjects of the arcs into it for an inverse step */
function arcs (ctx: EvalContext, term: Term, predicate: string, inverse: boolean): Maybe<Term[]> {
  if (!inverse && term.termType === "Literal")
    return [];                                        // a literal is the end of the road
  const key = termKey(term) + (inverse ? "|^" : "|") + predicate;
  const have = ctx.memo.get(key);
  if (have !== undefined)
    return have;
  // Told as a shape, so a source that fetches selectively (neighborhood-sparql
  // asks for a shape's predicates) fetches just this step.
  const shape = {type: "Shape", expression: Object.assign({type: "TripleConstraint", predicate}, inverse ? {inverse: true} : {})};
  const got = then(ctx.db.getNeighborhood(term, ctx.shapeLabel, shape), nb => inverse
    ? nb.incoming.filter(q => q.predicate.value === predicate).map(q => q.subject as Term)
    : nb.outgoing.filter(q => q.predicate.value === predicate).map(q => q.object as Term));
  if (isThenable(got)) {
    const settled = got.then(v => { ctx.memo.set(key, v); return v; });
    ctx.memo.set(key, settled);
    return settled;
  }
  ctx.memo.set(key, got);
  return got;
}

// ── evaluation ──────────────────────────────────────────────────────────────

const Comparisons: {[op: string]: (c: number) => boolean} = {
  "<": c => c < 0, "<=": c => c <= 0, ">": c => c > 0, ">=": c => c >= 0,
};

/** every combination of one item from each set */
function product (sets: TermSet[]): Term[][] {
  return sets.reduce<Term[][]>((acc, s) => {
    const out: Term[][] = [];
    acc.forEach(row => s.items.forEach(t => out.push(row.concat([t]))));
    return out;
  }, [[]]);
}

function numeric (t: Term): {n: number, kind: NumericKind} | undefined {
  if (t.termType !== "Literal") return undefined;
  const v = valueOf(t);
  return v.kind === "number" ? {n: v.n, kind: v.numeric} : undefined;
}

function arithmetic (op: string, l: TermSet, r: TermSet): TermSet {
  const out = new TermSet();
  for (const [a, b] of product([l, r])) {
    const x = numeric(a), y = numeric(b);
    if (x === undefined || y === undefined) continue;
    let kind = widerKind(x.kind, y.kind);
    let n: number;
    switch (op) {
    case "+": n = x.n + y.n; break;
    case "-": n = x.n - y.n; break;
    case "*": n = x.n * y.n; break;
    case "div":
      if (y.n === 0 && kind !== "double") continue;   // SPARQL: an error, so nothing
      n = x.n / y.n;
      if (kind === "integer") kind = "decimal";
      break;
    default:                                           // mod
      if (y.n === 0) continue;
      n = x.n % y.n;
    }
    out.add(number(n, kind));
  }
  return out;
}

function compare (op: string, l: TermSet, r: TermSet): TermSet {
  // general comparison: true if some pair compares so (XPath), pairs
  // without an order counting as not (SPARQL's type error)
  for (const [a, b] of product([l, r])) {
    if (op === "=") { if (equalTerms(a, b)) return TermSet.of(bool(true)); continue; }
    if (op === "!=") { if (!equalTerms(a, b)) return TermSet.of(bool(true)); continue; }
    const c = compareTerms(a, b);
    if (c !== undefined && Comparisons[op](c)) return TermSet.of(bool(true));
  }
  return TermSet.of(bool(false));
}

export function evaluate (node: Node, env: Env, ctx: EvalContext): Maybe<TermSet> {
  switch (node.type) {
  case "Context":
    if (env.item === undefined) throw noContext(node, ctx);
    return TermSet.of(env.item);

  case "Var": {
    const v = env.vars.get(node.name);
    if (v === undefined) throw new EvalError(`$${node.name} is not bound`);
    return v;
  }

  case "Literal":
    return TermSet.of(node.term);

  case "NodeRef":
    return TermSet.of(namedNode(node.iri));

  case "Step":
    if (env.item === undefined) throw noContext(node, ctx);
    return then(arcs(ctx, env.item, node.iri, node.inverse), ts => TermSet.of(...ts));

  case "Closure":
    return closure(node, env, ctx);

  case "Filter":
    return then(evaluate(node.expr, env, ctx), set =>
      then(all(set.items.map(item => evaluate(node.predicate, withItem(env, item), ctx))), tests => {
        const out = new TermSet();
        set.items.forEach((item, i) => { if (tests[i].ebv) out.add(item); });
        return out;
      }));

  case "Path":
    return node.steps.slice(1).reduce<Maybe<TermSet>>(
      (acc, step) => then(acc, set => then(all(set.items.map(item => evaluate(step, withItem(env, item), ctx))), union)),
      evaluate(node.steps[0], env, ctx));

  case "Sequence":
    return then(all(node.items.map(item => evaluate(item, env, ctx))), union);

  case "Negate":
    return then(evaluate(node.expr, env, ctx), set => {
      const out = new TermSet();
      set.items.forEach(t => { const v = numeric(t); if (v !== undefined) out.add(number(-v.n, v.kind)); });
      return out;
    });

  case "Not":
    return then(evaluate(node.expr, env, ctx), set => TermSet.of(bool(!set.ebv)));

  case "Binary":
    switch (node.op) {
    case "or":
      return then(evaluate(node.left, env, ctx), l => l.ebv ? TermSet.of(bool(true))
        : then(evaluate(node.right, env, ctx), r => TermSet.of(bool(r.ebv))));
    case "and":
      return then(evaluate(node.left, env, ctx), l => !l.ebv ? TermSet.of(bool(false))
        : then(evaluate(node.right, env, ctx), r => TermSet.of(bool(r.ebv))));
    case "implies":
      return then(evaluate(node.left, env, ctx), l => !l.ebv ? TermSet.of(bool(true))
        : then(evaluate(node.right, env, ctx), r => TermSet.of(bool(r.ebv))));
    default:
      return then(all([evaluate(node.left, env, ctx), evaluate(node.right, env, ctx)]), ([l, r]) => {
        switch (node.op) {
        case "union": return union([l, r]);
        case "intersect": { const out = new TermSet(); l.items.forEach(t => { if (r.has(t)) out.add(t); }); return out; }
        case "except": { const out = new TermSet(); l.items.forEach(t => { if (!r.has(t)) out.add(t); }); return out; }
        case "+": case "-": case "*": case "div": case "mod": return arithmetic(node.op, l, r);
        default: return compare(node.op, l, r);
        }
      });
    }

  case "Call": {
    const fn = lookupFunction(node.name);
    if (fn === undefined) throw new EvalError(`unknown function ${node.name}()`);
    if (node.args.length < fn.min || node.args.length > fn.max)
      throw new EvalError(`${node.name}() takes ${fn.min === fn.max ? fn.min : fn.max === Infinity ? `at least ${fn.min}` : `${fn.min} to ${fn.max}`} argument${fn.max === 1 ? "" : "s"}, not ${node.args.length}`);
    return then(all(node.args.map(arg => evaluate(arg, env, ctx))), sets => {
      if (fn.kind === "agg")
        return TermSet.of(...fn.agg!(sets));
      const out = new TermSet();
      for (const row of product(sets)) {
        const t = fn.map!(row);
        if (t !== undefined) out.add(t);
      }
      return out;
    });
  }

  case "Let":
    return then(evaluate(node.value, env, ctx), v => evaluate(node.body, bind(env, node.name, v), ctx));

  case "If":
    return then(evaluate(node.test, env, ctx), t => evaluate(t.ebv ? node.then : node.else, env, ctx));

  case "Quantified":
    return then(evaluate(node.domain, env, ctx), domain =>
      then(all(domain.items.map(item => evaluate(node.body, bind(env, node.name, TermSet.of(item)), ctx))), results =>
        TermSet.of(bool(node.kind === "some" ? results.some(r => r.ebv) : results.every(r => r.ebv)))));
  }
}

function noContext (node: Node, ctx: EvalContext): EvalError {
  return new EvalError(`"${textOf(ctx.code, node)}" has nothing to start from: there is no context item here `
                       + `(a start action has none); begin at $this, a variable, or a node (@<iri>)`);
}

/** the nodes reachable from the context item by 0+ (*), 1+ (+) or 0..1 (?)
 * applications of the expression, each application from the node before */
function closure (node: Node & {type: "Closure"}, env: Env, ctx: EvalContext): Maybe<TermSet> {
  if (env.item === undefined) throw noContext(node, ctx);
  const start = env.item;
  const result = new TermSet();
  if (node.kind !== "+") result.add(start);
  // what has been stepped from (or is about to be): the start is, so a
  // cycle back to it counts it as reached (for `+`) but doesn't loop
  const expanded = new Set([termKey(start)]);
  let frontier: Term[] = [start];
  const round = (): Maybe<TermSet> => {
    if (frontier.length === 0) return result;
    return then(all(frontier.map(m => evaluate(node.expr, withItem(env, m), ctx))), sets => {
      const next: Term[] = [];
      for (const s of sets)
        for (const t of s.items) {
          result.add(t);
          const k = termKey(t);
          if (!expanded.has(k)) { expanded.add(k); next.push(t); }
        }
      frontier = next;
      return node.kind === "?" ? result : round();
    });
  };
  return round();
}

// ── explaining a failure ────────────────────────────────────────────────────

/** an expression whose value doesn't depend on the data */
function isConstant (n: Node): boolean {
  switch (n.type) {
  case "Literal": case "NodeRef": return true;
  case "Sequence": return n.items.every(isConstant);
  case "Negate": return isConstant(n.expr);
  case "Binary": return (n.op === "+" || n.op === "-" || n.op === "*" || n.op === "div" || n.op === "mod" || n.op === "union")
      && isConstant(n.left) && isConstant(n.right);
  case "Call": return n.args.every(isConstant);
  default: return false;
  }
}

/** The sub-expressions whose values say why the assertion failed: the
 * operands of its comparisons, the paths its boolean functions look at.
 * Bound-variable scopes are left alone (their values aren't the top
 * context's), and so are constants. */
function collect (n: Node, out: Node[]): void {
  const push = (m: Node) => { if (!isConstant(m)) out.push(m); };
  switch (n.type) {
  case "Binary":
    if (n.op === "or" || n.op === "and" || n.op === "implies") { collect(n.left, out); collect(n.right, out); }
    else { push(n.left); push(n.right); }
    return;
  case "Not": case "Negate": collect(n.expr, out); return;
  case "If": collect(n.test, out); return;
  case "Call": {
    const fn = lookupFunction(n.name);
    const name = n.name.toLowerCase();
    if (name === "not" || name === "exists" || name === "empty" || name === "boolean") { n.args.forEach(a => collect(a, out)); return; }
    if (fn !== undefined && fn.kind === "agg") { push(n); return; }
    n.args.forEach(push);
    return;
  }
  case "Step": case "Path": case "Filter": case "Closure": case "Context": case "Var": push(n); return;
  default: return;
  }
}

const SHOWN = 6;

export function explain (ast: Node, env: Env, ctx: EvalContext, serialize: (t: Term) => string): Maybe<string[]> {
  const nodes: Node[] = [];
  collect(ast, nodes);
  const seen = new Set<string>();
  const wanted = nodes.filter(n => {
    const text = textOf(ctx.code, n);
    if (seen.has(text)) return false;
    seen.add(text);
    return true;
  });
  const lines = wanted.map(n => {
    const text = textOf(ctx.code, n);
    let value: Maybe<TermSet>;
    try { value = evaluate(n, env, ctx); } catch (_e) { return undefined; }
    const show = (set: TermSet): string => {
      const items = set.items.slice(0, SHOWN).map(serialize);
      if (set.items.length > SHOWN) items.push(`… (${set.items.length - SHOWN} more)`);
      return `${text} = ${items.length === 0 ? "(empty)" : items.join(", ")}`;
    };
    return isThenable(value) ? value.then(show, () => undefined) : show(value);
  });
  return then(all(lines), ls => ls.filter((l): l is string => l !== undefined));
}
