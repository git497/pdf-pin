const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanPlugin = require('clean-webpack-plugin')

module.exports = {
  entry: './test/index.js',
  output: {
    path: path.resolve(__dirname, 'test/dist'),
    filename: 'index.js',
    publicPath: ''
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
  plugins: [
    new CopyWebpackPlugin([
      {from: 'test/drawing.pdf'},
      {from: 'test/pin.png'}
    ]),
    new CleanPlugin(['test/dist'])
  ]
}
