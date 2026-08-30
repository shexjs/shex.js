/** The Lezer ShExC grammar against the ShEx test suite: every schema the
 * validator accepts parses without an error node, and the syntactically
 * broken ones show where they break -- and the highlighting says what
 * each token is.  (An ES module, as the package is.) */
import {expect} from "chai";
import Fs from "fs";
import Path from "path";
import {fileURLToPath} from "url";
import {parser, highlighting} from "../src/index.js";
import {highlightTree, tagHighlighter, tags as t} from "@lezer/highlight";

const here = Path.dirname(fileURLToPath(import.meta.url));
const SHEX_TEST = Path.join(here, "../../../node_modules/shex-test");
const schemasDir = Path.join(SHEX_TEST, "schemas");
const negativeDir = Path.join(SHEX_TEST, "negativeSyntax");

/** the error nodes of a parse, as {from, to} */
function errorsIn (tree) {
  const found = [];
  tree.iterate({enter (node) { if (node.type.isError) found.push({from: node.from, to: node.to}); }});
  return found;
}

/** the roles the highlighting tells apart, most specific first */
const roles = tagHighlighter([
  {tag: t.definition(t.className), class: "declaration"},
  {tag: t.className, class: "reference"},
  {tag: t.propertyName, class: "predicate"},
  {tag: t.typeName, class: "type"},
  {tag: t.modifier, class: "modifier"},
  {tag: t.regexp, class: "regexp"},
  {tag: t.number, class: "number"},
  {tag: t.meta, class: "code"},
  {tag: t.string, class: "string"},
  {tag: t.logicOperator, class: "logic"},
  {tag: t.definitionKeyword, class: "directive"},
]);

/** what the highlighter says each token is, as [text, role] pairs */
function tokensOf (text) {
  const tree = parser.parse(text);
  const out = [];
  highlightTree(tree, roles, (from, to, classes) => out.push([text.slice(from, to), classes]));
  return out;
}

describe("lezer-shexc", function () {

  describe("the ShEx test suite's schemas", function () {
    const files = Fs.existsSync(schemasDir) ? Fs.readdirSync(schemasDir).filter(f => f.endsWith(".shex")).sort() : [];
    before(function () {
      if (!files.length)
        this.skip();                    // no shex-test checkout
    });

    it("should be a few hundred of them", function () {
      expect(files.length).to.be.above(400);
    });

    it("should parse every one of them without an error node", function () {
      const failed = [];
      files.forEach(f => {
        const text = Fs.readFileSync(Path.join(schemasDir, f), "utf8");
        const tree = parser.parse(text);
        const errors = errorsIn(tree);
        if (errors.length || tree.length !== text.length)
          failed.push(f + (errors.length ? " at " + errors.map(e => e.from).join(",") : " short"));
      });
      expect(failed, failed.length + " of " + files.length + " failed").to.deep.equal([]);
    });
  });

  describe("the syntactically broken ones", function () {
    // negativeSyntax holds what the reference parser refuses; some of it
    // for reasons no grammar sees (a facet named twice, an unknown prefix,
    // a numeric facet on a string datatype).  These are the ones that are
    // wrong in the text.
    const broken = [
      "1dotUnlabeledCode1", "1inverseinversedot", "1negatednegateddot", "1val1vcrefSTRING_LITERAL1",
      "1valA", "a", "base-no-uri", "base-uri-dot", "bnodedot", "capitol-A", "DECIMAL-123.abc",
      "DOUBLE-123e", "group-no-SEMICOLON-separators", "groupShapeConstr-trailing-OR",
      "INTEGER-+-1", "INTEGER-123abc", "INTEGER-in-shape-expression", "IRIREF-with-ECHAR",
      "IRIREF-with-PN_LOCAL_ESC", "IRIREF-with-SPACE", "literal-0x123", "PN_LOCAL-dash-start",
      "PN_LOCAL-PERCENT-end", "PN_LOCAL-PERCENT-mid", "PN_LOCAL-PERCENT-start",
      "PN_LOCAL-unescaped-TILDE", "predicate-ANON", "predicate-BLANK_NODE_LABEL",
      "predicate-literal", "predicate-true", "prefix-no-COLON", "prefix-no-PNAME_NS",
      "prefix-no-uri", "shapename-a", "shapename-literal", "shapename-true",
      "STRING_LITERAL_LONG2-unterminated", "STRING_LITERAL1-ending-QUOTATION_MARK",
      "STRING_LITERAL2-bad-ECHAR", "STRING_LITERAL2-ending-APOSTROPHE",
      "tripleConsraint-no-valueClass", "tripleConsraint-with-datatype-and-dot",
      "tripleConsraint-with-dot-and-datatype", "tripleConsraint-with-two-cardinalities",
    ];
    before(function () {
      if (!Fs.existsSync(negativeDir))
        this.skip();
    });

    it("should show where each of them breaks", function () {
      const passed = [];
      broken.forEach(name => {
        const text = Fs.readFileSync(Path.join(negativeDir, name + ".shex"), "utf8");
        const tree = parser.parse(text);
        if (errorsIn(tree).length === 0 && tree.length === text.length)
          passed.push(name);
      });
      expect(passed, "parsed without an error node").to.deep.equal([]);
    });

    it("should still parse the rest of a broken schema", function () {
      const text = "PREFIX : <http://a.example/>\n:S { :p . ; :q }\n:T { :r xsd:integer }\n";
      const tree = parser.parse(text);
      expect(errorsIn(tree).length, "an error where :q lacks its value").to.be.above(0);
      const decls = [];
      tree.iterate({enter (node) { if (node.name === "ShapeExprDecl") decls.push(text.slice(node.from, node.to)); }});
      expect(decls.length, "both declarations, the broken one included").to.equal(2);
      expect(decls[1]).to.equal(":T { :r xsd:integer }");
    });
  });

  describe("the tree", function () {
    const text = [
      "PREFIX ex: <http://ex.example/>",
      "start = @ex:S",
      "ex:S EXTRA ex:p CLOSED {",
      "  ex:p IRI /^https?:/ ;",
      "  ^ex:q @ex:T {2,*} // ex:note 'twice' %ex:act{ code %} ;",
      "  ($ex:lbl ex:r [ ex:a ex:b~ - ex:bad \"lit\"@en @fr~ . - @de ] | &ex:lbl)",
      "}",
      "ex:T LITERAL MININCLUSIVE 1 OR @ex:S AND NOT BNODE",
    ].join("\n");
    const tree = parser.parse(text);

    it("should be whole and clean", function () {
      expect(errorsIn(tree)).to.deep.equal([]);
      expect(tree.length).to.equal(text.length);
    });

    it("should name the constructs", function () {
      const names = new Set();
      tree.iterate({enter (node) { names.add(node.name); }});
      ["PrefixDecl", "Start", "ShapeExprDecl", "ShapeExprLabel", "ExtraPropertySet", "InlineShapeDefinition",
       "TripleExpression", "TripleConstraint", "Predicate", "NodeConstraint", "NodeKind", "StringFacet", "REGEXP",
       "SenseFlags", "ShapeRef", "Cardinality", "REPEAT_RANGE", "Annotation", "CodeDecl", "CODE",
       "BracketedTripleExpr", "TripleExprLabel", "ValueSet", "IriRange", "IriExclusion", "LiteralRange",
       "LangString", "LanguageRange", "WildcardRange", "LanguageExclusion", "Include",
       "ShapeOr", "ShapeAnd", "ShapeNot", "NumericFacet"].forEach(name =>
         expect([...names], name).to.include(name));
    });

    it("should tell a shape's label from a reference to it, and a predicate from a datatype", function () {
      const tokens = tokensOf(text);
      const classOf = (tokenText, nth = 0) => tokens.filter(([t]) => t === tokenText)[nth][1];
      expect(classOf("@ex:S")).to.equal("reference");          // start = @ex:S
      expect(classOf("ex:S")).to.equal("declaration");         // ex:S EXTRA ...
      expect(classOf("ex:p", 1)).to.equal("predicate");        // the constraint's
      expect(classOf("ex:p")).to.equal("predicate");           // EXTRA's too
      expect(classOf("PREFIX")).to.equal("directive");
      expect(classOf("EXTRA")).to.equal("modifier");
      expect(classOf("IRI")).to.equal("type");
      expect(classOf("/^https?:/")).to.equal("regexp");
      expect(classOf("{2,*}")).to.equal("number");
      expect(classOf("{ code %}")).to.equal("code");
      expect(classOf("\"lit\"@en")).to.equal("string");
      expect(classOf("OR")).to.equal("logic");
    });
  });

  it("should export its highlighting for a host that configures the parser itself", function () {
    expect(highlighting).to.exist;
  });
});
