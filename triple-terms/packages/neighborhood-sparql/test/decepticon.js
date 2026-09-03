"use strict";
/**
 * The DECEPTICON: decoy triples loaded next to every test's data.
 *
 * Two layers:
 *   decepticon.ttl  hand-written topologies (see the comments in that file)
 *   mirror          every shexTest validation graph, rewritten into the
 *                   decepticon namespace
 *
 * The mirror keeps predicates, literals and structure and moves only the
 * subjects and objects, so the decoys use the same vocabulary as whatever the
 * suite grows next.  That's the whole trick: a neighborhood query that isn't
 * anchored to a ground term can't tell the copy from the original.
 *
 * Nothing here may name an IRI a test might focus on, or the decoys would be
 * adding real arcs to real nodes rather than tempting bad queries.
 */

const fs = require("fs");
const path = require("path");
const N3 = require("n3");

const DECEPTICON_NS = "http://decepticon.example/mirror/";

/** IRIs that carry meaning to a parser or a validator and so stay put. */
const KEEP = [
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  "http://www.w3.org/2000/01/rdf-schema#",
  "http://www.w3.org/2001/XMLSchema#",
];

/** Files that aren't test data. */
const SKIP = /^(manifest|__)/;

function rewriteIri (iri) {
  if (KEEP.some(ns => iri.startsWith(ns))) return iri;
  return DECEPTICON_NS + encodeURIComponent(iri);
}

function mirrorTerm (term, factory) {
  return term.termType === "NamedNode" ? factory.namedNode(rewriteIri(term.value)) : term;
}

/**
 * Mirror every .ttl in `validationPath` into the decepticon namespace.
 * @returns {import("n3").Quad[]}
 */
function mirrorValidationData (validationPath) {
  const factory = N3.DataFactory;
  const out = [];
  for (const file of fs.readdirSync(validationPath).sort()) {
    if (!file.endsWith(".ttl") || SKIP.test(file)) continue;
    const abs = path.join(validationPath, file);
    let quads;
    try {
      // A fresh parser per file keeps each file's blank nodes to itself.
      quads = new N3.Parser({baseIRI: "http://decepticon.example/src/" + file, factory}).parse(
        fs.readFileSync(abs, "utf8"));
    } catch (e) {
      continue; // the suite ships a few deliberately unparseable graphs
    }
    for (const q of quads)
      out.push(factory.quad(mirrorTerm(q.subject, factory), q.predicate, mirrorTerm(q.object, factory)));
  }
  return out;
}

/** The hand-written layer, as Turtle. */
function handWritten () {
  return fs.readFileSync(path.join(__dirname, "decepticon.ttl"), "utf8");
}

/** Load the whole DECEPTICON into an endpoint. Returns the triple count. */
function loadInto (endpoint, validationPath) {
  let n = endpoint.loadTurtle(handWritten(), "http://decepticon.example/");
  if (validationPath) {
    const quads = mirrorValidationData(validationPath);
    endpoint.loadQuads(quads);
    n += quads.length;
  }
  return n;
}

module.exports = {mirrorValidationData, handWritten, loadInto, DECEPTICON_NS};
