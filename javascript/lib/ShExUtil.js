// **ShExUtil** provides ShEx utility functions

var ShExUtil = {
  version: function () {
    return "0.1.0";
  },

  BiDiClosure: function () {
    return {
      needs: {},
      neededBy: {},
      test: function () {
	function expect (l, r) { var ls = JSON.stringify(l), rs = JSON.stringify(r); if (ls !== rs) throw Error(ls+" !== "+rs); }
        // this.add(1, 2); expect(this.needs, { 1:[2]                     }); expect(this.neededBy, { 2:[1]                     });
        // this.add(3, 4); expect(this.needs, { 1:[2], 3:[4]              }); expect(this.neededBy, { 2:[1], 4:[3]              });
        // this.add(2, 3); expect(this.needs, { 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 2:[1], 3:[2,1], 4:[3,2,1] });

        this.add(2, 3); expect(this.needs, { 2:[3]                     }); expect(this.neededBy, { 3:[2]                     });
        this.add(1, 2); expect(this.needs, { 1:[2,3], 2:[3]            }); expect(this.neededBy, { 3:[2,1], 2:[1]            });
        this.add(1, 3); expect(this.needs, { 1:[2,3], 2:[3]            }); expect(this.neededBy, { 3:[2,1], 2:[1]            });
        this.add(3, 4); expect(this.needs, { 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 3:[2,1], 2:[1], 4:[3,2,1] });
        this.add(6, 7); expect(this.needs, { 6:[7]                    , 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 7:[6]                    , 3:[2,1], 2:[1], 4:[3,2,1] });
        this.add(5, 6); expect(this.needs, { 5:[6,7], 6:[7]           , 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 7:[6,5], 6:[5]           , 3:[2,1], 2:[1], 4:[3,2,1] });
        this.add(5, 7); expect(this.needs, { 5:[6,7], 6:[7]           , 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 7:[6,5], 6:[5]           , 3:[2,1], 2:[1], 4:[3,2,1] });
        this.add(7, 8); expect(this.needs, { 5:[6,7,8], 6:[7,8], 7:[8], 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 7:[6,5], 6:[5], 8:[7,6,5], 3:[2,1], 2:[1], 4:[3,2,1] });
	this.add(4, 5);
	expect(this.needs,    { 1:[2,3,4,5,6,7,8], 2:[3,4,5,6,7,8], 3:[4,5,6,7,8], 4:[5,6,7,8], 5:[6,7,8], 6:[7,8], 7:[8] });
	expect(this.neededBy, { 2:[1], 3:[2,1], 4:[3,2,1], 5:[4,3,2,1], 6:[5,4,3,2,1], 7:[6,5,4,3,2,1], 8:[7,6,5,4,3,2,1] });
      },
      add: function (needer, needie) {
	var r = this;
	if (!(needer in r.needs))
	  r.needs[needer] = [];
	if (!(needie in r.neededBy))
	  r.neededBy[needie] = [];

	// // [].concat.apply(r.needs[needer], [needie], r.needs[needie]). emitted only last element
	r.needs[needer] = r.needs[needer].concat([needie], r.needs[needie]).
	  filter(function (el, ord, l) { return el !== undefined && l.indexOf(el) === ord; });
	// // [].concat.apply(r.neededBy[needie], [needer], r.neededBy[needer]). emitted only last element
	r.neededBy[needie] = r.neededBy[needie].concat([needer], r.neededBy[needer]).
	  filter(function (el, ord, l) { return el !== undefined && l.indexOf(el) === ord; });

	if (needer in this.neededBy) this.neededBy[needer].forEach(function (e) {
	  r.needs[e] = r.needs[e].concat([needie], r.needs[needie]).
	    filter(function (el, ord, l) { return el !== undefined && l.indexOf(el) === ord; });
	});

	if (needie in this.needs) this.needs[needie].forEach(function (e) {
	  r.neededBy[e] = r.neededBy[e].concat([needer], r.neededBy[needer]).
	    filter(function (el, ord, l) { return el !== undefined && l.indexOf(el) === ord; })
	});
	// this.neededBy[needie].push(needer);

      },
      trim: function () {
	function _trim (a) {
	  // filter(function (el, ord, l) { return l.indexOf(el) === ord; })
	  for (var i = a.length-1; i > -1; --i)
	    if (a.indexOf(a[i]) < i)
	      a.splice(i, i+1);
	}
	for (k in this.needs)
	  _trim(this.needs[k]);
	for (k in this.neededBy)
	  _trim(this.neededBy[k]);
      }
    }
  },

  getDependencies: function (schema, ret) {
    // Expect property p with value v in object o
    function expect (o, p, v) {
      if (!(p in o))
	this._error("expected "+o+" to have a ."+p);
      if (arguments.length > 2 && o[p] !== v)
	this._error("expected "+o[o]+" to equal ."+v);
    }

    ret = ret || this.BiDiClosure();
    Object.keys(schema.shapes).forEach(function (label) {
      var shape = schema.shapes[label];
      expect(shape, 'type', 'shape');
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
  },

  /** partion: create subset of a schema with only desired shapes and
   * their dependencies.
   *
   * @schema: input schema
   * @partition: shape name or array of desired shape names
   * @deps: (optional) dependency tree from getDependencies.
   */
  partition: function (schema, includes, deps, cantFind) {
    includes = includes instanceof Array ? includes : [includes];
    deps = deps || this.getDependencies(schema);
    cantFind = cantFind || function (what, why) {
      throw new Error("Error: can't find shape "+
		      (why ?
		       why + " dependency " + what :
		       what));
    };
    var partition = {};
    for (var k in schema)
      partition[k] = k === 'shapes' ? {} : schema[k];
    includes.forEach(function (i) {
      if (i in schema.shapes) {
	partition.shapes[i] = schema.shapes[i];
	if (i in deps.needs)
	  deps.needs[i].forEach(function (n) {
	    if (n in schema.shapes)
	      partition.shapes[n] = schema.shapes[n];
	    else
	      cantFind(n, i);
	  });
      } else {
	cantFind(i);
      }
    });
    return partition;
  },
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
