# shex.js
shex.js javascript implementation of Shape Expressions

## install

```
npm install --save shex
```

## test

```
(cd node_modules/shex && npm test) # assumming it was installed in ./node_nodules
```

This runs `mocha -R dot` because there are around one thousand tests.

## validation

You can validate RDF data using the executable `bin/validate` or the `lib/ShExValidation` library described below.

###  validation executable

Validate something in HTTP-land:

```
./node_modules/shex/bin/validate \
    -x http://shex.io/examples/Issue.shex \
    -d http://shex.io/examples/Issue1.ttl \
    -s http://shex.io/examples/IssueShape \
    -n http://shex.io/examples/Issue1
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

####  relative resolution

`validate`'s -n and -s arguemtns are evaluated as IRIs relative to the (first) data and schema sources respectively.
The above invocation validates the node `<Issue1>` in `http://shex.io/examples/Issue1.ttl`.
This and the shape can be written as relative IRIs:

```
./node_modules/shex/bin/validate \
    -x http://shex.io/examples/Issue.shex \
    -d http://shex.io/examples/Issue1.ttl \
    -s IssueShape \
    -n Issue1
```


### validation library

Parsing from the old interwebs involves a painful mix of asynchronous callbacks for getting the schema and the data and parsing the data (shorter path below):

```
var shexc = "http://shex.io/examples/Issue.shex";
var shape = "http://shex.io/examples/IssueShape";
var data = "http://shex.io/examples/Issue1.ttl";
var node = "http://shex.io/examples/Issue1";

var http = require("http");
var shex = require("shex");
var n3 = require('n3');

// generic async GET function.
function GET (url, then) {
  http.request(url, function (resp) {
    var body = "";
    resp.on('data', function (chunk) { body += chunk; });
    resp.on("end", function () { then(body); });
  }).end();
}

var Schema = null; // will be loaded and compiled asynchronously
var Triples = null; // will be loaded and parsed asynchronously
function validateWhenEverythingsLoaded () {
  if (Schema !== null && Triples !== null) {
    console.log(shex.Validator(Schema).validate(Triples, node, shape));
  }
}

// loaded the schema
GET(shexc, function (b) {
  // callback parses the schema and tries to validate.
  Schema = shex.Parser(shexc).parse(b)
  validateWhenEverythingsLoaded();
});

// load the data
GET(data, function (b) {
  // callback parses the triples and tries to validate.
  var db = n3.Store();
  n3.Parser({documentIRI: data}).parse(b, function (error, triple, prefixes) {
    if (error) {
      throw Error("error parsing " + data + ": " + error);
    } else if (triple) {
      db.addTriple(triple)
    } else {
      Triples = db;
      validateWhenEverythingsLoaded();
    }
  });
});
```

See? That's all there was too it!

OK, that's miserable. Let's use the ShExLoader to wrap all that callback misery:

```
var shexc = "http://shex.io/examples/Issue.shex";
var shape = "http://shex.io/examples/IssueShape";
var data = "http://shex.io/examples/Issue1.ttl";
var node = "http://shex.io/examples/Issue1";

var shex = require("shex");
shex.Loader([shexc], [], [data]).then(function (loaded) {
    console.log(shex.Validator(loaded.schema).validate(loaded.data, node, shape));
});
```

Note that the shex loader takes an array of ShExC schemas, either file paths or URLs, and an array of JSON schemas (empty in this invocation) and an array of Turtle files.

## conversion

As with validation (above), you can convert by either executable or library.

###  conversion executable

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

### conversion by library

As with validation, the ShExLoader wrapes callbacks and simplifies parsing the libraries:

```
var shexc = "http://shex.io/examples/Issue.shex";

var shex = require("shex");
shex.Loader([shexc], [], []).then(function (loaded) {
    console.log(JSON.stringify(loaded.schema, null, "  "));
});
```

There's no actual conversion; the JSON representation is just the stringification of the parsed schema.


## local files

Command line arguments which don't start with http:// or https:// are assumed to be file paths.
We can create a local JSON version of the Issues schema:
```
./node_modules/shex/bin/shex-to-json http://shex.io/examples/Issue.shex > Issue.json
```
and use it to validate the Issue1.ttl as we did above:
```
./node_modules/shex/bin/validate \
    -j Issue.json \
    -d http://shex.io/examples/Issue1.ttl \
    -s http://shex.io/examples/IssueShape \
    -n http://shex.io/examples/Issue1
```

Of course the data file can be local as well.

Happy validating!
