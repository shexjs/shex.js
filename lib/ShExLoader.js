// **ShExLoader** return promise to load ShExC, ShExJ and N3 (Turtle) files.

var LoadPromise = (function () {
var FS = require("fs");
var N3 = require("n3");
var ShExUtil = require("../lib/ShExUtil");
var ShExParser = require("../lib/ShExParser");
var Request = require("request-promise");
var Promise = require("promise");
var Path = require("path");
var Jsonld = require("jsonld");

/* Helper function to read from filesystem or web.
 */
function GET (f, mediaType) {
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
    myHttpRequest(f, mediaType) : (m = f.match("^data:([^,]+),(.*)$")) ?
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

  function myHttpRequest(f, mediaType) {
    if (typeof $ === "function") {
      // @@ browser hack -- what's the right thing to do here?
      return Promise.resolve($.ajax({
        accepts: {
          mycustomtype: 'text/shex,text/turtle,*/*'
        },
        url: f,
        dataType: "text"
      })).then(function (text) {
        return {text: text, url: f};
      }).catch(e => {
        throw "GET <" + f + "> failed: " + e.complete().status;
      });
    } else {
      return Request(mediaType ? {
        uri: f,
        headers: { Accept: mediaType }
      } : f).then(function (text) {
        return {text: text, url: f};
      });
    }
  }
}

function loadList (src, metaList, mediaType, parserWrapper, target, options, loadImports) {
  return src.map(function (p) {
    return typeof p === "object" ? mergeSchema(p) : loadParseMergeSchema(p);
  });

  function mergeSchema (obj) {
    var meta = addMeta(obj.url, mediaType);
    try {
      ShExUtil.merge(target, obj.schema, true, true);
      meta.prefixes = target.prefixes;
      meta.base = target.base;
      return Promise.resolve(loadImports(obj.schema)); // [mediaType, url]
    } catch (e) {
      var e2 = Error("error merging schema object " + obj.schema + ": " + e);
      e2.stack = e.stack;
      return Promise.reject(e2);
    }
  }

  function loadParseMergeSchema (p) {
    return GET(p, mediaType).then(function (loaded) {
      return new Promise(function (resolve, reject) {
        parserWrapper(resolve, reject, loaded.text, mediaType, loaded.url, target,
                      addMeta(loaded.url, mediaType), options, loadImports);
      });
    });
  }

  function addMeta (url, mediaType) {
    var meta = {
      mediaType: mediaType,
      url: url,
      base: url,
      prefixes: {}
    };
    metaList.push(meta);
    return meta;
  }
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
  };
  var promises = [];
  var schemasSeen = shex.concat(json);
  var transform = null;
  if (schemaOptions && "iriTransform" in schemaOptions) {
    transform = schemaOptions.iriTransform;
    delete schemaOptions.iriTransform;
  }

  var promiseScope = DynamicPromise();
  function loadImports (schema) {
    var rest = "imports" in schema ?
        schema.imports.
        map(function (i) {
          return transform ? transform(i) : i;
        }).
        filter(function (i) {
          return schemasSeen.indexOf(i) === -1;
        }) :
        [];
    return rest.length ? Promise.all(rest.map(i => {
      schemasSeen.push(i);
      return promiseScope.add(GET(i).then(function (loaded) {
        var meta = {
          // mediaType: mediaType,
          url: loaded.url,
          base: loaded.url,
          prefixes: {}
        };
        // metaList.push(meta);
        return new Promise(function (resolve, reject) {
          parseShExC(resolve, reject, loaded.text, "text/shex", loaded.url, returns.schema, meta, schemaOptions, loadImports);
        });
      }));
    })).then(a => {
      return null;
    }) : null;
  }

  // gather all the potentially remote inputs
  promises = promises.
    concat(loadList(shex, returns.schemaMeta, "text/shex",
                    parseShExC, returns.schema, schemaOptions, loadImports)).
    concat(loadList(json, returns.schemaMeta, "text/json",
                    parseShExJ, returns.schema, schemaOptions, loadImports)).
    concat(loadList(turtle, returns.dataMeta, "text/turtle",
                    parseTurtle, returns.data, dataOptions)).
    concat(loadList(jsonld, returns.dataMeta, "application/ld+json",
                    parseJSONLD, returns.data, dataOptions));
  return promiseScope.all(promises).then(function () {
    if (returns.schemaMeta.length > 0)
      ShExUtil.isWellDefined(returns.schema);
    return returns;
  });
}

function DynamicPromise () {
  var promises = [];
  var results = [];
  var completedPromises = 0;
  var resolve, reject;
  return {
    all: function (pz) {
      promises = pz;
      return new Promise(function (res, rej) {
        resolve = res; reject = rej;
        promises.forEach(function (promise, index) {
          // promises.push(promise);
          addThen(promise, index);
        });
      });
    },
    add: function (promise) {
      promises.push(promise);
      return addThen(promise, promises.length - 1);
    }
  };
  function addThen (promise, index) {
    promise.then(function (value) {
      results[index] = value;
      ++completedPromises;
      if(completedPromises === promises.length) {
        resolve(results);
      }
    }).catch(function (error) {
      reject(error);
    });
    return promise;
  }
}

function parseShExC (resolve, reject, text, mediaType, url, schema, meta, schemaOptions, loadImports) {
  var parser = schemaOptions && "parser" in schemaOptions ?
      schemaOptions.parser :
      ShExParser.construct(url, {}, schemaOptions);
  try {
    var s = parser.parse(text);
    // !! horrible hack until I set a variable to know if there's a BASE.
    if (s.base === url) delete s.base;
    ShExUtil.merge(schema, s, true, true);
    meta.prefixes = schema.prefixes;
    meta.base = schema.base || meta.base;
    resolve(loadImports(s)); // [mediaType, url]
  } catch (e) {
    var e2 = Error("error parsing ShEx " + url + ": " + e);
    e2.stack = e.stack;
    reject(e2);
  }
}

function loadShExImports_NotUsed (from, parser, transform) {
  var schemasSeen = [from];
  var ret = { type: "Schema" };
  return GET(from).then(loadImports).then(function () {
    ShExUtil.isWellDefined(ret);
    return ret;
  });
  function loadImports (loaded) {
    var schema = parser.parse(loaded.text);
    ShExUtil.merge(ret, schema, false, true);
    var rest = "imports" in schema ?
        schema.imports.
        map(function (i) {
          return transform ? transform(i) : i;
        }).
        filter(function (i) {
          return schemasSeen.indexOf(i) === -1;
        }) :
        [];
    return rest.length ? Promise.all(rest.map(i => {
      schemasSeen.push(i);
      return GET(i).then(loadImports);
    })).then(a => {
      return null;
    }) : null;
  }
}

function parseShExJ (resolve, reject, text, mediaType, url, schema, meta, schemaOptions, loadImports) {
  try {
    var s = ShExUtil.ShExJtoAS(JSON.parse(text));
    ShExUtil.merge(schema, s, true, true);
    meta.prefixes = schema.prefixes;
    meta.base = schema.base;
    resolve(loadImports(s)); // [mediaType, url]
  } catch (e) {
    var e2 = Error("error parsing JSON " + url + ": " + e);
    e2.stack = e.stack;
    reject(e2);
  }
}

function parseTurtle (resolve, reject, text, mediaType, url, data, meta, dataOptions) {
  N3.Parser({documentIRI: url, blankNodePrefix: "", format: "text/turtle"}).
    parse(text,
          function (error, triple, prefixes) {
            if (prefixes) {
              meta.prefixes = prefixes;
              data.addPrefixes(prefixes);
            }
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
    reduce(function (ret, moduleDir) {
      var path =__dirname + "/../extensions/" + moduleDir + "/module"
      try {
	var t = require(path);
	ret[t.url] = t;
	return ret;
      } catch (e) {
	console.warn("ShEx extension \"" + moduleDir + "\" not loadable: " + e);
	return ret;
      }
    }, {});
}

return { load: LoadPromise, loadExtensions: LoadExtensions, GET: GET, loadShExImports_NotUsed: loadShExImports_NotUsed };
})();

if (typeof require !== "undefined" && typeof exports !== "undefined")
  module.exports = LoadPromise;
