/** Tests for MaterializerDebugger: step into/over/out semantics over the
 * ThreadedMaterializer's event stream, breakpoints on schema constraints
 * (by object, via editor offsets, and by predicate) and on the lexical
 * representation of synthesized nodes.  See doc/debugger-design.md.
 */
"use strict";

const expect = require("chai").expect;
const ShExParser = require("@shexjs/parser");
const EditorServices = require("@shexjs/editor-services");
const {ThreadedMaterializer, MaterializerDebugger} = require("../lib/ThreadedMaterializer");

const prefixes = "PREFIX : <http://a.example/>\nPREFIX Map: <http://shex.io/extensions/Map/#>\n";
const schemaText = prefixes + [
  "start = @<S>",
  "<S> {",
  "  :top . %Map:{ :v1 %} ;",
  "  :item @<I>",
  "}",
  "<I> { :leaf . %Map:{ :v2 %} }",
].join("\n");
const bindings = {
  "http://a.example/v1": {value: "T"},
  "http://a.example/v2": {value: "L"},
};

function parse (text) {
  return ShExParser.construct("http://a.example/", {}, {index: true}).parse(text);
}

function makeDebugger (text = schemaText, b = bindings) {
  const schema = parse(text);
  return {schema, dbg: new MaterializerDebugger(new ThreadedMaterializer(schema), b, "tag:root")};
}

describe("MaterializerDebugger", function () {

  it("should step through events and finish with the same quads as materialize()", function () {
    const schema = parse(schemaText);
    const expected = new ThreadedMaterializer(schema).materialize(bindings, "tag:root");
    const dbg = new MaterializerDebugger(new ThreadedMaterializer(schema), bindings, "tag:root");
    const trail = [];
    while (!dbg.done) {
      const at = dbg.stepInto();
      if (at.type === "tripleConstraint")
        trail.push(at.tc.predicate.replace("http://a.example/", ":") + "@" + at.thread.depth);
    }
    expect(dbg.error).to.equal(null);
    expect(dbg.quads.length).to.equal(expected.length);
    // :top and :item at depth 0, :leaf inside the <I> call at depth 1
    expect(trail).to.deep.equal([":top@0", ":item@0", ":leaf@1"]);
  });

  it("should step over a subshape call", function () {
    const {dbg} = makeDebugger();
    let at = dbg.stepInto(); // :top @0
    at = dbg.stepInto();     // :item @0
    expect(at.tc.predicate).to.equal("http://a.example/item");
    at = dbg.stepOver();     // skips :leaf @1, lands on the call's return
    expect(at.type).to.equal("return");
    expect(at.thread.depth).to.equal(0);
  });

  it("should step out of a subshape call", function () {
    const {dbg} = makeDebugger();
    dbg.stepInto(); // :top @0
    dbg.stepInto(); // :item @0
    let at = dbg.stepInto(); // :leaf @1 -- inside the call
    expect(at.tc.predicate).to.equal("http://a.example/leaf");
    expect(at.thread.depth).to.equal(1);
    at = dbg.stepOut();
    expect(at.type).to.equal("return");
    expect(at.thread.depth).to.equal(0); // back at the caller's level
  });

  it("should pause on a predicate breakpoint", function () {
    const {dbg} = makeDebugger();
    dbg.addBreakpoint({predicate: "http://a.example/leaf"});
    const at = dbg.continue();
    expect(at.type).to.equal("tripleConstraint");
    expect(at.tc.predicate).to.equal("http://a.example/leaf");
    expect(dbg.continue().type).to.equal("done"); // no more breakpoints
    expect(dbg.quads.length).to.be.above(0);
  });

  it("should pause on a breakpoint set from an editor offset", function () {
    const {schema, dbg} = makeDebugger();
    const located = EditorServices.locateInParsed(schemaText, schema);
    const offset = schemaText.indexOf(":leaf ."); // as a gutter click would supply
    const hit = located.locate.exprAt(offset);
    expect(hit, "exprAt found the constraint").to.exist;
    dbg.addBreakpoint({tc: hit.expr});
    const at = dbg.continue();
    expect(at.type).to.equal("tripleConstraint");
    expect(at.tc).to.equal(hit.expr); // same object end-to-end
  });

  it("should pause on the lexical representation of a synthesized node", function () {
    const {dbg} = makeDebugger();
    dbg.addBreakpoint({subject: "_:tm0"}); // the bnode invented for :item's <I>
    const at = dbg.continue();
    expect(at.type).to.equal("tripleConstraint");
    expect(at.thread.subject).to.equal("_:tm0");
  });

  it("should surface branch death as fail events", function () {
    // :leaf's variable is bound nowhere: the <I> call dies, the whole
    // materialization fails, and the debugger reports the error
    const {dbg} = makeDebugger(schemaText, {"http://a.example/v1": {value: "T"}});
    const seen = [];
    while (!dbg.done)
      seen.push(dbg.stepInto().type);
    expect(seen).to.include("fail");
    expect(dbg.error, "materialization failed").to.exist;
    expect(dbg.error.message).to.include("v2");
    expect(dbg.current.type).to.equal("error");
  });

  it("should expose thread state for inspection", function () {
    const {dbg} = makeDebugger();
    dbg.addBreakpoint({predicate: "http://a.example/leaf"});
    const at = dbg.continue();
    expect(at.thread).to.include.keys("subject", "depth", "frame", "consumed", "emitted");
    expect(at.thread.consumed, "consumed :v1 by now").to.equal(1);
    expect(at.thread.emitted, ":top and the :item link").to.equal(2);
  });
});
