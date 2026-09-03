"use strict";
/**
 * Comparing an in-memory validation run with a SPARQL one.
 *
 * The only thing the two are allowed to disagree about is blank node labels, so
 * both helpers here exist to take labels out of the comparison without taking
 * the *structure* of blank nodes out of it.
 */

const N3 = require("n3");

/** Relabel blank nodes `oracleN`, numbering them by what they look like rather
 * than by where they appear in the file.
 *
 * Both neighborhood implementations sort a node's arcs by object, and blank
 * objects sort by label -- an arbitrary order on either side.  Numbering the
 * oracle's blank nodes the way @shexjs/neighborhood-sparql does, by content,
 * lines the two orders up so that a comparison sees structure rather than label
 * roulette.  Relabelling is an isomorphism, so nothing else moves.
 */
function opaqueBnodes (quads) {
  const arcs = new Map();
  const labels = new Set();
  for (const q of quads) {
    if (q.subject.termType === "BlankNode")
      arcs.set(q.subject.value, (arcs.get(q.subject.value) || []).concat(
        [q.predicate.value + " " + (q.object.termType === "BlankNode" ? "[]" : q.object.value)]));
    for (const t of [q.subject, q.object])
      if (t.termType === "BlankNode") labels.add(t.value);
  }
  const fingerprint = l => (arcs.get(l) || []).slice().sort().join(" ");
  const order = [...labels].sort(
    (l, r) => fingerprint(l).localeCompare(fingerprint(r)) || l.localeCompare(r));
  const renamed = new Map(order.map((l, i) => [l, N3.DataFactory.blankNode("oracle" + i)]));
  const rename = t => t.termType === "BlankNode" ? renamed.get(t.value) : t;
  return quads.map(q => N3.DataFactory.quad(rename(q.subject), q.predicate, rename(q.object)));
}

/** Rename blank node labels to their order of first appearance.
 *
 * Labels turn up in three shapes -- `_:x` node references, `{termType:
 * "BlankNode", value: "x"}` terms, and bare mentions inside human-readable
 * error strings -- so this works on the serialized JSON.  Both sides' labels
 * match one unambiguous pattern, which is what keeps a literal in the data from
 * being mistaken for a label.
 */
const LABELS = /\b(?:oracle|sq)\d+\b/g;

function canonicalize (result) {
  const seen = new Map();
  return JSON.stringify(result).replace(LABELS, label => {
    if (!seen.has(label)) seen.set(label, "B" + seen.size);
    return seen.get(label);
  });
}

module.exports = {opaqueBnodes, canonicalize, LABELS};
