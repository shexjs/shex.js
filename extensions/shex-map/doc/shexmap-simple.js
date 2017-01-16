// shexmap-simple - Simple ShEx2 validator for HTML.
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
  results.clear().removeClass("passes fails error");
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

    results.clear().removeClass("passes fails error");
    $("#inputSchema li.selected").removeClass("selected");
    $(elt).addClass("selected");
    $("input.schema").val(getSchemaShapes()[0]);
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

    $("#outputSchema textarea").val(dataTest.outputSchema);
    $("#outputSchema .status").text(name);
    $("#staticVars textarea").val(JSON.stringify(dataTest.staticVars, null, "  "));
    $("#staticVars .status").text(name);

    $("#outputShape").val(dataTest.outputShape); // targetSchema.start in Map-test
    $("#createRoot").val(dataTest.createRoot); // createRoot in Map-test

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
function guessStartingShape (shape) {
  if (shape === "") {
    var candidates = getSchemaShapes();
    if (candidates.length > 0) {
      $("#inputShape").val(candidates[0]);
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
function guessStartingNode (focus) {
  if (focus === "") {
    var candidates = getDataNodes();
    if (candidates.length > 0) {
      $("#focus").val(candidates[0]);
      return lexToTerm(candidates[0]);
    } else
      throw Error("no possible starting focus node");
  } else
    return lexToTerm(focus);
}

var results = (function () {
  var resultsElt = autosize(document.querySelector("#results"));
  var resultsSel = $("#results");
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
      var ret = resultsSel.text("");
      autosize.update(resultsElt);
      return ret;
    },
    rattle: function () {
      var height = resultsSel.height();
      resultsSel.height(1);
      resultsSel.animate({height:height}, 100);
    }
  };
})();

function validate () {
  var parsing = "input schema";
  try {
    var inputSchemaText = $("#inputSchema textarea").val();
    var inputSchemaIsJSON = inputSchemaText.match(/^\s*\{/);
    shexParser._setOptions({duplicateShape: $("#duplicateShape").val()});
    var inputSchema = inputSchemaIsJSON ?
          JSON.parse(inputSchemaText) :
          shexParser.parse(inputSchemaText);
    var validator = ShExValidator.construct(inputSchema);
    ShExMap.register(validator);
    var dataText = $("#inputData textarea").val();
    if (dataText || $("#focus").val()) {
      parsing = "input data";
      var inputData = N3Store();
      inputData.addTriples(N3Parser({documentIRI:Base}).parse(dataText));
      var inputShape = guessStartingShape($("#inputShape").val());
      var focus = guessStartingNode($("#focus").val());

      var ret = validator.validate(inputData, focus, inputShape);
      // var dated = Object.assign({ _when: new Date().toISOString() }, ret);
      var res = results.replace(JSON.stringify(ret, null, "  "));
      if ("errors" in ret) {
        res.removeClass("passes error").addClass("fails");
      } else {
        res.removeClass("fails error").addClass("passes");
        // $("#bindings1 textarea").val(ShExMap.extractBindings(ret));
        var resultBindings = {};
        function findBindings (object) {
          for (var key in object) {
            var item = object[key];
            if (typeof item === 'object') {
              if (ShExMap.url in item)
                Object.keys(item[ShExMap.url]).forEach(k => {
                  resultBindings[k] = item[ShExMap.url][k];
                })
              else
                object[key] = findBindings(item);
            }
          }
          return object;
        }
        findBindings(ret);
        $("#bindings1 textarea").val(JSON.stringify(resultBindings, null, "  "));
       }
    } else {
      var parsedSchema;
      if (inputSchemaIsJSON)
        new ShExWriter({simplifyParentheses: false}).writeSchema(inputSchema, (error, text) => {
          if (error)
            results.replace("unwritable ShExJ schema:\n" + error).
            removeClass("passes").addClass("fails error");
          else
            results.replace("valid ShExJ schema:\n" + text).
            removeClass("fails error").addClass("passes");
        });
      else
        results.replace("valid ShExC schema:\n" + JSON.stringify(inputSchema, null, "  ")).
        removeClass("fails error").addClass("passes");
    }
  } catch (e) {
    results.replace("error parsing " + parsing + ":\n" + e).
      removeClass("passes fails").addClass("error");
  }
  results.rattle();
}

function materialize () {
  var parsing = "output schema";
  try {
    var outputSchemaText = $("#outputSchema textarea").val();
    var outputSchemaIsJSON = outputSchemaText.match(/^\s*\{/);
    shexParser._setOptions({duplicateShape: $("#duplicateShape").val()});
    var outputSchema = outputSchemaIsJSON ?
          JSON.parse(outputSchemaText) :
          shexParser.parse(outputSchemaText);

    var resultBindings = Object.assign(
      JSON.parse($("#staticVars textarea").val()),
      JSON.parse($("#bindings1 textarea").val())
    );
    // $("#outputShape").val() ? is just targetSchema.start in Map-test
    var map = ShExMap.materializer(outputSchema);
    var outputGraph = map.materialize(resultBindings, $("#createRoot").val());
    var writer = N3.Writer({ prefixes: {} });
    outputGraph.find().forEach(t => { writer.addTriple(t); });
    writer.end(function (error, result) {
      results.replace(JSON.stringify(result, null, "  ").
                      replace(/\\n/g, "\n").
                      replace(/\\"/g, "\""));
    });
  } catch (e) {
    results.replace("error parsing " + parsing + ":\n" + e).
      removeClass("passes fails").addClass("error");
  }
  results.rattle();
}

function getSchemaShapes () {
  var schemaText = $("#inputSchema textarea").val();
  var inputSchema = shexParser.parse(schemaText);
  var start = "start" in inputSchema ? [START_SHAPE_LABEL] : [];
  var rest = "shapes" in inputSchema ? Object.keys(inputSchema.shapes).map(termToLex) : [];
  return start.concat(rest);
}

function getDataNodes () {
  var dataText = $("#inputData textarea").val();
  var data = N3Store();
  data.addTriples(N3Parser({documentIRI:Base}).parse(dataText));
  return data.find().map(t => {
    return termToLex(t.subject);
  });
}

$("#inputData .passes, #inputData .fails").hide();
$("#inputData .passes ul, #inputData .fails ul").empty();
$("#validate").on("click", validate);
$("#materialize").on("click", materialize);
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
  var _bnds = $("#bindings textarea");
  var _outs = $("#outputSchema textarea");
  var _vars = $("#staticVars textarea");
  var _body = $("body");
  [{dropElt: _scma, targets: [{ext: "", target: _scma}]},
   {dropElt: _data, targets: [{ext: "", target: _data}]},
   {dropElt: _bnds, targets: [{ext: "", target: _bnds}]},
   {dropElt: _outs, targets: [{ext: "", target: _outs}]},
   {dropElt: _vars, targets: [{ext: "", target: _vars}]},
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
var BPFHIR = {}, BPunitsDAM = {};
function prepareDemos () {
  var demos = {
    "BP": {
      schema: BPFHIR.schema,
      passes: {
        "simple": {
          data: BPFHIR.simple,
          focus: "tag:BPfhir123",
          inputShape: "- start -",
          outputSchema: BPunitsDAM.schema,
          outputShape: "BPunitsDAM",
          staticVars: BPunitsDAM.constants,
          createRoot: "tag:b0"}
      },
      fails: {
        "bad code": {
          data: BPFHIR.badCode,
          focus: "tag:BPfhir123",
          inputShape: "- start -",
          outputSchema: BPunitsDAM.schema,
          outputShape: "BPunitsDAM",
          staticVars: BPunitsDAM.constants,
          createRoot: "tag:b0"}
      },
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
    } else if (e.ctrlKey && e.key === "\\") {
      $("#materialize").click();
      return false; // same as e.preventDefault();
    }
  });
  $("#inputSchema textarea").keyup(function (e) { // keyup to capture backspace
    later(e.target, "inputSchema");
  });
  $("#inputData textarea").keyup(function (e) {
    later(e.target, "inputData");
  });
  [ { selector: "#inputShape",
      getItems: getSchemaShapes },
    { selector: "#focus",
      schema: { "S1": {}, "S2": {} },
      getItems: getDataNodes }
  ].forEach(entry => {
    $.contextMenu({
      selector: entry.selector,
      callback: function (key, options) {
        $(options.selector).val(key);
      },
      build: function (elt, e) {
        return {
          items:
          entry.getItems(entry).reduce((ret, opt) => {
            ret[opt] = { name: opt };
            return ret;
          }, {})
        };
      }
    });
  });
}

// Large constants with demo data which break syntax highlighting:
BPFHIR.schema = `PREFIX fhir: <http://hl7.org/fhir-rdf/>
PREFIX sct: <http://snomed.info/sct/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX bp: <http://shex.io/extensions/Map/#BPDAM->
PREFIX Map: <http://shex.io/extensions/Map/#>

start = @<BPfhir>

<BPfhir> {
    a [fhir:Observation]?,
    fhir:coding { fhir:code [sct:Blood_Pressure] },
    fhir:related { fhir:type ["has-component"], fhir:target @<sysBP> },
    fhir:related { fhir:type ["has-component"], fhir:target @<diaBP> }
}
<sysBP> {
    a [fhir:Observation]?,
    fhir:coding { fhir:code [sct:Systolic_Blood_Pressure] },
    fhir:valueQuantity {
        a [fhir:Quantity]?,
        fhir:value xsd:float %Map:{ bp:sysVal %},
        fhir:units xsd:string %Map:{ bp:sysUnits %}
    },
}
<diaBP> {
    a [fhir:Observation]?,
    fhir:coding { fhir:code [sct:Diastolic_Blood_Pressure] },
    fhir:valueQuantity {
        a [fhir:Quantity]?,
        fhir:value xsd:float %Map:{ bp:diaVal %},
        fhir:units xsd:string %Map:{ bp:diaUnits %}
    },
}
`;
BPFHIR.simple = `PREFIX fhir: <http://hl7.org/fhir-rdf/>
PREFIX sct: <http://snomed.info/sct/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<tag:BPfhir123>
    a fhir:Observation;
    fhir:coding [ fhir:code sct:Blood_Pressure ];
    fhir:related [ fhir:type "has-component"; fhir:target _:sysBP123 ];
    fhir:related [ fhir:type "has-component"; fhir:target _:diaBP123 ]
.
_:sysBP123
    a fhir:Observation;
    fhir:coding [ fhir:code sct:Systolic_Blood_Pressure ];
    fhir:valueQuantity [
        a fhir:Quantity;
        fhir:value "110"^^xsd:float;
        fhir:units "mmHg"
    ]
.
_:diaBP123
    a fhir:Observation;
    fhir:coding [ fhir:code sct:Diastolic_Blood_Pressure ];
    fhir:valueQuantity [
        a fhir:Quantity;
        fhir:value "70"^^xsd:float;
        fhir:units "mmHg"
    ]
.
`;

BPFHIR.badCode = `PREFIX fhir: <http://hl7.org/fhir-rdf/>
PREFIX sct: <http://snomed.info/sct/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<tag:BPfhir123>
    a fhir:Observation;
    fhir:coding [ fhir:code sct:Blood_Pressure ];
    fhir:related [ fhir:type "has-component"; fhir:target _:sysBP123 ];
    fhir:related [ fhir:type "has-component"; fhir:target _:diaBP123 ]
.
_:sysBP123
    a fhir:Observation;
    fhir:coding [ fhir:code sct:Systolic_Blood_Pressure ];
    fhir:valueQuantity [
        a fhir:Quantity;
        fhir:value "110"^^xsd:float;
        fhir:units "mmHg"
    ]
.
_:diaBP123
    a fhir:Observation;
    fhir:coding [ fhir:code sct:Diastolic_Blood_Pressure999 ];
    fhir:valueQuantity [
        a fhir:Quantity;
        fhir:value "70"^^xsd:float;
        fhir:units "mmHg"
    ]
.
`;

BPunitsDAM.schema = `PREFIX    : <http://shex.io/extensions/Map/#BPunitsDAM->
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX bp: <http://shex.io/extensions/Map/#BPDAM->
PREFIX Map: <http://shex.io/extensions/Map/#>

start = @<BPunitsDAM>

<BPunitsDAM> {
    :systolic {
        :value xsd:float %Map:{ bp:sysVal %};
        :units xsd:string %Map:{ bp:sysUnits %}
    };
    :diastolic {
        :value xsd:float %Map:{ bp:diaVal %};
        :units xsd:string %Map:{ bp:diaUnits %}
    };
    :someConstProp xsd:string %Map:{ <http://abc.example/someConstant> %}
}
`;

BPunitsDAM.constants = {"http://abc.example/someConstant": "123-456"};

BPunitsDAM.simple = `<tag:b0>
  <http://shex.io/extensions/Map/#BPunitsDAM-systolic> [
    <http://shex.io/extensions/Map/#BPunitsDAM-value> "110"^^<http://www.w3.org/2001/XMLSchema#float> ;
    <http://shex.io/extensions/Map/#BPunitsDAM-units> "mmHg" ] ;
  <http://shex.io/extensions/Map/#BPunitsDAM-diastolic> [
    <http://shex.io/extensions/Map/#BPunitsDAM-value> "70"^^<http://www.w3.org/2001/XMLSchema#float> ;
    <http://shex.io/extensions/Map/#BPunitsDAM-units> "mmHg" ].
`;

prepareDemos();

