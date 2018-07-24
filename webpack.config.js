const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');

const outputDirectory = 'dist';
module.exports = {
	entry: ['babel-polyfill', './src/index.js'],
	output: {
		path: path.join(__dirname, outputDirectory),
		filename: 'bundle.js',
		publicPath: '/'
	},
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.(png|jp(e*)g|svg)$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 8000, // Convert images < 8kb to base64 strings
							name: 'images/[hash]-[name].[ext]'
						}
					}
				]
			}
		]
	},
	devServer: {
		contentBase: path.join(__dirname, 'public'),
		host: '0.0.0.0',
		port: 3000,
		open: false,
		historyApiFallback: true,
		proxy: {
			'/api/*': 'http://localhost:8080',
			'/images/*': 'http://localhost:8080'
		}
	},
	plugins: [
		new CleanWebpackPlugin([outputDirectory]),
		new HtmlWebpackPlugin({
			template: './public/index.html',
			favicon: './public/favicon.ico'
		}),
		new FriendlyErrorsWebpackPlugin(),
		new ManifestPlugin({
			fileName: 'asset-manifest.json'
		})
	]
};
