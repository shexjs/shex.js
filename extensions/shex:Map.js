/*
 * TODO
 *   templates: @<foo> %map:{ my:specimen.container.code=.1.code, my:specimen.container.disp=.1.display %}
 *   node identifiers: @foo> %map:{ foo.id=substr(20) %}
 *   multiplicity: ...
 */
var N3 = require("n3");
var N3Util = N3.Util;
var ShExUtil = require("../lib/ShExUtil");

var MapExt = "http://shex.io/extensions/Map/#";
var pattern = /^ *(?:<([^>]*)>|([^:]*):([^ ]*)) *$/;
function register (validator) {
  var prefixes = validator.schema.prefixes;

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
      dispatch: function (code, ctx, extensionStorage) {
        var transform = function (val) { return val; }
        var func = code.match(/^ *toISO\((.*?)\) *$/);
        if (func) {
          code = func[1];
          transform = function (val) {
            var d = val.match(/^"(1?[0-9])\/([1-3]?[0-9])\/([0-9]{4}) ([1-2]?[0-9]):([1-5]?[0-9])"$/);
            return `"${d[3]}-${d[1]}-${d[2]}T${d[4]}:${d[5]}"^^http://www.w3.org/2001/XMLSchema#`;
          }
        }
        var m = code.match(pattern);
        if (!m) {
          throw Error("Invocation error: " + MapExt + " code \"" + code + "\" didn't match " + pattern);
        }
        function fail (msg) { var e = Error(msg); Error.captureStackTrace(e, fail); throw e; }
        var arg = m[1] ? m[1] :
            m[2] in prefixes ? (prefixes[m[2]] + m[3]) :
            fail("unknown prefix " + m[2] + " in \"" + code + "\".");
        validator.semActHandler.results[MapExt][arg] = ctx.object;
        if (!(arg in extensionStorage))
          extensionStorage[arg] = [];
        extensionStorage[arg].push(transform(ctx.object));
        return true;
      }
    }
  );
  return validator.semActHandler.results[MapExt];
}

function done (validator) {
  if (Object.keys(validator.semActHandler.results[MapExt]).length === 0)
    delete validator.semActHandler.results[MapExt];
}

function materializer (schema, nextBNode) {
  var blankNodeCount = 0;
  nextBNode = nextBNode || function () {
    return '_:b' + blankNodeCount++;
  };
  return {
    materialize: function (bindings, createRoot, target) {
      target = target || N3.Store();
      target.addPrefixes(schema.prefixes); // not used, but seems polite

      // utility functions for e.g. s = add(B(), P(":value"), L("70", P("xsd:float")))
      function P (pname) { return N3Util.expandPrefixedName(pname, schema.prefixes); }
      function L (value, modifier) { return N3Util.createLiteral(value, modifier); }
      function B () { return nextBNode(); }
      function add (s, p, o) { target.addTriple({ subject: s, predicate: p, object: o }); return s; }

      var curSubject = createRoot || B();

      var v = ShExUtil.Visitor();
      var oldVisitShapeRef = v.visitShapeRef;

      v.visitShapeRef = function (shapeRef) {
        this.visitShape(schema.shapes[shapeRef.reference], shapeRef.reference);
        return oldVisitShapeRef.call(v, shapeRef);
      };

      v.visitValueRef = function (r) {
        this.visitShape(schema.shapes[r.reference], r.reference);
        return this._visitValue(r);
      };

      v.visitTripleConstraint = function (expr) {
        var mapExts = (expr.semActs || []).filter(function (ext) { return ext.name === MapExt; });
        if (mapExts.length) {
          mapExts.forEach(function (ext) {
            var code = ext.code;
            var m = code.match(pattern);
            if (!m) {
              throw Error("Invocation error: " + MapExt + " code \"" + code + "\" didn't match " + pattern);
            }
            var arg = m[1] ? m[1] : P(m[2] + ":" + m[3]); if (!(arg in bindings)) console.warn(arg); 
            add(curSubject, expr.predicate, bindings[arg]);
          });
        } else if ("values" in expr.valueExpr && expr.valueExpr.values.length === 1) {
          add(curSubject, expr.predicate, expr.valueExpr.values[0]);
        } else {
          var oldSubject = curSubject;
          curSubject = B();
          add(oldSubject, expr.predicate, curSubject);
          this._maybeSet(expr, { type: "TripleConstraint" }, "TripleConstraint",
                         ["inverse", "negated", "predicate", "valueExprRef", "valueExpr",
                          "min", "max", "annotations", "semActs"])
          curSubject = oldSubject;
        }
      };

      v.visitShapeExpr(schema.start, "_: -start-");
      return target;
    }
  };
}

function extractBindings (soln, min, max, depth) {
  if ("min" in soln && soln.min < min)
    min = soln.min
  var myMax = "max" in soln ?
      (soln.max === "*" ?
       Infinity :
       soln.max) :
      1;
  if (myMax > max)
    max = myMax

  function walkExpressions (s) {
    return s.expressions.reduce((inner, e) => {
      return inner.concat(extractBindings(e, min, max, depth+1));
    }, []);
  }

  function walkTriple (s) {
    var fromTriple = "extensions" in s && MapExt in s.extensions ?
        [{ depth: depth, min: min, max: max, obj: s.extensions[MapExt] }] :
        [];
    return "referenced" in s ?
      fromTriple.concat(extractBindings(s.referenced.solution, min, max, depth+1)) :
      fromTriple;
  }

  function structuralError (msg) { throw Error(msg); }

  var walk = // function to explore each solution
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

module.exports = {
  register: register,
  extractBindings: extractBindings,
  done: done,
  materializer: materializer,
  url: MapExt
};
