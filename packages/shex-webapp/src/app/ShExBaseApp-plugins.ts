/**
 * The app as a host for plugins (doc/plugins.md): applying and unloading a
 * descriptor, the screens, panes, controls and keys it declares, the
 * results tabs, the links between panes, and the hooks a validation runs.
 * Mixed onto ShExBaseApp; see ShExBaseApp.js.
 *
 * This is doc/ShExBaseApp-plugins.js's source (tsconfig.app.json compiles src/app/ into
 * doc/); edit here and run `npm run build`.
 */

/** What this file adds to the app, declared here since the methods are
 * mixed in rather than written in the class body. */
interface ShExBaseApp {
  applyPlugin (ext: any): any;
  loadPluginScripts (ext: any): any;
  applyPluginNow (ext: any): any;
  unloadPlugin (id: string): void;
  removeResultsTab (id: string): void;
  collapseResultsTabs (): any;
  dropScreenTabs (): any;
  mixinPluginMethods (ext: any): any;
  linkPanes (id: string, links: any[]): void;
  buildPluginResultsTabs (ext: any): any;
  resultsTabsAside (): any;
  showingResultsTab (): string | null;
  syncResultsTabsAside (): any;
  resultsTabStatus (id: string): any;
  showResultsTab (id: string): void;
  resultsTabFor (id: any, label: any, options?: any): any;
  pluginScreen (ext: any): any;
  addScreenTab (ext: any): any;
  addScreenTabFor (id: string, label: string): any;
  currentScreen (): string;
  showScreen (id: string): void;
  lendBorrowedPanes (id: any): any;
  returnBorrowedPanes (): any;
  borrowablePane (name: any, what: any): any;
  remeasureScreenPanes (id: any): any;
  runPluginAction (control: any): any;
  buildPluginToolbar (ext: any): any;
  buildPluginStatusbar (ext: any): any;
  buildPluginControl (control: any, into: any): any;
  bindPluginKeys (ext: any): any;
  paneCache (kind: string, selection: any): InterfaceCache;
  buildPluginPanes (ext: any): any;
  loadPlugins (urls: string[]): Promise<void>;
  extendSchema (schema: any): any;
  makeRenderer (): ShExResultsRenderer;
}

mixin(ShExBaseApp, {
  /**
   * Put on the page what one plugin adds to it: styles, panes, controls,
   * verbs, results (§5).
   *
   * Idempotent, and callable at any time -- at construction for what the
   * page loaded, and again for a plugin that arrives later, which is what
   * makes loading one by URL possible.  Styles go after the page's own
   * rules, so a plugin may say differently what the page said.
   *
   * @returns {Promise|undefined} a promise only when something had to be
   * fetched first.  Deliberately not always a promise: a page script
   * registers while this app is being constructed and start() follows the
   * constructor immediately, so a descriptor with nothing to fetch must be
   * on the page before either returns.
   */
  applyPlugin (ext: any) {
    // What it runs on, if the page hasn't got it: a module of its own,
    // fetched before anything of it is built.
    const pending = this.loadPluginScripts(ext);
    return pending
      ? pending.then(() => this.applyPluginNow(ext))
      : this.applyPluginNow(ext);
  },

  /**
   * The scripts a plugin says it needs, injected in the order it said
   * them, or null if the page already has them all (§5 phase 3).
   *
   * A classic page has no module system, so this is what "load a plugin's
   * code by URL" means here: `scripts` are resolved against the plugin
   * rather than against the page, since the plugin knows where its own
   * bundle sits and the page has never heard of it.
   */
  loadPluginScripts (ext: any) {
    const urls = (ext.scripts || [])
          .map((src: any) => new URL(src, ext.baseUrl || DefaultBase).href)
          .filter((url: any) => $("head script, body script").filter(
            (i: any, s: any) => s.src === url).length === 0);
    if (urls.length === 0)
      return null;
    return urls.reduce((sofar: any, url: any) => sofar.then(() => new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.onload = () => resolve();
      script.onerror = () => reject(Error("no plugin script at <" + url + ">"));
      document.head.appendChild(script);
    })), Promise.resolve());
  },

applyPluginNow (ext: any) {
    if (typeof ext.css === "string" && ext.css.trim().length > 0
        && $("head style[data-plugin]").filter((i: any, e: any) => $(e).attr("data-plugin") === ext.id).length === 0)
      $("<style/>").attr("data-plugin", ext.id).text(ext.css).appendTo("head");
    this.buildPluginPanes(ext);
    this.buildPluginResultsTabs(ext);
    this.buildPluginToolbar(ext);
    this.buildPluginStatusbar(ext);
    this.bindPluginKeys(ext);
    this.mixinPluginMethods(ext);
    // data sources it brings: in the picklist beside the page's own
    (ext.neighborhoods || []).forEach((module: any) => this.neighborhoods.add(module));
    if (typeof ext.init === "function" && !ext.initialized) {
      ext.initialized = true;
      try {
        const readying = ext.init(this);
        // an init with something to await -- a wasm toolchain to load, a
        // module to fetch -- rides `applied`, so whoever loaded the plugin
        // (loadEntryPlugins, ?plugin=) waits for it before validating
        if (readying && typeof readying.then === "function")
          return readying.catch((e: any) =>
            this.resultsWidget.failMessage(e, "loading " + (ext.label || ext.id)));
      } catch (e: any) {
        this.resultsWidget.failMessage(e, "loading " + (ext.label || ext.id));
      }
    }
  },

  /**
   * Take a plugin off the page: the × on its screen tab.
   *
   * A plugin arrives as a URL and this is the way back out.  It undoes what
   * applyPluginNow did, in the reverse order and to the same list: its
   * screen (and so its panes, its toolbar and its statusbar), the caches
   * under those panes and the two lists that say what fills them, its
   * results tabs, its sheet, its keys, the verbs it mixed in, and its
   * entry in the register -- after which nothing that reads the plugins
   * (extendSchema, makeRenderer, the handlers a validation registers, the
   * worker scripts a request names) has ever heard of it.
   *
   * What it does not undo is the plugin's own module: a `scripts` bundle
   * stays on the page, since a classic script cannot be un-run.  That is
   * why the descriptor's bookkeeping is reset rather than kept -- the same
   * module may register again, and must build everything afresh when it
   * does.  A plugin that hung something on the app outside its own screen
   * says how to take it back in `unload`.
   *
   * @returns true if there was such a plugin
   */
  unloadPlugin (id: any) {
    const ext = typeof ShExPlugins === "undefined" ? null : ShExPlugins.byId(id);
    if (!ext)
      return false;
    // A screen may have one of the app's own panes on loan, and removing it
    // while it does would take the pane with it: home first.
    const back = this.currentScreen() === id ? "" : this.currentScreen();
    this.returnBorrowedPanes();
    if (typeof ext.unload === "function") {
      try {
        ext.unload(this);
      } catch (e: any) {
        this.resultsWidget.failMessage(e, "unloading " + (ext.label || ext.id));
      }
    }

    // its panes: the editor over each, the cache under it, and the results
    // tab a pane that lives there was given
    (ext.neighborhoods || []).forEach(module =>
      this.neighborhoods.remove(ShExWebApp.NeighborhoodApi.moduleId(module)));

    const caches = new Set();
    (ext.panes || []).forEach(pane => {
      if (pane.borrow)
        return; // the app's own pane, which was only visiting
      if (this.editorSupport && this.editorSupport.panes[pane.name]) {
        this.editorSupport.panes[pane.name].destroy(); // hands the text back
        delete this.editorSupport.panes[pane.name];
      }
      if (this.Caches[pane.name]) {
        caches.add(this.Caches[pane.name]);
        delete this.Caches[pane.name];
      }
      if (pane.tab)
        this.removeResultsTab(pane.tab.id || pane.id + "Tab");
    });
    (ext.resultsTabs || []).forEach(panel => this.removeResultsTab(panel.id));

    // ...and what said how to fill them: a pane's entry is known by the
    // cache it holds, a control's by the parameter it named
    const parms = new Set();
    const readControls = (controls: any) => (controls || []).forEach((control: any) => {
      if (control.queryStringParm)
        parms.add(control.queryStringParm);
      readControls(control.controls);
    });
    readControls(ext.toolbar);
    readControls(ext.statusbar);
    [this.Getables, this.QueryParams].forEach(list => {
      for (let i = list.length; i-- > 0;)
        if (caches.has(list[i].cache)
            || (list[i].queryStringParm && parms.has(list[i].queryStringParm)))
          list.splice(i, 1);
    });

    // the page: screen, tab, sheet
    $("#screens > .screen").filter((i: any, e: any) => $(e).attr("data-plugin") === id).remove();
    $("#screenTabs button").filter((i: any, b: any) => $(b).attr("data-screen") === id).remove();
    $("head style[data-plugin]").filter((i: any, e: any) => $(e).attr("data-plugin") === id).remove();

    // the keys it answered and the verbs it lent
    for (let i = this.keyDownHandlers.length; i-- > 0;)
      if (this.keyDownHandlers[i].plugin === id)
        this.keyDownHandlers.splice(i, 1);
    (ext.toolbar || []).filter(c => c.key).concat(ext.keys || [])
      .forEach(binding => { delete binding.bound; });
    (ext.mixedIn || []).forEach(name => { delete (this as any)[name]; });
    delete ext.mixedIn;
    delete ext.initialized;
    delete ext.panesBuilt;

    // the permalink stops naming it, so a reload comes back without it
    const urls = (this.Caches.plugin || {}).urls;
    if (urls && ext.baseUrl) {
      const at = urls.indexOf(ext.baseUrl);
      if (at !== -1)
        urls.splice(at, 1);
    }
    ShExPlugins.unregister(id);

    // A worker cannot un-importScripts, so a page that has one gets a new
    // one: otherwise the handler this plugin registered over there would
    // still answer a schema that named it.
    // (the page's own globals, not window's: `const WorkerUrl` in a classic
    // script is a lexical binding the scripts after it see and window does
    // not, which is how RemoteShExValidator reaches the same two)
    if (ext.worker && typeof ShExWorker !== "undefined" && ShExWorker && typeof WorkerUrl !== "undefined") {
      ShExWorker.terminate();
      ShExWorker = new Worker(WorkerUrl);
    }

    if ($("#screens > .screen").length === 0)
      this.dropScreenTabs();
    this.collapseResultsTabs();
    this.showScreen(back);
    return true;
  },

  /** one results tab, gone: the strip loses its <li> and the page the
   * panel.  jquery-ui picks another tab if this was the one showing. */
  removeResultsTab (id: any) {
    const tabs = $("#resultsTabs");
    if (tabs.length === 0)
      return;
    tabs.find("> ul > li").filter(
      (i: any, li: any) => $(li).children("a").attr("href") === "#" + id).remove();
    $("#" + id).remove();
    if (tabs.data("ui-tabs"))
      tabs.tabs("refresh");
  },

  /** The results are one panel again once the last plugin tab has gone --
   * the shape resultsTabFor found them in, and the shape a page that never
   * loaded a plugin keeps. */
  collapseResultsTabs () {
    const tabs = $("#resultsTabs");
    if (tabs.length === 0)
      return;
    if (tabs.children("div[id]").filter((i: any, e: any) => e.id !== APP_RESULTS_TAB).length > 0)
      return;
    const mine = $("#" + APP_RESULTS_TAB).children("div").first();
    if (tabs.data("ui-tabs"))
      tabs.tabs("destroy");
    mine.insertBefore(tabs);
    tabs.remove();
    this.resultsTargetSel = "#results > div";
    this.resultsWidget.setTarget(this.resultsTarget);
  },

  /** ...and the title says what the page is again once the last plugin
   * screen has gone: nothing left to switch between. */
  dropScreenTabs () {
    const tabs = $("#screenTabs");
    if (tabs.length === 0)
      return;
    tabs.empty().hide();
    this.screenTabsLive = false;
    const title = $("#title h1").first();
    const named = title.find(".screenName").first();
    (named.length ? named : title).show();
  },

  /**
   * Add a plugin's verbs to this app (§5, inventory row 10).
   *
   * ShExMap's verbs were methods on a subclass of this, which is why its
   * page needed an app class of its own.  They are an object in the
   * descriptor now, mixed in here, so `this` still means the app and
   * nothing about how they are written had to change.
   *
   * A name the app already has is left alone: a plugin adds verbs, it does
   * not replace them, and the app it is mixed into may already have one
   * (the worker app had its own materializer, until rows 15 and 16).
   */
  mixinPluginMethods (ext: any) {
    ext.mixedIn = ext.mixedIn || [];
    Object.keys(ext.methods || {}).forEach(name => {
      if (name in this)
        return;
      (this as any)[name] = ext.methods[name].bind(this);
      ext.mixedIn.push(name); // what to take back on unloadPlugin
    });
  },

  /**
   * What a plugin says is about what: ranges in panes that light each other
   * up (§5's highlighting, for a plugin's own panes).
   *
   * One link is one thing the reader can point at from several places.  It
   * is the shape a validation's own links have, so the two are wired
   * together rather than fighting over a pane:
   *
   *   {schema: {from, to},                    // a range in the schema pane
   *    schemaParts: [range…],                 // ...or its pieces
   *    anchors: {subject, predicate, object}, // and in the data pane
   *    doc: 0,                                // which data document those are in
   *    panes: {ast: [range…], overlay: [range…]},  // and in panes of yours
   *    status: "conformant"}                  // green; anything else is red
   *
   * A link that carries a schema range joins the validation's group for
   * that range, so hovering a constraint lights the triple that matched it
   * *and* what you made of that match.  Call it again to replace what you
   * linked, or with nothing to take it back; a new validation clears it,
   * since what you linked was about the last one.
   */
  linkPanes (id: any, links: any) {
    if (this.editorSupport)
      this.editorSupport.setLinks(id, links);
  },

  /**
   * A results tab of a plugin's own.
   *
   * A validator has one kind of result, so it writes into `#results > div`
   * and that is that.  A plugin with a second kind -- ShExMap's
   * materialization of the validation -- declares a tab, and the results
   * area becomes tabs: this app's results are the first, the declared
   * ones follow, and the widget is re-pointed at the first.  A page needs
   * no markup for any of it.
   */
  buildPluginResultsTabs (ext: any) {
    (ext.resultsTabs || []).forEach(
      (panel: any) => this.resultsTabFor(panel.id, panel.label, {empty: true}));
  },

  /**
   * The corner of the results tab strip.
   *
   * For a control that is about the results rather than in them -- ShExMap
   * offers the materializations it could have made instead -- which put
   * where the results are would push the results it is about down the
   * page, and off the bottom of it.
   */
  resultsTabsAside () {
    const tabs = $("#resultsTabs");
    if (tabs.length === 0)
      return $();
    let aside = tabs.children(".resultsTabsAside").first();
    if (aside.length === 0)
      aside = $("<div/>").addClass("resultsTabsAside").appendTo(tabs);
    // What it says is about the results that are up when it is written --
    // the materializations this materialization could have been -- so it
    // is about that tab, and shows while that tab shows.  It used to stay
    // over whatever the reader turned to next.
    aside.attr("data-for", this.showingResultsTab());
    this.syncResultsTabsAside();
    return aside;
  },

  /** which results tab is up, by the id of its panel */
  showingResultsTab () {
    const tabs = $("#resultsTabs");
    if (tabs.length === 0 || !tabs.data("ui-tabs"))
      return APP_RESULTS_TAB;
    const at = tabs.tabs("option", "active");
    const href = at === false ? "" :
          (tabs.find("> ul > li").eq(at).children("a").attr("href") || "");
    return href.replace(/^#/, "") || APP_RESULTS_TAB;
  },

  /** ...and the corner of the strip shows only over the tab it is about */
  syncResultsTabsAside () {
    const aside = $("#resultsTabs > .resultsTabsAside");
    if (aside.length === 0)
      return;
    aside.toggle(aside.attr("data-for") === this.showingResultsTab());
  },

  /** A results tab's own status line, for what a plugin has to say about
   * what is in it.  In it: a tab says what kind of result it holds, and
   * anything more particular than that belongs where the results are
   * rather than over the whole results area. */
  resultsTabStatus (id: any) {
    const panel = $("#" + id);
    if (panel.length === 0)
      return $();
    let status = panel.children(".status").first();
    if (status.length === 0)
      status = $("<h2/>").addClass("status").prependTo(panel);
    return status;
  },

  /** Bring a results tab up, if the results are tabs at all.  A plugin
   * that has just filled one says so rather than leaving the reader to
   * find it. */
  showResultsTab (id: any) {
    const tabs = $("#resultsTabs");
    if (tabs.length === 0 || !tabs.data("ui-tabs"))
      return;
    const at = tabs.find("> ul > li > a").map((i: any, a: any) => $(a).attr("href")).get()
          .indexOf("#" + id);
    if (at !== -1)
      tabs.tabs("option", "active", at);
  },

  /**
   * The panel of one results tab, made if it isn't there.
   *
   * The results area is one panel until something else has results to show;
   * then it becomes tabs, this app's own first (where they already are, so
   * nothing that renders into them has to know) and the rest beside it.  A
   * plugin gets here two ways: `resultsTabs`, for a tab it renders into
   * itself, and a pane that says `tab:`, for one that is a pane like any
   * other and happens to belong here.
   */
  resultsTabFor (id: any, label: any, {empty = false} = {}) {
    let tabs = $("#resultsTabs");
    if (tabs.length === 0) {
      const mine = $("#results > div").first();
      tabs = $("<div/>").attr("id", "resultsTabs").insertBefore(mine);
      $("<ul/>").append($("<li/>").append(
        $("<a/>", {href: "#" + APP_RESULTS_TAB}).text("validation"))).appendTo(tabs);
      $("<div/>").attr("id", APP_RESULTS_TAB).append(mine).appendTo(tabs);
      this.resultsTargetSel = "#" + APP_RESULTS_TAB + " > div";
      this.resultsWidget.setTarget(this.resultsTarget);
    }
    let panel = $("#" + id);
    if (panel.length === 0) {
      panel = $("<div/>").attr("id", id).appendTo(tabs);
      if (empty) {
        // a tab the plugin renders into, and shows and hides itself: the
        // materialization's comes and goes with the bindings it was made
        // from, so the <li> is ShExMap's to add (showMaterialization)
        panel.css("display", "none").append($("<h2/>").addClass("status"), $("<div/>"));
      } else {
        // ...and a pane's tab is there as long as the pane is
        $("<li/>").append($("<a/>", {href: "#" + id}).text(label || id))
          .appendTo(tabs.children("ul").first());
      }
    }
    if (tabs.data("ui-tabs"))
      tabs.tabs("refresh");
    else
      tabs.tabs();
    if (!tabs.data("shexjsAsideWired")) {
      tabs.data("shexjsAsideWired", true);
      tabs.on("tabsactivate", () => this.syncResultsTabsAside());
    }
    return panel;
  },

  /**
   * The screen a plugin builds into, made on demand (§4).
   *
   * A screen is a page-full of panes.  The validator's two panels are this
   * app's own screen; a plugin that declares panes or controls gets one of
   * its own, and the select standing where the title stood switches between
   * them.  Hiding a screen never unloads it: its caches stay live, its
   * query parameters and manifest keys still fill, its keys still answer,
   * and a hook like ShExReduce's `schema` reads its panes wherever the
   * reader happens to be looking.  ShExMap's screen consumes a validation;
   * ShExReduce's overlay steers one -- so a screen is beside validation,
   * never downstream of it.
   */
  pluginScreen (ext: any) {
    let slot = $("#screens");
    if (slot.length === 0)
      slot = $("<div/>").attr("id", "screens").appendTo("#inputarea");
    const already = slot.children().filter((i: any, e: any) => $(e).attr("data-plugin") === ext.id);
    if (already.length)
      return already;
    const screen = $("<div/>").addClass("screen").attr("data-plugin", ext.id).appendTo(slot);
    // a page without the switch keeps every screen visible, which is the
    // pre-screens layout; a page with it starts a new screen put away
    if (this.addScreenTab(ext))
      screen.hide();
    return screen;
  },

  /**
   * The screen tabs, standing where the <h1>'s tail stood.
   *
   * They appear with the first plugin screen: a page with only the
   * validator's has nothing to switch and keeps its whole title.  What the
   * title called the page -- "Validator" -- becomes the first tab, so the
   * page is still named on screen and the name is still the thing you press
   * to get back to it.  `#screen` is a hidden input rather than the control
   * itself: it is where the answer lives, so a permalink reads and writes it
   * like any other parameter (`?screen=`).
   *
   * Not jquery-ui tabs, which own the panels they switch; these switch
   * screens that live further down the page, and the results area's tabs
   * (which jquery-ui does own) are a different set of tabs about a
   * different thing.
   */
  addScreenTab (ext: any) {
    const tabs = $("#screenTabs");
    if (tabs.length === 0)
      return false;
    if (!this.screenTabsLive) {
      this.screenTabsLive = true;
      // .first(): the dialogs (#loadForm, #about) start life inside #title
      // and carry <h1>s of their own until jquery-ui moves them out
      const title = $("#title h1").first();
      // The tabs replace the part of the title that named what is showing
      // and leave the rest of it -- "ShEx - " -- standing, so the page is
      // still called something and still has a heading.  A title not marked
      // up that way hands the tabs the whole of itself.
      const named = title.find(".screenName").first();
      const standsFor = named.length ? named : title;
      this.addScreenTabFor("", standsFor.text().trim() || "validator");
      standsFor.hide();
      tabs.show();
    }
    this.addScreenTabFor(ext.id, ext.label || ext.id);
    return true;
  },

  /** one tab, unless it is already there.
   *
   * A plugin's tab carries an × : the plugin came from a URL and can go
   * back where it came from (unloadPlugin).  The validator's does not --
   * it is the page, not a guest on it. */
  addScreenTabFor (id: any, label: any) {
    const tabs = $("#screenTabs");
    if (tabs.children().filter((i: any, b: any) => $(b).attr("data-screen") === id).length > 0)
      return;
    const tab = $("<button/>", {type: "button", role: "tab",
                    "data-screen": id, "aria-selected": String(id === this.currentScreen())})
      .append($("<span/>").addClass("screenTabLabel").text(label))
      .on("click", () => this.showScreen(id))
      .appendTo(tabs);
    if (id !== "")
      $("<span/>").addClass("unloadPlugin")
        .attr({role: "button", title: "unload " + label, "aria-label": "unload " + label})
        .text("\u00d7")
        // the × is inside the tab, so pressing it would otherwise also
        // switch to the screen it is about to remove
        .on("click", (evt: any) => { evt.stopPropagation(); this.unloadPlugin(id); })
        .appendTo(tab);
  },

  /** which screen is up: the hidden input is the one place it is written */
  currentScreen () {
    return $("#screen").val() || "";
  },

  /**
   * Show one screen and put the others away -- away, not gone: display and
   * nothing else changes, so what a hidden screen's panes hold is still
   * read wherever it is used.  The results stay below, shared: a
   * validation's tab and a materialization's sit side by side whichever
   * screen is up.
   */
  showScreen (id: any) {
    if ($("#screen").length === 0)
      return;
    $("#screen").val(id);
    $("#screenTabs button").each(
      (i: any, b: any) => $(b).attr("aria-selected", String($(b).attr("data-screen") === id)));
    // home first: a screen that borrows one of the app's panes has it on
    // loan, and the next screen (or the validator) wants it back
    this.returnBorrowedPanes();
    $("#inputSchema, #inputData").toggle(id === "");
    $("#screens > .screen").each((i: any, e: any) => $(e).toggle($(e).attr("data-plugin") === id));
    this.lendBorrowedPanes(id);
    this.remeasureScreenPanes(id);
  },

  /**
   * A screen may show one of the app's own panes as well as its own.
   *
   * ShExReduce's overlay is read *against* the data, so its screen shows
   * the data pane beside it -- the same pane, not a copy of it: one
   * element, one cache, one editor, moved to wherever it is being looked
   * at.  A copy would be a second thing to keep in step, which is what
   * panes are for in the first place.
   */
  lendBorrowedPanes (id: any) {
    if (id === "")
      return;
    $("#screens > .screen").filter((i: any, e: any) => $(e).attr("data-plugin") === id)
      .find("[data-borrow]").each((i: any, slot: any) => {
        const name = $(slot).attr("data-borrow");
        const pane = this.borrowablePane(name, $(slot).attr("data-borrow-what"));
        if (pane.length === 0)
          return;
        if (!this.paneHomes[name])
          this.paneHomes[name] = {parent: pane.parent(), next: pane.next(),
                                  what: $(slot).attr("data-borrow-what")};
        pane.appendTo(slot).show();
      });
  },

  /** every borrowed pane, back where the page put it */
  returnBorrowedPanes () {
    Object.keys(this.paneHomes).forEach(name => {
      const home = this.paneHomes[name];
      const pane = this.borrowablePane(name, home.what);
      if (pane.length === 0)
        return;
      if (home.next.length)
        pane.insertBefore(home.next);
      else
        pane.appendTo(home.parent);
    });
  },

  /** what a screen borrows for a pane: the element the descriptor named,
   * or the whole column the pane's textarea sits in */
  borrowablePane (name: any, what: any) {
    if (what)
      return $(what);
    const cache = this.Caches[name];
    return cache ? cache.selection.closest(".panel") : $();
  },

  /** A CodeMirror pane measures nothing while it is display:none, so a
   * pane that just came on screen is asked to measure again -- the same
   * treatment the data pane gets when another document swaps in. */
  remeasureScreenPanes (id: any) {
    if (!this.editorSupport)
      return;
    const names = id === ""
          ? ["inputSchema", "inputData"]
          : ((pluginDescriptors().find(d => d.id === id) || {}).panes || []).map(p => p.name);
    names.forEach(name => {
      const pane = this.editorSupport!.panes[name];
      if (pane && pane.requestMeasure)
        pane.requestMeasure();
    });
  },

  /**
   * Run what a control says to run, and say so if it can't.
   *
   * A descriptor may declare a verb whose code has not been loaded -- the
   * ShExMap page's app class still holds `materialize`, so a plain page
   * told to load ShExMap gets the button and not the verb.  Better a
   * message where the results go than a stack trace in the console.
   */
  runPluginAction (control: any) {
    const before = this.settledPromise;
    try {
      const ret = control.run(this);
      if (ret && typeof ret.then === "function") {
        // whoever waits on this waits for the verb to finish, whether it
        // worked or was reported -- an async verb's failure is a rejected
        // promise, not a throw
        const handled = ret.catch((e: any) => this.resultsWidget.failMessage(e, control.id));
        // an action that hands over its own work keeps what it handed over:
        // materialize's click resolves at once, the materialization doesn't
        if (this.settledPromise === before)
          this.track(handled);
      }
    } catch (e: any) {
      this.resultsWidget.failMessage(e, control.id);
    }
  },

  /**
   * Build the row of controls a plugin declares (§5, inventory row 4).
   *
   * `toolbar` is the row, in order: a button, an input the app fills from a
   * query parameter, a group that may hide, a status line.  A button says
   * what it runs; an input says which parameter and manifest key fill it,
   * the way a pane does.  They go in the plugin's own card, under its
   * panes -- the verb beside the things it consumes.
   */
  buildPluginToolbar (ext: any) {
    const toolbar = ext.toolbar || [];
    if (toolbar.length === 0)
      return;
    const screen = this.pluginScreen(ext);
    if (screen.children(".pluginToolbar").length > 0)
      return; // already built
    // a full-width row under the screen's columns.  Two boxes: the row is
    // a block formatting context, so the inner one may float to the
    // screen's edge without escaping it
    const row = $("<div/>").addClass("pluginToolbar").appendTo(screen);
    const inner = $("<div/>").addClass("pluginToolbarInner").appendTo(row);
    toolbar.forEach((control: any) => this.buildPluginControl(control, inner));
  },

  /**
   * What a plugin says under its controls, across the card (§4's
   * `statusbar` slot).
   *
   * Not in the toolbar: that box floats right, so anything in it that grows
   * and shrinks -- a list of live threads, say -- moves the buttons beside
   * it out from under the mouse.  This grows rightward from an edge that
   * doesn't move.
   */
  buildPluginStatusbar (ext: any) {
    const items = ext.statusbar || [];
    if (items.length === 0)
      return;
    const screen = this.pluginScreen(ext);
    if (screen.children(".pluginStatusbar").length > 0)
      return;
    const row = $("<div/>").addClass("pluginStatusbar").appendTo(screen);
    items.forEach((control: any) => this.buildPluginControl(control, row));
  },

buildPluginControl (control: any, into: any) {
    switch (control.kind) {
    case "button": {
      const button = $("<button/>").attr({id: control.id, title: control.title || null})
            .text(control.label).appendTo(into);
      if (control.run)
        button.on("click", () => this.runPluginAction(control));
      return button;
    }
    case "input": {
      const input = $("<input/>").attr({
        id: control.id, type: "text", value: "",
        placeholder: control.placeholder || null, title: control.title || null,
      }).addClass(control.className || "").appendTo(into);
      if (control.queryStringParm) {
        // not a cache: a plain input, filled from the query string or from
        // the manifest key it names
        const entry: any = {queryStringParm: control.queryStringParm, location: input,
                       deflt: control.deflt === undefined ? "" : control.deflt};
        if (control.manifest)
          entry.manifest = control.manifest;
        this.QueryParams.push(entry);
      }
      return input;
    }
    case "group": {
      const group = $("<span/>").attr("id", control.id).appendTo(into);
      if (control.hidden)
        group.css("display", "none");
      (control.controls || []).forEach((c: any) => this.buildPluginControl(c, group));
      return group;
    }
    case "status": {
      const line = $("<div/>").attr("id", control.id).addClass(control.className || "")
            .appendTo(into);
      if (control.hidden)
        line.css("display", "none");
      $("<span/>").attr({id: control.contentId, title: control.contentTitle || null})
        .appendTo(line);
      return line;
    }
    default:
      throw Error("no control of kind " + JSON.stringify(control.kind)
                  + "; there are button, input, group and status");
    }
  },

  /**
   * Bind the keys a plugin declares (inventory row 5).
   *
   * Some verbs are only a keystroke, so nothing on the page notices when
   * they stop working; they are declared beside the ones that have buttons.
   * keyDownHandlers is read on each keydown, so a binding may arrive at any
   * time -- which is what a plugin loaded mid-session does.
   */
  bindPluginKeys (ext: any) {
    const keys = (ext.toolbar || []).filter((c: any) => c.key).concat(ext.keys || []);
    keys.forEach((binding: any) => {
      if (binding.bound)
        return; // this descriptor was applied before
      binding.bound = true;
      // tagged with whose it is: unloadPlugin has to find it again
      const handler = (e: any) => {
        if (!!binding.key.ctrl !== e.ctrlKey || e.key !== binding.key.key)
          return false;
        this.runPluginAction(binding);
        return true;
      };
      handler.plugin = ext.id;
      this.keyDownHandlers.push(handler);
    });
  },

  /** the cache a pane of this kind wants */
  paneCache (kind: any, selection: any) {
    switch (kind) {
    case "json":   return new JSONCache(selection);
    case "schema": return new SchemaCache(selection, null, this.shexcParser, this.turtleParser);
    case "turtle": return new TurtleCache(selection, null, this.turtleParser);
    default: throw Error("no pane of kind " + JSON.stringify(kind)
                         + "; there are json, schema and turtle");
    }
  },

  /**
   * Build the panes the registered plugins declare (§5 phase 1).
   *
   * A pane in this app is a textarea, a status line, a cache that parses
   * what is in it, and an entry in Getables/QueryParams saying which query
   * string parameter and which manifest key fill it -- four things that
   * have to agree, which is why a declaration says them once and this makes
   * all four.
   *
   * They go in the plugin's screen (pluginScreen): the page may place
   * `#screens` where it likes and gets it appended to `#inputarea` if it
   * doesn't, so a page needs no markup to host a plugin.  One screen per
   * plugin, so two of them are two screens rather than a fight over the
   * same column.
   */
  buildPluginPanes (ext: any) {
    const panes = ext.panes || [];
    if (panes.length === 0 || ext.panesBuilt)
      return;
    ext.panesBuilt = true;
    // A screen, if anything is going to be on it: a pane in a results tab
    // and a pane the screen borrows are both located elsewhere.
    const screen = panes.some((pane: any) => !pane.tab) ? this.pluginScreen(ext) : $();
    // The screen's columns.  Panes share one unless `panel:` groups them
    // otherwise, so a descriptor written before screens renders as it did
    // -- one column -- and ShExMap says its output schema is a column of
    // its own, which is the two-column layout its own page had.
    const columns = new Map();
    panes.forEach((pane: any) => {
      // a pane of the app's, shown on this screen too: a slot to move it
      // into, and nothing else -- it is built, filled and cached already
      if (pane.borrow) {
        const slot = $("<div/>").attr({
          "data-borrow": pane.name,
          // what to borrow: the pane's whole column, or the element named
          "data-borrow-what": typeof pane.borrow === "string" ? pane.borrow : null,
          id: pane.tabs ? pane.id || pane.name + "Tab" : null,
        });
        slot.appendTo(pane.tabs ? this.paneTabset(pane, screen, columns)
                     : this.screenColumns(screen));
        return;
      }
      // A pane that names a results tab is a product to read beside the
      // other results rather than an input to work in, and goes there; the
      // rest are columns of the screen, shared unless `panel:` says
      // otherwise.
      let container;
      if (pane.tab) {
        container = this.resultsTabFor(pane.tab.id || pane.id + "Tab", pane.tab.label);
      } else if (pane.tabs) {
        // panes that take turns in one column rather than stacking in it
        container = this.paneTabset(pane, screen, columns);
      } else {
        const key = pane.panel === undefined ? "" : pane.panel;
        if (!columns.has(key))
          columns.set(key, $("<div/>").addClass("panel").attr("data-panel", key || null)
                      .appendTo(this.screenColumns(screen)));
        container = columns.get(key);
      }
      const textarea = $("<textarea/>")
            .attr({rows: pane.rows || 10, spellcheck: "false"})
            .addClass(pane.className || "")
            .css("width", "100%");
      $("<div/>").attr("id", pane.id).css("width", "100%")
        // `fill`: this pane is the column, so it takes the column's height
        // rather than asking for a number of rows (.fillsColumn, shex-app.css)
        .addClass(pane.fill ? "fillsColumn" : null)
        // ...and where panes share a column, `rows` is the share each asks
        // for: a nineteen-row pane over a five-row one divides it 19:5, as
        // the rows themselves would have.  Longhands, because the `flex`
        // shorthand is one of the things a document without a layout
        // engine declines to parse.  (Not in a results tab, where a pane is
        // the whole of what it is in.)
        .css(pane.tab ? {} : {"flex-grow": pane.rows || 10,
                              "flex-shrink": 1, "flex-basis": 0})
        // a non-breaking space, so an empty status line keeps its height
        .append($("<h2/>").addClass("status").text("\u00a0"), textarea)
        .appendTo(container);
      const cache = this.paneCache(pane.kind, textarea);
      this.Caches[pane.name] = cache;
      const entry: any = {queryStringParm: pane.queryStringParm, location: cache.selection, cache};
      if (pane.manifest)
        entry.manifest = pane.manifest;
      // QueryParams was copied from Getables, so an entry that is both
      // has to be pushed to both
      this.Getables.push(entry);
      this.QueryParams.push(entry);
      // a plugin that arrives while the editors are on gets them too
      if (this.editorSupport && pane.editor)
        this.editorSupport.addPane(pane.name, cache, pane.editor);
    });
    screen.find("[data-tabset]").each((i: any, set: any) => $(set).tabs());
  },

  /**
   * parse query string into map of arrays
   * location.search: e.g. "?schema=asdf&data=qwer&shape-map=ab%5Ecd%5E%5E_ef%5Egh"
   */
  /** the plugin modules named by URL, loaded in the order they were named */
  async loadPlugins (urls: any) {
    for (const url of urls) {
      if (url.length === 0)
        continue;
      try {
        await this.Caches.plugin.asyncGet(new URL(url, DefaultBase).href);
      } catch (e: any) {
        this.resultsWidget.append($("<pre/>").text(e).addClass("error"));
      }
    }
  },

  /**
   * The renderer, wrapped by whatever the plugins add to it (row 13).
   *
   * `results` takes the class and returns one that extends it, so two
   * plugins compose rather than the second replacing the first -- and
   * neither has to know the name of a global to subclass.
   */
  /**
   * The schema, as the plugins would have it.
   *
   * A plugin may have something to add to what is validated -- ShExReduce
   * hangs the actions of a `sa:Overlay` document on the schema they were
   * written apart from -- and it has to happen here, before the schema goes
   * to a validator or across a postMessage.  ShExMap wants none of this,
   * which is the point: a hook that only one plugin needs is still a hook
   * the app doesn't have to know the reason for.
   */
  extendSchema (schema: any) {
    return pluginDescriptors().reduce((sofar, ext) => {
      if (typeof ext.schema !== "function")
        return sofar;
      try {
        return ext.schema(sofar, this) || sofar;
      } catch (e: any) {
        this.resultsWidget.failMessage(e, (ext.label || ext.id) + "'s schema");
        return sofar;
      }
    }, schema);
  },

makeRenderer () {
    const cls = pluginDescriptors().reduce(
      (sofar, ext) => typeof ext.results === "function" ? ext.results(sofar) : sofar,
      ShExResultsRenderer);
    return new cls(this.resultsWidget, this.Caches);
  },
});
