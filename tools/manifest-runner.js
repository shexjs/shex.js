/**
 * A manifest entry, read the way the app reads one -- in node.
 *
 * The three example manifests are read by four things besides the app:
 * shex-webapp's examples-test, extension-reduce's Examples-test,
 * extension-map's Map-test and ThreadedMaterializer-test, and
 * tools/aggregate-manifests.js.  Each used to interpret an entry its own
 * way; this is the one interpretation.
 *
 *   const {readManifest, validateEntry} = require("../../../tools/manifest-runner");
 *   const {dir, entries} = readManifest(path);
 *   const {verdict, results} = validateEntry(entries[0], dir);
 *
 * A document is named inline (`schema:`, `data:`, `overlay:`) or by a path
 * relative to the manifest (`schemaURL:` ...); `data` may be a list, one
 * graph in several documents.  A query map may name its nodes or ask the
 * data for them with `{FOCUS <p> <o>}`.
 */
"use strict";

const Fs = require("fs");
const Path = require("path");

/** the keys whose value is a document reference (the app resolves them
 * against the manifest: `<key>URL` for a document, and the plugin lists) */
const isReference = key => /URL$/.test(key) || key === "sitematrix" || key === "plugins";

function readManifest (file) {
  const text = Fs.readFileSync(file, "utf8");
  const entries = /\.ya?ml$/.test(file) ? require("js-yaml").load(text) : JSON.parse(text);
  return {dir: Path.dirname(file), entries};
}

/** the text(s) an entry gives for `key`: inline, or read from `<key>URL` */
function textOf (entry, key, dir) {
  if (entry[key] !== undefined)
    return entry[key];
  const ref = entry[key + "URL"];
  if (ref === undefined)
    return undefined;
  const read = f => Fs.readFileSync(Path.join(dir, f), "utf8");
  return Array.isArray(ref) ? ref.map(read) : read(ref);
}

/** a copy of the entry with every `<key>URL` also present as `<key>` text */
function resolveTexts (entry, dir) {
  const out = Object.assign({}, entry);
  for (const key of Object.keys(entry))
    if (/URL$/.test(key) && key !== "manifestURL")
      out[key.slice(0, -3)] = textOf(entry, key.slice(0, -3), dir);
  return out;
}

const BASE = "http://a.example/";

/** the entry's schema (overlay applied) and data (one store), parsed as the app parses them */
function loadEntry (entry, dir, options = {}) {
  const base = options.base || BASE;
  const ShExParser = require("@shexjs/parser");
  const N3 = require("n3");
  let schema = ShExParser.construct(base, null, {index: true}).parse(textOf(entry, "schema", dir), base);
  const overlayText = textOf(entry, "overlay", dir);
  if (overlayText !== undefined) {
    const overlay = new N3.Store();
    overlay.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"}).parse(overlayText));
    schema = require("@shexjs/semact-overlay").applyOverlay(schema, overlay, {prefixes: schema._prefixes || {}});
  }
  const store = new N3.Store();
  const dataPrefixes = {};
  for (const text of [].concat(textOf(entry, "data", dir) === undefined ? [] : textOf(entry, "data", dir))) {
    // several documents are one graph, each parsed on its own; a query
    // map is written in their prefixes
    const parser = new N3.Parser({baseIRI: base, format: "application/trig", blankNodePrefix: ""}); // TriG ⊇ Turtle (doc/datasets.md)
    store.addQuads(parser.parse(text));
    Object.assign(dataPrefixes, parser._prefixes);
  }
  return {schema, store, dataPrefixes, base};
}

/** the fixed map an entry's query map means over its data: `{FOCUS <p> <o>}` asks the store */
function fixedMapOf (entry, {schema, store, dataPrefixes, base}) {
  const ShapeMap = require("shape-map");
  const {ShExValidator} = require("@shexjs/validator");
  ShapeMap.Start = ShExValidator.Start;
  // shape labels resolve against the schema's base, node names against
  // the data's -- the two need not be the same document
  const asked = ShapeMap.Parser.construct(
    base, {base: schema._base || base, prefixes: schema._prefixes || {}},
    {base, prefixes: dataPrefixes}).parse(entry.queryMap);
  return asked.flatMap(pair => {
    if (typeof pair.node === "string")
      return [pair];
    const pattern = pair.node;
    if (pattern.type !== "TriplePattern" || !pattern.subject || pattern.subject.term !== "FOCUS")
      throw Error("unsupported query map: " + JSON.stringify(pattern));
    return store.getQuads(null, pattern.predicate, pattern.object).map(q => Object.assign({}, pair, {
      node: q.subject.termType === "BlankNode" ? "_:" + q.subject.value : q.subject.value}));
  });
}

/**
 * Validate an entry and say whether it did what it claims.  `node@!shape`
 * in a query map says that pair is expected not to conform, so the verdict
 * is "conformant" when every pair came out as it was written to.
 * `options.prepare(validator, schema)` registers whatever the entry's
 * schema dispatches on (a plugin's extension) before anything validates.
 */
function validateEntry (entry, dir, options = {}) {
  const {ShExValidator} = require("@shexjs/validator");
  const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
  const loaded = loadEntry(entry, dir, options);
  const fixed = fixedMapOf(entry, loaded);
  if (fixed.length === 0)
    throw Error("nothing to validate: " + entry.queryMap);
  const validator = new ShExValidator(loaded.schema, RdfJsDb(loaded.store), options.validatorOptions || {});
  if (options.prepare)
    options.prepare(validator, loaded.schema);
  const results = [].concat(validator.validateShapeMap(fixed.map(p => ({node: p.node, shape: p.shape}))));
  const surprises = results.filter((r, i) =>
    r.status !== (fixed[i].status === "nonconformant" ? "nonconformant" : "conformant"));
  return Object.assign({fixed, results, surprises, verdict: surprises.length ? "nonconformant" : "conformant"}, loaded);
}

module.exports = {isReference, readManifest, textOf, resolveTexts, loadEntry, fixedMapOf, validateEntry};
