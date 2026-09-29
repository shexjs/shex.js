/**
 * The PathAssert plugin: the PathAssert semantic-action extension
 * (http://shex.io/extensions/PathAssert/) on the app's validations -- an
 * action's code is an XPath-style expression over the graph, read through
 * whatever data source the app is validating against, and the action
 * passes when the expression is true.
 *
 * One file, both faces (doc/plugins.md): on the page it registers a
 * descriptor whose `scripts` bring the bundle (the extension over the core
 * bundle's global; it is small); named as its own `worker`, the same file
 * registers the same extension where a worker app's matcher is.
 */
(function () {
  const ASSERT_ID = "http://shex.io/extensions/PathAssert/";
  const BUNDLE = "webpacks/shexpathassert-webapp.min.js";

  if (typeof ShExPlugins !== "undefined")
    ShExPlugins.register({
      id: ASSERT_ID,
      label: "PathAssert",
      scripts: ["./" + BUNDLE],
      worker: "./ShExPathAssertPlugin.js",     // this file again, where a worker app's matcher is
      register: function (validator, api) {
        return api.PathAssert.register(validator, api);
      },
    });

  if (typeof registerWorkerPlugin === "function") {
    importScripts(new URL(BUNDLE, pluginBase).href);
    registerWorkerPlugin({
      register: function (validator, api) {
        if (api.PathAssert)
          api.PathAssert.register(validator, api);
      },
    });
  }
})();
