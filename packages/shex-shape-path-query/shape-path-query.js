const ShExValidator = require('@shexjs/validator')
const ShExUtil = require('@shexjs/util')
const ShExTerm = require('@shexjs/term')
const ShExMap = require('@shexjs/extension-map')
const MapModule = ShExMap(ShExTerm)
import { Store as RdfStore } from 'n3'

function shapePathQuery (schema, nodeSet, db, node, shape) {
  // Add ShExMap annotations to each element of the nodeSet.
  // ShExMap binds variables which we use to capture schema matches.
  const vars = nodeSet.map((shexNode) => {
    const varName = 'http://a.example/var' + nodeSet.indexOf(shexNode)
    // Pretend it's a TripleConstraint. Could be any shapeExpr or tripleExpr.
    const varAssignSemAct = {
      type: 'SemAct',
      name: MapModule.url,
      code: `<${varName}>`
    };
    shexNode.semActs = [varAssignSemAct];
    return varName
  })

  // Construct validator with ShapeMap semantic action handler.
  const validator = ShExValidator.construct(schema, db, {})
  const mapper = MapModule.register(validator, { ShExTerm })

  // Expect successful validation.
  const valRes = validator.validate([{ node, shape }])
  expect(valRes.errors).toBeUndefined

  // Compare to reference.
  const resultBindings = ShExUtil.valToExtension(valRes, MapModule.url)
  return vars.map(v => resultBindings[v])
}

module.exports = { shapePathQuery }
