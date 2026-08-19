/** Actions arriving from outside the schema.
 *
 * The point of an overlay is that the schema is unchanged by it -- the same
 * shapes can be read by a tool that knows nothing about the actions -- so
 * most of what there is to check is that the actions land where the document
 * said and that the schema they landed on is a copy.
 */
"use strict";

const {expect} = require("chai");
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {applyOverlay, evalShapePath, NS} = require("..");

const B = "http://a.example/";
const EXT = "http://shex.io/extensions/Reduce/";

const SCHEMA = `PREFIX : <http://a.example/>
<http://a.example/S1> {
  $<http://a.example/S1-p1> :p1 . ;
  :p2 @<http://a.example/S2>
}
<http://a.example/S2> IRI
<http://a.example/S3> @<http://a.example/S1> OR @<http://a.example/S2>
`;

const parse = () => ShExParser.construct(B, null, {index: true})
      .parse(SCHEMA, B, undefined, "overlay-test");

const overlayOf = turtle => {
  const store = new N3.Store();
  store.addQuads(new N3.Parser({baseIRI: B, format: "text/turtle"}).parse(
    `PREFIX sa: <${NS}>\nPREFIX : <http://a.example/>\n` + turtle));
  return store;
};

/** the actions on one element, as "name code" strings */
const actsOf = elt => (elt.semActs || []).map(a => a.name + " " + a.code);

describe("semact overlay", function () {

  describe("naming an element", function () {

    it("should hang an action on a shape named by its label", function () {
      const schema = applyOverlay(parse(), overlayOf(`
        <#o> a sa:Overlay ; sa:extension <${EXT}> ;
          sa:action [ sa:ref :S1 ; sa:code "S1!" ] .`));
      const decl = schema.shapes.find(s => s.id === B + "S1");
      expect(decl.type, "the decl is untouched").to.equal("ShapeDecl");
      expect(decl, "a ShapeDecl has no semActs in ShExJ").to.not.have.property("semActs");
      expect(actsOf(decl.shapeExpr), "the action is on the shape expression")
        .to.deep.equal([EXT + " S1!"]);
    });

    it("should hang one on a triple expression named by its label", function () {
      const schema = applyOverlay(parse(), overlayOf(`
        <#o> a sa:Overlay ; sa:extension <${EXT}> ;
          sa:action [ sa:ref :S1-p1 ; sa:code "p1!" ] .`));
      const tc = schema.shapes.find(s => s.id === B + "S1")
            .shapeExpr.expression.expressions[0];
      expect(tc.predicate).to.equal(B + "p1");
      expect(actsOf(tc)).to.deep.equal([EXT + " p1!"]);
    });

    /* Most elements have no label: a ShapePath is how you reach them. */
    it("should hang one on an element selected by a ShapePath", function () {
      const schema = applyOverlay(parse(), overlayOf(`
        <#o> a sa:Overlay ; sa:extension <${EXT}> ;
          sa:action [ sa:path "@<http://a.example/S1>~<http://a.example/p2>" ;
                      sa:code "p2!" ] .`));
      const tc = schema.shapes.find(s => s.id === B + "S1")
            .shapeExpr.expression.expressions[1];
      expect(tc.predicate).to.equal(B + "p2");
      expect(actsOf(tc)).to.deep.equal([EXT + " p2!"]);
    });

    it("should put a start action on the schema", function () {
      const schema = applyOverlay(parse(), overlayOf(`
        <#o> a sa:Overlay ; sa:extension <${EXT}> ;
          sa:action [ sa:start true ; sa:code "go!" ] .`));
      expect(schema.startActs).to.deep.equal([{type: "SemAct", name: EXT, code: "go!"}]);
    });
  });

  /* The schema an overlay reads is shared with tools that know nothing about
   * the actions, so writing on it is the one thing an overlay must not do. */
  it("should leave the schema it read alone", function () {
    const original = parse();
    const before = JSON.stringify(original);
    const schema = applyOverlay(original, overlayOf(`
      <#o> a sa:Overlay ; sa:extension <${EXT}> ;
        sa:action [ sa:ref :S1 ; sa:code "S1!" ] .`));
    expect(JSON.stringify(original), "unchanged").to.equal(before);
    expect(schema).to.not.equal(original);
    expect(actsOf(schema.shapes.find(s => s.id === B + "S1").shapeExpr).length).to.equal(1);
  });

  describe("more than one action", function () {

    it("should run them in sa:order", function () {
      const schema = applyOverlay(parse(), overlayOf(`
        <#o> a sa:Overlay ; sa:extension <${EXT}> ;
          sa:action [ sa:ref :S1 ; sa:code "second" ; sa:order 2 ] ,
                    [ sa:ref :S1 ; sa:code "first"  ; sa:order 1 ] .`));
      expect(actsOf(schema.shapes.find(s => s.id === B + "S1").shapeExpr))
        .to.deep.equal([EXT + " first", EXT + " second"]);
    });

    /* RDF has no document order, so two actions that don't say which comes
     * first still have to come out the same way twice. */
    it("should order unordered actions the same way every run", function () {
      const twice = [0, 1].map(() => actsOf(applyOverlay(parse(), overlayOf(`
        <#o> a sa:Overlay ; sa:extension <${EXT}> ;
          sa:action [ sa:ref :S1 ; sa:code "bbb" ] , [ sa:ref :S1 ; sa:code "aaa" ] .`))
        .shapes.find(s => s.id === B + "S1").shapeExpr));
      expect(twice[0]).to.deep.equal(twice[1]);
      expect(twice[0]).to.deep.equal([EXT + " aaa", EXT + " bbb"]);
    });

    it("should add to actions the schema already had", function () {
      const schema = parse();
      schema.shapes.find(s => s.id === B + "S1").shapeExpr.semActs =
        [{type: "SemAct", name: EXT, code: "was here"}];
      const overlaid = applyOverlay(schema, overlayOf(`
        <#o> a sa:Overlay ; sa:extension <${EXT}> ;
          sa:action [ sa:ref :S1 ; sa:code "new" ] .`));
      expect(actsOf(overlaid.shapes.find(s => s.id === B + "S1").shapeExpr))
        .to.deep.equal([EXT + " was here", EXT + " new"]);
    });

    it("should take them over with replace", function () {
      const schema = parse();
      schema.shapes.find(s => s.id === B + "S1").shapeExpr.semActs =
        [{type: "SemAct", name: EXT, code: "was here"}];
      const overlaid = applyOverlay(schema, overlayOf(`
        <#o> a sa:Overlay ; sa:extension <${EXT}> ;
          sa:action [ sa:ref :S1 ; sa:code "new" ] .`), {replace: true});
      expect(actsOf(overlaid.shapes.find(s => s.id === B + "S1").shapeExpr))
        .to.deep.equal([EXT + " new"]);
    });
  });

  describe("which extension runs it", function () {

    it("should fall back to the one the overlay names", function () {
      const schema = applyOverlay(parse(), overlayOf(`
        <#o> a sa:Overlay ; sa:extension <${EXT}> ;
          sa:action [ sa:ref :S1 ; sa:code "a" ] , [ sa:ref :S1-p1 ; sa:code "b" ] .`));
      expect(actsOf(schema.shapes.find(s => s.id === B + "S1").shapeExpr))
        .to.deep.equal([EXT + " a"]);
    });

    it("should let one action name a different extension", function () {
      const other = "http://shex.io/extensions/Test/";
      const schema = applyOverlay(parse(), overlayOf(`
        <#o> a sa:Overlay ; sa:extension <${EXT}> ;
          sa:action [ sa:ref :S1 ; sa:extension <${other}> ; sa:code "a" ] .`));
      expect(actsOf(schema.shapes.find(s => s.id === B + "S1").shapeExpr))
        .to.deep.equal([other + " a"]);
    });

    it("should read only the overlay it was asked for", function () {
      const two = `
        <#one> a sa:Overlay ; sa:extension <${EXT}> ;
          sa:action [ sa:ref :S1 ; sa:code "one" ] .
        <#two> a sa:Overlay ; sa:extension <${EXT}> ;
          sa:action [ sa:ref :S1 ; sa:code "two" ] .`;
      expect(actsOf(applyOverlay(parse(), overlayOf(two), {only: B + "#one"})
                    .shapes.find(s => s.id === B + "S1").shapeExpr))
        .to.deep.equal([EXT + " one"]);
      expect(actsOf(applyOverlay(parse(), overlayOf(two))
                    .shapes.find(s => s.id === B + "S1").shapeExpr).length,
             "both, when not asked for one").to.equal(2);
    });
  });

  describe("an overlay that doesn't fit the schema", function () {

    const refuses = (turtle, match, options) =>
      expect(() => applyOverlay(parse(), overlayOf(turtle), options)).to.throw(match);

    it("should say what labels there are when the ref isn't one", function () {
      refuses(`<#o> a sa:Overlay ; sa:extension <${EXT}> ;
                 sa:action [ sa:ref :Nope ; sa:code "x" ] .`,
              /S1-p1/);
    });

    it("should refuse a path that selects nothing", function () {
      refuses(`<#o> a sa:Overlay ; sa:extension <${EXT}> ;
                 sa:action [ sa:path "@<http://a.example/Nope>" ; sa:code "x" ] .`,
              /selected nothing/);
    });

    it("should refuse a path that selects several", function () {
      refuses(`<#o> a sa:Overlay ; sa:extension <${EXT}> ;
                 sa:action [ sa:path "@<http://a.example/S1>/expression/expressions/*" ;
                             sa:code "x" ] .`,
              /selected 2 elements/);
    });

    it("should refuse an element with nowhere to put an action", function () {
      refuses(`<#o> a sa:Overlay ; sa:extension <${EXT}> ;
                 sa:action [ sa:ref :S3 ; sa:code "x" ] .`,
              /is a ShapeOr; ShExJ has semActs on/);
    });

    it("should refuse an action that names its element twice", function () {
      refuses(`<#o> a sa:Overlay ; sa:extension <${EXT}> ;
                 sa:action [ sa:ref :S1 ; sa:path "@<http://a.example/S1>" ; sa:code "x" ] .`,
              /exactly one of sa:ref, sa:path or sa:start/);
    });

    it("should refuse an action that names none", function () {
      refuses(`<#o> a sa:Overlay ; sa:extension <${EXT}> ;
                 sa:action [ sa:code "x" ] .`,
              /exactly one of sa:ref, sa:path or sa:start/);
    });

    it("should refuse an action with no extension to run it", function () {
      refuses(`<#o> a sa:Overlay ; sa:action [ sa:ref :S1 ; sa:code "x" ] .`,
              /which extension runs it/);
    });

    it("should say so when the overlay it was asked for isn't there", function () {
      refuses(`<#o> a sa:Overlay ; sa:extension <${EXT}> ;
                 sa:action [ sa:ref :S1 ; sa:code "x" ] .`,
              /no <http:\/\/a.example\/#nope> a sa:Overlay/, {only: B + "#nope"});
    });
  });

  it("should expose the ShapePath evaluator it uses", function () {
    const found = evalShapePath("@<http://a.example/S1>~<http://a.example/p1>", parse());
    expect(found.length).to.equal(1);
    expect(found[0].predicate).to.equal(B + "p1");
  });
});

/** The way back, for a schema that already has actions written into it. */
describe("extracting an overlay", function () {
  const {extractOverlay, overlayTurtle} = require("..");

  const withActions = () => {
    const schema = parse();
    schema.startActs = [{type: "SemAct", name: EXT, code: "go"}];
    schema.shapes.find(s => s.id === B + "S1").shapeExpr.semActs =
      [{type: "SemAct", name: EXT, code: "shape"}];
    const tcs = schema.shapes.find(s => s.id === B + "S1").shapeExpr.expression.expressions;
    tcs[0].semActs = [{type: "SemAct", name: EXT, code: "labelled tc"}];
    tcs[1].semActs = [{type: "SemAct", name: EXT, code: "anonymous tc"}];
    return schema;
  };

  it("should leave a schema anyone can read", function () {
    const {schema, left} = extractOverlay(withActions());
    expect(left, "nothing it couldn't name").to.deep.equal([]);
    expect(JSON.stringify(schema), "no actions anywhere").to.not.include("SemAct");
    expect(schema.shapes.length, "and the shapes are still there").to.equal(3);
  });

  it("should name each element the way an overlay can find it again", function () {
    const {actions} = extractOverlay(withActions());
    expect(actions.map(a => a.code)).to.have.members(
      ["go", "shape", "labelled tc", "anonymous tc"]);
    const by = code => actions.find(a => a.code === code);
    expect(by("go").start, "the schema's own").to.equal(true);
    expect(by("shape").ref, "a labelled shape by its label").to.equal(B + "S1");
    expect(by("labelled tc").ref, "a labelled production by its label").to.equal(B + "S1-p1");
    expect(by("anonymous tc").path, "an unlabelled constraint by its predicate")
      .to.equal(`@<${B}S1>~<${B}p2>`);
  });

  /* Extract, write, read back: the schema and the overlay together have to
   * say what the schema alone used to. */
  it("should round-trip through Turtle", function () {
    const original = withActions();
    const {schema, actions} = extractOverlay(original);
    const back = applyOverlay(schema, overlayOf(
      overlayTurtle(actions, {subject: "<#round>"}).replace(/^PREFIX sa:.*\n/, "")));
    expect(back.startActs).to.deep.equal(original.startActs);
    const wasShape = original.shapes.find(s => s.id === B + "S1").shapeExpr;
    const nowShape = back.shapes.find(s => s.id === B + "S1").shapeExpr;
    expect(actsOf(nowShape)).to.deep.equal(actsOf(wasShape));
    expect(nowShape.expression.expressions.map(actsOf))
      .to.deep.equal(wasShape.expression.expressions.map(actsOf));
  });

  /* A constraint inside a ShapeAnd has no id and no step this writes, so
   * saying nothing beats guessing wrong. */
  it("should leave behind what it can't name, and say so", function () {
    const schema = parse();
    const and = {type: "ShapeAnd", shapeExprs: [
      {type: "NodeConstraint", nodeKind: "iri",
       semActs: [{type: "SemAct", name: EXT, code: "deep"}]},
      {type: "Shape"}]};
    schema.shapes.push({type: "ShapeDecl", id: B + "S4", shapeExpr: and});
    const {schema: out, actions, left} = extractOverlay(schema);
    expect(actions, "nothing extracted").to.deep.equal([]);
    expect(left.length).to.equal(1);
    expect(left[0].where).to.include("shapeExprs[0]");
    expect(out.shapes.find(s => s.id === B + "S4").shapeExpr.shapeExprs[0].semActs,
           "still where it was").to.have.length(1);
  });

  it("should write the extension once when every action shares it", function () {
    const ttl = overlayTurtle(extractOverlay(withActions()).actions);
    expect(ttl.match(new RegExp(EXT, "g")).length, "once, on the overlay").to.equal(1);
    expect(ttl).to.include("a sa:Overlay");
  });
});
