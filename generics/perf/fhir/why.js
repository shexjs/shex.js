/**
 * Why is a FHIR example nonconformant?
 *
 * Uses bench.js's schema and fixups, so a diagnosis is about the same
 * schema the bench reports on.
 *
 *   node perf/fhir/why.js                 # the smallest failure, in full
 *   node perf/fhir/why.js <file.ttl>      # that one, in full
 *   node perf/fhir/why.js --tally 200     # what fails, across N examples
 *
 * Each root is validated against *its own type's shape* rather than through
 * `start = @<All>`.  The two agree (85 both / 1 only-All / 0 only-type over
 * 118 files), and going direct keeps 193 vacuously-satisfied guards out of
 * the report.
 */
"use strict";
const fs = require("fs"), Path = require("path");
const N3 = require("n3");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("@shexjs/validator");
const ShExUtil = require("@shexjs/util");
const {loadSchema, dataFixups, NOT_EXAMPLES, CORPUS, FHIR} = require("./bench.js");

const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const argv = process.argv.slice(2);
const TALLY = argv.indexOf("--tally") !== -1;
const N = TALLY ? parseInt(argv[argv.indexOf("--tally") + 1] || "200", 10) : Infinity;
const ONE = argv.find(a => a.endsWith(".ttl"));
const short = s => String(s).replace(FHIR, "fhir:").replace(RDF, "rdf:")
      .replace("http://www.w3.org/2001/XMLSchema#", "xsd:");

/** the leaves of a failure, with the wrappers dropped */
function leaves (err, acc, depth) {
  if (!err || typeof err !== "object" || depth > 40) return acc;
  if (Array.isArray(err)) { err.forEach(e => leaves(e, acc, depth + 1)); return acc; }
  switch (err.type) {
  case "MissingProperty":       acc.push("missing " + short(err.property)); return acc;
  case "ExcessTripleViolation": acc.push("excess " + short(err.triple && err.triple.predicate)); return acc;
  case "ClosedShapeViolation":
    (err.unexpectedTriples || []).forEach(t => acc.push("unexpected " + short(t.predicate)));
    return acc;
  case "NodeConstraintViolation": {
    const leaf = (err.errors || [])[0] || {};
    acc.push("nodeconstraint " + (leaf.type || "?")
             + (leaf.type === "DatatypeMismatch" ? " want " + short(leaf.expected) : ""));
    return acc;
  }
  case "AbstractShapeFailure":  acc.push("abstract " + short(err.shape)); return acc;
  case "SemActFailure":         acc.push("semact"); return acc;
  default: return leaves(err.errors !== undefined ? err.errors : err.solution, acc, depth + 1);
  }
}

function main () {
  const {schema} = loadSchema();
  const files = (ONE ? [ONE] : fs.readdirSync(Path.join(CORPUS, "examples"))
    .filter(f => f.endsWith(".ttl") && NOT_EXAMPLES.indexOf(f) === -1).sort().slice(0, N));
  const failures = [], tally = {};
  let pass = 0;
  for (const f of files) {
    const graph = new N3.Store();
    try {
      graph.addQuads(new N3.Parser({baseIRI: FHIR, format: "text/turtle"})
        .parse(fs.readFileSync(Path.join(CORPUS, "examples", f), "utf8")));
    } catch (e) { continue; }
    dataFixups.forEach(fixup => fixup.apply(graph));
    for (const node of graph.getQuads(null, FHIR + "nodeRole", FHIR + "treeRoot", null).map(q => q.subject)) {
      const type = graph.getQuads(node, RDF + "type", null, null).map(q => q.object.value)[0];
      if (type === undefined) continue;
      let result;
      try {
        result = new ShExValidator(schema, RdfJsDb(graph), {repairs: false})
          .validateShapeMap([{node: node.value, shape: type}])[0];
      } catch (e) {
        const why = "ABORTED " + String(e).split("\n")[0].slice(0, 44);
        tally[why] = (tally[why] || 0) + 1; continue;
      }
      if (result.status === "conformant") { ++pass; continue; }
      failures.push({f, size: graph.size, type, appinfo: result.appinfo});
      [...new Set(leaves(result.appinfo, [], 0))].forEach(l => tally[l] = (tally[l] || 0) + 1);
    }
  }

  if (TALLY) {
    console.log("conformant " + pass + ", nonconformant " + failures.length);
    console.log("--- leaves, by how many roots show them "
                + "(a root shows every failed branch, so these overcount)");
    Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 20)
      .forEach(([k, v]) => console.log("  " + String(v).padStart(4) + "  " + k));
    console.log("\n--- smallest failures, which are the ones worth reading");
    failures.sort((a, b) => a.size - b.size).slice(0, 8).forEach(x =>
      console.log("  " + String(x.size).padStart(5) + " quads  " + x.f + "  (" + short(x.type) + ")"));
    return;
  }

  failures.sort((a, b) => a.size - b.size);
  const pick = failures[0];
  if (pick === undefined) { console.log("nothing failed"); return; }
  console.log("=== " + pick.f + " (" + pick.size + " quads, " + short(pick.type) + ")\n");
  console.log(ShExUtil.errsToSimple(pick.appinfo).join("\n")
              .replace(new RegExp(FHIR, "g"), "fhir:").replace(new RegExp(RDF, "g"), "rdf:"));
}

main();
