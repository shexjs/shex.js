/** What an action sees, and what it may say.
 *
 * The two examples show the thing working; this is the contract underneath
 * it -- which names are in scope, what happens when an arc isn't there, and
 * what a cycle or a conjunction reduces to.
 */
"use strict";

const {expect} = require("chai");
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("@shexjs/validator");
const Reduce = require("..");
const evaluate = require("@shexjs/extension-reduce-js");

const B = "http://a.example/";
const PREFIXES = {"": B, xsd: "http://www.w3.org/2001/XMLSchema#"};
const EXT = Reduce.url;

/** parse ShExC and hang `actions` (label -> code) on the shapes it names */
function compile (shexc, actions) {
  const schema = ShExParser.construct(B, null, {index: true})
        .parse("PREFIX : <http://a.example/>\nPREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n"
               + shexc, B, undefined, "reduce-test");
  Object.keys(actions).forEach(label => {
    const at = schema._index.shapeExprs[B + label] || schema._index.tripleExprs[B + label];
    if (at === undefined) throw Error("no <" + B + label + "> in the test schema");
    let elt = at.type === "ShapeDecl" ? at.shapeExpr : at;
    // ShExJ has no semActs on a ShapeAnd/ShapeOr, so an action written for
    // `IRI AND { ... }` goes on the conjunct that has a body
    if (elt.type === "ShapeAnd" || elt.type === "ShapeOr")
      elt = elt.shapeExprs.find(e => e.type === "Shape") || elt.shapeExprs[0];
    elt.semActs = (elt.semActs || []).concat(
      [{type: "SemAct", name: EXT, code: actions[label]}]);
  });
  return schema;
}

/** ...and the graph to read against it */
function load (turtle) {
  const graph = new N3.Store();
  graph.addQuads(new N3.Parser({baseIRI: B, format: "text/turtle"})
                 .parse("PREFIX : <http://a.example/>\n" + turtle));
  return RdfJsDb(graph);
}

/** compile, validate, reduce: the actions run over what the match found */
function run (shexc, turtle, actions, node = B + "x", shape = B + "S", options = {}) {
  const schema = compile(shexc, actions);
  const validator = new ShExValidator(schema, load(turtle), {});
  Reduce.register(validator);
  const res = validator.validateShapeMap([{node, shape}]);
  expect(res[0].status, JSON.stringify(res[0].appinfo)).to.equal("conformant");
  const opts = Object.assign({evaluate, prefixes: PREFIXES}, options);
  // `schema: true` asks for the arity rule: the schema is what says whether
  // an arc reference is a value or a list of them
  if (opts.schema === true)
    opts.schema = schema;
  return Reduce.reduce(res, opts)[0];
}

const ONE_ARC = "<http://a.example/S> { :p1 . }";
const ONE_TRIPLE = ":x :p1 :o1 .";

describe("reduce", function () {

  describe("writing an action", function () {

    it("should take an expression", function () {
      expect(run(ONE_ARC, ONE_TRIPLE, {S: "{got: one(':p1')}"}))
        .to.deep.equal({got: B + "o1"});
    });

    it("should take a function body", function () {
      expect(run(ONE_ARC, ONE_TRIPLE, {S: "const v = one(':p1'); return {got: v};"}))
        .to.deep.equal({got: B + "o1"});
    });

    /* An object literal at the head of a statement is a block in JavaScript,
     * so the expression reading has to be tried first for `{a: 1}` to mean
     * what everybody writing an action means by it. */
    it("should read a leading brace as an object, not a block", function () {
      expect(run(ONE_ARC, ONE_TRIPLE, {S: "{}"})).to.deep.equal({});
    });

    it("should say where an action went wrong", function () {
      expect(() => run(ONE_ARC, ONE_TRIPLE, {S: "nope()"}))
        .to.throw(/reducing <http:\/\/a.example\/S> at <http:\/\/a.example\/x>/);
      expect(() => run(ONE_ARC, ONE_TRIPLE, {S: "nope()"}), "and what went wrong")
        .to.throw(/nope/);
    });

    it("should put the caller's api in scope", function () {
      expect(run(ONE_ARC, ONE_TRIPLE, {S: "helper(one(':p1'))"}, undefined, undefined,
                 {api: {helper: v => "saw " + v}}))
        .to.equal("saw " + B + "o1");
    });
  });

  describe("reaching the arcs", function () {
    const TWO = "<http://a.example/S> { :p1 . ; :p2 . * }";
    const DATA = ":x :p1 :o1 ; :p2 :o2 , :o3 .";

    it("should give one value for one(), all of them for all()", function () {
      expect(run(TWO, DATA, {S: "({one: one(':p1'), all: all(':p2').sort()})"}))
        .to.deep.equal({one: B + "o1", all: [B + "o2", B + "o3"]});
    });

    it("should complain when one() isn't one", function () {
      expect(() => run(TWO, DATA, {S: "one(':p2')"}))
        .to.throw(/one\(":p2"\) found 2 values/);
    });

    it("should let opt() be absent but not plural", function () {
      expect(run(TWO, ":x :p1 :o1 .", {S: "({p2: opt(':p2')})"})).to.deep.equal({p2: undefined});
      expect(() => run(TWO, DATA, {S: "opt(':p2')"})).to.throw(/opt\(":p2"\) found 2 values/);
    });

    it("should answer has() either way", function () {
      expect(run(TWO, ":x :p1 :o1 .", {S: "[has(':p1'), has(':p2')]"}))
        .to.deep.equal([true, false]);
    });

    it("should name the arcs it did see when one() finds none", function () {
      expect(() => run(TWO, DATA, {S: "one(':nope')"}))
        .to.throw(/one\(":nope"\) found 0 values/);
      expect(() => run(TWO, DATA, {S: "one(':nope')"}), "and what it did match")
        .to.throw(/p1/);
    });
  });

  /* yacc writes `$$ = $1 + $3`; PEG names the sub-production instead.  Both
   * spellings are here, and both are extension-reduce's doing rather than
   * the evaluator's: the code is rewritten to ordinary names before anyone
   * runs it, which is what lets an implementation in another language have
   * the same syntax. */
  describe("$, a production's sub-productions by name", function () {
    const TWO = "<http://a.example/S> { :p1 . ; :p2 . ? }";

    it("should name an arc with a prefixed name", function () {
      expect(run(TWO, ONE_TRIPLE, {S: "$:p1"})).to.deep.equal([B + "o1"]);
    });

    it("should name an arc with an IRI", function () {
      expect(run(TWO, ONE_TRIPLE, {S: "$<http://a.example/p1>"})).to.deep.equal([B + "o1"]);
    });

    /* An arc that didn't match is absent rather than empty, so `|| []` is
     * how an action says "however many of these there were". */
    it("should be undefined for an arc that isn't there", function () {
      expect(run(TWO, ONE_TRIPLE, {S: "[$:p1, $:p2, ...($:p2 || [])]"}))
        .to.deep.equal([[B + "o1"], undefined]);
    });

    it("should say which prefixes it knows when one is missing", function () {
      expect(() => run(TWO, ONE_TRIPLE, {S: "$nope:p1"})).to.throw(/no prefix "nope:"/);
      expect(() => run(TWO, ONE_TRIPLE, {S: "$nope:p1"}), "and which it does know")
        .to.throw(/xsd:/);
    });

    it("should hand $ the production's value", function () {
      expect(run(TWO, ONE_TRIPLE, {S: "$ = {got: one(':p1')}"})).to.deep.equal({got: B + "o1"});
    });

    it("should take yacc's $$ for the same thing", function () {
      expect(run(TWO, ONE_TRIPLE, {S: "$$ = {got: one(':p1')}; $$.also = 1;"}))
        .to.deep.equal({got: B + "o1", also: 1});
    });

    it("should give a triple constraint's action its object as $1", function () {
      const schema = "<http://a.example/S> { $<http://a.example/S-p1> :p1 . }";
      expect(run(schema, ONE_TRIPLE, {S: "one(':p1')", "S-p1": "$ = {p1: local($1)}"}))
        .to.deep.equal({p1: "o1"});
    });

    /* What $n is for: two sub-productions with one name, which is the case
     * a name can't address. */
    it("should number a shape's values in the order the body matched them", function () {
      expect(run("<http://a.example/S> { :p1 xsd:integer ; :p1 IRI }",
                 ":x :p1 42 ; :p1 :o1 .", {S: "[num($1), $2]"}))
        .to.deep.equal([42, B + "o1"]);
    });

    /* All of them, without naming any: what `Object.assign({}, ...$*)` is
     * for.  yacc counts ($1, $2) and has no word for the lot; make(1)
     * spells the whole right-hand side `$^`; the shell spells "all the
     * arguments" `$*`, which is what a production's values are here. */
    it("should take $* for every value the body matched, in match order", function () {
      expect(run("<http://a.example/S> { :p1 . ; :p2 . }", ":x :p1 :o1 ; :p2 :o2 .",
                 {S: "$$ = $*"})).to.deep.equal([B + "o1", B + "o2"]);
    });

    it("should count from $1, as yacc does", function () {
      expect(() => run(TWO, ONE_TRIPLE, {S: "$0"})).to.throw(/numbered from \$1/);
    });

    /* The whole point: a production written as one action per attribute,
     * with the shape merging what its constraints said. */
    it("should let a production be written as its sub-expressions", function () {
      const schema = "<http://a.example/S> {\n"
            + "  $<http://a.example/S-p1> :p1 . ;\n"
            + "  $<http://a.example/S-p2> :p2 . ?\n}";
      expect(run(schema, ONE_TRIPLE, {
        S: "$ = Object.assign({type: 'S'}, ...($:p1 || []), ...($:p2 || []))",
        "S-p1": "$ = {p1: local($1)}",
        "S-p2": "$ = {p2: local($1)}",
      })).to.deep.equal({type: "S", p1: "o1"});
    });

    /* How many values a name stands for is the schema's to say: an arc
     * that can only match once is the value, and every other arc is the
     * list of what matched -- which is what lets a shape's action write
     * `Object.assign($rdf:type, $:left, $:right)` rather than counting. */
    describe("one value or a list of them", function () {
      const ONE_EACH = "<http://a.example/S> { :p1 . ; :p2 . * }";
      const SOME = ":x :p1 :o1 ; :p2 :o2, :o3 .";

      it("should be the value itself where the schema allows one", function () {
        expect(run(ONE_EACH, SOME, {S: "$:p1"}, undefined, undefined, {schema: true}))
          .to.equal(B + "o1");
      });

      it("should be the list of them where it allows more", function () {
        expect(run(ONE_EACH, SOME, {S: "$:p2.slice().sort()"},
                   undefined, undefined, {schema: true}))
          .to.deep.equal([B + "o2", B + "o3"]);
      });

      it("should be a list when no schema said otherwise", function () {
        expect(run(ONE_EACH, SOME, {S: "$:p1"})).to.deep.equal([B + "o1"]);
      });

      /* Two ways for one predicate to arrive, and a constraint under a
       * group that repeats: both can match more than once however small
       * their own cardinality is. */
      it("should be a list where two constraints share a predicate", function () {
        expect(run("<http://a.example/S> { :p1 IRI ; :p1 IRI }", ":x :p1 :o1, :o2 .",
                   {S: "$:p1.length"}, undefined, undefined, {schema: true}))
          .to.equal(2);
      });

      it("should be a list where the group it is in repeats", function () {
        expect(run("<http://a.example/S> { ( :p1 . ; :p2 . ) * }", ":x :p1 :o1 ; :p2 :o2 .",
                   {S: "$:p1"}, undefined, undefined, {schema: true}))
          .to.deep.equal([B + "o1"]);
      });

      /* An arc that didn't match is absent either way: `$:p2 || []` is
       * still how an action asks for however many there were. */
      it("should be undefined for an arc that isn't there", function () {
        expect(run(ONE_EACH, ":x :p1 :o1 .", {S: "[$:p1, $:p2]"},
                   undefined, undefined, {schema: true}))
          .to.deep.equal([B + "o1", undefined]);
      });
    });

    /* A substitution with no lexer for the action language has to leave
     * alone everything that isn't unambiguously a reference. */
    describe("what it doesn't touch", function () {

      it("should leave $name, which is an identifier in several languages", function () {
        expect(run(TWO, ONE_TRIPLE, {S: "const $p1 = 'mine'; return $p1;"})).to.equal("mine");
      });

      it("should leave $ before a brace, quote or slash", function () {
        expect(run(TWO, ONE_TRIPLE, {S: "`${str(one(':p1'))}`"})).to.equal(B + "o1");
        expect(run(TWO, ONE_TRIPLE, {S: "/o1$/.test(one(':p1'))"})).to.equal(true);
        expect(run(TWO, ONE_TRIPLE, {S: "'costs $'"})).to.equal("costs $");
      });

      it("should not shadow a name the action is already using", function () {
        expect(run(TWO, ONE_TRIPLE, {S: "const _1 = 'mine'; $ = [_1, $1];"}))
          .to.deep.equal(["mine", B + "o1"]);
      });

      it("should read a bare $ wherever a value ends", function () {
        expect(run(TWO, ONE_TRIPLE, {S: "$ = one(':p1')"})).to.equal(B + "o1");
        expect(run(TWO, ONE_TRIPLE, {S: "$ = [one(':p1')]; $.push('and'); return $;"}))
          .to.deep.equal([B + "o1", "and"]);
        expect(run(TWO, ONE_TRIPLE, {S: "$ = one(':p1'); return str($)"}))
          .to.equal(B + "o1");
      });
    });

    /* A `$` with something after it that this doesn't recognize is a
     * mistake now, rather than a dollar sign passed through: `$@` means
     * whatever the action language makes of it today and would mean a
     * reference the day `$@` got one, which is the way Perl's `\q` went. */
    describe("what it refuses", function () {

      it("should refuse a sigil it doesn't know", function () {
        ["$@", "$&", "$#", "$!", "$?", "$^", "$~", "$%", "$|"].forEach(bad =>
          expect(() => run(TWO, ONE_TRIPLE, {S: bad + " = 1"}), bad)
            .to.throw(/is not a reference/));
      });

      it("should say what to write instead", function () {
        expect(() => run(TWO, ONE_TRIPLE, {S: "$@ = 1"})).to.throw(/write \$\$/);
        expect(() => run(TWO, ONE_TRIPLE, {S: "$+1"}), "an operator wants a space")
          .to.throw(/\$\+ is not a reference/);
      });

      it("should say which production it was reading", function () {
        expect(() => run(TWO, ONE_TRIPLE, {S: "$@ = 1"})).to.throw(B + "S");
      });

      it("should refuse what looks like an IRI and isn't", function () {
        expect(() => run(TWO, ONE_TRIPLE, {S: "$<not an iri>"}))
          .to.throw(/\$< is not a reference/);
      });
    });

    it("should hand the evaluator the names and what they stand for", function () {
      const seen = [];
      run(TWO, ONE_TRIPLE, {S: "$ = [$1, $:p1]"}, undefined, undefined,
          {evaluate: (code, scope) => { seen.push([code, scope]); return undefined; }});
      const [code, scope] = seen[0];
      expect(code, "the code is rewritten before the evaluator sees it")
        .to.equal("_ret = [_1, _p1]");
      expect(scope.bindings).to.deep.equal(
        {_ret: undefined, _1: B + "o1", _p1: [B + "o1"]});
      expect(scope.ret, "which name the action assigns to").to.equal("_ret");
    });

    it("should leave ret out when the action doesn't assign", function () {
      const seen = [];
      run(TWO, ONE_TRIPLE, {S: "$:p1"}, undefined, undefined,
          {evaluate: (code, scope) => { seen.push(scope); return undefined; }});
      expect("ret" in seen[0]).to.equal(false);
    });
  });

  describe("naming a predicate", function () {

    it("should expand a prefixed name", function () {
      expect(run(ONE_ARC, ONE_TRIPLE, {S: "one(':p1')"})).to.equal(B + "o1");
    });

    it("should take a full IRI", function () {
      expect(run(ONE_ARC, ONE_TRIPLE, {S: "one('http://a.example/p1')"})).to.equal(B + "o1");
    });

    it("should read `a` as rdf:type", function () {
      expect(run("<http://a.example/S> { a . }", ":x a :T .", {S: "local(one('a'))"}))
        .to.equal("T");
    });

    it("should say which prefixes it knows when one is missing", function () {
      expect(() => run(ONE_ARC, ONE_TRIPLE, {S: "one('nope:p1')"}))
        .to.throw(/no prefix "nope:"/);
      expect(() => run(ONE_ARC, ONE_TRIPLE, {S: "one('nope:p1')"}), "and which it does know")
        .to.throw(/xsd:/);
    });
  });

  describe("what a production reduces to", function () {

    it("should be the node, for a shape with no action", function () {
      expect(run("<http://a.example/S> { :p1 @<http://a.example/T> }\n"
                 + "<http://a.example/T> { :p2 . }",
                 ":x :p1 :y . :y :p2 :z .", {S: "one(':p1')"}))
        .to.equal(B + "y");
    });

    it("should be what the referenced shape's action said", function () {
      expect(run("<http://a.example/S> { :p1 @<http://a.example/T> }\n"
                 + "<http://a.example/T> { :p2 . }",
                 ":x :p1 :y . :y :p2 :z .",
                 {S: "one(':p1')", T: "{inner: one(':p2')}"}))
        .to.deep.equal({inner: B + "z"});
    });

    /* An AND is several constraints on one node; the conjunct with an action
     * is the one that has anything to say about it. */
    it("should be the conjunct that spoke, for an AND", function () {
      expect(run("<http://a.example/S> IRI AND { :p1 . }", ONE_TRIPLE, {S: "{spoke: true}"}))
        .to.deep.equal({spoke: true});
    });

    it("should be the node when no conjunct spoke", function () {
      expect(run("<http://a.example/S> IRI AND { :p1 . }", ONE_TRIPLE, {}))
        .to.equal(B + "x");
    });

    it("should be the branch that matched, for an OR", function () {
      expect(run("<http://a.example/S> @<http://a.example/T> OR @<http://a.example/U>\n"
                 + "<http://a.example/T> { :p9 . }\n<http://a.example/U> { :p1 . }",
                 ONE_TRIPLE, {U: "'took U'"}))
        .to.equal("took U");
    });
  });

  describe("an action on a triple constraint", function () {

    it("should stand in for the arc's value", function () {
      const schema = "<http://a.example/S> { $<http://a.example/S-p1> :p1 . }";
      expect(run(schema, ONE_TRIPLE, {S: "one(':p1')", "S-p1": "'seen ' + object"}))
        .to.equal("seen " + B + "o1");
    });

    it("should see what its object reduced to", function () {
      const schema = "<http://a.example/S> { $<http://a.example/S-p1> :p1 @<http://a.example/T> }\n"
            + "<http://a.example/T> { :p2 . }";
      expect(run(schema, ":x :p1 :y . :y :p2 :z .",
                 {S: "one(':p1')", T: "{inner: one(':p2')}", "S-p1": "({wrapped: value})"}))
        .to.deep.equal({wrapped: {inner: B + "z"}});
    });
  });

  describe("terms", function () {

    it("should read a literal as a string or a number", function () {
      expect(run("<http://a.example/S> { :p1 xsd:integer }", ':x :p1 42 .',
                 {S: "[str(one(':p1')), num(one(':p1')), datatype(one(':p1'))]"}))
        .to.deep.equal(["42", 42, "http://www.w3.org/2001/XMLSchema#integer"]);
    });

    it("should read a language tag", function () {
      expect(run("<http://a.example/S> { :p1 . }", ':x :p1 "bonjour"@fr .',
                 {S: "[str(one(':p1')), lang(one(':p1'))]"}))
        .to.deep.equal(["bonjour", "fr"]);
    });

    it("should know a blank node from an IRI", function () {
      expect(run("<http://a.example/S> { :p1 . }", ":x :p1 [ ] .",
                 {S: "isBnode(one(':p1'))"})).to.equal(true);
      expect(run(ONE_ARC, ONE_TRIPLE, {S: "isBnode(one(':p1'))"})).to.equal(false);
    });

    it("should refuse to read a literal as an IRI", function () {
      expect(() => run("<http://a.example/S> { :p1 . }", ':x :p1 "s" .',
                       {S: "iri(one(':p1'))"})).to.throw(/expected an IRI/);
    });
  });

  describe("a cycle in the data", function () {
    const CYCLE = "<http://a.example/S> { :p1 @<http://a.example/S> }";
    const LOOP = ":x :p1 :x .";

    it("should reduce to the node, so a reference stays a reference", function () {
      expect(run(CYCLE, LOOP, {S: "({at: node, next: one(':p1')})"}))
        .to.deep.equal({at: B + "x", next: B + "x"});
    });

    it("should say so with onRecursion: marker", function () {
      expect(run(CYCLE, LOOP, {S: "one(':p1')"}, undefined, undefined, {onRecursion: "marker"}))
        .to.deep.equal({type: "Recursion", node: B + "x", shape: B + "S"});
    });

    it("should refuse with onRecursion: throw", function () {
      expect(() => run(CYCLE, LOOP, {S: "one(':p1')"}, undefined, undefined,
                       {onRecursion: "throw"}))
        .to.throw(/the data has a cycle/);
    });
  });

  /* Dispatch only records that an action applies, so a partition the matcher
   * tries and abandons leaves nothing behind. */
  it("should not let an action decide a match", function () {
    expect(run("<http://a.example/S> { :p1 . ; :p1 . }", ":x :p1 :o1 , :o2 .",
               {S: "all(':p1').length"}))
      .to.equal(2);
  });

  it("should reduce every pair in a shape map", function () {
    const schema = ShExParser.construct(B, null, {index: true})
          .parse("PREFIX : <http://a.example/>\n<http://a.example/S> { :p1 . }",
                 B, undefined, "reduce-test");
    schema._index.shapeExprs[B + "S"].shapeExpr.semActs =
      [{type: "SemAct", name: EXT, code: "({at: node})"}];
    const graph = new N3.Store();
    graph.addQuads(new N3.Parser({baseIRI: B, format: "text/turtle"})
                   .parse("PREFIX : <http://a.example/>\n:x :p1 :o . :y :p1 :o ."));
    const validator = new ShExValidator(schema, RdfJsDb(graph), {});
    Reduce.register(validator);
    const res = validator.validateShapeMap(
      [{node: B + "x", shape: B + "S"}, {node: B + "y", shape: B + "S"}]);
    expect(Reduce.reduce(res, {evaluate, prefixes: PREFIXES}))
      .to.deep.equal([{at: B + "x"}, {at: B + "y"}]);
  });

  describe("the evaluator", function () {

    /* Required to run an action -- a result with none in it needs no
     * evaluator, which is what an eager registration leaves behind. */
    it("should be required, and say which one runs JavaScript", function () {
      const schema = ShExParser.construct(B, null, {index: true})
            .parse("PREFIX : <http://a.example/>\n<http://a.example/S> { :p1 . }",
                   B, undefined, "reduce-test");
      schema._index.shapeExprs[B + "S"].shapeExpr.semActs =
        [{type: "SemAct", name: EXT, code: "({})"}];
      const graph = new N3.Store();
      graph.addQuads(new N3.Parser({baseIRI: B, format: "text/turtle"})
                     .parse("PREFIX : <http://a.example/>\n:x :p1 :o ."));
      const validator = new ShExValidator(schema, RdfJsDb(graph), {});
      Reduce.register(validator);
      const res = validator.validateShapeMap([{node: B + "x", shape: B + "S"}]);
      expect(() => Reduce.reduce(res)).to.throw(/needs an `evaluate` option/);
      expect(() => Reduce.reduce(res)).to.throw(/@shexjs\/extension-reduce-js/);
    });

    /* The scope is the portable half of this: an implementation in another
     * language reimplements the fold and brings its own evaluator, so no
     * function may cross the line. */
    it("should hand it plain data", function () {
      const seen = [];
      run("<http://a.example/S> { $<http://a.example/S-p1> :p1 . }", ONE_TRIPLE,
          {S: "shape action", "S-p1": "tc action"}, undefined, undefined,
          {evaluate: (code, scope) => { seen.push([code, scope]); return code; },
           api: {extra: 1}});

      const byCode = c => seen.find(([code]) => code === c)[1];
      const shape = byCode("shape action");
      expect(shape.kind).to.equal("shape");
      expect(shape.node).to.equal(B + "x");
      expect(shape.shape).to.equal(B + "S");
      expect(shape.arcs).to.deep.equal({[B + "p1"]: ["tc action"]});
      expect(shape.prefixes).to.equal(PREFIXES);
      expect(shape.api).to.deep.equal({extra: 1});
      expect(shape.where).to.include(B + "S");

      const tc = byCode("tc action");
      expect(tc.kind).to.equal("tripleConstraint");
      expect(tc.subject).to.equal(B + "x");
      expect(tc.predicate).to.equal(B + "p1");
      expect(tc.object).to.equal(B + "o1");
      expect(tc.value).to.equal(B + "o1");

      seen.forEach(([, scope]) =>
        Object.keys(scope).forEach(k =>
          expect(typeof scope[k], `scope.${k} is data`).to.not.equal("function")));
    });

    /* ...so an action language that isn't JavaScript is a function, not a
     * fork.  This one is a JSON template whose "$p" strings name arcs. */
    it("should take an evaluator that isn't JavaScript", function () {
      const template = (code, scope) => JSON.parse(code, (_k, v) =>
        typeof v === "string" && v[0] === "$"
          ? (scope.arcs[PREFIXES[""] + v.substr(1)] || [])[0]
          : v);
      expect(run("<http://a.example/S> { :p1 . ; :p2 . }", ":x :p1 :o1 ; :p2 :o2 .",
                 {S: '{"left": "$p1", "right": "$p2"}'}, undefined, undefined,
                 {evaluate: template}))
        .to.deep.equal({left: B + "o1", right: B + "o2"});
    });
  });

  /* An action that runs while the matcher matches gets to say no, which is
   * what registerEager is for.  There are two noes: this one doesn't fit,
   * and nothing will. */
  describe("saying no", function () {
    /* <#S> is <#Mid> or <#Last>, alike but for their actions: the same
     * shape written twice, so what the node is is the actions' to say. */
    const EITHER = `<http://a.example/S> @<http://a.example/Mid> OR @<http://a.example/Last>
<http://a.example/Mid>  { :p1 . }
<http://a.example/Last> { :p1 . }`;

    /** compile, register eagerly, validate: the entry, status and all */
    function match (shexc, turtle, actions, node = B + "x", shape = B + "S", options = {}) {
      const validator = new ShExValidator(compile(shexc, actions), load(turtle), {});
      Reduce.registerEager(validator, Object.assign({evaluate, prefixes: PREFIXES}, options));
      return validator.validateShapeMap([{node, shape}]);
    }
    const errorsOf = entry => JSON.stringify(entry.appinfo);

    it("should take the next branch when an action rejects", function () {
      const res = match(EITHER, ONE_TRIPLE,
                        {Mid: "reject('not this one')", Last: "'last'"});
      expect(res[0].status).to.equal("conformant");
      expect(Reduce.reduce(res)[0], "...and the branch that took it").to.equal("last");
    });

    it("should read reject('why') as the value it could have returned", function () {
      const res = match(EITHER, ONE_TRIPLE,
                        {Mid: "reject('not this one')", Last: "({failure: 'nor this'})"});
      expect(res[0].status).to.equal("nonconformant");
      expect(errorsOf(res[0]), "both branches, and why each said no")
        .to.match(/not this one/).and.to.match(/nor this/);
    });

    /* The difference: a rejection is about this shape, and the OR goes on
     * to the next one; a cut is about the node, and there is nowhere left
     * to go -- <#Last> would have matched, and is never tried. */
    it("should stop the whole pair when an action cuts", function () {
      const res = match(EITHER, ONE_TRIPLE, {Mid: "cut('no reading of this will do')",
                                             Last: "'last'"});
      expect(res[0].status).to.equal("nonconformant");
      expect(errorsOf(res[0])).to.include("no reading of this will do");
      expect(errorsOf(res[0]), "the branch it didn't try").to.not.include("last");
    });

    it("should take a cut as a value, for a language without exceptions", function () {
      const res = match(EITHER, ONE_TRIPLE,
                        {Mid: "({failure: 'nor by hand', cut: true})", Last: "'last'"});
      expect(res[0].status).to.equal("nonconformant");
      expect(errorsOf(res[0])).to.include("nor by hand");
    });

    it("should say where the action that cut was", function () {
      const res = match(EITHER, ONE_TRIPLE, {Mid: "cut('enough')", Last: "'last'"});
      expect(errorsOf(res[0])).to.include(B + "Mid");
    });

    /* A cut unwinds whatever the matcher was in the middle of -- a nested
     * shape, a partition, a fork -- and lands at the pair it was asked
     * about.  The pairs beside it are none of its business. */
    it("should cut from inside a nested shape", function () {
      const res = match(`<http://a.example/S> { :p1 @<http://a.example/T> }
<http://a.example/T> { :p2 . }`,
                        ":x :p1 :y . :y :p2 :o2 .", {T: "cut('deep')"});
      expect(res[0].status).to.equal("nonconformant");
      expect(errorsOf(res[0])).to.include("deep");
    });

    it("should leave the other pairs of the shape map alone", function () {
      const validator = new ShExValidator(
        compile(EITHER, {Mid: "node === ':x'.replace(':', 'http://a.example/') "
                              + "? cut('not x') : 'mid'", Last: "'last'"}),
        load(":x :p1 :o1 . :y :p1 :o1 ."), {});
      Reduce.registerEager(validator, {evaluate, prefixes: PREFIXES});
      const res = validator.validateShapeMap([
        {node: B + "x", shape: B + "S"}, {node: B + "y", shape: B + "S"}]);
      expect(res.map(e => e.status), "the cut is about the node it was on")
        .to.deep.equal(["nonconformant", "conformant"]);
    });

    it("should cut a validation that is waiting on its data", async function () {
      const validator = new ShExValidator(
        compile(EITHER, {Mid: "cut('not even asynchronously')", Last: "'last'"}),
        load(ONE_TRIPLE), {});
      Reduce.registerEager(validator, {evaluate, prefixes: PREFIXES});
      const res = await validator.validateShapeMapAsync([{node: B + "x", shape: B + "S"}]);
      expect(res[0].status).to.equal("nonconformant");
      expect(errorsOf(res[0])).to.include("not even asynchronously");
    });

    /* Folding a parse that already happened, there is no match to refuse:
     * what reject() says is a value like the one it could have returned. */
    it("should be a value when the fold is after the match", function () {
      expect(run(ONE_ARC, ONE_TRIPLE, {S: "reject('too late')"}))
        .to.deep.equal({failure: "too late"});
    });

    it("should let an action say more than a reason", function () {
      expect(run(ONE_ARC, ONE_TRIPLE, {S: "reject({failure: 'nope', code: ':tooFew'})"}))
        .to.deep.equal({failure: "nope", code: ":tooFew"});
    });
  });

  it("should refuse a validator it can't register on", function () {
    expect(() => Reduce.register({})).to.throw(/wants a ShExValidator/);
  });
});
