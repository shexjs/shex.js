/** The regex engines' debug hooks (plan.md E7): onConstraint says which
 * thread is asking and what it has matched so far; onConstraintResult says
 * what came of the constraint -- the candidates taken, which passed and
 * which failed, and how many threads it spawned. */
"use strict";

const expect = require("chai").expect;
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ShExValidator} = require("@shexjs/validator");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {RegexpModule: Stepper} = require("@shexjs/eval-simple-1err");
const {RegexpModule: Threaded} = require("@shexjs/eval-threaded-nerr");

const base = "http://a.example/";
const ACT = "http://a.example/act";
const schemaText = `PREFIX : <${base}>
:S { :p . {1,2} %<${ACT}>{ no two %} ; :q . }
`;
const dataText = `PREFIX : <${base}>
:x :p 1, 2, 3 ; :q 4 .
`;

/** validate :x@:S with `engine`, the action failing on the object "2";
 * returns what the hooks saw */
function run (engine) {
  const schema = ShExParser.construct(base, {}, {index: true}).parse(schemaText);
  const store = new N3.Store();
  store.addQuads(new N3.Parser({baseIRI: base}).parse(dataText));
  const asked = [], answered = [];
  const validator = new ShExValidator(schema, RdfJsDb(store), {
    regexModule: engine, noCache: true,
    debugHooks: {
      onConstraint: (tc, ctx) => asked.push({tc, ctx}),
      onConstraintResult: (tc, ctx) => answered.push({tc, ctx}),
    },
  });
  validator.semActHandler.register(ACT, {
    dispatch (code, ctx) {
      return ctx.triples.some(t => t.object.value === "2") ? [{type: "SemActFailure", errors: ["no two"]}] : [];
    },
  });
  const results = validator.validateShapeMap([{node: base + "x", shape: base + "S"}]);
  return {asked, answered, status: results[0].status};
}

const local = iri => iri.replace(base, ":");
const objects = triples => triples.map(t => t.object.value).sort();

[Threaded, Stepper].forEach(engine => describe("debugHooks under " + engine.name, function () {
  const {asked, answered} = run(engine);

  it("should say which thread asks about a constraint, and what it has matched so far", function () {
    expect(asked.length, "constraints asked about").to.be.above(1);
    const first = asked[0];
    expect(first.ctx.node.value).to.equal(base + "x");
    expect(first.ctx.thread, "the thread").to.exist;
    expect(first.ctx.thread.matched, "nothing matched yet").to.deep.equal([]);
    expect(first.ctx.thread.errors).to.equal(0);
    // by the time :q comes up, a thread has :p's triples behind it
    const q = asked.find(a => local(a.tc.predicate) === ":q" && a.ctx.thread.matched.length > 0);
    expect(q, "a thread at :q that took :p triples").to.exist;
    expect(q.ctx.thread.matched[0].predicate).to.equal(base + "p");
    expect(q.ctx.thread.matched[0].triples[0].predicate.value).to.equal(base + "p");
  });

  it("should say what came of each constraint", function () {
    expect(answered.length, "every ask answered").to.equal(asked.length);
    const p = answered.find(a => local(a.tc.predicate) === ":p");
    expect(p.ctx.taken.length, "took some of :p's candidates").to.be.above(0);
    expect(p.ctx.passed.length + p.ctx.failed.length, "each taken triple passed or failed").to.equal(p.ctx.taken.length);
    expect(typeof p.ctx.spawned).to.equal("number");
    if (engine === Threaded) {
      // the action runs here, so a triple's failure is known at the constraint
      const failed = answered.filter(a => local(a.tc.predicate) === ":p").flatMap(a => a.ctx.failed);
      expect(failed.map(f => f.triple.object.value)).to.include("2");
      expect(JSON.stringify(failed[0].errors), "with the action's own words").to.include("no two");
    } else {
      // the stepper runs actions at the end: what it took, it reports as passed
      expect(objects(p.ctx.passed)).to.deep.equal(objects(p.ctx.taken));
    }
  });
}));
