import ShExUtil = require('./shex-util');
import {ShExIndexVisitor} from '@shexjs/visitor';

/** yylloc-style source extent, extended with the filename and import chain. */
export interface Yylloc {
  filename?: string | null;
  first_line: number;
  first_column: number;
  last_line: number;
  last_column: number;
  importers?: string[];
}

/**
 * Collision API:
 *   @param type element of schema: imports|start|startActs|_locations...
 *   @param left structure with duplicated item.
 *   @param right structure with introducing duplicate item.
 *   @param leftLloc? yylloc structure for source of left item
 *   @param rightLloc? ylloc structure for source of right item
 *   @returns {boolean} false: keep left, true: overwrite with right. May also throw.   *
 */
export type OverwriteFunction = (type: string, left: any, right: any, leftLloc?: Yylloc, rightLloc?: Yylloc, leftMeta?: any, rightMeta?: any) => boolean;

/** A schema and its meta (base, prefixes, importers...), as passed to merge(). */
export interface SchemaAndMeta {
  schema: any;
  schemaMeta?: any;
}

export type CollisionPolicy = 'left' | 'right' | 'throw' | OverwriteFunction | { overwrite: OverwriteFunction };

export class Merger {
  left: any;
  leftMeta: any;
  right: any;
  rightMeta: any;
  overwrite: OverwriteFunction;
  inPlace: boolean;
  ret: any;

  /**
   * Join to ShExJ schemas. The schemas may have `_index` and `_locations` attributes.
   * @param olde first schema to be joined.
   * @param args (newe?,) collision?, inPlace? — collision is the string "left" or
   *   "right" or a function following the collision API; if inPlace is true, edit
   *   the left schema directly.
   * @returns ShExJ schema
   */
  constructor (olde: SchemaAndMeta, ...args: any[]) {
    this.left = olde.schema;
    this.leftMeta = olde.schemaMeta
    let collision: CollisionPolicy = 'throw', inPlace = false;

    switch (args.length) {
    case 0:
      break;
    case 1:
      collision = args[0];
      break;
    case 2:
      collision = args[0];
      inPlace = args[1];
      break;
    case 3:
      this.right = args[0].schema;
      this.rightMeta = args[0].schemaMeta
      collision = args[1];
      inPlace = args[2];
      break;
    default:
      throw Error(`Did not expect ${args.length} arguments to Merger`);
    }

    this.overwrite =
          collision === 'left'
          ? () => false
          : collision === 'right'
          ? () => true
          : typeof collision === 'object'
          ? (type, left, right, leftLloc, rightLloc) => collision.overwrite(type, left, right, leftLloc, rightLloc, this.leftMeta, this.rightMeta)
          : typeof collision === 'function'
          ? collision
          : (type, left, right, _leftLloc, _rightLloc, _leftMeta, _rightMeta) => {
            throw Error(`${type} ${JSON.stringify(right, null, 2)} collides with ${JSON.stringify(left, null, 2)}`);
          };
    this.inPlace = inPlace;
    this.ret = inPlace ? this.left : ShExUtil.emptySchema();
  }

  mergeArray (attr: string) {
    Object.keys(this.left[attr] || {}).forEach(key => {
      if (!(attr in this.ret))
        this.ret[attr] = {};
      this.ret[attr][key] = this.left[attr][key];
    });
    Object.keys(this.right[attr] || {}).forEach(key => {
      if (!(attr in this.left) || !(key in this.left[attr])
          || (this.left[attr][key] !== this.right[attr][key] && this.overwrite(attr, this.ret[attr][key], this.right[attr][key], undefined, undefined, this.leftMeta, this.rightMeta))) {
        if (!(attr in this.ret))
          this.ret[attr] = {};
        this.ret[attr][key] = this.right[attr][key];
      }
    });
  }

  mergeMap (attr: string, myOverwrite: OverwriteFunction = this.overwrite) {
    (this.left[attr] || new Map()).forEach((_value: any, key: any) => {
      if (!(attr in this.ret))
        this.ret[attr] = new Map();
      this.ret[attr].set(key, this.left[attr].get(key));
    });
    (this.right[attr] || new Map()).forEach((_value: any, key: any) => {
      if (!(attr  in this.left) || !(this.left[attr].has(key)) || myOverwrite(attr, this.ret[attr].get(key), this.right[attr].get(key), undefined, undefined, this.leftMeta, this.rightMeta)) {
        if (!(attr in this.ret))
          this.ret[attr] = new Map();
        this.ret[attr].set(key, this.right[attr].get(key));
      }
    });
  }

  merge (...args: SchemaAndMeta[]) {
    switch (args.length) {
    case 0:
      if (!this.left)
        throw Error(`expected left argument to merge`);
      if (!this.right)
        throw Error(`expected right argument to merge`);
      break;
    case 1:
      this.right = args[0].schema;
      this.rightMeta = args[0].schemaMeta
      break;
    case 2:
      this.left = args[0].schema;
      this.leftMeta = args[0].schemaMeta
      this.right = args[1].schema;
      this.rightMeta = args[1].schemaMeta
      break;
    default:
      throw Error(`Did not expect ${args.length} arguments to merge`);
    }

    // base
    if ("_base" in this.left)
      this.ret._base = this.left._base;
    if ("_base" in this.right)
      if (!("_base" in this.left)/* || this.overwrite('_base', this.ret._base, this.right._base)*/) // _base favors the this.left
        this.ret._base = this.right._base;

    this.mergeArray("_prefixes");

    this.mergeMap("_sourceMap", () => false);

    if ("_locations" in this.left || "_locations" in this.right)
      this.ret._locations = this.left._locations || {};

    if ("imports" in this.right)
      if (!("imports" in this.left)) {
        this.ret.imports = this.right.imports;
      } else {
        [].push.apply(this.ret.imports, this.right.imports.filter(
          (mprt: string) => this.ret.imports.indexOf(mprt) === -1
        ))
      }

    // startActs
    if ("startActs" in this.left)
      this.ret.startActs = this.left.startActs;
    if ("startActs" in this.right)
      if (!("startActs" in this.left) || this.overwrite('startActs', this.ret.startActs, this.right.startActs, undefined, undefined, this.leftMeta, this.rightMeta))
        this.ret.startActs = this.right.startActs;

    // start
    if ("start" in this.left)
      this.ret.start = this.left.start;
    if ("start" in this.right)
      if (!("start" in this.left) || this.overwrite('start', this.ret.start, this.right.start, undefined, undefined, this.leftMeta, this.rightMeta))
        this.ret.start = this.right.start;

    const lindex = this.left._index || ShExIndexVisitor.index(this.left);

    // shapes
    if (!this.inPlace)
      (this.left.shapes || []).forEach((lshape: any) => {
        if (!("shapes" in this.ret))
          this.ret.shapes = [];
        this.ret.shapes.push(lshape);
      });
    (this.right.shapes || []).forEach((rshape: any) => {
      if (!("shapes" in this.ret)) {
        this.ret.shapes = [];
        this.ret.shapes.push(rshape)
        lindex.shapeExprs[rshape.id] = rshape;
      } else {
        const previousDecl = lindex.shapeExprs[rshape.id];
        if (!previousDecl) {
          this.ret.shapes.push(rshape)
          lindex.shapeExprs[rshape.id] = rshape;
        } else if (this.overwrite('shapeDecl', previousDecl, rshape, (this.left._locations || {})[rshape.id], (this.right._locations || {})[rshape.id], this.leftMeta, this.rightMeta)) {
          this.ret.shapes.splice(this.ret.shapes.indexOf(previousDecl), 1, rshape);
          lindex.shapeExprs[rshape.id] = rshape;
        }
      }
      if ("_locations" in this.ret)
        this.ret._locations[rshape.id] = (this.right._locations || {})[rshape.id];
    });

    if (this.left._index || this.right._index)
      this.ret._index = ShExIndexVisitor.index(this.ret); // inefficient; could build above

    return this.ret;
  }

  /**
   * A merge function collision handler that warns on duplicates and throws on redefinitions.
   * @param type element of schema: imports|start|startActs|_locations...
   * @param left structure with duplicated item.
   * @param right structure with introducing duplicate item.
   * @param leftLloc? yylloc structure for source of left item
   * @param rightLloc? ylloc structure for source of right item
   * @returns {boolean} false: keep left, true: overwrite with right. May also throw.
   */
  static warnDuplicates (type: string, left: any, right: any, leftLloc?: Yylloc, rightLloc?: Yylloc, _leftMeta?: any, _rightMeta?: any): boolean {
    if (type === "_prefixes")
      return false;
    if (type !== "shapeDecl")
      throw Error(`Unexpected ${type} conflict: ${JSON.stringify(left)}, ${JSON.stringify(right)}`);

    const lStr = JSON.stringify(left);
    const rStr = JSON.stringify(right);
    const wheresStr: string[] = [];
    if (leftLloc) wheresStr.push(yyllocToString(leftLloc));
    if (rightLloc) wheresStr.push(yyllocToString(rightLloc));
    if (lStr === rStr) {
      console.warn(`Duplicate definitions for ${left.id}: ${wheresStr.map(s => "\n  " + s)}`)
      return false; // keep left/old assignment
    }
    throw new Error(`Conflicing definitions for ${left.id}:\n${locIndent(leftLloc)}    ${lStr}\n${locIndent(rightLloc)}    ${rStr}`);

    function locIndent (yylloc?: Yylloc) {
      return yylloc ? "  " + yyllocToString(yylloc) + ":\n" : "";
    }
  }
}

export function yyllocToString (yylloc: Yylloc): string {
  return `${yylloc.filename}(${yylloc.first_line}:${yylloc.first_column}-${yylloc.last_line}:${yylloc.last_column})${yylloc.importers ? yylloc.importers.reverse().map(i => "\n      <= " + i).join() : ""}`
}

/**
 * A merge function collision handler that accumulates redeclarations.
 */
export class StoreDuplicates {
  duplicates: { [id: string]: Yylloc[] } = {};

  overwrite (type: string, left: any, _right: any, leftLloc?: Yylloc, rightLloc?: Yylloc, leftMeta?: any, rightMeta?: any): boolean {
    if (type === "_prefixes")
      return false;
    if (type !== "shapeDecl")
      throw Error(`Unexpected ${type} conflict: ${JSON.stringify(left)}, ${JSON.stringify(_right)}`);

    const id = left.id;
    if (!this.duplicates[id])
      this.duplicates[id] = [{...leftLloc!, importers: leftMeta.importers}];
    this.duplicates[id].push({...rightLloc!, importers: rightMeta.importers})
    return false; // keep left/old assignment
  }
}
