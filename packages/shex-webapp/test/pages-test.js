/** The apps were four pages -- shex-simple, shex-worker and the two map
 * pages -- and they used to carry four copies of the same stylesheet.  That
 * is how the shape map lost its left padding on three of them: the fix was
 * made once, in the page whose author noticed.
 *
 * They are two now: ShExMap is a plugin, and the map pages are the
 * redirects that open a page with it (doc/plugins.md).
 * This checks that the two share the stylesheet, that a page's own <style>
 * holds only what is actually its own, and that the redirects still answer
 * for the URLs they published.
 */
"use strict";

/** the app, as the pages load it: one classic script per concern, in order */
const APP_FILES = ["ShExAppCommon.js", "ShExCaches.js", "ShExShapeMapCache.js", "ShExNeighborhoodConfig.js", "ShExEditorSupport.js", "ShExBaseApp.js", "ShExBaseApp-plugins.js", "ShExBaseApp-validation.js", "ShExBaseApp-links.js", "ShExBaseApp-layout.js"];

const Fs = require("fs");
const Path = require("path");
const vm = require("vm");
const expect = require("chai").expect;

const shared = "shex-app.css";
const pages = [
  {file: "../doc/shex-simple.html", href: shared},
];
// the map pages, redirecting to the app page with ShExMap; the worker one
// says worker=1, as the app's own old worker page does
const redirects = [
  {file: "../../extension-map/doc/shexmap-simple.html", to: "shex-simple.html"},
  {file: "../../extension-map/doc/shexmap-worker.html", to: "shex-simple.html", worker: true},
];
const read = f => Fs.readFileSync(Path.join(__dirname, f), "utf8");

describe("the app pages", () => {
  const stylesheet = read("../doc/" + shared);

  it("should all link the one stylesheet", () => {
    for (const {file, href} of pages)
      expect(read(file), file).to.include('<link rel="stylesheet" href="' + href + '"');
  });

  /* The rules a page keeps are the ones that are true of that page and not
   * of the others.  Anything else belongs in the shared sheet, where every
   * page gets it -- including the next fix somebody makes. */
  it("should keep only their own rules to themselves", () => {
    for (const {file} of pages) {
      const own = read(file).match(/<style>([\s\S]*?)<\/style>/);
      expect(own, file + " has a <style>").to.exist;
      const selectors = own[1].split("\n")
            .map(line => line.replace(/\/\*[\s\S]*?\*\//g, "").trim())
            .filter(line => line.includes("{"))
            .map(line => line.substring(0, line.indexOf("{")).trim());
      expect(selectors.length, file + " keeps little to itself").to.be.below(4);
      for (const selector of selectors)
        expect(["#inputarea", "#bindings1 textarea, .meta", "#bindings1 li.selected"],
               file + " keeps " + selector).to.include(selector);
    }
  });

  it("should say the palette and the padding once, in the shared sheet", () => {
    // the fix that started this: every page's shape map gets it now
    expect(stylesheet).to.include("#queryMap { padding-left: .4em }");
    for (const colour of ["#f4f4ff", "#f4fff4", "#fffff4"])
      expect(stylesheet, colour).to.include(colour);
    for (const {file} of pages) {
      const own = read(file).match(/<style>([\s\S]*?)<\/style>/)[1];
      expect(own, file + " leaves the padding to the shared sheet").to.not.include("#queryMap");
    }
  });

  /* What ShExMap adds to a page is ShExMap's to
   * say, so no page says any of it -- no panes, no controls, no results
   * panel, no app class, no worker script.  This is the check that the port
   * did not quietly leave something behind in the markup. */
  it("should keep ShExMap out of every page", () => {
    for (const {file} of pages.concat(redirects)) {
      const text = read(file);
      for (const id of ["bindings1", "staticVars", "outputSchema", "materialize",
                        "outputShapeMap", "debugControls", "dbgStatus", "dbgThreads",
                        "resultsTabs", "validationResults", "materializationResults"])
        expect(text, file + " leaves " + id + " to the plugin")
          .to.not.include('id="' + id + '"');
      expect(text, file + " has no app class of ShExMap's").to.not.include("ShExMapIn");
      expect(text, file + " has no worker script of ShExMap's")
        .to.not.include('new Worker("ShExMap');
    }
  });

  /* The map pages' URLs are published, so they answer for them: they open
   * an app page with ?plugin= naming ShExMap and carry whatever they
   * were asked for.  A parameter is relative to the page it was written
   * for, so the redirect makes URLs absolute on the way. */
  it("should redirect the map pages to an app page with the plugin", () => {
    for (const {file, to, worker} of redirects) {
      const text = read(file);
      expect(text, file).to.include('redirectToPlugin("../../shex-webapp/doc/' + to + '"');
      expect(text, file + " names ShExMap").to.include('"./ShExMapPlugin.js"');
      expect(text, file + " keeps the manifest it always opened with")
        .to.include('"../examples/manifest.json"');
      expect(text.includes('{worker: "1"}'), file + (worker ? " asks for the worker" : " does not"))
        .to.equal(!!worker);
    }
  });

  /* shex-worker.html is a published URL too; the worker app is the one
   * page with ?worker=1, and whatever the old page was asked for carries. */
  it("should redirect the old worker page to the app page with worker=1", () => {
    const from = "http://x.example/packages/shex-webapp/doc/shex-worker.html";
    const search = "?editors=1&manifestURL=..%2Fexamples%2Fmanifest.yaml";
    const sandbox = {URL, URLSearchParams,
                     location: {href: from + search, search, replace (to) { sandbox.went = to; }}};
    vm.createContext(sandbox);
    const script = read("../doc/shex-worker.html").match(/<script>([\s\S]*?)<\/script>/)[1];
    vm.runInContext(script, sandbox);
    const to = new URL(sandbox.went);
    expect(to.pathname).to.equal("/packages/shex-webapp/doc/shex-simple.html");
    expect(to.searchParams.get("worker")).to.equal("1");
    expect(to.searchParams.get("editors"), "carried").to.equal("1");
    expect(to.searchParams.get("manifestURL"), "as written: same directory").to.equal("../examples/manifest.yaml");
  });

  /** where shexmap-simple.html sends a reader who arrived with `search` */
  function redirected (search) {
    const from = "http://x.example/packages/extension-map/doc/shexmap-simple.html";
    const sandbox = {
      URL, URLSearchParams,
      location: {href: from + search, search, replace (to) { sandbox.went = to; }},
    };
    vm.createContext(sandbox);
    vm.runInContext(read("../../extension-map/doc/redirect-to-plugin.js") +
                    "\nredirectToPlugin('../../shex-webapp/doc/shex-simple.html'," +
                    " './ShExMapPlugin.js', '../examples/manifest.json');", sandbox);
    return new URL(sandbox.went);
  }

  it("should open the app page with ShExMap and the manifest it always had", () => {
    const to = redirected("");
    expect(to.pathname).to.equal("/packages/shex-webapp/doc/shex-simple.html");
    expect(to.searchParams.get("plugin")).to.equal(
      "http://x.example/packages/extension-map/doc/ShExMapPlugin.js");
    expect(to.searchParams.get("manifestURL")).to.equal(
      "http://x.example/packages/extension-map/examples/manifest.json");
  });

  /* A bookmark says what it wanted; a URL in it meant something relative to
   * the page it was written for, and that page is not where this is going. */
  it("should carry what it was asked for, and absolutize the URLs in it", () => {
    const to = redirected("?editors=1&manifestURL=../examples/manifest.yaml&schema=" +
                          encodeURIComponent("PREFIX : <http://a.example/>"));
    expect(to.searchParams.get("editors"), "verbatim").to.equal("1");
    expect(to.searchParams.get("schema"), "verbatim, ../ or not")
      .to.equal("PREFIX : <http://a.example/>");
    expect(to.searchParams.get("manifestURL"), "resolved where it was written")
      .to.equal("http://x.example/packages/extension-map/examples/manifest.yaml");
    expect(to.searchParams.getAll("manifestURL").length, "and not twice").to.equal(1);
    expect(to.searchParams.get("plugin"), "with ShExMap still named").to.equal(
      "http://x.example/packages/extension-map/doc/ShExMapPlugin.js");
  });


  /* A dead rule is worse than no rule: `#shapeMap { padding-left: .25em }
   * sat here commented "doesn't exist" until an id was renamed to match,
   * whereupon it silently took effect and overrode the padding above. */
  it("should have no rule for an id no page has", () => {
    const ids = new Set();
    for (const {file} of pages)
      for (const m of read(file).matchAll(/\bid="([^"]+)"/g))
        ids.add(m[1]);
    // ids the apps create as they go count as had -- including the ones a
    // plugin declares, which is where a page's controls come from now
    for (const js of [...APP_FILES.map(f => "../doc/" + f),
                      "../../extension-map/doc/ShExMapPlugin.js"])
      // including the ones written into markup the app builds as strings
      for (const m of read(js).matchAll(/\b(?:id|contentId): ?"([^"]+)"|attr\("id", ?"([^"]+)"|id=\\?"([^"\\]+)/g))
        ids.add(m[1] || m[2] || m[3]);
    const selectors = stylesheet.replace(/\/\*[\s\S]*?\*\//g, "")
          .split("}").map(rule => rule.substring(0, rule.indexOf("{")));
    const orphans = [];
    for (const selector of selectors)
      for (const m of selector.matchAll(/#([A-Za-z][\w-]*)/g))
        if (!ids.has(m[1]))
          orphans.push("#" + m[1]);
    expect([...new Set(orphans)], "styled, but no page has it").to.deep.equal([]);
  });
});
