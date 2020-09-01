const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

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

module.exports = {
  entry: {
    "shex-webapp-webpack": "./shex-webapp.js",
    "shex-webapp-webpack.min": "./shex-webapp.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, 'browser'),
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
  node: {
    fs: 'empty',  // @@ webpack-monitor shows require('fs') errors. help?
    // net: 'empty',
    // tls: 'empty',
  },
  plugins: [
    // new BundleAnalyzerPlugin(/*{analyzerMode: 'json'}*/)
  ].concat(WebpackMonitor)
};
