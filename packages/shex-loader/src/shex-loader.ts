/** @shexjs/loader - HTTP access functions for @shexjs library.
 * For `file:` access or dynamic loading of ShEx extensions, use `@shexjs/node`.
 *
 * load function(shExC, shExJ, turtle, jsonld, schemaOptions = {}, dataOptions = {})
 *   return promise of loaded schema URLs (ShExC and ShExJ), data files (turle, and jsonld)
 * loadExtensions function(globs[])
 *   prototype of loadExtensions. does nothing
 * GET function(url, mediaType)
 *   return promise of {contents, url}
 */

const ShExUtil = require("@shexjs/util");
const {Merger} = require("@shexjs/util/lib/Merger");
const ShExParser = require("@shexjs/parser");

class WebError extends Error {
  url: string | undefined;
  constructor (msg: string, url?: string) {
    super(msg)
    this.url = url
  }
}

class FetchError extends WebError {
  status: number;
  text: string | (() => Promise<string>);
  constructor (msg: string, url: string, status: number, text: string | (() => Promise<string>)) {
    super(msg, url)
    this.status = status
    this.text = text
  }
}

class ResourceError extends WebError {
  constructor (msg: string, url: string) {
    super(msg)
    this.url = url
  }
}

/** A resource which is already loaded or a URL string to load one from. */
type LoaderSource = string | { url: string, text?: string, schema?: any, graph?: any };

class ResourceLoadControler {
  schemasSeen: string[];
  promise: Promise<any[]>;
  resolve!: (results: any[]) => void;
  reject!: (error: any) => void;
  toLoad: Promise<any>[];
  results: any[];
  loaded: number;

  constructor (src: LoaderSource[]) {
    this.schemasSeen = src.map(p => typeof p === "object" ? p.url : p) // loaded URLs
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
    this.toLoad = []
    this.results = []
    this.loaded = 0
  }
  add (promise: Promise<any>): Promise<any> {
    this.toLoad.push(promise)
    const index = this.toLoad.length - 1
    promise.then(value => {
      ++this.loaded
      this.results[index] = value
      if (this.loaded === this.toLoad.length) {
        this.resolve(this.results)
      }
    }, error => this.reject(error));
    return promise
  }
  allLoaded (): Promise<any[]> {
    return this.toLoad.length > 0
      ? this.promise
      : Promise.resolve([])
  }
  loadNovelUrl (url: string, oldUrl: string | null = null): boolean {
    if (this.schemasSeen.indexOf(url) !== -1)
      return false
    this.schemasSeen.push(url)
    if (oldUrl) {
      const oldI = this.schemasSeen.indexOf(oldUrl)
      if (oldI !== -1) {
        this.schemasSeen.splice(oldI, 1)
      }
    }
    return true
  }
}

/** A loaded ShEx extension (e.g. @shexjs/extension-map). */
interface ShExExtensionI {
  url: string;
  register (validator: any, api: { ShExTerm: any }): void;
  done (validator: any): void;
}

/** Result of a GET request. */
interface LoadedResourceI {
  text: string;
  url: string;
}

/** Result of a load() call. */
interface LoadResultI {
  schema: any;
  data: any;
  schemaMeta: any[];
  dataMeta: any[];
}

/** Schema inputs accepted by load(). */
interface SchemaInputI {
  shexc?: LoaderSource[];
  json?: LoaderSource[];
  turtle?: LoaderSource[];
}

/** Data inputs accepted by load(). */
interface DataInputI {
  turtle?: LoaderSource[];
  jsonld?: LoaderSource[];
}

/** Configuration passed to the ShExLoader factory. */
interface ConfigI {
  /** Override the default no-op extension loader. */
  loadExtensions?: (globs: string[]) => Record<string, ShExExtensionI>;
  /** HTTP fetch implementation (e.g. node-fetch). */
  fetch?: (url: string, options?: any) => Promise<any>;
  /** RDF/JS DataFactory + Store implementation (e.g. N3). */
  rdfjs?: any;
  /** jsonld library instance. */
  jsonld?: any;
  /** Options forwarded to jsonld.toRDF(). */
  jsonLdOptions?: any;
}

/** The object returned by the ShExLoader factory. */
interface LoaderI {
  load (
    schema: SchemaInputI | null,
    data: DataInputI | null,
    schemaOptions?: any,
    dataOptions?: any,
  ): Promise<LoadResultI>;

  /** Load ShEx validator extensions matching the given globs. */
  loadExtensions (globs: string[]): Record<string, ShExExtensionI>;

  /** Fetch a URL, returning its text content and resolved URL. */
  GET (url: string, mediaType?: string): Promise<LoadedResourceI>;

  loadSchemaImports (
    schema: any,
    importers: string[],
    resourceLoadControler: ResourceLoadControler,
    schemaOptions?: any,
  ): any;

  ResourceLoadControler: typeof ResourceLoadControler;
  WebError: typeof WebError;
  FetchError: typeof FetchError;
}

function ShExLoaderCjsModule (config: ConfigI = {}): LoaderI {

  const loader: LoaderI = {
    load: load,
    loadExtensions: config.loadExtensions || LoadNoExtensions,
    GET,
    ResourceLoadControler,
    loadSchemaImports,
    WebError,
    FetchError,
  };
  return loader

  async function GET (url: string, mediaType?: string): Promise<LoadedResourceI> {
    let m;
    return (m = url.match("^data:([^,]+),(.*)$"))
      ? Promise.resolve({text: m[2], url: m[0]}) // Read from data: URL
      : (url.match("^(blob:)?[a-z]+://."))
      ? myHttpRequest(url, mediaType)  // whatever fetch handles
      : (() => { throw new WebError(`Unrecognized URL protocol ${url}`) })()

    async function myHttpRequest (url: string, _mediaType?: string): Promise<LoadedResourceI> {
      if (typeof config.fetch !== "function")
        throw new WebError(`Unable to fetch ${url} with fetch=${config.fetch}`)
      let resp
      try {
        resp = await config.fetch(url, {
          headers: {
            'Accept': 'text/shex,text/turtle,*/*'
          }
        })
      } catch (e: any) {
        // DNS failure
        // no route to host
        // connection refused
        throw new WebError(`GET <${url}> network failure: ${e.message}`)
      }
      if (!resp.ok)
        throw new FetchError(`GET <${url}> failed: ${resp.status} ${resp.statusText}`, url, resp.status, resp.text)
      const text = await resp.text()
      return {text, url}
    }
  }

  function addMeta (url: string, mediaType: string, metaList: any[]) {
      const meta = {
        mediaType,
        url,
        base: url,
        prefixes: {}
      }
      metaList.push(meta)
      return meta
    }

  async function mergeSchema (obj: any, mediaType: string, resourceLoadControler: ResourceLoadControler, options: any, importers: string[]) {
    if (!("schema" in obj))
      throw Error(`Bad parameter to mergeSchema; ${summarize(obj)} is not a loaded schema`)
    if (obj.schema.type !== "Schema")
      throw Error(`Bad parameter to mergeSchema .schema; ${summarize(obj.schema)} !== ""Schema`)
    try {
      loadSchemaImports(obj.schema, importers.concat([obj.url]), resourceLoadControler, options);
      return {mediaType, url: obj.url, importers, schema: obj.schema};
    } catch (e: any) {
      const e2 = Error("error merging schema object " + obj.schema + ": " + e)
      e2.stack = e.stack
      throw e2
    }

    function summarize (_o: any): string {
      const marker = String(Math.random())
      const shallow = Object.keys(obj).reduce((acc: any, k) => {
        acc[k] = typeof obj[k] === "object" ? marker : obj[k]
        return acc
      }, {})
      return JSON.stringify(shallow).replace(new RegExp(marker, 'g'), "…")
    }
  }

  async function mergeGraph (obj: any, mediaType: string, _resourceLoadControler: ResourceLoadControler, _options: any, importers: string[]) {
    try {
      // loadOwlImports(obj.graph, importers.concat([obj.url]), resourceLoadControler, options)
      const graph = Array.isArray(obj.graph)
            ? obj.graph
            : obj.graph.getQuads()
      return {mediaType, url: obj.url, importers, graph}
    } catch (e: any) {
      const e2 = Error("error merging graph object " + obj.graph + ": " + e)
      e2.stack = e.stack
      throw e2
    }
  }

  function loadSchemaImports (schema: any, importers: string[], resourceLoadControler: ResourceLoadControler, schemaOptions: any): any {
    if (!("imports" in schema))
      return schema
    if (schemaOptions.keepImports) {
      return schema
    }
    const ret = Object.assign({}, schema)
    delete ret.imports // @@ needed? useful?

    schema.imports.map(
      (i: string) => "iriTransform" in schemaOptions ? schemaOptions.iriTransform(i) : i
    ).filter(
      (i: string) => resourceLoadControler.loadNovelUrl(i)
    ).map((i: string) => {
      resourceLoadControler.add(loader.GET(i).then(loaded => {
        const meta = {
          // mediaType: mediaType,
          url: loaded.url,
          base: loaded.url,
          prefixes: {}
        }
        // metaList.push(meta)
        return parseShExC(loaded.text, "text/shex", loaded.url,
                          meta, schemaOptions, resourceLoadControler, importers)
          .then(({mediaType, url, schema}) => {
            if (schema.start) // When some schema A imports schema B, B's start member is ignored.
              delete schema.start // — http://shex.io/spec/#import
            return {mediaType, url, importers, schema}
          })
      })); // addAfter would be after invoking schema.
    })
    return ret
  }

  async function loadList (src: LoaderSource[], metaList: any[], mediaType: string, parserWrapper: Function, merger: Function, options: any, resourceLoadControler: ResourceLoadControler, importers: string[]) {
    return src.map(
      p => {
        const meta = addMeta(typeof p === "string" ? p : p.url, mediaType, metaList)
        let ret;
        if (typeof p === "string") {
          ret = loader.GET(p, mediaType).then(loaded => {
            meta.base = meta.url = loaded.url // update with wherever if ultimately loaded from after URL fixups and redirects
            resourceLoadControler.loadNovelUrl(loaded.url, p) // replace p with loaded.url in loaded list
            return parserWrapper(loaded.text, mediaType, loaded.url,
                                 meta, options, resourceLoadControler, importers)
          })
        } else {
          if ("text" in p) {
            ret = parserWrapper(p.text, mediaType, p.url, meta, options, resourceLoadControler, importers);
          } else {
            ret = merger(p, mediaType, resourceLoadControler, options, importers);
            (meta as any).importers = importers;
          }
        }
        resourceLoadControler.add(ret);
        return ret;
      }
    )
  }

  /* load - load ShExC, ShExJ, and ShExR into a single Schema and RDF flavors into
   * a graph (Data).
   * SOURCE may be
   * * file path or URL - where to load item.
   * * object: {text: string, url: string} - text and URL of already-loaded resource.
   * * (schema) ShExJ object
   * * (data) RdfJs data store
   * @param schema - { shexc: [ShExC SOURCE], json: [JSON SOURCE], turtle: [ShExR SOURCE] }
   * @param data - { turtle: [Turtle SOURCE], jsonld: [JSON-LD SOURCE] }
   * @param schemaOptions
   * @param dataOptions
   * @returns {Promise<{schema: any, dataMeta: *[], data: (*|null), schemaMeta: *[]}>}
   * @constructor
   */
  async function load (schema: SchemaInputI | null, data: DataInputI | null, schemaOptions: any = {}, dataOptions: any = {}): Promise<LoadResultI> {
    const returns: LoadResultI = {
      schema: ShExUtil.emptySchema(),
      data: config.rdfjs ? new config.rdfjs.Store() : null,
      schemaMeta: [],
      dataMeta: []
    };
    let allSchemas: ResourceLoadControler, allGraphs: ResourceLoadControler;

    // gather all the potentially remote inputs
    {
      const {shexc = [], json = [], turtle = []} = schema || {};
      allSchemas = schemaOptions.loadController || new ResourceLoadControler(shexc.concat(json).concat(turtle));
      loadList(shexc, returns.schemaMeta, "text/shex",
               parseShExC, mergeSchema, schemaOptions, allSchemas, [])
      loadList(json, returns.schemaMeta, "application/json",
               parseShExJ, mergeSchema, schemaOptions, allSchemas, [])
      loadList(turtle || [], returns.schemaMeta, "text/turtle",
               parseShExR, mergeSchema, schemaOptions, allSchemas, [])
    }

    {
      const {turtle = [], jsonld = []} = data || {};
      allGraphs = dataOptions.loadController || new ResourceLoadControler(turtle.concat(jsonld));
      loadList(turtle, returns.dataMeta, "text/turtle",
               parseTurtle, mergeGraph, dataOptions, allGraphs, [])
      loadList(jsonld, returns.dataMeta, "application/ld+json",
               parseJSONLD, mergeGraph, dataOptions, allGraphs, [])
    }

    const [schemaSrcs, dataSrcs] = await Promise.all([allSchemas.allLoaded(),
                                                      allGraphs.allLoaded()])
    const left = {schema: returns.schema, schemaMeta: returns.schemaMeta[0]};
    // const merger = new Merger(left, schemaOptions.collisionPolicy, true);
    schemaSrcs.forEach((sSrc) => {
      const {schema, ...schemaMeta} = sSrc;
      /*merger*/new Merger(left, schemaOptions.collisionPolicy, true).merge({schema, schemaMeta});
      delete sSrc.schema;
      // process.stdout.clearLine();
      // process.stdout.cursorTo(0);
      // process.stdout.write(`Merged ${idx} of ${schemaSrcs.length} imports: ${schemaMeta.url}`);
    });
    // process.stdout.clearLine();
    // process.stdout.cursorTo(0);
    // process.stdout.write(`Merged ${schemaSrcs.length} imports.\n`);
    dataSrcs.forEach(dSrc => {
      returns.data.addQuads(dSrc.graph)
      delete dSrc.graph;
    });
    if (returns.schemaMeta.length > 0 && !schemaOptions.keepImports)
      ShExUtil.isWellDefined(returns.schema, schemaOptions)
    return returns
  }

  function parseShExC (text: string, mediaType: string, url: string, meta: any, schemaOptions: any, resourceLoadControler: ResourceLoadControler, importers: string[]): Promise<any> {
    const parser = schemaOptions && "parser" in schemaOptions ?
        schemaOptions.parser :
        ShExParser.construct(url, {}, schemaOptions)
    try {
      meta.prefixes = {};
      meta.importers = importers;
      const schema = parser.parse(text, url, {meta}, /*filename*/)
      // !! horrible hack until I set a variable to know if there's a BASE.
      if (schema.base === url) delete schema.base
      loadSchemaImports(schema, importers.concat([url]), resourceLoadControler, schemaOptions)
      return Promise.resolve({mediaType, url, importers, schema})
    } catch (e: any) {
      const locStr = e.location
            ? `(${e.location.first_line}:${e.location.first_column})`
            : ''
      e.message = "error parsing ShEx " + url + locStr + ": " + e.message
      return Promise.reject(e)
    }
  }

  function parseShExJ (text: string, mediaType: string, url: string, meta: any, schemaOptions: any, resourceLoadControler: ResourceLoadControler, importers: string[]): Promise<any> {
    try {
      const s = ShExUtil.ShExJtoAS(JSON.parse(text))
      meta.prefixes = {}
      meta.importers = importers;
      meta.base = null
      loadSchemaImports(s, importers.concat([url]), resourceLoadControler, schemaOptions || {})
      return Promise.resolve({mediaType, url, importers, schema: s})
    } catch (e) {
      const e2 = Error("error parsing JSON " + url + ": " + e)
      // e2.stack = e.stack
      return Promise.reject(e2)
    }
  }

  async function parseShExR (text: string, mediaType: string, url: string, meta: any, schemaOptions: any, resourceLoadControler: ResourceLoadControler, importers: string[]): Promise<any> {
    try {
      const x = await parseTurtle(text, mediaType, url, meta, schemaOptions, resourceLoadControler, importers)
      const graph = new config.rdfjs.Store();
      graph.addQuads(x.graph);
      const graphParser = new schemaOptions.graphParser.validator(
        schemaOptions.graphParser.schema,
        schemaOptions.graphParser.rdfjsdb(graph),
        {}
      );
      const schemaRoot = graph.getQuads(null, ShExUtil.RDF.type, "http://www.w3.org/ns/shex#Schema")[0].subject;
      const val = graphParser.validate(schemaRoot, schemaOptions.graphParser.validator.Start);
      if ("errors" in val)
        throw new ResourceError(`${url} did not validate as a ShEx schema: ${JSON.stringify(val.errors, null, 2)}`, url)
      const schema = ShExUtil.ShExJtoAS(ShExUtil.ShExRtoShExJ(ShExUtil.valuesToSchema(ShExUtil.valToValues(val))));
      await loadSchemaImports(schema, importers.concat([url]), resourceLoadControler, schemaOptions || {}); // shouldn't be any
      return Promise.resolve({mediaType, url, importers, schema})
    } catch (e: any) {
      const e2 = Error("error parsing Turtle schema " + url + ": " + e)
      if (typeof e === "object" && "stack" in e)
        e2.stack = e.stack
      return Promise.reject(e2)
    }
  }

  function parseTurtle (text: string, mediaType: string, url: string, meta: any, _dataOptions: any, _resourceLoadControler: ResourceLoadControler, importers: string[]): Promise<any> {
    return new Promise(function (resolve, reject) {
      const graph: any[] = []
      new config.rdfjs.Parser({baseIRI: url, blankNodePrefix: "", format: "text/turtle"}).
        parse(text,
              function (this: any, error: any, quad: any, prefixes: any) {
                if (prefixes) {
                  meta.prefixes = prefixes
                  // data.addPrefixes(prefixes)
                }
                meta.importers = importers;
                if (error) {
                  reject("error parsing " + url + ": " + error)
                } else if (quad) {
                  graph.push(quad)
                } else {
                  meta.base = this._base
                  resolve({mediaType, url, importers, graph})
                }
              })
    })
  }

  async function parseJSONLD (text: string, mediaType: string, url: string, meta: any, dataOptions: any, resourceLoadControler: ResourceLoadControler, importers: string[]): Promise<any> {
    const struct = JSON.parse(text)
    try {
      const nquads = await config.jsonld.toRDF(struct, Object.assign(
        {
          format: "application/nquads",
          base: url
        },
        config.jsonLdOptions || {}
      ))
      meta.prefixes = {}; // @@ take from @context?
      meta.base = url;    // @@ take from @context.base? (or vocab?)
      meta.importers = importers;
      return parseTurtle(nquads, mediaType, url, meta, dataOptions, resourceLoadControler, importers)
    } catch (lderr: any) {
      let e = lderr
      if ("details" in e) e = e.details
      if ("cause" in e) e = e.cause
      throw new ResourceError("error parsing JSON-ld " + url + ": " + e, url)
    }
  }

  function LoadNoExtensions (_globs: string[]): Record<string, ShExExtensionI> { return [] as unknown as Record<string, ShExExtensionI>; }
}

/* Type aliases so consumers can keep using e.g. `ShExLoader.Config` and
 * `ShExLoader.Loader` (see @shexjs/node's shex-node.d.ts).  The namespace
 * holds only types, so the runtime export stays the bare factory function.
 */
namespace ShExLoaderCjsModule {
  export type ShExExtension = ShExExtensionI;
  export type LoadedResource = LoadedResourceI;
  export type LoadResult = LoadResultI;
  export type SchemaInput = SchemaInputI;
  export type DataInput = DataInputI;
  export type Config = ConfigI;
  export type Loader = LoaderI;
}

export = ShExLoaderCjsModule;
