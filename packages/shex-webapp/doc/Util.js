
Util = (function () {
  return {
    indexKey: indexKey,
    indexShapeMap: indexShapeMap,
    createResults: createResults
  };

  function indexKey (node, shape) {
    return node+'@'+shape;
  }

  function indexShapeMap (fixedMap) {
    return fixedMap.reduce((ret, ent) => {
      ret[indexKey(ent.node, ent.shape)] = ent;
      return ret;
    }, {});
  }

  function createResults () {
    var _shapeMap = [];
    var known = {};
    return {
      // Get results ShapeMap.
      getShapeMap: function () {
        return _shapeMap.length === 0 ?
          null :
          _shapeMap.length === 1 ?
          _shapeMap[0] :
          "errors" in _shapeMap[0] ?
          { type: "FailureList", errors: _shapeMap } :
        { type: "SolutionList", solutions: _shapeMap };
      },

      // Add entries to results ShapeMap.
      merge: function (toAdd) {
        toAdd.forEach(ent => {
          var key = indexKey(ent.node, ent.shape);
          if (!(key in known)) {
            _shapeMap.push(ent);
            known[key] = ent;
          }
        });
        return this;
      },

      has: function (ent) {
        var key = indexKey(ent.node, ent.shape);
        return (key in known);
      },

      report: function () {
        log("<span class=\"results\">" + _shapeMap.map(elt => {
          return "<span class=\"" + elt.status + "\">" + elt.node + "@" + (elt.status === "fail" ? "!" : "") + elt.shape + "</span>";
        }).join("<br />\n") + "</span>");
      }
    };
  }
})();
