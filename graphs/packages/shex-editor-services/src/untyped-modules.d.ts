// hand shims for untyped dependencies
declare module "lezer-turtle" {
  export const parser: any;
  export function parseTurtle (text: string, options?: any): any;
}
declare module "lezer-turtle/emit" {
  export function parseTurtle (text: string, options?: any): any;
  export class ProvenanceIndex { get (quad: any): any[]; readonly size: number; }
  export function termKey (term: any): string;
  export function quadKey (quad: any): string;
  export function resolveIri (iri: string, base: string | null): string;
}
declare module "lezer-shexc" {
  export const parser: any;
  export const highlighting: any;
}
