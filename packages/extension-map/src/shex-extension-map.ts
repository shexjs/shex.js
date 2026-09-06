/*
 * TODO
 *   templates: @<foo> %map:{ my:specimen.container.code=.1.code, my:specimen.container.disp=.1.display %}
 *   node identifiers: @foo> %map:{ foo.id=substr(20) %}
 *   multiplicity: ...
 */

const {rdfJsTerm2Ld} = require("@shexjs/term");

const ShExMapCjsModule = function (config: any) {

const ShExTerm = require("@shexjs/term");
const extensions = require("./extensions");
const {ShExVisitor, ShExIndexVisitor} = require("@shexjs/visitor");
const ShExUtil = require("@shexjs/util");
const N3Util = require("n3/lib/N3Util");
const N3DataFactory = require("n3/lib/N3DataFactory").default;
const materializer = require("./ShExMaterializer")(config);
const StringToRdfJs = require("./stringToRdfJs");

const MapExt = "http://shex.io/extensions/Map/#";
const pattern = /^ *(?:<([^>]*)>|([^:]*):([^ ]*)) *$/;

const UNBOUNDED = -1;
const MAX_MAX_CARD = 50; // @@ don't repeat forever during dev experiments.

function register (validator: any, api: any) {
  if (api === undefined || !('ShExTerm' in api))
    throw Error('SemAct extensions must be called with register(validator, {ShExTerm, ...)')

  class MaterializerVisitor extends ShExVisitor {
    tc: any;
    index: any;
    curSubjectx: any;

    constructor (tc: any, index: any, curSubjectx?: any) {
      super();
      this.tc = tc;
      this.index = index;
      this.curSubjectx = curSubjectx;
    }

    visitShapeRef (shapeRef: any, ...args: any[]) {
      this.visitShapeDecl(this.index.shapeExprs[shapeRef], ...args);
      return super.visitShapeRef(shapeRef, ...args);
    };

    visitValueRef (r: any, ...args: any[]) {
      this.visitTripleExpr(validator.schema.shapes[r], r, ...args);
      return this._visitValue(r, ...args);
    };

    visitTripleConstraint (expr: any, curSubjectx?: any, nextBNode?: any, target?: any, materializer?: any, schema?: any, bindings?: any) {
      this.tc(expr, curSubjectx, nextBNode, target, materializer, schema, bindings);
    };
  }

  const prefixes = "_prefixes" in validator.schema ?
      validator.schema._prefixes :
      {};

  validator.semActHandler.results[MapExt] = {};
  validator.semActHandler.register(
    MapExt,
    {
      /**
       * Callback for extension invocation.
       *
       * @param {string} code - text of the semantic action.
       * @param {object} ctx - matched triple or results subset.
       * @param {object} extensionStorage - place where the extension writes into the result structure.
       * @return {bool} false if the extension failed or did not accept the ctx object.
       */
      dispatch: function (code: any, ctx: any, extensionStorage: any) {
        function fail (msg: any) { const e = Error(msg); if ("captureStackTrace" in Error) Error.captureStackTrace(e, fail); throw e; }
        function getPrefixedName(bindingName: any) {
           // already have the fully prefixed binding name ready to go
           if (typeof bindingName === "string") return bindingName;

           // bindingName is from a pattern match - need to get & expand it with prefix
            const prefixedName = bindingName[1] ? bindingName[1] :
                bindingName[2] in prefixes ? (prefixes[bindingName[2]] + bindingName[3]) :
                fail("unknown prefix " + bindingName[2] + " in \"" + code + "\".");
            return prefixedName;
        }

        const update = function(bindingName: any, value: any) {

            if (!bindingName) {
               throw Error("Invocation error: " + MapExt + " code \"" + code + "\" didn't match " + pattern);
            }

            const prefixedName = getPrefixedName(bindingName);
            const quotedValue = rdfJsTerm2Ld(value);

            validator.semActHandler.results[MapExt][prefixedName] = quotedValue;
            extensionStorage[prefixedName] = quotedValue;
        };

        // Do we have a map extension function?
        const funcArg = code.match(/^\s*[a-zA-Z0-9]+\((.*)\)\s*$/)
        if (funcArg) {
          const results = extensions.lift(code, ctx.triples[0].object.value, prefixes);
          for (const key in results)
            update(key, N3DataFactory.literal(results[key]));
        } else {
          const bindingName = code.match(pattern);
          if (ctx.node) {
            update(bindingName, ctx.node);
          } else {
            const inverse = ctx.tripleExpr.type === 'TripleConstraint' && ctx.tripleExpr.inverse;
            update(bindingName, inverse ? ctx.triples[0].subject : ctx.triples[0].object);
          }
        }

        return []; // There are no evaluation failures. Any parsing problem throws.
      }
    }
  );
  return {
    results: validator.semActHandler.results[MapExt],
    binder,
    trivialMaterializer,
    visitTripleConstraint
  }

function visitTripleConstraint (expr: any, curSubjectx: any, nextBNode: any, target: any, visitor: any, schema: any, bindings: any, recurse: any, direct: any, checkValueExpr: any) {
      // utility functions for e.g. s = add(B(), P(":value"), L("70", P("xsd:float")))
      function P (pname: any) { return expandPrefixedName(pname, schema._prefixes); }
      function L (value: any, modifier: any) { return N3Util.createLiteral(value, modifier); }
      function B () { return nextBNode(); }
      function add (s: any, p: any, o: any) {
        target.addQuad(StringToRdfJs.n3idQuad2RdfJs(s, p, o));
        return s;
      }

        const mapExts = (expr.semActs || []).filter(function (ext: any) { return ext.name === MapExt; });
        if (mapExts.length) {
          mapExts.forEach(function (ext: any) {
            const code = ext.code;
            const m = code.match(pattern);

            let tripleObject;
            if (m) { 
              const arg = m[1] ? m[1] : P(m[2] + ":" + m[3]);
              const val = n3ify(bindings.get(arg));
              if (val !== undefined) {
                tripleObject = val;
              }
            }

            // Is the arg a function? Check if it has parentheses and ends with a closing one
            if (tripleObject === undefined) {
              const funcArg = code.match(/^\s*[a-zA-Z0-9]+\((.*)\)\s*$/)
              if (funcArg)
                tripleObject = extensions.lower(code, bindings, schema._prefixes, funcArg[1]);
            }

            if (tripleObject === undefined)
              { /* console.warn('Not in bindings: ',code); */ }
            else if (expr.inverse)
              add(tripleObject, expr.predicate, curSubjectx.cs);
            else
              add(curSubjectx.cs, expr.predicate, tripleObject);
          });

        } else if (typeof expr.valueExpr !== "string" && "values" in expr.valueExpr && expr.valueExpr.values.length === 1) {
          if (expr.inverse)
            add(expr.valueExpr.values[0], expr.predicate, curSubjectx.cs);
          else
            add(curSubjectx.cs, expr.predicate, n3ify(expr.valueExpr.values[0]));

        } else {
          const oldSubject = curSubjectx.cs;
          let maxAdd = "max" in expr ? expr.max === UNBOUNDED ? Infinity : expr.max : 1;
          if (maxAdd > MAX_MAX_CARD)
            maxAdd = MAX_MAX_CARD;
          if (!recurse)
            maxAdd = 1; // no grounds to know how much to repeat.
          for (let repetition = 0; repetition < maxAdd; ++repetition) {
            curSubjectx.cs = B();
            if (recurse) {
              const res = checkValueExpr(StringToRdfJs.n3idTerm2RdfJs(curSubjectx.cs), expr.valueExpr, recurse, direct)
              if ("errors" in res)
                break;
            }
            if (expr.inverse)
              add(curSubjectx.cs, expr.predicate, oldSubject);
            else
              add(oldSubject, expr.predicate, curSubjectx.cs);
          }
          visitor._maybeSet(expr, { type: "TripleConstraint" }, "TripleConstraint",
                         ["inverse", "negated", "predicate", "valueExpr",
                          "min", "max", "annotations", "semActs"], null, curSubjectx, nextBNode, target, visitor, schema, bindings)
          curSubjectx.cs = oldSubject;
        }
      }

function trivialMaterializer (schema: any, nextBNode: any) {
  let blankNodeCount = 0;
  const index = schema._index || ShExIndexVisitor.index(schema);
  nextBNode = nextBNode || function () {
    return '_:b' + blankNodeCount++;
  };
  return {
    materialize: function (bindings: any, createRoot: any, shape: any, target: any) {
      shape = !shape || shape === validator.Start
        ? schema.start
        : schema.shapes.indexOf(shape) !== -1
        ? shape
        : (this as any)._lookupShape(shape);
      target = target || new config.rdfjs.Store();
      // target.addPrefixes(schema.prefixes); // not used, but seems polite

      // utility functions for e.g. s = add(B(), P(":value"), L("70", P("xsd:float")))
      function P (pname: any) { return expandPrefixedName(pname, schema.prefixes); }
      function L (value: any, modifier: any) { return N3Util.createLiteral(value, modifier); }
      function B () { return nextBNode(); }
      function add (s: any, p: any, o: any) { target.addTriple({ subject: s, predicate: p, object: n3ify(o) }); return s; }

      const curSubject = createRoot || B();
      const curSubjectx = {cs: curSubject};

      const v = new MaterializerVisitor(visitTripleConstraint, index);
      v.visitShapeExpr(shape, curSubjectx, nextBNode, target, v, schema, bindings);// , curSubjectx, nextBNode, target, materializer
      return target;
    }
  };
}

function binder (tree: any) {
  let stack: any = []; // e.g. [2, 1] for v="http://shex.io/extensions/Map/#BPDAM-XXX"
  const globals: any = {}; // !! delme
  //

  /**
   * returns: { const->count }
   */
  function _mults (obj: any): any {
    const rays: any[] = [];
    const objs: any[] = [];
    const counts = Object.keys(obj).reduce((r: any, k: any) => {
      let toAdd = null;
      if (typeof obj[k] === "object" && !("value" in obj[k])) {
        toAdd = _mults(obj[k]);
        if (Array.isArray(obj[k]))
          rays.push(k);
        else
          objs.push(k);
      } else {
        // variable name.
        toAdd = _make(k, 1);
      }
      return _add(r, toAdd);
    }, {});
    if (rays.length > 0) {
      objs.forEach((i: any) => {
        const novel = Object.keys(obj[i]).filter((k: any) => {
          return counts[k] === 1;
        });
        if (novel.length) {
          const n2 = novel.reduce((r: any, k: any) => {
            r[k] = obj[i][k];
            return r;
          }, {});
          rays.forEach((l: any) => {
            _cross(obj[l], n2);
          });
        }
      });
      objs.reverse();
      objs.forEach((i: any) => {
        obj.splice(i, 1); // remove object from tree
      });
    }
    return counts;
  }
  function _add (l: any, r: any) {
    const ret = Object.assign({}, l);
    return Object.keys(r).reduce((ret: any, k: any) => {
      const add = k in r ? r[k] : 1;
      ret[k] = k in ret ? ret[k] + add : add;
      return ret;
    }, ret);
  }
  function _make (k: any, v: any) {
    const ret: any = {};
    ret[k] = v;
    return ret;
  }
  function _cross (list: any, map: any) {
    for (let listIndex in list) {
      if (Array.isArray(list[listIndex])) {
        _cross(list[listIndex], map);
      } else {
        Object.keys(map).forEach((mapKey: any) => {
          if (mapKey in list[listIndex])
            throw Error("unexpected duplicate key: " + mapKey + " in " + JSON.stringify(list[listIndex]));
          list[listIndex][mapKey] = map[mapKey];
        });
      }
    };
  }
  _mults(tree);
  function _simplify (list: any) {
    const ret = list.reduce((r: any, elt: any) => {
      return r.concat(
        Array.isArray(elt) ?
          _simplify(elt) :
          elt
      );
    }, []);
    return ret.length === 1 ? ret[0] : ret;
  }
  tree = Array.isArray(tree) ? _simplify(tree) : [tree]; // expects an array

  // const globals = tree.reduce((r: any, e: any, idx: any) => {
  //   if (!Array.isArray(e)) {
  //     Object.keys(e).forEach((k: any) => {
  //       r[k] = e[k];
  //     });
  //     removables.unshift(idx); // higher indexes at the left
  //   }
  //   return r;
  // }, {});

  function getter (v: any) {
    // work with copy of stack while trying to grok this problem...
    if (stack === null)
      return undefined;
    if (v in globals)
      return globals[v];
    const nextStack = stack.slice();
    let next = diveIntoObj(nextStack); // no effect if in obj
    while (!(v in next)) {
      let last;
      while(!Array.isArray(next)) {
        last = nextStack.pop();
        next = getObj(nextStack);
      }
      if (next.length === last+1) {
        stack = null;
        return undefined;
      }
      nextStack.push(last+1);
      next = diveIntoObj(nextStack);
      // console.log("advanced to " + nextStack);
      // throw Error ("can't advance to find " + v + " in " + JSON.stringify(next));
    }
    stack = nextStack.slice();
    const ret = next[v];
    delete next[v];
    return ret;

    function getObj (s: any) {
      return s.reduce(function (res: any, elt: any) {
        return res[elt];
      }, tree);
    }

    function diveIntoObj (s: any) {
      while (Array.isArray(getObj(s)))
        s.push(0);
      return getObj(s);
    }
  };
  return {get: getter};
}

}

function done (validator: any) {
  if (Object.keys(validator.semActHandler.results[MapExt]).length === 0)
    delete validator.semActHandler.results[MapExt];
}

function n3ify (ldterm: any) {
  if (typeof ldterm !== "object")
    return ldterm;
  const ret = "\"" + ldterm.value + "\"";
  if ("language" in ldterm)
    return ret + "@" + ldterm.language;
  if ("type" in ldterm)
    return ret + "^^" + ldterm.type;
  return ret;
}

  // Expands the prefixed name to a full IRI (also when it occurs as a literal's type)
  function expandPrefixedName (prefixedName: any, prefixes: any) {
    const match = /(?:^|"\^\^)([^:\/#"'\^_]*):[^\/]*$/.exec(prefixedName);
    let prefix: any, base: any, index: any;
    if (match)
      prefix = match[1], base = prefixes[prefix], index = match.index;
    if (base === undefined)
      return prefixedName;

    // The match index is non-zero when expanding a literal's type
    return index === 0 ? base + prefixedName.substr(prefix.length + 1)
                       : prefixedName.substr(0, index + 3) +
                         base + prefixedName.substr(index + prefix.length + 4);
  }

function extractBindingsDelMe (soln: any, min: any, max: any, depth: any) {
  if ("min" in soln && soln.min < min)
    min = soln.min
  const myMax = "max" in soln ?
      (soln.max === UNBOUNDED ?
       Infinity :
       soln.max) :
      1;
  if (myMax > max)
    max = myMax

  function walkExpressions (s: any) {
    return s.expressions.reduce((inner: any, e: any) => {
      return inner.concat(extractBindingsDelMe(e, min, max, depth+1));
    }, []);
  }

  function walkTriple (s: any) {
    const fromTriple = "extensions" in s && MapExt in s.extensions ?
        [{ depth: depth, min: min, max: max, obj: s.extensions[MapExt] }] :
        [];
    return "referenced" in s ?
      fromTriple.concat(extractBindingsDelMe(s.referenced.solution, min, max, depth+1)) :
      fromTriple;
  }

  function structuralError (msg: any) { throw Error(msg); }

  const walk = // function to explore each solution
      soln.type === "someOfSolutions" ||
      soln.type === "eachOfSolutions" ? walkExpressions :
      soln.type === "tripleConstraintSolutions" ? walkTriple :
      structuralError("unknown type: " + soln.type);

  if (myMax > 1) // preserve important associations:
    // map: e.g. [[1,2],[3,4]]
    // [walk(soln.solutions[0]), walk(soln.solutions[1]),...]
    return soln.solutions.map(walk);
  else // hide unimportant nesting:
    // flatmap: e.g. [1,2,3,4]
    // [].concat(walk(soln.solutions[0])).concat(walk(soln.solutions[1]))...
    return [].concat.apply([], soln.solutions.map(walk));
}

return {
  register: register,
  done: done,
  materializer: materializer,
  ThreadedMaterializer: require("./ThreadedMaterializer").ThreadedMaterializer,
  MaterializerDebugger: require("./ThreadedMaterializer").MaterializerDebugger,
  MaterializationError: require("./ThreadedMaterializer").MaterializationError,
  tripleConstraints: require("./ThreadedMaterializer").tripleConstraints,
  // binder: binder,
  url: MapExt,
  // visitTripleConstraint: myvisitTripleConstraint
  extension: {
    hashmap: require("./hashmap_extension"),
    regex: require("./regex_extension")
  },
  extensions: require("./extensions"),
  utils: require("./extension-utils"),
};

};

export = ShExMapCjsModule;
