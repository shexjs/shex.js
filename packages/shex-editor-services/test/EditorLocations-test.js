/** The query map as a located document, and schemas that were not written
 * in ShExC (ShExJ, ShExR, DCTAP) located in the text they were written in
 * (plan.md D1, D5, D9). */
"use strict";

const expect = require("chai").expect;
const Fs = require("fs");
const Path = require("path");
const EditorServices = require("..");
const ShExUtil = require("@shexjs/util");

const base = "http://a.example/";
const slice = (text, range) => text.substring(range.from, range.to);

describe("EditorServices: located query maps and non-ShExC schemas", function () {

  describe("parseShapeMap", function () {
    const opts = {base, schemaMeta: {base, prefixes: {"": base}}, dataMeta: {base, prefixes: {"": base}}};
    const text = '<x>@<S>,\n  :y @! :T / "why"';

    it("should parse the pairs and say where each was written", function () {
      const parsed = EditorServices.parseShapeMap(text, opts);
      expect(parsed.diagnostics).to.deep.equal([]);
      expect(parsed.pairs.map(p => p.node)).to.deep.equal([base + "x", base + "y"]);
      expect(slice(text, parsed.locate.node(0))).to.equal("<x>");
      expect(slice(text, parsed.locate.shape(0))).to.equal("@<S>");
      expect(slice(text, parsed.locate.pair(0))).to.equal("<x>@<S>");
      expect(slice(text, parsed.locate.pair(1))).to.equal(':y @! :T / "why"');
      expect(parsed.locate.pairAt(text.indexOf(":T")).index).to.equal(1);
      expect(parsed.locate.pairAt(text.indexOf(",")), "between pairs").to.equal(null);
    });

    it("should mark where a map stops parsing", function () {
      const bad = "<x>@<S>, <y>";
      const parsed = EditorServices.parseShapeMap(bad, opts);
      expect(parsed.pairs).to.equal(null);
      expect(parsed.diagnostics.length).to.equal(1);
      expect(parsed.diagnostics[0].from, "at the end, where the shape was due").to.equal(bad.length);
      expect(parsed.diagnostics[0].message).to.match(/^Expecting/);
      expect(parsed.diagnostics[0].message, "no base and caret art").to.not.include("Parse error on line");
    });

    it("should be memoized on the metas, not the text alone", function () {
      const a = EditorServices.parseShapeMap(":x@:S", opts);
      const b = EditorServices.parseShapeMap(":x@:S", Object.assign({}, opts, {
        dataMeta: {base, prefixes: {"": "http://other.example/"}}}));
      expect(a.pairs[0].node).to.equal(base + "x");
      expect(b.pairs[0].node).to.equal("http://other.example/x");
    });
  });

  describe("datasets (doc/datasets.md): locating quads inside GRAPH blocks", function () {
    const text = [
      'PREFIX ex: <http://ex.example/ns#>',
      '',
      '<s1> ex:foo "bar" .',
      '',
      'GRAPH <CardCatalog> {',
      '  <entry1> ex:manages <s1> ;',
      '    ex:source "https://feed.example/s1" .',
      '}',
    ].join("\n");
    const parsed = EditorServices.parseTurtle(text, {baseIRI: base});
    const F = require("n3").DataFactory;

    it("should read TriG without diagnostics, graphs on the quads", function () {
      expect(parsed.diagnostics).to.deep.equal([]);
      expect(parsed.quads).to.have.length(3);
      expect(parsed.quads.filter(q => q.graph.termType === "NamedNode")).to.have.length(2);
    });

    it("should anchor a triple written inside a GRAPH block", function () {
      // a validation result's TestedTriple carries no graph; its utterance
      // may sit in any of the dataset's
      const ranges = EditorServices.quadRanges(parsed, F.quad(
        F.namedNode(base + "entry1"), F.namedNode("http://ex.example/ns#manages"), F.namedNode(base + "s1")));
      expect(ranges, "found in the block").to.not.equal(null);
      expect(slice(text, {from: ranges.subject.from, to: ranges.object.to}))
        .to.equal("<entry1> ex:manages <s1>");
    });

    it("should still anchor the default graph's own triples", function () {
      const ranges = EditorServices.quadRanges(parsed, F.quad(
        F.namedNode(base + "s1"), F.namedNode("http://ex.example/ns#foo"), F.literal("bar")));
      expect(slice(text, {from: ranges.subject.from, to: ranges.object.to}))
        .to.equal('<s1> ex:foo "bar"');
    });
  });

  describe("nodeRange", function () {
    it("should find where a node is first the subject", function () {
      const text = "PREFIX : <http://a.example/>\n:x :p 1 .\n:y :q :x .\n:x :r 2 .\n";
      const parsed = EditorServices.parseTurtle(text, {baseIRI: base});
      const range = EditorServices.nodeRange(parsed, base + "x");
      expect(slice(text, range)).to.equal(":x");
      expect(range.from).to.equal(text.indexOf(":x :p"));
      expect(EditorServices.nodeRange(parsed, base + "nowhere")).to.equal(null);
    });
  });

  describe("memoization keys (D9)", function () {
    it("should re-parse ShExC when the prefixes change", function () {
      const text = "<S> { p:x . }";
      const a = EditorServices.parseShExC(text, {base, prefixes: {p: "http://a/"}});
      const b = EditorServices.parseShExC(text, {base, prefixes: {p: "http://b/"}});
      const predicate = parsed => parsed.schema.shapes[0].shapeExpr.expression.predicate;
      expect(predicate(a)).to.equal("http://a/x");
      expect(predicate(b)).to.equal("http://b/x");
      expect(EditorServices.parseShExC(text, {base, prefixes: {p: "http://a/"}}), "a hit").to.equal(a);
    });

    it("should re-parse ShExC when the schema options change", function () {
      const text = "<S> { <p> . }";
      const a = EditorServices.parseShExC(text, {base});
      const b = EditorServices.parseShExC(text, {base, schemaOptions: {index: false}});
      expect(b, "not the same parse").to.not.equal(a);
    });
  });

  describe("schemaLanguage and lintSchema", function () {
    const shexr = Fs.readFileSync(Path.join(__dirname, "../../shex-webapp/examples/ClinObs.ttl"), "utf8");

    it("should tell the four apart", function () {
      expect(EditorServices.schemaLanguage('{"type": "Schema"}')).to.equal("ShExJ");
      expect(EditorServices.schemaLanguage("shapeID,shapeLabel,propertyID\n:s,,:p\n")).to.equal("DCTAP");
      expect(EditorServices.schemaLanguage("﻿prefix,namespace\n,http://x/\n")).to.equal("DCTAP");
      expect(EditorServices.schemaLanguage(shexr, {base})).to.equal("ShExR");
      expect(EditorServices.schemaLanguage("<S> { <p> . }", {base})).to.equal("ShExC");
      expect(EditorServices.schemaLanguage("<S> { <p> ", {base}), "broken ShExC is ShExC").to.equal("ShExC");
    });

    it("should lint each in its own language", function () {
      expect(EditorServices.lintSchema(shexr, {base})).to.deep.equal([]);
      expect(EditorServices.lintSchema("shapeID,shapeLabel,propertyID\n:s,,:p\n")).to.deep.equal([]);
      const json = EditorServices.lintSchema('{"type": "Schema", }');
      expect(json.length).to.equal(1);
      expect(json[0].from, "where JSON stops").to.be.above(0);
      const shexc = EditorServices.lintSchema("<S> { <p> ", {base});
      expect(shexc.length).to.equal(1);
      // a ShExR document mid-edit is linted as Turtle, not as ShExC
      const broken = shexr.replace("sx:shapes (", "sx:shapes (((");
      expect(EditorServices.schemaLanguage(broken, {base})).to.equal("ShExR");
      const said = EditorServices.lintSchema(broken, {base});
      expect(said.length).to.be.above(0);
      expect(said[0].message).to.not.match(/shapeExprLabel|IRIREF/);
    });
  });

  describe("synthesizeLocations (D5)", function () {
    describe("a ShExJ document", function () {
      const text = JSON.stringify({
        type: "Schema",
        shapes: [
          {type: "ShapeDecl", id: base + "S", shapeExpr: {
            type: "Shape", expression: {type: "EachOf", expressions: [
              {type: "TripleConstraint", predicate: base + "p"},
              {type: "TripleConstraint", predicate: base + "q", valueExpr: {
                type: "Shape", expression: {type: "TripleConstraint", predicate: base + "r"}}},
            ]}}},
          {type: "Shape", id: base + "T", expression: {type: "TripleConstraint", predicate: base + "s"}},
        ],
      }, null, 2);
      const schema = ShExUtil.ShExJtoAS(JSON.parse(text));
      const located = EditorServices.locateInParsed(text, schema);

      it("should locate a shape at its object", function () {
        const range = located.locate.shape(base + "S");
        expect(slice(text, range)).to.match(/^\{\s*"type": "ShapeDecl"/);
        expect(slice(text, located.locate.shapeLabel(base + "S")), "the label token").to.equal("{");
      });

      it("should locate a constraint at its object, nested ones included", function () {
        expect(slice(text, located.locate.constraint(base + "S", base + "p")))
          .to.match(/^\{\s*"type": "TripleConstraint",\s*"predicate": "http:\/\/a.example\/p"\s*\}$/);
        const nested = located.locate.constraint(base + "S", base + "r");
        expect(slice(text, nested)).to.include('"predicate": "' + base + 'r"');
        const anchors = located.locate.constraintAnchors(base + "S", base + "q");
        expect(anchors.parts.length, "the delimiters around the nested constraint").to.equal(2);
      });

      it("should locate a 2.1 shape, which ShExJtoAS wrapped in a ShapeDecl the text lacks", function () {
        expect(slice(text, located.locate.shape(base + "T"))).to.match(/^\{\s*"type": "Shape"/);
        expect(slice(text, located.locate.constraint(base + "T", base + "s"))).to.include('"' + base + 's"');
      });
    });

    describe("a ShExR document", function () {
      const text = Fs.readFileSync(Path.join(__dirname, "../../shex-webapp/examples/ClinObs.ttl"), "utf8");
      const json = JSON.parse(Fs.readFileSync(Path.join(__dirname, "../../shex-webapp/examples/ClinObs.json"), "utf8"));
      const schema = ShExUtil.ShExJtoAS(json);
      const located = EditorServices.locateInParsed(text, schema, {base: "http://schema.example/"});
      const shape = schema.shapes[0];
      const local = iri => iri.replace(/^.*[/#]/, "");

      it("should locate every shape at its description", function () {
        schema.shapes.forEach(decl => {
          const range = located.locate.shape(decl.id);
          expect(range, decl.id).to.exist;
          expect(slice(text, range), decl.id).to.match(new RegExp("^<" + local(decl.id) + ">"));
          expect(slice(text, located.locate.shapeLabel(decl.id))).to.equal("<" + local(decl.id) + ">");
        });
      });

      it("should locate a constraint at the triples that describe it", function () {
        const tc = (function first (expr) {
          if (!expr || typeof expr !== "object") return null;
          if (expr.type === "TripleConstraint") return expr;
          return (expr.expressions || []).map(first).find(x => x) || first(expr.expression) || first(expr.shapeExpr);
        })(shape.shapeExpr);
        expect(tc, "a constraint to look for").to.exist;
        const range = located.locate.expr(tc);
        expect(range).to.exist;
        const said = slice(text, range);
        expect(said).to.include("sx:predicate");
        expect(said).to.include(local(tc.predicate));
        // and the (shape, predicate) route, which validation results take
        const via = located.locate.constraint(shape.id, tc.predicate);
        expect(via).to.deep.equal(range);
      });

      it("should hand the shape's expressions to exprAt", function () {
        const range = located.locate.shape(shape.id);
        const hit = located.locate.exprAt(text.indexOf("sx:predicate", range.from));
        expect(hit, "an expression under the mouse").to.exist;
        expect(hit.expr.type).to.equal("TripleConstraint");
      });
    });

    describe("a DCTAP table", function () {
      const text = [
        "shapeID,shapeLabel,propertyID,propertyLabel,mandatory,repeatable,valueNodeType,valueDataType,valueConstraint,valueConstraintType,valueShape,note",
        "<http://a.example/book>,Book,<http://a.example/creator>,Author,1,1,IRI,,,,<http://a.example/author>,\"Writer, of the book\"",
        ",,<http://a.example/date>,,,,Literal,<http://www.w3.org/2001/XMLSchema#date>,,,,",
        "",
        "<http://a.example/author>,,<http://a.example/name>,,,,Literal,,,,,",
        "",
      ].join("\n");
      // as the app builds it: dctap over the parsed rows
      const {DcTap} = require("dctap");
      const rows = EditorServices.scanCsv(text).map(row => row.cells.map(c => c.text));
      const schema = ShExUtil.ShExJtoAS(new DcTap().parseRows(rows, base).toShEx());
      const located = EditorServices.locateInParsed(text, schema);

      it("should read the rows and their cells with offsets", function () {
        const scanned = EditorServices.scanCsv(text);
        expect(scanned[1].cells[11].text).to.equal("Writer, of the book");
        expect(slice(text, scanned[1].cells[11])).to.equal("\"Writer, of the book\"");
        expect(scanned[3].cells.length, "a blank line is one empty cell").to.equal(1);
      });

      it("should locate a shape at the rows that describe it", function () {
        const range = located.locate.shape(base + "book");
        expect(range).to.exist;
        expect(slice(text, range).split("\n").length, "its two rows").to.equal(2);
        expect(slice(text, range)).to.match(/^<http:\/\/a.example\/book>/);
        expect(slice(text, located.locate.shape(base + "author"))).to.match(/^<http:\/\/a.example\/author>,,<http:\/\/a.example\/name>/);
      });

      it("should locate each constraint at its row", function () {
        expect(slice(text, located.locate.constraint(base + "book", base + "date")))
          .to.equal(",,<http://a.example/date>,,,,Literal,<http://www.w3.org/2001/XMLSchema#date>,,,,");
        expect(slice(text, located.locate.constraint(base + "author", base + "name")))
          .to.match(/^<http:\/\/a.example\/author>,,<http:\/\/a.example\/name>/);
      });
    });

    it("should leave a ShExC schema to its parser", function () {
      const parsed = EditorServices.parseShExC("<S> { <p> . }", {base});
      expect(EditorServices.synthesizeLocations("<S> { <p> . }", {shapes: parsed.schema.shapes})).to.equal(false);
    });
  });

  describe("exprsStartingIn", function () {
    const text = "PREFIX : <http://a.example/>\n:S {\n  :p { :x . ;\n       :y . } ;\n  :q . ; :r .\n}\n";
    const parsed = EditorServices.parseShExC(text, {base});
    const starts = EditorServices.lineOffsets(text);
    const line = n => [starts[n - 1], starts[n] === undefined ? text.length : starts[n]];

    it("should name the constraints a line begins, earliest first", function () {
      expect(parsed.locate.exprsStartingIn(...line(4)).map(h => h.expr.predicate)).to.deep.equal([base + "y"]);
      expect(parsed.locate.exprsStartingIn(...line(5)).map(h => h.expr.predicate)).to.deep.equal([base + "q", base + "r"]);
      expect(parsed.locate.exprsStartingIn(...line(6))).to.deep.equal([]);
      // ...where the innermost expression at the line's start is the one
      // the line is inside of
      expect(parsed.locate.exprAt(line(4)[0] + 2).expr.predicate).to.equal(base + "p");
    });
  });
});
