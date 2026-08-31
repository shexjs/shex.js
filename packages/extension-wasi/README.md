# @shexjs/extension-wasi

[![npm version](https://img.shields.io/npm/v/@shexjs/extension-wasi)](https://www.npmjs.com/package/@shexjs/extension-wasi)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

The generic WASI semantic-action extension,
`http://shex.io/extensions/WASI/`.

Where the [Test extension](http://shex.io/extensions/Test/) interprets a tiny
fixed grammar (`print`/`fail`), this extension's semantic-action code **is a
program** in [WebAssembly Text](https://webassembly.github.io/spec/core/text/index.html),
run as a [WASI](https://wasi.dev/) command.  Each invocation compiles the
module (cached per code text, via [wabt](https://github.com/WebAssembly/wabt))
and runs it under `wasi_snapshot_preview1`.

``` shell
npm install @shexjs/extension-wasi
```

The code takes one of two forms:

- **standalone** — code beginning with `(module` is compiled as-is: a
  self-contained WASI command importing only `wasi_snapshot_preview1`;
- **library** (the compact, common form) — anything else is a list of module
  *fields*, completed by [`lib/prelude.wat`](lib/prelude.wat): the prelude
  supplies the WASI imports, exported memory, argv loading and print
  helpers, and an exported `_start` that calls the author's
  `(func $main …)`.  A whole `print(o)` is:

  ```
  %<http://shex.io/extensions/WASI/>{ (func $main (call $println_o)) %}
  ```

The composed module still imports only `wasi_snapshot_preview1`, so any WASI
host that performs the same composition (the prelude text is part of this
extension's definition) runs the same actions.

A schema can extend the library for itself: a **start action whose fields
declare no `$main`** runs nothing — its fields are composed, after the
prelude, into every later action of the validation, so a function is
declared once and called per constraint:

```
%<http://shex.io/extensions/WASI/>{
  (func $myPrint (call $put_o) (call $nl))
  (func $myFail (call $fail))
%}
start = @<S>
<S> { <p> . %<http://shex.io/extensions/WASI/>{ (func $main (call $myPrint)) %} }
```

A start action *with* `$main` still runs once as its own program, and a
standalone `(module …)` ignores the schema's library along with the
prelude.

### the library

| helper | effect |
|--------|--------|
| `$put (ptr len)` | write bytes to fd 1 |
| `$nl ()` | write `"\n"` |
| `$println (ptr len)` | `$put` then `$nl` |
| `$put_s` `$put_p` `$put_o` `$put_n` | write a binding's value (exit 2 if absent) |
| `$println_s` `$println_p` `$println_o` `$println_n` | ditto, newline-terminated |
| `$fail ()` | exit 1 — a `SemActFailure` |
| `$strlen (ptr) → len` | NUL-terminated string length |

Author data segments start at offset **8192** (below that is the prelude's
argv/scratch space):

```
%<http://shex.io/extensions/WASI/>{
(data (i32.const 8192) "spo: ")
(func $main
  (call $put (i32.const 8192) (i32.const 5))
  (call $put_s) (call $put_p) (call $put_o)
  (call $nl))
%}
```

This is enough to express everything
[`@shexjs/extension-wasi-test`](../extension-wasi-test#readme)'s Wasm-side
Test-grammar interpreter can do, without the interpreter: each `print`/`fail`
becomes a few library calls (see the generated suite below).

## the contract

**Input — WASI argv.**  The evaluation context arrives as command arguments:

```
argv[0] = "http://shex.io/extensions/WASI/"
argv[1…] = one "<letter>=<value>" per in-scope binding:
    s=, p=, o=   the matched triple's terms (TripleConstraint actions)
    n=           the focus node (Shape and NodeConstraint actions)
```

startActs run with no bindings.  Term values are serialized as in the Test
extension: the term's `.value`, except literals with a non-`xsd:string`
datatype, which appear in Turtle form
(`"1"^^http://www.w3.org/2001/XMLSchema#integer`).

**Output — WASI stdout.**  Whatever the module writes to fd 1 is collected;
each newline-terminated line (plus any unterminated tail at exit) is appended
to `validator.semActHandler.results["http://shex.io/extensions/WASI/"]`.

**Verdict — the exit status.**

| exit | meaning |
|-----:|---------|
| `0`  | success |
| `1`  | `SemActFailure` — validation treats the action as failed; lines printed before exiting are still recorded (like Test's `fail()`) |
| `≥2` | invocation error — the extension throws (e.g. the generated test modules `exit(2)` when a binding they need is absent) |

A trap or a WAT compile error is also an invocation error.

**Escaping.**  ShExC code blocks reserve `%` and `\`, so WAT embedded in a
schema writes them `\%` and `\\` (a WAT string's `\0a` newline escape becomes
`\\0a`).  The parser unescapes before this extension sees the text.

## usage

```js
const WasiExt = require("@shexjs/extension-wasi");
await WasiExt.ready();            // wabt's Wasm build initializes async
const results = WasiExt.register(validator, {ShExTerm});
// ... validator.validateShapeMap(...) ...
WasiExt.done(validator);
```

`configure({impl})` selects the WASI host:

- **`shim`** (default): a self-contained implementation of the handful of
  calls a command module needs (`args_sizes_get`, `args_get`, `fd_write`,
  `proc_exit`, empty `environ_*`), capturing fd 1 in memory;
- **`wasi`**: Node's built-in [`node:wasi`](https://nodejs.org/api/wasi.html),
  fd 1 captured through a temporary file — proving the same modules run under
  a stock WASI host (or wasmtime, or any other conforming runtime).

## the recoded shexTest suite

[`test/wasi/`](test/wasi/) holds every shexTest validation test bearing the
`sht:SemanticAction` trait (except the `shapeExtern*` four, which carry the
trait for the ExternalShape mechanism and contain no code), re-coded for this
extension by [`tools/gen-tests.js`](tools/gen-tests.js): after each
`%<…Test/>{ print(o) %}` it appends a library-form
`%<…WASI/>{ (func $main (call $put_o) (call $nl)) %}` printing the same
line.  The original bytes are untouched, so the recoded schemas diff against
shexTest's as pure additions and **do double duty**: an implementation
registering the Test extension fires the Test acts (unregistered WASI acts
are skipped), one registering this extension fires the WASI acts — the suite
verifies both give the same results.
The mocha suite runs each test under both extensions and requires identical
validation status and result lines, plus agreement with the manifest's
`mf:extensionResults` where declared.

Two shexTest observations the suite works around:

- the `…NoCode…` tests name their actions with fragments
  (`…Test/#a`, `…Test/#b`, …) and bind code externally (`.semact` files);
  `dispatchAll` only routes action names with a registered handler, and the
  stock Validation-test harness registers only the base URL — so those
  actions are silently skipped there, and their `extensionResults` (filtered
  by `extension === <base URL>`) are never compared.  This suite registers
  the handler under each external-code name so the declared prints are
  honored.
- `schemas/1dotAbstractShapeCode1.shex`, `schemas/open1dotcloseCode1.shex`
  and `schemas/openopen1dotcloseCode1closeCode3.shex` contain Test semacts
  but no validation test exercises them.

---

`@shexjs/extension-wasi` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
