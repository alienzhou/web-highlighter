const opn = require('opn');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('../config/dev.config.js');
const serverConfig = require('../config/server.config.js');
const compiler = webpack(config);
const PORT = process.env.PORT || 8085;
const HOST = process.env.HOST || '127.0.0.1';

const devServer = new WebpackDevServer(compiler, serverConfig);
devServer.listen(PORT, HOST, err => {
    if (err) {
        return console.log(err);
    }
    console.log('Starting the development server...\n');
    opn(`http://${HOST}:${PORT}`);
});