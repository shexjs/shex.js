#!/usr/bin/env node
"use strict";
const Fs = require('fs');
const Path = require('path');

const Sp = require('shape-path-core')
const SpGrep = require(Sp.scripts.spgrep)

// data query
const ShExValidator = require('@shexjs/validator');
const ShExUtil = require('@shexjs/util');
const ShExTerm = require('@shexjs/term');
const ShExMap = require('@shexjs/extension-map');
const ShapeMap = require('shape-map');
const MapModule = ShExMap(ShExTerm);
const N3 = require("n3");


const Base = 'file://' + __dirname;

class QueryValidator {
  constructor(dataFile, shapeMap) {
    this.dataFile = dataFile;
    this.shapeMap = shapeMap;
    this.graph = readTurtle(dataFile);
  }
  query(schema, schemaNodes) {
    // Add ShExMap annotations to each element of the nodeSet.
    // ShExMap binds variables which we use to capture schema matches.
    const vars = schemaNodes.map((shexNode) => {
      const idx = schemaNodes.indexOf(shexNode); // first occurance of shexNode
      const varName = 'http://a.example/binding-' + idx;
      // Pretend it's a TripleConstraint. Could be any shapeExpr or tripleExpr.
      // @ts-ignore
      shexNode.semActs = [{
        "type": "SemAct",
        "name": MapModule.url,
        "code": `<${varName}>`
      }];
      return varName;
    });
    // Construct validator with ShapeMap semantic action handler.
    const validator = ShExValidator.construct(schema, ShExUtil.rdfjsDB(this.graph), {});
    const mapper = MapModule.register(validator, { ShExTerm });
    try {
      // Validate data against schema.
      const schemaMeta = {
        base: Base,
        prefixes: {}
      };
      const dataMeta = schemaMeta; // cheat 'cause we're not populating them
      const smap = ShapeMap.Parser.construct(Base, schemaMeta, dataMeta)
            .parse(this.shapeMap);
      const valRes = validator.validate(smap);
      if ("errors" in valRes) {
        throw Error(JSON.stringify(valRes, undefined, 2));
      }
      else {
        // Show values extracted from data.
        const resultBindings = ShExUtil.valToExtension(valRes, MapModule.url);
        const values = vars.map(v => resultBindings[v]);
        console.log(JSON.stringify(values, undefined, 2));
      }
    }
    catch (e) {
      if (e instanceof Error)
        throw e;
      throw Error(String(e));
    }
  }
}

const cmd = SpGrep.cmd
      .option('-d, --data <dataFile>', 'data file')
      .option('-m, --shape-map <shapeMap>', 'shape map')

//if (require.main === module) {
  // test() // uncomment to run basic test
  cmd.action(run).parse()
//}
process.exit(0)

function test() {
  run(
    '@<http://project.example/schema#DiscItem>~<http://project.example/ns#href>,@<http://project.example/schema#Issue>~<http://project.example/ns#spec>/valueExpr/shapeExprs~<http://project.example/ns#href>',
    [Path.join(Sp.examples, 'issue/Issue.json')],
    {
      data: Path.join(__dirname, '../examples/issue/Issue2.ttl'),
      shapeMap: '<http://instance.example/project1/Issue2>@<http://project.example/schema#Issue>'
    },
    null
  );
}

function run(pathStr, files, command, commander) {
  const querier = command.data && command.shapeMap
        ? new QueryValidator(command.data, command.shapeMap)
        : null;
  SpGrep.run(pathStr, files, command, commander).forEach( ([leader, schema, schemaNodes]) => {
    if (querier)
      querier.query(schema, schemaNodes);
    else
      console.log(leader + JSON.stringify(schemaNodes, null, 2));
  })
}
exports.run = run;

function readTurtle(filePath) {
  const graph = new N3.Store();
  const turtleStr = Fs.readFileSync(filePath, 'utf8');
  const parser = new N3.Parser({ baseIRI: 'http://a.example/' });
  graph.addQuads(parser.parse(turtleStr));
  return graph;
}
