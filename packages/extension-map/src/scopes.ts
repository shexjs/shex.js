/** scopes - the binding tree read as a scope tree, for materialization by iteration scopes.
 *
 * A binding tree (see ./bindingTree.ts) is a *scope*: an object of own bindings, or an
 * array whose first element is that object and whose other elements are *lists*, each
 * list holding one *iteration* (a scope) per match of a repeated constraint or group.
 * `parseScope` builds Scope objects from a tree, accepting the two older layouts shex.js
 * wrote (L1: a root written as its one list; L2: a nested scope written as a sibling of
 * the constraint's own binding), and `ScopeTree` answers what materialization asks: at
 * what list a variable is bound, and which scopes under a given one belong to a list.
 *
 * A *list path* names a list by position: the list indices from the root, so [] is the
 * root scope itself, [0] the root's first list, [0, 1] the second list of an iteration
 * of that list.  Every iteration of a list shares the list's path.
 */
"use strict";

import {NODE_KEY} from "./bindingTree";

export type ListPath = number[];

export class BindingTreeError extends Error {}

export class Scope {
  own: any;                     // variable IRI -> term (JSON term), never @node
  node: any;                    // the node this iteration matched, if recorded
  lists: Scope[][] = [];
  parent: Scope | null;
  listPath: ListPath;           // the list this scope is an iteration of
  path: number[];               // (list index, iteration index, ...) from the root
  jsonPath: any[];              // where the own-bindings object sits in the tree's JSON
  index: number = 0;            // position in walk order (the UI's "frame" number)

  constructor (own: any, node: any, parent: Scope | null, listPath: ListPath, path: number[], jsonPath: any[]) {
    this.own = own;
    this.node = node;
    this.parent = parent;
    this.listPath = listPath;
    this.path = path;
    this.jsonPath = jsonPath;
  }

  get depth (): number { return this.listPath.length; }

  /** {value, scope} for `v` from here or the nearest ancestor binding it, else null */
  lookup (v: string): {value: any, scope: Scope} | null {
    for (let s: Scope | null = this; s !== null; s = s.parent)
      if (v in s.own)
        return {value: s.own[v], scope: s};
    return null;
  }

  /** the node of this scope or of the nearest ancestor that recorded one */
  nearestNode (): any {
    for (let s: Scope | null = this; s !== null; s = s.parent)
      if (s.node !== undefined && s.node !== null)
        return s.node;
    return null;
  }

  /** the scopes below this one that are iterations of `listPath`, in document order */
  descendantsAt (listPath: ListPath): Scope[] {
    if (!isPrefix(this.listPath, listPath) || sameList(listPath, this.listPath))
      return [];
    const out: Scope[] = [];
    for (const list of this.lists)
      for (const it of list) {
        if (sameList(it.listPath, listPath))
          out.push(it);
        else if (isPrefix(it.listPath, listPath))
          out.push(...it.descendantsAt(listPath));
      }
    return out;
  }

  * walk (): Generator<Scope> {
    yield this;
    for (const list of this.lists)
      for (const it of list)
        yield* it.walk();
  }
}

export function isPrefix (a: number[], b: number[]): boolean {
  return a.length <= b.length && a.every((x, i) => b[i] === x);
}

export function sameList (a: number[], b: number[]): boolean {
  return a.length === b.length && isPrefix(a, b);
}

export function pathKey (p: number[]): string { return p.join("."); }

function isObject (x: any): boolean { return x !== null && typeof x === "object" && !Array.isArray(x); }

function isScopeArray (a: any): boolean {
  return Array.isArray(a) && a.length >= 1 && isObject(a[0]) && a.slice(1).every(Array.isArray);
}

/** the scope tree of a binding tree */
export function parseScope (tree: any): Scope {
  if (isObject(tree) || isScopeArray(tree))
    return scope(tree, null, [], [], []);
  if (Array.isArray(tree)) {
    // L1: a root without own bindings, written without its object
    if (tree.every(isObject))                                   // shex.js: the root's one list
      return scope([{}, tree], null, [], [], [], true);
    if (tree.every(Array.isArray)) {
      if (tree.every(isScopeArray))                             // shex.js: one list of scope iterations
        return scope([{}, tree], null, [], [], [], true);
      if (tree.every((e: any) => e.every(isObject)))            // PyShEx before 2026-09-27: the lists
        return scope([{}].concat(tree), null, [], [], [], true);
    }
  }
  throw new BindingTreeError("not a scope: " + short(tree));
}

function scope (node: any, parent: Scope | null, listPath: ListPath, path: number[], jsonPath: any[], synthetic = false): Scope {
  const own = isObject(node) ? node : node[0];
  const lists = isObject(node) ? [] : node.slice(1);
  const vars: any = {};
  for (const k of Object.keys(own))
    if (!k.startsWith("@"))
      vars[k] = own[k];
  const ownPath = synthetic ? null : (isObject(node) ? jsonPath : jsonPath.concat([0]));
  const s = new Scope(vars, own[NODE_KEY], parent, listPath, path, ownPath as any);
  lists.forEach((list: any, i: number) => {
    if (!Array.isArray(list))
      throw new BindingTreeError("a scope's lists must be arrays: " + short(list));
    // a synthetic root's lists sit at the tree's own indices
    const listJson = synthetic ? (jsonPath.length === 0 && lists.length === 1 ? [] : [i]) : jsonPath.concat([i + 1]);
    s.lists.push(list.map((e: any, j: number) => iteration(e, s, listPath.concat([i]), path.concat([i, j]), listJson.concat([j]))));
  });
  return s;
}

function iteration (elt: any, parent: Scope, listPath: ListPath, path: number[], jsonPath: any[]): Scope {
  if (isObject(elt) || isScopeArray(elt))     // a scope; also L2 (a nested scope written as a sibling)
    return scope(elt, parent, listPath, path, jsonPath);
  if (Array.isArray(elt) && elt.every(isObject)) // shex.js: a nested scope with no own bindings, its one list unwrapped
    return scope([{}, elt], parent, listPath, path, jsonPath, true);
  throw new BindingTreeError("not an iteration: " + short(elt));
}

function short (x: any): string {
  const s = JSON.stringify(x);
  return s === undefined ? String(x) : s.length < 120 ? s : s.slice(0, 117) + "...";
}

/** a parsed tree plus the indexes materialization needs */
export class ScopeTree {
  root: Scope;
  boundAt: {[v: string]: ListPath} = {};       // variable -> the list it is bound at
  bindings = 0;
  scopes: Scope[] = [];                         // walk order; scope.index indexes this

  constructor (tree: any) {
    this.root = parseScope(tree);
    for (const s of this.root.walk()) {
      s.index = this.scopes.length;
      this.scopes.push(s);
      for (const v of Object.keys(s.own)) {
        ++this.bindings;
        if (!(v in this.boundAt))
          this.boundAt[v] = s.listPath;
        else if (!sameList(this.boundAt[v], s.listPath))
          throw new BindingTreeError(`variable ${v} is bound at two lists, [${this.boundAt[v]}] and [${s.listPath}]`);
      }
    }
  }

  variables (): string[] { return Object.keys(this.boundAt); }

  /** the UI's view: own bindings per scope, in walk order, and where each was written */
  frames (): {frames: any[], origins: any[]} {
    return {
      frames: this.scopes.map(s => Object.assign({}, s.own)),
      origins: this.scopes.map(s => {
        const o: any = {};
        for (const v of Object.keys(s.own))
          o[v] = s.jsonPath === null ? null : s.jsonPath.concat([v]);
        return o;
      }),
    };
  }
}
