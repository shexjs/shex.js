/**
 * @shexjs/manifest -- read a shex.js examples manifest into the entries that
 * `validate`, the web app and tools/manifest-runner.js consume, whether the
 * manifest was written as YAML, as JSON, or as an RDF graph.
 *
 * THE FORMAT (doc/tests-manifest-ld.yaml in the shex.js repository explains
 * it at length) is YAML-LD: a YAML text whose parse is JSON-LD,
 *
 *   "@context":
 *     - https://www.w3.org/ns/shex-manifest.jsonld
 *     - https://shex.js.org/doc/manifest-context.jsonld
 *     - map: http://shex.io/extensions/Map/#
 *       map:parms: {"@context": https://shexspec.github.io/extensions/Map/manifest-context.jsonld}
 *   entries:
 *   - schemaLabel: BP
 *     schemaURL: BPfhir-schema.shex
 *     map:parms:
 *       pluginURL: ShExMapPlugin.js
 *       outputSchemaURL: BPdam-schema.shex
 *
 * THE CONTEXTS are stacked.  The first is the ShEx manifest vocabulary's
 * (http://www.w3.org/ns/shex-manifest#): what manifests of ShEx validations
 * have in common, whoever writes them -- entries, name, an entry's schema,
 * data and queryMap with their ...URL and ...Label spellings, comment, and
 * node, shape and status from the ShEx vocabulary.  On it each author stacks
 * its own terms: shex.js's (doc/manifest-context.jsonld: pluginURL,
 * neighborhood, dataBase, ...) for its examples; the ShEx test vocabulary's
 * (https://www.w3.org/ns/shex-test#: trait, approval, resultURL, ...) for
 * the conformance suite's tests.  The shared vocabulary and shex.js's terms
 * are the CORE: what a manifest with no @context is read with and a
 * generated one stacks.  The suite's manifests are this same format, so the
 * same reader reads them.
 *
 * An entry's attributes from those contexts are bare, and a neighborhood's
 * or extension's own attributes are LEXICALLY SCOPED under one
 * `<prefix>:parms` mapping, bare inside it, with `pluginURL` naming the
 * module that implements that vocabulary.  The prefix is the manifest's
 * own, bound in its @context beside the term whose scoped context is the
 * vocabulary's file.
 *
 * WHAT COMES BACK is the classic entry shape every consumer already reads:
 * the scoped attributes flattened beside the core ones and every pluginURL
 * collected into `plugins` -- plus `parms`, the scopes as written, keyed by
 * namespace, for a consumer that wants to know whose an attribute is.
 *
 * THE STEPS, for a YAML or JSON text (readManifest / readJson):
 *
 * 1. the JSON step, `upgrade`: whatever was deployed becomes the canonical
 *    form.  A bare list (or one entry) is wrapped in `entries`, which the
 *    shared vocabulary makes an ordered list; a missing @context defaults to
 *    the core; a manifest with no @context also has its flat scoped attributes
 *    (ShExMap's outputSchemaURL, a neighborhood's endpoint) moved into
 *    their vocabulary's `<prefix>:parms`, the binding added to the
 *    @context, and each of its `plugins` moved into the scope it
 *    implements; a test manifest's `shex` becomes `schema`; and x/xURL is
 *    settled (below).
 * 2. `frameCheck`: is the canonical document one whose plain reading is
 *    guaranteed to be its JSON-LD reading?  It is when its @context holds
 *    only known top-level contexts and bindings of known scopes, and its
 *    entries use no JSON-LD keyword but a string @id, no IRI-shaped key but
 *    a bound `<prefix>:parms`, and no value object.  The check also lists
 *    the keys no stacked context defines: JSON-LD would drop those, the
 *    plain reading keeps them.
 * 3. the plain reading (`entriesFromJson`) when the check passes; otherwise
 *    the JSON-LD reading (`entriesViaJsonLd`): a JSON-LD processor the
 *    caller hands in expands the document to RDF, and `entriesFromGraph`
 *    reads the entries back.  The package's tests run both readings over
 *    every manifest in the repository and demand the same entries.
 *
 * An RDF rendering of a manifest (Turtle, say) goes straight to
 * `entriesFromGraph`, which reads a store back by predicate IRI through the
 * known top-level contexts.  A vocabulary's parms arc is its namespace IRI +
 * "parms".
 * How the attributes inside are spelled is that vocabulary's context's to
 * say -- outputSchemaURL for an IRI object under a @type: @id term, bare
 * endpoint for an IRI that is a value -- so the reader looks the context
 * up: in `scopes`, by the graph's own <namespace> shexjs:manifestContext
 * <url> triple, or by namespace among the known vocabularies.  Failing all
 * three, an IRI object spells `<local>URL` and a literal `<local>`.
 *
 * THE ROLL-UP (known-contexts.json, written by
 * tools/rollup-manifest-contexts.js) holds every context a manifest is
 * known to stack and what the reader needs to know about each vocabulary,
 * so nothing here needs the network for a known vocabulary.
 *
 * x / xURL: an attribute `x` holds a document's text and `xURL` says where
 * to fetch it.  Older manifests wrote a URL under `x`.  Given a `probe`, a
 * value that resolves against the manifest's base to a resource (not a
 * 404) is renamed xURL; otherwise it is the text.  A schema named without
 * an extension is asked for in each of its representations
 * (`representations`: as written, then .shex, .json, .ttl).  That goes for an
 * entry's schema, data and queryMap, and for each pair a known scope's
 * context defines (ShExReduce's overlay, ShExMap's outputSchema) inside
 * that scope.  Without a probe, a schema or data value with whitespace or
 * an angle bracket is text and anything else a reference -- the heuristic
 * validate used -- and the rest are left alone, since `:x@:S` has neither.
 */
"use strict";

export type Entry = {[key: string]: any};

export interface ReadOptions {
  /** the manifest's own URL: what references resolve against */
  base?: string;
  /** does this URL name a resource?  Given one, an `x` whose value resolves
   * to a resource is renamed `xURL` (see the file comment) */
  probe?: (url: string) => Promise<boolean>;
  /** the vocabulary a graph is read back through: a JSON-LD context
   * document or its @context.  Default: every known top-level context,
   * stacked */
  context?: any;
}

export interface GraphOptions extends ReadOptions {
  /** a vocabulary's scope context by namespace, consulted first */
  scopes?: {[namespace: string]: any};
  /** fetch a context document by URL when the roll-up lacks it */
  loadContext?: (url: string) => Promise<any>;
}

export interface JsonOptions extends GraphOptions {
  /** a JSON-LD processor (jsonld.js), or a function promising one -- only
   * called when a document has to be read as JSON-LD, so a browser can load
   * the library on demand */
  jsonld?: any;
  /** told what the frame check found: why the JSON-LD reading was needed,
   * and which keys no context defines */
  onCheck?: (check: FrameCheck) => void;
}

export type Format = "yaml" | "json" | "turtle";

export interface TextOptions extends JsonOptions {
  /** sniffed from the text and the base URL's extension when absent */
  format?: Format;
  /** how to parse Turtle, for a caller that has an RDF parser (N3's, say):
   * text and base in, a store out -- anything with getQuads(s, p, o).  This
   * package parses YAML and JSON itself but carries no RDF parser */
  parseTurtle?: (text: string, base?: string) => any;
}

// --- the roll-up -------------------------------------------------------------

/** one scope: the conventional prefix, the namespace its parms arc and
 * attributes live under, its scope context's URL, and the file name of the
 * web-app plugin that implements it */
export interface Vocabulary { prefix: string; namespace: string; context: string; plugin?: string; }

const Rollup: {
  core: string[];
  tops: string[];
  contexts: {[url: string]: any};
  paths: {[pathSuffix: string]: string};
  vocabularies: Vocabulary[];
} = require("../known-contexts.json");

/** every context a manifest is known to stack, by URL */
export const KnownContexts: {[url: string]: any} = Rollup.contexts;

/** the known scopes */
export const KnownVocabularies: Vocabulary[] = Rollup.vocabularies;

/** the core: the contexts a manifest with no @context is read with, and a
 * generated one stacks -- the ShEx manifest vocabulary's, then shex.js's
 * own terms -- by where each is published */
export const CoreContextURLs: string[] = Rollup.core;

/** every context known to be stacked at a manifest's top level: the core,
 * and the ShEx test vocabulary, which the conformance suite stacks on the
 * shared one */
export const TopContextURLs: string[] = Rollup.tops;

/** what stacking known contexts defines, as one context document: a later
 * definition of a term replaces an earlier one, as JSON-LD has it (the
 * roll-up tool refuses top-level contexts that disagree, so none does) */
export function stackedContext (urls: string[]): any {
  return {"@context": Object.assign({}, ...urls.map(url => KnownContexts[url]["@context"]))};
}

/** the core vocabulary: the core contexts, stacked */
export const CoreContext: any = stackedContext(CoreContextURLs);

/** every known top-level context, stacked: what a graph is read back through */
export const TopContext: any = stackedContext(TopContextURLs);

const ABSOLUTE = /^(?:[a-z][a-z0-9+.-]*:\/\/|urn:)/i;
const GEN_DELIM = /[\/#:?\[\]@]$/;
const isAbsolute = (s: string): boolean => ABSOLUTE.test(s);
const asArray = (v: any): any[] => Array.isArray(v) ? v : [v];
const isMapping = (v: any): boolean => v !== null && typeof v === "object" && !Array.isArray(v);

const resolve = (ref: string, base?: string): string | null => {
  try {
    return base ? new URL(ref, base).href : new URL(ref).href;
  } catch (e) {
    return null;
  }
};

/** the published URL of a known context, however it was referenced: by
 * that URL; or, for a file of the shex.js repository or of the conformance
 * suite, by any URL ending in the path the roll-up lists for it -- a
 * checkout, a mirror of the site, the suite as an installed dependency, a
 * relative reference from a manifest beside it.  null for anything else */
export function knownContextURL (ref: string, base?: string): string | null {
  const abs = isAbsolute(ref) ? ref : (resolve(ref, base) || ref);
  if (abs in KnownContexts)
    return abs;
  const clean = abs.replace(/[?#].*$/, "");
  if (isAbsolute(clean)) {
    for (const [path, url] of Object.entries(Rollup.paths))
      if (clean.endsWith("/" + path))
        return url;
    return null;
  }
  // a relative reference with nothing to resolve it against: by its tail,
  // when exactly one known file ends that way
  const tail = clean.replace(/^(?:\.\.?\/)+/, "");
  const hits = Object.entries(Rollup.paths).filter(([path]) => path === tail || path.endsWith("/" + tail));
  return hits.length === 1 ? hits[0][1] : null;
}

/** what jsonld.js calls a RemoteDocument */
export interface RemoteDocument { contextUrl: null; documentUrl: string; document: any; }

/** a JSON-LD documentLoader that answers the known contexts from the
 * roll-up and hands anything else to `fallback` (jsonld.js's own loader,
 * a fetch), or refuses it when there is none */
export function documentLoader (fallback?: (url: string) => Promise<RemoteDocument>): (url: string) => Promise<RemoteDocument> {
  return async (url: string): Promise<RemoteDocument> => {
    const known = knownContextURL(url);
    if (known !== null)
      return {contextUrl: null, documentUrl: url, document: KnownContexts[known]};
    if (fallback)
      return fallback(url);
    throw new Error(`context not in the known roll-up, and no loader to fetch it: ${url}`);
  };
}

/** a context document by URL: from the roll-up, else fetched by `fetchText` */
export async function loadContext (url: string, fetchText?: (url: string) => Promise<string>): Promise<any> {
  const known = knownContextURL(url);
  if (known !== null)
    return KnownContexts[known];
  if (fetchText)
    return JSON.parse(await fetchText(url));
  throw new Error(`context not in the known roll-up, and no fetch to load it: ${url}`);
}

/** the terms a context document defines (its keywords aside) */
const termsOf = (context: any): {[term: string]: any} => {
  const ctx = context && typeof context === "object" && "@context" in context ? context["@context"] : context;
  const out: {[term: string]: any} = {};
  for (const [k, v] of Object.entries(ctx || {}))
    if (!k.startsWith("@"))
      out[k] = v;
  return out;
};

const CoreTerms = termsOf(CoreContext);

/** the known vocabulary whose scope defines `key` and no other does -- a
 * core term is nobody's.  How a writer of the canonical form knows which
 * `<prefix>:parms` an attribute belongs in */
export function vocabularyOfTerm (key: string): Vocabulary | null {
  if (key in CoreTerms)
    return null;
  const hits = KnownVocabularies.filter(v => key in termsOf(KnownContexts[v.context]));
  return hits.length === 1 ? hits[0] : null;
}

// --- sniffing and parsing ------------------------------------------------------

/** the attributes an entry has as text (`x`) or by reference (`xURL`); a
 * scope's are the pairs its context defines (`documentPairs`) */
export const DOCUMENTS = ["schema", "data", "queryMap"];

/** the representations a reference without an extension may be served
 * as, in the order a reader prefers them: the reference as written, for a
 * server that negotiates, then .shex, .json and .ttl.  The conformance
 * suite's validation tests name their schemas this way (`../schemas/1dot`),
 * so that a server can negotiate the representation and a reader can ask
 * for the one it wants.  A reference with an extension is just itself. */
export const REPRESENTATIONS = [".shex", ".json", ".ttl"];
export function representations (ref: string): string[] {
  const last = ref.replace(/^.*\//, "");
  return last === "" || /[.?#]/.test(last) ? [ref] : [ref].concat(REPRESENTATIONS.map(ext => ref + ext));
}

/** the first of `ref`'s representations (or of `candidates`) that `exists`
 * (a probe: does this URL name a resource?) finds -- absolute, when `base`
 * is given -- or null when none is there */
export async function resolveRepresentation (ref: string, exists: (url: string) => Promise<boolean>, base?: string,
                                             candidates: string[] = representations(ref)): Promise<string | null> {
  for (const candidate of candidates) {
    const abs = base === undefined ? candidate : resolve(candidate, base);
    if (abs !== null && await exists(abs))
      return abs;
  }
  return null;
}

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
  return readJson(doc, options);
}

/** the parsed YAML or JSON as its entries: upgraded to the canonical form,
 * checked, and read plainly or as JSON-LD (see the file comment) */
export async function readJson (doc: any, options: JsonOptions = {}): Promise<Entry[]> {
  const canonical = await upgrade(doc, options);
  const check = frameCheck(canonical, options);
  if (options.onCheck)
    options.onCheck(check);
  if (check.faithful)
    return entriesFromJson(canonical, options);
  if (!options.jsonld)
    throw new Error("manifest: this document has to be read as JSON-LD (" + check.reasons.join("; ") + "), which needs options.jsonld");
  return entriesViaJsonLd(canonical, options);
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

/** the namespace a `<prefix>:parms` key scopes, or null for any other key.
 * A prefix the manifest never declared is an error: the scope would
 * otherwise pass silently as an unknown attribute, its plugin never loaded */
export function parmsNamespace (key: string, prefixes: {[prefix: string]: string}): string | null {
  const m = /^([A-Za-z_][\w.-]*):parms$/.exec(key);
  if (m) {
    if (!(m[1] in prefixes))
      throw new Error(`manifest: "${key}" uses a prefix the manifest's @context does not declare; bind it there -- "${m[1]}: <namespace>" and "${key}: {\\"@context\\": <the vocabulary's manifest-context.jsonld>}"`);
    return prefixes[m[1]];
  }
  return null;
}

/** the scope contexts a manifest's @context binds inline: namespace -> the
 * context reference of its `<prefix>:parms` term */
function boundScopes (context: any): {[namespace: string]: {prefix: string, ref: any}} {
  const prefixes = prefixesOf(context);
  const bound: {[namespace: string]: {prefix: string, ref: any}} = {};
  for (const ctx of context === undefined ? [] : asArray(context))
    if (isMapping(ctx))
      for (const [term, def] of Object.entries(ctx)) {
        const m = /^([A-Za-z_][\w.-]*):parms$/.exec(term);
        if (m && m[1] in prefixes && isMapping(def))
          bound[prefixes[m[1]]] = {prefix: m[1], ref: (def as any)["@context"]};
      }
  return bound;
}

// --- the JSON step: whatever was deployed, as the canonical form ----------------

export interface Canonical { "@context": any; entries: Entry[]; [key: string]: any; }

const hasGraph = (doc: any): boolean => isMapping(doc) && "@graph" in doc;

/** a node written the way only JSON-LD writes one: no bare key, every key a
 * keyword or an IRI */
const isJsonLdNode = (node: any): boolean =>
      isMapping(node) && Object.keys(node).length > 0 && Object.keys(node).every(k => k.startsWith("@") || /[:\/]/.test(k));

/** JSON-LD that is not written as a manifest of entries: an @graph
 * document, expanded or flattened nodes, or a document with an @context
 * and no `entries` -- somebody else's names.  Not ours to rearrange: it
 * goes to a JSON-LD processor as it is */
const isForeignJsonLd = (doc: any): boolean =>
      hasGraph(doc)
      || (Array.isArray(doc) && doc.length > 0 && doc.every(isJsonLdNode))
      || (isMapping(doc) && !("entries" in doc) && ("@context" in doc || isJsonLdNode(doc)));

/** the canonical form of a manifest: `{"@context": ..., entries: [...]}`.
 *
 * A document with an @context is taken as it says: only wrapped, should it
 * be a bare entry.  One WITHOUT an @context is a deployed classic manifest,
 * and is brought up to date: the core contexts by default; each flat
 * attribute that a known vocabulary defines moved into that vocabulary's
 * `<prefix>:parms`, with the binding added to the @context; each of its
 * `plugins` moved, as pluginURL, into the scope of the vocabulary it
 * implements (by its file name), or left at the entry when it implements
 * none; a test manifest's `shex` renamed `schema`, and an entry's `title`
 * (what the web app used to label an entry with no schemaLabel or
 * dataLabel, and what ShapePath.js's and shex-form's manifests call an
 * entry) renamed `name`, the shared vocabulary's.  Synchronous and pure:
 * `upgrade` adds the x/xURL settlement, which may have to ask the network.
 *
 * JSON-LD written some other way -- an @graph document, expanded nodes, a
 * document whose @context names its entries differently -- is nobody's to
 * rearrange and comes back as is, for a JSON-LD processor to read. */
export function canonicalize (doc: any): Canonical {
  if (isForeignJsonLd(doc))
    return doc;
  let entries: any[];
  let rest: {[key: string]: any} = {};
  let context: any = undefined;
  if (Array.isArray(doc)) {
    entries = doc;
  } else if (isMapping(doc)) {
    if ("entries" in doc) {
      if (!Array.isArray(doc.entries))
        throw new Error("manifest: `entries` must be a list");
      ({"@context": context, entries, ...rest} = doc);
    } else {
      entries = [doc];
    }
  } else {
    throw new Error("manifest: expected a list of entries or a mapping with `entries`");
  }
  if (context !== undefined)
    return Object.assign({"@context": context}, rest, {entries});

  // a classic manifest: bring it up to date
  const contexts: any[] = CoreContextURLs.slice();
  const boundPrefix = new Map<string, string>();       // namespace -> the prefix it got
  const bind = (v: Vocabulary): string => {
    if (!boundPrefix.has(v.namespace)) {
      boundPrefix.set(v.namespace, v.prefix);
      contexts.push({[v.prefix]: v.namespace, [v.prefix + ":parms"]: {"@context": v.context}});
    }
    return boundPrefix.get(v.namespace)! + ":parms";
  };
  const upgraded = entries.map(entry => {
    if (!isMapping(entry))
      throw new Error("manifest: an entry must be a mapping, not " + JSON.stringify(entry));
    const out: Entry = {};
    const loose: string[] = [];                        // plugins that implement no known vocabulary
    const scopeOf = (v: Vocabulary): Entry => {
      const key = bind(v);
      if (!(key in out))
        out[key] = {};
      return out[key];
    };
    const plugins: string[] = [];
    for (const [key, value] of Object.entries(entry)) {
      if (key === "plugins") {
        plugins.push(...asArray(value));
        continue;
      }
      if (key === "shex" && !("schema" in entry)) {    // a test manifest's spelling
        out.schema = value;
        continue;
      }
      if (key === "title" && !("name" in entry)) {     // the shared vocabulary's name for it
        out.name = value;
        continue;
      }
      const v = vocabularyOfTerm(key);
      if (v)
        scopeOf(v)[key] = value;
      else
        out[key] = value;
    }
    for (const url of plugins) {
      const file = String(url).replace(/[?#].*$/, "").split("/").pop();
      const v = KnownVocabularies.find(v => v.plugin !== undefined && v.plugin === file);
      if (!v) {
        loose.push(url);
        continue;
      }
      const scope = scopeOf(v);
      // first in its scope, where a reader looks for who implements it
      const others = Object.assign({}, scope);
      for (const k of Object.keys(scope))
        delete scope[k];
      scope.pluginURL = "pluginURL" in others ? asArray(others.pluginURL).concat([url]) : url;
      delete others.pluginURL;
      Object.assign(scope, others);
    }
    if (loose.length)
      out.pluginURL = "pluginURL" in out ? asArray(out.pluginURL).concat(loose)
        : loose.length === 1 ? loose[0] : loose;
    return out;
  });
  return {"@context": contexts, entries: upgraded};
}

/** the JSON step: canonicalize, then settle x/xURL -- at each entry, and
 * in each scope whose context the roll-up knows */
export async function upgrade (doc: any, options: ReadOptions = {}): Promise<Canonical> {
  const canonical = canonicalize(doc);
  if (isForeignJsonLd(canonical))
    return canonical;
  const scoped = options.probe ? scopeDocuments(canonical["@context"], options.base) : {};
  for (const entry of canonical.entries)
    if (isMapping(entry)) {
      await settleReferences(entry, options.probe ? DOCUMENTS : ["schema", "data"], options);
      for (const [key, names] of Object.entries(scoped))
        if (isMapping(entry[key]))
          await settleReferences(entry[key], names, options);
    }
  return canonical;
}

/** the names a context defines as a document pair: `x` for the text and
 * `xURL`, typed @id, for the same IRI by reference */
export function documentPairs (context: any): string[] {
  return [...vocabularyOf(context).values()]
    .filter(t => t.text !== undefined && t.url === t.text + "URL")
    .map(t => t.text!);
}

/** `<prefix>:parms` -> the document pairs of the scope it binds, for each
 * binding to a context the roll-up knows */
function scopeDocuments (context: any, base?: string): {[key: string]: string[]} {
  const out: {[key: string]: string[]} = {};
  for (const {prefix, ref} of Object.values(boundScopes(context))) {
    const known = typeof ref === "string" ? knownContextURL(ref, base) : null;
    if (known !== null && !TopContextURLs.includes(known)) {
      const names = documentPairs(KnownContexts[known]);
      if (names.length)
        out[prefix + ":parms"] = names;
    }
  }
  return out;
}

/** x -> xURL (see the file comment) for the `candidates` of one mapping,
 * an entry or a scope: with a probe each value that could be a reference
 * is asked; without one, the heuristic */
async function settleReferences (entry: Entry, candidates: string[], options: ReadOptions): Promise<void> {
  for (const x of candidates) {
    if (!(x in entry) || (x + "URL") in entry)
      continue;
    const values = asArray(entry[x]);
    if (!values.every(v => typeof v === "string" && v.length > 0 && !/[\s<>]/.test(v)))
      continue;
    let isReference = true;
    if (options.probe) {
      // a schema without an extension is asked for in each of its representations
      const answers = await Promise.all(values.map(async v =>
        resolve(v, options.base) !== null
          && await resolveRepresentation(v, options.probe!, options.base, x === "schema" ? undefined : [v]) !== null));
      isReference = answers.every(a => a);
    }
    if (isReference) {
      // in place, so the attribute keeps its position in the entry
      const renamed: Entry = {};
      for (const [k, v] of Object.entries(entry))
        renamed[k === x ? x + "URL" : k] = v;
      for (const k of Object.keys(entry))
        delete entry[k];
      Object.assign(entry, renamed);
    }
  }
}

// --- the frame check: is the plain reading the JSON-LD reading? -----------------

export interface FrameCheck {
  /** true: the plain reading of this document is its JSON-LD reading */
  faithful: boolean;
  /** why not: each a feature only a JSON-LD processor interprets */
  reasons: string[];
  /** keys no stacked context defines (`a` at an entry, `p:parms/a` in a
   * scope, `/a` beside the entries).  JSON-LD drops them; the plain reading
   * keeps them.  Not a reason: no JSON-LD processor could make more of them */
  unknown: string[];
}

/** whether a canonical document can be read plainly.  The conditions, all
 * of them checked against the roll-up and none against the network:
 *
 * - the document is `{"@context", entries: [...]}`, with at most an @id, an
 *   @type and bare names beside them: no other keyword (@graph, @included,
 *   @reverse, @nest) and no IRI-shaped key, which could hold entries of its
 *   own;
 * - each member of @context is a known top-level context, by any of its
 *   URLs, or an inline mapping that holds only prefix bindings and
 *   `<prefix>:parms` terms whose scoped @context is a known scope (@version
 *   aside) -- so no term is redefined, and there is no @vocab, @base or
 *   @language to change what a bare name or a value means -- and the
 *   stacked contexts define `entries`;
 * - each entry is a mapping whose keys are bare names or bound
 *   `<prefix>:parms` scopes: no other key with a colon (an IRI or compact
 *   IRI, which JSON-LD expands and the plain reading does not), and no
 *   JSON-LD keyword but @id -- a string, not a blank node's label, and no
 *   other entry's: two entries with one @id are one node of the graph;
 * - a known term's value is a scalar, a list of scalars, or a mapping whose
 *   keys are known terms (a nested node: a member of the Test scope's
 *   prints that names the action which printed it) or absolute IRIs
 *   (ShExMap's staticVars), with such values: no value object, no node
 *   reference.  A term's @type does not change that: JSON-LD coerces only
 *   a string to an IRI, so under an @type: @id term (the shared
 *   vocabulary's entries is one) a mapping is the node it would be
 *   anywhere;
 * - under a term that is @type: @vocab, a string is a name in the
 *   vocabulary the term's own scoped context sets: not a term itself, and
 *   nothing with a colon.
 *
 * Under these conditions every known bare name means in JSON-LD what the
 * reader takes it to mean, and the two readings give the same entries; the
 * package's tests check that over every manifest in the repository, and
 * over the conformance suite's. */
export function frameCheck (doc: any, options: ReadOptions = {}): FrameCheck {
  const reasons: string[] = [];
  const unknown: string[] = [];
  const done = (): FrameCheck => ({faithful: reasons.length === 0, reasons, unknown});
  if (!isMapping(doc) || !Array.isArray(doc.entries)) {
    reasons.push(hasGraph(doc) ? "a JSON-LD @graph document"
                 : isForeignJsonLd(doc) ? "JSON-LD not written as a manifest of entries"
                 : "not a mapping with an `entries` list");
    return done();
  }

  // the contexts: first the ones stacked by reference, which say what the
  // bare names mean
  const contexts = doc["@context"] === undefined ? [] : asArray(doc["@context"]);
  const stacked: string[] = [];
  for (const ctx of contexts)
    if (typeof ctx === "string") {
      const known = knownContextURL(ctx, options.base);
      if (known !== null && TopContextURLs.includes(known))
        stacked.push(known);
      else if (known !== null)
        reasons.push(`a scope context stacked at the top level: ${ctx}`);
      else
        reasons.push(`a context the roll-up does not know: ${ctx}`);
    }
  const terms = termsOf(stackedContext(stacked));
  if (!("entries" in terms))
    reasons.push("no stacked context defines `entries` (" + CoreContextURLs[0] + " does)");

  // ...then the manifest's own bindings
  const scopes: {[namespace: string]: {prefix: string, terms: {[term: string]: any}}} = {};
  const prefixes = prefixesOf(doc["@context"]);
  for (const ctx of contexts) {
    if (typeof ctx === "string") {
      // done above
    } else if (isMapping(ctx)) {
      for (const [term, def] of Object.entries(ctx)) {
        if (term === "@version")
          continue;
        if (term.startsWith("@")) {
          reasons.push(`${term} in the @context`);
          continue;
        }
        const parms = /^([A-Za-z_][\w.-]*):parms$/.exec(term);
        if (parms && parms[1] in prefixes && isMapping(def)) {
          const d = def as any;
          const extra = Object.keys(d).filter(k => k !== "@context" && !(k === "@id" && d[k] === term));
          const known = typeof d["@context"] === "string" ? knownContextURL(d["@context"], options.base) : null;
          if (extra.length)
            reasons.push(`"${term}" is defined with ${extra.join(", ")}`);
          else if (known === null || TopContextURLs.includes(known))
            reasons.push(`"${term}" scopes a context the roll-up does not know as a scope: ${JSON.stringify(d["@context"])}`);
          else
            scopes[prefixes[parms[1]]] = {prefix: parms[1], terms: termsOf(KnownContexts[known])};
        } else if (term in prefixes && typeof def === "string") {
          if (term in terms && terms[term] !== def)
            reasons.push(`"${term}" redefines a term of the stacked contexts`);
        } else {
          reasons.push(`the @context defines "${term}"`);
        }
      }
    } else {
      reasons.push("a null or malformed member of @context");
    }
  }

  // the values
  const isScalar = (v: any): boolean => v === null || ["string", "number", "boolean"].includes(typeof v);
  /** `visible`: the terms in scope where the value is written */
  const checkValue = (where: string, def: any, value: any, visible: {[term: string]: any}): void => {
    const type = isMapping(def) ? def["@type"] : undefined;
    // a name under an @type: @vocab term is an IRI in the vocabulary the
    // term's scoped context sets, unless it is something else's name first
    const vocab = type === "@vocab" && isMapping(def["@context"]) && typeof def["@context"]["@vocab"] === "string"
          ? def["@context"] : null;
    for (const v of asArray(value)) {
      if (isScalar(v)) {
        if (type === "@vocab" && typeof v === "string") {
          if (vocab === null)
            reasons.push(`${where} takes a name, in no vocabulary the roll-up knows`);
          else if (/[:@]/.test(v) || v in visible || v in termsOf(vocab))
            reasons.push(`"${v}" at ${where} is not a plain name in its vocabulary`);
        }
        continue;
      }
      if (Array.isArray(v)) {
        reasons.push(`a list within a list at ${where}`);
      } else {
        // a nested node reads the same either way when each of its keys is
        // a known term, or an absolute IRI with scalar values
        for (const [k, inner] of Object.entries(v)) {
          if (k.startsWith("@"))
            reasons.push(`${k} at ${where}`);
          else if (k in visible && !(k in prefixes))
            checkValue(`${where}/${k}`, visible[k], inner, visible);
          else if (!isAbsolute(k))
            reasons.push(`"${k}" at ${where} is not an absolute IRI`);
          else if (!asArray(inner).every(isScalar))
            reasons.push(`a nested node at ${where}`);
        }
      }
    }
  };

  // beside the entries: what describes the manifest itself
  for (const [key, value] of Object.entries(doc)) {
    if (["@context", "entries", "@id", "@type"].includes(key))
      continue;
    if (key.startsWith("@"))
      reasons.push(`${key} beside the entries`);
    else if (/[:\/]/.test(key))
      reasons.push(`an IRI-shaped key beside the entries: "${key}"`);
    else if (key in prefixes)
      reasons.push(`a prefix used as a key beside the entries: "${key}"`);
    else if (key in terms)
      checkValue("/" + key, terms[key], value, terms);
    else if (!unknown.includes("/" + key))
      unknown.push("/" + key);
  }

  // the entries
  const ids = new Set<string>();
  doc.entries.forEach((entry: any, i: number) => {
    if (!isMapping(entry)) {
      reasons.push(`entry ${i} is not a mapping`);
      return;
    }
    for (const [key, value] of Object.entries(entry)) {
      if (key === "@id") {
        if (typeof value !== "string" || value.startsWith("_:"))
          reasons.push(`the @id of entry ${i} is not an IRI reference`);
        else if (ids.has(resolve(value, options.base) || value))
          reasons.push(`entry ${i} has the @id of an earlier entry: ${value}`);
        else
          ids.add(resolve(value, options.base) || value);
        continue;
      }
      if (key.startsWith("@")) {
        reasons.push(`${key} in entry ${i}`);
        continue;
      }
      const parms = /^([A-Za-z_][\w.-]*):parms$/.exec(key);
      if (parms && parms[1] in prefixes) {
        const scope = scopes[prefixes[parms[1]]];
        if (scope === undefined || scope.prefix !== parms[1]) {
          if (!reasons.some(r => r.includes(`"${key}"`)))
            reasons.push(`"${key}" is not bound to a scope in the @context`);
        } else if (!isMapping(value)) {
          reasons.push(`"${key}" in entry ${i} is not a mapping`);
        } else {
          for (const [name, inner] of Object.entries(value as Entry)) {
            if (name.startsWith("@") || /[:\/]/.test(name))
              reasons.push(`"${name}" in ${key} of entry ${i}`);
            else if (name in scope.terms)
              checkValue(`${key}/${name}`, scope.terms[name], inner, Object.assign({}, terms, scope.terms));
            else if (name in terms)
              checkValue(`${key}/${name}`, terms[name], inner, Object.assign({}, terms, scope.terms));
            else if (!unknown.includes(`${key}/${name}`))
              unknown.push(`${key}/${name}`);
          }
        }
      } else if (/[:\/]/.test(key)) {
        reasons.push(`an IRI-shaped key in entry ${i}: "${key}"`);
      } else if (key in prefixes) {
        reasons.push(`a prefix used as a key in entry ${i}: "${key}"`);
      } else if (key in terms) {
        checkValue(key, terms[key], value, terms);
      } else if (!unknown.includes(key)) {
        unknown.push(key);
      }
    }
  });
  return done();
}

// --- the plain reading ----------------------------------------------------------

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

/** the plain reading of a manifest: a list, `{"@context", entries}`, or one
 * entry; scopes flattened, plugins collected.  For a document the frame
 * check passes -- readJson is the front door, and settles x/xURL first */
export function entriesFromJson (doc: any, _options: ReadOptions = {}): Entry[] {
  let entries: any[];
  let context: any = undefined;
  if (Array.isArray(doc)) {
    entries = doc;
  } else if (isMapping(doc)) {
    if (hasGraph(doc))
      throw new Error("manifest: a JSON-LD @graph document is not read plainly");
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
  return entries.map(entry => {
    if (!isMapping(entry))
      throw new Error("manifest: an entry must be a mapping, not " + JSON.stringify(entry));
    const flat: Entry = {};
    const parms: {[namespace: string]: any} = {};
    const plugins: string[] = [];
    for (const [key, value] of Object.entries(entry)) {
      const ns = parmsNamespace(key, prefixes);
      if (ns !== null) {
        if (!isMapping(value))
          throw new Error(`manifest: "${key}" must be a mapping of that vocabulary's attributes`);
        parms[ns] = value;
        flatten(flat, value as Entry, plugins, key);
      } else if (key === "plugins" || key === "pluginURL") {
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
    return flat;
  });
}

// --- the graph side -------------------------------------------------------------

interface VocabTerm {
  text?: string;      // the attribute a literal object is written as
  url?: string;       // ...and an IRI object (@type: @id)
  container?: string;
  vocab?: string;     // the namespace an IRI object is a name in (@type: @vocab)
}

/** predicate IRI -> attribute name(s), from a JSON-LD context: a term's @id
 * (compact IRIs expanded through the context's own prefixes), @type: @id
 * marking the ...URL spelling, @container kept for lists and sets, and for
 * an @type: @vocab term the @vocab its scoped context sets, in which its
 * values are names */
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
    let iri: string, isId = false, container: string | undefined, names: string | undefined;
    if (typeof def === "string") {
      iri = expand(def);
    } else if (def && typeof def === "object") {
      iri = expand(typeof def["@id"] === "string" ? def["@id"] : term);
      isId = def["@type"] === "@id";
      container = def["@container"];
      if (def["@type"] === "@vocab" && isMapping(def["@context"]) && typeof def["@context"]["@vocab"] === "string")
        names = def["@context"]["@vocab"];
    } else {
      continue;
    }
    if (!isAbsolute(iri) || prefixes[term] === iri) // a prefix declaration names no attribute
      continue;
    const t = vocab.get(iri) || {};
    if (isId) t.url = term; else t.text = term;
    if (container) t.container = container;
    if (names) t.vocab = names;
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

/** quads in a list, asked the one way entriesFromGraph asks: a term or an
 * IRI string per position, null for any.  What a JSON-LD processor's toRDF
 * returns goes in as is */
export class QuadList {
  constructor (private quads: any[]) {}
  getQuads (s: any, p: any, o: any): any[] {
    const matches = (want: any, have: any): boolean =>
          want === null || want === undefined
          || (typeof want === "string" ? have.termType === "NamedNode" && have.value === want
              : have.termType === want.termType && have.value === want.value);
    return this.quads.filter(q => matches(s, q.subject) && matches(p, q.predicate) && matches(o, q.object));
  }
}

/** the entries an RDF graph of the manifest holds: the members of its
 * entries list (or, failing a list, every node with a schema), each read
 * back by predicate through the known top-level vocabularies and the parms
 * convention */
export async function entriesFromGraph (store: any, options: GraphOptions = {}): Promise<Entry[]> {
  const vocab = vocabularyOf(options.context || TopContext);
  const iriOf = (key: string): string | undefined => {
    for (const [iri, t] of vocab)
      if (t.text === key || t.url === key)
        return iri;
    return undefined;
  };
  const entriesIRI = iriOf("entries");
  const pluginIRI = iriOf("pluginURL");
  const manifestContextIRI = iriOf("manifestContext");

  /** the vocabulary of a scope, for spelling its attributes: from `scopes`;
   * else the context the graph names for the namespace, from the roll-up or
   * fetched; else a known vocabulary with that namespace; else nothing (the
   * heuristic) */
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
        const known = knownContextURL(url);
        if (known !== null)
          ctx = KnownContexts[known];
        else if (options.loadContext)
          try {
            ctx = await options.loadContext(url);
          } catch (e) {
            ctx = undefined;
          }
      }
    }
    if (ctx === undefined) {
      const v = KnownVocabularies.find(v => v.namespace === ns);
      if (v)
        ctx = KnownContexts[v.context];
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

  type Spelling = (predicate: string) => VocabTerm | undefined;

  /** the attribute a predicate is written as, for this object: the term's
   * ...URL spelling for an IRI, its text spelling otherwise, whichever it has */
  const keyFor = (t: VocabTerm, object: any): string =>
        object.termType === "NamedNode" ? (t.url || t.text!) : (t.text || t.url!);

  /** a literal as itself; an IRI as its string, or under an @type: @vocab
   * term as its name in that vocabulary; a blank node as the mapping of its
   * predicates, each spelled as a known term (a nested node: a member of
   * the Test scope's prints) or left an IRI (staticVars' variables) */
  const valueOf = (term: any, spelling: Spelling, t?: VocabTerm): any => {
    if (term.termType === "Literal")
      return literalValue(term);
    if (term.termType === "BlankNode") {
      const o: Entry = {};
      for (const q of quads(term, null, null)) {
        const known = spelling(q.predicate.value);
        if (!known)
          put(o, q.predicate.value, valueOf(q.object, spelling));
        else if (known.container === "@list")
          o[keyFor(known, q.object)] = listOf(q.object).map(m => valueOf(m, spelling, known));
        else
          put(o, keyFor(known, q.object), valueOf(q.object, spelling, known));
      }
      return o;
    }
    if (t && t.vocab && term.value.startsWith(t.vocab))
      return term.value.slice(t.vocab.length);
    return term.value;
  };
  const core: Spelling = p => vocab.get(p);

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
        const key = keyFor(t, q.object);
        if (t.container === "@list") {
          const items = listOf(q.object).map(m => valueOf(m, core, t));
          if (key === "pluginURL") plugins.push(...items); else flat[key] = items;
        } else if (key === "pluginURL") {
          plugins.push(q.object.value);
        } else {
          put(flat, key, valueOf(q.object, core, t));
        }
      } else if (p.endsWith("parms") && q.object.termType === "BlankNode") {
        const ns = p.slice(0, -"parms".length);
        const scoped = await scopeVocab(ns);
        const inScope: Spelling = p2 => (scoped && scoped.get(p2)) || vocab.get(p2);
        const scope: Entry = {};
        for (const q2 of quads(q.object, null, null)) {
          const isIri = q2.object.termType === "NamedNode";
          if (q2.predicate.value === pluginIRI) {
            put(scope, "pluginURL", q2.object.value); // flatten() collects it
          } else {
            const known = inScope(q2.predicate.value);
            const local = q2.predicate.value.startsWith(ns) ? q2.predicate.value.slice(ns.length) : q2.predicate.value;
            const name = known ? keyFor(known, q2.object) : (isIri ? local + "URL" : local);
            if (known && known.container === "@list")
              scope[name] = listOf(q2.object).map(m => valueOf(m, inScope, known));
            else
              put(scope, name, valueOf(q2.object, inScope, known));
          }
        }
        parms[ns] = scope;
        flatten(flat, scope, plugins, "<" + p + ">");
      } else {
        put(flat, p, valueOf(q.object, core));
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

// --- the JSON-LD reading --------------------------------------------------------

/** the JSON-LD reading of a manifest: the processor expands it to RDF, the
 * known contexts answered from the roll-up, and the entries are read back
 * from the graph.  What any JSON-LD document of a manifest means, framed or
 * not: an expanded or flattened one, one with other prefixes or contexts */
export async function entriesViaJsonLd (doc: any, options: JsonOptions = {}): Promise<Entry[]> {
  let jsonld = options.jsonld;
  if (typeof jsonld === "function" && typeof jsonld.toRDF !== "function")
    jsonld = await jsonld();
  if (!jsonld || typeof jsonld.toRDF !== "function")
    throw new Error("manifest: entriesViaJsonLd needs options.jsonld, a JSON-LD processor with toRDF");
  const fallback = options.loadContext
        ? async (url: string): Promise<RemoteDocument> => ({contextUrl: null, documentUrl: url, document: await options.loadContext!(url)})
        : undefined;
  const quads = await jsonld.toRDF(doc, {base: options.base, documentLoader: documentLoader(fallback)});
  // the scopes the document binds itself, so their attributes spell back
  // the way it wrote them
  const scopes: {[namespace: string]: any} = Object.assign({}, options.scopes);
  for (const [ns, {ref}] of Object.entries(boundScopes(isMapping(doc) ? doc["@context"] : undefined))) {
    if (ns in scopes)
      continue;
    if (isMapping(ref)) {
      scopes[ns] = ref;
    } else if (typeof ref === "string") {
      const known = knownContextURL(ref, options.base);
      if (known !== null)
        scopes[ns] = KnownContexts[known];
      else if (options.loadContext)
        try {
          scopes[ns] = await options.loadContext(resolve(ref, options.base) || ref);
        } catch (e) {
          // spelled by the heuristic
        }
    }
  }
  return entriesFromGraph(new QuadList(quads), Object.assign({}, options, {scopes}));
}
