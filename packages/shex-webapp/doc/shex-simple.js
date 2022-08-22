// shex-simple - Simple ShEx2 validator for HTML.
// Copyright 2017 Eric Prud'hommeux
// Release under MIT License.

const ShEx = ShExWebApp; // @@ rename globally
const ShExJsUrl = 'https://github.com/shexSpec/shex.js'
const RdfJs = N3js;
const ShExLoader = ShEx.Loader({
  fetch: window.fetch.bind(window), rdfjs: RdfJs, jsonld: null
})
ShEx.ShapeMap.start = ShEx.Validator.start
const START_SHAPE_LABEL = "START";
const START_SHAPE_INDEX_ENTRY = "- start -"; // specificially not a JSON-LD @id form.
const INPUTAREA_TIMEOUT = 250;
const NO_MANIFEST_LOADED = "no manifest loaded";
const LOG_PROGRESS = false;

const DefaultBase = location.origin + location.pathname;

const Caches = {};
Caches.inputSchema = makeSchemaCache($("#inputSchema textarea.schema"));
Caches.inputData = makeTurtleCache($("#inputData textarea"));
Caches.manifest = makeManifestCache($("#manifestDrop"));
Caches.extension = makeExtensionCache($("#extensionDrop"));
Caches.shapeMap = makeShapeMapCache($("#textMap")); // @@ rename to #shapeMap
// let ShExRSchema; // defined in calling page

const SharedForTests = {Caches, /*DefaultBase*/} // an object to share state with a test harness

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

const Getables = [
  {queryStringParm: "schema",       location: Caches.inputSchema.selection, cache: Caches.inputSchema},
  {queryStringParm: "data",         location: Caches.inputData.selection,   cache: Caches.inputData  },
  {queryStringParm: "manifest",     location: Caches.manifest.selection,    cache: Caches.manifest   , fail: e => $("#manifestDrop li").text(NO_MANIFEST_LOADED)},
  {queryStringParm: "extension",    location: Caches.extension.selection,   cache: Caches.extension  },
  {queryStringParm: "shape-map",    location: $("#textMap"),                cache: Caches.shapeMap   },
];

const QueryParams = Getables.concat([
  {queryStringParm: "interface",    location: $("#interface"),       deflt: "human"     },
  {queryStringParm: "success",      location: $("#success"),         deflt: "proof"     },
  {queryStringParm: "regexpEngine", location: $("#regexpEngine"),    deflt: "eval-threaded-nerr" },
]);

// utility functions
function parseTurtle (text, meta, base) {
  const ret = new RdfJs.Store();
  RdfJs.Parser._resetBlankNodePrefix();
  const parser = new RdfJs.Parser({baseIRI: base, format: "text/turtle" });
  const quads = parser.parse(text);
  if (quads !== undefined)
    ret.addQuads(quads);
  meta.base = parser._base;
  meta.prefixes = parser._prefixes;
  return ret;
}

shexParserOptions = {index: true, duplicateShape: "abort"};
const shexParser = ShEx.Parser.construct(DefaultBase, null, shexParserOptions);
function parseShEx (text, meta, base) {
  shexParserOptions.duplicateShape = $("#duplicateShape").val();
  shexParser._setBase(base);
  const ret = shexParser.parse(text);
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
  return ShEx.ShExTerm.internalTermToTurtle(node, resolver.meta.base, resolver.meta.prefixes);
}
function rdflib_lexToTerm (lex, resolver) {
  return lex === START_SHAPE_LABEL ? ShEx.Validator.start :
    lex === "a" ? "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" :
    new RdfJs.Lexer().tokenize(lex + " ") // need " " to parse "chat"@en
    .map(token => {
    const left = 
          token.type === "typeIRI" ? "^^" :
          token.type === "langcode" ? "@" :
          token.type === "type" ? "^^" + resolver.meta.prefixes[token.prefix] :
          token.type === "prefixed" ? resolver.meta.prefixes[token.prefix] :
          token.type === "blank" ? "_:" :
          "";
    const right = token.type === "IRI" || token.type === "typeIRI" ?
          resolver._resolveAbsoluteIRI(token) :
          token.value;
    return left + right;
  }).join("");
  return lex === ShEx.Validator.start ? lex : lex[0] === "<" ? lex.substr(1, lex.length - 2) : lex;
}
// </n3.js-specific>


// caches for textarea parsers
function _makeCache (selection) {
  let _dirty = true;
  const ret = {
    selection: selection,
    parsed: null, // a Promise
    meta: { prefixes: {}, base: DefaultBase },
    dirty: function (newVal) {
      const ret = _dirty;
      _dirty = newVal;
      return ret;
    },
    get: function () {
      return selection.val();
    },
    set: async function (text, base) {
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
    refresh: async function () {
      if (!_dirty)
        return this.parsed;
      this.parsed = await this.parse(selection.val(), this.meta.base);
      await this.parsed;
      _dirty = false;
      return this.parsed;
    },
    asyncGet: async function (url) {
      url = new URL(url, window.location).href
      const _cache = this;
      let resp
      try {
        resp = await fetch(url, {headers: {
          accept: 'text/shex,text/turtle,*/*;q=0.9, test/html;q=0.8',
          // cache: 'no-cache' -- breaks CORS, so user has to open in new page and force reload there
        }})
      } catch (e) {
        throw Error("unable to fetch <" + url + ">: " + '\n' + e.message);
      }
      if (!resp.ok)
        throw Error("fetch <" + url + "> got error response " + resp.status + ": " + resp.statusText);
      const data = await resp.text();
      _cache.meta.base = url;
      try {
        await _cache.set(data, url, undefined, resp.headers.get('content-type'));
      } catch (e) {
        throw Error("error setting " + this.queryStringParm + " with <" + url + ">: " + '\n' + e.message);
      }
      $("#loadForm").dialog("close");
      toggleControls();
      return { url: url, data: data };
    },
    url: undefined // only set if inputarea caches some web resource.
  };

  ret.meta.termToLex = function (trm) { return  rdflib_termToLex(trm, new IRIResolver(ret.meta)); };
  ret.meta.lexToTerm = function (lex) { return  rdflib_lexToTerm(lex, new IRIResolver(ret.meta)); };
  return ret;
}

function makeSchemaCache (selection) {
  const ret = _makeCache(selection);
  let graph = null;
  ret.language = null;
  ret.parse = async function (text, base) {
    const isJSON = text.match(/^\s*\{/);
    const isDCTAP = text.match(/\s*shapeID/)
    graph = isJSON ? null : tryN3(text);
    this.language =
      isJSON ? "ShExJ" :
      isDCTAP ? "DCTAP":
      graph ? "ShExR" :
      "ShExC";
    $("#results .status").text("parsing "+this.language+" schema...").show();
    const schema =
          isJSON ? ShEx.Util.ShExJtoAS(JSON.parse(text)) :
          isDCTAP ? await parseDcTap(text) :
          graph ? parseShExR() :
          parseShEx(text, ret.meta, base);
    $("#results .status").hide();
    markEditMapDirty(); // ShapeMap validity may have changed.
    return schema;

    async function parseDcTap (text) {
      const dctap = new ShEx.DcTap();
      return await new Promise((resolve, reject) => {
        $.csv.toArrays(text, {}, (err, data) => {
          if (err) reject(err)
          dctap.parseRows(data, base)
          resolve(dctap.toShEx())
        })
      })
    }

    function tryN3 (text) {
      try {
        if (text.match(/^\s*$/))
          return null;
        const db = parseTurtle (text, ret.meta, DefaultBase); // interpret empty schema as ShExC
        if (db.getQuads().length === 0)
          return null;
        return db;
      } catch (e) {
        return null;
      }
    }

    function parseShExR () {
      const graphParser = ShEx.Validator.construct(
        parseShEx(ShExRSchema, {}, base), // !! do something useful with the meta parm (prefixes and base)
        ShEx.RdfJsDb(graph),
        {}
      );
      const schemaRoot = graph.getQuads(null, ShEx.Util.RDF.type, "http://www.w3.org/ns/shex#Schema")[0].subject; // !!check
      const val = graphParser.validate(schemaRoot, ShEx.Validator.start); // start shape
      return ShEx.Util.ShExJtoAS(ShEx.Util.ShExRtoShExJ(ShEx.Util.valuesToSchema(ShEx.Util.valToValues(val))));
    }
  };
  ret.getItems = async function () {
    const obj = await this.refresh();
    const start = "start" in obj ? [START_SHAPE_LABEL] : [];
    const rest = "shapes" in obj ? obj.shapes.map(se => Caches.inputSchema.meta.termToLex(se.id)) : [];
    return start.concat(rest);
  };
  return ret;
}

function makeTurtleCache (selection) {
  const ret = _makeCache(selection);
  ret.parse = async function (text, base) {
    const res = ShEx.RdfJsDb(parseTurtle(text, ret.meta, base));
    markEditMapDirty(); // ShapeMap validity may have changed.
    return res;
  };
  ret.getItems = async function () {
    const data = await this.refresh();
    return data.getQuads().map(t => {
      return Caches.inputData.meta.termToLex(t.subject); // !!check
    });
  };
  return ret;
}

function makeManifestCache (selection) {
  const ret = _makeCache(selection);
  ret.set = async function (textOrObj, url, source) {
    $("#inputSchema .manifest li").remove();
    $("#inputData .passes li, #inputData .fails li").remove();
    if (typeof textOrObj !== "object") {
      if (url !== DefaultBase) {
        this.url = url; // @@crappyHack1 -- parms should differntiate:
      }
      try {
        // exceptions pass through to caller (asyncGet)
        textOrObj = url.endsWith(".yaml")
          ? ShExWebApp.JsYaml.load(textOrObj)
          : JSON.parse(textOrObj);
      } catch (e) {
        $("#inputSchema .manifest").append($("<li/>").text(NO_MANIFEST_LOADED));
        const throwMe = Error(e + '\n' + textOrObj);
        throwMe.action = 'load manifest'
        throw throwMe
        // @@DELME(2017-12-29)
        // transform deprecated examples.js structure
        // textOrObj = eval(textOrObj).reduce(function (acc, schema) {
        //   function x (data, status) {
        //     return {
        //       schemaLabel: schema.name,
        //       schema: schema.schema,
        //       dataLabel: data.name,
        //       data: data.data,
        //       queryMap: data.queryMap,
        //       status: status
        //     };
        //   }
        //   return acc.concat(
        //     schema.passes.map(data => x(data, "conformant")),
        //     schema.fails.map(data => x(data, "nonconformant"))
        //   );
        // }, []);
      }
    }
    if (!Array.isArray(textOrObj))
      textOrObj = [textOrObj];
    const demos = textOrObj.reduce((acc, elt) => {
      if ("action" in elt) { // TODO: move to ShExUtil
        // compatibility with test suite structure.

        const action = elt.action;
        let schemaLabel = action.schema.substr(action.schema.lastIndexOf('/')+1);
        let dataLabel = elt["@id"];
        let match = null;
        const emptyGraph = "-- empty graph --";
        if ("comment" in elt) {
          if ((match = elt.comment.match(/^(.*?) \/ { (.*?) }$/))) {
            schemaLabel = match[1]; dataLabel = match[2] || emptyGraph;
          } else if ((match = elt.comment.match(/^(.*?) on { (.*?) }$/))) {
            schemaLabel = match[1]; dataLabel = match[2] || emptyGraph;
          } else if ((match = elt.comment.match(/^(.*?) as { (.*?) }$/))) {
            schemaLabel = match[2]; dataLabel = match[1] || emptyGraph;
          }
        }
        const queryMap = "map" in action ?
            null :
            ldToTurtle(action.focus, Caches.inputData.meta.termToLex) + "@" + ("shape" in action ? ldToTurtle(action.shape, Caches.inputSchema.meta.termToLex) : START_SHAPE_LABEL);
        const queryMapURL = "map" in action ?
            action.map :
            null;
        elt = Object.assign(
          {
            '@id': new URL(elt['@id'], url).href,
            schemaLabel: schemaLabel,
            schemaURL: action.schema || url,
            // dataLabel: "comment" in elt ? elt.comment : (queryMap || dataURL),
            dataLabel: dataLabel,
            dataURL: action.data || url
          },
          (queryMap ? { queryMap: queryMap } : { queryMapURL: queryMapURL }),
          { status: elt["@type"] === "sht:ValidationFailure" ? "nonconformant" : "conformant" }
        );
        if ("termResolver" in action || "termResolverURL" in action) {
          elt.meta = action.termResolver;
          elt.metaURL = action.termResolverURL || url;
        }
      }
      ["schemaURL", "dataURL", "queryMapURL"].forEach(parm => {
        if (parm in elt) {
          elt[parm] = new URL(elt[parm], url).href;
        } else {
          delete elt[parm];
        }
      });
      return acc.concat(elt);
    }, []);
    await prepareManifest(demos, url);
    $("#manifestDrop").show(); // may have been hidden if no manifest loaded.
  };
  ret.parse = async function (text, base) {
    throw Error("should not try to parse manifest cache");
  };
  ret.getItems = async function () {
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


function makeExtensionCache (selection) {
  const ret = _makeCache(selection);
  ret.set = async function (code, url, source, mediaType) {
    this.url = url; // @@crappyHack1 -- parms should differntiate:
    try {
      // exceptions pass through to caller (asyncGet)

  // const resp = await fetch('http://localhost/checkouts/shexSpec/extensions/Eval/')
      // const text = await resp.text();
      if (mediaType.startsWith('text/html'))
        return this.grepHtmlIndexForPackage(code, url, source)

      const extension = Function(`"use strict";
const module = {exports: {}};
${code}
return module.exports;
`)()
      const name = extension.name;
      const id = "extension_" + name;

      // Delete any old li associated with this extension.
      const old = $(`.extensionControl[data-url="${extension.url}"]`)
      if (old.length) {
        results.append($("<div/>").append(
          $("<span/>").text(`removing old ${old.attr('data-name')} extension`)
        ));
        old.parent().remove();
      }

      // Create a new li.
      const elt = $("<li/>", { class: "menuItem", title: extension.description }).append(
        $("<input/>", {
          type: "checkbox",
          checked: "checked",
          class: "extensionControl",
          id: id,
          "data-name": name,
          "data-url": extension.url
        }),
        $("<label/>", { for: id }).append(
          $("<a/>", {href: extension.url, text: name})
        )
      );
      elt.insertBefore("#load-extension-button");
      $("#" + id).data("code", extension);

      Caches.extension.url = url; // @@ cheesy hack that only works to remember one extension URL
      results.append($("<div/>").append(
        $("<span/>").text(`extension ${name} loaded from <${url}>`)
      ));
    } catch (e) {
      // $("#inputSchema .extension").append($("<li/>").text(NO_EXTENSION_LOADED));
      const throwMe = Error(e + '\n' + code);
      throwMe.action = 'load extension'
      throw throwMe
    }
    // $("#extensionDrop").show(); // may have been hidden if no extension loaded.
  };

  /* Poke around in HTML for a PACKAGE link in
     <table class="implementations">
       <td property="code:softwareAgent" resource="https://github.com/shexSpec/shex.js">shexjs</td>
       <td><a property="shex:package" href="PACKAGE"/>...</td>...
     </table>
  */
  ret.grepHtmlIndexForPackage = async function (code, url, source)  {
    const jq = $(code);
    const impls = $(jq.find('table.implementations'))
    if (impls.length !== 1) {
      results.append($("<div/>").append(
        $("<span/>").text("unparsable extension index at " + url)
      ).addClass("error"));
      return;
    }
    const tr = $(impls).find(`tr td[resource="${ShExJsUrl}"]`).parent()
    if (tr.length !== 1) {
      results.append($("<div/>").append(
        $("<span/>").text("no entry for shexjs in index HTML at " + url)
      ).addClass("error"));
      return;
    }
    const href = tr.find('[property="shex:package"]').attr('href')
    if (!href) {
      results.append($("<div/>").append(
        $("<span/>").text("no package for shexjs in index HTML at " + url)
      ).addClass("error"));
      return;
    }
    const refd = await fetch(href);
    if (!refd.ok) {
      results.append($("<div/>").append(
        $("<span/>").text(`error fetching implementation: ${refd.status} (${refd.statusText}) for URL <${href}>`)
      ).addClass("error"));
    } else {
      code = await refd.text();
      await this.set(code, url, source, refd.headers.get('content-type'));
    }
  };

  ret.parse = async function (text, base) {
    throw Error("should not try to parse extension cache");
  };

  ret.getItems = async function () {
    throw Error("should not try to get extension cache items");
  };

  return ret;
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
  const ret = _makeCache(selection);
  ret.parse = async function (text) {
    removeEditMapPair(null);
    $("#textMap").val(text);
    copyTextMapToEditMap();
    await copyEditMapToFixedMap();
  };
  // ret.parse = function (text, base) {  };
  ret.getItems = async function () {
    throw Error("should not try to get manifest cache items");
  };
  return ret;
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
  await Caches.inputData.set("", DefaultBase);
  $("#inputData .status").text(" ");

  // Clear out every form of ShapeMap.
  $("#textMap").val("").removeClass("error");
  makeFreshEditMap();
  $("#fixedMap").empty();

  results.clear();
}

async function clearAll () {
  $("#results .status").hide();
  await Caches.inputSchema.set("", DefaultBase);
  $(".inputShape").val("");
  $("#inputSchema .status").text(" ");
  $("#inputSchema li.selected").removeClass("selected");
  clearData();
  $("#inputData .passes, #inputData .fails").hide();
  $("#inputData .passes p:first").text("");
  $("#inputData .fails p:first").text("");
  $("#inputData .passes ul, #inputData .fails ul").empty();
}

async function pickSchema (name, schemaTest, elt, listItems, side) {
  if ($(elt).hasClass("selected")) {
    await clearAll();
  } else {
    await Caches.inputSchema.set(schemaTest.text, new URL((schemaTest.url || ""), DefaultBase).href);
    Caches.inputSchema.url = undefined; // @@ crappyHack1
    $("#inputSchema .status").text(name);

    clearData();
    const headings = {
      "passes": "Passing:",
      "fails": "Failing:",
      "indeterminant": "Data:"
    };
    await Promise.all(Object.keys(headings).map(async function (key) {
      if (key in schemaTest) {
        $("#inputData ." + key + "").show();
        $("#inputData ." + key + " p:first").text(headings[key]);
        await paintManifest("#inputData ." + key + " ul", schemaTest[key], pickData, listItems, "inputData");
      } else {
        $("#inputData ." + key + " ul").empty();
      }
    }));

    $("#inputSchema li.selected").removeClass("selected");
    $(elt).addClass("selected");
    try {
      await Caches.inputSchema.refresh();
    } catch (e) {
      failMessage(e, "parsing schema");
    }
  }
}

async function pickData (name, dataTest, elt, listItems, side) {
  clearData();
  if ($(elt).hasClass("selected")) {
    $(elt).removeClass("selected");
  } else {
    // Update data pane.
    await Caches.inputData.set(dataTest.text, new URL((dataTest.url || ""), DefaultBase).href);
    Caches.inputData.url = undefined; // @@ crappyHack1
    $("#inputData .status").text(name);
    $("#inputData li.selected").removeClass("selected");
    $(elt).addClass("selected");
    try {
      await Caches.inputData.refresh();
    } catch (e) {
      failMessage(e, "parsing data");
    }

    // Update ShapeMap pane.
    removeEditMapPair(null);
    if (dataTest.entry.queryMap !== undefined) {
      await queryMapLoaded(dataTest.entry.queryMap);
    } else if (dataTest.entry.queryMapURL !== undefined) {
      try {
        const resp = await fetchOK(dataTest.entry.queryMapURL)
        queryMapLoaded(resp);
      } catch (e) {
        renderErrorMessage(e, "queryMap");
      }
    } else {
      results.append($("<div/>").text("No queryMap or queryMapURL supplied in manifest").addClass("warning"));
    }

    async function queryMapLoaded (text) {
      dataTest.entry.queryMap = text;
      try {
        $("#textMap").val(JSON.parse(dataTest.entry.queryMap).map(entry => `<${entry.node}>@<${entry.shape}>`).join(",\n"));
      } catch (e) {
        $("#textMap").val(dataTest.entry.queryMap);
      }
      await copyTextMapToEditMap();
      // callValidator();
    }
  }
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

async function callValidator (done) {
  $("#fixedMap .pair").removeClass("passes fails");
  $("#results .status").hide();
  let currentAction = "parsing input schema";
  try {
    await Caches.inputSchema.refresh(); // @@ throw away parser stack?
    $("#schemaDialect").text(Caches.inputSchema.language);
    if (hasFocusNode()) {
      currentAction = "parsing input data";
      $("#results .status").text("parsing data...").show();
      const inputData = await Caches.inputData.refresh(); // need prefixes for ShapeMap
      // $("#shapeMap-tabs").tabs("option", "active", 2); // select fixedMap
      currentAction = "parsing shape map";
      const fixedMap = fixedShapeMapToTerms($("#fixedMap tr").map((idx, tr) => {
        return {
          node: Caches.inputData.meta.lexToTerm($(tr).find("input.focus").val()),
          shape: Caches.inputSchema.meta.lexToTerm($(tr).find("input.inputShape").val())
        };
      }).get());

      currentAction = "creating validator";
      $("#results .status").text("creating validator...").show();
      // const dataURL = "data:text/json," +
      //     JSON.stringify(
      //       ShEx.Util.AStoShExJ(
      //         ShEx.Util.canonicalize(
      //           Caches.inputSchema.refresh())));
      const alreadLoaded = {
        schema: await Caches.inputSchema.refresh(),
        url: Caches.inputSchema.url || DefaultBase
      };
      // shex-node loads IMPORTs and tests the schema for structural faults.
      try {
        const loaded = await ShExLoader.load({shexc: [alreadLoaded]}, null);
        let time;
        const validator = ShEx.Validator.construct(
          loaded.schema,
          inputData,
          { results: "api", regexModule: ShEx[$("#regexpEngine").val()] });
        $(".extensionControl:checked").each(function () {
          $(this).data("code").register(validator, ShEx);
        })

        currentAction = "validating";
        $("#results .status").text("validating...").show();
        time = new Date();
        const ret = validator.validate(fixedMap, LOG_PROGRESS ? makeConsoleTracker() : null);
        time = new Date() - time;
        $("#shapeMap-tabs").attr("title", "last validation: " + time + " ms")
        // const dated = Object.assign({ _when: new Date().toISOString() }, ret);
        $("#results .status").text("rendering results...").show();

        await Promise.all(ret.map(renderEntry));
        // for debugging values and schema formats:
        // try {
        //   const x = ShExUtil.valToValues(ret);
        //   // const x = ShExUtil.ShExJtoAS(valuesToSchema(valToValues(ret)));
        //   res = results.replace(JSON.stringify(x, null, "  "));
        //   const y = ShExUtil.valuesToSchema(x);
        //   res = results.append(JSON.stringify(y, null, "  "));
        // } catch (e) {
        //   console.dir(e);
        // }
        finishRendering();
        return { validationResults: ret }; // for tester or whoever is awaiting this promise
      } catch (e) {
        $("#results .status").text("validation errors:").show();
        failMessage(e, currentAction);
        console.error(e); // dump details to console.
        return { validationError: e };
      }
    } else {
      const outputLanguage = Caches.inputSchema.language === "ShExJ" ? "ShExC" : "ShExJ";
      $("#results .status").
        text("parsed "+Caches.inputSchema.language+" schema, generated "+outputLanguage+" ").
        append($("<button>(copy to input)</button>").
               css("border-radius", ".5em").
               on("click", async function () {
                 await Caches.inputSchema.set($("#results div").text(), DefaultBase);
               })).
        append(":").
        show();
      let parsedSchema;
      if (Caches.inputSchema.language === "ShExJ") {
        const opts = {
          simplifyParentheses: false,
          base: Caches.inputSchema.meta.base,
          prefixes: Caches.inputSchema.meta.prefixes
        }
        new ShEx.Writer(opts).writeSchema(Caches.inputSchema.parsed, (error, text) => {
          if (error) {
            $("#results .status").text("unwritable ShExJ schema:\n" + error).show();
            // res.addClass("error");
          } else {
            results.append($("<pre/>").text(text).addClass("passes"));
          }
        });
      } else {
        const pre = $("<pre/>");
        pre.text(JSON.stringify(ShEx.Util.AStoShExJ(ShEx.Util.canonicalize(Caches.inputSchema.parsed)), null, "  ")).addClass("passes");
        results.append(pre);
      }
      results.finish();
      return { transformation: {
        from: Caches.inputSchema.language,
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
      return `${Caches.inputData.meta.termToLex(node)}@${Caches.inputSchema.meta.termToLex(shape)}`;
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
    const shapeString = entry.shape === ShEx.Validator.start ? START_SHAPE_INDEX_ENTRY : entry.shape;
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
        remainder.addQuads((await Caches.inputData.refresh()).getQuads());
        entry.graph.forEach(q => remainder.removeQuad(q));
        entry.graph = remainder.getQuads();
      }
    }

    if (entry.graph) {
      const wr = new RdfJs.Writer(Caches.inputData.meta);
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
            `${Caches.inputData.meta.termToLex(entry.node)}@${fails ? "!" : ""}${Caches.inputSchema.meta.termToLex(entry.shape)}`
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
    case "node": node = ldToTurtle(pair.node, Caches.inputData.meta.termToLex); shape = startOrLdToTurtle(pair.shape); break;
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
    addContextMenus("#editMap .pair:nth("+idx+") .focus", Caches.inputData);
    addContextMenus(".pair:nth("+idx+") .inputShape", Caches.inputSchema);
  });
  return false;

  function renderTP (tp) {
    const ret = ["subject", "predicate", "object"].map(k => {
      const ld = tp[k];
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
        const target = Getables.find(g => g.queryStringParm === $("#loadForm span.whatToLoad").text());
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
  Getables.forEach(target => {
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
  Caches.inputData.selection.on("change", dataInputHandler); // input + paste?
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
 * use {Caches.inputData,Caches.inputSchema}.meta.{prefix,base} to complete IRIs
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
      Caches.shapeMap.meta.base, Caches.inputSchema.meta, Caches.inputData.meta);
    const nodes = [];
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
      nodes = Promise.resolve([]); // skip this entry
      return acc;
    }
  }, []);

  const pairs = await Promise.all(nodeShapePromises)
  pairs.reduce((acc, pair) => {
    pair.nodes.forEach(node => {
      const nodeTerm = Caches.inputData.meta.lexToTerm(node + " "); // for langcode lookahead
      let shapeTerm = Caches.inputSchema.meta.lexToTerm(pair.shape);
      if (shapeTerm === ShEx.Validator.start)
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
    const get = s === ShEx.ShapeMap.focus ? "subject" : "object";
    return (await Caches.inputData.refresh()).getQuads(mine(s), mine(p), mine(o)).map(t => {
      return Caches.inputData.meta.termToLex(t[get]);// !!check
    });
    function mine (term) {
      return term === ShEx.ShapeMap.focus || term === ShEx.ShapeMap.wildcard
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
  return Caches.inputData.meta.termToLex(row[0]); // row[0] is the first column.
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
    await Caches.inputSchema.refresh();
    await Caches.inputData.refresh();
    const smparser = ShEx.ShapeMapParser.construct(
      Caches.shapeMap.meta.base, Caches.inputSchema.meta, Caches.inputData.meta);
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
    return {node: Caches.inputData.meta.lexToTerm(pair.node + " "),
            shape: Caches.inputSchema.meta.lexToTerm(pair.shape)};
  });*/
}

/**
 * Load URL search parameters
 */
async function loadSearchParameters () {
  // don't overwrite if we arrived here from going back and forth in history
  if (Caches.inputSchema.selection.val() !== "" || Caches.inputData.selection.val() !== "")
    return Promise.resolve();

  const iface = parseQueryString(location.search);

  toggleControlsArrow("down");
  $(".manifest li").text("no manifest schemas loaded");
  if ("examples" in iface) { // deprecated ?examples= interface
    iface.manifestURL = iface.examples;
    delete iface.examples;
  }
  if (!("manifest" in iface) && !("manifestURL" in iface)) {
    iface.manifestURL = ["../examples/manifest.json"];
  }

  // Load all known query parameters. Save load results into array like:
  /* [ [ "data", { "skipped": "skipped" } ],
       [ "manifest", { "fromUrl": { "url": "http://...", "data": "..." } } ], ] */
  const loadedAsArray = await Promise.all(QueryParams.map(async input => {
    const label = input.queryStringParm;
    const parm = label;
    if (parm + "URL" in iface) {
      const url = iface[parm + "URL"][0];
      if (url.length > 0) { // manifest= loads no manifest
        // !!! set anyways in asyncGet?
        input.cache.url = url; // all fooURL query parms are caches.
        try {
          const got = await input.cache.asyncGet(url)
          return [label, {fromUrl: got}]
        } catch(e) {
          if ("fail" in input) {
            input.fail(e);
          } else {
            input.location.val(e.message);
          }
          results.append($("<pre/>").text(e).addClass("error"));
          return [label, { loadFailure: e instanceof Error ? e : Error(e) }];
        };
      }
    } else if (parm in iface) {
      const prepend = input.location.prop("tagName") === "TEXTAREA" ?
          input.location.val() :
          "";
      const value = prepend + iface[parm].join("");
      const origValue = input.location.val();

      try {
        if ("cache" in input) {
          await input.cache.set(value, location.href);
        } else {
          input.location.val(prepend + value);
          if (input.location.val() === null)
            throw Error(`Unable to set value to ${prepend + value}`)
        }
        return [label, { literal: value }]
      } catch (e) {
        input.location.val(origValue);
        if ("fail" in input) {
          input.fail(e);
        }
        results.append($("<pre/>").text(
          "error setting " + label + ":\n" + e + "\n" + value
        ).addClass("error"));
        return [label, { failure: e }]
      }
    } else if ("deflt" in input) {
      input.location.val(input.deflt);
      return [label, { deflt: "deflt" }]; // flag that it was a default
    }
    return [label, { skipped: "skipped" }]
  }))
  // convert loaded array into Object:
  /* { "data": { "skipped": "skipped" },
       "manifest": { "fromUrl": { "url": "http://...", "data": "..." } }, } */
  const loaded = loadedAsArray.reduce((acc, fromArray) => {
    acc[fromArray[0]] = fromArray[1]
    return acc
  }, {})

  // Parse the shape-map using the prefixes and base.
  const shapeMapErrors = $("#textMap").val().trim().length > 0
        ? copyTextMapToEditMap()
        : makeFreshEditMap();

  customizeInterface();
  $("body").keydown(async function (e) { // keydown because we need to preventDefault
    const code = e.keyCode || e.charCode; // standards anyone?
    if (e.ctrlKey && (code === 10 || code === 13)) { // ctrl-enter
      // const at = $(":focus");
      const smErrors = await dataInputHandler();
      if (smErrors.length === 0)
        $("#validate")/*.focus()*/.click();
      return false;
    } else if (e.ctrlKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.code) !== -1) { // ctrl-arrow
      let newLi = null;
      if ($(':focus').length !== 1) {
        newLi = $('[data-navColumn="0"] li').first();
      } else if ($('ul[data-navColumn] button:focus').length === 1) {
        newLi = navFrom(e.code, $(':focus').parent());
      }
      if (newLi)
        $(newLi).find('button').focus();
      return false;
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
    return callValidator();
  }
  return loaded;

  function navFrom (keyCode, fromLi) {
    const fromColumn = fromLi.parent();
    const fromLiNo = fromLi.index();
    const lis = fromColumn.children();
    const columns = $('ul[data-navColumn]:visible').get().sort(
      (l, r) =>
        parseInt($(l).attr('data-navColumn')) - parseInt($(r).attr('data-navColumn'))
    );
    const fromColumnNo = columns.indexOf(fromColumn.get(0)); // index in visible columns

    switch (keyCode) {
    case 'ArrowLeft':
      if (fromColumnNo > 0) {
        const newColumn = $(columns[fromColumnNo - 1]);
        return firstOf(newColumn, '.selected', 'li:first-child');
      }
      break;
    case 'ArrowRight':
      if (fromColumnNo < columns.length - 1) {
        const newColumn = $(columns[fromColumnNo + 1]);
        return firstOf(newColumn, '.selected', 'li:first-child');
      }
      break;
    case 'ArrowUp':
      if (fromLiNo > 0) {
        return lis[fromLiNo - 1];
      }
      break;
    case 'ArrowDown':
      if (fromLiNo < lis.length - 1) {
        return lis[fromLiNo + 1];
      }
      break;
    default: throw Error(e.code);
    }
  }

  function firstOf (node, ...selectors) { // return first successful selector. gotta be an idiom for this in jquery
    for (let i = 0; i < selectors.length; ++i) {
      const ret = node.find(selectors[i]);
      if (ret.length > 0) {
        return ret.get(0);
      }
    }
  }
}

function setTextAreaHandlers (listItems) {
  const timeouts = Object.keys(Caches).reduce((acc, k) => {
    acc[k] = undefined;
    return acc;
  }, {});

  Object.keys(Caches).forEach(function (cache) {
    Caches[cache].selection.keyup(function (e) { // keyup to capture backspace
      const code = e.keyCode || e.charCode;
      // if (!(e.ctrlKey)) {
      //   results.clear();
      // }
      if (!(e.ctrlKey && (code === 10 || code === 13))) {
        later(e.target, cache, Caches[cache]);
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
    parms = parms.concat(QueryParams.reduce((acc, input) => {
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
      {ext: ".ttl", media: "text/turtle", target: Caches.inputData},
      {ext: ".json", media: "application/json", target: Caches.manifest},
      {ext: ".smap", media: "text/plain", target: Caches.shapeMap}]}
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
                    promises.push(Caches.manifest.set(parsed, DefaultBase, "drag and drop"));
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

async function prepareManifest (demoList, base) {
  const listItems = Object.keys(Caches).reduce((acc, k) => {
    acc[k] = {};
    return acc;
  }, {});
  const nesting = demoList.reduce(function (acc, elt, idx) {
    const defaultLabel = "title" in elt
          ? elt.title
          : `manifest[${idx}]`;
    const schemaLabel = elt.schemaLabel || defaultLabel;
    const key = schemaLabel + "|" + elt.schema;
    if (!(key in acc)) {
      // first entry with this schema
      acc[key] = {
        label: schemaLabel,
        text: elt.schema,
        url: elt.schemaURL || (elt.schema ? base : undefined)
      };
    } else {
      // nth entry with this schema
    }

    if ("dataLabel" in elt || "data" in elt || "dataURL" in elt) {
      const dataLabel = elt.dataLabel || defaultLabel;
      const dataEntry = {
        label: dataLabel || idx.toString(),
        text: elt.data,
        url: elt.dataURL || (elt.data ? base : undefined),
        entry: elt
      };
      const target = elt.status === "nonconformant"
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
  const nestingAsList = Object.keys(nesting).map(e => nesting[e]);
  await paintManifest("#inputSchema .manifest ul", nestingAsList, pickSchema, listItems, "inputSchema");
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
              : Caches.inputData.meta.termToLex(t); // !!check
          });
        }
        const queryMapKeywords = ["FOCUS", "_"];
        const getTermsFunctions = [
          () => { return queryMapKeywords.concat(norm(store.getSubjects())); },
          () => { return norm(store.getPredicates()); },
          () => { return queryMapKeywords.concat(norm(store.getObjects())); },
        ];
        const store = await Caches.inputData.refresh();
        if (terms.match === null)
          return false; // prevent contextMenu from whining about an empty list
        return listToCTHash(getTermsFunctions[terms.match]())
      }
    }
    terms = nodeLex = null;
    try {
      return listToCTHash(await cache.getItems())
    } catch (e) {
      failMessage(e, cache === Caches.inputSchema ? "parsing schema" : "parsing data");
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
          return node === ShEx.ShapeMap.focus
            ? "FOCUS"
            : node === null
            ? "_"
            : Caches.inputData.meta.termToLex(node);
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
const loads = loadSearchParameters();
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

