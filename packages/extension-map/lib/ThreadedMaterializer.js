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
          ? message + "; deepest failures: " + JSON.stringify(failures.slice(-3))
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
 * nothing.
 */
function cursorGet (frames, globals, cursor, varName) {
  if (varName in globals) // staticVars: always available, never consumed
    return {value: globals[varName], cursor};
  for (let i = cursor.idx; i < frames.length; ++i) {
    const key = i + " " + varName;
    if (varName in frames[i] && !(key in cursor.used)) {
      const used = Object.assign({}, cursor.used);
      used[key] = true;
      return {value: frames[i][varName], cursor: {idx: i, used}};
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
    const frames = normalizeBindingTree(bindingTree);
    const shape = this._resolveShapeExpr(shapeLabel || this.schema.start
                                         || runtimeError("no shape given and no start in schema"));
    if (shape.type !== "Shape")
      runtimeError("expected root shapeExpr of type Shape, got " + shape.type);
    const nfa = this._nfaFor(shape);
    const failures = [];
    const stack = [{
      nfa, stateNo: nfa.start,
      subject: createRoot || "_:root",
      repeats: {}, callStack: null,
      cursor: {idx: 0, used: {}},
      quads: null, bnode: 0
    }];
    let steps = 0;

    while (stack.length > 0) {
      if (++steps > this.maxSteps)
        throw new MaterializationError("exceeded maxSteps=" + this.maxSteps, failures);
      const th = stack.pop();
      const st = th.nfa.states[th.stateNo];
      switch (st.type) {

      case "Match":
        if (th.callStack === null)
          return collectQuads(th.quads); // accept: greedy-first materialization
        { // return from a shape-reference call
          const frame = th.callStack;
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
        const r = th.repeats[th.stateNo] || 0;
        if (r >= st.min) { // exit arm (lower priority): reset counter for possible re-entry
          const repeats = Object.assign({}, th.repeats);
          delete repeats[th.stateNo];
          stack.push(Object.assign({}, th, {stateNo: st.outs[1], repeats}));
        }
        if (r < Math.min(st.max, this.maxRepeat)) { // greedy: another repetition
          const repeats = Object.assign({}, th.repeats);
          repeats[th.stateNo] = r + 1;
          stack.push(Object.assign({}, th, {stateNo: st.outs[0], repeats}));
        }
        break;
      }

      case "TC":
        this._stepTripleConstraint(th, st, frames, stack, failures);
        break;

      default:
        runtimeError("unexpected NFA state type " + st.type);
      }
    }
    throw new MaterializationError("no thread reached an accepting state", failures);
  }

  /** _stepTripleConstraint - one TC visit synthesizes exactly one instance of
   * the constraint (cardinality is handled by the surrounding Rept states):
   *  - Map semActs: resolve each variable/function against this thread's
   *    cursor; any unbound variable kills the thread (rollback comes free).
   *  - singleton value set: emit the constant.
   *  - shape-valued: invent a bnode, link it, and call into the sub-shape NFA.
   */
  _stepTripleConstraint (th, st, frames, stack, failures) {
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
          const hit = cursorGet(frames, this.globals, cursor, varName);
          if (hit === null) {
            failures.push({predicate: tc.predicate, variable: varName, frame: cursor.idx});
            return; // unbound required variable: this thread dies
          }
          cursor = hit.cursor;
          objects.push(n3ify(hit.value));
        } else if (functionPattern.test(code)) {
          try { // e.g. regex(...)/hashmap(...): lower() pulls variables via get()
            const adapter = {get: (v) => {
              const hit = cursorGet(frames, this.globals, cursor, v);
              if (hit === null)
                return undefined;
              cursor = hit.cursor;
              return hit.value;
            }};
            objects.push(extensions.lower(code, adapter, this.prefixes));
          } catch (e) {
            failures.push({predicate: tc.predicate, code, error: e.message});
            return;
          }
        } else {
          failures.push({predicate: tc.predicate, code, error: "unrecognized Map code"});
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

    if (valueExpr && valueExpr.type === "Shape") {
      if (stackDepth(th.callStack) >= this.maxCallDepth) {
        failures.push({predicate: tc.predicate, error: "exceeded maxCallDepth"});
        return;
      }
      const bnode = "_:tm" + th.bnode;
      const sub = this._nfaFor(valueExpr);
      stack.push(Object.assign({}, th, {
        nfa: sub, stateNo: sub.start,
        subject: bnode, repeats: {},
        callStack: {nfa: th.nfa, outs: st.outs, subject: th.subject, repeats: th.repeats, parent: th.callStack},
        quads: {q: this._triple(tc, th.subject, bnode), prev: th.quads},
        bnode: th.bnode + 1
      }));
      return;
    }

    failures.push({predicate: tc.predicate,
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
    if (shapeExpr.type === "ShapeAnd" || shapeExpr.type === "ShapeOr" || shapeExpr.type === "ShapeNot")
      runtimeError(shapeExpr.type + " synthesis not supported by this prototype");
    return shapeExpr;
  }

  /** _nfaFor - compile a Shape's tripleExpr to an NFA (cached per Shape).
   * States: TC (consume/emit one constraint instance), Split (OneOf),
   * Rept (counted repetition: outs[0]=loop body, outs[1]=exit), Match.
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

module.exports = {ThreadedMaterializer, normalizeBindingTree, MaterializationError};
