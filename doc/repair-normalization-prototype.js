/* Prototype: minimal repairs over the *bag* a triple expression denotes.
 *
 * A ShEx triple expression denotes a set of bags (multisets) of triple
 * constraints -- the RBE view (Staworko et al., ICDT 2015).  Given the bag
 * a node actually has, the repair is the accepted bag nearest to it: which
 * arcs to add, which to take away.  That is defined on the language, not on
 * the syntax tree, so two spellings of the same language give one answer.
 *
 * This searches for it exhaustively -- every bag in a small box around the
 * observed one -- which is fine for a demonstration and wrong for a
 * validator: the production algorithm is a dynamic program over the
 * expression, described in ./error-normalization.md.  Run it with
 * `node doc/repair-normalization-prototype.js`; the output is the table in
 * that note.
 */
"use strict";
const ShExParser = require("@shexjs/parser");

const UNBOUNDED = -1;
const card = e => [e.min === undefined ? 1 : e.min,
                   e.max === undefined ? 1 : e.max === UNBOUNDED ? Infinity : e.max];

/** every predicate the expression mentions, in order of first mention */
function slots (expr, index, out = [], seen = new Set()) {
  if (typeof expr === "string") {
    if (seen.has(expr)) return out;
    seen.add(expr);
    return slots(index.tripleExprs[expr], index, out, seen);
  }
  if (expr.type === "TripleConstraint") {
    if (out.indexOf(expr.predicate) === -1) out.push(expr.predicate);
    return out;
  }
  expr.expressions.forEach(e => slots(e, index, out, seen));
  return out;
}

/** Does `expr` accept exactly this bag?  bag is an array of counts, one per slot. */
function accepts (expr, bag, index, memo = new Map()) {
  const key = (typeof expr === "string" ? expr : (expr.__id || (expr.__id = ++ids)))
        + "|" + bag.join(",");
  if (memo.has(key)) return memo.get(key);
  memo.set(key, false);                       // recursion guard
  const answer = compute();
  memo.set(key, answer);
  return answer;

  function compute () {
    if (typeof expr === "string")
      return accepts(index.tripleExprs[expr], bag, index, memo);
    const [min, max] = card(expr);
    const empty = bag.every(n => n === 0);

    if (expr.type === "TripleConstraint") {
      const at = SLOTS.indexOf(expr.predicate);
      return bag.every((n, i) => i === at || n === 0)
        && bag[at] >= min && bag[at] <= max;
    }
    // a group repeated r times accepts the sum of r bags its body accepts
    const total = bag.reduce((a, b) => a + b, 0);
    for (let r = min; r <= Math.min(max, total || min); ++r) {
      if (r === 0) { if (empty) return true; continue; }
      if (iterations(bag, r)) return true;
    }
    return min === 0 && empty;
  }

  /** can `bag` be split into r bags, each accepted by the body? */
  function iterations (bag, r) {
    if (r === 1) return body(bag);
    return someSplit(bag, (first, rest) => body(first) && iterations(rest, r - 1));
  }

  /** the body once: EachOf splits among children, OneOf gives it to one */
  function body (bag) {
    const children = expr.expressions;
    if (expr.type === "OneOf")
      return children.some(c => accepts(c, bag, index, memo));
    // EachOf: split the bag among the children
    const split = (i, left) => i === children.length
          ? left.every(n => n === 0)
          : someSplit(left, (mine, rest) => accepts(children[i], mine, index, memo) && split(i + 1, rest),
                      true);
    return split(0, bag);
  }
}

/** call back with every way of splitting `bag` into (part, remainder) */
function someSplit (bag, k, includeAll = true) {
  const parts = [];
  const build = (i, part) => {
    if (i === bag.length) { parts.push(part.slice()); return; }
    for (let n = 0; n <= bag[i]; ++n) { part.push(n); build(i + 1, part); part.pop(); }
  };
  build(0, []);
  for (const part of parts) {
    if (!includeAll && part.every((n, i) => n === bag[i])) continue;
    if (k(part, bag.map((n, i) => n - part[i]))) return true;
  }
  return false;
}

/** the accepted bags nearest the observed one, and what it takes to get there */
function repairs (expr, index, observed) {
  const slack = 3;
  const box = SLOTS.map((p, i) => (observed[i] || 0) + slack);
  const found = [];
  let best = Infinity;
  const walk = (i, bag) => {
    if (i === box.length) {
      if (!accepts(expr, bag, index)) return;
      const cost = bag.reduce((sum, n, j) => sum + Math.abs(n - (observed[j] || 0)), 0);
      if (cost < best) { best = cost; found.length = 0; }
      if (cost === best) found.push(bag.slice());
      return;
    }
    for (let n = 0; n <= box[i]; ++n) { bag.push(n); walk(i + 1, bag); bag.pop(); }
  };
  walk(0, []);
  return {cost: best, repairs: found.map(bag => SLOTS.map((p, j) => {
    const delta = bag[j] - (observed[j] || 0);
    return delta === 0 ? null : (delta > 0 ? "+" + delta + " " : delta + " ") + short(p);
  }).filter(x => x))};
}

const short = p => p.replace("http://xmlns.com/foaf/0.1/", "foaf:").replace("http://a.example/", ":");
let SLOTS = [];
let ids = 0;

// ---------------------------------------------------------------------------
const base = "http://a.example/";
const PRE = "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\nPREFIX : <http://a.example/>\n";
const cases = [
  ["name-or-parts, then mbox",
   "<S> { ( foaf:name . | foaf:givenName . ; foaf:familyName . ) ; foaf:mbox . }"],
  ["mbox inside each branch",
   "<S> { ( foaf:name . ; foaf:mbox . | foaf:givenName . ; foaf:familyName . ; foaf:mbox . ) }"],
];
const observations = [
  ["a name and nothing else", {"foaf:name": 1}],
  ["nothing at all", {}],
  ["a given name and an mbox", {"foaf:givenName": 1, "foaf:mbox": 1}],
  ["both spellings of the name, and an mbox", {"foaf:name": 1, "foaf:givenName": 1, "foaf:mbox": 1}],
];

for (const [label, shapeText] of cases) {
  const schema = ShExParser.construct(base, {}, {index: true}).parse(PRE + shapeText);
  const expr = schema.shapes[0].shapeExpr.expression;
  SLOTS = slots(expr, schema._index);
  console.log("\n== " + label);
  for (const [what, counts] of observations) {
    const observed = SLOTS.map(p => counts[short(p)] || 0);
    const {cost, repairs: rs} = repairs(expr, schema._index, observed);
    console.log("   " + what.padEnd(38) + " -> " +
                (cost === 0 ? "conforms" : rs.map(r => r.join(", ")).join("   OR   ")));
  }
}

// a real choice stays a choice: alternatives where the language offers them
{
  const schema = ShExParser.construct(base, {}, {index: true})
        .parse(PRE + "<S> { :a . | :b . }");
  const expr = schema.shapes[0].shapeExpr.expression;
  SLOTS = slots(expr, schema._index);
  console.log("\n== :a . | :b .");
  for (const [what, counts] of [["nothing at all", [0, 0]], ["one of each", [1, 1]]]) {
    const {cost, repairs: rs} = repairs(expr, schema._index, counts);
    console.log(("   " + what).padEnd(41) + " -> " +
                (cost === 0 ? "conforms" : rs.map(r => r.join(", ")).join("   OR   ")));
  }
}

// and the cardinality case the engine used to report four ways
{
  const schema = ShExParser.construct(base, {}, {index: true})
        .parse(PRE + "<S> { :p . {2,5} }");
  const expr = schema.shapes[0].shapeExpr.expression;
  SLOTS = slots(expr, schema._index);
  console.log("\n== :p . {2,5}");
  for (const n of [0, 1, 2, 6, 9]) {
    const {cost, repairs: rs} = repairs(expr, schema._index, [n]);
    console.log(("   " + n + " of them").padEnd(41) + " -> " +
                (cost === 0 ? "conforms" : rs.map(r => r.join(", ")).join("   OR   ")));
  }
}
