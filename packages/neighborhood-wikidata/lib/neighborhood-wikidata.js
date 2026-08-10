"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbParams = exports.ctor = exports.description = exports.name = exports.EntityResolutionError = void 0;
exports.bcp47 = bcp47;
exports.siteInfoFromSitematrix = siteInfoFromSitematrix;
exports.wikidataDB = wikidataDB;
exports.fromParams = fromParams;
const neighborhood_api_1 = require("@shexjs/neighborhood-api");
const N3 = __importStar(require("n3"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const url_1 = require("url");
const wikibase_rdf_1 = require("./wikibase-rdf");
/** Thrown when a focus node can't be tied to an entity page. */
class EntityResolutionError extends Error {
    constructor(message) {
        super(message);
        this.name = "EntityResolutionError";
    }
}
exports.EntityResolutionError = EntityResolutionError;
const DataFactory = N3.DataFactory;
// ── site languages ──────────────────────────────────────────────────────────
// The sitematrix names each wiki's language by its subdomain-ish code;
// Wikibase's RDF names it by the BCP 47 form of the sites-table entry.
// Bridging the two takes MediaWiki's nonstandard-code mapping
// (LanguageCode::NON_STANDARD_LANGUAGE_CODE_MAPPING), a few sites-table
// values that predate today's config, and BCP 47 case normalization --
// each verified against dump output for entities with the affected links.
const NONSTANDARD_LANGUAGE_CODES = {
    "als": "gsw", "bat-smg": "sgs", "be-x-old": "be-tarask", "cbk-zam": "cbk-x-zam",
    "eml": "egl", "fiu-vro": "vro", "map-bms": "jv-x-bms", "mo": "ro-Cyrl-x-mo",
    "nrm": "fr-x-nrm", "roa-rup": "rup", "roa-tara": "nap-x-tara", "simple": "en-simple",
    "zh-classical": "lzh", "zh-min-nan": "nan", "zh-yue": "yue",
};
/** sites-table languages that differ from the sitematrix code */
const SITE_LANGUAGE_OVERRIDES = {
    nowiki: "nb", nowiktionary: "nb", nowikibooks: "nb", nowikinews: "nb",
    nowikiquote: "nb", nowikisource: "nb",
    bhwiki: "bho", bhwiktionary: "bho",
    crhwiki: "crh-latn",
};
/** BCP 47 case normalization: "nds-nl" -> "nds-NL", "crh-latn" -> "crh-Latn" */
function bcp47(code) {
    const mapped = NONSTANDARD_LANGUAGE_CODES[code.toLowerCase()] || code;
    let priv = false;
    return mapped.split("-").map((part, i) => {
        if (i === 0 || priv)
            return part.toLowerCase();
        if (part.toLowerCase() === "x") {
            priv = true;
            return "x";
        }
        if (part.length === 2)
            return part.toUpperCase();
        if (part.length === 4)
            return part.charAt(0).toUpperCase() + part.substring(1).toLowerCase();
        return part.toLowerCase();
    }).join("-");
}
/** Site id -> SiteInfo from an `action=sitematrix&formatversion=2` response.
 * Exported so a cached copy can be turned into a `siteInfo` option. */
function siteInfoFromSitematrix(doc) {
    const sm = doc.sitematrix || {};
    const map = new Map();
    const entry = (dbname, url, langCode, group) => map.set(dbname, {
        url,
        language: bcp47(SITE_LANGUAGE_OVERRIDES[dbname] || langCode),
        group: group === "wiki" ? "wikipedia" : group,
    });
    for (const [key, val] of Object.entries(sm)) {
        if (key === "count")
            continue;
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
function wikidataDB(queryTracker, options = {}) {
    const conceptBase = options.conceptBase || "http://www.wikidata.org/";
    const dataBase = options.dataBase || "https://www.wikidata.org/wiki/Special:EntityData/";
    const entityDataUrl = options.entityDataUrl || ((id) => `${dataBase}${id}.json`);
    const siteMatrixUrl = options.siteMatrixUrl ||
        "https://www.wikidata.org/w/api.php?action=sitematrix&format=json&formatversion=2";
    const fetchDoc = options.fetchDoc || function (url) {
        // a file: base makes a directory of captured pages a fully offline
        // "API": <base><id>.json resolves to a file next to its siblings
        if (url.startsWith("file://"))
            return fs.readFileSync((0, url_1.fileURLToPath)(url), "utf8");
        const XHR = globalThis.XMLHttpRequest;
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
    function getDoc(cacheKey, url) {
        if (options.cacheDir) {
            const file = path.join(options.cacheDir, cacheKey + ".json");
            if (fs.existsSync(file))
                return fs.readFileSync(file, "utf8");
            const body = fetchDoc(url);
            fs.mkdirSync(options.cacheDir, { recursive: true });
            fs.writeFileSync(file, body);
            return body;
        }
        return fetchDoc(url);
    }
    let siteInfo = options.siteInfo || null;
    const converter = (0, wikibase_rdf_1.wikibaseRdfConverter)(DataFactory, {
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
    const loaded = new Set();
    function ensureLoaded(id) {
        if (loaded.has(id))
            return;
        const doc = JSON.parse(getDoc(id, entityDataUrl(id)));
        store.addQuads(converter.entityToQuads(doc, id));
        loaded.add(id);
        const returned = Object.keys(doc.entities)[0];
        if (returned !== id)
            loaded.add(returned); // a redirect loads its target
    }
    /** The entity page a term implies, or null for terms that carry no entity
     * name (and so must already be in the store, or aren't ours at all). */
    function entityOf(point) {
        if (point.termType !== "NamedNode")
            return null;
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
    function mintedHere(point) {
        return point.termType === "BlankNode" ||
            (point.termType === "NamedNode" &&
                (point.value.startsWith(NS.wdv) || point.value.startsWith(NS.wdref)));
    }
    function getNeighborhood(point, shapeLabel, _shape) {
        const id = entityOf(point);
        if (id !== null)
            ensureLoaded(id);
        else if (mintedHere(point) &&
            store.countQuads(point, null, null, null) === 0 &&
            store.countQuads(null, null, point, null) === 0)
            throw new EntityResolutionError(`${point.termType === "BlankNode" ? "_:" + point.value : "<" + point.value + ">"} ` +
                `is not in any entity page this DB has loaded, and its name doesn't say ` +
                `which page to fetch; walk in through the entity's statements instead`);
        let startTime = null;
        if (queryTracker) {
            startTime = Date.now();
            queryTracker.start(false, point, shapeLabel);
        }
        const outgoing = store.getQuads(point, null, null, null)
            .sort((l, r) => (0, neighborhood_api_1.sparqlOrder)(l.object, r.object));
        if (queryTracker) {
            const now = Date.now();
            queryTracker.end(outgoing, now - startTime);
            startTime = now;
            queryTracker.start(true, point, shapeLabel);
        }
        const incoming = store.getQuads(null, null, point, null)
            .sort((l, r) => (0, neighborhood_api_1.sparqlOrder)(l.object, r.object));
        if (queryTracker)
            queryTracker.end(incoming, Date.now() - startTime);
        return { outgoing, incoming };
    }
    return {
        getNeighborhood,
        getSubjects: () => store.getSubjects(null, null, null),
        getPredicates: () => store.getPredicates(null, null, null),
        getObjects: () => store.getObjects(null, null, null),
        getQuads: (...args) => store.getQuads(...args),
        get size() { return store.size; },
    };
}
exports.name = "neighborhood-wikidata";
exports.description = "Implementation of @shexjs/neighborhood-api which synthesizes Wikidata's RDF from entity JSON pages";
exports.ctor = wikidataDB;
/** What it takes to construct this DB, declared for hosts that offer several
 * neighborhood implementations (STRAWMAN, see @shexjs/neighborhood-api). */
exports.dbParams = [
    { name: "base", selector: true, required: true,
        description: "where entity pages live: <base><id>.json names each page " +
            "(e.g. https://www.wikidata.org/wiki/Special:EntityData/ or a file: directory of captured pages)",
        schema: { type: "string", format: "uri" },
        cli: { option: "wikidata", typeLabel: "IRI" } },
    { name: "sitematrix",
        description: "where the site matrix lives (site id -> URL/language/group, needed for sitelink RDF); " +
            "defaults to the wikidata API",
        schema: { type: "string", format: "uri" },
        cli: { option: "wikidata-sitematrix", typeLabel: "IRI" } },
    { name: "cacheDir",
        description: "keep fetched entity pages on disk here",
        schema: { type: "string", format: "file-path" },
        cli: { option: "wikidata-cache", typeLabel: "dir" } },
];
function fromParams(params, queryTracker) {
    return wikidataDB(queryTracker, {
        entityDataUrl: params.base === undefined ? undefined : (id) => `${params.base}${id}.json`,
        siteMatrixUrl: params.sitematrix,
        cacheDir: params.cacheDir,
    });
}
//# sourceMappingURL=neighborhood-wikidata.js.map