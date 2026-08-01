const EvalExt = "http://shex.io/extensions/Eval/"

function register (validator: any, api: any) {
  if (api === undefined || !('ShExTerm' in api))
    throw Error('SemAct extensions must be called with register(validator, {ShExTerm, ...)')

  validator.semActHandler.results[EvalExt] = []
  return validator.semActHandler.register(
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
      dispatch: function (code: string, ctx: any, extensionStorage: any) {
        // return eval(code) // to enable implicit return
        // '"use strict";' + code to disable writing implicit globals
        return Function('api', 'extensionStorage', code).call(ctx, api, extensionStorage)
      }
    }
  )
}

function done (validator: any) {
  if (validator.semActHandler.results[EvalExt].length === 0)
    delete validator.semActHandler.results[EvalExt]
}

export = {
  name: "Eval",
  description: `Simple javascript eval.
Each SemAct should return either:
  bool - false if the extension failed or did not accept the ctx object.
  [{type: "SemActViolation", msg: "..."}] - (ideally empty) list of structured errors

url: ${EvalExt}`,
  register: register,
  done: done,
  url: EvalExt
}
