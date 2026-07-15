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
    $("#debugMaterialize").on("click", () => { SharedForTests.promise = this.startDebugSession(); });
    $("#dbgInto").on("click", () => this.debugStep("stepInto"));
    $("#dbgOver").on("click", () => this.debugStep("stepOver"));
    $("#dbgOut").on("click", () => this.debugStep("stepOut"));
    $("#dbgContinue").on("click", () => this.debugStep("continue"));
    $("#dbgStop").on("click", () => this.endDebugSession(true));
  }

  /** start a step-through materialization (doc/debugger-design.md phase 3):
   * gutter breakpoints in the outputSchema pane become constraint
   * breakpoints; the step buttons drive a MaterializerDebugger. */
  async startDebugSession () {
    const pane = this.editorSupport && this.editorSupport.panes.outputSchema;
    if (!pane) {
      this.resultsWidget.replace("Enable the language-aware editors (Menu → user interface) to debug materialization.")
        .removeClass("passes fails").addClass("error");
      return null;
    }
    if (this.Caches.bindings.get().trim().length === 0) {
      this.resultsWidget.replace("You must validate data against a ShExMap schema to populate mappings bindings.")
        .removeClass("passes fails").addClass("error");
      return null;
    }
    this.resultsWidget.clear();
    try {
      const {outputSchema, resultBindings, staticVars, outputShapeMap} =
            await this.collectMaterializationInputs();
      const schemaText = this.Caches.outputSchema.selection.val();
      const located = ShExWebApp.EditorServices.locateInParsed(schemaText, outputSchema);
      const pair = outputShapeMap[0];
      const shape = !pair.shape || pair.shape === ShExWebApp.Validator.Start ? undefined : pair.shape;
      const materializer = new this.MapModule.ThreadedMaterializer(outputSchema, {staticVars});
      const dbg = new this.MapModule.MaterializerDebugger(materializer, resultBindings, pair.node, shape);

      // gutter breakpoints (line starts) -> the first constraint on the line
      const lineStarts = ShExWebApp.EditorServices.lineOffsets(schemaText);
      pane.listBreakpoints().forEach(pos => {
        const lineEnd = lineStarts.find(start => start > pos) || schemaText.length;
        for (let offset = pos; offset < lineEnd; ++offset) {
          const hit = located.locate.exprAt(offset);
          if (hit) {
            dbg.addBreakpoint({tc: hit.expr});
            break;
          }
        }
      });

      this.debugSession = {dbg, materializer, outputShapeMap, located, pane};
      $("#debugControls").show();
      $("#dbgStatus").text("paused before materialization; step or continue");
      return this.debugSession;
    } catch (e) {
      this.reportMaterializationError(e, "starting debugger");
      return null;
    }
  }

  debugStep (command) {
    const session = this.debugSession;
    if (!session)
      return null;
    const event = session.dbg[command]();
    this.showDebugEvent(event);
    this.updateThreadList();
    if (session.dbg.done)
      this.endDebugSession(false);
    return event;
  }

  showDebugEvent (event) {
    const session = this.debugSession;
    if (!event || !session)
      return;
    const threadStr = event.thread
          ? " [" + event.thread.subject + " depth:" + event.thread.depth +
            " frame:" + event.thread.frame + " consumed:" + event.thread.consumed +
            (event.thread.skipped ? " skipped:" + event.thread.skipped : "") +
            " emitted:" + event.thread.emitted + "]"
          : "";
    switch (event.type) {
    case "tripleConstraint": {
      $("#dbgStatus").text("at <" + event.tc.predicate + ">" + threadStr);
      const range = session.located.locate.expr(event.tc);
      session.pane.highlight(range ? [range] : [], "shexjs-debug-current");
      break;
    }
    case "fail":
      $("#dbgStatus").text("branch died" +
        (event.failure && event.failure.variable ? ": no binding for <" + event.failure.variable + ">" : "") +
        threadStr);
      break;
    case "advance":
      $("#dbgStatus").text("advance to frame " + event.toFrame + " at <" + event.tc.predicate +
                           "> -- deferred so in-frame alternatives go first" + threadStr);
      break;
    case "accept":
      $("#dbgStatus").text("thread accepted: " + event.quads.length + " quads" + threadStr);
      break;
    case "return":
      $("#dbgStatus").text("returned" + threadStr);
      session.pane.clearHighlights();
      break;
    case "done":
      $("#dbgStatus").text("accepted: " + event.quads.length + " quads" +
                           (event.accepts && event.accepts.length > 1
                            ? " (1 of " + event.accepts.length + " viable)"
                            : ""));
      break;
    case "error":
      $("#dbgStatus").text("failed: " + event.error.message.split(";")[0]);
      break;
    }
  }

  /** the debugger's threads pane: accepted threads then pending ones;
   * hovering or clicking one renders its (partial) graph in #results */
  updateThreadList () {
    const session = this.debugSession;
    const list = $("#dbgThreads").empty();
    if (!session)
      return;
    const preview = (t, complete, label) => () => this.previewThread(t, complete, label);
    (session.materializer.accepts || []).forEach((a, i) => {
      const label = "accepted thread " + (i + 1) + ": " + a.quads.length + " quads, " +
            a.consumed + " bindings consumed" + (a.skipped ? ", " + a.skipped + " skipped" : "");
      list.append($("<button/>", {class: "dbgThread", title: label + " -- click to render"})
                  .text("✓" + (i + 1) + " " + a.quads.length + "q")
                  .on("mouseenter click", preview({quads: a.quads, used: a.used, frame: a.thread.frame}, true, label)));
    });
    session.dbg.threads().forEach((t, i) => {
      const kind = t.deferred ? "deferred" : "pending";
      const label = kind + " thread: subject " + t.subject + ", frame " + t.frame +
            ", depth " + t.depth + ", " + t.emitted + " quads emitted";
      list.append($("<button/>", {class: "dbgThread", title: label + " -- click to render its partial graph"})
                  .text((t.deferred ? "⏸" : "▶") + "f" + t.frame + " " + t.emitted + "q")
                  .on("mouseenter click", preview(t, false, label)));
    });
  }

  /** the aspects specific to a materialization thread: its private view of
   * the binding tree (frame cursor and consumed marks) ... */
  bindingStateText (thread) {
    const session = this.debugSession;
    const frames = session && session.materializer.frames;
    if (!frames || !thread.used)
      return null;
    const usedSet = new Set(thread.used);
    const prefixes = this.Caches.outputSchema.parsed._prefixes || {};
    const pname = (iri) => {
      for (const [prefix, ns] of Object.entries(prefixes))
        if (ns.length && iri.startsWith(ns))
          return prefix + ":" + iri.substring(ns.length);
      return "<" + iri + ">";
    };
    return "binding tree (✓ = consumed by this thread; → = cursor):\n" +
      frames.map((frame, i) =>
        (i === thread.frame ? "→ " : "  ") + "frame " + i + ":  " +
        Object.keys(frame).map(v => pname(v) + (usedSet.has(i + " " + v) ? " ✓" : "")).join("  ")
      ).join("\n");
  }

  /** render one thread's aspects in #results: its binding-tree state and its
   * generated graph -- accepted threads get the validating
   * NestedTurtleWriter rendering (as at end of materialization), partial
   * ones a plain serialization */
  previewThread (thread, complete, label) {
    const session = this.debugSession;
    $("#results div").empty();
    $("#results .status").text(label).show();
    const bindingState = this.bindingStateText(thread);
    if (bindingState)
      this.resultsWidget.append($("<pre/>", {class: "dbgBindingState"}).text(bindingState));
    const store = new RdfJs.Store();
    store.addQuads(thread.quads);
    if (complete && session) {
      this.renderMaterializedGraph(store, session.outputShapeMap);
    } else {
      const writer = new RdfJs.Writer({prefixes: this.Caches.outputSchema.parsed._prefixes});
      writer.addQuads(store.getQuads());
      writer.end((error, result) => this.addResult(error, result));
      this.resultsWidget.finish();
    }
  }

  /** when several threads accepted, offer them in #results (the chosen one
   * starred); clicking an alternative renders it */
  renderAcceptAlternatives (materializer, outputShapeMap) {
    const accepts = materializer.accepts || [];
    if (accepts.length < 2)
      return;
    const div = $("<div/>", {class: "dbgAlternatives"}).append(
      accepts.length + " viable materializations (showing the most-consuming): ");
    accepts.forEach((a, i) => {
      div.append($("<button/>", {title: a.quads.length + " quads, " + a.consumed +
                                 " bindings consumed" + (a.skipped ? ", " + a.skipped + " skipped" : "")})
                 .text((a === materializer.chosen ? "★" : "") + (i + 1))
                 .on("click", () => {
                   $("#results div").empty();
                   $("#results .status").text("materialization alternative " + (i + 1)).show();
                   const store = new RdfJs.Store();
                   store.addQuads(a.quads);
                   this.renderMaterializedGraph(store, outputShapeMap);
                   this.renderAcceptAlternatives(materializer, outputShapeMap);
                 }));
    });
    this.resultsWidget.append(div);
  }

  /** wrap up: on completion render the graph (or the error) as materialize
   * would; on user stop just dismantle */
  endDebugSession (stopped) {
    const session = this.debugSession;
    if (!session)
      return;
    this.debugSession = null;
    session.pane.clearHighlights();
    $("#debugControls").hide();
    $("#dbgThreads").empty();
    if (stopped) {
      $("#dbgStatus").text("");
      return;
    }
    if (session.dbg.error) {
      this.reportMaterializationError(session.dbg.error, "materialization (debugged)");
    } else {
      this.anchorMaterializationFailures(null, session.materializer.lastReport);
      const generatedGraph = new RdfJs.Store();
      generatedGraph.addQuads(session.dbg.quads);
      $("#results .status").text("materialization results (debugged)").show();
      this.renderMaterializedGraph(generatedGraph, session.outputShapeMap);
      this.renderAcceptAlternatives(session.materializer, session.outputShapeMap);
    }
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

  /** anchor materialization problems in the editor panes: a
   * MaterializationError's failures (which reference their TripleConstraints
   * by identity) as errors, and the materializer's report as warnings --
   * variables bound NOWHERE (e.g. a typo'd name silently collapsing a
   * starred subshape to zero iterations) on their constraints, and statics
   * that nothing references on their keys in the statics pane. */
  anchorMaterializationFailures (e, lastReport) {
    const pane = this.editorSupport && this.editorSupport.panes.outputSchema;
    if (!pane)
      return;
    try {
      const report = lastReport || (e && e.report) || {};
      const located = ShExWebApp.EditorServices.locateInParsed(
        this.Caches.outputSchema.selection.val(), this.Caches.outputSchema.parsed);
      const anchored = (failure, severity, message) => {
        const range = failure.tc ? located.locate.expr(failure.tc) : null;
        return range && {from: range.from, to: range.to, severity, message};
      };
      pane.setDiagnostics([]
        .concat((e && Array.isArray(e.failures) ? e.failures : []).map(failure => anchored(
          failure, "error",
          failure.variable ? "no binding for <" + failure.variable + ">"
            : (failure.error || failure.code || "materialization failure"))))
        .concat((report.unboundVariables || []).map(failure => anchored(
          failure, "warning",
          "<" + failure.variable + "> is bound nowhere (bindings or statics); branches needing it were abandoned")))
        .filter(diagnostic => diagnostic));
      const staticsPane = this.editorSupport.panes.statics;
      if (staticsPane) {
        const staticsText = this.Caches.statics.selection.val();
        staticsPane.setDiagnostics((report.unusedStatics || []).map(key => {
          const at = staticsText.indexOf("\"" + key + "\"");
          return at !== -1 && {
            from: at, to: at + key.length + 2, severity: "warning",
            message: "static variable never referenced by the output schema",
          };
        }).filter(diagnostic => diagnostic));
      }
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
    try {
      const {outputSchema, resultBindings, staticVars, outputShapeMap} =
            await this.collectMaterializationInputs();
      const materializer = this.getMaterializer(outputSchema, outputShapeMap, resultBindings, staticVars);
      $("#results div").empty();
      $("#results .status").text("materializing data...").show();

      // a MaterializationError propagates to the outer catch, which anchors
      // its failures in the output-schema editor pane
      const generatedGraph = await materializer.invoke();
      // on success: clear stale error marks, but surface never-bound
      // variables and unreferenced statics as warnings
      this.anchorMaterializationFailures(null, materializer.lastReport);
      if (this.currentRenderer) // absent when bindings were pasted, not validated
        this.currentRenderer.finish();
      $("#results .status").text("materialization results").show();
      this.renderMaterializedGraph(generatedGraph, outputShapeMap);
      this.renderAcceptAlternatives(materializer, outputShapeMap);
      return { materializationResults: generatedGraph };
    } catch (e) {
      this.reportMaterializationError(e, "materialization");
    }
  }

  /** the inputs to a materialization (shared by materializeAsync and the
   * debugger): parsed output schema, a deep copy of the bindings and static
   * vars, and the createRoot/outputShape pair */
  async collectMaterializationInputs () {
    const _dup = (obj) => JSON.parse(JSON.stringify(obj));
    const outputSchema = await this.Caches.outputSchema.refresh();
    const resultBindings = _dup(await this.Caches.bindings.refresh());
    if (this.Caches.statics.get().trim().length === 0)
      await this.Caches.statics.set("{  }");
    // statics are handed to the materializer as always-available globals
    // rather than being spliced into the binding tree as a consumable frame
    const staticVars = _dup(await this.Caches.statics.refresh()) || {};
    const outputShapeMap = [this.fixMaterializationShapeMapEntry($("#createRoot").val(), $("#outputShape").val())];
    return {outputSchema, resultBindings, staticVars, outputShapeMap};
  }

  /** render a materialized graph into #results (shared by materializeAsync
   * and the debugger's completion) */
  renderMaterializedGraph (generatedGraph, outputShapeMap) {
    try {
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
          const validator = new ShExWebApp.Validator(this.Caches.outputSchema.parsed, db, {
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
    } catch (e) {
      this.reportMaterializationError(e, "rendering materialization");
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

