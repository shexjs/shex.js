/* WASI webapp bundle entry: extends the ShExWebApp global created by
 * ../shex-webapp/doc/webpacks/shex-webapp.js with the two WASI extensions
 * (wabt rides along; ~2 MB is the price of compiling WAT in the page).
 *
 * In HTML (and worker importScripts), load n3js.js and shex-webapp.js
 * before this bundle: webpack `externals` (see webpack.config.js) resolve
 * ShExWebApp at runtime rather than bundling a second copy, and the node
 * builtins resolve to undefined -- the impl: "wasi" host and the on-disk
 * .wasm are node's; the shim and configure({wasm}) are the browser's.
 *
 * Under node, require() resolves normally, so this exports the same
 * superset object.
 */
ShExWebApp = Object.assign(require("@shexjs/webapp"), {
  Wasi:     require("."),
  WasiTest: require("@shexjs/extension-wasi-test"),
})

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExWebApp;
