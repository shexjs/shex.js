// **ShExUtil** provides ShEx utility functions

var ShExUtil = {
  version: function () {
    return "0.1.0";
  },

  getDependencies: function (schema) {
    // Expect property p with value v in object o
    function expect (o, p, v) {
      if (!(p in o))
	this._error("expected "+o+" to have a ."+p);
      if (arguments.length > 2 && o[p] !== v)
	this._error("expected "+o[o]+" to equal ."+v);
    }

    var ret = {
      needs: {},
      neededBy: {},
      add: function (needer, needie) {
	if (!(needer in this.needs))
	  this.needs[needer] = [];
	if (!(needie in this.neededBy))
	  this.neededBy[needie] = [];
	
      },
      trim: function () {
	function _trim (a) {
	  for (var i = a.length-1; i > -1; --i)
	    if (a.indexOf(a[i]) < i)
	      a.splice(i, i+1);
	}
	for (k in this.needs)
	  _trim(this.needs[k]);
	for (k in this.neededBy)
	  _trim(this.neededBy[k]);
      }
    };
    Object.keys(schema.shapes).forEach(function (label) {
      var shape = schema.shapes[label];
      expect(shape, 'type', 'shape');
      if (!(label in ret))
	ret[label] = [];
      var s = ret[label];
      if (shape.inherit && shape.inherit.length > 0)
	shape.inherit.forEach(function (i) {
	  ret.add(label, i);
	});

      function _walkExpression (expr, indent, precedent) {
	function _exprGroup (exprs) {
	  exprs.forEach(function (nested) {
	    _walkExpression(nested)
	  });
	}

	if (expr.type === 'tripleConstraint') {
	  var v = expr.value;
	  expect(v, 'type', 'valueClass');
	  if (v.reference) {
	    if (typeof(v.reference) === "object") {
	      v.reference.conjuncts.forEach(function (c) {
		ret.add(label, c);
	      });
	    } else {
	      ret.add(label, v.reference);
	    }
	  }
	}

	else if (expr.type === 'oneOf') {
	  _exprGroup(expr.expressions, "\n"+indent+"| ");
	}

	else if (expr.type === 'someOf') {
	  _exprGroup(expr.expressions, "\n"+indent+"|| ");
	}

	else if (expr.type === 'group') {
	  _exprGroup(expr.expressions, ",\n"+indent);
	}

	else if (expr.type === 'include') {
	  ret.add(label, expr.include);
	}

	else throw Error("unexpected expr type: " + expr.type);
      }

      _walkExpression(shape.expression, "  ", 4);
    });
    return ret;
  }
};

// Add the ShExUtil functions to the given object or its prototype
function AddShExUtil(parent, toPrototype) {
  for (var name in ShExUtil)
    if (!toPrototype)
      parent[name] = ShExUtil[name];
    else
      parent.prototype[name] = ApplyToThis(ShExUtil[name]);

  return parent;
}

// Returns a function that applies `f` to the `this` object
function ApplyToThis(f) {
  return function (a) { return f(this, a); };
}

// Expose ShExUtil, attaching all functions to it
module.exports = AddShExUtil(AddShExUtil);
