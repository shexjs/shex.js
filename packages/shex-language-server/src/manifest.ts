/** Load and run shex.js/shex-webapp-style YAML test manifests, for the
 * `shex.loadManifest` / `shex.runManifestEntry` commands the editor manifest
 * browsers drive.
 *
 * A manifest is a top-level sequence of entries, each naming a schema, a data
 * document, and a `queryMap` -- a ShapeMap-compact-syntax association list --
 * given inline (`schema:` / `data:` / `queryMap:`) or by reference
 * (`schemaURL:` / `dataURL:` / `queryMapURL:`, resolved relative to the
 * manifest's own directory).  Each entry also names an expected `status`
 * ("conformant" / "nonconformant").
 *
 * The queryMap may use the two shex.js extensions this understands, matching
 * ericprud/shexc-mode-for-emacs' `shex-manifest-browser.el`:
 *   - `{FOCUS predicate object}` / `{subject predicate FOCUS}` -- a pattern
 *     query: FOCUS is the node, matched against the data graph, expanding to
 *     one association per matching triple.  The non-FOCUS slot is `_` (any) or
 *     a fixed `<iri>`/`prefix:local`; the predicate is always concrete.
 *   - a leading `!` on the shape (`<node>@!<Shape>`) -- the node must *not*
 *     conform; that association then expects "nonconformant" whatever the
 *     entry's own `status` is.  The `!` is stripped before validation (the
 *     validator doesn't parse it) and tracked here for the verdict.
 */
"use strict";

import * as fs from "fs";
import * as path from "path";
import * as N3 from "n3";
import * as ES from "@shexjs/editor-services";
import { loadSchema, parseData, validatePairs, toPair, resolve, schemaBaseOf } from "./validate";
const yaml = require("js-yaml");

const BASE = "http://a.example/";
const { namedNode } = N3.DataFactory;

// --- loading ----------------------------------------------------------------

export interface ManifestEntry {
  index: number;
  schemaLabel?: string;
  dataLabel?: string;
  schema?: string;          // inline text (or the file content when from schemaURL)
  data?: string;
  schemaPath?: string;      // resolved absolute path when from a single schemaURL
  dataPath?: string;        // resolved absolute path when from a single dataURL
  queryMap: string;
  status?: string;          // expected: "conformant" | "nonconformant"
  comment?: string;
  dataBase?: string;
  neighborhood?: string;    // "sparql"/"wikibase" entries need the network
}

/** Parse a manifest's YAML text into resolved entries.  `schemaURL`/`dataURL`/
 * `queryMapURL` references are read from disk relative to `manifestPath`'s
 * directory (the server is a local process; the browser passes the file path). */
export function loadManifest (manifestText: string, manifestPath?: string): { entries: ManifestEntry[] } {
  const dir = manifestPath ? path.dirname(manifestPath) : process.cwd();
  const raw = yaml.load(manifestText);
  const entries: ManifestEntry[] = (Array.isArray(raw) ? raw : []).map((e: any, index: number) => ({
    index,
    schemaLabel: e.schemaLabel,
    dataLabel: e.dataLabel,
    schema: "schema" in e ? e.schema : readRefs(e.schemaURL, dir),
    data: "data" in e ? e.data : readRefs(e.dataURL, dir),
    schemaPath: "schema" in e ? undefined : refPath(e.schemaURL, dir),
    dataPath: "data" in e ? undefined : refPath(e.dataURL, dir),
    queryMap: String(("queryMap" in e ? e.queryMap : readRefs(e.queryMapURL, dir)) ?? "").trim(),
    status: e.status,
    comment: e.comment,
    dataBase: e.dataBase,
    neighborhood: e.neighborhood,
  }));
  return { entries };
}

const readRefs = (url: unknown, dir: string): string | undefined =>
  url == null ? undefined
    : (Array.isArray(url) ? url : [url]).map(u => fs.readFileSync(path.resolve(dir, String(u)), "utf8")).join("\n");

/** The resolved absolute path of a single-file URL reference (so the browser can
 * open the real file), or undefined for an inline or multi-file entry. */
const refPath = (url: unknown, dir: string): string | undefined =>
  typeof url === "string" ? path.resolve(dir, url) : undefined;

// --- running one entry ------------------------------------------------------

export interface AssocResult {
  node: string;       // the ShapeMap node text, e.g. "<http://ex/alice>"
  shape: string;      // the shape text, e.g. "<http://ex/User>" or "START"
  negated: boolean;   // was the association `@!Shape` (expects nonconformant)?
  expected: string;   // "conformant" | "nonconformant"
  actual: string;     // the validator's status, or "no result"
  pass: boolean;
  reasons?: string[]; // for a nonconformant node, why -- shown in the detail panel
}
export interface RunResult {
  errors?: string[];
  shapeMap?: string;          // the resolved fixed shape map that was validated
  assocs?: AssocResult[];
  pass?: boolean;
  correspondences?: Correspondence[];   // schema-constraint ⟷ data-triple, for cross-pane hover
}

/** An LSP-style 0-based line/character range (what the editor clients speak). */
export interface LspRange { startLine: number; startChar: number; endLine: number; endChar: number; }

/** A schema-constraint ⟷ data-triple correspondence, for cross-pane hover
 * highlighting a la the ShEx.js WebApp: hovering a constraint lights the data
 * triples that (dis)satisfied it, and hovering a triple lights its constraint.
 * `schema` is the constraint's highlight extent (its parts, skipping an inline-
 * shape body); `data` is the triple's term ranges.  Both index the live
 * schema/data text the run validated. */
export interface Correspondence {
  status: "conformant" | "nonconformant";
  message: string;
  schema: LspRange[];
  data: LspRange[];
  /** the matched/failed data triple as `subject predicate object`, in the
   * DATA's base/prefixes -- shown when hovering the schema constraint. */
  quad?: string;
  /** the shape path to the constraint (`@Shape/pred…[n]`), in the SCHEMA's
   * base/prefixes -- shown when hovering the data triple. */
  path?: string;
}

/** Resolve an entry's queryMap against its data, validate every association,
 * and report the per-association and overall PASS/FAIL verdict. */
export function runEntry (schemaText: string, dataText: string, queryMapText: string,
                          expectedStatus = "conformant", base: string = BASE): RunResult {
  let schema, store: N3.Store;
  try { schema = loadSchema(schemaText, base); } catch (e) { return { errors: ["schema: " + msg(e)] }; }
  try { store = parseData(dataText, base); } catch (e) { return { errors: ["data: " + msg(e)] }; }

  let assocs: Assoc[];
  try { assocs = resolveQueryMap(queryMapText, store, base, collectPrefixes(dataText)); }
  catch (e) { return { errors: ["queryMap: " + msg(e)] }; }
  if (!assocs.length) return { errors: ["queryMap resolved to no node/shape associations"] };

  const schemaBase = schemaBaseOf(schema, base);   // shapes resolve against the schema's base
  const pairs = assocs.map(a => toPair(a.nodeText, a.shapeText, base, schemaBase));
  let results: any[];
  try { results = validatePairs(schema, store, pairs) as any[]; }
  catch (e) { return { errors: ["validate: " + msg(e)] }; }

  // validateShapeMap returns one result per input pair, in order.
  const rows: AssocResult[] = assocs.map((a, i) => {
    const expected = a.negated ? "nonconformant" : expectedStatus;
    const actual = (results[i] && results[i].status) || "no result";
    const row: AssocResult = { node: a.nodeText, shape: a.shapeText, negated: a.negated, expected, actual, pass: actual === expected };
    if (actual === "nonconformant") {
      const reasons = assocReasons(results[i], schemaText, dataText, base);
      if (reasons.length) row.reasons = reasons;
    }
    return row;
  });
  return { shapeMap: assocs.map(a => `${a.nodeText}@${a.shapeText}`).join(",\n"),
           assocs: rows, pass: rows.every(r => r.pass),
           correspondences: correspondencesOf(results, schemaText, dataText, base) };
}

/** Short, distinct nonconformance messages for one association's result, so a
 * FAIL explains itself in the browser's detail panel (the "console").  Reuses
 * editor-services' error mapper (memoized parse -- cheap to call per row) and
 * caps the list so a deeply nested failure can't flood the panel. */
function assocReasons (result: any, schemaText: string, dataText: string, base: string): string[] {
  try {
    const shexcParsed = ES.parseShExC(schemaText, { base });
    let turtleParsed = null;
    try { turtleParsed = ES.parseTurtle(dataText, { baseIRI: base }); } catch { /* TriG etc. */ }
    const mapped = ES.mapValidationErrors(result, shexcParsed, turtleParsed);
    const seen = new Set<string>();
    const out: string[] = [];
    for (const p of mapped.pairs)
      if (p.status === "nonconformant" && p.message && !seen.has(p.message)) {
        seen.add(p.message);
        out.push(p.message);
      }
    return out.slice(0, 12);
  } catch { return []; }
}

/** Tie each validated (or failed) triple to its schema constraint and the data
 * triple that (dis)satisfied it, as line/col ranges in the given schema/data
 * text -- what the editor clients cross-highlight on hover.  Reuses the same
 * range mapping the WebApp does (ES.mapValidationErrors).  TriG data can't be
 * range-anchored (editor-services' strict-Turtle parser rejects GRAPH), so its
 * data side comes back empty and those pairs drop out -- schema-only pairs are
 * useless for a two-way hover. */
function correspondencesOf (valResult: unknown, schemaText: string, dataText: string, base: string): Correspondence[] {
  let shexcParsed: ES.ParsedShExC;
  let turtleParsed: ES.ParsedTurtle | null = null;
  let mapped: ES.MappedErrors;
  try {
    shexcParsed = ES.parseShExC(schemaText, { base });
    try { turtleParsed = ES.parseTurtle(dataText, { baseIRI: base }); } catch { /* TriG etc.: no data anchors */ }
    mapped = ES.mapValidationErrors(valResult, shexcParsed, turtleParsed);
  } catch { return []; }

  // hover text speaks the *other* document's vocabulary: the matched quad in the
  // data's prefixes (shown over the schema), the shape path in the schema's
  // prefixes (shown over the data).
  const dataPrefixes: Record<string, string> = (turtleParsed && (turtleParsed as { prefixes?: Record<string, string> }).prefixes) || {};
  const dataBase: string = (turtleParsed && (turtleParsed as { base?: string }).base) || base;
  const schemaMeta = (shexcParsed.schema || {}) as { _prefixes?: Record<string, string>; _base?: string };
  const schemaPrefixes = schemaMeta._prefixes || {};
  const schemaBase = schemaMeta._base || base;

  const schemaStarts = ES.lineOffsets(schemaText);
  const dataStarts = ES.lineOffsets(dataText);
  const lsp = (starts: number[]) => (r: ES.Range | null): LspRange | null => {
    if (!r) return null;
    const y = ES.rangeToYylloc(r, starts);
    return { startLine: y.first_line - 1, startChar: y.first_column,
             endLine: y.last_line - 1, endChar: y.last_column };
  };
  const schemaLsp = lsp(schemaStarts), dataLsp = lsp(dataStarts);
  const keep = (r: LspRange | null): r is LspRange => !!r;

  const out: Correspondence[] = [];
  for (const p of mapped.pairs) {
    const schema = (p.schemaParts && p.schemaParts.length ? p.schemaParts
                    : (p.schema ? [p.schema] : []))
          .map(schemaLsp).filter(keep);
    // the triple's terms: bnode subject/object as just their [ ] delimiters
    const a: ES.PairAnchors = p.anchors || { shapeLabel: null, subject: null, predicate: null, object: null };
    const rawData: (ES.Range | null)[] = [];
    if (a.subjectParts && a.subjectParts.length) rawData.push(...a.subjectParts); else rawData.push(a.subject);
    rawData.push(a.predicate);
    if (a.objectParts && a.objectParts.length) rawData.push(...a.objectParts); else rawData.push(a.object);
    const data = rawData.map(dataLsp).filter(keep);
    if (schema.length && data.length) {
      const triple = (p as { triple?: unknown }).triple;
      out.push({
        status: p.status, message: p.message, schema, data,
        quad: triple ? tripleStr(triple, dataPrefixes, dataBase) : undefined,
        path: p.pathTo ? pathStr(p.pathTo, schemaPrefixes, schemaBase) : undefined,
      });
    }
  }
  return out;
}

// --- rendering IRIs/terms in a document's own vocabulary --------------------

/** IRI -> CURIE against `prefixes` (longest namespace wins), else a base-
 * relative `<local>`, else the full `<iri>`. */
function curie (iri: string, prefixes: Record<string, string>, base?: string): string {
  let bestNs = "", bestPfx: string | null = null;
  for (const pfx in prefixes) {
    const ns = prefixes[pfx];
    if (iri.length > ns.length && iri.startsWith(ns) && ns.length >= bestNs.length &&
        /^[A-Za-z0-9_%.\-]*$/.test(iri.slice(ns.length))) { bestNs = ns; bestPfx = pfx; }
  }
  if (bestPfx !== null) return bestPfx + ":" + iri.slice(bestNs.length);
  if (base && iri.startsWith(base)) return "<" + iri.slice(base.length) + ">";
  return "<" + iri + ">";
}

/** An LdTerm (ShExJson: a string IRI/bnode, or a `{value,type?,language?}`
 * literal) as text; IRIs curie-d against `prefixes`/`base`. */
function termStr (term: any, prefixes: Record<string, string>, base?: string): string {
  if (term == null) return "?";
  if (typeof term === "string") return term.startsWith("_:") ? term : curie(term, prefixes, base);
  const lit = JSON.stringify(String(term.value ?? ""));
  if (term.language) return lit + "@" + term.language;
  const dt = term.type || term.datatype;
  return dt && dt !== "http://www.w3.org/2001/XMLSchema#string" ? lit + "^^" + curie(dt, prefixes, base) : lit;
}

/** A triple as `subject predicate object` in the given vocabulary. */
function tripleStr (triple: any, prefixes: Record<string, string>, base?: string): string {
  return termStr(triple.subject, prefixes, base) + " " +
         termStr(triple.predicate, prefixes, base) + " " +
         termStr(triple.object, prefixes, base);
}

/** A shape path `@Shape/pred/pred[n]` in the given vocabulary; the `[n]`
 * discriminator appears only past the first occurrence of the predicate. */
function pathStr (pathTo: { shape: string; via: string[]; predicate: string; ordinal: number },
                  prefixes: Record<string, string>, base?: string): string {
  const preds = pathTo.via.concat(pathTo.predicate).map(p => curie(p, prefixes, base)).join("/");
  return "@" + curie(pathTo.shape, prefixes, base) + "/" + preds + (pathTo.ordinal > 0 ? "[" + pathTo.ordinal + "]" : "");
}

// --- queryMap resolution (parity with shex-manifest-browser.el) --------------

interface Assoc { nodeText: string; shapeText: string; negated: boolean; }

function resolveQueryMap (queryMapText: string, store: N3.Store, base: string,
                          prefixes: Record<string, string>): Assoc[] {
  const assocs: Assoc[] = [];
  for (const raw of splitTopLevel(queryMapText, ",")) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const [nodeSelector, shapeLabel] = splitAssociation(trimmed);
    const negated = shapeLabel.startsWith("!");
    const shapeText = (negated ? shapeLabel.slice(1) : shapeLabel).trim();
    const nodeTexts = nodeSelector.startsWith("{")
      ? resolvePattern(nodeSelector, store, base, prefixes)
      : [nodeSelector];
    for (const nodeText of nodeTexts) assocs.push({ nodeText, shapeText, negated });
  }
  return assocs;
}

/** Split TEXT on SEP, ignoring SEP inside "..." / <...> / {...}. */
function splitTopLevel (text: string, sep: string): string[] {
  const parts: string[] = [];
  let depth = 0, inStr = false, start = 0;
  for (let i = 0; i < text.length; ++i) {
    const c = text[i];
    if (inStr) { if (c === '"') inStr = false; }
    else if (c === '"') inStr = true;
    else if (c === "<" || c === "{") depth++;
    else if (c === ">" || c === "}") depth = Math.max(0, depth - 1);
    else if (c === sep && depth === 0) { parts.push(text.slice(start, i)); start = i + 1; }
  }
  parts.push(text.slice(start));
  return parts;
}

/** Split an association on its rightmost depth-0 `@` into [nodeSelector, shapeLabel]. */
function splitAssociation (assoc: string): [string, string] {
  let depth = 0, inStr = false, at = -1;
  for (let i = 0; i < assoc.length; ++i) {
    const c = assoc[i];
    if (inStr) { if (c === '"') inStr = false; }
    else if (c === '"') inStr = true;
    else if (c === "<" || c === "{") depth++;
    else if (c === ">" || c === "}") depth = Math.max(0, depth - 1);
    else if (c === "@" && depth === 0) at = i;
  }
  if (at < 0) throw new Error(`no '@' in queryMap association '${assoc}'`);
  return [assoc.slice(0, at).trim(), assoc.slice(at + 1).trim()];
}

/** A `{SUBJECT PREDICATE OBJECT}` pattern (exactly one slot `FOCUS`, the other
 * `_` or a fixed term, predicate concrete) matched against the data graph:
 * one ShapeMap node text per matching triple's FOCUS term. */
function resolvePattern (selector: string, store: N3.Store, base: string,
                         prefixes: Record<string, string>): string[] {
  const inner = selector.slice(1, -1).trim();
  const tokens = inner.split(/[ \t\n]+/).filter(Boolean);
  if (tokens.length !== 3) throw new Error(`expected {SUBJECT PREDICATE OBJECT}, got '${selector}'`);
  const [subj, pred, obj] = tokens;
  const focus = subj === "FOCUS" ? "subject" : obj === "FOCUS" ? "object" : null;
  if (!focus) throw new Error(`'{${inner}}' needs FOCUS as its subject or object`);

  const subjTerm = focus === "subject" ? null : resolveToken(subj, base, prefixes);
  const predTerm = resolveToken(pred, base, prefixes);
  const objTerm = focus === "object" ? null : resolveToken(obj, base, prefixes);

  const out: string[] = [];
  for (const q of store.getQuads(subjTerm, predTerm, objTerm, null)) {
    const term = focus === "subject" ? q.subject : q.object;
    if (term.termType === "NamedNode") out.push(`<${term.value}>`);
    else if (term.termType === "BlankNode") out.push(`_:${term.value}`);
    // a literal FOCUS can't be validated against a shape -- skip it
  }
  return out;
}

/** Resolve a pattern token to an N3 term (or null for `_`/FOCUS = unbound). */
function resolveToken (token: string, base: string, prefixes: Record<string, string>): N3.NamedNode | null {
  if (token === "FOCUS" || token === "_") return null;
  if (token.startsWith("<") && token.endsWith(">")) return namedNode(resolve(token.slice(1, -1), base));
  const c = token.indexOf(":");
  if (c >= 0) {
    const p = token.slice(0, c), local = token.slice(c + 1);
    if (prefixes[p] !== undefined) return namedNode(prefixes[p] + local);
    throw new Error(`undefined prefix '${p}:' in '${token}'`);
  }
  throw new Error(`don't know how to resolve queryMap token '${token}'`);
}

/** `PREFIX x: <iri>` / `@prefix x: <iri>` declarations (default prefix keyed by ""). */
function collectPrefixes (text: string): Record<string, string> {
  const p: Record<string, string> = {};
  const re = /(?:@prefix|PREFIX)\s+([A-Za-z_][\w.-]*)?:\s*<([^>]*)>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) p[m[1] || ""] = m[2];
  return p;
}

const msg = (e: unknown) => (e as Error).message || String(e);
