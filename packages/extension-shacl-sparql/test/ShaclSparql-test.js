/** The SPARQL extension end to end: SHACL-SPARQL queries as semantic actions.
 *
 * The queries here are written the way SHACL-SPARQL writes them -- SELECT
 * for a constraint (each row a violation), ASK for a validator (true
 * passes), $this and $value pre-bound -- and what is checked is that ShEx
 * gives them ShEx's meaning: an action on a triple constraint takes part in
 * deciding which triple goes where, a recursive shape runs the check at
 * every level, and the start actions see the whole dataset.
 */
"use strict";

const expect = require("chai").expect;
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const ShExTerm = require("@shexjs/term");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ordered} = require("@shexjs/neighborhood-api");
const {ShExValidator} = require("@shexjs/validator");
const {QueryEngine} = require("@comunica/query-sparql-rdfjs");
const SparqlExtension = require("..");
const JsYaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

const base = "http://a.example/";
const PRE = `PREFIX : <${base}>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX shacl-sparql: <http://shex.io/extensions/SHACL-SPARQL/>
`;

function store (turtle, graph) {
  const s = new N3.Store();
  for (const q of new N3.Parser({baseIRI: base, format: "application/trig"}).parse(PRE + turtle))
    s.addQuad(q);
  return s;
}

function validator (schemaText, db) {
  const schema = ShExParser.construct(base, {}, {index: true}).parse(PRE + schemaText);
  const v = new ShExValidator(schema, db, {});
  SparqlExtension.register(v, {ShExTerm});
  return v;
}

async function validate (schemaText, data, node = base + "n", shape = base + "S") {
  const v = validator(schemaText, ordered(RdfJsDb(store(data))));
  const [result] = await v.validateShapeMapAsync([{node, shape}]);
  return result;
}

/** an endpoint over a store: what it was sent, and Comunica's answer */
function endpointDb (s) {
  const sent = [];
  const engine = new QueryEngine();
  const db = Object.create(RdfJsDb(s), {querySource: {value: () => ({
    kind: "endpoint", endpoint: "http://endpoint.example/sparql",
    query: async text => {
      sent.push(text);
      const result = await engine.query(text, {sources: [s]});
      if (result.resultType === "boolean")
        return {boolean: await result.execute()};
      const vars = (await result.metadata()).variables.map(v => v.variable !== undefined ? v.variable.value : v.value);
      const rows = (await (await result.execute()).toArray()).map(b => vars.map(v => b.get(v) || null));
      return {vars, rows};
    },
  })}});
  return {db, sent};
}

const EVENT = `
<S> {
  :start xsd:date ;
  :end xsd:date ;
  :subEvent @<S> *
} %shacl-sparql:{
  SELECT $this ?start ?end ("ends before it starts" AS ?message)
  WHERE { $this :start ?start ; :end ?end . FILTER (?end < ?start) }
%}`;

describe("extension-shacl-sparql", function () {
  this.timeout(10000);           // Comunica's first query builds its engine

  describe("a SELECT on a shape", function () {
    it("should pass where it finds nothing", async function () {
      const r = await validate(EVENT, `:n :start "2020-01-01"^^xsd:date ; :end "2020-01-02"^^xsd:date .`);
      expect(r.status).to.equal("conformant");
    });

    it("should fail on each row it finds, with the row's ?message", async function () {
      const r = await validate(EVENT, `:n :start "2020-01-02"^^xsd:date ; :end "2020-01-01"^^xsd:date .`);
      expect(r.status).to.equal("nonconformant");
      const said = JSON.stringify(r.appinfo);
      expect(said).to.include("ends before it starts");
      expect(said, "and the row, for the reader").to.include("2020-01-01");
    });

    it("should run at every level of a recursive shape", async function () {
      const r = await validate(EVENT, `
        :n :start "2020-01-01"^^xsd:date ; :end "2020-12-31"^^xsd:date ; :subEvent :m .
        :m :start "2020-06-02"^^xsd:date ; :end "2020-06-01"^^xsd:date .`);
      expect(r.status).to.equal("nonconformant");
      expect(JSON.stringify(r.appinfo)).to.include("ends before it starts");
    });

    it("should pre-bind a blank node", async function () {
      const v = validator(EVENT, RdfJsDb(store(`:x :e [ :start "2020-01-02"^^xsd:date ; :end "2020-01-01"^^xsd:date ] .`)));
      const bnode = v.db.getQuads(null, N3.DataFactory.namedNode(base + "e"), null)[0].object;
      const [r] = await v.validateShapeMapAsync([{node: "_:" + bnode.value, shape: base + "S"}]);
      expect(r.status).to.equal("nonconformant");
    });
  });

  describe("on a triple constraint", function () {
    const ISBN = `<S> { :isbn xsd:string %shacl-sparql:{
      SELECT ?other WHERE { ?other :isbn $value FILTER (?other != $this) }
    %} }`;

    it("should bind $value to the triple's object", async function () {
      expect((await validate(ISBN, `:n :isbn "1" . :m :isbn "2" .`)).status).to.equal("conformant");
      expect((await validate(ISBN, `:n :isbn "1" . :m :isbn "1" .`)).status).to.equal("nonconformant");
    });

    it("should decide which triple a constraint gets", async function () {
      // two labels, one per language: which label is which is the action's to say
      const LABELS = `<S> {
        :label . %shacl-sparql:{ ASK { FILTER (lang($value) = "de") } %} ;
        :label . %shacl-sparql:{ ASK { FILTER (lang($value) = "en") } %}
      }`;
      expect((await validate(LABELS, `:n :label "Hund"@de, "dog"@en .`)).status).to.equal("conformant");
      expect((await validate(LABELS, `:n :label "Hund"@de, "Katze"@de .`)).status).to.equal("nonconformant");
    });

    it("should leave a CLOSED shape to reject what the actions refused", async function () {
      const CLOSED = `<S> CLOSED { :label . + %shacl-sparql:{ ASK { FILTER (lang($value) = "en") } %} }`;
      expect((await validate(CLOSED, `:n :label "dog"@en .`)).status).to.equal("conformant");
      expect((await validate(CLOSED, `:n :label "dog"@en, "Hund"@de .`)).status).to.equal("nonconformant");
    });

    it("should bind $this to the focus of an inverse constraint", async function () {
      const INVERSE = `<S> { ^:child . %shacl-sparql:{ ASK { $value :name ?n . $this :name ?m } %} }`;
      expect((await validate(INVERSE, `:p :child :n ; :name "P" . :n :name "N" .`)).status).to.equal("conformant");
      expect((await validate(INVERSE, `:p :child :n . :n :name "N" .`)).status).to.equal("nonconformant");
    });
  });

  it("should bind $this to the value on a node constraint", async function () {
    // (written after a triple constraint's value, an action is the constraint's)
    const POSITIVE = `<S> { :v @<Positive> } <Positive> xsd:integer %shacl-sparql:{ ASK { FILTER ($this > 0) } %}`;
    expect((await validate(POSITIVE, `:n :v 5 .`)).status).to.equal("conformant");
    expect((await validate(POSITIVE, `:n :v -5 .`)).status).to.equal("nonconformant");
  });

  it("should bind $this to a group's focus", async function () {
    const GROUP = `<S> { (:a . ; :b .) %shacl-sparql:{ ASK { $this :a ?a ; :b ?b FILTER (?a < ?b) } %} }`;
    expect((await validate(GROUP, `:n :a 1 ; :b 2 .`)).status).to.equal("conformant");
    expect((await validate(GROUP, `:n :a 2 ; :b 1 .`)).status).to.equal("nonconformant");
  });

  describe("in the start actions", function () {
    const NO_ORPHANS = `%shacl-sparql:{ ASK { FILTER NOT EXISTS { ?x :parent ?p FILTER NOT EXISTS { ?p a :Person } } } %}
      <S> { }`;

    it("should check the whole dataset, named graphs too", async function () {
      expect((await validate(NO_ORPHANS, `:n :parent :p . :p a :Person .`)).status).to.equal("conformant");
      expect((await validate(NO_ORPHANS, `:n :parent :p . :g { :x :parent :q }`)).status).to.equal("nonconformant");
    });
  });

  describe("at an endpoint", function () {
    it("should write the pre-bound terms into the query", async function () {
      const {db, sent} = endpointDb(store(`:n :start "2020-01-02"^^xsd:date ; :end "2020-01-01"^^xsd:date .`));
      const [r] = await validator(EVENT, db).validateShapeMapAsync([{node: base + "n", shape: base + "S"}]);
      expect(r.status).to.equal("nonconformant");
      expect(JSON.stringify(r.appinfo)).to.include("ends before it starts");
      expect(sent.length).to.equal(1);
      expect(sent[0]).to.include(`(<${base}n> AS ?this)`);
      expect(sent[0]).to.match(/<http:\/\/a\.example\/n> <http:\/\/a\.example\/start>|<http:\/\/a\.example\/n> :start/);
    });

    it("should refuse to ask about a blank node", async function () {
      const {db} = endpointDb(store(`:x :e [ :start "2020-01-02"^^xsd:date ; :end "2020-01-01"^^xsd:date ] .`));
      const v = validator(EVENT, db);
      const bnode = v.db.getQuads(null, N3.DataFactory.namedNode(base + "e"), null)[0].object;
      let thrown = null;
      try {
        await v.validateShapeMapAsync([{node: "_:" + bnode.value, shape: base + "S"}]);
      } catch (e) {
        thrown = e;
      }
      expect(thrown && thrown.message).to.match(/blank node/);
    });

    it("should ask each question once", async function () {
      // three objects, so three questions, however often the matcher asks them
      const {db, sent} = endpointDb(store(`:n :v 1, 2, 1.0 .`));
      const v = validator(`<S> { :v . * %shacl-sparql:{ ASK { FILTER ($value > 0) } %} }`, db);
      const [r] = await v.validateShapeMapAsync([{node: base + "n", shape: base + "S"}]);
      expect(r.status).to.equal("conformant");
      expect(sent.length).to.equal(3);
      expect(new Set(sent).size).to.equal(3);
    });
  });

  /* what the WebApp shows off: every entry has to say what it does */
  describe("the examples manifest", function () {
    const manifest = JsYaml.load(fs.readFileSync(path.join(__dirname, "../examples/manifest.yaml"), "utf8"));
    manifest.forEach(entry => {
      it(`should find "${entry.dataLabel}" ${entry.status} for "${entry.schemaLabel}"`, async function () {
        expect(entry.plugins).to.deep.equal(["../doc/ShExShaclSparqlPlugin.js"]);
        // parsed where the app parses it, beside the manifest, so a relative
        // IRI in an entry means here what it means there
        const schemaFile = path.join(__dirname, "../examples", entry.schemaURL);
        const schema = ShExParser.construct("file://" + schemaFile, {}, {index: true})
              .parse(fs.readFileSync(schemaFile, "utf8"));
        const data = new N3.Store();
        data.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"}).parse(entry.data));
        const [, node, shape] = entry.queryMap.trim().match(/^<([^>]+)>@<([^>]+)>$/);
        const v = new ShExValidator(schema, RdfJsDb(data), {});
        SparqlExtension.register(v, {ShExTerm});
        const [result] = await v.validateShapeMapAsync([{node, shape}]);
        expect(result.status, JSON.stringify(result.appinfo)).to.equal(entry.status);
      });
    });
  });

  describe("invocation errors", function () {
    it("should say to validate asynchronously", function () {
      const v = validator(EVENT, RdfJsDb(store(`:n :start "2020-01-01"^^xsd:date ; :end "2020-01-02"^^xsd:date .`)));
      expect(() => v.validateShapeMap([{node: base + "n", shape: base + "S"}])).to.throw(/validateShapeMapAsync/);
    });

    it("should report a query that doesn't parse", async function () {
      const v = validator(`<S> { } %shacl-sparql:{ SELEKT * WHERE {} %}`, RdfJsDb(store(`:n :p 1 .`)));
      let thrown = null;
      try { await v.validateShapeMapAsync([{node: base + "n", shape: base + "S"}]); } catch (e) { thrown = e; }
      expect(thrown && thrown.message).to.match(/didn't parse as SPARQL/);
    });

    it("should refuse a CONSTRUCT", async function () {
      const v = validator(`<S> { } %shacl-sparql:{ CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o } %}`, RdfJsDb(store(`:n :p 1 .`)));
      let thrown = null;
      try { await v.validateShapeMapAsync([{node: base + "n", shape: base + "S"}]); } catch (e) { thrown = e; }
      expect(thrown && thrown.message).to.match(/SELECT or an ASK/);
    });
  });
});
