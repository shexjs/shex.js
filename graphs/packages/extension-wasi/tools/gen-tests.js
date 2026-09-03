#!/usr/bin/env node
/**
 * Re-code shexTest's Test-extension semantic-action tests for the generic
 * WASI extension <http://shex.io/extensions/WASI/>.
 *
 * Reads ../../../../shexTest/validation/manifest.jsonld, takes every test
 * with the sht:SemanticAction trait whose schema contains Test semacts
 * (the shapeExtern* tests carry the trait for the ExternalShape mechanism
 * and have no code to re-code), and writes into ../test/wasi/:
 *   <schema>.shex    the schema with each %<Test>{...%} replaced by a
 *                    %<WASI>{ <WAT module> %} performing the same prints
 *   <schema>.semact  likewise for the external-code (NoCode) variants
 *   manifest.json    {name, schema, semActs?, data, focus, shape, status,
 *                     expectedPrints} per test, consumed by the mocha suite
 *
 * Each generated WAT module is a self-contained WASI command: it reads the
 * bindings the host passes as argv ("s=...", "p=...", "o=...", "n=..."),
 * writes the same line the Test extension would assemble to fd 1
 * ($write_arg being the moral equivalent of a `_wasi_println(o)`), and
 * exits 0 (print) or 1 (fail).
 */
const Fs = require("fs");
const Path = require("path");

const TestUrl = "http://shex.io/extensions/Test/";
const WasiUrl = "http://shex.io/extensions/WASI/";
const ShexTestDir = Path.join(__dirname, "../../../../shexTest");
const OutDir = Path.join(__dirname, "../test/wasi");

// ── ShExC CODE token escaping ────────────────────────────────────────────────
// inside %{...%}: `\%` ⇒ %, `\\` ⇒ \, `\uXXXX`/`\UXXXXXXXX` ⇒ char
function unescapeShexCode (s) {
  return s.replace(/\\(?:u([0-9a-fA-F]{4})|U([0-9a-fA-F]{8})|([%\\]))/g,
                   (_, u4, u8, lit) => lit !== undefined ? lit
                     : String.fromCodePoint(parseInt(u4 || u8, 16)));
}
function escapeShexCode (s) {
  return s.replace(/[\\%]/g, c => "\\" + c);
}

// ── the Test extension's grammar (as in @shexjs/extension-test) ─────────────
const term = `(?:("(?:[^\\\\"]|\\\\\\\\|\\\\")*"|'(?:[^\\\\']|\\\\\\\\|\\\\')*')|([spon]))`;
const testPattern = new RegExp(`^ *(fail|print) *\\((( *${term} *,)* *${term}) *\\) *$`);
const termMatcher = new RegExp(` *${term} *,?`, 'g');

/** parse a Test code into {verb, parts: [{str}|{pos}]} */
function parseTestCode (code) {
  const m = code.match(testPattern);
  if (!m)
    throw Error(`Test code didn't parse: ${JSON.stringify(code)}`);
  const parts = [];
  let t;
  while ((t = termMatcher.exec(m[2])) !== null)
    parts.push(t[1] !== undefined
               ? {str: t[1].substring(1, t[1].length - 1).replace(/\\([\\"'])/g, "$1")}
               : {pos: t[2]});
  return {verb: m[1], parts};
}

// ── WAT emission ─────────────────────────────────────────────────────────────
const USER_DATA = 8192; // where the library prelude's memory map hands over

function watString (bytes) { // WAT data-segment string with hex escapes
  return [...bytes].map(b =>
    b >= 0x20 && b < 0x7f && b !== 0x22 && b !== 0x5c
      ? String.fromCharCode(b)
      : "\\" + b.toString(16).padStart(2, "0")).join("");
}

/** emit single-line module fields (completed by lib/prelude.wat) performing
 * one Test print/fail: string parts become data segments printed with $put,
 * position parts become $put_s/p/o/n calls, one $nl ends the line, fail
 * exits 1.  WAT is whitespace-insensitive, so one line suffices and the act
 * sits visually parallel to the Test act it shadows. */
function watFor (testCode) {
  const {verb, parts} = parseTestCode(testCode);
  const encoder = new TextEncoder();
  let pool = Buffer.alloc(0);
  const litRefs = parts.map(p => {
    if (!("str" in p)) return null;
    const bytes = encoder.encode(p.str);
    const ref = {ptr: USER_DATA + pool.length, len: bytes.length};
    pool = Buffer.concat([pool, Buffer.from(bytes)]);
    return ref;
  });
  const calls = parts.map((p, i) =>
    "str" in p
      ? `(call $put (i32.const ${litRefs[i].ptr}) (i32.const ${litRefs[i].len}))`
      : `(call $put_${p.pos})`);
  if (verb === "fail")
    calls.push("(call $nl)", "(call $fail)");
  else
    calls.push("(call $nl)");
  return (pool.length ? `(data (i32.const ${USER_DATA}) "${watString(pool)}") ` : "")
    + `(func $main ${calls.join(" ")})`;
}

// ── schema transformation ───────────────────────────────────────────────────
// Matches Test semacts including fragment-suffixed names (the NoCode tests
// name their acts …Test/#a, …Test/#b, … and bind code externally).
const semactRe = new RegExp(
  `%<${TestUrl.replace(/[/.]/g, "\\$&")}(#[^>]*)?>(?:\\{((?:[^%\\\\]|\\\\[%\\\\]|\\\\u[0-9a-fA-F]{4}|\\\\U[0-9a-fA-F]{8})*)%\\}|%)`, "g");

/** Append a WASI act after each Test act, leaving the original bytes
 * untouched — the recoded schema does double duty (Test and WASI
 * implementations each fire the acts they register) and diffs against the
 * shexTest original as pure additions. */
function recode (shexc) {
  return shexc.replace(semactRe, (match, frag, code, offset) => {
    const lineStart = shexc.lastIndexOf("\n", offset - 1) + 1;
    const indent = shexc.slice(lineStart).match(/^[ \t]*/)[0];
    const wasi = code === undefined
      ? `%<${WasiUrl}${frag || ""}>%`
      : `%<${WasiUrl}${frag || ""}>{ ${escapeShexCode(watFor(unescapeShexCode(code)))} %}`;
    return match + "\n" + indent + wasi;
  });
}

// ── main ─────────────────────────────────────────────────────────────────────
const manifest = JSON.parse(Fs.readFileSync(Path.join(ShexTestDir, "validation/manifest.jsonld"), "utf8"));
Fs.mkdirSync(OutDir, {recursive: true});
const out = [];
for (const e of manifest["@graph"][0].entries) {
  let traits = e.trait || [];
  if (typeof traits === "string") traits = [traits];
  if (!traits.some(t => t.includes("SemanticAction")) || e["@id"].includes("Extern"))
    continue;
  const a = e.action;
  const schemaFile = a.schema.replace("../", ""); // schemas/x.shex
  const base = Path.basename(schemaFile);
  const src = Fs.readFileSync(Path.join(ShexTestDir, schemaFile), "utf8");
  const transformed = recode(src);
  if (transformed === src && !a.semActs)
    throw Error(`${e["@id"]}: no Test semacts found in ${schemaFile}`);
  Fs.writeFileSync(Path.join(OutDir, base), transformed);
  const entry = {
    name: e["@id"].replace(/^#/, ""),
    schema: base,
    data: a.data,
    focus: a.focus,
    shape: a.shape,
    status: e["@type"], // sht:ValidationTest | sht:ValidationFailure
    expectedPrints: (e.extensionResults || []).map(x => x.prints),
    originalSchema: schemaFile,
  };
  if (a.semActs) {
    const semactBase = Path.basename(a.semActs);
    const semactSrc = Fs.readFileSync(Path.join(ShexTestDir, a.semActs.replace("../", "")), "utf8");
    Fs.writeFileSync(Path.join(OutDir, semactBase), recode(semactSrc));
    entry.semActs = semactBase;
    entry.originalSemActs = a.semActs.replace("../", "");
  }
  out.push(entry);
}
Fs.writeFileSync(Path.join(OutDir, "manifest.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`wrote ${out.length} recoded tests to ${OutDir}`);
