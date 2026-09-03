/** A ShExR reader, assembled from ShExR.shex and shexr-actions.ttl.
 *
 * Everything specific to reading ShExR is in those two files; this is the
 * three-line assembly plus the one patch ShExR.shex needs before anything
 * can validate against it.
 *
 *     const {makeReader, read} = require('.../examples/shexr/reader');
 *     const reader = makeReader(shexrText, actionsText);
 *     const shexj = read(reader, turtleText);
 */
"use strict";

const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const ShExUtil = require("@shexjs/util");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("@shexjs/validator");
const {applyOverlay} = require("@shexjs/semact-overlay");
const Reduce = require("@shexjs/extension-reduce");
const evaluate = require("@shexjs/extension-reduce-js");

const SX = "http://www.w3.org/ns/shex#";
const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const DEFAULT_BASE = "http://a.example/application/base/";

/**
 * ShExR.shex, with the actions hung on it and with the one accommodation
 * every ShExR reader has to make.
 *
 * A reference to a shape is, in ShExR, an arc to the node that declares it
 * -- and a schema may refer to a shape it doesn't declare, in which case
 * that node has no ShExR arcs at all and matches none of the alternatives
 * `sx:valueExpr` allows.  So `sx:valueExpr` is widened to also accept the
 * empty closed shape, which is what a node with no properties is.
 * shexTest's own Parser-Writer-test does exactly this to the same schema.
 */
function makeReader (shexrText, actionsText, base = DEFAULT_BASE) {
  const shexr = ShExUtil.ShExJtoAS(
    ShExParser.construct(base, null, {index: true}).parse(shexrText, base, {}, "ShExR.shex"));

  const valueExpr = shexr._index.shapeExprs[SX + "TripleConstraint"]
        .shapeExpr.expression.expressions.find(e => e.predicate === SX + "valueExpr");
  valueExpr.valueExpr = {
    type: "ShapeOr",
    shapeExprs: [valueExpr.valueExpr, {type: "Shape", closed: true}],
  };

  const overlay = new N3.Store();
  overlay.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"}).parse(actionsText));
  // a Turtle store has no prefixes left in it, so the sa:paths get theirs here
  return applyOverlay(shexr, overlay, {prefixes: {sx: SX, rdf: RDF}});
}

/** the ShExJ a ShExR document says, or null if it isn't a ShExR schema graph */
function read (reader, turtleText, base = DEFAULT_BASE) {
  const graph = new N3.Store();
  graph.addQuads(new N3.Parser({baseIRI: base, blankNodePrefix: "", format: "text/turtle"})
                 .parse(turtleText));
  const db = RdfJsDb(graph);
  const roots = db.getQuads(null, RDF + "type", SX + "Schema");
  if (roots.length === 0)
    return null;

  const validator = new ShExValidator(reader, db, {});
  Reduce.register(validator);
  const res = validator.validateNodeShapePair(roots[0].subject, ShExValidator.Start);
  if ("errors" in res)
    throw Error("not a ShExR graph: " + ShExUtil.errsToSimple(res).slice(0, 3).join("\n"));

  // The actions expand every reference in place and give every node an id,
  // the way ShExUtil.valuesToSchema does; ShExRtoShExJ folds the repeats
  // back into references and drops the ids nothing refers to.
  // ...with the schema, which says how many values an arc reference stands
  // for: the same reading the app gets when it folds the same actions
  return ShExUtil.ShExJtoAS(
    ShExUtil.ShExRtoShExJ(Reduce.reduce(res, {evaluate, schema: reader,
                                             prefixes: {sx: SX, rdf: RDF}})));
}

module.exports = {makeReader, read, SX, RDF, DEFAULT_BASE};
