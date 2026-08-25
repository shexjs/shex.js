/**
 * The ShExReduce plugin: what ShExReduce adds to a page
 * (doc/extension-ui-plan.md §5 phase 4).
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

  css: [
    "/* the actions a schema was written apart from, and what they built */",
    "#reduceOverlay textarea { background-color: #fff4f4; border-color: #fc561c }",
    "#reduceAst textarea { background-color: #f4fff4; border-color: #1cfc56 }",
    "#inputarea { overflow-x: auto; }",
  ].join("\n"),

  panes: [
    // actions in a document of their own: an sa:Overlay, which `schema`
    // below hangs on the schema before anything validates against it
    {name: "overlay", id: "reduceOverlay", kind: "turtle", editor: "turtle",
     rows: 12, className: "data droparea",
     queryStringParm: "overlay",
     manifest: {key: "overlay", spillName: "overlay.ttl"}},
    // ...and what the fold built, which is a product like ShExMap's
    // bindings: no manifest key writes it.  Its own column, so the input
    // reads on the left and the product on the right, like the validator
    {name: "ast", id: "reduceAst", kind: "json", editor: "json",
     panel: "ast",
     rows: 20, className: "bindings droparea",
     queryStringParm: "ast"},
  ],

  toolbar: [
    {kind: "button", id: "reduce", label: "reduce (ctl-;)",
     title: "fold the actions over the parse the last validation found",
     key: {ctrl: true, key: ";"},
     run: app => app.reduce()},
  ],

  /** every conformant result of the last validation, for `reduce` to fold */
  parsed: [],

  init (app) {
    this.app = app;
  },

  /** a validation replaces the parse the last AST was folded from */
  onStartingValidation (app) {
    this.parsed = [];
    if (app.Caches.ast)
      app.Caches.ast.set("");
  },

  /**
   * The actions the schema was written apart from, hung on it.
   *
   * `sa:Overlay` says what to attach and where -- by ShExJ id, or by a
   * ShapePath that selects one.  A schema with its actions inline (the
   * calc-semact pair) leaves this pane empty and nothing happens here.
   */
  schema (schema, app) {
    const text = app.Caches.overlay ? app.Caches.overlay.selection.val() : "";
    if (typeof ShExWebApp.SemActOverlay !== "function" && !ShExWebApp.SemActOverlay)
      return schema;
    if (!text || !text.trim())
      return schema;
    const overlay = new RdfJs.Store();
    overlay.addQuads(new RdfJs.Parser({
      baseIRI: app.Caches.overlay.meta.base, format: "text/turtle"
    }).parse(text));
    return ShExWebApp.SemActOverlay.applyOverlay(schema, overlay,
                                                 {prefixes: schema._prefixes || {}});
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
    });
  },

  /** keep what conformed, so the verb has a parse to fold */
  results: base => class extends base {
    async entry (entry) {
      await super.entry(entry);
      if (entry.status === "conformant")
        ShExReduce.parsed.push(entry);
    }
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
    reduce () {
      const ext = ShExPlugins.byId(REDUCE_ID);
      this.resultsWidget.clear();
      this.resultsWidget.start();
      if (!ShExWebApp.Reduce)
        throw Error("ShExReduce's module is not loaded on this page: nothing to fold with");
      if (ext.parsed.length === 0) {
        this.resultsWidget.replace(
          "Validate conformant data against a schema with Reduce actions first: " +
            "the fold is over the parse a validation found.")
          .removeClass("passes fails").addClass("error");
        return this.Caches.ast.set("");
      }
      // {}: an eager run stored every value as it computed it, so the fold
      // has nothing left to evaluate
      const asts = ShExWebApp.Reduce.reduce(ext.parsed, {});
      $("#results .status").text("reduced " + asts.length +
                                 (asts.length === 1 ? " parse" : " parses")).show();
      return this.Caches.ast.set(
        JSON.stringify(asts.length === 1 ? asts[0] : asts, null, "  "));
    },
  },
};

ShExPlugins.register(ShExReduce);
