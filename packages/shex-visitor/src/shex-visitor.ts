/** ShExVisitor - walk (and optionally transform) a ShExJ schema.
 */
import {SchemaIndex} from '@shexjs/term';
import {
  Annotation,
  EachOf,
  IRIREF, IriStemRange, LanguageStemRange, LiteralStemRange, NodeConstraint,
  OneOf,
  Schema, SemAct, Shape,
  ShapeAnd, ShapeDecl, shapeDeclRef, ShapeExternal, shapeExprOrRef, ShapeNot,
  ShapeOr, TripleConstraint, tripleExprOrRef, tripleExprRef,
  iriRangeExclusion, literalRangeExclusion, languageRangeExclusion,
  nodeKind, valueSetValue,
} from 'shexj';

export type exclusion = iriRangeExclusion | literalRangeExclusion | languageRangeExclusion;

/** Declarations for the methods created by prototype aliasing below the class.
 * They live on the prototype (not in the class body) so that e.g. all of the
 * numeric facets share a single _visitValue implementation.
 */
export interface ShExVisitor {
  visitBase (v: IRIREF, ...args: any[]): any;
  "visit@context" (v: string, ...args: any[]): any;
  visitStart (v: shapeExprOrRef, ...args: any[]): any;
  visitClosed (v: boolean, ...args: any[]): any;

  visitRestricts (v: shapeExprOrRef[], ...args: any[]): any;
  visitExtends (v: shapeExprOrRef[], ...args: any[]): any;

  visitExtra (l: IRIREF[], ...args: any[]): any;
  visitAnnotations (l: Annotation[], ...args: any[]): any;

  visitAbstract (v: boolean, ...args: any[]): any;
  visitInverse (v: boolean, ...args: any[]): any;
  visitPredicate (v: IRIREF, ...args: any[]): any;

  visitName (v: IRIREF, ...args: any[]): any;
  visitId (v: shapeDeclRef | tripleExprRef, ...args: any[]): any;
  visitCode (v: string, ...args: any[]): any;
  visitMin (v: number, ...args: any[]): any;
  visitMax (v: number, ...args: any[]): any;

  visitType (v: string, ...args: any[]): any;
  visitNodeKind (v: nodeKind, ...args: any[]): any;
  visitDatatype (v: IRIREF, ...args: any[]): any;
  visitPattern (v: string, ...args: any[]): any;
  visitFlags (v: string, ...args: any[]): any;
  visitLength (v: number, ...args: any[]): any;
  visitMinlength (v: number, ...args: any[]): any;
  visitMaxlength (v: number, ...args: any[]): any;
  visitMininclusive (v: number, ...args: any[]): any;
  visitMinexclusive (v: number, ...args: any[]): any;
  visitMaxinclusive (v: number, ...args: any[]): any;
  visitMaxexclusive (v: number, ...args: any[]): any;
  visitTotaldigits (v: number, ...args: any[]): any;
  visitFractiondigits (v: number, ...args: any[]): any;

  visitOneOf (expr: OneOf, ...args: any[]): any;
  visitEachOf (expr: EachOf, ...args: any[]): any;

  visitShapeAnd (expr: ShapeAnd, ...args: any[]): any;
  visitShapeOr (expr: ShapeOr, ...args: any[]): any;

  visitInclude (v: tripleExprRef, ...args: any[]): any;
}

export class ShExVisitor {
  ctor_args: any[];

  constructor (...ctor_args: any[]) {
    this.ctor_args = ctor_args;
  }

  static isTerm (t: any): boolean {
    return typeof t !== "object" || "value" in t && Object.keys(t).reduce((r: boolean, k) => {
      return r === false ? r : ["value", "type", "language"].indexOf(k) !== -1;
    }, true);
  }

  static isShapeRef (expr: shapeExprOrRef | tripleExprOrRef): expr is shapeDeclRef {
    return typeof expr === "string" // test for JSON-LD @ID
  }

  static visitMap (map: {[key: string]: any}, val: (v: any) => any): {[key: string]: any} {
    const ret: {[key: string]: any} = {};
    Object.keys(map).forEach(function (item) {
      ret[item] = val(map[item]);
    });
    return ret;
  }

  runtimeError (e: Error): void {
    throw e;
  }

  visitSchema (schema: Schema, ...args: any[]): any {
    const ret = { type: "Schema" };
    this._expect(schema, "type", "Schema");
    this._maybeSet(schema, ret, "Schema",
                   ["@context", "prefixes", "base", "imports", "startActs", "start", "shapes"],
                   ["_base", "_prefixes", "_index", "_sourceMap", "_locations", "_exprLocations"],
                   ...args
                  );
    return ret;
  }

  visitPrefixes (prefixes: {[prefix: string]: string} | undefined, ..._args: any[]): any {
    return prefixes === undefined ?
      undefined :
      ShExVisitor.visitMap(prefixes, function (val) {
        return val;
      });
  }

  visitIRI (i: IRIREF, ..._args: any[]): any {
    return i;
  }

  visitImports (imports: IRIREF[], ...args: any[]): any {
    return imports.map((imp) => {
      return this.visitIRI(imp, args);
    });
  }

  visitStartActs (startActs: SemAct[] | undefined, ...args: any[]): any {
    return startActs === undefined ?
      undefined :
      startActs.map((act) => {
        return this.visitSemAct(act, ...args);
      });
  }

  visitSemActs (semActs: SemAct[] | undefined, ...args: any[]): any {
    if (semActs === undefined)
      return undefined;
    const ret: any[] = []
    Object.keys(semActs).forEach((label) => {
      ret.push(this.visitSemAct(semActs[label as unknown as number], label, ...args));
    });
    return ret;
  }

  visitSemAct (semAct: SemAct, _label?: any, ...args: any[]): any {
    const ret = { type: "SemAct" };
    this._expect(semAct, "type", "SemAct");

    this._maybeSet(semAct, ret, "SemAct",
                   ["name", "code"], null, ...args);
    return ret;
  }

  visitShapes (shapes: ShapeDecl[] | undefined, ...args: any[]): any {
    if (shapes === undefined)
      return undefined;
    return shapes.map(
      shapeExpr =>
      this.visitShapeDecl(shapeExpr, ...args)
    );
  }

  visitShapeDecl (decl: ShapeDecl, ...args: any[]): any {
    return this._maybeSet(decl, { type: "ShapeDecl" }, "ShapeDecl",
                          ["id", "abstract", "restricts", "shapeExpr"], null, ...args);
  }

  visitShapeExpr (expr: shapeExprOrRef, ...args: any[]): any {
    if (ShExVisitor.isShapeRef(expr))
      return this.visitShapeRef(expr, ...args)
    switch (expr.type) {
    case "Shape": return this.visitShape(expr, ...args);
    case "NodeConstraint": return this.visitNodeConstraint(expr, ...args);
    case "ShapeAnd": return this.visitShapeAnd(expr, ...args);
    case "ShapeOr": return this.visitShapeOr(expr, ...args);
    case "ShapeNot": return this.visitShapeNot(expr, ...args);
    case "ShapeExternal": return this.visitShapeExternal(expr, ...args);
    default:
      throw Error("unexpected shapeExpr type: " + (expr as any).type + JSON.stringify(expr));
    }
  }

  visitValueExpr (expr: shapeExprOrRef, ...args: any[]): any {
    return this.visitShapeExpr(expr, ...args); // call potentially overloaded visitShapeExpr
  }

  // _visitShapeGroup: visit a grouping expression (shapeAnd, shapeOr)
  _visitShapeGroup (expr: ShapeAnd | ShapeOr, ...args: any[]): any {
    this._testUnknownAttributes(expr, ["shapeExprs"], expr.type, this.visitShapeNot)
    const r: any = { type: expr.type };
    if ("id" in expr)
      r.id = (expr as any).id;
    r.shapeExprs = expr.shapeExprs.map((nested) => {
      return this.visitShapeExpr(nested, ...args);
    });
    return r;
  }

  // visitShapeNot: visit negated shape
  visitShapeNot (expr: ShapeNot, ...args: any[]): any {
    this._testUnknownAttributes(expr, ["shapeExpr"], "ShapeNot", this.visitShapeNot)
    const r: any = { type: expr.type };
    if ("id" in expr)
      r.id = (expr as any).id;
    r.shapeExpr = this.visitShapeExpr(expr.shapeExpr, ...args);
    return r;
  }

  // ### `visitShape` deep-copies the structure of a shape
  visitShape (shape: Shape, ...args: any[]): any {
    const ret = { type: "Shape" };
    this._expect(shape, "type", "Shape");

    this._maybeSet(shape, ret, "Shape",
                   [ "abstract", "extends",
                     "closed",
                     "expression", "extra", "semActs", "annotations"], null, ...args);
    return ret;
  }

  _visitShapeExprList (ext: shapeExprOrRef[], ...args: any[]): any {
    return ext.map((t) => {
      return this.visitShapeExpr(t, ...args);
    });
  }

  // ### `visitNodeConstraint` deep-copies the structure of a NodeConstraint
  visitNodeConstraint (shape: NodeConstraint, ...args: any[]): any {
    const ret = { type: "NodeConstraint" };
    this._expect(shape, "type", "NodeConstraint");

    this._maybeSet(shape, ret, "NodeConstraint",
                   [ "nodeKind", "datatype", "pattern", "flags", "length",
                     "reference", "minlength", "maxlength",
                     "mininclusive", "minexclusive", "maxinclusive", "maxexclusive",
                     "totaldigits", "fractiondigits", "values", "annotations", "semActs"], null, ...args);
    return ret;
  }

  visitShapeRef (reference: shapeDeclRef, ..._args: any[]): any {
    if (typeof reference !== "string") {
      let ex = Error("visitShapeRef expected a string, not " + JSON.stringify(reference));
      console.warn(ex);
      throw ex;
    }
    return reference;
  }

  visitShapeExternal (expr: ShapeExternal, ..._args: any[]): any {
    this._testUnknownAttributes(expr, ["id"], "ShapeExternal", this.visitShapeNot)
    return Object.assign("id" in expr ? { id: (expr as any).id } : {}, { type: "ShapeExternal" });
  }

  // _visitGroup: visit a grouping expression (someOf or eachOf)
  _visitGroup (expr: OneOf | EachOf, ...args: any[]): any {
    const r: any = Object.assign(
      // pre-declare an id so it sorts to the top
      "id" in expr ? { id: null } : { },
      { type: expr.type }
    );
    r.expressions = expr.expressions.map((nested) => {
      return this.visitExpression(nested, ...args);
    });
    return this._maybeSet(expr, r, "expr",
                          ["id", "min", "max", "annotations", "semActs"], ["expressions"], ...args);
  }

  visitTripleConstraint (expr: TripleConstraint, ...args: any[]): any {
    return this._maybeSet(expr,
                          Object.assign(
                            // pre-declare an id so it sorts to the top
                            "id" in expr ? { id: null } : { },
                            { type: "TripleConstraint" }
                          ),
                          "TripleConstraint",
                          ["id", "inverse", "predicate", "valueExpr",
                           "min", "max", "annotations", "semActs"], null, ...args)
  }

  visitTripleExpr (expr: tripleExprOrRef, ...args: any[]): any {
    if (typeof expr === "string")
      return this.visitInclusion(expr);
    switch (expr.type) {
    case "TripleConstraint": return this.visitTripleConstraint(expr, ...args);
    case "OneOf": return this.visitOneOf(expr, ...args);
    case "EachOf": return this.visitEachOf(expr, ...args);
    default:
      throw Error("unexpected expression type: " + (expr as any).type);
    }
  }

  visitExpression (expr: tripleExprOrRef, ...args: any[]): any {
    return this.visitTripleExpr(expr, ...args); // call potentially overloaded visitTripleExpr
  }

  visitValues (values: valueSetValue[], ...args: any[]): any {
    return values.map((t: any) => {
      return ShExVisitor.isTerm(t) || t.type === "Language" ?
        t :
        this.visitStemRange(t, ...args);
    });
  }

  visitStemRange (t: IriStemRange | LiteralStemRange | LanguageStemRange, ...args: any[]): any {
    // this._expect(t, "type", "IriStemRange");
    if (!("type" in t))
      this.runtimeError(Error("expected "+JSON.stringify(t)+" to have a 'type' attribute."));
    const stemRangeTypes = ["IriStem", "LiteralStem", "LanguageStem", "IriStemRange", "LiteralStemRange", "LanguageStemRange"];
    if (stemRangeTypes.indexOf(t.type) === -1)
      this.runtimeError(Error("expected type attribute '"+t.type+"' to be in '"+stemRangeTypes+"'."));
    let stem: any;
    if (ShExVisitor.isTerm(t)) {
      this._expect(t.stem, "type", "Wildcard");
      stem = { type: t.type, stem: { type: "Wildcard" } };
    } else {
      stem = { type: t.type, stem: t.stem };
    }
    if (t.exclusions) {
      stem.exclusions = t.exclusions.map((c: exclusion) => {
        return this.visitExclusion(c, ...args);
      });
    }
    return stem;
  }

  visitExclusion (c: exclusion, ..._args: any[]): any {
    if (!ShExVisitor.isTerm(c)) {
      // this._expect(c, "type", "IriStem");
      const cObj = c as {type: string, stem: any};
      if (!("type" in cObj))
        this.runtimeError(Error("expected "+JSON.stringify(c)+" to have a 'type' attribute."));
      const stemTypes = ["IriStem", "LiteralStem", "LanguageStem"];
      if (stemTypes.indexOf(cObj.type) === -1)
        this.runtimeError(Error("expected type attribute '"+cObj.type+"' to be in '"+stemTypes+"'."));
      return { type: cObj.type, stem: cObj.stem };
    } else {
      return c;
    }
  }

  visitInclusion (inclusion: tripleExprRef, ..._args: any[]): any {
    if (typeof inclusion !== "string") {
      let ex = Error("visitInclusion expected a string, not " + JSON.stringify(inclusion));
      console.warn(ex);
      throw ex;
    }
    return inclusion;
  }

  _maybeSet (obj: any, ret: any, context: string, members: string[], ignore: string[] | null, ...args: any[]): any {
    this._testUnknownAttributes(obj, ignore ? members.concat(ignore) : members, context, this._maybeSet)
    members.forEach((member) => {
      const methodName = "visit" + member.charAt(0).toUpperCase() + member.slice(1);
      if (member in obj) {
        const f = (this as any)[methodName];
        if (typeof f !== "function") {
          throw Error(methodName + " not found in Visitor");
        }
        const t = f.call(this, obj[member], ...args);
        if (t !== undefined) {
          ret[member] = t;
        }
      }
    });
    return ret;
  }

  _visitValue (v: any, ..._args: any[]): any {
    return v;
  }

  _visitList (l: any[], ..._args: any[]): any {
    return l.slice();
  }

  _testUnknownAttributes (obj: object, expected: string[], context: string, captureFrame: Function): void {
    const unknownMembers = Object.keys(obj).reduce(function (ret: string[], k) {
      return k !== "type" && expected.indexOf(k) === -1 ? ret.concat(k) : ret;
    }, []);
    if (unknownMembers.length > 0) {
      const e = Error("unknown propert" + (unknownMembers.length > 1 ? "ies" : "y") + ": " +
                      unknownMembers.map(function (p) {
                        return "\"" + p + "\"";
                      }).join(",") +
                      " in " + context + ": " + JSON.stringify(obj));
      Error.captureStackTrace(e, captureFrame);
      throw e;
    }
  }

  _expect (o: any, p: string, v?: any): void {
    if (!(p in o))
      this.runtimeError(Error("expected "+JSON.stringify(o)+" to have a ."+p));
    if (arguments.length > 2 && o[p] !== v)
      this.runtimeError(Error("expected "+o[p]+" to equal "+v));
  }
}

// A lot of ShExVisitor's functions are the same. This creates them.
ShExVisitor.prototype.visitBase = ShExVisitor.prototype.visitStart = ShExVisitor.prototype.visitClosed = ShExVisitor.prototype["visit@context"] = ShExVisitor.prototype._visitValue;
ShExVisitor.prototype.visitRestricts = ShExVisitor.prototype.visitExtends = ShExVisitor.prototype._visitShapeExprList;
ShExVisitor.prototype.visitExtra = ShExVisitor.prototype.visitAnnotations = ShExVisitor.prototype._visitList;
ShExVisitor.prototype.visitAbstract = ShExVisitor.prototype.visitInverse = ShExVisitor.prototype.visitPredicate = ShExVisitor.prototype._visitValue;
ShExVisitor.prototype.visitName = ShExVisitor.prototype.visitId = ShExVisitor.prototype.visitCode = ShExVisitor.prototype.visitMin = ShExVisitor.prototype.visitMax = ShExVisitor.prototype._visitValue;

ShExVisitor.prototype.visitType = ShExVisitor.prototype.visitNodeKind = ShExVisitor.prototype.visitDatatype = ShExVisitor.prototype.visitPattern = ShExVisitor.prototype.visitFlags = ShExVisitor.prototype.visitLength = ShExVisitor.prototype.visitMinlength = ShExVisitor.prototype.visitMaxlength = ShExVisitor.prototype.visitMininclusive = ShExVisitor.prototype.visitMinexclusive = ShExVisitor.prototype.visitMaxinclusive = ShExVisitor.prototype.visitMaxexclusive = ShExVisitor.prototype.visitTotaldigits = ShExVisitor.prototype.visitFractiondigits = ShExVisitor.prototype._visitValue;
ShExVisitor.prototype.visitOneOf = ShExVisitor.prototype.visitEachOf = ShExVisitor.prototype._visitGroup;
ShExVisitor.prototype.visitShapeAnd = ShExVisitor.prototype.visitShapeOr = ShExVisitor.prototype._visitShapeGroup;
ShExVisitor.prototype.visitInclude = ShExVisitor.prototype._visitValue;


/** create indexes for schema
 */
export class ShExIndexVisitor extends ShExVisitor {
  // labelToTcs is filled in lazily by the validator, so it's absent here.
  myIndex: SchemaIndex;

  constructor () {
    super();
    this.myIndex = {
        shapeExprs: {},
        tripleExprs: {}
    } as SchemaIndex;
  }

  visitTripleExpr (expression: tripleExprOrRef, ...args: any[]): any {
    if (typeof expression === "object" && "id" in expression)
      this.myIndex.tripleExprs[expression.id!] = expression;
    return super.visitTripleExpr(expression, ...args);
  };

  visitShapeDecl (shapeExpr: ShapeDecl, ...args: any[]): any {
    if (typeof shapeExpr === "object" && "id" in shapeExpr)
      this.myIndex.shapeExprs[shapeExpr.id] = shapeExpr;
    return super.visitShapeDecl(shapeExpr, ...args);
  };

  static index (schema: Schema, ...args: any[]): SchemaIndex {
    const v = new ShExIndexVisitor();
    v.visitSchema(schema, ...args);
    return v.myIndex;
  }
}
