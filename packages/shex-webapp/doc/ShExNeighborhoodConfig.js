/**
 * Which data source answers the data pane, and the documents and
 * parameters each source takes: the neighborhood selector, its panes and
 * fields, slurping.
 */

/** The data source picker and the configuration it draws.
 *
 * Where the data comes from is the user's choice, made from a list of the
 * neighborhood modules loaded into this app -- so this class knows about
 * data sources in general and about none of them in particular.  What each
 * one needs it reads from that module's declarations (dbParams): values to
 * type become fields, documents to edit become panes shown one at a time.
 * A query service is then all fields and no panes; a local store is one
 * mandatory Turtle document; a Wikibase is a growable set of entity pages,
 * each one an edit to try before making it.
 *
 * One textarea holds whichever pane is showing -- the same textarea the app
 * has always had, so drag-and-drop, dirty tracking, permalinks and the
 * editors keep working -- and the panes not showing live here as text.
 */
class NeighborhoodConfig {
  /**
   * @param modules  the loaded neighborhood modules, in picklist order
   * @param textarea the data pane's textarea (jQuery selection)
   * @param onChange called when the user changes anything the db is built from
   * @param onShown  called when the document area becomes visible again
   */
  constructor (modules, textarea, onChange, onShown) {
    this.modules = modules;
    this.textarea = textarea;
    this.onChange = onChange;
    /** called when the document area becomes visible again */
    this.onShown = onShown;
    this.moduleId = ShExWebApp.NeighborhoodApi.moduleId(modules[0]);
    /** A parameter's name means the same thing wherever it is declared --
     * that is what lets a manifest entry or a permalink say `endpoint=`
     * without naming a module twice -- but its *value* belongs to the
     * source that asked for it: `data` is a graph to one source and an
     * entity page to another, and neither wants the other's document. */
    this.fieldsByModule = {};
    this.panesByModule = {};
    this.showing = 0;
    this.onSettings = false;
  }

  /** the selected source's fields: parameter name -> value */
  get fields () {
    return this.fieldsByModule[this.moduleId] || (this.fieldsByModule[this.moduleId] = {});
  }

  /** the selected source's documents: parameter name -> [text, ...] */
  get panes () {
    return this.panesFor(this.moduleId);
  }

  panesFor (moduleId) {
    return this.panesByModule[moduleId] || (this.panesByModule[moduleId] = {});
  }

  get module () {
    const {moduleId} = ShExWebApp.NeighborhoodApi;
    return this.modules.find(m => moduleId(m) === this.moduleId) || this.modules[0];
  }

  get paneParams () { return ShExWebApp.NeighborhoodApi.paneParams(this.module.dbParams || []); }
  get fieldParams () { return ShExWebApp.NeighborhoodApi.fieldParams(this.module.dbParams || []); }

  /** Every document the selected source takes, in declaration order: a
   * flat list, because that is what the tabs are.  A parameter that must
   * have a document always shows one, even before anything is in it. */
  documents () {
    const out = [];
    for (const param of this.paneParams) {
      const texts = this.panes[param.name] || (param.pane.min ? [""] : []);
      texts.forEach((text, index) => out.push({param, index, text}));
    }
    return out;
  }

  /** The document a tab is showing, with the textarea's text in it.
   *
   * ...while a document is showing: with the settings tab up the textarea
   * is holding whatever was there last, which belongs to no document.
   * Reading it as one wrote it over the page a slurp had just put there. */
  docAt (n) {
    const docs = this.documents();
    if (n < 0 || n >= docs.length)
      return null;
    const doc = docs[n];
    return Object.assign({}, doc,
                         n === this.showing && !this.onSettings
                         ? {text: this.textarea.val()} : {});
  }

  /** the parameter whose document is showing (for its language) */
  get paneParam () {
    const doc = this.docAt(this.showing);
    return doc ? doc.param : (this.paneParams[0] || null);
  }

  /** texts of one parameter's documents, the showing one included */
  texts (paramName) {
    const name = paramName || (this.paneParam || {}).name;
    if (!name)
      return [];
    const texts = (this.panes[name] || []).slice();
    const doc = this.onSettings ? null : this.docAt(this.showing);
    if (doc && doc.param.name === name) {
      while (texts.length <= doc.index)
        texts.push("");
      texts[doc.index] = this.textarea.val();
    }
    return texts;
  }

  /** what to hand the module's fromParams: a pane nobody has written in is
   * not a document, however much room it is taking up */
  params () {
    const params = Object.assign({}, this.fields);
    for (const param of this.paneParams)
      params[param.name] = this.texts(param.name).filter(text => text.trim() !== "");
    return params;
  }

  /** the text a permalink or manifest means by "data": the first document
   * of the first parameter, whichever pane happens to be showing */
  primaryText () {
    const texts = this.texts((this.paneParams[0] || {}).name);
    return texts.length > 0 ? texts[0] : "";
  }

  /** Put documents where the source says they go.  A source that can sort
   * its own documents out (a Wikibase, told an entity page, knows it is a
   * page and which ids it is about) does; otherwise they are documents of
   * the first parameter, which is what a data pane has always meant. */
  setDocuments (texts) {
    const first = this.paneParams[0];
    if (!first)
      return;
    const distribute = this.module.distributeDocuments;
    const bySpec = distribute
          ? distribute(texts.filter(text => text.trim() !== ""))
          : {[first.name]: texts};
    for (const param of this.paneParams)
      this.panes[param.name] = (bySpec[param.name] || []).slice();
    this.showing = 0;
    this.textarea.val((this.documents()[0] || {}).text || "");
    this.render();
  }

  /** Throw away every source's documents, back to the empty panes a source
   * insists on (`pane.min`).  Every source's, not just the selected one:
   * this is what "there is no data now" means, and a stash left under a
   * source nobody is looking at reappears the moment they choose it. */
  forgetDocuments () {
    this.panesByModule = {};
    this.showing = 0;
    this.textarea.val("");
    this.render();
  }

  select (moduleId) {
    if (this.moduleId === moduleId)
      return;
    this.stash();
    this.moduleId = moduleId;
    this.showing = 0;
    this.onSettings = false;   // show the document; settings are a tab away
    $("#neighborhood").val(moduleId);
    this.render();
    this.textarea.val((this.panes[(this.paneParam || {}).name] || [""])[0] || "");
    this.onChange({language: true});   // a different source, a different language
  }

  /** keep the showing document's text before something replaces it */
  stash () {
    const doc = this.docAt(this.showing);
    if (doc)
      this.panes[doc.param.name] = this.texts(doc.param.name);
  }

  show (n) {
    if (this.showingPane)
      return;                 // render() moved the tab set; not a new choice
    // one source's panes need not share a language -- wikidata's list of
    // entity ids and the entity pages themselves don't -- so moving between
    // them is a language change as much as changing source is
    const was = this.paneParam;
    this.showingPane = true;
    try {
      this.stash();
      // read the document before moving to it: docAt reports the showing
      // one through the textarea, which is about to be overwritten
      const text = (this.documents()[n] || {}).text || "";
      this.showing = n;
      this.textarea.val(text);
      this.render();
    } finally {
      this.showingPane = false;
    }
    this.onChange(was === this.paneParam ? undefined : {language: true});
  }

  /** the parameter a new document would be added to */
  get creatableParam () {
    return this.paneParams.find(p => p.pane.creatable) || null;
  }

  addPane (text) {
    const spec = this.creatableParam;
    if (!spec)
      return;
    this.stash();
    const texts = this.panes[spec.name] || [];
    texts.push(text === undefined ? (spec.pane.template || "") : text);
    this.panes[spec.name] = texts;
    const at = this.documents().findIndex(
      d => d.param.name === spec.name && d.index === texts.length - 1);
    // The new document may land where `showing` already points -- at the
    // first document a source has, when the settings tab was all there was
    // to show.  The textarea is not holding that document, so say so:
    // otherwise show()'s stash writes the empty textarea over the template.
    if (at === this.showing)
      this.showing = -1;
    // ...and a source whose settings were all it had to show has a document
    // now, which is what the reader asked for by opening one
    this.onSettings = false;
    this.show(at);
  }

  removePane (n) {
    const doc = this.docAt(n);
    if (!doc)
      return;
    this.stash();
    const texts = this.panes[doc.param.name] || [];
    if (texts.length <= (doc.param.pane.min || 0))
      return;
    texts.splice(doc.index, 1);
    this.panes[doc.param.name] = texts;
    this.show(Math.min(this.showing, Math.max(0, this.documents().length - 1)));
  }

  /** Draw what the selected source asks for: its settings in the leftmost
   * pane, and one pane per document it takes to the right of them -- the
   * same tab set the shape map uses, so the data pane reads the way the
   * rest of the app does.
   *
   * The documents' panes are placeholders: one editing area is moved into
   * whichever is showing, so everything that has ever talked to "the data
   * textarea" -- drag and drop, dirty tracking, permalinks, the editors --
   * goes on talking to one element.
   */
  render () {
    const {moduleId} = ShExWebApp.NeighborhoodApi;
    const spec = this.paneParam;
    const container = $("#dataSource-tabs");
    const initialized = container.hasClass("ui-tabs");

    const fields = $("#neighborhoodFields").empty();
    const shown = this.fieldParams.filter(p => !(p.ui && p.ui.hidden));
    for (const param of shown.concat(this.hostParams()))
      fields.append(this.fieldFor(param));
    if (fields.children().length === 0)
      fields.append($("<span/>", {class: "noSettings"})
                    .text("nothing to configure for " + (this.module.label || this.module.name))
                    .attr("title", this.module.description || ""));

    // one tab and one (empty) panel per document, in the order the source
    // declared its parameters
    const tabs = $("#dataPaneTabs");
    tabs.children().not(":first").remove();
    container.children("div.dataPanePanel").remove();
    const docs = this.documents();
    docs.forEach(({param, index, text}, n) => {
      const id = "dataPanePanel-" + n;
      // the textarea holds the showing document -- while one is showing:
      // with the settings up it holds whatever was there last, which is not
      // what to name a tab after
      const showingText = n === this.showing && !this.onSettings
            ? this.textarea.val() : text;
      const title = (param.pane.titleOf && param.pane.titleOf(showingText))
            || (param.pane.max === 1 ? param.pane.label : param.pane.label + " " + (index + 1));
      tabs.append($("<li/>").append($("<a/>", {href: "#" + id, title: param.pane.label}).text(title)));
      container.append($("<div/>", {id, class: "dataPanePanel"}));
    });
    if (this.showing >= docs.length)
      this.showing = Math.max(0, docs.length - 1);

    const removable = this.docAt(this.showing);
    $("#dataPaneControls").toggle(docs.length > 0 || !!this.creatableParam);
    $("#addDataPane").toggle(!!this.creatableParam);
    $("#removeDataPane").toggle(!!removable &&
                                (this.panes[removable.param.name] || []).length >
                                (removable.param.pane.min || 0));

    // a source with no document has only its settings to show
    if (docs.length === 0)
      this.onSettings = true;
    if (initialized) {
      // refreshing re-activates a tab, which would answer the question this
      // is about to ask; say what should be active and ignore the widget's
      // own opinion while it settles
      const active = this.onSettings ? 0 : this.showing + 1;   // +1: settings is leftmost
      this.rendering = true;
      try {
        container.tabs("refresh");
        container.tabs("option", "active", active);
      } finally {
        this.rendering = false;
      }
    }
    this.showDocumentArea();
    $("#neighborhood").val(moduleId(this.module));
  }

  /** one labelled input for a parameter, remembering what's typed into it */
  fieldFor (param) {
    const id = "nbhd-" + param.name;
    const value = this.fields[param.name];
    const input = param.schema.type === "boolean"
          ? $("<input/>", {type: "checkbox", id})
            .prop("checked", value === undefined ? !!param.schema.default : !!value)
          : $("<input/>", {type: param.schema.type === "integer" || param.schema.type === "number"
                           ? "number" : "text", id,
                           placeholder: param.schema.default === undefined ? "" : String(param.schema.default),
                           value: value === undefined ? "" : value});
    input.attr("title", param.description || "");
    input.on("change keyup", () => {
      this.fields[param.name] = param.schema.type === "boolean" ? input.prop("checked") : input.val();
      this.onChange();
    });
    return $("<label/>", {for: id, class: "neighborhoodField"})
      .append($("<span/>").text(param.name), input);
  }

  /** Settings that belong to the data source but that this app, not the
   * module, carries out.  `slurp` is the one: recording the triples a
   * validation fetched is the host's doing, and it only means anything for
   * a source that fetches -- which is why it used to hide inside the "load
   * data" menu item and appear only once an endpoint was named. */
  hostParams () {
    // any source that fetches its answers -- by querying a service or by
    // translating some other representation -- has something to record
    return (this.module.capabilities || []).length > 0
      ? [{name: "slurp", schema: {type: "boolean"},
          description: "record what this validation fetches: the triples as Turtle, " +
          "so the same data can be validated without the source"}]
      : [];
  }

  /** Is this app recording what a validation fetches? */
  slurping () {
    return this.fields.slurp === true || this.fields.slurp === "true";
  }

  /** Where slurped triples go: the local store's Turtle document, so that
   * switching the picklist to Turtle afterwards validates the same data
   * without the service.  (They used to go into the pane that held the
   * `# Endpoint:` header, which came to the same thing once you deleted
   * the header.) */
  localTurtle () {
    const {paneParams, moduleId} = ShExWebApp.NeighborhoodApi;
    for (const module of this.modules) {
      // the registered source that holds an RDF document -- the "Turtle
      // data" pane -- found by what it takes rather than by its name
      const spec = paneParams(module.dbParams || []).find(
        p => ((p.schema.items || {}).contentMediaType || "") === "text/turtle");
      if (spec)
        return {id: moduleId(module), name: spec.name};
    }
    return null;
  }

  /** Record a page a translating source read, as one of its own documents:
   * a tab per entity, named by the id in it.  Slurping a Wikibase leaves
   * you the pages it visited, to edit and validate again. */
  addPageDocument (id, text) {
    const spec = this.paneParams.find(p => p.pane.creatable);
    if (!spec)
      return;
    this.stash();
    const texts = this.panes[spec.name] || [];
    const titleOf = spec.pane.titleOf || (() => null);
    const at = texts.findIndex(had => titleOf(had) === id);
    if (at === -1)
      texts.push(text);
    else
      texts[at] = text;
    this.panes[spec.name] = texts;
    // The pane this landed in may be the one the reader is looking at, and
    // a showing document's text is the textarea's rather than this -- so
    // the two have to agree, or they go on reading the page this replaced.
    const showing = this.onSettings ? null : this.docAt(this.showing);
    if (showing && showing.param.name === spec.name &&
        showing.index === (at === -1 ? texts.length - 1 : at))
      this.textarea.val(text);
  }

  /** Append to that document, and to the textarea too when it is the one
   * showing (so a slurp scrolls by as it happens, as it always has). */
  appendToLocalTurtle (text) {
    const target = this.localTurtle();
    if (!target)
      return;
    const showingIt = this.moduleId === target.id && !this.onSettings &&
          this.paneParam && this.paneParam.name === target.name && this.showing === 0;
    if (showingIt) {
      noScrollAppend(this.textarea, text);
      return;
    }
    const panes = this.panesFor(target.id);
    const texts = panes[target.name] || [""];
    texts[0] = (texts[0] || "") + text;
    panes[target.name] = texts;
  }

  /** What a slurp collected, brought forward.
   *
   * The recording goes to the local store's document, so that switching the
   * picklist to Turtle afterwards validates the same data without the
   * service.  But a source that fetches may have nothing of its own to show
   * -- a query service has no document at all -- and then the recording sits
   * in a pane the reader has no reason to open, which is what "slurp doesn't
   * do anything" looks like.  So a source with nothing to show hands over to
   * the one now holding what it read.  A Wikibase, whose slurp leaves a pane
   * per entity page it visited, keeps those instead.
   */
  showSlurped () {
    // It has its own to show -- the entity pages a Wikibase walk read, a tab
    // each, named after the entity in them.  Left in their tabs rather than
    // opened: a fetched page is half a megabyte of JSON, and opening one is
    // a decision for whoever wants to read it.
    if (this.documents().length > 0)
      return;
    const target = this.localTurtle();
    if (!target || this.moduleId === target.id)
      return;
    this.select(target.id);
    const at = this.documents().findIndex(d => d.param.name === target.name);
    if (at === -1)
      return;
    this.onSettings = false;
    this.show(at);
  }

  setLocalTurtle (text) {
    const target = this.localTurtle();
    if (!target)
      return;
    const panes = this.panesFor(target.id);
    panes[target.name] = [text];
    if (this.moduleId === target.id && this.showing === 0)
      this.textarea.val(text);
  }

  /** Wire the tab set up once the DOM is in place. */
  initTabs () {
    $("#dataSource-tabs").tabs({
      activate: (event, ui) => {
        if (this.rendering)
          return;                        // render() moving the tabs, not the user
        const panel = ui.newPanel.attr("id") || "";
        const m = panel.match(/^dataPanePanel-(\d+)$/);
        if (m) {
          this.onSettings = false;
          this.show(parseInt(m[1], 10));
        } else {
          // the settings pane: no document, so what the reader typed in the
          // one they are leaving has to be kept here -- nothing else is
          // holding it, and the tab it belongs to is named after it
          this.stash();
          this.onSettings = true;
          this.showDocumentArea();
          this.render();
        }
      },
    });
    $("#addDataPane").on("click", () => this.addPane());
    $("#removeDataPane").on("click", () => this.removePane(this.showing));
  }

  /** The editing area belongs to the document tabs, so it shows when one of
   * them is active and not when the settings pane is -- and not at all for
   * a source with no document to edit.  It sits below the tab set rather
   * than inside a panel: the panels are empty placeholders, which keeps the
   * one textarea (and whatever editor has taken it over) in one place.
   */
  showDocumentArea () {
    const showing = this.documents().length > 0 && !this.onSettings;
    const area = $("#dataArea");
    $("#dataDocument").toggle(showing);
    if (showing) {
      // an editor measures nothing while it is hidden, so what it drew
      // before is what it keeps until it is told to look again
      if (this.onShown)
        this.onShown();
      // This used to remember how tall the block was with a document in
      // it, so that showing the settings pane -- a line or two -- didn't
      // let everything below jump up.  The column fills the space above the
      // results now and the document is what takes the slack, so nothing
      // below it moves either way, and a remembered height would only stop
      // the column shrinking when the reader drags the results up.
      area.css("min-height", "");
    }
  }

  /** the language of the pane now showing, for the editors */
  paneEditor () {
    const spec = this.paneParam;
    return spec ? (spec.pane.editor || null) : null;
  }

  /** what the data pane is showing, for its heading */
  dialect () {
    const spec = this.paneParam;
    return spec ? spec.pane.label : (this.module.label || this.module.name);
  }

  /** Fill the picklist and draw the starting source's configuration. */
  init () {
    const {moduleId} = ShExWebApp.NeighborhoodApi;
    const select = $("#neighborhood").empty();
    for (const module of this.modules)
      select.append($("<option/>", {value: moduleId(module)})
                    .text(module.label || module.name)
                    .attr("title", module.description || ""));
    select.on("change", () => this.select(select.val()));
    this.initTabs();
    this.render();
  }

  /** QueryParams descriptors: the data source itself, and every value any
   * loaded source asks to be told.  Parameters are keyed by meaning rather
   * than by module, so `endpoint=` in a permalink or a manifest entry
   * belongs to whichever source is selected and asks for one.
   *
   * The locations are stand-ins rather than DOM elements: the field for a
   * parameter exists only while the source that declares it is selected,
   * but its value has to survive the picklist either way. */
  queryParams () {
    const {moduleId, fieldParams} = ShExWebApp.NeighborhoodApi;
    const stub = (get, set) => ({
      val: function (v) { return v === undefined ? get() : set(v); },
      prop: () => undefined,
    });
    const params = [
      {queryStringParm: "neighborhood", deflt: moduleId(this.modules[0]),
       manifest: {key: "neighborhood"},
       location: stub(() => this.moduleId, v => this.select(v || moduleId(this.modules[0])))},
    ];
    const seen = new Set();
    for (const module of this.modules)
      for (const param of fieldParams(module.dbParams || [])) {
        if (seen.has(param.name) || (param.ui && param.ui.hidden))
          continue;
        seen.add(param.name);
        params.push({
          queryStringParm: param.name, deflt: "", manifest: {key: param.name},
          location: stub(
            () => {
              // only the selected source's parameters describe this state
              const mine = fieldParams(this.module.dbParams || []).some(p => p.name === param.name);
              const value = mine ? this.fields[param.name] : undefined;
              return value === undefined || value === false ? "" : String(value);
            },
            v => {
              if (v === "" || v === undefined)
                delete this.fields[param.name];
              else
                this.fields[param.name] = param.schema.type === "boolean" ? v !== "false" : v;
              this.render();
              this.onChange();     // the db was built from the old value
            }),
        });
      }
    return params;
  }
}
