const staticPath = require('./paths.js').staticPath;
const PORT = process.env.PORT || 8085;
const HOST = process.env.HOST || '127.0.0.1';

module.exports = {
    disableHostCheck: true,
    compress: true,
    hot: true,
    watchContentBase: true,
    watchOptions: {
        ignored: /node_modules/
    },
    host: HOST,
    port: PORT,
    contentBase: staticPath,
    index: 'index.html'
};