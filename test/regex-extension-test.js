/**
 * File: regex-extension-test.js
 * Unit tests for extensions/shex-map/lib/regex-extension.js
 */

var chai = require('chai');
// var expect = chai.expect;
// var should = expect(chai)();

var _ = require('underscore');

var mapper = require('../extensions/shex-map/module');
var regexExtension = require('../extensions/shex-map/lib/regex_extension');

describe('Regex extension', () => {

    test('should have a lift and lower API', () => {
        expect(typeof regexExtension).toBe('object');
        expect(regexExtension.lift).toBeDefined();
        expect(regexExtension.lower).toBeDefined();
        expect(typeof regexExtension.lift).toBe('function');
        expect(typeof regexExtension.lower).toBe('function');
    });

    describe('#lift', () => {

        test(
            'should throw an error if there is no capture variable in the regular expression',
            () => {
                expect(
                    regexExtension.lift.bind(this,
                        "regex(/test/)",
                        "A test string",
                        {"test": "urn:local:test:"},
                        "/test/")
                ).toThrowError(Error);
            }
        );

        test(
            'should throw an error if given a variable name not in format prefix:name',
            () => {
                expect(
                    regexExtension.lift.bind(this,
                        "regex(/A (?<badtestvar>[0-9]+) string/)", 
                        "A test string",
                        {test: 'urn:local:test:'},
                        "/A (?<badtestvar>[0-9]+) string/")
                ).toThrowError(Error);
            }
        );

        test(
            'should throw an error if there is capture variable prefix is not in the bindings',
            () => {
                expect(
                    regexExtension.lift.bind(this,
                        "regex(/A (?<test:string>[0-9]+) string/)", 
                        "A test string",
                        {"other": "urn:local:other:"},
                        "/A (?<test:string>[0-9]+) string/")
                ).toThrowError(Error);
            }
        );

        test(
            'should throw an error if there is no match in the regular expression',
            () => {
                expect(
                    regexExtension.lift.bind(this,
                        "regex(/A (?<test:string>[0-9]+) string/)", 
                        "A test string", 
                        {test: 'urn:local:test:'},
                        "/A (?<test:string>[0-9]+) string/")
                ).toThrowError(Error);
            }
        );

        test('should execute a simple prefixed variable regex function', () => {
            expect(
                regexExtension.lift("regex(/(?<dem:family>^[a-zA-Z]+)/)", 
                "Smith, Mary", 
                {"dem": "http://a.example/dem#"},
                "/(?<dem:family>^[a-zA-Z]+)/")
            ).toEqual({ 'http://a.example/dem#family': 'Smith'});
        });

        test(
            'should execute a regex function with an embedded capture expression',
            () => {
                expect(
                    regexExtension.lift(
                        "regex(/A (?<test:string>[a-zA-Z]+) string/)", 
                        "A test string", 
                        {test: 'urn:local:test:'},
                        "/A (?<test:string>[a-zA-Z]+) string/")
                ).toEqual({ 'urn:local:test:string': 'test' });
            }
        );

	test(
        'should execute a regex function with a multiple capture variables',
        () => {
                expect(
                    regexExtension.lift(
                        "regex(/(?<dem:family>[a-zA-Z]+), (?<dem:given>[a-zA-Z]+)/)",
                        "Doe, John", 
                        {"dem": "http://a.example/dem#"},
                        "/(?<dem:family>[a-zA-Z]+), (?<dem:given>[a-zA-Z]+)/")
                ).toEqual({ 'http://a.example/dem#family': 'Doe',
                  'http://a.example/dem#given': 'John'});
            }
    );
    });

    describe('#lower', function() {
        test('should throw an error if there is no capture variable in the regular expression', function() {
            expect(
                regexExtension.lower.bind(this, 
                    "regex(/test/)",
                    {"urn:local:test:string": "test"}, 
                    {"test": "urn:local:test:"},
                    "/test/")
            ).toThrowError(Error/*, 'Found no capture variable in regex(/test/)!'*/);
        });

        test('should throw an error if given a variable name not in format prefix:name', function() {
            expect(
                regexExtension.lower.bind(this,
                    "regex(/A (?<badtestvar>[0-9]+) string/)",
                           "A test string",
                           {test: 'urn:local:test:'},
                           "/A (?<badtestvar>[0-9]+) string/")
            ).toThrowError(Error/*, 'variable "badtestvar" did not match expected pattern!'*/);
        });

        test('should throw an error if there is capture variable prefix is not in the bindings', function() {
            expect(
                regexExtension.lower.bind(this,
                    "regex(/A (?<test:string>[0-9]+) string/)", 
                    {"urn:local:other:string": "test"}, 
                    {"other": "urn:local:other:"},
                    "/A (?<test:string>[0-9]+) string/")
            ).toThrowError(Error/*, 'Unknown prefix test in "test:string"!'*/);
        });

        test('should throw an error if there is no match in the regular expression', function() {
            expect(
                regexExtension.lower.bind(this,
                    "regex(/A (?<test:string>[0-9]+) string/)", 
                    mapper.binder([{}]), 
                    {"test": "urn:local:test:"},
                    "/?<dem:family>^[a-zA-Z]+)/")
                ).toThrowError(Error/*, 'Found no capture variable in regex(/A (?<test:string>[0-9]+) string/)!'*/);
        });

        test('should execute a simple single variable regex function', function() {
            expect(
                regexExtension.lower(
                    "regex(/(?<dem:family>^[a-zA-Z]+)/)", 
                    mapper.binder([{"http://a.example/dem#family": "Smith"}]),
                    {"dem": "http://a.example/dem#"},
                    "/(?<dem:family>^[a-zA-Z]+)/")
            ).toBe("Smith");
        });

        test('should execute a regex function with an embedded capture expression', function() {
            expect(
                regexExtension.lower(
                    "regex(/A (?<test:string>[a-zA-Z]+) string/)", 
                    mapper.binder([{"urn:local:test:string": "test"}]), 
                    {"test": "urn:local:test:"},
                    "/A (?<test:string>[a-zA-Z]+) string/")
            ).toBe("A test string");
        });

	test('should execute a regex function with a multiple capture variables', function() {
            expect(
                regexExtension.lower(
                    "regex(/(?<dem:family>[a-zA-Z]+), (?<dem:given>[a-zA-Z]+)/)",
                    mapper.binder([{ 'http://a.example/dem#family': 'Doe', 'http://a.example/dem#given': 'John'}]),
                    {"dem": "http://a.example/dem#"},
                    "/(?<dem:family>[a-zA-Z]+), (?<dem:given>[a-zA-Z]+)/")
            ).toBe("Doe, John");
        });
    });

});
