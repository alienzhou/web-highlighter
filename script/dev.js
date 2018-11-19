const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('../config/dev.config.js');
const serverConfig = require('../config/server.config.js');

const compiler = webpack(config);

const devServer = new WebpackDevServer(compiler, serverConfig);
devServer.listen(8080, err => {
    if (err) {
        return console.log(err);
    }
    console.log('Starting the development server...\n');
});