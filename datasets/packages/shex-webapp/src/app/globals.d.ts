/**
 * What the page gives the app's scripts and TypeScript cannot see: the
 * bundles' globals, jQuery, and the two things the page's head script
 * declares.  Everything here is `any` for now; narrowing them is the
 * work plan.md's B1 describes.

 */
declare const $: any;
declare const jQuery: any;
declare const ShExWebApp: any;
declare const RdfJs: any;
declare const N3js: any;
declare const CodeMirror: any;
declare const IRI: any;
declare const IRIResolver: any;   // iri.js, vendored
declare var ShExWorker: any;
declare const WorkerUrl: string;
declare const marked: any;
declare var module: any;          // ShExPlugins.js is also require()d, by the tests
