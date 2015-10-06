// **ShExLoader** return promise to load ShExC, ShExJ and N3 (Turtle) files.

var FS = require('fs');
var N3 = require('n3');
var turtleParser = N3.Parser();
var ShExUtil = require("../lib/ShExUtil");
var ShExParser = require("../lib/ShExParser").Parser;
var Request = require('request-promise'); 
var Promise = require('promise');

var Data = N3.Store();
var Schema = ShExUtil.emptySchema();

/* Helper function to read from filesystem or web.
 */
function load (list, cb) {
  return list.map(function (f, ord) {
    return f === "-" ?
      new Promise(function (fulfill, reject) {
        var inputChunks = [];

        //process.stdin.resume(); is old mode needed?
        process.stdin.setEncoding('utf8');

        process.stdin.on('data', function (chunk) {
          inputChunks.push(chunk);
        });

        process.stdin.on('end', function () {
          fulfill(cb(inputChunks.join("")));
        });

        process.stdin.on('error', function (e) {
          reject(e);
        });
      }) : (f.match("^[a-z]+://.")) ?
      // Read from http or whatever Request handles.
      Request(f).then(function (text) {
        return cb(text, f);
      }) :
      // Read from filesystem
      new Promise(function (fulfill, reject) {
        FS.readFile(f, "utf8", function (error, text) {
          if (error) {
            reject(error)
          } else {
            fulfill(cb(text, f));
          }
        })
      });
  });
}

/* LoadPromise - load shex and json files into a single Schema and turtle into
 * a graph (Data).
 */
function LoadPromise (shex, json, turtle) {
  return Promise.all([].
                     // gather all the potentially remote inputs
                     concat(load(shex, function (text, url) {
                       try {
                         var s = (new ShExParser(url)).parse(text);
                         Schema = ShExUtil.merge(Schema, s, true);
                         return Promise.resolve(["text/shex", url]);
                       } catch (e) {
                         return Promise.reject("error parsing ShEx " + url + ": " + e);
                       }
                     })).
                     concat(load(json, function (text, url) {
                       try {
                         var s = JSON.parse(text);
                         Schema = ShExUtil.merge(Schema, s, true);
                         return Promise.resolve(["text/json", url]);
                       } catch (e) {
                         return Promise.reject("error parsing JSON " + url + ": " + e);
                       }
                     })).
                     concat(load(turtle, function (text, url) {
                       return new Promise(function (resolve, reject) {
                         N3.Parser({documentIRI: url}).
                           parse(text,
                                 function (error, triple, prefixes) {
                                   if (error) {
                                     reject("error parsing " + url + ": " + error);
                                   } else if (triple) {
                                     Data.addTriple(triple)
                                   } else {
                                     resolve(["text/turtle", url]);
                                   }
                                 });
                       });
                     }))
                    ).then(function () { return { schema: Schema, data: Data }; });
}

// Expose ShExLoader, attaching all functions to it
if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = LoadPromise; // node environment
else
  ShExLoader = LoadPromise;
