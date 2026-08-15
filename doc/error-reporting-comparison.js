/* One failing validation, rendered as this checkout renders it. */
const N3 = require("n3"), P = require("@shexjs/parser");
const {ctor: Db} = require("@shexjs/neighborhood-rdfjs"), {ShExValidator} = require("@shexjs/validator");
const U = require("@shexjs/util");
const base = "http://a.example/";
const PRE = "PREFIX : <http://a.example/>\nPREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n";
const cases = [
  ["a choice, half taken, with a bad value",
   "<S> {\n  ( :name . | :givenName . ; :familyName . ) ;\n  :mbox . ;\n  :age xsd:integer ?\n}",
   ':x :givenName "Bob" ; :age "old" .'],
  ["a choice, neither side taken",
   "<S> { :a . | :b . }", ":x :c 1 ."],
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
    const r = new ShExValidator(schema, Db(g), {repairs: true})
          .validateShapeMap([{node: base + "x", shape: ShExValidator.Start}])[0];
    const said = (() => { try { return U.errsToSimple(r.appinfo, schema._prefixes).join("\n"); }
                          catch (e) { return "!! errsToSimple threw: " + String(e).split("\n")[0]; } })();
    out = said + "\n--- structure ---\n" + JSON.stringify(r.appinfo, (k, v) =>
      k === "shapeExpr" || k === "valueExpr" || k === "constraint" || k === "solution" ? undefined : v, 1);
  } catch (e) { out = "!! validation threw: " + String(e).split("\n")[0]; }
  console.log("\n########## " + label + "\n" + out.replace(/http:\/\/a\.example\//g, ":")
              .replace(/http:\/\/www\.w3\.org\/2001\/XMLSchema#/g, "xsd:"));
}
