var EvalExt = "http://shex.io/extensions/Eval/";
const ShEx = {RdfTerm: require('@shexjs/term')} // !! temporary hack; construct semeacts with options/config/context/...

function register (validator) {

  validator.semActHandler.results[EvalExt] = [];
  validator.semActHandler.register(
    EvalExt,
    {
      /**
       * Callback for extension invocation.
       *
       * @param {string} code - text of the semantic action.
       * @param {object} ctx - matched triple or results subset.
       * @param {object} extensionStorage - place where the extension writes into the result structure.
       * @return {bool | [{type: SemActViolation, msg: "..."}]} false if the extension failed or did not accept the ctx object.
       */
      dispatch: function (code, ctx, extensionStorage) {
        return eval(code);
      }
    }
  );
  return validator.semActHandler.results[EvalExt];
}

function done (validator) {
  if (validator.semActHandler.results[EvalExt].length === 0)
    delete validator.semActHandler.results[EvalExt];
}

module.exports = {
  name: "Eval",
  description: `Simple javascript eval.
Each SemAct should return either:
  bool - false if the extension failed or did not accept the ctx object.
  [{type: "SemActViolation", msg: "..."}] - (ideally empty) list of structured errors

url: ${EvalExt}`,
  name: "Eval",
  register: register,
  done: done,
  url: EvalExt
};
