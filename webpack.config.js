'use strict';

/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const customProperties = require('postcss-custom-properties');
const HtmlPlugin = require('html-webpack-plugin');
const CssExtractPlugin = require("mini-css-extract-plugin");

const devMode = process.env.ENVIRONMENT === 'dev';

module.exports = {
  entry: {
    app: [path.resolve(__dirname, 'client', 'index.js')],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[name].js',
    publicPath: '/',
  },

  devServer: {
    historyApiFallback: true,
    compress: true,
    host: 'localhost',
    port: 80,
    hot: true,
    clientLogLevel: 'none'
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          priority: -10,
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'initial',
        }
      },
      chunks: 'async',
      minChunks: 1,
      minSize: 30000,
      name: true
    }
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        exclude: /(node_modules)/,
        use: [
          'style-loader', // loads styles into <head>
          'css-loader?modules=true&camelCase=true&localIdentName=[local]-[hash:base64:4]',
          {loader: 'postcss-loader', options: {
            plugins: [
              autoprefixer({env: 'default'}),
              cssnano({preset: 'default'}),
              customProperties(),
          ]}}
        ]
      }
    ]
  },

  plugins: [
    new HtmlPlugin({
      template: path.resolve(__dirname, 'client', 'index.html'),
      filename: 'index.html',
      inject: 'body'
    }),
    new webpack.HotModuleReplacementPlugin(),
  ]
};
