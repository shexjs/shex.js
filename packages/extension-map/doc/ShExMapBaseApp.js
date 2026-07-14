/**
 * Supplement ShExBaseApp with:
 * - bindings (JSONCache)
 * - statics (JSONCache)
 * - ouputSchema (SchemaCache)
 */

class JSONCache extends InterfaceCache {
  constructor (selection) {
    super(selection, null);
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
    const outputSchema = new SchemaCache($("#outputSchema textarea"), null, this.shexcParser, this.turtleParser);
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

  addEditorPanes () {
    super.addEditorPanes();
    this.editorSupport.addPane("bindings", this.Caches.bindings, "json");
    this.editorSupport.addPane("statics", this.Caches.statics, "json");
    this.editorSupport.addPane("outputSchema", this.Caches.outputSchema, "shexc");
  }

  makeRenderer () {
    return this.currentRenderer = new ShExMapResultsRenderer(this.resultsWidget, this.Caches, this.MapModule.url)
  }

  /**
   * resolve node and shape against input data and output schema base and prefixes
   */
  fixMaterializationShapeMapEntry (node, shape) {
    return {
      node: this.Caches.inputData.meta.lexToTerm(node),
      shape: this.Caches.outputSchema.meta.lexToTerm(shape) // resolve with this.Caches.outputSchema
    }
  }

  reportMaterializationError (materializationError, currentAction) {
    $("#results .status").text("materialization errors:").show();
    if (materializationError && Array.isArray(materializationError.failures))
      materializationError.inputError = true; // schema/bindings problem, not a bug
    this.resultsWidget.failMessage(materializationError, currentAction);
    this.anchorMaterializationFailures(materializationError);
    return { materializationError };
  }

  /** anchor a MaterializationError's failures (which reference their
   * TripleConstraints by identity) in the output-schema editor pane */
  anchorMaterializationFailures (e) {
    const pane = this.editorSupport && this.editorSupport.panes.outputSchema;
    if (!pane)
      return;
    try {
      if (!e || !Array.isArray(e.failures)) {
        pane.setDiagnostics([]);
        return;
      }
      const located = ShExWebApp.EditorServices.locateInParsed(
        this.Caches.outputSchema.selection.val(), this.Caches.outputSchema.parsed);
      pane.setDiagnostics(e.failures.map(failure => {
        const range = failure.tc ? located.locate.expr(failure.tc) : null;
        return range && {
          from: range.from, to: range.to, severity: "error",
          message: failure.variable ? "no binding for <" + failure.variable + ">"
            : (failure.error || failure.code || "materialization failure"),
        };
      }).filter(diagnostic => diagnostic));
    } catch (err) {
      console.warn("editor diagnostics failed:", err);
    }
  }

  async materialize () {
    this.resultsWidget.clear();
    this.resultsWidget.start();
    SharedForTests.promise = this.materializeAsync();
  }

  async materializeAsync () {
    if (this.Caches.bindings.get().trim().length === 0) {
      this.resultsWidget.replace("You must validate data against a ShExMap schema to populate mappings bindings.").
        removeClass("passes fails").addClass("error");
      return null;
    }
    this.resultsWidget.start();
    const parsing = "output schema";
    try {
      const outputSchemaText = this.Caches.outputSchema.selection.val();
      const outputSchemaIsJSON = outputSchemaText.match(/^\s*\{/);
      const outputSchema = await this.Caches.outputSchema.refresh();

      function _dup (obj) { return JSON.parse(JSON.stringify(obj)); }
      const resultBindings = _dup(await this.Caches.bindings.refresh());
      if (this.Caches.statics.get().trim().length === 0)
        await this.Caches.statics.set("{  }");
      // statics are handed to the materializer as always-available globals
      // rather than being spliced into the binding tree as a consumable frame
      const staticVars = _dup(await this.Caches.statics.refresh()) || {};

      const outputShapeMap = [this.fixMaterializationShapeMapEntry($("#createRoot").val(), $("#outputShape").val())];

      const materializer = this.getMaterializer(outputSchema, outputShapeMap, resultBindings, staticVars);
      $("#results div").empty();
      $("#results .status").text("materializing data...").show();

      // a MaterializationError propagates to the outer catch, which anchors
      // its failures in the output-schema editor pane
      const generatedGraph = await materializer.invoke();
      this.anchorMaterializationFailures(null); // clear stale marks on success
      this.currentRenderer.finish();
      $("#results .status").text("materialization results").show();

      // Extract rdf:Collection heads.
      const lists = generatedGraph.extractLists({
        remove: true // Remove quads involved in lists (RDF Collections).
      });

      outputShapeMap.forEach(pair => {
        const {node, shape} = pair;
        try {
          const nestedWriter = new ShExWebApp.NestedTurtleWriter.Writer(null, {
            // lists: {}, -- lists will require some thinking
            format: 'text/turtle',
            // baseIRI: resource.base,
            prefixes: this.Caches.outputSchema.parsed._prefixes,
            lists,
            version: 1.1,
            indent: '    ',
            checkCorefs: n => false,
            // debug: true,
          });
          const db = ShExWebApp.RdfJsDb(generatedGraph, null); // no query tracker needed
          const validator = new ShExWebApp.Validator(outputSchema, db, {
            results: "api",
            regexModule: ShExWebApp["eval-simple-1err"],
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
          ShExWebApp.Util.getProofGraph(res, matchedDb, RdfJs.DataFactory);
          const rest = new RdfJs.Store();
          rest.addQuads(generatedGraph.getQuads()); // the resource giveth
          matched.forEach(q => rest.removeQuad(q)); // the matched taketh away
          nestedWriter.addQuads(matched.filter(q => ([ShExWebApp.Util.RDF.first, ShExWebApp.Util.RDF.rest]).indexOf(q.predicate.value) === -1));
          if (rest.size > 0) {
            nestedWriter.comment("\n# Triples not in the schema:");
            nestedWriter.addQuads(rest.getQuads())
          }
          nestedWriter.end((error, result) => this.addResult(error, result));
        } catch (e) {
          console.error(`NestedWriter(${node}@${shape}) failure:`);
          console.error(e);
          const fallbackWriter = new RdfJs.Writer({ prefixes: this.Caches.outputSchema.parsed._prefixes });
          fallbackWriter.addQuads(generatedGraph.getQuads());
          fallbackWriter.end((error, result) => this.addResult(error, result));
        }
      });
      this.resultsWidget.finish();
      return { materializationResults: generatedGraph };
    } catch (e) {
      this.reportMaterializationError(e, "materialization");
    }
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

