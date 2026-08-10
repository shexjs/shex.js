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

// the order a host offers its modules: the catch-all goes last
const MODULES = [Sparql, Wikidata, RdfJs];

const TURTLE = `PREFIX : <http://a.example/>\n:x :p 1 .\n`;

describe("neighborhood pane claims", () => {

  it("should give Turtle to the module that parses it", () => {
    const claim = claimPane(MODULES, TURTLE);
    expect(claim.module.name).to.equal("neighborhood-rdfjs");
    expect(claim.module.paneEditor.language).to.equal("turtle");
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
    const claim = claimPane(MODULES, TURTLE + "# Endpoint: http://ex.example/sparql\n");
    expect(claim.module.name).to.equal("neighborhood-rdfjs");
  });

  it("should let a host know when nothing claims the text", () => {
    expect(claimPane([Sparql, Wikidata], TURTLE)).to.equal(null);
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
