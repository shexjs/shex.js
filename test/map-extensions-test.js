/**
 * File: map-extensions-test.js
 * Unit tests for extensions/shex-map/lib/extensions.js
 */

var _ = require('underscore');

var mapper = require('../extensions/shex-map/module');
var mapExtensions = require('../extensions/shex-map/lib/extensions');

describe('Map extensions', function() {

    it('should have a lift and lower API', function() {
        expect(typeof mapExtensions).toBe('object');
        expect(mapExtensions.lift).toBeDefined();
        expect(mapExtensions.lower).toBeDefined();
        expect(typeof mapExtensions.lift).toBe('function');
        expect(typeof mapExtensions.lower).toBe('function');
    });

    describe('#lift', function() {
        it('should throw an error if not given an extension function', function() {
            expect(
                mapExtensions.lift
            ).toThrowError(Error, /Invalid extension function: undefined!/);
        });

        it('should throw an error if not given an extension function', function() {
            expect(
                mapExtensions.lift.bind(this, 'a test string')
            ).toThrowError(Error, /Invalid extension function: a test string!/);
        });

        it('should throw an error if not given an extension function with no opening parenthesis', function() {
            expect(
                mapExtensions.lift.bind(this, 'foo)')
            ).toThrowError(Error, /Invalid extension function: foo\)!/);
	});

        it('should throw an error if not given an extension function with no closing parenthesis', function() {
            expect(
                mapExtensions.lift.bind(this, 'foo(')
            ).toThrowError(Error, /Invalid extension function: foo\(!/);
	});

        it('should throw an error if not given an extension function with closing parenthesis before opening parenthesis', function() {
            expect(
                mapExtensions.lift.bind(this, 'foo)a(')
            ).toThrowError(Error, /Invalid extension function: foo\)a\(!/);
	});

        it('should throw an error if not given an extension function argument', function() {
            expect(
                mapExtensions.lift.bind(this, 'foo()')
            ).toThrowError(Error, /Invalid extension function: foo\(\)!/);
        });

        it('should throw an error if given an unknown extension function', function() {
            expect(
                mapExtensions.lift.bind(this, 'foo(myvar)')
            ).toThrowError(Error, /Unknown extension: foo\(myvar\)!/);
        });

        it('should execute the lift test function', function() {
            expect( 
                mapExtensions.lift('test(myvar)')
            ).toBe('test(myvar)');
        });

        it('should execute a simple hashmap function', function() {
            expect(
                mapExtensions.lift(
                    'hashmap(test:string, {"alpha": "beta"})',
                    "alpha",
                    {"test": "urn:local:test:"}))
            .toEqual(
                {'urn:local:test:string': 'beta'});
        });

        it('should execute a simple regex function', function() {
            expect(
                mapExtensions.lift(
                    "regex(/(?<dem:test>^[a-zA-Z]+)/)", 
                    "Testing", 
                    {"dem": "http://a.example/dem#"})
            ).toEqual(
                { 'http://a.example/dem#test': 'Testing' });
        });

    });

    describe('#lower', function() {
        it('should throw an error if not given an extension function', function() {
            expect(
                mapExtensions.lower
            ).toThrowError(Error, /Invalid extension function: undefined!/);
        });

        it('should throw an error if not given an extension function', function() {
            expect(
                mapExtensions.lower.bind(this, 'a test string')
            ).toThrowError(Error, /Invalid extension function: a test string!/);
        });

        it('should throw an error if not given an extension function with no opening parenthesis', function() {
            expect(
                mapExtensions.lower.bind(this, 'foo)')
            ).toThrowError(Error, /Invalid extension function: foo\)!/);
	});

        it('should throw an error if not given an extension function with no closing parenthesis', function() {
            expect(
                mapExtensions.lower.bind(this, 'foo(')
            ).toThrowError(Error, /Invalid extension function: foo\(!/);
	});

        it('should throw an error if not given an extension function argument', function() {
            expect(
                mapExtensions.lower.bind(this, 'foo()')
            ).toThrowError(Error, /Invalid extension function: foo\(\)!/);
        });

        it('should throw an error if not given an unknown extension', function() {
            expect(
                mapExtensions.lower.bind(this, 'foo(myvar)')
            ).toThrowError(Error, /Unknown extension: foo\(myvar\)!/);
        });

        it('should execute the lift test function', function() {
            expect(
                mapExtensions.lower('test(myvar)')
            ).toBe('test(myvar)');
        });

        it('should execute a simple hashmap function', function() {
            expect(
                mapExtensions.lower(
                    'hashmap(test:string, {"alpha": "beta"})',
                    mapper.binder([{"urn:local:test:string": "beta"}]),
                    {"test": "urn:local:test:"}))
            .toBe('alpha');
        });

        it('should execute a simple regex function', function() {
            expect(
                mapExtensions.lower(
                    "regex(/(?<dem:test>^[a-zA-Z]+)/)", 
                    mapper.binder([{ 'http://a.example/dem#test': 'Testing' }]), 
                    {"dem": "http://a.example/dem#"})
            ).toBe('Testing');
        });
    });
    
});
