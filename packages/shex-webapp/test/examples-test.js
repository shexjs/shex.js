/** The examples manifest is offered in two syntaxes, and a reader who picks
 * one shouldn't get fewer examples than a reader who picks the other.  This
 * checks that they say the same thing, and that what they name is there.
 */
"use strict";

const Fs = require("fs");
const Path = require("path");
const expect = require("chai").expect;
const JsYaml = require("js-yaml");

const examples = Path.join(__dirname, "../examples");
const read = f => Fs.readFileSync(Path.join(examples, f), "utf8");

describe("the examples manifest", () => {
  const json = JSON.parse(read("manifest.json"));
  const yaml = JsYaml.load(read("manifest.yaml"));

  it("should say the same thing in JSON and in YAML", () => {
    expect(yaml.map(e => e.dataLabel)).to.deep.equal(json.map(e => e.dataLabel));
    expect(yaml).to.deep.equal(json);
  });

  /* An example that doesn't do what it says it does teaches the wrong
   * thing, so run the ones that can be run here: a local store, no network,
   * validated exactly as the app would.  Sources that fetch (a query
   * service, a Wikibase) are left to the app's own tests. */
  it("should have every local example conform, or not, as it says it does", async function () {
    this.timeout(30000);
    const N3 = require("n3");
    const ShExParser = require("@shexjs/parser");
    const {ShExValidator} = require("@shexjs/validator");
    const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
    const ShapeMap = require("shape-map");
    ShapeMap.Start = ShExValidator.Start;
    const base = "http://a.example/";

    for (const entry of json.filter(e => !e.neighborhood || e.neighborhood === "rdfjs")) {
      const where = entry.schemaLabel + " / " + entry.dataLabel;
      const schema = ShExParser.construct(base, null, {index: true})
            .parse(entry.schemaURL ? read(entry.schemaURL) : entry.schema);
      // several documents are one graph, each parsed on its own
      const texts = [].concat(entry.dataURL ? [].concat(entry.dataURL).map(read)
                              : (entry.data === undefined ? [] : [].concat(entry.data)));
      const store = new N3.Store();
      const dataPrefixes = {};
      texts.forEach(text => {
        const parser = new N3.Parser({baseIRI: base, format: "text/turtle", blankNodePrefix: ""});
        store.addQuads(parser.parse(text));
        Object.assign(dataPrefixes, parser._prefixes);   // a query map is written in them
      });
      const validator = new ShExValidator(schema, RdfJsDb(store), {});
      // shape labels resolve against the schema's base, node names against
      // the data's -- the two need not be the same document
      const queryMap = ShapeMap.Parser.construct(
        base, {base: schema._base || base, prefixes: schema._prefixes || {}},
        {base, prefixes: dataPrefixes}).parse(entry.queryMap);

      // a query map asks the data who to validate; only the one form the
      // examples use is answered here, and anything else says so rather
      // than quietly passing
      const fixed = queryMap.flatMap(pair => {
        if (typeof pair.node === "string")
          return [pair];
        const pattern = pair.node;
        expect(pattern.type, where + ": unsupported query map").to.equal("TriplePattern");
        expect(pattern.subject && pattern.subject.term, where).to.equal("FOCUS");
        expect(pattern.object, where + ": only a wildcard object").to.equal(null);
        return store.getQuads(null, pattern.predicate, null).map(
          q => Object.assign({}, pair, {node: q.subject.value}));
      });
      expect(fixed.length, where + ": nothing to validate").to.be.above(0);

      // `node@!shape` says this pair is expected *not* to conform
      const results = [].concat(validator.validateShapeMap(
        fixed.map(pair => ({node: pair.node, shape: pair.shape}))));
      const surprises = results.filter((result, i) => {
        const wanted = fixed[i].status === "nonconformant" ? "nonconformant" : "conformant";
        return result.status !== wanted;
      });
      expect(surprises.length > 0,
             where + ": " + JSON.stringify(surprises[0] || {}).substring(0, 200))
        .to.equal(entry.status === "nonconformant");
    }
  });

  it("should name only files it ships", () => {
    const named = json.flatMap(entry => ["schemaURL", "dataURL"]
                               .flatMap(key => [].concat(entry[key] || [])));
    for (const file of named)
      expect(Fs.existsSync(Path.join(examples, file)), file).to.equal(true);
  });

  it("should ship the site table its offline example names", () => {
    // a Wikibase page's sitelinks name wikis like "enwiki", and only the
    // site table says which URL and language that is; this entry names a
    // downloaded copy so it needs no network at all.  The value is resolved
    // by the browser against the page that loads it, i.e. doc/.
    const entry = json.find(e => e.dataLabel === "Q42 from a downloaded page");
    expect(entry.sitematrix, "the example that shows what sitematrix is for").to.be.a("string");
    expect(Fs.existsSync(Path.join(__dirname, "../doc", entry.sitematrix)),
           entry.sitematrix).to.equal(true);
  });

  it("should name only data sources this app loads", () => {
    const {moduleId} = require("@shexjs/neighborhood-api");
    const known = [
      require("@shexjs/neighborhood-rdfjs"),
      require("@shexjs/neighborhood-sparql"),
      require("@shexjs/neighborhood-wikidata"),
    ].map(moduleId);
    for (const entry of json)
      if ("neighborhood" in entry)
        expect(known, entry.dataLabel).to.include(entry.neighborhood);
  });

  it("should configure each source with settings that source declares", () => {
    const modules = {
      sparql: require("@shexjs/neighborhood-sparql"),
      wikidata: require("@shexjs/neighborhood-wikidata"),
      rdfjs: require("@shexjs/neighborhood-rdfjs"),
    };
    // keys every entry may carry, whichever source it names
    const generic = new Set(["schemaLabel", "schema", "schemaURL", "dataLabel", "data",
                             "dataURL", "queryMap", "queryMapURL", "status", "comment",
                             "neighborhood", "name", "regexpEngine"]);
    for (const entry of json) {
      const module = modules[entry.neighborhood || "rdfjs"];
      const declared = new Set((module.dbParams || []).map(p => p.name));
      for (const key of Object.keys(entry))
        if (!generic.has(key))
          expect(declared.has(key), `${entry.dataLabel}: ${key}`).to.equal(true);
    }
  });
});
