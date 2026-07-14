/** Tests for the prototype NFA-thread materializer (lib/ThreadedMaterializer).
 *
 * Drives materialization directly from the stored bindings JSON in
 * examples/manifest.yaml (no validation pass needed) and compares the
 * output graph to the expected turtle by bnode isomorphism.
 */
"use strict";

const expect = require("chai").expect;
const Fs = require("fs");
const Path = require("path");
const JsYaml = require("js-yaml");
const RdfJs = require("n3");
const ShExParser = require("@shexjs/parser");
const ShExTerm = require("@shexjs/term");

const {ThreadedMaterializer, normalizeBindingTree, MaterializationError} = require("../lib/ThreadedMaterializer");

const TESTS = "TESTS" in process.env ? process.env.TESTS.split(/\|/) : null;
const examplesDir = Path.join(__dirname, "../examples");
const schemaBase = "http://a.example/schema/";

function parseSchema (text) {
  return ShExParser.construct(schemaBase, {}, {index: true}).parse(text);
}

function parseTurtle (text) {
  const store = new RdfJs.Store();
  store.addQuads(new RdfJs.Parser({baseIRI: "http://a.example/turtle/", format: "text/turtle"}).parse(text));
  return store;
}

describe("ThreadedMaterializer", function () {

  describe("examples manifest", function () {
    const manifest = JsYaml.load(Fs.readFileSync(Path.join(examplesDir, "manifest.yaml"), "utf8"));
    manifest.forEach(entry => {
      const label = entry.schemaLabel + "(" + entry.dataLabel + ")";
      if (TESTS !== null && !TESTS.find(pat => label.indexOf(pat) !== -1 || label.match(RegExp(pat))))
        return;
      it(label + " should materialize " + entry.expectedBindingsURL + " to " + entry.outputDataURL, function () {
        const schemaText = "outputSchema" in entry
              ? entry.outputSchema
              : Fs.readFileSync(Path.join(examplesDir, entry.outputSchemaURL), "utf8");
        const schema = parseSchema(schemaText);
        const bindings = JSON.parse(Fs.readFileSync(Path.join(examplesDir, entry.expectedBindingsURL), "utf8"));
        const createRoot = entry.createRoot.startsWith("_:")
              ? entry.createRoot
              : entry.createRoot.substr(1, entry.createRoot.length - 2);

        const materializer = new ThreadedMaterializer(schema);
        const got = new RdfJs.Store();
        got.addQuads(materializer.materialize(bindings, createRoot));

        const expected = parseTurtle(Fs.readFileSync(Path.join(examplesDir, entry.outputDataURL), "utf8"));
        expect(graphEquals(got, expected)).to.equal(
          true, "got:\n" + graphToString(got) + "\nexpected:\n" + graphToString(expected));
      });
    });
  });

  describe("binding tree normalization", function () {
    it("should distribute singleton bindings into repeated frames", function () {
      const tree = JSON.parse(Fs.readFileSync(Path.join(examplesDir, "BPPatient-multi-bindings-bindings.json"), "utf8"));
      const frames = normalizeBindingTree(tree);
      expect(frames.length).to.equal(2);
      frames.forEach(frame => {
        expect(frame["http://shex.io/extensions/Map/#BPDAM-name"]).to.deep.equal({value: "Sue"});
      });
      expect(frames[0]["http://shex.io/extensions/Map/#BPDAM-sysVal"].value).to.equal("110");
      expect(frames[1]["http://shex.io/extensions/Map/#BPDAM-sysVal"].value).to.equal("111");
    });

    it("should flatten nested groups, keeping group-level bindings with their frames", function () {
      const tree = JSON.parse(Fs.readFileSync(Path.join(examplesDir, "BPPatient-2-levels-bindings.json"), "utf8"));
      const frames = normalizeBindingTree(tree);
      expect(frames.length).to.equal(4);
      expect(frames.map(f => f["http://shex.io/extensions/Map/#BPDAM-reportNo"].value))
        .to.deep.equal(["one", "one", "two", "two"]);
      frames.forEach(frame => {
        expect(frame["http://shex.io/extensions/Map/#BPDAM-name"]).to.deep.equal({value: "Sue"});
      });
    });
  });

  // These are the cases that motivated the prototype: a failing branch must
  // not corrupt the binding cursor of the surviving branch.
  describe("backtracking", function () {
    const prefixes = "PREFIX : <http://a.example/>\nPREFIX Map: <http://shex.io/extensions/Map/#>\n";
    const v1Binding = {"http://a.example/v1": {value: "x"}};

    function materializeToStore (schemaText, bindings) {
      const store = new RdfJs.Store();
      store.addQuads(new ThreadedMaterializer(parseSchema(schemaText)).materialize(bindings, "_:root"));
      return store;
    }

    it("should release bindings consumed by an abandoned optional group", function () {
      // Greedy entry into the optional group consumes v1 at :a, then dies at
      // :b (v2 unbound).  The skip-arm thread must still see v1 unused so the
      // required :c can bind it.  The shared-cursor implementation loses v1.
      const store = materializeToStore(prefixes + [
        "start = @<S>",
        "<S> {",
        "  (:a . %Map:{ :v1 %}; :b . %Map:{ :v2 %})?;",
        "  :c . %Map:{ :v1 %}",
        "}"
      ].join("\n"), v1Binding);
      expect(store.size).to.equal(1);
      expect(store.match(null, null, null).toArray()[0].predicate.value).to.equal("http://a.example/c");
    });

    it("should fall through to the next OneOf disjunct on an unbound variable", function () {
      const store = materializeToStore(prefixes + [
        "start = @<S>",
        "<S> { :a . %Map:{ :v2 %} | :b . %Map:{ :v1 %} }"
      ].join("\n"), v1Binding);
      expect(store.size).to.equal(1);
      expect(store.match(null, null, null).toArray()[0].predicate.value).to.equal("http://a.example/b");
    });

    it("should stop repeating a starred subshape when bindings run out", function () {
      // Two frames feed two repetitions; the third repetition dies inside the
      // subshape after emitting intermediate triples, all of which must be
      // discarded with the dead thread.
      const store = materializeToStore(prefixes + [
        "start = @<S>",
        "<S> { :item @<I>* }",
        "<I> { :tag [:const]; :val . %Map:{ :v1 %} }"
      ].join("\n"), [[{"http://a.example/v1": {value: "x"}},
                      {"http://a.example/v1": {value: "y"}}]]);
      // 2 items x (:item link, :tag const, :val binding) = 6 triples
      expect(store.size).to.equal(6);
      expect(store.match(null, RdfJs.DataFactory.namedNode("http://a.example/val"), null).toArray()
             .map(q => q.object.value).sort()).to.deep.equal(["x", "y"]);
    });

    it("should report failures when no materialization exists", function () {
      expect(() => materializeToStore(prefixes + "start = @<S>\n<S> { :a . %Map:{ :v2 %} }", v1Binding))
        .to.throw(MaterializationError, /v2/);
    });

    it("should reference the failing TripleConstraint from failure records", function () {
      // editors anchor materialization failures via schema._exprLocations,
      // keyed by these tc objects
      const schema = parseSchema(prefixes + "start = @<S>\n<S> { :a . %Map:{ :v2 %} }");
      try {
        new ThreadedMaterializer(schema).materialize(v1Binding, "_:root");
        throw Error("expected MaterializationError");
      } catch (e) {
        expect(e).to.be.an.instanceof(MaterializationError);
        const failure = e.failures.find(f => f.tc);
        expect(failure, "failure with tc reference").to.exist;
        expect(failure.tc.predicate).to.equal("http://a.example/a");
        expect(schema._exprLocations.has(failure.tc), "tc identity resolves a location").to.equal(true);
        expect(e.message, "tc not serialized into the message").not.to.include('"type":"TripleConstraint"');
      }
    });
  });

  describe("shapeExpr composition", function () {
    const prefixes = "PREFIX : <http://a.example/>\nPREFIX Map: <http://shex.io/extensions/Map/#>\n";

    it("should materialize each ShapeAnd conjunct against the same subject", function () {
      // mirrors the vpr-FHIR CLI fixture's `start=@<Condition> AND {...}`
      const store = new RdfJs.Store();
      store.addQuads(new ThreadedMaterializer(parseSchema(prefixes + [
        "start = @<S> AND { :t [:const] }",
        "<S> { :a . %Map:{ :v1 %} }"
      ].join("\n"))).materialize({"http://a.example/v1": {value: "x"}}, "tag:root"));
      expect(store.size).to.equal(2);
      const subjects = store.match(null, null, null).toArray().map(q => q.subject.value);
      expect(subjects).to.deep.equal(["tag:root", "tag:root"]);
    });

    it("should limit repetition of subshapes that consume no frame bindings", function () {
      // <I> is satisfiable forever from its constant; the progress guard
      // stops the star after one binding-free iteration instead of maxRepeat.
      const store = new RdfJs.Store();
      store.addQuads(new ThreadedMaterializer(parseSchema(prefixes + [
        "start = @<S>",
        "<S> { :item @<I>* }",
        "<I> { :tag [:const] }"
      ].join("\n"))).materialize({}, "_:root"));
      expect(store.size).to.equal(2); // one :item link + one :tag
    });

    it("should draw staticVars from globals without consuming them", function () {
      const store = new RdfJs.Store();
      store.addQuads(new ThreadedMaterializer(parseSchema(prefixes + [
        "start = @<S>",
        "<S> { :a . %Map:{ :v9 %}; :b . %Map:{ :v9 %} }"
      ].join("\n")), {staticVars: {"http://a.example/v9": {value: "s"}}}).materialize({}, "_:root"));
      expect(store.size).to.equal(2); // both TCs see the static
    });
  });
});

/* graphEquals/findIsomorphism/mapppedTo/graphToString copied from
 * ./Map-test.js -- candidates for a shared test util. */
function graphToString (g) {
  let output = "";
  const w = new RdfJs.Writer({
    write: function (chunk, encoding, done) { output += chunk; done && done(); },
  });
  w.addQuads([...g.match(null, null, null, null)]);
  return "{\n" + output + "\n}";
}

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
