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
  ret.addTriples(parser.parse(text));
  meta.base = parser._base;
  meta.prefixes = parser._prefixes;
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
function termToLex (node) {
  return node[0] === "_" && node[1] === ":" ? node : "<" + node + ">";
}
function lexToTerm (lex) {
  return lex[0] === "<" ? lex.substr(1, lex.length - 2) : lex;
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
    $("#results .status").hide();
    return schema;

    function tryN3 (text) {
      try {
        return text.match(/^\s*$/) ? null : parseTurtle (text, ret.meta); // interpret empty schema as ShExC
      } catch (e) {
        return null;
      }
    }

    function parseShExR () {
      var graphParser = ShExValidator.construct(
        parseShEx(ShExRSchema, {}), // !! do something useful with the meta parm (prefixes and base)
        {}
      );
      var schemaRoot = graph.find(null, ShExUtil.RDF.type, "http://shex.io/ns/shex#Schema")[0].subject;
      var val = graphParser.validate(graph, schemaRoot); // start shape
      return ShExUtil.ShExJtoAS(ShExUtil.ShExRtoShExJ(ShExUtil.valuesToSchema(ShExUtil.valToValues(val))));
    }
  };
  ret.getShapes = function () {
    var obj = this.refresh();
    var start = "start" in obj ? [START_SHAPE_LABEL] : [];
    var rest = "shapes" in obj ? Object.keys(obj.shapes).map(termToLex) : [];
    return start.concat(rest);
  }
  return ret;
}

function makeTurtleCache(parseSelector) {
  var ret = _makeCache(parseSelector);
  ret.meta = {};
  ret.parse = function (text) {
    return parseTurtle(text, ret.meta);
  };
  ret.getNodes = function () {
    var data = this.refresh();
    return data.find().map(t => {
      return termToLex(t.subject);
    });
  };
  return ret;
}


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
    $("#focus0").val(dataTest.inputShapeMap[0].node); // inputNode in Map-test
    $("#inputShape0").val(dataTest.inputShapeMap[0].shape); // srcSchema.start in Map-test
    removeNodeShapePair(null, Infinity);
    addNodeShapePair(null, dataTest.inputShapeMap.slice(1)); // catch the rest of the shapeMap.
    // validate();
  }
}


// Control results area content.
var results = (function () {
  var resultsElt = autosize(document.querySelector("#results textarea"));
  var resultsSel = $("#results textarea");
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
    results.finish();
  }, 0);
}

function validate () {
  $("#results .status").hide();
  var parsing = "input schema";
  try {
    var validator = ShExValidator.construct(InputSchema.refresh()
                    /*, { regexModule: modules["../lib/regex/nfax-val-1err"] }*/);
    $("#schemaDialect").text(InputSchema.language);
    InputData.refresh(); // for prefixes for getShapeMap
    var dataText = InputData.get();
    function hasFocusNode () {
      return $(".focus").map((idx, elt) => {
        return $(elt).val();
      }).get().some(str => {
        return str.length > 0;
      });
    }
    if (dataText || hasFocusNode()) {
      parsing = "input data";
      var shapeMap = getShapeMap($(".focus"), $(".inputShape")).map(pair => {
        return {node: lexToTerm(pair.node), shape: pair.shape === "- start -" ? pair.shape : lexToTerm(pair.shape)};
      });
      $("#results .status").text("parsing data...").show();
      var inputData = InputData.refresh();

      var ret = validator.validate(inputData, shapeMap);
      // var dated = Object.assign({ _when: new Date().toISOString() }, ret);
      $("#results .status").text("rendering results...").show();
      var text =
            "interface" in iface && iface.interface.indexOf("simple") !== -1 ?
            ("errors" in ret ?
             ShExUtil.errsToSimple(ret).join("\n") :
             JSON.stringify(ShExUtil.valToSimple(ret), null, 2)) :
          JSON.stringify(ret, null, "  ");
      var res = results.replace(text);
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
      if ("errors" in ret) {
        res.addClass("fails");
      } else {
        res.addClass("passes");
      }
    } else {
      var outputLanguage = InputSchema.language === "ShExJ" ? "ShExC" : "ShExJ";
      $("#results .status").
        text("parsed "+InputSchema.language+" schema, generated "+outputLanguage+" ").
        append($("<button>(copy to input)</button>").
               css("border-radius", ".5em").
               on("click", function () {
                 InputSchema.set($("#results textarea").val());
               })).
        append(":").
        show();
      var parsedSchema;
      if (InputSchema.language === "ShExJ") {
        new ShExWriter({simplifyParentheses: false}).writeSchema(InputSchema.parsed, (error, text) => {
          if (error) {
            $("#results .status").text("unwritable ShExJ schema:\n" + error).show();
            res.addClass("error");
          } else {
            results.replace(text).addClass("passes");
          }
        });
      } else {
        results.replace(JSON.stringify(ShExUtil.AStoShExJ(ShExUtil.canonicalize(InputSchema.parsed)), null, "  ")).addClass("passes");
      }
    }
  } catch (e) {
    results.replace("error parsing " + parsing + ":\n" + e).addClass("error");
  }
}

var Removables = [];
function addNodeShapePair (evt, pairs) {
  if (pairs === undefined)
    pairs = [{node: "", shape: ""}];
  pairs.forEach(pair => {
    var id = Removables.length+1;
    var t = $("<span><br/><input id='focus"+id+
              "' type='text' value='"+pair.node+
              "' class='data focus'/> as <input id='inputShape"+id+
              "' type='text' value='"+pair.shape+
              "' class='schema inputShape context-menu-one btn btn-neutral'/></span>"
             );
    addContextMenus("#focus"+id, "#inputShape"+id);
    Removables.push(t);
    t.insertBefore($("#removePair"));
    if (id === 1)
      $("#removePair").css("visibility", "visible");
  });
  return false;
}

function removeNodeShapePair (evt, howMany) {
  if (howMany === undefined)
    howMany = 1;
  for (var i = 0; i < howMany; ++i) {
    var id = Removables.length;
    if (id === 0)
      break;
    Removables.pop().remove();
    if (id === 1)
      $("#removePair").css("visibility", "hidden");
  }
  return false;
}

function prepareControls () {
  $("#inputData .passes, #inputData .fails").hide();
  $("#inputData .passes ul, #inputData .fails ul").empty();
  $("#validate").on("click", disableResultsAndValidate);
  $("#clear").on("click", clearAll);
  $("#addPair").on("click", addNodeShapePair);
  $("#removePair").on("click", removeNodeShapePair).css("visibility", "hidden");

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

function getShapeMap (nodeList, shapeList) {
  var nodes = nodeList.map((idx, elt) => { return $(elt); }); // .map((idx, elt) => { return $(elt).val(); });
  var shapes = shapeList.map((idx, elt) => { return $(elt); }); // .map((idx, elt) => { return $(elt).val(); });
  var mapAndErrors = nodes.get().reduce((ret, n, i) => {

    var node = "node-type" in iface ?
          ShExUtil.someNodeWithType(
            ShExUtil.parsePassedNode(iface["node-type"], {prefixes: {}, base: null}, null,
                                     label => {
                                       return (InputData.refresh().
                                               findByIRI(null, RDF_TYPE, label).length > 0);
                                     },
                                     loaded.data.prefixes)) :
        ShExUtil.parsePassedNode($(n).val(), InputData.meta, () => {
          var triples = InputData.refresh().findByIRI(null, null, null);
          return triples.length > 0 ? triples[0].subject : ShExUtil.NotSupplied;
        },
                                 label => {
                                   return (InputData.refresh().findByIRI(label, null, null).length > 0 ||
                                           InputData.refresh().findByIRI(null, null, label).length > 0);
                                 });

    if (node === ShExUtil.NotSupplied || node === ShExUtil.UnknownIRI)
      ret.errors.push("node not found: " + $(n).val());
    var shape = $(shapes[i]).val() === "- start -" ? "- start -" :
          ShExUtil.parsePassedNode($(shapes[i]).val(), InputSchema.meta, () => { Object.keys(InputSchema.refresh().shapes)[0]; },
                                   (label) => {
                                     return label in InputSchema.refresh().shapes;
                                   });
    if (shape === ShExUtil.NotSupplied || shape === ShExUtil.UnknownIRI)
      throw Error("shape " + $(shapes[i]).val() + " not defined");
    if (!shape)
      ret.errors.push("shape not found: " + $(shapes[i]).val());
    if (node && shape)
      ret.shapeMap.push({node: node, shape: shape});
    return ret;
  }, {shapeMap: [], errors: []});
  if (mapAndErrors.errors.length) // !! overwritten immediately
    results.append(mapAndErrors.errors.join("\n"));
  return mapAndErrors.shapeMap;
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
  var useFirstNodeShapeInputs = true;
  function _addPair (node, shape) {
    if (useFirstNodeShapeInputs) {
      $("#focus0").val(node);
      $("#inputShape0").val(shape);
      useFirstNodeShapeInputs = false;
    } else {
      addNodeShapePair(null, [{node: node, shape: shape}]);
    }
  }
  if ("shape-map" in iface)
    parseShapeMap("shape-map", _addPair);

  function parseShapeMap (queryParm, addPair) {
    var shapeMap =  iface[queryParm];
    delete iface[queryParm];
    //     "(?:(<[^>]*>)|((?:[^\\@,]|\\[@,])+))" catches components
    var s = "((?:<[^>]*>)|(?:[^\\@,]|\\[@,])+)";
    var pairPattern = s + "@" + s + ",?";
    iface.shapeMap = shapeMap.reduce(
      (r, b) => {
        // test: b = "my:n1@my:Shape1,<n2>@<Shape2>,my:n\\@3:.@<Shape3>";
        var pairs = b.match(RegExp(pairPattern, "g"));
        pairs.map(r2 => {
          var p = r2.match(RegExp(pairPattern));
          var node = p[1], shape = p[2];
          r[node] = node in r ? r[node].concat(shape) : [shape];
          addPair(node, shape);
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
    var parms = QueryParams.map(input => {
      var parm = input.queryStringParm;
      return parm + "=" + encodeURIComponent(input.location.val());
    });
    var shapeMap = getShapeMap($(".focus"), $(".inputShape"));
    if (shapeMap.length)
      parms.push("shape-map=" + shapeMap.reduce((ret, p) => {
        return ret.concat([encodeURIComponent(p.node + "@" + p.shape)]);
      }, []).join(encodeURIComponent(",")));
    if (iface.interface)
      parms.push("interface="+iface.interface[0]);
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
        $(options.selector).val(key);
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

ShExRSchema = `PREFIX sx: <http://shex.io/ns/shex#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
BASE <http://shex.io/ns/ShExR#>
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
  (  sx:nodeKind [sx:iri sx:bnode sx:literal sx:nonliteral]
   | sx:datatype IRI
#   | &<xsFacet>
   | &<stringFacet>
   | &<numericFacet>
   | sx:values @<valueSetValueList1Plus>)+
}

<Shape> CLOSED {
  a [sx:Shape] ;
  sx:closed [true false]? ;
  sx:extra IRI* ;
  sx:expression @<tripleExpression>? ;
  sx:semActs @<SemActList1Plus>? ;
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
  $<stringFacet> (
      sx:length xsd:integer
    | sx:minlength xsd:integer
    | sx:maxlength xsd:integer
    | sx:pattern xsd:string
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

<valueSetValue> @<objectValue> OR @<Stem> OR @<StemRange>
<objectValue> IRI OR LITERAL # rdf:langString breaks on Annotation.object
<Stem> CLOSED { a [sx:Stem]; sx:stem xsd:anyUri }
<StemRange> CLOSED {
  a [sx:StemRange];
  sx:stem xsd:anyUri OR @<Wildcard>;
  sx:exclusion @<objectValue> OR @<Stem>*
}
<Wildcard> BNODE CLOSED {
  a [sx:Wildcard]
}

<tripleExpression> @<TripleConstraint> OR @<OneOf> OR @<EachOf>

<OneOf> CLOSED {
  a [sx:OneOf] ;
  sx:min xsd:integer? ;
  sx:max xsd:integer OR [sx:unbounded]? ;
  sx:expressions @<tripleExpressionList2Plus> ;
  sx:semActs @<SemActList1Plus>? ;
  sx:annotation @<Annotation>*
}

<EachOf> CLOSED {
  a [sx:EachOf] ;
  sx:min xsd:integer? ;
  sx:max xsd:integer OR [sx:unbounded]? ;
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
  sx:max xsd:integer OR [sx:unbounded]? ;
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

