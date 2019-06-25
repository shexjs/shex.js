/**
 * File: hashmap-extension-test.js
 * Unit tests for extensions/shex-map/lib/hashmap-extension.js
 */

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

var mapper = require("@shexjs/extension-map");
var hmExtension = mapper.extension.hashmap;

describe('Hashmap extension', function() {

    it('should have a lift and lower API', function() {
        hmExtension.should.be.an('object');
        hmExtension.lift.should.exist;
        hmExtension.lower.should.exist;
        hmExtension.lift.should.be.a('function');
        hmExtension.lower.should.be.a('function');
    });

    describe('#lift', function() {

        it('should throw an error if there is no argument', function() {
            expect(
                hmExtension.lift.bind(this,
                    "hashmap()",
                    "A test string",
                    {"test": "urn:local:test:"}))
            .to.throw(Error,
                "Hashmap extension requires a variable name and map as arguments, but found none!");
        });

        it('should throw an error if there is only one argument', function() {
            expect(
                hmExtension.lift.bind(this,
                    "hashmap(string)",
                    "string",
                    {"test": "urn:local:test:"},
                    "string"))
            .to.throw(Error, 
                "Hashmap extension requires a variable name and map as arguments, but found: hashmap(string)!");
        });

        it('should throw an error if there is no hashmap', function() {
            expect(
                hmExtension.lift.bind(this,
                    "hashmap(thing1, thing2)",
                    "thing1",
                    {"test": "urn:local:test:"},
                    "thing1, thing2"))
            .to.throw(Error, 
                "Hashmap extension requires a variable name and map as arguments, but found: hashmap(thing1, thing2)!");
        });

        it('should throw an error if there is a hashmap with no variable', function() {
            expect(
                hmExtension.lift.bind(this,
                    'hashmap(, {"a": "abc", "x": "xyz")',
                    "a",
                    {"test": "urn:local:test:"},
                    '{"a": "abc", "x": "xyz"}'))
            .to.throw(Error, 
                'Hashmap extension requires a variable name and map as arguments, but found: hashmap(, {"a": "abc", "x": "xyz")!');
        });

        it('should throw an error if there is an empty hashmap', function() {
            expect(
                hmExtension.lift.bind(this,
                    'hashmap(test, {})',
                    "a",
                    {"test": "urn:local:test:"},
                    'test, {}'))
            .to.throw(Error, 
                'Hashmap extension unable to parse map in hashmap(test, {})!Empty hashmap!');
        });

        it('should fail gracefully if given a bad JSON map', function() {
            expect(
                hmExtension.lift.bind(this,
                    'hashmap(test, {a:abc x})',
                    "x",
                    {"test": "urn:local:test:"},
                    'test, {a:abc x}'))
            .to.throw(Error, 
                'Hashmap extension unable to parse map in hashmap(test, {a:abc x})!Unexpected token a');
        });

        it('should fail gracefully if given a hash map that does not have unique key/value pairs', function() {
            expect(
                hmExtension.lift.bind(this,
                    'hashmap(test:string, {"a": "abc", "b": "abc", "x": "xyz"})', 
                    "x",
                    {"test": "urn:local:test:"},
                    'test:string, {"a": "abc", "b": "abc", "x": "xyz"}'))
            .to.throw(Error, 
                "Hashmap extension requires unique key/value pairs!");
        });

        it('should return undefined value if given input that is not in the hash map', function() {
            expect(
                hmExtension.lift(
                    'hashmap(test:string, {"a": "abc", "x": "xyz"})', 
                    "j", 
                    {"test": "urn:local:test:"},
                    'test:string, {"a": "abc", "x": "xyz"}'))
            .to.deep.equal(
                {'urn:local:test:string': undefined});
        });

        it('should execute a simple hashmap function', function() {
            expect(
                hmExtension.lift(
                    'hashmap(test:string, {"a": "abc", "x": "xyz"})', 
                    "a", 
                    {"test": "urn:local:test:"},
                    'test:string, {"a": "abc", "x": "xyz"}'))
            .to.deep.equal(
                {'urn:local:test:string': 'abc'});

            expect(
                hmExtension.lift(
                    'hashmap(test:string, {"a": "abc", "x": "xyz"})', 
                    "x", 
                    {"test": "urn:local:test:"},
                    'test:string, {"a": "abc", "x": "xyz"}'))
            .to.deep.equal(
                {'urn:local:test:string': 'xyz'});
        });
    });

    describe('#lower', function() {

        it('should throw an error if there is no argument', function() {
            expect(
                hmExtension.lower.bind(this,
                    "hashmap()",
                    "{}",
                    {"test": "urn:local:test:"}))
            .to.throw(Error,
                "Hashmap extension requires a variable name and map as arguments, but found none!");
        });

        it('should throw an error if there is only one argument', function() {
            expect(
                hmExtension.lower.bind(this,
                    "hashmap(string)",
                    "{}",
                    {"test": "urn:local:test:"},
                    "string"))
            .to.throw(Error, 
                "Hashmap extension requires a variable name and map as arguments, but found: hashmap(string)!");
        });

        it('should throw an error if there is no hashmap', function() {
            expect(
                hmExtension.lower.bind(this,
                    "hashmap(thing1, thing2)",
                    "{}",
                    {"test": "urn:local:test:"},
                    "thing1, thing2"))
            .to.throw(Error, 
                "Hashmap extension requires a variable name and map as arguments, but found: hashmap(thing1, thing2)!");
        });

        it('should throw an error if there is a hashmap with no variable', function() {
            expect(
                hmExtension.lower.bind(this,
                    'hashmap(, {"a": "abc", "x": "xyz")',
                    "{}",
                    {"test": "urn:local:test:"},
                    '{"a": "abc", "x": "xyz"}'))
            .to.throw(Error, 
                'Hashmap extension requires a variable name and map as arguments, but found: hashmap(, {"a": "abc", "x": "xyz")!');
        });

        it('should throw an error if there is an empty hashmap', function() {
            expect(
                hmExtension.lower.bind(this,
                    'hashmap(test, {})',
                    "{}",
                    {"test": "urn:local:test:"},
                    'test, {}'))
            .to.throw(Error, 
                'Hashmap extension unable to parse map in hashmap(test, {})!Empty hashmap!');
        });

        it('should fail gracefully if given a bad JSON map', function() {
            expect(
                hmExtension.lower.bind(this,
                    'hashmap(test, {a:abc x})',
                    undefined,
                    {"test": "urn:local:test:"},
                    'test, {a:abc x}'))
            .to.throw(Error, 
                'Hashmap extension unable to parse map in hashmap(test, {a:abc x})!Unexpected token a');
        });

        it('should fail gracefully if given input that is not in the hash map', function() {
            expect(
                hmExtension.lower.bind(this,
                    'hashmap(test:string, {"a": "abc", "x": "xyz"})', 
                    mapper.binder([{"urn:local:test:string": "efg"}]), 
                    {"test": "urn:local:test:"},
                    'test:string, {"a": "abc", "x": "xyz"}'))
            .to.throw(Error, 
                "Hashmap extension was unable to invert the value efg with map { a: 'abc', x: 'xyz' }!");
        });

        it('should fail gracefully if given a hash map that does not have unique key/value pairs', function() {
            expect(
                hmExtension.lower.bind(this,
                    'hashmap(test:string, {"a": "abc", "b": "abc", "x": "xyz"})', 
                    mapper.binder([{"urn:local:test:string": "xyz"}]), 
                    {"test": "urn:local:test:"},
                    'test:string, {"a": "abc", "b": "abc", "x": "xyz"}'))
            .to.throw(Error, 
                "Hashmap extension requires unique key/value pairs!");
        });

        it('should execute a simple hashmap function', function() {
            expect(
                hmExtension.lower(
                    'hashmap(test:string, {"alpha": "beta"})', 
                    mapper.binder([{"urn:local:test:string": "beta"}]), 
                    {"test": "urn:local:test:"},
                    'test:string, {"alpha": "beta"}'))
            .to.equal('alpha');

            expect(
                hmExtension.lower(
                    'hashmap(test:string, {"a": "abc", "x": "xyz"})', 
                    mapper.binder([{"urn:local:test:string": "abc"}]), 
                    {"test": "urn:local:test:"},
                    'test:string, {"a": "abc", "x": "xyz"}'))
            .to.equal('a');

            expect(
                hmExtension.lower(
                    'hashmap(test:string, {"a": "abc", "x": "xyz"})', 
                    mapper.binder([{"urn:local:test:string": "xyz"}]), 
                    {"test": "urn:local:test:"},
                    'test:string, {"a": "abc", "x": "xyz"}'))
            .to.equal('x');
        });
    });

});
