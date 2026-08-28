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
const Reduce = require("..");
const jsActions = require("@shexjs/extension-reduce-js");

const EXAMPLES = Path.join(__dirname, "..", "examples");
const read = f => Fs.readFileSync(Path.join(EXAMPLES, f), "utf8");

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
    const {validateEntry} = require("../../../tools/manifest-runner");
    for (const entry of entries) {
      const where = entry.schemaLabel + " / " + entry.dataLabel;
      // the actions run as the matcher matches, which is what the app does
      // and the only way an action's refusal shows up in the verdict
      const {verdict, results} = validateEntry(entry, EXAMPLES, {
        prepare: (validator, schema) => Reduce.registerEager(validator, {
          evaluate: jsActions, prefixes: schema._prefixes || {}}),
      });
      expect(verdict, where + ": " + JSON.stringify(results).substring(0, 300)).to.equal(entry.status);
    }
  });
});
