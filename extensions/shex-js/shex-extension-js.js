var JsExt = "http://shex.io/extensions/javascript/";

function register (validator) {
  var pattern = /^ *(fail|print) *\( *(?:(\"(?:[^\\"]|\\\\|\\")*\")|([spo])) *\) *$/;

  validator.semActHandler.results[JsExt] = [];
  validator.semActHandler.register(
    JsExt,
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
        return eval(code);
      }
    }
  );
  return validator.semActHandler.results[JsExt];
}

function done (validator) {
  if (validator.semActHandler.results[JsExt].length === 0)
    delete validator.semActHandler.results[JsExt];
}

module.exports = {
  register: register,
  done: done,
  url: JsExt
};
