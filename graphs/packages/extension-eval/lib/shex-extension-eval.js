"use strict";
const EvalExt = "http://shex.io/extensions/Eval/";
function register(validator, api) {
    if (api === undefined || !('ShExTerm' in api))
        throw Error('SemAct extensions must be called with register(validator, {ShExTerm, ...)');
    validator.semActHandler.results[EvalExt] = [];
    return validator.semActHandler.register(EvalExt, {
        /**
         * Callback for extension invocation.
         *
         * @param {string} code - text of the semantic action.
         * @param {object} ctx - matched triple or results subset.
         * @param {object} extensionStorage - place where the extension writes into the result structure.
         * @return {bool | [{type: SemActViolation, msg: "..."}]} false if the extension failed or did not accept the ctx object.
         */
        dispatch: function (code, ctx, extensionStorage) {
            // return eval(code) // to enable implicit return
            // '"use strict";' + code to disable writing implicit globals
            const ret = Function('api', 'extensionStorage', code).call(ctx, api, extensionStorage);
            // The contract above offers a bool; the validator takes only a list
            // (an empty one is success), so say it that way -- `return true`
            // was "unsupported response" for as long as nothing tested this.
            if (ret === true || ret === undefined)
                return [];
            if (ret === false)
                return [{ type: "SemActFailure", errors: ["semantic action " + EvalExt + " returned false: " + code.trim()] }];
            return ret;
        }
    });
}
function done(validator) {
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
    register: register,
    done: done,
    url: EvalExt
};
//# sourceMappingURL=shex-extension-eval.js.map