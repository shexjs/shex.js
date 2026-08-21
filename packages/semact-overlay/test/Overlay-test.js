/** Actions arriving from outside the schema.
 *
 * The point of an overlay is that the actions are written somewhere the
 * schema's other readers don't have to step over, so most of what there is
 * to check is that each action lands on the element the document named.
 * Where it lands is the caller's choice of two: applyOverlay writes it into
 * the schema, indexOverlay keys it by the element and leaves the schema as
 * it found it.
 */
"use strict";

const {expect} = require("chai");
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {applyOverlay, indexOverlay, evalShapePath, NS} = require("..");

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

    /* Positional selection, which needs shape-path-core >= 0.0.6: until then
     * `[N]` ignored N and kept every node whose position was truthy, so [0]
     * and [1] both selected the last constraint. */
    it("should hang one on the element at a position", function () {
      const at = n => applyOverlay(parse(), overlayOf(`
        <#o> a sa:Overlay ; sa:extension <${EXT}> ;
          sa:action [ sa:path "@<http://a.example/S1>/expression/expressions/*[${n}]" ;
                      sa:code "at ${n}" ] .`))
            .shapes.find(s => s.id === B + "S1").shapeExpr.expression.expressions;
      expect(at(0).map(tc => [tc.predicate, actsOf(tc)]))
        .to.deep.equal([[B + "p1", [EXT + " at 0"]], [B + "p2", []]]);
      expect(at(1).map(tc => [tc.predicate, actsOf(tc)]))
        .to.deep.equal([[B + "p1", []], [B + "p2", [EXT + " at 1"]]]);
    });

    it("should say so when the position is past the end", function () {
      expect(() => applyOverlay(parse(), overlayOf(`
        <#o> a sa:Overlay ; sa:extension <${EXT}> ;
          sa:action [ sa:path "@<http://a.example/S1>/expression/expressions/*[9]" ;
                      sa:code "x" ] .`))).to.throw(/selected nothing/);
    });

    /* A labelled triple expression: `sa:ref` finds it through the schema
     * index, and since shape-path-core 0.0.7 a path can name it too.  The
     * two reach the same element by the two names it has. */
    it("should hang one on a triple expression named by a ShapePath", function () {
      const byPath = applyOverlay(parse(), overlayOf(`
        <#o> a sa:Overlay ; sa:extension <${EXT}> ;
          sa:action [ sa:path "$<http://a.example/S1-p1>" ; sa:code "p1!" ] .`));
      const byRef = applyOverlay(parse(), overlayOf(`
        <#o> a sa:Overlay ; sa:extension <${EXT}> ;
          sa:action [ sa:ref :S1-p1 ; sa:code "p1!" ] .`));
      const tcOf = s => s.shapes.find(x => x.id === B + "S1").shapeExpr.expression.expressions[0];
      expect(actsOf(tcOf(byPath))).to.deep.equal([EXT + " p1!"]);
      expect(tcOf(byPath), "the same element sa:ref reaches").to.deep.equal(tcOf(byRef));
    });

    it("should put a start action on the schema", function () {
      const schema = applyOverlay(parse(), overlayOf(`
        <#o> a sa:Overlay ; sa:extension <${EXT}> ;
          sa:action [ sa:start true ; sa:code "go!" ] .`));
      expect(schema.startActs).to.deep.equal([{type: "SemAct", name: EXT, code: "go!"}]);
    });
  });

  /* Two ways to say the same thing, and the difference is what happens to
   * the schema: one writes the actions into it, the other keys them by the
   * element and hands the caller the Map. */
  describe("the two modes", function () {

    const ONE = `<#o> a sa:Overlay ; sa:extension <${EXT}> ;
      sa:action [ sa:ref :S1 ; sa:code "S1!" ] .`;
    const shapeOf = schema => schema.shapes.find(s => s.id === B + "S1").shapeExpr;
    const S1_ACT = {type: "SemAct", name: EXT, code: "S1!"};

    it("should write on the schema it was handed", function () {
      const schema = parse();
      expect(applyOverlay(schema, overlayOf(ONE)), "the schema itself, not a copy")
        .to.equal(schema);
      expect(actsOf(shapeOf(schema))).to.deep.equal([EXT + " S1!"]);
    });

    it("should leave it alone when it indexes instead", function () {
      const schema = parse();
      const before = JSON.stringify(schema);
      const index = indexOverlay(schema, overlayOf(ONE));
      expect(JSON.stringify(schema), "unchanged").to.equal(before);
      expect(index.size).to.equal(1);
    });

    /* The Map means nothing without the schema it was built from: what it
     * is keyed by is that schema's own objects. */
    it("should key the index by the element the action lands on", function () {
      const schema = parse();
      const index = indexOverlay(schema, overlayOf(ONE));
      expect(index.get(shapeOf(schema))).to.deep.equal([S1_ACT]);
      expect(index.get(shapeOf(parse())), "not another parse of the same text")
        .to.equal(undefined);
    });

    it("should index a start action against the schema itself", function () {
      const schema = parse();
      const index = indexOverlay(schema, overlayOf(`
        <#o> a sa:Overlay ; sa:extension <${EXT}> ;
          sa:action [ sa:start true ; sa:code "go!" ] .`));
      expect(index.get(schema)).to.deep.equal([{type: "SemAct", name: EXT, code: "go!"}]);
      expect(schema, "and not on the schema").to.not.have.property("startActs");
    });

    it("should reach the same elements either way", function () {
      const overlay = `<#o> a sa:Overlay ; sa:extension <${EXT}> ;
        sa:action [ sa:ref :S1 ; sa:code "S1!" ] ,
                  [ sa:path "@<http://a.example/S1>~<http://a.example/p2>" ; sa:code "p2!" ] .`;
      const written = applyOverlay(parse(), overlayOf(overlay));
      const schema = parse();
      const index = indexOverlay(schema, overlayOf(overlay));
      const eltsOf = s => [shapeOf(s), shapeOf(s).expression.expressions[1]];
      expect(eltsOf(written).map(actsOf))
        .to.deep.equal([[EXT + " S1!"], [EXT + " p2!"]]);
      expect(eltsOf(schema).map(e => (index.get(e) || []).map(a => a.name + " " + a.code)))
        .to.deep.equal([[EXT + " S1!"], [EXT + " p2!"]]);
    });

    it("should keep sa:order in the index too", function () {
      const schema = parse();
      const index = indexOverlay(schema, overlayOf(`
        <#o> a sa:Overlay ; sa:extension <${EXT}> ;
          sa:action [ sa:ref :S1 ; sa:code "second" ; sa:order 2 ] ,
                    [ sa:ref :S1 ; sa:code "first"  ; sa:order 1 ] .`));
      expect(index.get(shapeOf(schema)).map(a => a.code)).to.deep.equal(["first", "second"]);
    });

    it("should refuse an element ShExJ has no semActs on, either way", function () {
      const onADecl = `<#o> a sa:Overlay ; sa:extension <${EXT}> ;
        sa:action [ sa:path "/shapes/*[0]" ; sa:code "nope" ] .`;
      expect(() => applyOverlay(parse(), overlayOf(onADecl))).to.throw(/is a ShapeDecl/);
      expect(() => indexOverlay(parse(), overlayOf(onADecl))).to.throw(/is a ShapeDecl/);
    });
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
