/** Implementation of @shexjs/neighborhood-api which synthesizes Wikidata's
 * RDF on the fly from entity JSON pages.
 *
 * Wikidata entities are edited and stored as JSON; the RDF the query service
 * exposes is derived from those pages.  Rather than validating across SPARQL
 * (see @shexjs/neighborhood-sparql), this DB downloads
 * `Special:EntityData/<id>.json` for each entity a validation walks into,
 * converts it to the same RDF (see ./wikibase-rdf), and accumulates the
 * result in an in-memory store that neighborhoods are answered from.
 *
 * A focus node names its entity page most of the time -- `wd:Q42` directly,
 * a statement node `wds:Q42-<guid>` by its prefix, the `data:Q42` page node
 * by its path.  Value nodes (`wdv:<hash>`), reference nodes
 * (`wdref:<hash>`) and the somevalue blank nodes carry no entity name, but a
 * walk only ever reaches them through a statement whose page is already
 * loaded, so they are answered from the store; asking about one this DB has
 * never seen is an error rather than an empty answer.
 *
 * Caching is what makes this usable:
 *
 *   - within a run, each page is fetched once (a validation asks for the
 *     same neighborhood many times over) and the store only grows;
 *   - across runs, `cacheDir` keeps the raw JSON on disk, so re-validating
 *     costs no requests at all.  Pages are cached forever -- delete the
 *     file (or the directory) to pick up an edit;
 *   - the sitematrix (site id -> URL/language/group, needed for sitelink
 *     RDF) is fetched once and cached the same way.
 *
 * What the store holds is exactly the entity pages it has loaded, which is
 * complete for every node's *outgoing* arcs (an entity's page states all of
 * them) but means *incoming* arcs only reflect loaded pages: validating
 * `wd:Q5` against a shape with `^wdt:P31 .` will see only walked-in humans,
 * not all nine million.  Inverse constraints over Wikidata-scale fan-in
 * need a query service; this module's answer is honest but partial.
 */
import * as RdfJs from "@rdfjs/types";
import type {Shape} from "shexj";
import {DbParamSpec, DbQueryTracker, EditorCompletion, Neighborhood, NeighborhoodDb,
        NeighborhoodWebAppDb, ParamEditor, sparqlOrder, Start} from "@shexjs/neighborhood-api";
import * as N3 from "n3";
import * as fs from "fs";
import * as path from "path";
import {fileURLToPath} from "url";
import {EntityDoc, SiteInfo, WikibaseRdfOptions, wikibaseRdfConverter} from "./wikibase-rdf";

export {SiteInfo};

export interface WikidataDbOptions extends Omit<WikibaseRdfOptions, "siteInfo"> {
  /** URL of an entity's JSON page; default Special:EntityData under
   * (dataBase's host) https://www.wikidata.org/ */
  entityDataUrl?: (id: string) => string;
  /** where the sitematrix comes from; default wikidata's api.php */
  siteMatrixUrl?: string;
  /** directory for the persistent page cache; created on first write.
   * Without it, caching is in-memory only. */
  cacheDir?: string;
  /** The entities in play, by id: what a host's "entity ids" pane holds.
   * They are not fetched until a walk reaches them -- naming an entity is
   * not asking for it -- but they are what a focus-node menu offers. */
  entities?: string[];
  /** Entity pages to believe instead of what the site currently serves,
   * as the JSON text of `Special:EntityData/<id>.json` (or of a bare
   * entity).
   *
   * This is how an edit gets validated before it is made: paste the pages
   * of the handful of entities you mean to change, and the walk reads them
   * where it would have fetched them and fetches everything else as usual,
   * so a speculative constellation is checked in its real surroundings. */
  pages?: string[];
  /** synchronous transport: fetch a URL, return the response body.  The
   * default uses a synchronous XMLHttpRequest, which browsers provide;
   * under node install a shim (e.g. neighborhood-sparql's test sync-fetch)
   * or pass this option. */
  fetchDoc?: (url: string) => string;
  /** resolve a sitelink's site id yourself instead of via the sitematrix */
  siteInfo?: (siteId: string) => SiteInfo | undefined;
}

/** Thrown when a focus node can't be tied to an entity page. */
export class EntityResolutionError extends Error {
  constructor (message: string) {
    super(message);
    this.name = "EntityResolutionError";
  }
}

const DataFactory = N3.DataFactory;

/** Who this is, for hosts that ask (see fetchDoc): a tool and where to
 * read about it, which is what Wikimedia's robot policy wants. */
const USER_AGENT = "@shexjs/neighborhood-wikidata (https://github.com/shexjs/shex.js)";

/** Is there a browser here, with a User-Agent of its own and opinions about
 * who may set it? */
function inBrowser (): boolean {
  const global = globalThis as any;
  return typeof global.window !== "undefined" && typeof global.window.document !== "undefined";
}

// ── site languages ──────────────────────────────────────────────────────────
// The sitematrix names each wiki's language by its subdomain-ish code;
// Wikibase's RDF names it by the BCP 47 form of the sites-table entry.
// Bridging the two takes MediaWiki's nonstandard-code mapping
// (LanguageCode::NON_STANDARD_LANGUAGE_CODE_MAPPING), a few sites-table
// values that predate today's config, and BCP 47 case normalization --
// each verified against dump output for entities with the affected links.

const NONSTANDARD_LANGUAGE_CODES: { [code: string]: string } = {
  "als": "gsw", "bat-smg": "sgs", "be-x-old": "be-tarask", "cbk-zam": "cbk-x-zam",
  "eml": "egl", "fiu-vro": "vro", "map-bms": "jv-x-bms", "mo": "ro-Cyrl-x-mo",
  "nrm": "fr-x-nrm", "roa-rup": "rup", "roa-tara": "nap-x-tara", "simple": "en-simple",
  "zh-classical": "lzh", "zh-min-nan": "nan", "zh-yue": "yue",
};

/** sites-table languages that differ from the sitematrix code */
const SITE_LANGUAGE_OVERRIDES: { [dbname: string]: string } = {
  nowiki: "nb", nowiktionary: "nb", nowikibooks: "nb", nowikinews: "nb",
  nowikiquote: "nb", nowikisource: "nb",
  bhwiki: "bho", bhwiktionary: "bho",
  crhwiki: "crh-latn",
};

/** BCP 47 case normalization: "nds-nl" -> "nds-NL", "crh-latn" -> "crh-Latn" */
export function bcp47 (code: string): string {
  const mapped = NONSTANDARD_LANGUAGE_CODES[code.toLowerCase()] || code;
  let priv = false;
  return mapped.split("-").map((part, i) => {
    if (i === 0 || priv) return part.toLowerCase();
    if (part.toLowerCase() === "x") { priv = true; return "x"; }
    if (part.length === 2) return part.toUpperCase();
    if (part.length === 4) return part.charAt(0).toUpperCase() + part.substring(1).toLowerCase();
    return part.toLowerCase();
  }).join("-");
}

/** Site id -> SiteInfo from an `action=sitematrix&formatversion=2` response.
 * Exported so a cached copy can be turned into a `siteInfo` option. */
export function siteInfoFromSitematrix (doc: any): (siteId: string) => SiteInfo | undefined {
  const sm = doc.sitematrix || {};
  const map = new Map<string, SiteInfo>();
  const entry = (dbname: string, url: string, langCode: string, group: string) =>
    map.set(dbname, {
      url,
      language: bcp47(SITE_LANGUAGE_OVERRIDES[dbname] || langCode),
      group: group === "wiki" ? "wikipedia" : group,
    });
  for (const [key, val] of Object.entries(sm) as [string, any][]) {
    if (key === "count") continue;
    if (key === "specials")
      for (const s of val)
        // specials' "lang" is a placeholder matching their code; their
        // content language is English
        entry(s.dbname, s.url, s.lang === s.code ? "en" : s.lang || "en", s.code);
    else
      for (const s of val.site || [])
        entry(s.dbname, s.url, val.code, s.code);
  }
  return siteId => map.get(siteId);
}

// ── the DB ──────────────────────────────────────────────────────────────────

/** What this module's DB offers over the plain API: its own entity naming,
 * which its query map resolver needs, and the pages it read. */
export interface WikidataNeighborhoodDb extends NeighborhoodWebAppDb {
  /** the IRI of an entity, by id, in whichever Wikibase this DB is pointed at */
  entityIri (id: string): string;
  loadedPages (): { id: string, text: string }[];
}

export function wikidataDB (queryTracker?: DbQueryTracker, options: WikidataDbOptions = {}): WikidataNeighborhoodDb {
  const conceptBase = options.conceptBase || "http://www.wikidata.org/";
  const dataBase = options.dataBase || "https://www.wikidata.org/wiki/Special:EntityData/";
  const entityDataUrl = options.entityDataUrl || ((id: string) => `${dataBase}${id}.json`);
  const siteMatrixUrl = options.siteMatrixUrl ||
        // origin=* is what makes the Action API answer a cross-origin
        // request; without it a browser has no permission to read this
        "https://www.wikidata.org/w/api.php?action=sitematrix&format=json&formatversion=2&origin=*";

  const fetchDoc = options.fetchDoc || function (url: string): string {
    // a file: base makes a directory of captured pages a fully offline
    // "API": <base><id>.json resolves to a file next to its siblings
    if (url.startsWith("file://"))
      return fs.readFileSync(fileURLToPath(url), "utf8");
    const XHR = (globalThis as any).XMLHttpRequest;
    if (!XHR)
      throw Error(`no fetchDoc option and no XMLHttpRequest to fetch ${url} with; ` +
                  `pass fetchDoc or install a synchronous XMLHttpRequest shim`);
    const xhr = new XHR();
    xhr.open("GET", url, false);
    xhr.setRequestHeader("Accept", "application/json");
    // Wikimedia's robot policy 403s clients that don't identify themselves
    // (T400119).  A browser has a User-Agent of its own and refuses to let
    // anyone set that header -- it warns rather than obeying -- so only a
    // shim that has none is told.  And nothing sets a *custom* header
    // (Api-User-Agent, which MediaWiki would also read): asking for one
    // turns a cross-origin request into a preflighted one, which a
    // synchronous XHR cannot do.
    if (!inBrowser())
      xhr.setRequestHeader("User-Agent", USER_AGENT);
    xhr.send();
    if (xhr.status >= 400)
      throw Error(`GET <${url}> returned ${xhr.status}:\n${xhr.responseText}`);
    return xhr.responseText;
  };

  /** memory over disk over network */
  function getDoc (cacheKey: string, url: string): string {
    // fs is absent where there is no filesystem (a browser bundle stubs it
    // out), so an on-disk cache is only offered where one can exist
    if (options.cacheDir && fs && typeof fs.existsSync === "function") {
      const file = path.join(options.cacheDir, cacheKey + ".json");
      if (fs.existsSync(file))
        return fs.readFileSync(file, "utf8");
      const body = fetchDoc(url);
      fs.mkdirSync(options.cacheDir, {recursive: true});
      fs.writeFileSync(file, body);
      return body;
    }
    return fetchDoc(url);
  }

  let siteInfo = options.siteInfo || null;
  const converter = wikibaseRdfConverter(DataFactory, {
    conceptBase, dataBase,
    repositoryName: options.repositoryName,
    commonsMediaBase: options.commonsMediaBase,
    commonsDataBase: options.commonsDataBase,
    license: options.license,
    // lazy: entities without sitelinks never need the sitematrix
    siteInfo: siteId => {
      if (siteInfo === null)
        siteInfo = siteInfoFromSitematrix(JSON.parse(getDoc("sitematrix", siteMatrixUrl)));
      return siteInfo(siteId);
    },
  });
  const NS = converter.namespaces;

  const store = new N3.Store();
  /** entity ids whose pages are in the store */
  const loaded = new Set<string>();

  /** the caller's own pages, by the id each one is the page of */
  const supplied = new Map<string, EntityDoc>();
  (options.pages || []).forEach((text, i) => {
    let doc: EntityDoc;
    try {
      doc = asEntityDoc(JSON.parse(text));
    } catch (e) {
      throw Error(`supplied entity page ${i} is not an entity: ${(e as Error).message}`);
    }
    for (const id of Object.keys(doc.entities))
      supplied.set(id, doc);
  });

  /** the pages this DB has read, by the id each is the page of */
  const pageTexts = new Map<string, string>();

  function ensureLoaded (id: string): void {
    if (loaded.has(id)) return;
    // a page the caller supplied is the page: it says what the entity would
    // be if their edit were made, which is the thing being validated
    let doc = supplied.get(id);
    if (doc === undefined) {
      const text = getDoc(id, entityDataUrl(id));
      pageTexts.set(id, text);
      doc = JSON.parse(text) as EntityDoc;
    }
    store.addQuads(converter.entityToQuads(doc, id) as any);
    loaded.add(id);
    const returned = Object.keys(doc.entities)[0];
    if (returned !== id) loaded.add(returned);  // a redirect loads its target
  }

  /** The entity page a term implies, or null for terms that carry no entity
   * name (and so must already be in the store, or aren't ours at all). */
  function entityOf (point: RdfJs.Term): string | null {
    if (point.termType !== "NamedNode") return null;
    const v = point.value;
    if (v.startsWith(NS.wds)) {
      // wds:Q42-<guid>, wds:q42-<guid> (old statements), wds:L123-F4-<guid>
      const m = v.substring(NS.wds.length).match(/^([QPL]\d+)/i);
      return m ? m[1].toUpperCase() : null;
    }
    if (v.startsWith(NS.wd)) {
      const m = v.substring(NS.wd.length).match(/^([QPL]\d+)(-|$)/i);
      return m ? m[1].toUpperCase() : null;
    }
    if (v.startsWith(dataBase)) {
      const m = v.substring(dataBase.length).match(/^([QPL]\d+)/i);
      return m ? m[1].toUpperCase() : null;
    }
    return null;
  }

  /** True for terms that only an entity page this DB has loaded could have
   * minted -- so absence from the store is a mistake worth an error. */
  function mintedHere (point: RdfJs.Term): boolean {
    return point.termType === "BlankNode" ||
      (point.termType === "NamedNode" &&
       (point.value.startsWith(NS.wdv) || point.value.startsWith(NS.wdref)));
  }

  function getNeighborhood (point: RdfJs.Term, shapeLabel: string | typeof Start, _shape: Shape): Neighborhood {
    const id = entityOf(point);
    if (id !== null)
      ensureLoaded(id);
    else if (mintedHere(point) &&
             store.countQuads(point as any, null, null, null) === 0 &&
             store.countQuads(null, null, point as any, null) === 0)
      throw new EntityResolutionError(
        `${point.termType === "BlankNode" ? "_:" + point.value : "<" + point.value + ">"} ` +
          `is not in any entity page this DB has loaded, and its name doesn't say ` +
          `which page to fetch; walk in through the entity's statements instead`);

    let startTime: number | null = null;
    if (queryTracker) {
      startTime = Date.now();
      queryTracker.start(false, point, shapeLabel);
    }
    const outgoing = store.getQuads(point as any, null, null, null)
          .sort((l, r) => sparqlOrder(l.object, r.object));
    if (queryTracker) {
      const now = Date.now();
      queryTracker.end(outgoing, now - startTime!);
      startTime = now;
      queryTracker.start(true, point, shapeLabel);
    }
    const incoming = store.getQuads(null, null, point as any, null)
          .sort((l, r) => sparqlOrder(l.object, r.object));
    if (queryTracker)
      queryTracker.end(incoming, Date.now() - startTime!);
    return {outgoing, incoming};
  }

  /** Entities this DB could offer a WebApp's focus-node input, matched by
   * id or by label.  Only the pages already loaded: this is typeahead over
   * what the session has seen, not a search of all of Wikidata (which would
   * be the wbsearchentities API, and asynchronous). */
  function suggestFocusNodes (prefix: string, limit: number): EditorCompletion[] {
    const wanted = prefix.replace(/^(wd:|<?https?:\/\/\S*\/entity\/)/, "").toLowerCase();
    const out: EditorCompletion[] = [];
    // pages the caller supplied are what they came to validate, so offer
    // them whether or not the walk has reached them yet
    for (const id of new Set([...(options.entities || []), ...supplied.keys(), ...loaded])) {
      const label = loaded.has(id)
            ? labelOf(DataFactory.namedNode(NS.wd + id), "en")
            : supplied.has(id) ? labelIn(supplied.get(id)!, id, "en") : null;
      if (id.toLowerCase().startsWith(wanted) ||
          (label !== null && label.toLowerCase().startsWith(wanted))) {
        out.push({label: NS.wd + id, detail: label || undefined, type: "class"});
        if (out.length >= limit) break;
      }
    }
    return out;
  }

  /** The label to show a reader of `language`.  Falling back through `mul`
   * matters more on Wikidata than it looks: a name that reads the same in
   * every language is now stored once as language-neutral `mul` rather than
   * copied per language, so an entity can have 75 labels and no `en` one
   * (Q42 is exactly this). */
  function labelOf (term: RdfJs.Term, language: string): string | null {
    const labels = store.getObjects(term as any, DataFactory.namedNode(RDFS_LABEL), null);
    const inLanguage = (want: string) =>
      labels.find(l => (l as RdfJs.Literal).language === want);
    const found = inLanguage(language.toLowerCase())
          || inLanguage(language.toLowerCase().split("-")[0])
          || inLanguage("mul");
    return found ? found.value : labels.length > 0 ? labels[0].value : null;
  }

  return {
    getNeighborhood,
    getSubjects: () => store.getSubjects(null, null, null),
    getPredicates: () => store.getPredicates(null, null, null),
    getObjects: () => store.getObjects(null, null, null),
    getQuads: (...args: any[]) => (store.getQuads as any)(...args),
    get size (): number { return store.size; },
    suggestFocusNodes,
    labelOf,
    loadedPages,
    entityIri: (id: string) => NS.wd + id,
  };

  /** The pages this DB fetched, ready to be looked at: readably indented,
   * one per entity a walk reached.  A host that offers to record what a
   * validation fetched (the WebApp's slurp) hands each of these back as a
   * document, so what was read can be edited and validated again. */
  function loadedPages (): { id: string, text: string }[] {
    const out: { id: string, text: string }[] = [];
    for (const [id, text] of pageTexts) {
      try {
        out.push({id, text: JSON.stringify(JSON.parse(text), null, 2) + "\n"});
      } catch (e) {
        out.push({id, text});      // unparseable: hand back what arrived
      }
    }
    return out;
  }
}

const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label";

/** An entity page either as `Special:EntityData` serves it or as the entity
 * alone, which is what someone hand-editing one tends to have. */
export function asEntityDoc (parsed: any): EntityDoc {
  if (parsed && typeof parsed === "object" && parsed.entities)
    return parsed as EntityDoc;
  if (parsed && typeof parsed === "object" && typeof parsed.id === "string")
    return {entities: {[parsed.id]: parsed}};
  throw Error(`expected {"entities": {...}} or an entity with an "id"`);
}

/** The label a JSON entity gives itself, through Wikidata's language-neutral
 * "mul" -- see labelOf, which does the same over converted RDF. */
function labelIn (doc: EntityDoc, id: string, language: string): string | null {
  const labels = (doc.entities[id] || {}).labels || {};
  const found = labels[language.toLowerCase()]
        || labels[language.toLowerCase().split("-")[0]]
        || labels.mul
        || Object.values(labels)[0];
  return found ? (found as any).value : null;
}

export const name = "neighborhood-wikidata";
export const label = "Wikidata";
export const description = "Implementation of @shexjs/neighborhood-api which synthesizes Wikidata's RDF from entity JSON pages";
export const capabilities = ["query", "translate"];

/** A shape map may name the entities to validate rather than their IRIs:
 *
 *     QENTITIES "42 76"@START
 *
 * which this source reads as wd:Q42 and wd:Q76 -- the entities themselves,
 * the things a schema about people or places is about.  (The pages they come
 * from are `data:Q42`, which answer a different schema: a dataset with a
 * revision and a modification date.)  Ids may be written with or without
 * their leading letter, the pane they are typed into being a list of
 * entities and nothing else. */
export const queryMapResolvers = [{
  language: "http://www.w3.org/ns/shex#Extensions-qentities",
  name: "QENTITIES",
  description: "the focus nodes are the entities with these ids",
  resolve: (lexical: string, db: NeighborhoodDb) => {
    const iri = (db as WikidataNeighborhoodDb).entityIri ||
          ((id: string) => "http://www.wikidata.org/entity/" + id);
    return lexical.trim().split(/\s+/).filter(word => word !== "").map(word => {
      const id = /^[QPLM]/i.test(word) ? word[0].toUpperCase() + word.substring(1) : "Q" + word;
      if (!/^[QPLM]\d+$/.test(id))
        throw Error(`"${word}" is not an entity id: QENTITIES takes ids like Q42, or bare numbers`);
      return DataFactory.namedNode(iri(id));
    });
  },
}];
export const ctor = wikidataDB;

/** What it takes to construct this DB, declared for hosts that offer several
 * neighborhood implementations (STRAWMAN, see @shexjs/neighborhood-api). */
/** What an entity page opened from scratch starts as: the shape of the
 * thing, with the id to fill in and one empty statement group. */
const ENTITY_TEMPLATE = JSON.stringify({
  entities: {
    Q0: {
      type: "item",
      id: "Q0",
      labels: {en: {language: "en", value: ""}},
      claims: {},
    },
  },
}, null, 2) + "\n";

export const dbParams: DbParamSpec[] = [
  { name: "base", selector: true, required: true,
    description: "where entity pages live: <base><id>.json names each page " +
      "(e.g. https://www.wikidata.org/wiki/Special:EntityData/ or a file: directory of captured pages)",
    schema: {type: "string", format: "uri"},
    cli: {option: "wikidata", typeLabel: "IRI"} },
  { name: "sitematrix",
    description: "where the site matrix lives (site id -> URL/language/group, needed for sitelink RDF); " +
      "defaults to the wikidata API",
    schema: {type: "string", format: "uri"},
    cli: {option: "wikidata-sitematrix", typeLabel: "IRI"} },
  { name: "cacheDir",
    description: "keep fetched entity pages on disk here",
    schema: {type: "string", format: "file-path"},
    ui: {hidden: true},                       // a browser has no disk to cache on
    cli: {option: "wikidata-cache", typeLabel: "dir"} },
  { name: "data", selector: true,
    description: "the entities to look at, by id, separated by whitespace",
    schema: {type: "array", items: {type: "string", contentMediaType: "text/plain"}},
    // one list, so one pane: which entities are in play is a single thought
    pane: {label: "entity ids", min: 1, max: 1},
    cli: {option: "wikidata-entities", typeLabel: "Q42 Q5 ..."} },
  { name: "pages", selector: true,
    description: "entity pages to believe instead of what the site serves, " +
      "so an edit can be validated before it is made",
    schema: {type: "array", items: {type: "string", format: "uri", contentMediaType: "application/json"}},
    // as many as the user opens: what is being checked is a constellation
    // of entities, and how many of them there are is theirs to say
    pane: {
      label: "entity JSON",
      editor: {language: "json"},
      min: 0, creatable: true,
      template: ENTITY_TEMPLATE,
      titleOf: (text: string) => {
        try {
          return Object.keys(asEntityDoc(JSON.parse(text)).entities)[0] || null;
        } catch (e) {
          return null;             // half-typed, or not an entity page
        }
      },
    },
    cli: {option: "wikidata-page", typeLabel: "file|URL"} },
];

export function fromParams (params: { [name: string]: any }, queryTracker?: DbQueryTracker): NeighborhoodDb {
  return wikidataDB(queryTracker, {
    entityDataUrl: params.base === undefined ? undefined : (id: string) => `${params.base}${id}.json`,
    siteMatrixUrl: params.sitematrix,
    cacheDir: params.cacheDir,
    pages: params.pages,
    entities: (params.data || []).join(" ").split(/\s+/).filter((id: string) => id !== ""),
  });
}

/** Sort documents a host was handed into the panes they belong in: an
 * entity page is a page, anything else is a list of ids -- and a page also
 * says which entities it is about, so dropping one in fills the id list
 * too.  A host with documents and no idea which parameter they are for
 * (a manifest entry's `data`, a dropped file) asks this. */
export function distributeDocuments (texts: string[]): { [name: string]: string[] } {
  const ids: string[] = [];
  const pages: string[] = [];
  for (const text of texts) {
    let doc: EntityDoc | null = null;
    try {
      doc = asEntityDoc(JSON.parse(text));
    } catch (e) {
      doc = null;                  // not a page: a list of ids, then
    }
    if (doc === null)
      ids.push(...text.split(/\s+/).filter(id => id !== ""));
    else {
      // re-serialized so a downloaded page arrives readable rather than as
      // one enormous line
      pages.push(JSON.stringify(doc, null, 2) + "\n");
      ids.push(...Object.keys(doc.entities));
    }
  }
  return {data: [ids.join(" ")], pages};
}

/** `# Wikidata` on the first line means "synthesize entity pages rather
 * than parsing me"; a URL after it points at another Wikibase instance. */
const WIKIDATA_HEADER = /^([ \t]*#?[ \t]*Wikidata[ \t]*:?[ \t]*)(\S*)(.*)$/im;

const KNOWN_BASES = [
  {label: "https://www.wikidata.org/wiki/Special:EntityData/", detail: "Wikidata"},
  {label: "https://test.wikidata.org/wiki/Special:EntityData/", detail: "Wikidata test instance"},
  {label: "https://commons.wikimedia.org/wiki/Special:EntityData/", detail: "Wikimedia Commons"},
];

export function claimPaneText (text: string): { [name: string]: any } | null {
  const m = text.match(WIKIDATA_HEADER);
  if (!m || m.index !== 0)
    return null;
  return m[2] === "" ? {} : {base: m[2]};   // bare header: the default base
}

/** The pane's body is whatever was slurped back, so the host's Turtle
 * carries it; this module describes its own header, and -- the part no host
 * could supply -- completes entity IRIs from the labels of the pages the DB
 * has actually loaded. */
export const paneEditor: ParamEditor = {
  language: "turtle",

  tokens (text: string) {
    const m = text.match(WIKIDATA_HEADER);
    if (!m || m.index !== 0) return [];
    const base = m[2];
    const tokens = [{from: 0, to: m[1].length, style: "keyword"}];
    if (base !== "")
      tokens.push({from: m[1].length, to: m[1].length + base.length,
                   style: isEntityDataBase(base) ? "link" : "invalid"});
    return tokens;
  },

  lint (text: string) {
    const m = text.match(WIKIDATA_HEADER);
    if (!m || m.index !== 0) return [];
    const [from, to] = [m[1].length, m[1].length + m[2].length];
    if (m[2] !== "" && !isEntityDataBase(m[2]))
      return [{from, to, severity: "error" as const,
               message: `"${m[2]}" is not an http(s) or file URL; entity pages are fetched from ` +
               `<base><id>.json, so the base needs a trailing delimiter too`}];
    return [];
  },

  complete (text: string, pos: number, ctx?: {db?: NeighborhoodDb}) {
    const lineStart = text.lastIndexOf("\n", pos - 1) + 1;
    const claimed = claimPaneText(text) !== null;

    if (lineStart === 0 && !claimed)
      return {from: 0, to: pos,
              options: [{label: "# Wikidata: ", type: "keyword",
                         detail: "synthesize entity pages instead of parsing this pane"}]};

    if (lineStart === 0 && claimed) {
      // completing the base on the header line
      const m = text.match(WIKIDATA_HEADER)!;
      if (pos >= m[1].length)
        return {from: m[1].length, to: m[1].length + m[2].length,
                options: KNOWN_BASES.map(b => ({...b, type: "namespace"}))};
      return null;
    }

    // an entity IRI anywhere else: only this DB knows that Q42 is Douglas Adams
    const db = ctx && ctx.db as NeighborhoodWebAppDb | undefined;
    if (!db || typeof db.suggestFocusNodes !== "function")
      return null;
    const before = text.substring(lineStart, pos);
    const word = before.match(/(?:<|wd:)?[A-Za-z]*\d*$/);
    if (!word || word[0] === "")
      return null;
    const options = db.suggestFocusNodes(word[0].replace(/^</, ""), 20);
    return options.length
      ? {from: lineStart + word.index!, to: pos, options}
      : null;
  },
};

function isEntityDataBase (base: string): boolean {
  return /^(https?|file):\/\/\S*[/=:]$/.test(base);
}
