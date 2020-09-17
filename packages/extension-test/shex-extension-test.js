const TestExt = "http://shex.io/extensions/Test/";
function register (validator, api) {
  if (api === undefined || !('ShExTerm' in api))
    throw Error('SemAct extensions must be called with register(validator, {ShExTerm, ...)')

  const pattern = /^ *(fail|print) *\( *(?:(\"(?:[^\\"]|\\\\|\\")*\")|([spo])) *\) *$/;

  validator.semActHandler.results[TestExt] = [];
  validator.semActHandler.register(
    TestExt,
    {
      /**
       * Callback for extension invocation.
       *
       * @param {string} code - text of the semantic action.
       * @param {object} ctx - matched triple or results subset.
       * @param {object} extensionStorage - place where the extension writes into the result structure.
       * @return {bool} false if the extension failed or did not accept the ctx object.
       */
      dispatch: function (code, ctx, extensionStorage) {
        const m = code.match(pattern);
        if (!m) {
          throw Error("Invocation error: " + TestExt + " code \"" + code + "\" didn't match " + pattern);
        }
        const arg = m[2] ? m[2] :
          m[3] === "s" ? ctx.subject :
          m[3] === "p" ? ctx.predicate :
          m[3] === "o" ? ctx.object :
          "???";
        validator.semActHandler.results[TestExt].push(arg);
        return m[1] !== "fail"; // "fail" => false, "print" => true
      }
    }
  );
  return validator.semActHandler.results[TestExt];
}

function done (validator) {
  if (validator.semActHandler.results[TestExt].length === 0)
    delete validator.semActHandler.results[TestExt];
}

module.exports = {
  name: "Test",
  description: `Simple test extension used in the shexTest test suite
url: ${TestExt}`,
  register: register,
  done: done,
  url: TestExt
};
