/*
  Classes and constants common to all shex{,map}{simple,worker}.
 */
const START_SHAPE_LABEL = "START";
const INPUTAREA_TIMEOUT = 250;
const VALIDATE_LABEL = "validate (ctl-enter)";
const NO_MANIFEST_LOADED = "no manifest loaded";

const START_SHAPE_INDEX_ENTRY = "- start -"; // specificially not a JSON-LD @id form.
// flip by hand for a per-step trace: makeConsoleTracker on this thread,
// track messages from the worker.  Not dead code; a debug tap.
const LOG_PROGRESS = false;
const SPARQL_get_items_limit = 50;
// heads the focus-node menu over a query map: take every node the query
// named, as a row each.  The query's materialize -- as a view is
// materialized -- and nothing to do with ShExMap's, which builds a graph.
const MENU_ITEM_materialize = "- materialize -"
const GIST_TOKEN_KEY = "githubGistToken"; // localStorage key for Menu → Create Gist
const GIST_INLINE_LINES = 15; // longer texts become separate gist files
const GIST_CREATED_KEY = "shexjsCreatedGist"; // sessionStorage handoff across the post-create reload

const DefaultBase = location.origin + location.pathname;
// this app's own results, once a plugin's results sit beside them
const APP_RESULTS_TAB = "validationResults";
let SharedForTests = null; // testing global used by browser-test

/** what is registered, or nothing where a page loaded no register */
function pluginDescriptors () {
  return typeof ShExPlugins === "undefined" ? [] : ShExPlugins.all();
}

/** every registered plugin's worker half, absolute: a worker resolves a
 * relative importScripts against its own script, not against the page */
function pluginWorkerUrls () {
  return pluginDescriptors().filter(ext => ext.worker)
    .map(ext => new URL(ext.worker, ext.baseUrl || DefaultBase).href);
}

function ldToTurtle (ld, termToLex) {
  return typeof ld === "object"
    ? lit(ld)
    : termToLex(
      ld.startsWith("_:")
        ? RdfJs.DataFactory.blankNode(ld.substr(2))
        : RdfJs.DataFactory.namedNode(ld)
    );
  function lit (o) {
    let ret = "\""+o["@value"].replace(/["\r\n\t]/g, (c) => {
      return {'"': "\\\"", "\r": "\\r", "\n": "\\n", "\t": "\\t"}[c];
    }) +"\"";
    if ("@type" in o)
      ret += "^^<" + o["@type"] + ">";
    if ("@language" in o)
      ret += "@" + o["@language"];
    return ret;
  }
}

/** Which spelling the messages use: see the `spelling` control. */
function termSpelling () {
  return $("#spelling").val() === "explicit" ? "explicit" : "document";
}

/**
 * How to spell a term in a report that isn't tied to a document range: the
 * human interface's indented tree, which is a block of text about a result
 * rather than a mark on a line.
 *
 * The editors do better than this -- they have the range the term was
 * written in, so they can quote it (see mapValidationErrors) -- but a block
 * of text has only the document's prefixes and base to go on, which is what
 * a data cache's meta is.  Shapes are named by the schema and left to it.
 */
function termLexerFor (dataCache) {
  if (termSpelling() !== "document")
    return undefined;
  const meta = dataCache && dataCache.meta;
  if (!meta || typeof meta.termToLex !== "function")
    return undefined;
  return (term, role) => {
    if (role === "shape")
      return null;
    try {
      const said = meta.termToLex(
        typeof term === "string"
          ? (term.startsWith("_:")
             ? RdfJs.DataFactory.blankNode(term.substr(2))
             : RdfJs.DataFactory.namedNode(term))
          : term);
      return typeof said === "string" && said !== "" ? said : null;
    } catch (e) {
      return null;   // a term this document has no better name for
    }
  };
}

/**
 * The highlight switch: whether hovering a constraint, a triple or a binding
 * lights up its counterparts in the other panes.
 *
 * Three resting positions and a momentary override, which is AutoCAD's ortho
 * (F8 locks, Shift inverts) and Raskin's quasimode: a state your finger is
 * holding open is a state you cannot forget you are in.
 *
 *   on    highlight follows the mouse; holding Shift *suspends* it, so you
 *         can cross the panes to read a frozen highlight without disturbing it
 *   hold  quiet until you hold Shift, then live -- the accelerator position
 *   off   never, for readers who find it noisy
 *
 * Freezing is separate and stronger: a click pins what is showing, and the
 * mouse stops changing it until it is released (Escape, or a click on
 * something else).  That is the answer to the standing problem with linked
 * highlighting -- you cannot travel to the thing being pointed at without
 * losing the pointer.  Pinning also scrolls every pane to its counterpart,
 * which is the navigation half.
 */
/** The pin gesture, per platform.
 *
 * ctrl-click on a Mac is the context menu, so the Mac spelling is cmd --
 * which is what every IDE does, and for this reason.  Taking *both*
 * everywhere would mean Mac users raising a menu every time they pinned.
 */
const PIN_WITH_META = /Mac|iPhone|iPad|iPod/.test(
  (typeof navigator === "undefined" ? "" : (navigator.platform || navigator.userAgent)));
function isPinGesture (evt) {
  const meta = !!(evt && evt.metaKey), ctrl = !!(evt && evt.ctrlKey);
  return PIN_WITH_META ? (meta && !ctrl) : (ctrl && !meta);
}

const HighlightMode = {
  ORDER: ["on", "hold", "off"],
  state: "on",              // discoverable by default; see the note above
  held: false,              // the momentary key is down
  pinned: null,             // a frozen group, or null
  listeners: [],

  /** does a hover paint right now? */
  live () {
    if (this.state === "off")
      return false;
    return this.state === "hold" ? this.held : !this.held;
  },
  /** ...and is what is painted allowed to change? */
  frozen () { return this.pinned !== null; },

  set (state) {
    if (this.ORDER.indexOf(state) === -1 || state === this.state)
      return;
    this.state = state;
    this.changed();
  },
  cycle () {
    this.set(this.ORDER[(this.ORDER.indexOf(this.state) + 1) % this.ORDER.length]);
  },
  setHeld (held) {
    if (held === this.held)
      return;
    this.held = held;
    this.changed();
  },
  pin (group) { this.pinned = group || null; this.changed(); },
  unpin () { if (this.pinned !== null) { this.pinned = null; this.changed(); } },

  onChange (fn) { this.listeners.push(fn); },
  changed () {
    this.render();
    this.listeners.forEach(fn => { try { fn(this); } catch (e) { console.warn(e); } });
  },

  /** the chip: what the switch is set to, and whether anything is frozen */
  render () {
    const chip = $("#highlightMode");
    if (chip.length === 0)
      return;
    const live = this.live();
    const says = {on: "highlight: on", hold: "highlight: hold ⇧", off: "highlight: off"}[this.state];
    chip.text(says + (this.frozen() ? " · frozen" : ""))
      .attr("data-state", this.state)
      .attr("data-live", live ? "yes" : "no")
      .attr("data-frozen", this.frozen() ? "yes" : "no")
      .attr("aria-pressed", live ? "true" : "false")
      .attr("title",
            "hovering a constraint, triple or binding lights up its counterparts"
            + "\n\non — follows the mouse (hold ⇧ to suspend)"
            + "\nhold — only while ⇧ is held"
            + "\noff — never"
            + "\n\nclick to cycle, or ctrl-alt-h"
            + "\n" + (PIN_WITH_META ? "⌘" : "ctrl")
            + "-click a highlight to freeze it and go there; Escape releases");
  },

  /** the chip, the keystroke, and the momentary key */
  wire () {
    $("#highlightMode").off("click").on("click", () => this.cycle());
    $(document).on("keydown.highlightMode", evt => {
      if (evt.key === "Shift")
        this.setHeld(true);
      // ctrl-alt-h: rare in browsers, and the app already speaks ctrl-<key>
      if ((evt.ctrlKey || evt.metaKey) && evt.altKey && (evt.key === "h" || evt.key === "H")) {
        evt.preventDefault();
        this.cycle();
      }
      if (evt.key === "Escape" && this.frozen())
        this.unpin();
    });
    $(document).on("keyup.highlightMode", evt => {
      if (evt.key === "Shift")
        this.setHeld(false);
    });
    // a modifier released while the window was away never reaches us
    $(window).on("blur.highlightMode", () => this.setHeld(false));
    this.render();
  },
};

class InterfaceCache {
  // caches for textarea parsers
  constructor (selection, onLoad) {
    this._dirty = true;
    this.selection = selection;
    this.onLoad = onLoad;
    this.parsed = null; // a Promise
    this.url = undefined; // only set if inputarea caches some web resource.
    this.meta = { prefixes: {}, base: DefaultBase };
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
    return { url: url, data: data };
  }

  callOnLoad () {
    if (this.onLoad)
      this.onLoad();
  }
}

class SchemaCache extends InterfaceCache {
  constructor (selection, onLoad, shexcParser, turtleParser) {
    super(selection, onLoad);
    this.shexcParser = shexcParser;
    this.turtleParser = turtleParser;
    this.graph = null;
    this.language = null;

    this.meta.termToLex = (trm) => trm === ShExWebApp.Validator.Start
      ? START_SHAPE_LABEL
      : ShExWebApp.ShExTerm.shExJsTerm2Turtle(trm, this.meta, true);
    this.meta.lexToTerm = (lex) => lex === START_SHAPE_LABEL
      ? ShExWebApp.Validator.Start
      : turtleParser.termToLd(lex, new IRIResolver(this.meta));
  }

  async parse (text, base) {
    const parseShExR = () => {
      const graphParser = new ShExWebApp.Validator(
        this.shexcParser.parseString(ShExRSchema, {}, base), // !! do something useful with the meta parm (prefixes and base)
        ShExWebApp.RdfJsDb(this.graph),
        {}
      );
      const schemaRoot = this.graph.getQuads(null, ShExWebApp.Util.RDF.type, "http://www.w3.org/ns/shex#Schema")[0].subject; // !!check
      const val = graphParser.validateNodeShapePair(schemaRoot, ShExWebApp.Validator.Start); // start shape
      return ShExWebApp.Util.ShExJtoAS(ShExWebApp.Util.ShExRtoShExJ(ShExWebApp.Util.valuesToSchema(ShExWebApp.Util.valToValues(val))));
    }

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
    this.callOnLoad();
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
  }

  async getItems () {
    const obj = await this.refresh();
    const start = "start" in obj ? [START_SHAPE_LABEL] : [];
    const rest = "shapes" in obj ? obj.shapes.map(se => this.meta.termToLex(se.id)) : [];
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
      return null; // signal caller that text isn't Turtle
    }
  }
}

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

  /** the document a tab is showing, with the textarea's text in it */
  docAt (n) {
    const docs = this.documents();
    if (n < 0 || n >= docs.length)
      return null;
    const doc = docs[n];
    return Object.assign({}, doc, n === this.showing ? {text: this.textarea.val()} : {});
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
    const doc = this.docAt(this.showing);
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
    this.show(this.documents().findIndex(
      d => d.param.name === spec.name && d.index === texts.length - 1));
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
      const showingText = n === this.showing ? this.textarea.val() : text;
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
        this.onSettings = !m;
        if (m)
          this.show(parseInt(m[1], 10));
        else
          this.showDocumentArea();       // the settings pane: no document
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
      // and remember how tall this block is with a document in it, so that
      // showing the settings pane -- which is a line or two -- doesn't let
      // everything below jump up.  Measured rather than declared: the
      // document is a textarea, or an editor, or an editor the reader has
      // resized.
      area.css("min-height", "");
      const height = area.outerHeight();
      if (height)
        area.css("min-height", height + "px");
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

class TurtleCache extends InterfaceCache {
  constructor (selection, onLoad, turtleParser, queryTrackerController) {
    super(selection, onLoad);
    this.turtleParser = turtleParser;
    this.queryTrackerController = queryTrackerController;
    this.meta.termToLex = (trm) => ShExWebApp.ShExTerm.rdfJsTerm2Turtle(trm, this.meta);
    this.meta.lexToTerm = (lex) => turtleParser.termToLd(lex, new IRIResolver(this.meta));
  }

  /** Which neighborhood serves this pane is the modules' business, not this
   * app's: each says whether it answers to the pane's text and with what
   * parameters (claimPaneText), and the app builds whichever claims it
   * (fromParams).  A module that declares a `data` parameter -- rdfjs --
   * gets the parsed store, since the Turtle parser and this pane's
   * prefixes and base live here.
   */
  async parse (text, base) {
    const module = this.neighborhoods.module;
    const params = this.neighborhoods.params();

    // The dirty bit says "something the user touched changed", which is
    // true of every keystroke in a settings field; whether *this source's*
    // inputs changed is a different question, and for a source that fetches
    // its answers rebuilding when they haven't costs a round trip and a
    // translation for nothing.  A local store is rebuilt regardless: it is
    // cheap, and parsing the document is also how this pane learns its
    // prefixes and base.
    const fetches = (module.capabilities || []).length > 0;
    const signature = JSON.stringify([ShExWebApp.NeighborhoodApi.moduleId(module), params, base,
                                      // the tracker is an input too: turning slurp on has to
                                      // build a db that reports what it fetches
                                      !!this.queryTrackerController.queryTracker]);
    if (fetches && this.parsed && signature === this.dbSignature)
      return this.parsed;
    this.dbSignature = signature;

    if ("endpoint" in params)
      this.endpoint = params.endpoint;    // the SPARQL shape-map extension reads this
    else
      delete this.endpoint;

    // A pane of Turtle is this app's to parse: it owns the parser, and the
    // prefixes and base it finds are what the rest of the app lexifies
    // nodes with.  Panes of anything else go to the module as text.
    const turtlePane = ShExWebApp.NeighborhoodApi.paneParams(module.dbParams || [])
          .find(p => ((p.schema.items || {}).contentMediaType || "") === "text/turtle");
    if (turtlePane)
      params.store = this.turtleParser.parseDocuments(
        params[turtlePane.name] || [], this.meta, base);

    const res = module.fromParams(params, this.queryTrackerController.queryTracker);
    // A db that can go to the network offers a second face which asks with
    // fetch() rather than with a synchronous XMLHttpRequest.  Take it: a
    // blocking request freezes the tab -- every editor, every button -- for
    // as long as the endpoint takes to answer, and a wikidata walk makes one
    // per entity it reaches.  Validation awaits it (see invoke).
    this.callOnLoad();
    return module.asAsyncDb && typeof res.getNeighborhoodAsync === "function"
      ? module.asAsyncDb(res)
      : res;
  }

  /** Resolve a query map extension -- SPARQL "SELECT ...", QENTITIES "42"
   * -- by asking the selected data source, which is the only thing that can
   * know what the question means.  A source that does not offer the
   * extension says so by name, rather than failing obscurely or running the
   * question against something that was never configured.
   */
  async resolveQueryMapExtension (language, lexical) {
    const {queryMapResolverFor, extensionName, moduleId} = ShExWebApp.NeighborhoodApi;
    const module = this.neighborhoods.module;
    const resolver = queryMapResolverFor(module, language);
    if (!resolver)
      throw Error("the QueryMap extension " + extensionName(language) +
                  " is not supported by the neighborhood " + moduleId(module));
    // await: a resolver over an endpoint answers with a promise
    return await resolver.resolve(lexical, await this.refresh());
  }

  /** how a query map extension is written back out: by the name the source
   * knows it as */
  writeQueryMapExtension (language, lexical) {
    const {queryMapResolverFor, extensionName} = ShExWebApp.NeighborhoodApi;
    const resolver = queryMapResolverFor(this.neighborhoods.module, language);
    return (resolver ? resolver.name : extensionName(language)) +
      " '''" + lexical.replace(/'''/g, "''\\'") + "'''";
  }

  /** candidate focus nodes for the shape-map menus.
   *
   * A db that offers its own typeahead (NeighborhoodWebAppDb's optional
   * suggestFocusNodes) is asked first: it knows what its nodes are, where
   * this app can only guess by looking at whatever triples are loaded --
   * which for the wikidata neighborhood would offer statement and value
   * nodes alongside the entities anyone would actually validate.
   */
  async getItems () {
    const data = await this.refresh();
    if (typeof data.suggestFocusNodes === "function")
      return data.suggestFocusNodes("", SPARQL_get_items_limit)
        .map(suggestion => this.meta.termToLex(RdfJs.DataFactory.namedNode(suggestion.label)));
    if (this.endpoint) {
      const q = "SELECT DISTINCT ?s { ?s ?p ?o } LIMIT " + SPARQL_get_items_limit;
      // (this read ShEx.Util, which is not a thing in this file: the menu
      // has been quietly falling back to "no choices found" over endpoints)
      // ...Promise: a blocking request here freezes the tab while someone is
      // typing into the menu it fills, which is the worst possible moment
      const rows = await ShExWebApp.Util.executeQueryPromise(
        q, this.endpoint, RdfJs.DataFactory);
      return [MENU_ITEM_materialize].concat(rows.map(row => this.lexifyFirstColumn(row)));
    }
    return data.getQuads().map(t => this.meta.termToLex(t.subject));
  }

  lexifyFirstColumn (row) {
    return this.meta.termToLex(row[0]); // row[0] is the first column.
  }
}

class ManifestCache extends InterfaceCache {
  // manifest-descriptor keys pickSchema/pickData/queryMapLoaded handle
  // themselves; loadExtraInputs loads the rest
  static pickLoadedKeys = ["schema", "data", "queryMap"];

  constructor (selection, caches, resultsWidget) {
    super(selection, null);
    this.caches = caches;
    this.resultsWidget = resultsWidget;
    this.queryParams = null; // the app's QueryParams registry, assigned post-construction
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
        try {
          textOrObj = JSON.parse(textOrObj);
        } catch (eJson) {
          try {
            textOrObj = ShExWebApp.JsYaml.load(textOrObj);
          } catch (eYaml) {
            throw url.endsWith(".yaml")
              ? eYaml
              : eJson;
          }
        }
      } catch (e) {
        $("#inputSchema .manifest").append($("<li/>").text(NO_MANIFEST_LOADED));
        const throwMe = Error(e + '\n' + textOrObj);
        throwMe.action = 'load manifest'
        throw throwMe
        // @@DELME(2017-12-29)
        // transform deprecated examples.js structure
        // textOrObj = eval(textOrObj).reduce((acc, schema) => {
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
              ldToTurtle(action.focus, this.caches.inputData.meta.termToLex)
              + "@"
              + ("shape" in action ? this.caches.inputSchema.meta.termToLex(action.shape, false) : START_SHAPE_LABEL);
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
      // `sitematrix` is here because it is a document reference like the
      // others, and a manifest's references are relative to the *manifest*.
      // Left out, it was resolved against whichever page loaded the manifest
      // -- so "../examples/wikidata-sitematrix.json" found the file from
      // shex-webapp/doc/ and 404'd from extension-map/doc/, which is the same
      // manifest read by a different app.
      ["schemaURL", "dataURL", "queryMapURL", "sitematrix"].forEach(parm => {
        if (parm in elt) {
          // an entry may name several documents under one key; each is a
          // reference of its own, not one comma-joined reference
          elt[parm] = Array.isArray(elt[parm])
            ? elt[parm].map(each => new URL(each, url).href)
            : new URL(elt[parm], url).href;
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
          this.resultsWidget.append($("<pre/>").text(
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
    const listItems = Object.keys(this.caches).reduce((acc, k) => {
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
        entry.text = await this.fetchOK(entry.url).catch(responseOrError => {
          // leave a message in the schema or data block
          return "# " + this.renderErrorMessage(
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
        listItems[side][ManifestCache.sum(entry.text)] = li;
        // enable and get rid of the "..." in the label now that it's loaded
        button.text(entry.label).removeAttr("disabled");
      }
    }))
    this.setTextAreaHandlers(listItems);
  }

  setTextAreaHandlers (listItems) {
    const timeouts = Object.keys(this.caches).reduce((acc, k) => {
      acc[k] = undefined;
      return acc;
    }, {});

    Object.keys(this.caches).forEach((cache) => {
      this.caches[cache].selection.keyup((e) => { // keyup to capture backspace
        const code = e.keyCode || e.charCode;
        // if (!(e.ctrlKey)) {
        //   this.resultsWidget.clear();
        // }
        if (!(e.ctrlKey && (code === 10 || code === 13))) {
          later(e.target, cache, this.caches[cache]);
        }
      });
    });

    function later (target, side, cache) {
      cache.dirty(true);
      if (timeouts[side])
        clearTimeout(timeouts[side]);

      timeouts[side] = setTimeout(() => {
        timeouts[side] = undefined;
        const curSum = ManifestCache.sum($(target).val());
        if (curSum in listItems[side])
          listItems[side][curSum].addClass("selected");
        else
          $("#"+side+" .selected").removeClass("selected");
        delete cache.url;
      }, INPUTAREA_TIMEOUT);
    }
  }

  /** A data source that takes several documents -- a Wikibase's entity
   * pages, say -- is given them as an array under the same `data`/`dataURL`
   * keys one document uses.  The first is the entry's document as far as
   * every existing path is concerned (the pick machinery, `.selected`
   * matching, the load dialog); the rest are fetched at pick time. */
  makeDataEntry (dataLabel, idx, elt, base) {
    const texts = elt.data === undefined ? [] : [].concat(elt.data);
    const urls = elt.dataURL === undefined ? [] : [].concat(elt.dataURL);
    return {
      label: dataLabel || idx.toString(),
      // no document named at all means the source is the data (a query
      // service); "" rather than undefined, which would send paintManifest
      // fetching a URL that isn't there
      text: texts.length > 0 ? texts[0] : (urls.length > 0 ? undefined : ""),
      url: urls.length > 0 ? urls[0] : (elt.data ? base : undefined),
      moreTexts: texts.slice(1),
      moreUrls: urls.slice(1),
      entry: elt
    };
  }

  async pickSchema (name, schemaTest, elt, listItems, side) {
    if ($(elt).hasClass("selected")) {
      await this.clearAll();
    } else {
      await this.caches.inputSchema.set(schemaTest.text, new URL((schemaTest.url || ""), DefaultBase).href);
      this.caches.inputSchema.url = undefined; // @@ crappyHack1
      $("#inputSchema .status").text(name);

      this.clearData();
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
        await this.caches.inputSchema.refresh();
      } catch (e) {
        this.resultsWidget.failMessage(e, "parsing schema");
      }
    }
  }

  async pickData (name, dataTest, elt, listItems, side) {
    this.clearData();
    if ($(elt).hasClass("selected")) {
      $(elt).removeClass("selected");
    } else {
      // Which data source this entry is for, before its documents land in
      // the panes: the same `neighborhood` key a permalink uses, defaulting
      // to the first source (a local store) as manifests always meant.
      const neighborhoods = this.caches.inputData.neighborhoods;
      if (neighborhoods)
        neighborhoods.select(dataTest.entry.neighborhood ||
                             ShExWebApp.NeighborhoodApi.moduleId(neighborhoods.modules[0]));
      // ...and everything else the entry configures it with, before the
      // query map below asks it anything: a source with its endpoint still
      // to come is a source that can't answer.
      // An entry may name the plugins it needs.  They add the panes,
      // and the manifest keys that fill them, that the rest of this entry
      // is read into -- so they load before anything reads it.
      await this.loadEntryPlugins(dataTest);
      await this.loadExtraInputs(dataTest);
      // Update data pane.  An entry may name several documents, and where
      // they go is the source's business: a Wikibase told an entity page
      // knows it is a page, and which ids it is about.
      const documents = [dataTest.text === undefined ? "" : dataTest.text]
            .concat(await this.extraDataDocuments(dataTest));
      await this.caches.inputData.set(dataTest.text, new URL((dataTest.url || ""), DefaultBase).href);
      if (neighborhoods)
        neighborhoods.setDocuments(documents);
      this.caches.inputData.url = undefined; // @@ crappyHack1
      $("#inputData .status").text(name);
      $("#inputData li.selected").removeClass("selected");
      $(elt).addClass("selected");
      try {
        await this.caches.inputData.refresh();
      } catch (e) {
        this.resultsWidget.failMessage(e, "parsing data");
      }

      // Update ShapeMap pane.
      this.caches.shapeMap.removeEditMapPair(null);
      if (dataTest.entry.queryMap !== undefined) {
        await this.queryMapLoaded(dataTest, dataTest.entry.queryMap);
      } else if (dataTest.entry.queryMapURL !== undefined) {
        try {
          const resp = await this.fetchOK(dataTest.entry.queryMapURL)
          ManifestCache.queryMapLoaded(dataTest, resp);
        } catch (e) {
          this.renderErrorMessage(e, "queryMap");
        }
      } else {
        this.resultsWidget.append($("<div/>").text("No queryMap or queryMapURL supplied in manifest").addClass("warning"));
      }
    }
  }

  /** Load the picked entry's inputs beyond the schema/data/queryMap pick
   * machinery above, driven by the app's QueryParams manifest descriptors
   * (assigned post-construction): shexmap's staticVars, outputSchema[URL] and
   * outputShapeMap; nothing in shex-simple.  <key>URL values resolve against
   * the manifest's base, and their fetched text memoizes into the entry. */
  /** the plugin modules an entry names, resolved against the manifest.
   * `plugins` is the key; `extensions` is what it was called before the
   * word was split from the semantic-action kind, and still answers. */
  async loadEntryPlugins (dataTest) {
    const named = dataTest.entry.plugins !== undefined
          ? dataTest.entry.plugins : dataTest.entry.extensions;
    if (named === undefined)
      return;
    for (const url of Array.isArray(named) ? named : [named]) {
      const absolute = new URL(url, this.url || dataTest.url || DefaultBase).href;
      try {
        await this.caches.plugin.asyncGet(absolute);
      } catch (e) {
        this.renderErrorMessage(e, "plugin");
      }
    }
  }

  async loadExtraInputs (dataTest) {
    for (const q of this.queryParams || []) {
      const m = q.manifest;
      if (m === undefined || ManifestCache.pickLoadedKeys.indexOf(m.key) !== -1)
        continue;
      let value = dataTest.entry[m.key];
      let url = dataTest.url;
      if (value === undefined && dataTest.entry[m.key + "URL"] !== undefined) {
        // against the manifest, where the entry was written: an entry whose
        // documents are in different directories (schemaURL: calc/calc.shex,
        // overlayURL: calc/calc-actions.ttl) means them from one place
        url = dataTest.entry[m.key + "URL"] =
          new URL(dataTest.entry[m.key + "URL"], this.url || dataTest.url || DefaultBase).href;
        try {
          value = dataTest.entry[m.key] = await this.fetchOK(url);
        } catch (e) {
          this.renderErrorMessage(e, m.key);
          continue;
        }
      }
      if (m.asYamlObject)
        value = JSON.stringify(value === undefined ? {} : value, null, "  ");
      else if (value === undefined)
        value = "deflt" in q ? q.deflt : ""; // absent in this entry: don't leak the last one's
      if ("cache" in q)
        await q.cache.set(value, url);
      else
        q.location.val(value);
    }
  }

  /** the entry's documents after the first, fetched if it named them by URL */
  async extraDataDocuments (dataTest) {
    const texts = (dataTest.moreTexts || []).slice();
    for (const url of dataTest.moreUrls || []) {
      const absolute = new URL(url, dataTest.url || DefaultBase).href;
      try {
        texts.push(await this.fetchOK(absolute));
      } catch (e) {
        this.renderErrorMessage(e, "data");
      }
    }
    return texts;
  }

  async queryMapLoaded (dataTest, text) {
    dataTest.entry.queryMap = text;
    try {
      $("#queryMap").val(JSON.parse(dataTest.entry.queryMap).map(entry => `<${entry.node}>@<${entry.shape}>`).join(",\n"));
    } catch (e) {
      $("#queryMap").val(dataTest.entry.queryMap);
    }
    await this.caches.shapeMap.copyQueryMapToEditMap();
    // callValidator();
  }

  fetchOK (url) {
    return fetch(url).then(responseOrError => {
      if (!responseOrError.ok) {
        throw responseOrError;
      }
      return responseOrError.text()
    });
  }

  renderErrorMessage (response, what) {
    const message = "failed to load " + what + " from <" + response.url + ">, got: " + response.status + " " + response.statusText;
    this.resultsWidget.append($("<pre/>").text(message).addClass("error"));
    return message;
  }

  async clearData () {
    // Clear out data textarea.
    await this.caches.inputData.set("", DefaultBase);
    $("#inputData .status").text(" ");
    delete this.caches.inputData.endpoint;
    // ...and the documents beside it.  The textarea holds one document of
    // however many the source has, so emptying it used to leave the rest
    // standing: pick the example with an observation and a patient, then
    // pick any other example, and its two tabs were still there with none
    // of the new example's data in either of them.
    const neighborhoods = this.caches.inputData.neighborhoods;
    if (neighborhoods)
      neighborhoods.forgetDocuments();

    // Clear out every form of ShapeMap.
    $("#queryMap").val("").removeClass("error");
    this.caches.shapeMap.makeFreshEditMap();
    $("#fixedMap").find("tbody").empty();

    this.resultsWidget.clear();
  }

  async clearAll () {
    $("#results .status").hide();
    await this.caches.inputSchema.set("", DefaultBase);
    $(".inputShape").val("");
    $("#inputSchema .status").text(" ");
    $("#inputSchema li.selected").removeClass("selected");
    this.clearData();
    $("#inputData .passes, #inputData .fails").hide();
    $("#inputData .passes p:first").text("");
    $("#inputData .fails p:first").text("");
    $("#inputData .passes ul, #inputData .fails ul").empty();
  }

  static sum (s) { // cheap way to identify identical strings
    return s.replace(/\s/g, "").split("").reduce((a,b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a
    }, 0);
  }
}

const ShExJsUrl = 'https://github.com/shexSpec/shex.js'
/**
 * A plugin module, fetched and run.
 *
 * One module, whatever it has to add: a semantic-action extension is
 * `register(validator, ShExWebApp)`, and what it adds to the page is a
 * descriptor for ShExPlugins -- exported as `ui`, or handed to
 * `ShExPlugins.register` while the module evaluates, which is what a
 * module written as a page script does.  Either or both; a module that
 * does neither is not a plugin, and says so.
 */
class PluginCache extends InterfaceCache {
  constructor (selection, resultsWidget) {
    super(selection, null);
    this.resultsWidget = resultsWidget;
    this.urls = []; // every plugin loaded, for the permalink
  }

  async set (code, url, source, mediaType) {
    this.url = url; // @@crappyHack1 -- parms should differntiate:
    try {
      // exceptions pass through to caller (asyncGet)

      // const resp = await fetch('http://localhost/checkouts/shexSpec/extensions/Eval/')
      // const text = await resp.text();
      if (mediaType.startsWith('text/html'))
        return this.grepHtmlIndexForPackage(code, url, source)

      const before = pluginDescriptors().map(d => d.id);
      // a module registers while it evaluates, and what it registers has to
      // know where it came from before anything of it is applied
      if (typeof ShExPlugins !== "undefined")
        ShExPlugins.loadingFrom = url;
      // `exports` as well as `module`: a UMD bundle asks for both before it
      // decides it is being loaded as a CommonJS module, and hangs itself on
      // the window if it isn't
      const loaded = Function(`"use strict";
const module = {exports: {}};
const exports = module.exports;
${code}
return module.exports;
`)()
      if (typeof ShExPlugins !== "undefined")
        ShExPlugins.loadingFrom = null;
      if (loaded.ui && typeof ShExPlugins !== "undefined")
        ShExPlugins.register(loaded.ui);
      const painted = pluginDescriptors().filter(d => before.indexOf(d.id) === -1);
      painted.forEach(d => { if (!d.baseUrl) d.baseUrl = url; });
      const handles = typeof loaded.register === "function";
      if (!handles && painted.length === 0)
        throw Error("no plugin here: a module registers a semantic action handler,"
                    + " or hands ShExPlugins what it adds to the page, or both");
      if (this.urls.indexOf(url) === -1)
        this.urls.push(url);
      // a plugin is loaded when what it registered has been applied,
      // which may have meant fetching the module it runs on
      await Promise.all(painted.map(d => d.applied));
      if (!handles) {
        this.resultsWidget.append($("<div/>").append(
          $("<span/>").text(`plugin ${painted.map(d => d.label || d.id).join(", ")} loaded from <${url}>`)
        ));
        return;
      }
      const name = loaded.name;
      const id = "plugin_" + name;

      // Delete any old li associated with this plugin.
      const old = $(`.pluginControl[data-url="${loaded.url}"]`)
      if (old.length) {
        this.resultsWidget.append($("<div/>").append(
          $("<span/>").text(`removing old ${old.attr('data-name')} plugin`)
        ));
        old.parent().remove();
      }

      // Create a new li.
      const elt = $("<li/>", { class: "menuItem", title: loaded.description }).append(
        $("<input/>", {
          type: "checkbox",
          checked: "checked",
          class: "pluginControl",
          id: id,
          "data-name": name,
          "data-url": loaded.url
        }),
        $("<label/>", { for: id }).append(
          $("<a/>", {href: loaded.url, text: name})
        )
      );
      elt.insertBefore("#load-plugin-button");
      $("#" + id).data("code", loaded);

      this.resultsWidget.append($("<div/>").append(
        $("<span/>").text(`plugin ${name} loaded from <${url}>`)
      ));
    } catch (e) {
      // $("#inputSchema .plugin").append($("<li/>").text(NO_PLUGIN_LOADED));
      const throwMe = Error(e + '\n' + code);
      throwMe.action = 'load plugin'
      throw throwMe
    }
    // $("#pluginDrop").show(); // may have been hidden if no plugin loaded.
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
      this.resultsWidget.append($("<div/>").append(
        $("<span/>").text("unparsable extension index at " + url)
      ).addClass("error"));
      return;
    }
    const tr = $(impls).find(`tr td[resource="${ShExJsUrl}"]`).parent()
    if (tr.length !== 1) {
      this.resultsWidget.append($("<div/>").append(
        $("<span/>").text("no entry for shexjs in index HTML at " + url)
      ).addClass("error"));
      return;
    }
    const href = tr.find('[property="shex:package"]').attr('href')
    if (!href) {
      this.resultsWidget.append($("<div/>").append(
        $("<span/>").text("no package for shexjs in index HTML at " + url)
      ).addClass("error"));
      return;
    }
    const refd = await fetch(href);
    if (!refd.ok) {
      this.resultsWidget.append($("<div/>").append(
        $("<span/>").text(`error fetching implementation: ${refd.status} (${refd.statusText}) for URL <${href}>`)
      ).addClass("error"));
    } else {
      code = await refd.text();
      // href, not url: the module's own files (`scripts`, `worker`) resolve
      // against where the module is, and the index that pointed at it is
      // somewhere else
      await this.set(code, href, source, refd.headers.get('content-type'));
    }
  }

  async parse (text, base) {
    throw Error("should not try to parse plugin cache");
  }

  async getItems () {
    throw Error("should not try to get plugin cache items");
  }
}

/** a pane holding JSON: bindings, static variables, anything a plugin
 * wants read back as data rather than as a document */
class JSONCache extends InterfaceCache {
  constructor (selection) {
    super(selection, null);
  }

  async parse (text) {
    return Promise.resolve(JSON.parse(text));
  }
}

class ShapeMapCache extends InterfaceCache {
  constructor (selection, caches, turtleParser, resultsWidget) {
    super(selection, null);
    this.tabsElement = $("#shapeMap-tabs");
    this.editMapSelector = "#editMap";
    this.editMap = $("#editMap");
    this.queryMap = $("#queryMap");
    this.fixedMap = $("#fixedMap");
    this.fixedMapTab = this.tabsElement.find('[href="#fixedMap-tab"]');
    this.caches = caches;
    this.resultsWidget = resultsWidget;
    this.meta.termToLex = (trm) => ShExWebApp.ShExTerm.rdfJsTerm2Turtle(trm, this.meta);
    this.meta.lexToTerm = (lex) => turtleParser.termToLd(lex, new IRIResolver(this.meta));
  }

  async parse (text) {
    this.removeEditMapPair(null);
    this.queryMap.val(text);
    this.copyQueryMapToEditMap();
    await this.copyEditMapToFixedMap();
  };

  async getItems () {
    throw Error("should not try to get manifest cache items");
  }

  /**
   * @return list of errors encountered
   */
  async copyEditMapToQueryMap () {
    if (this.editMap.attr("data-dirty") === "true") {
      const text = this.editMap.find(".pair").get().reduce((acc, queryPair) => {
        const node = $(queryPair).find(".focus").val();
        const shape = $(queryPair).find(".inputShape").val();
        if (!node || !shape)
          return acc;
        const status = $(queryPair).find(".shapeMap-joiner").hasClass("nonconformant") ? "!" : "";
        return acc.concat([node+"@"+status+shape]);
      }, []).join(",\n");
      this.queryMap.empty().val(text);
      const ret = await this.copyEditMapToFixedMap();
      this.markEditMapClean();
      return ret;
    } else {
      return []; // no errors
    }
  }

  /**
   * Parse query map to populate editMap and fixedMap.
   * @returns list of errors. ([] means everything was good.)
   */
  async copyQueryMapToEditMap () {
    this.queryMap.removeClass("error");
    const written = this.queryMap.val();
    this.resultsWidget.clear();
    let currentAction = "parsing input schema";
    try {
      await this.caches.inputSchema.refresh();
      currentAction = "parsing input data";
      await this.caches.inputData.refresh();
      currentAction = "parsing Query Map";
      const smparser = ShExWebApp.ShapeMapParser.construct(
        this.meta.base, this.caches.inputSchema.meta, this.caches.inputData.meta);
      let sm;
      try {
        sm = smparser.parse(written);
      } catch (e) {
        e.inputError = true;
        throw e;
      }
      this.removeEditMapPair(null);
      this.addEditMapPairs(sm.length ? sm : null);
      const ret = await this.copyEditMapToFixedMap();
      this.markEditMapClean();
      this.resultsWidget.clear();
      return ret;
    } catch (e) {
      this.queryMap.addClass("error");
      this.resultsWidget.failMessage(e, currentAction);
      this.makeFreshEditMap()
      return [e];
    }
  }

  makeFreshEditMap () {
    this.removeEditMapPair(null);
    this.addEditMapPairs(null, null);
    this.markEditMapClean();
    return [];
  }

  addEmptyEditMapPair (evt) {
    this.addEditMapPairs(null, $(evt.target).parent().parent());
    this.markEditMapDirty();
    return false;
  }

  addEditMapPairs (pairs, target) {
    const renderTP = (tp) => {
      const ret = ["subject", "predicate", "object"].map(k => {
        const ld = tp[k];
        if (ld === ShExWebApp.ShapeMap.Focus)
          return "FOCUS";
        if (!ld) // ?? ShExWebApp.Uti.any
          return "_";
        return ldToTurtle(ld, this.caches.inputData.meta.termToLex);
      });
      return "{" + ret.join(" ") + "}";
    }

    const startOrLdToTurtle = (term) => {
      return term === ShExWebApp.Validator.Start ? START_SHAPE_LABEL : ShExWebApp.ShExTerm.shExJsTerm2Turtle(term, this.caches.inputSchema.meta);
    }

    (pairs || [{node: {type: "empty"}}]).forEach(pair => {
      const nodeType = (typeof pair.node !== "object" || "@value" in pair.node)
            ? "node"
            : pair.node.type;
      let skip = false;
      let node, shape;
      switch (nodeType) {
      case "empty": node = shape = ""; break;
      case "node": node = ldToTurtle(pair.node, this.caches.inputData.meta.termToLex); shape = startOrLdToTurtle(pair.shape); break;
      case "TriplePattern": node = renderTP(pair.node); shape = startOrLdToTurtle(pair.shape); break;
      case "Extension":
        // whether this source can resolve it is settled when the map is
        // used; writing it back out only needs its name
        node = this.caches.inputData.writeQueryMapExtension(pair.node.language, pair.node.lexical);
        shape = startOrLdToTurtle(pair.shape);
        break;
      default:
        this.resultsWidget.append($("<div/>").append(
          $("<span/>").text("unrecognized ShapeMap:"),
          $("<pre/>").text(JSON.stringify(pair))
        ).addClass("error"));
        skip = true; // skip this entry.
        break;
      }
      if (!skip) {

        const spanElt = $("<tr/>", {class: "pair"});
        const focusElt = $("<textarea/>", {
          rows: '1',
          type: 'text',
          class: 'data focus'
        }).text(node).on("change", () => this.markEditMapDirty()); // bound: bare method loses `this`
        const joinerElt = $("<span>", {
          class: 'shapeMap-joiner'
        }).append("@").addClass(pair.status);
        joinerElt.append(
          $("<input>", {style: "border: none; width: .2em;", readonly: "readonly"}).val(pair.status === "nonconformant" ? "!" : " ").on("click", (evt) => {
            const parent = $(evt.target).parent();
            const status = parent.hasClass("nonconformant") ? "conformant" : "nonconformant";
            parent.removeClass("conformant nonconformant");
            parent.addClass(status);
            $(evt.target).val(status === "nonconformant" ? "!" : "");
            this.markEditMapDirty();
            evt.preventDefault();
          })
        );
        // if (pair.status === "nonconformant") {
        //   joinerElt.append("!");
        // }
        const shapeElt = $("<input/>", {
          type: 'text',
          value: shape,
          class: 'schema inputShape'
        }).on("change", () => this.markEditMapDirty()); // bound: bare method loses `this`
        const addElt = $("<button/>", {
          class: "addPair",
          title: "add a node/shape pair"}).text("+");
        const removeElt = $("<button/>", {
          class: "removePair",
          title: "remove this node/shape pair"}).text("-");
        addElt.on("click", evt => this.addEmptyEditMapPair(evt));
        removeElt.on("click", evt => this.removeEditMapPair(evt));
        spanElt.append([focusElt, joinerElt, shapeElt, addElt, removeElt].map(elt => {
          return $("<td/>").append(elt);
        }));
        if (target) {
          target.after(spanElt);
        } else {
          this.editMap.append(spanElt);
        }
      }
    });
    if (this.editMap.find(".removePair").length === 1)
      this.editMap.find(".removePair").css("visibility", "hidden");
    else
      this.editMap.find(".removePair").css("visibility", "visible");
    this.editMap.find(".pair").each(idx => {
      this.addContextMenus(this.editMapSelector + " .pair:nth("+idx+") .focus", this.caches.inputData);
      this.addContextMenus(".pair:nth("+idx+") .inputShape", this.caches.inputSchema);
    });
    return false;
  }

  removeEditMapPair (evt) {
    this.markEditMapDirty();
    if (evt) {
      $(evt.target).parent().parent().remove();
    } else {
      this.editMap.find(".pair").remove();
    }
    if (this.editMap.find(".removePair").length === 1)
      this.editMap.find(".removePair").css("visibility", "hidden");
    return false;
  }

  markEditMapDirty () {
    this.editMap.attr("data-dirty", true);
  }

  markEditMapClean () {
    this.editMap.attr("data-dirty", false);
  }

  /* context menus
   * opts.applyChoice(currentValue, pickedKey) => newValue: how a picked menu
   *   item lands in the input (default: replace the whole value).
   * opts.menuPosition ($input, offset) => {x, y}: where to pop the menu up
   *   (default: just inside the input's top-left corner).
   */
  addContextMenus (inputSelector, cache, opts = {}) {
    const _ShapeMapCache = this;
    // !!! terribly stateful; only one context menu at a time!
    const DATA_HANDLE = 'runCallbackThingie'
    let terms = null, nodeLex = null, target, scrollLeft, m, addSpace = "";
    $(inputSelector).on('contextmenu', rightClickHandler)
    $.contextMenu({
      trigger: 'none',
      selector: inputSelector,
      build: ($trigger, e) => {
        // return callback set by the mouseup handler
        return $trigger.data(DATA_HANDLE)();
      }
    });

    async function buildMenuItemsPromise (elt, evt) {
      if (elt.hasClass("data")) {
        nodeLex = elt.val();
        const shapeLex = elt.parent().parent().find(".schema").val()

        // Would like to use SMParser but that means users can't fix bad SMs.
        /*
          const sm = smparser.parse(nodeLex + '@START')[0];
          const m = typeof sm.node === "string" || "@value" in sm.node
          ? null
          : tpToM(sm.node);
        */

        m = nodeLex.match(RegExp("^"+ParseTriplePattern()+"$"));
        if (m) {
          target = evt.target;
          const selStart = target.selectionStart;
          scrollLeft = target.scrollLeft;
          terms = [0, 1, 2].reduce((acc, ord) => {
            if (m[(ord+1)*2-1] !== undefined) {
              const at = acc.start + m[(ord+1)*2-1].length;
              const len = m[(ord+1)*2] ? m[(ord+1)*2].length : 0;
              return {
                start: at + len,
                tz: acc.tz.concat([[at, len]]),
                match: acc.match === null && at + len >= selStart ?
                  ord :
                  acc.match
              };
            } else {
              return acc;
            }
          }, {start: 0, tz: [], match: null });
          function norm (tz) {
            return tz.map(t => {
              return typeof t === "string" && t.startsWith('!')
                ? "- " + t.substr(1) + " -"
                : _ShapeMapCache.caches.inputData.meta.termToLex(t); // !!check
            });
          }
          const store = await _ShapeMapCache.caches.inputData.refresh();
          const queryMapKeywords = ["FOCUS", "_"];
          const getTermsFunctions = [
            () => { return queryMapKeywords.concat(norm(store.getSubjects())); },
            () => { return norm(store.getPredicates()); },
            () => { return queryMapKeywords.concat(norm(store.getObjects())); },
          ];
          if (terms.match === null)
            return false; // prevent contextMenu from whining about an empty list
          return listToCTHash(getTermsFunctions[terms.match]())
        } else if (nodeLex && shapeLex) {
          try {
            var smparser = ShExWebApp.ShapeMapParser.construct(
              _ShapeMapCache.meta.base, _ShapeMapCache.caches.inputSchema.meta, _ShapeMapCache.caches.inputData.meta);
            var sm = smparser.parse(nodeLex + '@' + shapeLex)[0];
            if (sm.node.type === "Extension") {
              const obj = {}
              obj[MENU_ITEM_materialize] = { name: MENU_ITEM_materialize };
              const nodes = await _ShapeMapCache.caches.inputData.resolveQueryMapExtension(
                sm.node.language, sm.node.lexical);
              // the flat hash every other branch returns: an {items: ...}
              // around it is one menu entry called "items", which is what
              // the query map's menu used to offer
              return nodes.reduce((ret, term) => {
                const name = _ShapeMapCache.caches.inputData.meta.termToLex(term);
                ret[name] = { name: name };
                return ret;
              }, obj)
            }
          } catch (e) {
            _ShapeMapCache.resultsWidget.failMessage(e, "query");
            return false
          }
        }
      }
      terms = nodeLex = null;
      try {
        return listToCTHash(await cache.getItems())
      } catch (e) {
        this.resultsWidget.failMessage(e, cache === _ShapeMapCache.caches.inputSchema ? "parsing schema" : "parsing data");
        let items = {};
        const failContent = "no choices found";
        items[failContent] = failContent;
        return items
      }

      // hack to emulate regex parsing product
      /*
        function tpToM (tp) {
        return [nodeLex, '{', lex(tp.subject), " ", lex(tp.predicate), " ", lex(tp.object), "", "}", ""];
        function lex (node) {
        return node === ShExWebApp.ShapeMap.Focus
        ? "FOCUS"
        : node === null
        ? "_"
        : _ShapeMapCache.caches.inputData.meta.termToLex(node);
        }
        }
      */
    }

    function ParseTriplePattern () {
      const uri = "<[^>]*>|[a-zA-Z0-9_-]*:[a-zA-Z0-9_-]*";
      const literal = "((?:" +
            "'(?:[^'\\\\]|\\\\')*'" + "|" +
            "\"(?:[^\"\\\\]|\\\\\")*\"" + "|" +
            "'''(?:(?:'|'')?[^'\\\\]|\\\\')*'''" + "|" +
            "\"\"\"(?:(?:\"|\"\")?[^\"\\\\]|\\\\\")*\"\"\"" +
            ")" +
            "(?:@[a-zA-Z-]+|\\^\\^(?:" + uri + "))?)";
      const uriOrKey = uri + "|FOCUS|_";
      // const termOrKey = uri + "|" + literal + "|FOCUS|_";

      return "(\\s*{\\s*)("+
        uriOrKey+")?(\\s*)("+
        uri+"|a)?(\\s*)("+
        uriOrKey+"|" + literal + ")?(\\s*)(})?(\\s*)";
    };

    function rightClickHandler (e) {
      e.preventDefault();
      const $this = $(this);
      $this.off('contextmenu', rightClickHandler);

      // when the items are ready,
      const p = buildMenuItemsPromise($this, e)
      p.then(items => {

        // store a callback on the trigger
        $this.data(DATA_HANDLE, () => {
          return {
            callback: menuCallback,
            items: items
          };
        });
        const _offset = $this.offset();
        $this.contextMenu(
          opts.menuPosition
            ? opts.menuPosition($this, _offset)
            : { x: _offset.left + 10, y: _offset.top + 10 }
        )
        $this.on('contextmenu', rightClickHandler)
      });
    }

    const menuCallback = (key, options) => {
      if (cache.onLoad)
        cache.onLoad();
      if (key === MENU_ITEM_materialize) {
        var toAdd = Object.keys(options.items).filter(k => {
          return k !== MENU_ITEM_materialize;
        });
        $(options.selector).val(toAdd.shift());
        var shape = $(options.selector.replace(/focus/, "inputShape")).val();
        this.addEditMapPairs(toAdd.map(
          node => {
            return {
              node: _ShapeMapCache.caches.inputData.meta.lexToTerm(node),
              shape: _ShapeMapCache.caches.inputSchema.meta.lexToTerm(shape)
            };
          }), null);
      } else if (options.items[key].ignore) { // ignore the event
      } else if (terms) {
        const term = terms.tz[terms.match];
        let val = nodeLex.substr(0, term[0]) +
            key + addSpace +
            nodeLex.substr(term[0] + term[1]);
        if (terms.match === 2 && !m[9])
          val = val + "}";
        else if (term[0] + term[1] === nodeLex.length)
          val = val + " ";
        $(options.selector).val(val);
        // target.scrollLeft = scrollLeft + val.length - nodeLex.length;
        target.scrollLeft = target.scrollWidth;
      } else {
        const $input = $(options.selector);
        $input.val(opts.applyChoice ? opts.applyChoice($input.val(), key) : key);
      }
    }

    function listToCTHash (items) {
      return items.reduce((acc, item) => {
        acc[item] = { name: item }
        return acc
      }, {})
    }
  }

  /** getShapeMap -- zip a node list and a shape list into a ShapeMap
   * use {this.caches.inputData,this.caches.inputSchema}.meta.{prefix,base} to complete IRIs
   * @return array of encountered errors
   */
  /** Rebuild the Fixed Map from the Edit Map.
   *
   * Resolving a pair is asynchronous -- a triple pattern or a query map
   * extension asks the data source what it selects -- so two of these can
   * be in flight at once, which happens whenever anything changes twice in
   * quick succession (setting the data and then the query map, say).  Each
   * used to empty the table on the way in and append on the way out, so
   * both lots of rows survived: the map grew a stale copy of every pair it
   * had before.  Now the table is emptied by whichever run is still the
   * current one, at the point it has something to put there.
   */
  async copyEditMapToFixedMap () {
    const generation = this.fixedMapGeneration = (this.fixedMapGeneration || 0) + 1;
    const getQuads = async (s, p, o) => {
      const get = s === ShExWebApp.ShapeMap.Focus ? "subject" : "object";
      return (await this.caches.inputData.refresh()).getQuads(mine(s), mine(p), mine(o)).map(t => {
        return this.caches.inputData.meta.termToLex(t[get]); // count on unpublished N3.js id API
      });
      function mine (term) {
        return term === ShExWebApp.ShapeMap.Focus || term === ShExWebApp.ShapeMap.Wildcard
          ? null
          : term;
      }
    }

    const restoreText = this.fixedMapTab.text();
    this.fixedMapTab.text("resolving Fixed Map").addClass("running");
    const nodeShapePromises = this.editMap.find(".pair").get().reduce((acc, queryPair) => {
      $(queryPair).find(".error").removeClass("error"); // remove previous error markers
      const node = $(queryPair).find(".focus").val();
      const shape = $(queryPair).find(".inputShape").val();
      const status = $(queryPair).find(".shapeMap-joiner").hasClass("nonconformant") ? "nonconformant" : "conformant";
      if (!node || !shape)
        return acc;
      const smparser = ShExWebApp.ShapeMapParser.construct(
        this.meta.base, this.caches.inputSchema.meta, this.caches.inputData.meta);
      try {
        const sm = smparser.parse(node + '@' + shape)[0];
        const added = typeof sm.node === "string" || "@value" in sm.node
              ? Promise.resolve({nodes: [node], shape: shape, status: status})
              : sm.node.type === "Extension"
              ? this.caches.inputData.resolveQueryMapExtension(sm.node.language, sm.node.lexical)
                .then(terms => ({nodes: terms.map(term => this.caches.inputData.meta.termToLex(term)), shape: shape}))
              : getQuads(sm.node.subject, sm.node.predicate, sm.node.object)
              .then(nodes => Promise.resolve({nodes: nodes, shape: shape, status: status}));
        return acc.concat(added);
      } catch (e) {
        // find which cell was broken
        try { smparser.parse(node + '@' + "START"); } catch (e) {
          $(queryPair).find(".focus").addClass("error");
        }
        try { smparser.parse("<>" + '@' + shape); } catch (e) {
          $(queryPair).find(".inputShape").addClass("error");
        }
        this.resultsWidget.failMessage(e, "parsing Edit Map", node + '@' + shape);
        throw new FlowControlError("handled ShapeMap error");
      }
    }, []);

    const createEntry = (node, nodeTerm, shape, shapeTerm, status) => {
      const spanElt = $("<tr/>", {class: "pair"
                                  ,"data-node": nodeTerm
                                  ,"data-shape": shapeTerm
                                 });
      const focusElt = $("<input/>", {
        type: 'text',
        value: node,
        class: 'data focus',
        disabled: "disabled"
      });
      const joinerElt = $("<span>", {
        class: 'shapeMap-joiner'
      }).append("@").addClass(status);
      if (status === "nonconformant") {
        joinerElt.addClass("negated");
        joinerElt.append("!");
      }
      const shapeElt = $("<input/>", {
        type: 'text',
        value: shape,
        class: 'schema inputShape',
        disabled: "disabled"
      });
      const removeElt = $("<button/>", {
        class: "removePair",
        title: "remove this node/shape pair"}).text("-");
      removeElt.on("click", evt => {
        // Remove related result.
        let href, result;
        if ((href = $(evt.target).closest("tr").find("a").attr("href"))
            && (result = document.getElementById(href.substr(1))))
          $(result).remove();
        // Remove FixedMap entry.
        $(evt.target).closest("tr").remove();
      });
      spanElt.append([focusElt, joinerElt, shapeElt, removeElt, $("<a/>")].map(elt => {
        return $("<td/>").append(elt);
      }));

      this.fixedMap.append(spanElt);
      return spanElt;
    }

    const pairs = await Promise.all(nodeShapePromises)
    if (generation !== this.fixedMapGeneration)
      return []; // a later edit is already resolving; its rows are the ones to show
    this.fixedMap.find("tbody").empty();
    pairs.reduce((acc, pair) => {
      pair.nodes.forEach(node => {
        const nodeTerm = this.caches.inputData.meta.lexToTerm(node + " "); // for langcode lookahead
        let shapeTerm = this.caches.inputSchema.meta.lexToTerm(pair.shape);
        if (shapeTerm === ShExWebApp.Validator.Start)
          shapeTerm = START_SHAPE_INDEX_ENTRY;
        const key = nodeTerm + "|" + shapeTerm;
        if (key in acc)
          return;

        const spanElt = createEntry(node, nodeTerm, pair.shape, shapeTerm, pair.status);
        acc[key] = spanElt; // just needs the key so far.
      });

      return acc;
    }, {})
    // scroll inputs to right
    this.fixedMap.find("input").each((idx, focusElt) => {
      focusElt.scrollLeft = focusElt.scrollWidth;
    });
    this.fixedMapTab.text(restoreText).removeClass("running");
    return []; // no errors
  }
}

/** mark an exception as caused by user input (ShExC/Turtle/ShapeMap text):
 * it renders in the results widget and editor diagnostics but stays off
 * console.error, which is reserved for programming errors. */
function asInputError (e) {
  e.inputError = true;
  return e;
}

class ShExCParser {
  constructor () {
    this.shexParserOptions = {index: true, duplicateShape: "abort"};
    this.shexParser = ShExWebApp.Parser.construct(DefaultBase, null, this.shexParserOptions);
  }
  parseString (text, meta, base) {
    this.shexParserOptions.duplicateShape = $("#duplicateShape").val();
    this.shexParser._setBase(base);
    let ret;
    try {
      ret = this.shexParser.parse(text);
    } catch (e) {
      throw asInputError(e);
    }
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
    let quads;
    try {
      quads = parser.parse(text);
    } catch (e) {
      throw asInputError(e);
    }
    if (quads !== undefined)
      ret.addQuads(quads);
    meta.base = parser._base;
    meta.prefixes = parser._prefixes;
    return ret;
  }
  /** Several documents, one graph.  A source may hold more than one -- a
   * patient here, an observation about them there -- and they still make a
   * single store to validate against.  Each parses on its own, though:
   * prefixes belong to the document that declares them, and so do blank
   * nodes, which two documents may both call _:x without meaning the same
   * node.  So later documents' blank nodes are renamed apart.
   */
  parseDocuments (texts, meta, base) {
    if (texts.length <= 1)
      return this.parseString(texts[0] || "", meta, base);
    const ret = new RdfJs.Store();
    const prefixes = {};
    texts.forEach((text, index) => {
      const one = {};
      const store = this.parseString(text, one, base);
      const scope = (term) => term.termType !== "BlankNode" ? term
            : RdfJs.DataFactory.blankNode("d" + index + "_" + term.value);
      ret.addQuads(store.getQuads().map(q => index === 0 ? q : RdfJs.DataFactory.quad(
        scope(q.subject), q.predicate, scope(q.object), q.graph)));
      // the first declaration of a prefix wins, as it would in one document
      for (const [prefix, iri] of Object.entries(one.prefixes || {}))
        if (!(prefix in prefixes))
          prefixes[prefix] = iri;
      if (index === 0)
        meta.base = one.base;
    });
    meta.prefixes = prefixes;
    return ret;
  }

  termToLd (lex, resolver) { // returns ShExJ objectValue
    let nz;
    try {
      nz = new RdfJs.Lexer().tokenize(lex + " ");
    } catch (e) {
      throw asInputError(e);
    }
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
  constructor (loaded, inputData, renderer) {
    this.validator = new ShExWebApp.Validator(
      loaded.schema,
      inputData,
      {
        results: "api",
        regexModule: ShExWebApp[$("#regexpEngine").val()],
        ignoreClosed: $("#ignoreClosed").is(":checked"),
        // what would make a failing node conform, said as arcs to add and
        // arcs to drop (doc/error-normalization.md §4).  The editors pin
        // each on the constraint it is about; the results say it in words.
        repairs: true,
      });
    // each: the element is the argument, and an arrow function's `this`
    // is this constructor's -- so this read `undefined.register` for as
    // long as anyone has been able to load one
    $(".pluginControl:checked").each((i, elt) => {
      $(elt).data("code").register(this.validator, ShExWebApp);
    });
    // ...and a plugin that is on the page rather than in the menu says the
    // same thing in its descriptor.  One or the other: a handler-only
    // module gets a menu control, a descriptor gets this.
    pluginDescriptors().forEach(ext => {
      if (typeof ext.register !== "function")
        return;
      try {
        ext.register(this.validator, ShExWebApp);
      } catch (e) {
        console.error(e); // a handler that won't register is not a validation error
      }
    });
    this.renderer = renderer;
  }
  async invoke (fixedMap, validationTracker, time, _done, _currentAction) {
    // ...async: a db that fetches answers with a promise, and the search
    // stops at the fetch rather than blocking on it.  Given a db that
    // doesn't, this is one traversal and one await, so it is right either
    // way and the caller doesn't have to know which it has.
    const ret = await this.validator.validateShapeMapAsync(fixedMap, validationTracker);
    time = new Date() - time;
    $("#shapeMap-tabs").attr("title", "last validation: " + time + " ms");
    $("#results .status").text("rendering results...").show();

    await Promise.all(ret.map(entry => this.renderer.entry(entry)));
    this.renderer.finish();
    return {validationResults: ret}; // for tester or whoever is awaiting this promise
  }
}

// Root error class to signal to ResultsWidget that is an expected error.
class FlowControlError extends Error {  }

// Control results area content.
let LastFailTime = 0;
class ResultsWidget {
  constructor (target = "#results > div") {
    this.setTarget(target);
    // appinfo renderings: [{pane, ranges}] linking TestedTriple objects (by
    // identity) to their {from, to} in the rendered results JSON
    this.resultPanes = [];
  }

  /** Where results are written.  An app with two kinds of results -- a
   * validation and a materialization of it -- gives each its own panel and
   * points the widget at whichever it is filling. */
  setTarget (target) {
    this.resultsSel = $(target);
    this.resultsElt = this.resultsSel.get(0);
    return this;
  }
  /** fit a result pane to the bottom of the window so the inputs and the
   * results stay visible together; without a height the pane grows to its
   * content and hover-scrolling within it scrolls the whole page */
  fitPaneToWindow (paneDom) {
    const top = paneDom.getBoundingClientRect().top;
    paneDom.style.height = Math.max(200, window.innerHeight - top - 12) + "px";
  }

  /** Bring the result an anchor names into view, when the results share an
   * editor.  Returns false if nothing here knows that anchor, leaving the
   * browser to scroll to an element with that id -- which is how results
   * that are each their own element have always worked. */
  scrollToResult (anchor) {
    // a browser may hand back the fragment as it was written or percent-
    // decoded, and these anchors are node@shape with both encoded
    const spellings = [anchor];
    try {
      spellings.push(decodeURIComponent(anchor));
    } catch (e) { /* not valid percent-encoding: the one spelling, then */ }
    for (const {pane, offsets} of this.resultPanes)
      for (const spelling of spellings)
        if (offsets && spelling in offsets) {
          pane.scrollTo(offsets[spelling]);
          return true;
        }
    return false;
  }

  /** Every result pane was built before it was in the document and has just
   * been given a height, so none of them has measured anything real yet.
   * Left alone they draw a gutter for a viewport that never existed. */
  remeasurePanes () {
    this.resultPanes.forEach(({pane}) => pane.requestMeasure && pane.requestMeasure());
  }
  replace (text) {
    return this.resultsSel.text(text);
  }
  append (text) {
    return this.resultsSel.append(text);
  }
  clear () {
    this.resultPanes = [];
    this.resultsSel.removeClass("passes fails error");
    $("#results .status").text("").hide();
    $("#shapeMap-tabs").removeAttr("title");
    return this.resultsSel.text("");
  }
  start () {
    this.resultsSel.removeClass("passes fails error");
    $("#results").addClass("running");
  }
  finish () {
    $("#results").removeClass("running");
    const height = this.resultsSel.height();
    this.resultsSel.height(1);
    this.resultsSel.animate({height:height}, 100);
  }
  text () {
    // CodeMirror virtualizes long documents, so read appinfo panes' raw text
    return $(this.resultsElt).children().map(
      (_, el) => $(el).data("rawText") !== undefined ? $(el).data("rawText") : el.textContent
    ).get().join("\n");
  }

  failMessage (e, action, text) {
    if (e instanceof FlowControlError)
      return;
    if (e.inputError) // user-input (ShExC/Turtle/ShapeMap) problems render in
      console.debug("input error " + action + ":", e.message); // the UI; only
    else              // programming errors deserve the console error channel
      console.error(e);
    $("#results .status").empty().text("Errors encountered:").show()
    const div = $("<div/>").addClass("error");
    div.append($("<h3/>").text("error " + action + ":\n"));
    div.append($("<pre/>").text(e.message));
    if (text)
      div.append($("<pre/>").text(text));
    this.append(div);
    LastFailTime = new Date().getTime();
  }
}

class ShExResultsRenderer {
  constructor (resultsWidget, caches) {
    this.resultsWidget = resultsWidget;
    this.caches = caches;
    this.entries = []; // collected for editor diagnostics (EditorSupport)
    this.appinfo = []; // results held back to share one editor
  }

  async entry (entry) {
    this.entries.push(entry);
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
        remainder.addQuads((await this.caches.inputData.refresh()).getQuads());
        entry.graph.forEach(q => remainder.removeQuad(q));
        entry.graph = remainder.getQuads();
      }
    }

    if (entry.graph) {
      const wr = new RdfJs.Writer(this.caches.inputData.meta);
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
            `${ldToTurtle(entry.node, this.caches.inputData.meta.termToLex)}@${fails ? "!" : ""}${this.caches.inputSchema.meta.termToLex(entry.shape)}`
          )).addClass(klass);
        if (fails)
          elt.append($("<pre>").text(ShExWebApp.Util.errsToSimple(
            entry.appinfo, this.caches.inputSchema.meta.prefixes,
            {lex: termLexerFor(this.caches.inputData),
             base: this.caches.inputSchema.meta.base}).join("\n")));
        break;

      case "minimal":
        if (fails)
          entry.reason = ShExWebApp.Util.errsToSimple(
            entry.appinfo, this.caches.inputSchema.meta.prefixes,
            {lex: termLexerFor(this.caches.inputData),
             base: this.caches.inputSchema.meta.base}).join("\n");
        renderMe = Object.keys(entry).reduce((acc, key) => {
          if (key !== "appinfo")
            acc[key] = entry[key];
          return acc
        }, {});
        elt = $("<pre/>").text(JSON.stringify(renderMe, null, "  ")).addClass(klass);
        break;

      default: // appinfo: the whole JSON, in an editor if there is one
        if (this.editorsOn()) {
          // held back: all the results go into one editor at finish(), the
          // way they read as one array
          this.appinfo.push({renderMe, klass, entry});
          elt = null;
        } else {
          elt = $("<pre/>").text(JSON.stringify(renderMe, null, "  ")).addClass(klass);
        }
      }
    }
    if (elt)
      this.resultsWidget.append(elt);

    // update the FixedMap.  Its check mark links to this result: an element
    // id where each result is an element, an offset into the editor where
    // they share one (see renderAppinfo).
    fixedMapEntry.addClass(klass).find("a").text(resultStr);
    const nodeLex = fixedMapEntry.find("input.focus").val();
    const shapeLex = fixedMapEntry.find("input.inputShape").val();
    const anchor = encodeURIComponent(nodeLex) + "@" + encodeURIComponent(shapeLex);
    if (elt)
      elt.attr("id", anchor);
    else
      this.appinfo[this.appinfo.length - 1].anchor = anchor;
    fixedMapEntry.find("a").attr("href", "#" + anchor);
    fixedMapEntry.attr("title", entry.elapsed + " ms")
  }

  /** are the language-aware editors on?  The results follow the rest of the
   * interface: editors everywhere, or textareas and <pre>s everywhere. */
  editorsOn () {
    return "EditorPanes" in ShExWebApp && $("#editors").val() === "1";
  }

  /** One editor holding every result, as the array they are.
   *
   * They used to be one editor each with the punctuation of an array
   * written between them, which is what the Fixed Map's check marks
   * scrolled to.  Now the array is the editor's document, and a check mark
   * scrolls to its result's offset within it.
   */
  renderAppinfo () {
    if (this.appinfo.length === 0)
      return;
    const results = this.appinfo.map(({renderMe}) => renderMe);
    try {
      const {text, ranges} = ShExWebApp.EditorServices.stringifyWithOffsets(
        results, o => o && (o.type === "TestedTriple" || results.indexOf(o) !== -1));
      // the pane takes its colours from where it is put, so put it there
      // first: an unattached div has no computed style to read
      const klass = this.appinfo.every(({klass}) => klass === "passes") ? "passes" : "fails";
      const elt = $("<div/>").addClass(klass).addClass("results").data("rawText", text);
      this.resultsWidget.append(elt);
      const pane = ShExWebApp.EditorPanes.makeJsonPane(text, {colorsFrom: elt[0]});
      elt.append(pane.dom);
      this.resultsWidget.fitPaneToWindow(pane.dom);
      pane.requestMeasure();   // now that it is attached and sized

      // where each result starts, by the anchor its check mark links to
      const offsets = {};
      this.appinfo.forEach(({renderMe, anchor}) => {
        const range = ranges.find(r => r.target === renderMe);
        if (range && anchor !== undefined)
          offsets[anchor] = range.from;
      });
      this.resultsWidget.resultPanes.push({
        pane,
        ranges: ranges.filter(r => r.target && r.target.type === "TestedTriple"),
        offsets,
      });
    } catch (e) {
      console.warn("falling back to plain results JSON:", e);
      this.appinfo.forEach(({renderMe, klass, anchor}) =>
        this.resultsWidget.append(
          $("<pre/>").text(JSON.stringify(renderMe, null, "  ")).addClass(klass).attr("id", anchor)));
    }
  }

  finish (done) {
    // a source that read documents to answer with hands them back, so a
    // slurp leaves the entity pages it visited as panes to edit
    const neighborhoods = this.caches.inputData.neighborhoods;
    const db = this.caches.inputData.parsed;
    if (neighborhoods && neighborhoods.slurping() && db && typeof db.loadedPages === "function") {
      for (const {id, text} of db.loadedPages())
        neighborhoods.addPageDocument(id, text);
      neighborhoods.render();
    }
    if ("slurpWriter" in this.caches.inputData) {
      this.caches.inputData.slurpWriter.end((err, chunk) => {
        this.caches.inputData.neighborhoods.appendToLocalTurtle("\n\n# Visited data:\n" + chunk);
        // delete this.caches.intputData.endpoint;
        this.caches.inputData.refresh();
        delete this.caches.inputData.slurpWriter;
      });
    }

    this.renderAppinfo();
    $("#results .status").text("rendering results...").show();
    // Results used to be punctuated into a JSON array -- "[" before the
    // first, "," between -- which `$("#results div *")` did by appending to
    // every *descendant* of the results.  Once a result is an editor rather
    // than a <pre> that is every line and every gutter element of it, which
    // is where the commas in the gutter came from.  One result per block,
    // separated by a rule, says the same thing without writing into
    // somebody else's DOM.
    $("#results .status").hide();
    // for debugging values and schema formats:
    // try {
    //   const x = ShExWebApp.Util.valToValues(ret);
    //   // const x = ShExWebApp.Util.ShExJtoAS(valuesToSchema(valToValues(ret)));
    //   res = this.resultsWidget.replace(JSON.stringify(x, null, "  "));
    //   const y = ShExWebApp.Util.valuesToSchema(x);
    //   res = this.resultsWidget.append(JSON.stringify(y, null, "  "));
    // } catch (e) {
    //   console.dir(e);
    // }
    if (this.caches.editorSupport)
      this.caches.editorSupport.reportValidation(this.entries);
    this.resultsWidget.finish();
  }

  failure (e, action, text) {
    this.resultsWidget.failMessage(e, action, text);
  }
}

/** EditorSupport - optional CodeMirror panes over the app's textareas
 * (?editors=1): live parse diagnostics, validation-error anchoring in both
 * the schema and data panes, and shape-map ↔ shape-declaration highlights.
 * See doc/editor-integration-plan.md in the repository root.
 */
class EditorSupport {
  constructor (app) {
    this.app = app;
    this.panes = {};
  }

  /** `language` names one of the host's own languages; pass `supplied` for
   * a pane whose language comes from whichever neighborhood module claims
   * its text (see moduleEditorFor).  Without either -- editors off, or a
   * module that describes no language -- the textarea is what stays. */
  addPane (name, cache, language, supplied) {
    const textarea = cache.selection[0];
    if (!textarea)
      return null;
    // makePaneIfDescribed, not makePane: a module that describes no
    // language leaves the textarea exactly as the editors-off app shows it
    return this.panes[name] = ShExWebApp.EditorPanes.makePaneIfDescribed(textarea, {
      language,
      getBase: () => cache.meta && cache.meta.base,
      completions: () => this.completionSets(language || "turtle", cache),
      supplied,
      // completions a module can only make from a live db: wikidata
      // completing entity IRIs from the labels it has loaded
      suppliedContext: () => ({db: cache.parsed}),
    });
  }

  /** live autocomplete vocabulary: prefixes from the panes' metas, shape
   * labels and constraint predicates from the relevant parsed schema */
  completionSets (language, cache) {
    const {inputSchema, inputData} = this.app.Caches;
    // a ShExC pane completes from its own schema (e.g. shexmap's
    // outputSchema); the data pane completes from the input schema
    const schemaCache = language === "shexc" ? cache : inputSchema;
    const schema = schemaCache.parsed;
    const prefixes = Object.assign({},
                                   inputData.meta && inputData.meta.prefixes,
                                   inputSchema.meta && inputSchema.meta.prefixes,
                                   cache.meta && cache.meta.prefixes);
    const predicates = schema && schema._exprLocations
          ? [...new Set([...schema._exprLocations.keys()].map(tc => tc.predicate))]
          : [];
    const shapeLabels = schema && schema._index ? Object.keys(schema._index.shapeExprs) : [];
    return language === "turtle"
      ? {prefixes, predicates}
      : {prefixes, predicates, shapeLabels};
  }

  /** does the fixed shape map expect this entry to be nonconformant
   * (node@!shape)?  Same lookup the results renderer uses for ✓/✗. */
  expectsNonconformant (entry) {
    const shapeString = entry.shape === ShExWebApp.Validator.Start ? START_SHAPE_INDEX_ENTRY : entry.shape;
    return $("#fixedMap .pair" +
             "[data-node='" + entry.node + "']" +
             "[data-shape='" + shapeString + "']")
      .find(".shapeMap-joiner").hasClass("nonconformant");
  }

  /** map validation results onto the schema and data editors.  Error
   * squiggles reflect the EXPECTED outcome: an entry validated as
   * node@!shape that duly fails gets no error marks (its failure pairs stay
   * hoverable in red to show why it failed), while one that unexpectedly
   * conforms gets an error on the shape declaration. */
  reportValidation (entries) {
    const {inputSchema, inputData} = this.app.Caches;
    if (!this.panes.inputSchema || !inputSchema.parsed)
      return;
    try {
      const located = ShExWebApp.EditorServices.locateInParsed(
        inputSchema.selection.val(), inputSchema.parsed);
      // Where the data was written is the data source's to say: its
      // document is Turtle, or an entity page, or whatever it reads.  A
      // source that doesn't offer to locate its own leaves the Turtle
      // parser, which is what a data pane has always held.
      // Locating the data is worth doing whether or not it is showing in an
      // editor: the results widget anchors to these ranges too.
      const db = inputData.parsed;
      const locate = text => !text ? null
            : (db && typeof db.locateDocument === "function" && db.locateDocument(text))
            || ShExWebApp.EditorServices.parseTurtle(
              text, {baseIRI: inputData.meta && inputData.meta.base});
      // A source can hold several documents -- an entity page each, and
      // later a named graph each -- and a validation reaches all of them,
      // so locate them all.  The showing one comes first: its diagnostics
      // are the ones the pane on screen can carry.
      const showing = this.app.neighborhoods ? this.app.neighborhoods.showing : -1;
      const documents = this.app.neighborhoods ? this.app.neighborhoods.documents() : [];
      // the showing document is read from the pane, which holds edits the
      // stashed copy hasn't seen yet
      const dataDocuments = [{at: documents.length ? showing : -1,
                              parsed: locate(inputData.selection.val())}].concat(
        documents.map((d, at) => ({at, parsed: at === showing ? null : locate(d.text)})))
            .filter(d => d.parsed);
      // A source can have no document to locate anything in -- an endpoint
      // answers from a store nobody typed -- and the schema-side diagnostics
      // are still worth drawing.  Map against nothing rather than against
      // an empty list, which has no [0] to read.
      if (dataDocuments.length === 0)
        dataDocuments.push({at: -1, parsed: null});
      // data ranges are offsets into one document, so they are kept per
      // document: whichever is showing gets its own (see reaimAtShowingDocument)
      const merged = {schema: [], data: [], pairs: [], dataByDoc: new Map()};
      const dataOf = at => {
        if (!merged.dataByDoc.has(at))
          merged.dataByDoc.set(at, []);
        return merged.dataByDoc.get(at);
      };
      entries.forEach(entry => {
        // one mapping per document; a pair takes the anchors of whichever
        // document turns out to have said its triple
        const perDocument = dataDocuments.map(d => ({
          at: d.at,
          // each document spells the message for itself: the same failure
          // read from the observation says <Patient2> and read from the
          // patient says :gender, because that is what each one says
          mapped: ShExWebApp.EditorServices.mapValidationErrors(
            entry.appinfo, located, d.parsed, {spelling: termSpelling()}),
        }));
        const mapped = perDocument[0].mapped;
        mapped.pairs.forEach((pair, i) => {
          pair.doc = perDocument[0].at;
          if (pair.anchors && pair.anchors.object)
            return;
          const elsewhere = perDocument.slice(1).find(
            d => (d.mapped.pairs[i] || {}).anchors && d.mapped.pairs[i].anchors.object);
          if (elsewhere) {
            pair.anchors = elsewhere.mapped.pairs[i].anchors;
            pair.data = elsewhere.mapped.pairs[i].data;
            pair.doc = elsewhere.at;
          }
        });
        mapped.pairs.forEach(p => { p.id += merged.pairs.length; });
        merged.pairs.push.apply(merged.pairs, mapped.pairs);
        const actualFail = entry.status === "nonconformant";
        if (!this.expectsNonconformant(entry)) {
          merged.schema.push.apply(merged.schema, mapped.schema);
          // Every document, not only the one on screen.  A validation walks
          // wherever the data leads it -- the observation names a patient the
          // next document describes -- and the reader who goes looking for
          // the bad triple is looking in *that* document, where the dot
          // belongs.
          perDocument.forEach(d => dataOf(d.at).push.apply(dataOf(d.at), d.mapped.data));
        } else if (!actualFail) {
          // unexpected conformance: flag the shape declaration and the node
          const message = entry.node + " matched " + entry.shape
                + " though the shape map expected nonconformance";
          const shapeRange = typeof entry.shape === "string" ? located.locate.shape(entry.shape) : null;
          if (shapeRange)
            merged.schema.push(Object.assign({severity: "error", message}, shapeRange));
          perDocument.forEach(d => {
            const anchored = d.mapped.pairs.find(p => p.anchors && p.anchors.subject);
            if (anchored)
              // a bnode subject is a whole [ property list ]; mark where it
              // opens rather than every triple written inside it
              dataOf(d.at).push(Object.assign(
                {severity: "error", message},
                (anchored.anchors.subjectParts || [anchored.anchors.subject])[0]));
          });
        } // else: expected failure -- no error marks
      });
      merged.data = merged.dataByDoc.get(showing) || [];
      this.lastMapped = merged; // introspection for tests/debugging
      this.mappedDoc = showing;  // the document these data ranges are offsets into
      this.panes.inputSchema.setDiagnostics(merged.schema);
      if (this.panes.inputData)
        this.panes.inputData.setDiagnostics(merged.data);
      this.setPairHovers(merged.pairs);
    } catch (e) {
      console.warn("editor diagnostics failed:", e);
    }
  }

  /** Another document is showing: the data-side ranges are offsets into one
   * document, so hand the pane the ones belonging to the document it is now
   * holding.  It used to have only the mapping for whichever document the
   * validation ran under, so moving off that one took the marks away and
   * the document that actually contained the bad triple never showed one. */
  reaimAtShowingDocument () {
    if (!this.lastMapped)
      return;
    const showing = this.app.neighborhoods ? this.app.neighborhoods.showing : -1;
    const byDoc = this.lastMapped.dataByDoc;
    if (this.panes.inputData)
      this.panes.inputData.setDiagnostics(
        byDoc ? (byDoc.get(showing) || [])
          : showing === this.mappedDoc ? this.lastMapped.data : []);
    this.setPairHovers(this.lastMapped.pairs);
  }

  /** cross-pane hover highlighting for validation matches and failures:
   * hovering a matched/failed TripleConstraint highlights it, its shape's
   * label and the data triple's object; hovering the object highlights the
   * whole data triple and the constraint.  Green for matches, red for
   * failures. */
  setPairHovers (pairs) {
    const schemaPane = this.panes.inputSchema;
    const dataPane = this.panes.inputData;
    if (!schemaPane || !dataPane)
      return;
    const resultPanes = this.app.resultsWidget.resultPanes;
    const wipe = () => {
      schemaPane.clearHighlights();
      dataPane.clearHighlights();
      resultPanes.forEach(({pane}) => pane.clearHighlights());
    };
    // a frozen highlight stays until it is released: leaving it is what a
    // reader does on the way to look at what it is pointing at
    const clearAll = () => {
      if (HighlightMode.frozen())
        return;
      wipe();
    };
    // a constraint with cardinality > 1 yields one pair per matched triple,
    // all sharing a schema range: group them so hovering the constraint
    // highlights every matched triple
    const bySchemaRange = new Map();
    pairs.filter(p => p.schema).forEach(p => {
      const key = p.schema.from + "-" + p.schema.to;
      if (!bySchemaRange.has(key))
        bySchemaRange.set(key, []);
      bySchemaRange.get(key).push(p);
    });
    // a TestedTriple's subject/predicate/object member lines (its full range
    // would also paint any nested solutions)
    // object first: the pane scrolls to the first range it is given, and the
    // object is the answer -- the subject and predicate are what the reader
    // asked with
    const termRanges = (r) => r.fields
          ? ["object", "subject", "predicate"].map(k => r.fields[k]).filter(f => f)
          : [{from: r.from, to: r.to}];
    const showInResults = (group, cls, scroll) => {
      resultPanes.forEach(({pane, ranges}) => {
        const hits = ranges.filter(r => group.some(p => p.triple === r.target));
        if (hits.length)
          pane.highlight(hits.flatMap(termRanges), cls, {scroll});
        else
          pane.clearHighlights();
      });
    };
    // a constraint's highlight is its parts (e.g. ":s {" and "}", skipping
    // an inline-shape body); a bnode subject/object highlights as its
    // [ ] delimiters rather than the whole property list
    const constraintRanges = (p) => p.schemaParts || (p.schema ? [p.schema] : []);
    // a pair whose triple isn't in any showing document has no anchors at all
    const anchorRanges = (p, term) => !p.anchors ? []
          : p.anchors[term + "Parts"] || (p.anchors[term] ? [p.anchors[term]] : []);
    const show = (group, hoveredSide, pinning) => {
      // the switch says whether the mouse paints at all; a pin says the
      // mouse may no longer change what is painted
      if (!pinning && (!HighlightMode.live() || HighlightMode.frozen()))
        return;
      const lead = group[0];
      const cls = group.some(p => p.status !== "conformant")
            ? "shexjs-highlight-fail" : "shexjs-highlight-match";
      const schemaRanges = group.flatMap(constraintRanges)
            .concat(hoveredSide === "schema"
                    // connect a (possibly nested) constraint back to its
                    // labeled shape: enclosing predicates, then the label
                    ? group.flatMap(p => p.schemaPath || []).concat([lead.anchors && lead.anchors.shapeLabel])
                    : [])
            .filter(r => r);
      // object first, for the same reason: an entity page is thousands of
      // lines and the claim that matched is what the reader came to see
      const dataRanges = group.flatMap(p => [].concat(
        anchorRanges(p, "object"), anchorRanges(p, "subject"), anchorRanges(p, "predicate")));
      // don't auto-scroll the pane the mouse is in
      schemaPane.highlight(schemaRanges, cls, {scroll: hoveredSide !== "schema"});
      // the data may be in a document that isn't showing -- another entity
      // page, later another named graph -- so bring it forward.  Showing a
      // document can rebuild the pane (a new language), so ask for the pane
      // again rather than highlighting the one that was just destroyed.
      // ...unless the mouse is in the data pane, where switching would pull
      // the document out from under it: a data-side hover is already about
      // the document being pointed at
      const neighborhoods = hoveredSide === "data" ? null : this.app.neighborhoods;
      if (neighborhoods && lead.doc >= 0 && lead.doc !== neighborhoods.showing
          && dataRanges.length) {
        neighborhoods.show(lead.doc);
        const showingPane = this.panes.inputData;
        if (showingPane)
          showingPane.highlight(dataRanges, cls, {scroll: true});
        return showInResults(group, cls, hoveredSide !== "results");
      }
      dataPane.highlight(dataRanges, cls, {scroll: hoveredSide !== "data"});
      showInResults(group, cls, hoveredSide !== "results");
    };
    // ctrl/cmd-click freezes what is under the mouse and scrolls every pane
    // to its counterpart -- the navigation half.  Clicking the frozen thing
    // again releases it.  (ctrl-click is the context menu on a Mac, so the
    // Mac spelling is cmd, which is what every IDE does for the same reason.)
    const freeze = (group, side) => evt => {
      if (!isPinGesture(evt))
        return false;            // an ordinary click: let the editor have it
      if (HighlightMode.frozen() && HighlightMode.pinned === group) {
        HighlightMode.unpin();
        wipe();
        return true;
      }
      HighlightMode.pin(group);
      show(group, side, true);   // scrolls the other panes: this is the travel
      return true;
    };
    this.pairHoverPaint = () => {
      if (HighlightMode.frozen())
        show(HighlightMode.pinned, null, true);
      else
        wipe();
    };
    schemaPane.setHoverRegions(
      [...bySchemaRange.values()].flatMap(group =>
        constraintRanges(group[0]).map(r => ({
          from: r.from, to: r.to,
          enter: () => show(group, "schema"),
          click: freeze(group, "schema"),
        }))),
      clearAll);
    // Both the object and the predicate trigger data-side hovers -- but
    // only for results about the document on screen.  A range is an offset
    // into the document it was located in, so a pair from another document
    // would light up whatever text happens to sit at those offsets here.
    const showingDoc = this.app.neighborhoods ? this.app.neighborhoods.showing : -1;
    const shownHere = (p) => p.doc === undefined || p.doc < 0 || p.doc === showingDoc;
    dataPane.setHoverRegions(
      pairs.filter(shownHere).flatMap(
        p => [].concat(anchorRanges(p, "object"), anchorRanges(p, "predicate"))
          .map(r => ({from: r.from, to: r.to,
                      enter: () => show([p], "data"),
                      click: freeze([p], "data")}))),
      clearAll);
    // hovering a TestedTriple in an appinfo results pane highlights its
    // constraint in the schema and its triple in the data
    resultPanes.forEach(({pane, ranges}) => {
      if (!pane.setHoverRegions)
        return;
      pane.setHoverRegions(
        ranges.reduce((acc, r) => {
          const pair = pairs.find(p => p.triple === r.target);
          return pair
            ? acc.concat(termRanges(r).map(f => (
                {from: f.from, to: f.to,
                 enter: () => show([pair], "results"),
                 click: freeze([pair], "results")})))
            : acc;
        }, []),
        clearAll);
    });
    // turning the switch off, or releasing a pin, has to take the paint with
    // it -- the mouse may be nowhere near a region when either happens
    if (!this._repaintWired) {   // setPairHovers runs per validation
      this._repaintWired = true;
      HighlightMode.onChange(() => {
        if (this.pairHoverPaint)
          this.pairHoverPaint();
      });
    }
  }

  /** highlight a shape's declaration in the schema pane */
  highlightShape (label) {
    const {inputSchema} = this.app.Caches;
    if (!this.panes.inputSchema || !inputSchema.parsed)
      return;
    const located = ShExWebApp.EditorServices.locateInParsed(
      inputSchema.selection.val(), inputSchema.parsed);
    const range = located.locate.shape(label);
    this.panes.inputSchema.highlight(range ? [range] : []);
  }

  clearShapeHighlight () {
    if (this.panes.inputSchema)
      this.panes.inputSchema.clearHighlights();
  }

  /** hovering a shape lexical form (fixed-map inputs, result entries)
   * highlights its declaration */
  enableShapeHover () {
    const lexToLabel = (lex) => {
      try {
        const term = this.app.Caches.inputSchema.meta.lexToTerm(lex.trim());
        return typeof term === "string" ? term : null; // skip Start et al.
      } catch (e) {
        return null;
      }
    };
    $(document).on("mouseenter.shexjsEditors", ".inputShape, .shapeMap .schema", (evt) => {
      const elt = $(evt.currentTarget);
      const label = lexToLabel(elt.is("input") ? elt.val() : elt.text());
      if (label)
        this.highlightShape(label);
    }).on("mouseleave.shexjsEditors", ".inputShape, .shapeMap .schema", () => {
      this.clearShapeHighlight();
    });
  }

  /** tear down every pane (restoring the textareas) and the hover handlers */
  destroy () {
    $(document).off(".shexjsEditors");
    Object.values(this.panes).forEach(pane => pane && pane.destroy());
    this.panes = {};
  }
}

const ShExLoader = ShExWebApp.Loader({
  fetch: window.fetch.bind(window), rdfjs: RdfJs, jsonld: null
})
class ShExBaseApp {
  /** whether this app validates in a worker: a plugin with a worker half
   * has one thing to do here and another there */
  get remote () { return false; }

  /** where this app's results are written.  A plugin with results of its
   * own puts them in a tab beside these, and this becomes the first of
   * them (buildPluginResultsTabs). */
  get resultsTarget () { return this.resultsTargetSel; }

  constructor (base) {
    this.base = base;
    this.resultsTargetSel = "#results > div";
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
      // the select's "off" is the empty string, which is not what anyone
      // types: ?editors=0 and ?editors=false mean the same thing
      {queryStringParm: "editors",      location: $("#editors"),         deflt: "",
       normalize: v => /^(1|true|yes|on)$/i.test(v) ? "1" : ""},
      // which screen is up (a plugin's id; empty is the validator's own).
      // Plugins load before this list is walked, so their screens exist by
      // the time a permalink's choice arrives; a name no loaded plugin
      // answers to quietly means the validator, since there is nothing to
      // switch to.  start() shows what this lands on.
      {queryStringParm: "screen",       location: $("#screen"),          deflt: "",
       normalize: v => $("#screen option").filter((i, o) => $(o).attr("value") === v).length
                       ? v : ""},
      // The data source and whatever it wants configured.  A parameter is
      // named for what it means, not for the module that declares it, so a
      // manifest entry or a permalink says `neighborhood=sparql&endpoint=…`
      // and two sources that both take an `endpoint` agree about the word.
    ]).concat(this.neighborhoods.queryParams());
    this.keyDownHandlers = [
      this.validateKeyDown.bind(this),
      this.navigateManifestKeyDown.bind(this),
    ];

    ShExWebApp.ShapeMap.Start = ShExWebApp.Validator.Start;
    // what registered before this app existed, and whatever registers after
    // it: a plugin loaded by URL reaches the same code as one the page
    // loaded as a script
    pluginDescriptors().forEach(ext => this.applyPlugin(ext));
    if (typeof ShExPlugins !== "undefined")
      ShExPlugins.onRegister(ext => this.applyPlugin(ext));
  }

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
  applyPlugin (ext) {
    // What it runs on, if the page hasn't got it: a module of its own,
    // fetched before anything of it is built.
    const pending = this.loadPluginScripts(ext);
    return pending
      ? pending.then(() => this.applyPluginNow(ext))
      : this.applyPluginNow(ext);
  }

  /**
   * The scripts a plugin says it needs, injected in the order it said
   * them, or null if the page already has them all (§5 phase 3).
   *
   * A classic page has no module system, so this is what "load a plugin's
   * code by URL" means here: `scripts` are resolved against the plugin
   * rather than against the page, since the plugin knows where its own
   * bundle sits and the page has never heard of it.
   */
  loadPluginScripts (ext) {
    const urls = (ext.scripts || [])
          .map(src => new URL(src, ext.baseUrl || DefaultBase).href)
          .filter(url => $("head script, body script").filter(
            (i, s) => s.src === url).length === 0);
    if (urls.length === 0)
      return null;
    return urls.reduce((sofar, url) => sofar.then(() => new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.onload = () => resolve();
      script.onerror = () => reject(Error("no plugin script at <" + url + ">"));
      document.head.appendChild(script);
    })), Promise.resolve());
  }

  applyPluginNow (ext) {
    if (typeof ext.css === "string" && ext.css.trim().length > 0
        && $("head style[data-plugin]").filter((i, e) => $(e).attr("data-plugin") === ext.id).length === 0)
      $("<style/>").attr("data-plugin", ext.id).text(ext.css).appendTo("head");
    this.buildPluginPanes(ext);
    this.buildPluginResultsTabs(ext);
    this.buildPluginToolbar(ext);
    this.buildPluginStatusbar(ext);
    this.bindPluginKeys(ext);
    this.mixinPluginMethods(ext);
    if (typeof ext.init === "function" && !ext.initialized) {
      ext.initialized = true;
      try {
        ext.init(this);
      } catch (e) {
        this.resultsWidget.failMessage(e, "loading " + (ext.label || ext.id));
      }
    }
  }

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
  mixinPluginMethods (ext) {
    Object.keys(ext.methods || {}).forEach(name => {
      if (name in this)
        return;
      this[name] = ext.methods[name].bind(this);
    });
  }

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
  buildPluginResultsTabs (ext) {
    const panels = ext.resultsTabs || [];
    if (panels.length === 0)
      return;
    let tabs = $("#resultsTabs");
    if (tabs.length === 0) {
      // this app's own results become the first tab, where they already are
      const mine = $("#results > div").first();
      tabs = $("<div/>").attr("id", "resultsTabs").insertBefore(mine);
      $("<ul/>").append($("<li/>").append(
        $("<a/>", {href: "#" + APP_RESULTS_TAB}).text("validation"))).appendTo(tabs);
      $("<div/>").attr("id", APP_RESULTS_TAB).append(mine).appendTo(tabs);
      this.resultsTargetSel = "#" + APP_RESULTS_TAB + " > div";
      this.resultsWidget.setTarget(this.resultsTarget);
    }
    panels.forEach(panel => {
      if ($("#" + panel.id).length > 0)
        return;
      $("<div/>").attr("id", panel.id).css("display", "none")
        .append($("<div/>")).appendTo(tabs);
    });
    tabs.tabs();
  }

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
  pluginScreen (ext) {
    let slot = $("#screens");
    if (slot.length === 0)
      slot = $("<div/>").attr("id", "screens").appendTo("#inputarea");
    const already = slot.children().filter((i, e) => $(e).attr("data-plugin") === ext.id);
    if (already.length)
      return already;
    const screen = $("<div/>").addClass("screen").attr("data-plugin", ext.id).appendTo(slot);
    // a page without the switch keeps every screen visible, which is the
    // pre-screens layout; a page with it starts a new screen put away
    if (this.addScreenOption(ext))
      screen.hide();
    return screen;
  }

  /**
   * The drop-down of screens, standing where the <h1> stood.
   *
   * It appears with the first plugin screen: a page with only the
   * validator's has nothing to switch and keeps its title.  The title's
   * text becomes the first option, so the page is still named on screen.
   */
  addScreenOption (ext) {
    const select = $("#screen");
    if (select.length === 0)
      return false;
    if (!this.screenSelectLive) {
      this.screenSelectLive = true;
      // .first(): the dialogs (#loadForm, #about) start life inside #title
      // and carry <h1>s of their own until jquery-ui moves them out
      const title = $("#title h1").first();
      select.children().first().text(title.text() || "validator");
      title.hide();
      select.show();
      select.on("change", () => this.showScreen(select.val()));
    }
    if (select.children().filter((i, o) => $(o).attr("value") === ext.id).length === 0)
      select.append($("<option/>").attr("value", ext.id).text(ext.label || ext.id));
    return true;
  }

  /**
   * Show one screen and put the others away -- away, not gone: display and
   * nothing else changes, so what a hidden screen's panes hold is still
   * read wherever it is used.  The results stay below, shared: a
   * validation's tab and a materialization's sit side by side whichever
   * screen is up.
   */
  showScreen (id) {
    const select = $("#screen");
    if (select.length === 0)
      return;
    if (select.val() !== id)
      select.val(id);
    $("#inputSchema, #inputData").toggle(id === "");
    $("#screens > .screen").each((i, e) => $(e).toggle($(e).attr("data-plugin") === id));
    this.remeasureScreenPanes(id);
  }

  /** A CodeMirror pane measures nothing while it is display:none, so a
   * pane that just came on screen is asked to measure again -- the same
   * treatment the data pane gets when another document swaps in. */
  remeasureScreenPanes (id) {
    if (!this.editorSupport)
      return;
    const names = id === ""
          ? ["inputSchema", "inputData"]
          : ((pluginDescriptors().find(d => d.id === id) || {}).panes || []).map(p => p.name);
    names.forEach(name => {
      const pane = this.editorSupport.panes[name];
      if (pane && pane.requestMeasure)
        pane.requestMeasure();
    });
  }

  /**
   * Run what a control says to run, and say so if it can't.
   *
   * A descriptor may declare a verb whose code has not been loaded -- the
   * ShExMap page's app class still holds `materialize`, so a plain page
   * told to load ShExMap gets the button and not the verb.  Better a
   * message where the results go than a stack trace in the console.
   */
  runPluginAction (control) {
    const tracked = SharedForTests && SharedForTests.promise;
    try {
      const ret = control.run(this);
      if (ret && typeof ret.then === "function") {
        // whoever waits on this waits for the verb to finish, whether it
        // worked or was reported -- an async verb's failure is a rejected
        // promise, not a throw
        const handled = ret.catch(e => this.resultsWidget.failMessage(e, control.id));
        // an action that hands over its own work keeps what it handed over:
        // materialize's click resolves at once, the materialization doesn't
        if (SharedForTests && SharedForTests.promise === tracked)
          SharedForTests.promise = handled;
      }
    } catch (e) {
      this.resultsWidget.failMessage(e, control.id);
    }
  }

  /**
   * Build the row of controls a plugin declares (§5, inventory row 4).
   *
   * `toolbar` is the row, in order: a button, an input the app fills from a
   * query parameter, a group that may hide, a status line.  A button says
   * what it runs; an input says which parameter and manifest key fill it,
   * the way a pane does.  They go in the plugin's own card, under its
   * panes -- the verb beside the things it consumes.
   */
  buildPluginToolbar (ext) {
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
    toolbar.forEach(control => this.buildPluginControl(control, inner));
  }

  /**
   * What a plugin says under its controls, across the card (§4's
   * `statusbar` slot).
   *
   * Not in the toolbar: that box floats right, so anything in it that grows
   * and shrinks -- a list of live threads, say -- moves the buttons beside
   * it out from under the mouse.  This grows rightward from an edge that
   * doesn't move.
   */
  buildPluginStatusbar (ext) {
    const items = ext.statusbar || [];
    if (items.length === 0)
      return;
    const screen = this.pluginScreen(ext);
    if (screen.children(".pluginStatusbar").length > 0)
      return;
    const row = $("<div/>").addClass("pluginStatusbar").appendTo(screen);
    items.forEach(control => this.buildPluginControl(control, row));
  }

  buildPluginControl (control, into) {
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
        const entry = {queryStringParm: control.queryStringParm, location: input,
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
      (control.controls || []).forEach(c => this.buildPluginControl(c, group));
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
  }

  /**
   * Bind the keys a plugin declares (inventory row 5).
   *
   * Some verbs are only a keystroke, so nothing on the page notices when
   * they stop working; they are declared beside the ones that have buttons.
   * keyDownHandlers is read on each keydown, so a binding may arrive at any
   * time -- which is what a plugin loaded mid-session does.
   */
  bindPluginKeys (ext) {
    const keys = (ext.toolbar || []).filter(c => c.key).concat(ext.keys || []);
    keys.forEach(binding => {
      if (binding.bound)
        return; // this descriptor was applied before
      binding.bound = true;
      this.keyDownHandlers.push(e => {
        if (!!binding.key.ctrl !== e.ctrlKey || e.key !== binding.key.key)
          return false;
        this.runPluginAction(binding);
        return true;
      });
    });
  }


  /** the cache a pane of this kind wants */
  paneCache (kind, selection) {
    switch (kind) {
    case "json":   return new JSONCache(selection);
    case "schema": return new SchemaCache(selection, null, this.shexcParser, this.turtleParser);
    case "turtle": return new TurtleCache(selection, null, this.turtleParser);
    default: throw Error("no pane of kind " + JSON.stringify(kind)
                         + "; there are json, schema and turtle");
    }
  }

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
  buildPluginPanes (ext) {
    const panes = ext.panes || [];
    if (panes.length === 0)
      return;
    const screen = this.pluginScreen(ext);
    if (screen.children(".panel").length > 0)
      return; // already built: registered twice, or applied twice
    // The screen's columns.  Panes share one unless `panel:` groups them
    // otherwise, so a descriptor written before screens renders as it did
    // -- one column -- and ShExMap says its output schema is a column of
    // its own, which is the two-column layout its own page had.
    const columns = new Map();
    panes.forEach(pane => {
      const key = pane.panel === undefined ? "" : pane.panel;
      if (!columns.has(key))
        columns.set(key, $("<div/>").addClass("panel").attr("data-panel", key || null)
                    .appendTo(screen));
      const textarea = $("<textarea/>")
            .attr({rows: pane.rows || 10, spellcheck: "false"})
            .addClass(pane.className || "")
            .css("width", "100%");
      $("<div/>").attr("id", pane.id).css("width", "100%")
        // a non-breaking space, so an empty status line keeps its height
        .append($("<h2/>").addClass("status").text("\u00a0"), textarea)
        .appendTo(columns.get(key));
      const cache = this.paneCache(pane.kind, textarea);
      this.Caches[pane.name] = cache;
      const entry = {queryStringParm: pane.queryStringParm, location: cache.selection, cache};
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
  }

  /** The Menu → "user interface" editors select (?editors=1 in permalinks)
   * replaces the textareas with language-aware CodeMirror panes (when the
   * webpack bundle includes EditorPanes); the textareas stay in the DOM as
   * live value proxies so caches/permalinks/tests are unaffected.  Toggling
   * off restores the plain textareas with the current text -- handy for
   * comparing editor and textarea behaviors.
   */
  setEditors () {
    const want = "EditorPanes" in ShExWebApp && $("#editors").val() === "1";
    if (want && !this.editorSupport) {
      this.editorSupport = new EditorSupport(this);
      // ShExResultsRenderer reaches editorSupport through its caches
      // reference; non-enumerable so the many Object.keys(Caches) iterations
      // (textarea handlers, query parameters, ...) never mistake it for a
      // cache.
      Object.defineProperty(this.Caches, "editorSupport",
                            {value: this.editorSupport, enumerable: false, configurable: true});
      this.addEditorPanes();
      this.editorSupport.enableShapeHover();
    } else if (!want && this.editorSupport) {
      this.editorSupport.destroy();
      delete this.Caches.editorSupport;
      this.editorSupport = null;
    }
  }

  /** which caches get panes; subclasses add theirs.
   *
   * The schema pane is ShExC and always will be.  The data pane's language
   * is not the app's to decide: its text says which neighborhood serves the
   * data ("# Endpoint: <url>" queries SPARQL, "# Wikidata" synthesizes
   * entity pages, anything else is Turtle to parse), and each of those
   * modules describes its own text.  So the pane asks whichever module
   * claims the text as it stands -- and gets a plain textarea, exactly as
   * with the editors off, from a module that describes nothing.
   */
  addEditorPanes () {
    this.editorSupport.addPane("inputSchema", this.Caches.inputSchema, "shexc");
    // the data pane's language is whatever the showing document is in, and
    // that is the selected source's to say
    this.editorSupport.addPane("inputData", this.Caches.inputData, null,
                               () => this.neighborhoods.paneEditor());
    pluginDescriptors().forEach(ext => (ext.panes || []).forEach(pane => {
      if (pane.editor)
        this.editorSupport.addPane(pane.name, this.Caches[pane.name], pane.editor);
    }));
  }

  /** The showing document may have changed language (a different source, or
   * a different pane of it), and a pane's grammar is fixed when it is
   * built, so rebuild it. */
  refreshDataPaneEditor () {
    // Whether there is a pane to rebuild is not the question -- a source
    // with no document to edit leaves none, and the next source may want
    // one back.  The question is whether the editors are on at all.
    if (!this.editorSupport)
      return;
    const pane = this.editorSupport.panes.inputData;
    if (pane) {
      pane.destroy();          // hands its text back to the textarea
      delete this.editorSupport.panes.inputData;
    }
    this.editorSupport.addPane("inputData", this.Caches.inputData, null,
                               () => this.neighborhoods.paneEditor());
    // destroying a pane restores the textarea it hid, so say again what
    // should be showing
    this.neighborhoods.showDocumentArea();
  }

  async start () {
    SharedForTests = {Caches: this.Caches, neighborhoods: this.neighborhoods, app: this,
                      HighlightMode, isPinGesture, PIN_WITH_META}
    this.neighborhoods.init(); // before ?neighborhood=… reaches the picklist
    this.prepareControls();
    const dndPromise = this.prepareDragAndDrop(); // async 'cause it calls Cache.X.set("")
    const loads = this.loadSearchParameters();
    const ready = Promise.all([ dndPromise, loads ]).then(resolved => {
      this.setEditors(); // after ?editors=... has reached the menu select
      // ...and after the editors exist, so the screen's panes can measure
      this.showScreen($("#screen").val() || "");
      return resolved;
    });
    if ('_testCallback' in window) {
      SharedForTests.promise = ready.then(ab => ({drop: ab[0], loads: ab[1]}));
      window._testCallback(SharedForTests);
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

  onDataLoad () {
    this.Caches.shapeMap.markEditMapDirty();
  }

  // abstract getValidator (_validator) { } // overriden for ShExMap

  /**
   * resolve node and shape against input data and schema base and prefixes
   */
  fixValidationShapeMapEntry (node, shape) {
    return {
      node: this.Caches.inputData.meta.lexToTerm(node),
      shape: this.Caches.inputSchema.meta.lexToTerm(shape) // resolve with this.Caches.outputSchema
    }
  }

  /* UI setup */
  /**
   * set up UI buttons handlers
   */
  prepareControls () {
    // re-log a just-created gist's address: the post-create navigation
    // cleared the console it was first printed to
    try {
      const gistTrace = sessionStorage.getItem(GIST_CREATED_KEY);
      if (gistTrace) {
        sessionStorage.removeItem(GIST_CREATED_KEY);
        console.log(gistTrace);
      }
    } catch (e) { /* private mode */ }
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
    $("#fixedMap").on("click", "a[href^='#']", evt =>
      this.resultsWidget.scrollToResult($(evt.currentTarget).attr("href").substring(1)));
    $(window).on("hashchange", () =>
      this.resultsWidget.scrollToResult(window.location.hash.substring(1)));
    $("#validate").on("click", this.disableResultsAndValidate.bind(this));
    $("#debugValidate").on("click", () => { SharedForTests.promise = this.startValidationDebugSession(); });
    $("#valDbgInto").on("click", () => this.valDebugStep("stepInto"));
    $("#valDbgOver").on("click", () => this.valDebugStep("stepOver"));
    $("#valDbgContinue").on("click", () => this.valDebugStep("continue"));
    $("#valDbgStop").on("click", () => this.endValidationDebugSession());
    $("#download-results-button").on("click", this.downloadResults.bind(this));
    $("#createGist").on("click", (evt) => { SharedForTests.promise = this.createGist(evt); });
    $("#updateGist").on("click", (evt) => { SharedForTests.promise = this.updateGist(evt); });

    $("#loadForm").dialog({
      autoOpen: false,
      modal: true,
      buttons: {
        "GET": (evt, ui) => {
          this.resultsWidget.clear();
          const target = this.Getables.find(g => g.queryStringParm === $("#loadForm span.whatToLoad").text());
          const url = $("#loadInput").val();
          const tips = $(".validateTips");
          function updateTips (t) {
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
          SharedForTests.promise = target.cache.asyncGet(url)
            // .then(ret => {
            //   this.toggleControls();
            //   return ret;
            // })
            .catch((e) => {
              updateTips(e.message);
            });
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

    $("#gistHelp").dialog({
      autoOpen: false,
      modal: true,
      width: "50%",
      buttons: {
        "Dismiss": function () { $(this).dialog("close"); }
      },
    });

    $("#gistInstructions").on("click", evt => {
      evt.preventDefault();
      this.toggleControls(); // close the menu; the dialog replaces it
      $("#gistHelp").dialog("open");
    });

    $("#shapeMap-tabs").tabs({
      activate: async (event, ui) => {
        if (ui.oldPanel.get(0) === $("#editMap-tab").get(0))
          await this.Caches.shapeMap.copyEditMapToQueryMap();
        else if (ui.oldPanel.get(0) === $("#queryMap").get(0))
          await this.Caches.shapeMap.copyQueryMapToEditMap()
      }
    });
    $("#queryMap").on("change", evt => {
      this.resultsWidget.clear();
      SharedForTests.promise = this.Caches.shapeMap.copyQueryMapToEditMap();
    });
    this.Caches.inputData.selection.on("change", this.dataInputHandler.bind(this)); // input + paste?
    // $("#copyEditMapToFixedMap").on("click", copyEditMapToFixedMap); // may add this button to tutorial

    function dismissModal (evt) {
      // $.unblockUI();
      $("#about").dialog("close");
      this.toggleControls();
      return true;
    }

    // Prepare file uploads
    $("input.inputfile").each((idx, elt) => {
      $(elt).on("change", (evt) => {
        const reader = new FileReader();

        reader.onload = (evt) => {
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
    if (this.Caches.inputSchema.selection.val() !== "" || this.Caches.inputData.selection.val() !== "")
      return Promise.resolve();

    const iface = this.parseQueryString(location.search);

    this.toggleControlsArrow("down");
    $(".manifest li").text("no manifest schemas loaded");
    if ("examples" in iface) { // deprecated ?examples= interface
      iface.manifestURL = iface.examples;
      delete iface.examples;
    }
    if (!("manifest" in iface) && !("manifestURL" in iface)) {
      iface.manifestURL = ["../examples/manifest.json"];
    }

    // a gist-hosted manifest can be edited in place: reveal Menu → "/Update"
    const gistManifest = "manifestURL" in iface
          && iface.manifestURL[0].match(/^https:\/\/gist\.githubusercontent\.com\/([^\/]+)\/([0-9a-f]+)\/raw\/(?:([0-9a-f]+)\/)?/);
    if (gistManifest) {
      this.loadedGist = {owner: gistManifest[1], id: gistManifest[2], sha: gistManifest[3]};
      $("#updateGist").show();
    }

    // Load all known query parameters. Save load results into array like:
    /* [ [ "data", { "skipped": "skipped" } ],
       [ "manifest", { "fromUrl": { "url": "http://...", "data": "..." } } ], ] */
    // Plugins first, and one at a time: what one adds -- panes, and the
    // parameters and manifest keys that fill them -- has to be in
    // QueryParams before the walk below reads QueryParams.  ?plugin= and
    // ?pluginURL= are the same thing said two ways; a permalink writes the
    // second, and a person writes whichever they remember.  ?extension= and
    // ?extensionURL= are what both were called before "extension" was left
    // to the semantic-action kind, and links wrote them, so they still
    // answer.
    await this.loadPlugins([].concat(
      iface.pluginURL || [], iface.plugin || [],
      iface.extensionURL || [], iface.extension || []));

    const loadedAsArray = await Promise.all(this.QueryParams.map(async input => {
      const label = input.queryStringParm;
      const parm = label;
      if (input.earlyLoad)
        return [label, {skipped: "skipped"}];
      if (parm + "URL" in iface) {
        const url = iface[parm + "URL"][0];
        if (url.length > 0) { // manifest= loads no manifest
          // !!! set anyways in asyncGet?
          input.cache.url = url; // all fooURL query parms are caches.
          try {
            const got = await input.cache.asyncGet(url);
            return [label, {fromUrl: got}]
          } catch(e) {
            if ("fail" in input) {
              input.fail(e);
            } else {
              input.location.val(e.message);
            }
            this.resultsWidget.append($("<pre/>").text(e).addClass("error"));
            return [label, { loadFailure: e instanceof Error ? e : Error(e) }];
          };
        }
      } else if (parm in iface) {
        const prepend = input.location.prop("tagName") === "TEXTAREA" ?
              input.location.val() :
              "";
        const value = prepend + (input.normalize
                                 ? input.normalize(iface[parm].join(""))
                                 : iface[parm].join(""));
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
          this.resultsWidget.append($("<pre/>").text(
            "error setting " + label + ":\n" + e + "\n" + value
          ).addClass("error"));
          return [label, { failure: e }]
        }
      } else if ("deflt" in input) {
        input.location.val(input.deflt);
        return [label, { deflt: "deflt" }]; // flag that it was a default
      }
      return [label, { skipped: "skipped" }]
    }));
    // convert loaded array into Object:
    /* { "data": { "skipped": "skipped" },
       "manifest": { "fromUrl": { "url": "http://...", "data": "..." } }, } */
    const loaded = loadedAsArray.reduce((acc, fromArray) => {
      acc[fromArray[0]] = fromArray[1]
      return acc
    }, {});

    // Parse the shape-map using the prefixes and base.
    const shapeMapErrors = $("#queryMap").val().trim().length > 0
          ? this.Caches.shapeMap.copyQueryMapToEditMap()
          : this.Caches.shapeMap.makeFreshEditMap();

    this.customizeInterface();
    $("body").keydown(e => { // keydown because we need to preventDefault
      const code = e.keyCode || e.charCode; // standards anyone?
      return !this.keyDownHandlers.find(h => h(e, code)); // if we find a handler, stop propagation
    });
    if ("schemaURL" in iface ||
        // some schema is non-empty
        ("schema" in iface &&
         iface.schema.reduce((r, elt) => { return r+elt.length; }, 0))
        && shapeMapErrors.length === 0) {
      return callValidator();
    }

    return loaded;
  }

  /**
   * parse query string into map of arrays
   * location.search: e.g. "?schema=asdf&data=qwer&shape-map=ab%5Ecd%5E%5E_ef%5Egh"
   */
  /** the plugin modules named by URL, loaded in the order they were named */
  async loadPlugins (urls) {
    for (const url of urls) {
      if (url.length === 0)
        continue;
      try {
        await this.Caches.plugin.asyncGet(new URL(url, DefaultBase).href);
      } catch (e) {
        this.resultsWidget.append($("<pre/>").text(e).addClass("error"));
      }
    }
  }

  parseQueryString (query) {
    if (query[0]==='?') query=query.substr(1); // optional leading '?'
    const map   = {};
    query.replace(/([^&,=]+)=?([^&,]*)(?:[&,]+|$)/g, (match, key, value) => {
      key=decodeURIComponent(key);value=decodeURIComponent(value);
      (map[key] = map[key] || []).push(value);
    });
    return map;
  };

  /* Executions */

  // Validation UI
  /** a validation is starting: an app with results derived from the last
   * one says so here.  Nothing to do for a validator. */
  startingValidation () {
    pluginDescriptors().forEach(ext => {
      if (typeof ext.onStartingValidation === "function")
        ext.onStartingValidation(this);
    });
  }

  disableResultsAndValidate (evt) {
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
    SharedForTests.promise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        const began = new Date().getTime();
        try {
          const errors = await this.Caches.shapeMap.copyEditMapToQueryMap(); // will update if #editMap is dirty
          if (errors.length === 0)
            resolve(await this.callValidator());
        } finally {
          this.endValidation(new Date().getTime() - began);
        }
      }, 0);
    })
  }

  /** the validate button while a validation is running: it is the only
   * thing that can be said, since nothing will repaint until it finishes */
  startValidation () {
    $("#validate").addClass("running").prop("disabled", true)
      .text("validating\u2026").attr("title", "");
  }

  endValidation (elapsed) {
    $("#validate").removeClass("running").prop("disabled", false)
      .text(VALIDATE_LABEL)
      .attr("title", "last validation: " + elapsed + " ms");
  }

  /** startValidationDebugSession - step-through debugging of the
   * triple-expression matches in a validation (doc/debugger-design.md):
   * the validation runs to completion with eval-simple-1err recording
   * every regexEngine.match() invocation; any of them can then be
   * replayed one NFA event at a time.  Gutter breakpoints in the schema
   * pane become constraint breakpoints.  A validation thread's aspects
   * are its position in the state machine, its repeat counts and its
   * matched-triples partition -- previewValThread renders them. */
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
      const fixedMap = $("#fixedMap tr").map((idx, tr) =>
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
      const {module, captures} = ShExWebApp.capturingRegexModule(ShExWebApp["eval-simple-1err"]);
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
      this.valDebugSession = {captures, located, pane, schema, results};
      const select = $("#valDbgMatches").empty();
      captures.forEach((cap, i) =>
        select.append($("<option/>", {value: i}).text(this.matchCaptureLabel(cap, schema))));
      select.off("change").on("change", () => this.pickValidationMatch(parseInt(select.val(), 10)));
      // the step buttons, the match picker and the status line are three
      // rows of one control; 🐞 started this session, and pressing it again
      // would only start another over the same results
      $("#valDebugControls, .valDbgRow").show();
      $("#debugValidate").hide();
      this.pickValidationMatch(0);
      return this.valDebugSession;
    } catch (e) {
      this.reportValidationError(e, currentAction);
      return null;
    }
  }

  matchCaptureLabel (cap, schema) {
    const index = schema._index || {};
    const label = Object.keys(index.shapeExprs || {}).find(l => {
      const decl = index.shapeExprs[l];
      return decl === cap.shape || decl.shapeExpr === cap.shape;
    });
    const node = cap.node.termType === "BlankNode" ? "_:" + cap.node.value : cap.node.value;
    return node + "@" + (label || "?");
  }

  /** (re)arm the debugger on one recorded match */
  pickValidationMatch (captureNo) {
    const session = this.valDebugSession;
    if (!session)
      return null;
    const cap = session.captures[captureNo];
    const dbg = new ShExWebApp.MatchDebugger(cap.engine, cap.node, cap.constraintToTripleMapping, cap.semActHandler);
    // gutter breakpoints (line starts) -> the first constraint on the line
    const schemaText = this.Caches.inputSchema.selection.val();
    const lineStarts = ShExWebApp.EditorServices.lineOffsets(schemaText);
    session.pane.listBreakpoints().forEach(pos => {
      const lineEnd = lineStarts.find(start => start > pos) || schemaText.length;
      for (let offset = pos; offset < lineEnd; ++offset) {
        const hit = session.located.locate.exprAt(offset);
        if (hit) {
          dbg.addBreakpoint({tc: hit.expr});
          break;
        }
      }
    });
    session.dbg = dbg;
    session.capture = cap;
    $("#valDbgStatus").text("paused before matching " + $("#valDbgMatches option:selected").text() +
                            "; step or continue");
    $("#valDbgThreads").empty();
    return dbg;
  }

  valDebugStep (command) {
    const session = this.valDebugSession;
    if (!session || !session.dbg)
      return null;
    const event = session.dbg[command]();
    this.showValDebugEvent(event);
    this.updateValThreadList();
    return event;
  }

  showValDebugEvent (event) {
    const session = this.valDebugSession;
    if (!event || !session)
      return;
    const threadStr = event.thread
          ? " [state:" + event.thread.stateNo +
            " matched:" + event.thread.matched.reduce((n, m) => n + m.triples.length, 0) +
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
  }

  /** the debugger's threads pane: this generation's threads (• = already
   * advanced into the next); hover or click renders a thread's aspects */
  updateValThreadList () {
    const session = this.valDebugSession;
    const list = $("#valDbgThreads").empty();
    if (!session || !session.dbg)
      return;
    session.dbg.threads().forEach(t => {
      const label = (t.next ? "advanced" : "current") + " thread at state " + t.stateNo +
            (t.tc ? " <" + t.tc.predicate + ">" : " (" + t.at + ")");
      list.append($("<button/>", {class: "dbgThread", title: label + " -- click for its state"})
                  .text((t.next ? "•" : "") + "s" + t.stateNo)
                  .on("mouseenter click", () => this.previewValThread(t, label)));
    });
  }

  /** the aspects specific to a validation thread: position in the state
   * machine (highlighted in the schema pane), repeat counts, and the
   * partition of matched triples */
  previewValThread (t, label) {
    const session = this.valDebugSession;
    if (!session)
      return;
    if (t.tc) {
      const range = session.located.locate.expr(t.tc);
      session.pane.highlight(range ? [range] : [], "shexjs-debug-current");
    }
    const lines = [label];
    if (Object.keys(t.repeats).length)
      lines.push("repeat counts (by Rept state): " +
                 Object.entries(t.repeats).map(([s, n]) => "s" + s + "×" + n).join(", "));
    lines.push(t.matched.length === 0 ? "matched partition: (empty)" : "matched partition:");
    t.matched.forEach(m => m.triples.forEach(tr => lines.push("  " + tr + "  -> <" + m.predicate + ">")));
    if (t.errors)
      lines.push("errors: " + t.errors);
    $("#results div").empty();
    $("#results .status").text("validation thread").show();
    this.resultsWidget.append($("<pre/>", {class: "dbgThreadState"}).text(lines.join("\n")));
  }

  endValidationDebugSession () {
    const session = this.valDebugSession;
    if (!session)
      return;
    this.valDebugSession = null;
    session.pane.clearHighlights();
    $("#valDebugControls, .valDbgRow").hide();
    $("#debugValidate").show();
    $("#valDbgStatus").text("");
    $("#valDbgThreads").empty();
  }

  async callValidator (done) {
    $("#fixedMap .pair").removeClass("passes fails");
    $("#results .status").hide();
    let currentAction = "parsing input schema";
    try {
      await this.Caches.inputSchema.refresh(); // @@ throw away parser stack?
      $("#schemaDialect").text(this.Caches.inputSchema.language);
      if (hasFocusNode()) {
        currentAction = "parsing input data";
        $("#results .status").text("parsing data...").show();
        let inputData = await this.Caches.inputData.refresh(); // need prefixes for ShapeMap
        // $("#shapeMap-tabs").tabs("option", "active", 2); // select fixedMap
        currentAction = "parsing shape map";
        const fixedMap = $("#fixedMap tr").map((idx, tr) =>
          this.fixValidationShapeMapEntry($(tr).find("input.focus").val(), $(tr).find("input.inputShape").val())
        ).get();
        if (this.neighborhoods.slurping()) {
          // start the Turtle document over: what this validation fetches is
          // what it should end up holding
          this.neighborhoods.setLocalTurtle("");
          this.Caches.inputData.slurpWriter = new RdfJs.Writer({ prefixes: this.Caches.inputSchema.meta.prefixes });
          this.queryTrackerController.queryTracker = this.makeQueryTracker();
          this.Caches.inputData.dirty(true);
          inputData = await this.Caches.inputData.refresh();
        }

        currentAction = "creating validator";
        $("#results .status").text("creating validator...").show();
        try {
          // shex-node loads IMPORTs and tests the schema for structural faults.
          const alreadLoaded = {
            schema: await this.Caches.inputSchema.refresh(),
            url: this.Caches.inputSchema.url || DefaultBase
          };
          const loaded = await ShExLoader.load({shexc: [alreadLoaded]}, null, {
            collisionPolicy: (type, left, right) => {
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
          $("#results .status").text("validating...").show();
          time = new Date();
          const validationTracker = LOG_PROGRESS ? this.makeConsoleTracker() : undefined; // undefined to trigger default parameter assignment

          // invoke can throw an asynchronous error. Using .catch instead of await so callValidator is usefully async.
          return validator.invoke(fixedMap, validationTracker, time, done, currentAction)
            .catch(e => this.reportValidationError(e, currentAction));
        } catch (e) {
          return this.reportValidationError(e, currentAction);
        }
      } else {
        const outputLanguage = this.Caches.inputSchema.language === "ShExJ" ? "ShExC" : "ShExJ";
        $("#results .status").
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
          new ShExWebApp.Writer(opts).writeSchema(this.Caches.inputSchema.parsed, (error, text) => {
            if (error) {
              $("#results .status").text("unwritable ShExJ schema:\n" + error).show();
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
    } catch (e) {
      this.resultsWidget.failMessage(e, currentAction); // decides console policy
      return { inputError: e };
    }

    function hasFocusNode () {
      return $(".focus").map((idx, elt) => {
        return $(elt).val();
      }).get().some(str => {
        return str.length > 0;
      });
    }
  }

  makeQueryTracker () {
    this.queryTrackerController.queryTracker = this.neighborhoods.slurping()
    ? {
      start: (isOut, term, shapeLabel) => {
        const node = this.Caches.inputData.meta.termToLex(WorkerMarshalling.jsonTermToRdfjsTerm(term, RdfJs.DataFactory));
        const shape = this.Caches.inputSchema.meta.termToLex(shapeLabel);
        const slurpStatus = (isOut ? "←" : "→") + " " + node + "@" + shape;
        this.neighborhoods.appendToLocalTurtle("# " + slurpStatus);
      },
      end: (triples, time) => {
        this.neighborhoods.appendToLocalTurtle(" " + triples.length + " triples (" + time + " μs)\n");
        this.Caches.inputData.slurpWriter.addQuads(triples.map(
          t => WorkerMarshalling.jsonTripleToRdfjsTriple(t, RdfJs.DataFactory)
          // t => ShExWebApp.ShExTerm.externalTriple(t, RdfJs.DataFactory)
        ));
      }
    }
    : null;

    /** attempt to disable scrolling if not at bottom of target.
     * tried both selectionState and scrollTop.
     */
    function noScrollAppend (target, toAdd) {
      var e = target.get(0);
      // var oldLen = target.val().length
      // var oldSel = target.prop("selectionStart");
      // var oldScrollTop = e.scrollTop;
      // var oldScrollHeight = e.scrollHeight;
      target.val((i, text) => {
        return text + toAdd;
      });
      // console.log(oldScrollTop, oldScrollHeight);
      // if (oldScrollTop === oldScrollHeight) {
      e.scrollTop = e.scrollHeight;
      //   target.prop("selectionStart", target.val().length);
      // } else {
      //   target.prop("selectionStart", oldScrollTop);
      // }
      // if (oldSel === oldLen) {
      //   e.scrollTop = e.scrollHeight;
      //   target.prop("selectionStart", target.val().length);
      // } else {
      //   target.prop("selectionStart", oldSel);
      // }
    }
  }

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
  extendSchema (schema) {
    return pluginDescriptors().reduce((sofar, ext) => {
      if (typeof ext.schema !== "function")
        return sofar;
      try {
        return ext.schema(sofar, this) || sofar;
      } catch (e) {
        this.resultsWidget.failMessage(e, (ext.label || ext.id) + "'s schema");
        return sofar;
      }
    }, schema);
  }

  makeRenderer () {
    const cls = pluginDescriptors().reduce(
      (sofar, ext) => typeof ext.results === "function" ? ext.results(sofar) : sofar,
      ShExResultsRenderer);
    return new cls(this.resultsWidget, this.Caches);
  }

  reportValidationError (validationError, currentAction) {
    if (validationError instanceof FlowControlError)
      return { validationError };
    $("#results .status").text("validation errors:").show();
    this.resultsWidget.failMessage(validationError, currentAction);
    return { validationError };
  }

  makeConsoleTracker () {
    function padding (depth) { return (new Array(depth + 1)).join("  "); } // AKA "  ".repeat(depth)
    function sm (node, shape) {
      return `${this.Caches.inputData.meta.termToLex(node)}@${this.Caches.inputSchema.meta.termToLex(shape)}`;
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

  /* Mouse events */

  async dataInputHandler (evt) {
    const active = $('#shapeMap-tabs ul li.ui-tabs-active a').attr('href');
    if (active === "#editMap-tab")
      return await this.Caches.shapeMap.copyEditMapToQueryMap();
    else // if (active === "#queryMap")
      return await this.Caches.shapeMap.copyQueryMapToEditMap();
  }

  /* Keyboard events */
  validateKeyDown (e, code) {
    if (!e.ctrlKey || (code !== 10 && code !== 13)) // ctrl-enter
      return false;
    // const at = $(":focus");
    this.dataInputHandler().then(smErrors => {
      if (smErrors.length === 0)
        $("#validate")/*.focus()*/.click();
    })
    return true;
  }

  navigateManifestKeyDown (e, code) {
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

  /* controls menu */
  async toggleControls (evt) {
    // don't use `return false` 'cause the browser doesn't wait around for a promise before looking at return false to decide the event is handled
    if (evt) evt.preventDefault();

    const revealing = evt && $("#controls").css("display") !== "flex";
    $("#controls").css("display", revealing ? "flex" : "none");
    this.toggleControlsArrow(revealing ? "up" : "down");
    if (revealing) {
      let target = evt.target;
      while (target.tagName !== "BUTTON")
        target = target.parentElement;
      if ($("#menuForm").css("position") === "absolute") {
        $("#controls").
          css("top", 0).
          css("left", $("#menu-button").css("margin-left"));
      } else {
        const bottonBBox = target.getBoundingClientRect();
        const controlsBBox = $("#menuForm").get(0).getBoundingClientRect();
        const left = bottonBBox.right - bottonBBox.width; // - controlsBBox.width;
        $("#controls").css("top", bottonBBox.bottom).css("left", left);
      }
      $("#permalink a").removeAttr("href"); // can't click until ready
      const permalink = await this.getPermalink();
      $("#permalink a").attr("href", permalink);
    }
  }

  toggleControlsArrow (which) {
    // jQuery can't find() a prefixed attribute (xlink:href); fall back to DOM:
    if (document.getElementById("menu-button") === null)
      return;
    const down = $(document.getElementById("menu-button").
                   querySelectorAll('use[*|href="#down-arrow"]'));
    const up = $(document.getElementById("menu-button").
                 querySelectorAll('use[*|href="#up-arrow"]'));

    switch (which) {
    case "down":
      down.show();
      up.hide();
      break;
    case "up":
      down.hide();
      up.show();
      break;
    default:
      throw Error("toggleControlsArrow expected [up|down], got \"" + which + "\"");
    }
  }

  /**
   * update location with a current values of some inputs
   */
  async getPermalink () {
    let parms = [];
    await this.Caches.shapeMap.copyEditMapToQueryMap();
    parms = parms.concat(this.QueryParams.reduce((acc, input) => {
      let parm = input.queryStringParm;
      let val = input.location.val();
      // more than one plugin may be loaded, and the link has to bring
      // them all back
      if (input.cache && Array.isArray(input.cache.urls))
        return acc.concat(input.cache.urls.map(u => parm + "URL=" + encodeURIComponent(u)));
      if (input.cache && input.cache.url &&
          // Specifically avoid loading from DefaultBase?schema=blah
          // because that will load the HTML page.
          !input.cache.url.startsWith(DefaultBase)) {
        parm += "URL";
        val = input.cache.url;
      }
      return val.length > 0 ?
        acc.concat(parm + "=" + encodeURIComponent(val)) :
        acc;
    }, []));
    const s = parms.join("&");
    return location.origin + location.pathname + "?" + s;
  }

  /** Menu → "Create Gist": publish the inputs this app registered with a
   * manifest descriptor in its QueryParams (shex-simple: schema, data,
   * queryMap; shexmap adds staticVars, outputSchema, outputShapeMap) as a
   * github gist (modeled on
   * <https://gist.github.com/ericprud/4c2b0a7eac60e3b8eade6fd35215d715>)
   * and reload this page with ?manifestURL= pointing at the gist's
   * .manifest.yaml.  Texts over GIST_INLINE_LINES lines become separate
   * files (each descriptor's spillName) referenced by relative <key>URLs. */
  async createGist (evt) {
    if (evt) evt.preventDefault();
    this.toggleControls();
    const title = prompt("Title for this gist:", "");
    if (title === null)
      return null; // canceled
    const token = this.getGistToken();
    if (!token)
      return null;
    const files = await this.assembleGistFiles();
    const ghApi = this.ghApi.bind(this, token);
    try {
      const created = await ghApi("https://api.github.com/gists", "POST",
                                  {description: title || "ShEx validation example", public: true, files});
      localStorage.setItem(GIST_TOKEN_KEY, token);
      // sha-less raw URL: always the latest revision, and relative
      // schemaURL/dataURL/queryMapURL references resolve beside it (per-file
      // blob-sha raw_urls don't serve sibling files)
      const gistBase = `https://gist.githubusercontent.com/${created.owner.login}/${created.id}/raw/`;
      const simplePath = (location.pathname.match(/\/packages\/.*$/)
                          || ["/packages/shex-webapp/doc/shex-simple.html"])[0];
      const md = `the [manifest](${created.html_url}#file-manifest-yaml) can be used in:\n`
            + `* ShEx.JS [shex-simple interface](https://shex.js.org${simplePath}`
            + `?manifestURL=${gistBase}.manifest.yaml)\n`;
      const mdName = `-${title ? title.replace(/[\/\\]/g, "-") + " " : ""}ShEx Validation Manifest.md`;
      const patched = await ghApi(created.url, "PATCH",
                                  {files: {[mdName]: {content: md}}});
      // pin the address bar's manifestURL to the created revision so the
      // permalink outlives later edits to the gist
      const manifestURL = "history" in patched && patched.history.length
            ? `${gistBase}${patched.history[0].version}/.manifest.yaml`
            : gistBase + ".manifest.yaml";
      const parms = this.QueryParams
            .filter(q => this.Getables.indexOf(q) === -1) // controls only; content comes from the gist
            .map(q => q.queryStringParm + "=" + encodeURIComponent(q.location.val()))
            .concat(["manifestURL=" + encodeURIComponent(manifestURL)]);
      const search = "?" + parms.join("&");
      // the created gist's address (a popup here proved to break the
      // reload); stashed so the reloaded page can log it again -- the
      // navigation clears the console
      const trace = `created gist: ${created.html_url} manifest: ${manifestURL}`;
      console.log(trace);
      try { sessionStorage.setItem(GIST_CREATED_KEY, trace); } catch (e) { /* private mode */ }
      location.search = search; // navigates: reload from the gist manifest
      return search; // for tests, which can't navigate
    } catch (e) {
      this.resultsWidget.failMessage(e, "creating gist");
      return null;
    }
  }

  /** Menu → "Update": publish the current state back to the gist this page's
   * manifestURL was loaded from (this.loadedGist, revealed by
   * loadSearchParameters), nulling spill-over files the new revision no
   * longer references, then reload pinned to the new revision (sha-less raw
   * URLs are CDN-cached, so reloading unpinned could show stale content). */
  async updateGist (evt) {
    if (evt) evt.preventDefault();
    this.toggleControls();
    if (!this.loadedGist)
      return null;
    const token = this.getGistToken();
    if (!token)
      return null;
    const files = await this.assembleGistFiles();
    const ghApi = this.ghApi.bind(this, token);
    try {
      const gistApiUrl = `https://api.github.com/gists/${this.loadedGist.id}`;
      const current = await ghApi(gistApiUrl, "GET");
      // this page may hold a revision somebody -- maybe this user in another
      // window -- has updated since
      if (this.loadedGist.sha && current.history && current.history.length
          && current.history[0].version !== this.loadedGist.sha
          && !confirm(`This page holds revision ${this.loadedGist.sha.substr(0, 7)}`
                      + ` but the gist has moved on to ${current.history[0].version.substr(0, 7)}.`
                      + ` Overwrite the newer revision?`))
        return null;
      for (const q of this.QueryParams)
        if (q.manifest && "spillName" in q.manifest
            && q.manifest.spillName in current.files && !(q.manifest.spillName in files))
          files[q.manifest.spillName] = null; // delete spill-overs now recorded inline
      const patched = await ghApi(gistApiUrl, "PATCH", {files});
      localStorage.setItem(GIST_TOKEN_KEY, token);
      const gistBase = `https://gist.githubusercontent.com/${this.loadedGist.owner}/${this.loadedGist.id}/raw/`;
      const manifestURL = "history" in patched && patched.history.length
            ? `${gistBase}${patched.history[0].version}/.manifest.yaml`
            : gistBase + ".manifest.yaml";
      const parms = this.QueryParams
            .filter(q => this.Getables.indexOf(q) === -1) // controls only; content comes from the gist
            .map(q => q.queryStringParm + "=" + encodeURIComponent(q.location.val()))
            .concat(["manifestURL=" + encodeURIComponent(manifestURL)]);
      const search = "?" + parms.join("&");
      const trace = `updated gist: ${current.html_url} manifest: ${manifestURL}`;
      console.log(trace);
      try { sessionStorage.setItem(GIST_CREATED_KEY, trace); } catch (e) { /* private mode */ }
      location.search = search; // navigates: reload from the updated manifest
      return search; // for tests, which can't navigate
    } catch (e) {
      if (/ 404 /.test(e.message))
        e.message += " (is this your gist? updating needs its owner's token)";
      this.resultsWidget.failMessage(e, "updating gist");
      return null;
    }
  }

  /** the github token Create/Update Gist use, prompted for once and
   * remembered in localStorage (cleared again by a 401 in ghApi) */
  getGistToken () {
    return localStorage.getItem(GIST_TOKEN_KEY)
          || prompt("Creating a gist requires a github token with \"gist\" scope\n"
                    + "(menu → \"get token\" creates one; menu → \"instructions\" explains;\n"
                    + "remembered in this browser's localStorage):");
  }

  async ghApi (token, url, method, body) {
    const resp = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json",
                 "Accept": "application/vnd.github+json",
                 "Authorization": "token " + token },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!resp.ok) {
      if (resp.status === 401)
        localStorage.removeItem(GIST_TOKEN_KEY); // stale token; re-prompt next time
      throw Error(`${method} ${url} → ${resp.status} ${await resp.text()}`);
    }
    return resp.json();
  }

  /** the files Create/Update Gist publish: .manifest.yaml holding one entry
   * built from the QueryParams manifest descriptors, plus a spill-over file
   * per input whose text is over GIST_INLINE_LINES lines */
  async assembleGistFiles () {
    await this.Caches.shapeMap.copyEditMapToQueryMap();
    const status = $("#results .fails").length ? "nonconformant" : "conformant";
    const files = {};
    const part = (parm, fileName, text) => {
      if (text.split("\n").length > GIST_INLINE_LINES) {
        files[fileName] = {content: text};
        return `  ${parm}URL: ${fileName}\n`;
      }
      return `  ${parm}: |\n` + text.replace(/\n+$/, "").split("\n")
        .map(l => l.length ? "    " + l : "").join("\n") + "\n";
    };
    // each QueryParams entry with a manifest descriptor contributes to the
    // manifest entry, so each app's input registry declares what a gist records
    const yamlEntry = this.QueryParams.reduce((acc, q) => {
      if (!("manifest" in q)) return acc;
      const m = q.manifest;
      if ("labelKey" in m)
        acc += `  ${m.labelKey}: ${m.label}\n`;
      const text = q.location.val();
      if (m.asYamlObject) {
        const obj = JSON.parse(text.trim() || "{}");
        return acc + (Object.keys(obj).length === 0
          ? `  ${m.key}: {}\n`
          : `  ${m.key}:\n` + Object.entries(obj).map(
              ([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}\n`).join(""));
      }
      if ("spillName" in m)
        return acc + part(m.key, m.spillName, text);
      return acc + `  ${m.key}: ${JSON.stringify(text)}\n`; // short scalar, quoted
    }, "") + `  status: ${status}\n`;
    files[".manifest.yaml"] = { content: "-" + yamlEntry.substring(1) };
    return files;
  }

  downloadResults (evt) {
    const typed = [
      { type: "text/plain", name: "results.txt" },
      { type: "application/json", name: "results.json" }
    ][$("#interface").val() === "appinfo" ? 1 : 0];
    const blob = new Blob([this.resultsWidget.text()], {type: typed.type});
    $("#download-results-button")
      .attr("href", window.URL.createObjectURL(blob))
      .attr("download", typed.name);
    this.toggleControls();
    console.log(this.resultsWidget.text());
  }

  setInterface (evt) {
    this.toggleControls();
    this.customizeInterface();
  }

  customizeInterface () {
  if ($("#interface").val() === "minimal") {
    $("#inputSchema .status").html("schema (<span id=\"schemaDialect\">ShEx</span>)").show();
    $("#inputData .status").html("data (<span id=\"dataDialect\">" + this.neighborhoods.dialect() + "</span>)").show();
    // minimal: the shape map is all that stays beside the schema
    $("#shapeMapArea").siblings().hide();
    $("#title img, #title h1, #screen").hide();
    $("#menuForm").css("position", "absolute").css(
      "left",
      $("#inputSchema .status").get(0).getBoundingClientRect().width -
        $("#menuForm").get(0).getBoundingClientRect().width
    );
    $("#controls").css("position", "relative");
  } else {
    $("#inputSchema .status").html("schema (<span id=\"schemaDialect\">ShEx</span>)").hide();
    $("#inputData .status").html("data (<span id=\"dataDialect\">" + this.neighborhoods.dialect() + "</span>)").hide();
    $("#shapeMapArea").siblings().show();
    $("#title img").show();
    // the screen switch stands where the title stood, so bring back
    // whichever of the two is serving as the title (addScreenOption)
    $("#title h1").toggle(!this.screenSelectLive);
    $("#screen").toggle(!!this.screenSelectLive);
    $("#menuForm").removeAttr("style");
    $("#controls").css("position", "absolute");
  }
}


  /* drag and drop */
w  /**
   * Prepare drag and drop into text areas
   */
  async prepareDragAndDrop () {
    this.QueryParams.filter(q => {
      return "cache" in q;
    }).map(q => {
      return {
        location: q.location,
        targets: [{
          ext: "",   // Will match any file
          media: "", //   or media type.
          target: q.cache
        }]
      };
    }).concat([
      {location: $("body"), targets: [
        {media: "application/json", target: this.Caches.manifest},
        {media: "application/x-yaml", target: this.Caches.manifest},
        {ext: ".shex", media: "text/shex", target: this.Caches.inputSchema},
        {ext: ".ttl", media: "text/turtle", target: this.Caches.inputData},
        {ext: ".json", media: "application/json", target: this.Caches.manifest},
        {ext: ".smap", media: "text/plain", target: this.Caches.shapeMap}]}
    ]).forEach(desc => {
      const droparea = desc.location;
      // kudos to http://html5demos.com/dnd-upload
      desc.location.
        on("drag dragstart dragend dragover dragenter dragleave drop", (e) => {
          e.preventDefault();
          e.stopPropagation();
        }).
        on("dragover dragenter", (evt) => {
          desc.location.addClass("hover");
        }).
        on("dragend dragleave drop", (evt) => {
          desc.location.removeClass("hover");
        }).
        on("drop", (evt) => {
          evt.preventDefault();
          droparea.removeClass("droppable");
          $("#results .status").removeClass("error");
          this.resultsWidget.clear();
          let xfer = evt.originalEvent.dataTransfer;
          const prefTypes = [
            {type: "files"},
            {type: "application/json"},
            {type: "text/uri-list"},
            {type: "text/plain"}
          ];
          const promises = [];
          if (prefTypes.find(l => {
            if (l.type.indexOf("/") === -1) {
              if (l.type in xfer && xfer[l.type].length > 0) {
                $("#results .status").text("handling "+xfer[l.type].length+" files...").show();
                promises.push(readfiles(xfer[l.type], desc.targets));
                return true;
              }
            } else {
              if (xfer.getData(l.type)) {
                const val = xfer.getData(l.type);
                $("#results .status").text("handling "+l.type+"...").show();
                if (l.type === "application/json") {
                  if (desc.location.get(0) === $("body").get(0)) {
                    let parsed = JSON.parse(val);
                    if (!(Array.isArray(parsed))) {
                      parsed = [parsed];
                    }
                    parsed.map(elt => {
                      const action = "action" in elt ? elt.action: elt;
                      action.schemaURL = action.schema; delete action.schema;
                      action.dataURL = action.data; delete action.data;
                    });
                    promises.push(this.Caches.manifest.set(parsed, DefaultBase, "drag and drop"));
                  } else {
                    promises.push(inject(desc.targets, DefaultBase, val, l.type));
                  }
                } else if (l.type === "text/uri-list") {
                  $.ajax({
                    accepts: {
                      mycustomtype: 'text/shex,text/turtle,*/*'
                    },
                    url: val,
                    dataType: "text"
                  }).fail((jqXHR, textStatus) => {
                    const error = jqXHR.statusText === "OK" ? textStatus : jqXHR.statusText;
                    this.resultsWidget.append($("<pre/>").text("GET <" + val + "> failed: " + error));
                  }).done((data, status, jqXhr) => {
                    try {
                      promises.push(inject(desc.targets, val, data, (jqXhr.getResponseHeader("Content-Type") || "unknown-media-type").split(/[ ;,]/)[0]));
                      $("#loadForm").dialog("close");
                      this.toggleControls();
                    } catch (e) {
                      this.resultsWidget.append($("<pre/>").text("unable to evaluate <" + val + ">: " + (e.stack || e)));
                    }
                  });
                } else if (l.type === "text/plain") {
                  promises.push(inject(desc.targets, DefaultBase, val, l.type));
                }
                $("#results .status").text("").hide();
                // desc.targets.text(xfer.getData(l.type));
                return true;
                async function inject (targets, url, data, mediaType) {
                  const target =
                        targets.length === 1 ? targets[0].target :
                        targets.reduce((ret, elt) => {
                          return ret ? ret :
                            mediaType === elt.media ? elt.target :
                            null;
                        }, null);
                  if (target) {
                    const appendTo = $("#append").is(":checked") ? target.get() : "";
                    await target.set(appendTo + data, url, 'drag and drop', mediaType);
                  } else {
                    this.resultsWidget.append("don't know what to do with " + mediaType + "\n");
                  }
                }
              }
            }
            return false;
          }) === undefined)
            this.resultsWidget.append($("<pre/>").text(
              "drag and drop not recognized:\n" +
                JSON.stringify({
                  dropEffect: xfer.dropEffect,
                  effectAllowed: xfer.effectAllowed,
                  files: xfer.files.length,
                  items: [].slice.call(xfer.items).map(i => {
                    return {kind: i.kind, type: i.type};
                  })
                }, null, 2)
            ));
          SharedForTests.promise = Promise.all(promises);
        });
    });
    const readfiles = /*async*/ (files, targets) => { // returns promise but doesn't use await
      const formData = new FormData();
      let successes = 0;
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i], name = file.name;
        const target = targets.reduce((ret, elt) => {
          return ret ? ret :
            name.endsWith(elt.ext) ? elt.target :
            null;
        }, null);
        if (target) {
          promises.push(new Promise((resolve, reject) => {
            formData.append("file", file);
            const reader = new FileReader();
            reader.onload = ((target) => {
              return async (event) => {
                const appendTo = $("#append").is(":checked") ? target.get() : "";
                await target.set(appendTo + event.target.result, DefaultBase);
                ++successes;
                resolve()
              };
            })(target);
            reader.readAsText(file);
          }))
        } else {
          this.resultsWidget.append("don't know what to do with " + name + "\n");
        }
      }
      return Promise.all(promises).then(() => {
        $("#results .status").text("loaded "+successes+" files.").show();
      })
    }
  }
}
 
