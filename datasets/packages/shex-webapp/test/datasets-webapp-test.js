/** The datasets strawman (doc/datasets.md) through the app pages: the data
 * pane reads TriG, and GRAPH TERM validation follows values into their
 * named graphs, in both the direct and worker flavours.
 */
"use strict";

const TEST_browser = "TEST_browser" in process.env ? JSON.parse(process.env["TEST_browser"]) : false;

const expect = require("chai").expect;

const PAGE = "packages/shex-webapp/doc/shex-simple.html";

const SCHEMA = `PREFIX ex: <http://ex.example/#>
<#gene> { ex:chromosome GRAPH TERM @<#chromosome>* }
<#chromosome> { ex:assembly LITERAL+ }
`;
const GOOD = `PREFIX ex: <http://ex.example/#>
<BRCA1> ex:chromosome <chr17> .
GRAPH <chr17> { <chr17> ex:assembly "hg38" . }
`;
const BAD = `PREFIX ex: <http://ex.example/#>
<BRCA1> ex:chromosome <chr17> .
<chr17> ex:assembly "hg38" .
`;

function search (data) {
  return "?editors=1"
    + "&schema=" + encodeURIComponent(SCHEMA)
    + "&data=" + encodeURIComponent(data)
    + "&shape-map=" + encodeURIComponent("<BRCA1>@<#gene>");
}

if (!TEST_browser) {
  console.warn("Skipping datasets-webapp-tests; to activate these tests, set environment variable TEST_browser=true");
} else {
  const Harness = require("./harness");

  [{app: "shex-simple", extra: "", options: undefined},
   {app: "shex-worker", extra: "&worker=1", options: {worker: true}},
  ].forEach(({app, extra, options}) =>
    describe(`${app} with a dataset (TriG) and GRAPH TERM`, function () {
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

      it("should follow the value into its named graph", async function () {
        expect(await validate(GOOD), "the pair's mark").to.equal("✓");
      });

      it("should miss the record when it sits in the default graph", async function () {
        expect(await validate(BAD), "the pair's mark").to.equal("✗");
      });
    }));
}
