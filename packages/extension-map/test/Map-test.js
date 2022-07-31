#!/usr/bin/env node

const VERBOSE = "VERBOSE" in process.env;
const TERSE = VERBOSE;
const TESTS = "TESTS" in process.env ? process.env.TESTS.split(/,/) : null;

const ShExUtil = require("@shexjs/util");
const ShExTerm = require("@shexjs/term");
const RdfJs = require("n3");
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
  var validator = ShExValidator.construct(srcSchema, ShExUtil.rdfjsDB(inputData.graph), {noCache: true});
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
  const passed = geq(got, expected);
  if (!passed) {debugger
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
  store.addQuads(ShExUtil.valToN3js(res2, RdfJs.DataFactory))
  return store
}

function geq (l, r) { // graphEquals needs a this
  return graphEquals.call(l, r);
}

describe('A ShEx Mapper', function () {
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

describe('Examples manifest', function () {
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
  w.addQuads(this.getQuads(null, null, null)); // is this kosher with no end method?
  return "{\n" + output + "\n}";
}

/** graphEquals: test if two graphs are isomorphic through some bnode mapping.
 *
 * this: one of the graphs to test, referred to as "left" below.
 * right: the other graph to test.
 * m: (optional) writable mapping from left bnodes to write bnodes.
 * returns: true or false
 * side effects: m is populated with a working mapping.
 */
function graphEquals (right, m) {

  if (this.size !== right.size)
    return false;

  m = m || {};                                    // Left→right mappings (optional argument).
  var back = Object.keys(m).reduce(function (ret, from) { // Right→left mappings
    ret[m[from]] = from;                                  //  populated if m was passed in.
    return ret;
  }, {});
  function match (g) {
    function val (term, mapping) {
      mapping = mapping || m;                     // Mostly used for left→right mappings.
      if (ShExTerm.isBlank(term))
        return (term in mapping) ? mapping[term] : null // Bnodes get current binding or null.
      else
        return term;                              // Other terms evaluate to themselves.
    }

    if (g.length == 0)                            // Success if there's nothing left to match.
      return true;
    var t = g.pop(), s = val(t.subject), o = val(t.object); // Take the first triple in left.
    var tm = right.getQuads(
      s ? ShExTerm.externalTerm(s, require("n3").DataFactory) : null,
      ShExTerm.externalTerm(t.predicate, require("n3").DataFactory),
      o ? ShExTerm.externalTerm(o, require("n3").DataFactory) : null  // Find candidates in right.
    ).map(ShExTerm.internalTriple);
    var r = tm.reduce(function (ret, triple) {    // Walk through candidates in right.
      if (ret) return true;                       // Only examine first successful mapping.
      var adds = [];                              // List of candidate mappings.
      function add (from, to) {
        if (val(from) === null) {                   // If there's no binding from tₗ to tᵣ,
          if (val(to, back) === null) {                // If we can bind to to the object
            adds.push(from);                           //  add a candidate binding.
            m[from] = to;
            back[to] = from;
            return true;
          } else {                                     // Otherwise,
            return false;                              //  it's not a viable mapping.
          }
        } else {                                    // Otherwise,
          return true;                                 //  there's no new binding.
        }
      }
      if (!add(t.subject, triple.subject) ||     // If the bindings for tₗ.s→tᵣ.s fail
          !add(t.object, triple.object) ||       // or the bindings for tₗ.o→tᵣ.o fail
          !match(g)) {                           // of the remaining triples fail,
        adds.forEach(function (added) {             // remove each added binding.
          delete back[m[added]];
          delete m[added];
        });
        return false;
      } else
        return true;
    }, false);                                    // Empty tm returns failure.
    if (!r) {
      g.push(t);                                  // No binding for t in cancidate mapping.
    }
    return r;
  }
  return match(this.getQuads(null, null, null)     // Start with all triples.
               .map(ShExTerm.internalTriple));
}

  function testEquiv (name, g1, g2, equals, mapping) {
    it("should test " + name + " to be " + equals, function () {
      var l = new (require("n3")).Store(); l.toString = graphToString; l.equals = graphEquals;
      var r = new (require("n3")).Store(); r.toString = graphToString;
      g1.forEach(function (triple) { l.addQuad(ShExTerm.externalTriple({subject: triple[0], predicate: triple[1], object: triple[2]}, require("n3").DataFactory)); });
      g2.forEach(function (triple) { r.addQuad(ShExTerm.externalTriple({subject: triple[0], predicate: triple[1], object: triple[2]}, require("n3").DataFactory)); });
      var m = {};
      var ret = l.equals(r, m);
      expect(ret).to.equal(equals, m);
      if (mapping) {
        if (Array.isArray(mapping)) {
          var found = 0;
          mapping.forEach(function (thisMap) {
            try {
              expect(m).to.deep.equal(thisMap);
              ++found;
            } catch (e) {
            }
          });
          if (found !== 1) // slightly misleading error, but adequate.
            expect(m).to.deep.equal(mapping);
        } else {
          expect(m).to.deep.equal(mapping);
        }
      }
    });
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

