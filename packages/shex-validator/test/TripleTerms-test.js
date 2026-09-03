"use strict";
// RDF 1.2 triple terms (doc/triple-terms.md): the <<( … )>> value atom and
// the TRIPLE node kind, over data whose quoted triples arrive from N3's
// star formats.  Components are ordinary checks of the component term
// against asserted data; a triple term can itself be a shape's focus, so
// its reifiers are one ^rdf:reifies away.

const {expect} = require("chai");
const {ShExValidator} = require("..");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const ShExParser = require("@shexjs/parser");
const {Store, Parser: N3Parser} = require("n3");

const base = "http://a.example/";
const parse = text => ShExParser.construct(base, {
  ex: "http://ex.example/#",
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  foaf: "http://xmlns.com/foaf/0.1/"}).parse(text);
const star = trig => new Store(new N3Parser({baseIRI: base, format: "application/trig*"}).parse(trig));
const PREFIXES = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX ex: <http://ex.example/#>
`;
function result (schema, store, node, shape) {
  return new ShExValidator(schema, RdfJsDb(store))
    .validateShapeMap([{node: base + node, shape: base + shape}])[0];
}

describe("triple terms: the <<( … )>> value atom", function () {
  const schema = parse(`
<#Person> { foaf:name . }
<#Assertion> {
  rdf:reifies <<( @<#Person> foaf:knows @<#Person> )>> ;
  ex:assertedBy @<#Person>
}`);
  const good = star(PREFIXES + `
<tim> foaf:name "Tim" . <henry> foaf:name "Henry" . <alice> foaf:name "Alice" .
<a1> rdf:reifies << <tim> foaf:knows <henry> >> ; ex:assertedBy <alice> .`);

  it("should match a reified knowing, components checked against asserted data", function () {
    const res = result(schema, good, "a1", "#Assertion");
    expect(res.status).to.equal("conformant");
    // the term serializes into the results as a TripleTerm ld object
    expect(JSON.stringify(res.appinfo)).to.include('"TripleTerm"');
  });

  it("should fail when a component's term has no asserted description", function () {
    const bad = star(PREFIXES + `
<henry> foaf:name "Henry" . <alice> foaf:name "Alice" .
<a1> rdf:reifies << <ghost> foaf:knows <henry> >> ; ex:assertedBy <alice> .`);
    const res = result(schema, bad, "a1", "#Assertion");
    expect(res.status).to.equal("nonconformant");
    expect(JSON.stringify(res.appinfo)).to.include("TripleTermComponentFailure");
  });

  it("should fail on the wrong predicate, and pass a wildcard everything", function () {
    expect(result(parse("<#Met> { rdf:reifies <<( . foaf:met . )>> }"), good, "a1", "#Met").status)
      .to.equal("nonconformant");
    expect(result(parse("<#Any> { rdf:reifies <<( . . . )>> }"), good, "a1", "#Any").status)
      .to.equal("conformant");
  });

  it("should nest through the object position", function () {
    // a term about a term: rdf:reifies <<( _:a ex:assertedBy alice )>>
    const schema2 = parse(`
<#Meta> { rdf:reifies <<( . ex:assertedBy <<( . foaf:knows . )>> )>> }`);
    const meta = star(PREFIXES + `
<m1> rdf:reifies << <x> ex:assertedBy << <tim> foaf:knows <henry> >> >> .`);
    expect(result(schema2, meta, "m1", "#Meta").status).to.equal("conformant");
  });
});

describe("triple terms: the TRIPLE node kind", function () {
  it("should tell triple terms from everything older", function () {
    const anySchema = parse("<#Any> { rdf:reifies TRIPLE }");
    const tt = star(PREFIXES + "<a1> rdf:reifies << <s> <p> <o> >> .");
    expect(result(anySchema, tt, "a1", "#Any").status).to.equal("conformant");
    const iri = star(PREFIXES + "<a1> rdf:reifies <justAnIri> .");
    expect(result(anySchema, iri, "a1", "#Any").status).to.equal("nonconformant");
    // ...and the older kinds refuse triple terms: NONLITERAL has always
    // meant iri-or-bnode
    expect(result(parse("<#NL> { rdf:reifies NONLITERAL }"), tt, "a1", "#NL").status)
      .to.equal("nonconformant");
  });
});

describe("triple terms: the term as a shape's focus", function () {
  it("should reach the term's reifiers through ^rdf:reifies", function () {
    // the LPG edge-property case: the annotation lives on the reifier, and
    // the term's own (incoming) neighborhood finds it
    const schema = parse(`
<#Weighted> { ex:weight . }
<#Edge> { rdf:reifies ( <<( IRI foaf:knows IRI )>> AND { ^rdf:reifies @<#Weighted> } ) }`);
    const weighted = star(PREFIXES + `
<e1> rdf:reifies << <a> foaf:knows <b> >> ; ex:weight 0.9 .`);
    expect(result(schema, weighted, "e1", "#Edge").status).to.equal("conformant");
    const bare = star(PREFIXES + `
<e1> rdf:reifies << <a> foaf:knows <b> >> .`);
    // no weight on the reifier: the term's ^rdf:reifies neighborhood fails
    expect(result(schema, bare, "e1", "#Edge").status).to.equal("nonconformant");
  });
});

describe("triple terms: writing and re-reading", function () {
  it("should round-trip the atom and the kind through the writer", function (done) {
    const schema = parse(`
<#A> { rdf:reifies <<( @<#P> foaf:knows . )>> ; ex:tag TRIPLE ? }
<#P> { foaf:name . }`);
    new (require("@shexjs/writer"))({base})
      .writeSchema(schema, (error, text) => {
        if (error) return done(error);
        expect(text).to.include("<<( ");
        expect(text).to.include(")>>");
        expect(text).to.include("TRIPLE");
        const again = parse("PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n"
                            + "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n"
                            + "PREFIX ex: <http://ex.example/#>\n" + text);
        expect(JSON.stringify(again.shapes)).to.include("TripleTermConstraint");
        done();
      });
  });
});
