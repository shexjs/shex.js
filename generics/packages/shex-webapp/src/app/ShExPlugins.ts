/**
 * Where a plugin says what it adds to the page.
 *
 * Two different things around here got called "extension", and this file is
 * where the line is drawn.  An *extension* is ShEx's word: a semantic-action
 * handler, named by IRI, that a schema invokes with `%<IRI>:{ ... %}` --
 * GenX, Map, Test and the rest of shexSpec/extensions.  A *plugin* is this
 * app's word: a module loaded by URL that may install any number of those
 * handlers -- one, several, none -- and may change the page: panes, verbs,
 * styles, a worker script.  ShExMap grew its page changes by copying the
 * page and the app class, which is how shexmap-simple.html came to be a
 * fork of shex-simple.html; this is the register it hands them to instead.
 *
 * See doc/plugins.md for the contract.  A descriptor may carry kinds the app does not read yet, and
 * the app reads kinds no descriptor carries.  Both are fine.
 *
 * This is doc/ShExPlugins.js's source (tsconfig.app.json compiles src/app/ into
 * doc/); edit here and run `npm run build`.
 */

/**
 * What a plugin hands register (doc/plugins.md, "The descriptor").  `id`
 * is the one required thing; the kinds are what the apps read -- the
 * shapes of a pane, a control and a key are ShExBaseApp-plugins's, which
 * builds them -- and a descriptor may carry more.
 */
interface PluginDescriptor {
  id: string;                   // what names it: the IRI of the one extension it installs, by convention
  label?: string;               // what to call it on screen
  scripts?: string[];           // what it runs on: fetched, in order, before anything else is applied
  css?: string;                 // rules the page needs for what it adds
  panes?: any[];                // inputs and products: {name, id, kind, editor, queryStringParm, manifest, ...}
  resultsTabs?: any[];          // a second kind of result: {id, label}
  toolbar?: any[];              // controls under the panes: {kind, id, label, key, run, ...}
  statusbar?: any[];            // what it says under them
  keys?: any[];                 // verbs with no button: {id, key, run}
  methods?: {[name: string]: (...args: any[]) => any};   // verbs, mixed into the app
  neighborhoods?: any[];        // data sources it brings: neighborhood modules
  worker?: string;              // its half in the worker, relative to baseUrl
  init? (app: any): void;                       // what it does rather than declares
  unload? (app: any): void;                     // what to take back when it goes
  register? (validator: any, api: any): void;   // the semantic-action handler a schema dispatches on
  schema? (schema: any, app: any): any;         // a turn at what is validated
  results? (base: typeof ShExResultsRenderer): typeof ShExResultsRenderer;   // composing the renderer
  onStartingValidation? (app: any): void;       // the last results are about to go
  // bookkeeping: filled in by the register and the apps, not written by an author
  baseUrl?: string | null;      // where the module was loaded from
  applied?: Promise<any[]>;     // what the apps did about it
  initialized?: boolean;        // init has run
  panesBuilt?: boolean;         // its panes are on the page
  mixedIn?: string[];           // the names methods actually took
  [key: string]: any;           // ...and whatever a plugin keeps for itself (hello-plugin's `said`)
}

/** the register: what ShExPlugins is */
interface PluginRegister {
  loadingFrom: string | null;
  register (descriptor: PluginDescriptor): PluginDescriptor;
  onRegister (fn: (descriptor: PluginDescriptor) => any): () => void;
  unregister (id: string): PluginDescriptor | null;
  all (): PluginDescriptor[];
  byId (id: string): PluginDescriptor | undefined;
}

const ShExPlugins: PluginRegister = (function (): PluginRegister {
  const registered: PluginDescriptor[] = [];
  const listeners: ((descriptor: PluginDescriptor) => any)[] = [];
  return {
    /** where the module now being evaluated came from.
     *
     * A script on the page knows its own src; a module the app fetched and
     * ran does not, and registers before whoever fetched it gets a chance
     * to say -- so the fetcher says it here first. */
    loadingFrom: null,

    /**
     * @param descriptor.id     what names this plugin: any string unique to
     *                          it.  A plugin that installs exactly one
     *                          semantic-action extension conventionally uses
     *                          that extension's IRI; one that installs two,
     *                          or none, names itself some other way
     * @param descriptor.label  what to call it on screen
     * @param descriptor.css    rules the page needs for what it adds
     * @param descriptor.baseUrl where it was loaded from (filled in here)
     * @param descriptor.applied  what the apps did about it (filled in here)
     */
    register (descriptor: PluginDescriptor): PluginDescriptor {
      if (!descriptor || typeof descriptor.id !== "string")
        throw Error("a plugin registers with an id: a string that names it"
                    + " (the IRI of the one extension it installs, by convention)");
      // One plugin may arrive several ways -- a script on the page, a
      // ?plugin= URL, a manifest entry that names it -- and they mean the
      // same plugin.  The first registration wins and the rest are no-ops,
      // so naming it twice is not an error.
      const already = registered.find(d => d.id === descriptor.id);
      if (already)
        return already;
      // where it was loaded from, so it can name a file of its own -- a
      // worker script, say -- relative to itself rather than to whatever
      // page it lands on.  A module fetched by URL is stamped by whoever
      // fetched it; a script on the page knows its own src.
      if (!descriptor.baseUrl)
        descriptor.baseUrl = (typeof document !== "undefined" && document.currentScript
                              && (document.currentScript as HTMLScriptElement).src) || this.loadingFrom;
      registered.push(descriptor);
      // an app may have to fetch something before it can apply this -- the
      // module the plugin runs on, say -- so what it hands back is waited
      // for here, and whoever loaded the plugin can await it
      descriptor.applied = Promise.all(listeners.map(fn => fn(descriptor)));
      return descriptor;
    },

    /** call fn for each descriptor registered from here on.
     *
     * An app applies what is registered when it starts, and a plugin loaded
     * afterwards -- by URL, or because a manifest entry named it -- has to
     * reach the same code.  Returns a function that unsubscribes. */
    onRegister (fn: (descriptor: PluginDescriptor) => any): () => void {
      listeners.push(fn);
      return () => {
        const at = listeners.indexOf(fn);
        if (at !== -1)
          listeners.splice(at, 1);
      };
    },

    /**
     * Take one back out, and hand it back.
     *
     * A plugin is loaded by URL, so it can be unloaded the same way -- the
     * ×  on its screen tab (ShExBaseApp's unloadPlugin, which undoes what
     * applying the descriptor did to the page).  Here is only the register:
     * once a descriptor is out of it, nothing that reads the plugins --
     * extendSchema, makeRenderer, the handlers a validation registers, the
     * worker scripts a request names -- knows anything about it, and the
     * same module may register again later.
     */
    unregister (id: string): PluginDescriptor | null {
      const at = registered.findIndex(d => d.id === id);
      return at === -1 ? null : registered.splice(at, 1)[0];
    },

    /** every descriptor, in the order they registered */
    all (): PluginDescriptor[] { return registered.slice(); },

    byId (id: string): PluginDescriptor | undefined { return registered.find(d => d.id === id); },
  };
})();

// A `const` in a classic script is reachable from the scripts after it but
// is not a property of the window, and a plugin fetched at runtime is a
// script like any other -- so say it both ways.
if (typeof window !== "undefined")
  (window as any).ShExPlugins = ShExPlugins;
if (typeof module !== "undefined" && module.exports)
  module.exports = ShExPlugins;
