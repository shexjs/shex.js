/**
 * File: map-extension-utils-test.js
 * Unit tests for extensions/shex-map/lib/extension-utils.js
 */

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

var mapExtUtils = require("@shexjs/extension-map").utils;

describe('Map extension utils', function() {

    it('should have the expected API', function() {
        mapExtUtils.should.be.an('object');
        mapExtUtils.collapseSpaces.should.be.a('function');
        mapExtUtils.unescapeMetaChars.should.be.a('function');
    });

    describe('#collapseSpaces', function() {
        it('should replace white space with a single space', function() {
            expect(mapExtUtils.collapseSpaces('  A   Test   String   ')).to.equal(' A Test String ');
        });

        it('should not fail with empty string', function() {
            expect(mapExtUtils.collapseSpaces('')).to.equal('');
        });
    });

    describe('#trimQuotes', function() {

        it('should return an undefined string with no change', function() { 
            expect( 
                mapExtUtils.trimQuotes(undefined)
            ).to.be.undefined;
        });

        it('should return an empty string with no change', function() { 
            expect( 
                mapExtUtils.trimQuotes('')
            ).to.equal('');
        });

        it('should remove starting and trailing double quotes', function() {
            expect( 
                mapExtUtils.trimQuotes('"Test"')
            ).to.equal('Test');
        });

        it('should remove starting and trailing single quotes', function() {
            expect( 
                mapExtUtils.trimQuotes("'Test'")
            ).to.equal('Test');
        });

        it('should not remove mismatched quotes', function() {
            expect( 
                mapExtUtils.trimQuotes("'Test\"")
            ).to.equal("'Test\"");
        });

        it('should not remove non-leading and non-trailing quotes', function() {
            expect( 
                mapExtUtils.trimQuotes("'Testing \"123\" for you'")
            ).to.equal("Testing \"123\" for you");
        });
    });

    describe('#unescapeMetaChars', function() {
 
        it('should unescape meta characters', function() {
            expect(mapExtUtils.unescapeMetaChars('<http:\/\/a.example\/dem#family>')).to.equal('<http://a.example/dem#family>');;
        });

        it('should not unescape regex characters', function() {
            expect(mapExtUtils.unescapeMetaChars('\\s*\\w.*')).to.equal('\\s*\\w.*');;
        });
    });
});
