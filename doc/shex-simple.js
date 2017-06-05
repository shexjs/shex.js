// shex-simple - Simple ShEx2 validator for HTML.
// Copyright 2017 Eric Prud'hommeux
// Release under MIT License.

const START_SHAPE_LABEL = "- start -";
var Base = "http://a.example/" ; // "https://rawgit.com/shexSpec/shex.js/master/doc/shex-simple.html"; // window.location.href; 
var InputSchema = makeSchemaCache("#inputSchema textarea");
var InputData = makeTurtleCache("#inputData textarea");
var ShExRSchema; // defined below


// utility functions
function parseTurtle (text, meta) {
  var ret = N3Store();
  N3Parser._resetBlankNodeIds();
  var parser = N3Parser({documentIRI:Base, format: "text/turtle" });
  var triples = parser.parse(text);
  if (triples !== undefined)
    ret.addTriples(triples);
  meta.base = parser._base;
  meta.prefixes = parser._prefixes;
  var resolver = new IRIResolver(meta);
  meta.termToLex = function (lex) { return  rdflib_termToLex(lex, resolver); };
  meta.lexToTerm = function (lex) { return  rdflib_lexToTerm(lex, resolver); };
  return ret;
}

var shexParser = ShExParser.construct(Base);
function parseShEx (text, meta) {
  shexParser._setOptions({duplicateShape: $("#duplicateShape").val()});
  var ret = shexParser.parse(text);
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
  return node === "- start -" ? node : N3Writer({ prefixes:resolver.meta.prefixes || {} })._encodeObject(node);
}
function rdflib_lexToTerm (lex, resolver) {
  return lex === "- start -" ? lex : N3Lexer().tokenize(lex).map(token => {
    var left = 
          token.type === "typeIRI" ? "^^" :
          token.type === "langcode" ? "@" :
          token.type === "type" ? resolver.meta.prefixes[token.prefix] :
          token.type === "prefixed" ? resolver.meta.prefixes[token.prefix] :
          "";
    var right = token.type === "IRI" || token.type === "typeIRI" ?
          resolver._resolveAbsoluteIRI(token) :
          token.value;
    return left + right;
  }).join("");
  return lex === "- start -" ? lex : lex[0] === "<" ? lex.substr(1, lex.length - 2) : lex;
}
// </n3.js-specific>


// caches for textarea parsers
function _makeCache (parseSelector) {
  var _dirty = true;
  return {
    parseSelector: parseSelector,
    parsed: null,
    dirty: function (newVal) {
      var ret = _dirty;
      _dirty = newVal;
      return ret;
    },
    get: function () {
      return $(parseSelector).val();
    },
    set: function (text) {
      _dirty = true;
      $(parseSelector).val(text);
    },
    refresh: function () {
      if (!_dirty)
        return this.parsed;
      this.parsed = this.parse($(parseSelector).val());
      _dirty = false;
      return this.parsed;
    }
  };
}

function makeSchemaCache (parseSelector) {
  var ret = _makeCache(parseSelector);
  ret.meta = { prefixes: {}, base: null };
  var graph = null;
  ret.language = null;
  ret.parse = function (text) {
    var isJSON = text.match(/^\s*\{/);
    graph = isJSON ? null : tryN3(text);
    this.language =
      isJSON ? "ShExJ" :
      graph ? "ShExR" :
      "ShExC";
    $("#results .status").text("parsing "+this.language+" schema...").show();
    var schema =
          isJSON ? ShExUtil.ShExJtoAS(JSON.parse(text)) :
          graph ? parseShExR() :
          parseShEx(text, ret.meta);
    var resolver = new IRIResolver(ret.meta);
    ret.meta.termToLex = function (lex) { return  rdflib_termToLex(lex, resolver); };
    ret.meta.lexToTerm = function (lex) { return  rdflib_lexToTerm(lex, resolver); };
    $("#results .status").hide();
    return schema;

    function tryN3 (text) {
      try {
        if (text.match(/^\s*$/))
          return null;
        var db = parseTurtle (text, ret.meta); // interpret empty schema as ShExC
        if (db.getTriples().length === 0)
          return null;
        return db;
      } catch (e) {
        return null;
      }
    }

    function parseShExR () {
      var graphParser = ShExValidator.construct(
        parseShEx(ShExRSchema, {}), // !! do something useful with the meta parm (prefixes and base)
        {}
      );
      var schemaRoot = graph.getTriples(null, ShExUtil.RDF.type, "http://www.w3.org/ns/shex#Schema")[0].subject;
      var val = graphParser.validate(graph, schemaRoot); // start shape
      return ShExUtil.ShExJtoAS(ShExUtil.ShExRtoShExJ(ShExUtil.valuesToSchema(ShExUtil.valToValues(val))));
    }
  };
  ret.getShapes = function () {
    var obj = this.refresh();
    var start = "start" in obj ? [START_SHAPE_LABEL] : [];
    var rest = "shapes" in obj ? Object.keys(obj.shapes).map(InputSchema.meta.termToLex) : [];
    return start.concat(rest);
  };
  return ret;
}

function makeTurtleCache(parseSelector) {
  var ret = _makeCache(parseSelector);
  ret.meta = {};
  ret.endpoint = null,
  ret.query = null,
  ret.executeQuery = function (query, endpoint) {
    var rows;
    $.ajax({
      async: false,
      url: endpoint || ret.endpoint,
      data: { query: query },
      datatype: "xml",
      // datatype: "json",
      // accepts: { json: "application/sparql-results+json" },
      success : function(data) {
        if (endpoint)
          ret.endpoint = endpoint;
        ret.query = query;
        rows = []; // $.map flattens nested arrays.
        $(data).find("sparql > results > result").
          each((_, row) => {
            rows.push($(row).find("binding > *:nth-child(1)").
              map((idx, elt) => {
                elt = $(elt);
                var text = elt.text();
                switch (elt.prop("tagName")) {
                case "uri": return text;
                case "bnode": return "_:" + text;
                case "literal":
                  var datatype = elt.attr("datatype");
                  var lang = elt.attr("xml:lang");
                  return "\"" + text + "\"" + (
                    datatype ? "^^" + datatype :
                    lang ? "@" + lang :
                      "");
                default: throw "unknown XML results type: " + elt.prop("tagName");
                }
              }).get());
          });
      }
    });
    return rows;
  };
  ret.parse = function (text) {
    if (ret.query && ret.endpoint) {
      return {
        getTriplesByIRI: function (s, p, o) {
          var query = s ?
                `SELECT ?p ?o { <${s}> ?p ?o }`:
                `SELECT ?s ?p { ?s ?p <${o}> }`;
          var rows = ret.executeQuery(query);
          var triples = rows.map(row =>  {
            return s ? {
              subject: s,
              predicate: row[0],
              object: row[1]
            } : {
              subject: row[0],
              predicate: row[1],
              object: o
            };
          });
          return triples;
        }
      };
    }
    return parseTurtle(text, ret.meta);
  };
  ret.getNodes = function () {
    var text = this.get();
    var m = text.match(/^[\s]*Endpoint:[\s]*(https?:\/\/.*?)[\s]*\n[\s]*Query:[\s]*([\s\S]*?)$/i);
    if (m) {
      return ["- add all -"].concat(ret.executeQuery(m[2], m[1]).map(row => {
        return InputData.meta.termToLex(row[0]);
      }));
    } else {
      var data = this.refresh();
      return data.getTriples().map(t => {
        return InputData.meta.termToLex(t.subject);
      });
    }
  };
  return ret;
}

function IRIResolver (meta) {
  if (!(this instanceof IRIResolver))
    return new IRIResolver(options);
  this.meta = meta;
  this._setBase(meta.base);
};

var absoluteIRI = /^[a-z][a-z0-9+.-]*:/i,
    schemeAuthority = /^(?:([a-z][a-z0-9+.-]*:))?(?:\/\/[^\/]*)?/i,
    dotSegments = /(?:^|\/)\.\.?(?:$|[\/#?])/;
IRIResolver.prototype = {

  // vvv stolen from Ruben Vergorgh's N3Parser.js vvv
  // ### `_setBase` sets the base IRI to resolve relative IRIs
  _setBase: function (baseIRI) {
    if (!baseIRI)
      this._base = null;
    else {
      // Remove fragment if present
      var fragmentPos = baseIRI.indexOf('#');
      if (fragmentPos >= 0)
        baseIRI = baseIRI.substr(0, fragmentPos);
      // Set base IRI and its components
      this._base = baseIRI;
      this._basePath   = baseIRI.indexOf('/') < 0 ? baseIRI :
        baseIRI.replace(/[^\/?]*(?:\?.*)?$/, '');
      baseIRI = baseIRI.match(schemeAuthority);
      this._baseRoot   = baseIRI[0];
      this._baseScheme = baseIRI[1];
    }
  },

  // ### `_resolveIRI` resolves a relative IRI token against the base path,
  // assuming that a base path has been set and that the IRI is indeed relative
  _resolveIRI: function (token) {
    var iri = token.value;
    switch (iri[0]) {
      // An empty relative IRI indicates the base IRI
    case undefined: return this._base;
      // Resolve relative fragment IRIs against the base IRI
    case '#': return this._base + iri;
      // Resolve relative query string IRIs by replacing the query string
    case '?': return this._base.replace(/(?:\?.*)?$/, iri);
      // Resolve root-relative IRIs at the root of the base IRI
    case '/':
      // Resolve scheme-relative IRIs to the scheme
      return (iri[1] === '/' ? this._baseScheme : this._baseRoot) + this._removeDotSegments(iri);
      // Resolve all other IRIs at the base IRI's path
    default:
      return this._removeDotSegments(this._basePath + iri);
    }
  },

  // ### `_removeDotSegments` resolves './' and '../' path segments in an IRI as per RFC3986
  _removeDotSegments: function (iri) {
    // Don't modify the IRI if it does not contain any dot segments
    if (!dotSegments.test(iri))
      return iri;

    // Start with an imaginary slash before the IRI in order to resolve trailing './' and '../'
    var result = '', length = iri.length, i = -1, pathStart = -1, segmentStart = 0, next = '/';

    while (i < length) {
      switch (next) {
        // The path starts with the first slash after the authority
      case ':':
        if (pathStart < 0) {
          // Skip two slashes before the authority
          if (iri[++i] === '/' && iri[++i] === '/')
            // Skip to slash after the authority
            while ((pathStart = i + 1) < length && iri[pathStart] !== '/')
              i = pathStart;
        }
        break;
        // Don't modify a query string or fragment
      case '?':
      case '#':
        i = length;
        break;
        // Handle '/.' or '/..' path segments
      case '/':
        if (iri[i + 1] === '.') {
          next = iri[++i + 1];
          switch (next) {
            // Remove a '/.' segment
          case '/':
            result += iri.substring(segmentStart, i - 1);
            segmentStart = i + 1;
            break;
            // Remove a trailing '/.' segment
          case undefined:
          case '?':
          case '#':
            return result + iri.substring(segmentStart, i) + iri.substr(i + 1);
            // Remove a '/..' segment
          case '.':
            next = iri[++i + 1];
            if (next === undefined || next === '/' || next === '?' || next === '#') {
              result += iri.substring(segmentStart, i - 2);
              // Try to remove the parent path from result
              if ((segmentStart = result.lastIndexOf('/')) >= pathStart)
                result = result.substr(0, segmentStart);
              // Remove a trailing '/..' segment
              if (next !== '/')
                return result + '/' + iri.substr(i + 1);
              segmentStart = i + 1;
            }
          }
        }
      }
      next = iri[++i];
    }
    return result + iri.substring(segmentStart);
  },

  _resolveAbsoluteIRI: function  (token) {
    return (this._base === null || absoluteIRI.test(token.value)) ?
      token.value : this._resolveIRI(token);
  }
};


// controls for example links
function load (selector, obj, func, listItems, side, str) {
  $(selector).empty();
  Object.keys(obj).forEach(k => {
    var li = $('<li><a href="#">' + k + '</li>');
    li.on("click", () => {
      func(k, obj[k], li, listItems, side);
    });
    listItems[side][sum(str(obj[k]))] = li;
    $(selector).append(li);
  });
}

function clearData () {
  InputData.set("");
  $(".focus").val("");
  $("#inputData .status").text(" ");
  results.clear();
}

function clearAll () {
  $("#results .status").hide();
  InputSchema.set("");
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
    InputSchema.set(schemaTest.schema);
    $("#inputSchema .status").text(name);

    InputData.set("");
    $("#inputData .status").text(" ");
    $("#inputData .passes, #inputData .fails").show();
    $("#inputData .passes p:first").text("Passing:");
    load("#inputData .passes ul", schemaTest.passes, pickData, listItems, "inputData", function (o) { return o.data; });
    $("#inputData .fails p:first").text("Failing:");
    load("#inputData .fails ul", schemaTest.fails, pickData, listItems, "inputData", function (o) { return o.data; });

    results.clear();
    $("#inputSchema li.selected").removeClass("selected");
    $(elt).addClass("selected");
    $("input.schema").val(InputSchema.getShapes()[0]);
  }
}

function pickData (name, dataTest, elt, listItems, side) {
  if ($(elt).hasClass("selected")) {
    clearData();
    $(elt).removeClass("selected");
  } else {
    InputData.set(dataTest.data);
    $("#inputData .status").text(name);
    $("#inputData li.selected").removeClass("selected");
    $(elt).addClass("selected");
    //    $("input.data").val(getDataNodes()[0]);
    // hard-code the first node/shape pair
    removeNodeShapePair(null);
    // $("#focus0").val(dataTest.inputShapeMap[0].node); // inputNode in Map-test
    // $("#inputShape0").val(dataTest.inputShapeMap[0].shape); // srcSchema.start in Map-test
    // removeNodeShapePair(null);
    addNodeShapePair(null, dataTest.inputShapeMap); // add Map-test
    // validate();
  }
}


// Control results area content.
var results = (function () {
  var resultsElt = autosize(document.querySelector("#results div"));
  var resultsSel = $("#results div");
  return {
    replace: function (text) {
      var ret = resultsSel.text(text);
      autosize.update(resultsElt);
      return ret;
    },
    append: function (text) {
      var ret = resultsSel.append(text);
      autosize.update(resultsElt);
      return ret;
    },
    clear: function () {
      resultsSel.removeClass("passes fails error");
      var ret = resultsSel.text("");
      autosize.update(resultsElt);
      return ret;
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
  var interface = "interface" in iface ? iface.interface[0] : "simple";
  results.clear();
  $(".pair").removeClass("passes").removeClass("fails");
  $("#results .status").hide();
  var parsing = "input schema";
  try {
    InputSchema.refresh();
    $("#schemaDialect").text(InputSchema.language);
    InputData.refresh(); // for prefixes for getShapeMap
    var dataText = InputData.get();
    if (dataText || hasFocusNode()) {
      parsing = "input data";
      var shapeMap = shapeMapToTerms(parseUIShapeMap());
      $("#results .status").text("parsing data...").show();
      var inputData = InputData.refresh();

      $("#results .status").text("creating validator...").show();
      var validator = ShExValidator.construct(InputSchema.refresh(),
                      { results: "api"
                      /*, regexModule: modules["../lib/regex/nfax-val-1err"] */ });

      $("#results .status").text("validating...").show();
      var ret = validator.validate(inputData, shapeMap);
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
    } else {
      var outputLanguage = InputSchema.language === "ShExJ" ? "ShExC" : "ShExJ";
      $("#results .status").
        text("parsed "+InputSchema.language+" schema, generated "+outputLanguage+" ").
        append($("<button>(copy to input)</button>").
               css("border-radius", ".5em").
               on("click", function () {
                 InputSchema.set($("#results div").text());
               })).
        append(":").
        show();
      var parsedSchema;
      if (InputSchema.language === "ShExJ") {
        new ShExWriter({simplifyParentheses: false}).writeSchema(InputSchema.parsed, (error, text) => {
          if (error) {
            $("#results .status").text("unwritable ShExJ schema:\n" + error).show();
            // res.addClass("error");
          } else {
            results.append($("<pre/>").text(text).addClass("passes"));
          }
        });
      } else {
        var pre = $("<pre/>");
        pre.text(JSON.stringify(ShExUtil.AStoShExJ(ShExUtil.canonicalize(InputSchema.parsed)), null, "  ")).addClass("passes");
        results.append(pre);
      }
      results.finish();
    }
  } catch (e) {
    results.replace("error parsing " + parsing + ":\n").addClass("error").
      append($("<pre/>").text(e.stack || e));
  }

  function renderEntry (entry) {
    var fails = entry.status === "nonconformant";
    var klass = fails ? "fails" : "passes";

    // update the QueryMap
    $(".pair").filter((idx, elt) => {
      return $(elt).attr("data-node") === entry.node &&
        $(elt).attr("data-shape") === entry.shape;
    }).addClass(klass);

    switch (interface) {
    case "human":
      var elt = $("<div class='human'/>").text(
        `${InputSchema.meta.termToLex(entry.node)}@${fails ? "!" : ""}${InputData.meta.termToLex(entry.shape)}`
      ).addClass(klass);
      if (fails)
        elt.append($("<pre>").text(ShExUtil.errsToSimple(entry.appinfo).join("\n")));
      results.append(elt);
      break;
    case "simple":
      if (fails)
        entry.reason = ShExUtil.errsToSimple(entry.appinfo).join("\n");
      delete entry.appinfo;
      // fall through to default
    default:
      results.append($("<pre/>").text(JSON.stringify(entry, null, "  ")).
                     addClass(klass));
    }
  }

  function finishRendering () {
          $("#results .status").text("rendering results...").show();
          // Add commas to JSON results.
          if (interface !== "human")
            $("#results div *").each((idx, elt) => {
              if (idx === 0)
                $(elt).prepend("[");
              $(elt).append(idx === $("#results div *").length - 1 ? "]" : ",");
            });
      $("#results .status").hide();
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
      results.finish();
  }
}

function addNodeShapePair (evt, pairs) {
  if (evt)
    pairs = [{node: "", shape: ""}];
  pairs.forEach(pair => {
    var span = $("<li class='pair'/>");
    var focus = $("<input "+"' type='text' value='"+pair.node.replace(/['"]/g, "&quot;")+
                  "' class='data focus'/>");
    var shape = $("<input "+"' type='text' value='"+pair.shape.replace(/['"]/g, "&quot;")+
                  "' class='schema inputShape context-menu-one btn btn-neutral'/>");
    var add = $('<button class="addPair" title="add a node/shape pair">+</button>');
    var remove = $('<button class="removePair" title="remove this node/shape pair">-</button>');
    add.on("click", addNodeShapePair);
    remove.on("click", removeNodeShapePair);
    span.append(focus, " as ", shape, add, remove);
    if (evt) {
      $(evt.target).parent().after(span);
    } else {
      $("#shapeMap").append(span);
    }
  });
  if ($(".removePair").length === 1)
    $(".removePair").css("visibility", "hidden");
  else
    $(".removePair").css("visibility", "visible");
  $(".pair").each(idx => {
    addContextMenus(".pair:nth("+idx+") .focus", ".pair:nth("+idx+") .inputShape");
  });
  return false;
}

function removeNodeShapePair (evt) {
  if (evt) {
    $(evt.target).parent().remove();
  } else {
    $(".pair").remove();
  }
  if ($(".removePair").length === 1)
    $(".removePair").css("visibility", "hidden");
  return false;
}

function prepareControls () {
  $("#inputData .passes, #inputData .fails").hide();
  $("#inputData .passes ul, #inputData .fails ul").empty();
  $("#validate").on("click", disableResultsAndValidate);
  $("#clear").on("click", clearAll);

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

/** getShapeMap -- zip a node list and a shape list into a ShapeMap
 * use {InputData,InputSchema}.meta.{prefix,base} to complete IRIs
 */
function parseUIShapeMap () {
  var mapAndErrors = $(".pair").get().reduce((acc, pair) => {
    var node = $(pair).find(".focus").val();
    var shape = $(pair).find(".inputShape").val();
    $(pair).attr("data-node", InputData.meta.lexToTerm(node));
    $(pair).attr("data-shape", InputSchema.meta.lexToTerm(shape));
    if (node && shape)
      acc.shapeMap.push({node: node, shape: shape});
    return acc;

    // var node = "node-type" in iface ?
    //       ShExUtil.someNodeWithType(
    //         ShExUtil.parsePassedNode(iface["node-type"], {prefixes: {}, base: null}, null,
    //                                  label => {
    //                                    return (data.refresh().
    //                                            getTriplesByIRI(null, RDF_TYPE, label).length > 0);
    //                                  },
    //                                  loaded.data.prefixes)) :
    //     ShExUtil.parsePassedNode($(n).val(), data ? data.meta : {}, () => {
    //       var triples = data.refresh().getTriplesByIRI(null, null, null);
    //       return triples.length > 0 ? triples[0].subject : ShExUtil.NotSupplied;
    //     },
    //                              label => {
    //                                return (data.refresh().getTriplesByIRI(label, null, null).length > 0 ||
    //                                        data.refresh().getTriplesByIRI(null, null, label).length > 0);
    //                              });

    // if (node === ShExUtil.UnknownIRI)
    //   node = $(n).val();
    // else if (node === ShExUtil.NotSupplied)
    //   ret.errors.push("node not found: " + $(n).val());
    // var shape = $(shapes[i]).val() === "- start -" ? "- start -" :
    //       ShExUtil.parsePassedNode($(shapes[i]).val(), schema.meta, () => { Object.keys(schema.refresh().shapes)[0]; },
    //                                (label) => {
    //                                  return label in schema.refresh().shapes;
    //                                });
    // if (shape === ShExUtil.NotSupplied || shape === ShExUtil.UnknownIRI)
    //   throw Error("shape " + $(shapes[i]).val() + " not defined");
    // if (!shape)
    //   ret.errors.push("shape not found: " + $(shapes[i]).val());
    // if (node && shape)
    //   ret.shapeMap.push({node: node, shape: shape});
    // return ret;
  }, {shapeMap: [], errors: []});
  if (mapAndErrors.errors.length) // !! overwritten immediately
    results.append(mapAndErrors.errors.join("\n"));
  return mapAndErrors.shapeMap;
}

/** shapeMapToTerms -- map ShapeMap to API terms
 * @@TODO: add to ShExValidator so API accepts ShapeMap
 */
function shapeMapToTerms (shapeMap) {
  return shapeMap.map(pair => {
    return {node: InputData.meta.lexToTerm(pair.node),
            shape: InputSchema.meta.lexToTerm(pair.shape)};
  });
}

var iface = null; // needed by validate before prepareInterface returns.
/**
 * Load URL search parameters
 */
function prepareInterface () {
  // don't overwrite if we arrived here from going back for forth in history
  if ($("#inputSchema textarea").val() !== "" || $("#inputData textarea").val() !== "")
    return;

  iface = parseQueryString(location.search);
  if ("shape-map" in iface)
    parseShapeMap("shape-map");
  else
    addNodeShapePair(null, [{node: "", shape: ""}]);

  function parseShapeMap (queryParm) {
    var shapeMap =  iface[queryParm];
    delete iface[queryParm];
    //     "(?:(<[^>]*>)|((?:[^\\@,]|\\[@,])+))" catches components
    var s = "((?:<[^>]*>)|(?:[^\\@,]|\\[@,])+)";
    var pairPattern = s + "@" + s + ",?";
    iface.shapeMap = shapeMap.reduce(
      (r, b) => {
        // e.g.: b = "my:n1@my:Shape1,<n2>@<Shape2>,my:n\\@3:.@<Shape3>";
        var pairs = (b + ",").match(/([^,\\]|\\.)+,/g).
              map(s => s.substr(0, s.length-1)); // trim ','s
        pairs.forEach(r2 => {
          var m = r2.match(/^((?:[^@\\]|\\@)*)@((?:[^@\\]|\\@)*)$/);
          if (m) {
            var node = m[1] || "";
            var shape = m[2] || "";
            r[node] = node in r ? r[node].concat(shape) : [shape];
            addNodeShapePair(null, [{node: node, shape: shape}]);
          }
        });
        return r;
      }, {});
  }

  var QueryParams = [{queryStringParm: "schema", location: $("#inputSchema textarea")},
                     {queryStringParm: "data", location: $("#inputData textarea")}];
  QueryParams.forEach(input => {
    var parm = input.queryStringParm;
    if (parm in iface)
      iface[parm].forEach(text => {
        input.location.val(input.location.val() + text);
      });
  });
  if ("interface" in iface && iface.interface.indexOf("simple") !== -1) {
    $("#title").hide();
    $("#inputSchema .status").html("schema (<span id=\"schemaDialect\">ShEx</span>)").show();
    $("#inputData .status").html("data (<span id=\"dataDialect\">Turtle</span>)").show();
    $("#actions").parent().children().not("#actions").hide();
    // $("#actions").parent().hide();
    // $("#results .status").text("results:").show();
  }
  if ("schema" in iface && iface.schema.reduce((r, elt) => {
    return r+elt.length;
  }, 0)) {
    validate();
  }
  $("#inputSchema textarea").prev().add("#title").on("click", updateURL);

  /**
   * update location with a current values of some inputs
   */
  function updateURL () {
    var parms = [];
    if (iface.interface)
      parms.push("interface="+iface.interface[0]);
    var pairs = $(".pair");
    if (pairs.length > 0) {
      parms.push("shape-map=" + pairs.map((idx, elt) => {
        var node = $(elt).find(".focus").val();
        var shape = $(elt).find(".inputShape").val();
        return [encodeURIComponent(node + "@" + shape)];
      }).get().join(encodeURIComponent(",")));
    }
    parms = parms.concat(QueryParams.map(input => {
      var parm = input.queryStringParm;
      return parm + "=" + encodeURIComponent(input.location.val());
    }));
    var s = parms.join("&");
    window.history.pushState(null, null, location.origin+location.pathname+"?"+s);
  }

}

/**
 * Prepare drag and drop into text areas
 */
function prepareDragAndDrop () {
  var _scma = $("#inputSchema textarea");
  var _data = $("#inputData textarea");
  var _body = $("body");
  [{dropElt: _scma, targets: [{ext: "", target: InputSchema}]},
   {dropElt: _data, targets: [{ext: "", target: InputData}]},
   {dropElt: _body, targets: [{ext: ".shex", target: InputSchema},
                              {ext: ".ttl", target: InputData}]}].
    forEach(desc => {
      // kudos to http://html5demos.com/dnd-upload
      desc.dropElt.
        on("drag dragstart dragend dragover dragenter dragleave drop", function (e) {
          e.preventDefault();
          e.stopPropagation();
        }).
        on("dragover dragenter", (e) => {
          desc.dropElt.addClass("hover");
        }).
        on("dragend dragleave drop", (e) => {
          desc.dropElt.removeClass("hover");
        }).
        on("drop", (e) => {
          readfiles(e.originalEvent.dataTransfer.files, desc.targets);
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
            target.set(appendTo + event.target.result);
          };
        })(target);
        reader.readAsText(file);
      } else {
        results.append("don't know what to do with " + name + "\n");
      }
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/devnull.php"); // One must ignore these errors, sorry!
    xhr.send(formData);
  }
}

// prepareDemos() is invoked after these variables are assigned:
var clinicalObs = {};
var wikidataItem = {};
function prepareDemos () {
  var demos = {
    "clinical observation": {
      schema: clinicalObs.schema,
      passes: {
        "with birthdate": {
          data: clinicalObs.with_birthdate,
          inputShapeMap: [{
            node: "<http://a.example/Obs1>",
            shape: "- start -"}]},
        "without birthdate": {
          data: clinicalObs.without_birthdate,
          inputShapeMap: [{
            node: "<http://a.example/Obs1>",
            shape: "- start -" }]},
        "no subject name": {
          data: clinicalObs.no_subject_name,
          inputShapeMap: [{
            node: "<http://a.example/Obs1>",
            shape: "- start -" }]}
      },
      fails: {
        "bad status": {
          data: clinicalObs.bad_status,
          inputShapeMap: [{
            node: "<http://a.example/Obs1>",
            shape: "- start -" }]},
        "no subject": {
          data: clinicalObs.no_subject,
          inputShapeMap: [{
            node: "<http://a.example/Obs1>",
            shape: "- start -" }]},
        "wrong birthdate datatype": {
          data: clinicalObs.birthdate_datatype,
          inputShapeMap: [{
            node: "<http://a.example/Obs1>",
            shape: "- start -" }]}
      }
    },
    "wikidata query": {
      schema: wikidataItem.schema,
      passes: {
        "12078": {
          data: wikidataItem.cats,
          inputShapeMap: [{
            node: "- click to resolve -",
            shape: "- start -"}]}
      },
      fails: {
      }
    }
  };
  var listItems = {inputSchema:{}, inputData:{}};
  load("#inputSchema .examples ul", demos, pickSchema,
       listItems, "inputSchema", function (o) {
         return o.schema;
       });
  var timeouts = { inputSchema: undefined, inputData: undefined };
  function later (target, side, cache) {
    cache.dirty(true);
    if (timeouts[side])
      clearTimeout(timeouts[side]);

    timeouts[side] = setTimeout(() => {
      timeouts[side] = undefined;
      $("#"+side+" .selected").removeClass("selected");
      var curSum = sum($(target).val());
      if (curSum in listItems[side])
        listItems[side][curSum].addClass("selected");
    }, 250);
  }
  $("body").keydown(function (e) { // keydown because we need to preventDefault
    var code = e.keyCode || e.charCode; // standards anyone?
    if (e.ctrlKey && (code === 10 || code === 13)) {
      $("#validate").click();
      return false; // same as e.preventDefault();
    }
  });
  $("#inputSchema textarea").keyup(function (e) { // keyup to capture backspace
    var code = e.keyCode || e.charCode;
    if (!(e.ctrlKey && (code === 10 || code === 13)))
      later(e.target, "inputSchema", InputSchema);
  });
  $("#inputData textarea").keyup(function (e) {
    var code = e.keyCode || e.charCode;
    if (!(e.ctrlKey && (code === 10 || code === 13)))
      later(e.target, "inputData", InputData);
  });
  addContextMenus("#focus0", "#inputShape0");
}
function addContextMenus (nodeSelector, shapeSelector) {
  [ { inputSelector: nodeSelector,
      getItems: function () { return InputData.getNodes(); } },
    { inputSelector: shapeSelector,
      getItems: function () { return InputSchema.getShapes(); } }
  ].forEach(entry => {
    $.contextMenu({
      selector: entry.inputSelector,
      callback: function (key, options) {
        if (key === "- add all -") {
          var toAdd = Object.keys(options.items).filter(k => {
            return k !== "- add all -";
          });
          $(options.selector).val(toAdd.shift());
          var shape = $(options.selector.replace(/focus/, "inputShape")).val();
          addNodeShapePair(null, toAdd.map(node => { return {node: node, shape: shape}; }));
        } else {
          $(options.selector).val(key);
        }
      },
      build: function (elt, e) {
        return {
          items:
          entry.getItems().reduce((ret, opt) => {
            ret[opt] = { name: opt };
            return ret;
          }, {})
        };
      }
    });
  });
}

// Large constants with demo data which break syntax highlighting:
clinicalObs.schema = `PREFIX : <http://hl7.org/fhir/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

start = @<ObservationShape>

<ObservationShape> {               # An Observation has:
  :status ["preliminary" "final"]; #   status in this value set
  :subject @<PatientShape>         #   a subject matching <PatientShape>.
}

<PatientShape> {                   # A Patient has:
 :name xsd:string*;                #   one or more names
 :birthdate xsd:date?              #   and an optional birthdate.
}
`;
clinicalObs.with_birthdate = `PREFIX : <http://hl7.org/fhir/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<Obs1>
  :status    "final" ;
  :subject   <Patient2> .

<Patient2>
  :name "Bob" ;
  :birthdate "1999-12-31"^^xsd:date .`;
clinicalObs.no_subject_name = `PREFIX : <http://hl7.org/fhir/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<Obs1>
  :status    "final" ;
  :subject   <Patient2> .

<Patient2>
  :birthdate "1999-12-31"^^xsd:date .`;
clinicalObs.without_birthdate = `PREFIX : <http://hl7.org/fhir/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<Obs1>
  :status    "preliminary" ;
  :subject   <Patient2> .

<Patient2>
  :name "Bob" .`;
clinicalObs.bad_status = `PREFIX : <http://hl7.org/fhir/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<Obs1>
  :status    "finally" ;
  :subject   <Patient2> .

<Patient2>
  :name "Bob" ;
  :birthdate "1999-12-31"^^xsd:date .

`;
clinicalObs.no_subject = `PREFIX : <http://hl7.org/fhir/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<Obs1>
  :status    "final" .

<Patient2>
  :name "Bob" ;
  :birthdate "1999-12-31"^^xsd:date .

`;
clinicalObs.birthdate_datatype = `PREFIX : <http://hl7.org/fhir/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<Obs1>
  :status    "final" ;
  :subject   <Patient2> .

<Patient2>
  :name "Bob" ;
  :birthdate "1999-12-31T01:23:45"^^xsd:dateTime .`;

wikidataItem.schema = `PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX p: <http://www.wikidata.org/prop/>
PREFIX pr: <http://www.wikidata.org/prop/reference/>
PREFIX ps: <http://www.wikidata.org/prop/statement/>

start = @<wikidata_item>

<wikidata_item> {
  p:P1748 {
    ps:P1748 LITERAL ;
    prov:wasDerivedFrom @<reference>
  }+
}

<reference> {
  pr:P248  IRI ;
  pr:P813  xsd:dateTime ;
  pr:P699  LITERAL
}
`;

wikidataItem.cats = `
Endpoint: https://query.wikidata.org/bigdata/namespace/wdq/sparql

Query: SELECT ?item ?itemLabel
WHERE
{ ?item wdt:P279* wd:Q12078 .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
} LIMIT 10
`;

ShExRSchema = `PREFIX sx: <http://www.w3.org/ns/shex#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
BASE <http://www.w3.org/ns/shex#>
start=@<Schema>

<Schema> CLOSED {
  a [sx:Schema] ;
  sx:startActs @<SemActList1Plus>? ;
  sx:start @<shapeExpr>?;
  sx:shapes @<shapeExpr>*
}

<shapeExpr> @<ShapeOr> OR @<ShapeAnd> OR @<ShapeNot> OR @<NodeConstraint> OR @<Shape> OR @<ShapeExternal>

<ShapeOr> CLOSED {
  a [sx:ShapeOr] ;
  sx:shapeExprs @<shapeExprList2Plus>
}

<ShapeAnd> CLOSED {
  a [sx:ShapeAnd] ;
  sx:shapeExprs @<shapeExprList2Plus>
}

<ShapeNot> CLOSED {
  a [sx:ShapeNot] ;
  sx:shapeExpr @<shapeExpr>
}

<NodeConstraint> CLOSED {
  a [sx:NodeConstraint] ;
  sx:nodeKind [sx:iri sx:bnode sx:literal sx:nonliteral]?;
  sx:datatype IRI ? ;
  &<xsFacets>  ;
  sx:values @<valueSetValueList1Plus>?
}

<Shape> CLOSED {
  a [sx:Shape] ;
  sx:closed [true false]? ;
  sx:extra IRI* ;
  sx:expression @<tripleExpression>? ;
  sx:semActs @<SemActList1Plus>? ;
  sx:annotation @<Annotation>* ;
}

<ShapeExternal> CLOSED {
  a [sx:ShapeExternal] ;
}

<SemAct> CLOSED {
  a [sx:SemAct] ;
  sx:name IRI ;
  sx:code xsd:string?
}

<Annotation> CLOSED {
  a [sx:Annotation] ;
  sx:predicate IRI ;
  sx:object @<objectValue>
}

# <xsFacet> @<stringFacet> OR @<numericFacet>
<facet_holder> { # hold labeled productions
  $<xsFacets> ( &<stringFacet> | &<numericFacet> )* ;
  $<stringFacet> (
      sx:length xsd:integer
    | sx:minlength xsd:integer
    | sx:maxlength xsd:integer
    | sx:pattern xsd:string ; sx:flags xsd:string?
  );
  $<numericFacet> (
      sx:mininclusive   @<numericLiteral>
    | sx:minexclusive   @<numericLiteral>
    | sx:maxinclusive   @<numericLiteral>
    | sx:maxexclusive   @<numericLiteral>
    | sx:totaldigits    xsd:integer
    | sx:fractiondigits xsd:integer
  )
}
<numericLiteral> xsd:integer OR xsd:decimal OR xsd:double

<valueSetValue> @<objectValue> OR @<IriStem> OR @<IriStemRange>
                               OR @<LiteralStem> OR @<LiteralStemRange>
                               OR @<LanguageStem> OR @<LanguageStemRange>
<objectValue> IRI OR LITERAL # rdf:langString breaks on Annotation.object
<IriStem> CLOSED { a [sx:IriStem]; sx:stem xsd:string }
<IriStemRange> CLOSED {
  a [sx:IriStemRange];
  sx:stem xsd:string OR @<Wildcard>;
  sx:exclusion @<objectValue> OR @<IriStem>*
}
<LiteralStem> CLOSED { a [sx:LiteralStem]; sx:stem xsd:string }
<LiteralStemRange> CLOSED {
  a [sx:LiteralStemRange];
  sx:stem xsd:string OR @<Wildcard>;
  sx:exclusion @<objectValue> OR @<LiteralStem>*
}
<LanguageStem> CLOSED { a [sx:LanguageStem]; sx:stem xsd:string }
<LanguageStemRange> CLOSED {
  a [sx:LanguageStemRange];
  sx:stem xsd:string OR @<Wildcard>;
  sx:exclusion @<objectValue> OR @<LanguageStem>*
}
<Wildcard> BNODE CLOSED {
  a [sx:Wildcard]
}

<tripleExpression> @<TripleConstraint> OR @<OneOf> OR @<EachOf>

<OneOf> CLOSED {
  a [sx:OneOf] ;
  sx:min xsd:integer? ;
  sx:max xsd:integer? ;
  sx:expressions @<tripleExpressionList2Plus> ;
  sx:semActs @<SemActList1Plus>? ;
  sx:annotation @<Annotation>*
}

<EachOf> CLOSED {
  a [sx:EachOf] ;
  sx:min xsd:integer? ;
  sx:max xsd:integer? ;
  sx:expressions @<tripleExpressionList2Plus> ;
  sx:semActs @<SemActList1Plus>? ;
  sx:annotation @<Annotation>*
}

<tripleExpressionList2Plus> CLOSED {
  rdf:first @<tripleExpression> ;
  rdf:rest @<tripleExpressionList1Plus>
}
<tripleExpressionList1Plus> CLOSED {
  rdf:first @<tripleExpression> ;
  rdf:rest  [rdf:nil] OR @<tripleExpressionList1Plus>
}

<TripleConstraint> CLOSED {
  a [sx:TripleConstraint] ;
  sx:inverse [true false]? ;
  sx:negated [true false]? ;
  sx:min xsd:integer? ;
  sx:max xsd:integer? ;
  sx:predicate IRI ;
  sx:valueExpr @<shapeExpr>? ;
  sx:semActs @<SemActList1Plus>? ;
  sx:annotation @<Annotation>*
}

<SemActList1Plus> CLOSED {
  rdf:first @<SemAct> ;
  rdf:rest  [rdf:nil] OR @<SemActList1Plus>
}

<shapeExprList2Plus> CLOSED {
  rdf:first @<shapeExpr> ;
  rdf:rest  @<shapeExprList1Plus>
}
<shapeExprList1Plus> CLOSED {
  rdf:first @<shapeExpr> ;
  rdf:rest  [rdf:nil] OR @<shapeExprList1Plus>
}

<valueSetValueList1Plus> CLOSED {
  rdf:first @<valueSetValue> ;
  rdf:rest  [rdf:nil] OR @<valueSetValueList1Plus>
}`;

prepareControls();
prepareInterface();
prepareDragAndDrop();
prepareDemos();

