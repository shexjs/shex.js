# @shexjs/extension-wasi-test

The ShEx [Test semantic-action extension](http://shex.io/extensions/Test/)
reimplemented in hand-written WebAssembly.
A drop-in alternative to
[`@shexjs/extension-test`](../extension-test#readme): same extension URL
(`http://shex.io/extensions/Test/`), same grammar, same results collection and
`SemActFailure` protocol — but the parsing and argument assembly run inside a
1.3 KB Wasm module ([`lib/extension-wasi-test.wat`](lib/extension-wasi-test.wat)),
and each assembled line is genuinely **printed** through
[WASI](https://wasi.dev/) — the WebAssembly System Interface
(`wasi_snapshot_preview1`), the standardized "libc analog" syscall layer for
Wasm runtimes.  `fd_write`, the one import this module uses, is the
`writev(2)`-shaped call that [wasi-libc](https://github.com/WebAssembly/wasi-libc)'s
`printf` bottoms out in.

Being WASI-portable is the point: the same `.wasm` binary could execute a
schema's Test semantic actions under any conforming host — another ShEx
implementation, wasmtime, a browser WASI polyfill — not just this JavaScript
one.

## usage

Anywhere `@shexjs/extension-test` works. With the
[CLI](../shex-cli#readme)'s `--extension` file glob:

```sh
./node_modules/.bin/shex-validate \
    -x doc.shex -d doc.ttl -n tag:node123 \
    --extension node_modules/@shexjs/extension-wasi-test/shex-extension-wasi-test.js
```

or via the API:

```js
const WasiTest = require("@shexjs/extension-wasi-test");
const results = WasiTest.register(validator, {ShExTerm});
// ... validator.validateShapeMap(...) ...
WasiTest.done(validator);
```

Semantic actions look like:

```
PREFIX ex: <http://ex.example/#>
ex:S { ex:p1 . %<http://shex.io/extensions/Test/>{ print(s, ' ', o) %} }
```

Each `print(...)`/`fail(...)` invocation concatenates its arguments — quoted
strings verbatim (outer quotes stripped, escapes **not** decoded, mirroring the
reference implementation) and `s`/`p`/`o` as the matched triple's term
`.value`s — collects the line in
`validator.semActHandler.results["http://shex.io/extensions/Test/"]`, and
writes the line plus `"\n"` to WASI fd 1 as a single gathered `fd_write`
(one `ciovec` for the line, one for the newline).  `print` succeeds; `fail`
reports a `SemActFailure`.

### configuration

`configure(overrides)` derives a module bound to different host options:

```js
const quiet = WasiTest.configure({
  stdout: someFd,   // host file descriptor receiving WASI fd 1 (default 1)
  impl: "shim",     // "wasi" | "shim" | "auto" (default)
});
```

- **`wasi`** hosts the module with Node's built-in
  [`node:wasi`](https://nodejs.org/api/wasi.html) (constructing it prints an
  `ExperimentalWarning`; silence with `--no-warnings` if it offends).
- **`shim`** hosts it with a ~20-line `fd_write` implemented in this package —
  for Nodes where `node:wasi` is absent or flag-gated, or when you want no
  warning.  The Wasm module can't tell the difference; its one import is
  standard WASI either way.
- **`auto`** (default) tries `node:wasi`, falls back to the shim.

## the Wasm ABI

The module is a pure WASI *reactor* (exports `_initialize`, no `_start`).  The
host packs the semantic-action code and the in-scope term values as UTF-8 into
linear memory at `inputBase` and calls:

```
dispatch(codePtr, codeLen, sPtr, sLen, pPtr, pLen, oPtr, oLen) -> status
```

passing length `-1` for any term not in scope (e.g. `startActs`).  Statuses:

| status | meaning |
|-------:|---------|
| `1` PASS | code matched `print`; line assembled and printed |
| `0` FAIL | code matched `fail`; line assembled and printed |
| `-1` NO_MATCH | code didn't match the grammar (host throws an invocation error) |
| `-2` NO_TRIPLE | a position was referenced with no triple in scope; `errCode` holds the letter |
| `-3` WRITE_ERROR | `fd_write` errored (`errCode` holds the WASI errno) or stalled |
| `-4` OOM | `memory.grow` refused to enlarge the line buffer |

After PASS/FAIL the assembled line sits at exported globals
`linePtr`/`lineLen` for the host to collect into
`semActHandler.results`.  The module grows its own memory for arbitrarily
large lines and retries partial writes; the full grammar, memory map and host
protocol are documented at the top of
[`lib/extension-wasi-test.wat`](lib/extension-wasi-test.wat).

## building

`lib/extension-wasi-test.wasm` is committed.  To rebuild it from the `.wat`
source (using the [wabt](https://github.com/WebAssembly/wabt) toolchain's
`wat2wasm`, a devDependency):

```sh
npm install && npm run build
```

## deviations from @shexjs/extension-test

- `print`/`fail` lines are actually printed (WASI fd 1); the reference
  implementation only collects them.
- Error *texts* differ (e.g. referencing a position with no triple in scope
  throws a descriptive invocation error rather than a `TypeError`), but every
  code that throws there throws here and vice versa — see the parity suite in
  [`test/extension-wasi-test-test.js`](test/extension-wasi-test-test.js).
