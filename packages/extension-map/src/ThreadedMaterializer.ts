/** ThreadedMaterializer - materialization by iteration scopes.
 *
 * Builds an instance of an output schema from a ShExMap binding tree, read as a scope
 * tree (./scopes.ts): a scope's own bindings, and one list of iteration scopes per
 * repeated constraint or group of the input.  Nothing is flattened and nothing is
 * consumed (../doc/iteration-scopes.md is the normative description):
 *
 * - A constraint with a Map variable READS it from the scope it is evaluated at, or
 *   from the nearest ancestor scope that binds it.  Reading marks nothing, so a
 *   parent's binding can be read in every item, and twice in one.  A variable bound
 *   nowhere on that chain fails the constraint.
 * - A REPETITION in the output schema iterates one list of the input: the deepest list
 *   its body's variables are bound at (nested repetitions count through their parent
 *   list).  Its body runs once per iteration of that list, in list order, at that
 *   iteration's scope; an iteration whose body fails is skipped; the count of successful
 *   iterations must reach the minimum, and the repetition stops at the maximum.  A body
 *   whose variables are all bound at or above the current scope runs once, there.  A
 *   body whose variables live in two lists neither of which contains the other is
 *   ill-formed, and says so.
 * - CHOICES (OneOf, ShapeOr, an optional constraint, a shape with extensions) yield
 *   alternatives, per scope; the alternatives of the parts of a group or conjunction
 *   combine by product, pruned to the best maxAccepts as they combine.  Every complete
 *   alternative is an accept; materialize() returns the one that read the most distinct
 *   bindings (ties: most quads, then schema order), or whichever options.prefer ranks
 *   first, and keeps the rest in this.accepts.
 * - A value a Map code produces must SATISFY the constraint's value expression when
 *   that is a node constraint; a plain literal whose lexical form fits the datatype is
 *   retyped to it; any other mismatch fails the constraint (options.checkValues=false
 *   turns this off).
 * - NODE IDENTITY: a shape-valued constraint with a Map variable names its node; one
 *   with %Map:{ id(...) %} (./keys.ts) keys it, so equal keys merge; otherwise the node
 *   is a blank node determined by the root, the constraint, its call depth and the
 *   scope (its @node when it is an iteration, else its path), so runs agree.
 *
 * run() is a generator of debugger step events (MaterializerDebugger drives it):
 *   {type: "tripleConstraint", tc, thread}   before synthesizing a constraint
 *   {type: "fail", failure, thread}          the constraint failed (its alternative dies)
 *   {type: "enter", tc, thread, scope}       a repetition's body starts on an iteration
 *   {type: "return", thread}                 a subshape call completed
 *   {type: "accept", thread, quads}          a complete alternative (at the end, each)
 * The thread view is {subject, depth, frame (the scope's index in walk order), scope
 * (its path), consumed (distinct bindings read so far on this branch), skipped (always
 * 0), emitted, used ("<frame> <variable>" marks)}.  Every quad carries `tc` and `src`,
 * its provenance; this.provenance is parallel to the chosen quads.
 *
 * The frame-cursor design this replaces is described in ../doc/threaded-materializer.md.
 */
"use strict";

const extensions = require("./extensions");
const {n3idQuad2RdfJs, n3idTerm2RdfJs} = require("./stringToRdfJs");
import {ScopeTree, Scope, ListPath, BindingTreeError, isPrefix, pathKey} from "./scopes";
import {NODE_KEY} from "./bindingTree";
import {Template, NODE_ARGUMENT, isKeyCode, keyTerms, keyArguments, expandVariable, allMatches} from "./keys";

const MapExt = "http://shex.io/extensions/Map/#";
const variablePattern = /^ *(?:<([^>]*)>|([^:]*):([^ ]*)) *$/;
const functionPattern = /^\s*[a-zA-Z0-9]+\(.*\)\s*$/;
const UNBOUNDED = -1;

class MaterializationError extends Error {
  failures: any[];
  report: any;
  constructor (message: any, failures?: any) {
    super(failures && failures.length
          ? message + "; deepest failures: " + JSON.stringify(
            failures.slice(-3).map((f: any) => Object.assign({}, f, {tc: undefined})))
          : message);
    this.failures = failures || [];
  }
}

// -- results ---------------------------------------------------------------------------

/** one way to materialize something: its quads (each with tc and src) and the bindings read */
class Result {
  constructor (public quads: any[] = [], public reads: Set<string> = new Set()) {}
  then (other: Result): Result {
    const reads = new Set(this.reads);
    other.reads.forEach(r => reads.add(r));
    return new Result(this.quads.concat(other.quads), reads);
  }
}

const rank = (r: Result): [number, number] => [r.reads.size, r.quads.length];
const betterRank = (a: Result, b: Result): boolean =>
  a.reads.size > b.reads.size || (a.reads.size === b.reads.size && a.quads.length > b.quads.length);

/** the legacy flattening, kept for callers that still list frames; @-keys are dropped */
function normalizeBindingTree (tree: any) {
  return normalizeBindingTreeWithOrigins(tree).frames;
}

function normalizeBindingTreeWithOrigins (tree: any): {frames: any[], origins: any[]} {
  const walked = walk(tree, []);
  return {frames: walked.frames, origins: walked.origins};

  function walk (node: any, path: any[]): any {
    if (!Array.isArray(node)) {
      const counts: any = {};
      const origin: any = {};
      const own: any = {};
      for (const k of Object.keys(node)) {
        if (k.startsWith("@"))
          continue;
        own[k] = node[k];
        counts[k] = 1;
        origin[k] = path.concat([k]);
      }
      return {frames: [own], origins: [origin], leaf: true, counts};
    }
    const kids: any[] = node.map((kid: any, i: number) => walk(kid, path.concat([i])));
    const counts: any = {};
    kids.forEach((kid: any) => {
      for (const k of Object.keys(kid.counts))
        counts[k] = (counts[k] || 0) + kid.counts[k];
    });
    if (!kids.some((kid: any) => !kid.leaf))
      return {frames: [].concat.apply([], kids.map((kid: any) => kid.frames)),
              origins: [].concat.apply([], kids.map((kid: any) => kid.origins)),
              leaf: false, counts};
    const shared: any = {};
    const sharedOrigin: any = {};
    const ordered: any[] = [];
    kids.forEach((kid: any) => {
      if (kid.leaf) {
        const rest: any = {};
        const restOrigin: any = {};
        for (const [k, v] of Object.entries(kid.frames[0])) {
          if (counts[k] === 1) {
            shared[k] = v;
            sharedOrigin[k] = kid.origins[0][k];
          } else {
            rest[k] = v;
            restOrigin[k] = kid.origins[0][k];
          }
        }
        if (Object.keys(rest).length > 0)
          ordered.push({frames: [rest], origins: [restOrigin], leaf: true});
      } else {
        ordered.push(kid);
      }
    });
    const frames: any[] = [];
    const origins: any[] = [];
    ordered.forEach((kid: any) => kid.frames.forEach((frame: any, i: number) => {
      frames.push(kid.leaf ? frame : Object.assign({}, shared, frame));
      origins.push(kid.leaf ? kid.origins[i] : Object.assign({}, sharedOrigin, kid.origins[i]));
    }));
    if (frames.length === 0 && Object.keys(shared).length > 0) {
      // a scope whose lists are all empty still has its own bindings: one frame of them
      frames.push(shared);
      origins.push(sharedOrigin);
    }
    return {frames, origins, leaf: false, counts};
  }
}

// -- the materializer -------------------------------------------------------------------

/** what the debugger sees of the branch being evaluated */
interface Ctx { subject: any; scope: Scope; depth: number; lead: Result; }

class ThreadedMaterializer {
  schema: any; index: any; prefixes: any; globals: any;
  maxRepeat: number; maxCallDepth: number; maxSteps: number; maxAccepts: number; exploreSteps: number;
  prefer: ((a: any, b: any) => number) | null;
  requireBindingsInSubshapes: boolean;
  checkValues: boolean;
  accepts: any; chosen: any; provenance: any; lastReport: any;
  tree: ScopeTree | null = null;
  frames?: any; frameOrigins?: any;
  private _root: any = null;
  private _lists: Map<any, ListPath | null> = new Map();
  private _tcIndex: Map<any, number> = new Map();
  private _active: {key: string, label: string}[] = [];
  private _failures: any[] = [];
  private _referenced: Set<string> = new Set();
  private _dropped = 0;
  private _stack: Ctx[] = [];
  private _validator: any = null;

  constructor (schema: any, options: any = {}) {
    this.schema = schema;
    this.index = schema._index || require("@shexjs/visitor").ShExIndexVisitor.index(schema);
    this.prefixes = schema._prefixes || schema.prefixes || {};
    this.globals = options.staticVars || {};
    this.maxRepeat = "maxRepeat" in options && options.maxRepeat !== undefined ? options.maxRepeat : Infinity;
    this.maxCallDepth = options.maxCallDepth || 50;
    this.maxSteps = options.maxSteps || 1000000;      // accepted for compatibility; the search has no budget to spend
    this.maxAccepts = options.maxAccepts || 20;       // alternatives kept, at every level and at the end
    this.exploreSteps = options.exploreSteps || 10000; // likewise
    this.prefer = typeof options.prefer === "function" ? options.prefer : null;
    this.requireBindingsInSubshapes = options.requireBindingsInSubshapes === true;
    this.checkValues = options.checkValues !== false;
  }

  /** materialize - the quads of the best materialization of shapeLabel (default: start)
   * rooted at createRoot, as RdfJs quads */
  materialize (bindingTree: any, createRoot: any, shapeLabel?: any) {
    const it = this.run(bindingTree, createRoot, shapeLabel);
    let step = it.next();
    while (!step.done)
      step = it.next();
    return step.value;
  }

  /** run - the materialization as a generator of debugger step events (see the module
   * comment); returns the chosen quads or throws MaterializationError */
  * run (bindingTree: any, createRoot: any, shapeLabel: any): any {
    this.accepts = null;
    this.chosen = null;
    this.provenance = null;
    try {
      this.tree = new ScopeTree(bindingTree);
    } catch (e: any) {
      if (e instanceof BindingTreeError)
        throw new MaterializationError(e.message);
      throw e;
    }
    const view = this.tree.frames();
    this.frames = view.frames;           // for UIs that list the bindings by scope
    this.frameOrigins = view.origins;
    this._root = createRoot || "_:root";
    this._lists = new Map();
    this._tcIndex = new Map();
    this._active = [];
    this._failures = [];
    this._referenced = new Set();
    this._dropped = 0;
    this._stack = [];
    const start = shapeLabel || this.schema.start || runtimeError("no shape given and no start in schema");
    const label = typeof start === "string" ? start : "START";
    const results: Result[] = yield* this._shapeExpr(start, this.tree.root, this._root, 0, label);
    const seen = new Set<string>();
    const accepts: any[] = [];
    for (const r of results.slice().sort((a, b) => betterRank(a, b) ? -1 : betterRank(b, a) ? 1 : 0)) {
      const {quads, provenance} = collectQuadsAndProvenance(r.quads);
      const sig = quadSignature(quads);
      if (seen.has(sig))
        continue;
      seen.add(sig);
      const used = Array.from(r.reads).map(readMark(this.tree));
      accepts.push({quads, provenance, consumed: r.reads.size, skipped: 0,
                    thread: {subject: this._root, depth: 0, frame: 0, scope: [], consumed: r.reads.size, skipped: 0,
                             emitted: quads.length, used},
                    used});
    }
    this.accepts = accepts;
    const report = this.finishReport(accepts.length);
    if (accepts.length === 0)
      throw Object.assign(new MaterializationError("nothing materializes the shape from these bindings", this._failures),
                          {report});
    for (const a of accepts)
      yield {type: "accept", thread: a.thread, quads: a.quads};
    let best = accepts[0];
    if (this.prefer)
      for (const a of accepts)
        if (this.prefer(a, best) < 0)
          best = a;
    this.chosen = best;
    this.provenance = best.provenance;
    return best.quads;
  }

  finishReport (found: number) {
    const available = new Set<string>(Object.keys(this.globals).concat(this.tree ? this.tree.variables() : []));
    const seen = new Set<string>();
    this.lastReport = {
      unboundVariables: this._failures.filter((f: any) => {
        const key = f.variable + "\t" + (f.tc ? f.tc.predicate : "");
        if (!f.variable || available.has(f.variable) || seen.has(key))
          return false;
        seen.add(key);
        return true;
      }),
      unusedStatics: Object.keys(this.globals).filter((g: any) => !this._referenced.has(g)),
      alternatives: found,
      explorationTruncated: this._dropped > 0,
      configsPruned: this._dropped,
    };
    return this.lastReport;
  }

  /** liveThreads - the open shape calls, outermost first, as thread views; the last
   * (innermost, most recently entered) is marked current: it is where the debugger is
   * actually paused, the others merely not yet returned. */
  liveThreads () {
    return this._stack.map((ctx, i) => Object.assign(this.threadView(ctx), {deferred: false},
                                                collectQuadsAndProvenance(ctx.lead.quads),
                                                {used: Array.from(ctx.lead.reads).map(readMark(this.tree!)),
                                                 current: i === this._stack.length - 1}));
  }

  /** currentThread - the graph as it is built so far: every open shape call's own
   * emissions, aggregated outer to inner (a shape's completed earlier constraints, then
   * the shape its current constraint calls into, and so on to where the debugger is
   * paused).  liveThreads() lists each open call separately -- what #dbgThreads shows as
   * pending threads; a nested one's quads fold into its caller's only once it returns, so
   * none of those separate views alone has everything emitted so far.  This is their sum. */
  currentThread () {
    if (this._stack.length === 0)
      return null;
    const innermost = this._stack[this._stack.length - 1];
    const lead = this._stack.reduce((acc, ctx) => acc.then(ctx.lead), new Result());
    return Object.assign(this.threadView(innermost), {deferred: false, current: true},
                          collectQuadsAndProvenance(lead.quads),
                          {used: Array.from(lead.reads).map(readMark(this.tree!))});
  }

  threadView (ctx: Ctx) {
    return {subject: ctx.subject, depth: ctx.depth, frame: ctx.scope.index, scope: ctx.scope.path,
            consumed: ctx.lead.reads.size, skipped: 0, emitted: ctx.lead.quads.length,
            used: Array.from(ctx.lead.reads).map(readMark(this.tree!))};
  }

  // -- shape expressions ----------------------------------------------------------------
  * _shapeExpr (se: any, scope: Scope, subject: any, depth: number, label?: string): any {
    if (typeof se === "string") {
      const decl = this.index.shapeExprs[se];
      if (!decl)
        runtimeError("shape " + se + " not found in schema");
      const options = this.extensionCandidates(decl);
      if (options.length === 0)
        runtimeError("shape " + se + " is abstract and nothing extends it");
      return yield* this._guarded("ref|" + se + "|" + pathKey(scope.path) + "|" + subject, se, function* (this: ThreadedMaterializer) {
        const out: Result[] = [];
        for (const o of options)
          out.push(...(yield* this._shapeExpr(expressionOf(o), scope, subject, depth, se)));
        return this._prune(out);
      }.bind(this));
    }
    const fromRef = label !== undefined;      // a reference's guard already covers what it resolves to
    label = label || "(inline " + se.type + ")";
    const guard = (key: string, run: () => any) => fromRef ? run() : this._guarded(key, label!, run);
    switch (se.type) {
    case "ShapeDecl":
      return yield* this._shapeExpr(se.shapeExpr, scope, subject, depth, label);
    case "Shape":
      return yield* guard("shape|" + idOf(se) + "|" + pathKey(scope.path) + "|" + subject, function* (this: ThreadedMaterializer) {
        const parts = this.shapeParts(se).map((p: any) => p.expression);
        const ctx: Ctx = {subject, scope, depth, lead: new Result()};
        this._stack.push(ctx);
        try {
          let acc: Result[] = [new Result()];
          for (const e of parts) {
            const alternatives: Result[] = e ? yield* this._expression(e, scope, subject, depth) : [new Result()];
            if (alternatives.length === 0)
              return [];
            acc = this._all([acc, alternatives]);
            ctx.lead = acc[0];
          }
          return acc;
        } finally {
          this._stack.pop();
        }
      }.bind(this));
    case "ShapeAnd":
      return yield* guard("and|" + idOf(se) + "|" + pathKey(scope.path) + "|" + subject, function* (this: ThreadedMaterializer) {
        const alternatives: Result[][] = [];
        for (const p of se.shapeExprs)
          if (this.resolve(p).type !== "NodeConstraint")
            alternatives.push(yield* this._shapeExpr(p, scope, subject, depth));
        return this._all(alternatives);
      }.bind(this));
    case "ShapeOr":
      return yield* guard("or|" + idOf(se) + "|" + pathKey(scope.path) + "|" + subject, function* (this: ThreadedMaterializer) {
        const out: Result[] = [];
        for (const p of se.shapeExprs)
          if (this.resolve(p).type !== "NodeConstraint")
            out.push(...(yield* this._shapeExpr(p, scope, subject, depth)));
        return this._prune(out);
      }.bind(this));
    case "NodeConstraint":
      return [new Result()];
    default:
      runtimeError(se.type + " synthesis not supported");
    }
  }

  /** refuse a shape expression that reaches itself at the same scope and subject through
   * references alone (<A> @<B> OR ..., <B> @<A> OR ...) */
  * _guarded (key: string, label: string, run: () => any): any {
    const at = this._active.findIndex(a => a.key === key);
    if (at !== -1)
      runtimeError("cycle in shape expressions: ",
                   this._active.slice(at).map(a => a.label).concat(label).join(" -> "));
    this._active.push({key, label});
    try {
      return yield* run();
    } finally {
      this._active.pop();
    }
  }

  /** the declaration itself (unless abstract) first, then its non-abstract extensions */
  extensionCandidates (decl: any): any[] {
    const found: any[] = [];
    if (!decl.abstract)
      found.push(decl);
    const label = decl.id;
    if (label !== undefined) {
      const queue = [label];
      const seen = new Set<string>();
      while (queue.length) {
        const base = queue.shift()!;
        for (const other of this.schema.shapes || []) {
          const shape = expressionOf(other);
          const ext = shape && shape.extends ? shape.extends : [];
          if (ext.indexOf(base) !== -1 && !seen.has(other.id)) {
            seen.add(other.id);
            if (!other.abstract)
              found.push(other);
            queue.push(other.id);
          }
        }
      }
    }
    return found;
  }

  /** the shapes whose expressions share the node when it matches `shape`: what it EXTENDS
   * (transitively), then itself */
  shapeParts (shape: any, seen: Set<string> = new Set()): any[] {
    const parts: any[] = [];
    for (const base of shape.extends || []) {
      if (seen.has(base))
        continue;
      seen.add(base);
      const decl = this.index.shapeExprs[base];
      const se = decl ? this.resolve(expressionOf(decl)) : null;
      for (const s of shapesIn(se, this))
        parts.push(...this.shapeParts(s, seen));
    }
    parts.push(shape);
    return parts;
  }

  resolve (se: any): any {
    for (let hops = 0; typeof se === "string" || (se && se.type === "ShapeDecl"); ++hops) {
      if (hops > 100)
        runtimeError("shape reference loop at " + se);
      if (typeof se === "string") {
        const decl = this.index.shapeExprs[se];
        if (!decl)
          runtimeError("shape " + se + " not found in schema");
        se = decl;
      } else {
        se = se.shapeExpr;
      }
    }
    return se;
  }

  // -- triple expressions ---------------------------------------------------------------
  * _expression (expr: any, scope: Scope, subject: any, depth: number): any {
    if (typeof expr === "string")
      expr = this.index.tripleExprs[expr];
    const min = expr.min !== undefined ? expr.min : 1;
    const max = expr.max !== undefined ? (expr.max === UNBOUNDED ? Infinity : expr.max) : 1;
    if (min === 1 && max === 1)
      return yield* this._once(expr, scope, subject, depth, false);
    return yield* this._repetition(expr, min, max, scope, subject, depth);
  }

  * _once (expr: any, scope: Scope, subject: any, depth: number, skippable: boolean): any {
    switch (expr.type) {
    case "TripleConstraint":
      return yield* this._tc(expr, scope, subject, depth, skippable);
    case "EachOf": {
      const top = this._stack[this._stack.length - 1];
      const base = top ? top.lead : new Result();
      let acc: Result[] = [new Result()];
      for (const e of expr.expressions) {
        const alternatives: Result[] = yield* this._expression(e, scope, subject, depth);
        if (alternatives.length === 0) {
          if (top) top.lead = base;
          return [];
        }
        acc = this._all([acc, alternatives]);
        if (top)
          top.lead = base.then(acc[0]);
      }
      if (top)
        top.lead = base;
      return acc;
    }
    case "OneOf": {
      const out: Result[] = [];
      for (const e of expr.expressions)
        out.push(...(yield* this._expression(e, scope, subject, depth)));
      return this._prune(out);
    }
    default:
      runtimeError("unexpected tripleExpr type " + expr.type);
    }
  }

  * _repetition (expr: any, min: number, max: number, scope: Scope, subject: any, depth: number): any {
    const listPath = this.listPathOf(expr);
    const skippable = min === 0;
    if (listPath === null || listPath.length <= scope.depth) {
      if (min > 1)
        return [];
      const body: Result[] = yield* this._once(expr, scope, subject, depth, skippable);
      return body.length ? body : (min === 0 ? [new Result()] : []);
    }
    const cap = Math.min(max, this.maxRepeat);
    let results: Result[] = [new Result()];
    let count = 0;
    for (const item of scope.descendantsAt(listPath)) {
      if (count >= cap)
        break;
      yield {type: "enter", tc: firstConstraint(expr), thread: this.threadView(this.ctx(subject, item, depth)), scope: item.path};
      const body: Result[] = yield* this._once(expr, item, subject, depth, skippable);
      if (body.length === 0)
        continue;                    // this item does not fit the body: skip it
      results = this._all([results, body]);
      ++count;
    }
    return count >= min ? results : [];
  }

  * _tc (tc: any, scope: Scope, subject: any, depth: number, skippable: boolean): any {
    const view = () => this.threadView(this.ctx(subject, scope, depth));
    yield {type: "tripleConstraint", tc, thread: view()};
    const before = this._failures.length;
    const out: Result[] = yield* this._tcStep(tc, scope, subject, depth, skippable);
    if (out.length === 0)
      yield {type: "fail", failure: this._failures.length > before ? this._failures[this._failures.length - 1] : null,
             thread: view()};
    return out;
  }

  /** the branch being evaluated: the sum of the enclosing shapes' leading partial results */
  ctx (subject: any, scope: Scope, depth: number): Ctx {
    let lead = new Result();
    for (const c of this._stack)
      lead = lead.then(c.lead);
    return {subject, scope, depth, lead};
  }

  * _tcStep (tc: any, scope: Scope, subject: any, depth: number, skippable: boolean): any {
    const mapExts = (tc.semActs || []).filter((ext: any) => ext.name === MapExt);
    const triple = (object: any, src: any) => {
      if (tc.inverse && typeof object === "object")
        return failure({predicate: tc.predicate, tc, error: "literal subject of inverse"});
      return this._triple(tc, subject, object, src);
    };
    const failure = (f: any) => { this._failures.push(f); return null; };

    if (mapExts.some((ext: any) => isKeyCode(ext.code)))
      return yield* this._keyed(tc, mapExts, scope, subject, depth, skippable);

    if (mapExts.length > 0) {
      const reads = new Set<string>();
      const staticsRead: string[] = [];
      const get = (v: string): any => {
        this._referenced.add(v);
        if (v in this.globals) {
          staticsRead.push(v);
          return this.globals[v];
        }
        const hit = scope.lookup(v);
        if (hit === null)
          return undefined;
        reads.add(pathKey(hit.scope.path) + "|" + v);
        return hit.value;
      };
      const quads: any[] = [];
      const objects: any[] = [];
      for (const ext of mapExts) {
        const code = ext.code;
        const m = code.match(variablePattern);
        const before = new Set(reads);
        staticsRead.length = 0;
        let value: any;
        let how: any;
        if (m) {
          const varName = m[1] ? m[1] : this._expandPrefix(m[2], m[3]);
          value = get(varName);
          if (value === undefined)
            return failure({predicate: tc.predicate, tc, variable: varName, scope: scope.path}), [];
          how = {variables: [varName]};
        } else if (functionPattern.test(code)) {
          try {
            value = extensions.lower(code, {get: (v: string) => { const x = get(v); return x === undefined ? undefined : x; }}, this.prefixes);
          } catch (e: any) {
            return failure({predicate: tc.predicate, tc, code, error: e.message}), [];
          }
          if (value === undefined || value === null)
            return failure({predicate: tc.predicate, tc, code, error: "unbound"}), [];
          how = {code: code.trim(), variables: Array.from(reads).filter(r => !before.has(r)).map(r => r.split("|")[1])};
        } else {
          return failure({predicate: tc.predicate, tc, code, error: "unrecognized Map code"}), [];
        }
        if (this.checkValues) {
          const checked = this._checked(tc, value);
          if (checked === null)
            return failure({predicate: tc.predicate, tc, code, error: "the value does not satisfy the value expression"}), [];
          value = checked;
        }
        const object = n3ify(value);
        const src = Object.assign(how, {frame: scope.index, scope: scope.path, node: scope.nearestNode(),
                                        reads: Array.from(reads).filter(r => !before.has(r)).map(r => r.split("|")),
                                        statics: staticsRead.slice()});
        const q = triple(object, src);
        if (q === null)
          return [];
        quads.push(q);
        objects.push(object);
      }
      const result = new Result(quads, reads);
      if (this.referencesShape(tc.valueExpr) && objects.length === 1 && typeof objects[0] === "string" && !objects[0].startsWith('"')) {
        // the variable names the node: materialize the nested shape on it
        if (depth >= this.maxCallDepth)
          return failure({predicate: tc.predicate, tc, error: "exceeded maxCallDepth"}), [];
        quads[0].src.named = true;
        const nested: Result[] = yield* this._shapeExpr(tc.valueExpr, scope, objects[0], depth + 1);
        return nested.map(n => result.then(n));
      }
      return [result];
    }

    const valueExpr = tc.valueExpr === undefined ? undefined : this.resolve(tc.valueExpr);
    if (valueExpr && valueExpr.type === "NodeConstraint" && valueExpr.values && valueExpr.values.length === 1) {
      const q = triple(n3ify(valueExpr.values[0]), {constant: true, frame: scope.index, scope: scope.path, node: scope.nearestNode(), reads: [], statics: []});
      return q === null ? [] : [new Result([q])];
    }

    if (this.referencesShape(tc.valueExpr)) {
      if (depth >= this.maxCallDepth)
        return failure({predicate: tc.predicate, tc, error: "exceeded maxCallDepth"}), [];
      const node = this._mint(tc, scope, depth);
      const link = triple(node, {structural: true, frame: scope.index, scope: scope.path, node: scope.nearestNode(), reads: [], statics: []});
      if (link === null)
        return [];
      const out: Result[] = [];
      this._stack.push({subject, scope, depth, lead: new Result([link])});   // the link counts as emitted while the shape is built
      let nested: Result[];
      try {
        nested = yield* this._shapeExpr(tc.valueExpr, scope, node, depth + 1);
      } finally {
        this._stack.pop();
      }
      yield {type: "return", thread: this.threadView(this.ctx(subject, scope, depth))};
      for (const n of nested) {
        if (skippable && n.reads.size === 0 && (n.quads.length === 0 || this.requireBindingsInSubshapes))
          continue;                  // an optional island nothing asked for
        out.push(new Result([link].concat(n.quads), n.reads));
      }
      return out;
    }

    return failure({predicate: tc.predicate, tc,
                    error: "cannot synthesize valueExpr of type " + (valueExpr ? valueExpr.type : "undefined") + " without a Map semAct"}), [];
  }

  /** a shape-valued constraint with id(...): the node is a function of the key */
  * _keyed (tc: any, mapExts: any[], scope: Scope, subject: any, depth: number, skippable: boolean): any {
    if (mapExts.length > 1)
      runtimeError("id() must be the only Map code on the constraint at " + tc.predicate);
    if (!this.referencesShape(tc.valueExpr))
      runtimeError("id() at " + tc.predicate + " needs a shape-valued constraint: it names a node, not a value");
    const code = mapExts[0].code;
    let terms: (string | Template)[];
    try {
      terms = keyTerms(code, this.prefixes);
    } catch (e: any) {
      runtimeError(e.message);
    }
    const reads = new Set<string>();
    const staticsRead: string[] = [];
    let missing: string | null = null;
    const get = (v: string): any => {
      this._referenced.add(v);
      if (v in this.globals) {
        staticsRead.push(v);
        return this.globals[v];
      }
      const hit = scope.lookup(v);
      if (hit === null) {
        missing = v;
        return null;
      }
      reads.add(pathKey(hit.scope.path) + "|" + v);
      return hit.value;
    };
    const values: any[] = [];
    for (const term of terms!) {
      let value: any;
      if (term === NODE_ARGUMENT) {
        value = scope.nearestNode();
        if (value === null) {
          this._failures.push({predicate: tc.predicate, tc, code, error: "no @node in scope"});
          return [];
        }
      } else if (term instanceof Template) {
        value = term.expand(get);
      } else {
        value = get(term);
      }
      if (value === null || value === undefined) {
        this._failures.push({predicate: tc.predicate, tc, variable: missing || code, scope: scope.path});
        return [];
      }
      values.push(value);
    }
    const node = values.length === 1 && !(typeof values[0] === "object")
          ? n3ify(values[0])
          : "_:k" + digest([typeof tc.valueExpr === "string" ? tc.valueExpr : "inline" + this.tcOrdinal(tc)]
                           .concat(values.map(v => n3ify(v))).join("\u0000"));
    if (depth >= this.maxCallDepth) {
      this._failures.push({predicate: tc.predicate, tc, error: "exceeded maxCallDepth"});
      return [];
    }
    const src = {keyed: code.trim(), frame: scope.index, scope: scope.path, node: scope.nearestNode(),
                 reads: Array.from(reads).map(r => r.split("|")), statics: staticsRead.slice()};
    const link = tc.inverse && node.startsWith('"') ? null : this._triple(tc, subject, node, src);
    if (link === null)
      return [];
    const out: Result[] = [];
    const nested: Result[] = yield* this._shapeExpr(tc.valueExpr, scope, node, depth + 1);
    yield {type: "return", thread: this.threadView(this.ctx(subject, scope, depth))};
    for (const n of nested) {
      if (skippable && n.reads.size === 0 && reads.size === 0 && (n.quads.length === 0 || this.requireBindingsInSubshapes))
        continue;
      const all = new Set(reads);
      n.reads.forEach(r => all.add(r));
      out.push(new Result([link].concat(n.quads), all));
    }
    return out;
  }

  /** the node for a shape-valued constraint without a key: determined by the root, the
   * constraint, its call depth, and the scope -- the input node it matched when it is an
   * iteration, else its path -- so runs agree and materializing a root twice adds nothing */
  _mint (tc: any, scope: Scope, depth: number): string {
    const where = scope.node !== undefined && scope.node !== null ? n3ify(scope.node) : "p" + scope.path.join("_");
    return "_:m" + digest([n3ify(this._root), String(this.tcOrdinal(tc)), String(depth), where].join("\u0000"));
  }

  tcOrdinal (tc: any): number {
    if (!this._tcIndex.has(tc))
      this._tcIndex.set(tc, this._tcIndex.size);
    return this._tcIndex.get(tc)!;
  }

  referencesShape (se: any): boolean {
    if (se === undefined || se === null)
      return false;
    const r = this.resolve(se);
    return r && r.type !== "NodeConstraint";
  }

  // -- value expressions ----------------------------------------------------------------
  /** `value` (a JSON term) if it satisfies the constraint's value expression, a retyped
   * copy of a plain literal whose lexical form fits the expression's datatype, or null */
  _checked (tc: any, value: any): any {
    if (tc.valueExpr === undefined)
      return value;
    const se = this.resolve(tc.valueExpr);
    if (!isNodeConstraintish(se, this))
      return value;
    if (this._satisfies(se, value))
      return value;
    const dt = this._datatypeOf(se);
    if (dt && typeof value === "object" && value !== null && !("type" in value) && !("language" in value)) {
      const retyped = {value: value.value, type: dt};
      if (this._satisfies(se, retyped))
        return retyped;
    }
    return null;
  }

  _datatypeOf (se: any): string | null {
    se = this.resolve(se);
    if (se.type === "NodeConstraint")
      return se.datatype || null;
    if (se.type === "ShapeAnd") {
      const found = se.shapeExprs.map((p: any) => this._datatypeOf(p)).filter((d: any) => d);
      return new Set(found).size === 1 ? found[0] : null;
    }
    return null;
  }

  _satisfies (se: any, value: any): boolean {
    se = this.resolve(se);
    switch (se.type) {
    case "NodeConstraint": {
      const res = this.validator().testNodeConstraint(n3idTerm2RdfJs(n3ify(value)), se, {label: null});
      return res.type === "NodeConstraintTest";
    }
    case "ShapeAnd":
      return se.shapeExprs.every((p: any) => !isNodeConstraintish(this.resolve(p), this) || this._satisfies(p, value));
    case "ShapeOr":
      return se.shapeExprs.some((p: any) => this._satisfies(p, value));
    case "ShapeNot":
      return !this._satisfies(se.shapeExpr, value);
    default:
      return true;                 // a shape: the nested materialization is the check
    }
  }

  validator (): any {
    if (this._validator === null) {
      const {ShExValidator} = require("@shexjs/validator");
      this._validator = new ShExValidator(this.schema, {}, {});
    }
    return this._validator;
  }

  // -- which list a repetition iterates -------------------------------------------------
  listPathOf (expr: any): ListPath | null {
    if (!this._lists.has(expr))
      this._lists.set(expr, this.analyse(expr));
    return this._lists.get(expr)!;
  }

  /** the list the repetition `expr` iterates: the deepest list its body's variables are
   * bound at, nested repetitions counting through their parent list */
  analyse (expr: any): ListPath | null {
    const direct = new Set<string>();
    const nested: any[] = [];
    this.collect(expr, direct, nested, new Set(), true);
    const bound = this.tree!.boundAt;
    const candidates: {path: ListPath, why: string}[] = [];
    const add = (path: ListPath, why: string) => {
      if (!candidates.some(c => c.path.length === path.length && isPrefix(c.path, path)))
        candidates.push({path, why});
    };
    for (const v of direct)
      if (v in bound)
        add(bound[v], v);
    for (const r of nested) {
      const lp = this.listPathOf(r);
      if (lp && lp.length > 0)
        add(lp.slice(0, -1), "the repetition at " + predicatesOf(r));
    }
    if (candidates.length === 0)
      return null;
    const deepest = candidates.reduce((a, b) => b.path.length > a.path.length ? b : a);
    for (const c of candidates)
      if (!isPrefix(c.path, deepest.path))
        runtimeError("the repetition at " + predicatesOf(expr) + " reads from unrelated lists: " +
                     c.why + " is bound at [" + c.path + "] and " + deepest.why + " at [" + deepest.path + "]");
    return deepest.path;
  }

  /** variables read directly in `expr`'s body, and the repetitions directly inside it */
  collect (expr: any, direct: Set<string>, nested: any[], seen: Set<any>, top: boolean): void {
    if (typeof expr === "string")
      expr = this.index.tripleExprs[expr];
    if (!expr || seen.has(expr))
      return;
    seen.add(expr);
    if (!top && !((expr.min === undefined || expr.min === 1) && (expr.max === undefined || expr.max === 1))) {
      nested.push(expr);
      return;
    }
    if (expr.type === "TripleConstraint") {
      for (const ext of (expr.semActs || []).filter((e: any) => e.name === MapExt)) {
        try {
          for (const v of variablesOf(ext.code, this.prefixes))
            direct.add(v);
        } catch (e) {
          // an unparsable code fails at evaluation, where it is reported
        }
      }
      if (this.referencesShape(expr.valueExpr))
        this.collectShape(expr.valueExpr, direct, nested, seen);
    } else if (expr.type === "EachOf" || expr.type === "OneOf") {
      for (const e of expr.expressions)
        this.collect(e, direct, nested, seen, false);
    }
  }

  collectShape (se: any, direct: Set<string>, nested: any[], seen: Set<any>): void {
    if (typeof se === "string") {
      const decl = this.index.shapeExprs[se];
      if (!decl)
        return;
      for (const o of this.extensionCandidates(decl))
        this.collectShape(expressionOf(o), direct, nested, seen);
      return;
    }
    if (!se || seen.has(se))
      return;
    seen.add(se);
    if (se.type === "ShapeDecl") {
      this.collectShape(se.shapeExpr, direct, nested, seen);
    } else if (se.type === "Shape") {
      for (const p of this.shapeParts(se))
        if (p.expression)
          this.collect(p.expression, direct, nested, seen, false);
    } else if (se.type === "ShapeAnd" || se.type === "ShapeOr") {
      for (const p of se.shapeExprs)
        this.collectShape(p, direct, nested, seen);
    }
  }

  // -- combining alternatives -----------------------------------------------------------
  /** every combination of one alternative per part, pruned as it grows */
  _all (parts: Result[][]): Result[] {
    let acc: Result[] = [new Result()];
    for (const alternatives of parts) {
      if (alternatives.length === 0)
        return [];
      const next: Result[] = [];
      for (const a of acc)
        for (const b of alternatives)
          next.push(a.then(b));
      acc = this._prune(next);
    }
    return acc;
  }

  _prune (results: Result[]): Result[] {
    if (results.length <= this.maxAccepts)
      return results;
    const ranked = results.map((r, i) => ({r, i}))
          .sort((a, b) => betterRank(a.r, b.r) ? -1 : betterRank(b.r, a.r) ? 1 : a.i - b.i)
          .slice(0, this.maxAccepts)
          .sort((a, b) => a.i - b.i);
    this._dropped += results.length - ranked.length;
    return ranked.map(x => x.r);
  }

  /** an emitted triple with its provenance: the constraint and where its object came from */
  _triple (tc: any, subject: any, object: any, src?: any) {
    const q: any = tc.inverse
      ? {s: object, p: tc.predicate, o: subject}
      : {s: subject, p: tc.predicate, o: object};
    q.tc = tc;
    q.src = src;
    return q;
  }

  _expandPrefix (prefix: any, local: any) {
    return prefix in this.prefixes ? this.prefixes[prefix] + local : prefix + ":" + local;
  }

  /** update - materialize into `store`, replacing what the output schema currently holds
   * at `createRoot`: `rebind(root, shape)` (a function the caller supplies, e.g. from a
   * validator over the store) returns the validation result of the store at that root, or
   * null when the root holds nothing on the schema's predicates; what it matched and is
   * no longer produced is removed, the new quads are added, and everything else is left
   * alone.  Returns {added, removed} as RdfJs quads. */
  update (store: any, bindingTree: any, createRoot: any, shapeLabel: any, rebind: (root: any, shape: any) => any) {
    const quads = this.materialize(bindingTree, createRoot, shapeLabel);
    const key = (q: any) => [q.subject.value, q.predicate.value, q.object.termType, q.object.value,
                             q.object.termType === "Literal" ? (q.object.language || q.object.datatype.value) : ""].join("\u0000");
    const produced = new Map(quads.map((q: any) => [key(q), q]));
    const val = rebind(createRoot, shapeLabel);
    const current: any[] = [];
    if (val !== null && val !== undefined) {
      if (val.type === "Failure" || "errors" in val)
        runtimeError(n3ify(createRoot) + " holds something that does not conform to the output schema, so what to replace cannot be told");
      const {matchedTriples} = require("./bindingTree");
      for (const t of matchedTriples(val))
        current.push(n3idQuad2RdfJs(t.subject, t.predicate, n3ify(t.object)));
    }
    const removed = current.filter((q: any) => !produced.has(key(q)));
    const added = quads.filter((q: any) => store.countQuads(q.subject, q.predicate, q.object, q.graph) === 0);
    for (const q of removed)
      store.removeQuad(q);
    for (const q of quads)
      store.addQuad(q);
    return {added, removed};
  }
}

// -- helpers -----------------------------------------------------------------------------

function readMark (tree: ScopeTree) {
  const byPath = new Map(tree.scopes.map(s => [pathKey(s.path), s.index]));
  return (r: string) => {
    const [path, v] = r.split("|");
    return byPath.get(path) + " " + v;
  };
}

function expressionOf (decl: any): any {
  return decl && decl.type === "ShapeDecl" ? decl.shapeExpr : decl;
}

function idOf (se: any): string {
  if (!idOf.ids.has(se))
    idOf.ids.set(se, String(idOf.ids.size));
  return idOf.ids.get(se)!;
}
idOf.ids = new WeakMap<any, string>() as any;

function shapesIn (se: any, m: ThreadedMaterializer): any[] {
  if (!se)
    return [];
  se = m.resolve(se);
  if (se.type === "Shape")
    return [se];
  if (se.type === "ShapeAnd")
    return se.shapeExprs.reduce((acc: any[], p: any) => acc.concat(shapesIn(p, m)), []);
  return [];
}

function isNodeConstraintish (se: any, m: ThreadedMaterializer): boolean {
  if (!se)
    return false;
  if (se.type === "NodeConstraint")
    return true;
  if (se.type === "ShapeAnd" || se.type === "ShapeOr")
    return se.shapeExprs.some((p: any) => isNodeConstraintish(m.resolve(p), m));
  if (se.type === "ShapeNot")
    return isNodeConstraintish(m.resolve(se.shapeExpr), m);
  return false;
}

function variablesOf (code: string, prefixes: any): string[] {
  const m = code.match(variablePattern);
  if (m)
    return [m[1] ? m[1] : (m[2] in prefixes ? prefixes[m[2]] + m[3] : m[2] + ":" + m[3])];
  if (isKeyCode(code))
    return keyArguments(code, prefixes).filter(a => a !== NODE_ARGUMENT);
  if (functionPattern.test(code))
    return extensionVariables(code, prefixes);
  return [];
}

/** the variables a regex() or hashmap() code reads */
function extensionVariables (code: string, prefixes: any): string[] {
  const call = /^\s*([a-zA-Z0-9]+)\s*\((.*)\)\s*$/s.exec(code);
  if (!call)
    return [];
  if (call[1] === "hashmap") {
    const first = call[2].split(",")[0].trim();
    try { return [expandVariable(first, prefixes)]; } catch (e) { return []; }
  }
  if (call[1] === "regex") {
    const out: string[] = [];
    for (const g of allMatches(/\(\?<([^>]+)>/g, call[2])) {
      try { out.push(expandVariable(g[1].replace(/\\([\/^$])/g, "$1"), prefixes)); } catch (e) { /* not a variable */ }
    }
    return out;
  }
  return [];
}

function firstConstraint (expr: any): any {
  const stack = [expr];
  while (stack.length) {
    const e = stack.shift();
    if (!e || typeof e === "string")
      continue;
    if (e.type === "TripleConstraint")
      return e;
    if (e.expressions)
      stack.unshift(...e.expressions);
  }
  return null;
}

function predicatesOf (expr: any): string {
  const found: string[] = [];
  const stack = [expr];
  while (stack.length && found.length < 2) {
    const e = stack.shift();
    if (!e || typeof e === "string")
      continue;
    if (e.type === "TripleConstraint")
      found.push(e.predicate);
    else if (e.expressions)
      stack.unshift(...e.expressions);
  }
  return found.join(", ") || "(no predicate)";
}

/** A stable, 16-hex-digit digest for minting blank node ids: this only needs
 * distinct strings to land on distinct keys, not cryptographic strength, so
 * it avoids `crypto` -- this package ships a browser bundle (see
 * webpack.config.js) that can't resolve Node's `crypto` module. cyrb53-style:
 * two 32-bit mixes over the string's UTF-16 code units. */
function digest (s: string): string {
  let h1 = 0xdeadbeef ^ s.length, h2 = 0x41c6ce57 ^ s.length;
  for (let i = 0; i < s.length; ++i) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}

function quadSignature (quads: any[]) {
  return quads.map((q: any) => q.subject.value + " " + q.predicate.value + " " + q.object.termType + q.object.value).sort().join("\n");
}

/** a result's emissions as RdfJs quads, without repeats, with a parallel provenance array */
function collectQuadsAndProvenance (quadList: any[]) {
  const seen: any = {};
  const kept = quadList.filter((t: any) => {
    const key = t.s + " " + t.p + " " + t.o;
    return key in seen ? false : (seen[key] = true);
  });
  const quads = kept.map((t: any) => n3idQuad2RdfJs(t.s, t.p, t.o));
  return {
    quads,
    provenance: kept.map((t: any, i: number) => ({quad: quads[i], tc: t.tc, predicate: t.p, src: t.src})),
  };
}

function n3ify (ldterm: any) { // ShExJson term -> N3id string
  if (typeof ldterm !== "object" || ldterm === null)
    return ldterm;
  const ret = "\"" + ldterm.value + "\"";
  if ("language" in ldterm)
    return ret + "@" + ldterm.language;
  if ("type" in ldterm)
    return ret + "^^" + ldterm.type;
  return ret;
}

function runtimeError (...args: any[]): never {
  throw new MaterializationError(args.join(""));
}

/** MaterializerDebugger - step-through control over a materialization: drives
 * ThreadedMaterializer.run() one event at a time; synchronous.
 *
 *   const dbg = new MaterializerDebugger(materializer, bindings, "tag:root");
 *   dbg.addBreakpoint({predicate: "http://a.example/p"});
 *   let at = dbg.continue();        // runs to the breakpoint (or completion)
 *   at = dbg.stepInto();            // next event, entering subshape calls
 *   at = dbg.stepOver();            // next event at the same depth or above
 *   at = dbg.stepOut();             // next event above the current depth
 *   ... dbg.done, dbg.quads, dbg.error
 *
 * Breakpoints: {tc} a schema TripleConstraint object, {predicate} its IRI, or {subject}
 * the lexical (N3id) representation of a subject node being synthesized.
 */
class MaterializerDebugger {
  materializer: any; generator: any; breakpoints: any; current: any;
  done: boolean; quads: any; error: any; accepts?: any;

  constructor (materializer: any, bindingTree: any, createRoot: any, shapeLabel?: any) {
    this.materializer = materializer;
    this.generator = materializer.run(bindingTree, createRoot, shapeLabel);
    this.breakpoints = {tcs: new Set(), predicates: new Set(), subjects: new Set()};
    this.current = null;
    this.done = false;
    this.quads = null;
    this.error = null;
  }

  addBreakpoint ({tc, predicate, subject}: any) {
    if (tc) this.breakpoints.tcs.add(tc);
    if (predicate) this.breakpoints.predicates.add(predicate);
    if (subject) this.breakpoints.subjects.add(subject);
    return this;
  }

  removeBreakpoint ({tc, predicate, subject}: any) {
    if (tc) this.breakpoints.tcs.delete(tc);
    if (predicate) this.breakpoints.predicates.delete(predicate);
    if (subject) this.breakpoints.subjects.delete(subject);
    return this;
  }

  _hitsBreakpoint (event: any) {
    if (event.type !== "tripleConstraint")
      return false;
    return this.breakpoints.tcs.has(event.tc) ||
      this.breakpoints.predicates.has(event.tc.predicate) ||
      this.breakpoints.subjects.has(event.thread.subject);
  }

  _advance (stopWhen: any) {
    if (this.done)
      return this.current;
    while (true) {
      let step;
      try {
        step = this.generator.next();
      } catch (e) {
        this.done = true;
        this.error = e;
        return this.current = {type: "error", error: e};
      }
      if (step.done) {
        this.done = true;
        this.quads = step.value;
        this.accepts = this.materializer.accepts || [];
        return this.current = {type: "done", quads: step.value, accepts: this.accepts};
      }
      if (stopWhen(step.value) || this._hitsBreakpoint(step.value))
        return this.current = step.value;
    }
  }

  stepInto () { return this._advance(() => true); }

  stepOver () {
    const depth = this.current && this.current.thread ? this.current.thread.depth : 0;
    return this._advance((event: any) => event.thread && event.thread.depth <= depth);
  }

  stepOut () {
    const depth = this.current && this.current.thread ? this.current.thread.depth : 0;
    return this._advance((event: any) => event.thread && event.thread.depth < depth);
  }

  continue () { return this._advance(() => false); }

  /** the open shape calls (outermost first), each with its own partial emissions */
  threads () { return this.materializer.liveThreads(); }

  /** the graph as it is built so far -- every open call's emissions, aggregated */
  currentThread () { return this.materializer.currentThread(); }
}

/** tripleConstraints - every TripleConstraint of a schema in a deterministic order (see
 * the worker: an index into this ordering names the same constraint on either side of a
 * structured clone) */
function tripleConstraints (schema: any) {
  const found: any[] = [];
  const seen = new Set();
  const shapeExpr = (expr: any): void => {
    if (!expr || typeof expr !== "object" || seen.has(expr))
      return;
    seen.add(expr);
    switch (expr.type) {
    case "ShapeDecl": return shapeExpr(expr.shapeExpr);
    case "ShapeAnd": case "ShapeOr": return (expr.shapeExprs || []).forEach(shapeExpr);
    case "ShapeNot": return shapeExpr(expr.shapeExpr);
    case "Shape": return tripleExpr(expr.expression);
    }
  };
  const tripleExpr = (expr: any): void => {
    if (!expr || typeof expr !== "object" || seen.has(expr))
      return;
    seen.add(expr);
    switch (expr.type) {
    case "EachOf": case "OneOf": return (expr.expressions || []).forEach(tripleExpr);
    case "TripleConstraint":
      found.push(expr);
      return shapeExpr(expr.valueExpr);
    }
  };
  (schema.shapes || []).forEach(shapeExpr);
  return found;
}

export = {ThreadedMaterializer, MaterializerDebugger,
          normalizeBindingTree, normalizeBindingTreeWithOrigins,
          MaterializationError, tripleConstraints, NODE_KEY};
