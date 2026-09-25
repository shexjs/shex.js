/**
 * What the page gives this plugin and TypeScript cannot see.  The plugin is
 * compiled alone (tsconfig.plugin.json) and never sees the app's sources,
 * so the bundles' globals, jQuery and the plugin register are all `any`
 * here, as they are in the app's src/app/globals.d.ts.
 */
declare const $: any;
declare const RdfJs: any;
declare const ShExWebApp: any;
declare const ShExPlugins: any;          // ShExPlugins.js: the register
