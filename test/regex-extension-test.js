/**
 * File: regex-extension-test.js
 * Unit tests for extensions/shex-map/lib/regex-extension.js
 */

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

var mapper = require("@shexjs/extension-map");
var regexExtension = mapper.extension.regex;

describe('Regex extension', function() {

    it('should have a lift and lower API', function() {
        regexExtension.should.be.an('object');
        regexExtension.lift.should.exist;
        regexExtension.lower.should.exist;
        regexExtension.lift.should.be.a('function');
        regexExtension.lower.should.be.a('function');
    });

    describe('#lift', function() {

        it('should throw an error if there is no capture variable in the regular expression', function() {
            expect(
                regexExtension.lift.bind(this,
                    "regex(/test/)",
                    "A test string",
                    {"test": "urn:local:test:"},
                    "/test/")
            ).to.throw(Error,
                      'Found no capture variable in regex(/test/)!');
        });

        it('should throw an error if given a variable name not in format prefix:name', function() {
            expect(
                regexExtension.lift.bind(this,
                    "regex(/A (?<badtestvar>[0-9]+) string/)", 
                    "A test string",
                    {test: 'urn:local:test:'},
                    "/A (?<badtestvar>[0-9]+) string/")
            ).to.throw(Error, 
                     'variable "badtestvar" did not match expected pattern!');
        });

        it('should throw an error if there is capture variable prefix is not in the bindings', function() {
            expect(
                regexExtension.lift.bind(this,
                    "regex(/A (?<test:string>[0-9]+) string/)", 
                    "A test string",
                    {"other": "urn:local:other:"},
                    "/A (?<test:string>[0-9]+) string/")
            ).to.throw(Error, 'Unknown prefix test in "test:string"!');
        });

        it('should throw an error if there is no match in the regular expression', function() {
            expect(
                regexExtension.lift.bind(this,
                    "regex(/A (?<test:string>[0-9]+) string/)", 
                    "A test string", 
                    {test: 'urn:local:test:'},
                    "/A (?<test:string>[0-9]+) string/")
            ).to.throw(Error, 'regex(/A (?<test:string>[0-9]+) string/) found no match for input "A test string"!');
        });

        it('should execute a simple prefixed variable regex function', function() {
            expect(
                regexExtension.lift("regex(/(?<dem:family>^[a-zA-Z]+)/)", 
                "Smith, Mary", 
                {"dem": "http://a.example/dem#"},
                "/(?<dem:family>^[a-zA-Z]+)/")
            ).to.deep.equal({ 'http://a.example/dem#family': 'Smith'});
        });

        it('should execute a regex function with an embedded capture expression', function() {
            expect(
                regexExtension.lift(
                    "regex(/A (?<test:string>[a-zA-Z]+) string/)", 
                    "A test string", 
                    {test: 'urn:local:test:'},
                    "/A (?<test:string>[a-zA-Z]+) string/")
            ).to.deep.equal({ 'urn:local:test:string': 'test' });
        });

	it('should execute a regex function with a multiple capture variables', function() {
            expect(
                regexExtension.lift(
                    "regex(/(?<dem:family>[a-zA-Z]+), (?<dem:given>[a-zA-Z]+)/)",
                    "Doe, John", 
                    {"dem": "http://a.example/dem#"},
                    "/(?<dem:family>[a-zA-Z]+), (?<dem:given>[a-zA-Z]+)/")
            ).to.deep.equal(
                { 'http://a.example/dem#family': 'Doe',
                  'http://a.example/dem#given': 'John'} );
        });
    });

    describe('#lower', function() {
        it('should throw an error if there is no capture variable in the regular expression', function() {
            expect(
                regexExtension.lower.bind(this, 
                    "regex(/test/)",
                    {"urn:local:test:string": "test"}, 
                    {"test": "urn:local:test:"},
                    "/test/")
            ).to.throw(Error, 'Found no capture variable in regex(/test/)!');
        });

        it('should throw an error if given a variable name not in format prefix:name', function() {
            expect(
                regexExtension.lower.bind(this,
                    "regex(/A (?<badtestvar>[0-9]+) string/)",
                           "A test string",
                           {test: 'urn:local:test:'},
                           "/A (?<badtestvar>[0-9]+) string/")
            ).to.throw(Error, 'variable "badtestvar" did not match expected pattern!');
        });

        it('should throw an error if there is capture variable prefix is not in the bindings', function() {
            expect(
                regexExtension.lower.bind(this,
                    "regex(/A (?<test:string>[0-9]+) string/)", 
                    {"urn:local:other:string": "test"}, 
                    {"other": "urn:local:other:"},
                    "/A (?<test:string>[0-9]+) string/")
            ).to.throw(Error, 'Unknown prefix test in "test:string"!');
        });

        it('should throw an error if there is no match in the regular expression', function() {
            expect(
                regexExtension.lower.bind(this,
                    "regex(/A (?<test:string>[0-9]+) string/)", 
                    mapper.binder([{}]), 
                    {"test": "urn:local:test:"},
                    "/?<dem:family>^[a-zA-Z]+)/")
                ).to.throw(Error, 'Found no capture variable in regex(/A (?<test:string>[0-9]+) string/)!');
        });

        it('should execute a simple single variable regex function', function() {
            expect(
                regexExtension.lower(
                    "regex(/(?<dem:family>^[a-zA-Z]+)/)", 
                    mapper.binder([{"http://a.example/dem#family": "Smith"}]),
                    {"dem": "http://a.example/dem#"},
                    "/(?<dem:family>^[a-zA-Z]+)/")
            ).to.equal("Smith");
        });

        it('should execute a regex function with an embedded capture expression', function() {
            expect(
                regexExtension.lower(
                    "regex(/A (?<test:string>[a-zA-Z]+) string/)", 
                    mapper.binder([{"urn:local:test:string": "test"}]), 
                    {"test": "urn:local:test:"},
                    "/A (?<test:string>[a-zA-Z]+) string/")
            ).to.equal("A test string");
        });

	it('should execute a regex function with a multiple capture variables', function() {
            expect(
                regexExtension.lower(
                    "regex(/(?<dem:family>[a-zA-Z]+), (?<dem:given>[a-zA-Z]+)/)",
                    mapper.binder([{ 'http://a.example/dem#family': 'Doe', 'http://a.example/dem#given': 'John'}]),
                    {"dem": "http://a.example/dem#"},
                    "/(?<dem:family>[a-zA-Z]+), (?<dem:given>[a-zA-Z]+)/")
            ).to.equal("Doe, John");
        });
    });

});
