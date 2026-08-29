/**
 * The app: one object over the page, constructed by shex-simple.html and
 * extended by ShExApp (manifests) and ShExInWorkerApp (validation in a
 * worker).  This file holds what it is -- the caches it owns, its
 * controls, its key handlers -- and the files beside it add what it does,
 * one concern each: ShExBaseApp-plugins.js hosts plugins,
 * ShExBaseApp-validation.js runs and reports a validation,
 * ShExBaseApp-links.js reads and writes the query string and gists, and
 * ShExBaseApp-layout.js lays the page out.  Each is a mixin (ShExAppCommon.js)
 * onto this class, so `this` is the app in all of them and a method calls
 * another as it always did.
 *
 * This is doc/ShExBaseApp.js's source (tsconfig.app.json compiles src/app/ into
 * doc/); edit here and run `npm run build`.
 */

const ShExLoader = ShExWebApp.Loader({
  fetch: window.fetch.bind(window), rdfjs: RdfJs, jsonld: null
})

/** an input a URL can fill: its query parameter, where its value lives
 * (a jQuery selection, or a stand-in with val()), and what else the app
 * knows about it */
interface AppInput {
  queryStringParm: string;
  location: any;
  cache?: InterfaceCache;            // the pane it fills, where it is a document
  deflt?: string;
  manifest?: any;                    // how it corresponds to a manifest entry (see the constructor)
  normalize?: (v: string) => string; // bring a value into the range its control accepts
  earlyLoad?: boolean;               // loaded before the list is walked (plugins)
  fail?: (e: any) => void;           // told when its value could not be set (loadSearchParameters)
  // TODO(B1): read by the load dialog's prefill but never assigned on an input
  url?: string;
}

/** answers a keydown it recognizes with true; a plugin's is tagged with
 * the plugin, so unloading it takes the handler away (bindPluginKeys) */
type KeyDownHandler = ((e: any, code?: number) => boolean) & {plugin?: string};

class ShExBaseApp {
  base: string;                      // the page's URL, for relative references
  resultsTargetSel: string;          // where this app's results are written (a selector)
  paneHomes: {[name: string]: any};  // where a pane a screen borrowed came from, so it can go back
  resultsWidget: ResultsWidget;
  shexcParser: ShExCParser;
  turtleParser: TurtleParser;
  queryTrackerController: {queryTracker: any};   // the tracker a slurp writes through, when one is on
  Caches: AppCaches;
  neighborhoods: NeighborhoodConfig;
  Getables: AppInput[];              // the inputs a URL can fill
  QueryParams: AppInput[];           // ...and every query parameter, those first
  keyDownHandlers: KeyDownHandler[];
  inFlight: Set<Promise<any>>;       // what the app has started and not finished (track)
  settledPromise: Promise<any>;
  editorSupport?: EditorSupport | null;   // the editors over the textareas, while they are on
  dataBase?: string;                 // ?data-base=: what the data is written against
  loadedGist?: any;                  // the gist a permalink loaded, for updateGist
  valDebugSession?: any;             // the validation debug session, while one runs
  screenTabsLive?: boolean;          // the screen tabs are wired
  slurpPrefixes?: string;            // the prefix block a slurp wrote, to strip from later chunks
  /** whether this app validates in a worker: a plugin with a worker half
   * has one thing to do here and another there */
  get remote (): boolean { return false; }

  /** where this app's results are written.  A plugin with results of its
   * own puts them in a tab beside these, and this becomes the first of
   * them (buildPluginResultsTabs). */
  get resultsTarget (): string { return this.resultsTargetSel; }

constructor (base: string) {
    this.base = base;
    this.resultsTargetSel = "#results > div";
    // where a pane a screen borrowed came from, so it can go back
    this.paneHomes = {};
    this.resultsWidget = new ResultsWidget(this.resultsTarget);

    // make parser/serializers available to extending classes
    this.shexcParser = new ShExCParser();
    this.turtleParser = new TurtleParser();
    this.queryTrackerController = { queryTracker: null };

    const inputSchema = new SchemaCache($("#inputSchema textarea.schema"), this.onDataLoad.bind(this), this.shexcParser, this.turtleParser);
    const inputData = new TurtleCache($("#inputData textarea"), this.onDataLoad.bind(this), this.turtleParser, this.queryTrackerController);
    const plugin = new PluginCache($("#pluginDrop"), this.resultsWidget);
    const shapeMap = new ShapeMapCache($("#queryMap"), {inputSchema, inputData}, this.turtleParser, this.resultsWidget);

    this.Caches = { inputSchema, inputData, plugin, shapeMap };

    // where the data comes from, and the configuration that source asks for
    this.neighborhoods = new NeighborhoodConfig(
      ShExWebApp.NeighborhoodModules, inputData.selection,
      changed => {
        inputData.dirty(true);
        if (changed && changed.language)
          this.refreshDataPaneEditor();
        // the results' data ranges belong to whichever document is showing
        if (this.editorSupport)
          this.editorSupport.reaimAtShowingDocument();
      },
      () => {
        const pane = this.editorSupport && this.editorSupport.panes.inputData;
        if (pane)
          pane.requestMeasure();
      });
    inputData.neighborhoods = this.neighborhoods;
    // normalize: bring a query parameter's value into the range its control
    // accepts, so a permalink can say what a reader would write.
    // manifest: how this input corresponds to a manifest entry: key (the
    // entry key; long text may spill to a gist file named spillName,
    // referenced as <key>URL), labelKey/label (an accompanying label line),
    // asYamlObject (the entry holds a YAML mapping where the input holds JSON
    // text). No manifest: no correspondence (controls, testing-only inputs).
    this.Getables = [
      {queryStringParm: "schema",       location: this.Caches.inputSchema.selection, cache: this.Caches.inputSchema,
       manifest: {key: "schema", spillName: "schema.shex", labelKey: "schemaLabel", label: "schema"}},
      {queryStringParm: "data",         location: this.Caches.inputData.selection,   cache: this.Caches.inputData,
       manifest: {key: "data", spillName: "data.ttl", labelKey: "dataLabel", label: "data"}},
      // earlyLoad: what a plugin adds may itself be a query parameter,
      // so it is loaded before this list is walked rather than in it
      {queryStringParm: "plugin",       location: this.Caches.plugin.selection,      cache: this.Caches.plugin,
       earlyLoad: true},
      {queryStringParm: "shape-map",    location: $("#queryMap"),                     cache: this.Caches.shapeMap,
       manifest: {key: "queryMap", spillName: "queryMap.qm"}},
    ];
    this.QueryParams = this.Getables.concat([
      {queryStringParm: "interface",    location: $("#interface"),       deflt: "human"     },
      {queryStringParm: "success",      location: $("#success"),         deflt: "proof"     },
      // how a term is written in a message: as the document the reader is
      // being pointed at writes it, or in full (see mapValidationErrors)
      {queryStringParm: "spelling",     location: $("#spelling"),        deflt: "document"  },
      // an entry may ask for an engine: the thorough one enumerates every
      // way a shape could match, which some real data makes impractical
      {queryStringParm: "regexpEngine", location: $("#regexpEngine"),    deflt: "eval-threaded-nerr",
       manifest: {key: "regexpEngine"} },
      // The editors are what the app is, so the parameter is the way to
      // ask for what it isn't: ?editors=textarea.  The words that used to
      // turn them off mean that now, and the ones that turned them on mean
      // the default and ride free -- ?editors=1 was in every link anyone
      // wrote when they were the thing you had to ask for.
      {queryStringParm: "editors",      location: $("#editors"),         deflt: "",
       normalize: v => /^(textarea|textareas|plain|0|false|no|off)$/i.test(v)
                       ? "textarea" : ""},
      // which screen is up (a plugin's id; empty is the validator's own).
      // Plugins load before this list is walked, so their screens exist by
      // the time a permalink's choice arrives; a name no loaded plugin
      // answers to quietly means the validator, since there is nothing to
      // switch to.  start() shows what this lands on.
      {queryStringParm: "screen",       location: $("#screen"),          deflt: "",
       normalize: v => $("#screenTabs button").filter((i: any, b: any) => $(b).attr("data-screen") === v).length
                       ? v : ""},
      // The data source and whatever it wants configured.  A parameter is
      // named for what it means, not for the module that declares it, so a
      // manifest entry or a permalink says `neighborhood=sparql&endpoint=…`
      // and two sources that both take an `endpoint` agree about the word.
    ]).concat(this.neighborhoods.queryParams()).concat([
      // What the data is written against: relative IRIs in the data pane
      // resolve against it, terms are written back relative to it (a
      // Wikidata entity as <Q42> rather than as forty characters of URL),
      // and a slurp declares it at the top of what it collects.  A document
      // loaded from a URL is written against that URL; this is for data that
      // comes from somewhere without one -- an endpoint's answers, a
      // Wikibase's pages -- and for saying otherwise.
      //
      // Last, after the source it is about: these are delivered in order,
      // and a query map that asks the source a question (SPARQL, QENTITIES)
      // is resolved as soon as the source is named, so anything the source
      // needs has to be there before this list moves on.
      {queryStringParm: "data-base",    deflt: "",  manifest: {key: "dataBase"},
       location: {
         val: (v: any) => v === undefined ? (this.dataBase || "") : this.setDataBase(v),
         prop: () => undefined,
       }},
    ]);
    this.keyDownHandlers = [
      this.validateKeyDown.bind(this),
      this.navigateManifestKeyDown.bind(this),
      // ctrl-alt-b: a breakpoint on the constraint at the schema pane's cursor
      (e) => {
        if (!((e.ctrlKey || e.metaKey) && e.altKey && (e.key === "b" || e.key === "B" || e.code === "KeyB")))
          return false;
        return this.toggleBreakpointAtCursor();
      },
    ];

    ShExWebApp.ShapeMap.Start = ShExWebApp.Validator.Start;
    // what registered before this app existed, and whatever registers after
    // it: a plugin loaded by URL reaches the same code as one the page
    // loaded as a script
    pluginDescriptors().forEach(ext => this.applyPlugin(ext));
    if (typeof ShExPlugins !== "undefined")
      ShExPlugins.onRegister(ext => this.applyPlugin(ext));
    // what the app has started and not finished: see track()
    this.inFlight = new Set();
    this.settledPromise = Promise.resolve();
  }

  /**
   * Something the app has started -- a validation, a load, a plugin's verb
   * -- whose finishing anyone may wait for.  Every handler that starts
   * asynchronous work hands its promise here, and `settled()` is the one
   * place to wait on it, which is what lets a test click and then await
   * without knowing which handler the click reached.  A verb that starts
   * work it does not itself await (ShExMap's materialize hands over the
   * materialization, not the click) tracks that work explicitly.
   */
  track (promise: any): Promise<any> {
    const p = Promise.resolve(promise);
    this.inFlight.add(p);
    const done = () => this.inFlight.delete(p);
    p.then(done, done);
    // a new promise each time something starts, so a waiter can tell that
    // it did; it answers with the newest thing's value once everything in
    // flight is over, and rejects the way that thing rejected
    this.settledPromise = Promise.allSettled([...this.inFlight]).then(() => p);
    return p;
  }

  /** everything the app has started, finished: the promise of the most
   * recently tracked action, after all in flight have settled */
  settled (): Promise<any> {
    return this.settledPromise;
  }

async start (): Promise<void> {
    SharedForTests = {Caches: this.Caches, neighborhoods: this.neighborhoods, app: this,
                      HighlightMode, isPinGesture, PIN_WITH_META}
    // `shared.promise` in a test is the app's settled(); writing to it tracks
    Object.defineProperty(SharedForTests, "promise", {
      get: () => this.settled(), set: p => this.track(p), enumerable: true});
    this.neighborhoods.init(); // before ?neighborhood=… reaches the picklist
    this.prepareControls();
    this.prepareResultsGrip();
    const dndPromise = this.prepareDragAndDrop(); // async 'cause it calls Cache.X.set("")
    const loads = this.loadSearchParameters();
    const ready = Promise.all([ dndPromise, loads ]).then(resolved => {
      this.setEditors(); // after ?editors=... has reached the menu select
      // ...and after the editors exist, so the screen's panes can measure
      this.showScreen(this.currentScreen());
      return resolved;
    });
    if ('_testCallback' in window) {
      this.track(ready.then(ab => ({drop: ab[0], loads: ab[1]})));
      (window as any)._testCallback(SharedForTests);
    }
    ready.then(resolves => {
      if (!('_testCallback' in window))
        console.log('search parameters:', resolves[1]);
      // Update UI to say we're done loading everything?
    }, e => {
      console.error(e);
      // Drop catch on the floor presuming thrower updated the UI.
    });
  }

onDataLoad (): void {
    this.Caches.shapeMap.markEditMapDirty();
  }

  /* UI setup */
  /**
   * set up UI buttons handlers
   */
  prepareControls (): void {
    // re-log a just-created gist's address: the post-create navigation
    // cleared the console it was first printed to
    try {
      const gistTrace = sessionStorage.getItem(GIST_CREATED_KEY);
      if (gistTrace) {
        sessionStorage.removeItem(GIST_CREATED_KEY);
        console.log(gistTrace);
      }
    } catch (e: any) { /* private mode */ }
    $("#menu-button").on("click", this.toggleControls.bind(this));
    HighlightMode.wire();   // the chip, ctrl-alt-h, and the momentary key
    $("#interface").on("change", this.setInterface.bind(this));
    $("#success").on("change", this.setInterface.bind(this));
    $("#regexpEngine").on("change", this.toggleControls.bind(this));
    $("#editors").on("change", () => this.setEditors());
    /* A Fixed Map check mark links to its result, and a link to a fragment
     * is the browser's business: it sets the location and scrolls to the
     * element with that id.  Where every result is an element that is the
     * whole story.  Where they share one editor there is no element to
     * scroll to -- the result is a stretch of that editor's document -- so
     * the app does the scrolling, and only that: the click is not
     * cancelled, so the location still updates and Back still works.
     *
     * Both the click and the location are listened to.  The click is what
     * makes clicking the same check mark twice work (the location doesn't
     * change, so no hashchange follows); the location is what makes Back,
     * Forward, and a pasted link work. */
    $("#fixedMap").on("click", "a[href^='#']", (evt: any) =>
      this.resultsWidget.scrollToResult($(evt.currentTarget).attr("href").substring(1)));
    $(window).on("hashchange", () =>
      this.resultsWidget.scrollToResult(window.location.hash.substring(1)));
    $("#validate").on("click", this.disableResultsAndValidate.bind(this));
    $("#debugValidate").on("click", () => { this.track(this.startValidationDebugSession()); });
    $("#valDbgInto").on("click", () => this.valDebugStep("stepInto"));
    $("#valDbgOver").on("click", () => this.valDebugStep("stepOver"));
    $("#valDbgContinue").on("click", () => this.valDebugStep("continue"));
    $("#valDbgStop").on("click", () => this.endValidationDebugSession());
    $("#valDbgBreak").on("keydown", (e: any) => {
      if (e.key !== "Enter")
        return true;
      this.addValDebugBreakpoint($("#valDbgBreak").val());
      $("#valDbgBreak").val("");
      return false;
    });
    $("#download-results-button").on("click", this.downloadResults.bind(this));
    $("#createGist").on("click", (evt: any) => { this.track(this.createGist(evt)); });
    $("#updateGist").on("click", (evt: any) => { this.track(this.updateGist(evt)); });

    $("#loadForm").dialog({
      autoOpen: false,
      modal: true,
      buttons: {
        "GET": (evt: any, ui: any) => {
          this.resultsWidget.clear();
          const target = this.Getables.find(g => g.queryStringParm === $("#loadForm span.whatToLoad").text());
          const url = $("#loadInput").val();
          const tips = $(".validateTips");
          function updateTips (t: string) {
            tips
              .text( t )
              .addClass( "ui-state-highlight" );
            setTimeout(() => {
              tips.removeClass( "ui-state-highlight", 1500 );
            }, 500 );
          }
          if (url.length < 5) {
            $("#loadInput").addClass("ui-state-error");
            updateTips("URL \"" + url + "\" is way too short.");
            return;
          }
          tips.removeClass("ui-state-highlight").text();
          this.track(target!.cache!.asyncGet(url)
            // .then(ret => {
            //   this.toggleControls();
            //   return ret;
            // })
            .catch((e) => {
              updateTips(e.message);
            }));
        },
        "Cancel": () => {
          $("#loadInput").removeClass("ui-state-error");
          $("#loadForm").dialog("close");
          this.toggleControls();
        }
      },
      close: () => {
        $("#loadInput").removeClass("ui-state-error");
        $("#loadForm").dialog("close");
        this.toggleControls();
      }
    });
    this.Getables.forEach(target => {
      const type = target.queryStringParm
      $("#load-"+type+"-button").click((evt: any) => {
        const prefillURL = target.url ? target.url :
              target.cache!.meta.base && target.cache!.meta.base !== DefaultBase ? target.cache!.meta.base :
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

    $("#about-button").click((evt: any) => {
      $("#about").dialog("open");
    });

    $("#gistHelp").dialog({
      autoOpen: false,
      modal: true,
      width: "50%",
      buttons: {
        "Dismiss": function (this: any) { $(this).dialog("close"); }
      },
    });

    $("#gistInstructions").on("click", (evt: any) => {
      evt.preventDefault();
      this.toggleControls(); // close the menu; the dialog replaces it
      $("#gistHelp").dialog("open");
    });

    $("#shapeMap-tabs").tabs({
      activate: async (event: any, ui: any) => {
        if (ui.oldPanel.get(0) === $("#editMap-tab").get(0))
          await this.Caches.shapeMap.copyEditMapToQueryMap();
        else if (ui.oldPanel.get(0) === $("#queryMap").get(0))
          await this.Caches.shapeMap.copyQueryMapToEditMap()
      }
    });
    $("#queryMap").on("change", (evt: any) => {
      this.resultsWidget.clear();
      this.track(this.Caches.shapeMap.copyQueryMapToEditMap());
    });
    this.Caches.inputData.selection.on("change", this.dataInputHandler.bind(this)); // input + paste?
    // $("#copyEditMapToFixedMap").on("click", copyEditMapToFixedMap); // may add this button to tutorial

    function dismissModal (this: any, evt?: any) {
      // $.unblockUI();
      $("#about").dialog("close");
      this.toggleControls();
      return true;
    }

    // Prepare file uploads
    $("input.inputfile").each((idx: any, elt: any) => {
      $(elt).on("change", (evt: any) => {
        const reader = new FileReader();

        reader.onload = (evt) => {
          if(evt.target!.readyState != 2) return;
          if(evt.target!.error) {
            alert("Error while reading file");
            return;
          }
          $($(elt).attr("data-target")).val(evt.target!.result);
        };

        reader.readAsText(evt.target.files[0]);
      });
    });
  }

  /* Mouse events */

  async dataInputHandler (evt?: any): Promise<any[]> {
    const active = $('#shapeMap-tabs ul li.ui-tabs-active a').attr('href');
    if (active === "#editMap-tab")
      return await this.Caches.shapeMap.copyEditMapToQueryMap();
    else // if (active === "#queryMap")
      return await this.Caches.shapeMap.copyQueryMapToEditMap();
  }

  /* Keyboard events */
  validateKeyDown (e: any, code?: number): boolean {
    if (!e.ctrlKey || (code !== 10 && code !== 13)) // ctrl-enter
      return false;
    // const at = $(":focus");
    this.dataInputHandler().then(smErrors => {
      if (smErrors.length === 0)
        $("#validate")/*.focus()*/.click();
    })
    return true;
  }

navigateManifestKeyDown (e: any, code?: number): boolean {
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

    function navFrom (keyCode: string, fromLi: any): any {
      const fromColumn = fromLi.parent();
      const fromLiNo = fromLi.index();
      const lis = fromColumn.children();
      const columns = $('ul[data-navColumn]:visible').get().sort(
        (l: any, r: any) =>
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

    function firstOf (node: any, ...selectors: string[]): any { // return first successful selector. gotta be an idiom for this in jquery
      for (let i = 0; i < selectors.length; ++i) {
        const ret = node.find(selectors[i]);
        if (ret.length > 0) {
          return ret.get(0);
        }
      }
    }
  }

  /* drag and drop: ShExBaseApp-layout */
}
