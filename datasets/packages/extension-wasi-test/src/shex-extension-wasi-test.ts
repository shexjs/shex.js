/**
 * @shexjs/extension-wasi-test — the ShEx Test semantic-action extension
 * <http://shex.io/extensions/Test/> reimplemented in hand-written WebAssembly
 * (lib/extension-wasi-test.wat), printing through WASI, the WebAssembly System
 * Interface (wasi_snapshot_preview1) — the standardized "libc analog" syscall
 * layer for Wasm runtimes.
 *
 * This module is a drop-in alternative to @shexjs/extension-test: same
 * extension URL, same grammar, same results and SemActFailure protocol
 * (register one or the other, not both).  The difference is that parsing and
 * argument assembly run inside a Wasm module which additionally prints each
 * assembled line plus "\n" to WASI fd 1 via a gathered fd_write.
 *
 * The Wasm module is a pure WASI reactor: its only import is
 * wasi_snapshot_preview1.fd_write.  The host side is chosen automatically:
 *   - "wasi": Node's built-in node:wasi implementation (Node >= 18.17 or so;
 *     constructing it prints an ExperimentalWarning on older Nodes);
 *   - "shim": a ~20-line fd_write provided here, for runtimes without
 *     node:wasi.
 * Select explicitly with configure({impl: "wasi"|"shim"}); redirect the
 * printed bytes with configure({stdout: <host fd>}).
 */
import Fs = require("fs");
import Path = require("path");

const TestExt = "http://shex.io/extensions/Test/";

// beside this file in lib/ -- computed lazily: the browser bundle
// externalizes `path` to undefined and hands the bytes in with
// configure({wasm}) instead of ever asking for a path
function wasmPath (): string { return Path.join(__dirname, "extension-wasi-test.wasm"); }

// dispatch() status codes — see the ABI comment in lib/extension-wasi-test.wat.
const Statuses = {
  PASS: 1,          // code matched "print"; line assembled and printed
  FAIL: 0,          // code matched "fail";  line assembled and printed
  NO_MATCH: -1,     // code didn't match the grammar
  NO_TRIPLE: -2,    // a position arg was used with no triple in scope
  WRITE_ERROR: -3,  // fd_write reported an errno (in errCode) or stalled
  OOM: -4,          // memory.grow refused to enlarge the line buffer
} as const;

const Grammar = "(print|fail) '(' term (',' term)* ')' where term is \"string\", 'string', s, p or o";

/** host options */
interface WasiTestOptions {
  /** which WASI host to instantiate: Node's node:wasi, the built-in fd_write
   *  shim, or (default) node:wasi when loadable, the shim otherwise. */
  impl?: "auto" | "wasi" | "shim";
  /** host file descriptor receiving WASI fd 1 (default 1: process stdout);
   *  false: count the bytes and keep them to the extension's own results --
   *  a browser has no file descriptors */
  stdout?: number | false;
  /** the compiled module's bytes, for a host that cannot read WasmPath (a
   *  browser fetches lib/extension-wasi-test.wasm and hands it here) */
  wasm?: BufferSource;
}

/** the exports of lib/extension-wasi-test.wat — see its ABI comment */
interface WasiTestExports {
  memory: WebAssembly.Memory;
  _initialize: () => void;
  inputBase: WebAssembly.Global<"i32">;
  dispatch: (codeP: number, codeL: number, sP: number, sL: number,
             pP: number, pL: number, oP: number, oL: number) => number;
  linePtr: WebAssembly.Global<"i32">;
  lineLen: WebAssembly.Global<"i32">;
  errCode: WebAssembly.Global<"i32">;
}

/** an instantiated module and which host runs it */
interface HostInstance { exports: WasiTestExports; impl: "wasi" | "shim" }

/** the subset of node:wasi's WASI used here (typed locally: the tree's
 * @types/node predates the module) */
interface WasiHost {
  getImportObject?: () => WebAssembly.Imports;
  wasiImport: WebAssembly.ModuleImports;
  initialize: (instance: WebAssembly.Instance) => void;
}
interface WasiHostOptions { version?: string; stdout?: number }
type WasiHostCtor = new (options: WasiHostOptions) => WasiHost;

/** RDFJS-style triple: only the terms' .value is read */
interface TripleLike { subject: {value: string}; predicate: {value: string}; object: {value: string} }

/** what dispatchWasm returns */
interface DispatchResult { status: number; line: string | null; errCode: number }

/** one failure as SemActHandler.dispatch reports it */
interface SemActFailure { type: "SemActFailure"; errors: string[] }

/** the extension: what require("@shexjs/extension-wasi-test") yields */
interface WasiTestExtension {
  name: string;
  description: string;
  register: (validator: any, api: any) => string[];
  done: (validator: any) => void;
  url: string;
  configure: (overrides: WasiTestOptions) => WasiTestExtension;
  _internals: {
    readonly WasmPath: string;
    Statuses: typeof Statuses;
    makeInstance: typeof makeInstance;
    dispatchWasm: typeof dispatchWasm;
  };
}

let compiled: WebAssembly.Module | null = null;
const compiledFor = new WeakMap<BufferSource, WebAssembly.Module>();  // configure({wasm})'s, one each
function getModule (opts: WasiTestOptions): WebAssembly.Module {
  if (opts.wasm !== undefined) {
    if (!compiledFor.has(opts.wasm))
      compiledFor.set(opts.wasm, new WebAssembly.Module(opts.wasm));
    return compiledFor.get(opts.wasm)!;
  }
  if (compiled === null)
    // (the casts to BufferSource/Uint8Array[] here and in the shim: the tree's
    // @types/node 10 Buffer predates TypeScript's generic typed arrays)
    compiled = new WebAssembly.Module(Fs.readFileSync(wasmPath()) as BufferSource);
  return compiled;
}

/**
 * Instantiate the Wasm module with a WASI host.
 *
 * @param {object} opts - {impl: "auto"|"wasi"|"shim", stdout: <host fd>}.
 * @return {object} {exports, impl} - the instance exports and which host ran.
 */
function makeInstance (opts: WasiTestOptions): HostInstance {
  const impl = opts.impl || "auto";
  const stdout = "stdout" in opts ? opts.stdout! : 1;
  if ((impl === "wasi" || impl === "auto") && stdout !== false) {
    try {
      return makeNodeWasiInstance(opts, stdout);
    } catch (e) {
      if (impl === "wasi")
        throw e;
    }
  }
  return makeShimInstance(opts, stdout);
}

function makeNodeWasiInstance (opts: WasiTestOptions, stdout: number): HostInstance {
  const {WASI} = require("node:wasi") as {WASI: WasiHostCtor}; // throws where absent or flag-gated
  let wasi: WasiHost;
  try {
    wasi = new WASI({version: "preview1", stdout: stdout});
  } catch (e) {
    wasi = new WASI({stdout: stdout}); // Nodes predating the version option
  }
  const importObject = typeof wasi.getImportObject === "function"
        ? wasi.getImportObject()
        : {wasi_snapshot_preview1: wasi.wasiImport};
  const instance = new WebAssembly.Instance(getModule(opts), importObject);
  wasi.initialize(instance);
  return {exports: instance.exports as unknown as WasiTestExports, impl: "wasi"};
}

function makeShimInstance (opts: WasiTestOptions, stdout: number | false): HostInstance {
  let memory: WebAssembly.Memory | null = null;
  const importObject = {
    wasi_snapshot_preview1: {
      // fd_write(fd, *ciovecs, ciovec_count, *nwritten) -> errno
      fd_write: function (fd: number, iovs: number, iovsLen: number, nwrittenPtr: number): number {
        const hostFd = fd === 1 ? stdout as number : fd === 2 ? 2 : -1;
        if (hostFd === -1 && stdout !== false)
          return 8; // WASI errno badf
        try {
          const view = new DataView(memory!.buffer);
          const chunks: Buffer[] = [];
          let total = 0;
          for (let i = 0; i < iovsLen; ++i) {
            const base = view.getUint32(iovs + 8 * i, true);
            const len = view.getUint32(iovs + 8 * i + 4, true);
            if (stdout !== false)
              chunks.push(Buffer.from(memory!.buffer, base, len));
            total += len;
          }
          // stdout false: nowhere to mirror (a browser); the line still
          // reaches the results through linePtr/lineLen
          const written = stdout === false ? total
                : Fs.writeSync(hostFd, Buffer.concat(chunks as Uint8Array[], total));
          view.setUint32(nwrittenPtr, written, true);
          return 0;
        } catch (e) {
          return 29; // WASI errno io
        }
      }
    }
  };
  const instance = new WebAssembly.Instance(getModule(opts), importObject);
  memory = instance.exports.memory as WebAssembly.Memory;
  (instance.exports._initialize as () => void)();
  return {exports: instance.exports as unknown as WasiTestExports, impl: "shim"};
}

function ensureMemory (memory: WebAssembly.Memory, needed: number): void {
  const current = memory.buffer.byteLength;
  if (needed > current)
    memory.grow(Math.ceil((needed - current) / 65536));
}

/**
 * Marshal one semantic-action invocation into linear memory and run it.
 *
 * @param {object} exports - the Wasm instance exports.
 * @param {string} code - text of the semantic action.
 * @param {object|null} triple - RDFJS-style {subject, predicate, object}, or
 *        null when no triple is in scope (e.g. startActs).
 * @return {object} {status, line, errCode}.
 */
function dispatchWasm (exports: WasiTestExports, code: string, triple: TripleLike | null): DispatchResult {
  const encoder = new TextEncoder();
  const codeBytes = encoder.encode(code);
  const termBytes: (Uint8Array | null)[] = triple === null ? [null, null, null] : [
    encoder.encode(triple.subject.value),
    encoder.encode(triple.predicate.value),
    encoder.encode(triple.object.value),
  ];
  const total = termBytes.reduce((sum, b) => sum + (b === null ? 0 : b.length), codeBytes.length);
  const base = exports.inputBase.value;
  ensureMemory(exports.memory, base + total + 16); // slack for the keyword matcher's i32 loads
  const mem = new Uint8Array(exports.memory.buffer);
  let cursor = base;
  function place (bytes: Uint8Array | null): [number, number] {
    if (bytes === null)
      return [0, -1]; // absent-term sentinel
    mem.set(bytes, cursor);
    const placed: [number, number] = [cursor, bytes.length];
    cursor += bytes.length;
    return placed;
  }
  const [codeP, codeL] = place(codeBytes);
  const [sP, sL] = place(termBytes[0]);
  const [pP, pL] = place(termBytes[1]);
  const [oP, oL] = place(termBytes[2]);
  const status = exports.dispatch(codeP, codeL, sP, sL, pP, pL, oP, oL);
  let line: string | null = null;
  if (status === Statuses.PASS || status === Statuses.FAIL)
    // re-view the buffer: dispatch() may have grown (and so replaced) it
    line = new TextDecoder().decode(
      new Uint8Array(exports.memory.buffer, exports.linePtr.value, exports.lineLen.value));
  return {status: status, line: line, errCode: exports.errCode.value};
}

function makeModule (opts: WasiTestOptions): WasiTestExtension {

  function register (validator: any, api: any): string[] {
    if (api === undefined || !('ShExTerm' in api))
      throw Error('SemAct extensions must be called with register(validator, {ShExTerm, ...)')

    const host = makeInstance(opts);

    validator.semActHandler.results[TestExt] = [];
    validator.semActHandler.register(
      TestExt,
      {
        /**
         * Callback for extension invocation.
         *
         * @param {string} code - text of the semantic action.
         * @param {object} ctx - matched triple or results subset.
         * @param {object} _extensionStorage - place where the extension writes into the result structure.
         * @return {object[]} SemActFailure list — [] reports success.
         */
        dispatch: function (code: string | null, ctx: any, _extensionStorage: any): SemActFailure[] {
          if (typeof code !== "string")
            throw Error("Invocation error: " + TestExt + " expected code to dispatch, got: " + code);
          const triple = ctx && Array.isArray(ctx.triples) && ctx.triples.length > 0
                ? ctx.triples[0]
                : null;
          const res = dispatchWasm(host.exports, code, triple);
          switch (res.status) {
          case Statuses.PASS:
            validator.semActHandler.results[TestExt].push(res.line);
            return [];
          case Statuses.FAIL:
            validator.semActHandler.results[TestExt].push(res.line);
            return [{type: "SemActFailure", errors: [`fail(${res.line})`]}];
          case Statuses.NO_MATCH:
            throw Error("Invocation error: " + TestExt + " code \"" + code + "\" didn't match " + Grammar);
          case Statuses.NO_TRIPLE:
            throw Error("Invocation error: " + TestExt + " code \"" + code + "\" refers to "
                        + String.fromCharCode(res.errCode) + " with no triple in scope");
          case Statuses.WRITE_ERROR:
            throw Error("Invocation error: " + TestExt + " fd_write failed with WASI errno " + res.errCode);
          case Statuses.OOM:
            throw Error("Invocation error: " + TestExt + " could not grow memory for the result line");
          default:
            throw Error("Invocation error: " + TestExt + " unexpected dispatch() status " + res.status);
          }
        }
      }
    );
    return validator.semActHandler.results[TestExt];
  }

  function done (validator: any): void {
    if (validator.semActHandler.results[TestExt].length === 0)
      delete validator.semActHandler.results[TestExt];
  }

  return {
    name: "TestWasi",
    description: `Test extension reimplemented in WebAssembly, printing via WASI fd_write
url: ${TestExt}`,
    register: register,
    done: done,
    url: TestExt,
    /**
     * Derive a module bound to different host options.
     *
     * @param {object} overrides - {impl: "auto"|"wasi"|"shim", stdout: <host fd>}.
     */
    configure: function (overrides: WasiTestOptions): WasiTestExtension {
      return makeModule(Object.assign({}, opts, overrides));
    },
    _internals: {get WasmPath () { return wasmPath(); }, Statuses, makeInstance, dispatchWasm},
  };
}

export = makeModule({});
