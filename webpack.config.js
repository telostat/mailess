/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const { NODE_ENV = 'production' } = process.env;

module.exports = {
  entry: './src/index.ts',
  mode: NODE_ENV,
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      handlebars: 'handlebars/dist/handlebars.min.js',
      'html-minifier': path.resolve(__dirname, './node_modules/html-minifier-terser/dist/htmlminifier.cjs')
    },
  },
  module: {
    exprContextCritical: false,
    rules: [
      {
        test: /\.ts$/,
        use: ['ts-loader'],
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [() => ({ terserOptions: { mangle: false } })],
  },
};
