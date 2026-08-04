/** A same-thread Worker stand-in for jsdom page tests (jsdom has no Worker).
 *
 * The worker script and its importScripts run in a Node vm context whose
 * global doubles as the WorkerGlobalScope (self), so ShExWorkerThread.js /
 * ShExMapWorkerThread.js execute unmodified.  Messages hop the boundary
 * through structuredClone -- like the real thing, object identity does not
 * survive -- and are delivered asynchronously.
 *
 * makeWorkerClass(pageDir, extraGlobals) returns a class to install as
 * window.Worker in JSDOM's beforeParse; script URLs resolve against pageDir
 * the way a browser resolves them against the page URL.
 */
"use strict";

const Fs = require("fs");
const Path = require("path");
const vm = require("vm");

function makeWorkerClass (pageDir, extraGlobals = {}) {
  return class FakeWorker {
    constructor (scriptUrl) {
      const scriptPath = Path.resolve(pageDir, scriptUrl);
      this.onmessage = null;
      this._terminated = false;

      // the web globals the webpacked bundles reach for (e.g. n3js's
      // abort-controller shim reads self.AbortController at load)
      const webGlobals = {};
      for (const name of ["AbortController", "AbortSignal", "fetch", "Headers",
                          "Request", "Response", "atob", "btoa", "crypto",
                          "performance", "structuredClone"])
        if (name in globalThis)
          webGlobals[name] = globalThis[name];
      const workerGlobal = Object.assign(webGlobals, {
        console, setTimeout, clearTimeout, setInterval, clearInterval,
        URL, TextEncoder, TextDecoder, queueMicrotask,
        postMessage: (data) => {
          if (this._terminated)
            return;
          const cloned = structuredClone(data);
          setTimeout(() => {
            if (!this._terminated && typeof this.onmessage === "function")
              this.onmessage({data: cloned});
          }, 0);
        },
        importScripts: (...urls) => {
          for (const u of urls) {
            const p = Path.resolve(Path.dirname(scriptPath), u);
            vm.runInContext(Fs.readFileSync(p, "utf8"), this._context, {filename: p});
          }
        },
        onmessage: null,
      }, extraGlobals);
      workerGlobal.self = workerGlobal;
      this._workerGlobal = workerGlobal;
      this._context = vm.createContext(workerGlobal);
      vm.runInContext(Fs.readFileSync(scriptPath, "utf8"), this._context, {filename: scriptPath});
    }

    postMessage (data) {
      const cloned = structuredClone(data);
      setTimeout(() => {
        if (this._terminated)
          return;
        const handler = this._workerGlobal.onmessage;
        if (typeof handler === "function")
          handler({data: cloned});
      }, 0);
    }

    terminate () {
      this._terminated = true;
    }
  };
}

module.exports = { makeWorkerClass };
