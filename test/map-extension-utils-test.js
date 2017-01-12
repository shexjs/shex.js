/**
 * File: map-extension-utils-test.js
 * Unit tests for extensions/shex-map/lib/extension-utils.js
 */

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

var _ = require('underscore');

var mapExtUtils = require('../extensions/shex-map/lib/extension-utils');

describe('Map extension utils', function() {

    it('should have the expected API', function() {
        mapExtUtils.should.be.an('object');
        mapExtUtils.applyPrefix.should.be.a('function');
        mapExtUtils.buildExpandedVars.should.be.a('function');
        mapExtUtils.collapseSpaces.should.be.a('function');
        mapExtUtils.unescapeMetaChars.should.be.a('function');
    });

    describe('#applyPrefix', function() {
        it('should throw an error if given a variable name not in format prefix:name', function() {
            var prefixes = {test: 'urn:local:test:'};
            expect(mapExtUtils.applyPrefix.bind(this, 'badtestvar', prefixes)).to.throw(Error,
                /variable "badtestvar" didn't match expected pattern!/);
        });

        it('should throw an error if cannot file prefix', function() {
            expect(mapExtUtils.applyPrefix.bind(this, 'test:string', {})).to.throw(Error,
                /Unknown prefix test in "test:string"!/);
        });

        it('should gracefully handle a non-prefixed variable name', function() {
            expect(mapExtUtils.applyPrefix('<testname>', {})).to.equal('testname');
        });

        it('should apply a prefix to expand a variable name', function() {
            var prefixes = {test: 'urn:local:test:'};
            expect(mapExtUtils.applyPrefix('test:string', prefixes)).to.equal('urn:local:test:string');
        });

        it('should apply a prefix to expand a variable name with an explicit URL', function() {
            var prefixes = {test: 'http://a.example/simple#'};
            expect(mapExtUtils.applyPrefix('test:string', prefixes)).to.equal('http://a.example/simple#string');
        });
    });

    describe('#collapseSpaces', function() {
        it('should replace white space with a single space', function() {
            expect(mapExtUtils.collapseSpaces('  A   Test   String   ')).to.equal(' A Test String ');
        });

        it('should not fail with empty string', function() {
            expect(mapExtUtils.collapseSpaces('')).to.equal('');
        });
    });

    describe('#buildExpandedVars', function() {

        it('should throw an error if given a non-conforming variable name', function() {
            expect(mapExtUtils.buildExpandedVars.bind(this, 
                '?<string>', [], { test:'urn:local:test#' })).to.throw(Error,
                    'variable "string" didn\'t match expected pattern!');
        });

        it('should get a complete, long urn variable name', function() {
            var vars = [];
            expect(mapExtUtils.buildExpandedVars('?<test:string>', vars, { test:'urn:local:test#' })).to.equal('urn:local:test#string');
            vars.should.deep.equal([ 'urn:local:test#string' ]);
        });

        it('should get a complete, long IRI variable name', function() {
            var vars= [];
            var prefixes = { testurn:'urn:local:test#',
                             testuri: 'http:\/\/a.example\/simple#' };
            expect(mapExtUtils.buildExpandedVars('?<testuri:string>', vars, prefixes)).to.equal('http://a.example/simple#string');
            vars.should.deep.equal([ 'http://a.example/simple#string' ]);
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
