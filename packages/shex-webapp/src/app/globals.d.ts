/**
 * What the page gives the app's scripts and TypeScript cannot otherwise see:
 * the bundles' globals, jQuery, and the two things the page's head script
 * declares.
 *
 * `RdfJs` is typed against `@rdfjs/types` -- the data factory the app builds
 * terms with, and the one global here with installed type declarations.  The
 * rest stay `any` on purpose: jQuery, CodeMirror, marked, N3js and IRI are
 * CDN-loaded third parties with no `@types/*` installed, and `ShExWebApp` is
 * this repo's own bundle, which carries no `types` entry yet.  Narrowing those
 * is the larger B1 follow-on: it wants `@types/*` pulled in (or a `types`
 * entry published on `@shexjs/webapp`) and the resulting cascade of fixes
 * absorbed under `strict` -- not a one-line change like `RdfJs` was.
 */
declare const $: any;
declare const jQuery: any;
declare const ShExWebApp: any;
declare const RdfJs: import("@rdfjs/types").DataFactory;
declare const N3js: any;
declare const CodeMirror: any;
declare const IRI: any;
declare const IRIResolver: any;   // iri.js, vendored
declare var ShExWorker: any;
declare const WorkerUrl: string;
declare const marked: any;
declare var module: any;          // ShExPlugins.js is also require()d, by the tests
