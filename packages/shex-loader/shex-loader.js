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

const ShExLoaderCjsModule = function (config = {}) {

  const ShExUtil = require("@shexjs/util");
  const ShExParser = require("@shexjs/parser");

  class ResourceLoadControler {
    constructor (src) {
      this.schemasSeen = src.map(p => typeof p === "object" ? p.url : p) // loaded URLs
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
      this.toLoad = []
      this.results = []
      this.loaded = 0
    }
    add (promise) {
      this.toLoad.push(promise)
      const index = this.toLoad.length - 1
      promise.then(value => {
        ++this.loaded
        this.results[index] = value
        if (this.loaded === this.toLoad.length) {
          this.resolve(this.results)
        }
      }).catch(error => this.reject(error))
      return promise
    }
    allLoaded () {
      return this.toLoad.length > 0
        ? this.promise
        : Promise.resolve([])
    }
    loadNovelUrl (url, oldUrl = null) {
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

  const loader = {
    load: load,
    loadExtensions: LoadNoExtensions,
    GET,
    ResourceLoadControler,
    loadSchemaImports,
  };
  return loader
  
  async function GET (url, mediaType) {
    let m;
    return (m = url.match("^data:([^,]+),(.*)$"))
      ? Promise.resolve({text: m[2], url: m[0]}) // Read from data: URL
      : (url.match("^(blob:)?[a-z]+://."))
      ? myHttpRequest(url, mediaType) // whatever fetch handles
      : (() => { throw Error(`Don't know how to fetch ${url}`) })()

    async function myHttpRequest(url, mediaType) {
      if (typeof config.fetch !== "function")
        throw Error(`Unable to fetch ${url} with fetch=${config.fetch}`)
      let resp
      try {
        resp = await config.fetch(url, {
          headers: {
            'Accept': 'text/shex,text/turtle,*/*'
          }
        })
      } catch (e) {
        // DNS failure
        // no route to host
        // connection refused
        throw Error(`GET <${url}> network failure: ${e.message}`)
      }
      if (!resp.ok)
        throw Error(`GET <${url}> failed: ${resp.status} ${resp.statusText}`)
      const text = await resp.text()
      return {text, url}
    }
  }

  function addMeta (url, mediaType, metaList) {
      const meta = {
        mediaType,
        url,
        base: url,
        prefixes: {}
      }
      metaList.push(meta)
      return meta
    }

  async function mergeSchema (obj, mediaType, resourceLoadControler, options) {
    try {
      loadSchemaImports(obj.schema, resourceLoadControler, options)
      return {mediaType, url: obj.url, schema: obj.schema}
    } catch (e) {
      const e2 = Error("error merging schema object " + obj.schema + ": " + e)
      e2.stack = e.stack
      throw e2
    }
  }

  async function mergeGraph (obj, mediaType, resourceLoadControler, options) {
    try {
      const graph = Array.isArray(typeof obj.graph)
            ? obj.graph
            : obj.graph.getQuads()
      return {mediaType, url: obj.url, graph}
    } catch (e) {
      const e2 = Error("error merging graph object " + obj.graph + ": " + e)
      e2.stack = e.stack
      throw e2
    }
  }

  function loadSchemaImports (schema, resourceLoadControler, schemaOptions) {
    if (!("imports" in schema))
      return schema
    if (schemaOptions.keepImports) {
      return schema
    }
    const ret = Object.assign({}, schema)
    const imports = ret.imports
    delete ret.imports // @@ needed? useful?

    schema.imports.map(
      i => "iriTransform" in schemaOptions ? schemaOptions.iriTransform(i) : i
    ).filter(
      i => resourceLoadControler.loadNovelUrl(i)
    ).map(i => {
      resourceLoadControler.add(loader.GET(i).then(loaded => {
        const meta = {
          // mediaType: mediaType,
          url: loaded.url,
          base: loaded.url,
          prefixes: {}
        }
        // metaList.push(meta)
        return parseShExC(loaded.text, "text/shex", loaded.url,
                          meta, schemaOptions, resourceLoadControler)
          .then(({mediaType, url, schema}) => {
            if (schema.start) // When some schema A imports schema B, B's start member is ignored.
              delete schema.start // — http://shex.io/spec/#import
            return {mediaType, url, schema}
          })
      })); // addAfter would be after invoking schema.
    })
    return ret
  }

  function loadList (src, metaList, mediaType, parserWrapper, merger, options, resourceLoadControler) {
    return src.map(
      async p => {
        const meta = addMeta(typeof p === "string" ? p : p.url, mediaType, metaList)
        const ret =
              typeof p === "object" && !("text" in p)
              ? merger(p, mediaType, resourceLoadControler, options)
              : loadParseMergeSchema(p, meta)
        resourceLoadControler.add(ret)
        return ret
      }
    )

    async function loadParseMergeSchema (p, meta) {
      if (typeof p === "object") {
        return await parserWrapper(p.text, mediaType, p.url, meta, options, resourceLoadControler)
      } else {
        const loaded = await loader.GET(p, mediaType)
        meta.base = meta.url = loaded.url // update with wherever if ultimately loaded from after URL fixups and redirects
        resourceLoadControler.loadNovelUrl(loaded.url, p) // replace p with loaded.url in loaded list
        return await parserWrapper(loaded.text, mediaType, loaded.url,
                             meta, options, resourceLoadControler)
      }
    }
  }

  /* load - load shex and json files into a single Schema and turtle into
   * a graph (Data).
   * SOURCE may be
   * * file path or URL - where to load item.
   * * object: {text: string, url: string} - text and URL of already-loaded resource.
   * * (schema) ShExJ object
   * * (data) RdfJs data store
   * @param schema - { shexc: [ShExC SOURCE], json: [JSON SOURCE] }
   * @param data - { turtle: [Turtle SOURCE], jsonld: [JSON-LD SOURCE] }
   * @param schemaOptions
   * @param dataOptions
   * @returns {Promise<{schema: any, dataMeta: *[], data: (*|null), schemaMeta: *[]}>}
   * @constructor
   */
  async function load (schema, data, schemaOptions = {}, dataOptions = {}) {
    const {shexc = [], json = []} = schema || {};
    
    const {turtle = [], jsonld = []} = data || {};
    const returns = {
      schema: ShExUtil.emptySchema(),
      data: config.rdfjs ? new config.rdfjs.Store() : null,
      schemaMeta: [],
      dataMeta: []
    };

    // gather all the potentially remote inputs
    if (schemaOptions && "termResolver" in schemaOptions) {
      returns.resolverMeta = []
      // load the resolver then the schema sources,
      const allResolvers = new ResourceLoadControler(schemaOptions.termResolver);
      loadList(schemaOptions.termResolver, returns.resolverMeta, "text/turtle",
               parseTurtle, mergeGraph, dataOptions, allResolvers)
      const loadedResolvers = await allResolvers.allLoaded()
      returns.resolver = new config.rdfjs.Store()
      loadedResolvers.forEach(rSrc => {
        returns.resolver.addQuads(rSrc.graph)
        delete rSrc.graph;
      })
      schemaOptions.termResolver = ShExParser.dbTermResolver(returns.resolver)
    }

    const allSchemas = new ResourceLoadControler(shexc.concat(json));
    loadList(shexc, returns.schemaMeta, "text/shex",
             parseShExC, mergeSchema, schemaOptions, allSchemas)
    loadList(json, returns.schemaMeta, "application/json",
             parseShExJ, mergeSchema, schemaOptions, allSchemas)

    const allGraphs = new ResourceLoadControler(turtle.concat(jsonld));
    loadList(turtle, returns.dataMeta, "text/turtle",
             parseTurtle, mergeGraph, dataOptions, allGraphs)
    loadList(jsonld, returns.dataMeta, "application/ld+json",
             parseJSONLD, mergeGraph, dataOptions, allGraphs)


    const [schemaSrcs, dataSrcs] = await Promise.all([allSchemas.allLoaded(),
                                                      allGraphs.allLoaded()])
    schemaSrcs.forEach(sSrc => {
      ShExUtil.merge(returns.schema, sSrc.schema, schemaOptions.collisionPolicy, true)
      delete sSrc.schema;
    })
    dataSrcs.forEach(dSrc => {
      returns.data.addQuads(dSrc.graph)
      delete dSrc.graph;
    })
    if (returns.schemaMeta.length > 0)
      ShExUtil.isWellDefined(returns.schema)
    return returns
  }

  function parseShExC (text, mediaType, url, meta, schemaOptions, resourceLoadControler) {
    const parser = schemaOptions && "parser" in schemaOptions ?
        schemaOptions.parser :
        ShExParser.construct(url, {}, schemaOptions)
    try {
      const s = parser.parse(text, url/*, opts, filename*/)
      // !! horrible hack until I set a variable to know if there's a BASE.
      if (s.base === url) delete s.base
      meta.prefixes = s._prefixes || {}
      meta.base = s._base || meta.base
      loadSchemaImports(s, resourceLoadControler, schemaOptions)
      return Promise.resolve({mediaType, url, schema: s})
    } catch (e) {
      e.message = "error parsing ShEx " + url + ": " + e.message
      return Promise.reject(e)
    }
  }

  function parseShExJ (text, mediaType, url, meta, schemaOptions, resourceLoadControler) {
    try {
      const s = ShExUtil.ShExJtoAS(JSON.parse(text))
      meta.prefixes = {}
      meta.base = null
      loadSchemaImports(s, resourceLoadControler)
      return Promise.resolve({mediaType, url, schema: s})
    } catch (e) {
      const e2 = Error("error parsing JSON " + url + ": " + e)
      // e2.stack = e.stack
      return Promise.reject(e2)
    }
  }

  function parseTurtle (text, mediaType, url, meta, dataOptions) {
    return new Promise(function (resolve, reject) {
      const graph = []
      new config.rdfjs.Parser({baseIRI: url, blankNodePrefix: "", format: "text/turtle"}).
        parse(text,
              function (error, quad, prefixes) {
                if (prefixes) {
                  meta.prefixes = prefixes
                  // data.addPrefixes(prefixes)
                }
                if (error) {
                  reject("error parsing " + url + ": " + error)
                } else if (quad) {
                  graph.push(quad)
                } else {
                  meta.base = this._base
                  resolve({mediaType, url, graph})
                }
              })
    })
  }

  async function parseJSONLD (text, mediaType, url, data, meta, dataOptions) {
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
      return parseTurtle(nquads, mediaType, url, data, meta)
    } catch (lderr) {
      let e = lderr
      if ("details" in e) e = e.details
      if ("cause" in e) e = e.cause
      throw Error("error parsing JSON-ld " + url + ": " + e)
    }
  }

  function LoadNoExtensions (globs) { return []; }
}

if (typeof require !== "undefined" && typeof exports !== "undefined")
  module.exports = ShExLoaderCjsModule
