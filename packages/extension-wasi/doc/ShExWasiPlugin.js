/**
 * The Wasi plugin: the generic WASI semantic-action extension
 * (http://shex.io/extensions/WASI/) on the app's validations -- an
 * action's code is the WAT source of a WASI command, compiled by wabt in
 * the page and run per invocation under the extension's own host shim.
 *
 * One file, both faces (doc/plugins.md): on the page it registers a
 * descriptor whose `scripts` bring the bundle (the extension and wabt,
 * over the core bundle's global) and whose `init` awaits the toolchain --
 * riding `applied`, so a manifest entry that loads this plugin is not
 * validated before wabt is ready.  Named as its own `worker`, the same
 * file registers the same extension where a worker app's matcher is.
 */
(function () {
  const WASI_ID = "http://shex.io/extensions/WASI/";
  const BUNDLE = "webpacks/shexwasi-webapp.js";

  if (typeof ShExPlugins !== "undefined")
    ShExPlugins.register({
      id: WASI_ID,
      label: "Wasi",
      scripts: ["./" + BUNDLE],
      worker: "./ShExWasiPlugin.js",     // this file again, where a worker app's matcher is
      init: function (_app) {
        return ShExWebApp.Wasi.ready(); // wabt, before the first validation
      },
      register: function (validator, api) {
        return api.Wasi.register(validator, api);
      },
    });

  if (typeof registerWorkerPlugin === "function") {
    importScripts(new URL(BUNDLE, pluginBase).href);
    registerWorkerPlugin({
      ready: ShExWebApp.Wasi.ready(),    // wabt, before anything validates
      register: function (validator, api) {
        if (api.Wasi)
          api.Wasi.register(validator, api);
      },
    });
  }
})();
