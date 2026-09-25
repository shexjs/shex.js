/** Semantic actions that can't answer straight away.
 *
 * A handler may return a promise -- "ask me again once this settles" -- and
 * validateShapeMapAsync waits for it and dispatches again.  What this file
 * pins is that waiting changes nothing about the answer: at every place an
 * action can be (start, shape, node constraint, triple constraint, group),
 * under both regex engines, and across the shexTest corpus's Test-extension
 * tests, where every action is made to wait once before it answers.
 *
 * TESTS: a regex over the corpus test @id, as in Validation-test.js.
 */
"use strict";

const TESTS = "TESTS" in process.env ? process.env.TESTS : null;

const expect = require("chai").expect;
const fs = require("fs");
const N3 = require("n3");
const ShExTerm = require("@shexjs/term");
const ShExParser = require("@shexjs/parser");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ordered} = require("@shexjs/neighborhood-api");
const TestExtension = require("@shexjs/extension-test");
const ShExNode = require("@shexjs/node")({rdfjs: N3});
const findPath = require("../../shex-cli/test/findPath.js");
const {ShExValidator} = require("..");

const regexModules = [
  require("@shexjs/eval-simple-1err").RegexpModule,
  require("@shexjs/eval-threaded-nerr").RegexpModule
];

const base = "http://a.example/";
const DEFER = "http://a.example/Defer";
const PRE = "PREFIX : <" + base + ">\nPREFIX Defer: <" + DEFER + ">\n";

function parse (schemaText, dataText) {
  const schema = ShExParser.construct(base, {}, {index: true}).parse(PRE + schemaText);
  const graph = new N3.Store();
  graph.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"}).parse(PRE + dataText));
  return {schema, graph};
}

/** what an action was asked about, for telling one question from another */
function askedAbout (code, ctx) {
  const node = ctx && ctx.node ? ctx.node.value : "";
  const triples = ctx && Array.isArray(ctx.triples)
        ? ctx.triples.map(q => q.subject.value + " " + q.predicate.value + " " + q.object.value) : [];
  return JSON.stringify([code, node, triples]);
}

/**
 * Wrap whatever handles `name` on `validator` so that every distinct
 * question is first answered "later": a promise that settles on the next
 * turn, after which the question is answered by the handler it wraps.
 * Every action waits once, which is the most rerunning waiting can cause.
 */
function deferring (validator, name, {reject} = {}) {
  const inner = validator.semActHandler.handlers[name];
  const settled = new Set();
  const stats = {deferred: 0};
  validator.semActHandler.register(name, {
    dispatch (code, ctx, extensionStorage, resultsArtifact) {
      const key = askedAbout(code, ctx);
      if (settled.has(key))
        return inner.dispatch(code, ctx, extensionStorage, resultsArtifact);
      ++stats.deferred;
      return new Promise((res, rej) => setTimeout(() => {
        if (reject)
          return rej(Error(reject));
        settled.add(key);
        res();
      }, 0));
    }
  });
  return stats;
}

/** Defer:{ pass %}, Defer:{ fail %}, and odd / even on the matched object */
function registerJudge (validator) {
  validator.semActHandler.register(DEFER, {
    dispatch (code, ctx) {
      const verdict = code.trim();
      const ok = verdict === "pass" ? true
            : verdict === "fail" ? false
            : (parseInt(ctx.triples[0].object.value) % 2 === 1) === (verdict === "odd");
      return ok ? [] : [{type: "SemActFailure", errors: [verdict]}];
    }
  });
}

function validators (schema, graph, regexModule) {
  const sync = new ShExValidator(schema, RdfJsDb(graph), {regexModule});
  registerJudge(sync);
  const async = new ShExValidator(schema, RdfJsDb(graph), {regexModule});
  registerJudge(async);
  const stats = deferring(async, DEFER);
  return {sync, async, stats};
}

const CASES = [
  {where: "on a triple constraint (passing)", schema: "<S> { :v . %Defer:{ pass %} }", data: ":n :v 1 .", status: "conformant"},
  {where: "on a triple constraint (failing)", schema: "<S> { :v . %Defer:{ fail %} }", data: ":n :v 1 .", status: "nonconformant"},
  // the action decides which constraint each triple can go to
  {where: "choosing a partition", schema: "<S> { :v . %Defer:{ even %} ; :v . %Defer:{ odd %} }", data: ":n :v 1, 2 .", status: "conformant"},
  {where: "choosing a partition, with none that fits", schema: "<S> { :v . %Defer:{ even %} ; :v . %Defer:{ odd %} }", data: ":n :v 1, 3 .", status: "nonconformant"},
  {where: "choosing a branch of a OneOf", schema: "<S> { :v . %Defer:{ even %} | :v . %Defer:{ odd %} }", data: ":n :v 3 .", status: "conformant"},
  {where: "on a group", schema: "<S> { (:v . ; :w .) %Defer:{ fail %} }", data: ":n :v 1 ; :w 2 .", status: "nonconformant"},
  {where: "on a shape (passing)", schema: "<S> { :v . } %Defer:{ pass %}", data: ":n :v 1 .", status: "conformant"},
  {where: "on a shape (failing)", schema: "<S> { :v . } %Defer:{ fail %}", data: ":n :v 1 .", status: "nonconformant"},
  {where: "on a node constraint", schema: "<S> { :v LITERAL %Defer:{ fail %} }", data: ":n :v 1 .", status: "nonconformant"},
  {where: "on a node constraint reached by reference", schema: "<S> { :v @<L> } <L> LITERAL %Defer:{ fail %}", data: ":n :v 1 .", status: "nonconformant"},
  {where: "in the start actions", schema: "%Defer:{ fail %} <S> { :v . }", data: ":n :v 1 .", status: "nonconformant"},
  {where: "down a recursive shape", schema: "<S> { :v . %Defer:{ odd %} ; :next @<S> ? }", data: ":n :v 1 ; :next :m . :m :v 2 .", status: "nonconformant"},
];

describe("semantic actions that answer asynchronously", function () {

  regexModules.forEach(regexModule => {
    describe("with " + regexModule.name, function () {
      CASES.forEach(({where, schema: schemaText, data, status}) => {
        it("should reach the synchronous verdict " + where, async function () {
          const {schema, graph} = parse(schemaText, data);
          const {sync, async, stats} = validators(schema, graph, regexModule);
          const map = [{node: base + "n", shape: base + "S"}];
          const want = sync.validateShapeMap(map);
          const got = await async.validateShapeMapAsync(map);
          expect(want[0].status).to.equal(status);
          expect(JSON.stringify(got)).to.equal(JSON.stringify(want));
          expect(stats.deferred).to.be.above(0);
        });
      });
    });
  });

  it("should tell a synchronous validation to use validateShapeMapAsync", function () {
    const {schema, graph} = parse("<S> { :v . %Defer:{ pass %} }", ":n :v 1 .");
    const {async} = validators(schema, graph, regexModules[1]);
    expect(() => async.validateShapeMap([{node: base + "n", shape: base + "S"}]))
      .to.throw(/validateShapeMapAsync/);
  });

  it("should throw what a handler's promise rejected with", async function () {
    const {schema, graph} = parse("<S> { :v . %Defer:{ pass %} }", ":n :v 1 .");
    const v = new ShExValidator(schema, RdfJsDb(graph), {});
    registerJudge(v);
    deferring(v, DEFER, {reject: "endpoint unreachable"});
    let thrown = null;
    try {
      await v.validateShapeMapAsync([{node: base + "n", shape: base + "S"}]);
    } catch (e) {
      thrown = e;
    }
    expect(thrown && thrown.message).to.equal("endpoint unreachable");
  });

  it("should leave the dispatcher with nothing pending", async function () {
    const {schema, graph} = parse("<S> { :v . %Defer:{ even %} ; :v . %Defer:{ odd %} }", ":n :v 1, 2 .");
    const {async} = validators(schema, graph, regexModules[1]);
    await async.validateShapeMapAsync([{node: base + "n", shape: base + "S"}]);
    expect(async.semActHandler.takePending()).to.deep.equal([]);
  });
});

/* Every corpus test that uses the Test extension, validated once
 * synchronously and once with every Test action made to wait first.  The
 * results, and what the Test actions printed, have to be the same: the
 * prints are the check on rollback, since a rerun match dispatches the
 * actions before the one that waited a second time. */
describe("the shexTest Test-extension tests, with every action waiting once", function () {
  const schemasPath = findPath("schemas");
  const validationPath = findPath("validation");
  const manifestFile = validationPath + "manifest.jsonld";
  const shexParser = ShExParser.construct();
  let tests = JSON.parse(fs.readFileSync(manifestFile, "utf8"))["@graph"][0].entries
      .filter(t => fs.readFileSync(schemasPath + t.action.schema.replace(/^\.\.\/schemas\//, ""), "utf8")
              .indexOf(TestExtension.url) !== -1);
  if (TESTS)
    tests = tests.filter(t => t["@id"].match(TESTS));

  it("should find some", function () {
    expect(tests.length).to.be.above(10);
  });

  regexModules.forEach(regexModule => {
    tests.forEach(test => {
      it(test["@id"] + " with " + regexModule.name, async function () {
        const schemaFile = validationPath + test.action.schema;
        const dataFile = validationPath + test.action.data;
        const dataURL = "file://" + dataFile;
        const schemaURL = "file://" + schemaFile;
        const semActs = test.action.semActs === undefined ? undefined
              : shexParser.parse(fs.readFileSync(validationPath + test.action.semActs, "utf8"),
                                 "file://" + validationPath + test.action.semActs, {}, null)
                  .startActs.reduce((ret, a) => (ret[a.name] = a.code, ret), {});
        const {schema} = await ShExNode.load({shexc: [schemaFile]}, null, {parser: shexParser}, {});
        const store = new N3.Store();
        store.addQuads(new N3.Parser({baseIRI: dataURL, blankNodePrefix: "", format: "text/turtle"})
                       .parse(fs.readFileSync(dataFile, "utf8")));
        const term = (b, s) => s === undefined ? null
              : typeof s === "object" ? {value: s["@value"], type: s["@type"], language: s["@language"]}
              : s.startsWith("_:") ? s : new URL(s, b).href;
        const map = test.action.map
              ? JSON.parse(fs.readFileSync(term("file://" + manifestFile, test.action.map).substr("file://".length), "utf8"))
              : [{node: term(dataURL, test.action.focus),
                  shape: term(schemaURL, test.action.shape) || ShExValidator.Start}];

        const run = async wait => {
          const v = new ShExValidator(schema, ordered(RdfJsDb(store)), {regexModule, semActs});
          const prints = TestExtension.register(v, {ShExTerm});
          if (wait) {
            deferring(v, TestExtension.url);
            return {result: await v.validateShapeMapAsync(map), prints};
          }
          return {result: v.validateShapeMap(map), prints};
        };
        const want = await run(false);
        const got = await run(true);
        expect(JSON.stringify(got.result)).to.equal(JSON.stringify(want.result));
        expect(got.prints).to.deep.equal(want.prints);
      });
    });
  });
});
