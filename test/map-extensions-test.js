/**
 * File: map-extensions-test.js
 * Unit tests for extensions/shex-map/lib/extensions.js
 */

var chai = require('chai');
// var expect = chai.expect;
// var should = expect(chai)();

var _ = require('underscore');

var mapExtensions = require('../extensions/shex-map/lib/extensions');

describe('Map extensions', () => {

    test('should have a lift and lower API', () => {
        expect(typeof mapExtensions).toBe('object');
        expect(mapExtensions.lift).toBeDefined();
        expect(mapExtensions.lower).toBeDefined();
        expect(typeof mapExtensions.lift).toBe('function');
        expect(typeof mapExtensions.lower).toBe('function');
    });

    describe('#lift', () => {
        test('should throw an error if not given an extension function', () => {
            expect(
                mapExtensions.lift
            ).toThrowError(Error);
        });

        test('should throw an error if not given an extension function', () => {
            expect(
                mapExtensions.lift.bind(this, 'a test string')
            ).toThrowError(Error);
        });

        test(
            'should throw an error if not given an extension function with no opening parenthesis',
            () => {
                expect(
                    mapExtensions.lift.bind(this, 'foo)')
                ).toThrowError(Error);
        }
        );

        test(
            'should throw an error if not given an extension function with no closing parenthesis',
            () => {
                expect(
                    mapExtensions.lift.bind(this, 'foo(')
                ).toThrowError(Error);
        }
        );

        test(
            'should throw an error if not given an extension function with closing parenthesis before opening parenthesis',
            () => {
                expect(
                    mapExtensions.lift.bind(this, 'foo)a(')
                ).toThrowError(Error);
        }
        );

        test(
            'should throw an error if not given an extension function argument',
            () => {
                expect(
                    mapExtensions.lift.bind(this, 'foo()')
                ).toThrowError(Error);
            }
        );

        test(
            'should throw an error if given an unknown extension function',
            () => {
                expect(
                    mapExtensions.lift.bind(this, 'foo(myvar)')
                ).toThrowError(Error);
            }
        );

        test('should execute the lift test function', () => {
            expect( 
                mapExtensions.lift('test(myvar)')
            ).toBe('test(myvar)');
        });

        test('should execute a simple hashmap function', () => {
            expect(
                mapExtensions.lift(
                    'hashmap(test:string, {"alpha": "beta"})',
                    "alpha",
                    {"test": "urn:local:test:"})).toEqual({'urn:local:test:string': 'beta'});
        });

        test('should execute a simple regex function', () => {
            expect(
                mapExtensions.lift(
                    "regex(/(?<dem:test>^[a-zA-Z]+)/)", 
                    "Testing", 
                    {"dem": "http://a.example/dem#"})
            ).toEqual({ 'http://a.example/dem#test': 'Testing' });
        });

    });

    describe('#lower', () => {
        test('should throw an error if not given an extension function', () => {
            expect(
                mapExtensions.lower
            ).toThrowError(Error);
        });

        test('should throw an error if not given an extension function', () => {
            expect(
                mapExtensions.lower.bind(this, 'a test string')
            ).toThrowError(Error);
        });

        test(
            'should throw an error if not given an extension function with no opening parenthesis',
            () => {
                expect(
                    mapExtensions.lower.bind(this, 'foo)')
                ).toThrowError(Error);
        }
        );

        test(
            'should throw an error if not given an extension function with no closing parenthesis',
            () => {
                expect(
                    mapExtensions.lower.bind(this, 'foo(')
                ).toThrowError(Error);
        }
        );

        test(
            'should throw an error if not given an extension function argument',
            () => {
                expect(
                    mapExtensions.lower.bind(this, 'foo()')
                ).toThrowError(Error);
            }
        );

        test('should throw an error if not given an unknown extension', () => {
            expect(
                mapExtensions.lower.bind(this, 'foo(myvar)')
            ).toThrowError(Error);
        });

        test('should execute the lift test function', () => {
            expect(
                mapExtensions.lower('test(myvar)')
            ).toBe('test(myvar)');
        });

        test('should execute a simple hashmap function', () => {
            expect(
                mapExtensions.lower(
                    'hashmap(test:string, {"alpha": "beta"})',
                    {"urn:local:test:string": "beta"},
                    {"test": "urn:local:test:"})).toBe('alpha');
        });

        test('should execute a simple regex function', () => {
            expect(
                mapExtensions.lower(
                    "regex(/(?<dem:test>^[a-zA-Z]+)/)", 
                    { 'http://a.example/dem#test': 'Testing' }, 
                    {"dem": "http://a.example/dem#"})
            ).toBe('Testing');
        });
    });
    
});
