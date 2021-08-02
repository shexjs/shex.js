const ShExValidator = require('@shexjs/validator')
const ShExUtil = require('@shexjs/util')
const ShExTerm = require('@shexjs/term')
const ShExMap = require('@shexjs/extension-map')
const MapModule = ShExMap(ShExTerm)
const RdfStore = require('n3').Store

function shapePathQuery (schema, nodeSet, db, smap) {
  // Add ShExMap annotations to each element of the nodeSet.
  // ShExMap binds variables which we use to capture schema matches.
  const vars = nodeSet.map((shexNode) => {
    const varName = 'http://a.example/binding-' + nodeSet.indexOf(shexNode)
    // Pretend it's a TripleConstraint. Could be any shapeExpr or tripleExpr.
    const varAssignSemAct = {
      type: 'SemAct',
      name: MapModule.url,
      code: `<${varName}>`
    };
    shexNode.semActs = [varAssignSemAct]
    return varName
  })

  // Construct validator with ShapeMap semantic action handler.
  const validator = ShExValidator.construct(schema, db, {})
  const mapper = MapModule.register(validator, { ShExTerm })

  // Validate data against schema.
  const valRes = validator.validate(smap)
  if ("errors" in valRes) {
    throw Error(JSON.stringify(valRes, undefined, 2));
  } else {
    // Return values extracted from data.
    const resultBindings = ShExUtil.valToExtension(valRes, MapModule.url)
    const values = vars.map(v => resultBindings[v])
    return values
  }
}

module.exports = { shapePathQuery }
