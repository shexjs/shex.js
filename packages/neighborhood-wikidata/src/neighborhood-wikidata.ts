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
import {DbQueryTracker, Neighborhood, NeighborhoodDb, sparqlOrder, Start} from "@shexjs/neighborhood-api";
import * as N3 from "n3";
import * as fs from "fs";
import * as path from "path";
import {SiteInfo, WikibaseRdfOptions, wikibaseRdfConverter} from "./wikibase-rdf";

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

export function wikidataDB (queryTracker?: DbQueryTracker, options: WikidataDbOptions = {}): NeighborhoodDb {
  const conceptBase = options.conceptBase || "http://www.wikidata.org/";
  const dataBase = options.dataBase || "https://www.wikidata.org/wiki/Special:EntityData/";
  const entityDataUrl = options.entityDataUrl || ((id: string) => `${dataBase}${id}.json`);
  const siteMatrixUrl = options.siteMatrixUrl ||
        "https://www.wikidata.org/w/api.php?action=sitematrix&format=json&formatversion=2";

  const fetchDoc = options.fetchDoc || function (url: string): string {
    const XHR = (globalThis as any).XMLHttpRequest;
    if (!XHR)
      throw Error(`no fetchDoc option and no XMLHttpRequest to fetch ${url} with; ` +
                  `pass fetchDoc or install a synchronous XMLHttpRequest shim`);
    const xhr = new XHR();
    xhr.open("GET", url, false);
    xhr.setRequestHeader("Accept", "application/json");
    // Wikimedia's User-Agent policy 403s anonymous clients; browsers can't
    // set User-Agent, so identify via the Api-User-Agent they accept instead
    xhr.setRequestHeader("Api-User-Agent", "@shexjs/neighborhood-wikidata");
    xhr.send();
    if (xhr.status >= 400)
      throw Error(`GET <${url}> returned ${xhr.status}:\n${xhr.responseText}`);
    return xhr.responseText;
  };

  /** memory over disk over network */
  function getDoc (cacheKey: string, url: string): string {
    if (options.cacheDir) {
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

  function ensureLoaded (id: string): void {
    if (loaded.has(id)) return;
    const doc = JSON.parse(getDoc(id, entityDataUrl(id)));
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

  return {
    getNeighborhood,
    getSubjects: () => store.getSubjects(null, null, null),
    getPredicates: () => store.getPredicates(null, null, null),
    getObjects: () => store.getObjects(null, null, null),
    getQuads: (...args: any[]) => (store.getQuads as any)(...args),
    get size (): number { return store.size; },
  };
}

export const name = "neighborhood-wikidata";
export const description = "Implementation of @shexjs/neighborhood-api which synthesizes Wikidata's RDF from entity JSON pages";
export const ctor = wikidataDB;
