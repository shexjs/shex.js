/** ShapePath query interface for ShEx.js: evaluate a ShapePath-selected node
 * set against data by binding ShExMap variables to the selected schema nodes.
 */
import {ShExValidator, resultMapToShapeExprTest} from '@shexjs/validator';
import * as ShExUtil from '@shexjs/util';
import * as ShExTerm from '@shexjs/term';
const ShExMap = require('@shexjs/extension-map');
const MapModule = ShExMap({...ShExTerm, Validator: {}})

export async function shapePathQuery (schema: any, nodeSet: any[], db: any, smap: any): Promise<any[]> {
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
  const validator = new ShExValidator(schema, db, {})
  MapModule.register(validator, { ShExTerm })

  // Validate data against schema.
  const valRes = resultMapToShapeExprTest(validator.validateShapeMap(smap))
  if ("errors" in valRes) {
    throw Error(JSON.stringify(valRes, undefined, 2));
  } else {
    // Return values extracted from data.
    let resultBindings = ShExUtil.valToExtension(valRes, MapModule.url)
    if (!Array.isArray(resultBindings)) resultBindings = [ resultBindings ]
    return vars.flatMap(v => resultBindings.map((b: any) => b[v]))
  }
}
