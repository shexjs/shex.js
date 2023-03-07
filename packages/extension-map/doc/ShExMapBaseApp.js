/**
 * supplement ShExSimpleApp with:
 * - bindings (JSONCache)
 * - statics (JSONCache)
 * - ouputSchema (SchemaCache)
 */

class JSONCache extends InterfaceCache {
  constructor (selection) {
    super(selection);
  }

  async parse (text) {
    return Promise.resolve(JSON.parse(text));
  }
}

class ShExMapManifestCache extends ManifestCache {
  makeDataEntry (dataLabel, idx, elt, base) {
    const ret = super.makeDataEntry(dataLabel, idx, elt, base);
    ret.outputSchemaUrl = elt.outputSchemaURL || (elt.outputSchema ? base : undefined)
    return ret;
  }

  async queryMapLoaded (dataTest, text) {
    await super.queryMapLoaded(dataTest, text);
    /* This is kind of a wart 'cause I haven't made a 3rd level of manifest entry for materialization */
    if (dataTest.entry.outputSchema === undefined && dataTest.entry.outputSchemaURL) {
      dataTest.entry.outputSchemaURL = new URL(dataTest.entry.outputSchemaURL, dataTest.url).href; // absolutize
      const resp = await fetch(dataTest.entry.outputSchemaURL);
      if (!resp.ok)
        throw Error("fetch <" + dataTest.entry.outputSchemaURL + "> got error response " + resp.status + ": " + resp.statusText);
      dataTest.entry.outputSchema = await resp.text();
    }
    this.caches.outputSchema.set(dataTest.entry.outputSchema, dataTest.entry.outputSchemaURL);
    $("#outputSchema .status").text(name);
    this.caches.statics.set(JSON.stringify(dataTest.entry.staticVars, null, "  "));
    $("#staticVars .status").text(name);

    $("#outputShape").val(dataTest.entry.outputShape); // targetSchema.start in Map-test
    $("#createRoot").val(dataTest.entry.createRoot); // createRoot in Map-test
  }
}

class ShExMapResultsRenderer extends ShExResultsRenderer {
  constructor (resultsWidget, caches, mapUrl) {
    super(resultsWidget, caches);
    this.mapUrl = mapUrl;
  }
  async entry (entry) {
    await super.entry(entry);
    if (entry.status === "conformant") {
      const resultBindings = ShExWebApp.Util.valToExtension(entry.appinfo, this.mapUrl);
      await this.caches.bindings.set(JSON.stringify(resultBindings, null, "  "));
    } else {
      await this.caches.bindings.set("{}");
    }
  }
}

class ShExMapBaseApp extends ShExBaseApp {
  constructor (base, validatorClass) {
    super(base, validatorClass);
    this.currentRenderer = null;
    this.MapModule = ShExWebApp.Map({rdfjs: RdfJs, Validator: ShExWebApp.Validator});
    const manifest = new ShExMapManifestCache($("#manifestDrop"), this.Caches, this.resultsWidget);
    const bindings = new JSONCache($("#bindings1 textarea"));
    const statics = new JSONCache($("#staticVars textarea"));
    const outputSchema = new SchemaCache($("#outputSchema textarea"), this.shexcParser, this.turtleParser);
    Object.assign(this.Caches, { manifest, bindings, statics, outputSchema, });
    const parameters = [
      {queryStringParm: "manifest",  location: manifest.selection,    cache: manifest, fail: e => $("#manifestDrop li").text(NO_MANIFEST_LOADED)},
      {queryStringParm: "bindings",  location: bindings.selection,    cache: bindings    },
      {queryStringParm: "statics",   location: statics.selection,     cache: statics     },
      {queryStringParm: "outSchema", location: outputSchema.selection,cache: outputSchema},
    ];
    Array.prototype.push.apply(this.Getables, parameters);
    Array.prototype.push.apply(this.QueryParams, parameters);
    Array.prototype.push.apply(this.keyDownHandlers, [
      (e, code) => {
        if (!e.ctrlKey || e.key !== "\\") return false;
        $("#materialize").click();
        return true;
      },
      (e, code) => {
        if (!e.ctrlKey || e.key !== "[") return false;
        this.bindingsToTable()
        return true;
      },
      (e, code) => {
        if (!e.ctrlKey || e.key !== "]") return false;
        this.tableToBindings()
        return true;
      },
    ]);
  }

  prepareControls () {
    super.prepareControls();
    $("#materialize").on("click", evt => this.materialize(evt));
  }

  makeRenderer () {
    return this.currentRenderer = new ShExMapResultsRenderer(this.resultsWidget, this.Caches, this.MapModule.url)
  }

  reportMaterializationError (materializationError, currentAction) {
    $("#results .status").text("materialization errors:").show();
    this.resultsWidget.failMessage(materializationError, currentAction);
    console.error(materializationError); // dump details to console.
    return { materializationError };
  }

  async materialize () {
    this.resultsWidget.clear();
    this.resultsWidget.start();
    SharedForTests.promise = this.materializeAsync();
  }

  addResult (error, result) {
    this.resultsWidget.append(
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
    // this.resultsWidget.append($("<pre/>").text(result));
  }

  bindingsToTable () {
    let d = JSON.parse($("#bindings1 textarea").val())
    let div = $("<div/>").css("overflow", "auto").css("border", "thin solid red")
    div.css("width", $("#bindings1 textarea").width()+10)
    div.css("height", $("#bindings1 textarea").height()+12)
    $("#bindings1 textarea").hide()
    let thead = $("<thead/>")
    let tbody = $("<tbody/>")
    let table = $("<table>").append(thead, tbody)
    $("#bindings1").append(div.append(table))

    let vars = [];
    function varsIn (a) {
      return a.forEach(elt => {
        if (Array.isArray(elt)) {
          varsIn(elt)
        } else {
          let tr = $("<tr/>")
          let cols = []
          Object.keys(elt).forEach(k => {
            if (vars.indexOf(k) === -1)
              vars.push(k)
            let i = vars.indexOf(k)
            cols[i] = elt[k]
          })
          // tr.append(cols.map(c => $("<td/>").text(c)))
          for (let colI = 0; colI < cols.length; ++colI)
            tr.append($("<td/>").text(cols[colI] ? this.Caches.inputData.meta.termToLex(n3ify(cols[colI])) : "").css("background-color", "#f7f7f7"))
          tbody.append(tr)
        }
      })
    }
    varsIn(Array.isArray(d) ? d : [d])

    vars.forEach(v => {
      thead.append($("<th/>").css("font-size", "small").text(v.substr(v.lastIndexOf("#")+1, 999)))
    })

    function n3ify (ldterm) {
      if (typeof ldterm !== "object")
        return ldterm;
      const ret = "\"" + ldterm.value + "\"";
      if ("language" in ldterm)
        return ret + "@" + ldterm.language;
      if ("type" in ldterm)
        return ret + "^^" + ldterm.type;
      return ret;
    }
  }

  tableToBindings () {
    $("#bindings1 div").remove()
    $("#bindings1 textarea").show()
  }
}

