/** Synthesize, from a Wikibase entity's JSON page, the same RDF that the
 * Wikidata query service loads for that entity (what
 * `Special:EntityData/Q42.ttl?flavor=dump` serves).
 *
 * The JSON page is the primary artifact -- entities are edited and stored as
 * JSON -- and the RDF is derived from it by Wikibase's RDF builders.  This
 * module re-derives it, term for term, so a validator can walk RDF
 * neighborhoods without a SPARQL endpoint.  "Term for term" includes the
 * derived names, each reproduced from the Wikibase source and verified
 * against live dump output:
 *
 *   - value nodes (`wdv:<32 hex>`): md5 of the PHP-serialized DataValue.
 *     Time and quantity use the legacy `C:...:{...}` Serializable form
 *     (quantity nesting a legacy-serialized DecimalValue -- see
 *     `getSerializationForHash()` in data-values/number, added to freeze the
 *     hashes when PHP dropped `Serializable`); globe coordinates use
 *     `GlobeCoordinateValue::getHash()`'s `lat|long|precision|globe` string,
 *     whose floats are PHP's 14-significant-digit float rendering.
 *   - somevalue blank nodes: md5 of
 *     `<statement or reference local name>-<property namespace>-<value
 *     namespace>-<snak hash>` (SnakRdfBuilder::addSnak); the snak hash is in
 *     the JSON.
 *   - novalue class restrictions (property pages): md5 of
 *     `owl:complementOf-<repository name>-<property id>`, repository name
 *     "wikidata" (PropertyStubRdfBuilder::writeNovalueClass).
 *
 * Dates follow Wikibase's DateTimeValueCleaner/JulianDateTimeValueCleaner:
 * zeroed-out months and days become 01 below day precision, days are clamped
 * to the month's length, XSD 1.1 moves BCE years up by one, and day-or-finer
 * dates in the Julian calendar are converted to proleptic Gregorian (the
 * value node's `wikibase:timeValue` gets the *converted* date; only the
 * `wdv:` name hashes the original).
 *
 * Known, deliberate gaps -- all annotations WDQS adds from data *outside* the
 * entity's own page:
 *
 *   - normalized values (`wdtn:`/`psn:`/`pqn:`/`prn:` triples and
 *     `wikibase:quantityNormalized`) need the property registry's formatter
 *     IRIs (P1921) and unit conversion tables;
 *   - `math` values are emitted as their TeX source, where WDQS renders
 *     MathML;
 *   - lexemes have a different page shape and are not yet handled.
 *
 * The property-page *declarations* of the normalized predicates
 * (`wikibase:directClaimNormalized` etc.) are static and are emitted.
 */
import type * as RdfJs from "@rdfjs/types";
import {md5} from "./md5";
import {JsonPath, LocatedJson, SourceRange} from "./json-locations";

export const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
export const XSD = "http://www.w3.org/2001/XMLSchema#";
export const RDFS = "http://www.w3.org/2000/01/rdf-schema#";
export const OWL = "http://www.w3.org/2002/07/owl#";
export const SKOS = "http://www.w3.org/2004/02/skos/core#";
export const SCHEMA = "http://schema.org/";
export const PROV = "http://www.w3.org/ns/prov#";
export const CC = "http://creativecommons.org/ns#";
export const GEO = "http://www.opengis.net/ont/geosparql#";
export const WIKIBASE = "http://wikiba.se/ontology#";

const CALENDAR_GREGORIAN = "http://www.wikidata.org/entity/Q1985727";
const CALENDAR_JULIAN = "http://www.wikidata.org/entity/Q1985786";
/** wikibase:quantityUnit for a unit of "1" (dimensionless). */
const UNIT_ONE = "http://www.wikidata.org/entity/Q199";
const EARTH = "http://www.wikidata.org/entity/Q2";

/** What a sitelink's site id (e.g. "enwiki") expands to. */
export interface SiteInfo {
  /** origin without trailing slash, e.g. "https://en.wikipedia.org" */
  url: string;
  /** content language code, e.g. "en" or "be-tarask" */
  language: string;
  /** site group, e.g. "wikipedia" */
  group: string;
}

export interface WikibaseRdfOptions {
  /** concept URI base, default "http://www.wikidata.org/" */
  conceptBase?: string;
  /** where entity pages live; names the `data:` subject.
   * Default "https://www.wikidata.org/wiki/Special:EntityData/" */
  dataBase?: string;
  /** repository name Wikibase mixes into stable blank node labels on
   * property pages; "wikidata" for wikidata.org */
  repositoryName?: string;
  /** base for commonsMedia values, default
   * "http://commons.wikimedia.org/wiki/Special:FilePath/" */
  commonsMediaBase?: string;
  /** base for geo-shape and tabular-data values, default
   * "http://commons.wikimedia.org/data/main/" */
  commonsDataBase?: string;
  /** license the data: header claims, default CC0 */
  license?: string;
  /** the page as text, located (see ./json-locations), to record where each
   * quad was uttered; without it a conversion reports no provenance */
  locations?: LocatedJson;
  /** resolve a sitelink's site id; required to convert an entity that has
   * sitelinks (the page names sites "enwiki"-style but the RDF needs their
   * URLs and languages -- see the sitematrix handling in
   * neighborhood-wikidata) */
  siteInfo?: (siteId: string) => SiteInfo | undefined;
}

/** Which member of a datavalue's `value` object a simple (truthy, `ps:`,
 * `pq:`, `pr:`) arc's object is written as.  A value that is a plain string
 * is its own member, and a globe coordinate is composed of several, so
 * neither appears here. */
const SIMPLE_FROM: { [datavalueType: string]: string } = {
  time: "time",
  quantity: "amount",
  monolingualtext: "text",
  "wikibase-entityid": "id",
};

/** The body of a Special:EntityData/<id>.json page. */
export interface EntityDoc {
  entities: { [id: string]: any };
}

/** Where a quad was uttered: the spans of each position, exactly as a
 * Turtle parse reports them -- a list per position (a term can be written
 * in more than one piece, and a position not written at all is empty), and
 * the quad itself alongside.  Consumers read these without caring which
 * syntax produced them, so the shape is not ours to vary.
 *
 * A term written as a nested object gets the range of that object, braces
 * and all -- as Turtle gives a blank node the range of its whole
 * `[ ... ]`, so that a highlighter can mark the delimiters and leave the
 * contents to their own triples. */
export interface QuadUtterance {
  quad: RdfJs.Quad;
  subject: SourceRange[];
  predicate: SourceRange[];
  object: SourceRange[];
  graph: SourceRange[];
}

/** The side table a located conversion produces: quad -> utterances, with
 * the same shape (and the same multiset semantics -- a quad said twice has
 * two utterances) as lezer-turtle's provenance index. */
export interface ProvenanceIndex {
  get (quad: RdfJs.Quad): QuadUtterance[];
  readonly size: number;
}

// ── PHP compatibility ───────────────────────────────────────────────────────
// The derived names above hash PHP serializations, so the byte-for-byte
// quirks of PHP's formatting are part of the data model.

/** PHP's default float rendering: up to 14 significant digits, trailing
 * zeros dropped, exponent notation ("1.0E-5", capital E, always a signed
 * exponent, mantissa always with a decimal point) outside [1e-4, 1e14). */
export function phpFloatStr (x: number): string {
  if (Number.isNaN(x)) return "NAN";
  if (x === Infinity) return "INF";
  if (x === -Infinity) return "-INF";
  if (x === 0) return Object.is(x, -0) ? "-0" : "0";
  const neg = x < 0 ? "-" : "";
  const a = Math.abs(x);
  let [mant, expStr] = a.toExponential(13).split("e");
  const exp = parseInt(expStr, 10);
  if (mant.indexOf(".") !== -1) mant = mant.replace(/0+$/, "").replace(/\.$/, "");
  if (exp >= 14 || exp < -4) {
    if (mant.indexOf(".") === -1) mant += ".0";
    return neg + mant + "E" + (exp < 0 ? "-" : "+") + Math.abs(exp);
  }
  let s = a.toPrecision(14);
  if (s.indexOf(".") !== -1) s = s.replace(/0+$/, "").replace(/\.$/, "");
  return neg + s;
}

/** PHP rawurlencode: %XX for everything but A-Za-z0-9-_.~ */
export function phpUrlencode (s: string): string {
  return encodeURIComponent(s).replace(/[!'()*]/g,
    c => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

/** MediaWiki's wfUrlencode, used in page URLs: rawurlencode with the
 * characters MediaWiki considers safe in titles put back. */
export function wfUrlencode (s: string): string {
  return phpUrlencode(s).replace(
    /%3B|%40|%24|%21|%2A|%28|%29|%2C|%2F|%7E|%3A/gi,
    m => decodeURIComponent(m));
}

/** How many bytes a string is in UTF-8, which is what PHP's serialization
 * counts.  Not `Buffer.byteLength`: this runs in a browser too, where there
 * is no Buffer -- and a length that is quietly wrong would move every hash
 * that depends on it. */
export function utf8Length (text: string): number {
  let bytes = 0;
  for (let i = 0; i < text.length; ++i) {
    const code = text.charCodeAt(i);
    if (code < 0x80)
      bytes += 1;
    else if (code < 0x800)
      bytes += 2;
    else if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length &&
             (text.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
      bytes += 4;              // a surrogate pair is one 4-byte character
      ++i;
    } else {
      // a lone surrogate encodes as U+FFFD, which is 3 bytes either way
      bytes += 3;
    }
  }
  return bytes;
}

const utf8Len = utf8Length;
/** PHP json_encode: like JSON.stringify but "/" is escaped. */
const phpJson = (v: unknown) => JSON.stringify(v).replace(/\//g, "\\/");
/** PHP serialize() of a string. */
const phpStr = (s: string) => `s:${utf8Len(s)}:"${s}";`;
/** PHP serialize() of a pre-7.4 Serializable object: the class wraps
 * whatever its serialize() method returned. */
const phpC = (cls: string, data: string) => `C:${cls.length}:"${cls}":${utf8Len(data)}:{${data}}`;
const phpDecimal = (s: string) => phpC("DataValues\\DecimalValue", phpStr(s));

/** The 32-hex name of the `wdv:` node for a complex datavalue. */
export function valueNodeHash (dv: {type: string, value: any}): string {
  const v = dv.value;
  switch (dv.type) {
  case "time":
    return md5(phpC("DataValues\\TimeValue",
                    phpJson([v.time, v.timezone, v.before, v.after, v.precision, v.calendarmodel])));
  case "quantity": {
    const bounded = v.upperBound != null || v.lowerBound != null;
    const data = bounded
      ? `a:4:{i:0;${phpDecimal(v.amount)}i:1;${phpStr(v.unit)}` +
        `i:2;${phpDecimal(v.upperBound)}i:3;${phpDecimal(v.lowerBound)}}`
      : `a:2:{i:0;${phpDecimal(v.amount)}i:1;${phpStr(v.unit)}}`;
    return md5(phpC(bounded ? "DataValues\\QuantityValue" : "DataValues\\UnboundedQuantityValue", data));
  }
  case "globecoordinate":
    return md5(`${phpFloatStr(v.latitude)}|${phpFloatStr(v.longitude)}|` +
               `${v.precision == null ? "" : phpFloatStr(v.precision)}|${v.globe}`);
  default:
    throw Error(`no value node for datavalue type ${dv.type}`);
  }
}

// ── time cleaning ───────────────────────────────────────────────────────────
// Port of Wikibase's DateTimeValueCleaner and JulianDateTimeValueCleaner
// (including PHP ext/calendar's Julian/Gregorian SDN conversions), xsd11 mode.

const PRECISION_YEAR = 9, PRECISION_MONTH = 10, PRECISION_DAY = 11;

interface ParsedDate { minus: string, y: string, m: number, d: number, time: string }

function parseDateValue (dateValue: string): ParsedDate | null {
  const t = dateValue.indexOf("T");
  if (t === -1) return null;
  const date = dateValue.substring(0, t), time = dateValue.substring(t + 1);
  const minus = date[0] === "-" ? "-" : "";
  const parts = date.substring(1).split("-");
  if (parts.length < 3) return null;
  const y = parts[0].replace(/^0+/, "");
  let m = parseInt(parts[1], 10) || 0;
  let d = parseInt(parts[2], 10) || 0;
  if (m <= 0) m = 1;
  if (m >= 12) m = 12;
  if (d <= 0) d = 1;
  if (y === "") return null;                    // year 0 is invalid (T94064)
  return {minus, y, m, d, time};
}

const GREGORIAN_MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function gregorianDaysInMonth (m: number, y: number): number {
  if (m !== 2) return GREGORIAN_MONTH_DAYS[m - 1];
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28;
}

function cleanupGregorianValue (dateValue: string, precision: number): string | null {
  const parsed = parseDateValue(dateValue);
  if (parsed === null) return null;
  let {minus, y, m, d} = parsed;

  if (precision <= PRECISION_YEAR) {
    d = 1;
    m = 1;
  } else if (precision === PRECISION_MONTH) {
    d = 1;
  }

  if (!(d <= 28 || (m !== 2 && d <= 30))) {
    // clamp the day to the last day in the month, over a year value squeezed
    // into the range PHP's calendar functions accept
    let safeYear: number;
    if (minus && parseFloat(y) >= 4714)
      safeYear = -4713;
    else
      safeYear = (y.length >= 10 ? parseInt("1" + y.substring(y.length - 5), 10) : parseInt(y, 10))
        * (minus ? -1 : 1);
    const max = gregorianDaysInMonth(m, safeYear);
    if (d > max) d = max;
  }

  if (precision >= PRECISION_YEAR && minus) {
    // XSD 1.1 has a year 0 (1 BCE), so BCE years shift up by one
    y = String(Number(y) - 1);
    if (y === "0") minus = "";
  }

  return `${minus}${y.padStart(4, "0")}-${String(m).padStart(2, "0")}-` +
    `${String(d).padStart(2, "0")}T${parsed.time}`;
}

/** PHP ext/calendar JulianToSdn. */
function julianToSdn (month: number, day: number, year: number): number {
  if (year === 0 || month < 1 || month > 12 || day < 1 || day > 31) return 0;
  let y = year < 0 ? year + 4801 : year + 4800;
  let m;
  if (month > 2) {
    m = month - 3;
  } else {
    m = month + 9;
    y--;
  }
  return Math.trunc(y * 1461 / 4) + Math.trunc((m * 153 + 2) / 5) + day - 32083;
}

/** PHP ext/calendar SdnToGregorian. */
function sdnToGregorian (sdn: number): { y: number, m: number, d: number } | null {
  if (sdn <= 0) return null;
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
  } else {
    y++;
    m -= 9;
  }
  y -= 4800;
  if (y <= 0) y--;
  return {y, m, d};
}

function julianDateValue (dateValue: string): string | null {
  const parsed = parseDateValue(dateValue);
  if (parsed === null) return null;
  const y = parsed.minus ? -Number(parsed.y) : Number(parsed.y);
  if (!Number.isSafeInteger(y) || y < -4713 || y > 1465072) return null;
  const sdn = julianToSdn(parsed.m, parsed.d, y);
  if (sdn === 0) return null;
  const g = sdnToGregorian(sdn);
  if (g === null) return null;
  let gy = g.y;
  if (gy < 0) gy++;                             // XSD 1.1 year numbering again
  return `${gy < 0 ? "-" : ""}${String(Math.abs(gy)).padStart(4, "0")}-` +
    `${String(g.m).padStart(2, "0")}-${String(g.d).padStart(2, "0")}T${parsed.time}`;
}

/** xsd:dateTime lexical form of a Wikibase time value, or null when there
 * isn't one (an unrecognized calendar at day precision). */
export function cleanTimeValue (v: { time: string, precision: number, calendarmodel: string }): string | null {
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
function ontologyType (datatype: string): string {
  return datatype.split("-").map(p => p.charAt(0).toUpperCase() + p.substring(1)).join("");
}

/** Datatypes whose simple values are IRIs; the rest are literals.  Decides
 * owl:ObjectProperty vs owl:DatatypeProperty on property pages. */
const OBJECT_DATATYPES = new Set([
  "wikibase-item", "wikibase-property", "wikibase-lexeme", "wikibase-form",
  "wikibase-sense", "url", "commonsMedia", "geo-shape", "tabular-data",
  "entity-schema",
]);

export function wikibaseRdfConverter (dataFactory: RdfJs.DataFactory, options: WikibaseRdfOptions = {}) {
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
    direct: {simple: NS.wdt, value: null as string | null},
    statement: {simple: NS.ps, value: NS.psv},
    qualifier: {simple: NS.pq, value: NS.pqv},
    reference: {simple: NS.pr, value: NS.prv},
  };
  type Family = keyof typeof FAMILIES;

  const iri = (v: string) => DF.namedNode(v);
  const a = iri(RDF + "type");
  const string = (v: string) => DF.literal(v);
  // language tags are case-insensitive; lowercase is what an N3-parsed graph
  // carries, so emit that (schema:inLanguage keeps the canonical case, being
  // an ordinary string)
  const langLit = (v: string, lang: string) => DF.literal(v, lang.toLowerCase());
  const typed = (v: string, dt: string) => DF.literal(v, iri(dt));
  const integer = (v: number | string) => typed(String(v), XSD + "integer");

  /** quad -> utterances, keyed canonically so that two equal quads (an RDF
   * set has one, a document may say it twice) share an entry */
  const provenance = new Map<string, QuadUtterance[]>();
  const quadKey = (q: RdfJs.Quad) =>
    [q.subject, q.predicate, q.object].map(term =>
      term.termType === "BlankNode" ? "_:" + term.value
        : term.termType === "Literal"
        ? JSON.stringify([term.value, (term as RdfJs.Literal).language,
                          (term as RdfJs.Literal).datatype && (term as RdfJs.Literal).datatype.value])
        : "<" + term.value + ">").join(" ");

  const provenanceIndex: ProvenanceIndex = {
    get: (quad: RdfJs.Quad) => provenance.get(quadKey(quad)) || [],
    get size () { return provenance.size; },
  };

  function entityToQuads (doc: EntityDoc, requestedId?: string): RdfJs.Quad[] {
    const ids = Object.keys(doc.entities);
    if (ids.length !== 1)
      throw Error(`expected one entity in the page, got [${ids.join(", ")}]`);
    const entity = doc.entities[ids[0]];
    const id: string = entity.id || ids[0];

    const quads: RdfJs.Quad[] = [];
    const located = options.locations;
    /** where the quads being emitted right now were written: set by each
     * emitter as it descends, so `add` doesn't have to be told every time */
    let where: {s?: JsonPath, p?: JsonPath, o?: JsonPath} = {};
    const at = (path?: JsonPath) => path && located ? located.at(path) : null;
    const nameAt = (path?: JsonPath) => path && located ? located.nameAt(path) : null;
    const add = (s: RdfJs.Quad_Subject, p: string, o: RdfJs.Quad_Object) => {
      const quad = DF.quad(s, p === "a" ? a : iri(p), o);
      quads.push(quad);
      if (!located)
        return;
      // a member's *name* is the nearest thing JSON has to a predicate; a
      // value that is an object is its whole {...}
      const spans = (range: SourceRange | null) => range ? [range] : [];
      const utterance: QuadUtterance = {
        quad,
        subject: spans(at(where.s)),
        predicate: spans(nameAt(where.p) || at(where.p)),
        object: spans(at(where.o)),
        graph: [],
      };
      const key = quadKey(quad);
      const had = provenance.get(key);
      if (had)
        had.push(utterance);
      else
        provenance.set(key, [utterance]);
    };
    /** run `emit` with these paths as the source of what it emits */
    const from = (paths: {s?: JsonPath, p?: JsonPath, o?: JsonPath}, emit: () => void) => {
      const outer = where;
      where = paths;
      try {
        emit();
      } finally {
        where = outer;
      }
    };

    /** an arc a member of the value object states: that member names it and
     * holds its object, so `wikibase:timePrecision 11` marks "precision": 11
     * rather than the whole value again */
    const said = (name: string, emit: () => void) => {
      const V = where.o;
      from({s: where.s, p: V && V.concat(name), o: V && V.concat(name)}, emit);
    };
    const wd = iri(NS.wd + id);
    /** where this entity is in the page: everything below is relative */
    const ENTITY: JsonPath = ["entities", id];
    // an entity said as a subject is its "id", the way a Turtle subject is
    // the term that names it -- not the whole {...}, which is the document
    const ID: JsonPath = ENTITY.concat("id");
    where = {s: ID, o: ENTITY};

    const COMPLEX_VALUES: { [type: string]: (node: RdfJs.Quad_Subject, v: any) => void } = {
      time: emitTimeValueNode,
      quantity: emitQuantityValueNode,
      globecoordinate: emitGlobeValueNode,
    };

    if (requestedId !== undefined && requestedId !== id)
      // the page redirected; WDQS models redirects the same way
      add(iri(NS.wd + requestedId), OWL + "sameAs", wd);

    emitDataHeader();
    emitEntity();
    return quads;

    function emitDataHeader (): void {
      const data = iri(dataBase + id);
      add(data, "a", iri(SCHEMA + "Dataset"));
      add(data, SCHEMA + "about", wd);
      add(data, CC + "license", iri(license));
      add(data, SCHEMA + "softwareVersion", string("1.0.0"));
      if (entity.lastrevid !== undefined)
        add(data, SCHEMA + "version", integer(entity.lastrevid));
      if (entity.modified !== undefined)
        add(data, SCHEMA + "dateModified", typed(entity.modified, XSD + "dateTime"));
      const statements = Object.values(entity.claims || {}) as any[][];
      add(data, WIKIBASE + "statements", integer(statements.reduce((n, sts) => n + sts.length, 0)));
      if (entity.type === "item") {
        add(data, WIKIBASE + "sitelinks", integer(Object.keys(entity.sitelinks || {}).length));
        add(data, WIKIBASE + "identifiers", integer(statements.reduce(
          (n, sts) => n + sts.filter(st => st.mainsnak.datatype === "external-id").length, 0)));
      }
    }

    function emitEntity (): void {
      switch (entity.type) {
      case "item": add(wd, "a", iri(WIKIBASE + "Item")); break;
      case "property":
        add(wd, "a", iri(WIKIBASE + "Property"));
        emitPropertyOntology();
        break;
      default:
        throw Error(`entity type "${entity.type}" (${id}) is not supported yet`);
      }
      emitTerms();
      emitSitelinks();
      for (const [pid, statements] of Object.entries(entity.claims || {}))
        emitStatementGroup(pid, statements as any[]);
    }

    function emitTerms (): void {
      for (const [key, term] of Object.entries(entity.labels || {}) as [string, any][])
        from({s: ID, p: ENTITY.concat("labels", key), o: ENTITY.concat("labels", key, "value")}, () => {
          add(wd, RDFS + "label", langLit(term.value, term.language));
          add(wd, SKOS + "prefLabel", langLit(term.value, term.language));
          add(wd, SCHEMA + "name", langLit(term.value, term.language));
        });
      for (const [key, term] of Object.entries(entity.descriptions || {}) as [string, any][])
        from({s: ID, p: ENTITY.concat("descriptions", key),
              o: ENTITY.concat("descriptions", key, "value")}, () =>
          add(wd, SCHEMA + "description", langLit(term.value, term.language)));
      for (const [key, aliases] of Object.entries(entity.aliases || {}) as [string, any[]][])
        aliases.forEach((term, i) =>
          from({s: ID, p: ENTITY.concat("aliases", key),
                o: ENTITY.concat("aliases", key, i, "value")}, () =>
            add(wd, SKOS + "altLabel", langLit(term.value, term.language))));
    }

    function emitSitelinks (): void {
      const sitelinks = Object.values(entity.sitelinks || {}) as any[];
      if (sitelinks.length === 0) return;
      if (!options.siteInfo)
        throw Error(`can't convert ${id}'s sitelinks without a siteInfo option ` +
                    `(the page names sites like "${sitelinks[0].site}" but the RDF needs their URLs)`);
      for (const {site, title, badges} of sitelinks) {
        where = {s: ENTITY.concat("sitelinks", site),
                 p: ENTITY.concat("sitelinks", site),
                 o: ENTITY.concat("sitelinks", site)};
        const info = options.siteInfo(site);
        if (!info)
          throw Error(`unknown site "${site}" in ${id}'s sitelinks`);
        const article = iri(info.url + "/wiki/" + wfUrlencode(title.replace(/ /g, "_")));
        const home = info.url + "/";
        add(article, "a", iri(SCHEMA + "Article"));
        add(article, SCHEMA + "about", wd);
        add(article, SCHEMA + "inLanguage", string(info.language));
        add(article, SCHEMA + "isPartOf", iri(home));
        add(article, SCHEMA + "name", langLit(title, info.language));
        for (const badge of badges || [])
          add(article, WIKIBASE + "badge", iri(NS.wd + badge));
        add(iri(home), WIKIBASE + "wikiGroup", string(info.group));
      }
      where = {s: ID, o: ENTITY};
    }

    function emitPropertyOntology (): void {
      const dt: string = entity.datatype;
      const propertyKind = OBJECT_DATATYPES.has(dt) ? "ObjectProperty" : "DatatypeProperty";
      add(wd, WIKIBASE + "propertyType", iri(WIKIBASE + ontologyType(dt)));
      const roles: [string, string][] = [
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
        roles.push(["directClaimNormalized", NS.wdtn], ["statementValueNormalized", NS.psn],
                   ["qualifierValueNormalized", NS.pqn], ["referenceValueNormalized", NS.prn]);
      for (const [role, ns] of roles)
        add(wd, WIKIBASE + role, iri(ns + id));

      for (const ns of [NS.p, NS.psv, NS.pqv, NS.prv])
        add(iri(ns + id), "a", iri(OWL + "ObjectProperty"));
      for (const ns of [NS.wdt, NS.ps, NS.pq, NS.pr])
        add(iri(ns + id), "a", iri(OWL + propertyKind));
      if (normalizedKind !== null) {
        for (const ns of [NS.psn, NS.pqn, NS.prn])
          add(iri(ns + id), "a", iri(OWL + "ObjectProperty"));
        add(iri(NS.wdtn + id), "a", iri(OWL + normalizedKind));
      }

      const restriction = DF.blankNode(md5(`owl:complementOf-${repositoryName}-${id}`));
      add(iri(NS.wdno + id), "a", iri(OWL + "Class"));
      add(iri(NS.wdno + id), OWL + "complementOf", restriction);
      add(restriction, "a", iri(OWL + "Restriction"));
      add(restriction, OWL + "onProperty", iri(NS.wdt + id));
      add(restriction, OWL + "someValuesFrom", iri(OWL + "Thing"));
    }

    function emitStatementGroup (pid: string, statements: any[]): void {
      // "truthy" wdt: arcs reflect only the best statements of a property:
      // the preferred ones, or all the normal ones when nothing is preferred
      const bestRank = statements.some(st => st.rank === "preferred") ? "preferred" : "normal";
      statements.forEach((st, index) => {
        const CLAIM: JsonPath = ENTITY.concat("claims", pid, index);
        const stLName = st.id.replace("$", "-");
        const wds = iri(NS.wds + stLName);
        // the statement node is that claim's whole object, the way a blank
        // node is its whole [ ... ]
        from({s: ID, p: ENTITY.concat("claims", pid), o: CLAIM}, () =>
          add(wd, NS.p + pid, wds));
        from({s: CLAIM, p: CLAIM, o: CLAIM}, () => {
          add(wds, "a", iri(WIKIBASE + "Statement"));
          if (st.rank === bestRank)
            add(wds, "a", iri(WIKIBASE + "BestRank"));
        });
        from({s: CLAIM, p: CLAIM.concat("rank"), o: CLAIM.concat("rank")}, () =>
          add(wds, WIKIBASE + "rank",
              iri(WIKIBASE + st.rank.charAt(0).toUpperCase() + st.rank.substring(1) + "Rank")));

        const PROPERTY = ENTITY.concat("claims", pid);
        emitSnak(wds, stLName, st.mainsnak, "statement", CLAIM.concat("mainsnak"), CLAIM, PROPERTY);
        if (st.rank === bestRank)
          emitSnak(wd, stLName, st.mainsnak, "direct", CLAIM.concat("mainsnak"), ID, PROPERTY);

        for (const [qid, snaks] of Object.entries(st.qualifiers || {}) as [string, any[]][])
          snaks.forEach((snak, qi) =>
            emitSnak(wds, stLName, snak, "qualifier",
                     CLAIM.concat("qualifiers", qid, qi), CLAIM, CLAIM.concat("qualifiers", qid)));

        (st.references || []).forEach((ref: any, ri: number) => {
          const REF: JsonPath = CLAIM.concat("references", ri);
          const wdref = iri(NS.wdref + ref.hash);
          from({s: CLAIM, p: REF, o: REF}, () => {
            add(wds, PROV + "wasDerivedFrom", wdref);
            add(wdref, "a", iri(WIKIBASE + "Reference"));
          });
          for (const [rid, snaks] of Object.entries(ref.snaks || {}) as [string, any[]][])
            snaks.forEach((snak, si) =>
              emitSnak(wdref, ref.hash, snak, "reference",
                       REF.concat("snaks", rid, si), REF, REF.concat("snaks", rid)));
        });
      });
    }

    /** One snak onto `subject`: the simple value in the family's namespace,
     * plus (except for truthy wdt:) the wdv: node for structured values. */
    function emitSnak (subject: RdfJs.Quad_Subject, parentLName: string, snak: any, family: Family,
                       SNAK?: JsonPath, SUBJECT?: JsonPath, PROPERTY?: JsonPath): void {
      const {simple, value} = FAMILIES[family];
      const pid = snak.property;
      const VALUE = SNAK && SNAK.concat("datavalue", "value");
      // the property is named by the member that groups these snaks -- the
      // "P569" of claims, of qualifiers, of a reference's snaks
      where = {s: SUBJECT, p: PROPERTY, o: VALUE};
      switch (snak.snaktype) {
      case "value": {
        const term = simpleValueTerm(snak.datavalue, snak.datatype);
        if (term !== null)
          // a simple arc's object is one member of the value: the date in a
          // time, the number in a quantity.  Only a value with no one member
          // behind it -- a coordinate, made of two -- is the whole object.
          from({...where, o: SIMPLE_FROM[snak.datavalue.type]
                ? VALUE && VALUE.concat(SIMPLE_FROM[snak.datavalue.type])
                : VALUE},
               () => add(subject, simple + pid, term));
        if (value !== null && snak.datavalue.type in COMPLEX_VALUES) {
          const node = iri(NS.wdv + valueNodeHash(snak.datavalue));
          add(subject, value + pid, node);
          // the value node's own arcs come from inside that value object
          from({s: VALUE, p: VALUE, o: VALUE}, () =>
            COMPLEX_VALUES[snak.datavalue.type](node, snak.datavalue.value));
        }
        break;
      }
      case "somevalue":
        // an unknown value is a blank node; the label is stable across
        // serializations (md5 of parent + namespaces + snak hash)
        add(subject, simple + pid,
            DF.blankNode(md5(`${parentLName}-${simple}-${NS.wdv}-${snak.hash}`)));
        break;
      case "novalue":
        add(subject, "a", iri(NS.wdno + pid));
        break;
      default:
        throw Error(`unknown snak type "${snak.snaktype}" on ${id} ${pid}`);
      }
    }

    function simpleValueTerm (dv: any, datatype: string): RdfJs.Quad_Object | null {
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
        default: return string(v);              // string, external-id, math, musical-notation ...
        }
      case "monolingualtext":
        return langLit(v.text, v.language);
      case "time": {
        const cleaned = cleanTimeValue(v);
        return cleaned === null ? null : typed(cleaned, XSD + "dateTime");
      }
      case "quantity":
        return typed(v.amount, XSD + "decimal");
      case "globecoordinate":
        return typed((v.globe === EARTH ? "" : `<${v.globe}> `) +
                     `Point(${phpFloatStr(v.longitude)} ${phpFloatStr(v.latitude)})`,
                     GEO + "wktLiteral");
      default:
        throw Error(`unknown datavalue type "${dv.type}" (datatype ${datatype}) on ${id}`);
      }
    }

    function emitTimeValueNode (node: RdfJs.Quad_Subject, v: any): void {
      add(node, "a", iri(WIKIBASE + "TimeValue"));
      const cleaned = cleanTimeValue(v);
      if (cleaned !== null)
        said("time", () => add(node, WIKIBASE + "timeValue", typed(cleaned, XSD + "dateTime")));
      said("precision", () => add(node, WIKIBASE + "timePrecision", integer(v.precision)));
      said("timezone", () => add(node, WIKIBASE + "timeTimezone", integer(v.timezone)));
      said("calendarmodel", () => add(node, WIKIBASE + "timeCalendarModel", iri(v.calendarmodel)));
    }

    function emitQuantityValueNode (node: RdfJs.Quad_Subject, v: any): void {
      add(node, "a", iri(WIKIBASE + "QuantityValue"));
      said("amount", () => add(node, WIKIBASE + "quantityAmount", typed(v.amount, XSD + "decimal")));
      if (v.upperBound != null)
        said("upperBound", () =>
          add(node, WIKIBASE + "quantityUpperBound", typed(v.upperBound, XSD + "decimal")));
      if (v.lowerBound != null)
        said("lowerBound", () =>
          add(node, WIKIBASE + "quantityLowerBound", typed(v.lowerBound, XSD + "decimal")));
      said("unit", () => add(node, WIKIBASE + "quantityUnit", iri(v.unit === "1" ? UNIT_ONE : v.unit)));
      // wikibase:quantityNormalized needs unit conversion tables; see the
      // module comment
    }

    function emitGlobeValueNode (node: RdfJs.Quad_Subject, v: any): void {
      add(node, "a", iri(WIKIBASE + "GlobecoordinateValue"));
      said("latitude", () =>
        add(node, WIKIBASE + "geoLatitude", typed(phpFloatStr(v.latitude), XSD + "double")));
      said("longitude", () =>
        add(node, WIKIBASE + "geoLongitude", typed(phpFloatStr(v.longitude), XSD + "double")));
      if (v.precision != null)
        said("precision", () =>
          add(node, WIKIBASE + "geoPrecision", typed(phpFloatStr(v.precision), XSD + "double")));
      said("globe", () => add(node, WIKIBASE + "geoGlobe", iri(v.globe)));
    }
  }

  return {entityToQuads, namespaces: NS, provenance: provenanceIndex};
}

export const name = "wikibase-rdf";
export const description = "Wikibase entity JSON pages to WDQS-flavor RDF";
