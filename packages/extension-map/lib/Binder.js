
class Binder {
  constructor (resultBindings, staticBindings = {}) {
    this.resultBindings = resultBindings;
    this.staticBindings = staticBindings;
    this.reset();
  }

  reset () {
    this.stack = []; // e.g. [2, 1] for v="http://shex.io/extensions/Map/#BPDAM-XXX"
    let tree = JSON.parse(JSON.stringify(this.resultBindings));
    Binder._mults(tree); // side effects in tree.
    this.tree = Array.isArray(tree) ? Binder._simplify(tree) : [tree]; // expects an array
  }

  get (v) {
    // work with copy of this.stack while trying to grok this problem...
    if (this.stack === null)
      return undefined;
    if (v in this.staticBindings)
      return this.staticBindings[v];
    const nextStack = this.stack.slice();
    let next = this.diveIntoObj(nextStack); // no effect if in obj
    while (!(v in next)) {
      let last;
      while(!Array.isArray(next)) {
        last = nextStack.pop();
        next = this.getObj(nextStack);
      }
      if (next.length === last+1) {
        this.stack = null;
        return undefined;
      }
      nextStack.push(last+1);
      next = this.diveIntoObj(nextStack);
      // console.log("advanced to " + nextStack);
      // throw Error ("can't advance to find " + v + " in " + JSON.stringify(next));
    }
    this.stack = nextStack.slice();
    const ret = next[v];
    delete next[v];
    return ret;
  };

  getObj (s) {
    return s.reduce(function (res, elt) {
      return res[elt];
    }, this.tree);
  }

  diveIntoObj (s) {
    while (Array.isArray(this.getObj(s)))
      s.push(0);
    return this.getObj(s);
  }
  debug () {
    return `this.staticBindings: ${JSON.stringify(this.staticBindings)}, this.stack: ${JSON.stringify(this.stack)}, this.tree: ${JSON.stringify(this.tree)}`;
  }

  /**
   * returns: { const->count }
   */
  static _mults (obj) {
    const rays = [];
    const objs = [];
    const counts = Object.keys(obj).reduce((r, k) => {
      let toAdd = null;
      if (typeof obj[k] === "object" && !("value" in obj[k])) {
        toAdd = Binder._mults(obj[k]);
        if (Array.isArray(obj[k]))
          rays.push(k);
        else
          objs.push(k);
      } else {
        // variable name.
        toAdd = Binder._make(k, 1);
      }
      return Binder._add(r, toAdd);
    }, {});
    if (rays.length > 0) {
      for (const i in objs) {
        const novel = Object.keys(obj[i]).filter(k => {
          return counts[k] === 1;
        });
        if (novel.length) {
          const n2 = novel.reduce((r, k) => {
            r[k] = obj[i][k];
            return r;
          }, {});
          for (const l of rays) {
            Binder._cross(obj[l], n2);
          };
        }
      };
      objs.reverse();
      objs.forEach(i => {
        obj.splice(i, 1); // remove object from this.tree
      });
    }
    return counts;
  }

  static _add (l, r) {
    const ret = Object.assign({}, l);
    return Object.keys(r).reduce((ret, k) => {
      const add = k in r ? r[k] : 1;
      ret[k] = k in ret ? ret[k] + add : add;
      return ret;
    }, ret);
  }

  static _make (k, v) {
    const ret = {};
    ret[k] = v;
    return ret;
  }

  static _cross (list, map) {
    for (let listIndex in list) {
      if (Array.isArray(list[listIndex])) {
        Binder._cross(list[listIndex], map);
      } else {
        Object.keys(map).forEach(mapKey => {
          if (mapKey in list[listIndex])
            throw Error("unexpected duplicate key: " + mapKey + " in " + JSON.stringify(list[listIndex]));
          list[listIndex][mapKey] = map[mapKey];
        });
      }
    };
  }

  static _simplify (list) {
    const ret = list.reduce((r, elt) => {
      return r.concat(
        Array.isArray(elt) ?
          Binder._simplify(elt) :
          elt
      );
    }, []);
    return ret.length === 1 ? ret[0] : ret;
  }
}

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = Binder;
