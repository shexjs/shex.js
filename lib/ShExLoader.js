// **ShExLoader** return promise to load ShExC, ShExJ and N3 (Turtle) files.

var FS = require("fs");
var N3 = require("n3");
var ShExUtil = require("../lib/ShExUtil");
var ShExParser = require("../lib/ShExParser").Parser;
var Request = require("request-promise");
var Promise = require("promise");
var Path = require("path");
var Jsonld = require("jsonld");

/* Helper function to read from filesystem or web.
 */
function GET (f) {
  var m;
  return f === "-" ?
    new Promise(function (fulfill, reject) {
      var inputChunks = [];

      //process.stdin.resume(); is old mode needed?
      process.stdin.setEncoding("utf8");

      process.stdin.on("data", function (chunk) {
        inputChunks.push(chunk);
      });

      process.stdin.on("end", function () {
        fulfill({text: inputChunks.join(""), url: f});
      });

      process.stdin.on("error", function (e) {
        reject(e);
      });
    }) : (f.match("^[a-z]+://.") && !f.match("^file://.")) ?
    // Read from http or whatever Request handles.
    Request(f).then(function (text) {
      return {text: text, url: f};
    }) : (m = f.match("^data:([^,]+),(.*)$")) ?
    // Read from data: URL
    Promise.resolve({text: m[2], url: m[0]}) :
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
        fulfill({text: text, url: fileURLmatch ? f : "file://" + Path.resolve(process.cwd(), f)});
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
function LoadPromise (shex, json, turtle, jsonld, schemaOptions, dataOptions) {
  var returns = {
    schema: ShExUtil.emptySchema(),
    data: N3.Store(),
    schemaMeta: [],
    dataMeta: []
  }

  function add (src, metaList, mediaType, f, target, options) {
    return loadList(src, function (text, url) {
      var meta = {mediaType: mediaType, url: url, base: url, prefixes: {}};
      metaList.push(meta);
      return new Promise(function (resolve, reject) {
        f(resolve, reject, text, mediaType, url, target, meta, options);
      });
    })
  }

  return Promise.all([].
                     // gather all the potentially remote inputs
                     concat(add(shex, returns.schemaMeta,
                                "text/shex", parseShExC, returns.schema, schemaOptions)).
                     concat(add(json, returns.schemaMeta,
                                "text/json", parseShExJ, returns.schema, schemaOptions)).
                     concat(add(turtle, returns.dataMeta,
                                "text.turtle", parseTurtle, returns.data, dataOptions)).
                     concat(add(jsonld, returns.dataMeta,
                                "application/ld+json", parseJSONLD, returns.data, dataOptions))
                    ).then(function () { return returns; });
}

function parseShExC (resolve, reject, text, mediaType, url, schema, meta, schemaOptions) {
  try {
    var s = (new ShExParser(url, {}, schemaOptions)).parse(text);
    // !! horrible hack until I set a variable to know if there's a BASE.
    if (s.base === url) delete s.base;
    ShExUtil.merge(schema, s, true, true);
    meta.prefixes = schema.prefixes;
    meta.base = schema.base || meta.base;
    resolve([mediaType, url]);
  } catch (e) {
    var e2 = Error("error parsing ShEx " + url + ": " + e);
    e2.stack = e.stack;
    reject(e2);
  }
}

function parseShExJ (resolve, reject, text, mediaType, url, schema, meta, schemaOptions) {
  try {
    var s = JSON.parse(text);
    ShExUtil.merge(schema, s, true, true);
    meta.prefixes = schema.prefixes;
    meta.base = schema.base;
    resolve([mediaType, url]);
  } catch (e) {
    var e2 = Error("error parsing JSON " + url + ": " + e);
    e2.stack = e.stack;
    reject(e2);
  }
}

function parseTurtle (resolve, reject, text, mediaType, url, data, meta, dataOptions) {
  N3.Parser({documentIRI: url, blankNodePrefix: ""}).
    parse(text,
          function (error, triple, prefixes) {
            if (prefixes)
              meta.prefixes = prefixes;
              data.addPrefixes(prefixes);
            if (error) {
              reject("error parsing " + url + ": " + error);
            } else if (triple) {
              data.addTriple(triple)
            } else {
              meta.base = this._base;
              resolve([mediaType, url]);
            }
          });
}

function parseJSONLD (resolve, reject, text, mediaType, url, data, meta, dataOptions) {
  var struct = JSON.parse(text);
  Jsonld.toRDF(struct, {format: "application/nquads", base: url}, function (lderr, nquads) {
    if (lderr) {
      reject("error parsing JSON-ld " + url + ": " + lderr);
    } else {
      meta.prefixes = {}; // @@ take from @context?
      meta.base = url;    // @@ take from @context.base? (or vocab?)
      parseTurtle(resolve, reject, nquads, mediaType, url, data, meta);
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

// Expose ShExLoader, attaching all functions to it
if (typeof require !== "undefined" && typeof exports !== "undefined")
  module.exports = { load: LoadPromise, loadExtensions: LoadExtensions, GET: GET }; // node environment
else
  ShExLoader = LoadPromise;
