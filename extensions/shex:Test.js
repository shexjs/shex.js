var TestExt = "http://shex.io/extensions/Test/";
function register (validator) {
  var pattern = /^ *(fail|print) *\( *(?:(\"(?:[^\\"]|\\\\|\\")*\")|([spo])) *\) *$/;

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
        var m = code.match(pattern);
        if (!m) {
          throw Error("Invocation error: " + TestExt + " code \"" + code + "\" didn't match " + pattern);
        }
        var arg = m[2] ? m[2] :
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
  register: register,
  done: done,
  url: TestExt
};
