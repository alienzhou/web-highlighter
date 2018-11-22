const staticPath = require('./paths.js').staticPath;

module.exports = {
    disableHostCheck: true,
    compress: false,
    hot: true,
    watchOptions: {
        ignored: /node_modules/
    },
    contentBase: staticPath,
    index: 'index.html'
};