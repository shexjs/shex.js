[![NPM Version](https://badge.fury.io/js/shex.png)](https://npmjs.org/package/shex)
[![Build Status](https://travis-ci.org/shexSpec/shex.js.svg?branch=master)](https://travis-ci.org/shexSpec/shex.js)
[![Coverage Status](https://coveralls.io/repos/github/shexSpec/shex.js/badge.svg?branch=jest)](https://coveralls.io/github/shexSpec/shex.js?branch=hest)
[![ShapeExpressions Gitter chat https://gitter.im/shapeExpressions/Lobby](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/shapeExpressions/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.1213693.svg)](https://doi.org/10.5281/zenodo.1213693)

# shex.js
shex.js javascript implementation of Shape Expressions ([try online](https://rawgit.com/shexSpec/shex.js/master/doc/shex-simple.html))


## install

```
npm install --save shex
```

## test

First you need to install the testing framework (mocha, chai, shex-test for the actual tests):
`npm explore shex 'npm install'`

Now you can run the tests:
`npm explore shex 'npm test'`

(BTW, `npm explore shex` executes a command in the shex directory so you can also `cd node_modules/shex && npm install && npm test`)

This runs `mocha -R dot` (the *dot* reporter because there are around three thousand tests).

There are slower tests (command line interface, HTTP, etc) which you can run with the `SLOW=<timeout in milliseconds>` environment variable set. For the HTTP tests you will have to specifiy a git repository in `$BRANCH`, e.g.
`SLOW=10000 BRANCH=master npm explore shex 'npm test'`


## validation

You can validate RDF data using the `bin/validate` executable or the `lib/ShExValidation` library described below.

###  validation executable

Validate something in HTTP-land:

```sh
./node_modules/shex/bin/validate \
    -x http://shex.io/examples/Issue.shex \
    -d http://shex.io/examples/Issue1.ttl \
    -s http://shex.io/examples/IssueShape \
    -n http://shex.io/examples/Issue1
```

That validates node `http://shex.io/examples/Issue` in `http://shex.io/examples/Issue1.ttl` against shape `http://shex.io/examples/IssueShape` in `http://shex.io/examples/Issue.shex`.
The result is a JSON structure which tells you exactly how the data matched the schema.

```json
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

```sh
./node_modules/shex/bin/validate \
    -x http://shex.io/examples/Issue.shex \
    -d http://shex.io/examples/Issue1.ttl \
    -s IssueShape \
    -n Issue1
```


### validation library

Parsing from the old interwebs involves a painful mix of asynchronous callbacks for getting the schema and the data and parsing the data (shorter path below):
<a id="long-script"/>
```js
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
    console.log(shex.Validator.construct(Schema).validate(Triples, node, shape));
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
  n3.Parser({baseIRI: data, format: "text/turtle"}).parse(b, function (error, triple, prefixes) {
    if (error) {
      throw Error("error parsing " + data + ": " + error);
    } else if (triple) {
      db.addQuad(triple)
    } else {
      Triples = db;
      validateWhenEverythingsLoaded();
    }
  });
});
```

See? That's all there was too it!

OK, that's miserable. Let's use the ShExLoader to wrap all that callback misery:
<a name="loader-script"/>
```js
var shexc = "http://shex.io/examples/Issue.shex";
var data = "http://shex.io/examples/Issue1.ttl";
var node = "http://shex.io/examples/Issue1";

var shex = require("shex");
shex.Loader.load([shexc], [], [data], []).then(function (loaded) {
    var db = shex.Util.makeN3DB(loaded.data);
    var validator = shex.Validator.construct(loaded.schema, { results: "api" });
    var result = validator.validate(db, [{node: node, shape: shex.Validator.start}]);
    console.log(result);
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
```json
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
```sh
./node_modules/shex/bin/shex-to-json http://shex.io/examples/Issue.shex
```
and, less elegantly, back with json-to-shex.

### conversion by library

As with validation, the ShExLoader wrapes callbacks and simplifies parsing the libraries:

```js
var shexc = "http://shex.io/examples/Issue.shex";

var shex = require("shex");
shex.Loader.load([shexc], [], [], []).then(function (loaded) {
    console.log(JSON.stringify(loaded.schema, null, "  "));
});
```

There's no actual conversion; the JSON representation is just the stringification of the parsed schema.


## local files

Command line arguments which don't start with http:// or https:// are assumed to be file paths.
We can create a local JSON version of the Issues schema:
```sh
./node_modules/shex/bin/shex-to-json http://shex.io/examples/Issue.shex > Issue.json
```
and use it to validate the Issue1.ttl as we did above:
```sh
./node_modules/shex/bin/validate \
    -j Issue.json \
    -d http://shex.io/examples/Issue1.ttl \
    -s http://shex.io/examples/IssueShape \
    -n http://shex.io/examples/Issue1
```

Of course the data file can be local as well.

Happy validating!

## materialize

Materialize is used to transform from a source schema to a target schema after validation is done.

The syntax is:
```sh
materialize `-t <target schema>`|-h [-j `<JSON Vars File>`] [-r `<RDF root IRI>`]
```
Materialize reads the output from the validate tool from STDIN and maps it to the specified target schema.

If supplied, a JSON vars file will be referenced to fill in constant values not specified from the source.
This is useful in assigning default fields to the target when there is no equivalent value in the source schema
and source data.

Here is an example of a simple JSON vars file:
```json
{
  "urn:local:Demographics:constSys": "System",
}
```
If this vars file content is used, then any time a variable in the target file with
value "urn:local:Demographics:constSys" is seen, the value "System will be substituted.

The RDF root IRI specifies the root node from which all nodes in the schema will descend.
The default root if none is specified is: ` tag:eric@w3.org/2016/root `

Here are some examples:
```sh
materialize -h
```
```sh
validate -x source_schema.shex -l data.jsonld -s ProblemShape | materialize -t target_schema.shex -j vars.json
```
```sh
cat problem.val | materialize -t target_schema.shex -j vars.json -r http://hl7.org/fhir/shape/problem
```
# ShEx2 features

# ShEx IMPORT Demo (with relative IRIs):

1. open a browser window (we'll call **validator**) with https://rawgit.com/shexSpec/shex.js/master/doc/shex-simple.html
2. open another browser window (we'll call **viewer**) with https://shex.io/shexTest/master/viewer?validation
3. wait 'till *viewer* loads and look for "3circRefS1-IS2-IS3-IS3" (near the bottom)
4. drag the "#3circRefS1-IS2-IS3-IS3" cell (or the ✓ to the left of it) to the right of the QueryMap area of *validator*
5. click on the long label under "Manifest:", then the long label under "Passing:" and validate.

It should validate, which involves the IMPORT of `3circRefS2-IS3` and `3circRefS3`.
`3circRefS2-IS3` also IMPORTs `3circRefS3` which shows that IMPORT is idempotent (has a side effect only the first time).
