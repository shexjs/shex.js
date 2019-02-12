// Develop and test shex-on-shex.

"use strict";
let TIME = "TIME" in process.env;
let TESTS = "TESTS" in process.env ?
    process.env.TESTS.split(/,,/) :
    null;
let ShExLoader = require("../lib/ShExLoader");
let ShExParser = require("../lib/ShExParser");
let ShExValidator = require("../lib/ShExValidator");
let chai = require("chai");
let expect = chai.expect;
let assert = chai.assert;
let should = chai.should;

let fs = require("fs");

let manifestFile = "shex-on-shex/manifest.json";
let Tests = JSON.parse(fs.readFileSync(manifestFile, "UTF-8"));

let last = new Date();
let stamp = TIME ? function (s) {
  let t = new Date();
  let delta = t - last;
  last = t;
  console.warn(delta, s);
} : function () {};

if (TESTS)
  Tests = Tests.filter(function (t) {
    return TESTS.indexOf(t.name) !== -1;
  });

function loadSchema (manifestDescription) {
  return ShExLoader.GET(manifestDescription.schemaURL).then(
    // stick it all in one object
    loaded => Object.assign({}, {
      schemaLabel: manifestDescription.schemaLabel,
      schemaURL: manifestDescription.schemaURL,
      shapes: manifestDescription.shapes,
      schema: ShExParser.construct(manifestDescription.schemaURL, {}).parse(loaded.text)
    }, loaded)
  )
}

stamp("setup");
Tests.forEach(function (test) {
  describe(test.schemaLabel, function () {
    let targetSchemaPromise = loadSchema(test)
    let coverageSchemaPromises = test.coverageSchemas.map(
      cs => loadSchema(cs)
    )
    let pz = Promise.all([targetSchemaPromise, Promise.all(coverageSchemaPromises)]);
    let shexDB = null, validator = null, target = null, coverage  = null
    it("should construct a ShExDB from all "
       + test.coverageSchemas.length
       + " coverage schemas", done => {
         pz.then(
           targetAndCoverage => {
             target = targetAndCoverage[0]
             coverage = targetAndCoverage[1]
             // console.log(JSON.stringify(targetAndCoverage, null, 2))
             shexDB = makeShExDB(targetAndCoverage[1])
             validator = ShExValidator.construct(target.schema);
             expect(shexDB.size()).to.equal(test.coverageSchemas.length)
             done()
           })
       })
    it("ShExDB should have "
       + test.coverageSchemas.length
       + " schemas", done => {
         pz.then(
           targetAndCoverage => {
             expect(shexDB.size()).to.equal(test.coverageSchemas.length)
             try {
               Object.keys(target.schema.shapes).forEach(shapeLabel => {
                 let shape = target.schema.shapes[shapeLabel]
                 let candidates = shexDB.getCandidates(shape, target.schema)
                 if (candidates.length === 0) {
                   throw Error("no candidate for " + shapeLabel)
                 }
                 candidates.forEach(candidate => {
                   shexDB.schema = candidate.desc.schema
                   let validationResult = validator.validate(shexDB, candidate.shapeLabel, shapeLabel)
                   shexDB.schema = null
                   console.log(candidate.shapeLabel, shapeLabel, "\n", validationResult)
                 })
               })
               done()
             } catch (e) {
               // so we don't have to wait for  a timeout
                 done(e)
             }
           })
       })
  })
});


  function makeShExDB (schemaDescriptors, queryTracker) {
    /* schemaDescriptors: [{
         schemaLabel
         schemaURL
         shapes
         schema
         text
         url
       }]
    */
    let predToSchemaDesc = new Map()
    let shapeLabelToTripleConstraints = new Map()

    schemaDescriptors.forEach(desc => {
      desc.shapes.forEach(shapeLabel => {
        if (!(shapeLabel in desc.schema.shapes))
          throw Error("Error in " + desc.schemaLabel + ": " + shapeLabel + " not found in\n  " + Object.keys(desc.schema.shapes).join("\n  "))
        if (shapeLabelToTripleConstraints.has(shapeLabel))
          throw Error("hmm")
        shapeLabelToTripleConstraints.set(shapeLabel, [])
        getShapeTCs(desc.schema.shapes[shapeLabel], desc.schema).forEach(tc => {
          if (!(predToSchemaDesc.has(tc.predicate)))
            predToSchemaDesc.set(tc.predicate, [])
          predToSchemaDesc.get(tc.predicate).push({
            shapeLabel: shapeLabel,
            desc: desc
          })
          shapeLabelToTripleConstraints.get(shapeLabel).push({
            tripleConstraint: tc,
            desc: desc
          })
        })
      })
    })

    function getShapeTCs (shape, schema) {
      let ret = []
      let v = ShExUtil.Visitor();
      let
      oldVisitValueExpr = v.visitValueExpr,
      // oldVisitExtends = v.visitExtends,
      oldVisitShapeRef = v.visitShapeRef,
      oldVisitTripleConstraint = v.visitTripleConstraint;
      v.visitValueExpr = function (expr, label) { } // don't follow valueExprs
      // v.visitExtends = function (ext) {
      //   if (knownExpressions.indexOf(ext.include) === -1 &&
      //       "productions" in schema &&
      //       ext.include in schema.productions) {
      //     knownExpressions.push(ext.include)
      //     return oldVisitExpression.call(v, schema.productions[ext.include]);
      //   }
      //   return oldVisitExtends.call(v, ext);
      // }
      v.visitShapeRef = function (expr) {
        v.visitShapeDecl(schema.shapes[expr.reference])
      }
      v.visitTripleConstraint = function (expr) {
        ret.push(expr)
      }
      v.visitShapeDecl(shape)
      return ret
    }

    function size () { return schemaDescriptors.length; }

    function getCandidates (shape, schema) {
      return getShapeTCs(shape, schema).reduce((acc, tc) => {
        return acc.concat(predToSchemaDesc.get(tc.predicate)/*.map(m => m.shapeLabel)*/)
      }, [])
    }

    function getQuads (s, p, o, g) {
      return db.getQuads(s, p, o, g);
    }
    function getSubjects () { return db.getSubjects(); }
    function getPredicates () { return db.getPredicates(); }
    function getObjects () { return db.getObjects(); }

    function getNeighborhood (point, shapeLabel/*, shape */) {
      // I'm guessing a local DB doesn't benefit from shape optimization.
      let startTime;
      if (queryTracker) {
        startTime = new Date()
        queryTracker.start(false, point, shapeLabel)
      }
      let outgoing = shapeLabelToTripleConstraints.get(point).map(
        pair => Object.assign({}, pair.tripleConstraint, pair.desc)
      )
      if (queryTracker) {
        let time = new Date()
        queryTracker.end(outgoing, time - startTime)
        startTime = time
      }
      // if (queryTracker) {
      //   queryTracker.start(true, point, shapeLabel)
      // }
      // let incoming = db.getQuads(null, null, point, null)
      // if (queryTracker) {
      //   queryTracker.end(incoming, new Date() - startTime)
      // }
      return {
        outgoing: outgoing,
        incoming: []// incoming
      };
    }

    return {
      // size: db.size,
      getNeighborhood: getNeighborhood,
      getQuads: getQuads,
      getSubjects: getSubjects,
      getPredicates: getPredicates,
      getObjects: getObjects,
      size: size,
      getCandidates: getCandidates,
      // getQuads: function (s, p, o, graph, shapeLabel) {
      //   // console.log(Error(s + p + o).stack)
      //   if (queryTracker)
      //     queryTracker.start(!!s, s ? s : o, shapeLabel);
      //   let triples = db.getQuads(s, p, o, graph)
      //   if (queryTracker)
      //     queryTracker.end(triples, new Date() - startTime);
      //   return triples;
      // }
    };
  }

// describe("resolved promise", () => {
//   let p = Promise.resolve(1)
//   it('should equal 1', done => {
//     p.then(result => {
//       expect(result).to.equal(1)
//       done()
//     }, error => {
//       done(Error(error))
//     })
//   })
// })

// describe("rejected promise", () => {
//   let p = Promise.reject(1)
//   it('should fail', done => {
//     p.then(result => {
//       done(Error("should reject"))
//     }, error => {
//       expect(error).to.equal(1)
//       done()
//     })
//   })
// })

// describe("rejected promise chai expect", () => {
//   let p = Promise.reject(1)
//   it('should fail', done => {
//     p.then(result => {
//       done(Error("should reject"))
//     }, error => {
//       expect(error).to.equal(1)
//       done()
//     })
//   })
// })

// xdescribe("resolve awaited promise", () => {
//   let p = Promise.resolve(1)
//   it('should equal 1', async () => {
//     const result = await p;
//     expect(result).to.equal(1); 
//   });
//   it('should still equal 1', async () => {
//     const result = await p;
//     expect(result).to.equal(1); 
//   });
// })

// xdescribe("reject awaited promise", () => {
//   let p = Promise.reject(Error("fail"))
//   // let p = Promise.resolve(1)
//   it('should fail', async () => {
//     try {
//       // should.fail("asdf")
//       const result = await p;
//       assert(false, "expected to fail");
//     } catch (e) {
//       expect(e.message).to.equal("fail");
//     }
//   });
//   it('is still 1', async () => {
//     const result = await p;
//     expect(result).to.equal(1); 
//   });
// })

