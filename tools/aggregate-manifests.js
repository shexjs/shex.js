#!/usr/bin/env node
/**
 * doc/tests-manifest.yaml: the three example manifests as one test suite.
 *
 * Each package's examples are written to be read from that package -- the
 * validator's from packages/shex-webapp/examples/, ShExMap's from
 * packages/extension-map/examples/, ShExReduce's from
 * packages/extension-reduce/examples/ -- and a manifest's references are
 * relative to the manifest.  Aggregating them therefore means moving every
 * reference, which is all this does: it copies the three files through, text
 * and comments and all, rewriting the values under the keys that name a
 * document (anything `…URL`, `sitematrix`, and the `plugins` an entry loads
 * itself by) so they still find their files from doc/.
 *
 * Text rather than a YAML round trip so the sources' comments and block
 * scalars survive; the result is then parsed and checked against the same
 * rewrite done on the parsed sources, so a line the copier mangled fails
 * here rather than in the app.
 *
 * Usage: node tools/aggregate-manifests.js [--check]
 *   --check: say whether the file is up to date, and write nothing.
 */
"use strict";

const Fs = require("fs");
const Path = require("path");
const Yaml = require("js-yaml");

const ROOT = Path.join(__dirname, "..");
const OUT = "doc/tests-manifest.yaml";

/** where each manifest is, and what it is a suite of */
const SOURCES = [
  {file: "packages/shex-webapp/examples/manifest.yaml",
   what: "the validator's own examples"},
  {file: "packages/extension-map/examples/manifest.yaml",
   what: "ShExMap: each entry loads the plugin it needs"},
  {file: "packages/extension-reduce/examples/manifest.yaml",
   what: "ShExReduce: the same, for the calculator"},
];

/** the keys whose value is a document reference (ManifestCache resolves the
 * first four against the manifest; loadExtraInputs the `…URL` rest, and
 * loadEntryPlugins the plugins) */
const isReference = key => /URL$/.test(key) || key === "sitematrix"
      || key === "plugins" || key === "extensions";

const isAbsolute = value => /^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith("/");

/** posix path arithmetic, so "../packages/extension-map/examples/" and
 * "../doc/ShExMapPlugin.js" make one readable path rather than two */
function join (dir, ref) {
  const out = [];
  for (const segment of (dir + ref).split("/")) {
    if (segment === "." || segment === "")
      continue;
    if (segment === ".." && out.length && out[out.length - 1] !== "..")
      out.pop();
    else
      out.push(segment);
  }
  return out.join("/") + (ref.endsWith("/") ? "/" : "");
}

const moved = (dir, value) => isAbsolute(value) ? value : join(dir, value);

/** the copier: the source's own lines, with the references moved */
function rewriteText (text, dir) {
  const lines = text.split("\n");
  const out = [];
  let blockIndent = null; // inside a `key: |` scalar: leave every line alone
  let listKey = null;     // a `key:` whose values are the `- ` lines under it
  for (const line of lines) {
    const indent = line.search(/\S/);
    if (blockIndent !== null) {
      if (line.trim() === "" || indent > blockIndent) {
        out.push(line);
        continue;
      }
      blockIndent = null;
    }
    if (line.trim() === "") {
      out.push(line);
      continue;
    }
    // a block list is written at its key's own indent, so what ends it is a
    // line that isn't one of its items -- or any line indented less
    const isItem = /^\s*-\s+/.test(line);
    if (listKey !== null
        && (indent < listKey.indent || (!isItem && indent <= listKey.indent)))
      listKey = null;
    // a document reference in a list: `plugins:` / `dataURL:` then `- …`
    let m = listKey && line.match(/^(\s*-\s+)(.*)$/);
    if (m) {
      out.push(m[1] + quoted(m[2], value => moved(dir, value)));
      continue;
    }
    // ...or a key and its value on one line, an entry's first key included
    m = line.match(/^(\s*(?:-\s+)?)([A-Za-z@][\w@-]*):(\s*)(.*)$/);
    if (!m) {
      out.push(line);
      continue;
    }
    const [, lead, key, space, rest] = m;
    if (/^[|>]/.test(rest.trim())) {
      blockIndent = indent;
      out.push(line);
      continue;
    }
    if (!isReference(key)) {
      out.push(line);
      continue;
    }
    if (rest.trim() === "" || rest.trim().startsWith("#")) {
      listKey = {indent}; // the values are on the lines below
      out.push(line);
      continue;
    }
    out.push(lead + key + ":" + space + quoted(rest, value => moved(dir, value)));
  }
  return out.join("\n");
}

/** rewrite a scalar, keeping whatever quoting and trailing comment it had */
function quoted (rest, rewrite) {
  const m = rest.match(/^(['"]?)(.*?)\1(\s*(?:#.*)?)$/);
  if (!m)
    return rest;
  const [, quote, value, tail] = m;
  return quote + rewrite(value) + quote + tail;
}

/** ...and the same rewrite on the parsed entries, to check the copier by */
function rewriteParsed (entries, dir) {
  return entries.map(entry => {
    const out = {};
    for (const [key, value] of Object.entries(entry))
      out[key] = !isReference(key) ? value
        : Array.isArray(value) ? value.map(each => moved(dir, each))
        : typeof value === "string" ? moved(dir, value)
        : value;
    return out;
  });
}

function build () {
  const chunks = [`# Every example in this repository, as one manifest.
#
# GENERATED by tools/aggregate-manifests.js from the three manifests below;
# edit those and run it again.  The entries are theirs, with the documents
# they name moved to where this file can find them.
#
# Open it in the validator:
#   packages/shex-webapp/doc/shex-simple.html?manifestURL=../../../${OUT}
# ...where picking an entry loads whatever plugin that entry needs, so the
# suite ends with the plugins loaded that its last entries asked for.
`];
  const expected = [];
  for (const source of SOURCES) {
    const text = Fs.readFileSync(Path.join(ROOT, source.file), "utf8");
    // the path from the aggregate to the source manifest's directory
    const dir = Path.posix.relative(Path.posix.dirname(OUT),
                                    Path.posix.dirname(source.file)) + "/";
    const body = rewriteText(text, dir)
          .replace(/^---\s*$\n?/m, "") // one document, not three
          .replace(/^\s*\n/, "")
          .replace(/\s*$/, "");
    chunks.push(`\n# --- ${source.file}\n# ${source.what}\n${body}\n`);
    expected.push(...rewriteParsed(Yaml.load(text), dir));
  }
  const yaml = chunks.join("");

  // the check: what the copier wrote says what the sources say
  const got = Yaml.load(yaml);
  if (JSON.stringify(got) !== JSON.stringify(expected)) {
    const at = got.findIndex((e, i) => JSON.stringify(e) !== JSON.stringify(expected[i]));
    throw Error("the copy is not the sources, first at entry " + at + ":\n"
                + JSON.stringify(got[at], null, 2) + "\n!=\n"
                + JSON.stringify(expected[at], null, 2));
  }
  // ...and every document it names is where it now says it is
  const missing = [];
  for (const entry of got)
    for (const [key, value] of Object.entries(entry))
      for (const ref of (Array.isArray(value) ? value : [value]))
        if (isReference(key) && typeof ref === "string" && !isAbsolute(ref)
            && !Fs.existsSync(Path.join(ROOT, Path.posix.dirname(OUT), ref)))
          missing.push(entry.schemaLabel + " / " + entry.dataLabel + ": " + key + " " + ref);
  if (missing.length)
    throw Error("references that find nothing:\n  " + missing.join("\n  "));
  return {yaml, entries: got.length};
}

function main () {
  const check = process.argv.includes("--check");
  const {yaml, entries} = build();
  const path = Path.join(ROOT, OUT);
  const before = Fs.existsSync(path) ? Fs.readFileSync(path, "utf8") : null;
  if (check) {
    if (before === yaml) {
      console.log(`${OUT} is up to date (${entries} entries)`);
      return;
    }
    console.error(`${OUT} is out of date; run: node tools/aggregate-manifests.js`);
    process.exit(1);
  }
  Fs.writeFileSync(path, yaml);
  console.log(`${OUT}: ${entries} entries from ${SOURCES.length} manifests`
              + (before === yaml ? " (unchanged)" : ""));
}

if (require.main === module)
  main();

module.exports = {build, rewriteText, moved};
