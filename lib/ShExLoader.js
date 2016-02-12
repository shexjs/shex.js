// **ShExLoader** return promise to load ShExC, ShExJ and N3 (Turtle) files.

var FS = require('fs');
var N3 = require('n3');
var ShExUtil = require("../lib/ShExUtil");
var ShExParser = require("../lib/ShExParser").Parser;
var Request = require('request-promise'); 
var Promise = require('promise');
var Path = require('path');
var Jsonld = require("jsonld");

/* Helper function to read from filesystem or web.
 */
function GET (f) {
  return f === "-" ?
    new Promise(function (fulfill, reject) {
      var inputChunks = [];

      //process.stdin.resume(); is old mode needed?
      process.stdin.setEncoding('utf8');

      process.stdin.on('data', function (chunk) {
        inputChunks.push(chunk);
      });

      process.stdin.on('end', function () {
        fulfill({text: inputChunks.join(""), url: f});
      });

      process.stdin.on('error', function (e) {
        reject(e);
      });
    }) : (f.match("^[a-z]+://.") && !f.match("^file://.")) ?
    // Read from http or whatever Request handles.
    Request(f).then(function (text) {
      return {text: text, url: f};
    }) :
  // Read from filesystem
  new Promise(function (fulfill, reject) {
    var filename = f;
    var fileURLmatch = filename.match("^file://[^/]*(/.*)$");
    if (fileURLmatch) {
      filename = fileURLmatch[1];
    }
    FS.readFile(filename, "utf8", function (error, text) {
      if (error) {
        reject(error)
      } else {
        fulfill({text: text, url: fileURLmatch ? f : "file://" + Path.join(process.cwd(), f)});
      }
    })
  });
}

function loadList (list, done) {
  return list.map(function (p) {
    return GET(p).then(function (loaded) {
      return done(loaded.text, loaded.url);
    });
  });
}

/* LoadPromise - load shex and json files into a single Schema and turtle into
 * a graph (Data).
 */
function LoadPromise (shex, json, turtle, jsonld) {
  var returns = {
    schema: ShExUtil.emptySchema(),
    data: N3.Store(),
    schemaSources: [],
    dataSources: []
  }

  function add (src, sources, mediaType, f, target) {
    return loadList(src, function (text, url) {
                       sources.push({mediaType: mediaType, url: url});
                       return new Promise(function (resolve, reject) {
                         f(resolve, reject, text, mediaType, url, target);
                       });
                     })
  }

  return Promise.all([].
                     // gather all the potentially remote inputs
                     concat(add(shex, returns.schemaSources, "text/shex", parseShExC, returns.schema)).
                     concat(add(json, returns.schemaSources, "text/json", parseShExJ, returns.schema)).
                     concat(add(turtle, returns.dataSources, "text.turtle", parseTurtle, returns.data)).
                     concat(add(jsonld, returns.dataSources, "application/ld+json", parseJSONLD, returns.data))
                    ).then(function () { return returns; });
}

function parseShExC (resolve, reject, text, mediaType, url, schema) {
  try {
    var s = (new ShExParser(url)).parse(text);
    ShExUtil.merge(schema, s, true, true);
    resolve([mediaType, url]);
  } catch (e) {
    reject("error parsing ShEx " + url + ": " + e);
  }
}

function parseShExJ (resolve, reject, text, mediaType, url, schema) {
  try {
    var s = JSON.parse(text);
    returns.schema = ShExUtil.merge(returns.schema, s, true);
    resolve([mediaType, url]);
  } catch (e) {
    reject("error parsing JSON " + url + ": " + e);
  }
}

function parseTurtle (resolve, reject, text, mediaType, url, data) {
  N3.Parser({documentIRI: url, blankNodePrefix: ""}).
    parse(text,
          function (error, triple, prefixes) {
            if (error) {
              reject("error parsing " + url + ": " + error);
            } else if (triple) {
              data.addTriple(triple)
            } else {
              resolve([mediaType, url]);
            }
          });
}

function parseJSONLD (resolve, reject, text, mediaType, url, data) {
  var struct = JSON.parse(text);
  Jsonld.toRDF(struct, {format: 'application/nquads', base: url}, function (lderr, nquads) {
    if (lderr) {
      reject("error parsing JSON-ld " + url + ": " + lderr);
    } else {
      parseTurtle(resolve, reject, nquads, mediaType, url, data);
    }
  });
}

function LoadExtensions () {
  return FS.
    readdirSync(__dirname + "/../extensions").
    filter(function (s) { return s.indexOf(".js") !== -1; }).
    reduce(function (ret, module) {
      var t = require(__dirname + "/../extensions/" + module);
      ret[t.url] = t;
      return ret;
    }, {});
}

function LoadJSON (relative, toResolve) {
  var t = GET(relative, function (loaded) {
    try {
      var s = JSON.parse(loaded.text);
      returns.schema = ShExUtil.merge(returns.schema, s, true);
      returns.schemaSources.push({mediaType: "text/json", url: loaded.url});
      return Promise.resolve(["text/json", loaded.url]);
    } catch (e) {
      return Promise.reject("error parsing JSON " + loaded.url + ": " + e);
    }
  })
  return [ { json: [],
    options: {},
    shex: [ 'file:///tmp/t/t.shex' ],
    shape: 'http://www.w3.org/fhir-rdf-shapes/MedicationOrder',
    data: [ 'file:///tmp/t/t.ttl' ],
    node: 'file:///tmp/t/MedicationOrder/12345-67' } ]
}

// Expose ShExLoader, attaching all functions to it
if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = { load: LoadPromise, loadExtensions: LoadExtensions, GET: GET }; // node environment
else
  ShExLoader = LoadPromise;
