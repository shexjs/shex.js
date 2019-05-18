const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require("webpack");

module.exports = {
  entry: {
    "shex-webapp-webpack": "./packages/shex-webapp/shex-webapp.js",
    "shex-webapp-webpack.min": "./packages/shex-webapp/shex-webapp.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, 'packages/shex-webapp/browser'),
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
    net: 'empty',
    tls: 'empty',
  },
};
