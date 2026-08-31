/**
 * The Eval plugin: the Eval semantic-action extension
 * (http://shex.io/extensions/Eval/) on the app's validations.
 *
 * One file, both faces (doc/plugins.md): on the page it registers a
 * descriptor whose `register` installs the handler on each validator the
 * app makes; named as its own `worker`, the same file is importScripts'd
 * where a worker app's matcher is and registers the same handler there.
 * The handler is lib/shex-extension-eval.js's, said as a classic script:
 * this extension has nothing to bundle.
 *
 * An action's code runs with `this` as the matched context (`this.triples`
 * on a triple constraint), `api` as ShExWebApp, and `extensionStorage` to
 * write into the result -- it lands under `extensions` in the appinfo.
 * Code from the schema runs in the page: validate schemas you trust.
 */
(function () {
  const EVAL_ID = "http://shex.io/extensions/Eval/";

  function register (validator, api) {
    validator.semActHandler.results[EVAL_ID] = [];
    return validator.semActHandler.register(EVAL_ID, {
      dispatch: function (code, ctx, extensionStorage) {
        const ret = Function("api", "extensionStorage", code).call(ctx, api, extensionStorage);
        // a bool, as the extension's contract offers; the validator takes a
        // list, an empty one for success (lib/shex-extension-eval.js says the same)
        if (ret === true || ret === undefined)
          return [];
        if (ret === false)
          return [{type: "SemActFailure", errors: ["semantic action " + EVAL_ID + " returned false: " + code.trim()]}];
        return ret;
      },
    });
  }

  if (typeof ShExPlugins !== "undefined")
    ShExPlugins.register({
      id: EVAL_ID,
      label: "Eval",
      register,
      worker: "./ShExEvalPlugin.js",   // this file again, where a worker app's matcher is
    });
  if (typeof registerWorkerPlugin === "function")
    registerWorkerPlugin({register});
})();
