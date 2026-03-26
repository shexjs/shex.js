import ShExLoader = require("@shexjs/loader");

export = ShExNode;

/**
 * Extends @shexjs/loader with:
 * - `file:` URL and filesystem path support
 * - stdin (`-`) support
 * - Dynamic loading of ShEx extensions via loadExtensions()
 */
declare function ShExNode(config?: ShExNode.Config): ShExLoader.Loader;

declare namespace ShExNode {

  /** ShExNode config extends ShExLoader.Config with Node.js-specific options. */
  interface Config extends ShExLoader.Config {
    /** Working directory used to resolve relative file paths. */
    cwd?: string;
  }
}
