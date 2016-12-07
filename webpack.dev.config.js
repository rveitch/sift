var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool:"eval",
  context:path.join(__dirname),
  entry: [
    'webpack-hot-middleware/client?reload=true',
    './src/index.jsx'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
	node: {
		console: true,
		fs: 'empty',
		net: 'empty',
		tls: 'empty'
	},
  resolve: {
    alias: {
      react: path.resolve('./node_modules/react'),
			'mapbox-gl/js/geo/transform': path.join(__dirname, 'node_modules/mapbox-gl/js/geo/transform'),
			'mapbox-gl': path.join(__dirname, 'node_modules/mapbox-gl/dist/mapbox-gl.js')
    },
    extensions:[".js", ".jsx", ".webpack.js", ".web.js",""]
  },
  resolveLoader: {
    root: path.join(__dirname, "node_modules")
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        loader: 'babel',
        query: {
          presets: [
            require.resolve('babel-preset-es2015'),
            require.resolve('babel-preset-react')
          ]
        }
      },
      {
        test: /\.scss$/,
        loaders: ["style", "css", "sass"]
      },
      {
        test: /\.(jpg|png|svg)$/,
        loaders: [
            'file-loader?name=[path][name].[ext]'
        ]
      }
    ]
  }
};
