const path = require('path');
const distPath = require('./paths.js').distPath;

module.exports = {
    disableHostCheck: true,
    compress: false,
    hot: true,
    watchOptions: {
        ignored: /node_modules/
    },
    contentBase: distPath,
    index: distPath
};