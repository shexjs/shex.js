/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 764
(__unused_webpack_module, exports) {

"use strict";

/** ShapePath types
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.t_annotationAttr = exports.t_semActAttr = exports.t_tripleConstraintAttr = exports.t_tripleExprAttr = exports.t_shapeAttr = exports.t_valueSetValueAttr = exports.t_numericFacetAttr = exports.t_stringFacetAttr = exports.t_xsFacetAttr = exports.t_nodeConstraintAttr = exports.t_shapeExprAttr = exports.t_schemaAttr = exports.t_attribute = exports.t_valueType = exports.t_tripleExprType = exports.t_shapeExprType = exports.t_shapeDeclAttr = exports.t_termType = exports.Assertion = exports.Filter = exports.FuncName = exports.Function = exports.Axis = exports.PathExprStep = exports.AxisStep = exports.ChildStep = exports.Step = exports.Path = exports.Intersection = exports.Union = exports.Sequence = exports.Junction = exports.PathExpr = exports.EvalContext = exports.Serializable = void 0;
class Serializable {
}
exports.Serializable = Serializable;
class EvalContext {
    schema;
    constructor(schema) {
        this.schema = schema;
    }
    // lazy eval of triple expression labels, for resolving an Inclusion
    tripleExprs = null;
    /**
     * The triple expression declared with this label, if the schema has one.
     *
     * ShExJ has no top-level list of triple expressions the way it has
     * `shapes`, so this is a walk: a labelled expression may sit anywhere,
     * including inside the inline shape of some constraint's value
     * expression.  Two rules the walk keeps, as `descendant::` does -- a
     * property whose name begins with "_" is not ShExJ and is not descended
     * into, and a node already seen is not visited twice.
     */
    getTripleExpr(label) {
        if (this.tripleExprs === null) {
            const index = new Map();
            const seen = new Set();
            collect(this.schema);
            this.tripleExprs = index;
            function collect(node) {
                if (node === null || typeof node !== 'object' || seen.has(node))
                    return;
                seen.add(node);
                if (Array.isArray(node))
                    return node.forEach(collect);
                if (typeof node.id === 'string' && TripleExprTypes.indexOf(node.type) !== -1
                    && !index.has(node.id))
                    index.set(node.id, node);
                Object.keys(node).filter(k => k[0] !== '_').forEach(k => collect(node[k]));
            }
        }
        return this.tripleExprs.get(label);
    }
    // lazy eval of parents
    parents = null;
    getParents() {
        if (this.parents === null) {
            this.parents = new Map();
            populateParents(this.parents, this.schema, null);
        }
        return this.parents;
        function populateParents(parents, node, parent) {
            parents.set(node, parent);
            if (typeof node === 'object')
                Object.values(node).forEach(n2 => populateParents(parents, n2, node));
        }
    }
}
exports.EvalContext = EvalContext;
/* class hierarchy
 *   Serializable
 *     PathExpr
 *       Junction
 *         Sequence
 *         Union
 *         Intersection
 *       Path
 *     Step
 *       UnitStep
 *       PathExprStep
 *     Function
 *       Filter
 *       Assertion
 */
class PathExpr extends Serializable {
}
exports.PathExpr = PathExpr;
class Junction extends PathExpr {
    exprs;
    constructor(exprs) {
        super();
        this.exprs = exprs;
    }
}
exports.Junction = Junction;
class Sequence extends Junction {
    t = "Sequence";
    evalPathExpr(nodes, ctx) {
        return this.exprs.reduce((ret, expr) => ret.concat(expr.evalPathExpr(nodes, ctx)), []);
    }
}
exports.Sequence = Sequence;
class Union extends Junction {
    t = "Union";
    evalPathExpr(nodes, ctx) {
        return dedupe(this.exprs.reduce((ret, expr) => ret.concat(expr.evalPathExpr(nodes, ctx)), []));
    }
}
exports.Union = Union;
class Intersection extends Junction {
    t = "Intersection";
    /**
     * What every expression selected, in the first one's order.
     *
     * This used to compute the intersection into a Map and then return the
     * first expression's results regardless of it, so `A intersection B` was
     * A -- which is also A intersection nothing.
     */
    evalPathExpr(nodes, ctx) {
        const [first, ...rest] = this.exprs;
        return rest.reduce((kept, expr) => {
            const alsoSelected = new Set(expr.evalPathExpr(nodes, ctx).map(itemKey));
            return kept.filter(elt => alsoSelected.has(itemKey(elt)));
        }, dedupe(first.evalPathExpr(nodes, ctx)));
    }
}
exports.Intersection = Intersection;
/**
 * What the junctions call one item.
 *
 * By value, so two structurally identical constraints in different shapes
 * are one item here where every other operator has them as two.  Identity
 * is probably what these want; changing it is a language decision, so it is
 * written down as an issue in the spec rather than settled here.
 */
function itemKey(node) {
    return JSON.stringify(node);
}
/** the nodes, first occurrence of each kept */
function dedupe(nodes) {
    const seen = new Set();
    return nodes.filter(node => {
        const key = itemKey(node);
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
}
class Path extends PathExpr {
    steps;
    t = 'Path';
    constructor(steps) {
        super();
        this.steps = steps;
    }
    evalPathExpr(nodes, ctx) {
        return this.steps.reduce((ret, step) => {
            return step.evalStep(ret, ctx);
        }, nodes);
    }
}
exports.Path = Path;
class Step extends Serializable {
}
exports.Step = Step;
class ChildStep extends Step {
    attribute;
    filters;
    t = 'ChildStep';
    constructor(attribute, filters) {
        super();
        this.attribute = attribute;
        this.filters = filters;
    }
    evalStep(nodes, ctx) {
        const selectedNodes = nodes.reduce((ret, node) => {
            let match = [];
            if (node instanceof Array && this.attribute === t_attribute.Any) {
                match = node;
            }
            else if (node instanceof Object) {
                if (this.attribute === t_attribute.Any) {
                    match = Object.values(node);
                }
                else {
                    const key = this.attribute.toString();
                    if (key in node)
                        match = [node[key]];
                }
            }
            return ret.concat(match);
        }, []);
        return (this.filters || []).reduce(// For each filter,
        (filteredNodes, f) => filteredNodes.filter(// trim NodeSet to nodes passing filter.
        (node, idx) => // (Aggregates need access to current node list.)
         ebv(f.evalFunction(node, filteredNodes, idx, ctx)) === Pass), selectedNodes // Start filter walk from selected nodes.
        );
    }
}
exports.ChildStep = ChildStep;
class AxisStep extends Step {
    axis;
    filters;
    t = 'AxisStep';
    constructor(axis, filters) {
        super();
        this.axis = axis;
        this.filters = filters;
    }
    evalStep(nodes, ctx) {
        const selectedNodes = nodes.reduce((ret, node) => {
            let match = [];
            switch (this.axis) {
                case Axis.self:
                    match = [node];
                    break;
                case Axis.thisShapeExpr:
                    match = walkShapeExpr(node);
                    break;
                case Axis.thisTripleExpr:
                    match = walkTripleExpr(node);
                    break;
                case Axis.parent:
                    {
                        const parentMap = ctx.getParents();
                        const parent = parentMap.get(node);
                        match = parent ? [parent] : [];
                    }
                    break;
                case Axis.ancestor:
                    const parentMap = ctx.getParents();
                    match = walkParents(parentMap, node);
                    break;
                case Axis.descendant:
                    match = walkDescendants(node);
                    break;
            }
            return ret.concat(match);
        }, []);
        return (this.filters || []).reduce(// For each filter,
        (filteredNodes, f) => filteredNodes.filter(// trim NodeSet to nodes passing filter.
        (node, idx) => // (Aggregates need access to current node list.)
         ebv(f.evalFunction(node, filteredNodes, idx, ctx)) === Pass), selectedNodes // Start filter walk from selected nodes.
        );
        function walkParents(parentMap, node) {
            const parent = parentMap.get(node);
            if (parent === undefined)
                throw Error(`Should not arrive here: parentMap.get(${node})`);
            if (parent === null) // top of the hieararchy
                return [];
            return [parent].concat(walkParents(parentMap, parent));
        }
        /**
         * Every node below this one, not including it -- cf. XPath descendant::.
         *
         * A schema in hand is not always a tree: an implementation may hang its
         * own index off it (shex.js parks `_index` on the schema, pointing at
         * the very nodes `shapes` holds), and a subexpression can be shared.  So
         * two rules that XPath over XML doesn't need: properties whose name
         * begins with "_" are not ShExJ and are not descended into, and a node
         * already seen is not visited twice.
         */
        function walkDescendants(node) {
            const ret = [];
            const seen = new Set();
            children(node).forEach(collect);
            return ret;
            function collect(n) {
                if (n === null || typeof n !== 'object' || seen.has(n))
                    return;
                seen.add(n);
                ret.push(n);
                children(n).forEach(collect);
            }
            function children(n) {
                return Array.isArray(n)
                    ? n
                    : Object.keys(n)
                        .filter(k => k[0] !== '_')
                        .map(k => n[k]);
            }
        }
        function walkShapeExpr(node) {
            if (node instanceof Array)
                return node.reduce((ret, n2) => ret.concat(walkShapeExpr(n2)), []);
            if (!(node instanceof Object))
                return [];
            switch (node.type) {
                case "ShapeAnd":
                case "ShapeOr":
                    return [node].concat(walkShapeExpr(node.shapeExprs));
                case "ShapeNot":
                    return [node].concat(walkShapeExpr(node.shapeExpr));
                case "Shape":
                case "NodeConstraint":
                    return [node];
                default: return [];
            }
        }
        /**
         * @param seen - the expressions this walk has already reported.  A body
         *   that includes the same expression twice, or one that includes
         *   itself, is still that expression once.
         */
        function walkTripleExpr(node, seen = new Set()) {
            if (node instanceof Array)
                return node.reduce((ret, n2) => ret.concat(walkTripleExpr(n2, seen)), []);
            if (typeof node === 'string') {
                // An Inclusion: `&<#label>` is ShExJ's way of writing "and the
                // expression called <#label> is part of this one too", so the body
                // this axis walks takes it in.  Stopping here instead had ~<iri>
                // report a shape's body as smaller than the matcher reads it.
                const expr = ctx.getTripleExpr(node);
                return expr === undefined ? [] : walkTripleExpr(expr, seen);
            }
            if (!(node instanceof Object) || seen.has(node))
                return [];
            seen.add(node);
            switch (node.type) {
                case "EachOf":
                case "OneOf":
                    return [node].concat(walkTripleExpr(node.expressions, seen));
                case "TripleConstraint":
                    return [node];
                default: return [];
            }
        }
    }
}
exports.AxisStep = AxisStep;
class PathExprStep extends Step {
    pathExpr;
    filters;
    t = 'PathExprStep';
    constructor(pathExpr, filters) {
        super();
        this.pathExpr = pathExpr;
        this.filters = filters;
    }
    evalStep(nodes, ctx) {
        throw Error('PatheExprStep.evalStep not yet implemented');
    }
}
exports.PathExprStep = PathExprStep;
var Axis;
(function (Axis) {
    Axis["child"] = "child::";
    Axis["thisShapeExpr"] = "thisShapeExpr::";
    Axis["thisTripleExpr"] = "thisTripleExpr::";
    Axis["self"] = "self::";
    Axis["parent"] = "parent::";
    Axis["ancestor"] = "ancestor::";
    /**
     * Every node beneath this one.  ShExJ has no top-level list of triple
     * expressions the way it has `shapes`, so a labelled one is found by
     * looking everywhere -- including inside a nested inline shape, which
     * `thisTripleExpr::` does not reach.  Reachable from the `$<label>`
     * shortcut; there is deliberately no token for it yet.
     */
    Axis["descendant"] = "descendant::";
})(Axis = exports.Axis || (exports.Axis = {}));
class Function extends Serializable {
}
exports.Function = Function;
var FuncName;
(function (FuncName) {
    FuncName["index"] = "index";
    FuncName["count"] = "count";
    FuncName["ebv"] = "ebv";
    // operators
    FuncName["equal"] = "equal";
    FuncName["lessThan"] = "lessThan";
    FuncName["greaterThan"] = "greaterThan";
})(FuncName = exports.FuncName || (exports.FuncName = {}));
class Filter extends Function {
    op;
    args;
    t = 'Filter';
    constructor(op, args) {
        super();
        this.op = op;
        this.args = args;
    }
    isAggregate() { return [FuncName.index, FuncName.count, FuncName.ebv].indexOf(this.op) !== -1; }
    evalFunction(node, allNodes, idx, ctx) {
        // !! separate aggregates in the grammar
        if (this.isAggregate()) {
            switch (this.op) {
                case FuncName.index:
                    // `[2]` is shorthand for `[index() = 2]` (grammar: filterExpr ->
                    // Filter(index, [numericExpr])), so an index filter given an
                    // argument compares rather than reports.  Positions are 0-based,
                    // as index() has always reported them.
                    return this.args.length === 0
                        ? [idx]
                        : evalArgs(this.args, node, allNodes)[0] === idx ? [node] : [];
                case FuncName.count:
                    return [allNodes.length];
                case FuncName.ebv: {
                    // the effective boolean value *of the argument*, for this node --
                    // `[index()]`, `[/id]`.  It used to answer for the whole node set,
                    // so any filter written this way passed everything.
                    const arg = this.args[0];
                    if (arg === undefined)
                        return ebv(allNodes);
                    if (arg instanceof PathExpr)
                        return ebv(arg.evalPathExpr([node], ctx));
                    if (arg instanceof Function)
                        return ebv(arg.evalFunction(node, allNodes, idx, ctx));
                    return ebv([arg]);
                }
                default:
                    throw Error(`Not Implemented: Filter ${this.op} ${this.args}`);
            }
        }
        else {
            const args = evalArgs(this.args, node, allNodes);
            switch (this.op) {
                case FuncName.equal:
                    const [l, r] = args;
                    if (l === r || sameJsonldString(l, r)) // (number, numper), (Iri, Iri), (Object, Object)
                        return [node];
                    // if (l instanceof Iri && r instanceof Iri && l.toJSON() === r.toJSON()) // (number, numper), (Iri, Iri), (Object, Object)
                    //   return [node]
                    break;
                case FuncName.lessThan:
                case FuncName.greaterThan:
                    break;
                default:
                    throw Error(`Not Implemented: Filter ${this.op} ${this.args}`);
            }
            return [];
        }
        function evalArgs(args, node, allNodes) {
            // Note: no second parameter on the callback.  It used to be named
            // `idx`, which shadowed the node's position with the argument's, so a
            // nested aggregate -- the `index()` in `[index() = 1]` -- reported
            // where it sat in the argument list instead of where the node sat in
            // the node set.
            return args.map(arg => {
                if (typeof arg === 'number' || typeof arg === 'string' /* || arg instanceof Iri */)
                    return arg;
                if (arg instanceof Function)
                    return arg.evalFunction(node, allNodes, idx, ctx)[0];
                if (arg instanceof PathExpr)
                    return arg.evalPathExpr([node], ctx)[0];
            });
        }
    }
}
exports.Filter = Filter;
function sameJsonldString(l, r) {
    return isPlainObject(l) && isPlainObject(r)
        // test as ShExJ.ObjectLiteral
        && l.value === r.value
        && l.language === r.language
        && l.type === r.type;
    function isPlainObject(value) {
        return value instanceof Object &&
            Object.getPrototypeOf(value) == Object.prototype;
    }
}
const Pass = [true];
const Fail = [false];
function ebv(nodes) {
    if (nodes.length > 1)
        return Pass;
    if (nodes.length === 0)
        return Fail;
    if (typeof nodes[0] === 'boolean')
        // without this, ebv(Fail) is Pass: a filter that answered "no" and was
        // asked again -- which is what the step does to every filter -- said yes
        return nodes[0] ? Pass : Fail;
    if (typeof nodes[0] === 'number')
        return nodes[0] === 0 ? Fail : Pass;
    if (typeof nodes[0] === 'string')
        return nodes[0].length === 0 ? Fail : Pass;
    return Pass;
}
class Assertion extends Function {
    expect;
    t = 'Assertion';
    constructor(expect) {
        super();
        this.expect = expect;
    }
    evalFunction(node, allNodes, idx, ctx) {
        const val = this.expect.evalFunction(node, allNodes, idx, ctx);
        if (ebv(val) !== Pass)
            throw Error(`failed assertion: ebv(${JSON.stringify(val)}) !== ${JSON.stringify(Pass)} in ${JSON.stringify(this)} on ${JSON.stringify(node)} /  ${JSON.stringify(allNodes)}`);
        return Pass;
    }
}
exports.Assertion = Assertion;
var t_termType;
(function (t_termType) {
    t_termType["Schema"] = "Schema";
    t_termType["ShapeDecl"] = "ShapeDecl";
    t_termType["SemAct"] = "SemAct";
    t_termType["Annotation"] = "Annotation";
})(t_termType = exports.t_termType || (exports.t_termType = {}));
var t_shapeDeclAttr;
(function (t_shapeDeclAttr) {
    t_shapeDeclAttr["abstract"] = "abstract";
    t_shapeDeclAttr["shapeExpr"] = "shapeExpr";
})(t_shapeDeclAttr = exports.t_shapeDeclAttr || (exports.t_shapeDeclAttr = {}));
var t_shapeExprType;
(function (t_shapeExprType) {
    t_shapeExprType["ShapeAnd"] = "ShapeAnd";
    t_shapeExprType["ShapeOr"] = "ShapeOr";
    t_shapeExprType["ShapeNot"] = "ShapeNot";
    t_shapeExprType["NodeConstraint"] = "NodeConstraint";
    t_shapeExprType["Shape"] = "Shape";
    t_shapeExprType["ShapeExternal"] = "ShapeExternal";
})(t_shapeExprType = exports.t_shapeExprType || (exports.t_shapeExprType = {}));
/** the ShExJ types this axis walks; an Inclusion is a label, not one of these */
const TripleExprTypes = ['EachOf', 'OneOf', 'TripleConstraint'];
var t_tripleExprType;
(function (t_tripleExprType) {
    t_tripleExprType["EachOf"] = "EachOf";
    t_tripleExprType["OneOf"] = "OneOf";
    t_tripleExprType["TripleConstraint"] = "TripleConstraint";
})(t_tripleExprType = exports.t_tripleExprType || (exports.t_tripleExprType = {}));
var t_valueType;
(function (t_valueType) {
    t_valueType["IriStem"] = "IriStem";
    t_valueType["IriStemRange"] = "IriStemRange";
    t_valueType["LiteralStem"] = "LiteralStem";
    t_valueType["LiteralStemRange"] = "LiteralStemRange";
    t_valueType["Language"] = "Language";
    t_valueType["LanguageStem"] = "LanguageStem";
    t_valueType["LanguageStemRange"] = "LanguageStemRange";
    t_valueType["Wildcard"] = "Wildcard";
})(t_valueType = exports.t_valueType || (exports.t_valueType = {}));
var t_attribute;
(function (t_attribute) {
    t_attribute["Any"] = "*";
    t_attribute["type"] = "type";
    t_attribute["id"] = "id";
    t_attribute["semActs"] = "semActs";
    t_attribute["annotations"] = "annotations";
    t_attribute["predicate"] = "predicate";
})(t_attribute = exports.t_attribute || (exports.t_attribute = {}));
var t_schemaAttr;
(function (t_schemaAttr) {
    t_schemaAttr["atContext"] = "@context";
    t_schemaAttr["startActs"] = "startActs";
    t_schemaAttr["start"] = "start";
    t_schemaAttr["imports"] = "imports";
    t_schemaAttr["shapes"] = "shapes";
})(t_schemaAttr = exports.t_schemaAttr || (exports.t_schemaAttr = {}));
var t_shapeExprAttr;
(function (t_shapeExprAttr) {
    t_shapeExprAttr["shapeExprs"] = "shapeExprs";
    t_shapeExprAttr["shapeExpr"] = "shapeExpr";
})(t_shapeExprAttr = exports.t_shapeExprAttr || (exports.t_shapeExprAttr = {}));
var t_nodeConstraintAttr;
(function (t_nodeConstraintAttr) {
    t_nodeConstraintAttr["nodeKind"] = "nodeKind";
    t_nodeConstraintAttr["datatype"] = "datatype";
    t_nodeConstraintAttr["values"] = "values";
})(t_nodeConstraintAttr = exports.t_nodeConstraintAttr || (exports.t_nodeConstraintAttr = {}));
var t_xsFacetAttr;
(function (t_xsFacetAttr) {
})(t_xsFacetAttr = exports.t_xsFacetAttr || (exports.t_xsFacetAttr = {}));
var t_stringFacetAttr;
(function (t_stringFacetAttr) {
    t_stringFacetAttr["length"] = "length";
    t_stringFacetAttr["minlength"] = "minlength";
    t_stringFacetAttr["maxlength"] = "maxlength";
    t_stringFacetAttr["pattern"] = "pattern";
    t_stringFacetAttr["flags"] = "flags";
})(t_stringFacetAttr = exports.t_stringFacetAttr || (exports.t_stringFacetAttr = {}));
var t_numericFacetAttr;
(function (t_numericFacetAttr) {
    t_numericFacetAttr["mininclusive"] = "mininclusive";
    t_numericFacetAttr["minexclusive"] = "minexclusive";
    t_numericFacetAttr["maxinclusive"] = "maxinclusive";
    t_numericFacetAttr["maxexclusive"] = "maxexclusive";
    t_numericFacetAttr["totaldigits"] = "totaldigits";
    t_numericFacetAttr["fractiondigits"] = "fractiondigits";
})(t_numericFacetAttr = exports.t_numericFacetAttr || (exports.t_numericFacetAttr = {}));
var t_valueSetValueAttr;
(function (t_valueSetValueAttr) {
    t_valueSetValueAttr["value"] = "value";
    t_valueSetValueAttr["language"] = "language";
    t_valueSetValueAttr["stem"] = "stem";
    t_valueSetValueAttr["exclusions"] = "exclusions";
    t_valueSetValueAttr["languageTag"] = "languageTag";
})(t_valueSetValueAttr = exports.t_valueSetValueAttr || (exports.t_valueSetValueAttr = {}));
var t_shapeAttr;
(function (t_shapeAttr) {
    t_shapeAttr["closed"] = "closed";
    t_shapeAttr["extra"] = "extra";
    t_shapeAttr["extends"] = "extends";
    t_shapeAttr["expression"] = "expression";
})(t_shapeAttr = exports.t_shapeAttr || (exports.t_shapeAttr = {}));
var t_tripleExprAttr;
(function (t_tripleExprAttr) {
    t_tripleExprAttr["expressions"] = "expressions";
    t_tripleExprAttr["min"] = "min";
    t_tripleExprAttr["max"] = "max";
})(t_tripleExprAttr = exports.t_tripleExprAttr || (exports.t_tripleExprAttr = {}));
var t_tripleConstraintAttr;
(function (t_tripleConstraintAttr) {
    t_tripleConstraintAttr["inverse"] = "inverse";
    t_tripleConstraintAttr["valueExpr"] = "valueExpr";
})(t_tripleConstraintAttr = exports.t_tripleConstraintAttr || (exports.t_tripleConstraintAttr = {}));
var t_semActAttr;
(function (t_semActAttr) {
    t_semActAttr["name"] = "name";
    t_semActAttr["code"] = "code";
})(t_semActAttr = exports.t_semActAttr || (exports.t_semActAttr = {}));
var t_annotationAttr;
(function (t_annotationAttr) {
    t_annotationAttr["object"] = "object";
})(t_annotationAttr = exports.t_annotationAttr || (exports.t_annotationAttr = {}));
//# sourceMappingURL=ShapePathAst.js.map

/***/ },

/***/ 25
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* parser generated by jison 0.3.0 */
/**
 * Returns a Parser implementing JisonParserApi and a Lexer implementing JisonLexerApi.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShapePathLexer = exports.ShapePathParser = exports.predicateShortCut = exports.tripleExprLabelShortCut = exports.shapeLabelShortCut = void 0;
const ShapePathAst_1 = __webpack_require__(764);
function makeFunction(assertionP, firstArg, comp = { op: ShapePathAst_1.FuncName.ebv, r: null }) {
    const { op, r } = comp;
    const args = [firstArg];
    // not `if (r)`: 0 and "" are rvalues, and `[index() = 0]` used to lose its
    // right-hand side and become a bare ebv of index()
    if (r !== null && r !== undefined)
        args.push(r);
    const ret = new ShapePathAst_1.Filter(op, args);
    return assertionP
        ? new ShapePathAst_1.Assertion(ret)
        : ret;
}
function filterTermType(type, filters) {
    if (type)
        filters.unshift(new ShapePathAst_1.Filter(ShapePathAst_1.FuncName.equal, [
            new ShapePathAst_1.Path([new ShapePathAst_1.ChildStep(ShapePathAst_1.t_attribute.type)]),
            type
        ]));
    return filters.length > 0 ? filters : undefined;
}
const newIri = (s) => s;
function pnameToUrl(pname, yy) {
    const idx = pname.indexOf(':');
    const pre = pname.substr(0, idx);
    const lname = pname.substr(idx + 1);
    if (!(pre in yy.prefixes))
        throw Error(`unknown prefix in ${pname}`);
    const ns = yy.prefixes[pre];
    return newIri(new URL(ns + lname, yy.base).href);
}
function shapeLabelShortCut(label) {
    return [
        new ShapePathAst_1.ChildStep(ShapePathAst_1.t_schemaAttr.shapes),
        new ShapePathAst_1.ChildStep(ShapePathAst_1.t_attribute.Any, [
            new ShapePathAst_1.Filter(ShapePathAst_1.FuncName.equal, [
                new ShapePathAst_1.Path([new ShapePathAst_1.ChildStep(ShapePathAst_1.t_attribute.id)]),
                label
            ]),
            new ShapePathAst_1.Assertion(new ShapePathAst_1.Filter(ShapePathAst_1.FuncName.equal, [
                new ShapePathAst_1.Filter(ShapePathAst_1.FuncName.count, []),
                1
            ]))
        ]),
        new ShapePathAst_1.ChildStep(ShapePathAst_1.t_shapeDeclAttr.shapeExpr),
    ];
}
exports.shapeLabelShortCut = shapeLabelShortCut;
/**
 * `$<label>` -- the triple expression that ShExC declared with that label.
 *
 * ShExJ has no top-level list of triple expressions the way it has `shapes`,
 * and a label may sit on an EachOf, a OneOf or a TripleConstraint at any
 * depth, including inside a nested inline shape.  So this looks everywhere
 * and asserts that it found exactly one, which mirrors `@<label>`.  A label
 * that named both a shape and a triple expression would be ambiguous here,
 * and is already a structural error in ShEx.
 */
function tripleExprLabelShortCut(label) {
    return [
        new ShapePathAst_1.AxisStep(ShapePathAst_1.Axis.descendant, [
            new ShapePathAst_1.Filter(ShapePathAst_1.FuncName.equal, [
                new ShapePathAst_1.Path([new ShapePathAst_1.ChildStep(ShapePathAst_1.t_attribute.id)]),
                label
            ]),
            new ShapePathAst_1.Assertion(new ShapePathAst_1.Filter(ShapePathAst_1.FuncName.equal, [
                new ShapePathAst_1.Filter(ShapePathAst_1.FuncName.count, []),
                1
            ]))
        ]),
    ];
}
exports.tripleExprLabelShortCut = tripleExprLabelShortCut;
function predicateShortCut(label) {
    return [
        new ShapePathAst_1.AxisStep(ShapePathAst_1.Axis.thisShapeExpr, filterTermType(ShapePathAst_1.t_shapeExprType.Shape, [])),
        new ShapePathAst_1.ChildStep(ShapePathAst_1.t_shapeAttr.expression),
        new ShapePathAst_1.AxisStep(ShapePathAst_1.Axis.thisTripleExpr, filterTermType(ShapePathAst_1.t_tripleExprType.TripleConstraint, [
            new ShapePathAst_1.Filter(ShapePathAst_1.FuncName.equal, [
                new ShapePathAst_1.Path([new ShapePathAst_1.ChildStep(ShapePathAst_1.t_attribute.predicate)]),
                label
            ])
        ]))
    ];
}
exports.predicateShortCut = predicateShortCut;
const parser_1 = __webpack_require__(386);
const $V0 = [38, 40, 42, 43, 44, 45, 46, 47, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 103, 104, 105, 106, 107, 108, 109, 112, 113, 115, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 142, 143, 144, 145, 146], $V1 = [2, 21], $V2 = [1, 11], $V3 = [1, 12], $V4 = [1, 13], $V5 = [1, 14], $V6 = [1, 15], $V7 = [5, 9, 39, 51, 66, 67, 68], $V8 = [5, 9, 13, 39, 51, 66, 67, 68], $V9 = [5, 9, 13, 17, 39, 51, 66, 67, 68], $Va = [5, 9, 13, 17, 25, 26, 29, 30, 31, 39, 51, 66, 67, 68], $Vb = [47, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 103, 104, 105, 106, 107, 108, 109, 112, 113, 115, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 142, 143, 144, 145, 146], $Vc = [2, 33], $Vd = [1, 24], $Ve = [1, 25], $Vf = [1, 26], $Vg = [1, 27], $Vh = [1, 28], $Vi = [1, 29], $Vj = [1, 30], $Vk = [1, 32], $Vl = [1, 34], $Vm = [1, 35], $Vn = [147, 149, 150], $Vo = [1, 50], $Vp = [1, 51], $Vq = [1, 52], $Vr = [1, 55], $Vs = [1, 56], $Vt = [1, 57], $Vu = [1, 58], $Vv = [1, 59], $Vw = [1, 60], $Vx = [1, 61], $Vy = [1, 62], $Vz = [1, 63], $VA = [1, 64], $VB = [1, 65], $VC = [1, 66], $VD = [1, 67], $VE = [1, 68], $VF = [1, 69], $VG = [1, 70], $VH = [1, 71], $VI = [5, 9, 13, 17, 25, 26, 29, 30, 31, 39, 49, 51, 66, 67, 68], $VJ = [2, 37], $VK = [5, 9, 13, 17, 25, 26, 29, 30, 31, 39, 49, 51, 66, 67, 68, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91], $VL = [2, 35], $VM = [1, 139], $VN = [25, 26, 29, 30, 31, 38, 40, 42, 43, 44, 45, 46, 47, 58, 59, 60, 61, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 103, 104, 105, 106, 107, 108, 109, 112, 113, 115, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 142, 143, 144, 145, 146], $VO = [2, 52], $VP = [1, 158], $VQ = [1, 159], $VR = [1, 160], $VS = [63, 147, 149, 150], $VT = [51, 66, 67, 68];
class ShapePathParser extends parser_1.JisonParser {
    $;
    constructor(yy = {}, lexer = new ShapePathLexer(yy)) {
        super(yy, lexer);
    }
    symbols_ = { "error": 2, "top": 3, "shapePath": 4, "EOF": 5, "sequenceStep": 6, "Q_O_QGT_COMMA_E_S_QsequenceStep_E_C_E_Star": 7, "O_QGT_COMMA_E_S_QsequenceStep_E_C": 8, "GT_COMMA": 9, "unionStep": 10, "Q_O_QIT_union_E_S_QunionStep_E_C_E_Star": 11, "O_QIT_union_E_S_QunionStep_E_C": 12, "IT_UNION": 13, "intersectionStep": 14, "Q_O_QIT_intersection_E_S_QintersectionStep_E_C_E_Star": 15, "O_QIT_intersection_E_S_QintersectionStep_E_C": 16, "IT_INTERSECTION": 17, "startStep": 18, "QnextStep_E_Star": 19, "nextStep": 20, "Q_O_QGT_DIVIDE_E_Or_QGT_DIVIDE_DIVIDE_E_C_E_Opt": 21, "step": 22, "shortcut": 23, "O_QGT_DIVIDE_E_Or_QGT_DIVIDE_DIVIDE_E_C": 24, "GT_DIVIDE": 25, "GT_DIVIDEDIVIDE": 26, "O_QGT_AT_E_Or_QGT_TILDE_E_Or_QGT_DOLLAR_E_C": 27, "iri": 28, "GT_AT": 29, "GT_TILDE": 30, "GT_DOLLAR": 31, "QIT_child_E_Opt": 32, "termType": 33, "Qfilter_E_Star": 34, "attributeOrAny": 35, "QtermType_E_Opt": 36, "nonChildAxis": 37, "GT_LPAREN": 38, "GT_RPAREN": 39, "IT_child": 40, "filter": 41, "IT_thisShapeExpr": 42, "IT_thisTripleExpr": 43, "IT_self": 44, "IT_parent": 45, "IT_ancestor": 46, "GT_STAR": 47, "attribute": 48, "GT_LBRACKET": 49, "filterExpr": 50, "GT_RBRACKET": 51, "QIT_ASSERT_E_Opt": 52, "Qcomparison_E_Opt": 53, "function": 54, "numericExpr": 55, "IT_ASSERT": 56, "comparison": 57, "IT_index": 58, "IT_count": 59, "IT_foo1": 60, "IT_foo2": 61, "fooArg": 62, "INTEGER": 63, "comparitor": 64, "rvalue": 65, "GT_EQUAL": 66, "GT_LT": 67, "GT_GT": 68, "shapeExprType": 69, "tripleExprType": 70, "valueType": 71, "IT_Schema": 72, "IT_SemAct": 73, "IT_Annotation": 74, "IT_ShapeAnd": 75, "IT_ShapeOr": 76, "IT_ShapeNot": 77, "IT_NodeConstraint": 78, "IT_Shape": 79, "IT_ShapeExternal": 80, "IT_EachOf": 81, "IT_OneOf": 82, "IT_TripleConstraint": 83, "IT_IriStem": 84, "IT_IriStemRange": 85, "IT_LiteralStem": 86, "IT_LiteralStemRange": 87, "IT_Language": 88, "IT_LanguageStem": 89, "IT_LanguageStemRange": 90, "IT_Wildcard": 91, "IT_type": 92, "IT_id": 93, "IT_semActs": 94, "IT_annotations": 95, "IT_predicate": 96, "schemaAttr": 97, "shapeExprAttr": 98, "tripleExprAttr": 99, "valueSetValueAttr": 100, "semActAttr": 101, "annotationAttr": 102, "GT_atContext": 103, "IT_startActs": 104, "IT_start": 105, "IT_imports": 106, "IT_shapes": 107, "IT_shapeExprs": 108, "IT_shapeExpr": 109, "nodeConstraintAttr": 110, "shapeAttr": 111, "IT_nodeKind": 112, "IT_datatype": 113, "xsFacetAttr": 114, "IT_values": 115, "stringFacetAttr": 116, "numericFacetAttr": 117, "IT_length": 118, "IT_minlength": 119, "IT_maxlength": 120, "IT_pattern": 121, "IT_flags": 122, "IT_mininclusive": 123, "IT_minexclusive": 124, "IT_maxinclusive": 125, "IT_maxexclusive": 126, "IT_totaldigits": 127, "IT_fractiondigits": 128, "IT_value": 129, "IT_language": 130, "IT_stem": 131, "IT_exclusions": 132, "IT_languageTag": 133, "IT_closed": 134, "IT_extra": 135, "IT_extends": 136, "IT_expression": 137, "IT_expressions": 138, "IT_min": 139, "IT_max": 140, "tripleConstraintAttr": 141, "IT_inverse": 142, "IT_valueExpr": 143, "IT_name": 144, "IT_code": 145, "IT_object": 146, "IRIREF": 147, "prefixedName": 148, "PNAME_LN": 149, "PNAME_NS": 150, "$accept": 0, "$end": 1 };
    terminals_ = { 2: "error", 5: "EOF", 9: "GT_COMMA", 13: "IT_UNION", 17: "IT_INTERSECTION", 25: "GT_DIVIDE", 26: "GT_DIVIDEDIVIDE", 29: "GT_AT", 30: "GT_TILDE", 31: "GT_DOLLAR", 38: "GT_LPAREN", 39: "GT_RPAREN", 40: "IT_child", 42: "IT_thisShapeExpr", 43: "IT_thisTripleExpr", 44: "IT_self", 45: "IT_parent", 46: "IT_ancestor", 47: "GT_STAR", 49: "GT_LBRACKET", 51: "GT_RBRACKET", 56: "IT_ASSERT", 58: "IT_index", 59: "IT_count", 60: "IT_foo1", 61: "IT_foo2", 63: "INTEGER", 66: "GT_EQUAL", 67: "GT_LT", 68: "GT_GT", 72: "IT_Schema", 73: "IT_SemAct", 74: "IT_Annotation", 75: "IT_ShapeAnd", 76: "IT_ShapeOr", 77: "IT_ShapeNot", 78: "IT_NodeConstraint", 79: "IT_Shape", 80: "IT_ShapeExternal", 81: "IT_EachOf", 82: "IT_OneOf", 83: "IT_TripleConstraint", 84: "IT_IriStem", 85: "IT_IriStemRange", 86: "IT_LiteralStem", 87: "IT_LiteralStemRange", 88: "IT_Language", 89: "IT_LanguageStem", 90: "IT_LanguageStemRange", 91: "IT_Wildcard", 92: "IT_type", 93: "IT_id", 94: "IT_semActs", 95: "IT_annotations", 96: "IT_predicate", 103: "GT_atContext", 104: "IT_startActs", 105: "IT_start", 106: "IT_imports", 107: "IT_shapes", 108: "IT_shapeExprs", 109: "IT_shapeExpr", 112: "IT_nodeKind", 113: "IT_datatype", 115: "IT_values", 118: "IT_length", 119: "IT_minlength", 120: "IT_maxlength", 121: "IT_pattern", 122: "IT_flags", 123: "IT_mininclusive", 124: "IT_minexclusive", 125: "IT_maxinclusive", 126: "IT_maxexclusive", 127: "IT_totaldigits", 128: "IT_fractiondigits", 129: "IT_value", 130: "IT_language", 131: "IT_stem", 132: "IT_exclusions", 133: "IT_languageTag", 134: "IT_closed", 135: "IT_extra", 136: "IT_extends", 137: "IT_expression", 138: "IT_expressions", 139: "IT_min", 140: "IT_max", 142: "IT_inverse", 143: "IT_valueExpr", 144: "IT_name", 145: "IT_code", 146: "IT_object", 147: "IRIREF", 149: "PNAME_LN", 150: "PNAME_NS" };
    productions_ = [0, [3, 2], [4, 2], [8, 2], [7, 0], [7, 2], [6, 2], [12, 2], [11, 0], [11, 2], [10, 2], [16, 2], [15, 0], [15, 2], [14, 2], [19, 0], [19, 2], [18, 2], [18, 1], [24, 1], [24, 1], [21, 0], [21, 1], [20, 2], [20, 1], [23, 2], [27, 1], [27, 1], [27, 1], [22, 3], [22, 4], [22, 3], [22, 5], [32, 0], [32, 1], [34, 0], [34, 2], [36, 0], [36, 1], [37, 1], [37, 1], [37, 1], [37, 1], [37, 1], [35, 1], [35, 1], [41, 3], [50, 3], [50, 3], [50, 1], [52, 0], [52, 1], [53, 0], [53, 1], [54, 3], [54, 3], [54, 4], [54, 4], [62, 2], [62, 1], [62, 1], [57, 2], [64, 1], [64, 1], [64, 1], [65, 1], [65, 1], [55, 1], [33, 1], [33, 1], [33, 1], [33, 1], [33, 1], [33, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [70, 1], [70, 1], [70, 1], [71, 1], [71, 1], [71, 1], [71, 1], [71, 1], [71, 1], [71, 1], [71, 1], [48, 1], [48, 1], [48, 1], [48, 1], [48, 1], [48, 1], [48, 1], [48, 1], [48, 1], [48, 1], [48, 1], [97, 1], [97, 1], [97, 1], [97, 1], [97, 1], [98, 1], [98, 1], [98, 1], [98, 1], [110, 1], [110, 1], [110, 1], [110, 1], [114, 1], [114, 1], [116, 1], [116, 1], [116, 1], [116, 1], [116, 1], [117, 1], [117, 1], [117, 1], [117, 1], [117, 1], [117, 1], [100, 1], [100, 1], [100, 1], [100, 1], [100, 1], [111, 1], [111, 1], [111, 1], [111, 1], [99, 1], [99, 1], [99, 1], [99, 1], [141, 1], [141, 1], [101, 1], [101, 1], [102, 1], [28, 1], [28, 1], [148, 1], [148, 1]];
    table = [(0, parser_1.o)($V0, $V1, { 3: 1, 4: 2, 6: 3, 10: 4, 14: 5, 18: 6, 21: 7, 23: 8, 24: 9, 27: 10, 25: $V2, 26: $V3, 29: $V4, 30: $V5, 31: $V6 }), { 1: [3] }, { 5: [1, 16] }, (0, parser_1.o)($V7, [2, 4], { 7: 17 }), (0, parser_1.o)($V8, [2, 8], { 11: 18 }), (0, parser_1.o)($V9, [2, 12], { 15: 19 }), (0, parser_1.o)($Va, [2, 15], { 19: 20 }), (0, parser_1.o)($Vb, $Vc, { 22: 21, 32: 22, 37: 23, 38: $Vd, 40: $Ve, 42: $Vf, 43: $Vg, 44: $Vh, 45: $Vi, 46: $Vj }), (0, parser_1.o)($Va, [2, 18]), (0, parser_1.o)($V0, [2, 22]), { 28: 31, 147: $Vk, 148: 33, 149: $Vl, 150: $Vm }, (0, parser_1.o)($V0, [2, 19]), (0, parser_1.o)($V0, [2, 20]), (0, parser_1.o)($Vn, [2, 26]), (0, parser_1.o)($Vn, [2, 27]), (0, parser_1.o)($Vn, [2, 28]), { 1: [2, 1] }, (0, parser_1.o)([5, 39, 51, 66, 67, 68], [2, 2], { 8: 36, 9: [1, 37] }), (0, parser_1.o)($V7, [2, 6], { 12: 38, 13: [1, 39] }), (0, parser_1.o)($V8, [2, 10], { 16: 40, 17: [1, 41] }), (0, parser_1.o)($V9, [2, 14], { 27: 10, 20: 42, 24: 43, 23: 44, 25: $V2, 26: $V3, 29: $V4, 30: $V5, 31: $V6 }), (0, parser_1.o)($Va, [2, 17]), { 33: 45, 35: 46, 47: [1, 53], 48: 54, 69: 47, 70: 48, 71: 49, 72: $Vo, 73: $Vp, 74: $Vq, 75: $Vr, 76: $Vs, 77: $Vt, 78: $Vu, 79: $Vv, 80: $Vw, 81: $Vx, 82: $Vy, 83: $Vz, 84: $VA, 85: $VB, 86: $VC, 87: $VD, 88: $VE, 89: $VF, 90: $VG, 91: $VH, 92: [1, 72], 93: [1, 73], 94: [1, 74], 95: [1, 75], 96: [1, 76], 97: 77, 98: 78, 99: 79, 100: 80, 101: 81, 102: 82, 103: [1, 83], 104: [1, 84], 105: [1, 85], 106: [1, 86], 107: [1, 87], 108: [1, 88], 109: [1, 89], 110: 90, 111: 91, 112: [1, 104], 113: [1, 105], 114: 106, 115: [1, 107], 116: 114, 117: 115, 118: [1, 116], 119: [1, 117], 120: [1, 118], 121: [1, 119], 122: [1, 120], 123: [1, 121], 124: [1, 122], 125: [1, 123], 126: [1, 124], 127: [1, 125], 128: [1, 126], 129: [1, 96], 130: [1, 97], 131: [1, 98], 132: [1, 99], 133: [1, 100], 134: [1, 108], 135: [1, 109], 136: [1, 110], 137: [1, 111], 138: [1, 92], 139: [1, 93], 140: [1, 94], 141: 95, 142: [1, 112], 143: [1, 113], 144: [1, 101], 145: [1, 102], 146: [1, 103] }, (0, parser_1.o)($VI, $VJ, { 69: 47, 70: 48, 71: 49, 36: 127, 33: 128, 72: $Vo, 73: $Vp, 74: $Vq, 75: $Vr, 76: $Vs, 77: $Vt, 78: $Vu, 79: $Vv, 80: $Vw, 81: $Vx, 82: $Vy, 83: $Vz, 84: $VA, 85: $VB, 86: $VC, 87: $VD, 88: $VE, 89: $VF, 90: $VG, 91: $VH }), (0, parser_1.o)($V0, $V1, { 6: 3, 10: 4, 14: 5, 18: 6, 21: 7, 23: 8, 24: 9, 27: 10, 4: 129, 25: $V2, 26: $V3, 29: $V4, 30: $V5, 31: $V6 }), (0, parser_1.o)($Vb, [2, 34]), (0, parser_1.o)($VK, [2, 39]), (0, parser_1.o)($VK, [2, 40]), (0, parser_1.o)($VK, [2, 41]), (0, parser_1.o)($VK, [2, 42]), (0, parser_1.o)($VK, [2, 43]), (0, parser_1.o)($Va, [2, 25]), (0, parser_1.o)($Va, [2, 146]), (0, parser_1.o)($Va, [2, 147]), (0, parser_1.o)($Va, [2, 148]), (0, parser_1.o)($Va, [2, 149]), (0, parser_1.o)($V7, [2, 5]), (0, parser_1.o)($V0, $V1, { 10: 4, 14: 5, 18: 6, 21: 7, 23: 8, 24: 9, 27: 10, 6: 130, 25: $V2, 26: $V3, 29: $V4, 30: $V5, 31: $V6 }), (0, parser_1.o)($V8, [2, 9]), (0, parser_1.o)($V0, $V1, { 14: 5, 18: 6, 21: 7, 23: 8, 24: 9, 27: 10, 10: 131, 25: $V2, 26: $V3, 29: $V4, 30: $V5, 31: $V6 }), (0, parser_1.o)($V9, [2, 13]), (0, parser_1.o)($V0, $V1, { 18: 6, 21: 7, 23: 8, 24: 9, 27: 10, 14: 132, 25: $V2, 26: $V3, 29: $V4, 30: $V5, 31: $V6 }), (0, parser_1.o)($Va, [2, 16]), (0, parser_1.o)($Vb, $Vc, { 32: 22, 37: 23, 22: 133, 38: $Vd, 40: $Ve, 42: $Vf, 43: $Vg, 44: $Vh, 45: $Vi, 46: $Vj }), (0, parser_1.o)($Va, [2, 24]), (0, parser_1.o)($VI, $VL, { 34: 134 }), (0, parser_1.o)($VI, $VJ, { 69: 47, 70: 48, 71: 49, 33: 128, 36: 135, 72: $Vo, 73: $Vp, 74: $Vq, 75: $Vr, 76: $Vs, 77: $Vt, 78: $Vu, 79: $Vv, 80: $Vw, 81: $Vx, 82: $Vy, 83: $Vz, 84: $VA, 85: $VB, 86: $VC, 87: $VD, 88: $VE, 89: $VF, 90: $VG, 91: $VH }), (0, parser_1.o)($VI, [2, 68]), (0, parser_1.o)($VI, [2, 69]), (0, parser_1.o)($VI, [2, 70]), (0, parser_1.o)($VI, [2, 71]), (0, parser_1.o)($VI, [2, 72]), (0, parser_1.o)($VI, [2, 73]), (0, parser_1.o)($VK, [2, 44]), (0, parser_1.o)($VK, [2, 45]), (0, parser_1.o)($VI, [2, 74]), (0, parser_1.o)($VI, [2, 75]), (0, parser_1.o)($VI, [2, 76]), (0, parser_1.o)($VI, [2, 77]), (0, parser_1.o)($VI, [2, 78]), (0, parser_1.o)($VI, [2, 79]), (0, parser_1.o)($VI, [2, 80]), (0, parser_1.o)($VI, [2, 81]), (0, parser_1.o)($VI, [2, 82]), (0, parser_1.o)($VI, [2, 83]), (0, parser_1.o)($VI, [2, 84]), (0, parser_1.o)($VI, [2, 85]), (0, parser_1.o)($VI, [2, 86]), (0, parser_1.o)($VI, [2, 87]), (0, parser_1.o)($VI, [2, 88]), (0, parser_1.o)($VI, [2, 89]), (0, parser_1.o)($VI, [2, 90]), (0, parser_1.o)($VK, [2, 91]), (0, parser_1.o)($VK, [2, 92]), (0, parser_1.o)($VK, [2, 93]), (0, parser_1.o)($VK, [2, 94]), (0, parser_1.o)($VK, [2, 95]), (0, parser_1.o)($VK, [2, 96]), (0, parser_1.o)($VK, [2, 97]), (0, parser_1.o)($VK, [2, 98]), (0, parser_1.o)($VK, [2, 99]), (0, parser_1.o)($VK, [2, 100]), (0, parser_1.o)($VK, [2, 101]), (0, parser_1.o)($VK, [2, 102]), (0, parser_1.o)($VK, [2, 103]), (0, parser_1.o)($VK, [2, 104]), (0, parser_1.o)($VK, [2, 105]), (0, parser_1.o)($VK, [2, 106]), (0, parser_1.o)($VK, [2, 107]), (0, parser_1.o)($VK, [2, 108]), (0, parser_1.o)($VK, [2, 109]), (0, parser_1.o)($VK, [2, 110]), (0, parser_1.o)($VK, [2, 137]), (0, parser_1.o)($VK, [2, 138]), (0, parser_1.o)($VK, [2, 139]), (0, parser_1.o)($VK, [2, 140]), (0, parser_1.o)($VK, [2, 128]), (0, parser_1.o)($VK, [2, 129]), (0, parser_1.o)($VK, [2, 130]), (0, parser_1.o)($VK, [2, 131]), (0, parser_1.o)($VK, [2, 132]), (0, parser_1.o)($VK, [2, 143]), (0, parser_1.o)($VK, [2, 144]), (0, parser_1.o)($VK, [2, 145]), (0, parser_1.o)($VK, [2, 111]), (0, parser_1.o)($VK, [2, 112]), (0, parser_1.o)($VK, [2, 113]), (0, parser_1.o)($VK, [2, 114]), (0, parser_1.o)($VK, [2, 133]), (0, parser_1.o)($VK, [2, 134]), (0, parser_1.o)($VK, [2, 135]), (0, parser_1.o)($VK, [2, 136]), (0, parser_1.o)($VK, [2, 141]), (0, parser_1.o)($VK, [2, 142]), (0, parser_1.o)($VK, [2, 115]), (0, parser_1.o)($VK, [2, 116]), (0, parser_1.o)($VK, [2, 117]), (0, parser_1.o)($VK, [2, 118]), (0, parser_1.o)($VK, [2, 119]), (0, parser_1.o)($VK, [2, 120]), (0, parser_1.o)($VK, [2, 121]), (0, parser_1.o)($VK, [2, 122]), (0, parser_1.o)($VK, [2, 123]), (0, parser_1.o)($VK, [2, 124]), (0, parser_1.o)($VK, [2, 125]), (0, parser_1.o)($VK, [2, 126]), (0, parser_1.o)($VK, [2, 127]), (0, parser_1.o)($VI, $VL, { 34: 136 }), (0, parser_1.o)($VI, [2, 38]), { 39: [1, 137] }, (0, parser_1.o)($V7, [2, 3]), (0, parser_1.o)($V8, [2, 7]), (0, parser_1.o)($V9, [2, 11]), (0, parser_1.o)($Va, [2, 23]), (0, parser_1.o)($Va, [2, 29], { 41: 138, 49: $VM }), (0, parser_1.o)($VI, $VL, { 34: 140 }), (0, parser_1.o)($Va, [2, 31], { 41: 138, 49: $VM }), (0, parser_1.o)($VI, $VJ, { 69: 47, 70: 48, 71: 49, 33: 128, 36: 141, 72: $Vo, 73: $Vp, 74: $Vq, 75: $Vr, 76: $Vs, 77: $Vt, 78: $Vu, 79: $Vv, 80: $Vw, 81: $Vx, 82: $Vy, 83: $Vz, 84: $VA, 85: $VB, 86: $VC, 87: $VD, 88: $VE, 89: $VF, 90: $VG, 91: $VH }), (0, parser_1.o)($VI, [2, 36]), (0, parser_1.o)($VN, [2, 50], { 50: 142, 52: 143, 55: 144, 56: [1, 145], 63: [1, 146] }), (0, parser_1.o)($Va, [2, 30], { 41: 138, 49: $VM }), (0, parser_1.o)($VI, $VL, { 34: 147 }), { 51: [1, 148] }, (0, parser_1.o)($V0, $V1, { 6: 3, 10: 4, 14: 5, 18: 6, 21: 7, 23: 8, 24: 9, 27: 10, 4: 149, 54: 150, 25: $V2, 26: $V3, 29: $V4, 30: $V5, 31: $V6, 58: [1, 151], 59: [1, 152], 60: [1, 153], 61: [1, 154] }), { 51: [2, 49] }, (0, parser_1.o)($VN, [2, 51]), { 51: [2, 67] }, (0, parser_1.o)($Va, [2, 32], { 41: 138, 49: $VM }), (0, parser_1.o)($VI, [2, 46]), { 51: $VO, 53: 155, 57: 156, 64: 157, 66: $VP, 67: $VQ, 68: $VR }, { 51: $VO, 53: 161, 57: 156, 64: 157, 66: $VP, 67: $VQ, 68: $VR }, { 38: [1, 162] }, { 38: [1, 163] }, { 38: [1, 164] }, { 38: [1, 165] }, { 51: [2, 47] }, { 51: [2, 53] }, { 28: 168, 63: [1, 167], 65: 166, 147: $Vk, 148: 33, 149: $Vl, 150: $Vm }, (0, parser_1.o)($VS, [2, 62]), (0, parser_1.o)($VS, [2, 63]), (0, parser_1.o)($VS, [2, 64]), { 51: [2, 48] }, { 39: [1, 169] }, { 39: [1, 170] }, { 28: 171, 147: $Vk, 148: 33, 149: $Vl, 150: $Vm }, { 28: 174, 62: 172, 63: [1, 173], 147: $Vk, 148: 33, 149: $Vl, 150: $Vm }, { 51: [2, 61] }, { 51: [2, 65] }, { 51: [2, 66] }, (0, parser_1.o)($VT, [2, 54]), (0, parser_1.o)($VT, [2, 55]), { 39: [1, 175] }, { 39: [1, 176] }, { 28: 177, 39: [2, 59], 147: $Vk, 148: 33, 149: $Vl, 150: $Vm }, { 39: [2, 60] }, (0, parser_1.o)($VT, [2, 56]), (0, parser_1.o)($VT, [2, 57]), { 39: [2, 58] }];
    defaultActions = { 16: [2, 1], 144: [2, 49], 146: [2, 67], 155: [2, 47], 156: [2, 53], 161: [2, 48], 166: [2, 61], 167: [2, 65], 168: [2, 66], 174: [2, 60], 177: [2, 58] };
    performAction(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
        /* this == yyval */
        var $0 = $$.length - 1;
        switch (yystate) {
            case 1:
                return $$[$0 - 1];
            case 2:
                this.$ = $$[$0].length ? new ShapePathAst_1.Sequence([$$[$0 - 1]].concat($$[$0])) : $$[$0 - 1];
                break;
            case 3:
            case 7:
            case 11:
                this.$ = $$[$0];
                break;
            case 4:
            case 8:
            case 12:
            case 15:
            case 35:
                this.$ = [];
                break;
            case 5:
            case 9:
            case 13:
            case 36:
                this.$ = $$[$0 - 1].concat([$$[$0]]);
                break;
            case 6:
                this.$ = $$[$0].length ? new ShapePathAst_1.Union([$$[$0 - 1]].concat($$[$0])) : $$[$0 - 1];
                break;
            case 10:
                this.$ = $$[$0].length ? new ShapePathAst_1.Intersection([$$[$0 - 1]].concat($$[$0])) : $$[$0 - 1];
                break;
            case 14:
                this.$ = new ShapePathAst_1.Path($$[$0 - 1].concat($$[$0]));
                break;
            case 16:
                this.$ = $$[$0 - 1].concat($$[$0]);
                break;
            case 17:
            case 23:
            case 60:
                this.$ = [$$[$0]];
                break;
            case 21:
            case 33:
            case 34:
            case 37:
            case 52:
                this.$ = null;
                break;
            case 25:
                this.$ = $$[$0 - 1] === '@' ? shapeLabelShortCut($$[$0]) : $$[$0 - 1] === '$' ? tripleExprLabelShortCut($$[$0]) : predicateShortCut($$[$0]);
                break;
            case 29:
                this.$ = new ShapePathAst_1.ChildStep(ShapePathAst_1.t_attribute.Any, filterTermType($$[$0 - 1], $$[$0]));
                break;
            case 30:
                this.$ = new ShapePathAst_1.ChildStep($$[$0 - 2], filterTermType($$[$0 - 1], $$[$0]));
                break;
            case 31:
                this.$ = new ShapePathAst_1.AxisStep($$[$0 - 2], filterTermType($$[$0 - 1], $$[$0]));
                break;
            case 32:
                this.$ = new ShapePathAst_1.PathExprStep($$[$0 - 3], filterTermType($$[$0 - 1], $$[$0]));
                break;
            case 39:
                this.$ = ShapePathAst_1.Axis.thisShapeExpr;
                break;
            case 40:
                this.$ = ShapePathAst_1.Axis.thisTripleExpr;
                break;
            case 41:
                this.$ = ShapePathAst_1.Axis.self;
                break;
            case 42:
                this.$ = ShapePathAst_1.Axis.parent;
                break;
            case 43:
                this.$ = ShapePathAst_1.Axis.ancestor;
                break;
            case 44:
                this.$ = ShapePathAst_1.t_attribute.Any;
                break;
            case 46:
                this.$ = $$[$0 - 1];
                break;
            case 47:
            case 48:
                this.$ = makeFunction($$[$0 - 2], $$[$0 - 1], $$[$0] ? $$[$0] : undefined);
                break;
            case 49:
                this.$ = new ShapePathAst_1.Filter(ShapePathAst_1.FuncName.index, [$$[$0]]);
                break;
            case 50:
                this.$ = false;
                break;
            case 51:
                this.$ = true;
                break;
            case 54:
                this.$ = new ShapePathAst_1.Filter(ShapePathAst_1.FuncName.index, []);
                break;
            case 55:
            case 56:
            case 57:
                this.$ = new ShapePathAst_1.Filter(ShapePathAst_1.FuncName.count, []);
                break;
            case 58:
                this.$ = [parseInt($$[$0 - 1]), $$[$0]];
                break;
            case 59:
                this.$ = [parseInt($$[$0])];
                break;
            case 61:
                this.$ = { op: $$[$0 - 1], r: $$[$0] };
                break;
            case 62:
                this.$ = ShapePathAst_1.FuncName.equal;
                break;
            case 63:
                this.$ = ShapePathAst_1.FuncName.lessThan;
                break;
            case 64:
                this.$ = ShapePathAst_1.FuncName.greaterThan;
                break;
            case 65:
            case 67:
                this.$ = parseInt($$[$0]);
                break;
            case 71:
                this.$ = ShapePathAst_1.t_termType.Schema;
                break;
            case 72:
                this.$ = ShapePathAst_1.t_termType.SemAct;
                break;
            case 73:
                this.$ = ShapePathAst_1.t_termType.Annotation;
                break;
            case 74:
                this.$ = ShapePathAst_1.t_shapeExprType.ShapeAnd;
                break;
            case 75:
                this.$ = ShapePathAst_1.t_shapeExprType.ShapeOr;
                break;
            case 76:
                this.$ = ShapePathAst_1.t_shapeExprType.ShapeNot;
                break;
            case 77:
                this.$ = ShapePathAst_1.t_shapeExprType.NodeConstraint;
                break;
            case 78:
                this.$ = ShapePathAst_1.t_shapeExprType.Shape;
                break;
            case 79:
                this.$ = ShapePathAst_1.t_shapeExprType.ShapeExternal;
                break;
            case 80:
                this.$ = ShapePathAst_1.t_tripleExprType.EachOf;
                break;
            case 81:
                this.$ = ShapePathAst_1.t_tripleExprType.OneOf;
                break;
            case 82:
                this.$ = ShapePathAst_1.t_tripleExprType.TripleConstraint;
                break;
            case 83:
                this.$ = ShapePathAst_1.t_valueType.IriStem;
                break;
            case 84:
                this.$ = ShapePathAst_1.t_valueType.IriStemRange;
                break;
            case 85:
                this.$ = ShapePathAst_1.t_valueType.LiteralStem;
                break;
            case 86:
                this.$ = ShapePathAst_1.t_valueType.LiteralStemRange;
                break;
            case 87:
                this.$ = ShapePathAst_1.t_valueType.Language;
                break;
            case 88:
                this.$ = ShapePathAst_1.t_valueType.LanguageStem;
                break;
            case 89:
                this.$ = ShapePathAst_1.t_valueType.LanguageStemRange;
                break;
            case 90:
                this.$ = ShapePathAst_1.t_valueType.Wildcard;
                break;
            case 91:
                this.$ = ShapePathAst_1.t_attribute.type;
                break;
            case 92:
                this.$ = ShapePathAst_1.t_attribute.id;
                break;
            case 93:
                this.$ = ShapePathAst_1.t_attribute.semActs;
                break;
            case 94:
                this.$ = ShapePathAst_1.t_attribute.annotations;
                break;
            case 95:
                this.$ = ShapePathAst_1.t_attribute.predicate;
                break;
            case 102:
                this.$ = ShapePathAst_1.t_schemaAttr.atContext;
                break;
            case 103:
                this.$ = ShapePathAst_1.t_schemaAttr.startActs;
                break;
            case 104:
                this.$ = ShapePathAst_1.t_schemaAttr.start;
                break;
            case 105:
                this.$ = ShapePathAst_1.t_schemaAttr.imports;
                break;
            case 106:
                this.$ = ShapePathAst_1.t_schemaAttr.shapes;
                break;
            case 107:
                this.$ = ShapePathAst_1.t_shapeExprAttr.shapeExprs;
                break;
            case 108:
                this.$ = ShapePathAst_1.t_shapeExprAttr.shapeExpr;
                break;
            case 111:
                this.$ = ShapePathAst_1.t_nodeConstraintAttr.nodeKind;
                break;
            case 112:
                this.$ = ShapePathAst_1.t_nodeConstraintAttr.datatype;
                break;
            case 114:
                this.$ = ShapePathAst_1.t_nodeConstraintAttr.values;
                break;
            case 117:
                this.$ = ShapePathAst_1.t_stringFacetAttr.length;
                break;
            case 118:
                this.$ = ShapePathAst_1.t_stringFacetAttr.minlength;
                break;
            case 119:
                this.$ = ShapePathAst_1.t_stringFacetAttr.maxlength;
                break;
            case 120:
                this.$ = ShapePathAst_1.t_stringFacetAttr.pattern;
                break;
            case 121:
                this.$ = ShapePathAst_1.t_stringFacetAttr.flags;
                break;
            case 122:
                this.$ = ShapePathAst_1.t_numericFacetAttr.mininclusive;
                break;
            case 123:
                this.$ = ShapePathAst_1.t_numericFacetAttr.minexclusive;
                break;
            case 124:
                this.$ = ShapePathAst_1.t_numericFacetAttr.maxinclusive;
                break;
            case 125:
                this.$ = ShapePathAst_1.t_numericFacetAttr.maxexclusive;
                break;
            case 126:
                this.$ = ShapePathAst_1.t_numericFacetAttr.totaldigits;
                break;
            case 127:
                this.$ = ShapePathAst_1.t_numericFacetAttr.fractiondigits;
                break;
            case 128:
                this.$ = ShapePathAst_1.t_valueSetValueAttr.value;
                break;
            case 129:
                this.$ = ShapePathAst_1.t_valueSetValueAttr.language;
                break;
            case 130:
                this.$ = ShapePathAst_1.t_valueSetValueAttr.stem;
                break;
            case 131:
                this.$ = ShapePathAst_1.t_valueSetValueAttr.exclusions;
                break;
            case 132:
                this.$ = ShapePathAst_1.t_valueSetValueAttr.languageTag;
                break;
            case 133:
                this.$ = ShapePathAst_1.t_shapeAttr.closed;
                break;
            case 134:
                this.$ = ShapePathAst_1.t_shapeAttr.extra;
                break;
            case 135:
                this.$ = ShapePathAst_1.t_shapeAttr.extends;
                break;
            case 136:
                this.$ = ShapePathAst_1.t_shapeAttr.expression;
                break;
            case 137:
                this.$ = ShapePathAst_1.t_tripleExprAttr.expressions;
                break;
            case 138:
                this.$ = ShapePathAst_1.t_tripleExprAttr.min;
                break;
            case 139:
                this.$ = ShapePathAst_1.t_tripleExprAttr.max;
                break;
            case 141:
                this.$ = ShapePathAst_1.t_tripleConstraintAttr.inverse;
                break;
            case 142:
                this.$ = ShapePathAst_1.t_tripleConstraintAttr.valueExpr;
                break;
            case 143:
                this.$ = ShapePathAst_1.t_semActAttr.name;
                break;
            case 144:
                this.$ = ShapePathAst_1.t_semActAttr.code;
                break;
            case 145:
                this.$ = ShapePathAst_1.t_annotationAttr.object;
                break;
            case 146:
                this.$ = newIri(new URL($$[$0].substr(1, $$[$0].length - 2), yy.base).href);
                break;
            case 148:
            case 149:
                this.$ = pnameToUrl($$[$0], yy);
                break;
        }
    }
}
exports.ShapePathParser = ShapePathParser;
/* generated by ts-jison-lex 0.3.0 */
const lexer_1 = __webpack_require__(677);
class ShapePathLexer extends lexer_1.JisonLexer {
    options = { "moduleName": "ShapePath" };
    constructor(yy = {}) {
        super(yy);
    }
    rules = [/^(?:\s+|(#[^\u000a\u000d]*|<!--([^-]|-[^-]|--[^>])*-->))/, /^(?:([Uu][Nn][Ii][Oo][Nn]))/, /^(?:([Ii][Nn][Tt][Ee][Rr][Ss][Ee][Cc][Tt][Ii][Oo][Nn]))/, /^(?:([Aa][Ss][Ss][Ee][Rr][Tt]))/, /^(?:child::)/, /^(?:thisShapeExpr::)/, /^(?:thisTripleExpr::)/, /^(?:self::)/, /^(?:parent::)/, /^(?:ancestor::)/, /^(?:index\b)/, /^(?:count\b)/, /^(?:foo1\b)/, /^(?:foo2\b)/, /^(?:Schema\b)/, /^(?:SemAct\b)/, /^(?:Annotation\b)/, /^(?:ShapeAnd\b)/, /^(?:ShapeOr\b)/, /^(?:ShapeNot\b)/, /^(?:NodeConstraint\b)/, /^(?:Shape\b)/, /^(?:ShapeExternal\b)/, /^(?:EachOf\b)/, /^(?:OneOf\b)/, /^(?:TripleConstraint\b)/, /^(?:IriStem\b)/, /^(?:IriStemRange\b)/, /^(?:LiteralStem\b)/, /^(?:LiteralStemRange\b)/, /^(?:Language\b)/, /^(?:LanguageStem\b)/, /^(?:LanguageStemRange\b)/, /^(?:Wildcard\b)/, /^(?:type\b)/, /^(?:id\b)/, /^(?:semActs\b)/, /^(?:annotations\b)/, /^(?:predicate\b)/, /^(?:@context\b)/, /^(?:startActs\b)/, /^(?:start\b)/, /^(?:imports\b)/, /^(?:shapes\b)/, /^(?:shapeExprs\b)/, /^(?:shapeExpr\b)/, /^(?:nodeKind\b)/, /^(?:datatype\b)/, /^(?:values\b)/, /^(?:length\b)/, /^(?:minlength\b)/, /^(?:maxlength\b)/, /^(?:pattern\b)/, /^(?:flags\b)/, /^(?:mininclusive\b)/, /^(?:minexclusive\b)/, /^(?:maxinclusive\b)/, /^(?:maxexclusive\b)/, /^(?:totaldigits\b)/, /^(?:fractiondigits\b)/, /^(?:value\b)/, /^(?:language\b)/, /^(?:stem\b)/, /^(?:exclusions\b)/, /^(?:languageTag\b)/, /^(?:closed\b)/, /^(?:extra\b)/, /^(?:extends\b)/, /^(?:expression\b)/, /^(?:expressions\b)/, /^(?:min\b)/, /^(?:max\b)/, /^(?:inverse\b)/, /^(?:valueExpr\b)/, /^(?:name\b)/, /^(?:code\b)/, /^(?:object\b)/, /^(?:(<([^\u0000-\u0020<>\"{}|^`\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*>))/, /^(?:(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*)))/, /^(?:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:))/, /^(?:(([+-])?([0-9])+))/, /^(?:,)/, /^(?:@)/, /^(?:\$)/, /^(?:~)/, /^(?:\*)/, /^(?:\()/, /^(?:\))/, /^(?:\[)/, /^(?:\])/, /^(?:\/\/)/, /^(?:\/)/, /^(?:=)/, /^(?:<)/, /^(?:>)/, /^(?:[a-zA-Z0-9_-]+)/, /^(?:.)/, /^(?:$)/];
    conditions = { "INITIAL": { "rules": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97], "inclusive": true } };
    performAction(yy, yy_, $avoiding_name_collisions, YY_START) {
        var YYSTATE = YY_START;
        switch ($avoiding_name_collisions) {
            case 0: /*skip*/
                break;
            case 1: return 13;
            case 2: return 17;
            case 3: return 56;
            case 4: return 40;
            case 5: return 42;
            case 6: return 43;
            case 7: return 44;
            case 8: return 45;
            case 9: return 46;
            case 10: return 58;
            case 11: return 59;
            case 12: return 60;
            case 13: return 61;
            case 14: return 72;
            case 15: return 73;
            case 16: return 74;
            case 17: return 75;
            case 18: return 76;
            case 19: return 77;
            case 20: return 78;
            case 21: return 79;
            case 22: return 80;
            case 23: return 81;
            case 24: return 82;
            case 25: return 83;
            case 26: return 84;
            case 27: return 85;
            case 28: return 86;
            case 29: return 87;
            case 30: return 88;
            case 31: return 89;
            case 32: return 90;
            case 33: return 91;
            case 34: return 92;
            case 35: return 93;
            case 36: return 94;
            case 37: return 95;
            case 38: return 96;
            case 39: return 103;
            case 40: return 104;
            case 41: return 105;
            case 42: return 106;
            case 43: return 107;
            case 44: return 108;
            case 45: return 109;
            case 46: return 112;
            case 47: return 113;
            case 48: return 115;
            case 49: return 118;
            case 50: return 119;
            case 51: return 120;
            case 52: return 121;
            case 53: return 122;
            case 54: return 123;
            case 55: return 124;
            case 56: return 125;
            case 57: return 126;
            case 58: return 127;
            case 59: return 128;
            case 60: return 129;
            case 61: return 130;
            case 62: return 131;
            case 63: return 132;
            case 64: return 133;
            case 65: return 134;
            case 66: return 135;
            case 67: return 136;
            case 68: return 137;
            case 69: return 138;
            case 70: return 139;
            case 71: return 140;
            case 72: return 142;
            case 73: return 143;
            case 74: return 144;
            case 75: return 145;
            case 76: return 146;
            case 77: return 147;
            case 78: return 149;
            case 79: return 150;
            case 80: return 63;
            case 81: return 9;
            case 82: return 29;
            case 83: return 31;
            case 84: return 30;
            case 85: return 47;
            case 86: return 38;
            case 87: return 39;
            case 88: return 49;
            case 89: return 51;
            case 90: return 26;
            case 91: return 25;
            case 92: return 66;
            case 93: return 67;
            case 94: return 68;
            case 95: return 'unexpected word "' + yy_.yytext + '"';
            case 96: return 'invalid character ' + yy_.yytext;
            case 97: return 5;
        }
    }
}
exports.ShapePathLexer = ShapePathLexer;
//# sourceMappingURL=ShapePathParser.js.map

/***/ },

/***/ 725
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
var __webpack_dirname__ = "/";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.examples = exports.scripts = exports.Parser = exports.Ast = void 0;
let to = (f) => '../' + f;
if (typeof window === 'undefined') {
    to = (f) => (__webpack_require__(476).join)(__webpack_dirname__, f);
}
const Ast = __importStar(__webpack_require__(764));
exports.Ast = Ast;
const Parser = __importStar(__webpack_require__(25));
exports.Parser = Parser;
const spgrep = to('spgrep.js');
const examples = to('../examples');
exports.examples = examples;
const scripts = {
    spgrep
};
exports.scripts = scripts;
//# sourceMappingURL=shape-path-core.js.map

/***/ },

/***/ 677
(__unused_webpack_module, exports) {

"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
exports.JisonLexer = void 0;
var JisonLexer = /** @class */ (function () {
    function JisonLexer(yy) {
        if (yy === void 0) { yy = {}; }
        this.yy = yy;
        this.EOF = 1;
        this.options = {};
        this.yyleng = 0;
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
    }
    JisonLexer.prototype.parseError = function (str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        }
        else {
            throw new Error(str);
        }
    };
    // resets the lexer, sets new input
    JisonLexer.prototype.setInput = function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0, 0];
        }
        this.offset = 0;
        return this;
    };
    // consumes and returns one char from the input
    JisonLexer.prototype.input = function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        }
        else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }
        this._input = this._input.slice(1);
        return ch;
    };
    // unshifts one char (or a string) into the input
    JisonLexer.prototype.unput = function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);
        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);
        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;
        var yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                    + oldLines[oldLines.length - lines.length].length - lines[0].length :
                this.yylloc.first_column - len
        };
        this.yylloc = yylloc;
        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    };
    // When called from action, caches matched text and appends it on next action
    JisonLexer.prototype.more = function () {
        this._more = true;
        return this;
    };
    // When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
    JisonLexer.prototype.reject = function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        }
        else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
        return this;
    };
    // retain first n characters of the match
    JisonLexer.prototype.less = function (n) {
        this.unput(this.match.slice(n));
    };
    // displays already matched input, i.e. for error messages
    JisonLexer.prototype.pastInput = function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...' : '') + past.substr(-20).replace(/\n/g, "");
    };
    // displays upcoming input, i.e. for error messages
    JisonLexer.prototype.upcomingInput = function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20 - next.length);
        }
        return (next.substr(0, 20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    };
    // displays the character position where the lexing error occurred, i.e. for error messages
    JisonLexer.prototype.showPosition = function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    };
    // test the lexed token: return FALSE when not a match, otherwise return token
    JisonLexer.prototype.test_match = function (match, indexed_rule) {
        var token, lines, backup;
        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.yylloc.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = (this.yylloc.range.slice(0));
            }
        }
        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        }
        else if (this._backtrack) {
            // recover context
            for (var k in backup) { // what's the typescript-y way to copy fields across?
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    };
    // return next match in input
    JisonLexer.prototype.next = function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }
        var token, match = null, tempMatch, index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    }
                    else if (this._backtrack) {
                        match = null;
                        continue; // rule action called reject() implying a rule MISmatch.
                    }
                    else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                }
                else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        }
        else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    };
    // return next match that has a token
    JisonLexer.prototype.lex = function () {
        var r = this.next();
        if (r) {
            return r;
        }
        else {
            return this.lex();
        }
    };
    // activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
    JisonLexer.prototype.begin = function (condition) {
        this.conditionStack.push(condition);
    };
    // pop the previously active lexer condition state off the condition stack
    JisonLexer.prototype.popState = function () {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        }
        else {
            return this.conditionStack[0];
        }
    };
    // produce the lexer rule set which is active for the currently active lexer condition state
    JisonLexer.prototype._currentRules = function () {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        }
        else {
            return this.conditions["INITIAL"].rules;
        }
    };
    // return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
    JisonLexer.prototype.topState = function (n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        }
        else {
            return "INITIAL";
        }
    };
    // alias for begin(condition)
    JisonLexer.prototype.pushState = function (condition) {
        this.begin(condition);
    };
    // return the number of states currently on the stack
    JisonLexer.prototype.stateStackSize = function () {
        return this.conditionStack.length;
    };
    return JisonLexer;
}());
exports.JisonLexer = JisonLexer;
//# sourceMappingURL=lexer.js.map

/***/ },

/***/ 386
(__unused_webpack_module, exports) {

"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
exports.o = exports.JisonParser = void 0;
var JisonParser = /** @class */ (function () {
    function JisonParser(yy, lexer) {
        if (yy === void 0) { yy = {}; }
        this.yy = yy;
        this.lexer = lexer;
    }
    JisonParser.prototype.trace = function (str) { };
    JisonParser.prototype.parseError = function (str, hash) {
        if (hash.recoverable) {
            this.trace(str);
        }
        else {
            var error = new Error(str);
            error.hash = hash;
            throw error;
        }
    };
    JisonParser.prototype.parse = function (input) {
        var self = this, stack = [0], tstack = [], // token stack
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
        var args = lstack.slice.call(arguments, 1);
        //this.reductionCount = this.shiftCount = 0;
        var lexer = Object.create(this.lexer);
        var typedYy = {};
        var sharedState = { yy: typedYy };
        // copy state
        for (var k in this.yy) {
            if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
                sharedState.yy[k] = this.yy[k];
            }
        }
        lexer.setInput(input, sharedState.yy);
        sharedState.yy.lexer = lexer;
        sharedState.yy.parser = this;
        if (typeof lexer.yylloc == 'undefined') {
            lexer.yylloc = {};
        }
        var yyloc = lexer.yylloc;
        lstack.push(yyloc);
        var ranges = lexer.options && lexer.options.ranges;
        if (typeof sharedState.yy.parseError === 'function') {
            this.parseError = sharedState.yy.parseError;
        }
        function popStack(n) {
            stack.length = stack.length - 2 * n;
            vstack.length = vstack.length - n;
            lstack.length = lstack.length - n;
        }
        var lex = function () {
            var token;
            // @ts-ignore
            token = (lexer.lex() || EOF);
            // if token isn't its numeric value, convert
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        };
        var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
        while (true) {
            // retreive state number from top of stack
            state = stack[stack.length - 1];
            // use default actions if available
            if (this.defaultActions[state]) {
                action = this.defaultActions[state];
            }
            else {
                if (symbol === null || typeof symbol == 'undefined') {
                    symbol = lex();
                }
                // read action for current state and first input
                action = table[state] && table[state][symbol];
            }
            _handle_error: 
            // handle parse error
            if (typeof action === 'undefined' || !action.length || !action[0]) {
                var error_rule_depth = null;
                var errStr = '';
                if (!recovering) {
                    // first see if there's any chance at hitting an error recovery rule:
                    error_rule_depth = locateNearestErrorRecoveryRule(state);
                    // Report error
                    expected = [];
                    for (var _p in table[state]) {
                        p = Number(p);
                        if (this.terminals_[p] && p > TERROR) {
                            expected.push("'" + this.terminals_[p] + "'");
                        }
                    }
                    if (lexer.showPosition) {
                        errStr = 'Parse error on line ' + (yylineno + 1) + ":\n" + lexer.showPosition() + "\nExpecting " + expected.join(', ') + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                    }
                    else {
                        errStr = 'Parse error on line ' + (yylineno + 1) + ": Unexpected " +
                            (symbol == EOF ? "end of input" :
                                ("'" + (this.terminals_[symbol] || symbol) + "'"));
                    }
                    this.parseError(errStr, {
                        text: lexer.match,
                        token: this.terminals_[symbol] || symbol,
                        line: lexer.yylineno,
                        loc: yyloc,
                        expected: expected,
                        recoverable: (error_rule_depth !== null)
                    });
                }
                else if (preErrorSymbol !== EOF) {
                    error_rule_depth = locateNearestErrorRecoveryRule(state);
                }
                // just recovered from another error
                if (recovering == 3) {
                    if (symbol === EOF || preErrorSymbol === EOF) {
                        throw new Error(errStr || 'Parsing halted while starting to recover from another error.');
                    }
                    // discard current lookahead and grab another
                    yyleng = lexer.yyleng;
                    yytext = lexer.yytext;
                    yylineno = lexer.yylineno;
                    yyloc = lexer.yylloc;
                    symbol = lex();
                }
                // try to recover from error
                if (error_rule_depth === null) {
                    throw new Error(errStr || 'Parsing halted. No suitable error recovery rule available.');
                }
                popStack(error_rule_depth || 0);
                preErrorSymbol = (symbol == TERROR ? null : symbol); // save the lookahead token
                symbol = TERROR; // insert generic error symbol as new lookahead
                state = stack[stack.length - 1];
                action = table[state] && table[state][TERROR];
                recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
            }
            // this shouldn't happen, unless resolve defaults are off
            if (action[0] instanceof Array && action.length > 1) {
                throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
            }
            switch (action[0]) {
                case 1: // shift
                    //this.shiftCount++;
                    stack.push(symbol);
                    vstack.push(lexer.yytext);
                    lstack.push(lexer.yylloc);
                    stack.push(action[1]); // push state
                    symbol = null;
                    if (!preErrorSymbol) { // normal execution/no error
                        yyleng = lexer.yyleng;
                        yytext = lexer.yytext;
                        yylineno = lexer.yylineno;
                        yyloc = lexer.yylloc;
                        if (recovering > 0) {
                            recovering--;
                        }
                    }
                    else {
                        // error just occurred, resume old lookahead f/ before error
                        symbol = preErrorSymbol;
                        preErrorSymbol = null;
                    }
                    break;
                case 2:
                    // reduce
                    //this.reductionCount++;
                    len = this.productions_[action[1]][1];
                    // perform semantic action
                    yyval.$ = vstack[vstack.length - len]; // default to $$ = $1
                    // default location, uses first token for firsts, last for lasts
                    yyval._$ = {
                        first_line: lstack[lstack.length - (len || 1)].first_line,
                        last_line: lstack[lstack.length - 1].last_line,
                        first_column: lstack[lstack.length - (len || 1)].first_column,
                        last_column: lstack[lstack.length - 1].last_column
                    };
                    if (ranges) {
                        yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
                    }
                    // @ts-ignore
                    r = this.performAction.apply(yyval, [yytext, yyleng, yylineno, sharedState.yy, action[1], vstack, lstack].concat(args));
                    if (typeof r !== 'undefined') {
                        return r;
                    }
                    // pop off stack
                    if (len) {
                        stack = stack.slice(0, -1 * len * 2);
                        vstack = vstack.slice(0, -1 * len);
                        lstack = lstack.slice(0, -1 * len);
                    }
                    stack.push(this.productions_[action[1]][0]); // push nonterminal (reduce)
                    vstack.push(yyval.$);
                    lstack.push(yyval._$);
                    // goto new state = table[STATE][NONTERMINAL]
                    newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
                    stack.push(newState);
                    break;
                case 3:
                    // accept
                    return true;
            }
        }
        return true;
        // Return the rule stack depth where the nearest error rule can be found.
        // Return FALSE when no error recovery rule was found.
        function locateNearestErrorRecoveryRule(state) {
            var stack_probe = stack.length - 1;
            var depth = 0;
            // try to recover from error
            for (;;) {
                // check for error recovery rule in this state
                if ((TERROR.toString()) in table[state]) {
                    return depth;
                }
                if (state === 0 || stack_probe < 2) {
                    return null; // No suitable error recovery rule available.
                }
                stack_probe -= 2; // popStack(1): [symbol, action]
                state = stack[stack_probe];
                ++depth;
            }
        }
    };
    return JisonParser;
}());
exports.JisonParser = JisonParser;
/* Function that extends an object with the given value for all given keys
 * e.g., o([1, 3, 4], [6, 7], { x: 1, y: 2 }) = { 1: [6, 7]; 3: [6, 7], 4: [6, 7], x: 1, y: 2 }
 * This is used to docompress parser tables at module load time.
 */
function o(k, v, o) {
    var l = k.length;
    for (o = o || {}; l--; o[k[l]] = v)
        ;
    return o;
}
exports.o = o;
//# sourceMappingURL=parser.js.map

/***/ },

/***/ 568
(module) {

"use strict";
module.exports = ShExWebApp;

/***/ },

/***/ 747
(module) {

"use strict";
module.exports = ShExWebApp.Modules["@shexjs/visitor"];

/***/ },

/***/ 656
(module) {

"use strict";

/**
 * The JavaScript evaluator for `@shexjs/extension-reduce`.
 *
 * `extension-reduce` folds one action per production over a validation
 * result and hands each action a scope of plain data -- which production
 * reduced, and what its arcs reduced to, by predicate.  It has no opinion
 * about what an action is written in.  This is the half that does: it puts
 * that scope in scope as JavaScript names and runs the code.
 *
 *     const Reduce = require('@shexjs/extension-reduce');
 *     const evaluate = require('@shexjs/extension-reduce-js');
 *     Reduce.reduce(result, {evaluate, prefixes: {'': 'http://a.example/calc#'}});
 *
 * An action is an expression if it parses as one and a function body if it
 * doesn't, so `{op: 'num', value: num(one(':value'))}` and
 * `const v = one(':value'); return v > 0 ? v : -v` both work.
 *
 * `extension-reduce` has already rewritten `$1` and `$sx:nodeKind` to names
 * by the time the code arrives; putting `scope.bindings` in scope is all
 * this has to do about them.  `$` is the one that needs saying twice: it is
 * a name the action assigns to, so when `scope.ret` names it, the action's
 * value is what that name ended up holding.
 *
 * Running code that arrived with a document is a decision the caller makes
 * by passing this evaluator at all; another one can run something safer.
 */
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const RDF_type = RDF + 'type';
const XSD = 'http://www.w3.org/2001/XMLSchema#';
/** run one action, with the scope's data in scope as names */
/**
 * What reject() and cut() throw, on its way to being a value again.
 *
 * The scope extension-reduce hands an evaluator is plain data -- no
 * functions cross that line, so the fold ports to an implementation in
 * another language -- which is why refusing by exception is *this* side's
 * business: exceptions are a fact about the action language, and the value
 * an action returns is what the two sides agreed on.  Another evaluator in
 * another language does the same with whatever its language has.
 */
class Refusal extends Error {
    constructor(why, cut) {
        const said = why !== null && typeof why === 'object' && 'failure' in why
            ? why.failure : why;
        super('the action ' + (cut ? 'cut' : 'rejected') + ' the match'
            + (said === undefined || said === '' ? '' : ': ' + String(said)));
        this.name = 'ReduceRefusal';
        // what you passed if it already reads as a refusal, the reason for one
        // otherwise -- so reject('why') and reject({failure, code}) both work
        const value = why !== null && typeof why === 'object' && 'failure' in why
            ? Object.assign({}, why) : { failure: why };
        this.value = cut ? Object.assign(value, { cut: true }) : value;
    }
}
function evaluate(code, scope) {
    const names = namesFor(scope);
    let value;
    try {
        value = compile(code)(names);
    }
    catch (e) {
        if (!(e instanceof Refusal))
            throw e;
        return e.value; // a refusal is an answer, not a fault
    }
    // `with` writes an assignment through to the object when the name is one
    // of its own, so `$$ = ...` lands on the binding extension-reduce made
    return scope.ret === undefined ? value : names[scope.ret];
}
/**
 * What an action can say.  The arcs arrive keyed by full predicate IRI, so
 * the accessors expand a prefixed name before looking one up; `a` is always
 * rdf:type.
 */
function namesFor(scope) {
    const expand = prefixExpander(scope.prefixes || {});
    const arcs = scope.arcs || {};
    const at = (p) => arcs[expand(p)] || [];
    return Object.assign({}, scope.api, {
        // what reduced
        kind: scope.kind,
        node: scope.node,
        shape: scope.shape,
        subject: scope.subject,
        predicate: scope.predicate,
        object: scope.object,
        value: scope.value,
        arcs,
        state: scope.state,
        // reaching the arcs
        all: at,
        has: (p) => at(p).length > 0,
        opt: (p) => {
            const found = at(p);
            if (found.length > 1)
                throw Error(`opt(${JSON.stringify(p)}) found ${found.length} values`);
            return found[0];
        },
        one: (p) => {
            const found = at(p);
            if (found.length !== 1)
                throw Error(`one(${JSON.stringify(p)}) found ${found.length} values`
                    + (Object.keys(arcs).length
                        ? `; ${scope.where} matched ` + Object.keys(arcs).join(', ')
                        : ''));
            return found[0];
        },
        // ...and saying no, from wherever the action found out rather than by
        // arranging for a value to be returned: `reject('why')` refuses this
        // production and the match goes on to whatever else the node could be;
        // `cut('why')` says no other reading will do either.  They throw, and
        // `evaluate` below turns what they throw into the value extension-
        // reduce reads -- which is the value an action can return instead.
        reject: (why) => { throw new Refusal(why, false); },
        cut: (why) => { throw new Refusal(why, true); },
        // reading a term
        str, num, iri, local, lang, datatype, isBnode, key,
        expand, RDF, XSD, nil: RDF + 'nil',
    }, scope.bindings);
}
// ## terms, as an action wants to see them
/** the lexical form of a literal, or the IRI of an IRI */
function str(term) {
    return term === null || term === undefined ? term
        : typeof term === 'string' ? term : term.value;
}
/** a literal read as a JavaScript number */
function num(term) {
    return Number(str(term));
}
/** an IRI, refusing a literal */
function iri(term) {
    if (typeof term !== 'string')
        throw Error(`expected an IRI, got the literal ${JSON.stringify(term)}`);
    return term;
}
/** the part of an IRI after the last / or # -- what a type usually reads as */
function local(term) {
    return str(term).replace(/^.*[/#]/, '');
}
/**
 * A string that tells this term from every other one, for an action that
 * keeps something per node.
 *
 * An IRI and a blank node arrive as strings and can be used as keys as they
 * are; a literal arrives as `{value, type?, language?}`, and an object used
 * as a key is the string "[object Object]" -- every literal the same one.
 * So: the term as N-Triples writes it, near enough that no two terms share
 * a key.
 */
function key(term) {
    if (term === null || term === undefined)
        return String(term);
    if (typeof term === 'string')
        return term;
    return '"' + term.value + '"'
        + (term.language ? '@' + term.language : term.type ? '^^' + term.type : '');
}
/** whether a term is a blank node, which ShExJ writes as a _: name */
function isBnode(term) {
    return typeof term === 'string' && term.substr(0, 2) === '_:';
}
function lang(term) {
    return typeof term === 'string' ? undefined : term.language;
}
function datatype(term) {
    return typeof term === 'string' ? undefined : term.type;
}
// ## compiling an action
const compiled = new Map();
/**
 * An action is an expression if it parses as one, and a function body if it
 * doesn't -- so `{op: 'num'}` and `const x = 1; return x` both work, and
 * neither needs a keyword the writer has to remember.  (An object literal at
 * the head of a statement is a block in JavaScript, which is why the
 * expression reading has to be tried first.)
 */
function compile(code) {
    const already = compiled.get(code);
    if (already !== undefined)
        return already;
    let fn;
    try {
        fn = build('return (' + code + '\n)');
    }
    catch (e) {
        if (!(e instanceof SyntaxError))
            throw e;
        fn = build(code);
    }
    compiled.set(code, fn);
    return fn;
}
function build(body) {
    // `with` is the cheapest way to put an open-ended set of names in scope,
    // and this is already arbitrary text being run as code.
    // eslint-disable-next-line no-new-func
    const f = new Function('__names', 'with (__names) { ' + body + '\n}');
    return (names) => f(names);
}
function prefixExpander(prefixes) {
    return function expand(name) {
        if (name === 'a')
            return RDF_type;
        const at = name.indexOf(':');
        if (at === -1)
            return name;
        const prefix = name.substr(0, at);
        if (/^[a-z][a-z0-9+.-]*$/i.test(prefix) && !(prefix in prefixes)
            && (name.substr(at + 1, 2) === '//' || prefix === 'urn' || prefix === 'mailto'))
            return name; // already an IRI
        if (!(prefix in prefixes))
            throw Error(`no prefix "${prefix}:" (the reduce options declare `
                + (Object.keys(prefixes).length
                    ? Object.keys(prefixes).map(p => p + ':').join(', ') : 'none') + ')');
        return prefixes[prefix] + name.substr(at + 1);
    };
}
module.exports = evaluate;
module.exports.evaluate = evaluate;
module.exports.namesFor = namesFor;
module.exports.str = str;
module.exports.num = num;
module.exports.iri = iri;
module.exports.local = local;
module.exports.lang = lang;
module.exports.datatype = datatype;
module.exports.isBnode = isBnode;
module.exports.key = key;
module.exports.Refusal = Refusal;
//# sourceMappingURL=shex-extension-reduce-js.js.map

/***/ },

/***/ 5
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Vocab = exports.NS = void 0;
exports.applyOverlay = applyOverlay;
exports.indexOverlay = indexOverlay;
exports.evalShapePath = evalShapePath;
exports.extractOverlay = extractOverlay;
exports.overlayTurtle = overlayTurtle;
/**
 * Semantic actions, kept out of the schema.
 *
 * A ShExC schema with `%<ext>{ code %}` sprinkled through it is a schema
 * only one program can read comfortably: everyone else has to step over
 * somebody else's code to see the shapes.  An *overlay* says the same thing
 * from outside -- an RDF document naming schema elements and the actions to
 * hang on them -- so the schema stays the thing several tools can share.
 *
 *     PREFIX sa: <http://shex.io/ns/semact#>
 *     <#calc> a sa:Overlay ;
 *       sa:extension <http://shex.io/extensions/Reduce/> ;
 *       sa:action
 *         [ sa:ref  <http://a.example/calc#Num> ;
 *           sa:code "{op: 'num', value: one(':value')}" ],
 *         [ sa:path "@<http://a.example/calc#BinOp>" ;
 *           sa:code "{op: type, l: one(':left'), r: one(':right')}" ] .
 *
 * The idea, the vocabulary shape and the two ways of naming an element are
 * lifted from ericprud/shex-form, which does this for `ui:` annotations.
 * `sa:ref` names an element by its ShExJ id; `sa:path` selects one with a
 * ShapePath, which is how you reach the elements nobody labelled.
 */
const visitor_1 = __webpack_require__(747);
const ShapePath = __webpack_require__(725);
exports.NS = 'http://shex.io/ns/semact#';
exports.Vocab = {
    Overlay: exports.NS + 'Overlay',
    action: exports.NS + 'action',
    ref: exports.NS + 'ref',
    path: exports.NS + 'path',
    code: exports.NS + 'code',
    extension: exports.NS + 'extension',
    order: exports.NS + 'order',
    start: exports.NS + 'start',
};
const RDF_type = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
/** ShExJ productions with a place to put a SemAct (ShExJ.jsg semActs:[SemAct+]?) */
const CAN_HOLD_SEMACTS = [
    'Shape', 'NodeConstraint', 'TripleConstraint', 'EachOf', 'OneOf',
];
/**
 * `schema`, with the overlay's actions written into it -- and returned, so
 * a caller may read it either way.
 *
 * This is the mode that costs the schema its innocence: an element that the
 * overlay names comes away carrying `semActs`, and anything else holding
 * that schema sees them.  Where that isn't wanted -- a schema several
 * readings share, or one on disk that should stay what it says --
 * `indexOverlay` says the same thing beside the schema rather than in it.
 */
function applyOverlay(schema, overlay, options = {}) {
    const started = new Set();
    for (const b of bind(schema, overlay, options)) {
        if (b.target === schema) { // sa:start -- the schema's own startActs
            if (options.replace && !started.has(schema)) {
                schema.startActs = [];
                started.add(schema);
            }
            schema.startActs = (schema.startActs || []).concat([b.semAct]);
            continue;
        }
        canHold(b);
        if (options.replace && !started.has(b.target)) {
            b.target.semActs = [];
            started.add(b.target);
        }
        b.target.semActs = (b.target.semActs || []).concat([b.semAct]);
    }
    return schema;
}
/**
 * What the overlay says, keyed by the element it says it about, with the
 * schema left exactly as it was.
 *
 * The keys are the schema's own objects, so the Map means nothing without
 * it: hand both to the validator, which asks the Map about an element as
 * well as reading the element's own actions
 * (`new ShExValidator(schema, db, {semActIndex: index})`).
 *
 * `replace` has nothing to do here.  It is for keeping a second run of an
 * overlay from stacking actions onto the schema, and a run of this one
 * builds a new Map rather than adding to anything.
 */
function indexOverlay(schema, overlay, options = {}) {
    const index = new Map();
    for (const b of bind(schema, overlay, options)) {
        if (b.target !== schema)
            canHold(b);
        const already = index.get(b.target);
        if (already === undefined)
            index.set(b.target, [b.semAct]);
        else
            already.push(b.semAct);
    }
    return index;
}
/**
 * The overlay's actions, each resolved to the element it lands on.
 *
 * Same element, more than one action: order by sa:order, then by the code
 * itself, so a document that doesn't say gets the same answer every run.
 */
function bind(schema, overlay, options) {
    const index = visitor_1.ShExIndexVisitor.index(schema);
    const bindings = readOverlay(overlay, options)
        .map(spec => resolve(spec, schema, index, options));
    bindings.sort((l, r) => l.order - r.order || cmp(l.semAct.code, r.semAct.code));
    return bindings;
}
/**
 * ShExJ has semActs on five productions, and those are the five a validator
 * dispatches at, so an action anywhere else would never run either way.
 */
function canHold(b) {
    if (CAN_HOLD_SEMACTS.indexOf(b.target.type) === -1)
        throw Error(`${b.named} is a ${b.target.type}; ShExJ has semActs on `
            + CAN_HOLD_SEMACTS.join(', '));
}
function readOverlay(overlay, options) {
    const overlays = overlay.getQuads(null, RDF_type, exports.Vocab.Overlay)
        .filter(q => options.only === undefined || q.subject.value === options.only);
    if (overlays.length === 0 && options.only !== undefined)
        throw Error(`no <${options.only}> a sa:Overlay in the overlay document`);
    return overlays.flatMap((root) => {
        const fallbackName = one(overlay, root.subject, exports.Vocab.extension);
        return overlay.getQuads(root.subject, exports.Vocab.action, null).map(q => {
            const a = q.object;
            const ref = one(overlay, a, exports.Vocab.ref);
            const path = one(overlay, a, exports.Vocab.path);
            const start = overlay.getQuads(a, exports.Vocab.start, null).length > 0;
            const named = [ref && `sa:ref <${ref}>`, path && `sa:path "${path}"`, start && 'sa:start']
                .filter(x => x);
            if (named.length !== 1)
                throw Error(`an sa:action wants exactly one of sa:ref, sa:path or sa:start; `
                    + (named.length ? `<${root.subject.value}> gave ${named.join(' and ')}`
                        : `<${root.subject.value}> gave none`));
            const name = one(overlay, a, exports.Vocab.extension) || fallbackName;
            if (!name)
                throw Error(`no sa:extension on ${named[0]} or on <${root.subject.value}>: `
                    + `an action has to say which extension runs it`);
            const order = one(overlay, a, exports.Vocab.order);
            return {
                ref, path, start,
                code: one(overlay, a, exports.Vocab.code),
                name,
                order: order === undefined ? 0 : parseInt(order, 10),
            };
        });
    });
}
function resolve(spec, schema, index, options) {
    const semAct = { type: 'SemAct', name: spec.name };
    if (spec.code !== undefined)
        semAct.code = spec.code;
    if (spec.start)
        return { target: schema, semAct, order: spec.order, named: 'sa:start' };
    if (spec.ref !== undefined) {
        let target = index.shapeExprs[spec.ref] || index.tripleExprs[spec.ref];
        if (target === undefined)
            throw Error(`sa:ref <${spec.ref}> is not a label in this schema; it has `
                + describeLabels(index));
        // A ShapeDecl is a label wrapped around a shape expression, and ShExJ
        // puts semActs on the expression rather than on the wrapper.
        if (target.type === 'ShapeDecl')
            target = target.shapeExpr;
        return { target, semAct, order: spec.order, named: `sa:ref <${spec.ref}>` };
    }
    const found = evalShapePath(spec.path, schema, options);
    if (found.length === 0)
        throw Error(`sa:path "${spec.path}" selected nothing in this schema`);
    if (found.length > 1)
        throw Error(`sa:path "${spec.path}" selected ${found.length} elements; `
            + `an action goes on one (narrow the path, or write one action each)`);
    return { target: found[0], semAct, order: spec.order, named: `sa:path "${spec.path}"` };
}
/** the ShapePath elements `pathStr` selects in `schema` */
function evalShapePath(pathStr, schema, options = {}) {
    const yy = {
        base: options.base === undefined ? undefined : new URL(options.base),
        prefixes: options.prefixes || {},
    };
    const expr = new ShapePath.Parser.ShapePathParser(yy).parse(pathStr);
    return expr.evalPathExpr([schema], new ShapePath.Ast.EvalContext(schema));
}
// ## reading RDF without depending on an RDF library
function one(source, subject, predicate) {
    const found = source.getQuads(subject, predicate, null);
    if (found.length === 0)
        return undefined;
    if (found.length > 1)
        throw Error(`${predicate} is given ${found.length} times on one sa:action`);
    return found[0].object.value;
}
function cmp(l, r) {
    return (l || '') < (r || '') ? -1 : (l || '') > (r || '') ? 1 : 0;
}
function describeLabels(index) {
    const shapes = Object.keys(index.shapeExprs || {});
    const tes = Object.keys(index.tripleExprs || {});
    return `${shapes.length} shape ${plural(shapes.length, 'label')}`
        + ` and ${tes.length} triple expression ${plural(tes.length, 'label')}`
        + (shapes.length + tes.length > 0
            ? `:\n  ` + shapes.concat(tes).map(l => '  ' + l).join('\n  ')
            : '');
}
function plural(n, word) {
    return n === 1 ? word : word + 's';
}
/**
 * A schema's actions, lifted out into overlay form.
 *
 * The way back for a schema that already has `%<ext>{...%}` through it: what
 * comes out is a schema anyone can read and a list of actions that puts them
 * back.  An element an overlay can't name -- no id, and no ShapePath this
 * knows how to write for it -- keeps its actions, and is listed in `left`.
 */
function extractOverlay(schema) {
    const copy = JSON.parse(JSON.stringify(schema));
    delete copy._index;
    const actions = [];
    const left = [];
    if (copy.startActs) {
        copy.startActs.forEach((a, i) => actions.push({ start: true, name: a.name, code: a.code, order: i }));
        delete copy.startActs;
    }
    (copy.shapes || []).forEach((decl) => {
        const label = typeof decl.id === 'string' && decl.id.substr(0, 2) !== '_:'
            ? decl.id : null;
        shapeExpr(decl.type === 'ShapeDecl' ? decl.shapeExpr : decl, label === null ? null : { ref: label }, label, `<${decl.id}>`);
    });
    return { schema: copy, actions, left };
    function shapeExpr(expr, naming, label, where) {
        if (expr === null || typeof expr !== 'object')
            return;
        take(expr, naming, where);
        switch (expr.type) {
            case 'ShapeAnd':
            case 'ShapeOr':
                // a conjunct has no id and no step this writes, so it names nothing
                return expr.shapeExprs.forEach((e, i) => shapeExpr(e, null, label, `${where}/shapeExprs[${i}]`));
            case 'ShapeNot':
                return shapeExpr(expr.shapeExpr, null, label, `${where}/shapeExpr`);
            case 'Shape':
                return tripleExpr(expr.expression, label, `${where}/expression`, countPredicates(expr.expression));
            default:
                return;
        }
    }
    function tripleExpr(expr, label, where, counts) {
        if (expr === null || typeof expr !== 'object')
            return;
        // A triple constraint with an id is named by it; without one, the
        // predicate shortcut reaches it, so long as the shape has a label and
        // only one constraint on that predicate.
        const naming = expr.id !== undefined && expr.id.substr(0, 2) !== '_:'
            ? { ref: expr.id }
            : expr.type === 'TripleConstraint' && label !== null && counts[expr.predicate] === 1
                ? { path: `@<${label}>~<${expr.predicate}>` }
                : null;
        take(expr, naming, where);
        if (expr.type === 'EachOf' || expr.type === 'OneOf')
            expr.expressions.forEach((e, i) => tripleExpr(e, label, `${where}/expressions[${i}]`, counts));
        if (expr.type === 'TripleConstraint')
            shapeExpr(expr.valueExpr, null, null, `${where}/valueExpr`);
    }
    function take(elt, naming, where) {
        const acts = elt.semActs;
        if (acts === undefined || acts.length === 0)
            return;
        if (naming === null) {
            left.push({ where, semActs: acts });
            return;
        }
        acts.forEach((a, i) => actions.push(Object.assign({}, naming, { name: a.name, code: a.code, order: i })));
        delete elt.semActs;
    }
    function countPredicates(expr) {
        const counts = {};
        walk(expr);
        return counts;
        function walk(e) {
            if (e === null || typeof e !== 'object')
                return;
            if (e.type === 'TripleConstraint')
                counts[e.predicate] = (counts[e.predicate] || 0) + 1;
            else if (e.type === 'EachOf' || e.type === 'OneOf')
                e.expressions.forEach(walk);
        }
    }
}
/** the Turtle for a list of extracted actions */
function overlayTurtle(actions, options = {}) {
    const subject = options.subject || '<#overlay>';
    const shared = options.extension
        || (actions.length && actions.every(a => a.name === actions[0].name)
            ? actions[0].name : undefined);
    const lines = actions.map(a => {
        const parts = [
            a.start ? 'sa:start true' : a.ref !== undefined ? `sa:ref <${a.ref}>`
                : `sa:path ${quote(a.path)}`,
            shared === undefined ? `sa:extension <${a.name}>` : null,
            a.code === undefined ? null : `sa:code ${quote(a.code)}`,
            a.order === 0 ? null : `sa:order ${a.order}`,
        ].filter(p => p !== null);
        return '  [ ' + parts.join(' ;\n    ') + ' ]';
    });
    return `PREFIX sa: <${exports.NS}>\n\n${subject} a sa:Overlay ;\n`
        + (shared === undefined ? '' : `  sa:extension <${shared}> ;\n`)
        + (lines.length ? '  sa:action\n' + lines.join(' ,\n') + '\n' : '')
        + '.\n';
}
function quote(s) {
    return s.indexOf('\n') === -1
        ? '"' + s.replace(/(["\\])/g, '\\$1') + '"'
        : '"""' + s.replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"') + '"""';
}
//# sourceMappingURL=semact-overlay.js.map

/***/ },

/***/ 261
(module) {

"use strict";

/**
 * ShEx as a parser generator.
 *
 * A ShEx schema recognizes a subgraph the way a grammar recognizes a string,
 * and a validation result is the parse tree it recognized it by.  This
 * extension is the other half a parser generator has: an action per
 * production, run bottom-up over that tree, each one reducing what its
 * children produced into one value.  What comes out is an AST.
 *
 *     <#Num>   { a [:Num] ; :value xsd:integer }   ->  {op: 'num', value: num(one(':value'))}
 *     <#BinOp> { a [:Add :Mul] ;
 *                :left @<#Expr> ; :right @<#Expr> } ->  {op: local(one('a')),
 *                                                        l: one(':left'), r: one(':right')}
 *
 * Actions run *after* the match, not during it, which is the whole reason
 * this is separate from the validator: the matcher backtracks, and an action
 * that fired on a partition that was later abandoned would have built part of
 * an AST for a parse that never happened.  Dispatch here only records that an
 * action applies at a place in the result; `reduce()` then folds the result
 * that survived.  So an action can't reject a match -- that is the schema's
 * job -- and it is free to be as effectful as it likes.
 *
 * An action names what its sub-productions reduced to the way yacc does:
 * `$sx:nodeKind` is what the arc on that predicate reduced to, `$1` is the
 * first value the body matched, and `$$` is the value of this production.
 *
 * This module has no action language: `reduce()` takes an `evaluate(code,
 * scope)` and hands it plain data.  Running code that arrived with a document
 * is a decision the caller makes by passing an evaluator at all.
 */
const ReduceExt = 'http://shex.io/extensions/Reduce/';
// ## the SemAct extension half: record, don't run
function register(validator, api) {
    if (validator === undefined || validator.semActHandler === undefined)
        throw Error('register(validator, ...) wants a ShExValidator');
    validator.semActHandler.results[ReduceExt] = [];
    return validator.semActHandler.register(ReduceExt, {
        /**
         * Note that this action applies here, and say nothing about the match.
         * `reduce()` reads these back out of whichever result survived.
         */
        dispatch: function (code, _ctx, extensionStorage) {
            extensionStorage.code = code;
            return [];
        },
        api,
    });
}
/**
 * ...or run them as the matcher matches, and let them reject.
 *
 * The other `register` records and `reduce()` folds afterwards, because the
 * matcher backtracks: an action that fired on a partition later abandoned
 * would have built part of an AST for a parse that never happened.  That is
 * the LR bargain -- defer the reduction until the parse is decided -- and
 * the price of it is that an action cannot say "not this way".
 *
 * PEG pays the other way: actions run inside the attempt, an attempt may be
 * abandoned, and an action may fail the attempt it is in.  This is that.
 * The action runs at dispatch, its value is stored on the result so the
 * fold takes it rather than running the code again, and a value the
 * `rejects` test recognizes fails the match -- which sends an OR to its next
 * branch, exactly as a node constraint that didn't hold would.
 *
 * So the author owns two things they did not before: an action may run on a
 * branch that is then thrown away (write it without side effects, or expect
 * them twice), and an action's value is now part of what "matched" means.
 */
function registerEager(validator, options = {}) {
    if (validator === undefined || validator.semActHandler === undefined)
        throw Error('registerEager(validator, ...) wants a ShExValidator');
    if (typeof options.evaluate !== 'function')
        throw Error('registerEager() needs an `evaluate` option -- (code, scope) => value. '
            + 'For actions written in JavaScript that is @shexjs/extension-reduce-js.');
    // the validator's schema, unless the caller brought one: it is what says
    // whether `$:left` is a value or a list of them (arityOf)
    const f = foldFor(Object.assign({ schema: validator.schema }, options), 'matching');
    const rejects = options.rejects || refused;
    validator.semActHandler.results[f.url] = [];
    return validator.semActHandler.register(f.url, {
        dispatch: function (code, ctx, storage, artifact) {
            // a group's action is not run in either mode: a shape's action already
            // sees everything its body matched, by predicate
            if (ctx && ctx.tripleExpr
                && (ctx.tripleExpr.type === 'EachOf' || ctx.tripleExpr.type === 'OneOf'))
                return [];
            const where = describe(artifact);
            const { scope, values } = eagerScope(f, ctx, artifact);
            const value = runAction(f, code, where, scope, values);
            storage.code = code;
            storage.value = value; // what the fold will take
            if (!rejects(value))
                return [];
            // ...and a refusal that says `cut` is the value spelling of cut():
            // an action language without exceptions can still say it
            if (value !== null && typeof value === 'object' && value.cut)
                throw new SemActCut(value, where);
            return [{ type: 'SemActFailure', errors: [rejection(value, where)] }];
        },
        api: options.api,
    });
}
/** the value an action returns to say "this match is no good" */
function refused(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        && 'failure' in value;
}
function rejection(value, where) {
    const said = value && value.failure;
    return `the action on ${where} rejected the match`
        + (said === undefined || said === '' ? '' : ': ' + String(said));
}
/**
 * What an eager action sees.  The same scope the fold builds, from the same
 * places -- the result artifact is the fold's own input, and the values
 * underneath it are stored there by the actions that already ran.
 */
function eagerScope(f, ctx, artifact) {
    if (ctx === null || ctx === undefined) // a start action: before any of it
        return { scope: { kind: 'start', arcs: {} }, values: [] };
    if (artifact && artifact.type === 'TestedTriple') {
        const bare = artifact.referenced === undefined
            ? artifact.object
            : reduceNode(f, artifact.referenced);
        return {
            scope: { kind: 'tripleConstraint', subject: artifact.subject,
                predicate: artifact.predicate, object: artifact.object,
                value: bare, arcs: {} },
            values: [bare],
        };
    }
    const { arcs, values } = arcsOf(f, artifact && artifact.solution !== undefined
        ? artifact.solution : ctx);
    return {
        scope: { kind: 'shape', node: artifact ? artifact.node : undefined,
            shape: artifact ? artifact.shape : undefined, arcs },
        values,
    };
}
function done(validator) {
    if (validator.semActHandler.results[ReduceExt].length === 0)
        delete validator.semActHandler.results[ReduceExt];
}
// ## the fold
/**
 * "Not this one, and not any of the others either": a cut.
 *
 * A rejection fails the shape the action was on and the match goes on to
 * whatever else that node could be.  Sometimes the action knows there is no
 * point -- the number is not the sum however you read the expression -- and
 * every alternative left is work whose only result is to bury the reason
 * this one failed under the last one's.  Thrown, this fails the node/shape
 * pair where the action stood: the validator reads `type` and `cut` (see
 * SemActFailure) and reports it as that pair's failure.
 */
class SemActCut extends Error {
    constructor(why, where) {
        const gave = refused(why) ? why.failure : why;
        const text = 'the action' + (where === undefined ? '' : ' on ' + where)
            + ' cut the match'
            + (gave === undefined || gave === '' ? '' : ': ' + String(gave));
        super(text);
        this.type = 'SemActFailure';
        this.cut = true;
        this.name = 'SemActCut';
        this.errors = [text];
    }
}
/** where an action was, when it goes wrong */
class ReduceError extends Error {
    constructor(verb, where, code, cause) {
        super(`${verb} ${where}:\n  ${code}\n${indent(String(cause && cause.message || cause))}`);
        this.name = 'ReduceError';
    }
}
function foldFor(options, verb = 'reducing') {
    return {
        runner: typeof options.evaluate === 'function'
            ? { evaluate: options.evaluate, prefixes: options.prefixes || {},
                api: options.api || {}, state: {}, bounds: new Map() }
            : null,
        url: options.url || ReduceExt,
        onRecursion: options.onRecursion || 'node',
        seen: new Map(),
        provenance: Array.isArray(options.provenance) ? options.provenance : null,
        many: arityOf(options.schema),
        verb,
        onError: typeof options.onError === 'function' ? options.onError : null,
    };
}
/**
 * The value the actions reduce a validation result to.
 *
 * `result` is what `validateShapeMap`/`validateNodeShapePair` returned.  A
 * result with more than one node/shape pair reduces to an array, one value
 * per pair, in the order they were asked for.
 */
function reduce(result, options = {}) {
    return reduceResult(foldFor(options), result);
}
/**
 * How many values a reference to an arc stands for.
 *
 * `$:left` is one value where the schema gives a shape at most one `:left`,
 * and the list of them where it may have several -- which is what lets an
 * action say `Object.assign($rdf:type, $:left, $:right)` rather than
 * counting its own arcs.  A constraint inside a repeated group can match
 * more than once however small its own cardinality, so what counts is the
 * whole path's; and two constraints on one predicate are two ways for it to
 * arrive, so that is a list too.  Anything this cannot read -- a tripleExpr
 * by reference, a shape it has never heard of -- is a list, which is what
 * every arc reference was before this.
 */
function arityOf(schema) {
    const decls = (schema && schema.shapes) || [];
    const shapeOf = (expr) => expr === null || typeof expr !== 'object' ? null
        : expr.type === 'ShapeDecl' ? shapeOf(expr.shapeExpr)
            : expr.type === 'Shape' ? expr
                : null;
    const once = new Map();
    (Array.isArray(decls) ? decls : Object.values(decls)).forEach((decl) => {
        const label = decl && (decl.id || decl.label);
        const shape = shapeOf(decl);
        if (typeof label !== 'string' || shape === null)
            return;
        const single = new Set();
        const seen = new Set();
        walk(shape.expression, true);
        once.set(label, single);
        function walk(expr, alone) {
            if (expr === null || typeof expr !== 'object')
                return; // a tripleExpr by reference: unknown
            const solo = alone && (expr.max === undefined || expr.max === 1);
            if (expr.type === 'TripleConstraint') {
                if (seen.has(expr.predicate)) // a second way for it to arrive
                    single.delete(expr.predicate);
                else if (solo)
                    single.add(expr.predicate);
                seen.add(expr.predicate);
                return;
            }
            (expr.expressions || []).forEach((e) => walk(e, solo));
        }
    });
    return (shape, predicate) => {
        const single = shape === undefined ? undefined : once.get(shape);
        return single === undefined || !single.has(predicate);
    };
}
function reduceResult(f, res) {
    // a results ShapeMap: [{node, shape, status, appinfo}, ...]
    if (Array.isArray(res))
        return res.map(entry => 'appinfo' in entry ? reduceResult(f, entry.appinfo) : reduceNode(f, entry));
    runStartActs(f, res);
    return reduceNode(f, res);
}
/**
 * The schema's start actions, before the walk.
 *
 * A start action runs before the match rather than at some place in it, so
 * `register` has nothing to record for one -- the validator hands its
 * dispatch a scratch object and then drops it -- and the fold is where a
 * recorded run gets to run them.  An eager run has already run them, and
 * folds with no evaluator, which is what tells the two apart here.
 */
function runStartActs(f, res) {
    if (f.runner === null) // nothing to run: an eager run
        return;
    ((res && res.startActs) || [])
        .filter((act) => act.name === f.url && typeof act.code === 'string')
        .forEach((act) => runAction(f, act.code, 'the start actions', { kind: 'start', arcs: {} }, []));
}
function reduceNode(f, node) {
    if (node === null || node === undefined)
        return node;
    switch (node.type) {
        case 'SolutionList':
            return node.solutions.map((s) => reduceNode(f, s));
        /* An AND is several constraints on one node, so it reduces to one value:
         * whichever conjunct said something.  A conjunct with no action reduces
         * to its own node, and saying "this node is this node" is not an answer
         * anyone wrote an action for, so those drop out.  `IRI /pattern/` and
         * `BNODE CLOSED {...}` are the everyday shapes of this. */
        case 'ShapeAndResults': {
            const values = node.solutions.map((s) => reduceNode(f, s));
            const spoke = values.filter((v, i) => v !== nodeOf(node.solutions[i]));
            return spoke.length === 1 ? spoke[0]
                : spoke.length === 0 ? nodeOf(node.solutions[0])
                    : values;
        }
        case 'ShapeOrResults':
        case 'ShapeNotResults':
            return reduceNode(f, node.solution);
        case 'ShapeTest': {
            const key = keyOf(node.node, node.shape);
            const { arcs, values } = arcsOf(f, node.solution, node.shape);
            const value = run(f, node, { kind: 'shape', node: node.node, shape: node.shape, arcs }, values, () => node.node);
            f.seen.set(key, value);
            return value;
        }
        case 'NodeConstraintTest':
            return run(f, node, { kind: 'shape', node: node.node, shape: node.shape, arcs: {} }, [], () => node.node);
        case 'Recursion': {
            // The matcher found this pair on the way down, so its value is still
            // being computed; if it happens to be finished, use it.
            const key = keyOf(node.node, node.shape);
            if (f.seen.has(key))
                return f.seen.get(key);
            switch (f.onRecursion) {
                case 'marker': return { type: 'Recursion', node: node.node, shape: node.shape };
                case 'throw': throw Error(`${key} is still being reduced: the data has a cycle`);
                default: return node.node;
            }
        }
        default:
            // an unlabelled shape (`{ :p . }` with no ShapeDecl) reports no wrapper
            if ('solution' in node)
                return reduceNode(f, node.solution);
            if ('solutions' in node)
                return node.solutions.map((s) => reduceNode(f, s));
            return node;
    }
}
/**
 * What a shape's body matched, twice over: by predicate, which is how an
 * action names a sub-production, and in match order, which is how `$1`
 * reaches one whose name it shares with another.
 */
function arcsOf(f, solution, inShape) {
    const arcs = {};
    const values = [];
    collect(solution);
    return { arcs, values };
    function collect(s) {
        if (s === null || s === undefined)
            return;
        if (Array.isArray(s))
            return s.forEach(collect);
        switch (s.type) {
            case 'EachOfSolutions':
            case 'OneOfSolutions':
                return s.solutions.forEach(collect);
            case 'EachOfSolution':
            case 'OneOfSolution':
                return s.expressions.forEach(collect);
            case 'TripleConstraintSolutions': {
                // an action on a triple constraint is recorded per matched triple,
                // so a repeated arc gets one run of the action per occurrence
                (s.solutions || []).forEach((tested) => {
                    const bare = tested.referenced === undefined
                        ? tested.object
                        : reduceNode(f, tested.referenced);
                    // the object is this production's one sub-production, so it is $1
                    // which of this predicate's constraints in this shape: with the
                    // shape, that is which constraint in the schema (provenance)
                    const occurrence = (arcs[s.predicate] || []).length;
                    const value = run(f, tested, { kind: 'tripleConstraint', subject: tested.subject,
                        predicate: tested.predicate, object: tested.object,
                        value: bare, arcs: {} }, [bare], () => bare, { inShape, occurrence });
                    (arcs[s.predicate] = arcs[s.predicate] || []).push(value);
                    values.push(value);
                });
                return;
            }
            default:
                if ('solutions' in s)
                    return collect(s.solutions);
                if ('solution' in s)
                    return collect(s.solution);
        }
    }
}
/**
 * Only what dispatch left counts.  A result node also carries the schema's
 * `semActs`, but not always its own -- a shape's actions turn up on the
 * solution beneath it too -- and `extensions` is written by the dispatch for
 * exactly one artifact, so it is the one that can be trusted.
 */
function extOn(f, node) {
    const ext = node && node.extensions && node.extensions[f.url];
    return ext && (typeof ext.code === 'string' || 'value' in ext) ? ext : undefined;
}
function run(f, node, scope, values, fallback, where) {
    const ext = extOn(f, node);
    if (ext === undefined)
        return fallback();
    const value = 'value' in ext
        ? ext.value // an eager action already ran here
        : runAction(f, ext.code, describe(node), scope, values);
    if (f.provenance !== null)
        f.provenance.push(Object.assign({ value, code: ext.code, kind: scope.kind, at: node }, scope.kind === 'shape'
            ? { node: scope.node, shape: scope.shape }
            : { subject: scope.subject, predicate: scope.predicate, object: scope.object }, where || {}));
    return value;
}
function runAction(f, code, where, scope, values) {
    const runner = f.runner;
    if (runner === null)
        throw Error('reduce() needs an `evaluate` option -- (code, scope) => value. '
            + 'For actions written in JavaScript that is @shexjs/extension-reduce-js.');
    try {
        const bound = bindRefs(code, runner.prefixes, runner.bounds);
        const bindings = {};
        bound.refs.forEach(({ id, ref }) => {
            bindings[id] = ref.kind === 'ret' ? undefined
                : ref.kind === 'pos' ? values[ref.at - 1]
                    : ref.kind === 'all' ? values.slice()
                        : arcRef(f, scope, ref.iri);
        });
        return runner.evaluate(bound.code, Object.assign({ where, prefixes: runner.prefixes, api: runner.api, state: runner.state }, scope, bound.ret === undefined ? { bindings } : { bindings, ret: bound.ret }));
    }
    catch (e) {
        const error = e instanceof ReduceError ? e : new ReduceError(f.verb, where, code, e);
        if (f.onError !== null)
            f.onError(error);
        throw error;
    }
}
/**
 * What `$<predicate>` stands for: the list of values the arc reduced to, or
 * the one value where the schema allows only one (arityOf).  An arc that
 * didn't match is undefined either way -- absent rather than empty.
 */
function arcRef(f, scope, iri) {
    const got = (scope.arcs || {})[iri];
    return f.many(scope.shape, iri) || got === undefined ? got : got[0];
}
/**
 * `$$` or `$`, `$1`, `$*`, `$<iri>`, `$prefix:local`, `$:local` -- and
 * `$name`, which is deliberately none of them: `$` starts an identifier in
 * several action languages, and a name with no prefix is not a predicate.
 *
 * The token, if there is one; `sigil` sorts out the `$`s with nothing after
 * them that this recognizes.
 */
const REF = /\$(\$|\*|\d+|<[^\s<>"{}|^`\\]*>|[A-Za-z_][\w-]*:[\w-]*|:[\w-]*|[A-Za-z_][\w-]*)?/g;
/**
 * What a `$` with nothing this recognizes after it is: the production's
 * value, a dollar sign that was never a reference, or a mistake.
 *
 * `${`, `$/` and a `$` before a quote are left alone -- far more likely a
 * template literal, the end of a regular expression or a dollar sign in a
 * string than a reference -- and a `$` that ends a value (`$ = ...`, `f($)`,
 * `$.length`) is the production's value.
 *
 * Everything else is refused rather than passed through, which is the whole
 * point of this function: a `$@` passed through means whatever the action
 * language makes of it now, and means a reference the day someone gives
 * `$@` a meaning here.  Perl learned this about `\q` in regular
 * expressions the slow way.  So the sigils a syntax might one day want --
 * `@ & ! ? # ^ ~ % |` and the rest -- are an error while they are free,
 * and `$$` is the spelling that cannot be reinterpreted.
 */
function sigil(code, at) {
    const next = code[at + 1];
    if (next === undefined || /[\s=;,.)\]}([]/.test(next))
        return 'ret'; // nothing binds to it: the value
    if (/[{/'"`\\]/.test(next))
        return 'text'; // a template, a regexp, a string
    throw Error(`$${next} is not a reference; write $$ for the production's `
        + `value (and a space, if what follows it is an operator)`);
}
/**
 * The action as the evaluator should see it: every reference rewritten to a
 * name, and a list of what those names stand for.
 *
 * yacc splices `$1` into the C it emits, because it knows what C is.  This
 * doesn't know what the actions are written in, so it can only substitute
 * text -- which is why the names it substitutes are plain ASCII identifiers
 * (legal in any action language anyone is likely to bring) and why a `$1`
 * inside a string literal is a reference too.
 */
function bindRefs(code, prefixes, cache) {
    const already = cache.get(code);
    if (already !== undefined)
        return already;
    const refs = [];
    const seen = new Map();
    let ret;
    const rewritten = code.replace(REF, (whole, text, at) => {
        if (text !== undefined && /^[A-Za-z_]/.test(text) && text.indexOf(':') === -1)
            return whole; // `$name`: an identifier, not a reference
        if (text === undefined && sigil(code, at) === 'text')
            return whole; // a dollar sign that is not a reference
        const key = text === undefined || text === '$' ? '' : text;
        const before = seen.get(key);
        if (before !== undefined)
            return before;
        const ref = parseRef(key, prefixes);
        const id = idFor(ref, code, refs);
        seen.set(key, id);
        refs.push({ id, ref });
        if (ref.kind === 'ret')
            ret = id;
        return id;
    });
    const bound = { code: rewritten, refs, ret };
    cache.set(code, bound);
    return bound;
}
function parseRef(text, prefixes) {
    if (text === '')
        return { kind: 'ret' };
    if (text === '*')
        return { kind: 'all' };
    if (/^\d+$/.test(text)) {
        const at = Number(text);
        if (at === 0)
            throw Error("$0: a production's values are numbered from $1, as in yacc");
        return { kind: 'pos', at };
    }
    return { kind: 'arc', iri: text[0] === '<' ? text.slice(1, -1) : expandName(text, prefixes) };
}
function expandName(name, prefixes) {
    const prefix = name.substr(0, name.indexOf(':'));
    if (!(prefix in prefixes))
        throw Error(`$${name}: no prefix "${prefix}:" (reduce() was given `
            + (Object.keys(prefixes).length
                ? Object.keys(prefixes).map(p => p + ':').join(', ') : 'none') + ')');
    return prefixes[prefix] + name.substr(name.indexOf(':') + 1);
}
/**
 * A name for a reference that reads like what it stands for -- `_nodeKind`,
 * `_1`, `_ret` -- and that the action isn't already using for something of
 * its own.
 */
function idFor(ref, code, refs) {
    const base = '_' + (ref.kind === 'ret' ? 'ret'
        : ref.kind === 'pos' ? ref.at
            : ref.kind === 'all' ? 'all'
                : localOf(ref.iri).replace(/[^A-Za-z0-9_]/g, '_') || 'arc');
    let id = base;
    for (let n = 1; refs.some(r => r.id === id) || mentions(code, id); ++n)
        id = base + '_' + (n + 1);
    return id;
}
/** the part of an IRI after the last delimiter, which is what it is called */
function localOf(iri) {
    return iri.replace(/^.*[/#:]/, '');
}
function mentions(code, id) {
    return new RegExp('\\b' + id + '\\b').test(code);
}
// ## reporting
function describe(node) {
    if (node === null || node === undefined)
        return String(node);
    switch (node.type) {
        case 'ShapeTest':
        case 'NodeConstraintTest':
            return `<${node.shape}> at ${short(node.node)}`;
        case 'TripleConstraintSolutions':
            return `the constraint on <${node.predicate}>`;
        case 'TestedTriple':
            return `the constraint on <${node.predicate}> at ${short(node.subject)}`;
        default:
            return node.type || 'the result';
    }
}
function short(term) {
    return typeof term === 'string' ? `<${term}>` : JSON.stringify(term);
}
function indent(s) {
    return s.split('\n').map(l => '    ' + l).join('\n');
}
/** the focus term a result node is about, however deep it is wrapped */
function nodeOf(res) {
    if (res === null || res === undefined)
        return undefined;
    if ('node' in res)
        return res.node;
    if ('solution' in res)
        return nodeOf(res.solution);
    if ('solutions' in res && res.solutions.length)
        return nodeOf(res.solutions[0]);
    return undefined;
}
function keyOf(node, shape) {
    return short(node) + '@' + shape;
}
module.exports = {
    name: 'Reduce',
    description: `ShEx as a parser generator: the schema recognizes, the actions reduce.

The schema is the grammar and a validation result is the parse tree it
recognized by; this folds one action per production over that tree, bottom
up, and what comes out is an AST.  Actions run after the match, not during
it, so a partition the matcher abandoned leaves nothing behind and an action
cannot reject a match -- that is the schema's job.

This module has no action language.  reduce() takes an \`evaluate(code, scope)\`
and hands it plain data:
  kind                 'shape' or 'tripleConstraint'
  node, shape, arcs    the focus term, the label it matched, and what each
                       arc reduced to, by full predicate IRI
  subject, predicate,  for a constraint: the triple, and what its object
  object, value        reduced to
  bindings, ret        what each $... in the code was rewritten to, and the
                       name the action assigns its value to, if it used $$
  prefixes, api, where the caller's prefixes and extras, and where this is
An action refuses a match (registerEager) with a value: {failure: why} to say
this production is not it, {failure: why, cut: true} to say no other reading
of this node will do either.
No functions cross that line, so the same fold ports to an implementation in
another language.  @shexjs/extension-reduce-js is the JavaScript evaluator.

url: ${ReduceExt}`,
    register,
    registerEager,
    done,
    url: ReduceExt,
    reduce,
};
//# sourceMappingURL=shex-extension-reduce.js.map

/***/ },

/***/ 476
(module) {

/**
 * What node's `path` is worth in a bundle: enough to join.
 *
 * shape-path-core decides at load time whether it is under node -- by
 * looking for `window`, which a Web Worker hasn't got -- and, deciding it
 * is, computes the path of a script it never runs here.  With nothing to
 * resolve `path` to that throws, and takes the whole bundle with it before
 * anything of ShExReduce is registered.  With this it gets a string, which
 * it doesn't use.  (In a page the question never arises: there is a
 * `window`, and it takes the other branch.)
 */
const join = (...parts) =>
      parts.filter(part => part !== undefined && part !== null && part !== "").join("/");

module.exports = {
  join,
  resolve: join,
  dirname: p => String(p).replace(/\/[^/]*$/, ""),
  basename: p => String(p).replace(/^.*\//, ""),
  extname: p => (String(p).match(/\.[^./]*$/) || [""])[0],
  sep: "/",
};


/***/ },

/***/ 896
(module, __unused_webpack_exports, __webpack_require__) {

/* ShExReduce webapp bundle entry: extends the ShExWebApp global created by
 * ../shex-webapp/doc/webpacks/shex-webapp.js with the Reduce extension, its
 * JavaScript action language, and the overlay reader that hangs actions on
 * a schema they were written apart from.
 *
 * In HTML (and worker importScripts), load n3js.js and shex-webapp.js before
 * this bundle: webpack `externals` (see webpack.config.js) resolve the shared
 * modules to ShExWebApp.Modules / N3js at runtime instead of bundling a
 * second copy of every module.
 */
ShExWebApp = Object.assign(__webpack_require__(568), {
  Reduce:         __webpack_require__(261),
  ReduceJs:       __webpack_require__(656),
  SemActOverlay:  __webpack_require__(5),
})

if (true)
  module.exports = ShExWebApp;


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	let __webpack_exports__ = __webpack_require__(896);
/******/ 	
/******/ })()
;