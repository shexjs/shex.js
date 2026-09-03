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
    const {validateEntry} = require("../../../tools/manifest-runner");
    for (const entry of json.filter(e => !e.neighborhood || e.neighborhood === "rdfjs")) {
      const where = entry.schemaLabel + " / " + entry.dataLabel;
      const {verdict, surprises} = validateEntry(entry, examples);
      expect(verdict, where + ": " + JSON.stringify(surprises[0] || {}).substring(0, 200))
        .to.equal(entry.status);
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
    // downloaded copy so it needs no network at all.
    //
    // It is resolved against the *manifest*, like schemaURL and dataURL
    // beside it -- not against the page, which is what it used to be.  The
    // difference is invisible from shex-webapp, whose doc/ and examples/ are
    // siblings, and fatal from extension-map, which reads this same manifest
    // from a doc/ of its own: "../examples/..." found the file for one app
    // and 404'd for the other.
    const entry = json.find(e => e.dataLabel === "Q42 from a downloaded page");
    expect(entry.sitematrix, "the example that shows what sitematrix is for").to.be.a("string");
    expect(entry.sitematrix, "relative to the manifest, so it survives being read from elsewhere")
      .to.not.match(/^\.\./);
    expect(Fs.existsSync(Path.join(__dirname, "../examples", entry.sitematrix)),
           entry.sitematrix).to.equal(true);
  });

  it("should name only data sources this app loads", () => {
    const {moduleId} = require("@shexjs/neighborhood-api");
    const known = [
      require("@shexjs/neighborhood-rdfjs"),
      require("@shexjs/neighborhood-sparql"),
      require("@shexjs/neighborhood-wikibase"),
    ].map(moduleId);
    for (const entry of json)
      if ("neighborhood" in entry)
        expect(known, entry.dataLabel).to.include(entry.neighborhood);
  });

  it("should configure each source with settings that source declares", () => {
    const modules = {
      sparql: require("@shexjs/neighborhood-sparql"),
      wikibase: require("@shexjs/neighborhood-wikibase"),
      rdfjs: require("@shexjs/neighborhood-rdfjs"),
    };
    // keys every entry may carry, whichever source it names.  `dataBase` is
    // one of them: what the data is written against is the app's business,
    // not the source's -- a query service's answers and a Wikibase's pages
    // arrive without a URL of their own to be written against.
    const generic = new Set(["schemaLabel", "schema", "schemaURL", "dataLabel", "data",
                             "dataURL", "queryMap", "queryMapURL", "status", "comment",
                             "neighborhood", "dataBase", "name", "regexpEngine"]);
    for (const entry of json) {
      const module = modules[entry.neighborhood || "rdfjs"];
      const declared = new Set((module.dbParams || []).map(p => p.name));
      for (const key of Object.keys(entry))
        if (!generic.has(key))
          expect(declared.has(key), `${entry.dataLabel}: ${key}`).to.equal(true);
    }
  });
});
