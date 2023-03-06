class InterfaceCache {
  // caches for textarea parsers
  constructor (selection) {
    this._dirty = true;
    this.selection = selection;
    this.parsed = null; // a Promise
    this.url = undefined; // only set if inputarea caches some web resource.
    this.meta = { prefixes: {}, base: this.base };
  }

  dirty (newVal) {
    const ret = this._dirty;
    this._dirty = newVal;
    return ret;
  }

  get () {
    return this.selection.val();
  }

  async set (text, base) {
    this._dirty = true;
    this.selection.val(text);
    this.meta.base = base;
    if (base !== this.base) {
      this.url = base; // @@crappyHack1 -- parms should differntiate:
      // working base: base for URL resolution.
      // loaded base: place where you can GET current doc.
      // Note that this.Caches.manifest.set takes a 3rd parm.
    }
  }

  async refresh () {
    if (!this._dirty)
      return this.parsed;
    this.parsed = await this.parse(this.selection.val(), this.meta.base);
    await this.parsed;
    this._dirty = false;
    return this.parsed;
  }

  async asyncGet (url) {
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
  }
}

class SchemaCache extends InterfaceCache {
  constructor (selection, shexcParser, turtleParser) {
    super(selection);
    this.shexcParser = shexcParser;
    this.turtleParser = turtleParser;
    this.meta.termToLex = function (trm, aForTypes = true) {
      return trm === ShExWebApp.Validator.Start
        ? START_SHAPE_LABEL
        : ShExWebApp.ShExTerm.shExJsTerm2Turtle(trm, this, true);
    };
    this.meta.lexToTerm = function (lex) {
      return lex === START_SHAPE_LABEL
        ? ShExWebApp.Validator.Start
        : turtleParser.termToLd(lex, new IRIResolver(this));
    };
    this.graph = null;
    this.language = null;
  }

  async parse (text, base) {
    const isJSON = text.match(/^\s*\{/);
    const isDCTAP = text.match(/\s*shapeID/)
    this.graph = isJSON ? null : this.tryN3(text);
    this.language =
      isJSON ? "ShExJ" :
      isDCTAP ? "DCTAP":
      this.graph ? "ShExR" :
      "ShExC";
    $("#results .status").text("parsing "+this.language+" schema...").show();
    const schema =
          isJSON ? ShExWebApp.Util.ShExJtoAS(JSON.parse(text)) :
          isDCTAP ? await parseDcTap(text) :
          this.graph ? parseShExR() :
          this.shexcParser.parseString(text, this.meta, base);
    $("#results .status").hide();
    markEditMapDirty(); // ShapeMap validity may have changed.
    return schema;

    async function parseDcTap (text) {
      const dctap = new ShExWebApp.DcTap();
      return await new Promise((resolve, reject) => {
        $.csv.toArrays(text, {}, (err, data) => {
          if (err) reject(err)
          dctap.parseRows(data, base)
          resolve(dctap.toShEx())
        })
      })
    }

    function parseShExR () {
      const graphParser = new ShExWebApp.Validator(
        this.shexcParser.parseString(ShExRSchema, {}, base), // !! do something useful with the meta parm (prefixes and base)
        ShExWebApp.RdfJsDb(this.graph),
        {}
      );
      const schemaRoot = this.graph.getQuads(null, ShExWebApp.Util.RDF.type, "http://www.w3.org/ns/shex#Schema")[0].subject; // !!check
      const val = graphParser.validateNodeShapePair(schemaRoot, ShExWebApp.Validator.Start); // start shape
      return ShExWebApp.Util.ShExJtoAS(ShExWebApp.Util.ShExRtoShExJ(ShExWebApp.Util.valuesToSchema(ShExWebApp.Util.valToValues(val))));
    }
  }

  async getItems () {
    const obj = await this.refresh();
    const start = "start" in obj ? [START_SHAPE_LABEL] : [];
    const rest = "shapes" in obj ? obj.shapes.map(se => this.Caches.inputSchema.meta.termToLex(se.id)) : [];
    return start.concat(rest);
  }

  tryN3 (text) {
    try {
      if (text.match(/^\s*$/))
        return null;
      const db = this.turtleParser.parseString (text, this.meta, this.base); // interpret empty schema as ShExC
      if (db.getQuads().length === 0)
        return null;
      return db;
    } catch (e) {
      return null;
    }
  }
}

class TurtleCache extends InterfaceCache {
  constructor (selection, turtleParser) {
    super(selection);
    this.turtleParser = turtleParser;
    this.meta.termToLex = function (trm) { return  ShExWebApp.ShExTerm.rdfJsTerm2Turtle(trm, this); };
    this.meta.lexToTerm = function (lex) { return  turtleParser.termToLd(lex, new IRIResolver(this)); };
  }

  async parse (text, base) {
    const res = ShExWebApp.RdfJsDb(this.turtleParser.parseString(text, this.meta, base));
    markEditMapDirty(); // ShapeMap validity may have changed.
    return res;
  }

  async getItems () {
    const data = await this.refresh();
    return data.getQuads().map(t => {
      return this.Caches.inputData.meta.termToLex(t.subject); // !!check
    });
  }
}

class ManifestCache extends InterfaceCache {
  constructor (selection) {
    super(selection);
  }

  async set (textOrObj, url, source) {
    $("#inputSchema .manifest li").remove();
    $("#inputData .passes li, #inputData .fails li").remove();
    if (typeof textOrObj !== "object") {
      if (url !== this.base) {
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
              ldToTurtle(action.focus, this.Caches.inputData.meta.termToLex)
              + "@"
              + ("shape" in action ? this.Caches.inputSchema.meta.termToLex(action.shape, false) : START_SHAPE_LABEL);
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
    await this.prepareManifest(demos, url);
    $("#manifestDrop").show(); // may have been hidden if no manifest loaded.
  }

  async parse (text, base) {
    throw Error("should not try to parse manifest cache");
  }

  async getItems () {
    throw Error("should not try to get manifest cache items");
  }

  maybeGET (obj, base, key, accept) { // !!not used
    if (obj[key] != null) {
      // Take the passed data, guess base if not provided.
      if (!(key + "URL" in obj))
        obj[key + "URL"] = base;
      obj[key] = Promise.resolve(obj[key]);
    } else if (key + "URL" in obj) {
      // absolutize the URL
      obj[key + "URL"] = this.meta.lexToTerm("<"+obj[key + "URL"]+">");
      // Load the remote resource.
      obj[key] = new Promise((resolve, reject) => {
        $.ajax({
          accepts: {
            mycustomtype: accept
          },
          url: this.meta.lexToTerm("<"+obj[key + "URL"]+">"),
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

  async prepareManifest (demoList, base) {
    const listItems = Object.keys(App.Caches).reduce((acc, k) => {
      acc[k] = {};
      return acc;
    }, {});
    const nesting = demoList.reduce((acc, elt, idx) => {
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
        const dataEntry = this.makeDataEntry(dataLabel, idx, elt, base);
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
    await this.paintManifest("#inputSchema .manifest ul", nestingAsList, this.pickSchema.bind(this), listItems, "inputSchema");
  }


  // controls for manifest buttons
  async paintManifest (selector, list, func, listItems, side) {
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

  makeDataEntry (dataLabel, idx, elt, base) {
    return {
      label: dataLabel || idx.toString(),
      text: elt.data,
      url: elt.dataURL || (elt.data ? base : undefined),
      entry: elt
    };
  }

  async pickSchema (name, schemaTest, elt, listItems, side) {
    if ($(elt).hasClass("selected")) {
      await clearAll();
    } else {
      await App.Caches.inputSchema.set(schemaTest.text, new URL((schemaTest.url || ""), DefaultBase).href);
      App.Caches.inputSchema.url = undefined; // @@ crappyHack1
      $("#inputSchema .status").text(name);

      clearData();
      const headings = {
        "passes": "Passing:",
        "fails": "Failing:",
        "indeterminant": "Data:"
      };
      await Promise.all(Object.keys(headings).map(async key => {
        if (key in schemaTest) {
          $("#inputData ." + key + "").show();
          $("#inputData ." + key + " p:first").text(headings[key]);
          await this.paintManifest("#inputData ." + key + " ul", schemaTest[key], this.pickData.bind(this), listItems, "inputData");
        } else {
          $("#inputData ." + key + " ul").empty();
        }
      }));

      $("#inputSchema li.selected").removeClass("selected");
      $(elt).addClass("selected");
      try {
        await App.Caches.inputSchema.refresh();
      } catch (e) {
        failMessage(e, "parsing schema");
      }
    }
  }

  async pickData (name, dataTest, elt, listItems, side) {
    clearData();
    if ($(elt).hasClass("selected")) {
      $(elt).removeClass("selected");
    } else {
      // Update data pane.
      await App.Caches.inputData.set(dataTest.text, new URL((dataTest.url || ""), DefaultBase).href);
      App.Caches.inputData.url = undefined; // @@ crappyHack1
      $("#inputData .status").text(name);
      $("#inputData li.selected").removeClass("selected");
      $(elt).addClass("selected");
      try {
        await App.Caches.inputData.refresh();
      } catch (e) {
        failMessage(e, "parsing data");
      }

      // Update ShapeMap pane.
      removeEditMapPair(null);
      if (dataTest.entry.queryMap !== undefined) {
        await this.queryMapLoaded(dataTest, dataTest.entry.queryMap);
      } else if (dataTest.entry.queryMapURL !== undefined) {
        try {
          const resp = await fetchOK(dataTest.entry.queryMapURL)
          ManifestCache.queryMapLoaded(dataTest, resp);
        } catch (e) {
          renderErrorMessage(e, "queryMap");
        }
      } else {
        results.append($("<div/>").text("No queryMap or queryMapURL supplied in manifest").addClass("warning"));
      }
    }
  }

  async queryMapLoaded (dataTest, text) {
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

const ShExJsUrl = 'https://github.com/shexSpec/shex.js'
class ExtensionCache extends InterfaceCache {
  constructor (selection) {
    super(selection);
  }

  async set (code, url, source, mediaType) {
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

      this.Caches.extension.url = url; // @@ cheesy hack that only works to remember one extension URL
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
  }

  /* Poke around in HTML for a PACKAGE link in
     <table class="implementations">
     <td property="code:softwareAgent" resource="https://github.com/shexSpec/shex.js">shexjs</td>
     <td><a property="shex:package" href="PACKAGE"/>...</td>...
     </table>
  */
  async grepHtmlIndexForPackage (code, url, source)  {
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
  }

  async parse (text, base) {
    throw Error("should not try to parse extension cache");
  }

  async getItems () {
    throw Error("should not try to get extension cache items");
  }
}

class ShapeMapCache extends InterfaceCache {
  constructor (selection, turtleParser) {
    super(selection);
    this.meta.termToLex = function (trm) { return  ShExWebApp.ShExTerm.rdfJsTerm2Turtle(trm, this); };
    this.meta.lexToTerm = function (lex) { return  turtleParser.termToLd(lex, new IRIResolver(this)); };
  }

  async parse (text) {
    removeEditMapPair(null);
    $("#textMap").val(text);
    copyTextMapToEditMap();
    await copyEditMapToFixedMap();
  };

  async getItems () {
    throw Error("should not try to get manifest cache items");
  }
}

class ShExCParser {
  constructor () {
    this.shexParserOptions = {index: true, duplicateShape: "abort"};
    this.shexParser = ShExWebApp.Parser.construct(DefaultBase, null, this.shexParserOptions);
  }
  parseString (text, meta, base) {
    this.shexParserOptions.duplicateShape = $("#duplicateShape").val();
    this.shexParser._setBase(base);
    const ret = this.shexParser.parse(text);
    // ret = ShExWebApp.Util.canonicalize(ret, DefaultBase);
    meta.base = ret._base; // base set above.
    meta.prefixes = ret._prefixes || {}; // @@ revisit after separating shexj from meta and indexes
    return ret;
  }
}

class TurtleParser {
  constructor () {
    this.blankNodeId;
    // Re-use BNode IDs for good(-enough) user experience. Recipe from:
    // https://github.com/rdfjs/N3.js/blob/520054a9fb45ef48b5b58851449942493c57dace/test/N3Parser-test.js#L6-L11
    RdfJs.Parser.prototype._blankNode = name => RdfJs.DataFactory.blankNode(name || `b${this.blankNodeId++}`);
  }
  parseString (text, meta, base) {
    const ret = new RdfJs.Store();
    this.blankNodeId = 0;
    RdfJs.Parser._resetBlankNodePrefix();
    const parser = new RdfJs.Parser({
      baseIRI: base,
      format: "text/turtle",
      blankNodePrefix: ""
    });
    const quads = parser.parse(text);
    if (quads !== undefined)
      ret.addQuads(quads);
    meta.base = parser._base;
    meta.prefixes = parser._prefixes;
    return ret;
  }
  termToLd (lex, resolver) { // returns ShExJ objectValue
    const nz = new RdfJs.Lexer().tokenize(lex + " ");
    switch (nz[0].type) {
    case "IRI": return resolver._resolveAbsoluteIRI(nz[0]);
    case "prefixed": return expand(nz[0]);
    case "blank": return "_:" + nz[0].value;
    case "literal": {
      const ret = { value: nz[0].value };
      switch (nz[1].type) {
      case "typeIRI":  ret.type = resolver._resolveAbsoluteIRI(nz[1]); break;
      case "type":     ret.type = expand(nz[1]); break;
      case "langcode": ret.language = nz[1].value; break;
      default: throw Error(`unknow N3Lexer literal term type ${nz[1].type}`);
      }
      return ret;
    }
    default: throw Error(`unknow N3Lexer term type ${nz[0].type}`);
    }

    function expand (token) {
      if (!(token.prefix in resolver.meta.prefixes))
        throw Error(`unknown prefix ${token.prefix} in ${lex}`);
      return resolver.meta.prefixes[token.prefix] + token.value;
    }
  }
}

class DirectShExValidator {
  constructor (loaded, _schemaURL, inputData, renderEntry) {
    this.validator = new ShExWebApp.Validator(
      loaded.schema,
      inputData,
      {results: "api", regexModule: ShExWebApp[$("#regexpEngine").val()]});
    $(".extensionControl:checked").each(function () {
      $(this).data("code").register(validator, ShExWebApp);
    });
    this.renderEntry = renderEntry;
  }
  static factory (loaded, schemaURL, inputData, renderEntry) {
    return new DirectShExValidator(loaded, schemaURL, inputData, renderEntry);
  }
  async invoke (fixedMap, validationTracker, time, _done, _currentAction) {
    const ret = this.validator.validateShapeMap(fixedMap, validationTracker);
    time = new Date() - time;
    $("#shapeMap-tabs").attr("title", "last validation: " + time + " ms");
    $("#results .status").text("rendering results...").show();

    await Promise.all(ret.map(this.renderEntry));
    finishRendering();
    return {validationResults: ret}; // for tester or whoever is awaiting this promise
  }
}

const ShExLoader = ShExWebApp.Loader({
  fetch: window.fetch.bind(window), rdfjs: RdfJs, jsonld: null
})
class ShExBaseApp {
  constructor (base, validatorClass) {
    this.base = base;
    this.validatorClass = validatorClass;
    // make parser/serializers available to extending classes
    this.shexcParser = new ShExCParser();
    this.turtleParser = new TurtleParser();
    this.Caches = {
      inputSchema: new SchemaCache($("#inputSchema textarea.schema"), this.shexcParser, this.turtleParser),
      inputData:   new TurtleCache($("#inputData textarea"), this.turtleParser),
      extension:   new ExtensionCache($("#extensionDrop")),
      shapeMap:    new ShapeMapCache($("#textMap"), this.turtleParser), // @@ rename to #shapeMap
    }
    this.Getables = [
      {queryStringParm: "schema",       location: this.Caches.inputSchema.selection, cache: this.Caches.inputSchema},
      {queryStringParm: "data",         location: this.Caches.inputData.selection,   cache: this.Caches.inputData  },
      {queryStringParm: "extension",    location: this.Caches.extension.selection,   cache: this.Caches.extension  },
      {queryStringParm: "shape-map",    location: $("#textMap"),                     cache: this.Caches.shapeMap   },
    ];
    this.QueryParams = this.Getables.concat([
      {queryStringParm: "interface",    location: $("#interface"),       deflt: "human"     },
      {queryStringParm: "success",      location: $("#success"),         deflt: "proof"     },
      {queryStringParm: "regexpEngine", location: $("#regexpEngine"),    deflt: "eval-threaded-nerr" },
    ]);
    this.keyDownHandlers = [
      ShExBaseApp.validateKeyDown,
      ShExBaseApp.navigateManifestKeyDown,
    ];
  }

  // abstract usingValidator (_validator) { } // overriden for ShExMap

  /* UI setup */
  /**
   * set up UI buttons handlers
   */
  prepareControls () {
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
  }

  /**
   * Load URL search parameters
   */
  async loadSearchParameters () {
    // don't overwrite if we arrived here from going back and forth in history
    if (App.Caches.inputSchema.selection.val() !== "" || App.Caches.inputData.selection.val() !== "")
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
    const loadedAsArray = await Promise.all(App.QueryParams.map(async input => {
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
    $("body").keydown(e => { // keydown because we need to preventDefault
      const code = e.keyCode || e.charCode; // standards anyone?
      return !this.keyDownHandlers.find(h => h(e, code)); // if we find a handler, stop propagation
    });
    addContextMenus("#focus0", App.Caches.inputData);
    addContextMenus("#inputShape0", App.Caches.inputSchema);
    if ("schemaURL" in iface ||
        // some schema is non-empty
        ("schema" in iface &&
         iface.schema.reduce((r, elt) => { return r+elt.length; }, 0))
        && shapeMapErrors.length === 0) {
      return callValidator();
    }

    if ("output-map" in iface)
      parseShapeMap("output-map", function (node, shape) {
        // only works for one n/s pair
        $("#createNode").val(node);
        $("#outputShape").val(shape);
      });
    addContextMenus("#outputShape", App.Caches.outputSchema);
    return loaded;
  }

  /* Exectuions */

  async callValidator (done) {
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
          const validator = this.validatorClass.factory(loaded, alreadLoaded.url, inputData, this.renderEntry.bind(this));
          App.usingValidator(validator);

          currentAction = "validating";
          $("#results .status").text("validating...").show();
          time = new Date();
          const validationTracker = LOG_PROGRESS ? this.makeConsoleTracker() : undefined; // undefined to trigger default parameter assignment

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
          new ShExWebApp.Writer(opts).writeSchema(App.Caches.inputSchema.parsed, (error, text) => {
            if (error) {
              $("#results .status").text("unwritable ShExJ schema:\n" + error).show();
              // res.addClass("error");
            } else {
              results.append($("<pre/>").text(text).addClass("passes"));
            }
          });
        } else {
          const pre = $("<pre/>");
          pre.text(JSON.stringify(ShExWebApp.Util.AStoShExJ(ShExWebApp.Util.canonicalize(App.Caches.inputSchema.parsed)), null, "  ")).addClass("passes");
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
  }

  makeConsoleTracker () {
    function padding (depth) { return (new Array(depth + 1)).join("  "); } // AKA "  ".repeat(depth)
    function sm (node, shape) {
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

  async renderEntry (entry) {
    const fails = entry.status === "nonconformant";

    // locate FixedMap entry
    const shapeString = entry.shape === ShExWebApp.Validator.Start ? START_SHAPE_INDEX_ENTRY : entry.shape;
    const fixedMapEntry = $("#fixedMap .pair"+
                          "[data-node='"+entry.node+"']"+
                          "[data-shape='"+shapeString+"']");

    const klass = (fails ^ fixedMapEntry.find(".shapeMap-joiner").hasClass("nonconformant")) ? "fails" : "passes";
    const resultStr = fails ? "✗" : "✓";
    let elt = null;

    if (!fails) {
      if ($("#success").val() === "query" || $("#success").val() === "remainder") {
        const proofStore = new RdfJs.Store();
        ShExWebApp.Util.getProofGraph(entry.appinfo, proofStore, RdfJs.DataFactory);
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
          elt.append($("<pre>").text(ShExWebApp.Util.errsToSimple(entry.appinfo).join("\n")));
        break;

      case "minimal":
        if (fails)
          entry.reason = ShExWebApp.Util.errsToSimple(entry.appinfo).join("\n");
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


  /* Keyboard events */
  static validateKeyDown (e, code) {
    if (!e.ctrlKey || (code !== 10 && code !== 13)) // ctrl-enter
      return false;
    // const at = $(":focus");
    dataInputHandler().then(smErrors => {
      if (smErrors.length === 0)
        $("#validate")/*.focus()*/.click();
    })
    return true;
  }

  static navigateManifestKeyDown (e, code) {
    if (!e.ctrlKey || ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.code) === -1) // ctrl-arrow
      return false;
    let newLi = null;
    if ($(':focus').length !== 1) {
      newLi = $('[data-navColumn="0"] li').first();
    } else if ($('ul[data-navColumn] button:focus').length === 1) {
      newLi = navFrom(e.code, $(':focus').parent());
    }
    if (newLi)
      $(newLi).find('button').focus();
    return true;

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
}
 
