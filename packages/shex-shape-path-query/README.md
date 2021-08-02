# @shexjs/shape-path-query

NPM module to use [ShapePaths](http://github.com/shexSpec/ShapePath) to query data.

## API

``` javascript
const N3 = require("n3");
const Sp = require('shape-path-core')
const yy = { // resolution for PNames in ShapePath
  base: new URL('http://project.example/schema'),
  prefixes: {
    'issue': 'http://project.example/ns#'
  }
}
const pathStr = '@issue:DiscItem ~ issue:href'
const pathExpr = new Sp.ShapePathParser(yy).parse(pathStr)
console.log(`${pathStr} compiles to ${JSON.stringify(pathExpr)}`)
const filePath = Issue.json
const schema = readJson('Issue.json')
const schemaNodes = pathExpr.evalPathExpr([schema], new EvalContext(schema))

const graph = new N3.Store();
const turtleStr = Fs.readFileSync('Issue2.ttl', 'utf8');
const parser = new N3.Parser({ baseIRI: 'http://a.example/' });
graph.addQuads(parser.parse(turtleStr));

const db = ShExUtil.rdfjsDB(graph)
shapePathQuery (schema, nodeSet, db, node, shape)
```
1. schema: a ShExJ ShEx schema; should match `@types/shexj`
2. nodeSet: result of `evalPathExpr`
3. db: ShEx DB, e.g. the `rdfjsDB`
4. node: graph to start validation
5. shape: label of shape expression against which to validate
returns: hmm, not sure. at the simplest, an array of terms matched from the validated graph.

## quickstart

``` shell
./bin/spquery.js '@<http://project.example/schema#DiscItem>~<http://project.example/ns#href>,@<http://project.example/schema#Issue>~<http://project.example/ns#spec>/valueExpr/shapeExprs~<http://project.example/ns#href>' ../../node_modules/shape-path-core/examples/issue/Issue.json -d ./examples/issue/Issue2.ttl -m '<http://instance.example/project1/Issue2>@<http://project.example/schema#Issue>'
```
or `npm run toy` from this directory
