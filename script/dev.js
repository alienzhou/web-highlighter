const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const convert = require('./convet-md');
convert();

const config = require('../config/webpack.config.dev.js');
const serverConfig = require('../config/server.config.js');

const compiler = webpack(config);

// `open: true` lets webpack-dev-server launch the browser once the server is listening.
const devServer = new WebpackDevServer({ ...serverConfig, open: true }, compiler);
devServer.start().then(() => {
    console.log('Starting the development server...\n');
});
