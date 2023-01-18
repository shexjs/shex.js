import * as ShExJ from 'shexj';
import {Term as RdfJsTerm} from 'rdfjs';

export {};

export interface SchemaIndex {
    shapeExprs: { [id: string]: ShExJ.ShapeDecl };
    tripleExprs: { [id: string]: ShExJ.TripleExpr };
    labelToTcs: { [id: string]: ShExJ.TripleConstraint[] }
}

export interface InternalSchema extends ShExJ.Schema {
  _index?: SchemaIndex
}

export interface ObjectLiteral {
  value: string;
  type?: string;
  language?: string;
}

export interface ShapeMapEntry {
    node: string;
    shape: string;
}

export type ShapeMap = ShapeMapEntry[];

export type LdTerm = string | ObjectLiteral;

export const RdfLangString: string;

export const XsdString: string;

export function shExJsTerm2Turtle(node: any, meta?: {base: string, prefixes: {[name: string]: string[]}}, aForType?: boolean): any;

export function resolveRelativeIRI(base: any, iri: any): any;

export function ld2RdfJsTerm (ld: LdTerm): RdfJsTerm;

export function rdfJsTerm2Ld (term: RdfJsTerm): ShExTerm.LdTerm;


export interface Meta {
  base: string;
  prefixes: {
    [id: string]: string
  };
}

export function rdfJsTerm2Turtle (node: Term, meta?: Meta): string;
