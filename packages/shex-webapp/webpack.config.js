const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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
    fs: 'empty',
    // net: 'empty',
    // tls: 'empty',
  },
  plugins: [
  //   new BundleAnalyzerPlugin(/*{analyzerMode: 'json'}*/)
  ],
};
