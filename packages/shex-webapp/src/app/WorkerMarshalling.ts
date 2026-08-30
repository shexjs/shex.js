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

/** an RDF/JS term as JSON */
interface JsonTerm {
  termType: string;
  value: string;
  datatype?: string;
  language?: string;
}
interface JsonTriple { subject: JsonTerm; predicate: JsonTerm; object: JsonTerm; }

/** what a term looks like on either side: N3's, or any RDF/JS data model's */
interface TermLike {
  termType: string;
  value: string;
  datatypeString?: string;
  datatype?: {value: string};
  language?: string;
}
interface TripleLike { subject: TermLike; predicate: TermLike; object: TermLike; }
interface DataFactoryLike {
  namedNode (value: string): any;
  blankNode (value: string): any;
  literal (value: string, languageOrDatatype?: any): any;
  quad (subject: any, predicate: any, object: any): any;
}

/** one entry of a results shape map.  `shape` is START_SHAPE_INDEX_ENTRY
 * over the wire where it is Validator.Start on the page. */
interface ResultEntry {
  node: string;
  shape: string;
  status?: string;      // "conformant" or "nonconformant"
  appinfo?: any;        // the validator's proof, or its errors
  elapsed?: number;     // ms
  [key: string]: any;
}

/** the results a validation has so far, merged by node@shape (createResults) */
interface ResultsAccumulator {
  /** null for none, the one entry for one, else a FailureList or SolutionList of them */
  getShapeMap (): any;
  merge (toAdd: ResultEntry[]): ResultsAccumulator;
  has (ent: ResultEntry): boolean;
}

class WorkerMarshalling {
  static indexKey (node: string, shape: string): string {
    return node + '@' + shape;
  }

  static indexShapeMap (fixedMap: ResultEntry[]): {[key: string]: ResultEntry} {
    return fixedMap.reduce((ret: {[key: string]: ResultEntry}, ent) => {
      ret[WorkerMarshalling.indexKey(ent.node, ent.shape)] = ent;
      return ret;
    }, {});
  }

  /** a results shape map that merges by node@shape, as the worker accumulates one */
  static createResults (): ResultsAccumulator {
    const shapeMap: ResultEntry[] = [];
    const known: {[key: string]: ResultEntry} = {};
    return {
      getShapeMap (): any {
        return shapeMap.length === 0 ? null
          : shapeMap.length === 1 ? shapeMap[0]
          : "errors" in shapeMap[0] ? {type: "FailureList", errors: shapeMap}
          : {type: "SolutionList", solutions: shapeMap};
      },
      merge (toAdd: ResultEntry[]) {
        toAdd.forEach(ent => {
          const key = WorkerMarshalling.indexKey(ent.node, ent.shape);
          if (!(key in known)) {
            shapeMap.push(ent);
            known[key] = ent;
          }
        });
        return this;
      },
      has (ent: ResultEntry): boolean {
        return WorkerMarshalling.indexKey(ent.node, ent.shape) in known;
      },
    };
  }

  static rdfjsTripleToJsonTriple (rdfjsTriple: TripleLike): JsonTriple {
    return {
      subject: WorkerMarshalling.rdfjsTermToJsonTerm(rdfjsTriple.subject),
      predicate: WorkerMarshalling.rdfjsTermToJsonTerm(rdfjsTriple.predicate),
      object: WorkerMarshalling.rdfjsTermToJsonTerm(rdfjsTriple.object),
    };
  }

  static rdfjsTermToJsonTerm (rdfjsTerm: TermLike): JsonTerm {
    const ret: JsonTerm = {termType: rdfjsTerm.termType, value: rdfjsTerm.value};
    if (ret.termType === "Literal") {
      // datatypeString is an N3.js extension; fall back to the RDF/JS interface
      const datatype = rdfjsTerm.datatypeString || (rdfjsTerm.datatype && rdfjsTerm.datatype.value);
      if (["http://www.w3.org/2001/XMLSchema#string",
           "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"
          ].indexOf(datatype as string) === -1)
        ret.datatype = datatype;
      else if (rdfjsTerm.language)
        ret.language = rdfjsTerm.language;
    }
    return ret;
  }

  static jsonTripleToRdfjsTriple (jsonTriple: JsonTriple, dataFactory: DataFactoryLike): any {
    return dataFactory.quad(
      WorkerMarshalling.jsonTermToRdfjsTerm(jsonTriple.subject, dataFactory),
      WorkerMarshalling.jsonTermToRdfjsTerm(jsonTriple.predicate, dataFactory),
      WorkerMarshalling.jsonTermToRdfjsTerm(jsonTriple.object, dataFactory)
    );
  }

  static jsonTermToRdfjsTerm (jsonTerm: JsonTerm, dataFactory: DataFactoryLike): any {
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
(globalThis as any).WorkerMarshalling = WorkerMarshalling;
