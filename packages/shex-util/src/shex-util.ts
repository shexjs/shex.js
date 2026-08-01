// **ShExUtil** provides ShEx utility functions

import * as ShExTerm from "@shexjs/term";
import {ShExVisitor, ShExIndexVisitor} from '@shexjs/visitor';
import * as ShExJ from 'shexj';
const Hierarchy = require('hierarchy-closure')
import ShExHumanErrorWriter = require('./shex-human-error-writer');

// runs in browsers (bundled) as well as node; not typed in the node-only lib
declare const XMLHttpRequest: any;

interface Namespace { _namespace: string; [localName: string]: string }

const SX: Namespace = { _namespace: "http://www.w3.org/ns/shex#" };
["Schema", "@context", "imports", "startActs", "start", "shapes",
 "ShapeDecl", "ShapeOr", "ShapeAnd", "shapeExprs", "nodeKind",
 "NodeConstraint", "iri", "bnode", "nonliteral", "literal", "datatype", "length", "minlength", "maxlength", "pattern", "flags", "mininclusive", "minexclusive", "maxinclusive", "maxexclusive", "totaldigits", "fractiondigits", "values",
 "ShapeNot", "shapeExpr",
 "Shape", "abstract", "closed", "extra", "expression", "extends", "restricts", "semActs",
 "ShapeRef", "reference", "ShapeExternal",
 "EachOf", "OneOf", "expressions", "min", "max", "annotation",
 "TripleConstraint", "inverse", "negated", "predicate", "valueExpr",
 "Inclusion", "include", "Language", "languageTag",
 "IriStem", "LiteralStem", "LanguageStem", "stem",
 "IriStemRange", "LiteralStemRange", "LanguageStemRange", "exclusion",
 "Wildcard", "SemAct", "name", "code",
 "Annotation", "object"].forEach(p => {
  SX[p] = SX._namespace+p;
});
const RDF: Namespace = { _namespace: "http://www.w3.org/1999/02/22-rdf-syntax-ns#" };
["type", "first", "rest", "nil"].forEach(p => {
  RDF[p] = RDF._namespace+p;
});
const OWL: Namespace = { _namespace: "http://www.w3.org/2002/07/owl#" };
["Thing"].forEach(p => {
  OWL[p] = OWL._namespace+p;
});

const Missed = {}; // singleton
const UNBOUNDED = -1;

function extend (base: any, ...extensions: any[]): any {
  if (!base) base = {};
  for (let i = 0, l = extensions.length, arg; i < l && (arg = extensions[i] || {}); i++)
    for (let name in arg)
      base[name] = arg[name];
  return base;
}

class MissingReferenceError extends Error {
  reference: string;
  known: string[];

  constructor (ref: string, labelStr: string, known: string[]) {
    super(`Structural error: reference to ${ref} not found in ${labelStr}`);
    this.reference = ref;
    this.known = known;
  }

  /** append directly after `error.message`
   */
  notFoundIn (): string {
    return ":\n" + this.known.map(
      u => u.substr(0, 2) === '_:' ? u : '<' + u + '>'
    ).join("\n        ") + ".";
  }
}
class MissingDeclRefError extends MissingReferenceError {
  constructor (ref: string, known: string[]) {
    super(ref, "shape declarations", known);
  }
}
class MissingTripleExprRefError extends MissingReferenceError {
  constructor (ref: string, known: string[]) {
    super(ref, "triple expressions", known);
  }
}

/** Walks a schema checking structure: reference targets, circular refs, negation cycles.
 * (Hoisted to module scope so that both validateSchema and HierarchyVisitor share it.)
 */
class SchemaStructureValidator extends ShExVisitor {
  schema: any;
  options: any;
  negativeDeps: any;
  positiveDeps: any;
  currentLabel: string | null;
  currentExtra: string[] | null;
  currentNegated: boolean;
  inTE: boolean;
  index: any;

  constructor (schema: any, options: any, negativeDeps: any, positiveDeps: any) {
    super();
    this.schema = schema;
    this.options = options;
    this.negativeDeps = negativeDeps;
    this.positiveDeps = positiveDeps;

    this.currentLabel = null;
    this.currentExtra = null;
    this.currentNegated = false;
    this.inTE = false;
    this.index = schema.index || ShExIndexVisitor.index(schema);
  }

  visitShape (shape: ShExJ.Shape, ...args: any[]): any {
    const lastExtra = this.currentExtra;
    this.currentExtra = shape.extra || null;
    const ret = super.visitShape(shape, ...args);
    this.currentExtra = lastExtra;
    return ret;
  };

  visitShapeNot (shapeNot: ShExJ.ShapeNot, ...args: any[]): any {
    const lastNegated = this.currentNegated;
    this.currentNegated = !this.currentNegated;
    const ret = super.visitShapeNot(shapeNot, ...args);
    this.currentNegated = lastNegated;
    return ret;
  };

  visitTripleConstraint (expr: ShExJ.TripleConstraint, ...args: any[]): any {
    const lastNegated = this.currentNegated;
    if (this.currentExtra && this.currentExtra.indexOf(expr.predicate) !== -1)
      this.currentNegated = !this.currentNegated;
    this.inTE = true;
    const ret = super.visitTripleConstraint(expr, ...args);
    this.inTE = false;
    this.currentNegated = lastNegated;
    return ret;
  };

  visitShapeRef (shapeRef: ShExJ.shapeDeclRef, ...args: any[]): any {
    if (!(shapeRef in this.index.shapeExprs)) {
      const error = this.firstError(new MissingDeclRefError(shapeRef, Object.keys(this.index.shapeExprs)), shapeRef);
      if (this.options.missingReferent) {
        this.options.missingReferent(error, (this.schema._locations || {})[this.currentLabel!]);
      } else {
        throw error;
      }
    }
    if (!this.inTE && shapeRef === this.currentLabel)
      throw this.firstError(Error("Structural error: circular reference to " + this.currentLabel + "."), shapeRef);
    if (!this.options.skipCycleCheck)
      (this.currentNegated ? this.negativeDeps : this.positiveDeps).add(this.currentLabel, shapeRef);
    return super.visitShapeRef(shapeRef, ...args);
  };

  visitInclusion (inclusion: ShExJ.tripleExprRef, ...args: any[]): any {
    if (!this.index.tripleExprs[inclusion])
      throw this.firstError(new MissingTripleExprRefError(inclusion, Object.keys(this.index.tripleExprs)), inclusion);
    // if (refd.type !== "Shape")
    //   throw Error("Structural error: " + inclusion + " is not a simple shape.");
    return super.visitInclusion(inclusion, ...args);
  };

  firstError (e: Error & { location?: any }, obj: any): Error {
    if ("_sourceMap" in this.schema)
      e.location = (this.schema._sourceMap.get(obj) || [undefined])[0];
    return e;
  }

  static validate (schema: any, options: any): void {
    const negativeDeps = Hierarchy.create();
    const positiveDeps = Hierarchy.create();
    const visitor = new SchemaStructureValidator(schema, options, negativeDeps, positiveDeps);

    (schema.shapes || []).forEach(function (shape: any) {
      visitor.currentLabel = shape.id;
      visitor.visitShapeDecl(shape, shape.id);
      visitor.currentLabel = null;
    });
    let circs = Object.keys(negativeDeps.children).filter(
      k => negativeDeps.children[k].filter(
        (k2: string) => k2 in negativeDeps.children && negativeDeps.children[k2].indexOf(k) !== -1
          || k2 in positiveDeps.children && positiveDeps.children[k2].indexOf(k) !== -1
      ).length > 0
    );
    if (circs.length)
      throw visitor.firstError(Error("Structural error: circular negative dependencies on " + circs.join(',') + "."), circs[0]);
  }
}

const ShExUtil = {

  SX: SX,
  RDF: RDF,
  version: function (): string {
    return "0.5.0";
  },

  /* getAST - compile a traditional regular expression abstract syntax tree.
   * Tested but not used at present.
   */
  getAST: function (schema: any): any {
    return {
      type: "AST",
      shapes: schema.shapes.reduce(function (ret: any, shape: any) {
        ret[shape.id] = {
          type: "ASTshape",
          expression: _compileShapeToAST(shape.shapeExpr.expression, [], schema)
        };
        return ret;
      }, {})
    };

    /* _compileShapeToAST - compile a shape expression to an abstract syntax tree.
     *
     * currently tested but not used.
     */
    function _compileShapeToAST (expression: any, tripleConstraints: any[], schema: any): any {

      class Epsilon {
        type = "Epsilon";
      }

      class TripleConstraint {
        type = "TripleConstraint";
        inverse: boolean;
        negated: boolean;
        predicate: string;
        valueExpr: any;

        constructor (_ordinal: number, predicate: string, inverse: boolean, negated: boolean, valueExpr: any) {
          // this.ordinal = ordinal; @@ does 1card25
          this.inverse = !!inverse;
          this.negated = !!negated;
          this.predicate = predicate;
          if (valueExpr !== undefined)
            this.valueExpr = valueExpr;
        }
      }

      class Choice {
        type = "Choice";
        disjuncts: any[];
        constructor (disjuncts: any[]) { this.disjuncts = disjuncts; }
      }

      class EachOf {
        type = "EachOf";
        conjuncts: any[];
        constructor (conjuncts: any[]) { this.conjuncts = conjuncts; }
      }

      class SemActs {
        type = "SemActs";
        expression: any;
        semActs: any;
        constructor (expression: any, semActs: any) { this.expression = expression; this.semActs = semActs; }
      }

      class KleeneStar {
        type = "KleeneStar";
        expression: any;
        constructor (expression: any) { this.expression = expression; }
      }

      function _compileExpression (expr: any, schema: any): any {
        let repeated, container;

        /* _repeat: map expr with a min and max cardinality to a corresponding AST with Groups and Stars.
           expr 1 1 => expr
           expr 0 1 => Choice(expr, Eps)
           expr 0 3 => Choice(EachOf(expr, Choice(EachOf(expr, Choice(expr, EPS)), Eps)), Eps)
           expr 2 5 => EachOf(expr, expr, Choice(EachOf(expr, Choice(EachOf(expr, Choice(expr, EPS)), Eps)), Eps))
           expr 0 * => KleeneStar(expr)
           expr 1 * => EachOf(expr, KleeneStar(expr))
           expr 2 * => EachOf(expr, expr, KleeneStar(expr))

           @@TODO: favor Plus over Star if Epsilon not in expr.
        */
        function _repeat (expr: any, min: number | undefined, max: number | undefined): any {
          if (min === undefined) { min = 1; }
          if (max === undefined) { max = 1; }

          if (min === 1 && max === 1) { return expr; }

          const opts = max === UNBOUNDED ?
                new KleeneStar(expr) :
                Array.from(Array(max - min)).reduce(function (ret, _elt, ord) {
                  return ord === 0 ?
                    new Choice([expr, new Epsilon]) :
                    new Choice([new EachOf([expr, ret]), new Epsilon]);
                }, undefined);

          const reqd = min !== 0 ?
                new EachOf(Array.from(Array(min)).map(function () {
                  return expr; // @@ something with ret
                }).concat(opts)) : opts;
          return reqd;
        }

        if (typeof expr === "string") { // Inclusion
          const included = schema._index.tripleExprs[expr].expression;
          return _compileExpression(included, schema);
        }

        else if (expr.type === "TripleConstraint") {
          // predicate, inverse, negated, valueExpr, annotations, semActs, min, max
          const valueExpr = "valueExprRef" in expr ?
                schema.valueExprDefns[expr.valueExprRef] :
                expr.valueExpr;
          const ordinal = tripleConstraints.push(expr)-1;
          const tp = new TripleConstraint(ordinal, expr.predicate, expr.inverse, expr.negated, valueExpr);
          repeated = _repeat(tp, expr.min, expr.max);
          return expr.semActs ? new SemActs(repeated, expr.semActs) : repeated;
        }

        else if (expr.type === "OneOf") {
          container = new Choice(expr.expressions.map(function (e: any) {
            return _compileExpression(e, schema);
          }));
          repeated = _repeat(container, expr.min, expr.max);
          return expr.semActs ? new SemActs(repeated, expr.semActs) : repeated;
        }

        else if (expr.type === "EachOf") {
          container = new EachOf(expr.expressions.map(function (e: any) {
            return _compileExpression(e, schema);
          }));
          repeated = _repeat(container, expr.min, expr.max);
          return expr.semActs ? new SemActs(repeated, expr.semActs) : repeated;
        }

        else throw Error("unexpected expr type: " + expr.type);
      }

      return expression ? _compileExpression(expression, schema) : new Epsilon();
    }
  },

  ShExJtoAS: function (schema: any): any {
    (schema.shapes || []).forEach((sh: any, ord: number) => {
      // 2.1- > 2.2
      if (sh.type !== "ShapeDecl") {
        const id = sh.id;
        delete sh.id;
        const newDecl = {
          type: "ShapeDecl",
          id: id,
          shapeExpr: sh,
        };
        schema.shapes[ord] = newDecl;
      }
    });
    schema._prefixes = schema._prefixes || {  };
    // schema._base = schema._prefixes || ""; // leave undefined to signal no provided base
    schema._index = ShExIndexVisitor.index(schema);
    return schema;
  },

  AStoShExJ: function (schema: any): any {
    schema["@context"] = schema["@context"] || "http://www.w3.org/ns/shex.jsonld";
    delete schema["_index"];
    delete schema["_prefixes"];
    delete schema["_base"];
    delete schema["_locations"];
    delete schema["_sourceMap"];
    delete schema["_exprLocations"];
    return schema;
  },

  ShExRtoShExJ: function (schema: any): any {
    // compile a list of known shapeExprs
    const knownShapeExprs = new Map();
    if ("shapes" in schema)
      schema.shapes.forEach((sh: any) => knownShapeExprs.set(sh.id, null))

    class ShExRVisitor extends ShExVisitor {
      knownShapeExprs: Map<string, any>;
      knownTripleExpressions: { [id: string]: { refCount: number, expr: any } };

      constructor (knownShapeExprs: Map<string, any>) {
        super()
        this.knownShapeExprs = knownShapeExprs;
        this.knownTripleExpressions = {};
      }

      visitShapeExpr (expr: any, ...args: any[]): any {
        if (typeof expr === "string")
          return expr;
        if ("id" in expr) {
          if (this.knownShapeExprs.has(expr.id) || Object.keys(expr).length === 1) {
            const already = this.knownShapeExprs.get(expr.id);
            if (typeof expr.expression === "object") {
              if (!already)
                this.knownShapeExprs.set(expr.id, super.visitShapeExpr(expr, ...args));
            }
            return expr.id;
          }
          delete expr.id;
        }
        return super.visitShapeExpr(expr, ...args);
      };

      visitTripleExpr (expr: any, ...args: any[]): any {
        if (typeof expr === "string") { // shortcut for recursive references e.g. 1Include1
          return expr;
        } else if ("id" in expr) {
          if (expr.id in this.knownTripleExpressions) {
            this.knownTripleExpressions[expr.id].refCount++;
            return expr.id;
          }
        }
        const ret = super.visitTripleExpr(expr, ...args);
        // Everything from RDF has an ID, usually a BNode.
        this.knownTripleExpressions[expr.id] = { refCount: 1, expr: ret };
        return ret;
      }

      cleanIds (): void {
        for (let k in this.knownTripleExpressions) {
          const known = this.knownTripleExpressions[k];
          if (known.refCount === 1 && known.expr.id.startsWith("_:"))
            delete known.expr.id;
        };
      }
    }

    // normalize references to those shapeExprs
    const v = new ShExRVisitor(knownShapeExprs);
    if ("start" in schema)
      schema.start = v.visitShapeExpr(schema.start);
    if ("shapes" in schema)
      schema.shapes = schema.shapes.map((sh: any) => v.visitShapeDecl(sh));

    // remove extraneous BNode IDs
    v.cleanIds();
    return schema;
  },

  valGrep: function (obj: any, type: string, f: (o: any) => any): any[] {
    const _ShExUtil = this;
    const ret: any[] = [];
    for (let i in obj) {
      const o = obj[i];
      if (typeof o === "object") {
        if ("type" in o && o.type === type)
          ret.push(f(o));
        ret.push.apply(ret, _ShExUtil.valGrep(o, type, f));
      }
    }
    return ret;
  },

  valToN3js: function (res: any, _factory: any): any[] {
    return this.valGrep(res, "TestedTriple", function (t: any) {
      const ret = JSON.parse(JSON.stringify(t));
      if (typeof t.object === "object")
        ret.object = ("\"" + t.object.value + "\"" + (
          "type" in t.object ? "^^" + t.object.type :
            "language" in t.object ? "@" + t.object.language :
            ""
        ));
      return ret;
    });
  },

  /* canonicalize: move all tripleExpression references to their first expression.
   *
   */
  canonicalize: function (schema: any, trimIRI?: string): any {
    const ret = JSON.parse(JSON.stringify(schema));
    ret["@context"] = ret["@context"] || "http://www.w3.org/ns/shex.jsonld";
    delete ret._prefixes;
    delete ret._base;
    let index = ret._index || ShExIndexVisitor.index(schema);
    delete ret._index;
    delete ret._sourceMap;
    delete ret._locations;
    delete ret._exprLocations;
    // Don't delete ret.productions as it's part of the AS.

    class MyVisitor extends ShExVisitor {
      index: any;
      knownExpressions: string[];

      constructor(index: any) {
        super();
        this.index = index;
        this.knownExpressions = [];
      }

      visitInclusion (inclusion: string): any {
        if (this.knownExpressions.indexOf(inclusion) === -1 &&
            inclusion in this.index.tripleExprs) {
          this.knownExpressions.push(inclusion)
          return super.visitTripleExpr(this.index.tripleExprs[inclusion]);
        }
        return super.visitInclusion(inclusion);
      }

      visitTripleExpr (expression: any): any {
        if (typeof expression === "object" && "id" in expression) {
          if (this.knownExpressions.indexOf(expression.id) === -1) {
            this.knownExpressions.push(expression.id)
            return super.visitTripleExpr(this.index.tripleExprs[expression.id]);
          }
          return expression.id; // Inclusion
        }
        return super.visitTripleExpr(expression);
      }

      visitExtra (l: string[]): any {
        return l.slice().sort();
      }
    }

    const v = new MyVisitor(index);
    if (trimIRI) {
      v.visitIRI = function (i: string) {
        return i.replace(trimIRI, "");
      }
      if ("imports" in ret)
        ret.imports = v.visitImports(ret.imports);
    }
    if ("shapes" in ret) {
      ret.shapes = Object.keys(index.shapeExprs).map(k => {
        if ("extra" in index.shapeExprs[k])
          index.shapeExprs[k].extra.sort();
        return v.visitShapeDecl(index.shapeExprs[k]);
      });
    }
    return ret;
  },

  BiDiClosure: function (): any {
    return {
      needs: {} as { [key: string]: any[] },
      neededBy: {} as { [key: string]: any[] },
      inCycle: [] as any[],
      test: function (this: any) {
        function expect (l: any, r: any) { const ls = JSON.stringify(l), rs = JSON.stringify(r); if (ls !== rs) throw Error(ls+" !== "+rs); }
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
      add: function (this: any, needer: any, needie: any, _negated?: any) {
        const r = this;
        if (!(needer in r.needs))
          r.needs[needer] = [];
        if (!(needie in r.neededBy))
          r.neededBy[needie] = [];

        // // [].concat.apply(r.needs[needer], [needie], r.needs[needie]). emitted only last element
        r.needs[needer] = r.needs[needer].concat([needie], r.needs[needie]).
          filter(function (el: any, ord: number, l: any[]) { return el !== undefined && l.indexOf(el) === ord; });
        // // [].concat.apply(r.neededBy[needie], [needer], r.neededBy[needer]). emitted only last element
        r.neededBy[needie] = r.neededBy[needie].concat([needer], r.neededBy[needer]).
          filter(function (el: any, ord: number, l: any[]) { return el !== undefined && l.indexOf(el) === ord; });

        if (needer in this.neededBy) this.neededBy[needer].forEach(function (e: any) {
          r.needs[e] = r.needs[e].concat([needie], r.needs[needie]).
            filter(function (el: any, ord: number, l: any[]) { return el !== undefined && l.indexOf(el) === ord; });
        });

        if (needie in this.needs) this.needs[needie].forEach(function (e: any) {
          r.neededBy[e] = r.neededBy[e].concat([needer], r.neededBy[needer]).
            filter(function (el: any, ord: number, l: any[]) { return el !== undefined && l.indexOf(el) === ord; })
        });
        // this.neededBy[needie].push(needer);

        if (r.needs[needer].indexOf(needer) !== -1)
          r.inCycle = r.inCycle.concat(r.needs[needer]);
      },
      trim: function (this: any) {
        function _trim (a: any[]) {
          // filter(function (el, ord, l) { return l.indexOf(el) === ord; })
          for (let i = a.length-1; i > -1; --i)
            if (a.indexOf(a[i]) < i)
              a.splice(i, i+1);
        }
        for (const k in this.needs)
          _trim(this.needs[k]);
        for (const k in this.neededBy)
          _trim(this.neededBy[k]);
      },
      foundIn: {} as { [tripleExpr: string]: string },
      addIn: function (this: any, tripleExpr: string, shapeExpr: string) {
        this.foundIn[tripleExpr] = shapeExpr;
      }
    }
  },
  /** @@TODO tests
   * options:
   *   no: don't do anything; just report nestable shapes
   *   transform: function to change shape labels
   */
  nestShapes: function (schema: any, options: any = {}): any {
    const _ShExUtil = this;
    const index = schema._index || ShExIndexVisitor.index(schema);
    if (!('no' in options)) { options.no = false }

    let shapeLabels = Object.keys(index.shapeExprs || [])
    let shapeReferences: { [key: string]: any[] } = {}
    shapeLabels.forEach(label => {
      const shape = index.shapeExprs[label].shapeExpr
      noteReference(label, null) // just note the shape so we have a complete list at the end
      if (shape.type === 'Shape') {
        if ('extends' in shape) {
          shape.extends.forEach(
             // !!! assumes simple reference, not e.g. AND
            (parent: string) => noteReference(parent, shape)
          )
        }
        if ('expression' in shape) {
          (_ShExUtil.simpleTripleConstraints(shape) || []).forEach((tc: any) => {
            let target = _ShExUtil.getValueType(tc.valueExpr)
            noteReference(target, {type: 'tc', shapeLabel: label, tc: tc})
          })
        }
      } else if (shape.type === 'NodeConstraint') {
        // can't have any refs to other shapes
      } else {
        throw Error('nestShapes currently only supports Shapes and NodeConstraints')
      }
    })
    let nestables: { [key: string]: any } = Object.keys(shapeReferences).filter(
      label => shapeReferences[label].length === 1
        && shapeReferences[label][0].type === 'tc' // no inheritance support yet
        && label in index.shapeExprs
        && index.shapeExprs[label].shapeExpr.type === 'Shape' // Don't nest e.g. valuesets for now. @@ needs an option
        && !index.shapeExprs[label].abstract // shouldn't have a ref to an unEXTENDed ABSTRACT shape anyways.
    ).filter(
      nestable => !('noNestPattern' in options)
        || !nestable.match(RegExp(options.noNestPattern))
    ).reduce((acc: { [key: string]: any }, label) => {
      acc[label] = {
        referrer: shapeReferences[label][0].shapeLabel,
        predicate: shapeReferences[label][0].tc.predicate
      }
      return acc
    }, {})
    if (!options.no) {
      let oldToNew: { [key: string]: string } = {}

      if (options.rename) {
        if (!('transform' in options)) {
          options.transform = (function () {
            let map = shapeLabels.reduce((acc: { [key: string]: string }, k, idx) => {
              acc[k] = '_:renamed' + idx
              return acc
            }, {})
            return function (id: string, _shapeExpr: any) {
              return map[id]
            }
          })()
        }
        Object.keys(nestables).forEach(oldName => {
          let shapeExpr = index.shapeExprs[oldName]
          let newName = options.transform(oldName, shapeExpr)
          oldToNew[oldName] = shapeExpr.id = newName
          shapeLabels[shapeLabels.indexOf(oldName)] = newName
          nestables[newName] = nestables[oldName]
          nestables[newName].was = oldName
          delete nestables[oldName]

          // @@ maybe update index when done?
          index.shapeExprs[newName] = index.shapeExprs[oldName]
          delete index.shapeExprs[oldName]

          if (shapeReferences[oldName].length !== 1) { throw Error('assertion: ' + oldName + ' doesn\'t have one reference: [' + shapeReferences[oldName] + ']') }
          let ref = shapeReferences[oldName][0]
          if (ref.type === 'tc') {
            if (typeof ref.tc.valueExpr === 'string') { // ShapeRef
              ref.tc.valueExpr = newName
            } else {
              throw Error('assertion: rename not implemented for TripleConstraint expr: ' + ref.tc.valueExpr)
              // _ShExUtil.setValueType(ref, newName)
            }
          } else if (ref.type === 'Shape') {
            throw Error('assertion: rename not implemented for Shape: ' + ref)
          } else {
            throw Error('assertion: ' + ref.type + ' not TripleConstraint or Shape')
          }
        })

        Object.keys(nestables).forEach(k => {
          let n = nestables[k]
          if (n.referrer in oldToNew) {
            n.newReferrer = oldToNew[n.referrer]
          }
        })

        // Restore old order for more concise diffs.
        let shapesCopy: { [key: string]: any } = {}
        shapeLabels.forEach(label => shapesCopy[label] = index.shapeExprs[label])
        index.shapeExprs = shapesCopy
      } else {
        const doomed: number[] = []
        const ids = schema.shapes.map((s: any) => s.id)
        Object.keys(nestables).forEach(oldName => {
          const borged = index.shapeExprs[oldName].shapeExpr
          // In principle, the ShExJ shouldn't have a Decl if the above criteria are met,
          // but the ShExJ may be generated by something which emits Decls regardless.
          shapeReferences[oldName][0].tc.valueExpr = borged
          const delme = ids.indexOf(oldName)
          if (schema.shapes[delme].id !== oldName)
            throw Error('assertion: found ' + schema.shapes[delme].id + ' instead of ' + oldName)
          doomed.push(delme)
          delete index.shapeExprs[oldName]
        })
        doomed.sort((l, r) => r - l).forEach(delme => {
          const id = schema.shapes[delme].id
          if (!nestables[id])
            throw Error('deleting unexpected shape ' + id)
          delete schema.shapes[delme].id
          schema.shapes.splice(delme, 1)
        })
      }
    }
    // console.dir(nestables)
    // console.dir(shapeReferences)
    return nestables

    function noteReference (id: string, reference: any) {
      if (!(id in shapeReferences)) {
        shapeReferences[id] = []
      }
      if (reference) {
        shapeReferences[id].push(reference)
      }
    }
  },

  /** @@TODO tests
   *
   */
  getPredicateUsage: function (schema: any, untyped: any = {}): any {
    const _ShExUtil = this;

    // populate shapeHierarchy
    let shapeHierarchy = Hierarchy.create()
    Object.keys(schema.shapes).forEach(label => {
      let shapeExpr = schema.shapes[label].shapeExpr
      if (shapeExpr.type === 'Shape') {
        (shapeExpr.extends || []).forEach(
          (superShape: any) => shapeHierarchy.add(superShape.reference, label)
        )
      }
    })
    Object.keys(schema.shapes).forEach(label => {
      if (!(label in shapeHierarchy.parents))
        shapeHierarchy.parents[label] = []
    })

    let predicates: { [predicate: string]: any } = { } // IRI->{ uses: [shapeLabel], commonType: shapeExpr }
    Object.keys(schema.shapes).forEach(shapeLabel => {
      let shapeExpr = schema.shapes[shapeLabel].shapeExpr
      if (shapeExpr.type === 'Shape') {
        let tcs = _ShExUtil.simpleTripleConstraints(shapeExpr) || []
        tcs.forEach((tc: any) => {
          let newType = _ShExUtil.getValueType(tc.valueExpr)
          if (!(tc.predicate in predicates)) {
            predicates[tc.predicate] = {
              uses: [shapeLabel],
              commonType: newType,
              polymorphic: false
            }
            if (typeof newType === 'object') {
              untyped[tc.predicate] = {
                shapeLabel,
                predicate: tc.predicate,
                newType,
                references: []
              }
            }
          } else {
            predicates[tc.predicate].uses.push(shapeLabel)
            let curType = predicates[tc.predicate].commonType
            if (typeof curType === 'object' || curType === null) {
              // another use of a predicate with no commonType
              // console.warn(`${shapeLabel} ${tc.predicate}:${newType} uses untypable predicate`)
              untyped[tc.predicate].references.push({ shapeLabel, newType })
            } else if (typeof newType === 'object') {
              // first use of a predicate with no detectable commonType
              predicates[tc.predicate].commonType = null
              untyped[tc.predicate] = {
                shapeLabel,
                predicate: tc.predicate,
                curType,
                newType,
                references: []
              }
            } else if (curType === newType) {
              ; // same type again
            } else if (shapeHierarchy.parents[curType] && shapeHierarchy.parents[curType].indexOf(newType) !== -1) {
              predicates[tc.predicate].polymorphic = true; // already covered by current commonType
            } else {
              let idx = shapeHierarchy.parents[newType] ? shapeHierarchy.parents[newType].indexOf(curType) : -1
              if (idx === -1) {
                let intersection = shapeHierarchy.parents[curType]
                    ? shapeHierarchy.parents[curType].filter(
                      (lab: string) => -1 !== shapeHierarchy.parents[newType].indexOf(lab)
                    )
                    : []
                if (intersection.length === 0) {
                  untyped[tc.predicate] = {
                    shapeLabel,
                    predicate: tc.predicate,
                    curType,
                    newType,
                    references: []
                  }
                  // console.warn(`${shapeLabel} ${tc.predicate} : ${newType} isn\'t related to ${curType}`)
                  predicates[tc.predicate].commonType = null
                } else {
                  predicates[tc.predicate].commonType = intersection[0]
                  predicates[tc.predicate].polymorphic = true
                }
              } else {
                predicates[tc.predicate].commonType = shapeHierarchy.parents[newType][idx]
                predicates[tc.predicate].polymorphic = true
              }
            }
          }
        })
      }
    })
    return predicates
  },

  /** @@TODO tests
   *
   */
  simpleTripleConstraints: function (shape: any): any[] {
    if (!('expression' in shape)) {
      return []
    }
    if (shape.expression.type === 'TripleConstraint') {
      return [ shape.expression ]
    }
    if (shape.expression.type === 'EachOf' &&
        !(shape.expression.expressions.find(
          (expr: any) => expr.type !== 'TripleConstraint'
        ))) {
          return shape.expression.expressions
        }
    throw Error('can\'t (yet) express ' + JSON.stringify(shape))
  },

  getValueType: function (valueExpr: any): any {
    if (typeof valueExpr === 'string') { return valueExpr }
    if (valueExpr.reference) { return valueExpr.reference }
    if (valueExpr.nodeKind === 'iri') { return OWL.Thing } // !! push this test to callers
    if (valueExpr.datatype) { return valueExpr.datatype }
    // if (valueExpr.extends && valueExpr.extends.length === 1) { return valueExpr.extends[0] }
    return valueExpr // throw Error('no value type for ' + JSON.stringify(valueExpr))
  },

  /** getDependencies: find which shappes depend on other shapes by inheritance
   * or inclusion.
   * TODO: rewrite in terms of Visitor.
   */
  getDependencies: function (schema: any, ret?: any): any {
    ret = ret || this.BiDiClosure();
    (schema.shapes || []).forEach(function (shapeDecl: any) {
      function _walkShapeExpression (shapeExpr: any, negated: number) {
        if (typeof shapeExpr === "string") { // ShapeRef
          ret.add(shapeDecl.id, shapeExpr);
        } else if (shapeExpr.type === "ShapeOr" || shapeExpr.type === "ShapeAnd") {
          shapeExpr.shapeExprs.forEach(function (expr: any) {
            _walkShapeExpression(expr, negated);
          });
        } else if (shapeExpr.type === "ShapeNot") {
          _walkShapeExpression(shapeExpr.shapeExpr, negated ^ 1); // !!! test negation
        } else if (shapeExpr.type === "Shape") {
          _walkShape(shapeExpr, negated);
        } else if (shapeExpr.type === "NodeConstraint") {
          // no impact on dependencies
        } else if (shapeExpr.type === "ShapeExternal") {
        } else
          throw Error("expected Shape{And,Or,Ref,External} or NodeConstraint in " + JSON.stringify(shapeExpr));
      }

      function _walkShape (shape: any, negated: number) {
        function _walkTripleExpression (tripleExpr: any, negated: number) {
          function _exprGroup (exprs: any[], negated?: number) {
            exprs.forEach(function (nested) {
              _walkTripleExpression(nested, negated as number) // ?? negation allowed?
            });
          }

          function _walkTripleConstraint (tc: any, negated: number) {
            if (tc.valueExpr)
              _walkShapeExpression(tc.valueExpr, negated);
            if (negated && ret.inCycle.indexOf(shapeDecl.id) !== -1) // illDefined/negatedRefCycle.err
              throw Error("Structural error: " + shapeDecl.id + " appears in negated cycle");
          }

          if (typeof tripleExpr === "string") { // Inclusion
            ret.add(shapeDecl.id, tripleExpr);
          } else {
            if ("id" in tripleExpr)
              ret.addIn(tripleExpr.id, shapeDecl.id)
            if (tripleExpr.type === "TripleConstraint") {
              _walkTripleConstraint(tripleExpr, negated);
            } else if (tripleExpr.type === "OneOf" || tripleExpr.type === "EachOf") {
              _exprGroup(tripleExpr.expressions);
            } else {
              throw Error("expected {TripleConstraint,OneOf,EachOf,Inclusion} in " + tripleExpr);
            }
          }
        }

        (["extends", "restricts"]).forEach(attr => {
        if (shape[attr] && shape[attr].length > 0)
          shape[attr].forEach(function (i: any) {
            ret.add(shapeDecl.id, i);
          });
        })
        if (shape.expression)
          _walkTripleExpression(shape.expression, negated);
      }
      _walkShapeExpression(shapeDecl.shapeExpr, 0); // 0 means false for bitwise XOR
    });
    return ret;
  },

  /** partition: create subset of a schema with only desired shapes and
   * their dependencies.
   *
   * @schema: input schema
   * @partition: shape name or array of desired shape names
   * @deps: (optional) dependency tree from getDependencies.
   *        map(shapeLabel -> [shapeLabel])
   */
  partition: function (schema: any, includes: string | string[], deps?: any, cantFind?: (what: string, why: string) => void): any {
    const inputIndex = schema._index || ShExIndexVisitor.index(schema)
    const outputIndex: any = { shapeExprs: new Map(), tripleExprs: new Map() };
    includes = includes instanceof Array ? includes : [includes];

    // build dependency tree if not passed one
    deps = deps || this.getDependencies(schema);
    cantFind = cantFind || function (what, why) {
      throw new Error("Error: can't find shape " +
                      (why ?
                       why + " dependency " + what :
                       what));
    };
    const partition: any = {};
    for (let k in schema)
      partition[k] = k === "shapes" ? [] : schema[k];
    includes.forEach(function (i) {
      if (i in outputIndex.shapeExprs) {
        // already got it.
      } else if (i in inputIndex.shapeExprs) {
        const adding = inputIndex.shapeExprs[i];
        partition.shapes.push(adding);
        outputIndex.shapeExprs[adding.id] = adding;
        if (i in deps.needs)
          deps.needs[i].forEach(function (n: string) {
            // Turn any needed TE into an SE.
            if (n in deps.foundIn)
              n = deps.foundIn[n];

            if (n in outputIndex.shapeExprs) {
            } else if (n in inputIndex.shapeExprs) {
              const needed = inputIndex.shapeExprs[n];
              partition.shapes.push(needed);
              outputIndex.shapeExprs[needed.id] = needed;
            } else
              cantFind!(n, i);
          });
      } else {
        cantFind!(i, "supplied");
      }
    });
    return partition;
  },


  /** @@TODO flatten: return copy of input schema with all shape and value class
   * references substituted by a copy of their referent.
   *
   * @schema: input schema
   */
  flatten: function (schema: any, _deps?: any, _cantFind?: any): any {
    const v = new ShExVisitor();
    return v.visitSchema(schema);
  },

  // @@ put predicateUsage here

  emptySchema: function (): { type: "Schema" } {
    return {
      type: "Schema"
    };
  },

  absolutizeResults: function (parsed: any, base: string): any {
    // !! duplicate of Validation-test.js:84: const referenceResult = parseJSONFile(resultsFile...)
    function mapFunction (k: string, obj: any) {
      // resolve relative URLs in results file
      if (["shape", "reference", "node", "subject", "predicate", "object"].indexOf(k) !== -1 &&
          (typeof obj[k] === "string" && !obj[k].startsWith("_:"))) { // !! needs ShExTerm.ldTermIsIri
        obj[k] = new URL(obj[k], base).href;
      }}

    function resolveRelativeURLs (obj: any) {
      Object.keys(obj).forEach(function (k) {
        if (typeof obj[k] === "object") {
          resolveRelativeURLs(obj[k]);
        }
        if (mapFunction) {
          mapFunction(k, obj);
        }
      });
    }
    resolveRelativeURLs(parsed);
    return parsed;
  },

  getProofGraph: function (res: any, db: any, dataFactory: any): any {
    function _dive1 (solns: any): void {
      if (solns.type === "NodeConstraintTest") {
      } else if (solns.type === "SolutionList" ||
                 solns.type === "ShapeAndResults" ||
                 solns.type === "ExtensionResults") {
        solns.solutions.forEach((s: any) => {
          if (s.solution) // no .solution for <S> {}
            _dive1(s.solution);
        });
      } else if (solns.type === "ShapeOrResults") {
        _dive1(solns.solution);
      } else if (solns.type === "ShapeTest") {
        if ("solution" in solns)
          _dive1(solns.solution);
      } else if (solns.type === "OneOfSolutions" ||
                 solns.type === "EachOfSolutions") {
        solns.solutions.forEach((s: any) => {
          _dive1(s);
        });
      } else if (solns.type === "OneOfSolution" ||
                 solns.type === "EachOfSolution") {
        solns.expressions.forEach((s: any) => {
          _dive1(s);
        });
      } else if (solns.type === "TripleConstraintSolutions") {
        solns.solutions.map((s: any) => {
          if (s.type !== "TestedTriple")
            throw Error("unexpected result type: " + s.type);
          const subject = ShExTerm.ld2RdfJsTerm(s.subject);
          const predicate = ShExTerm.ld2RdfJsTerm(s.predicate);
          const object = ShExTerm.ld2RdfJsTerm(s.object);
          const graph = "graph" in s ? ShExTerm.ld2RdfJsTerm(s.graph) : dataFactory.defaultGraph();
          db.addQuad(dataFactory.quad(subject, predicate, object, graph));
          if ("referenced" in s) {
            _dive1(s.referenced);
          }
        });
      } else if (solns.type === "ExtendedResults") {
        _dive1(solns.extensions);
        if ("local" in solns)
          _dive1(solns.local);
      } else if (["ShapeNotResults", "Recursion"].indexOf(solns.type) !== -1) {
      } else {
        throw Error("unexpected expr type "+solns.type+" in " + JSON.stringify(solns));
      }
    }
    _dive1(res);
    return db;
  },

  MissingReferenceError,
  MissingDeclRefError,
  MissingTripleExprRefError,

  HierarchyVisitor: function (schemaP: any, optionsP: any, negativeDepsP: any, positiveDepsP: any): any {
    const visitor = new SchemaStructureValidator(schemaP, optionsP, negativeDepsP, positiveDepsP);
    return visitor;
  },

  validateSchema: function (schema: any, options: any): void { // obselete, but may need other validations in the future.
    SchemaStructureValidator.validate(schema, options);
  },

  /** isWellDefined: assert that schema is well-defined.
   *
   * @schema: input schema
   * @@TODO
   */
  isWellDefined: function (schema: any, options: any): any {
    this.validateSchema(schema, options);
    // const deps = this.getDependencies(schema);
    return schema;
  },

  walkVal: function (val: any, cb: (sln: any) => any): any {
    const _ShExUtil = this;
    if (typeof val === "string") { // ShapeRef
      return null; // 1NOTRefOR1dot_pass-inOR
    }
    switch (val.type) {
    case "SolutionList": // dependent_shape
      return val.solutions.reduce((ret: any, exp: any) => {
        const n = _ShExUtil.walkVal(exp, cb);
        if (n)
          Object.keys(n).forEach(k => {
            if (k in ret)
              ret[k] = ret[k].concat(n[k]);
            else
              ret[k] = n[k];
          })
        return ret;
      }, {});
    case "NodeConstraintTest": // 1iri_pass-iri
      return _ShExUtil.walkVal(val.shapeExpr, cb);
    case "NodeConstraint": // 1iri_pass-iri
      return null;
    case "ShapeTest": { // 0_empty
      const vals: any[] = [];
      visitSolution(val, vals); // A ShapeTest is a sort of Solution.
      const ret: any = vals.length
            ? {'http://shex.io/reflex': vals}
            : {};
      if ("solution" in val)
        Object.assign(ret, _ShExUtil.walkVal(val.solution, cb))
      return Object.keys(ret).length ? ret : null;
    }
    case "Shape": // 1NOTNOTdot_passIv1
      return null;
    case "ShapeNotTest": // 1NOT_vsANDvs__passIv1
      return _ShExUtil.walkVal(val.shapeExpr, cb);
    case "ShapeNotResults": // NOT1dotOR2dot_pass-empty
      return null; // we don't bind variables from negative tests
    case "Failure": // NOT1dotOR2dot_pass-empty
      return null; // !!TODO
    case "ShapeNot": // 1NOTNOTIRI_passIo1,
      return _ShExUtil.walkVal(val.shapeExpr, cb);
    case "ShapeOrResults": // 1dotRefOR3_passShape1
      return _ShExUtil.walkVal(val.solution, cb);
    case "ShapeOr": // 1NOT_literalORvs__passIo1
      return val.shapeExprs.reduce((ret: any, exp: any) => {
        const n = _ShExUtil.walkVal(exp, cb);
        if (n)
          Object.keys(n).forEach(k => {
            if (k in ret)
              ret[k] = ret[k].concat(n[k]);
            else
              ret[k] = n[k];
          })
        return ret;
      }, {});
    case "ShapeAndResults": // 1iriRef1_pass-iri
    case "ExtensionResults": // extends-abstract-multi-empty_pass-missingOptRef1
      return val.solutions.reduce((ret: any, exp: any) => {
        const n = _ShExUtil.walkVal(exp, cb);
        if (n)
          Object.keys(n).forEach(k => {
            if (k in ret)
              ret[k] = ret[k].concat(n[k]);
            else
              ret[k] = n[k];
          })
        return ret;
      }, {});
    case "ShapeAnd": // 1NOT_literalANDvs__passIv1
      return val.shapeExprs.reduce((ret: any, exp: any) => {
        const n = _ShExUtil.walkVal(exp, cb);
        if (n)
          Object.keys(n).forEach(k => {
            if (k in ret)
              ret[k] = ret[k].concat(n[k]);
            else
              ret[k] = n[k];
          })
        return ret;
      }, {});
    case "ExtendedResults": // extends-abstract-multi-empty_pass-missingOptRef1
      // (walks the attribute *names*, so always returns {}; descending into
      // val.extensions/val.local would hit e.g. ResultReference vals which
      // walkVal doesn't handle -- see vitals-RESTRICTS tests)
      return (["extensions", "local"]).reduce((ret: any, exp) => {
        const n = _ShExUtil.walkVal(exp, cb);
        if (n)
          Object.keys(n).forEach(k => {
            if (k in ret)
              ret[k] = ret[k].concat(n[k]);
            else
              ret[k] = n[k];
          })
        return ret;
      }, {});
    case "EachOfSolutions":
    case "OneOfSolutions":
      // 1dotOne2dot_pass_p1
      return val.solutions.reduce((ret: any, sln: any) => {
        sln.expressions.forEach((exp: any) => {
          const n = _ShExUtil.walkVal(exp, cb);
          if (n)
            Object.keys(n).forEach(k => {
              if (k in ret)
                ret[k] = ret[k].concat(n[k]);
              else
                ret[k] = n[k];
            })
        });
        return ret;
      }, {});
    case "TripleConstraintSolutions": // 1dot_pass-noOthers
      if ("solutions" in val) {
        const ret: any = {};
        const vals: any[] = [];
        ret[val.predicate] = vals;
        val.solutions.forEach((sln: any) => visitSolution(sln, vals));
        return vals.length ? ret : null;
      } else {
        return null;
      }
    case "Recursion": // 3circRefPlus1_pass-recursiveData
      return null;
    default:
      // console.log(val);
      throw Error("unknown shapeExpression type in " + JSON.stringify(val));
    }

    function visitSolution (sln: any, vals: any[]): void {
      const toAdd: any[] = [];
      if (chaseList(sln.referenced)) { // parse 1val1IRIREF.ttl
        [].push.apply(vals, toAdd as never[]);
      } else { // 1dot_pass-noOthers
        const newElt = cb(sln) || {};
        if ("referenced" in sln) {
          const t = _ShExUtil.walkVal(sln.referenced, cb);
          if (t)
            newElt.nested = t;
        }
        if (Object.keys(newElt).length > 0)
          vals.push(newElt);
      }
      function chaseList (li: any): boolean | undefined {
        if (!li) return false;
        if (li.node === RDF.nil) return true;
        if ("solution" in li && "solutions" in li.solution &&
            li.solution.solutions.length === 1 &&
            "expressions" in li.solution.solutions[0] &&
            li.solution.solutions[0].expressions.length === 2 &&
            "predicate" in li.solution.solutions[0].expressions[0] &&
            li.solution.solutions[0].expressions[0].predicate === RDF.first &&
            li.solution.solutions[0].expressions[1].predicate === RDF.rest) {
          const expressions = li.solution.solutions[0].expressions;
          const ent = expressions[0];
          const rest = expressions[1].solutions[0];
          const member = ent.solutions[0];
          let newElt = cb(member);
          if ("referenced" in member) {
            const t = _ShExUtil.walkVal(member.referenced, cb);
            if (t) {
              if (newElt)
                newElt.nested = t;
              else
                newElt = t;
            }
          }
          if (newElt)
            vals.push(newElt);
          return rest.object === RDF.nil ?
            true :
            chaseList(rest.referenced.type === "ShapeOrResults" // heuristic for `nil OR @<list>` idiom
                      ? rest.referenced.solution
                      : rest.referenced);
        }
        return undefined;
      }
    }
  },

  /**
   * Convert val results to a property tree.
   * @exports
   * @returns {@code {p1:[{p2: v2},{p3: v3}]}}
   */
  valToValues: function (val: any): any {
    return this.walkVal (val, function (sln: any) {
      return "object" in sln ? { ldterm: sln.object } : null;
    });
  },

  valToExtension: function (val: any, lookfor: string): any {
    const map = this.walkVal (val, function (sln: any) {
      return "extensions" in sln ? { extensions: sln.extensions } : null;
    });
    function extensions (obj: any): any {
      const list: any[] = [];
      let crushed: any = {};
      function crush (elt: any) {
        if (crushed === null)
          return elt;
        if (Array.isArray(elt)) {
          crushed = null;
          return elt;
        }
        for (const k in elt) {
          if (k in crushed) {
            crushed = null
            return elt;
          }
          crushed[k] = elt[k];
        }
        return elt;
      }
      for (let k in obj) {
        if (k === "extensions") {
          if (obj[k])
            list.push(crush(obj[k][lookfor]));
        } else if (k === "nested") {
          const nested = extensions(obj[k]);
          if (Array.isArray(nested))
            nested.forEach(crush);
          else
            crush(nested);
          list.push(nested);
        } else {
          list.push(crush(extensions(obj[k])));
        }
      }
      return list.length === 1 ? list[0] :
        crushed ? crushed :
        list;
    }
    return extensions(map);
  },

  /**
   * Convert a ShExR property tree to ShexJ.
   * A schema like:
   *   <Schema> a :Schema; :shapes (<#S1> <#S2>).
   *   <#S1> a :ShapeDecl; :shapeExpr [ a :ShapeNot; :shapeExpr <#S2> ].
   *   <#S2> a :ShapeDecl; :shapeExpr [ a :Shape; :expression [ a :TripleConstraint; :predicate <#p3> ] ].
   * will parse into a property tree with <#S2> duplicated inside <#S1>.
   * This method de-duplicates and moves all ShapeDecls to be immediate children
   * of the :shapes collection.
   * @exports
   * @returns ShEx schema
   */
  valuesToSchema: function (values: any): any {
    // console.log(JSON.stringify(values, null, "  "));
    const v = values;
    const t = values[RDF.type][0].ldterm;
    if (t === SX.Schema) {
      /* Schema { "@context":"http://www.w3.org/ns/shex.jsonld"
       *           startActs:[SemAct+]? start:(shapeDeclOrExpr|labeledShapeExpr)?
       *           shapes:[labeledShapeExpr+]? }
       */
      const ret: any = {
        "@context": "http://www.w3.org/ns/shex.jsonld",
        type: "Schema"
      }
      if (SX.startActs in v)
        ret.startActs = v[SX.startActs].map((e: any) => {
          const ret: any = {
            type: "SemAct",
            name: e.nested[SX.name][0].ldterm
          };
          if (SX.code in e.nested)
            ret.code = e.nested[SX.code][0].ldterm.value;
          return ret;
        });
      if (SX.imports in v)
        ret.imports = v[SX.imports].map((e: any) => {
          return e.ldterm;
        });
      if (values[SX.start])
        ret.start = extend({id: values[SX.start][0].ldterm}, shapeDeclOrExpr(values[SX.start][0].nested));
      const shapes = values[SX.shapes];
      if (shapes) {
        ret.shapes = shapes.map((v: any) => {
          const obj = shapeDeclOrExpr(v.nested)
          return extend({id: v.ldterm}, obj);
        });
      }
      // console.log(ret);
      return ret;
    } else {
      throw Error("unknown schema type in " + JSON.stringify(values));
    }
    function findType (v: any, elts: any, f: (v: any) => any): any {
      const t = v[RDF.type][0].ldterm.substr(SX._namespace.length);
      const elt = elts[t];
      if (!elt)
        return Missed;
      if (elt.nary) {
        const ret: any = {
          type: t,
        };
        ret[elt.prop] = v[SX[elt.prop]].map((e: any) => {
          return valueOf(e);
        });
        return ret;
      } else {
        const ret: any = {
          type: t
        };
        if (elt.prop) {
          ret[elt.prop] = valueOf(v[SX[elt.prop]][0]);
        }
        return ret;
      }

      function valueOf (x: any) {
        return elt.expr && "nested" in x ? extend({ id: x.ldterm, }, f(x.nested)) : x.ldterm;
      }
    }
    /* transform ShapeDecls and shapeExprs. called from .shapes and .valueExpr.
     * The calls from .valueExpr can be Shapes or ShapeDecls because the ShExR graph is not yet normalized.
     */
    function shapeDeclOrExpr (v: any): any {
      // <#shapeDeclOrExpr> @<#ShapeDecl> OR @<#shapeExpr>
      // shapeExpr = ShapeOr | ShapeAnd | ShapeNot | NodeConstraint | Shape | ShapeRef | ShapeExternal;
      const elts = { "ShapeAnd"     : { nary: true , expr: true , prop: "shapeExprs" },
                   "ShapeOr"      : { nary: true , expr: true , prop: "shapeExprs" },
                   "ShapeNot"     : { nary: false, expr: true , prop: "shapeExpr"  },
                   "ShapeRef"     : { nary: false, expr: false, prop: "reference"  },
                   "ShapeExternal": { nary: false, expr: false, prop: null         } };
      let ret = findType(v, elts, shapeDeclOrExpr);
      if (ret !== Missed)
        return ret;

      const t = v[RDF.type][0].ldterm;
      if (t === SX.ShapeDecl) {
        const ret: any = { type: "ShapeDecl" };
        ["abstract"].forEach(a => {
          if (SX[a] in v)
            ret[a] = !!v[SX[a]][0].ldterm.value;
        });
        if (SX.shapeExpr in v) {
          ret.shapeExpr =
            "nested" in v[SX.shapeExpr][0] ?
            extend({id: v[SX.shapeExpr][0].ldterm}, shapeDeclOrExpr(v[SX.shapeExpr][0].nested)) :
            v[SX.shapeExpr][0].ldterm;
        }
        return ret;
      } else if (t === SX.Shape) {
        ret = { type: "Shape" };
        ["closed"].forEach(a => {
          if (SX[a] in v)
            ret[a] = !!v[SX[a]][0].ldterm.value;
        });
        ["extra", "extends", "restricts"].forEach(a => {
          if (SX[a] in v)
            ret[a] = v[SX[a]].map((e: any) => { return e.ldterm; });
        });
        if (SX.expression in v) {
          ret.expression =
            "nested" in v[SX.expression][0] ?
            extend({id: v[SX.expression][0].ldterm}, tripleExpr(v[SX.expression][0].nested)) :
            v[SX.expression][0].ldterm;
        }
        if (SX.annotation in v)
          ret.annotations = v[SX.annotation].map((e: any) => {
            return {
              type: "Annotation",
              predicate: e.nested[SX.predicate][0].ldterm,
              object: e.nested[SX.object][0].ldterm
            };
          });
        if (SX.semActs in v)
          ret.semActs = v[SX.semActs].map((e: any) => {
            const ret: any = {
              type: "SemAct",
              name: e.nested[SX.name][0].ldterm
            };
            if (SX.code in e.nested)
              ret.code = e.nested[SX.code][0].ldterm.value;
            return ret;
          });
        return ret;
      } else if (t === SX.NodeConstraint) {
        const ret: any = { type: "NodeConstraint" };
        if (SX.values in v)
          ret.values = v[SX.values].map((v1: any) => { return objectValue(v1); });
        if (SX.nodeKind in v)
          ret.nodeKind = v[SX.nodeKind][0].ldterm.substr(SX._namespace.length);
        ["length", "minlength", "maxlength", "mininclusive", "maxinclusive", "minexclusive", "maxexclusive", "totaldigits", "fractiondigits"].forEach(a => {
          if (SX[a] in v)
            ret[a] = parseFloat(v[SX[a]][0].ldterm.value);
        });
        if (SX.pattern in v)
          ret.pattern = v[SX.pattern][0].ldterm.value;
        if (SX.flags in v)
          ret.flags = v[SX.flags][0].ldterm.value;
        if (SX.datatype in v)
          ret.datatype = v[SX.datatype][0].ldterm;
        return ret;
      } else {
        throw Error("unknown shapeDeclOrExpr type in " + JSON.stringify(v));
      }

    }

    function objectValue (v: any, expectString?: boolean): any {
      if ("nested" in v) {
        const t = v.nested[RDF.type][0].ldterm;
        if ([SX.IriStem, SX.LiteralStem, SX.LanguageStem].indexOf(t) !== -1) {
          const ldterm = v.nested[SX.stem][0].ldterm.value;
          return {
            type: t.substr(SX._namespace.length),
            stem: ldterm
          };
        } else if ([SX.Language].indexOf(t) !== -1) {
          return {
            type: "Language",
            languageTag: v.nested[SX.languageTag][0].ldterm.value
          };
        } else if ([SX.IriStemRange, SX.LiteralStemRange, SX.LanguageStemRange].indexOf(t) !== -1) {
          const st = v.nested[SX.stem][0];
          let stem = st;
          if (typeof st === "object") {
            if (typeof st.ldterm === "object") {
              stem = st.ldterm;
            } else if (st.ldterm.startsWith("_:")) {
              stem = { type: "Wildcard" };
            }
          }
          const ret: any = {
            type: t.substr(SX._namespace.length),
            stem: stem.type !== "Wildcard" ? stem.value : stem
          };
          if (SX.exclusion in v.nested) {
            // IriStemRange:
            // * [{"ldterm":"http://a.example/v1"},{"ldterm":"http://a.example/v3"}] <-- no value
            // * [{"ldterm":"_:b836","nested":{a:[{"ldterm":sx:IriStem}],
            //                                 sx:stem:[{"ldterm":{"value":"http://a.example/v1"}}]}},
            //    {"ldterm":"_:b838","nested":{a:[{"ldterm":sx:IriStem}],
            //                                 sx:stem:[{"ldterm":{"value":"http://a.example/v3"}}]}}]

            // LiteralStemRange:
            // * [{"ldterm":{"value":"v1"}},{"ldterm":{"value":"v3"}}]
            // * [{"ldterm":"_:b866","nested":{a:[{"ldterm":sx:LiteralStem}],
            //                                 sx:stem:[{"ldterm":{"value":"v1"}}]}},
            //    {"ldterm":"_:b868","nested":{a:[{"ldterm":sx:LiteralStem}],
            //                                 sx:stem:[{"ldterm":{"value":"v3"}}]}}]

            // LanguageStemRange:
            // * [{"ldterm":{"value":"fr-be"}},{"ldterm":{"value":"fr-ch"}}]
            // * [{"ldterm":"_:b851","nested":{a:[{"ldterm":sx:LanguageStem}],
            //                                 sx:stem:[{"ldterm":{"value":"fr-be"}}]}},
            //    {"ldterm":"_:b853","nested":{a:[{"ldterm":sx:LanguageStem}],
            //                                 sx:stem:[{"ldterm":{"value":"fr-ch"}}]}}]
            ret.exclusions = v.nested[SX.exclusion].map((v1: any) => {
              return objectValue(v1, t !== SX.IriStemRange);
            });
          }
          return ret;
        } else {
          throw Error("unknown objectValue type in " + JSON.stringify(v));
        }
      } else {
        return expectString ? v.ldterm.value : v.ldterm;
      }
    }

    function tripleExpr (v: any): any {
      // tripleExpr = EachOf | OneOf | TripleConstraint | Inclusion ;
      const elts = { "EachOf"   : { nary: true , expr: true , prop: "expressions" },
                   "OneOf"    : { nary: true , expr: true , prop: "expressions" },
                   "Inclusion": { nary: false, expr: false, prop: "include"     } };
      const ret = findType(v, elts, tripleExpr);
      if (ret !== Missed) {
        minMaxAnnotSemActs(v, ret);
        return ret;
      }

      const t = v[RDF.type][0].ldterm;
      if (t === SX.TripleConstraint) {
        const ret: any = {
          type: "TripleConstraint",
          predicate: v[SX.predicate][0].ldterm
        };
        ["inverse"].forEach(a => {
          if (SX[a] in v)
            ret[a] = !!v[SX[a]][0].ldterm.value;
        });
        if (SX.valueExpr in v)
          ret.valueExpr = extend({id: v[SX.valueExpr][0].ldterm}, "nested" in v[SX.valueExpr][0] ? shapeDeclOrExpr(v[SX.valueExpr][0].nested) : {});
        minMaxAnnotSemActs(v, ret);
        return ret;
      } else {
        throw Error("unknown tripleExpr type in " + JSON.stringify(v));
      }
    }
    function minMaxAnnotSemActs (v: any, ret: any): any {
      if (SX.min in v)
        ret.min = parseInt(v[SX.min][0].ldterm.value);
      if (SX.max in v) {
        ret.max = parseInt(v[SX.max][0].ldterm.value);
        if (isNaN(ret.max))
          ret.max = UNBOUNDED;
      }
      if (SX.annotation in v)
        ret.annotations = v[SX.annotation].map((e: any) => {
          return {
            type: "Annotation",
            predicate: e.nested[SX.predicate][0].ldterm,
            object: e.nested[SX.object][0].ldterm
          };
        });
      if (SX.semActs in v)
        ret.semActs = v[SX.semActs].map((e: any) => {
          const ret: any = {
            type: "SemAct",
            name: e.nested[SX.name][0].ldterm
          };
          if (SX.code in e.nested)
            ret.code = e.nested[SX.code][0].ldterm.value;
          return ret;
        });
      return ret;
    }
  },
  simpleToShapeMap: function (x: { [node: string]: string[] }): { node: string, shape: string }[] {
    return Object.keys(x).reduce((ret: { node: string, shape: string }[], k) => {
      x[k].forEach(s => {
        ret.push({node: k, shape: s });
      });
      return ret;
    }, []);
  },

  absolutizeShapeMap: function (parsed: { node: string, shape: string }[], base: string): { node: string, shape: string }[] {
    return parsed.map(elt => {
      return Object.assign(elt, {
        node: new URL(elt.node, base).href,
        shape: new URL(elt.shape, base).href
      });
    });
  },

  errsToSimple: function (val: any): string[] {
    return new ShExHumanErrorWriter().write(val);
  },

  // static
  resolvePrefixedIRI: function (prefixedIri: string, prefixes: { [prefix: string]: string }): string | null {
    const colon = prefixedIri.indexOf(":");
    if (colon === -1)
      return null;
    const prefix = prefixes[prefixedIri.substr(0, colon)];
    return prefix === undefined ? null : prefix + prefixedIri.substr(colon+1);
  },

  parsePassedNode: function (passedValue: string | undefined, meta: any, deflt?: (() => string) | null, known?: ((str: string) => boolean) | null, reportUnknown?: ((str: string) => string) | null): string {
    if (passedValue === undefined || passedValue.length === 0)
      return known && known(meta.base) ? meta.base : deflt ? deflt() : this.NotSupplied;
    if (passedValue[0] === "_" && passedValue[1] === ":")
      return passedValue;
    if (passedValue[0] === "\"") {
      const m = passedValue.match(/^"((?:[^"\\]|\\")*)"(?:@(.+)|\^\^(?:<(.*)>|([^:]*):(.*)))?$/);
      if (!m)
        throw Error("malformed literal: " + passedValue);
      const lex = m[1], lang = m[2], rel = m[3], pre = m[4], local = m[5];
      // Turn the literal into an N3.js atom.
      const quoted = "\""+lex+"\"";
      if (lang !== undefined)
        return quoted + "@" + lang;
      if (pre !== undefined) {
        if (!(pre in meta.prefixes))
          throw Error("error parsing node "+passedValue+" no prefix for \"" + pre + "\"");
        return quoted + "^^" + meta.prefixes[pre] + local;
      }
      if (rel !== undefined)
        return quoted + "^^" + new URL(rel, meta.base).href;
      return quoted;
    }
    if (!meta)
      return known!(passedValue) ? passedValue : this.UnknownIRI;
    const relIRI = passedValue[0] === "<" && passedValue[passedValue.length-1] === ">";
    if (relIRI)
      passedValue = passedValue.substr(1, passedValue.length-2);
    const t = new URL(passedValue, (meta.base === "" || !meta.base ? undefined : meta.base)).href; // fall back to base-less mode
    if (known!(t))
      return t;
    if (!relIRI) {
      const t2 = this.resolvePrefixedIRI(passedValue, meta.prefixes);
      if (t2 !== null && known!(t2))
        return t2;
    }
    return reportUnknown ? reportUnknown(t) : this.UnknownIRI;
  },

  executeQueryPromise: function (query: string, endpoint: string, dataFactory: any): Promise<any[][]> {
    if (!endpoint)
      throw Error(`Can't execute a SPARQL query with no endpoint`);

    const queryURL = endpoint + "?query=" + encodeURIComponent(query);
    return fetch(queryURL, {
      headers: {
        'Accept': 'application/sparql-results+json'
      }}).then(resp => resp.json()).then(jsonObject => {
        return this.parseSparqlJsonResults(jsonObject, dataFactory);
      })// .then(x => new Promise(resolve => setTimeout(() => resolve(x), 1000)));
  },

  executeQuery: function (query: string, endpoint: string, dataFactory: any): any[][] {
    const queryURL = endpoint + "?query=" + encodeURIComponent(query);
    const xhr = new XMLHttpRequest();
    xhr.open("GET", queryURL, false);
    xhr.setRequestHeader('Accept', 'application/sparql-results+json');
    xhr.send();
    // const selectsBlock = query.match(/SELECT\s*(.*?)\s*{/)[1];
    // const selects = selectsBlock.match(/\?[^\s?]+/g);
    const jsonObject = JSON.parse(xhr.responseText);
    return this.parseSparqlJsonResults(jsonObject, dataFactory);
  },

  parseSparqlJsonResults: function (jsonObject: any, dataFactory: any): any[][] {
    const selects = jsonObject.head.vars;
    return jsonObject.results.bindings.map((row: any) => {
      // spec: https://www.w3.org/TR/rdf-sparql-json-res/#variable-binding-results
      return selects.map((sel: string) => {
        if (!(sel in row))
          return null;
        const elt = row[sel];
        switch (elt.type) {
        case "uri": return dataFactory.namedNode(elt.value);
        case "bnode": return dataFactory.blankNode(elt.value);
        case "literal":
          return dataFactory.literal(
            elt.value,
            "xml:lang" in elt
              ? elt["xml:lang"]
              : "datatype" in elt
              ? dataFactory.namedNode(elt.datatype)
              : undefined
          );
        case "typed-literal": // encountered in wikidata query service
          return dataFactory.literal(elt.value, elt.datatype);
        default: throw "unknown XML results type: " + elt.type;
        }
      })
    });
  },

  NotSupplied: "-- not supplied --", UnknownIRI: "-- not found --",

  /**
   * unescape numerics and allowed single-character escapes.
   * throws: if there are any unallowed sequences
   */
  unescapeText: function (string: string, replacements: { [key: string]: string }): string {
    const regex = /\\u([a-fA-F0-9]{4})|\\U([a-fA-F0-9]{8})|\\(.)/g;
    try {
      string = string.replace(regex, function (_sequence, unicode4, unicode8, escapedChar) {
        let charCode;
        if (unicode4) {
          charCode = parseInt(unicode4, 16);
          if (isNaN(charCode)) throw new Error(); // can never happen (regex), but helps performance
          return String.fromCharCode(charCode);
        }
        else if (unicode8) {
          charCode = parseInt(unicode8, 16);
          if (isNaN(charCode)) throw new Error(); // can never happen (regex), but helps performance
          if (charCode < 0xFFFF) return String.fromCharCode(charCode);
          return String.fromCharCode(0xD800 + ((charCode -= 0x10000) >> 10), 0xDC00 + (charCode & 0x3FF));
        }
        else {
          const replacement = replacements[escapedChar];
          if (!replacement) throw new Error("no replacement found for '" + escapedChar + "'");
          return replacement;
        }
      });
      return string;
    }
    catch (error) { console.warn(error); return ''; }
  },

};

// Add the ShExUtil functions to the given object or its prototype
function AddShExUtil(parent: any, toPrototype?: boolean): any {
  for (let name in ShExUtil)
    if (!toPrototype)
      parent[name] = (ShExUtil as any)[name];
    else
      parent.prototype[name] = ApplyToThis((ShExUtil as any)[name]);

  return parent;
}

// Returns a function that applies `f` to the `this` object
function ApplyToThis(f: any) {
  return function (this: any, a: any) { return f(this, a); };
}

/* The runtime export keeps the historical callable form: a function
 * (AddShExUtil) carrying all of the ShExUtil members as properties.
 * The declared type is just the member object, which is what consumers use.
 */
const exported = AddShExUtil(AddShExUtil) as typeof ShExUtil;
export = exported;
