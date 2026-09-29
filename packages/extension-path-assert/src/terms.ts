/**
 * RDF terms as the assertion language sees them: identity (for sets),
 * value (for comparison), effective boolean value, and how they print.
 *
 * Terms come from the data source as RDF/JS terms; the ones made here
 * (function results, literals in the code) are plain objects of the same
 * shape, which every consumer in this repo reads structurally.
 */
import type {Term, NamedNode, Literal} from "@rdfjs/types";

export const XSD = "http://www.w3.org/2001/XMLSchema#";
export const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
export const RDF_TYPE = RDF + "type";
export const RDF_LANGSTRING = RDF + "langString";
export const XSD_STRING = XSD + "string";
export const XSD_BOOLEAN = XSD + "boolean";
export const XSD_INTEGER = XSD + "integer";
export const XSD_DECIMAL = XSD + "decimal";
export const XSD_DOUBLE = XSD + "double";
export const XSD_FLOAT = XSD + "float";
export const XSD_DATE = XSD + "date";
export const XSD_DATETIME = XSD + "dateTime";
export const XSD_DATETIMESTAMP = XSD + "dateTimeStamp";

/** xsd:integer and the types derived from it (XSD Part 2 §3.4) */
const IntegerTypes = new Set(["integer", "long", "int", "short", "byte",
  "nonNegativeInteger", "positiveInteger", "unsignedLong", "unsignedInt", "unsignedShort", "unsignedByte",
  "nonPositiveInteger", "negativeInteger"].map(n => XSD + n));

export type NumericKind = "integer" | "decimal" | "double";

export function numericKind (datatype: string): NumericKind | null {
  if (IntegerTypes.has(datatype)) return "integer";
  if (datatype === XSD_DECIMAL) return "decimal";
  if (datatype === XSD_DOUBLE || datatype === XSD_FLOAT) return "double";
  return null;
}

/** the result kind of arithmetic on two kinds: the wider one (SPARQL §17.3) */
export function widerKind (a: NumericKind, b: NumericKind): NumericKind {
  return a === "double" || b === "double" ? "double"
    : a === "decimal" || b === "decimal" ? "decimal"
    : "integer";
}

// ── construction ────────────────────────────────────────────────────────────

export function namedNode (value: string): NamedNode {
  return {termType: "NamedNode", value, equals: (o: Term) => !!o && o.termType === "NamedNode" && o.value === value};
}

export function literal (value: string, datatype: string = XSD_STRING): Literal {
  const t = {termType: "Literal", value, language: "", datatype: namedNode(datatype),
             equals: (o: Term) => termKey(o) === termKey(t as unknown as Term)};
  return t as unknown as Literal;
}

export function langLiteral (value: string, language: string): Literal {
  const t = {termType: "Literal", value, language, datatype: namedNode(RDF_LANGSTRING),
             equals: (o: Term) => termKey(o) === termKey(t as unknown as Term)};
  return t as unknown as Literal;
}

export function bool (b: boolean): Literal {
  return literal(b ? "true" : "false", XSD_BOOLEAN);
}

export function number (n: number, kind: NumericKind): Literal {
  const dt = kind === "integer" ? XSD_INTEGER : kind === "decimal" ? XSD_DECIMAL : XSD_DOUBLE;
  let lexical: string;
  if (kind === "integer")
    lexical = String(Math.trunc(n));
  else if (Number.isInteger(n) && Math.abs(n) < 1e21)
    lexical = kind === "decimal" ? String(n) + ".0" : String(n) + ".0E0";
  else
    lexical = String(n);
  return literal(lexical, dt);
}

// ── identity ────────────────────────────────────────────────────────────────

/** one string per distinct term: what a set is keyed by (sameTerm) */
export function termKey (t: Term): string {
  switch (t.termType) {
  case "NamedNode": return "<" + t.value + ">";
  case "BlankNode": return "_:" + t.value;
  case "Literal": return JSON.stringify(t.value) + "@" + (t.language || "") + "^^" + (t.datatype ? t.datatype.value : XSD_STRING);
  case "DefaultGraph": return "DEFAULT";
  case "Variable": return "?" + t.value;
  default: return t.termType + ":" + String((t as Term).value);
  }
}

export function sameTerm (a: Term, b: Term): boolean {
  return termKey(a) === termKey(b);
}

// ── value ───────────────────────────────────────────────────────────────────

export type TermValue =
  | {kind: "number", n: number, numeric: NumericKind}
  | {kind: "boolean", b: boolean}
  | {kind: "string", s: string, lang: string}
  | {kind: "date", ms: number}
  | {kind: "other", datatype: string, lexical: string};

/** a literal's value under its datatype; "other" where the datatype is
 * unknown here or the lexical form doesn't parse */
export function valueOf (t: Literal): TermValue {
  const dt = t.datatype ? t.datatype.value : XSD_STRING;
  if (dt === XSD_STRING || dt === RDF_LANGSTRING || (t.language && t.language !== ""))
    return {kind: "string", s: t.value, lang: (t.language || "").toLowerCase()};
  const numeric = numericKind(dt);
  if (numeric !== null) {
    const n = Number(t.value.trim());
    if (!Number.isNaN(n) && t.value.trim() !== "" || /^[+-]?(INF|NaN)$/.test(t.value.trim()))
      return {kind: "number", n: /^[+-]?INF$/.test(t.value.trim()) ? (t.value.trim().startsWith("-") ? -Infinity : Infinity) : n, numeric};
    return {kind: "other", datatype: dt, lexical: t.value};
  }
  if (dt === XSD_BOOLEAN) {
    const v = t.value.trim();
    if (v === "true" || v === "1") return {kind: "boolean", b: true};
    if (v === "false" || v === "0") return {kind: "boolean", b: false};
    return {kind: "other", datatype: dt, lexical: t.value};
  }
  if (dt === XSD_DATE || dt === XSD_DATETIME || dt === XSD_DATETIMESTAMP) {
    const ms = Date.parse(t.value.trim());
    return Number.isNaN(ms) ? {kind: "other", datatype: dt, lexical: t.value} : {kind: "date", ms};
  }
  return {kind: "other", datatype: dt, lexical: t.value};
}

/** RDFterm-equal, near enough: numbers by value, strings by value and
 * language, dates by instant, anything else by term */
export function equalTerms (a: Term, b: Term): boolean {
  if (a.termType !== b.termType) return false;
  if (a.termType !== "Literal") return a.value === b.value;
  const va = valueOf(a as Literal), vb = valueOf(b as Literal);
  if (va.kind !== vb.kind) return false;
  switch (va.kind) {
  case "number": return va.n === (vb as typeof va).n;
  case "boolean": return va.b === (vb as typeof va).b;
  case "string": return va.s === (vb as typeof va).s && va.lang === (vb as typeof va).lang;
  case "date": return va.ms === (vb as typeof va).ms;
  default: return sameTerm(a, b);
  }
}

/** ordering for < <= > >=: numbers, booleans, plain strings and dates;
 * undefined where the pair has no order (SPARQL: a type error) */
export function compareTerms (a: Term, b: Term): number | undefined {
  if (a.termType !== "Literal" || b.termType !== "Literal") return undefined;
  const va = valueOf(a as Literal), vb = valueOf(b as Literal);
  if (va.kind !== vb.kind) return undefined;
  switch (va.kind) {
  case "number": {
    const n = (vb as typeof va).n;
    return va.n < n ? -1 : va.n > n ? 1 : va.n === n ? 0 : undefined;   // NaN: no order
  }
  case "boolean": return (va.b ? 1 : 0) - ((vb as typeof va).b ? 1 : 0);
  case "string": {
    const w = vb as typeof va;
    if (va.lang !== w.lang) return undefined;
    return va.s < w.s ? -1 : va.s > w.s ? 1 : 0;
  }
  case "date": return va.ms - (vb as typeof va).ms;
  default: return undefined;
  }
}

/** SPARQL's effective boolean value of one term; IRIs and blank nodes
 * count as true (they are "something") */
export function ebvOf (t: Term): boolean {
  if (t.termType !== "Literal") return true;
  const v = valueOf(t as Literal);
  switch (v.kind) {
  case "boolean": return v.b;
  case "number": return !Number.isNaN(v.n) && v.n !== 0;
  case "string": return v.s.length > 0;
  case "date": return true;
  default: return v.lexical.length > 0;
  }
}

// ── printing ────────────────────────────────────────────────────────────────

export interface Meta {
  base?: string;
  prefixes?: {[prefix: string]: string};
}

/** an IRI as a prefixed name where the schema's prefixes allow, else <…> */
export function iriToTurtle (iri: string, meta?: Meta): string {
  const prefixes = meta && meta.prefixes ? meta.prefixes : {};
  let best: {prefix: string, ns: string} | null = null;
  for (const prefix of Object.keys(prefixes)) {
    const ns = prefixes[prefix];
    if (iri.startsWith(ns) && (best === null || ns.length > best.ns.length)) {
      const local = iri.substring(ns.length);
      if (/^[^/#?\s<>"{}|^`\\]*$/.test(local) && !local.startsWith("."))
        best = {prefix, ns};
    }
  }
  return best === null ? "<" + iri + ">" : best.prefix + ":" + iri.substring(best.ns.length);
}

export function termToTurtle (t: Term, meta?: Meta): string {
  switch (t.termType) {
  case "NamedNode": return iriToTurtle(t.value, meta);
  case "BlankNode": return "_:" + t.value;
  case "Literal": {
    const quoted = JSON.stringify(t.value);
    const dt = t.datatype ? t.datatype.value : XSD_STRING;
    if (t.language) return quoted + "@" + t.language;
    if (dt === XSD_STRING) return quoted;
    if (numericKind(dt) === "integer" && dt === XSD_INTEGER && /^[+-]?\d+$/.test(t.value)) return t.value;
    if (dt === XSD_DECIMAL && /^[+-]?\d*\.\d+$/.test(t.value)) return t.value;
    if (dt === XSD_BOOLEAN && (t.value === "true" || t.value === "false")) return t.value;
    return quoted + "^^" + iriToTurtle(dt, meta);
  }
  default: return termKey(t);
  }
}
