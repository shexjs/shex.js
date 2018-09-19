/**
 * File: map-extension-utils-test.js
 * Unit tests for extensions/shex-map/lib/extension-utils.js
 */

var _ = require('underscore');

var mapExtUtils = require('../extensions/shex-map/lib/extension-utils');

describe('Map extension utils', function() {

    it('should have the expected API', function() {
        expect(typeof mapExtUtils).toBe('object');
        expect(typeof mapExtUtils.collapseSpaces).toBe('function');
        expect(typeof mapExtUtils.unescapeMetaChars).toBe('function');
    });

    describe('#collapseSpaces', function() {
        it('should replace white space with a single space', function() {
            expect(mapExtUtils.collapseSpaces('  A   Test   String   ')).toBe(' A Test String ');
        });

        it('should not fail with empty string', function() {
            expect(mapExtUtils.collapseSpaces('')).toBe('');
        });
    });

    describe('#trimQuotes', function() {

        it('should return an undefined string with no change', function() { 
            expect( 
                mapExtUtils.trimQuotes(undefined)
            ).toBeUndefined();
        });

        it('should return an empty string with no change', function() { 
            expect( 
                mapExtUtils.trimQuotes('')
            ).toBe('');
        });

        it('should remove starting and trailing double quotes', function() {
            expect( 
                mapExtUtils.trimQuotes('"Test"')
            ).toBe('Test');
        });

        it('should remove starting and trailing single quotes', function() {
            expect( 
                mapExtUtils.trimQuotes("'Test'")
            ).toBe('Test');
        });

        it('should not remove mismatched quotes', function() {
            expect( 
                mapExtUtils.trimQuotes("'Test\"")
            ).toBe("'Test\"");
        });

        it('should not remove non-leading and non-trailing quotes', function() {
            expect( 
                mapExtUtils.trimQuotes("'Testing \"123\" for you'")
            ).toBe("Testing \"123\" for you");
        });
    });

    describe('#unescapeMetaChars', function() {
 
        it('should unescape meta characters', function() {
            expect(mapExtUtils.unescapeMetaChars('<http:\/\/a.example\/dem#family>')).toBe('<http://a.example/dem#family>');;
        });

        it('should not unescape regex characters', function() {
            expect(mapExtUtils.unescapeMetaChars('\\s*\\w.*')).toBe('\\s*\\w.*');;
        });
    });
});
