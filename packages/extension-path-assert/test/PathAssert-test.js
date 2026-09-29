/** The Assert extension end to end: XPath-style expressions as semantic
 * actions.
 *
 * What is pinned: the language's meaning (steps, closures, filters,
 * comparisons, functions, quantifiers), what each place in a schema binds,
 * that a failure explains itself, that invocation errors are thrown rather
 * than reported, and that the same expressions run over every kind of data
 * source -- a store, an asynchronous one, a wikibase's pages and (gated on
 * TEST_sparql) a SPARQL endpoint -- because all of them are read through
 * getNeighborhood.
 */
"use strict";

const TEST_sparql = require("../../shex-cli/test/testGate.js")("TEST_sparql");

const expect = require("chai").expect;
const fs = require("fs");
const path = require("path");
const N3 = require("n3");
const JsYaml = require("js-yaml");
const ShExParser = require("@shexjs/parser");
const ShExTerm = require("@shexjs/term");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("@shexjs/validator");
const Assert = require("..");

const base = "http://a.example/";
const PRE = `PREFIX : <${base}>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX assert: <http://shex.io/extensions/PathAssert/>
`;

function store (turtle) {
  const s = new N3.Store();
  s.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"}).parse(PRE + turtle));
  return s;
}

function validator (schemaText, db) {
  const schema = ShExParser.construct(base, {}, {index: true}).parse(PRE + schemaText);
  const v = new ShExValidator(schema, db, {});
  Assert.register(v, {ShExTerm});
  return v;
}

function validate (schemaText, data, node = base + "n", shape = base + "S") {
  const [result] = validator(schemaText, RdfJsDb(store(data))).validateShapeMap([{node, shape}]);
  return result;
}

/** the failures the Assert extension raised, wherever they are in the result */
function assertFailures (result) {
  const found = [];
  (function walk (x) {
    if (Array.isArray(x)) return x.forEach(walk);
    if (x === null || typeof x !== "object") return;
    if (x.type === "SemActFailure" && typeof x.assertion === "string") found.push(x);
    Object.keys(x).forEach(k => walk(x[k]));
  })(result.appinfo);
  return found;
}

const DATA = `
:n a :T ;
   :a 1, 2 ;
   :b 3 ;
   :s "x"@en, "y"@fr ;
   :d "2020-01-01"^^xsd:date ;
   :e "2020-01-02"^^xsd:date ;
   :label "Hund"@de, "dog"@en ;
   :k :m .
:m :k :o .
:x :child :n .
`;

describe("extension-path-assert", function () {

  describe("the language", function () {
    /* each expression on the shape of :n, which binds `.` and $this to :n */
    const cases = [
      // steps and comparisons
      [":a = 1", true], [":a = 3", false], [":a = :b", false], [":a < :b", true],
      [":e >= :d", true], [":d > :e", false], [":a != 1", true],        // existential, as XPath
      ["not(:a != :a)", false],
      ["a = @:T", true], ["@:T/^a = .", true], [". = $this", true],
      // paths, inverse steps, closures
      [":k/:k = @:o", true], [":k/^:k = .", true], ["^:child = @:x", true],
      [":k* = @:o", true], [":k+ = .", false], [":k? = @:m", true], [":k? = @:o", false],
      ["count(:k*) = 3", true],
      // filters
      ["count(:label[lang(.) = \"de\"]) = 1", true],
      [":label[langMatches(lang(.), \"en\")] = \"dog\"@en", true],
      ["empty(:a[. > 5])", true],
      // sets
      ["(:a | :b) = 3", true], ["count(:a union :b) = 3", true],
      ["empty(:a except (1, 2))", true], ["count(:a intersect (1, 5)) = 1", true],
      ["count((:a, :b)) = 3", true],
      // functions
      ["exists(:b)", true], ["empty(:zzz)", true], ["not(exists(:zzz))", true], ["count(:zzz) = 0", true],
      ["strlen(:s) = 1", true], ["string-length(:s) = 1", true], ["contains(:s, \"x\")", true],
      ["ucase(:s) = \"X\"@en", true], ["regex(:s, \"^x$\")", true], ["matches(:s, \"^X$\", \"i\")", true],
      ["starts-with(str(.), \"http://a.example/\")", true], ["strstarts(str(.), \"nope\")", false],
      ["lang(:label) = \"de\"", true], ["datatype(:d) = @xsd:date", true], ["year(:d) = 2020", true],
      ["sum(:a) = 3", true], ["avg(:a) = 1.5", true], ["min(:a) = 1", true], ["max(:a) = 2", true],
      ["isIRI(.)", true], ["isLiteral(:a)", true], ["concat(\"a\", \"b\") = \"ab\"", true],
      ["substr(\"hello\", 2, 3) = \"ell\"", true], ["replace(\"hello\", \"l+\", \"L\") = \"heLo\"", true],
      // arithmetic, and closure versus multiplication
      [":a + :b = 4", true], [":b * 2 = 6", true], [":b div 2 = 1.5", true], [":b mod 2 = 1", true],
      ["-:b = -3", true], [":a* = 1", true], [":a *2 = 4", true],
      // quantifiers, let, if, implies
      ["every $x in :a satisfies $x < 3", true], ["every $x in :a satisfies $x = 1", false],
      ["some $x in :a satisfies $x = 2", true],
      ["let $m := max(:a) return $m = 2", true],
      ["if (exists(:b)) then :b = 3 else false", true],
      [":b = 3 implies :a = 1", true], [":b = 3 implies :a = 7", false], [":b = 9 implies :a = 7", true],
      [":a = 1 and :b = 3", true], [":a = 1 && :b = 9", false], [":a = 9 || :b = 3", true], ["!(:a = 1)", false],
      // comments, and a bare path as a boolean
      [":a = 1 # trailing comment", true], [":zzz", false], [":a", true],
    ];
    cases.forEach(([expr, expected]) =>
      it(`${expr} is ${expected}`, function () {
        const r = validate(`<S> { } %assert:{ ${expr} %}`, DATA);
        expect(r.status, JSON.stringify(r.appinfo)).to.equal(expected ? "conformant" : "nonconformant");
      }));
  });

  describe("where the action is", function () {
    it("on a triple constraint, `.` and $value are the object and $this the subject", function () {
      expect(validate("<S> { :b . %assert:{ . = 3 and $value = 3 and $this = @:n %} }", DATA).status).to.equal("conformant");
    });

    it("on an inverse triple constraint, $value is the subject", function () {
      expect(validate("<S> { ^:child . %assert:{ $value = @:x and . = @:x and $this = @:n %} }", DATA).status).to.equal("conformant");
    });

    it("decides which triple a constraint gets", function () {
      const LABELS = `<S> {
        :label . %assert:{ lang(.) = "de" %} ;
        :label . %assert:{ lang(.) = "en" %}
      }`;
      expect(validate(LABELS, DATA).status).to.equal("conformant");
      expect(validate(LABELS, `:n :label "Hund"@de, "Katze"@de .`).status).to.equal("nonconformant");
    });

    it("on a node constraint, `.` is the value", function () {
      const POSITIVE = "<S> { :b @<P> } <P> xsd:integer %assert:{ . > 0 %}";
      expect(validate(POSITIVE, DATA).status).to.equal("conformant");
      expect(validate(POSITIVE, `:n :b -3 .`).status).to.equal("nonconformant");
    });

    it("on a group, `.` is the node the triples share", function () {
      const GROUP = "<S> { (:a . ; :b .) %assert:{ . = $this and :a < :b %} }";
      expect(validate(GROUP, `:n :a 1 ; :b 2 .`).status).to.equal("conformant");
      expect(validate(GROUP, `:n :a 2 ; :b 1 .`).status).to.equal("nonconformant");
    });

    it("in the start actions, starts from a node", function () {
      const START = "%assert:{ every $t in @:T/^a satisfies exists($t/:a) %} <S> { }";
      expect(validate(START, DATA).status).to.equal("conformant");
      expect(validate(START, `:n a :T . :q a :T .`).status).to.equal("nonconformant");
    });

    it("in the start actions, a step from nowhere is an invocation error", function () {
      expect(() => validate("%assert:{ :a = 1 %} <S> { }", DATA)).to.throw(/nothing to start from/);
    });

    it("runs at every level of a recursive shape", function () {
      const EVENT = `<S> { :start . ; :end . ; :part @<S> * } %assert:{ :end >= :start %}`;
      expect(validate(EVENT, `:n :start 1 ; :end 9 ; :part :m . :m :start 2 ; :end 8 .`).status).to.equal("conformant");
      expect(validate(EVENT, `:n :start 1 ; :end 9 ; :part :m . :m :start 8 ; :end 2 .`).status).to.equal("nonconformant");
    });
  });

  describe("a failure", function () {
    it("explains itself with the values it looked at", function () {
      const r = validate("<S> { } %assert:{ :e < :d %}", DATA);
      expect(r.status).to.equal("nonconformant");
      const [f] = assertFailures(r);
      expect(f.assertion).to.equal(":e < :d");
      expect(f.errors[0]).to.include("assertion failed: :e < :d");
      expect(f.explanation).to.deep.equal([':e = "2020-01-02"^^xsd:date', ':d = "2020-01-01"^^xsd:date']);
    });

    it("explains a count", function () {
      const [f] = assertFailures(validate('<S> { } %assert:{ count(:label[lang(.) = "en"]) = 2 %}', DATA));
      expect(f.explanation).to.deep.equal(['count(:label[lang(.) = "en"]) = 1']);
    });

    it("explains the paths a boolean function looked at, but not constants", function () {
      const [f] = assertFailures(validate('<S> { } %assert:{ contains(:s, "zzz") %}', DATA));
      expect(f.explanation).to.deep.equal([':s = "x"@en, "y"@fr']);
    });

    it("says (empty) for a path that found nothing", function () {
      const [f] = assertFailures(validate('<S> { } %assert:{ :zzz = 1 %}', DATA));
      expect(f.explanation).to.deep.equal([':zzz = (empty)']);
    });

    it("carries the message fail() was given", function () {
      const [f] = assertFailures(validate('<S> { } %assert:{ :a = 9 or fail("no nine") %}', DATA));
      expect(f.errors).to.deep.equal(["no nine"]);
    });
  });

  describe("invocation errors", function () {
    [["<S> { } %assert:{ :a = = 1 %}", /didn't parse/],
     ["<S> { } %assert:{ nosuch(:a) %}", /unknown function nosuch/],
     ["<S> { } %assert:{ zz:a = 1 %}", /unknown prefix "zz:"/],
     ["<S> { } %assert:{ $x = 1 %}", /\$x is not bound/],
     ["<S> { } %assert:{ strlen() = 1 %}", /strlen\(\) takes 1 argument/],
     ["<S> { } %assert:{ count(:a)*2 = 4 %}", /closure/],
     ["<S> { } %assert:{ %}", /expected an expression/],
    ].forEach(([schema, message]) =>
      it(`throws ${message}`, function () {
        expect(() => validate(schema, DATA)).to.throw(message);
      }));

    it("is a multiplication with a space", function () {
      expect(validate("<S> { } %assert:{ count(:a) * 2 = 4 %}", DATA).status).to.equal("conformant");
    });
  });

  describe("over an asynchronous data source", function () {
    /** an async db over an rdfjs store, remembering what it was asked for */
    function remote (graph) {
      const inner = RdfJsDb(graph);
      const asked = [];
      return {
        asked,
        getSubjects: () => inner.getSubjects(), getPredicates: () => inner.getPredicates(),
        getObjects: () => inner.getObjects(), getQuads: (...a) => inner.getQuads(...a),
        get size () { return inner.size; },
        getNeighborhood: async (point, shapeLabel, shape) => {
          asked.push(point.value);
          await new Promise(res => setTimeout(res, 0));
          return inner.getNeighborhood(point, shapeLabel, shape);
        },
      };
    }

    it("reaches the synchronous verdict, asking once per node", async function () {
      const schema = "<S> { :k . %assert:{ ./:k = @:o and $this/:k* = @:o %} } %assert:{ :k/:k = @:o %}";
      const want = validate(schema, DATA);
      const db = remote(store(DATA));
      const [got] = await validator(schema, db).validateShapeMapAsync([{node: base + "n", shape: base + "S"}]);
      expect(got.status).to.equal("conformant");
      expect(JSON.stringify(got)).to.equal(JSON.stringify(want));
      // :m for the paths and :o for the closure, which steps from what it
      // reaches; the validator's own fetch of :n is another
      expect(new Set(db.asked.filter(v => v !== base + "n"))).to.deep.equal(new Set([base + "m", base + "o"]));
    });

    it("explains a failure asynchronously too", async function () {
      const db = remote(store(DATA));
      const [got] = await validator("<S> { } %assert:{ :k/:k = @:zzz %}", db).validateShapeMapAsync([{node: base + "n", shape: base + "S"}]);
      expect(got.status).to.equal("nonconformant");
      expect(assertFailures(got)[0].explanation).to.deep.equal([":k/:k = :o"]);
    });

    it("answers without a promise where the source does", function () {
      const v = validator("<S> { } %assert:{ :a = 1 %}", RdfJsDb(store(DATA)));
      const handler = v.semActHandler.handlers["http://shex.io/extensions/PathAssert/"];
      const answer = handler.dispatch(":a = 1", {node: N3.DataFactory.namedNode(base + "n"), triples: []}, {});
      expect(answer).to.deep.equal([]);
    });
  });

  describe("over a wikibase", function () {
    const {wikibaseDB, forgetPages} = require("@shexjs/neighborhood-wikibase");
    const fixtures = path.join(__dirname, "../../neighborhood-wikibase/test/fixtures");
    const fetchDoc = url => url.indexOf("sitematrix") !== -1
          ? fs.readFileSync(path.join(fixtures, "sitematrix.json"), "utf8")
          : fs.readFileSync(path.join(fixtures, url.match(/EntityData\/([QPL]\d+)\.json$/)[1] + ".json"), "utf8");

    it("follows steps into pages it fetches as it goes", function () {
      forgetPages();
      const db = wikibaseDB(null, {fetchDoc});
      const schema = ShExParser.construct(base, {}, {index: true}).parse(`
        PREFIX wd: <http://www.wikidata.org/entity/>
        PREFIX wdt: <http://www.wikidata.org/prop/direct/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX assert: <http://shex.io/extensions/PathAssert/>
        <Human> { wdt:P31 [wd:Q5] } %assert:{ wdt:P31/^wdt:P31 = . and exists(wdt:P31/rdfs:label) %}`);
      const v = new ShExValidator(schema, db, {});
      Assert.register(v, {ShExTerm});
      const [r] = v.validateShapeMap([{node: "http://www.wikidata.org/entity/Q42", shape: base + "Human"}]);
      expect(r.status, JSON.stringify(r.appinfo)).to.equal("conformant");
      // wdt:P31/rdfs:label looked inside Q5, which had to be fetched for it
      expect(db.loadedPages().map(p => p.id).sort()).to.deep.equal(["Q42", "Q5"]);
    });
  });

  if (!TEST_sparql) {
    console.warn("Skipping extension-path-assert endpoint tests; to activate these tests, set environment variable TEST_sparql=true");
  } else {
    describe("over a SPARQL endpoint", function () {
      this.timeout(60000);
      const {startSparqlTestServer} = require("../../neighborhood-sparql/test/sparql-test-server");
      const {ctor: sparqlDB, asAsyncDb} = require("@shexjs/neighborhood-sparql");

      it("reads through the endpoint, blank nodes included", async function () {
        const server = await startSparqlTestServer({});
        try {
          server.store.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"}).parse(PRE + `
            :x :e [ :start "2020-01-02"^^xsd:date ; :end "2020-01-01"^^xsd:date ] .
            :y :e [ :start "2020-01-01"^^xsd:date ; :end "2020-01-02"^^xsd:date ] .`));
          const schema = ShExParser.construct(base, {}, {index: true}).parse(PRE +
            "<S> { :e @<Ev> } <Ev> { :start . ; :end . } %assert:{ :end >= :start %}");
          const v = new ShExValidator(schema, asAsyncDb(sparqlDB(server.url)), {});
          Assert.register(v, {ShExTerm});
          const results = await v.validateShapeMapAsync([{node: base + "x", shape: base + "S"}, {node: base + "y", shape: base + "S"}]);
          expect(results.map(r => r.status)).to.deep.equal(["nonconformant", "conformant"]);
          expect(assertFailures(results[0])[0].explanation[0]).to.match(/^:end = "2020-01-01"/);
        } finally {
          await server.close();
        }
      });
    });
  }

  /* what the WebApp shows off: every entry has to say what it does */
  describe("the examples manifest", function () {
    const manifest = JsYaml.load(fs.readFileSync(path.join(__dirname, "../examples/manifest.yaml"), "utf8"));
    manifest.forEach(entry => {
      it(`should find "${entry.dataLabel}" ${entry.status} for "${entry.schemaLabel}"`, function () {
        expect(entry.plugins).to.deep.equal(["../doc/ShExPathAssertPlugin.js"]);
        const schemaFile = path.join(__dirname, "../examples", entry.schemaURL);
        const schema = ShExParser.construct("file://" + schemaFile, {}, {index: true})
              .parse(fs.readFileSync(schemaFile, "utf8"));
        const data = new N3.Store();
        data.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"}).parse(entry.data));
        const [, node, shape] = entry.queryMap.trim().match(/^<([^>]+)>@<([^>]+)>$/);
        const v = new ShExValidator(schema, RdfJsDb(data), {});
        Assert.register(v, {ShExTerm});
        const [result] = v.validateShapeMap([{node, shape}]);
        expect(result.status, JSON.stringify(result.appinfo)).to.equal(entry.status);
      });
    });
  });
});
