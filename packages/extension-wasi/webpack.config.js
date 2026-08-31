const Path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const DocDir = "doc/"
const WebPacksDir = "webpacks/";

/* The WASI extensions and wabt, over the core bundle's global.  The node
 * builtins are externalized to undefined: prelude.wat is a generated
 * module (src/prelude-wat.ts), the shim host needs no file descriptors,
 * and the paths that would read them (impl: "wasi", the on-disk .wasm)
 * throw where they cannot work.
 */
module.exports = {
  entry: {
    "shexwasi-webapp"    : "./shexwasi-webapp.js",
    "shexwasi-webapp.min": "./shexwasi-webapp.js",
  },
  externals: {
    "@shexjs/webapp": "var ShExWebApp",
    "fs":        "var undefined",
    "path":      "var undefined",
    "os":        "var undefined",
    "node:wasi": "var undefined",
  },
  output: {
    filename: "[name].js",
    path: Path.resolve(__dirname, DocDir, WebPacksDir),
    publicPath: WebPacksDir,
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        "keep_classnames": false
      },
      include: /\.min\.js$/
    })]
  },
};
