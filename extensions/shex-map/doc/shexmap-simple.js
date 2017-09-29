// shexmap-simple - Simple ShEx2 validator for HTML.
// Copyright 2017 Eric Prud'hommeux
// Release under MIT License.

const START_SHAPE_LABEL = "START";
const START_SHAPE_INDEX_ENTRY = "- start -"; // specificially not a JSON-LD @id form.
var DefaultBase = location.origin + location.pathname;
var Caches = {};
Caches.inputSchema = makeSchemaCache($("#inputSchema textarea.schema"));
Caches.inputData = makeTurtleCache($("#inputData textarea"));
Caches.examples = makeExamplesCache($("#exampleDrop"));
Caches.shapeMap = makeShapeMapCache($("#shapeMap-tabs")); // @@ rename to #shapeMap
Caches.bindings = makeJSONCache($("#bindings1 textarea"));
Caches.statics = makeJSONCache($("#staticVars textarea"));
Caches.outputSchema = makeSchemaCache($("#outputSchema textarea"));
var ShExRSchema; // defined below

const uri = "<[^>]*>|[a-zA-Z0-9_-]*:[a-zA-Z0-9_-]*";
const uriOrKey = uri + "|FOCUS|_";
const ParseTriplePattern = RegExp("^(\\s*{\\s*)("+
                                uriOrKey+")?(\\s*)("+
                                uri+"|a)?(\\s*)("+
                                uriOrKey+")?(\\s*)(})?(\\s*)$");

var QueryParams = [
  {queryStringParm: "schema",       location: Caches.inputSchema.selection, cache: Caches.inputSchema },
  {queryStringParm: "data",         location: Caches.inputData.selection,   cache: Caches.inputData   },
  {queryStringParm: "shape-map",    location: Caches.shapeMap.selection,    cache: Caches.shapeMap    },
  {queryStringParm: "shape-map",    location: $("#textMap")                             },
  {queryStringParm: "interface",    location: $("#interface"),       deflt: "human"     },
  {queryStringParm: "regexpEngine", location: $("#regexpEngine"),    deflt: "threaded-val-nerr" },
  {queryStringParm: "bindings",     location: Caches.bindings.selection,    cache: Caches.bindings    },
  {queryStringParm: "statics",      location: Caches.statics.selection,     cache: Caches.statics     },
  {queryStringParm: "outSchema",    location: Caches.outputSchema.selection,cache: Caches.outputSchema},
];

// utility functions
function parseTurtle (text, meta, base) {
  var ret = ShEx.N3.Store();
  ShEx.N3.Parser._resetBlankNodeIds();
  var parser = ShEx.N3.Parser({documentIRI: base, format: "text/turtle" });
  var triples = parser.parse(text);
  if (triples !== undefined)
    ret.addTriples(triples);
  meta.base = parser._base;
  meta.prefixes = parser._prefixes;
  return ret;
}

var shexParser = ShEx.Parser.construct(DefaultBase);
function parseShEx (text, meta, base) {
  shexParser._setOptions({duplicateShape: $("#duplicateShape").val()});
  shexParser._setBase(base);
  var ret = shexParser.parse(text);
  // ret = ShEx.Util.canonicalize(ret, DefaultBase);
  meta.base = ret.base;
  meta.prefixes = ret.prefixes;
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
  if (node.indexOf(resolver._base) === 0 &&
      ['#', '?'].indexOf(node.substr(resolver._base.length)) !== -1)
    return "<" + node.substr(resolver._base.length) + ">";
  if (node.indexOf(resolver._basePath) === 0 &&
      ['#', '?', '/', '\\'].indexOf(node.substr(resolver._basePath.length)) === -1)
    return "<" + node.substr(resolver._basePath.length) + ">";
  return ShEx.N3.Writer({ prefixes:resolver.meta.prefixes || {} })._encodeObject(node);
}
function rdflib_lexToTerm (lex, resolver) {
  return lex === START_SHAPE_LABEL ? ShEx.Validator.start :
    lex === "a" ? "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" :
    ShEx.N3.Lexer().tokenize(lex).map(token => {
    var left = 
          token.type === "typeIRI" ? "^^" :
          token.type === "langcode" ? "@" :
          token.type === "type" ? resolver.meta.prefixes[token.prefix] :
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
      this.url = base;
    },
    refresh: function () {
      if (!_dirty)
        return this.parsed;
      this.parsed = this.parse(selection.val(), this.url);
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
          dataType: "text"
        }).fail(function (jqXHR, textStatus) {
          var error = jqXHR.statusText === "OK" ? textStatus : jqXHR.statusText;
          reject({
            type: "HTTP",
            url: url,
            error: error,
            message: "GET <" + url + "> failed: " + error
          });
        }).done(function (data) {
          try {
            _cache.meta.base = url;
            resolver._setBase(url);
            _cache.set(data, url);
            $("#loadForm").dialog("close");
            toggleControls();
            resolve({ url: url, data: data });
          } catch (e) {
            reject({
              type: "evaluation",
              url: url,
              error: e,
              message: "unable to evaluate <" + url + ">: " + e
            });
          }
        });
      });
    }
  };
  resolver = new IRIResolver(ret.meta);
  ret.meta.termToLex = function (lex) { return  rdflib_termToLex(lex, resolver); };
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
        if (db.getTriples().length === 0)
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
      var schemaRoot = graph.getTriples(null, ShEx.Util.RDF.type, "http://www.w3.org/ns/shex#Schema")[0].subject;
      var val = graphParser.validate(graph, schemaRoot); // start shape
      return ShEx.Util.ShExJtoAS(ShEx.Util.ShExRtoShExJ(ShEx.Util.valuesToSchema(ShEx.Util.valToValues(val))));
    }
  };
  ret.getItems = function () {
    var obj = this.refresh();
    var start = "start" in obj ? [START_SHAPE_LABEL] : [];
    var rest = "shapes" in obj ? Object.keys(obj.shapes).map(Caches.inputSchema.meta.termToLex) : [];
    return start.concat(rest);
  };
  return ret;
}

function makeTurtleCache (selection) {
  var ret = _makeCache(selection);
  ret.parse = function (text, base) {
    return parseTurtle(text, ret.meta, base);
  };
  ret.getItems = function () {
    var data = this.refresh();
    return data.getTriples().map(t => {
      return Caches.inputData.meta.termToLex(t.subject);
    });
  };
  return ret;
}

function makeExamplesCache (selection) {
  var ret = _makeCache(selection);
  ret.set = function (textOrObj, url, source) {
    clearAll();
    if (typeof textOrObj !== "object") {
      try {
        textOrObj = JSON.parse(textOrObj);
      } catch (e) {
        textOrObj = eval(textOrObj); // exceptions pass through to caller (asyncGet)
      }
    }
    if (textOrObj.constructor !== Array)
      textOrObj = [textOrObj];
    var demos = [];
    Promise.all(textOrObj.reduce((outer, elt) => {
      if ("action" in elt) {
        // compatibility with test suite structure.
        var action = elt.action;
        var demoSet = {
          name: elt["@id"],
          schema: action.schema,
          schemaURL: action.schemaURL || url,
          fails: [],
          passes: [],
        };
        if ("termResolver" in action || "termResolverURL" in action) {
          demoSet.meta = action.termResolver;
          demoSet.metaURL = action.termResolverURL || DefaultBase;
        }
        var target = elt["@type"] === "sht:ValidationFailure" ? demoSet.fails : demoSet.passes;
        var queryMap = "map" in action ?
            action.map :
            ttl(action.focus) + "@" + ("shape" in action ? ttl(action.shape) : "START");
        var d = {
          name: "name" in action ? action.name : queryMap,
          data: action.data,
          dataURL: action.dataURL || DefaultBase,
          queryMap: queryMap
        };
      // target[name] = d;
        target.push(d);
        elt = demoSet;
      }
      // demos[elt["@id"]] = demoSet;
      demos.push(elt);
      return outer.concat(
        Promise.resolve(elt.schemaURL),
        maybeGET(elt, url, "schema", "text/shex,application/jsonld,text/turtle"),
        maybeGET(elt, url, "termResolver", "text/turtle"),
        ["passes", "fails"].reduce((inner, k) => {
          return inner.concat(elt[k].map(d => {
            return maybeGET(d, url, "data", "text/turtle");
          }));
        }, []));
    }, [])).then(() => {
      // if (!($("#append").is(":checked")))
      //   ...;
      prepareExamples(demos);
    }).catch(e => {
      var whence = source === undefined ? "<" + url  + ">" : source;
      results.append($("<pre/>").text(
        "failed to load examples from " + whence + ":\n" + JSON.stringify(demos, null, 2) + (e.stack || e)
      ).addClass("error"));
    });
  };
  ret.parse = function (text, base) {
    throw Error("should not try to parse examples cache");
  };
  ret.getItems = function () {
    throw Error("should not try to get examples cache items");
  };
  return ret;

        function maybeGET(obj, base, key, accept) {
          if (obj[key] != null) {
            // Take the passed data, guess base if not provided.
            if (!(key + "URL" in obj))
              obj[key + "URL"] = base;
            return Promise.resolve();
          } else if (key + "URL" in obj) {
            // absolutize the URL
            obj[key + "URL"] = ret.meta.lexToTerm("<"+obj[key + "URL"]+">");
            // Load the remote resource.
            return $.ajax({
              accepts: {
                mycustomtype: accept
              },
              url: ret.meta.lexToTerm("<"+obj[key + "URL"]+">"),
              dataType: "text"
            }).then(text => {
              obj[key] = text;
            }).fail(e => {
              results.append($("<pre/>").text(
                "Error " + e.status + " " + e.statusText + " on GET " + obj[key + "URL"]
              ).addClass("error"));
            });
          } else {
            // Ignore this parameter.
            return Promise.resolve();
          }
        }

        function ttl (ld) {
          return typeof ld === "object" ? lit(ld) :
            ld.startsWith("_:") ? ld :
            "<" + ld + ">";
          function lit (o) {
            let ret = "\""+o["@value"]+"\"";
            if ("@type" in o)
              ret += "^^<" + o["@type"] + ">";
            if ("language" in o)
              ret += "@" + o["language"];
            return ret;
          }
        }
}

function makeShapeMapCache (selection) {
  var ret = _makeCache(selection);
  ret.set = function (text) {
    removeEditMapPair(null);
    $("#textMap").val(text);
    copyTextMapToEditMap();
    copyEditMapToFixedMap();
  };
  ret.parse = function (text, base) {
    throw Error("should not try to parse examples cache");
  };
  ret.getItems = function () {
    throw Error("should not try to get examples cache items");
  };
  return ret;
}

function makeJSONCache(selection) {
  var ret = _makeCache(selection);
  ret.parse = function (text) {
    return JSON.parse(text);
  };
  return ret;
}

// controls for example links
function load (selector, list, func, listItems, side, str) {
  $(selector).empty();
  list.forEach(entry => {
    var li = $("<li/>").append($("<button/>").text(entry.name));
    li.on("click", () => {
      func(entry.name, entry, li, listItems, side);
    });
    listItems[side][sum(str(entry))] = li;
    $(selector).append(li);
  });
}

function clearData () {
  Caches.inputData.set("", DefaultBase);
  $(".focus").val("");
  $("#inputData .status").text(" ");
  results.clear();
}

function clearAll () {
  $("#results .status").hide();
  Caches.inputSchema.set("", DefaultBase);
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
    Caches.inputSchema.set(schemaTest.schema, schemaTest.schemaURL || DefaultBase);
    $("#inputSchema .status").text(name);

    Caches.inputData.set("", DefaultBase);
    $("#inputData .status").text(" ");
    $("#inputData .passes, #inputData .fails").show();
    $("#inputData .passes p:first").text("Passing:");
    load("#inputData .passes ul", schemaTest.passes, pickData, listItems, "inputData", function (o) { return o.data; });
    $("#inputData .fails p:first").text("Failing:");
    load("#inputData .fails ul", schemaTest.fails, pickData, listItems, "inputData", function (o) { return o.data; });

    results.clear();
    $("#inputSchema li.selected").removeClass("selected");
    $(elt).addClass("selected");
    $("input.schema").val(Caches.inputSchema.getItems()[0]);
  }
}

function pickData (name, dataTest, elt, listItems, side) {
  if ($(elt).hasClass("selected")) {
    clearData();
    $(elt).removeClass("selected");
  } else {
    Caches.inputData.set(dataTest.data, dataTest.dataURL || DefaultBase);
    $("#inputData .status").text(name);
    $("#inputData li.selected").removeClass("selected");
    $(elt).addClass("selected");
    //    $("input.data").val(getDataNodes()[0]);
    // hard-code the first node/shape pair
    // $("#focus0").val(dataTest.inputShapeMap[0].node); // inputNode in Map-test
    // $("#inputShape0").val(dataTest.inputShapeMap[0].shape); // srcSchema.start in Map-test
    removeEditMapPair(null);
    $("#textMap").val(dataTest.queryMap);
    copyTextMapToEditMap();

    Caches.outputSchema.set(dataTest.outputSchema);
    $("#outputSchema .status").text(name);
    Caches.statics.set(JSON.stringify(dataTest.staticVars, null, "  "));
    $("#staticVars .status").text(name);

    $("#outputShape").val(dataTest.outputShape); // targetSchema.start in Map-test
    $("#createRoot").val(dataTest.createRoot); // createRoot in Map-test
    // validate();
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
    }
  };
})();


// Validation UI
function disableResultsAndValidate () {
  results.start();
  setTimeout(function () {
    copyEditMapToTextMap();
    validate();
  }, 0);
}

function hasFocusNode () {
  return $(".focus").map((idx, elt) => {
    return $(elt).val();
  }).get().some(str => {
    return str.length > 0;
  });
}

function validate () {
  results.clear();
  $("#fixedMap .pair").removeClass("passes fails");
  $("#results .status").hide();
  var parsing = "input schema";
  try {
    noStack(() => { Caches.inputSchema.refresh(); });
    $("#schemaDialect").text(Caches.inputSchema.language);
    var dataText = Caches.inputData.get();
    if (dataText || hasFocusNode()) {
      parsing = "input data";
      noStack(() => { Caches.inputData.refresh(); }); // for prefixes for getShapeMap
      // $("#shapeMap-tabs").tabs("option", "active", 2); // select fixedMap
      var fixedMap = fixedShapeMapToTerms($("#fixedMap tr").map((idx, tr) => {
        return {
          nodeSelector: $(tr).find("input.focus").val(),
          shapeLabel: $(tr).find("input.inputShape").val()
        };
      }).get());
      $("#results .status").text("parsing data...").show();
      var inputData = Caches.inputData.refresh();

      $("#results .status").text("creating validator...").show();
      // var dataURL = "data:text/json," +
      //     JSON.stringify(
      //       ShEx.Util.AStoShExJ(
      //         ShEx.Util.canonicalize(
      //           Caches.inputSchema.refresh())));
      var alreadLoaded = {
        schema: Caches.inputSchema.refresh(),
        url: Caches.inputSchema.url || DefaultBase
      };
      ShEx.Loader.load([alreadLoaded], [], [], []).then(loaded => {
        var validator = ShEx.Validator.construct(
          loaded.schema,
          { results: "api", regexModule: ShEx[$("#regexpEngine").val()] });
        ShExMap.register(validator);

        $("#results .status").text("validating...").show();
        var ret = validator.validate(inputData, fixedMap);
        // var dated = Object.assign({ _when: new Date().toISOString() }, ret);
        $("#results .status").text("rendering results...").show();
        ret.forEach(renderEntry);
        // for debugging values and schema formats:
        // try {
        //   var x = ShExUtil.valToValues(ret);
        //   // var x = ShExUtil.ShExJtoAS(valuesToSchema(valToValues(ret)));
        //   res = results.replace(JSON.stringify(x, null, "  "));
        //   var y = ShExUtil.valuesToSchema(x);
        //   res = results.append(JSON.stringify(y, null, "  "));
        // } catch (e) {
        //   console.dir(e);
        // }
        finishRendering();
      }).catch(function (e) {
        failMessage(e);
      });
    } else {
      var outputLanguage = Caches.inputSchema.language === "ShExJ" ? "ShExC" : "ShExJ";
      $("#results .status").
        text("parsed "+Caches.inputSchema.language+" schema, generated "+outputLanguage+" ").
        append($("<button>(copy to input)</button>").
               css("border-radius", ".5em").
               on("click", function () {
                 Caches.inputSchema.set($("#results div").text(), DefaultBase);
               })).
        append(":").
        show();
      var parsedSchema;
      if (Caches.inputSchema.language === "ShExJ") {
        new ShEx.Writer({simplifyParentheses: false}).writeSchema(Caches.inputSchema.parsed, (error, text) => {
          if (error) {
            $("#results .status").text("unwritable ShExJ schema:\n" + error).show();
            // res.addClass("error");
          } else {
            results.append($("<pre/>").text(text).addClass("passes"));
          }
        });
      } else {
        var pre = $("<pre/>");
        pre.text(JSON.stringify(ShEx.Util.AStoShExJ(ShEx.Util.canonicalize(Caches.inputSchema.parsed)), null, "  ")).addClass("passes");
        results.append(pre);
      }
      results.finish();
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
    failMessage(e);
  }

  function renderEntry (entry) {
    var fails = entry.status === "nonconformant";
    var klass = fails ? "fails" : "passes";
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
      // fall through to default
    default:
      elt = $("<pre/>").text(JSON.stringify(entry, null, "  ")).addClass(klass);
    }
    results.append(elt);

    // update the FixedMap
    var shapeString = entry.shape === ShEx.Validator.start ?
        START_SHAPE_INDEX_ENTRY :
        entry.shape;
    var fixedMapEntry = $("#fixedMap .pair"+
                          "[data-node='"+entry.node+"']"+
                          "[data-shape='"+shapeString+"']");
    fixedMapEntry.addClass(klass).find("a").text(resultStr);
    var nodeLex = fixedMapEntry.find("input.focus").val();
    var shapeLex = fixedMapEntry.find("input.inputShape").val();
    var anchor = encodeURIComponent(nodeLex) + "@" + encodeURIComponent(shapeLex);
    elt.attr("id", anchor);
    fixedMapEntry.find("a").attr("href", "#" + anchor);

    if (entry.status === "conformant") {
      var resultBindings = ShEx.Util.valToExtension(entry.appinfo, ShExMap.url);
      Caches.bindings.set(JSON.stringify(resultBindings, null, "  "));
    } else {
      Caches.bindings.set("{}");
    }
  }

  function finishRendering () {
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

  function failMessage (e) {
    $("#results .status").empty().append("error parsing " + parsing + ":\n").addClass("error");
    results.append($("<pre/>").text(e.stack || e));
  }
}

function materialize () {
  if (Caches.bindings.get().trim().length === 0) {
    results.replace("You must validate data against a ShExMap schema to populate mappings bindings.").
      removeClass("passes fails").addClass("error");
    return;
  }
  results.start();
  var parsing = "output schema";
  try {
    var outputSchemaText = Caches.outputSchema.selection.val();
    var outputSchemaIsJSON = outputSchemaText.match(/^\s*\{/);
    var outputSchema = Caches.outputSchema.refresh();

    // var resultBindings = Object.assign(
    //   Caches.statics.refresh(),
    //   Caches.bindings.refresh()
    // );

    function _dup (obj) { return JSON.parse(JSON.stringify(obj)); }
    var resultBindings = _dup(Caches.bindings.refresh());
    if (Caches.statics.get().trim().length === 0)
      Caches.statics.set("{  }");
    var _t = Caches.statics.refresh();
    if (_t && Object.keys(_t) > 0) {
      if (resultBindings.constructor !== Array)
        resultBindings = [resultBindings];
      resultBindings.unshift(_t);
    }

    var mapper = ShExMap.materializer(outputSchema);
    var outputShapeMap = fixedShapeMapToTerms([{
      nodeSelector: $("#createRoot").val(),
      shapeLabel: $("#outputShape").val() // resolve with Caches.outputSchema
    }]);
    var writer = ShEx.N3.Writer({ prefixes: {} });
    outputShapeMap.forEach(pair => {
      var outputGraph = mapper.materialize(resultBindings, pair.nodeSelector, pair.shapeLabel);
      writer.addTriples(outputGraph.getTriples());
    });
    writer.end(function (error, result) {
      $("#results div").empty();
      results.append($("<pre/>").text(result));
    });
  } catch (e) {
    results.replace("error parsing " + parsing + ":\n" + e).
      removeClass("passes fails").addClass("error");
  }
  results.finish();
}

function addEditMapPair (evt, pairs) {
  if (evt) {
    pairs = [{node: "", shape: ""}];
    markEditMapDirty();
  }
  pairs.forEach(pair => {
    var spanElt = $("<tr/>", {class: "pair"});
    var focusElt = $("<input/>", {
      type: 'text',
      value: pair.node,
      class: 'data focus'
    }).on("change", markEditMapDirty);
    var shapeElt = $("<input/>", {
      type: 'text',
      value: pair.shape,
      class: 'schema inputShape'
    }).on("change", markEditMapDirty);
    var addElt = $("<button/>", {
      class: "addPair",
      title: "add a node/shape pair"}).text("+");
    var removeElt = $("<button/>", {
      class: "removePair",
      title: "remove this node/shape pair"}).text("-");
    addElt.on("click", addEditMapPair);
    removeElt.on("click", removeEditMapPair);
    spanElt.append([focusElt, "@", shapeElt, addElt, removeElt].map(elt => {
      return $("<td/>").append(elt);
    }));
    if (evt) {
      $(evt.target).parent().parent().after(spanElt);
    } else {
      $("#editMap").append(spanElt);
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
  $("#materialize").on("click", materialize);
  $("#clear").on("click", clearAll);

  $("#loadForm").dialog({
    autoOpen: false,
    modal: true,
    buttons: {
      "GET": function (evt, ui) {
        var target =
            $("#loadForm span").text() === "schema" ? Caches.inputSchema :
            $("#loadForm span").text() === "data" ? Caches.inputData :
            Caches.examples;
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
        target.asyncGet(url).catch(function (e) {
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
  ["schema", "data", "examples"].forEach(type => {
    $("#load-"+type+"-button").click(evt => {
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
  $("#textMap").on("change", evt => {
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

function setInterface (evt) {
  toggleControls();
  customizeInterface();
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
}

function markEditMapClean () {
  $("#editMap").attr("data-dirty", false);
}

/** getShapeMap -- zip a node list and a shape list into a ShapeMap
 * use {Caches.inputData,Caches.inputSchema}.meta.{prefix,base} to complete IRIs
 */
function copyEditMapToFixedMap () {
  $("#fixedMap").empty();
  var mapAndErrors = $("#editMap .pair").get().reduce((acc, queryPair) => {
    var nodeSelector = $(queryPair).find(".focus").val();
    var shape = $(queryPair).find(".inputShape").val();
    if (!nodeSelector || !shape)
      return acc;
    var m = nodeSelector.match(ParseTriplePattern);
    var nodes = m ? getTriples (m[2], m[4], m[6]) : [nodeSelector];
    nodes.forEach(node => {
      var nodeTerm = Caches.inputData.meta.lexToTerm(node);
      var shapeTerm = Caches.inputSchema.meta.lexToTerm(shape);
      if (shapeTerm === ShEx.Validator.start)
        shapeTerm = START_SHAPE_INDEX_ENTRY;
      var key = nodeTerm + "|" + shapeTerm;
      if (key in acc)
        return;

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
      spanElt.append([focusElt, "@", shapeElt, removeElt, $("<a/>")].map(elt => {
      return $("<td/>").append(elt);
    }));

      $("#fixedMap").append(spanElt);
      acc[key] = spanElt; // just needs the key so far.
    });

    return acc;
  }, {});

  // scroll inputs to right
  $("#fixedMap input").each((idx, focusElt) => {
    focusElt.scrollLeft = focusElt.scrollWidth;
  });

  function getTriples (s, p, o) {
    var get = s === "FOCUS" ? "subject" : "object";
    return Caches.inputData.refresh().getTriplesByIRI(mine(s), mine(p), mine(o)).map(t => {
      return Caches.inputData.meta.termToLex(t[get]);
    });
    function mine (term) {
      return term === "FOCUS" || term === "_" ? null : Caches.inputData.meta.lexToTerm(term);
    }
  }
}

function copyEditMapToTextMap () {
  if ($("#editMap").attr("data-dirty") === "true") {
    var text = $("#editMap .pair").get().reduce((acc, queryPair) => {
      var nodeSelector = $(queryPair).find(".focus").val();
      var shape = $(queryPair).find(".inputShape").val();
      if (!nodeSelector || !shape)
        return acc;
      return acc.concat([nodeSelector+"@"+shape]);
    }, []).join(",\n");
    $("#textMap").empty().val(text);
    copyEditMapToFixedMap();
    markEditMapClean();
  }
}

/** copyTextMapToEditMap - parse a supplied query map and build #editMap
 */
function copyTextMapToEditMap (shapeMap) {
  var shapeMap = $("#textMap").val();
  $("#editMap").empty();
  if (shapeMap.trim() === "") {
    makeFreshEditMap();
    return;
  }

  //     "(?:(<[^>]*>)|((?:[^\\@,]|\\[@,])+))" catches components
  var s = "((?:<[^>]*>)|(?:[^\\@,]|\\[@,])+)";
  var pairPattern = "(" + s + "|" + ParseTriplePattern + ")" + "@" + s + ",?";
  // e.g.: shapeMao = "my:n1@my:Shape1,<n2>@<Shape2>,my:n\\@3:.@<Shape3>";
  var pairs = (shapeMap + ",").match(/([^,\\]|\\.)+,/g).
      map(s => s.substr(0, s.length-1)); // trim ','s

  pairs.forEach(r2 => {
    var m = r2.match(/^\s*((?:[^@\\]|\\@)*?)\s*@\s*((?:[^@\\]|\\@)*?)\s*$/);
    if (m) {
      var node = m[1] || "";
      var shape = m[2] || "";
      addEditMapPair(null, [{node: node, shape: shape}]);
    }
  });
  copyEditMapToFixedMap();
  markEditMapClean();
}

function makeFreshEditMap () {
  addEditMapPair(null, [{node: "", shape: ""}]);
  markEditMapClean();
}

/** fixedShapeMapToTerms -- map ShapeMap to API terms
 * @@TODO: add to ShExValidator so API accepts ShapeMap
 */
function fixedShapeMapToTerms (shapeMap) {
  return shapeMap.map(pair => {
    return {nodeSelector: Caches.inputData.meta.lexToTerm(pair.nodeSelector),
            shapeLabel: Caches.inputSchema.meta.lexToTerm(pair.shapeLabel)};
  });
}

/**
 * Load URL search parameters
 */
function prepareInterface () {
  // don't overwrite if we arrived here from going back for forth in history
  if (Caches.inputSchema.selection.val() !== "" || Caches.inputData.selection.val() !== "")
    return;

  var iface = parseQueryString(location.search);

  toggleControlsArrow("down");

  if ("output-map" in iface)
    parseShapeMap("output-map", function (node, shape) {
      // only works for one n/s pair
      $("#createNode").val(node);
      $("#outputShape").val(shape);
    });

  // Load all known query parameters.
  Promise.all(QueryParams.reduce((promises, input) => {
    var parm = input.queryStringParm;
    if (parm + "URL" in iface) {
      var url = iface[parm + "URL"][0];
      // !!! set anyways in asyncGet?
      input.cache.url = url; // all fooURL query parms are caches.
      promises.push(input.cache.asyncGet(url).catch(function (e) {
        input.location.val(e.message);
        // results.append($("<pre/>").text(e.url + " " + e.error).addClass("error"));
      }));
    } else if (parm in iface) {
      input.location.val("");
      iface[parm].forEach(text => {
        var prepend = input.location.prop("tagName") === "TEXTAREA" ?
            input.location.val() :
            "";
        input.location.val(prepend + text);
      });
      if ("cache" in input)
        // If it parses, make meta (prefixes, base) available.
        try {
          input.cache.refresh();
        } catch (e) { }
    } else if ("deflt" in input) {
      input.location.val(input.deflt);
    }
    return promises;
  }, [])).then(function (_) {

    // Parse the shape-map using the prefixes and base.
    if ($("#textMap").val().trim().length > 0)
      copyTextMapToEditMap();
    else
      makeFreshEditMap();

    customizeInterface();
    $(".examples li").text("no example schemas loaded");
    var loadExamples = "examples" in iface ? iface.examples[0] : "./examples.js";
    if (loadExamples.length) { // examples= disables examples
      Caches.examples.asyncGet(Caches.examples.meta.lexToTerm("<"+loadExamples+">"))
      .catch(function (e) {
        $(".examples li").text(e.message);
      });
    }
    $("body").keydown(function (e) { // keydown because we need to preventDefault
      var code = e.keyCode || e.charCode; // standards anyone?
      if (e.ctrlKey && (code === 10 || code === 13)) {
        var at = $(":focus");
        $("#validate").focus().click();
        at.focus();
        return false; // same as e.preventDefault();
      } else if (e.ctrlKey && e.key === "\\") {
        $("#materialize").click();
        return false; // same as e.preventDefault();
      } else {
        return true;
      }
    });
    addContextMenus("#focus0", Caches.inputData);
    addContextMenus("#inputShape0", Caches.inputSchema);
    addContextMenus("#outputShape", Caches.outputSchema);
    if ("schemaURL" in iface ||
        // some schema is non-empty
        ("schema" in iface &&
         iface.schema.reduce((r, elt) => { return r+elt.length; }, 0))) {
      validate();
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
      if (input.cache && input.cache.url) {
        parm += "URL";
        val = input.cache.url;
      }
      return parm.trim().length > 0 ?
        acc.concat(parm + "=" + encodeURIComponent(val)) :
        acc;
    }, []));
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
    $("#menuForm").removeAttr("style");
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
      {media: "application/json", target: Caches.examples},
      {ext: ".shex", media: "text/shex", target: Caches.inputSchema},
      {ext: ".ttl", media: "text/turtle", target: Caches.inputData},
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
                    var action = "action" in parsed ? parsed.action: parsed;
                    action.schemaURL = action.schema; delete action.schema;
                    action.dataURL = action.data; delete action.data;
                    Caches.examples.set(parsed, DefaultBase, "drag and drop");
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
                      inject(desc.targets, val, data, jqXhr.getResponseHeader("Content-Type").split(/[ ;,]/)[0]);
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
      } else {
        results.append("don't know what to do with " + name + "\n");
      }
    }
  }
}

function prepareExamples (demoList) {
  var listItems = Object.keys(Caches).reduce((acc, k) => {
    acc[k] = {};
    return acc;
  }, {});
  load("#inputSchema .examples ul", demoList, pickSchema,
       listItems, "inputSchema", function (o) {
         return o.schema;
       });
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
    }, 250);
  }
  Object.keys(Caches).forEach(function (cache) {
    Caches[cache].selection.keyup(function (e) { // keyup to capture backspace
      var code = e.keyCode || e.charCode;
      if (!(e.ctrlKey && (code === 10 || code === 13)))
        later(e.target, cache, Caches[cache]);
    });
  });
}

function addContextMenus (inputSelector, cache) {
    // !!! terribly stateful; only one context menu at a time!
    var terms = null, v = null, target, scrollLeft, m, addSpace = "";
    $.contextMenu({
      selector: inputSelector,
      callback: function (key, options) {
        markEditMapDirty();
        if (terms) {
          var term = terms.tz[terms.match];
          var val = v.substr(0, term[0]) +
              key + addSpace +
              v.substr(term[0] + term[1]);
          if (terms.match === 2 && !m[8])
            val = val + "}";
          else if (term[0] + term[1] === v.length)
            val = val + " ";
          $(options.selector).val(val);
          // target.scrollLeft = scrollLeft + val.length - v.length;
          target.scrollLeft = target.scrollWidth;
        } else {
          $(options.selector).val(key);
        }
      },
      build: function (elt, evt) {
        if (elt.hasClass("data")) {
          v = elt.val();
          m = v.match(ParseTriplePattern);
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
                return Caches.inputData.meta.termToLex(t);
              });
            }
            const getTermsFunctions = [
              () => { return ["FOCUS", "_"].concat(norm(store.getSubjects())); },
              () => { return norm(store.getPredicates()); },
              () => { return ["FOCUS", "_"].concat(norm(store.getObjects())); },
            ];
            var store = Caches.inputData.refresh();
            var items = [];
            if (terms.match === null)
              console.error("contextMenu will whine about \"No Items specified\". Shouldn't that be allowed?");
            else
              items = getTermsFunctions[terms.match]();
            return {
              items:
              items.reduce((ret, opt) => {
                ret[opt] = { name: opt };
                return ret;
              }, {})
            };
            
          }
        }
        terms = v = null;
        return {
          items:
          cache.getItems().reduce((ret, opt) => {
            ret[opt] = { name: opt };
            return ret;
          }, {})
        };
      }
    });
}

prepareControls();
prepareInterface();
prepareDragAndDrop();

