"use strict";
/**
 * Graphs built specifically to mislead @shexjs/neighborhood-sparql about which
 * blank node is which.
 *
 * The shexTest suite (see Sparql-Validation-test.js) covers breadth; this file
 * covers the awkward cases it doesn't contain -- siblings separable only below
 * the description depth limit, siblings separable only by something that isn't
 * there, one node arrived at by two routes, cycles that don't pass through the
 * anchor, literals that make `!=` raise a type error.
 *
 * Each case is validated twice, against an in-memory store and against a
 * SPARQL endpoint that scrambles blank node labels in every response, and the
 * answers have to agree.  Then each is run again with the DECEPTICON loaded:
 * the decoys are unreachable from the focus, so the answer must not move.
 *
 *   TEST_sparql=true npx mocha packages/neighborhood-sparql/test/Sparql-Bnode-test.js
 */

const chai = require("chai");
const assert = chai.assert;
const N3 = require("n3");

const ShExParser = require("@shexjs/parser");
const {ShExValidator} = require("@shexjs/validator");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ctor: SparqlDb, BNodeIdentityError} = require("..");

const {launchEndpoint} = require("./sparql-endpoint");
const Decepticon = require("./decepticon");
const {opaqueBnodes, canonicalize} = require("./compare");

const BASE = "http://a.example/";
const PREFIXES = `PREFIX ex: <${BASE}>\nPREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n`;

/** A chain of `ex:p2` arcs ending in a literal, `depth` blank nodes long. */
function chain (depth, leaf) {
  return "[ ex:p2 ".repeat(depth) + JSON.stringify(leaf) + " ]".repeat(depth);
}
function chainShape (depth, values) {
  let out = "";
  for (let i = 1; i < depth; ++i)
    out += `<C${i}> { ex:p2 @<C${i + 1}> }\n`;
  return out + `<C${depth}> { ex:p2 [${values.map(v => JSON.stringify(v)).join(" ")}] }\n`;
}

const CASES = [
  {
    name: "siblings that no pattern can tell apart",
    // Interchangeable, so picking either is right -- but there must still be two.
    data: `ex:s1 ex:p1 [ ex:p2 "A" ], [ ex:p2 "A" ] .`,
    shape: `<S> { ex:p1 @<T> {2} }\n<T> CLOSED { ex:p2 ["A"] }`,
    conformant: true,
  },
  {
    name: "siblings separated by one arc",
    data: `ex:s1 ex:p1 [ ex:p2 "A" ], [ ex:p2 "B" ] .`,
    shape: `<S> { ex:p1 @<A> ; ex:p1 @<B> }\n<A> CLOSED { ex:p2 ["A"] }\n<B> CLOSED { ex:p2 ["B"] }`,
    conformant: true,
  },
  {
    name: "siblings separated by an arc that isn't there",
    data: `ex:s1 ex:p1 [ ex:p2 "A" ; ex:p3 "x" ], [ ex:p2 "A" ] .`,
    shape: `<S> { ex:p1 @<Bare> ; ex:p1 @<Extra> }\n` +
      `<Bare> CLOSED { ex:p2 ["A"] }\n<Extra> CLOSED { ex:p2 ["A"] ; ex:p3 ["x"] }`,
    conformant: true,
  },
  {
    name: "siblings separated only by how many objects they have",
    data: `ex:s1 ex:p1 [ ex:p2 "A", "B" ], [ ex:p2 "A" ] .`,
    shape: `<S> { ex:p1 @<One> ; ex:p1 @<Two> }\n` +
      `<One> CLOSED { ex:p2 ["A"] }\n<Two> CLOSED { ex:p2 ["A" "B"] {2} }`,
    conformant: true,
  },
  {
    name: "siblings separated only by how many blank children they have",
    data: `ex:s1 ex:p1 [ ex:p2 [], [] ], [ ex:p2 [] ] .`,
    shape: `<S> { ex:p1 @<One> ; ex:p1 @<Two> }\n` +
      `<One> CLOSED { ex:p2 @<Empty> }\n<Two> CLOSED { ex:p2 @<Empty> {2} }\n<Empty> CLOSED { }`,
    conformant: true,
  },
  {
    name: "siblings separated three arcs down",
    data: `ex:s1 ex:p1 ${chain(3, "A")}, ${chain(3, "B")} .`,
    shape: `<S> { ex:p1 @<C1> ; ex:p1 @<D1> }\n` +
      chainShape(3, ["A"]).replace(/<C/g, "<C") +
      chainShape(3, ["B"]).replace(/<C/g, "<D"),
    conformant: true,
  },
  {
    name: "siblings separated seven arcs down, past the default description depth",
    // The description has to notice it ran out of room and look further rather
    // than call the two interchangeable.
    data: `ex:s1 ex:p1 ${chain(7, "A")}, ${chain(7, "B")} .`,
    shape: `<S> { ex:p1 @<C1> ; ex:p1 @<D1> }\n` +
      chainShape(7, ["A"]) + chainShape(7, ["B"]).replace(/<C/g, "<D"),
    conformant: true,
  },
  {
    name: "one blank node reached by two predicates",
    data: `ex:s1 ex:p1 _:d ; ex:p2 _:d . _:d ex:p3 "x" .`,
    shape: `<S> { ex:p1 @<D> ; ex:p2 @<D> }\n` +
      `<D> { ^ex:p1 IRI ; ^ex:p2 IRI ; ex:p3 ["x"] }`,
    conformant: true,
  },
  {
    name: "a cycle that doesn't run through the anchor",
    data: `ex:s1 ex:p1 _:c1 . _:c1 ex:p1 _:c2 . _:c2 ex:p1 _:c1 .`,
    shape: `<S> { ex:p1 @<S> }`,
    conformant: true,
  },
  {
    name: "a blank node that points at itself",
    data: `ex:s1 ex:p1 _:self . _:self ex:p1 _:self .`,
    shape: `<S> { ex:p1 @<S> }`,
    conformant: true,
  },
  {
    name: "a ten-cell list",
    data: `ex:s1 ex:p1 _:l0 .\n` +
      Array.from({length: 10}, (_, i) =>
        `_:l${i} rdf:first ${i} ; rdf:rest ${i === 9 ? "rdf:nil" : "_:l" + (i + 1)} .`).join("\n"),
    shape: `<S> { ex:p1 @<L> }\n<L> CLOSED { rdf:first . ; rdf:rest @<L> OR [rdf:nil] }`,
    conformant: true,
  },
  {
    name: "a list whose cells all carry the same value",
    // Nothing but position separates the cells, and position is only sayable
    // as a path.
    data: `ex:s1 ex:p1 _:m0 .\n` +
      Array.from({length: 5}, (_, i) =>
        `_:m${i} rdf:first "same" ; rdf:rest ${i === 4 ? "rdf:nil" : "_:m" + (i + 1)} .`).join("\n"),
    shape: `<S> { ex:p1 @<L> }\n<L> CLOSED { rdf:first ["same"] ; rdf:rest @<L> OR [rdf:nil] }`,
    conformant: true,
  },
  {
    name: "blank nodes on the way in",
    data: `_:in1 ex:p1 ex:s1 . _:in2 ex:p1 ex:s1 . _:in1 ex:p2 "A" . _:in2 ex:p2 "B" .`,
    shape: `<S> { ^ex:p1 @<A> ; ^ex:p1 @<B> }\n` +
      `<A> CLOSED { ex:p1 IRI ; ex:p2 ["A"] }\n<B> CLOSED { ex:p1 IRI ; ex:p2 ["B"] }`,
    conformant: true,
  },
  {
    name: "literals that make a naive != raise a type error",
    // "ab"^^ex:dt1 != "cd"^^ex:dt2 is a type error, not false, so a description
    // built out of != would let a NOT EXISTS through and match the wrong node.
    data: `ex:s1 ex:p1 [ ex:p2 "ab"^^ex:dt1 ], [ ex:p2 "cd"^^ex:dt2 ] .`,
    shape: `<S> { ex:p1 @<A> ; ex:p1 @<B> }\n` +
      `<A> CLOSED { ex:p2 ["ab"^^ex:dt1] }\n<B> CLOSED { ex:p2 ["cd"^^ex:dt2] }`,
    conformant: true,
  },
  {
    name: "literals full of quoting hazards",
    data: `ex:s1 ex:p1 [ ex:p2 "quote \\" backslash \\\\ newline \\n tab \\t" ],\n` +
      `             [ ex:p2 "_:b0 looks like a bnode but is a string" ],\n` +
      `             [ ex:p2 "chat"@fr ] .`,
    shape: `<S> { ex:p1 @<T> {3} }\n<T> CLOSED { ex:p2 . }`,
    conformant: true,
  },
  {
    name: "a blank node under a predicate the shape never asks about",
    data: `ex:s1 ex:p1 [ ex:p2 "A" ] ; ex:p9 [ ex:p2 "A" ] .`,
    shape: `<S> { ex:p1 @<T> }\n<T> { ex:p2 ["A"] }`,
    conformant: true,
  },
  {
    name: "a wide fan of interchangeable siblings",
    data: `ex:s1 ex:p1 ` + Array.from({length: 6}, () => `[ ex:p2 "A" ]`).join(", ") + " .",
    shape: `<S> { ex:p1 @<T> {6} }\n<T> CLOSED { ex:p2 ["A"] }`,
    conformant: true,
  },
  {
    name: "a fan where exactly one sibling is different",
    data: `ex:s1 ex:p1 ` + Array.from({length: 5}, () => `[ ex:p2 "A" ]`).join(", ") +
      `, [ ex:p2 "B" ] .`,
    shape: `<S> { ex:p1 @<A> {5} ; ex:p1 @<B> }\n` +
      `<A> CLOSED { ex:p2 ["A"] }\n<B> CLOSED { ex:p2 ["B"] }`,
    conformant: true,
  },
  {
    name: "a shape that shouldn't match, so failure has to be for the right reason",
    data: `ex:s1 ex:p1 [ ex:p2 "A" ], [ ex:p2 "B" ] .`,
    shape: `<S> { ex:p1 @<C> {2} }\n<C> CLOSED { ex:p2 ["A"] }`,
    conformant: false,
  },
];

function parseData (turtle) {
  return opaqueBnodes(new N3.Parser({baseIRI: BASE, factory: N3.DataFactory}).parse(PREFIXES + turtle));
}

const ENABLED = "TEST_sparql" in process.env;

describe("@shexjs/neighborhood-sparql identifying blank nodes", function () {
  // One pending test rather than a thousand when the gate is off.
  if (!ENABLED) { it("needs TEST_sparql=true (and a SPARQL engine)"); return; }
  this.timeout(30000);

  let endpoint = null;
  before(async function () {
    this.timeout(60000);
    endpoint = await launchEndpoint({scramble: true});
  });
  after(async () => { if (endpoint) await endpoint.close(); });

  function run (test, withDecepticon) {
    const quads = parseData(test.data);
    const schema = ShExParser.construct(BASE, null, {index: true}).parse(PREFIXES + test.shape);

    const store = new N3.Store();
    store.addQuads(quads);

    endpoint.clear();
    if (withDecepticon) Decepticon.loadInto(endpoint);
    endpoint.loadQuads(quads);
    endpoint.forgetQueries();

    const db = SparqlDb(endpoint.url, null, {});
    db.setSchema(schema);
    const map = [{node: BASE + "s1", shape: BASE + "S"}];
    const options = {diagnose: true, results: "api"};
    return {
      oracle: new ShExValidator(schema, RdfJsDb(store), options).validateShapeMap(map),
      sparql: new ShExValidator(schema, db, options).validateShapeMap(map),
      queries: endpoint.queries(),
    };
  }

  CASES.forEach(test => {
    it(`should agree with the rdfjs neighborhood: ${test.name}`, () => {
      const {oracle, sparql, queries} = run(test, false);
      assert.equal(oracle[0].status, test.conformant ? "conformant" : "nonconformant",
                   "the case itself is wrong: rdfjs disagrees with what the test claims");
      assert.equal(canonicalize(sparql), canonicalize(oracle));
      assert.isTrue(queries.length > 0, "no queries were sent");
      // The endpoint rejects these outright; belt and braces.
      queries.forEach(q => assert.notMatch(q, /(^|[\s([,;.])_:/,
                                           "a query replayed a blank node label"));
    });

    it(`should be unmoved by the DECEPTICON: ${test.name}`, () => {
      const clean = run(test, false);
      const decoyed = run(test, true);
      assert.equal(canonicalize(decoyed.sparql), canonicalize(clean.sparql),
                   "decoy triples changed the answer");
      assert.equal(canonicalize(decoyed.sparql), canonicalize(decoyed.oracle));
    });
  });

  describe("refusing to guess", () => {
    beforeEach(() => {
      endpoint.clear();
      endpoint.loadQuads(parseData(`ex:s1 ex:p1 [ ex:p2 "A" ] .`));
    });

    it("should reject a blank node it didn't hand out", () => {
      const schema = ShExParser.construct(BASE, null, {index: true})
            .parse(PREFIXES + `<T> { ex:p2 ["A"] }`);
      const db = SparqlDb(endpoint.url, null, {});
      db.setSchema(schema);
      assert.throws(
        () => db.getNeighborhood(N3.DataFactory.blankNode("b0"), BASE + "T",
                                 schema.shapes[0].shapeExpr),
        BNodeIdentityError);
    });

    it("should refuse to write a blank node label into a query", () => {
      const schema = ShExParser.construct(BASE, null, {index: true})
            .parse(PREFIXES + `<T> { ex:p2 ["A"] }`);
      const db = SparqlDb(endpoint.url, null, {});
      db.setSchema(schema);
      assert.throws(() => db.getQuads(N3.DataFactory.blankNode("b0")), BNodeIdentityError);
    });

    it("should report a description that doesn't pin its node down", () => {
      // Descriptions are checked against the endpoint before they're trusted.
      // Sabotage the check's arithmetic and the next fetch must complain rather
      // than quietly return whichever node the endpoint felt like.
      const schema = ShExParser.construct(BASE, null, {index: true})
            .parse(PREFIXES + `<S> { ex:p1 @<T> }\n<T> { ex:p2 ["A"] }`);
      endpoint.clear();
      endpoint.loadQuads(parseData(`ex:s1 ex:p1 [ ex:p2 "A" ], [ ex:p2 "A", "B" ] .`));
      const db = SparqlDb(endpoint.url, null, {
        // Drop the "and nothing else" clauses, which are what keep the
        // description of the plain sibling from also matching the richer one.
        executeQuery: (q, ep, df) =>
          require("@shexjs/util").executeQuery(q.replace(/^ *MINUS \{.*$/gm, ""), ep, df),
      });
      db.setSchema(schema);
      assert.throws(
        () => db.getNeighborhood(N3.DataFactory.namedNode(BASE + "s1"), BASE + "S",
                                 schema.shapes[0].shapeExpr),
        BNodeIdentityError, /matches 2 node/);
    });
  });

  describe("the DECEPTICON", () => {
    // These two tests are about the decoys rather than the code: they establish
    // that the graph really is full of nodes that a description would collect
    // if it stopped being anchored, so that a passing run means something.
    const DATA = `ex:n1 ex:p1 [ ex:p2 "X" ] .`;
    const SHAPE = `<S> { ex:p1 @<T> }\n<T> { ex:p2 ["X"] }`;

    /** Run a fetch with the anchor deleted from the verification query, which
     * is where the description is measured against the graph. */
    function unanchored (withDecepticon) {
      endpoint.clear();
      if (withDecepticon) Decepticon.loadInto(endpoint);
      endpoint.loadQuads(parseData(DATA));
      const schema = ShExParser.construct(BASE, null, {index: true}).parse(PREFIXES + SHAPE);
      const db = SparqlDb(endpoint.url, null, {
        executeQuery: (q, ep, df) => require("@shexjs/util").executeQuery(
          q.startsWith("SELECT ?i (COUNT")
            ? q.replace(new RegExp("^.*<" + BASE + "n1>.*$", "gm"), "")
            : q,
          ep, df),
      });
      db.setSchema(schema);
      return () => db.getNeighborhood(N3.DataFactory.namedNode(BASE + "n1"), BASE + "S",
                                      schema.shapes[0].shapeExpr);
    }

    it("should hold decoys that an unanchored description would collect", () => {
      assert.throws(unanchored(true), BNodeIdentityError, /doesn't pin the node down/);
    });

    it("should be the reason, and not something about the data itself", () => {
      // Same sabotage, no decoys: the description still matches one node, so
      // the failure above was the DECEPTICON's doing.
      assert.doesNotThrow(unanchored(false));
    });
  });
});
