// hand shims for untyped dependencies (as in shex-editor-services/src/untyped-modules.d.ts)
declare module "lezer-turtle/emit" {
  export function parseTurtle (text: string, options?: any): any;
}
