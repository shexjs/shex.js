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

export function externalTerm(node: any, factory: any): any;

export function externalTriple(triple: any, factory: any): any;

export function getLiteralLanguage(literal: any): any;

export function getLiteralType(literal: any): any;

export function getLiteralValue(literal: any): any;

export function inDefaultGraph(triple: any): any;

export function internalTermToTurtle(node: any, meta: {base: string, prefixes: {[name: string]: string[]}}, aForType: boolean): any;

export function internalTerm(node: any): any;

export function internalTriple(triple: any): any;

export function isBlank(entity: any): any;

export function isDefaultGraph(entity: any): any;

export function isIRI(entity: any): any;

export function isLiteral(entity: any): any;

export function resolveRelativeIRI(base: any, iri: any): any;

export function LdToRdfJsTerm (ld: LdTerm): RdfJsTerm;

export interface Meta {
  base: string;
  prefixes = {
    [id: string]: string
  };
}

export function rdfJsTermToTurtle (node: Term, meta?: Meta): string;
