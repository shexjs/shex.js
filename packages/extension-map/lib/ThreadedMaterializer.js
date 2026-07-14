/** ThreadedMaterializer - prototype NFA-thread-based ShExMap materializer.
 *
 * Motivation: the trivialMaterializer/ShExMaterializer pair walks the target
 * schema depth-first while sharing ONE mutable binder (a pointer into the
 * binding tree plus destructive "used" marks -- see binder() in
 * ../shex-extension-map.js).  When a required node deep in the schema can't be
 * satisfied, the containing node is eliminated, but the binder's pointer and
 * used-marks are NOT restored, so success depends precariously on visit order.
 *
 * This prototype treats materialization like Thompson/Pike NFA simulation
 * (c.f. rbenx in ./eval-simple-1err-materializer.js): the target schema
 * compiles to an NFA (plus a call stack for shape references, making it an
 * RTN/pushdown machine), and each live thread carries ITS OWN immutable
 * binding-tree cursor along with its NFA state, repetition counters and
 * emitted triples.  A thread that hits an unbound required variable simply
 * dies; sibling threads (fewer repetitions, skipped optional, other OneOf
 * disjunct) proceed with an uncorrupted cursor, giving the state rollback the
 * single-threaded implementation lacks.
 *
 * Thread anatomy:
 *   nfa       - compiled NFA of the shape instance being synthesized
 *   stateNo   - current state in that NFA
 *   subject   - N3id term whose arcs we are emitting
 *   repeats   - {reptStateNo: count} for counted repetitions (this instance)
 *   callStack - persistent list of {nfa, outs, subject, repeats, parent}
 *   cursor    - {idx, used} pointer into the normalized binding frames
 *   quads     - persistent list of emitted {s, p, o} N3id triples
 *   bnode     - counter for inventing intermediate blank nodes
 *
 * Scheduling here is depth-first with greedy priority (prefer another
 * repetition / the emitting arm of an optional / the first OneOf disjunct),
 * so the first accepting thread is the greedy-maximal materialization --
 * equivalent to a backtracking regex engine.  The same thread structure can
 * be stepped breadth-parallel (PikeVM style) by deduplicating threads on
 * (stateNo, callStack, cursor); see ../doc/threaded-materializer.md, which
 * also discusses determinizing this machine into a DFA.
 */
"use strict";

const extensions = require("./extensions");
const {n3idQuad2RdfJs} = require("./stringToRdfJs");

const MapExt = "http://shex.io/extensions/Map/#";
const variablePattern = /^ *(?:<([^>]*)>|([^:]*):([^ ]*)) *$/;
const functionPattern = /^\s*[a-zA-Z0-9]+\(.*\)\s*$/;
const UNBOUNDED = -1;

class MaterializationError extends Error {
  constructor (message, failures) {
    super(failures && failures.length
          ? message + "; deepest failures: " + JSON.stringify(
            // `tc` is the schema object (for editors to anchor on); its
            // serialization would bloat the message
            failures.slice(-3).map(f => Object.assign({}, f, {tc: undefined})))
          : message);
    this.failures = failures || [];
  }
}

/** normalizeBindingTree - flatten a binding tree to a sequence of frames.
 *
 * Reproduces the _mults/_cross preprocessing in binder(): bindings whose
 * variable occurs exactly once under an array level (e.g. bp:name next to a
 * list of repeated groups) are distributed into every frame produced by the
 * sibling arrays, preserving the association of multi-bindings while turning
 * the tree into a linear input tape for the NFA.
 */
function normalizeBindingTree (tree) {
  return walk(Array.isArray(tree) ? tree : [tree]).frames;

  function walk (node) {
    if (!Array.isArray(node)) {
      const counts = {};
      for (const k of Object.keys(node))
        counts[k] = 1;
      return {frames: [Object.assign({}, node)], leaf: true, counts};
    }
    const kids = node.map(walk);
    const counts = {};
    kids.forEach(kid => {
      for (const k of Object.keys(kid.counts))
        counts[k] = (counts[k] || 0) + kid.counts[k];
    });
    if (!kids.some(kid => !kid.leaf)) // plain sequence of frames
      return {frames: [].concat.apply([], kids.map(kid => kid.frames)), leaf: false, counts};

    // distribute each singleton binding from leaf kids into array kids' frames
    const shared = {};
    const ordered = [];
    kids.forEach(kid => {
      if (kid.leaf) {
        const rest = {};
        for (const [k, v] of Object.entries(kid.frames[0])) {
          if (counts[k] === 1)
            shared[k] = v;
          else
            rest[k] = v;
        }
        if (Object.keys(rest).length > 0)
          ordered.push({frames: [rest], leaf: true});
      } else {
        ordered.push(kid);
      }
    });
    const frames = [];
    ordered.forEach(kid => kid.frames.forEach(frame => {
      frames.push(kid.leaf ? frame : Object.assign({}, shared, frame));
    }));
    return {frames, leaf: false, counts};
  }
}

/** cursorGet - immutable lookup in the frame sequence.
 *
 * Mirrors binder().get: stay on the current frame if it holds an unused
 * binding for the variable, else scan forward; never move backward.  Returns
 * {value, cursor} with a NEW cursor (the caller's cursor is untouched), or
 * null if no unused binding remains -- unlike binder(), failure poisons
 * nothing.  cursor.n counts consumed frame bindings (globals don't count);
 * Rept states use it to demand progress from repeated subexpressions.
 */
function cursorGet (frames, globals, cursor, varName) {
  if (varName in globals) // staticVars: always available, never consumed
    return {value: globals[varName], cursor};
  for (let i = cursor.idx; i < frames.length; ++i) {
    const key = i + " " + varName;
    if (varName in frames[i] && !(key in cursor.used)) {
      const used = Object.assign({}, cursor.used);
      used[key] = true;
      return {value: frames[i][varName], cursor: {idx: i, used, n: cursor.n + 1}};
    }
  }
  return null;
}

class ThreadedMaterializer {
  constructor (schema, options = {}) {
    this.schema = schema;
    this.index = schema._index || require("@shexjs/util").index(schema);
    this.prefixes = schema._prefixes || schema.prefixes || {};
    this.globals = options.staticVars || {};
    this.maxRepeat = options.maxRepeat || 50;       // clamp unbounded cardinalities
    this.maxCallDepth = options.maxCallDepth || 50; // guard cyclic shape references
    this.maxSteps = options.maxSteps || 1000000;    // guard thread explosions
    this._nfaCache = new Map();
  }

  /** materialize - synthesize a graph instance of shapeLabel (default: start)
   * rooted at createRoot from the given binding tree.
   * Returns an array of RdfJs quads.
   */
  materialize (bindingTree, createRoot, shapeLabel) {
    // drain the step generator; debuggers drive run() themselves
    const it = this.run(bindingTree, createRoot, shapeLabel);
    let step = it.next();
    while (!step.done)
      step = it.next();
    return step.value;
  }

  /** run - the materialization as a generator of debugger step events (see
   * MaterializerDebugger and doc/debugger-design.md at the repository root).
   * Yields, in traversal order:
   *   {type: "tripleConstraint", tc, thread}  before synthesizing a constraint
   *   {type: "fail", failure, thread}         a branch died (its emissions and
   *                                           cursor marks are discarded)
   *   {type: "return", thread}                a subshape call completed
   * and returns the accepted quads (or throws MaterializationError).
   * thread = {subject, depth (subshape call depth), frame (binding-frame
   * cursor), consumed (bindings consumed), emitted (quads so far)}.
   */
  * run (bindingTree, createRoot, shapeLabel) {
    const frames = normalizeBindingTree(bindingTree);
    const nfa = this._compileShapeExprNFA(shapeLabel || this.schema.start
                                          || runtimeError("no shape given and no start in schema"));
    const failures = [];
    // for this.lastReport: which variables the schema referenced, and which
    // were available at all (a typo'd variable name silently prunes every
    // branch that needs it -- e.g. a starred subshape collapses to zero
    // iterations -- so surface never-bound variables and unused statics)
    const report = {referenced: new Set()};
    const availableVars = new Set(Object.keys(this.globals));
    frames.forEach(frame => Object.keys(frame).forEach(v => availableVars.add(v)));
    const finishReport = (error) => {
      const seen = new Set();
      this.lastReport = {
        unboundVariables: failures.filter(f => {
          const key = f.variable + "\t" + (f.tc ? f.tc.predicate : "");
          if (!f.variable || availableVars.has(f.variable) || seen.has(key))
            return false;
          seen.add(key);
          return true;
        }),
        unusedStatics: Object.keys(this.globals).filter(g => !report.referenced.has(g)),
      };
      if (error)
        error.report = this.lastReport;
      return error;
    };
    const stack = [{
      nfa, stateNo: nfa.start,
      subject: createRoot || "_:root",
      repeats: {}, callStack: null,
      cursor: {idx: 0, used: {}, n: 0},
      quads: null, bnode: 0
    }];
    let steps = 0;

    while (stack.length > 0) {
      if (++steps > this.maxSteps)
        throw finishReport(new MaterializationError("exceeded maxSteps=" + this.maxSteps, failures));
      const th = stack.pop();
      const st = th.nfa.states[th.stateNo];
      switch (st.type) {

      case "Match":
        if (th.callStack === null) {
          finishReport(null);
          return collectQuads(th.quads); // accept: greedy-first materialization
        }
        { // return from a shape-reference call
          // the return event belongs to the caller's level: step-out from
          // inside the call lands here
          yield {type: "return",
                 thread: Object.assign(threadView(th), {depth: stackDepth(th.callStack) - 1})};
          const frame = th.callStack;
          // vacuous-descend rule: greedy entry into an OPTIONAL shape-valued
          // constraint whose subshape then emitted nothing and consumed
          // nothing would leave a dangling bnode island; drop this thread --
          // the skip arm already queued yields the same content without it.
          // (A REQUIRED constraint keeps its empty island, as the old
          // materializer did.)
          if (frame.skippable && th.quads === frame.quadsMark && th.cursor.n === frame.consumedMark)
            break;
          frame.outs.forEach(out => stack.push(Object.assign({}, th, {
            nfa: frame.nfa, stateNo: out,
            subject: frame.subject, repeats: frame.repeats,
            callStack: frame.parent
          })));
        }
        break;

      case "Split": // OneOf: first disjunct has priority, so push it last
        for (let i = st.outs.length - 1; i >= 0; --i)
          stack.push(Object.assign({}, th, {stateNo: st.outs[i]}));
        break;

      case "Rept": {
        const r = th.repeats[th.stateNo] || {n: 0, at: -1};
        if (r.n >= st.min) { // exit arm (lower priority): reset counter for possible re-entry
          const repeats = Object.assign({}, th.repeats);
          delete repeats[th.stateNo];
          stack.push(Object.assign({}, th, {stateNo: st.outs[1], repeats}));
        }
        // greedy: another repetition, but only if the previous iteration
        // consumed a frame binding -- constant- or staticVar-only
        // subexpressions stay satisfiable forever, so without this progress
        // guard a starred one would loop to maxRepeat.
        if (r.n < Math.min(st.max, this.maxRepeat) && (r.n === 0 || th.cursor.n > r.at)) {
          const repeats = Object.assign({}, th.repeats);
          repeats[th.stateNo] = {n: r.n + 1, at: th.cursor.n};
          stack.push(Object.assign({}, th, {stateNo: st.outs[0], repeats}));
        }
        break;
      }

      case "TC": {
        yield {type: "tripleConstraint", tc: st.tc, thread: threadView(th)};
        const stackLen = stack.length;
        const failuresLen = failures.length;
        this._stepTripleConstraint(th, st, frames, stack, failures, report);
        if (stack.length === stackLen) // no successors: this branch died
          yield {type: "fail",
                 failure: failures.length > failuresLen ? failures[failures.length - 1] : null,
                 thread: threadView(th)};
        break;
      }

      default:
        runtimeError("unexpected NFA state type " + st.type);
      }
    }
    throw finishReport(new MaterializationError("no thread reached an accepting state", failures));
  }

  /** _stepTripleConstraint - one TC visit synthesizes exactly one instance of
   * the constraint (cardinality is handled by the surrounding Rept states):
   *  - Map semActs: resolve each variable/function against this thread's
   *    cursor; any unbound variable kills the thread (rollback comes free).
   *  - singleton value set: emit the constant.
   *  - shape-valued: invent a bnode, link it, and call into the sub-shape NFA.
   */
  _stepTripleConstraint (th, st, frames, stack, failures, report) {
    const tc = st.tc;
    const mapExts = (tc.semActs || []).filter(ext => ext.name === MapExt);

    if (mapExts.length > 0) {
      let cursor = th.cursor;
      const objects = [];
      for (const ext of mapExts) {
        const code = ext.code;
        const m = code.match(variablePattern);
        if (m) {
          const varName = m[1] ? m[1] : this._expandPrefix(m[2], m[3]);
          report.referenced.add(varName);
          const hit = cursorGet(frames, this.globals, cursor, varName);
          if (hit === null) {
            failures.push({predicate: tc.predicate, tc, variable: varName, frame: cursor.idx});
            return; // unbound required variable: this thread dies
          }
          cursor = hit.cursor;
          objects.push(n3ify(hit.value));
        } else if (functionPattern.test(code)) {
          try { // e.g. regex(...)/hashmap(...): lower() pulls variables via get()
            const adapter = {get: (v) => {
              report.referenced.add(v);
              const hit = cursorGet(frames, this.globals, cursor, v);
              if (hit === null)
                return undefined;
              cursor = hit.cursor;
              return hit.value;
            }};
            objects.push(extensions.lower(code, adapter, this.prefixes));
          } catch (e) {
            failures.push({predicate: tc.predicate, tc, code, error: e.message});
            return;
          }
        } else {
          failures.push({predicate: tc.predicate, tc, code, error: "unrecognized Map code"});
          return;
        }
      }
      let quads = th.quads;
      for (const o of objects)
        quads = {q: this._triple(tc, th.subject, o), prev: quads};
      st.outs.forEach(out => stack.push(Object.assign({}, th, {stateNo: out, cursor, quads})));
      return;
    }

    const valueExpr = tc.valueExpr === undefined ? undefined : this._resolveShapeExpr(tc.valueExpr);
    if (valueExpr && valueExpr.type === "NodeConstraint"
        && valueExpr.values && valueExpr.values.length === 1) {
      const quads = {q: this._triple(tc, th.subject, n3ify(valueExpr.values[0])), prev: th.quads};
      st.outs.forEach(out => stack.push(Object.assign({}, th, {stateNo: out, quads})));
      return;
    }

    if (valueExpr && ["Shape", "ShapeAnd", "ShapeOr"].indexOf(valueExpr.type) !== -1) {
      if (stackDepth(th.callStack) >= this.maxCallDepth) {
        failures.push({predicate: tc.predicate, tc, error: "exceeded maxCallDepth"});
        return;
      }
      const bnode = "_:tm" + th.bnode;
      const sub = this._compileShapeExprNFA(valueExpr);
      const quads = {q: this._triple(tc, th.subject, bnode), prev: th.quads};
      stack.push(Object.assign({}, th, {
        nfa: sub, stateNo: sub.start,
        subject: bnode, repeats: {},
        callStack: {nfa: th.nfa, outs: st.outs, subject: th.subject, repeats: th.repeats, parent: th.callStack,
                    skippable: st.skippable === true, quadsMark: quads, consumedMark: th.cursor.n},
        quads,
        bnode: th.bnode + 1
      }));
      return;
    }

    failures.push({predicate: tc.predicate, tc,
                   error: "cannot synthesize valueExpr of type "
                   + (valueExpr ? valueExpr.type : "undefined")
                   + " without a Map semAct"});
  }

  _triple (tc, subject, object) {
    return tc.inverse
      ? {s: object, p: tc.predicate, o: subject}
      : {s: subject, p: tc.predicate, o: object};
  }

  _expandPrefix (prefix, local) {
    return prefix in this.prefixes ? this.prefixes[prefix] + local : prefix + ":" + local;
  }

  _resolveShapeExpr (shapeExpr) {
    for (let hops = 0; typeof shapeExpr === "string"; ++hops) {
      if (hops > 100)
        runtimeError("shape reference loop at " + shapeExpr);
      const decl = this.index.shapeExprs[shapeExpr];
      if (!decl)
        runtimeError("shape " + shapeExpr + " not found in schema");
      shapeExpr = "shapeExpr" in decl ? decl.shapeExpr : decl;
    }
    return shapeExpr;
  }

  /** _compileShapeExprNFA - compile any shapeExpr to an NFA (cached per
   * resolved shapeExpr object):
   * - Shape: its tripleExpr's NFA;
   * - ShapeAnd: conjuncts' NFAs concatenated against the same subject
   *   (NodeConstraint conjuncts restrict the focus node, not its arcs, so
   *   they contribute no emissions and are skipped);
   * - ShapeOr: prioritized Split over the disjuncts' NFAs;
   * - NodeConstraint: the empty NFA (nothing to synthesize).
   */
  _compileShapeExprNFA (shapeExpr) {
    const se = this._resolveShapeExpr(shapeExpr);
    if (this._nfaCache.has(se))
      return this._nfaCache.get(se);
    let nfa;
    if (se.type === "Shape") {
      nfa = this._nfaFor(se);
    } else if (se.type === "ShapeAnd" || se.type === "ShapeOr") {
      const parts = se.shapeExprs
            .map(nested => this._resolveShapeExpr(nested))
            .filter(nested => nested.type !== "NodeConstraint")
            .map(nested => this._compileShapeExprNFA(nested));
      nfa = se.type === "ShapeAnd" ? concatNFAs(parts) : splitNFAs(parts);
    } else if (se.type === "NodeConstraint") {
      nfa = {states: [{type: "Match"}], start: 0};
    } else {
      runtimeError(se.type + " synthesis not supported by this prototype");
    }
    this._nfaCache.set(se, nfa);
    return nfa;
  }

  /** _nfaFor - compile a Shape's tripleExpr to an NFA (cached per Shape).
   * States: TC (consume/emit one constraint instance), Split (OneOf),
   * Rept (counted repetition: outs[0]=loop body, outs[1]=exit), Match.
   * The Match state is always state 0.
   */
  _nfaFor (shape) {
    if (this._nfaCache.has(shape))
      return this._nfaCache.get(shape);
    const states = [];
    const mkState = (s) => states.push(s) - 1;
    const patch = (tail, target) => tail.forEach(t => states[t].outs.push(target));

    const walkExpr = (expr) => {
      let pair;
      switch (expr.type) {
      case "TripleConstraint": {
        const s = mkState({type: "TC", tc: expr, outs: []});
        pair = {start: s, tail: [s]};
        break;
      }
      case "OneOf": {
        const starts = [], tails = [];
        expr.expressions.forEach(nested => {
          const p = walkExpr(nested);
          starts.push(p.start);
          tails.push.apply(tails, p.tail);
        });
        pair = {start: mkState({type: "Split", outs: starts}), tail: tails};
        break;
      }
      case "EachOf": {
        let start = null, tail = null;
        expr.expressions.forEach((nested, ord) => {
          const p = walkExpr(nested);
          if (ord === 0)
            start = p.start;
          else
            patch(tail, p.start);
          tail = p.tail;
        });
        pair = {start, tail};
        break;
      }
      default:
        runtimeError("unexpected tripleExpr type " + expr.type);
      }
      const min = "min" in expr ? expr.min : 1;
      const max = "max" in expr ? (expr.max === UNBOUNDED ? Infinity : expr.max) : 1;
      if (min === 0 && expr.type === "TripleConstraint")
        states[pair.start].skippable = true; // enables the vacuous-descend rule
      if (min === 1 && max === 1)
        return pair;
      const rept = mkState({type: "Rept", min, max, outs: [pair.start]}); // parent patch appends outs[1]=exit
      patch(pair.tail, rept);
      return {start: rept, tail: [rept]};
    };

    const matchState = mkState({type: "Match"});
    let start = matchState;
    if (shape.expression) {
      const pair = walkExpr(shape.expression);
      patch(pair.tail, matchState);
      start = pair.start;
    }
    const nfa = {states, start};
    this._nfaCache.set(shape, nfa);
    return nfa;
  }
}

/** cloneInto - append a copy of an NFA's states (outs re-based) to combined,
 * returning the offset at which they landed.
 */
function cloneInto (combined, nfa) {
  const offset = combined.length;
  nfa.states.forEach(s => combined.push(
    Object.assign({}, s, s.outs ? {outs: s.outs.map(o => o + offset)} : {})));
  return offset;
}

/** concatNFAs - one NFA that runs each part in sequence against the same
 * subject: every part's Match (state 0 by construction) except the last's
 * becomes a Split to the next part's start.
 */
function concatNFAs (parts) {
  if (parts.length === 0)
    return {states: [{type: "Match"}], start: 0};
  const states = [];
  const offsets = parts.map(part => cloneInto(states, part));
  for (let i = 0; i < parts.length - 1; ++i)
    states[offsets[i]] = {type: "Split", outs: [offsets[i + 1] + parts[i + 1].start]};
  return {states, start: offsets[0] + parts[0].start};
}

/** splitNFAs - one NFA that forks over the parts (each keeps its own Match;
 * the stepper treats any Match as end-of-shape).  Part order is priority
 * order.
 */
function splitNFAs (parts) {
  if (parts.length === 0)
    return {states: [{type: "Match"}], start: 0};
  const states = [];
  const outs = parts.map(part => cloneInto(states, part) + part.start);
  const split = states.push({type: "Split", outs}) - 1;
  return {states, start: split};
}

/** threadView - the inspectable snapshot of a thread shipped in debugger
 * step events. */
function threadView (th) {
  let emitted = 0;
  for (let node = th.quads; node !== null; node = node.prev)
    ++emitted;
  return {
    subject: th.subject,
    depth: stackDepth(th.callStack),
    frame: th.cursor.idx,
    consumed: th.cursor.n,
    emitted,
  };
}

/** MaterializerDebugger - step-through control over a materialization (see
 * doc/debugger-design.md).  Drives ThreadedMaterializer.run() one event at a
 * time; entirely synchronous, so UIs can wrap it however they like.
 *
 *   const dbg = new MaterializerDebugger(materializer, bindings, "tag:root");
 *   dbg.addBreakpoint({predicate: "http://a.example/p"});
 *   let at = dbg.continue();        // runs to the breakpoint (or completion)
 *   at = dbg.stepInto();            // next event, entering subshape calls
 *   at = dbg.stepOver();            // next event at the same depth or above
 *   at = dbg.stepOut();             // next event above the current depth
 *   ... dbg.done, dbg.quads, dbg.error
 *
 * Breakpoints: {tc} a schema TripleConstraint object (e.g. from
 * locate.exprAt(offset) under an editor gutter click), {predicate} its IRI
 * (survives structured clone), or {subject} the lexical (N3id)
 * representation of a subject node being synthesized.
 */
class MaterializerDebugger {
  constructor (materializer, bindingTree, createRoot, shapeLabel) {
    this.materializer = materializer;
    this.generator = materializer.run(bindingTree, createRoot, shapeLabel);
    this.breakpoints = {tcs: new Set(), predicates: new Set(), subjects: new Set()};
    this.current = null; // last step event
    this.done = false;
    this.quads = null;   // set when done without error
    this.error = null;   // set when materialization failed
  }

  addBreakpoint ({tc, predicate, subject}) {
    if (tc) this.breakpoints.tcs.add(tc);
    if (predicate) this.breakpoints.predicates.add(predicate);
    if (subject) this.breakpoints.subjects.add(subject);
    return this;
  }

  removeBreakpoint ({tc, predicate, subject}) {
    if (tc) this.breakpoints.tcs.delete(tc);
    if (predicate) this.breakpoints.predicates.delete(predicate);
    if (subject) this.breakpoints.subjects.delete(subject);
    return this;
  }

  _hitsBreakpoint (event) {
    if (event.type !== "tripleConstraint")
      return false;
    return this.breakpoints.tcs.has(event.tc) ||
      this.breakpoints.predicates.has(event.tc.predicate) ||
      this.breakpoints.subjects.has(event.thread.subject);
  }

  _advance (stopWhen) {
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
        return this.current = {type: "done", quads: step.value};
      }
      if (stopWhen(step.value) || this._hitsBreakpoint(step.value))
        return this.current = step.value;
    }
  }

  /** pause at the very next event (descending into subshape calls) */
  stepInto () { return this._advance(() => true); }

  /** pause at the next event at the current call depth or above (skipping
   * the interior of subshape calls) */
  stepOver () {
    const depth = this.current && this.current.thread ? this.current.thread.depth : 0;
    return this._advance(event => event.thread && event.thread.depth <= depth);
  }

  /** pause when the current subshape call completes (or anything shallower,
   * e.g. backtracking into a sibling branch) */
  stepOut () {
    const depth = this.current && this.current.thread ? this.current.thread.depth : 0;
    return this._advance(event => event.thread && event.thread.depth < depth);
  }

  /** run to the next breakpoint, or to completion */
  continue () { return this._advance(() => false); }
}

function collectQuads (quadList) {
  const triples = [];
  for (let node = quadList; node !== null; node = node.prev)
    triples.unshift(node.q);
  const seen = {};
  return triples.filter(t => {
    const key = t.s + " " + t.p + " " + t.o;
    return key in seen ? false : (seen[key] = true);
  }).map(t => n3idQuad2RdfJs(t.s, t.p, t.o));
}

function stackDepth (callStack) {
  let depth = 0;
  for (let frame = callStack; frame !== null; frame = frame.parent)
    ++depth;
  return depth;
}

function n3ify (ldterm) { // ShExJson term -> N3id string (c.f. shex-extension-map.js)
  if (typeof ldterm !== "object")
    return ldterm;
  const ret = "\"" + ldterm.value + "\"";
  if ("language" in ldterm)
    return ret + "@" + ldterm.language;
  if ("type" in ldterm)
    return ret + "^^" + ldterm.type;
  return ret;
}

function runtimeError () {
  throw new MaterializationError(Array.prototype.join.call(arguments, ""));
}

module.exports = {ThreadedMaterializer, MaterializerDebugger, normalizeBindingTree, MaterializationError};
