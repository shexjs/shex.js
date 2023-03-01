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
  constructor (selection) {
    super(selection);
    this.meta.termToLex = function (trm, aForTypes = true) {
      return trm === ShEx.Validator.Start
        ? START_SHAPE_LABEL
        : ShEx.ShExTerm.shExJsTerm2Turtle(trm, this, true);
    };
    this.meta.lexToTerm = function (lex) {
      return lex === START_SHAPE_LABEL
        ? ShEx.Validator.Start
        : turtleTermToLd(lex, new IRIResolver(this));
    };
    this.graph = null;
    this.language = null;
  }

  async parse (text, base) {
    const isJSON = text.match(/^\s*\{/);
    const isDCTAP = text.match(/\s*shapeID/)
    this.graph = isJSON ? null : tryN3(text);
    this.language =
      isJSON ? "ShExJ" :
      isDCTAP ? "DCTAP":
      this.graph ? "ShExR" :
      "ShExC";
    $("#results .status").text("parsing "+this.language+" schema...").show();
    const schema =
          isJSON ? ShEx.Util.ShExJtoAS(JSON.parse(text)) :
          isDCTAP ? await parseDcTap(text) :
          this.graph ? parseShExR() :
          parseShEx(text, this.meta, base);
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
        const db = parseTurtle (text, this.meta, this.base); // interpret empty schema as ShExC
        if (db.getQuads().length === 0)
          return null;
        return db;
      } catch (e) {
        return null;
      }
    }

    function parseShExR () {
      const graphParser = new ShEx.Validator(
        parseShEx(ShExRSchema, {}, base), // !! do something useful with the meta parm (prefixes and base)
        ShEx.RdfJsDb(this.graph),
        {}
      );
      const schemaRoot = this.graph.getQuads(null, ShEx.Util.RDF.type, "http://www.w3.org/ns/shex#Schema")[0].subject; // !!check
      const val = graphParser.validateNodeShapePair(schemaRoot, ShEx.Validator.Start); // start shape
      return ShEx.Util.ShExJtoAS(ShEx.Util.ShExRtoShExJ(ShEx.Util.valuesToSchema(ShEx.Util.valToValues(val))));
    }
  }

  async getItems () {
    const obj = await this.refresh();
    const start = "start" in obj ? [START_SHAPE_LABEL] : [];
    const rest = "shapes" in obj ? obj.shapes.map(se => this.Caches.inputSchema.meta.termToLex(se.id)) : [];
    return start.concat(rest);
  }
}

class TurtleCache extends InterfaceCache {
  constructor (selection) {
    super(selection);
    this.meta.termToLex = function (trm) { return  ShEx.ShExTerm.rdfJsTerm2Turtle(trm, this); };
    this.meta.lexToTerm = function (lex) { return  turtleTermToLd(lex, new IRIResolver(this)); };
  }

  async parse (text, base) {
    const res = ShEx.RdfJsDb(parseTurtle(text, this.meta, base));
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
    await prepareManifest(demos, url);
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
}

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
  constructor (selection) {
    super(selection);
    this.meta.termToLex = function (trm) { return  ShEx.ShExTerm.rdfJsTerm2Turtle(trm, this); };
    this.meta.lexToTerm = function (lex) { return  turtleTermToLd(lex, new IRIResolver(this)); };
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

class ShExSimpleCaches {
  constructor (base) {
    this.base = base;
    this.Caches = {
      inputSchema: new SchemaCache($("#inputSchema textarea.schema")),
      inputData:   new TurtleCache($("#inputData textarea")),
      manifest:    new ManifestCache($("#manifestDrop")),
      extension:   new ExtensionCache($("#extensionDrop")),
      shapeMap:    new ShapeMapCache($("#textMap")), // @@ rename to #shapeMap
    }
  }
}
 
