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

  describe("data-pane hovers over a triple two constraints matched", function () {
    this.timeout(20000);
    const CAT_SCHEMA = `PREFIX ex: <http://ex.example/ns#>
<#S1> {
  ^ex:manages GRAPH <CardCatalog> @<#catalogEntry> ;
  ex:foo LITERAL
}
<#catalogEntry> { ex:manages IRI ; ex:source LITERAL }
`;
    const CAT_DATA = `PREFIX ex: <http://ex.example/ns#>
<s1> ex:foo "bar" .
GRAPH <CardCatalog> {
  <entry1> ex:manages <s1> ;
    ex:source "https://feed.example/s1" .
}
`;
    const catSearch = "?editors=1"
          + "&schema=" + encodeURIComponent(CAT_SCHEMA)
          + "&data=" + encodeURIComponent(CAT_DATA)
          + "&shape-map=" + encodeURIComponent("<s1>@<#S1>");

    it("should light both ^ex:manages and ex:manages IRI", async function () {
      const {dom, $, shared} = await Harness.boot(PAGE, catSearch);
      try {
        $("#validate").trigger("click");
        await shared.promise;
        const es = shared.Caches.editorSupport;
        const pairs = (es.lastMapped || {}).pairs || [];
        expect(pairs.length, "pairs to hover").to.be.above(0);

        // reinstall the hover regions with a spy on what the data pane gets
        const spy = {regions: []};
        const was = es.panes.inputData.setHoverRegions;
        let painted = [];
        const wasHl = es.panes.inputSchema.highlight;
        try {
          es.panes.inputData.setHoverRegions = rs => { spy.regions = rs; };
          es.setPairHovers(pairs);
          // the in-block predicate: the same characters answer both the
          // referrer's ^ex:manages and the referent's ex:manages
          const off = CAT_DATA.indexOf("ex:manages", CAT_DATA.indexOf("GRAPH"));
          const hits = spy.regions.filter(r => r.from <= off && off < r.to);
          expect(hits.length, "one region owns the predicate").to.equal(1);
          es.panes.inputSchema.highlight = ranges => { painted = ranges; };
          hits[0].enter();
          if (!painted.length) // the highlight switch may boot off: pin instead
            hits[0].click({ctrlKey: true, preventDefault () {}, stopPropagation () {}});
          const covers = txt => {
            const at = CAT_SCHEMA.indexOf(txt);
            return painted.some(r => r && r.from <= at && at < r.to);
          };
          expect(covers("^ex:manages"), "the inverse constraint in <#S1>").to.equal(true);
          expect(covers("ex:manages IRI"), "the constraint in <#catalogEntry>").to.equal(true);
        } finally {
          es.panes.inputData.setHoverRegions = was;
          es.panes.inputSchema.highlight = wasHl;
        }
      } finally {
        dom.window.close();
      }
    });
  });

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
