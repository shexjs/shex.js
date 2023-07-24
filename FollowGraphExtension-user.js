const N3 = require('n3');
const ShExTerm = require("@shexjs/term");
const ShExParser = require("@shexjs/parser");
const ShapeMap = require("shape-map");
const {ShExValidator} = require('@shexjs/validator');
const { ctor: RdfJsDb } = require('@shexjs/neighborhood-rdfjs')
const TestExtension = require("@shexjs/extension-test")
const FollowGraphExtension = require("./FollowGraphExtension")
// const TestUtils = require("@shexjs/util/tools/common-test-infrastructure.js");

const Afters = [];
globalThis.after = (cb) => { Afters.push(cb); }

// const HTTPTEST = "HTTPTEST" in process.env ?
//       process.env.HTTPTEST :
//       TestUtils.startLocalServer(
//         "localhost", // some loopback address or local IP address
//         "/", // some test dir
//         __dirname, // server root
//       );
const HTTPTEST = 'http://localhost/';

ShapeMap.Start = ShExValidator.Start;

  const prefixStr = `
PREFIX : <http://hl7.org/fhir/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
`;
  const obsStr = `
<Obs1>
  :status    "final";
  :subject   <Patient2> .
`;
  const patStr = `
<Patient2>
  :name "Bob" ;
  :birthdate "1999-12-31"^^xsd:date .
`
  const obs = `${prefixStr}${obsStr}`;
  const pat = `${prefixStr}${patStr}`;
  const trig = `${prefixStr}${obsStr}

<Patient2> {${patStr}
}
`;

  const shexc = `
PREFIX : <http://hl7.org/fhir/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX log: <http://shex.io/extensions/Test/>
PREFIX AS: <http://shex.io/extensions/FollowGraph/>

# %log:{ print("start") %}

start = @<ObservationShape>

<ObservationShape> {
  :status ["preliminary" "final"];
  :subject IRI
      %log:{ print('validating <', o, ">@<PatientShape>") %}
      %AS:{ @<PatientShape> %}
}

<PatientShape> CLOSED {
 :name xsd:string+;
 :birthdate xsd:date?
}
`

  const smap = `<Obs1>@START`;

main().then(() => {
  for (const cb of Afters) { cb(); }
});

function main ()
{
  return runValidator (trig, shexc, smap);
}

function myFetch (urlStr, opts = {}) {
  const url = new URL(urlStr);
  let resp = {
    status: 404,
    text: `File not found: ${JSON.stringify(url)}`
  }
  switch (url.pathname) {
  case '/Patient2':
    resp.status = 200;
    resp.text = pat;
  }
  return Promise.resolve({
    async text () { return Promise.resolve(resp.text); }
  });
}

async function runValidator(trig, shexc, queryMap) {
  const schemaMeta = {base: HTTPTEST, prefixes: {}};
  const dataMeta = {base: HTTPTEST, prefixes: {}};
  const base_shapeMap = HTTPTEST;

  const parser = new N3.Parser({format: "application/trig", baseIRI: dataMeta.base});
  const ds = parser.parse(trig);

  // const writer = new N3.Writer();
  // writer.addQuads(ds);
  // writer.end((error, result) => {
  //   console.log(result);
  // });

  const store = new N3.Store();
  store.addQuads(ds);
  const schemaParser = ShExParser.construct(schemaMeta.base, null, {index: true});
  const schema = schemaParser.parse(shexc);

  validator = new ShExValidator(schema, RdfJsDb(store), {});
  const testResults = TestExtension.register(validator, {ShExTerm});
  const follower = new FollowGraphExtension(() => validator, myFetch);
  const followResults = follower.register(validator, {ShExTerm}, schemaMeta);

  const smParser = ShapeMap.Parser.construct(base_shapeMap, schemaMeta, dataMeta);
  const map = smParser.parse(queryMap);

  const validationResult = await validator.validateShapeMap(map);
  console.log(validationResult, testResults, followResults);
}

