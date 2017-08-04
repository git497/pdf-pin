const path = require('path')
const webpack = require('webpack')
const CleanPlugin = require('clean-webpack-plugin')
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin

const env = process.env.NODE_ENV
const libraryName = 'bundle'
let outputFile = `${libraryName}.js`
let plugins = [
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
  devtool: env === 'production' ? '' : 'source-map',
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
      }
    ]
  },
  plugins: plugins
}
