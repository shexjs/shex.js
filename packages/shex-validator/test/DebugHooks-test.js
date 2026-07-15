/** debugHooks (doc/debugger-design.md §4): both regex engines report each
 * TripleConstraint they consider, with the focus node and candidate
 * triples, and behave identically with the hooks absent.
 */
"use strict";

const expect = require("chai").expect;
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("..");

const regexModules = [
  require("@shexjs/eval-simple-1err").RegexpModule,
  require("@shexjs/eval-threaded-nerr").RegexpModule,
];

const base = "http://a.example/";
const schemaText = [
  "PREFIX : <http://a.example/>",
  "start = @<S>",
  "<S> { :p . ; :q @<T> * }",
  "<T> { :r . }",
].join("\n");
const dataText = [
  "PREFIX : <http://a.example/>",
  ":x :p 1 ; :q :y1 , :y2 .",
  ":y1 :r 11 . :y2 :r 22 .",
].join("\n");

function validate (regexModule, debugHooks) {
  const schema = ShExParser.construct(base, {}, {index: true}).parse(schemaText);
  const graph = new N3.Store();
  graph.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"}).parse(dataText));
  const validator = new ShExValidator(schema, RdfJsDb(graph), Object.assign(
    {regexModule}, debugHooks ? {debugHooks} : {}));
  return validator.validateShapeMap([{node: base + "x", shape: ShExValidator.Start}])[0];
}

describe("regex-engine debugHooks", function () {
  regexModules.forEach(regexModule => {
    it("should report each constraint " + regexModule.name + " considers", function () {
      const events = [];
      const res = validate(regexModule, {
        onConstraint: (tc, ctx) => events.push({
          predicate: tc.predicate,
          node: ctx.node.value,
          triples: ctx.triples.length,
        }),
      });
      expect(res.status).to.equal("conformant");
      const byPredicate = events.reduce((acc, e) => {
        acc[e.predicate] = (acc[e.predicate] || []).concat(e);
        return acc;
      }, {});
      expect(byPredicate).to.have.property(base + "p");
      expect(byPredicate).to.have.property(base + "q");
      expect(byPredicate).to.have.property(base + "r");
      expect(byPredicate[base + "p"][0]).to.deep.include({node: base + "x", triples: 1});
      expect(byPredicate[base + "q"][0]).to.deep.include({node: base + "x", triples: 2});
      // <T> was evaluated for both :q objects
      expect(byPredicate[base + "r"].map(e => e.node).sort()).to.deep.equal(
        [base + "y1", base + "y2"]);
    });

    it("should validate identically without hooks using " + regexModule.name, function () {
      const withHooks = validate(regexModule, {onConstraint: () => undefined});
      const without = validate(regexModule);
      expect(withHooks.status).to.equal("conformant");
      expect(without.appinfo).to.deep.equal(withHooks.appinfo);
    });
  });
});
