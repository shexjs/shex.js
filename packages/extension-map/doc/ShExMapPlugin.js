/**
 * The ShExMap plugin: what ShExMap adds to the page.
 *
 * Everything, now: the panes and the manifest keys that fill them, the
 * styles, the row of controls and the keys that reach them, the Map
 * semantic-action extension the schema's %Map:{...%} dispatches on, the
 * materialize verb, what it does to the results, the graph it renders and
 * the debugger that steps it -- doc/extension-ui-plan.md's inventory rows
 * 1-6 and 9-14.
 *
 * The verbs are mixed into the app rather than living on a subclass of it,
 * so `this` is the app and they call each other as they always did.  Which
 * is why shexmap-simple.html has no app class: it is a redirect to
 * shex-simple.html with this file named as a plugin.
 *
 * What is not here is the worker's half (rows 15 and 16,
 * ShExMapWorkerThread.js beside this) and the module this runs on, which
 * the descriptor's `scripts` names and the app fetches.
 */

const MAP_ID = "http://shex.io/extensions/Map/#";
/** the second kind of results this plugin has: a materialization */
const MATERIALIZATION_TAB = "materializationResults";

/** index of the first "node@shape" separator in an output ShapeMap ('@'
 * outside <>s), or -1 if there is none yet */
function outputMapAtIndex (text) {
  let depth = 0;
  for (let i = 0; i < text.length; ++i) {
    switch (text[i]) {
    case "<": ++depth; break;
    case ">": --depth; break;
    case "@": if (depth === 0) return i; break;
    }
  }
  return -1;
}


/** a stable key for a quad by value, since the same triple arrives as
 * different objects from the materializer and from the proof graph */
function quadKey (q) {
  const term = t => t.termType + "\u0000" + t.value +
        (t.language ? "@" + t.language : "") +
        (t.datatype ? "^^" + t.datatype.value : "");
  return term(q.subject) + "\u0001" + term(q.predicate) + "\u0001" + term(q.object);
}

/**
 * Quads in the order that makes nested Turtle readable: a blank node's
 * arc before the triples hanging off it.
 *
 * The materializer already emits them that way -- the arc into a nested
 * shape is written before the sub-NFA starts, so it can be retracted with
 * the rest if that shape turns out not to materialize.  What loses it is
 * putting them through an N3.Store on the way to the writer: getQuads()
 * answers in index order, and the nested writer, meeting `fhir:subject
 * _:tm1` after it has already written _:tm1 as a subject of its own, has
 * nothing left to nest and emits an empty `[]`.
 *
 *     <tag:root> fhir:item [ ... fhir:subject []; ... ].
 *     _:tm1 fhir:Patient.name "Sue".
 *
 * So this is only a `filter`: the order is the caller's, and all this does
 * is drop duplicates so a quad can't be written twice.
 */
function orderedForNesting (quads) {
  const seen = new Set();
  return (quads || []).filter(q => {
    const key = quadKey(q);
    if (seen.has(key))
      return false;
    seen.add(key);
    return true;
  });
}

/** materialize here, in this tab */
class DirectShExMaterializer {
  constructor (schema, shapeMap, resultBindings, staticVars, mapModule) {
    this.schema = schema;
    this.shapeMap = shapeMap;
    this.resultBindings = resultBindings;
    this.staticVars = staticVars;
    this.mapModule = mapModule;
  }
  async invoke (fixedMap, validationTracker, time, _done, _currentAction) {
    const generatedGraph = new RdfJs.Store();
    // NFA-thread materializer: each thread carries its own binding-tree
    // cursor, so a failed subtree can't corrupt the surviving alternatives.
    // See ../doc/threaded-materializer.md.  A MaterializationError thrown
    // here propagates to the app's materialization error report.
    const materializer = new this.mapModule.ThreadedMaterializer(this.schema, {staticVars: this.staticVars});
    this.provenance = [];                      // per-quad origins for the editor panes
    this.shapeMap.forEach(pair => {
      const shape = !pair.shape || pair.shape === ShExWebApp.Validator.Start ? undefined : pair.shape;
      const quads = materializer.materialize(this.resultBindings, pair.node, shape);
      generatedGraph.addQuads(quads);
      quads.forEach((quad, i) => this.provenance.push(
        Object.assign({quad}, (materializer.provenance || [])[i])));
    });
    this.lastReport = materializer.lastReport; // unbound-variable / unused-static warnings
    this.accepts = materializer.accepts;       // all viable materializations
    this.chosen = materializer.chosen;         // ... and the one returned
    this.frames = materializer.frames;         // the flattened binding tree
    this.frameOrigins = materializer.frameOrigins; // ... and where each was written
    time = new Date() - time;
    $("#shapeMap-tabs").attr("title", "last materialization: " + time + " ms");
    $("#results .status").text("rendering results...").show();

    return generatedGraph;
  }
}

/** ...or over there, in the worker, which is the same job said in messages.
 * The worker half that answers them is ShExMapWorkerThread.js. */
class RemoteShExMaterializer {
  constructor (schema, shapeMap, resultBindings, staticVars, resultsWidget, onCancel, workerUrl, mapModule) {
    this.generatedGraph = new RdfJs.Store();
    this.provenance = [];
    // the worker names constraints by their index in this same schema (see
    // ShExMapWorkerThread's "materialize"), which object identity can't cross
    this.schemaTcs = mapModule.tripleConstraints(schema);
    this.created = new Canceleable(
      $("#materialize"),
      onCancel,
      "materialization aborted, re-start from validation",
      {
        request: "materialize",
        queryMap: shapeMap,
        outputSchema: schema,
        resultBindings: resultBindings,
        staticVars: staticVars,
        options: {track: LOG_PROGRESS},
      },
      this.parseUpdatesAndResults.bind(this),
      workerUrl
    ).ready();
  }
  async invoke (fixedMap, validationTracker, time, done, currentAction) {
    const materialized = await this.created;
    return this.generatedGraph;
  }

  parseUpdatesAndResults (msg, workerUICleanup, resolve, reject) {
    switch (msg.data.response) {
    case "update": {
      // the ThreadedMaterializer in the worker ships quads, not a val structure
      const quads = msg.data.quads.map(
        q => WorkerMarshalling.jsonTripleToRdfjsTriple(q, RdfJs.DataFactory));
      this.generatedGraph.addQuads(quads);
      // ... plus each quad's origin, with its constraint index resolved
      // against this thread's schema so the editor panes can locate it
      (msg.data.provenance || []).forEach((p, i) => {
        if (quads[i])
          this.provenance.push({quad: quads[i], predicate: p.predicate, src: p.src,
                                tc: p.tcOrdinal === null ? null : this.schemaTcs[p.tcOrdinal]});
      });
      break;
    }

    case "error":
      if ("exception" in msg.data) {
        this.resultsWidget.replace("error materializing:\n" + msg.data.exception).
          removeClass("passes fails").addClass("error");
      } else {
        this.renderEntry({
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
      resolve({ materializionResults: this.generatedGraph });
    }
  }
}

/**
 * ShExMap's verbs, mixed into the app by the base app's applyExtension.
 *
 * `this` is the app: these were methods on a subclass of it, and moving
 * them here changed their indentation and nothing else.  They call each
 * other, and the app's own methods, the way they always did.
 */
const ShExMapVerbs = {
  /** materialize here or in the worker, whichever this app validates in */
  getMaterializer (schema, shapeMap, resultBindings, staticVars) {
    return this.remote
      ? new RemoteShExMaterializer(schema, shapeMap, resultBindings, staticVars,
                                   this.resultsWidget, () => this.materialize(),
                                   WorkerUrl, this.MapModule)
      : new DirectShExMaterializer(schema, shapeMap, resultBindings, staticVars, this.MapModule);
  },

  async materialize () {
    if (!this.MapModule)
      throw Error("ShExMap's module is not loaded on this page: nothing to materialize with");
    // ...and it replaces what a debug session was stepping through, so that
    // session goes with it (the validator's #validate does the same)
    this.endDebugSession(true);
    this.showMaterialization();
    this.resultsWidget.clear();
    this.resultsWidget.start();
    SharedForTests.promise = this.materializeAsync();
  },

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
      this.clearResults();
      $("#results .status").text("materializing data...").show();

      // a MaterializationError propagates to the outer catch, which anchors
      // its failures in the output-schema editor pane
      const generatedGraph = await materializer.invoke();
      // where each (frame, variable) was written, for exact binding
      // highlighting -- known only once the tree has been flattened, which
      // materialize() does.  A remote materializer (the worker app) flattens
      // on the far side of postMessage and has none; bindingRanges falls
      // back to counting occurrences there, as it always did.
      this.bindingOrigins = materializer.frameOrigins || null;
      // on success: clear stale error marks, but surface never-bound
      // variables and unreferenced statics as warnings
      this.anchorMaterializationFailures(null, materializer.lastReport);
      // The validation renderer's finish() used to be called here, back
      // when materializing emptied #results and something had to put the
      // validation results back.  It renders the appinfo results, which it
      // already did when the validation ended and which now sit in their own
      // tab, so calling it again only rendered them a second time.
      $("#results .status").text("materialization results").show();
      this.renderMaterializedGraph(generatedGraph, outputShapeMap, materializer.provenance);
      this.renderAcceptAlternatives(materializer, outputShapeMap);
      return { materializationResults: generatedGraph };
    } catch (e) {
      this.reportMaterializationError(e, "materialization");
    }
  },

  /** the inputs to a materialization (shared by materializeAsync and the
   * debugger): parsed output schema, a deep copy of the bindings and static
   * vars, and the output ShapeMap */
  async collectMaterializationInputs () {
    const _dup = (obj) => JSON.parse(JSON.stringify(obj));
    const outputSchema = await this.Caches.outputSchema.refresh();
    const resultBindings = _dup(await this.Caches.bindings.refresh());
    if (this.Caches.statics.get().trim().length === 0)
      await this.Caches.statics.set("{  }");
    // statics are handed to the materializer as always-available globals
    // rather than being spliced into the binding tree as a consumable frame
    const staticVars = _dup(await this.Caches.statics.refresh()) || {};
    const outputShapeMap = this.parseMaterializationShapeMap($("#outputShapeMap").val());
    return {outputSchema, resultBindings, staticVars, outputShapeMap};
  },

  /** empty the results panel now being written, dropping the panes that
   * rendered into it */
  clearResults () {
    this.materializationPanes = [];
    this.resultsWidget.resultPanes = [];
    this.resultsWidget.resultsSel.empty();
  },

  /** Show the materialization tab and write there.  Nothing else moves: the
   * validation results stay in their own tab, still true of the bindings
   * this materialization consumed. */
  showMaterialization () {
    const tabs = $("#resultsTabs");
    if (tabs.find('[href="#' + MATERIALIZATION_TAB + '"]').length === 0)
      tabs.find("> ul").append(
        $("<li/>").append($("<a/>", {href: "#materializationResults"}).text("materialization")));
    $("#" + MATERIALIZATION_TAB).show();
    if (tabs.data("ui-tabs")) {
      tabs.tabs("refresh");
      tabs.tabs("option", "active", tabs.find("> ul > li").length - 1);
    }
    this.resultsWidget.setTarget("#" + MATERIALIZATION_TAB + " > div");
  },

  /** A validation replaces the bindings a materialization was made from, so
   * its results are no longer about anything: the tab goes. */
  hideMaterialization () {
    const tabs = $("#resultsTabs");
    const tab = tabs.find('[href="#' + MATERIALIZATION_TAB + '"]').closest("li");
    this.materializationPanes = [];
    $("#" + MATERIALIZATION_TAB + " > div").empty();
    $("#" + MATERIALIZATION_TAB).hide();
    if (tab.length) {
      tab.remove();
      if (tabs.data("ui-tabs")) {
        tabs.tabs("refresh");
        tabs.tabs("option", "active", 0);
      }
    }
    this.resultsWidget.setTarget(this.resultsTarget);
  },

  /* Two kinds of results, a tab each.  A materialization is *of* a
   * validation -- it consumes the bindings one produced -- so its tab shows
   * up when there is one and goes away when a new validation replaces the
   * bindings underneath it, rather than sitting there stale. */



  /** start a step-through materialization (doc/debugger-design.md phase 3):
   * gutter breakpoints in the outputSchema pane become constraint
   * breakpoints; the step buttons drive a MaterializerDebugger. */
  async startDebugSession () {
    this.showMaterialization();
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
      // the step buttons beside the button that started them, the status on
      // its own row -- see the validator's, which this follows.  🐞 stands
      // down while its session is live.
      $("#debugControls, #dbgStatusRow").show();
      $("#debugMaterialize").hide();
      $("#dbgStatus").text("paused before materialization; step or continue");
      return this.debugSession;
    } catch (e) {
      this.reportMaterializationError(e, "starting debugger");
      return null;
    }
  },

  debugStep (command) {
    const session = this.debugSession;
    if (!session)
      return null;
    const event = session.dbg[command]();
    this.showDebugEvent(event);
    this.updateThreadList();
    if (session.dbg.done) {
      this.endDebugSession(false);
      return event;
    }
    // Show what the thread has built so far.  Its triples exist from the
    // moment each is emitted -- the arc into a nested shape before the
    // shape is even entered -- but nothing drew them until the session
    // ended or the reader thought to hover a thread button, so stepping
    // through a shape showed no output until the shape was finished.
    // the thread being stepped leads the list (liveThreads), which is the
    // one this step was about
    const [current] = session.dbg.threads();
    if (current)
      this.previewThread(current, false, this.stepLabel(event, current));
    return event;
  },

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
  },

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
                  .on("mouseenter click", preview({quads: a.quads, provenance: a.provenance,
                                                   used: a.used, frame: a.thread.frame}, true, label)));
    });
    session.dbg.threads().forEach((t, i) => {
      const kind = t.deferred ? "deferred" : "pending";
      const label = kind + " thread: subject " + t.subject + ", frame " + t.frame +
            ", depth " + t.depth + ", " + t.emitted + " quads emitted";
      list.append($("<button/>", {class: "dbgThread", title: label + " -- click to render its partial graph"})
                  .text((t.deferred ? "⏸" : "▶") + "f" + t.frame + " " + t.emitted + "q")
                  .on("mouseenter click", preview(t, false, label)));
    });
  },

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
  },

  /** what to call the step just taken, over the graph it has built */
  stepLabel (event, thread) {
    const where = event && event.tc
          ? " at <" + event.tc.predicate + ">"
          : event && event.type ? " (" + event.type + ")" : "";
    return "stepping" + where + ": " + thread.emitted + " quads so far";
  },

  /** The same statement bindingStateText makes, written on the bindings
   * themselves: which this thread has consumed, and which frame its cursor
   * is in.
   *
   * The text block says it by frame, which is how the materializer thinks;
   * a reader is looking at the tree they wrote, where a frame is not a
   * thing -- one written binding can be read by several (see
   * normalizeBindingTreeWithOrigins).  So a binding is marked consumed if
   * any frame consumed it, and the title says which; the cursor frame's
   * unconsumed bindings are marked as what this thread would read next.
   */
  annotateBindingState (thread) {
    const pane = this.editorSupport && this.editorSupport.panes
          && this.editorSupport.panes.bindings;
    if (!pane)
      return;
    const origins = this.bindingOrigins;
    if (!origins || !thread || !thread.used) {
      pane.annotate(null);
      return;
    }
    const text = this.Caches.bindings.selection.val();
    const used = new Set(thread.used);
    // one entry per place a binding is written, gathering the frames that
    // read it -- the same grouping the hover regions use
    const byPath = new Map();
    origins.forEach((frameOrigin, frame) => {
      Object.keys(frameOrigin || {}).forEach(variable => {
        const path = frameOrigin[variable];
        const key = path.join(" ");
        if (!byPath.has(key))
          byPath.set(key, {path, variable, consumed: [], frames: []});
        const at = byPath.get(key);
        at.frames.push(frame);
        if (used.has(frame + " " + variable))
          at.consumed.push(frame);
      });
    });
    const marks = [];
    byPath.forEach(({path, variable, consumed, frames}) => {
      const cursorHere = frames.indexOf(thread.frame) !== -1;
      if (consumed.length === 0 && !cursorHere)
        return;
      const cls = consumed.length ? "shexjs-binding-consumed" : "shexjs-binding-cursor";
      const title = consumed.length
            ? "consumed by this thread, in frame " + consumed.join(", ")
            : "in frame " + thread.frame + ", where this thread's cursor is -- not consumed";
      this.bindingRangesAt(text, path).forEach(
        range => marks.push({from: range.from, to: range.to, cls, title}));
    });
    pane.annotate(marks);
  },

  /** render one thread's aspects in #results: its binding-tree state and its
   * generated graph -- accepted threads get the validating
   * NestedTurtleWriter rendering (as at end of materialization), partial
   * ones a plain serialization */
  previewThread (thread, complete, label) {
    const session = this.debugSession;
    this.clearResults();
    $("#results .status").text(label).show();
    const bindingState = this.bindingStateText(thread);
    if (bindingState)
      this.resultsWidget.append($("<pre/>", {class: "dbgBindingState"}).text(bindingState));
    this.annotateBindingState(thread);
    if (complete && session) {
      const store = new RdfJs.Store();
      store.addQuads(thread.quads);
      this.renderMaterializedGraph(store, session.outputShapeMap, thread.provenance);
    } else {
      // the thread's quads as it emitted them, which is what nests
      this.writeNestedTurtle(thread.quads, (error, result) => this.addResult(error, result));
      // lead with the triple this step just added: the reader is stepping
      // to watch the graph grow, and the newest one is the news
      this.reportMaterialization(thread.provenance,
                                 thread.quads[thread.quads.length - 1] || null);
      this.resultsWidget.finish();
    }
  },

  /** The graph as nested Turtle, without asking the schema to approve it
   * first.
   *
   * renderMaterializedGraph validates before it writes, so it can lead with
   * the triples the schema accounts for and follow with the rest -- which a
   * thread paused halfway through cannot survive: not satisfying the output
   * schema yet is what "partial" means.  The nesting itself needs none of
   * that, and a flat dump of thirty triples with N3's own bnode labels is
   * what stepping used to show.
   */
  writeNestedTurtle (quads, onDone) {
    const prefixes = this.Caches.outputSchema.parsed._prefixes;
    const ordered = orderedForNesting(quads);
    try {
      // extractLists wants a store, and takes the list triples out of it
      const store = new RdfJs.Store();
      store.addQuads(ordered);
      const lists = store.extractLists({remove: true});
      const writer = new ShExWebApp.NestedTurtleWriter.Writer(null, {
        format: "text/turtle",
        prefixes,
        lists,
        version: 1.1,
        indent: "    ",
        checkCorefs: n => false,
      });
      // ...but the *order* is the materializer's, not the store's: see
      // orderedForNesting
      writer.addQuads(ordered.filter(
        q => store.countQuads(q.subject, q.predicate, q.object, q.graph) > 0));
      writer.end(onDone);
    } catch (e) {
      // a graph the nested writer can't lay out still has to be readable
      console.warn("NestedWriter on a partial graph:", e);
      const writer = new RdfJs.Writer({prefixes});
      writer.addQuads(ordered);
      writer.end(onDone);
    }
  },

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
                   this.clearResults();
                   $("#results .status").text("materialization alternative " + (i + 1)).show();
                   const store = new RdfJs.Store();
                   store.addQuads(a.quads);
                   this.renderMaterializedGraph(store, outputShapeMap, a.provenance);
                   this.renderAcceptAlternatives(materializer, outputShapeMap);
                 }));
    });
    this.resultsWidget.append(div);
  },

  /** wrap up: on completion render the graph (or the error) as materialize
   * would; on user stop just dismantle */
  endDebugSession (stopped) {
    const session = this.debugSession;
    if (!session)
      return;
    this.debugSession = null;
    session.pane.clearHighlights();
    const bindingsPane = this.editorSupport && this.editorSupport.panes
          && this.editorSupport.panes.bindings;
    if (bindingsPane)
      bindingsPane.annotate(null);
    $("#debugControls").hide();
    $("#debugMaterialize").show();
    $("#dbgThreads").empty();
    if (stopped) {
      $("#dbgStatus").text("");
      $("#dbgStatusRow").hide();
      return;
    }
    // a session that ran to the end keeps its last word: how it finished is
    // the answer.  That was the intent before, but #dbgStatus lived inside
    // #debugControls, so hiding those took the sentence with them.
    if (session.dbg.error) {
      this.reportMaterializationError(session.dbg.error, "materialization (debugged)");
    } else {
      // The finished graph replaces what stepping was showing.  Stepping
      // renders the thread's graph as it grows, so without this the last
      // step's rendering is still there and the finished one lands beside
      // it -- two identical copies of the same materialization.
      this.clearResults();
      this.anchorMaterializationFailures(null, session.materializer.lastReport);
      const generatedGraph = new RdfJs.Store();
      generatedGraph.addQuads(session.dbg.quads);
      $("#results .status").text("materialization results (debugged)").show();
      this.renderMaterializedGraph(generatedGraph, session.outputShapeMap,
                                   session.materializer.provenance);
      this.renderAcceptAlternatives(session.materializer, session.outputShapeMap);
    }
  },

  /**
   * resolve node and shape against input data and output schema base and prefixes
   */
  fixMaterializationShapeMapEntry (node, shape) {
    return {
      node: this.Caches.inputData.meta.lexToTerm(node),
      shape: this.Caches.outputSchema.meta.lexToTerm(shape) // resolve with this.Caches.outputSchema
    }
  },

  /**
   * parse #outputShapeMap's "node@shape" pairs (comma-separated). The node
   * names a graph root to invent so it can't be picked from the data, hence a
   * plain text input rather than a QueryMapEditor. Split at '@'s outside
   * <>s, then resolve each side like any other shape-map entry.
   */
  parseMaterializationShapeMap (text) {
    const pairs = [];
    let start = 0, at = -1, depth = 0;
    for (let i = 0; i < text.length; ++i) {
      switch (text[i]) {
      case "<": ++depth; break;
      case ">": --depth; break;
      case "@": if (depth === 0 && at === -1) at = i; break;
      case ",": if (depth === 0) { pairs.push([start, at, i]); start = i + 1; at = -1; } break;
      }
    }
    pairs.push([start, at, text.length]);
    return pairs.map(([from, at, to]) => {
      if (at === -1)
        throw Error(`expected "node@shape" in output ShapeMap ${JSON.stringify(text.substring(from, to).trim())}`);
      return this.fixMaterializationShapeMapEntry(text.substring(from, at).trim(), text.substring(at + 1, to).trim());
    });
  },

  reportMaterializationError (materializationError, currentAction) {
    $("#results .status").text("materialization errors:").show();
    if (materializationError && Array.isArray(materializationError.failures))
      materializationError.inputError = true; // schema/bindings problem, not a bug
    this.resultsWidget.failMessage(materializationError, currentAction);
    this.anchorMaterializationFailures(materializationError);
    return { materializationError };
  },

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
  },

  /** render a materialized graph into #results (shared by materializeAsync
   * and the debugger's completion).  `provenance` (per generated quad: its
   * constraint and the bindings its object came from) drives the editors'
   * cross-pane hover highlighting; absent, the graph just renders. */
  renderMaterializedGraph (generatedGraph, outputShapeMap, provenance) {
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
          // The proof graph is in the validator's order, which is not the
          // one that nests: put the materializer's back, so a blank node's
          // arc precedes the triples hanging off it (see orderedForNesting).
          // Anything the proof found that the materializer didn't emit keeps
          // its place at the end.
          const emitted = new Map();
          (provenance || []).forEach((prov, i) => {
            if (prov && prov.quad)
              emitted.set(quadKey(prov.quad), i);
          });
          const inEmissionOrder = orderedForNesting(matched).sort((a, b) => {
            const ai = emitted.has(quadKey(a)) ? emitted.get(quadKey(a)) : Infinity;
            const bi = emitted.has(quadKey(b)) ? emitted.get(quadKey(b)) : Infinity;
            return ai - bi;
          });
          nestedWriter.addQuads(inEmissionOrder.filter(q => ([ShExWebApp.Util.RDF.first, ShExWebApp.Util.RDF.rest]).indexOf(q.predicate.value) === -1));
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
      this.reportMaterialization(provenance);
      this.resultsWidget.finish();
    } catch (e) {
      this.reportMaterializationError(e, "rendering materialization");
    }
  },

  /** map a materialization onto the editor panes (?editors=1), the
   * materialization counterpart of EditorSupport.reportValidation: each
   * generated triple in the result pane hover-links to the output-schema
   * constraint that synthesized it and to the binding (or static) whose
   * value it carries, and each of those links back to its triples. */
  reportMaterialization (provenance, focus) {
    const panes = this.editorSupport && this.editorSupport.panes;
    if (!panes || !panes.outputSchema || !this.materializationPanes.length
        || !provenance || !provenance.length)
      return;
    try {
      const located = ShExWebApp.EditorServices.locateInParsed(
        this.Caches.outputSchema.selection.val(), this.Caches.outputSchema.parsed);
      // each result pane holds one rendering; pair every generated triple
      // with its position there.  The rendering travels with the pairs: the
      // ranges only mean anything against it, and #results may be cleared
      // (a debounced pane edit reaches copyQueryMapToEditMap) while this
      // mapping remains the record of what was materialized.
      const rendered = this.materializationPanes.map(({pane, text}) => ({
        pane,
        text,
        pairs: ShExWebApp.EditorServices.mapMaterialization(
          provenance, located,
          ShExWebApp.EditorServices.parseTurtle(text, {baseIRI: this.Caches.outputSchema.meta.base})),
      }));
      // introspection for tests/debugging, as EditorSupport.lastMapped is
      // for validation
      this.editorSupport.lastMaterialized = rendered;
      this.setMaterializationHovers(rendered, focus);
    } catch (e) {
      console.warn("materialization diagnostics failed:", e);
    }
  },

  /** the bindings pane's text, parsed for positions -- one parse per text,
   * since hovering asks repeatedly and the text rarely changes */
  locatedBindings (text) {
    if (!this._locatedBindings || this._locatedBindings.text !== text)
      this._locatedBindings = {text, loc: ShExWebApp.EditorServices.locateJsonText(text)};
    return this._locatedBindings.loc;
  },

  /** what to light up for the binding written at `path`: the variable that
   * names it and the value under it.  The value of a literal binding is
   * `{"value": "Sue"}`, and what a reader is looking at there is "Sue". */
  bindingRangesAt (text, path) {
    const loc = this.locatedBindings(text);
    const out = [];
    const name = loc.nameAt(path);
    if (name)
      out.push(name);
    const value = loc.at(path.concat(["value"])) || loc.at(path);
    if (value)
      out.push(value);
    return out;
  },

  /** Where a binding was written, exactly.
   *
   * The materializer flattens the binding tree into a sequence of frames,
   * and the two do not line up: a binding written once beside a list of
   * repeated groups is distributed into every frame those groups produce,
   * so the third occurrence of a variable in the text is not frame 3's.
   * frameOrigins says which path each (frame, variable) came from, and the
   * pane's own JSON grammar says where that path is.
   *
   * Without origins -- the worker app materializes across postMessage --
   * this falls back to counting occurrences, which is what it always did.
   */
  bindingRanges (text, variable, frame) {
    const origins = this.bindingOrigins;
    if (!origins)
      return this.variableRanges(text, variable, frame);
    const paths = (frame === null || frame === undefined
                   ? origins.map(o => o && o[variable])
                   : [(origins[frame] || {})[variable]]).filter(path => path);
    if (paths.length === 0)
      return this.variableRanges(text, variable, frame);
    const seen = new Set();
    return paths.flatMap(path => {
      const key = path.join(" ");
      if (seen.has(key))
        return [];
      seen.add(key);
      return this.bindingRangesAt(text, path);
    });
  },

  /** ranges of a variable's occurrences in the bindings (or statics) pane
   * text: the JSON keys naming it.  A variable bound in several frames has
   * several occurrences; `frame` picks one when the counts line up, else
   * they all highlight.  Statics have no frames, and it is exact for them. */
  variableRanges (text, variable, frame) {
    const key = JSON.stringify(variable);
    const found = [];
    for (let at = text.indexOf(key); at !== -1; at = text.indexOf(key, at + 1))
      found.push({from: at, to: at + key.length});
    return frame !== null && frame !== undefined && frame < found.length
      ? [found[frame]]
      : found;
  },

  /** cross-pane hover highlighting for a materialization: hovering a
   * generated triple, its constraint, or its binding highlights all three. */
  setMaterializationHovers (rendered, focus) {
    const panes = this.editorSupport.panes;
    const schemaPane = panes.outputSchema;
    const bindingsPane = panes.bindings;
    const staticsPane = panes.statics;
    // `focus` is a triple to show when the mouse isn't asking for anything
    // else -- the one just added, while stepping.  A hover overrides it and
    // leaving comes back to it, which is what makes it a default rather
    // than a highlight nobody can get rid of.
    let showDefault = () => {};
    const wipe = () => {
      schemaPane.clearHighlights();
      if (bindingsPane) bindingsPane.clearHighlights();
      if (staticsPane) staticsPane.clearHighlights();
      rendered.forEach(({pane}) => pane.clearHighlights());
    };
    const clearAll = () => {
      // a frozen highlight outlasts the mouse leaving it: that is what
      // freezing is for -- going to look at what it points at
      if (HighlightMode.frozen())
        return;
      wipe();
      showDefault();
    };
    const termRanges = (p) => [].concat(
      p.anchors.objectParts || (p.anchors.object ? [p.anchors.object] : []),
      p.anchors.subjectParts || (p.anchors.subject ? [p.anchors.subject] : []),
      p.anchors.predicate ? [p.anchors.predicate] : []);
    // a structural triple only links into a nested shape: distinguish it
    // from one carrying a binding
    const show = (group, hoveredPane, pinning) => {
      // the switch decides whether the mouse paints; a pin decides whether
      // it may change what is painted
      if (!pinning && (!HighlightMode.live() || HighlightMode.frozen()))
        return;
      const cls = group.every(p => p.structural)
            ? "shexjs-highlight" : "shexjs-highlight-match";
      schemaPane.highlight(
        group.flatMap(p => p.schemaParts || (p.schema ? [p.schema] : [])),
        cls, {scroll: hoveredPane !== schemaPane});
      const bindingsText = bindingsPane ? this.Caches.bindings.selection.val() : "";
      const staticsText = staticsPane ? this.Caches.statics.selection.val() : "";
      if (bindingsPane)
        bindingsPane.highlight(
          group.filter(p => !p.statics).flatMap(
            p => p.variables.flatMap(v => this.bindingRanges(bindingsText, v, p.frame))),
          cls, {scroll: hoveredPane !== bindingsPane});
      if (staticsPane)
        staticsPane.highlight(
          group.filter(p => p.statics).flatMap(
            p => p.variables.flatMap(v => this.variableRanges(staticsText, v, null))),
          cls, {scroll: hoveredPane !== staticsPane});
      rendered.forEach(({pane, pairs}) => {
        const hits = pairs.filter(p => group.some(g => g.quad.equals(p.quad)));
        pane.highlight(hits.flatMap(termRanges), cls, {scroll: hoveredPane !== pane});
      });
    };
    // ctrl/cmd-click freezes what is under the mouse and scrolls every pane
    // to its counterpart; clicking the frozen thing again releases it.  (On
    // a Mac ctrl-click is the context menu, so cmd is the Mac spelling --
    // which is what every IDE does, for the same reason.)
    const freeze = (group, pane) => evt => {
      if (!isPinGesture(evt))
        return false;            // an ordinary click: let the editor have it
      if (HighlightMode.frozen() && HighlightMode.pinned === group) {
        HighlightMode.unpin();
        wipe();
        showDefault();
        return true;
      }
      HighlightMode.pin(group);
      show(group, null, true);   // no hovered pane: every one of them travels
      return true;
    };
    this.materializationPaint = () => {
      if (HighlightMode.frozen())
        show(HighlightMode.pinned, null, true);
      else {
        wipe();
        showDefault();
      }
    };
    // ... from a triple in a result pane
    rendered.forEach(({pane, pairs}) => {
      pane.setHoverRegions(
        pairs.flatMap(p => termRanges(p).map(
          r => ({from: r.from, to: r.to,
                 enter: () => show([p], pane),
                 click: freeze([p], pane)}))),
        clearAll);
    });
    // ... from a constraint in the output schema: one constraint can have
    // synthesized many triples (a repeated or nested constraint)
    const allPairs = rendered.flatMap(({pairs}) => pairs);
    const bySchema = new Map();
    allPairs.filter(p => p.schema).forEach(p => {
      const key = p.schema.from + "-" + p.schema.to;
      if (!bySchema.has(key))
        bySchema.set(key, []);
      bySchema.get(key).push(p);
    });
    schemaPane.setHoverRegions(
      [...bySchema.values()].flatMap(group =>
        (group[0].schemaParts || [group[0].schema]).map(
          r => ({from: r.from, to: r.to,
                 enter: () => show(group, schemaPane),
                 click: freeze(group, schemaPane)}))),
      clearAll);
    // ... and from a variable in the bindings/statics panes
    const varHovers = (pane, cache, wantStatics) => {
      if (!pane)
        return;
      const text = cache.selection.val();
      const regions = [];
      const byVariable = new Map();
      allPairs.filter(p => p.statics === wantStatics).forEach(p => p.variables.forEach(v => {
        if (!byVariable.has(v))
          byVariable.set(v, []);
        byVariable.get(v).push(p);
      }));
      const origins = wantStatics ? null : this.bindingOrigins;
      byVariable.forEach((group, variable) => {
        if (origins) {
          // one region per place this binding was written, standing for
          // every frame that reads it -- a binding distributed across
          // repeated groups is one piece of text and several frames
          const byPath = new Map();
          origins.forEach((frameOrigin, frame) => {
            const path = frameOrigin && frameOrigin[variable];
            if (!path)
              return;
            const key = path.join(" ");
            if (!byPath.has(key))
              byPath.set(key, {path, frames: new Set()});
            byPath.get(key).frames.add(frame);
          });
          if (byPath.size > 0) {
            byPath.forEach(({path, frames}) => {
              const forFrames = group.filter(p => frames.has(p.frame));
              const forThis = forFrames.length ? forFrames : group;
              this.bindingRangesAt(text, path).forEach(r =>
                regions.push({from: r.from, to: r.to,
                              enter: () => show(forThis, pane),
                              click: freeze(forThis, pane)}));
            });
            return;
          }
        }
        this.variableRanges(text, variable, null).forEach((r, occurrence) => {
          // an occurrence highlights the triples of the frame it belongs to
          // when the frames line up one-to-one with the occurrences
          const forFrame = group.filter(p => p.frame === occurrence);
          const forThis = forFrame.length ? forFrame : group;
          regions.push({from: r.from, to: r.to,
                        enter: () => show(forThis, pane),
                        click: freeze(forThis, pane)});
        });
      });
      pane.setHoverRegions(regions, clearAll);
    };
    varHovers(bindingsPane, this.Caches.bindings, false);
    varHovers(staticsPane, this.Caches.statics, true);

    // ...and lead with the focus triple, scrolled into view.  Passing no
    // hovered pane means every one of them scrolls, which is the point: the
    // reader is being shown where this triple is in all three.
    const leading = focus ? allPairs.filter(p => p.quad.equals(focus)) : [];
    if (leading.length) {
      showDefault = () => {
        if (HighlightMode.state !== "off")
          show(leading, null, true);
      };
      showDefault();
    }
    if (!this._materializationRepaintWired) {
      this._materializationRepaintWired = true;
      HighlightMode.onChange(() => {
        if (this.materializationPaint)
          this.materializationPaint();
      });
    }
  },

  addResult (error, result) {
    const div = $("<div/>", {class: "passes"}).append(
      $("<span/>", {class: "shapeMap"}).append(
        "# ",
        $("<span/>", {class: "data"}).text($("#outputShapeMap").val()),
      ));
    // with the editors on, the materialized graph renders in a Turtle pane
    // whose triples hover-link back to the output schema and the bindings.
    // It takes its colours from where it lands, so it lands first.
    // a materialized graph is data -- the app's green -- not a result
    // document like the validation JSON beside it
    const holder = $("<div/>", {class: "data"}).data("rawText", result);
    if (this.editorSupport && "EditorPanes" in ShExWebApp)
      div.append(holder);
    this.resultsWidget.append(div);
    const pane = this.editorSupport && "EditorPanes" in ShExWebApp
          ? ShExWebApp.EditorPanes.makeResultPane(result, "turtle", {colorsFrom: holder[0]})
          : null;
    if (pane) {
      holder.append(pane.dom);
      this.materializationPanes.push({pane, text: result});
      this.resultsWidget.resultPanes.push({pane, ranges: []}); // for generic clearing
    } else {
      div.append($("<pre/>").text(result));
    }
    if (pane)
      this.resultsWidget.fitPaneToWindow(pane.dom);
  },

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
    // an arrow: a class body is strict, so a plain function called as
    // varsIn(...) has no `this`, and the first cell it filled threw
    // "Cannot read properties of undefined (reading 'Caches')" -- which
    // left the table headerless and the pane hidden behind it
    const varsIn = (a) => {
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
            // termToLex wants an RDFJS term; a binding is ShExJ's {value,
            // type?, language?}, and n3ify handed it a Turtle string, which
            // is what "unknown RDFJS node type" was complaining about
            tr.append($("<td/>").text(cols[colI] ? this.Caches.inputData.meta.termToLex(ShExWebApp.ShExTerm.ld2RdfJsTerm(cols[colI])) : "").css("background-color", "#f7f7f7"))
          tbody.append(tr)
        }
      })
    };
    varsIn(Array.isArray(d) ? d : [d])

    vars.forEach(v => {
      thead.append($("<th/>").css("font-size", "small").text(v.substr(v.lastIndexOf("#")+1, 999)))
    })
  },

  tableToBindings () {
    $("#bindings1 div").remove()
    $("#bindings1 textarea").show()
  },
};

ShExPlugins.register({
  id: MAP_ID,
  label: "ShExMap",

  // row 6.  These were in each map page's <style>, which is two copies of
  // three rules and the reason a new pane meant a new page.
  css: [
    "/* a map app has an output panel too, so its inputs may need scrolling */",
    "#inputarea { overflow-x: auto; }",
    "/* and a bindings pane, which is neither schema nor data */",
    "#bindings1 textarea, .meta { background-color: #fffff4; color: #000000; border-color: #56fc1c }",
    "#bindings1 li.selected { background-color: #ffffe8; }",
    "/* the debugger's step buttons, once a session has started */",
    "#debugControls { margin-left: .6em; white-space: nowrap; }",
    "#dbgStatus { display: inline-block; max-width: 100%;",
    "             white-space: normal; overflow-wrap: anywhere; }",
    "/* The thread list goes under the controls rather than in them: there it",
    "   shared a right edge with the bindings pane, so every thread that",
    "   appeared or died changed the width of the block the step buttons sit",
    "   in and moved them out from under the mouse.  Here it grows rightward",
    "   from an edge that doesn't move. */",
    "#dbgThreadsRow { min-height: 1.6em; padding-top: .5em;",
    "                 overflow-x: auto; white-space: nowrap; text-align: left; }",
    "#dbgThreads { font-size: small; }",
  ].join("\n"),

  // rows 1-3.  A pane is a textarea, a status line, a cache that parses
  // what is in it, and the query-string parameter and manifest key that
  // fill it; the app makes all four from this.
  panes: [
    // bindings are a validation product -- the manifests' expectedBindings
    // record them for testing -- so no manifest key writes them
    {name: "bindings", id: "bindings1", kind: "json", editor: "json",
     rows: 19, className: "bindings droparea",
     queryStringParm: "bindings"},
    {name: "statics", id: "staticVars", kind: "json", editor: "json",
     rows: 5, className: "vars droparea",
     queryStringParm: "statics",
     manifest: {key: "staticVars", asYamlObject: true}},
    // a column of its own ("panel"), beside the bindings and statics --
    // the two-column layout the map page had when it was a page
    {name: "outputSchema", id: "outputSchema", kind: "schema", editor: "shexc",
     panel: "output",
     rows: 25, className: "schema droparea",
     queryStringParm: "outSchema",
     manifest: {key: "outputSchema", spillName: "outputSchema.shex"}},
  ],

  // What this runs on: the ShExMap half of the webapp bundle, which hangs
  // Map, StringToRdfJs and NestedTurtleWriter on the ShExWebApp global.  A
  // page that has it already (the worker page loads it for its own reasons)
  // is left alone; any other page fetches it on being told about ShExMap.
  scripts: ["./webpacks/shexmap-webapp.js"],

  // rows 15 and 16.  The worker half: ShExWorkerThread imports this on the
  // app's say-so, and it registers the handler and the materialize request.
  // Named relative to this file, so it is found from whatever page loads it.
  worker: "./ShExMapWorkerThread.js",

  // rows 11 and 14 need somewhere to render: a materialization is a second
  // kind of result, so it gets a tab of its own beside the validation's and
  // a validation no longer wipes what it produced.
  resultsTabs: [{id: MATERIALIZATION_TAB, label: "materialization"}],

  // rows 4 and 5.  The row of controls under the panes: what to do with
  // what is in them, and the one input that isn't a pane.  A button says
  // what it runs and, if it has one, the key that runs it too -- some of
  // these verbs are only a keystroke, and nothing on the page notices when
  // one of those stops working.
  toolbar: [
    {kind: "button", id: "materialize", label: "materialize (ctl-\\)",
     key: {ctrl: true, key: "\\"},
     run: app => app.materialize()},
    {kind: "button", id: "debugMaterialize", label: "\ud83d\udc1e",
     title: "step through materialization (set breakpoints in the output schema's gutter)",
     run: app => app.startDebugSession()},
    // not a pane: a plain input holding "node@shape" pair(s); the node names
    // a graph root to invent, so there's no data to pick it from
    {kind: "input", id: "outputShapeMap",
     className: "schema context-menu-one btn btn-neutral",
     placeholder: "<node>@<shape>",
     title: "output ShapeMap, e.g. <tag:root>@<OutputShape> \u2014 the node names the graph root to create; right-click picks the shape",
     queryStringParm: "output-map", manifest: {key: "outputShapeMap"}},
    {kind: "group", id: "debugControls", hidden: true, controls: [
      {kind: "button", id: "dbgContinue", label: "\u25b6", title: "continue",
       run: app => app.debugStep("continue")},
      {kind: "button", id: "dbgInto", label: "\u2935", title: "step into",
       run: app => app.debugStep("stepInto")},
      {kind: "button", id: "dbgOver", label: "\u23ed", title: "step over",
       run: app => app.debugStep("stepOver")},
      {kind: "button", id: "dbgOut", label: "\u2934", title: "step out",
       run: app => app.debugStep("stepOut")},
      {kind: "button", id: "dbgStop", label: "\u23f9", title: "stop",
       run: app => app.endDebugSession(true)},
    ]},
    // the sentence lives outside #debugControls: hiding the buttons at the
    // end of a session must not take the answer with them
    {kind: "status", id: "dbgStatusRow", className: "valDbgRow", hidden: true,
     contentId: "dbgStatus"},
  ],

  // row 14's other half: what the debugger says while it is stepping.  In
  // the statusbar rather than the toolbar because it grows and shrinks.
  statusbar: [
    {kind: "status", id: "dbgThreadsRow", contentId: "dbgThreads",
     contentTitle: "pending and accepted threads; hover or click to render one's graph"},
  ],

  // row 5's other half: two verbs that are only a keystroke.  The bindings
  // table is the only reader those bindings have that isn't the pane.
  keys: [
    {id: "bindingsToTable", key: {ctrl: true, key: "["}, run: app => app.bindingsToTable()},
    {id: "tableToBindings", key: {ctrl: true, key: "]"}, run: app => app.tableToBindings()},
  ],

  // row 9.  The handler the schema's %Map:{...%} dispatches on, which is
  // what makes a validation produce bindings at all.  Said here, it reaches
  // the validator the same way a module loaded by ?plugin= does.
  register (validator, api) {
    if (typeof api.Map !== "function")
      return; // ShExMap's module is not on this page: nothing to register
    api.Map({rdfjs: RdfJs, Validator: api.Validator}).register(validator, api);
  },

  // What a page has to have for the verbs below to run.  Nothing here is
  // reachable on a page that hasn't loaded ShExMap's module, so this is
  // where that is noticed rather than in the middle of materializing.
  init (app) {
    // Turtle panes rendering materialized graphs: [{pane, text}]
    app.materializationPanes = [];
    if (typeof ShExWebApp.Map !== "function")
      return;
    app.MapModule = ShExWebApp.Map({rdfjs: RdfJs, Validator: ShExWebApp.Validator});
    app.Caches.shapeMap.addContextMenus("#outputShapeMap", app.Caches.outputSchema, {
      // a picked shape replaces only what follows the '@', keeping the
      // invented node; with no node yet, supply the conventional root
      applyChoice: (val, key) => {
        const at = outputMapAtIndex(val);
        return at === -1
          ? (val.trim().length ? val.trim() : "_:root") + "@" + key
          : val.substring(0, at + 1) + key;
      },
      // pop the shape list up under the right edge of the '@'
      menuPosition: ($input, offset) => {
        const val = $input.val();
        const at = outputMapAtIndex(val);
        const y = offset.top + $input.outerHeight();
        if (at === -1)
          return {x: offset.left + 10, y};
        const measure = $("<span/>").css({
          position: "absolute", visibility: "hidden", whiteSpace: "pre",
          fontFamily: $input.css("font-family"), fontSize: $input.css("font-size"),
          fontWeight: $input.css("font-weight"), letterSpacing: $input.css("letter-spacing"),
        }).text(val.substring(0, at + 1)).appendTo("body");
        const atRightEdge = measure.width();
        measure.remove();
        const textStart = parseFloat($input.css("padding-left")) + parseFloat($input.css("border-left-width"));
        const x = offset.left + textStart + atRightEdge - $input[0].scrollLeft;
        return {x: Number.isFinite(x) ? x : offset.left + 10, y}; // measurements NaN where there's no layout
      },
    });
  },

  // row 13.  A validation's bindings are what a materialization consumes,
  // so rendering one fills the bindings pane.  `base` is the renderer the
  // app would otherwise have used, or the one another plugin wrapped.
  results: base => class extends base {
    async entry (entry) {
      await super.entry(entry);
      if (entry.status === "conformant") {
        const resultBindings = ShExWebApp.Util.valToExtension(entry.appinfo, MAP_ID);
        await this.caches.bindings.set(JSON.stringify(resultBindings, null, "  "));
      } else {
        await this.caches.bindings.set("{}");
      }
    }
  },

  /** a validation replaces the bindings a materialization was made from, so
   * its results are no longer about anything: the tab goes */
  onStartingValidation (app) { app.hideMaterialization(); },

  // row 10, and the parts of the app that were only there to reach it.
  // Mixed into the app, so `this` is the app and these read as they did
  // when they were methods on a subclass of it.
  methods: ShExMapVerbs,
});
