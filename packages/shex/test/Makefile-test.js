/** The root Makefile's package table agrees with the package.json files. */
"use strict";
const expect = require("chai").expect;
const Fs = require("fs");
const Path = require("path");
const {packages} = require("../../../tools/publish-ordered.js");

const ROOT = Path.join(__dirname, "../../..");

/** [{dir, output, upstream}] from the `$(eval $(call package,…))` lines, in order. */
function makefileTable () {
  const text = Fs.readFileSync(Path.join(ROOT, "Makefile"), "utf8").replace(/\\\n/g, " ");
  return [...text.matchAll(/^\$\(eval \$\(call package,([^)]*)\)\)\s*$/mg)].map(m => {
    const [dir, output, upstream] = m[1].split(",").map(s => s.trim());
    return {dir, output, upstream: upstream ? upstream.split(/\s+/).sort() : []};
  });
}

describe("the Makefile's package table", function () {
  const table = makefileTable();
  const byDir = new Map(table.map(row => [row.dir, row]));
  const tsPackages = packages()
        .map(p => Object.assign(p, {short: Path.basename(p.dir)}))
        .filter(p => Fs.existsSync(Path.join(ROOT, p.dir, "src")));
  const shortName = new Map(packages().map(p => [p.name, Path.basename(p.dir)]));

  it("should list every package with a src/ once", function () {
    expect(table.map(row => row.dir).sort()).to.deep.equal(tsPackages.map(p => p.short).sort());
  });

  it("should name each package's main as its output, when main is in lib/", function () {
    tsPackages.forEach(p => {
      const main = JSON.parse(Fs.readFileSync(Path.join(ROOT, p.dir, "package.json"), "utf8")).main;
      if (main && main.startsWith("./lib/"))
        expect(byDir.get(p.short).output, p.short).to.equal(main.slice("./lib/".length));
    });
  });

  it("should list exactly each package's runtime workspace dependencies", function () {
    tsPackages.forEach(p => expect(byDir.get(p.short).upstream, p.short)
                       .to.deep.equal(p.deps.map(n => shortName.get(n)).sort()));
  });

  it("should put each package after its upstream packages", function () {
    const at = new Map(table.map((row, i) => [row.dir, i]));
    table.forEach(row => row.upstream.forEach(u =>
      expect(at.get(u), `${row.dir} lists ${u}, which must come first`).to.be.below(at.get(row.dir))));
  });

  it("should see every source: src/ has no subdirectories but the page-script ones", function () {
    const pageScriptDirs = ["packages/shex-webapp/src/app", "packages/extension-map/src/plugin"];
    tsPackages.forEach(p => {
      const src = Path.join(ROOT, p.dir, "src");
      Fs.readdirSync(src, {withFileTypes: true}).filter(e => e.isDirectory()).forEach(e =>
        expect(pageScriptDirs, `${p.dir}/src/${e.name}/ is not matched by $(wildcard …/src/*.ts)`)
          .to.include(Path.relative(ROOT, Path.join(src, e.name))));
    });
  });
});
