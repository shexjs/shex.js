/**
 * Where an extension says what it adds to the page.
 *
 * An extension to ShEx is a semantic action handler.  An extension to *this*
 * is that plus whatever the page has to grow for it: panes, verbs, menu
 * items, manifest keys, a worker script.  ShExMap grew them by copying the
 * page and the app class, which is how shexmap-simple.html came to be a
 * fork of shex-simple.html; this is the register it hands them to instead.
 *
 * See doc/extension-ui-plan.md.  Contributions move here one kind at a time
 * -- `css` first -- so a descriptor may carry kinds the app does not read
 * yet, and the app reads kinds no descriptor carries.  Both are fine.
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
     * @param descriptor.id     the SemAct IRI: the extension is already
     *                          named by what it dispatches on
     * @param descriptor.label  what to call it on screen
     * @param descriptor.css    rules the page needs for what it adds
     * @param descriptor.baseUrl where it was loaded from (filled in here)
     * @param descriptor.applied  what the apps did about it (filled in here)
     */
    register (descriptor) {
      if (!descriptor || typeof descriptor.id !== "string")
        throw Error("an extension registers with an id: the SemAct IRI it dispatches on");
      // One extension may arrive several ways -- a script on the page, an
      // ?extension= URL, a manifest entry that names it -- and they mean
      // the same extension.  The first registration wins and the rest are
      // no-ops, so naming it twice is not an error.
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
      // module the extension runs on, say -- so what it hands back is
      // waited for here, and whoever loaded the extension can await it
      descriptor.applied = Promise.all(listeners.map(fn => fn(descriptor)));
      return descriptor;
    },

    /** call fn for each descriptor registered from here on.
     *
     * An app applies what is registered when it starts, and an extension
     * loaded afterwards -- by URL, or because a manifest entry named it --
     * has to reach the same code.  Returns a function that unsubscribes. */
    onRegister (fn) {
      listeners.push(fn);
      return () => {
        const at = listeners.indexOf(fn);
        if (at !== -1)
          listeners.splice(at, 1);
      };
    },

    /** every descriptor, in the order they registered */
    all () { return registered.slice(); },

    byId (id) { return registered.find(d => d.id === id); },
  };
})();

// A `const` in a classic script is reachable from the scripts after it but
// is not a property of the window, and an extension fetched at runtime (§5
// phase 2) is a script like any other -- so say it both ways.
if (typeof window !== "undefined")
  window.ShExPlugins = ShExPlugins;
if (typeof module !== "undefined" && module.exports)
  module.exports = ShExPlugins;
