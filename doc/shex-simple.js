// shex-simple - Simple ShEx2 validator for HTML.
// Copyright 2017 Eric Prud'hommeux
// Release under MIT License.

const START_SHAPE_LABEL = "- start -";
var Base = "http://a.example/" ; // "https://rawgit.com/shexSpec/shex.js/master/doc/shex-simple.html"; // window.location.href; 
var InputSchema = makeSchemaCache("#inputSchema textarea");
var InputData = makeTurtleCache("#inputData textarea");
var ShExRSchema; // defined below


// utility functions
function parseTurtle (text) {
  var ret = N3Store();
  N3Parser._resetBlankNodeIds();
  ret.addTriples(N3Parser({documentIRI:Base}).parse(text));
  return ret;
}

var shexParser = ShExParser.construct(Base);
function parseShEx (text) {
  shexParser._setOptions({duplicateShape: $("#duplicateShape").val()});
  return shexParser.parse(text);
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
  ret.parse = function (text) {
    return parseTurtle(text);
  };
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
    var ret =
        isJSON ? ShExUtil.ShExJtoAS(JSON.parse(text)) :
        graph ? parseShExR() :
        parseShEx(text);
    $("#results .status").hide();
    return ret;

    function tryN3 (text) {
      try {
        return text.match(/^\s*$/) ? null : parseTurtle (text); // interpret empty schema as ShExC
      } catch (e) {
        return null;
      }
    }

    function parseShExR () {
      var graphParser = ShExValidator.construct(
        parseShEx(ShExRSchema),
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
  ret.parse = function (text) {
    return parseTurtle(text);
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
  $("#focus").val("");
  $("#inputData .status").text(" ");
  results.clear();
}

function clearAll () {
  $("#results .status").hide();
  InputSchema.set("");
  $("#inputShape").val("");
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
    $("#inputShape").val(dataTest.inputShape); // srcSchema.start in Map-test
    $("#focus").val(dataTest.focus); // inputNode in Map-test

    // validate();
  }
}

// Guess the starting shape.
function guessStartingShape (inputSelector, cache) {
  var shape = $(inputSelector).val();
  if (shape === "") {
    var candidates = cache.getShapes();
    if (candidates.length > 0) {
      $(inputSelector).val(candidates[0]);
      if (candidates[0] === START_SHAPE_LABEL)
        return undefined;
      else
        return lexToTerm(candidates[0]);
    } else
      throw Error("no possible starting shape");
  } else if (shape === START_SHAPE_LABEL)
    return undefined;
  else
    return lexToTerm(shape);
}


// Guess the starting focus.
function guessStartingNode (inputSelector, cache) {
  var focus = $(inputSelector).val();
  if (focus === "") {
    var candidates = cache.getNodes();;
    if (candidates.length > 0) {
      $(inputSelector).val(candidates[0]);
      return lexToTerm(candidates[0]);
    } else
      throw Error("no possible starting focus node");
  } else
    return lexToTerm(focus);
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
    $("#dialect").text(InputSchema.language);
    var dataText = InputData.get();
    if (dataText || $("#focus").val()) {
      parsing = "input data";
      $("#results .status").text("parsing data...").show();
      var inputData = InputData.refresh();
      var inputShape = guessStartingShape("#inputShape", InputSchema);
      var focus = guessStartingNode("#focus", InputData);

      var ret = validator.validate(inputData, focus, inputShape);
      // var dated = Object.assign({ _when: new Date().toISOString() }, ret);
      $("#results .status").text("rendering results...").show();
      var text =
            "interface" in iface && iface.interface.indexOf("simple") !== -1 ?
            ("errors" in ret ?
             ShExUtil.errsToSimple(ret) :
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
function addNodeShapePair (evt) {
  var id = Removables.length+1;
  var t = $("<span><br/><input id='focus"+id+
    "' type='text' class='data'/> as <input id='inputShape"+id+
    "' type='text' class='schema context-menu-one btn btn-neutral'/></span>"
           );
  Removables.push(t);
  t.insertBefore($("#removePair"));
  if (id === 1)
    $("#removePair").css("visibility", "visible");
  return false;
}

function removeNodeShapePair (evt) {
  var id = Removables.length;
  Removables.pop().remove();
  if (id === 1)
    $("#removePair").css("visibility", "hidden");
  return false;
}

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

/**
 *
 * location.search: e.g. "?schema=asdf&data=qwer&shapeMap=ab%5Ecd%5E%5E_ef%5Egh"
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

/**
 * update location with a current values of some inputs
 */
function updateURL () {
  var parms = QueryParams.map(input => {
    var parm = input.queryStringParm;
    return parm + "=" + encodeURIComponent(input.location.val());
  });
  if ($("#focus").val() && $("#inputShape").val())
    parms.push("shapeMap=" + encodeURIComponent(
      $("#focus").val() + "^" + $("#inputShape").val()
    ));
  if (iface.interface)
    parms.push("interface="+iface.interface[0]);
  var s = parms.join("&");
  window.history.pushState(null, null, location.origin+location.pathname+"?"+s);
}

var iface = parseQueryString(location.search);
if ("shapeMap" in iface) {
  var first = true;
  iface.shapeMap = iface.shapeMap.reduce(
    (r, b) => {
      b.split(/\^\^/).forEach(pair => {
        var p = pair.split(/\^/);
        r[p[0]] = p[0] in r ? r[p[0]].concat(p[1]) : [p[1]];
        if (first) {
          $("#focus").val(p[0]);
          $("#inputShape").val(p[1]);
          first = false;
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
  $("#inputSchema .status").html("schema (<span id=\"dialect\">ShEx</span>)").show();
  $("#inputData .status").text("data (Turtle:").show();
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
prepareDragAndDrop();

// prepareDemos() is invoked after these variables are assigned:
var clinicalObs = {};
function prepareDemos () {
  var demos = {
    "clinical observation": {
      schema: clinicalObs.schema,
      passes: {
        "with birthdate": {
          data: clinicalObs.with_birthdate,
          focus: "<http://a.example/Obs1>",
          inputShape: "- start -"},
        "without birthdate": {
          data: clinicalObs.without_birthdate,
          focus: "<http://a.example/Obs1>",
          inputShape: "- start -" },
        "no subject name": {
          data: clinicalObs.no_subject_name,
          focus: "<http://a.example/Obs1>",
          inputShape: "- start -" }
      },
      fails: {
        "bad status": {
          data: clinicalObs.bad_status,
          focus: "<http://a.example/Obs1>",
          inputShape: "- start -" },
        "no subject": {
          data: clinicalObs.no_subject,
          focus: "<http://a.example/Obs1>",
          inputShape: "- start -" },
        "wrong birthdate datatype": {
          data: clinicalObs.birthdate_datatype,
          focus: "<http://a.example/Obs1>",
          inputShape: "- start -" }
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
  [ { inputSelector: "#inputShape",
      getItems: function () { return InputSchema.getShapes(); } },
    { inputSelector: "#focus",
      schema: { "S1": {}, "S2": {} },
      getItems: function () { return InputData.getNodes(); } }
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

prepareDemos();

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
  sx:max xsd:integer OR ["*"]? ;
  sx:expressions @<tripleExpressionList2Plus> ;
  sx:semActs @<SemActList1Plus>? ;
  sx:annotation @<Annotation>*
}

<EachOf> CLOSED {
  a [sx:EachOf] ;
  sx:min xsd:integer? ;
  sx:max xsd:integer OR ["*"]? ;
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
  sx:max xsd:integer OR ["*"]? ;
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

