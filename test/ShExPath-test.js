const VERBOSE = "VERBOSE" in process.env;
const TESTS = "TESTS" in process.env ? process.env["TESTS"].split(/,/) : null;

const ShExParser = require("@shexjs/parser");
const ShExUtil = require("@shexjs/core").Util;

const fs = require('fs');
const expect = require('chai').expect;
const findPath = require('./findPath.js');

const schemasPath = findPath('schemas');
const shexPathTestDir = __dirname + '/../test/ShExPath/';
const manifestFile = shexPathTestDir + 'Manifest.json';

describe('Resolving ShExPaths', function () {
  const parser = ShExParser.construct();

  // Ensure the same blank node identifiers are used in every test
  beforeEach(function () { parser._resetBlanks(); });
  const manifest = parseJSON(fs.readFileSync(manifestFile, 'utf8'));
  if (TESTS)
    manifest.tests = manifest.tests.filter(function (t) {
      return TESTS.indexOf(t.from) !== -1 || TESTS.indexOf(t.expect) !== -1;
    });

  manifest.tests.forEach(function (test) {

    const schemaFile = schemasPath + test.from + ".shex";
    const expectedFile = shexPathTestDir + test.expect + ".json";
    const schema = parser.parse(fs.readFileSync(schemaFile, 'utf8')); parser._resetBlanks();
    const shexPath = ShExUtil.shexPath(schema, null) // IRI resolver
    const target = shexPath.search(test.shexPath);
    const expected = JSON.parse(fs.readFileSync(expectedFile, 'utf8'));

    it((VERBOSE ? schemaFile : test.from) + 
       ' for ' + test.shexPath + ' should match ' + 
       (VERBOSE ? expectedFile : test.expect), function () {
      if (VERBOSE) console.log("schema: ", JSON.stringify(schema));
      if (VERBOSE) console.log("include: ", JSON.stringify(test.include));
      if (VERBOSE) console.log("target: ", JSON.stringify(target));
      if (VERBOSE) console.log("expect: ", JSON.stringify(expected));
      expect(target).to.deep.equal(expected);
    });
  });
});

// Parses a JSON object, restoring `undefined` values
function parseJSON(string) {
  const object = JSON.parse(string);
  return /"\{undefined\}"/.test(string) ? restoreUndefined(object) : object;
}

