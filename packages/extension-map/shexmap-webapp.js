/* ShExMap webapp bundle entry: extends the ShExWebApp global created by
 * ../shex-webapp/doc/webpacks/shex-webapp.js with the ShExMap extension.
 *
 * In HTML (and worker importScripts), load n3js.js and shex-webapp.js before
 * this bundle: webpack `externals` (see webpack.config.js) resolve the shared
 * modules to ShExWebApp.Modules / N3js at runtime instead of bundling a
 * second copy of every module.
 *
 * Under node, require("@shexjs/webapp") resolves normally, so this module
 * exports the same superset object it always did.
 */
ShExWebApp = Object.assign(require("@shexjs/webapp"), {
  Map:                require("."),
  StringToRdfJs:      require("./lib/stringToRdfJs"),
  NestedTurtleWriter: require("./lib/NestedWriter"),
})

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExWebApp;
