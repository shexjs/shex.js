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
    $("input.shape").val(dataTest.shape);
    $("input.data").val(dataTest.focus);

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
      $("input.schema").val(candidates[0]);
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
      $("input.data").val(candidates[0]);
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
    var schemaText = $("#inputSchema textarea").val();
    var schemaIsJSON = schemaText.match(/^\s*\{/);
    shexParser._setOptions({duplicateShape: $("#duplicateShape").val()});
    var inputSchema = schemaIsJSON ?
        JSON.parse(schemaText) :
        shexParser.parse(schemaText);
    var validator = ShExValidator.construct(inputSchema);
    var dataText = $("#inputData textarea").val();
    if (dataText || $("#focus").val()) {
      parsing = "data";
      var data = N3Store();
      data.addTriples(N3Parser({documentIRI:Base}).parse(dataText));
      var shape = guessStartingShape($("input.schema").val());
      var focus = guessStartingNode($("input.data").val());

      var ret = validator.validate(data, focus, shape);
      // var dated = Object.assign({ _when: new Date().toISOString() }, ret);
      var res = results.replace(JSON.stringify(ret, null, "  "));
      if ("errors" in ret)
        res.removeClass("passes error").addClass("fails");
      else
        res.removeClass("fails error").addClass("passes");
    } else {
      var parsedSchema;
      if (schemaIsJSON)
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
$("#clear").on("click", clearAll);
// prepareDemos() is invoked after these variables are assigned:
var clinicalObs;

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

function prepareDemos () {
  var demos = {
    "clinical observation": {
      schema: clinicalObs,
      passes: {
        "with birthdate": {
          data: clinicalObs_with_birthdate,
          focus: "http://a.example/Obs1",
          shape: "- start -"},
        "without birthdate": {
          data: clinicalObs_without_birthdate,
          focus: "http://a.example/Obs1",
          shape: "- start -" },
        "no subject name": {
          data: clinicalObs_no_subject_name,
          focus: "http://a.example/Obs1",
          shape: "- start -" }
      },
      fails: {
        "bad status": {
          data: clinicalObs_bad_status,
          focus: "http://a.example/Obs1",
          shape: "- start -" },
        "no subject": {
          data: clinicalObs_no_subject,
          focus: "http://a.example/Obs1",
          shape: "- start -" },
        "wrong birthdate datatype": {
          data: clinicalObs_birthdate_datatype,
          focus: "http://a.example/Obs1",
          shape: "- start -" }
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
    var code = e.keyCode || e.charCode;
    if (e.ctrlKey && (code === 10 || code === 13)) { // standards anyone?
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
  [ { selector: "#actions .schema",
      getItems: getSchemaShapes },
    { selector: "#actions .data",
      schema: { "S1": {}, "S2": {} },
      getItems: getDataNodes }
  ].forEach(entry => {
    $.contextMenu({
      selector: entry.selector,
      callback: function (key, options) {
        $("input" + options.selector).val(key);
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
clinicalObs = `PREFIX : <http://hl7.org/fhir/>
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
clinicalObs_with_birthdate = `PREFIX : <http://hl7.org/fhir/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<Obs1>
  :status    "final" ;
  :subject   <Patient2> .

<Patient2>
  :name "Bob" ;
  :birthdate "1999-12-31"^^xsd:date .`;
clinicalObs_no_subject_name = `PREFIX : <http://hl7.org/fhir/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<Obs1>
  :status    "final" ;
  :subject   <Patient2> .

<Patient2>
  :birthdate "1999-12-31"^^xsd:date .`;
clinicalObs_without_birthdate = `PREFIX : <http://hl7.org/fhir/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<Obs1>
  :status    "preliminary" ;
  :subject   <Patient2> .

<Patient2>
  :name "Bob" .`;
clinicalObs_bad_status = `PREFIX : <http://hl7.org/fhir/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<Obs1>
  :status    "finally" ;
  :subject   <Patient2> .

<Patient2>
  :name "Bob" ;
  :birthdate "1999-12-31"^^xsd:date .

`;
clinicalObs_no_subject = `PREFIX : <http://hl7.org/fhir/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<Obs1>
  :status    "final" .

<Patient2>
  :name "Bob" ;
  :birthdate "1999-12-31"^^xsd:date .

`;
clinicalObs_birthdate_datatype = `PREFIX : <http://hl7.org/fhir/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<Obs1>
  :status    "final" ;
  :subject   <Patient2> .

<Patient2>
  :name "Bob" ;
  :birthdate "1999-12-31T01:23:45"^^xsd:dateTime .`;

prepareDemos();

