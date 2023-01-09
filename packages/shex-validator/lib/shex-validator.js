"use strict";
/* ShExValidator - javascript module to validate a graph with respect to Shape Expressions
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShExValidator = exports.InterfaceOptions = void 0;
// interface constants
const ShExTerm = __importStar(require("@shexjs/term"));
const eval_validator_api_1 = require("@shexjs/eval-validator-api");
const Hierarchy = __importStar(require("hierarchy-closure"));
const neighborhood_api_1 = require("@shexjs/neighborhood-api");
const shex_xsd_1 = require("./shex-xsd");
const ShExVisitor = require("@shexjs/visitor");
const indexSchema = ShExVisitor.index;
exports.InterfaceOptions = {
    "coverage": {
        "firstError": "fail on first error (usually used with eval-simple-1err)",
        "exhaustive": "find as many errors as possible (usually used with eval-threaded-nerr)"
    }
};
const VERBOSE = false; // "VERBOSE" in process.env;
const EvalThreadedNErr = require("@shexjs/eval-threaded-nerr");
function ldify(term) {
    switch (term.termType) {
        case "NamedNode": return term.value;
        case "BlankNode": return "_:" + term.value;
        case "Literal":
            const ret = { value: term.value };
            const dt = term.datatype.value;
            const lang = term.language;
            if (dt &&
                dt !== "http://www.w3.org/2001/XMLSchema#string" &&
                dt !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString")
                ret.type = dt;
            if (lang)
                ret.language = lang;
            return ret;
        default:
            throw Error(`Unrecognized termType ${term.termType} in ${term}`);
    }
}
class SemActDispatcherImpl {
    constructor(externalCode) {
        this.handlers = {};
        this.results = {};
        this.externalCode = externalCode || {};
    }
    /**
     * Store a semantic action handler.
     *
     * @param {string} name - semantic action's URL.
     * @param {object} handler - handler function.
     *
     * The handler object has a dispatch function is invoked with:
     * @param {string} code - text of the semantic action.
     * @param {object} ctx - matched triple or results subset.
     * @param {object} extensionStorage - place where the extension writes into the result structure.
     * @return {bool} false if the extension failed or did not accept the ctx object.
     */
    register(name, handler) {
        this.handlers[name] = handler;
    }
    /**
     * Calls all semantic actions, allowing each to write to resultsArtifact.
     *
     * @param {array} semActs - list of semantic actions to invoke.
     * @return {bool} false if any result was false.
     */
    dispatchAll(semActs, ctx, resultsArtifact) {
        const strs = ["abc", "def"];
        const lens = strs.reduce((ret, str) => {
            return ret.concat(str.length);
        }, []);
        return semActs.reduce((ret, semAct) => {
            if (ret.length === 0 && semAct.name in this.handlers) {
                const code = ("code" in semAct ? semAct.code : this.externalCode[semAct.name]) || null;
                const existing = "extensions" in resultsArtifact && semAct.name in resultsArtifact.extensions;
                const extensionStorage = existing ? resultsArtifact.extensions[semAct.name] : {};
                const response = this.handlers[semAct.name].dispatch(code, ctx, extensionStorage);
                if (typeof response === 'boolean') {
                    if (!response)
                        ret.push({ type: "SemActFailure", errors: [{ type: "BooleanSemActFailure", code: code, ctx }] });
                }
                else if (typeof response === 'object' && Array.isArray(response)) {
                    if (response.length > 0)
                        ret.push({ type: "SemActFailure", errors: response });
                }
                else {
                    throw Error("unsupported response from semantic action handler: " + JSON.stringify(response));
                }
                if (!existing && Object.keys(extensionStorage).length > 0) {
                    if (!("extensions" in resultsArtifact))
                        resultsArtifact.extensions = {};
                    resultsArtifact.extensions[semAct.name] = extensionStorage;
                }
                return ret;
            }
            return ret;
        }, []);
    }
}
class EmptyTracker {
    constructor() {
        this.depth = 0;
    }
    recurse(rec) { }
    known(res) { }
    enter(term, shapeLabel) { ++this.depth; }
    exit(term, shapeLabel, res) { --this.depth; }
}
;
class ShExValidator {
    /* ShExValidator - construct an object for validating a schema.
     *
     * schema: a structure produced by a ShEx parser or equivalent.
     * options: object with controls for
     *   lax(true): boolean: whine about missing types in schema.
     *   diagnose(false): boolean: makde validate return a structure with errors.
     */
    constructor(schema, db, options = {}) {
        this.index = schema._index || indexSchema(schema);
        if (!("labelToTcs" in this.index)) // !! what is this?
            this.index.labelToTcs = {};
        this.type = "ShExValidator";
        options = options || {};
        this.options = options;
        this.known = {};
        this.schema = schema;
        this.db = db;
        // const regexModule = this.options.regexModule || require("@shexjs/eval-simple-1err");
        this.regexModule = this.options.regexModule || EvalThreadedNErr;
        /* emptyTracker - a tracker that does nothing
         */
        this.emptyTracker = new EmptyTracker();
        this.semActHandler = new SemActDispatcherImpl(options.semActs);
    }
    validateApi(shapeMap, tracker, seen) {
        return shapeMap.map(pair => {
            let time = +new Date();
            const res = this.validateRoot(ShExTerm.LdToRdfJsTerm(pair.node), pair.shape, tracker || null, seen || {}, null, null); // really tracker and seen
            time = +new Date() - time;
            return {
                node: pair.node,
                shape: pair.shape,
                status: "errors" in res ? "nonconformant" : "conformant",
                appinfo: res,
                // elapsed: time
            };
        });
    }
    validateObj(shapeMap, tracker, seen) {
        const results = shapeMap.reduce((ret, pair) => {
            const res = this.validateRoot(ShExTerm.LdToRdfJsTerm(pair.node), pair.shape, tracker || null, seen || {}, null, null); // really tracker and seen
            return "errors" in res
                ? { passes: ret.passes, failures: ret.failures.concat([res]) }
                : { passes: ret.passes.concat([res]), failures: ret.failures };
        }, { passes: [], failures: [] });
        if (results.failures.length > 0) {
            return results.failures.length !== 1
                ? { type: "FailureList", errors: results.failures }
                : results.failures[0];
        }
        else {
            return results.passes.length !== 1
                ? { type: "SolutionList", solutions: results.passes }
                : results.passes[0];
        }
    }
    validatePair(point, label, tracker, seen) {
        return this.validateRoot(point, label, tracker || null, seen || {}, null, null);
    }
    validateRoot(point, label, tracker, seen, matchTarget, subGraph) {
        const ret = this.validateShapeLabel(point, label, tracker, seen, matchTarget, subGraph);
        if ("startActs" in this.schema) {
            ret.startActs = this.schema.startActs; // TODO: figure out where startActs can appear in ShExJ
        }
        return ret;
    }
    validateShapeLabel(point, label, tracker, seen, matchTarget, subGraph) {
        // logging stuff
        if (!tracker)
            tracker = this.emptyTracker;
        if (typeof label !== "string") {
            if (label !== ShExValidator.Start)
                runtimeError(`unknown shape label ${JSON.stringify(label)}`);
            if (!this.schema.start)
                runtimeError("start production not defined");
            return this._validateShapeExpr(point, this.schema.start, label, 0, tracker, seen, matchTarget, subGraph);
        }
        const shape = this._lookupShape(label);
        const seenKey = ShExTerm.rdfJsTermToTurtle(point) + "@" + label;
        if (!subGraph) { // Don't cache base shape validations as they aren't testing the full neighborhood.
            if (seenKey in seen) {
                let ret = {
                    type: "Recursion",
                    node: ldify(point),
                    shape: label
                };
                tracker.recurse(ret);
                return ret;
            }
            if ("known" in this && seenKey in this.known) {
                const ret = this.known[seenKey];
                tracker.known(ret);
                return ret;
            }
            seen[seenKey] = { node: point, shape: label };
            tracker.enter(point, label);
        }
        const ret = this._validateDescendants(point, label, 0, tracker, seen, matchTarget, subGraph, false);
        if (!subGraph) {
            tracker.exit(point, label, ret);
            delete seen[seenKey];
            if ("known" in this)
                this.known[seenKey] = ret;
        }
        return ret;
    }
    _validateDescendants(point, shapeLabel, depth, tracker, seen, matchTarget, subGraph, allowAbstract = false) {
        const _ShExValidator = this;
        if (subGraph) { // !! matchTarget?
            // matchTarget indicates that shape substitution has already been applied.
            // Now we're testing a subgraph against the base shapes.
            const res = this._validateShapeDecl(point, this._lookupShape(shapeLabel), shapeLabel, 0, tracker, seen, matchTarget, subGraph);
            if (matchTarget && shapeLabel === matchTarget.label && !("errors" in res))
                matchTarget.count++;
            return res;
        }
        // Find all non-abstract shapeExprs extended with label. 
        let candidates = [shapeLabel];
        candidates = candidates.concat(indexExtensions(this.schema)[shapeLabel] || []);
        // Uniquify list.
        for (let i = candidates.length - 1; i >= 0; --i) {
            if (candidates.indexOf(candidates[i]) < i)
                candidates.splice(i, 1);
        }
        // Filter out abstract shapes.
        if (!allowAbstract)
            candidates = candidates.filter(l => !this._lookupShape(l).abstract);
        // Aggregate results in a SolutionList or FailureList.
        const results = candidates.reduce((ret, candidateShapeLabel) => {
            const shapeExpr = this._lookupShape(candidateShapeLabel);
            const matchTarget = candidateShapeLabel === shapeLabel ? null : { label: shapeLabel, count: 0 };
            const res = this._validateShapeDecl(point, shapeExpr, candidateShapeLabel, 0, tracker, seen, matchTarget, subGraph);
            return "errors" in res || matchTarget && matchTarget.count === 0 ?
                { passes: ret.passes, failures: ret.failures.concat(res) } :
                { passes: ret.passes.concat(res), failures: ret.failures };
        }, { passes: [], failures: [] });
        let ret;
        if (results.passes.length > 0) {
            ret = results.passes.length !== 1 ?
                { type: "SolutionList", solutions: results.passes } :
                results.passes[0];
        }
        else if (results.failures.length > 0) {
            ret = results.failures.length !== 1 ?
                { type: "FailureList", errors: results.failures } :
                results.failures[0];
        }
        else {
            ret = {
                type: "AbstractShapeFailure",
                shape: shapeLabel,
                errors: [shapeLabel + " has no non-abstract children"]
            };
        }
        return ret;
        // @TODO move to Vistior.index
        function indexExtensions(schema) {
            const abstractness = {};
            const extensions = Hierarchy.create();
            makeSchemaVisitor().visitSchema(schema);
            return extensions.children;
            function makeSchemaVisitor() {
                const schemaVisitor = new ShExVisitor();
                let curLabel;
                let curAbstract;
                const oldVisitShapeDecl = schemaVisitor.visitShapeDecl;
                schemaVisitor.visitShapeDecl = function (decl) {
                    curLabel = decl.id;
                    curAbstract = decl.abstract;
                    abstractness[decl.id] = !!decl.abstract;
                    return oldVisitShapeDecl.call(schemaVisitor, decl, decl.id);
                };
                schemaVisitor.visitShape = function (shape) {
                    if (shape.extends !== undefined) {
                        shape.extends.forEach(ext => {
                            const extendsVisitor = new ShExVisitor();
                            extendsVisitor.visitExpression = function (expr, ...args) { return "null"; };
                            extendsVisitor.visitShapeRef = function (reference, ...args) {
                                extensions.add(reference, curLabel);
                                extendsVisitor.visitShapeDecl(_ShExValidator._lookupShape(reference));
                                // makeSchemaVisitor().visitSchema(schema);
                                return "null";
                            };
                            extendsVisitor.visitShapeExpr(ext);
                        });
                    }
                    return "null";
                };
                return schemaVisitor;
            }
        }
    }
    _validateShapeDecl(point, shapeDecl, shapeLabel, depth, tracker, seen, matchTarget, subGraph) {
        const conjuncts = (shapeDecl.restricts || []).concat([shapeDecl.shapeExpr]);
        const expr = conjuncts.length === 1
            ? conjuncts[0]
            : { type: "ShapeAnd", shapeExprs: conjuncts };
        return this._validateShapeExpr(point, expr, shapeLabel, depth, tracker, seen, matchTarget, subGraph);
    }
    _lookupShape(label) {
        const shapes = this.schema.shapes;
        if (shapes === undefined) {
            runtimeError("shape " + label + " not found; no shapes in schema");
        }
        else if (label in this.index.shapeExprs) {
            return this.index.shapeExprs[label];
        }
        runtimeError("shape " + label + " not found in:\n" + Object.keys(this.index.shapeExprs || []).map(s => "  " + s).join("\n"));
    }
    _validateShapeExpr(point, shapeExpr, shapeLabel, depth, tracker, seen, matchTarget, subGraph) {
        if (typeof shapeExpr === "string") // ShapeRef
            return this.validateShapeLabel(point, shapeExpr, tracker, seen, matchTarget, subGraph);
        switch (shapeExpr.type) {
            case "NodeConstraint":
                const ncErrors = this._errorsMatchingNodeConstraint(point, shapeExpr);
                const ncRet = Object.assign({}, {
                    type: null,
                    node: ldify(point)
                }, (shapeLabel ? { shape: shapeLabel } : {}), { shapeExpr });
                Object.assign(ncRet, ncErrors.length > 0
                    ? { type: "NodeConstraintViolation", errors: ncErrors }
                    : { type: "NodeConstraintTest", });
                return this.evaluateShapeExprSemActs(ncRet, shapeExpr, point, shapeLabel);
                break;
            case "Shape":
                return this._validateShape(point, shapeExpr, shapeLabel, depth, tracker, seen, matchTarget, subGraph);
                break;
            case "ShapeExternal":
                if (typeof this.options.validateExtern !== "function")
                    throw runtimeError(`validating ${ShExTerm.internalTermToTurtle(point)} as EXTERNAL shapeExpr ${shapeLabel} requires a 'validateExtern' option`);
                return this.options.validateExtern(point, shapeLabel, tracker, seen);
                break;
            case "ShapeOr":
                const orErrors = [];
                for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
                    const nested = shapeExpr.shapeExprs[i];
                    const sub = this._validateShapeExpr(point, nested, shapeLabel, depth, tracker, seen, matchTarget, subGraph);
                    if ("errors" in sub)
                        orErrors.push(sub);
                    else if (!matchTarget || matchTarget.count > 0)
                        return { type: "ShapeOrResults", solution: sub };
                }
                return { type: "ShapeOrFailure", errors: orErrors };
                break;
            case "ShapeNot":
                const sub = this._validateShapeExpr(point, shapeExpr.shapeExpr, shapeLabel, depth, tracker, seen, matchTarget, subGraph);
                return ("errors" in sub)
                    ? { type: "ShapeNotResults", solution: sub }
                    : { type: "ShapeNotFailure", errors: sub }; // ugh
            case "ShapeAnd":
                const andPasses = [];
                const andErrors = [];
                for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
                    const nested = shapeExpr.shapeExprs[i];
                    const sub = this._validateShapeExpr(point, nested, shapeLabel, depth, tracker, seen, matchTarget, subGraph);
                    if ("errors" in sub)
                        andErrors.push(sub);
                    else
                        andPasses.push(sub);
                }
                return andErrors.length > 0
                    ? { type: "ShapeAndFailure", errors: andErrors }
                    : { type: "ShapeAndResults", solutions: andPasses };
            default:
                throw Error("expected one of Shape{Ref,And,Or} or NodeConstraint, got " + JSON.stringify(shapeExpr));
        }
    }
    evaluateShapeExprSemActs(ret, shapeExpr, point, shapeLabel) {
        if (!("errors" in ret) && shapeExpr.semActs !== undefined) {
            const semActErrors = this.semActHandler.dispatchAll(shapeExpr.semActs, Object.assign({ node: point }, ret), ret);
            if (semActErrors.length)
                // some semAct aborted
                return { type: "Failure", node: ldify(point), shape: shapeLabel, errors: semActErrors };
        }
        return ret;
    }
    _validateShape(point, shape, shapeLabel, depth, tracker, seen, matchTarget, subGraph) {
        const valParms = { db: this.db, shapeLabel, depth, tracker, seen };
        let ret = null;
        const startAcionStorage = {}; // !!! need test to see this write to results structure.
        if ("startActs" in this.schema) {
            const semActErrors = this.semActHandler.dispatchAll(this.schema.startActs, null, startAcionStorage);
            if (semActErrors.length)
                return {
                    type: "Failure",
                    node: ldify(point),
                    shape: shapeLabel,
                    errors: semActErrors
                }; // some semAct aborted !! return a better error
        }
        const fromDB = (subGraph || this.db).getNeighborhood(point, shapeLabel, shape);
        const outgoingLength = fromDB.outgoing.length;
        const neighborhood = fromDB.outgoing.sort((l, r) => l.predicate.value.localeCompare(r.predicate.value) || sparqlOrder(l.object, r.object)).concat(fromDB.incoming.sort((l, r) => l.predicate.value.localeCompare(r.predicate.value) || sparqlOrder(l.object, r.object)));
        const { extendsTCs, tc2exts, localTCs } = this.TripleConstraintsVisitor(this.index.labelToTcs).getAllTripleConstraints(shape);
        const constraintList = extendsTCs.concat(localTCs);
        // neighborhood already integrates subGraph so don't pass to _errorsMatchingShapeExpr
        const tripleList = this.matchByPredicate(constraintList, neighborhood, outgoingLength, point, valParms, matchTarget);
        const { misses, extras } = this.whatsMissing(tripleList, neighborhood, outgoingLength, shape.extra || []);
        const allT2TCs = new TripleToTripleConstraints(tripleList.constraintList, extendsTCs.length, tc2exts);
        const partitionErrors = [];
        const regexEngine = this.regexModule.compile(this.schema, shape, this.index);
        for (let t2tc = allT2TCs.next(); t2tc !== null && ret === null; t2tc = allT2TCs.next()) {
            const localT2Tc = []; // subset of TCs assigned to shape.expression
            const unexpectedOrds = [];
            const extendsToTriples = _seq((shape.extends || []).length).map(() => []);
            t2tc.forEach((cNo, tNo) => {
                if (cNo !== eval_validator_api_1.NoTripleConstraint && cNo < extendsTCs.length) {
                    // allocate to EXTENDS
                    for (let extNo of tc2exts[cNo]) {
                        // allocated to multiple extends if diamond inheritance
                        extendsToTriples[extNo].push(neighborhood[tNo]);
                        localT2Tc[tNo] = eval_validator_api_1.NoTripleConstraint;
                    }
                }
                else {
                    // allocate to local shape
                    localT2Tc[tNo] = cNo;
                    if (cNo === eval_validator_api_1.NoTripleConstraint // didn't match anything
                        && tNo < outgoingLength // is an outgoing triple
                        && extras.indexOf(tNo) === -1) // isn't in EXTRAs
                        unexpectedOrds.push(tNo);
                }
            });
            const errors = [];
            const usedTriples = []; // [{s1,p1,o1},{s2,p2,o2}] implicated triples -- used for messages
            const constraintMatchCount = // [2,1,0,1] how many triples matched a constraint
             _seq(neighborhood.length).map(function () { return 0; });
            // Triples not mapped to triple constraints are not allowed in closed shapes.
            if (shape.closed && unexpectedOrds.length > 0) {
                errors.push({
                    type: "ClosedShapeViolation",
                    unexpectedTriples: unexpectedOrds.map(tNo => {
                        const q = neighborhood[tNo];
                        return {
                            subject: ldify(q.subject),
                            predicate: ldify(q.predicate),
                            object: ldify(q.object),
                        };
                    })
                });
            }
            // Set usedTriples and constraintMatchCount.
            localT2Tc.forEach(function (tpNumber, ord) {
                if (tpNumber !== eval_validator_api_1.NoTripleConstraint) {
                    usedTriples.push(neighborhood[ord]);
                    ++constraintMatchCount[tpNumber];
                }
            });
            const tc2t = this._constraintToTriples(localT2Tc, constraintList, tripleList); // e.g. [[t0, t2], [t1, t3]]
            let results = this.testExtends(shape, point, extendsToTriples, valParms, matchTarget);
            if (results === null || !("errors" in results)) {
                const sub = regexEngine.match(this.db, point, constraintList, tc2t, localT2Tc, neighborhood, this.semActHandler, null);
                if (!("errors" in sub) && results) {
                    // @ts-ignore
                    results = { type: "ExtendedResults", extensions: results };
                    if (Object.keys(sub).length > 0) // no empty objects from {}s.
                     { // @ts-ignore
                        results.local = sub;
                    }
                }
                else {
                    // @ts-ignore
                    results = sub;
                }
            }
            if (results !== null && results.errors !== undefined) { // @ts-ignore
                [].push.apply(errors, results.errors);
            }
            const possibleRet = { type: "ShapeTest", node: ldify(point), shape: shapeLabel };
            // @ts-ignore
            if (errors.length === 0 && Object.keys(results).length > 0) // only include .solution for non-empty pattern
             { // @ts-ignore
                possibleRet.solution = results;
            }
            if ("semActs" in shape) {
                const semActErrors = this.semActHandler.dispatchAll(shape.semActs, Object.assign({ node: point }, results), possibleRet);
                if (semActErrors.length) 
                // some semAct aborted
                { // @ts-ignore
                    [].push.apply(errors, semActErrors);
                }
            }
            partitionErrors.push(errors);
            if (errors.length === 0)
                ret = possibleRet;
        }
        // end of while(xp.next())
        const missErrors = misses.map(function (miss) {
            const t = neighborhood[miss.tripleNo];
            return {
                type: "TypeMismatch",
                triple: { type: "TestedTriple", subject: ldify(t.subject), predicate: ldify(t.predicate), object: ldify(t.object) },
                constraint: constraintList[miss.constraintNo],
                errors: miss.errors
            };
        });
        // Report only last errors until we have a better idea.
        const lastErrors = partitionErrors[partitionErrors.length - 1];
        // @ts-ignore
        let errors = missErrors.concat(lastErrors.length === 1 ? lastErrors[0] : lastErrors);
        if (errors.length > 0)
            ret = {
                type: "Failure",
                node: ldify(point),
                shape: shapeLabel,
                errors: errors
            };
        // remove N3jsTripleToString
        if (VERBOSE)
            neighborhood.forEach(function (t) {
                // @ts-ignore
                delete t.toString;
            });
        // @ts-ignore
        return this.addShapeAttributes(shape, ret);
    }
    /*
      function DBG_matchValues (fromDB, constraintList) {
        const expectedValues = constraintList.map(
          tc => parseInt((tc.valueExpr?.values || [{value:999}])[0].value)
        );
        const tripleValues = fromDB.outgoing.map(
          t => parseInt(t.object.substr(1))
        );
        return tripleValues.map(
          i => expectedValues.indexOf(i)
        );
      }
    
      function DBG_gonnaMatch (t2tcForThisShapeAndExtends, fromDB, constraintList) {
        const solution = DBG_matchValues (fromDB, constraintList);
        return JSON.stringify(t2tcForThisShapeAndExtends) === JSON.stringify(solution);
      }
    */
    matchByPredicate(constraintList, neighborhood, outgoingLength, point, valParms, matchTarget) {
        const _ShExValidator = this;
        const outgoing = indexNeighborhood(neighborhood.slice(0, outgoingLength));
        const incoming = indexNeighborhood(neighborhood.slice(outgoingLength));
        const init = { misses: {}, results: _alist(constraintList.length), constraintList: _alist(neighborhood.length) };
        return constraintList.reduce(function (ret, constraint, cNo) {
            // subject and object depend on direction of constraint.
            const index = constraint.inverse ? incoming : outgoing;
            // get triples matching predciate
            const matchPredicate = index.byPredicate.get(constraint.predicate) ||
                []; // empty list when no triple matches that constraint
            // strip to triples matching value constraints (apart from @<someShape>)
            const matchConstraints = _ShExValidator._triplesMatchingShapeExpr(matchPredicate, constraint, valParms, matchTarget);
            matchConstraints.hits.forEach(function (evidence) {
                const tNo = neighborhood.indexOf(evidence.triple);
                ret.constraintList[tNo].push(cNo);
                ret.results[cNo][tNo] = evidence.sub;
            });
            matchConstraints.misses.forEach(function (evidence) {
                const tNo = neighborhood.indexOf(evidence.triple);
                ret.misses[tNo] = { constraintNo: cNo, errors: evidence.errors };
            });
            return ret;
        }, init);
    }
    whatsMissing(tripleList, neighborhood, outgoingLength, extras) {
        const matchedExtras = []; // triples accounted for by EXTRA
        const misses = tripleList.constraintList.reduce(function (ret, constraints, ord) {
            if (constraints.length === 0 && // matches no constraints
                ord < outgoingLength && // not an incoming triple
                ord in tripleList.misses) { // predicate matched some constraint(s)
                if (extras.indexOf(neighborhood[ord].predicate.value) !== -1) {
                    matchedExtras.push(ord);
                }
                else { // not declared extra
                    ret.push({
                        tripleNo: ord,
                        constraintNo: tripleList.misses[ord].constraintNo,
                        errors: tripleList.misses[ord].errors
                    });
                }
            }
            return ret;
        }, []);
        return { misses, extras: matchedExtras };
    }
    addShapeAttributes(shape, ret) {
        if (shape.annotations !== undefined) { // @ts-ignore
            ret.annotations = shape.annotations;
        }
        return ret;
    }
    // Pivot to triples by constraint.
    _constraintToTriples(t2tc, constraintList, tripleList) {
        return t2tc.slice().
            reduce(function (ret, cNo, tNo) {
            if (cNo !== eval_validator_api_1.NoTripleConstraint)
                ret[cNo].push({ tNo: tNo, res: tripleList.results[cNo][tNo] });
            return ret;
        }, _seq(constraintList.length).map(() => [])); // [length][]
    }
    testExtends(expr, point, extendsToTriples, valParms, matchTarget) {
        if (expr.extends === undefined)
            return null;
        const passes = [];
        const errors = [];
        for (let eNo = 0; eNo < expr.extends.length; ++eNo) {
            const extend = expr.extends[eNo];
            const subgraph = this.makeTriplesDB(null); // These triples were tracked earlier.
            extendsToTriples[eNo].forEach(t => subgraph.addOutgoingTriples([t]));
            const sub = this._validateShapeExpr(point, extend, valParms.shapeLabel, valParms.depth, valParms.tracker, valParms.seen, matchTarget, subgraph);
            if ("errors" in sub)
                errors.push(sub);
            else
                passes.push(sub);
        }
        if (errors.length > 0) {
            return { type: "ExtensionFailure", errors: errors };
        }
        return { type: "ExtensionResults", solutions: passes };
    }
    /** Directly construct a DB from triples.
     * TODO: should this be in @shexjs/neighborhood-something ?
     */
    makeTriplesDB(queryTracker) {
        const incoming = [];
        const outgoing = [];
        function getTriplesByIRI(s, p, o, g) {
            return incoming.concat(outgoing).filter(t => (!s || s === t.subject) &&
                (!p || p === t.predicate) &&
                (!s || s === t.object));
        }
        function getNeighborhood(point, shapeLabel, shape) {
            return {
                outgoing: outgoing,
                incoming: incoming
            };
        }
        return {
            getNeighborhood: getNeighborhood,
            getTriplesByIRI: getTriplesByIRI,
            getSubjects: function () { throw Error("!Triples DB can't index subjects"); },
            getPredicates: function () { throw Error("!Triples DB can't index predicates"); },
            getObjects: function () { throw Error("!Triples DB can't index objects"); },
            getQuads: function () { throw Error("!Triples DB doesn't have Quads"); },
            get size() { return incoming.length + outgoing.length; },
            addIncomingTriples: function (tz) { Array.prototype.push.apply(incoming, tz); },
            addOutgoingTriples: function (tz) { Array.prototype.push.apply(outgoing, tz); }
        };
    }
    /** TripleConstraintsVisitor - walk shape's extends to get all
     * referenced triple constraints.
     *
     * @param {} labelToTcs: Map<shapeLabel, TripleConstraint[]>
     * @returns { extendsTCs: [[TripleConstraint]], localTCs: [TripleConstraint] }
     */
    TripleConstraintsVisitor(labelToTcs) {
        const _ShExValidator = this;
        const visitor = new ShExVisitor(labelToTcs);
        function emptyShapeExpr() { return []; }
        visitor.visitShapeDecl = function (decl, min, max) {
            // if (labelToTcs.has(decl.id)) !! uncomment cache for production
            //   return labelToTcs[decl.id];
            const tcs = decl.shapeExpr
                ? visitor.visitShapeExpr(decl.shapeExpr, 1, 1)
                : emptyShapeExpr();
            labelToTcs[decl.id] = tcs;
            return [{ type: "Ref", ref: decl.id }];
        };
        visitor.visitShapeOr = function (shapeExpr, min, max) {
            return shapeExpr.shapeExprs.reduce((acc, disjunct) => acc.concat(this.visitShapeExpr(disjunct, 0, max)), emptyShapeExpr());
        };
        visitor.visitShapeAnd = function (shapeExpr, min, max) {
            const seen = new Set();
            return shapeExpr.shapeExprs.reduce((acc, disjunct) => {
                this.visitShapeExpr(disjunct, min, max).forEach((tc) => {
                    const key = `${tc.min} ${tc.max} ${tc.predicate}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        acc.push(tc);
                    }
                });
                // @@ TODO: calculate intersection with acc
                return acc;
            }, []);
        };
        visitor.visitShapeNot = function (expr, min, max) {
            throw 1;
        };
        visitor.visitShapeExternal = emptyShapeExpr;
        visitor.visitNodeConstraint = emptyShapeExpr;
        // Override visitShapeRef to follow references.
        // tests: Extend3G-pass, vitals-RESTRICTS-pass_lie-Vital...
        visitor.visitShapeRef = function (shapeLabel, min, max) {
            return visitor.visitShapeDecl(_ShExValidator._lookupShape(shapeLabel), min, max);
        };
        visitor.visitShape = function (shape, min, max) {
            const { extendsTCs, localTCs } = shapePieces(shape, min, max);
            return extendsTCs.flat().concat(localTCs);
        };
        // Visit shape's EXTENDS and expression.
        function shapePieces(shape, min, max) {
            const extendsTCs = shape.extends !== undefined
                ? shape.extends.map(ext => visitor.visitShapeExpr(ext, min, max))
                : [];
            const localTCs = "expression" in shape
                ? visitor.visitExpression(shape.expression, min, max)
                : [];
            return { extendsTCs, localTCs };
        }
        function getAllTripleConstraints(shape) {
            const { extendsTCs: extendsTcOrRefsz, localTCs } = shapePieces(shape, 1, 1);
            const tcs = [];
            const tc2exts = [];
            extendsTcOrRefsz.map((tcOrRefs, ord) => flattenExtends(tcOrRefs, ord));
            return { extendsTCs: tcs, tc2exts, localTCs };
            function flattenExtends(tcOrRefs, ord) {
                return tcOrRefs.forEach(tcOrRef => {
                    if (tcOrRef.type === "TripleConstraint") {
                        add(tcOrRef); // as TC
                    }
                    else {
                        flattenExtends(labelToTcs[tcOrRef.ref], ord);
                    }
                });
                function add(tc) {
                    const idx = tcs.indexOf(tc);
                    if (idx === -1) {
                        // new TC
                        tcs.push(tc);
                        tc2exts.push([ord]);
                    }
                    else {
                        // ref to TC already seen in this or earlier EXTENDS
                        if (tc2exts[idx].indexOf(ord) === -1) {
                            // not yet included in this EXTENDS
                            tc2exts[idx].push(ord);
                        }
                    }
                }
            }
        }
        // tripleExprs return list of TripleConstraints
        function n(l, expr) {
            if (expr.min === undefined)
                return l;
            return l * expr.min;
        }
        function x(l, expr) {
            if (expr.max === undefined)
                return l;
            if (l === -1 || expr.max === -1)
                return -1;
            return l * expr.max;
        }
        function and(tes) {
            // @ts-ignore
            return [].concat.apply([], tes);
        }
        // Any TC inside a OneOf implicitly has a min cardinality of 0.
        visitor.visitOneOf = function (expr, outerMin, outerMax) {
            return and(expr.expressions.map(nested => visitor.visitTripleExpr(nested, 0, x(outerMax, expr))));
        };
        visitor.visitEachOf = function (expr, outerMin, outerMax) {
            return and(expr.expressions.map(nested => visitor.visitTripleExpr(nested, n(outerMin, expr), x(outerMax, expr))));
        };
        visitor.visitInclusion = function (inclusion, outerMin, outerMax) {
            return visitor.visitTripleExpr(_ShExValidator.index.tripleExprs[inclusion], outerMin, outerMax);
        };
        // Synthesize a TripleConstraint with the implicit cardinality.
        visitor.visitTripleConstraint = function (expr, outerMin, outerMax) {
            return [expr];
            /* eval-threaded-n-err counts on constraintList.indexOf(expr) so we can't optimize with:
               const ret = JSON.parse(JSON.stringify(expr));
               ret.min = n(outerMin, expr);
               ret.max = x(outerMax, expr);
               return [ret];
            */
        };
        return { getAllTripleConstraints };
    }
    _triplesMatchingShapeExpr(triples, constraint, valParms, matchTarget) {
        const _ShExValidator = this;
        const misses = [];
        const hits = [];
        triples.forEach(function (triple) {
            const value = constraint.inverse ? triple.subject : triple.object;
            let sub;
            const oldBindings = JSON.parse(JSON.stringify(_ShExValidator.semActHandler.results));
            if (constraint.valueExpr === undefined)
                hits.push({ triple, sub: undefined });
            else {
                const sub = _ShExValidator._validateShapeExpr(value, constraint.valueExpr, valParms.shapeLabel, valParms.depth, valParms.tracker, valParms.seen, matchTarget, null);
                if (sub.errors === undefined) {
                    hits.push({ triple: triple, sub: sub });
                }
                else /* !! if (!hits.find(h => h.triple === triple)) */ {
                    _ShExValidator.semActHandler.results = JSON.parse(JSON.stringify(oldBindings));
                    misses.push({ triple: triple, errors: sub });
                }
            }
        });
        return { hits: hits, misses: misses };
    }
    /* _errorsMatchingNodeConstraint - return whether the value matches the value
     * expression without checking shape references.
     */
    _errorsMatchingNodeConstraint(value, valueExpr) {
        const errors = [];
        function validationError(...s) {
            const errorStr = Array.prototype.join.call(s, "");
            errors.push("Error validating " + ShExTerm.rdfJsTermToTurtle(value) + " as " + JSON.stringify(valueExpr) + ": " + errorStr);
            return false;
        }
        if (valueExpr.nodeKind !== undefined) {
            if (["iri", "bnode", "literal", "nonliteral"].indexOf(valueExpr.nodeKind) === -1) {
                validationError(`unknown node kind '${valueExpr.nodeKind}'`);
            }
            if (ShExTerm.isBlank(value)) {
                if (valueExpr.nodeKind === "iri" || valueExpr.nodeKind === "literal") {
                    validationError(`blank node found when ${valueExpr.nodeKind} expected`);
                }
            }
            else if (ShExTerm.isLiteral(value)) {
                if (valueExpr.nodeKind !== "literal") {
                    validationError(`literal found when ${valueExpr.nodeKind} expected`);
                }
            }
            else if (valueExpr.nodeKind === "bnode" || valueExpr.nodeKind === "literal") {
                validationError(`iri found when ${valueExpr.nodeKind} expected`);
            }
        }
        if (valueExpr.datatype && valueExpr.values)
            validationError("found both datatype and values in " + valueExpr);
        if (valueExpr.values !== undefined) {
            if (!valueExpr.values.some(valueSetValue => testValueSetValue(valueSetValue, value))) {
                validationError(`value ${(value.value)} not found in set ${JSON.stringify(valueExpr.values)}`);
            }
        }
        const numeric = (0, shex_xsd_1.getNumericDatatype)(value);
        if (valueExpr.datatype !== undefined) {
            (0, shex_xsd_1.testKnownTypes)(value, validationError, ldify, valueExpr.datatype, numeric, value.value);
        }
        (0, shex_xsd_1.testFacets)(valueExpr, value.value, validationError, numeric);
        return errors; // validateShapeExpr creates a ShExV result, but it could go down here.
    }
}
exports.ShExValidator = ShExValidator;
ShExValidator.Start = neighborhood_api_1.Start;
ShExValidator.InterfaceOptions = exports.InterfaceOptions;
function testLanguageStem(typedValue, stem) {
    const trail = typedValue.substring(stem.length);
    return (typedValue !== "" && typedValue.startsWith(stem) && (stem === "" || trail === "" || trail[0] === "-"));
}
function valueInExclusions(exclusions, value) {
    return exclusions.some(exclusion => {
        if (typeof exclusion === "string") { // Iri
            return (value === exclusion);
        }
        else if (typeof exclusion === "object" // Literal
            && exclusion.type !== undefined
            && !exclusion.type.match(/^(?:Iri|Literal|Language)(?:Stem(?:Range)?)?$/)) {
            return (value === exclusion.value);
        }
        else {
            const valueConstraint = exclusion;
            switch (valueConstraint.type) {
                // "Iri" covered above
                case "IriStem":
                    return (value.startsWith(valueConstraint.stem));
                // "Literal" covered above
                case "LiteralStem":
                    return (value.startsWith(valueConstraint.stem));
                case "Language":
                    return (value === valueConstraint.languageTag);
                case "LanguageStem":
                    return testLanguageStem(value, valueConstraint.stem);
            }
        }
        return false;
    });
}
function testValueSetValue(valueSetValueP, value) {
    if (typeof valueSetValueP === "string") { // Iri
        return (value.termType === "NamedNode" && value.value === valueSetValueP);
    }
    else if (typeof valueSetValueP === "object" // Literal
        && (valueSetValueP.type === undefined
            || !valueSetValueP.type.match(/^(?:Iri|Literal|Language)(?:Stem(?:Range)?)?$/))) {
        if (value.termType !== "Literal") {
            return false;
        }
        else {
            const vsValueLiteral = valueSetValueP;
            const valLiteral = value;
            return (value.value === vsValueLiteral.value
                && (vsValueLiteral.language === undefined || vsValueLiteral.language === valLiteral.language)
                && (vsValueLiteral.type === undefined || vsValueLiteral.type === valLiteral.datatype.value));
        }
    }
    else {
        // Do a little dance to rule out ObjectLiteral and IRIREF
        const valueSetValue = valueSetValueP;
        switch (valueSetValue.type) {
            // "Iri" covered above
            case "IriStem":
                if (value.termType !== "NamedNode")
                    return false;
                return (value.value.startsWith(valueSetValue.stem));
            case "IriStemRange":
                if (value.termType !== "NamedNode")
                    return false;
                if (typeof valueSetValue.stem === "string" && !value.value.startsWith(valueSetValue.stem))
                    return false;
                return (!valueInExclusions(valueSetValue.exclusions, value.value));
            // "Literal" covered above
            case "LiteralStem":
                if (value.termType !== "Literal")
                    return false;
                return (value.value.startsWith(valueSetValue.stem));
            case "LiteralStemRange":
                if (value.termType !== "Literal")
                    return false;
                if (typeof valueSetValue.stem === "string" && !value.value.startsWith(valueSetValue.stem))
                    return false;
                return (!valueInExclusions(valueSetValue.exclusions, value.value));
            case "Language":
                if (value.termType !== "Literal")
                    return false;
                return (value.language === valueSetValue.languageTag);
            case "LanguageStem":
                if (value.termType !== "Literal")
                    return false;
                return testLanguageStem(value.language, valueSetValue.stem);
            case "LanguageStemRange":
                if (value.termType !== "Literal")
                    return false;
                if (typeof valueSetValue.stem === "string" && !testLanguageStem(value.language, valueSetValue.stem))
                    return false;
                return (!valueInExclusions(valueSetValue.exclusions, value.language));
        }
    }
}
/** Explore permutations of mapping from Triples to TripleConstraints
 * documented using test ExtendsRepeatedP-pass
 */
class TripleToTripleConstraints {
    /**
     *
     * @param constraintList mapping from Triple to possible TripleConstraints, e.g. [
     *      [0,2,4], # try T0 against TC0, TC2, TC4
     *      [0,2,4], # try T1 against same
     *      [0,2,4], # try T2 against same
     *      [1,3]    # try T3 against TC1, TC3
     *   ]
     * @param extendsTCcount how many TCs are in EXTENDS,
     *   e.g. 4 says that TCs 0-3 are assigned to some EXTENDS; only TC4 is "local".
     * @param tc2exts which TripleConstraints came from which EXTENDS, e.g. [
     *     [0], # TC0 is assignable to EXTENDS 0
     *     [0], # TC1 is assignable to EXTENDS 0
     *     [0], # TC2 is assignable to EXTENDS 0
     *     [0], # TC3 is assignable to EXTENDS 0
     *   ]
     */
    constructor(constraintList, extendsTCcount, tc2exts) {
        this.extendsTCcount = extendsTCcount;
        this.tc2exts = tc2exts;
        this.subgraphCache = new Map();
        // @ts-ignore
        this.crossProduct = CrossProduct(constraintList, eval_validator_api_1.NoTripleConstraint);
    }
    /**
     * Find next mapping of Triples to TripleConstraints.
     * Exclude any that differ only in an irrelevent order difference in assinment to EXTENDS.
     * @returns {number[] | null}
     */
    next() {
        while (this.crossProduct.next()) {
            /* t2tc - array mapping neighborhood index to TripleConstraint
             * CrossProduct counts through constraintList from the right:
             *   [ 0, 0, 0, 1 ] # first call
             *   [ 0, 0, 0, 3 ] # second call
             *   [ 0, 0, 2, 1 ] # third call
             *   [ 0, 0, 2, 3 ] # fourth call
             *   [ 0, 0, 4, 1 ] # fifth call
             *   [ 0, 2, 0, 1 ] # sixth call...
             */
            const t2tc = this.crossProduct.get(); // [0,1,0,3] mapping from triple to constraint
            // if (DBG_gonnaMatch (t2tc, fromDB, constraintList)) debugger;
            /* If this permutation repeats the same assignments to EXTENDS parents, continue to next permutation.
               Test extends-abstract-multi-empty_fail-Ref1ExtraP includes e.g. "_-L4-E0-E0-E0-_" from:
               t2tc: [ NoTripleConstraint, 4, 2, 1, 3, NoTripleConstraint ]
               tc2exts: [[0], [0], [0], [0]] (All four TCs assignable to first EXTENDS.)
            */
            const subgraphKey = t2tc.map(cNo => cNo === eval_validator_api_1.NoTripleConstraint
                ? '_'
                : cNo < this.extendsTCcount
                    ? '' + this.tc2exts[cNo].map(eNo => 'E' + eNo)
                    : 'L' + cNo).join('-');
            if (!this.subgraphCache.has(subgraphKey)) {
                this.subgraphCache.set(subgraphKey, true);
                return t2tc;
            }
        }
        return null;
    }
}
// { next: () => (boolean); get: () => number[] | null }
// http://stackoverflow.com/questions/9422386/lazy-cartesian-product-of-arrays-arbitrary-nested-loops
function CrossProduct(sets, emptyValue) {
    const n = sets.length, carets = [];
    let args = null;
    function init() {
        args = [];
        for (let i = 0; i < n; i++) {
            carets[i] = 0;
            args[i] = sets[i].length > 0 ? sets[i][0] : emptyValue;
        }
    }
    function next() {
        // special case: crossProduct([]).next().next() returns false.
        if (args !== null && args.length === 0)
            return false;
        if (args === null) {
            init();
            return true;
        }
        let i = n - 1;
        carets[i]++;
        if (carets[i] < sets[i].length) {
            args[i] = sets[i][carets[i]];
            return true;
        }
        while (carets[i] >= sets[i].length) {
            if (i === 0) {
                return false;
            }
            carets[i] = 0;
            args[i] = sets[i].length > 0 ? sets[i][0] : emptyValue;
            carets[--i]++;
        }
        args[i] = sets[i][carets[i]];
        return true;
    }
    return {
        next: next,
        // do: function (block, _context) { // old API
        //   return block.apply(_context, args);
        // },
        // new API because
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments#Description
        // cautions about functions over arguments.
        get: function () { return args; }
    };
}
/* N3jsTripleToString - simple toString function to make N3.js's triples
 * printable.
 */
const N3jsTripleToString = function () {
    function fmt(n) {
        return ShExTerm.isLiteral(n) ?
            ["http://www.w3.org/2001/XMLSchema#integer",
                "http://www.w3.org/2001/XMLSchema#float",
                "http://www.w3.org/2001/XMLSchema#double"
            ].indexOf(ShExTerm.getLiteralType(n)) !== -1 ?
                parseInt(ShExTerm.getLiteralValue(n)) :
                n :
            ShExTerm.isBlank(n) ?
                n :
                "<" + n + ">";
    }
    // @ts-ignore
    return fmt(this.subject) + " " + fmt(this.predicate) + " " + fmt(this.object) + " .";
};
/* indexNeighborhood - index triples by predicate
 * returns: {
 *     byPredicate: Object: mapping from predicate to triples containing that
 *                  predicate.
 *
 *     candidates: [[1,3], [0,2]]: mapping from triple to the triple constraints
 *                 it matches.  It is initialized to []. Mappings that remain an
 *                 empty set indicate a triple which didn't matching anything in
 *                 the shape.
 *
 *     misses: list to recieve value constraint failures.
 *   }
 */
function indexNeighborhood(triples) {
    return {
        byPredicate: triples.reduce(function (ret, t) {
            const p = t.predicate.value;
            if (!ret.has(p))
                ret.set(p, []);
            ret.get(p).push(t);
            // If in VERBOSE mode, add a nice toString to N3.js's triple objects.
            if (VERBOSE)
                t.toString = N3jsTripleToString;
            return ret;
        }, new Map()),
        candidates: _seq(triples.length).map(function () {
            return [];
        }),
        misses: []
    };
}
/* sparqlOrder - sort triples by subject following SPARQL partial ordering.
 */
function sparqlOrder(l, r) {
    const [lprec, rprec] = [l, r].map(x => ShExTerm.isBlank(x) ? 1 : ShExTerm.isLiteral(x) ? 2 : 3);
    return lprec === rprec ? l.value.localeCompare(r.value) : lprec - rprec;
}
/* Return a list of n `undefined`s.
 *
 * Note that Array(n) on its own returns a "sparse array" so Array(n).map(f)
 * never calls f.
 */
function _seq(n) {
    return Array.from(Array(n)); // hahaha, javascript, you suck.
}
function noop() { }
function runtimeError(...args) {
    const errorStr = args.join("");
    const e = new Error(errorStr);
    Error.captureStackTrace(e, runtimeError);
    throw e;
}
function _alist(len) {
    return _seq(len).map(() => []);
}
//# sourceMappingURL=shex-validator.js.map