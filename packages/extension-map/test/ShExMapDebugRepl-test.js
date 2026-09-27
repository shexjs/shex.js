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
    // the bnode minted for :item's <I> is the same every run: read it off one
    const {ThreadedMaterializer} = require("../lib/ThreadedMaterializer");
    const m = new ThreadedMaterializer(ShExParser.construct("http://a.example/", {}, {index: true}).parse(schemaText));
    m.materialize(bindings, "tag:root");
    const minted = "_:" + m.provenance.find(p => p.src.structural).quad.object.value;
    const {transcript} = session(["bp :leaf", "bn " + minted, "info", "c", "c", "c"]);
    expect(transcript).to.include("breakpoint on predicate :leaf");
    expect(transcript).to.include("breakpoint on node " + minted);
    expect(transcript).to.include("bp :leaf"); // info listing
    // first stop: the node breakpoint fires when the minted node becomes the subject
    expect(transcript).to.match(new RegExp("at :leaf[\\s\\S]*subject " + minted.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
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

  it("should enter each contact in turn, showing the branch it is on", function () {
    // the repetition over the contacts takes them one at a time: the phone
    // disjunct dies on a contact with no :tel, the mbox one takes it
    const {transcript} = session(["s", "s", "s", "s", "s", "t", "q"],
                                 {schemaText: cardSchema, bindings: cardBindings});
    expect(transcript).to.match(/entering scope 0\.0 for card:phone/);
    expect(transcript).to.match(/T\d+ pending:/); // the shape being built
  });

  it("should accept the one materialization and list it", function () {
    const {code, transcript} = session(["c", "t", "t 1"],
                                       {schemaText: cardSchema, bindings: cardBindings});
    expect(code).to.equal(0);
    expect(transcript).to.match(/accepted: 10 quads\n/);      // one way to build it: no alternatives
    expect(transcript).to.match(/consumed 7 {2}<- chosen/);
    expect(transcript).to.match(/card:fullName "Ann"/);   // t 1 prints a graph
  });

  it("should expose alternative accepts through the done event and the debugger", function () {
    // a flat record where both disjuncts fit: two viable materializations
    const flat = prefixes + [
      "start = @<Card>",
      "<Card> { :name . %Map:{ :name %} ; ( :phone . %Map:{ :tel %} | :mbox . %Map:{ :email %} ) }",
    ].join("\n");
    const both = {"http://a.example/name": {value: "Bob"}, "http://a.example/tel": {value: "+1"},
                  "http://a.example/email": {value: "b@x"}};
    const {transcript} = session([], {schemaText: flat, bindings: both});
    expect(transcript).to.include("viable materializations");
  });
});
