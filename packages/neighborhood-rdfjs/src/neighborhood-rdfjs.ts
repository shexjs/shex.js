/** Implementation of @shexjs/neighborhood-api which gets data from an @rdfjs/dataset
 */
import * as RdfJs from "@rdfjs/types";
import {Shape} from "shexj";
import {DbParamSpec, DbQueryTracker, Neighborhood, NeighborhoodDb, ParamEditor, sparqlOrder, Start} from "@shexjs/neighborhood-api";

/** The subset of an RDF/JS quad store needed by rdfjsDB, satisfied by e.g. an N3.Store.
 */
export interface RdfJsQuadSource {
  getSubjects(...args: any[]): RdfJs.Term[];
  getPredicates(...args: any[]): RdfJs.Term[];
  getObjects(...args: any[]): RdfJs.Term[];
  getQuads(...args: any[]): RdfJs.Quad[];
  match(subject?: RdfJs.Term | null, predicate?: RdfJs.Term | null, object?: RdfJs.Term | null, graph?: RdfJs.Term | null): Iterable<RdfJs.Quad>;
  readonly size: number;
}

export function rdfjsDB (db: RdfJsQuadSource, queryTracker?: DbQueryTracker): NeighborhoodDb {

  function getNeighborhood (point: RdfJs.Term, shapeLabel: string | typeof Start, _shape: Shape): Neighborhood {
    // I'm guessing a local DB doesn't benefit from shape optimization.
    let startTime: Date | null = null;
    if (queryTracker) {
      startTime = new Date();
      queryTracker.start(false, point, shapeLabel);
    }
    const outgoing: RdfJs.Quad[] = [...db.match(point, null, null, null)].sort(
      (l, r) => sparqlOrder(l.object, r.object)
    );
    if (queryTracker) {
      const time = new Date();
      queryTracker.end(outgoing, time.valueOf() - startTime!.valueOf());
      startTime = time;
    }
    if (queryTracker) {
      queryTracker.start(true, point, shapeLabel);
    }
    const incoming: RdfJs.Quad[] = [...db.match(null, null, point, null)].sort(
      (l, r) => sparqlOrder(l.object, r.object)
    );
    if (queryTracker) {
      queryTracker.end(incoming, new Date().valueOf() - startTime!.valueOf());
    }
    return {
      outgoing: outgoing,
      incoming: incoming
    };
  }

  return {
    getNeighborhood: getNeighborhood,
    getSubjects: () => db.getSubjects(),
    getPredicates: () => db.getPredicates(),
    getObjects: () => db.getObjects(),
    getQuads: (...args: any[]) => db.getQuads(...args),
    get size(): number { return db.size; },
  };
}

export const name = "neighborhood-rdfjs";
export const description = "Implementation of @shexjs/neighborhood-api which gets data from an @rdfjs/dataset";
export const ctor = rdfjsDB;

/** What it takes to construct this DB, declared for hosts that offer several
 * neighborhood implementations (STRAWMAN, see @shexjs/neighborhood-api).
 * "A list of filenames paired with media types" is declared as one
 * array-of-files parameter per media type -- contentMediaType is the
 * pairing.  Fetching and parsing them is the host's business (it's async
 * and needs parsers this module doesn't ship), so `fromParams` takes the
 * store the host built rather than the file lists. */
export const dbParams: DbParamSpec[] = [
  { name: "data", selector: true,
    description: "Turtle data",
    schema: {type: "array", items: {type: "string", format: "uri", contentMediaType: "text/turtle"}},
    cli: {option: "dataURL", alias: "d", typeLabel: "file|URL"} },
  { name: "jsonld",
    description: "JSON-LD data",
    schema: {type: "array", items: {type: "string", format: "uri", contentMediaType: "application/ld+json"}},
    cli: {option: "jsonld", alias: "l", typeLabel: "file|URL"} },
];

export function fromParams (params: { [name: string]: any }, queryTracker?: DbQueryTracker): NeighborhoodDb {
  return rdfjsDB(params.store, queryTracker);
}

/** The catch-all: any text a query module doesn't claim is data to parse.
 * A host lists this module last. */
export function claimPaneText (text: string): { [name: string]: any } {
  return {text};
}

/** This module has a whole RDF document to edit, so it names the language
 * the host already implements rather than describing one. */
export const paneEditor: ParamEditor = {language: "turtle"};
