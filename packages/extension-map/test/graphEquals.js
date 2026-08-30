/** Are two RDF/JS stores isomorphic -- the same triples up to a renaming
 * of blank nodes?  `graphEquals(left, right, [leftToRight])` says so, and
 * takes (and extends) a partial bnode mapping; `graphToString` writes a
 * store as Turtle for a failing assertion's message.
 *
 * Shared by Map-test and ThreadedMaterializer-test, which used to carry a
 * copy each.
 */
"use strict";

const ShExTerm = require("@shexjs/term");
const N3 = require("n3");

function graphEquals (left, right, leftToRight) {
  if (left.size !== right.size)
    return false;

  leftToRight = leftToRight || {};
  const rightToLeft = Object.keys(leftToRight).reduce(function (ret, from) {
    ret[leftToRight[from]] = from;
    return ret;
  }, {});

  return findIsomorphism([...left.match(null, null, null, null)],
                         right, leftToRight, rightToLeft);
}

function findIsomorphism (g, right, l2r, r2l) {
  if (g.length === 0)
    return true;
  const matchTarget = g.pop();

  const rights = [...right.match(
    mapppedTo(matchTarget.subject, l2r),
    matchTarget.predicate,
    mapppedTo(matchTarget.object, l2r),
    null
  )];

  const ret = !!rights.find(function (triple) {
    const trialMappings = [];
    function add (from, to) {
      if (mapppedTo(from, l2r) === null) {
        if (mapppedTo(to, r2l) === null) {
          const leftKey = ShExTerm.rdfJsTerm2Turtle(from);
          const rightKey = ShExTerm.rdfJsTerm2Turtle(to);
          l2r[leftKey] = to;
          r2l[rightKey] = from;
          trialMappings.push({from, leftKey, rightKey});
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    }

    if (!add(matchTarget.subject, triple.subject) ||
        !add(matchTarget.object, triple.object) ||
        !findIsomorphism(g, right, l2r, r2l)) {
      for (const {leftKey, rightKey} of trialMappings) {
        delete r2l[rightKey];
        delete l2r[leftKey];
      }
      return false;
    } else
      return true;
  });

  if (!ret) {
    g.push(matchTarget);
  }

  return ret;
}

function mapppedTo (term, mapping) {
  if (term.termType === "BlankNode") {
    const key = ShExTerm.rdfJsTerm2Turtle(term);
    return (key in mapping) ? mapping[key] : null;
  } else {
    return term;
  }
}

function graphToString (g) {
  let output = "";
  const w = new N3.Writer({
    write: function (chunk, encoding, done) { output += chunk; done && done(); },
  });
  w.addQuads([...g.match(null, null, null, null)]);
  return "{\n" + output + "\n}";
}

module.exports = {graphEquals, graphToString};
