/**
 * @shexjs/extension-wasi — the generic WASI semantic-action extension
 * <http://shex.io/extensions/WASI/>.
 *
 * Where the Test extension <http://shex.io/extensions/Test/> interprets a
 * tiny fixed grammar (print/fail), this extension's semantic-action code IS A
 * PROGRAM: the WebAssembly Text (WAT) source of a WASI command module.  Each
 * invocation compiles (cached) and runs the module under
 * wasi_snapshot_preview1 with the evaluation context passed as WASI argv:
 *
 *   argv[0] = "http://shex.io/extensions/WASI/"
 *   argv[1..] = one "<letter>=<value>" per in-scope binding:
 *       s=, p=, o=   the matched triple's terms (TripleConstraint ctx)
 *       n=           the focus node (Shape and NodeConstraint ctx)
 *     (startActs run with no bindings.)
 *
 * Term values are serialized as in the Test extension: a term's `.value`,
 * except literals with a non-xsd:string datatype, which appear in Turtle
 * form (`"1"^^http://www.w3.org/2001/XMLSchema#integer`).
 *
 * Whatever the module writes to WASI fd 1 is collected: each
 * newline-terminated line (plus any unterminated tail at exit) is appended
 * to validator.semActHandler.results["http://shex.io/extensions/WASI/"].
 *
 * The module's exit status is the verdict:
 *   0        success
 *   1        SemActFailure (validation treats the action as failed; lines
 *            printed before exiting are still recorded, like Test's fail())
 *   2 and up invocation error (the extension throws), e.g. a module may
 *            exit(2) when a binding it needs is absent
 * A trap or a WAT compilation error is also an invocation error.
 *
 * Because ShExC code blocks escape `%` and `\` (as `\%` and `\\`), WAT
 * embedded in a schema doubles every backslash (`\n` in a WAT string is
 * written `\\n`).  The parser hands this module the unescaped text.
 *
 * WAT compilation uses the wabt toolchain, whose WebAssembly build
 * initializes asynchronously: call `await module.ready()` once before
 * validating (dispatch throws a descriptive error otherwise).
 *
 * The WASI host is chosen like @shexjs/extension-wasi-test:
 *   - "shim" (default): a self-contained implementation of the five calls a
 *     command module needs (args_sizes_get, args_get, fd_write, proc_exit,
 *     environ_sizes_get/environ_get), capturing fd 1 in memory;
 *   - "wasi": Node's built-in node:wasi, with fd 1 captured through a
 *     temporary file (proves the same .wasm runs under a stock WASI host).
 * Select with configure({impl: "shim"|"wasi"}).
 */
const WasiExt = "http://shex.io/extensions/WASI/";
const XsdString = "http://www.w3.org/2001/XMLSchema#string";

let wabtPromise = null;
let wabt = null;
function ready () {
  if (wabtPromise === null)
    wabtPromise = require("wabt")().then(w => { wabt = w; });
  return wabtPromise;
}

const moduleCache = new Map(); // WAT text -> WebAssembly.Module

function compile (code) {
  if (moduleCache.has(code))
    return moduleCache.get(code);
  if (wabt === null)
    throw Error("Invocation error: " + WasiExt + " not initialized; `await extension.ready()` before validating");
  let parsed;
  try {
    parsed = wabt.parseWat("semact.wat", code, {});
  } catch (e) {
    throw Error("Invocation error: " + WasiExt + " WAT didn't compile: " + e.message);
  }
  const bin = parsed.toBinary({});
  parsed.destroy();
  const mod = new WebAssembly.Module(bin.buffer);
  moduleCache.set(code, mod);
  return mod;
}

/** run a compiled module under the ~5-call WASI shim, capturing fd 1.
 * @return {object} {exitCode, stdout: Buffer}
 */
function runShim (mod, args) {
  const encoder = new TextEncoder();
  const argBufs = args.map(a => encoder.encode(a + "\0"));
  const chunks = [];
  let memory = null;
  const ExitSentinel = {};
  let exitCode = 0;
  const importObject = {
    wasi_snapshot_preview1: {
      args_sizes_get: function (argcPtr, argvBufSizePtr) {
        const view = new DataView(memory.buffer);
        view.setUint32(argcPtr, argBufs.length, true);
        view.setUint32(argvBufSizePtr, argBufs.reduce((sum, b) => sum + b.length, 0), true);
        return 0;
      },
      args_get: function (argvPtr, argvBufPtr) {
        const view = new DataView(memory.buffer);
        const mem = new Uint8Array(memory.buffer);
        let cursor = argvBufPtr;
        argBufs.forEach((b, i) => {
          view.setUint32(argvPtr + 4 * i, cursor, true);
          mem.set(b, cursor);
          cursor += b.length;
        });
        return 0;
      },
      environ_sizes_get: function (countPtr, bufSizePtr) {
        const view = new DataView(memory.buffer);
        view.setUint32(countPtr, 0, true);
        view.setUint32(bufSizePtr, 0, true);
        return 0;
      },
      environ_get: function (_environPtr, _environBufPtr) { return 0; },
      fd_write: function (fd, iovs, iovsLen, nwrittenPtr) {
        if (fd !== 1 && fd !== 2)
          return 8; // WASI errno badf
        const view = new DataView(memory.buffer);
        let total = 0;
        for (let i = 0; i < iovsLen; ++i) {
          const base = view.getUint32(iovs + 8 * i, true);
          const len = view.getUint32(iovs + 8 * i + 4, true);
          if (fd === 1)
            chunks.push(Buffer.from(new Uint8Array(memory.buffer, base, len))); // copy; buffer may move
          total += len;
        }
        view.setUint32(nwrittenPtr, total, true);
        return 0;
      },
      proc_exit: function (code) {
        exitCode = code;
        throw ExitSentinel;
      },
    }
  };
  const instance = new WebAssembly.Instance(mod, importObject);
  memory = instance.exports.memory;
  try {
    instance.exports._start();
  } catch (e) {
    if (e !== ExitSentinel)
      throw Error("Invocation error: " + WasiExt + " module trapped: " + e.message);
  }
  return {exitCode: exitCode, stdout: Buffer.concat(chunks)};
}

/** run a compiled module under Node's built-in node:wasi, capturing fd 1
 * through a temporary file.
 * @return {object} {exitCode, stdout: Buffer}
 */
function runNodeWasi (mod, args) {
  const {WASI} = require("node:wasi");
  const Fs = require("fs");
  const Os = require("os");
  const Path = require("path");
  const tmp = Path.join(Os.tmpdir(), "shex-wasi-" + process.pid + "-" + Math.random().toString(36).slice(2));
  const fd = Fs.openSync(tmp, "w+");
  try {
    let wasi;
    try {
      wasi = new WASI({version: "preview1", args: args, stdout: fd, returnOnExit: true});
    } catch (e) {
      wasi = new WASI({args: args, stdout: fd, returnOnExit: true});
    }
    const importObject = typeof wasi.getImportObject === "function"
          ? wasi.getImportObject()
          : {wasi_snapshot_preview1: wasi.wasiImport};
    const instance = new WebAssembly.Instance(mod, importObject);
    const exitCode = wasi.start(instance);
    return {exitCode: exitCode, stdout: Fs.readFileSync(tmp)};
  } finally {
    Fs.closeSync(fd);
    Fs.unlinkSync(tmp);
  }
}

/** serialize an RDFJS term as the Test extension does */
function termValue (term) {
  return term.termType === "Literal" && term.datatype.value !== XsdString
    ? rdfJsTerm2TurtleLiteral(term)
    : term.value;
}
function rdfJsTerm2TurtleLiteral (term) { // matches @shexjs/term rdfJsTerm2Turtle's Literal case
  const RdfLangString = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";
  return "\"" + term.value.replace(/"/g, '\\"') + "\"" + (
    term.datatype.value === RdfLangString ? "@" + term.language : "^^" + term.datatype.value);
}

/** assemble WASI argv from a dispatch ctx */
function ctxArgs (ctx) {
  const args = [WasiExt];
  if (ctx !== null && typeof ctx === "object") {
    if (Array.isArray(ctx.triples) && ctx.triples.length > 0) {
      const t = ctx.triples[0];
      args.push("s=" + termValue(t.subject), "p=" + termValue(t.predicate), "o=" + termValue(t.object));
    }
    if (ctx.node && typeof ctx.node === "object" && "termType" in ctx.node)
      args.push("n=" + termValue(ctx.node));
  }
  return args;
}

function makeModule (opts) {

  function register (validator, api) {
    if (api === undefined || !('ShExTerm' in api))
      throw Error('SemAct extensions must be called with register(validator, {ShExTerm, ...)')

    const run = (opts.impl || "shim") === "wasi" ? runNodeWasi : runShim;

    validator.semActHandler.results[WasiExt] = [];
    validator.semActHandler.register(
      WasiExt,
      {
        /**
         * Callback for extension invocation.
         *
         * @param {string} code - WAT source of a WASI command module.
         * @param {object} ctx - matched triple or results subset.
         * @param {object} _extensionStorage - place where the extension writes into the result structure.
         * @return {object[]} SemActFailure list — [] reports success.
         */
        dispatch: function (code, ctx, _extensionStorage) {
          if (typeof code !== "string")
            throw Error("Invocation error: " + WasiExt + " expected WAT code to dispatch, got: " + code);
          const res = run(compile(code), ctxArgs(ctx));
          const lines = res.stdout.toString("utf8").split("\n");
          const tail = lines.pop(); // "" after a final "\n", else an unterminated tail
          if (tail !== "")
            lines.push(tail);
          lines.forEach(line => validator.semActHandler.results[WasiExt].push(line));
          if (res.exitCode === 0)
            return [];
          if (res.exitCode === 1)
            return [{type: "SemActFailure", errors: ["exit(1)" + (lines.length ? ": " + lines.join("; ") : "")]}];
          throw Error("Invocation error: " + WasiExt + " module exited with status " + res.exitCode);
        }
      }
    );
    return validator.semActHandler.results[WasiExt];
  }

  function done (validator) {
    if (validator.semActHandler.results[WasiExt].length === 0)
      delete validator.semActHandler.results[WasiExt];
  }

  return {
    name: "Wasi",
    description: `generic WASI semantic-action extension: the code is the WAT source of a WASI command run per invocation
url: ${WasiExt}`,
    register: register,
    done: done,
    url: WasiExt,
    ready: ready,
    /**
     * Derive a module bound to different host options.
     *
     * @param {object} overrides - {impl: "shim"|"wasi"}.
     */
    configure: function (overrides) {
      return makeModule(Object.assign({}, opts, overrides));
    },
    _internals: {compile, runShim, runNodeWasi, ctxArgs, moduleCache},
  };
}

module.exports = makeModule({});
