export {};

export const description: string;

export const name: string;

export const url: string;

export function done(validator: any): void;

export function register(validator: any, api: any): any;

export interface WasiTestOptions {
  /** which WASI host to instantiate: Node's node:wasi, the built-in fd_write
   *  shim, or (default) node:wasi when loadable, the shim otherwise. */
  impl?: "auto" | "wasi" | "shim";
  /** host file descriptor receiving WASI fd 1 (default 1: process stdout). */
  stdout?: number;
}

/** Derive a module bound to different host options. */
export function configure(overrides: WasiTestOptions): typeof import(".");

export const _internals: {
  WasmPath: string;
  Statuses: {
    PASS: 1;
    FAIL: 0;
    NO_MATCH: -1;
    NO_TRIPLE: -2;
    WRITE_ERROR: -3;
    OOM: -4;
  };
  makeInstance(opts: WasiTestOptions): {exports: any, impl: "wasi" | "shim"};
  dispatchWasm(exports: any, code: string, triple: object | null):
    {status: number, line: string | null, errCode: number};
};
