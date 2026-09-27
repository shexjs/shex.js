/** bindingTree - the ShExMap binding tree of a validation result, read structurally.
 *
 * A validation result is a tree of shape tests; each `TestedTriple` carries the
 * `%Map:{ … %}` bindings its constraint made under `extensions`.  This walks it into
 * the binding-tree grammar both implementations exchange (see ../doc/iteration-scopes.md):
 *
 *   Scope      ::= Object                    -- own bindings, no repeated parts
 *                | [ Object, List* ]         -- own bindings (maybe {}), then one list per
 *                                            --   repeated constraint or group, in schema order
 *   List       ::= [ Object* ] | [ ScopeArray* ]   -- iterations, all objects or all arrays
 *
 * A repeated constraint or group (max other than 1) makes one list, an iteration per
 * match, EMPTY when nothing matched, so a list's position says which expression it came
 * from whatever the data.  A non-repeated nested shape merges into the scope that
 * matched it.  An iteration of a repeated shape-valued constraint records the node the
 * nested shape matched as "@node" (the subject for an inverse constraint) -- a reserved
 * key, never a variable.  EXTENDS results (`ExtendedResults`) merge the extended shapes'
 * bindings and the local ones into one scope, which `ShExUtil.valToExtension` never did.
 *
 * `ShExUtil.valToExtension` remains for the legacy materializers; ThreadedMaterializer
 * reads both layouts.
 */
"use strict";

const MapExt = "http://shex.io/extensions/Map/#";
export const NODE_KEY = "@node";

interface Rec { vars: any; lists: Rec[][]; }

const EMPTY: () => Rec = () => ({vars: {}, lists: []});

function merge (a: Rec, b: Rec): Rec {
  return {vars: Object.assign({}, a.vars, b.vars), lists: a.lists.concat(b.lists)};
}

function isRepeated (sol: any): boolean {
  return "max" in sol && sol.max !== undefined && sol.max !== 1;
}

function hasBindings (rec: Rec): boolean {
  return Object.keys(rec.vars).some(k => k !== NODE_KEY) || rec.lists.some(l => l.some(hasBindings));
}

/** the binding tree of a shapeExprTest (as `resultMapToShapeExprTest` gives it) */
export function bindingTree (val: any, extensionUrl: string = MapExt): any {
  return toJson(scopeOf(val, extensionUrl));
}

function toJson (rec: Rec): any {
  if (rec.lists.length === 0)
    return rec.vars;
  const lists = rec.lists.map(list => {
    const iterations = list.map(toJson);
    return iterations.some(Array.isArray) ? iterations.map(it => Array.isArray(it) ? it : [it]) : iterations;
  });
  return [rec.vars].concat(lists);
}

function scopeOf (val: any, ext: string, focus?: any): Rec {
  if (val === null || val === undefined || typeof val === "string")
    return EMPTY();
  switch (val.type) {
  case "ShapeTest":
    return "solution" in val && val.solution ? solutionRec(val.solution, ext, val.node) : EMPTY();
  case "ShapeAndResults":
  case "ExtensionResults":
  case "SolutionList":
    return (val.solutions || []).reduce((acc: Rec, s: any) => merge(acc, scopeOf(s, ext, focus)), EMPTY());
  case "ExtendedResults":       // the extended shapes' results, and the shape's own solutions
    return merge(scopeOf(val.extensions, ext, focus), solutionRec(val.local, ext, focus));
  case "ShapeOrResults":
    return scopeOf(val.solution, ext, focus);
  case "TripleConstraintSolutions":
  case "EachOfSolutions":
  case "OneOfSolutions":
    return solutionRec(val, ext, focus);
  default:                      // NodeConstraintTest, ShapeNot*, Failure, Recursion: bind nothing
    return EMPTY();
  }
}

function solutionRec (sol: any, ext: string, focus: any): Rec {
  switch (sol.type) {
  case "TripleConstraintSolutions": {
    const solutions: any[] = sol.solutions || [];
    if (isRepeated(sol)) {
      const iterations = solutions.map((t: any) => iteration(t, focus, ext)).filter(hasBindings);
      return {vars: {}, lists: [iterations]};
    }
    return solutions.reduce((acc: Rec, t: any) => merge(acc, bindingsOf(t, ext)), EMPTY());
  }
  case "EachOfSolutions":
  case "OneOfSolutions": {
    const groups: any[] = (sol.solutions || []).map(
      (g: any) => (g.expressions || []).reduce((acc: Rec, e: any) => merge(acc, solutionRec(e, ext, focus)), EMPTY()));
    if (isRepeated(sol))
      return {vars: {}, lists: [groups.filter(hasBindings)]};
    return groups.reduce((acc: Rec, g: Rec) => merge(acc, g), EMPTY());
  }
  case "ExtendedResults":       // a shape test's solution, when the shape EXTENDS others
  case "ShapeAndResults":
  case "ExtensionResults":
    return scopeOf(sol, ext, focus);
  default:
    return EMPTY();
  }
}

/** the bindings one tested triple made: its constraint's Map codes, and the nested shape's */
function bindingsOf (t: any, ext: string): Rec {
  const own = t.extensions && t.extensions[ext] ? Object.assign({}, t.extensions[ext]) : {};
  const nested = "referenced" in t ? scopeOf(t.referenced, ext) : EMPTY();
  return {vars: Object.assign(own, nested.vars), lists: nested.lists};
}

/** one iteration of a repeated shape-valued constraint: its node first.  An inverse
 * constraint's tested triple has the focus as its object; the node is then its subject. */
function iteration (t: any, focus: any, ext: string): Rec {
  const rec = bindingsOf(t, ext);
  const node = sameTerm(t.subject, focus) ? t.object : t.subject;
  const referencesShape = "referenced" in t && t.referenced && t.referenced.type !== "NodeConstraintTest";
  return referencesShape ? {vars: Object.assign({[NODE_KEY]: node}, rec.vars), lists: rec.lists} : rec;
}

function sameTerm (a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** every triple the validation matched, as N3id `{subject, predicate, object}` */
export function matchedTriples (val: any): any[] {
  const out: any[] = [];
  const seen = new Set<string>();
  (function walk (v: any) {
    if (v === null || v === undefined || typeof v !== "object")
      return;
    if (Array.isArray(v))
      return v.forEach(walk);
    if (v.type === "TestedTriple") {
      const key = JSON.stringify([v.subject, v.predicate, v.object]);
      if (!seen.has(key)) {
        seen.add(key);
        out.push({subject: v.subject, predicate: v.predicate, object: v.object});
      }
    }
    for (const k of Object.keys(v))
      if (k !== "valueExpr" && k !== "shapeExpr" && k !== "semActs")
        walk(v[k]);
  })(val);
  return out;
}
