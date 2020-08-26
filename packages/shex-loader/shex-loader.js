// **ShExLoader** return promise to load ShExC, ShExJ and N3 (Turtle) files.

var LoadPromise = (function () {
var FS = require("fs");
var N3 = require("n3");
var ShEx = require("@shexjs/core");
var ShExUtil = ShEx.Util;
var ShExParser = require("@shexjs/parser");
var Request = require("request-promise");
// var Promise = require("promise");
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
    }) : (f.match("^(blob:)?[a-z]+://.") && !f.match("^file://.")) ?
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
    if (typeof fetch === "function") {
      return fetch(f, {
        headers: {
          'Accept': 'text/shex,text/turtle,*/*'
        }
      }).catch(() => {
        // DNS failure
        // no route to host
        // connection refused
        throw Error("GET <" + f + "> network failure");
      }).then(resp => {
        if (!resp.ok) {
          throw Error("GET <" + f + "> failed: " + resp.status + " " + resp.statusText);
        }
        return resp.text()
      }).then(text => {
        return {text: text, url: f};
      });
    } else if (typeof $ === "function") {
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
        throw Error("GET <" + f + "> failed: " + e.complete().status);
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
      meta._prefixes = target._prefixes || {};
      meta.base = target._base;
      loadImports(obj.schema);
      return Promise.resolve([mediaType, obj.url]);
    } catch (e) {
      var e2 = Error("error merging schema object " + obj.schema + ": " + e);
      e2.stack = e.stack;
      return Promise.reject(e2);
    }
  }

  function loadParseMergeSchema (p) {
    return GET(p, mediaType).then(function (loaded) {
      return parserWrapper(loaded.text, mediaType, loaded.url, target,
                           addMeta(loaded.url, mediaType), options, loadImports);
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
  function LoadPromise (shex, json, turtle, jsonld, schemaOptions = {}, dataOptions = {}) {
  var returns = {
    schema: ShExUtil.emptySchema(),
    data: new N3.Store(),
    schemaMeta: [],
    dataMeta: []
  };
  var promises = [];
  var schemasSeen = shex.concat(json).map(p => {
    // might be already loaded objects with a url property.
    return typeof p === "object" ? p.url : p;
  });
  var transform = null;
  if (schemaOptions && "iriTransform" in schemaOptions) {
    transform = schemaOptions.iriTransform;
    delete schemaOptions.iriTransform;
  }

  var allLoaded = DynamicPromise();
  function loadImports (schema) {
    if (!("imports" in schema))
      return schema;
    if (schemaOptions.keepImports) {
      return schema;
    }
    var ret = Object.assign({}, schema);
    var imports = ret.imports;
    delete ret.imports;
    schema.imports.map(function (i) {
      return transform ? transform(i) : i;
    }).filter(function (i) {
      return schemasSeen.indexOf(i) === -1;
    }).map(i => {
      schemasSeen.push(i);
      allLoaded.add(GET(i).then(function (loaded) {
        var meta = {
          // mediaType: mediaType,
          url: loaded.url,
          base: loaded.url,
          prefixes: {}
        };
        // metaList.push(meta);
        return parseShExC(loaded.text, "text/shex", loaded.url,
                          returns.schema, meta, schemaOptions, loadImports);
      })); // addAfter would be after invoking schema.
    });
    return ret;
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
  return allLoaded.all(promises).then(function (resources) {
    if (returns.schemaMeta.length > 0)
      ShExUtil.isWellDefined(returns.schema);
    return returns;
  });
}

function DynamicPromise () {
  var promises = [];
  var results = [];
  var completedPromises = 0;
  var resolveSelf, rejectSelf;
  var self = new Promise(function (resolve, reject) {
    resolveSelf = resolve; rejectSelf = reject;
  });
  self.all = function (pz) {
    pz.forEach(function (promise, index) {
      promises.push(promise);
      addThen(promise, index);
    });
    return self;
  };
  self.add = function (promise) {
    promises.push(promise);
    addThen(promise, promises.length - 1);
    return self;
  }
  return self;

  function addThen (promise, index) {
    promise.then(function (value) {
      results[index] = value;
      ++completedPromises;
      if(completedPromises === promises.length) {
        resolveSelf(results);
      }
    }).catch(function (error) {
      rejectSelf(error);
    });
  }
}

function parseShExC (text, mediaType, url, schema, meta, schemaOptions, loadImports) {
  var parser = schemaOptions && "parser" in schemaOptions ?
      schemaOptions.parser :
      ShExParser.construct(url, {}, schemaOptions);
  try {
    var s = parser.parse(text);
    // !! horrible hack until I set a variable to know if there's a BASE.
    if (s.base === url) delete s.base;
    meta.prefixes = s._prefixes || {};
    meta.base = s._base || meta.base;
    ShExUtil.merge(schema, loadImports(s), false, true);
    return Promise.resolve([mediaType, url]);
  } catch (e) {
    e.message = "error parsing ShEx " + url + ": " + e.message;
    return Promise.reject(e);
  }
}

function loadShExImports_NotUsed (from, parser, transform) {
  var schemasSeen = [from];
  var ret = { type: "Schema" };
  return GET(from).then(load999Imports).then(function () {
    ShExUtil.isWellDefined(ret);
    return ret;
  });
  function load999Imports (loaded) {
    var schema = parser.parse(loaded.text);
    var imports = schema.imports;
    delete schema.imports;
    ShExUtil.merge(ret, schema, false, true);
    if (imports) {
      var rest = imports
          .map(function (i) {
            return transform ? transform(i) : i;
          }).
          filter(function (i) {
            return schemasSeen.indexOf(i) === -1;
          });
      return Promise.all(rest.map(i => {
        schemasSeen.push(i);
        return GET(i).then(load999Imports);
      })).then(a => {
        return null;
      });
    } else {
      return null
    }
  }
}

function parseShExJ (text, mediaType, url, schema, meta, schemaOptions, loadImports) {
  try {
    var s = ShExUtil.ShExJtoAS(JSON.parse(text));
    ShExUtil.merge(schema, s, true, true);
    meta.prefixes = schema._prefixes;
    meta.base = schema.base;
    loadImports(s);
    return Promise.resolve([mediaType, url]);
  } catch (e) {
    var e2 = Error("error parsing JSON " + url + ": " + e);
    // e2.stack = e.stack;
    return Promise.reject(e2);
  }
}

function parseTurtle (text, mediaType, url, data, meta, dataOptions) {
  return new Promise(function (resolve, reject) {
  new N3.Parser({baseIRI: url, blankNodePrefix: "", format: "text/turtle"}).
    parse(text,
          function (error, triple, prefixes) {
            if (prefixes) {
              meta.prefixes = prefixes;
              // data.addPrefixes(prefixes);
            }
            if (error) {
              reject("error parsing " + url + ": " + error);
            } else if (triple) {
              data.addQuad(triple)
            } else {
              meta.base = this._base;
              resolve([mediaType, url]);
            }
          });
  });
}

/* parseTurtle999 - a variant of parseTurtle with no callback.
 * so, which is "better"?
 */
function parseTurtle999 (text, mediaType, url, data, meta, dataOptions) {
  try {
    var p = new N3.Parser({baseIRI: url, blankNodePrefix: "", format: "text/turtle"});
    var triples = p.parse(text);
    meta.prefixes = p._prefixes;
    meta.base = p._base;
    data.addPrefixes(p._prefixes);
    data.addTriples(triples);
    return Promise.resolve([mediaType, url]);
  } catch (e) {
    return Promise.reject(Error("error parsing " + url + ": " + e));
  }
}

function parseJSONLD (text, mediaType, url, data, meta, dataOptions) {
  return new Promise(function (resolve, reject) {
  var struct = JSON.parse(text);
  Jsonld.toRDF(struct, {format: "application/nquads", base: url}, function (lderr, nquads) {
    if (lderr) {
      reject("error parsing JSON-ld " + url + ": " + lderr);
    } else {
      meta.prefixes = {}; // @@ take from @context?
      meta.base = url;    // @@ take from @context.base? (or vocab?)
      resolve(parseTurtle(nquads, mediaType, url, data, meta));
    }
  });
  });
}

function LoadExtensions (globs) {
  return globs.reduce(
    (list, glob) =>
      list.concat(require("glob").glob.sync(glob))
    , []).
    reduce(function (ret, path) {
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
