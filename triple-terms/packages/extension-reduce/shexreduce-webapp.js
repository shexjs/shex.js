/* ShExReduce webapp bundle entry: extends the ShExWebApp global created by
 * ../shex-webapp/doc/webpacks/shex-webapp.js with the Reduce extension, its
 * JavaScript action language, and the overlay reader that hangs actions on
 * a schema they were written apart from.
 *
 * In HTML (and worker importScripts), load n3js.js and shex-webapp.js before
 * this bundle: webpack `externals` (see webpack.config.js) resolve the shared
 * modules to ShExWebApp.Modules / N3js at runtime instead of bundling a
 * second copy of every module.
 */
ShExWebApp = Object.assign(require("@shexjs/webapp"), {
  Reduce:         require("."),
  ReduceJs:       require("@shexjs/extension-reduce-js"),
  SemActOverlay:  require("@shexjs/semact-overlay"),
})

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExWebApp;
