/**
 * The function library: SPARQL's builtins under SPARQL's names (with the
 * XPath spellings SPARQL borrowed them from as aliases), plus the sequence
 * functions XPath has and SPARQL doesn't (count, exists, empty, …).
 *
 * A "map" function takes terms and is applied to every combination of its
 * arguments' items, an item it can't take (strlen of an IRI, say) yielding
 * nothing -- SPARQL's type error, which a FILTER treats as false.  An
 * "agg" function takes whole sets.
 */
import type {Term, Literal} from "@rdfjs/types";
import {
  bool, literal, langLiteral, namedNode, number, widerKind, valueOf, compareTerms, ebvOf,
  NumericKind, RDF_LANGSTRING, XSD_STRING, XSD_DATETIME, termKey,
} from "./terms";

export class AssertFailed extends Error {
  constructor (message: string) { super(message); this.name = "AssertFailed"; }
}

export interface TermSetLike {
  items: Term[];
}

export type MapFn = (args: Term[]) => Term | undefined;
export type AggFn = (args: TermSetLike[]) => Term[];

export interface FunctionDef {
  kind: "map" | "agg";
  min: number;
  max: number;              // Infinity for variadic
  map?: MapFn;
  agg?: AggFn;
}

// ── helpers ─────────────────────────────────────────────────────────────────

const isLiteral = (t: Term): t is Literal => t.termType === "Literal";

/** a string-valued literal's text: xsd:string, rdf:langString, or (leniently) any literal */
function text (t: Term): string | undefined {
  return isLiteral(t) ? t.value : undefined;
}

/** a literal's language, "" for none; undefined for a non-literal */
function language (t: Term): string | undefined {
  return isLiteral(t) ? (t.language || "") : undefined;
}

/** a string result keeps the language of the string it came from (SPARQL §17.4.3) */
function like (source: Term, value: string): Term {
  const lang = language(source);
  return lang ? langLiteral(value, lang) : literal(value);
}

function num (t: Term): {n: number, kind: NumericKind} | undefined {
  if (!isLiteral(t)) return undefined;
  const v = valueOf(t);
  return v.kind === "number" ? {n: v.n, kind: v.numeric} : undefined;
}

function date (t: Term): Date | undefined {
  if (!isLiteral(t)) return undefined;
  const v = valueOf(t);
  return v.kind === "date" ? new Date(v.ms) : undefined;
}

function regexFlags (flags: string | undefined): string {
  // SPARQL's s m i x q; JS has i m s (x and q are not offered)
  return (flags || "").split("").filter(f => "ims".indexOf(f) !== -1).join("");
}

/** RFC 4647 basic filtering, as SPARQL's langMatches */
export function langMatches (tag: string, range: string): boolean {
  if (tag === "") return false;
  if (range === "*") return true;
  const t = tag.toLowerCase(), r = range.toLowerCase();
  return t === r || t.startsWith(r + "-");
}

const str1 = (f: (s: string, t: Term) => Term | undefined): MapFn =>
  ([a]) => { const s = text(a); return s === undefined ? undefined : f(s, a); };
const str2 = (f: (a: string, b: string, ta: Term) => Term | undefined): MapFn =>
  ([a, b]) => { const s = text(a), u = text(b); return s === undefined || u === undefined ? undefined : f(s, u, a); };
const num1 = (f: (n: number, kind: NumericKind) => number): MapFn =>
  ([a]) => { const v = num(a); return v === undefined ? undefined : number(f(v.n, v.kind), v.kind); };
const date1 = (f: (d: Date) => number): MapFn =>
  ([a]) => { const d = date(a); return d === undefined ? undefined : number(f(d), "integer"); };

// ── the library ─────────────────────────────────────────────────────────────

const map = (min: number, max: number, fn: MapFn): FunctionDef => ({kind: "map", min, max, map: fn});
const agg = (min: number, max: number, fn: AggFn): FunctionDef => ({kind: "agg", min, max, agg: fn});

export const Functions: {[name: string]: FunctionDef} = {
  // terms
  str: map(1, 1, ([a]) => a.termType === "Literal" || a.termType === "NamedNode" ? literal(a.value) : undefined),
  lang: map(1, 1, ([a]) => { const l = language(a); return l === undefined ? undefined : literal(l); }),
  datatype: map(1, 1, ([a]) => isLiteral(a) ? namedNode(a.language ? RDF_LANGSTRING : a.datatype ? a.datatype.value : XSD_STRING) : undefined),
  iri: map(1, 1, ([a]) => a.termType === "NamedNode" ? a : isLiteral(a) ? namedNode(a.value) : undefined),
  isiri: map(1, 1, ([a]) => bool(a.termType === "NamedNode")),
  isblank: map(1, 1, ([a]) => bool(a.termType === "BlankNode")),
  isliteral: map(1, 1, ([a]) => bool(a.termType === "Literal")),
  isnumeric: map(1, 1, ([a]) => bool(num(a) !== undefined)),
  strdt: map(2, 2, ([a, dt]) => { const s = text(a); return s === undefined || dt.termType !== "NamedNode" ? undefined : literal(s, dt.value); }),
  strlang: map(2, 2, ([a, l]) => { const s = text(a), lang = text(l); return s === undefined || !lang ? undefined : langLiteral(s, lang); }),
  sameterm: map(2, 2, ([a, b]) => bool(termKey(a) === termKey(b))),
  langmatches: map(2, 2, ([a, b]) => { const t = text(a), r = text(b); return t === undefined || r === undefined ? undefined : bool(langMatches(t, r)); }),

  // strings
  strlen: map(1, 1, str1(s => number([...s].length, "integer"))),
  substr: map(2, 3, ([a, start, len]) => {
    const s = text(a), b = num(start), l = len === undefined ? undefined : num(len);
    if (s === undefined || b === undefined || (len !== undefined && l === undefined)) return undefined;
    const chars = [...s];
    const from = Math.round(b.n) - 1;                       // SPARQL and XPath count from 1
    const to = l === undefined ? chars.length : from + Math.round(l.n);
    return like(a, chars.slice(Math.max(0, from), Math.max(0, to)).join(""));
  }),
  ucase: map(1, 1, str1((s, t) => like(t, s.toUpperCase()))),
  lcase: map(1, 1, str1((s, t) => like(t, s.toLowerCase()))),
  strstarts: map(2, 2, str2((a, b) => bool(a.startsWith(b)))),
  strends: map(2, 2, str2((a, b) => bool(a.endsWith(b)))),
  contains: map(2, 2, str2((a, b) => bool(a.indexOf(b) !== -1))),
  strbefore: map(2, 2, str2((a, b, t) => { const i = a.indexOf(b); return like(t, i === -1 ? "" : a.substring(0, i)); })),
  strafter: map(2, 2, str2((a, b, t) => { const i = a.indexOf(b); return like(t, i === -1 ? "" : a.substring(i + b.length)); })),
  concat: map(0, Infinity, args => {
    const parts = args.map(text);
    if (parts.some(p => p === undefined)) return undefined;
    const langs = new Set(args.map(language));
    const value = (parts as string[]).join("");
    return langs.size === 1 && args.length > 0 && args[0].termType === "Literal" && (args[0] as Literal).language
      ? langLiteral(value, (args[0] as Literal).language) : literal(value);
  }),
  replace: map(3, 4, ([a, pat, rep, flags]) => {
    const s = text(a), p = text(pat), r = text(rep), f = flags === undefined ? "" : text(flags);
    if (s === undefined || p === undefined || r === undefined || f === undefined) return undefined;
    try { return like(a, s.replace(new RegExp(p, "g" + regexFlags(f)), r)); } catch (_e) { return undefined; }
  }),
  regex: map(2, 3, ([a, pat, flags]) => {
    const s = text(a), p = text(pat), f = flags === undefined ? "" : text(flags);
    if (s === undefined || p === undefined || f === undefined) return undefined;
    try { return bool(new RegExp(p, regexFlags(f)).test(s)); } catch (_e) { return undefined; }
  }),

  // numbers
  abs: map(1, 1, num1(n => Math.abs(n))),
  round: map(1, 1, num1(n => Math.round(n))),
  ceil: map(1, 1, num1(n => Math.ceil(n))),
  floor: map(1, 1, num1(n => Math.floor(n))),

  // dates and times
  now: map(0, 0, () => literal(new Date().toISOString(), XSD_DATETIME)),
  year: map(1, 1, date1(d => d.getUTCFullYear())),
  month: map(1, 1, date1(d => d.getUTCMonth() + 1)),
  day: map(1, 1, date1(d => d.getUTCDate())),
  hours: map(1, 1, date1(d => d.getUTCHours())),
  minutes: map(1, 1, date1(d => d.getUTCMinutes())),
  seconds: map(1, 1, date1(d => d.getUTCSeconds())),

  // sets
  count: agg(1, 1, ([a]) => [number(a.items.length, "integer")]),
  exists: agg(1, 1, ([a]) => [bool(a.items.length > 0)]),
  empty: agg(1, 1, ([a]) => [bool(a.items.length === 0)]),
  not: agg(1, 1, ([a]) => [bool(!a.items.some(ebvOf))]),
  boolean: agg(1, 1, ([a]) => [bool(a.items.some(ebvOf))]),
  distinct: agg(1, 1, ([a]) => a.items),                        // sets are already distinct
  sum: agg(1, 1, ([a]) => {
    const ns = a.items.map(num).filter((v): v is {n: number, kind: NumericKind} => v !== undefined);
    return [number(ns.reduce((s, v) => s + v.n, 0), ns.reduce<NumericKind>((k, v) => widerKind(k, v.kind), "integer"))];
  }),
  avg: agg(1, 1, ([a]) => {
    const ns = a.items.map(num).filter((v): v is {n: number, kind: NumericKind} => v !== undefined);
    if (ns.length === 0) return [];
    return [number(ns.reduce((s, v) => s + v.n, 0) / ns.length, widerKind("decimal", ns.reduce<NumericKind>((k, v) => widerKind(k, v.kind), "integer")))];
  }),
  min: agg(1, 1, ([a]) => extreme(a.items, -1)),
  max: agg(1, 1, ([a]) => extreme(a.items, 1)),

  // the verdict
  fail: agg(0, 1, ([a]) => {
    const msg = a === undefined ? "fail()" : a.items.map(text).filter(s => s !== undefined).join(" ") || "fail()";
    throw new AssertFailed(msg);
  }),
};

/** the least (-1) or greatest (1) of the items that order with each other */
function extreme (items: Term[], sign: number): Term[] {
  let best: Term | null = null;
  for (const item of items) {
    if (best === null) { best = item; continue; }
    const c = compareTerms(item, best);
    if (c !== undefined && c * sign > 0) best = item;
  }
  return best === null ? [] : [best];
}

/** XPath's names for the SPARQL functions that came from XPath */
const Aliases: {[alias: string]: string} = {
  "string-length": "strlen", "upper-case": "ucase", "lower-case": "lcase",
  "starts-with": "strstarts", "ends-with": "strends", "substring": "substr",
  "substring-before": "strbefore", "substring-after": "strafter", "matches": "regex",
  "ceiling": "ceil", "distinct-values": "distinct", "error": "fail", "uri": "iri", "isuri": "isiri",
  "string": "str",
};

export function lookupFunction (name: string): FunctionDef | undefined {
  const key = name.toLowerCase();
  return Functions[key] || Functions[Aliases[key]];
}

