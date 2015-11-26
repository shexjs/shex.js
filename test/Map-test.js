#!/usr/bin/env node

var VERBOSE = "VERBOSE" in process.env;
var TERSE = VERBOSE;
var TESTS = "TESTS" in process.env ? process.env.TESTS.split(/\|/) : null;

var ShExLoader = require("../lib/ShExLoader"); // for verbose output
var ShExWriter = require("../lib/ShExWriter"); // for verbose output
var ShExValidator = require("../lib/ShExValidator");
var Mapper = require("../extensions/shex:Map");
var Promise = require("promise");
var expect = require("chai").expect;
var n3 = require("n3");

var maybeLog = VERBOSE ? console.log : function () {};

var Harness = {
  prepare: function (srcSchemas, targetSchemas, inputData, inputNode, createRoot, expectedBindings, expectedRDF) {
    var mapstr = srcSchemas + " -> " + targetSchemas.join(',');
    it('('+ mapstr + ')' + ' should map ' + inputData + " to " + expectedRDF, function (done) {

      // Lean on ShExLoader to load all the schemas and data graphs.
      Promise.all([ShExLoader.load(srcSchemas, [], [inputData]),
                   ShExLoader.load(targetSchemas, [], [expectedRDF])]).
        then(function (loads) {
          loads[0].data.toString = loads[1].data.toString = graphToString;

          // prepare validator
          var validator = ShExValidator(loads[0].schema);
          Mapper.register(validator);

          // run validator
          var res = validator.validate(loads[0].data, inputNode, null);
          expect(res).to.not.be.null;
          var resultBindings = validator.semActHandler.results["http://shex.io/extensions/Map/#"];

          // test against expected.
          if (expectedBindings) {
            expect(resultBindings).to.deeply.equal(expectedBindings);
          }

          var map = Mapper.materializer(loads[1].schema);
          var outputGraph = map.materialize(resultBindings, createRoot);
          outputGraph.equals = graphEquals; // hotpatch with graph isomorphism function.
          outputGraph.toString = graphToString;
          maybeLog(mapstr);
          maybeLog("output:");
          maybeLog(outputGraph.toString());
          maybeLog("expect:");
          maybeLog(loads[1].data.toString());
          expect(outputGraph.equals(loads[1].data)).to.be.true;
          done();
        }).catch(function (error) {
          done(error);
        });

    });
  }
};

describe('A ShEx Mapper', function () {
  Harness.prepare(["test/Map/BPFHIR.shex"], ["test/Map/BPunitsDAM.shex"], "test/Map/BPFHIR.ttl", "tag:BPfhir123", "tag:b0", null, "test/Map/BPunitsDAM.ttl");
  Harness.prepare(["test/Map/BPunitsDAM.shex"], ["test/Map/BPFHIR.shex"], "test/Map/BPunitsDAM.ttl", "tag:b0", "tag:BPfhir123", null, "test/Map/BPFHIR.ttl");

  // Harness.prepare(["test/Map/BPFHIRsys.shex", "test/Map/BPFHIRdia.shex"], ["test/Map/BPunitsDAM.shex"], "test/Map/BPFHIR.ttl", "tag:BPfhir123", "tag:b0", null, "test/Map/BPunitsDAM.ttl");

/*
  Harness.prepare(["test/Map/BPFHIR.shex"], ["test/Map/BPunitsDAMsys.shex", "test/Map/BPunitsDAMdia.shex"], "test/Map/BPFHIR.ttl", null, "test/Map/BPunitsDAM.ttl");

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
  var w = n3.Writer({
      write: function (chunk, encoding, done) { output += chunk; done && done(); },
  });
  w.addTriples(this.find(null, null, null)); // is this kosher with no end method?
  return "{\n" + output + "\n}";
}

function graphEquals (right) {

  if (this.size !== right.size)
    return false;

  var m = {};
  function match (g) {
    function val (term) {
      if (n3.Util.isBlank(term))
        return (term in m) ? m[term] : null
      else
        return term;
    }

    if (g.length == 0)
      return true;
    var t = g.pop(), s = val(t.subject), o = val(t.object);
    var tm = right.findByIRI(s, t.predicate, o);

    var r = tm.reduce(function (ret, triple) {
      var adds = [];
      function add (term, to) {
        if (val(term) === null) {
          adds.push(term);
          m[term] = to;
        }
      }
      add(t.subject, triple.subject);
      add(t.object, triple.object);
      ret = match(g);
      if (!ret)
        adds.forEach(function (added) {
          delete m[added];
        });
      return ret;
    }, false);
    if (!r) {
      g.push(t);
    }
    return r;
  }
  return match(this.find(null, null, null));
}

var GraphEquiv = {
  testEquiv: function (name, g1, g2, equalsSign) {
    it("should test " + name + " to be " + equalsSign, function () {
      var l = n3.Store(); l.toString = graphToString; l.equals = graphEquals;
      var r = n3.Store(); r.toString = graphToString;
      g1.forEach(function (triple) { l.addTriple({subject: triple[0], predicate: triple[1], object: triple[2]}); });
      g2.forEach(function (triple) { r.addTriple({subject: triple[0], predicate: triple[1], object: triple[2]}); });
      expect(l.equals(r)).to.equal(equalsSign === "=");
    });
  }
}

describe("Graph equivalence", function () {
  [
    {name:"spo123=spo123", p:"=", 
     l:[["s", "p", "o1"], ["s", "p", "o2"], ["s", "p", "o3"]],
     r:[["s", "p", "o2"], ["s", "p", "o3"], ["s", "p", "o1"]]},
    {name:"spo123!=sPo123", p:"!=", 
     l:[["s", "p", "o1"], ["s", "p", "o2"], ["s", "p", "o3"]],
     r:[["s", "P", "o2"], ["s", "P", "o3"], ["s", "P", "o1"]]},
    {name:"l<r", p:"!=", 
     l:[["s", "p", "o1"], ["s", "p", "o2"]],
     r:[["s", "p", "o2"], ["s", "p", "o3"], ["s", "p", "o1"]]},
    {name:"r<l", p:"!=", 
     l:[["s", "p", "o1"], ["s", "p", "o2"], ["s", "p", "o3"]],
     r:[["s", "p", "o2"], ["s", "p", "o3"]]},
    {name:"1-bnode-no-rewrite", p:"=", 
     l:[["s", "p", "_:x1"], ["s", "p", "o2"], ["s", "p", "o3"]],
     r:[["s", "p", "_:x1"], ["s", "p", "o2"], ["s", "p", "o3"]]},
    {name:"1-bnode-rewrite", p:"=", 
     l:[["s", "p", "_:l1"], ["s", "p", "o2"], ["s", "p", "o3"]],
     r:[["s", "p", "_:r1"], ["s", "p", "o2"], ["s", "p", "o3"]]},
    {name:"tall3", p:"=", 
     l:[["s", "p1", "_:l1"], ["_:l1", "p2", "_:l2"], ["_:l2", "p", "_:l3"]],
     r:[["s", "p1", "_:r1"], ["_:r1", "p2", "_:r2"], ["_:r2", "p", "_:r3"]]},
    {name:"tall3-rotated1", p:"=", 
     l:[["s", "p1", "_:l1"], ["_:l1", "p2", "_:l2"], ["_:l2", "p", "_:l3"]],
     r:[["_:r1", "p2", "_:r2"], ["_:r2", "p", "_:r3"], ["s", "p1", "_:r1"]]},
    {name:"s p _:l1, o2 != s p _:r1, _:r2", p:"!=", 
     l:[["s", "p", "_:l1"], ["s", "p", "o2"]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r2"]]},
    {name:"s p _:l1, o2, p3 != s p _:r1, _:r2, o3", p:"!=", 
     l:[["s", "p", "_:l1"], ["s", "p", "o2"], ["s", "p", "o3"]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r2"], ["s", "p", "o3"]]},
    {name:"s p _:l1, o2, p3 != s p _:r1, _:r1, o3", p:"!=", 
     l:[["s", "p", "_:l1"], ["s", "p", "o2"], ["s", "p", "o3"]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r1"], ["s", "p", "o3"]]},
    {name:"s p _:l1, _:l2, o3 != s p _:r1, _:r1, o3", p:"!=", 
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["s", "p", "o3"]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r1"], ["s", "p", "o3"]]},
    {name:"s p _:l1, _:l2, o3 = s p _:r1, _:r2, o3", p:"=", 
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["s", "p", "o3"]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r2"], ["s", "p", "o3"]]},
    {name:"s p _:l1. s p2 _:l2, p3 = s p _:r1. s p2 _:r2, o3", p:"=", 
     l:[["s", "p", "_:l1"], ["s", "p2", "_:l2"], ["s", "p2", "o3"]],
     r:[["s", "p", "_:r1"], ["s", "p2", "_:r2"], ["s", "p2", "o3"]]},
    {name:"s p _:l1. s p2 _:l2, p3 = s p _:r1. s p2 _:r2, o3 - rotated1", p:"=", 
     l:[["s", "p", "_:l1"], ["s", "p2", "_:l2"], ["s", "p2", "o3"]],
     r:[["s", "p2", "o3"], ["s", "p", "_:r1"], ["s", "p2", "_:r2"]]},
    {name:"s p _:l1. s p2 _:l2, p3 = s p _:r1. s p2 _:r2, o3 - rotated2", p:"=", 
     l:[["s", "p", "_:l1"], ["s", "p2", "_:l2"], ["s", "p2", "o3"]],
     r:[["s", "p2", "_:r2"], ["s", "p2", "o3"], ["s", "p", "_:r1"]]},
    {name:"s p _:l1, _:l2, _:l3 = s p _:r1, _:r2, _:r3", p:"=", 
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["s", "p", "_:r3"]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r2"], ["s", "p", "_:r3"]]},
    {name:"s p _:l1, _:l2, _:l3 = s p _:r1, _:r2, _:r3 - rotated1", p:"=", 
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["s", "p", "_:r3"]],
     r:[["s", "p", "_:r3"], ["s", "p", "_:r1"], ["s", "p", "_:r2"]]},
    {name:"s p _:l1, _:l2, _:l3 = s p _:r1, _:r2, _:r3 - rotated2", p:"=", 
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["s", "p", "_:r3"]],
     r:[["s", "p", "_:r2"], ["s", "p", "_:r3"], ["s", "p", "_:r1"]]},
    // literals
    {name:"s p _:l1, _:l2, 'o3' = s p _:r1, _:r2, 'o3'", p:"=", 
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["s", "p", "\"o3\""]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r2"], ["s", "p", "\"o3\""]]},
    {name:"s p _:l1, _:l2, 'o3' != s p _:r1, _:r2, 'o4'", p:"!=", 
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["s", "p", "\"o3\""]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r2"], ["s", "p", "\"o4\""]]},
    {name:"s p _:l1, _:l2, 'o3'@fr = s p _:r1, _:r2, 'o3'@fr", p:"=", 
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["s", "p", "\"o3\"@fr"]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r2"], ["s", "p", "\"o3\"@fr"]]},
    {name:"s p _:l1, _:l2, 'o3'@fr != s p _:r1, _:r2, 'o3'@en-FR", p:"!=", 
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["s", "p", "\"o3\"@fr"]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r2"], ["s", "p", "\"o3\"@en-FR"]]},
    {name:"s p _:l1, _:l2, 'o3'^^dt1 = s p _:r1, _:r2, 'o3'^^dt1", p:"=", 
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["s", "p", "\"o3\"^^dt1"]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r2"], ["s", "p", "\"o3\"^^dt1"]]},
    {name:"s p _:l1, _:l2, 'o3'^^dt1 != s p _:r1, _:r2, 'o3'^^dt2", p:"!=", 
     l:[["s", "p", "_:l1"], ["s", "p", "_:l2"], ["s", "p", "\"o3\"^^dt1"]],
     r:[["s", "p", "_:r1"], ["s", "p", "_:r2"], ["s", "p", "\"o3\"^^dt2"]]},

  ].forEach(function (test) { GraphEquiv.testEquiv(test.name, test.l, test.r, test.p); });
});

