/** API called by @shexjs/validator to get a neighborhood (arcs in and out of a node)
 */
import {shapeExpr} from 'shexj';
import {Neighborhood} from '@shexjs/util';
import * as RdfJs from "@rdfjs/types/data-model";

export {};

export interface ValidatorNeighborhood {
  getNeighborhood(
    point: string | RdfJs.Term,
    shapeLabel: string,
    shape: shapeExpr,
  ): NeighborhoodDb;
}

export interface Neighborhood {
  incoming: RdfJs.Quad[];
  outgoing: RdfJs.Quad[];
}

export interface NeighborhoodDb {
  getSubjects(): RdfJs.Term[];
  getPredicates(): RdfJs.Term[];
  getObjects(): RdfJs.Term[];
  getQuads(): RdfJs.Quad[];
  getNeighborhood (point: RdfJs.Term | string, shapeLabel: string, shape: ShExJ.Shape): Neighborhood;
  size(): number
}

