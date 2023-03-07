const DefaultBase = location.origin + location.pathname;
const App = new ShExSimpleApp(DefaultBase, RemoteShExValidator);

// shex-simple - Simple ShEx2 validator for HTML.
// Copyright 2017 Eric Prud'hommeux
// Release under MIT License.

ShExWebApp.ShapeMap.Start = ShExWebApp.Validator.Start
const START_SHAPE_LABEL = "START";
const INPUTAREA_TIMEOUT = 250;
const NO_MANIFEST_LOADED = "no manifest loaded";

const START_SHAPE_INDEX_ENTRY = "- start -"; // specificially not a JSON-LD @id form.
const LOG_PROGRESS = false;

const SharedForTests = {Caches: App.Caches, /*DefaultBase*/} // an object to share state with a test harness

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

function sum (s) { // cheap way to identify identical strings
  return s.replace(/\s/g, "").split("").reduce(function (a,b){
    a = ((a<<5) - a) + b.charCodeAt(0);
    return a&a
  },0);
}

function ldToTurtle (ld, termToLex) {
  return typeof ld === "object"
    ? lit(ld)
    : termToLex(
      ld.startsWith("_:")
        ? RdfJs.DataFactory.blankNode(ld.substr(2))
        : RdfJs.DataFactory.namedNode(ld)
    );
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

function fetchOK (url) {
  return fetch(url).then(responseOrError => {
    if (!responseOrError.ok) {
      throw responseOrError;
    }
    return responseOrError.text()
  });
}

function renderErrorMessage (response, what) {
  const message = "failed to load " + "queryMap" + " from <" + response.url + ">, got: " + response.status + " " + response.statusText;
  results.append($("<pre/>").text(message).addClass("error"));
  return message;
}

// Control results area content.
const results = (function () {
  const resultsElt = document.querySelector("#results div");
  const resultsSel = $("#results div");
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
      const height = resultsSel.height();
      resultsSel.height(1);
      resultsSel.animate({height:height}, 100);
    },
    text: function () {
      return $(resultsElt).text();
    }
  };
})();

function hasFocusNode () {
  return $(".focus").map((idx, elt) => {
    return $(elt).val();
  }).get().some(str => {
    return str.length > 0;
  });
}

function lexifyFirstColumn999 (row) { // !!not used
  return App.Caches.inputData.meta.termToLex(row[0]); // row[0] is the first column.
}

App.prepareControls();
const dndPromise = App.prepareDragAndDrop(); // async 'cause it calls Cache.X.set("")
const loads = App.loadSearchParameters();
const ready = Promise.all([ dndPromise, loads ]);
if ('_testCallback' in window) {
  SharedForTests.promise = ready.then(ab => ({drop: ab[0], loads: ab[1]}));
  window._testCallback(SharedForTests);
}
ready.then(resolves => {
  if (!('_testCallback' in window))
    console.log('search parameters:', resolves[1]);
  // Update UI to say we're done loading everything?
}, e => {
  // Drop catch on the floor presuming thrower updated the UI.
});
