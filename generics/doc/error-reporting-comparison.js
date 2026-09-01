/* The structure a failing validation carries, as this checkout builds it.
 *
 * Run it in one checkout, then another, and diff: that is how the columns
 * in error-reporting-comparison.md were made.  Repairs are off by default
 * here so that the shape of the *errors* is what shows; pass --repairs to
 * see what F5 adds on top.
 *
 *   node doc/error-reporting-comparison.js [--repairs] [--human]
 */
const N3 = require("n3"), P = require("@shexjs/parser");
const {ctor: Db} = require("@shexjs/neighborhood-rdfjs"), {ShExValidator} = require("@shexjs/validator");
const U = require("@shexjs/util");
const repairs = process.argv.includes("--repairs");
const human = process.argv.includes("--human");
const base = "http://a.example/";
const PRE = "PREFIX : <http://a.example/>\nPREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n";
const cases = [
  ["a choice: `:a . | :b .` over a node with neither",
   "<S> { :a . | :b . }", ":x :c 1 ."],
  ["a value of the wrong type",
   "<S> { :age xsd:integer }", ':x :age "old" .'],
  ["a choice, half taken, with a bad value",
   "<S> {\n  ( :name . | :givenName . ; :familyName . ) ;\n  :mbox . ;\n  :age xsd:integer ?\n}",
   ':x :givenName "Bob" ; :age "old" .'],
  ["a contingent group: :system wants a :code",
   "<S> { :value . ; :unit . ; ( :code . ; :system . ? )? }",
   ':x :unit "kg" ; :system <http://u.example/> .'],
];
for (const [label, shapeText, dataText] of cases) {
  const schema = P.construct(base, {}, {index: true}).parse(PRE + "start = @<S>\n" + shapeText);
  const g = new N3.Store();
  g.addQuads(new N3.Parser({baseIRI: base, format: "text/turtle"}).parse(PRE + dataText));
  let out;
  try {
    const r = new ShExValidator(schema, Db(g), {repairs})
          .validateShapeMap([{node: base + "x", shape: ShExValidator.Start}])[0];
    out = human
      ? (() => { try { return U.errsToSimple(r.appinfo, schema._prefixes).join("\n"); }
                 catch (e) { return "!! errsToSimple threw: " + String(e).split("\n")[0]; } })()
      : JSON.stringify(r.appinfo, (k, v) => k === "solution" ? undefined : v, 2);
  } catch (e) { out = "!! validation threw: " + String(e).split("\n")[0]; }
  console.log("\n##### " + label + "\n" + out.replace(/http:\/\/a\.example\//g, ":")
              .replace(/http:\/\/www\.w3\.org\/2001\/XMLSchema#/g, "xsd:"));
}
