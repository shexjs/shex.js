#!/usr/bin/env node

var VERBOSE = "VERBOSE" in process.env;
var TERSE = VERBOSE;
var TESTS = "TESTS" in process.env ? process.env.TESTS.split(/,/) : null;

var ShExCore = require("@shexjs/core");
var ShExUtil = ShExCore.Util;
var ShExValidator = ShExCore.Validator;
var ShExLoader = require("@shexjs/loader");
var Mapper = require("@shexjs/extension-map");
// var Promise = require("promise");
var expect = require("chai").expect;
var Path = require("path");
var RdfTerm = ShExCore.RdfTerm;

var maybeLog = VERBOSE ? console.log : function () {};

var Harness = {
  prepare: function (srcSchemas, targetSchemas, inputData, inputNode, createRoot, expectedBindings, expectedRDF) {
    var mapstr = srcSchemas + " -> " + targetSchemas.join(',');
    it('('+ mapstr + ')' + ' should map ' + inputData + " to " + expectedRDF, function (done) {

      srcSchemas = srcSchemas.map(function (p) { return Path.resolve(__dirname, p); });
      targetSchemas = targetSchemas.map(function (p) { return Path.resolve(__dirname, p); });
      inputData = Path.resolve(__dirname, inputData);
      expectedRDF = Path.resolve(__dirname, expectedRDF);
      // Lean on ShExLoader to load all the schemas and data graphs.
      Promise.all([ShExLoader.load(srcSchemas, [], [inputData], [], {index: true}),
                   ShExLoader.load(targetSchemas, [], [expectedRDF], [], {index: true})]).
        then(function (loads) {
          loads[0].data.toString = loads[1].data.toString = graphToString;

          // prepare validator
          var validator = ShExValidator.construct(loads[0].schema, { noCache: true });
          Mapper.register(validator);

          // run validator
          var res = validator.validate(ShExUtil.makeN3DB(loads[0].data), inputNode, ShExValidator.start);
          expect(res).to.not.be.null;
          var resultBindings = validator.semActHandler.results["http://shex.io/extensions/Map/#"];

          // test against expected.
          if (expectedBindings) {
            expect(resultBindings).to.deeply.equal(expectedBindings);
          }

          var map = Mapper.materializer(loads[1].schema);
          var binder = Mapper.binder([resultBindings]);
          var outputGraph = map.materialize(binder, createRoot);
          outputGraph.toString = graphToString;
          maybeLog(mapstr);
          maybeLog("output:");
          maybeLog(outputGraph.toString());
          maybeLog("expect:");
          maybeLog(loads[1].data.toString());
          // console.log(outputGraph.toString(), "\n--\n", loads[1].data.toString());
          expect(geq(outputGraph, loads[1].data)).to.be.true;
          done();
        }).catch(function (error) {
          done(error);
        });

    });
  }
};

function geq (l, r) { // graphEquals needs a this
  return graphEquals.call(l, r);
}

describe('A ShEx Mapper', function () {
  var tests = [
    ["there", ["Map/BPDAMFHIR/BPFHIR.shex"], ["Map/BPDAMFHIR/BPunitsDAM.shex"], "Map/BPDAMFHIR/BPFHIR.ttl", "tag:BPfhir123", "tag:b0", null, "Map/BPDAMFHIR/BPunitsDAM.ttl"],
    ["back" , ["Map/BPDAMFHIR/BPunitsDAM.shex"], ["Map/BPDAMFHIR/BPFHIR.shex"], "Map/BPDAMFHIR/BPunitsDAM.ttl", "tag:b0", "tag:BPfhir123", null, "Map/BPDAMFHIR/BPFHIR.ttl"],
//    ["bifer", ["Map/BPDAMFHIR/BPFHIRsys.shex", "Map/BPDAMFHIR/BPFHIRdia.shex"], ["Map/BPDAMFHIR/BPunitsDAM.shex"], "Map/BPDAMFHIR/BPFHIR.ttl", "tag:BPfhir123", "tag:b0", null, "Map/BPDAMFHIR/BPunitsDAM.ttl"]
//    ["bifb" , ["Map/BPDAMFHIR/BPFHIR.shex"], ["Map/BPDAMFHIR/BPunitsDAMsys.shex", "Map/BPDAMFHIR/BPunitsDAMdia.shex"], "Map/BPDAMFHIR/BPFHIR.ttl", "tag:b0", "tag:BPfhir123", null, "Map/BPDAMFHIR/BPunitsDAM.ttl"]
  ];
  if (TESTS)
    tests = tests.filter(function (t) { return TESTS.indexOf(t[0]) !== -1; });
  tests.forEach(function (test) {
    Harness.prepare.apply(null, test.slice(1));
  });

/*
  Harness.prepare(["Map/BPDAMFHIR/BPFHIR.shex"], ["Map/BPDAMFHIR/BPunitsDAMsys.shex", "Map/BPDAMFHIR/BPunitsDAMdia.shex"], "Map/BPDAMFHIR/BPFHIR.ttl", null, "Map/BPDAMFHIR/BPunitsDAM.ttl");

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
      if (RdfTerm.isBlank(term))
        return (term in mapping) ? mapping[term] : null // Bnodes get current binding or null.
      else
        return term;                              // Other terms evaluate to themselves.
    }

    if (g.length == 0)                            // Success if there's nothing left to match.
      return true;
    var t = g.pop(), s = val(t.subject), o = val(t.object); // Take the first triple in left.
    var tm = right.getQuads(
      s ? RdfTerm.externalTerm(s, require("n3").DataFactory) : null,
      RdfTerm.externalTerm(t.predicate, require("n3").DataFactory),
      o ? RdfTerm.externalTerm(o, require("n3").DataFactory) : null  // Find candidates in right.
    ).map(RdfTerm.internalTriple);
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
               .map(RdfTerm.internalTriple));
}

  function testEquiv (name, g1, g2, equals, mapping) {
    it("should test " + name + " to be " + equals, function () {
      var l = new (require("n3")).Store(); l.toString = graphToString; l.equals = graphEquals;
      var r = new (require("n3")).Store(); r.toString = graphToString;
      g1.forEach(function (triple) { l.addQuad(RdfTerm.externalTriple({subject: triple[0], predicate: triple[1], object: triple[2]}, require("n3").DataFactory)); });
      g2.forEach(function (triple) { r.addQuad(RdfTerm.externalTriple({subject: triple[0], predicate: triple[1], object: triple[2]}, require("n3").DataFactory)); });
      var m = {};
      var ret = l.equals(r, m);
      expect(ret).to.equal(equals, m);
      if (mapping) {
        if (mapping.constructor === Array) {
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

