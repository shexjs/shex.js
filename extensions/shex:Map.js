var N3 = require("n3");
var N3Util = N3.Util;
var ShExUtil = require("../lib/ShExUtil");

var MapExt = "http://shex.io/extensions/Map/#";
  var pattern = /^ *(?:<([^>]*)>|([^:]*):([^:]*)) *$/;
function register (validator) {
  var prefixes = validator.schema.prefixes;

  validator.semActHandler.results[MapExt] = {};
  validator.semActHandler.register(
    MapExt,
    {
      dispatch: function (code, ctx) {
        var m = code.match(pattern);
        if (!m) {
          throw Error("Invocation error: " + MapExt + " code \"" + code + "\" didn't match " + pattern);
        }
        var arg = m[1] ? m[1] : prefixes[m[2]] + m[3];
        validator.semActHandler.results[MapExt][arg] = ctx.object;
        return true;
      }
    }
  );
  return validator.semActHandler.results[MapExt];
}

function materializer (schema) {
  return {
    materialize: function (bindings, createRoot) {
      var ret = N3.Store();
      var blankNodeCount = 0;
      ret.addPrefixes(schema.prefixes); // not used, but seems polite

      // utility functions for e.g. s = add(B(), P(":value"), L("70", P("xsd:float")))
      function P (pname) { return N3Util.expandPrefixedName(pname, schema.prefixes); }
      function L (value, modifier) { return N3Util.createLiteral(value, modifier); }
      function B () { return '_:b' + blankNodeCount++; }
      function add (s, p, o) { ret.addTriple({ subject: s, predicate: p, object: o }); return s; }

      var curSubject = createRoot || B();

      var v = ShExUtil.Visitor();

      v.visitReference = function (r) {
        this.visitShape(schema.shapes[r], r);
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
            var arg = m[1] ? m[1] : P(m[2] + ":" + m[3]);
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

      v.visitShape(schema.shapes[schema.start], schema.start);
      return ret;
    }
  };
}

module.exports = {
  register: register,
  materializer: materializer,
  url: MapExt
};
