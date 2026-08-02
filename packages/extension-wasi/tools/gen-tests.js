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
const LITERALS_BASE = 1024; // literal pool (incl. "\n")
const ARGV_PTRS = 48;       // argv pointer array
const ARGV_BUF = 4096;      // argv string buffer

function watString (bytes) { // WAT data-segment string with hex escapes
  return [...bytes].map(b =>
    b >= 0x20 && b < 0x7f && b !== 0x22 && b !== 0x5c
      ? String.fromCharCode(b)
      : "\\" + b.toString(16).padStart(2, "0")).join("");
}

/** emit a WASI command module performing one Test print/fail */
function watFor (testCode) {
  const {verb, parts} = parseTestCode(testCode);
  const encoder = new TextEncoder();
  // literal pool: "\n" first, then each string part
  let pool = Buffer.from("\n");
  const litRefs = parts.map(p => {
    if (!("str" in p)) return null;
    const bytes = encoder.encode(p.str);
    const ref = {ptr: LITERALS_BASE + pool.length, len: bytes.length};
    pool = Buffer.concat([pool, Buffer.from(bytes)]);
    return ref;
  });
  const calls = parts.map((p, i) =>
    "str" in p
      ? `    (call $write (i32.const ${litRefs[i].ptr}) (i32.const ${litRefs[i].len}))`
      : `    (call $write_arg (i32.const ${p.pos.charCodeAt(0)})) ;; ${p.pos}`);
  return `(module
  ;; WASI re-coding of Test semantic action \`${verb}(${parts.map(p => "str" in p ? JSON.stringify(p.str) : p.pos).join(", ")})\`
  (import "wasi_snapshot_preview1" "args_sizes_get" (func $args_sizes_get (param i32 i32) (result i32)))
  (import "wasi_snapshot_preview1" "args_get" (func $args_get (param i32 i32) (result i32)))
  (import "wasi_snapshot_preview1" "fd_write" (func $fd_write (param i32 i32 i32 i32) (result i32)))
  (import "wasi_snapshot_preview1" "proc_exit" (func $proc_exit (param i32)))
  (memory (export "memory") 1)
  ;; 0:argc 4:argv_buf_size 16:iovec 32:nwritten ${ARGV_PTRS}:argv[] ${LITERALS_BASE}:literals ${ARGV_BUF}:argv text
  (data (i32.const ${LITERALS_BASE}) "${watString(pool)}")
  (func $write (param $ptr i32) (param $len i32)
    (i32.store (i32.const 16) (local.get $ptr))
    (i32.store (i32.const 20) (local.get $len))
    (drop (call $fd_write (i32.const 1) (i32.const 16) (i32.const 1) (i32.const 32))))
  (func $strlen (param $p i32) (result i32)
    (local $e i32)
    (local.set $e (local.get $p))
    (block $done
      (loop $l
        (br_if $done (i32.eqz (i32.load8_u (local.get $e))))
        (local.set $e (i32.add (local.get $e) (i32.const 1)))
        (br $l)))
    (i32.sub (local.get $e) (local.get $p)))
  ;; print the value of the "<letter>=<value>" argument; exit(2) if absent
  (func $write_arg (param $letter i32)
    (local $i i32)
    (local $p i32)
    (local.set $i (i32.const 1))
    (block $done
      (loop $l
        (br_if $done (i32.ge_u (local.get $i) (i32.load (i32.const 0))))
        (local.set $p (i32.load (i32.add (i32.const ${ARGV_PTRS}) (i32.mul (local.get $i) (i32.const 4)))))
        (if (i32.and (i32.eq (i32.load8_u (local.get $p)) (local.get $letter))
                     (i32.eq (i32.load8_u (i32.add (local.get $p) (i32.const 1))) (i32.const 61)))
          (then
            (call $write (i32.add (local.get $p) (i32.const 2))
                         (call $strlen (i32.add (local.get $p) (i32.const 2))))
            (return)))
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $l)))
    (call $proc_exit (i32.const 2)))
  (func (export "_start")
    (drop (call $args_sizes_get (i32.const 0) (i32.const 4)))
    (drop (call $args_get (i32.const ${ARGV_PTRS}) (i32.const ${ARGV_BUF})))
${calls.join("\n")}
    (call $write (i32.const ${LITERALS_BASE}) (i32.const 1)) ;; "\\n"${verb === "fail" ? `
    (call $proc_exit (i32.const 1)) ;; fail` : ""}
  ) ;; end _start
) ;; end module`;
}

// ── schema transformation ───────────────────────────────────────────────────
// Matches Test semacts including fragment-suffixed names (the NoCode tests
// name their acts …Test/#a, …Test/#b, … and bind code externally).
const semactRe = new RegExp(
  `%<${TestUrl.replace(/[/.]/g, "\\$&")}(#[^>]*)?>(?:\\{((?:[^%\\\\]|\\\\[%\\\\]|\\\\u[0-9a-fA-F]{4}|\\\\U[0-9a-fA-F]{8})*)%\\}|%)`, "g");

function recode (shexc) {
  return shexc.replace(semactRe, (_, frag, code) =>
    code === undefined
      ? `%<${WasiUrl}${frag || ""}>%`
      : `%<${WasiUrl}${frag || ""}>{\n${escapeShexCode(watFor(unescapeShexCode(code)))}\n%}`);
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
