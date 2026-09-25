const Path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const DocDir = "doc/"
const WebPacksDir = "webpacks/";

/* The SHACL-SPARQL extension, Comunica and sparqljs, over the core bundle's
 * global.
 */
module.exports = {
  entry: {
    "shexshaclsparql-webapp"    : "./shexshaclsparql-webapp.js",
    "shexshaclsparql-webapp.min": "./shexshaclsparql-webapp.js",
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
