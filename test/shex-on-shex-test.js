// Develop and test shex-on-shex.

"use strict";
// Environment vars for extermal control
let TIME = "TIME" in process.env; // render timestamps
let TESTS = "TESTS" in process.env ? // filter tests to match supplied regex
    new RegExp(process.env.TESTS) :
    null;
let WHOLE_SHAPES = false // Candidates have to provide complete shapes.
// Otherwise, it works much harder (100ms vs 75ms, with neonatology).

let ShExLoader = require("../lib/ShExLoader");
let ShExParser = require("../lib/ShExParser");
let ShExValidator = require("../lib/ShExValidator");
let chai = require("chai");
let expect = chai.expect;
let assert = chai.assert;
let should = chai.should;

let fs = require("fs");

// All tests are listed in this manifest file.
let manifestFile = "shex-on-shex/manifest.json";
let Tests = JSON.parse(fs.readFileSync(__dirname + "/" + manifestFile, "UTF-8"));

// Timestamp for benchmarking
let last = new Date();
let stamp = TIME ? function (s) {
  let t = new Date();
  let delta = t - last;
  last = t;
  console.warn(delta, s);
} : function () {};

// Limit tests if
if (TESTS)
  Tests = Tests.filter(t => TESTS.exec(t.schemaLabel));

/** Set up test for each (remaining) entry in Tests
 *
 * subs<X> is short for subscription<X> -- refers to the goal schema
 * <X>Desc is a schema descriptor a la: {
         schemaLabel
         schemaURL
         shapes
         schema
         text
         url
       }
 *
 * TODO: `subs` and `drivers` are particular to CDS use case so
 *       s/subs/goal/g s/driver/component/g
 */
stamp("setup");
Tests.forEach(function (test) {
  describe(test.schemaLabel, function () {
    let targetSchemaPromise = loadSchema(test)
    let coverageSchemaPromises = test.coverageSchemas.map(
      cs => loadSchema(cs)
    )
    let pz = Promise.all([targetSchemaPromise, Promise.all(coverageSchemaPromises)]);
    let driversDB = null, validator = null

    it("should construct a ShExDB from all "
       + test.coverageSchemas.length
       + " coverage schemas", done => {
         pz.then(
           subsAndDrivers => {
             // Index all of the driver schemas.
             driversDB = makeShExDB(subsAndDrivers[1])

             // Construct a validator for the  subscription schema.
             validator = ShExValidator.construct(subsAndDrivers[0].schema);

             expect(driversDB.size()).to.equal(test.coverageSchemas.length)
             done()
           })
       })

    it("ShExDB should have "
       + test.coverageSchemas.length
       + " schemas", done => {
         pz.then(
           subsAndDrivers => {
             expect(driversDB.size()).to.equal(test.coverageSchemas.length)
             try {
               let solutions = 0
               let subsShapeLabels = []
               let components = []
               let subsDesc = subsAndDrivers[0]

               stamp("look for possible components");
               Object.keys(subsDesc.schema.shapes).forEach(shapeLabel => {
                 let shape = subsDesc.schema.shapes[shapeLabel]
                 // @@ should be getTripleConstraints() so we know that no triples means no shapes.
                 let candidates = driversDB.getCandidates(shape, subsDesc.schema)
                 if (candidates.length === 0) {
                   // Skip labels that don't have any arcs (i.e. only NodeConstraints).
                   // console.log("no candidate for " + shapeLabel)
                 } else {
                   subsShapeLabels.push(shapeLabel) // look for shapeLabel in driver schema
                   components.push(candidates)
                 }
               })

               // Test each possible arrangement of the components.
               var xp = crossProduct(components);
               let tryNo = 0;
               stamp("scanning " + xp.length + " possibilities");
               while (xp.next()) {
                 let label = "aggregation-" + tryNo

                 // driverList holds the arrangement currently being tested.
                 let driverList = xp.get().reduce(
                   (acc, desc) => acc.indexOf(desc) === -1 ? acc.concat(desc) : acc,
                   []
                 );
                 let prettyList = "\n  " + driverList.map(c => c.shapeLabel).join("\n  ")

                 // Compose a schema from the driverList.
                 let driverSchema = driverList.reduce(
                   (s, piece) => ShExUtil.merge(s, piece.desc.schema),
                   { type: "Schema" } // empty schema
                 )

                 // Index the driverSchema
                 let driverDB = makeShExDB([{
                   schemaLabel: label,
                   shapes: Object.keys(driverSchema.shapes),
                   schema: driverSchema
                 }])
                 driverDB.schema = driverSchema

                 // Walk through the goal schema and find some satisfying shape in the drivers.
                 let misses = 0
                 subsShapeLabels.forEach(subsLabel => {
                   let passes = []

                   // See if some expression in the driverSchema satisfies subsLabel.
                   Object.keys(driverSchema.shapes).forEach(driverLabel => {
                     let validationResult = validator.validate(driverDB, driverLabel, subsLabel)
                     let passed = !("errors" in validationResult)
                     if (passed)
                       passes.push(driverLabel)
                   })

                   if (passes.length === 0) {
                     console.error("error: " + label + ": " + subsLabel
                                   + " not matched in:" + prettyList)
                     ++misses
                   } else {
                     // console.log(label + ": " + subsLabel + " matched by " + passes)
                   }
                 })
                 driverDB.schema = null
                 stamp("tested possibility " + tryNo + ": " + (misses === 0));

                 // See if each goal shape was accounted for.
                 if (misses === 0) {
                   console.log(label + " successful:" + prettyList)
                   ++solutions
                 }
                 ++tryNo
               }

               // The expected number of solutions is in the test.
               stamp("found " + solutions + "/" + test.solutions + " solutions")
               done(solutions === test.solutions ? undefined : Error("expected " + test.solutions + " matches, got " + solutions))
             }
             catch (e) {
               done(e)
             }
           })
       })
  })
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

// @@ MOSTLY duplicates local crossProduct function in ShExValidator, modulo length getter
// http://stackoverflow.com/questions/9422386/lazy-cartesian-product-of-arrays-arbitrary-nested-loops
function crossProduct(sets) {
  var n = sets.length, carets = [], args = null, length = 1;

  for (var i = 0; i < n; i++) {
    length = length * (sets[i].length || 1);
  }

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
    get length () {
      return length
    },
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

/** index each triple constrain in each schema in schemaDescriptors
 * getNeighborhood(shapeLabel) returns TCs reachable from shapeLabel
 */
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
          return acc.concat(predToSchemaDesc.get(tc.predicate)).filter(desc => acc.indexOf(desc) === -1)
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

