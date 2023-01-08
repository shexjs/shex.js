/** API called by @shexjs/validator to get a neighborhood (arcs in and out of a node)
 */
import {shapeExpr, Shape} from 'shexj';
// import {Neighborhood} from '@shexjs/neighborhood-api';
import * as RdfJs from "@rdfjs/types/data-model";
//import {Start} from "@shexjs/validator";
export const Start = { term: "START" }

export {};

/*
export interface ValidatorNeighborhood {
  getNeighborhood(
    point: RdfJs.Term,
    shapeLabel: string,
    shape: shapeExpr,
  ): Neighborhood;
}
*/
export interface Neighborhood {
  incoming: RdfJs.Quad[];
  outgoing: RdfJs.Quad[];
}

export interface NeighborhoodDb {
  getSubjects(): RdfJs.Term[];
  getPredicates(): RdfJs.Term[];
  getObjects(): RdfJs.Term[];
  getQuads(): RdfJs.Quad[];
  getNeighborhood (point: RdfJs.Term, shapeLabel: string | typeof Start, shape: Shape): Neighborhood;
  get size(): number
}

