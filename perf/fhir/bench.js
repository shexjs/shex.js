/**
 * Validate the published FHIR examples against the published FHIR schema,
 * and report where the time goes.
 *
 * The test suite has been standing in for a benchmark, which it is bad at:
 * it says pass or fail, its inputs are tiny, and it exercises the shapes a
 * spec test-writer thought of rather than the shapes a real schema uses.
 * FHIR is the opposite on all three counts -- ~1400 shapes, ~2200 example
 * documents, deep EXTENDS chains and a <Resource> that is an OR over
 * everything -- and it is the kind of data ShEx.js is actually pointed at.
 *
 * Fetch the corpus first: perf/fhir/fetch.sh
 *
 *   node perf/fhir/bench.js                    # everything, default engine
 *   node perf/fhir/bench.js --limit 200        # first 200 examples
 *   node perf/fhir/bench.js --engine 1err      # the other regex engine
 *   node perf/fhir/bench.js --no-repairs       # without the repair search
 *   node perf/fhir/bench.js --failures         # print what didn't conform
 *
 * FIXUPS: the schema as published does not parse, and a few examples do not
 * either.  Each fixup is applied here, in one place, and counted in the
 * report -- so "fixups applied: 0" is the goal as the FHIR sources improve,
 * and the report says what would have to change to get there.
 */
"use strict";
const fs = require("fs"), Path = require("path");
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("@shexjs/validator");

const FHIR = "http://hl7.org/fhir/";
const CORPUS = Path.join(__dirname, "corpus");

const argv = process.argv.slice(2);
const opt = (name, dflt) => {
  const at = argv.indexOf("--" + name);
  return at === -1 ? dflt : (argv[at + 1] && !argv[at + 1].startsWith("--") ? argv[at + 1] : true);
};
if (opt("help", false)) {
  console.log(fs.readFileSync(__filename, "utf8").split("*/")[0].replace(/^\/\*\*?|^ \* ?/gm, ""));
  process.exit(0);
}
const LIMIT = parseInt(opt("limit", "0"), 10) || Infinity;
const ENGINE = opt("engine", "nerr");
const REPAIRS = !opt("no-repairs", false);
const SHOW_FAILURES = !!opt("failures", false);
const SLOW = parseInt(opt("slow", "10"), 10);

/** Every change this makes to what FHIR publishes, with why. */
const schemaFixups = [
  {
    what: "delete the 'any resource' <Resource> union (redundant once "
      + "<Resource> is ABSTRACT, and it closes a cycle in EXTENDS)",
    // fhir.shex declares <Resource> twice, for two different jobs:
    //   ~4246  <Resource> CLOSED {}          the structural base, which
    //                                        <DomainResource> EXTENDS
    //   ~13184 <Resource> @<Account> OR ...  194 alternatives: "any resource"
    // The parser rejects the schema outright ("Resource already defined").
    // The union is a pre-EXTENDS idiom -- a hand-rolled way to say "anything
    // derived from Resource" -- and with EXTENDS it is not merely redundant
    // but illegal: <Account> EXTENDS <DomainResource> EXTENDS <Resource>,
    // and the union names <Account>, closing a cycle in the extension
    // hierarchy, which the spec says MUST be acyclic.  Making <Resource>
    // ABSTRACT (below) gives value-position @<Resource> the same meaning by
    // dispatching to non-abstract descendants.
    apply: text => {
      const lines = text.split("\n");
      const start = lines.findIndex(l => /^<Resource>\s+@</.test(l));
      if (start === -1) return text;
      const end = lines.findIndex((l, i) => i > start && /^<[A-Za-z]/.test(l));
      return lines.slice(0, start).concat(lines.slice(end === -1 ? start + 1 : end)).join("\n");
    },
  },
  {
    what: "<Resource> is emitted as an empty CLOSED {}: give it ABSTRACT, "
      + "EXTENDS @<Base>, and its four elements",
    // Per its own StructureDefinition, Resource is abstract, based on Base,
    // and has id, meta, implicitRules and language.  What is emitted has
    // none of them -- not even the `a [fhir:Resource]?; fhir:nodeRole ...`
    // preamble every other shape carries -- so every resource carrying a
    // fhir:id fails against the CLOSED shapes that extend it.
    apply: text => text.replace(/<Resource> CLOSED \{\s*\n\}/,
`ABSTRACT <Resource> EXTENDS @<Base> CLOSED {
    a [fhir:Resource]?;fhir:nodeRole [fhir:treeRoot]?;

    fhir:id @<Id>?;
    fhir:meta @<Meta>?;
    fhir:implicitRules @<Uri>?;
    fhir:language @<Code>?;
}`),
  },
  {
    what: "<All> joins its per-type guards with OR; they have to be AND",
    // <All> is (NOT {is a T treeRoot} OR @<T>) for each of 194 types.  Each
    // term is right, but joined with OR any one satisfies the whole: a node
    // is at most one type, so ~193 terms hold vacuously through their NOT
    // branch and <All> accepts anything at all.  Joined with AND it says
    // what it means -- whichever type you are, conform to it.  Without this
    // the suite reports every document conformant, including ones with
    // invented properties and out-of-value-set codes.
    apply: text => text.replace(/\) OR\n(\t\(NOT \{ fhir:nodeRole)/g, ") AND\n$1"),
  },
  {
    what: "<Uri> has no fhir:l, though every URI-valued node carries one",
    // FHIR RDF gives a URI-valued node both spellings -- the lexical form
    // as fhir:v and the IRI as fhir:l:
    //     fhir:system [ fhir:v "urn:oid:0.1.2"^^xsd:anyURI ;
    //                   fhir:l <urn:oid:0.1.2> ]
    // but <Reference> is the only shape in the file that declares fhir:l,
    // so every other such node fails its CLOSED shape with "unexpected
    // fhir:l".  On <Uri> it reaches Url, Canonical, Oid and Uuid through
    // EXTENDS.  Worth 3 -> 29 conformant of the first 60 examples on its
    // own, which makes it the largest single gap after <All>.
    apply: text => text.replace(
      /<Uri> EXTENDS @<PrimitiveType> CLOSED \{\s*\n    a \[fhir:Uri\]\?;/,
      "<Uri> EXTENDS @<PrimitiveType> CLOSED {\n    a [fhir:Uri]?;\n    fhir:l IRI?;"),
  },
  {
    what: "integer primitives: the schema says xsd:int, the data never uses it",
    // <Integer> constrains fhir:v to xsd:int, and <PositiveInt> and
    // <UnsignedInt> EXTEND it, so they inherit xsd:int too -- which they
    // could not override anyway, since EXTENDS conjoins and a literal has
    // one datatype.  The examples never emit xsd:int at all: 2423
    // xsd:nonNegativeInteger, 295 xsd:positiveInteger, 39 xsd:long.  The
    // writer appears to pick the narrowest XSD type that fits the *value*
    // where the schema expects the one implied by the FHIR *type*.
    // Accepting the union is the smallest change that lets the rest of a
    // document be judged; which side should really move is a question for
    // FHIR (hcls-fhir-rdf#245, #246).  Worth 60 -> 83 of 118.
    apply: text => text
      .replace(/fhir:v xsd:int MININCLUSIVE -2147483648 MAXINCLUSIVE 2147483647\?;/,
               "fhir:v (xsd:int OR xsd:integer OR xsd:nonNegativeInteger OR xsd:positiveInteger)?;")
      .replace(/fhir:v xsd:long MININCLUSIVE -9223372036854775808 MAXINCLUSIVE 9223372036854775807\?;/,
               "fhir:v (xsd:long OR xsd:integer OR xsd:nonNegativeInteger OR xsd:positiveInteger)?;"),
  },
  {
    what: "reference targets: fhir:l @<Target> demands a whole resource that "
      + "a single document doesn't contain",
    // `fhir:securityContext @<Reference> AND {fhir:l @<Resource>?}` asks the
    // *referent* to conform.  An example document carries a stub for what it
    // points at -- `<DocumentReference/example> a fhir:DocumentReference` and
    // nothing else -- so the referent can never conform, and with <Resource>
    // abstract the failure is reported once per resource type.  Relaxing the
    // target to an IRI validates the document rather than the world.
    // Loading every example into one store instead makes the references
    // resolve, but is stricter, not looser: the referents get validated too.
    // Worth 38 -> 60 of 118.
    // `[^{}]*` rather than a bounded `[\s\S]{0,400}?`: these inline shapes
    // nest no braces but can be very long, e.g. Reference targets spelled as
    // a fifteen-way OR, and a length cap silently left those unrelaxed.
    apply: text => text.replace(/\{fhir:l[^{}]*\}/g, "{fhir:l IRI?}"),
  },
  {
    what: "Bundle.entry.resource is 0..1 but the data wraps it in an RDF list",
    // `fhir:resource ( <urn:uuid:...> )` against `fhir:resource @<Resource>?`.
    // 1383 occurrences across 102 files -- and the same predicate also
    // appears unwrapped as `fhir:resource [ ... ]`, so the writer is
    // inconsistent with itself.  Accepting both here; the writer is where
    // it should be settled (hcls-fhir-rdf#245).
    apply: text => text.replace(/fhir:resource @<Resource>\?;/,
                                "fhir:resource (@<OneOrMore_Resource> OR @<Resource>)?;"),
  },
  {
    what: "a repeating coded element binds its value set to the list, not the members",
    // For a single-valued coded element the generator emits
    //     fhir:status @<Code> AND {fhir:v @fhirvs:account-status};
    // which is right: the Code node carries fhir:v.  For a *repeating* one it
    // emits
    //     fhir:format @<OneOrMore_Code> AND {fhir:v @fhirvs:supplemented-mimetypes};
    // and ANDs the binding onto the RDF *list*, which has rdf:first and
    // rdf:rest and no fhir:v at all -- so the element can never match.  30
    // occurrences, against 297 of the correct single-valued form.  The
    // binding belongs on the list's members; dropping it here keeps the
    // structure checkable at the cost of not checking those 30 value sets.
    apply: text => text.replace(
      /(@<OneOrMore_[A-Za-z_.]*>) AND\s*\{fhir:v @fhirvs:[^}]*\}/g, "$1"),
  },
  {
    what: "<Xhtml> and <SimpleQuantity> are referenced but never declared",
    // These are the only two dangling references in the schema -- checked by
    // collecting every shape reference and subtracting the declared labels,
    // so it is a complete list rather than what happened to be hit:
    //     11x @<SimpleQuantity>     1x @<Xhtml>
    // Undeclared, they don't fail a document, they abort it: "shape
    // http://hl7.org/fhir/SimpleQuantity not found", 26 files corpus-wide.
    // SimpleQuantity is FHIR's Quantity with comparator prohibited; a
    // stand-in that extends Quantity is close enough to judge the rest.
    apply: text => {
      if (!/^<Xhtml>/m.test(text))
        text += "\n# stand-in for the dangling reference at fhir:div @<Xhtml>\n<Xhtml> .\n";
      if (!/^<SimpleQuantity>/m.test(text))
        text += "\n# stand-in: FHIR's SimpleQuantity is a Quantity forbidding comparator\n"
          + "<SimpleQuantity> EXTENDS @<Quantity> CLOSED {\n    a [fhir:SimpleQuantity]?;\n}\n";
      return text;
    },
  },
];

/** Examples that aren't examples: the ontologies, which carry no treeRoot. */
const NOT_EXAMPLES = ["fhir.ttl", "rim.ttl", "w5.ttl"];

/**
 * Fixups to the *data*, counted like the schema ones.
 *
 * Same rule: each is a thing the published examples would have to change,
 * and the goal is zero.
 */
const dataFixups = [
  {
    what: "an element written with no value, e.g. `fhir:expansion []` or "
      + "`fhir:asNeededFor ( [] )`",
    // 1115 occurrences across 1115 files -- fhir:expansion (682),
    // fhir:hierarchyMeaning (343), fhir:dosageInstruction (68) and a tail.
    // The Turtle asserts that the element is present and then gives it no
    // value at all, which no shape can match: the object needs a fhir:v (or
    // whatever the element's own shape wants), and if there is nothing to
    // say, the element should simply be absent.
    //
    // Repeating elements get the same treatment one level in -- `( [] )` is
    // a list whose only member is valueless -- so this runs to a fixpoint:
    // drop valueless objects, then drop any list cell left without an
    // rdf:first, which turns `( [] )` into nothing rather than into a
    // malformed list.
    apply: graph => {
      const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
      let removed = 0, changed = true;
      while (changed) {
        changed = false;
        for (const q of graph.getQuads(null, null, null, null)) {
          if (q.object.termType !== "BlankNode") continue;
          const arcs = graph.getQuads(q.object, null, null, null);
          const valueless = arcs.length === 0;
          const brokenCell = arcs.length > 0
                && arcs.every(a => a.predicate.value === RDF + "rest");
          if (!valueless && !brokenCell) continue;
          arcs.forEach(a => { graph.removeQuad(a); ++removed; });
          graph.removeQuad(q); ++removed; changed = true;
        }
      }
      return removed;
    },
  },
];

function loadSchema () {
  const at = Path.join(CORPUS, "fhir.shex");
  if (!fs.existsSync(at))
    fail("no corpus: run perf/fhir/fetch.sh first");
  let text = fs.readFileSync(at, "utf8");
  const applied = [];
  for (const fixup of schemaFixups) {
    const after = fixup.apply(text);
    if (after !== text) { applied.push(fixup.what); text = after; }
  }
  const t = Date.now();
  const schema = ShExParser.construct(FHIR, {}, {index: true}).parse(text);
  return {schema, ms: Date.now() - t, applied};
}

function fail (why) { console.error(why); process.exit(1); }

function percentile (sorted, p) {
  return sorted.length === 0 ? 0 : sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
}

function main () {
  const {schema, ms: schemaMs, applied} = loadSchema();
  const shapeCount = Object.keys(schema.shapes || {}).length;
  const options = {repairs: REPAIRS};
  if (ENGINE === "1err")
    options.regexModule = require("@shexjs/eval-simple-1err").RegexpModule;

  const files = fs.readdirSync(Path.join(CORPUS, "examples"))
        .filter(f => f.endsWith(".ttl") && NOT_EXAMPLES.indexOf(f) === -1)
        .sort().slice(0, LIMIT);

  console.log("engine=" + ENGINE + "  repairs=" + REPAIRS
              + "  shapes=" + shapeCount + "  examples=" + files.length);
  console.log("schema parsed in " + schemaMs + "ms"
              + (applied.length ? "; fixups applied: " + applied.length : "; fixups applied: 0"));
  applied.forEach(w => console.log("  fixup: " + w));

  const timings = [], nonconformant = [], broken = {};
  let conformant = 0, parseMs = 0, validateMs = 0, quads = 0, dataFixupCount = 0;
  const wall = Date.now();

  for (const f of files) {
    let graph;
    try {
      const t = Date.now();
      graph = new N3.Store();
      graph.addQuads(new N3.Parser({baseIRI: FHIR, format: "text/turtle"})
        .parse(fs.readFileSync(Path.join(CORPUS, "examples", f), "utf8")));
      parseMs += Date.now() - t;
      dataFixups.forEach(fixup => { dataFixupCount += fixup.apply(graph); });
      quads += graph.size;
    } catch (e) {
      record(broken, "turtle: " + short(e), f);
      continue;
    }
    // FHIR marks the document's subject with fhir:nodeRole fhir:treeRoot
    const roots = graph.getQuads(null, FHIR + "nodeRole", FHIR + "treeRoot", null)
          .map(q => q.subject.value);
    if (roots.length === 0) { record(broken, "no fhir:treeRoot", f); continue; }
    try {
      const t = Date.now();
      const results = new ShExValidator(schema, RdfJsDb(graph), options)
            .validateShapeMap(roots.map(node => ({node, shape: ShExValidator.Start})));
      const took = Date.now() - t;
      validateMs += took;
      timings.push({f, ms: took, quads: graph.size});
      // Keep the failure *tree* only when something will print it: with
      // <All> every failure carries 194 branches, each with its own repairs,
      // and holding thousands of those turned a 13ms median into a run that
      // spent 42 minutes in GC -- one 83-quad document was billed 16 minutes
      // for work that takes 15ms on its own.
      results.forEach(r => r.status === "conformant" ? ++conformant
                      : nonconformant.push(SHOW_FAILURES ? {f, appinfo: r.appinfo} : {f}));
    } catch (e) {
      record(broken, "validator: " + short(e), f);
    }
  }

  const sorted = timings.map(t => t.ms).sort((a, b) => a - b);
  console.log("\n--- " + files.length + " examples, " + quads + " quads, "
              + (Date.now() - wall) + "ms wall");
  console.log("    turtle " + parseMs + "ms, validation " + validateMs + "ms"
              + (timings.length ? "  (median " + percentile(sorted, .5) + "ms, p90 "
                 + percentile(sorted, .9) + "ms, max " + sorted[sorted.length - 1] + "ms)" : ""));
  if (dataFixupCount > 0)
    console.log("    data fixups: " + dataFixupCount + " triple(s) -- "
                + dataFixups.map(f => f.what).join("; "));
  console.log("    conformant " + conformant + ", nonconformant " + nonconformant.length
              + ", unfinished " + Object.values(broken).reduce((n, l) => n + l.length, 0));

  const worst = timings.sort((a, b) => b.ms - a.ms).slice(0, SLOW);
  if (worst.length) {
    console.log("\n--- slowest");
    worst.forEach(t => console.log("    " + String(t.ms).padStart(7) + "ms  "
                                   + String(t.quads).padStart(5) + " quads  " + t.f));
  }

  const kinds = Object.entries(broken);
  if (kinds.length) {
    console.log("\n--- didn't finish (these are the fixups still owed)");
    kinds.sort((a, b) => b[1].length - a[1].length).forEach(([why, list]) =>
      console.log("    " + String(list.length).padStart(4) + "x " + why
                  + "\n           e.g. " + list.slice(0, 3).join(", ")));
  }

  if (nonconformant.length) {
    console.log("\n--- nonconformant");
    nonconformant.slice(0, SHOW_FAILURES ? nonconformant.length : 10).forEach(n => {
      console.log("    " + n.f);
      if (SHOW_FAILURES) {
        const U = require("@shexjs/util");
        try { console.log(U.errsToSimple(n.appinfo, schema._prefixes)
                          .map(l => "        " + l).join("\n")); }
        catch (e) { console.log("        (couldn't render: " + short(e) + ")"); }
      }
    });
  }
}

function record (into, why, f) { (into[why] = into[why] || []).push(f); }
function short (e) { return String(e).split("\n")[0].slice(0, 60); }

/* Diagnostics import the same loadSchema and the same fixup list rather
 * than re-deriving them: every "why is this failing" script I wrote by hand
 * drifted from the bench within a run or two, and a diagnosis against a
 * schema the bench isn't using is worth nothing. */
if (require.main === module)
  main();
else
  module.exports = {loadSchema, schemaFixups, dataFixups, NOT_EXAMPLES, CORPUS, FHIR};
