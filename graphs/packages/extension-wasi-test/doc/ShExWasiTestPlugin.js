/**
 * The wasm Test plugin: the Test semantic-action extension
 * (http://shex.io/extensions/Test/) reimplemented in hand-written
 * WebAssembly (@shexjs/extension-wasi-test), on the app's validations.
 * Same grammar and protocol as the Test plugin beside it in
 * extension-test/doc -- load one or the other, not both.
 *
 * The bundle is the WASI extensions' (in extension-wasi/doc, wabt and
 * all, though this module only needs its own .wasm); `init` fetches the
 * module's bytes from lib/ beside this package and hands them to
 * configure({wasm, stdout: false}) -- a browser has no file descriptors,
 * and the printed lines reach the results through the extension itself.
 * `init` rides `applied`, so a manifest entry that loads this plugin is
 * not validated before the module is here.
 */
(function () {
  const PLUGIN_ID = "http://shex.io/extensions/Test/#wasm";
  const BUNDLE = "../../extension-wasi/doc/webpacks/shexwasi-webapp.js";
  const WASM = "../lib/extension-wasi-test.wasm";

  function fetchWasm (base) {
    return fetch(new URL(WASM, base).href).then(function (resp) {
      if (!resp.ok)
        throw Error("GET <" + new URL(WASM, base).href + "> got " + resp.status + " " + resp.statusText);
      return resp.arrayBuffer();
    });
  }

  if (typeof ShExPlugins !== "undefined")
    ShExPlugins.register({
      id: PLUGIN_ID,
      label: "Test (wasm)",
      scripts: [BUNDLE],
      worker: "./ShExWasiTestPlugin.js", // this file again, where a worker app's matcher is
      init: function (_app) {
        const descriptor = this;
        return fetchWasm(descriptor.baseUrl).then(function (bytes) {
          descriptor.module = ShExWebApp.WasiTest.configure({wasm: bytes, stdout: false});
        });
      },
      register: function (validator, api) {
        if (!this.module)   // init rode applied, so only a validation nothing loaded could get here
          throw Error(PLUGIN_ID + ": the wasm module is not loaded");
        return this.module.register(validator, api);
      },
    });

  if (typeof registerWorkerPlugin === "function") {
    importScripts(new URL(BUNDLE, pluginBase).href);
    let module = null;
    registerWorkerPlugin({
      // the fetch, before anything validates (the worker thread awaits ready)
      ready: fetchWasm(pluginBase)
        .then(function (bytes) { module = ShExWebApp.WasiTest.configure({wasm: bytes, stdout: false}); }),
      register: function (validator, api) {
        if (!api.WasiTest)
          return;
        if (!module)   // ready was awaited, so only a thread that skipped it could get here
          throw Error(PLUGIN_ID + ": the wasm module is not loaded");
        module.register(validator, api);
      },
    });
  }
})();
