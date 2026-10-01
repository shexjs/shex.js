/**
 * @shexjs/manifest -- read a shex.js examples manifest into the entries that
 * `validate`, the web app and tools/manifest-runner.js consume, whether the
 * manifest was written as YAML, as JSON, or as an RDF graph.
 *
 * The format (doc/tests-manifest-ld.yaml in the shex.js repository explains
 * it at length): a YAML or JSON document is a list of entries, or a mapping
 * `{"@context": ..., entries: [...]}` -- YAML-LD, a YAML text whose parse is
 * JSON-LD.  An entry's core attributes are bare (schema[URL], data[URL],
 * queryMap[URL], node, shape, status, schemaLabel, dataLabel, comment,
 * neighborhood, dataBase, slurp, overlay[URL], pluginURL), and a
 * neighborhood's or extension's own attributes are LEXICALLY SCOPED under
 * one `<prefix>:parms` mapping, bare inside it, with `pluginURL` naming the
 * module that implements that vocabulary.  The prefix is the manifest's own,
 * declared in its @context beside the term's binding --
 *
 *   - map: http://shex.io/extensions/Map/#
 *     map:parms: {"@context": https://shexspec.github.io/extensions/Map/manifest-context.jsonld}
 *
 * -- or the key is the vocabulary's full IRI, `http://shex.io/extensions/Map/#parms`.
 *
 * What comes back is the CLASSIC entry shape every consumer already reads:
 * the scoped attributes flattened beside the core ones and every pluginURL
 * collected into `plugins`, so an old manifest and a new one come out the
 * same -- plus `parms`, the scopes as written, keyed by namespace, for a
 * consumer that wants to know whose an attribute is.
 *
 * The same entries come out of an RDF rendering of the manifest (the graph
 * tools/yamlld-to-nested-turtle.js writes from the YAML-LD): entriesFromGraph
 * reads a store back by predicate IRI through the core @context.  A
 * vocabulary's parms arc is its namespace IRI + "parms".  How the
 * attributes inside are spelled is that vocabulary's context's to say --
 * outputSchemaURL for an IRI object under a @type: @id term, bare endpoint
 * for an IRI that is a value rather than a reference -- and a JSON-LD
 * context is not part of a graph, so the rendering names each vocabulary's
 * context (<namespace> shexjs:manifestContext <url>) and the reader looks
 * it up: in `scopes`, then in the KNOWN CONTEXTS, then through the
 * caller's loadContext.  Failing all three, an IRI object spells
 * `<local>URL` and a literal `<local>`, which is right for a document
 * reference and wrong for an endpoint.
 *
 * KnownContexts is a static roll-up of every context a manifest is known
 * to stack -- the core, the neighborhoods', the extensions' published
 * beside their specs -- keyed by the URL a manifest names it by, so no
 * reader needs the network for a known vocabulary.  It is
 * known-contexts.json, written by tools/rollup-manifest-contexts.js in the
 * shex.js repository (rerun it after editing a context or adding one); a
 * JSON-LD processor is given it as documentLoader().
 *
 * x / xURL: an attribute `x` holds a document's text and `xURL` says where to
 * fetch it.  Older manifests wrote a URL under `x`.  Given a `probe`, the
 * reader resolves such a value against the manifest's base and, when that
 * names a resource (not a 404), renames the attribute to xURL; otherwise the
 * value is the text.  Without a probe, a schema or data value with
 * whitespace or an angle bracket is text and anything else a reference --
 * the heuristic validate used -- and queryMap is left alone, since
 * `:x@:S` has neither.
 */
"use strict";

export type Entry = {[key: string]: any};

export interface ReadOptions {
  /** the manifest's own URL: what an `x` value is resolved against when probing */
  base?: string;
  /** does this URL name a resource?  Given one, an `x` whose value resolves
   * to a resource is renamed `xURL` (see the file comment) */
  probe?: (url: string) => Promise<boolean>;
  /** the core vocabulary: a JSON-LD context document or its @context.
   * entriesFromGraph maps predicate IRIs back to attribute names through it.
   * Default: the copy of doc/webapp-manifest-context.jsonld this package ships */
  context?: any;
}

export interface GraphOptions extends ReadOptions {
  /** a vocabulary's scope context by namespace, consulted first */
  scopes?: {[namespace: string]: any};
  /** fetch a context document by URL -- the one the graph names for a
   * vocabulary -- when the known roll-up lacks it.  Absent, or failing, the
   * spelling falls back to the heuristic */
  loadContext?: (url: string) => Promise<any>;
}

export type Format = "yaml" | "json" | "turtle";

export interface TextOptions extends ReadOptions, GraphOptions {
  /** sniffed from the text and the base URL's extension when absent */
  format?: Format;
  /** how to parse Turtle, for a caller that has an RDF parser (N3's, say):
   * text and base in, a store out -- anything with getQuads(s, p, o).  This
   * package parses YAML and JSON itself but carries no RDF parser */
  parseTurtle?: (text: string, base?: string) => any;
}

/** every context a manifest is known to stack, by URL (see the file comment) */
export const KnownContexts: {[url: string]: any} = require("../known-contexts.json");

/** where the core vocabulary is published */
export const CoreContextURL = "https://shex.js.org/doc/webapp-manifest-context.jsonld";

/** the core vocabulary, as shipped */
export const CoreContext: any = KnownContexts[CoreContextURL];

/** what jsonld.js calls a RemoteDocument */
export interface RemoteDocument { contextUrl: null; documentUrl: string; document: any; }

/** a JSON-LD documentLoader that answers the known contexts from the
 * roll-up and hands anything else to `fallback` (jsonld.js's own loader,
 * a fetch), or refuses it when there is none */
export function documentLoader (fallback?: (url: string) => Promise<RemoteDocument>): (url: string) => Promise<RemoteDocument> {
  return async (url: string): Promise<RemoteDocument> => {
    if (url in KnownContexts)
      return {contextUrl: null, documentUrl: url, document: KnownContexts[url]};
    if (fallback)
      return fallback(url);
    throw new Error(`context not in the known roll-up, and no loader to fetch it: ${url}`);
  };
}

/** a context document by URL: from the roll-up, else fetched by `fetchText` */
export async function loadContext (url: string, fetchText?: (url: string) => Promise<string>): Promise<any> {
  if (url in KnownContexts)
    return KnownContexts[url];
  if (fetchText)
    return JSON.parse(await fetchText(url));
  throw new Error(`context not in the known roll-up, and no fetch to load it: ${url}`);
}

/** the attributes that come as text (`x`) or by reference (`xURL`) */
export const DOCUMENTS = ["schema", "data", "queryMap", "overlay"];

const ABSOLUTE = /^(?:[a-z][a-z0-9+.-]*:\/\/|urn:)/i;
const GEN_DELIM = /[\/#:?\[\]@]$/;
const isAbsolute = (s: string): boolean => ABSOLUTE.test(s);

/** which of the three the text is.  The base URL's extension says it when
 * it has one; otherwise the first thing past any leading comment lines (all
 * three allow `#` comments) does: `[` or `{` is JSON, a Turtle directive or
 * a term is Turtle, anything else is YAML */
export function detectFormat (text: string, url?: string): Format {
  const ext = url && /\.([a-z]+)(?:[?#].*)?$/i.exec(url);
  if (ext) {
    const e = ext[1].toLowerCase();
    if (["ttl", "trig", "nt", "nq"].includes(e)) return "turtle";
    if (["json", "jsonld"].includes(e)) return "json";
    if (["yaml", "yml"].includes(e)) return "yaml";
  }
  const lead = text.replace(/^\s*(?:#[^\n]*\n\s*)*/, "");
  if (/^[\[{]/.test(lead)) return "json";
  if (/^(?:@prefix|@base|PREFIX|BASE|<[^>]*>\s|_:)/i.test(lead)) return "turtle";
  return "yaml";
}

/** a manifest's text as its entries */
export async function readManifest (text: string, options: TextOptions = {}): Promise<Entry[]> {
  const format = options.format || detectFormat(text, options.base);
  if (format === "turtle") {
    if (!options.parseTurtle)
      throw new Error("readManifest: a Turtle manifest needs options.parseTurtle (this package carries no RDF parser); or parse it and call entriesFromGraph");
    return await entriesFromGraph(options.parseTurtle(text, options.base), options);
  }
  let doc: any;
  if (format === "json") {
    try {
      doc = JSON.parse(text);
    } catch (eJson) {
      doc = require("js-yaml").load(text); // JSON is YAML; YAML's error is the better one only for YAML
    }
  } else {
    doc = require("js-yaml").load(text);
  }
  return entriesFromJson(doc, options);
}

/** the prefixes a manifest's @context declares inline: as JSON-LD 1.1 has
 * it, a term whose IRI ends in a gen-delim (`/ # : ? [ ] @`), or an
 * expanded definition marked @prefix -- so `map: http://shex.io/extensions/Map/#`
 * is one and a scope file's `outputShapeMap: http://.../#outputShapeMap` is
 * not.  A remote context in the list is not fetched: the bindings a
 * manifest relies on are its own */
export function prefixesOf (context: any): {[prefix: string]: string} {
  const prefixes: {[prefix: string]: string} = {};
  const walk = (ctx: any): void => {
    if (Array.isArray(ctx)) {
      ctx.forEach(walk);
    } else if (ctx && typeof ctx === "object") {
      if ("@context" in ctx) {
        walk(ctx["@context"]);
        return;
      }
      for (const [term, def] of Object.entries(ctx)) {
        if (term.startsWith("@"))
          continue;
        if (typeof def === "string") {
          if (isAbsolute(def) && GEN_DELIM.test(def))
            prefixes[term] = def;
        } else if (def && typeof def === "object") {
          const d = def as any;
          if (typeof d["@id"] === "string" && isAbsolute(d["@id"])
              && (d["@prefix"] === true || (d["@prefix"] !== false && GEN_DELIM.test(d["@id"]))))
            prefixes[term] = d["@id"];
        }
      }
    }
  };
  walk(context);
  return prefixes;
}

/** the namespace a `<prefix>:parms` or `<namespace>parms` key scopes, or
 * null for any other key.  A prefix the manifest never declared is an
 * error: the scope would otherwise pass silently as an unknown attribute,
 * its plugin never loaded */
export function parmsNamespace (key: string, prefixes: {[prefix: string]: string}): string | null {
  const m = /^([A-Za-z_][\w.-]*):parms$/.exec(key);
  if (m) {
    if (!(m[1] in prefixes))
      throw new Error(`manifest: "${key}" uses a prefix the manifest's @context does not declare; bind it there -- "${m[1]}: <namespace>" and "${key}: {\\"@context\\": <the vocabulary's manifest-context.jsonld>}"`);
    return prefixes[m[1]];
  }
  if (isAbsolute(key) && key.endsWith("parms"))
    return key.slice(0, -"parms".length);
  return null;
}

const asArray = (v: any): any[] => Array.isArray(v) ? v : [v];

/** a scope's attributes beside the entry's own: the classic flat shape.
 * pluginURL goes to `plugins`.  A name written twice is an error rather
 * than a silent override: the manifest can still be read apart through
 * `parms`, but no consumer of the flat shape could tell the two apart */
function flatten (out: Entry, scope: {[name: string]: any}, plugins: string[], from: string): void {
  for (const [name, value] of Object.entries(scope)) {
    if (name === "pluginURL") {
      plugins.push(...asArray(value));
    } else if (name in out) {
      throw new Error(`manifest: "${name}" is written twice in one entry (in ${from} and before); read the scopes apart through entry.parms`);
    } else {
      out[name] = value;
    }
  }
}

/** the parsed YAML or JSON as entries: a list, `{"@context", entries}`, or
 * one entry; scopes flattened, plugins collected, references settled */
export async function entriesFromJson (doc: any, options: ReadOptions = {}): Promise<Entry[]> {
  let entries: any[];
  let context: any = undefined;
  if (Array.isArray(doc)) {
    entries = doc;
  } else if (doc && typeof doc === "object") {
    if ("@graph" in doc)
      throw new Error("manifest: a JSON-LD @graph document is a test-suite manifest, not an examples manifest");
    if ("entries" in doc) {
      if (!Array.isArray(doc.entries))
        throw new Error("manifest: `entries` must be a list");
      entries = doc.entries;
      context = doc["@context"];
    } else {
      entries = [doc];
    }
  } else {
    throw new Error("manifest: expected a list of entries or a mapping with `entries`");
  }
  const prefixes = prefixesOf(context);
  const out: Entry[] = [];
  for (const entry of entries) {
    if (!entry || typeof entry !== "object")
      throw new Error("manifest: an entry must be a mapping, not " + JSON.stringify(entry));
    const flat: Entry = {};
    const parms: {[namespace: string]: any} = {};
    const plugins: string[] = [];
    for (const [key, value] of Object.entries(entry)) {
      const ns = parmsNamespace(key, prefixes);
      if (ns !== null) {
        if (!value || typeof value !== "object" || Array.isArray(value))
          throw new Error(`manifest: "${key}" must be a mapping of that vocabulary's attributes`);
        parms[ns] = value;
        flatten(flat, value as Entry, plugins, key);
      } else if (key === "plugins") {
        plugins.push(...asArray(value));
      } else if (key === "pluginURL") {
        plugins.push(...asArray(value));
      } else if (key in flat) {
        throw new Error(`manifest: "${key}" is written twice in one entry`);
      } else {
        flat[key] = value;
      }
    }
    if (plugins.length)
      flat.plugins = plugins;
    if (Object.keys(parms).length)
      flat.parms = parms;
    await settleReferences(flat, options);
    out.push(flat);
  }
  return out;
}

const resolve = (ref: string, base?: string): string | null => {
  try {
    return base ? new URL(ref, base).href : new URL(ref).href;
  } catch (e) {
    return null;
  }
};

/** x -> xURL (see the file comment).  With a probe every document
 * attribute whose value could be a reference is asked; without one, the
 * heuristic, and only for schema and data */
async function settleReferences (entry: Entry, options: ReadOptions): Promise<void> {
  const candidates = options.probe ? DOCUMENTS : ["schema", "data"];
  for (const x of candidates) {
    if (!(x in entry) || (x + "URL") in entry)
      continue;
    const values = asArray(entry[x]);
    if (!values.every(v => typeof v === "string" && v.length > 0 && !/[\s<>]/.test(v)))
      continue;
    let isReference = true;
    if (options.probe) {
      const answers = await Promise.all(values.map(v => {
        const abs = resolve(v, options.base);
        return abs === null ? Promise.resolve(false) : options.probe!(abs);
      }));
      isReference = answers.every(a => a);
    }
    if (isReference) {
      entry[x + "URL"] = entry[x];
      delete entry[x];
    }
  }
}

// --- the graph side ---------------------------------------------------------

interface VocabTerm {
  text?: string;      // the attribute a literal object is written as
  url?: string;       // ...and an IRI object (@type: @id)
  container?: string;
}

/** predicate IRI -> attribute name(s), from a JSON-LD context: a term's @id
 * (compact IRIs expanded through the context's own prefixes), @type: @id
 * marking the ...URL spelling, @container kept for lists and sets */
export function vocabularyOf (context: any): Map<string, VocabTerm> {
  const ctx = context && typeof context === "object" && "@context" in context ? context["@context"] : context;
  const defs: {[term: string]: any} = Array.isArray(ctx)
        ? Object.assign({}, ...ctx.filter((c: any) => c && typeof c === "object"))
        : (ctx || {});
  const prefixes = prefixesOf(defs);
  const expand = (v: string): string => {
    const i = v.indexOf(":");
    if (i > 0 && !v.slice(i + 1).startsWith("//")) {
      const p = v.slice(0, i);
      if (p in prefixes)
        return prefixes[p] + v.slice(i + 1);
    }
    return v;
  };
  const vocab = new Map<string, VocabTerm>();
  for (const [term, def] of Object.entries(defs)) {
    if (term.startsWith("@"))
      continue;
    let iri: string, isId = false, container: string | undefined;
    if (typeof def === "string") {
      iri = expand(def);
    } else if (def && typeof def === "object") {
      iri = expand(typeof def["@id"] === "string" ? def["@id"] : term);
      isId = def["@type"] === "@id";
      container = def["@container"];
    } else {
      continue;
    }
    if (!isAbsolute(iri) || prefixes[term] === iri) // a prefix declaration names no attribute
      continue;
    const t = vocab.get(iri) || {};
    if (isId) t.url = term; else t.text = term;
    if (container) t.container = container;
    vocab.set(iri, t);
  }
  return vocab;
}

const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const XSD = "http://www.w3.org/2001/XMLSchema#";

function literalValue (term: any): any {
  const dt = term.datatype && term.datatype.value;
  if (dt === XSD + "boolean")
    return term.value === "true";
  if ([XSD + "integer", XSD + "decimal", XSD + "double", XSD + "float", XSD + "int", XSD + "long"].includes(dt))
    return Number(term.value);
  return term.value;
}

/** a key's value, one or several */
function put (obj: Entry, key: string, value: any): void {
  if (!(key in obj))
    obj[key] = value;
  else if (Array.isArray(obj[key]))
    obj[key].push(value);
  else
    obj[key] = [obj[key], value];
}

/** the entries an RDF graph of the manifest holds: the members of its
 * entries list (or, failing a list, every node with a schema), each read
 * back by predicate through the core vocabulary and the parms convention */
export async function entriesFromGraph (store: any, options: GraphOptions = {}): Promise<Entry[]> {
  const vocab = vocabularyOf(options.context || CoreContext);
  const iriOf = (key: string): string | undefined => {
    for (const [iri, t] of vocab)
      if (t.text === key || t.url === key)
        return iri;
    return undefined;
  };
  const entriesIRI = iriOf("entries");
  const pluginIRI = iriOf("pluginURL");
  const manifestContextIRI = iriOf("manifestContext");

  /** the vocabulary of a scope, for spelling its attributes: from `scopes`,
   * else fetched from where the graph says, else nothing (the heuristic) */
  const scopeVocabs = new Map<string, Map<string, VocabTerm> | null>();
  const scopeVocab = async (ns: string): Promise<Map<string, VocabTerm> | null> => {
    if (scopeVocabs.has(ns))
      return scopeVocabs.get(ns)!;
    let ctx: any = options.scopes && ns in options.scopes ? options.scopes[ns] : undefined;
    if (ctx === undefined && manifestContextIRI) {
      const named = store.getQuads(null, manifestContextIRI, null)
            .filter((q: any) => q.subject.termType === "NamedNode" && q.subject.value === ns);
      if (named.length) {
        const url = named[0].object.value;
        if (url in KnownContexts)
          ctx = KnownContexts[url];
        else if (options.loadContext)
          try {
            ctx = await options.loadContext(url);
          } catch (e) {
            ctx = undefined;
          }
      }
    }
    const v = ctx === undefined || ctx === null ? null : vocabularyOf(ctx);
    scopeVocabs.set(ns, v);
    return v;
  };

  const quads = (s: any, p: any, o: any): any[] => store.getQuads(s, p, o);
  const listOf = (head: any): any[] => {
    const items: any[] = [];
    let node = head;
    while (node && !(node.termType === "NamedNode" && node.value === RDF + "nil")) {
      const first = quads(node, RDF + "first", null);
      if (!first.length)
        break;
      items.push(first[0].object);
      const rest = quads(node, RDF + "rest", null);
      node = rest.length ? rest[0].object : null;
    }
    return items;
  };

  /** a literal as itself, an IRI as its string, a blank node as the mapping
   * of its predicates (staticVars' variables, say) */
  const valueOf = (term: any): any => {
    if (term.termType === "Literal")
      return literalValue(term);
    if (term.termType === "BlankNode") {
      const o: Entry = {};
      for (const q of quads(term, null, null))
        put(o, q.predicate.value, valueOf(q.object));
      return o;
    }
    return term.value;
  };

  let nodes: any[] = [];
  if (entriesIRI)
    for (const q of quads(null, entriesIRI, null))
      nodes.push(...listOf(q.object));
  if (!nodes.length) {
    const seen = new Set<string>();
    for (const iri of [iriOf("schema"), iriOf("schemaURL")])
      if (iri)
        for (const q of quads(null, iri, null)) {
          const k = q.subject.termType + " " + q.subject.value;
          if (!seen.has(k)) {
            seen.add(k);
            nodes.push(q.subject);
          }
        }
  }

  const entries: Entry[] = [];
  for (const node of nodes) {
    const flat: Entry = {};
    const parms: {[namespace: string]: any} = {};
    const plugins: string[] = [];
    if (node.termType === "NamedNode")
      flat["@id"] = node.value;
    for (const q of quads(node, null, null)) {
      const p = q.predicate.value;
      const t = vocab.get(p);
      if (t) {
        const isIri = q.object.termType === "NamedNode";
        const key = isIri ? (t.url || t.text!) : (t.text || t.url!);
        if (t.container === "@list") {
          const items = listOf(q.object).map(valueOf);
          if (key === "pluginURL") plugins.push(...items); else flat[key] = items;
        } else if (key === "pluginURL") {
          plugins.push(q.object.value);
        } else {
          put(flat, key, valueOf(q.object));
        }
      } else if (p.endsWith("parms") && q.object.termType === "BlankNode") {
        const ns = p.slice(0, -"parms".length);
        const spelling = await scopeVocab(ns);
        const scope: Entry = {};
        for (const q2 of quads(q.object, null, null)) {
          const isIri = q2.object.termType === "NamedNode";
          if (q2.predicate.value === pluginIRI) {
            put(scope, "pluginURL", q2.object.value); // flatten() collects it
          } else {
            const known = spelling && spelling.get(q2.predicate.value);
            const local = q2.predicate.value.startsWith(ns) ? q2.predicate.value.slice(ns.length) : q2.predicate.value;
            const name = known
                  ? (isIri ? (known.url || known.text!) : (known.text || known.url!))
                  : (isIri ? local + "URL" : local);
            put(scope, name, valueOf(q2.object));
          }
        }
        parms[ns] = scope;
        flatten(flat, scope, plugins, "<" + p + ">");
      } else {
        put(flat, p, valueOf(q.object));
      }
    }
    if (plugins.length)
      flat.plugins = plugins;
    if (Object.keys(parms).length)
      flat.parms = parms;
    entries.push(flat);
  }
  return entries;
}
