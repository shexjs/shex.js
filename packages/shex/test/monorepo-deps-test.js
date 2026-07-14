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
// not part of the shipped runtime code:
const SKIP_DIRS = new Set(["test", "node_modules", "doc", "examples", "browser", "webpacks", "coverage", "tools"]);
const isBuildConfig = (name) => /\.config\.js$/.test(name);

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
      (function walk (d) {
        Fs.readdirSync(d, {withFileTypes: true}).forEach(entry => {
          if (entry.isDirectory()) {
            if (!SKIP_DIRS.has(entry.name))
              walk(Path.join(d, entry.name));
          } else if (isBuildConfig(entry.name)) {
            // webpack et al. run from the repo root with root devDependencies
          } else if (/\.(js|cjs)$/.test(entry.name) || (d.endsWith(Path.sep + "bin") && !/\./.test(entry.name))) {
            const src = Fs.readFileSync(Path.join(d, entry.name), "utf8");
            for (const m of src.matchAll(/require\s*\(\s*["']([^"'.][^"']*)["']\s*\)/g)) {
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
