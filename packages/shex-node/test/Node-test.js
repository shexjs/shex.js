"use strict"
const VERBOSE = "VERBOSE" in process.env
const TESTS = "TESTS" in process.env ? process.env.TESTS.split(/,/) : null
const expect = require("chai").expect
const Path = require('path')
const TestDir = Path.join(__dirname, "../../shex-cli/test");

// Initialize @shexjs/loader with implementations of APIs.
const ShExLoader = require("..")({
  rdfjs: require('n3'),         // use N3 as an RdfJs implementation
  fetch: require('node-fetch'), // fetch implementation
  jsonld: require('jsonld')     // JSON-LD (if you need it)
})

// Schemas from URL and filepath:
const schemaFromFile =
      Path.join(TestDir, "cli/1dotOr2dot.shex")
const schemaFromUrl =
      "https://shex.io/webapps/packages/shex-cli/test/cli/1dotOr2dot.shex"

// Data graphs from URL, text and graph API:
const graphFromUrl =
      "https://shex.io/webapps/packages/shex-cli/test/cli/p1.ttl"
const graphFromFile =
      Path.join(TestDir, "cli/p2p3.ttl")

describe("@shexjs/node", function () {

  // could break this up into multiple tests
  it("should load schema and data from URLs and files" , async function () {

    // ShExLoader.load returns a promise to load and merge schema and data.
    const {schema, schemaMeta, data, dataMeta} = await ShExLoader.load(
      { shexc: [ schemaFromFile, schemaFromUrl ] },
      { turtle: [ graphFromUrl, graphFromFile ] },
      { // schemaOptions
        collisionPolicy: 'right' // keep the later S1 shape declaration (from file)
      }
    )
    // test returned structure.
    expect(schemaMeta).to.deep.equal([
      { "mediaType": "text/shex", "url": "file://" + Path.join(TestDir, "cli/1dotOr2dot.shex"),
        "base": "file://" + Path.join(TestDir, "cli/1dotOr2dot.shex"), "prefixes": {} },
      { "mediaType": "text/shex", "url": "https://shex.io/webapps/packages/shex-cli/test/cli/1dotOr2dot.shex",
        "base": "https://shex.io/webapps/packages/shex-cli/test/cli/1dotOr2dot.shex", "prefixes": {} }
    ])
    const loadedShapes = schema.shapes.map(s => [s.id, s.shapeExpr.type])
    expect(loadedShapes).to.deep.equal([
      ["http://a.example/S1", "Shape"],
    ])
    expect(dataMeta).to.deep.equal([
      { "mediaType": "text/turtle", "url": "https://shex.io/webapps/packages/shex-cli/test/cli/p1.ttl",
        "base": "https://shex.io/webapps/packages/shex-cli/test/cli/p1.ttl", "prefixes": {
          "": "http://a.example/"
        } },
      { "mediaType": "text/turtle", "url": "file://" + Path.join(TestDir, "cli/p2p3.ttl"),
        "base": "file://" + Path.join(TestDir, "cli/p2p3.ttl"), "prefixes": {
          "": "http://a.example/",
          "xsd": "http://www.w3.org/2001/XMLSchema#" } }
    ])
    const quads = data.getQuads().sort((l, r) => l.subject.value.localeCompare(r.subject.value))
    const quadStrs = quads.map(q => (['subject', 'predicate', 'object']).map(t => q[t].value))
    expect(quadStrs).to.deep.equal([
      ["file://" + Path.join(TestDir, "cli/x"), "http://a.example/p2", "p2-0"],
      ["file://" + Path.join(TestDir, "cli/x"), "http://a.example/p3", "p3-0"],
      ["https://shex.io/webapps/packages/shex-cli/test/cli/x", "http://a.example/p1", "p1-0"]
    ])
  })
})
