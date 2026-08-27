/** The manifest, run: every example does what its entry says it does.
 *
 * An example that doesn't teaches the wrong thing, and the entries here are
 * the ones a reader opens in the app -- schema, data, the overlay hung on
 * the schema, and the query map that says who to validate.  The actions run
 * as the matcher matches (registerEager), which is what the app does and is
 * the only way an action's refusal can show up in the status the entry
 * claims.
 */
"use strict";

const {expect} = require("chai");
const Fs = require("fs");
const Path = require("path");
const JsYaml = require("js-yaml");
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const ShapeMap = require("shape-map");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("@shexjs/validator");
const {applyOverlay} = require("@shexjs/semact-overlay");
const Reduce = require("..");
const jsActions = require("@shexjs/extension-reduce-js");

ShapeMap.Start = ShExValidator.Start;
const EXAMPLES = Path.join(__dirname, "..", "examples");
const read = f => Fs.readFileSync(Path.join(EXAMPLES, f), "utf8");
const BASE = "http://a.example/";

describe("the ShExReduce examples manifest", function () {
  this.timeout(20000);
  const entries = JsYaml.load(read("manifest.yaml"));

  it("should name only files it ships", () => {
    const named = entries.flatMap(entry => ["schemaURL", "dataURL", "overlayURL"]
                                 .flatMap(key => [].concat(entry[key] || [])));
    expect(named.length, "the entries name their documents").to.be.above(5);
    for (const file of named)
      expect(Fs.existsSync(Path.join(EXAMPLES, file)), file).to.equal(true);
  });

  it("should have every example conform, or not, as it says it does", () => {
    for (const entry of entries) {
      const where = entry.schemaLabel + " / " + entry.dataLabel;
      const schema = ShExParser.construct(BASE, null, {index: true})
            .parse(entry.schemaURL ? read(entry.schemaURL) : entry.schema, BASE);

      // the actions, where the entry keeps them apart from the schema
      const compiler = entry.overlayURL === undefined ? schema : (() => {
        const overlay = new N3.Store();
        overlay.addQuads(new N3.Parser({baseIRI: BASE, format: "text/turtle"})
                         .parse(read(entry.overlayURL)));
        return applyOverlay(schema, overlay, {prefixes: schema._prefixes || {}});
      })();

      const store = new N3.Store();
      const dataPrefixes = {};
      [].concat(entry.dataURL || []).map(read).forEach(text => {
        const parser = new N3.Parser({baseIRI: BASE, blankNodePrefix: "",
                                      format: "text/turtle"});
        store.addQuads(parser.parse(text));
        Object.assign(dataPrefixes, parser._prefixes);   // the query map is in them
      });

      const validator = new ShExValidator(compiler, RdfJsDb(store), {});
      Reduce.registerEager(validator, {
        evaluate: jsActions, prefixes: compiler._prefixes || {}});

      // shape labels resolve against the schema's base, node names against
      // the data's -- the two need not be the same document
      const asked = ShapeMap.Parser.construct(
        BASE, {base: schema._base || BASE, prefixes: schema._prefixes || {}},
        {base: BASE, prefixes: dataPrefixes}).parse(entry.queryMap);

      // `{FOCUS rdf:type sx:Schema}` asks the data who to validate
      const fixed = asked.flatMap(pair => {
        if (typeof pair.node === "string")
          return [pair];
        const pattern = pair.node;
        expect(pattern.type, where + ": unsupported query map").to.equal("TriplePattern");
        expect(pattern.subject && pattern.subject.term, where).to.equal("FOCUS");
        return store.getQuads(null, pattern.predicate, pattern.object).map(
          q => Object.assign({}, pair, {
            node: q.subject.termType === "BlankNode" ? "_:" + q.subject.value
              : q.subject.value}));
      });
      expect(fixed.length, where + ": nothing to validate").to.be.above(0);

      const results = validator.validateShapeMap(
        fixed.map(pair => ({node: pair.node, shape: pair.shape})));
      const status = results.every(r => r.status === "conformant")
            ? "conformant" : "nonconformant";
      expect(status, where + ": " + JSON.stringify(results).substring(0, 300))
        .to.equal(entry.status);
    }
  });
});
