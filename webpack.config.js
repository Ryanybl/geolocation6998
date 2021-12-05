/* eslint-disable import/no-commonjs*/
/* eslint-disable import/no-nodejs-modules*/
/* eslint-disable import/unambiguous*/

const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = function ({ env } = {}) {
	const output = {
		context: __dirname,
		entry: './src/index.jsx',
		output: {
			path: `${__dirname}/dist`,
			filename: '[name].js',
		},
		target: 'web',
		mode: env === 'development' ? 'development' : 'production',
		optimization: {
			minimizer: [
				new TerserPlugin({
					parallel: 2,
					terserOptions: {
						keep_classnames: true,
						keep_fnames: true,
					},
				}),
			],
			splitChunks: {},
		},
		plugins: [
			new webpack.DefinePlugin({
				'process.env.REDIVIS_API_TOKEN': JSON.stringify('AAAAXtGcJ4BCOmXb3OT+XuGr1C5NuWyX'),
				'process.env.ROOT_PATH': JSON.stringify('/6998frontend'),
				'process.env.MAPBOX_ACCESS_TOKEN': JSON.stringify(
					'pk.eyJ1IjoiY29sdW1iaWEtZGF0YXBsYXRmb3JtIiwiYSI6ImNrYXpxbml5bDAwMzEycm11NGpqd2l3b2cifQ.-ql-7fIcoPv0c-m6ezRwjw',
				),
			}),
		],
		module: {
			rules: [
				{
					test: /\.jsx?$/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								cacheDirectory: env === 'development',
								sourceType: 'unambiguous',
								presets: [
									[require.resolve('@babel/preset-react'), { useSpread: true }],
									[
										require.resolve('@babel/preset-env'),
										{
											targets: ['safari 13.1', 'firefox 68', 'chrome 80'],
											modules: false,
											bugfixes: true, // Note: will be default in Babel 8
											useBuiltIns: 'usage',
											corejs: { version: 3, proposals: true },
										},
									],
								],
								plugins: [
									require.resolve('@babel/plugin-proposal-export-default-from'),
								],
							},
						},
					],
				},
				{
					test: /\.css$/,
					exclude: /node_modules/,
					use: [
						{ loader: 'style-loader' },
						{
							loader: 'css-loader',
							options: {
								modules: {
									localIdentName: '[name]_[local]-[hash:base64:3]',
								},
								// url: false,
								importLoaders: 1,
							},
						},
						'postcss-loader',
					],
				},
				{
					test: /\.css$/,
					include: /node_modules/,
					sideEffects: true,
					use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
				},
				{
					test: /\.svg$|\.html$|\.frag$|\.vert$|\.txt$|\.md$|\.woff2$/,
					loader: 'text-loader',
				},
			],
		},
		resolve: {
			modules: [`${__dirname}/src`, `node_modules`, __dirname],
			extensions: ['*', '.js', '.jsx'],
		},
	};

	if (env === 'development') {
		output.devtool = 'eval-cheap-module-source-map';
	}

	return output;
};
