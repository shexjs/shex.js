// shex-simple - Simple ShEx2 validator for HTML.
// Copyright 2017 Eric Prud'hommeux
// Release under MIT License.

const USE_INCREMENTAL_RESULTS = true;
const ShEx = ShExWebApp; // @@ rename globally
ShEx.ShapeMap.start = ShEx.Validator.start
const START_SHAPE_LABEL = "START";
const START_SHAPE_INDEX_ENTRY = "- start -"; // specificially not a JSON-LD @id form.
const INPUTAREA_TIMEOUT = 250;
const NO_MANIFEST_LOADED = "no manifest loaded";
var LOG_PROGRESS = false;
const EXTENSION_sparql = "http://www.w3.org/ns/shex#Extensions-sparql";
const SPARQL_get_items_limit = 50;
const MENU_ITEM_materialize = "- materialize -"

var DefaultBase = location.origin + location.pathname;

var Caches = {};
Caches.inputSchema = makeSchemaCache($("#inputSchema textarea.schema"));
Caches.inputMeta = makeTurtleCache($("#meta textarea"));
Caches.inputData = makeTurtleCache($("#inputData textarea"));
Caches.manifest = makeManifestCache($("#manifestDrop"));
Caches.shapeMap = makeShapeMapCache($("#textMap")); // @@ rename to #shapeMap
var ShExRSchema; // defined below

const ParseTriplePattern = (function () {
  const uri = "<[^>]*>|[a-zA-Z0-9_-]*:[a-zA-Z0-9_-]*";
  const literal = "((?:" +
        "'(?:[^'\\\\]|\\\\')*'" + "|" +
        "\"(?:[^\"\\\\]|\\\\\")*\"" + "|" +
        "'''(?:(?:'|'')?[^'\\\\]|\\\\')*'''" + "|" +
        "\"\"\"(?:(?:\"|\"\")?[^\"\\\\]|\\\\\")*\"\"\"" +
        ")" +
        "(?:@[a-zA-Z-]+|\\^\\^(?:" + uri + "))?)";
  const uriOrKey = uri + "|FOCUS|_";
  // const termOrKey = uri + "|" + literal + "|FOCUS|_";

  return "(\\s*{\\s*)("+
    uriOrKey+")?(\\s*)("+
    uri+"|a)?(\\s*)("+
    uriOrKey+"|" + literal + ")?(\\s*)(})?(\\s*)";
})();

var Getables = [
  {queryStringParm: "schema",       location: Caches.inputSchema.selection, cache: Caches.inputSchema},
  {queryStringParm: "data",         location: Caches.inputData.selection,   cache: Caches.inputData  },
  {queryStringParm: "manifest",     location: Caches.manifest.selection,    cache: Caches.manifest   , fail: e => $("#manifestDrop li").text(NO_MANIFEST_LOADED)},
  {queryStringParm: "shape-map",    location: $("#textMap"),                cache: Caches.shapeMap   },
  {queryStringParm: "meta",         location: Caches.inputMeta.selection,   cache: Caches.inputMeta  },
];

var QueryParams = Getables.concat([
  {queryStringParm: "interface",    location: $("#interface"),       deflt: "table"     },
  {queryStringParm: "regexpEngine", location: $("#regexpEngine"),    deflt: "threaded-val-nerr" },
]);

// utility functions
function parseTurtle (text, meta, base) {
  var ret = new ShEx.N3.Store();
  ShEx.N3.Parser._resetBlankNodeIds();
  var parser = new ShEx.N3.Parser({baseIRI: base, format: "text/turtle" });
  var quads = parser.parse(text);
  if (quads !== undefined)
    ret.addQuads(quads);
  meta.base = parser._base;
  meta.prefixes = parser._prefixes;
  return ret;
}

var shexParser = ShEx.Parser.construct(DefaultBase, null, {index: true});
function parseShEx (text, meta, base) {
  $("#schemaDialect").text(Caches.inputSchema.language);
  var resolverText = $("#meta textarea").val();
  if (resolverText) {
    var resolverStore = new ShEx.N3.Store();
    shexParser._setTermResolver(ShEx.Parser.dbTermResolver(resolverStore));
    resolverStore.addQuads(new ShEx.N3.Parser({baseIRI:DefaultBase}).parse(resolverText));
  } else {
    shexParser._setTermResolver(ShEx.Parser.disabledTermResolver());
  }

  shexParser._setOptions({duplicateShape: $("#duplicateShape").val()});
  shexParser._setBase(base);
  var ret = shexParser.parse(text);
  // ret = ShEx.Util.canonicalize(ret, DefaultBase);
  meta.base = ret._base; // base set above.
  meta.prefixes = ret._prefixes || {}; // @@ revisit after separating shexj from meta and indexes
  return ret;
}

function sum (s) { // cheap way to identify identical strings
  return s.replace(/\s/g, "").split("").reduce(function (a,b){
    a = ((a<<5) - a) + b.charCodeAt(0);
    return a&a
  },0);
}

// <n3.js-specific>
function rdflib_termToLex (node, resolver) {
  if (node === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
    return "a";
  if (node === ShEx.Validator.start)
    return START_SHAPE_LABEL;
  if (node === resolver._base)
    return "<>";
  if (node.indexOf(resolver._base) === 0/* &&
      ['#', '?'].indexOf(node.substr(resolver._base.length)) !== -1 */)
    return "<" + node.substr(resolver._base.length) + ">";
  if (node.indexOf(resolver._basePath) === 0 &&
      ['#', '?', '/', '\\'].indexOf(node.substr(resolver._basePath.length)) === -1)
    return "<" + node.substr(resolver._basePath.length) + ">";
  return ShEx.RdfTerm.intermalTermToTurtle(node, resolver.meta.base, resolver.meta.prefixes);
}
function rdflib_lexToTerm (lex, resolver) {
  return lex === START_SHAPE_LABEL ? ShEx.Validator.start :
    lex === "a" ? "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" :
    new ShEx.N3.Lexer().tokenize(lex + " ") // need " " to parse "chat"@en
    .map(token => {
    var left = 
          token.type === "typeIRI" ? "^^" :
          token.type === "langcode" ? "@" :
          token.type === "type" ? "^^" + resolver.meta.prefixes[token.prefix] :
          token.type === "prefixed" ? resolver.meta.prefixes[token.prefix] :
          token.type === "blank" ? "_:" :
          "";
    var right = token.type === "IRI" || token.type === "typeIRI" ?
          resolver._resolveAbsoluteIRI(token) :
          token.value;
    return left + right;
  }).join("");
  return lex === ShEx.Validator.start ? lex : lex[0] === "<" ? lex.substr(1, lex.length - 2) : lex;
}
// </n3.js-specific>


// caches for textarea parsers
function _makeCache (selection) {
  var _dirty = true;
  var resolver;
  var ret = {
    selection: selection,
    parsed: null,
    meta: { prefixes: {}, base: DefaultBase },
    dirty: function (newVal) {
      var ret = _dirty;
      _dirty = newVal;
      return ret;
    },
    get: function () {
      return selection.val();
    },
    set: function (text, base) {
      _dirty = true;
      selection.val(text);
      this.meta.base = base;
      if (base !== DefaultBase) {
        this.url = base; // @@crappyHack1 -- parms should differntiate:
        // working base: base for URL resolution.
        // loaded base: place where you can GET current doc.
        // Note that Caches.manifest.set takes a 3rd parm.
      }
    },
    refresh: function () {
      if (!_dirty)
        return this.parsed;
      this.parsed = this.parse(selection.val(), this.meta.base);
      resolver._setBase(this.meta.base);
      _dirty = false;
      return this.parsed;
    },
    asyncGet: function (url) {
      var _cache = this;
      return new Promise(function (resolve, reject) {
        $.ajax({
          accepts: {
            mycustomtype: 'text/shex,text/turtle,*/*'
          },
          url: url,
          cache: false, // force reload
          dataType: "text"
        }).fail(function (jqXHR, textStatus) {
          var error = jqXHR.statusText === "OK" ? textStatus : jqXHR.statusText;
          reject(Error("GET <" + url + "> failed: " + error));
        }).done(function (data) {
          try {
            _cache.meta.base = url;
            resolver._setBase(url);
            _cache.set(data, url);
            $("#loadForm").dialog("close");
            toggleControls();
            resolve({ url: url, data: data });
          } catch (e) {
            reject(Error("unable to " + (e.action || "evaluate") + " <" + url + ">: " + '\n' + e.message));
          }
        });
      });
    },
    url: undefined // only set if inputarea caches some web resource.
  };
  resolver = new IRIResolver(ret.meta);
  ret.meta.termToLex = function (trm) { return  rdflib_termToLex(trm, resolver); };
  ret.meta.lexToTerm = function (lex) { return  rdflib_lexToTerm(lex, resolver); };
  return ret;
}

function makeSchemaCache (selection) {
  var ret = _makeCache(selection);
  var graph = null;
  ret.language = null;
  ret.parse = function (text, base) {
    var isJSON = text.match(/^\s*\{/);
    graph = isJSON ? null : tryN3(text);
    this.language =
      isJSON ? "ShExJ" :
      graph ? "ShExR" :
      "ShExC";
    $("#results .status").text("parsing "+this.language+" schema...").show();
    var schema =
          isJSON ? ShEx.Util.ShExJtoAS(JSON.parse(text)) :
          graph ? parseShExR() :
          parseShEx(text, ret.meta, base);
    $("#results .status").hide();
    return schema;

    function tryN3 (text) {
      try {
        if (text.match(/^\s*$/))
          return null;
        var db = parseTurtle (text, ret.meta, DefaultBase); // interpret empty schema as ShExC
        if (db.getQuads().length === 0)
          return null;
        return db;
      } catch (e) {
        return null;
      }
    }

    function parseShExR () {
      var graphParser = ShEx.Validator.construct(
        parseShEx(ShExRSchema, {}, base), // !! do something useful with the meta parm (prefixes and base)
        {}
      );
      var schemaRoot = graph.getQuads(null, ShEx.Util.RDF.type, "http://www.w3.org/ns/shex#Schema")[0].subject; // !!check
      var val = graphParser.validate(ShEx.Util.makeN3DB(graph), schemaRoot, ShEx.Validator.start); // start shape
      return ShEx.Util.ShExJtoAS(ShEx.Util.ShExRtoShExJ(ShEx.Util.valuesToSchema(ShEx.Util.valToValues(val))));
    }
  };
  ret.getItems = function () {
    var obj = this.refresh();
    var start = "start" in obj ? [START_SHAPE_LABEL] : [];
    var rest = "shapes" in obj ? obj.shapes.map(se => Caches.inputSchema.meta.termToLex(se.id)) : [];
    return start.concat(rest);
  };
  return ret;
}

function makeTurtleCache (selection) {
  var ret = _makeCache(selection);
  // ret.endpoint = null,
  // ret.query = null,
  ret.parse = function (text, base) {
    var text = Caches.inputData.get();
    var m = text.match(/^[\s]*Endpoint:[\s]*(https?:\/\/.*?)[\s]*$/i);
    if (m) {
      ret.endpoint = m[1];
      if ($("#slurp").length === 0) {
        // Add a #slurp checkbox
        $("#load-data-button").append(
          $("<span/>", {id: "slurpSpan",
                        style: "float:right",
                        title: "fill data pane with data queried from <" + Caches.inputData.endpoint + ">"})
            .append(
              $("<input/>", {id: "slurp", type: "checkbox"}),
              $("<label/>", {for: "slurp"}).text("slurp")
            ).on("click", () => {
              // HACK: disable propagation and toggle after handler is done.
              setTimeout(() => {
                $("#slurp").prop("checked", !$("#slurp").prop("checked"));
              }, 0);
              return false; // don't pass to load data button
            })
        );
      }
    } else {
      delete ret.endpoint; // make sure it's not set
      $("#slurpSpan").remove();
    }
    if (ret.endpoint) {
      return ShEx.Util.makeQueryDB(ret.endpoint,
                                   $("#slurp").is(":checked") ? queryTracker() : null);
    }
    return ShEx.Util.makeN3DB(parseTurtle(text, ret.meta, base));
  };
  ret.getItems = function () {
    var m = this.get().match(/^[\s]*Endpoint:[\s]*(https?:\/\/.*?)[\s]*$/i);
    if (m) {
      var q = "SELECT DISTINCT ?s { ?s ?p ?o } LIMIT " + SPARQL_get_items_limit;
      return [MENU_ITEM_materialize]
        .concat(ShEx.Util.executeQuery(q, m[1]).map(lexifyFirstColumn));
    } else {
      var data = this.refresh();
      return data.getQuads().map(t => {
        return Caches.inputData.meta.termToLex(t.subject); // !!check
      });
    }
  };
  return ret;
}

function makeManifestCache (selection) {
  var ret = _makeCache(selection);
  ret.set = function (textOrObj, url, source) {
    $("#inputSchema .manifest li").remove();
    $("#inputData .passes li, #inputData .fails li").remove();
    if (typeof textOrObj !== "object") {
      if (url !== DefaultBase) {
        this.url = url; // @@crappyHack1 -- parms should differntiate:
      }
      try {
        // exceptions pass through to caller (asyncGet)
        textOrObj = JSON.parse(textOrObj);
      } catch (e) {
        $("#inputSchema .manifest").append($("<li/>").text(NO_MANIFEST_LOADED));
        var throwMe = Error(e + '\n' + textOrObj);
        throwMe.action = 'load manifest'
        throw throwMe
        // @@DELME(2017-12-29)
        // transform deprecated examples.js structure
        // textOrObj = eval(textOrObj).reduce(function (acc, schema) {
        //   function x (data, status) {
        //     return Object.assign({
        //       schemaLabel: schema.name,
        //       schema: schema.schema,
        //       dataLabel: data.name,
        //       data: data.data,
        //       queryMap: data.queryMap,
        //       status: status
        //     }, "meta" in schema ? { meta: schema.meta } : { } );
        //   }
        //   return acc.concat(
        //     schema.passes.map(data => x(data, "conformant")),
        //     schema.fails.map(data => x(data, "nonconformant"))
        //   );
        // }, []);
      }
    }
    if (textOrObj.constructor !== Array)
      textOrObj = [textOrObj];
    var demos = textOrObj.reduce((acc, elt) => {
      if ("action" in elt) {
        // compatibility with test suite structure.
        var action = elt.action;
        var schemaLabel = action.schemaURL.substr(action.schemaURL.lastIndexOf('/')+1);
        var dataLabel = elt["@id"];
        var match = null;
        var emptyGraph = "-- empty graph --";
        if ("comment" in elt) {
          if ((match = elt.comment.match(/^(.*?) \/ { (.*?) }$/))) {
            schemaLabel = match[1]; dataLabel = match[2] || emptyGraph;
          } else if ((match = elt.comment.match(/^(.*?) on { (.*?) }$/))) {
            schemaLabel = match[1]; dataLabel = match[2] || emptyGraph;
          } else if ((match = elt.comment.match(/^(.*?) as { (.*?) }$/))) {
            schemaLabel = match[2]; dataLabel = match[1] || emptyGraph;
          }
        }
        var queryMap = "map" in action ?
            null :
            ldToTurtle(action.focus, Caches.inputData.meta.termToLex) + "@" + ("shape" in action ? ldToTurtle(action.shape, Caches.inputSchema.meta.termToLex) : START_SHAPE_LABEL);
        var queryMapURL = "map" in action ?
            action.map :
            null;
        elt = Object.assign(
          {
            schemaLabel: schemaLabel,
            schema: action.schema,
            schemaURL: action.schemaURL || url,
            // dataLabel: "comment" in elt ? elt.comment : (queryMap || dataURL),
            dataLabel: dataLabel,
            data: action.data,
            dataURL: action.dataURL || DefaultBase
          },
          (queryMap ? { queryMap: queryMap } : { queryMapURL: queryMapURL }),
          { status: elt["@type"] === "sht:ValidationFailure" ? "nonconformant" : "conformant" }
        );
        if ("termResolver" in action || "termResolverURL" in action) {
          elt.meta = action.termResolver;
          elt.metaURL = action.termResolverURL || DefaultBase;
        }
      }
      ["schemaURL", "dataURL", "queryMapURL"].forEach(parm => {
        if (parm in elt) {
          elt[parm] = new URL(elt[parm], new URL(url, DefaultBase).href).href;
        } else {
          delete elt[parm];
        }
      });
      return acc.concat(elt);
    }, []);
    prepareManifest(demos, url);
    $("#manifestDrop").show(); // may have been hidden if no manifest loaded.
  };
  ret.parse = function (text, base) {
    throw Error("should not try to parse manifest cache");
  };
  ret.getItems = function () {
    throw Error("should not try to get manifest cache items");
  };
  return ret;

        function maybeGET(obj, base, key, accept) { // !!not used
          if (obj[key] != null) {
            // Take the passed data, guess base if not provided.
            if (!(key + "URL" in obj))
              obj[key + "URL"] = base;
            obj[key] = Promise.resolve(obj[key]);
          } else if (key + "URL" in obj) {
            // absolutize the URL
            obj[key + "URL"] = ret.meta.lexToTerm("<"+obj[key + "URL"]+">");
            // Load the remote resource.
            obj[key] = new Promise((resolve, reject) => {
              $.ajax({
                accepts: {
                  mycustomtype: accept
                },
                url: ret.meta.lexToTerm("<"+obj[key + "URL"]+">"),
                dataType: "text"
              }).then(text => {
                resolve(text);
              }).fail(e => {
                results.append($("<pre/>").text(
                  "Error " + e.status + " " + e.statusText + " on GET " + obj[key + "URL"]
                ).addClass("error"));
                reject(e);
              });
            });
          } else {
            // Ignore this parameter.
            obj[key] = Promise.resolve(obj[key]);
          }
        }
}


        function ldToTurtle (ld, termToLex) {
          return typeof ld === "object" ? lit(ld) : termToLex(ld);
          function lit (o) {
            let ret = "\""+o["@value"].replace(/["\r\n\t]/g, (c) => {
              return {'"': "\\\"", "\r": "\\r", "\n": "\\n", "\t": "\\t"}[c];
            }) +"\"";
            if ("@type" in o)
              ret += "^^<" + o["@type"] + ">";
            if ("@language" in o)
              ret += "@" + o["@language"];
            return ret;
          }
        }

function makeShapeMapCache (selection) {
  var ret = _makeCache(selection);
  ret.parse = function (text) {
    removeEditMapPair(null);
    $("#textMap").val(text);
    copyTextMapToEditMap();
    copyEditMapToFixedMap();
  };
  // ret.parse = function (text, base) {  };
  ret.getItems = function () {
    throw Error("should not try to get manifest cache items");
  };
  return ret;
}

// controls for manifest buttons
function paintManifest (selector, list, func, listItems, side) {
  $(selector).empty();
  list.forEach(entry => {
    var button = $("<button/>").text("..." + entry.label.substr(3)).attr("disabled", "disabled");
    var li = $("<li/>").append(button);
    $(selector).append(li);
    if (entry.text === undefined) {
      fetchOK(entry.url).catch(responseOrError => {
        // leave a message in the schema or data block
        return "# " + renderErrorMessage(
          responseOrError instanceof Error
            ? { url: entry.url, status: -1, statusText: responseOrError.message }
          : responseOrError,
          side);
      }).then(schemaLoaded);
    } else {
      schemaLoaded(entry.text);
    }
    function schemaLoaded (text) {
      entry.text = text;
      li.on("click", () => {
        func(entry.name, entry, li, listItems, side);
      });
      listItems[side][sum(text)] = li;
      button.text(entry.label).removeAttr("disabled");
    }
  });
}

function fetchOK (url) {
  return fetch(url).then(responseOrError => {
    if (!responseOrError.ok) {
      throw responseOrError;
    }
    return responseOrError.text()
  });
}

function renderErrorMessage (response, what) {
  var message = "failed to load " + "queryMap" + " from <" + response.url + ">, got: " + response.status + " " + response.statusText;
  results.append($("<pre/>").text(message).addClass("error"));
  return message;
}

function clearData () {
  // Clear out data textarea.
  Caches.inputData.set("", DefaultBase);
  $("#inputData .status").text(" ");

  // Clear out every form of ShapeMap.
  $("#textMap").val("").removeClass("error");
  makeFreshEditMap();
  $("#fixedMap").empty();

  results.clear();
  delete Caches.inputData.endpoint;

  // Clear out every form of ShapeMap.
  $("#textMap").val("").removeClass("error");
  makeFreshEditMap();
  $("#fixedMap").empty();

  results.clear();
}

function clearAll () {
  $("#results .status").hide();
  Caches.inputSchema.set("", DefaultBase);
  Caches.inputMeta.set("", DefaultBase);
  $(".inputShape").val("");
  $("#inputSchema .status").text(" ");
  $("#inputSchema li.selected").removeClass("selected");
  clearData();
  $("#inputData .passes, #inputData .fails").hide();
  $("#inputData .passes p:first").text("");
  $("#inputData .fails p:first").text("");
  $("#inputData .passes ul, #inputData .fails ul").empty();
}

function pickSchema (name, schemaTest, elt, listItems, side) {
  if ($(elt).hasClass("selected")) {
    clearAll();
  } else {
    Caches.inputSchema.set(schemaTest.text, new URL((schemaTest.url || ""), DefaultBase).href);
    Caches.inputSchema.url = undefined; // @@ crappyHack1
    $("#inputSchema .status").text(name);

    var hasMeta = "meta" in schemaTest && schemaTest.meta.length > 0;
    Caches.inputMeta.set(hasMeta ? schemaTest.meta : "");
    $("#showMeta").prop("checked", hasMeta);
    revealMetaPane();

    clearData();
    var headings = {
      "passes": "Passing:",
      "fails": "Failing:",
      "indeterminant": "Data:"
    };
    Object.keys(headings).forEach(function (key) {
      if (key in schemaTest) {
        $("#inputData ." + key + "").show();
        $("#inputData ." + key + " p:first").text(headings[key]);
        paintManifest("#inputData ." + key + " ul", schemaTest[key], pickData, listItems, "inputData");
      } else {
        $("#inputData ." + key + " ul").empty();
      }
    });

    $("#inputSchema li.selected").removeClass("selected");
    $(elt).addClass("selected");
    try {
      Caches.inputSchema.refresh();
    } catch (e) {
      failMessage(e, "parsing schema");
    }
  }
}

function pickData (name, dataTest, elt, listItems, side) {
  clearData();
  if ($(elt).hasClass("selected")) {
    $(elt).removeClass("selected");
  } else {
    // Update data pane.
    Caches.inputData.set(dataTest.text, new URL((dataTest.url || ""), DefaultBase).href);
    Caches.inputData.url = undefined; // @@ crappyHack1
    $("#inputData .status").text(name);
    $("#inputData li.selected").removeClass("selected");
    $(elt).addClass("selected");
    try {
      Caches.inputData.refresh();
    } catch (e) {
      failMessage(e, "parsing data");
    }

    // Update ShapeMap pane.
    removeEditMapPair(null);
    if (dataTest.entry.queryMap === undefined) {
      fetchOK(dataTest.entry.queryMapURL).then(queryMapLoaded).catch(response => {
        renderErrorMessage(response, "queryMap");
      });
    } else {
      queryMapLoaded(dataTest.entry.queryMap);
    }

    function queryMapLoaded (text) {
      dataTest.entry.queryMap = text;
      try {
        $("#textMap").val(JSON.parse(dataTest.entry.queryMap).map(entry => `<${entry.node}>@<${entry.shape}>`).join(",\n"));
      } catch (e) {
        $("#textMap").val(dataTest.entry.queryMap);
      }
      copyTextMapToEditMap();
      // callValidator();
    }
  }
}


// Control results area content.
var results = (function () {
  var resultsElt = document.querySelector("#results div");
  var resultsSel = $("#results div");
  return {
    replace: function (text) {
      return resultsSel.text(text);
    },
    append: function (text) {
      return resultsSel.append(text);
    },
    clear: function () {
      resultsSel.removeClass("passes fails error");
      $("#results .status").text("").hide();
      $("#shapeMap-tabs").removeAttr("title");
      return resultsSel.text("");
    },
    start: function () {
      resultsSel.removeClass("passes fails error");
      $("#results").addClass("running");
    },
    finish: function () {
      $("#results").removeClass("running");
      var height = resultsSel.height();
      resultsSel.height(1);
      resultsSel.animate({height:height}, 100);
    },
    text: function () {
      return $(resultsElt).text();
    }
  };
})();


// Validation UI
function disableResultsAndValidate (evt, done) {
  if (new Date().getTime() - LastFailTime < 100) {
    results.append(
      $("<div/>").addClass("warning").append(
        $("<h2/>").text("see shape map errors above"),
        $("<button/>").append(
          $("<span/>").addClass("validate-label").text("validate"),
          " (ctl-enter)"
        ).on("click", disableResultsAndValidate),
        " again to continue."
      )
    );
    return; // return if < 100ms since last error.
  }
  results.clear();
  results.start();
  setTimeout(function () {
    copyEditMapToTextMap(); // will update if #editMap is dirty
    callValidator(done);
  }, 0);
}

function hasFocusNode () {
  return $(".focus").map((idx, elt) => {
    return $(elt).val();
  }).get().some(str => {
    return str.length > 0;
  });
}

function callValidator (done) {
  $("#fixedMap .pair").removeClass("passes fails");
  $("#results .status").hide();
  var currentAction = "parsing input schema";
  try {
    noStack(() => { Caches.inputSchema.refresh(); });
    $("#schemaDialect").text(Caches.inputSchema.language);
    if (hasFocusNode()) {
      currentAction = "parsing input data";
      $("#results .status").text("parsing data...").show();
      var inputData = Caches.inputData.refresh(); // need prefixes for ShapeMap
      // $("#shapeMap-tabs").tabs("option", "active", 2); // select fixedMap
      currentAction = "parsing shape map";
      var fixedMap = fixedShapeMapToTerms($("#fixedMap tr").map((idx, tr) => {
        return {
          node: Caches.inputData.meta.lexToTerm($(tr).find("input.focus").val()),
          shape: Caches.inputSchema.meta.lexToTerm($(tr).find("input.inputShape").val())
        };
      }).get());
      var inputData = Caches.inputData.refresh();
      if ($("#slurp").is(":checked")) {
        // .set() sets inputData's dirty bit.
        Caches.inputData.set("# slurping from <" + Caches.inputData.endpoint + ">...\n\n\n");
        Caches.inputData.slurpWriter = new ShEx.N3.Writer({ prefixes: Caches.inputSchema.meta.prefixes });
        inputData = ShEx.Util.makeQueryDB(Caches.inputData.endpoint, queryTracker());
      }

      currentAction = "creating validator";
      $("#results .status").text("creating validator...").show();
      ShExWorker.onmessage = expectCreated;
      ShExWorker.postMessage(Object.assign({ request: "create", schema: Caches.inputSchema.refresh(),
                                             schemaURL: Caches.inputSchema.url || DefaultBase
              /*, options: { regexModule: modules["../lib/regex/nfax-val-1err"] }*/
                                           },
                                           "endpoint" in Caches.inputData ?
                                           { endpoint: Caches.inputData.endpoint } :
                                           {  }
                                          ));
      var validationTracker = LOG_PROGRESS ? makeConsoleTracker() : null;
        var time;
        // time includes overhead of worker messages.


      // var resultsMap = USE_INCREMENTAL_RESULTS ?
      //       Util.createResults() :
      //       "not used";

      function expectCreated (msg) {
        if (msg.data.response === "error") {
          $("#results .status").empty().append("failed to create validator").addClass("error");
          results.append($("<pre/>").text(msg.data.stack ? msg.data.stack : msg.data.message));
          return;
        } else if (msg.data.response !== "created")
          throw "expected created: " + JSON.stringify(msg.data);
        $("#validate").addClass("stoppable");
        $("#validate .validate-label").text("abort");
        $("#validate").off("click", disableResultsAndValidate);
        $("#validate").on("click", terminateWorker);

        currentAction = "validating";
		//if in table mode, initialize the table headers and delete any bits of table already existing
		tableReset();
        $("#results .status").text("validating...").show();
        time = new Date();
        ShExWorker.onmessage = parseUpdatesAndResults;
        var transportMap = fixedMap.map(function (ent) {
          return {
            node: ent.node,
            shape: ent.shape === ShEx.Validator.start ?
              START_SHAPE_INDEX_ENTRY :
              ent.shape
          };
        });
        ShExWorker.postMessage(Object.assign(
          {
            request: "validate",
            queryMap: transportMap,
            options: {includeDoneResults: !USE_INCREMENTAL_RESULTS, track: LOG_PROGRESS}
          },
          ("endpoint" in Caches.inputData ?
           { endpoint: Caches.inputData.endpoint, slurp: $("#slurp").is(":checked") } :
           { data: inputData.getQuads() })
        ));
      }

      function terminateWorker (evt) {
        ShExWorker.terminate();
        ShExWorker = new Worker("shex-simple-worker.js");
        if (evt !== null)
          $("#results .status").text("validation aborted").show();
        workerUICleanup();
      }

      function workerUICleanup () {
        $("#validate").removeClass("stoppable");
        $("#validate .validate-label").text("validate");
        $("#validate").off("click", terminateWorker);
        $("#validate").on("click", disableResultsAndValidate);
      }

      function parseUpdatesAndResults (msg) {
        switch (msg.data.response) {
        case "update":
          // msg.data.results.forEach(newRes => {
          //   var key = Util.indexKey(newRes.node, newRes.shape);
          //   if (key in index) {
          //     markResult(updateCells[key], newRes.status, start);
          //   } else {
          //     extraResult(newRes);
          //   }
          // });

          if (USE_INCREMENTAL_RESULTS) {
            // Merge into results.
            msg.data.results.forEach(function (res) {
              if (res.shape === START_SHAPE_INDEX_ENTRY)
                res.shape = ShEx.Validator.start;
            });
            msg.data.results.forEach(renderEntry);
            // resultsMap.merge(msg.data.results);
          }
          break;

        case "recurse":
          validationTracker.recurse(msg.data.x);
          break;

        case "known":
          validationTracker.known(msg.data.x);
          break;

        case "enter":
          validationTracker.enter(msg.data.point, msg.data.label);
          break;

        case "exit":
          validationTracker.exit(msg.data.point, msg.data.label, msg.data.ret);
          break;

        case "done":
          ShExWorker.onmessage = false;
          $("#results .status").text("rendering results...").show();
          if (!USE_INCREMENTAL_RESULTS) {
            if ("solutions" in msg.data.results)
              msg.data.results.solutions.forEach(renderEntry);
            else
              renderEntry(msg.data.results);
            }
        time = new Date() - time;
        $("#shapeMap-tabs").attr("title", "last validation: " + time + " ms")
        finishRendering();
        if (done) { done() }
          workerUICleanup();
          break;

        case "startQuery":
          // use schema's prefixes 'cause they're better than nothing.
          var node = Caches.inputSchema.meta.termToLex(msg.data.term);
          var shape = Caches.inputSchema.meta.termToLex(msg.data.shape);
          var slurpStatus = (msg.data.isOut ? "←" : "→") + " " + node + "@" + shape;
          noScrollAppend($("#inputData textarea"), "# " + slurpStatus);
          break;

        case "finishQuery":
          noScrollAppend($("#inputData textarea"), " " + msg.data.quads.length + " triples (" + msg.data.time + " μs)\n");
          Caches.inputData.slurpWriter.addQuads(msg.data.quads.map(
            t => ShEx.RdfTerm.externalTriple(t, ShEx.N3.DataFactory)
          ));
          break;

        case "error":
          ShExWorker.onmessage = false;
          var e = Error(msg.data.message);
          e.stack = msg.data.stack;
          workerUICleanup();
        $("#results .status").text("validation errors:").show();
        failMessage(e, currentAction);
        console.error(e); // dump details to console.
        if (done) { done(e) }
          break;

        default:
          console.log("<span class=\"error\">unknown response: " + JSON.stringify(msg.data) + "</span>");
        }
      }

    } else {
      results.finish();
      if (done) { done() }
    }

    function noStack (f) {
      try {
        f();
      } catch (e) {
        // The Parser error stack is uninteresting.
        delete e.stack;
        throw e;
      }
    }
  } catch (e) {
    failMessage(e, currentAction);
    console.error(e); // dump details to console.
    if (done) { done(e) }
  }

  function makeConsoleTracker () {
    function padding (depth) { return (new Array(depth + 1)).join("  "); } // AKA "  ".repeat(depth)
    function sm (node, shape) {
      if (typeof shape === "object" && "term" in shape && shape.term === ShEx.Validator.start.term) {
        shape = ShEx.Validator.start;
      }
      return `${Caches.inputData.meta.termToLex(node)}@${Caches.inputSchema.meta.termToLex(shape)}`;
    }
    var logger = {
      recurse: x => { console.log(`${padding(logger.depth)}↻ ${sm(x.node, x.shape)}`); return x; },
      known: x => { console.log(`${padding(logger.depth)}↵ ${sm(x.node, x.shape)}`); return x; },
      enter: (point, label) => { console.log(`${padding(logger.depth)}→ ${sm(point, label)}`); ++logger.depth; },
      exit: (point, label, ret) => { --logger.depth; console.log(`${padding(logger.depth)}← ${sm(point, label)}`); },
      depth: 0
    };
    return logger;
  }

  function renderEntry (entry) {
    var fails = entry.status === "nonconformant";

    // locate FixedMap entry
    var shapeString = entry.shape === ShEx.Validator.start ? START_SHAPE_INDEX_ENTRY : entry.shape;
    var fixedMapEntry = $("#fixedMap .pair"+
                          "[data-node='"+entry.node+"']"+
                          "[data-shape='"+shapeString+"']");

    var klass = (fails ^ fixedMapEntry.find(".shapeMap-joiner").hasClass("nonconformant")) ? "fails" : "passes";
    var resultStr = fails ? "✗" : "✓";
    var elt = null;

    switch ($("#interface").val()) {
    case "human":
      elt = $("<div class='human'/>").append(
        $("<span/>").text(resultStr),
        $("<span/>").text(
        `${Caches.inputSchema.meta.termToLex(entry.node)}@${fails ? "!" : ""}${Caches.inputData.meta.termToLex(entry.shape)}`
        )).addClass(klass);
      if (fails)
        elt.append($("<pre>").text(ShEx.Util.errsToSimple(entry.appinfo).join("\n")));
      break;

    case "minimal":
      if (fails)
        entry.reason = ShEx.Util.errsToSimple(entry.appinfo).join("\n");
      delete entry.appinfo;
	  
	case "table":
		//print the table rows associated with this entry
		if(fails || document.getElementById("show-conformant").checked==false){
			renderOutput([entry])
		}
		break;
	  
      // fall through to default for appinfo case
    default:
      elt = $("<pre/>").text(JSON.stringify(entry, null, "  ")).addClass(klass);
    }
	//in case of table mode, don't execute next bits of code
	if ($("#interface").val() == "table"){
		return
	}
    results.append(elt);

    // update the FixedMap
    fixedMapEntry.addClass(klass).find("a").text(resultStr);
    var nodeLex = fixedMapEntry.find("input.focus").val();
    var shapeLex = fixedMapEntry.find("input.inputShape").val();
    var anchor = encodeURIComponent(nodeLex) + "@" + encodeURIComponent(shapeLex);
    elt.attr("id", anchor);
    fixedMapEntry.find("a").attr("href", "#" + anchor);
    fixedMapEntry.attr("title", entry.elapsed + " ms")
  }

  function finishRendering (done) {
    if ("slurpWriter" in Caches.inputData) {
      Caches.inputData.slurpWriter.end((err, chunk) => {
        $("#inputData textarea").val((i, text) => {
          return text + "\n\n# Visited data:\n" + chunk; // cheaper than set() but a pain to maintain...
        });
        $("#slurpSpan").remove();
        // delete Caches.intputData.endpoint;
        Caches.inputData.refresh();
        delete Caches.inputData.slurpWriter;
      });
    }

          $("#results .status").text("rendering results...").show();
          // Add commas to JSON results.
          if ($("#interface").val() !== "human")
            $("#results div *").each((idx, elt) => {
              if (idx === 0)
                $(elt).prepend("[");
              $(elt).append(idx === $("#results div *").length - 1 ? "]" : ",");
            });
      $("#results .status").hide();
      // for debugging values and schema formats:
      // try {
      //   var x = ShEx.Util.valToValues(ret);
      //   // var x = ShEx.Util.ShExJtoAS(valuesToSchema(valToValues(ret)));
      //   res = results.replace(JSON.stringify(x, null, "  "));
      //   var y = ShEx.Util.valuesToSchema(x);
      //   res = results.append(JSON.stringify(y, null, "  "));
      // } catch (e) {
      //   console.dir(e);
      // }
      results.finish();
  }
}


/** attempt to disable scrolling if not at bottom of target.
 * tried both selectionState and scrollTop.
 */
function noScrollAppend (target, toAdd) {
  var e = target.get(0);
  // var oldLen = target.val().length
  // var oldSel = target.prop("selectionStart");
  // var oldScrollTop = e.scrollTop;
  // var oldScrollHeight = e.scrollHeight;
  target.val((i, text) => {
    return text + toAdd;
  });
  // console.log(oldScrollTop, oldScrollHeight);
  // if (oldScrollTop === oldScrollHeight) {
  e.scrollTop = e.scrollHeight;
  //   target.prop("selectionStart", target.val().length);
  // } else {
  //   target.prop("selectionStart", oldScrollTop);
  // }
  // if (oldSel === oldLen) {
  //   e.scrollTop = e.scrollHeight;
  //   target.prop("selectionStart", target.val().length);
  // } else {
  //   target.prop("selectionStart", oldSel);
  // }
}

var LastFailTime = 0;
function failMessage (e, action, text) {
  $("#results .status").empty().text("Errors encountered:").show()
  var div = $("<div/>").addClass("error");
  div.append($("<h3/>").text("error " + action + ":\n"));
  div.append($("<pre/>").text(e.message));
  if (text)
    div.append($("<pre/>").text(text));
  results.append(div);
  LastFailTime = new Date().getTime();
}

function addEmptyEditMapPair (evt) {
  addEditMapPairs(null, $(evt.target).parent().parent());
  markEditMapDirty();
  return false;
}

function addEditMapPairs (pairs, target) {
  (pairs || [{node: {type: "empty"}}]).forEach(pair => {
    var nodeType = (typeof pair.node !== "object" || "@value" in pair.node)
        ? "node"
        : pair.node.type;
    var skip = false;
    var node; var shape;
    switch (nodeType) {
    case "empty": node = shape = ""; break;
    case "node": node = ldToTurtle(pair.node, Caches.inputData.meta.termToLex); shape = startOrLdToTurtle(pair.shape); break;
    case "TriplePattern": node = renderTP(pair.node); shape = startOrLdToTurtle(pair.shape); break;
    case "Extension":
      if (pair.node.language === EXTENSION_sparql) {
        node = "SPARQL '''" + (pair.node.lexical.replace(/'''/g, "''\\'")) + "'''";
        shape = startOrLdToTurtle(pair.shape);
      } else {
        failMessage(Error("unsupported extension: <" + pair.node.language + ">"),
                    "parsing Query Map", pair.node.lexical);
        skip = true; // skip this entry.
      }
      break;
    default:
      results.append($("<div/>").append(
        $("<span/>").text("unrecognized ShapeMap:"),
        $("<pre/>").text(JSON.stringify(pair))
      ).addClass("error"));
      skip = true; // skip this entry.
      break;
    }
    if (!skip) {

    var spanElt = $("<tr/>", {class: "pair"});
    var focusElt = $("<textarea/>", {
      rows: '1',
      type: 'text',
      class: 'data focus'
    }).text(node).on("input", markEditMapDirty);
    var joinerElt = $("<span>", {
      class: 'shapeMap-joiner'
    }).append("@").addClass(pair.status);
    joinerElt.append(
      $("<input>", {style: "border: none; width: .2em;", readonly: "readonly"}).val(pair.status === "nonconformant" ? "!" : " ").on("click", function (evt) {
        var status = $(this).parent().hasClass("nonconformant") ? "conformant" : "nonconformant";
        $(this).parent().removeClass("conformant nonconformant");
        $(this).parent().addClass(status);
        $(this).val(status === "nonconformant" ? "!" : "");
        markEditMapDirty();
        evt.preventDefault();
      })
    );
    // if (pair.status === "nonconformant") {
    //   joinerElt.append("!");
    // }
    var shapeElt = $("<input/>", {
      type: 'text',
      value: shape,
      class: 'schema inputShape'
    }).on("input", markEditMapDirty);
    var addElt = $("<button/>", {
      class: "addPair",
      title: "add a node/shape pair"}).text("+");
    var removeElt = $("<button/>", {
      class: "removePair",
      title: "remove this node/shape pair"}).text("-");
    addElt.on("click", addEmptyEditMapPair);
    removeElt.on("click", removeEditMapPair);
    spanElt.append([focusElt, joinerElt, shapeElt, addElt, removeElt].map(elt => {
      return $("<td/>").append(elt);
    }));
    if (target) {
      target.after(spanElt);
    } else {
      $("#editMap").append(spanElt);
    }
    }
  });
  if ($("#editMap .removePair").length === 1)
    $("#editMap .removePair").css("visibility", "hidden");
  else
    $("#editMap .removePair").css("visibility", "visible");
  $("#editMap .pair").each(idx => {
    addContextMenus("#editMap .pair:nth("+idx+") .focus", Caches.inputData);
    addContextMenus(".pair:nth("+idx+") .inputShape", Caches.inputSchema);
  });
  return false;

  function renderTP (tp) {
    var ret = ["subject", "predicate", "object"].map(k => {
      var ld = tp[k];
      if (ld === ShEx.ShapeMap.focus)
        return "FOCUS";
      if (!ld) // ?? ShEx.Uti.any
        return "_";
      return ldToTurtle(ld, Caches.inputData.meta.termToLex);
    });
    return "{" + ret.join(" ") + "}";
  }

  function startOrLdToTurtle (term) {
    return term === ShEx.Validator.start ? START_SHAPE_LABEL : ldToTurtle(term, Caches.inputSchema.meta.termToLex);
  }
}

function removeEditMapPair (evt) {
  markEditMapDirty();
  if (evt) {
    $(evt.target).parent().parent().remove();
  } else {
    $("#editMap .pair").remove();
  }
  if ($("#editMap .removePair").length === 1)
    $("#editMap .removePair").css("visibility", "hidden");
  return false;
}

function prepareControls () {
  $("#menu-button").on("click", toggleControls);
  $("#interface").on("change", setInterface);
  $("#regexpEngine").on("change", toggleControls);
  $("#validate").on("click", disableResultsAndValidate);
  $("#clear").on("click", clearAll);
  $("#showMeta").on("click", revealMetaPane);
  $("#download-results-button").on("click", downloadResults);
  //for table mode
  $('#export-table').on("click", exportTable);
  $("#validate").on("click", revealTable);
  $("#show-wb-cloud").on("change", showHideWBCloudParam);

  $("#loadForm").dialog({
    autoOpen: false,
    modal: true,
    buttons: {
      "GET": function (evt, ui) {
        results.clear();
        var target = Getables.find(g => g.queryStringParm === $("#loadForm span").text());
        var url = $("#loadInput").val();
        var tips = $(".validateTips");
        function updateTips (t) {
          tips
            .text( t )
            .addClass( "ui-state-highlight" );
          setTimeout(function() {
            tips.removeClass( "ui-state-highlight", 1500 );
          }, 500 );
        }
        if (url.length < 5) {
          $("#loadInput").addClass("ui-state-error");
          updateTips("URL \"" + url + "\" is way too short.");
          return;
        }
        tips.removeClass("ui-state-highlight").text();
        target.cache.asyncGet(url).catch(function (e) {
          updateTips(e.message);
        });
      },
      Cancel: function() {
        $("#loadInput").removeClass("ui-state-error");
        $("#loadForm").dialog("close");
        toggleControls();
      }
    },
    close: function() {
      $("#loadInput").removeClass("ui-state-error");
      $("#loadForm").dialog("close");
      toggleControls();
    }
  });
  Getables.forEach(target => {
    var type = target.queryStringParm
    $("#load-"+type+"-button").click(evt => {
      var prefillURL = target.url ? target.url :
          target.cache.meta.base && target.cache.meta.base !== DefaultBase ? target.cache.meta.base :
          "";
      $("#loadInput").val(prefillURL);
      $("#loadForm").attr("class", type).find("span").text(type);
      $("#loadForm").dialog("open");
    });
  });

  $("#about").dialog({
    autoOpen: false,
    modal: true,
    width: "50%",
    buttons: {
      "Dismiss": dismissModal
    },
    close: dismissModal
  });

  $("#about-button").click(evt => {
    $("#about").dialog("open");
  });

  $("#shapeMap-tabs").tabs({
    activate: function (event, ui) {
      if (ui.oldPanel.get(0) === $("#editMap-tab").get(0))
        copyEditMapToTextMap();
    }
  });
  $("#textMap").on("input", markEditMapDirty);
  $("#textMap").on("change", evt => {
    results.clear();
    copyTextMapToEditMap();
  });
  Caches.inputData.selection.on("change", evt => {
    copyEditMapToFixedMap();
  });
  $("#copyEditMapToFixedMap").on("click", copyEditMapToFixedMap); // may add this button to tutorial

  function dismissModal (evt) {
    // $.unblockUI();
    $("#about").dialog("close");
    toggleControls();
    return true;
  }

  // Prepare file uploads
  $("input.inputfile").each((idx, elt) => {
    $(elt).on("change", function (evt) {
      var reader = new FileReader();

      reader.onload = function(evt) {
        if(evt.target.readyState != 2) return;
        if(evt.target.error) {
          alert("Error while reading file");
          return;
        }
        $($(elt).attr("data-target")).val(evt.target.result);
      };

      reader.readAsText(evt.target.files[0]);
    });
  });
}

function toggleControls (evt) {
  var revealing = evt && $("#controls").css("display") !== "flex";
  $("#controls").css("display", revealing ? "flex" : "none");
  toggleControlsArrow(revealing ? "up" : "down");
  if (revealing) {
    var target = evt.target;
    while (target.tagName !== "BUTTON")
      target = target.parentElement;
    if ($("#menuForm").css("position") === "absolute") {
      $("#controls").
        css("top", 0).
        css("left", $("#menu-button").css("margin-left"));
    } else {
      var bottonBBox = target.getBoundingClientRect();
      var controlsBBox = $("#menuForm").get(0).getBoundingClientRect();
      var left = bottonBBox.right - bottonBBox.width; // - controlsBBox.width;
      $("#controls").css("top", bottonBBox.bottom).css("left", left);
    }
    $("#permalink a").attr("href", getPermalink());
  }
  return false;
}

function queryTracker () {
  return {
    start: function (isOut, term, shapeLabel) {
      var node = Caches.inputSchema.meta.termToLex(term);
      var shape = Caches.inputSchema.meta.termToLex(shapeLabel);
      var slurpStatus = (isOut ? "←" : "→") + " " + node + "@" + shape;
      noScrollAppend($("#inputData textarea"), "# " + slurpStatus);
    },
    end: function (quads, time) {
      noScrollAppend($("#inputData textarea"), " " + quads.length + " triples (" + time + " μs)\n");
      Caches.inputData.slurpWriter.addQuads(quads.map(
        t => ShEx.RdfTerm.externalTriple(t, ShEx.N3.DataFactory)
      ));
    }
  }
}

function toggleControlsArrow (which) {
  // jQuery can't find() a prefixed attribute (xlink:href); fall back to DOM:
  if (document.getElementById("menu-button") === null)
    return;
  var down = $(document.getElementById("menu-button").
               querySelectorAll('use[*|href="#down-arrow"]'));
  var up = $(document.getElementById("menu-button").
             querySelectorAll('use[*|href="#up-arrow"]'));

  switch (which) {
  case "down":
    down.show();
    up.hide();
    break;
  case "up":
    down.hide();
    up.show();
    break;
  default:
    throw Error("toggleControlsArrow expected [up|down], got \"" + which + "\"");
  }
}

function revealMetaPane () {
  if ($("#showMeta").is(":checked")) {
    $("#meta").show();
    if ($("#meta").attr("data-adjust"))
      $($("#meta").attr("data-adjust")).attr("rows", "12");
  } else {
    $("#meta").hide();
    if ($("#meta").attr("data-adjust"))
      $($("#meta").attr("data-adjust")).attr("rows", "25");
  }
}

function setInterface (evt) {
  toggleControls();
  customizeInterface();
}

function downloadResults (evt) {
  var typed = [
    { type: "text/plain", name: "results.txt" },
    { type: "application/json", name: "results.json" }
  ][$("#interface").val() === "appinfo" ? 1 : 0];
  var blob = new Blob([results.text()], {type: typed.type});
  $("#download-results-button")
    .attr("href", window.URL.createObjectURL(blob))
    .attr("download", typed.name);
  toggleControls();
  console.log(results.text());
}

/**
 *
 * location.search: e.g. "?schema=asdf&data=qwer&shape-map=ab%5Ecd%5E%5E_ef%5Egh"
 */
var parseQueryString = function(query) {
  if (query[0]==='?') query=query.substr(1); // optional leading '?'
  var map   = {};
  query.replace(/([^&,=]+)=?([^&,]*)(?:[&,]+|$)/g, function(match, key, value) {
    key=decodeURIComponent(key);value=decodeURIComponent(value);
    (map[key] = map[key] || []).push(value);
  });
  return map;
};

function markEditMapDirty () {
  $("#editMap").attr("data-dirty", true);
  if ($("#textMap").data("isSparqlQuery")) {
    // query results have to be fetched first before validation can happen
    $("#validate .validate-label").text("run query to fetch entities");
  }
}

function markEditMapClean () {
  $("#editMap").attr("data-dirty", false);
}

/** getShapeMap -- zip a node list and a shape list into a ShapeMap
 * use {Caches.inputData,Caches.inputSchema}.meta.{prefix,base} to complete IRIs
 */
function copyEditMapToFixedMap () {
  $("#fixedMap tbody").empty(); // empty out the fixed map.
  var fixedMapTab = $("#shapeMap-tabs").find('[href="#fixedMap-tab"]');
  var restoreText = fixedMapTab.text();
  fixedMapTab.text("resolving Fixed Map").addClass("running");
  var nodeShapePromises = $("#editMap .pair").get().reduce((acc, queryPair) => {
    $(queryPair).find(".error").removeClass("error"); // remove previous error markers
    var node = $(queryPair).find(".focus").val();
    var shape = $(queryPair).find(".inputShape").val();
    var status = $(queryPair).find(".shapeMap-joiner").hasClass("nonconformant") ? "nonconformant" : "conformant";
    if (!node || !shape)
      return acc;
    var smparser = ShEx.ShapeMapParser.construct(
      Caches.shapeMap.meta.base, Caches.inputSchema.meta, Caches.inputData.meta);
    var nodes = [];
    try {
      var sm = smparser.parse(node + '@' + shape)[0];
      var added = typeof sm.node === "string" || "@value" in sm.node
        ? Promise.resolve({nodes: [node], shape: shape, status: status})
        : sm.node.language === EXTENSION_sparql
        ? ShEx.Util.executeQueryPromise(sm.node.lexical, Caches.inputData.endpoint)
          .then(rows => Promise.resolve({nodes: rows.map(lexifyFirstColumn), shape: shape}))
        : Promise.resolve({nodes: getQuads(sm.node.subject, sm.node.predicate, sm.node.object), shape: shape, status: status}); // !!check
      return acc.concat(added);
    } catch (e) {
      // find which cell was broken
      try { smparser.parse(node + '@' + "START"); } catch (e) {
        $(queryPair).find(".focus").addClass("error");
      }
      try { smparser.parse("<>" + '@' + shape); } catch (e) {
        $(queryPair).find(".inputShape").addClass("error");
      }
      failMessage(e, "parsing Edit Map", node + '@' + shape);
      nodes = Promise.resolve([]); // skip this entry
      return acc;
    }
  }, []);

  Promise.all(nodeShapePromises).then(pairs => pairs.reduce((acc, pair) => {
    pair.nodes.forEach(node => {// !!check
      var nodeTerm = Caches.inputData.meta.lexToTerm(node + " "); // for langcode lookahead
      var shapeTerm = Caches.inputSchema.meta.lexToTerm(pair.shape);
      if (shapeTerm === ShEx.Validator.start)
        shapeTerm = START_SHAPE_INDEX_ENTRY;
      var key = nodeTerm + "|" + shapeTerm;
      if (key in acc)
        return;

      var spanElt = createEntry(node, nodeTerm, pair.shape, shapeTerm, pair.status);
      acc[key] = spanElt; // just needs the key so far.
    });

    return acc;
  }, {})).then(() => {
    // scroll inputs to right
    $("#fixedMap input").each((idx, focusElt) => {
      focusElt.scrollLeft = focusElt.scrollWidth;
    });
    fixedMapTab.text(restoreText).removeClass("running");
    $("#validate .validate-label").text("validate");
  });

  function getQuads (s, p, o) {
    var get = s === ShEx.ShapeMap.focus ? "subject" : "object";
    return Caches.inputData.refresh().getQuads(mine(s), mine(p), mine(o)).map(t => {
      return Caches.inputData.meta.termToLex(t[get]);// !!check
    });
    function mine (term) {
      return term === ShEx.ShapeMap.focus || term === ShEx.ShapeMap.wildcard
        ? null
        : term;
    }
  }

      function createEntry (node, nodeTerm, shape, shapeTerm, status) {
    var spanElt = $("<tr/>", {class: "pair"
                              ,"data-node": nodeTerm
                              ,"data-shape": shapeTerm
                             });
    var focusElt = $("<input/>", {
      type: 'text',
      value: node,
      class: 'data focus',
      disabled: "disabled"
    });
    var joinerElt = $("<span>", {
      class: 'shapeMap-joiner'
    }).append("@").addClass(status);
    if (status === "nonconformant") {
      joinerElt.addClass("negated");
      joinerElt.append("!");
    }
    var shapeElt = $("<input/>", {
      type: 'text',
      value: shape,
      class: 'schema inputShape',
      disabled: "disabled"
    });
    var removeElt = $("<button/>", {
      class: "removePair",
      title: "remove this node/shape pair"}).text("-");
    removeElt.on("click", evt => {
      // Remove related result.
      var href, result;
      if ((href = $(evt.target).closest("tr").find("a").attr("href"))
          && (result = document.getElementById(href.substr(1))))
        $(result).remove();
      // Remove FixedMap entry.
      $(evt.target).closest("tr").remove();
    });
      spanElt.append([focusElt, joinerElt, shapeElt, removeElt, $("<a/>")].map(elt => {
      return $("<td/>").append(elt);
    }));

        $("#fixedMap").append(spanElt);
        return spanElt;
      }

}

function lexifyFirstColumn (row) { // !!not used
  return Caches.inputData.meta.termToLex(row[0]); // row[0] is the first column.
}

function copyEditMapToTextMap () {
  if ($("#editMap").attr("data-dirty") === "true") {
    var text = $("#editMap .pair").get().reduce((acc, queryPair) => {
      var node = $(queryPair).find(".focus").val();
      var shape = $(queryPair).find(".inputShape").val();
      if (!node || !shape)
        return acc;
      var status = $(queryPair).find(".shapeMap-joiner").hasClass("nonconformant") ? "!" : "";
      return acc.concat([node+"@"+status+shape]);
    }, []).join(",\n");
    $("#textMap").empty().val(text);
    copyEditMapToFixedMap();
    markEditMapClean();
  }
}

/**
 * Parse a supplied query map and build #editMap
 * @returns list of errors. ([] means everything was good.)
 */
function copyTextMapToEditMap () {
  $("#textMap").removeClass("error");
  var shapeMap = $("#textMap").val();
  if ($("#textMap").data("isSparqlQuery")) {
    shapeMap = "SPARQL '''" + shapeMap + "'''@START";
  }
  try { Caches.inputSchema.refresh(); } catch (e) { }
  try { Caches.inputData.refresh(); } catch (e) { }
  try {
    var smparser = ShEx.ShapeMapParser.construct(
      Caches.shapeMap.meta.base, Caches.inputSchema.meta, Caches.inputData.meta);
    var sm = smparser.parse(shapeMap);
    removeEditMapPair(null);
    addEditMapPairs(sm.length ? sm : null);
    copyEditMapToFixedMap();
    markEditMapClean();
  } catch (e) {
    $("#textMap").addClass("error");
    $("#fixedMap").empty();
    failMessage(e, "parsing Query Map");
  }
  return [];
}

function makeFreshEditMap () {
  removeEditMapPair(null);
  addEditMapPairs(null, null);
  markEditMapClean();
  return [];
}

/** fixedShapeMapToTerms -- map ShapeMap to API terms
 * @@TODO: add to ShExValidator so API accepts ShapeMap
 */
function fixedShapeMapToTerms (shapeMap) {
  return shapeMap; /*.map(pair => {
    return {node: Caches.inputData.meta.lexToTerm(pair.node + " "),
            shape: Caches.inputSchema.meta.lexToTerm(pair.shape)};
  });*/
}

/**
 * Load URL search parameters
 */
function loadSearchParameters () {
  // don't overwrite if we arrived here from going back for forth in history
  if (Caches.inputSchema.selection.val() !== "" || Caches.inputData.selection.val() !== "")
    return;

  var iface = parseQueryString(location.search);
  if (!("ui" in iface) || iface.ui[iface.ui.length -1] !== "full") {
    $("#menuForm").hide();
  }

  toggleControlsArrow("down");
  $(".manifest li").text("no manifest schemas loaded");
  if ("examples" in iface) { // deprecated ?examples= interface
    iface.manifestURL = iface.examples;
    delete iface.examples;
  }
  if (!("manifest" in iface) && !("manifestURL" in iface)) {
    iface.manifestURL = ["../examples/manifest.json"];
  }
  /*if ("hideData" in iface) {
    $("#inputData textarea").css("visibility", "hidden");
  }*/ //this now controlled by a separate system so it can be enabled when desired to connect to wikicloud. System is calling TableModeUtils.js -> showHideWBCloudParam()
  if ("textMapIsSparqlQuery" in iface) {
    $("#textMap").data("isSparqlQuery", true)
      .attr("placeholder", "SELECT ?id WHERE {\n    # ...\n}");
    $("#validate .validate-label").text("run query to fetch entities");
    $("#textMap-tab-header a").text('Query');
    $("#editMap-tab-header").remove();
    $("#fixedMap-tab-header a").text('Entities to check');
  }

  // Load all known query parameters.
  return Promise.all(QueryParams.reduce((promises, input) => {
    var parm = input.queryStringParm;
    if (parm + "URL" in iface) {
      var url = iface[parm + "URL"][0];
      if (url.length > 0) { // manifest= loads no manifest
        // !!! set anyways in asyncGet?
        input.cache.url = url; // all fooURL query parms are caches.
        promises.push(input.cache.asyncGet(url).catch(function (e) {
          if ("fail" in input) {
            input.fail(e);
          } else {
            input.location.val(e.message);
          }
          results.append($("<pre/>").text(e).addClass("error"));
          throw e
        }));
      }
    } else if (parm in iface) {
      var prepend = input.location.prop("tagName") === "TEXTAREA" ?
          input.location.val() :
          "";
      var value = prepend + iface[parm].join("");
      if ("cache" in input)
        // If it parses, make meta (prefixes, base) available.
        try {
          input.cache.set(value, location.href);
        } catch (e) {
          if ("fail" in input) {
            input.fail(e);
          }
          results.append($("<pre/>").text(
            "error setting " + input.queryStringParm + ":\n" + e + "\n" + value
          ).addClass("error"));
          throw e
        }
      else {
        // Set HTML interface state.
        // A little insulation against improper values:
        let orig = input.location.val();
        input.location.val(prepend + value);
        if (input.location.val() === null) {
          // invalid value so return to last value
          input.location.val(orig);
        }
      }
    } else if ("deflt" in input) {
      input.location.val(input.deflt);
    }
    return promises;
  }, [])).then(function (_) {

    // Parse the shape-map using the prefixes and base.
    var shapeMapErrors = $("#textMap").val().trim().length > 0
        ? copyTextMapToEditMap()
        : makeFreshEditMap();

    customizeInterface();
    $("body").keydown(function (e) { // keydown because we need to preventDefault
      var code = e.keyCode || e.charCode; // standards anyone?
      if (e.ctrlKey && (code === 10 || code === 13)) {
        var at = $(":focus");
        $("#validate").focus().click();
        at.focus();
        return false; // same as e.preventDefault();
      } else {
        return true;
      }
    });
    addContextMenus("#focus0", Caches.inputData);
    addContextMenus("#inputShape0", Caches.inputSchema);
    if ("schemaURL" in iface ||
        // some schema is non-empty
        ("schema" in iface &&
         iface.schema.reduce((r, elt) => { return r+elt.length; }, 0))
       && shapeMapErrors.length === 0) {
      callValidator();
      if (!hasFocusNode()) {
        $("#textMap").focus();
      }
    }
  });
}

  /**
   * update location with a current values of some inputs
   */
  function getPermalink () {
    var parms = [];
    copyEditMapToTextMap();
    parms = parms.concat(QueryParams.reduce((acc, input) => {
      var parm = input.queryStringParm;
      var val = input.location.val();
      if (input.cache && input.cache.url &&
          // Specifically avoid loading from DefaultBase?schema=blah
          // because that will load the HTML page.
          !input.cache.url.startsWith(DefaultBase)) {
        parm += "URL";
        val = input.cache.url;
      }
      return val.length > 0 ?
        acc.concat(parm + "=" + encodeURIComponent(val)) :
        acc;
    }, []));
    if ($("#inputData textarea").css("visibility") === "hidden") {
      parms.push("hideData");
    }
    if ($("#textMap").data("isSparqlQuery")) {
      parms.push('textMapIsSparqlQuery');
    }
    var s = parms.join("&");
    return location.origin + location.pathname + "?" + s;
  }

function customizeInterface () {
  if ($("#interface").val() === "minimal") {
    $("#inputSchema .status").html("schema (<span id=\"schemaDialect\">ShEx</span>)").show();
    $("#inputData .status").html("data (<span id=\"dataDialect\">Turtle</span>)").show();
    $("#actions").parent().children().not("#actions").hide();
    $("#title img, #title h1").hide();
    $("#menuForm").css("position", "absolute").css(
      "left",
      $("#inputSchema .status").get(0).getBoundingClientRect().width -
        $("#menuForm").get(0).getBoundingClientRect().width
    );
    $("#controls").css("position", "relative");
  } else {
    $("#inputSchema .status").html("schema (<span id=\"schemaDialect\">ShEx</span>)").hide();
    $("#inputData .status").html("data (<span id=\"dataDialect\">Turtle</span>)").hide();
    $("#actions").parent().children().not("#actions").show();
    $("#title img, #title h1").show();
    $("#controls").css("position", "absolute");
  }
}

/**
 * Prepare drag and drop into text areas
 */
function prepareDragAndDrop () {
  QueryParams.filter(q => {
    return "cache" in q;
  }).map(q => {
    return {
      location: q.location,
      targets: [{
        ext: "",   // Will match any file
        media: "", //   or media type.
        target: q.cache
      }]
    };
  }).concat([
    {location: $("body"), targets: [
      {media: "application/json", target: Caches.manifest},
      {ext: ".shex", media: "text/shex", target: Caches.inputSchema},
      {ext: ".owl", media: "text/turtle+owl", target: Caches.inputMeta},
      {ext: ".ttl", media: "text/turtle", target: Caches.inputData},
      {ext: ".json", media: "application/json", target: Caches.manifest},
      {ext: ".smap", media: "text/plain", target: Caches.shapeMap}]}
  ]).forEach(desc => {
    var droparea = desc.location;
      // kudos to http://html5demos.com/dnd-upload
      desc.location.
        on("drag dragstart dragend dragover dragenter dragleave drop", function (e) {
          e.preventDefault();
          e.stopPropagation();
        }).
        on("dragover dragenter", (evt) => {
          desc.location.addClass("hover");
        }).
        on("dragend dragleave drop", (evt) => {
          desc.location.removeClass("hover");
        }).
        on("drop", (evt) => {
          evt.preventDefault();
          droparea.removeClass("droppable");
          $("#results .status").removeClass("error");
          results.clear();
          let xfer = evt.originalEvent.dataTransfer;
          const prefTypes = [
            {type: "files"},
            {type: "application/json"},
            {type: "text/uri-list"},
            {type: "text/plain"}
          ];
          if (prefTypes.find(l => {
            if (l.type.indexOf("/") === -1) {
              if (xfer[l.type].length > 0) {
                $("#results .status").text("handling "+xfer[l.type].length+" files...").show();
                readfiles(xfer[l.type], desc.targets);
                return true;
              }
            } else {
              if (xfer.getData(l.type)) {
                var val = xfer.getData(l.type);
                $("#results .status").text("handling "+l.type+"...").show();
                if (l.type === "application/json") {
                  if (desc.location.get(0) === $("body").get(0)) {
                    var parsed = JSON.parse(val);
                    if (!(parsed.constructor === Array)) {
                      parsed = [parsed];
                    }
                    parsed.map(elt => {
                      var action = "action" in elt ? elt.action: elt;
                      action.schemaURL = action.schema; delete action.schema;
                      action.dataURL = action.data; delete action.data;
                      if ("termResolver" in action) {
                        action.termResolverURL = action.termResolver; delete action.termResolver;
                      }
                    });
                    Caches.manifest.set(parsed, DefaultBase, "drag and drop");
                  } else {
                    inject(desc.targets, DefaultBase, val, l.type);
                  }
                } else if (l.type === "text/uri-list") {
                  $.ajax({
                    accepts: {
                      mycustomtype: 'text/shex,text/turtle,*/*'
                    },
                    url: val,
                    dataType: "text"
                  }).fail(function (jqXHR, textStatus) {
                    var error = jqXHR.statusText === "OK" ? textStatus : jqXHR.statusText;
                    results.append($("<pre/>").text("GET <" + val + "> failed: " + error));
                  }).done(function (data, status, jqXhr) {
                    try {
                      inject(desc.targets, val, data, (jqXhr.getResponseHeader("Content-Type") || "unknown-media-type").split(/[ ;,]/)[0]);
                      $("#loadForm").dialog("close");
                      toggleControls();
                    } catch (e) {
                      results.append($("<pre/>").text("unable to evaluate <" + val + ">: " + (e.stack || e)));
                    }
                  });
                } else if (l.type === "text/plain") {
                  inject(desc.targets, DefaultBase, val, l.type);
                }
                $("#results .status").text("").hide();
                // desc.targets.text(xfer.getData(l.type));
                return true;
                function inject (targets, url, data, mediaType) {
                  var target =
                      targets.length === 1 ? targets[0].target :
                      targets.reduce((ret, elt) => {
                        return ret ? ret :
                          mediaType === elt.media ? elt.target :
                          null;
                      }, null);
                  if (target) {
                    var appendTo = $("#append").is(":checked") ? target.get() : "";
                    target.set(appendTo + data, url);
                  } else {
                    results.append("don't know what to do with " + mediaType + "\n");
                  }
                }
              }
            }
            return false;
          }) === undefined)
            results.append($("<pre/>").text(
              "drag and drop not recognized:\n" +
                JSON.stringify({
                  dropEffect: xfer.dropEffect,
                  effectAllowed: xfer.effectAllowed,
                  files: xfer.files.length,
                  items: [].slice.call(xfer.items).map(i => {
                    return {kind: i.kind, type: i.type};
                  })
                }, null, 2)
            ));

        });
    });
  function readfiles(files, targets) {
    var formData = new FormData();
    var sucecesses = 0;

    for (var i = 0; i < files.length; i++) {
      var file = files[i], name = file.name;
      var target = targets.reduce((ret, elt) => {
        return ret ? ret :
          name.endsWith(elt.ext) ? elt.target :
          null;
      }, null);
      if (target) {
        formData.append("file", file);
        var reader = new FileReader();
        reader.onload = (function (target) {
          return function (event) {
            var appendTo = $("#append").is(":checked") ? target.get() : "";
            target.set(appendTo + event.target.result, DefaultBase);
          };
        })(target);
        reader.readAsText(file);
        ++sucecesses;
      } else {
        results.append("don't know what to do with " + name + "\n");
      }
    }
    $("#results .status").text("loaded "+sucecesses+" files.").show();
  }
}

function prepareManifest (demoList, base) {
  var listItems = Object.keys(Caches).reduce((acc, k) => {
    acc[k] = {};
    return acc;
  }, {});
  var nesting = demoList.reduce(function (acc, elt) {
    var key = elt.schemaLabel + "|" + elt.schema;
    if (!(key in acc)) {
      // first entry with this schema
      acc[key] = Object.assign({
        label: elt.schemaLabel,
        text: elt.schema,
        url: elt.schemaURL || (elt.schema ? base : undefined)
      }, "meta" in elt ? { meta: elt.meta } : { });
    } else {
      // nth entry with this schema
    }

    if ("dataLabel" in elt) {
      var dataEntry = {
        label: elt.dataLabel,
        text: elt.data,
        url: elt.dataURL || (elt.data ? base : undefined),
        entry: elt
      };
      var target = elt.status === "nonconformant"
          ? "fails"
          : elt.status === "conformant" ? "passes" : "indeterminant";
      if (!(target in acc[key])) {
        // first entry with this data
        acc[key][target] = [dataEntry];
      } else {
        // n'th entry with this data
        acc[key][target].push(dataEntry);
      }
    } else {
      // this is a schema-only example
    }

    return acc;
  }, {});
  var nestingAsList = Object.keys(nesting).map(e => nesting[e]);
  paintManifest("#inputSchema .manifest ul", nestingAsList, pickSchema, listItems, "inputSchema");
  $("#inputSchema .manifest").css("visibility", nestingAsList.length > 0 ? "visible" : "hidden");
  var timeouts = Object.keys(Caches).reduce((acc, k) => {
    acc[k] = undefined;
    return acc;
  }, {});
  function later (target, side, cache) {
    cache.dirty(true);
    if (timeouts[side])
      clearTimeout(timeouts[side]);

    timeouts[side] = setTimeout(() => {
      timeouts[side] = undefined;
      var curSum = sum($(target).val());
      if (curSum in listItems[side])
        listItems[side][curSum].addClass("selected");
      else
        $("#"+side+" .selected").removeClass("selected");
      delete cache.url;
    }, INPUTAREA_TIMEOUT);
  }
  Object.keys(Caches).forEach(function (cache) {
    Caches[cache].selection.keyup(function (e) { // keyup to capture backspace
      var code = e.keyCode || e.charCode;
      // if (!(e.ctrlKey)) {
      //   results.clear();
      // }
      if (!(e.ctrlKey && (code === 10 || code === 13))) {
        later(e.target, cache, Caches[cache]);
      }
    });
  });
  $("#meta textarea").keyup(function (e) {
    var code = e.keyCode || e.charCode;
    if (!(e.ctrlKey && (code === 10 || code === 13)))
      later(e.target, "meta", Caches.inputMeta);
  });
}

function addContextMenus (inputSelector, cache) {
    // !!! terribly stateful; only one context menu at a time!
    var terms = null, nodeLex = null, target, scrollLeft, m, addSpace = "";
    $.contextMenu({
      selector: inputSelector,
      callback: function (key, options) {
        markEditMapDirty();
        if (key === MENU_ITEM_materialize) {
          var toAdd = Object.keys(options.items).filter(k => {
            return k !== MENU_ITEM_materialize;
          });
          $(options.selector).val(toAdd.shift());
          var shape = $(options.selector.replace(/focus/, "inputShape")).val();
          addEditMapPairs(toAdd.map(
            node => {
              return {
                node: Caches.inputData.meta.lexToTerm(node),
                shape: Caches.inputSchema.meta.lexToTerm(shape)
              };
            }), null);
        } else if (options.items[key].ignore) { // ignore the event
        } else if (terms) {
          var term = terms.tz[terms.match];
          var val = nodeLex.substr(0, term[0]) +
              key + addSpace +
              nodeLex.substr(term[0] + term[1]);
          if (terms.match === 2 && !m[9])
            val = val + "}";
          else if (term[0] + term[1] === nodeLex.length)
            val = val + " ";
          $(options.selector).val(val);
          // target.scrollLeft = scrollLeft + val.length - nodeLex.length;
          target.scrollLeft = target.scrollWidth;
        } else {
          $(options.selector).val(key);
        }
      },
      build: function (elt, evt) {
        if (elt.hasClass("data")) {
          nodeLex = elt.val();
          var shapeLex = elt.parent().parent().find(".schema").val()

          // Would like to use SMParser but that means users can't fix bad SMs.
          // var sm = smparser.parse(nodeLex + '@START')[0];
          // var m = typeof sm.node === "string" || "@value" in sm.node
          //     ? null
          //     : tpToM(sm.node);

          m = nodeLex.match(RegExp("^"+ParseTriplePattern+"$"));
          if (m) {
            target = evt.target;
            var selStart = target.selectionStart;
            scrollLeft = target.scrollLeft;
            terms = [0, 1, 2].reduce((acc, ord) => {
              if (m[(ord+1)*2-1] !== undefined) {
                var at = acc.start + m[(ord+1)*2-1].length;
                var len = m[(ord+1)*2] ? m[(ord+1)*2].length : 0;
                return {
                  start: at + len,
                  tz: acc.tz.concat([[at, len]]),
                  match: acc.match === null && at + len >= selStart ?
                    ord :
                    acc.match
                };
              } else {
                return acc;
              }
            }, {start: 0, tz: [], match: null });
            function norm (tz) {
              return tz.map(t => {
                return t.startsWith('!')
                  ? {name: "- " + t.substr(1) + " -", ignore: true}
                  : {name: Caches.inputData.meta.termToLex(t)}; // !!check
              });
            }
            const queryMapKeywords = [{name: "FOCUS"}, {name: "_"}];
            const getTermsFunctions = [
              () => { return queryMapKeywords.concat(norm(store.getSubjects())); },
              () => { return norm(store.getPredicates()); },
              () => { return queryMapKeywords.concat(norm(store.getObjects())); },
            ];
            var store = Caches.inputData.refresh();
            var items = [];
            if (terms.match === null)
              return false; // prevent contextMenu from whining about an empty list
            items = getTermsFunctions[terms.match]();
            return {
              items:
              items.reduce((ret, opt) => {
                ret[opt.name] = opt;
                return ret;
              }, {})
            };
            
          } else if (nodeLex && shapeLex) {
            try {
              var smparser = ShEx.ShapeMapParser.construct(
                Caches.shapeMap.meta.base, Caches.inputSchema.meta, Caches.inputData.meta);
              var sm = smparser.parse(nodeLex + '@' + shapeLex)[0];
              if (sm.node.language === EXTENSION_sparql) {
                let q = sm.node.lexical;
                let obj = {}
                obj[MENU_ITEM_materialize] = { name: MENU_ITEM_materialize };
                return {
                  items: ShEx.Util.executeQuery(q, Caches.inputData.endpoint).reduce(
                    (ret, row) => {
                      let name = lexifyFirstColumn(row);
                      ret[name] = { name: name };
                      return ret;
                    }, obj
                  )
                }
              }
            } catch (e) {
              failMessage(e, "query");
              return false
            }
          }
        }
        terms = nodeLex = null;
        try {
          return {
            items: cache.getItems().reduce((ret, opt) => {
              ret[opt] = { name: opt };
              return ret;
            }, {})
          };
        } catch (e) {
          failMessage(e, cache === Caches.inputSchema ? "parsing schema" : "parsing data");
          let items = {};
          const failContent = "no choices found";
          items[failContent] = failContent;
          return { items: items }
        }

        // hack to emulate regex parsing product
        // function tpToM (tp) {
        //   return [nodeLex, '{', lex(tp.subject), " ", lex(tp.predicate), " ", lex(tp.object), "", "}", ""];
        //   function lex (node) {
        //     return node === ShEx.ShapeMap.focus
        //       ? "FOCUS"
        //       : node === null
        //       ? "_"
        //       : Caches.inputData.meta.termToLex(node);
        //   }
        // }
      }
    });
}

prepareControls();
prepareDragAndDrop();
loadSearchParameters().then(
  () => {
    if ('_testCallback' in window) {
      window._testCallback()
    }
  }).catch(
    e => {
    if ('_testCallback' in window) {
      window._testCallback(e)
    }
    }
  )

