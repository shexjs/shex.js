/**
 * The app page under jsdom, booted the way every browser suite boots it.
 *
 *   const Harness = require("./harness");
 *   ({dom, $, shared} = await Harness.boot("packages/shex-webapp/doc/shex-simple.html", "?editors=1"));
 *   $("#validate").trigger("click");
 *   await shared.promise;               // the app's settled(): everything it started
 *
 * What a page needs that jsdom does not give it, said once: the pinned
 * cdnjs script served from the local copy, `CSS.escape` for jquery-ui,
 * the `Range` measurements CodeMirror asks for on every frame, Node's fetch
 * as the page's `fetch`, and the `_testCallback` the app calls once it has
 * built itself.  `options.worker` gives the page a fake Worker
 * (fakeWorker.js): `true` for one that resolves URLs against this repo's
 * server, or the `[{prefix, dir}]` list it should resolve against.
 * `options.trust` names the origins whose plugins may load without the
 * page asking (doc/plugins.md, "Trust").
 *
 * What the page, its fake worker and jsdom say is captured, not printed: a
 * run that passes is quiet.  When a test fails, everything said since the
 * previous test ended is printed under its name; when one passes, only the
 * errors it did not expect are -- declare those with
 * `Harness.expectConsole(/pattern/, ...)` in the test that provokes them.
 * `console.debug` (the app's channel for user-input errors) and jsdom's
 * "Not implemented: navigation" (a test that sets location) are dropped;
 * VERBOSE=1 prints everything as it happens.  Every `console.error` and
 * jsdom error is also kept in the returned `errors`, for a suite that wants
 * to assert it made none:
 * `Harness.expectClean(errors)` fails on any it does not know to be noise
 * -- jsdom's "Not implemented" for what it does not do, CodeMirror's
 * measure loop asking a layout-less document for getClientRects -- and
 * takes the patterns a suite expects on top (`expectClean(errors,
 * [/no such thing/])`).
 */
"use strict";

const Fs = require("fs");
const Path = require("path");
const Util = require("util");
const jsdom = require("jsdom");
const {makeWorkerClass} = require("./fakeWorker");

const ROOT = Path.join(__dirname, "../../..");
const [[RepoServer]] = require("../../../tools/testServer")
      .startServer([{url: "http://localhost:9999/shex.js/", fromDir: ROOT}]);

/** subresources jsdom would fetch from the network, served from a local copy */
const StaticResources = {
  "https://cdnjs.cloudflare.com/ajax/libs/jquery-csv/1.0.21/jquery.csv.js":
    Path.join(__dirname, "static/jquery.csv-1.0.21.js"),
};
const ResourceConfig = {
  interceptors: [
    jsdom.requestInterceptor((request, _context) => {
      if (request.url in StaticResources)
        return new Response(Fs.readFileSync(StaticResources[request.url], "utf8"),
                            {headers: {"Content-Type": "text/javascript"}});
    }),
  ],
};

/**
 * @param page repo-relative path of the page (packages/shex-webapp/doc/shex-simple.html)
 * @param search the query string, "?" included
 * @param options.worker `true` or `[{prefix, dir}]`: give the page a fake Worker
 * @param options.trust origins whose plugins load without asking
 * @param options.server what `urlFor` the page's URL is made with (default: this repo's)
 * @returns {dom, window, $, shared, app, errors}
 */
async function boot (page, search = "", options = {}) {
  const server = options.server || RepoServer;
  const base = Path.join(ROOT, page);
  const errors = [];
  const virtualConsole = pageConsole(errors);
  const jsdomOptions = {
    url: server.urlFor(page + search),
    runScripts: "dangerously",
    resources: ResourceConfig,
    pretendToBeVisual: true,          // CodeMirror needs rAF etc.
    virtualConsole,
  };
  jsdomOptions.beforeParse = window => {
    if (options.worker)
      // the page's head script runs new Worker("ShExWorkerThread.js"); the
      // fake resolves a plugin's worker half, named by URL, through this map
      window.Worker = makeWorkerClass(Path.dirname(base), {console: WorkerConsole}, options.worker === true
        ? [{prefix: server.urlFor(""), dir: ROOT}] : options.worker);
    // a plugin from another origin is put to the reader before it loads;
    // a suite that boots with one has answered, the way a reader who said
    // "and any more from this site" has
    if (options.trust)
      window.sessionStorage.setItem("shex-plugin-origins", JSON.stringify(options.trust));
  };
  const dom = new jsdom.JSDOM(Fs.readFileSync(base, "utf8"), jsdomOptions);
  // looked up at each call, not once: nock intercepts by replacing
  // globalThis.fetch when it is first required, which may be after this file
  dom.window.fetch = (...args) => globalThis.fetch(...args);
  // jsdom lacks the CSS namespace; jquery-ui >= 1.14 calls CSS.escape
  if (!dom.window.CSS)
    dom.window.CSS = {escape: s => String(s).replace(/[^a-zA-Z0-9_ -￿-]/g, c => `\\${c}`)};
  // jsdom does no layout and omits these Range methods; CodeMirror's
  // measure loop calls them on every frame and handles empty results
  dom.window.Range.prototype.getClientRects = function () { return []; };
  dom.window.Range.prototype.getBoundingClientRect =
    function () { return {x: 0, y: 0, top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0}; };
  const shared = await new Promise((resolve, reject) => {
    dom.window._testCallback = parm => parm instanceof Error ? reject(parm) : resolve(parm);
  });
  await shared.promise;               // drag-and-drop init + search-parameter loads
  return {dom, window: dom.window, $: dom.window.$, shared, app: shared.app, errors};
}

/** pick a schema entry and a data entry by their labels in the manifest lists */
async function pick ($, shared, schemaLabel, dataLabel) {
  $("#inputSchema .manifest li").filter((i, li) => $(li).text() === schemaLabel).first().trigger("click");
  await shared.promise;
  if (dataLabel !== undefined) {
    $("#inputData .passes li, #inputData .fails li, #inputData .indeterminant li")
      .filter((i, li) => $(li).text() === dataLabel).first().trigger("click");
    await shared.promise;
  }
}

/** press validate and wait for the app to settle */
async function validate ($, shared) {
  $("#validate").trigger("click");
  await shared.promise;
}

/* ---- what the page said ---------------------------------------------- */

/** the page console's methods worth keeping, and how loud each is */
const ConsoleLevels = {log: "log", info: "log", dir: "log", table: "log",
                       warn: "warn", error: "error", trace: "error", assert: "error"};

/** everything said since the last test ended: {level, source, text} */
const Said = [];
/** the patterns the current test said it expects among the errors */
let Expected = [];

function say (level, source, text) {
  Said.push({level, source, text});
  if (process.env.VERBOSE)
    console.error(`[${source}] ${text}`);
}

/**
 * A jsdom console that records what a page says (see the header): for
 * `boot`, and for a suite that builds its own JSDOM.  `errors` collects the
 * page's console.error arguments and jsdom's errors, for `expectClean`.
 */
function pageConsole (errors = []) {
  const virtualConsole = new jsdom.VirtualConsole();
  for (const method of Object.keys(ConsoleLevels))
    virtualConsole.on(method, (...args) => say(ConsoleLevels[method], "page", Util.format(...args)));
  virtualConsole.on("jsdomError", e => {
    if (String(e.message).includes("Not implemented: navigation"))
      return;
    errors.push(e);
    say("error", "jsdom", e.type === "unhandled-exception" ? e.cause.stack : e.message);
  });
  virtualConsole.on("error", (...args) => errors.push(args));
  return virtualConsole;
}

/** the fake worker's console: the worker says things into the same record */
const WorkerConsole = Object.fromEntries(Object.entries(ConsoleLevels).map(
  ([method, level]) => [method, (...args) => say(level, "worker", Util.format(...args))]));

/** errors this test provokes on purpose: they are not printed when it passes */
function expectConsole (...patterns) {
  Expected.push(...patterns);
}

// Registered once, when the first suite requires this file: say what the
// page said when that matters -- all of it for a failed test, the
// unexpected errors for a passing one -- and start the next test afresh.
if (typeof afterEach === "function")
  afterEach(function () {
    const test = this.currentTest;
    const failed = !!test && test.state === "failed";
    const shown = failed
      ? Said
      : Said.filter(s => s.level === "error" && !NOISE.concat(Expected).some(p => p.test(s.text)));
    if (shown.length && !process.env.VERBOSE)
      process.stderr.write(`\n  ${failed ? "what the page said" : "unexpected console errors"}`
                           + ` in "${test ? test.fullTitle() : "?"}":\n`
                           + shown.map(s => `    [${s.source}] ` + s.text.replace(/\n/g, "\n      ")).join("\n") + "\n");
    Said.length = 0;
    Expected = [];
  });

/** what jsdom and CodeMirror say under jsdom that no browser would */
const NOISE = [
  /Not implemented:/,                 // jsdom, for what it does not do
  /getClientRects/,                   // CodeMirror's measure loop, with no layout to measure
];

/** the text of one entry of `errors`: a jsdom error or console.error's arguments */
function errorText (entry) {
  if (Array.isArray(entry))
    return entry.map(a => a instanceof Error ? (a.stack || a.message) : String(a)).join(" ");
  return entry instanceof Error ? (entry.stack || entry.message) : String(entry);
}

/** the errors a boot or a test left that neither jsdom's noise nor `allow` accounts for */
function unexpectedErrors (errors, allow = []) {
  return (errors || []).map(errorText)
    .filter(text => !NOISE.concat(allow).some(pattern => pattern.test(text)));
}

/** fail on any error that was not expected; the failure lists them */
function expectClean (errors, allow = []) {
  const unexpected = unexpectedErrors(errors, allow);
  if (unexpected.length)
    throw new Error("unexpected console errors:\n  " + unexpected.map(e => e.split("\n")[0]).join("\n  "));
}

module.exports = {boot, pick, validate, expectClean, expectConsole, pageConsole, unexpectedErrors, RepoServer, StaticResources};
