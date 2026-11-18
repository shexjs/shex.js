#!/usr/bin/env node
/**
 * check-manifest-pairs.js: a manifest written twice says the same thing.
 *
 * A manifest.yaml with a manifest.json beside it -- the validator's examples,
 * its inheritance examples, ShExMap's examples, shex-cli's test fixture -- is
 * one manifest in two syntaxes.  The YAML is the one people edit, with its
 * comments and block scalars; the JSON is what the app loads by default
 * (ShExBaseApp-links.ts) and what the older tooling reads.  A reader who picks
 * one must get the same examples as a reader who picks the other, so this
 * parses both and compares them as data, key order aside (an entry's keys may
 * be written in any order; its position in the list may not change).
 *
 *   node tools/check-manifest-pairs.js            # every tracked pair; exit 1 on a difference
 *   node tools/check-manifest-pairs.js --write    # rewrite each differing .json from its .yaml
 *   node tools/check-manifest-pairs.js a.yaml ... # only these (each with the .json beside it)
 *
 * The JSON is written as JSON.stringify(yaml, null, 2) plus a newline, which
 * is how the examples manifests are already formatted.  Pairs are found among
 * the tracked files (git ls-files), so an untracked scratch manifest is not
 * held to this, and .github/ is skipped (workflows and issue templates are
 * YAML of another kind).  The YAML is read as the app reads it (js-yaml's
 * default schema), so a bare 2024-01-01 is a date, and differs from the
 * string the JSON would hold: quote it in the YAML.
 */
"use strict";

const Fs = require("fs");
const Path = require("path");
const {execFileSync} = require("child_process");
const Yaml = require("js-yaml");

const root = Path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const write = args.includes("--write");
const named = args.filter(a => !a.startsWith("--"));

/** The tracked YAML files that have a .json twin, as paths relative to root. */
function trackedPairs () {
  const out = execFileSync("git", ["ls-files", "-z", "--", "*.yaml", "*.yml"], {cwd: root});
  return out.toString("utf8").split("\0").filter(Boolean)
    .filter(f => !f.startsWith(".github/"))
    .filter(f => Fs.existsSync(Path.join(root, twin(f))));
}

function twin (yamlPath) {
  return yamlPath.replace(/\.ya?ml$/, ".json");
}

/** A JSON text whose object keys are sorted, so key order does not count. */
function canonical (x) {
  return JSON.stringify(x, (k, v) =>
    v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)
      ? Object.fromEntries(Object.keys(v).sort().map(k => [k, v[k]]))
      : v);
}

/** A manifest is a list of entries, or a mapping holding `entries`. */
function entries (x) {
  return Array.isArray(x) ? x : x && Array.isArray(x.entries) ? x.entries : null;
}

/** What to call an entry in a report: the labels the app shows, or its name. */
function label (e, i) {
  if (!e || typeof e !== "object") return `#${i}`;
  const parts = [e.schemaLabel, e.dataLabel].filter(s => s !== undefined);
  return parts.length ? parts.join(" / ") : e.name || JSON.stringify(e).slice(0, 60);
}

/** The lines of a report on how the two differ: entry by entry, matched by
 *  label (an entry that moved is reported as moved, not as two changes). */
function describe (y, j) {
  const ys = entries(y), js = entries(j);
  if (!ys || !js) return ["  the two are not both lists of entries"];
  const lines = [];
  if (ys.length !== js.length) lines.push(`  ${ys.length} entries in the YAML, ${js.length} in the JSON`);
  const key = e => label(e, "").trim();
  const jByKey = new Map(js.map((e, i) => [key(e), {e, i}]));
  const yByKey = new Map(ys.map((e, i) => [key(e), {e, i}]));
  const common = [];
  ys.forEach((e, i) => {
    const m = jByKey.get(key(e));
    if (!m) lines.push(`  only in the YAML: #${i} ${key(e)}`);
    else {
      common.push([i, m.i]);
      if (canonical(e) !== canonical(m.e)) {
        const keys = new Set([...Object.keys(e || {}), ...Object.keys(m.e || {})]);
        const differ = [...keys].filter(k => canonical(e[k]) !== canonical(m.e[k]));
        lines.push(`  differs: #${i} ${key(e)} (${differ.join(", ")})`);
      }
    }
  });
  js.forEach((e, i) => { if (!yByKey.has(key(e))) lines.push(`  only in the JSON: #${i} ${key(e)}`); });
  if (common.some(([a, b], n) => n > 0 && (b - a) !== (common[n - 1][1] - common[n - 1][0])))
    lines.push("  the entries are in a different order");
  const yr = {...(Array.isArray(y) ? {} : y), entries: undefined};
  const jr = {...(Array.isArray(j) ? {} : j), entries: undefined};
  if (canonical(yr) !== canonical(jr)) lines.push("  the mapping around the entries differs");
  return lines;
}

let failures = 0;
const pairs = named.length ? named.map(f => Path.relative(root, Path.resolve(f))) : trackedPairs();
for (const yamlPath of pairs) {
  const jsonPath = twin(yamlPath);
  let y, j;
  try {
    y = Yaml.load(Fs.readFileSync(Path.join(root, yamlPath), "utf8"));
  } catch (e) {
    console.log(`${yamlPath}: does not parse: ${e.message.split("\n")[0]}`);
    failures++;
    continue;
  }
  try {
    j = JSON.parse(Fs.readFileSync(Path.join(root, jsonPath), "utf8"));
  } catch (e) {
    console.log(`${jsonPath}: ${e.code === "ENOENT" ? "is missing" : "does not parse: " + e.message}`);
    j = undefined;
  }
  if (j !== undefined && canonical(y) === canonical(j)) {
    console.log(`${yamlPath} = ${jsonPath}`);
    continue;
  }
  if (write) {
    Fs.writeFileSync(Path.join(root, jsonPath), JSON.stringify(y, null, 2) + "\n");
    console.log(`${yamlPath} -> ${jsonPath} (written)`);
    continue;
  }
  console.log(`${yamlPath} != ${jsonPath}`);
  if (j !== undefined) describe(y, j).forEach(l => console.log(l));
  failures++;
}

if (failures) {
  console.log(`\n${failures} pair${failures === 1 ? "" : "s"} differ; regenerate with: npm run check-manifests -- --write`);
  process.exit(1);
}
