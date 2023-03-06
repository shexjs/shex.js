// shexmap-simple - Simple ShEx2 validator for HTML.
// Copyright 2017 Eric Prud'hommeux
// Release under MIT License.

const ShEx = ShExWebApp; // @@ rename globally
const ShExJsUrl = 'https://github.com/shexSpec/shex.js'
const RdfJs = N3js;
const ShExLoader = ShEx.Loader({
  fetch: window.fetch.bind(window), rdfjs: RdfJs, jsonld: null
})
ShEx.ShapeMap.Start = ShEx.Validator.Start
const START_SHAPE_LABEL = "START";
const START_SHAPE_INDEX_ENTRY = "- start -"; // specificially not a JSON-LD @id form.
const INPUTAREA_TIMEOUT = 250;
const NO_MANIFEST_LOADED = "no manifest loaded";
const LOG_PROGRESS = false;

const DefaultBase = location.origin + location.pathname;

const App = new ShExMapWorkerApp(DefaultBase);
const ValidatorClass = RemoteShExValidator;
const MapModule = ShEx.Map({rdfjs: RdfJs, Validator: ShEx.Validator});
const USE_INCREMENTAL_RESULTS = true;

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

// controls for manifest buttons
async function paintManifest (selector, list, func, listItems, side) {
  $(selector).empty();
  await Promise.all(list.map(async entry => {
    // build button disabled and with leading "..." to indicate that it's being loaded
    const button = $("<button/>").text("..." + entry.label.substr(3)).attr("disabled", "disabled");
    const li = $("<li/>").append(button);
    $(selector).append(li);
    if (entry.text === undefined) {
      entry.text = await fetchOK(entry.url).catch(responseOrError => {
        // leave a message in the schema or data block
        return "# " + renderErrorMessage(
          responseOrError instanceof Error
            ? { url: entry.url, status: -1, statusText: responseOrError.message }
          : responseOrError,
          side);
      })
      textLoaded();
    } else {
      textLoaded();
    }

    function textLoaded () {
      li.on("click", async () => {
        SharedForTests.promise = func(entry.name, entry, li, listItems, side);
      });
      listItems[side][sum(entry.text)] = li;
      // enable and get rid of the "..." in the label now that it's loaded
      button.text(entry.label).removeAttr("disabled");
    }
  }))
  setTextAreaHandlers(listItems);
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

async function clearData () {
  // Clear out data textarea.
  await App.Caches.inputData.set("", DefaultBase);
  $("#inputData .status").text(" ");

  // Clear out every form of ShapeMap.
  $("#textMap").val("").removeClass("error");
  makeFreshEditMap();
  $("#fixedMap").empty();

  results.clear();
}

async function clearAll () {
  $("#results .status").hide();
  await App.Caches.inputSchema.set("", DefaultBase);
  $(".inputShape").val("");
  $("#inputSchema .status").text(" ");
  $("#inputSchema li.selected").removeClass("selected");
  clearData();
  $("#inputData .passes, #inputData .fails").hide();
  $("#inputData .passes p:first").text("");
  $("#inputData .fails p:first").text("");
  $("#inputData .passes ul, #inputData .fails ul").empty();
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

let LastFailTime = 0;
// Validation UI
function disableResultsAndValidate (evt) {
  if (new Date().getTime() - LastFailTime < 100) {
    results.append(
      $("<div/>").addClass("warning").append(
        $("<h2/>").text("see shape map errors above"),
        $("<button/>").text("validate (ctl-enter)").on("click", disableResultsAndValidate),
        " again to continue."
      )
    );
    return; // return if < 100ms since last error.
  }
  results.clear();
  results.start();
  SharedForTests.promise = new Promise((resolve, reject) => {
    setTimeout(async function () {
      const errors = await copyEditMapToTextMap(); // will update if #editMap is dirty
      if (errors.length === 0)
        resolve(await callValidator());
    }, 0);
  })
}

function hasFocusNode () {
  return $(".focus").map((idx, elt) => {
    return $(elt).val();
  }).get().some(str => {
    return str.length > 0;
  });
}

function reportValidationError (validationError, currentAction) {
  $("#results .status").text("validation errors:").show();
  failMessage(validationError, currentAction);
  console.error(validationError); // dump details to console.
  return { validationError };
}

async function callValidator (done) {
  $("#fixedMap .pair").removeClass("passes fails");
  $("#results .status").hide();
  let currentAction = "parsing input schema";
  try {
    await App.Caches.inputSchema.refresh(); // @@ throw away parser stack?
    $("#schemaDialect").text(App.Caches.inputSchema.language);
    if (hasFocusNode()) {
      currentAction = "parsing input data";
      $("#results .status").text("parsing data...").show();
      const inputData = await App.Caches.inputData.refresh(); // need prefixes for ShapeMap
      // $("#shapeMap-tabs").tabs("option", "active", 2); // select fixedMap
      currentAction = "parsing shape map";
      const fixedMap = fixedShapeMapToTerms($("#fixedMap tr").map((idx, tr) => {
        return {
          node: App.Caches.inputData.meta.lexToTerm($(tr).find("input.focus").val()),
          shape: App.Caches.inputSchema.meta.lexToTerm($(tr).find("input.inputShape").val())
        };
      }).get());

      currentAction = "creating validator";
      $("#results .status").text("creating validator...").show();
      try {
        // shex-node loads IMPORTs and tests the schema for structural faults.
        const alreadLoaded = {
          schema: await App.Caches.inputSchema.refresh(),
          url: App.Caches.inputSchema.url || DefaultBase
        };
        const loaded = await ShExLoader.load({shexc: [alreadLoaded]}, null, {
          collisionPolicy: (type, left, right) => {
            const lStr = JSON.stringify(left);
            const rStr = JSON.stringify(right);
            if (lStr === rStr)
              return false; // keep left/old assignment
            throw new Error(`Conflicing definitions: ${lStr} !== ${rStr}`);
          }
        });
        let time;
        const validator = await ValidatorClass.factory(loaded, alreadLoaded.url, inputData);
        App.usingValidator(validator);

        currentAction = "validating";
        $("#results .status").text("validating...").show();
        time = new Date();
        const validationTracker = LOG_PROGRESS ? makeConsoleTracker() : undefined; // undefined to trigger default parameter assignment

        // invoke can throw an asynchronous error. Using .catch instead of await so callValidator is usefully async.
        return validator.invoke(fixedMap, validationTracker, time, done, currentAction)
          .catch(e => reportValidationError(e, currentAction));
      } catch (e) {
        return reportValidationError(e, currentAction);
      }
    } else {
      const outputLanguage = App.Caches.inputSchema.language === "ShExJ" ? "ShExC" : "ShExJ";
      $("#results .status").
        text("parsed "+App.Caches.inputSchema.language+" schema, generated "+outputLanguage+" ").
        append($("<button>(copy to input)</button>").
               css("border-radius", ".5em").
               on("click", async function () {
                 await App.Caches.inputSchema.set($("#results div").text(), DefaultBase);
               })).
        append(":").
        show();
      let parsedSchema;
      if (App.Caches.inputSchema.language === "ShExJ") {
        const opts = {
          simplifyParentheses: false,
          base: App.Caches.inputSchema.meta.base,
          prefixes: App.Caches.inputSchema.meta.prefixes
        }
        new ShEx.Writer(opts).writeSchema(App.Caches.inputSchema.parsed, (error, text) => {
          if (error) {
            $("#results .status").text("unwritable ShExJ schema:\n" + error).show();
            // res.addClass("error");
          } else {
            results.append($("<pre/>").text(text).addClass("passes"));
          }
        });
      } else {
        const pre = $("<pre/>");
        pre.text(JSON.stringify(ShEx.Util.AStoShExJ(ShEx.Util.canonicalize(App.Caches.inputSchema.parsed)), null, "  ")).addClass("passes");
        results.append(pre);
      }
      results.finish();
      return { transformation: {
        from: App.Caches.inputSchema.language,
        to: outputLanguage
      } }
    }
  } catch (e) {
    failMessage(e, currentAction);
    console.error(e); // dump details to console.
    return { inputError: e };
  }

  function makeConsoleTracker () {
    function padding (depth) { return (new Array(depth + 1)).join("  "); } // AKA "  ".repeat(depth)
    function sm (node, shape) {
      if (typeof shape === "object" && "term" in shape && shape.term === ShEx.Validator.Start.term) {
        shape = ShEx.Validator.Start;
      }
      return `${App.Caches.inputData.meta.termToLex(node)}@${App.Caches.inputSchema.meta.termToLex(shape)}`;
    }
    const logger = {
      recurse: x => { console.log(`${padding(logger.depth)}↻ ${sm(x.node, x.shape)}`); return x; },
      known: x => { console.log(`${padding(logger.depth)}↵ ${sm(x.node, x.shape)}`); return x; },
      enter: (point, label) => { console.log(`${padding(logger.depth)}→ ${sm(point, label)}`); ++logger.depth; },
      exit: (point, label, ret) => { --logger.depth; console.log(`${padding(logger.depth)}← ${sm(point, label)}`); },
      depth: 0
    };
    return logger;
  }
}

  async function renderEntry (entry) {
    const fails = entry.status === "nonconformant";

    // locate FixedMap entry
    const shapeString = entry.shape === ShEx.Validator.Start ? START_SHAPE_INDEX_ENTRY : entry.shape;
    const fixedMapEntry = $("#fixedMap .pair"+
                          "[data-node='"+entry.node+"']"+
                          "[data-shape='"+shapeString+"']");

    const klass = (fails ^ fixedMapEntry.find(".shapeMap-joiner").hasClass("nonconformant")) ? "fails" : "passes";
    const resultStr = fails ? "✗" : "✓";
    let elt = null;

    if (!fails) {
      if ($("#success").val() === "query" || $("#success").val() === "remainder") {
        const proofStore = new RdfJs.Store();
        ShEx.Util.getProofGraph(entry.appinfo, proofStore, RdfJs.DataFactory);
        entry.graph = proofStore.getQuads();
      }
      if ($("#success").val() === "remainder") {
        const remainder = new RdfJs.Store();
        remainder.addQuads((await App.Caches.inputData.refresh()).getQuads());
        entry.graph.forEach(q => remainder.removeQuad(q));
        entry.graph = remainder.getQuads();
      }
    }

    if (entry.graph) {
      const wr = new RdfJs.Writer(App.Caches.inputData.meta);
      wr.addQuads(entry.graph);
      wr.end((error, results) => {
        if (error)
          throw error;
        entry.turtle = ""
          + "# node: " + entry.node + "\n"
          + "# shape: " + entry.shape + "\n"
          + results.trim();
        elt = $("<pre/>").text(entry.turtle).addClass(klass);
      });
      delete entry.graph;
    } else {
      let renderMe = entry
      switch ($("#interface").val()) {
      case "human":
        elt = $("<div class='human'/>").append(
          $("<span/>").text(resultStr),
          $("<span/>").text(
            `${ldToTurtle(entry.node, App.Caches.inputData.meta.termToLex)}@${fails ? "!" : ""}${App.Caches.inputSchema.meta.termToLex(entry.shape)}`
          )).addClass(klass);
        if (fails)
          elt.append($("<pre>").text(ShEx.Util.errsToSimple(entry.appinfo).join("\n")));
        break;

      case "minimal":
        if (fails)
          entry.reason = ShEx.Util.errsToSimple(entry.appinfo).join("\n");
        renderMe = Object.keys(entry).reduce((acc, key) => {
          if (key !== "appinfo")
            acc[key] = entry[key];
          return acc
        }, {});
        // falling through to default covers the appinfo case
      default:
        elt = $("<pre/>").text(JSON.stringify(renderMe, null, "  ")).addClass(klass);
      }
    }
    results.append(elt);

    // update the FixedMap
    fixedMapEntry.addClass(klass).find("a").text(resultStr);
    const nodeLex = fixedMapEntry.find("input.focus").val();
    const shapeLex = fixedMapEntry.find("input.inputShape").val();
    const anchor = encodeURIComponent(nodeLex) + "@" + encodeURIComponent(shapeLex);
    elt.attr("id", anchor);
    fixedMapEntry.find("a").attr("href", "#" + anchor);
    fixedMapEntry.attr("title", entry.elapsed + " ms")

    if (entry.status === "conformant") {
      const resultBindings = ShEx.Util.valToExtension(entry.appinfo, MapModule.url);
      await App.Caches.bindings.set(JSON.stringify(resultBindings, null, "  "));
    } else {
      await App.Caches.bindings.set("{}");
    }
  }

  function finishRendering (done) {
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
      //   const x = ShEx.Util.valToValues(ret);
      //   // const x = ShEx.Util.ShExJtoAS(valuesToSchema(valToValues(ret)));
      //   res = results.replace(JSON.stringify(x, null, "  "));
      //   const y = ShEx.Util.valuesToSchema(x);
      //   res = results.append(JSON.stringify(y, null, "  "));
      // } catch (e) {
      //   console.dir(e);
      // }
      results.finish();
  }

function failMessage (e, action, text) {
  $("#results .status").empty().text("Errors encountered:").show()
  const div = $("<div/>").addClass("error");
  div.append($("<h3/>").text("error " + action + ":\n"));
  div.append($("<pre/>").text(e.message));
  if (text)
    div.append($("<pre/>").text(text));
  results.append(div);
  LastFailTime = new Date().getTime();
}

async function materialize () {
  SharedForTests.promise = materializeAsync()
}
async function materializeAsync () {
  if (App.Caches.bindings.get().trim().length === 0) {
    results.replace("You must validate data against a ShExMap schema to populate mappings bindings.").
      removeClass("passes fails").addClass("error");
    return null;
  }
  results.start();
  const parsing = "output schema";
  try {
    const outputSchemaText = App.Caches.outputSchema.selection.val();
    const outputSchemaIsJSON = outputSchemaText.match(/^\s*\{/);
    const outputSchema = await App.Caches.outputSchema.refresh();

    // const resultBindings = Object.assign(
    //   await App.Caches.statics.refresh(),
    //   await App.Caches.bindings.refresh()
    // );

    function _dup (obj) { return JSON.parse(JSON.stringify(obj)); }
    let resultBindings = _dup(await App.Caches.bindings.refresh());
    if (App.Caches.statics.get().trim().length === 0)
      await App.Caches.statics.set("{  }");
    const _t = await App.Caches.statics.refresh();
    if (_t && Object.keys(_t).length > 0) {
      if (!Array.isArray(resultBindings))
        resultBindings = [resultBindings];
      resultBindings.unshift(_t);
    }

    // const trivialMaterializer = Mapper.trivialMaterializer(outputSchema);
    const outputShapeMap = fixedShapeMapToTerms([{
      node: App.Caches.inputData.meta.lexToTerm($("#createRoot").val()),
      shape: App.Caches.outputSchema.meta.lexToTerm($("#outputShape").val()) // resolve with App.Caches.outputSchema
    }]);

    await App.Caches.bindings.set(JSON.stringify(resultBindings, null, "  "));
    const generatedGraph = new RdfJs.Store();
    $("#results div").empty();
    $("#results .status").text("materializing data...").show();

    const resultGraphs = []
    const materialized = await new Canceleable(
      $("#materialize"),
      materialize,
      "materialization aborted, re-start from validation",
      {
        request: "materialize",
        queryMap: outputShapeMap,
        outputSchema: outputSchema,
        resultBindings: resultBindings,
        options: {track: LOG_PROGRESS},
      },
      parseUpdatesAndResults
    ).ready();

    function parseUpdatesAndResults (msg, workerUICleanup, resolve, reject) {
      switch (msg.data.response) {
      case "update":
        generatedGraph.addQuads(ShEx.Util.valToN3js(msg.data.results, RdfJs.DataFactory));
        resultGraphs.push(msg.data.results);
        break;

      case "error":
        if ("exception" in msg.data) {
          results.replace("error materializing:\n" + msg.data.exception).
            removeClass("passes fails").addClass("error");
        } else {
          renderEntry({
            node: msg.data.node,
            shape: msg.data.shape,
            status: "errors" in msg.data.results ? "nonconformant" : "conformant",
            appinfo: msg.data.results,
            elapsed: -1
          });
        }
        break;

      case "done":
        workerUICleanup();
        resolve({ materializionResults: resultGraphs });
      }
    }
    finishRendering();
    $("#results .status").text("materialization results").show();

    // Extract rdf:Collection heads.
    const lists = generatedGraph.extractLists({
      remove: true // Remove quads involved in lists (RDF Collections).
    });

    outputShapeMap.forEach(pair => {
      const {node, shape} = pair;
      try {
        const nestedWriter = new ShEx.NestedTurtleWriter.Writer(null, {
          // lists: {}, -- lists will require some thinking
          format: 'text/turtle',
          // baseIRI: resource.base,
          prefixes: App.Caches.outputSchema.parsed._prefixes,
          lists,
          version: 1.1,
          indent: '    ',
          checkCorefs: n => false,
          // debug: true,
        });
        const db = ShEx.RdfJsDb(generatedGraph, null); // no query tracker needed
        const validator = new ShEx.Validator(outputSchema, db, {
          results: "api",
          regexModule: ShEx["eval-simple-1err"],
        });
        const res = validator.validateShapeMap([{node, shape}])[0].appinfo;
        if (!("solution" in res))
          throw res;
        const matched = [];
        const seen = new RdfJs.Store(); // use N3Store to de-duplicate quads that were validated multiple ways.
        const matchedDb = {
          addQuad: function (q) {
            if (!seen.countQuads(q.subject, q.predicate, q.object, q.graph)) {
              seen.addQuad(q);
              matched.push(q);
            }
          }
        }
        ShEx.Util.getProofGraph(res, matchedDb, RdfJs.DataFactory);
        const rest = new RdfJs.Store();
        rest.addQuads(generatedGraph.getQuads()); // the resource giveth
        matched.forEach(q => rest.removeQuad(q)); // the matched taketh away
        nestedWriter.addQuads(matched.filter(q => ([ShEx.Util.RDF.first, ShEx.Util.RDF.rest]).indexOf(q.predicate.value) === -1));
        if (rest.size > 0) {
          nestedWriter.comment("\n# Triples not in the schema:");
          nestedWriter.addQuads(rest.getQuads())
        }
        nestedWriter.end(addResult);
      } catch (e) {
        console.error(`NestedWriter(${node}@${shape}) failure:`);
        console.error(e);
        const fallbackWriter = new RdfJs.Writer({ prefixes: App.Caches.outputSchema.parsed._prefixes });
        fallbackWriter.addQuads(generatedGraph.getQuads());
        fallbackWriter.end(addResult);
      }
    });
    results.finish();
    return { materializationResults: generatedGraph };
  } catch (e) {
    results.replace("error parsing " + parsing + ":\n" + e).
      removeClass("passes fails").addClass("error");
    // results.finish();
    return null;
  }
}

function addResult (error, result) {
  results.append(
    $("<div/>", {class: "passes"}).append(
      $("<span/>", {class: "shapeMap"}).append(
        "# ",
        $("<span/>", {class: "data"}).text($("#createRoot").val()),
        $("<span/>", {class: "valStatus"}).text("@"),
        $("<span/>", {class: "schema"}).text($("#outputShape").val()),
      ),
      $("<pre/>").text(result)
    )
  )
  // results.append($("<pre/>").text(result));
}

function addEmptyEditMapPair (evt) {
  addEditMapPairs(null, $(evt.target).parent().parent());
  markEditMapDirty();
  return false;
}

function addEditMapPairs (pairs, target) {
  (pairs || [{node: {type: "empty"}}]).forEach(pair => {
    const nodeType = (typeof pair.node !== "object" || "@value" in pair.node)
        ? "node"
        : pair.node.type;
    let skip = false;
    let node, shape;
    switch (nodeType) {
    case "empty": node = shape = ""; break;
    case "node": node = ldToTurtle(pair.node, App.Caches.inputData.meta.termToLex); shape = startOrLdToTurtle(pair.shape); break;
    case "TriplePattern": node = renderTP(pair.node); shape = startOrLdToTurtle(pair.shape); break;
    case "Extension":
      failMessage(Error("unsupported extension: <" + pair.node.language + ">"),
                  "parsing Query Map", pair.node.lexical);
      skip = true; // skip this entry.
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

    const spanElt = $("<tr/>", {class: "pair"});
    const focusElt = $("<textarea/>", {
      rows: '1',
      type: 'text',
      class: 'data focus'
    }).text(node).on("change", markEditMapDirty);
    const joinerElt = $("<span>", {
      class: 'shapeMap-joiner'
    }).append("@").addClass(pair.status);
    joinerElt.append(
      $("<input>", {style: "border: none; width: .2em;", readonly: "readonly"}).val(pair.status === "nonconformant" ? "!" : " ").on("click", function (evt) {
        const status = $(this).parent().hasClass("nonconformant") ? "conformant" : "nonconformant";
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
    const shapeElt = $("<input/>", {
      type: 'text',
      value: shape,
      class: 'schema inputShape'
    }).on("change", markEditMapDirty);
    const addElt = $("<button/>", {
      class: "addPair",
      title: "add a node/shape pair"}).text("+");
    const removeElt = $("<button/>", {
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
    addContextMenus("#editMap .pair:nth("+idx+") .focus", App.Caches.inputData);
    addContextMenus(".pair:nth("+idx+") .inputShape", App.Caches.inputSchema);
  });
  return false;

  function renderTP (tp) {
    const ret = ["subject", "predicate", "object"].map(k => {
      const ld = tp[k];
      if (ld === ShEx.ShapeMap.Focus)
        return "FOCUS";
      if (!ld) // ?? ShEx.Uti.any
        return "_";
      return ldToTurtle(ld, App.Caches.inputData.meta.termToLex);
    });
    return "{" + ret.join(" ") + "}";
  }

  function startOrLdToTurtle (term) {
    return term === ShEx.Validator.Start ? START_SHAPE_LABEL : ShEx.ShExTerm.shExJsTerm2Turtle(term, App.Caches.inputSchema.meta);
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
  $("#success").on("change", setInterface);
  $("#regexpEngine").on("change", toggleControls);
  $("#validate").on("click", disableResultsAndValidate);
  $("#clear").on("click", clearAll);
  $("#download-results-button").on("click", downloadResults);

  $("#loadForm").dialog({
    autoOpen: false,
    modal: true,
    buttons: {
      "GET": function (evt, ui) {
        results.clear();
        const target = App.Getables.find(g => g.queryStringParm === $("#loadForm span.whatToLoad").text());
        const url = $("#loadInput").val();
        const tips = $(".validateTips");
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
        SharedForTests.promise = target.cache.asyncGet(url).catch(function (e) {
          updateTips(e.message);
        });
      },
      "Cancel": function() {
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
  App.Getables.forEach(target => {
    const type = target.queryStringParm
    $("#load-"+type+"-button").click(evt => {
      const prefillURL = target.url ? target.url :
          target.cache.meta.base && target.cache.meta.base !== DefaultBase ? target.cache.meta.base :
          "";
      $("#loadInput").val(prefillURL);
      $("#loadForm").attr("class", type).find("span.whatToLoad").text(type);
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
    activate: async function (event, ui) {
      if (ui.oldPanel.get(0) === $("#editMap-tab").get(0))
        await copyEditMapToTextMap();
      else if (ui.oldPanel.get(0) === $("#textMap").get(0))
        await copyTextMapToEditMap()
    }
  });
  $("#textMap").on("change", evt => {
    results.clear();
    SharedForTests.promise = copyTextMapToEditMap();
  });
  App.Caches.inputData.selection.on("change", dataInputHandler); // input + paste?
  // $("#copyEditMapToFixedMap").on("click", copyEditMapToFixedMap); // may add this button to tutorial

  function dismissModal (evt) {
    // $.unblockUI();
    $("#about").dialog("close");
    toggleControls();
    return true;
  }

  // Prepare file uploads
  $("input.inputfile").each((idx, elt) => {
    $(elt).on("change", function (evt) {
      const reader = new FileReader();

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

  $("#materialize").on("click", materialize);
}

async function dataInputHandler (evt) {
  const active = $('#shapeMap-tabs ul li.ui-tabs-active a').attr('href');
  if (active === "#editMap-tab")
    return await copyEditMapToTextMap();
  else // if (active === "#textMap")
    return await copyTextMapToEditMap();
}

async function toggleControls (evt) {
  // don't use `return false` 'cause the browser doesn't wait around for a promise before looking at return false to decide the event is handled
  if (evt) evt.preventDefault();

  const revealing = evt && $("#controls").css("display") !== "flex";
  $("#controls").css("display", revealing ? "flex" : "none");
  toggleControlsArrow(revealing ? "up" : "down");
  if (revealing) {
    let target = evt.target;
    while (target.tagName !== "BUTTON")
      target = target.parentElement;
    if ($("#menuForm").css("position") === "absolute") {
      $("#controls").
        css("top", 0).
        css("left", $("#menu-button").css("margin-left"));
    } else {
      const bottonBBox = target.getBoundingClientRect();
      const controlsBBox = $("#menuForm").get(0).getBoundingClientRect();
      const left = bottonBBox.right - bottonBBox.width; // - controlsBBox.width;
      $("#controls").css("top", bottonBBox.bottom).css("left", left);
    }
    $("#permalink a").removeAttr("href"); // can't click until ready
    const permalink = await getPermalink();
    $("#permalink a").attr("href", permalink);
  }
}

function toggleControlsArrow (which) {
  // jQuery can't find() a prefixed attribute (xlink:href); fall back to DOM:
  if (document.getElementById("menu-button") === null)
    return;
  const down = $(document.getElementById("menu-button").
               querySelectorAll('use[*|href="#down-arrow"]'));
  const up = $(document.getElementById("menu-button").
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

function downloadResults (evt) {
  const typed = [
    { type: "text/plain", name: "results.txt" },
    { type: "application/json", name: "results.json" }
  ][$("#interface").val() === "appinfo" ? 1 : 0];
  const blob = new Blob([results.text()], {type: typed.type});
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
const parseQueryString = function(query) {
  if (query[0]==='?') query=query.substr(1); // optional leading '?'
  const map   = {};
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
 * use {App.Caches.inputData,App.Caches.inputSchema}.meta.{prefix,base} to complete IRIs
 * @return array of encountered errors
 */
async function copyEditMapToFixedMap () {
  $("#fixedMap tbody").empty(); // empty out the fixed map.
  const fixedMapTab = $("#shapeMap-tabs").find('[href="#fixedMap-tab"]');
  const restoreText = fixedMapTab.text();
  fixedMapTab.text("resolving Fixed Map").addClass("running");
  $("#fixedMap .pair").remove(); // clear out existing edit map (make optional?)
  const nodeShapePromises = $("#editMap .pair").get().reduce((acc, queryPair) => {
    $(queryPair).find(".error").removeClass("error"); // remove previous error markers
    const node = $(queryPair).find(".focus").val();
    const shape = $(queryPair).find(".inputShape").val();
    const status = $(queryPair).find(".shapeMap-joiner").hasClass("nonconformant") ? "nonconformant" : "conformant";
    if (!node || !shape)
      return acc;
    const smparser = ShEx.ShapeMapParser.construct(
      App.Caches.shapeMap.meta.base, App.Caches.inputSchema.meta, App.Caches.inputData.meta);
    try {
      const sm = smparser.parse(node + '@' + shape)[0];
      const added = typeof sm.node === "string" || "@value" in sm.node
            ? Promise.resolve({nodes: [node], shape: shape, status: status})
            : getQuads(sm.node.subject, sm.node.predicate, sm.node.object)
            .then(nodes => Promise.resolve({nodes: nodes, shape: shape, status: status}));
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
      return acc;
    }
  }, []);

  const pairs = await Promise.all(nodeShapePromises)
  pairs.reduce((acc, pair) => {
    pair.nodes.forEach(node => {
      const nodeTerm = App.Caches.inputData.meta.lexToTerm(node + " "); // for langcode lookahead
      let shapeTerm = App.Caches.inputSchema.meta.lexToTerm(pair.shape);
      if (shapeTerm === ShEx.Validator.Start)
        shapeTerm = START_SHAPE_INDEX_ENTRY;
      const key = nodeTerm + "|" + shapeTerm;
      if (key in acc)
        return;

      const spanElt = createEntry(node, nodeTerm, pair.shape, shapeTerm, pair.status);
      acc[key] = spanElt; // just needs the key so far.
    });

    return acc;
  }, {})
  // scroll inputs to right
  $("#fixedMap input").each((idx, focusElt) => {
    focusElt.scrollLeft = focusElt.scrollWidth;
  });
  fixedMapTab.text(restoreText).removeClass("running");
  return []; // no errors

  async function getQuads (s, p, o) {
    const get = s === ShEx.ShapeMap.Focus ? "subject" : "object";
    return (await App.Caches.inputData.refresh()).getQuads(mine(s), mine(p), mine(o)).map(t => {
      return App.Caches.inputData.meta.termToLex(t[get]); // count on unpublished N3.js id API
    });
    function mine (term) {
      return term === ShEx.ShapeMap.Focus || term === ShEx.ShapeMap.Wildcard
        ? null
        : term;
    }
  }

      function createEntry (node, nodeTerm, shape, shapeTerm, status) {
    const spanElt = $("<tr/>", {class: "pair"
                              ,"data-node": nodeTerm
                              ,"data-shape": shapeTerm
                             });
    const focusElt = $("<input/>", {
      type: 'text',
      value: node,
      class: 'data focus',
      disabled: "disabled"
    });
    const joinerElt = $("<span>", {
      class: 'shapeMap-joiner'
    }).append("@").addClass(status);
    if (status === "nonconformant") {
      joinerElt.addClass("negated");
      joinerElt.append("!");
    }
    const shapeElt = $("<input/>", {
      type: 'text',
      value: shape,
      class: 'schema inputShape',
      disabled: "disabled"
    });
    const removeElt = $("<button/>", {
      class: "removePair",
      title: "remove this node/shape pair"}).text("-");
    removeElt.on("click", evt => {
      // Remove related result.
      let href, result;
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
  return App.Caches.inputData.meta.termToLex(row[0]); // row[0] is the first column.
}

/**
 * @return list of errors encountered
 */
async function copyEditMapToTextMap () {
  if ($("#editMap").attr("data-dirty") === "true") {
    const text = $("#editMap .pair").get().reduce((acc, queryPair) => {
      const node = $(queryPair).find(".focus").val();
      const shape = $(queryPair).find(".inputShape").val();
      if (!node || !shape)
        return acc;
      const status = $(queryPair).find(".shapeMap-joiner").hasClass("nonconformant") ? "!" : "";
      return acc.concat([node+"@"+status+shape]);
    }, []).join(",\n");
    $("#textMap").empty().val(text);
    const ret = await copyEditMapToFixedMap();
    markEditMapClean();
    return ret;
  } else {
    return []; // no errors
  }
}

/**
 * Parse query map to populate #editMap and #fixedMap.
 * @returns list of errors. ([] means everything was good.)
 */
async function copyTextMapToEditMap () {
  $("#textMap").removeClass("error");
  const shapeMap = $("#textMap").val();
  results.clear();
  try {
    await App.Caches.inputSchema.refresh();
    await App.Caches.inputData.refresh();
    const smparser = ShEx.ShapeMapParser.construct(
      App.Caches.shapeMap.meta.base, App.Caches.inputSchema.meta, App.Caches.inputData.meta);
    const sm = smparser.parse(shapeMap);
    removeEditMapPair(null);
    addEditMapPairs(sm.length ? sm : null);
    const ret = await copyEditMapToFixedMap();
    markEditMapClean();
    results.clear();
    return ret;
  } catch (e) {
    $("#textMap").addClass("error");
    failMessage(e, "parsing Query Map");
    makeFreshEditMap()
    return [e];
  }
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
    return {node: App.Caches.inputData.meta.lexToTerm(pair.node + " "),
            shape: App.Caches.inputSchema.meta.lexToTerm(pair.shape)};
  });*/
}

function setTextAreaHandlers (listItems) {
  const timeouts = Object.keys(App.Caches).reduce((acc, k) => {
    acc[k] = undefined;
    return acc;
  }, {});

  Object.keys(App.Caches).forEach(function (cache) {
    App.Caches[cache].selection.keyup(function (e) { // keyup to capture backspace
      const code = e.keyCode || e.charCode;
      // if (!(e.ctrlKey)) {
      //   results.clear();
      // }
      if (!(e.ctrlKey && (code === 10 || code === 13))) {
        later(e.target, cache, App.Caches[cache]);
      }
    });
  });

  function later (target, side, cache) {
    cache.dirty(true);
    if (timeouts[side])
      clearTimeout(timeouts[side]);

    timeouts[side] = setTimeout(() => {
      timeouts[side] = undefined;
      const curSum = sum($(target).val());
      if (curSum in listItems[side])
        listItems[side][curSum].addClass("selected");
      else
        $("#"+side+" .selected").removeClass("selected");
      delete cache.url;
    }, INPUTAREA_TIMEOUT);
  }
}

  /**
   * update location with a current values of some inputs
   */
  async function getPermalink () {
    let parms = [];
    await copyEditMapToTextMap();
    parms = parms.concat(App.QueryParams.reduce((acc, input) => {
      let parm = input.queryStringParm;
      let val = input.location.val();
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
    const s = parms.join("&");
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
async function prepareDragAndDrop () {
  App.QueryParams.filter(q => {
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
      {media: "application/json", target: App.Caches.manifest},
      {ext: ".shex", media: "text/shex", target: App.Caches.inputSchema},
      {ext: ".ttl", media: "text/turtle", target: App.Caches.inputData},
      {ext: ".json", media: "application/json", target: App.Caches.manifest},
      {ext: ".smap", media: "text/plain", target: App.Caches.shapeMap}]}
  ]).forEach(desc => {
    const droparea = desc.location;
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
          const promises = [];
          if (prefTypes.find(l => {
            if (l.type.indexOf("/") === -1) {
              if (l.type in xfer && xfer[l.type].length > 0) {
                $("#results .status").text("handling "+xfer[l.type].length+" files...").show();
                promises.push(readfiles(xfer[l.type], desc.targets));
                return true;
              }
            } else {
              if (xfer.getData(l.type)) {
                const val = xfer.getData(l.type);
                $("#results .status").text("handling "+l.type+"...").show();
                if (l.type === "application/json") {
                  if (desc.location.get(0) === $("body").get(0)) {
                    let parsed = JSON.parse(val);
                    if (!(Array.isArray(parsed))) {
                      parsed = [parsed];
                    }
                    parsed.map(elt => {
                      const action = "action" in elt ? elt.action: elt;
                      action.schemaURL = action.schema; delete action.schema;
                      action.dataURL = action.data; delete action.data;
                    });
                    promises.push(App.Caches.manifest.set(parsed, DefaultBase, "drag and drop"));
                  } else {
                    promises.push(inject(desc.targets, DefaultBase, val, l.type));
                  }
                } else if (l.type === "text/uri-list") {
                  $.ajax({
                    accepts: {
                      mycustomtype: 'text/shex,text/turtle,*/*'
                    },
                    url: val,
                    dataType: "text"
                  }).fail(function (jqXHR, textStatus) {
                    const error = jqXHR.statusText === "OK" ? textStatus : jqXHR.statusText;
                    results.append($("<pre/>").text("GET <" + val + "> failed: " + error));
                  }).done(function (data, status, jqXhr) {
                    try {
                      promises.push(inject(desc.targets, val, data, (jqXhr.getResponseHeader("Content-Type") || "unknown-media-type").split(/[ ;,]/)[0]));
                      $("#loadForm").dialog("close");
                      toggleControls();
                    } catch (e) {
                      results.append($("<pre/>").text("unable to evaluate <" + val + ">: " + (e.stack || e)));
                    }
                  });
                } else if (l.type === "text/plain") {
                  promises.push(inject(desc.targets, DefaultBase, val, l.type));
                }
                $("#results .status").text("").hide();
                // desc.targets.text(xfer.getData(l.type));
                return true;
                async function inject (targets, url, data, mediaType) {
                  const target =
                      targets.length === 1 ? targets[0].target :
                      targets.reduce((ret, elt) => {
                        return ret ? ret :
                          mediaType === elt.media ? elt.target :
                          null;
                      }, null);
                  if (target) {
                    const appendTo = $("#append").is(":checked") ? target.get() : "";
                    await target.set(appendTo + data, url, 'drag and drop', mediaType);
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
          SharedForTests.promise = Promise.all(promises);
        });
    });
  /*async*/ function readfiles(files, targets) { // returns promise but doesn't use await
    const formData = new FormData();
    let successes = 0;
    const promises = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i], name = file.name;
      const target = targets.reduce((ret, elt) => {
        return ret ? ret :
          name.endsWith(elt.ext) ? elt.target :
          null;
      }, null);
      if (target) {
        promises.push(new Promise((resolve, reject) => {
          formData.append("file", file);
          const reader = new FileReader();
          reader.onload = (function (target) {
            return async function (event) {
              const appendTo = $("#append").is(":checked") ? target.get() : "";
              await target.set(appendTo + event.target.result, DefaultBase);
              ++successes;
              resolve()
            };
          })(target);
          reader.readAsText(file);
        }))
      } else {
        results.append("don't know what to do with " + name + "\n");
      }
    }
    return Promise.all(promises).then(() => {
      $("#results .status").text("loaded "+successes+" files.").show();
    })
  }
}

function addContextMenus (inputSelector, cache) {
  // !!! terribly stateful; only one context menu at a time!
  const DATA_HANDLE = 'runCallbackThingie'
  let terms = null, nodeLex = null, target, scrollLeft, m, addSpace = "";
  $(inputSelector).on('contextmenu', rightClickHandler)
  $.contextMenu({
    trigger: 'none',
    selector: inputSelector,
    build: function($trigger, e) {
      // return callback set by the mouseup handler
      return $trigger.data(DATA_HANDLE)();
    }
  });

  async function buildMenuItemsPromise (elt, evt) {
    if (elt.hasClass("data")) {
      nodeLex = elt.val();
      const shapeLex = elt.parent().parent().find(".schema").val()

      // Would like to use SMParser but that means users can't fix bad SMs.
      /*
        const sm = smparser.parse(nodeLex + '@START')[0];
        const m = typeof sm.node === "string" || "@value" in sm.node
            ? null
            : tpToM(sm.node);
      */

      m = nodeLex.match(RegExp("^"+ParseTriplePattern+"$"));
      if (m) {
        target = evt.target;
        const selStart = target.selectionStart;
        scrollLeft = target.scrollLeft;
        terms = [0, 1, 2].reduce((acc, ord) => {
          if (m[(ord+1)*2-1] !== undefined) {
            const at = acc.start + m[(ord+1)*2-1].length;
            const len = m[(ord+1)*2] ? m[(ord+1)*2].length : 0;
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
              ? "- " + t.substr(1) + " -"
              : App.Caches.inputData.meta.termToLex(t); // !!check
          });
        }
        const queryMapKeywords = ["FOCUS", "_"];
        const getTermsFunctions = [
          () => { return queryMapKeywords.concat(norm(store.getSubjects())); },
          () => { return norm(store.getPredicates()); },
          () => { return queryMapKeywords.concat(norm(store.getObjects())); },
        ];
        const store = await App.Caches.inputData.refresh();
        if (terms.match === null)
          return false; // prevent contextMenu from whining about an empty list
        return listToCTHash(getTermsFunctions[terms.match]())
      }
    }
    terms = nodeLex = null;
    try {
      return listToCTHash(await cache.getItems())
    } catch (e) {
      failMessage(e, cache === App.Caches.inputSchema ? "parsing schema" : "parsing data");
      let items = {};
      const failContent = "no choices found";
      items[failContent] = failContent;
      return items
    }

    // hack to emulate regex parsing product
    /*
      function tpToM (tp) {
        return [nodeLex, '{', lex(tp.subject), " ", lex(tp.predicate), " ", lex(tp.object), "", "}", ""];
        function lex (node) {
          return node === ShEx.ShapeMap.Focus
            ? "FOCUS"
            : node === null
            ? "_"
            : App.Caches.inputData.meta.termToLex(node);
        }
      }
    */
  }

  function rightClickHandler (e) {
    e.preventDefault();
    const $this = $(this);
    $this.off('contextmenu', rightClickHandler);

    // when the items are ready,
    const p = buildMenuItemsPromise($this, e)
    p.then(items => {

      // store a callback on the trigger
      $this.data(DATA_HANDLE, function () {
        return {
          callback: menuCallback,
          items: items
        };
      });
      const _offset = $this.offset();
      $this.contextMenu({
        x: _offset.left + 10,
        y: _offset.top + 10
      })
      $this.on('contextmenu', rightClickHandler)
    });
  }

  function menuCallback (key, options) {
    markEditMapDirty();
    if (options.items[key].ignore) { // ignore the event
    } else if (terms) {
      const term = terms.tz[terms.match];
      let val = nodeLex.substr(0, term[0]) +
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
  }

  function listToCTHash (items) {
    return items.reduce((acc, item) => {
      acc[item] = { name: item }
      return acc
    }, {})
  }
}

prepareControls();
const dndPromise = prepareDragAndDrop(); // async 'cause it calls Cache.X.set("")
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
