/** Parser knobs that no ShExC document can reach.
 *
 * shexTest says what a ShExC document means; these are shex.js's own choices
 * about what to do when it means something twice, and about parsing with no
 * base to resolve against.  duplicateShape is on a menu in all four webapps
 * ("abort | replace | ignore"), so every branch here is a click away.
 *
 * The ShExC-level halves of the same question -- that a duplicate label is an
 * error at all, and that a label can't be both a shape and a triple
 * expression -- live in shexTest as 1dotDuplicateShapeLabel,
 * 1dotDuplicateProductionLabel and 1ProductionShapeCollision.
 */
"use strict";

const {expect} = require("chai");
const ShExParser = require("@shexjs/parser");

const BASE = "http://a.example/";
const S1 = BASE + "S1", S2 = BASE + "S2", T1 = BASE + "T1";
const p1 = BASE + "p1", p2 = BASE + "p2";

const DUP_SHAPE = `<${S1}> { <${p1}> . }
<${S1}> { <${p2}> . }
`;
const DUP_PRODUCTION = `<${S1}> { $<${T1}> <${p1}> . }
<${S2}> { $<${T1}> <${p2}> . }
`;

const parse = (text, options) =>
  ShExParser.construct(BASE, null, Object.assign({index: true}, options))
    .parse(text, BASE, undefined, "ParserOptions-test");

const predicateOf = shapeDecl => shapeDecl.shapeExpr.expression.predicate;

describe("parser options", function () {

  describe("duplicateShape", function () {

    it("should abort on a second declaration of a shape label", function () {
      expect(() => parse(DUP_SHAPE)).to.throw(/S1 already defined/);
    });

    it("should abort on a second declaration of a triple expression label", function () {
      expect(() => parse(DUP_PRODUCTION)).to.throw(/T1 already defined/);
    });

    /* "replace" used to drop the id and leave the location on the
     * declaration it had just replaced, which made the surviving shape
     * unfindable by label -- the one thing a shape label is for. */
    it("should let the later declaration win, id and all, on \"replace\"", function () {
      const schema = parse(DUP_SHAPE, {duplicateShape: "replace"});
      expect(schema.shapes.length).to.equal(1);
      expect(schema.shapes[0].id, "still says which label it is").to.equal(S1);
      expect(predicateOf(schema.shapes[0]), "the second declaration").to.equal(p2);
      expect(Object.keys(schema._index.shapeExprs)).to.deep.equal([S1]);
      expect(schema._locations[S1].first_line, "points at the second declaration")
        .to.equal(2);
    });

    it("should keep the first declaration on \"ignore\"", function () {
      const schema = parse(DUP_SHAPE, {duplicateShape: "ignore"});
      expect(schema.shapes.length).to.equal(1);
      expect(schema.shapes[0].id).to.equal(S1);
      expect(predicateOf(schema.shapes[0]), "the first declaration").to.equal(p1);
      expect(schema._locations[S1].first_line).to.equal(1);
    });

    it("should take either duplicate triple expression without complaint", function () {
      ["replace", "ignore"].forEach(duplicateShape => {
        const schema = parse(DUP_PRODUCTION, {duplicateShape});
        expect(Object.keys(schema._index.tripleExprs), duplicateShape).to.deep.equal([T1]);
        expect(schema.shapes.map(s => s.id), duplicateShape).to.deep.equal([S1, S2]);
      });
    });
  });

  describe("with no base", function () {

    /* A schema read from a string nobody can name has nothing to resolve
     * against, so relative references stay relative rather than being
     * resolved against "undefined". */
    it("should leave a relative reference alone", function () {
      const schema = ShExParser.construct(null, null, {})
            .parse("<S1> { <p1> . }", null, undefined, "no-base");
      expect(schema.shapes[0].id).to.equal("S1");
      expect(predicateOf(schema.shapes[0])).to.equal("p1");
    });
  });

  describe("_setBase", function () {

    it("should change what later parses resolve against", function () {
      const parser = ShExParser.construct(BASE, null, {});
      parser._setBase("http://b.example/");
      const schema = parser.parse("<S1> { <p1> . }");
      expect(schema.shapes[0].id).to.equal("http://b.example/S1");
      expect(predicateOf(schema.shapes[0])).to.equal("http://b.example/p1");
    });

    /* More than one recoverable error is collected and reported together,
     * each line naming the document it came from. */
    it("should name the document in a multi-error report", function () {
      const parser = ShExParser.construct(BASE, null, {});
      parser._setBase("http://b.example/doc");
      let caught = null;
      try {
        parser.parse(`<S1> {
  undeclared1:p1 . ;
  undeclared2:p2 .
}
`);
      } catch (e) { caught = e; }
      expect(caught, "two unknown prefixes is two errors").to.exist;
      expect(caught.errors.length).to.equal(2);
      expect(caught.message).to.include("2 parser errors:");
      expect(caught.message).to.include("http://b.example/doc");
      expect(caught.message).to.include('unknown prefix "undeclared1:"');
      expect(caught.message).to.include('unknown prefix "undeclared2:"');
      expect(caught.message, "with a line and column for each")
        .to.match(/line: 2, column: \d+/).and.to.match(/line: 3, column: \d+/);
      expect(caught.parsed, "and what it did manage to parse").to.exist;
    });
  });
});
