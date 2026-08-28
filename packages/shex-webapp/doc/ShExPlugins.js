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
 */
const ShExPlugins = (function () {
  const registered = [];
  const listeners = [];
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
    register (descriptor) {
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
                              && document.currentScript.src) || this.loadingFrom;
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
    onRegister (fn) {
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
    unregister (id) {
      const at = registered.findIndex(d => d.id === id);
      return at === -1 ? null : registered.splice(at, 1)[0];
    },

    /** every descriptor, in the order they registered */
    all () { return registered.slice(); },

    byId (id) { return registered.find(d => d.id === id); },
  };
})();

// A `const` in a classic script is reachable from the scripts after it but
// is not a property of the window, and a plugin fetched at runtime is a
// script like any other -- so say it both ways.
if (typeof window !== "undefined")
  window.ShExPlugins = ShExPlugins;
if (typeof module !== "undefined" && module.exports)
  module.exports = ShExPlugins;
