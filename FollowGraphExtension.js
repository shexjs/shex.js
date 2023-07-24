const N3 = require('n3');
// import {SemActFailure} from "@shexjs/term/shexv";

const FollowGraphExt = "http://shex.io/extensions/FollowGraph/";
class FollowGraph {
  constructor (getValidator, theirFetch) {

    return {
      name: "FollowGraph",
      description: `Validate with fetch
url: ${FollowGraphExt}`,
      register: register,
      done: done,
      url: FollowGraphExt
    };

    function register (validator, api, schemaMeta) {
      if (api === undefined || !('ShExTerm' in api))
        throw Error('SemAct extensions must be called with register(validator, {ShExTerm, ...)')

      const pattern = /^ @(?:<(.*)>|([a-zA-Z0-9_]*):([a-zA-Z0-9_]*)) *$/;

      validator.semActHandler.results[FollowGraphExt] = [];
      validator.semActHandler.register(
        FollowGraphExt,
        {
          /**
           * Callback for extension invocation.
           *
           * @param {string} code - text of the semantic action.
           * @param {object} ctx - matched triple or results subset.
           * @param {object} extensionStorage - place where the extension writes into the result structure.
           * @return {bool} false if the extension failed or did not accept the ctx object.
           */
          dispatch: async function (code, ctx, extensionStorage)/*: Promise<SemActFailure>*/ {
            const nodeStr = ctx.triples[0].object.value;
            const m = code.match(pattern);
            if (!m) {
              throw Error("Invocation error: " + FollowGraphExt + " code \"" + code + "\" didn't match " + pattern);
            }
            const [relative, prefix, lname] = m.slice(1);
            const shapeExprLabel = relative
                  ? new URL(relative, schemaMeta.base).href
                  : schemaMeta.prefixes[prefix] + lname
            validator.semActHandler.results[FollowGraphExt].push({nodeStr, shape: shapeExprLabel});
            const resp = await theirFetch(nodeStr);
            const text = await resp.text();
            // const validator = getValidator();
            const parser = new N3.Parser({format: "application/trig", baseIRI: nodeStr});
            const store = new N3.Store();
            store.addQuads(parser.parse(text));
            const node = N3.DataFactory.namedNode(nodeStr);
            const res = await validator.validateNodeShapePair(node, shapeExprLabel);
            const errors = (res.errors || [])//.map(e => ({ type: "SemActFailure", errors: [JSON.stringify(e)] }));
            return errors;
          }
        }
      );
      return validator.semActHandler.results[FollowGraphExt];
    }

    function done (validator) {
      if (validator.semActHandler.results[FollowGraphExt].length === 0)
        delete validator.semActHandler.results[FollowGraphExt];
    }
  }
}

module.exports = FollowGraph;
