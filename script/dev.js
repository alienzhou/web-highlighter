const opn = require('better-opn');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const convert = require('./convet-md');
convert();

const config = require('../config/webpack.config.dev.js');
const serverConfig = require('../config/server.config.js');

WebpackDevServer.addDevServerEntrypoints(config, serverConfig);
const compiler = webpack(config);
const {port, host} = serverConfig;

const devServer = new WebpackDevServer(compiler, serverConfig);
devServer.listen(port, host, err => {
    if (err) {
        return console.log(err);
    }
    console.log('Starting the development server...\n');
    opn(`http://${host}:${port}`);
});