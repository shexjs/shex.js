/**
 * File: hashmap-extension-test.js
 * Unit tests for extensions/shex-map/lib/hashmap-extension.js
 */

var chai = require('chai');
// var expect = chai.expect;
// var should = expect(chai)();

var _ = require('underscore');

var hmExtension = require('../extensions/shex-map/lib/hashmap_extension');

describe('Hashmap extension', () => {

    test('should have a lift and lower API', () => {
        expect(typeof hmExtension).toBe('object');
        expect(hmExtension.lift).toBeDefined();
        expect(hmExtension.lower).toBeDefined();
        expect(typeof hmExtension.lift).toBe('function');
        expect(typeof hmExtension.lower).toBe('function');
    });

    describe('#lift', () => {

        test('should throw an error if there is no argument', () => {
            expect(
                hmExtension.lift.bind(this,
                    "hashmap()",
                    "A test string",
                    {"test": "urn:local:test:"})).toThrowError(Error);
        });

        test('should throw an error if there is only one argument', () => {
            expect(
                hmExtension.lift.bind(this,
                    "hashmap(string)",
                    "string",
                    {"test": "urn:local:test:"},
                    "string")).toThrowError(Error);
        });

        test('should throw an error if there is no hashmap', () => {
            expect(
                hmExtension.lift.bind(this,
                    "hashmap(thing1, thing2)",
                    "thing1",
                    {"test": "urn:local:test:"},
                    "thing1, thing2")).toThrowError(Error);
        });

        test(
            'should throw an error if there is a hashmap with no variable',
            () => {
                expect(
                    hmExtension.lift.bind(this,
                        'hashmap(, {"a": "abc", "x": "xyz")',
                        "a",
                        {"test": "urn:local:test:"},
                        '{"a": "abc", "x": "xyz"}')).toThrowError(Error);
            }
        );

        test('should throw an error if there is an empty hashmap', () => {
            expect(
                hmExtension.lift.bind(this,
                    'hashmap(test, {})',
                    "a",
                    {"test": "urn:local:test:"},
                    'test, {}')).toThrowError(Error);
        });

        test('should fail gracefully if given a bad JSON map', () => {
            expect(
                hmExtension.lift.bind(this,
                    'hashmap(test, {a:abc x})',
                    "x",
                    {"test": "urn:local:test:"},
                    'test, {a:abc x}')).toThrowError(Error);
        });

        test(
            'should fail gracefully if given a hash map that does not have unique key/value pairs',
            () => {
                expect(
                    hmExtension.lift.bind(this,
                        'hashmap(test:string, {"a": "abc", "b": "abc", "x": "xyz"})', 
                        "x",
                        {"test": "urn:local:test:"},
                        'test:string, {"a": "abc", "b": "abc", "x": "xyz"}')).toThrowError(Error);
            }
        );

        test(
            'should return undefined value if given input that is not in the hash map',
            () => {
                expect(
                    hmExtension.lift(
                        'hashmap(test:string, {"a": "abc", "x": "xyz"})', 
                        "j", 
                        {"test": "urn:local:test:"},
                        'test:string, {"a": "abc", "x": "xyz"}')).toEqual({'urn:local:test:string': undefined});
            }
        );

        test('should execute a simple hashmap function', () => {
            expect(
                hmExtension.lift(
                    'hashmap(test:string, {"a": "abc", "x": "xyz"})', 
                    "a", 
                    {"test": "urn:local:test:"},
                    'test:string, {"a": "abc", "x": "xyz"}')).toEqual({'urn:local:test:string': 'abc'});

            expect(
                hmExtension.lift(
                    'hashmap(test:string, {"a": "abc", "x": "xyz"})', 
                    "x", 
                    {"test": "urn:local:test:"},
                    'test:string, {"a": "abc", "x": "xyz"}')).toEqual({'urn:local:test:string': 'xyz'});
        });
    });

    describe('#lower', () => {

        test('should throw an error if there is no argument', () => {
            expect(
                hmExtension.lower.bind(this,
                    "hashmap()",
                    "{}",
                    {"test": "urn:local:test:"})).toThrowError(Error);
        });

        test('should throw an error if there is only one argument', () => {
            expect(
                hmExtension.lower.bind(this,
                    "hashmap(string)",
                    "{}",
                    {"test": "urn:local:test:"},
                    "string")).toThrowError(Error);
        });

        test('should throw an error if there is no hashmap', () => {
            expect(
                hmExtension.lower.bind(this,
                    "hashmap(thing1, thing2)",
                    "{}",
                    {"test": "urn:local:test:"},
                    "thing1, thing2")).toThrowError(Error);
        });

        test(
            'should throw an error if there is a hashmap with no variable',
            () => {
                expect(
                    hmExtension.lower.bind(this,
                        'hashmap(, {"a": "abc", "x": "xyz")',
                        "{}",
                        {"test": "urn:local:test:"},
                        '{"a": "abc", "x": "xyz"}')).toThrowError(Error);
            }
        );

        test('should throw an error if there is an empty hashmap', () => {
            expect(
                hmExtension.lower.bind(this,
                    'hashmap(test, {})',
                    "{}",
                    {"test": "urn:local:test:"},
                    'test, {}')).toThrowError(Error);
        });

        test('should fail gracefully if given a bad JSON map', () => {
            expect(
                hmExtension.lower.bind(this,
                    'hashmap(test, {a:abc x})',
                    undefined,
                    {"test": "urn:local:test:"},
                    'test, {a:abc x}')).toThrowError(Error);
        });

        test(
            'should fail gracefully if given input that is not in the hash map',
            () => {
                expect(
                    hmExtension.lower.bind(this,
                        'hashmap(test:string, {"a": "abc", "x": "xyz"})', 
                        {"urn:local:test:string": "efg"}, 
                        {"test": "urn:local:test:"},
                        'test:string, {"a": "abc", "x": "xyz"}')).toThrowError(Error);
            }
        );

        test(
            'should fail gracefully if given a hash map that does not have unique key/value pairs',
            () => {
                expect(
                    hmExtension.lower.bind(this,
                        'hashmap(test:string, {"a": "abc", "b": "abc", "x": "xyz"})', 
                        {"urn:local:test:string": "xyz"}, 
                        {"test": "urn:local:test:"},
                        'test:string, {"a": "abc", "b": "abc", "x": "xyz"}')).toThrowError(Error);
            }
        );

        test('should execute a simple hashmap function', () => {
            expect(
                hmExtension.lower(
                    'hashmap(test:string, {"alpha": "beta"})', 
                    {"urn:local:test:string": "beta"}, 
                    {"test": "urn:local:test:"},
                    'test:string, {"alpha": "beta"}')).toBe('alpha');

            expect(
                hmExtension.lower(
                    'hashmap(test:string, {"a": "abc", "x": "xyz"})', 
                    {"urn:local:test:string": "abc"}, 
                    {"test": "urn:local:test:"},
                    'test:string, {"a": "abc", "x": "xyz"}')).toBe('a');

            expect(
                hmExtension.lower(
                    'hashmap(test:string, {"a": "abc", "x": "xyz"})', 
                    {"urn:local:test:string": "xyz"}, 
                    {"test": "urn:local:test:"},
                    'test:string, {"a": "abc", "x": "xyz"}')).toBe('x');
        });
    });

});
