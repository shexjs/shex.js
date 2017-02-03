// shex-simple - Simple ShEx2 validator for HTML.
// Copyright 2017 Eric Prud'hommeux
// Release under MIT License.

const START_SHAPE_LABEL = "- start -";

function sum (s) { // cheap way to identify identical strings
  return s.replace(/\s/g, "").split("").reduce(function (a,b){
    a = ((a<<5) - a) + b.charCodeAt(0);
    return a&a
  },0);
}

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
  $("#inputData textarea").val("");
  $("#inputData .status").text(" ");
  results.clear();
}

function clearAll () {
  $("#inputSchema textarea").val("");
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
    $("#inputSchema textarea").val(schemaTest.schema);
    $("#inputSchema .status").text(name);

    $("#inputData textarea").val("");
    $("#inputData .status").text(" ");
    $("#inputData .passes, #inputData .fails").show();
    $("#inputData .passes p:first").text("Passing:");
    load("#inputData .passes ul", schemaTest.passes, pickData, listItems, "inputData", function (o) { return o.data; });
    $("#inputData .fails p:first").text("Failing:");
    load("#inputData .fails ul", schemaTest.fails, pickData, listItems, "inputData", function (o) { return o.data; });

    results.clear();
    $("#inputSchema li.selected").removeClass("selected");
    $(elt).addClass("selected");
    $("input.schema").val(getSchemaShapes("#inputSchema textarea")[0]);
  }
}

function pickData (name, dataTest, elt, listItems, side) {
  if ($(elt).hasClass("selected")) {
    clearData();
    $(elt).removeClass("selected");
  } else {
    $("#inputData textarea").val(dataTest.data);
    $("#inputData .status").text(name);
    $("#inputData li.selected").removeClass("selected");
    $(elt).addClass("selected");
    //    $("input.data").val(getDataNodes()[0]);
    $("#inputShape").val(dataTest.inputShape); // srcSchema.start in Map-test
    $("#focus").val(dataTest.focus); // inputNode in Map-test

    // validate();
  }
}

var Base = "http://a.example/"; // window.location.href;
var shexParser = ShExParser.construct(Base);

// <n3.js-specific>
function termToLex (node) {
  return node[0] === "_" && node[1] === ":" ? node : "<" + node + ">";
}
function lexToTerm (lex) {
  return lex[0] === "<" ? lex.substr(1, lex.length - 2) : lex;
}
// </n3.js-specific>

// Guess the starting shape.
function guessStartingShape (inputSelector, parseSelector) {
  var shape = $(inputSelector).val();
  if (shape === "") {
    var candidates = getSchemaShapes(parseSelector);
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
function guessStartingNode (inputSelector, parseSelector) {
  var focus = $(inputSelector).val();
  if (focus === "") {
    var candidates = getDataNodes(parseSelector);
    if (candidates.length > 0) {
      $(inputSelector).val(candidates[0]);
      return lexToTerm(candidates[0]);
    } else
      throw Error("no possible starting focus node");
  } else
    return lexToTerm(focus);
}

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

function tryN3 (text) {
  try {
    var inputData = N3Store();
    N3Parser._resetBlankNodeIds();
    inputData.addTriples(N3Parser({documentIRI:Base}).parse(text));
    return inputData;
  } catch (e) {
    return null;
  }
}

var ShExRSchema;

function parseShExR (schemaGraph) {
  var graphParser = ShExValidator.construct(
    shexParser.parse(ShExRSchema),
    {}
  );
  var schemaRoot = schemaGraph.find(null, ShExUtil.RDF.type, "http://shex.io/ns/shex#Schema")[0].subject;
  var val = graphParser.validate(schemaGraph, schemaRoot); // start shape
  return ShExUtil.ShExJtoAS(ShExUtil.ShExRtoShExJ(ShExUtil.valuesToSchema(ShExUtil.valToValues(val))));
}

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
    var inputSchemaText = $("#inputSchema textarea").val();
    var inputSchemaIsJSON = inputSchemaText.match(/^\s*\{/);
    var schemaGraph = inputSchemaIsJSON ? null : tryN3(inputSchemaText);
    var inputLanguage =
        inputSchemaIsJSON ? "JSON" :
        schemaGraph ? "ShExR" :
        "ShExC";
    $("#results .status").text("parsing "+inputLanguage+" schema...").show();
    shexParser._setOptions({duplicateShape: $("#duplicateShape").val()});
    var inputSchema =
        inputSchemaIsJSON ? ShExUtil.ShExJtoAS(JSON.parse(inputSchemaText)) :
        schemaGraph ? parseShExR(schemaGraph) :
        shexParser.parse(inputSchemaText);
    var validator = ShExValidator.construct(inputSchema);
    var dataText = $("#inputData textarea").val();
    if (dataText || $("#focus").val()) {
      parsing = "input data";
      $("#results .status").text("parsing data...").show();
      var inputData = N3Store();
      N3Parser._resetBlankNodeIds();
      inputData.addTriples(N3Parser({documentIRI:Base}).parse(dataText));
      var inputShape = guessStartingShape("#inputShape", "#inputSchema textarea");
      var focus = guessStartingNode("#focus", "#inputData textarea");

      var ret = validator.validate(inputData, focus, inputShape);
      // var dated = Object.assign({ _when: new Date().toISOString() }, ret);
      $("#results .status").text("rendering results...").show();
      var res = results.replace(JSON.stringify(ret, null, "  "));
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
      var outputLanguage = inputSchemaIsJSON ? "ShExC" : "ShExJ";
      $("#results .status").
        text("parsed "+inputLanguage+" schema, generated "+outputLanguage+" ").
        append($("<button>(copy to input)</button>").
               css("border-radius", ".5em").
               on("click", function () {
                 $("#inputSchema textarea").val($("#results textarea").val());
               })).
        append(":").
        show();
      var parsedSchema;
      if (inputSchemaIsJSON) {
        new ShExWriter({simplifyParentheses: false}).writeSchema(inputSchema, (error, text) => {
          if (error) {
            $("#results .status").text("unwritable ShExJ schema:\n" + error).show();
            res.addClass("error");
          } else {
            results.replace(text).addClass("passes");
          }
        });
      } else {
        results.replace(JSON.stringify(ShExUtil.AStoShExJ(ShExUtil.canonicalize(inputSchema)), null, "  ")).addClass("passes");
      }
    }
  } catch (e) {
    results.replace("error parsing " + parsing + ":\n" + e).addClass("error");
  }
}

function getSchemaShapes (parseSelector) {
  var schemaText = $(parseSelector).val();
  var inputSchema = shexParser.parse(schemaText);
  var start = "start" in inputSchema ? [START_SHAPE_LABEL] : [];
  var rest = "shapes" in inputSchema ? Object.keys(inputSchema.shapes).map(termToLex) : [];
  return start.concat(rest);
}

function getDataNodes (parseSelector) {
  var dataText = $(parseSelector).val();
  var data = N3Store();
  N3Parser._resetBlankNodeIds();
  data.addTriples(N3Parser({documentIRI:Base}).parse(dataText));
  return data.find().map(t => {
    return termToLex(t.subject);
  });
}

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

// Prepare drag and drop into text areas
// (hiding variables in their own function scope).
(function () {
  var _scma = $("#inputSchema textarea");
  var _data = $("#inputData textarea");
  var _body = $("body");
  [{dropElt: _scma, targets: [{ext: "", target: _scma}]},
   {dropElt: _data, targets: [{ext: "", target: _data}]},
   {dropElt: _body, targets: [{ext: ".shex", target: _scma},
                              {ext: ".ttl", target: _data}]}].
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
})();

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
          var appendTo = $("#append").is(":checked") ? target.val() : "";
          target.val(appendTo + event.target.result);
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

// prepareDemos() is invoked after these variables are assigned:
var clinicalObs = {};
function prepareDemos () {
  var demos = {
    "clinical observation": {
      schema: clinicalObs.schema,
      passes: {
        "with birthdate": {
          data: clinicalObs.with_birthdate,
          focus: "http://a.example/Obs1",
          inputShape: "- start -"},
        "without birthdate": {
          data: clinicalObs.without_birthdate,
          focus: "http://a.example/Obs1",
          inputShape: "- start -" },
        "no subject name": {
          data: clinicalObs.no_subject_name,
          focus: "http://a.example/Obs1",
          inputShape: "- start -" }
      },
      fails: {
        "bad status": {
          data: clinicalObs.bad_status,
          focus: "http://a.example/Obs1",
          inputShape: "- start -" },
        "no subject": {
          data: clinicalObs.no_subject,
          focus: "http://a.example/Obs1",
          inputShape: "- start -" },
        "wrong birthdate datatype": {
          data: clinicalObs.birthdate_datatype,
          focus: "http://a.example/Obs1",
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
  function later (target, side) {
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
    later(e.target, "inputSchema");
  });
  $("#inputData textarea").keyup(function (e) {
    later(e.target, "inputData");
  });
  [ { inputSelector: "#inputShape", parseSelector: "#inputSchema textarea",
      getItems: getSchemaShapes },
    { inputSelector: "#focus", parseSelector: "#inputData textarea",
      schema: { "S1": {}, "S2": {} },
      getItems: getDataNodes }
  ].forEach(entry => {
    $.contextMenu({
      selector: entry.inputSelector,
      callback: function (key, options) {
        $(options.selector).val(key);
      },
      build: function (elt, e) {
        return {
          items:
          entry.getItems(entry.parseSelector).reduce((ret, opt) => {
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

