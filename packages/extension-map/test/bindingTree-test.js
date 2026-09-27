/** Tests for bindingTree (lib/bindingTree): the binding tree of a validation result in the
 * scope layout -- own object first, one list per repeated expression (empty when nothing
 * matched), uniform iterations, @node on iterations of shape-valued constraints, nested
 * non-repeated shapes merged, EXTENDS results merged -- and matchedTriples.
 */
"use strict";

const expect = require("chai").expect;
const Fs = require("fs");
const Path = require("path");
const JsYaml = require("js-yaml");
const RdfJs = require("n3");
const ShExParser = require("@shexjs/parser");
const ShExTerm = require("@shexjs/term");
const ShExUtil = require("@shexjs/util");
const {ShExValidator, resultMapToShapeExprTest} = require("@shexjs/validator");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {textOf} = require("../../../tools/manifest-runner");
const Mapper = require("..")({rdfjs: RdfJs, Validator: ShExValidator});
const {bindingTree, matchedTriples, NODE_KEY} = require("../lib/bindingTree");
const {normalizeBindingTree} = require("../lib/ThreadedMaterializer");

const examplesDir = Path.join(__dirname, "../examples");
const P = "PREFIX : <http://a.example/>\nPREFIX v: <http://v.example/>\nPREFIX Map: <http://shex.io/extensions/Map/#>\n";

function validate (schemaText, turtle, focus, shape) {
  const schema = ShExParser.construct("http://a.example/schema/", {}, {index: true}).parse(schemaText);
  const store = new RdfJs.Store();
  store.addQuads(new RdfJs.Parser({baseIRI: "http://a.example/turtle/", format: "text/turtle"}).parse(turtle));
  const validator = new ShExValidator(schema, RdfJsDb(store), {noCache: true});
  Mapper.register(validator, {ShExTerm, ShExUtil});
  const res = resultMapToShapeExprTest(validator.validateShapeMap([{node: focus, shape: shape || ShExValidator.Start}]));
  expect(res.errors || [], "validation").to.deep.equal([]);
  return res;
}

const NESTED = P + "start=@<P>\n<P> { :report { :no . %Map:{ v:no %} ; :result { :sys . %Map:{ v:sys %} }* ; :att . * %Map:{ v:att %} }* }";
const REPORTS = 'PREFIX : <http://a.example/>\n:p :report <http://a.example/r1>, <http://a.example/r2> ; :other "x" .\n' +
      '<http://a.example/r1> :no "one" ; :result [ :sys 100 ], [ :sys 101 ] ; :att "a" .\n<http://a.example/r2> :no "two" .';

describe("bindingTree", function () {
  const V = "http://v.example/";

  it("should write the own object first, one list per repeated expression, empty when unmatched", function () {
    const tree = bindingTree(validate(NESTED, REPORTS, "http://a.example/p"));
    expect(Array.isArray(tree)).to.equal(true);
    expect(tree[0]).to.deep.equal({});                          // the root binds nothing of its own
    expect(tree.length).to.equal(2);                            // one repeated expression: :report
    const reports = tree[1];
    expect(reports.length).to.equal(2);
    const [r1, r2] = reports.map(r => Array.isArray(r) ? r : null);
    expect(r1[0][NODE_KEY]).to.equal("http://a.example/r1");
    expect(r1[0][V + "no"]).to.deep.equal({value: "one"});
    expect(r1.length).to.equal(3);                              // own, :result list, :att list
    expect(r1[1].length).to.equal(2);                           // two results
    expect(r1[1][0][NODE_KEY]).to.match(/^_:/);                 // a blank node the shape matched
    expect(r1[2]).to.deep.equal([{[V + "att"]: {value: "a"}}]);
    expect(r2[0][NODE_KEY]).to.equal("http://a.example/r2");
    expect(r2[1]).to.deep.equal([]);                            // r2 has no results: the list is there, empty
    expect(r2[2]).to.deep.equal([]);
  });

  it("should keep the frames the flattening gives", function () {
    const tree = bindingTree(validate(NESTED, REPORTS, "http://a.example/p"));
    const frames = normalizeBindingTree(tree);
    expect(frames.map(f => Object.keys(f).map(k => k.replace(V, "")).sort()))
      .to.deep.equal([["no", "sys"], ["no", "sys"], ["att", "no"], ["no"]]);
    frames.forEach(f => expect(f).not.to.have.property(NODE_KEY));
  });

  it("should merge a non-repeated nested shape into its scope", function () {
    const tree = bindingTree(validate(P + "start=@<S>\n<S> { :venue @<Venue> ; :name . %Map:{ v:name %} }\n<Venue> { :city . %Map:{ v:city %} }",
                                      'PREFIX : <http://a.example/>\n:s :name "gig" ; :venue [ :city "Paris" ] .', "http://a.example/s"));
    expect(tree).to.deep.equal({[V + "name"]: {value: "gig"}, [V + "city"]: {value: "Paris"}});
  });

  it("should wrap a lone object iteration when its siblings are arrays", function () {
    const tree = bindingTree(validate(P + "start=@<P>\n<P> { :report { :no . %Map:{ v:no %} ; :result { :sys . %Map:{ v:sys %} }* }* }",
                                      REPORTS, "http://a.example/p"));
    expect(tree[1].every(Array.isArray)).to.equal(true);
    const r2 = tree[1].find(r => r[0][NODE_KEY] === "http://a.example/r2");
    expect(r2).to.deep.equal([{[NODE_KEY]: "http://a.example/r2", [V + "no"]: {value: "two"}}, []]);
  });

  it("should bind the subject of an inverse constraint as the iteration's node", function () {
    const tree = bindingTree(validate(P + "start=@<Pat>\n<Pat> { :name . %Map:{ v:name %} ; ^:subject { :bpm . %Map:{ v:bpm %} }* }",
                                      'PREFIX : <http://a.example/>\n:pat :name "Ann" . :obs1 :subject :pat ; :bpm 72 . :obs2 :subject :pat ; :bpm 75 .',
                                      "http://a.example/pat"));
    expect(tree[1].map(it => it[NODE_KEY]).sort()).to.deep.equal(["http://a.example/obs1", "http://a.example/obs2"]);
  });

  it("should merge EXTENDS results, where valToExtension bound nothing", function () {
    const schema = P + "start=@<Clinic>\n<Clinic> { :member @<Person>* }\nABSTRACT <Person> { :name . %Map:{ v:name %} }\n" +
          "<Patient> EXTENDS @<Person> { :mrn . %Map:{ v:mrn %} }\n<Clinician> EXTENDS @<Person> { :license . %Map:{ v:license %} }";
    const data = 'PREFIX : <http://a.example/>\n:c :member :ann, :cy . :ann :name "Ann" ; :mrn "42" . :cy :name "Cy" ; :license "L1" .';
    const res = validate(schema, data, "http://a.example/c");
    expect(ShExUtil.valToExtension(res, Mapper.url), "the legacy extraction").to.deep.equal({});
    const tree = bindingTree(res);
    const members = tree[1].map(m => Object.assign({}, m));
    expect(members.map(m => m[V + "name"].value).sort()).to.deep.equal(["Ann", "Cy"]);
    expect(members.find(m => m[V + "mrn"])[V + "name"]).to.deep.equal({value: "Ann"});
  });

  it("should report the triples the schema matched", function () {
    const res = validate(NESTED, REPORTS, "http://a.example/p");
    const matched = matchedTriples(res);
    expect(matched.length).to.equal(9);                          // everything but :other
    expect(matched.some(t => t.predicate === "http://a.example/other")).to.equal(false);
  });

  describe("examples manifest", function () {
    const manifest = JsYaml.load(Fs.readFileSync(Path.join(examplesDir, "manifest.yaml"), "utf8"));
    manifest.filter(e => e.expectedBindingsURL).forEach(entry => {
      it(entry.schemaLabel + "(" + entry.dataLabel + ") should bind to " + entry.expectedBindingsURL, function () {
        const schema = ShExParser.construct("http://a.example/schema/", {}, {index: true}).parse(textOf(entry, "schema", examplesDir));
        const store = new RdfJs.Store();
        store.addQuads(new RdfJs.Parser({baseIRI: "http://a.example/turtle/", format: "text/turtle"}).parse(textOf(entry, "data", examplesDir)));
        const validator = new ShExValidator(schema, RdfJsDb(store), {noCache: true});
        Mapper.register(validator, {ShExTerm, ShExUtil});
        const m = entry.queryMap.match(/^(<[^>]*>|_:\S+)@(START|<[^>]*>)$/);
        let node = m[1];
        if (node.startsWith("_:")) {
          const objects = new Set(store.getQuads(null, null, null, null).map(q => q.object.id));
          const root = store.getQuads(null, null, null, null).map(q => q.subject).find(s => !objects.has(s.id));
          node = root.termType === "BlankNode" ? "_:" + root.value : root.value;
        } else {
          const base = (/^\s*BASE\s*<([^>]*)>/im.exec(textOf(entry, "data", examplesDir)) || [])[1] || "http://a.example/turtle/";
          node = new URL(node.slice(1, -1), base).href;
        }
        const shape = m[2] === "START" ? ShExValidator.Start : new URL(m[2].slice(1, -1), "http://a.example/schema/").href;
        const res = resultMapToShapeExprTest(validator.validateShapeMap([{node, shape}]));
        expect(res.errors || []).to.deep.equal([]);
        const expected = JSON.parse(Fs.readFileSync(Path.join(examplesDir, entry.expectedBindingsURL), "utf8"));
        expect(withoutBnodeLabels(bindingTree(res))).to.deep.equal(withoutBnodeLabels(expected));
      });
    });
  });
});

/** blank-node labels depend on the parser; compare structure and values */
function withoutBnodeLabels (tree) {
  if (Array.isArray(tree))
    return tree.map(withoutBnodeLabels);
  if (tree && typeof tree === "object" && !("value" in tree)) {
    const out = {};
    for (const k of Object.keys(tree))
      out[k] = typeof tree[k] === "string" && tree[k].startsWith("_:") ? "_:" : tree[k];
    return out;
  }
  return tree;
}
