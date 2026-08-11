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

  it("should name only files it ships", () => {
    const named = json.flatMap(entry => ["schemaURL", "dataURL"]
                               .flatMap(key => [].concat(entry[key] || [])));
    for (const file of named)
      expect(Fs.existsSync(Path.join(examples, file)), file).to.equal(true);
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
                             "neighborhood", "name"]);
    for (const entry of json) {
      const module = modules[entry.neighborhood || "rdfjs"];
      const declared = new Set((module.dbParams || []).map(p => p.name));
      for (const key of Object.keys(entry))
        if (!generic.has(key))
          expect(declared.has(key), `${entry.dataLabel}: ${key}`).to.equal(true);
    }
  });
});
