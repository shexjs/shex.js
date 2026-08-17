/** Tests for @shexjs/editor-services: range-aware parsing and mapping of
 * validation errors onto source text in both the schema and data documents.
 */
"use strict";

const expect = require("chai").expect;
const EditorServices = require("..");
const N3 = require("n3");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("@shexjs/validator");

const base = "http://a.example/";

const schemaText = `PREFIX : <http://a.example/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
<S> {
  :name xsd:string ;
  :ref @<T>
}
<T> { :val xsd:integer }
`;

const dataText = `PREFIX : <http://a.example/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
<x> :name "hi" ;
    :ref <y> .
<y> :val "not a number" .
`;

function slice (text, range) { return text.substring(range.from, range.to); }

function validate (schemaParsed, dataText) {
  const store = new N3.Store();
  store.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"}).parse(dataText));
  const validator = new ShExValidator(schemaParsed.schema, RdfJsDb(store), {noCache: true});
  return validator.validateShapeMap([{node: base + "x", shape: base + "S"}]);
}

describe("EditorServices", function () {

  describe("parseShExC", function () {
    const parsed = EditorServices.parseShExC(schemaText, {base});

    it("should parse without diagnostics", function () {
      expect(parsed.diagnostics).to.deep.equal([]);
      expect(parsed.schema.shapes.length).to.equal(2);
    });

    it("should locate shape declarations", function () {
      expect(slice(schemaText, parsed.locate.shape(base + "T")))
        .to.equal("<T> { :val xsd:integer }");
    });

    it("should locate triple constraints", function () {
      expect(slice(schemaText, parsed.locate.constraint(base + "S", base + "ref")))
        .to.equal(":ref @<T>");
      expect(slice(schemaText, parsed.locate.constraint(base + "T", base + "val")))
        .to.equal(":val xsd:integer");
    });

    it("should locate shape references", function () {
      const refs = parsed.locate.refs(base + "T");
      expect(refs.length).to.equal(1);
      expect(slice(schemaText, refs[0])).to.equal("@<T>");
    });

    it("should return positioned diagnostics for parse errors", function () {
      const broken = EditorServices.parseShExC("<S> { :p }", {base});
      expect(broken.diagnostics.length).to.be.above(0);
      expect(broken.diagnostics[0]).to.include.keys("from", "to", "message");
    });
  });

  describe("parseTurtle", function () {
    it("should attach source ranges to quads and terms", function () {
      const parsed = EditorServices.parseTurtle(dataText, {baseIRI: base});
      expect(parsed.diagnostics).to.deep.equal([]);
      const offending = [...parsed.dataset].find(
        q => q.object.termType === "Literal" && q.object.value === "not a number");
      // the provenance index resolves quads by value, even ones the store
      // reconstructed, to their source utterances
      const [utt] = parsed.provenance.get(offending);
      expect(slice(dataText, {from: utt.object[0].start, to: utt.object[0].end}))
        .to.equal('"not a number"');
    });

    it("should stay useful on syntax errors (error tolerance)", function () {
      const parsed = EditorServices.parseTurtle(
        "PREFIX : <http://a.example/>\n<x> :p 1 .\n<broken> :q\n", {baseIRI: base});
      expect(parsed.diagnostics.length).to.be.above(0);
      expect(parsed.dataset.size).to.be.above(0); // quads before the error survive
    });
  });

  describe("repeated properties", function () {
    // packages/shex-webapp/examples/manifest.yaml "repeated properties":
    // four :p constraints must anchor pairs to their own ranges
    const rSchema = [
      "PREFIX : <http://hl7.org/fhir/>",
      "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
      "",
      "<#S1> {",
      "  :p xsd:integer ;",
      "  :p xsd:decimal ;",
      "  :p @<#S2> ;",
      "  :p IRI",
      "}",
      "",
      "<#S2> {",
      "  :q [5]",
      "}",
      ""].join("\n");
    const rData = [
      "PREFIX : <http://hl7.org/fhir/>",
      "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
      "",
      "<#n1>",
      "  :p 1.1 ;",
      "  :p <#n2> ;",
      "  :p <#n3> ;",
      "  :p 4 ;",
      ".",
      "",
      "<#n3> :q 5 .",
      ""].join("\n");

    const schemaParsed = EditorServices.parseShExC(rSchema, {base});
    const dataParsed = EditorServices.parseTurtle(rData, {baseIRI: base});
    const store = new N3.Store(dataParsed.quads);
    const validator = new ShExValidator(schemaParsed.schema, RdfJsDb(store), {noCache: true});
    const results = validator.validateShapeMap([{node: base + "#n1", shape: base + "#S1"}]);

    it("should validate conformant", function () {
      expect(results[0].status).to.equal("conformant");
    });

    const mapped = EditorServices.mapValidationErrors(results, schemaParsed, dataParsed);
    const s1Pairs = mapped.pairs.filter(
      p => p.status === "conformant" && p.schema && p.triple
        && p.triple.predicate === "http://hl7.org/fhir/p");

    it("should give each repeated-property constraint its own schema range", function () {
      expect(s1Pairs.length).to.equal(4);
      const ranges = new Set(s1Pairs.map(p => p.schema.from + "-" + p.schema.to));
      expect(ranges.size).to.equal(4);
    });

    it("should couple each data triple to the constraint that matched it", function () {
      const bySchemaText = Object.fromEntries(
        s1Pairs.map(p => [slice(rSchema, p.schema).replace(/\s+/g, " ").trim(),
                          slice(rData, p.anchors.object)]));
      // xsd:decimal can only have matched 1.1, xsd:integer only 4
      expect(bySchemaText[":p xsd:decimal"]).to.equal("1.1");
      expect(bySchemaText[":p xsd:integer"]).to.equal("4");
    });

    it("should anchor the subject for every pair", function () {
      s1Pairs.forEach(p => {
        expect(p.anchors.subject, "subject anchor").not.to.equal(null);
        expect(slice(rData, p.anchors.subject)).to.equal("<#n1>");
      });
    });
  });

  describe("nested shapes and blank node properties", function () {
    // gist.github.com/ericprud/95bdee44bdf824c1d2c9d9d1fa2257c6: inline
    // shapes two deep (:r { :s { :t ["t"] } }) matched by nested bnode
    // property lists in the data
    const nSchema = [
      "PREFIX : <http://hl7.org/fhir/>",
      "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
      "",
      "<#S1> CLOSED {",
      "  :p xsd:integer ;",
      "  :p IRI ;",
      "  :p xsd:decimal ;",
      "  :p @<#S2> ;",
      "  :r {",
      "    :s {",
      "      :t [\"t\"]",
      "    }",
      "  }",
      "}",
      "",
      "<#S2> {",
      "  :q [5]",
      "}",
      ""].join("\n");
    const nData = [
      "PREFIX : <http://hl7.org/fhir/>",
      "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
      "",
      "<#n1>",
      "  :p 1.1 ;",
      "  :p <#n3> ;",
      "  :r [",
      "    :s [",
      "      :t \"t\"",
      "    ]",
      "  ] ;",
      "  :p <#n2> ;",
      "  :p 4 ;",
      ".",
      "",
      "<#n3> :q 5 .",
      ""].join("\n");

    const schemaParsed = EditorServices.parseShExC(nSchema, {base});
    const dataParsed = EditorServices.parseTurtle(nData, {baseIRI: base});
    // validate against an independent N3 parse so bnode labels diverge from
    // the provenance parse (as in the webapp, whose validation store comes
    // from the app's own parser)
    const store = new N3.Store(new N3.Parser({baseIRI: base}).parse(nData));
    const validator = new ShExValidator(schemaParsed.schema, RdfJsDb(store), {noCache: true});
    const results = validator.validateShapeMap([{node: base + "#n1", shape: base + "#S1"}]);

    it("should validate conformant", function () {
      expect(results[0].status).to.equal("conformant");
    });

    const mapped = EditorServices.mapValidationErrors(results, schemaParsed, dataParsed);
    const P = "http://hl7.org/fhir/";
    const byPred = pred => mapped.pairs.filter(
      p => p.status === "conformant" && p.triple && p.triple.predicate === P + pred);
    const slices = (text, ranges) => (ranges || []).map(r => slice(text, r));

    it("should anchor the outermost bnode-object constraint (:r)", function () {
      const [rPair] = byPred("r");
      expect(rPair, ":r pair").to.exist;
      // the constraint's own extent is its delimiters, not the nested body
      expect(slices(nSchema, rPair.schemaParts)).to.deep.equal([":r {", "}"]);
      expect(rPair.schemaPath).to.deep.equal([]);
      // IRI subject: the term itself; bnode object: just its [ ] delimiters
      expect(slice(nData, rPair.anchors.subject)).to.equal("<#n1>");
      expect(rPair.anchors.subjectParts).to.equal(undefined);
      expect(slices(nData, rPair.anchors.objectParts)).to.deep.equal(["[", "]"]);
    });

    it("should anchor the middle constraint (:s) with its path", function () {
      const [sPair] = byPred("s");
      expect(sPair, ":s pair").to.exist;
      expect(slices(nSchema, sPair.schemaParts)).to.deep.equal([":s {", "}"]);
      expect(slices(nSchema, sPair.schemaPath)).to.deep.equal([":r"]);
      // both its subject and object are bnode property lists
      expect(slices(nData, sPair.anchors.subjectParts)).to.deep.equal(["[", "]"]);
      expect(slices(nData, sPair.anchors.objectParts)).to.deep.equal(["[", "]"]);
      // ... and its subject is the same bnode :r points at
      const [rPair] = byPred("r");
      expect(sPair.anchors.subjectParts).to.deep.equal(rPair.anchors.objectParts);
    });

    it("should anchor the deepest constraint (:t) with the full path", function () {
      const [tPair] = byPred("t");
      expect(tPair, ":t pair").to.exist;
      // no inline shape of its own: a single contiguous part
      expect(slices(nSchema, tPair.schemaParts)).to.deep.equal([":t [\"t\"]"]);
      expect(slices(nSchema, tPair.schemaPath)).to.deep.equal([":r", ":s"]);
      expect(slices(nData, tPair.anchors.subjectParts)).to.deep.equal(["[", "]"]);
      expect(slice(nData, tPair.anchors.object)).to.equal("\"t\"");
      expect(tPair.anchors.objectParts).to.equal(undefined);
      // its subject is the bnode :s points at
      const [sPair] = byPred("s");
      expect(tPair.anchors.subjectParts).to.deep.equal(sPair.anchors.objectParts);
    });

    it("should still couple the repeated :p properties correctly", function () {
      const bySchemaText = Object.fromEntries(
        byPred("p").map(p => [slice(nSchema, p.schema).replace(/\s+/g, " ").trim(),
                              slice(nData, p.anchors.object)]));
      expect(bySchemaText[":p xsd:decimal"]).to.equal("1.1");
      expect(bySchemaText[":p xsd:integer"]).to.equal("4");
    });
  });

  /* A constraint whose value is an inline shape lexically contains that
   * shape's constraints, so its own highlight is only its delimiters -- and a
   * note the author left between the last nested constraint and the closing
   * brace is neither a delimiter nor a nested constraint.  Highlighting
   * E107's `p:P31 { ps:P31 [...] }` used to paint "# wd:Q37748 = chromosome"
   * along with the brace. */
  describe("comments are trivia, not part of a constraint", function () {
    const withComments = [
      "PREFIX p: <http://www.wikidata.org/prop/>",
      "PREFIX ps: <http://www.wikidata.org/prop/statement/>",
      "PREFIX wd: <http://www.wikidata.org/entity/>",
      "",
      "<chromosome> EXTRA p:P279 {",
      "    # instance of;",
      "    p:P31 {",
      "        ps:P31 [ wd:Q37748 ] # wd:Q37748 = chromosome",
      "    } ;",
      "    p:P279 { # a note before the nested constraint",
      "        ps:P279 [ wd:Q186380 ]",
      "    } ? ;",
      "}",
      ""].join("\n");

    const parsed = EditorServices.parseShExC(withComments);
    const tcs = {};
    (function walk (expr) {
      if (!expr || typeof expr !== "object")
        return;
      if (expr.type === "TripleConstraint")
        tcs[expr.predicate.replace(/^.*\//, "")] = expr;
      ["expression", "expressions", "valueExpr", "shapeExpr", "shapeExprs"].forEach(k => {
        const v = expr[k];
        if (Array.isArray(v)) v.forEach(walk); else walk(v);
      });
    })(parsed.schema.shapes[0]);

    const parts = tc => (parsed.locate.exprAnchors(tc) || {parts: []})
          .parts.map(r => slice(withComments, r));

    it("should find the constraints this is about", function () {
      // prop/P31 and prop/statement/P31 both end in P31; the walk keeps the
      // inner one, which is why the outer is fetched through the shape below
      expect(Object.keys(tcs).sort()).to.deep.equal(["P279", "P31"]);
    });

    it("should paint only the delimiters of a constraint holding an inline shape", function () {
      const outer = parsed.schema.shapes[0].shapeExpr.expression.expressions[0];
      expect(outer.predicate).to.equal("http://www.wikidata.org/prop/P31");
      // the whole range does contain the comment -- it is inside the braces
      expect(slice(withComments, parsed.locate.expr(outer))).to.include("# wd:Q37748");
      // ...but what lights up is the two ends of it
      expect(parts(outer)).to.deep.equal(["p:P31 {", "}"]);
    });

    it("should skip a comment before the nested constraint too", function () {
      const outer = parsed.schema.shapes[0].shapeExpr.expression.expressions[1];
      expect(outer.predicate).to.equal("http://www.wikidata.org/prop/P279");
      expect(parts(outer)).to.deep.equal(["p:P279 {", "} ?"]);
    });

    it("should leave a constraint with nothing nested in it whole", function () {
      expect(parts(tcs.P31)).to.deep.equal(["ps:P31 [ wd:Q37748 ]"]);
    });

    it("should keep the predicate side clear of the comment", function () {
      const label = Object.keys(parsed.schema._locations)[0];
      expect(slice(withComments, parsed.locate.constraint(
        label, "http://www.wikidata.org/prop/P31"))).to.equal("p:P31");
      expect(slice(withComments, parsed.locate.constraint(
        label, "http://www.wikidata.org/prop/P279"))).to.equal("p:P279");
    });
  });

  /* The data pane's half of the same rule.  A term written as a nested
   * structure -- a blank node's [ property list ], a collection's ( ... ) --
   * spans everything between its delimiters, which includes whatever the
   * author wrote in there.  What gets marked is where it opens; the triples
   * inside carry their own marks. */
  describe("nested Turtle terms mark their delimiters, not their contents", function () {
    const nestSchema = [
      "PREFIX : <http://a.example/>",
      "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
      "<S> { :addr @<T> }",
      "<T> { :city xsd:integer }",
      ""].join("\n");
    const nestData = [
      "PREFIX : <http://a.example/>",
      "<x> :addr [ # inline",
      '    :city "Y"   # a note',
      "  ] .",
      ""].join("\n");

    const schemaParsed = EditorServices.parseShExC(nestSchema, {base});
    const dataParsed = EditorServices.parseTurtle(nestData, {baseIRI: base});
    const results = validate(schemaParsed, nestData);
    const mapped = EditorServices.mapValidationErrors(results, schemaParsed, dataParsed);

    it("should fail, so there is something to mark", function () {
      expect(results[0].status).to.equal("nonconformant");
    });

    it("should not stretch a squiggle over the whole property list", function () {
      mapped.data.forEach(d => {
        expect(slice(nestData, d), d.message).to.not.include("#");
        expect(slice(nestData, d), d.message).to.not.include("\n");
      });
    });

    it("should mark where the blank node opens", function () {
      const onBnode = mapped.pairs.filter(
        p => p.anchors.objectParts && p.data);
      expect(onBnode.length, "a pair whose object is the property list").to.be.above(0);
      expect(slice(nestData, onBnode[0].data)).to.equal("[");
    });

    it("should read a collection as a nested form too", function () {
      const listSchema = [
        "PREFIX : <http://a.example/>",
        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
        "<S> { :list xsd:integer }",
        ""].join("\n");
      const listData = [
        "PREFIX : <http://a.example/>",
        "<x> :list ( 1 # one",
        "  2 ) . # two",
        ""].join("\n");
      const sp = EditorServices.parseShExC(listSchema, {base});
      const dp = EditorServices.parseTurtle(listData, {baseIRI: base});
      const m = EditorServices.mapValidationErrors(validate(sp, listData), sp, dp);
      const withParts = m.pairs.filter(p => p.anchors.objectParts);
      expect(withParts.length, "( ... ) has delimiters like [ ... ] does").to.be.above(0);
      expect(withParts.map(p => slice(listData, p.anchors.objectParts[0]))).to.include("(");
      m.data.forEach(d => expect(slice(listData, d), d.message).to.not.include("#"));
    });
  });

  describe("commentRanges", function () {
    const found = text => EditorServices.commentRanges(text)
          .map(r => text.substring(r.from, r.to));

    it("should not read an IRI fragment as a comment", function () {
      // the wikidata schemas are full of these
      expect(found("PREFIX E107: <https://www.wikidata.org/wiki/Special:EntitySchemaText/E107#>"))
        .to.deep.equal([]);
    });

    it("should not read a hash inside a literal as a comment", function () {
      expect(found('<S> { :p ["a # b"] } # real')).to.deep.equal(["# real"]);
      const long = "<S> { :p [" + "'''" + "a\n# not a comment\n" + "'''" + "] } # real";
      expect(found(long)).to.deep.equal(["# real"]);
    });

    it("should not read an escaped hash in a local name as a comment", function () {
      expect(found("<S> { :p ex:a\\#b } # real")).to.deep.equal(["# real"]);
    });

    it("should take a comment to the end of its line, or of the document", function () {
      expect(found('# with <angles> and "quotes"\n<S> { :p . }'))
        .to.deep.equal(['# with <angles> and "quotes"']);
      expect(found("<S> { :p . } # trailing, no newline"))
        .to.deep.equal(["# trailing, no newline"]);
    });
  });

  describe("stringifyWithOffsets", function () {
    const results = {type: "ShapeTest", solution: {type: "TripleConstraintSolutions", solutions: [
      {type: "TestedTriple", subject: "s", predicate: "p", object: {value: "o1"}},
      {type: "TestedTriple", subject: "s", predicate: "p", object: {value: "o2"}, skipMe: undefined},
    ]}};

    it("should serialize exactly like JSON.stringify", function () {
      const {text} = EditorServices.stringifyWithOffsets(results, () => false);
      expect(text).to.equal(JSON.stringify(results, null, 2));
    });

    it("should map each target object to its own range", function () {
      const {text, ranges} = EditorServices.stringifyWithOffsets(
        results, o => o && o.type === "TestedTriple");
      expect(ranges.length).to.equal(2);
      ranges.forEach((r, i) => {
        const parsed = JSON.parse(text.slice(r.from, r.to));
        expect(parsed.object.value).to.equal("o" + (i + 1));
        expect(r.target).to.equal(results.solution.solutions[i]);
      });
    });

    it("should record subject/predicate/object member ranges", function () {
      // a nested solution: the outer triple's members must exclude it
      const nested = {type: "ShapeTest", solution: {type: "TripleConstraintSolutions", solutions: [
        {type: "TestedTriple", subject: "s", predicate: "p", object: "_:b0",
         referenced: {type: "ShapeTest", node: "_:b0", solution: {
           type: "TripleConstraintSolutions", solutions: [
             {type: "TestedTriple", subject: "_:b0", predicate: "q", object: {value: "o"}}]}}},
      ]}};
      const {text, ranges} = EditorServices.stringifyWithOffsets(
        nested, o => o && o.type === "TestedTriple");
      expect(ranges.length).to.equal(2);
      const [inner, outer] = ranges; // depth-first: nested target closes first
      [inner, outer].forEach(r => {
        ["subject", "predicate", "object"].forEach(k => {
          expect(r.fields, "fields").to.exist;
          const fieldText = text.slice(r.fields[k].from, r.fields[k].to);
          expect(fieldText).to.include(JSON.stringify(k) + ":");
        });
      });
      expect(text.slice(outer.fields.object.from, outer.fields.object.to))
        .to.equal('"object": "_:b0"');
      // the outer members stop before the nested solution's range
      ["subject", "predicate", "object"].forEach(k => {
        expect(outer.fields[k].to).to.be.at.most(inner.from);
      });
    });

    /* The synthetic case above pins the mechanism.  This one asks the
     * question the reader cares about, over a result the validator actually
     * produced: when the app paints a match, does it paint anything that
     * belongs to a different match?  A results pane is one long JSON
     * document in which every nested solution is lexically inside its
     * parent, so "highlight this triple" has to mean its three members and
     * not the subtree hanging off them. */
    describe("over a real validation, with real nesting", function () {
      const nestSchema = [
        "PREFIX : <http://a.example/>",
        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
        "BASE <http://a.example/>",
        "<S> { :name xsd:string ; :tag @<T> * }",
        "<T> { :v . ; :sub @<U> ? }",
        "<U> { :w . }",
        ""].join("\n");
      const nestData = [
        "PREFIX : <http://a.example/>",
        '<x> :name "Bob" ; :tag [ :v 1 ; :sub [ :w 9 ] ] , [ :v 2 ] .',
        ""].join("\n");
      const schemaParsed = EditorServices.parseShExC(nestSchema, {base});
      const results = validate(schemaParsed, nestData);

      // the app's own two lines: which objects get a range, and which of
      // those ranges it paints (ShExBaseApp's ShExResultsRenderer)
      const {text, ranges} = EditorServices.stringifyWithOffsets(
        results, o => o && (o.type === "TestedTriple" || results.indexOf(o) !== -1));
      const tested = ranges.filter(r => r.target && r.target.type === "TestedTriple");
      const painted = r => r.fields
            ? ["subject", "predicate", "object"].map(k => r.fields[k]).filter(f => f)
            : [{from: r.from, to: r.to}];

      it("should conform, so every triple is a match with a range", function () {
        expect(results[0].status).to.equal("conformant");
        expect(tested.length, "nested solutions, not just top-level ones").to.be.above(4);
      });

      it("should paint no part of another triple's match", function () {
        const overlaps = [];
        tested.forEach((a, i) => tested.slice(i + 1).forEach(b => {
          painted(a).forEach(ra => painted(b).forEach(rb => {
            if (ra.from < rb.to && rb.from < ra.to)
              overlaps.push(JSON.stringify(text.slice(ra.from, ra.to)).slice(0, 60));
          }));
        }));
        expect(overlaps, "one match's highlight covering another's").to.deep.equal([]);
      });

      it("should stop at the members and never reach the subtree", function () {
        tested.forEach(r => painted(r).forEach(range => {
          const said = text.slice(range.from, range.to);
          expect(said, "a member, not the solution hanging off it")
            .to.not.include('"referenced"');
          expect(said).to.not.include('"TestedTriple"');
        }));
      });

      it("should paint a member that says which member it is", function () {
        tested.forEach(r => {
          expect(r.fields, "every tested triple has its members located").to.exist;
          ["subject", "predicate", "object"].forEach(k =>
            expect(text.slice(r.fields[k].from, r.fields[k].to))
              .to.match(new RegExp('^"' + k + '": ')));
        });
      });
    });

  });

  describe("mapValidationErrors", function () {
    const schemaParsed = EditorServices.parseShExC(schemaText, {base});
    const dataParsed = EditorServices.parseTurtle(dataText, {baseIRI: base});

    it("should anchor a value error in both documents", function () {
      // <y> :val "not a number" fails <T>'s :val xsd:integer
      const results = validate(schemaParsed, dataText);
      expect(results[0].status).to.equal("nonconformant");
      const mapped = EditorServices.mapValidationErrors(results, schemaParsed, dataParsed);

      const schemaTexts = mapped.schema.map(d => slice(schemaText, d));
      expect(schemaTexts).to.include(":val xsd:integer");

      const dataTexts = mapped.data.map(d => slice(dataText, d));
      expect(dataTexts).to.include('"not a number"');

      // the two diagnostics describing the same error share a pair id
      const pair = mapped.pairs.find(p => p.schema && p.data &&
        slice(schemaText, p.schema) === ":val xsd:integer");
      expect(pair, "paired schema+data anchors").to.exist;
      expect(slice(dataText, pair.data)).to.equal('"not a number"');
    });

    it("should pair matched constraints with data triples (conformant hover anchors)", function () {
      const goodData = [
        "PREFIX : <http://a.example/>",
        'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>',
        '<x> :name "hi" ;',
        "    :ref <y> .",
        '<y> :val 42 .',
      ].join("\n");
      const goodParsed = EditorServices.parseTurtle(goodData, {baseIRI: base});
      const results = validate(schemaParsed, goodData);
      expect(results[0].status).to.equal("conformant");
      const mapped = EditorServices.mapValidationErrors(results, schemaParsed, goodParsed);

      expect(mapped.schema, "no failure squiggles on a conformant result").to.deep.equal([]);
      const matches = mapped.pairs.filter(p => p.status === "conformant");
      expect(matches.length).to.be.above(0);

      // the nested <y> :val 42 match: constraint, shape label and all three terms
      const valMatch = matches.find(p => p.schema && slice(schemaText, p.schema) === ":val xsd:integer");
      expect(valMatch, "match for :val constraint").to.exist;
      expect(slice(schemaText, valMatch.anchors.shapeLabel)).to.equal("<T>");
      expect(slice(goodData, valMatch.anchors.subject)).to.equal("<y>");
      expect(slice(goodData, valMatch.anchors.predicate)).to.equal(":val");
      expect(slice(goodData, valMatch.anchors.object)).to.equal("42");
    });

    it("should carry term anchors on failures too", function () {
      const results = validate(schemaParsed, dataText);
      const mapped = EditorServices.mapValidationErrors(results, schemaParsed, dataParsed);
      const fail = mapped.pairs.find(p => p.status === "nonconformant" && p.anchors.object &&
                                     slice(dataText, p.anchors.object) === '"not a number"');
      expect(fail, "failure pair anchored on the offending literal").to.exist;
      expect(slice(dataText, fail.anchors.subject)).to.equal("<y>");
      expect(slice(dataText, fail.anchors.predicate)).to.equal(":val");
      expect(slice(schemaText, fail.anchors.shapeLabel)).to.equal("<T>");
    });

    it("should anchor errors from structured-clone results (worker app)", function () {
      // postMessage clones validation results, breaking object identity with
      // the schema; the (shape, predicate) fallback must still anchor
      const results = validate(schemaParsed, dataText);
      const cloned = JSON.parse(JSON.stringify(results)); // harsher than structured clone
      const mapped = EditorServices.mapValidationErrors(cloned, schemaParsed, dataParsed);

      const schemaTexts = mapped.schema.map(d => slice(schemaText, d));
      expect(schemaTexts, "anchored via predicate lookup despite lost identity")
        .to.include(":val xsd:integer");
      const dataTexts = mapped.data.map(d => slice(dataText, d));
      expect(dataTexts).to.include('"not a number"');
    });

    it("should never paint sibling constraints of a failure", function () {
      // regression: a NodeConstraintViolation nested in a TypeMismatch used
      // to fall back to the whole shape declaration, painting the healthy
      // :subject constraint red with the :status error's message
      const obsSchema = [
        "PREFIX : <http://a.example/>",
        "<ObservationShape> {",
        '  :status ["preliminary" "final"] ;',
        "  :subject @<PatientShape>",
        "}",
        "<PatientShape> { :name . }",
      ].join("\n");
      const obsData = [
        "PREFIX : <http://a.example/>",
        '<obs> :status "bogus" ;',
        "      :subject <pat> .",
        '<pat> :name "Sue" .',
      ].join("\n");
      const obsParsed = EditorServices.parseShExC(obsSchema, {base});
      const obsData_ = EditorServices.parseTurtle(obsData, {baseIRI: base});
      const store = new N3.Store();
      store.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"}).parse(obsData));
      const validator = new ShExValidator(obsParsed.schema, RdfJsDb(store), {noCache: true});
      const results = validator.validateShapeMap([{node: base + "obs", shape: base + "ObservationShape"}]);
      const mapped = EditorServices.mapValidationErrors(results, obsParsed, obsData_);

      expect(mapped.schema.length).to.be.above(0);
      mapped.schema.forEach(diag => {
        const sliced = obsSchema.substring(diag.from, diag.to);
        expect(sliced, diag.message).not.to.include(":subject");
        expect(sliced.startsWith(":status") || sliced === "<ObservationShape>",
               "anchored on the failing constraint or the shape label, got " + JSON.stringify(sliced))
          .to.equal(true);
      });
    });

    it("should anchor a missing property on the constraint and the focus node", function () {
      const missingData = `PREFIX : <http://a.example/>\n<x> :name "hi" .\n`;
      const missingParsed = EditorServices.parseTurtle(missingData, {baseIRI: base});
      const results = validate(schemaParsed, missingData);
      expect(results[0].status).to.equal("nonconformant");
      const mapped = EditorServices.mapValidationErrors(results, schemaParsed, missingParsed);

      const schemaTexts = mapped.schema.map(d => slice(schemaText, d));
      expect(schemaTexts.some(t => t.startsWith(":ref @<T>") || t.startsWith("<S>")),
             "anchors :ref constraint or <S>: " + JSON.stringify(schemaTexts)).to.equal(true);
      // the sentence comes from @shexjs/util now, shared with errsToSimple
      expect(mapped.pairs.some(p => /missing property/.test(p.message))).to.equal(true);
    });
  });

  /** Two structurally identical inline shapes: the pair anchors must follow
   * the enclosing predicate (:systolic vs :diastolic), not just be the
   * first structural match (https://gist.github.com/ericprud/106bcd07b17889e8d830b961dcb1e48f:
   * hovering :systolic's ":value xsd:float" also highlighted the diastolic
   * value triple). */
  describe("nested identical constraints", function () {
    const bpSchema = `PREFIX : <http://a.example/med#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
<BPunitsDAM> {
  :systolic {
    :value xsd:float ;
    :units xsd:string
  } ;
  :diastolic {
    :value xsd:float ;
    :units xsd:string
  }
}
`;
    const bpData = `PREFIX med: <http://a.example/med#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
<tag:b0> med:systolic [ med:value "100"^^xsd:float ; med:units "mmHg" ] ;
  med:diastolic [ med:value "60"^^xsd:float ; med:units "mmHg" ] .
`;
    const med = "http://a.example/med#";
    let mapped, bpParsed;

    before(function () {
      bpParsed = EditorServices.parseShExC(bpSchema, {base});
      const bpData_ = EditorServices.parseTurtle(bpData, {baseIRI: base});
      const store = new N3.Store();
      store.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"}).parse(bpData));
      const validator = new ShExValidator(bpParsed.schema, RdfJsDb(store), {noCache: true});
      const results = validator.validateShapeMap([{node: "tag:b0", shape: base + "BPunitsDAM"}]);
      expect(results[0].status).to.equal("conformant");
      mapped = EditorServices.mapValidationErrors(results[0].appinfo, bpParsed, bpData_);
    });

    it("should anchor each nested :value on its own branch", function () {
      const byObject = (text) => mapped.pairs.find(p =>
        p.status === "conformant" && p.data && bpData.substring(p.data.from, p.data.to).startsWith(text));
      const systolicValue = byObject('"100"');
      const diastolicValue = byObject('"60"');
      expect(systolicValue, "systolic :value pair").to.exist;
      expect(diastolicValue, "diastolic :value pair").to.exist;
      // both read ":value xsd:float" but at different offsets...
      expect(slice(bpSchema, systolicValue.schema)).to.equal(":value xsd:float");
      expect(slice(bpSchema, diastolicValue.schema)).to.equal(":value xsd:float");
      expect(systolicValue.schema.from).not.to.equal(diastolicValue.schema.from);
      // ... on the right side of the :diastolic declaration
      const diastolicDecl = bpSchema.indexOf(":diastolic");
      expect(systolicValue.schema.from).to.be.below(diastolicDecl);
      expect(diastolicValue.schema.from).to.be.above(diastolicDecl);
      // the :units pairs split the same way
      const unitsPairs = mapped.pairs.filter(p =>
        p.status === "conformant" && p.schema && slice(bpSchema, p.schema).startsWith(":units"));
      expect(unitsPairs.length).to.equal(2);
      expect(unitsPairs.map(p => p.schema.from > diastolicDecl).sort()).to.deep.equal([false, true]);
    });

    it("should select constraints by enclosing-predicate path", function () {
      const systolic = bpParsed.locate.constraint(base + "BPunitsDAM", med + "value", 0, [med + "systolic"]);
      const diastolic = bpParsed.locate.constraint(base + "BPunitsDAM", med + "value", 0, [med + "diastolic"]);
      expect(slice(bpSchema, systolic)).to.equal(":value xsd:float");
      expect(slice(bpSchema, diastolic)).to.equal(":value xsd:float");
      expect(systolic.from).to.be.below(bpSchema.indexOf(":diastolic"));
      expect(diastolic.from).to.be.above(bpSchema.indexOf(":diastolic"));
      // an unmatched path falls back to the unfiltered candidates
      const fallback = bpParsed.locate.constraint(base + "BPunitsDAM", med + "value", 0, [med + "nonesuch"]);
      expect(fallback).to.deep.equal(systolic);
    });
  });
  describe("mapMaterialization", function () {
    // two reports, each with a systolic and a diastolic reading: the blank
    // nodes are structurally identical apart from their values, and every
    // reading repeats :units "mmHg"
    const outSchema = `PREFIX : <http://a.example/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX Map: <http://shex.io/extensions/Map/#>
<Report> {
  :reading {
    :value xsd:float %Map:{ :v %} ;
    :units xsd:string %Map:{ :u %}
  }+
}
`;
    const located = EditorServices.locateInParsed(
      outSchema, EditorServices.parseShExC(outSchema, {base}).schema);
    const F = N3.DataFactory;
    const {namedNode: N, blankNode: B, literal: L, quad: Q} = F;
    const value = base + "value", units = base + "units", reading = base + "reading";
    // as a materializer emits them: one blank node per reading
    const generated = [
      Q(N(base + "r"), N(reading), B("tm1")),
      Q(B("tm1"), N(value), L("100")), Q(B("tm1"), N(units), L("mmHg")),
      Q(N(base + "r"), N(reading), B("tm2")),
      Q(B("tm2"), N(value), L("60")), Q(B("tm2"), N(units), L("mmHg")),
    ];
    const readingTc = located.schema.shapes[0].shapeExpr.expression;
    const valueTc = readingTc.valueExpr.expression.expressions[0];
    const unitsTc = readingTc.valueExpr.expression.expressions[1];
    const provenance = [
      {quad: generated[0], tc: readingTc, src: {structural: true}},
      {quad: generated[1], tc: valueTc, src: {variables: [base + "v"], frame: 0}},
      {quad: generated[2], tc: unitsTc, src: {variables: [base + "u"], frame: 0}},
      {quad: generated[3], tc: readingTc, src: {structural: true}},
      {quad: generated[4], tc: valueTc, src: {variables: [base + "v"], frame: 1}},
      {quad: generated[5], tc: unitsTc, src: {variables: [base + "u"], frame: 1}},
    ];

    it("should anchor each triple on its own constraint and rendered term", function () {
      const rendered = `PREFIX : <http://a.example/>
:r :reading [ :value "100"; :units "mmHg" ], [ :value "60"; :units "mmHg" ] .
`;
      const pairs = EditorServices.mapMaterialization(
        provenance, located, EditorServices.parseTurtle(rendered, {baseIRI: base}));
      expect(pairs.length).to.equal(6);
      expect(pairs.filter(p => !p.anchors.object).length, "all anchored").to.equal(0);
      const at = (p) => slice(rendered, p.anchors.object);
      expect(at(pairs[1])).to.equal('"100"');
      expect(at(pairs[4])).to.equal('"60"');
      // the two :units triples are indistinguishable by value: they must
      // still anchor inside their own reading, not each other's
      expect(pairs[2].anchors.object.from).to.be.below(rendered.indexOf('"60"'));
      expect(pairs[5].anchors.object.from).to.be.above(rendered.indexOf('"60"'));
      // the constraint side
      expect(slice(outSchema, pairs[1].schema)).to.include(":value xsd:float");
      expect(pairs[1].variables).to.deep.equal([base + "v"]);
      expect(pairs[0].structural).to.equal(true);
      // a constraint whose valueExpr is an inline shape highlights as its
      // delimiters, not the nested constraints
      expect(pairs[0].schemaParts.length).to.be.above(1);
    });

    it("should keep identical siblings apart when the rendering reorders them", function () {
      // the app renders the proof graph, whose order need not be the
      // materializer's: pairing blank nodes by first fit would bind tm1 to
      // the "60" reading, and :units "mmHg" would still "match" it
      const rendered = `PREFIX : <http://a.example/>
:r :reading [ :value "60"; :units "mmHg" ], [ :value "100"; :units "mmHg" ] .
`;
      const pairs = EditorServices.mapMaterialization(
        provenance, located, EditorServices.parseTurtle(rendered, {baseIRI: base}));
      expect(pairs.filter(p => !p.anchors.object).length, "all anchored").to.equal(0);
      expect(slice(rendered, pairs[1].anchors.object)).to.equal('"100"');
      expect(slice(rendered, pairs[4].anchors.object)).to.equal('"60"');
      // tm1's :units belongs to the "100" reading, which now renders second
      expect(pairs[2].anchors.object.from).to.be.above(rendered.indexOf('"100"'));
      expect(pairs[5].anchors.object.from).to.be.below(rendered.indexOf('"100"'));
      // no two triples may claim the same span
      const spots = pairs.map(p => p.anchors.object.from);
      expect(new Set(spots).size).to.equal(spots.length);
    });

    it("should leave a triple unanchored rather than guess", function () {
      const rendered = `PREFIX : <http://a.example/>
:r :reading [ :value "100"; :units "mmHg" ] .
`;
      const pairs = EditorServices.mapMaterialization(
        provenance, located, EditorServices.parseTurtle(rendered, {baseIRI: base}));
      expect(pairs.filter(p => p.anchors.object).length, "only the rendered reading").to.equal(3);
      expect(slice(rendered, pairs[1].anchors.object)).to.equal('"100"');
      expect(pairs[4].anchors.object, "the absent reading anchors nowhere").to.equal(null);
    });
  });
});
