const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanPlugin = require('clean-webpack-plugin')
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin

const env = process.env.NODE_ENV
const libraryName = 'bundle'
let outputFile = `${libraryName}.js`
let plugins = [
  // new CopyWebpackPlugin([
  //   {from: 'data', to: 'data'}
  // ]),
  new CleanPlugin(['dist'])
]

if (env === 'production') {
  outputFile = `${libraryName}.min.js`
  plugins.push(new UglifyJsPlugin({
    mangle: {
      mangle: false
    },
    compress: {
      sequences: true,
      dead_code: true,
      conditionals: true,
      booleans: true,
      unused: false,
      if_return: true,
      join_vars: true,
      drop_console: false,
      warnings: false
    }
  }))
}

module.exports = {
  entry: './src/viewer.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  devServer: {
    port: 3334
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'file-loader?name=index.[ext]'
          },
          {
            loader: 'extract-loader'
          },
          {
            loader: 'html-loader'
          }
        ]
      }
    ]
  },
  plugins: plugins
}
