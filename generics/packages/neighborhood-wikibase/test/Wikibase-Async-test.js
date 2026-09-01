/** Fetching entity pages with fetch() instead of a synchronous XMLHttpRequest.
 *
 * The interesting property isn't that it's asynchronous -- it's *how little*
 * of a validation is.  Everything the walk does inside an entity (statements,
 * qualifiers, values) is already in the page fetched for that entity, so the
 * db awaits only where the walk crosses from one entity to another.
 */
"use strict";

const expect = require("chai").expect;
const path = require("path");
const fs = require("fs");
const Wikibase = require("..");

const fixtures = path.resolve(__dirname, "fixtures");
const pageFor = id => fs.readFileSync(path.join(fixtures, id + ".json"), "utf8");

/** a fetch() that serves the fixtures and counts what it was asked for */
function fetching (asked, {latency = 0} = {}) {
  return async url => {
    if (url.indexOf("sitematrix") !== -1) {
      asked.push("sitematrix");
      if (latency) await new Promise(res => setTimeout(res, latency));
      return fs.readFileSync(path.join(fixtures, "sitematrix.json"), "utf8");
    }
    const id = (url.match(/(Q\d+)\.json/) || [])[1];
    asked.push(id || url);
    if (latency) await new Promise(res => setTimeout(res, latency));
    if (id === undefined) throw Error("unexpected url " + url);
    return pageFor(id);
  };
}

const have = fs.existsSync(path.join(fixtures, "Q42.json"));

describe("neighborhood-wikibase over fetch()", function () {
  if (!have) { it("needs the Q42 fixtures"); return; }

  // pages outlive the db that read them (see forgetPages), which is the point
  // of that cache -- but it means each of these has to start from cold to be
  // measuring its own fetching
  beforeEach(() => Wikibase.forgetPages());

  it("should fetch an entity page without a synchronous XMLHttpRequest", async function () {
    const asked = [];
    const db = Wikibase.asAsyncDb(Wikibase.wikibaseDB(undefined, {
      fetchDocAsync: fetching(asked),
      // no fetchDoc: nothing here may fall back to the blocking transport
    }));
    const Q42 = db.entityIri("Q42");
    const neighborhood = await db.getNeighborhood(
      {termType: "NamedNode", value: Q42}, "S", {type: "Shape"});
    // Q42 has sitelinks, so the sitematrix comes too -- once, and only
    // because this page needs it
    expect(asked.filter(a => a === "Q42"), "one page, asked for once").to.deep.equal(["Q42"]);
    expect(asked.filter(a => a === "sitematrix").length, "sitematrix at most once")
      .to.be.at.most(1);
    expect(neighborhood.outgoing.length, "and it has arcs").to.be.above(0);
  });

  it("should not go back to the network for a node inside a page it has", async function () {
    const asked = [];
    const db = Wikibase.asAsyncDb(Wikibase.wikibaseDB(undefined, {
      fetchDocAsync: fetching(asked),
    }));
    const Q42 = db.entityIri("Q42");
    await db.getNeighborhood({termType: "NamedNode", value: Q42}, "S", {type: "Shape"});
    const before = asked.length;
    // a statement node lives in the page its entity came from
    const statement = db.getQuads(null, null, null, null)
          .map(q => q.object)
          .find(o => o.termType === "NamedNode" && o.value.indexOf("/statement/") !== -1);
    if (statement === undefined) return this.skip();
    await db.getNeighborhood(statement, "S", {type: "Shape"});
    expect(asked.length, "already had it").to.equal(before);
  });

  it("should reuse one page for repeated asks", async function () {
    const asked = [];
    const db = Wikibase.asAsyncDb(Wikibase.wikibaseDB(undefined, {
      fetchDocAsync: fetching(asked),
    }));
    const Q42 = {termType: "NamedNode", value: db.entityIri("Q42")};
    await db.getNeighborhood(Q42, "S", {type: "Shape"});
    await db.getNeighborhood(Q42, "S", {type: "Shape"});
    await db.getNeighborhood(Q42, "S", {type: "Shape"});
    expect(asked.filter(a => a === "Q42"), "fetched once, used three times")
      .to.deep.equal(["Q42"]);
  });

  it("should still be the same db, synchronous parts and all", async function () {
    const asked = [];
    const sync = Wikibase.wikibaseDB(undefined, {fetchDocAsync: fetching(asked)});
    const db = Wikibase.asAsyncDb(sync);
    await db.getNeighborhood(
      {termType: "NamedNode", value: db.entityIri("Q42")}, "S", {type: "Shape"});
    // asAsyncDb wraps rather than copies: the store, the loaded pages and the
    // helpers a host uses are the ones the underlying db has
    expect(db.size, "same store").to.equal(sync.size);
    expect(db.loadedPages().map(p => p.id), "same pages").to.deep.equal(
      sync.loadedPages().map(p => p.id));
    expect(typeof db.suggestFocusNodes, "same helpers").to.equal("function");
  });
});
