/** Tests for the shexmap-debug REPL: scripted command sessions over
 * injectable I/O (the bin only adds a blocking stdin reader).
 */
"use strict";

const expect = require("chai").expect;
const ShExParser = require("@shexjs/parser");
const {ShExMapDebugRepl} = require("../lib/ShExMapDebugRepl");

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

function session (commands, opts = {}) {
  const output = [];
  const script = commands.slice();
  const repl = new ShExMapDebugRepl(
    opts.schemaText || schemaText,
    ShExParser.construct("http://a.example/", {}, {index: true}).parse(opts.schemaText || schemaText),
    opts.bindings || bindings,
    "tag:root",
    {
      staticVars: opts.staticVars,
      write: s => output.push(s),
      prompt: () => script.length ? script.shift() : null,
    });
  const code = repl.run();
  return {code, transcript: output.join("")};
}

describe("ShExMapDebugRepl", function () {

  it("should step to completion with source excerpts", function () {
    const {code, transcript} = session(["s", "s", "s", "s", "s", "s"]);
    expect(code).to.equal(0);
    expect(transcript).to.include("at :top");
    expect(transcript).to.include(":leaf . %Map:{ :v2 %}"); // the excerpt line
    expect(transcript).to.match(/\^+/);                     // with a caret
    expect(transcript).to.include("accepted: 3 quads");
  });

  it("should honor a line breakpoint set as `b LINE`", function () {
    const leafLine = schemaText.split("\n").findIndex(l => l.includes(":leaf")) + 1;
    const {transcript} = session(["b " + leafLine, "c", "c"]);
    expect(transcript).to.include("breakpoint on");
    expect(transcript).to.include("at :leaf");
    expect(transcript).to.include("accepted: 3 quads");
  });

  it("should honor predicate (pname) and node breakpoints", function () {
    const {transcript} = session(["bp :leaf", "bn _:tm0", "info", "c", "c", "c"]);
    expect(transcript).to.include("breakpoint on predicate :leaf");
    expect(transcript).to.include("breakpoint on node _:tm0");
    expect(transcript).to.include("bp :leaf"); // info listing
    // first stop: the node breakpoint fires when _:tm0 becomes the subject
    expect(transcript).to.match(/at :leaf[\s\S]*subject _:tm0/);
  });

  it("should quit on q", function () {
    const {code, transcript} = session(["s", "q"]);
    expect(code).to.equal(2);
    expect(transcript).not.to.include("accepted");
  });

  it("should run to completion on EOF", function () {
    const {code, transcript} = session([]);
    expect(code).to.equal(0);
    expect(transcript).to.include("accepted: 3 quads");
  });

  it("should report failures and warnings", function () {
    const {code, transcript} = session(["c"], {
      bindings: {"http://a.example/v1": {value: "T"}}, // :v2 unbound -> failure
    });
    expect(code).to.equal(1);
    expect(transcript).to.include("failed:");
  });

  it("should warn about never-bound variables on completion", function () {
    const optional = prefixes + [
      "start = @<S>",
      "<S> { :top . %Map:{ :v1 %} ; :extra . ? %Map:{ :typo %} }",
    ].join("\n");
    const {code, transcript} = session(["c"], {
      schemaText: optional,
      bindings: {"http://a.example/v1": {value: "T"}},
    });
    expect(code).to.equal(0);
    expect(transcript).to.include("warning: :typo is bound nowhere");
  });

  // the splits/ambiguous fixture: a pessimally-ordered OneOf over a
  // three-frame binding tree (see examples/card-schema-phone-mbox.shex)
  const cardSchema = prefixes + [
    "PREFIX card: <http://card.example/ns#>",
    "start = @<Card>",
    "<Card> {",
    "  card:fullName . %Map:{ :name %} ;",
    "  ( card:phone @<Tel> |",
    "    card:mbox @<Email> )+",
    "}",
    "<Tel> { card:use . %Map:{ :use %} ; card:val . %Map:{ :tel %} }",
    "<Email> { card:use . %Map:{ :use %} ; card:val . %Map:{ :email %} }",
  ].join("\n");
  const cardBindings = [
    {"http://a.example/name": {value: "Ann"}},
    [
      {"http://a.example/use": {value: "work"}, "http://a.example/email": {value: "w@x"}},
      {"http://a.example/use": {value: "home"}, "http://a.example/email": {value: "h@x"}},
      {"http://a.example/use": {value: "home"}, "http://a.example/tel": {value: "+1"}},
    ],
  ];

  it("should defer a frame-advancing thread with an advance event", function () {
    // pessimal ordering: <Tel>'s :tel lookup at frame 0 must jump to frame 2
    const {transcript} = session(["s", "s", "s", "s", "s", "t", "q"],
                                 {schemaText: cardSchema, bindings: cardBindings});
    expect(transcript).to.match(/advance to frame 2 for card:val/);
    expect(transcript).to.include("deferred so in-frame alternatives go first");
    expect(transcript).to.match(/T\d+ pending:/); // the sibling mbox disjunct
  });

  it("should choose the most-consuming accept and list the alternatives", function () {
    const {code, transcript} = session(["c", "t", "t 1"],
                                       {schemaText: cardSchema, bindings: cardBindings});
    expect(code).to.equal(0);
    expect(transcript).to.match(/accepted: 10 quads \(chose \d of \d+ viable materializations/);
    expect(transcript).to.match(/consumed 7, skipped 1 {2}<- chosen/);
    expect(transcript).to.match(/consumed 3, skipped 4/); // the cross-frame mix, demoted
    expect(transcript).to.match(/card:fullName "Ann"/);   // t 1 prints a graph
  });

  it("should expose accepts through the done event and the debugger", function () {
    const {transcript} = session([], {schemaText: cardSchema, bindings: cardBindings});
    expect(transcript).to.include("viable materializations");
  });
});
