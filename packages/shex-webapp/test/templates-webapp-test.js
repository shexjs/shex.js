/** A templated schema (doc/templates.md) through the app pages: the
 * validate flow runs the schema through ShExLoader.load, which expands
 * templates after import merging -- so the page validates parameterized
 * shapes with no page-side wiring, in both the direct and worker flavours.
 */
"use strict";

const TEST_browser = "TEST_browser" in process.env ? JSON.parse(process.env["TEST_browser"]) : false;

const expect = require("chai").expect;

const PAGE = "packages/shex-webapp/doc/shex-simple.html";

const SCHEMA = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX ex: <http://ex.example/#>
<#List1Plus><<?T>> CLOSED {
  rdf:first ?T ;
  rdf:rest  [rdf:nil] OR @<#List1Plus><<?T>>
}
<#Person> { ex:name . }
<#Team> { ex:members @<#List1Plus><< @<#Person> >> }
`;
const GOOD = `PREFIX ex: <http://ex.example/#>
<t1> ex:members (<alice> <bob>) .
<alice> ex:name "Alice" .
<bob> ex:name "Bob" .
`;
const BAD = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX ex: <http://ex.example/#>
<t1> ex:members <l1> .
<l1> rdf:first <alice> ; rdf:rest "oops" .
<alice> ex:name "Alice" .
`;

function search (data) {
  return "?editors=1"
    + "&schema=" + encodeURIComponent(SCHEMA)
    + "&data=" + encodeURIComponent(data)
    + "&shape-map=" + encodeURIComponent("<t1>@<#Team>");
}

if (!TEST_browser) {
  console.warn("Skipping templates-webapp-tests; to activate these tests, set environment variable TEST_browser=true");
} else {
  const Harness = require("./harness");

  [{app: "shex-simple", extra: "", options: undefined},
   {app: "shex-worker", extra: "&worker=1", options: {worker: true}},
  ].forEach(({app, extra, options}) =>
    describe(`${app} with a templated schema`, function () {
      this.timeout(20000);

      async function validate (data) {
        const {dom, $, shared, errors} = await Harness.boot(PAGE, search(data) + extra, options);
        try {
          $("#validate").trigger("click");
          await shared.promise;
          Harness.expectClean(errors);
          return $("#fixedMap .pair a").first().text();
        } finally {
          dom.window.close();
        }
      }

      it("should walk a list through the instantiated shape", async function () {
        expect(await validate(GOOD), "the pair's mark").to.equal("✓");
      });

      it("should fail a broken list the way the hand-written shape would", async function () {
        expect(await validate(BAD), "the pair's mark").to.equal("✗");
      });
    }));
}
