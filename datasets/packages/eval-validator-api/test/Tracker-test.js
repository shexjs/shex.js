/** The validator's tracker as a stream of typed shape-level events
 * (plan.md E8): enter and exit with their depth, a recursion cut off, an
 * answer from the cache. */
"use strict";

const expect = require("chai").expect;
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ShExValidator} = require("@shexjs/validator");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {eventTracker} = require("..");

const base = "http://a.example/";

function setUp (schemaText, dataText) {
  const schema = ShExParser.construct(base, {}, {index: true}).parse(schemaText);
  const store = new N3.Store();
  store.addQuads(new N3.Parser({baseIRI: base}).parse(dataText));
  return {schema, store};
}

/** an event as a line: type node@shape [depth] */
const said = e => e.type + (e.node ? " " + (e.node.termType === "BlankNode" ? "_:" + e.node.value : e.node.value.replace(base, ":")) : "")
      + (e.shape ? "@" + e.shape.replace(base, ":") : "") + " [" + e.depth + "]";

describe("eventTracker", function () {

  it("should report enter and exit, nested by depth, and a recursion one deeper", function () {
    const {schema, store} = setUp(
      `PREFIX : <${base}>\n:S { :p @:S ? }\n`,
      `PREFIX : <${base}>\n:x :p :y .\n:y :p :x .\n`);
    const events = [];
    const tracker = eventTracker(e => events.push(e));
    const validator = new ShExValidator(schema, RdfJsDb(store), {noCache: true});
    const results = validator.validateShapeMap([{node: base + "x", shape: base + "S"}], tracker);
    expect(results[0].status).to.equal("conformant");
    expect(events.map(said)).to.deep.equal([
      "enter :x@:S [1]",
      "enter :y@:S [2]",
      "recurse :x@:S [3]",
      "exit :y@:S [2]",
      "exit :x@:S [1]",
    ]);
    expect(tracker.depth, "back where it started").to.equal(0);
    const exit = events.find(e => e.type === "exit");
    expect(exit.result.type, "the exit carries the shape's result").to.equal("ShapeTest");
    expect(events[2].node.termType, "the recursion's node is an RDF/JS term").to.equal("NamedNode");
  });

  it("should report an answer the validator already had", function () {
    const {schema, store} = setUp(
      `PREFIX : <${base}>\n:S { :p . }\n`,
      `PREFIX : <${base}>\n:x :p 1 .\n`);
    const events = [];
    const validator = new ShExValidator(schema, RdfJsDb(store), {});   // caching on
    validator.validateShapeMap([{node: base + "x", shape: base + "S"}, {node: base + "x", shape: base + "S"}],
                               eventTracker(e => events.push(e)));
    expect(events.map(e => e.type)).to.deep.equal(["enter", "exit", "known"]);
    expect(events[2].depth).to.equal(1);
    expect(events[2].result.type).to.equal("ShapeTest");
  });
});
