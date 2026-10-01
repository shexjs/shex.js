#!/usr/bin/env node
/**
 * Refresh packages/shex-manifest/known-contexts.json: the static roll-up of
 * every JSON-LD context an examples manifest is known to stack, keyed by
 * the URL the manifest names it by.  @shexjs/manifest's documentLoader and
 * graph reader consult it before the network, so reading a manifest needs
 * no fetch for any known vocabulary -- offline, in a test, in the browser.
 *
 * Sources:
 * - this repository's own contexts (the core, the neighborhoods'), read
 *   from the working tree and keyed by where the site publishes them;
 * - the extensions' contexts, published beside their specs at
 *   https://shexspec.github.io/extensions/<X>/manifest-context.jsonld,
 *   fetched -- or, with `--from <dir>`, read from a checkout of
 *   shexSpec/extensions instead (offline, or before a publish).
 *
 * Run it after editing any of them, or adding an extension's or a
 * neighborhood's; packages/shex-manifest/test/Manifest-test.js fails until
 * the roll-up agrees with the repository's files.
 *
 *   node tools/rollup-manifest-contexts.js
 *   node tools/rollup-manifest-contexts.js --from ../../shexSpec/extensions
 */
"use strict";

const Fs = require("fs");
const Path = require("path");

const ROOT = Path.join(__dirname, "..");
const OUT = Path.join(ROOT, "packages", "shex-manifest", "known-contexts.json");
const SITE = "https://shex.js.org/";
const EXTENSIONS = "https://shexspec.github.io/extensions/";

/** the repository's own contexts: file -> published URL */
const LOCAL = [
  "doc/webapp-manifest-context.jsonld",
  "packages/neighborhood-sparql/manifest-context.jsonld",
  "packages/neighborhood-wikibase/manifest-context.jsonld",
];

/** the extensions with a manifest vocabulary */
const EXTENSION_NAMES = ["Map", "Reduce", "SHACL-SPARQL"];

async function main () {
  const fromIdx = process.argv.indexOf("--from");
  const from = fromIdx !== -1 ? process.argv[fromIdx + 1] : null;
  const known = {};
  for (const file of LOCAL)
    known[SITE + file] = JSON.parse(Fs.readFileSync(Path.join(ROOT, file), "utf8"));
  for (const name of EXTENSION_NAMES) {
    const url = `${EXTENSIONS}${name}/manifest-context.jsonld`;
    let text;
    if (from) {
      text = Fs.readFileSync(Path.join(from, name, "manifest-context.jsonld"), "utf8");
    } else {
      const resp = await fetch(url);
      if (!resp.ok)
        throw new Error(`${url}: ${resp.status} ${resp.statusText}`);
      text = await resp.text();
    }
    known[url] = JSON.parse(text);
  }
  const text = JSON.stringify(known, null, 2) + "\n";
  const changed = !Fs.existsSync(OUT) || Fs.readFileSync(OUT, "utf8") !== text;
  Fs.writeFileSync(OUT, text);
  console.log(`${Path.relative(process.cwd(), OUT)}: ${Object.keys(known).length} contexts${changed ? " (updated)" : " (unchanged)"}`);
}

main().catch(e => {
  console.error(e.message || e);
  process.exit(1);
});
