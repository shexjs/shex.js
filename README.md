# shex.js
shex.js javascript implementation of Shape Expressions

## install

```
npm install --save shex
```

## test

```
cd node_modules/shex
npm test
```

This runs `mocha -R dot` because there are around one thousand tests.

## play

Validate something in HTTP-land:

```
./node_modules/shex/bin/validate -x http://shex.io/examples/Issue.shex -d http://shex.io/examples/Issue1.ttl -s http://shex.io/examples/IssueShape -n http://shex.io/examples/Issue1
```

That validates node `http://shex.io/examples/Issue` in `http://shex.io/examples/Issue1.ttl` against shape `http://shex.io/examples/IssueShape` in `http://shex.io/examples/Issue.shex`.
The result is a JSON structure which tells you exactly how the data matched the schema.

```
{
  "type": "test",
  "node": "http://shex.io/examples/Issue1",
  "shape": "http://shex.io/examples/IssueShape",
  "solution": {
...
  }
}
```

Had we gotten a `null`, we'd know that the document was invalid with respect to the schema.
See the [ShExJ primer](http://shex.io/primer/) for a description of ShEx validation and the [ShExJ specification](http://shex.io/primer/ShExJ) for more details about the results format.

## conversion

ShEx can be represented in the compact syntax
```
PREFIX ex: <http://ex.example/#>
<IssueShape> {                       # An <IssueShape> has:
    ex:state (ex:unassigned            # state which is
              ex:assigned),            #   unassigned or assigned.
    ex:reportedBy @<UserShape>        # reported by a <UserShape>.
}
```
or in JSON:
```
{ "type": "schema", "start": "http://shex.io/examples/IssueShape",
  "shapes": {
    "http://shex.io/examples/IssueShape": { "type": "shape",
      "expression": { "type": "eachOf",
        "expressions": [
          { "type": "tripleConstraint", "predicate": "http://ex.example/#state",
            "valueExpr": { "type": "valueClass", "values": [
                "http://ex.example/#unassigned", "http://ex.example/#assigned"
          ] } },
          { "type": "tripleConstraint", "predicate": "http://ex.example/#reportedBy",
            "valueExpr": { "type": "valueClass", "reference": "http://shex.io/examples/UserShape" }
          }
] } } } }
```

You can convert between them with shex-to-json:
```
./node_modules/shex/bin/shex-to-json http://shex.io/examples/Issue.shex
```
and, less elegantly, back with json-to-shex.

## local files

Command line arguments which don't start with http:// or https:// are assumed to be file paths.
We can create a local JSON version of the Issues schema:
```
./node_modules/shex/bin/shex-to-json http://shex.io/examples/Issue.shex > Issue.json
```
and use it to validate the Issue1.ttl as we did above:
```
./node_modules/shex/bin/validate -j Issue.json -d http://shex.io/examples/Issue1.ttl -s http://shex.io/examples/IssueShape -n http://shex.io/examples/Issue1
```

Of course the data file can be local as well.

Happy validating!
