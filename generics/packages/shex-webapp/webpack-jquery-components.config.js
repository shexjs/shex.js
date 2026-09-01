const Path = require("path");
const TerserPlugin = require('terser-webpack-plugin');
const DocDir = "doc/"
const WebPacksDir = "webpacks/";

var config = {
  mode: 'development',
  entry: {
    "jquery-components": "./doc/jquery-components.js",
    "jquery-components.min": "./doc/jquery-components.js",
  },
  output: {
    filename: "[name].js",
    path: Path.resolve(__dirname, DocDir, WebPacksDir),
    // 'auto' resolves asset URLs (fonts/images referenced from CSS) relative
    // to the bundle's own URL; css-loader's `new URL(..., baseURI)` output
    // needs the runtime that webpack only emits for 'auto'.
    publicPath: "auto",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        type: "asset/resource"
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: "asset/resource"
      }
    ]
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

module.exports = (env, argv) => {
  
  if (argv.mode === 'development') {
    config.devtool = 'source-map';
  }

  if (argv.mode === 'production') {
    
  }

  return config;
}
