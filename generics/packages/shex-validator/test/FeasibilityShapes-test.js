/** Triple expressions the ordinary corpus doesn't contain.
 *
 * The feasibility layer and the repair search walk a shape's triple
 * expression themselves, so their behaviour depends on shapes rather than on
 * data: a group nobody may take (`{0}`), a group repeated around another
 * group, an inclusion reached twice, and an arc with more identical
 * constraints than there are sensible ways to deal it.  Each is legal ShExC
 * and none of them appears in shexTest, so this is where they get exercised.
 */
"use strict";

const {expect} = require("chai");
const N3 = require("n3");
const ShExParser = require("@shexjs/parser");
const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
const {ShExValidator} = require("..");

const base = "http://a.example/";
const PREFIX = "PREFIX : <http://a.example/>\n";

/** validate :x against <S>, and read the whole report (repairs compute on read) */
function refute (shapeText, dataText) {
  const schema = ShExParser.construct(base, null, {index: true})
        .parse(PREFIX + shapeText, base, undefined, "feasibility-shapes");
  const graph = new N3.Store();
  graph.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"}).parse(PREFIX + dataText));
  const result = new ShExValidator(schema, RdfJsDb(graph), {})
        .validateShapeMap([{node: base + "x", shape: base + "S"}])[0];
  return {status: result.status, said: JSON.stringify(result.appinfo)};
}

describe("feasibility over unusual triple expressions", function () {

  /* `( :b . ; :c . ){0}` is a group nobody may take, so a :b and a :c in the
   * neighborhood have nowhere to go however the rest of the shape is
   * matched. */
  it("should refute a node whose triples only fit a group taken zero times", function () {
    const {status, said} = refute("<S> { ( :b . ; :c . ){0} ; :a . }",
                                  ":x :b :y ; :c :z .");
    expect(status).to.equal("nonconformant");
    expect(said, "the missing :a").to.include(base + "a");
  });

  /* The same group, this time under a `*`: the repetition puts the search in
   * iterated mode, where a zero-max subgroup is read differently. */
  it("should refute it under a repetition too", function () {
    const {status, said} = refute("<S> { ( ( :b . ; :c . ){0} ; :d . )* ; :a . }",
                                  ":x :b :y ; :c :z ; :d :w .");
    expect(status).to.equal("nonconformant");
    expect(said).to.include(base + "a");
  });

  it("should allow an optional group inside a repeated one", function () {
    const {status, said} = refute("<S> { ( ( :b . ; :c . )? ; :d . )* ; :a . }",
                                  ":x :d :w .");
    expect(status, "only the mandatory :a is missing").to.equal("nonconformant");
    expect(said).to.include(base + "a");
  });

  describe("inclusions", function () {
    const T = "<T> { $<t> ( :b . ; :c . ) }\n";

    /* The node has every arc the shape names, so nothing is refuted by a
     * missing property and the feasibility walk runs the whole way -- into
     * the inclusion, from inside the repetition. */
    it("should follow one reached under a repetition", function () {
      const {status, said} = refute(T + "<S> { ( &<t> ; :d . )+ ; :a IRI }",
                                    ":x :b :y ; :c :z ; :d :w ; :a 1 .");
      expect(status, ":a is present but a literal").to.equal("nonconformant");
      expect(said).to.include(base + "a");
    });

    /* A branch of a repeated OneOf that the node leaves empty: the iterated
     * walk skips it (it can be committed to zero) and the occupancy check is
     * the first to follow it, so the inclusion is resolved there. */
    it("should follow one in an alternative the node didn't take", function () {
      const {status, said} = refute(T + "<S> { ( &<t> | :d . )+ ; :a IRI }",
                                    ":x :d :w ; :a 1 .");
      expect(status, ":a is present but a literal").to.equal("nonconformant");
      expect(said).to.include(base + "a");
    });

    /* Naming the same production twice in one shape -- `&<t> ; &<t>` -- is
     * currently an internal error out of MapArray ("already included"), so
     * the walks that thread a "seen" set have no way to meet an inclusion a
     * second time and their guards stay untested.  The other route,
     * `$<t1> ( &<t2> )`, spreads the inclusion's characters into an object
     * (see the ShExJison `extend({id}, ...)` case). */
  });

  /* Five identical :a constraints over five :a triples is 126 ways to deal
   * them, and the search takes the first 64; two identical :b constraints
   * then multiply what is left.  The point is that it answers at all, and
   * with a repair rather than a timeout. */
  it("should bound the deals when an arc has many identical constraints", function () {
    const {status, said} = refute(
      "<S> { :a . ; :a . ; :a . ; :a . ; :a . ; :b . ; :b . ; :c . }",
      ":x :a :a1, :a2, :a3, :a4, :a5 ; :b :b1 .");
    expect(status).to.equal("nonconformant");
    expect(said, "the missing :c").to.include(base + "c");
  });
});
