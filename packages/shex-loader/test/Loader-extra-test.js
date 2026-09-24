/** The loader's failure paths and its ShExR input: a schema written as Turtle,
 * JSON, Turtle and JSON-LD that won't parse, schemas that won't merge, and a
 * host that doesn't resolve. */
"use strict";

const expect = require("chai").expect;
const Fs = require("fs");
const Path = require("path");
const Os = require("os");
const N3 = require("n3");
const ShExNode = require("@shexjs/node")({rdfjs: N3});
const findPath = require("../../shex-cli/test/findPath.js");

const schemasPath = findPath("schemas");
const base = "http://a.example/";
const tmp = Fs.mkdtempSync(Path.join(Os.tmpdir(), "loader-extra-"));
const inTmp = (name, text) => { const at = Path.join(tmp, name); Fs.writeFileSync(at, text); return at; };
const failureOf = p => p.then(() => { throw Error("expected a failure"); }, e => e);

describe("ShExLoader (extra)", function () {
  this.timeout(20000);

  it("reads a schema written as ShExR", async function () {
    // the caller supplies what reading ShExR takes: a validator, the ShExR schema, and a db over the graph
    const ShExParser = require("@shexjs/parser");
    const ShExUtil = require("@shexjs/util");
    const {ShExValidator} = require("@shexjs/validator");
    const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
    const graphParser = {validator: ShExValidator, rdfjsdb: RdfJsDb,
                         schema: ShExParser.construct("http://www.w3.org/ns/shex", {}, {index: true}).parse(ShExUtil.ShExRSchema)};
    const loaded = await ShExNode.load({shexc: [], json: [], turtle: [schemasPath + "1dot.ttl"]}, null, {graphParser}, {});
    expect(loaded.schema.shapes.map(s => s.id)).to.deep.equal([base + "S1"]);
    expect(loaded.schemaMeta[0].mediaType).to.equal("text/turtle");
  });

  it("says which file's JSON, Turtle or JSON-LD would not parse", async function () {
    const badJson = inTmp("bad.json", "{ not json");
    expect(String(await failureOf(ShExNode.load({shexc: [], json: [badJson]}, null, {}, {})))).to.match(/error parsing JSON .*bad\.json/);
    const badTurtle = inTmp("bad.ttl", "<x> :p .");
    expect(String(await failureOf(ShExNode.load(null, {turtle: [badTurtle]}, {}, {})))).to.match(/error parsing .*bad\.ttl/);
    const badJsonLd = inTmp("bad.jsonld", "{\"@context\": 42}");
    expect(String(await failureOf(ShExNode.load(null, {jsonld: [badJsonLd]}, {}, {})))).to.match(/bad\.jsonld/);
  });

  it("says which schema would not merge", async function () {
    const a = inTmp("a.shex", `PREFIX : <${base}>\n<S> { :p . }\n`);
    const b = inTmp("b.shex", `PREFIX : <${base}>\n<S> { :q . }\n`);
    const e = await failureOf(ShExNode.load({shexc: [a, b]}, null, {}, {}));
    expect(String(e), "the default policy names the redefined declaration").to.match(/shapeDecl [\s\S]*"id": "file:\/\/[^"]*\/S"/);
  });

  it("reports a host that doesn't resolve", async function () {
    const e = await failureOf(ShExNode.load({shexc: ["http://no-such-host.invalid/s.shex"]}, null, {}, {}));
    expect(e.message).to.match(/no-such-host\.invalid/);
  });
});
