/**
 * What the worker's importScripts give it and TypeScript cannot see: the
 * two bundles and the app's WorkerMarshalling.js (compiled from
 * src/app/WorkerMarshalling.ts, which this separate program doesn't
 * include).  `any`, as in src/app/globals.d.ts.
 */
declare const N3js: any;
declare const ShExWebApp: any;
declare const WorkerMarshalling: any;
