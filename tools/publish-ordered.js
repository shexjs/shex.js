#!/usr/bin/env node
/**
 * Publish the workspace packages in dependency order.
 *
 * `npm publish --workspaces` publishes in directory order, so for a while
 * the registry holds @shexjs/cli@N wanting @shexjs/util@N, which is not
 * there yet: anyone installing in that window gets an unsatisfiable range.
 * Publishing a package only after everything it depends on has gone up
 * closes the window.  Same command, same publishConfig, just ordered.
 *
 *   node tools/publish-ordered.js --list            # the order, and nothing else
 *   node tools/publish-ordered.js --dry-run         # npm publish --dry-run, in order
 *   node tools/publish-ordered.js --tag latest [--otp 123456]   # alphas have always been `latest`
 *
 * A package whose version the registry already has is skipped: the ones on
 * version lines of their own (root package.json's `shexjs.independent`)
 * publish only when their version moved.
 */
"use strict";

const Fs = require("fs");
const Path = require("path");
const {execFileSync} = require("child_process");

const ROOT = Path.join(__dirname, "..");

/** every workspace package: {name, dir, version, private, deps: [names of workspace packages it depends on]} */
function packages () {
  const root = JSON.parse(Fs.readFileSync(Path.join(ROOT, "package.json"), "utf8"));
  const dirs = [].concat(root.workspaces && root.workspaces.packages || root.workspaces || [])
        .flatMap(pattern => {
          const [dir, star] = pattern.split("/");
          return star === "*"
            ? Fs.readdirSync(Path.join(ROOT, dir)).map(d => Path.join(dir, d))
            : [pattern];
        })
        .filter(d => Fs.existsSync(Path.join(ROOT, d, "package.json")));
  const all = dirs.map(dir => {
    const m = JSON.parse(Fs.readFileSync(Path.join(ROOT, dir, "package.json"), "utf8"));
    return {name: m.name, dir, version: m.version, private: !!m.private,
            wants: Object.keys(Object.assign({}, m.dependencies, m.peerDependencies, m.optionalDependencies))};
  });
  const names = new Set(all.map(p => p.name));
  all.forEach(p => { p.deps = p.wants.filter(n => names.has(n)).sort(); delete p.wants; });
  return all.sort((a, b) => a.name < b.name ? -1 : 1);
}

/** the packages in an order where each comes after everything it depends on */
function order (pkgs = packages()) {
  const byName = new Map(pkgs.map(p => [p.name, p]));
  const done = new Set(), out = [];
  let pending = pkgs.slice();
  while (pending.length) {
    const ready = pending.filter(p => p.deps.every(d => done.has(d)));
    if (ready.length === 0)
      throw Error("dependency cycle among: " + pending.map(p => p.name).join(", "));
    ready.forEach(p => { done.add(p.name); out.push(p); });
    pending = pending.filter(p => !done.has(p.name));
  }
  return out.map(p => byName.get(p.name));
}

/** does the registry have this version of the package already? */
function published (p) {
  try {
    return execFileSync("npm", ["view", `${p.name}@${p.version}`, "version"], {cwd: ROOT, stdio: "pipe"})
      .toString().trim() === p.version;
  } catch (e) {
    return false;             // 404: not there, or not at this version
  }
}

function main (argv) {
  const list = argv.includes("--list");
  const passThrough = argv.filter(a => a !== "--list");
  const ordered = order().filter(p => !p.private);
  // npm 11 refuses a prerelease version with no --tag (it would have gone
  // to `latest`, which is where this repository's alphas have always gone);
  // say so before anything is published, not after the first package
  if (!list && !passThrough.includes("--tag") && !passThrough.some(a => a.startsWith("--tag="))
      && ordered.some(p => /-/.test(p.version)))
    throw Error("prerelease versions to publish: say which dist-tag, --tag latest (as before) or --tag next");
  ordered.forEach((p, i) => console.log(`${String(i + 1).padStart(2)}. ${p.name}@${p.version}`
                                        + (p.deps.length ? `  (after ${p.deps.join(", ")})` : "")));
  if (list)
    return;
  for (const p of ordered) {
    if (published(p)) {
      console.log(`\n=== ${p.name}@${p.version} is on the registry already; skipped`);
      continue;
    }
    console.log(`\n=== npm publish -w ${p.name} ${passThrough.join(" ")}`);
    execFileSync("npm", ["publish", "-w", p.name, ...passThrough], {cwd: ROOT, stdio: "inherit"});
  }
}

module.exports = {packages, order};
if (require.main === module)
  main(process.argv.slice(2));
