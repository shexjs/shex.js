/**
 * Running a validation and saying what came of it: the validate button and
 * the tracker behind it, the query tracker a slurp writes through, the
 * capture-and-replay debugger, and what a failure is reported as.  Mixed
 * onto ShExBaseApp; see ShExBaseApp.js.
 *
 * This is doc/ShExBaseApp-validation.js's source (tsconfig.app.json compiles src/app/ into
 * doc/); edit here and run `npm run build`.
 */

/** What this file adds to the app, declared here since the methods are
 * mixed in rather than written in the class body. */
interface ShExBaseApp {
  /** what the concrete app provides (ShExApp, ShExInWorkerApp): the validator to run */
  // TODO(B1): callValidator passes a renderer too, which no getValidator reads (each makes its own)
  getValidator (loaded: any, base: string, inputData: any, _renderer?: ShExResultsRenderer): DirectShExValidator | RemoteShExValidator;
  fixValidationShapeMapEntry (node: any, shape: any): any;
  startingValidation (): any;
  disableResultsAndValidate (evt?: any): any;
  startValidation (): any;
  endValidation (elapsed: any): any;
  startValidationDebugSession (): Promise<any>;
  matchCaptureLabel (cap: any, schema: any): any;
  captureNodeLex (cap: any): any;
  offeredMatches (): any;
  addValDebugBreakpoint (text: string): void;
  removeValDebugBreakpoint (kind: any, value: any): any;
  renderValDebugBreakpoints (): any;
  toggleBreakpointAtCursor (): boolean;
  pickValidationMatch (captureNo: any): any;
  valDebugStep (command: string): void;
  showValDebugEvent (event: any): any;
  updateValThreadList (): any;
  previewValThread (t: any, label: any): any;
  endValidationDebugSession (): void;
  callValidator (done?: (error?: Error) => void): Promise<any>;
  setDataBase (base: string): string;
  makeQueryTracker (): any;
  startSlurp (): any;
  slurpTurtle (quads: any[]): string;
  reportValidationError (validationError: any, currentAction: any): any;
  makeConsoleTracker (): any;
}

mixin(ShExBaseApp, {
  // abstract getValidator (_validator) { } // overriden for ShExMap

  /**
   * resolve node and shape against input data and schema base and prefixes
   */
  fixValidationShapeMapEntry (node: any, shape: any) {
    return {
      node: this.Caches.inputData.meta.lexToTerm(node),
      shape: this.Caches.inputSchema.meta.lexToTerm(shape) // resolve with this.Caches.outputSchema
    }
  },

  /* Executions */

  // Validation UI
  /** a validation is starting: an app with results derived from the last
   * one says so here.  Nothing to do for a validator. */
  startingValidation () {
    pluginDescriptors().forEach(ext => {
      if (typeof ext.onStartingValidation === "function")
        ext.onStartingValidation(this);
    });
  },

disableResultsAndValidate (evt: any) {
    if (new Date().getTime() - LastFailTime < 100) {
      this.resultsWidget.append(
        $("<div/>").addClass("warning").append(
          $("<h2/>").text("see shape map errors above"),
          $("<button/>").text("validate (ctl-enter)").on("click", this.disableResultsAndValidate.bind(this)),
          " again to continue."
        )
      );
      return; // return if < 100ms since last error.
    }
    // a validation replaces whatever the last one produced, including
    // anything an app derived from it (see ShExMapBaseApp) -- and including
    // a debug session, whose recorded matches belong to the results about to
    // be thrown away.  This is not "continue, ignoring breakpoints": that is
    // ▶, which resumes the recorded match; this re-runs the whole validation
    // and rebuilds the results underneath it.
    this.endValidationDebugSession();
    this.startingValidation();
    this.resultsWidget.clear();
    this.resultsWidget.start();
    // Say what is happening before it starts, and let the browser paint it:
    // a validation over a synchronous neighborhood holds the main thread
    // from here until it is done, so this is the last chance to draw
    // anything.  (Which is also why the elapsed time is reported after
    // rather than counted up during -- see doc/ShExBaseApp.js's
    // startValidation.)
    this.startValidation();
    this.track(new Promise((resolve, reject) => {
      setTimeout(async () => {
        const began = new Date().getTime();
        try {
          const errors = await this.Caches.shapeMap.copyEditMapToQueryMap(); // will update if #editMap is dirty
          if (errors.length === 0)
            resolve(await this.callValidator());
          else
            resolve({shapeMapErrors: errors});   // settled either way: a waiter must not hang on a bad map
        } finally {
          this.endValidation(new Date().getTime() - began);
        }
      }, 0);
    }));
  },

  /** the validate button while a validation is running: it is the only
   * thing that can be said, since nothing will repaint until it finishes */
  startValidation () {
    $("#validate").addClass("running").prop("disabled", true)
      .text("validating\u2026").attr("title", "");
  },

endValidation (elapsed: any) {
    $("#validate").removeClass("running").prop("disabled", false)
      .text(VALIDATE_LABEL)
      .attr("title", "last validation: " + elapsed + " ms");
  },

  /** startValidationDebugSession - step-through debugging of the
   * triple-expression matches in a validation (doc/debugger-design.md):
   * the validation runs to completion with the selected regex engine
   * recording every regexEngine.match() invocation; any of them can then
   * be replayed one NFA event at a time by eval-simple-1err's stepper (a
   * fresh one per match where the selected engine is another), the
   * semantic actions answering from the recording rather than running
   * again.  Gutter breakpoints in the schema pane become constraint
   * breakpoints.  A validation thread's aspects are its position in the
   * state machine, its repeat counts and its matched-triples partition --
   * previewValThread renders them. */
  async startValidationDebugSession () {
    const pane = this.editorSupport && this.editorSupport.panes.inputSchema;
    if (!pane) {
      this.resultsWidget.replace("Enable the language-aware editors (Menu → user interface) to debug validation.")
        .removeClass("passes fails").addClass("error");
      return null;
    }
    this.resultsWidget.clear();
    let currentAction = "starting validation debugger";
    try {
      currentAction = "parsing input schema";
      const schema = await this.Caches.inputSchema.refresh();
      currentAction = "parsing input data";
      const inputData = await this.Caches.inputData.refresh();
      currentAction = "parsing shape map";
      const fixedMap = $("#fixedMap tr").map((idx: any, tr: any) =>
        this.fixValidationShapeMapEntry($(tr).find("input.focus").val(), $(tr).find("input.inputShape").val())
      ).get();
      if (fixedMap.length === 0) {
        this.resultsWidget.replace("Add a node@shape pair to the fixed shape map to debug its validation.")
          .removeClass("passes fails").addClass("error");
        return null;
      }
      currentAction = "validating (recording matches)";
      const schemaText = this.Caches.inputSchema.selection.val();
      const located = ShExWebApp.EditorServices.locateInParsed(schemaText, schema);
      const selected = ShExWebApp[$("#regexpEngine").val()] || ShExWebApp["eval-threaded-nerr"];
      const {module, captures} = ShExWebApp.capturingRegexModule(selected);
      const validator = new ShExWebApp.Validator(schema, inputData, {
        results: "api", regexModule: module,
        ignoreClosed: $("#ignoreClosed").is(":checked"),
      });
      const results = validator.validateShapeMap(fixedMap);
      if (captures.length === 0) {
        this.resultsWidget.replace("This validation never matched a triple expression (nothing to step through).")
          .removeClass("passes fails").addClass("error");
        return null;
      }
      // breakpoints beyond the gutter's: by predicate, and by node (which
      // is which recorded matches to offer)
      const breakpoints = this.valDebugSession && this.valDebugSession.breakpoints
            || {predicates: new Set(), nodes: new Set()};
      this.valDebugSession = {captures, located, pane, schema, results, breakpoints};
      const select = $("#valDbgMatches").empty();
      captures.forEach((cap: any, i: any) =>
        select.append($("<option/>", {value: i}).text(this.matchCaptureLabel(cap, schema))));
      select.off("change").on("change", () => this.pickValidationMatch(parseInt(select.val(), 10)));
      this.renderValDebugBreakpoints();
      // the step buttons, the match picker and the status line are three
      // rows of one control; 🐞 started this session, and pressing it again
      // would only start another over the same results
      $("#valDebugControls, .valDbgRow").show();
      $("#debugValidate").hide();
      this.pickValidationMatch(this.offeredMatches()[0] || 0);
      return this.valDebugSession;
    } catch (e: any) {
      this.reportValidationError(e, currentAction);
      return null;
    }
  },

matchCaptureLabel (cap: any, schema: any) {
    const index = schema._index || {};
    const label = Object.keys(index.shapeExprs || {}).find(l => {
      const decl = index.shapeExprs[l];
      return decl === cap.shape || decl.shapeExpr === cap.shape;
    });
    const node = cap.node.termType === "BlankNode" ? "_:" + cap.node.value : cap.node.value;
    return node + "@" + (label || "?");
  },

  /** the node a recorded match is about, as a breakpoint names it */
  captureNodeLex (cap: any) {
    return cap.node.termType === "BlankNode" ? "_:" + cap.node.value : cap.node.value;
  },

  /** the recorded matches a node breakpoint leaves on offer (all, with
   * none set); the picker shows only these */
  offeredMatches () {
    const session = this.valDebugSession;
    if (!session)
      return [];
    const nodes = session.breakpoints.nodes;
    const offered: any[] = [];
    session.captures.forEach((cap: any, i: any) => {
      const on = nodes.size === 0 || nodes.has(this.captureNodeLex(cap));
      $("#valDbgMatches option[value='" + i + "']").toggle(on);
      if (on)
        offered.push(i);
    });
    return offered;
  },

  /**
   * A breakpoint said in words, as shex-debug takes them: `bp PREDICATE`
   * pauses at every constraint with that predicate, `bn NODE` keeps only
   * the recorded matches on that node.  Prefixed names read against the
   * schema's prefixes (a predicate) or the data's (a node).
   */
  addValDebugBreakpoint (text: any) {
    const session = this.valDebugSession;
    const m = (text || "").trim().match(/^(bp|bn)\s+(\S+)$/);
    if (!session || !m) {
      $("#valDbgStatus").text("a breakpoint is bp PREDICATE or bn NODE");
      return false;
    }
    const [, kind, lex] = m;
    try {
      if (kind === "bp") {
        const iri = this.Caches.inputSchema.meta.lexToTerm(lex);
        session.breakpoints.predicates.add(typeof iri === "string" ? iri : lex);
      } else {
        const term = lex.startsWith("_:") ? lex : this.Caches.inputData.meta.lexToTerm(lex);
        session.breakpoints.nodes.add(typeof term === "string" ? term : lex);
      }
    } catch (e: any) {
      $("#valDbgStatus").text("no such " + (kind === "bp" ? "predicate" : "node") + ": " + e.message);
      return false;
    }
    this.renderValDebugBreakpoints();
    // re-arm, on a match still on offer
    const offered = this.offeredMatches();
    const current = parseInt($("#valDbgMatches").val(), 10);
    this.pickValidationMatch(offered.indexOf(current) === -1 ? (offered[0] || 0) : current);
    return true;
  },

  removeValDebugBreakpoint (kind: any, value: any) {
    const session = this.valDebugSession;
    if (!session)
      return;
    session.breakpoints[kind === "bp" ? "predicates" : "nodes"].delete(value);
    this.renderValDebugBreakpoints();
    const offered = this.offeredMatches();
    const current = parseInt($("#valDbgMatches").val(), 10);
    this.pickValidationMatch(offered.indexOf(current) === -1 ? (offered[0] || 0) : current);
  },

  /** the breakpoints as chips, each with its × */
  renderValDebugBreakpoints () {
    const session = this.valDebugSession;
    const list = $("#valDbgBreakpoints").empty();
    if (!session)
      return;
    const lex = (iri: any, meta: any) => { try { return meta.termToLex(iri); } catch (e: any) { return iri; } };
    [["bp", session.breakpoints.predicates, this.Caches.inputSchema.meta],
     ["bn", session.breakpoints.nodes, this.Caches.inputData.meta]].forEach(([kind, set, meta]) => {
      set.forEach((value: any) => {
        list.append($("<span/>", {class: "dbgBreakpoint", "data-kind": kind, "data-value": value})
                    .text(kind + " " + (typeof value === "string" && !value.startsWith("_:") ? lex(value, meta) : value))
                    .append($("<button/>", {title: "remove this breakpoint"}).text("×")
                            .on("click", () => this.removeValDebugBreakpoint(kind, value))));
      });
    });
  },

  /** ctrl-alt-b: a breakpoint on the constraint at the schema pane's
   * cursor -- for a line that holds several, whose gutter can name only
   * the first */
  toggleBreakpointAtCursor () {
    const pane = this.editorSupport && this.editorSupport.panes.inputSchema;
    if (!pane || !pane.view)
      return false;
    pane.toggleBreakpointAt(pane.view.state.selection.main.head);
    if (this.valDebugSession)   // re-arm, so it counts from here on
      this.pickValidationMatch(parseInt($("#valDbgMatches").val(), 10) || 0);
    return true;
  },

  /** (re)arm the debugger on one recorded match */
  pickValidationMatch (captureNo: any) {
    const session = this.valDebugSession;
    if (!session)
      return null;
    $("#valDbgMatches").val(String(captureNo));
    const cap = session.captures[captureNo];
    // only eval-simple-1err's engine steps: a match another engine ran is
    // replayed by a fresh one over the same inputs
    const stepper = ShExWebApp["eval-simple-1err"];
    const engine = cap.regexModule === stepper.name ? cap.engine
          : stepper.compile(session.schema, cap.shape, session.schema._index);
    const dbg = new ShExWebApp.MatchDebugger(engine, cap.node, cap.constraintToTripleMapping,
                                             ShExWebApp.replayingSemActHandler(cap.semActLog, cap.semActHandler));
    // A breakpoint set in the gutter sits at its line's start and means
    // the first constraint the line *begins* -- not one that started
    // above and continues across it -- falling back to whatever the line
    // is inside of where it begins none.  One set at a position (ctrl-alt-b)
    // means the constraint there.
    const schemaText = this.Caches.inputSchema.selection.val();
    const lineStarts = ShExWebApp.EditorServices.lineOffsets(schemaText);
    session.pane.listBreakpoints().forEach((pos: any) => {
      const next = lineStarts.findIndex((start: any) => start > pos);
      const lineFrom = lineStarts[(next === -1 ? lineStarts.length : next) - 1];
      const lineEnd = next === -1 ? schemaText.length : lineStarts[next];
      let hit = null;
      if (pos === lineFrom) {
        hit = session.located.locate.exprsStartingIn(lineFrom, lineEnd)[0] || null;
        for (let offset = lineFrom; offset < lineEnd && !hit; ++offset)
          hit = session.located.locate.exprAt(offset);
      } else {
        hit = session.located.locate.exprAt(pos);
      }
      if (hit)
        dbg.addBreakpoint({tc: hit.expr});
    });
    session.breakpoints.predicates.forEach((predicate: any) => dbg.addBreakpoint({predicate}));
    session.dbg = dbg;
    session.capture = cap;
    $("#valDbgStatus").text("paused before matching " + $("#valDbgMatches option:selected").text() +
                            "; step or continue" +
                            (cap.regexModule === stepper.name ? ""
                             : " (captured with " + cap.regexModule + ", replayed with " + stepper.name + ")"));
    $("#valDbgThreads").empty();
    return dbg;
  },

valDebugStep (command: any) {
    const session = this.valDebugSession;
    if (!session || !session.dbg)
      return null;
    const event = session.dbg[command]();
    this.showValDebugEvent(event);
    this.updateValThreadList();
    return event;
  },

showValDebugEvent (event: any) {
    const session = this.valDebugSession;
    if (!event || !session)
      return;
    const threadStr = event.thread
          ? " [state:" + event.thread.stateNo +
            " matched:" + event.thread.matched.reduce((n: any, m: any) => n + m.triples.length, 0) +
            (Object.keys(event.thread.repeats).length
             ? " repeats:" + JSON.stringify(event.thread.repeats) : "") + "]"
          : "";
    const gen = "generation" in event ? " gen:" + event.generation : "";
    switch (event.type) {
    case "constraint": {
      $("#valDbgStatus").text("at <" + event.tc.predicate + ">" + gen + threadStr);
      const range = session.located.locate.expr(event.tc);
      session.pane.highlight(range ? [range] : [], "shexjs-debug-current");
      break;
    }
    case "fail":
      $("#valDbgStatus").text("thread died at <" + event.tc.predicate + ">" + gen + threadStr);
      break;
    case "accept":
      $("#valDbgStatus").text("thread accepted" + gen + threadStr);
      break;
    case "done":
      $("#valDbgStatus").text("match finished: " +
        (session.dbg.result && !("errors" in session.dbg.result) ? "matched" : "failed") +
        "; pick another match or ⏹");
      session.pane.clearHighlights();
      break;
    case "error":
      $("#valDbgStatus").text("failed: " + event.error.message);
      break;
    }
  },

  /** the debugger's threads pane: this generation's threads (• = already
   * advanced into the next); hover or click renders a thread's aspects */
  updateValThreadList () {
    const session = this.valDebugSession;
    const list = $("#valDbgThreads").empty();
    if (!session || !session.dbg)
      return;
    session.dbg.threads().forEach((t: any) => {
      const label = (t.next ? "advanced" : "current") + " thread at state " + t.stateNo +
            (t.tc ? " <" + t.tc.predicate + ">" : " (" + t.at + ")");
      list.append($("<button/>", {class: "dbgThread", title: label + " -- click for its state"})
                  .text((t.next ? "•" : "") + "s" + t.stateNo)
                  .on("mouseenter click", () => this.previewValThread(t, label)));
    });
  },

  /** the aspects specific to a validation thread: position in the state
   * machine (highlighted in the schema pane), repeat counts, and the
   * partition of matched triples (highlighted in the data pane, and
   * listed) */
  previewValThread (t: any, label: any) {
    const session = this.valDebugSession;
    if (!session)
      return;
    if (t.tc) {
      const range = session.located.locate.expr(t.tc);
      session.pane.highlight(range ? [range] : [], "shexjs-debug-current");
    }
    const dataPane = this.editorSupport && this.editorSupport.panes.inputData;
    if (dataPane) {
      const located = this.editorSupport!.locateData(this.Caches.inputData.selection.val());
      const ranges = !located ? [] : t.matched.flatMap((m: any) => m.quads || [])
            .map((q: any) => ShExWebApp.EditorServices.quadRanges(located, q))
            .filter((a: any) => a)
            .flatMap((a: any) => [a.object, a.subject, a.predicate].filter(r => r));
      dataPane.highlight(ranges, "shexjs-debug-current");
    }
    // ...and a table of the rest: where it is, its repeat counts, the
    // partition it has committed to, constraint by constraint
    const lex = (iri: any) => { try { return this.Caches.inputSchema.meta.termToLex(iri); } catch (e: any) { return "<" + iri + ">"; } };
    const row = (th: any, td: any) => $("<tr/>").append($("<th/>").text(th), $("<td/>").text(td));
    const table = $("<table/>", {class: "dbgThreadState"}).append($("<caption/>").text(label));
    table.append(row("state", "s" + t.stateNo + " " + (t.tc ? lex(t.tc.predicate) : "(" + t.at + ")")));
    if (Object.keys(t.repeats).length)
      table.append(row("repeats", Object.entries(t.repeats).map(([s, n]) => "s" + s + "×" + n).join(", ")));
    table.append($("<tr/>").append($("<th/>", {colspan: 2}).text(
      "matched partition" + (t.matched.length === 0 ? " (empty)" : ""))));
    t.matched.forEach((m: any) => m.triples.forEach((tr: any, i: any) =>
      table.append(row(i === 0 ? lex(m.predicate) : "", tr))));
    if (t.errors)
      table.append(row("errors", String(t.errors)));
    $("#results div").empty();
    $("#results > .status").text("validation thread").show();
    this.resultsWidget.append(table);
  },

endValidationDebugSession () {
    const session = this.valDebugSession;
    if (!session)
      return;
    this.valDebugSession = null;
    session.pane.clearHighlights();
    if (this.editorSupport && this.editorSupport.panes.inputData)
      this.editorSupport.panes.inputData.clearHighlights();
    $("#valDebugControls, .valDbgRow").hide();
    $("#debugValidate").show();
    $("#valDbgStatus").text("");
    $("#valDbgThreads, #valDbgBreakpoints").empty();
    $("#valDbgMatches option").show();
  },

async callValidator (done: any) {
    $("#fixedMap .pair").removeClass("passes fails");
    $("#results > .status").hide();
    let currentAction = "parsing input schema";
    try {
      await this.Caches.inputSchema.refresh(); // @@ throw away parser stack?
      $("#schemaDialect").text(this.Caches.inputSchema.language);
      if (hasFocusNode()) {
        currentAction = "parsing input data";
        $("#results > .status").text("parsing data...").show();
        let inputData = await this.Caches.inputData.refresh(); // need prefixes for ShapeMap
        // $("#shapeMap-tabs").tabs("option", "active", 2); // select fixedMap
        currentAction = "parsing shape map";
        const fixedMap = $("#fixedMap tr").map((idx: any, tr: any) =>
          this.fixValidationShapeMapEntry($(tr).find("input.focus").val(), $(tr).find("input.inputShape").val())
        ).get();
        // What records this validation's fetches, or nothing when it is not
        // being recorded -- said on every validation, since a db is built
        // around whichever it was and the last slurp's tracker would go on
        // writing into a writer that closed when that validation finished.
        const wasTracking = !!this.queryTrackerController.queryTracker;
        this.queryTrackerController.queryTracker = this.makeQueryTracker();
        if (this.neighborhoods.slurping()) {
          // Start the Turtle document over: what this validation fetches is
          // what it should end up holding, and it is written as it arrives.
          this.neighborhoods.setLocalTurtle(this.startSlurp());
        }
        if (wasTracking !== !!this.queryTrackerController.queryTracker) {
          // the db was built around the other answer
          this.Caches.inputData.dirty(true);
          inputData = await this.Caches.inputData.refresh();
        }

        currentAction = "creating validator";
        $("#results > .status").text("creating validator...").show();
        try {
          // shex-node loads IMPORTs and tests the schema for structural faults.
          const alreadLoaded = {
            schema: await this.Caches.inputSchema.refresh(),
            url: this.Caches.inputSchema.url || DefaultBase
          };
          const loaded = await ShExLoader.load({shexc: [alreadLoaded]}, null, {
            collisionPolicy: (type: any, left: any, right: any) => {
              const lStr = JSON.stringify(left);
              const rStr = JSON.stringify(right);
              if (lStr === rStr)
                return false; // keep left/old assignment
              throw new Error(`Conflicing definitions: ${lStr} !== ${rStr}`);
            },
            skipCycleCheck: $("#skipCycleCheck").is(":checked"),
          });
          let time;
          loaded.schema = this.extendSchema(loaded.schema);
          const validator = this.getValidator(loaded, alreadLoaded.url, inputData, this.makeRenderer());

          // Some DBs need to be able to inspect the schema to calculate the neighborhood.
          if ("setSchema" in inputData)
            inputData.setSchema(loaded.schema);

          currentAction = "validating";
          $("#results > .status").text("validating...").show();
          time = new Date();
          const validationTracker = LOG_PROGRESS ? this.makeConsoleTracker() : undefined; // undefined to trigger default parameter assignment

          // invoke can throw an asynchronous error. Using .catch instead of await so callValidator is usefully async.
          return validator.invoke(fixedMap, validationTracker, time, done, currentAction)
            .catch(e => this.reportValidationError(e, currentAction));
        } catch (e: any) {
          return this.reportValidationError(e, currentAction);
        }
      } else {
        const outputLanguage = this.Caches.inputSchema.language === "ShExJ" ? "ShExC" : "ShExJ";
        $("#results > .status").
          text("parsed "+this.Caches.inputSchema.language+" schema, generated "+outputLanguage+" ").
          append($("<button>(copy to input)</button>").
                 css("border-radius", ".5em").
                 on("click", async () => {
                   await this.Caches.inputSchema.set($("#results div").text(), DefaultBase);
                 })).
          append(":").
          show();
        let parsedSchema;
        if (this.Caches.inputSchema.language === "ShExJ") {
          const opts = {
            simplifyParentheses: false,
            base: this.Caches.inputSchema.meta.base,
            prefixes: this.Caches.inputSchema.meta.prefixes
          }
          new ShExWebApp.Writer(opts).writeSchema(this.Caches.inputSchema.parsed, (error: any, text: any) => {
            if (error) {
              $("#results > .status").text("unwritable ShExJ schema:\n" + error).show();
              // res.addClass("error");
            } else {
              this.resultsWidget.append($("<pre/>").text(text).addClass("passes"));
            }
          });
        } else {
          const pre = $("<pre/>");
          pre.text(JSON.stringify(ShExWebApp.Util.AStoShExJ(ShExWebApp.Util.canonicalize(this.Caches.inputSchema.parsed)), null, "  ")).addClass("passes");
          this.resultsWidget.append(pre);
        }
        this.resultsWidget.finish();
        return { transformation: {
          from: this.Caches.inputSchema.language,
          to: outputLanguage
        } }
      }
    } catch (e: any) {
      this.resultsWidget.failMessage(e, currentAction); // decides console policy
      return { inputError: e };
    }

    function hasFocusNode () {
      return $(".focus").map((idx: any, elt: any) => {
        return $(elt).val();
      }).get().some((str: any) => {
        return str.length > 0;
      });
    }
  },

  /**
   * What records the triples a validation fetches, or null when nothing is
   * being recorded.  The caller hangs it on the controller the data cache
   * reads, which is what makes the db it builds next report what it fetches.
   *
   * One line per request, written when the answer arrives rather than
   * half-written when the question goes out: an asynchronous walk has
   * several in flight, and a line opened by one request and closed by
   * another's answer said the wrong thing about both -- and left the
   * document unparseable where a `# → …` ran into the next one.  The
   * triples that came back go directly under the line about them, so the
   * document reads as the walk in order.
   *
   * A db hands `start` a token and hands it back with the answer, which is
   * what pairs the two; the worker mints its own, since it is the thread
   * that has to say which answer is which when it posts them over.
   */
  /** The base the data pane's documents are written against, when it is not
   * the URL they came from (?data-base=, a manifest entry's `dataBase`).
   * Sticky: documents come and go in that pane and this outlasts them. */
  setDataBase (base: any) {
    this.dataBase = base || "";
    const cache = this.Caches.inputData;
    cache.baseOverride = this.dataBase;
    if (this.dataBase)
      cache.meta.base = this.dataBase;
    // ...and no dirty bit: the document that arrives with it marks the pane
    // dirty itself, and asking for a re-parse here would rebuild the db in
    // the middle of a manifest entry's settings being delivered -- for a
    // source that fetches, that is a round trip for nothing, and it lands
    // between the source being named and its endpoint arriving
    return this.dataBase;
  },

makeQueryTracker () {
    if (!this.neighborhoods.slurping())
      return null;
    const asked = new Map();
    let minted = 0;
    const said = (token: any, tail: any) => {
      const about = asked.get(token) || {arrow: "→", what: "(untracked request)"};
      asked.delete(token);
      this.neighborhoods.appendToLocalTurtle("# " + about.arrow + " " + about.what + " " + tail);
    };
    return {
      // a db reports in RDF/JS terms and quads (DbQueryTracker); what
      // comes back from the worker is marshalled JSON, and is turned back
      // into these at that boundary (RemoteShExValidator's startQuery)
      start: (isIncoming: any, term: any, shapeLabel: any, token: any) => {
        const id = token === undefined ? ++minted : token;
        asked.set(id, {
          arrow: isIncoming ? "←" : "→",
          // lexed now, while the term is in hand and the base is the one
          // the header declared
          what: this.Caches.inputData.meta.termToLex(term)
            + "@" + this.Caches.inputSchema.meta.termToLex(shapeLabel),
        });
        return id;
      },
      end: (triples: any, time: any, token: any) => {
        said(token, triples.length + " triples (" + time + " ms)\n"
             + this.slurpTurtle(triples));
      },
      // a request that timed out, was refused, or asked for a page that
      // isn't there: the walk stops, and this is the line that says where
      fail: (error: any, time: any, token: any) => {
        const why = String((error && error.message) || error).split("\n")[0];
        said(token, "nothing back after " + time + " ms: " + why + "\n");
      },
    };
  },

  /**
   * Where a slurp writes, before anything has come back.
   *
   * The base its triples are written against -- so a Wikidata entity reads
   * as <Q42> rather than as forty characters of URL -- then what this
   * document is, then the prefixes.  Those are the schema's: a validation is
   * about one schema, and its names are the ones the reader has just been
   * reading.  All of it up front, so that a document being filled a line at
   * a time is Turtle from the first line down.
   */
  startSlurp () {
    const prefixes = this.Caches.inputSchema.meta.prefixes || {};
    // what the per-response writer will declare, so it can be taken off
    // again: N3 says the prefixes it was given every time it is ended
    this.slurpPrefixes = "";
    new RdfJs.Writer({prefixes}).end((e: any, text: any) => { this.slurpPrefixes = text || ""; });
    // what was asked for (?data-base=), not whatever URL the pane's last
    // document came from: this is declared in the document, and only a
    // declared base may be written relative to
    const base = this.dataBase;
    return (base ? "BASE <" + base + ">\n\n" : "")
      + "# slurped\n"
      + Object.keys(prefixes).map(p => "PREFIX " + p + ": <" + prefixes[p] + ">\n").join("")
      + "\n";
  },

  /**
   * One response's triples, to sit under the line about it.
   *
   * Turtle, with the prefixes the header has already declared and IRIs
   * written against the base it declared.  Relativized here rather than by
   * handing the writer a base, which would relativize the predicates too
   * (`<../prop/P1748>` where `p:P1748` is what anyone would write).
   */
  slurpTurtle (quads: any) {
    if (quads.length === 0)
      return "";
    const base = this.dataBase;
    const factory = RdfJs.DataFactory;
    const under = (term: any) => term.termType === "NamedNode" && base && term.value.startsWith(base)
          ? factory.namedNode(term.value.substring(base.length))
          : term;
    const writer = new RdfJs.Writer({prefixes: this.Caches.inputSchema.meta.prefixes});
    writer.addQuads(quads.map(
      (q: any) => factory.quad(under(q.subject), under(q.predicate), under(q.object))));
    let text = "";
    writer.end((e: any, out: any) => { text = out || ""; }); // a writer with no stream answers here
    return this.slurpPrefixes && text.startsWith(this.slurpPrefixes)
      ? text.substring(this.slurpPrefixes.length)
      : text;
  },

reportValidationError (validationError: any, currentAction: any) {
    if (validationError instanceof FlowControlError)
      return { validationError };
    $("#results > .status").text("validation errors:").show();
    this.resultsWidget.failMessage(validationError, currentAction);
    return { validationError };
  },

makeConsoleTracker () {
    function padding (depth: number) { return (new Array(depth + 1)).join("  "); } // AKA "  ".repeat(depth)
    // an arrow: as a nested function its `this` was undefined, so the trace
    // threw on its first line whenever LOG_PROGRESS was on
    const sm = (node: any, shape: any) =>
      `${this.Caches.inputData.meta.termToLex(node)}@${this.Caches.inputSchema.meta.termToLex(shape)}`;
    const logger = {
      recurse: (x: any) => { console.log(`${padding(logger.depth)}↻ ${sm(x.node, x.shape)}`); return x; },
      known: (x: any) => { console.log(`${padding(logger.depth)}↵ ${sm(x.node, x.shape)}`); return x; },
      enter: (point: any, label: any) => { console.log(`${padding(logger.depth)}→ ${sm(point, label)}`); ++logger.depth; },
      exit: (point: any, label: any, ret: any) => { --logger.depth; console.log(`${padding(logger.depth)}← ${sm(point, label)}`); },
      depth: 0
    };
    return logger;
  },
});
