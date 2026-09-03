/** Reading ShExJ and ShExR that the corpus doesn't contain.
 *
 * shexTest's schemas are all current ShExJ and well-formed ShExR, so two
 * things go untested: a schema written before ShapeDecl existed (which
 * ShExJtoAS still upgrades, and which is most of the ShExJ in the wild), and
 * what the ShExR reader says about a graph that validated against ShExR.shex
 * but reached it with a type it has no case for.
 */
"use strict";

const {expect} = require("chai");
const ShExUtil = require("@shexjs/util");

const {SX, RDF} = ShExUtil;
const S1 = "http://a.example/S1", p1 = "http://a.example/p1";

/** the ShExR reader's input: a term, and the values of the node it names */
const term = (ldterm, nested) => nested === undefined ? {ldterm} : {ldterm, nested};
const typed = (type, rest = {}) => Object.assign({[RDF.type]: [term(type)]}, rest);

describe("ShExJ and ShExR conversion", function () {

  describe("ShExJ before ShapeDecl", function () {

    /* ShEx 2.1 wrote `{"type": "Shape", "id": ...}` where 2.2 writes a
     * ShapeDecl around it.  Documents in the wild still say the first. */
    it("should wrap a bare labelled shape in a ShapeDecl", function () {
      const as = ShExUtil.ShExJtoAS({
        type: "Schema",
        shapes: [{type: "Shape", id: S1, expression: {type: "TripleConstraint", predicate: p1}}]
      });
      expect(as.shapes.length).to.equal(1);
      const decl = as.shapes[0];
      expect(decl.type).to.equal("ShapeDecl");
      expect(decl.id, "the label moved out to the declaration").to.equal(S1);
      expect(decl.shapeExpr.type).to.equal("Shape");
      expect(decl.shapeExpr, "and not left behind on the shape").to.not.have.property("id");
      expect(as._index.shapeExprs[S1], "indexed under its label").to.exist;
    });

    it("should leave a ShapeDecl alone", function () {
      const decl = {type: "ShapeDecl", id: S1,
                    shapeExpr: {type: "Shape", expression: {type: "TripleConstraint", predicate: p1}}};
      const as = ShExUtil.ShExJtoAS({type: "Schema", shapes: [decl]});
      expect(as.shapes[0]).to.equal(decl);
    });

    it("should take the internals back out on the way to ShExJ", function () {
      const as = ShExUtil.ShExJtoAS({
        type: "Schema",
        shapes: [{type: "ShapeDecl", id: S1, shapeExpr: {type: "Shape"}}]
      });
      const json = ShExUtil.AStoShExJ(as);
      expect(json["@context"]).to.equal("http://www.w3.org/ns/shex.jsonld");
      ["_index", "_prefixes", "_base", "_locations", "_sourceMap", "_exprLocations"]
        .forEach(k => expect(json, k).to.not.have.property(k));
    });
  });

  /* The reader dispatches on rdf:type at every level.  ShExR.shex keeps
   * these out, so each message is what a caller sees when they hand the
   * reader a graph nobody checked. */
  describe("ShExR the reader has no case for", function () {

    const BOGUS = SX._namespace + "Bogus";
    const readsAs = values => () => ShExUtil.valuesToSchema(values);

    it("should refuse a graph whose root isn't a Schema", function () {
      expect(readsAs(typed(BOGUS))).to.throw(/unknown schema type/);
    });

    it("should refuse a shape declaration it can't name", function () {
      expect(readsAs(typed(SX.Schema, {
        [SX.shapes]: [term(S1, typed(BOGUS))]
      }))).to.throw(/unknown shapeDeclOrExpr type/);
    });

    it("should refuse a triple expression it can't name", function () {
      expect(readsAs(typed(SX.Schema, {
        [SX.shapes]: [term(S1, typed(SX.ShapeDecl, {
          [SX.shapeExpr]: [term("_:s", typed(SX.Shape, {
            [SX.expression]: [term("_:e", typed(BOGUS))]
          }))]
        }))]
      }))).to.throw(/unknown tripleExpr type/);
    });

    it("should refuse a value set member it can't name", function () {
      expect(readsAs(typed(SX.Schema, {
        [SX.shapes]: [term(S1, typed(SX.ShapeDecl, {
          [SX.shapeExpr]: [term("_:s", typed(SX.NodeConstraint, {
            [SX.values]: [term("_:v", typed(BOGUS))]
          }))]
        }))]
      }))).to.throw(/unknown objectValue type/);
    });
  });
});
