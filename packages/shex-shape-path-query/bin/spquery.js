#!/usr/bin/env node
"use strict";
const Fs = require('fs');
const Path = require('path');

const Sp = require('shape-path-core')

const oldDepth = process.env._INCLUDE_DEPTH
if (oldDepth === undefined)
  process.env._INCLUDE_DEPTH = 0
process.env._INCLUDE_DEPTH++
const SpGrep = require(Sp.scripts.spgrep)
process.env._INCLUDE_DEPTH = oldDepth

// data query
const ShExUtil = require('@shexjs/util');
const ShapeMap = require('shape-map');

const SPQuery = require('../shape-path-query');
const N3 = require("n3");


const Base = 'file://' + __dirname;

class QueryValidator {
  constructor(dataFile, shapeMap) {
    this.dataFile = dataFile;
    this.shapeMap = shapeMap;
    this.graph = readTurtle(dataFile);
  }
  query(schema, nodeSet) {
    const db = ShExUtil.rdfjsDB(this.graph)
    const schemaMeta = {
      base: Base,
      prefixes: {}
    };
    const dataMeta = schemaMeta; // cheat 'cause we're not populating them
    const smap = ShapeMap.Parser.construct(Base, schemaMeta, dataMeta)
          .parse(this.shapeMap);

    console.log(JSON.stringify(SPQuery.shapePathQuery(schema, nodeSet, db, smap), null, 2))
  }
}

const cmd = SpGrep.cmd
      .option('-d, --data <dataFile>', 'data file')
      .option('-m, --shape-map <shapeMap>', 'shape map')

if (require.main === module || process.env._INCLUDE_DEPTH === '0') {
  // test() // uncomment to run a basic test
  cmd.action(run).parse()
}
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
