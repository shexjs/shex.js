/* Assert webapp bundle entry: extends the ShExWebApp global created by
 * ../shex-webapp/doc/webpacks/shex-webapp.js with the Assert extension.
 *
 * In HTML (and worker importScripts), load n3js.js and shex-webapp.js
 * before this bundle: webpack `externals` (see webpack.config.js) resolve
 * ShExWebApp at runtime rather than bundling a second copy.
 *
 * Under node, require() resolves normally, so this exports the same
 * superset object.
 */
ShExWebApp = Object.assign(require("@shexjs/webapp"), {
  PathAssert: require("."),
})

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExWebApp;
