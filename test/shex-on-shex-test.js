// Develop and test shex-on-shex.

"use strict";
let TIME = "TIME" in process.env;
let TESTS = "TESTS" in process.env ?
    process.env.TESTS.split(/,,/) :
    null;
let WHOLE_SHAPES = true // candidates have to provide complete shapes.
// otherwise, it works much harder

let ShExLoader = require("../lib/ShExLoader");
let ShExParser = require("../lib/ShExParser");
let ShExValidator = require("../lib/ShExValidator");
let chai = require("chai");
let expect = chai.expect;
let assert = chai.assert;
let should = chai.should;

let fs = require("fs");

let manifestFile = "shex-on-shex/manifest.json";
let Tests = JSON.parse(fs.readFileSync(__dirname + "/" + manifestFile, "UTF-8"));

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
  let filePath = __dirname + "/" + manifestDescription.schemaURL
  return ShExLoader.load([filePath], [], [], [], {}, {}).then(
    // stick it all in one object
    loaded => Object.assign({}, {
      schemaLabel: manifestDescription.schemaLabel,
      schemaURL: filePath,
      shapes: manifestDescription.shapes,
      schema: loaded.schema // ShExParser.construct(manifestDescription.schemaURL, {}).parse(loaded.text)
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
               let solutions = 0
               let subsShapeLabels = []
               let components = []
               let lookForShapes = Object.keys(target.schema.shapes)
               lookForShapes.forEach(shapeLabel => {
                 let shape = target.schema.shapes[shapeLabel]
                 // @@ should be getTripleConstraints() so we know that no triples means no shapes.
                 let candidates = shexDB.getCandidates(shape, target.schema)
                 if (candidates.length === 0) {
                   // console.log("no candidate for " + shapeLabel)
                   // throw Error("no candidate for " + shapeLabel)
                 } else {
                   subsShapeLabels.push(shapeLabel)
                   components.push(candidates)
                 }
               })
               var xp = crossProduct(components);
               let tryNo = 0;
               while (xp.next()) {
                 let label = "aggregate try " + tryNo
                 var map = xp.get(); // [0,1,0,3] mapping from triple to constraint
                 let driverSchema = map.reduce(
                   (s, piece) => ShExUtil.merge(s, piece.desc.schema), { type: "Schema" }
                 )
                 // let subsValidator = ShExValidator.construct(schema)
                 let driverDB = makeShExDB([{
                   schemaLabel: label,
                   shapes: Object.keys(driverSchema.shapes),
                   schema: driverSchema
                 }])
                 driverDB.schema = driverSchema
                 let misses = 0
                 subsShapeLabels.forEach(subsLabel => {
                   let passes = []
                   Object.keys(driverSchema.shapes).forEach(driverLabel => {
                     let validationResult = validator.validate(driverDB, driverLabel, subsLabel)
                     let passed = !("errors" in validationResult)
                     if (passed)
                       passes.push(driverLabel)
                   })
                   if (passes.length === 0) {
                     console.error("error: " + label + ": " + subsLabel + " no match")
                     ++misses
                   } else {
                     // console.log(label + ": " + subsLabel + " matched by " + passes)
                   }
                 })
                 driverDB.schema = null
                 if (misses === 0) {
                   // console.log("successful combination:", map.map(c => c.shapeLabel))
                   ++solutions
                 }
                 ++tryNo
               }
               done(solutions > 0 ? undefined : Error("no matches"))
             } catch (e) {
               // so we don't have to wait for  a timeout
                 done(e)
             }
           })
       })
  })
});

// @@ duplicates local crossProduct function in ShExValidator
// http://stackoverflow.com/questions/9422386/lazy-cartesian-product-of-arrays-arbitrary-nested-loops
function crossProduct(sets) {
  var n = sets.length, carets = [], args = null;

  function init() {
    args = [];
    for (var i = 0; i < n; i++) {
      carets[i] = 0;
      args[i] = sets[i][0];
    }
  }

  function next() {

    // special case: crossProduct([]).next().next() returns false.
    if (args !== null && args.length === 0)
      return false;

    if (args === null) {
      init();
      return true;
    }
    var i = n - 1;
    carets[i]++;
    if (carets[i] < sets[i].length) {
      args[i] = sets[i][carets[i]];
      return true;
    }
    while (carets[i] >= sets[i].length) {
      if (i == 0) {
        return false;
      }
      carets[i] = 0;
      args[i] = sets[i][0];
      carets[--i]++;
    }
    args[i] = sets[i][carets[i]];
    return true;
  }

  return {
    next: next,
    do: function (block, _context) { // old API
      return block.apply(_context, args);
    },
    // new API because
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments#Description
    // cautions about functions over arguments.
    get: function () { return args; }
  };
}

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
        if (expr.reference in schema.shapes)
          v.visitShapeDecl(schema.shapes[expr.reference])
        else
          throw Error("no shape " + expr.reference + " found in\n  " + Object.keys(schema.shapes).join("\n  "))
      }
      v.visitTripleConstraint = function (expr) {
        ret.push(expr)
      }
      v.visitShapeDecl(shape)
      return ret
    }

    function size () { return schemaDescriptors.length; }

    function getCandidates (shape, schema) {
      if (WHOLE_SHAPES) {
        let descSets = getShapeTCs(shape, schema).reduce((acc, tc) => {
          let descSet = predToSchemaDesc.get(tc.predicate)
          if (descSet === undefined) {
            console.warn("no match for " + tc.predicate)
            return acc
          }
          return acc.concat([descSet])
        }, [])
        return descSets.length > 1
          ? descSets.reduce(
            // find intersection among all of the candidate shape labels.
            (a, b, i) =>
              a.filter(
                c =>
                  b.filter(
                    d => d.shapeLabel === c.shapeLabel
                  ).length === 1
              )
          )
          : descSets
      } else {
        return getShapeTCs(shape, schema).reduce((acc, tc) => {
          return acc.concat(predToSchemaDesc.get(tc.predicate)/*.map(m => m.shapeLabel)*/)
        }, [])
      }
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
      let outgoing = typeof point === "object"
          ? getShapeTCs(point, this.schema)
          : shapeLabelToTripleConstraints.get(point).map(
            pair => Object.assign({}, pair.tripleConstraint, pair.desc)
          )
      // if (!shapeLabelToTripleConstraints.has(point))
      //   console.error(point)
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

