'use strict';

const webpack = require('webpack'),
  path = require('path'),
  rootDir = __dirname,
  folderName = 'app_admin',
  bundleName = 'bundle.js',
  NODE_ENV = process.env.NODE_ENV || 'development',
  app = path.join(rootDir, folderName);


module.exports = () => {

  let options = {
    context: app,
    entry: ['./index.jsx'],

    output: {
      path: rootDir + '/assets',
      filename: bundleName
    },

    resolve: {
      modules: [app, 'node_modules'],
      extensions: ['.jsx', '.js']
    },

    // debug: true;
    // options.devtool = 'inline-source-map';

    module: {
      loaders: [
        // support es6 harmony syntax for jsx and js files
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        // used for i18n
        {
          test: /\.json$/,
          loader: 'json-loader'
        }
      ]
    },
    plugins: [
      new webpack.ProvidePlugin({
        'fetch': 'imports-loader?this=>global!exports-loader?global.fetch!isomorphic-fetch'
      }),
      new webpack.DefinePlugin({
        __API_URL__: JSON.stringify(process.env.API_URL),
        __WEBPACK_START_DATE__: JSON.stringify(new Date().toLocaleString()),
        'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
      })
    ]
  };

  if (NODE_ENV === 'production') {
    options.plugins.push(new webpack.optimize.UglifyJsPlugin());
  }

  return options;
};
