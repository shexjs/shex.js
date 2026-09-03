/**
 * The Test plugin: the Test semantic-action extension
 * (http://shex.io/extensions/Test/), the suite's probe, on the app's
 * validations.
 *
 * One file, both faces (doc/plugins.md): on the page it registers a
 * descriptor whose `register` installs the handler on each validator the
 * app makes; named as its own `worker`, the same file is importScripts'd
 * where a worker app's matcher is and registers the same handler there.
 * The handler is lib/shex-extension-test.js's, said as a classic script:
 * this extension has nothing to bundle.
 *
 * `print(...)` records a line on the validator (the CLI shows them as
 * semActResults); `fail(...)` records it and fails the constraint it is
 * written on, which is what shows in the app: the pair goes red.
 */
(function () {
  const TEST_ID = "http://shex.io/extensions/Test/";

  const term = `(?:("(?:[^\\\\"]|\\\\\\\\|\\\\")*"|'(?:[^\\\\']|\\\\\\\\|\\\\')*')|([spon]))`;
  const pattern = new RegExp(`^ *(fail|print) *\\((( *${term} *,)* *${term}) *\\) *$`);

  function register (validator, api) {
    validator.semActHandler.results[TEST_ID] = [];
    validator.semActHandler.register(TEST_ID, {
      dispatch: function (code, ctx, _extensionStorage) {
        const langMatch = code.match(pattern);
        if (!langMatch)
          throw Error("Invocation error: " + TEST_ID + " code \"" + code + "\" didn't match " + pattern);
        const terms = langMatch[2];
        const args = [];
        const termMatcher = new RegExp(` *${term} *,?`, "g"); // commas already enforced above
        let termMatch = null;
        while ((termMatch = termMatcher.exec(terms)) !== null)
          args.push(termMatch[1] ? parseStr(termMatch[1]) : parsePos(termMatch[2]));
        const line = args.join("");
        validator.semActHandler.results[TEST_ID].push(line);
        return langMatch[1] === "fail" ? [{type: "SemActFailure", errors: [`fail(${line})`]}] : [];

        function parseStr (wrapped) {
          // strip delimiters, then decode the sanctioned escapes in one pass
          return wrapped.substring(1, wrapped.length - 1).replace(/\\([\\\\"'])/g, "$1");
        }
        function parsePos (pos) {
          const node = pos === "n"
                ? ctx.node
                : ctx.triples[0][pos === "s" ? "subject" : pos === "p" ? "predicate" : "object"];
          return node.termType === "Literal" && node.datatype.value !== api.ShExTerm.XsdString
            ? api.ShExTerm.rdfJsTerm2Turtle(node)
            : node.value;
        }
      },
    });
    return validator.semActHandler.results[TEST_ID];
  }

  if (typeof ShExPlugins !== "undefined")
    ShExPlugins.register({
      id: TEST_ID,
      label: "Test",
      register,
      worker: "./ShExTestPlugin.js",   // this file again, where a worker app's matcher is
    });
  if (typeof registerWorkerPlugin === "function")
    registerWorkerPlugin({register});
})();
