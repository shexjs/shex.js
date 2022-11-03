#!/usr/bin/env node

const VERBOSE = "VERBOSE" in process.env;
const TERSE = VERBOSE;
const TESTS = "TESTS" in process.env ? process.env.TESTS.split(/\|/) : null;

const ShExUtil = require("@shexjs/util");
const { ctor: RdfJsDb } = require('@shexjs/neighborhood-rdfjs');
const ShExTerm = require("@shexjs/term");
const RdfJs = require("n3");
const {DataFactory} = RdfJs;
const ShExNode = require("@shexjs/node")({
  rdfjs: RdfJs,
});
const ShExParser = require("@shexjs/parser");
const ShExValidator = require("@shexjs/validator");
const Mapper = require("..")({rdfjs: RdfJs, Validator: ShExValidator});

// var Promise = require("promise");
const expect = require("chai").expect;
const Path = require("path");
const Fs = require("fs");

var maybeLog = VERBOSE ? console.log : function () {};
const urlify = (s) => "file://localhost/" + s

function loadAndRun (srcSchemas, targetSchemas, inputDataFilePath, node, createRoot, expectedBindings, expectedRdfFilePath, testTrivial) {
  var mapstr = srcSchemas + " -> " + targetSchemas.join(',');
  it('('+ mapstr + ')' + ' should map ' + inputDataFilePath + " to " + expectedRdfFilePath, async function () {

    srcSchemas = srcSchemas.map(function (p) { return Path.resolve(__dirname, p); });
    targetSchemas = targetSchemas.map(function (p) { return Path.resolve(__dirname, p); });
    inputDataFilePath = Path.resolve(__dirname, inputDataFilePath);
    expectedRdfFilePath = Path.resolve(__dirname, expectedRdfFilePath);
    // Lean on ShExNode to load all the schemas and data graphs.
    const loads = await Promise.all([ShExNode.load({shexc: srcSchemas}, {turtle: [inputDataFilePath]}, {index: true}),
                                     ShExNode.load({shexc: targetSchemas}, {turtle: [expectedRdfFilePath]}, {index: true})])
    loads[0].data.toString = loads[1].data.toString = graphToString;
    const inputData = { graph: loads[0].data, meta: { base: urlify(inputDataFilePath), prefixes: {  } } }
    const expectedRdf = { graph: loads[1].data, meta: { base: urlify(expectedRdfFilePath), prefixes: {  } } }
    return run(loads[0].schema, loads[1].schema, Promise.resolve(inputData), [{node, shape: ShExValidator.start}], createRoot, expectedBindings, expectedRdf, mapstr, testTrivial);
  })

}

async function run (srcSchema, targetSchema, inputDataP, smapP, createRoot, expectedBindings, expectedRdfP, mapstr, testTrivial) {
  const [inputData, smap, expectedRdf] = await Promise.all([inputDataP, smapP, expectedRdfP])
  // console.log([inputData.graph.size, JSON.stringify(smap), expectedRdf.graph.size])

  // prepare validator    
  var validator = ShExValidator.construct(srcSchema, RdfJsDb(inputData.graph), {noCache: true});
  const registered = Mapper.register(validator, {ShExTerm, ShExUtil});

  // run validator
  var res = validator.validate(smap);
  expect(res.errors || []).to.deep.equal([]); // Trick chai into displaying errors.

  // var resultBindings = validator.semActHandler.results["http://shex.io/extensions/Map/#"];
  const resultBindings = ShExUtil.valToExtension(res, Mapper.url);

  // test against expected.
  if (expectedBindings) {
    if (resultBindings instanceof Array !== expectedBindings instanceof Array)
      expect([resultBindings]).to.deep.equal(expectedBindings);
    else
      expect(resultBindings).to.deep.equal(expectedBindings);
  }

  if (testTrivial)
    testGraph(trivial(registered, targetSchema, resultBindings, createRoot), expectedRdf.graph, mapstr)
  testGraph(materialize(registered, targetSchema, resultBindings, createRoot), expectedRdf.graph, mapstr)
}

function testGraph (got, expected, mapstr) {
  const passed = graphEquals(got, expected);
  if (!passed) {
    expected.toString = got.toString = graphToString;
    maybeLog(mapstr);
    maybeLog("output:");
    maybeLog(got.toString());
    maybeLog("expect:");
    maybeLog(expected.toString());
    // console.log(got.toString(), "\n--\n", expected.toString());
  }
  expect(passed).to.be.true;
}

function trivial (registered, schema, resultBindings, createRoot) {
  var trivialMaterializer = registered.trivialMaterializer(schema);
  const trivialBinder = registered.binder(JSON.parse(JSON.stringify([resultBindings])))
  return trivialMaterializer.materialize(trivialBinder, createRoot);
}

function materialize (registered, schema, resultBindings, createRoot) {
  const materializer = Mapper.materializer.construct(schema, registered, {});
  const binder = registered.binder(JSON.parse(JSON.stringify(resultBindings)))
  const res2 = materializer.validate(binder, createRoot, undefined)
  const store = new RdfJs.Store()
  store.addQuads(ShExUtil.valToN3js(res2, DataFactory))
  return store
}

if (false) describe('A ShEx Mapper', function () {
  var tests = [
    ["there", ["Map/BPDAMFHIR/BPFHIR.shex"], ["Map/BPDAMFHIR/BPunitsDAM.shex"], "Map/BPDAMFHIR/BPFHIR.ttl", "tag:BPfhir123", "tag:b0", null, "Map/BPDAMFHIR/BPunitsDAM.ttl", true],
    ["back" , ["Map/BPDAMFHIR/BPunitsDAM.shex"], ["Map/BPDAMFHIR/BPFHIR.shex"], "Map/BPDAMFHIR/BPunitsDAM.ttl", "tag:b0", "tag:BPfhir123", null, "Map/BPDAMFHIR/BPFHIR.ttl", true],
//    ["bifer", ["Map/BPDAMFHIR/BPFHIRsys.shex", "Map/BPDAMFHIR/BPFHIRdia.shex"], ["Map/BPDAMFHIR/BPunitsDAM.shex"], "Map/BPDAMFHIR/BPFHIR.ttl", "tag:BPfhir123", "tag:b0", null, "Map/BPDAMFHIR/BPunitsDAM.ttl"]
//    ["bifb" , ["Map/BPDAMFHIR/BPFHIR.shex"], ["Map/BPDAMFHIR/BPunitsDAMsys.shex", "Map/BPDAMFHIR/BPunitsDAMdia.shex"], "Map/BPDAMFHIR/BPFHIR.ttl", "tag:b0", "tag:BPfhir123", null, "Map/BPDAMFHIR/BPunitsDAM.ttl"]
  ];
  if (TESTS)
    tests = tests.filter(function (t) { return TESTS.indexOf(t[0]) !== -1; });
  tests.forEach(function (test) {
    loadAndRun.apply(null, test.slice(1));
  });

/*
  loadAndRun(["Map/BPDAMFHIR/BPFHIR.shex"], ["Map/BPDAMFHIR/BPunitsDAMsys.shex", "Map/BPDAMFHIR/BPunitsDAMdia.shex"], "Map/BPDAMFHIR/BPFHIR.ttl", null, "Map/BPDAMFHIR/BPunitsDAM.ttl");

  emits:
    _:0 bpudam:systolic [
        bpudam:value "110"^^xsd:float.
        bpudam:units "mmHg" ] ;
        bpudam:diastolic _:2.
    _:3 bpudam:systolic _:4.
    _:3 bpudam:diastolic [
    _:5 bpudam:value "70"^^xsd:float.
    _:5 bpudam:units "mmHg" ] .

  instead of:
    _:b0 bpudam:diastolic [
        bpudam:value "70"^^xsd:float.
        bpudam:units "mmHg" ] ;
    _:b0 bpudam:systolic [
        bpudam:value "110"^^xsd:float.
        bpudam:units "mmHg" ] .

  where:
    PREFIX bpudam: <http://shexspec.github.io/extensions/Map/#BPunitsDAM->
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
*/
});
const ShapeMap = require("shape-map");
ShapeMap.start = ShExValidator.start; // Tell the ShapeMap parser to use ShExValidator's start symbol. @@ should be a function

const Awaiting = []
const Examples = loadManifest()
before(() => {
  return Promise.all(Awaiting)
})

xdescribe('Examples manifest', function () {
  Examples.forEach((manifest) => {
    const mapstr = manifest.schemaLabel + '(' + manifest.dataLabel + ')'
    const createRoot = manifest.createRoot.startsWith('_:')
          ? manifest.createRoot
          : manifest.createRoot.substr(1, manifest.createRoot.length-2)
    const dataSummary = "dataURL" in manifest
          ? manifest.dataURL
          : manifest.data.length + ' chars of turtle'
    it(mapstr + ' should map ' + dataSummary + " to " + manifest.outputDataURL, async function () {
      return run(manifest.inputSchema, manifest.outputSchema, manifest.inputDataP, manifest.smapP, createRoot, manifest.expectedBindings, manifest.expectedDataP, mapstr, false)
    })
  })
})

function loadManifest() {
  const schemaBase = 'http://a.example/schema/'
  const turtleBase = 'http://a.example/turtle/'
  const examplesDir = Path.join(__dirname, '../examples')
  const examplesManifest = JSON.parse(Fs.readFileSync(Path.join(examplesDir, 'manifest.json'), 'utf8'))

  return examplesManifest
    .filter(e => e.status === "conformant" && !(e.queryMap.startsWith("_:")))
    .map((manifest) => {

      // validation inputs
      const inputSchema = ShExParser.construct(schemaBase, {}, {index: true}).parse(manifest.schema)
      const inputDataP = parseTurtle(manifest.data, turtleBase)
      const smapP = inputDataP.then(
        (inputData) => ShapeMap.Parser.construct(
          'http://a.example/schema/',
          {base: inputSchema._base, prefixes: inputSchema._prefixes},
          inputData.meta
        ).parse(manifest.queryMap)
      )

      // materialization inputs
      const outputSchema = ShExParser.construct(schemaBase, {}, {index: true}).parse(manifest.outputSchema)
      const expectedBindings = manifest.expectedBindingsURL ? JSON.parse(Fs.readFileSync(Path.join(examplesDir, manifest.expectedBindingsURL), 'utf8')) : null
      const expectedDataP = parseTurtle(Fs.readFileSync(Path.join(examplesDir, manifest.outputDataURL), 'utf8'), turtleBase)
      Awaiting.push(inputDataP, smapP, expectedDataP)
      return Object.assign(manifest, {inputSchema, outputSchema, inputDataP, smapP, expectedBindings, expectedDataP})
    })
}


// function parseTurtle (text, mediaType, url, data, meta, dataOptions) {
async function parseTurtle (text, url) {
  const graph = new RdfJs.Store()
  const ret = { graph, meta: { base: url, prefixes: {} } }
  return new Promise((resolve, reject) => {
    new RdfJs.Parser({baseIRI: url, blankNodePrefix: "_:", format: "text/turtle"}).
      parse(text,
            function (error, triple, prefixes) {
              if (prefixes) {
                ret.meta.prefixes = prefixes
              }
              if (error) {
                throw "error parsing " + url + ": " + error
              } else if (triple) {
                graph.addQuad(triple)
              } else {
                ret.meta.base = this._base
                resolve(ret)
              }
            })
  })
}

function graphToString () {
  var output = '';
  var w = new (require("n3")).Writer({
      write: function (chunk, encoding, done) { output += chunk; done && done(); },
  });
  w.addQuads([... this.match(null, null, null, null)]); // is this kosher with no end method?
  return "{\n" + output + "\n}";
}

/** graphEquals: test if two graphs are isomorphic through some bnode mapping.
 *
 * left: one of the graphs to test.
 * right: the other graph to test.
 * leftToRight: (optional) writable mapping from left bnodes to right bnodes.
 * returns: true or false
 * side effects: m is populated with a working mapping.
 */
function graphEquals (left, right, leftToRight) {
  if (left.size !== right.size)
    return false;

  leftToRight = leftToRight || {};                                    // Left→right mappings (optional argument).
  var rightToLeft = Object.keys(leftToRight).reduce(function (ret, from) { // Right→left mappings
    ret[leftToRight[from]] = from;                                  //  populated if m was passed in.
    return ret;
  }, {});

  return findIsomorphism([... left.match(null, null, null, null)]     // Start with all triples.
               .map(ShExTerm.internalTriple), right, leftToRight, rightToLeft);
}

/**
  * recursive function to find a consistent mapping of left bnodes to right bnodes.
  * @param {*} g RdfJs graph
  * @returns true if a mapping was found
  */
function findIsomorphism (g, right, l2r, r2l) {
  if (g.length == 0)                              // Success if there's nothing left to match.
    return true;
  var matchTarget = g.pop();                      // Take the first triple in left.

  var rights = [... right.match(                  // Find candidates in the right.
    mapppedTo(matchTarget.subject, l2r),
    matchTarget.predicate,
    mapppedTo(matchTarget.object, l2r),
    null
  )];

  const ret = !!rights.find(function (triple) {   // Walk through candidates in right.
    var trialMappings = [];                          // List of candidate mappings.
    function add (from, to) {
      if (mapppedTo(from, l2r) === null) {   // If there's no binding from tₗ to tᵣ,
        if (mapppedTo(to, r2l) === null) {   //   If we can bind to to the object
          const leftKey = ShExTerm.rdfJsTermToTurtle(from);
          const rightKey = ShExTerm.rdfJsTermToTurtle(to);
          l2r[leftKey] = to;                 //      add a candidate binding.
          r2l[rightKey] = from;
          trialMappings.push({from, leftKey, rightKey});
          return true;
        } else {                                     //   Otherwise,
          return false;                              //     it's not a viable mapping.
        }
      } else {                                       // Otherwise,
        return true;                                 //   there's no new binding.
      }
    }

    if (!add(matchTarget.subject, triple.subject) || // If the bindings for tₗ.s→tᵣ.s fail
        !add(matchTarget.object, triple.object) ||   // or the bindings for tₗ.o→tᵣ.o fail
        !findIsomorphism(g, right, l2r, r2l)) {                       // of the remaining triples fail,
      for (let {leftKey, rightKey} in trialMappings) {
        delete r2l[rightKey];
        delete l2r[leftKey];
      };
      return false;
    } else
      return true;
  });

  if (!ret) {
    g.push(matchTarget);                           // No binding so leave as a failure.
  }

  return ret;
}

function mapppedTo (term, mapping) {
  if (!mapping) throw Error('1');
  mapping = mapping || leftToRight;                     // Mostly used for left→right mappings.
  if (ShExTerm.isBlank(term)) {
    const key = ShExTerm.rdfJsTermToTurtle(term);
    return (key in mapping) ? mapping[key] : null // Bnodes get current binding or null.
  } else {
    return term;                              // Other terms evaluate to themselves.
  }
}

/**
 * RDFJS Store which returns match results in the order quads were added.
 * This is useful for exercising algorithms like `graphEquals`
 */
class OrderedStore {
  constructor () { this.quads = []; }

  addQuad (q) { this.quads.push(q); }

  get size () { return this.quads.length; }

  match (s, p, o, g) {
    const quads = this.quads;
    return {
      *[Symbol.iterator]() {
        for (let t of quads) {
          if (   (!s || s.equals(t.subject  ))
              && (!p || p.equals(t.predicate))
              && (!o || o.equals(t.object   )))
            yield t;
        }
      }
    }
  }
}

function testEquiv (name, g1, g2, equals, mapping) {
  it("should test " + name + " to be " + equals, function () {
    var l = new OrderedStore(); l.toString = graphToString;
    var r = new OrderedStore(); r.toString = graphToString;
    g1.forEach(function (triple) { l.addQuad(n3idQuadToRdfJs(triple[0], triple[1], triple[2])) });
    g2.forEach(function (triple) { r.addQuad(n3idQuadToRdfJs(triple[0], triple[1], triple[2])) });
    var m = {};
    var ret = graphEquals(l, r, m);
    expect(ret).to.equal(equals, m);
    if (mapping) {
      const f = Object.keys(m).reduce((acc, key) => {
        acc[key] = ShExTerm.rdfJsTermToTurtle(m[key]);
        return acc;
      }, {});
      if (Array.isArray(mapping)) {
        var found = 0;
        mapping.forEach(function (thisMap) {
          try {
            expect(f).to.deep.equal(thisMap);
            ++found;
          } catch (e) {
          }
        });
        if (found !== 1) // slightly misleading error, but adequate.
          expect(f).to.deep.equal(mapping);
      } else {
        expect(f).to.deep.equal(mapping);
      }
    }
  });
}

/** N3id functions
 * Some tests and algorithms use n3.js ids as syntax for input graphs in tests.
 *   NamedNode: bare word, e.g. http://a.example/
 *   BlankNode: "_:" + label, e.g. _:b1
 *   Literal: quoted value plus ntriples lang or datatype, e.g:
 *     "I said \"Hello World\"."
 *     "I said \"Hello World\"."@en
 *     "1.1"^^http://www.w3.org/2001/XMLSchema#float
 */

/**
 * Map an N3id quad to an RdfJs quad
 * @param {*} s subject
 * @param {*} p predicate
 * @param {*} o object
 * @param {*} g graph
 * @returns RdfJs quad
 */
function n3idQuadToRdfJs (s, p, o, g) {
  return new DataFactory.quad(
    n3idTermToRdfJs(s),
    n3idTermToRdfJs(p),
    n3idTermToRdfJs(o),
    g ? n3idTermToRdfJs(g) : DataFactory.DefaultGraph,
  );
}

/**
 * Map an N3id term to an RdfJs Term.
 * @param {*} term N3Id term
 * @returns RdfJs Term
 */
function n3idTermToRdfJs (term) {
  if (term[0] === "_" && term[1] === ":")
    return new DataFactory.blankNode(term.substr(2));

  if (term[0] === "\"" || term[0] === "'") {
    const closeQuote = term.lastIndexOf(term[0]);
    if (closeQuote === -1)
      throw new Error(`no close ${term[0]}: ${term}`);
    const value = term.substr(1, closeQuote - 1).replace(/\\"/g, '"');
    const langOrDt = term.length === closeQuote + 1
          ? null
          : term[closeQuote + 1] === "@"
          ? term.substr(closeQuote + 2)
          : parseDt(closeQuote + 1)
    return new DataFactory.literal(value, langOrDt);
  }

  return new DataFactory.namedNode(term);

  function parseDt (from) {
    if (term[from] !== "^" || term[from + 1] !== "^")
      throw new Error(`garbage after closing ": ${term}`);
    return new DataFactory.namedNode(term.substr(from + 2));
  }
}

describe("Graph equivalence", function () {
  var p12Permute = [
    {"_:l1": "_:r1", "_:l2": "_:r2"},
    {"_:l1": "_:r2", "_:l2": "_:r1"}];
  var p123Permute = [ // note intentional _:r3 on left side
    {"_:l1": "_:r1", "_:l2": "_:r2", "_:r3": "_:r3"},
    {"_:l1": "_:r1", "_:l2": "_:r3", "_:r3": "_:r2"},
    {"_:l1": "_:r2", "_:l2": "_:r1", "_:r3": "_:r3"},
    {"_:l1": "_:r2", "_:l2": "_:r3", "_:r3": "_:r1"},
    {"_:l1": "_:r3", "_:l2": "_:r1", "_:r3": "_:r2"},
    {"_:l1": "_:r3", "_:l2": "_:r2", "_:r3": "_:r1"}];
  var tests = [
    {name:"spo123=spo123", p:true, m:{},
     l:[["s", "p", "o1"], ["s", "p", "o2"], ["s", "p", "o3"]],
     r:[["s", "p", "o2"], ["s", "p", "o3"], ["s", "p", "o1"]]},
    {name:"spo123!=sPo123", p:false, m:{},
     l:[["s", "p", "o1"], ["s", "p", "o2"], ["s", "p", "o3"]],
     r:[["s", "P", "o2"], ["s", "P", "o3"], ["s", "P", "o1"]]},
    {name:"l<r", p:false, m:null,
     l:[["s", "p", "o1"], ["s", "p", "o2"]],
     r:[["s", "p", "o2"], ["s", "p", "o3"], ["s", "p", "o1"]]},
    {name:"r<l", p:false, m:null,
     l:[["s", "p", "o1"], ["s", "p", "o2"], ["s", "p", "o3"]],
     r:[["s", "p", "o2"], ["s", "p", "o3"]]},
    {name:"1-bnode-no-rewrite", p:true, m:{"_:x1": "_:x1"},
     l:[["s", "p", "_:x1"], ["s", "p", "o2"], ["s", "p", "o3"]],
     r:[["s", "p", "_:x1"], ["s", "p", "o2"], ["s", "p", "o3"]]},
    {name:"1-bnode-rewrite", p:true, m:{"_:l1": "_:r1"},
     l:[["s", "p", "_:l1"], ["s", "p", "o2"], ["s", "p", "o3"]],
     r:[["s", "p", "_:r1"], ["s", "p", "o2"], ["s", "p", "o3"]]},
    {name:"tall3", p:true, m:{"_:l1": "_:r1", "_:l2": "_:r2", "_:l3": "_:r3"},
     l:[["s", "p1", "_:l1"], ["_:l1", "p2", "_:l2"], ["_:l2", "p", "_:l3"]],
     r:[["s", "p1", "_:r1"], ["_:r1", "p2", "_:r2"], ["_:r2", "p", "_:r3"]]},
    {name:"tall3-rotated1", p:true, m:{"_:l1": "_:r1", "_:l2": "_:r2", "_:l3": "_:r3"},
     l:[["s", "p1", "_:l1"], ["_:l1", "p2", "_:l2"], ["_:l2", "p", "_:l3"]],
     r:[["_:r1", "p2", "_:r2"], ["_:r2", "p", "_:r3"], ["s", "p1", "_:r1"]]},
    {name:"s p _:l1, o2 != s p _:r1, _:r2", p:false, m:null,
     l:[["s", "p", "_:l1"], ["s", "p", "o2"]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r2"]]},
    {name:"s p _:l1, o2, p3 != s p _:r1, _:r2, o3", p:false, m:null,
     l:[["s", "p", "_:l1"], ["s", "p", "o2"], ["s", "p", "o3"]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r2"], ["s", "p", "o3"]]},
    {name:"s p _:l1, o2, p3 != s p _:r1, _:r1, o3", p:false, m:null,
     l:[["s", "p", "_:l1"], ["s", "p", "o2"], ["s", "p", "o3"]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r1"], ["s", "p", "o3"]]},
    {name:"s p _:l1, _:l2, o3 != s p _:r1, _:r1, o3", p:false, m:null,
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["s", "p", "o3"]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r1"], ["s", "p", "o3"]]},
    {name:"backtrack pass", p:true, m:{"_:l1": "_:r2", "_:l2": "_:r1"},
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["_:l1", "p", "o3"]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r2"], ["_:r2", "p", "o3"]]},
    {name:"backtrack fail", p:false, m:null,
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["_:l1", "p", "o3"]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r2"], ["_:r2", "p", "o4"]]},
    {name:"s p _:l1, _:l2, o3 = s p _:r1, _:r2, o3", p:true, m:
     [{"_:l1": "_:r1", "_:l2": "_:r2"}, {"_:l1": "_:r2", "_:l2": "_:r1"}],
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["s", "p", "o3"]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r2"], ["s", "p", "o3"]]},
    {name:"s p _:l1. s p2 _:l2, p3 = s p _:r1. s p2 _:r2, o3",
     p:true, m:{"_:l1": "_:r1", "_:l2": "_:r2"},
     l:[["s", "p", "_:l1"], ["s", "p2", "_:l2"], ["s", "p2", "o3"]],
     r:[["s", "p", "_:r1"], ["s", "p2", "_:r2"], ["s", "p2", "o3"]]},
    {name:"s p _:l1. s p2 _:l2, p3 = s p _:r1. s p2 _:r2, o3 - rotated1",
     p:true, m:{"_:l1": "_:r1", "_:l2": "_:r2"},
     l:[["s", "p", "_:l1"], ["s", "p2", "_:l2"], ["s", "p2", "o3"]],
     r:[["s", "p2", "o3"], ["s", "p", "_:r1"], ["s", "p2", "_:r2"]]},
    {name:"s p _:l1. s p2 _:l2, p3 = s p _:r1. s p2 _:r2, o3 - rotated2",
     p:true, m:{"_:l1": "_:r1", "_:l2": "_:r2"},
     l:[["s", "p", "_:l1"], ["s", "p2", "_:l2"], ["s", "p2", "o3"]],
     r:[["s", "p2", "_:r2"], ["s", "p2", "o3"], ["s", "p", "_:r1"]]},
    {name:"s p _:l1, _:l2, _:l3 = s p _:r1, _:r2, _:r3", p:true, m:p123Permute,
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["s", "p", "_:r3"]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r2"], ["s", "p", "_:r3"]]},
    {name:"s p _:l1, _:l2, _:l3 = s p _:r1, _:r2, _:r3 - rotated1", p:true, m:p123Permute,
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["s", "p", "_:r3"]],
     r:[["s", "p", "_:r3"], ["s", "p", "_:r1"], ["s", "p", "_:r2"]]},
    {name:"s p _:l1, _:l2, _:l3 = s p _:r1, _:r2, _:r3 - rotated2", p:true, m:p123Permute,
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["s", "p", "_:r3"]],
     r:[["s", "p", "_:r2"], ["s", "p", "_:r3"], ["s", "p", "_:r1"]]},
    // literals
    {name:"s p _:l1, _:l2, 'o3' = s p _:r1, _:r2, 'o3'", p:true, m:p12Permute,
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["s", "p", "\"o3\""]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r2"], ["s", "p", "\"o3\""]]},
    {name:"s p _:l1, _:l2, 'o3' != s p _:r1, _:r2, 'o4'", p:false, m:null,
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["s", "p", "\"o3\""]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r2"], ["s", "p", "\"o4\""]]},
    {name:"s p _:l1, _:l2, 'o3'@fr = s p _:r1, _:r2, 'o3'@fr", p:true, m:p12Permute,
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["s", "p", "\"o3\"@fr"]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r2"], ["s", "p", "\"o3\"@fr"]]},
    {name:"s p _:l1, _:l2, 'o3'@fr != s p _:r1, _:r2, 'o3'@en-FR", p:false, m:null,
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["s", "p", "\"o3\"@fr"]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r2"], ["s", "p", "\"o3\"@en-FR"]]},
    {name:"s p _:l1, _:l2, 'o3'^^dt1 = s p _:r1, _:r2, 'o3'^^dt1", p:true, m:p12Permute,
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["s", "p", "\"o3\"^^dt1"]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r2"], ["s", "p", "\"o3\"^^dt1"]]},
    {name:"s p _:l1, _:l2, 'o3'^^dt1 != s p _:r1, _:r2, 'o3'^^dt2", p:false, m:null,
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["s", "p", "\"o3\"^^dt1"]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r2"], ["s", "p", "\"o3\"^^dt2"]]},
  ];
  if (TESTS)
    tests = tests.filter(function (t) { return TESTS.indexOf(t.name) !== -1; });
  tests.forEach(function (t) { testEquiv(t.name, t.l, t.r, t.p, t.m); });
});

