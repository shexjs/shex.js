const Path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const DocDir = "doc/"
const WebPacksDir = "webpacks/";

/* The Assert extension over the core bundle's global: a parser and an
 * evaluator, nothing else.
 */
module.exports = {
  entry: {
    "shexpathassert-webapp"    : "./shexpathassert-webapp.js",
    "shexpathassert-webapp.min": "./shexpathassert-webapp.js",
  },
  externals: {
    "@shexjs/webapp": "var ShExWebApp",
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
