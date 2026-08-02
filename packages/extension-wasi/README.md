# @shexjs/extension-wasi

The generic WASI semantic-action extension,
`http://shex.io/extensions/WASI/`.

Where the [Test extension](http://shex.io/extensions/Test/) interprets a tiny
fixed grammar (`print`/`fail`), this extension's semantic-action code **is a
program**: the [WebAssembly Text](https://webassembly.github.io/spec/core/text/index.html)
source of a [WASI](https://wasi.dev/) command module.  Each invocation
compiles the module (cached per code text, via [wabt](https://github.com/WebAssembly/wabt))
and runs it under `wasi_snapshot_preview1`.

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
extension by [`tools/gen-tests.js`](tools/gen-tests.js): each
`%<…Test/>{ print(o) %}` becomes a `%<…WASI/>{ (module …) %}` whose WAT
prints the same line — `$write_arg` playing the role of a `_wasi_println(o)`.
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
