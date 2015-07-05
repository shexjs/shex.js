var VERBOSE = "VERBOSE" in process.env;

var ShExParser = require('../shex').Parser;

var fs = require('fs'),
    expect = require('chai').expect;

var schemasPath = __dirname + '/../schemas/';
var jsonSchemasPath = __dirname + '/../test/parsedSchemas/';
var negSyntaxTestsPath = __dirname + '/../negativeSyntax/';

describe('A SHEX parser', function () {
  // var b = function () {  };
  // it('is a toy', function () {
  //   expect({a:1, b: b}).to.deep.equal({a:1, b: b});
  // });

  var parser = new ShExParser();

  // Ensure the same blank node identifiers are used in every test
  beforeEach(function () { parser._resetBlanks(); });

  var schemas = fs.readdirSync(schemasPath);
  schemas = schemas.map(function (q) { return q.replace(/\.shex$/, ''); });
  schemas.sort();

  schemas.forEach(function (schema) {

    var jsonSchemaFile = jsonSchemasPath + schema + '.json';
    if (!fs.existsSync(jsonSchemaFile)) return;

    it('should correctly parse schema "' + schema + '"', function () {
      var jsonSchema = parseJSON(fs.readFileSync(jsonSchemaFile, 'utf8'));

      if (VERBOSE) console.log(schema);
      schema = fs.readFileSync(schemasPath + schema + '.shex', 'utf8');
      var parsedSchema = parser.parse(schema);
      if (VERBOSE) console.log("parsed   :" + JSON.stringify(parsedSchema));
      if (VERBOSE) console.log("expected :" + JSON.stringify(jsonSchema));
      expect(parsedSchema).to.deep.equal(jsonSchema);
    });
  });

  // make sure errors are reported
  it('should throw an error on an invalid schema', function () {
    var schema = 'invalid', error = null;
    try { parser.parse(schema); }
    catch (e) { error = e; }

    expect(error).to.exist;
    expect(error).to.be.an.instanceof(Error);
    expect(error.message).to.include('Parse error on line 1');
  });


  // negative syntax tests
  var negSyntaxTests = fs.readdirSync(negSyntaxTestsPath);
  negSyntaxTests = negSyntaxTests.map(function (q) { return q.replace(/\.err$/, ''); });
  negSyntaxTests.sort();

  negSyntaxTests.forEach(function (schema) {

    it('should correctly parse schema "' + schema + '"', function () {
      if (VERBOSE) console.log(schema);
      schema = fs.readFileSync(negSyntaxTestsPath + schema + '.err', 'utf8');
      try { parser.parse(schema); }
      catch (e) { error = e; }
      
      expect(error).to.exist;
      expect(error).to.be.an.instanceof(Error);
      expect(error.message).to.include('Parse error');
    });
  });



  describe('with pre-defined prefixes', function () {
    var prefixes = { a: 'abc#', b: 'def#' };
    var parser = new ShExParser(prefixes);

    it('should use those prefixes', function () {
      var schema = 'a:a { b:b .+ }';
      expect(parser.parse(schema).shapes['abc#a'].expression.predicate)
        .to.deep.equal('def#b');
    });

    it('should allow temporarily overriding prefixes', function () {
      var schema = 'PREFIX a: <xyz#> a:a { b:b .+ }';
      expect(parser.parse(schema).shapes['xyz#a'].expression.predicate)
        .to.deep.equal('def#b');
      expect(parser.parse('a:a { b:b .+ }').shapes['abc#a'].expression.predicate)
        .to.deep.equal('def#b');
    });

    it('should not change the original prefixes', function () {
      expect(prefixes).to.deep.equal({ a: 'abc#', b: 'def#' });
    });

    it('should not take over changes to the original prefixes', function () {
      prefixes.a = 'xyz#';
      expect(parser.parse('a:a { b:b .+ }').shapes['abc#a'].expression.predicate)
        .to.deep.equal('def#b');
    });
  });

  describe('PNAME_NS with pre-defined prefixes', function () {
    var prefixes = { a: 'abc#', b: 'def#' };
    var parser = new ShExParser(prefixes);

    it('should use those prefixes', function () {
      var schema = 'a: { b: .+ }';
      expect(parser.parse(schema).shapes['abc#'].expression.predicate)
        .to.deep.equal('def#');
    });

    it('should allow temporarily overriding prefixes', function () {
      var schema = 'PREFIX a: <xyz#> a: { b: .+ }';
      expect(parser.parse(schema).shapes['xyz#'].expression.predicate)
        .to.deep.equal('def#');
      expect(parser.parse('a: { b: .+ }').shapes['abc#'].expression.predicate)
        .to.deep.equal('def#');
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
