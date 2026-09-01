/** The pace this db asks at, and the search for the pace a service bears.
 *
 * All of it on a virtual clock: the limiter takes its `now` and its two
 * sleeps, so a test can run a thousand simulated seconds without waiting for
 * any of them, and a simulated service can decide what to refuse by looking
 * at the same clock.
 */
"use strict";

const expect = require("chai").expect;
const {RateLimiter, looksLike429, retryAfterOf} = require("../lib/rate-limit");
const {sparqlDB} = require("..");
const N3 = require("n3");

/** a clock, and the two ways of waiting on it */
function clock () {
  let t = 1000;
  return {
    now: () => t,
    sleep: ms => { t += ms; return Promise.resolve(); },
    sleepSync: ms => { t += ms; },
    tick: ms => { t += ms; },
    get time () { return t; },
  };
}

/** A service that answers, unless it is being asked faster than `bears`
 * requests a second over the last `window` ms -- which is how a metered
 * endpoint behaves: not "one request too soon" but "too many lately". */
function service (dial, {bears, window = 1000, retryAfter = null} = {}) {
  const seen = [];
  const err = () => {
    const e = Error("SPARQL endpoint <http://x.example/sparql> returned 429 Too Many Requests");
    e.status = 429;
    if (retryAfter !== null)
      e.retryAfter = retryAfter;
    return e;
  };
  return {
    seen,
    ask () {
      const at = dial.now();
      while (seen.length && seen[0] <= at - window)
        seen.shift();
      if (seen.length + 1 > bears * (window / 1000)) {
        seen.push(at);
        throw err();
      }
      seen.push(at);
      return "rows";
    },
  };
}

describe("the SPARQL rate limit", () => {

  describe("a pace", () => {
    it("should let a walk run flat out when nothing says otherwise", async () => {
      const dial = clock();
      const limiter = new RateLimiter({now: dial.now, sleep: dial.sleep});
      for (let i = 0; i < 10; ++i)
        await limiter.run(async () => "rows");
      expect(dial.time, "no waiting at all").to.equal(1000);
      expect(limiter.state().rate, "and no limit to wait for").to.equal(0);
    });

    it("should space requests at the rate it was given", async () => {
      const dial = clock();
      const limiter = new RateLimiter({rate: 4, now: dial.now, sleep: dial.sleep});
      const at = [];
      for (let i = 0; i < 5; ++i)
        await limiter.run(async () => at.push(dial.time));
      // the first goes straight away; the rest are a quarter-second apart
      expect(at).to.deep.equal([1000, 1250, 1500, 1750, 2000]);
    });

    it("should count time the request itself took against the gap", async () => {
      const dial = clock();
      const limiter = new RateLimiter({rate: 2, now: dial.now, sleep: dial.sleep});
      const at = [];
      for (let i = 0; i < 3; ++i)
        await limiter.run(async () => { at.push(dial.time); dial.tick(400); });
      // 500ms apart, of which the request spent 400: it waits the other 100
      expect(at).to.deep.equal([1000, 1500, 2000]);
    });

    it("should pace the blocking transport too", () => {
      const dial = clock();
      const limiter = new RateLimiter({rate: 10, now: dial.now, sleepSync: dial.sleepSync});
      const at = [];
      for (let i = 0; i < 3; ++i)
        limiter.runSync(() => at.push(dial.time));
      expect(at).to.deep.equal([1000, 1100, 1200]);
    });
  });

  describe("a refusal", () => {
    it("should drop to a rate and ask again, so the request still answers", async () => {
      const dial = clock();
      let refusals = 2;
      const limiter = new RateLimiter({now: dial.now, sleep: dial.sleep});
      const rows = await limiter.run(async () => {
        if (refusals-- > 0) {
          const e = Error("returned 429"); e.status = 429; throw e;
        }
        return "rows";
      });
      expect(rows, "the query was answered in the end").to.equal("rows");
      expect(limiter.state().refusals).to.equal(2);
      // unlimited, refused: down to the backoff rate, then halved again
      expect(limiter.state().rate).to.equal(0.5);
      // and it waited, doubling what it waited each time it was refused again
      expect(dial.time - 1000, "1s, then 2s").to.equal(3000);
    });

    it("should wait as long as the service asked", async () => {
      const dial = clock();
      const limiter = new RateLimiter({now: dial.now, sleep: dial.sleep});
      let first = true;
      await limiter.run(async () => {
        if (first) {
          first = false;
          const e = Error("429"); e.status = 429; e.retryAfter = "30"; throw e;
        }
        return "rows";
      });
      expect(dial.time - 1000, "Retry-After: 30").to.equal(30000);
    });

    it("should not believe a service that asks for an hour", async () => {
      const dial = clock();
      const limiter = new RateLimiter({now: dial.now, sleep: dial.sleep, maxCooldown: 5000});
      let first = true;
      await limiter.run(async () => {
        if (first) {
          first = false;
          const e = Error("429"); e.status = 429; e.retryAfter = "3600"; throw e;
        }
        return "rows";
      });
      expect(dial.time - 1000).to.equal(5000);
    });

    it("should give up after the retries it was given, and say what refused", async () => {
      const dial = clock();
      const limiter = new RateLimiter({retries: 2, now: dial.now, sleep: dial.sleep});
      let asked = 0;
      const e = await limiter.run(async () => {
        ++asked;
        const boom = Error("SPARQL endpoint <x> returned 429"); boom.status = 429; throw boom;
      }).then(() => null, err => err);
      expect(e, "the refusal, not a rate-limiter error of its own").to.exist;
      expect(e.message).to.include("429");
      expect(asked, "the first ask and two retries").to.equal(3);
    });

    it("should pass anything that is not a refusal straight back", async () => {
      const dial = clock();
      const limiter = new RateLimiter({now: dial.now, sleep: dial.sleep});
      let asked = 0;
      const e = await limiter.run(async () => {
        ++asked;
        throw Error("syntax error in query");
      }).then(() => null, err => err);
      expect(e.message).to.include("syntax error");
      expect(asked, "asked once").to.equal(1);
    });
  });

  describe("the search", () => {
    /* The service bears 4/s.  Nothing knows that; the limiter has to find
     * it by being refused, dropping, and feeling its way back up. */
    it("should converge on the rate a service will bear", async () => {
      const dial = clock();
      const svc = service(dial, {bears: 4});
      const limiter = new RateLimiter({
        probeAfter: 4, now: dial.now, sleep: dial.sleep, sleepSync: dial.sleepSync,
      });
      for (let i = 0; i < 400; ++i)
        await limiter.run(async () => svc.ask());

      const {rate, good, bad, searching} = limiter.state();
      expect(rate, "somewhere at or under what it bears").to.be.at.most(4);
      expect(rate, "and not crawling: within a factor of two").to.be.above(2);
      expect(good).to.be.at.most(4);
      expect(bad, "the slowest rate it was refused at").to.be.above(rate);
      expect(searching, "and it stops once the bounds are close").to.equal(false);
    });

    it("should not go faster than it was told to, however well it goes", async () => {
      const dial = clock();
      const svc = service(dial, {bears: 100});
      const limiter = new RateLimiter({rate: 2, probeAfter: 2, now: dial.now, sleep: dial.sleep});
      for (let i = 0; i < 50; ++i)
        await limiter.run(async () => svc.ask());
      expect(limiter.state().rate, "the ceiling is what was asked for").to.equal(2);
      expect(limiter.state().refusals, "and nothing refused it").to.equal(0);
    });

    it("should come back up after a service that was busy stops being busy", async () => {
      const dial = clock();
      let bears = 1;
      const limiter = new RateLimiter({
        rate: 8, probeAfter: 2, relaxAfter: 8, now: dial.now, sleep: dial.sleep,
      });
      const svc = {seen: [], ask () {
        const at = dial.now();
        this.seen = this.seen.filter(t => t > at - 1000);
        if (this.seen.length + 1 > bears) {
          this.seen.push(at);
          const e = Error("429"); e.status = 429; throw e;
        }
        this.seen.push(at);
        return "rows";
      }};
      for (let i = 0; i < 20; ++i)
        await limiter.run(() => Promise.resolve(svc.ask()));
      const slowed = limiter.state().rate;
      expect(slowed, "it found the slow lane").to.be.at.most(1);

      bears = 8;                      // the rush is over
      for (let i = 0; i < 200; ++i)
        await limiter.run(() => Promise.resolve(svc.ask()));
      expect(limiter.state().rate, "and works back up to what it asked for")
        .to.be.above(slowed);
    });
  });

  describe("reading a refusal", () => {
    it("should know one by its status, and by what it says", () => {
      expect(looksLike429({status: 429})).to.equal(true);
      expect(looksLike429({status: 503}), "a status is the answer when there is one")
        .to.equal(false);
      expect(looksLike429(Error("SPARQL endpoint <x> returned 429 Too Many Requests")))
        .to.equal(true);
      expect(looksLike429(Error("returned 500"))).to.equal(false);
      expect(looksLike429(null)).to.equal(false);
    });

    it("should read Retry-After as seconds or as a date", () => {
      expect(retryAfterOf({retryAfter: "5"})).to.equal(5000);
      expect(retryAfterOf({retryAfter: 5})).to.equal(5000);
      expect(retryAfterOf({}), "nothing said").to.equal(null);
      const soon = new Date(Date.now() + 20000).toUTCString();
      expect(retryAfterOf({retryAfter: soon})).to.be.within(15000, 21000);
    });
  });

  /* The db builds one of these and every request it makes goes through it --
   * a neighborhood's queries and a shape map's SELECT alike. */
  describe("the db that asks", () => {
    const base = "http://a.example/";
    const DataFactory = N3.DataFactory;

    it("should pace what it asks the endpoint", async () => {
      const dial = clock();
      const at = [];
      const db = sparqlDB("http://x.example/sparql", null, {
        executeQueryAsync: async () => { at.push(dial.time); return []; },
        rateLimit: {rate: 5, now: dial.now, sleep: dial.sleep},
      });
      await db.executeSelectAsync("SELECT ?s { ?s ?p ?o }");
      await db.executeSelectAsync("SELECT ?s { ?s ?p ?o . FILTER(true) }");
      expect(at, "a fifth of a second apart").to.deep.equal([1000, 1200]);
      expect(db.rateLimit.state().rate, "and it says what it is doing").to.equal(5);
    });

    it("should answer a refused query by asking again more slowly", async () => {
      const dial = clock();
      let refused = false;
      const db = sparqlDB("http://x.example/sparql", null, {
        executeQueryAsync: async () => {
          if (refused)
            return [[DataFactory.namedNode(base + "x")]];
          refused = true;
          const e = Error("SPARQL endpoint <x> returned 429"); e.status = 429; throw e;
        },
        rateLimit: {now: dial.now, sleep: dial.sleep},
      });
      const rows = await db.executeSelectAsync("SELECT ?s { ?s ?p ?o }");
      expect(rows.length, "the query was answered").to.equal(1);
      expect(db.rateLimit.state().refusals).to.equal(1);
      expect(db.rateLimit.state().rate, "at a rate it picked when refused").to.equal(1);
    });
  });
});
