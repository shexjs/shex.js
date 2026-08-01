#!/usr/bin/env node
/** bumpVersions.js - set every workspace package to a new version and point
 * every cross-workspace dependency range at it.  Successor to `lerna version`
 * in fixed-versioning mode (all packages share one version line).
 *
 *   node tools/bumpVersions.js [--dry-run] 1.0.0-alpha.30
 *
 * Follow with `npm install` (to sync package-lock.json), run the tests,
 * commit, tag v<version>, and `npm publish --workspaces`.
 */
"use strict";

const Fs = require("fs");
const Path = require("path");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const newVersion = args.filter(a => a !== "--dry-run")[0];
if (!newVersion || !/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(newVersion)) {
  console.error("usage: node tools/bumpVersions.js [--dry-run] <semver version>");
  process.exit(1);
}

const root = Path.join(__dirname, "..");
const rootManifest = JSON.parse(Fs.readFileSync(Path.join(root, "package.json"), "utf8"));
const manifestPaths = rootManifest.workspaces.packages
      .flatMap(pattern => { // supports the "<dir>/*" patterns this repo uses
        const dir = Path.join(root, Path.dirname(pattern));
        return Fs.readdirSync(dir).map(entry => Path.join(dir, entry, "package.json"));
      })
      .filter(p => Fs.existsSync(p));

// first pass: learn every workspace package name
const workspaceNames = new Set(manifestPaths.map(
  p => JSON.parse(Fs.readFileSync(p, "utf8")).name));

// second pass: bump versions and cross-workspace ranges
manifestPaths.forEach(manifestPath => {
  const manifest = JSON.parse(Fs.readFileSync(manifestPath, "utf8"));
  const changes = [`version ${manifest.version} -> ${newVersion}`];
  manifest.version = newVersion;
  ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"].forEach(section => {
    Object.keys(manifest[section] || {}).forEach(dep => {
      if (workspaceNames.has(dep) && manifest[section][dep] !== "^" + newVersion) {
        changes.push(`${dep} ${manifest[section][dep]} -> ^${newVersion}`);
        manifest[section][dep] = "^" + newVersion;
      }
    });
  });
  console.log(`${manifest.name}: ${changes.join(", ")}`);
  if (!dryRun)
    Fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
});

console.log(dryRun
  ? "\n(dry run: nothing written)"
  : "\nNow run: npm install && npm run test-all, then commit, tag, and `npm publish --workspaces`.");
