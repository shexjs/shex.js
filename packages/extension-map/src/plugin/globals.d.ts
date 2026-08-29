/**
 * What the page gives this plugin and TypeScript cannot see.  The plugin is
 * compiled alone (tsconfig.plugin.json) and never sees the app's sources,
 * so the bundles' globals, jQuery, the plugin register and the app's own
 * classes and helpers are all `any` here, as they are in the app's
 * src/app/globals.d.ts.
 */
declare const $: any;
declare const RdfJs: any;
declare const ShExWebApp: any;
declare const ShExPlugins: any;          // ShExPlugins.js: the register
declare const WorkerTask: any;           // WorkerTask.js
declare const WorkerMarshalling: any;    // WorkerMarshalling.js
declare const WorkerUrl: string;         // the page's head script
declare const LOG_PROGRESS: boolean;     // ShExAppCommon.js, as are the two below
declare const HighlightMode: any;
declare function isPinGesture (evt: any): boolean;
