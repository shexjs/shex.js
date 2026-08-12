"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.description = exports.name = exports.WIKIBASE = exports.GEO = exports.CC = exports.PROV = exports.SCHEMA = exports.SKOS = exports.OWL = exports.RDFS = exports.XSD = exports.RDF = void 0;
exports.phpFloatStr = phpFloatStr;
exports.phpUrlencode = phpUrlencode;
exports.wfUrlencode = wfUrlencode;
exports.utf8Length = utf8Length;
exports.valueNodeHash = valueNodeHash;
exports.cleanTimeValue = cleanTimeValue;
exports.wikibaseRdfConverter = wikibaseRdfConverter;
const md5_1 = require("./md5");
exports.RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
exports.XSD = "http://www.w3.org/2001/XMLSchema#";
exports.RDFS = "http://www.w3.org/2000/01/rdf-schema#";
exports.OWL = "http://www.w3.org/2002/07/owl#";
exports.SKOS = "http://www.w3.org/2004/02/skos/core#";
exports.SCHEMA = "http://schema.org/";
exports.PROV = "http://www.w3.org/ns/prov#";
exports.CC = "http://creativecommons.org/ns#";
exports.GEO = "http://www.opengis.net/ont/geosparql#";
exports.WIKIBASE = "http://wikiba.se/ontology#";
const CALENDAR_GREGORIAN = "http://www.wikidata.org/entity/Q1985727";
const CALENDAR_JULIAN = "http://www.wikidata.org/entity/Q1985786";
/** wikibase:quantityUnit for a unit of "1" (dimensionless). */
const UNIT_ONE = "http://www.wikidata.org/entity/Q199";
const EARTH = "http://www.wikidata.org/entity/Q2";
// ── PHP compatibility ───────────────────────────────────────────────────────
// The derived names above hash PHP serializations, so the byte-for-byte
// quirks of PHP's formatting are part of the data model.
/** PHP's default float rendering: up to 14 significant digits, trailing
 * zeros dropped, exponent notation ("1.0E-5", capital E, always a signed
 * exponent, mantissa always with a decimal point) outside [1e-4, 1e14). */
function phpFloatStr(x) {
    if (Number.isNaN(x))
        return "NAN";
    if (x === Infinity)
        return "INF";
    if (x === -Infinity)
        return "-INF";
    if (x === 0)
        return Object.is(x, -0) ? "-0" : "0";
    const neg = x < 0 ? "-" : "";
    const a = Math.abs(x);
    let [mant, expStr] = a.toExponential(13).split("e");
    const exp = parseInt(expStr, 10);
    if (mant.indexOf(".") !== -1)
        mant = mant.replace(/0+$/, "").replace(/\.$/, "");
    if (exp >= 14 || exp < -4) {
        if (mant.indexOf(".") === -1)
            mant += ".0";
        return neg + mant + "E" + (exp < 0 ? "-" : "+") + Math.abs(exp);
    }
    let s = a.toPrecision(14);
    if (s.indexOf(".") !== -1)
        s = s.replace(/0+$/, "").replace(/\.$/, "");
    return neg + s;
}
/** PHP rawurlencode: %XX for everything but A-Za-z0-9-_.~ */
function phpUrlencode(s) {
    return encodeURIComponent(s).replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}
/** MediaWiki's wfUrlencode, used in page URLs: rawurlencode with the
 * characters MediaWiki considers safe in titles put back. */
function wfUrlencode(s) {
    return phpUrlencode(s).replace(/%3B|%40|%24|%21|%2A|%28|%29|%2C|%2F|%7E|%3A/gi, m => decodeURIComponent(m));
}
/** How many bytes a string is in UTF-8, which is what PHP's serialization
 * counts.  Not `Buffer.byteLength`: this runs in a browser too, where there
 * is no Buffer -- and a length that is quietly wrong would move every hash
 * that depends on it. */
function utf8Length(text) {
    let bytes = 0;
    for (let i = 0; i < text.length; ++i) {
        const code = text.charCodeAt(i);
        if (code < 0x80)
            bytes += 1;
        else if (code < 0x800)
            bytes += 2;
        else if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length &&
            (text.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
            bytes += 4; // a surrogate pair is one 4-byte character
            ++i;
        }
        else {
            // a lone surrogate encodes as U+FFFD, which is 3 bytes either way
            bytes += 3;
        }
    }
    return bytes;
}
const utf8Len = utf8Length;
/** PHP json_encode: like JSON.stringify but "/" is escaped. */
const phpJson = (v) => JSON.stringify(v).replace(/\//g, "\\/");
/** PHP serialize() of a string. */
const phpStr = (s) => `s:${utf8Len(s)}:"${s}";`;
/** PHP serialize() of a pre-7.4 Serializable object: the class wraps
 * whatever its serialize() method returned. */
const phpC = (cls, data) => `C:${cls.length}:"${cls}":${utf8Len(data)}:{${data}}`;
const phpDecimal = (s) => phpC("DataValues\\DecimalValue", phpStr(s));
/** The 32-hex name of the `wdv:` node for a complex datavalue. */
function valueNodeHash(dv) {
    const v = dv.value;
    switch (dv.type) {
        case "time":
            return (0, md5_1.md5)(phpC("DataValues\\TimeValue", phpJson([v.time, v.timezone, v.before, v.after, v.precision, v.calendarmodel])));
        case "quantity": {
            const bounded = v.upperBound != null || v.lowerBound != null;
            const data = bounded
                ? `a:4:{i:0;${phpDecimal(v.amount)}i:1;${phpStr(v.unit)}` +
                    `i:2;${phpDecimal(v.upperBound)}i:3;${phpDecimal(v.lowerBound)}}`
                : `a:2:{i:0;${phpDecimal(v.amount)}i:1;${phpStr(v.unit)}}`;
            return (0, md5_1.md5)(phpC(bounded ? "DataValues\\QuantityValue" : "DataValues\\UnboundedQuantityValue", data));
        }
        case "globecoordinate":
            return (0, md5_1.md5)(`${phpFloatStr(v.latitude)}|${phpFloatStr(v.longitude)}|` +
                `${v.precision == null ? "" : phpFloatStr(v.precision)}|${v.globe}`);
        default:
            throw Error(`no value node for datavalue type ${dv.type}`);
    }
}
// ── time cleaning ───────────────────────────────────────────────────────────
// Port of Wikibase's DateTimeValueCleaner and JulianDateTimeValueCleaner
// (including PHP ext/calendar's Julian/Gregorian SDN conversions), xsd11 mode.
const PRECISION_YEAR = 9, PRECISION_MONTH = 10, PRECISION_DAY = 11;
function parseDateValue(dateValue) {
    const t = dateValue.indexOf("T");
    if (t === -1)
        return null;
    const date = dateValue.substring(0, t), time = dateValue.substring(t + 1);
    const minus = date[0] === "-" ? "-" : "";
    const parts = date.substring(1).split("-");
    if (parts.length < 3)
        return null;
    const y = parts[0].replace(/^0+/, "");
    let m = parseInt(parts[1], 10) || 0;
    let d = parseInt(parts[2], 10) || 0;
    if (m <= 0)
        m = 1;
    if (m >= 12)
        m = 12;
    if (d <= 0)
        d = 1;
    if (y === "")
        return null; // year 0 is invalid (T94064)
    return { minus, y, m, d, time };
}
const GREGORIAN_MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function gregorianDaysInMonth(m, y) {
    if (m !== 2)
        return GREGORIAN_MONTH_DAYS[m - 1];
    return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28;
}
function cleanupGregorianValue(dateValue, precision) {
    const parsed = parseDateValue(dateValue);
    if (parsed === null)
        return null;
    let { minus, y, m, d } = parsed;
    if (precision <= PRECISION_YEAR) {
        d = 1;
        m = 1;
    }
    else if (precision === PRECISION_MONTH) {
        d = 1;
    }
    if (!(d <= 28 || (m !== 2 && d <= 30))) {
        // clamp the day to the last day in the month, over a year value squeezed
        // into the range PHP's calendar functions accept
        let safeYear;
        if (minus && parseFloat(y) >= 4714)
            safeYear = -4713;
        else
            safeYear = (y.length >= 10 ? parseInt("1" + y.substring(y.length - 5), 10) : parseInt(y, 10))
                * (minus ? -1 : 1);
        const max = gregorianDaysInMonth(m, safeYear);
        if (d > max)
            d = max;
    }
    if (precision >= PRECISION_YEAR && minus) {
        // XSD 1.1 has a year 0 (1 BCE), so BCE years shift up by one
        y = String(Number(y) - 1);
        if (y === "0")
            minus = "";
    }
    return `${minus}${y.padStart(4, "0")}-${String(m).padStart(2, "0")}-` +
        `${String(d).padStart(2, "0")}T${parsed.time}`;
}
/** PHP ext/calendar JulianToSdn. */
function julianToSdn(month, day, year) {
    if (year === 0 || month < 1 || month > 12 || day < 1 || day > 31)
        return 0;
    let y = year < 0 ? year + 4801 : year + 4800;
    let m;
    if (month > 2) {
        m = month - 3;
    }
    else {
        m = month + 9;
        y--;
    }
    return Math.trunc(y * 1461 / 4) + Math.trunc((m * 153 + 2) / 5) + day - 32083;
}
/** PHP ext/calendar SdnToGregorian. */
function sdnToGregorian(sdn) {
    if (sdn <= 0)
        return null;
    let temp = (sdn + 32045) * 4 - 1;
    const century = Math.trunc(temp / 146097);
    temp = Math.trunc(temp % 146097 / 4) * 4 + 3;
    let y = century * 100 + Math.trunc(temp / 1461);
    const dayOfYear = Math.trunc(temp % 1461 / 4) + 1;
    temp = dayOfYear * 5 - 3;
    let m = Math.trunc(temp / 153);
    const d = Math.trunc(temp % 153 / 5) + 1;
    if (m < 10) {
        m += 3;
    }
    else {
        y++;
        m -= 9;
    }
    y -= 4800;
    if (y <= 0)
        y--;
    return { y, m, d };
}
function julianDateValue(dateValue) {
    const parsed = parseDateValue(dateValue);
    if (parsed === null)
        return null;
    const y = parsed.minus ? -Number(parsed.y) : Number(parsed.y);
    if (!Number.isSafeInteger(y) || y < -4713 || y > 1465072)
        return null;
    const sdn = julianToSdn(parsed.m, parsed.d, y);
    if (sdn === 0)
        return null;
    const g = sdnToGregorian(sdn);
    if (g === null)
        return null;
    let gy = g.y;
    if (gy < 0)
        gy++; // XSD 1.1 year numbering again
    return `${gy < 0 ? "-" : ""}${String(Math.abs(gy)).padStart(4, "0")}-` +
        `${String(g.m).padStart(2, "0")}-${String(g.d).padStart(2, "0")}T${parsed.time}`;
}
/** xsd:dateTime lexical form of a Wikibase time value, or null when there
 * isn't one (an unrecognized calendar at day precision). */
function cleanTimeValue(v) {
    if (v.calendarmodel === CALENDAR_JULIAN && v.precision >= PRECISION_DAY)
        // A Julian date PHP can't convert is assumed to have been meant Gregorian.
        return julianDateValue(v.time) || cleanupGregorianValue(v.time, v.precision);
    if (v.calendarmodel === CALENDAR_GREGORIAN || v.precision < PRECISION_DAY)
        return cleanupGregorianValue(v.time, v.precision);
    return null;
}
// ── the converter ───────────────────────────────────────────────────────────
/** Wikibase datatype -> wikibase:propertyType local name:
 * "wikibase-item" -> "WikibaseItem". */
function ontologyType(datatype) {
    return datatype.split("-").map(p => p.charAt(0).toUpperCase() + p.substring(1)).join("");
}
/** Datatypes whose simple values are IRIs; the rest are literals.  Decides
 * owl:ObjectProperty vs owl:DatatypeProperty on property pages. */
const OBJECT_DATATYPES = new Set([
    "wikibase-item", "wikibase-property", "wikibase-lexeme", "wikibase-form",
    "wikibase-sense", "url", "commonsMedia", "geo-shape", "tabular-data",
    "entity-schema",
]);
function wikibaseRdfConverter(dataFactory, options = {}) {
    const cb = options.conceptBase || "http://www.wikidata.org/";
    const dataBase = options.dataBase || "https://www.wikidata.org/wiki/Special:EntityData/";
    const repositoryName = options.repositoryName === undefined ? "wikidata" : options.repositoryName;
    const commonsMediaBase = options.commonsMediaBase || "http://commons.wikimedia.org/wiki/Special:FilePath/";
    const commonsDataBase = options.commonsDataBase || "http://commons.wikimedia.org/data/main/";
    const license = options.license || "http://creativecommons.org/publicdomain/zero/1.0/";
    const DF = dataFactory;
    const NS = {
        wd: cb + "entity/",
        wds: cb + "entity/statement/",
        wdv: cb + "value/",
        wdref: cb + "reference/",
        wdt: cb + "prop/direct/",
        wdtn: cb + "prop/direct-normalized/",
        p: cb + "prop/",
        ps: cb + "prop/statement/",
        psv: cb + "prop/statement/value/",
        psn: cb + "prop/statement/value-normalized/",
        pq: cb + "prop/qualifier/",
        pqv: cb + "prop/qualifier/value/",
        pqn: cb + "prop/qualifier/value-normalized/",
        pr: cb + "prop/reference/",
        prv: cb + "prop/reference/value/",
        prn: cb + "prop/reference/value-normalized/",
        wdno: cb + "prop/novalue/",
    };
    /** simple-value and value-node namespaces for each place a snak can sit */
    const FAMILIES = {
        direct: { simple: NS.wdt, value: null },
        statement: { simple: NS.ps, value: NS.psv },
        qualifier: { simple: NS.pq, value: NS.pqv },
        reference: { simple: NS.pr, value: NS.prv },
    };
    const iri = (v) => DF.namedNode(v);
    const a = iri(exports.RDF + "type");
    const string = (v) => DF.literal(v);
    // language tags are case-insensitive; lowercase is what an N3-parsed graph
    // carries, so emit that (schema:inLanguage keeps the canonical case, being
    // an ordinary string)
    const langLit = (v, lang) => DF.literal(v, lang.toLowerCase());
    const typed = (v, dt) => DF.literal(v, iri(dt));
    const integer = (v) => typed(String(v), exports.XSD + "integer");
    /** quad -> utterances, keyed canonically so that two equal quads (an RDF
     * set has one, a document may say it twice) share an entry */
    const provenance = new Map();
    const quadKey = (q) => [q.subject, q.predicate, q.object].map(term => term.termType === "BlankNode" ? "_:" + term.value
        : term.termType === "Literal"
            ? JSON.stringify([term.value, term.language,
                term.datatype && term.datatype.value])
            : "<" + term.value + ">").join(" ");
    const provenanceIndex = {
        get: (quad) => provenance.get(quadKey(quad)) || [],
        get size() { return provenance.size; },
    };
    function entityToQuads(doc, requestedId) {
        const ids = Object.keys(doc.entities);
        if (ids.length !== 1)
            throw Error(`expected one entity in the page, got [${ids.join(", ")}]`);
        const entity = doc.entities[ids[0]];
        const id = entity.id || ids[0];
        const quads = [];
        const located = options.locations;
        /** where the quads being emitted right now were written: set by each
         * emitter as it descends, so `add` doesn't have to be told every time */
        let where = {};
        const at = (path) => path && located ? located.at(path) : null;
        const nameAt = (path) => path && located ? located.nameAt(path) : null;
        const add = (s, p, o) => {
            const quad = DF.quad(s, p === "a" ? a : iri(p), o);
            quads.push(quad);
            if (!located)
                return;
            // a member's *name* is the nearest thing JSON has to a predicate; a
            // value that is an object is its whole {...}
            const utterance = {
                subject: at(where.s),
                predicate: nameAt(where.p) || at(where.p),
                object: at(where.o),
            };
            const key = quadKey(quad);
            const had = provenance.get(key);
            if (had)
                had.push(utterance);
            else
                provenance.set(key, [utterance]);
        };
        /** run `emit` with these paths as the source of what it emits */
        const from = (paths, emit) => {
            const outer = where;
            where = paths;
            try {
                emit();
            }
            finally {
                where = outer;
            }
        };
        const wd = iri(NS.wd + id);
        /** where this entity is in the page: everything below is relative */
        const ENTITY = ["entities", id];
        where = { s: ENTITY, o: ENTITY };
        const COMPLEX_VALUES = {
            time: emitTimeValueNode,
            quantity: emitQuantityValueNode,
            globecoordinate: emitGlobeValueNode,
        };
        if (requestedId !== undefined && requestedId !== id)
            // the page redirected; WDQS models redirects the same way
            add(iri(NS.wd + requestedId), exports.OWL + "sameAs", wd);
        emitDataHeader();
        emitEntity();
        return quads;
        function emitDataHeader() {
            const data = iri(dataBase + id);
            add(data, "a", iri(exports.SCHEMA + "Dataset"));
            add(data, exports.SCHEMA + "about", wd);
            add(data, exports.CC + "license", iri(license));
            add(data, exports.SCHEMA + "softwareVersion", string("1.0.0"));
            if (entity.lastrevid !== undefined)
                add(data, exports.SCHEMA + "version", integer(entity.lastrevid));
            if (entity.modified !== undefined)
                add(data, exports.SCHEMA + "dateModified", typed(entity.modified, exports.XSD + "dateTime"));
            const statements = Object.values(entity.claims || {});
            add(data, exports.WIKIBASE + "statements", integer(statements.reduce((n, sts) => n + sts.length, 0)));
            if (entity.type === "item") {
                add(data, exports.WIKIBASE + "sitelinks", integer(Object.keys(entity.sitelinks || {}).length));
                add(data, exports.WIKIBASE + "identifiers", integer(statements.reduce((n, sts) => n + sts.filter(st => st.mainsnak.datatype === "external-id").length, 0)));
            }
        }
        function emitEntity() {
            switch (entity.type) {
                case "item":
                    add(wd, "a", iri(exports.WIKIBASE + "Item"));
                    break;
                case "property":
                    add(wd, "a", iri(exports.WIKIBASE + "Property"));
                    emitPropertyOntology();
                    break;
                default:
                    throw Error(`entity type "${entity.type}" (${id}) is not supported yet`);
            }
            emitTerms();
            emitSitelinks();
            for (const [pid, statements] of Object.entries(entity.claims || {}))
                emitStatementGroup(pid, statements);
        }
        function emitTerms() {
            for (const [key, term] of Object.entries(entity.labels || {}))
                from({ s: ENTITY, p: ENTITY.concat("labels", key), o: ENTITY.concat("labels", key, "value") }, () => {
                    add(wd, exports.RDFS + "label", langLit(term.value, term.language));
                    add(wd, exports.SKOS + "prefLabel", langLit(term.value, term.language));
                    add(wd, exports.SCHEMA + "name", langLit(term.value, term.language));
                });
            for (const [key, term] of Object.entries(entity.descriptions || {}))
                from({ s: ENTITY, p: ENTITY.concat("descriptions", key),
                    o: ENTITY.concat("descriptions", key, "value") }, () => add(wd, exports.SCHEMA + "description", langLit(term.value, term.language)));
            for (const [key, aliases] of Object.entries(entity.aliases || {}))
                aliases.forEach((term, i) => from({ s: ENTITY, p: ENTITY.concat("aliases", key),
                    o: ENTITY.concat("aliases", key, i, "value") }, () => add(wd, exports.SKOS + "altLabel", langLit(term.value, term.language))));
        }
        function emitSitelinks() {
            const sitelinks = Object.values(entity.sitelinks || {});
            if (sitelinks.length === 0)
                return;
            if (!options.siteInfo)
                throw Error(`can't convert ${id}'s sitelinks without a siteInfo option ` +
                    `(the page names sites like "${sitelinks[0].site}" but the RDF needs their URLs)`);
            for (const { site, title, badges } of sitelinks) {
                where = { s: ENTITY.concat("sitelinks", site),
                    p: ENTITY.concat("sitelinks", site),
                    o: ENTITY.concat("sitelinks", site) };
                const info = options.siteInfo(site);
                if (!info)
                    throw Error(`unknown site "${site}" in ${id}'s sitelinks`);
                const article = iri(info.url + "/wiki/" + wfUrlencode(title.replace(/ /g, "_")));
                const home = info.url + "/";
                add(article, "a", iri(exports.SCHEMA + "Article"));
                add(article, exports.SCHEMA + "about", wd);
                add(article, exports.SCHEMA + "inLanguage", string(info.language));
                add(article, exports.SCHEMA + "isPartOf", iri(home));
                add(article, exports.SCHEMA + "name", langLit(title, info.language));
                for (const badge of badges || [])
                    add(article, exports.WIKIBASE + "badge", iri(NS.wd + badge));
                add(iri(home), exports.WIKIBASE + "wikiGroup", string(info.group));
            }
            where = { s: ENTITY, o: ENTITY };
        }
        function emitPropertyOntology() {
            const dt = entity.datatype;
            const propertyKind = OBJECT_DATATYPES.has(dt) ? "ObjectProperty" : "DatatypeProperty";
            add(wd, exports.WIKIBASE + "propertyType", iri(exports.WIKIBASE + ontologyType(dt)));
            const roles = [
                ["directClaim", NS.wdt], ["claim", NS.p],
                ["statementProperty", NS.ps], ["statementValue", NS.psv],
                ["qualifier", NS.pq], ["qualifierValue", NS.pqv],
                ["reference", NS.pr], ["referenceValue", NS.prv],
                ["novalue", NS.wdno],
            ];
            // normalization applies to external identifiers (formatter IRIs) and
            // quantities (unit conversion); wdtn: holds IRIs for the former,
            // converted amounts for the latter
            const normalizedKind = dt === "external-id" ? "ObjectProperty"
                : dt === "quantity" ? "DatatypeProperty" : null;
            if (normalizedKind !== null)
                roles.push(["directClaimNormalized", NS.wdtn], ["statementValueNormalized", NS.psn], ["qualifierValueNormalized", NS.pqn], ["referenceValueNormalized", NS.prn]);
            for (const [role, ns] of roles)
                add(wd, exports.WIKIBASE + role, iri(ns + id));
            for (const ns of [NS.p, NS.psv, NS.pqv, NS.prv])
                add(iri(ns + id), "a", iri(exports.OWL + "ObjectProperty"));
            for (const ns of [NS.wdt, NS.ps, NS.pq, NS.pr])
                add(iri(ns + id), "a", iri(exports.OWL + propertyKind));
            if (normalizedKind !== null) {
                for (const ns of [NS.psn, NS.pqn, NS.prn])
                    add(iri(ns + id), "a", iri(exports.OWL + "ObjectProperty"));
                add(iri(NS.wdtn + id), "a", iri(exports.OWL + normalizedKind));
            }
            const restriction = DF.blankNode((0, md5_1.md5)(`owl:complementOf-${repositoryName}-${id}`));
            add(iri(NS.wdno + id), "a", iri(exports.OWL + "Class"));
            add(iri(NS.wdno + id), exports.OWL + "complementOf", restriction);
            add(restriction, "a", iri(exports.OWL + "Restriction"));
            add(restriction, exports.OWL + "onProperty", iri(NS.wdt + id));
            add(restriction, exports.OWL + "someValuesFrom", iri(exports.OWL + "Thing"));
        }
        function emitStatementGroup(pid, statements) {
            // "truthy" wdt: arcs reflect only the best statements of a property:
            // the preferred ones, or all the normal ones when nothing is preferred
            const bestRank = statements.some(st => st.rank === "preferred") ? "preferred" : "normal";
            statements.forEach((st, index) => {
                const CLAIM = ENTITY.concat("claims", pid, index);
                const stLName = st.id.replace("$", "-");
                const wds = iri(NS.wds + stLName);
                // the statement node is that claim's whole object, the way a blank
                // node is its whole [ ... ]
                from({ s: ENTITY, p: ENTITY.concat("claims", pid), o: CLAIM }, () => add(wd, NS.p + pid, wds));
                from({ s: CLAIM, p: CLAIM, o: CLAIM }, () => {
                    add(wds, "a", iri(exports.WIKIBASE + "Statement"));
                    if (st.rank === bestRank)
                        add(wds, "a", iri(exports.WIKIBASE + "BestRank"));
                });
                from({ s: CLAIM, p: CLAIM.concat("rank"), o: CLAIM.concat("rank") }, () => add(wds, exports.WIKIBASE + "rank", iri(exports.WIKIBASE + st.rank.charAt(0).toUpperCase() + st.rank.substring(1) + "Rank")));
                const PROPERTY = ENTITY.concat("claims", pid);
                emitSnak(wds, stLName, st.mainsnak, "statement", CLAIM.concat("mainsnak"), CLAIM, PROPERTY);
                if (st.rank === bestRank)
                    emitSnak(wd, stLName, st.mainsnak, "direct", CLAIM.concat("mainsnak"), ENTITY, PROPERTY);
                for (const [qid, snaks] of Object.entries(st.qualifiers || {}))
                    snaks.forEach((snak, qi) => emitSnak(wds, stLName, snak, "qualifier", CLAIM.concat("qualifiers", qid, qi), CLAIM, CLAIM.concat("qualifiers", qid)));
                (st.references || []).forEach((ref, ri) => {
                    const REF = CLAIM.concat("references", ri);
                    const wdref = iri(NS.wdref + ref.hash);
                    from({ s: CLAIM, p: REF, o: REF }, () => {
                        add(wds, exports.PROV + "wasDerivedFrom", wdref);
                        add(wdref, "a", iri(exports.WIKIBASE + "Reference"));
                    });
                    for (const [rid, snaks] of Object.entries(ref.snaks || {}))
                        snaks.forEach((snak, si) => emitSnak(wdref, ref.hash, snak, "reference", REF.concat("snaks", rid, si), REF, REF.concat("snaks", rid)));
                });
            });
        }
        /** One snak onto `subject`: the simple value in the family's namespace,
         * plus (except for truthy wdt:) the wdv: node for structured values. */
        function emitSnak(subject, parentLName, snak, family, SNAK, SUBJECT, PROPERTY) {
            const { simple, value } = FAMILIES[family];
            const pid = snak.property;
            const VALUE = SNAK && SNAK.concat("datavalue", "value");
            // the property is named by the member that groups these snaks -- the
            // "P569" of claims, of qualifiers, of a reference's snaks
            where = { s: SUBJECT, p: PROPERTY, o: VALUE };
            switch (snak.snaktype) {
                case "value": {
                    const term = simpleValueTerm(snak.datavalue, snak.datatype);
                    if (term !== null)
                        add(subject, simple + pid, term);
                    if (value !== null && snak.datavalue.type in COMPLEX_VALUES) {
                        const node = iri(NS.wdv + valueNodeHash(snak.datavalue));
                        add(subject, value + pid, node);
                        // the value node's own arcs come from inside that value object
                        from({ s: VALUE, p: VALUE, o: VALUE }, () => COMPLEX_VALUES[snak.datavalue.type](node, snak.datavalue.value));
                    }
                    break;
                }
                case "somevalue":
                    // an unknown value is a blank node; the label is stable across
                    // serializations (md5 of parent + namespaces + snak hash)
                    add(subject, simple + pid, DF.blankNode((0, md5_1.md5)(`${parentLName}-${simple}-${NS.wdv}-${snak.hash}`)));
                    break;
                case "novalue":
                    add(subject, "a", iri(NS.wdno + pid));
                    break;
                default:
                    throw Error(`unknown snak type "${snak.snaktype}" on ${id} ${pid}`);
            }
        }
        function simpleValueTerm(dv, datatype) {
            const v = dv.value;
            switch (dv.type) {
                case "wikibase-entityid":
                    return iri(NS.wd + v.id);
                case "string":
                    switch (datatype) {
                        case "url": return iri(v);
                        case "commonsMedia": return iri(commonsMediaBase + phpUrlencode(v));
                        case "geo-shape":
                        case "tabular-data": return iri(commonsDataBase + wfUrlencode(v.replace(/ /g, "_")));
                        default: return string(v); // string, external-id, math, musical-notation ...
                    }
                case "monolingualtext":
                    return langLit(v.text, v.language);
                case "time": {
                    const cleaned = cleanTimeValue(v);
                    return cleaned === null ? null : typed(cleaned, exports.XSD + "dateTime");
                }
                case "quantity":
                    return typed(v.amount, exports.XSD + "decimal");
                case "globecoordinate":
                    return typed((v.globe === EARTH ? "" : `<${v.globe}> `) +
                        `Point(${phpFloatStr(v.longitude)} ${phpFloatStr(v.latitude)})`, exports.GEO + "wktLiteral");
                default:
                    throw Error(`unknown datavalue type "${dv.type}" (datatype ${datatype}) on ${id}`);
            }
        }
        function emitTimeValueNode(node, v) {
            add(node, "a", iri(exports.WIKIBASE + "TimeValue"));
            const cleaned = cleanTimeValue(v);
            if (cleaned !== null)
                add(node, exports.WIKIBASE + "timeValue", typed(cleaned, exports.XSD + "dateTime"));
            add(node, exports.WIKIBASE + "timePrecision", integer(v.precision));
            add(node, exports.WIKIBASE + "timeTimezone", integer(v.timezone));
            add(node, exports.WIKIBASE + "timeCalendarModel", iri(v.calendarmodel));
        }
        function emitQuantityValueNode(node, v) {
            add(node, "a", iri(exports.WIKIBASE + "QuantityValue"));
            add(node, exports.WIKIBASE + "quantityAmount", typed(v.amount, exports.XSD + "decimal"));
            if (v.upperBound != null)
                add(node, exports.WIKIBASE + "quantityUpperBound", typed(v.upperBound, exports.XSD + "decimal"));
            if (v.lowerBound != null)
                add(node, exports.WIKIBASE + "quantityLowerBound", typed(v.lowerBound, exports.XSD + "decimal"));
            add(node, exports.WIKIBASE + "quantityUnit", iri(v.unit === "1" ? UNIT_ONE : v.unit));
            // wikibase:quantityNormalized needs unit conversion tables; see the
            // module comment
        }
        function emitGlobeValueNode(node, v) {
            add(node, "a", iri(exports.WIKIBASE + "GlobecoordinateValue"));
            add(node, exports.WIKIBASE + "geoLatitude", typed(phpFloatStr(v.latitude), exports.XSD + "double"));
            add(node, exports.WIKIBASE + "geoLongitude", typed(phpFloatStr(v.longitude), exports.XSD + "double"));
            if (v.precision != null)
                add(node, exports.WIKIBASE + "geoPrecision", typed(phpFloatStr(v.precision), exports.XSD + "double"));
            add(node, exports.WIKIBASE + "geoGlobe", iri(v.globe));
        }
    }
    return { entityToQuads, namespaces: NS, provenance: provenanceIndex };
}
exports.name = "wikibase-rdf";
exports.description = "Wikibase entity JSON pages to WDQS-flavor RDF";
//# sourceMappingURL=wikibase-rdf.js.map