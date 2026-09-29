#!/usr/bin/env node
/**
 * yamlld-to-nested-turtle.js - read a YAML-LD document (YAML that parses into
 * JSON structured to be valid JSON-LD, e.g. doc/tests-manifest-ld.yaml), turn
 * it into real RDF quads by resolving its @context the way any JSON-LD
 * consumer would (IRI expansion, no shortcuts), and pretty-print the result
 * as nested Turtle with extension-map's own NestedWriter -- the same writer
 * ShExMapPlugin.ts uses to preview a materialization.
 *
 * The point: a stacked, multi-namespace @context (see doc/manifest-
 * vocabulary.md and doc/tests-manifest-ld.yaml) is easy to get subtly wrong
 * (an array value where a term needs @container, a false-cognate alias to
 * someone else's IRI); this shows the graph it actually produces, not just
 * its raw JSON-LD form, so a mistake is visible by eye.
 *
 * Usage:
 *   node tools/yamlld-to-nested-turtle.js path/to/doc.yaml
 *   node tools/yamlld-to-nested-turtle.js < path/to/doc.yaml
 *   cat path/to/doc.yaml | node tools/yamlld-to-nested-turtle.js -
 *
 * A relative URL in @context (or in an @id/@type/document-reference value)
 * resolves against the input file's own location, same as a browser would
 * resolve one found in an HTML page at that path; an http(s) one is fetched
 * for real -- except one under a MIRRORS prefix whose file exists in the
 * sibling checkout named there, which is read from that checkout instead,
 * by an out-of-project relative link from this file.  That is how a
 * vocabulary that lives beside its extension's spec (shexSpec/extensions)
 * is worked on before that site publishes it; once published, deleting or
 * moving the checkout makes the fetch happen.
 */
"use strict";

const Fs = require("fs");
const Path = require("path");
const YAML = require("js-yaml");
const jsonld = require("jsonld");
const N3 = require("n3");
const { Writer: NestedWriter } = require("../packages/extension-map/lib/NestedWriter");

const DF = N3.DataFactory;

/** an absolute-IRI-looking string, as opposed to a compact IRI (prefix:local)
 * or a plain property alias -- what actually belongs in a Turtle PREFIX line */
const ABSOLUTE_IRI = /^[a-z][a-z0-9+.-]*:\/\//i;

function usage (message) {
  if (message)
    console.error(message);
  console.error("usage: yamlld-to-nested-turtle.js [file.yaml|-]");
  process.exit(message ? 1 : 0);
}

function readInput (arg) {
  if (arg === "--help" || arg === "-h")
    usage();
  if (!arg || arg === "-")
    return {text: Fs.readFileSync(0, "utf8"), baseFile: Path.resolve("stdin.yaml")};
  return {text: Fs.readFileSync(arg, "utf8"), baseFile: Path.resolve(arg)};
}

/** published prefixes read from a sibling checkout while unpublished: the
 * URL's identity stays the published one, so what it says resolves as it
 * will once it is up there */
const MIRRORS = {
  "https://shexspec.github.io/extensions/": Path.join(__dirname, "..", "..", "..", "shexSpec", "extensions"),
};

/** resolve a relative context/document reference against `baseFile`'s
 * directory; fetch http(s) ones for real over the network, unless a MIRRORS
 * checkout has them */
function makeDocumentLoader (baseFile) {
  const nodeLoader = jsonld.documentLoaders.node();
  const noted = new Set();
  return async function documentLoader (url) {
    if (/^https?:/.test(url)) {
      for (const [prefix, dir] of Object.entries(MIRRORS)) {
        if (!url.startsWith(prefix))
          continue;
        const local = Path.join(dir, url.slice(prefix.length));
        if (!Fs.existsSync(local))
          continue;
        if (!noted.has(url)) {
          noted.add(url);
          console.error(`# ${url}: read from ${Path.relative(process.cwd(), local)} (unpublished)`);
        }
        return {contextUrl: null, documentUrl: url, document: JSON.parse(Fs.readFileSync(local, "utf8"))};
      }
      return nodeLoader(url);
    }
    const file = url.startsWith("file://") ? url.slice("file://".length)
          : Path.resolve(Path.dirname(baseFile), url);
    return {contextUrl: null, documentUrl: url, document: JSON.parse(Fs.readFileSync(file, "utf8"))};
  };
}

/** the prefixes a stacked @context declares, for pretty-printing: walk every
 * context it references (a URL is fetched and recursed into, same as
 * documentLoader above) and keep the string-valued mappings that are
 * themselves absolute IRIs -- a namespace prefix, not a property alias like
 * `"comment": "rdfs:comment"` (which names a property, not a namespace) */
async function collectPrefixes (contextValue, documentLoader, seen = new Set()) {
  const prefixes = {};
  const merge = async (value) => {
    if (value === null || value === undefined)
      return;
    if (Array.isArray(value)) {
      for (const v of value)
        await merge(v);
    } else if (typeof value === "string") {
      if (seen.has(value))
        return;
      seen.add(value);
      const {document} = await documentLoader(value);
      await merge(document && document["@context"]);
    } else if (typeof value === "object") {
      for (const [k, v] of Object.entries(value))
        if (typeof v === "string" && ABSOLUTE_IRI.test(v))
          prefixes[k] = v;
    }
  };
  await merge(contextValue);
  return prefixes;
}

/** an RDF/JS-shaped plain object (jsonld.toRDF's own quads, not full N3 term
 * instances) turned into real N3 terms, which is what NestedWriter's
 * coreference and same-subject bookkeeping compares with .equals() */
function toRdfJsQuad (q) {
  return DF.quad(DF.fromTerm(q.subject), DF.fromTerm(q.predicate), DF.fromTerm(q.object), DF.fromTerm(q.graph));
}

const termKey = (t) => t.termType + " " + t.value;

/** NestedWriter needs a blank node's own quads to arrive immediately after
 * the quad (or, for one held in an RDF list, the list membership) that
 * introduces it -- otherwise it has already been written as a standalone
 * top-level statement by the time the writer meets the link, and nests
 * nothing but an empty `[]`.  jsonld.toRDF's quad order doesn't promise
 * this (nor does N3.Store's, which is index order); this is a depth-first
 * walk that does, assuming (like extension-map's own materializer output)
 * the graph is a tree -- a blank node reachable more than one way is only
 * nested at the first arrival and flushed as a fallback top-level
 * statement at the rest. */
function orderForNesting (quads, lists) {
  const bySubject = new Map();
  for (const q of quads) {
    const k = termKey(q.subject);
    if (!bySubject.has(k))
      bySubject.set(k, []);
    bySubject.get(k).push(q);
  }
  const referencedBlank = new Set();
  for (const q of quads)
    if (q.object.termType === "BlankNode")
      referencedBlank.add(q.object.value);
  for (const members of Object.values(lists || {}))
    for (const m of members)
      if (m.termType === "BlankNode")
        referencedBlank.add(m.value);

  const introduced = new Set();
  const out = [];
  const visit = (key) => {
    if (introduced.has(key))
      return;
    introduced.add(key);
    for (const q of (bySubject.get(key) || [])) {
      out.push(q);
      if (q.object.termType === "BlankNode")
        visit(termKey(q.object));
      else if (lists && (q.object.value in lists))
        for (const m of lists[q.object.value])
          if (m.termType === "BlankNode")
            visit(termKey(m));
    }
  };
  // roots: every subject nothing else points at, in first-appearance order
  for (const q of quads) {
    if (q.subject.termType === "BlankNode" && referencedBlank.has(q.subject.value))
      continue;
    visit(termKey(q.subject));
  }
  // fallback: a blank node only reachable via a cycle or a second reference
  for (const q of quads)
    visit(termKey(q.subject));
  return out;
}

async function main () {
  const {text, baseFile} = readInput(process.argv[2]);
  const doc = YAML.load(text);
  if (doc === null || typeof doc !== "object")
    usage("not a YAML mapping or sequence: " + baseFile);

  const documentLoader = makeDocumentLoader(baseFile);
  const base = "file://" + baseFile;

  const [rawQuads, prefixes] = await Promise.all([
    jsonld.toRDF(doc, {base, documentLoader}),
    collectPrefixes(doc["@context"], documentLoader),
  ]);

  // extractLists turns an RDF collection's rdf:first/rest/nil chain into a
  // members array NestedWriter can render as `( ... )`, the same step
  // ShExMapPlugin.ts's writeNestedTurtle takes before handing quads to it
  const store = new N3.Store();
  store.addQuads(rawQuads.map(toRdfJsQuad));
  const lists = store.extractLists({remove: true});
  const ordered = orderForNesting(store.getQuads(), lists);

  const writer = new NestedWriter(process.stdout, {
    format: "text/turtle",
    prefixes,
    lists,
    version: 1.1,
    indent: "  ",
    checkCorefs: () => false, // no cycle detection -- trust the input to be a tree
  });
  writer.addQuads(ordered);
  writer.end();
}

main().catch(e => { console.error(e.stack || e.message); process.exit(1); });
