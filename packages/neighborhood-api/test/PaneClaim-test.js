"use strict";
/**
 * The module-side half of the editor strawman: which neighborhood module
 * claims a pane's text, and what language it says that text is in.
 *
 * Everything here runs in plain node with no DOM and no editor library --
 * which is the point.  A module describes its language as functions over
 * strings, so implementing getNeighborhood never drags in an editor; the
 * host adapts the description (see EditorPanes-test's "module-supplied
 * language" cases for the other half).
 */

const expect = require("chai").expect;
const {claimPane, paramsToCommandLineArgs} = require("..");

// The implementations are what give these declarations meaning, so the
// tests use the real ones.  Not devDependencies, though: this package is
// upstream of all three, and declaring them would put lerna in a cycle
// (c.f. the same dodge in @shexjs/util's common-test-infrastructure).  The
// workspace resolves them.
const Sparql = require("@shexjs/neighborhood-sparql");
const Wikidata = require("@shexjs/neighborhood-wikidata");
const RdfJs = require("@shexjs/neighborhood-rdfjs");

// the order a host offers them: the default (a local store) first, since
// nothing about a document says whether to parse it or to query something
// instead -- that is the user's choice, not a claim
const MODULES = [RdfJs, Sparql, Wikidata];

const TURTLE = `PREFIX : <http://a.example/>\n:x :p 1 .\n`;

describe("neighborhood pane claims", () => {

  it("should leave ordinary data to whatever source the host had chosen", () => {
    // no module claims a plain document: a host asks the user which source
    // to use and only consults claimPaneText for text that names one
    expect(claimPane(MODULES, TURTLE)).to.equal(null);
    expect(RdfJs.claimPaneText, "no catch-all any more").to.equal(undefined);
    expect(RdfJs.paneEditor.language).to.equal("turtle");
  });

  it("should give an Endpoint header to the SPARQL module", () => {
    const claim = claimPane(MODULES, "# Endpoint: http://ex.example/sparql\n\n" + TURTLE);
    expect(claim.module.name).to.equal("neighborhood-sparql");
    expect(claim.params).to.deep.equal({endpoint: "http://ex.example/sparql"});
  });

  it("should give a Wikidata header to the wikidata module, base and all", () => {
    expect(claimPane(MODULES, "# Wikidata\n").module.name).to.equal("neighborhood-wikidata");
    expect(claimPane(MODULES, "# Wikidata\n").params).to.deep.equal({});
    expect(claimPane(MODULES, "# Wikidata: https://test.wikidata.org/wiki/Special:EntityData/\n").params)
      .to.deep.equal({base: "https://test.wikidata.org/wiki/Special:EntityData/"});
  });

  it("should only read a header on the first line", () => {
    // a header further down is a comment in somebody's data, not a claim
    expect(claimPane(MODULES, TURTLE + "# Endpoint: http://ex.example/sparql\n"))
      .to.equal(null);
  });

  it("should name each module the way a manifest or permalink does", () => {
    const {moduleId} = require("..");
    expect(MODULES.map(moduleId)).to.deep.equal(["rdfjs", "sparql", "wikidata"]);
  });

  describe("module-described languages", () => {
    const endpointLine = "# Endpoint: http://ex.example/sparql";

    it("should name the host's language for the body it doesn't describe", () => {
      // both query modules leave the pane's body -- slurped triples -- to
      // the host's Turtle, and describe only their own header
      expect(Sparql.paneEditor.language).to.equal("turtle");
      expect(Wikidata.paneEditor.language).to.equal("turtle");
    });

    it("should color a header it claims", () => {
      const tokens = Sparql.paneEditor.tokens(endpointLine + "\n" + TURTLE);
      expect(tokens.map(t => t.style)).to.deep.equal(["keyword", "link"]);
      expect(endpointLine.substring(tokens[1].from, tokens[1].to))
        .to.equal("http://ex.example/sparql");
    });

    it("should color and diagnose a header it can't use", () => {
      const text = "# Endpoint: localhost:8080\n";
      expect(Sparql.paneEditor.tokens(text)[1].style).to.equal("invalid");
      const [diagnostic] = Sparql.paneEditor.lint(text);
      expect(diagnostic.severity).to.equal("error");
      expect(diagnostic.message).to.match(/not an http\(s\) URL/);
      expect(text.substring(diagnostic.from, diagnostic.to)).to.equal("localhost:8080");
    });

    it("should say nothing about text it doesn't claim", () => {
      expect(Sparql.paneEditor.tokens(TURTLE)).to.deep.equal([]);
      expect(Sparql.paneEditor.lint(TURTLE)).to.deep.equal([]);
      expect(Wikidata.paneEditor.tokens(TURTLE)).to.deep.equal([]);
    });

    it("should warn about a wikidata base that can't be extended with an id", () => {
      const text = "# Wikidata: https://www.wikidata.org/wiki/Q42\n";
      const [diagnostic] = Wikidata.paneEditor.lint(text);
      expect(diagnostic.severity).to.equal("error");
      expect(diagnostic.message).to.match(/trailing delimiter/);
    });

    it("should offer its header where one would go", () => {
      const completions = Sparql.paneEditor.complete("", 0);
      expect(completions.options.map(o => o.label)).to.deep.equal(["# Endpoint: "]);
      // ...and not partway down somebody's data
      expect(Sparql.paneEditor.complete(TURTLE, TURTLE.length)).to.equal(null);
    });

    it("should offer known bases on a wikidata header line", () => {
      const text = "# Wikidata: ";
      const completions = Wikidata.paneEditor.complete(text, text.length);
      expect(completions.options.map(o => o.label))
        .to.include("https://www.wikidata.org/wiki/Special:EntityData/");
    });

    it("should complete entity IRIs only a live db could know", () => {
      const path = require("path");
      const fixtures = path.resolve(__dirname, "../../neighborhood-wikidata/test/fixtures");
      const fs = require("fs");
      const db = Wikidata.ctor(null, {
        fetchDoc: url => {
          const m = url.match(/([QPL]\d+)\.json$/);
          return fs.readFileSync(path.join(fixtures, m ? m[1] + ".json" : "sitematrix.json"), "utf8");
        },
      });
      const N3 = require("n3");
      db.getNeighborhood(N3.DataFactory.namedNode("http://www.wikidata.org/entity/Q42"),
                         "-start-", {type: "Shape"});

      const text = "# Wikidata\n:x :p wd:Q4";
      const completions = Wikidata.paneEditor.complete(text, text.length, {db});
      expect(completions.options.map(o => o.label))
        .to.deep.equal(["http://www.wikidata.org/entity/Q42"]);
      expect(completions.options[0].detail).to.equal("Douglas Adams");
      expect(text.substring(completions.from, completions.to)).to.equal("wd:Q4");

      // ...and nothing without a db: the host has no way to know this
      expect(Wikidata.paneEditor.complete(text, text.length)).to.equal(null);
    });
  });

  /* What a host needs to build a data-source configuration UI: which
   * parameters are documents to edit (panes, shown one at a time) and which
   * are values to type (fields). */
  describe("panes and fields", () => {
    const {paneParams, fieldParams, moduleId} = require("..");

    it("should give a local store exactly one document, which the user can't multiply", () => {
      const [pane] = paneParams(RdfJs.dbParams);
      expect(pane.name).to.equal("data");
      expect(pane.pane).to.deep.include({label: "Turtle data", min: 1, max: 1});
      expect(pane.pane.creatable).to.not.equal(true);
      expect(pane.pane.editor.language).to.equal("turtle");
    });

    it("should sort documents into the panes they belong in", () => {
      // an entity page is a page, and it also says which entity it is about;
      // anything else is a list of ids
      const page = '{"entities": {"Q42": {"id": "Q42"}}}';
      expect(Wikidata.distributeDocuments([page, "Q5 Q7"])).to.deep.equal({
        data: ["Q42 Q5 Q7"],
        pages: [JSON.stringify(JSON.parse(page), null, 2) + "\n"],
      });
      expect(RdfJs.distributeDocuments, "a graph is a graph").to.equal(undefined);
    });

    it("should say which sources fetch their answers", () => {
      // what a host needs to know to offer to record what was fetched
      expect(Sparql.capabilities).to.deep.equal(["query"]);
      expect(Wikidata.capabilities).to.deep.equal(["query", "translate"]);
      expect(RdfJs.capabilities, "handed its data").to.equal(undefined);
    });

    it("should give a query service no documents at all, only fields", () => {
      expect(paneParams(Sparql.dbParams)).to.deep.equal([]);
      expect(fieldParams(Sparql.dbParams).map(p => p.name)).to.include.members(
        ["endpoint", "expectBnodes", "bnodeDepth", "verifyBnodeDescriptions"]);
    });

    it("should let a wikibase have as many entity pages as the user opens", () => {
      // which entities are in play is one list; their pages are documents
      const [ids, pages] = paneParams(Wikidata.dbParams);
      expect(ids.name).to.equal("data");
      expect(ids.pane).to.deep.include({label: "entity ids", min: 1, max: 1});
      expect(ids.pane.editor, "a list of ids is not a language").to.equal(undefined);
      expect(pages.name).to.equal("pages");
      expect(pages.pane).to.deep.include({label: "entity JSON", min: 0, creatable: true});
      expect(pages.pane.max).to.equal(undefined);
      expect(pages.pane.editor.language).to.equal("json");
      // fields go on being fields
      expect(fieldParams(Wikidata.dbParams).map(p => p.name)).to.deep.equal(
        ["base", "sitematrix", "cacheDir"]);
    });

    it("should title an entity pane from the page in it", () => {
      const {titleOf, template} = paneParams(Wikidata.dbParams)[1].pane;
      expect(titleOf('{"entities": {"Q42": {"id": "Q42"}}}')).to.equal("Q42");
      expect(titleOf('{"id": "Q42", "type": "item"}')).to.equal("Q42"); // a bare entity
      expect(titleOf('{"entities": {"Q4'), "half-typed").to.equal(null);
      expect(titleOf(template), "a fresh page names the id to fill in").to.equal("Q0");
    });
  });

  /* A shape map may pick its focus nodes by asking rather than naming them.
   * Which questions can be asked depends on where the data comes from, so
   * each source says what it can resolve and a host asks the selected one. */
  describe("query map extensions", () => {
    const {queryMapResolverFor, extensionIri, extensionName} = require("..");

    it("should name extensions the way the shape map grammar does", () => {
      expect(extensionIri("QENTITIES")).to.equal("http://www.w3.org/ns/shex#Extensions-qentities");
      expect(extensionName(extensionIri("QENTITIES"))).to.equal("QENTITIES");
      // SPARQL's long-standing IRI is an instance of the same convention
      expect(extensionIri("SPARQL")).to.equal("http://www.w3.org/ns/shex#Extensions-sparql");
    });

    it("should let a query service answer SPARQL and nothing else", () => {
      expect(queryMapResolverFor(Sparql, extensionIri("SPARQL")).name).to.equal("SPARQL");
      expect(queryMapResolverFor(Sparql, extensionIri("QENTITIES"))).to.equal(null);
    });

    it("should let a wikibase answer QENTITIES, by id or by bare number", () => {
      const resolver = queryMapResolverFor(Wikidata, extensionIri("QENTITIES"));
      expect(resolver.name).to.equal("QENTITIES");
      const db = Wikidata.ctor(null, {fetchDoc: () => { throw Error("no fetching to resolve ids"); }});
      expect(resolver.resolve("42 Q76 P31", db).map(t => t.value)).to.deep.equal([
        "http://www.wikidata.org/entity/Q42",
        "http://www.wikidata.org/entity/Q76",
        "http://www.wikidata.org/entity/P31",
      ]);
      // the entities themselves, not the pages they came from: a schema
      // about people is about wd:Q42, where data:Q42 is a dataset with a
      // revision and a modification date
      expect(resolver.resolve("42", db)[0].value).to.not.match(/EntityData/);
    });

    it("should say what isn't an id rather than inventing one", () => {
      const resolver = queryMapResolverFor(Wikidata, extensionIri("QENTITIES"));
      expect(() => resolver.resolve("42 rubbish", {})).to.throw(/"rubbish" is not an entity id/);
    });

    it("should leave a local store with no questions to answer", () => {
      expect(RdfJs.queryMapResolvers, "nothing to ask a document you typed").to.equal(undefined);
      expect(queryMapResolverFor(RdfJs, extensionIri("SPARQL"))).to.equal(null);
    });
  });

  describe("command line translation", () => {
    it("should keep a module's historical option name", () => {
      const [endpoint] = paramsToCommandLineArgs(Sparql.dbParams);
      expect(endpoint).to.deep.include({name: "endpoint", type: String, typeLabel: "IRI"});
    });

    it("should turn an array parameter into a multiple option", () => {
      const [data] = paramsToCommandLineArgs(RdfJs.dbParams);
      expect(data).to.deep.include({name: "dataURL", alias: "d", multiple: true, type: String});
    });

    it("should carry defaults and enums as far as they go", () => {
      const byName = {};
      for (const opt of paramsToCommandLineArgs(Sparql.dbParams))
        byName[opt.name] = opt;
      expect(byName["sparql-bnode-depth"]).to.deep.include({type: Number, defaultValue: 4});
      expect(byName["sparql-verify-bnodes"]).to.deep.include({type: Boolean, defaultValue: true});
    });
  });
});
