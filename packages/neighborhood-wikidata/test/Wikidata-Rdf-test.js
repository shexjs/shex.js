"use strict";
/**
 * Differential test of the JSON -> RDF converter: every fixture entity's
 * JSON page must synthesize exactly the quads its `?flavor=dump` Turtle
 * states -- same IRIs, same literals, same value-node hashes, same blank
 * node labels.  Each fixture pair was captured at one revision
 * (schema:version in the .ttl equals lastrevid in the .json).
 *
 * The one tolerated difference is the normalized-value triples (wdtn:,
 * psn:, pqn:, prn:, wikibase:quantityNormalized): WDQS derives those from
 * the property registry's formatter IRIs and from unit-conversion tables,
 * neither of which is on the entity's own page.  They are filtered from
 * the expected side and asserted absent from the synthesized side.
 *
 * Fixtures exercise: qualifiers, references, every complex value kind
 * (time/quantity/globe), somevalue blank nodes, rank/BestRank, Julian
 * dates (Q692), 132-sitelink language mapping (Q42), property pages with
 * ontology blocks -- item-valued (P31, which also carries a truthy
 * novalue) and external-id (P214, with normalized-predicate declarations).
 */

const fs = require("fs");
const path = require("path");
const chai = require("chai");
const assert = chai.assert;
const expect = chai.expect;
const N3 = require("n3");

const {
  wikibaseRdfConverter, phpFloatStr, phpUrlencode, wfUrlencode,
  valueNodeHash, cleanTimeValue,
} = require("../lib/wikibase-rdf");
const {siteInfoFromSitematrix, bcp47} = require("../lib/neighborhood-wikidata");

const fixtures = path.join(__dirname, "fixtures");
const read = f => fs.readFileSync(path.join(fixtures, f), "utf8");

const XSD_STRING = "http://www.w3.org/2001/XMLSchema#string";
const NORMALIZED_NS = [
  "http://www.wikidata.org/prop/direct-normalized/",
  "http://www.wikidata.org/prop/statement/value-normalized/",
  "http://www.wikidata.org/prop/qualifier/value-normalized/",
  "http://www.wikidata.org/prop/reference/value-normalized/",
];
const QUANTITY_NORMALIZED = "http://wikiba.se/ontology#quantityNormalized";

const isNormalizedData = q =>
      NORMALIZED_NS.some(ns => q.predicate.value.startsWith(ns)) ||
      q.predicate.value === QUANTITY_NORMALIZED;

function termStr (t) {
  switch (t.termType) {
  case "NamedNode": return `<${t.value}>`;
  case "BlankNode": return `_:${t.value}`;
  default: {
    const lex = `"${t.value.replace(/[\\"]/g, c => "\\" + c).replace(/\n/g, "\\n")}"`;
    return t.language ? `${lex}@${t.language}`
      : t.datatype && t.datatype.value !== XSD_STRING ? `${lex}^^<${t.datatype.value}>`
      : lex;
  }
  }
}
const quadStr = q => `${termStr(q.subject)} ${termStr(q.predicate)} ${termStr(q.object)} .`;

describe("wikibase-rdf", () => {
  const siteInfo = siteInfoFromSitematrix(JSON.parse(read("sitematrix.json")));
  const converter = wikibaseRdfConverter(N3.DataFactory, {siteInfo});

  ["Q42", "Q692", "Q5", "P31", "P214"].forEach(id => {
    it(`should synthesize ${id}'s dump RDF from its JSON page`, () => {
      const doc = JSON.parse(read(`${id}.json`));
      const got = converter.entityToQuads(doc);
      // this DB never invents normalization it can't derive
      assert.deepEqual(got.filter(isNormalizedData), []);
      const gotSet = new Set(got.map(quadStr));

      const expected = new N3.Parser({format: "text/turtle", blankNodePrefix: ""})
            .parse(read(`${id}.ttl`))
            .filter(q => !isNormalizedData(q));
      const expectedSet = new Set(expected.map(quadStr));

      const missing = [...expectedSet].filter(s => !gotSet.has(s));
      const extra = [...gotSet].filter(s => !expectedSet.has(s));
      assert.deepEqual(missing.slice(0, 5), [], `${missing.length} quad(s) missing from ${id}`);
      assert.deepEqual(extra.slice(0, 5), [], `${extra.length} extra quad(s) in ${id}`);
      assert.equal(gotSet.size, expectedSet.size);
    });
  });

  /* This package runs in a browser as well as in node, and a browser has
   * no Buffer.  PHP's serialization counts *bytes*, so reaching for
   * Buffer.byteLength was both a crash there and a hash waiting to go
   * wrong; converting with Buffer taken away is the guard. */
  it("should synthesize with none of node's globals, as a browser must", () => {
    const hadBuffer = global.Buffer;
    for (const id of Object.keys(require.cache))
      if (/neighborhood-wikidata[\\/]lib[\\/]/.test(id))
        delete require.cache[id];
    delete global.Buffer;
    try {
      const {wikibaseRdfConverter: fresh} = require("../lib/wikibase-rdf");
      const quads = fresh(N3.DataFactory, {siteInfo}).entityToQuads(JSON.parse(read("Q42.json")));
      // the value node names are what byte lengths decide
      assert.isTrue(quads.some(q => q.object.value ===
                                "http://www.wikidata.org/value/426df9023763f08b066f4478480f44cd"),
                    "Q42's birth date value node, named by a PHP serialization's length");
    } finally {
      global.Buffer = hadBuffer;
    }
  });

  it("should count UTF-8 bytes the way PHP does", () => {
    const {utf8Length} = require("../lib/wikibase-rdf");
    for (const text of ["", "abc", "é", "日本語", "😀", "a😀b", "\ud800", "\ud800x", "دوغلاس آدمز"])
      assert.equal(utf8Length(text), Buffer.byteLength(text, "utf8"), JSON.stringify(text));
  });

  it("should reject entity types it would misrepresent", () => {
    expect(() => converter.entityToQuads({entities: {L42: {id: "L42", type: "lexeme"}}}))
      .to.throw(/lexeme/);
  });

  it("should record a redirect as owl:sameAs", () => {
    const doc = JSON.parse(read("Q42.json"));
    const quads = converter.entityToQuads(doc, "Q123456789");
    const sameAs = quads.filter(q => q.predicate.value === "http://www.w3.org/2002/07/owl#sameAs");
    assert.equal(sameAs.length, 1);
    assert.equal(sameAs[0].subject.value, "http://www.wikidata.org/entity/Q123456789");
    assert.equal(sameAs[0].object.value, "http://www.wikidata.org/entity/Q42");
  });

  describe("PHP compatibility", () => {
    it("should render floats the way PHP casts them", () => {
      assert.equal(phpFloatStr(51.566527777778), "51.566527777778");
      assert.equal(phpFloatStr(-0.14544444444444), "-0.14544444444444");
      assert.equal(phpFloatStr(2.7777777777778e-5), "2.7777777777778E-5");
      assert.equal(phpFloatStr(51), "51");
      assert.equal(phpFloatStr(1e20), "1.0E+20");
      assert.equal(phpFloatStr(0.0001), "0.0001");
      assert.equal(phpFloatStr(1e-5), "1.0E-5");
      assert.equal(phpFloatStr(0), "0");
    });

    it("should urlencode titles the way MediaWiki does", () => {
      assert.equal(wfUrlencode("Douglas_Adams"), "Douglas_Adams");
      assert.equal(wfUrlencode("Vilyam_Şekspir"), "Vilyam_%C5%9Eekspir");
      assert.equal(wfUrlencode("a:b/c,d!e"), "a:b/c,d!e");
      assert.equal(phpUrlencode("Douglas Adams' gravestone.jpg"),
                   "Douglas%20Adams%27%20gravestone.jpg");
    });

    it("should reproduce wdv: hashes for each value kind", () => {
      // observed in Q42.ttl at the fixture revision
      assert.equal(valueNodeHash({type: "time", value: {
        time: "+1952-03-11T00:00:00Z", timezone: 0, before: 0, after: 0,
        precision: 11, calendarmodel: "http://www.wikidata.org/entity/Q1985727",
      }}), "426df9023763f08b066f4478480f44cd");
      assert.equal(valueNodeHash({type: "quantity", value: {amount: "+19460", unit: "1"}}),
                   "4e3244ccc4d14053f6649e98562f6f0a");
      assert.equal(valueNodeHash({type: "globecoordinate", value: {
        latitude: 51.566527777778, longitude: -0.14544444444444,
        altitude: null, precision: 2.7777777777778e-5,
        globe: "http://www.wikidata.org/entity/Q2",
      }}), "12b3879e659a02b6b54b45eb5d03fe47");
    });
  });

  describe("time cleaning", () => {
    const GREG = "http://www.wikidata.org/entity/Q1985727";
    const JUL = "http://www.wikidata.org/entity/Q1985786";

    it("should convert day-precision Julian dates to proleptic Gregorian", () => {
      assert.equal(cleanTimeValue({time: "+1616-04-23T00:00:00Z", precision: 11, calendarmodel: JUL}),
                   "1616-05-03T00:00:00Z");
    });

    it("should leave coarse Julian dates alone but zero-fill them", () => {
      assert.equal(cleanTimeValue({time: "+1564-04-00T00:00:00Z", precision: 10, calendarmodel: JUL}),
                   "1564-04-01T00:00:00Z");
      assert.equal(cleanTimeValue({time: "+1564-00-00T00:00:00Z", precision: 9, calendarmodel: JUL}),
                   "1564-01-01T00:00:00Z");
    });

    it("should bump BCE years for XSD 1.1", () => {
      assert.equal(cleanTimeValue({time: "-0043-03-15T00:00:00Z", precision: 11, calendarmodel: GREG}),
                   "-0042-03-15T00:00:00Z");
      assert.equal(cleanTimeValue({time: "-0001-01-01T00:00:00Z", precision: 11, calendarmodel: GREG}),
                   "0000-01-01T00:00:00Z");
    });

    it("should clamp days that overflow their month", () => {
      assert.equal(cleanTimeValue({time: "+2001-02-31T00:00:00Z", precision: 11, calendarmodel: GREG}),
                   "2001-02-28T00:00:00Z");
      assert.equal(cleanTimeValue({time: "+2000-02-31T00:00:00Z", precision: 11, calendarmodel: GREG}),
                   "2000-02-29T00:00:00Z");
    });

    it("should refuse day-precision dates in unknown calendars", () => {
      assert.isNull(cleanTimeValue({time: "+2000-01-01T00:00:00Z", precision: 11,
                                    calendarmodel: "http://www.wikidata.org/entity/Q11184"}));
    });
  });

  describe("site languages", () => {
    it("should canonicalize the codes MediaWiki spells differently", () => {
      assert.equal(bcp47("simple"), "en-simple");
      assert.equal(bcp47("nds-nl"), "nds-NL");
      assert.equal(bcp47("crh-latn"), "crh-Latn");
      assert.equal(bcp47("nrm"), "fr-x-nrm");
      assert.equal(bcp47("mo"), "ro-Cyrl-x-mo");
      assert.equal(bcp47("en"), "en");
    });

    it("should resolve sites the dump names differently from the sitematrix", () => {
      assert.deepEqual(siteInfo("nowiki"),
                       {url: "https://no.wikipedia.org", language: "nb", group: "wikipedia"});
      assert.deepEqual(siteInfo("be_x_oldwiki"),
                       {url: "https://be-tarask.wikipedia.org", language: "be-tarask", group: "wikipedia"});
      assert.deepEqual(siteInfo("commonswiki"),
                       {url: "https://commons.wikimedia.org", language: "en", group: "commons"});
      assert.isUndefined(siteInfo("nosuchwiki"));
    });
  });
});

/* A Turtle parser hands back a side table saying where each triple was
 * uttered, which is what post-validation highlighting anchors to.  An
 * entity page is JSON, and the RDF it becomes has the same need, so the
 * converter reports the same thing about the same quads. */
describe("where a quad was uttered", () => {
  const {locateJson} = require("../lib/json-locations");
  const text = read("Q42.json");
  const locations = locateJson(text);
  const siteInfo = siteInfoFromSitematrix(JSON.parse(read("sitematrix.json")));
  const converter = wikibaseRdfConverter(N3.DataFactory, {siteInfo, locations});
  const quads = converter.entityToQuads(locations.value);
  // a position is a list of spans (a Turtle utterance's shape), and these
  // are all written in one piece
  const said = spans => text.substring(spans[0].start, spans[0].end);
  const utterance = predicate => {
    const quad = quads.find(q => q.predicate.value === predicate);
    assert.isDefined(quad, predicate);
    const [utt] = converter.provenance.get(quad);
    assert.isDefined(utt, "an utterance for " + predicate);
    return utt;
  };

  it("should locate the same value JSON.parse would have read", () => {
    assert.deepEqual(locations.value, JSON.parse(text));
  });

  it("should point a truthy arc at the claim it abbreviates", () => {
    const utt = utterance("http://www.wikidata.org/prop/direct/P569");
    // the property is named by the member that groups the claims
    assert.equal(said(utt.predicate), '"P569"');
    // and the object is the member the date is written as
    assert.equal(said(utt.object), '"+1952-03-11T00:00:00Z"');
  });

  it("should give a statement the range of its whole object, as Turtle gives a bnode its []", () => {
    const utt = utterance("http://www.wikidata.org/prop/P569");
    const claim = said(utt.object);
    assert.equal(claim[0], "{", "starts at the brace");
    assert.equal(claim[claim.length - 1], "}", "and ends at its match");
    assert.equal(JSON.parse(claim).mainsnak.property, "P569");
  });

  it("should say an entity by its id, not by the whole page", () => {
    const utt = utterance("http://www.wikidata.org/prop/direct/P31");
    assert.equal(JSON.parse(said(utt.subject)), "Q42");
  });

  it("should point a value node's arcs at the members that state them", () => {
    const utt = utterance("http://wikiba.se/ontology#timePrecision");
    assert.equal(said(utt.predicate), '"precision"');
    assert.equal(said(utt.object), "11");
  });

  it("should point a label at its language and its text", () => {
    const utt = utterance("http://www.w3.org/2000/01/rdf-schema#label");
    assert.match(said(utt.predicate), /^"[a-z-]+"$/);
    assert.equal(said(utt.object)[0], '"');
  });

  it("should say where every quad it made came from", () => {
    const unlocated = quads.filter(q => converter.provenance.get(q).length === 0);
    assert.deepEqual(unlocated.slice(0, 3).map(q => q.predicate.value), []);
  });

  it("should report nothing when it was not given the page's text", () => {
    const plain = wikibaseRdfConverter(N3.DataFactory, {siteInfo});
    const quad = plain.entityToQuads(JSON.parse(text))[0];
    assert.deepEqual(plain.provenance.get(quad), []);
    assert.equal(plain.provenance.size, 0);
  });
});
