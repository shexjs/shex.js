const VERBOSE = "VERBOSE" in process.env;
const TESTS = "TESTS" in process.env ? process.env["TESTS"] : null;

const ShExParser = require("@shexjs/parser");
const ShapePath = require("@shexjs/path");

const fs = require('fs');
const expect = require('chai').expect;
const findPath = require('./findPath.js');

const schemasPath = findPath('schemas');
const shapePathTestDir = __dirname + '/../test/ShapePath/';
const manifestFile = shapePathTestDir + 'Manifest.json';

describe('Resolving ShapePaths', function () {
  const parser = ShExParser.construct();

  // Ensure the same blank node identifiers are used in every test
  beforeEach(function () { parser._resetBlanks(); });
  const manifest = parseJSON(fs.readFileSync(manifestFile, 'utf8'));
  if (TESTS)
    manifest.tests = manifest.tests.filter(function (t) {
      return t.name.match(TESTS) || t.from.match(TESTS) || t.expect.match(TESTS);
    });

  manifest.tests.forEach(function (test) {

    const schemaFile = (test.from.startsWith("./") ? shapePathTestDir : schemasPath) + test.from + (test.from.endsWith(".json") ? "" : ".shex");
    const expectedFile = shapePathTestDir + test.expect + ".json";
    const schemaStr = fs.readFileSync(schemaFile, 'utf8');
    const schema = test.from.endsWith(".json")
          ? JSON.parse(schemaStr)
          : parser.parse(schemaStr); parser._resetBlanks();
    const shapePath = ShapePath(schema, {base: "base:/", prefixes: {"": "default:/", "x": "x:/"}})
    const blurb = test.name + ': ' + (VERBOSE ? schemaFile : test.from) +
          ' for ' + test.shapePath
    let target = null
    let thrownMessage = null
    try {
      target = shapePath.search(test.shapePath)
    } catch (e) {
      thrownMessage = e.message
    }
    if (test.throws) {
      it(blurb + ' should fail witl ' +
         (VERBOSE ? expectedFile : test.expect), function () {
           if (VERBOSE) console.log("schema: ", JSON.stringify(schema));
           if (VERBOSE) console.log("include: ", JSON.stringify(test.include));
           if (VERBOSE) console.log("message: ", thrownMessage);
           if (VERBOSE) console.log("expect: ", expectedFile);
           expect(expectedFile).to.contain(thrownMessage);
         });
    } else {
      const expected = JSON.parse(fs.readFileSync(expectedFile, 'utf8'));

      it(blurb + ' should match ' +
         (VERBOSE ? expectedFile : test.expect), function () {
           if (VERBOSE) console.log("schema: ", JSON.stringify(schema));
           if (VERBOSE) console.log("include: ", JSON.stringify(test.include));
           if (VERBOSE) console.log("target: ", JSON.stringify(target));
           if (VERBOSE) console.log("expect: ", JSON.stringify(expected));
           expect(target).to.deep.equal(expected);
         });
    }
  });
});

// Parses a JSON object, restoring `undefined` values
function parseJSON(string) {
  const object = JSON.parse(string);
  return /"\{undefined\}"/.test(string) ? restoreUndefined(object) : object;
}

