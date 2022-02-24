import * as N3 from 'n3';
import * as ShExJ from 'shexj';

export = shexjs__util;

declare function shexjs__util(parent: any, toPrototype: any): any;

declare namespace shexjs__util {

    const RDF: {
        first: string;
        nil: string;
        rest: string;
        type: string;
    };

    const SX: {
        "@context": string;
        Annotation: string;
        EachOf: string;
        Inclusion: string;
        IriStem: string;
        IriStemRange: string;
        Language: string;
        LanguageStem: string;
        LanguageStemRange: string;
        LiteralStem: string;
        LiteralStemRange: string;
        NodeConstraint: string;
        OneOf: string;
        Schema: string;
        SemAct: string;
        Shape: string;
        ShapeAnd: string;
        ShapeDecl: string;
        ShapeExternal: string;
        ShapeNot: string;
        ShapeOr: string;
        ShapeRef: string;
        TripleConstraint: string;
        Wildcard: string;
        abstract: string;
        annotation: string;
        bnode: string;
        closed: string;
        code: string;
        datatype: string;
        exclusion: string;
        expression: string;
        expressions: string;
        extends: string;
        extra: string;
        flags: string;
        fractiondigits: string;
        imports: string;
        include: string;
        inverse: string;
        iri: string;
        languageTag: string;
        length: string;
        literal: string;
        max: string;
        maxexclusive: string;
        maxinclusive: string;
        maxlength: string;
        min: string;
        minexclusive: string;
        mininclusive: string;
        minlength: string;
        name: string;
        negated: string;
        nodeKind: string;
        nonliteral: string;
        object: string;
        pattern: string;
        predicate: string;
        reference: string;
        restricts: string;
        semActs: string;
        shapeExpr: string;
        shapeExprs: string;
        shapes: string;
        start: string;
        startActs: string;
        stem: string;
        totaldigits: string;
        valueExpr: string;
        values: string;
    };

    function version(): any;
    function Visitor(...args: any[]): any;
    function index(schema: any): any;
    function getAST(schema: any): any;
    function ShExJtoAS(schema: any): any;
    function AStoShExJ(schema: any, abbreviate: any): any;
    function ShExRVisitor(knownShapeExprs: any): any;
    function ShExRtoShExJ(schema: any): any;
    function valGrep(obj: any, type: any, f: any): any;
    function valToN3js(res: any, factory: any): any;
    function n3jsToTurtle(n3js: any): any;
    function canonicalize(schema: any, trimIRI: any): any;
    function BiDiClosure(): any;
    function nestShapes(schema: any, options: any): any;
    function getPredicateUsage(schema: any, untyped: any): any;
    function simpleTripleConstraints(shape: any): any;
    function getValueType(valueExpr: any): any;
    function getDependencies(schema: any, ret: any): any;
    function partition(schema: any, includes: any, deps: any, cantFind: any): any;
    function flatten(schema: any, deps: any, cantFind: any): any;
    function emptySchema(): any;
    function merge(left: any, right: any, overwrite: any, inPlace: any): any;
    function absolutizeResults(parsed: any, base: any): any;
    function getProofGraph(res: any, db: any, dataFactory: any): any;
    function validateSchema(schema: any): any;
    function isWellDefined(schema: any): any;
    function walkVal(val: any, cb: any): any;
    function valToValues(val: any): any;
    function valToExtension(val: any, lookfor: any): any;
    function valuesToSchema(values: any): any;
    function simpleToShapeMap(x: any): any;
    function absolutizeShapeMap(parsed: any, base: any): any;
    function errsToSimple(val: any): any;
    function resolveRelativeIRI(base: any, iri: any): any;
    function resolvePrefixedIRI(prefixedIri: any, prefixes: any): any;
    function parsePassedNode(passedValue: any, meta: any, deflt: any, known: any, reportUnknown: any): any;
    function executeQueryPromise(query: any, endpoint: any): any;
    function executeQuery(query: any, endpoint: any): any;
    function rdfjsDB(db: N3.Store, queryTracker?: QueryTracker): NeighborhoodDb;
    const NotSupplied: string;
    const UnknownIRI: string;
    function unescapeText(string: any, replacements: any): any;


    // function skipDecl(shapeExpr: any): any;
    // namespace Visitor {
    //     function index(schema: any): any;
    // }
    // function makeTriplesDB(queryTracker: any): any;

    interface QueryTracker {
        start (isOut: boolean, term: N3.Term, shapeLabel: string): void;
        end (triples: N3.Quad[], time: number): void;
    }

    interface Neighborhood {
      incoming: N3.Quad[];
      outgoing: N3.Quad[];
    }

    interface NeighborhoodDb {
      getSubjects(): N3.Term[];
      getPredicates(): N3.Term[];
      getObjects(): N3.Term[];
      getQuads(): N3.Quad[];
      getNeighborhood (point: N3.Term | string, shapeLabel: string, shape: ShExJ.Shape): Neighborhood;
    }
}

