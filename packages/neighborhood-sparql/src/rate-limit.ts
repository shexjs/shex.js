/**
 * How fast this db may ask, and what to do when the service says "not that
 * fast".
 *
 * A validation is a walk, and a walk over a query service is one request per
 * node it reaches -- hundreds of them, as fast as the service will answer.
 * Public endpoints meter that: Wikidata's answers 429 (Too Many Requests)
 * and the walk stops with whichever query happened to be in flight.
 *
 * Two halves, then:
 *
 * **A limit.**  Requests per second, because that is how a service states
 * its policy ("no more than N per second"); 0 means as fast as the walk can
 * ask, which is what a local store wants.  It is a *pace* rather than a
 * bucket: requests here are serial (the db awaits each answer before it
 * knows what to ask next), so spacing them is the whole of it, and a burst
 * allowance would only let a walk sprint into the same 429.
 *
 * **A search.**  A 429 is the service telling you what it will bear, so the
 * limit answers to it: drop to a rate that works, and then feel back up
 * toward the one you asked for.  It is a binary search between the fastest
 * rate known to work and the slowest known to be refused -- which is what
 * "an optimum" means when the only measurements are yes and no -- with two
 * ends to reach first: the first refusal halves (nothing is known to work
 * yet, and a walk should not spend a hundred requests finding out), and a
 * rate with nothing above it doubles (there is no halfway to a bound that
 * hasn't been found).  Then each probe replaces one of the two bounds and
 * the gap halves, until they are within `tolerance` of each other.
 *
 * It settles rather than stopping: after `relaxAfter` requests have gone
 * through untroubled, the refused bound is doubted -- a service that was
 * busy an hour ago may not be now -- and the search opens again.
 *
 * The rates are geometric means rather than arithmetic ones, since what the
 * search halves and doubles is a *rate*: the midpoint between 1/s and 4/s is
 * 2/s, not 2.5/s.
 *
 * Nothing here knows about SPARQL: it takes a thunk, and the caller says
 * which errors mean "too fast" (`is429`) and how long the service asked to
 * be left alone (`retryAfter`).
 */

/** How long to wait, and what to do when told to wait longer. */
export interface RateLimitOptions {
  /** requests per second this db may make; 0 (the default) is as fast as it
   * can ask.  A 429 lowers it from here, and the search never goes above it:
   * it is the ceiling, not a target. */
  rate?: number;
  /** what to drop to on the first 429 when no limit was set, in requests per
   * second (default 1) -- the search works up from there */
  backoffRate?: number;
  /** how many times to retry one request that was refused before giving up
   * and reporting the refusal (default 4) */
  retries?: number;
  /** how close the fastest working rate and the slowest refused one have to
   * be for the search to stop, as a ratio (default 1.1, i.e. within 10%) */
  tolerance?: number;
  /** requests that have to succeed at a rate before a faster one is tried
   * (default 8): a probe is only worth what it can learn, and one request
   * says very little about a service that meters over a window */
  probeAfter?: number;
  /** requests that have to succeed after the search has settled before the
   * refused bound is relaxed and it looks again (default 64).  A service is
   * busy at some times and not at others, and what it refused an hour ago
   * it may not refuse now. */
  relaxAfter?: number;
  /** what a 429 waits when it names no Retry-After, in ms (default 1000).
   * Consecutive refusals double it. */
  cooldown?: number;
  /** the longest a Retry-After will be believed, in ms (default 60000): a
   * service that asks for an hour is asking to be given up on rather than
   * waited for */
  maxCooldown?: number;
  /** does this error mean "too fast"?  Default reads `status`, then the
   * message, so a hand-written transport need not do anything special. */
  is429?: (e: any) => boolean;
  /** how long the service asked for, in ms, or null if it didn't say */
  retryAfter?: (e: any) => number | null;
  /** the clock, for tests */
  now?: () => number;
  /** how the asynchronous face waits */
  sleep?: (ms: number) => Promise<void>;
  /** ...and the synchronous one, which has no await to hide behind */
  sleepSync?: (ms: number) => void;
}

/** What the limiter has worked out, for a host that wants to say so. */
export interface RateLimitState {
  /** requests per second it is making now; 0 is unlimited */
  rate: number;
  /** the ceiling it was given */
  ceiling: number;
  /** fastest rate known to work, or 0 if nothing has been refused yet */
  good: number;
  /** slowest rate known to be refused, or Infinity if none has been */
  bad: number;
  /** how many requests it has made, and how many were refused */
  requests: number;
  refusals: number;
  /** whether it is still looking for the rate the service will bear */
  searching: boolean;
}

const DEFAULTS = {
  rate: 0,
  backoffRate: 1,
  retries: 4,
  tolerance: 1.1,
  probeAfter: 8,
  relaxAfter: 64,
  cooldown: 1000,
  maxCooldown: 60000,
};

/** "SPARQL endpoint <…> returned 429 Too Many Requests" and anything else
 * that says the number where a status belongs */
const SAYS_429 = /\b429\b/;

export function looksLike429 (e: any): boolean {
  if (!e)
    return false;
  if (typeof e.status === "number")
    return e.status === 429;
  return SAYS_429.test(String(e.message || e));
}

/** Retry-After is either a number of seconds or an HTTP date; a transport
 * that read the header hands it over as `retryAfter`. */
export function retryAfterOf (e: any): number | null {
  const said = e && (e.retryAfter !== undefined ? e.retryAfter : e.retryAfterHeader);
  if (said === undefined || said === null || said === "")
    return null;
  if (typeof said === "number")
    return said > 0 ? said * 1000 : null;
  const seconds = Number(said);
  if (!Number.isNaN(seconds))
    return seconds > 0 ? seconds * 1000 : null;
  const when = Date.parse(String(said));
  return Number.isNaN(when) ? null : Math.max(0, when - Date.now());
}

/** sleep without an await, for the synchronous transport.
 *
 * Atomics.wait is the only way to hold a thread without spinning it, and it
 * needs a SharedArrayBuffer -- which node always has and a browser has only
 * when the page is cross-origin isolated.  Where there is none, waiting
 * costs a spin: the synchronous face already blocks whatever thread it is
 * on (that is what makes it synchronous), and hammering a service that has
 * just said "too fast" is the worse of the two.
 */
function defaultSleepSync (ms: number): void {
  if (ms <= 0)
    return;
  const SAB = (globalThis as any).SharedArrayBuffer;
  if (SAB && typeof Atomics !== "undefined" && typeof Atomics.wait === "function") {
    try {
      Atomics.wait(new Int32Array(new SAB(4)), 0, 0, ms);
      return;
    } catch (e) {
      // a context that has the constructor but not the wait (a main browser
      // thread): fall through and spin
    }
  }
  const until = Date.now() + ms;
  while (Date.now() < until)
    ; // eslint-disable-line no-empty
}

/**
 * A pace, and a search for the pace a service will bear.
 *
 * One of these belongs to one endpoint: two dbs pointed at the same service
 * should share one (pass it in) or they will each discover the limit
 * separately, and each other's requests will be what refuses them.
 */
export class RateLimiter {
  private opts: Required<Omit<RateLimitOptions,
    "is429" | "retryAfter" | "now" | "sleep" | "sleepSync">>;
  private is429: (e: any) => boolean;
  private retryAfter: (e: any) => number | null;
  private now: () => number;
  private sleep: (ms: number) => Promise<void>;
  private sleepSync: (ms: number) => void;

  /** requests per second right now; 0 is unlimited */
  rate: number;
  /** the fastest it may ever go: what the caller asked for */
  readonly ceiling: number;
  /** fastest rate known to work (0: nothing refused yet, so nothing learned) */
  good = 0;
  /** slowest rate known to be refused */
  bad = Infinity;
  /** requests made, and how many came back refused */
  requests = 0;
  refusals = 0;
  /** how many have succeeded since the rate last changed */
  private sinceChange = 0;
  /** ...and since anything was refused */
  private sinceRefusal = 0;
  /** what the next unexplained refusal waits */
  private cooldown: number;
  /** when the last request was let through */
  private last = -Infinity;

  constructor (options: RateLimitOptions = {}) {
    this.opts = Object.assign({}, DEFAULTS, {
      rate: options.rate === undefined ? DEFAULTS.rate : Number(options.rate),
      backoffRate: options.backoffRate === undefined ? DEFAULTS.backoffRate : Number(options.backoffRate),
      retries: options.retries === undefined ? DEFAULTS.retries : Number(options.retries),
      tolerance: options.tolerance === undefined ? DEFAULTS.tolerance : Number(options.tolerance),
      probeAfter: options.probeAfter === undefined ? DEFAULTS.probeAfter : Number(options.probeAfter),
      relaxAfter: options.relaxAfter === undefined ? DEFAULTS.relaxAfter : Number(options.relaxAfter),
      cooldown: options.cooldown === undefined ? DEFAULTS.cooldown : Number(options.cooldown),
      maxCooldown: options.maxCooldown === undefined ? DEFAULTS.maxCooldown : Number(options.maxCooldown),
    });
    this.is429 = options.is429 || looksLike429;
    this.retryAfter = options.retryAfter || retryAfterOf;
    this.now = options.now || (() => Date.now());
    this.sleep = options.sleep || (ms => new Promise(resolve => setTimeout(resolve, ms)));
    this.sleepSync = options.sleepSync || defaultSleepSync;
    this.rate = this.opts.rate > 0 ? this.opts.rate : 0;
    this.ceiling = this.rate > 0 ? this.rate : Infinity;
    this.cooldown = this.opts.cooldown;
  }

  /** what it has worked out so far */
  state (): RateLimitState {
    return {
      rate: this.rate, ceiling: this.ceiling, good: this.good, bad: this.bad,
      requests: this.requests, refusals: this.refusals, searching: this.searching(),
    };
  }

  /** Is there a faster rate worth trying?
   *
   * Room below whichever comes first: the rate the caller asked for, and the
   * slowest rate the service has refused.  With neither -- unlimited, and
   * nothing refused yet -- there is always room, which is what makes the
   * first probe a doubling: the upper bound has to be found before it can be
   * searched between. */
  searching (): boolean {
    if (!(this.rate > 0))
      return false;                     // already as fast as it can ask
    const target = Math.min(this.bad, this.ceiling);
    return target > this.rate * this.opts.tolerance;
  }

  /** how long until this request may go, in ms */
  private delay (): number {
    if (!(this.rate > 0))
      return 0;
    const gap = 1000 / this.rate;
    return Math.max(0, this.last + gap - this.now());
  }

  /** ...and the same when a service has just said to wait longer than that */
  private refused (e: any): number {
    ++this.refusals;
    this.sinceRefusal = 0;
    const asked = this.retryAfter(e);
    // What it will bear is below where we are: remember that, and drop.
    this.bad = Math.min(this.bad, this.rate > 0 ? this.rate : Infinity);
    // a rate that worked before and doesn't now was never the answer
    if (this.good >= this.rate)
      this.good = 0;
    const dropped =
      // nothing known: somewhere to start from, and work up
      !(this.rate > 0) ? this.opts.backoffRate
      // between what has worked and what has just been refused, which is the
      // same step the search takes upward
      : this.good > 0 ? Math.sqrt(this.good * this.rate)
      // nothing is known to work: halve, because the first refusal has no
      // idea how far off it is and a walk should not spend a hundred
      // requests finding out
      : this.rate / 2;
    this.setRate(Math.max(dropped, 0.001));
    const wait = asked === null ? this.cooldown : Math.min(asked, this.opts.maxCooldown);
    if (asked === null)
      this.cooldown = Math.min(this.cooldown * 2, this.opts.maxCooldown);
    return wait;
  }

  private setRate (rate: number): void {
    this.rate = Math.min(rate, this.ceiling);
    this.sinceChange = 0;
  }

  /** A request got through.  If enough of them have at this rate, and there
   * is room between here and the rate that was refused, try the middle:
   * success moves the floor up, another refusal brings the ceiling down, and
   * either way the gap halves. */
  private succeeded (): void {
    if (this.rate > 0)
      this.good = Math.max(this.good, this.rate);
    ++this.sinceRefusal;
    ++this.sinceChange;
    if (!this.searching()) {
      // Settled -- until the service has been letting requests through for
      // long enough that what it refused before is worth doubting.  Relaxing
      // the bound is what re-opens the search.
      if (this.bad < Infinity && this.sinceRefusal >= this.opts.relaxAfter) {
        this.bad = this.bad * 2;
        this.sinceRefusal = 0;
      }
      return;
    }
    if (this.sinceChange < this.opts.probeAfter)
      return;
    const ceiling = Math.min(this.bad, this.ceiling);
    // Halfway between here and there, geometrically: what is between one per
    // second and four is two, not two and a half.  With no upper bound yet
    // there is no halfway, so double until one turns up.
    this.setRate(ceiling === Infinity ? this.rate * 2 : Math.sqrt(this.rate * ceiling));
  }

  /** Make one request, waiting for its turn and answering a refusal by
   * slowing down and asking again.  Anything else is the caller's. */
  async run<T> (attempt: () => Promise<T>): Promise<T> {
    for (let tries = 0; ; ++tries) {
      const wait = this.delay();
      if (wait > 0)
        await this.sleep(wait);
      this.last = this.now();
      ++this.requests;
      try {
        const answer = await attempt();
        this.succeeded();
        return answer;
      } catch (e) {
        if (!this.is429(e) || tries >= this.opts.retries)
          throw e;
        const cool = this.refused(e);
        if (cool > 0)
          await this.sleep(cool);
      }
    }
  }

  /** the same, for the transport that blocks */
  runSync<T> (attempt: () => T): T {
    for (let tries = 0; ; ++tries) {
      const wait = this.delay();
      if (wait > 0)
        this.sleepSync(wait);
      this.last = this.now();
      ++this.requests;
      try {
        const answer = attempt();
        this.succeeded();
        return answer;
      } catch (e) {
        if (!this.is429(e) || tries >= this.opts.retries)
          throw e;
        const cool = this.refused(e);
        if (cool > 0)
          this.sleepSync(cool);
      }
    }
  }
}
