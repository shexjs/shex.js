var ShexParser = require('../shex').Parser;

var fs = require('fs'),
    expect = require('chai').expect;

var schemasPath = __dirname + '/../schemas/';
var parsedSchemasPath = __dirname + '/../test/parsedSchemas/';

describe('A SHEX parser', function () {
  var parser = new ShexParser();

  // Ensure the same blank node identifiers are used in every test
  beforeEach(function () { parser._resetBlanks(); });

  var schemas = fs.readdirSync(schemasPath);
  schemas = schemas.map(function (q) { return q.replace(/\.shex$/, ''); });
  schemas.sort();

  schemas.forEach(function (query) {

    var parsedQueryFile = parsedSchemasPath + query + '.json';
    if (!fs.existsSync(parsedQueryFile)) return;

    it('should correctly parse query "' + query + '"', function () {
      var parsedQuery = parseJSON(fs.readFileSync(parsedQueryFile, 'utf8'));

      query = fs.readFileSync(schemasPath + query + '.shex', 'utf8');
      expect(parser.parse(query)).to.deep.equal(parsedQuery);
    });
  });

  it('should throw an error on an invalid query', function () {
    var query = 'invalid', error = null;
    try { parser.parse(query); }
    catch (e) { error = e; }

    expect(error).to.exist;
    expect(error).to.be.an.instanceof(Error);
    expect(error.message).to.include('Parse error on line 1');
  });

  describe('with pre-defined prefixes', function () {
    var prefixes = { a: 'abc#', b: 'def#' };
    var parser = new ShexParser(prefixes);

    it('should use those prefixes', function () {
      var query = 'SELECT * { a:a b:b "" }';
      expect(parser.parse(query).where[0].triples[0])
        .to.deep.equal({subject: 'abc#a', predicate: 'def#b', object: '""'});
    });

    it('should allow temporarily overriding prefixes', function () {
      var query = 'PREFIX a: <xyz#> SELECT * { a:a b:b "" }';
      expect(parser.parse(query).where[0].triples[0])
        .to.deep.equal({subject: 'xyz#a', predicate: 'def#b', object: '""'});
      expect(parser.parse('SELECT * { a:a b:b "" }').where[0].triples[0])
        .to.deep.equal({subject: 'abc#a', predicate: 'def#b', object: '""'});
    });

    it('should not change the original prefixes', function () {
      expect(prefixes).to.deep.equal({ a: 'abc#', b: 'def#' });
    });

    it('should not take over changes to the original prefixes', function () {
      prefixes.a = 'xyz#';
      expect(parser.parse('SELECT * { a:a b:b "" }').where[0].triples[0])
        .to.deep.equal({subject: 'abc#a', predicate: 'def#b', object: '""'});
    });
  });
});

// Parses a JSON object, restoring `undefined` values
function parseJSON(string) {
  var object = JSON.parse(string);
  return /"\{undefined\}"/.test(string) ? restoreUndefined(object) : object;
}

// Recursively replace values of "{undefined}" by `undefined`
function restoreUndefined(object) {
  for (var key in object) {
    var item = object[key];
    if (typeof item === 'object')
      object[key] = restoreUndefined(item);
    else if (item === '{undefined}')
      object[key] = undefined;
  }
  return object;
}
