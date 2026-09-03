/** Every workspace package must declare the packages its shipped code
 * requires.  Workspace hoisting masks omissions locally but breaks npm
 * consumers -- e.g. @shexjs/cli@1.0.0-alpha.29 was published requiring
 * @shexjs/neighborhood-sparql without declaring it, so `npx shex-validate`
 * crashed for anyone who installed it.
 */
"use strict";

const expect = require("chai").expect;
const Fs = require("fs");
const Path = require("path");
const builtins = new Set(require("module").builtinModules);

const packagesDir = Path.join(__dirname, "../..");
// untracked files can't ship in a published tarball, so don't audit them
let trackedFiles = null;
try {
  trackedFiles = new Set(
    require("child_process")
      .execSync("git ls-files -z", {cwd: packagesDir, encoding: "utf8"})
      .split("\0").filter(Boolean)
  );
} catch (e) { // not a git checkout; audit everything
}
const isTracked = (path) =>
      trackedFiles === null
      || trackedFiles.has(Path.relative(packagesDir, path).split(Path.sep).join("/"));
// not part of the shipped runtime code:
const SKIP_DIRS = new Set(["test", "node_modules", "doc", "examples", "browser", "webpacks", "coverage", "tools"]);
const isBuildConfig = (name) => /\.config\.js$/.test(name);
/** a package's webpack entry files: build inputs like the config, unless one is also the package's main */
const bundleEntries = (dir, manifest) => {
  const config = Path.join(dir, "webpack.config.js");
  if (!Fs.existsSync(config))
    return new Set();
  const entry = (Fs.readFileSync(config, "utf8").match(/entry:\s*\{[^}]*\}/) || [""])[0];
  const main = Path.basename(manifest.main || "");
  return new Set([...entry.matchAll(/"\.\/([\w.-]+\.js)"/g)].map(m => m[1]).filter(f => f !== main));
};

describe("workspace packages", function () {
  Fs.readdirSync(packagesDir).forEach(dir => {
    const manifestPath = Path.join(packagesDir, dir, "package.json");
    if (!Fs.existsSync(manifestPath))
      return;
    const manifest = JSON.parse(Fs.readFileSync(manifestPath, "utf8"));

    it(manifest.name + " should declare every package its shipped code requires", function () {
      const declared = new Set([
        ...Object.keys(manifest.dependencies || {}),
        ...Object.keys(manifest.peerDependencies || {}),
        ...Object.keys(manifest.optionalDependencies || {}),
        manifest.name,
      ]);
      const missing = new Set();
      const entries = bundleEntries(Path.join(packagesDir, dir), manifest);
      (function walk (d) {
        Fs.readdirSync(d, {withFileTypes: true}).forEach(entry => {
          if (entry.isDirectory()) {
            if (!SKIP_DIRS.has(entry.name))
              walk(Path.join(d, entry.name));
          } else if (isBuildConfig(entry.name) || (d === Path.join(packagesDir, dir) && entries.has(entry.name))) {
            // webpack et al. run from the repo root with root devDependencies;
            // a bundle's entry file is read by webpack, not required by anyone
          } else if (/\.(js|cjs)$/.test(entry.name) || (d.endsWith(Path.sep + "bin") && !/\./.test(entry.name))) {
            if (!isTracked(Path.join(d, entry.name)))
              return;
            const src = Fs.readFileSync(Path.join(d, entry.name), "utf8");
            // A header comment showing how to use the module is documentation,
            // not a dependency: skip a match whose line starts a comment.  A
            // require after code on the same line as a trailing comment would
            // still count, which is the right way round to be wrong.
            const inComment = (at) => {
              const bol = src.lastIndexOf("\n", at) + 1;
              return /^\s*(\*|\/\/|\/\*)/.test(src.slice(bol, at));
            };
            for (const m of src.matchAll(/require\s*\(\s*["']([^"'.][^"']*)["']\s*\)/g)) {
              if (inComment(m.index))
                continue;
              let name = m[1].replace(/^node:/, "");
              name = name.startsWith("@") ? name.split("/").slice(0, 2).join("/") : name.split("/")[0];
              if (!builtins.has(name) && !declared.has(name))
                missing.add(name + " (" + Path.relative(packagesDir, Path.join(d, entry.name)) + ")");
            }
          }
        });
      })(Path.join(packagesDir, dir));
      expect([...missing]).to.deep.equal([]);
    });
  });
});
