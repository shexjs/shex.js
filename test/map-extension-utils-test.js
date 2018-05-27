/**
 * File: map-extension-utils-test.js
 * Unit tests for extensions/shex-map/lib/extension-utils.js
 */

var chai = require('chai');
// var expect = chai.expect;
// var should = expect(chai)();

var _ = require('underscore');

var mapExtUtils = require('../extensions/shex-map/lib/extension-utils');

describe('Map extension utils', () => {

    test('should have the expected API', () => {
        expect(typeof mapExtUtils).toBe('object');
        expect(typeof mapExtUtils.collapseSpaces).toBe('function');
        expect(typeof mapExtUtils.unescapeMetaChars).toBe('function');
    });

    describe('#collapseSpaces', () => {
        test('should replace white space with a single space', () => {
            expect(mapExtUtils.collapseSpaces('  A   Test   String   ')).toBe(' A Test String ');
        });

        test('should not fail with empty string', () => {
            expect(mapExtUtils.collapseSpaces('')).toBe('');
        });
    });

    describe('#trimQuotes', () => {

        test('should return an undefined string with no change', () => { 
            expect( 
                mapExtUtils.trimQuotes(undefined)
            ).toBeUndefined();
        });

        test('should return an empty string with no change', () => { 
            expect( 
                mapExtUtils.trimQuotes('')
            ).toBe('');
        });

        test('should remove starting and trailing double quotes', () => {
            expect( 
                mapExtUtils.trimQuotes('"Test"')
            ).toBe('Test');
        });

        test('should remove starting and trailing single quotes', () => {
            expect( 
                mapExtUtils.trimQuotes("'Test'")
            ).toBe('Test');
        });

        test('should not remove mismatched quotes', () => {
            expect( 
                mapExtUtils.trimQuotes("'Test\"")
            ).toBe("'Test\"");
        });

        test('should not remove non-leading and non-trailing quotes', () => {
            expect( 
                mapExtUtils.trimQuotes("'Testing \"123\" for you'")
            ).toBe("Testing \"123\" for you");
        });
    });

    describe('#unescapeMetaChars', () => {
 
        test('should unescape meta characters', () => {
            expect(mapExtUtils.unescapeMetaChars('<http:\/\/a.example\/dem#family>')).toBe('<http://a.example/dem#family>');;
        });

        test('should not unescape regex characters', () => {
            expect(mapExtUtils.unescapeMetaChars('\\s*\\w.*')).toBe('\\s*\\w.*');;
        });
    });
});
