/** Cross-document validation for the `shex.validate` command.
 *
 * Kept out of server.ts and loaded lazily: a session that only edits a schema
 * never loads the validator, and a client that never asks to validate never
 * pays for it.
 *
 * The schema may be ShExC, ShExJ, or ShExR (the language is auto-detected); the
 * data may be Turtle or TriG.  The shape map is *fixed* -- `<focusNode>@<shape>`
 * (or `@START`) per line; SPARQL-style node selectors are a later step.
 */
"use strict";

import * as ShExParser from "@shexjs/parser";
import { ShExValidator } from "@shexjs/validator";
import { ctor as RdfJsDb } from "@shexjs/neighborhood-rdfjs";
import { schemaLanguage } from "@shexjs/editor-services";
import * as N3 from "n3";
import { URL } from "url";
const ShExUtil = require("@shexjs/util");

const BASE = "http://a.example/";        // shexTest's base for relative IRIs
const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const SX_SCHEMA = "http://www.w3.org/ns/shex#Schema";

export interface ValidateResult {
  results?: unknown;
  errors?: string[];
}

export const Start = (ShExValidator as any).Start;

export function validate (schemaText: string, dataText: string, shapeMapText?: string, base: string = BASE): ValidateResult {
  let schema;
  try {
    schema = loadSchema(schemaText, base);
  } catch (e) {
    return { errors: ["schema: " + (e as Error).message] };
  }

  let store;
  try {
    store = parseData(dataText, base);
  } catch (e) {
    return { errors: ["data: " + (e as Error).message] };
  }

  const pairs = parseFixedShapeMap(shapeMapText, base, schemaBaseOf(schema, base));
  if (pairs.length === 0)
    return { errors: ["no shape map: expected `<node>@<shape>` (or `@START`) lines"] };

  return { results: validatePairs(schema, store, pairs) };
}

/** The base a schema resolved its shape ids against: a ShExC schema records it
 * as `_base` (its own `BASE` directive, else the fallback the parser was given).
 * A relative shape in a shape map -- e.g. `<PatientShape>` under a schema
 * `BASE <http://schema.example/>` -- must resolve against *that*, not against
 * the data document's base, to name the same shape the schema declared. */
export function schemaBaseOf (schema: any, fallback: string): string {
  return (schema && schema._base) || fallback;
}

/** Parse Turtle/TriG (and N-Triples/N-Quads: no `format` given) into a store,
 * resolving relative IRIs against `base` -- the same base a query map's nodes
 * resolve against, so the two name the same thing. */
export function parseData (dataText: string, base: string = BASE): N3.Store {
  const store = new N3.Store();
  store.addQuads(new N3.Parser({ baseIRI: base }).parse(dataText));
  return store;
}

/** Validate already-parsed node/shape pairs against an already-parsed schema. */
export function validatePairs (schema: any, store: N3.Store, pairs: { node: string; shape: unknown }[]): unknown {
  return new ShExValidator(schema, RdfJsDb(store), {}).validateShapeMap(pairs as any);
}

/** A single node/shape pair from its ShapeMap-compact-syntax text: an `<iri>`
 * (or relative `<rel>`) node resolved against the data's `base`, and a shape
 * that is the `START` keyword or an `<iri>` resolved against `shapeBase` (the
 * schema's base -- see schemaBaseOf; defaults to `base` for callers that don't
 * distinguish).  Resolving the shape is what makes `<PatientShape>` name the
 * schema's `http://schema.example/PatientShape`, not the bare relative string. */
export function toPair (nodeText: string, shapeText: string, base: string = BASE, shapeBase: string = base): { node: string; shape: unknown } {
  return {
    node: resolve(unwrap(nodeText), base),
    shape: /^start$/i.test(shapeText) ? Start : resolve(unwrap(shapeText), shapeBase),
  };
}

/** Parse a schema in whichever of the three surface languages it is written in
 * into the abstract syntax the validator wants. */
export function loadSchema (text: string, base: string): any {
  switch (schemaLanguage(text)) {
    case "ShExC":
      return (ShExParser as any).construct(base, {}, { index: true }).parse(text);
    case "ShExJ":
      return ShExUtil.ShExJtoAS(JSON.parse(text));
    case "ShExR":
      return loadShExR(text);
    default:
      throw new Error("unsupported schema language (DCTAP is not accepted here)");
  }
}

/** ShExR is RDF: parse it, validate it against the ShExR meta-schema starting
 * at its `sx:Schema` node, and turn the result back into a schema -- the same
 * pipeline @shexjs/loader uses for a Turtle schema. */
function loadShExR (text: string): any {
  const graph = new N3.Store();
  graph.addQuads(new N3.Parser({ baseIRI: BASE }).parse(text));
  const root = graph.getQuads(null, N3.DataFactory.namedNode(RDF_TYPE),
                              N3.DataFactory.namedNode(SX_SCHEMA), null)[0];
  if (!root)
    throw new Error("no sx:Schema node in the ShExR document");

  const metaSchema = (ShExParser as any).construct("http://www.w3.org/ns/shex", {}, { index: true })
    .parse(ShExUtil.ShExRSchema);
  const val = new ShExValidator(metaSchema, RdfJsDb(graph), {})
    .validateNodeShapePair(root.subject, (ShExValidator as any).Start);
  if (val && "errors" in val)
    throw new Error("document did not validate as ShExR");

  return ShExUtil.ShExJtoAS(ShExUtil.ShExRtoShExJ(ShExUtil.valuesToSchema(ShExUtil.valToValues(val))));
}

function parseFixedShapeMap (text: string | undefined, base: string, shapeBase: string = base): { node: string; shape: unknown }[] {
  const pairs: { node: string; shape: unknown }[] = [];
  for (const line of (text || "").split(/\n+/)) {
    const t = line.trim().replace(/,$/, "");
    if (!t || t.startsWith("#")) continue;
    const at = t.lastIndexOf("@");
    if (at < 0) continue;
    pairs.push(toPair(t.slice(0, at).trim(), t.slice(at + 1).trim(), base, shapeBase));
  }
  return pairs;
}

function unwrap (tok: string): string {
  const m = /^<(.*)>$/.exec(tok);
  return m ? m[1] : tok;
}

/** Resolve a focus node the way the data parser resolved the same relative IRI,
 * so `<Obs1>` in a query map names the node `<Obs1>` in the data. An absolute
 * IRI passes through unchanged. */
export function resolve (iri: string, base: string): string {
  try { return new URL(iri, base).href; } catch { return iri; }
}
