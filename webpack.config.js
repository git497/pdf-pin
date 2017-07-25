const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanPlugin = require('clean-webpack-plugin')

module.exports = {
  entry: {
    'app': './src/simple.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
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
      {from: 'data', to: 'data'}
    ]),
    new CleanPlugin(['dist', 'dist.zip'])
  ]
}
