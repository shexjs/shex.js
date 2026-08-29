/**
 * The panes as the app sees them: an InterfaceCache is a textarea with a
 * parse, a dirty bit and a status line, and each kind of pane -- schema,
 * data (a TurtleCache, which is also where the data source's documents
 * live), manifest, plugin, JSON -- is a cache class over that.  The shape
 * map's is in ShExShapeMapCache.js, being a page of its own.
 *
 * This is doc/ShExCaches.js's source (tsconfig.app.json compiles src/app/ into
 * doc/); edit here and run `npm run build`.
 */

/** what a pane's parse learns about its document -- prefixes and base --
 * and the spellers built on them */
interface CacheMeta {
  prefixes: {[prefix: string]: string};
  base: string;
  // set by every cache that lexifies (the schema, the data, the shape map);
  // a manifest, plugin or JSON pane never asks
  termToLex: (term: any, ...rest: any[]) => string;    // a term as this document would write it
  lexToTerm: (lex: string) => any;                     // ...and back
}

/** the app's panes by name (ShExBaseApp.Caches): the four every page has,
 * what the editors add, and whatever panes a plugin brings */
interface AppCaches {
  inputSchema: SchemaCache;
  inputData: TurtleCache;
  plugin: PluginCache;
  shapeMap: ShapeMapCache;
  manifest?: ManifestCache;
  editorSupport?: EditorSupport;
  [name: string]: any;
}

/** what every cache answers, each kind its own way */
interface InterfaceCache {
  parse (text: string, base?: string): Promise<any>;
  getItems? (): Promise<any[]>;
}

class InterfaceCache {
  _dirty: boolean;
  selection: any;                    // jQuery: the textarea (or drop target) this pane is
  onLoad: (() => void) | null;
  parsed: any;                       // what parse answered: a schema, a db, a store...
  url: string | undefined;           // where the document was GOT from, while it is unedited
  meta: CacheMeta;
  // TODO(B1): read by set() and tryN3() but never assigned (the @@crappyHack1
  // comparisons read undefined)
  base?: string;
  baseOverride?: string;             // a base this pane was given (?data-base=), outlasting its documents
  // TODO(B1): read by asyncGet's error message but never assigned on a cache
  queryStringParm?: string;
  // caches for textarea parsers
  constructor (selection: any, onLoad: (() => void) | null) {
    this._dirty = true;
    this.selection = selection;
    this.onLoad = onLoad;
    this.parsed = null; // a Promise
    this.url = undefined; // only set if inputarea caches some web resource.
    this.meta = { prefixes: {}, base: DefaultBase } as CacheMeta;
  }

  dirty (newVal: boolean): boolean {
    const ret = this._dirty;
    this._dirty = newVal;
    return ret;
  }

  get (): string {
    return this.selection.val();
  }

  // (a manifest or a plugin is also told where it came from and what it is)
  async set (text: any, base: string, _source?: any, _mediaType?: string): Promise<void> {
    this._dirty = true;
    this.selection.val(text);
    // a base this pane was given (?data-base=) outlasts the documents that
    // come and go in it; a document's own URL is the base otherwise
    this.meta.base = this.baseOverride || base;
    if (base !== this.base) {
      this.url = base; // @@crappyHack1 -- parms should differntiate:
      // working base: base for URL resolution.
      // loaded base: place where you can GET current doc.
      // Note that this.Caches.manifest.set takes a 3rd parm.
    }
  }

  async refresh (): Promise<any> {
    if (!this._dirty)
      return this.parsed;
    this.parsed = await this.parse(this.selection.val(), this.meta.base);
    await this.parsed;
    this._dirty = false;
    return this.parsed;
  }

  async asyncGet (url: string): Promise<{url: string, data: string}> {
    url = new URL(url, window.location.href).href
    const _cache = this;
    let resp
    try {
      resp = await fetch(url, {headers: {
        accept: 'text/shex,text/turtle,*/*;q=0.9, test/html;q=0.8',
        // cache: 'no-cache' -- breaks CORS, so user has to open in new page and force reload there
      }})
    } catch (e: any) {
      throw Error("unable to fetch <" + url + ">: " + '\n' + e.message);
    }
    if (!resp.ok)
      throw Error("fetch <" + url + "> got error response " + resp.status + ": " + resp.statusText);
    const data = await resp.text();
    _cache.meta.base = url;
    try {
      await _cache.set(data, url, undefined, resp.headers.get('content-type')!);
    } catch (e: any) {
      throw Error("error setting " + this.queryStringParm + " with <" + url + ">: " + '\n' + e.message);
    }
    $("#loadForm").dialog("close");
    return { url: url, data: data };
  }

  callOnLoad (): void {
    if (this.onLoad)
      this.onLoad();
  }
}

class SchemaCache extends InterfaceCache {
  shexcParser: ShExCParser;
  turtleParser: TurtleParser;
  graph: any;                        // the schema as RDF, when it was written as ShExR
  language: string | null;           // "ShExC", "ShExJ", "ShExR" or "DCTAP", once parsed
  constructor (selection: any, onLoad: (() => void) | null, shexcParser: ShExCParser, turtleParser: TurtleParser) {
    super(selection, onLoad);
    this.shexcParser = shexcParser;
    this.turtleParser = turtleParser;
    this.graph = null;
    this.language = null;

    this.meta.termToLex = (trm: any) => trm === ShExWebApp.Validator.Start
      ? START_SHAPE_LABEL
      : ShExWebApp.ShExTerm.shExJsTerm2Turtle(trm, this.meta, true);
    this.meta.lexToTerm = (lex: string) => lex === START_SHAPE_LABEL
      ? ShExWebApp.Validator.Start
      : turtleParser.termToLd(lex, new IRIResolver(this.meta));
  }

  async parse (text: string, base: string): Promise<any> {
    const parseShExR = () => {
      const graphParser = new ShExWebApp.Validator(
        this.shexcParser.parseString(ShExWebApp.Util.ShExRSchema, {}, base), // !! do something useful with the meta parm (prefixes and base)
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
    $("#results > .status").text("parsing "+this.language+" schema...").show();
    const schema =
          isJSON ? ShExWebApp.Util.ShExJtoAS(JSON.parse(text)) :
          isDCTAP ? await parseDcTap(text) :
          this.graph ? parseShExR() :
          this.shexcParser.parseString(text, this.meta, base);
    $("#results > .status").hide();
    this.callOnLoad();
    return schema;

    async function parseDcTap (text: string): Promise<any> {
      const dctap = new ShExWebApp.DcTap();
      return await new Promise((resolve, reject) => {
        $.csv.toArrays(text, {}, (err: any, data: any) => {
          if (err) reject(err)
          dctap.parseRows(data, base)
          resolve(dctap.toShEx())
        })
      })
    }
  }

  async getItems (): Promise<string[]> {
    const obj = await this.refresh();
    const start = "start" in obj ? [START_SHAPE_LABEL] : [];
    const rest = "shapes" in obj ? obj.shapes.map((se: any) => this.meta.termToLex(se.id)) : [];
    return start.concat(rest);
  }

  tryN3 (text: string): any {
    try {
      if (text.match(/^\s*$/))
        return null;
      const db = this.turtleParser.parseString (text, this.meta, this.base); // interpret empty schema as ShExC
      if (db.getQuads().length === 0)
        return null;
      return db;
    } catch (e: any) {
      return null; // signal caller that text isn't Turtle
    }
  }
}

class TurtleCache extends InterfaceCache {
  turtleParser: TurtleParser;
  queryTrackerController: any;       // the app's (ShExBaseApp-validation): its queryTracker records a slurp
  neighborhoods!: NeighborhoodConfig; // the data source picker, assigned by the app (ShExBaseApp)
  endpoint?: string;                 // the selected source's, while it has one
  dbSignature?: string;              // what the db was last built from, so a fetching one isn't rebuilt for nothing
  constructor (selection: any, onLoad: (() => void) | null, turtleParser: TurtleParser, queryTrackerController?: any) {
    super(selection, onLoad);
    this.turtleParser = turtleParser;
    this.queryTrackerController = queryTrackerController;
    this.meta.termToLex = (trm: any) => ShExWebApp.ShExTerm.rdfJsTerm2Turtle(trm, this.meta);
    this.meta.lexToTerm = (lex: string) => turtleParser.termToLd(lex, new IRIResolver(this.meta));
  }

  /** Which neighborhood serves this pane is the modules' business, not this
   * app's: each says whether it answers to the pane's text and with what
   * parameters (claimPaneText), and the app builds whichever claims it
   * (fromParams).  A module that declares a `data` parameter -- rdfjs --
   * gets the parsed store, since the Turtle parser and this pane's
   * prefixes and base live here.
   */
  async parse (text: string, base: string): Promise<any> {
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
    // What the parameters say, whether or not the db has to be rebuilt from
    // them: this is bookkeeping about the source, and the shape map's SPARQL
    // extension reads it.  Below the early return it was whatever the last
    // db that *was* built had left -- so a second entry against the same
    // endpoint asked its query map with no endpoint recorded.
    if ("endpoint" in params)
      this.endpoint = params.endpoint;
    else
      delete this.endpoint;

    if (fetches && this.parsed && signature === this.dbSignature)
      return this.parsed;
    this.dbSignature = signature;

    // A pane of Turtle is this app's to parse: it owns the parser, and the
    // prefixes and base it finds are what the rest of the app lexifies
    // nodes with.  Panes of anything else go to the module as text.
    const turtlePane = ShExWebApp.NeighborhoodApi.paneParams(module.dbParams || [])
          .find((p: any) => ((p.schema.items || {}).contentMediaType || "") === "text/turtle");
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
  async resolveQueryMapExtension (language: string, lexical: string): Promise<any[]> {
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
  writeQueryMapExtension (language: string, lexical: string): string {
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
  async getItems (): Promise<string[]> {
    const data = await this.refresh();
    if (typeof data.suggestFocusNodes === "function")
      return data.suggestFocusNodes("", SPARQL_get_items_limit)
        .map((suggestion: any) => this.meta.termToLex(RdfJs.DataFactory.namedNode(suggestion.label)));
    if (this.endpoint) {
      const q = "SELECT DISTINCT ?s { ?s ?p ?o } LIMIT " + SPARQL_get_items_limit;
      // (this read ShEx.Util, which is not a thing in this file: the menu
      // has been quietly falling back to "no choices found" over endpoints)
      // ...Promise: a blocking request here freezes the tab while someone is
      // typing into the menu it fills, which is the worst possible moment
      const rows = await ShExWebApp.Util.executeQueryPromise(
        q, this.endpoint, RdfJs.DataFactory);
      return [MENU_ITEM_materialize].concat(rows.map((row: any[]) => this.lexifyFirstColumn(row)));
    }
    return data.getQuads().map((t: any) => this.meta.termToLex(t.subject));
  }

  lexifyFirstColumn (row: any[]): string {
    return this.meta.termToLex(row[0]); // row[0] is the first column.
  }
}

/** a manifest entry's data half as the data menu lists it: the first
 * document is the entry's as far as every existing path is concerned, the
 * rest come along at pick time (makeDataEntry) */
interface DataEntry {
  label: string;
  text: string | undefined;          // undefined: fetch it from url
  url: string | undefined;
  moreTexts: string[];
  moreUrls: string[];
  entry: any;                        // the manifest entry itself
}

class ManifestCache extends InterfaceCache {
  caches: AppCaches;
  resultsWidget: ResultsWidget;
  queryParams: any[] | null;         // the app's QueryParams registry, assigned post-construction
  // manifest-descriptor keys pickSchema/pickData/queryMapLoaded handle
  // themselves; loadExtraInputs loads the rest
  static pickLoadedKeys: string[] = ["schema", "data", "queryMap"];

  constructor (selection: any, caches: AppCaches, resultsWidget: ResultsWidget) {
    super(selection, null);
    this.caches = caches;
    this.resultsWidget = resultsWidget;
    this.queryParams = null; // the app's QueryParams registry, assigned post-construction
  }

  async set (textOrObj: any, url: string, source?: any): Promise<void> {
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
        } catch (eJson: any) {
          try {
            textOrObj = ShExWebApp.JsYaml.load(textOrObj);
          } catch (eYaml: any) {
            throw url.endsWith(".yaml")
              ? eYaml
              : eJson;
          }
        }
      } catch (e: any) {
        $("#inputSchema .manifest").append($("<li/>").text(NO_MANIFEST_LOADED));
        const throwMe: any = Error(e + '\n' + textOrObj);
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
    const demos = textOrObj.reduce((acc: any[], elt: any) => {
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
            ? elt[parm].map((each: string) => new URL(each, url).href)
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

  async parse (text: string, base: string): Promise<any> {
    throw Error("should not try to parse manifest cache");
  }

  async getItems (): Promise<any[]> {
    throw Error("should not try to get manifest cache items");
  }

  maybeGET (obj: any, base: string, key: string, accept: string): void { // !!not used
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
        }).then((text: string) => {
          resolve(text);
        }).fail((e: any) => {
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

  async prepareManifest (demoList: any[], base: string): Promise<void> {
    const listItems = Object.keys(this.caches).reduce((acc: any, k) => {
      acc[k] = {};
      return acc;
    }, {});
    const nesting = demoList.reduce((acc: any, elt: any, idx: number) => {
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
  async paintManifest (selector: string, list: any[], func: (...args: any[]) => any, listItems: any, side: string): Promise<void> {
    $(selector).empty();
    await Promise.all(list.map(async (entry: any) => {
      // build button disabled and with leading "..." to indicate that it's being loaded
      const button = $("<button/>").text("..." + entry.label.substr(3)).attr("disabled", "disabled");
      const li = $("<li/>").append(button);
      $(selector).append(li);
      if (entry.text === undefined) {
        entry.text = await this.fetchOK(entry.url).catch((responseOrError: any) => {
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
          SharedForTests.app.track(func(entry.name, entry, li, listItems, side));
        });
        // an entry with no document -- a query service is the data -- has
        // nothing for the pane to hold, so an empty pane does not mean it
        if (entry.text !== "")
          listItems[side][ManifestCache.sum(entry.text)] = li;
        // enable and get rid of the "..." in the label now that it's loaded
        button.text(entry.label).removeAttr("disabled");
      }
    }))
    this.setTextAreaHandlers(listItems);
  }

  setTextAreaHandlers (listItems: any): void {
    const timeouts = Object.keys(this.caches).reduce((acc: any, k) => {
      acc[k] = undefined;
      return acc;
    }, {});

    Object.keys(this.caches).forEach((cache) => {
      this.caches[cache].selection.keyup((e: any) => { // keyup to capture backspace
        const code = e.keyCode || e.charCode;
        // if (!(e.ctrlKey)) {
        //   this.resultsWidget.clear();
        // }
        if (!(e.ctrlKey && (code === 10 || code === 13))) {
          // A validation is about a schema and a document *together*, so an
          // edit to either leaves the marks in both saying something about
          // text that is no longer there.  The edited pane's go by
          // themselves -- its own linter re-runs and replaces them -- and
          // the other pane's, which nothing has happened to, are these.
          //
          // Unless it is the app writing rather than the reader typing: a
          // pane swapping to another of the source's documents raises the
          // same event (the editor writes through the textarea), and the
          // marks are the point of the swap -- reaimAtShowingDocument hands
          // the pane the ones belonging to the document now in it.
          const source = this.caches.inputData && this.caches.inputData.neighborhoods;
          if ((cache === "inputSchema" || cache === "inputData")
              && this.caches.editorSupport
              && !(source && source.showingPane))
            this.caches.editorSupport.clearValidationMarks();
          later(e.target, cache, this.caches[cache]);
        }
      });
    });

    function later (target: any, side: string, cache: InterfaceCache) {
      cache.dirty(true);
      if (timeouts[side])
        clearTimeout(timeouts[side]);

      timeouts[side] = setTimeout(() => {
        timeouts[side] = undefined;
        const curSum = ManifestCache.sum($(target).val());
        if (curSum in listItems[side])
          listItems[side][curSum].addClass("selected");
        else // ...and an entry with no document keeps its mark: the pane was never its
          Object.keys(listItems[side]).forEach(sum => listItems[side][sum].removeClass("selected"));
        delete cache.url;
      }, INPUTAREA_TIMEOUT);
    }
  }

  /** A data source that takes several documents -- a Wikibase's entity
   * pages, say -- is given them as an array under the same `data`/`dataURL`
   * keys one document uses.  The first is the entry's document as far as
   * every existing path is concerned (the pick machinery, `.selected`
   * matching, the load dialog); the rest are fetched at pick time. */
  makeDataEntry (dataLabel: string, idx: number, elt: any, base: string): DataEntry {
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

  async pickSchema (name: string, schemaTest: any, elt: any, listItems: any, side: string): Promise<void> {
    if ($(elt).hasClass("selected")) {
      await this.clearAll();
    } else {
      await this.caches.inputSchema.set(schemaTest.text, new URL((schemaTest.url || ""), DefaultBase).href);
      this.caches.inputSchema.url = undefined; // @@ crappyHack1
      $("#inputSchema .status").text(name);

      this.clearData();
      const headings: {[key: string]: string} = {
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
      } catch (e: any) {
        this.resultsWidget.failMessage(e, "parsing schema");
      }
    }
  }

  async pickData (name: string, dataTest: DataEntry, elt: any, listItems: any, side: string): Promise<void> {
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
      } catch (e: any) {
        this.resultsWidget.failMessage(e, "parsing data");
      }

      // Update ShapeMap pane.
      this.caches.shapeMap.removeEditMapPair(null);
      if (dataTest.entry.queryMap !== undefined) {
        await this.queryMapLoaded(dataTest, dataTest.entry.queryMap);
      } else if (dataTest.entry.queryMapURL !== undefined) {
        try {
          const resp = await this.fetchOK(dataTest.entry.queryMapURL)
          await this.queryMapLoaded(dataTest, resp);
        } catch (e: any) {
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
   * `plugins` is the key. */
  async loadEntryPlugins (dataTest: DataEntry): Promise<void> {
    const named = dataTest.entry.plugins;
    if (named === undefined)
      return;
    for (const url of Array.isArray(named) ? named : [named]) {
      const absolute = new URL(url, this.url || dataTest.url || DefaultBase).href;
      try {
        await this.caches.plugin.asyncGet(absolute);
      } catch (e: any) {
        this.renderErrorMessage(e, "plugin");
      }
    }
  }

  async loadExtraInputs (dataTest: DataEntry): Promise<void> {
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
        } catch (e: any) {
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
  async extraDataDocuments (dataTest: DataEntry): Promise<string[]> {
    const texts = (dataTest.moreTexts || []).slice();
    for (const url of dataTest.moreUrls || []) {
      const absolute = new URL(url, dataTest.url || DefaultBase).href;
      try {
        texts.push(await this.fetchOK(absolute));
      } catch (e: any) {
        this.renderErrorMessage(e, "data");
      }
    }
    return texts;
  }

  async queryMapLoaded (dataTest: DataEntry, text: string): Promise<void> {
    dataTest.entry.queryMap = text;
    try {
      $("#queryMap").val(JSON.parse(dataTest.entry.queryMap).map((entry: any) => `<${entry.node}>@<${entry.shape}>`).join(",\n"));
    } catch (e: any) {
      $("#queryMap").val(dataTest.entry.queryMap);
    }
    await this.caches.shapeMap.copyQueryMapToEditMap();
    // callValidator();
  }

  fetchOK (url: string): Promise<string> {
    return fetch(url).then(responseOrError => {
      if (!responseOrError.ok) {
        throw responseOrError;
      }
      return responseOrError.text()
    });
  }

  renderErrorMessage (response: any, what: string): string {
    const message = response instanceof Error
          ? "failed to load " + what + ": " + response.message
          : "failed to load " + what + " from <" + response.url + ">, got: " + response.status + " " + response.statusText;
    this.resultsWidget.append($("<pre/>").text(message).addClass("error"));
    return message;
  }

  async clearData (): Promise<void> {
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

  async clearAll (): Promise<void> {
    $("#results > .status").hide();
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

  static sum (s: string): number { // cheap way to identify identical strings
    return s.replace(/\s/g, "").split("").reduce((a: number, b: string) => {
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
  resultsWidget: ResultsWidget;
  urls: string[];                    // every plugin loaded, for the permalink
  asking?: Promise<void>;            // the trust question now being asked, so the next waits its turn
  /** sessionStorage: the origins the reader said may keep loading, for the tab */
  static TRUSTED_ORIGINS_KEY: string = "shex-plugin-origins";

  constructor (selection: any, resultsWidget: ResultsWidget) {
    super(selection, null);
    this.resultsWidget = resultsWidget;
    this.urls = []; // every plugin loaded, for the permalink
    // the question a plugin from another origin raises, hidden until asked
    $("#trustForm").dialog({autoOpen: false, modal: true, width: 520});
  }

  /** what InterfaceCache does, once the reader has said it may (doc/plugins.md, Trust) */
  async asyncGet (url: string): Promise<{url: string, data: string}> {
    await this.permission(new URL(url, window.location.href).href);
    return super.asyncGet(url);
  }

  /**
   * Whether a plugin from `url` may run in this page.  The page's own
   * origin may -- it came with the page.  Another may once the reader has
   * said so, for this once or for the life of the tab, and may not once
   * they have said not; closing the question says not.  One question at
   * a time: a link that names two plugins asks twice, in turn.
   */
  permission (url: string): Promise<void> {
    const origin = new URL(url).origin;
    if (origin === window.location.origin || PluginCache.trustedOrigins().indexOf(origin) !== -1)
      return Promise.resolve();
    const form = $("#trustForm");
    if (form.length === 0) // a page with no way to ask does not load
      return Promise.reject(Error(`plugin <${url}> not loaded: this page cannot ask whether it may`));
    const ask = () => new Promise<void>((resolve, reject) => {
      form.find(".origin").text(origin);
      form.find(".url").text(url);
      form.dialog({
        buttons: [ // resolve before closing: closing declines
          {text: "Load", id: "trustOnce", click: () => { resolve(); form.dialog("close"); }},
          {text: "Load, and any more from this site this session", id: "trustOrigin",
           click: () => { PluginCache.trust(origin); resolve(); form.dialog("close"); }},
          {text: "Don't load", id: "trustNot", click: () => form.dialog("close")},
        ],
        close: () => reject(Error(`plugin <${url}> not loaded: declined`)),
      });
      form.dialog("open");
    });
    this.asking = (this.asking || Promise.resolve()).then(ask, ask);
    return this.asking;
  }

  static trustedOrigins (): string[] {
    try {
      return JSON.parse(window.sessionStorage.getItem(PluginCache.TRUSTED_ORIGINS_KEY) || "[]");
    } catch (e: any) {
      return []; // no storage here (an opaque origin): nothing remembered
    }
  }

  static trust (origin: string): void {
    try {
      window.sessionStorage.setItem(PluginCache.TRUSTED_ORIGINS_KEY,
                                    JSON.stringify(PluginCache.trustedOrigins().concat(origin)));
    } catch (e: any) {
      // no storage: this once, then
    }
  }

  async set (code: string, url: string, source: any, mediaType: string): Promise<void> {
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
    } catch (e: any) {
      // $("#inputSchema .plugin").append($("<li/>").text(NO_PLUGIN_LOADED));
      const throwMe: any = Error(e + '\n' + code);
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
  async grepHtmlIndexForPackage (code: string, url: string, source: any): Promise<void> {
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
      await this.set(code, href, source, refd.headers.get('content-type')!);
    }
  }

  async parse (text: string, base: string): Promise<any> {
    throw Error("should not try to parse plugin cache");
  }

  async getItems (): Promise<any[]> {
    throw Error("should not try to get plugin cache items");
  }
}

/** a pane holding JSON: bindings, static variables, anything a plugin
 * wants read back as data rather than as a document */
class JSONCache extends InterfaceCache {
  constructor (selection: any) {
    super(selection, null);
  }

  async parse (text: string): Promise<any> {
    return Promise.resolve(JSON.parse(text));
  }
}
