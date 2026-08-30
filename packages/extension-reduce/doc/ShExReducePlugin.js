/**
 * The ShExReduce plugin: what ShExReduce adds to a page
 * (doc/plugins.md).
 *
 * The second plugin, and the one that says whether the contract is a
 * contract or just ShExMap's shape written out.  It wants what ShExMap
 * wanted -- panes, a verb, a handler, a hand in the results -- and one
 * thing ShExMap never needed: a say in the schema, because actions may
 * arrive in a document of their own and have to be hung on the schema they
 * were written apart from.  That is `schema` below, and it is the only hook
 * this file added to the app.
 *
 * The pair of demos in the manifest is the point of the thing: two schemas
 * over the same numbers, where "the last number is the sum of the ones
 * before it" is a fact no schema can state.  In `guide.shex` the actions
 * steer the match; in `falsify.shex` the schema chooses and the actions
 * check.
 */

const REDUCE_ID = "http://shex.io/extensions/Reduce/";

/** the plugin, as a value, so its own hooks can reach its state */
const ShExReduce = {
  id: REDUCE_ID,
  label: "ShExReduce",

  // the fold, its JavaScript action language, and the overlay reader
  scripts: ["./webpacks/shexreduce-webapp.js"],

  // ...and the same handler where the matcher is, when that is a worker:
  // these actions run during the match, so a validation over there has to
  // have them over there or the fold has nothing to fold
  worker: "./ShExReduceWorkerThread.js",

  css: [
    "/* the actions a schema was written apart from, and what they built */",
    "#reduceOverlay textarea { background-color: #fff4f4; border-color: #fc561c }",
    "#reduceAst textarea { background-color: #f4fff4; border-color: #1cfc56 }",
    "/* ...and what an action said instead of building any of it */",
    "#reduceAst .status.threw { color: #a00 }",
    "#reduceAst .status.threw pre { margin: 0; white-space: pre-wrap; font-size: 80% }",
    "#inputarea { overflow-x: auto; }",
  ].join("\n"),

  panes: [
    // actions in a document of their own: an sa:Overlay, which `schema`
    // below hangs on the schema before anything validates against it
    // The schema and the overlay hung on it are one column, a tab each --
    // what #dataPaneTabs does for the data source's documents.  The schema
    // is the app's own pane, borrowed: one pane, one cache, one editor,
    // moved to whichever screen is looking at it, not a copy to keep in
    // step.  An overlay names things in the schema, so this is the pane you
    // want to be able to turn to.
    {name: "inputSchema", borrow: "#schemaDocument",
     tabs: "schemaPaneTabs", label: "schema"},
    {name: "overlay", id: "reduceOverlay", kind: "turtle", editor: "turtle",
     tabs: "schemaPaneTabs", label: "overlay",
     fill: true, rows: 25, className: "data droparea",
     queryStringParm: "overlay",
     manifest: {key: "overlay", spillName: "overlay.ttl"}},
    // ...and the data those actions are read against, beside it
    {name: "inputData", borrow: true},
    // ...and what the fold built, which is a product rather than an input:
    // it belongs with the other results, in a tab of its own.
    {name: "ast", id: "reduceAst", kind: "json", editor: "json",
     fill: true, rows: 20, className: "bindings droparea",
     queryStringParm: "ast",
     tab: {id: "reduceAstResults", label: "AST"}},
  ],

  toolbar: [
    {kind: "button", id: "reduce", label: "reduce (ctl-;)",
     title: "fold the actions over the parse the last validation found",
     key: {ctrl: true, key: ";"},
     run: app => app.reduce()},
  ],

  /** every conformant result of the last validation, for `reduce` to fold */
  parsed: [],

  /** ...and the schema it was matched against, which says how many values
   * an arc reference stands for */
  validated: null,

  init (app) {
    this.app = app;
  },

  /** the × on the screen tab: the panes go with the screen, and what is
   * left is what this descriptor was holding between validations */
  unload () {
    this.app = null;
    this.parsed = [];
    this.validated = null;
  },

  /**
   * What the AST pane's own status line says, and how it says an action
   * threw: with the code and what it said, where the reader is looking for
   * what the actions built.  A validation error also goes where every
   * validation error goes -- this is beside that, not instead of it.
   */
  say (text) {
    $("#reduceAst .status").removeClass("threw").text(text).show();
  },

  threw (e, app) {
    $("#reduceAst .status").addClass("threw").empty()
      .append($("<pre/>").text(e.message)).show();
    if (app && app.Caches.ast)
      app.Caches.ast.set("");             // no AST: what there was is not it
    if (app)
      app.linkPanes(REDUCE_ID, []);
  },

  /** a validation replaces the parse the last AST was folded from */
  onStartingValidation (app) {
    this.parsed = [];
    this.say("\u00a0");
    if (app.Caches.ast)
      app.Caches.ast.set("");
    // ...and what the last fold linked was about the last parse
    app.linkPanes(REDUCE_ID, []);
  },

  /**
   * The actions the schema was written apart from, hung on it.
   *
   * `sa:Overlay` says what to attach and where -- by ShExJ id, or by a
   * ShapePath that selects one.  A schema with its actions inline (the
   * calc-semact pair) leaves this pane empty and nothing happens here.
   */
  schema (schema, app) {
    // ...and the last thing through here is what the validation will match
    // against, which the fold wants for a reason of its own: the schema
    // says whether `$:left` is a value or a list of them.  In a worker the
    // actions run over there, so this is where this side gets to see it.
    this.validated = schema;
    const text = app.Caches.overlay ? app.Caches.overlay.selection.val() : "";
    if (typeof ShExWebApp.SemActOverlay !== "function" && !ShExWebApp.SemActOverlay)
      return schema;
    if (!text || !text.trim())
      return schema;
    const overlay = new RdfJs.Store();
    overlay.addQuads(new RdfJs.Parser({
      baseIRI: app.Caches.overlay.meta.base, format: "text/turtle"
    }).parse(text));
    this.validated = ShExWebApp.SemActOverlay.applyOverlay(
      schema, overlay, {prefixes: schema._prefixes || {}});
    return this.validated;
  },

  /**
   * The handler a schema's %Reduce:{...%} dispatches on.
   *
   * Eagerly: the actions in `guide.shex` decide which branch of an OR
   * matches, which they can only do while the matcher is matching.  It
   * costs what PEG's bargain costs -- an action may run inside an attempt
   * that is thrown away -- and it means the fold afterwards needs no
   * evaluator, since every value was kept as it was computed.
   */
  register (validator, api) {
    if (!api.Reduce)
      return; // ShExReduce's module is not on this page
    // the schema's own prefixes, so an action may write one(':value') the
    // way the schema writes :value -- from the validator rather than from a
    // pane, since this is the schema it will actually match against
    api.Reduce.registerEager(validator, {
      evaluate: api.ReduceJs,
      prefixes: (validator.schema && validator.schema._prefixes) || {},
      // an action that throws is a bug in the action, and the validation it
      // was steering dies of it.  It dies with a message about a shape and
      // a node, which belongs where the actions' work is shown.
      onError: e => ShExReduce.threw(e, ShExReduce.app),
    });
  },

  /** keep what conformed, so the verb has a parse to fold */
  results: base => class extends base {
    async entry (entry) {
      await super.entry(entry);
      if (entry.status === "conformant")
        ShExReduce.parsed.push(entry);
    }

    /* An action that threw took the validation with it.  Where the match
     * ran here, `onError` above has already said so in the AST pane; where
     * it ran in a worker, this is the message coming home -- an Error with
     * its name still on it -- and this is the only place this side hears
     * about it. */
    failure (e, action, text) {
      if (e && e.name === "ReduceError")
        ShExReduce.threw(e, ShExReduce.app);
      return super.failure(e, action, text);
    }
  },

  /**
   * What each node of the AST was made from, so the reader can point at it.
   *
   * A fold's provenance says which action produced each value and what it
   * ran over; the app knows where that -- the constraint, the shape, the
   * triple -- is written, because it anchored the validation these actions
   * folded.  So a link says what its value is *about* and lets the app say
   * where, and adds the two places only this plugin knows: the node in the
   * AST pane, and the action itself where it was written in an overlay.
   *
   * Hovering any of them lights the rest, beside (not instead of) the
   * validation's own highlighting: a constraint lights the triple that
   * matched it and what the fold made of that match.
   */
  link (app, provenance, ranges, text) {
    const overlay = app.Caches.overlay ? app.Caches.overlay.selection.val() : "";
    /* What a node of the tree marks as its own: its frame.
     *
     * The delimiters it opens and closes with, its scalar members whole,
     * and -- for a member holding something with delimiters of its own --
     * the member's name with that thing's opening delimiter, and its
     * closing one.  So the shape of the node reads at a glance while what
     * is *inside* those delimiters is left to whatever is inside them,
     * which is the same bargain a bnode's property list strikes in the data
     * pane.  (Its own delimiters alone are two single characters, which is
     * nothing to see.)
     */
    const own = (at, value) => {
      const opens = {"{": "}", "[": "]"};
      if (opens[text[at.from]] !== text[at.to - 1])
        return undefined;                 // a bare value: mark it whole
      const parts = [{from: at.from, to: at.from + 1}, {from: at.to - 1, to: at.to}];
      Object.keys(at.fields || {}).forEach(member => {
        const held = value[member];
        const field = at.fields[member];
        // the value starts after the `"member": ` this was written with
        const holds = field.from + JSON.stringify(member).length + 2;
        if (held === null || typeof held !== "object" || opens[text[holds]] === undefined) {
          parts.push(field);              // `"value": 5`
        } else {
          parts.push({from: field.from, to: holds + 1});   // `"left": {`
          parts.push({from: field.to - 1, to: field.to});  // ...and its `}`
        }
      });
      return parts;
    };
    const links = provenance.map(made => {
      const at = ranges.find(r => r.target === made.value);
      if (at === undefined)
        return null;                      // a value that isn't a node of the AST
      const panes = {ast: [{from: at.from, to: at.to, parts: own(at, made.value)}]};
      // an action written in an overlay is written nowhere else: its code
      // is the sa:code literal, so that is where it is in that document
      const wrote = overlay.indexOf(made.code);
      if (made.code && wrote !== -1)
        panes.overlay = [{from: wrote, to: wrote + made.code.length}];
      return Object.assign({panes, status: "conformant"},
                           made.kind === "shape"
                           ? {node: made.node, shape: made.shape}
                           : {triple: made.at});
    }).filter(link => link !== null);
    app.linkPanes(REDUCE_ID, links);
  },

  methods: {
    /**
     * Fold the actions over the parse the last validation found.
     *
     * A validation result is the parse tree the schema recognized the data
     * by; this is the other half of a parser generator, one action per
     * production, run bottom-up.  What comes out is an AST with no RDF left
     * in it.
     */
    /**
     * Fold, and say so in the AST's own tab.
     *
     * Not through the results widget: that writes into the validation's
     * tab, and the parse this folded is *in* those results -- clearing them
     * to report on them would throw away what the reader is comparing the
     * AST against.  So the AST pane's own status line carries the news, and
     * the tab it is in comes up.
     */
    reduce () {
      const ext = ShExPlugins.byId(REDUCE_ID);
      this.showResultsTab("reduceAstResults");
      if (!ShExWebApp.Reduce)
        throw Error("ShExReduce's module is not loaded on this page: nothing to fold with");
      if (ext.parsed.length === 0) {
        ext.say("validate conformant data against a schema with Reduce actions first: " +
                "the fold is over the parse a validation found");
        return this.Caches.ast.set("");
      }
      // no evaluator: an eager run stored every value as it computed it, so
      // the fold has nothing left to run.  `provenance` is what it fills in
      // on the way -- which action made each value, and what it ran over --
      // and `schema` is what says how many values `$:left` stands for.
      const provenance = [];
      let asts;
      try {
        asts = ShExWebApp.Reduce.reduce(
          ext.parsed, {provenance, schema: ext.validated, onError: e => ext.threw(e, this)});
      } catch (e) {
        // `threw` has already said so in this pane, which is where the
        // reader is looking; the validation results this folded stay as
        // they are, since they are what the AST would have been about
        if (!(e instanceof Error) || e.name !== "ReduceError")
          ext.threw(e, this);
        return this.Caches.ast.set("");
      }
      ext.say("reduced " + asts.length + (asts.length === 1 ? " parse" : " parses"));
      // written with offsets rather than JSON.stringify, so every node of
      // the AST is a range the reader can point at
      const {text, ranges} = ShExWebApp.EditorServices.stringifyWithOffsets(
        asts.length === 1 ? asts[0] : asts, o => o !== null && typeof o === "object");
      const written = this.Caches.ast.set(text);
      ext.link(this, provenance, ranges, text);
      return written;
    },
  },
};

ShExPlugins.register(ShExReduce);
