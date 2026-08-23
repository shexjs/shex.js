/** The apps are four pages -- shex-simple, shex-worker and the two map
 * pages -- and they used to carry four copies of the same stylesheet.  That
 * is how the shape map lost its left padding on three of them: the fix was
 * made once, in the page whose author noticed.  They share the stylesheet
 * now, and this checks they still do, and that a page's own <style> holds
 * only what is actually its own.
 */
"use strict";

const Fs = require("fs");
const Path = require("path");
const expect = require("chai").expect;

const shared = "shex-app.css";
const pages = [
  {file: "../doc/shex-simple.html", href: shared},
  {file: "../doc/shex-worker.html", href: shared},
  {file: "../../extension-map/doc/shexmap-simple.html", href: "../../shex-webapp/doc/" + shared},
  {file: "../../extension-map/doc/shexmap-worker.html", href: "../../shex-webapp/doc/" + shared},
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

  /* doc/extension-ui-plan.md: what ShExMap adds to a page is ShExMap's to
   * say, so the map pages carry none of it -- no panes, no controls, no
   * results panel, and no app class of their own.  This is the check that
   * the port did not quietly leave something behind in the markup. */
  it("should keep ShExMap's own markup out of the map pages", () => {
    const mapPages = pages.filter(p => p.file.includes("shexmap"));
    expect(mapPages.length).to.equal(2);
    for (const {file} of mapPages) {
      const text = read(file);
      for (const id of ["bindings1", "staticVars", "outputSchema", "materialize",
                        "outputShapeMap", "debugControls", "dbgStatus", "dbgThreads",
                        "resultsTabs", "validationResults", "materializationResults"])
        expect(text, file + " leaves " + id + " to the extension")
          .to.not.include('id="' + id + '"');
    }
    // ...and they run the plain apps: no ShExMap class at all
    expect(read("../../extension-map/doc/shexmap-simple.html"))
      .to.include("new ShExApp(DefaultBase)");
    const worker = read("../../extension-map/doc/shexmap-worker.html");
    expect(worker).to.include("new ShExInWorkerApp(DefaultBase)");
    // including in the worker: the base thread, told which extensions to load
    expect(worker).to.include('WorkerUrl = "../../shex-webapp/doc/ShExWorkerThread.js"');
    expect(worker, "no worker script of its own").to.not.include("new Worker(\"ShExMap");
  });

  /* A dead rule is worse than no rule: `#shapeMap { padding-left: .25em }
   * sat here commented "doesn't exist" until an id was renamed to match,
   * whereupon it silently took effect and overrode the padding above. */
  it("should have no rule for an id no page has", () => {
    const ids = new Set();
    for (const {file} of pages)
      for (const m of read(file).matchAll(/\bid="([^"]+)"/g))
        ids.add(m[1]);
    // ids the apps create as they go count as had -- including the ones an
    // extension declares, which is where a page's controls come from now
    for (const js of ["../doc/ShExBaseApp.js",
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
