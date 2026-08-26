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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paneEditor = exports.dbParams = exports.ctor = exports.queryMapResolvers = exports.capabilities = exports.description = exports.label = exports.name = exports.EntityResolutionError = void 0;
exports.forgetPages = forgetPages;
exports.bcp47 = bcp47;
exports.siteInfoFromSitematrix = siteInfoFromSitematrix;
exports.wikibaseDB = wikibaseDB;
exports.asEntityDoc = asEntityDoc;
exports.fromParams = fromParams;
exports.distributeDocuments = distributeDocuments;
exports.claimPaneText = claimPaneText;
exports.asAsyncDb = asAsyncDb;
const neighborhood_api_1 = require("@shexjs/neighborhood-api");
const N3 = __importStar(require("n3"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const url_1 = require("url");
const wikibase_rdf_1 = require("./wikibase-rdf");
const json_locations_1 = require("./json-locations");
/** Thrown when a focus node can't be tied to an entity page. */
class EntityResolutionError extends Error {
    constructor(message) {
        super(message);
        this.name = "EntityResolutionError";
    }
}
exports.EntityResolutionError = EntityResolutionError;
const DataFactory = N3.DataFactory;
/** Who this is, for hosts that ask (see fetchDoc): a tool and where to
 * read about it, which is what Wikimedia's robot policy wants. */
const USER_AGENT = "@shexjs/neighborhood-wikibase (https://github.com/shexjs/shex.js)";
/** Pages fetched by this process, by URL.
 *
 * A DB is rebuilt whenever its configuration changes -- a host that offers
 * a form rebuilds on every keystroke in it -- and a page fetched
 * synchronously is the most expensive thing here by an order of magnitude.
 * The pages themselves don't change under an edit to a field, so they
 * outlive the DB that read them.  `forgetPages()` empties this for a host
 * that wants to see the site's current answer again. */
const fetchedPages = new Map();
/** likewise the site table, which is parsed into a lookup once per URL */
const siteInfoByUrl = new Map();
function forgetPages() {
    fetchedPages.clear();
    siteInfoByUrl.clear();
}
/** Is there a browser here, with a User-Agent of its own and opinions about
 * who may set it? */
function inBrowser() {
    const global = globalThis;
    return typeof global.window !== "undefined" && typeof global.window.document !== "undefined";
}
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
function wikibaseDB(queryTracker, options = {}) {
    const conceptBase = options.conceptBase || "http://www.wikidata.org/";
    const dataBase = options.dataBase || "https://www.wikidata.org/wiki/Special:EntityData/";
    const entityDataUrl = options.entityDataUrl || ((id) => `${dataBase}${id}.json`);
    const siteMatrixUrl = options.siteMatrixUrl ||
        // origin=* is what makes the Action API answer a cross-origin
        // request; without it a browser has no permission to read this
        "https://www.wikidata.org/w/api.php?action=sitematrix&format=json&formatversion=2&origin=*";
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
    const fetchDocAsync = options.fetchDocAsync || function (url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (url.startsWith("file://"))
                return fs.readFileSync((0, url_1.fileURLToPath)(url), "utf8");
            // The header story is the same as the synchronous transport's: Wikimedia
            // 403s clients that don't identify themselves (T400119), a browser sets
            // its own User-Agent and won't let anyone else, and a *custom* header
            // would make this a preflighted cross-origin request.  fetch() at least
            // could preflight -- but there is no reason to pay for it.
            const headers = { "Accept": "application/json" };
            if (!inBrowser())
                headers["User-Agent"] = USER_AGENT;
            const response = yield fetch(url, { headers });
            const body = yield response.text();
            if (!response.ok)
                throw Error(`GET <${url}> returned ${response.status}:\n${body}`);
            return body;
        });
    };
    /** this process over disk over network */
    function getDoc(cacheKey, url) {
        const remembered = fetchedPages.get(url);
        if (remembered !== undefined)
            return remembered;
        const body = readDoc(cacheKey, url);
        fetchedPages.set(url, body);
        return body;
    }
    function readDoc(cacheKey, url) {
        // fs is absent where there is no filesystem (a browser bundle stubs it
        // out), so an on-disk cache is only offered where one can exist
        if (options.cacheDir && fs && typeof fs.existsSync === "function") {
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
            if (siteInfo === null) {
                siteInfo = siteInfoByUrl.get(siteMatrixUrl) || null;
                if (siteInfo === null) {
                    siteInfo = siteInfoFromSitematrix(JSON.parse(getDoc("sitematrix", siteMatrixUrl)));
                    siteInfoByUrl.set(siteMatrixUrl, siteInfo);
                }
            }
            return siteInfo(siteId);
        },
    });
    const NS = converter.namespaces;
    const store = new N3.Store();
    /** entity ids whose pages are in the store */
    const loaded = new Set();
    /** the caller's own pages, by the id each one is the page of */
    const supplied = new Map();
    (options.pages || []).forEach((text, i) => {
        let doc;
        try {
            doc = asEntityDoc(JSON.parse(text));
        }
        catch (e) {
            throw Error(`supplied entity page ${i} is not an entity: ${e.message}`);
        }
        for (const id of Object.keys(doc.entities))
            supplied.set(id, doc);
    });
    /** the pages this DB has read, by the id each is the page of */
    const pageTexts = new Map();
    /**
     * Load the sitematrix, if this page will want it.
     *
     * The converter resolves sitelinks through a *synchronous* callback, so by
     * the time it asks there is nowhere left to await -- it has to be here or
     * not at all.  Only pages with sitelinks need it, so a walk over entities
     * that have none never fetches it.
     */
    function ensureSiteMatrixAsync(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            if (siteInfo !== null)
                return;
            const cached = siteInfoByUrl.get(siteMatrixUrl);
            if (cached !== undefined) {
                siteInfo = cached;
                return;
            }
            const entity = Object.values(doc.entities)[0];
            if (entity === undefined || entity.sitelinks === undefined
                || Object.keys(entity.sitelinks).length === 0)
                return;
            let text = fetchedPages.get(siteMatrixUrl);
            if (text === undefined) {
                text = yield fetchDocAsync(siteMatrixUrl);
                fetchedPages.set(siteMatrixUrl, text);
            }
            siteInfo = siteInfoFromSitematrix(JSON.parse(text));
            siteInfoByUrl.set(siteMatrixUrl, siteInfo);
        });
    }
    /** the same, awaiting the network rather than blocking on it */
    function ensureLoadedAsync(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (loaded.has(id))
                return;
            let doc = supplied.get(id);
            if (doc === undefined) {
                const url = entityDataUrl(id);
                let text = fetchedPages.get(url);
                if (text === undefined) {
                    text = yield fetchDocAsync(url);
                    fetchedPages.set(url, text);
                }
                pageTexts.set(id, text);
                doc = JSON.parse(text);
            }
            yield ensureSiteMatrixAsync(doc);
            store.addQuads(converter.entityToQuads(doc, id));
            loaded.add(id);
            const returned = Object.keys(doc.entities)[0];
            if (returned !== id)
                loaded.add(returned);
        });
    }
    /**
     * A neighborhood, fetching the entity page first if this is a node the DB
     * hasn't got.
     *
     * Which is the only thing here that can need the network.  Everything the
     * walk does *within* an entity -- its statements, their qualifiers, their
     * values -- is already in the page that was fetched for it, so this awaits
     * only where the validation crosses from one entity to another.
     */
    function getNeighborhoodAsync(point, shapeLabel, _shape) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = Date.now();
            const token = queryTracker ? queryTracker.start(false, point, shapeLabel) : null;
            try {
                const id = entityOf(point);
                if (id !== null)
                    yield ensureLoadedAsync(id);
                else
                    refuseUnknownNode(point);
            }
            catch (e) {
                // fetching the page is what this costs and what can fail, so it is
                // inside the window: a host recording the walk hears about both
                if (queryTracker && queryTracker.fail)
                    queryTracker.fail(e, Date.now() - startTime, token);
                throw e;
            }
            return neighborhoodFromStore(point, shapeLabel, startTime, token);
        });
    }
    function ensureLoaded(id) {
        if (loaded.has(id))
            return;
        // a page the caller supplied is the page: it says what the entity would
        // be if their edit were made, which is the thing being validated
        let doc = supplied.get(id);
        if (doc === undefined) {
            const text = getDoc(id, entityDataUrl(id));
            pageTexts.set(id, text);
            doc = JSON.parse(text);
        }
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
        const startTime = Date.now();
        const token = queryTracker ? queryTracker.start(false, point, shapeLabel) : null;
        try {
            const id = entityOf(point);
            if (id !== null)
                ensureLoaded(id);
            else
                refuseUnknownNode(point);
        }
        catch (e) {
            if (queryTracker && queryTracker.fail)
                queryTracker.fail(e, Date.now() - startTime, token);
            throw e;
        }
        return neighborhoodFromStore(point, shapeLabel, startTime, token);
    }
    /** A node this DB never loaded a page for and cannot name one from. */
    function refuseUnknownNode(point) {
        if (mintedHere(point) &&
            store.countQuads(point, null, null, null) === 0 &&
            store.countQuads(null, null, point, null) === 0)
            throw new EntityResolutionError(`${point.termType === "BlankNode" ? "_:" + point.value : "<" + point.value + ">"} ` +
                `is not in any entity page this DB has loaded, and its name doesn't say ` +
                `which page to fetch; walk in through the entity's statements instead`);
    }
    /** The arcs, once the page they are in is here: both faces do this half
     * the same way, and report it under the request that opened it. */
    function neighborhoodFromStore(point, shapeLabel, startTime, token) {
        const outgoing = store.getQuads(point, null, null, null)
            .sort((l, r) => (0, neighborhood_api_1.sparqlOrder)(l.object, r.object));
        if (queryTracker) {
            const now = Date.now();
            queryTracker.end(outgoing, now - startTime, token);
            startTime = now;
            token = queryTracker.start(true, point, shapeLabel);
        }
        const incoming = store.getQuads(null, null, point, null)
            .sort((l, r) => (0, neighborhood_api_1.sparqlOrder)(l.object, r.object));
        if (queryTracker)
            queryTracker.end(incoming, Date.now() - startTime, token);
        return { outgoing, incoming };
    }
    /** Entities this DB could offer a WebApp's focus-node input, matched by
     * id or by label.  Only the pages already loaded: this is typeahead over
     * what the session has seen, not a search of all of Wikidata (which would
     * be the wbsearchentities API, and asynchronous). */
    function suggestFocusNodes(prefix, limit) {
        const wanted = prefix.replace(/^(wd:|<?https?:\/\/\S*\/entity\/)/, "").toLowerCase();
        const out = [];
        // pages the caller supplied are what they came to validate, so offer
        // them whether or not the walk has reached them yet
        for (const id of new Set([...(options.entities || []), ...supplied.keys(), ...loaded])) {
            const label = loaded.has(id)
                ? labelOf(DataFactory.namedNode(NS.wd + id), "en")
                : supplied.has(id) ? labelIn(supplied.get(id), id, "en") : null;
            if (id.toLowerCase().startsWith(wanted) ||
                (label !== null && label.toLowerCase().startsWith(wanted))) {
                out.push({ label: NS.wd + id, detail: label || undefined, type: "class" });
                if (out.length >= limit)
                    break;
            }
        }
        return out;
    }
    /** The label to show a reader of `language`.  Falling back through `mul`
     * matters more on Wikidata than it looks: a name that reads the same in
     * every language is now stored once as language-neutral `mul` rather than
     * copied per language, so an entity can have 75 labels and no `en` one
     * (Q42 is exactly this). */
    function labelOf(term, language) {
        const labels = store.getObjects(term, DataFactory.namedNode(RDFS_LABEL), null);
        const inLanguage = (want) => labels.find(l => l.language === want);
        const found = inLanguage(language.toLowerCase())
            || inLanguage(language.toLowerCase().split("-")[0])
            || inLanguage("mul");
        return found ? found.value : labels.length > 0 ? labels[0].value : null;
    }
    return {
        getNeighborhood,
        getNeighborhoodAsync,
        getSubjects: () => store.getSubjects(null, null, null),
        getPredicates: () => store.getPredicates(null, null, null),
        getObjects: () => store.getObjects(null, null, null),
        getQuads: (...args) => store.getQuads(...args),
        get size() { return store.size; },
        suggestFocusNodes,
        labelOf,
        loadedPages,
        entityIri: (id) => NS.wd + id,
        locateDocument,
    };
    /** This source's document is an entity page, so a host asking where the
     * data was written gets the page located and converted -- the same
     * side table a Turtle parser would hand back, over the same quads. */
    function locateDocument(text) {
        if (text.trim() === "")
            return null;
        let locations;
        try {
            locations = (0, json_locations_1.locateJson)(text);
        }
        catch (e) {
            return null; // not JSON: some other pane of this source's, or nothing yet
        }
        // a converter of its own: this one records where everything came from
        const locating = (0, wikibase_rdf_1.wikibaseRdfConverter)(DataFactory, {
            conceptBase, dataBase,
            repositoryName: options.repositoryName,
            commonsMediaBase: options.commonsMediaBase,
            commonsDataBase: options.commonsDataBase,
            license: options.license,
            locations,
            siteInfo: siteId => {
                if (siteInfo === null)
                    siteInfo = siteInfoFromSitematrix(JSON.parse(getDoc("sitematrix", siteMatrixUrl)));
                return siteInfo(siteId);
            },
        });
        try {
            return { text, quads: locating.entityToQuads(asEntityDoc(locations.value)),
                provenance: locating.provenance, diagnostics: [] };
        }
        catch (e) {
            return {
                text, quads: [], provenance: { get: () => [], size: 0 },
                diagnostics: [{ from: 0, to: Math.min(text.length, 1), severity: "error",
                        message: "not an entity page: " + e.message }],
            };
        }
    }
    /** The pages this DB fetched, ready to be looked at: readably indented,
     * one per entity a walk reached.  A host that offers to record what a
     * validation fetched (the WebApp's slurp) hands each of these back as a
     * document, so what was read can be edited and validated again. */
    function loadedPages() {
        const out = [];
        for (const [id, text] of pageTexts) {
            try {
                out.push({ id, text: JSON.stringify(JSON.parse(text), null, 2) + "\n" });
            }
            catch (e) {
                out.push({ id, text }); // unparseable: hand back what arrived
            }
        }
        return out;
    }
}
const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label";
/** An entity page either as `Special:EntityData` serves it or as the entity
 * alone, which is what someone hand-editing one tends to have. */
function asEntityDoc(parsed) {
    if (parsed && typeof parsed === "object" && parsed.entities)
        return parsed;
    if (parsed && typeof parsed === "object" && typeof parsed.id === "string")
        return { entities: { [parsed.id]: parsed } };
    throw Error(`expected {"entities": {...}} or an entity with an "id"`);
}
/** The label a JSON entity gives itself, through Wikidata's language-neutral
 * "mul" -- see labelOf, which does the same over converted RDF. */
function labelIn(doc, id, language) {
    const labels = (doc.entities[id] || {}).labels || {};
    const found = labels[language.toLowerCase()]
        || labels[language.toLowerCase().split("-")[0]]
        || labels.mul
        || Object.values(labels)[0];
    return found ? found.value : null;
}
exports.name = "neighborhood-wikibase";
exports.label = "Wikibase JSON";
exports.description = "Implementation of @shexjs/neighborhood-api which synthesizes a Wikibase's RDF from entity JSON pages";
exports.capabilities = ["query", "translate"];
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
exports.queryMapResolvers = [{
        language: "http://www.w3.org/ns/shex#Extensions-qentities",
        name: "QENTITIES",
        description: "the focus nodes are the entities with these ids",
        resolve: (lexical, db) => {
            const iri = db.entityIri ||
                ((id) => "http://www.wikidata.org/entity/" + id);
            return lexical.trim().split(/\s+/).filter(word => word !== "").map(word => {
                const id = /^[QPLM]/i.test(word) ? word[0].toUpperCase() + word.substring(1) : "Q" + word;
                if (!/^[QPLM]\d+$/.test(id))
                    throw Error(`"${word}" is not an entity id: QENTITIES takes ids like Q42, or bare numbers`);
                return DataFactory.namedNode(iri(id));
            });
        },
    }];
exports.ctor = wikibaseDB;
/** What it takes to construct this DB, declared for hosts that offer several
 * neighborhood implementations (STRAWMAN, see @shexjs/neighborhood-api). */
/** What an entity page opened from scratch starts as: the shape of the
 * thing, with the id to fill in and one empty statement group. */
const ENTITY_TEMPLATE = JSON.stringify({
    entities: {
        Q0: {
            type: "item",
            id: "Q0",
            labels: { en: { language: "en", value: "" } },
            claims: {},
        },
    },
}, null, 2) + "\n";
exports.dbParams = [
    { name: "base", selector: true, required: true,
        description: "where entity pages live: <base><id>.json names each page " +
            "(e.g. https://www.wikidata.org/wiki/Special:EntityData/ or a file: directory of captured pages)",
        schema: { type: "string", format: "uri" },
        cli: { option: "wikibase", typeLabel: "IRI" } },
    { name: "sitematrix",
        description: "where the site matrix lives (site id -> URL/language/group, needed for sitelink RDF); " +
            "defaults to the wikidata API",
        schema: { type: "string", format: "uri" },
        cli: { option: "wikibase-sitematrix", typeLabel: "IRI" } },
    { name: "cacheDir",
        description: "keep fetched entity pages on disk here",
        schema: { type: "string", format: "file-path" },
        ui: { hidden: true }, // a browser has no disk to cache on
        cli: { option: "wikibase-cache", typeLabel: "dir" } },
    { name: "pages", selector: true,
        description: "entity pages to believe instead of what the site serves, " +
            "so an edit can be validated before it is made",
        schema: { type: "array", items: { type: "string", format: "uri", contentMediaType: "application/json" } },
        // as many as the user opens: what is being checked is a constellation
        // of entities, and how many of them there are is theirs to say
        pane: {
            label: "entity JSON",
            editor: { language: "json" },
            min: 0, creatable: true,
            template: ENTITY_TEMPLATE,
            titleOf: (text) => {
                try {
                    return Object.keys(asEntityDoc(JSON.parse(text)).entities)[0] || null;
                }
                catch (e) {
                    return null; // half-typed, or not an entity page
                }
            },
        },
        cli: { option: "wikibase-page", typeLabel: "file|URL" } },
];
function fromParams(params, queryTracker) {
    return wikibaseDB(queryTracker, {
        entityDataUrl: params.base === undefined ? undefined : (id) => `${params.base}${id}.json`,
        siteMatrixUrl: params.sitematrix,
        cacheDir: params.cacheDir,
        pages: params.pages,
    });
}
/** Sort documents a host was handed into the panes they belong in.  This
 * source has one pane, so what that comes to is: an entity page is a page,
 * and anything else is not a document of this source's at all -- which
 * entities to visit is the query map's to say.  A host with documents and
 * no idea which parameter they are for (a manifest entry's `data`, a
 * dropped file) asks this. */
function distributeDocuments(texts) {
    const pages = [];
    for (const text of texts) {
        let doc = null;
        try {
            doc = asEntityDoc(JSON.parse(text));
        }
        catch (e) {
            continue; // not a page: nothing here holds it
        }
        // re-serialized so a downloaded page arrives readable rather than as
        // one enormous line
        pages.push(JSON.stringify(doc, null, 2) + "\n");
    }
    return { pages };
}
/** `# Wikibase` on the first line means "synthesize entity pages rather
 * than parsing me"; a URL after it says which Wikibase.
 *
 * `# Wikidata` too, which is what this source was called when Wikidata was
 * the only instance it knew: a document saved with that header still names
 * this source, and is still read by it. */
const WIKIBASE_HEADER = /^([ \t]*#?[ \t]*Wiki(?:base|data)[ \t]*:?[ \t]*)(\S*)(.*)$/im;
const KNOWN_BASES = [
    { label: "https://www.wikidata.org/wiki/Special:EntityData/", detail: "Wikidata" },
    { label: "https://test.wikidata.org/wiki/Special:EntityData/", detail: "Wikidata test instance" },
    { label: "https://commons.wikimedia.org/wiki/Special:EntityData/", detail: "Wikimedia Commons" },
];
function claimPaneText(text) {
    const m = text.match(WIKIBASE_HEADER);
    if (!m || m.index !== 0)
        return null;
    return m[2] === "" ? {} : { base: m[2] }; // bare header: the default base
}
/** The pane's body is whatever was slurped back, so the host's Turtle
 * carries it; this module describes its own header, and -- the part no host
 * could supply -- completes entity IRIs from the labels of the pages the DB
 * has actually loaded. */
exports.paneEditor = {
    language: "turtle",
    tokens(text) {
        const m = text.match(WIKIBASE_HEADER);
        if (!m || m.index !== 0)
            return [];
        const base = m[2];
        const tokens = [{ from: 0, to: m[1].length, style: "keyword" }];
        if (base !== "")
            tokens.push({ from: m[1].length, to: m[1].length + base.length,
                style: isEntityDataBase(base) ? "link" : "invalid" });
        return tokens;
    },
    lint(text) {
        const m = text.match(WIKIBASE_HEADER);
        if (!m || m.index !== 0)
            return [];
        const [from, to] = [m[1].length, m[1].length + m[2].length];
        if (m[2] !== "" && !isEntityDataBase(m[2]))
            return [{ from, to, severity: "error",
                    message: `"${m[2]}" is not an http(s) or file URL; entity pages are fetched from ` +
                        `<base><id>.json, so the base needs a trailing delimiter too` }];
        return [];
    },
    complete(text, pos, ctx) {
        const lineStart = text.lastIndexOf("\n", pos - 1) + 1;
        const claimed = claimPaneText(text) !== null;
        if (lineStart === 0 && !claimed)
            return { from: 0, to: pos,
                options: [{ label: "# Wikibase: ", type: "keyword",
                        detail: "synthesize entity pages instead of parsing this pane" }] };
        if (lineStart === 0 && claimed) {
            // completing the base on the header line
            const m = text.match(WIKIBASE_HEADER);
            if (pos >= m[1].length)
                return { from: m[1].length, to: m[1].length + m[2].length,
                    options: KNOWN_BASES.map(b => (Object.assign(Object.assign({}, b), { type: "namespace" }))) };
            return null;
        }
        // an entity IRI anywhere else: only this DB knows that Q42 is Douglas Adams
        const db = ctx && ctx.db;
        if (!db || typeof db.suggestFocusNodes !== "function")
            return null;
        const before = text.substring(lineStart, pos);
        const word = before.match(/(?:<|wd:)?[A-Za-z]*\d*$/);
        if (!word || word[0] === "")
            return null;
        const options = db.suggestFocusNodes(word[0].replace(/^</, ""), 20);
        return options.length
            ? { from: lineStart + word.index, to: pos, options }
            : null;
    },
};
function isEntityDataBase(base) {
    return /^(https?|file):\/\/\S*[/=:]$/.test(base);
}
/**
 * The asynchronous face of one of these, for ShExValidator.validateShapeMapAsync.
 *
 * The db is the same db -- same store, same cache, same loaded pages -- with
 * getNeighborhood answering with a promise, so it fetches with fetch() rather
 * than with a synchronous XMLHttpRequest that blocks the tab.  It awaits only
 * when the walk crosses into an entity page it hasn't got.
 */
function asAsyncDb(db) {
    // delegate, don't copy: `size` and friends are getters over the live store,
    // and Object.assign would call each one once and freeze the answer -- a db
    // that reported 0 quads forever, having been copied before it loaded
    // anything.
    return Object.create(db, {
        getNeighborhood: {
            value: db.getNeighborhoodAsync.bind(db), enumerable: true, configurable: true,
        },
    });
}
//# sourceMappingURL=neighborhood-wikibase.js.map