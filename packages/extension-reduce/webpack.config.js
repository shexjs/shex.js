const Path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const DocDir = "doc/"
const WebPacksDir = "webpacks/";

// webpack-bundle-analyzer can be run after compilation.
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// webpack-monitor is noisy so disabled by default (uses a deprecated API).
const WebpackMonitor = !!JSON.parse(process.env["WEBPACK_MONITOR"] || "false")
      ? new (require('webpack-monitor'))({
        capture: true,
        target: 'browser/webpack-monitor.json',
        launch: true
      })
      : []

/* Modules provided by shex-webapp's bundle: resolved from the ShExWebApp
 * global's module registry at runtime, so this bundle only packs the Reduce
 * extension itself. Load webpacks/n3js.js and (shex-webapp's)
 * webpacks/shex-webapp.js before this bundle.
 */
const FromCoreBundle = [
  "@shexjs/term", "@shexjs/util", "@shexjs/visitor",
  "@shexjs/neighborhood-rdfjs", "@shexjs/neighborhood-sparql",
  "@shexjs/validator", "@shexjs/writer", "@shexjs/loader", "@shexjs/parser",
  "@shexjs/eval-simple-1err", "@shexjs/eval-threaded-nerr",
  "@shexjs/eval-validator-api",
  "@shexjs/editor-services", "@shexjs/editor-services/lib/editor-panes",
  "shape-map", "js-yaml", "dctap",
];

module.exports = {
  entry: {
    "shexreduce-webapp"    : "./shexreduce-webapp.js",
    "shexreduce-webapp.min": "./shexreduce-webapp.js",
  },
  externals: Object.assign(
    {
      "@shexjs/webapp": "var ShExWebApp",
      "n3":             "var N3js",
    },
    ...FromCoreBundle.map(id => ({[id]: `var ShExWebApp.Modules[${JSON.stringify(id)}]`}))
  ),
  output: {
    filename: "[name].js",
    path: Path.resolve(__dirname, DocDir, WebPacksDir),
    publicPath: WebPacksDir,
    // libraryTarget: 'umd',
    // libraryExport: 'ShExWebApp',
    // umdNamedDefine: true,
    // // globalObject: 'this'
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
  resolve: {
    fallback: {
      // shape-path-core reaches for node's path to find its grammar file,
      // and only when there is no window -- so in here there is nothing to
      // resolve it to, and nothing that asks
      path: false,
      // fs: false,
      // net: 'empty',
      // tls: 'empty',
      // url: require.resolve("url/"),
    }
  },
  plugins: [
    // new BundleAnalyzerPlugin(/*{analyzerMode: 'json'}*/)
  ].concat(WebpackMonitor)
};
