const express = require('express');
const http = require('http');
const webpackMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');

const webpackConfigurator = require('./webpack.config');

const port = 8080;

const app = express();
const server = http.createServer(app);

const webpackConfig = webpackConfigurator({
	env: 'development',
});

const compiler = webpack(webpackConfig);

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	return next();
});

app.use(
	webpackMiddleware(compiler, {
		publicPath: `/dist/`,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
			'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
		},
	}),
);

// app.use([`/map`, '/about'], (req, res, next) => {
// 	res.sendFile(`${__dirname}/index.html`);
// });
app.use('/assets', express.static(`${__dirname}/assets`));
app.use(`/`, (req, res, next) => {
	res.sendFile(`${__dirname}/index.html`);
});

app.use(`/*`, (req, res, next) => {
	res.sendFile(`${__dirname}/404.html`);
});

server.listen(port);

console.log(`Working... compiled assets will be available at http://localhost:8080`);
