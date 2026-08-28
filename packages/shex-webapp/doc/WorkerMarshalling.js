"use strict";
/**
 * What crosses between the page and its worker, said in JSON.
 *
 * A postMessage clones plain data and nothing else, so an RDF/JS term goes
 * over as `{termType, value, datatype?, language?}` and comes back through
 * a data factory; a results shape map is merged on either side by
 * node@shape.  Loaded by the page and, through importScripts, by
 * ShExWorkerThread.js -- a script, not a module, on both.
 *
 * This is doc/WorkerMarshalling.js's source (tsconfig.app.json compiles
 * src/app/ into doc/); edit here and run `npm run build`.
 */
class WorkerMarshalling {
    static indexKey(node, shape) {
        return node + '@' + shape;
    }
    static indexShapeMap(fixedMap) {
        return fixedMap.reduce((ret, ent) => {
            ret[WorkerMarshalling.indexKey(ent.node, ent.shape)] = ent;
            return ret;
        }, {});
    }
    /** a results shape map that merges by node@shape, as the worker accumulates one */
    static createResults() {
        const shapeMap = [];
        const known = {};
        return {
            getShapeMap() {
                return shapeMap.length === 0 ? null
                    : shapeMap.length === 1 ? shapeMap[0]
                        : "errors" in shapeMap[0] ? { type: "FailureList", errors: shapeMap }
                            : { type: "SolutionList", solutions: shapeMap };
            },
            merge(toAdd) {
                toAdd.forEach(ent => {
                    const key = WorkerMarshalling.indexKey(ent.node, ent.shape);
                    if (!(key in known)) {
                        shapeMap.push(ent);
                        known[key] = ent;
                    }
                });
                return this;
            },
            has(ent) {
                return WorkerMarshalling.indexKey(ent.node, ent.shape) in known;
            },
        };
    }
    static rdfjsTripleToJsonTriple(rdfjsTriple) {
        return {
            subject: WorkerMarshalling.rdfjsTermToJsonTerm(rdfjsTriple.subject),
            predicate: WorkerMarshalling.rdfjsTermToJsonTerm(rdfjsTriple.predicate),
            object: WorkerMarshalling.rdfjsTermToJsonTerm(rdfjsTriple.object),
        };
    }
    static rdfjsTermToJsonTerm(rdfjsTerm) {
        const ret = { termType: rdfjsTerm.termType, value: rdfjsTerm.value };
        if (ret.termType === "Literal") {
            // datatypeString is an N3.js extension; fall back to the RDF/JS interface
            const datatype = rdfjsTerm.datatypeString || (rdfjsTerm.datatype && rdfjsTerm.datatype.value);
            if (["http://www.w3.org/2001/XMLSchema#string",
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"
            ].indexOf(datatype) === -1)
                ret.datatype = datatype;
            else if (rdfjsTerm.language)
                ret.language = rdfjsTerm.language;
        }
        return ret;
    }
    static jsonTripleToRdfjsTriple(jsonTriple, dataFactory) {
        return dataFactory.quad(WorkerMarshalling.jsonTermToRdfjsTerm(jsonTriple.subject, dataFactory), WorkerMarshalling.jsonTermToRdfjsTerm(jsonTriple.predicate, dataFactory), WorkerMarshalling.jsonTermToRdfjsTerm(jsonTriple.object, dataFactory));
    }
    static jsonTermToRdfjsTerm(jsonTerm, dataFactory) {
        switch (jsonTerm.termType) {
            case "NamedNode": return dataFactory.namedNode(jsonTerm.value);
            case "BlankNode": return dataFactory.blankNode(jsonTerm.value);
            case "Literal":
                if (jsonTerm.datatype)
                    return dataFactory.literal(jsonTerm.value, dataFactory.namedNode(jsonTerm.datatype));
                if (jsonTerm.language)
                    return dataFactory.literal(jsonTerm.value, jsonTerm.language);
                return dataFactory.literal(jsonTerm.value);
            default:
                throw Error("unknown term type " + JSON.stringify(jsonTerm));
        }
    }
}
// a global on the page and in the worker alike (and in the tests' fake worker)
globalThis.WorkerMarshalling = WorkerMarshalling;
