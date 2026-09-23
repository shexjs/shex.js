"use strict";

/**
 * Runner for validation-contrib: ShEx validation tests that are useful across
 * implementations but NOT attributable to the specification (error-repair
 * recipes, feasibility localization, and ShExJ constructs beyond the JSG/ShExR
 * grammars). Contrib entries carry only pass/fail + traits -- there is no
 * reference-result (.val), so this checks logic-conformance only.
 *
 * The corpus is located the same way as the main suite (findPath: an explicit
 * TESTSDIR, then ../shexTest, ../../shexTest and ../../shexSpec/shexTest from the repo root, then the shex-test
 * devDependency). When no validation-contrib/ is present the suite is skipped.
 */

const TESTS = "TESTS" in process.env ? process.env.TESTS : null;
const ShExParser = require("@shexjs/parser");
const { ShExIndexVisitor } = require("@shexjs/visitor");
const { ctor: RdfJsDb } = require("@shexjs/neighborhood-rdfjs");
const { ShExValidator } = require("..");
const N3 = require("n3");
const fs = require("fs");
const path = require("path");
const { expect } = require("chai");
const findPath = require("../../shex-cli/test/findPath.js");

const regexModules = [
  require("@shexjs/eval-simple-1err").RegexpModule,
  require("@shexjs/eval-threaded-nerr").RegexpModule,
];

let contribPath = null;
try { contribPath = findPath("validation-contrib"); } catch (e) { /* no contrib corpus */ }

describe("A ShEx validator (contrib)", function () {
  // describe.skip would still run this body to collect its (pending) tests,
  // so the corpus check has to be inside it: one pending test says why.
  if (contribPath === null) {
    it.skip("is skipped: no validation-contrib/ in any shexTest checkout");
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(contribPath + "manifest.jsonld", "utf8"));
  let entries = manifest["@graph"][0].entries;
  if (TESTS)
    entries = entries.filter(t => t["@id"].match(TESTS) || t.action.schema.match(TESTS) || t.action.data.match(TESTS));

  regexModules.forEach(regexModule => {
    entries.forEach(test => {
      const pass = test["@type"] === "sht:ValidationTest";
      it(`should ${pass ? "pass" : "fail"} '${test.name}' using ${regexModule.name}.`, function () {
        const schemaFile = path.resolve(contribPath, test.action.schema);
        const dataFile = path.resolve(contribPath, test.action.data);
        const schema = loadSchema(schemaFile);
        const quads = new N3.Parser({ baseIRI: "file://" + dataFile, blankNodePrefix: "", factory: N3.DataFactory })
              .parse(fs.readFileSync(dataFile, "utf8"));
        const validator = new ShExValidator(schema, RdfJsDb(new N3.Store(quads)), { regexModule });
        const result = validator.validateShapeMap([{ node: test.action.focus, shape: test.action.shape }]);
        const conformant = !resultHasFailure(result);
        expect(conformant, JSON.stringify(result)).to.equal(pass);
      });
    });
  });
});

function loadSchema (file) {
  const text = fs.readFileSync(file, "utf8");
  if (file.endsWith(".json")) {
    const schema = JSON.parse(text);
    schema._index = ShExIndexVisitor.index(schema);
    return schema;
  }
  return ShExParser.construct("file://" + file, null, { index: true }).parse(text);
}

// A validate() result is a ShapeMap ([{status}]) or a nested ShapeTest/Failure.
function resultHasFailure (result) {
  const arr = Array.isArray(result) ? result : [result];
  return arr.some(r => r && (r.status === "nonconformant" || r.type === "Failure" || "errors" in r));
}
